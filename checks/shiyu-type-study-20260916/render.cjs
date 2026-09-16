const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url');
const fontsCSS=fs.readFileSync(path.join(__dirname,'fonts/fonts.css'),'utf8').replace(/url\("\.\/([^"\)]+)"\)/g,(_,name)=>'url("data:'+(name.endsWith('woff2')?'font/woff2':'font/ttf')+';base64,'+fs.readFileSync(path.join(__dirname,'fonts',name)).toString('base64')+'")');
const options={a:{cn:'Noto Serif SC',latin:'Cormorant Garamond',weight:400,lw:500},b:{cn:'LXGW WenKai',latin:'Lora',weight:400,lw:400},c:{cn:'Noto Sans SC',latin:'Manrope',weight:300,lw:400}};
const report={date:new Date().toISOString(),samples:[],checks:[]};
async function actualFonts(page,selector){const client=await page.context().newCDPSession(page);await client.send('DOM.enable');await client.send('CSS.enable');const {root}=await client.send('DOM.getDocument');const {nodeId}=await client.send('DOM.querySelector',{nodeId:root.nodeId,selector});const result=await client.send('CSS.getPlatformFontsForNode',{nodeId});await client.detach();return result.fonts;}
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  for(const [size,viewport] of Object.entries({desktop:{width:1440,height:900},mobile:{width:390,height:844}})){
   const page=await browser.newPage({viewport,deviceScaleFactor:1,reducedMotion:'reduce'});
   await page.goto('http://127.0.0.1:4320/official/v2/index.html',{waitUntil:'networkidle'});
   await page.evaluate(()=>{window.requestAnimationFrame=()=>0});
   await page.screenshot({path:path.join(__dirname,'captures','original-'+size+'.png'),animations:'disabled'});
   await page.addStyleTag({content:fontsCSS});
   await page.addStyleTag({content:'.scene-copy h1,.scene-copy h2,.brand span{font-family:var(--study-cn)!important;font-weight:var(--study-weight)!important;font-synthesis:none}.whisper,.entry-link,.cue-label,.eyebrow,.topline>p,.progress-count{font-family:"Manrope","Noto Sans SC",sans-serif!important;font-weight:400!important}.progress-count{font-variant-numeric:tabular-nums}'});
   for(const [key,value] of Object.entries(options)){
    await page.evaluate(async value=>{document.documentElement.style.setProperty('--study-cn','"'+value.cn+'"');document.documentElement.style.setProperty('--study-weight',value.weight);await Promise.all([document.fonts.load(value.weight+' 48px "'+value.cn+'"','拾隅万千世界'),document.fonts.load('400 12px "Noto Sans SC"','在纷繁之中'),document.fonts.load('400 12px "Manrope"','A LITTLE LIGHT. 0123456789')]);await document.fonts.ready;},value);
    const metrics=await page.evaluate(()=>{const h=document.querySelector('h1'),r=h.getBoundingClientRect();return {viewport:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,titleBounds:{x:r.x,y:r.y,width:r.width,height:r.height},font:getComputedStyle(h).fontFamily}});
    if(metrics.overflow)throw new Error('Official preview overflow: '+key+' '+size);
    report.samples.push({key,size,metrics,actualFonts:await actualFonts(page,'#origin-title')});
    await page.screenshot({path:path.join(__dirname,'captures',key+'-'+size+'.png'),animations:'disabled'});
   }
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:1320,height:1500},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=pathToFileURL(path.join(__dirname,'index.html')).href;
  for(const key of Object.keys(options)){
   await page.goto(base+'?export=1&variant='+key,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
   await page.locator('#desktop-preview').evaluate(img=>img.decode());
   const rendered={chinese:await actualFonts(page,'.chinese-sample'),latin:await actualFonts(page,'.english-sample'),figures:await actualFonts(page,'.figures'),mixed:await actualFonts(page,'.mixed')};
   if(Object.values(rendered).some(list=>!list.length||list.some(font=>!font.isCustomFont)))throw new Error('Unexpected fallback: '+key+' '+JSON.stringify(rendered));
   report.samples.push({key,size:'board',actualFonts:rendered});
   await page.locator('#board').screenshot({path:path.join(__dirname,key+'-board.png')});
  }
  await page.setViewportSize({width:1500,height:1200});
  await page.goto(pathToFileURL(path.join(__dirname,'comparison.html')).href,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
  await page.locator('.page').screenshot({path:path.join(__dirname,'comparison.png')});
  await page.setViewportSize({width:1320,height:1500});
  await page.goto(base,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
  for(const key of ['b','c','a']){await page.locator('.tabs [data-variant='+key+']').click();if(await page.locator('#board').getAttribute('data-variant')!==key)throw new Error('Tab failure');}
  await page.locator('.theme-toggle').click();if(await page.locator('#board').getAttribute('data-dark')!=='true')throw new Error('Theme failure');await page.locator('.theme-toggle').click();
  await page.screenshot({path:path.join(__dirname,'captures','study-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(__dirname,'captures','study-mobile.png'),fullPage:true});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error('Mobile study overflow');
  if(errors.length)throw new Error(errors.join('\n'));
  report.checks.push('All A/B/C tabs and light/dark toggle work','No horizontal overflow at 390px','Actual custom font usage verified through browser font inspection','No browser JavaScript errors');
  const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'baseline-hashes.json'),'utf8'));
  for(const [file,expected] of Object.entries(baseline.files)){const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(baseline.root,file))).digest('hex');if(actual!==expected)throw new Error('Official baseline changed: '+file);}
  report.checks.push('All '+Object.keys(baseline.files).length+' official v2 files match baseline SHA-256');
  fs.writeFileSync(path.join(__dirname,'verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({checks:report.checks,renderedSamples:report.samples.length},null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
