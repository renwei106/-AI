'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_BODY_BYTES = 36 * 1024 * 1024;
const TYPES = {
  feature_request: '想要的功能', usage_issue: '使用遇到的问题', appreciation: '感谢与鼓励', experience: '使用心得',
  // Retain the old payload shape and labels so already-sent requests can retry.
  suggestion: '体验优化建议', blocking_bug: '阻断性 Bug'
};
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const fail = (message, status = 400) => Object.assign(new Error(message), { status });
function send(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(value));
}
function text(value, max, label, required = false) {
  if (value == null && !required) return '';
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) throw fail(`${label}填写不正确`);
  return value.trim();
}
function imageType(bytes) {
  if (bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (bytes.length > 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if (bytes.length > 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6))) return 'image/gif';
  return '';
}
async function readBody(req) {
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) throw fail('请求格式不正确', 415);
  if (Number(req.headers['content-length']) > MAX_BODY_BYTES) throw fail('上传内容过大', 413);
  const chunks = []; let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > MAX_BODY_BYTES) throw fail('上传内容过大', 413);
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw fail('请求内容无法读取'); }
}

function createFeedbackHandler(options = {}) {
  const directory = path.resolve(options.directory || process.env.SHIYU_FEEDBACK_DIR || path.join(__dirname, '.local-feedback'));
  const configFile = path.resolve(options.configFile || process.env.SHIYU_FEEDBACK_CATEGORIES || path.join(__dirname, 'config/feedback-categories.json'));
  const pending = new Map();
  async function categories() {
    try {
      const config = JSON.parse(await fs.readFile(configFile, 'utf8'));
      if (!Array.isArray(config.items)) throw Error('items');
      const ids = new Set();
      return config.items.map(item => {
        if (!item || !/^[a-z0-9_-]{1,64}$/.test(item.id) || ids.has(item.id) || typeof item.enabled !== 'boolean') throw Error('category');
        ids.add(item.id);
        return { id: item.id, name: text(item.name, 40, '分类名称', true), enabled: item.enabled };
      }).filter(item => item.enabled).map(({ id, name }) => ({ id, name }));
    } catch { throw fail('问题分类暂时无法读取，请稍后重试', 503); }
  }
  function validate(body) {
    if (!body || !uuid.test(body.submissionId)) throw fail('提交标识无效，请重新打开反馈');
    if (!Object.hasOwn(TYPES, body.type)) throw fail('请选择反馈类型');
    const simple = ['appreciation', 'experience'].includes(body.type);
    const needsCategory = body.type === 'usage_issue';
    const descriptionLabel = { feature_request: '期望功能描述', appreciation: '想对我们说的话', experience: '使用心得' }[body.type] || '问题描述';
    const description = text(body.description, 3000, descriptionLabel, true);
    const categoryId = simple || body.type === 'feature_request' ? null : text(body.categoryId, 64, '问题分类', needsCategory) || null;
    const contact = text(simple ? '' : body.contact, 120, '联系方式');
    if (contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) && !(/^\+?[\d ()-]{6,30}$/.test(contact) && (contact.match(/\d/g) || []).length >= 6)) throw fail('请填写有效的联系电话或邮箱');
    const attachments = simple ? [] : body.images;
    if (!Array.isArray(attachments) || attachments.length > 5) throw fail('最多上传 5 张图片');
    const images = attachments.map((item, index) => {
      const name = text(item?.name, 150, '图片名称', true);
      const match = typeof item?.dataUrl === 'string' && item.dataUrl.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/);
      if (!match) throw fail('图片格式仅支持 PNG、JPG、WebP 和 GIF');
      const bytes = Buffer.from(match[2], 'base64');
      if (bytes.length > MAX_IMAGE_BYTES) throw fail('每张图片请控制在 5 MB 以内', 413);
      if (!bytes.length || bytes.toString('base64') !== match[2] || imageType(bytes) !== match[1]) throw fail('图片内容与格式不符，请重新上传');
      return { index: index + 1, name, mimeType: match[1], size: bytes.length, dataUrl: item.dataUrl };
    });
    const identity = body.identity || {};
    const signedIn = identity.signedIn === true;
    const id = signedIn ? text(identity.id, 100, '用户 ID', true) : null;
    const context = body.context || {};
    return {
      submissionId: body.submissionId.toLowerCase(), type: body.type, typeName: TYPES[body.type],
      categoryId,
      description, contact, images,
      // The existing preview login has no authenticated session. Never trust client
      // profile or membership values as authorization; retain their provenance.
      identity: { id, name: signedIn ? text(identity.name, 100, '用户姓名', true) : '访客', signedIn,
        isMember: signedIn && identity.isMember === true,
        membershipExpiresAt: signedIn ? text(identity.membershipExpiresAt, 50, '会员有效期') || null : null,
        membershipSource: signedIn && ['membership', 'demo'].includes(identity.membershipSource) ? identity.membershipSource : 'none',
        source: signedIn ? 'client-profile' : 'guest', verified: false },
      context: { page: text(context.page, 200, '来源页面'), theme: text(context.theme, 40, '主题'),
        mode: text(context.mode, 20, '明暗模式'), viewport: text(context.viewport, 30, '窗口尺寸') }
    };
  }
  async function save(payload, req) {
    const key = payload.submissionId;
    if (pending.has(key)) { await pending.get(key); return save(payload, req); }
    const operation = (async () => {
      const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
      const file = path.join(directory, `${key}.json`);
      try {
        const existing = JSON.parse(await fs.readFile(file, 'utf8'));
        if (existing.payloadHash !== hash) throw fail('此反馈已提交，请重新打开后再写一封', 409);
        return { receipt: existing.receipt, createdAt: existing.createdAt, duplicate: true };
      } catch (error) { if (error.code !== 'ENOENT') throw error; }
      const available = payload.categoryId ? await categories() : [];
      const category = available.find(item => item.id === payload.categoryId);
      if (payload.categoryId && !category) throw fail('该问题分类已调整，请重新选择', 409);
      const createdAt = new Date().toISOString();
      const receipt = `HY-${createdAt.slice(0, 10).replaceAll('-', '')}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const record = { schemaVersion: 1, ...payload, categoryName: category?.name || null, receipt, createdAt,
        status: 'new', payloadHash: hash, userAgent: String(req.headers['user-agent'] || '').slice(0, 500) };
      await fs.mkdir(directory, { recursive: true });
      const temporary = path.join(directory, `${key}.${crypto.randomUUID()}.tmp`);
      let handle;
      try {
        handle = await fs.open(temporary, 'wx', 0o600);
        await handle.writeFile(JSON.stringify(record));
        await handle.sync();
        await handle.close(); handle = null;
        await fs.rename(temporary, file);
      } finally {
        if (handle) await handle.close();
        await fs.unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
      }
      return { receipt, createdAt, duplicate: false };
    })();
    pending.set(key, operation);
    try { return await operation; } finally { pending.delete(key); }
  }
  return async function feedbackHandler(req, res) {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname !== '/api/shiyu/feedback' && !pathname.startsWith('/api/shiyu/feedback/')) return false;
    try {
      if (pathname === '/api/shiyu/feedback/categories' && req.method === 'GET') {
        send(res, 200, { items: await categories(), limits: { images: 5, imageBytes: MAX_IMAGE_BYTES, description: 3000 } });
      } else if (pathname === '/api/shiyu/feedback' && req.method === 'POST') {
        if (req.headers['sec-fetch-site'] === 'cross-site' || (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host)) throw fail('请求来源不正确', 403);
        const payload = validate(await readBody(req));
        const result = await save(payload, req);
        send(res, result.duplicate ? 200 : 201, result);
      } else { send(res, 405, { message: '不支持该操作' }); }
    } catch (error) {
      send(res, error.status || 503, { message: error.status ? error.message : '反馈暂时未能保存，请稍后重试' });
    }
    return true;
  };
}
module.exports = createFeedbackHandler();
module.exports.createFeedbackHandler = createFeedbackHandler;
