// Adapted from Robin Delaporte / Codrops Flowmap Deformation (2019).
// Original OGL Flowmap and pointer-velocity interaction; see SOURCE.md.
import ogl from './ogl.js';
const vertex=`attribute vec2 uv;attribute vec2 position;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,0.,1.);}`;
const fragment=`precision highp float;uniform sampler2D tWater;uniform sampler2D tFlow;varying vec2 vUv;void main(){vec3 flow=texture2D(tFlow,vUv).rgb;vec2 uv=clamp(vUv-flow.xy*.075,vec2(.001),vec2(.999));gl_FragColor=texture2D(tWater,uv);}`;
export async function mountFlow(art){
  const source=art.querySelector('svg');
  if(!source||matchMedia('(prefers-reduced-motion:reduce)').matches||!matchMedia('(pointer:fine)').matches)return null;
  const canvas=document.createElement('canvas');canvas.className='poly-flow';canvas.setAttribute('aria-hidden','true');
  let renderer,gl,dead=false,frame=0,lastTime=0,lastMouse=null,activeUntil=0;
  const abort=new AbortController(),signal=abort.signal;
  function dispose(){if(dead)return;dead=true;cancelAnimationFrame(frame);abort.abort();observer?.disconnect();canvas.remove();source.style.removeProperty('visibility');gl?.getExtension('WEBGL_lose_context')?.loseContext();}
  let observer;
  try{
    renderer=new ogl.Renderer({canvas,dpr:Math.min(devicePixelRatio,1.5),alpha:true,depth:false,webgl:1});gl=renderer.gl;
    const flow=new ogl.Flowmap(gl,{size:256,falloff:.18,dissipation:.94});
    const geometry=new ogl.Geometry(gl,{position:{size:2,data:new Float32Array([-1,-1,3,-1,-1,3])},uv:{size:2,data:new Float32Array([0,0,2,0,0,2])}});
    const texture=new ogl.Texture(gl,{minFilter:gl.LINEAR,magFilter:gl.LINEAR,generateMipmaps:false});
    const program=new ogl.Program(gl,{vertex,fragment,depthTest:false,depthWrite:false,uniforms:{tWater:{value:texture},tFlow:flow.uniform}}),mesh=new ogl.Mesh(gl,{geometry,program});
    const mouse=new ogl.Vec2(-1),velocity=new ogl.Vec2();
    const rect=art.getBoundingClientRect();renderer.setSize(rect.width,rect.height);flow.aspect=rect.width/rect.height;
    // Rasterize the current SVG at exactly its displayed crop, including custom images.
    const clone=source.cloneNode(true);clone.setAttribute('width',String(Math.round(rect.width*renderer.dpr)));clone.setAttribute('height',String(Math.round(rect.height*renderer.dpr)));clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
    const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml'})),image=new Image();
    try{image.src=url;await image.decode();}finally{URL.revokeObjectURL(url);}
    if(dead||!art.isConnected||art.querySelector('svg')!==source){dispose();return null;}
    texture.image=image;flow.update();renderer.render({scene:mesh});
    if(gl.getError()!==gl.NO_ERROR)throw Error('Flow rendering unavailable');
    art.append(canvas);source.style.visibility='hidden';
    function update(now){
      frame=0;if(dead)return;if(!art.isConnected){dispose();return;}
      if(!velocity.needsUpdate){mouse.set(-1);velocity.set(0);}
      velocity.needsUpdate=false;flow.mouse.copy(mouse);flow.velocity.lerp(velocity,velocity.len()? .15:.1);
      try{flow.update();renderer.render({scene:mesh});}catch(error){dispose();return;}
      if(now<activeUntil&&!document.hidden)frame=requestAnimationFrame(update);
    }
    function stop(){lastMouse=null;lastTime=0;mouse.set(-1);velocity.set(0);}
    document.addEventListener('pointermove',e=>{
      if(dead||document.hidden||!art.closest('.home-poly')||e.pointerType==='touch'||document.querySelector('dialog[open]')||e.target.closest('button,a,input,[popover]')){stop();return;}
      const r=art.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,now=performance.now();
      if(x<0||y<0||x>r.width||y>r.height){stop();return;}
      mouse.set(x/r.width,1-y/r.height);
      if(lastMouse){const delta=Math.max(10.4,now-lastTime);velocity.set(Math.max(-2,Math.min(2,(x-lastMouse.x)/delta)),Math.max(-2,Math.min(2,(y-lastMouse.y)/delta)));}else velocity.set(0);
      lastMouse={x,y};lastTime=now;velocity.needsUpdate=true;activeUntil=now+2400;
      if(!frame)frame=requestAnimationFrame(update);
    },{passive:true,signal});
    document.addEventListener('pointerleave',stop,{signal});window.addEventListener('blur',stop,{signal});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();cancelAnimationFrame(frame);frame=0;}else{activeUntil=performance.now()+2400;if(!frame)frame=requestAnimationFrame(update);}},{signal});
    canvas.addEventListener('webglcontextlost',()=>dispose(),{signal});
    window.addEventListener('resize',dispose,{signal});
    matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',dispose,{signal});
    observer=new MutationObserver(()=>{if(!art.isConnected||art.querySelector('svg')!==source)dispose();});observer.observe(document.body,{childList:true,subtree:true});
    return {dispose};
  }catch(error){dispose();return null;}
}
