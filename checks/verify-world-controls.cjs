/* Uses intercepted API fixtures only; never changes local or production config. */
process.env.SHIYU_PREVIEW_URL ||= 'http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture,base}=require('./verify-desktop-pet.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../.local/world-controls-review');fs.mkdirSync(out,{recursive:true});
const defaults={discover:true,resources:true,learning:true,materials:true,creators:false,collaboration:true};
async function setup(browser,{world={enabled:true,modules:defaults},guest=false,baseline=false,delay=0,failed=false,worldHost=false}={}){
 const state={world,delay,failed};
 const f=await fixture({newContext:async options=>{
  const ctx=await browser.newContext(options);
  const originalRoute=ctx.route.bind(ctx);
  ctx.route=async(pattern,handler)=>originalRoute(pattern,async route=>{
   if(new URL(route.request().url()).pathname==='/api/shiyu/operations'){
    if(state.delay)await new Promise(resolve=>setTimeout(resolve,state.delay));
    return route.fulfill({status:state.failed?503:200,json:state.failed?{}:{world:state.world}});
   }
   return handler(route);
  });
  if(baseline)await originalRoute('**/world.js*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.resolve(__dirname,'../baselines/world-controls-before-20260930/world.js'),'utf8')}));
  if(worldHost){
   await originalRoute('https://shiyubox.com/**',r=>r.fulfill({contentType:'text/html',body:'<h1>Home</h1>'}));
   await originalRoute('https://world.shiyubox.com/**',async r=>{
    if(new URL(r.request().url()).pathname.startsWith('/api/'))return r.fallback();
    const u=new URL(r.request().url());const response=await ctx.request.get(base.replace(/\/$/,'')+u.pathname+u.search);await r.fulfill({response});
   });
  }
  return ctx;
 }},!guest);
 return {...f,state};
}
async function home(p){await p.waitForFunction(()=>!new URL(location.href).searchParams.has('page'));assert.equal(await p.locator('#world-page:visible').count(),0)}
async function removed(p,{dismiss='timer'}={}){
 await p.locator('#shiyu-operations-dialog[open]').waitFor();
 assert.equal(await p.locator('#shiyu-operations-title').innerText(),'这个世界板块已下架');
 assert.equal(await p.locator('#world-page .world-content a,#world-page .world-content button').count(),0);
 if(dismiss==='remove')await p.locator('#shiyu-operations-dialog').evaluate(d=>d.remove());
 if(dismiss==='escape')await p.keyboard.press('Escape');
 await home(p);
}
async function run(){const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const f=await setup(browser),p=f.page;
 await p.evaluate(()=>ShiyuWorld.open());await p.locator('#world-page:visible').waitFor();
 assert.deepEqual(await p.locator('.world-nav button').evaluateAll(es=>es.map(e=>e.dataset.wSection)),Object.keys(defaults).filter(k=>defaults[k]));
 await p.locator('.world-nav [data-w-section="materials"]').click();
 const scroll=await p.evaluate(()=>{const root=document.querySelector('#world-page');root.scrollTop=100;return root.scrollTop});
 await p.evaluate(()=>ShiyuOperations.refresh());
 assert.equal(await p.locator('#world-page').evaluate(e=>e.scrollTop),scroll,'config refresh preserves scroll');
 f.state.world={enabled:true,modules:{...defaults,materials:false}};
 await p.evaluate(()=>ShiyuOperations.refresh());await removed(p,{dismiss:'remove'});
 await p.evaluate(()=>ShiyuWorld.open());await p.locator('#world-page:visible').waitFor();
 assert.equal(await p.locator('[data-w-section="materials"]').count(),0,'nav and discovery entry hidden');
 await p.evaluate(()=>{ShiyuWorld.config.modules.materials.enabled=true;history.pushState({},'','?page=world&section=materials');dispatchEvent(new PopStateEvent('popstate'))});
 await removed(p,{dismiss:'escape'});
 // Every top-level tab and its child routes reject saved links, even for guests.
 for(const [module,section,id]of [['discover','discover',''],['resources','collection','ai-start'],['resources','resource-category','website:ai'],['learning','route','learn-ai'],['materials','materials',''],['creators','creator','slow'],['collaboration','project','open-ai']]){
  f.state.world={enabled:true,modules:{...defaults,[module]:false}};
  await p.goto(base+'?page=world&section='+section+'&id='+id,{waitUntil:'domcontentloaded'});await removed(p);
 }
 f.state.world={enabled:false,eligible:true,modules:defaults};
 await p.goto(base+'?page=world&section=materials',{waitUntil:'domcontentloaded'});await removed(p);
 assert(await p.locator('body').evaluate(e=>e.classList.contains('world-entry-disabled')));
 await p.evaluate(()=>ShiyuWorld.open());await removed(p);
 f.state.world={enabled:true,modules:{...defaults,discover:false}};
 await p.goto(base+'?page=world',{waitUntil:'networkidle'});
 assert.equal(await p.locator('#world-page').getAttribute('data-section'),'resources');
 assert.equal(await p.locator('.world-nav [data-w-section="discover"]').count(),0);
 f.state.world={enabled:true,modules:Object.fromEntries(Object.keys(defaults).map(k=>[k,false]))};
 await p.evaluate(()=>ShiyuOperations.refresh());await removed(p);
 assert.deepEqual(f.errors,[]);await f.context.close();
 console.log('PASS independent tabs, runtime removal, erased content, removed dialog, Escape, all child URLs, config tampering, all-off fallback');
 for(const guest of [true,false]){
  const f=await setup(browser,{guest,world:{enabled:false},delay:500});
  await f.page.goto(base+'?page=world&section=materials',{waitUntil:'domcontentloaded'});
  assert.equal(await f.page.locator('#world-page:visible').count(),0,'no content before config arrives');
  await removed(f.page);assert.deepEqual(f.errors,[]);await f.context.close();
 }
 const fail=await setup(browser,{failed:true});await fail.page.goto(base+'?page=world',{waitUntil:'domcontentloaded'});await fail.page.locator('#shiyu-operations-dialog[open]').waitFor();assert.match(await fail.page.locator('#shiyu-operations-title').innerText(),/暂时无法加载/);await home(fail.page);assert.deepEqual(fail.errors,[]);await fail.context.close();
 const host=await setup(browser,{guest:true,world:{enabled:false,eligible:true},worldHost:true});await host.page.goto('https://world.shiyubox.com/?section=materials',{waitUntil:'domcontentloaded'});await host.page.locator('#shiyu-operations-dialog[open]').waitFor();assert.equal(await host.page.locator('#shiyu-operations-title').innerText(),'这个世界板块已下架');await host.page.waitForURL('https://shiyubox.com/');assert.deepEqual(host.errors,[]);await host.context.close();
 console.log('PASS config loading, guest access, network error, dedicated world domain redirect');
 // Compare original and updated visible surfaces under identical theme/viewport.
 const snapshots=[];
 for(const baseline of [true,false]){
  const f=await setup(browser,{baseline}),p=f.page,phase=baseline?'before':'after';
  for(const mode of ['light','dark'])for(const width of [1440,390]){
   await p.setViewportSize({width,height:960});
   await p.evaluate(mode=>{prefs.mode=mode;apply();ShiyuWorld.open()},mode);
   await p.locator('.world-nav [data-w-section="materials"]').click();await p.evaluate(()=>document.fonts.ready);
   await p.screenshot({path:path.join(out,`${phase}-${mode}-${width}.png`)});
   snapshots.push({phase,mode,width,surface:await p.locator('#world-page').evaluate(root=>({html:root.querySelector('.world-content').innerHTML,nav:root.querySelector('.world-nav').innerHTML,bg:getComputedStyle(root).backgroundColor,font:getComputedStyle(root).fontFamily,accent:getComputedStyle(root).getPropertyValue('--accent'),box:root.getBoundingClientRect().toJSON()}))});
   await p.locator('.world-home').click();
  }
  assert.deepEqual(f.errors,[]);await f.context.close();
 }
 for(let i=0;i<4;i++)assert.deepEqual(snapshots[i].surface,snapshots[i+4].surface,'normal surface remains unchanged');
 fs.writeFileSync(path.join(out,'surfaces.json'),JSON.stringify(snapshots,null,2));
 console.log('PASS unchanged materials UI, light/dark, desktop/mobile');
}finally{await browser.close()}}
run().catch(e=>{console.error(e);process.exitCode=1});
