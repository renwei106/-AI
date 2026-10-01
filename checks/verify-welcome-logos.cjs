const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.join(__dirname,'welcome-logos');
(async()=>{const rows=JSON.parse(fs.readFileSync(path.join(out,'report.json'),'utf8')).sort((a,b)=>a.id.localeCompare(b.id));assert.equal(rows.length,300);assert(rows.every(r=>r.status==='verified'));
 const browser=await chromium.launch({channel:'msedge',headless:true});try{const p=await browser.newPage({viewport:{width:1600,height:850}}),errors=[];
  for(let start=0;start<rows.length;start+=60){const batch=rows.slice(start,start+60);await p.setContent('<style>body{margin:0;background:#edf1f0;font:13px "Microsoft YaHei",sans-serif;display:grid;grid-template-columns:repeat(10,1fr);gap:1px}figure{margin:0;height:138px;background:white;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px}img{width:48px;height:48px;object-fit:contain}figcaption{max-width:150px;text-align:center}small{color:#777;font-size:10px}</style>'+batch.map(r=>`<figure><img src="http://127.0.0.1:4318/${r.asset}"><figcaption>${r.name}</figcaption><small>${r.id}</small></figure>`).join(''));
   await p.evaluate(()=>Promise.all([...document.images].map(img=>img.complete?null:new Promise(resolve=>{img.onload=img.onerror=resolve}))));
   const bad=await p.evaluate(()=>[...document.images].filter(i=>!i.naturalWidth||!i.naturalHeight).map(i=>i.src));errors.push(...bad);await p.screenshot({path:path.join(out,`gallery-${start/60+1}.png`)});
  }assert.deepEqual(errors,[]);console.log('PASS 300 local logo images decode in browser');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
