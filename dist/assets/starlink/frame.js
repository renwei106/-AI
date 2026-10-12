'use strict';
const query=new URLSearchParams(location.search);
const pointColor=()=>parent.document.body.dataset.dark==='true'?'#f0f0f0':'#242424';
particlesJS('particles-js',{
  particles:{number:{value:Math.max(20,Math.min(300,Number(query.get('count'))||150)),density:{enable:false,value_area:800}},color:{value:pointColor()},shape:{type:'circle'},opacity:{value:1,random:false},size:{value:3,random:true},line_linked:{enable:true,distance:Math.max(50,Math.min(250,Number(query.get('distance'))||150)),color:pointColor(),opacity:.35,width:1},move:{enable:true,speed:4*Math.max(0.5,Math.min(5,Number(query.get('speed'))||2.5)),direction:'none',random:true,straight:false,out_mode:'out',bounce:false}},
  interactivity:{detect_on:'canvas',events:{onhover:{enable:true,mode:'grab'},onclick:{enable:false},resize:true},modes:{grab:{distance:180,line_linked:{opacity:.65}}}},retina_detect:true
});
// Keep the upstream engine intact; only adjust its public movement setting.
const field=pJSDom[pJSDom.length-1].pJS,canvas=field.canvas.el;
let normalSpeed=field.particles.move.speed;
let holdTimer,heldPointer=null;
canvas.style.touchAction='none';
function release(){clearTimeout(holdTimer);holdTimer=null;field.particles.move.speed=normalSpeed;const pointer=heldPointer;heldPointer=null;if(pointer!==null&&canvas.hasPointerCapture(pointer))canvas.releasePointerCapture(pointer);}
canvas.addEventListener('pointerdown',event=>{
  if(heldPointer!==null||!event.isPrimary||event.button!==0)return;
  heldPointer=event.pointerId;canvas.setPointerCapture(event.pointerId);
  holdTimer=setTimeout(()=>{field.particles.move.speed=normalSpeed*3;},350);
});
canvas.addEventListener('pointerup',release);
canvas.addEventListener('pointercancel',release);
canvas.addEventListener('lostpointercapture',release);
canvas.addEventListener('contextmenu',event=>event.preventDefault());
window.addEventListener('blur',release);
document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});

window.setStarlinkSpeed=value=>{normalSpeed=4*Math.max(0.5,Math.min(5,Number(value)||2.5));field.particles.move.speed=holdTimer&&heldPointer!==null?field.particles.move.speed:normalSpeed;};

window.setStarlinkDistance=value=>{const distance=Math.max(50,Math.min(250,Number(value)||150));field.tmp.obj.line_linked_distance=distance;field.particles.line_linked.distance=distance*field.canvas.pxratio;};

// Update existing points when appearance changes; keep their positions and movement intact.
const pointAppearance=new MutationObserver(()=>{const value=pointColor(),channel=value==='#f0f0f0'?240:36;field.particles.color.value=value;field.particles.line_linked.color=value;field.particles.line_linked.color_rgb_line={r:channel,g:channel,b:channel};field.particles.array.forEach(point=>{point.color.rgb={r:channel,g:channel,b:channel};});});
pointAppearance.observe(parent.document.body,{attributes:true,attributeFilter:['data-dark']});

// Offer the embedded scene's wheel to the host's existing navigation handlers.
window.addEventListener('wheel',event=>{
 if(event.defaultPrevented||!window.frameElement)return;
 const rect=window.frameElement.getBoundingClientRect();
 const forwarded=new parent.WheelEvent('wheel',{bubbles:true,cancelable:true,deltaX:event.deltaX,deltaY:event.deltaY,deltaZ:event.deltaZ,deltaMode:event.deltaMode,ctrlKey:event.ctrlKey,shiftKey:event.shiftKey,altKey:event.altKey,metaKey:event.metaKey,clientX:rect.left+event.clientX,clientY:rect.top+event.clientY});
 if(!window.frameElement.dispatchEvent(forwarded))event.preventDefault();
},{passive:false});
