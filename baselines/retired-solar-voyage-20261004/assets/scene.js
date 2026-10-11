import {PLANETS,DEG,orbit,displayOrbit,planetRadius} from './data.js';
import {MOONS} from './moons.js';
const TAU=Math.PI*2;
const major={Moon:['月球',1737.4],Phobos:['火卫一',11.1],Deimos:['火卫二',6.2],Io:['木卫一',1821.6],Europa:['木卫二',1560.8],Ganymede:['木卫三',2634.1],Callisto:['木卫四',2410.3],Mimas:['土卫一',198.2],Enceladus:['土卫二',252.1],Tethys:['土卫三',531.1],Dione:['土卫四',561.4],Rhea:['土卫五',763.8],Titan:['土卫六',2574.7],Hyperion:['土卫七',135],Iapetus:['土卫八',734.5],Miranda:['天卫五',235.8],Ariel:['天卫一',578.9],Umbriel:['天卫二',584.7],Titania:['天卫三',788.9],Oberon:['天卫四',761.4],Triton:['海卫一',1353.4],Nereid:['海卫二',170]};
const descriptions=['离太阳最近的岩石世界','浓云之下，缓慢转动的世界','海洋、陆地，与一轮月亮','红色荒原与两颗小卫星','云带之上，众月相随','冰与尘埃，织成一圈光环','侧身自转的冰巨星','遥远海蓝色的风暴世界'];
function random(seed){return()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};}
function moonPosition(m,days,mean){
 let v=orbit(m,days,mean);
 // Convert the local Laplace-plane basis (pole in ICRF) to the ecliptic frame.
 if(m.frame!=='ecliptic'){
  const a=m.ra*DEG,d=m.dec*DEG,p=[Math.cos(d)*Math.cos(a),Math.cos(d)*Math.sin(a),Math.sin(d)];
  const u=[-Math.sin(a),Math.cos(a),0],q=[-Math.sin(d)*Math.cos(a),-Math.sin(d)*Math.sin(a),Math.cos(d)];
  v=[0,1,2].map(k=>u[k]*v[0]+q[k]*v[1]+p[k]*v[2]);
  const e=23.43928*DEG;v=[v[0],v[1]*Math.cos(e)+v[2]*Math.sin(e),-v[1]*Math.sin(e)+v[2]*Math.cos(e)];
 }
 return v;
}
function makeTexture(p){
 const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d'),rng=random(p.id.length*741+Math.round(p.radius));
 x.fillStyle=p.color;x.fillRect(0,0,512,256);
 const gas=['jupiter','saturn','uranus','neptune','venus'].includes(p.id);
 for(let n=0;n<(gas?160:600);n++){
  x.fillStyle=`rgba(${rng()>.5?'255,240,211':'48,31,24'},${gas?.03+rng()*.09:.025+rng()*.1})`;
  if(gas){const y=rng()*256;x.beginPath();x.moveTo(0,y);for(let j=0;j<=512;j+=8)x.lineTo(j,y+Math.sin(j*.03+n)*2);x.lineTo(512,y+2+rng()*7);x.lineTo(0,y+4);x.fill();}
  else{x.beginPath();x.arc(rng()*512,rng()*256,1+rng()*12,0,TAU);x.fill();}
 }
 if(p.id==='jupiter'){x.fillStyle='#a87459';x.beginPath();x.ellipse(315,164,24,9,-.1,0,TAU);x.fill();}
 return c;
}
function sphere(texture,size=160){
 const c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d'),tx=texture.getContext('2d').getImageData(0,0,texture.width,texture.height),out=ctx.createImageData(size,size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const nx=(x+.5-size/2)/(size/2),ny=(y+.5-size/2)/(size/2),r=nx*nx+ny*ny;if(r>1)continue;
  const z=Math.sqrt(1-r),u=((Math.atan2(nx,z)/TAU+.5)*texture.width)|0,v=((Math.asin(ny)/Math.PI+.5)*(texture.height-1))|0,k=(v*texture.width+u)*4,o=(y*size+x)*4;
  const light=.13+.87*Math.max(0,-nx*.58-ny*.24+z*.78);for(let j=0;j<3;j++)out.data[o+j]=tx.data[k+j]*light;out.data[o+3]=Math.min(255,(1-r)*size*200);
 }ctx.putImageData(out,0,0);return c;
}
export function mount(root){
 root.insertAdjacentHTML('afterbegin',`<canvas class="solar-canvas" aria-label="太阳系轨道视图，点击行星查看卫星，也可使用下方行星按钮"></canvas><div class="solar-copy"><small>SOLAR VOYAGE / 逐光星旅</small><h1>循光而行，\n万物有轨。</h1><p>从太阳出发，走近每一个世界。</p></div><aside class="solar-info" hidden></aside><nav class="solar-nav" aria-label="选择行星">${PLANETS.map(p=>`<button type="button" data-planet="${p.id}" aria-pressed="false"><i style="background:${p.color};width:${Math.max(5,planetRadius(p)*.85)}px;height:${Math.max(5,planetRadius(p)*.85)}px"></i>${p.name}</button>`).join('')}</nav><div class="solar-hint">点击行星，走近它的卫星世界 · 拖动星空，转换视角</div><button type="button" class="solar-horizon" hidden aria-label="点击地平线，返回太阳系"><span>↑ 返回太阳系</span></button><details class="solar-source"><summary>星轨手记 ↗</summary><p>轨道依据 JPL 平均轨道根数，采用统一时间推进。为了在一屏看清，距离与球体大小分别压缩；这是一幅轨道示意，并非实时天文星历。卫星小点包含已有轨道资料的成员，未命名者保留编号。<br><a href="https://ssd.jpl.nasa.gov/planets/approx_pos.html" target="_blank" rel="noopener">行星资料</a> · <a href="https://ssd.jpl.nasa.gov/sats/elem/" target="_blank" rel="noopener">卫星资料</a></p></details>`);
 const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),info=root.querySelector('.solar-info'),horizon=root.querySelector('.solar-horizon');
 const textures=new Map(PLANETS.map(p=>[p.id,makeTexture(p)])),sprites=new Map(PLANETS.map(p=>[p.id,sphere(textures.get(p.id))]));
 const moonSprite=sphere(makeTexture({id:'moon',radius:1737,color:'#c8c6bd'}),96);
 const earth=new Image();earth.onload=()=>{if(dead)return;const c=textures.get('earth'),t=c.getContext('2d');t.drawImage(earth,0,0,512,256);const pixels=t.getImageData(0,0,512,256);for(let i=0;i<pixels.data.length;i+=4){if(pixels.data[i]+pixels.data[i+1]+pixels.data[i+2]<40){pixels.data[i]=16;pixels.data[i+1]=52;pixels.data[i+2]=86;}}t.putImageData(pixels,0,0);sprites.set('earth',sphere(c));};earth.src='/assets/site-icons/earth-blue-marble-200408-4096.webp';
 let w=1,h=1,dpr=1,scale=1,elapsed=0,last=performance.now(),raf,dead=false,focused=null,blend=0,yaw=-.34,tilt=.63,down=null,hover=null,hit=[],days=0,rate=3.5;
 const rng=random(3877),stars=Array.from({length:240},()=>[rng(),rng(),rng(),rng()]),belts=Array.from({length:1650},(_,i)=>({a:i<1000?2.2+rng()*1.1:32+rng()*15,e:rng()*.055,i:(rng()-.5)*(i<1000?8:15),M:rng()*360,w:rng()*360,node:rng()*360,period:0,alpha:.08+rng()*.26}));belts.forEach(b=>b.period=365.256*Math.pow(b.a,1.5));
 const ro=new ResizeObserver(()=>{w=root.clientWidth;h=root.clientHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;scale=Math.min(w/1260,h/830);});ro.observe(root);
 function select(p){focused=p;root.toggleAttribute('data-focus',!!p);info.hidden=!p;horizon.hidden=!p;root.querySelectorAll('[data-planet]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.planet===p?.id)));
  if(!p)return;
  const moons=MOONS.filter(m=>m.parent===p.id).sort((a,b)=>a.a-b.a);horizon.style.setProperty('--planet-color',p.color);
  info.innerHTML=`<h2>${p.name}</h2><div class="solar-en">${p.id}</div><p style="font-size:11px;color:#9ca8b9;line-height:1.8">${descriptions[PLANETS.indexOf(p)]}</p><dl><dt>平均半径</dt><dd>${p.radius.toLocaleString()} km</dd><dt>公转周期</dt><dd>${p.period<700?p.period.toFixed(1)+' 天':(p.period/365.256).toFixed(1)+' 年'}</dd><dt>距太阳</dt><dd>${p.a.toFixed(2)} AU</dd></dl>${moons.length?`<details><summary>卫星轨道 · ${moons.length} 颗</summary><div class="solar-moons">${moons.map(m=>`<p>${major[m.name]?.[0]||m.name}<span>${Math.round(m.a).toLocaleString()} km</span></p>`).join('')}</div></details>`:'<p style="font-size:11px;color:#8995a6">没有天然卫星</p>'}`;
 }
 const controller=new AbortController(),on=(el,type,fn,opts={})=>el.addEventListener(type,fn,{...opts,signal:controller.signal});
 root.querySelectorAll('[data-planet]').forEach(b=>on(b,'click',()=>select(PLANETS.find(p=>p.id===b.dataset.planet))));on(horizon,'click',()=>select(null));
 on(window,'keydown',e=>{if(e.key==='Escape'&&focused&&!e.target.closest('input,textarea,[contenteditable]'))select(null);});
 on(canvas,'pointerdown',e=>{down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);});
 on(canvas,'pointermove',e=>{if(down){if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)down.moved=true;if(down.moved){yaw+=(e.clientX-down.lastX)*.004;tilt=Math.max(.16,Math.min(1.3,tilt+(e.clientY-down.lastY)*.003));}down.lastX=e.clientX;down.lastY=e.clientY;}else{const r=canvas.getBoundingClientRect();hover=hit.find(p=>Math.hypot(p.x-(e.clientX-r.left),p.y-(e.clientY-r.top))<Math.max(p.r+8,18));canvas.style.cursor=hover?'pointer':'grab';}});
 on(canvas,'pointerup',e=>{if(down&&!down.moved&&!focused){const r=canvas.getBoundingClientRect(),target=hit.find(p=>Math.hypot(p.x-e.clientX+r.left,p.y-e.clientY+r.top)<Math.max(p.r+8,18));if(target)select(target.p);}down=null;});on(canvas,'pointercancel',()=>down=null);
 function project(v,cx=w*.55,cy=h*.48,s=scale){const x=v[0]*Math.cos(yaw)-v[1]*Math.sin(yaw),y=v[0]*Math.sin(yaw)+v[1]*Math.cos(yaw);return {x:cx+x*s,y:cy+(y*Math.sin(tilt)-v[2]*Math.cos(tilt))*s,z:y*Math.cos(tilt)+v[2]*Math.sin(tilt)};}
 function line(points,color,width=1){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
 function dot(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
 function ring(x,y,r,color,front){ctx.save();ctx.translate(x,y);ctx.rotate(-.28);ctx.beginPath();ctx.ellipse(0,0,r*1.85,r*.52,0,front?0:Math.PI,front?Math.PI:TAU);ctx.strokeStyle=color;ctx.lineWidth=r*.35;ctx.stroke();ctx.beginPath();ctx.ellipse(0,0,r*1.62,r*.455,0,front?0:Math.PI,front?Math.PI:TAU);ctx.lineWidth=r*.035;ctx.strokeStyle='#080e1999';ctx.stroke();ctx.restore();}
 function body(p,x,y,r,label=true){if(p.id==='saturn')ring(x,y,r,'#b7a88785',false);if(p.id==='uranus'){ctx.save();ctx.translate(x,y);ctx.rotate(1.3);ctx.strokeStyle='#c5dad531';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,0,r*1.5,r*.5,0,0,TAU);ctx.stroke();ctx.restore();}ctx.drawImage(sprites.get(p.id),x-r,y-r,r*2,r*2);if(p.id==='saturn')ring(x,y,r,'#cdbc9699',true);if(label&&w>700){ctx.font='11px sans-serif';ctx.fillStyle='#c3cbd8';ctx.textAlign='center';ctx.fillText(p.name,x,y+r+18);}}
 function overview(alpha){ctx.save();ctx.globalAlpha=alpha;
  for(const b of belts){const q=project(displayOrbit(b,days));dot(q.x,q.y,Math.max(.35,scale*.65),`rgba(166,179,195,${b.alpha})`);}
  for(const p of PLANETS){const pts=Array.from({length:181},(_,j)=>project(displayOrbit(p,0,j/180*TAU)));line(pts,'#9eacc529',.7);}
  // Historical paths in a moving reference frame, not force/velocity arrows.
  for(const p of PLANETS){const pts=Array.from({length:55},(_,j)=>{const age=(54-j)/54*12,v=displayOrbit(p,days-age*3.5),q=project(v);q.y+=age*3;return q;});line(pts,p.color+'22',.8);}
  const cx=w*.55,cy=h*.48,sr=62*scale,glow=ctx.createRadialGradient(cx,cy,sr*.5,cx,cy,sr*4);glow.addColorStop(0,'#ffd79742');glow.addColorStop(.5,'#de9f4a10');glow.addColorStop(1,'#edbd6200');ctx.fillStyle=glow;ctx.fillRect(cx-sr*4,cy-sr*4,sr*8,sr*8);
  const sun=ctx.createRadialGradient(cx-sr*.3,cy-sr*.3,1,cx,cy,sr);sun.addColorStop(0,'#fffbe7');sun.addColorStop(.6,'#ffe5a3');sun.addColorStop(1,'#e7ad54');const paintSun=()=>{dot(cx,cy,sr,sun);ctx.fillStyle='#d9caaa';ctx.font='10px sans-serif';ctx.textAlign='center';if(w>700)ctx.fillText('太阳',cx,cy+sr+18);};
  hit=[];const positions=PLANETS.map(p=>({p,...project(displayOrbit(p,days)),r:Math.max(1.3,planetRadius(p)*scale)})).sort((a,b)=>a.z-b.z);
  let sunPainted=false;for(const q of positions){if(q.z>=0&&!sunPainted){paintSun();sunPainted=true;}body(q.p,q.x,q.y,q.r);hit.push(q);if(hover?.p===q.p){ctx.strokeStyle='#ffffff66';ctx.lineWidth=1;ctx.beginPath();ctx.arc(q.x,q.y,q.r+6,0,TAU);ctx.stroke();}}
  if(!sunPainted)paintSun();
  ctx.fillStyle='#8796ac77';ctx.font='9px sans-serif';const main=project([260,-50,0]),outer=project([510,40,0]);if(w>700){ctx.fillText('主小行星带',main.x,main.y);ctx.fillText('柯伊伯带',outer.x,outer.y);}ctx.restore();
 }
 function focusScene(p,alpha){ctx.save();ctx.globalAlpha=alpha;const mobile=w<700,cx=w*(mobile?.43:.48),cy=h*(mobile?.56:.49),s=Math.min(w/(mobile?800:1250),h/860),r=(p.id==='jupiter'?78:p.id==='saturn'?70:p.id==='earth'?52:60)*Math.max(.65,s);
  const moons=MOONS.filter(m=>m.parent===p.id),min=Math.min(...moons.map(m=>m.a)),max=Math.max(...moons.map(m=>m.a)),objects=[];
  const local=(m,mean)=>{const v=moonPosition(m,days,mean),a=moons.length===1?245:120+330*Math.log(m.a/min+1)/Math.log(max/min+1);return project(v.map(k=>k/m.a*a),cx,cy,s);};
  let px=cx,py=cy;
  if(p.id==='earth'&&moons.length){const q=local(moons[0]);px-=(q.x-cx)*.01215;py-=(q.y-cy)*.01215;}
  for(const m of moons){const main=major[m.name];if(main)line(Array.from({length:145},(_,j)=>local(m,j/144*TAU)),'#b4c5db28',.7);const q=local(m);objects.push({...q,m,main});}
  const moonDraw=q=>{const mr=q.main?Math.max(2.2,r*q.main[1]/p.radius):1;if(q.main)ctx.drawImage(moonSprite,q.x-mr,q.y-mr,mr*2,mr*2);else dot(q.x,q.y,mr,'#78859888');if(q.main){ctx.fillStyle='#9eacbf';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText(q.main[0],q.x,q.y+mr+15);}};
  objects.filter(q=>q.z<0).forEach(moonDraw);body(p,px,py,r,false);objects.filter(q=>q.z>=0).forEach(moonDraw);ctx.restore();
 }
 function frame(now){if(dead)return;const dt=document.hidden?0:Math.min((now-last)/1000,.06);last=now;elapsed+=dt;const shortest=focused?Math.min(...MOONS.filter(m=>m.parent===focused.id).map(m=>m.period)):Infinity;const targetRate=focused&&Number.isFinite(shortest)?Math.min(.3,shortest/35):3.5;rate+=(targetRate-rate)*Math.min(1,dt*4);days+=dt*rate;blend+=(Number(!!focused)-blend)*Math.min(1,dt*5);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#080e19';ctx.fillRect(0,0,w,h);
  const haze=ctx.createRadialGradient(w*.55,h*.48,0,w*.55,h*.48,w*.65);haze.addColorStop(0,'#20304540');haze.addColorStop(1,'#080e1900');ctx.fillStyle=haze;ctx.fillRect(0,0,w,h);
  for(const st of stars){const y=((st[1]*h+elapsed*(1+st[2]*2))%h);dot(st[0]*w,y,.35+st[2]*.7,`rgba(182,202,226,${.12+st[3]*.35})`);}
  if(blend<.999)overview(1-blend);if(focused)focusScene(focused,blend);raf=requestAnimationFrame(frame);
 }raf=requestAnimationFrame(frame);
 return()=>{dead=true;cancelAnimationFrame(raf);ro.disconnect();controller.abort();earth.onload=null;};
}
