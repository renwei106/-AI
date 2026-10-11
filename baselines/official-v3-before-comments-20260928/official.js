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

  const dialog = $('#setup-dialog');
  let returnFocus = null;
  let setupRequest = 0;
  async function copyHome() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(HOME_URL);
      return true;
    } catch {
      // Explicit fallback for an insecure preview or denied Clipboard API.
      const field = $('#home-url');
      const focused = document.activeElement;
      field.focus({ preventScroll: true });
      field.select();
      try {
        const copied = document.execCommand('copy');
        if (copied) focused?.focus({ preventScroll: true });
        return copied;
      } catch { return false; }
    }
  }

  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isWindows = /Windows/.test(ua);
  const browser = /Edg\//.test(ua) ? 'edge' : /Firefox\//.test(ua) ? 'firefox' : /Chrome\//.test(ua) && !/OPR|QQBrowser|Quark|360SE|360EE/.test(ua) ? 'chrome' : /Safari\//.test(ua) && !/Chrome|Chromium/.test(ua) ? 'safari' : 'other';
  const guides = {
    chrome: { address: 'chrome://settings/appearance', steps: ['在「外观」中开启「显示主页按钮」。', '选择自定义网址，粘贴拾隅主页链接。', '如需启动浏览器时也打开拾隅，在「启动时」中添加同一网址。'] },
    edge: { address: 'edge://settings/startHomeNTP', steps: ['进入「开始、主页和新建标签页」。', '在主页按钮设置中选择网址，粘贴拾隅主页链接并保存。', '如需启动时打开，在「Microsoft Edge 启动时」中添加同一网址。'] },
    firefox: { address: 'about:preferences#home', steps: ['在「主页」设置中找到「主页和新窗口」。', '选择「自定义网址」，粘贴拾隅主页链接。'] },
    safari: { address: '', steps: ['从 Safari 菜单打开「设置」，进入「通用」。', '在「主页」中粘贴拾隅主页链接。', '根据需要，将「新窗口打开方式」设为「主页」。'] },
    other: { address: '', steps: ['打开浏览器菜单，进入「设置」。', '找到「主页」或「启动时打开的页面」。', '选择自定义网址，粘贴拾隅主页链接并保存。'] }
  };
  function renderGuide() {
    const guide = guides[$('#setup-browser').value];
    let steps = guide.steps;
    let address = guide.address;
    if (isIOS) {
      steps = ['在 Safari 中打开拾隅主页。', '轻点分享按钮，选择「添加到主屏幕」。', '确认名称后添加，即可从主屏幕打开拾隅。'];
      address = '';
    } else if (isAndroid) {
      steps = ['在浏览器菜单中打开「设置」，找到「主页」。', '开启主页功能，选择自定义网址并粘贴拾隅主页链接。', '如果浏览器没有主页设置，可使用菜单中的「添加到主屏幕」。'];
      address = '';
    }
    $('#setup-steps').replaceChildren(...steps.map(text => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    }));
    $('#settings-address').textContent = address;
    $('.settings-address').hidden = !address;
    $('#open-settings').hidden = !address;
    $('#open-settings').href = address || HOME_URL;
    $('#home-instructions .setup-note').hidden = !address;
  }
  $('#setup-browser').value = browser;
  $('#setup-browser').addEventListener('change', renderGuide);
  $('#open-settings').addEventListener('click', () => {
    $('#setup-status').textContent = '若未打开，请在地址栏手动输入上方设置地址；然后回到这里复制主页链接。';
    // Keep this a real user-initiated link. Most browsers block websites from
    // navigating to privileged settings URLs; never claim that setup succeeded.
  });
  function renderDesktopGuide() {
    $('#download-shortcut').hidden = !isWindows;
    $('#desktop-note').hidden = !isWindows;
    if (isWindows) $('#desktop-help').textContent = '把拾隅放到桌面。下载快捷方式，之后双击就能直达你的个性首页。';
    else if (isIOS) $('#desktop-help').textContent = '先在 Safari 中打开拾隅主页，轻点「分享」→「添加到主屏幕」→「添加」。请使用上方主页链接。';
    else if (isAndroid) $('#desktop-help').textContent = '先打开拾隅主页，再从浏览器菜单选择「添加到主屏幕」，按照提示确认。请使用上方主页链接。';
    else $('#desktop-help').textContent = '先打开拾隅主页，将地址栏中的网址拖到桌面，即可创建快捷方式；也可从浏览器菜单选择「创建快捷方式」或「添加到程序坞」（若支持）。';
  }
  $$('[data-setup]').forEach(button => button.addEventListener('click', async () => {
    const request = ++setupRequest;
    const isHome = button.dataset.setup === 'home';
    returnFocus = button;
    $('#setup-title').textContent = isHome ? '将拾隅设为首页' : (isIOS || isAndroid) ? '将拾隅添加到主屏幕' : '将拾隅添加到桌面';
    $('#setup-intro').textContent = isHome ? '每次出发，从自己的首页开始。' : '让你的上网入口，触手可及。';
    $('#home-instructions').hidden = !isHome;
    $('#desktop-instructions').hidden = isHome;
    $('#home-url').value = HOME_URL;
    $('#setup-status').textContent = '正在复制拾隅主页链接…';
    renderGuide();
    renderDesktopGuide();
    dialog.showModal();
    const copied = await copyHome();
    if (request !== setupRequest || !dialog.open) return;
    $('#setup-status').textContent = copied ? '已复制拾隅主页链接。' : '未能自动复制，请选中上方主页链接，长按或按 Ctrl/Cmd+C 复制。';
  }));
  $('#copy-home').addEventListener('click', async () => {
    $('#setup-status').textContent = await copyHome() ? '已复制拾隅主页链接。' : '未能自动复制，请选中链接手动复制。';
  });
  $('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    ++setupRequest;
    returnFocus?.focus({ preventScroll: true });
  });
})();
