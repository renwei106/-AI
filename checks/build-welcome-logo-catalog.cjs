const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.join(__dirname,'welcome-logos'),rows=JSON.parse(fs.readFileSync(path.join(out,'report.json'),'utf8')).sort((a,b)=>a.id.localeCompare(b.id));
assert.equal(rows.length,300);assert(rows.every(r=>r.status==='verified'));
const catalog=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../baselines/welcome-logos-before-20261001/shiyu-platform-library.seed.json'),'utf8'));
for(const item of catalog.scenes.flatMap(s=>s.groups.flatMap(g=>g.items))){const row=rows.find(r=>r.id===item.id);assert.equal(item.url,row.url);item.logo=row.logo;}
fs.writeFileSync(path.join(out,'catalog.refreshed.json'),JSON.stringify(catalog,null,2)+'\n');
const csv=[['名称','网址','Logo 来源链接','本地图片','来源类型','验证时间'],...rows.map(r=>[r.name,r.url,r.logo,r.asset,r.source,r.checkedAt])].map(row=>row.map(v=>'"'+v.replaceAll('"','""')+'"').join(',')).join('\r\n');
fs.writeFileSync(path.join(out,'logo-links.csv'),'\ufeff'+csv);
const file=path.resolve(__dirname,'../dist/bookmark-logo.js');let js=fs.readFileSync(file,'utf8');
const generated='  // BEGIN VERIFIED WELCOME LOGOS\n  const welcomeLogos = new Map([\n'+rows.map(r=>'    '+JSON.stringify([r.url,r.asset])).join(',\n')+'\n  ])\n  // END VERIFIED WELCOME LOGOS';
if(js.includes('// BEGIN VERIFIED WELCOME LOGOS'))js=js.replace(/  \/\/ BEGIN VERIFIED WELCOME LOGOS[\s\S]*?  \/\/ END VERIFIED WELCOME LOGOS/,generated);
else js=js.replace("  'use strict'","  'use strict'\n"+generated);
fs.writeFileSync(file,js);
console.log('Built 300 source links, review catalog and local logo map');
