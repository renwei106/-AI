const { test } = require('node:test');
const assert = require('node:assert/strict');
const { checkShareEntitlements } = require('../share-entitlements.cjs');
const request = { headers: {} };
const session = keys => async () => ({ entitlements: keys.map(key => ({ key, enabled: true })) });

test('ordinary permanent public sharing needs no membership lookup', async () => {
  await checkShareEntitlements(request, { access: 'public', validFor: 0 }, () => { throw Error('must not request'); });
});
test('password and expiry are independent rights, including one-time links', async () => {
  await checkShareEntitlements(request, { access: 'password', validFor: 0 }, session(['share-password']));
  await assert.rejects(checkShareEntitlements(request, { access: 'password', validFor: 3600 }, session(['share-password'])), e => e.status === 403 && e.key === 'share-expiry');
  await assert.rejects(checkShareEntitlements(request, { access: 'public', validFor: 0, once: true }, session([])), e => e.status === 403);
  await checkShareEntitlements(request, { access: 'password', validFor: 3600 }, session(['share-password', 'share-expiry']));
});
test('failed entitlement lookup cannot silently grant restricted sharing', async () => {
  await assert.rejects(checkShareEntitlements(request, { access: 'password' }, () => { throw Error('offline'); }), e => e.status === 503);
});
