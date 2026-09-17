'use strict';
const store=require('./store.cjs');
const retired=new Set(['reading','projection','wallfilm']);
function policy(themes,plans){const free=plans.find(p=>p.id==='free');const granted=id=>free?.entitlements?.some(e=>e.key==='theme-'+id&&e.enabled===true)===true;const items=themes.filter(t=>!retired.has(t.id)).map(t=>({id:t.id,enabled:t.enabled===true,memberOnly:!granted(t.id)}));return {items,fallback:items.find(t=>t.enabled&&!t.memberOnly)?.id||'base'}}
async function upstream(path,req){const r=await fetch(new URL(path,process.env.SHIYU_ADMIN_ORIGIN||'http://127.0.0.1:5175'),{headers:{cookie:req.headers.cookie||'',accept:'application/json'},signal:AbortSignal.timeout(4000)});if(!r.ok)throw Error('主题权限暂时无法校验');return r.json()}
async function handler(req,res){const pathname=(req.url||'').split('?')[0];if(!['/api/shiyu/theme-access','/api/shiyu/theme-access/preview'].includes(pathname))return false;
const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data))};
try{if((pathname.endsWith('/preview')&&req.method!=='POST')||(!pathname.endsWith('/preview')&&req.method!=='GET')){send(405,{message:'不支持该操作'});return true}
const [themes,plans,identity]=await Promise.all([upstream('/api/shiyu/themes',req),upstream('/api/shiyu/plans',req),upstream('/api/shiyu/auth/session',req)]);const result=policy(themes.items,plans.items),now=Date.now(),member=identity.authenticated===true&&identity.user?.blacklisted!==true&&identity.user?.member===true&&Date.parse(identity.user.memberExpiresAt)>now;
const token=store.visitor(req,res);let preview=null;
if(req.method==='POST'){if(![`http://${req.headers.host}`,`https://${req.headers.host}`].includes(req.headers.origin)){send(403,{message:'请求来源无效'});return true}let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>1024)throw Error('请求内容过大')}const {theme}=JSON.parse(raw),item=result.items.find(t=>t.id===theme&&t.enabled);if(!item){send(400,{message:'主题不可用'});return true}if(item.memberOnly&&!member){const expiresAt=store.startPreview(token,theme,now);if(expiresAt<=now){send(403,{message:'该主题的 30 秒预览已结束',...result,member,serverTime:now,previews:store.previews(token)});return true}preview={theme,expiresAt}}}
send(200,{...result,member,serverTime:now,previews:store.previews(token),preview});
}catch{send(503,{message:'主题权限暂时无法校验，请稍后重试'})}return true}
module.exports={handler,policy};
