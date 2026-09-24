/* Dependency-free, reproducible ZIP containing a Manifest V3 extension at its root. */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib'), child = require('node:child_process');
const root = __dirname, production = process.argv.includes('--production');
const originalSource = path.join(root, 'browser-extension');
const source = production ? path.join(root, '.local/chromium-release') : originalSource;
if (production) {
  fs.mkdirSync(source, { recursive: true });
  for (const name of ['manifest.json', 'background.js', 'config.js', 'popup.html', 'popup.css', 'popup.js', 'README.txt', 'icons', 'assets']) fs.cpSync(path.join(originalSource, name), path.join(source, name), { recursive: true });
  const releaseManifest = JSON.parse(fs.readFileSync(path.join(source, 'manifest.json'), 'utf8'));
  releaseManifest.host_permissions = ['https://shiyubox.com/*'];
  fs.writeFileSync(path.join(source, 'manifest.json'), JSON.stringify(releaseManifest, null, 2) + '\n');
  fs.writeFileSync(path.join(source, 'config.js'), "export const SITE_URLS = ['https://shiyubox.com/'];\n");
}
const files = ['manifest.json', 'background.js', 'config.js', 'popup.html', 'popup.css', 'popup.js', 'README.txt'].map(name => ({ name, source: path.join(source, name) }));
for (const file of ['shiyu-youfeng/ShiyuYoufeng-Preview-Regular.woff2','shiyu-qingya-song/ShiyuQingyaSong-Preview-Regular.woff2','shiyu-wenrun-kai/ShiyuWenrunKai-Preview-Regular.woff2']) {
  const fontSource = path.join(root, 'dist/assets/fonts', file), fontTarget = path.join(source, 'assets/fonts', file);
  fs.mkdirSync(path.dirname(fontTarget), { recursive: true }); fs.copyFileSync(fontSource, fontTarget);
  files.push({ name: `assets/fonts/${file}`, source: fontTarget });
}
const manifest = JSON.parse(fs.readFileSync(path.join(source, 'manifest.json')));
if (manifest.manifest_version !== 3) throw new Error('Manifest V3 is required');
const table = Array.from({ length: 256 }, (_, n) => { for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1; return n >>> 0; });
function crc(buffer) { let value = 0xffffffff; for (const byte of buffer) value = table[(value ^ byte) & 255] ^ (value >>> 8); return (value ^ 0xffffffff) >>> 0; }
fs.mkdirSync(path.join(source, 'icons'), { recursive: true });
for (const size of [16, 32, 48, 128]) { const name = `icons/${size}.png`, file = path.join(source, name); if (!fs.existsSync(file)) throw new Error(`Missing brand icon: ${name}`); files.push({ name, source: file }); }
const localDir = path.join(root, '.local'), key = path.join(localDir, 'browser-extension.pem'); fs.mkdirSync(localDir, { recursive: true });
const browsers = process.platform === 'win32' ? [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe'
] : ['google-chrome', 'chromium', 'chromium-browser'];
const browser = browsers.find(candidate => path.isAbsolute(candidate) ? fs.existsSync(candidate) : child.spawnSync('which', [candidate]).status === 0);
if (!browser) throw new Error('Chrome or Edge is required to build the signed CRX package');
const packArgs = ['--headless=new', `--pack-extension=${source}`];
if (fs.existsSync(key)) packArgs.push(`--pack-extension-key=${key}`);
const packed = child.spawnSync(browser, packArgs, { windowsHide: true, encoding: 'utf8' });
if (packed.status !== 0) throw new Error((packed.stderr || packed.stdout || 'CRX build failed').trim());
const generatedCrx = source + '.crx', generatedKey = source + '.pem';
if (!fs.existsSync(key) && fs.existsSync(generatedKey)) fs.renameSync(generatedKey, key);
if (!fs.existsSync(generatedCrx)) throw new Error('CRX build did not produce an output file');
files.push({ name: 'shiyu-extension.crx', source: generatedCrx });
const local = [], central = []; let offset = 0;
for (const file of files) {
  const name = Buffer.from(file.name), data = fs.readFileSync(file.source), checksum = crc(data);
  const header = Buffer.alloc(30); header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x21, 12); header.writeUInt32LE(checksum, 14); header.writeUInt32LE(data.length, 18); header.writeUInt32LE(data.length, 22); header.writeUInt16LE(name.length, 26);
  local.push(header, name, data);
  const directory = Buffer.alloc(46); directory.writeUInt32LE(0x02014b50); directory.writeUInt16LE(20, 4); directory.writeUInt16LE(20, 6); directory.writeUInt16LE(0x21, 14); directory.writeUInt32LE(checksum, 16); directory.writeUInt32LE(data.length, 20); directory.writeUInt32LE(data.length, 24); directory.writeUInt16LE(name.length, 28); directory.writeUInt32LE(offset, 42);
  central.push(directory, name); offset += header.length + name.length + data.length;
}
const directory = Buffer.concat(central), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
const output = path.join(root, 'dist/extension/downloads'); fs.mkdirSync(output, { recursive: true });
const filename = path.join(output, `shiyu-extension-${manifest.version}.zip`); fs.writeFileSync(filename, Buffer.concat([...local, directory, end]));
fs.copyFileSync(generatedCrx, path.join(output, `shiyu-extension-${manifest.version}.crx`));
for (const browser of ['chrome', 'edge', '360', 'qq', 'quark']) {
  fs.copyFileSync(filename, path.join(output, `shiyu-extension-${browser}-${manifest.version}.zip`));
}
fs.unlinkSync(generatedCrx);
const preview = path.join(root, 'dist/extension/preview'); fs.mkdirSync(preview, { recursive: true });
for (const file of ['popup.html', 'popup.css', 'popup.js']) fs.copyFileSync(path.join(source, file), path.join(preview, file));
console.log(`Built ${path.relative(root, filename)} (${fs.statSync(filename).size} bytes), signed CRX included, ${files.length} files`);
const firefoxBuild = child.spawnSync(process.execPath, [path.join(root, 'build-firefox-extension.cjs'), ...(production ? ['--production'] : [])], { stdio: 'inherit', windowsHide: true });
if (firefoxBuild.status !== 0) process.exit(firefoxBuild.status || 1);
