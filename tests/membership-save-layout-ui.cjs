const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {createPlanStore}=require('../../聚合管理后台/membership/plan-store.cjs');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'member-layout-'));
const store=createPlanStore({file:path.join(temporary,'plans.json'),themesFile:path.join(temporary,'themes.json')});
const out=path.resolve(__dirname,'artifacts-membership-save-layout');fs.mkdirSync(out,{recursive:true});
const live=path.resolve(__dirname,'../../聚合管理后台/.local/shiyu-plans.json');const before=fs.existsSync(live)?fs.readFileSync(live,'utf8'):null;
let writes=0;
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const context=await browser.newContext({viewport:{width:2010,height:1014},reducedMotion:'reduce'});
  await context.route('**/api/**',async route=>{
   const req=route.request(),p=new URL(req.url()).pathname,reply=(v,s=200)=>route.fulfill({status:s,contentType:'application/json',body:JSON.stringify(v)});
   if(p==='/api/platform/session')return reply({active:true,admin:{id:'qa',name:'隔离测试',account:'qa'},applicationIds:['platform','shiyu'],roleIds:['superadmin']});
   if(p==='/api/platform/applications')return reply([{id:'shiyu',name:'拾隅',enabled:true,url:'http://127.0.0.1:5175/apps/shiyu/plans'}]);
   if(p==='/api/shiyu/plans/admin') {
    if(req.method()==='GET')return reply(store.readAdminPlans());
    writes++;try{return reply(store.mutate(req.postDataJSON(),'隔离布局测试'))}catch(e){return reply({message:e.message},e.status||400)}
   }
   if(p==='/api/shiyu/plans/catalog')return reply(store.getCatalog());
   if(p==='/api/shiyu/plans')return reply({items:store.readPublishedPlans()});
   if(!['GET','HEAD'].includes(req.method()))throw Error('Unexpected write '+p);
   return route.continue();
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5175/apps/shiyu/plans');await page.locator('.membership-plan-toolbar').getByText('编辑全部',{exact:true}).click();
  await page.getByRole('button',{name:'切换主题',exact:true}).click();await page.locator('.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item').filter({hasText:'夜间模式'}).click();
  await page.locator('.membership-matrix [data-benefit-key="share-password"] td[data-plan-id="free"] input').check();
  await page.evaluate(()=>{document.querySelector('.admin-content').scrollTop=0});
  const width=await page.evaluate(()=>({viewport:innerWidth,headerRight:document.querySelector('.membership-plan-manager>.ant-card-head').getBoundingClientRect().right,contentWidth:document.querySelector('.admin-content').clientWidth,contentScrollWidth:document.querySelector('.admin-content').scrollWidth}));
  console.log('Layout dimensions',width);
  await page.evaluate(()=>{document.querySelector('.admin-content').scrollTop=document.querySelector('.admin-content').scrollHeight});
  await page.waitForTimeout(200);await page.screenshot({path:path.join(out,process.env.LAYOUT_BEFORE?'before.png':'after-bottom.png'),animations:'disabled'});
  const bounds=await page.locator('[data-role="save-and-publish"]').boundingBox();console.log('Save button at bottom',bounds);
  if(process.env.LAYOUT_BEFORE)return;
  assert(width.headerRight<=2010);assert(width.contentScrollWidth<=width.contentWidth+1);
  assert(bounds.y>=64&&bounds.y+bounds.height<=1014&&bounds.x+bounds.width<=2010,'Save stays in visible content at bottom');
  const scroll=await page.evaluate(()=>document.querySelector('.admin-content').scrollTop);assert(scroll>0);
  await page.mouse.move(1300,500);await page.mouse.wheel(0,-400);await page.waitForTimeout(250);assert(await page.evaluate(()=>document.querySelector('.admin-content').scrollTop)<scroll,'Content scrolls up');
  await page.locator('.ant-segmented-item').filter({hasText:/^限时免费$/}).click();await page.locator('.ant-segmented-item').filter({hasText:/^套餐与权益$/}).click();assert.equal(await page.locator('.membership-matrix [data-benefit-key="share-password"] td[data-plan-id="free"] input').isChecked(),true,'Unsaved edits survive tab switch');
  await page.evaluate(()=>{document.querySelector('.admin-content').scrollTop=document.querySelector('.admin-content').scrollHeight;document.querySelector('.shiyu-matrix-scroll').scrollLeft=document.querySelector('.shiyu-matrix-scroll').scrollWidth});
  assert((await page.locator('[data-role="save-and-publish"]').boundingBox()).x<2010,'Horizontal table scrolling leaves save reachable');
  await page.locator('[data-role="save-and-publish"]').click();await page.waitForFunction(()=>document.querySelector('.membership-plan-toolbar .ant-segmented-item-selected')?.textContent==='查看已上线');assert.equal(writes,1);assert.equal(store.readPublishedPlans().find(p=>p.id==='free').entitlements.find(b=>b.key==='share-password').enabled,true);
  assert.deepEqual(errors,[]);assert.equal(fs.existsSync(live)?fs.readFileSync(live,'utf8'):null,before,'Actual membership config untouched');
  console.log('PASS viewport 2010x1014 dark: bounded width, sticky save at table bottom, wheel scrolling, draft preservation and isolated save.');
 }finally{await browser.close();fs.rmSync(temporary,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exitCode=1});
