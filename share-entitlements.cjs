'use strict';

// Ordinary public sharing keeps its existing flow. Restricted share settings use
// the same server-owned entitlement snapshot as the account and theme APIs.
async function checkShareEntitlements(request, settings, fetchSession = async () => {
  const response = await fetch(new URL('/api/shiyu/auth/session', process.env.SHIYU_ADMIN_ORIGIN || 'http://127.0.0.1:5175'), {
    headers: { cookie: request.headers.cookie || '', accept: 'application/json' },
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) throw Error('会员权益暂时无法校验，请稍后重试');
  return response.json();
}) {
  const required = [];
  if (settings.access === 'password') required.push('share-password');
  if (settings.once === true || settings.validFor !== undefined && settings.validFor !== 0) required.push('share-expiry');
  if (!required.length) return;
  let session;
  try { session = await fetchSession(); }
  catch { throw Object.assign(Error('会员权益暂时无法校验，请稍后重试'), { status: 503 }); }
  const rights = session.entitlements || session.user?.membership?.entitlements || session.user?.entitlements || [];
  const denied = required.find(key => !rights.some(item => item.key === key && item.enabled === true));
  if (denied) throw Object.assign(Error(denied === 'share-password' ? '当前权益尚未包含密码分享，请先查看会员权益' : '当前权益尚未包含分享有效期设置，请先查看会员权益'), { status: 403, key: denied });
}

module.exports = { checkShareEntitlements };
