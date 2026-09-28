/* Exercise actual drag limits with normal animation; all APIs use the local fixture. */
const {fixture,out}=require('./verify-desktop-pet.cjs');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
const core=p=>p.locator('#desktop-pet .pet-character');
async function setSize(p,size){
  await p.evaluate(size=>{
    const key='shiyu-desktop-pet-v1';
    const config={...ShiyuDesktopPet.read(),size,skin:'sprout',motion:'normal',updated:Date.now()+1};
    localStorage.setItem(key,JSON.stringify(config));
    window.dispatchEvent(new StorageEvent('storage',{key}));
  },size);
}
async function drag(p,x,y){
  const r=await core(p).boundingBox();
  await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.down();
  await p.waitForTimeout(300);await p.mouse.move(x,y,{steps:8});
  assert.equal(await p.locator('#desktop-pet').getAttribute('data-open'),'false');
  await p.mouse.up();await p.waitForTimeout(430);
  await p.mouse.move(720,480);await core(p).hover();
  await p.locator('#desktop-pet[data-open=true]').waitFor();await p.waitForTimeout(450);
}
async function inspect(p,label,direction){
  const state=await p.locator('#desktop-pet').evaluate(root=>{
    const pet=root.getBoundingClientRect();
    const items=[...root.querySelectorAll('.pet-menu button')].map(el=>{
      const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
      return {id:el.dataset.petId||'settings',x,y,left:r.left,top:r.top,right:r.right,bottom:r.bottom,
        angle:Math.atan2(y-pet.y-pet.height/2,x-pet.x-pet.width/2),nav:el.classList.contains('pet-nav'),
        reachable:el.contains(document.elementFromPoint(x,y))};
    });
    return {compact:root.dataset.compact,direction:root.dataset.direction,items,width:innerWidth,height:innerHeight};
  });
  assert.equal(state.compact,'false',`${label}: corner must retain the radial menu`);
  assert.equal(state.direction,direction,label);
  for(const b of state.items){
    assert(b.left>=0&&b.top>=0&&b.right<=state.width&&b.bottom<=state.height,`${label}: clipped ${b.id}`);
    assert(b.reachable,`${label}: obstructed ${b.id}`);
  }
  for(let i=0;i<state.items.length;i++)for(const b of state.items.slice(i+1)){
    const a=state.items[i];
    assert(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top,`${label}: overlapping ${a.id} and ${b.id}`);
  }
  for(const nav of [false,true]){
    const angles=state.items.filter(b=>b.id!=='settings'&&b.nav===nav).map(b=>((b.angle+Math.PI*2)%(Math.PI*2))).sort((a,b)=>a-b);
    const gaps=angles.map((a,i)=>(angles[(i+1)%angles.length]-a+Math.PI*2)%(Math.PI*2));
    assert(Math.PI*2-Math.max(...gaps)<=Math.PI/2+.01,`${label}: arc should fit an inward quarter circle`);
  }
}
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const f=await fixture(browser),p=f.page;
    await p.emulateMedia({reducedMotion:'no-preference'});
    await p.evaluate(()=>{prefs.theme='music';prefs.mode='dark';render();});
    for(const size of ['small','normal','large']){
      await setSize(p,size);
      for(const [x,y,direction] of [[1440,960,'upper-left'],[0,0,'lower-right'],[1440,0,'lower-left'],[0,960,'upper-right']]){
        await drag(p,x,y);
        await p.screenshot({path:path.join(out,`corner-after-${size}-${direction}.png`)});
        await inspect(p,`${size} ${direction}`,direction);
      }
    }
    // The hover corridor must also reach the first and last buttons of a narrow arc.
    for(const id of ['common','__more','home','world']){
      await core(p).hover();
      const target=p.locator(`.pet-menu [data-pet-id="${id}"]`),box=await target.boundingBox();
      await p.mouse.move(box.x+box.width/2,box.y+box.height/2,{steps:10});await p.waitForTimeout(360);
      assert.equal(await p.locator('#desktop-pet').getAttribute('data-open'),'true',`hover path to ${id}`);
    }
    await p.locator('.pet-menu [data-pet-id=common]').click();await p.locator('#my-corner[open]').waitFor();
    await core(p).click();await p.locator('.pet-menu [data-pet-id=home]').click();
    await p.waitForFunction(()=>view==='home'&&!document.querySelector('#my-corner[open]'));
    const position=await p.evaluate(()=>ShiyuDesktopPet.read().position);
    await p.reload({waitUntil:'networkidle'});await core(p).hover();await p.waitForTimeout(550);
    assert.deepEqual(await p.evaluate(()=>ShiyuDesktopPet.read().position),position);
    await inspect(p,'restored corner','upper-right');
    // A truly narrow viewport may use the existing compact menu, without inheriting radial animation.
    await p.setViewportSize({width:320,height:480});await core(p).click();await p.waitForTimeout(450);
    const hiddenTargets=await p.locator('.pet-menu button').evaluateAll(items=>items.filter(el=>{
      const r=el.getBoundingClientRect();return !el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
    }).map(el=>el.getAttribute('aria-label')));
    assert.deepEqual(hiddenTargets,[],'small viewport buttons stay clickable with normal animation');
    assert.deepEqual(f.errors,[]);await f.context.close();
    console.log('PASS all four drag-limit corners, three pet sizes, quarter arcs, hit targets, normal motion, hover, navigation and restore');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
