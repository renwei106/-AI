const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=__dirname,site=path.resolve(root,'../../dist/official/v2');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function collect(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?collect(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
async function download(url,file){let last;const target=url.replace(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/main\/(.+)$/,'https://api.github.com/repos/$1/$2/contents/$3?ref=main');for(let attempt=0;attempt<3;attempt++){try{const res=await fetch(target,{headers:{Accept:'application/vnd.github.raw+json'},signal:AbortSignal.timeout(45000)});if(!res.ok)throw new Error(res.status+' '+target);const data=Buffer.from(await res.arrayBuffer());fs.writeFileSync(file,data);return data;}catch(error){last=error;console.log('Retry',path.basename(file),attempt+1);}}throw last;}
(async()=>{
  fs.mkdirSync(path.join(root,'fonts'),{recursive:true});fs.mkdirSync(path.join(root,'captures'),{recursive:true});
  const baseline=path.join(root,'baseline-hashes.json');if(!fs.existsSync(baseline))fs.writeFileSync(baseline,JSON.stringify({created:new Date().toISOString(),root:site,files:Object.fromEntries(collect(site).map(file=>[path.relative(site,file),hash(file)]))},null,2));
  const sources=['index.html','study.js','comparison.html'].map(file=>fs.readFileSync(path.join(root,file),'utf8')).join('')+fs.readFileSync(path.join(site,'index.html'),'utf8')+'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789，。！？：；（）《》「」、“”‘’—…· /:%+−×=↗¥￥永国隅拾静风雅清韵喜欢日常世界呼吸向内节奏';
  const sample=[...new Set([...sources].filter(c=>/[\u0020-\u00ff\u2000-\u9fff\uff00-\uffef]/u.test(c)))].sort().join('');
  const fontSpecs=[['Noto Serif SC',400,'notoserifsc'],['Noto Sans SC',300,'notosanssc'],['Noto Sans SC',400,'notosanssc'],['Cormorant Garamond',500,'cormorantgaramond'],['Lora',400,'lora'],['Manrope',400,'manrope']];
  const css=[],manifest=[];
  const results=await Promise.allSettled(fontSpecs.map(async([family,weight,folder])=>{
    const api='https://fonts.googleapis.com/css2?family='+encodeURIComponent(family)+':wght@'+weight+'&display=swap&text='+encodeURIComponent(sample);
    const response=await fetch(api,{headers:{'User-Agent':'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'},signal:AbortSignal.timeout(30000)});
    if(!response.ok)throw new Error('Font CSS '+family+': '+response.status);
    const sourceCSS=await response.text();const match=sourceCSS.match(/url\(([^)]+)\)\s*format\('([^']+)'\)/);if(!match)throw new Error(sourceCSS);
    const ext=match[2]==='woff2'?'woff2':'ttf',name=folder+'-'+weight+'.'+ext;
    const data=await download(match[1],path.join(root,'fonts',name));
    css.push('@font-face{font-family:"'+family+'";font-style:normal;font-weight:'+weight+';font-display:swap;src:url("./'+name+'") format("'+match[2]+'")}');
    manifest.push({family,weight,file:name,bytes:data.length,sha256:hash(path.join(root,'fonts',name)),subset:true,cssSource:api,license:'https://raw.githubusercontent.com/google/fonts/main/ofl/'+folder+'/OFL.txt'});
    console.log('Ready',family,weight,data.length);
  }));
  for(const result of results)if(result.status==='rejected')throw result.reason;
  const wenUrl='https://raw.githubusercontent.com/lxgw/LxgwWenKai/main/fonts/TTF/LXGWWenKai-Regular.ttf';
  const wenFile=path.join(root,'fonts','LXGWWenKai-Regular.ttf');if(!fs.existsSync(wenFile))await download(wenUrl,wenFile);
  css.push('@font-face{font-family:"LXGW WenKai";font-style:normal;font-weight:400;font-display:swap;src:url("./LXGWWenKai-Regular.ttf") format("truetype")}');
  manifest.push({family:'LXGW WenKai',weight:400,file:'LXGWWenKai-Regular.ttf',bytes:fs.statSync(wenFile).size,sha256:hash(wenFile),subset:false,source:wenUrl,license:'https://raw.githubusercontent.com/lxgw/LxgwWenKai/main/OFL.txt'});
  const licenses=await Promise.allSettled([...new Map(manifest.map(font=>[font.family,font])).values()].map(font=>download(font.license,path.join(root,'fonts',font.family.replaceAll(' ','-')+'-OFL.txt'))));
  for(const result of licenses)if(result.status==='rejected')throw result.reason;
  fs.writeFileSync(path.join(root,'fonts','fonts.css'),css.join('\n')+'\n');
  fs.writeFileSync(path.join(root,'fonts','manifest.json'),JSON.stringify(manifest,null,2));
  console.log('Fonts and licenses ready:',manifest.length,'files. Official files untouched.');
})().catch(error=>{console.error(error);process.exitCode=1});
