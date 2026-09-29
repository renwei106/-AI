process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4346/';
const {fixture}=require('./verify-desktop-pet.cjs');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),f=await fixture(browser),page=f.page;
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.mouse.move(100,100);
 await page.evaluate(()=>{
  localStorage.setItem('shiyu-desktop-pet-v1',JSON.stringify({enabled:true,skin:'paper',motion:'normal',size:'large',position:{x:800,y:600,width:1440,height:960},updated:Date.now()+100}));
  dispatchEvent(new StorageEvent('storage',{key:'shiyu-desktop-pet-v1'}));
 });
 const root=page.locator('#desktop-pet'),core=root.locator('.pet-character');
 await page.waitForFunction(()=>document.querySelector('.pet-girl-frame'));
 const box=await core.boundingBox(),centerX=box.x+box.width/2,centerY=box.y+box.height/2;
 await page.mouse.move(centerX,centerY);await page.mouse.down();await page.mouse.move(centerX+6,centerY);
 const frames=new Set(),animations=new Set();let animationSeen=false;
 for(let i=0;i<64;i++){
  const state=await root.evaluate(el=>({skin:el.dataset.skin,frame:Number(el.dataset.girlFrame),action:el.dataset.girlAction,animation:getComputedStyle(el.querySelector('.pet-girl-run-frame')).animationName}));
  if(state.action==='run'){
  if(state.frame>=16&&state.frame<=19)frames.add(state.frame);
   animations.add(state.animation);animationSeen ||= state.animation.includes('pet-girl-run');
  }
  await page.mouse.move(centerX+(i%2?18:-18),centerY+((i%3)-1)*3);
  await page.waitForTimeout(45);
 }
 await page.mouse.up();
 assert.deepEqual([...frames].sort(),[16,17,18,19],`the run cycle should pass through both strides and both transition poses; captured ${[...frames]}`);
 assert(animationSeen,`the run cycle adds a small bounce while the pet is moving (animations=${[...animations]})`);
 await page.waitForFunction(()=>document.querySelector('#desktop-pet')?.dataset.girlAction==='settling');
 const release=await root.evaluate(el=>({action:el.dataset.girlAction,runDisplay:getComputedStyle(el.querySelector('.pet-girl-run-frame')).display,baseDisplay:getComputedStyle(el.querySelector('.pet-girl-frame')).display,runSrc:el.querySelector('.pet-girl-run-image')?.getAttribute('href')}));
 assert.equal(release.runDisplay,'none','the independent run frame must stop showing as soon as the pointer is released');
 assert.notEqual(release.baseDisplay,'none','the seated/standing pose sequence must become visible immediately');
 assert.match(release.runSrc,/pet-girl-run-[0-3]\.png$/,'each run pose uses an isolated image instead of a viewport into the neighboring cell');
 assert.deepEqual(f.errors,[]);
 await f.context.close();await browser.close();
 console.log(`PASS girl run alternates two strides and two passing poses with a visible bounce (${[...frames].sort().join(', ')})`);
})().catch(error=>{console.error(error);process.exit(1)});
