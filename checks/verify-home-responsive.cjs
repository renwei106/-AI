/* Local fixtures only: no real login, message sending, account edits or published configuration writes. */
process.env.SHIYU_PREVIEW_URL ||= 'http://127.0.0.1:4337/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const {fixture}=require('./verify-desktop-pet.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../.local/home-responsive-20260928/verified'),baseline=path.resolve(out,'../baseline/dist');
fs.mkdirSync(out,{recursive:true});
async function create(browser,viewport,baselineMode=false,touch=true){
 return fixture({newContext:async options=>{
  const c=await browser.newContext({...options,viewport,hasTouch:touch,isMobile:touch&&viewport.width<=600});
  await c.addInitScript(()=>{const RealDate=Date;window.Date=class extends RealDate{constructor(...args){super(...(args.length?args:['2026-09-28T08:08:08Z']))}static now(){return new RealDate('2026-09-28T08:08:08Z').getTime()}};let seed=123;Math.random=()=>((seed=(seed*16807)%2147483647)-1)/2147483646;});
  if(baselineMode)await c.route('**/*',route=>{const url=new URL(route.request().url()),file=url.pathname==='/'?'index.html':url.pathname.slice(1),local=path.join(baseline,file);if(!file.includes('/')&&fs.existsSync(local))return route.fulfill({path:local,contentType:file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html'});return route.fallback()});
  return c;
 }},true);
}
async function contained(locator,width,height,name){const b=await locator.boundingBox();assert(b,`${name} visible`);assert(b.x>=-1&&b.x+b.width<=width+1&&b.y>=-1&&b.y+b.height<=height+1,`${name}: ${JSON.stringify(b)} within ${width}x${height}`)}
async function main(){const browser=await chromium.launch({channel:'chrome',headless:true});const report=[];try{
 for(const [width,height]of [[320,740],[390,844],[600,960],[768,1024],[820,1180],[1024,768],[844,390],[1366,1024]]){
  const f=await create(browser,{width,height}),p=f.page;
  const themes=await p.locator('[data-brand-theme]').evaluateAll(nodes=>[...new Set(nodes.map(n=>n.dataset.brandTheme))]);
  for(const theme of themes){await p.evaluate(t=>{prefs.theme=t;render()},theme);await p.waitForTimeout(100);const geo=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,theme:document.body.dataset.theme}));assert.equal(geo.theme,theme);assert(geo.scroll<=width+1,`${theme} overflows ${width}: ${geo.scroll}`);if(theme==='flip')await contained(p.locator('.flip-face'),width,Math.max(height,1200),'clock');}
  await p.evaluate(()=>{prefs.theme='base';render()});
  await p.locator('header [data-action=settings]').tap();await contained(p.locator('#settings'),width,height,'home settings');
  await p.locator('#settings').evaluate(e=>e.close());
  await p.evaluate(()=>{const title=document.querySelector('.base-composition h1');title.textContent='让每一种屏幕都能安放喜欢的日常与灵感';fitHomeText()});
  assert(await p.locator('.base-composition h1').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'long home title fits');
  if(width<=1100)assert(await p.locator('.base-composition h1').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=24),'long title remains readable');
  await p.evaluate(()=>render());
  const before=await p.evaluate(()=>JSON.stringify(ShiyuDesktopPet.read()));
  await p.locator('#desktop-pet .pet-character').tap();await p.locator('#desktop-pet[data-open=true]').waitFor();
  if(width<=600||width<=1100&&height<460)assert.equal(await p.locator('#desktop-pet').getAttribute('data-compact'),'true');
  for(const node of await p.locator('.pet-menu>.pet-shortcut').all())await contained(node,width,height,'pet entry');
  await p.screenshot({path:path.join(out,`${width}x${height}-pet.png`)});
  await p.mouse.click(10,Math.min(170,height-20));
  await p.evaluate(()=>show('#login'));
  await contained(p.locator('#login'),width,height,'login');
  for(const tab of ['email','password','phone']){
   const trigger=p.locator(`#login [data-account-tab=${tab}]`);if(await trigger.count())await trigger.click();
   await contained(p.locator('#login'),width,height,'login '+tab);
   const input=p.locator('#login [data-login-account]');await input.click();await input.fill(tab==='phone'?'13800138000':'reader@example.test');
   assert.equal(await input.inputValue(),tab==='phone'?'13800138000':'reader@example.test');
   assert(await p.locator('#login').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'login form horizontal overflow');
  }
  await p.screenshot({path:path.join(out,`${width}x${height}-login.png`)});
  assert(await p.locator('#desktop-pet').isHidden(),'pet stays out of login');
  await p.setViewportSize({width:width<=600?820:390,height:width<=600?1180:844});
  assert.equal(await p.locator('#login [data-login-account]').inputValue(),'13800138000','resizing preserves login draft');
  await p.locator('#login').evaluate(e=>e.close());
  assert.equal(await p.evaluate(()=>JSON.stringify(ShiyuDesktopPet.read())),before,'responsive placement does not save preferences');
  assert.deepEqual(f.errors,[]);report.push({width,height,themes:themes.length,passed:true});await f.context.close();console.log('PASS responsive',width,height);
 }
 const interaction=await create(browser,{width:390,height:844}),p=interaction.page;
 await p.emulateMedia({reducedMotion:'no-preference'});
 await p.evaluate(()=>{prefs.theme='flow';prefs.mode='dark';render()});
 await p.waitForTimeout(400);
 const modes=await p.locator('[data-inspiration-mode]').evaluateAll(nodes=>nodes.map(n=>n.dataset.inspirationMode));
 for(const mode of modes){await p.evaluate(mode=>document.querySelector('.flow-cover').__setInspirationMode(mode),mode);await p.waitForTimeout(100);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'flow mode '+mode);}
 await p.screenshot({path:path.join(out,'390-flow-dark.png')});
 await p.evaluate(()=>{prefs.theme='flip';homeTimerMode='focus';render()});
 await contained(p.locator('.flip-face'),390,844,'focus clock');
 await p.locator('[data-v2=focus-toggle]').tap();assert(await p.evaluate(()=>focusRunning),'focus timer starts with touch');
 await p.setViewportSize({width:820,height:1180});assert(await p.evaluate(()=>focusRunning),'folding preserves running timer');
 await p.evaluate(()=>{focusRunning=false;homeTimerMode='date';prefs.theme='base';render();show('#login')});
 await p.locator('[data-login-account]').click();await p.locator('[data-login-account]').fill('13800138000');
 await p.evaluate(()=>{Object.defineProperty(visualViewport,'height',{configurable:true,value:390});Object.defineProperty(visualViewport,'offsetTop',{configurable:true,value:20});visualViewport.dispatchEvent(new Event('resize'))});
 await p.waitForFunction(()=>document.documentElement.style.getPropertyValue('--home-visual-height')==='390px');
 const keyboardBox=await p.locator('#login').boundingBox();assert(keyboardBox.y>=20&&keyboardBox.y+keyboardBox.height<=410,'dialog fits the keyboard-reduced visual viewport');
 assert.equal(await p.locator('[data-login-account]').inputValue(),'13800138000','keyboard viewport preserves input');
 await p.evaluate(()=>{delete visualViewport.height;delete visualViewport.offsetTop;visualViewport.dispatchEvent(new Event('resize'))});
 await p.locator('[data-account-tab=wechat]').click();await contained(p.locator('#login'),820,1180,'WeChat login');
 await p.locator('[data-account-tab=password]').click();await p.locator('[data-forgot-password]').click();
 await contained(p.locator('#account-security'),820,1180,'password recovery');
 await p.locator('#account-security').evaluate(e=>e.close());await p.locator('#login').evaluate(e=>e.close());
 assert.deepEqual(interaction.errors,[]);await interaction.context.close();console.log('PASS touch flow modes, dark mode, focus resize, keyboard viewport, WeChat and password recovery');
 // Compare identical desktop states with the actual pre-edit working files (including uncommitted work).
 const before=await create(browser,{width:1440,height:960},true,false),after=await create(browser,{width:1440,height:960},false,false);
 for(const surface of ['home','space','login']){
  const captures=[];
  for(const [i,f]of [before,after].entries()){
   await f.page.evaluate(surface=>{document.querySelector('#login[open]')?.close();prefs.theme='base';view=surface==='space'?'space':'home';render();if(surface==='login')show('#login')},surface);
   await f.page.evaluate(()=>document.fonts.ready);await f.page.waitForTimeout(300);
   const image=await f.page.screenshot({animations:'disabled'});fs.writeFileSync(path.join(out,`desktop-${surface}-${i?'after':'before'}.png`),image);captures.push(await sharp(image).ensureAlpha().raw().toBuffer());
  }
  let changed=0;for(let i=0;i<captures[0].length;i+=4)if([0,1,2].some(k=>Math.abs(captures[0][i+k]-captures[1][i+k])>15))changed++;
  const ratio=changed/(1440*960);assert(ratio<.002,`desktop ${surface} changed ${(ratio*100).toFixed(3)}%`);report.push({surface,desktopChangedRatio:ratio});console.log('PASS desktop baseline',surface,ratio);
 }
 await before.context.close();await after.context.close();
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
}finally{await browser.close()}}
main().catch(e=>{console.error(e);process.exitCode=1});
