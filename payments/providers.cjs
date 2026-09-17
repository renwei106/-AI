'use strict';
const crypto = require('node:crypto');
const { pemPublic } = require('./config.cjs');

class PaymentError extends Error {
  constructor(message, code = 'PAYMENT_ERROR', status = 502) { super(message); this.code = code; this.status = status; }
}
function fail(message, code = 'INVALID_NOTIFICATION', status = 400) { throw new PaymentError(message, code, status); }
function moneyToCents(value) {
  const text = String(value);
  if (!/^\d+(\.\d{1,2})?$/.test(text)) fail('金额格式无效', 'INVALID_AMOUNT');
  const [whole, part = ''] = text.split('.');
  const amount = Number(whole) * 100 + Number(part.padEnd(2, '0'));
  if (!Number.isSafeInteger(amount) || amount < 0) fail('金额格式无效', 'INVALID_AMOUNT');
  return amount;
}

class WechatProvider {
  constructor(config, { fetchImpl = fetch, now = Date.now } = {}) {
    this.config = config; this.fetch = fetchImpl; this.now = now;
    this.keys = new Map();
    if (config.publicKey && config.publicKeyId) this.keys.set(config.publicKeyId, crypto.createPublicKey(pemPublic(config.publicKey)));
    if (config.platformCertificate) {
      const cert = new crypto.X509Certificate(config.platformCertificate);
      if (Date.parse(cert.validTo) < now() || Date.parse(cert.validFrom) > now()) fail('微信支付平台证书不在有效期内', 'INVALID_CONFIG', 503);
      this.keys.set(cert.serialNumber, cert.publicKey);
    }
  }
  verify(headers, raw) {
    const get = key => headers.get ? headers.get(key) : headers[key.toLowerCase()];
    const timestamp = get('Wechatpay-Timestamp'), nonce = get('Wechatpay-Nonce');
    const signature = get('Wechatpay-Signature'), serial = get('Wechatpay-Serial');
    if (!/^\d+$/.test(timestamp || '') || Math.abs(this.now() / 1000 - Number(timestamp)) > 300 || !nonce || !signature) fail('微信支付签名或时间戳无效');
    const key = this.keys.get(serial);
    if (!key || !crypto.verify('RSA-SHA256', Buffer.from(`${timestamp}\n${nonce}\n${raw}\n`), key, Buffer.from(signature, 'base64'))) fail('微信支付验签失败');
  }
  async request(method, apiPath, data) {
    const body = data ? JSON.stringify(data) : '';
    const nonce = crypto.randomBytes(16).toString('hex'), timestamp = String(Math.floor(this.now() / 1000));
    const c = this.config;
    const signature = crypto.sign('RSA-SHA256', Buffer.from(`${method}\n${apiPath}\n${timestamp}\n${nonce}\n${body}\n`), c.privateKey).toString('base64');
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json',
      Authorization: `WECHATPAY2-SHA256-RSA2048 mchid="${c.mchId}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${c.serialNo}"` };
    if (c.publicKeyId) headers['Wechatpay-Serial'] = c.publicKeyId;
    let response;
    try { response = await this.fetch('https://api.mch.weixin.qq.com' + apiPath, { method, headers, body: body || undefined, redirect: 'error', signal: AbortSignal.timeout(12000) }); }
    catch { throw new PaymentError('微信支付连接未完成，请稍后查询订单，勿重复付款', 'PROVIDER_UNAVAILABLE'); }
    const raw = await response.text();
    // Never trust even a successful response before signature verification.
    try { this.verify(response.headers, raw); }
    catch (error) {
      if (!response.ok) throw new PaymentError(`微信支付请求未通过（HTTP ${response.status}），请核对商户配置`, 'PROVIDER_REJECTED');
      throw error;
    }
    const result = raw ? JSON.parse(raw) : {};
    if (!response.ok) throw new PaymentError(`微信支付：${result.code || response.status}`, result.code || 'PROVIDER_REJECTED');
    return result;
  }
  async create(order, base) {
    const data = await this.request('POST', '/v3/pay/transactions/native', {
      appid: this.config.appId, mchid: this.config.mchId, description: '拾隅 · ' + order.plan_name,
      out_trade_no: order.id, time_expire: new Date(order.expires_at).toISOString(),
      notify_url: base + '/api/shiyu/payments/notify/wechat', amount: { total: order.amount, currency: 'CNY' },
    });
    if (typeof data.code_url !== 'string' || !data.code_url.startsWith('weixin://wxpay/')) fail('微信支付未返回有效二维码', 'INVALID_RESPONSE', 502);
    const QRCode = require('qrcode');
    return { kind: 'qr', image: await QRCode.toDataURL(data.code_url, { width: 264, margin: 2, errorCorrectionLevel: 'M' }) };
  }
  normalize(data) {
    return { orderId: data.out_trade_no, transactionId: data.transaction_id, appId: data.appid, merchantId: data.mchid,
      amount: data.amount?.total, currency: data.amount?.currency, status: data.trade_state === 'SUCCESS' ? 'paid' : ['CLOSED', 'REVOKED', 'PAYERROR'].includes(data.trade_state) ? 'closed' : 'pending',
      paidAt: data.success_time ? Date.parse(data.success_time) : null };
  }
  async query(order) { return this.normalize(await this.request('GET', `/v3/pay/transactions/out-trade-no/${encodeURIComponent(order.id)}?mchid=${encodeURIComponent(this.config.mchId)}`)); }
  notification(headers, raw) {
    this.verify(headers, raw);
    const event = JSON.parse(raw);
    if (event.event_type !== 'TRANSACTION.SUCCESS' || event.resource_type !== 'encrypt-resource' || event.resource?.algorithm !== 'AEAD_AES_256_GCM') fail('微信支付通知类型无效');
    const resource = event.resource, encrypted = Buffer.from(resource.ciphertext, 'base64');
    if (encrypted.length <= 16) fail('微信支付通知密文无效');
    let plaintext;
    try {
      const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(this.config.apiV3Key, 'utf8'), Buffer.from(resource.nonce, 'utf8'));
      decipher.setAuthTag(encrypted.subarray(-16));
      decipher.setAAD(Buffer.from(resource.associated_data || '', 'utf8'));
      plaintext = Buffer.concat([decipher.update(encrypted.subarray(0, -16)), decipher.final()]).toString('utf8');
    } catch { fail('微信支付通知解密失败'); }
    return this.normalize(JSON.parse(plaintext));
  }
}

