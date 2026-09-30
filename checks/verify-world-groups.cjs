/* Isolated browser fixtures; no application data or configuration writes. */
process.env.SHIYU_PREVIEW_URL ||= 'http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture}=require('./verify-desktop-pet.cjs'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const f=await fixture(browser),p=f.page;
 f.operations.world={enabled:true,children:{resources:{website:true,creator:true},materials:{studio:true,palette:true,cutout:true,emoji:true}}};
 f.operations.platformCreators=[{id:'demo-up',name:'示例 UP',category:'AI',platform:'哔哩哔哩',status:'published',profileUrl:'https://example.test/up',avatarUrl:'',coverUrl:''}];
 const refresh=()=>p.evaluate(()=>ShiyuOperations.refresh());
 const route=async(section,id='',q='')=>{await p.evaluate(({section,id,q})=>{history.replaceState({},'','?page=world&section='+section+'&id='+id+'&q='+q);dispatchEvent(new PopStateEvent('popstate'))},{section,id,q})};
 const removed=async()=>{await p.locator('#shiyu-operations-dialog[open]').waitFor();assert.equal(await p.locator('#shiyu-operations-title').innerText(),'这个世界板块已下架');await p.waitForFunction(()=>!new URL(location.href).searchParams.has('page'))};
 await refresh();await route('materials');
 assert.equal(await p.locator('[data-tool-card]').count(),4);
 await p.evaluate(()=>{const card=document.querySelector('[data-tool-card="studio"]');window.staleTool=()=>card.onclick({target:card});window.toolOpens=0;window.open=()=>{window.toolOpens++}});
 f.operations.world.children.materials.studio=false;await refresh();
 assert.equal(await p.locator('[data-tool-card="studio"]').count(),0);assert.equal(await p.locator('[data-tool-card]').count(),3);
 await p.evaluate(()=>staleTool());assert.equal(await p.evaluate(()=>toolOpens),0,'a stale removed card cannot open a disabled child');
 for(const id of ['palette','cutout','emoji']){f.operations.world.children.materials[id]=false;await refresh();assert.equal(await p.locator(`[data-tool-card="${id}"]`).count(),0)}
 assert.equal(await p.locator('[data-tool-card]').count(),0);
 f.operations.world.children.materials.studio=true;await refresh();assert.equal(await p.locator('[data-tool-card]').count(),1);
 await p.locator('[data-destination="studio"]').click();assert.equal(await p.evaluate(()=>toolOpens),1);
 await route('resources');assert.equal(await p.locator('#world-websites,#world-creators').count(),2);
 f.operations.world.children.resources.website=false;await refresh();
 assert.equal(await p.locator('#world-websites,[data-w-jump="website"]').count(),0);assert.equal(await p.locator('#world-creators').count(),1);
 await route('resources','','DeepSeek');assert.equal(await p.locator('.world-resource').count(),0);
 await route('discover');assert.equal(await p.locator('.world-collection').count(),0);
 await route('resource-category','website:ai');await removed();
 await route('collection','ai-start');await removed();
 f.operations.world.children.resources={website:true,creator:false};await refresh();await route('resources');
 assert.equal(await p.locator('#world-websites').count(),1);assert.equal(await p.locator('#world-creators,[data-w-jump="creator"]').count(),0);
 await route('resources','','示例');assert.equal(await p.locator('.world-platform-creator').count(),0);
 await route('resource-category','creator:AI');await removed();
 f.operations.world.children.resources.creator=true;await refresh();await route('resource-category','creator:AI');
 assert.equal(await p.locator('.world-platform-creator').count(),1);
 f.operations.world.children.resources.creator=false;await refresh();await removed();
 f.operations.world.modules={resources:false,materials:false};f.operations.world.children.resources={website:true,creator:true};
 await refresh();assert.equal(await p.evaluate(()=>ShiyuOperations.childEnabled('resources','website')),false);
 await route('materials');await removed();
 assert.deepEqual(f.errors,[]);await f.context.close();
 console.log('PASS tool child visibility, stale callbacks, resource groups/search/discovery, child deep links, runtime removal, parent precedence');
 const views=[];const out=path.resolve(__dirname,'../.local/world-groups-review');fs.mkdirSync(out,{recursive:true});
 for(const before of [true,false]){
  const f=await fixture({newContext:async options=>{
   const ctx=await browser.newContext(options);
   if(before)for(const name of ['world.js','world-material-home.js'])await ctx.route('**/'+name+'*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.resolve(__dirname,'../baselines/world-groups-before-20260930',name),'utf8')}));
   return ctx;
  }}),p=f.page;
  for(const [width,mode]of [[1440,'light'],[390,'dark']]){
   await p.setViewportSize({width,height:960});await p.evaluate(mode=>{prefs.mode=mode;apply();ShiyuWorld.open()},mode);await p.locator('.world-nav [data-w-section="resources"]').click();await p.evaluate(()=>document.fonts.ready);
   const phase=before?'before':'after';await p.screenshot({path:path.join(out,`resources-${phase}-${mode}-${width}.png`)});
   views.push(await p.locator('.world-content').evaluate(e=>({html:e.innerHTML,box:e.getBoundingClientRect().toJSON(),font:getComputedStyle(e).fontFamily})));
   await p.locator('.world-home').click();
  }
  assert.deepEqual(f.errors,[]);await f.context.close();
 }
 assert.deepEqual(views[0],views[2]);assert.deepEqual(views[1],views[3]);
 console.log('PASS resource page all-enabled baseline unchanged on desktop/light and mobile/dark');
}finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});
