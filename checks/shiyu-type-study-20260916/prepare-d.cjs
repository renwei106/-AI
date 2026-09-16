const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=__dirname;
async function fetchChecked(url,options={}){let last;for(let attempt=0;attempt<3;attempt++){try{const response=await fetch(url,{...options,signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error(response.status+' '+url);return response;}catch(error){last=error;}}throw last;}
(async()=>{
 const text=['index.html','study.js'].map(file=>fs.readFileSync(path.join(root,file),'utf8')).join('')+fs.readFileSync(path.resolve(root,'../../dist/official/v2/index.html'),'utf8')+'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789，。！？：；（）《》「」、“”‘’—…· /:%+−×=↗¥￥游风清楚骨架微微笔意克制的个性一眼可认收笔长短';
 const sample=[...new Set([...text].filter(c=>/[\u0020-\u00ff\u2000-\u9fff\uff00-\uffef]/u.test(c)))].sort().join('');
 const css=[],manifest=[];
 const results=await Promise.allSettled([['Ma Shan Zheng','mashanzheng',400],['Alegreya','alegreya',500]].map(async([family,folder,weight])=>{
  const api='https://fonts.googleapis.com/css2?family='+encodeURIComponent(family)+':wght@'+weight+'&display=swap&text='+encodeURIComponent(sample);
  const sourceCSS=await (await fetchChecked(api,{headers:{'User-Agent':'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'}})).text();
  const match=sourceCSS.match(/url\(([^)]+)\)\s*format\('([^']+)'\)/);if(!match)throw new Error(sourceCSS);
  const file=folder+'-'+weight+'.'+(match[2]==='woff2'?'woff2':'ttf'),data=Buffer.from(await (await fetchChecked(match[1])).arrayBuffer());fs.writeFileSync(path.join(root,'fonts',file),data);
  const license='https://api.github.com/repos/google/fonts/contents/ofl/'+folder+'/OFL.txt?ref=main';
  const licenseText=await(await fetchChecked(license,{headers:{Accept:'application/vnd.github.raw+json'}})).text();if(!licenseText.includes('OPEN FONT LICENSE'))throw new Error('Unexpected license response');fs.writeFileSync(path.join(root,'fonts',family.replaceAll(' ','-')+'-OFL.txt'),licenseText);
  css.push('@font-face{font-family:"'+family+'";font-style:normal;font-weight:'+weight+';font-display:swap;src:url("./'+file+'") format("'+match[2]+'")}');
  manifest.push({family,weight,file,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex'),subset:true,cssSource:api,license});console.log('Ready',family,weight,data.length);
 }));
 for(const result of results)if(result.status==='rejected')throw result.reason;
 fs.writeFileSync(path.join(root,'fonts/d-fonts.css'),css.join('\n')+'\n');fs.writeFileSync(path.join(root,'fonts/d-manifest.json'),JSON.stringify(manifest,null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
