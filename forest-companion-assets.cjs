'use strict';
const fs = require('node:fs');
const path = require('node:path');
// Scoped byte-range support keeps paused MP4 seeking available in local preview.
module.exports = function forestCompanionAssets(req, res) {
  const url = req.url.split('?')[0];
  if (/^\/api\/shiyu\/forest-assets\/(forest|yarn-girl|[a-f0-9]{64})\.(mp4|webp)$/.test(url)) {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return true; }
    const upstream = new URL(url, process.env.SHIYU_ADMIN_ORIGIN || 'http://127.0.0.1:5175');
    const proxy = require(upstream.protocol === 'https:' ? 'node:https' : 'node:http').request(upstream, { method:req.method, headers:req.headers.range ? {Range:req.headers.range} : {} }, source => {
      res.writeHead(source.statusCode, source.headers); source.pipe(res);
    });
    proxy.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
    proxy.setTimeout(15000, () => proxy.destroy()); res.on('close', () => proxy.destroy()); proxy.end(); return true;
  }
  const names = { '/assets/forest-companion/look.mp4': 'look.mp4', '/assets/forest-companion/poster.webp': 'poster.webp' };
  if (!names[url]) return false;
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return true; }
  const file = path.join(__dirname, 'dist/assets/forest-companion', names[url]);
  if (!fs.existsSync(file)) { res.writeHead(404); res.end(); return true; }
  const size = fs.statSync(file).size;
  const headers = { 'Content-Type': url.endsWith('.mp4') ? 'video/mp4' : 'image/webp', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
  let start = 0, end = size - 1, status = 200;
  if (req.headers.range) {
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (!range || (!range[1] && !range[2])) { res.writeHead(416, { ...headers, 'Content-Range': `bytes */${size}` }); res.end(); return true; }
    start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    end = range[1] && range[2] ? Math.min(size - 1, Number(range[2])) : size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= size) { res.writeHead(416, { ...headers, 'Content-Range': `bytes */${size}` }); res.end(); return true; }
    headers['Content-Range'] = `bytes ${start}-${end}/${size}`; status = 206;
  }
  res.writeHead(status, { ...headers, 'Content-Length': end - start + 1 });
  if (req.method === 'HEAD') res.end();
  else { const stream = fs.createReadStream(file, { start, end }); stream.on('error', () => res.destroy()); req.on('close', () => stream.destroy()); stream.pipe(res); }
  return true;
};
