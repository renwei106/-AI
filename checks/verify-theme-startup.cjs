const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'theme-startup'),base='http://127.0.0.1:4318';
const colors={enabled:true,order:['#48614c','#45433c','#bd9055','#467ea5','#8b83d1','#ba794f','#a95e76','custom'],options:Object.fromEntries([['#48614c','#199b7b','翡翠绿'],['#45433c','#168fa3','碧潭青'],['#bd9055','#ce961f','琥珀金'],['#467ea5','#3578d4','澄海蓝'],['#8b83d1','#8755c7','鸢尾紫'],['#ba794f','#e27642','日光橙'],['#a95e76','#cc527a','莓果红'],['custom','','自定义配色']].map(([id,value,name])=>[id,{enabled:true,value,name}]))};
const themes={items:['base','music','cinema','cosmos','globe','flip','rain','paper','poly','flow'].map(id=>({id,enabled:true,allowed:true,memberOnly:false})),member:true,fallback:'base'};
let browser;
async function open({version='after',cache=false,delay=900,fail=false,color='#48614c',mode='light',storageBlocked=false}={}){
 const context=await browser.newContext({viewport:{width:1440,height:900},colorScheme:mode,reducedMotion:'reduce'});
 let live=structuredClone(colors);
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin!==base)return route.abort();
  if(url.pathname==='/api/shiyu/operations'){
   await new Promise(resolve=>setTimeout(resolve,delay));
   return route.fulfill({status:fail?503:200,contentType:'application/json',body:JSON.stringify({personalization:{colors:live},onboarding:{enabled:false}})}).catch(()=>{});
  }
  if(url.pathname==='/api/shiyu/auth/wechat/qr')return route.fulfill({status:200,contentType:'application/json',body:'{}'});
  if(url.pathname.startsWith('/api/'))return route.fulfill({status:url.pathname.startsWith('/api/shiyu/theme-access')?200:503,contentType:'application/json',body:JSON.stringify(url.pathname.startsWith('/api/shiyu/theme-access')?themes:{})});
  const filename=url.pathname==='/'?'index.html':url.pathname.slice(1);
  if(version==='before'&&['index.html','app.js','v4.js','feature-config.js'].includes(filename))return route.fulfill({path:path.join(root,'baselines/theme-startup-before-20261001',filename),contentType:filename.endsWith('.html')?'text/html':'application/javascript'});
  return route.continue();
 });
 await context.addInitScript(({cache,colors,color,mode,storageBlocked})=>{
  if(!sessionStorage.getItem('startup-seeded')){
   localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'base',mode,color,brandGuideDismissed:true,explicitFont:true,font:'sans'}}));
   if(cache)localStorage.setItem('shiyu-color-catalog-v1',JSON.stringify(colors));sessionStorage.setItem('startup-seeded','1');
  }
  if(storageBlocked){const get=Storage.prototype.getItem,set=Storage.prototype.setItem;Storage.prototype.getItem=function(key){if(key==='shiyu-color-catalog-v1')throw Error('blocked');return get.call(this,key)};Storage.prototype.setItem=function(key,value){if(key==='shiyu-color-catalog-v1')throw Error('blocked');return set.call(this,key,value)}}
  window.paintLog=[];
  const record=()=>{if(document.body&&document.querySelector('#main')?.childElementCount){const style=getComputedStyle(document.body);const row={accent:style.getPropertyValue('--accent').trim(),background:style.getPropertyValue('--bg').trim(),visible:style.visibility!=='hidden',pending:document.documentElement.dataset.colorPending==='true'};if(JSON.stringify(window.paintLog.at(-1))!==JSON.stringify(row))window.paintLog.push(row)}requestAnimationFrame(record)};requestAnimationFrame(record);
 },{cache,colors,color,mode,storageBlocked});
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base,{waitUntil:'domcontentloaded'});
 return {page,context,errors,setCatalog:value=>{live=value}};
}
const snapshot=page=>page.evaluate(()=>({accent:getComputedStyle(document.body).getPropertyValue('--accent').trim(),background:getComputedStyle(document.body).getPropertyValue('--bg').trim(),color:resolveThemeColor(),log:window.paintLog,cache:JSON.parse(localStorage.getItem('shiyu-color-catalog-v1')||'null')}));
(async()=>{
 fs.mkdirSync(out,{recursive:true});browser=await chromium.launch({channel:'msedge',headless:true});const results={};
 for(const version of ['before','after']){
  const {page,context}=await open({version,delay:1200});await page.waitForTimeout(1700);
  const value=await snapshot(page);results[version]=value.log;
  assert.equal(value.accent,'#199b7b');
  if(version==='before')assert(value.log.some(row=>row.visible&&row.accent==='#48614c'),'reproduced visible legacy flash');
  else{assert(!value.log.some(row=>row.visible&&row.accent==='#48614c'),'cold start does not paint legacy color');assert(value.cache.options['#48614c'].value==='#199b7b');
   await page.reload({waitUntil:'domcontentloaded'});await page.waitForTimeout(150);const warm=await snapshot(page);assert.equal(warm.accent,'#199b7b');assert(!warm.log.some(row=>row.visible&&row.accent!=='#199b7b'),'reload paints cached palette immediately');
  }
  await page.screenshot({path:path.join(out,`${version}-light.png`)});await context.close();
 }
 for(const mode of ['light','dark'])for(const id of colors.order.filter(id=>id!=='custom')){
  const {page,context,errors}=await open({cache:true,color:id,mode,delay:900});
  const expected=colors.options[id].value;
  await page.waitForTimeout(100);assert.equal((await snapshot(page)).accent,expected,`${mode}/${id} before API`);
  await page.waitForTimeout(1000);let state=await snapshot(page);assert(state.log.filter(row=>row.visible).every(row=>row.accent===expected));
  await page.evaluate(()=>{prefs.theme='music';render();prefs.theme='base';render()});assert.equal((await snapshot(page)).accent,expected,'theme entry uses same color source');
  if(id==='#48614c')await page.screenshot({path:path.join(out,`after-cached-${mode}.png`)});
  assert.deepEqual(errors,[]);await context.close();
 }
 // Offline starts and independent/custom colors use the same resolver.
 const {page,context,setCatalog,errors}=await open({cache:true,color:'#567890',fail:true});await page.waitForTimeout(1200);
 assert.equal((await snapshot(page)).accent,'#567890');
 await page.evaluate(()=>{view='space';prefs.spacePreferenceModes={color:'space'};prefs.spacePreferences={[spaceId]:{color:'#8b83d1'}};apply()});assert.equal((await snapshot(page)).accent,'#8755c7');
 await page.evaluate(()=>{view='home';render()});assert.equal((await snapshot(page)).accent,'#567890');assert.deepEqual(errors,[]);await context.close();
 const live=await open({cache:true,delay:0});await live.page.waitForTimeout(300);
 const updated=structuredClone(colors);updated.options['#48614c'].value='#21876b';live.setCatalog(updated);
 await live.page.evaluate(()=>window.ShiyuFeatureConfig.refresh());assert.equal((await snapshot(live.page)).accent,'#21876b');
 await live.page.reload({waitUntil:'domcontentloaded'});assert.equal((await snapshot(live.page)).accent,'#21876b','updated backend palette is cached');await live.context.close();
 for(const blocked of [false,true]){
  const offline=await open({fail:true,delay:0,storageBlocked:blocked});await offline.page.waitForTimeout(300);assert.equal(await offline.page.evaluate(()=>getComputedStyle(document.body).visibility),'visible');assert.deepEqual(offline.errors,[]);await offline.context.close();
 }
 const slow=await open({delay:6000});await slow.page.waitForTimeout(2400);assert.equal(await slow.page.evaluate(()=>getComputedStyle(document.body).visibility),'visible','timeout cannot leave blank desktop');await slow.context.close();
 fs.writeFileSync(path.join(out,'paint-log.json'),JSON.stringify(results,null,2));
 console.log('PASS: reproduced old flash; cold and cached reload, 7 palettes x light/dark, theme entry, custom/space colors, offline/blocked storage, backend updates, bounded timeout, no page errors.');
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
