(()=>{
 const state=window.SHIYU_LOCALE_STATE||{locale:'zh-CN',settings:{languages:[{code:'zh-CN',name:'简体中文',enabled:true}],fallback:'zh-CN'}};
 const labels={'zh-CN':{label:'选择语言',pending:'切换语言将重新加载页面，尚未保存的内容可能丢失。是否继续？'},en:{label:'Language',pending:'Changing language reloads this page. Unsaved changes may be lost. Continue?'},ja:{label:'言語を選択',pending:'言語を変更するとページが再読み込みされます。未保存の内容が失われる場合があります。続行しますか？'}};
 const manual=/(?:^|;\s*)shiyu-language=(zh-CN|en|ja)(?:;|$)/.exec(document.cookie)?.[1];
 document.documentElement.lang=state.locale;
 const glyph='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a17 17 0 0 1 0 18 17 17 0 0 1 0-18Z"/></svg>';
 function closeMenus(except){document.querySelectorAll('[data-shiyu-language]').forEach(w=>{if(w!==except)w.closeMenu?.()})}
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-shiyu-language]'))closeMenus()});
 function mount(){const languages=state.settings.languages.filter(l=>l.enabled);document.querySelectorAll('[data-shiyu-language]').forEach(el=>{if(languages.length<2)el.remove()});if(languages.length<2)return;
  for(const host of document.querySelectorAll('body>header .header-right,#world-page .world-header')){
   if(host.querySelector('[data-shiyu-language]'))continue;
   const wrap=document.createElement('div'),trigger=document.createElement('button'),menu=document.createElement('div');
   wrap.dataset.shiyuLanguage='';wrap.className='shiyu-language-picker';trigger.type='button';trigger.className='icon-button shiyu-language-trigger';trigger.innerHTML=glyph;trigger.setAttribute('aria-label',labels[state.locale].label);trigger.setAttribute('aria-haspopup','menu');trigger.setAttribute('aria-expanded','false');menu.className='shiyu-language-menu';menu.setAttribute('role','menu');menu.setAttribute('aria-label',labels[state.locale].label);menu.hidden=true;
   let pinned=false;const show=()=>{closeMenus(wrap);menu.hidden=false;trigger.setAttribute('aria-expanded','true')};wrap.closeMenu=()=>{pinned=false;menu.hidden=true;trigger.setAttribute('aria-expanded','false')};
   for(const language of languages){const option=document.createElement('button');option.type='button';option.className='shiyu-language-option';option.setAttribute('role','menuitemradio');option.setAttribute('aria-checked',String(language.code===state.locale));option.lang=language.code;const name=document.createElement('span');name.textContent=language.name;option.append(name);if(language.code===state.locale){const check=document.createElement('span');check.className='shiyu-language-check';check.setAttribute('aria-hidden','true');check.textContent='✓';option.append(check)}option.onclick=()=>{if(language.code===state.locale){wrap.closeMenu();trigger.focus();return}if(document.querySelector('dialog[open] form')&&!confirm(labels[state.locale].pending))return;document.cookie='shiyu-language='+encodeURIComponent(language.code)+';Path=/;Max-Age=31536000;SameSite=Lax'+(location.protocol==='https:'?';Secure':'');location.reload()};menu.append(option)}
   wrap.onpointerenter=e=>{if(e.pointerType==='mouse')show()};wrap.onpointerleave=()=>{if(!pinned&&!wrap.contains(document.activeElement))wrap.closeMenu()};trigger.onclick=()=>{if(pinned)wrap.closeMenu();else{show();pinned=true}};
   wrap.onfocusout=e=>{if(!wrap.contains(e.relatedTarget))wrap.closeMenu()};wrap.onkeydown=e=>{const options=[...menu.children],index=options.indexOf(document.activeElement);if(e.key==='Escape'){e.preventDefault();wrap.closeMenu();trigger.focus()}else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();show();const next=e.key==='Home'?0:e.key==='End'?options.length-1:e.key==='ArrowDown'?(index+1)%options.length:(index<0?options.length-1:(index-1+options.length)%options.length);options[next].focus()}};
   wrap.append(trigger,menu);const settings=host.querySelector('[data-action="settings"]');host.insertBefore(wrap,settings||null);
  }
 }
 let queued=false;const observer=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;mount()})});observer.observe(document.body,{childList:true,subtree:true});mount();document.documentElement.dataset.headerReady="true";
 // Revalidate after returning from the admin. A disabled manual choice must not survive.
 addEventListener('focus',async()=>{try{const r=await fetch('/api/shiyu/i18n/public',{cache:'no-store'});if(!r.ok)return;const next=await r.json();if(JSON.stringify(next.settings)!==JSON.stringify(state.settings)&&!document.querySelector('dialog[open] form'))location.reload()}catch{}});
 window.ShiyuLanguage=Object.freeze({locale:state.locale,manual:manual||null});
})();
