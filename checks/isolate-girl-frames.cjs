/* Extract the complete connected character from each authored sprite cell.
 * Strict cell bounds and transparent output prevent neighboring-pose bleed. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const sharp=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'dist/assets/site-icons');
const inputs=[
 {file:path.join(__dirname,'girl-engine-source/base.png'),rows:4,base:0},
 {file:path.join(__dirname,'girl-engine-source/extra.png'),rows:3,base:20},
 ...[0,1,2,3].map(n=>({file:path.join(output,`pet-girl-run-${n}.png`),rows:1,base:16+n,columns:1})),
];

async function isolate(input){
 const {data,info}=await sharp(input.file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const cols=input.columns||4,cellWidth=info.width/cols,cellHeight=info.height/input.rows;
 for(let row=0;row<input.rows;row++)for(let col=0;col<cols;col++){
  const index=input.base+row*cols+col,gutter=cols===1?0:44,x0=Math.max(0,Math.ceil(col*cellWidth)-gutter),y0=Math.max(0,Math.ceil(row*cellHeight)-gutter),x1=Math.min(info.width,Math.floor((col+1)*cellWidth)+gutter),y1=Math.min(info.height,Math.floor((row+1)*cellHeight)+gutter);
  const w=x1-x0,h=y1-y0,mask=new Uint8Array(w*h),seen=new Uint8Array(w*h),queue=new Int32Array(w*h);let largest=[];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)mask[y*w+x]=data[((y+y0)*info.width+x+x0)*4+3]>=42?1:0;
  for(let i=0;i<mask.length;i++){
   if(!mask[i]||seen[i])continue;
   let head=0,tail=1;queue[0]=i;seen[i]=1;
   while(head<tail){const p=queue[head++],px=p%w,py=(p/w)|0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
     if(!dx&&!dy)continue;const nx=px+dx,ny=py+dy;if(nx<0||nx>=w||ny<0||ny>=h)continue;
     const next=ny*w+nx;if(mask[next]&&!seen[next]){seen[next]=1;queue[tail++]=next;}
    }
   }
   if(tail>largest.length)largest=Array.from(queue.subarray(0,tail));
  }
  assert(largest.length>w*h*.04,`frame ${index}: no complete character component`);
  const keep=new Uint8Array(w*h);let minX=w,minY=h,maxX=0,maxY=0;
  for(const p of largest){const x=p%w,y=(p/w)|0;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
   for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const nx=x+dx,ny=y+dy;if(nx>=0&&nx<w&&ny>=0&&ny<h)keep[ny*w+nx]=1;}
  }
  // A source pose must be fully inside its cell; fail instead of silently cutting a hat or shoe.
  const margin=cols===1?2:1;
  assert(minX>=margin&&minY>=margin&&maxX<w-margin&&maxY<h-margin,`frame ${index}: character reaches sprite-cell edge ${minX},${minY}-${maxX},${maxY} in ${w}x${h}`);
  const pad=5,left=Math.max(0,minX-pad),top=Math.max(0,minY-pad),right=Math.min(w,maxX+pad+1),bottom=Math.min(h,maxY+pad+1);
  const cropW=right-left,cropH=bottom-top,out=Buffer.alloc(cropW*cropH*4);
  for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
   if(!keep[y*w+x])continue;
   const src=((y+y0)*info.width+x+x0)*4,dst=((y-top)*cropW+x-left)*4;
   data.copy(out,dst,src,src+4);
  }
  await sharp(out,{raw:{width:cropW,height:cropH,channels:4}}).resize(480,480,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).extend({top:16,bottom:16,left:16,right:16,background:{r:0,g:0,b:0,alpha:0}}).png().toFile(path.join(output,`pet-girl-frame-${index}.png`));
  console.log(`frame ${index}: ${largest.length} connected pixels, ${minX},${minY}-${maxX},${maxY} in ${w}x${h}`);
 }
}
(async()=>{for(const input of inputs)await isolate(input)})().catch(error=>{console.error(error);process.exitCode=1});
