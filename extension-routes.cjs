const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, 'dist/extension');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.zip': 'application/zip' };
module.exports = function extensionRoutes(req, res) {
  const pathname = req.url.split('?')[0];
  if (pathname === '/extension') { res.writeHead(302, { Location: '/extension/' }); res.end(); return true; }
  if (!pathname.startsWith('/extension/')) return false;
  let relative; try { relative = decodeURIComponent(pathname.slice('/extension/'.length)) || 'index.html'; } catch { res.writeHead(400); res.end(); return true; }
  const file = path.resolve(root, relative), type = types[path.extname(file)];
  if (!file.startsWith(root + path.sep) || !type || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end('Not found'); return true; }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return true; }
  const headers = { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' };
  if (file.endsWith('.zip')) headers['Content-Disposition'] = 'attachment; filename="shiyu-extension-0.1.0.zip"';
  res.writeHead(200, headers);
  if (req.method === 'HEAD') res.end(); else fs.createReadStream(file).pipe(res);
  return true;
};
