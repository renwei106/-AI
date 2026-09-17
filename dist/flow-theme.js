/* 浮游灵感: a self-contained cover. Shared navigation and workspace actions are untouched. */
(() => {
  'use strict';
  COPY_DEFAULTS.flow={title:'让灵感\n自在流动',intro:'轻轻拨动，让喜欢的事物相遇。'};
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function random(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

  // Low-resolution velocity advection and pressure projection create a lingering wake.
  // Blocks have their own mass, angular inertia, drag, contact and downward acceleration.
  class FlowField {
    constructor(width,height){
      this.nx=clamp(Math.ceil(width/29)+2,14,88);this.ny=clamp(Math.ceil(height/29)+2,14,64);
      this.dx=width/(this.nx-2);this.dy=height/(this.ny-2);this.n=this.nx*this.ny;
      for(const k of ['u','v','oldU','oldV','pressure','div','curl'])this[k]=new Float32Array(this.n);
    }
    sample(a,x,y){
      x=clamp(x,.5,this.nx-1.5);y=clamp(y,.5,this.ny-1.5);
      const ix=Math.floor(x),iy=Math.floor(y),tx=x-ix,ty=y-iy,i=iy*this.nx+ix;
      return(a[i]*(1-tx)+a[i+1]*tx)*(1-ty)+(a[i+this.nx]*(1-tx)+a[i+this.nx+1]*tx)*ty;
    }
    stir(x,y,vx,vy,radius,swirl=0){
      const gx=x/this.dx+1,gy=y/this.dy+1,rx=radius/this.dx,ry=radius/this.dy;
      for(let yy=Math.max(1,Math.floor(gy-ry));yy<Math.min(this.ny-1,gy+ry);yy++)for(let xx=Math.max(1,Math.floor(gx-rx));xx<Math.min(this.nx-1,gx+rx);xx++){
        const px=(xx-gx)*this.dx,py=(yy-gy)*this.dy,q=(px*px+py*py)/(radius*radius);if(q>=1)continue;
        const w=(1-q)**2,i=yy*this.nx+xx;
        this.u[i]=clamp(this.u[i]+(vx-py/radius*swirl)*w,-850,850);
        this.v[i]=clamp(this.v[i]+(vy+px/radius*swirl)*w,-850,850);
      }
    }
    step(dt){
      const {nx,ny,dx,dy,u,v,oldU,oldV,pressure:p,div,curl}=this,h=(dx+dy)/2,fade=Math.exp(-.42*dt);
      oldU.set(u);oldV.set(v);
      for(let y=1;y<ny-1;y++)for(let x=1;x<nx-1;x++){
        const i=y*nx+x,px=x-oldU[i]*dt/dx,py=y-oldV[i]*dt/dy;
        u[i]=this.sample(oldU,px,py)*fade;v[i]=this.sample(oldV,px,py)*fade;
      }
      for(let y=1;y<ny-1;y++)for(let x=1;x<nx-1;x++){const i=y*nx+x;curl[i]=(v[i+1]-v[i-1])/(2*dx)-(u[i+nx]-u[i-nx])/(2*dy);}
      for(let y=2;y<ny-2;y++)for(let x=2;x<nx-2;x++){
        const i=y*nx+x,gx=(Math.abs(curl[i+1])-Math.abs(curl[i-1]))/dx,gy=(Math.abs(curl[i+nx])-Math.abs(curl[i-nx]))/dy,len=Math.hypot(gx,gy)+.0001;
        u[i]=clamp(u[i]+gy/len*curl[i]*18*dt,-850,850);v[i]=clamp(v[i]-gx/len*curl[i]*18*dt,-850,850);
      }
      p.fill(0);
      for(let y=1;y<ny-1;y++)for(let x=1;x<nx-1;x++){const i=y*nx+x;div[i]=((u[i+1]-u[i-1])/dx+(v[i+nx]-v[i-nx])/dy)*.5;}
      for(let pass=0;pass<9;pass++)for(let y=1;y<ny-1;y++)for(let x=1;x<nx-1;x++){const i=y*nx+x;p[i]=(p[i-1]+p[i+1]+p[i-nx]+p[i+nx]-div[i]*h*h)/4;}
      for(let y=1;y<ny-1;y++)for(let x=1;x<nx-1;x++){const i=y*nx+x;u[i]-=(p[i+1]-p[i-1])/(2*dx);v[i]-=(p[i+nx]-p[i-nx])/(2*dy);}
    }
  }
  function makeShapes(){
    const circle=new Path2D();circle.arc(0,0,.92,0,Math.PI*2);
    const square=new Path2D();square.roundRect(-.88,-.88,1.76,1.76,.13);
    const tri=new Path2D('M0 -1.08 L1 .74 L-1 .74 Z');
    const cross=new Path2D('M-.23 -1H.23V-.23H1V.23H.23V1H-.23V.23H-1V-.23H-.23Z');
    const capsule=new Path2D();capsule.roundRect(-.5,-1.12,1,2.24,.45);
    const diamond=new Path2D('M0 -1.08 1 0 0 1.08 -1 0Z');
    return[circle,square,tri,cross,capsule,diamond];
  }
  const shapes=makeShapes();
  const FORM_START=10000,FORM_END=30000;
  const FORM_NAMES=['城堡','鲨影','远行','地球','银河','太阳系','玫瑰','奔马','飞鸟','帆船','埃菲尔铁塔','飞机','上海天际线','东方明珠','金字塔','蒲公英'];
  const MODE_KEYS=['chaos','form','snow','tide'];
  const STYLE_NAMES={chaos:'混沌漫游',form:'万象成形',snow:'灵感落雪',tide:'潮汐涌动'};
  const FLOW_DOCK_ICON='<span class="flow-dock-gateway" aria-hidden="true"><svg viewBox="0 0 52 42" fill="none"><path class="flow-dock-gate" d="M26 2.5 44 12.7v16.6L26 39.5 8 29.3V12.7Z" stroke="currentColor" stroke-width="1.35"/><g class="flow-dock-enter" fill="currentColor"><circle cx="20.5" cy="16.5" r="2.5"/><rect x="27.5" y="14" width="5" height="5" rx="1"/><path d="m21 23.5 3.4 5.7h-6.8Z"/><path d="M28.9 22.7h2.2v2.2h2.2v2.2h-2.2v2.2h-2.2v-2.2h-2.2v-2.2h2.2Z"/></g></svg></span>';
  const FLOW_SPACE_SHAPES=[
    '<circle cx="12" cy="12" r="7"/>','<rect x="5" y="5" width="14" height="14" rx="2"/>','<path d="m12 4 8 15H4Z"/>','<path d="m12 3.5 8.5 8.5-8.5 8.5L3.5 12Z"/>',
    '<path d="m12 3.5 7.5 4.3v8.4L12 20.5l-7.5-4.3V7.8Z"/>','<rect x="7" y="3.5" width="10" height="17" rx="5"/>','<path d="M9.5 3.5h5v6h6v5h-6v6h-5v-6h-6v-5h6Z"/>','<circle cx="9" cy="12" r="5.5"/><circle cx="16" cy="12" r="4"/>',
    '<path d="M5 19V11a7 7 0 0 1 14 0v8h-4v-8a3 3 0 0 0-6 0v8Z"/>','<path d="m12 3 2.2 6.1 6.3.2-5 3.8 1.8 6.2-5.3-3.5-5.3 3.5 1.8-6.2-5-3.8 6.3-.2Z"/>','<path d="M18.5 16.7a8 8 0 1 1-8.7-12.1 6.8 6.8 0 1 0 8.7 12.1Z"/>','<path d="M4 17h16M6 14l3-7 3 7 3-10 3 10"/>'
  ];
  const MODE_COPY={
    chaos:{title:'让灵感\n自在流动',intro:'散落其间，也自有方向'},
    form:{title:'让万象\n缓缓成形',intro:'拨动一次，等待下一种相遇'},
    snow:{title:'让灵感\n缓缓落下',intro:'落下，积聚，也慢慢消融'},
    tide:{title:'让灵感\n随潮涌动',intro:'每一次经过，都会掀起新的流向'}
  };
  function normalizeMode(value){return value==='surge'?'snow':value==='flow'?'chaos':MODE_KEYS.includes(value)?value:'chaos';}
  function modeCopy(mode){const custom=prefs.sharedHomeCopy?.mode==='custom'||prefs.homeCopy?.flow?.mode==='custom';return custom?currentCopy('flow'):MODE_COPY[mode]||MODE_COPY.chaos;}
  const CHROME_IDLE_AFTER=15000;
  let chromeIdleTimer=0;
  function homeChromeActive(){return view==='home';}
  function resetChromeIdle(){
    document.body.classList.remove('global-chrome-idle');clearTimeout(chromeIdleTimer);
    if(!homeChromeActive()||!matchMedia('(pointer:fine)').matches)return;
    chromeIdleTimer=setTimeout(()=>{
      if(!homeChromeActive())return;
      if(document.querySelector('dialog[open],.brand:hover,.header-right:hover,.dock:hover,.dock-trigger[aria-expanded=true],.utility-search:hover,.scroll-invitation:hover,.mode-pull-cord:hover,.color-pull-cord:hover,.world-entry:hover')){resetChromeIdle();return;}
      document.body.classList.add('global-chrome-idle');
    },CHROME_IDLE_AFTER);
  }
  for(const type of ['pointermove','pointerdown','keydown','focusin'])document.addEventListener(type,resetChromeIdle,{passive:true});
  window.addEventListener('scroll',resetChromeIdle,{passive:true});
  function styleSwitch(active,labelClass){
    const next=MODE_KEYS[(MODE_KEYS.indexOf(active)+1)%MODE_KEYS.length];
    const marks=MODE_KEYS.map(mode=>`<i class="${mode===active?'is-active':''}"></i>`).join('');
    const menu=MODE_KEYS.map(mode=>`<button type="button" data-inspiration-mode="${mode}" aria-pressed="${mode===active}">${STYLE_NAMES[mode]}</button>`).join('');
    return `<div class="inspiration-style-switch" data-active-style="${active}"><button class="${labelClass} inspiration-style-label" data-inspiration-toggle title="点击切换为${STYLE_NAMES[next]}" aria-label="当前为${STYLE_NAMES[active]}，点击切换为${STYLE_NAMES[next]}"><span>${STYLE_NAMES[active]}</span><span class="inspiration-style-mark" aria-hidden="true">${marks}</span></button><div class="inspiration-style-menu" aria-label="选择粒子形态">${menu}</div></div>`;
  }
  function transitionLayer(cover,transition){
    if(!transition?.image)return;
    const veil=document.createElement('img');veil.className='inspiration-transition-veil';veil.alt='';veil.src=transition.image;cover.appendChild(veil);
    requestAnimationFrame(()=>requestAnimationFrame(()=>veil.classList.add('is-leaving')));
    setTimeout(()=>veil.remove(),1900);
  }
  function formationPoints(kind,count,width,height,safeTop){
    const mw=clamp(Math.round(width*.52),280,680),mh=clamp(Math.round(height*.52),250,520),mask=document.createElement('canvas');mask.width=mw;mask.height=mh;
    const g=mask.getContext('2d'),features=[];g.fillStyle='#fff';g.strokeStyle='#fff';g.lineJoin='round';g.lineCap='round';
    if(kind===0){
      const base=mh*.88,wallTop=mh*.65;g.fillRect(mw*.2,wallTop,mw*.6,base-wallTop);
      for(const [x,w,top] of [[.14,.17,.53],[.405,.19,.43],[.69,.17,.53]]){g.fillRect(mw*x,mh*top,mw*w,base-mh*top);const tooth=mw*w/5;for(let i=0;i<5;i+=2)g.fillRect(mw*x+i*tooth,mh*(top-.045),tooth,mh*.055);}
      g.beginPath();g.moveTo(mw*.405,mh*.43);g.lineTo(mw*.5,mh*.31);g.lineTo(mw*.595,mh*.43);g.fill();g.fillRect(mw*.492,mh*.25,mw*.016,mh*.08);g.beginPath();g.moveTo(mw*.508,mh*.25);g.lineTo(mw*.57,mh*.275);g.lineTo(mw*.508,mh*.3);g.fill();
      g.globalCompositeOperation='destination-out';for(const [x,y] of [[.225,.63],[.5,.54],[.775,.63]]){g.beginPath();g.arc(mw*x,mh*y,mh*.025,0,Math.PI*2);g.fill();}g.beginPath();g.arc(mw*.5,base,mw*.07,Math.PI,0);g.fillRect(mw*.43,base-mh*.08,mw*.14,mh*.09);g.globalCompositeOperation='source-over';g.fillRect(mw*.15,base,mw*.7,mh*.025);
    }else if(kind===1){
      g.beginPath();g.moveTo(mw*.19,mh*.69);g.bezierCurveTo(mw*.31,mh*.54,mw*.64,mh*.54,mw*.86,mh*.65);g.bezierCurveTo(mw*.82,mh*.69,mw*.76,mh*.715,mw*.68,mh*.735);g.bezierCurveTo(mw*.49,mh*.81,mw*.3,mh*.78,mw*.19,mh*.7);g.lineTo(mw*.08,mh*.81);g.lineTo(mw*.105,mh*.68);g.lineTo(mw*.065,mh*.55);g.closePath();g.fill();
      g.beginPath();g.moveTo(mw*.43,mh*.56);g.lineTo(mw*.52,mh*.43);g.lineTo(mw*.57,mh*.57);g.fill();g.beginPath();g.moveTo(mw*.47,mh*.75);g.lineTo(mw*.59,mh*.87);g.lineTo(mw*.57,mh*.72);g.fill();
      g.globalCompositeOperation='destination-out';g.beginPath();g.arc(mw*.75,mh*.612,mh*.038,0,Math.PI*2);g.fill();g.beginPath();g.moveTo(mw*.675,mh*.666);g.quadraticCurveTo(mw*.765,mh*.69,mw*.852,mh*.654);g.quadraticCurveTo(mw*.81,mh*.724,mw*.7,mh*.724);g.closePath();g.fill();g.globalCompositeOperation='source-over';
      features.push([mw*.75,mh*.612,'eye']);for(let i=0;i<5;i++){const x=mw*(.698+i*.029);g.beginPath();g.moveTo(x,mh*.667);g.lineTo(x+mw*.014,mh*.7);g.lineTo(x+mw*.027,mh*.673);g.closePath();g.fill();g.beginPath();g.moveTo(x+mw*.008,mh*.721);g.lineTo(x+mw*.021,mh*.692);g.lineTo(x+mw*.034,mh*.718);g.closePath();g.fill();features.push([x+mw*.014,mh*.688,'tooth'],[x+mw*.021,mh*.704,'tooth-up']);}
    }else if(kind===2){
      g.beginPath();g.moveTo(mw*.13,mh*.77);g.quadraticCurveTo(mw*.14,mh*.67,mw*.28,mh*.64);g.lineTo(mw*.39,mh*.52);g.quadraticCurveTo(mw*.52,mh*.46,mw*.66,mh*.54);g.lineTo(mw*.75,mh*.65);g.quadraticCurveTo(mw*.86,mh*.67,mw*.88,mh*.77);g.closePath();g.fill();
      g.globalCompositeOperation='destination-out';g.beginPath();g.moveTo(mw*.4,mh*.55);g.quadraticCurveTo(mw*.48,mh*.49,mw*.54,mh*.51);g.lineTo(mw*.54,mh*.64);g.lineTo(mw*.35,mh*.64);g.closePath();g.fill();g.beginPath();g.moveTo(mw*.57,mh*.51);g.quadraticCurveTo(mw*.63,mh*.53,mw*.71,mh*.64);g.lineTo(mw*.57,mh*.64);g.closePath();g.fill();
      for(const x of [.29,.72]){g.beginPath();g.arc(mw*x,mh*.77,mh*.088,0,Math.PI*2);g.fill();}g.globalCompositeOperation='source-over';
      for(const x of [.29,.72]){g.beginPath();g.arc(mw*x,mh*.77,mh*.079,0,Math.PI*2);g.fill();g.globalCompositeOperation='destination-out';g.beginPath();g.arc(mw*x,mh*.77,mh*.04,0,Math.PI*2);g.fill();g.globalCompositeOperation='source-over';g.beginPath();g.arc(mw*x,mh*.77,mh*.015,0,Math.PI*2);g.fill();}
    }else if(kind===3){
      g.lineWidth=Math.max(8,mh*.025);g.beginPath();g.arc(mw*.5,mh*.68,mh*.205,0,Math.PI*2);g.stroke();
      g.beginPath();g.moveTo(mw*.42,mh*.52);g.bezierCurveTo(mw*.35,mh*.58,mw*.43,mh*.64,mw*.39,mh*.7);g.bezierCurveTo(mw*.35,mh*.75,mw*.43,mh*.83,mw*.5,mh*.79);g.lineTo(mw*.53,mh*.69);g.lineTo(mw*.49,mh*.62);g.closePath();g.fill();g.beginPath();g.moveTo(mw*.57,mh*.55);g.bezierCurveTo(mw*.67,mh*.58,mw*.66,mh*.66,mw*.61,mh*.68);g.bezierCurveTo(mw*.7,mh*.72,mw*.65,mh*.79,mw*.57,mh*.82);g.lineTo(mw*.53,mh*.73);g.closePath();g.fill();
    }else if(kind===4){
      g.lineWidth=Math.max(7,mh*.018);for(let arm=0;arm<4;arm++){g.beginPath();for(let i=0;i<46;i++){const a=arm*Math.PI/2+i*.17,r=mh*(.018+i*.0042),x=mw*.5+Math.cos(a)*r*1.65,y=mh*.68+Math.sin(a)*r*.66;i?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}g.beginPath();g.ellipse(mw*.5,mh*.68,mw*.085,mh*.04,-.18,0,Math.PI*2);g.fill();
    }else if(kind===5){
      g.lineWidth=Math.max(4,mh*.012);for(const [rx,ry] of [[.13,.035],[.22,.06],[.31,.085]]){g.beginPath();g.ellipse(mw*.5,mh*.69,mw*rx,mh*ry,-.18,0,Math.PI*2);g.stroke();}g.beginPath();g.arc(mw*.5,mh*.69,mh*.07,0,Math.PI*2);g.fill();for(const [x,y,r] of [[.37,.69,.026],[.61,.65,.032],[.76,.64,.023]]){g.beginPath();g.arc(mw*x,mh*y,mh*r,0,Math.PI*2);g.fill();}
    }else if(kind===6){
      g.lineWidth=Math.max(8,mh*.02);g.beginPath();g.moveTo(mw*.5,mh*.61);g.bezierCurveTo(mw*.37,mh*.66,mw*.27,mh*.57,mw*.34,mh*.48);g.bezierCurveTo(mw*.28,mh*.39,mw*.39,mh*.29,mw*.49,mh*.38);g.bezierCurveTo(mw*.57,mh*.27,mw*.72,mh*.34,mw*.66,mh*.45);g.bezierCurveTo(mw*.76,mh*.53,mw*.65,mh*.65,mw*.5,mh*.61);g.stroke();
      g.lineWidth=Math.max(6,mh*.014);for(const [sx,sy,cx,cy,ex,ey] of [[.34,.48,.42,.42,.5,.49],[.49,.38,.6,.4,.61,.5],[.36,.54,.47,.48,.61,.54],[.39,.59,.5,.52,.67,.57],[.44,.45,.49,.39,.55,.44],[.45,.52,.5,.47,.56,.51]]){g.beginPath();g.moveTo(mw*sx,mh*sy);g.quadraticCurveTo(mw*cx,mh*cy,mw*ex,mh*ey);g.stroke();}
      g.beginPath();g.arc(mw*.51,mh*.49,mh*.026,0,Math.PI*2);g.fill();g.lineWidth=Math.max(7,mh*.018);g.beginPath();g.moveTo(mw*.5,mh*.61);g.bezierCurveTo(mw*.47,mh*.69,mw*.48,mh*.8,mw*.51,mh*.91);g.stroke();
      for(const side of [-1,1]){g.beginPath();g.moveTo(mw*.5,mh*.75);g.bezierCurveTo(mw*(.5+side*.06),mh*.7,mw*(.5+side*.15),mh*.72,mw*(.5+side*.18),mh*.8);g.bezierCurveTo(mw*(.5+side*.1),mh*.84,mw*(.5+side*.035),mh*.81,mw*.5,mh*.78);g.fill();}
      g.lineWidth=Math.max(3,mh*.007);g.beginPath();g.moveTo(mw*.49,mh*.83);g.lineTo(mw*.47,mh*.86);g.moveTo(mw*.5,mh*.72);g.lineTo(mw*.53,mh*.69);g.stroke();
    }else if(kind===7){
      g.lineWidth=Math.max(18,mh*.042);g.beginPath();g.moveTo(mw*.27,mh*.63);g.bezierCurveTo(mw*.32,mh*.52,mw*.52,mh*.5,mw*.63,mh*.57);g.bezierCurveTo(mw*.7,mh*.62,mw*.65,mh*.73,mw*.56,mh*.75);g.bezierCurveTo(mw*.43,mh*.78,mw*.3,mh*.74,mw*.27,mh*.63);g.closePath();g.stroke();
      g.beginPath();g.moveTo(mw*.57,mh*.59);g.bezierCurveTo(mw*.62,mh*.46,mw*.64,mh*.34,mw*.7,mh*.29);g.bezierCurveTo(mw*.73,mh*.25,mw*.78,mh*.27,mw*.81,mh*.32);g.lineTo(mw*.8,mh*.39);g.lineTo(mw*.72,mh*.44);g.bezierCurveTo(mw*.69,mh*.53,mw*.7,mh*.64,mw*.63,mh*.69);g.closePath();g.fill();g.beginPath();g.moveTo(mw*.69,mh*.3);g.lineTo(mw*.69,mh*.21);g.lineTo(mw*.74,mh*.28);g.moveTo(mw*.74,mh*.28);g.lineTo(mw*.78,mh*.22);g.lineTo(mw*.78,mh*.31);g.fill();
      g.lineWidth=Math.max(14,mh*.038);g.beginPath();g.moveTo(mw*.32,mh*.69);g.quadraticCurveTo(mw*.25,mh*.82,mw*.17,mh*.81);g.moveTo(mw*.4,mh*.72);g.quadraticCurveTo(mw*.46,mh*.86,mw*.56,mh*.88);g.moveTo(mw*.57,mh*.7);g.quadraticCurveTo(mw*.66,mh*.81,mw*.78,mh*.77);g.moveTo(mw*.62,mh*.68);g.quadraticCurveTo(mw*.59,mh*.84,mw*.68,mh*.9);g.stroke();g.lineWidth=Math.max(11,mh*.03);g.beginPath();g.moveTo(mw*.28,mh*.62);g.quadraticCurveTo(mw*.2,mh*.52,mw*.15,mh*.58);g.quadraticCurveTo(mw*.2,mh*.44,mw*.31,mh*.55);g.stroke();g.lineWidth=Math.max(7,mh*.018);g.beginPath();g.moveTo(mw*.63,mh*.45);g.quadraticCurveTo(mw*.67,mh*.37,mw*.69,mh*.3);g.stroke();features.push([mw*.765,mh*.325,'eye']);
    }else if(kind===8){
      g.beginPath();g.moveTo(mw*.18,mh*.7);g.quadraticCurveTo(mw*.33,mh*.5,mw*.5,mh*.66);g.quadraticCurveTo(mw*.67,mh*.48,mw*.84,mh*.7);g.quadraticCurveTo(mw*.66,mh*.61,mw*.52,mh*.76);g.quadraticCurveTo(mw*.34,mh*.6,mw*.18,mh*.7);g.fill();g.beginPath();g.ellipse(mw*.52,mh*.72,mw*.14,mh*.045,-.08,0,Math.PI*2);g.fill();g.beginPath();g.moveTo(mw*.39,mh*.72);g.lineTo(mw*.28,mh*.63);g.lineTo(mw*.35,mh*.76);g.fill();
    }else if(kind===9){
      g.lineWidth=Math.max(7,mh*.018);g.beginPath();g.moveTo(mw*.49,mh*.27);g.lineTo(mw*.49,mh*.79);g.stroke();g.beginPath();g.moveTo(mw*.48,mh*.29);g.lineTo(mw*.2,mh*.7);g.lineTo(mw*.48,mh*.7);g.closePath();g.fill();g.beginPath();g.moveTo(mw*.52,mh*.38);g.lineTo(mw*.79,mh*.72);g.lineTo(mw*.52,mh*.72);g.closePath();g.fill();
      g.beginPath();g.moveTo(mw*.14,mh*.75);g.quadraticCurveTo(mw*.49,mh*.82,mw*.86,mh*.74);g.lineTo(mw*.78,mh*.88);g.lineTo(mw*.29,mh*.88);g.closePath();g.fill();g.globalCompositeOperation='destination-out';g.beginPath();g.moveTo(mw*.25,mh*.79);g.quadraticCurveTo(mw*.5,mh*.84,mw*.76,mh*.79);g.lineTo(mw*.72,mh*.82);g.quadraticCurveTo(mw*.5,mh*.86,mw*.29,mh*.82);g.closePath();g.fill();g.globalCompositeOperation='source-over';g.fillRect(mw*.44,mh*.69,mw*.16,mh*.06);g.lineWidth=Math.max(3,mh*.007);for(let line=0;line<3;line++){g.beginPath();g.moveTo(mw*(.15+line*.04),mh*(.91+line*.025));g.quadraticCurveTo(mw*.5,mh*(.87+line*.025),mw*(.86-line*.035),mh*(.91+line*.025));g.stroke();}
    }else if(kind===10){
      g.lineWidth=Math.max(7,mh*.016);g.beginPath();g.moveTo(mw*.5,mh*.18);g.bezierCurveTo(mw*.47,mh*.43,mw*.42,mh*.66,mw*.27,mh*.89);g.moveTo(mw*.5,mh*.18);g.bezierCurveTo(mw*.53,mh*.43,mw*.58,mh*.66,mw*.73,mh*.89);g.stroke();
      for(const y of [.49,.67,.86])g.fillRect(mw*(.33-(y-.49)*.35),mh*y,mw*(.34+(y-.49)*.7),Math.max(6,mh*.018));g.fillRect(mw*.492,mh*.1,mw*.016,mh*.11);
      g.lineWidth=Math.max(3,mh*.007);for(let level=0;level<6;level++){const y1=.28+level*.09,y2=y1+.09,left1=.5-(y1-.18)*.42,left2=.5-(y2-.18)*.42,right1=1-left1,right2=1-left2;g.beginPath();g.moveTo(mw*left1,mh*y1);g.lineTo(mw*right2,mh*y2);g.moveTo(mw*right1,mh*y1);g.lineTo(mw*left2,mh*y2);g.stroke();}g.beginPath();g.moveTo(mw*.27,mh*.89);g.quadraticCurveTo(mw*.5,mh*.68,mw*.73,mh*.89);g.stroke();
    }else if(kind===11){
      g.beginPath();g.moveTo(mw*.09,mh*.62);g.quadraticCurveTo(mw*.16,mh*.57,mw*.32,mh*.57);g.lineTo(mw*.44,mh*.31);g.lineTo(mw*.55,mh*.31);g.lineTo(mw*.51,mh*.57);g.lineTo(mw*.82,mh*.54);g.quadraticCurveTo(mw*.91,mh*.55,mw*.94,mh*.62);g.quadraticCurveTo(mw*.91,mh*.69,mw*.82,mh*.7);g.lineTo(mw*.51,mh*.67);g.lineTo(mw*.55,mh*.9);g.lineTo(mw*.44,mh*.9);g.lineTo(mw*.32,mh*.67);g.lineTo(mw*.17,mh*.67);g.lineTo(mw*.11,mh*.78);g.lineTo(mw*.06,mh*.78);g.lineTo(mw*.09,mh*.62);g.closePath();g.fill();
      g.globalCompositeOperation='destination-out';g.beginPath();g.ellipse(mw*.8,mh*.61,mw*.055,mh*.025,0,0,Math.PI*2);g.fill();for(const y of [.47,.76]){g.beginPath();g.ellipse(mw*.43,mh*y,mw*.035,mh*.055,0,0,Math.PI*2);g.fill();}g.globalCompositeOperation='source-over';
    }else if(kind===12){
      g.fillRect(mw*.13,mh*.9,mw*.74,mh*.022);g.beginPath();g.moveTo(mw*.2,mh*.9);g.lineTo(mw*.2,mh*.54);g.lineTo(mw*.23,mh*.54);g.lineTo(mw*.23,mh*.47);g.lineTo(mw*.26,mh*.47);g.lineTo(mw*.26,mh*.4);g.lineTo(mw*.29,mh*.4);g.lineTo(mw*.29,mh*.33);g.lineTo(mw*.32,mh*.33);g.lineTo(mw*.32,mh*.27);g.lineTo(mw*.35,mh*.27);g.lineTo(mw*.35,mh*.9);g.closePath();g.fill();
      g.fillRect(mw*.405,mh*.32,mw*.19,mh*.58);g.globalCompositeOperation='destination-out';g.beginPath();g.moveTo(mw*.445,mh*.37);g.lineTo(mw*.555,mh*.37);g.lineTo(mw*.54,mh*.46);g.lineTo(mw*.46,mh*.46);g.closePath();g.fill();g.globalCompositeOperation='source-over';
      g.beginPath();g.moveTo(mw*.66,mh*.9);g.bezierCurveTo(mw*.61,mh*.69,mw*.64,mh*.42,mw*.73,mh*.2);g.bezierCurveTo(mw*.82,mh*.43,mw*.84,mh*.68,mw*.82,mh*.9);g.closePath();g.fill();g.lineWidth=Math.max(3,mh*.006);g.globalAlpha=.55;for(let y=.49;y<.87;y+=.07){g.beginPath();g.moveTo(mw*.21,mh*y);g.lineTo(mw*.34,mh*y);g.moveTo(mw*.42,mh*y);g.lineTo(mw*.58,mh*y);g.moveTo(mw*(.65+(y-.49)*.04),mh*y);g.lineTo(mw*(.81+(y-.49)*.015),mh*y);g.stroke();}g.globalAlpha=1;
    }else if(kind===13){
      g.lineWidth=Math.max(8,mh*.018);g.beginPath();g.moveTo(mw*.5,mh*.14);g.lineTo(mw*.5,mh*.91);g.stroke();g.fillRect(mw*.484,mh*.08,mw*.032,mh*.13);
      for(const [y,r] of [[.36,.105],[.58,.155],[.73,.07]]){g.beginPath();g.arc(mw*.5,mh*y,mh*r,0,Math.PI*2);g.fill();g.globalCompositeOperation='destination-out';g.beginPath();g.arc(mw*.47,mh*(y-.025),mh*r*.22,0,Math.PI*2);g.fill();g.globalCompositeOperation='source-over';}
      g.lineWidth=Math.max(6,mh*.014);g.beginPath();g.moveTo(mw*.45,mh*.75);g.lineTo(mw*.32,mh*.91);g.moveTo(mw*.55,mh*.75);g.lineTo(mw*.68,mh*.91);g.stroke();for(const y of [.49,.66,.79])g.fillRect(mw*.43,mh*y,mw*.14,Math.max(4,mh*.01));
    }else if(kind===14){
      g.globalAlpha=.45;g.beginPath();g.moveTo(mw*.08,mh*.88);g.lineTo(mw*.28,mh*.58);g.lineTo(mw*.48,mh*.88);g.closePath();g.fill();g.beginPath();g.moveTo(mw*.56,mh*.88);g.lineTo(mw*.76,mh*.62);g.lineTo(mw*.94,mh*.88);g.closePath();g.fill();g.globalAlpha=1;g.beginPath();g.moveTo(mw*.19,mh*.88);g.lineTo(mw*.53,mh*.3);g.lineTo(mw*.85,mh*.88);g.closePath();g.fill();
      g.globalCompositeOperation='destination-out';g.lineWidth=Math.max(3,mh*.007);for(let level=1;level<8;level++){const y=.3+level*.073,half=(y-.3)*.57;g.beginPath();g.moveTo(mw*(.53-half),mh*y);g.lineTo(mw*(.53+half),mh*y);g.stroke();}for(let ray=1;ray<6;ray++){g.beginPath();g.moveTo(mw*.53,mh*.3);g.lineTo(mw*(.19+ray*.11),mh*.88);g.stroke();}g.globalCompositeOperation='source-over';g.fillRect(mw*.12,mh*.9,mw*.78,mh*.018);
    }else{
      const cx=mw*.43,cy=mh*.48,r=mh*.19;g.lineWidth=Math.max(3,mh*.007);for(let spoke=0;spoke<42;spoke++){const angle=spoke*Math.PI*2/42+(spoke%3)*.025,length=r*(.72+(spoke%5)*.065),x=cx+Math.cos(angle)*length,y=cy+Math.sin(angle)*length;g.beginPath();g.moveTo(cx+Math.cos(angle)*r*.12,cy+Math.sin(angle)*r*.12);g.lineTo(x,y);g.stroke();g.beginPath();g.arc(x,y,Math.max(2,mh*.007),0,Math.PI*2);g.fill();}
      g.lineWidth=Math.max(7,mh*.016);g.beginPath();g.moveTo(cx,cy+r*.08);g.bezierCurveTo(mw*.46,mh*.65,mw*.48,mh*.78,mw*.44,mh*.92);g.stroke();g.beginPath();g.moveTo(mw*.46,mh*.76);g.quadraticCurveTo(mw*.58,mh*.69,mw*.62,mh*.78);g.quadraticCurveTo(mw*.53,mh*.84,mw*.46,mh*.79);g.fill();
      g.lineWidth=Math.max(2,mh*.005);for(const [x,y,a] of [[.69,.33,-.5],[.78,.25,.1],[.84,.4,.7],[.72,.48,1.1]]){const px=mw*x,py=mh*y;g.beginPath();g.moveTo(px,py);g.lineTo(px+Math.cos(a)*mh*.05,py+Math.sin(a)*mh*.05);g.stroke();g.beginPath();g.arc(px,py,Math.max(2,mh*.006),0,Math.PI*2);g.fill();}
    }
    const pixels=g.getImageData(0,0,mw,mh).data,points=[],step=3;
    for(let y=0;y<mh;y+=step)for(let x=0;x<mw;x+=step){const alpha=pixels[(y*mw+x)*4+3];if(alpha<32)continue;const copies=alpha>220?3:alpha>110?2:1;for(let copy=0;copy<copies;copy++)points.push([x,y,alpha]);}
    let minX=mw,maxX=0,minY=mh,maxY=0;for(const p of points){minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]);}const centerShift=mw*.5-(minX+maxX)*.5;
    const pick=random(1917+kind*311+Math.round(width));
    for(let i=0;i<Math.min(count,points.length);i++){const j=i+Math.floor(pick()*(points.length-i));[points[i],points[j]]=[points[j],points[i]];}
    const sx=width/mw,sy=height/mh,shapeBottom=height*.97,naturalHeight=(maxY-minY)*sy,availableHeight=Math.max(height*.12,shapeBottom-safeTop),shapeHeight=Math.min(naturalHeight,height*.38,availableHeight),heightScale=shapeHeight/Math.max(1,maxY-minY);
    const place=(p,spread=0)=>({x:clamp(p[0]+centerShift+(pick()-.5)*spread,2,mw-2)*sx,y:clamp(shapeBottom-(maxY-p[1])*heightScale+(pick()-.5)*spread,safeTop,shapeBottom),shade:typeof p[2]==='number'&&p[2]<175?'light':'dark'}),targets=Array.from({length:count},(_,i)=>{const p=points[i%points.length]||[mw*.5,mh*.7,255],repeat=Math.floor(i/Math.max(1,points.length));return place(p,repeat?step*.7:step*.25)});
    features.forEach((feature,index)=>{if(index<targets.length)targets[index]={...place(feature),feature:feature[2]};});return targets;
  }
  function solarSystemFormation(count,width,height,safeTop){
    const bottom=height*.97,available=Math.max(height*.18,bottom-safeTop),centerX=width*.5,centerY=safeTop+available*.56,outerRx=Math.min(width*.4,available*1.55),outerRy=Math.min(available*.41,height*.165),tilt=-.14,scale=clamp(Math.min(width/1288,height/1041),.7,1.25);
    const phases=[.3,2.25,4.4,1.18,3.2,5.28,.72,2.9],planetRadii=[7,9,10,8,18,16,13,12].map(radius=>radius*scale),orbits=phases.map((phase,index)=>({centerX,centerY,rx:outerRx*(.23+index*.11),ry:outerRy*(.22+index*.108),tilt,phase,speed:.13/(1+index*.23),planetRadius:planetRadii[index]}));
    const sunRadius=Math.min(available*.115,width*.043),minimum=Math.max(12,Math.floor(count*.018)),weights=[5,...planetRadii.map(radius=>(radius/scale)**1.25)],weightSum=weights.reduce((sum,value)=>sum+value,0),remaining=Math.max(0,count-minimum*weights.length),counts=weights.map(weight=>minimum+Math.floor(remaining*weight/weightSum));
    for(let assigned=counts.reduce((sum,value)=>sum+value,0),index=0;assigned<count;assigned++,index=(index+1)%counts.length)counts[index]++;
    const targets=[],golden=Math.PI*(3-Math.sqrt(5));
    function orbitPoint(orbit,angle){const ex=Math.cos(angle)*orbit.rx,ey=Math.sin(angle)*orbit.ry,c=Math.cos(orbit.tilt),s=Math.sin(orbit.tilt);return{x:orbit.centerX+ex*c-ey*s,y:orbit.centerY+ex*s+ey*c};}
    function addBody(bodyIndex,total,radius,orbit){
      const base=orbit?orbitPoint(orbit,orbit.phase):{x:centerX,y:centerY};
      for(let index=0;index<total;index++){const distance=radius*Math.sqrt((index+.45)/total),angle=index*golden+(bodyIndex+1)*.37,localX=Math.cos(angle)*distance,localY=Math.sin(angle)*distance;targets.push({x:base.x+localX,y:base.y+localY,solar:{body:bodyIndex,localX,localY,baseX:base.x,baseY:base.y,orbitIndex:bodyIndex<0?-1:bodyIndex}});}
    }
    addBody(-1,counts[0],sunRadius,null);for(let index=0;index<8;index++)addBody(index,counts[index+1],planetRadii[index],orbits[index]);
    return{targets:targets.slice(0,count),orbits,center:{x:centerX,y:centerY}};
  }
  function mountFlow(root){
    let activeMode=normalizeMode(prefs.flowStyle);
    const transition=globalThis.__inspirationTransition?.toStyle===activeMode?globalThis.__inspirationTransition:null;
    if(transition)delete globalThis.__inspirationTransition;
    const copy=modeCopy(activeMode);
    root.insertAdjacentHTML('afterbegin',`<div class="flow-cover" data-flow-state="${activeMode}" data-particle-mode="${activeMode}"><canvas class="flow-canvas flow-canvas-back" aria-hidden="true"></canvas><div class="flow-copy">${styleSwitch(activeMode,'flow-eyebrow')}<h1 data-flow-title></h1><p data-flow-intro></p></div><canvas class="flow-depth-canvas flow-canvas-front" aria-hidden="true"></canvas><span class="flow-touch-hint"></span></div>`);
    const cover=root.querySelector('.flow-cover'),canvas=cover.querySelector('.flow-canvas-back'),frontCanvas=cover.querySelector('.flow-canvas-front'),ctx=canvas.getContext('2d',{alpha:true}),frontCtx=frontCanvas.getContext('2d',{alpha:true});
    cover.querySelector('[data-flow-title]').textContent=copy.title;cover.querySelector('[data-flow-intro]').textContent=copy.intro;
    if(!ctx||!frontCtx)return;
    const reduce=matchMedia('(prefers-reduced-motion: reduce)'),rand=random(94176);
    let width=0,height=0,dpr=1,field,blocks=[],head,next,hashCols,frame=0,last=0,clock=0,disposed=false,previous=null,ink='#fff',tone='#d9e1ff',detailInk='#142154',modalOpen=false;
    let formation=0,formationIndex=activeMode==='form'?0:-1,formationTargets=[],formationCenter={x:0,y:0},formationAssignedClock=0,solarOrbits=[],lastStir=performance.now(),lastGesture=0,morphStep=0,inherited=transition?.particles||null,modeStartedAt=0,handoffUntil=0;
    let ripples=[],lastRipple=0,lastRipplePoint=null,traces=[],lastTracePoint=null,lastTrace=0;
    const cell=24,pixel=document.createElement('canvas');pixel.width=pixel.height=1;const pixelContext=pixel.getContext('2d',{willReadFrequently:true});
    const touchHints={chaos:'轻触或滑动，让粒子在空间里漫游',form:'轻触或滑动，打乱后等待万象成形',snow:'轻触或滑动，拨开一场落雪',tide:'轻触或滑动，掀起一阵潮汐'};
    function updateModeUI(){
      const copy=modeCopy(activeMode),switcher=cover.querySelector('.inspiration-style-switch'),label=switcher?.querySelector('.inspiration-style-label>span:first-child');
      cover.dataset.particleMode=activeMode;cover.dataset.flowState=activeMode;canvas.dataset.mode=activeMode;document.body.dataset.flowStyle=activeMode;
      if(activeMode!=='snow')for(const key of ['snowDepth','snowTargetDepth','snowMaxDepth','snowSettled','snowMelting'])delete canvas.dataset[key];if(activeMode!=='tide')for(const key of ['tideLevel','ripples','rippleLayers'])delete canvas.dataset[key];if(activeMode!=='form')delete canvas.dataset.traceGlyph;canvas.dataset.traceStyle=activeMode==='tide'?'water':activeMode;canvas.dataset.traces=String(traces.length);
      if(switcher){switcher.dataset.activeStyle=activeMode;if(label)label.textContent=STYLE_NAMES[activeMode];switcher.querySelectorAll('[data-inspiration-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.inspirationMode===activeMode)));switcher.querySelectorAll('.inspiration-style-mark i').forEach((dot,index)=>dot.classList.toggle('is-active',MODE_KEYS[index]===activeMode));const next=MODE_KEYS[(MODE_KEYS.indexOf(activeMode)+1)%MODE_KEYS.length],toggle=switcher.querySelector('[data-inspiration-toggle]');toggle.title=`点击切换为${STYLE_NAMES[next]}`;toggle.setAttribute('aria-label',`当前为${STYLE_NAMES[activeMode]}，点击切换为${STYLE_NAMES[next]}`);}
      cover.querySelector('[data-flow-title]').textContent=copy.title;cover.querySelector('[data-flow-intro]').textContent=copy.intro;cover.querySelector('.flow-touch-hint').textContent=touchHints[activeMode];
    }
    function resetParticleForMode(p,index){
      p.sleeping=false;p.sleep=0;p.rest=0;p.life=activeMode==='snow'?18+rand()*45:18;p.snowLayer=p.snowLayer??Math.pow(rand(),1.25);p.snowLane=p.snowLane??((index+.5)/Math.max(1,blocks.length));p.fluidDepth=p.fluidDepth??rand();p.depth=p.depth??rand();p.wanderA=p.wanderA??rand()*Math.PI*2;p.wanderB=p.wanderB??rand()*Math.PI*2;p.renderX=p.x;p.renderY=p.y;
      if(p.retiring){p.vx*=.16;p.vy*=.16;p.spin*=.35;p.justCreated=false;return;}
      if(activeMode==='snow'){p.vx*=.36;p.vy=Math.max(22,p.vy*.24);if(!p.justCreated)p.delay=0;}
      else if(activeMode==='tide'){p.vx*=.6;p.vy=Math.max(72,p.vy*.45+42);}
      else if(activeMode==='chaos'){p.vx+=(rand()-.5)*18;p.vy+=(rand()-.5)*14;p.roamX=rand();p.roamY=rand();p.roamUntil=clock+8+rand()*18;}
      p.justCreated=false;
    }
    function particleCounts(w=width,h=height){
      const base=clamp(Math.round(w*h/1500),190,1150),snow=w<600?clamp(Math.round(w*h/3200),100,220):clamp(Math.round(w*h/3200),240,620),dense=w<600?clamp(Math.round(w*h/390),760,1850):clamp(Math.round(w*h/390),1450,3600);
      return{base,snow,dense};
    }
    function createParticle(w,h,index,targetCount){
      const {base}=particleCounts(w,h),denseExtra=index>=base,laneIndex=denseExtra?index-base:index,laneTotal=denseExtra?targetCount-base:Math.min(base,targetCount),snowLane=(laneIndex+.5)/Math.max(1,laneTotal),r=3.5+rand()*3.9;let x,y,inletSide=0;
      if(activeMode==='snow'&&denseExtra){x=clamp(snowLane*w+(rand()-.5)*w*.028,0,w);y=-24-rand()*h*.75;}
      else if(activeMode==='tide'&&denseExtra){inletSide=index%2?-1:1;x=w*(inletSide>0?.075+rand()*.085:.925-rand()*.085);y=-r-rand()*h*.17;}
      else for(let tries=0;tries<20;tries++){x=rand()*w;y=rand()*h;const center=((x-w*.5)/(w*.35))**2+((y-h*.4)/(h*.25))**2;if(center>1||rand()<.34)break;}
      const extraOrder=Math.max(0,index-base)/Math.max(1,targetCount-base),delay=activeMode==='snow'&&denseExtra?1+extraOrder*12+rand()*2.2:activeMode==='tide'&&denseExtra?extraOrder*6.2+rand()*.8:0;
      return{x,y,r,m:r/5.5,vx:activeMode==='tide'&&denseExtra?inletSide*(34+rand()*62):(rand()-.5)*12,vy:activeMode==='snow'?22+rand()*38:activeMode==='tide'?165+rand()*145:rand()*8,angle:rand()*Math.PI*2,spin:(rand()-.5)*.4,tilt:rand()*6.28,kind:Math.floor(rand()*6),tone:rand()>.8,depth:rand(),snowLayer:Math.pow(rand(),1.18),snowLane,fluidDepth:activeMode==='tide'?(laneIndex*.61803398875+rand()*.025)%1:rand(),wanderA:rand()*Math.PI*2,wanderB:rand()*Math.PI*2,roamX:rand(),roamY:rand(),roamUntil:8+rand()*18,sleeping:false,sleep:0,rest:0,life:18,delay,denseExtra,birth:denseExtra?0:1,retiring:false,retireAge:0,justCreated:true};
    }
    function syncParticleCount(){
      const counts=particleCounts(),target=activeMode==='snow'?counts.snow:activeMode==='tide'?counts.dense:counts.base;
      if(reduce.matches&&blocks.length>target)blocks.length=target;
      for(let index=0;index<Math.min(blocks.length,target);index++){const p=blocks[index];if(p.retiring)p.birth=Math.max(.12,1-p.retireAge/3.4);p.retiring=false;p.retireAge=0;}
      for(let index=target;index<blocks.length;index++){if(!blocks[index].retiring){blocks[index].retiring=true;blocks[index].retireAge=0;blocks[index].delay=0;}}
      while(blocks.length<target)blocks.push(createParticle(width,height,blocks.length,target));next=new Int32Array(blocks.length);canvas.dataset.particles=String(blocks.length);canvas.dataset.desiredParticles=String(target);canvas.dataset.retiringParticles=String(blocks.filter(p=>p.retiring).length);canvas.dataset.baseParticles=String(counts.base);canvas.dataset.snowParticles=String(counts.snow);canvas.dataset.denseParticles=String(counts.dense);
    }
    function setMode(nextMode){
      nextMode=normalizeMode(nextMode);if(nextMode===activeMode)return;
      if(activeMode==='form')bakeFormationMotion();
      activeMode=nextMode;prefs.flowStyle=nextMode;persist();previous=null;ripples=[];lastRipplePoint=null;traces=[];lastTracePoint=null;formation=0;morphStep=0;solarOrbits=[];formationTargets=[];formationIndex=activeMode==='form'?0:-1;lastStir=performance.now();lastGesture=0;modeStartedAt=clock;handoffUntil=performance.now()+160;
      syncParticleCount();blocks.forEach(resetParticleForMode);if(formationIndex>=0&&width)assignFormation();updateModeUI();draw();
    }
    function assignFormation(){
      if(formationIndex<0)return;
      const coverBox=cover.getBoundingClientRect(),copyBottom=(cover.querySelector('.flow-copy')?.getBoundingClientRect().bottom||coverBox.top+height*.5)-coverBox.top,safeTop=Math.min(height*.82,Math.max(height*.54,copyBottom+(width<760?28:38)));
      const activeBlocks=blocks.filter(p=>!p.retiring);blocks.forEach(p=>{p.tx=p.ty=p.gx=p.gy=undefined;p.formFeature='';p.formShade='';p.solar=null;});
      const result=formationIndex===5?solarSystemFormation(activeBlocks.length,width,height,safeTop):{targets:formationPoints(formationIndex,activeBlocks.length,width,height,safeTop),orbits:[]};formationTargets=result.targets;solarOrbits=result.orbits||[];formationAssignedClock=clock;
      const minX=Math.min(...formationTargets.map(target=>target.x)),maxX=Math.max(...formationTargets.map(target=>target.x)),minY=Math.min(...formationTargets.map(target=>target.y)),maxY=Math.max(...formationTargets.map(target=>target.y));formationCenter=result.center||{x:(minX+maxX)/2,y:(minY+maxY)/2};
      activeBlocks.forEach((p,i)=>{const target=formationTargets[i];p.gx=p.x;p.gy=p.y;p.tx=target.x;p.ty=target.y;p.formFeature=target.feature||'';p.formShade=target.shade||'';p.solar=target.solar||null;});
      canvas.dataset.targetParticles=String(formationTargets.length);
      canvas.dataset.formationName=FORM_NAMES[formationIndex];
      canvas.dataset.formationTop=String(Math.round(safeTop));
      canvas.dataset.solarOrbits=String(solarOrbits.length);
      canvas.dataset.solarBodies=String(formationIndex===5?9:0);
    }
    function colors(){
      if(disposed||!root.isConnected)return;
      const color=getComputedStyle(cover).backgroundColor;
      pixelContext.fillStyle=color;pixelContext.fillRect(0,0,1,1);
      const rgb=pixelContext.getImageData(0,0,1,1).data;
      const linear=[...rgb].slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
      const luminance=linear[0]*.2126+linear[1]*.7152+linear[2]*.0722,light=luminance<.3;
      ink=light?'#f5f7ff':'#26354b';tone=light?'#c7d4ff':'#66758c';detailInk=light?'#142154':'#f7fbff';
      document.body.style.setProperty('--flow-ink',ink);
      cover.style.setProperty('--flow-ink',ink);
      if(reduce.matches||modalOpen)draw();
    }
    function resize(){
      if(disposed)return;
      const r=cover.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height),ratio=Math.min(devicePixelRatio||1,2,Math.sqrt(4800000/(w*h)));
      if(w===width&&h===height&&ratio===dpr)return;
      const oldWidth=width,oldHeight=height;width=w;height=h;dpr=ratio;canvas.width=frontCanvas.width=Math.round(w*dpr);canvas.height=frontCanvas.height=Math.round(h*dpr);
      field=new FlowField(w,h);hashCols=Math.ceil(w/cell)+1;head=new Int32Array(hashCols*(Math.ceil(h/cell)+1));
      if(blocks.length&&oldWidth&&oldHeight)blocks.forEach(p=>{p.x=p.x/oldWidth*w;p.y=p.y/oldHeight*h;p.vx*=.5;p.vy*=.5;});
      syncParticleCount();
      if(inherited?.length){blocks.forEach((p,i)=>{if(i<inherited.length){const source=inherited[i];p.x=clamp(source.x*w,p.r,w-p.r);p.y=clamp(source.y*h,p.r,h-p.r);p.vx=source.vx||0;p.vy=source.vy||0;p.angle=source.angle||0;p.spin=source.spin||0;p.tilt=source.tilt||0;p.kind=source.kind??p.kind;p.tone=source.tone??p.tone;p.depth=source.depth??p.depth;p.snowLayer=source.snowLayer??p.snowLayer;p.fluidDepth=source.fluidDepth??p.fluidDepth;}resetParticleForMode(p,i);});inherited=null;}
      else blocks.forEach((p,i)=>{if(p.justCreated)resetParticleForMode(p,i);});
      if(formationIndex>=0)assignFormation();
      canvas.dataset.formation=formation.toFixed(3);previous=null;colors();updateModeUI();draw();
    }
    function contacts(){
      head.fill(-1);
      for(let i=0;i<blocks.length;i++){
        const a=blocks[i],cx=clamp(Math.floor(a.x/cell),0,hashCols-1),cy=clamp(Math.floor(a.y/cell),0,Math.floor((head.length-1)/hashCols));
        for(let yy=Math.max(0,cy-1);yy<=cy+1;yy++)for(let xx=Math.max(0,cx-1);xx<=Math.min(hashCols-1,cx+1);xx++){
          const bucket=yy*hashCols+xx;if(bucket>=head.length)continue;
          for(let j=head[bucket];j!==-1;j=next[j]){
            const b=blocks[j];if(a.retiring||b.retiring)continue;const dx=b.x-a.x,dy=b.y-a.y,formedPair=Number.isFinite(a.tx)&&Number.isFinite(b.tx),spacing=formedPair?1-formation*.56:1,min=(a.r+b.r)*(activeMode==='snow'?.72:.92)*spacing,sq=dx*dx+dy*dy;if(sq>=min*min)continue;
            if(activeMode==='snow'&&a.sleeping&&b.sleeping)continue;
            const distance=Math.sqrt(sq)||.01,nx=sq?dx/distance:1,ny=sq?dy/distance:0,overlap=(min-distance)*.52,mobileA=activeMode==='snow'&&a.sleeping?0:1,mobileB=activeMode==='snow'&&b.sleeping?0:1,mobility=mobileA+mobileB||1,massShare=b.m/(a.m+b.m),shareA=activeMode==='snow'?mobileA/mobility:massShare,shareB=activeMode==='snow'?mobileB/mobility:1-massShare;
            a.x-=nx*overlap*shareA;a.y-=ny*overlap*shareA;b.x+=nx*overlap*shareB;b.y+=ny*overlap*shareB;
            const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
            if(relative<0){const impulse=-relative*.64;if(mobileA){a.vx-=impulse*nx*shareA;a.vy-=impulse*ny*shareA;}if(mobileB){b.vx+=impulse*nx*shareB;b.vy+=impulse*ny*shareB;}const twist=clamp(((b.vx-a.vx)*ny-(b.vy-a.vy)*nx)*.006,-.4,.4);if(mobileA)a.spin+=twist;if(mobileB)b.spin-=twist;}
          }
        }
        const bucket=cy*hashCols+cx;next[i]=head[bucket];head[bucket]=i;
      }
    }
    function orbitPosition(orbit,angle){const ex=Math.cos(angle)*orbit.rx,ey=Math.sin(angle)*orbit.ry,c=Math.cos(orbit.tilt),s=Math.sin(orbit.tilt);return{x:orbit.centerX+ex*c-ey*s,y:orbit.centerY+ex*s+ey*c};}
    function motionAmount(){return clamp((formation-.56)/.44,0,1);}
    function displayPosition(p,index){
      const amount=motionAmount();if(!amount||!Number.isFinite(p.tx))return{x:p.x,y:p.y};
      const elapsed=Math.max(0,clock-formationAssignedClock),floatX=Math.sin(clock*.31+formationIndex*.9)*3.2*amount,floatY=Math.cos(clock*.27+formationIndex*.7)*2.1*amount;
      if(formationIndex===5&&p.solar){
        let desiredX,desiredY;if(p.solar.body<0){const angle=elapsed*.105*amount,c=Math.cos(angle),s=Math.sin(angle);desiredX=formationCenter.x+p.solar.localX*c-p.solar.localY*s;desiredY=formationCenter.y+p.solar.localX*s+p.solar.localY*c;}else{const orbit=solarOrbits[p.solar.orbitIndex],angle=orbit.phase+elapsed*orbit.speed*amount,center=orbitPosition(orbit,angle),spin=elapsed*.065*(p.solar.body%2?-1:1)*amount,c=Math.cos(spin),s=Math.sin(spin);desiredX=center.x+p.solar.localX*c-p.solar.localY*s;desiredY=center.y+p.solar.localX*s+p.solar.localY*c;}
        return{x:p.x+(desiredX-p.tx)+floatX,y:p.y+(desiredY-p.ty)+floatY};
      }
      const rotating=formationIndex===3||formationIndex===4,angle=rotating?elapsed*(formationIndex===3?.085:.052)*amount:Math.sin(clock*.29+formationIndex)*.016*amount,c=Math.cos(angle),s=Math.sin(angle),dx=p.tx-formationCenter.x,dy=p.ty-formationCenter.y;
      return{x:p.x+(dx*c-dy*s+formationCenter.x-p.tx)+floatX+Math.sin(clock*.43+index*.19)*.65*amount,y:p.y+(dx*s+dy*c+formationCenter.y-p.ty)+floatY+Math.cos(clock*.37+index*.13)*.45*amount};
    }
    function bakeFormationMotion(){if(formation<=.35)return;const positions=blocks.map(displayPosition);blocks.forEach((p,index)=>{p.x=positions[index].x;p.y=positions[index].y;p.renderX=p.x;p.renderY=p.y;});}
    function formationHit(ax,ay,bx,by){
      if(activeMode!=='form'||formation<.98)return false;const dx=bx-ax,dy=by-ay,lengthSquared=dx*dx+dy*dy;
      for(let index=0;index<blocks.length;index++){const p=blocks[index];if(p.retiring||!Number.isFinite(p.tx))continue;const position=Number.isFinite(p.renderX)?{x:p.renderX,y:p.renderY}:displayPosition(p,index),t=lengthSquared?clamp(((position.x-ax)*dx+(position.y-ay)*dy)/lengthSquared,0,1):0,px=ax+dx*t,py=ay+dy*t,radius=Math.max(16,p.r*2.4);if((position.x-px)**2+(position.y-py)**2<=radius*radius)return true;}
      return false;
    }
    function beginCycle(now){
      if(activeMode!=='form'||formation<.98)return false;
      if(now-lastGesture>700){
        bakeFormationMotion();
        formationIndex=(formationIndex+1)%FORM_NAMES.length;
        assignFormation();
        cover.dataset.nextForm=FORM_NAMES[formationIndex];
      }else return false;
      lastGesture=lastStir=now;formation=0;morphStep=0;canvas.dataset.formation='0';cover.dataset.flowState='chaos';
      cover.dataset.formLocked='false';return true;
    }
    function updateFormation(now){
      if(activeMode!=='form'){formation=0;morphStep=0;canvas.dataset.formation='0';cover.dataset.flowState=activeMode;return;}
      const elapsed=formationIndex<0?0:now-lastStir,linear=clamp((elapsed-FORM_START)/(FORM_END-FORM_START),0,1),next=linear*linear*(3-2*linear);
      morphStep=next>=1?1:clamp((next-formation)/Math.max(.0001,1-formation),0,1);formation=next;
      canvas.dataset.formation=formation.toFixed(3);
      cover.dataset.flowState=elapsed<FORM_START?'chaos':formation>=1?'formed':'forming';
      cover.dataset.formLocked=String(formation>=1);
    }
    let snowColumns=[];
    function snowGround(p){
      let ground=height-p.r;
      const column=Math.floor(p.x/cell);
      for(let i=Math.max(0,column-1);i<=Math.min(snowColumns.length-1,column+1);i++)for(const support of snowColumns[i]){
        if(support===p||!support.sleeping||support.y<=p.y+.5)continue;
        const distance=(p.r+support.r)*.72,dx=p.x-support.x;
        if(Math.abs(dx)<distance)ground=Math.min(ground,support.y-Math.sqrt(distance*distance-dx*dx));
      }
      return ground;
    }
    function respawnSnow(p){p.y=-18-rand()*height*.28;p.x=clamp((p.snowLane??rand())*width+(rand()-.5)*width*.045,p.r,width-p.r);p.vx=(rand()-.5)*13;p.vy=24+rand()*42;p.rest=0;p.sleep=0;p.sleeping=false;p.snowLayer=Math.pow(rand(),1.18);p.life=18+rand()*45;p.delay=.25+rand()*1.55;}
    function simulateSnow(dt,resolveContacts=true){
      clock+=dt;field.step(dt);
      let highest=height;
      snowColumns=Array.from({length:Math.ceil(width/cell)+1},()=>[]);
      for(const p of blocks)if(p.sleeping&&!p.retiring)snowColumns[clamp(Math.floor(p.x/cell),0,snowColumns.length-1)].push(p);
      for(const p of blocks){
        if(p.retiring){p.vx*=1-dt*1.4;p.vy*=1-dt*1.4;p.angle+=p.spin*dt*.25;continue;}
        const ground=snowGround(p);highest=Math.min(highest,ground);
        if(p.delay>0){p.delay=Math.max(0,p.delay-dt);continue;}
        if(p.sleeping){p.rest+=dt;if(p.rest>p.life){respawnSnow(p);continue;}if(ground>p.y+1){p.sleeping=false;p.sleep=0;p.vy=0;}else{p.y=ground;continue;}}
        const x=p.x/field.dx+1,y=p.y/field.dy+1,currentX=field.sample(field.u,x,y),currentY=field.sample(field.v,x,y),curl=field.sample(field.curl,x,y),drag=1-Math.exp(-dt*1.8/p.m),flutter=Math.sin(clock*.8+p.y*.012+p.snowLayer*13);
        p.vx+=(currentX+flutter*9-p.vx)*drag;p.vy+=(currentY+32+Math.cos(clock*.45+p.x*.008)*8-p.vy)*drag+38*p.m*dt;
        p.vx=clamp(p.vx,-800,800);p.vy=clamp(p.vy,-680,720);p.x+=p.vx*dt;p.y+=p.vy*dt;p.spin=clamp(p.spin+(curl*.65-p.spin)*Math.min(1,dt),-8,8);p.angle+=p.spin*dt;p.tilt+=(p.spin*.34+p.vx*.002)*dt;
        if(p.x<p.r){p.x=p.r;p.vx=Math.abs(p.vx)*.3;}if(p.x>width-p.r){p.x=width-p.r;p.vx=-Math.abs(p.vx)*.3;}
        if(p.y>=ground){p.y=ground;p.vy=0;p.vx*=.78;p.spin*=.55;p.sleep+=dt;if(p.sleep>.12){p.sleeping=true;p.rest=0;snowColumns[clamp(Math.floor(p.x/cell),0,snowColumns.length-1)].push(p);}}
      }
      if(resolveContacts)contacts();const settled=blocks.filter(p=>p.sleeping),settledTop=settled.length?Math.min(...settled.map(p=>p.y-p.r)):height;canvas.dataset.snowTargetDepth=String(Math.round(height-highest));canvas.dataset.snowMaxDepth=String(Math.round(height*.34));canvas.dataset.snowDepth=String(Math.round(height-settledTop));canvas.dataset.snowSettled=String(settled.length);canvas.dataset.snowMelting=String(settled.filter(p=>p.life-p.rest<3).length);
    }
    function tideTarget(p,index){if((p.depth??0)>.95)return height*(.18+(p.fluidDepth??.5)*.36)+Math.sin(p.x*.009+clock*.55)*15;const surface=height*.63+Math.sin(p.x*.008+clock*.75)*18+Math.sin(p.x*.0027-clock*.42)*24;return surface+(height-surface-p.r)*(p.fluidDepth??((index*.618)%1));}
    function simulateTide(dt,resolveContacts=true){
      clock+=dt;field.step(dt);
      for(let index=0;index<blocks.length;index++){
        const p=blocks[index];if(p.retiring){p.vx*=1-dt*1.4;p.vy*=1-dt*1.4;p.angle+=p.spin*dt*.25;continue;}if(p.delay>0){p.delay=Math.max(0,p.delay-dt);continue;}p.sleeping=false;const x=p.x/field.dx+1,y=p.y/field.dy+1,currentX=field.sample(field.u,x,y),currentY=field.sample(field.v,x,y),curl=field.sample(field.curl,x,y),targetY=tideTarget(p,index),drag=1-Math.exp(-dt*2.85/p.m);
        const laneX=(p.snowLane??((index+.5)/blocks.length))*width,ambientX=(laneX-p.x)*.85+Math.sin(clock*.76+p.y*.01+p.fluidDepth*9)*58+Math.cos(clock*.34+p.x*.004)*26,ambientY=(targetY-p.y)*4.6+72+Math.sin(clock*1.05+p.x*.011)*36;
        p.vx+=(currentX+ambientX-p.vx)*drag;p.vy+=(currentY+ambientY-p.vy)*drag+88*p.m*dt;
        p.vx=clamp(p.vx,-1250,1250);p.vy=clamp(p.vy,-1180,1250);p.x+=p.vx*dt;p.y+=p.vy*dt;p.spin=clamp(p.spin+(curl*1.18+p.vx*.0035-p.spin)*Math.min(1,dt*1.55),-15,15);p.angle+=p.spin*dt;p.tilt+=(p.spin*.48+p.vx*.0028)*dt;
        if(p.x<p.r){p.x=p.r;p.vx=Math.abs(p.vx)*.38;}if(p.x>width-p.r){p.x=width-p.r;p.vx=-Math.abs(p.vx)*.38;}if(p.y<p.r){p.y=p.r;p.vy=Math.abs(p.vy)*.26;}if(p.y>height-p.r){p.y=height-p.r;p.vy=-Math.abs(p.vy)*.18;}
      }
      if(resolveContacts)contacts();for(const ripple of ripples)ripple.age+=dt;ripples=ripples.filter(ripple=>ripple.age<1.25);canvas.dataset.tideLevel=String(Math.round(height*.63));canvas.dataset.ripples=String(ripples.length);canvas.dataset.rippleLayers='2';
    }
    function simulate(dt,resolveContacts=true){
      if(activeMode==='snow'){simulateSnow(dt,resolveContacts);return;}if(activeMode==='tide'){simulateTide(dt,resolveContacts);return;}
      clock+=dt;field.step(dt);
      for(const p of blocks){
        if(p.retiring){p.vx*=1-dt*1.4;p.vy*=1-dt*1.4;p.angle+=p.spin*dt*.25;continue;}
        const x=p.x/field.dx+1,y=p.y/field.dy+1;
        const freedom=1-formation*.9,currentX=field.sample(field.u,x,y),currentY=field.sample(field.v,x,y),curl=field.sample(field.curl,x,y),drag=1-Math.exp(-dt*3.5/p.m),chaos=activeMode==='chaos',entropy=chaos?clamp(clock/70,0,1):0;
        if(chaos&&clock>p.roamUntil){p.roamX=rand();p.roamY=rand();p.roamUntil=clock+9+rand()*20;}
        const edgeX=chaos?(p.x<width*.12?(1-p.x/(width*.12))*25:p.x>width*.88?-(p.x-width*.88)/(width*.12)*25:0):0,edgeY=chaos?(p.y<height*.12?(1-p.y/(height*.12))*28:p.y>height*.82?-(p.y-height*.82)/(height*.18)*34:0):0;
        const roamX=chaos?clamp(((p.roamX??.5)*width-p.x)*.018,-20,20):0,roamY=chaos?clamp(((p.roamY??.5)*height-p.y)*.018,-20,20):0;
        const idleX=chaos?(Math.sin(p.wanderA+clock*(.11+entropy*.09))+Math.cos(p.wanderB-clock*.073))*(8+entropy*7)+edgeX+roamX:Math.sin(p.y/height*6+clock*.12)*7,idleY=chaos?(Math.cos(p.wanderB+clock*(.095+entropy*.07))+Math.sin(p.wanderA+clock*.061))*(8+entropy*6)+edgeY+roamY:-Math.cos(p.x/width*6.28+clock*.05)*8;
        p.vx+=(currentX+idleX-p.vx)*drag*freedom;p.vy+=(currentY+idleY-p.vy)*drag*freedom+(chaos?0:16*p.m*dt*freedom);
        const ex=(p.x-width*.5)/(width*.31),ey=(p.y-height*.4)/(height*.22),q=ex*ex+ey*ey;
        if(q<1&&Math.hypot(currentX,currentY)<35){p.vx+=ex*(1-q)*24*dt*freedom;p.vy+=ey*(1-q)*24*dt*freedom;}
        p.vx=clamp(p.vx,-650,650);p.vy=clamp(p.vy,-650,650);p.x+=p.vx*dt;p.y+=p.vy*dt;
        p.spin=clamp(p.spin+(curl*1.4-p.spin)*Math.min(1,dt*2),-9,9);p.angle+=p.spin*dt;p.tilt+=(p.spin*.38+p.vx*.002)*dt;
        if(p.x<p.r){p.x=p.r;p.vx=Math.abs(p.vx)*.35;}if(p.x>width-p.r){p.x=width-p.r;p.vx=-Math.abs(p.vx)*.35;}
        if(p.y<p.r){p.y=p.r;p.vy=Math.abs(p.vy)*.3;}if(p.y>height-p.r){p.y=height-p.r;p.vy=-Math.abs(p.vy)*.25;p.vx*=.98;}
      }
      contacts();
    }
    function updateParticleTransitions(dt){
      let remove=false;
      for(const p of blocks){
        if(p.retiring){p.retireAge=(p.retireAge||0)+dt;if(p.retireAge>=3.4)remove=true;}
        else if((p.delay||0)<=0)p.birth=Math.min(1,(p.birth??1)+dt*.72);
      }
      if(remove){blocks=blocks.filter(p=>!p.retiring||p.retireAge<3.4);next=new Int32Array(blocks.length);}
      canvas.dataset.particles=String(blocks.length);canvas.dataset.retiringParticles=String(blocks.filter(p=>p.retiring).length);
    }
    function morph(){
      if(activeMode!=='form'||!formation||formationIndex<0)return;
      for(const p of blocks){
        if(!Number.isFinite(p.tx))continue;
        if(formation>=1){p.x=p.tx;p.y=p.ty;p.vx=p.vy=p.spin=0;continue;}
        p.x+=(p.tx-p.x)*morphStep;p.y+=(p.ty-p.y)*morphStep;
        const damping=1-morphStep*.82;p.vx*=damping;p.vy*=damping;p.spin*=damping;
      }
    }
    function drawTide(){
      if(activeMode!=='tide')return;ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.lineCap='round';ctx.lineJoin='round';
      const surface=height*.63;for(let layer=0;layer<3;layer++){ctx.beginPath();for(let x=0;x<=width+18;x+=18){const y=surface+layer*24+Math.sin(x*.008+clock*(.72-layer*.08))*16+Math.sin(x*.0029-clock*.38+layer)*20;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle=tone;ctx.globalAlpha=.12-layer*.025;ctx.lineWidth=.7;ctx.stroke();}
      for(const ripple of ripples){
        const progress=clamp(ripple.age/1.25,0,1),outerRadius=ripple.radius+progress*(54+18*ripple.power),outerAlpha=(1-progress)**1.7*.34*ripple.power;
        ctx.globalAlpha=outerAlpha;ctx.beginPath();ctx.arc(ripple.x,ripple.y,outerRadius,0,Math.PI*2);ctx.strokeStyle=tone;ctx.lineWidth=.8;ctx.stroke();
        const innerProgress=clamp((ripple.age-.12)/1.02,0,1);if(innerProgress>0){ctx.globalAlpha=(1-innerProgress)**1.8*.27*ripple.power;ctx.beginPath();ctx.arc(ripple.x,ripple.y,ripple.radius*.55+innerProgress*(37+13*ripple.power),0,Math.PI*2);ctx.strokeStyle=ink;ctx.lineWidth=.65;ctx.stroke();}
        const dotAlpha=clamp(1-ripple.age/.3,0,1)*.72*ripple.power;if(dotAlpha>0){ctx.globalAlpha=dotAlpha;ctx.beginPath();ctx.arc(ripple.x,ripple.y,2.2+1.2*(1-progress),0,Math.PI*2);ctx.fillStyle=ink;ctx.fill();}
      }
      ctx.restore();ctx.globalAlpha=1;
    }
    function updateTraces(dt){
      for(const trace of traces){
        trace.age+=dt;trace.angle+=trace.spin*dt;
        if(trace.mode==='snow'){trace.x+=trace.driftX*dt;trace.y+=(trace.driftY+trace.age*34)*dt;}
        else{trace.x+=trace.driftX*dt;trace.y+=trace.driftY*dt;}
      }
      traces=traces.filter(trace=>trace.age<(trace.mode==='snow'?1.18:.92));canvas.dataset.traces=String(traces.length);
    }
    function drawFormationGlyph(index,size){
      ctx.strokeStyle=ink;ctx.fillStyle=tone;ctx.lineWidth=.72;
      if(index===0){
        ctx.fillRect(-size*.68,-size*.08,size*1.36,size*.7);for(const x of [-.54,0,.54]){ctx.fillRect((x-.18)*size,-size*.5,size*.36,size*.62);ctx.fillRect((x-.2)*size,-size*.66,size*.13,size*.2);ctx.fillRect((x+.07)*size,-size*.66,size*.13,size*.2);}
      }else if(index===1){
        ctx.beginPath();ctx.moveTo(-size*.82,size*.08);ctx.quadraticCurveTo(-size*.12,-size*.48,size*.74,-size*.04);ctx.lineTo(size,size*.12);ctx.lineTo(size*.69,size*.2);ctx.quadraticCurveTo(-size*.16,size*.56,-size*.82,size*.18);ctx.lineTo(-size*1.08,size*.52);ctx.lineTo(-size*.98,size*.08);ctx.lineTo(-size*1.08,-size*.42);ctx.closePath();ctx.fill();ctx.fillStyle=detailInk;ctx.beginPath();ctx.arc(size*.5,-size*.06,size*.07,0,Math.PI*2);ctx.fill();
      }else if(index===2){
        ctx.beginPath();ctx.moveTo(-size*.92,size*.32);ctx.lineTo(-size*.72,-size*.12);ctx.lineTo(-size*.26,-size*.42);ctx.lineTo(size*.34,-size*.42);ctx.lineTo(size*.7,-size*.08);ctx.lineTo(size*.92,size*.02);ctx.lineTo(size*.92,size*.38);ctx.closePath();ctx.fill();ctx.fillStyle=detailInk;for(const x of [-.55,.58]){ctx.beginPath();ctx.arc(x*size,size*.39,size*.19,0,Math.PI*2);ctx.fill();}ctx.strokeStyle=detailInk;ctx.beginPath();ctx.moveTo(-size*.2,-size*.34);ctx.lineTo(-size*.31,-size*.06);ctx.lineTo(size*.45,-size*.06);ctx.lineTo(size*.25,-size*.34);ctx.stroke();
      }else if(index===3){
        ctx.beginPath();ctx.arc(0,0,size*.76,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(-size*.56,-size*.26);ctx.quadraticCurveTo(-size*.12,-size*.55,size*.2,-size*.24);ctx.quadraticCurveTo(size*.5,-size*.05,size*.54,size*.28);ctx.moveTo(-size*.7,size*.12);ctx.quadraticCurveTo(-size*.24,size*.02,-size*.14,size*.55);ctx.stroke();
      }else if(index===4){
        for(const direction of [-1,1]){ctx.beginPath();for(let step=0;step<18;step++){const angle=direction*(step*.43),radius=size*(.07+step*.045),x=Math.cos(angle)*radius,y=Math.sin(angle)*radius*.48;step?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}ctx.beginPath();ctx.arc(0,0,size*.15,0,Math.PI*2);ctx.fill();
      }else if(index===5){
        ctx.beginPath();ctx.arc(0,0,size*.2,0,Math.PI*2);ctx.fill();for(const [rx,ry] of [[.45,.16],[.72,.28],[.98,.4]]){ctx.beginPath();ctx.ellipse(0,0,size*rx,size*ry,-.18,0,Math.PI*2);ctx.stroke();}ctx.beginPath();ctx.arc(size*.58,-size*.15,size*.1,0,Math.PI*2);ctx.fill();
      }else if(index===6){
        ctx.beginPath();ctx.moveTo(0,size*.12);ctx.lineTo(0,size*.9);ctx.moveTo(0,size*.55);ctx.quadraticCurveTo(-size*.48,size*.38,-size*.53,size*.67);ctx.moveTo(0,size*.66);ctx.quadraticCurveTo(size*.46,size*.47,size*.5,size*.72);ctx.stroke();for(let petal=0;petal<5;petal++){const angle=petal*Math.PI*2/5-Math.PI/2;ctx.beginPath();ctx.ellipse(Math.cos(angle)*size*.25,Math.sin(angle)*size*.25,size*.28,size*.17,angle,0,Math.PI*2);ctx.fill();}ctx.fillStyle=detailInk;ctx.beginPath();ctx.arc(0,0,size*.15,0,Math.PI*2);ctx.fill();
      }else if(index===7){
        ctx.beginPath();ctx.ellipse(-size*.12,0,size*.58,size*.3,-.05,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(size*.25,-size*.14);ctx.quadraticCurveTo(size*.38,-size*.62,size*.67,-size*.66);ctx.lineTo(size*.92,-size*.48);ctx.lineTo(size*.67,-size*.3);ctx.lineTo(size*.48,size*.1);ctx.closePath();ctx.fill();ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-size*.48,size*.12);ctx.lineTo(-size*.78,size*.66);ctx.lineTo(-size*1.02,size*.54);ctx.moveTo(-size*.06,size*.2);ctx.lineTo(size*.18,size*.7);ctx.lineTo(size*.5,size*.7);ctx.moveTo(size*.24,size*.14);ctx.lineTo(size*.67,size*.54);ctx.lineTo(size*.98,size*.43);ctx.stroke();ctx.beginPath();ctx.moveTo(-size*.62,-size*.06);ctx.quadraticCurveTo(-size*1.02,-size*.46,-size*1.08,-size*.02);ctx.stroke();
      }else if(index===8){
        ctx.beginPath();ctx.moveTo(-size,-size*.05);ctx.quadraticCurveTo(-size*.5,-size*.72,0,-size*.08);ctx.quadraticCurveTo(size*.5,-size*.72,size,-size*.05);ctx.quadraticCurveTo(size*.46,-size*.34,0,size*.28);ctx.quadraticCurveTo(-size*.48,-size*.32,-size,-size*.05);ctx.fill();
      }else if(index===9){
        ctx.beginPath();ctx.moveTo(0,-size*.9);ctx.lineTo(0,size*.4);ctx.stroke();ctx.beginPath();ctx.moveTo(-size*.06,-size*.82);ctx.lineTo(-size*.82,size*.2);ctx.lineTo(-size*.06,size*.2);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(size*.08,-size*.55);ctx.lineTo(size*.74,size*.24);ctx.lineTo(size*.08,size*.24);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(-size,size*.3);ctx.quadraticCurveTo(0,size*.72,size,size*.3);ctx.lineTo(size*.68,size*.72);ctx.lineTo(-size*.62,size*.72);ctx.closePath();ctx.fill();
      }else if(index===10){
        ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(-size*.65,size*.82);ctx.moveTo(0,-size);ctx.lineTo(size*.65,size*.82);ctx.moveTo(-size*.45,size*.25);ctx.lineTo(size*.45,size*.25);ctx.moveTo(-size*.62,size*.7);ctx.lineTo(size*.62,size*.7);ctx.moveTo(-size*.65,size*.82);ctx.quadraticCurveTo(0,size*.22,size*.65,size*.82);ctx.stroke();
      }else if(index===11){
        ctx.beginPath();ctx.moveTo(-size,-size*.06);ctx.lineTo(-size*.28,-size*.08);ctx.lineTo(-size*.02,-size*.72);ctx.lineTo(size*.2,-size*.72);ctx.lineTo(size*.11,-size*.08);ctx.lineTo(size*.92,-size*.03);ctx.lineTo(size,0);ctx.lineTo(size*.92,size*.08);ctx.lineTo(size*.11,size*.1);ctx.lineTo(size*.2,size*.7);ctx.lineTo(-size*.02,size*.7);ctx.lineTo(-size*.28,size*.1);ctx.lineTo(-size,size*.08);ctx.closePath();ctx.fill();
      }else if(index===12){
        ctx.fillRect(-size*.9,size*.72,size*1.8,size*.12);ctx.fillRect(-size*.78,-size*.18,size*.34,size*.9);ctx.fillRect(-size*.2,-size*.55,size*.42,size*1.27);ctx.beginPath();ctx.moveTo(size*.43,size*.72);ctx.quadraticCurveTo(size*.28,-size*.15,size*.64,-size*.9);ctx.quadraticCurveTo(size*.95,-size*.1,size*.9,size*.72);ctx.closePath();ctx.fill();
      }else if(index===13){
        ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(0,size);ctx.stroke();for(const [y,r] of [[-.5,.22],[0,.34],[.46,.16]]){ctx.beginPath();ctx.arc(0,size*y,size*r,0,Math.PI*2);ctx.fill();}ctx.beginPath();ctx.moveTo(-size*.1,size*.5);ctx.lineTo(-size*.5,size);ctx.moveTo(size*.1,size*.5);ctx.lineTo(size*.5,size);ctx.stroke();
      }else if(index===14){
        ctx.beginPath();ctx.moveTo(-size,size*.72);ctx.lineTo(0,-size*.82);ctx.lineTo(size,size*.72);ctx.closePath();ctx.fill();ctx.strokeStyle=detailInk;for(let y=-.35;y<.65;y+=.3){ctx.beginPath();ctx.moveTo((-y*.4-.65)*size,y*size);ctx.lineTo((y*.4+.65)*size,y*size);ctx.stroke();}
      }else{
        ctx.beginPath();ctx.moveTo(0,-size*.35);ctx.quadraticCurveTo(size*.08,size*.35,0,size);ctx.stroke();for(let spoke=0;spoke<14;spoke++){const angle=spoke*Math.PI*2/14,r=size*.55,x=Math.cos(angle)*r,y=-size*.36+Math.sin(angle)*r;ctx.beginPath();ctx.moveTo(0,-size*.36);ctx.lineTo(x,y);ctx.stroke();ctx.beginPath();ctx.arc(x,y,size*.045,0,Math.PI*2);ctx.fill();}
      }
    }
    function drawModeTraces(){
      if(!traces.length)return;ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.lineCap='round';ctx.lineJoin='round';
      for(const trace of traces){
        const life=trace.mode==='snow'?1.18:.92,progress=clamp(trace.age/life,0,1),alpha=(1-progress)**1.7;ctx.save();ctx.translate(trace.x,trace.y);if(trace.mode!=='form')ctx.rotate(trace.angle);
        if(trace.mode==='chaos'){
          ctx.globalAlpha=alpha*.42;ctx.fillStyle=tone;
          for(let part=0;part<4;part++){const angle=part*Math.PI*.5+trace.seed,radius=3+progress*(9+part*1.8),x=Math.cos(angle)*radius,y=Math.sin(angle)*radius,size=part%2?1.35:1.8;part%2?ctx.fillRect(x-size*.5,y-size*.5,size,size):(ctx.beginPath(),ctx.arc(x,y,size*.55,0,Math.PI*2),ctx.fill());}
        }else if(trace.mode==='form'){
          ctx.globalAlpha=alpha*.5;drawFormationGlyph(trace.formIndex,10-progress*2.8);
        }else if(trace.mode==='snow'){
          const size=4.5+progress*2.8;ctx.globalAlpha=alpha*.5;ctx.strokeStyle=tone;ctx.lineWidth=.7;
          for(let arm=0;arm<3;arm++){ctx.save();ctx.rotate(arm*Math.PI/3);ctx.beginPath();ctx.moveTo(-size,0);ctx.lineTo(size,0);ctx.moveTo(size*.48,0);ctx.lineTo(size*.72,-size*.25);ctx.moveTo(-size*.48,0);ctx.lineTo(-size*.72,size*.25);ctx.stroke();ctx.restore();}
        }
        ctx.restore();
      }
      ctx.restore();ctx.globalAlpha=1;
    }
    function draw(){
      if(disposed||!width)return;
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);frontCtx.setTransform(dpr,0,0,dpr,0,0);frontCtx.clearRect(0,0,width,height);
      if(formation>.05){
        const ghostAlpha=.055*Math.min(1,formation*1.8),stride=Math.max(4,Math.round(blocks.length/90));
        for(let i=0;i<blocks.length;i+=stride){const p=blocks[i];if(!Number.isFinite(p.gx))continue;const angle=p.angle*.35,c=Math.cos(angle),s=Math.sin(angle),size=p.r*.72,x=p.gx+Math.sin(clock*.22+i)*5,y=p.gy+Math.cos(clock*.18+i*.7)*4;ctx.setTransform(dpr*c*size,dpr*s*size,-dpr*s*size,dpr*c*size,dpr*x,dpr*y);ctx.globalAlpha=ghostAlpha;ctx.fillStyle=p.tone?tone:ink;ctx.fill(shapes[p.kind]);if((p.depth??0)>.74){frontCtx.setTransform(dpr*c*size,dpr*s*size,-dpr*s*size,dpr*c*size,dpr*x,dpr*y);frontCtx.globalAlpha=ghostAlpha*.68;frontCtx.fillStyle=p.tone?tone:ink;frontCtx.fill(shapes[p.kind]);}}
      }
      if(formationIndex===5&&solarOrbits.length&&formation>.3){const amount=motionAmount(),elapsed=Math.max(0,clock-formationAssignedClock),floatX=Math.sin(clock*.31+formationIndex*.9)*3.2*amount,floatY=Math.cos(clock*.27+formationIndex*.7)*2.1*amount;ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.strokeStyle=tone;ctx.lineWidth=.58;ctx.globalAlpha=.25*clamp((formation-.3)/.45,0,1);for(const orbit of solarOrbits){ctx.beginPath();ctx.ellipse(orbit.centerX+floatX,orbit.centerY+floatY,orbit.rx,orbit.ry,orbit.tilt,0,Math.PI*2);ctx.stroke();}const saturn=solarOrbits[5],saturnCenter=orbitPosition(saturn,saturn.phase+elapsed*saturn.speed*amount);ctx.globalAlpha=.42*clamp((formation-.45)/.4,0,1);ctx.lineWidth=.72;ctx.beginPath();ctx.ellipse(saturnCenter.x+floatX,saturnCenter.y+floatY,saturn.planetRadius*1.7,saturn.planetRadius*.55,saturn.tilt-.18,0,Math.PI*2);ctx.stroke();ctx.restore();}
      for(let index=0;index<blocks.length;index++){
        const p=blocks[index],position=displayPosition(p,index);p.renderX=position.x;p.renderY=position.y;
        const c=Math.cos(p.angle),s=Math.sin(p.angle),shaped=Number.isFinite(p.tx),formScale=shaped?1-formation*.48:1,retireScale=p.retiring?1-clamp((p.retireAge||0)/3.4,0,1)*.72:1,sx=p.r*(.73+.27*Math.abs(Math.cos(p.tilt)))*formScale*retireScale,sy=p.r*formScale*retireScale;
        ctx.setTransform(dpr*c*sx,dpr*s*sx,-dpr*s*sy,dpr*c*sy,dpr*position.x,dpr*position.y);
        const presence=shaped?1:1-formation*.72,meltAlpha=activeMode==='snow'&&p.sleeping?clamp((p.life-p.rest)/3,0,1):1,transitionAlpha=(p.birth??1)*(p.retiring?1-clamp((p.retireAge||0)/3.4,0,1):1);
        const formLight=shaped&&formation>.18&&p.formShade==='light';ctx.globalAlpha=(formLight?.42:p.tone?.54:.9)*presence*meltAlpha*transitionAlpha;ctx.fillStyle=formLight||p.tone?tone:ink;ctx.fill(shapes[p.kind]);
        ctx.globalAlpha=.14*transitionAlpha;ctx.strokeStyle=ink;ctx.lineWidth=.09;ctx.stroke(shapes[p.kind]);
      }
      if(formation>.35)for(const p of blocks){
        if(!p.formFeature)continue;const eye=p.formFeature==='eye',angle=p.formFeature==='tooth'?Math.PI:0,size=p.r*(eye?1.5:1.12),c=Math.cos(angle),s=Math.sin(angle);
        ctx.setTransform(dpr*c*size,dpr*s*size,-dpr*s*size,dpr*c*size,dpr*(p.renderX??p.x),dpr*(p.renderY??p.y));ctx.globalAlpha=clamp((formation-.35)/.4,0,1);ctx.fillStyle=eye?detailInk:ink;ctx.fill(shapes[eye?0:2]);
      }
      let frontParticles=0;for(let index=0;index<blocks.length;index++){
        const p=blocks[index];if((p.depth??0)<.62)continue;frontParticles++;const position={x:p.renderX??p.x,y:p.renderY??p.y},c=Math.cos(p.angle),s=Math.sin(p.angle),shaped=Number.isFinite(p.tx),formScale=shaped?1-formation*.48:1,retireScale=p.retiring?1-clamp((p.retireAge||0)/3.4,0,1)*.72:1,sx=p.r*(.73+.27*Math.abs(Math.cos(p.tilt)))*formScale*retireScale,sy=p.r*formScale*retireScale,presence=shaped?1:1-formation*.72,meltAlpha=activeMode==='snow'&&p.sleeping?clamp((p.life-p.rest)/3,0,1):1,transitionAlpha=(p.birth??1)*(p.retiring?1-clamp((p.retireAge||0)/3.4,0,1):1),formLight=shaped&&formation>.18&&p.formShade==='light';
        frontCtx.setTransform(dpr*c*sx,dpr*s*sx,-dpr*s*sy,dpr*c*sy,dpr*position.x,dpr*position.y);frontCtx.globalAlpha=(formLight?.36:p.tone?.44:.74)*presence*meltAlpha*transitionAlpha;frontCtx.fillStyle=formLight||p.tone?tone:ink;frontCtx.fill(shapes[p.kind]);frontCtx.globalAlpha=.1*transitionAlpha;frontCtx.strokeStyle=ink;frontCtx.lineWidth=.08;frontCtx.stroke(shapes[p.kind]);
      }
      canvas.dataset.frontParticles=String(frontParticles);frontCtx.globalAlpha=1;frontCtx.setTransform(dpr,0,0,dpr,0,0);
      drawModeTraces();drawTide();
      ctx.globalAlpha=1;ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    function tick(now){
      frame=0;if(disposed||document.hidden||modalOpen||reduce.matches)return;
      const dt=last?Math.min((now-last)/1000,.034):1/60;last=now;
      if(now<handoffUntil){draw();frame=requestAnimationFrame(tick);return;}
      updateFormation(now,dt);
      if(activeMode==='snow'||activeMode==='tide'){simulate(dt/2,false);simulate(dt/2,true);}else{simulate(dt/2);simulate(dt/2);}updateParticleTransitions(dt);updateTraces(dt);morph();draw();frame=requestAnimationFrame(tick);
    }
    function run(){
      if(disposed)return;cancelAnimationFrame(frame);frame=0;last=0;previous=null;
      modalOpen=!!document.querySelector('dialog[open]');
      const active=!document.hidden&&!modalOpen&&!reduce.matches;canvas.dataset.active=String(active);
      if(active)frame=requestAnimationFrame(tick);else draw();
    }
    function inputAllowed(event){return !disposed&&!reduce.matches&&!document.hidden&&!modalOpen&&!event.target.closest('button,a,input,textarea,select,dialog,.dock,.header-right');}
    function dropRipple(x,y,power=1,now=performance.now(),force=false){
      if(activeMode!=='tide')return;const distance=lastRipplePoint?Math.hypot(x-lastRipplePoint.x,y-lastRipplePoint.y):Infinity;
      if(!force&&distance<52&&now-lastRipple<72)return;ripples.push({x,y,age:0,radius:4,power:clamp(power,.58,1)});ripples=ripples.slice(-32);lastRipple=now;lastRipplePoint={x,y};
    }
    function dropTrace(x,y,vx=0,vy=0,now=performance.now(),force=false){
      if(activeMode==='tide')return;const spacing=activeMode==='chaos'?34:activeMode==='form'?44:39,distance=lastTracePoint?Math.hypot(x-lastTracePoint.x,y-lastTracePoint.y):Infinity;
      if(!force&&distance<spacing&&now-lastTrace<58)return;traces.push({x,y,age:0,mode:activeMode,formIndex:formationIndex,angle:Math.atan2(vy,vx)+(rand()-.5)*.42,driftX:(rand()-.5)*(activeMode==='snow'?15:20),driftY:activeMode==='snow'?18+rand()*18:(rand()-.5)*11,spin:(rand()-.5)*(activeMode==='form'?1.2:2.4),seed:rand()*Math.PI*2});traces=traces.slice(-40);lastTrace=now;lastTracePoint={x,y};canvas.dataset.traces=String(traces.length);if(activeMode==='form')canvas.dataset.traceGlyph=FORM_NAMES[formationIndex];
    }
    function move(event){
      if(!inputAllowed(event)){previous=null;return;}
      const now=performance.now(),x=event.clientX,y=event.clientY;
      if(previous&&previous.id===event.pointerId){
         const dt=clamp((now-previous.time)/1000,.008,.05),dx=x-previous.x,dy=y-previous.y,distance=Math.hypot(dx,dy),steps=clamp(Math.ceil(distance/24),1,18),vx=clamp(dx/dt,-2200,2200),vy=clamp(dy/dt,-2200,2200);
         if(distance>3&&distance<Math.max(width,height)*.65){
          const formed=activeMode==='form'&&formation>=.98,crossedForm=formed&&formationHit(previous.x,previous.y,x,y);if(formed&&!crossedForm){canvas.dataset.formHit='false';previous={x,y,time:now,id:event.pointerId};return;}if(crossedForm){canvas.dataset.formHit='true';beginCycle(now);}
           const force=activeMode==='tide'?.82:activeMode==='snow'?.48:.38,radius=activeMode==='tide'?(width<600?118:172):(width<600?86:122);
          for(let k=1;k<=steps;k++){const px=previous.x+dx*k/steps,py=previous.y+dy*k/steps;field.stir(px,py,vx*force/steps,vy*force/steps-(activeMode==='tide'?135:0),radius,activeMode==='tide'?(dx>=0?480:-480):0);if(activeMode==='tide')dropRipple(px,py,Math.hypot(vx,vy)/1700,now+k*.2);else dropTrace(px,py,vx,vy,now+k*.2);}
          if(activeMode==='tide'){const turn=dx>=0?1:-1;for(const p of blocks){const ox=p.x-x,oy=p.y-y,d=Math.hypot(ox,oy);if(d<radius*1.15){const falloff=(1-d/(radius*1.15))**1.4;p.vx+=(vx*.045-oy*2.15*turn)*falloff;p.vy+=(vy*.035+ox*1.7*turn-210)*falloff;p.spin+=turn*2.8*falloff;}}}
          if(activeMode==='snow')for(const p of blocks){const ox=p.x-x,oy=p.y-y,d=Math.hypot(ox,oy);if(d<radius){p.sleeping=false;p.sleep=0;p.rest=0;p.vx+=vx*.05*(1-d/radius);p.vy-=Math.min(210,Math.abs(vy)*.08+70)*(1-d/radius);}}
        }
      }
      previous={x,y,time:now,id:event.pointerId};
    }
    function tap(event){if(inputAllowed(event)){const now=performance.now(),hit=activeMode==='form'&&formationHit(event.clientX,event.clientY,event.clientX,event.clientY);if(hit){canvas.dataset.formHit='true';beginCycle(now);}else if(activeMode==='form'&&formation>=.98)canvas.dataset.formHit='false';field.stir(event.clientX,event.clientY,0,activeMode==='tide'?-520:-90,width<600?108:160,activeMode==='tide'?620:360);if(activeMode==='tide')dropRipple(event.clientX,event.clientY,1,now,true);else dropTrace(event.clientX,event.clientY,0,-1,now,true);}}
    function leave(){previous=null;lastRipplePoint=null;lastTracePoint=null;}
    cover.addEventListener('pointermove',move,{passive:true});cover.addEventListener('pointerdown',tap,{passive:true});cover.addEventListener('pointerleave',leave);
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(cover);
    const bodyObserver=new MutationObserver(records=>{if(records.some(r=>r.attributeName==='open'))run();if(records.some(r=>r.target===document.body&&r.attributeName==='data-dark'))colors();});
    bodyObserver.observe(document.body,{attributes:true,subtree:true,attributeFilter:['open','data-dark']});
    const paletteObserver=new MutationObserver(colors);paletteObserver.observe(document.documentElement,{attributes:true,attributeFilter:['style']});
    document.addEventListener('visibilitychange',run);reduce.addEventListener('change',run);window.addEventListener('resize',resize);
    const cleanupObserver=new MutationObserver(()=>{if(root.isConnected)return;disposed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();bodyObserver.disconnect();paletteObserver.disconnect();cleanupObserver.disconnect();document.removeEventListener('visibilitychange',run);reduce.removeEventListener('change',run);window.removeEventListener('resize',resize);blocks=[];});
    cover.__inspirationSnapshot=()=>({image:canvas.toDataURL('image/png'),particles:blocks.map(p=>({x:(p.renderX??p.x)/width,y:(p.renderY??p.y)/height,baseX:p.x/width,baseY:p.y/height,vx:p.vx,vy:p.vy,angle:p.angle,spin:p.spin,tilt:p.tilt,kind:p.kind,tone:p.tone,depth:p.depth??0,snowLayer:p.snowLayer,fluidDepth:p.fluidDepth,birth:p.birth??1,retiring:!!p.retiring,retireAge:p.retireAge||0}))});
    cover.__setInspirationMode=setMode;
    cleanupObserver.observe(root.parentNode,{childList:true});resize();transitionLayer(cover,transition);run();
  }
  const homeBefore=home;home=function(){homeBefore();if(effective().theme==='flow'){const style=normalizeMode(prefs.flowStyle);prefs.flowStyle=style;document.body.dataset.flowStyle=style;const root=$('.home-flow');if(root)mountFlow(root);}else delete document.body.dataset.flowStyle;resetChromeIdle();};
  const copyBefore=applyHomeCopy;applyHomeCopy=function(){copyBefore();if(view!=='home'||effective().theme!=='flow')return;const copy=modeCopy(normalizeMode(prefs.flowStyle)),title=$('[data-flow-title]'),intro=$('[data-flow-intro]');if(title)title.textContent=copy.title;if(intro)intro.textContent=copy.intro;};
  const flowDockBefore=dock;dock=function(){flowDockBefore();if(dockTheme()!=='flow')return;const trigger=$('.dock-trigger');if(!trigger)return;const label=trigger.querySelector('.dock-label')?.outerHTML||'';trigger.innerHTML=FLOW_DOCK_ICON+label;document.querySelectorAll('.dock-options .space-option').forEach((option,index)=>{const slot=option.querySelector(':scope>span');if(!slot)return;const shape=index%FLOW_SPACE_SHAPES.length;option.dataset.flowSpaceShape=String(shape);slot.className='flow-space-symbol';slot.setAttribute('aria-hidden','true');slot.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round">${FLOW_SPACE_SHAPES[shape]}</svg>`;});const container=trigger.closest('.dock');container?.addEventListener('pointerleave',()=>{container.classList.remove('open');trigger.setAttribute('aria-expanded','false');if(container.contains(document.activeElement))document.activeElement.blur();});};
  const artBefore=themeArtwork;themeArtwork=function(id){if(id!=='flow')return artBefore(id);const rand=random(632),forms=['<circle r="2.7"/>','<rect x="-2.5" y="-2.5" width="5" height="5"/>','<path d="M0-3 3 2-3 2Z"/>','<path d="M-1-3h2v2h2v2H1v2h-2V1h-2v-2h2Z"/>'];return '<svg viewBox="0 0 240 135" aria-hidden="true"><rect width="240" height="135" fill="#5365ce"/><g fill="#f5f7ff">'+Array.from({length:82},()=>{let x=rand()*240,y=rand()*135;if(x>52&&x<187&&y>28&&y<88)y+=66;return '<g transform="translate('+x+' '+y+') rotate('+rand()*360+')">'+forms[Math.floor(rand()*4)]+'</g>';}).join('')+'</g><text x="120" y="67" text-anchor="middle" fill="white" font-size="13" font-family="sans-serif">漫游 · 成形 · 落雪 · 涌动</text></svg>';};
  document.addEventListener('click',event=>{
    const direct=event.target.closest('[data-inspiration-mode]'),trigger=event.target.closest('[data-inspiration-toggle]');if(!direct&&!trigger)return;
    event.preventDefault();event.stopPropagation();const current=normalizeMode(prefs.flowStyle),next=direct?.dataset.inspirationMode||MODE_KEYS[(MODE_KEYS.indexOf(current)+1)%MODE_KEYS.length],cover=document.querySelector('.flow-cover');
    const url=new URL(location.href);if(url.searchParams.get('theme')==='surge'){url.searchParams.set('theme','flow');history.replaceState(null,'',url)}
    if(cover?.__setInspirationMode)cover.__setInspirationMode(next);else{prefs.flowStyle=next;persist();render();}
  },true);
  if(new URL(location.href).searchParams.get('theme')==='flow'){scope='global';changeTheme('flow');}
  else if(effective().theme==='flow')render();
})();
