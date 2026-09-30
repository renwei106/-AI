const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
async function record(page,name,duration,mode){
 const downloadPromise=page.waitForEvent('download');
 await page.evaluate(async({name,duration,mode})=>{
  const canvas=document.querySelector('#avatar-theme-canvas'),stage=document.querySelector('[data-avatar-stage]'),rect=stage.getBoundingClientRect();
  const send=x=>stage.dispatchEvent(new PointerEvent('pointermove',{clientX:rect.left+rect.width*x,clientY:rect.top+rect.height*.42,bubbles:true}));
  if(mode==='turn'){send(.02);await new Promise(resolve=>setTimeout(resolve,650))}
  const stream=canvas.captureStream(60),type=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm',chunks=[];
  const options={mimeType:type,videoBitsPerSecond:6000000};try{options.videoKeyFrameIntervalDuration=120}catch{}
  const recorder=new MediaRecorder(stream,options);recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data)};const stopped=new Promise(resolve=>recorder.onstop=resolve);recorder.start(120);
  const started=performance.now(),timer=setInterval(()=>{const t=Math.min(1,(performance.now()-started)/duration);send(mode==='turn'?t:.5+.22*Math.sin(t*Math.PI*2))},16);
  await new Promise(resolve=>setTimeout(resolve,duration));clearInterval(timer);recorder.stop();await stopped;
  const url=URL.createObjectURL(new Blob(chunks,{type:'video/webm'})),a=document.createElement('a');a.href=url;a.download=name;a.click();
 },{name,duration,mode});
 const download=await downloadPromise;await download.saveAs(path.resolve(__dirname,'../dist/assets/avatar/'+name));
}
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{const page=await browser.newPage({viewport:{width:1920,height:1080}});await page.goto('http://127.0.0.1:4318/?avatarCapture=1',{waitUntil:'domcontentloaded'});await page.evaluate(()=>{prefs.theme='avatarGirl';prefs.mode='light';prefs.brandGuideDismissed=true;render()});await page.locator('#avatar-theme-canvas').waitFor();await page.waitForTimeout(900);await record(page,'azhi-idle.webm',6000,'idle');await page.addStyleTag({content:'body>*:not(#main),.avatar-copy,.avatar-hint,.scroll-invitation{display:none!important}'});const stage=await page.locator('[data-avatar-stage]').boundingBox(),dir=path.resolve(__dirname,'../dist/assets/avatar/turn');require('node:fs').mkdirSync(dir,{recursive:true});for(let index=0;index<17;index++){const ratio=index/16;await page.mouse.move(stage.x+stage.width*ratio,stage.y+stage.height*.42);await page.waitForTimeout(260);await page.locator('#avatar-theme-canvas').screenshot({path:path.join(dir,`frame-${String(index).padStart(2,'0')}.jpg`),type:'jpeg',quality:91})}}finally{await browser.close()}console.log('Generated high-resolution idle video and 17 directional frames')})().catch(error=>{console.error(error);process.exit(1)});

