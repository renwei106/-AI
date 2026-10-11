const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const admin='D:/系统文件/文档/ChatGPT/聚合管理后台';
 const {SCENES}=await import('data:text/javascript;base64,'+fs.readFileSync('dist/assets/emergence/scenes.js').toString('base64'));
 assert.deepEqual(JSON.parse(fs.readFileSync(admin+'/membership/emergence-scenes.json')),Object.values(SCENES).map(s=>({id:s.id,name:s.name,basic:s.basic,advanced:s.advanced,lifecycle:s.lifecycle||[]})));
 for(const file of ['engine.js','scenes.js'])assert.equal(fs.readFileSync('dist/assets/emergence/'+file,'utf8'),fs.readFileSync('prototypes/emergence/'+file,'utf8'),'integration preserves prototype simulation: '+file);
 const response=await fetch('http://127.0.0.1:4328/api/shiyu/theme-access');assert(response.ok);const policy=await response.json();assert(policy.items.some(i=>i.id==='emergence'&&i.enabled));
 console.log('PASS matching backend/frontend rule schema, matching prototype/theme engines, live theme-access catalog');
})().catch(e=>{console.error(e);process.exitCode=1});
