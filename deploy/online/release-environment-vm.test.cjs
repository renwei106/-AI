'use strict';
// Execute the actual release engine against an in-memory Linux host. No socket,
// subprocess, /opt path, production account or provider configuration is touched.
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, 'release-environment.cjs'), 'utf8');
const localizedSource = fs.readFileSync(path.join(__dirname, '../../i18n/frontend-server.cjs'), 'utf8');
const localeSettings = { languages: [{ code: 'zh-CN', enabled: true, countries: ['CN'] }], fallback: 'zh-CN' };
const publishedLocale = { settings: localeSettings, dictionaries: { 'zh-CN': { '<fixture>': '假数据' } } };
const digest = b => crypto.createHash('sha256').update(b).digest('hex');
function host(failAt = '') {
  const plan = JSON.parse(fs.readFileSync(path.join(__dirname, 'environment-release-plan.example.json')));
  const id = plan.id, base = '/opt/shiyu/backups/environment-isolation-' + id, history = '/opt/shiyu-admin/shared/.local/shiyu-release-history.json';
  const files = new Map(), directories = new Set([base]), links = new Map(), events = [], writes = [], normalize = p => String(p).replaceAll('\\', '/');
  const roots = { website: '/opt/shiyu', admin: '/opt/shiyu-admin', tools: '/opt/shiyu-tools' };
  const put = (p, b) => files.set(normalize(p), Buffer.isBuffer(b) ? b : Buffer.from(typeof b === 'string' ? b : JSON.stringify(b)));
  const state = Object.fromEntries(['shiyu-preview', 'shiyu-admin', 'shiyu-tools', 'nginx', 'shiyu-time', 'shiyu-space'].map((n, i) => [n, { ActiveState: i < 4 ? 'active' : 'inactive', MainPID: i < 4 ? String(100 + i) : '0', NRestarts: '0', UnitFileState: i < 4 ? 'enabled' : 'disabled' }]));
  const pidServices = new Map(Object.entries(state).filter(([, s]) => s.MainPID !== '0').map(([n, s]) => [s.MainPID, n])); let nextPid = 200;
  const originalUnit = name => '[Service]\nExecStart=/fixture/' + name + '\n';
  const unitPath = name => '/etc/systemd/system/' + name + '.service.d/95-environment-isolation.conf';
  const unit = name => originalUnit(name) + (files.has(unitPath(name)) ? files.get(unitPath(name)).toString() : '');
  const current = name => links.get(roots[name] + '/current');
  function real(p) {
    p = normalize(p);
    const match = p.match(/^\/proc\/(\d+)\/cwd$/);
    if (match) return current(Object.keys(plan.modules).find(n => plan.modules[n].service === pidServices.get(match[1])));
    for (let n = 0; n < 8; n++) {
      const prefix = [...links.keys()].sort((a, b) => b.length - a.length).find(key => p === key || p.startsWith(key + '/'));
      if (!prefix) return p; p = links.get(prefix) + p.slice(prefix.length);
    }
    throw Error('fixture symlink loop');
  }
  const get = p => { p = real(p); assert(files.has(p), 'Missing fixture file: ' + p); return files.get(p); };
  const exists = p => { p = normalize(p); return files.has(real(p)) || directories.has(real(p)) || links.has(p); };
  const stat = p => ({ mode: 0o600, size: files.get(real(p))?.length || 0, isSymbolicLink: () => links.has(normalize(p)), isDirectory: () => directories.has(real(p)), isFile: () => files.has(real(p)) });
  function write(p, b, options = {}) {
    p = normalize(p); assert(p.startsWith(base + '/') || p.startsWith('/etc/systemd/system/') || p === history || p.startsWith(history + '.') || p === '/opt/shiyu/backups/runtime-operations.jsonl', 'Unapproved fixture write: ' + p);
    if (options.flag === 'wx') assert(!exists(p)); put(p, b); writes.push(p);
  }
  const descriptors = new Map(); let nextDescriptor = 1;
  const fakeFs = {
    openSync(p, mode) { assert.equal(mode, 'r'); const fd = nextDescriptor++; descriptors.set(fd, { bytes: get(p), cursor: 0 }); return fd; },
    readSync(fd, buffer, offset, length, position) {
      const file = descriptors.get(fd); assert(file); const cursor = position === null ? file.cursor : position;
      const size = Math.min(length, file.bytes.length - cursor); file.bytes.copy(buffer, offset, cursor, cursor + size); if (position === null) file.cursor += size; return size;
    },
    closeSync(fd) { assert(descriptors.delete(fd)); },
    readFileSync(p, encoding) { const b = get(p); return encoding ? b.toString() : b; }, writeFileSync: write,
    existsSync: exists, statSync: stat, lstatSync: stat, realpathSync: real,
    readlinkSync(p) { assert(links.has(normalize(p))); return links.get(normalize(p)); },
    symlinkSync(target, p) { links.set(normalize(p), normalize(target)); },
    renameSync(from, to) { from = normalize(from); to = normalize(to); if (links.has(from)) { links.set(to, links.get(from)); links.delete(from); } else { files.set(to, get(from)); files.delete(from); writes.push(to); } },
    unlinkSync(p) { files.delete(normalize(p)); }, mkdirSync(p) { directories.add(normalize(p)); },
    copyFileSync(from, to) { write(to, get(from)); }, appendFileSync(p, b) { write(p, Buffer.concat([files.get(normalize(p)) || Buffer.alloc(0), Buffer.from(b)])); },
    readdirSync(p, options) {
      p = real(p); const names = [...new Set([...files.keys(), ...directories, ...links.keys()].filter(n => n.startsWith(p + '/') && !n.slice(p.length + 1).includes('/')).map(n => n.slice(p.length + 1)))];
      return options?.withFileTypes ? names.map(name => ({ name, ...stat(p + '/' + name) })) : names;
    }, rmSync() { throw Error('No data deletion is allowed during publish'); },
  };
  for (const name of Object.keys(plan.modules)) {
    const m = plan.modules[name]; m.commit = name === 'admin' ? 'a'.repeat(40) : 'b'.repeat(40);
    directories.add(roots[name] + '/releases'); directories.add(m.old); directories.add(m.next); links.set(roots[name] + '/current', m.old);
    const shared = name === 'tools' ? roots[name] + '/shared/local' : roots[name] + '/shared/.local'; directories.add(shared);
    for (const root of [m.old, m.next]) { links.set(root + '/.local', shared); put(root + '/RELEASE_ID', root === m.next ? id : '20261001000000'); if (name !== 'tools') put(root + '/RELEASE_VERSION', root === m.next ? m.version : plan.records[name].previousVersion); }
    const rows = name === 'tools' ? ['dist/library-source.js', 'server/generation-server.mjs'] : name === 'website' ? ['dist/index.html', 'dist/account-surfaces.js', 'dist/environment-policy-data.js', 'dist/environment.js', 'dist/tool-auth-bridge.js', 'dist/world.js', 'preview.cjs', 'shiyu-user-proxy.cjs'] : ['dist/index.html'];
    for (const rel of rows) { put(m.old + '/' + rel, name + ':' + rel + ':old'); put(m.next + '/' + rel, name + ':' + rel + ':new'); }
    if (name === 'website') for (const [root, marker] of [[m.old, 'old'], [m.next, 'new']]) {
      put(root + '/dist/index.html', '<!doctype html><html lang="zh-CN"><head><title>' + marker + '</title></head><body>fixture website</body></html>');
      put(root + '/i18n/runtime.js', 'window.fixtureLocaleRuntime=true;');
    }
    if (name === 'admin') {
      const runtime = { releaseId: id, version: m.version, appCommit: m.commit, static: [] }; put(m.next + '/production-runtime-manifest.json', runtime); rows.push('production-runtime-manifest.json');
      for (const root of [m.old, m.next]) put(root + '/platform-creators.json', '{}');
    }
    const manifest = { files: rows.map(rel => ({ path: rel, sha256: digest(get(m.next + '/' + rel)), ...(name === 'tools' ? { beforeSha256: digest(get(m.old + '/' + rel)) } : {}) })) };
    put(base + '/' + m.manifest, manifest); m.manifestSha256 = digest(get(base + '/' + m.manifest)); put(base + '/' + m.overlay, 'fake archive:' + name); m.overlaySha256 = digest(get(base + '/' + m.overlay));
  }
  links.set('/opt/shiyu-admin/releases/导航站', '/opt/shiyu/current'); links.set('/opt/shiyu/releases/聚合管理后台', '/opt/shiyu-admin/current');
  put(history, { items: ['website', 'admin'].map(name => ({ id: 'old-' + name, target: name, version: plan.records[name].previousVersion })) });
  put('/etc/nginx/sites-available/shiyu-preview', 'unchanged nginx'); put('/proc/meminfo', 'MemAvailable: 2097152 kB\nSwapTotal: 2097152 kB\nSwapFree: 2097152 kB\n'); put('/proc/loadavg', '0.2 0.2 0.2');
  const preservedFiles = Object.fromEntries(['shiyu-themes.json', 'shiyu-operations.json', 'shiyu-plans.json', 'shiyu-limited-free.json', 'shiyu-music.json', 'shiyu-sms-config.json', 'shiyu-email-config.json', 'shiyu-wechat-config.json'].map(name => ['/opt/shiyu-admin/shared/.local/' + name, { exists: false }]));
  preservedFiles['/opt/shiyu/shared/.local/payments/config.json'] = { exists: false };
  const baseline = { services: structuredClone(state), preservedFiles, historySha256: digest(get(history)), nginxSha256: digest(get('/etc/nginx/sites-available/shiyu-preview')), modules: Object.fromEntries(Object.keys(plan.modules).map(name => [name, { links: { '.local': { link: links.get(plan.modules[name].old + '/.local'), real: real(plan.modules[name].old + '/.local') } }, unitSha256: digest(originalUnit(plan.modules[name].service).trim() + '\n'), dropin: { exists: false }, versionFile: name === 'tools' ? { exists: false } : { exists: true, sha256: digest(get(plan.modules[name].old + '/RELEASE_VERSION')) }, ...(name === 'admin' ? { creatorsSha256: digest('{}') } : {}) }])) };
  put(base + '/baseline.json', baseline); plan.baselineSha256 = digest(get(base + '/baseline.json'));
  const prepared = { packages: {} }; put(base + '/prepared.json', prepared); plan.preparedSha256 = digest(get(base + '/prepared.json')); plan.permanentBackupVerified = true; plan.permanentRuntimeDependenciesVerified = true; plan.permanentBackupPackages = {}; put(base + '/plan.json', plan);
  function execFileSync(exe, args, options) {
    if (exe === 'df') return 'Filesystem Blocks Used Available Capacity Mounted\n/dev/fake 99999999 1 9999999 1% /opt\n';
    if (exe === 'tar') {
      const filename = args[1], name = Object.keys(plan.modules).find(n => filename.endsWith('/' + plan.modules[n].overlay));
      const rows = JSON.parse(get(base + '/' + plan.modules[name].manifest)).files;
      return rows.map(row => args[0] === '-tzf' ? row.path : '-rw------- root root ' + row.path).join('\n') + '\n';
    }
    if (exe === '/opt/node-v22/bin/node') { events.push('gate:' + options.env.SHIYU_WEBSITE_RUNTIME_DIR); return 'PASS\n'; }
    assert.equal(exe, 'systemctl'); const [action, name] = args;
    if (action === 'daemon-reload') { events.push(action); return ''; }
    if (action === 'cat') return unit(name);
    if (action === 'show') {
      if (args.includes('Environment')) return 'Environment=SHIYU_ENV=production NODE_ENV=production\n';
      return Object.entries(state[name]).map(([k, v]) => k + '=' + v).join('\n') + '\n';
    }
    assert(['start', 'stop', 'restart'].includes(action)); assert(!['nginx', 'shiyu-time', 'shiyu-space'].includes(name)); events.push(action + ':' + name);
    if (action === 'stop') { state[name].ActiveState = 'inactive'; state[name].MainPID = '0'; }
    else { state[name].ActiveState = 'active'; state[name].MainPID = String(nextPid++); pidServices.set(state[name].MainPID, name); put('/proc/' + state[name].MainPID + '/environ', 'SHIYU_ENV=production\0NODE_ENV=production\0'); }
    return '';
  }
  let failed = false;
  async function renderLocalized() {
    const module = { exports: {} }, root = current('website');
    const localContext = { module, require: name => name === 'node:fs' ? fakeFs : name === './service.cjs' ? require('../../i18n/service.cjs') : require(name), __dirname: root + '/i18n', process: { env: {} }, URL, AbortSignal, fetch: async () => ({ ok: true, json: async () => publishedLocale }) };
    vm.runInNewContext(localizedSource, localContext); let body;
    await module.exports.localized({ url: '/', headers: { host: 'shiyubox.com', cookie: 'shiyu-language=zh-CN' }, socket: { remoteAddress: '127.0.0.1' } }, { writeHead(status) { assert.equal(status, 200); }, end(value) { body = value; } }, 'index.html', root + '/dist');
    return body;
  }
  async function fetch(url) {
    const u = new URL(url); let body = '{}'; events.push('GET:' + u.href);
    if (u.pathname === '/api/shiyu/themes') body = JSON.stringify({ items: [{ id: 'base' }] });
    else if (u.pathname === '/api/shiyu/auth/session') body = '{"user":null}';
    else if (u.pathname === '/api/shiyu/i18n/public') body = JSON.stringify(publishedLocale);
    else if (u.hostname === 'admin.shiyubox.com') body = get(current('admin') + '/dist/index.html').toString();
    else if (u.hostname === 'tool.shiyubox.com' && u.pathname === '/library-source.js') body = get(current('tools') + '/dist/library-source.js').toString();
    else if ((u.hostname === 'shiyubox.com' || u.port === '4318') && u.pathname === '/') body = await renderLocalized();
    else if (u.hostname === 'shiyubox.com' && u.pathname.endsWith('.js')) body = get(current('website') + '/dist' + u.pathname).toString();
    const shouldFail = !failed && failAt === 'admin-health' && current('admin') === plan.modules.admin.next && u.hostname === 'admin.shiyubox.com';
    if (shouldFail) failed = true;
    if (!failed && failAt === 'website-asset' && current('website') === plan.modules.website.next && u.hostname === 'shiyubox.com' && u.pathname.endsWith('.js')) { body += ':corrupted'; failed = true; }
    return { status: shouldFail ? 500 : 200, text: async () => body };
  }
  const { EventEmitter } = require('node:events');
  const fakeHttp = { request(url, options, callback) {
    assert.equal(url.hostname, '127.0.0.1'); assert.equal(options.headers.Host, 'tool.shiyubox.com');
    assert(options.signal && options.timeout <= 8000);
    const req = new EventEmitter(); req.destroy = () => {};
    req.end = () => Promise.resolve().then(async () => {
      const r = await fetch(url.href), body = Buffer.from(await r.text()), res = new EventEmitter();
      res.statusCode = r.status; res.headers = { 'content-length': String(body.length) }; res.destroy = () => {};
      callback(res); res.emit('data', body); res.emit('end');
    });
    return req;
  } };
  const fakeRequire = name => name === 'node:fs' ? fakeFs : name === 'node:http' ? fakeHttp : name === 'node:child_process' ? { execFileSync } : name.endsWith('/payments/config.cjs') ? { loadConfig: () => ({ database: '/fixture/nonexistent-orders.sqlite' }) } : require(name);
  fakeRequire.main = {};
  function loadRuntime(legacyHtmlCheck = false) {
    const module = { exports: {} }, context = { require: fakeRequire, module, process: { env: {}, once() {} }, Buffer, console: { log() {}, error() {} }, AbortController, AbortSignal, URL, setTimeout, clearTimeout, Date, fetch };
    const engine = legacyHtmlCheck ? source.replace("assertWebsiteHtml(rendered, fs.readFileSync(target + '/dist/index.html', 'utf8'), fs.readFileSync(target + '/i18n/runtime.js', 'utf8'), localeState);", "assert.equal(shaBytes(rendered), sha(target + '/dist/index.html'), 'Published website HTML differs');") : source;
    vm.runInNewContext(engine + '\nmodule.exports.fixtureRuntime = makeRuntime;', context, { filename: 'release-environment.cjs', timeout: 1000 });
    return module.exports.fixtureRuntime(base + '/plan.json');
  }
  function configureResume() {
    plan.resume = { tag: 'resume-1', expectedOriginalHistoryCount: JSON.parse(get(base + '/history-before.json')).items.length, failureSha256: digest(get(base + '/failure.json')), releaseRecordsSha256: digest(get(base + '/release-records.json')) };
    put(base + '/plan.json', plan);
  }
  function pinResume() { plan.resume.baselineSha256 = digest(get(base + '/resume-baseline-' + plan.resume.tag + '.json')); put(base + '/plan.json', plan); }
  return { runtime: loadRuntime(), loadRuntime, configureResume, pinResume, renderLocalized, current, plan, events, writes, put, get, mutateService: (name, value) => Object.assign(state[name], value), historyPath: history, base, history: () => JSON.parse(get(history)), published: tag => JSON.parse(get(base + '/published' + (tag ? '-' + tag : '') + '.json')), failures: () => JSON.parse(get(base + '/failure.json')) };
}
test('actual engine publishes scoped modules sequentially and leaves data, paused services and old records intact', async () => {
  const h = host(); await h.runtime.publish();
  assert.deepEqual(h.events.filter(e => e.startsWith('restart:')), ['restart:shiyu-preview', 'restart:shiyu-admin', 'restart:shiyu-tools']);
  for (const name of Object.keys(h.plan.modules)) assert.equal(h.current(name), h.plan.modules[name].next);
  assert.equal(h.history().items.length, 4); assert.equal(h.history().items[0].id, 'old-website'); assert.equal(h.published().status, 'published-verified');
  assert(!h.writes.some(p => /\.local\/(?!shiyu-release-history\.json)/.test(p) && !p.includes('/data-backup/')));
  for (const asset of ['account-surfaces.js', 'environment-policy-data.js', 'environment.js', 'tool-auth-bridge.js', 'world.js']) assert(h.events.includes('GET:https://shiyubox.com/' + asset));
  assert(!h.events.some(e => /GET:.*(?:preview|shiyu-user-proxy)\.cjs/.test(e)));
});
test('real localized HTML accepts existing injection but rejects core, canonical, locale settings and dictionary edits', async () => {
  const { assertWebsiteHtml } = require('./release-environment.cjs'), h = host(), body = await h.renderLocalized();
  const source = h.get(h.plan.modules.website.old + '/dist/index.html').toString(), runtime = h.get(h.plan.modules.website.old + '/i18n/runtime.js').toString();
  assertWebsiteHtml(body, source, runtime, publishedLocale);
  for (const changed of [body.replace('fixture website', 'wrong app'), body.replace('https://shiyubox.com/', 'https://wrong.example/'), body.replace('"fallback":"zh-CN"', '"fallback":"en"'), body.replace('假数据', 'changed dictionary')]) assert.throws(() => assertWebsiteHtml(changed, source, runtime, publishedLocale));
  assert.throws(() => assertWebsiteHtml(body, source, runtime, { settings: { languages: [{ code: 'en', enabled: true }] } }), /requires enabled zh-CN/);
});
test('website asset byte mismatch still rolls back even when every HTTP status is 200', async () => {
  const h = host('website-asset'); await assert.rejects(h.runtime.publish(), /Published website asset differs/);
  for (const name of Object.keys(h.plan.modules)) assert.equal(h.current(name), h.plan.modules[name].old);
  assert(!h.events.includes('restart:shiyu-tools'));
});
test('actual i18n injection false alarm rolls back, then strict resume succeeds without rewriting history or first evidence', async () => {
  const h = host(); await assert.rejects(h.loadRuntime(true).publish(), /Published website HTML differs/);
  for (const name of Object.keys(h.plan.modules)) assert.equal(h.current(name), h.plan.modules[name].old);
  const saved = Object.fromEntries(['baseline.json', 'prepared.json', 'failure.json', 'history-before.json', 'release-records.json'].map(name => [name, digest(h.get(h.base + '/' + name))])), originalHistory = digest(h.get(h.historyPath));
  h.configureResume(); await h.loadRuntime().resumePreflight(); h.pinResume(); const eventStart = h.events.length;
  await h.loadRuntime().resumePublish();
  assert.deepEqual(h.events.slice(eventStart).filter(e => e.startsWith('stop:')), []);
  assert.deepEqual(h.events.slice(eventStart).filter(e => e.startsWith('restart:')), ['restart:shiyu-preview', 'restart:shiyu-admin', 'restart:shiyu-tools']);
  assert.equal(digest(h.get(h.historyPath)), originalHistory); assert.equal(h.history().items.length, 4); assert.equal(h.published('resume-1').status, 'published-verified');
  for (const [name, hash] of Object.entries(saved)) assert.equal(digest(h.get(h.base + '/' + name)), hash, name + ' must remain immutable');
});
test('resume refuses any edited historical or appended field before touching a service', async () => {
  for (const edit of [rows => rows[0].version = 'V9.9.9', rows => rows.at(-1).createdAt = '2026-01-01T00:00:00Z', rows => rows.push({ id: 'unexpected-record' })]) {
    const h = host(); await assert.rejects(h.loadRuntime(true).publish()); h.configureResume(); const changed = h.history(); edit(changed.items); h.put(h.historyPath, changed); const eventStart = h.events.length;
    await assert.rejects(h.loadRuntime().resumePreflight(), /history changed|records changed/);
    assert(!h.events.slice(eventStart).some(e => /^(?:start|stop|restart):/.test(e)));
  }
});
test('resume refuses unrelated service, unit and shared configuration drift before any service operation', async () => {
  for (const edit of [h => h.mutateService('shiyu-tools', { MainPID: '999' }), h => h.mutateService('nginx', { MainPID: '999' }), h => h.put('/etc/systemd/system/shiyu-tools.service.d/95-environment-isolation.conf', '[Service]\nEnvironment=UNEXPECTED=1\n'), h => h.put('/opt/shiyu-admin/shared/.local/shiyu-plans.json', '{}')]) {
    const h = host(); await assert.rejects(h.loadRuntime(true).publish()); h.configureResume(); edit(h); const eventStart = h.events.length;
    await assert.rejects(h.loadRuntime().resumePreflight(), /Unrelated PID changed|Service unit changed|configuration changed concurrently/);
    assert(!h.events.slice(eventStart).some(e => /^(?:start|stop|restart):/.test(e)));
  }
});
test('actual admin HTTPS failure restores backend before website and never restarts tools; appended records remain', async () => {
  const h = host('admin-health'); await assert.rejects(h.runtime.publish());
  assert.deepEqual(h.events.filter(e => e.startsWith('restart:')), ['restart:shiyu-preview', 'restart:shiyu-admin', 'restart:shiyu-admin', 'restart:shiyu-preview']);
  for (const name of Object.keys(h.plan.modules)) assert.equal(h.current(name), h.plan.modules[name].old);
  assert.equal(h.history().items.length, 4); assert.equal(h.failures().rollback, 'verified');
});
