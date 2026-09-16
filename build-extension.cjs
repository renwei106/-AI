/* Dependency-free, reproducible ZIP containing a Manifest V3 extension at its root. */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = __dirname, source = path.join(root, 'browser-extension');
const files = ['manifest.json', 'background.js', 'config.js', 'popup.html', 'popup.css', 'popup.js', 'README.txt'];
const manifest = JSON.parse(fs.readFileSync(path.join(source, 'manifest.json')));
if (manifest.manifest_version !== 3) throw new Error('Manifest V3 is required');
const table = Array.from({ length: 256 }, (_, n) => { for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1; return n >>> 0; });
function crc(buffer) { let value = 0xffffffff; for (const byte of buffer) value = table[(value ^ byte) & 255] ^ (value >>> 8); return (value ^ 0xffffffff) >>> 0; }
function chunk(type, data) { const label = Buffer.from(type), head = Buffer.alloc(4), tail = Buffer.alloc(4); head.writeUInt32BE(data.length); tail.writeUInt32BE(crc(Buffer.concat([label, data]))); return Buffer.concat([head, label, data, tail]); }
function icon(size) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const px = (x + .5) / size * 24, py = (y + .5) / size * 24;
    const rounded = Math.hypot(Math.max(3.5 - px, px - 20.5, 0), Math.max(3.5 - py, py - 20.5, 0)) <= 3;
    const mark = (Math.abs(px - 6.8) < .85 && py > 6 && py < 18) || (Math.abs(py - 6.8) < .85 && px > 6 && px < 18) || (px > 12.2 && px < 18 && py > 12.2 && py < 18 && (px < 13.7 || px > 16.4 || py < 13.7 || py > 16.4));
    const offset = y * (size * 4 + 1) + 1 + x * 4;
    [mark ? 246 : 72, mark ? 248 : 97, mark ? 239 : 76, rounded ? 255 : 0].forEach((v, i) => raw[offset + i] = v);
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(size); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
fs.mkdirSync(path.join(source, 'icons'), { recursive: true });
for (const size of [16, 32, 48, 128]) { const file = `icons/${size}.png`; fs.writeFileSync(path.join(source, file), icon(size)); files.push(file); }
const local = [], central = []; let offset = 0;
for (const file of files) {
  const name = Buffer.from(file), data = fs.readFileSync(path.join(source, file)), checksum = crc(data);
  const header = Buffer.alloc(30); header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x21, 12); header.writeUInt32LE(checksum, 14); header.writeUInt32LE(data.length, 18); header.writeUInt32LE(data.length, 22); header.writeUInt16LE(name.length, 26);
  local.push(header, name, data);
  const directory = Buffer.alloc(46); directory.writeUInt32LE(0x02014b50); directory.writeUInt16LE(20, 4); directory.writeUInt16LE(20, 6); directory.writeUInt16LE(0x21, 14); directory.writeUInt32LE(checksum, 16); directory.writeUInt32LE(data.length, 20); directory.writeUInt32LE(data.length, 24); directory.writeUInt16LE(name.length, 28); directory.writeUInt32LE(offset, 42);
  central.push(directory, name); offset += header.length + name.length + data.length;
}
const directory = Buffer.concat(central), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
const output = path.join(root, 'dist/extension/downloads'); fs.mkdirSync(output, { recursive: true });
const filename = path.join(output, `shiyu-extension-${manifest.version}.zip`); fs.writeFileSync(filename, Buffer.concat([...local, directory, end]));
const preview = path.join(root, 'dist/extension/preview'); fs.mkdirSync(preview, { recursive: true });
for (const file of ['popup.html', 'popup.css', 'popup.js']) fs.copyFileSync(path.join(source, file), path.join(preview, file));
console.log(`Built ${path.relative(root, filename)} (${fs.statSync(filename).size} bytes), ${files.length} files`);
