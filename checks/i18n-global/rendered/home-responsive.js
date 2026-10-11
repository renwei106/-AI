/* Layout-only viewport state. Never changes account, theme or companion preferences. */
(()=>{
  const root=document.documentElement,viewport=window.visualViewport;
  let frame=0;
  function update(){
    frame=0;
    // Pinch zoom remains native; do not move the dialog underneath a magnifying user.
    if(viewport&&Math.abs(viewport.scale-1)>.05)return;
    root.style.setProperty('--home-visual-height',(viewport?.height||innerHeight)+'px');
    root.style.setProperty('--home-visual-top',(viewport?.offsetTop||0)+'px');
    const active=document.activeElement;
    if(active?.matches('#login input')&&document.querySelector('#login[open]'))active.scrollIntoView({block:'nearest',inline:'nearest'});
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update)}
  window.addEventListener('resize',schedule);
  viewport?.addEventListener('resize',schedule);
  viewport?.addEventListener('scroll',schedule);
  document.addEventListener('focusin',event=>{if(event.target.matches('#login input'))schedule()});
  update();
})();
