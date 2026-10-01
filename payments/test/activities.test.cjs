'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), crypto = require('node:crypto'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { Worker } = require('node:worker_threads');
const { PaymentStore } = require('../store.cjs');
const { PaymentService } = require('../service.cjs');
const { ActivityEngine } = require('../activities.cjs');
const { createMembershipService } = require('../membership.cjs');
const plans = [{ id:'month', name:'月会员', price:10, days:30, version:1, enabled:true, entitlements:[] },{ id:'year', name:'年会员', price:120, days:365, enabled:true, entitlements:[] }];
const config = { enabled:true, publicBaseUrl:'https://example.test', wechat:{enabled:true,appId:'wx-test',mchId:'merchant'}, alipay:{enabled:true} };
function campaign(overrides={}) { return { action:'activate',name:'限时会员活动',start:Date.now()-60000,end:Date.now()+3600000,priority:100,priceMode:'fixed',totalCap:10,userCap:2,allowZero:false,allowInvitation:false,plans:[{planId:'month',priceCents:1,bonusDays:3}],...overrides }; }
function fixture(t, options={}) {
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'shiyu-activities-')); const store = new PaymentStore(options.file || ':memory:');
 const memberships=createMembershipService({usersFile:path.join(dir,'users.json'),invitationsFile:path.join(dir,'invitations.json'),readPlans:()=>plans,readExperience:()=>({enabled:false,values:{}})});
 const users=[{id:'u',name:'用户甲',registeredAt:new Date().toISOString(),memberEvents:[]},{id:'v',name:'用户乙',registeredAt:new Date().toISOString(),memberEvents:[]}];memberships.writeUsers(users);
 const calls={create:0,close:0}; const provider={create:async()=>{calls.create++;return {kind:'qr',image:'test'}},query:async o=>({orderId:o.id,status:'pending'}),close:async()=>{calls.close++}};
 const service=new PaymentService({store,config:options.config||config,memberships,getPlans:async()=>plans,providers:options.providers||{wechat:provider}});
 t.after(()=>{store.close();fs.rmSync(dir,{recursive:true,force:true})});
 const add=c=>{const ids=new Set(service.activities.list().map(c=>c.id));return service.activities.mutate(campaign(c),'管理员',plans).find(c=>!ids.has(c.id));};
 const quote=(user=users[0],quantity=1)=>service.activities.quote(user,plans[0],quantity);
 const buy=async(user=users[0],quantity=1,extra={})=>service.create(user,{planId:'month',provider:'wechat',quantity,requestId:crypto.randomUUID().replaceAll('-',''),accepted:true,quoteToken:quote(user,quantity).token,...extra});
 return {store,service,memberships,users,calls,provider,add,quote,buy};
}
const paid=(o,extra={})=>({orderId:o.id,status:'paid',appId:config.wechat.appId,merchantId:config.wechat.mchId,amount:o.amount,currency:'CNY',transactionId:'T-'+o.id,paidAt:Date.now(),...extra});

