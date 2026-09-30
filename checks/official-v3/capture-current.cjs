process.env.SHIYU_PREVIEW_URL = 'http://127.0.0.1:4318/';
const {fixture}=require('../verify-desktop-pet.cjs');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assets=path.resolve(__dirname,'../../dist/official/v3/assets/current');
(async()=>{
 const operations=await fetch('http://127.0.0.1:5175/api/shiyu/operations').then(r=>r.json());
 const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../../dist/world-config.js'),'utf8'),sandbox);
 const world=sandbox.window.SHIYU_WORLD_CONFIG;
 const summary={font:operations.personalization.fonts.order[0],themes:operations.personalization.themes.options,creators:operations.platformCreators.length,categories:[...new Set(operations.platformCreators.map(c=>c.category))],resources:world.resources.length,collections:world.collections.map(c=>c.title),routes:world.routes.map(r=>r.title),projects:world.projects.map(p=>p.title),worldEnabled:operations.world.enabled};
 fs.writeFileSync(path.join(__dirname,'current-product.json'),JSON.stringify(summary,null,2));console.log(summary);
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const f=await fixture(browser),p=f.page;
 f.operations={...operations,officialFont:'youfeng'};
 await p.reload({waitUntil:'networkidle'});
 await p.setViewportSize({width:1440,height:960});
 for(const theme of ['base','music','flow','globe','paper','cosmos']){
  await p.evaluate(theme=>{prefs.font='youfeng';prefs.explicitFont=true;prefs.theme=theme;prefs.mode=['cosmos','globe'].includes(theme)?'dark':'light';view='home';render();},theme);
  await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(theme==='globe'?2400:650);
  await sharp(await p.screenshot()).webp({quality:90}).toFile(path.join(assets,`theme-${theme}.webp`));
 }
 await p.evaluate(()=>{data=structuredClone(seed);spaceId=data[0].id;sceneId=data[0].scenes[0].id;prefs.theme='base';prefs.mode='light';prefs.font='youfeng';view='space';render();});
 await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(450);
 await sharp(await p.screenshot()).webp({quality:94}).toFile(path.join(assets,'space.webp'));
 const ext=await f.context.newPage();await ext.setViewportSize({width:368,height:650});
 await ext.goto('http://127.0.0.1:4318/extension/preview/popup.html?preview=1',{waitUntil:'networkidle'});
 await ext.evaluate(()=>document.fonts.ready);
 const height=await ext.locator('main').evaluate(n=>Math.ceil(n.getBoundingClientRect().height));
 await sharp(await ext.screenshot({clip:{x:0,y:0,width:368,height}})).webp({quality:96}).toFile(path.join(assets,'extension-popup.webp'));
 console.log('plugin height',height,'captured current product, all API calls isolated');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
