// Reuse the isolated account fixture; never call real WeChat or mutate online users.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),assert=require('node:assert/strict');
const fixtureFile=path.resolve(__dirname,'account-session-ui.cjs');
const source=fs.readFileSync(fixtureFile,'utf8');const cut=source.lastIndexOf('(async () => {');
const shared=new Module(fixtureFile,module);shared.filename=fixtureFile;shared.paths=module.paths;
shared._compile(source.slice(0,cut)+'\nmodule.exports={fixture,openPage,until,userFor,dataFor};',fixtureFile);
const {fixture,openPage,until,userFor,dataFor}=shared.exports;
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.resolve('.local/wechat-profile-qa');fs.mkdirSync(out,{recursive:true});
async function setup(browser){
  const f=await fixture(browser,'A');let authorized=false;const protection=[];
  await f.context.route('**/api/shiyu/auth/wechat/profile',async route=>{
    const user=userFor(f.session);if(route.request().method()==='PUT'){protection.push(route.request().postDataJSON());return route.fulfill({json:{userId:user.id,ok:true}});}
    return route.fulfill({json:{userId:user.id,enabled:true,pending:!authorized,revision:authorized?'a'.repeat(24):'',nickname:authorized?'微信昵称':'',avatar:authorized?'wechat:'+'a'.repeat(24):''}});
  });
  await f.context.route('**/api/shiyu/auth/wechat/profile-avatar?*',route=>route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2fZ8AAAAASUVORK5CYII=','base64')}));
  const page=await openPage(f);await page.evaluate(()=>openAccountCenter());
  return {f,page,protection,authorize(){authorized=true},async close(){assert.deepEqual(f.errors,[]);await f.close()}};
}
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  {
   const t=await setup(browser);try{
    await t.page.screenshot({path:path.join(out,'before.png')});
    await t.page.waitForTimeout(5500);assert.equal(await t.page.evaluate(()=>accountProfile().name),userFor('A').name);
    t.authorize();await until(()=>t.page.evaluate(()=>accountProfile().name==='微信昵称'&&accountProfile().avatar.startsWith('wechat:')),'late OAuth updates current page');
    assert.equal(await t.page.locator('#account-center[open] .profile-view-summary b,#account-center[open] .account-summary b').first().textContent(),'微信昵称');
    assert.equal(await t.page.locator('#account-center[open] img[alt="微信头像"]').count(),1);
    await t.page.screenshot({path:path.join(out,'after.png')});console.log('PASS authorization 5.5 seconds after registration updates the open profile and avatar');
   }finally{await t.close()}
  }
  {
   const t=await setup(browser);try{
    await t.page.evaluate(()=>window.openShiyuProfileEditor('nickname'));
    await t.page.locator('[data-profile-item-value]').fill('我自己输入的昵称');
    t.authorize();await until(()=>t.page.evaluate(()=>accountProfile().avatar.startsWith('wechat:')),'avatar sync independent of nickname editing');
    assert.equal(await t.page.locator('[data-profile-item-value]').inputValue(),'我自己输入的昵称');
    await t.page.locator('[data-profile-item-save]').click();await t.page.waitForTimeout(2300);
    assert.equal(await t.page.evaluate(()=>accountProfile().name),'我自己输入的昵称');assert.ok(t.protection.some(x=>x.nameManual));console.log('PASS dirty nickname stays intact while the avatar syncs');
   }finally{await t.close()}
  }
  {
   const t=await setup(browser);try{
    await t.page.evaluate(()=>window.ShiyuAvatars.open());const picker=t.page.locator('#avatar-catalog-picker');await picker.waitFor({state:'visible'});
    t.authorize();await until(()=>t.page.evaluate(()=>accountProfile().name==='微信昵称'),'nickname updates while avatar picker stays open');
    assert.equal(await picker.isVisible(),true);assert.equal(await t.page.evaluate(()=>accountProfile().avatar.startsWith('wechat:')),false);
    await picker.locator('[data-avatar-choice]').first().click();await t.page.waitForTimeout(2300);
    assert.ok((await t.page.evaluate(()=>accountProfile().avatar)).startsWith('catalog:'));assert.ok(t.protection.some(x=>x.avatarManual));console.log('PASS open avatar picker is preserved and manual selection wins');
   }finally{await t.close()}
  }
  {
   const t=await setup(browser);let release;try{
    let held=false;await t.f.context.route('**/api/shiyu/auth/wechat/profile',async route=>{
      if(held||route.request().method()!=='GET')return route.fallback();held=true;
      await new Promise(resolve=>release=resolve);
      return route.fulfill({json:{userId:userFor('A').id,enabled:true,pending:false,nickname:'迟到的A昵称',avatar:''}});
    });
    await t.page.evaluate(()=>window.dispatchEvent(new Event('focus')));await until(()=>!!release,'hold old account profile response');
    t.f.session='B';await t.page.evaluate(result=>{ShiyuAccountSession.applyLogin(result);render()},{user:userFor('B'),accountData:dataFor('B')});
    release();await t.page.waitForTimeout(2300);
    assert.equal(await t.page.evaluate(()=>accountProfile().id),userFor('B').id);assert.notEqual(await t.page.evaluate(()=>accountProfile().name),'迟到的A昵称');console.log('PASS delayed profile response cannot update a different account');
   }finally{release?.();await t.close()}
  }
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
