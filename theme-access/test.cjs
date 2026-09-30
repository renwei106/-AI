'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'shiyu-theme-test-'));process.env.SHIYU_THEME_ACCESS_STORE=path.join(directory,'state.json');const store=require('./store.cjs'),{policy}=require('./server.cjs');
test.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
test('theme order and membership use free entitlement, not paid plan availability',()=>{const result=policy([{id:'flow',enabled:true},{id:'base',enabled:true}],[{id:'free',entitlements:[{key:'theme-base',enabled:true},{key:'theme-flow',enabled:false}]},{id:'paid',entitlements:[{key:'theme-base',enabled:false},{key:'theme-flow',enabled:true}]}]);assert.deepEqual(result.items.map(x=>[x.id,x.memberOnly]),[['flow',true],['base',false]]);assert.equal(result.fallback,'base')});
test('each theme daily allowance uses a natural deadline and resets on the next day',()=>{let header;const visitor=store.visitor({headers:{}},{setHeader:(k,v)=>header=v});assert(header.includes('HttpOnly'));assert.equal(store.startPreview(visitor,'flow',1000),store.DAILY_MS);const flowStarted=store.updatePresence(visitor,'flow',true,1000);assert.equal(flowStarted.expiresAt,1000+store.DAILY_MS);const afterLeaving=store.updatePresence(visitor,'flow',false,2000);assert.equal(afterLeaving.remainingMs,store.DAILY_MS-1000);const otherStarted=store.updatePresence(visitor,'other',true,2000);assert.equal(otherStarted.expiresAt,2000+store.DAILY_MS);assert.equal(store.preview(visitor,'flow',3000).remainingMs,store.DAILY_MS-2000);assert.equal(store.preview(visitor,'other',3000).remainingMs,store.DAILY_MS-1000);assert.equal(store.preview(visitor,'flow',1000+store.DAILY_MS+1).expired,true);const nextDay=store.preview(visitor,'flow',86401000);assert.equal(nextDay.started,false);assert.equal(nextDay.remainingMs,store.DAILY_MS);const restarted=store.updatePresence(visitor,'flow',true,86401000);assert.equal(restarted.startedAt,86401000);assert.equal(restarted.firstStartedAt,1000)});
test('total trial keeps counting after the visitor leaves the theme',()=>{let header;const visitor=store.visitor({headers:{}},{setHeader:(k,v)=>header=v}),trial={mode:'total',value:2};const started=store.updatePresence(visitor,'future',true,1000,trial);assert.equal(started.remainingMs,2*86400000);const later=store.preview(visitor,'future',3601000,trial);assert.equal(later.remainingMs,2*86400000-3600000);assert.equal(later.active,false);assert.equal(store.preview(visitor,'future',2*86400000+1001,trial).expired,true)});
test('latest total rule uses the theme earliest start instead of the latest daily start',()=>{let header;const visitor=store.visitor({headers:{}},{setHeader:(k,v)=>header=v});store.updatePresence(visitor,'changing',true,1000,{mode:'daily',value:10});store.updatePresence(visitor,'changing',true,86401000,{mode:'daily',value:10});const total=store.preview(visitor,'changing',86401000,{mode:'total',value:3});assert.equal(total.firstStartedAt,1000);assert.equal(total.expiresAt,1000+3*86400000)});
test('server session rejects forged tokens and logout revokes the token',()=>{const token=store.issueSession('member-test');const req={headers:{cookie:'shiyu_user_session='+token}};assert.equal(store.session(req),'member-test');assert.equal(store.session({headers:{cookie:'shiyu_user_session=member-test'}}),null);store.logout(req);assert.equal(store.session(req),null)});

test('local preview origin follows its port while trial expiry and cross-origin protection remain enforced',async()=>{
  const http=require('node:http'),{handler}=require('./server.cjs');
  const upstream=http.createServer((req,res)=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(req.url.endsWith('/themes')?{items:[{id:'flow',enabled:true}],trial:{mode:'total',value:1}}:req.url.endsWith('/plans')?{items:[{id:'free',entitlements:[]}]}:{authenticated:false}));});
  await new Promise(resolve=>upstream.listen(0,'127.0.0.1',resolve));
  const previous=process.env.SHIYU_ADMIN_ORIGIN;process.env.SHIYU_ADMIN_ORIGIN=`http://127.0.0.1:${upstream.address().port}`;
  const app=http.createServer((req,res)=>handler(req,res));await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${app.address().port}`;
  const post=(suffix,source,cookie)=>fetch(origin+'/api/shiyu/theme-access/'+suffix,{method:'POST',headers:{origin:source,'Content-Type':'application/json',...(cookie?{cookie}:{})},body:JSON.stringify({theme:'flow',active:true})});
  try{
    const response=await post('preview',origin);assert.equal(response.status,200);assert.equal((await response.json()).preview.state.expired,false);
    const cookie=response.headers.get('set-cookie').split(';')[0];
    assert.equal((await post('presence',origin,cookie)).status,200);
    assert.equal((await post('preview','http://127.0.0.1:1',cookie)).status,403);
    assert.equal((await post('preview','https://untrusted.example',cookie)).status,403);
    const token=store.visitor({headers:{cookie}},{setHeader(){}});
    const state=JSON.parse(fs.readFileSync(process.env.SHIYU_THEME_ACCESS_STORE,'utf8'));
    // Advance the stored trial's start without changing the policy or wall clock.
    const shift=value=>{if(!value||typeof value!=='object')return;for(const key of Object.keys(value)){if(['startedAt','firstStartedAt'].includes(key)&&typeof value[key]==='number')value[key]-=2*86400000;else shift(value[key]);}};
    shift(state);fs.writeFileSync(process.env.SHIYU_THEME_ACCESS_STORE,JSON.stringify(state));
    assert.equal(store.preview(token,'flow',Date.now(),{mode:'total',value:1}).expired,true);
    const expired=await post('preview',origin,cookie);assert.equal(expired.status,403);assert.equal((await expired.json()).message,'当前会员主题体验已结束。');
  }finally{if(previous===undefined)delete process.env.SHIYU_ADMIN_ORIGIN;else process.env.SHIYU_ADMIN_ORIGIN=previous;await Promise.all([new Promise(r=>app.close(r)),new Promise(r=>upstream.close(r))]);}
});
