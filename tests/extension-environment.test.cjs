'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const policy = require('../extension-environment.cjs');
const root = path.resolve(__dirname, '..');
test('extension build selection is explicit and conflicts fail before packaging', () => {
  for (const args of [[], ['--profile'], ['--profile=staging'], ['--production', '--profile=development'], ['--profile=production', '--profile=production']]) assert.throws(() => policy.selectProfile(args));
  assert.equal(policy.selectProfile(['--production']), 'production');
  assert.equal(policy.selectProfile(['--profile', 'development']), 'development');
  for (const name of ['build-extension.cjs', 'build-extension-current.cjs', 'build-extension-all.cjs', 'build-firefox-extension.cjs']) {
    const result = cp.spawnSync(process.execPath, [path.join(root, name)], { cwd: root, encoding: 'utf8', timeout: 5000, windowsHide: true });
    assert.equal(result.status, 1, name);
    assert.match(result.stderr, /Select exactly one extension profile/, name);
  }
});
test('development sources and current production download have disjoint API targets and permissions', () => {
  for (const name of ['browser-extension', 'browser-extension-lab']) policy.assertPackageProfile(path.join(root, name), 'development');
  policy.assertPackageProfile(path.join(root, 'dist/extension/current'), 'production');
});
test('profile rendering removes opposite-environment configuration and mixed packages are rejected', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shiyu-extension-profile-'));
  t.after(() => {
    const target = path.resolve(dir);
    assert(target.startsWith(path.resolve(os.tmpdir()) + path.sep + 'shiyu-extension-profile-'));
    fs.rmSync(target, { recursive: true, force: true });
  });
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({ manifest_version: 3, host_permissions: ['https://shiyubox.com/*', 'http://127.0.0.1/*'] }));
  fs.writeFileSync(path.join(dir, 'config.js'), "export const SITE_URLS = ['https://shiyubox.com/', 'http://127.0.0.1:4318/'];\n");
  assert.throws(() => policy.assertPackageProfile(dir, 'production'));
  assert.throws(() => policy.assertPackageProfile(dir, 'development'));
  policy.writePackageProfile(dir, 'production');
  policy.assertPackageProfile(dir, 'production');
  assert.throws(() => policy.assertPackageProfile(dir, 'development'));
  policy.writePackageProfile(dir, 'development');
  policy.assertPackageProfile(dir, 'development');
  assert.throws(() => policy.assertPackageProfile(dir, 'production'));
});
