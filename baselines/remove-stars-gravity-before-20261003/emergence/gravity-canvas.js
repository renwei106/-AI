// Small Canvas2D drawing bridge for the unmodified upstream p5 Renderer.
// Physics, field sampling, arrow normalization, contours and trails stay upstream.
export function gravityCanvas(canvas){
 const c=canvas.getContext('2d');let state={fill:true,stroke:true,mode:'rgb',size:12,font:'sans-serif'},stack=[];
 function color(a){let [r,g,b,alpha]=a;if(a.length<3){g=b=r;alpha=a[1];}
  if(state.mode==='hsb'){const h=((r%360)+360)%360/60,s=g/100,v=b/100,k=n=>(n+h)%6,f=n=>255*v*(1-s*Math.max(0,Math.min(k(n),4-k(n),1)));return `rgba(${f(5)},${f(3)},${f(1)},${(alpha??100)/100})`;}
  return `rgba(${r},${g},${b},${(alpha??255)/255})`;
 }
 function paint(){if(state.fill)c.fill();if(state.stroke)c.stroke();}
 const p={CENTER:'center',LEFT:'left',TOP:'top',HSB:'hsb',
  get width(){return canvas.clientWidth;},get height(){return canvas.clientHeight;},
  background(){}, // Page theme supplies the background; never cover its content.
  push(){c.save();stack.push({...state});},pop(){c.restore();state=stack.pop();},
  colorMode(mode){state.mode=mode;},fill(...a){state.fill=true;c.fillStyle=color(a);},stroke(...a){state.stroke=true;c.strokeStyle=color(a);},
  noFill(){state.fill=false;},noStroke(){state.stroke=false;},strokeWeight(w){c.lineWidth=w;},
  translate(x,y){c.translate(x,y);},rotate(a){c.rotate(a);},map(v,a,b,x,y){return x+(v-a)/(b-a)*(y-x);},
  line(x,y,u,v){if(!state.stroke)return;c.beginPath();c.moveTo(x,y);c.lineTo(u,v);c.stroke();},
  circle(x,y,d){c.beginPath();c.arc(x,y,Math.max(0,d/2),0,Math.PI*2);paint();},
  triangle(a,b,d,e,f,g){c.beginPath();c.moveTo(a,b);c.lineTo(d,e);c.lineTo(f,g);c.closePath();paint();},
  rect(x,y,w,h){c.beginPath();c.rect(x,y,w,h);paint();},
  beginShape(){c.beginPath();p.first=true;},vertex(x,y){if(p.first)c.moveTo(x,y);else c.lineTo(x,y);p.first=false;},endShape(){paint();},
  textAlign(x,y){c.textAlign=x;c.textBaseline=y==='center'?'middle':y||'alphabetic';},
  textFont(f){state.font=f;},textSize(s){state.size=s;},text(t,x,y){c.font=`${state.size}px ${state.font}`;if(state.fill)c.fillText(String(t),x,y);},
  createImage(w,h){const node=document.createElement('canvas');node.width=w;node.height=h;const ctx=node.getContext('2d'),data=ctx.createImageData(w,h);return {width:w,height:h,node,pixels:data.data,loadPixels(){},updatePixels(){ctx.putImageData(data,0,0);}};},
  image(img,x,y,w,h){c.drawImage(img.node,x,y,w,h);},
 };return p;
}
