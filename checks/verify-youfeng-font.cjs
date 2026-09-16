const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
async function actualFonts(page,selector){const client=await page.context().newCDPSession(page);await client.send('DOM.enable');await client.send('CSS.enable');const {root}=await client.send('DOM.getDocument');const {nodeId}=await client.send('DOM.querySelector',{nodeId:root.nodeId,selector});const result=await client.send('CSS.getPlatformFontsForNode',{nodeId});await client.detach();return result.fonts}
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  const initial=await page.evaluate(()=>({font:document.body.dataset.font,pref:JSON.parse(localStorage.getItem('yiyu-prototype-v1')).prefs.font,explicit:JSON.parse(localStorage.getItem('yiyu-prototype-v1')).prefs.explicitFont,overflow:document.documentElement.scrollWidth>innerWidth}));
  if(initial.font!=='youfeng'||initial.pref!=='youfeng'||!initial.explicit||initial.overflow)throw new Error('Default font migration failed '+JSON.stringify(initial));
  const rendered=await actualFonts(page,'.brand');if(!rendered.some(font=>font.familyName==='Shiyu Youfeng Preview'&&font.isCustomFont))throw new Error('Brand did not render with custom font '+JSON.stringify(rendered));
  await page.evaluate(()=>{const state=JSON.parse(localStorage.getItem('yiyu-prototype-v1'));state.signed=true;localStorage.setItem('yiyu-prototype-v1',JSON.stringify(state))});await page.reload({waitUntil:'networkidle'});await page.locator('[data-action=settings]').click();await page.locator('[data-settings-tab=type]').click();
  const fontChoices=await page.locator('.font-choice').count();if(fontChoices!==9)throw new Error('Expected 9 font choices, found '+fontChoices);
  if(await page.locator('[data-pref=font][data-value=youfeng]').getAttribute('aria-pressed')!=='true')throw new Error('Youfeng is not selected in settings');
  if(await page.locator('.font-download').count()!==0)throw new Error('Font download controls should not be shown');
  if((await page.locator('#settings').innerText()).includes('下载字体'))throw new Error('Font download copy should not be shown');
  const labels=await page.locator('.font-choice').allInnerTexts();for(const forbidden of ['方案一','方案二','方案四','·']){if(labels.some(label=>label.includes(forbidden)))throw new Error('Font label still contains '+forbidden+': '+JSON.stringify(labels))}
  for(const url of ['assets/fonts/shiyu-youfeng/shiyu-youfeng-v0.1.zip','assets/fonts/shiyu-qingya-song/shiyu-qingya-song-v0.1.zip','assets/fonts/shiyu-wenrun-kai/shiyu-wenrun-kai-v0.1.zip']){const response=await page.request.get('http://127.0.0.1:4318/'+url);if(response.status()!==404)throw new Error('Font package should not be exposed by the app: '+url)}
  const switched={};for(const [id,family] of [['qingya','Shiyu Qingya Song Preview'],['wenrun','Shiyu Wenrun Kai Preview'],['youfeng','Shiyu Youfeng Preview']]){await page.locator(`[data-pref=font][data-value=${id}]`).click();await page.evaluate(([name])=>document.fonts.load(`24px '${name}'`,'拾隅'),[family]);if(await page.locator('body').getAttribute('data-font')!==id)throw new Error('Could not switch to '+id);const fonts=await actualFonts(page,'.brand');if(!fonts.some(font=>font.familyName===family&&font.isCustomFont))throw new Error(id+' did not render with custom font '+JSON.stringify(fonts));switched[id]=family}
  await page.screenshot({path:path.resolve(__dirname,'youfeng-font-settings.png')});
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);if(await page.locator('#settings').evaluate(el=>el.scrollWidth>el.clientWidth+1))throw new Error('Mobile font settings overflow');await page.screenshot({path:path.resolve(__dirname,'youfeng-font-settings-mobile.png')});
  if(errors.length)throw new Error(errors.join('\n'));
  console.log(JSON.stringify({default:initial,rendered,fontChoices,labels,downloadsHidden:true,packagesUnavailable:true,switched,mobileOverflow:false,browserErrors:errors},null,2));
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
