'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { createMembershipService, timestamp, DAY } = require('../membership.cjs');
const { PaymentStore } = require('../store.cjs');
const { PaymentService } = require('../service.cjs');
const { migrateMemberships } = require('../migrate-memberships.cjs');
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shiyu-membership-'));
  const cleanups=[];t.after(() => { for(const cleanup of cleanups) cleanup(); fs.rmSync(dir, { recursive: true, force: true }); });
  const retained = new Map(), now = Date.now(), plans = [
    { id: 'free', name: '免费版', version: 1, enabled: true, entitlements: ['space-limit', 'scene-limit', 'group-limit'].map(key => ({key,kind:'quantity',enabled:true,value:1})) },
    { id: 'monthly', name: '月度会员', version: 1, enabled: true, days: 30, price: 10, entitlements: [{key:'themes',kind:'selection',enabled:true,value:['a','b']}, ...['space-limit', 'scene-limit', 'group-limit'].map(key => ({key,kind:'quantity',enabled:true,value:5}))] }
  ];
  const service = createMembershipService({usersFile:path.join(dir,'users.json'),invitationsFile:path.join(dir,'invitations.json'),readPlans:()=>plans,readRetainedPlan:id=>retained.get(id),now:()=>now});
  const user = {id:'u',name:'测试用户',registeredAt:new Date(now-DAY).toISOString(),member:false,memberEvents:[],password:'private',accountData:[]}; service.writeUsers([user]);
  return {dir,now,plans,retained,service,user,cleanups,get:()=>service.readUsers()[0]};
}
test('explicit permanent only, finite ISO/date and expired states resolve without false permanent', t => {
  const f=fixture(t),s=f.service;
  assert.equal(s.stateFor({...f.user,member:true,memberExpiresAt:null}).member,false);
  assert.equal(s.stateFor({...f.user,member:true,memberExpiresAt:'invalid'}).member,false);
  assert.equal(s.stateFor({...f.user,member:true,memberExpiresAt:'永久'}).permanent,true);
  const date='2099-06-01';assert.equal(timestamp(date,true),Date.parse('2099-06-01T23:59:59.999+08:00'));
  s.mutate('u',{source:'admin',expiresAt:date,planId:'monthly',operator:'管理员甲'});
  assert.equal(s.stateFor(f.get()).expiresAt,timestamp(date,true));
  assert.equal(s.present(f.get()).memberEvents,undefined);assert.equal(s.present(f.get()).password,undefined);
  assert.equal(s.present(f.get(),true).memberEvents[0].operator,'管理员甲');assert.equal(s.present(f.get()).membership.planName,'月度会员');
});