test('priority conflicts rejected; higher priority alone supplies discount and gifts; caps do not fall through',t=>{
 const f=fixture(t);f.add({priority:10,priceMode:'discount',discountBps:8000});
 assert.throws(()=>f.add({priority:10}),e=>e.code==='PRIORITY_CONFLICT');
 const high=f.add({priority:100,totalCap:1});const q=f.quote();assert.equal(q.amount,1);assert.equal(q.bonusDays,3);assert.equal(q.activityId,high.id);
 const reservation=f.service.activities.reserve(f.users[0],{planId:'month',provider:'wechat',quantity:1,requestId:'test-reservation',quoteToken:q.token},plans[0],0);
 assert.equal(f.quote().amount,1000);assert.equal(f.quote().bonusDays,0);assert.equal(f.quote().activityId,high.id);
 f.store.expirePending(Date.now()+99999999);assert.equal(f.quote().amount,1000,'expired retains quota');
 f.store.closed(reservation.order.id);assert.equal(f.quote().amount,1);
});
test('mixed normal/activity quantities, gift only, and account-wide caps across plans',async t=>{
 const f=fixture(t); f.add({plans:[{planId:'month',priceCents:1,bonusDays:3},{planId:'year',priceCents:100,bonusDays:7}]});
 const q=f.quote(f.users[0],3);assert.equal(q.amount,1002);assert.equal(q.days,96);assert.equal(q.eligibleQuantity,2);
 await f.buy(f.users[0],3); assert.equal(f.service.activities.quote(f.users[0],plans[1],1).amount,12000);
 const g=fixture(t);g.add({priceMode:'none',plans:[{planId:'month',bonusDays:5}]});assert.equal(g.quote().amount,1000);assert.equal(g.quote().days,35);
});
test('negative, fractional or missing cents, invalid weights and duplicate plans rejected',t=>{
 const f=fixture(t);
 for(const priceCents of [-1,null,undefined,0.1,1001]) assert.throws(()=>f.add({plans:[{planId:'month',priceCents,bonusDays:0}]}));
 assert.throws(()=>f.add({priority:1.5}));assert.throws(()=>f.add({plans:[{planId:'month',priceCents:1},{planId:'month',priceCents:1}]}));
 assert.throws(()=>f.add({priceMode:'none',plans:[{planId:'month',bonusDays:0}]}));
});
test('zero creates an order, bypasses disabled/unconfigured providers, and grants exactly once',async t=>{
 const f=fixture(t,{config:{...config,enabled:false,wechat:{enabled:false}},providers:{}});f.add({plans:[{planId:'month',priceCents:0,bonusDays:5}]});
 const input={requestId:crypto.randomUUID().replaceAll('-','')};const order=await f.buy(f.users[0],1,input);
 assert.equal(order.amount,0);assert.equal(order.provider,'free');assert.equal(order.status,'paid');assert.equal(order.fulfillment,'complete');assert.equal(order.days,35);
 const replay=await f.buy(f.users[0],1,input);assert.equal(replay.id,order.id);assert.equal(f.memberships.readUsers()[0].memberEvents.length,1);assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM orders').get().n,1);
});
test('stale quote cannot silently change price; expiry and stop preserve original order contract',async t=>{
 const f=fixture(t); const c=f.add({totalCap:1});const token=f.quote(f.users[1]).token;
 const order=await f.buy();await assert.rejects(()=>f.buy(f.users[1],1,{quoteToken:token}),e=>e.code==='QUOTE_CHANGED');
 f.service.activities.mutate({id:c.id,version:c.version,action:'stop'},'管理员',plans);
 assert.equal(f.quote().amount,1000);f.service.apply('wechat',paid(order));assert.equal(f.store.get(order.id).fulfillment_state,'complete');assert.equal(f.memberships.readUsers()[0].memberEvents.length,1);
 const g=fixture(t);g.add({end:Date.now()+10000});const old=g.quote();g.service.activities.now=()=>Date.now()+20000;assert.throws(()=>g.service.activities.reserve(g.users[0],{planId:'month',provider:'wechat',quantity:1,requestId:'expired',quoteToken:old.token},plans[0],0),e=>e.code==='QUOTE_CHANGED');
});
test('paid after deadline enters review; notification replay cannot grant; normal delayed notification grants',async t=>{
 const f=fixture(t);f.add();const order=await f.buy();f.store.db.prepare('UPDATE orders SET expires_at=? WHERE id=?').run(Date.now()-1000,order.id);
 f.service.apply('wechat',paid(order));f.service.apply('wechat',paid(order));assert.equal(f.store.get(order.id).fulfillment_state,'review');assert.equal(f.memberships.readUsers()[0].memberEvents.length,0);
 const g=fixture(t);g.add();const good=await g.buy();g.store.expirePending(good.expiresAt+1);g.service.apply('wechat',paid(good));assert.equal(g.memberships.readUsers()[0].memberEvents.length,1);
});
test('unknown checkout retains quota; failed close is visible and later verified close releases',async t=>{
 const f=fixture(t);f.add({totalCap:1});f.provider.create=async()=>{throw Error('network')};
 await assert.rejects(()=>f.buy());let order=f.store.db.prepare('SELECT * FROM orders').get();assert.equal(order.status,'unknown');assert.equal(f.quote(f.users[1]).amount,1000);
 f.store.db.prepare('UPDATE orders SET expires_at=? WHERE id=?').run(Date.now()-1000,order.id);f.provider.close=async()=>{throw Error('unknown close')};
 await f.service.reconcileActivities();assert.equal(f.service.activities.view(f.users).issues.filter(i=>!i.resolved_at).length,2);assert.equal(f.quote(f.users[1]).amount,1000);
 f.provider.close=async()=>{};await f.service.reconcileActivities();assert.equal(f.store.get(order.id).status,'closed');assert.equal(f.quote(f.users[1]).amount,1);
});
test('fulfillment failure is durable, retried idempotently and invitation opt-out survives settlement',async t=>{
 const f=fixture(t);f.add();const order=await f.buy();const apply=f.memberships.applyPayment;f.memberships.applyPayment=()=>{throw Error('offline')};
 assert.throws(()=>f.service.apply('wechat',paid(order)));assert.equal(f.store.get(order.id).status,'paid');assert.equal(f.store.get(order.id).fulfillment_state,'pending');
 f.memberships.applyPayment=apply;f.service.retryFulfillment();f.service.retryFulfillment();const event=f.memberships.readUsers()[0].memberEvents[0];assert.equal(event.invitationEligible,false);assert.equal(f.memberships.readUsers()[0].memberEvents.length,1);assert.equal(f.service.activities.view(f.users).issues.filter(i=>!i.resolved_at).length,0);
});
test('immutable versions, optimistic edits and joined records keep user data authoritative',async t=>{
 const f=fixture(t);const draft=f.add({action:'save'});assert.throws(()=>f.service.activities.mutate({...draft,action:'save',version:0},'甲',plans),e=>e.code==='VERSION_CONFLICT');
 const active=f.service.activities.mutate({...draft,action:'activate'},'乙',plans)[0];assert.throws(()=>f.service.activities.mutate({...active,action:'save'},'丙',plans));
 const order=await f.buy();f.users[0].name='新昵称';assert.equal(f.service.activities.view(f.users).participations[0].userName,'新昵称');assert.equal(f.service.activities.rules(active.id,active.version).name,active.name);
 assert.deepEqual(f.store.db.prepare('PRAGMA table_info(activity_participations)').all().map(c=>c.name),['order_id','activity_id','version','quantity','bonus_days','discount_cents']);assert.equal(f.service.activities.participation(order.id).version,active.version);
});
test('parallel workers cannot oversell last quota or duplicate account discount',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'shiyu-concurrency-')),file=path.join(dir,'orders.sqlite');
 const store=new PaymentStore(file),engine=new ActivityEngine(store);engine.mutate(campaign({totalCap:1}),'admin',plans);
 const quote=engine.quote({id:'u'},plans[0],1);store.close();
 const code=`const {parentPort,workerData:d}=require('node:worker_threads');const {PaymentStore}=require(d.store);const {ActivityEngine}=require(d.engine);const s=new PaymentStore(d.file),e=new ActivityEngine(s);parentPort.postMessage('ready');parentPort.on('message',()=>{try{e.reserve({id:'u'},{planId:'month',provider:'wechat',quantity:1,requestId:d.id,quoteToken:d.token},d.plan,0);parentPort.postMessage('reserved')}catch(x){parentPort.postMessage(x.code||x.message)}finally{s.close();parentPort.close()}});`;
 const workers=Array.from({length:4},(_,i)=>new Worker(code,{eval:true,workerData:{store:require.resolve('../store.cjs'),engine:require.resolve('../activities.cjs'),file,id:'parallel-'+i,token:quote.token,plan:plans[0]}}));
 t.after(async()=>{await Promise.all(workers.map(w=>w.terminate()));fs.rmSync(dir,{recursive:true,force:true})});
 await Promise.all(workers.map(w=>new Promise((resolve,reject)=>{w.once('message',resolve);w.once('error',reject)})));
 const results=await Promise.all(workers.map(w=>new Promise((resolve,reject)=>{w.once('message',resolve);w.once('error',reject);w.postMessage('go')})));
 assert.equal(results.filter(x=>x==='reserved').length,1);assert.equal(results.filter(x=>x==='QUOTE_CHANGED').length,3);
 await Promise.all(workers.map(w=>w.terminate()));const check=new PaymentStore(file);assert.equal(check.db.prepare('SELECT count(*) AS n FROM orders').get().n,1);check.close();
});
test('legacy amount>0 migration preserves data, foreign keys, and allows zero but never negative',t=>{
 const {DatabaseSync}=require('node:sqlite');const dir=fs.mkdtempSync(path.join(os.tmpdir(),'shiyu-migrate-')),file=path.join(dir,'orders.sqlite');
 const source=fs.readFileSync(require.resolve('../store.cjs'),'utf8');const schema=source.match(/this\.db\.exec\(`([\s\S]+?)`\);/)[1].replace('CHECK(amount>=0)','CHECK(amount>0)');const db=new DatabaseSync(file);db.exec(schema);
 db.exec("INSERT INTO orders(id,user_id,request_id,provider,plan_id,plan_name,quantity,amount,days,status,created_at,expires_at) VALUES('legacy','u','legacy','wechat','month','旧会员',1,1000,30,'paid',1,2); INSERT INTO ledger VALUES('legacy','u',30,1000,1); CREATE INDEX retained_order_index ON orders(user_id)");db.close();
 const store=new PaymentStore(file);t.after(()=>{store.close();fs.rmSync(dir,{recursive:true,force:true})});const order=store.create({userId:'u',requestId:'legacy-zero',provider:'free',plan:plans[0],amount:0});assert.equal(order.amount,0);assert.throws(()=>store.create({userId:'u',requestId:'negative',provider:'free',plan:plans[0],amount:-1}));assert.equal(store.db.prepare('PRAGMA foreign_key_check').all().length,0);
 assert.equal(store.get('legacy').amount,1000);assert.equal(store.db.prepare('SELECT order_id FROM ledger').get().order_id,'legacy');assert(store.db.prepare("SELECT name FROM sqlite_master WHERE name='retained_order_index'").get());
});

