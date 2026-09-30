/* Exercise the local admin editor; intercept saves so no real config is changed. */
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const out=path.resolve(__dirname,'../.local/world-controls-review');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5175/',{waitUntil:'networkidle'});
 if(await p.getByLabel('密码',{exact:true}).count()){await p.getByLabel('密码',{exact:true}).fill('123456');await p.locator('button[type="submit"]').click();await p.waitForURL('**/applications')}
 let config=await (await p.request.get('http://127.0.0.1:5175/api/shiyu/operations')).json();
 const original=structuredClone(config);let payload;
 await p.route('**/api/shiyu/operations',async route=>{
  if(route.request().method()==='PUT'){payload=route.request().postDataJSON();config={...config,world:{...config.world,...payload.world},optionNames:payload.optionNames};}
  await route.fulfill({json:config});
 });
 await p.goto('http://127.0.0.1:5175/apps/shiyu/feature-flags',{waitUntil:'networkidle'});
 const card=p.locator('.ant-card').filter({has:p.locator('.ant-card-head-title',{hasText:config.optionNames.world})});
 await card.getByRole('button',{name:/配\s*置/}).click();
 const drawer=p.locator('.ant-drawer-open');
 assert.equal(await drawer.getByRole('switch').count(),7);
 for(const label of ['发现','资源库','学习路线','素材工具','平台精选','一起共建'])assert.equal(await drawer.getByRole('switch',{name:label,exact:true}).count(),1);
 await drawer.getByRole('switch',{name:'素材工具',exact:true}).click();
 await drawer.getByRole('button',{name:'保存配置'}).click();await drawer.waitFor({state:'hidden'});
 assert.equal(payload.world.modules.materials,!original.world.modules.materials);
 assert.deepEqual(Object.keys(payload).sort(),['optionNames','world']);
 await p.reload({waitUntil:'networkidle'});await card.getByRole('button',{name:/配\s*置/}).click();
 assert.equal(await drawer.getByRole('switch',{name:'素材工具',exact:true}).getAttribute('aria-checked'),String(!original.world.modules.materials));
 await drawer.getByRole('switch',{name:'素材工具',exact:true}).waitFor({state:'visible'});await p.waitForTimeout(400);
 await p.screenshot({path:path.join(out,'admin-drawer.png')});
 await drawer.getByRole('switch',{name:'资源库',exact:true}).click();await drawer.getByRole('button',{name:/取\s*消/}).click();await drawer.waitFor({state:'hidden'});
 await card.getByRole('button',{name:/配\s*置/}).click();assert.equal(await drawer.getByRole('switch',{name:'资源库',exact:true}).getAttribute('aria-checked'),String(original.world.modules.resources));
 assert.deepEqual(errors,[]);console.log('PASS admin six switches, save payload, reload, cancel; all saves intercepted');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
