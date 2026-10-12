const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const output='.local/checks/verify-three-bubble-charge-sync';
const minimumAngle=1*Math.PI/180,maximumAngle=5*Math.PI/180;
const near=(value,expected,tolerance=1e-7)=>assert.ok(Math.abs(value-expected)<tolerance,`${value} vs ${expected}`);
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const page=await browser.newPage({viewport:{width:2066,height:1070}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'base',mode:'dark',color:'linear-gradient(135deg,#7ed6ce,#adb9a5)',brandGuideDismissed:true},signed:false})));
  await page.route('**/api/**',route=>{
   const path=new URL(route.request().url()).pathname;
   return route.fulfill({json:path.endsWith('/theme-access')?{items:['base','threeBody'].map(id=>({id,enabled:true,allowed:true,memberOnly:false})),fallback:'base',member:false}:path.endsWith('/operations')?{onboarding:{enabled:false},world:{enabled:false}}:{}});
  });
  await page.goto('http://127.0.0.1:4349/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1200);
  await page.evaluate(()=>{prefs.theme='threeBody';render();});
  await page.waitForFunction(()=>window.ShiyuThreeBodyScene?.snapshot().loaded);
  await page.evaluate(()=>{if(!ShiyuThreeBodyScene.snapshot().paused)document.querySelector('[data-three-pause]').click();
   const bubble=document.querySelector('[data-three-initial-tap]');window.releaseSamples=[];
   bubble.addEventListener('pointerdown',event=>{window.pressedAt=performance.now();window.pressedId=event.pointerId;},true);
   bubble.addEventListener('pointerup',()=>{
    const fill=bubble.getAnimations({subtree:true}).find(animation=>animation.animationName==='three-push-fill');
    const style=getComputedStyle(bubble,'::before'),height=parseFloat(style.height),y=new DOMMatrixReadOnly(style.transform).m42;
    window.releaseSamples.push({held:performance.now()-window.pressedAt,power:fill?.effect?.getComputedTiming().progress??0,waterProgress:(1-y/height)/1.14});
   },true);
  });
  const reset=()=>page.evaluate(()=>{document.querySelector('.three-body-open').click();document.querySelector('.three-body-panel [data-three-scene="threeBody"]').click();document.querySelector('.three-body-close').click();});
  const bubble=page.locator('[data-three-initial-tap]');
  const press=async()=>{const box=await bubble.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();};
  const rows=[];
  for(const delay of [0,200,400,600,800,1300]){
   await reset();const before=await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().bodies);
   await press();if(delay)await page.waitForTimeout(delay);
   await page.mouse.up();
   const state=await page.evaluate(()=>({sample:releaseSamples.at(-1),snapshot:ShiyuThreeBodyScene.snapshot()}));
   const after=state.snapshot.bodies,angle=Math.atan2(after[0].vy,after[0].vx)-Math.atan2(before[0].vy,before[0].vx);
   const {power,waterProgress,held}=state.sample;
   near(angle,(1+4*power)*Math.PI/180);
   near(waterProgress,power,1e-5);
   near(Math.hypot(after[0].vx,after[0].vy),Math.hypot(before[0].vx,before[0].vy));
   assert.deepEqual(after.slice(1),before.slice(1));
   assert.equal(state.snapshot.initialTapAvailable,false);
   assert.ok(angle>=minimumAngle-1e-8&&angle<=maximumAngle+1e-8);
   near(power,Math.min(1,Math.max(0,(held-80)/650)),.08);
   rows.push({delay,held,power,waterProgress,angle});
  }
  near(rows[0].angle,minimumAngle);
  assert.ok(rows[1].angle>rows[0].angle&&rows[2].angle>rows[1].angle&&rows[3].angle>rows[2].angle);
  near(rows[4].angle,maximumAngle);near(rows[5].angle,maximumAngle);
  // Capture intermediate and full water levels without changing the button's look.
  for(const delay of [200,400,800]){
   await reset();await press();await page.waitForTimeout(delay);
   const box=await bubble.boundingBox();
   await page.screenshot({path:output+'/water-'+delay+'.png',clip:{x:box.x-45,y:box.y-45,width:158,height:158}});
   await page.mouse.up();
  }
  await reset();const beforeCancel=await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().bodies);
  await press();await page.waitForTimeout(300);
  await page.evaluate(()=>document.querySelector('[data-three-initial-tap]').dispatchEvent(new PointerEvent('pointercancel',{pointerId:pressedId})));
  await page.mouse.up();assert.deepEqual(await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().bodies),beforeCancel);
  assert.equal(await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().initialTapAvailable),true);
  await bubble.focus();await page.keyboard.press('Enter');
  const keyboard=await page.evaluate(()=>ShiyuThreeBodyScene.snapshot());
  near(Math.atan2(keyboard.bodies[0].vy,keyboard.bodies[0].vx)-Math.atan2(beforeCancel[0].vy,beforeCancel[0].vx),minimumAngle);
  assert.equal(keyboard.initialTapAvailable,false);
  assert.deepEqual(errors,[]);fs.writeFileSync(output+'/results.json',JSON.stringify(rows,null,2));
  console.log('PASS: increasing hold duration and water level share the same perturbation power; tap minimum, full/overfull cap, cancellation, keyboard and one-body rotation remain correct.',rows);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
