(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const clamp = value => Math.max(0, Math.min(1, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = t => t * t * (3 - 2 * t);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 901px)');
  const hero = $('.hero');
  const heroWindow = $('.hero-window');
  const heroCopy = $('.hero-copy');
  const heroImage = $('.hero-sea');
  const heroImmersion = $('.hero-immersion');
  const collection = $('.collection');
  const discover = $('.discover');
  const track = $('.discovery-track');
  const header = $('.site-header');
  const chapterNav = $('.chapter-nav');
  const sections = $$('[data-section]');
  const chapterLinks = $$('.chapter-nav a');
  const steps = $$('.collection-step');
  const workspace = $('.workspace-frame');
  const noteReading = $('.note-reading');
  const noteDesign = $('.note-design');
  const progress = $('.reading-progress>span');
  const discoveryProgress = $('.discovery-progress>span');
  let metrics = {}, currentY = window.scrollY, frame = 0, previousTime = 0;
  let sectionTops = [];
  let lastSection = -1, lastStep = -1;

  function measure() {
    ['top','left','width','height'].forEach(key => heroWindow.style.removeProperty(key));
    const bounds = heroWindow.getBoundingClientRect();
    const style = getComputedStyle(heroWindow);
    const viewportHeight = $('.hero-stage').clientHeight;
    metrics = {
      heroTop: hero.offsetTop,
      heroDistance: Math.max(1,hero.offsetHeight - viewportHeight),
      heroInitialTop: parseFloat(style.top),
      heroInitialLeft: parseFloat(style.left),
      heroInitialWidth: bounds.width,
      heroInitialHeight: bounds.height,
      width: document.documentElement.clientWidth,
      height: viewportHeight,
      collectionTop: collection.offsetTop,
      collectionDistance: Math.max(1,collection.offsetHeight - $('.collection-stage').clientHeight),
      discoverTop: discover.offsetTop,
      discoverDistance: Math.max(1,discover.offsetHeight - $('.discover-stage').clientHeight),
      trackDistance: Math.max(0,track.scrollWidth - $('.discovery-viewport').clientWidth + 2 * parseFloat(getComputedStyle($('.discovery-viewport')).paddingLeft)),
      pageDistance: Math.max(1,document.documentElement.scrollHeight - innerHeight)
    };
    sectionTops = sections.map(section => section.offsetTop);
    requestTick();
  }

  function renderMotion(y) {
    const motion = !reducedMotion.matches;
    let immersive = false;
    if (motion) {
      const p = clamp((y - metrics.heroTop) / metrics.heroDistance);
      const expansion = ease(clamp(p / .76));
      heroWindow.style.top = mix(metrics.heroInitialTop,0,expansion) + 'px';
      heroWindow.style.left = mix(metrics.heroInitialLeft,0,expansion) + 'px';
      heroWindow.style.width = mix(metrics.heroInitialWidth,metrics.width,expansion) + 'px';
      heroWindow.style.height = mix(metrics.heroInitialHeight,metrics.height,expansion) + 'px';
      heroImage.style.transform = `scale(${mix(1,1.065,expansion)})`;
      heroCopy.style.opacity = 1 - clamp(p / .3);
      heroCopy.style.transform = `translateY(${-p * 90}px)`;
      $('.scroll-cue').style.opacity = 1 - clamp(p / .13);
      const text = ease(clamp((p - .37) / .26));
      heroImmersion.style.opacity = text;
      heroImmersion.style.transform = `translateY(${(1 - text) * 30}px)`;
      $('.window-top').style.opacity = 1 - text;
      $('.window-caption').style.opacity = 1 - text;
      immersive = p > .68 && y < metrics.heroTop + hero.offsetHeight - innerHeight * .65;
    } else {
      heroWindow.removeAttribute('style');
      heroCopy.removeAttribute('style');
      heroImage.removeAttribute('style');
      heroImmersion.removeAttribute('style');
      $('.scroll-cue').removeAttribute('style');
      $('.window-top').removeAttribute('style');
      $('.window-caption').removeAttribute('style');
    }

    if (motion && desktop.matches) {
      const p = clamp((y - metrics.collectionTop) / metrics.collectionDistance);
      const t = ease(p);
      workspace.style.transform = `perspective(1600px) rotateY(${mix(-10,0,t)}deg) rotateX(${mix(5,0,t)}deg) translateY(${mix(10,-8,t)}px) scale(${mix(.95,1,t)})`;
      noteReading.style.transform = `translate(${mix(35,0,t)}px,${mix(-15,5,t)}px) rotate(${mix(7,0,t)}deg)`;
      noteDesign.style.transform = `translate(${mix(-30,8,t)}px,${mix(22,0,t)}px) rotate(${mix(-7,0,t)}deg)`;
      const step = Math.min(2,Math.floor(p * 3));
      if (step !== lastStep) { steps.forEach((el,i) => el.classList.toggle('is-current',i === step)); lastStep = step; }
      const d = clamp((y - metrics.discoverTop) / metrics.discoverDistance);
      track.style.transform = `translateX(${-ease(d) * metrics.trackDistance}px)`;
      discoveryProgress.style.transform = `scaleX(${mix(.12,1,d)})`;
    } else {
      workspace.style.removeProperty('transform');
      noteReading.style.removeProperty('transform');
      noteDesign.style.removeProperty('transform');
      track.style.removeProperty('transform');
      discoveryProgress.style.transform = 'scaleX(.35)';
    }

    const dark = immersive || (y + 65 >= discover.offsetTop && y + 65 < discover.offsetTop + discover.offsetHeight);
    header.classList.toggle('is-dark',dark);
    header.classList.toggle('is-scrolled',y > 40);
    chapterNav.classList.toggle('is-dark',immersive || (y + innerHeight / 2 >= discover.offsetTop && y + innerHeight / 2 < discover.offsetTop + discover.offsetHeight));
    progress.style.transform = `scaleX(${clamp(y / metrics.pageDistance)})`;
    let active = 0;
    sectionTops.forEach((top,i) => { if (y + innerHeight * .38 >= top) active = i; });
    if (active !== lastSection) {
      chapterLinks.forEach(link => link.removeAttribute('aria-current'));
      chapterLinks[active]?.setAttribute('aria-current','location');
      lastSection = active;
    }
  }

  function tick(now) {
    frame = 0;
    const target = window.scrollY;
    const delta = previousTime ? Math.min(64,now - previousTime) : 16;
    previousTime = now;
    const lag = reducedMotion.matches ? 1 : 1 - Math.exp(-delta / 65);
    currentY += (target - currentY) * lag;
    if (Math.abs(target - currentY) < .15) currentY = target;
    renderMotion(currentY);
    if (currentY !== target) requestTick();
  }
  function requestTick() { if (!frame) frame = requestAnimationFrame(tick); }
  addEventListener('scroll',requestTick,{passive:true});
  let resizeFrame;
  addEventListener('resize',() => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(measure); },{passive:true});
  reducedMotion.addEventListener('change',measure);
  desktop.addEventListener('change',measure);
  addEventListener('load',measure,{once:true});
  document.fonts?.ready.then(measure);

  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }),{threshold:.08,rootMargin:'0px 0px -20px 0px'});
  $$('.reveal').forEach(element => observer.observe(element));
  document.documentElement.classList.add('js-motion');
  $$('a[href^="#"]').forEach(link => link.addEventListener('click',event => {
    const id = link.getAttribute('href');
    const target = $(id);
    if (!target) return;
    event.preventDefault();
    history.replaceState(null,'',id);
    window.scrollTo({top:target.offsetTop,behavior:reducedMotion.matches?'instant':'smooth'});
    target.setAttribute('tabindex','-1');
    target.focus({preventScroll:true});
  }));
  $$('.discovery-card').forEach((card,index) => card.addEventListener('focus',() => {
    if (!desktop.matches || reducedMotion.matches) return;
    const rect = card.getBoundingClientRect();
    if (rect.left < 0 || rect.right > innerWidth) {
      const ratio = clamp(index / 3);
      scrollTo({top:metrics.discoverTop + ratio * metrics.discoverDistance,behavior:'instant'});
    }
  }));

  const bookmarks = [
    { name:'Figma', description:'设计与协作，让想法成形', path:'工作空间 / 日常工作 / 常用工具', keywords:'设计 工具 协作', url:'https://www.figma.com/', icon:'figma' },
    { name:'Pinterest', description:'收集让你停下来的画面', path:'灵感空间 / 设计灵感 / 视觉收藏', keywords:'设计 灵感 图片 摄影 生活', url:'https://www.pinterest.com/', icon:'pinterest' },
    { name:'Notion', description:'把笔记、计划与想法放在一起', path:'工作空间 / 日常工作 / 常用工具', keywords:'工作 笔记 工具 阅读', url:'https://www.notion.so/', icon:'notion' },
    { name:'豆瓣', description:'书、电影与生活的片刻', path:'生活空间 / 慢慢生活 / 留给自己', keywords:'阅读 生活 电影 音乐 书影音', url:'https://www.douban.com/', icon:'douban' },
    { name:'哔哩哔哩', description:'今天也发现一些有趣的东西', path:'生活空间 / 慢慢生活 / 留给自己', keywords:'视频 学习 生活 阅读', url:'https://www.bilibili.com/', icon:'bilibili' }
  ];
  let mode = 'saved';
  const searchInput = $('#demo-search');
  function showResults() {
    const root = $('.search-results');
    root.replaceChildren();
    const query = searchInput.value.trim().toLocaleLowerCase();
    if (mode === 'web') {
      const p = document.createElement('p');
      p.className = 'result-empty';
      p.textContent = '输入想了解的事，按回车，在新标签页探索。';
      root.append(p);
      return;
    }
    const matches = bookmarks.filter(item => !query || `${item.name} ${item.description} ${item.keywords}`.toLocaleLowerCase().includes(query)).slice(0,3);
    if (!matches.length) {
      const p = document.createElement('p');
      p.className = 'result-empty';
      p.textContent = '这份示例收藏里暂时没有，试试“设计”“阅读”或“生活”。';
      root.append(p);
    }
    matches.forEach(item => {
      const link = document.createElement('a');
      link.className = 'search-result'; link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      const icon = document.createElement('img'); icon.src = `./assets/icon-${item.icon}.svg`; icon.alt = ''; icon.width = 28; icon.height = 28;
      const words = document.createElement('div');
      const title = document.createElement('strong'); title.textContent = item.name;
      const description = document.createElement('small'); description.textContent = item.path;
      words.append(title,description);
      const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden','true');
      link.append(icon,words,arrow); root.append(link);
    });
  }
  const searchTabs = $$('[data-search-mode]');
  function selectSearch(button) {
    mode = button.dataset.searchMode;
    searchTabs.forEach(tab => { tab.setAttribute('aria-selected',String(tab === button)); tab.tabIndex = tab === button ? 0 : -1; });
    $('#search-panel').setAttribute('aria-labelledby',button.id);
    searchInput.placeholder = mode === 'saved' ? '找找设计、阅读或生活' : '从一个问题，开始探索';
    $('label[for="demo-search"]').textContent = mode === 'saved' ? '搜索示例收藏' : '搜索网页';
    $('#search-hint').textContent = mode === 'saved' ? '试着搜索：设计、阅读、生活' : '通过必应搜索，在新标签页打开';
    showResults();
  }
  searchTabs.forEach(button => button.addEventListener('click',() => selectSearch(button)));
  searchInput.addEventListener('input',showResults);
  $('.demo-search-form').addEventListener('submit',event => {
    event.preventDefault();
    if (mode === 'web' && searchInput.value.trim()) window.open(`https://www.bing.com/search?q=${encodeURIComponent(searchInput.value.trim())}`,'_blank','noopener,noreferrer');
    else showResults();
  });

  const themeData = {
    cinema:{name:'人生影院',poem:'今天这部电影，由你主演。'},
    music:{name:'黑胶唱片',poem:'把此刻，调到喜欢的频率。'},
    paper:{name:'时光报纸',poem:'你的世界，自成一版。'},
    cosmos:{name:'宇宙漫游',poem:'在浩瀚里，找到自己的坐标。'},
    flip:{name:'翻页时钟',poem:'看时间翻过，也让心慢下来。'},
    base:{name:'留白日常',poem:'留白之间，轻松开始。'}
  };
  const themeTabs = $$('[data-theme]');
  let selectedTheme = 'cinema', themeTicket = 0;
  const themeImage = $('#theme-image');
  const themePanel = $('#theme-panel');
  async function selectTheme(button) {
    const key = button.dataset.theme;
    if (key === selectedTheme) return;
    const ticket = ++themeTicket;
    const img = new Image(); img.src = `./assets/${key}.webp`;
    try { await img.decode(); } catch { return; }
    if (ticket !== themeTicket) return;
    selectedTheme = key;
    themeTabs.forEach(tab => { tab.setAttribute('aria-selected',String(tab === button)); tab.tabIndex = tab === button ? 0 : -1; });
    themePanel.setAttribute('aria-labelledby',button.id);
    themePanel.classList.add('is-changing');
    setTimeout(() => {
      if (ticket !== themeTicket) return;
      $('#theme-mobile-image').srcset = `./assets/${key}-mobile.webp`;
      themeImage.src = img.src; themeImage.alt = `${themeData[key].name}，拾隅真实首页界面`;
      $('#theme-count').textContent = `${String(themeTabs.indexOf(button)+1).padStart(2,'0')} / 06`;
      $('#theme-poem').textContent = themeData[key].poem;
      themePanel.classList.remove('is-changing');
    },reducedMotion.matches ? 0 : 170);
  }
  themeTabs.forEach(button => button.addEventListener('click',() => selectTheme(button)));
  function keyboardTabs(tabs, select) {
    tabs.forEach((button,index) => button.addEventListener('keydown',event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index+1)%tabs.length;
      else if (event.key === 'ArrowLeft') next = (index+tabs.length-1)%tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length-1;
      else return;
      event.preventDefault(); tabs[next].focus(); select(tabs[next]);
    }));
  }
  keyboardTabs(themeTabs,selectTheme);
  keyboardTabs(searchTabs,selectSearch);

  const dialog = $('.theme-dialog');
  $('.expand-theme').addEventListener('click',() => {
    $('#dialog-image').src = `./assets/${selectedTheme}${matchMedia('(max-width:540px)').matches?'-mobile':''}.webp`;
    $('#dialog-image').alt = `${themeData[selectedTheme].name}，拾隅真实首页界面`;
    $('#dialog-theme-name').textContent = themeData[selectedTheme].name;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  });
  $('.close-preview').addEventListener('click',() => dialog.close());
  dialog.addEventListener('close',() => { document.body.style.removeProperty('overflow'); $('.expand-theme').focus({preventScroll:true}); });
  dialog.addEventListener('click',event => {
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  showResults();
  measure();
})();
