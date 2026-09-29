process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {fixture}=require('./verify-desktop-pet.cjs');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),f=await fixture(browser),page=f.page;
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>{localStorage.setItem('shiyu-desktop-pet-v1',JSON.stringify({enabled:true,skin:'paper',motion:'normal',size:'normal',position:{x:800,y:600,width:1440,height:960},updated:Date.now()+100}));dispatchEvent(new StorageEvent('storage',{key:'shiyu-desktop-pet-v1'}));});
 const root=page.locator('#desktop-pet'),pet=root.locator('.pet-character'),bubble=root.locator('.pet-speech');const box=await pet.boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2;
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+12,y+4,{steps:2});await page.waitForFunction(()=>document.querySelector('#desktop-pet')?.dataset.girlAction==='run');
 await page.waitForFunction(()=>document.querySelector('#desktop-pet .pet-speech')?.dataset.hint==='run');
 const first=await bubble.locator('.pet-speech-text').textContent();assert(['跑起来啦，一起出发！','风从耳边吹过，好开心！','跟着你去看看新风景！'].includes(first),`run dialogue should match the dragging action: ${first}`);
 await page.waitForTimeout(5100);const second=await bubble.locator('.pet-speech-text').textContent();assert.notEqual(second,first,'run dialogue rotates while the pet is being dragged');assert(!/滚轮|点击|进入/.test(second),`operation hints stay hidden during dragging: ${second}`);
 await page.mouse.up();await page.waitForFunction(()=>document.querySelector('#desktop-pet')?.dataset.girlAction==='settling');assert.equal(await bubble.isHidden(),true,'run dialogue ends when dragging stops');assert.deepEqual(f.errors,[]);
 await f.context.close();await browser.close();console.log('PASS girl shows changing run-matched dialogue while dragged and stops it on release');
})().catch(error=>{console.error(error);process.exit(1)});
