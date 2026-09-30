/* Local admin login, with all configuration writes intercepted. */
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../.local/world-groups-review');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5175/',{waitUntil:'networkidle'});
 if(await p.getByLabel('密码',{exact:true}).count()){await p.getByLabel('密码',{exact:true}).fill('123456');await p.locator('button[type="submit"]').click();await p.waitForURL('**/applications')}
 let config=await (await p.request.get('http://127.0.0.1:5175/api/shiyu/operations')).json(),payload;
 config.world.modules={...config.world.modules,resources:true,materials:true};
 config.world.children={resources:{website:true,creator:true},materials:{studio:true,palette:true,cutout:true,emoji:true}};
 await p.route('**/api/shiyu/operations',async r=>{if(r.request().method()==='PUT'){payload=r.request().postDataJSON();config={...config,world:{...config.world,...payload.world},optionNames:payload.optionNames}}await r.fulfill({json:config})});
 await p.goto('http://127.0.0.1:5175/apps/shiyu/feature-flags',{waitUntil:'networkidle'});
 const card=p.locator('.ant-card').filter({has:p.locator('.ant-card-head-title',{hasText:config.optionNames.world})}),drawer=p.locator('.ant-drawer-open');
 const open=()=>card.getByRole('button',{name:/配\s*置/}).click();
 const toggle=name=>drawer.getByRole('switch',{name,exact:true});
 await open();assert.equal(await drawer.getByRole('button',{name:'展开资源库'}).getAttribute('aria-expanded'),'false');
 await drawer.getByRole('button',{name:'展开资源库'}).click();assert.equal(await toggle('网址资源').getAttribute('aria-checked'),'true');
 await toggle('网址资源').click();await drawer.getByRole('button',{name:'收起资源库'}).click();await drawer.getByRole('button',{name:'展开资源库'}).click();assert.equal(await toggle('网址资源').getAttribute('aria-checked'),'false');
 await toggle('资源库').click();assert(await drawer.getByRole('button',{name:'展开资源库'}).isDisabled());
 await toggle('资源库').click();await drawer.getByRole('button',{name:'展开资源库'}).click();
 for(const name of ['网址资源','UP 主资源'])assert.equal(await toggle(name).getAttribute('aria-checked'),'false');
 await toggle('UP 主资源').click();
 await drawer.getByRole('button',{name:'展开素材工具'}).click();assert.equal(await toggle('轻图标').getAttribute('aria-checked'),'true');
 await toggle('素材工具').click();assert(await drawer.getByRole('button',{name:'展开素材工具'}).isDisabled());
 await toggle('素材工具').click();await drawer.getByRole('button',{name:'展开素材工具'}).click();
 for(const name of ['轻图标','轻色卡','轻抠图','轻表情'])assert.equal(await toggle(name).getAttribute('aria-checked'),'false');
 await toggle('轻图标').click();await drawer.getByRole('button',{name:'保存配置'}).click();await drawer.waitFor({state:'hidden'});
 assert.deepEqual(payload.world.children,{resources:{website:false,creator:true},materials:{studio:true,palette:false,cutout:false,emoji:false}});
 await p.reload({waitUntil:'networkidle'});await open();await drawer.getByRole('button',{name:'展开资源库'}).click();await drawer.getByRole('button',{name:'展开素材工具'}).click();
 assert.equal(await toggle('网址资源').getAttribute('aria-checked'),'false');assert.equal(await toggle('轻图标').getAttribute('aria-checked'),'true');
 await drawer.locator('.ant-drawer-body').evaluate(e=>e.scrollTop=200);await p.waitForTimeout(400);await p.screenshot({path:path.join(out,'grouped-drawer.png')});
 await toggle('资源库').click();await drawer.getByRole('button',{name:/取\s*消/}).click();await drawer.waitFor({state:'hidden'});await open();
 assert.equal(await toggle('资源库').getAttribute('aria-checked'),'true');await drawer.getByRole('button',{name:'展开资源库'}).click();assert.equal(await toggle('UP 主资源').getAttribute('aria-checked'),'true');
 assert.deepEqual(errors,[]);console.log('PASS grouped editor expand/collapse, parent cascade, child selection, persistence, cancel');
}finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});
