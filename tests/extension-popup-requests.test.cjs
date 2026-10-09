// Actual popup/trial request functions with isolated runtime replies and a deterministic clock.
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const popup = fs.readFileSync(path.join(root, 'browser-extension-lab/popup.js'), 'utf8');
const trial = fs.readFileSync(path.join(root, 'browser-extension-lab/trial.js'), 'utf8');
const requestSource = popup.slice(popup.indexOf('const REQUEST_TIMEOUT_MS'), popup.indexOf('\nfunction status('));
const connectSource = popup.slice(popup.indexOf('let connectFlight'), popup.indexOf("\ndocument.querySelectorAll('.place-trigger')"));
const refreshSource = trial.slice(trial.indexOf('// Focus and periodic checks'), trial.indexOf('// Group navigation'));
const loadSource = trial.slice(trial.indexOf('async function load()'), trial.indexOf('\nfunction show('));
const signed = owner => ({signed:true, accountId:owner, spaces:[], theme:null});
const guest = () => ({signed:false, accountId:null, spaces:[], theme:null});
function fixture() {
  let clock = 0, nextTimer = 0, nextId = 0;
  const timers = new Map(), nodes = new Map();
  const f = { messages:[], replies:[], events:[], statuses:[], filters:0, loads:0, placeUpdates:0, intervals:[], focus:[] };
  const node = selector => { if (!nodes.has(selector)) nodes.set(selector, {hidden:false,disabled:false}); return nodes.get(selector); };
  const context = {
    preview:false, state:undefined, current:{url:'https://example.test/'}, draft:null, busy:false,
    crypto:{randomUUID:()=>'request-'+(++nextId)}, Map, Object, Array, JSON,
    setTimeout:(callback, delay)=>{const id=++nextTimer;timers.set(id,{callback,at:clock+delay,delay});return id;},
    clearTimeout:id=>timers.delete(id), setInterval:(callback,delay)=>{f.intervals.push({callback,delay});return f.intervals.length;},
    document:{hidden:false,body:{dataset:{ready:'true'},classList:{toggle(){}}},dispatchEvent:event=>f.events.push(event.type),addEventListener(){}},
    Event:class{constructor(type){this.type=type;}}, addEventListener:(type,callback)=>{if(type==='focus')f.focus.push(callback);},
    extensionApi:{runtime:{sendMessage:message=>{f.messages.push(JSON.parse(JSON.stringify(message)));return new Promise((resolve,reject)=>f.replies.push({resolve,reject}));}}},
    $:node, options(){f.placeUpdates++;}, fillScenes(){}, setDestinationLoading(){}, updateSave(){}, applyTheme(){}, status:(message,kind)=>f.statuses.push({message,kind}),
    filters(){f.filters++;},async load(){f.loads++;}
  };
  context.requestClient={send:message=>context.extensionApi.runtime.sendMessage(message)};
  context.window=context;
  const sandbox=vm.createContext(context);
  vm.runInContext(requestSource+'\n'+connectSource+'\nglobalThis.__popup={call,connect,getState:()=>state,setBusy:value=>busy=value};',sandbox);
  context.api=context.__popup;
  vm.runInContext(refreshSource+'\nglobalThis.__refresh=refreshAccount;',sandbox);
  f.api=context.__popup;f.refresh=context.__refresh;f.node=node;f.context=context;
  f.flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
  f.advance=async ms=>{
    const end=clock+ms;
    while(true){const due=[...timers.entries()].filter(([,timer])=>timer.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!due)break;clock=due[1].at;timers.delete(due[0]);due[1].callback();await f.flush();}
    clock=end;await f.flush();
  };
  f.reply=(at,value,ok=true)=>f.replies[at].resolve(ok?{ok:true,value}:{ok:false,error:value});
  f.timerDelays=()=>[...timers.values()].map(timer=>timer.delay);
  return f;
}
test('every runtime operation has an eight-second deadline, including mutations and tools',async()=>{
  for(const [type,extra] of [['state',{}],['save',{payload:{accountId:'a',url:'https://example.test/'}}],['move',{payload:{accountId:'a',id:'x'}}],['list',{payload:{accountId:'a'}}],['tool-records',{payload:{action:'save',accountId:'a',item:{id:'x'}}}],['tool-records',{payload:{action:'read',accountId:'a'}}],['open-url',{url:'https://example.test/'}],['version',{}]]){
    const f=fixture(),pending=f.api.call(type,extra),rejected=assert.rejects(pending,/读取超时/);
    assert.deepEqual(f.timerDelays(),[8000],type);await f.advance(7999);assert.equal(f.timerDelays().length,1);await f.advance(1);await rejected;assert.equal(f.timerDelays().length,0);
  }
});
test('identical concurrent mutation requests merge and a confirmed new attempt gets a new ID',async()=>{
  const f=fixture(),payload={accountId:'a',url:'https://example.test/',mode:'temporary'};
  const first=f.api.call('save',{payload}),second=f.api.call('save',{payload:{mode:'temporary',url:payload.url,accountId:'a'}});
  assert.equal(f.messages.length,1);assert.match(f.messages[0].requestId,/request-/);f.reply(0,{label:'稍后整理'});await Promise.all([first,second]);
  const third=f.api.call('save',{payload});assert.notEqual(f.messages[1].requestId,f.messages[0].requestId);f.reply(1,{duplicate:true});await third;
});
test('timed-out mutation retry retains its ID; a late reply cannot consume the retry',async()=>{
  const f=fixture(),payload={accountId:'a',id:'inbox-1',spaceId:'s',sceneId:'c',groupId:'g'};
  const first=f.api.call('move',{payload}),rejected=assert.rejects(first,/读取超时/);await f.advance(8000);await rejected;
  const retry=f.api.call('move',{payload});assert.equal(f.messages[1].requestId,f.messages[0].requestId);
  f.reply(0,{label:'late old response'});await f.flush();assert.equal(f.timerDelays().length,1);
  f.reply(1,{label:'confirmed retry'});assert.equal((await retry).label,'confirmed retry');assert.equal(f.timerDelays().length,0);
});
test('explicit failure can retry, with different owner/record UUIDs isolated',async()=>{
  const f=fixture(),payload={tool:'memo',action:'save',accountId:'a',revision:1,item:{id:'one',content:'same'}};
  const first=f.api.call('tool-records',{payload}),rejected=assert.rejects(first,/temporary failure/);f.reply(0,'temporary failure',false);await rejected;
  const retry=f.api.call('tool-records',{payload});assert.equal(f.messages[1].requestId,f.messages[0].requestId);f.reply(1,{revision:2});await retry;
  const differentRecord=f.api.call('tool-records',{payload:{...payload,item:{id:'two',content:'same'}}}),differentOwner=f.api.call('tool-records',{payload:{...payload,accountId:'b'}});
  assert.notEqual(f.messages[2].requestId,f.messages[3].requestId);f.reply(2,{});f.reply(3,{});await Promise.all([differentRecord,differentOwner]);
});

