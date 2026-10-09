// Promote the confirmed dual-mode release to the main Chrome / Edge download.
// Historical trial releases and legacy-browser packages remain unchanged.
const fs = require('node:fs');
const path = require('node:path');
const version = '1.0.2';
const source = path.join(__dirname, 'browser-extension-lab');
const sourceVersion = JSON.parse(fs.readFileSync(path.join(source, 'manifest.json'), 'utf8')).version;
const target = path.join(__dirname, 'dist/extension/current');
fs.cpSync(source, target, { recursive: true });
// Bundle the same calendar migration used by the website; the worker never imports
// remote JavaScript while reading or saving a tool record.
fs.copyFileSync(path.join(__dirname, 'dist/todo-calendar-core.js'), path.join(source, 'todo-calendar-core.js'));
fs.copyFileSync(path.join(__dirname, 'dist/todo-calendar-core.js'), path.join(target, 'todo-calendar-core.js'));
// Retire the old MAIN-world injection asset when building over an older output.
const retiredAdapter = path.join(target, 'account-store.js');
if (fs.existsSync(retiredAdapter)) fs.unlinkSync(retiredAdapter);
const manifest = JSON.parse(fs.readFileSync(path.join(target, 'manifest.json'), 'utf8'));
manifest.name = '拾隅 · 网址收藏';
manifest.version = version;
manifest.host_permissions = ['https://shiyubox.com/*'];
fs.writeFileSync(path.join(target, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
fs.writeFileSync(path.join(target, 'config.js'), "export const SITE_URLS = ['https://shiyubox.com/'];\n");
const script = path.join(target, 'trial.js');
fs.writeFileSync(script, fs.readFileSync(script, 'utf8').replace("textContent='V" + sourceVersion + "'", "textContent='V" + version + "'").replace("$('#version-status').onclick=null;", ''));
const popup = path.join(target, 'popup.js');
fs.writeFileSync(popup, fs.readFileSync(popup, 'utf8').replace("current: '0.3.0', latest: '0.3.0'", "current: '" + version + "', latest: '" + version + "'"));
const readme = path.join(target, 'README.txt');
fs.writeFileSync(readme, fs.readFileSync(readme, 'utf8').replace('双模式独立试用版 ' + sourceVersion, '网址收藏 ' + version).replace('本期提供 Chrome/Edge 独立试用', '本版支持 Chrome/Edge'));
console.log('Prepared main Chrome / Edge extension ' + version);
