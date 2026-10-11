/* Independent theme: the existing cosmos/globe renderers are intentionally untouched. */
(() => {
  const ID='solarVoyage';
  THEMES[ID]={...THEMES.cosmos,name:'逐光星旅',en:'SOLAR VOYAGE',desc:'循着星轨，走近每一个世界。',mini:'◎'};
  THEME_IDENTITIES[ID]=['逐光星旅','lib-Orbit'];
  COPY_DEFAULTS[ID]={...COPY_DEFAULTS.base,title:'循光而行，\n万物有轨。',intro:'从太阳出发，走近每一个世界。'};
  const oldArtwork=themeArtwork;
  themeArtwork=id=>id===ID?'<img src="assets/solar-voyage/cover.svg" alt="逐光星旅" style="width:100%;height:100%;object-fit:cover">':oldArtwork(id);
  let active,dispose;
  const previous=home;
  home=function(){
    if(view==='home'&&effective().theme===ID&&active?.isConnected)return;
    dispose?.();previous();
    if(view!=='home'||effective().theme!==ID)return;
    const root=document.querySelector('.home-solarVoyage');if(!root)return;active=root;
    let dead=false,cleanup;
    const observer=new MutationObserver(()=>{if(!root.isConnected)dispose?.();});observer.observe(document.querySelector('#main'),{childList:true});
    dispose=()=>{if(dead)return;dead=true;observer.disconnect();cleanup?.();active=null;};
    import('./assets/solar-voyage/scene.js').then(m=>{if(!dead)cleanup=m.mount(root);}).catch(()=>{if(!dead)root.insertAdjacentHTML('beforeend','<p class="solar-error">星空加载失败，请刷新后重试。</p>');});
  };
})();
