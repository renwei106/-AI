/* Position space search suggestions in the visible viewport, including the keyboard. */
(()=>{
  let frame=0;
  const viewport=window.visualViewport;
  function update(){
    frame=0;
    document.querySelectorAll('.space-global-search .global-search-results').forEach(results=>{
      if(innerWidth>1100){if(results.dataset.responsivePosition){results.style.cssText='';delete results.dataset.responsivePosition}return}
      if(document.body.dataset.view!=='space'||results.hidden||!results.getClientRects().length)return;
      if(viewport&&Math.abs(viewport.scale-1)>.05)return;
      const anchor=results.parentElement.getBoundingClientRect(),top=(viewport?.offsetTop||0)+8,bottom=top+(viewport?.height||innerHeight)-16;
      const below=Math.max(0,bottom-anchor.bottom-8),above=Math.max(0,anchor.top-top-8),up=below<160&&above>below;
      const height=Math.min(420,up?above:below),width=Math.min(420,innerWidth-32),left=Math.max(16,Math.min(anchor.left,innerWidth-width-16));
      results.dataset.responsivePosition='true';
      Object.assign(results.style,{position:'fixed',left:'0px',top:'0px',right:'auto',width:width+'px',maxHeight:height+'px'});
      // The existing pull-cord clearance can translate an ancestor, making it a fixed containing block.
      const origin=results.getBoundingClientRect(),y=up?Math.max(top,anchor.top-8-Math.min(results.scrollHeight,height)):Math.max(top,anchor.bottom+8);
      results.style.left=(left-origin.left)+'px';results.style.top=(y-origin.top)+'px';
    });
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update)}
  for(const name of ['resize'])window.addEventListener(name,schedule);
  viewport?.addEventListener('resize',schedule);viewport?.addEventListener('scroll',schedule);
  document.addEventListener('scroll',schedule,true);
  document.addEventListener('input',e=>{if(e.target.closest('.space-global-search'))schedule()});
  new MutationObserver(records=>{if(records.some(r=>r.target instanceof Element&&r.target.closest('.space-global-search')))schedule()}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
})();