test('each price mode combines independently with gifts; disabled gifts discard stale days',t=>{
 for(const priceMode of ['discount','plan_discount','fixed','none']) for(const giftEnabled of [false,true]) {
  const f=fixture(t), input={priceMode,discountBps:8000,giftEnabled,plans:[{planId:'month',priceCents:100,discountBps:7000,bonusDays:5},{planId:'year',priceCents:200,discountBps:6000,bonusDays:7}]};
  if(priceMode==='none'&&!giftEnabled){assert.throws(()=>f.add(input));continue;}
  const c=f.add(input);assert.equal(f.quote().bonusDays,giftEnabled?5:0);assert.equal(f.quote().amount,{discount:800,plan_discount:700,fixed:100,none:1000}[priceMode]);
  assert.equal(f.service.activities.quote(f.users[1],plans[1],1).amount,{discount:9600,plan_discount:7200,fixed:200,none:12000}[priceMode]);
  assert.equal(c.plans[1].bonusDays,giftEnabled?7:0);
 }
});
test('new registration scope is authoritative, time bounded and filtered before priority',async t=>{
 const f=fixture(t),now=Date.now();const all=f.add({priority:10});const scoped=f.add({priority:100,audience:'new_users',start:now-10000,plans:[{planId:'month',priceCents:0}]});
 const users=f.memberships.readUsers();users[0].registeredAt=new Date(now-20000).toISOString();users[1].registeredAt=new Date(now-5000).toISOString();f.memberships.writeUsers(users);
 assert.equal((await f.service.quote({id:'u',registeredAt:new Date(now).toISOString()},{planId:'month'})).activityId,all.id,'request registration cannot override store');
 const q=await f.service.quote({id:'v'},{planId:'month'});assert.equal(q.activityId,scoped.id);assert.equal(q.amount,0);
 const order=await f.service.create({id:'v'},{planId:'month',provider:'wechat',quantity:1,requestId:crypto.randomUUID(),accepted:true,quoteToken:q.token});assert.equal(order.status,'paid');
 for(const registeredAt of [undefined,'invalid',new Date(now+5000).toISOString()])assert.equal(f.service.activities.quote({id:'other',registeredAt},plans[0],1).activityId,all.id);
 assert.throws(()=>f.add({audience:'channel',priority:200}));
});

test('offer presentation returns remaining caps and gift days per package from authoritative rules',async t=>{
 const f=fixture(t);f.add({description:'限时赠礼',userCap:5,totalCap:9,plans:[{planId:'month',priceCents:100,bonusDays:30,userCap:2}]});
 const q=f.quote(f.users[0],2);assert.equal(q.remainingQuantity,2);assert.equal(q.bonusDaysPerUnit,30);assert.equal(q.bonusDays,60);assert.equal(q.days,120);assert.equal(q.activityDescription,'限时赠礼');
 await f.buy();assert.equal(f.quote().remainingQuantity,1);await f.buy();assert.equal(f.quote().remainingQuantity,0);assert.equal(f.quote().amount,1000);assert.equal(f.quote().bonusDays,0);
});
