'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('cancellation revokes every browser session for the user and leaves other users signed in', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'shiyu-cancel-session-'));
  const previous = process.env.SHIYU_THEME_ACCESS_STORE;
  process.env.SHIYU_THEME_ACCESS_STORE = path.join(directory, 'theme-access.json');
  const modulePath = require.resolve('../theme-access/store.cjs');
  delete require.cache[modulePath];
  try {
    const store = require(modulePath);
    const first = store.issueSession('target'), second = store.issueSession('target'), other = store.issueSession('other');
    const request = token => ({ headers: { cookie: 'shiyu_user_session=' + token } });
    assert.equal(store.session(request(first)), 'target');
    store.revokeUserSessions('target');
    assert.equal(store.session(request(first)), null);
    assert.equal(store.session(request(second)), null);
    assert.equal(store.session(request(other)), 'other');
  } finally {
    delete require.cache[modulePath];
    if (previous === undefined) delete process.env.SHIYU_THEME_ACCESS_STORE;
    else process.env.SHIYU_THEME_ACCESS_STORE = previous;
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
