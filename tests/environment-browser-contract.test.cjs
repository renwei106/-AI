'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const contract = require('../deploy/environment-contract.json');
const data = fs.readFileSync(path.join(root, 'dist/environment-policy-data.js'), 'utf8');
const resolver = fs.readFileSync(path.join(root, 'dist/environment.js'), 'utf8');
function environment(href) {
  const context = { URL, location: { href } };
  context.window = context;
  vm.runInNewContext(data + '\n' + resolver, context, { timeout: 1000 });
  return context.ShiyuEnvironment.resolve();
}
test('all registered production origins resolve the same formal admin and tool services', () => {
  for (const origin of new Set(Object.values(contract.profiles.production.browserOrigins).flat())) {
    const current = environment(origin + '/');
    assert.equal(current.profile, 'production');
    assert.equal(current.applicationOrigin('admin'), 'https://admin.shiyubox.com');
    assert.equal(current.applicationOrigin('tool'), 'https://tool.shiyubox.com');
    assert.equal(current.allows('tool', 'http://127.0.0.1:4173'), false);
    assert.equal(current.toolReturn('http://localhost:4173/#color'), null);
  }
});
test('registered local pages resolve fixed cross-application ports only', () => {
  for (const hostname of ['127.0.0.1', 'localhost']) {
    const current = environment('http://' + hostname + ':4349/');
    assert.equal(current.profile, 'development');
    assert.equal(current.applicationOrigin('admin'), 'http://' + hostname + ':5175');
    assert.equal(current.applicationOrigin('tool'), 'http://' + hostname + ':4173');
    assert.equal(current.allows('tool', 'http://' + hostname + ':4173/#color'), true);
    assert.equal(current.allows('tool', 'http://' + hostname + ':4349'), false);
    assert.equal(current.toolReturn('https://tool.shiyubox.com/#color'), null);
  }
});
test('unknown hosts, wrong protocols, credentials, sibling domains and invalid returns fail closed', () => {
  for (const url of ['https://preview.shiyubox.com/', 'https://localhost:4318/', 'http://127.0.0.1:45091/', 'http://localhost:45091/', 'http://127.0.0.1:4180/', 'http://shiyubox.com/', 'https://shiyubox.com:444/', 'file:///index.html', 'https://user@shiyubox.com/']) assert.equal(environment(url), null, url);
  const current = environment('https://shiyubox.com/');
  for (const url of ['https://evil.shiyubox.com/', 'https://tool.shiyubox.com.evil.test/', 'http://tool.shiyubox.com/', 'https://user@tool.shiyubox.com/', 'https://admin.shiyubox.com/', 'javascript:alert(1)']) assert.equal(current.toolReturn(url), null, url);
  assert.equal(current.toolReturn('https://tool.shiyubox.com/#color'), 'https://tool.shiyubox.com/#color');
});
test('actual homepage loads shared policy before all three bridge consumers', () => {
  const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
  const policyIndex = html.indexOf('src="environment-policy-data.js"');
  const resolverIndex = html.indexOf('src="environment.js"');
  assert(policyIndex >= 0 && policyIndex < resolverIndex);
  for (const name of ['tool-auth-bridge.js', 'account-surfaces.js', 'world.js']) assert(resolverIndex < html.indexOf('src="' + name + '"'));
  const preview = fs.readFileSync(path.join(root, 'preview.cjs'), 'utf8');
  assert(preview.includes("'/environment-policy-data.js':'environment-policy-data.js'"));
  assert(preview.includes("'/environment.js':'environment.js'"));
});
