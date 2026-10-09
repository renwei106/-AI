// Account hydration regressions using actual Store/integration/account functions, isolated memory/APIs.
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { randomUUID } = require('node:crypto');
const root = path.resolve(__dirname, '..'), KEY = 'yiyu-prototype-v1';
const clone = value => JSON.parse(JSON.stringify(value));
const lockQueues = new WeakMap();
function sharedLocks(local) {
  let queues = lockQueues.get(local); if (!queues) { queues = new Map(); lockQueues.set(local, queues); }
  return { async request(name, options, action) {
    if (typeof options === 'function') { action = options; options = {}; }
    const previous = queues.get(name) || Promise.resolve();
    let release, cancel;
    const done = new Promise(resolve => { release = resolve; });
    queues.set(name, previous.then(() => done));
    const signal = options?.signal;
    const aborted = new Promise((_, reject) => {
      cancel = () => { const error = new Error('Lock wait aborted'); error.name = 'AbortError'; reject(error); };
      if (signal?.aborted) cancel(); else signal?.addEventListener('abort', cancel, { once: true });
    });
    try { await Promise.race([previous, aborted]); if (signal?.aborted) throw Object.assign(new Error('Lock wait aborted'), { name: 'AbortError' }); return await action(); }
    finally { signal?.removeEventListener('abort', cancel); release(); }
  } };
}
const dataFor = owner => [{id:'s',name:owner,scenes:[{id:'c',name:'场景',groups:[{id:'g',name:'收藏',items:[]}]}]}];
const stateFor = owner => ({signed:true,data:dataFor(owner),prefs:{accountProfile:{id:owner,name:owner},accountDataUserId:owner,extensionInbox:[]},styles:{},overrides:{}});
const inputFor = (owner,suffix,mode='group') => ({accountId:owner,mode,title:suffix,url:'https://example.test/'+suffix,spaceId:'s',sceneId:'c',groupId:'g'});
const source=fs.readFileSync(path.join(root,'dist/account-access.js'),'utf8');
const accountPrefix=source.slice(0,source.indexOf('\n  async function login(button)'))+
  "\nwindow.__accountQa={verify:()=>refreshMembership(true),save:saveAccountData,load:loadAccountData,rawPersist,getState:()=>({signed,data,prefs}),markAccountReady,getEpoch:()=>extensionMutationEpoch,clearAccount,userPersist:()=>persist(),removeItem:url=>{for(const space of data)for(const scene of space.scenes)for(const group of scene.groups)group.items=group.items.filter(item=>item[1]!==url)}};\n})();";
