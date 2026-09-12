// Six living landscapes. Playback pauses both the landscape and its celestial clock.
const natureNames=['山间来信','潮汐之间','森林呼吸','沙海流金','湖畔清风','雪岭微光'];
let natureElapsed=0,natureClock=Date.now();
const homeBeforeNatureCinema=home;
home=function(){homeBeforeNatureCinema();if(!['projection','wallfilm'].includes(effective().theme))return;
 const landscape=document.querySelector('.projection-landscape');if(!landscape)return;
 landscape.classList.add('nature-landscape');landscape.replaceChildren();
 const canvas=document.createElement('canvas');canvas.style.cssText='width:100%;height:100%;display:block';landscape.append(canvas);
 const next=document.querySelector('.screen-next');if(next){next.title='下一幕 · '+natureNames[(projectionScene+1)%6];next.onclick=e=>{e.stopPropagation();projectionScene=(projectionScene+1)%6;home()}}
 canvas.setAttribute('aria-label',natureNames[projectionScene]);
 const ctx=canvas.getContext('2d');let last=performance.now();
 function frame(now){if(!canvas.isConnected)return;const dt=Math.min((now-last)/1000,.1);last=now;if(projectionRunning)natureElapsed+=dt;
 const w=1000,h=620;if(canvas.width!==w){canvas.width=w;canvas.height=h}const t=natureElapsed,kind=projectionScene;
 const date=new Date(natureClock+t*1000),hour=date.getHours()+date.getMinutes()/60+date.getSeconds()/3600,day=hour>=8&&hour<20,phase=((hour-(day?8:20)+24)%24)/12;
 const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,day?'#76a9c8':'#081225');sky.addColorStop(1,day?'#eee0bd':'#263953');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
 if(!day){ctx.fillStyle='#e4e7ef';for(let i=0;i<65;i++){ctx.globalAlpha=.35+.3*Math.sin(t*.7+i);ctx.fillRect((i*173)%1000,(i*79)%340,1.5,1.5)}ctx.globalAlpha=1}
 const cx=70+860*phase,cy=225-165*Math.sin(phase*Math.PI);ctx.fillStyle=day?'#f5d58a':'#eef1e3';ctx.beginPath();ctx.arc(cx,cy,day?28:24,0,Math.PI*2);ctx.fill();if(!day){ctx.fillStyle='#bdc7cf';for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(cx-10+i*5,cy-8+i%2*13,3+i%2,0,7);ctx.fill()}}
 // Clouds drift independently of the twelve-hour celestial arc.
 for(let i=0;i<5;i++){const x=((i*250+t*(9+i))%1250)-180,y=100+i%3*48;ctx.fillStyle=day?'#ffffff55':'#b4c7df16';ctx.beginPath();ctx.ellipse(x,y,85,12,0,0,7);ctx.ellipse(x+35,y-9,45,17,0,0,7);ctx.fill()}
 const palettes=[['#79958e','#486e64','#284d47'],['#87bbc7','#408b9f','#246c83'],['#658a71','#365f4c','#204535'],['#dbb37a','#be8d52','#91653e'],['#8ca897','#547c72','#335e59'],['#c8d5db','#91abb9','#647f94']];
 const colors=day?palettes[kind]:['#273542','#192936','#101f2c'];
 function hill(y,amp,layer){ctx.beginPath();ctx.moveTo(0,h);for(let x=0;x<=1000;x+=5){const yy=y+Math.sin(x*.007+layer*2)*amp+Math.sin(x*.018+layer)*amp*.24;ctx.lineTo(x,yy)}ctx.lineTo(w,h);ctx.fillStyle=colors[layer];ctx.fill()}
 for(let i=0;i<3;i++)hill(340+i*75,kind===1?12:kind===3?36:60,i);
 if(kind===2){for(let i=0;i<34;i++){const x=(i*79)%1050,y=370+(i%5)*38,size=35+i%4*12;ctx.fillStyle=colors[i%3];ctx.fillRect(x-3,y,6,80);ctx.beginPath();ctx.moveTo(x,y-size);ctx.lineTo(x-size*.5,y+45);ctx.lineTo(x+size*.5,y+45);ctx.fill()}}
 if(kind===1||kind===4){ctx.fillStyle=day?(kind===1?'#478fa7':'#598f96'):'#172f43';ctx.fillRect(0,440,w,180);for(let i=0;i<30;i++){ctx.strokeStyle=day?'#d4eef044':'#adc3dd22';ctx.lineWidth=1.5;ctx.beginPath();const x=(i*93+t*(12+i%4))%1100-100,y=453+i%12*13;ctx.moveTo(x,y);ctx.quadraticCurveTo(x+28,y-4,x+60,y);ctx.stroke()}}
 if(kind===1){for(let i=0;i<4;i++){const q=(t*.22+i*.26)%1,x=140+i*210+q*65,y=475-Math.sin(q*Math.PI)*80;ctx.save();ctx.translate(x,y);ctx.rotate(Math.cos(q*Math.PI)*-.8);ctx.fillStyle=day?'#dce3d2':'#7f9dac';ctx.beginPath();ctx.ellipse(0,0,10,4,0,0,7);ctx.moveTo(-7,0);ctx.lineTo(-16,-6);ctx.lineTo(-16,6);ctx.fill();ctx.restore()}}
 if(kind===0||kind===3){for(let i=0;i<3;i++){const x=(t*13+i*290)%1100-40,y=kind===3?515:355+Math.sin(x*.007)*60+Math.sin(x*.018)*14;ctx.save();ctx.translate(x,y-7);ctx.strokeStyle=day?'#393f36':'#93a4af';ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,9,5,0,0,7);ctx.ellipse(10,-5,4,4,0,0,7);ctx.fill();for(let j=0;j<4;j++){ctx.beginPath();ctx.moveTo(j*4-7,3);ctx.lineTo(j*4-7+Math.sin(t*8+j)*3,11);ctx.stroke()}ctx.restore()}}
 if(kind===2||kind===4||kind===0){for(let i=0;i<6;i++){const x=(t*30+i*170)%1150-75,y=210+i%3*27+Math.sin(t+i)*9;ctx.strokeStyle=day?'#354f51':'#a3b6c9';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-7,y-Math.sin(t*7+i)*5);ctx.lineTo(x,y);ctx.lineTo(x+7,y-Math.sin(t*7+i)*5);ctx.stroke()}}
 if(kind===5){ctx.fillStyle='#eff8ff99';for(let i=0;i<65;i++){const x=(i*127+Math.sin(t+i)*14)%1000,y=(i*57+t*24)%620;ctx.beginPath();ctx.arc(x,y,1.5+i%2,0,7);ctx.fill()}}
 requestAnimationFrame(frame)}requestAnimationFrame(frame);
};
const natureStyle=document.createElement('style');natureStyle.textContent='.projection-landscape.nature-landscape{background:none!important;animation:none!important;overflow:hidden}.projection-landscape.nature-landscape:before,.projection-landscape.nature-landscape:after{display:none!important}';document.head.append(natureStyle);
if(view==='home'&&['projection','wallfilm'].includes(effective().theme))home();
