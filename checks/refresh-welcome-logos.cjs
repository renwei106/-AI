const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'welcome-logos'),assets=path.join(root,'dist/assets/site-icons');
const seed=JSON.parse(fs.readFileSync(path.resolve(root,'../聚合管理后台/shiyu-platform-library.seed.json'),'utf8'));
fs.mkdirSync(out,{recursive:true});
const sites=seed.scenes.flatMap(s=>s.groups.flatMap(g=>g.items));
const reportPath=path.join(out,'report.json'),rows=fs.existsSync(reportPath)?JSON.parse(fs.readFileSync(reportPath,'utf8')):[];
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#(\d+);/g,(_,v)=>String.fromCharCode(v));
function attr(tag,name){return decode(tag.match(new RegExp('\\b'+name+'\\s*=\\s*(?:"([^"]*)"|\x27([^\x27]*)\x27|([^\\s>]+))','i'))?.slice(1).find(v=>v!==undefined)||'');}
async function get(url,limit=3_000_000,headers={}){const r=await fetch(url,{signal:AbortSignal.timeout(6500),headers:{'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',accept:'*/*',...headers}});if(!r.ok)throw Error('HTTP '+r.status);if(Number(r.headers.get('content-length'))>limit)throw Error('too large');const b=Buffer.from(await r.arrayBuffer());if(b.length>limit)throw Error('too large');return {url:r.url,bytes:b,type:r.headers.get('content-type')||''};}
async function image(raw,headers={}){const r=await get(raw,3_000_000,headers),b=r.bytes;let ext;
 if(b.length>=22&&b.readUInt32LE(0)===65536&&b.readUInt16LE(4)>0)ext='ico';
 else if(b.toString('utf8',0,500).match(/<svg[\s>]/i)){
  const s=b.toString();if(/<script|<foreignObject|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?:https?:|\/\/|javascript:)/i.test(s))throw Error('unsafe svg');await sharp(b).metadata();ext='svg';
 }else{const m=await sharp(b).metadata();if(!['png','jpeg','webp','gif','avif'].includes(m.format))throw Error('not an image');r.bytes=await sharp(b,{animated:false}).resize(128,128,{fit:'inside',withoutEnlargement:true}).png().toBuffer();ext='png';}
 if(r.bytes.length<40)throw Error('empty image');return {...r,ext,hash:crypto.createHash('sha256').update(r.bytes).digest('hex')};
}
async function resolve(site){const candidates=[],add=(url,source,base=site.url)=>{try{const u=new URL(url,base);if(['https:','http:'].includes(u.protocol)&&!candidates.some(x=>x.url===u.href))candidates.push({url:u.href,source});}catch{}};let pageError='';
 try{const p=await get(site.url,4_000_000),html=p.bytes.toString('utf8'),baseTag=html.match(/<base\b[^>]*>/i)?.[0],base=baseTag?new URL(attr(baseTag,'href'),p.url).href:p.url;
  const links=[...html.matchAll(/<link\b[^>]*>/gi)].map(m=>m[0]).filter(t=>/(?:^|\s)(?:icon|apple-touch-icon|apple-touch-icon-precomposed)(?:\s|$)/i.test(attr(t,'rel'))).sort((a,b)=>Number(attr(b,'sizes').split('x')[0]||0)-Number(attr(a,'sizes').split('x')[0]||0));
  for(const tag of links)add(attr(tag,'href'),'official-page',base);
  add('/favicon.ico','official-fallback',p.url);
 }catch(e){pageError=e.message;}
 add(site.logo,'previous');add('/favicon.ico','official-fallback');
 const errors=[];
 for(const c of candidates.slice(0,7)){try{const im=await image(c.url),asset=`welcome-${site.id}.${im.ext}`;fs.writeFileSync(path.join(assets,asset),im.bytes);return {id:site.id,name:site.name,url:site.url,oldLogo:site.logo,status:'verified',source:c.source,logo:im.url,asset:'assets/site-icons/'+asset,bytes:im.bytes.length,hash:im.hash,checkedAt:new Date().toISOString()};}catch(e){errors.push({url:c.url,error:e.message})}}
 return {id:site.id,name:site.name,url:site.url,oldLogo:site.logo,status:'unresolved',pageError,errors};
}
async function main(){let cursor=0,done=0;const targets=sites.filter(s=>!rows.some(r=>r.id===s.id&&r.status==='verified'));
 await Promise.all(Array.from({length:12},async()=>{while(cursor<targets.length){const site=targets[cursor++],result=await resolve(site),old=rows.findIndex(x=>x.id===site.id);if(old>=0)rows[old]=result;else rows.push(result);fs.writeFileSync(reportPath,JSON.stringify(rows,null,2));done++;if(done%20===0)console.log(done+'/'+targets.length,'verified',rows.filter(r=>r.status==='verified').length);}}));
 console.log(JSON.stringify({verified:rows.filter(r=>r.status==='verified').length,unresolved:rows.filter(r=>r.status!=='verified').map(r=>[r.name,r.url])},null,2));
}
module.exports={get,image,sites,rows,out,assets,reportPath};if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
