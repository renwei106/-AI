process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture}=require('./verify-desktop-pet.cjs'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const f=await fixture(browser),p=f.page,seed=JSON.parse(fs.readFileSync(path.join(__dirname,'../baselines/welcome-logos-before-20261001/shiyu-platform-library.seed.json'))),report=JSON.parse(fs.readFileSync(path.join(__dirname,'welcome-logos/report.json')));
 let requests=0;p.on('request',r=>{if(r.url().includes('/api/shiyu/favicon'))requests++});
 const result=await p.evaluate(async seed=>{
  data=[{id:'gift-'+seed.id,name:seed.name,scenes:seed.scenes.map(s=>({...s,groups:s.groups.map(g=>({...g,items:g.items.map(i=>[i.name,i.url,i.description,i.logo])}))}))}];
  const items=data[0].scenes.flatMap(s=>s.groups.flatMap(g=>g.items)),before=items.map(i=>i.slice(0,3)),custom=[...items[0]];custom[3]='assets/site-icons/notion.svg';data[0].scenes[0].groups[0].items.push(custom);
  spaceId=data[0].id;sceneId=data[0].scenes[1].id;view='space';prefs.width='wide';prefs.mode='dark';prefs.color='#237c76';render();
  await window.ShiyuBookmarkLogos.hydrate();const once=JSON.stringify(data);await window.ShiyuBookmarkLogos.hydrate();
  return {before,after:items.map(i=>i.slice(0,3)),logos:items.map(i=>({url:i[1],logo:i[3]})),custom:custom[3],idempotent:once===JSON.stringify(data)};
 },seed);
 assert.deepEqual(result.before,result.after);assert.equal(result.custom,'assets/site-icons/notion.svg');assert(result.idempotent);assert.equal(requests,0);
 for(const r of report)assert.equal(result.logos.find(i=>i.url===r.url).logo,r.asset);
 await p.setViewportSize({width:1772,height:1015});await p.waitForTimeout(300);await p.screenshot({path:path.join(__dirname,'welcome-logos/workspace-after.png')});
 assert.deepEqual(f.errors,[]);console.log('PASS 300 default logos hydrate locally; custom logos, names, URLs and descriptions preserved; no external resolver requests; repeat is a no-op');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
