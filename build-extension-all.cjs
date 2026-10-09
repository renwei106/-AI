// All browser packages use the same current feature source. Never rewrites published archives.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=__dirname;
function run(exe,args){const r=cp.spawnSync(exe,args,{stdio:'inherit',windowsHide:true});if(r.status!==0)throw Error('Build failed: '+exe);}
run(process.execPath,['build-extension-current.cjs']);
const source=path.join(root,'.local/all-browser-current');fs.mkdirSync(source,{recursive:true});fs.cpSync(path.join(root,'dist/extension/current'),source,{recursive:true});
const retiredAdapter=path.join(source,'account-store.js');if(fs.existsSync(retiredAdapter))fs.unlinkSync(retiredAdapter);
const version=JSON.parse(fs.readFileSync(path.join(source,'manifest.json'))).version;
const key=path.join(root,'.local/browser-extension.pem');if(!fs.existsSync(key))throw Error('Existing signing key required to preserve extension identity');
const exe=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(x=>fs.existsSync(x));if(!exe)throw Error('Chromium packer missing');
const stale=path.join(source,'shiyu-extension.crx');if(fs.existsSync(stale))fs.unlinkSync(stale);
run(exe,['--headless=new','--pack-extension='+source,'--pack-extension-key='+key]);
fs.copyFileSync(source+'.crx',path.join(source,'shiyu-extension.crx'));
const artifacts=path.join(root,'.local/all-browser-artifacts');fs.mkdirSync(artifacts,{recursive:true});
const quote=x=>"'"+x.replaceAll("'","''")+"'";
for(const browser of ['chrome','edge','360','qq','quark'])run('pwsh',['-NoProfile','-Command','Compress-Archive -Path '+quote(source+'/*')+' -DestinationPath '+quote(path.join(artifacts,`shiyu-extension-${browser}-${version}.zip`))+' -Force']);
run(process.execPath,['build-firefox-extension.cjs','--production']);
console.log('Review packages ready in .local/all-browser-artifacts; Firefox unsigned artifact remains private.');
