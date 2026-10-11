const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const os=require('node:os'),path=require('node:path');const base='http://127.0.0.1:4329';
(async()=>{
 const before=fs.readFileSync('baselines/pwa-install-before-20261007/index.html','utf8'),after=fs.readFileSync('dist/index.html','utf8');
 const metadata='\n<link rel="manifest" href="/install/manifest.webmanifest"><link rel="apple-touch-icon" href="/install/icon-192.png"><meta name="apple-mobile-web-app-title" content="拾隅">\n';
 assert.equal(after.replace(metadata,''),before,'homepage content and layout preserved');
 for(const name of ['index.html','install.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png']){const r=await fetch(base+'/install/'+name);assert.equal(r.status,200,name);if(name.endsWith('.webmanifest'))assert.match(r.headers.get('content-type'),/^application\/manifest\+json/)}
 const redirect=await fetch(base+'/install?from=home',{redirect:'manual'});assert.equal(redirect.status,302);assert.equal(redirect.headers.get('location'),'/install/?from=home');
 assert.equal((await fetch(base+'/install/unapproved.js')).status,404);
 const manifest=await (await fetch(base+'/install/manifest.webmanifest')).json();assert.equal(manifest.start_url,'/');assert.equal(manifest.scope,'/');assert.equal(manifest.display,'standalone');assert.deepEqual(manifest.icons.map(x=>x.sizes),['192x192','512x512']);
 const pngSize=f=>{const d=fs.readFileSync(f);return[d.readUInt32BE(16),d.readUInt32BE(20)]};assert.deepEqual(pngSize('dist/install/icon-192.png'),[192,192]);assert.deepEqual(pngSize('dist/install/icon-512.png'),[512,512]);
 for(const channel of ['chrome','msedge']){
  const browser=await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(),'shiyu-pwa-')),{channel,headless:true,viewport:{width:1280,height:900}});
  try{
   const page=await browser.newPage();await page.goto(base+'/');
   const cd=await page.context().newCDPSession(page);const m=await cd.send('Page.getAppManifest');assert.equal(m.errors.length,0);assert.equal(m.url,base+'/install/manifest.webmanifest');
   const errors=await cd.send('Page.getInstallabilityErrors');console.log(channel,JSON.stringify(errors));assert.equal(errors.installabilityErrors.length,0);
   await page.addInitScript(()=>addEventListener('beforeinstallprompt',event=>{if(event.isTrusted){event.preventDefault();event.stopImmediatePropagation()}}));await page.goto(base+'/install/');await page.locator('#install').waitFor();
   await page.evaluate(()=>{window.promptCount=0;const e=new Event('beforeinstallprompt',{cancelable:true});e.prompt=async()=>{window.promptCount++};e.userChoice=Promise.resolve({outcome:'dismissed'});dispatchEvent(e)});
   await page.locator('#install').click();assert.equal(await page.evaluate(()=>window.promptCount),1);assert.match(await page.locator('#status').innerText(),/已取消/);
   await page.evaluate(()=>{const e=new Event('beforeinstallprompt',{cancelable:true});e.prompt=async()=>{throw Error('unavailable')};e.userChoice=Promise.resolve({outcome:'dismissed'});dispatchEvent(e)});
   await page.locator('#install').click();assert.match(await page.locator('#status').innerText(),/暂时无法/);assert.equal(await page.locator('#install').isDisabled(),false);
   await page.evaluate(()=>dispatchEvent(new Event('appinstalled')));assert.equal(await page.locator('#install').isVisible(),false);
   await page.setViewportSize({width:390,height:844});await page.goto(base+'/install/');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'checks/pwa-install-'+channel+'-mobile.png'});
  }finally{await browser.close()}
 }
 const browser=await chromium.launch({channel:'msedge',headless:true});try{
  const manual=await browser.newPage();await manual.goto(base+'/install/');await manual.locator('#install').click();assert(await manual.locator('#guide').isVisible());await manual.close();
  const ios=await browser.newContext({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',viewport:{width:390,height:844}});const page=await ios.newPage();await page.goto(base+'/install/');assert.match(await page.locator('#guide').innerText(),/添加到主屏幕/);await ios.close();
  const standalone=await browser.newContext();await standalone.addInitScript(()=>Object.defineProperty(navigator,'standalone',{value:true}));const app=await standalone.newPage();await app.goto(base+'/install/');assert.equal(await app.locator('#install').isVisible(),false);await standalone.close();
 }finally{await browser.close()}
 console.log('PASS homepage preservation, actual routes/MIME/icons, Chrome/Edge installability, prompt/cancel/failure, installed state, iOS guide and mobile layout');
})().catch(e=>{console.error(e);process.exitCode=1});




