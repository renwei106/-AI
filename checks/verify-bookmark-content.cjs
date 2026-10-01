process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture}=require('./verify-desktop-pet.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.join(__dirname,'bookmark-content'),baseline=process.argv.includes('--baseline');
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const f=await fixture(browser),p=f.page;await p.setViewportSize({width:1772,height:1015});
 await p.evaluate(()=>{
  view='space';prefs.theme='base';prefs.mode='dark';prefs.width='wide';prefs.color='#237c76';
  currentGroup().items=['WPS Office','腾讯文档','石墨文档','语雀','金山文档','Microsoft 365','Google Workspace','Notion','Airtable','这是一个用于检查省略显示的超长中文网站名称','VeryLongWebsiteNameWithoutSpacesToCheckTruncation','短名','测试空描述'].map((n,i)=>[n,`https://example.test/${i}`,i===12?'':i%2?'文档、知识库与项目管理，这是用于检查描述截断的更长内容。':'文档、表格与演示制作',i===6?'assets/site-icons/earth-water-mask-4096.png':n[0]]);
  render();
 });
 async function mode(m){await p.evaluate(m=>{prefs.sceneDisplayRules??={};prefs.sceneDisplayRules[sceneId]={style:m};renderGroups()},m);await p.waitForTimeout(100);}
 const modes=await p.evaluate(()=>Object.keys(LINK_VIEWS).filter(m=>m!=='follow'));
 if(baseline){for(const m of ['paper','shelf']){await mode(m);await p.screenshot({path:path.join(out,'before-'+m+'.png')});}console.log(modes);return;}
 for(const width of [1772,1100,390]){
  await p.setViewportSize({width,height:1015});
  for(const m of modes){await mode(m);
   const rows=await p.locator('.group:not([hidden]) .bookmark:not(.page-hidden)').evaluateAll(els=>els.map(e=>{
    const a=e.querySelector('a'),t=a.querySelector('.shelf-title,.paper-site-identity b,.link-film b,.link-book b,.link-note b,.link-calendar b,.link-name,.bookmark-head strong'),d=a.querySelector('.shelf-description,.link-description,.calendar-description,.link-note small,p'),r=e.getBoundingClientRect();
    return {height:e.offsetHeight,x:r.x,y:r.y,logo:!!a.querySelector('.site-icon,.link-emblem,.shelf-mark'),title:t?.textContent,desc:d?.textContent,descVisible:d&&getComputedStyle(d).display!=='none',titleWidth:t?.clientWidth,titleFont:parseFloat(t&&getComputedStyle(t).fontSize),overflow:t?Math.max(0,t.getBoundingClientRect().right-a.getBoundingClientRect().right):0};
   }));
   assert(rows.length>1);assert(Math.max(...rows.map(r=>r.height))-Math.min(...rows.map(r=>r.height))<=1,`${width} ${m} unequal heights ${JSON.stringify(rows)}`);
   for(const r of rows){assert(r.logo&&r.title&&r.descVisible,`${width} ${m} missing content ${JSON.stringify(r)}`);assert(r.overflow<=1,`${width} ${m} overflow`);assert(r.title.length<4||r.titleWidth/r.titleFont>=4,`${width} ${m} title too narrow ${JSON.stringify(r)}`);}
   if(m==='shelf'){for(let i=1;i<rows.length;i++)assert(rows[i].y>rows[i-1].y||rows[i].x>rows[i-1].x,'shelf row-major order');}
   if(width===1772||width===390)await p.screenshot({path:path.join(out,`${width}-${m}.png`)});
   console.log('PASS',width,m,rows[0].height);
  }
 }
 assert.deepEqual(f.errors,[]);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
