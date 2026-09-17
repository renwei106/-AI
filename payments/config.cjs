'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');

function loadConfig(filename = process.env.SHIYU_PAYMENT_CONFIG || path.join(ROOT, '.local/payments/config.json')) {
  const file = path.resolve(filename);
  const value = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')) : {};
  const base = path.dirname(file);
  const read = (name) => name && fs.existsSync(path.resolve(base, name)) ? fs.readFileSync(path.resolve(base, name), 'utf8').trim() : '';
  const a = value.alipay || {}, w = value.wechat || {};
  let serialNo = w.serialNo || '';
  if (!serialNo && read(w.certificatePath)) serialNo = new crypto.X509Certificate(read(w.certificatePath)).serialNumber;
  const config = {
    file, enabled: value.enabled === true, mode: value.mode || 'integration',
    publicBaseUrl: String(value.publicBaseUrl || '').replace(/\/$/, ''),
    allowedOrigins: value.allowedOrigins || ['http://127.0.0.1:4318', 'http://localhost:4318'],
    catalogUrl: value.catalogUrl || 'http://127.0.0.1:5175/api/shiyu/plans',
    identityUrl: value.identityUrl || '',
    database: path.resolve(base, value.database || 'orders.sqlite'),
    alipay: { ...a, privateKey: read(a.privateKeyPath), publicKey: read(a.publicKeyPath),
      appCertContent: read(a.appCertPath), alipayPublicCertContent: read(a.alipayPublicCertPath), alipayRootCertContent: read(a.alipayRootCertPath) },
    wechat: { ...w, serialNo, privateKey: read(w.privateKeyPath), publicKey: read(w.publicKeyPath), platformCertificate: read(w.platformCertificatePath) },
  };
  if (!['integration', 'production'].includes(config.mode)) throw Error('支付配置 mode 必须为 integration 或 production');
  return config;
}

function inspect(config) {
  const common = [], alipay = [], wechat = [];
  try {
    const url = new URL(config.publicBaseUrl);
    if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash || url.username || url.password) throw Error();
  } catch { common.push('publicBaseUrl：供支付结果通知访问的 HTTPS 域名（不带路径）'); }
  if (config.mode === 'production' && !config.identityUrl) common.push('identityUrl：真实登录会话校验接口（当前演示登录不能用于生产支付）');
  if (!/^\d{16}$/.test(config.alipay.appId || '')) alipay.push('alipay.appId');
  if (!/^2088\d{12}$/.test(config.alipay.sellerId || '')) alipay.push('alipay.sellerId：收款商户 PID');
  checkPrivate(config.alipay.privateKey, alipay, 'alipay.privateKeyPath');
  if (config.alipay.appCertContent) {
    for (const key of ['appCertContent', 'alipayPublicCertContent', 'alipayRootCertContent']) if (!config.alipay[key]) alipay.push('alipay.' + key);
  } else {
    checkPublic(config.alipay.publicKey, alipay, 'alipay.publicKeyPath');
  }
  if (!/^\d{8,12}$/.test(config.wechat.mchId || '')) wechat.push('wechat.mchId');
  if (!/^wx[a-zA-Z0-9]{16}$/.test(config.wechat.appId || '')) wechat.push('wechat.appId：已与商户号绑定的微信 AppID');
  if (Buffer.byteLength(config.wechat.apiV3Key || '', 'utf8') !== 32) wechat.push('wechat.apiV3Key：32 字节 APIv3 密钥');
  if (!/^[A-Fa-f0-9]{16,64}$/.test(config.wechat.serialNo || '')) wechat.push('wechat.serialNo 或 certificatePath：商户 API 证书序列号');
  checkPrivate(config.wechat.privateKey, wechat, 'wechat.privateKeyPath');
  if (config.wechat.publicKey) {
    if (!/^PUB_KEY_ID_\d+$/.test(config.wechat.publicKeyId || '')) wechat.push('wechat.publicKeyId');
    checkPublic(config.wechat.publicKey, wechat, 'wechat.publicKeyPath');
  } else if (!config.wechat.platformCertificate) {
    wechat.push('wechat.publicKeyPath + publicKeyId（或已有 platformCertificatePath）');
  }
  const provider = (missing) => ({ ready: config.enabled && !common.length && !missing.length, missing: [...common, ...missing] });
  return { enabled: config.enabled, mode: config.mode, providers: { alipay: provider(alipay), wechat: provider(wechat) } };
}
function pemPublic(value) {
  return value.includes('-----BEGIN') ? value : `-----BEGIN PUBLIC KEY-----\n${value.replace(/\s/g, '')}\n-----END PUBLIC KEY-----`;
}
function checkPublic(value, errors, name) { try { if (!value) throw Error(); crypto.createPublicKey(pemPublic(value)); } catch { errors.push(name); } }
function checkPrivate(value, errors, name) { try { if (!value) throw Error(); const key = crypto.createPrivateKey(value); if (key.asymmetricKeyType !== 'rsa' || key.asymmetricKeyDetails.modulusLength < 2048) throw Error(); } catch { errors.push(name + '：RSA 私钥文件（至少 2048 位）'); } }
module.exports = { loadConfig, inspect, pemPublic };
