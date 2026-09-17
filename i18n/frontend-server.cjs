const fs=require('node:fs'),path=require('node:path');
const {resolveLocale}=require('./service.cjs');
const fallback={settings:{languages:[{code:'zh-CN',name:'简体中文',enabled:true,countries:['CN']}],fallback:'zh-CN'},notices:{}};
async function published(){try{const r=await fetch((process.env.SHIYU_ADMIN_ORIGIN||'http://127.0.0.1:5175')+'/api/shiyu/i18n/public',{signal:AbortSignal.timeout(3000)});if(!r.ok)throw new Error();return await r.json()}catch{return fallback}}
function manual(req){return /(?:^|;\s*)shiyu-language=(zh-CN|en|ja)(?:;|$)/.exec(req.headers.cookie||'')?.[1]}
function country(req){
 // Only trust a country header when the deployment explicitly trusts its reverse proxy.
 if(process.env.SHIYU_TRUST_GEO_HEADER!=='1')return '';
 const value=req.headers[String(process.env.SHIYU_GEO_HEADER||'cf-ipcountry').toLowerCase()];return typeof value==='string'&&/^[A-Z]{2}$/.test(value)?value:'';
}
async function localized(req,res,file,root){
 const url=new URL(req.url,'http://localhost');
 if(file!=='index.html'&&!url.searchParams.has('locale'))return false;
 if(!/\.(js|html)$/.test(file)||file.startsWith('i18n-'))return false;
 const state=await published(),region=country(req);
 let locale=resolveLocale(state.settings,file==='index.html'?manual(req):url.searchParams.get('locale'),region),content;
 if(file!=='index.html'&&url.searchParams.get('locale')!==locale){res.writeHead(409);res.end('Language configuration changed; reload this page.');return true}
 if(locale!=='zh-CN'){
  try{const asset=new URL('/api/shiyu/i18n/asset',process.env.SHIYU_ADMIN_ORIGIN||'http://127.0.0.1:5175');asset.searchParams.set('locale',locale);asset.searchParams.set('file',file);const r=await fetch(asset,{signal:AbortSignal.timeout(5000)});if(!r.ok)throw new Error();content=await r.text()}catch{
   // Never mix languages inside a page if its published bundle is unavailable.
   if(file!=='index.html'){res.writeHead(503,{'Content-Type':'text/javascript; charset=utf-8'});res.end('throw new Error("Language bundle temporarily unavailable")');return true}locale='zh-CN';
  }
 }
 content??=fs.readFileSync(path.join(root,file),'utf8');
 if(file==='index.html'){
  const client={locale,settings:state.settings,country:region};
  content=content.replace(/<html lang="[^"]*"/,'<html lang="'+locale+'"');
  if(locale!=='zh-CN')content=content.replace(/(<script\b[^>]*\bsrc=")([^"?]+\.js)(")/g,(all,start,src,end)=>src.startsWith('i18n-')||src.startsWith('assets/')?all:start+src+'?locale='+locale+end);
  content=content.replace('</head>','<script>window.SHIYU_LOCALE_STATE='+JSON.stringify(client).replace(/</g,'\\u003c')+'</script><link rel="stylesheet" href="/i18n-client.css"><script src="/i18n-client.js" defer></script></head>');
 }
 res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':'text/javascript; charset=utf-8','Cache-Control':'no-store','Vary':'Cookie','Content-Language':locale});res.end(content);return true;
}
module.exports={localized,published,country};
