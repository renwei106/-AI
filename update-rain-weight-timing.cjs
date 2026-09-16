const fs=require('fs');const p='dist/v4.js';let s=fs.readFileSync(p,'utf8');fs.mkdirSync('baselines/v157-rain-weight-timing',{recursive:true});fs.copyFileSync(p,'baselines/v157-rain-weight-timing/v4.js');
function rep(a,b){if(!s.includes(a))throw Error(a);s=s.replace(a,b)}
rep('const particles=[];let last=performance.now();function frame(now)', 'const particles=[];const rainStarted=performance.now();let last=rainStarted;function frame(now)');
rep("el.classList.add('physical-rain');const r=20;particles.push({el,r,", "if(now-rainStarted<750){el.style.visibility='hidden';return}el.style.visibility='';el.classList.add('physical-rain');const r=20;particles.push({el,r,mass:1,gravity:620,bounce:.45,");
rep("el.classList.add('physical-calendar');el.getAnimations", "if(el.classList.contains('rain-date-piece')&&now-rainStarted<350){el.style.visibility='hidden';return}el.style.visibility='';el.classList.add('physical-calendar');el.getAnimations");
rep("mass:el.classList.contains('rain-value')?8:1,x:", "mass:el.classList.contains('rain-value')?8:3,gravity:el.classList.contains('rain-value')?1500:950,bounce:el.classList.contains('rain-value')?.86:.66,x:");
rep("y:-Math.max(rect.width,rect.height)-40,vx:(Math.random()-.5)*75,vy:0", "y:-Math.max(rect.width,rect.height)-40,vx:(Math.random()-.5)*75,vy:el.classList.contains('rain-value')?420:180");
rep('a.vy+=620*step','a.vy+=(a.gravity||620)*step');
rep("*(a.mass===8?.72:.45)","*(a.bounce||.45)");
rep("a.vy=-Math.abs(a.vy)*.35", "if(a.vy>0)a.vy=a.vy>22?-a.vy*(a.bounce||.45):0");
fs.writeFileSync(p,s);
