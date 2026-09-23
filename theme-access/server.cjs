'use strict';
const store=require('./store.cjs');
const retired=new Set(['reading','projection','wallfilm']);
function themeGranted(entitlements,id){
  const selection=entitlements?.find(item=>item.key==='themes');
  if(selection)return selection.enabled===true&&Array.isArray(selection.value)&&selection.value.includes(id);
  return entitlements?.some(item=>item.key==='theme-'+id&&item.enabled===true)===true;
}
function expiryTime(value){return typeof value==='number'?value:typeof value==='string'?Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(value)?value+'T23:59:59+08:00':value):NaN}
function membershipState(identity,now=Date.now()){
  const user=identity?.user,active=identity?.authenticated===true&&user?.blacklisted!==true;
  const snapshot=user?.membership||identity?.membership;
  const permanent=snapshot?.permanent===true||user?.memberExpiresAt==='永久';
  const end=expiryTime(snapshot?.expiresAt??user?.memberExpiresAt);
  return {member:active&&user?.member===true&&(permanent||end>now),memberExpired:active&&!permanent&&Number.isFinite(end)&&end<=now};
}
function policy(themes,plans,entitlements,member=false){
  const free=plans.find(plan=>plan.id==='free');
  const granted=id=>themeGranted(free?.entitlements,id);
  const actual=Array.isArray(entitlements)?entitlements:free?.entitlements;
  const items=themes.filter(theme=>!retired.has(theme.id)).map(theme=>({id:theme.id,enabled:theme.enabled===true,memberOnly:!granted(theme.id),allowed:theme.enabled===true&&(member||themeGranted(actual,theme.id))}));
  return {items,fallback:items.find(theme=>theme.enabled&&theme.allowed)?.id||items.find(theme=>theme.enabled&&!theme.memberOnly)?.id||'base'};
}
async function upstream(path,req){const r=await fetch(new URL(path,process.env.SHIYU_ADMIN_ORIGIN||'http://127.0.0.1:5175'),{headers:{cookie:req.headers.cookie||'',accept:'application/json'},signal:AbortSignal.timeout(4000)});if(!r.ok)throw Error('主题权限暂时无法校验');return r.json()}
function allowedOrigins(req){
  const origins=new Set(['https://shiyubox.com','https://www.shiyubox.com','http://127.0.0.1:4318','http://localhost:4318']);
  const forwardedHost=String(req.headers['x-forwarded-host']||'').split(',')[0].trim();
  const forwardedProto=String(req.headers['x-forwarded-proto']||'').split(',')[0].trim()||'https';
  for(const host of [req.headers.host,forwardedHost])if(host)origins.add(`${forwardedProto}://${host}`);
  return origins;
}
async function handler(req,res){
  const pathname=(req.url||'').split('?')[0];
  if(!['/api/shiyu/theme-access','/api/shiyu/theme-access/preview','/api/shiyu/theme-access/presence'].includes(pathname))return false;
  const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data))};
  try{
    const isPreview=pathname.endsWith('/preview'),isPresence=pathname.endsWith('/presence');
    if((isPreview||isPresence)&&req.method!=='POST'||!isPreview&&!isPresence&&req.method!=='GET'){send(405,{message:'不支持该操作'});return true}
    const [themes,plans,identity]=await Promise.all([upstream('/api/shiyu/themes',req),upstream('/api/shiyu/plans',req),upstream('/api/shiyu/auth/session',req)]);
    const now=Date.now(),{member,memberExpired}=membershipState(identity,now);
    const entitlementData=identity.entitlements||identity.user?.entitlements||identity.user?.membership?.entitlements;
    const result=policy(themes.items,plans.items,member?entitlementData:undefined,member),trial=themes.trial||{mode:'daily',value:10};
    const token=store.visitor(req,res);let preview=null,presence=null,payload={};
    if(req.method==='POST'){
      if(req.headers.origin&&!allowedOrigins(req).has(req.headers.origin)){send(403,{message:'请求来源无效'});return true}
      let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>1024)throw Error('请求内容过大')}payload=JSON.parse(raw||'{}');
      const theme=String(payload.theme||'');
      if(isPresence){
        const item=result.items.find(t=>t.id===theme&&t.enabled);if(!item){send(400,{message:'主题不可用'});return true}
        if(item.allowed)presence=store.preview(token,theme,now,trial);else presence=store.updatePresence(token,theme,payload.active===true,now,trial);
        send(200,{...result,trial,member,memberExpired,serverTime:now,presence,presenceTheme:theme,previews:store.previews(token,now,trial)});return true;
      }
      const item=result.items.find(t=>t.id===theme&&t.enabled);if(!item){send(400,{message:'主题不可用'});return true}
      if(!item.allowed){const state=store.preview(token,theme,now,trial);if(state.expired){send(403,{message:member?'当前会员方案未包含这个主题，可以查看其他会员权益。':'当前会员主题体验已结束。',...result,trial,member,memberExpired,serverTime:now,previews:store.previews(token,now,trial)});return true}preview={theme,state};}
    }
    send(200,{...result,trial,member,memberExpired,serverTime:now,previews:store.previews(token,now,trial),preview});
  }catch{send(503,{message:'主题权限暂时无法校验，请稍后重试'})}
  return true;
}
module.exports={handler,policy,membershipState};
