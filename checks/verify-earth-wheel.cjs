process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture}=require('./verify-desktop-pet.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.join(__dirname,'earth-wheel');
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const f=await fixture(browser),p=f.page;
 await f.context.route('**/earth-theme.js*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(__dirname,'../dist/earth-theme.js'),'utf8')+'\nwindow.__earthTest=()=>state;'}));
 await p.setViewportSize({width:1772,height:1015});await p.reload({waitUntil:'networkidle'});
 await p.evaluate(()=>{prefs.theme='globe';prefs.homeEntryGesture='scroll';prefs.worldEntryGesture='double';render()});
 await p.waitForFunction(()=>window.__earthTest?.()?.earth.mesh.visible);
 const box=await p.locator('#earth-theme-canvas').boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height/2);
 // Separate physical wheel gestures, including pauses after reaching each limit.
 // A continuous burst alone never exercises the world's double-gesture entry.
 for(const [direction,limit,count] of [[-160,1.22,5],[160,.4,9]]){
  for(let i=0;i<count;i++){
   await p.mouse.wheel(0,direction);await p.waitForTimeout(360);
   assert.equal(await p.evaluate(()=>document.body.classList.contains('world-active')),false,'globe wheel must not enter world');
   assert.equal(await p.evaluate(()=>view),'home','globe wheel must not enter space');
   assert.equal(await p.evaluate(()=>downArmedAt),0,'globe wheel must not arm space entry');
  }
  await p.waitForFunction(limit=>Math.abs(window.__earthTest().zoom.current-limit)<.001,limit);
 }
 await p.screenshot({path:path.join(out,'after-limits.png')});
 // Consumed wheel events must not leave world-entry state armed outside the globe.
 await p.mouse.move(300,140);await p.waitForTimeout(400);await p.mouse.wheel(0,-160);await p.waitForTimeout(360);
 assert.equal(await p.evaluate(()=>document.body.classList.contains('world-active')),false);
 await p.mouse.wheel(0,-160);await p.waitForFunction(()=>document.body.classList.contains('world-active'));
 await p.evaluate(()=>ShiyuWorld.close());await p.waitForTimeout(700);
 await p.mouse.wheel(0,160);await p.waitForTimeout(360);assert.equal(await p.evaluate(()=>view),'home');
 await p.mouse.wheel(0,160);await p.waitForFunction(()=>view==='space');
 assert.deepEqual(f.errors,[]);await f.context.close();
 console.log('PASS separate wheel gestures at both globe limits stay home; world and space still open outside globe');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