function fixture({local=new Map([[KEY,JSON.stringify(stateFor('a'))]]),owner='a',server={a:dataFor('a'),b:dataFor('b')},staleGlobals=false}={}){
  const handlers=new Map(),timers=new Map();let timerId=0;
  const f={local,server,owner,requests:[],failPUT:false,holdGET:null,holdPUT:null,initialized:false};
  const saved=()=>JSON.parse(local.get(KEY)||'{}');
  const initial=staleGlobals?stateFor(owner):saved();
  const context={signed:initial.signed,data:clone(initial.data||dataFor(owner)),prefs:clone(initial.prefs||{}),
    styles:{},overrides:{},seed:dataFor('seed'),defaults:{},view:'home',spaceId:'s',sceneId:'c',transitionUntil:0,
    localStorage:{getItem:key=>local.has(key)?local.get(key):null,setItem:(key,value)=>local.set(key,String(value)),removeItem:key=>local.delete(key)},
    sessionStorage:{getItem:()=>null,setItem(){}},location:{hostname:'shiyubox.com',origin:'https://shiyubox.com',search:''},
    navigator:{locks:sharedLocks(local)},matchMedia:()=>({matches:false}),URL,URLSearchParams,Date,Map,Set,WeakSet,Object,Array,JSON,AbortController,AbortSignal,
    crypto:{randomUUID},CustomEvent:class{constructor(type,options={}){this.type=type;this.detail=options.detail}},
    setTimeout:(callback,delay)=>{const id=++timerId;timers.set(id,{callback,delay});return id},clearTimeout:id=>timers.delete(id),
    addEventListener:(type,fn)=>{if(!handlers.has(type))handlers.set(type,[]);handlers.get(type).push(fn)},
    dispatchEvent:event=>{for(const fn of handlers.get(event.type)||[])fn(event)},
    document:{documentElement:{classList:{remove(){},toggle(){}}},addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[],hidden:false},
    updateHeader(){},render(){},changeView(){},goSpace(){},navigationGesture(){},workspace(){},show(){},$(){return null},
    ACCOUNT_AVATARS:['fixture'],toast(){},console,
    fetch:async(url,options={})=>{
      const owner=f.owner,method=options.method||'GET',record={url,owner,method,body:options.body?JSON.parse(options.body):null};
      f.requests.push(record);
      const response=(body,ok=true)=>({ok,json:async()=>clone(body)});
      if(url==='/api/shiyu/auth/session')return response(owner?{authenticated:true,user:{id:owner,name:owner,member:false}}:{authenticated:false});
      if(url!=='/api/shiyu/auth/account')throw Error('Unexpected live API: '+url);
      if(method==='GET'){
        const body={userId:owner,data:clone(f.server[owner]||[])};
        if(f.holdGET){const hold=f.holdGET;f.holdGET=null;hold.started=true;return new Promise(resolve=>{hold.release=()=>resolve(response(body))})}
        return response(body);
      }
      assert.equal(method,'PUT');assert.equal(record.body.userId,owner);
      const finish=()=>{if(f.failPUT)return response({message:'isolated PUT failure'},false);f.server[owner]=clone(record.body.data);return response({ok:true,userId:owner})};
      if(f.holdPUT){const hold=f.holdPUT;f.holdPUT=null;hold.started=true;return new Promise(resolve=>{hold.release=()=>resolve(finish())})}
      return finish();
    }};
  context.window=context;context.globalThis=context;
  context.effective=()=>context.prefs;
  context.persist=()=>context.localStorage.setItem(KEY,JSON.stringify({signed:context.signed,data:context.data,prefs:context.prefs,styles:context.styles,overrides:context.overrides}));
  const sandbox=vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root,'dist/extension/store.js'),'utf8'),sandbox);
  vm.runInContext(fs.readFileSync(path.join(root,'dist/extension/account-sync.js'),'utf8'),sandbox);
  f.sync=context.ShiyuAccountSync;
  f.store=context.ShiyuExtensionStore;
  f.initialize=()=>{vm.runInContext(fs.readFileSync(path.join(root,'dist/extension/integration.js'),'utf8'),sandbox);vm.runInContext(accountPrefix,sandbox);f.api=context.__accountQa;f.initialized=true};
  f.state=()=>clone(f.initialized?f.api.getState():saved());f.saved=()=>clone(saved());f.pending=owner=>clone(f.store.pending(owner));
  f.clearTimers=()=>timers.clear();f.timers=timers;f.microtasks=async()=>{for(let i=0;i<12;i++)await Promise.resolve()};
  return f;
}
async function started(f,hold){for(let i=0;i<30&&!hold.started;i++)await f.microtasks();assert(hold.started,'Held request should start')}

test('cold group/inbox saves survive stale initialization, hydration, PUT and reload',async()=>{
  const f=fixture({staleGlobals:true});f.store.save(inputFor('a','cold-group'));f.store.save(inputFor('a','cold-inbox','temporary'));
  f.initialize();await f.api.verify();f.clearTimers();
  assert.equal(f.state().data[0].scenes[0].groups[0].items[0][1],'https://example.test/cold-group');
  assert.equal(f.saved().prefs.extensionInbox[0].item[1],'https://example.test/cold-inbox');
  assert.equal(f.pending('a').filter(x=>x.kind==='inbox').length,0);
  await f.api.save();assert.equal(f.server.a[0].scenes[0].groups[0].items[0][1],'https://example.test/cold-group');assert.equal(f.pending('a').length,0);
  const reloaded=fixture({local:f.local,server:f.server});reloaded.initialize();await reloaded.api.verify();
  assert.equal(reloaded.saved().data[0].scenes[0].groups[0].items[0][1],'https://example.test/cold-group');
  assert.equal(reloaded.saved().prefs.extensionInbox[0].item[1],'https://example.test/cold-inbox');
});

