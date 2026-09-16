const fs=require('fs');let s=fs.readFileSync('dist/v4.js','utf8');s=s.replace('const next=()=>{animateIncomingRecord(disc);chooseTrack','const next=()=>{if(disc.closest(\'.record-sleeve\').querySelector(\'.incoming-record\'))return;animateIncomingRecord(disc);chooseTrack');const start=s.indexOf(" const base='translate(-50%,-50%) '");s=s.slice(0,start)+` const base='translate(-50%,-50%)';
 const width=disc.offsetWidth,side=-width*.78;
 const rotationPart=rotation==='none'?'':rotation;
 const out=base+' translate('+side+'px,-18px) rotate(-12deg) '+rotationPart;
 const animation=overlay.animate([{transform:base+' '+rotationPart},{transform:out}],{duration:1000,easing:'cubic-bezier(.3,0,.2,1)',fill:'forwards'});
 animation.onfinish=()=>{overlay.style.zIndex='0';const back=overlay.animate([{transform:out},{transform:base+' translate(12px,12px) '+rotationPart}],{duration:1200,easing:'cubic-bezier(.25,.1,.25,1)',fill:'forwards'});back.onfinish=()=>overlay.remove()};
}
const homeBeforeRecordStack=home;home=function(){homeBeforeRecordStack();const sleeve=$('.music-composition .record-sleeve');if(!sleeve)return;for(let i=2;i>=1;i--){const layer=document.createElement('div');layer.className='record-stack-layer';layer.style.setProperty('--layer',i);layer.setAttribute('aria-hidden','true');sleeve.prepend(layer)}};
if(view==='home'&&effective().theme==='music')home();
`;fs.writeFileSync('dist/v4.js',s);
