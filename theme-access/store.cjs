'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const file=process.env.SHIYU_THEME_ACCESS_STORE||path.resolve(__dirname,'../.local/theme-access.json');
function read(sessionOnly=false){const target=sessionOnly?file+'.sessions':file;return fs.existsSync(target)?JSON.parse(fs.readFileSync(target,'utf8')):{sessions:{},visitors:{}}}
function write(data,sessionOnly=false){const target=sessionOnly?file+'.sessions':file;fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(target+'.tmp',JSON.stringify(data),{mode:0o600});fs.renameSync(target+'.tmp',target)}
function cookie(req,name){return (req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1)||''}
function issueSession(userId){const data=read(true),token=crypto.randomBytes(32).toString('hex'),now=Date.now();for(const [id,s]of Object.entries(data.sessions))if(s.expiresAt<=now)delete data.sessions[id];data.sessions[token]={userId,expiresAt:now+7*86400000};write(data,true);return token}
function session(req){const data=read(true),s=data.sessions[cookie(req,'shiyu_user_session')];return s&&s.expiresAt>Date.now()?s.userId:null}
function logout(req){const data=read(true);delete data.sessions[cookie(req,'shiyu_user_session')];write(data,true)}
function visitor(req,res){const data=read();let token=cookie(req,'shiyu_theme_visitor'),record=data.visitors[token];if(!record||record.expiresAt<=Date.now()){token=crypto.randomBytes(24).toString('hex');record={expiresAt:Date.now()+7*86400000,previews:{},daily:null};for(const [id,v]of Object.entries(data.visitors))if(v.expiresAt<=Date.now())delete data.visitors[id];data.visitors[token]=record;write(data);res.setHeader('Set-Cookie',`shiyu_theme_visitor=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`)}return token}
const DAILY_MS=10*60*1000;
const PRESENCE_LEASE_MS=30*1000;
function dayKey(now){return new Date(now+8*3600000).toISOString().slice(0,10)}
function emptyPreview(day){return {day,startedAt:0,expiresAt:0,remainingMs:DAILY_MS,consumedMs:0,active:false,started:false,expired:false}}
function normalizePreview(value,day){
  if(!value||value.day!==day)return emptyPreview(day);
  const consumed=Math.min(DAILY_MS,Math.max(0,Number(value.consumedMs)||0));
  const activeSince=Number(value.activeSince)||0;
  return {day,startedAt:Number(value.startedAt)||0,expiresAt:Number(value.expiresAt)||0,remainingMs:Math.max(0,DAILY_MS-consumed),consumedMs:consumed,activeSince};
}
function settle(value,now){
  const consumed=Math.min(DAILY_MS,Math.max(0,Number(value.consumedMs)||0));
  const activeSince=Number(value.activeSince)||0;
  // A missing heartbeat must not consume an unlimited amount after a tab crash.
  const elapsed=activeSince>0?Math.min(PRESENCE_LEASE_MS,Math.max(0,now-activeSince)):0;
  const nextConsumed=Math.min(DAILY_MS,consumed+elapsed),remainingMs=Math.max(0,DAILY_MS-nextConsumed);
  return {...value,consumedMs:nextConsumed,remainingMs,activeSince:0,expiresAt:0,active:false,started:value.startedAt>0,expired:value.startedAt>0&&remainingMs<=0};
}
function preview(token,theme,now=Date.now()){
  const day=dayKey(now),record=read().visitors[token],value=record?.previews?.[theme];
  const normalized=normalizePreview(value,day),settled=normalized.activeSince?settle(normalized,now):normalized;
  const remainingMs=Math.max(0,DAILY_MS-(Number(settled.consumedMs)||0)),leaseActive=normalized.activeSince>0&&now-normalized.activeSince<=PRESENCE_LEASE_MS&&remainingMs>0;
  return {...settled,remainingMs,started:settled.startedAt>0,expired:settled.startedAt>0&&remainingMs<=0,active:leaseActive,activeSince:leaseActive?normalized.activeSince:0,expiresAt:leaseActive?now+remainingMs:0};
}
function previews(token,now=Date.now()){
  const source=read().visitors[token]?.previews||{},day=dayKey(now),result={};
  for(const id of Object.keys(source)){const state=preview(token,id,now);if(state.started||state.expired)result[id]=state;}
  return result;
}
function updatePresence(token,theme,active,now=Date.now()){
  if(!theme)throw Error('缺少主题');
  const data=read(),record=data.visitors[token];if(!record)throw Error('预览会话已失效');
  record.previews??={};const day=dayKey(now),current=normalizePreview(record.previews[theme],day),settled=current.activeSince?settle(current,now):current;
  const remainingMs=Math.max(0,DAILY_MS-(Number(settled.consumedMs)||0));
  const next={...settled,day,startedAt:Number(settled.startedAt)||now,consumedMs:Number(settled.consumedMs)||0,remainingMs,started:true,expired:remainingMs<=0,active:false,activeSince:0,expiresAt:0};
  if(active&&remainingMs>0){next.active=true;next.activeSince=now;next.expiresAt=now+remainingMs;}
  record.previews[theme]=next;write(data);return next;
}
function startPreview(token,theme,now=Date.now()){
  const state=preview(token,theme,now);return state.expired?0:state.remainingMs;
}
function pausePreview(token,theme,now=Date.now()){return updatePresence(token,theme,false,now)}
// Kept as a compatibility helper for callers that only need the current theme state.
function daily(token,now=Date.now()){return preview(token,'__daily__',now)}
module.exports={issueSession,session,logout,visitor,dayKey,daily,preview,previews,startPreview,pausePreview,updatePresence,DAILY_MS,PRESENCE_LEASE_MS};
