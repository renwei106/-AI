'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const file=process.env.SHIYU_THEME_ACCESS_STORE||path.resolve(__dirname,'../.local/theme-access.json');
function read(sessionOnly=false){const target=sessionOnly?file+'.sessions':file;return fs.existsSync(target)?JSON.parse(fs.readFileSync(target,'utf8')):{sessions:{},visitors:{}}}
function write(data,sessionOnly=false){const target=sessionOnly?file+'.sessions':file;fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(target+'.tmp',JSON.stringify(data),{mode:0o600});fs.renameSync(target+'.tmp',target)}
function cookie(req,name){return (req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1)||''}
function issueSession(userId){const data=read(true),token=crypto.randomBytes(32).toString('hex'),now=Date.now();for(const [id,s]of Object.entries(data.sessions))if(s.expiresAt<=now)delete data.sessions[id];data.sessions[token]={userId,expiresAt:now+7*86400000};write(data,true);return token}
function session(req){const data=read(true),s=data.sessions[cookie(req,'shiyu_user_session')];return s&&s.expiresAt>Date.now()?s.userId:null}
function logout(req){const data=read(true);delete data.sessions[cookie(req,'shiyu_user_session')];write(data,true)}
function visitor(req,res){const data=read();let token=cookie(req,'shiyu_theme_visitor'),record=data.visitors[token];if(!record||record.expiresAt<=Date.now()){token=crypto.randomBytes(24).toString('hex');record={expiresAt:Date.now()+7*86400000,previews:{}};for(const [id,v]of Object.entries(data.visitors))if(v.expiresAt<=Date.now())delete data.visitors[id];data.visitors[token]=record;write(data);res.setHeader('Set-Cookie',`shiyu_theme_visitor=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`)}return token}
function previews(token){return read().visitors[token]?.previews||{}}
function startPreview(token,id,now=Date.now()){const data=read(),record=data.visitors[token];if(!record)throw Error('预览会话已失效');record.previews[id]??=now+30000;write(data);return record.previews[id]}
module.exports={issueSession,session,logout,visitor,previews,startPreview};