class AlipayProvider {
  constructor(config, { sdk } = {}) {
    this.config = config;
    if (sdk) { this.sdk = sdk; return; }
    const { AlipaySdk } = require('alipay-sdk');
    this.sdk = new AlipaySdk({ appId: config.appId, privateKey: config.privateKey, keyType: config.privateKey.includes('BEGIN RSA PRIVATE') ? 'PKCS1' : 'PKCS8', signType: 'RSA2', timeout: 12000,
      ...(config.appCertContent ? { appCertContent: config.appCertContent, alipayPublicCertContent: config.alipayPublicCertContent, alipayRootCertContent: config.alipayRootCertContent } : { alipayPublicKey: config.publicKey }) });
  }
  async create(order, base) {
    const url = this.sdk.pageExec('alipay.trade.page.pay', 'GET', {
      notifyUrl: base + '/api/shiyu/payments/notify/alipay', returnUrl: base + '/?page=membership&paymentOrder=' + order.id,
      bizContent: { outTradeNo: order.id, totalAmount: (order.amount / 100).toFixed(2), subject: '拾隅 · ' + order.plan_name,
        productCode: 'FAST_INSTANT_TRADE_PAY', timeoutExpress: '30m' },
    });
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'openapi.alipay.com') fail('支付宝收银台地址无效', 'INVALID_RESPONSE', 502);
    return { kind: 'redirect', url };
  }
  async query(order) {
    let data;
    try { data = await this.sdk.exec('alipay.trade.query', { bizContent: { outTradeNo: order.id } }, { validateSign: true }); }
    catch { throw new PaymentError('支付宝查询未完成，请稍后重试', 'PROVIDER_UNAVAILABLE'); }
    if (data.code === '40004' && data.subCode === 'ACQ.TRADE_NOT_EXIST') return { orderId: order.id, status: 'pending' };
    if (data.code !== '10000') throw new PaymentError(`支付宝：${data.subCode || data.code || '查询失败'}`, data.subCode || 'PROVIDER_REJECTED');
    return { orderId: data.outTradeNo, transactionId: data.tradeNo, appId: this.config.appId,
      merchantId: this.config.sellerId, amount: moneyToCents(data.totalAmount), currency: 'CNY',
      status: ['TRADE_SUCCESS', 'TRADE_FINISHED'].includes(data.tradeStatus) ? 'paid' : data.tradeStatus === 'TRADE_CLOSED' ? 'closed' : 'pending',
      paidAt: data.sendPayDate ? parseAlipayDate(data.sendPayDate) : Date.now() };
  }
  notification(_headers, raw) {
    const params = new URLSearchParams(raw), data = {};
    for (const [key, value] of params) {
      if (Object.hasOwn(data, key)) fail('支付宝通知存在重复字段');
      Object.defineProperty(data, key, { value, enumerable: true, writable: false });
    }
    if (data.sign_type !== 'RSA2' || !data.sign || !this.sdk.checkNotifySignV2(data)) fail('支付宝通知验签失败');
    return { orderId: data.out_trade_no, transactionId: data.trade_no, appId: data.app_id, merchantId: data.seller_id,
      amount: moneyToCents(data.total_amount), currency: 'CNY',
      status: ['TRADE_SUCCESS', 'TRADE_FINISHED'].includes(data.trade_status) ? 'paid' : data.trade_status === 'TRADE_CLOSED' ? 'closed' : 'pending',
      paidAt: data.gmt_payment ? parseAlipayDate(data.gmt_payment) : null };
  }
}
function parseAlipayDate(value) { return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(String(value)) ? Date.parse(value.replace(' ', 'T') + '+08:00') : NaN; }
module.exports = { WechatProvider, AlipayProvider, PaymentError, moneyToCents };
