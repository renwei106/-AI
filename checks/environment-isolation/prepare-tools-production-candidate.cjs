'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const privateRoot = path.join(root, '.local/checks/environment-isolation-20261013');
const baseline = path.join(privateRoot, 'tools-production-baseline');
const candidate = path.join(privateRoot, 'tools-production-candidate');
const definitions = [
  { path: 'dist/library-source.js', baseline: 'library-source.js', beforeSha256: 'e754f7ba6abac11f8dc4fe04ea51e6b2103508fb3cf69db756631170ed349b42' },
  { path: 'server/generation-server.mjs', baseline: 'server/generation-server.mjs', beforeSha256: '82a7e7af49499e71e0932c32a5d329e0ebb43e3d9a6660dbae8e468735fcfb13' },
];
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function replaceOnce(source, from, to) {
  if (source.indexOf(from) < 0 || source.indexOf(from) !== source.lastIndexOf(from)) throw Error('Production baseline has an unexpected edit location');
  return source.replace(from, to);
}
function writeSameOrNew(file, bytes) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file)) {
    if (!fs.readFileSync(file).equals(Buffer.from(bytes))) throw Error('Refusing to overwrite a different candidate artifact: ' + path.relative(root, file));
  } else fs.writeFileSync(file, bytes, { flag: 'wx' });
}
const files = [], differences = [];
for (const definition of definitions) {
  const beforeFile = path.join(baseline, definition.baseline), bytes = fs.readFileSync(beforeFile);
  if (hash(bytes) !== definition.beforeSha256) throw Error('Production baseline SHA256 changed: ' + definition.path);
  const source = bytes.toString('utf8'), newline = source.includes('\r\n') ? '\r\n' : '\n';
  let result;
  if (definition.path.startsWith('dist/')) {
    result = replaceOnce(source, '  const candidates=[ ...ADMIN_ENDPOINTS ]', [
      '  const candidates=ADMIN_ENDPOINTS.filter(endpoint=>{',
      '    const target=new URL(endpoint,location.href)',
      "    return target.origin===location.origin || hasLocalAdmin && target.origin==='http://127.0.0.1:5175'",
      '  })',
    ].join(newline));
  } else {
    const guard = "  if(!local||!['127.0.0.1','localhost'].includes(new URL(origin).hostname))return send(res,404,{message:'接口不存在'});";
    result = replaceOnce(source, " if(path==='/__shiyu_shared_login'&&req.method==='GET'){", " if(path==='/__shiyu_shared_login'&&req.method==='GET'){" + newline + guard);
    result = replaceOnce(result, " if(path.startsWith('/__shiyu_auth_proxy/api/shiyu/')||path.startsWith('/api/shiyu/auth/')){", " if(path.startsWith('/__shiyu_auth_proxy/')&&(!local||!['127.0.0.1','localhost'].includes(new URL(origin).hostname)))return send(res,404,{message:'接口不存在'});" + newline + " if(path.startsWith('/__shiyu_auth_proxy/api/shiyu/')||path.startsWith('/api/shiyu/auth/')){");
  }
  const after = Buffer.from(result), afterFile = path.join(candidate, definition.path);
  writeSameOrNew(afterFile, after);
  let diff;
  try { diff = cp.execFileSync('git', ['diff', '--no-index', '--no-prefix', '--', beforeFile, afterFile], { encoding: 'utf8', timeout: 5000, windowsHide: true }); }
  catch (error) { if (error.status !== 1 || !error.stdout) throw error; diff = error.stdout; }
  differences.push(diff.split(/\r?\n/).map(line => line.startsWith('diff --git ') ? `diff --git a/${definition.path} b/${definition.path}` : line.startsWith('--- ') ? `--- a/${definition.path}` : line.startsWith('+++ ') ? `+++ b/${definition.path}` : line).join('\n'));
  files.push({ path: definition.path, beforeSha256: definition.beforeSha256, afterSha256: hash(after), beforeBytes: bytes.length, afterBytes: after.length });
}
const patch = differences.join('');
const patchFile = path.join(__dirname, 'tools-production-environment-isolation.patch');
writeSameOrNew(patchFile, patch);
const manifest = {
  schema: 1, productionRelease: '/opt/shiyu-tools/releases/20261007150631',
  scope: 'same-environment library requests and development-only login routes',
  excludes: ['model configuration', 'secrets', 'whitelist', 'AI dependency migration', 'unrelated local tools changes'],
  files, patch: { path: path.relative(root, patchFile).replaceAll('\\', '/'), sha256: hash(Buffer.from(patch)) },
};
const manifestBytes = JSON.stringify(manifest, null, 2) + '\n';
writeSameOrNew(path.join(__dirname, 'tools-production-candidate-sha256.json'), manifestBytes);
writeSameOrNew(path.join(candidate, 'manifest.json'), manifestBytes);
console.log(JSON.stringify({ candidate: path.relative(root, candidate).replaceAll('\\', '/'), files, patchSha256: manifest.patch.sha256 }));
