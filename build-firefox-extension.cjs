// Firefox uses an event page and Mozilla signing, not a Chromium CRX.
const fs = require('node:fs'), path = require('node:path'), child = require('node:child_process');
const root = __dirname, source = path.join(root, 'browser-extension');
const destination = path.join(root, '.local/firefox-extension');
fs.mkdirSync(destination, { recursive: true });
for (const name of ['background.js', 'config.js', 'popup.html', 'popup.css', 'popup.js', 'icons', 'assets']) {
  fs.cpSync(path.join(source, name), path.join(destination, name), { recursive: true });
}
const manifest = JSON.parse(fs.readFileSync(path.join(source, 'manifest.json'), 'utf8'));
delete manifest.minimum_chrome_version;
if (process.argv.includes('--production')) {
  manifest.host_permissions = ['https://shiyubox.com/*'];
  fs.writeFileSync(path.join(destination, 'config.js'), "export const SITE_URLS = ['https://shiyubox.com/'];\n");
}
manifest.background = { scripts: ['background.js'], type: 'module' };
manifest.browser_specific_settings = { gecko: {
  id: 'bookmark@shiyubox.com', strict_min_version: '142.0',
  data_collection_permissions: { required: ['browsingActivity', 'websiteContent'] }
} };
fs.writeFileSync(path.join(destination, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
// Keep unsigned builds out of the public download directory.
const webExt = path.join(root, '.local/firefox-tools/node_modules/web-ext/bin/web-ext.js');
if (fs.existsSync(webExt)) {
  const result = child.spawnSync(process.execPath, [webExt, 'build', '--source-dir', destination,
    '--artifacts-dir', path.join(root, '.local/firefox-artifacts'), '--filename', `shiyu-extension-firefox-${manifest.version}-unsigned.zip`, '--overwrite-dest'], { stdio: 'inherit', windowsHide: true });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log('Firefox source prepared: ' + destination);
