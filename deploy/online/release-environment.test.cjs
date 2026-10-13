'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os'), crypto = require('node:crypto');
const { DEFAULTS, ORDER, sha, safeRelative, validatePlan, validateManifest, assertSafeOverlayDestination, sequentialRelease } = require('./release-environment.cjs');
test('large-file SHA256 uses at most a 1 MiB read buffer and never reads the whole file', t => {
  const filename = path.join(os.tmpdir(), 'shiyu-release-sha-' + crypto.randomUUID() + '.bin');
  const chunk = Buffer.alloc(1024 * 1024, 0xa5), expected = crypto.createHash('sha256'), writer = fs.openSync(filename, 'wx');
  t.after(() => fs.unlinkSync(filename));
  try {
    for (let i = 0; i < 32; i++) { chunk[0] = i; fs.writeSync(writer, chunk); expected.update(chunk); }
    const tail = Buffer.from('partial-final-block'); fs.writeSync(writer, tail); expected.update(tail);
  } finally { fs.closeSync(writer); }
  let reads = 0, closes = 0, maximumRead = 0;
  const io = {
    openSync: fs.openSync,
    readSync(fd, buffer, offset, length, position) { reads++; maximumRead = Math.max(maximumRead, length); assert(buffer.length <= 1024 * 1024); return fs.readSync(fd, buffer, offset, length, position); },
    closeSync(fd) { closes++; fs.closeSync(fd); },
    readFileSync() { throw Error('Whole-file reads are forbidden for package hashing'); },
  };
  assert.equal(sha(filename, io), expected.digest('hex')); assert.equal(maximumRead, 1024 * 1024); assert(reads >= 34); assert.equal(closes, 1);
});
test('streaming SHA256 closes the file even when a read fails', () => {
  const closed = [], error = Error('fixture read failure');
  assert.throws(() => sha('/fixture/archive.tgz', { openSync: () => 42, readSync() { throw error; }, closeSync: fd => closed.push(fd) }), candidate => candidate === error);
  assert.deepEqual(closed, [42]);
});
function plan(id = '20261013053257') {
  return {
    id, environment: 'production', businessDataMigration: false,
    modules: Object.fromEntries(ORDER.map(name => [name, { service: DEFAULTS[name].service, old: DEFAULTS[name].root + '/releases/20261001000000', next: DEFAULTS[name].root + '/releases/' + id + (name === 'website' ? '' : '-environment-isolation'), version: name === 'website' ? 'V1.4.1' : name === 'admin' ? 'V1.4.2' : null, commit: 'a'.repeat(40), overlay: name + '.tgz', overlaySha256: 'b'.repeat(64), manifest: name + '.json', manifestSha256: 'c'.repeat(64) }])),
    records: { website: { id: 'website-record-id', target: 'website', version: 'V1.4.1', previousVersion: 'V1.4.0', changeType: 'fix', summary: '环境隔离与工具模块小补丁' }, admin: { id: 'admin-record-id', target: 'admin', version: 'V1.4.2', previousVersion: 'V1.4.1', changeType: 'fix', summary: '统一请求来源校验' } },
  };
}
test('plan identity and release paths are explicit and reusable across release IDs', () => {
  assert.equal(validatePlan(plan()).id, '20261013053257'); assert.equal(validatePlan(plan('20261014000000')).id, '20261014000000');
  for (const change of [p => p.modules.website.service = 'nginx', p => p.modules.admin.old = '/opt/shiyu-admin/shared', p => p.modules.admin.next = '/tmp/admin', p => p.modules.tools.version = 'V1.0.0', p => p.businessDataMigration = true, p => p.records.website.version = p.modules.website.version = 'V1.5.0']) {
    const p = plan(); change(p); assert.throws(() => validatePlan(p));
  }
});
test('payload forbids private stores, path traversal, duplicate members and tool scope expansion', () => {
  for (const p of ['../current', '/opt/secret', '.local/shiyu-users.json', 'a/../b', 'node_modules/a', 'mocks/data.json', 'platform-creators.json', '.env.production', 'payments/config.json']) assert.equal(safeRelative(p), false, p);
  assert.equal(safeRelative('dist/environment-policy-data.js'), true);
  const rows = [{ path: 'dist/library-source.js', sha256: 'a'.repeat(64), beforeSha256: 'b'.repeat(64) }, { path: 'server/generation-server.mjs', sha256: 'c'.repeat(64), beforeSha256: 'd'.repeat(64) }];
  validateManifest('tools', { files: rows });
  assert.throws(() => validateManifest('tools', { files: [...rows, { path: 'server/model-config.mjs', sha256: 'e'.repeat(64) }] }));
  assert.throws(() => validateManifest('website', { files: [rows[0], rows[0]] }));
});
test('publishes and verifies one service at a time in compatibility order', async () => {
  const events = [];
  await sequentialRelease(ORDER, async name => { events.push('switch:' + name); await Promise.resolve(); events.push('verified:' + name); }, async name => events.push('rollback:' + name), async () => events.push('final'));
  assert.deepEqual(events, ['switch:website', 'verified:website', 'switch:admin', 'verified:admin', 'switch:tools', 'verified:tools', 'final']);
});
test('an inherited symlink cannot make an overlay overwrite shared or old files', () => {
  const io = { existsSync: () => true, realpathSync: p => p, lstatSync: p => ({ isSymbolicLink: () => p.endsWith('/dist') }) };
  assert.throws(() => assertSafeOverlayDestination('/fixture/prepared', 'dist/index.html', io), /symlink/);
  io.lstatSync = () => ({ isSymbolicLink: () => false }); assertSafeOverlayDestination('/fixture/prepared', 'dist/index.html', io);
});
test('a failed admin health check restores admin before restoring website and never touches tools', async () => {
  const events = [];
  await assert.rejects(sequentialRelease(ORDER, async name => { events.push('publish:' + name); if (name === 'admin') throw Error('health failed'); }, async name => events.push('rollback:' + name)), /health failed/);
  assert.deepEqual(events, ['publish:website', 'publish:admin', 'rollback:admin', 'rollback:website']);
});
test('final checks still trigger full reverse rollback and one recovery failure does not skip remaining services', async () => {
  const events = []; let failure;
  try { await sequentialRelease(ORDER, async () => {}, async name => { events.push(name); if (name === 'tools') throw Error('probe failed'); }, async () => { throw Error('final gate failed'); }); } catch (error) { failure = error; }
  assert.deepEqual(events, ['tools', 'admin', 'website']); assert.deepEqual(failure.recoveryErrors, ['tools: probe failed']);
});
test('release shell keeps bounded rollback and all module locks without restarting unrelated services', () => {
  const shell = fs.readFileSync(path.join(__dirname, 'release-environment.sh'), 'utf8');
  assert.match(shell, /--kill-after=240s 720s/); assert.match(shell, /flock -w 5 6/); assert.match(shell, /\$base\/release-environment\.cjs.*\$plan/);
  const engine = fs.readFileSync(path.join(__dirname, 'release-environment.cjs'), 'utf8');
  assert.match(engine, /deadline = Date\.now\(\) \+ 210000/); assert.match(engine, /sha\(HISTORY\), before\.historySha256/);
  assert.match(engine, /state\.items\.push\(\.\.\.records\); atomic\(HISTORY/); assert.match(engine, /finally \{/);
  assert(!/systemctl.*\['(?:restart|start|stop)', '(?:nginx|shiyu-time|shiyu-space)'/.test(engine));
});
module.exports = { plan };
