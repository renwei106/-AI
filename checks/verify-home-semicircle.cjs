const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const origin=process.env.ORBIT_TEST_ORIGIN||'http://127.0.0.1:4336';
const out=path.resolve('.local/home-semicircle-20260926');fs.mkdirSync(out,{recursive:true});
const allModules=['common','memo','todo'];
const frame=p=>p.frameLocator('#corner-orbit-demo');
const selected=p=>frame(p).locator('.menu-item.is-selected').getAttribute('data-shiyu-module-icon');
async function hoverCore(p){await p.bringToFront();const r=await frame(p).locator('.core').boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2,{steps:5});}
async function open(p){await p.mouse.move(40,200);await p.waitForTimeout(150);await hoverCore(p);try{await frame(p).locator('.stage.is-filled').waitFor();}catch(error){await p.screenshot({path:path.join(out,'failure.png')});console.log('failure stage',await frame(p).locator('.stage').evaluate(e=>({class:e.className,hover:[...document.querySelectorAll(':hover')].map(e=>e.className),core:e.querySelector('.core').getBoundingClientRect().toJSON()})));throw error;}await p.waitForTimeout(750);}
async function setup(b,{width=1440,height=960,modules=allModules,baseline=false,reducedMotion='no-preference'}={}){
 const p=await b.newPage({viewport:{width,height},reducedMotion});
 p.setDefaultTimeout(10000);
 await p.route('**/api/shiyu/**',r=>r.fulfill({status:200,json:r.request().url().endsWith('/operations')?{corner:{modules:allModules.map(id=>({id,enabled:modules.includes(id)}))}}:{}}));
 if(baseline)await p.route('**/corner.js*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(out,'corner.before.js'),'utf8')}));
 await p.goto(origin,{waitUntil:'domcontentloaded'});
 await p.evaluate(()=>{prefs.theme='base';prefs.mode='light';prefs.brandGuideDismissed=true;render()});
 await p.waitForSelector('#corner-orbit-demo[data-theme-ready=true]');await p.mouse.move(40,200);await p.waitForTimeout(700);
 return p;
}
async function geometry(p){return frame(p).locator('.stage').evaluate(stage=>{
 const r=stage.getBoundingClientRect(),cx=r.x+r.width/2,cy=r.y+r.height/2;
 return {cx,cy,width:innerWidth,items:[...stage.querySelectorAll('.menu-item:not([hidden])')].map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {label:e.textContent.trim(),selected:e.classList.contains('is-selected'),x:r.x+r.width/2-cx,y:r.y+r.height/2-cy,left:r.left,right:r.right,top:r.top,opacity:+s.opacity,transform:s.transform,icon:e.querySelector('svg').innerHTML}})};
});}
async function stablePage(p){return p.evaluate(()=>{
 const selectors=['header','.hero','.search-box','#dock','.core'];
 const snap=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {x:r.x,y:r.y,w:r.width,h:r.height,font:s.fontFamily,color:s.color,background:s.backgroundColor,text:el.textContent}};
 return {main:selectors.slice(0,4).map(s=>{const e=document.querySelector(s);return e?snap(e):null}),core:snap(document.querySelector('#corner-orbit-demo').contentDocument.querySelector('.core'))};
});}
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});const errors=[];b.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));try{
 const p=await setup(b),base=await setup(b,{baseline:true});
 const before=await stablePage(base),after=await stablePage(p);
 assert.deepEqual(after.main,before.main,'unrelated home layout remains unchanged');
 for(const key of ['font','color','background','text'])assert.equal(after.core[key],before.core[key],'idle core '+key);
 for(const key of ['w','h'])assert(Math.abs(after.core[key]-before.core[key])<2,'idle core geometry '+key);
 await p.screenshot({path:path.join(out,'after-idle.png')});
 await hoverCore(p);await p.waitForTimeout(800);assert.equal(await frame(p).locator('.is-filled').count(),0);
 assert((await geometry(p)).items.every(x=>x.opacity===0),'no options before fill completes');
 await p.screenshot({path:path.join(out,'after-filling.png')});
 await frame(p).locator('.stage.is-filled').waitFor();await p.waitForTimeout(750);
 let g=await geometry(p),sorted=g.items.toSorted((a,b)=>a.x-b.x);
 assert.equal(sorted.length,3);assert.equal(g.items.filter(x=>x.selected).length,1);
 assert(Math.abs(sorted[0].y)<1&&Math.abs(sorted[2].y)<1,'arc endpoints span 180 degrees');
 assert(Math.abs(sorted[0].x+sorted[2].x)<1,'symmetric endpoints');
 assert(Math.abs(sorted[1].x)<1&&sorted[1].y<-80&&sorted[1].selected,'selected item is centered above the core');
 assert.equal(new Set(g.items.map(x=>x.icon)).size,3,'each module has its own line icon');
 assert(g.items.every(x=>x.opacity===1&&x.left>=0&&x.right<=g.width&&x.top>=0));
 await p.screenshot({path:path.join(out,'after-expanded.png')});
 console.log('PASS fill sequence and geometry');
 const initial=await selected(p);assert.equal(initial,'common-line');
 await frame(p).locator('.stage').dispatchEvent('wheel',{deltaY:120,ctrlKey:true});assert.equal(await selected(p),initial,'zoom gesture preserves selection');
 await p.mouse.wheel(0,120);await p.waitForTimeout(110);await p.screenshot({path:path.join(out,'after-wheel-mid.png')});
 assert.equal(await selected(p),'memo-line');await p.waitForTimeout(550);
 assert(Math.abs((await geometry(p)).items.find(x=>x.selected).x)<1);
 await p.mouse.wheel(0,-120);await p.waitForTimeout(550);assert.equal(await selected(p),initial);
 for(let i=0;i<7;i++)await p.mouse.wheel(0,120);await p.waitForTimeout(650);assert.equal(await selected(p),'memo-line');
 for(let i=0;i<7;i++)await p.mouse.wheel(0,-120);await p.waitForTimeout(650);assert.equal(await selected(p),initial);
 console.log('PASS rapid wheel');
 // Small trackpad deltas accumulate, and direction reversal stays responsive.
 for(let i=0;i<7;i++)await frame(p).locator('.stage').dispatchEvent('wheel',{deltaY:4});
 await p.waitForTimeout(550);assert.equal(await selected(p),'memo-line');
 for(let i=0;i<7;i++)await frame(p).locator('.stage').dispatchEvent('wheel',{deltaY:-4});
 await p.waitForTimeout(550);assert.equal(await selected(p),initial);
 const scrollBefore=await p.evaluate(()=>({view,scrollY}));await p.mouse.wheel(0,120);await p.waitForTimeout(550);
 assert.deepEqual(await p.evaluate(()=>({view,scrollY})),scrollBefore,'menu wheel does not scroll or navigate the home');
 await p.mouse.move(40,200);await p.waitForTimeout(950);assert.equal(await frame(p).locator('.is-filled').count(),0);
 assert((await geometry(p)).items.every(x=>x.opacity===0));
 await open(p);assert.equal(await selected(p),'memo-line','selection survives collapse');
 await p.reload({waitUntil:'domcontentloaded'});await p.waitForSelector('#corner-orbit-demo[data-theme-ready=true]');await open(p);assert.equal(await selected(p),'memo-line','selection survives reload');
 console.log('PASS trackpad and remembered selection');
 // Real button hit testing, plus the existing guest login gate.
 let r=await frame(p).locator('.menu-item[data-shiyu-module-icon="todo-line"]').boundingBox();await p.mouse.click(r.x+r.width/2,r.y+r.height/2);await p.waitForSelector('#login[open]');
 assert.equal(await p.locator('#my-corner[open]').count(),0);await p.evaluate(()=>document.querySelector('#login').close());
 await p.evaluate(()=>{signed=true;prefs.accountProfile={id:'orbit-qa'};});await open(p);
 r=await frame(p).locator('.core-hit').boundingBox();await p.mouse.click(r.x+r.width/2,r.y+r.height/2);
 await p.waitForSelector('#my-corner[open][data-corner-module="todo"]');
 console.log('PASS login and core click');
 await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('#my-corner').open);
 // Same theme/viewport in the unchanged space entry, compared to the saved baseline.
 await p.close();await base.close();const spaceStyles=[];
 for(const baseline of [false,true]){const page=await setup(b,{baseline});await page.evaluate(()=>{signed=true;prefs.workspaceGuideDoneV1=true;goSpace(data[0].id)});await page.waitForTimeout(1500);await open(page);assert.equal(await frame(page).locator('.is-home-fan').count(),0);spaceStyles.push(await frame(page).locator('.menu-item').first().evaluate(e=>{const s=getComputedStyle(e);return {mask:s.mask,background:s.backgroundColor,width:s.width}}));await page.close();}
 assert.deepEqual(spaceStyles[0],spaceStyles[1]);console.log('PASS baseline, fill timing, 180-degree geometry, icons, wheel/reversal/rapid input, persistence, login, selected core action and unchanged space menu');
 for(const width of [320,390,768,1440]){
   const page=await setup(b,{width,height:844,reducedMotion:width===320?'reduce':'no-preference'});await open(page);
   const geo=await geometry(page);assert(geo.items.every(x=>x.left>=0&&x.right<=geo.width&&x.top>=0),'bounded menu at '+width);
   await page.screenshot({path:path.join(out,'after-'+width+'-light.png')});
   await page.mouse.move(10,200);await page.evaluate(()=>{prefs.mode='dark';prefs.explicitColor='#ad704b';prefs.color='#ad704b';apply()});await open(page);
   assert.equal(await frame(page).locator('html').evaluate(e=>getComputedStyle(e).getPropertyValue('--orbit-accent').trim()),await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()));
   await page.screenshot({path:path.join(out,'after-'+width+'-dark.png')});await page.close();
 }
 for(const modules of [['common'],['common','todo']]){const page=await setup(b,{modules});await open(page);const geo=await geometry(page);assert.equal(geo.items.length,modules.length);assert.equal(geo.items.filter(x=>x.selected).length,1);if(modules.length===1)assert.equal(geo.items[0].opacity,0);else assert(Math.abs(geo.items[0].x+geo.items[1].x)<1);await page.close();}
 assert.deepEqual(errors,[]);console.log('PASS light/dark and theme accent, 320/390/768/1440 viewports, reduced motion, 1/2 modules and no browser errors');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
