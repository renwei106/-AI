/* Local API fixtures only. Exercise actual mouse events after autonomous movement. */
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {fixture,out}=require('./verify-desktop-pet.cjs');

(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const f=await fixture(browser,true,false,false),p=f.page;
  const pet=p.locator('#desktop-pet'),core=pet.locator('.pet-character');
  const center=()=>pet.evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
  const near=(actual,expected,message)=>assert(Math.hypot(actual.x-expected.x,actual.y-expected.y)<1,`${message}: ${JSON.stringify({actual,expected})}`);
  await p.evaluate(()=>{const perch=document.createElement('div');perch.dataset.petPerch='';perch.style.cssText='position:fixed;left:1080px;top:650px;width:110px;height:54px;pointer-events:none';document.body.append(perch);});
  await p.clock.install();
  await core.click();await pet.locator('[data-pet-action="settings"]').click();
  if(process.env.SHIYU_TEST_PET_SKIN)await p.locator(`#settings [data-pet-pref="skin"][data-value="${process.env.SHIYU_TEST_PET_SKIN}"]`).click();
  await p.locator('#settings [data-pet-pref="roaming"][data-value="roam"]').click();
  await p.waitForFunction(()=>ShiyuDesktopPet.read().roaming==='roam');
  await p.locator('#settings .dialog-heading [data-action="close"]').click();
  await p.mouse.move(20,20);
  await p.clock.pauseAt(await p.evaluate(()=>Date.now()+100));
  await p.clock.runFor(59000);
  for(let i=0;i<100&&(await pet.getAttribute('data-roam-phase'))==='idle';i++)await p.clock.runFor(50);
  assert(['run','takeoff','jump','flight'].includes(await pet.getAttribute('data-roam-phase')),`start by interrupting an actual roam: ${await pet.evaluate(el=>JSON.stringify(el.dataset))}`);
  async function dragTo(target,label){
   const start=await center(),box=await core.boundingBox(),pointer={x:box.x+box.width/2,y:box.y+box.height/2};
   await p.mouse.move(pointer.x,pointer.y);await p.mouse.down();
   await p.mouse.move(pointer.x+target.x-start.x,pointer.y+target.y-start.y,{steps:8});
   near(await center(),target,`${label}: pointer movement owns the position`);
   await p.mouse.up();await p.clock.runFor(500);
   near(await center(),target,`${label}: releasing must not restore the old roam point`);
   near(await p.evaluate(()=>ShiyuDesktopPet.read().position),target,`${label}: saved position matches display`);
   await p.mouse.move(20,20);
  }
  const first={x:720,y:400};await dragTo(first,'mid-roam drag');
  await p.clock.runFor(59000);near(await center(),first,'manual position remains unchanged before one minute');
  assert.equal(await pet.getAttribute('data-roam-phase'),'idle');
  await p.clock.runFor(1500);assert.notEqual(await pet.getAttribute('data-roam-phase'),'idle','roaming resumes after one minute');
  await p.clock.runFor(8000);assert.equal(await pet.getAttribute('data-roam-phase'),'idle');
  const second={x:850,y:440};await dragTo(second,'drag after landing');
  await p.evaluate(()=>{prefs.theme='music';prefs.mode='dark';render();});await p.clock.runFor(500);
  near(await center(),second,'theme refresh uses the manually saved anchor');
  await p.screenshot({path:path.join(out,'roam-drag-release.png')});
  await p.clock.resume();await p.reload({waitUntil:'networkidle'});await core.waitFor();
  near(await center(),second,'page reload restores the manually saved anchor');
  assert.equal(await p.evaluate(()=>ShiyuDesktopPet.read().roaming),'roam','dragging preserves roaming mode');
  assert.deepEqual(f.errors,[]);await f.context.close();
  console.log('PASS mid-roam and landed drag, release position, one-minute pause, theme refresh and reload');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
