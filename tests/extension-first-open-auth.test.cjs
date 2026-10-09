// Execute the real worker, store, bridge and account sync with isolated ports,
// cookie-session/API fixtures and a deterministic clock. No MAIN injection or live accounts.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {randomUUID}=require('node:crypto');
const root=path.resolve(__dirname,'..'),key='yiyu-prototype-v1';
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const clone=value=>value===undefined?value:JSON.parse(JSON.stringify(value));
const background=read('browser-extension-lab/background.js')
 .replace(/^import \{ SITE_URLS \} from '.\/config\.js';/m,"const SITE_URLS=['https://shiyubox.com/'];")
 .replace(/^import \{ initialState \} from '.\/todo-calendar-core\.js';/m,'');
const calendar=read('browser-extension-lab/todo-calendar-core.js').replace(/^export /gm,'');
const spaceFor=owner=>[{id:'s',name:owner+'的空间',scenes:[{id:'c',name:'日常',groups:[{id:'g',name:'收藏',items:[]}]}]}];
const stateFor=owner=>({signed:true,data:spaceFor(owner),prefs:{accountProfile:{id:owner,name:owner},accountDataUserId:owner,color:'#345678',mode:'dark',extensionInbox:[]}});
const bookmark=(owner='account-a')=>({accountId:owner,mode:'group',title:'测试收藏',url:'https://example.test/a',description:'备注',spaceId:'s',sceneId:'c',groupId:'g'});