test('tool retries ignore only the UI timestamp while keeping every actual write field distinct',async()=>{
  const f=fixture(),payload={tool:'memo',action:'save',accountId:'a',revision:1,item:{id:'one',content:'same',updated:1}};
  const first=f.api.call('tool-records',{payload}),rejected=assert.rejects(first,/读取超时/);await f.advance(8000);await rejected;
  const retry=f.api.call('tool-records',{payload:{...payload,item:{...payload.item,updated:2}}});
  assert.equal(f.messages[1].requestId,f.messages[0].requestId);assert.equal(f.messages[1].payload.item.updated,2,'the original request payload stays intact');
  const changed=f.api.call('tool-records',{payload:{...payload,item:{...payload.item,content:'changed',updated:2}}});
  assert.notEqual(f.messages[2].requestId,f.messages[1].requestId);f.reply(1,{});f.reply(2,{});await Promise.all([retry,changed]);
});
test('connect is single-flight and old post-timeout guest cannot overwrite recovery',async()=>{
  const f=fixture(),first=f.api.connect(),same=f.api.connect({silent:true});assert.equal(first,same);assert.equal(f.messages.length,1);
  await f.advance(8000);await first;assert.equal(f.context.document.body.dataset.auth,'error');
  const retry=f.api.connect();f.reply(1,signed('b'));await retry;assert.equal(f.context.document.body.dataset.auth,'signed');
  f.reply(0,guest());await f.flush();assert.equal(f.context.document.body.dataset.auth,'signed');assert.equal(f.api.getState().accountId,'b');
});
test('unchanged silent verification preserves the current signed editor; owner change publishes once',async()=>{
  const f=fixture(),initial=f.api.connect();f.reply(0,signed('a'));await initial;f.events=[];f.statuses=[];f.placeUpdates=0;
  const unchanged=f.api.connect({silent:true});assert.equal(f.context.document.body.dataset.auth,'signed');f.reply(1,signed('a'));await unchanged;assert.equal(f.events.length,0);assert.equal(f.statuses.length,0);assert.equal(f.placeUpdates,0);
  const changed=f.api.connect({silent:true});f.reply(2,signed('b'));await changed;assert.equal(f.api.getState().accountId,'b');assert.deepEqual(f.events,['trial-auth-change']);
});
test('focus and polling share a single state read and one library refresh',async()=>{
  const f=fixture(),initial=f.api.connect();f.reply(0,signed('a'));await initial;
  f.node('#search-panel').hidden=false;const focus=f.refresh(true),poll=f.refresh();assert.equal(focus,poll);assert.equal(f.messages.length,2);
  f.reply(1,signed('a'));await Promise.all([focus,poll]);assert.equal(f.filters,1);assert.equal(f.loads,1);assert.equal(f.intervals.length,1);assert.equal(f.focus.length,1);
  const periodic=f.refresh();f.reply(2,signed('a'));await periodic;assert.equal(f.loads,1,'unchanged polling must not reopen an editor');
});
test('background checks skip a busy bookmark submission without changing auth state',async()=>{
  const f=fixture(),initial=f.api.connect();f.reply(0,signed('a'));await initial;f.api.setBusy(true);const count=f.messages.length;
  await f.refresh();assert.equal(f.messages.length,count);assert.equal(f.context.document.body.dataset.auth,'signed');
});

