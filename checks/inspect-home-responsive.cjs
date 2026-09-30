process.env.SHIYU_PREVIEW_URL ||= 'http://127.0.0.1:4337/';
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const {fixture}=require('./verify-desktop-pet.cjs');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'.local/home-responsive-20260928'),phase=process.argv[2]||'before';
async function main(){
 fs.mkdirSync(path.join(dir,phase),{recursive:true});
 if(phase==='before'&&!fs.existsSync(path.join(dir,'baseline'))){fs.mkdirSync(path.join(dir,'baseline/dist'),{recursive:true});for(const file of fs.readdirSync(path.join(root,'dist')))if(/\.(css|js|html)$/.test(file))fs.copyFileSync(path.join(root,'dist',file),path.join(dir,'baseline/dist',file));fs.copyFileSync(path.join(root,'preview.cjs'),path.join(dir,'baseline/preview.cjs'));}
 const browser=await chromium.launch({channel:'chrome',headless:true});const report=[];
 try{
  for(const width of [390,820]){
   const f=await fixture({newContext:options=>browser.newContext({...options,viewport:{width,height:width===390?844:1180},hasTouch:true})},true),p=f.page;
   const themes=await p.locator('[data-brand-theme]').evaluateAll(nodes=>[...new Set(nodes.map(n=>n.dataset.brandTheme))]);
   for(const theme of themes){
    await p.evaluate(t=>{prefs.theme=t;render()},theme);await p.waitForTimeout(theme==='globe'?2500:250);await p.evaluate(()=>document.fonts.ready);
    await p.screenshot({path:path.join(dir,phase,`${width}-${theme}.png`)});
    report.push(await p.evaluate(({theme,width})=>({theme,width,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,children:[...document.querySelectorAll('#main .home>*')].map(e=>({class:e.className,rect:e.getBoundingClientRect().toJSON()})),overflow:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width&&r.height&&s.visibility!=='hidden'&&s.display!=='none'&&(r.left< -2||r.right>innerWidth+2)&&!e.closest('svg,.pet-menu,.pet-panel')}).slice(0,18).map(e=>({tag:e.tagName,class:e.className,rect:e.getBoundingClientRect().toJSON()}))}),{theme,width}));
   }
   await p.evaluate(()=>{prefs.theme='base';render();show('#login')});await p.screenshot({path:path.join(dir,phase,`${width}-login.png`)});
   report.push({width,login:await p.locator('#login').evaluate(e=>({html:e.innerHTML,rect:e.getBoundingClientRect().toJSON(),scrollHeight:e.scrollHeight})),errors:f.errors});
   await f.context.close();
   const names=[...themes,'login'],tiles=[];for(let i=0;i<names.length;i++){const img=await sharp(path.join(dir,phase,`${width}-${names[i]}.png`)).resize(195,422,{fit:'contain',background:'#ddd'}).png().toBuffer();tiles.push({input:img,left:i%5*195,top:Math.floor(i/5)*446+24});const label=Buffer.from(`<svg width="195" height="24"><text x="6" y="17" font-size="14">${names[i]}</text></svg>`);tiles.push({input:label,left:i%5*195,top:Math.floor(i/5)*446});}await sharp({create:{width:975,height:Math.ceil(names.length/5)*446,channels:3,background:'#eee'}}).composite(tiles).png().toFile(path.join(dir,phase,`sheet-${width}.png`));
  }
  fs.writeFileSync(path.join(dir,phase,'report.json'),JSON.stringify(report,null,2));console.log(dir,phase);
 }finally{await browser.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
