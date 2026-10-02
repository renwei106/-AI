const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const origin='http://127.0.0.1:64559',out='checks/forest-upload',file='D:/系统文件/下载/新版.mp4';fs.mkdirSync(out,{recursive:true});
const rights={items:[{id:'base',enabled:true,memberOnly:false,allowed:true},{id:'forestCompanion',enabled:true,memberOnly:false,allowed:true}],fallback:'base',member:true,previews:{}};
async function fixture(c,{account='forest-test-a',mobile=false}={}){
 let id=account,allow=true;const ops=await fetch(origin+'/api/shiyu/operations').then(r=>r.json());
 await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
 await c.route('**/api/shiyu/theme-access**',r=>r.fulfill({json:rights}));
 await c.route('**/api/shiyu/auth/session',r=>r.fulfill({json:{authenticated:!!id,user:id?{id,name:'测试用户',member:true,membership:{permanent:true},entitlements:[]}:null}}));
 await c.route('**/api/shiyu/auth/account',r=>r.fulfill({json:{userId:id}}));
 await c.route('**/api/shiyu/auth/avatar',r=>r.fulfill({json:{userId:id,profile:{}}}));
 await c.route('**/api/shiyu/auth/wechat/qr**',r=>r.fulfill({json:{}}));
 await c.route('**/api/shiyu/operations',r=>r.fulfill({json:{...ops,forestContent:{...ops.forestContent,allowUpload:allow}}}));
 await c.addInitScript(id=>{if(!sessionStorage.getItem('forest-upload-seeded')){localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'forestCompanion',mode:'light',brandGuideDismissed:true,accountProfile:{id,name:'测试用户'},accountDataUserId:id},signed:!!id}));sessionStorage.setItem('forest-upload-seeded','1')}},id);
 return {setAccount:value=>{id=value},setAllow:value=>{allow=value}};
}
async function ready(p){await p.waitForSelector('.forest-video.is-ready')}
async function settle(p,ratio,reverse=false){await p.waitForFunction(({ratio,reverse})=>{const v=document.querySelector('.forest-video');return v?.readyState>=2&&!v.seeking&&Math.abs(v.currentTime-(v.duration-1/30)*(reverse?1-ratio:ratio))<.04},{ratio,reverse})}
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),report={};try{
 const c=await b.newContext({viewport:{width:1440,height:900}}),f=await fixture(c),p=await c.newPage();const errors=[],uploads=[];p.on('pageerror',e=>errors.push(e.message));c.on('request',r=>{if(r.url().includes('forest-upload'))uploads.push(r.url())});
 await p.goto(origin);await ready(p);assert.equal(await p.locator('.forest-dot').count(),2);
 await p.locator('[data-clip="yarn-girl"]').click();await ready(p);await p.mouse.move(720,300);await settle(p,.5);
 await p.screenshot({path:out+'/desktop-girl.png'});
 for(const ratio of [0,.25,.5,.75,1]){await p.evaluate(r=>window.dispatchEvent(new MouseEvent('mousemove',{clientX:innerWidth*r})),ratio);await settle(p,ratio)}
 await p.evaluate(()=>{for(let i=0;i<400;i++)window.dispatchEvent(new MouseEvent('mousemove',{clientX:i%2?0:innerWidth}));window.dispatchEvent(new MouseEvent('mousemove',{clientX:innerWidth/2}))});await settle(p,.5);report.linearAndBurst=true;
 await p.evaluate(()=>{for(let i=0;i<20;i++)document.querySelector(`[data-clip="${i%2?'yarn-girl':'forest'}"]`).click()});await ready(p);await settle(p,.5);report.rapidSwitch=true;
 const flags=await p.locator('.forest-video').evaluate(v=>({paused:v.paused,muted:v.muted,inline:v.playsInline,autoplay:v.autoplay,controls:v.controls,loop:v.loop}));assert.deepEqual(flags,{paused:true,muted:true,inline:true,autoplay:false,controls:false,loop:false});
 assert.equal(await p.locator('.home-forestCompanion input:not([type=file])').count(),0);
 await p.locator('.utility-search button').click();await p.waitForSelector('#quick-search[open]');await p.locator('#quick-search [aria-label="关闭搜索"]').click();report.sharedSearch=true;
 await p.locator('.forest-picker input').setInputFiles(file);await p.waitForFunction(()=>document.querySelectorAll('.forest-dot').length===3);await ready(p);assert((await p.locator('.forest-video').getAttribute('src')).startsWith('blob:'));assert.equal(uploads.length,0);report.localOnly=true;
 await p.reload();await ready(p);await p.waitForFunction(()=>document.querySelector('.forest-video')?.src.startsWith('blob:'));assert.equal(await p.locator('.forest-dot').count(),3);report.persistence=true;
 await p.locator('.forest-picker input').setInputFiles({name:'too-large.mp4',mimeType:'video/mp4',buffer:Buffer.alloc(20*1024*1024+1)});await p.waitForFunction(()=>document.querySelector('.forest-status').textContent.includes('20 MB'));assert.equal(await p.locator('.forest-dot').count(),3);
 for(const seconds of [1,11]){const encoded=await p.evaluate(seconds=>new Promise(resolve=>{const canvas=document.createElement('canvas');canvas.width=160;canvas.height=90;const ctx=canvas.getContext('2d'),stream=canvas.captureStream(10),chunks=[],recorder=new MediaRecorder(stream,{mimeType:'video/mp4'});let n=0;const tick=setInterval(()=>{ctx.fillStyle=n++%2?'red':'blue';ctx.fillRect(0,0,160,90)},100);recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=()=>{clearInterval(tick);stream.getTracks().forEach(t=>t.stop());const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/mp4'}))};recorder.start();setTimeout(()=>recorder.stop(),seconds*1000)}),seconds);await p.locator('.forest-picker input').setInputFiles({name:'duration.mp4',mimeType:'video/mp4',buffer:Buffer.from(encoded,'base64')});await p.waitForFunction(()=>document.querySelector('.forest-status').textContent.includes('2～10'));assert.equal(await p.locator('.forest-dot').count(),3)}report.limits=true;
 f.setAccount('forest-test-b');await p.evaluate(()=>{window.ShiyuAccountSession.applyLogin({user:{id:'forest-test-b',name:'另一个账号',member:true,membership:{permanent:true}}})});await ready(p);await p.waitForFunction(()=>document.querySelectorAll('.forest-dot').length===2);assert(!(await p.locator('.forest-video').getAttribute('src')).startsWith('blob:'));report.accountIsolation=true;
 f.setAccount('forest-test-a');await p.evaluate(()=>{window.ShiyuAccountSession.applyLogin({user:{id:'forest-test-a',name:'测试用户',member:true,membership:{permanent:true}}})});await ready(p);await p.waitForFunction(()=>document.querySelectorAll('.forest-dot').length===3);report.accountRestore=true;
 f.setAllow(false);await p.evaluate(()=>window.dispatchEvent(new Event('focus')));await p.waitForFunction(()=>document.querySelector('.forest-upload').hidden&&document.querySelectorAll('.forest-dot').length===2);report.adminSwitch=true;
 f.setAllow(true);await p.evaluate(()=>window.dispatchEvent(new Event('focus')));await p.waitForFunction(()=>document.querySelectorAll('.forest-dot').length===3);
 await p.locator('.forest-dot').last().click();await ready(p);await p.locator('.forest-remove').click();await p.waitForFunction(()=>document.querySelectorAll('.forest-dot').length===2);report.remove=true;
 await p.evaluate(()=>{prefs.mode='dark';render()});await ready(p);await p.locator('[data-clip="yarn-girl"]').click();await ready(p);await p.screenshot({path:out+'/desktop-dark.png'});
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>!document.querySelector('.forest-video').hasAttribute('src'));assert(await p.locator('.forest-poster').evaluate(x=>x.complete&&x.naturalWidth>0));report.reducedMotion=true;
 assert.deepEqual(errors,[]);await c.close();
 const g=await b.newContext({viewport:{width:1440,height:900}});await fixture(g,{account:''});const gp=await g.newPage();await gp.goto(origin);await ready(gp);await gp.locator('.forest-upload').click();await gp.waitForSelector('#login[open]');assert.equal(await gp.locator('.forest-dot').count(),2);report.guestRequiresLogin=true;await g.close();
 const m=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await fixture(m);const mp=await m.newPage();let media=0;m.on('request',r=>{if(r.url().endsWith('.mp4'))media++});await mp.goto(origin);await mp.waitForSelector('.forest-dot');await mp.locator('[data-clip="yarn-girl"]').click();await mp.waitForFunction(()=>document.querySelector('.forest-poster').complete&&document.querySelector('.forest-poster').naturalWidth>0);assert.equal(media,0);await mp.screenshot({path:out+'/mobile.png'});report.mobileStatic=true;await m.close();
 fs.writeFileSync(out+'/results.json',JSON.stringify(report,null,2));console.log(report);
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
