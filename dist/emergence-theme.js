/* Register synchronously so the shared catalog and access policy own this theme. */
(() => {
  'use strict';
  const ID = 'emergence';
  THEMES[ID] = {...THEMES.base, name:'万相涌现', en:'EMERGENCE', desc:'从简单的规则，生长出自然的秩序。', mini:'涌'};
  THEME_IDENTITIES[ID] = ['万相涌现', 'lib-Sparkles'];
  COPY_DEFAULTS[ID] = {...COPY_DEFAULTS.base, title:'聚散之间，\n自有默契。', intro:'简单的规则，让微小的个体一起生长。'};
  const artwork = themeArtwork;
  themeArtwork = id => id === ID ? '<img src="assets/emergence/cover.svg" alt="万相涌现" style="width:100%;height:100%;object-fit:cover">' : artwork(id);
  let dispose, activeOwner, activeRoot, sceneCopy;
  function paintCopy() {
    const copy=currentCopy(ID),title=document.querySelector('.emergence-copy h1'),intro=document.querySelector('.emergence-copy .intro');
    if(title)title.textContent=sceneCopy&&[COPY_DEFAULTS[ID].title,'没有领头者，\n也能一起飞翔。'].includes(copy.title)?sceneCopy.title:copy.title;
    if(intro)intro.textContent=sceneCopy&&[COPY_DEFAULTS[ID].intro,'每一次微小的转向，都让秩序悄然发生。'].includes(copy.intro)?sceneCopy.description:copy.intro;
    const caption=document.querySelector('.emergence-caption');
    if(caption){
      caption.hidden=!sceneCopy;
      if(sceneCopy){
        caption.querySelector('.emergence-scene-number').textContent=sceneCopy.id==='birds'?'01':'02';
        caption.querySelector('h2').textContent=sceneCopy.name;
        caption.querySelector('.emergence-scene-subtitle').textContent=sceneCopy.subtitle;
        caption.querySelector('.emergence-rules').innerHTML=sceneCopy.rules.map((rule,i)=>{const [keyword,...description]=rule.split('：');return `<li><span aria-hidden="true">${String(i+1).padStart(2,'0')}</span>${description.length?`<strong>${esc(keyword)}</strong>${esc(description.join('：'))}`:esc(rule)}</li>`;}).join('');
      }
    }
  }
  const owner = () => signed ? String(accountProfile().id || '') : 'guest';
  function mount(root) {
    activeRoot = root;
    activeOwner = owner();
    sceneCopy = null;
    const copy = currentCopy(ID);
    root.insertAdjacentHTML('afterbegin', `<div class="emergence-copy"><div class="eyebrow" data-live-date>${dateText()}</div><h1>${esc(copy.title)}</h1><p class="intro">${esc(copy.intro)}</p></div><div class="emergence-caption" hidden><div class="emergence-caption-heading"><span class="emergence-scene-number"></span><h2></h2><span class="emergence-scene-subtitle"></span></div><ol class="emergence-rules" role="list" aria-label="当前场景的基础规则"></ol></div>`);
    let dead = false, cleanup;
    const observer = new MutationObserver(() => { if (!root.isConnected) dispose?.(); });
    observer.observe(document.querySelector('#main'), {childList:true});
    dispose = () => { if (dead) return; dead = true; observer.disconnect(); cleanup?.(); if(activeRoot===root)activeRoot=null; };
    import('./assets/emergence/shell.js').then(({mountEmergence}) => {
      if (!dead && root.isConnected) cleanup = mountEmergence(root, {color:() => resolveThemeColor(), predatorColor:() => nextPalette()?.[0], owner:activeOwner,onScene:s=>{sceneCopy=s;paintCopy();}});
    }).catch(() => { if (!dead) { const error=document.createElement('p');error.className='emergence-error';error.textContent='场景加载失败，请刷新后重试。';root.append(error); } });
  }
  const previousHome = home;
  home = function() {
    // Shared appearance/settings refreshes should retain this simulation and its open controls.
    if(view==='home'&&effective().theme===ID&&activeRoot?.isConnected&&activeOwner===owner()){paintCopy();return;}
    dispose?.(); previousHome();
    if (view === 'home' && effective().theme === ID) { const root=document.querySelector('.home-emergence'); if(root)mount(root); }
  };
  const previousCopy = applyHomeCopy;
  applyHomeCopy = function() { previousCopy(); if(view==='home'&&effective().theme===ID)paintCopy(); };
  window.addEventListener('shiyu-account-state', () => { if(view==='home'&&effective().theme===ID){if(activeOwner!==owner())home();}else dispose?.(); });
})();