test('stale GET finishing after a save and successful PUT/ACK cannot erase that save',async()=>{
  const f=fixture();f.initialize();await f.api.verify();f.clearTimers();
  const hold={};f.holdGET=hold;const refreshing=f.api.verify();await started(f,hold);
  f.store.save(inputFor('a','during-get'));f.clearTimers();await f.api.save();assert.equal(f.pending('a').length,0);
  hold.release();await refreshing;
  assert.equal(f.state().data[0].scenes[0].groups[0].items[0][1],'https://example.test/during-get');
  assert.equal(f.saved().data[0].scenes[0].groups[0].items[0][1],'https://example.test/during-get');
});

test('PUT ACK removes only captured applied entries and retains concurrent new saves',async()=>{
  const f=fixture();f.initialize();await f.api.verify();f.clearTimers();f.store.save(inputFor('a','first'));f.clearTimers();
  const oldIds=f.pending('a').map(x=>x.id),hold={};f.holdPUT=hold;const saving=f.api.save();await started(f,hold);
  f.store.save(inputFor('a','second'));f.clearTimers();hold.release();await saving;
  assert.equal(f.pending('a').length,1);assert(!oldIds.includes(f.pending('a')[0].id));f.clearTimers();await f.api.save();
  assert.equal(f.pending('a').length,0);
  assert.deepEqual(f.server.a[0].scenes[0].groups[0].items.map(x=>x[1]),['https://example.test/first','https://example.test/second']);
});

test('failed PUT preserves bookmark/journal through hydration and does not loop retries',async()=>{
  const f=fixture();f.initialize();await f.api.verify();f.clearTimers();f.store.save(inputFor('a','failed-save'));f.clearTimers();f.failPUT=true;
  await f.api.save();assert.equal(f.pending('a').length,1);assert.equal(f.state().data[0].scenes[0].groups[0].items[0][1],'https://example.test/failed-save');
  assert.equal(f.timers.size,0,'Account-ready events must not retry the same failed entry every 350ms.');
  const reloaded=fixture({local:f.local,server:f.server});reloaded.initialize();await reloaded.api.verify();reloaded.clearTimers();await reloaded.api.save();
  assert.equal(reloaded.pending('a').length,0);assert.equal(reloaded.server.a[0].scenes[0].groups[0].items[0][1],'https://example.test/failed-save');
});

test('missing server destinations remain journaled without PUT loops',async()=>{
  const f=fixture();f.initialize();await f.api.verify();f.clearTimers();f.store.save(inputFor('a','removed-target'));f.clearTimers();
  f.server.a[0].scenes[0].groups=[];await f.api.verify();
  assert.equal(f.pending('a').length,1);assert.equal(f.requests.filter(x=>x.method==='PUT').length,0);assert.equal(f.timers.size,0);
});

test('account changes isolate group journals and preserve each owner local inbox',async()=>{
  const f=fixture();f.initialize();await f.api.verify();f.clearTimers();
  f.store.save(inputFor('a','a-inbox','temporary'));f.store.save(inputFor('a','a-group'));f.clearTimers();
  f.owner='b';await f.api.verify();assert.equal(f.state().prefs.accountProfile.id,'b');assert.deepEqual(f.state().prefs.extensionInbox,[]);
  assert.equal(f.pending('a').length,1);assert.equal(f.state().data[0].name,'b');assert.equal(f.state().data[0].scenes[0].groups[0].items.length,0);
  f.store.save(inputFor('b','b-inbox','temporary'));f.clearTimers();f.owner='a';await f.api.verify();
  assert.deepEqual(f.state().prefs.extensionInbox.map(x=>x.item[1]),['https://example.test/a-inbox']);
  f.clearTimers();await f.api.save();assert.equal(f.pending('a').length,0);assert.equal(f.server.b[0].scenes[0].groups[0].items.length,0);
  f.owner='b';await f.api.verify();assert.deepEqual(f.state().prefs.extensionInbox.map(x=>x.item[1]),['https://example.test/b-inbox']);
});

