process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {fixture}=require('./verify-desktop-pet.cjs');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),f=await fixture(browser),p=f.page;
 await p.emulateMedia({reducedMotion:'no-preference'});
 await p.evaluate(()=>{window.__dialogueLines=[];const root=document.querySelector('#desktop-pet');new MutationObserver(()=>window.__dialogueLines.push(root.querySelector('.pet-speech-text').textContent)).observe(root.querySelector('.pet-speech-text'),{childList:true,characterData:true,subtree:true});localStorage.setItem('shiyu-desktop-pet-v1',JSON.stringify({enabled:true,skin:'paper',motion:'normal',size:'normal',position:{x:1360,y:800,width:1440,height:960},updated:Date.now()+100}));dispatchEvent(new StorageEvent('storage',{key:'shiyu-desktop-pet-v1'}));});
 await p.waitForFunction(()=>document.querySelector('#desktop-pet').dataset.girlAction==='yawn',{}, {timeout:18000});
 await p.waitForFunction(()=>document.querySelector('#desktop-pet .pet-speech-text').textContent.includes('Hello'));
 console.log('YAWN_FRAME',await p.locator('.pet-girl-frame').getAttribute('viewBox'));
 await p.waitForFunction(()=>window.__dialogueLines.some(line=>line.includes('Hello')||line.includes('伸个懒腰')||line.includes('舒展一下')),{},{timeout:12000});
 const lines=await p.evaluate(()=>window.__dialogueLines);
 assert(!lines.some(line=>line.includes('我累了'))&&lines.some(line=>line.includes('Hello')||line.includes('伸个懒腰')||line.includes('舒展一下')),JSON.stringify(lines));
 const box=await p.locator('.pet-character').boundingBox();await p.screenshot({path:require('node:path').resolve(__dirname,'../.local/desktop-pet/yawn-dialogue.png'),clip:{x:Math.max(0,box.x-180),y:Math.max(0,box.y-40),width:Math.min(420,p.viewportSize().width-Math.max(0,box.x-180)),height:Math.min(180,p.viewportSize().height-Math.max(0,box.y-40))}});await p.screenshot({path:require('node:path').resolve(__dirname,'../.local/desktop-pet/yawn-dialogue-full.png')});
 assert.deepEqual(f.errors,[]);await f.context.close();await browser.close();console.log('PASS paper pet uses upbeat, action-matched dialogue for wave and yawn poses');
})().catch(e=>{console.error(e);process.exit(1)});
