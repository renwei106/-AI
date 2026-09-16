const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {PNG}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const assert=require('node:assert/strict'),path=require('node:path');
let browser;
(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});const shots=[];
  for(const baseline of [true,false]){
    const context=await browser.newContext({viewport:{width:1288,height:1041},reducedMotion:'reduce'});
    if(baseline)await context.route('**/reading-theme.*',route=>{const file=new URL(route.request().url()).pathname.slice(1);return route.fulfill({path:path.resolve('baselines/v192-before-reading-page-world',file),contentType:file.endsWith('.js')?'text/javascript':'text/css'});});
    const page=await context.newPage();await page.clock.setFixedTime(new Date('2026-09-15T10:00:00+08:00'));await page.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});const results=[];
    for(const theme of ['base','poly','reading'])for(const mode of ['light','dark']){
      await page.evaluate(({theme,mode})=>{signed=true;view='home';scope='global';prefs.mode=mode;changeTheme(theme);document.querySelectorAll('.brand-guide,#toast').forEach(e=>e.style.display='none');document.activeElement.blur()}, {theme,mode});
      if(theme!=='reading'){await page.mouse.move(20,750);await page.waitForTimeout(300);results.push(await page.screenshot({animations:'disabled'}));}
      await page.evaluate(()=>{goSpace(data[0].id);scope='global';prefs.spaceDisplayRules={};prefs.sceneDisplayRules={};styles[currentGroup().id]='follow';render();document.querySelectorAll('.brand-guide,#toast').forEach(e=>e.style.display='none');document.activeElement.blur()});
      await page.mouse.move(20,750);await page.waitForTimeout(300);results.push(await page.screenshot({animations:'disabled'}));
      if(theme==='reading'){
        assert.equal(await page.locator('.group:not([hidden]) .cards').getAttribute('data-display'),'shelf');
        await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);results.push(await page.screenshot({animations:'disabled'}));await page.setViewportSize({width:1288,height:1041});
      }
    }
    shots.push(results);await context.close();
  }
  shots[0].forEach((before,i)=>{const a=PNG.sync.read(before),b=PNG.sync.read(shots[1][i]);let changed=0;for(let k=0;k<a.data.length;k++)if(Math.abs(a.data[k]-b.data[k])>1)changed++;assert.equal(changed,0,`unrelated screen ${i} remains identical`);});
  console.log('PASS: 12 baseline screenshot comparisons; original base/poly home and spaces, reading bookshelf desktop/mobile, all in light/dark.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>browser?.close());
