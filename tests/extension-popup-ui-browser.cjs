// Real DOM regression for the popup request layer. Runtime/storage are isolated in memory.
// The VM test checks the actual 8000 ms budget; this fixture accelerates only that timer.
const {chromium}=require(process.env.SHIYU_PLAYWRIGHT_MODULE||'C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
(async()=>{
 const root=path.resolve(__dirname,'..'),artifact=path.join(root,'.local');fs.mkdirSync(artifact,{recursive:true});
 const fixture=fs.mkdtempSync(path.join(artifact,'popup-request-ui-'));
 for(const name of ['popup.html','popup.js','popup.css','trial.js','trial.css','trial-apps.js','trial-schedule.js'])fs.copyFileSync(path.join(root,'browser-extension-lab',name),path.join(fixture,name));
 fs.writeFileSync(path.join(fixture,'local-client.js'),'export function attachLocalClient(api){return {send:message=>api.runtime.sendMessage(message)}}');
 const browser=await chromium.launch({channel:'msedge',headless:true,timeout:25000,args:['--allow-file-access-from-files']});
 try{
  const page=await browser.newPage({viewport:{width:520,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**/*',route=>route.abort());
  await page.addInitScript(()=>{
   const nativeTimeout=globalThis.setTimeout;globalThis.setTimeout=(fn,ms,...args)=>nativeTimeout(fn,ms===8000?250:ms,...args);
   const signed={signed:true,accountId:'fixture-a',spaces:[{id:'s',name:'空间',scenes:[{id:'c',name:'场景',groups:[{id:'g',name:'分组'}]}]}],theme:null};
   const state={requests:[],storage:{},pending:[],signed,holdState:false};globalThis.__fixture=state;
   const sendMessage=message=>{
    state.requests.push(structuredClone(message));
    if(message.type==='state'&&!state.holdState)return Promise.resolve({ok:true,value:state.signed});
    if(message.type==='version')return Promise.resolve({ok:true,value:{hasUpdate:false,current:'fixture'}});
    if(message.type==='list')return Promise.resolve({ok:true,value:{accountId:'fixture-a',items:[],commonGroups:[]}});
    if(message.type==='tool-records'&&message.payload.action==='read')return Promise.resolve({ok:true,value:{revision:1,data:{notes:[],calendarV2:{tasks:[],groups:[]}}}});
    return new Promise(resolve=>state.pending.push({message,resolve}));
   };
   globalThis.browser={runtime:{sendMessage},tabs:{query:async()=>[{id:1,url:'https://example.test/page',title:'Fixture title'}]},windows:{getCurrent:async()=>({id:1})},commands:{getAll:async()=>[]},storage:{local:{get:async key=>({[key]:state.storage[key]}),set:async values=>Object.assign(state.storage,structuredClone(values)),remove:async key=>{delete state.storage[key]}}}};
  });
  await page.goto(pathToFileURL(path.join(fixture,'popup.html')).href);
  await page.waitForFunction(()=>document.body.dataset.trialReady==='true'&&document.body.dataset.auth==='signed');
  await page.locator('#title').fill('保留的收藏草稿');await page.locator('#description').fill('不要清掉我的备注');
  await page.locator('#save-temporary').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('读取超时'));
  assert.equal(await page.locator('#editor').isDisabled(),false);assert.equal(await page.locator('#title').inputValue(),'保留的收藏草稿');
  assert.equal(await page.evaluate(()=>__fixture.storage.draft.description),'不要清掉我的备注');
  await page.locator('#save-temporary').click();
  const bookmarks=await page.evaluate(()=>__fixture.requests.filter(x=>x.type==='save'));assert.equal(bookmarks.length,2);assert.equal(bookmarks[0].requestId,bookmarks[1].requestId);
  await page.evaluate(()=>__fixture.pending.at(-1).resolve({ok:true,value:{label:'稍后整理'}}));
  await page.waitForFunction(()=>!document.querySelector('#save-result').hidden);assert.equal(await page.evaluate(()=>__fixture.storage.draft),undefined);
  await page.locator('#save-result button').click();
  await page.evaluate(()=>{__fixture.holdState=true;void window.trialApi.connect()});
  await page.waitForFunction(()=>document.body.dataset.auth==='error');
  await page.evaluate(()=>{__fixture.holdState=false;void window.trialApi.connect()});await page.waitForFunction(()=>document.body.dataset.auth==='signed');
  await page.evaluate(()=>__fixture.pending.find(x=>x.message.type==='state').resolve({ok:true,value:{signed:false,spaces:[]}}));
  assert.equal(await page.evaluate(()=>document.body.dataset.auth),'signed');
  for(const tool of ['memo','todo']){
   await page.locator(`[data-app=${tool}]`).click();
   const input=page.locator(tool==='memo'?'.record-compose textarea':'.record-compose>input');await input.fill(tool==='memo'?'保留的小记':'保留的待办');
   await page.locator('.record-compose [type=submit]').click();
   await page.waitForFunction(()=>document.querySelector('.record-status').textContent.includes('读取超时'));
   assert.equal(await input.inputValue(),tool==='memo'?'保留的小记':'保留的待办');
   await page.locator('.record-compose [type=submit]').click();
   const requests=await page.evaluate(tool=>__fixture.requests.filter(x=>x.type==='tool-records'&&x.payload.action==='save'&&x.payload.tool===tool),tool);
   assert.equal(requests.length,2);assert.equal(requests[0].payload.item.id,requests[1].payload.item.id);assert.equal(requests[0].requestId,requests[1].requestId);
   await page.evaluate(tool=>{const p=__fixture.pending.at(-1),item=p.message.payload.item;p.resolve({ok:true,value:{revision:2,data:tool==='memo'?{notes:[{...item,updatedAt:Date.now()}]}:{calendarV2:{tasks:[item],groups:[]}}}})},tool);
   await page.waitForFunction(()=>document.querySelector('.record-compose textarea,.record-compose>input').value==='');
   await page.locator(tool==='memo'?'.record-compose textarea':'.record-compose>input').fill('全新的另一条');await page.locator('.record-compose [type=submit]').click();
   const fresh=await page.evaluate(()=>__fixture.requests.at(-1));assert.notEqual(fresh.payload.item.id,requests[0].payload.item.id);assert.notEqual(fresh.requestId,requests[0].requestId);
   await page.evaluate(()=>__fixture.pending.at(-1).resolve({ok:false,error:'fixture failure'}));
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({pass:true,checks:['bookmark draft retained on timeout','same bookmark retry ID','draft cleared after confirmation','connect timeout and stale guest recovery','memo and todo retry retain UUID and request ID','confirmed new record gets new UUID'],fixture}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
