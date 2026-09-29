/* Independent source images: only trim transparent margins, never divide a sheet. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const sharp=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const dir=path.join(__dirname,'swordswoman-source'),root=path.resolve(__dirname,'..');
const manifest=require('./swordswoman-source/prompts.json');
(async()=>{
 const frames=[];
 for(const entry of manifest.frames){
  const original=path.join(dir,`frame-${entry.id}.png`);if(!fs.existsSync(original))fs.copyFileSync(entry.path,original);
  const {data,info}=await sharp(original).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let left=info.width,top=info.height,right=0,bottom=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>8){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
  assert(left>0&&top>0&&right<info.width-1&&bottom<info.height-1,`frame ${entry.id}: character touches source edge`);
  frames.push({...entry,original,box:{left,top,width:right-left+1,height:bottom-top+1}});
 }
 const sizes=[440,285,235,415,375,350,355],report=[];
 for(const frame of frames){
  const group=Math.floor(frame.id/4);
  const ratio=Math.min(sizes[group]/frame.box.height,460/frame.box.width);
  const w=Math.round(frame.box.width*ratio),h=Math.round(frame.box.height*ratio),left=Math.round((512-w)/2),top=474-h;
  assert(top>=16&&left>=16,`frame ${frame.id} padding`);
  const sprite=await sharp(frame.original).extract(frame.box).resize(w,h).toBuffer();
  const result=await sharp({create:{width:512,height:512,channels:4,background:'#00000000'}}).composite([{input:sprite,left,top}]).png().toBuffer();
  const filename=`pet-swordswoman-frame-${frame.id}.png`;
  fs.writeFileSync(path.join(root,'dist/assets/site-icons',filename),result);
  fs.writeFileSync(path.resolve(root,'../聚合管理后台/public/shiyu-visuals',filename),result);
  report.push({id:frame.id,width:w,height:h,left,top,bytes:result.length});
 }
 fs.writeFileSync(path.join(dir,'bounds.json'),JSON.stringify(report,null,2));
 const thumbs=await Promise.all(frames.map(async f=>({input:await sharp(path.join(root,'dist/assets/site-icons',`pet-swordswoman-frame-${f.id}.png`)).resize(180,180).toBuffer(),left:(f.id%4)*200+10,top:Math.floor(f.id/4)*200+10})));
 await sharp({create:{width:800,height:1400,channels:4,background:'#cdd5d8'}}).composite(thumbs).png().toFile(path.join(dir,'contact-sheet.png'));
 console.log(`Prepared ${frames.length} complete transparent frames; originals retained.`);
})().catch(error=>{console.error(error);process.exitCode=1});
