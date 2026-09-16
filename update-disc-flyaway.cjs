const fs=require('fs');let s=fs.readFileSync('dist/v4.js','utf8');s=s.replace("chooseTrack((trackIndex+1)%TRACKS.length);animateIncomingRecord(disc)","animateIncomingRecord(disc);chooseTrack((trackIndex+1)%TRACKS.length)");const a=s.indexOf('function animateIncomingRecord(disc){');if(a<0)throw Error('missing');s=s.slice(0,a)+`function animateIncomingRecord(disc){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const sleeve=disc.closest('.record-sleeve');sleeve.querySelectorAll('.incoming-record').forEach(el=>el.remove());
 const overlay=disc.cloneNode(true),rotation=getComputedStyle(disc).transform;
 overlay.classList.remove('spinning');overlay.classList.add('incoming-record');
 overlay.removeAttribute('role');overlay.removeAttribute('tabindex');overlay.removeAttribute('title');overlay.setAttribute('aria-hidden','true');
 overlay.querySelectorAll('[tabindex],[role]').forEach(el=>{el.removeAttribute('tabindex');el.removeAttribute('role')});
 overlay.querySelector('.vinyl-label')?.classList.remove('vinyl-label');
 // Preserve label styling while keeping playback synchronization on the new disc.
 const label=disc.querySelector('.vinyl-label'),copy=overlay.querySelector('div');
 if(label&&copy){const style=getComputedStyle(label);for(const prop of style)copy.style.setProperty(prop,style.getPropertyValue(prop))}
 sleeve.append(overlay);
 const base='translate(-50%,-50%) '+(rotation==='none'?'':rotation);
 const animation=overlay.animate([
 {opacity:1,transform:base,filter:'blur(0)'},
 {opacity:1,offset:.2,transform:base+' translate(25px,-15px) rotate(5deg)',filter:'blur(0)'},
 {opacity:.8,offset:.55,transform:base+' translate(120px,-65px) rotate(15deg)',filter:'blur(0)'},
 {opacity:0,transform:base+' translate(260px,-150px) rotate(28deg)',filter:'blur(3px)'}
 ],{duration:2400,easing:'cubic-bezier(.25,.1,.25,1)',fill:'forwards'});
 animation.onfinish=()=>overlay.remove();
}
`;fs.writeFileSync('dist/v4.js',s);
