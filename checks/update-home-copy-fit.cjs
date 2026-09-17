const fs=require('fs'),p='dist/v4.js';let s=fs.readFileSync(p,'utf8');const start=s.indexOf('function fitHomeText(){'),end=s.indexOf('\nconst copyBeforeFit=',start);if(start<0||end<0)throw Error('missing fit');
s=s.slice(0,start)+`const HOME_COPY_SELECTOR='.home .customizable-copy,.home [data-flow-title],.home [data-flow-intro],.home [data-reading-title],.home [data-reading-intro],.home .surge-copy h1,.home [data-surge-intro]';
function fitHomeText(){
 if(view!=='home')return;
 document.querySelectorAll(HOME_COPY_SELECTOR).forEach(el=>{
  el.style.removeProperty('font-size');el.style.setProperty('white-space','pre','important');el.style.setProperty('overflow-wrap','normal','important');el.style.setProperty('word-break','normal','important');el.style.setProperty('max-width','none','important');
  const parent=el.parentElement,pr=parent.getBoundingClientRect(),ps=getComputedStyle(parent),es=getComputedStyle(el),paddingLeft=parseFloat(ps.paddingLeft)||0,paddingRight=parseFloat(ps.paddingRight)||0;
  const left=Math.max(16,pr.left+paddingLeft),right=Math.min(innerWidth-16,pr.right-paddingRight),available=right-left;if(available<=0||!el.getClientRects().length)return;
  // Remove only the copy's arbitrary cap; illustrated columns keep their own bounds.
  if(!['inline','contents'].includes(es.display)){el.style.width='100%';el.style.boxSizing='border-box';}
  let size=parseFloat(es.fontSize);const range=document.createRange();range.selectNodeContents(el);
  for(let i=0;i<4;i++){const lineWidth=Math.max(0,...[...range.getClientRects()].map(r=>r.width)),height=el.getBoundingClientRect().height,maxHeight=innerHeight*(el.matches('h1,h2,[data-flow-title],[data-reading-title]')?.34:.22),ratio=Math.min(1,available/Math.max(lineWidth,1),maxHeight/Math.max(height,1));if(ratio>=.998)break;size*=ratio*.99;el.style.setProperty('font-size',size+'px','important');}
 });
}
let homeCopyFitFrame=0;
function scheduleHomeCopyFit(){if(homeCopyFitFrame)return;homeCopyFitFrame=requestAnimationFrame(()=>{homeCopyFitFrame=0;fitHomeText()});}
new MutationObserver(records=>{if(view!=='home')return;const matches=node=>node.nodeType===1&&(node.matches(HOME_COPY_SELECTOR)||node.querySelector(HOME_COPY_SELECTOR));if(records.some(r=>r.target.parentElement?.closest(HOME_COPY_SELECTOR)||r.target.nodeType===1&&r.target.matches(HOME_COPY_SELECTOR)||[...r.addedNodes].some(matches)))scheduleHomeCopyFit();}).observe(document.querySelector('#main'),{childList:true,subtree:true,characterData:true});
document.addEventListener('fullscreenchange',scheduleHomeCopyFit);document.fonts.addEventListener('loadingdone',scheduleHomeCopyFit);
`+s.slice(end);fs.writeFileSync(p,s);
