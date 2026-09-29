process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {fixture}=require('./verify-desktop-pet.cjs');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),f=await fixture(browser),page=f.page;
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>{localStorage.setItem('shiyu-desktop-pet-v1',JSON.stringify({enabled:true,skin:'paper',motion:'normal',size:'normal',position:{x:800,y:600,width:1440,height:960},updated:Date.now()+100}));dispatchEvent(new StorageEvent('storage',{key:'shiyu-desktop-pet-v1'}));});
 const pet=page.locator('#desktop-pet .pet-character'),bubble=page.locator('#desktop-pet .pet-speech');await pet.hover();await page.waitForFunction(()=>{const n=document.querySelector('#desktop-pet .pet-speech');return n&&!n.hidden;});
 const result=await page.evaluate(()=>{const bubble=document.querySelector('#desktop-pet .pet-speech'),pet=document.querySelector('#desktop-pet .pet-character'),b=bubble.getBoundingClientRect(),p=pet.getBoundingClientRect(),edge=bubble.dataset.tailEdge,tailX=parseFloat(bubble.style.getPropertyValue('--pet-speech-tail-x')),angle=parseFloat(bubble.style.getPropertyValue('--pet-speech-tail-angle'))*Math.PI/180,baseY=edge==='top'?b.top:b.bottom,tipX=b.left+tailX+Math.sin(angle)*4,tipY=baseY+(edge==='top'?-1:1)*Math.cos(angle)*4,targetX=p.left+p.width/2,targetY=p.top+Math.max(8,Math.min(16,p.height*.12));return {offset:Math.hypot(tipX-targetX,tipY-targetY),bubble:{x:b.x,y:b.y,width:b.width,height:b.height},pet:{x:p.x,y:p.y,width:p.width,height:p.height},edge,angle:angle*180/Math.PI};});
 assert(result.offset<16,`tail should point near the character head: ${JSON.stringify(result)}`);assert.deepEqual(f.errors,[]);await f.context.close();await browser.close();console.log(`PASS dialogue stays near the pet and its tail points at the head (${result.offset.toFixed(1)}px)`);
})().catch(error=>{console.error(error);process.exit(1)});
