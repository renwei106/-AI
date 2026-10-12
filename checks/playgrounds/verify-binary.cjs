const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const output='.local/checks/binary-restore';
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const reports=[];
  for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
   const context=await browser.newContext({viewport,reducedMotion:'no-preference'}),page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await context.addInitScript(()=>{
    if(localStorage.getItem('binary-restore-fixture'))return;
    localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'base',mode:'dark',color:'#0b5361',brandGuideDismissed:true},signed:false}));
    localStorage.setItem('binary-restore-fixture','1');
   });
   await context.route('**/api/**',route=>{
    const url=route.request().url();
    return route.fulfill({json:url.includes('theme-access')?{items:['base','threeBody'].map(id=>({id,enabled:true,allowed:true,memberOnly:false})),fallback:'base',member:false}:url.includes('/operations')?{threeBodyContent:{allowCustomize:true,defaultScene:'threeBody',scenes:{binarySystem:{enabled:true}}}}:{}});
   });
   await page.goto('http://127.0.0.1:4349/',{waitUntil:'domcontentloaded'});await page.waitForTimeout(1200);
   await page.evaluate(()=>{prefs.theme='threeBody';persist();render();});
   const ready=scene=>page.waitForFunction(expected=>window.ShiyuThreeBodyScene?.snapshot().loaded&&ShiyuThreeBodyScene.snapshot().scene===expected,scene);
   await ready('threeBody');await page.locator('.three-body-open').click();await page.locator('[data-three-scene="binarySystem"]').click();await ready('binarySystem');
   assert.equal(await page.locator('[data-three-param]').count(),4);
   assert.equal(await page.locator('[data-three-param="gravity"]').getAttribute('aria-label'),'引力强度');
   await page.locator('[data-three-param="mass0"]').fill('2');await page.locator('.three-body-close').click();
   assert.equal(await page.locator('[data-three-initial-tap]').isVisible(),false,'binary starts without a bubble or tap entrance');
   assert.equal(await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().initialTapAvailable),false);
   const running=await page.evaluate(()=>ShiyuThreeBodyScene.snapshot());
   assert.equal(running.paused,false,'the original orbit runs immediately');
   await page.waitForFunction(time=>ShiyuThreeBodyScene.snapshot().model.simulationTime>time+.1,running.model.simulationTime);
   if(!await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().paused))await page.locator('[data-three-pause]').click();
   const inert=await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().model);
   await page.evaluate(()=>document.querySelector('[data-three-push]').click());
   assert.deepEqual(await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().model.bodies),inert.bodies,'the retired hidden push cannot disturb the binary orbit');
   await page.mouse.click(viewport.width*.8,viewport.height*.8);await page.waitForTimeout(400);
   await page.mouse.move(viewport.width*.8,viewport.height*.8);await page.mouse.down();await page.waitForTimeout(450);
   assert.equal(await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().accelerating),false,'blank holding has no added acceleration');
   await page.mouse.up();await page.waitForTimeout(400);
   assert.deepEqual(await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().model.bodies),inert.bodies,'blank clicks and holds do not disturb the stars');
   const before=await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().model),region=before.region,star=before.points[0];
   const x=region.x+star.x*region.width/800,y=region.y+star.y*region.height/520;
   await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+35,y+25,{steps:8});await page.mouse.up();
   const after=await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().model);
   assert.ok(after.bodies[0].vx>before.bodies[0].vx);assert.ok(after.bodies[0].vy>before.bodies[0].vy);assert.deepEqual(after.bodies[1],before.bodies[1]);
   assert.deepEqual(after.positions,before.positions,'paused drag changes only the selected star velocity');
   assert.equal(after.params.mass0,2);assert.equal(after.bodies[0].mass,2);
   await page.screenshot({path:output+'/binary-'+viewport.width+'.png'});
   await page.reload({waitUntil:'domcontentloaded'});await ready('binarySystem');
   const restored=await page.evaluate(()=>ShiyuThreeBodyScene.snapshot());
   assert.equal(restored.model.params.mass0,2);assert.equal(restored.model.bodies[0].mass,2);
   assert.equal(await page.locator('[data-three-initial-tap]').isVisible(),false,'reloading never restores a binary bubble');
   await page.locator('.three-body-open').click();await page.screenshot({path:output+'/binary-settings-'+viewport.width+'.png'});
   assert.deepEqual(errors,[]);reports.push({viewport,dragVelocity:{before:[before.bodies[0].vx,before.bodies[0].vy],after:[after.bodies[0].vx,after.bodies[0].vy]},restoredMass:restored.model.params.mass0});
   await context.close();
  }
  fs.writeFileSync(output+'/browser-results.json',JSON.stringify(reports,null,2));
  console.log('PASS binary desktop/mobile: automatic orbit, no bubble or blank disturbance, original drag impulse, settings, persistence and rendering.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