function libraryFixture() {
  const f=fixture();
  Object.assign(f.context,{rows:[],commonGroups:[],serial:0,owner:null,demoLoaded:false,render(){f.loads++;},__rows:()=>f.context.rows});
  f.node('#search-results').replaceChildren=()=>{f.cleared=true;};
  vm.runInContext(loadSource+'\nglobalThis.__load=load;',f.context);
  f.load=f.context.__load;
  return f;
}

test('late library failure cannot clear a newer successful read',async()=>{
  const f=libraryFixture(),initial=f.api.connect();f.reply(0,signed('a'));await initial;
  const old=f.load(),fresh=f.load();
  f.reply(2,{items:[{id:'fresh',url:'https://example.test/new'}],commonGroups:[]});await fresh;
  f.reply(1,'old failure',false);await old;
  assert.equal(f.context.rows[0].id,'fresh');assert.equal(f.loads,1);assert.equal(f.cleared,undefined);assert.notEqual(f.node('#search-summary').textContent,'old failure');
});

test('library response for a prior owner cannot publish after account switch',async()=>{
  const f=libraryFixture(),initial=f.api.connect();f.reply(0,signed('a'));await initial;
  const old=f.load(),changed=f.api.connect({silent:true});f.reply(2,signed('b'));await changed;
  f.reply(1,{items:[{id:'private-a'}],commonGroups:[]});await old;
  assert.equal(f.context.rows.length,0);assert.equal(f.loads,0);assert.equal(f.context.owner,null);
});
