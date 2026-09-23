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
function trialConfig(value){const mode=value?.mode==='total'?'total':'daily',amount=Math.max(1,Number(value?.value)||10);return {mode,durationMs:amount*(mode==='total'?86400000:60000)}}
function emptyPreview(day,limit=DAILY_MS,mode='daily'){return {mode,day,firstStartedAt:0,startedAt:0,expiresAt:0,remainingMs:limit,consumedMs:0,active:false,started:false,expired:false}}
function preview(token,theme,now=Date.now(),trial){
  const config=trialConfig(trial),record=read().visitors[token],value=record?.previews?.[theme];
  const firstStartedAt=Number(value?.firstStartedAt)||Number(value?.startedAt)||0;
  if(config.mode==='total'){const startedAt=firstStartedAt,expiresAt=startedAt?startedAt+config.durationMs:0,remainingMs=startedAt?Math.max(0,expiresAt-now):config.durationMs;return {mode:'total',day:'',firstStartedAt,startedAt,expiresAt,remainingMs,consumedMs:startedAt?Math.min(config.durationMs,now-startedAt):0,active:false,activeSince:0,started:startedAt>0,expired:startedAt>0&&remainingMs<=0}}
  const day=dayKey(now);
  if(!value||value.day!==day)return {...emptyPreview(day,config.durationMs),firstStartedAt};
  const startedAt=Number(value.startedAt)||0,expiresAt=startedAt?startedAt+config.durationMs:0,remainingMs=startedAt?Math.max(0,expiresAt-now):config.durationMs;
  return {mode:'daily',day,firstStartedAt:firstStartedAt||startedAt,startedAt,expiresAt,remainingMs,consumedMs:startedAt?Math.min(config.durationMs,now-startedAt):0,active:false,activeSince:0,started:startedAt>0,expired:startedAt>0&&remainingMs<=0};
}
function previews(token,now=Date.now(),trial){
  const source=read().visitors[token]?.previews||{},day=dayKey(now),result={};
  for(const id of Object.keys(source)){const state=preview(token,id,now,trial);if(state.started||state.expired)result[id]=state;}
  return result;
}
function updatePresence(token,theme,active,now=Date.now(),trial){
  if(!theme)throw Error('缺少主题');
  const data=read(),record=data.visitors[token];if(!record)throw Error('预览会话已失效');
  const config=trialConfig(trial);record.previews??={};
  const existing=record.previews[theme],firstStartedAt=Number(existing?.firstStartedAt)||Number(existing?.startedAt)||now;
  if(config.mode==='total'){record.previews[theme]={mode:'total',firstStartedAt,startedAt:firstStartedAt};write(data);return preview(token,theme,now,trial)}
  const day=dayKey(now),startedAt=existing?.day===day&&Number(existing.startedAt)>0?Number(existing.startedAt):now;
  record.previews[theme]={mode:'daily',day,firstStartedAt,startedAt};write(data);return preview(token,theme,now,trial);
}
function startPreview(token,theme,now=Date.now(),trial){
  const state=preview(token,theme,now,trial);return state.expired?0:state.remainingMs;
}
function pausePreview(token,theme,now=Date.now()){return updatePresence(token,theme,false,now)}
// Kept as a compatibility helper for callers that only need the current theme state.
function daily(token,now=Date.now()){return preview(token,'__daily__',now)}
module.exports={issueSession,session,logout,visitor,dayKey,daily,preview,previews,startPreview,pausePreview,updatePresence,DAILY_MS,PRESENCE_LEASE_MS};
