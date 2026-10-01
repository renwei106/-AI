const fs=require('node:fs'),path=require('node:path');
const {image,rows,assets,reportPath}=require('./refresh-welcome-logos.cjs');
const generic=new Set(['dbc401bb28d878101bb838a1265bb3e8ef57508c857c9cd4fde7c0d726060b5f','f594faa8f108ab9610dac7541200eadcaf558bd8944dc57e28f411a9a060ea9e']);
(async()=>{const todo=rows.filter(r=>r.status!=='verified');let cursor=0;
 await Promise.all(Array.from({length:8},async()=>{while(cursor<todo.length){const row=todo[cursor++],host=new URL(row.url).hostname;
  for(const url of [`https://favicon.im/${host}`,`https://icon.horse/icon/${host}`]){try{const im=await image(url);if(generic.has(im.hash))throw Error('generic placeholder');const asset=`welcome-${row.id}.${im.ext}`;fs.writeFileSync(path.join(assets,asset),im.bytes);Object.assign(row,{status:'verified',source:'icon-cache',logo:im.url,asset:'assets/site-icons/'+asset,bytes:im.bytes.length,hash:im.hash,checkedAt:new Date().toISOString()});break;}catch(e){row.errors.push({url,error:e.message})}}
  fs.writeFileSync(reportPath,JSON.stringify(rows,null,2));console.log(row.name,row.status);
 }}));console.log('verified',rows.filter(r=>r.status==='verified').length,'unresolved',rows.filter(r=>r.status!=='verified').map(r=>r.name));
})().catch(e=>{console.error(e);process.exitCode=1});