test('test-account membership changes visible rights without changing real membership grants', t => {
  const f = fixture(t);
  let testState = { enabled: true, values: { membership: 'member' } };
  const service = createMembershipService({ usersFile: path.join(f.dir, 'users.json'), readPlans: () => f.plans, now: () => f.now, readExperience: () => testState });
  assert.equal(service.stateFor(f.user).member, true);
  assert.equal(service.stateFor(f.user).planId, 'monthly');
  assert.equal(service.present(f.user).member, false);
  assert.equal(service.present(f.user, false, true).member, true);
  assert.doesNotThrow(() => service.checkQuota(f.user, Array.from({ length: 3 }, (_, i) => ({ id: String(i), scenes: [] }))));
  service.applyToUser(f.user, { id: 'test-grant', source: 'admin', planId: 'monthly', permanent: true });
  assert.equal(f.user.memberEvents[0].action, 'grant');
  testState = { enabled: true, values: { membership: 'free' } };
  assert.equal(service.stateFor(f.user).member, false);
  testState = { enabled: false, values: { membership: 'free' } };
  assert.equal(service.stateFor(f.user).member, true);
  assert.equal(f.user.memberEvents.length, 1);
});
test('published plan changes apply immediately; offline snapshot survives and admin can keep only existing offline plan', t => {
  const f=fixture(t);f.service.mutate('u',{source:'admin',permanent:true,planId:'monthly'});
  f.plans[1].version=2;f.plans[1].entitlements[0].value=['c'];
  assert.deepEqual(f.service.stateFor(f.get()).entitlements[0].value,['c']);
  f.retained.set('monthly',structuredClone(f.plans[1]));f.plans.splice(1,1);
  assert.deepEqual(f.service.stateFor(f.get()).entitlements[0].value,['c']);
  f.service.mutate('u',{source:'admin',expiresAt:'2099-01-01',planId:'monthly'});
  assert.equal(f.service.stateFor(f.get()).planId,'monthly');
  assert.throws(()=>f.service.mutate('u',{source:'admin',permanent:true,planId:'invented'}),/未发布/);
});
test('paid fulfillment and renewals share authority, snapshot, complete records and stable IDs; cancellation cannot be revived by replay', async t => {
  const f=fixture(t),store=new PaymentStore(':memory:');t.after(()=>store.close());
  const config={wechat:{appId:'app',mchId:'merchant',enabled:true}},provider={create:async()=>({kind:'qr',image:'data:test'})};
  const payment=new PaymentService({config,store,providers:{wechat:provider},getPlans:async()=>f.plans,memberships:f.service});
  async function paid(i) {const order=await payment.create({id:'u'},{accepted:true,provider:'wechat',planId:'monthly',requestId:'request0000000000'+i});const result={orderId:order.id,status:'paid',appId:'app',merchantId:'merchant',amount:1000,currency:'CNY',transactionId:'tx'+i,paidAt:f.now};payment.apply('wechat',result);return {order,result};}
  const first=await paid(1);assert.equal(f.service.stateFor(f.get()).expiresAt,f.now+30*DAY);
  assert.equal(JSON.parse(store.get(first.order.id).plan_snapshot).id,'monthly');assert.equal(store.get(first.order.id).fulfillment_state,'complete');
  const second=await paid(2);assert.equal(f.service.stateFor(f.get()).expiresAt,f.now+60*DAY);
  assert.equal(f.service.records(f.get()).length,2);
  f.service.mutate('u',{source:'admin',action:'cancel',operator:'管理员'});
  payment.apply('wechat',second.result);assert.equal(f.service.stateFor(f.get()).member,false);
  assert.equal(f.get().memberEvents.length,3);assert.equal(f.service.records(f.get()).length,2);
  assert(!JSON.stringify(f.service.records(f.get())).includes('管理员'));
  f.service.mutate('u',{source:'admin',permanent:true});await paid(3);
  assert.equal(f.service.stateFor(f.get()).permanent,true);assert.equal(f.get().memberEvents[0].afterPermanent,true);
});
test('registration and first paid invitation rewards settle once, extend ISO dates and preserve permanent', t=>{
  const f=fixture(t),start=new Date(f.now-2*DAY).toISOString(),end=new Date(f.now+20*DAY).toISOString();
  f.service.writeInvitations({campaigns:[{id:'c',name:'邀请有礼',start,end,newUserDays:3,purchaseWithinDays:7,inviterDays:5,weeklyCap:null,monthlyCap:null}],rewards:[]});
  const inviter={...f.user,id:'inviter',member:true,memberExpiresAt:'永久',memberEvents:[]};
  f.user.invitation={campaignId:'c',inviterId:'inviter'};f.service.writeUsers([f.user,inviter]);
  f.service.settleInvitations();const registered=f.service.readUsers().find(u=>u.id==='u');assert.equal(f.service.stateFor(registered).expiresAt,f.now+3*DAY);
  const order={id:'order1',user_id:'u',plan_id:'monthly',plan_snapshot:JSON.stringify(f.plans[1]),days:30,amount:1000,provider:'alipay',paid_at:f.now};
  f.service.applyPayment(order);f.service.applyPayment(order);f.service.settleInvitations();
  const users=f.service.readUsers();assert.equal(f.service.readInvitations().rewards.length,2);assert.equal(f.service.readInvitations().rewards[1].orderId,'order1');
  assert.equal(f.service.stateFor(users.find(u=>u.id==='u')).expiresAt,f.now+33*DAY);
  assert.equal(f.service.stateFor(users.find(u=>u.id==='inviter')).permanent,true);
  assert.equal(users.find(u=>u.id==='inviter').memberEvents.length,1);
});
test('quota rejects only growth beyond actual rights; existing overage edits remain possible',t=>{
  const f=fixture(t),space=id=>({id,scenes:[{id:'scene',groups:[{id:'group',items:[]}]}]});
  const u={...f.user,accountData:[space('a'),space('b')]};
  assert.doesNotThrow(()=>f.service.checkQuota(u,[space('a'),space('b')]));
  assert.throws(()=>f.service.checkQuota(u,[space('a'),space('b'),space('c')]),/空间数量/);
  const data=[space('a')];data[0].scenes.push({id:'new',groups:[]});assert.throws(()=>f.service.checkQuota(u,data),/场景数量/);
  f.service.applyToUser(u,{source:'admin',permanent:true});assert.doesNotThrow(()=>f.service.checkQuota(u,[space('a'),space('b'),space('c')]));
});
test('legacy migration dry run never writes, uses greatest historical expiry and preserves later admin cancellation',t=>{
  const f=fixture(t),database=path.join(f.dir,'orders.sqlite'),store=new PaymentStore(database);f.cleanups.push(()=>store.close());
  const make=i=>{const order=store.create({userId:'u',requestId:'legacy'+i,provider:'wechat',plan:f.plans[1],amount:1000});store.paid(order.id,'legacy-tx'+i,f.now-DAY);store.db.prepare("UPDATE orders SET fulfillment_state='legacy' WHERE id=?").run(order.id);return store.get(order.id)};
  const a=make(1),b=make(2),before=JSON.stringify(f.service.readUsers());
  assert.equal(migrateMemberships({database,memberships:f.service}).candidates,2);assert.equal(JSON.stringify(f.service.readUsers()),before);
  migrateMemberships({database,memberships:f.service,apply:true});assert.equal(f.service.stateFor(f.get()).expiresAt,b.member_expires_at);
  assert.equal(migrateMemberships({database,memberships:f.service,apply:true}).candidates,0);
  f.service.writeUsers([{...f.user,memberEvents:[{id:'cancel',time:new Date(f.now).toISOString(),title:'管理员取消会员',type:'管理员配置'}]}]);
  migrateMemberships({database,memberships:f.service,apply:true});assert.equal(f.service.stateFor(f.get()).member,false);assert.equal(f.service.records(f.get()).length,2);
});