function fixture({pageState=stateFor('account-a'),cached={signed:true,accountId:'old-cache'},sessionUser={id:'account-a'},tabs=[]}={}){
 let clock=1_000_000,timerId=0,listener,onConnect,bridgeListener;
 const timers=new Map(),storage=new Map(pageState===null?[]:[[key,JSON.stringify(pageState)]]);
 const f={sessionUser,serverData:spaceFor(sessionUser?.id||'account-a'),tools:{},requests:[],localRequests:[],writes:[],events:[],created:[],injected:[],fetchHook:null,localHook:null,tabsHook:null,
  extensionStorage:{shiyuAccountState:clone(cached)},pageState:()=>JSON.parse(storage.get(key)||'null'),setPageState:value=>value===null?storage.delete(key):storage.set(key,JSON.stringify(value))};
 class ClockDate extends Date{constructor(...args){super(...(args.length?args:[clock]))}static now(){return clock}}
 const setTimeout=(fn,delay)=>{const id=++timerId;timers.set(id,{fn,at:clock+Math.max(0,Number(delay)||0),delay});return id},clearTimeout=id=>timers.delete(id);
 f.flush=async()=>{for(let i=0;i<80;i++)await Promise.resolve()};
 f.advance=async duration=>{const end=clock+duration;while(true){const next=[...timers].filter(([,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;clock=next[1].at;timers.delete(next[0]);next[1].fn();await f.flush()}clock=end;await f.flush()};
 f.now=()=>clock;f.timerDelays=()=>[...timers.values()].map(x=>x.delay);
 const json=(value,status=200)=>({ok:status>=200&&status<300,status,json:async()=>clone(value)});f.json=json;
 const fetch=async(url,options={},layer='worker')=>{
  const target=new URL(String(url),'https://shiyubox.com/'),entry={path:target.pathname,method:options.method||'GET',options,layer};f.requests.push(entry);
  assert.equal(options.credentials,layer==='worker'?'include':'same-origin');assert.equal(options.cache,'no-store');assert(options.signal instanceof AbortSignal);
  if(f.fetchHook){const intercepted=await f.fetchHook(entry);if(intercepted!==undefined)return intercepted}
  if(entry.path==='/api/shiyu/auth/session')return json(f.sessionUser?{authenticated:true,user:f.sessionUser}:{authenticated:false});
  if(entry.path==='/api/shiyu/auth/account'){
   if(entry.method==='PUT'){const body=JSON.parse(options.body);if(body.userId!==f.sessionUser?.id)return json({message:'wrong owner'},403);f.serverData=clone(body.data)}
   return json({userId:f.sessionUser?.id,data:f.serverData});
  }
  if(entry.path==='/api/shiyu/auth/tools'){
   if(entry.method==='POST'){const body=JSON.parse(options.body),doc=f.tools[body.tool];if(body.userId!==f.sessionUser?.id)return json({message:'wrong owner'},403);if(body.revision!==(doc?.revision||0))return json({message:'revision mismatch'},409);const saved={revision:(doc?.revision||0)+1,data:clone(body.data)};f.tools[body.tool]=saved;return json({userId:f.sessionUser?.id,...saved})}
   return json({userId:f.sessionUser?.id,tools:f.tools});
  }
  if(entry.path==='/extension/release.json')return json({latest:'1.0.9'});
  throw Error('Unexpected API request: '+entry.method+' '+entry.path);
 };
 f.stall=signal=>new Promise((_,reject)=>{const abort=()=>{const error=Error('aborted');error.name='AbortError';reject(error)};if(signal.aborted)abort();else signal.addEventListener('abort',abort,{once:true})});
 const page={URL,Date:ClockDate,console,structuredClone,AbortController,AbortSignal,crypto:{randomUUID},setTimeout,clearTimeout,
  navigator:{locks:{request:async(_name,options,action)=>{if(options.signal.aborted){const error=Error('aborted lock');error.name='AbortError';throw error}return action()}}},
  localStorage:{getItem:name=>storage.get(name)??null,setItem:(name,value)=>{f.writes.push({name,value:String(value)});storage.set(name,String(value))},removeItem:name=>storage.delete(name)},
  fetch:(url,options)=>fetch(url,options,'adapter'),CustomEvent:class{constructor(type,options={}){this.type=type;this.detail=options.detail}},
  dispatchEvent:event=>f.events.push(event.type),addEventListener:(type,fn)=>{if(type==='message')bridgeListener=fn}};
 page.window=page;page.globalThis=page;
 const pageContext=vm.createContext(page);
 for(const file of ['dist/extension/store.js','dist/extension/account-sync.js','dist/extension/bridge.js'])vm.runInContext(read(file),pageContext,{filename:file});
 f.store=page.ShiyuExtensionStore;
 const extensionId='test-extension',extensionURL=file=>'chrome-extension://'+extensionId+'/'+file;
 f.sender={id:extensionId,url:extensionURL('popup.html'),documentId:'popup-document'};
 const chrome={runtime:{id:extensionId,getURL:extensionURL,getManifest:()=>({version:'1.0.9'}),onMessage:{addListener:fn=>{listener=fn}},onConnect:{addListener:fn=>{onConnect=fn}},onInstalled:{addListener(){}},onStartup:{addListener(){}}},
  tabs:{query:async query=>f.tabsHook?f.tabsHook(query):clone(tabs),create:async value=>{f.created.push(value);return{id:99,...value}}},
  scripting:{executeScript:()=>{f.injected.push(true);throw Error('MAIN injection must never be used')}},
  action:{setPopup:async()=>{},onClicked:{addListener(){}}},sidePanel:{setPanelBehavior:async()=>{}},
  storage:{onChanged:{addListener(){}},local:{get:async name=>({[name]:f.extensionStorage[name]}),set:async values=>Object.assign(f.extensionStorage,clone(values))}}};
 const context=vm.createContext({chrome,navigator:{userAgent:'Chrome/140'},URL,Date:ClockDate,crypto:{randomUUID},AbortController,AbortSignal,structuredClone,setTimeout,clearTimeout,console,fetch:(url,options)=>fetch(url,options,'worker')});
 vm.runInContext(calendar,context,{filename:'todo-calendar-core.js'});vm.runInContext(background,context,{filename:'background.js'});
 f.connectPort=(sender=f.sender,id='fixture-client-1')=>{
  const messages=[],disconnects=[];const port={name:'shiyu-local-v1:'+id,sender,onMessage:{addListener:fn=>messages.push(fn)},onDisconnect:{addListener:fn=>disconnects.push(fn)},postMessage:message=>{
   f.localRequests.push(clone(message));
   const respond=response=>{for(const callback of messages)callback({type:'local-result',...clone(response)})};
   if(f.localHook&&f.localHook(message,respond)===true)return;
   const parent={postMessage:response=>respond(response)};page.parent=parent;
   bridgeListener({source:parent,origin:'chrome-extension://'+extensionId,data:{...clone(message),protocol:'shiyu-local-v1'}});
  }};
  onConnect(port);return{id,port,reply:response=>messages.forEach(fn=>fn(response)),disconnect:()=>disconnects.forEach(fn=>fn())};
 };
 f.client=f.connectPort();
 f.raw=(request,sender=f.sender)=>{let response;const keep=listener(request,sender,value=>{response=clone(value)});return{keep,response}};
 f.request=(request,sender=f.sender)=>new Promise((resolve,reject)=>{const keep=listener({clientId:f.client.id,...request},sender,response=>{response?.ok?resolve(clone(response.value)):reject(Error(response?.error||'No response'))});if(!keep)reject(Error('Request channel rejected'))});
 return f;
}

test('session is the sole identity authority: signed A and extension cache cannot hide cookie B',async()=>{
 const f=fixture({sessionUser:{id:'account-b',name:'B'},cached:{signed:true,accountId:'account-a'}});
 const state=await f.request({type:'state'});assert.equal(state.accountId,'account-b');assert.equal(f.pageState().prefs.accountProfile.id,'account-b');assert.equal(state.spaces[0].name,'account-b的空间');
 assert.equal(f.requests[0].path,'/api/shiyu/auth/session');assert.deepEqual(f.injected,[]);assert.deepEqual(f.created,[]);
 await assert.rejects(f.request({type:'save',requestId:'stale-a',payload:bookmark('account-a')}),/登录账号已变化/);
});

test('guest session completes without any bridge request or local mutation; signed prototype cannot save',async()=>{
 const f=fixture({sessionUser:null}),before=f.pageState();f.localHook=()=>{throw Error('guest must not access local bridge')};
 assert.equal((await f.request({type:'state'})).signed,false);assert.equal(f.localRequests.length,0);assert.deepEqual(f.pageState(),before);assert.equal(f.writes.length,0);
 await assert.rejects(f.request({type:'save',payload:bookmark()}),/登录账号已变化/);await assert.rejects(f.request({type:'save',payload:{...bookmark(),accountId:null}}),/请先登录/);assert.equal(f.localRequests.length,0);
});

test('cold state probes without writes, GET-hydrates account data, and neither PUTs nor opens tabs',async()=>{
 const f=fixture({pageState:null});let inspected=false;
 f.fetchHook=entry=>{if(entry.path==='/api/shiyu/auth/account'){assert.equal(f.pageState(),null);assert.equal(f.writes.length,0);inspected=true}};
 const state=await f.request({type:'state'});assert(inspected);assert.equal(state.signed,true);assert.equal(state.accountId,'account-a');assert.equal(state.spaces[0].name,'account-a的空间');
 assert.deepEqual(f.localRequests.map(x=>x.op),['state','state']);
 assert.deepEqual(f.requests.filter(x=>x.layer==='worker').map(x=>x.method+' '+x.path),['GET /api/shiyu/auth/session','GET /api/shiyu/auth/account']);
 assert.deepEqual(f.requests.filter(x=>x.layer==='adapter').map(x=>x.method+' '+x.path),['GET /api/shiyu/auth/session','GET /api/shiyu/auth/session'],'each local request independently verifies the cookie owner');
 assert.equal(f.store.pending('account-a').length,0);assert.deepEqual(f.created,[]);assert.deepEqual(f.injected,[]);
});

test('ready local account state preserves unsynchronized edits and never rehydrates its graph',async()=>{
 const local=stateFor('account-a');local.data[0].scenes[0].groups[0].items.push(['本地未同步','https://example.test/local','','']);
 const f=fixture({pageState:local});await f.request({type:'state'});
 assert.equal(f.pageState().data[0].scenes[0].groups[0].items.length,1);
 assert.deepEqual(f.requests.filter(x=>x.layer==='worker').map(x=>x.path),['/api/shiyu/auth/session']);
 assert.deepEqual(f.requests.filter(x=>x.layer==='adapter').map(x=>x.path),['/api/shiyu/auth/session']);
});

test('cold account hydration rejects mismatching server owner before any local write',async()=>{
 const f=fixture({pageState:null});f.fetchHook=entry=>entry.path==='/api/shiyu/auth/account'?f.json({userId:'account-b',data:spaceFor('account-b')}):undefined;
 await assert.rejects(f.request({type:'state'}),/登录账号已变化/);assert.equal(f.writes.length,0);assert.equal(f.pageState(),null);
});

test('six-second deadline aborts fetch and a later retry recovers without stale cached identity',async()=>{
 const f=fixture({pageState:null});let signal;
 f.fetchHook=entry=>{signal=entry.options.signal;return f.stall(signal)};
 const pending=f.request({type:'state'}),rejected=assert.rejects(pending,/读取超时/);await f.flush();assert.equal(signal.aborted,false);await f.advance(5999);assert.equal(signal.aborted,false);await f.advance(1);await rejected;assert.equal(signal.aborted,true);assert.equal(f.pageState(),null);
 f.fetchHook=null;f.sessionUser={id:'account-b'};f.serverData=spaceFor('account-b');assert.equal((await f.request({type:'state'})).accountId,'account-b');
});

test('total deadline includes stalled tab metadata and stalled adapter, and disconnect is bounded',async()=>{
 const f=fixture();f.tabsHook=()=>new Promise(()=>{});let pending=f.request({type:'state'}),rejected=assert.rejects(pending,/读取超时/);await f.flush();await f.advance(6000);await rejected;assert.equal(f.requests.length,0);
 f.tabsHook=null;f.localHook=()=>true;pending=f.request({type:'state'});rejected=assert.rejects(pending,/读取超时/);await f.flush();await f.advance(6000);await rejected;
 pending=f.request({type:'state'});rejected=assert.rejects(pending,/窗口已关闭/);await f.flush();f.client.disconnect();await rejected;
});

test('foreign sender, unknown port, mismatching client/document and forged local responses cannot use APIs',async()=>{
 const f=fixture(),foreign={id:'foreign',url:'https://evil.test/',documentId:'foreign-document'};
 const foreignPort=f.connectPort(foreign,'foreign-client');
 assert.deepEqual(f.raw({clientId:f.client.id,type:'state'},foreign),{keep:false,response:undefined});
 for(const clientId of ['unknown-client',foreignPort.id]){const result=f.raw({clientId,type:'state'});assert.equal(result.keep,false);assert.equal(result.response.ok,false)}
 const altered=f.raw({clientId:f.client.id,type:'state'},{...f.sender,documentId:'another-document'});assert.equal(altered.keep,false);
 const otherUrl=f.raw({clientId:f.client.id,type:'state'},{...f.sender,url:'chrome-extension://test-extension/settings.html'});assert.equal(otherUrl.keep,false);
 assert.equal(f.requests.length,0);assert.equal(f.localRequests.length,0);
 f.localHook=()=>true;const pending=f.request({type:'state'});await f.flush();f.client.reply({type:'local-result',id:'forged-id',ok:true,value:{signed:true,accountId:'attacker'}});const rejected=assert.rejects(pending,/读取超时/);await f.advance(6000);await rejected;
});

test('first-open state, grouped save, search, list and inbox move use ports plus actual store/sync',async()=>{
 const f=fixture();assert.equal((await f.request({type:'state'})).accountId,'account-a');
 const saved=await f.request({type:'save',requestId:'group-save-1',payload:bookmark()});assert.equal(saved.label,'account-a的空间 / 日常 / 收藏');assert.equal(f.serverData[0].scenes[0].groups[0].items[0][1],bookmark().url);assert.equal(f.store.pending('account-a').length,0);
 assert.equal((await f.request({type:'search',payload:{accountId:'account-a',query:'测试收藏'}})).total,1);assert.equal((await f.request({type:'list',payload:{accountId:'account-a'}})).items.length,1);
 await f.request({type:'save',requestId:'inbox-save-1',payload:{...bookmark(),mode:'temporary',url:'https://example.test/inbox'}});const inboxId=f.pageState().prefs.extensionInbox[0].id;
 await f.request({type:'move',requestId:'move-save-1',payload:{...bookmark(),id:inboxId}});assert.equal(f.pageState().prefs.extensionInbox.length,0);assert.equal(f.serverData[0].scenes[0].groups[0].items.length,2);assert.deepEqual(f.created,[]);assert.deepEqual(f.injected,[]);
});

test('same mutation request ID shares flight, deduplicates success, rejects changed payload and isolates accounts',async()=>{
 const f=fixture();let release;
 f.localHook=(message,respond)=>{if(message.op!=='save')return;release=()=>respond({id:message.id,ok:true,value:{label:'fixture'}});return true};
 const request={type:'save',requestId:'same-intent',payload:{...bookmark(),mode:'temporary'}},first=f.request(request),second=f.request(clone(request));await f.flush();assert.equal(f.localRequests.filter(x=>x.op==='save').length,1);release();assert.deepEqual(await first,await second);
 await f.request(clone(request));assert.equal(f.localRequests.filter(x=>x.op==='save').length,1);await assert.rejects(f.request({...request,payload:{...request.payload,title:'changed'}}),/请求内容已变化/);
 f.sessionUser={id:'account-b'};f.serverData=spaceFor('account-b');const other=f.request({...request,payload:{...request.payload,accountId:'account-b'}});await f.flush();assert.equal(f.localRequests.filter(x=>x.op==='save').length,2);release();await other;
});

test('failed mutation is not cached and can retry the same request ID',async()=>{
 const f=fixture();let attempt=0;f.localHook=(message,respond)=>{if(message.op!=='save')return;attempt++;respond({id:message.id,ok:attempt>1,error:'temporary failure',value:{label:'retry confirmed'}});return true};
 const request={type:'save',requestId:'retry-intent',payload:{...bookmark(),mode:'temporary'}};await assert.rejects(f.request(request),/temporary failure/);assert.equal((await f.request(request)).label,'retry confirmed');assert.equal(attempt,2);
});

test('direct memo and todo APIs preserve revision, owner, and stored record identity without adapter access',async()=>{
 const f=fixture();f.localHook=()=>{throw Error('tools must not use local bridge')};
 for(const tool of ['memo','todo']){
  assert.equal((await f.request({type:'tool-records',payload:{tool,action:'read',accountId:'account-a'}})).revision,0);
  const item=tool==='memo'?{id:'memo-1',content:'测试小记',updated:12}:{id:'todo-1',title:'测试待办',date:'',priority:2,done:false,groupId:'',start:null,duration:30,dateEnd:''};
  const result=await f.request({type:'tool-records',requestId:tool+'-save',payload:{tool,action:'save',accountId:'account-a',revision:0,item}});assert.equal(result.revision,1);assert.equal((tool==='memo'?result.data.notes:result.data.calendarV2.tasks)[0].id,item.id);
 }
 assert.equal(f.localRequests.length,0);assert.equal(f.requests.filter(x=>x.method==='POST').length,2);f.sessionUser={id:'account-b'};await assert.rejects(f.request({type:'tool-records',payload:{tool:'memo',action:'read',accountId:'account-a'}}),/登录账号已变化/);
});

test('tool POST committed before timeout is confirmed by same ID and fields on retry without a duplicate write',async()=>{
 for(const tool of ['memo','todo']){
  const f=fixture();let lost=true;
  f.fetchHook=entry=>{if(entry.path!=='/api/shiyu/auth/tools'||entry.method!=='POST'||!lost)return;lost=false;const body=JSON.parse(entry.options.body);f.tools[tool]={revision:1,data:clone(body.data)};return f.stall(entry.options.signal)};
  const item=tool==='memo'?{id:'lost-note',content:'成功但响应丢失',updated:1}:{id:'lost-task',title:'成功但响应丢失',date:'',priority:1,done:false,groupId:'',start:null,duration:30,dateEnd:''};
  const request={type:'tool-records',requestId:'lost-response',payload:{tool,action:'save',accountId:'account-a',revision:0,item}},first=f.request(request),rejected=assert.rejects(first,/读取超时/);await f.flush();assert.equal(f.tools[tool].revision,1);await f.advance(6000);await rejected;await f.flush();
  const result=await f.request({...request,payload:{...request.payload,item:{...item,updated:2}}});const records=tool==='memo'?result.data.notes:result.data.calendarV2.tasks;
  assert.equal(result.revision,1);assert.equal(records.length,1);assert.equal(records[0].id,item.id);assert.equal(f.requests.filter(x=>x.method==='POST').length,1);assert.equal(f.localRequests.length,0);
  await assert.rejects(f.request({...request,requestId:'different-item',payload:{...request.payload,item:{...item,id:item.id+'-other'}}}),/内容已在其他页面更新/);
 }
});

test('tool revision mismatch does not accept different written fields, archived IDs or foreign API owner',async()=>{
 const f=fixture();f.tools.memo={revision:2,data:{lastNumber:1,notes:[{id:'note',content:'server content',number:1}]}};
 await assert.rejects(f.request({type:'tool-records',payload:{tool:'memo',action:'save',accountId:'account-a',revision:1,item:{id:'note',content:'different'}}}),/内容已在其他页面更新/);
 f.tools.memo.data.notes[0].archivedAt=1;await assert.rejects(f.request({type:'tool-records',payload:{tool:'memo',action:'save',accountId:'account-a',revision:1,item:{id:'note',content:'server content'}}}),/内容已在其他页面更新/);
 f.fetchHook=entry=>entry.path==='/api/shiyu/auth/tools'?f.json({userId:'account-b',tools:{}}):undefined;await assert.rejects(f.request({type:'tool-records',payload:{tool:'memo',action:'read',accountId:'account-a'}}),/登录账号已变化/);assert.equal(f.requests.filter(x=>x.method==='POST').length,0);
});