test('explicit deletion of an observed pending bookmark does not resurrect it after failed sync',async()=>{
  const f=fixture();f.initialize();await f.api.verify();f.clearTimers();f.store.save(inputFor('a','deleted'));f.clearTimers();f.failPUT=true;
  await f.api.save();assert.equal(f.pending('a').length,1);f.api.removeItem('https://example.test/deleted');f.api.userPersist();f.clearTimers();
  assert.equal(f.pending('a').length,0);assert.equal(f.saved().data[0].scenes[0].groups[0].items.length,0);
  f.failPUT=false;await f.api.save();await f.api.verify();assert.equal(f.server.a[0].scenes[0].groups[0].items.length,0);
});

test('a stale tab user persist retains an unobserved concurrent cold save journal',async()=>{
  const f=fixture();f.initialize();await f.api.verify();f.clearTimers();
  const otherTab=fixture({local:f.local,server:f.server});otherTab.store.save(inputFor('a','unobserved'));
  f.api.userPersist();f.clearTimers();assert.equal(f.pending('a').length,1);
  await f.api.save();assert.equal(f.pending('a').length,0);assert.equal(f.server.a[0].scenes[0].groups[0].items[0][1],'https://example.test/unobserved');
});

test('website writer reads after a shared lock wait and retains local edits plus acknowledged plugin additions',async()=>{
  const f=fixture();f.initialize();await f.api.verify();f.clearTimers();
  const other=fixture({local:f.local,server:f.server});let release,entered=false;
  const writing=other.sync.withLock('a',{deadline:Date.now()+8000},async()=>{entered=true;await new Promise(resolve=>{release=resolve})});
  await other.microtasks();assert(entered);
  const saving=f.api.save();await f.microtasks();
  assert.equal(f.requests.filter(request=>request.method==='PUT').length,0,'Website must wait for the other writer lock.');
  f.api.getState().data[0].scenes[0].groups[0].items.push(['Local edit','https://example.test/local-edit','','']);f.api.userPersist();
  other.store.save(inputFor('a','confirmed-plugin'));
  f.server.a=clone(other.saved().data);other.store.ackPending('a',other.pending('a').map(entry=>entry.id));
  release();await writing;await saving;f.clearTimers();
  assert.deepEqual(f.server.a[0].scenes[0].groups[0].items.map(item=>item[1]),['https://example.test/local-edit','https://example.test/confirmed-plugin']);
  assert.deepEqual(f.saved().data[0].scenes[0].groups[0].items.map(item=>item[1]),['https://example.test/local-edit','https://example.test/confirmed-plugin']);
});

test('move recovery survives a website GET that captured the former move and a fresh account hydration',async()=>{
  const f=fixture();f.initialize();await f.api.verify();f.clearTimers();
  f.store.save(inputFor('a','restored-move','temporary'));f.clearTimers();
  const original=clone(f.saved().prefs.extensionInbox[0]);
  f.store.move({accountId:'a',id:original.id,spaceId:'s',sceneId:'c',groupId:'g',confirmCloud:true});f.clearTimers();
  const oldMoveId=f.pending('a').find(entry=>entry.kind==='move').id;
  f.server.a[0].scenes[0].groups=[{id:'g2',name:'新的分组',items:[]}];
  const hold={};f.holdGET=hold;const hydrating=f.api.verify();await started(f,hold);
  const recovered=await f.sync.flush('a',{deadline:Date.now()+8000});
  assert(recovered.recoveredMoveIds.includes(oldMoveId));assert(!f.pending('a').some(entry=>entry.id===oldMoveId));
  hold.release();await hydrating;f.clearTimers();
  assert.deepEqual(f.saved().prefs.extensionInbox,[original],'A stale GET must not replay its captured move over the recovered inbox row.');
  await f.api.verify();f.clearTimers();
  assert.deepEqual(f.saved().prefs.extensionInbox,[original]);assert.equal(f.saved().data[0].scenes[0].groups[0].id,'g2');
  const reloaded=fixture({local:f.local,server:f.server});reloaded.initialize();await reloaded.api.verify();
  assert.deepEqual(reloaded.saved().prefs.extensionInbox,[original]);assert(!reloaded.pending('a').some(entry=>entry.id===oldMoveId));
  assert.equal(f.requests.filter(request=>request.method==='PUT').length,0,'Recovery and hydration must not resurrect the removed cloud destination.');
});
