(() => {
  'use strict';

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  // The official site is on www; setup must always use the product homepage.
  const HOME_URL = 'https://shiyubox.com/';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  // Reuse the product resolver when embedded; otherwise CSS owns the single fallback.
  if (typeof window.resolveThemeColor === 'function') {
    const accent = window.resolveThemeColor();
    if (CSS.supports('color', accent)) document.documentElement.style.setProperty('--accent', accent);
  }

  const sections = $$('.screen');
  const header = $('.site-header');
  const chapters = $('.chapter-nav');
  const navigation = $$('.chapter-nav a, .main-nav a');
  let activeSection = '';
  let scrollFrame = 0;
  function syncScroll() {
    scrollFrame = 0;
    const line = innerHeight * .38;
    const section = sections.find(node => {
      const bounds = node.getBoundingClientRect();
      return bounds.top <= line && bounds.bottom > line;
    }) || sections[0];
    if (section.id !== activeSection) {
      activeSection = section.id;
      header.dataset.tone = section.dataset.tone;
      chapters.dataset.tone = section.dataset.tone;
      for (const link of navigation) {
        if (link.hash === '#' + activeSection) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }
    const travel = document.documentElement.scrollHeight - innerHeight;
    $('.page-progress>span').style.transform = `scaleX(${travel > 0 ? Math.max(0, Math.min(1, scrollY / travel)) : 0})`;
  }
  function scheduleScroll() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(syncScroll);
  }
  addEventListener('scroll', scheduleScroll, { passive: true });
  addEventListener('resize', scheduleScroll, { passive: true });
  syncScroll();

  // Native anchors and scroll snapping remain functional without JavaScript.
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const section = document.getElementById(link.hash.slice(1));
      if (!section) return;
      event.preventDefault();
      history.replaceState(null, '', link.hash);
      section.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
      // Skip navigation must move keyboard focus, not only the viewport.
      if (link.classList.contains('skip-link')) {
        section.tabIndex = -1;
        section.focus({ preventScroll: true });
      }
    });
  });

  const local = ['localhost','127.0.0.1'].includes(location.hostname);
  const api = '/api/shiyu/operations';
  async function refreshWorld() {
    let enabled = false;
    try { const r = await fetch(api, {cache:'no-store',signal:AbortSignal.timeout(6000)}); if(r.ok){const data=await r.json();enabled=data.world?.enabled===true && data.world?.eligible!==false;} } catch {}
    $('#world-status').hidden=enabled;
    $('#world-action').textContent=enabled?'探索拾隅世界':'即将上线';
    $$('[data-world-href]').forEach(a=>{if(enabled){a.href=a.dataset.worldHref;a.removeAttribute('aria-disabled');}else{a.removeAttribute('href');a.setAttribute('aria-disabled','true');}});
  }
  refreshWorld();addEventListener('focus',refreshWorld);
  const dialog=$('#setup-dialog');let returnFocus,requestId=0;
  const ua=navigator.userAgent;
  const browser=/Edg(?:e|A|iOS)?\//.test(ua)?'Edge':/Firefox|FxiOS/.test(ua)?'Firefox':/Chrome|CriOS/.test(ua)?'Chrome':/Safari/.test(ua)?'Safari':'当前浏览器';
  const addresses={Edge:'edge://settings/startHomeNTP',Chrome:'chrome://settings/appearance',Firefox:'about:preferences#home'};
  const address=addresses[browser]||'';
  async function copy(value){
    try{await navigator.clipboard.writeText(value);return true;}catch{
      const el=document.createElement('textarea');el.value=value;el.style.cssText='position:fixed;opacity:0';dialog.append(el);el.select();let ok=false;try{ok=document.execCommand('copy')}catch{}el.remove();return ok;
    }
  }
  $('#install-app').href=local?'/install/':'https://shiyubox.com/install/';
  $$('[data-setup]').forEach(button=>button.addEventListener('click',async()=>{
    const id=++requestId,home=button.dataset.setup==='home';returnFocus=button;
    $('#setup-title').textContent=home?'将拾隅设为首页':'将拾隅添加到桌面';
    $('#setup-intro').textContent=home?'每次出发，从自己的首页开始。':'像打开 App 一样，打开拾隅。';
    $('#home-instructions').hidden=!home;$('#desktop-instructions').hidden=home;$('#setup-status').textContent='';
    $('#detected-browser').textContent='2. 打开 '+browser+' 设置，将拾隅设为主页';
    $('#settings-address').textContent=address;$('.settings-address').hidden=!address;$('#open-settings').hidden=!address;
    $('#setup-steps').textContent=browser==='Safari'?'在 Safari 菜单中打开「设置 → 通用」，将拾隅链接粘贴到「主页」。':browser==='Edge'?'在「开始、主页和新建标签页」中，设置主页按钮的网址。':browser==='Chrome'?'在「外观」中开启主页按钮，选择自定义网址。':browser==='Firefox'?'在「主页」中选择「自定义网址」。':'打开浏览器设置，找到主页并填入拾隅链接。';
    $('#home-instructions .setup-note').hidden=!address;dialog.showModal();
    if(home){const ok=await copy(HOME_URL);if(id===requestId&&dialog.open)$('#setup-status').textContent=ok?'已复制拾隅主页链接。':'请点击复制链接，或手动复制上方地址。';}
  }));
  $('#copy-home').onclick=async()=>{$('#setup-status').textContent=await copy(HOME_URL)?'已复制拾隅主页链接。':'请手动复制上方主页链接。'};
  $('#open-settings').onclick=async()=>{$('#setup-status').textContent=await copy(address)?'已复制设置页地址，请粘贴到浏览器地址栏打开。':'请手动复制上方设置页地址。'};
  $('.close-dialog').onclick=()=>dialog.close();
  dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close()});
  dialog.addEventListener('close',()=>{++requestId;returnFocus?.focus({preventScroll:true})});
})();
