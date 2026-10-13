// Firefox uses an event page and Mozilla signing, not a Chromium CRX.
const fs = require('node:fs'), path = require('node:path'), child = require('node:child_process');
const environment = require('./extension-environment.cjs');
const profile = environment.selectProfile();
const root = __dirname, source = path.join(root, profile === 'production' ? 'dist/extension/current' : 'browser-extension-lab');
const destination = path.join(root, profile === 'production' ? '.local/firefox-extension' : '.local/firefox-extension-development');
fs.mkdirSync(destination, { recursive: true });
for (const name of ['background.js', 'config.js', 'local-client.js', 'todo-calendar-core.js', 'popup.html', 'panel.html', 'popup.css', 'popup.js', 'trial.js', 'trial.css', 'trial-apps.js', 'trial-schedule.js', 'icons', 'assets']) {
  fs.cpSync(path.join(source, name), path.join(destination, name), { recursive: true });
}
const retiredAdapter = path.join(destination, 'account-store.js');
if (fs.existsSync(retiredAdapter)) fs.unlinkSync(retiredAdapter);
const manifest = JSON.parse(fs.readFileSync(path.join(source, 'manifest.json'), 'utf8'));
delete manifest.minimum_chrome_version;
delete manifest.side_panel;
manifest.permissions=manifest.permissions.filter(p=>p!=='sidePanel');
manifest.sidebar_action={default_title:'拾隅',default_panel:'panel.html',default_icon:manifest.icons,open_at_install:false};
manifest.background = { scripts: ['background.js'], type: 'module' };
manifest.browser_specific_settings = { gecko: {
  id: profile === 'production' ? 'bookmark@shiyubox.com' : 'bookmark-development@shiyubox.com', strict_min_version: '142.0',
  data_collection_permissions: { required: ['browsingActivity', 'websiteContent'] }
} };
fs.writeFileSync(path.join(destination, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
environment.writePackageProfile(destination, profile);
// Keep unsigned builds out of the public download directory.
const webExt = path.join(root, '.local/firefox-tools/node_modules/web-ext/bin/web-ext.js');
if (fs.existsSync(webExt)) {
  const result = child.spawnSync(process.execPath, [webExt, 'build', '--source-dir', destination,
    '--artifacts-dir', path.join(root, profile === 'production' ? '.local/firefox-artifacts' : '.local/firefox-artifacts-development'), '--filename', `shiyu-extension-firefox-${manifest.version}-unsigned.zip`, '--overwrite-dest'], { stdio: 'inherit', windowsHide: true });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log('Firefox source prepared: ' + destination);
