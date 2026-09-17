'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { loadConfig, inspect } = require('./config.cjs');
const { PaymentStore } = require('./store.cjs');
const ROOT = path.resolve(__dirname, '..'), LOCAL = path.join(ROOT, '.local/payments');
const filename = process.env.SHIYU_PAYMENT_CONFIG || path.join(LOCAL, 'config.json');

async function main() {
  const command = process.argv[2] || 'check';
  if (command === 'setup') {
    fs.mkdirSync(LOCAL, { recursive: true });
    for (const provider of ['wechat', 'alipay']) fs.mkdirSync(path.join(LOCAL, 'keys', provider), { recursive: true });
    if (!fs.existsSync(filename)) fs.copyFileSync(path.join(__dirname, 'config.example.json'), filename, fs.constants.COPYFILE_EXCL);
    console.log('配置文件：' + filename + '\n密钥目录：' + path.join(LOCAL, 'keys') + '\n不会覆盖已有配置。');
    return;
  }
  if (command === 'alipay-key') {
    const folder = path.join(LOCAL, 'keys/alipay');
    fs.mkdirSync(folder, { recursive: true });
    const privateFile = path.join(folder, 'app-private.pem');
    if (fs.existsSync(privateFile)) throw Error('已有应用私钥，已停止；不会覆盖或重置。');
    const keys = crypto.generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } });
    fs.writeFileSync(privateFile, keys.privateKey, { flag: 'wx', mode: 0o600 });
    fs.writeFileSync(path.join(folder, 'app-public.pem'), keys.publicKey, { flag: 'wx' });
    fs.writeFileSync(path.join(folder, 'app-public-upload.txt'), keys.publicKey.replace(/-----[^-]+-----|\s/g, ''), { flag: 'wx' });
    console.log('已生成应用密钥。仅把下面文件的内容填到支付宝的“应用公钥”：\n' + path.join(folder, 'app-public-upload.txt') + '\n私钥保留本机，未输出。已有线上配置请勿覆盖。');
    return;
  }
  if (command === 'wechat-v3-key') {
    if (!fs.existsSync(filename)) throw Error('请先运行 setup 创建支付配置。');
    const value = JSON.parse(fs.readFileSync(filename, 'utf8').replace(/^\uFEFF/, ''));
    if (value.wechat?.apiV3Key) throw Error('配置中已有 APIv3 密钥，已停止；不会覆盖或重置。');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const key = Array.from({ length: 32 }, () => alphabet[crypto.randomInt(alphabet.length)]).join('');
    value.wechat ||= {};
    value.wechat.apiV3Key = key;
    const copyFile = path.join(LOCAL, 'api-v3-key-to-enter.txt');
    fs.writeFileSync(filename, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
    fs.writeFileSync(copyFile, key + '\n', { flag: 'wx', mode: 0o600 });
    console.log('APIv3 密钥已安全生成并写入支付配置。请从此本地文件复制到微信页面：\n' + copyFile + '\n设置成功后删除该临时文件。');
    return;
  }
  const config = loadConfig(filename), report = inspect(config);
  if (command === 'check') {
    const data = { checkedAt: new Date().toISOString(), ...report, authenticatedApiCalls: '尚未执行；check 仅检查配置' };
    fs.mkdirSync(LOCAL, { recursive: true });
    fs.writeFileSync(path.join(LOCAL, 'readiness.json'), JSON.stringify(data, null, 2) + '\n');
    console.log(JSON.stringify(data, null, 2));
    if (!Object.values(report.providers).every(p => p.ready)) process.exitCode = 2;
    return;
  }
  if (command === 'session') {
    if (!config.enabled || config.mode !== 'integration') throw Error('请先在配置里 enabled=true、mode=integration；此命令不能用于生产。');
    const origin = process.argv[3] || 'http://127.0.0.1:4348';
    if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin) || !config.allowedOrigins.includes(origin)) throw Error('联调地址必须是 allowedOrigins 中的本机地址');
    const store = new PaymentStore(config.database), ticket = store.makeTicket(); store.close();
    console.log('仅供本机、5 分钟内有效的一次性联调入口（请勿分享）：\n' + origin + '/api/shiyu/payments/test-session?token=' + ticket);
    return;
  }
  if (command === 'live-check') {
    const { WechatProvider, AlipayProvider } = require('./providers.cjs');
    const result = {};
    for (const [name, Type] of [['wechat', WechatProvider], ['alipay', AlipayProvider]]) {
      if (!report.providers[name].ready) { result[name] = { attempted: false, reason: '配置不完整或未启用', missing: report.providers[name].missing }; continue; }
      const order = { id: 'SY' + crypto.randomBytes(14).toString('hex') };
      try { await new Type(config[name]).query(order); result[name] = { attempted: true, authenticatedQuery: true, note: '仅查询不存在的测试订单；未创建收款订单，未验证实际支付或回调' }; }
      catch (error) { result[name] = error.code === 'ORDER_NOT_EXIST' ? { attempted: true, authenticatedQuery: true, note: '签名验证通过，测试订单不存在；未实际支付' } : { attempted: true, authenticatedQuery: false, code: error.code || 'CONFIG_ERROR', message: error.code ? error.message : '请检查密钥、证书和商户配置' }; }
    }
    fs.mkdirSync(LOCAL, { recursive: true });
    fs.writeFileSync(path.join(LOCAL, 'live-check.json'), JSON.stringify({ checkedAt: new Date().toISOString(), result }, null, 2) + '\n');
    console.log(JSON.stringify(result, null, 2));
    if (!Object.values(result).every(r => r.authenticatedQuery)) process.exitCode = 2;
    return;
  }
  if (command === 'start') {
    process.env.HOST = '127.0.0.1'; process.env.PORT = '4348';
    require('../preview.cjs'); return;
  }
  throw Error('命令：setup / check / alipay-key / wechat-v3-key / session / live-check / start');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
