'use strict';
// Explicit, sequential website -> admin -> tools release. Never migrates business data.
// Derived from the verified admin-cleanup and front-only release safety patterns.
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process'), http = require('node:http');
const crypto = require('node:crypto'), assert = require('node:assert/strict');
const ORDER = ['website', 'admin', 'tools'];
const DEFAULTS = {
  website: { service: 'shiyu-preview', root: '/opt/shiyu', local: 'http://127.0.0.1:4318/', public: 'https://shiyubox.com/' },
  admin: { service: 'shiyu-admin', root: '/opt/shiyu-admin', local: 'http://127.0.0.1:5175/api/shiyu/themes', public: 'https://admin.shiyubox.com/apps/shiyu/personalization/themes' },
  tools: { service: 'shiyu-tools', root: '/opt/shiyu-tools', local: 'http://127.0.0.1:4180/', public: 'https://tool.shiyubox.com/' },
};
const HISTORY = '/opt/shiyu-admin/shared/.local/shiyu-release-history.json';
const DROPIN = '95-environment-isolation.conf';
const ENV_BYTES = '[Service]\nEnvironment=SHIYU_ENV=production\nEnvironment=NODE_ENV=production\n';
const shaBytes = b => crypto.createHash('sha256').update(b).digest('hex');
function sha(p, io = fs) {
  const hash = crypto.createHash('sha256'), buffer = Buffer.allocUnsafe(1024 * 1024);
  const fd = io.openSync(p, 'r');
  try {
    let bytes;
    while ((bytes = io.readSync(fd, buffer, 0, buffer.length, null)) !== 0) hash.update(buffer.subarray(0, bytes));
    return hash.digest('hex');
  } finally { io.closeSync(fd); }
}
function requestWithHost(url, { headers, signal, timeout = 8000, maxBytes = 1024 * 1024 }) {
  const target = new URL(url);
  assert(target.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) && !target.username && !target.password, 'Custom Host probes must target loopback HTTP');
  assert(Number.isFinite(timeout) && timeout > 0 && timeout <= 8000);
  assert(Number.isSafeInteger(maxBytes) && maxBytes > 0 && maxBytes <= 4 * 1024 * 1024);
  return new Promise((resolve, reject) => {
    const req = http.request(target, { method: 'GET', headers, signal, timeout }, res => {
      let bytes = 0; const chunks = [];
      const fail = error => { reject(error); res.destroy(); req.destroy(); };
      if (Number(res.headers['content-length']) > maxBytes) { fail(Error('HTTP probe response exceeds byte limit')); return; }
      res.on('data', chunk => {
        bytes += chunk.length;
        if (bytes > maxBytes) { fail(Error('HTTP probe response exceeds byte limit')); return; }
        chunks.push(chunk);
      });
      res.once('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks, bytes).toString('utf8') }));
      res.once('error', reject);
    });
    req.once('error', reject); req.once('timeout', () => req.destroy(Error('HTTP probe timed out'))); req.end();
  });
}
const json = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const fileState = p => fs.existsSync(p) ? { exists: true, sha256: sha(p) } : { exists: false };
const same = (a, b, message) => assert.deepEqual(a, b, message);
const unitPath = service => '/etc/systemd/system/' + service + '.service.d/' + DROPIN;
function safeRelative(p) {
  return typeof p === 'string' && /^[A-Za-z0-9_./-]+$/.test(p) && !p.startsWith('/') && !p.split('/').some(v => ['..', '.', ''].includes(v))
    && !/(^|\/)(?:\.local[^/]*|\.git|node_modules|mocks)(\/|$)/.test(p)
    && !/(^|\/)(?:\.env[^/]*|platform-creators\.json|config\.json|orders\.sqlite(?:-wal|-shm)?|shiyu-users\.json)$/.test(p);
}
function validatePlan(p) {
  assert.match(p.id, /^\d{14}$/); assert.equal(p.environment, 'production'); assert.equal(p.businessDataMigration, false);
  same(Object.keys(p.modules).sort(), [...ORDER].sort());
  for (const name of ORDER) {
    const m = p.modules[name], spec = DEFAULTS[name];
    assert.equal(m.service, spec.service); assert(m.old.startsWith(spec.root + '/releases/') && /^[A-Za-z0-9_-]+$/.test(path.posix.basename(m.old)), 'Invalid previous release path');
    assert.equal(path.posix.dirname(m.old), spec.root + '/releases');
    assert.equal(m.next, spec.root + '/releases/' + p.id + (name === 'website' ? '' : '-environment-isolation'));
    assert.notEqual(m.old, m.next); if (name === 'tools') assert.equal(m.version, null); else assert.match(m.version, /^V\d+\.\d+\.\d+$/);
    assert.match(m.commit, /^[a-f0-9]{40}$/); assert.match(m.overlay, /^[A-Za-z0-9_-]+\.tgz$/); assert.match(m.manifest, /^[A-Za-z0-9_-]+\.json$/);
    assert.match(m.overlaySha256, /^[a-f0-9]{64}$/); assert.match(m.manifestSha256, /^[a-f0-9]{64}$/);
  }
  assert.equal(p.records.website.target, 'website'); assert.equal(p.records.admin.target, 'admin');
  for (const name of ['website', 'admin']) {
    const row = p.records[name]; assert.equal(row.version, p.modules[name].version); assert.match(row.previousVersion, /^V\d+\.\d+\.\d+$/);
    const previous = row.previousVersion.slice(1).split('.').map(Number); previous[2]++; assert.equal(row.version, 'V' + previous.join('.'), 'Only the explicitly confirmed patch increment is supported');
    assert.match(row.id, /^[A-Za-z0-9_-]{8,80}$/); assert(['fix', 'change', 'feature'].includes(row.changeType));
    assert.equal(typeof row.summary, 'string'); assert(row.summary.trim() && row.summary.length <= 500);
  }
  return p;
}
function validateManifest(name, manifest) {
  assert(Array.isArray(manifest.files) && manifest.files.length); assert.equal(new Set(manifest.files.map(r => r.path)).size, manifest.files.length);
  for (const row of manifest.files) { assert(safeRelative(row.path), 'Protected/unsafe payload path: ' + row.path); assert.match(row.sha256, /^[a-f0-9]{64}$/); }
  if (name === 'tools') {
    same(manifest.files.map(r => r.path).sort(), ['dist/library-source.js', 'server/generation-server.mjs']);
    for (const row of manifest.files) assert.match(row.beforeSha256, /^[a-f0-9]{64}$/);
  }
  return manifest;
}
function assertSafeOverlayDestination(root, relative, io = fs) {
  assert(safeRelative(relative)); let target = root;
  for (const part of relative.split('/')) {
    target += '/' + part;
    if (io.existsSync(target)) {
      assert(!io.lstatSync(target).isSymbolicLink(), 'Payload destination is a symlink: ' + relative);
      assert(io.realpathSync(target).startsWith(root + '/'), 'Payload destination escapes prepared release');
    }
  }
}
async function sequentialRelease(steps, publishOne, rollbackOne, finalize = async () => {}) {
  const touched = [];
  try {
    for (const step of steps) { touched.push(step); await publishOne(step); }
    await finalize(); return touched;
  } catch (error) {
    const recoveryErrors = [];
    for (const step of touched.reverse()) try { await rollbackOne(step); } catch (e) { recoveryErrors.push(step + ': ' + e.message); }
    error.recoveryErrors = recoveryErrors; throw error;
  }
}
function makeRuntime(planPath) {
  assert.match(planPath, /^\/opt\/shiyu\/backups\/environment-isolation-\d{14}\/plan\.json$/);
  const initialPlan = validatePlan(json(planPath)), ID = initialPlan.id, BASE = path.posix.dirname(planPath);
  assert.equal(BASE, '/opt/shiyu/backups/environment-isolation-' + ID);
  const SPECS = Object.fromEntries(ORDER.map(name => [name, { ...DEFAULTS[name], ...initialPlan.modules[name] }]));
  let deadline = Date.now() + 660000, recovering = false, interrupted = false;
  const controller = new AbortController();
  for (const signal of ['SIGTERM', 'SIGINT', 'SIGHUP']) process.once(signal, () => { interrupted = true; controller.abort(); });
  function cmd(exe, args, timeout = 20000, extra = {}) {
    assert(!interrupted || recovering, 'Release interrupted'); assert(Date.now() < deadline, 'Release deadline expired');
    return cp.execFileSync(exe, args, { encoding: 'utf8', timeout: Math.min(timeout, Math.max(1, deadline - Date.now())), maxBuffer: 16 * 1024 * 1024, ...extra }).trim();
  }
  const write = (p, value) => fs.writeFileSync(p, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
  function atomic(p, bytes) { const temp = p + '.' + ID + '.tmp'; fs.writeFileSync(temp, bytes, { mode: fs.existsSync(p) ? fs.statSync(p).mode & 0o777 : 0o600, flag: 'wx' }); fs.renameSync(temp, p); }
  function services() {
    return Object.fromEntries(['shiyu-preview', 'shiyu-admin', 'shiyu-tools', 'nginx', 'shiyu-time', 'shiyu-space'].map(name => [name, Object.fromEntries(cmd('systemctl', ['show', name, '-p', 'ActiveState', '-p', 'MainPID', '-p', 'NRestarts', '-p', 'UnitFileState']).split('\n').map(s => { const n = s.indexOf('='); return [s.slice(0, n), s.slice(n + 1)]; }))]));
  }
  function infrastructure(before, touched = []) {
    const state = services();
    for (const name of ['shiyu-preview', 'shiyu-admin', 'shiyu-tools', 'nginx']) {
      assert.equal(state[name].ActiveState, 'active', 'Service inactive: ' + name);
      if (!touched.some(key => SPECS[key].service === name)) assert.equal(state[name].MainPID, before.services[name].MainPID, 'Unrelated PID changed: ' + name);
    }
    for (const name of ['shiyu-time', 'shiyu-space']) {
      assert.equal(state[name].ActiveState, 'inactive'); assert.equal(state[name].MainPID, '0'); assert.equal(state[name].UnitFileState, 'disabled');
    }
    assert.equal(sha('/etc/nginx/sites-available/shiyu-preview'), before.nginxSha256, 'Nginx configuration changed');
    return state;
  }
  function resources() {
    const mem = fs.readFileSync('/proc/meminfo', 'utf8'); const availableKiB = Number(mem.match(/MemAvailable:\s+(\d+)/)[1]);
    const load = Number(fs.readFileSync('/proc/loadavg', 'utf8').split(' ')[0]);
    const disk = cmd('df', ['-Pk', '/opt']).split('\n').at(-1).trim().split(/\s+/), inode = cmd('df', ['-Pi', '/opt']).split('\n').at(-1).trim().split(/\s+/);
    assert(availableKiB >= 768 * 1024, 'MemAvailable below 768 MiB'); assert(load < 4, 'Load too high');
    assert(Number(disk[3]) > 2 * 1024 * 1024, 'Free disk below 2 GiB'); assert(Number(inode[4].replace('%', '')) < 90, 'Inode usage too high');
    return { availableKiB, swapTotalKiB: Number(mem.match(/SwapTotal:\s+(\d+)/)[1]), swapFreeKiB: Number(mem.match(/SwapFree:\s+(\d+)/)[1]), load, freeDiskKiB: Number(disk[3]), inodeUsed: inode[4] };
  }
  function links(root) {
    return Object.fromEntries(['.local', 'mocks', 'node_modules', '.local-feedback'].filter(rel => fs.existsSync(root + '/' + rel)).map(rel => {
      const p = root + '/' + rel;
      if (fs.lstatSync(p).isSymbolicLink()) return [rel, { link: fs.readlinkSync(p), real: fs.realpathSync(p) }];
      assert(rel === 'node_modules', 'Mutable data directory must be shared symlink: ' + p);
      return [rel, { directory: true }];
    }));
  }
  function aliases() {
    assert.equal(fs.readlinkSync('/opt/shiyu-admin/releases/导航站'), '/opt/shiyu/current', 'Admin sibling website alias must follow current');
    assert.equal(fs.realpathSync('/opt/shiyu/releases/聚合管理后台'), fs.realpathSync('/opt/shiyu-admin/current'), 'Website sibling admin alias differs');
  }
  function preservedFiles() {
    const names = ['shiyu-themes.json', 'shiyu-operations.json', 'shiyu-plans.json', 'shiyu-limited-free.json', 'shiyu-music.json', 'shiyu-sms-config.json', 'shiyu-email-config.json', 'shiyu-wechat-config.json'];
    const files = names.map(name => '/opt/shiyu-admin/shared/.local/' + name);
    files.push('/opt/shiyu/shared/.local/payments/config.json');
    return Object.fromEntries(files.map(p => [p, fileState(p)]));
  }
  function verifyPreserved(before) { same(preservedFiles(), before.preservedFiles, 'Production configuration changed concurrently; review, do not overwrite'); }
  function loadPlan() { return validatePlan(json(BASE + '/plan.json')); }
  function payloads(p) {
    return Object.fromEntries(ORDER.map(name => {
      const m = p.modules[name]; assert.equal(sha(BASE + '/' + m.manifest), m.manifestSha256); assert.equal(sha(BASE + '/' + m.overlay), m.overlaySha256);
      const manifest = validateManifest(name, json(BASE + '/' + m.manifest));
      same(cmd('tar', ['-tzf', BASE + '/' + m.overlay]).split('\n').sort(), manifest.files.map(r => r.path).sort(), 'Archive members differ');
      assert(cmd('tar', ['-tvzf', BASE + '/' + m.overlay]).split('\n').every(line => line.startsWith('-')), 'Only regular archive members allowed');
      return [name, manifest];
    }));
  }
  function verifyModule(name, manifest, before) {
    const spec = SPECS[name]; assert.equal(fs.realpathSync(spec.next), spec.next);
    for (const row of manifest.files) assert.equal(sha(spec.next + '/' + row.path), row.sha256, name + ' artifact differs: ' + row.path);
    same(links(spec.next), before.modules[name].links, name + ' shared data/dependency links changed');
    assert.equal(fs.readFileSync(spec.next + '/RELEASE_ID', 'utf8').trim(), ID);
    if (spec.version) assert.equal(fs.readFileSync(spec.next + '/RELEASE_VERSION', 'utf8').trim(), spec.version);
    else same(fileState(spec.next + '/RELEASE_VERSION'), before.modules[name].versionFile, 'Tools numeric version must be preserved');
    if (name === 'admin') assert.equal(sha(spec.next + '/platform-creators.json'), before.modules[name].creatorsSha256, 'Creator data differs');
  }
  function verifyRuntimeGate() {
    const admin = SPECS.admin.next, website = SPECS.website.next;
    const m = json(admin + '/production-runtime-manifest.json'); assert.equal(m.releaseId, ID); assert.equal(m.version, SPECS.admin.version);
    cmd('/opt/node-v22/bin/node', [admin + '/verify-release-gate.mjs'], 30000, { env: { ...process.env, SHIYU_ENV: 'production', NODE_ENV: 'production', SHIYU_ADMIN_RUNTIME_ARTIFACT_DIR: admin, SHIYU_ADMIN_SCHEMA_BUILD_DIR: admin, SHIYU_WEBSITE_RUNTIME_DIR: website } });
    assert.equal(m.appCommit, loadPlan().modules.admin.commit);
  }
  function assertUnits(before, changed) {
    for (const name of ORDER) {
      const service = SPECS[name].service;
      const expected = changed.includes(name) && name !== 'tools' ? before.modules[name].desiredUnitSha256 : before.modules[name].unitSha256;
      assert.equal(shaBytes(cmd('systemctl', ['cat', service]) + '\n'), expected, 'Service unit changed: ' + service);
    }
  }
  function setEnvironment(name, before, restore = false) {
    if (name === 'tools') return;
    const target = unitPath(SPECS[name].service), prior = before.modules[name].dropin;
    const desired = { exists: true, sha256: shaBytes(ENV_BYTES) };
    if (restore && JSON.stringify(fileState(target)) === JSON.stringify(prior)) return;
    same(fileState(target), restore ? desired : prior, 'Concurrent service environment change');
    if (restore && !prior.exists) fs.unlinkSync(target);
    else { fs.mkdirSync(path.dirname(target), { recursive: true }); atomic(target, restore ? fs.readFileSync(BASE + '/unit-' + name + '.bak') : ENV_BYTES); }
    cmd('systemctl', ['daemon-reload'], 15000);
  }
  function switchTo(name, from, to) {
    const spec = SPECS[name]; assert([spec.old, spec.next].includes(to)); assert.equal(fs.realpathSync(spec.root + '/current'), from, 'Concurrent pointer change');
    const temp = spec.root + '/.current-' + ID; assert(!fs.existsSync(temp)); fs.symlinkSync(to, temp); fs.renameSync(temp, spec.root + '/current');
  }
  function pendingJobs() {
    for (const name of ['generation-jobs', 'cutout-jobs']) {
      const dir = SPECS.tools.old + '/.local/' + name; if (!fs.existsSync(dir)) continue;
      for (const entry of fs.readdirSync(dir)) {
        const file = path.join(dir, entry, 'job.json'); if (fs.existsSync(file)) assert(['done', 'failed'].includes(json(file).status), 'Active tool jobs prevent restart');
      }
    }
  }
  async function request(url, expected = 200, headers = {}, until = deadline) {
    assert(!interrupted || recovering); const timeout = Math.min(8000, deadline - Date.now(), until - Date.now()); assert(timeout > 0, 'HTTP deadline expired');
    const signal = recovering ? AbortSignal.timeout(timeout) : AbortSignal.any([AbortSignal.timeout(timeout), controller.signal]);
    if (Object.keys(headers).some(name => name.toLowerCase() === 'host')) {
      const r = await requestWithHost(url, { signal, timeout, headers: { Connection: 'close', ...headers } });
      assert.equal(r.status, expected, url); return r.body;
    }
    const r = await fetch(url, { signal, headers: { Connection: 'close', ...headers }, redirect: 'error' });
    const body = await r.text(); assert.equal(r.status, expected, url); return body;
  }
  async function health(name, before, touched, rollback = false) {
    const spec = SPECS[name], target = rollback ? spec.old : spec.next, readyEnd = Math.min(deadline, Date.now() + 20000);
    let ready = false; while (Date.now() < readyEnd) {
      try { await request(spec.local, 200, name === 'tools' ? { Host: 'tool.shiyubox.com' } : {}, readyEnd); ready = true; break; }
      catch { if (Date.now() < readyEnd) await new Promise(r => setTimeout(r, Math.min(250, readyEnd - Date.now()))); }
    }
    assert(ready, 'Local service did not become ready: ' + name);
    const state = infrastructure(before, touched); assert.equal(fs.realpathSync(spec.root + '/current'), target);
    assert.equal(fs.realpathSync('/proc/' + state[spec.service].MainPID + '/cwd'), target);
    if (!rollback && name !== 'tools') {
      const environment = Object.fromEntries(fs.readFileSync('/proc/' + state[spec.service].MainPID + '/environ', 'utf8').split('\0').filter(Boolean).map(item => { const i = item.indexOf('='); return [item.slice(0, i), item.slice(i + 1)]; }));
      assert.equal(environment.SHIYU_ENV, 'production'); assert.equal(environment.NODE_ENV, 'production');
    }
    await request(spec.public);
    if (name === 'website') {
      for (const url of ['https://space.shiyubox.com/', 'https://world.shiyubox.com/']) await request(url);
      assert.equal(shaBytes(await request('https://shiyubox.com/')), sha(target + '/dist/index.html'), 'Published website HTML differs');
      const session = JSON.parse(await request('https://shiyubox.com/api/shiyu/auth/session')); assert.equal(typeof session, 'object');
    }
    if (name === 'admin') {
      assert.equal(shaBytes(await request('https://admin.shiyubox.com/')), sha(target + '/dist/index.html'), 'Published admin HTML differs');
      const localThemes = JSON.parse(await request(spec.local)), publicThemes = JSON.parse(await request('https://shiyubox.com/api/shiyu/themes'));
      same(localThemes, publicThemes, 'Website/admin theme APIs differ');
      assert(Array.isArray(localThemes.items) && localThemes.items.every(item => !['avatarGirl', 'avatarVideo', 'avatarScrub'].includes(item.id)));
      if (!rollback) {
        const runtime = json(target + '/production-runtime-manifest.json');
        for (const file of runtime.static.filter(file => /\.(?:js|css)$/.test(file.path))) {
          const url = 'https://admin.shiyubox.com/' + file.path.replace(/^dist\//, ''); assert.equal(shaBytes(await request(url)), file.sha256, 'Published admin asset differs');
        }
      }
    }
    if (name === 'tools') {
      const manifest = validateManifest('tools', json(BASE + '/' + loadPlan().modules.tools.manifest));
      for (const row of manifest.files.filter(row => row.path.startsWith('dist/'))) assert.equal(shaBytes(await request(spec.public + row.path.slice(5))), rollback ? row.beforeSha256 : row.sha256, 'Published tool asset differs');
    }
    return state;
  }
  function restart(name, before, envChanged) { assertUnits(before, envChanged); cmd('systemctl', ['restart', SPECS[name].service], 45000); }
  async function preflight() {
    const p = loadPlan(); payloads(p); fs.mkdirSync(BASE, { recursive: true, mode: 0o700 });
    assert(!fs.existsSync(BASE + '/baseline.json'), 'Baseline exists; do not silently overwrite');
    const baseline = { id: ID, capturedAt: new Date().toISOString(), resources: resources(), services: services(), nginxSha256: sha('/etc/nginx/sites-available/shiyu-preview'), preservedFiles: preservedFiles(), historySha256: sha(HISTORY), modules: {} };
    infrastructure(baseline); aliases(); pendingJobs();
    for (const name of ORDER) {
      const spec = SPECS[name]; assert.equal(fs.realpathSync(spec.root + '/current'), spec.old); assert(!fs.existsSync(spec.next), 'Target exists; review before proceeding');
      if (name !== 'tools') assert.equal(fs.readFileSync(spec.old + '/RELEASE_VERSION', 'utf8').trim(), p.records[name].previousVersion, 'Current version differs from approval');
      const unit = cmd('systemctl', ['cat', spec.service]) + '\n', dropin = fileState(unitPath(spec.service));
      if (dropin.exists) fs.copyFileSync(unitPath(spec.service), BASE + '/unit-' + name + '.bak');
      baseline.modules[name] = { links: links(spec.old), unitSha256: shaBytes(unit), dropin, versionFile: fileState(spec.old + '/RELEASE_VERSION'), ...(name === 'admin' ? { creatorsSha256: sha(spec.old + '/platform-creators.json') } : {}) };
      await request(spec.local, 200, name === 'tools' ? { Host: 'tool.shiyubox.com' } : {}); await request(spec.public);
    }
    write(BASE + '/baseline.json', baseline); console.log(JSON.stringify({ status: 'preflight-pass', id: ID, baselineSha256: sha(BASE + '/baseline.json'), resources: baseline.resources }));
  }
  async function prepare() {
    const p = loadPlan(), before = json(BASE + '/baseline.json'), manifests = payloads(p);
    assert.equal(sha(BASE + '/baseline.json'), p.baselineSha256); infrastructure(before); resources(); verifyPreserved(before); aliases(); assertUnits(before, []);
    const packages = {};
    for (const name of ORDER) {
      const spec = SPECS[name]; assert.equal(fs.realpathSync(spec.root + '/current'), spec.old); assert(!fs.existsSync(spec.next));
      if (name === 'tools') for (const row of manifests[name].files) assert.equal(sha(spec.old + '/' + row.path), row.beforeSha256, 'Tools production baseline changed');
      cmd('cp', ['-a', '--reflink=auto', spec.old, spec.next], 90000);
      // Replace admin dist only after verifying it is a real directory inside the prepared release.
      if (name === 'admin') { assert(!fs.lstatSync(spec.next + '/dist').isSymbolicLink()); assert(fs.realpathSync(spec.next + '/dist').startsWith(spec.next + '/')); fs.rmSync(spec.next + '/dist', { recursive: true }); }
      for (const row of manifests[name].files) assertSafeOverlayDestination(spec.next, row.path);
      cmd('tar', ['-xzf', BASE + '/' + p.modules[name].overlay, '-C', spec.next], 90000);
      for (const [key, value] of Object.entries({ RELEASE_ID: ID, RELEASE_COMMIT: p.modules[name].commit, PREVIOUS_RELEASE: path.basename(spec.old), ...(spec.version ? { RELEASE_VERSION: spec.version } : {}) })) write(spec.next + '/' + key, value + '\n');
      verifyModule(name, manifests[name], before);
      const file = BASE + '/' + name + '-' + ID + '-complete.tgz';
      // Back up code/runtime, never copy private JSON, credentials or mutable stores to the workstation.
      cmd('tar', ['--exclude=.local', '--exclude=.local-feedback', '--exclude=mocks', '--exclude=.env*', '--exclude=*.pem', '--exclude=*.key', '--exclude=keys', '--exclude=credentials', '--exclude=platform-creators.json', '-czf', file, '-C', spec.next, '.'], 150000);
      packages[name] = { path: file, sha256: sha(file), bytes: fs.statSync(file).size, runtimeLinks: before.modules[name].links, privateDataExcluded: true };
    }
    verifyRuntimeGate();
    // Unit overrides are prepared as text; they are not installed until the owning service step.
    for (const name of ['website', 'admin']) {
      const previousUnit = cmd('systemctl', ['cat', SPECS[name].service]) + '\n';
      assert.equal(shaBytes(previousUnit), before.modules[name].unitSha256);
    }
    const prepared = { id: ID, baselineSha256: sha(BASE + '/baseline.json'), manifests: Object.fromEntries(ORDER.map(name => [name, p.modules[name].manifestSha256])), packages, preparedAt: new Date().toISOString(), gate: 'PASS', unitEnvironmentSha256: shaBytes(ENV_BYTES) };
    write(BASE + '/prepared.json', prepared); console.log(JSON.stringify({ status: 'prepared', ...prepared, preparedSha256: sha(BASE + '/prepared.json') }, null, 2));
  }
  function appendRecords(p) {
    const state = json(HISTORY), original = JSON.stringify(state.items), records = [];
    for (const name of ['website', 'admin']) {
      const requested = p.records[name], last = state.items.filter(item => item.target === requested.target).at(-1);
      assert.equal(last?.version, requested.previousVersion, 'Release history latest version differs');
      assert(!state.items.some(item => item.id === requested.id || item.target === requested.target && item.version === requested.version), 'Duplicate release record');
      records.push({ id: requested.id, target: requested.target, version: requested.version, changeType: requested.changeType, summary: requested.summary, releasedAt: new Date().toISOString(), createdAt: new Date().toISOString(), operator: 'Codex（用户确认）' });
    }
    assert.notEqual(records[0].id, records[1].id); state.items.push(...records); atomic(HISTORY, JSON.stringify(state, null, 2) + '\n');
    assert.equal(JSON.stringify(json(HISTORY).items.slice(0, -2)), original, 'Existing release history changed');
    write(BASE + '/release-records.json', records);
  }
  async function publish() {
    const p = loadPlan(), before = json(BASE + '/baseline.json'), prepared = json(BASE + '/prepared.json'), manifests = payloads(p);
    assert.equal(sha(BASE + '/baseline.json'), p.baselineSha256); assert.equal(sha(BASE + '/prepared.json'), p.preparedSha256);
    assert.equal(p.permanentBackupVerified, true, 'Permanent installation-package backup is required');
    assert.equal(p.permanentRuntimeDependenciesVerified, true, 'Shared runtime dependencies must also have a verified permanent archive');
    same(p.permanentBackupPackages, prepared.packages, 'Permanent backup hashes differ'); assert(!fs.existsSync(BASE + '/published.json'));
    infrastructure(before); resources(); aliases(); verifyPreserved(before); pendingJobs(); assertUnits(before, []); assert.equal(sha(HISTORY), before.historySha256, 'History changed after preparation');
    for (const name of ORDER) { const spec = SPECS[name]; assert.equal(fs.realpathSync(spec.root + '/current'), spec.old); verifyModule(name, manifests[name], before); }
    assert.equal(sha(SPECS.admin.old + '/platform-creators.json'), before.modules.admin.creatorsSha256, 'Creator data changed after preparation'); verifyRuntimeGate();
    // Online data backup remains private on the server; never restore it automatically over newer user writes.
    const backupDir = BASE + '/data-backup'; fs.mkdirSync(backupDir, { mode: 0o700 });
    for (const [label, dir] of [['admin', '/opt/shiyu-admin/shared/.local'], ['website', '/opt/shiyu/shared/.local']]) {
      fs.mkdirSync(backupDir + '/' + label, { mode: 0o700 });
      for (const item of fs.readdirSync(dir, { withFileTypes: true })) if (item.isFile() && item.name.endsWith('.json')) fs.copyFileSync(path.join(dir, item.name), backupDir + '/' + label + '/' + item.name);
    }
    fs.copyFileSync(HISTORY, BASE + '/history-before.json');
    fs.copyFileSync(SPECS.admin.old + '/platform-creators.json', backupDir + '/admin/platform-creators.json');
    // The consistent SQLite backup API includes WAL writes without stopping payment requests.
    const payment = require(SPECS.website.old + '/payments/config.cjs').loadConfig();
    if (fs.existsSync(payment.database)) {
      const { DatabaseSync, backup } = require('node:sqlite');
      const db = new DatabaseSync(payment.database, { readOnly: true });
      try { await backup(db, backupDir + '/orders.sqlite'); } finally { db.close(); }
      const copy = new DatabaseSync(backupDir + '/orders.sqlite', { readOnly: true });
      try { assert.equal(copy.prepare('PRAGMA integrity_check').get().integrity_check, 'ok'); } finally { copy.close(); }
    }
    const changedUnits = [], touched = [], results = {}; let completed;
    try {
      await sequentialRelease(ORDER, async name => {
        const spec = SPECS[name]; resources(); verifyPreserved(before); infrastructure(before, touched); assertUnits(before, changedUnits);
        if (name === 'tools') pendingJobs();
        // Stop only the affected history writer, append both approved records, and
        // restore the old backend before the first website switch. Never undo history.
        if (name === 'website') {
          let historyError;
          try {
            cmd('systemctl', ['stop', 'shiyu-admin'], 45000); assert.equal(services()['shiyu-admin'].MainPID, '0');
            assert.equal(sha(HISTORY), before.historySha256, 'History changed before append');
            appendRecords(p);
          } catch (error) {
            historyError = error; recovering = true; deadline = Date.now() + 210000;
          } finally {
            if (interrupted && !recovering) { recovering = true; deadline = Date.now() + 210000; historyError ||= Error('Interrupted while writing release history'); }
            cmd('systemctl', ['start', 'shiyu-admin'], 45000);
            if (!touched.includes('admin')) touched.push('admin');
            await health('admin', before, touched, true);
          }
          if (historyError) throw historyError;
        }
        if (name !== 'tools') {
          changedUnits.push(name); setEnvironment(name, before);
          before.modules[name].desiredUnitSha256 = shaBytes(cmd('systemctl', ['cat', spec.service]) + '\n');
          // Only the expected new Environment lines may be introduced by this drop-in.
          assert(cmd('systemctl', ['show', spec.service, '-p', 'Environment']).includes('SHIYU_ENV=production'));
        }
        switchTo(name, spec.old, spec.next); if (!touched.includes(name)) touched.push(name);
        restart(name, before, changedUnits); results[name] = await health(name, before, touched); verifyModule(name, manifests[name], before); verifyPreserved(before);
        write(BASE + '/verified-' + name + '.json', { id: ID, name, version: spec.version || SPECS.website.version + ' tool module patch', current: spec.next, commit: p.modules[name].commit, verifiedAt: new Date().toISOString() });
      }, async name => {
        if (!recovering) { recovering = true; deadline = Date.now() + 210000; }
        const spec = SPECS[name], current = fs.realpathSync(spec.root + '/current');
        assert([spec.old, spec.next].includes(current), 'Third-party pointer prevents rollback');
        if (current === spec.next) switchTo(name, spec.next, spec.old);
        if (changedUnits.includes(name)) { setEnvironment(name, before, true); changedUnits.splice(changedUnits.indexOf(name), 1); }
        // The history-append prelude can fail before any version switch. Ensure
        // its old backend is recovered even when website is the only touched step.
        if (name === 'website' && services()['shiyu-admin'].ActiveState !== 'active') {
          assert.equal(fs.realpathSync(SPECS.admin.root + '/current'), SPECS.admin.old);
          assertUnits(before, changedUnits); cmd('systemctl', ['start', 'shiyu-admin'], 45000);
        }
        restart(name, before, changedUnits); await health(name, before, touched, true);
      }, async () => {
        const state = infrastructure(before, ORDER); verifyPreserved(before); aliases(); verifyRuntimeGate();
        const history = json(HISTORY), original = json(BASE + '/history-before.json'); same(history.items.slice(0, -2), original.items); same(history.items.slice(-2).map(item => item.id), ['website', 'admin'].map(name => p.records[name].id));
        const cleanupReview = Object.fromEntries(ORDER.map(name => [name, { current: SPECS[name].next, previous: SPECS[name].old, olderCandidates: fs.readdirSync(SPECS[name].root + '/releases').filter(n => fs.lstatSync(SPECS[name].root + '/releases/' + n).isDirectory() && ![path.basename(SPECS[name].old), path.basename(SPECS[name].next)].includes(n)), policy: 'Review permanent archive and live dependency references before removing any older directory; this script deletes none.' }]));
        completed = { status: 'published-verified', id: ID, versions: { website: SPECS.website.version, admin: SPECS.admin.version, tools: 'website ' + SPECS.website.version + ' tool module patch' }, services: state, packages: prepared.packages, cleanupReview, verifiedAt: new Date().toISOString() };
      });
      write(BASE + '/published.json', completed); fs.appendFileSync('/opt/shiyu/backups/runtime-operations.jsonl', JSON.stringify(completed) + '\n', { mode: 0o600 }); console.log(JSON.stringify(completed, null, 2));
    } catch (error) { write(BASE + '/failure.json', { error: error.message, rollback: error.recoveryErrors?.length ? error.recoveryErrors : recovering ? 'verified' : 'no service touched', at: new Date().toISOString() }); throw error; }
  }
  return { preflight, prepare, publish, write };
}
module.exports = { ORDER, DEFAULTS, sha, requestWithHost, safeRelative, validatePlan, validateManifest, assertSafeOverlayDestination, sequentialRelease };
if (require.main === module) {
  let runtime; const mode = process.argv[2];
  (async () => { assert(['preflight', 'prepare', 'publish'].includes(mode)); runtime = makeRuntime(process.argv[3]); await runtime[mode](); })().catch(error => {
    try { runtime?.write(path.posix.dirname(process.argv[3]) + '/last-error.json', { phase: mode, error: error.message, at: new Date().toISOString() }); } catch {}
    console.error('ENVIRONMENT_RELEASE_FAILED; inspect private server evidence'); process.exitCode = 1;
  });
}
