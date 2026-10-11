const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await b.newPage({viewport:{width:2066,height:1070},reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4327',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__emergence);
 for(const depth of ['flat','depth'])console.log(await page.evaluate(depth=>{
  const e=__emergence.engine,check=(ok,msg)=>{if(!ok)throw Error(msg)};const reports=[];
  for(const count of [100,1200]){
   e.setScene('cosmos',{depth,count,influx:'no',blackHoles:'no',pointer:'none'});e.setPaused(true);e.step(.5);e.setConfig({...e.config,trail:12});check(e.time===.5&&!e.particles.length,'config during charge');
   while(e.time<1.8)e.step();check(e.particles.length===count&&e.particles.every(p=>p.releaseAt>e.time),'early burst contains only packets');
   check(e.pickParticle(e.width/2,e.height/2)===null,'hidden particles cannot be picked');
   e.canvas.style.width='90vw';e.resize();while(e.time<6.01)e.step();check(!e.cosmicBirth,'completed');check(e.snapshot().finite,'finite');
   check(Math.abs(e.particles.reduce((s,p)=>s+p.mass,0)-count)<1e-6,'count-independent conserved mass');
   const start=performance.now();for(let i=0;i<60;i++)e.step();const stepMs=(performance.now()-start)/60;
   const drawStart=performance.now();for(let i=0;i<10;i++)e.draw();const drawMs=(performance.now()-drawStart)/10;
   reports.push({depth,count,current:e.particles.length,stepMs,drawMs});
   e.setConfig({...e.config,count:count===100?150:1150});check(!e.cosmicBirth&&e.particles.length===e.config.count,'count change directly resets dust');
   e.canvas.style.width='';e.resize();e.reset();check(e.time===0&&e.particles.length===0,'restart returns to single charging point');
  }
  return reports;
 },depth));
}finally{await b.close()}})().catch(error=>{console.error(error);process.exit(1)});
