/* Register synchronously so the shared catalog and access policy own this theme. */
(() => {
  'use strict';
  const ID = 'emergence';
  THEMES[ID] = {...THEMES.base, name:'涌现', en:'EMERGENCE', desc:'从简单的规则，生长出自然的秩序。', mini:'涌'};
  THEME_IDENTITIES[ID] = ['涌现', 'lib-Sparkles'];
  COPY_DEFAULTS[ID] = {...COPY_DEFAULTS.base, title:'聚散之间，\n自有默契。', intro:'简单的规则，让微小的个体一起生长。'};
  const artwork = themeArtwork;
  themeArtwork = id => id === ID ? '<img src="assets/emergence/cover.svg" alt="涌现" style="width:100%;height:100%;object-fit:cover">' : artwork(id);
  let dispose, activeOwner, sceneCopy;
  function paintCopy() {
    const copy=currentCopy(ID),title=document.querySelector('.emergence-copy h1'),intro=document.querySelector('.emergence-copy .intro');
    if(title)title.textContent=sceneCopy&&[COPY_DEFAULTS[ID].title,'没有领头者，\n也能一起飞翔。'].includes(copy.title)?sceneCopy.title:copy.title;
    if(intro)intro.textContent=sceneCopy&&[COPY_DEFAULTS[ID].intro,'每一次微小的转向，都让秩序悄然发生。'].includes(copy.intro)?sceneCopy.description:copy.intro;
  }
  const owner = () => signed ? String(accountProfile().id || '') : 'guest';
  function mount(root) {
    activeOwner = owner();
    const copy = currentCopy(ID);
    root.insertAdjacentHTML('afterbegin', `<div class="emergence-copy"><div class="eyebrow" data-live-date>${dateText()}</div><h1>${esc(copy.title)}</h1><p class="intro">${esc(copy.intro)}</p></div>`);
    let dead = false, cleanup;
    const observer = new MutationObserver(() => { if (!root.isConnected) dispose?.(); });
    observer.observe(document.querySelector('#main'), {childList:true});
    dispose = () => { if (dead) return; dead = true; observer.disconnect(); cleanup?.(); };
    import('./assets/emergence/shell.js').then(({mountEmergence}) => {
      if (!dead && root.isConnected) cleanup = mountEmergence(root, {color:() => resolveThemeColor(), owner:activeOwner,onScene:s=>{sceneCopy=s;paintCopy();}});
    }).catch(() => { if (!dead) { const error=document.createElement('p');error.className='emergence-error';error.textContent='场景加载失败，请刷新后重试。';root.append(error); } });
  }
  const previousHome = home;
  home = function() { dispose?.(); previousHome(); if (view === 'home' && effective().theme === ID) { const root=document.querySelector('.home-emergence'); if(root)mount(root); } };
  const previousRender = render;
  render = function(...args) { dispose?.(); return previousRender(...args); };
  const previousCopy = applyHomeCopy;
  applyHomeCopy = function() { previousCopy(); if(view==='home'&&effective().theme===ID)paintCopy(); };
  window.addEventListener('shiyu-account-state', () => { if(view==='home'&&effective().theme===ID){if(activeOwner!==owner())home();}else dispose?.(); });
})();
