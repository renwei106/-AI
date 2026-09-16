const fs=require('fs');let s=fs.readFileSync('dist/v4.js','utf8');fs.mkdirSync('baselines/v163-rain-contact-normal',{recursive:true});fs.copyFileSync('dist/v4.js','baselines/v163-rain-contact-normal/v4.js');const start=s.indexOf(' for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){const a=particles[i],b=particles[j],dx=');const end=s.indexOf('\n}',start);if(start<0||end<0)throw Error('solver missing');s=s.slice(0,start)+` for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){
 const a=particles[i],b=particles[j],aa=a.angle*Math.PI/180,ba=b.angle*Math.PI/180;
 const ax=[Math.cos(aa),Math.sin(aa)],ay=[-ax[1],ax[0]],bx=[Math.cos(ba),Math.sin(ba)],by=[-bx[1],bx[0]];
 const dx=b.x-a.x,dy=b.y-a.y;let depth=Infinity,nx=0,ny=0;
 for(const axis of [ax,ay,bx,by]){const [x,y]=axis,ra=Math.abs(x*ax[0]+y*ax[1])*(a.width||40)/2+Math.abs(x*ay[0]+y*ay[1])*(a.height||40)/2,rb=Math.abs(x*bx[0]+y*bx[1])*(b.width||40)/2+Math.abs(x*by[0]+y*by[1])*(b.height||40)/2,d=dx*x+dy*y,over=ra+rb-Math.abs(d);if(over<=0){depth=0;break}if(over<depth){depth=over;const sign=d<0?-1:1;nx=x*sign;ny=y*sign}}
 if(!depth)continue;
 const ia=1/(a.mass||1),ib=1/(b.mass||1),total=ia+ib,over=depth+.05;
 a.x-=nx*over*ia/total;a.y-=ny*over*ia/total;b.x+=nx*over*ib/total;b.y+=ny*over*ib/total;
 const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
 if(relative<0){const impulse=-relative*1.8/total;a.vx-=impulse*nx*ia;a.vy-=impulse*ny*ia;b.vx+=impulse*nx*ib;b.vy+=impulse*ny*ib;
 const tangent=dx*(-ny)+dy*nx,spin=Math.max(-90,Math.min(90,tangent*impulse*.0008));a.spin=(a.spin||0)-spin*ia;b.spin=(b.spin||0)+spin*ib;}
 }`+s.slice(end);s=s.replace('for(const a of particles)a.angle+=a.vx*dt*.7;','for(const a of particles){a.angle+=(a.vx*.7+(a.spin||0))*dt;a.spin=(a.spin||0)*Math.exp(-dt*.8);}');fs.writeFileSync('dist/v4.js',s);
