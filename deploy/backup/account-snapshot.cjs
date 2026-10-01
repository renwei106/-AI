'use strict';
// Offline maintenance utility. Never imported by the website or its write path.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const MAGIC = Buffer.from('SHIYU-ACCOUNT-BACKUP-V1\n');
const LIMIT = 256 * 1024 * 1024;
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const object = value => value && typeof value === 'object' && !Array.isArray(value);
function requireValue(ok, message) { if (!ok) throw Error(message); }
function inside(parent, child) {
  const relative = path.relative(parent, child);
  return !relative || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
}
function boundedRead(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const stat = fs.fstatSync(fd);
    requireValue(stat.isFile() && stat.size <= LIMIT, 'Source must be a regular file within the 256 MiB limit');
    // Read the opened inode: an atomic rename by a writer cannot mix file versions.
    const bytes = Buffer.alloc(stat.size);
    let offset = 0;
    while (offset < bytes.length) {
      const count = fs.readSync(fd, bytes, offset, bytes.length - offset, offset);
      requireValue(count > 0, 'Source changed during read; retry required');
      offset += count;
    }
    const after = fs.fstatSync(fd);
    requireValue(after.size === stat.size && after.mtimeMs === stat.mtimeMs && after.ctimeMs === stat.ctimeMs, 'Source changed during read; retry required');
    return bytes;
  } finally { fs.closeSync(fd); }
}
function audit(document) {
  requireValue(object(document) && Array.isArray(document.items), 'Expected account store with items array');
  const counts = { users: document.items.length, spaces: 0, scenes: 0, groups: 0, urls: 0, memos: 0, tasks: 0, cards: 0, refs: 0 };
  const warnings = [];
  const coverage = { withAccountData: 0, withMemo: 0, withTodo: 0, withCorner: 0 };
  function rows(list, label) {
    requireValue(Array.isArray(list), label + ' must be an array');
    const ids = new Set();
    for (const row of list) {
      requireValue(object(row) && typeof row.id === 'string' && row.id.length > 0 && !ids.has(row.id), label + ' contains missing or duplicate IDs');
      ids.add(row.id);
    }
    return ids;
  }
  rows(document.items, 'users');
  document.items.forEach((user, userIndex) => {
    const entries = [];
    if (user.accountData !== undefined) {
      coverage.withAccountData++;
      rows(user.accountData, 'spaces');
      const sceneIds = new Set(), groupIds = new Set();
      for (const space of user.accountData) {
        counts.spaces++; rows(space.scenes, 'scenes');
        for (const scene of space.scenes) {
          requireValue(!sceneIds.has(scene.id), 'Duplicate scene ID within account'); sceneIds.add(scene.id);
          counts.scenes++; rows(scene.groups, 'groups');
          for (const group of scene.groups) {
            requireValue(!groupIds.has(group.id), 'Duplicate group ID within account'); groupIds.add(group.id);
            counts.groups++; requireValue(Array.isArray(group.items), 'URL items must be an array');
            for (const item of group.items) {
              requireValue(Array.isArray(item) && typeof item[0] === 'string' && typeof item[1] === 'string', 'Invalid URL item');
              counts.urls++; entries.push({ sid: space.id, cid: scene.id, gid: group.id, url: item[1] });
            }
          }
        }
      }
    }
    if (user.toolData !== undefined) requireValue(object(user.toolData), 'Invalid toolData');
    for (const kind of ['memo', 'todo', 'corner']) {
      const tool = user.toolData?.[kind];
      if (tool === undefined) continue;
      coverage['with' + kind[0].toUpperCase() + kind.slice(1)]++;
      requireValue(object(tool) && Number.isSafeInteger(tool.revision) && tool.revision >= 0 && object(tool.data), 'Invalid tool revision or document');
      const data = tool.data;
      if (kind === 'memo') {
        const ids = rows(data.notes, 'memos'); counts.memos += data.notes.length;
        if (data.cardOrder !== undefined) {
          requireValue(Array.isArray(data.cardOrder), 'Invalid memo cardOrder');
          if (new Set(data.cardOrder).size !== data.cardOrder.length || data.cardOrder.some(id => !ids.has(id))) warnings.push({ userIndex, code: 'MEMO_ORDER_STALE' });
        }
      } else if (kind === 'todo') {
        const tasks = data.calendarV2?.tasks || []; rows(tasks, 'tasks'); counts.tasks += tasks.length;
      } else {
        rows(data.groups, 'cards'); counts.cards += data.groups.length;
        for (const card of data.groups) {
          rows(card.refs, 'card refs'); counts.refs += card.refs.length;
          for (const ref of card.refs) {
            const exact = entries.filter(entry => entry.sid === ref.sid && entry.cid === ref.cid && entry.gid === ref.gid && entry.url === ref.url);
            if (exact.length !== 1) warnings.push({ userIndex, code: exact.length > 1 ? 'REF_AMBIGUOUS' : 'REF_PATH_UNRESOLVED' });
          }
        }
      }
    }
  });
  // Warnings describe existing source relationships; backup never rewrites them.
  return { counts, coverage, warnings };
}
function loadKey(file) {
  const stat = fs.statSync(file);
  requireValue(process.platform === 'win32' || (stat.mode & 0o077) === 0, 'Key permissions must be 0600 or stricter');
  const key = boundedRead(file);
  requireValue(key.length === 32, 'Key file must contain exactly 32 random bytes');
  return key;
}
function syncDirectory(directory) {
  if (process.platform === 'win32') return;
  const fd = fs.openSync(directory, 'r');
  try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
}
function publish(file, bytes) {
  const temp = file + '.' + crypto.randomUUID() + '.partial';
  const fd = fs.openSync(temp, 'wx', 0o600);
  try { fs.writeFileSync(fd, bytes); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  try {
    // Unlike rename, link cannot replace an existing historical snapshot.
    fs.linkSync(temp, file);
    syncDirectory(path.dirname(file));
  } finally { fs.unlinkSync(temp); }
}
function decode(bytes, key) {
  requireValue(bytes.subarray(0, MAGIC.length).equals(MAGIC) && bytes.length > MAGIC.length + 28, 'Invalid backup header');
  const at = MAGIC.length, decipher = crypto.createDecipheriv('aes-256-gcm', key, bytes.subarray(at, at + 12));
  decipher.setAAD(MAGIC); decipher.setAuthTag(bytes.subarray(at + 12, at + 28));
  const plain = Buffer.concat([decipher.update(bytes.subarray(at + 28)), decipher.final()]);
  const pack = JSON.parse(zlib.gunzipSync(plain, { maxOutputLength: LIMIT * 2 }).toString('utf8'));
  requireValue(pack.version === 1 && typeof pack.raw === 'string' && typeof pack.source === 'string' && typeof pack.environment === 'string', 'Unsupported backup schema');
  const raw = Buffer.from(pack.raw, 'base64');
  requireValue(raw.length <= LIMIT && hash(raw) === pack.sha256, 'Backup content hash mismatch');
  const report = audit(JSON.parse(raw.toString('utf8')));
  return { pack, raw, report };
}
function create({ source, vault, keyFile, environment, onStage = () => {} }) {
  requireValue(typeof environment === 'string' && /^[a-z0-9_-]{1,40}$/.test(environment), 'Explicit environment label required');
  onStage('resolve_paths');
  source = fs.realpathSync(source); keyFile = fs.realpathSync(keyFile);
  onStage('read_key'); const key = loadKey(keyFile);
  onStage('read_source'); const raw = boundedRead(source);
  onStage('validate_source');
  const report = audit(JSON.parse(raw.toString('utf8')));
  onStage('prepare_vault');
  fs.mkdirSync(vault, { recursive: true, mode: 0o700 }); vault = fs.realpathSync(vault);
  requireValue(!inside(vault, source) && !inside(vault, keyFile), 'Source and encryption key must be outside the backup vault');
  const createdAt = new Date().toISOString();
  const pack = { version: 1, createdAt, environment, source, sha256: hash(raw), raw: raw.toString('base64') };
  onStage('encrypt');
  const iv = crypto.randomBytes(12), cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(MAGIC);
  const ciphertext = Buffer.concat([cipher.update(zlib.gzipSync(Buffer.from(JSON.stringify(pack)))), cipher.final()]);
  const bytes = Buffer.concat([MAGIC, iv, cipher.getAuthTag(), ciphertext]);
  requireValue(decode(bytes, key).raw.equals(raw), 'Pre-publication roundtrip failed');
  const file = path.join(vault, `${environment}-${createdAt.replace(/[:.]/g, '-')}-${crypto.randomUUID()}.shiyubak`);
  onStage('write_snapshot');
  publish(file, bytes);
  onStage('verify_snapshot');
  requireValue(decode(boundedRead(file), key).raw.equals(raw), 'Disk verification failed');
  return { file, createdAt, environment, sha256: pack.sha256, bytes: bytes.length, ...report, offsiteVerified: false };
}
function verify({ file, keyFile, environment }) {
  requireValue(environment, 'Explicit expected environment required');
  const decoded = decode(boundedRead(file), loadKey(keyFile));
  requireValue(decoded.pack.environment === environment, 'Backup environment does not match expected environment');
  return decoded;
}
function restore({ file, keyFile, environment, target }) {
  // target must be a new directory, never a live store or an existing directory.
  const decoded = verify({ file, keyFile, environment });
  fs.mkdirSync(target, { mode: 0o700 });
  const output = path.join(target, 'shiyu-users.json');
  publish(output, decoded.raw);
  requireValue(hash(boundedRead(output)) === decoded.pack.sha256, 'Restored bytes differ from snapshot');
  return { output, createdAt: decoded.pack.createdAt, environment, sha256: decoded.pack.sha256, ...decoded.report };
}
function main(args) {
  const [command, ...rest] = args, options = {};
  for (let i = 0; i < rest.length; i += 2) {
    requireValue(/^--[a-z-]+$/.test(rest[i]) && rest[i + 1] && !rest[i + 1].startsWith('--'), 'Expected --option value');
    const name = rest[i].slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    requireValue(!Object.hasOwn(options, name), 'Duplicate option'); options[name] = rest[i + 1];
  }
  let result;
  if (command === 'keygen') {
    const fd = fs.openSync(options.keyFile, 'wx', 0o600);
    try { fs.writeFileSync(fd, crypto.randomBytes(32)); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    result = { keyCreated: true };
  } else if (command === 'create') result = create(options);
  else if (command === 'verify') {
    const { pack, report } = verify(options);
    result = { verified: true, createdAt: pack.createdAt, environment: pack.environment, sha256: pack.sha256, ...report };
  } else if (command === 'restore') result = restore(options);
  else throw Error('Commands: keygen, create, verify, restore. See README.md');
  console.log(JSON.stringify(result));
  if (result.warnings?.length) process.exitCode = 2; // snapshot exists, relationships require review
}
module.exports = { audit, create, verify, restore, publish };
if (require.main === module) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(JSON.stringify({ ok: false, error: error.code || 'BACKUP_FAILED', message: 'Backup operation failed; check arguments, key, source structure and destination. Existing snapshots are retained.' })); process.exitCode = 1; }
}
