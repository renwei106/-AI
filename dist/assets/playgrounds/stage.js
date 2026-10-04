(function(root){
 'use strict';
 const catalog=root.ShiyuPlaygroundCatalog,models=root.ShiyuPlaygroundModels;
 const metadata=id=>catalog.find(s=>s.id===id);
 function defaults(id){return Object.fromEntries(metadata(id).fields.map(f=>[f.key,f.value]));}
 function normalize(id,value){return Object.fromEntries(metadata(id).fields.map(f=>{const number=Number(value?.[f.key]),n=Number.isFinite(number)?Math.max(f.min,Math.min(f.max,number)):f.value;return [f.key,f.step>=1?Math.round(n):n];}));}
 class Stage{
  constructor(id,config){this.id=id;this.config=normalize(id,config);this.model=models.create(id,this.config);this.time=0;this.accumulator=0;this.pointer=null;this.rect={x:0,y:0,width:800,height:520};}
  resize(width,height){if(['solarSystem','binarySystem'].includes(this.id)){const scale=Math.min(width/800,height/520);this.rect={x:width*(this.id==='binarySystem'&&width>=700?.64:.5)-400*scale,y:height*(this.id==='binarySystem'?(width<700?.59:.51):.5)-260*scale,width:800*scale,height:520*scale};}else this.rect={x:0,y:0,width,height};}
  point(x,y){const r=this.rect,p={x:(x-r.x)/r.width*800,y:(y-r.y)/r.height*520};return p.x>=0&&p.x<=800&&p.y>=0&&p.y<=520?p:null;}
  down(x,y,tool){const p=this.point(x,y);if(!p)return false;this.pointer={...p,tool,down:true};if(this.model.interact(p,tool,this.config)===false){this.pointer=null;return false;}return true;}
  move(x,y){if(!this.pointer?.down)return;const p=this.point(x,y);if(!p)return;const previous=this.pointer;this.pointer={...p,tool:previous.tool,down:true};if(['elementSandbox','digitalLife'].includes(this.id)){const steps=Math.min(100,Math.ceil(Math.hypot(p.x-previous.x,p.y-previous.y)/8));for(let i=1;i<=steps;i++)this.model.interact({x:previous.x+(p.x-previous.x)*i/steps,y:previous.y+(p.y-previous.y)*i/steps},previous.tool,this.config);}else if(this.id==='softFabric'&&previous.tool==='cut')this.model.interact(p,'cut',this.config);}
  up(cancel=false){this.model.release?.(cancel?null:this.pointer);this.pointer=null;}
  set(key,value){this.config=normalize(this.id,{...this.config,[key]:value});if(['solarSystem','binarySystem'].includes(this.id)||['count','herbivores','predators'].includes(key))this.model.configure(this.config,key);}
  action(){this.model.action();}
  draw(ctx,elapsed,colors,paused){if(!paused){this.accumulator+=Math.min(.066,elapsed);for(let i=0;i<4&&this.accumulator>=1/60;i++){this.model.update(1/60,this.config,this.pointer);this.time+=1/60;this.accumulator-=1/60;}}ctx.save();const r=this.rect;ctx.translate(r.x,r.y);ctx.scale(r.width/800,r.height/520);if(this.id!=='binarySystem'){ctx.beginPath();ctx.rect(0,0,800,520);ctx.clip();}this.model.draw(ctx,colors,this.config,this.pointer);ctx.restore();}
  snapshot(){return {scene:this.id,params:{...this.config},region:{...this.rect},time:this.time,...this.model.stats()};}
 }
 root.ShiyuPlaygrounds={catalog,metadata,defaults,normalize,Stage};
})(window);
