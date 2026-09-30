const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.join(__dirname,'fidelity-review'),url='http://127.0.0.1:4320/official/v3/index.html',ids=['intro','themes','space','world','extension','tools','closing'];
fs.mkdirSync(out,{recursive:true});
async function go(p,id){await p.evaluate(id=>document.getElementById(id).scrollIntoView({behavior:'instant'}),id);await p.waitForTimeout(150);}
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true}),c=await b.newContext({viewport:{width:1440,height:900},permissions:['clipboard-read','clipboard-write']}),p=await c.newPage(),errors=[],failed=[],report=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
 await p.goto(url,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
 assert(await p.evaluate(()=>document.fonts.check('16px "Shiyu Youfeng"')));assert.match(await p.locator('h1').evaluate(n=>getComputedStyle(n).fontFamily),/Shiyu Youfeng/);
 assert.equal(await p.locator('[role="tablist"],[role="tab"],[data-theme],[data-view],[data-topic],[data-tool]').count(),0);
 assert.equal(await p.locator('.actual-theme').count(),6);assert.equal(await p.locator('.collection-node').count(),6);
 const content=await p.locator('main').textContent();assert(!/海风|海滩|人生影院|海边/.test(content));
 for(const word of ['UP 主资源','优质网址','学习路线','学习计划','专题合集','素材工具'])assert(content.includes(word));
 assert.match(await p.locator('.actual-space-window img').getAttribute('src'),/current\/space.webp$/);
 assert.match(await p.locator('.actual-plugin-popup img').getAttribute('src'),/current\/extension-popup.webp$/);
 for(const id of ids)assert(await p.locator(`#${id} a[href*="shiyubox.com"],#${id} a[data-world-href]`).count()>0);
 for(const [width,height]of [[1440,900],[2560,1440],[1366,768],[1024,768],[768,1024],[390,844],[320,568]]){
  await p.setViewportSize({width,height});const tiles=[];
  for(const id of ids){
   await go(p,id);await p.locator(`#${id} img`).evaluateAll(ns=>Promise.all(ns.filter(n=>n.getClientRects().length).map(n=>n.decode())));
   const details=await p.locator('#'+id).evaluate(n=>{const r=n.getBoundingClientRect();return {height:r.height,width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,items:[...n.querySelectorAll('.copy,.actual-theme,.actual-plugin-popup,.collection-node,.intro-home-shot,.intro-space-shot,.actual-space-window')].map(x=>{const q=x.getBoundingClientRect();return {name:x.className,x:q.x,right:q.right,bottom:q.bottom,sectionBottom:r.bottom}})}});
   assert(!details.overflow,`${width} ${id} overflow`);
   for(const item of details.items)assert(item.x>=-3&&item.right<=width+4&&item.bottom<=item.sectionBottom,`${width} ${id} clipping: ${JSON.stringify(item)}`);
   report.push({viewport:`${width}x${height}`,id,height:details.height});
   if(width===1440||width===390){const prefix=width===1440?'desktop':'mobile',file=path.join(out,`${prefix}-${id}.png`);await p.screenshot({path:file,animations:'disabled'});const h=Math.round(480*height/width);tiles.push({input:await sharp(file).resize(480,h).png().toBuffer(),left:(tiles.length%3)*480,top:Math.floor(tiles.length/3)*h});}
  }
  if(tiles.length){const h=Math.round(480*height/width);await sharp({create:{width:1440,height:h*3,channels:3,background:'#101713'}}).composite(tiles).png().toFile(path.join(out,`${width===1440?'desktop':'mobile'}-overview.png`));}
  console.log('PASS layout',width,height);
 }
 await p.setViewportSize({width:1440,height:900});await go(p,'extension');
 const anchor=await p.evaluate(()=>{const pin=document.querySelector('.actual-extension-pin').getBoundingClientRect(),popup=document.querySelector('.actual-plugin-popup').getBoundingClientRect(),line=document.querySelector('.plugin-tether').getBoundingClientRect();return {pin,popup,line}});
 assert(anchor.popup.y>anchor.pin.y+anchor.pin.height,'popup emerges below toolbar pin');
 assert(Math.abs(anchor.line.x-(anchor.pin.x+anchor.pin.width/2))<18,'connector aligned to pin');
 await go(p,'themes');await p.locator('[data-setup="home"]').click();await p.waitForFunction(()=>document.querySelector('#setup-status').textContent.includes('已复制'));
 assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),'https://shiyubox.com/');await p.keyboard.press('Escape');assert(await p.locator('[data-setup="home"]').evaluate(n=>document.activeElement===n));
 await p.locator('[data-setup="desktop"]').click();assert(await p.locator('#install-app').isVisible());assert.equal(await p.locator('#download-shortcut').count(),0);assert(!(await p.locator('#home-url').isVisible()));await p.keyboard.press('Escape');
 await p.locator('[data-setup="home"]').click();assert.equal(await p.locator('#setup-browser').count(),0);await p.locator('#copy-settings').click();assert.match(await p.evaluate(()=>navigator.clipboard.readText()),/settings/);await p.keyboard.press('Escape');
 assert.equal(await p.locator('#intro .actions a').count(),1);assert.equal(await p.locator('.hero-brand').textContent(),'拾隅');assert.equal(await p.locator('.stationery-links').count(),1);
 await p.route('**/api/shiyu/operations',r=>r.fulfill({json:{world:{enabled:false}}}));await p.evaluate(()=>dispatchEvent(new Event('focus')));await p.waitForTimeout(200);assert.equal(await p.locator('[data-world-href][href]').count(),0);
 await p.unroute('**/api/shiyu/operations');await p.route('**/api/shiyu/operations',r=>r.fulfill({json:{world:{enabled:true}}}));await p.evaluate(()=>dispatchEvent(new Event('focus')));await p.waitForTimeout(200);assert.equal(await p.locator('[data-world-href][href]').count(),7);
 await go(p,'intro');await p.mouse.move(300,400);await p.mouse.wheel(0,520);await p.waitForTimeout(900);assert(await p.locator('.chapter-nav a[href="#themes"]').getAttribute('aria-current'));
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 const plain=await b.newContext({javaScriptEnabled:false}),np=await plain.newPage();await np.goto(url);assert.equal(await np.locator('.actual-theme').count(),6);assert.equal(await np.locator('.collection-node').count(),6);await plain.close();
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({report,errors,failed,font:'拾隅游风',tabs:0,themeCount:6,collectionCount:6,pluginAnchored:true,clipboard:'https://shiyubox.com/'},null,2));
 await b.close();console.log('PASS current font, static content, screenshot fidelity, popup anchor, setup flows, scroll, no-JS');
})().catch(e=>{console.error(e);process.exit(1)});

