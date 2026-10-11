'use strict';
const fs=require('node:fs');
const {DatabaseSync}=require('node:sqlite');
const {loadConfig}=require('./config.cjs');
const {createMembershipService}=require('./membership.cjs');
function listOrders(options={}){
 const users=(options.memberships||createMembershipService()).readUsers();
 const byUser=new Map(users.map(u=>[u.id,u]));
 const identity=u=>({userId:u.id,user:u.name||u.id,email:u.email||'',phone:u.phone||'',avatarId:u.avatarProfile?.avatarId||'',avatarUrl:u.wechatProfile?.avatarUrl||''});
 const file=options.database||loadConfig().database;let rows=[];
 if(fs.existsSync(file)){const db=new DatabaseSync(file,{readOnly:true});try{if(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'").get())rows=db.prepare("SELECT * FROM orders WHERE status='paid' ORDER BY paid_at ASC,created_at ASC,id ASC").all();}finally{db.close();}}
 const paidUsers=new Set();
 const items=rows.map(o=>{
  const u=byUser.get(o.user_id)||{id:o.user_id};
  const event=(u.memberEvents||[]).find(e=>e.orderId===o.id||e.id===`PAY:${o.id}`);
  const paid=o.amount>0,renewal=paidUsers.has(o.user_id);if(paid)paidUsers.add(o.user_id);
  return {id:o.id,...identity(u),planId:o.plan_id,planName:o.plan_name,amount:o.amount,provider:o.provider,status:o.status,createdAt:o.created_at,paidAt:o.paid_at,expiresAt:o.expires_at,days:o.days,duration:event?.duration||`${o.days} 天`,memberExpiresAt:o.member_expires_at,fulfillment:o.fulfillment_state,orderType:paid?'payment':'activity',typeLabel:paid?`付费（${renewal?'续费':'首次'}）`:'活动',title:event?.title||o.plan_name};
 });
 const linked=new Set(rows.map(o=>o.id));
 for(const u of users)for(const event of u.memberEvents||[]){
  if(event.source!=='reward'&&event.source!=='admin')continue;
  if(event.orderId&&linked.has(event.orderId)||event.action==='cancel')continue;
  if(event.source==='admin'&&event.action==='adjust'&&!(Number(event.afterExpiresAt)>Number(event.beforeExpiresAt)))continue;
  const days=Number(String(event.duration||'').match(/^([\d.]+)\s*天$/)?.[1]||0);
  if(!days&&event.duration!=='永久')continue;
  const time=Date.parse(event.time);if(!Number.isFinite(time))continue;
  items.push({id:event.id,...identity(u),planId:event.planId,planName:event.planName||event.title,amount:0,provider:event.source==='admin'?'gift':'activity',status:'paid',createdAt:time,paidAt:time,days,duration:event.duration,memberExpiresAt:event.afterExpiresAt??event.expires,orderType:event.source==='admin'?'gift':'activity',typeLabel:event.source==='admin'?'平台赠送':'活动',title:event.title});
 }
 return {items:items.sort((a,b)=>(b.paidAt||b.createdAt)-(a.paidAt||a.createdAt)||a.id.localeCompare(b.id))};
}
module.exports={listOrders};
