const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fixture=require('./baseline.json');
const fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true});const p=await b.newPage({viewport:{width:1573,height:1041},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(value=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({...value,signed:true})),fixture);
 await p.goto('http://127.0.0.1:4318');await p.evaluate(()=>goSpace('create'));
 const shot=async name=>{await p.mouse.move(15,400);await p.waitForTimeout(400);await p.screenshot({path:'checks/space-atlas/v3-'+name+'.png'})};
 await shot('daily');await p.locator('.workspace .space-mode-entry').hover();await p.locator('[data-space-mode=atlas]').click();await shot('radial');
 for(const layout of ['organization','mindmap','radial']){await p.locator('[data-at=layouts]').click();await p.locator('[data-at-layout='+layout+']').click();await shot(layout)}
 await p.locator('[data-at-focus="c:mock-inspiration-v1-0"]').first().click();await shot('scene');
 await p.locator('.at-node[data-kind=bundle] button').first().click();await shot('group');
 await p.locator('[data-at-mode="3d"]').click();await shot('3d');
 await p.locator('.at-node[data-kind=group] .at-node-main').first().hover();await p.screenshot({path:'checks/space-atlas/v3-flow.png'});
 await p.evaluate(()=>goSpace('work'));await shot('work');await p.locator('[data-at-mode="2d"]').click();await shot('work-2d');await p.locator('[data-at-focus="c:daily"]').first().click();await shot('work-scene');
 await p.locator('[data-at-focus="g:tools"]').first().click();await shot('work-links');
 await p.evaluate(()=>{prefs.mode='dark';render()});await shot('dark');await p.setViewportSize({width:390,height:844});await shot('mobile');
 console.log('errors',errors);fs.writeFileSync('checks/space-atlas/v3-errors.json',JSON.stringify(errors));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
