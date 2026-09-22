/* Themed common collection; original dock art and space navigation are preserved. */
(() => {
  const uid = () => crypto.randomUUID();
  const glyph = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const CORNER_MODULES=Object.freeze({
    common:{id:'common',name:'我的收藏',subtitle:'把每天会用到的网址，留在手边',countLabel:'个网址',empty:'把常去的地方，收进来',emptyHint:'在原网址的编辑窗口中<br>选择「收进我的一隅」',addHint:'为常用的网址，再留一席',groups:['常用','灵感','阅读'],icon:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M8 8h8M8 12h5M8 16h8"/>'},
    todo:{id:'todo',name:'我的待办',subtitle:'把要做的事，放在眼前',countLabel:'项待办',empty:'把要做的事，收进来',emptyHint:'待办模块正在准备，你可以先建立自己的分组',addHint:'为待办，再留一席',groups:['今天','进行中','已完成'],icon:'<path d="m5 12 4 4L19 6"/><rect x="3" y="3" width="18" height="18" rx="4"/>'},
    memo:{id:'memo',name:'我的小记',subtitle:'把一闪而过的灵感，轻轻留下',countLabel:'条记录',empty:'把一闪而过的想法留下来',emptyHint:'小记模块正在准备，你可以先建立自己的分组',addHint:'为灵感，再留一席',groups:['灵感','随手记','待整理'],icon:'<path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2Z"/><path d="M8 9h8M8 13h5"/>'}
  });
  const CORNER_MODULE_SETTINGS=Object.freeze({
    common:{entryName:'我的收藏',panelName:'我的收藏',enabled:true},
    memo:{entryName:'我的小记',panelName:'我的小记',enabled:true},
    todo:{entryName:'我的待办',panelName:'我的待办',enabled:true}
  });
  let remoteCornerModules=null;
  const cornerModuleConfig=id=>({...CORNER_MODULES[id],...CORNER_MODULE_SETTINGS[id],...(remoteCornerModules?.[id]||{})});
  const enabledCornerModuleIds=()=>{const ids=Object.keys(CORNER_MODULE_SETTINGS).filter(id=>cornerModuleConfig(id).enabled!==false);return ids.length?ids:['common'];};
  window.ShiyuCornerModules={defaults:CORNER_MODULE_SETTINGS,config:cornerModuleConfig,enabled:enabledCornerModuleIds};
  const cardsIcon = glyph('<rect x="7" y="5" width="13" height="16" rx="3"/><path d="M4 17 2 5a2 2 0 0 1 2-2l10-1M11 10h5m-5 4h3"/>');
  const grip = glyph('<path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" stroke-width="3"/>');
  const drawings = [
    '<path d="M4 18 12 4l8 14H4ZM8 18l4-7 4 7M12 4v7"/>',
    '<circle cx="12" cy="12" r="6"/><ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(-30 12 12)"/>',
    '<path d="M3 18V8l9-4 9 4v10l-9 3-9-3ZM12 4v17M3 8l9 4 9-4"/>',
    '<path d="M3 17c5-12 13-12 18 0M5 19c4-9 10-9 14 0M8 21c2-6 6-6 8 0"/>'
  ];
  let panel, picker, origin, switchMenu, switchOrigin, entrySlot, entrySnapshot, entryAnchor, motionFrame=0;
  let activeModule='common',memoEditingId=null,memoFocusId=null,memoWheelLock=0;
  let cornerRevealAnimation=null, cornerClosing=false;
  let drag = null, swallowClickUntil = 0, inboxExpanded=null;
  const flipped=new Set(),coverOpen=new Set(),flipTimers=new WeakMap();
  const fanMotion={position:null,target:0,frame:0,last:0,tau:100};
  const ADD_CARD="__corner_add__";
  const moduleMeta=()=>cornerModuleConfig(activeModule)||cornerModuleConfig('common');
  const moduleIcon=id=>{const icon=cornerModuleConfig(id)?.icon;if(icon&&/^(?:data:image\/(?:png|svg\+xml);base64,|https?:\/\/)/i.test(icon))return '<img class="corner-config-icon" src="'+String(icon).replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'" alt="" aria-hidden="true">';return glyph(cornerModuleConfig(id)?.icon||CORNER_MODULES.common.icon);};
  async function loadCornerConfig(){
    try{
      const response=await fetch('/api/shiyu/operations',{credentials:'include',cache:'no-store'});
      if(!response.ok)return;
      const data=await response.json();const modules=Array.isArray(data?.corner?.modules)?data.corner.modules:[];
      if(!modules.length)return;
      remoteCornerModules=Object.fromEntries(modules.map(module=>[module.id,{enabled:module.enabled!==false,entryName:String(module.entryName||'').trim(),panelName:String(module.panelName||'').trim(),icon:typeof module.icon==='string'?module.icon:''}]));
      if(!enabledCornerModuleIds().includes(activeModule))activeModule=enabledCornerModuleIds()[0]||'common';
      refreshOrbitPreview();
    }catch{}
  }
  const cornerTheme=()=>({wallfilm:'projection',surge:'flow'}[dockTheme()]||dockTheme());
  // The collection keeps one interaction engine and swaps only this visual skin.
  // `depth` is deliberately explicit so each future theme can choose flat or layered cards.
  const CORNER_THEME_SKINS={
    base:{depth:'flat',object:'paper',art:'line',cover:'paper',flip:'soft'},
    paper:{depth:'flat',object:'newspaper',art:'masthead',cover:'newspaper',flip:'soft'},
    reading:{depth:'depth',object:'book',art:'book',cover:'book',flip:'book'},
    music:{depth:'depth',object:'record',art:'record',cover:'sleeve',flip:'record'},
    cinema:{depth:'depth',object:'film',art:'film',cover:'film',flip:'film'},
    projection:{depth:'depth',object:'screen',art:'screen',cover:'screen',flip:'screen'},
    cosmos:{depth:'depth',object:'orbit',art:'orbit',cover:'constellation',flip:'orbit'},
    flip:{depth:'flat',object:'calendar',art:'calendar',cover:'calendar',flip:'soft'},
    rain:{depth:'depth',object:'rain',art:'rain',cover:'rain',flip:'rain'},
    flow:{depth:'flat',object:'wave',art:'wave',cover:'wave',flip:'soft'},
    poly:{depth:'flat',object:'poly',art:'poly',cover:'poly',flip:'soft'}
  };
  const cornerThemeSkin=()=>CORNER_THEME_SKINS[cornerTheme()]||CORNER_THEME_SKINS.base;
  const cornerThemeArt=()=>({
    line:'<path d="M6 24c10-15 19-15 28 0s18 15 28 0"/><path d="M47 9v12m-6-6h12"/><circle cx="18" cy="11" r="4"/>',
    masthead:'<rect x="7" y="7" width="54" height="32" rx="2"/><path d="M12 14h44M12 19h44M12 26h22m6 0h16M12 32h44"/>',
    book:'<path d="M7 9c7-4 14-4 25 0v34c-11-4-18-4-25 0zM57 9c-7-4-14-4-25 0v34c11-4 18-4 25 0zM32 9v34"/>',
    record:'<circle cx="32" cy="25" r="20"/><circle cx="32" cy="25" r="13"/><circle cx="32" cy="25" r="4"/><path d="M50 7v18l-10 5"/>',
    film:'<rect x="7" y="10" width="50" height="30" rx="3"/><path d="M7 18h50M7 32h50M18 10v8m12-8v8m12-8v8M18 32v8m12-8v8m12-8v8"/>',
    screen:'<rect x="8" y="8" width="48" height="32" rx="2"/><path d="m17 32 10-11 8 8 6-5 7 8M27 40v8m-7 0h14"/>',
    orbit:'<circle cx="32" cy="25" r="8"/><ellipse cx="32" cy="25" rx="27" ry="10" transform="rotate(-22 32 25)"/><circle cx="53" cy="12" r="2"/>',
    calendar:'<rect x="10" y="8" width="44" height="36" rx="4"/><path d="M10 18h44M20 5v8m24-8v8M21 27h4m7 0h4m7 0h4M21 35h4m7 0h4"/>',
    rain:'<path d="M18 8v13m14-17v17m14-13v13M13 32l-4 10m18-10-4 10m18-10-4 10"/>',
    wave:'<path d="M5 18c9-13 18-13 27 0s18 13 27 0M5 30c9-13 18-13 27 0s18 13 27 0"/>',
    poly:'<path d="m32 6 23 14v10L32 44 9 30V20zM9 20l23 14 23-14M32 34v10"/>'
  })[cornerThemeSkin().art]||'';
  function syncCornerThemePresentation(){
    if(!panel)return;
    const skin=cornerThemeSkin();panel.dataset.cornerTheme=cornerTheme();panel.dataset.cornerDepth=skin.depth;panel.dataset.cornerObject=skin.object;
    const art=panel.querySelector('.corner-theme-art');if(art)art.innerHTML='<svg viewBox="0 0 64 50" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+cornerThemeArt()+'</svg>';
  }
  const cardLimit=()=>window.ShiyuEntitlements?.limit('corner')??null;
  const isInbox=g=>g?.system==='inbox';
  const customCount=()=>collection().groups.filter(g=>!isInbox(g)).length;
  function newCardMarkup(){const count=customCount(),limit=activeModule==='common'?cardLimit():null,full=limit!==null&&count>=limit,meta=moduleMeta();return '<article class="corner-card corner-add-card" data-corner-add-card><button data-corner-new aria-label="新增卡片">'+glyph('<path d="M12 5v14M5 12h14"/>')+'<span>新增卡片</span><small>'+(limit===null&&activeModule==='common'?'正在读取卡片额度':full?'已使用 '+count+' 张 · 当前额度 '+limit+' 张':meta.addHint)+'</small></button></article>';}
  function showCardLimit(){memberGate('corner');}
  const cardColors=[{id:"sage",name:"松绿",light:"#e7efe9",dark:"#243c34",ink:"#243e32",night:"#ebf4ef",accent:"#587b64"},{id:"blue",name:"雾蓝",light:"#e6edf6",dark:"#26394f",ink:"#283e57",night:"#edf3fc",accent:"#597da6"},{id:"rose",name:"蔷薇",light:"#f5e7eb",dark:"#4b303d",ink:"#573440",night:"#fceef3",accent:"#aa6a83"},{id:"sand",name:"麦色",light:"#f4eddc",dark:"#433c2c",ink:"#51452c",night:"#f8f1df",accent:"#9c8350"},{id:"violet",name:"浅紫",light:"#ede9f6",dark:"#39334e",ink:"#413653",night:"#f3effc",accent:"#8770ab"},{id:"slate",name:"石墨",light:"#e9edef",dark:"#303a40",ink:"#303d45",night:"#edf3f6",accent:"#687f8c"}];
  const memberBadge=()=>'<span class="corner-member-badge" title="会员专享" aria-label="会员专享">'+MEMBER_VISUAL_CONFIG.badge+'</span>';
  let activeId=null,wheelLast=0,wheelConsumed=false,wheelSum=0,wheelLock=0,swipe=null;
  let cardAudio,cardNoise,lastSound=0,fastTimer;
  function prepareCardAudio(){try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;cardAudio??=new Audio();if(cardAudio.state==='suspended')cardAudio.resume().catch(()=>{});}catch{}}
  function playCardSound(){
    prepareCardAudio();if(!cardAudio||cardAudio.state==='closed')return;
    const emit=(level=1)=>{
    const ctx=cardAudio,t=ctx.currentTime;
    // A dry ratchet click: a short tooth impact plus a very light paper-like tail.
    const hit=ctx.createOscillator(),envelope=ctx.createGain();hit.type='triangle';hit.frequency.setValueAtTime(1450,t);hit.frequency.exponentialRampToValueAtTime(420,t+.025);envelope.gain.setValueAtTime(.001,t);envelope.gain.linearRampToValueAtTime(.055*level,t+.002);envelope.gain.exponentialRampToValueAtTime(.001,t+.045);hit.connect(envelope).connect(ctx.destination);hit.start(t);hit.stop(t+.05);hit.onended=()=>{hit.disconnect();envelope.disconnect();};
    if(!cardNoise){cardNoise=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.045),ctx.sampleRate);const samples=cardNoise.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;}
    const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=cardNoise;filter.type='highpass';filter.frequency.value=1800;gain.gain.setValueAtTime(.018*level,t);gain.gain.exponentialRampToValueAtTime(.001,t+.035);source.connect(filter).connect(gain).connect(ctx.destination);source.start(t);source.stop(t+.045);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
    };
    if(cardAudio.state==='suspended'){
      // Schedule the click while suspended, then resume. Web Audio keeps the
      // nodes queued, so the first wheel gesture is audible too.
      emit(.48);
      cardAudio.resume().catch(()=>{});
    }else emit();
  }
  const libraryIcons=[['Briefcase','工作'],['BookOpen','阅读'],['Globe','世界'],['Lightbulb','灵感'],['Code','开发'],['Palette','设计'],['Camera','摄影'],['Music','音乐'],['Film','电影'],['Heart','喜欢'],['Star','星标'],['Coffee','生活'],['Plane','旅行'],['Gamepad2','游戏'],['Rocket','探索'],['Compass','方向'],['Leaf','自然'],['Mountain','山川'],['Sun','日光'],['Moon','月色'],['Folder','文件'],['Laptop','工具'],['NotebookPen','笔记'],['GraduationCap','学习']].map(([id,name])=>({id:'lib-'+id,name})).filter(x=>ENTITY_ICONS[x.id]);
  const themeIconSets={"base":"House Coffee Heart Leaf Sun BookOpen Briefcase Star Compass Mountain Flower Camera Bike Globe Music Lightbulb Folder Pen Map TrainFront","music":"Disc Disc3 Music Headphones Mic Radio Guitar Piano Drum Speaker Volume2 Play Film BookOpen Coffee Heart Star Camera Tv Clapperboard","reading":"BookOpen Book Library BookMarked Bookmark NotebookPen ScrollText Pen Pencil GraduationCap Languages School Lamp Coffee Leaf Flower Globe Newspaper Lightbulb Archive","flow":"Waves Droplets Wind Shapes Circle Triangle Hexagon Pentagon Square Component Spline Layers Atom Magnet Snowflake CloudSnow Rainbow Star Leaf Fish","poly":"Triangle Hexagon Pentagon Square Circle Shapes Component Layers Gem Spline Ruler PenTool Palette Brush Pipette Mountain Building2 Rocket Flag Target","cosmos":"Globe Star Moon Sun Telescope Rocket Atom Compass Navigation Cloud Sunrise Sunset Mountain Waves Magnet FlaskConical Lightbulb Plane Map Circle","flip":"AlarmClock Calendar Notebook Clipboard Pen Book Sunrise Sunset Sun Moon Archive BookMarked NotebookPen Files Stamp Calculator Target Activity Coffee Briefcase","rain":"CloudRain Droplets Umbrella Cloud CloudLightning Wind Waves Rainbow CloudSnow Snowflake Leaf Flower Sprout TreePine Coffee BookOpen Lamp Moon Sun Fish","projection":"Presentation Monitor Video Film Camera Tv Play Lightbulb Sun Moon Star Palette Layers Shapes Spline Circle Triangle Music Speaker BookOpen","cinema":"Clapperboard Film Video Camera Tv Play Popcorn Disc Mic Speaker Music Headphones Star Heart BookOpen Award Wine Coffee Plane Globe","paper":"Newspaper FileText Files Pen Pencil NotebookPen BookOpen BookMarked ScrollText Stamp Archive Clipboard Calendar Printer Scan Languages Globe Coffee Camera Bookmark"};
  const themeIconNames={"House":"居所","Coffee":"咖啡","Heart":"心意","Leaf":"绿叶","Sun":"日光","BookOpen":"阅读","Briefcase":"工作","Star":"星辰","Compass":"指南","Mountain":"山川","Flower":"花朵","Camera":"影像","Bike":"骑行","Globe":"世界","Music":"旋律","Lightbulb":"灵感","Folder":"文件","Pen":"钢笔","Map":"地图","TrainFront":"列车","Disc":"唱片","Disc3":"光碟","Headphones":"耳机","Mic":"麦克风","Radio":"电台","Guitar":"吉他","Piano":"钢琴","Drum":"鼓点","Speaker":"音箱","Volume2":"音量","Play":"播放","Film":"胶片","Tv":"银幕","Clapperboard":"场记","Book":"书本","Library":"书库","BookMarked":"书签册","Bookmark":"书签","NotebookPen":"手记","ScrollText":"书卷","Pencil":"铅笔","GraduationCap":"学业","Languages":"语言","School":"校园","Lamp":"台灯","Newspaper":"报刊","Archive":"归档","Waves":"水波","Droplets":"水滴","Wind":"微风","Shapes":"形态","Circle":"圆形","Triangle":"三角","Hexagon":"六边形","Pentagon":"五边形","Square":"方形","Component":"构件","Spline":"曲线","Layers":"层叠","Atom":"原子","Magnet":"磁场","Snowflake":"雪花","CloudSnow":"落雪","Rainbow":"彩虹","Fish":"游鱼","Gem":"晶石","Ruler":"尺度","PenTool":"钢笔工具","Palette":"调色","Brush":"画刷","Pipette":"取色","Building2":"建筑","Rocket":"火箭","Flag":"旗帜","Target":"目标","Moon":"月亮","Telescope":"望远镜","Navigation":"航向","Cloud":"云朵","Sunrise":"日出","Sunset":"日落","FlaskConical":"实验","Plane":"飞机","AlarmClock":"时钟","Calendar":"日历","Notebook":"笔记","Clipboard":"记录","Files":"文档集","Stamp":"印章","Calculator":"计算","Activity":"脉动","CloudRain":"落雨","Umbrella":"雨伞","CloudLightning":"雷雨","Sprout":"萌芽","TreePine":"松树","Presentation":"投影","Monitor":"显示器","Video":"视频","Popcorn":"爆米花","Award":"奖章","Wine":"红酒","FileText":"文稿","Printer":"打印","Scan":"扫描"};
  // Existing Tabler Icons 3.31.0 paths (MIT); notice: assets/licenses/tabler-icons-MIT.txt.
  const themeDrawings={"cosmos":[["太阳","<path d=\"M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0\" />\n  <path d=\"M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7\" />"],["水星","<circle cx=\"12\" cy=\"12\" r=\"8\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"M14 6h2m-3 8 3 2m-9-2 1 2\"/>"],["金星","<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M7 7c5 4 6-2 10 2M5 12c6 3 7-2 14 2M8 17c3-2 6 1 8 0\"/>"],["地球","<path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0\" />\n  <path d=\"M3.6 9h16.8\" />\n  <path d=\"M3.6 15h16.8\" />\n  <path d=\"M11.5 3a17 17 0 0 0 0 18\" />\n  <path d=\"M12.5 3a17 17 0 0 1 0 18\" />"],["月球","<path d=\"M16.418 4.157a8 8 0 0 0 0 15.686\" />\n  <path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\" />"],["火星","<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"m8 6 3 3-3 3 3 2m4-8 2 4-3 3 2 5M6 16l2 1\"/>"],["木星","<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M6 7h12M4 11h16M5 15h7m5 0h2M8 18h8\"/><ellipse cx=\"15\" cy=\"15\" rx=\"3\" ry=\"1.5\"/>"],["土星","<path d=\"M18.816 13.58c2.292 2.138 3.546 4 3.092 4.9c-.745 1.46 -5.783 -.259 -11.255 -3.838c-5.47 -3.579 -9.304 -7.664 -8.56 -9.123c.464 -.91 2.926 -.444 5.803 .805\" />\n  <path d=\"M12 12m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0\" />"],["天王星","<circle cx=\"12\" cy=\"12\" r=\"6\"/><ellipse cx=\"12\" cy=\"12\" rx=\"3\" ry=\"11\" transform=\"rotate(22 12 12)\"/>"],["海王星","<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M6 9c4 3 8-3 12 0M5 14c4 3 10-3 14 0M8 17h8\"/>"],["冥王星","<circle cx=\"11\" cy=\"13\" r=\"7\"/><path d=\"M7 10c1-3 4-1 4 0 0-2 4-3 4 0 0 2-4 5-4 5s-4-3-4-5Z\"/><circle cx=\"20\" cy=\"4\" r=\"2\"/>"],["彗星","<path d=\"M15.5 18.5l-3 1.5l.5 -3.5l-2 -2l3 -.5l1.5 -3l1.5 3l3 .5l-2 2l.5 3.5z\" />\n  <path d=\"M4 4l7 7\" />\n  <path d=\"M9 4l3.5 3.5\" />\n  <path d=\"M4 9l3.5 3.5\" />"],["流星","<path d=\"M21 3l-5 9h5l-6.891 7.086a6.5 6.5 0 1 1 -8.855 -9.506l7.746 -6.58l-1 5l9 -5z\" />\n  <path d=\"M9.5 14.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0\" />"],["小行星","<path d=\"m7 3 9 1 5 7-3 8-9 2-6-8 4-10Z\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"m13 13 4 2-2 3M6 15h1\"/>"],["行星轨道","<path d=\"M7.027 11.477a5 5 0 1 0 5.496 -4.45a4.951 4.951 0 0 0 -3.088 .681\" />\n  <path d=\"M5.636 5.636a9 9 0 1 0 3.555 -2.188\" />\n  <path d=\"M18 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />\n  <path d=\"M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />\n  <path d=\"M9 16m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />"],["银河","<path d=\"M12 3c-1.333 1 -2 2.5 -2 4.5c0 3 2 4.5 2 4.5s2 1.5 2 4.5c0 2 -.667 3.5 -2 4.5\" />\n  <path d=\"M19.794 16.5c-.2 -1.655 -1.165 -2.982 -2.897 -3.982c-2.597 -1.5 -4.897 -.518 -4.897 -.518s-2.299 .982 -4.897 -.518c-1.732 -1 -2.698 -2.327 -2.897 -3.982\" />\n  <path d=\"M19.794 7.5c-1.532 -.655 -3.165 -.482 -4.897 .518c-2.597 1.5 -2.897 3.982 -2.897 3.982s-.299 2.482 -2.897 3.982c-1.732 1 -3.365 1.173 -4.897 .518\" />"],["星云","<path d=\"M17.8 19.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z\" />\n  <path d=\"M6.2 19.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z\" />\n  <path d=\"M12 9.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z\" />"],["双星","<circle cx=\"8\" cy=\"10\" r=\"4\"/><circle cx=\"17\" cy=\"15\" r=\"3\"/><path d=\"M3 17c3 5 15 6 18-3M6 3c6-3 13 1 15 6\"/>"],["月相","<path d=\"M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z\" />\n  <path d=\"M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2\" />\n  <path d=\"M19 11h2m-1 -1v2\" />"],["星座","<circle cx=\"5\" cy=\"5\" r=\"2\"/><circle cx=\"18\" cy=\"7\" r=\"2\"/><circle cx=\"10\" cy=\"13\" r=\"2\"/><circle cx=\"17\" cy=\"21\" r=\"1.5\"/><path d=\"m7 5 9 2m-1 2-3 3m-1 3 5 5M4 7l5 4\"/>"]],"paper":[["日报","<path d=\"M16 6h3a1 1 0 0 1 1 1v11a2 2 0 0 1 -4 0v-13a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1v12a3 3 0 0 0 3 3h11\" />\n  <path d=\"M8 8l4 0\" />\n  <path d=\"M8 12l4 0\" />\n  <path d=\"M8 16l4 0\" />"],["双栏报","<path d=\"M3 4m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M7 8h10\" />\n  <path d=\"M7 12h10\" />\n  <path d=\"M7 16h10\" />"],["刊物","<path d=\"M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0\" />\n  <path d=\"M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0\" />\n  <path d=\"M3 6l0 13\" />\n  <path d=\"M12 6l0 13\" />\n  <path d=\"M21 6l0 13\" />"],["特刊","<path d=\"M19 4v16h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12z\" />\n  <path d=\"M19 16h-12a2 2 0 0 0 -2 2\" />\n  <path d=\"M9 8h6\" />"],["报刊集","<path d=\"M5 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M9 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M5 8h4\" />\n  <path d=\"M9 16h4\" />\n  <path d=\"M13.803 4.56l2.184 -.53c.562 -.135 1.133 .19 1.282 .732l3.695 13.418a1.02 1.02 0 0 1 -.634 1.219l-.133 .041l-2.184 .53c-.562 .135 -1.133 -.19 -1.282 -.732l-3.695 -13.418a1.02 1.02 0 0 1 .634 -1.219l.133 -.041z\" />\n  <path d=\"M14 9l4 -1\" />\n  <path d=\"M16 16l3.923 -.98\" />"],["手记","<path d=\"M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-11a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1m3 0v18\" />\n  <path d=\"M13 8l2 0\" />\n  <path d=\"M13 12l2 0\" />"],["札记","<path d=\"M5 3m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M9 7l6 0\" />\n  <path d=\"M9 11l6 0\" />\n  <path d=\"M9 15l4 0\" />"],["便笺","<path d=\"M13 20l7 -7\" />\n  <path d=\"M13 20v-6a1 1 0 0 1 1 -1h6v-7a2 2 0 0 0 -2 -2h-12a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7\" />"],["文稿","<path d=\"M14 3v4a1 1 0 0 0 1 1h4\" />\n  <path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z\" />\n  <path d=\"M9 9l1 0\" />\n  <path d=\"M9 13l6 0\" />\n  <path d=\"M9 17l6 0\" />"],["专题","<path d=\"M14 3v4a1 1 0 0 0 1 1h4\" />\n  <path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z\" />\n  <path d=\"M9 17h6\" />\n  <path d=\"M9 13h6\" />"],["排印","<path d=\"M14 3v4a1 1 0 0 0 1 1h4\" />\n  <path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z\" />\n  <path d=\"M11 18h2\" />\n  <path d=\"M12 18v-7\" />\n  <path d=\"M9 12v-1h6v1\" />"],["社论","<path d=\"M14 3v4a1 1 0 0 0 1 1h4\" />\n  <path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z\" />\n  <path d=\"M10 18l5 -5a1.414 1.414 0 0 0 -2 -2l-5 5v2h2z\" />"],["剪报集","<path d=\"M15 3v4a1 1 0 0 0 1 1h4\" />\n  <path d=\"M18 17h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h4l5 5v7a2 2 0 0 1 -2 2z\" />\n  <path d=\"M16 17v2a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2\" />"],["采编","<path d=\"M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2\" />\n  <path d=\"M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M9 12h6\" />\n  <path d=\"M9 16h6\" />"],["档案","<path d=\"M3 4m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-10\" />\n  <path d=\"M10 12l4 0\" />"],["书签","<path d=\"M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z\" />"],["藏刊","<path d=\"M15 10v11l-5 -3l-5 3v-11a3 3 0 0 1 3 -3h4a3 3 0 0 1 3 3z\" />\n  <path d=\"M11 3h5a3 3 0 0 1 3 3v11\" />"],["周刊","<path d=\"M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z\" />\n  <path d=\"M16 3v4\" />\n  <path d=\"M8 3v4\" />\n  <path d=\"M4 11h16\" />\n  <path d=\"M7 14h.013\" />\n  <path d=\"M10.01 14h.005\" />\n  <path d=\"M13.01 14h.005\" />\n  <path d=\"M16.015 14h.005\" />\n  <path d=\"M13.015 17h.005\" />\n  <path d=\"M7.01 17h.005\" />\n  <path d=\"M10.01 17h.005\" />"],["信笺","<path d=\"M3 9l9 6l9 -6l-9 -6l-9 6\" />\n  <path d=\"M21 9v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10\" />\n  <path d=\"M3 19l6 -6\" />\n  <path d=\"M15 13l6 6\" />"],["印刷","<path d=\"M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2\" />\n  <path d=\"M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4\" />\n  <path d=\"M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z\" />"]]};
  // Tabler Icons 3.31.0 (MIT), bundled SVG paths; no runtime downloads.
  const cornerIconCatalog={"base":[{"id":"car","name":"轿车"},{"id":"bus","name":"公交车"},{"id":"motorbike","name":"摩托车"},{"id":"bike","name":"自行车"},{"id":"scooter","name":"滑板车"},{"id":"moped","name":"轻便摩托"},{"id":"tir","name":"货运卡车"},{"id":"truck","name":"卡车"},{"id":"truck-delivery","name":"配送车"},{"id":"ambulance","name":"救护车"},{"id":"firetruck","name":"消防车"},{"id":"tractor","name":"拖拉机"},{"id":"train","name":"火车"},{"id":"caravan","name":"房车"},{"id":"plane","name":"飞机"},{"id":"helicopter","name":"直升机"},{"id":"sailboat","name":"帆船"},{"id":"ship","name":"轮船"},{"id":"submarine","name":"潜水艇"},{"id":"air-balloon","name":"热气球"}],"music":[{"id":"music","name":"音符"},{"id":"vinyl","name":"黑胶唱片"},{"id":"headphones","name":"耳机"},{"id":"microphone","name":"麦克风"},{"id":"microphone-2","name":"演唱话筒"},{"id":"radio","name":"收音机"},{"id":"guitar-pick","name":"拨片"},{"id":"piano","name":"钢琴"},{"id":"device-speaker","name":"音箱"},{"id":"device-airpods","name":"无线耳机"},{"id":"playlist","name":"播放列表"},{"id":"music-heart","name":"喜欢的音乐"},{"id":"music-plus","name":"添加乐曲"},{"id":"music-search","name":"寻找音乐"},{"id":"music-bolt","name":"节拍"},{"id":"metronome","name":"节拍器"},{"id":"volume","name":"音量"},{"id":"adjustments","name":"调音台"},{"id":"player-record","name":"录音"},{"id":"wave-sine","name":"声波"}],"flow":[{"id":"cube","name":"立方体"},{"id":"sphere","name":"球体"},{"id":"pyramid","name":"四棱锥"},{"id":"cone","name":"圆锥"},{"id":"cylinder","name":"圆柱"},{"id":"prism","name":"棱柱"},{"id":"hexagon","name":"六边形"},{"id":"pentagon","name":"五边形"},{"id":"square","name":"正方形"},{"id":"triangle","name":"三角形"},{"id":"circle","name":"圆形"},{"id":"octagon","name":"八边形"},{"id":"rectangle","name":"矩形"},{"id":"oval","name":"椭圆"},{"id":"diamond","name":"菱形"},{"id":"triangle-inverted","name":"倒三角"},{"id":"cube-unfolded","name":"展开立方体"},{"id":"cone-2","name":"倒圆锥"},{"id":"circles","name":"圆形组合"},{"id":"squares","name":"方形组合"}],"reading":[{"id":"book","name":"书本"},{"id":"book-2","name":"书册"},{"id":"books","name":"书架"},{"id":"book-download","name":"下载书籍"},{"id":"book-upload","name":"上传书籍"},{"id":"text-size","name":"字号"},{"id":"text-recognition","name":"文字识别"},{"id":"highlight","name":"阅读标注"},{"id":"bookmark-plus","name":"添加书签"},{"id":"bookmark","name":"书签"},{"id":"bookmarks","name":"多重书签"},{"id":"bookmark-edit","name":"标注书签"},{"id":"notebook","name":"读书笔记"},{"id":"notes","name":"阅读札记"},{"id":"vocabulary","name":"词汇"},{"id":"bookmark-question","name":"阅读疑问"},{"id":"alphabet-latin","name":"字母"},{"id":"language","name":"语言"},{"id":"eyeglass","name":"阅读眼镜"},{"id":"lamp","name":"阅读灯"}],"flip":[{"id":"clock","name":"时钟"},{"id":"alarm","name":"闹钟"},{"id":"hourglass","name":"沙漏"},{"id":"calendar","name":"日历"},{"id":"stopwatch","name":"秒表"},{"id":"device-watch","name":"腕表"},{"id":"calendar-event","name":"纪念日"},{"id":"calendar-week","name":"周历"},{"id":"calendar-month","name":"月历"},{"id":"calendar-time","name":"日程时间"},{"id":"history","name":"时光回溯"},{"id":"timeline","name":"时间线"},{"id":"hours-24","name":"全天"},{"id":"hourglass-high","name":"流逝"},{"id":"hourglass-low","name":"余时"},{"id":"clock-24","name":"二十四时"},{"id":"calendar-clock","name":"日程时钟"},{"id":"alarm-snooze","name":"小憩"},{"id":"clock-hour-3","name":"三点时刻"},{"id":"clock-hour-9","name":"九点时刻"}],"rain":[{"id":"cloud-rain","name":"落雨"},{"id":"umbrella","name":"雨伞"},{"id":"droplet","name":"雨滴"},{"id":"cloud","name":"云朵"},{"id":"cloud-storm","name":"雷雨"},{"id":"wind","name":"微风"},{"id":"ripple","name":"涟漪"},{"id":"rainbow","name":"彩虹"},{"id":"cloud-snow","name":"落雪"},{"id":"snowflake","name":"雪花"},{"id":"leaf","name":"叶片"},{"id":"flower","name":"花朵"},{"id":"plant","name":"绿植"},{"id":"tree","name":"树木"},{"id":"seedling","name":"幼苗"},{"id":"mountain","name":"山峦"},{"id":"sunrise","name":"日出"},{"id":"sunset","name":"日落"},{"id":"mist","name":"薄雾"},{"id":"windmill","name":"风车"}],"projection":[{"id":"device-projector","name":"投影仪"},{"id":"presentation","name":"放映幕"},{"id":"presentation-analytics","name":"演示幕"},{"id":"device-tv","name":"电视"},{"id":"device-tv-old","name":"复古电视"},{"id":"device-desktop","name":"桌面屏幕"},{"id":"device-desktop-analytics","name":"监视器"},{"id":"device-laptop","name":"笔记本"},{"id":"device-tablet","name":"平板"},{"id":"device-mobile","name":"手机"},{"id":"device-imac","name":"一体屏"},{"id":"device-vision-pro","name":"头显"},{"id":"device-cctv","name":"摄像头"},{"id":"video","name":"摄录"},{"id":"video-plus","name":"添加视频"},{"id":"video-minus","name":"视频片段"},{"id":"cast","name":"投屏"},{"id":"screen-share","name":"共享屏幕"},{"id":"picture-in-picture","name":"画中画"},{"id":"device-computer-camera","name":"电脑摄像头"}],"cinema":[{"id":"movie","name":"电影胶片"},{"id":"device-remote","name":"遥控器"},{"id":"camera","name":"摄影机"},{"id":"camera-up","name":"拍摄"},{"id":"camera-down","name":"取景"},{"id":"camera-bolt","name":"闪光摄影"},{"id":"camera-cog","name":"摄影设置"},{"id":"camera-spark","name":"影像创作"},{"id":"camera-rotate","name":"转动镜头"},{"id":"photo-video","name":"影像画面"},{"id":"ticket","name":"电影票"},{"id":"chair-director","name":"导演椅"},{"id":"masks-theater","name":"戏剧面具"},{"id":"armchair","name":"影院座椅"},{"id":"badge-hd","name":"高清电影"},{"id":"badge-4k","name":"超清电影"},{"id":"badge-3d","name":"立体电影"},{"id":"aspect-ratio","name":"画幅"},{"id":"player-play","name":"播放电影"},{"id":"disc","name":"电影光盘"}],"paper":[{"id":"news","name":"新闻报纸"},{"id":"article","name":"新闻文章"},{"id":"file-text","name":"文字稿"},{"id":"file-description","name":"报道"},{"id":"file-typography","name":"排版"},{"id":"file-pencil","name":"编辑稿"},{"id":"files","name":"稿件集"},{"id":"clipboard-text","name":"采访记录"},{"id":"printer","name":"印刷机"},{"id":"typography","name":"铅字"},{"id":"writing","name":"撰稿"},{"id":"writing-sign","name":"签名"},{"id":"pencil","name":"铅笔"},{"id":"ballpen","name":"圆珠笔"},{"id":"rubber-stamp","name":"印章"},{"id":"mail-opened","name":"读者来信"},{"id":"mail","name":"信件"},{"id":"send","name":"传播"},{"id":"rss","name":"新闻订阅"},{"id":"broadcast","name":"广播"}],"poly":[{"id":"polygon","name":"多边形"},{"id":"lasso-polygon","name":"多边选区"},{"id":"shape","name":"构形"},{"id":"shape-2","name":"组合形"},{"id":"shape-3","name":"轮廓形"},{"id":"artboard","name":"画板"},{"id":"color-swatch","name":"色卡"},{"id":"palette","name":"调色板"},{"id":"brush","name":"画刷"},{"id":"vector-bezier-arc","name":"弧线节点"},{"id":"vector","name":"矢量"},{"id":"vector-triangle","name":"矢量三角"},{"id":"vector-bezier","name":"贝塞尔曲线"},{"id":"vector-bezier-2","name":"曲线节点"},{"id":"vector-spline","name":"样条曲线"},{"id":"geometry","name":"几何线稿"},{"id":"pentagram","name":"五角构图"},{"id":"hexagons","name":"六边组合"},{"id":"hexagonal-prism","name":"六棱柱"},{"id":"diamonds","name":"菱形组合"}]};
  const cornerIconPaths={"car":"<path d=\"M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5\" />","bus":"<path d=\"M6 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M18 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M4 17h-2v-11a1 1 0 0 1 1 -1h14a5 7 0 0 1 5 7v5h-2m-4 0h-8\" />\n  <path d=\"M16 5l1.5 7l4.5 0\" />\n  <path d=\"M2 10l15 0\" />\n  <path d=\"M7 5l0 5\" />\n  <path d=\"M12 5l0 5\" />","motorbike":"<path d=\"M5 16m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0\" />\n  <path d=\"M19 16m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0\" />\n  <path d=\"M7.5 14h5l4 -4h-10.5m1.5 4l4 -4\" />\n  <path d=\"M13 6h2l1.5 3l2 4\" />","bike":"<path d=\"M5 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0\" />\n  <path d=\"M19 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0\" />\n  <path d=\"M12 19l0 -4l-3 -3l5 -4l2 3l3 0\" />\n  <path d=\"M17 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />","scooter":"<path d=\"M18 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M6 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M8 17h5a6 6 0 0 1 5 -5v-5a2 2 0 0 0 -2 -2h-1\" />","moped":"<path d=\"M18 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M5 16v1a2 2 0 0 0 4 0v-5h-3a3 3 0 0 0 -3 3v1h10a6 6 0 0 1 5 -4v-5a2 2 0 0 0 -2 -2h-1\" />\n  <path d=\"M6 9l3 0\" />","tir":"<path d=\"M5 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M7 18h8m4 0h2v-6a5 7 0 0 0 -5 -7h-1l1.5 7h4.5\" />\n  <path d=\"M12 18v-13h3\" />\n  <path d=\"M3 17l0 -5l9 0\" />","truck":"<path d=\"M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5\" />","truck-delivery":"<path d=\"M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M5 17h-2v-4m-1 -8h11v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5\" />\n  <path d=\"M3 9l4 0\" />","ambulance":"<path d=\"M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5\" />\n  <path d=\"M6 10h4m-2 -2v4\" />","firetruck":"<path d=\"M5 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M7 18h8m4 0h2v-6a5 5 0 0 0 -5 -5h-1l1.5 5h4.5\" />\n  <path d=\"M12 18v-11h3\" />\n  <path d=\"M3 17l0 -5l9 0\" />\n  <path d=\"M3 9l18 -6\" />\n  <path d=\"M6 12l0 -4\" />","tractor":"<path d=\"M7 15m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0\" />\n  <path d=\"M7 15l0 .01\" />\n  <path d=\"M19 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M10.5 17l6.5 0\" />\n  <path d=\"M20 15.2v-4.2a1 1 0 0 0 -1 -1h-6l-2 -5h-6v6.5\" />\n  <path d=\"M18 5h-1a1 1 0 0 0 -1 1v4\" />","train":"<path d=\"M21 13c0 -3.87 -3.37 -7 -10 -7h-8\" />\n  <path d=\"M3 15h16a2 2 0 0 0 2 -2\" />\n  <path d=\"M3 6v5h17.5\" />\n  <path d=\"M3 11v4\" />\n  <path d=\"M8 11v-5\" />\n  <path d=\"M13 11v-4.5\" />\n  <path d=\"M3 19h18\" />","caravan":"<path d=\"M7 18a2 2 0 1 0 4 0a2 2 0 0 0 -4 0\" />\n  <path d=\"M11 18h7a2 2 0 0 0 2 -2v-7a2 2 0 0 0 -2 -2h-9.5a5.5 5.5 0 0 0 -5.5 5.5v3.5a2 2 0 0 0 2 2h2\" />\n  <path d=\"M8 7l7 -3l1 3\" />\n  <path d=\"M13 11m0 .5a.5 .5 0 0 1 .5 -.5h2a.5 .5 0 0 1 .5 .5v2a.5 .5 0 0 1 -.5 .5h-2a.5 .5 0 0 1 -.5 -.5z\" />\n  <path d=\"M20 16h2\" />","plane":"<path d=\"M16 10h4a2 2 0 0 1 0 4h-4l-4 7h-3l2 -7h-4l-2 2h-3l2 -4l-2 -4h3l2 2h4l-2 -7h3z\" />","helicopter":"<path d=\"M3 10l1 2h6\" />\n  <path d=\"M12 9a2 2 0 0 0 -2 2v3c0 1.1 .9 2 2 2h7a2 2 0 0 0 2 -2c0 -3.31 -3.13 -5 -7 -5h-2z\" />\n  <path d=\"M13 9l0 -3\" />\n  <path d=\"M5 6l15 0\" />\n  <path d=\"M15 9.1v3.9h5.5\" />\n  <path d=\"M15 19l0 -3\" />\n  <path d=\"M19 19l-8 0\" />","sailboat":"<path d=\"M2 20a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1\" />\n  <path d=\"M4 18l-1 -3h18l-1 3\" />\n  <path d=\"M11 12h7l-7 -9v9\" />\n  <path d=\"M8 7l-2 5\" />","ship":"<path d=\"M2 20a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1\" />\n  <path d=\"M4 18l-1 -5h18l-2 4\" />\n  <path d=\"M5 13v-6h8l4 6\" />\n  <path d=\"M7 7v-4h-1\" />","submarine":"<path d=\"M3 11v6h2l1 -1.5l3 1.5h10a3 3 0 0 0 0 -6h-10h0l-3 1.5l-1 -1.5h-2z\" />\n  <path d=\"M17 11l-1 -3h-5l-1 3\" />\n  <path d=\"M13 8v-2a1 1 0 0 1 1 -1h1\" />","air-balloon":"<path d=\"M10 19m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M12 16c3.314 0 6 -4.686 6 -8a6 6 0 1 0 -12 0c0 3.314 2.686 8 6 8z\" />\n  <path d=\"M12 9m-2 0a2 7 0 1 0 4 0a2 7 0 1 0 -4 0\" />","music":"<path d=\"M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\" />\n  <path d=\"M13 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\" />\n  <path d=\"M9 17v-13h10v13\" />\n  <path d=\"M9 8h10\" />","vinyl":"<path d=\"M16 3.937a9 9 0 1 0 5 8.063\" />\n  <path d=\"M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />\n  <path d=\"M20 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />\n  <path d=\"M20 4l-3.5 10l-2.5 2\" />","headphones":"<path d=\"M4 13m0 2a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M15 13m0 2a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M4 15v-3a8 8 0 0 1 16 0v3\" />","microphone":"<path d=\"M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z\" />\n  <path d=\"M5 10a7 7 0 0 0 14 0\" />\n  <path d=\"M8 21l8 0\" />\n  <path d=\"M12 17l0 4\" />","microphone-2":"<path d=\"M15 12.9a5 5 0 1 0 -3.902 -3.9\" />\n  <path d=\"M15 12.9l-3.902 -3.899l-7.513 8.584a2 2 0 1 0 2.827 2.83l8.588 -7.515z\" />","radio":"<path d=\"M14 3l-9.371 3.749a1 1 0 0 0 -.629 .928v11.323a1 1 0 0 0 1 1h14a1 1 0 0 0 1 -1v-11a1 1 0 0 0 -1 -1h-14.5\" />\n  <path d=\"M4 12h16\" />\n  <path d=\"M7 12v-2\" />\n  <path d=\"M17 16v.01\" />\n  <path d=\"M13 16v.01\" />","guitar-pick":"<path d=\"M16 18.5c2 -2.5 4 -6.5 4 -10.5c0 -2.946 -2.084 -4.157 -4.204 -4.654c-.864 -.23 -2.13 -.346 -3.796 -.346c-1.667 0 -2.932 .115 -3.796 .346c-2.12 .497 -4.204 1.708 -4.204 4.654c0 3.312 2 8 4 10.5c.297 .37 .618 .731 .963 1.081l.354 .347a3.9 3.9 0 0 0 5.364 0a14.05 14.05 0 0 0 1.319 -1.428z\" />","piano":"<path d=\"M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M9 19v-6\" />\n  <path d=\"M8 5v8h2v-8\" />\n  <path d=\"M15 19v-6\" />\n  <path d=\"M14 5v8h2v-8\" />","device-speaker":"<path d=\"M5 3m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M12 14m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0\" />\n  <path d=\"M12 7l0 .01\" />","device-airpods":"<path d=\"M6 4a4 4 0 0 1 4 3.8l0 .2v10.5a1.5 1.5 0 0 1 -3 0v-6.5h-1a4 4 0 0 1 -4 -3.8l0 -.2a4 4 0 0 1 4 -4z\" />\n  <path d=\"M18 4a4 4 0 0 0 -4 3.8l0 .2v10.5a1.5 1.5 0 0 0 3 0v-6.5h1a4 4 0 0 0 4 -3.8l0 -.2a4 4 0 0 0 -4 -4z\" />","playlist":"<path d=\"M14 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0\" />\n  <path d=\"M17 17v-13h4\" />\n  <path d=\"M13 5h-10\" />\n  <path d=\"M3 9l10 0\" />\n  <path d=\"M9 13h-6\" />","music-heart":"<path d=\"M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\" />\n  <path d=\"M9 17v-13h10v7\" />\n  <path d=\"M9 8h10\" />\n  <path d=\"M18 22l3.35 -3.284a2.143 2.143 0 0 0 .005 -3.071a2.242 2.242 0 0 0 -3.129 -.006l-.224 .22l-.223 -.22a2.242 2.242 0 0 0 -3.128 -.006a2.143 2.143 0 0 0 -.006 3.071l3.355 3.296z\" />","music-plus":"<path d=\"M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\" />\n  <path d=\"M9 17v-13h10v8\" />\n  <path d=\"M9 8h10\" />\n  <path d=\"M16 19h6\" />\n  <path d=\"M19 16v6\" />","music-search":"<path d=\"M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\" />\n  <path d=\"M9 17v-13h10v7\" />\n  <path d=\"M9 8h10\" />\n  <path d=\"M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0\" />\n  <path d=\"M20.2 20.2l1.8 1.8\" />","music-bolt":"<path d=\"M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\" />\n  <path d=\"M9 17v-13h10v8\" />\n  <path d=\"M9 8h10\" />\n  <path d=\"M19 16l-2 3h4l-2 3\" />","metronome":"<path d=\"M14.153 8.188l-.72 -3.236a2.493 2.493 0 0 0 -4.867 0l-3.025 13.614a2 2 0 0 0 1.952 2.434h7.014a2 2 0 0 0 1.952 -2.434l-.524 -2.357m-4.935 1.791l9 -13\" />\n  <path d=\"M20 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />","volume":"<path d=\"M15 8a5 5 0 0 1 0 8\" />\n  <path d=\"M17.7 5a9 9 0 0 1 0 14\" />\n  <path d=\"M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5\" />","adjustments":"<path d=\"M4 10a2 2 0 1 0 4 0a2 2 0 0 0 -4 0\" />\n  <path d=\"M6 4v4\" />\n  <path d=\"M6 12v8\" />\n  <path d=\"M10 16a2 2 0 1 0 4 0a2 2 0 0 0 -4 0\" />\n  <path d=\"M12 4v10\" />\n  <path d=\"M12 18v2\" />\n  <path d=\"M16 7a2 2 0 1 0 4 0a2 2 0 0 0 -4 0\" />\n  <path d=\"M18 4v1\" />\n  <path d=\"M18 9v11\" />","player-record":"<path d=\"M12 12m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0\" />","wave-sine":"<path d=\"M21 12h-2c-.894 0 -1.662 -.857 -1.761 -2c-.296 -3.45 -.749 -6 -2.749 -6s-2.5 3.582 -2.5 8s-.5 8 -2.5 8s-2.452 -2.547 -2.749 -6c-.1 -1.147 -.867 -2 -1.763 -2h-2\" />","cube":"<path d=\"M21 16.008v-8.018a1.98 1.98 0 0 0 -1 -1.717l-7 -4.008a2.016 2.016 0 0 0 -2 0l-7 4.008c-.619 .355 -1 1.01 -1 1.718v8.018c0 .709 .381 1.363 1 1.717l7 4.008a2.016 2.016 0 0 0 2 0l7 -4.008c.619 -.355 1 -1.01 1 -1.718z\" />\n  <path d=\"M12 22v-10\" />\n  <path d=\"M12 12l8.73 -5.04\" />\n  <path d=\"M3.27 6.96l8.73 5.04\" />","sphere":"<path d=\"M3 12c0 1.657 4.03 3 9 3s9 -1.343 9 -3\" />\n  <path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\" />","pyramid":"<path d=\"M11.105 21.788a1.994 1.994 0 0 0 1.789 0l8.092 -4.054c.538 -.27 .718 -.951 .385 -1.452l-8.54 -13.836a.999 .999 0 0 0 -1.664 0l-8.54 13.836a1.005 1.005 0 0 0 .386 1.452l8.092 4.054z\" />\n  <path d=\"M12 2v20\" />","cone":"<path d=\"M21 17.998v-.5l-8.13 -14.99a1 1 0 0 0 -1.74 0l-8.13 14.989v.5c0 1.659 4.03 3.003 9 3.003s9 -1.344 9 -3.002\" />","cylinder":"<path d=\"M12 6m-7 0a7 3 0 1 0 14 0a7 3 0 1 0 -14 0\" />\n  <path d=\"M5 6v12c0 1.657 3.134 3 7 3s7 -1.343 7 -3v-12\" />","prism":"<path d=\"M12 9v13\" />\n  <path d=\"M19 17.17l-5.98 4.485a1.7 1.7 0 0 1 -2.04 0l-5.98 -4.485a2.5 2.5 0 0 1 -1 -2v-11.17a1 1 0 0 1 1 -1h14a1 1 0 0 1 1 1v11.17a2.5 2.5 0 0 1 -1 2z\" />\n  <path d=\"M4.3 3.3l6.655 5.186a1.7 1.7 0 0 0 2.09 0l6.655 -5.186\" />","hexagon":"<path d=\"M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033z\" />","pentagon":"<path d=\"M13.163 2.168l8.021 5.828c.694 .504 .984 1.397 .719 2.212l-3.064 9.43a1.978 1.978 0 0 1 -1.881 1.367h-9.916a1.978 1.978 0 0 1 -1.881 -1.367l-3.064 -9.43a1.978 1.978 0 0 1 .719 -2.212l8.021 -5.828a1.978 1.978 0 0 1 2.326 0z\" />","square":"<path d=\"M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z\" />","triangle":"<path d=\"M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z\" />","circle":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\" />","octagon":"<path d=\"M12.802 2.165l5.575 2.389c.48 .206 .863 .589 1.07 1.07l2.388 5.574c.22 .512 .22 1.092 0 1.604l-2.389 5.575c-.206 .48 -.589 .863 -1.07 1.07l-5.574 2.388c-.512 .22 -1.092 .22 -1.604 0l-5.575 -2.389a2.036 2.036 0 0 1 -1.07 -1.07l-2.388 -5.574a2.036 2.036 0 0 1 0 -1.604l2.389 -5.575c.206 -.48 .589 -.863 1.07 -1.07l5.574 -2.388a2.036 2.036 0 0 1 1.604 0z\" />","rectangle":"<path d=\"M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z\" />","oval":"<path d=\"M12 12m-6 0a6 9 0 1 0 12 0a6 9 0 1 0 -12 0\" />","diamond":"<path d=\"M6 5h12l3 5l-8.5 9.5a.7 .7 0 0 1 -1 0l-8.5 -9.5l3 -5\" />\n  <path d=\"M10 12l-2 -2.2l.6 -1\" />","triangle-inverted":"<path d=\"M10.363 20.405l-8.106 -13.534a1.914 1.914 0 0 1 1.636 -2.871h16.214a1.914 1.914 0 0 1 1.636 2.871l-8.106 13.534a1.914 1.914 0 0 1 -3.274 0z\" />","cube-unfolded":"<path d=\"M2 15h10v5h5v-5h5v-5h-10v-5h-5v5h-5z\" />\n  <path d=\"M7 15v-5h5v5h5v-5\" />","cone-2":"<path d=\"M21 5.002v.5l-8.13 14.99a1 1 0 0 1 -1.74 0l-8.13 -14.989v-.5c0 -1.659 4.03 -3.003 9 -3.003s9 1.344 9 3.002\" />","circles":"<path d=\"M12 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0\" />\n  <path d=\"M6.5 17m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0\" />\n  <path d=\"M17.5 17m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0\" />","squares":"<path d=\"M8 10a2 2 0 0 1 2 -2h9a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-9a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M16 8v-3a2 2 0 0 0 -2 -2h-9a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h3\" />","book":"<path d=\"M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0\" />\n  <path d=\"M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0\" />\n  <path d=\"M3 6l0 13\" />\n  <path d=\"M12 6l0 13\" />\n  <path d=\"M21 6l0 13\" />","book-2":"<path d=\"M19 4v16h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12z\" />\n  <path d=\"M19 16h-12a2 2 0 0 0 -2 2\" />\n  <path d=\"M9 8h6\" />","books":"<path d=\"M5 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M9 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M5 8h4\" />\n  <path d=\"M9 16h4\" />\n  <path d=\"M13.803 4.56l2.184 -.53c.562 -.135 1.133 .19 1.282 .732l3.695 13.418a1.02 1.02 0 0 1 -.634 1.219l-.133 .041l-2.184 .53c-.562 .135 -1.133 -.19 -1.282 -.732l-3.695 -13.418a1.02 1.02 0 0 1 .634 -1.219l.133 -.041z\" />\n  <path d=\"M14 9l4 -1\" />\n  <path d=\"M16 16l3.923 -.98\" />","book-download":"<path d=\"M12 20h-6a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12v5\" />\n  <path d=\"M13 16h-7a2 2 0 0 0 -2 2\" />\n  <path d=\"M15 19l3 3l3 -3\" />\n  <path d=\"M18 22v-9\" />","book-upload":"<path d=\"M14 20h-8a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12v5\" />\n  <path d=\"M11 16h-5a2 2 0 0 0 -2 2\" />\n  <path d=\"M15 16l3 -3l3 3\" />\n  <path d=\"M18 13v9\" />","text-size":"<path d=\"M3 7v-2h13v2\" />\n  <path d=\"M10 5v14\" />\n  <path d=\"M12 19h-4\" />\n  <path d=\"M15 13v-1h6v1\" />\n  <path d=\"M18 12v7\" />\n  <path d=\"M17 19h2\" />","text-recognition":"<path d=\"M4 8v-2a2 2 0 0 1 2 -2h2\" />\n  <path d=\"M4 16v2a2 2 0 0 0 2 2h2\" />\n  <path d=\"M16 4h2a2 2 0 0 1 2 2v2\" />\n  <path d=\"M16 20h2a2 2 0 0 0 2 -2v-2\" />\n  <path d=\"M12 16v-7\" />\n  <path d=\"M9 9h6\" />","highlight":"<path d=\"M3 19h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4\" />\n  <path d=\"M12.5 5.5l4 4\" />\n  <path d=\"M4.5 13.5l4 4\" />\n  <path d=\"M21 15v4h-8l4 -4z\" />","bookmark-plus":"<path d=\"M12 17l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v5\" />\n  <path d=\"M16 19h6\" />\n  <path d=\"M19 16v6\" />","bookmark":"<path d=\"M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z\" />","bookmarks":"<path d=\"M15 10v11l-5 -3l-5 3v-11a3 3 0 0 1 3 -3h4a3 3 0 0 1 3 3z\" />\n  <path d=\"M11 3h5a3 3 0 0 1 3 3v11\" />","bookmark-edit":"<path d=\"M12 17l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v4\" />\n  <path d=\"M18.42 15.61a2.1 2.1 0 1 1 2.97 2.97l-3.39 3.42h-3v-3l3.42 -3.39z\" />","notebook":"<path d=\"M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-11a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1m3 0v18\" />\n  <path d=\"M13 8l2 0\" />\n  <path d=\"M13 12l2 0\" />","notes":"<path d=\"M5 3m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M9 7l6 0\" />\n  <path d=\"M9 11l6 0\" />\n  <path d=\"M9 15l4 0\" />","vocabulary":"<path d=\"M10 19h-6a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1h6a2 2 0 0 1 2 2a2 2 0 0 1 2 -2h6a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-6a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2z\" />\n  <path d=\"M12 5v16\" />\n  <path d=\"M7 7h1\" />\n  <path d=\"M7 11h1\" />\n  <path d=\"M16 7h1\" />\n  <path d=\"M16 11h1\" />\n  <path d=\"M16 15h1\" />","bookmark-question":"<path d=\"M15 19l-3 -2l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v4\" />\n  <path d=\"M19 22v.01\" />\n  <path d=\"M19 19a2.003 2.003 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483\" />","alphabet-latin":"<path d=\"M6 10h2a2 2 0 0 1 2 2v5h-3a2 2 0 1 1 0 -4h3\" />\n  <path d=\"M14 7v10\" />\n  <path d=\"M14 10m0 2a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z\" />","language":"<path d=\"M4 5h7\" />\n  <path d=\"M9 3v2c0 4.418 -2.239 8 -5 8\" />\n  <path d=\"M5 9c0 2.144 2.952 3.908 6.7 4\" />\n  <path d=\"M12 20l4 -9l4 9\" />\n  <path d=\"M19.1 18h-6.2\" />","eyeglass":"<path d=\"M8 4h-2l-3 10\" />\n  <path d=\"M16 4h2l3 10\" />\n  <path d=\"M10 16l4 0\" />\n  <path d=\"M21 16.5a3.5 3.5 0 0 1 -7 0v-2.5h7v2.5\" />\n  <path d=\"M10 16.5a3.5 3.5 0 0 1 -7 0v-2.5h7v2.5\" />","lamp":"<path d=\"M9 20h6\" />\n  <path d=\"M12 20v-8\" />\n  <path d=\"M5 12h14l-4 -8h-6z\" />","clock":"<path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0\" />\n  <path d=\"M12 7v5l3 3\" />","alarm":"<path d=\"M12 13m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0\" />\n  <path d=\"M12 10l0 3l2 0\" />\n  <path d=\"M7 4l-2.75 2\" />\n  <path d=\"M17 4l2.75 2\" />","hourglass":"<path d=\"M6.5 7h11\" />\n  <path d=\"M6.5 17h11\" />\n  <path d=\"M6 20v-2a6 6 0 1 1 12 0v2a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M6 4v2a6 6 0 1 0 12 0v-2a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1z\" />","calendar":"<path d=\"M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z\" />\n  <path d=\"M16 3v4\" />\n  <path d=\"M8 3v4\" />\n  <path d=\"M4 11h16\" />\n  <path d=\"M11 15h1\" />\n  <path d=\"M12 15v3\" />","stopwatch":"<path d=\"M5 13a7 7 0 1 0 14 0a7 7 0 0 0 -14 0z\" />\n  <path d=\"M14.5 10.5l-2.5 2.5\" />\n  <path d=\"M17 8l1 -1\" />\n  <path d=\"M14 3h-4\" />","device-watch":"<path d=\"M6 9a3 3 0 0 1 3 -3h6a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3h-6a3 3 0 0 1 -3 -3v-6z\" />\n  <path d=\"M9 18v3h6v-3\" />\n  <path d=\"M9 6v-3h6v3\" />","calendar-event":"<path d=\"M4 5m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M16 3l0 4\" />\n  <path d=\"M8 3l0 4\" />\n  <path d=\"M4 11l16 0\" />\n  <path d=\"M8 15h2v2h-2z\" />","calendar-week":"<path d=\"M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z\" />\n  <path d=\"M16 3v4\" />\n  <path d=\"M8 3v4\" />\n  <path d=\"M4 11h16\" />\n  <path d=\"M7 14h.013\" />\n  <path d=\"M10.01 14h.005\" />\n  <path d=\"M13.01 14h.005\" />\n  <path d=\"M16.015 14h.005\" />\n  <path d=\"M13.015 17h.005\" />\n  <path d=\"M7.01 17h.005\" />\n  <path d=\"M10.01 17h.005\" />","calendar-month":"<path d=\"M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z\" />\n  <path d=\"M16 3v4\" />\n  <path d=\"M8 3v4\" />\n  <path d=\"M4 11h16\" />\n  <path d=\"M8 14v4\" />\n  <path d=\"M12 14v4\" />\n  <path d=\"M16 14v4\" />","calendar-time":"<path d=\"M11.795 21h-6.795a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v4\" />\n  <path d=\"M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0\" />\n  <path d=\"M15 3v4\" />\n  <path d=\"M7 3v4\" />\n  <path d=\"M3 11h16\" />\n  <path d=\"M18 16.496v1.504l1 1\" />","history":"<path d=\"M12 8l0 4l2 2\" />\n  <path d=\"M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5\" />","timeline":"<path d=\"M4 16l6 -7l5 5l5 -6\" />\n  <path d=\"M15 14m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />\n  <path d=\"M10 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />\n  <path d=\"M4 16m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />\n  <path d=\"M20 8m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />","hours-24":"<path d=\"M4 13c.325 2.532 1.881 4.781 4 6\" />\n  <path d=\"M20 11a8.1 8.1 0 0 0 -15.5 -2\" />\n  <path d=\"M4 5v4h4\" />\n  <path d=\"M12 15h2a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-1a1 1 0 0 0 -1 1v1a1 1 0 0 0 1 1h2\" />\n  <path d=\"M18 15v2a1 1 0 0 0 1 1h1\" />\n  <path d=\"M21 15v6\" />","hourglass-high":"<path d=\"M6.5 7h11\" />\n  <path d=\"M6 20v-2a6 6 0 1 1 12 0v2a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M6 4v2a6 6 0 1 0 12 0v-2a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1z\" />","hourglass-low":"<path d=\"M6.5 17h11\" />\n  <path d=\"M6 20v-2a6 6 0 1 1 12 0v2a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M6 4v2a6 6 0 1 0 12 0v-2a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1z\" />","clock-24":"<path d=\"M3 12a9 9 0 0 0 5.998 8.485m12.002 -8.485a9 9 0 1 0 -18 0\" />\n  <path d=\"M12 7v5\" />\n  <path d=\"M12 15h2a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-1a1 1 0 0 0 -1 1v1a1 1 0 0 0 1 1h2\" />\n  <path d=\"M18 15v2a1 1 0 0 0 1 1h1\" />\n  <path d=\"M21 15v6\" />","calendar-clock":"<path d=\"M10.5 21h-4.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v3\" />\n  <path d=\"M16 3v4\" />\n  <path d=\"M8 3v4\" />\n  <path d=\"M4 11h10\" />\n  <path d=\"M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0\" />\n  <path d=\"M18 16.5v1.5l.5 .5\" />","alarm-snooze":"<path d=\"M12 13m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0\" />\n  <path d=\"M10 11h4l-4 4h4\" />\n  <path d=\"M7 4l-2.75 2\" />\n  <path d=\"M17 4l2.75 2\" />","clock-hour-3":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\" />\n  <path d=\"M12 12h3.5\" />\n  <path d=\"M12 7v5\" />","clock-hour-9":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\" />\n  <path d=\"M12 12h-3.5\" />\n  <path d=\"M12 7v5\" />","cloud-rain":"<path d=\"M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7\" />\n  <path d=\"M11 13v2m0 3v2m4 -5v2m0 3v2\" />","umbrella":"<path d=\"M4 12a8 8 0 0 1 16 0z\" />\n  <path d=\"M12 12v6a2 2 0 0 0 4 0\" />","droplet":"<path d=\"M7.502 19.423c2.602 2.105 6.395 2.105 8.996 0c2.602 -2.105 3.262 -5.708 1.566 -8.546l-4.89 -7.26c-.42 -.625 -1.287 -.803 -1.936 -.397a1.376 1.376 0 0 0 -.41 .397l-4.893 7.26c-1.695 2.838 -1.035 6.441 1.567 8.546z\" />","cloud":"<path d=\"M6.657 18c-2.572 0 -4.657 -2.007 -4.657 -4.483c0 -2.475 2.085 -4.482 4.657 -4.482c.393 -1.762 1.794 -3.2 3.675 -3.773c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 1.927 -1.551 3.487 -3.465 3.487h-11.878\" />","cloud-storm":"<path d=\"M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1\" />\n  <path d=\"M13 14l-2 4l3 0l-2 4\" />","wind":"<path d=\"M5 8h8.5a2.5 2.5 0 1 0 -2.34 -3.24\" />\n  <path d=\"M3 12h15.5a2.5 2.5 0 1 1 -2.34 3.24\" />\n  <path d=\"M4 16h5.5a2.5 2.5 0 1 1 -2.34 3.24\" />","ripple":"<path d=\"M3 7c3 -2 6 -2 9 0s6 2 9 0\" />\n  <path d=\"M3 17c3 -2 6 -2 9 0s6 2 9 0\" />\n  <path d=\"M3 12c3 -2 6 -2 9 0s6 2 9 0\" />","rainbow":"<path d=\"M22 17c0 -5.523 -4.477 -10 -10 -10s-10 4.477 -10 10\" />\n  <path d=\"M18 17a6 6 0 1 0 -12 0\" />\n  <path d=\"M14 17a2 2 0 1 0 -4 0\" />","cloud-snow":"<path d=\"M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7\" />\n  <path d=\"M11 15v.01m0 3v.01m0 3v.01m4 -4v.01m0 3v.01\" />","snowflake":"<path d=\"M10 4l2 1l2 -1\" />\n  <path d=\"M12 2v6.5l3 1.72\" />\n  <path d=\"M17.928 6.268l.134 2.232l1.866 1.232\" />\n  <path d=\"M20.66 7l-5.629 3.25l.01 3.458\" />\n  <path d=\"M19.928 14.268l-1.866 1.232l-.134 2.232\" />\n  <path d=\"M20.66 17l-5.629 -3.25l-2.99 1.738\" />\n  <path d=\"M14 20l-2 -1l-2 1\" />\n  <path d=\"M12 22v-6.5l-3 -1.72\" />\n  <path d=\"M6.072 17.732l-.134 -2.232l-1.866 -1.232\" />\n  <path d=\"M3.34 17l5.629 -3.25l-.01 -3.458\" />\n  <path d=\"M4.072 9.732l1.866 -1.232l.134 -2.232\" />\n  <path d=\"M3.34 7l5.629 3.25l2.99 -1.738\" />","leaf":"<path d=\"M5 21c.5 -4.5 2.5 -8 7 -10\" />\n  <path d=\"M9 18c6.218 0 10.5 -3.288 11 -12v-2h-4.014c-9 0 -11.986 4 -12 9c0 1 0 3 2 5h3z\" />","flower":"<path d=\"M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0\" />\n  <path d=\"M12 2a3 3 0 0 1 3 3c0 .562 -.259 1.442 -.776 2.64l-.724 1.36l1.76 -1.893c.499 -.6 .922 -1 1.27 -1.205a2.968 2.968 0 0 1 4.07 1.099a3.011 3.011 0 0 1 -1.09 4.098c-.374 .217 -.99 .396 -1.846 .535l-2.664 .366l2.4 .326c1 .145 1.698 .337 2.11 .576a3.011 3.011 0 0 1 1.09 4.098a2.968 2.968 0 0 1 -4.07 1.098c-.348 -.202 -.771 -.604 -1.27 -1.205l-1.76 -1.893l.724 1.36c.516 1.199 .776 2.079 .776 2.64a3 3 0 0 1 -6 0c0 -.562 .259 -1.442 .776 -2.64l.724 -1.36l-1.76 1.893c-.499 .601 -.922 1 -1.27 1.205a2.968 2.968 0 0 1 -4.07 -1.098a3.011 3.011 0 0 1 1.09 -4.098c.374 -.218 .99 -.396 1.846 -.536l2.664 -.366l-2.4 -.325c-1 -.145 -1.698 -.337 -2.11 -.576a3.011 3.011 0 0 1 -1.09 -4.099a2.968 2.968 0 0 1 4.07 -1.099c.348 .203 .771 .604 1.27 1.205l1.76 1.894c-1 -2.292 -1.5 -3.625 -1.5 -4a3 3 0 0 1 3 -3z\" />","plant":"<path d=\"M7 15h10v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2v-4z\" />\n  <path d=\"M12 9a6 6 0 0 0 -6 -6h-3v2a6 6 0 0 0 6 6h3\" />\n  <path d=\"M12 11a6 6 0 0 1 6 -6h3v1a6 6 0 0 1 -6 6h-3\" />\n  <path d=\"M12 15l0 -6\" />","tree":"<path d=\"M12 13l-2 -2\" />\n  <path d=\"M12 12l2 -2\" />\n  <path d=\"M12 21v-13\" />\n  <path d=\"M9.824 16a3 3 0 0 1 -2.743 -3.69a3 3 0 0 1 .304 -4.833a3 3 0 0 1 4.615 -3.707a3 3 0 0 1 4.614 3.707a3 3 0 0 1 .305 4.833a3 3 0 0 1 -2.919 3.695h-4z\" />","seedling":"<path d=\"M12 10a6 6 0 0 0 -6 -6h-3v2a6 6 0 0 0 6 6h3\" />\n  <path d=\"M12 14a6 6 0 0 1 6 -6h3v1a6 6 0 0 1 -6 6h-3\" />\n  <path d=\"M12 20l0 -10\" />","mountain":"<path d=\"M3 20h18l-6.921 -14.612a2.3 2.3 0 0 0 -4.158 0l-6.921 14.612z\" />\n  <path d=\"M7.5 11l2 2.5l2.5 -2.5l2 3l2.5 -2\" />","sunrise":"<path d=\"M3 17h1m16 0h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7m-9.7 5.7a4 4 0 0 1 8 0\" />\n  <path d=\"M3 21l18 0\" />\n  <path d=\"M12 9v-6l3 3m-6 0l3 -3\" />","sunset":"<path d=\"M3 17h1m16 0h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7m-9.7 5.7a4 4 0 0 1 8 0\" />\n  <path d=\"M3 21l18 0\" />\n  <path d=\"M12 3v6l3 -3m-6 0l3 3\" />","mist":"<path d=\"M5 5h3m4 0h9\" />\n  <path d=\"M3 10h11m4 0h1\" />\n  <path d=\"M5 15h5m4 0h7\" />\n  <path d=\"M3 20h9m4 0h3\" />","windmill":"<path d=\"M12 12c2.76 0 5 -2.01 5 -4.5s-2.24 -4.5 -5 -4.5v9z\" />\n  <path d=\"M12 12c0 2.76 2.01 5 4.5 5s4.5 -2.24 4.5 -5h-9z\" />\n  <path d=\"M12 12c-2.76 0 -5 2.01 -5 4.5s2.24 4.5 5 4.5v-9z\" />\n  <path d=\"M12 12c0 -2.76 -2.01 -5 -4.5 -5s-4.5 2.24 -4.5 5h9z\" />","device-projector":"<path d=\"M8 9a5 5 0 1 0 10 0a5 5 0 0 0 -10 0\" />\n  <path d=\"M9 6h-4a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2 -2v-8a2 2 0 0 0 -2 -2h-2\" />\n  <path d=\"M6 15h1\" />\n  <path d=\"M7 18l-1 2\" />\n  <path d=\"M18 18l1 2\" />","presentation":"<path d=\"M3 4l18 0\" />\n  <path d=\"M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-10\" />\n  <path d=\"M12 16l0 4\" />\n  <path d=\"M9 20l6 0\" />\n  <path d=\"M8 12l3 -3l2 2l3 -3\" />","presentation-analytics":"<path d=\"M9 12v-4\" />\n  <path d=\"M15 12v-2\" />\n  <path d=\"M12 12v-1\" />\n  <path d=\"M3 4h18\" />\n  <path d=\"M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-10\" />\n  <path d=\"M12 16v4\" />\n  <path d=\"M9 20h6\" />","device-tv":"<path d=\"M3 7m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M16 3l-4 4l-4 -4\" />","device-tv-old":"<path d=\"M3 7m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M16 3l-4 4l-4 -4\" />\n  <path d=\"M15 7v13\" />\n  <path d=\"M18 15v.01\" />\n  <path d=\"M18 12v.01\" />","device-desktop":"<path d=\"M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10z\" />\n  <path d=\"M7 20h10\" />\n  <path d=\"M9 16v4\" />\n  <path d=\"M15 16v4\" />","device-desktop-analytics":"<path d=\"M3 4m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M7 20h10\" />\n  <path d=\"M9 16v4\" />\n  <path d=\"M15 16v4\" />\n  <path d=\"M9 12v-4\" />\n  <path d=\"M12 12v-1\" />\n  <path d=\"M15 12v-2\" />\n  <path d=\"M12 12v-1\" />","device-laptop":"<path d=\"M3 19l18 0\" />\n  <path d=\"M5 6m0 1a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z\" />","device-tablet":"<path d=\"M5 4a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v16a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1v-16z\" />\n  <path d=\"M11 17a1 1 0 1 0 2 0a1 1 0 0 0 -2 0\" />","device-mobile":"<path d=\"M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z\" />\n  <path d=\"M11 4h2\" />\n  <path d=\"M12 17v.01\" />","device-imac":"<path d=\"M3 4a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-12z\" />\n  <path d=\"M3 13h18\" />\n  <path d=\"M8 21h8\" />\n  <path d=\"M10 17l-.5 4\" />\n  <path d=\"M14 17l.5 4\" />","device-vision-pro":"<path d=\"M12 7c1.143 0 2.235 .035 3.275 .104c1.017 .068 1.95 .207 2.798 .42c.813 .203 1.52 .505 2.119 .909a3.903 3.903 0 0 1 1.328 1.531c.326 .657 .48 1.48 .48 2.466c0 1.006 -.189 1.91 -.574 2.707c-.375 .779 -.886 1.396 -1.537 1.848a3.696 3.696 0 0 1 -2.16 .66c-.509 0 -.97 -.068 -1.382 -.21a5.84 5.84 0 0 1 -1.17 -.548a18.45 18.45 0 0 1 -1.045 -.695a9.104 9.104 0 0 0 -1.001 -.63a2.376 2.376 0 0 0 -1.13 -.301c-.373 0 -.75 .097 -1.132 .3c-.316 .17 -.65 .38 -1 .63c-.322 .23 -.67 .462 -1.047 .695a5.78 5.78 0 0 1 -1.168 .548c-.413 .142 -.872 .21 -1.378 .21a3.706 3.706 0 0 1 -2.165 -.659c-.651 -.452 -1.162 -1.07 -1.537 -1.848c-.385 -.798 -.574 -1.7 -.574 -2.709c-.004 -.98 .15 -1.802 .477 -2.46a3.897 3.897 0 0 1 1.33 -1.531c.6 -.403 1.307 -.704 2.12 -.907a16.088 16.088 0 0 1 2.8 -.423c1.04 -.071 2.13 -.107 3.273 -.107z\" />","device-cctv":"<path d=\"M3 3m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M12 14m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0\" />\n  <path d=\"M19 7v7a7 7 0 0 1 -14 0v-7\" />\n  <path d=\"M12 14l.01 0\" />","video":"<path d=\"M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z\" />\n  <path d=\"M3 6m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z\" />","video-plus":"<path d=\"M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z\" />\n  <path d=\"M3 6m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M7 12l4 0\" />\n  <path d=\"M9 10l0 4\" />","video-minus":"<path d=\"M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z\" />\n  <path d=\"M3 6m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M7 12l4 0\" />","cast":"<path d=\"M3 19l.01 0\" />\n  <path d=\"M7 19a4 4 0 0 0 -4 -4\" />\n  <path d=\"M11 19a8 8 0 0 0 -8 -8\" />\n  <path d=\"M15 19h3a3 3 0 0 0 3 -3v-8a3 3 0 0 0 -3 -3h-12a3 3 0 0 0 -2.8 2\" />","screen-share":"<path d=\"M21 12v3a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1h9\" />\n  <path d=\"M7 20l10 0\" />\n  <path d=\"M9 16l0 4\" />\n  <path d=\"M15 16l0 4\" />\n  <path d=\"M17 4h4v4\" />\n  <path d=\"M16 9l5 -5\" />","picture-in-picture":"<path d=\"M11 19h-6a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4\" />\n  <path d=\"M14 14m0 1a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1z\" />","device-computer-camera":"<path d=\"M12 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0\" />\n  <path d=\"M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0\" />\n  <path d=\"M8 16l-2.091 3.486a1 1 0 0 0 .857 1.514h10.468a1 1 0 0 0 .857 -1.514l-2.091 -3.486\" />","movie":"<path d=\"M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M8 4l0 16\" />\n  <path d=\"M16 4l0 16\" />\n  <path d=\"M4 8l4 0\" />\n  <path d=\"M4 16l4 0\" />\n  <path d=\"M4 12l16 0\" />\n  <path d=\"M16 8l4 0\" />\n  <path d=\"M16 16l4 0\" />","device-remote":"<path d=\"M12 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M7 3m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M12 3v2\" />\n  <path d=\"M10 15v.01\" />\n  <path d=\"M10 18v.01\" />\n  <path d=\"M14 18v.01\" />\n  <path d=\"M14 15v.01\" />","camera":"<path d=\"M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2\" />\n  <path d=\"M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\" />","camera-up":"<path d=\"M12 20h-7a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v3.5\" />\n  <path d=\"M12 16a3 3 0 1 0 0 -6a3 3 0 0 0 0 6z\" />\n  <path d=\"M19 22v-6\" />\n  <path d=\"M22 19l-3 -3l-3 3\" />","camera-down":"<path d=\"M12 20h-7a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v3.5\" />\n  <path d=\"M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\" />\n  <path d=\"M19 16v6\" />\n  <path d=\"M22 19l-3 3l-3 -3\" />","camera-bolt":"<path d=\"M13 20h-8a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v3.5\" />\n  <path d=\"M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\" />\n  <path d=\"M19 16l-2 3h4l-2 3\" />","camera-cog":"<path d=\"M12 20h-7a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v3\" />\n  <path d=\"M14.973 13.406a3 3 0 1 0 -2.973 2.594\" />\n  <path d=\"M19.001 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M19.001 15.5v1.5\" />\n  <path d=\"M19.001 21v1.5\" />\n  <path d=\"M22.032 17.25l-1.299 .75\" />\n  <path d=\"M17.27 20l-1.3 .75\" />\n  <path d=\"M15.97 17.25l1.3 .75\" />\n  <path d=\"M20.733 20l1.3 .75\" />","camera-spark":"<path d=\"M11.5 20h-6.5a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v3\" />\n  <path d=\"M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\" />\n  <path d=\"M19 22.5a4.75 4.75 0 0 1 3.5 -3.5a4.75 4.75 0 0 1 -3.5 -3.5a4.75 4.75 0 0 1 -3.5 3.5a4.75 4.75 0 0 1 3.5 3.5\" />","camera-rotate":"<path d=\"M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2\" />\n  <path d=\"M11.245 15.904a3 3 0 0 0 3.755 -2.904m-2.25 -2.905a3 3 0 0 0 -3.75 2.905\" />\n  <path d=\"M14 13h2v2\" />\n  <path d=\"M10 13h-2v-2\" />","photo-video":"<path d=\"M9 15h-3a3 3 0 0 1 -3 -3v-6a3 3 0 0 1 3 -3h6a3 3 0 0 1 3 3v3\" />\n  <path d=\"M9 9m0 3a3 3 0 0 1 3 -3h6a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3h-6a3 3 0 0 1 -3 -3z\" />\n  <path d=\"M3 12l2.296 -2.296a2.41 2.41 0 0 1 3.408 0l.296 .296\" />\n  <path d=\"M14 13.5v3l2.5 -1.5z\" />\n  <path d=\"M7 6v.01\" />","ticket":"<path d=\"M15 5l0 2\" />\n  <path d=\"M15 11l0 2\" />\n  <path d=\"M15 17l0 2\" />\n  <path d=\"M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-3a2 2 0 0 0 0 -4v-3a2 2 0 0 1 2 -2\" />","chair-director":"<path d=\"M6 21l12 -9\" />\n  <path d=\"M6 12l12 9\" />\n  <path d=\"M5 12h14\" />\n  <path d=\"M6 3v9\" />\n  <path d=\"M18 3v9\" />\n  <path d=\"M6 8h12\" />\n  <path d=\"M6 5h12\" />","masks-theater":"<path d=\"M13.192 9h6.616a2 2 0 0 1 1.992 2.183l-.567 6.182a4 4 0 0 1 -3.983 3.635h-1.5a4 4 0 0 1 -3.983 -3.635l-.567 -6.182a2 2 0 0 1 1.992 -2.183z\" />\n  <path d=\"M15 13h.01\" />\n  <path d=\"M18 13h.01\" />\n  <path d=\"M15 16.5c1 .667 2 .667 3 0\" />\n  <path d=\"M8.632 15.982a4.037 4.037 0 0 1 -.382 .018h-1.5a4 4 0 0 1 -3.983 -3.635l-.567 -6.182a2 2 0 0 1 1.992 -2.183h6.616a2 2 0 0 1 2 2\" />\n  <path d=\"M6 8h.01\" />\n  <path d=\"M9 8h.01\" />\n  <path d=\"M6 12c.764 -.51 1.528 -.63 2.291 -.36\" />","armchair":"<path d=\"M5 11a2 2 0 0 1 2 2v2h10v-2a2 2 0 1 1 4 0v4a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2z\" />\n  <path d=\"M5 11v-5a3 3 0 0 1 3 -3h8a3 3 0 0 1 3 3v5\" />\n  <path d=\"M6 19v2\" />\n  <path d=\"M18 19v2\" />","badge-hd":"<path d=\"M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M14 9v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z\" />\n  <path d=\"M7 15v-6\" />\n  <path d=\"M10 15v-6\" />\n  <path d=\"M7 12h3\" />","badge-4k":"<path d=\"M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M7 9v2a1 1 0 0 0 1 1h1\" />\n  <path d=\"M10 9v6\" />\n  <path d=\"M14 9v6\" />\n  <path d=\"M17 9l-2 3l2 3\" />\n  <path d=\"M15 12h-1\" />","badge-3d":"<path d=\"M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M7 9h1.5a1.5 1.5 0 0 1 0 3h-.5h.5a1.5 1.5 0 0 1 0 3h-1.5\" />\n  <path d=\"M14 9v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2z\" />","aspect-ratio":"<path d=\"M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M7 12v-3h3\" />\n  <path d=\"M17 12v3h-3\" />","player-play":"<path d=\"M7 4v16l13 -8z\" />","disc":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\" />\n  <path d=\"M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />\n  <path d=\"M7 12a5 5 0 0 1 5 -5\" />\n  <path d=\"M12 17a5 5 0 0 0 5 -5\" />","news":"<path d=\"M16 6h3a1 1 0 0 1 1 1v11a2 2 0 0 1 -4 0v-13a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1v12a3 3 0 0 0 3 3h11\" />\n  <path d=\"M8 8l4 0\" />\n  <path d=\"M8 12l4 0\" />\n  <path d=\"M8 16l4 0\" />","article":"<path d=\"M3 4m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M7 8h10\" />\n  <path d=\"M7 12h10\" />\n  <path d=\"M7 16h10\" />","file-text":"<path d=\"M14 3v4a1 1 0 0 0 1 1h4\" />\n  <path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z\" />\n  <path d=\"M9 9l1 0\" />\n  <path d=\"M9 13l6 0\" />\n  <path d=\"M9 17l6 0\" />","file-description":"<path d=\"M14 3v4a1 1 0 0 0 1 1h4\" />\n  <path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z\" />\n  <path d=\"M9 17h6\" />\n  <path d=\"M9 13h6\" />","file-typography":"<path d=\"M14 3v4a1 1 0 0 0 1 1h4\" />\n  <path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z\" />\n  <path d=\"M11 18h2\" />\n  <path d=\"M12 18v-7\" />\n  <path d=\"M9 12v-1h6v1\" />","file-pencil":"<path d=\"M14 3v4a1 1 0 0 0 1 1h4\" />\n  <path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z\" />\n  <path d=\"M10 18l5 -5a1.414 1.414 0 0 0 -2 -2l-5 5v2h2z\" />","files":"<path d=\"M15 3v4a1 1 0 0 0 1 1h4\" />\n  <path d=\"M18 17h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h4l5 5v7a2 2 0 0 1 -2 2z\" />\n  <path d=\"M16 17v2a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2\" />","clipboard-text":"<path d=\"M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2\" />\n  <path d=\"M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z\" />\n  <path d=\"M9 12h6\" />\n  <path d=\"M9 16h6\" />","printer":"<path d=\"M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2\" />\n  <path d=\"M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4\" />\n  <path d=\"M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z\" />","typography":"<path d=\"M4 20l3 0\" />\n  <path d=\"M14 20l7 0\" />\n  <path d=\"M6.9 15l6.9 0\" />\n  <path d=\"M10.2 6.3l5.8 13.7\" />\n  <path d=\"M5 20l6 -16l2 0l7 16\" />","writing":"<path d=\"M20 17v-12c0 -1.121 -.879 -2 -2 -2s-2 .879 -2 2v12l2 2l2 -2z\" />\n  <path d=\"M16 7h4\" />\n  <path d=\"M18 19h-13a2 2 0 1 1 0 -4h4a2 2 0 1 0 0 -4h-3\" />","writing-sign":"<path d=\"M3 19c3.333 -2 5 -4 5 -6c0 -3 -1 -3 -2 -3s-2.032 1.085 -2 3c.034 2.048 1.658 2.877 2.5 4c1.5 2 2.5 2.5 3.5 1c.667 -1 1.167 -1.833 1.5 -2.5c1 2.333 2.333 3.5 4 3.5h2.5\" />\n  <path d=\"M20 17v-12c0 -1.121 -.879 -2 -2 -2s-2 .879 -2 2v12l2 2l2 -2z\" />\n  <path d=\"M16 7h4\" />","pencil":"<path d=\"M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4\" />\n  <path d=\"M13.5 6.5l4 4\" />","ballpen":"<path d=\"M14 6l7 7l-4 4\" />\n  <path d=\"M5.828 18.172a2.828 2.828 0 0 0 4 0l10.586 -10.586a2 2 0 0 0 0 -2.829l-1.171 -1.171a2 2 0 0 0 -2.829 0l-10.586 10.586a2.828 2.828 0 0 0 0 4z\" />\n  <path d=\"M4 20l1.768 -1.768\" />","rubber-stamp":"<path d=\"M21 17.85h-18c0 -4.05 1.421 -4.05 3.79 -4.05c5.21 0 1.21 -4.59 1.21 -6.8a4 4 0 1 1 8 0c0 2.21 -4 6.8 1.21 6.8c2.369 0 3.79 0 3.79 4.05z\" />\n  <path d=\"M5 21h14\" />","mail-opened":"<path d=\"M3 9l9 6l9 -6l-9 -6l-9 6\" />\n  <path d=\"M21 9v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10\" />\n  <path d=\"M3 19l6 -6\" />\n  <path d=\"M15 13l6 6\" />","mail":"<path d=\"M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z\" />\n  <path d=\"M3 7l9 6l9 -6\" />","send":"<path d=\"M10 14l11 -11\" />\n  <path d=\"M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5\" />","rss":"<path d=\"M5 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />\n  <path d=\"M4 4a16 16 0 0 1 16 16\" />\n  <path d=\"M4 11a9 9 0 0 1 9 9\" />","broadcast":"<path d=\"M18.364 19.364a9 9 0 1 0 -12.728 0\" />\n  <path d=\"M15.536 16.536a5 5 0 1 0 -7.072 0\" />\n  <path d=\"M12 13m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />","polygon":"<path d=\"M12 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M19 8m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M5 11m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M15 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M6.5 9.5l3.5 -3\" />\n  <path d=\"M14 5.5l3 1.5\" />\n  <path d=\"M18.5 10l-2.5 7\" />\n  <path d=\"M13.5 17.5l-7 -5\" />","lasso-polygon":"<path d=\"M4.028 13.252l-1.028 -3.252l2 -7l7 5l8 -3l1 9l-9 3l-5.144 -1.255\" />\n  <path d=\"M5 15m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M5 17c0 1.42 .316 2.805 1 4\" />","shape":"<path d=\"M5 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M19 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M5 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M19 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M5 7l0 10\" />\n  <path d=\"M7 5l10 0\" />\n  <path d=\"M7 19l10 0\" />\n  <path d=\"M19 7l0 10\" />","shape-2":"<path d=\"M5 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M19 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M19 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M5 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M6.5 17.5l11 -11m-12.5 .5v10m14 -10v10\" />","shape-3":"<path d=\"M5 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M19 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M19 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M5 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M7 5h10m-12 2v10m14 -10v10\" />","artboard":"<path d=\"M8 8m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M3 8l1 0\" />\n  <path d=\"M3 16l1 0\" />\n  <path d=\"M8 3l0 1\" />\n  <path d=\"M16 3l0 1\" />\n  <path d=\"M20 8l1 0\" />\n  <path d=\"M20 16l1 0\" />\n  <path d=\"M8 20l0 1\" />\n  <path d=\"M16 20l0 1\" />","color-swatch":"<path d=\"M19 3h-4a2 2 0 0 0 -2 2v12a4 4 0 0 0 8 0v-12a2 2 0 0 0 -2 -2\" />\n  <path d=\"M13 7.35l-2 -2a2 2 0 0 0 -2.828 0l-2.828 2.828a2 2 0 0 0 0 2.828l9 9\" />\n  <path d=\"M7.3 13h-2.3a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h12\" />\n  <path d=\"M17 17l0 .01\" />","palette":"<path d=\"M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25\" />\n  <path d=\"M8.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />\n  <path d=\"M12.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />\n  <path d=\"M16.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />","brush":"<path d=\"M3 21v-4a4 4 0 1 1 4 4h-4\" />\n  <path d=\"M21 3a16 16 0 0 0 -12.8 10.2\" />\n  <path d=\"M21 3a16 16 0 0 1 -10.2 12.8\" />\n  <path d=\"M10.6 9a9 9 0 0 1 4.4 4.4\" />","vector-bezier-arc":"<path d=\"M3 10m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M17 10m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M10 3m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M10 17m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M19 10a5 5 0 0 0 -5 -5\" />\n  <path d=\"M5 14a5 5 0 0 0 5 5\" />\n  <path d=\"M5 10a5 5 0 0 1 5 -5\" />","vector":"<path d=\"M3 3m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M17 3m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M17 17m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M3 17m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M5 7l0 10\" />\n  <path d=\"M19 7l0 10\" />\n  <path d=\"M7 5l10 0\" />\n  <path d=\"M7 19l10 0\" />","vector-triangle":"<path d=\"M10 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M3 17m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M17 17m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M6.5 17.1l5 -9.1\" />\n  <path d=\"M17.5 17.1l-5 -9.1\" />\n  <path d=\"M7 19l10 0\" />","vector-bezier":"<path d=\"M3 14m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M17 14m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M10 6m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M10 8.5a6 6 0 0 0 -5 5.5\" />\n  <path d=\"M14 8.5a6 6 0 0 1 5 5.5\" />\n  <path d=\"M10 8l-6 0\" />\n  <path d=\"M20 8l-6 0\" />\n  <path d=\"M3 8m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />\n  <path d=\"M21 8m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />","vector-bezier-2":"<path d=\"M3 3m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M17 17m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M7 5l7 0\" />\n  <path d=\"M10 19l7 0\" />\n  <path d=\"M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />\n  <path d=\"M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />\n  <path d=\"M7 5.5a5 6.5 0 0 1 5 6.5a5 6.5 0 0 0 5 6.5\" />","vector-spline":"<path d=\"M17 3m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M3 17m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\" />\n  <path d=\"M17 5c-6.627 0 -12 5.373 -12 12\" />","geometry":"<path d=\"M7 21l4 -12m2 0l1.48 4.439m.949 2.847l1.571 4.714\" />\n  <path d=\"M12 7m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M4 12c1.526 2.955 4.588 5 8 5c3.41 0 6.473 -2.048 8 -5\" />\n  <path d=\"M12 5v-2\" />","pentagram":"<path d=\"M5.636 5.636a9 9 0 1 1 12.728 12.728a9 9 0 0 1 -12.728 -12.728z\" />\n  <path d=\"M15.236 11l5.264 4h-6.5l-2 6l-2 -6h-6.5l5.276 -4l-2.056 -6.28l5.28 3.78l5.28 -3.78z\" />","hexagons":"<path d=\"M4 18v-5l4 -2l4 2v5l-4 2z\" />\n  <path d=\"M8 11v-5l4 -2l4 2v5\" />\n  <path d=\"M12 13l4 -2l4 2v5l-4 2l-4 -2\" />","hexagonal-prism":"<path d=\"M20.792 6.996l-3.775 2.643a2.005 2.005 0 0 1 -1.147 .361h-7.74c-.41 0 -.81 -.126 -1.146 -.362l-3.774 -2.641\" />\n  <path d=\"M8 10v11\" />\n  <path d=\"M16 10v11\" />\n  <path d=\"M3.853 18.274l3.367 2.363a2 2 0 0 0 1.147 .363h7.265c.41 0 .811 -.126 1.147 -.363l3.367 -2.363c.536 -.375 .854 -.99 .854 -1.643v-9.262c0 -.655 -.318 -1.268 -.853 -1.643l-3.367 -2.363a2 2 0 0 0 -1.147 -.363h-7.266c-.41 0 -.811 .126 -1.147 .363l-3.367 2.363a2.006 2.006 0 0 0 -.853 1.644v9.261c0 .655 .318 1.269 .853 1.644z\" />","diamonds":"<path d=\"M10.831 20.413l-5.375 -6.91c-.608 -.783 -.608 -2.223 0 -3l5.375 -6.911a1.457 1.457 0 0 1 2.338 0l5.375 6.91c.608 .783 .608 2.223 0 3l-5.375 6.911a1.457 1.457 0 0 1 -2.338 0z\" />"};
  function renderCardIcon(id){if(id?.startsWith('tabler-')&&cornerIconPaths[id.slice(7)])return glyph(cornerIconPaths[id.slice(7)]);const m=/^theme-(cosmos|paper)-(\d+)$/.exec(id||'');return m&&themeDrawings[m[1]][Number(m[2])]?glyph(themeDrawings[m[1]][Number(m[2])][1]):ENTITY_ICONS[id]?entityIcon(id):cardsIcon;}
  const followsTheme=g=>g.iconMode==='theme'||(!g.iconMode&&!g.icon&&!Object.hasOwn(g,'art'));
  function themeChoices(){const key=cornerTheme();if(cornerIconCatalog[key])return cornerIconCatalog[key].map(x=>({id:'tabler-'+x.id,name:x.name}));if(themeDrawings[key])return themeDrawings[key].map(([name],i)=>({id:'theme-'+key+'-'+i,name}));return (themeIconSets[key]||themeIconSets.base).split(' ').map(id=>({id:'lib-'+id,name:themeIconNames[id]||id}));}
  function themeIconId(g){const choices=themeChoices(),slot=Number.isInteger(g.iconSlot)?g.iconSlot:Math.max(0,collection().groups.findIndex(x=>x.id===g.id));return choices[slot%choices.length].id;}
  const cardIcon=g=>isInbox(g)?renderCardIcon('lib-Inbox'):followsTheme(g)?renderCardIcon(themeIconId(g)):g.icon?renderCardIcon(g.icon):glyph(drawings[(g.art||0)%drawings.length]);
  function orderedRefs(g){const list=[...g.refs];if(!isInbox(g)&&g.sort==='frequency'){const counts=collection().usage||{};list.sort((a,b)=>(counts[safeURL(b.url)]||0)-(counts[safeURL(a.url)]||0));}return list;}
  const owner = () => signed ? (prefs.accountProfile?.id || 'local-account') : 'guest';
  function moduleCollection(moduleId=activeModule) {
    const meta=CORNER_MODULES[moduleId]||CORNER_MODULES.common;
    const rootKey=moduleId==='common'?'cornerCollections':'cornerModules';
    prefs[rootKey] ??= {};
    if(moduleId==='common'){
      const library=prefs[rootKey][owner()] ??= {groups:[]};
      if(library.stageVersion!==2&&cardLimit()!==null){
        const names=meta.groups;
        while(library.groups.filter(g=>!isInbox(g)).length<Math.min(3,cardLimit())){const i=library.groups.filter(g=>!isInbox(g)).length;library.groups.push({id:uid(),name:names[i],iconMode:'theme',iconSlot:i,refs:[]});}
        library.stageVersion=2;persist();
      }
      ensureInbox(library);return library;
    }
    const account=prefs[rootKey][owner()] ??= {};
    const library=account[moduleId] ??= {groups:[],stageVersion:1};
    if(!library.groups.some(g=>!isInbox(g))){
      meta.groups.forEach((name,i)=>library.groups.push({id:uid(),name,iconMode:'theme',iconSlot:i,refs:[]}));
      persist();
    }
    if(moduleId==='memo'&&library.notes===undefined){
      const now=Date.now();library.notes=[
        {id:uid(),title:'一念',content:'把尚未成形的念头，先轻轻放在这里。',updatedAt:now-1000*60*18,icon:'✦'},
        {id:uid(),title:'留白',content:'有些答案不必急着抵达，留一点空白给明天。',updatedAt:now-1000*60*60*5,icon:'◌'},
        {id:uid(),title:'拾光',content:'记下此刻看见的微小光亮，日后仍会认出它。',updatedAt:now-1000*60*60*24,icon:'⌁'},
        {id:uid(),title:'未完的句子',content:'让灵感停在半句，也是一种温柔的保存。',updatedAt:now-1000*60*60*48,icon:'…'}
      ];persist();
    }
    if(moduleId==='todo'&&library.tasks===undefined){
      const base=new Date();base.setHours(0,0,0,0);const iso=d=>d.toISOString().slice(0,10);
      library.tasks=[
        {id:uid(),title:'晨间整理',date:iso(base),start:8*60,duration:60,color:'sand',status:'today'},
        {id:uid(),title:'推进重要事项',date:iso(base),start:9*60,duration:180,color:'blue',status:'today'},
        {id:uid(),title:'留一段专注时间',date:iso(base),start:13*60,duration:180,color:'teal',status:'today'},
        {id:uid(),title:'收束今日工作',date:iso(base),start:17*60,duration:60,color:'olive',status:'today'}
      ];library.inbox=[{id:uid(),title:'还未决定日期的事项'}];persist();
    }
    ensureInbox(library);return library;
  }
  function ensureInbox(library){
    if(!library.groups.some(isInbox)){
      library.groups.unshift({id:uid(),system:'inbox',name:'暂存',iconMode:'manual',icon:'lib-Inbox',refs:[]});persist();
    }
    const inbox=library.groups.find(isInbox);
    if(inbox.name!=='暂存'||inbox.icon!=='lib-Inbox'||inbox.iconMode!=='manual'||inbox.color||inbox.sort||inbox.art!==undefined){
      Object.assign(inbox,{name:'暂存',icon:'lib-Inbox',iconMode:'manual'});delete inbox.color;delete inbox.sort;delete inbox.art;persist();
    }
  }
  function collection(){return moduleCollection(activeModule);}
  function sources() {
    return data.flatMap(s => s.scenes.flatMap(c => c.groups.flatMap(g => g.items.map(item => ({
      sid:s.id,cid:c.id,gid:g.id,url:item[1],item,path:`${s.name} / ${c.name} / ${g.name}`
    })))));
  }
  function resolve(ref, entries = sources()) {
    if(ref.own)return {item:ref.own,url:ref.url,path:'我的一隅'};
    return entries.find(x => x.gid === ref.gid && x.url === ref.url) || entries.find(x => x.url === ref.url);
  }
  const safeURL = value => { try { const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:'#'; } catch { return '#'; } };
  function dialog(id, title) {
    const d=document.createElement('dialog');d.id=id;d.className='corner-dialog';d.setAttribute('aria-label',title);
    document.body.append(d);
    d.addEventListener('click',e=>{if(e.target.closest('[data-corner-close]')){if(d.id==='my-corner')closeCorner();else d.close();}});
    // A modal is intentional: leaving the trigger must not dismiss a working collection.
    return d;
  }
  const heading = (title, subtitle='') => `<div class="dialog-heading"><div><h2>${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</div><button type="button" data-corner-close aria-label="关闭">×</button></div>`;
  function cornerRevealGeometry(point) {
    const x=Math.max(0,Math.min(innerWidth,point.x)),y=Math.max(0,Math.min(innerHeight,point.y));
    const radius=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))+32;
    const wave=(size,amplitude=0,phase=0)=>`polygon(${Array.from({length:96},(_,i)=>{
      const angle=i*Math.PI/48,flow=amplitude*(.88*Math.sin(6*angle+phase)+.12*Math.sin(12*angle-phase*.8));
      const r=Math.max(0,size+flow);
      return `${(x+r*Math.cos(angle)).toFixed(2)}px ${(y+r*Math.sin(angle)).toFixed(2)}px`;
    }).join(',')})`;
    return {radius,wave,full:wave(radius),closed:wave(0)};
  }
  function closeCorner() {
    if(!panel?.open||cornerClosing)return;
    if(reduced()||typeof panel.animate!=='function'){panel.close();return;}
    cornerClosing=true;
    const interrupted=Boolean(cornerRevealAnimation);
    const currentClip=getComputedStyle(panel).clipPath;
    panel.style.setProperty('--corner-backdrop-from',getComputedStyle(panel,'::backdrop').opacity||'1');
    cornerRevealAnimation?.cancel();
    cornerRevealAnimation=null;
    const r=entryAnchor||origin?.getBoundingClientRect()||{left:innerWidth/2,top:innerHeight,width:0,height:0};
    const shape=cornerRevealGeometry(panel._orbitRevealPoint||{x:r.left+r.width/2,y:r.top+r.height/2});
    const from=interrupted&&currentClip.startsWith('polygon(')?currentClip:shape.full;
    panel.style.clipPath=from;
    panel.classList.remove('corner-reveal-opening');
    panel.classList.add('corner-reveal-closing');
    const frames=interrupted?[{clipPath:from},{clipPath:shape.closed}]:[
      {clipPath:from,offset:0},
      {clipPath:shape.wave(shape.radius*.77,45,3.9),offset:.28},
      {clipPath:shape.wave(shape.radius*.43,43,2.2),offset:.59},
      {clipPath:shape.wave(shape.radius*.15,20,.8),offset:.83},
      {clipPath:shape.closed,offset:1}
    ];
    const animation=panel.animate(frames,{duration:520,easing:'cubic-bezier(.45,0,.65,1)',fill:'forwards'});
    cornerRevealAnimation=animation;
    animation.finished.then(()=>{if(panel.open&&cornerRevealAnimation===animation)panel.close();},()=>{});
  }
  function requireCornerModuleAuth(moduleId){
    if(signed)return true;
    const label=cornerModuleConfig(moduleId)?.entryName||cornerModuleConfig(moduleId)?.name||'这个模块';
    if(typeof openLogin==='function')openLogin('登录后即可进入'+label+'。');
    else if(typeof show==='function')show('#login');
    else document.querySelector('#login')?.showModal?.();
    return false;
  }
  function openCorner(trigger, groupId, event, moduleId='common') {
    if(!requireCornerModuleAuth(moduleId))return;
    if(panel?.open){closeCorner();return;}
    prepareCardAudio();
    activeModule=cornerModuleConfig(moduleId)?.enabled!==false?moduleId:(enabledCornerModuleIds()[0]||'common');
    const meta=moduleMeta();
    origin=trigger||document.activeElement;
    if(!panel){
      panel=dialog('my-corner',meta.panelName||meta.name);
      panel.addEventListener('close',()=>{cornerRevealAnimation?.cancel();cornerRevealAnimation=null;cornerClosing=false;panel.style.clipPath='';panel.style.removeProperty('--corner-backdrop-from');panel.classList.remove('corner-reveal-opening','corner-reveal-closing','memo-editor-mode');finishDrag(true);restoreEntry();flipped.clear();coverOpen.clear();memoEditingId=null;memoFocusId=null;memoWheelLock=0;cancelAnimationFrame(motionFrame);cancelAnimationFrame(fanMotion.frame);fanMotion.frame=0;panel.classList.remove('corner-animating');wheelConsumed=false;swipe=null;});
      panel.addEventListener('pointerdown',startDrag);
      panel.addEventListener('pointerdown',onTodoResizeStart);
      panel.addEventListener('dragstart',e=>{if(e.target.closest('.corner-inbox [data-corner-ref]'))e.preventDefault();});
      panel.addEventListener('dragstart',onTodoDragStart);
      panel.addEventListener('dragover',onTodoDragOver);
      panel.addEventListener('drop',onTodoDrop);
      panel.addEventListener('cancel',e=>{e.preventDefault();if(cornerClosing)return;if(flipped.size)flipCard([...flipped][0],false);else closeCorner();});
      panel.addEventListener('click',onPanelClick);
      panel.addEventListener('change',onPanelChange);
      panel.addEventListener('input',onPanelInput);
      panel.addEventListener('submit',onTodoSubmit);

      panel.addEventListener('pointerover',e=>{const card=e.target.closest?.('[data-corner-card]:not(.corner-inbox)');if(card&&panel.contains(card))card.classList.add('is-pointer-hover');});
      panel.addEventListener('pointerout',e=>{const card=e.target.closest?.('[data-corner-card]:not(.corner-inbox)');if(card&&(!e.relatedTarget||!card.contains(e.relatedTarget)))card.classList.remove('is-pointer-hover');});

      panel.addEventListener('pointerleave',resetFloat);
      panel.addEventListener('keydown',e=>{
        if(e.target.matches('[data-inbox-fold],[data-inbox-unfold]')&&['Enter',' '].includes(e.key)){e.preventDefault();toggleInbox(e.target.closest('.corner-inbox'));return;}
        if(e.target.matches('.corner-card-front')&&['Enter',' '].includes(e.key)){e.preventDefault();activateCard(e.target.closest('[data-corner-card]').dataset.cornerCard);}
      });
      panel.addEventListener('wheel',onWheel,{passive:false});
      panel.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&!e.target.closest('button,a,input,select,.corner-back-scroll'))swipe={x:e.clientX,y:e.clientY};});
      panel.addEventListener('pointerup',e=>{if(!swipe||drag?.active)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;swipe=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3){navigate(Math.sign(-dx));swallowClickUntil=performance.now()+400;}});
      panel.addEventListener('pointercancel',()=>{swipe=null;});
    }
    entryAnchor=null;inboxExpanded=null;flipped.clear();coverOpen.clear();wheelLast=0;wheelConsumed=false;wheelSum=0;wheelLock=0;memoFocusId=null;memoWheelLock=0;panel.setAttribute('aria-label',meta.panelName||meta.name);panel.querySelector('.dialog-heading h2')?.replaceChildren(document.createTextNode(meta.panelName||meta.name));panel.dataset.cornerModule=activeModule;const groups=collection().groups;activeId=groups.find(g=>g.id===groupId)?.id||groups.find(g=>!isInbox(g))?.id||ADD_CARD;syncCornerThemePresentation();renderPanel();
    const r=origin?.getBoundingClientRect()||{left:innerWidth/2,top:innerHeight,width:0,height:0};
    const point=event?.detail&&Number.isFinite(event.clientX)&&Number.isFinite(event.clientY)?{x:event.clientX,y:event.clientY}:{x:r.left+r.width/2,y:r.top+r.height/2};
    panel._orbitRevealPoint=event?.detail?.orbit?point:null;
    const shape=cornerRevealGeometry(point),animateReveal=!reduced()&&typeof panel.animate==='function';
    if(animateReveal){panel.style.clipPath=shape.closed;panel.classList.add('corner-reveal-opening');}
    panel.showModal();moveEntry();
    if(animateReveal){
      const animation=panel.animate([
        {clipPath:shape.closed,offset:0},
        {clipPath:shape.wave(shape.radius*.18,22,.3),offset:.18},
        {clipPath:shape.wave(shape.radius*.45,43,1.3),offset:.4},
        {clipPath:shape.wave(shape.radius*.73,48,2.1),offset:.65},
        {clipPath:shape.wave(shape.radius*.9,25,4.4),offset:.84},
        {clipPath:shape.full,offset:1}
      ],{duration:620,easing:'cubic-bezier(.3,.1,.3,1)',fill:'forwards'});
      cornerRevealAnimation=animation;
      animation.finished.then(()=>{if(cornerRevealAnimation!==animation)return;cornerRevealAnimation=null;animation.cancel();panel.style.clipPath='';panel.classList.remove('corner-reveal-opening');},()=>{});
    }
    syncCornerCords();requestAnimationFrame(layoutFan);
  }
  function cycleCornerTheme(){
    const ids=[...document.querySelectorAll('[data-brand-theme]')].map(el=>el.dataset.brandTheme);if(ids.length<2)return;
    const next=ids[(ids.indexOf(cornerTheme())+1)%ids.length],previousScope=scope;
    restoreEntry();try{scope='global';changeTheme(next);}finally{scope=previousScope;}
    coverOpen.clear();
    syncCornerThemePresentation();
    for(const el of panel.querySelectorAll('[data-corner-card]')){const g=collection().groups.find(g=>g.id===el.dataset.cornerCard);if(!g)continue;el.querySelector('.corner-card-logo').innerHTML=cardIcon(g);const empty=el.querySelector('.corner-empty-lines');if(empty)empty.innerHTML=cardIcon(g);const tmp=document.createElement('template');tmp.innerHTML=backCard(g);const choices=el.querySelector('.corner-icon-choices');if(choices)choices.innerHTML=tmp.content.querySelector('.corner-icon-choices').innerHTML;applyCardColor(el,g);}
    origin=document.querySelector('#dock .corner-entry');moveEntry();syncCornerCords();cornerNotice('已切换为「'+(THEMES[cornerTheme()]?.name||THEMES[dockTheme()]?.name||cornerTheme())+'」');panel.querySelector('[data-corner-next-theme]').blur();
  }
  let noticeTimer;
  function cornerNotice(message){let el=panel.querySelector('.corner-top-notice');if(!el){el=document.createElement('div');el.className='corner-top-notice';el.setAttribute('role','status');el.setAttribute('aria-live','polite');panel.append(el);}el.textContent=message;el.classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.classList.remove('show'),2200);}
  function syncCornerCords(){
    if(!panel?.open)return;
    for(const [kind,selector] of [['color','.color-pull-cord'],['mode','.mode-pull-cord']]){
      const source=document.querySelector('body>'+selector);if(!source)continue;
      let cord=panel.querySelector('[data-corner-cord="'+kind+'"]');
      if(!cord){cord=source.cloneNode(true);cord.removeAttribute('id');cord.dataset.cornerCord=kind;cord.classList.add('corner-pull-cord');panel.append(cord);let start=null,pull=0,suppress=false;
        const change=()=>{if(kind==='mode'){prefs.mode={light:'dark',dark:'system',system:'light'}[prefs.mode||'system'];for(const o of Object.values(overrides))if(o&&o.mode)o.mode=prefs.mode;persist();apply();for(const el of panel.querySelectorAll('[data-corner-card]'))applyCardColor(el,collection().groups.find(g=>g.id===el.dataset.cornerCard));syncCornerCords();cornerNotice('已切换为'+({light:'日间模式',dark:'夜间模式',system:'跟随系统'}[prefs.mode]));}else{const [color,name]=nextPalette();prefs.color=color;prefs.explicitColor=color;persist();apply();syncCornerCords();cornerNotice('已切换为「'+name+'」');}};
        const release=go=>{cord.style.transform='';if(!reduced())cord.animate([{transform:'translateY('+Math.max(pull,12)+'px)'},{transform:'translateY(-3px)',offset:.6},{transform:'translateY(0)'}],{duration:400,easing:'ease-out'});pull=0;if(go)change();};
        cord.onpointerdown=e=>{if(e.button!==0)return;start=e.clientY;cord.setPointerCapture(e.pointerId);};
        cord.onpointermove=e=>{if(start===null)return;pull=Math.max(0,Math.min(65,(e.clientY-start)*.65));cord.style.transform='translateY('+pull+'px)';};
        cord.onpointerup=e=>{if(start===null)return;const dy=e.clientY-start;start=null;suppress=true;release(dy>=24||Math.abs(dy)<6);setTimeout(()=>suppress=false,0);};
        cord.onpointercancel=()=>{start=null;release(false);};
        cord.onclick=e=>{e.stopPropagation();if(!suppress)release(true);};
      }
      const r=source.getBoundingClientRect();cord.style.left=r.left+'px';cord.style.right='auto';cord.style.top=r.top+'px';cord.style.width=r.width+'px';cord.style.height=r.height+'px';
      cord.title=kind==='mode'?'点击或下拉，切换日夜模式':'点击或下拉，切换主颜色';cord.setAttribute('aria-label',cord.title);
      if(kind==='color'){cord.style.setProperty('--cord-color',prefs.color||effective().color);cord.style.setProperty('--next-color',nextPalette()[0]);}
      else cord.dataset.nextMode=source.dataset.nextMode;
    }
  }
  addEventListener('resize',syncCornerCords);
  function moveEntry(){
    if(!origin?.isConnected)return;
    const measured=origin.getBoundingClientRect(),r=entryAnchor||measured,style=getComputedStyle(origin);entryAnchor={left:r.left,top:r.top,width:r.width,height:r.height};
    entrySnapshot={html:origin.innerHTML,title:origin.title,label:origin.getAttribute('aria-label'),style:origin.getAttribute('style'),onclick:origin.onclick};
    entrySlot=document.createElement('span');entrySlot.className='corner-entry-slot';entrySlot.style.cssText='display:block;width:'+r.width+'px;height:'+r.height+'px';origin.before(entrySlot);
    origin.classList.add('corner-close-entry');origin.style.cssText='position:fixed;left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px;color:'+style.color;
    origin.innerHTML='<span class="corner-close-symbol">'+glyph('<path d="m6 6 12 12M18 6 6 18"/>')+'</span><span class="dock-label">关闭</span>';
    origin.setAttribute('aria-label','关闭我的一隅');origin.title='关闭我的一隅';panel.append(origin);
    origin.onclick=e=>{e.preventDefault();e.stopPropagation();closeCorner();};
  }
  function restoreEntry(){
    if(!entrySnapshot)return;
    origin.innerHTML=entrySnapshot.html;origin.title=entrySnapshot.title;origin.setAttribute('aria-label',entrySnapshot.label);origin.onclick=entrySnapshot.onclick;origin.classList.remove('corner-close-entry');
    if(entrySnapshot.style===null)origin.removeAttribute('style');else origin.setAttribute('style',entrySnapshot.style);
    if(entrySlot?.isConnected){entrySlot.replaceWith(origin);origin.focus({preventScroll:true});}else{origin.remove();document.querySelector('.corner-entry')?.focus({preventScroll:true});}
    entrySlot=null;entrySnapshot=null;
  }
  function renderPanel() {

    if(activeModule==='memo'){renderMemoPanel();return;}
    if(activeModule==='todo'){renderTodoPanel();return;}

    const listScroll=new Map([...panel.querySelectorAll('[data-corner-card]')].map(el=>[el.dataset.cornerCard,el.querySelector('.corner-links')?.scrollTop||0]));
    const {groups}=collection(),entries=sources(),meta=moduleMeta();panel.dataset.cornerModule=activeModule;
    const panelName=meta.panelName||meta.name;
    const content='<div class="corner-stage"><div class="corner-stage-heading"><div class="corner-heading-title"><h2><button type="button" data-corner-next-theme title="点击切换主题" aria-label="'+esc(panelName)+'，点击切换下一个主题">'+esc(panelName)+'</button></h2><span class="corner-theme-art" aria-hidden="true"></span></div><p>'+esc(meta.subtitle)+'</p></div><button class="corner-deck-arrow previous" data-corner-page="-1" aria-label="上一组卡片">'+glyph('<path d="m15 5-7 7 7 7"/>')+'</button><div class="corner-deck" aria-label="'+esc(panelName)+'分组卡牌" title="滚轮切换 · Shift + 滚轮快速切换">'+groups.map((g,i)=>card(g,i,entries)).join('')+newCardMarkup()+'</div><button class="corner-deck-arrow next" data-corner-page="1" aria-label="下一组卡片">'+glyph('<path d="m9 5 7 7-7 7"/>')+'</button></div>';
    let body=panel.querySelector('.corner-body');if(!body){body=document.createElement('div');body.className='corner-body';panel.append(body);}body.innerHTML=content;
    syncCornerThemePresentation();
    layoutFan();
    for(const el of panel.querySelectorAll('[data-corner-card]')){el.querySelector('.corner-links').scrollTop=listScroll.get(el.dataset.cornerCard)||0;if(el.classList.contains('corner-inbox'))syncInbox(el);else{syncFaces(el);el.classList.add('is-settled');}applyCardColor(el,groups.find(g=>g.id===el.dataset.cornerCard));}
    requestAnimationFrame(updateArrows);
  }
  function memoLibrary(){return moduleCollection('memo');}
  function memoTime(value){const date=new Date(Number(value)||Date.now()),today=new Date();const pad=n=>String(n).padStart(2,'0');if(date.toDateString()===today.toDateString())return '今日 '+pad(date.getHours())+':'+pad(date.getMinutes());return date.getFullYear()+'.'+pad(date.getMonth()+1)+'.'+pad(date.getDate());}
  function memoNotes(){return [...(panel?.querySelectorAll('.memo-note')||[])];}
  function syncMemoFocus(){for(const note of memoNotes())note.classList.toggle('is-focus',note.dataset.memoCard===memoFocusId);}
  function memoScrollTo(id,behavior=reduced()?'auto':'smooth'){
    const board=panel?.querySelector('.memo-board'),note=panel?.querySelector('.memo-note[data-memo-card="'+id+'"]');
    if(!board||!note)return;
    const left=note.offsetLeft+note.offsetWidth/2-board.clientWidth/2;
    board.scrollTo({left:Math.max(0,Math.min(board.scrollWidth-board.clientWidth,left)),behavior});
  }
  function focusMemo(direction){
    const notes=memoNotes();if(!notes.length)return;
    let index=notes.findIndex(note=>note.dataset.memoCard===memoFocusId);if(index<0){index=0;memoFocusId=notes[0].dataset.memoCard;}
    const next=Math.max(0,Math.min(notes.length-1,index+(direction>0?1:-1)));memoFocusId=notes[next].dataset.memoCard;syncMemoFocus();memoScrollTo(memoFocusId);
  }
  function memoNoteMarkup(note,index){const editing=memoEditingId===note.id,focused=memoFocusId===note.id;return '<article class="memo-note '+(editing?'is-editing ':'')+(focused?'is-focus':'')+'" data-memo-card="'+note.id+'" style="--memo-order:'+index+';--memo-y:'+((note.__memoCount-index-1)*28)+'px;--memo-tilt:'+((index%2?-1:1)*1.2)+'deg"><div class="memo-note-paper"><div class="memo-note-rule" aria-hidden="true"></div><div class="memo-note-head"><span class="memo-note-icon" aria-hidden="true">'+esc(note.icon||'✦')+'</span><span class="memo-note-time">'+esc(memoTime(note.updatedAt))+'</span></div><h3>'+esc(note.title||'无题')+'</h3><p>'+esc(note.content||'还没有写下什么。')+'</p><footer><span>小记 · '+String(index+1).padStart(2,'0')+'</span><button type="button" class="memo-note-edit" data-memo-edit="'+note.id+'" aria-label="编辑 '+esc(note.title||'这则小记')+'">编辑</button></footer></div></article>';}
  function memoEditorMarkup(note){if(!note)return '';return '<section class="memo-editor" role="dialog" aria-modal="true" aria-label="编辑小记"><div class="memo-editor-top"><span class="memo-editor-kicker">正在写下</span><button type="button" data-memo-done aria-label="完成编辑" title="完成">'+glyph('<path d="m5 12 4 4L19 6"/>')+'</button></div><label class="memo-editor-title"><span>标题</span><input data-memo-title="'+note.id+'" maxlength="60" value="'+esc(note.title||'')+'" placeholder="给这一刻留一个名字"></label><label class="memo-editor-content"><span>内容</span><textarea data-memo-content="'+note.id+'" maxlength="2000" placeholder="让想法慢慢展开……">'+esc(note.content||'')+'</textarea></label><div class="memo-editor-meta"><span>'+esc(note.icon||'✦')+'</span><span>最后编辑于 '+esc(memoTime(note.updatedAt))+'</span></div></section>';}
  function renderMemoPanel(){
    const library=memoLibrary(),notes=(Array.isArray(library.notes)?library.notes:[]).map((note,index)=>({...note,__memoOriginalIndex:index})).sort((a,b)=>(Number(a.updatedAt)||0)-(Number(b.updatedAt)||0)||a.__memoOriginalIndex-b.__memoOriginalIndex).map(note=>({...note,__memoCount:library.notes.length})),meta=moduleMeta();panel.dataset.cornerModule='memo';
    if(notes.length&&!notes.some(note=>note.id===memoFocusId))memoFocusId=notes[notes.length-1].id;
    const editor=memoEditingId?memoEditorMarkup(notes.find(note=>note.id===memoEditingId)):'';
    const panelName=meta.panelName||meta.name;
    const content='<div class="corner-stage memo-stage"><div class="corner-stage-heading"><div class="corner-heading-title"><h2><button type="button" data-corner-next-theme title="点击切换主题" aria-label="'+esc(panelName)+'，点击切换下一个主题">'+esc(panelName)+'</button></h2><span class="corner-theme-art" aria-hidden="true"></span></div><p>'+esc(meta.subtitle)+'</p></div><div class="memo-board" aria-label="小记卡片，滚轮移动"><div class="memo-track">'+(notes.length?notes.map(memoNoteMarkup).join(''):'<div class="memo-empty"><span>✦</span><p>还没有留下小记</p><small>把此刻的灵感，收进一张纸里</small></div>')+'<button type="button" class="memo-add" data-memo-new aria-label="新建小记"><span>＋</span><strong>写下一笔</strong><small>让念头有处可去</small></button></div></div>'+editor+'</div>';
    let body=panel.querySelector('.corner-body');if(!body){body=document.createElement('div');body.className='corner-body';panel.append(body);}body.innerHTML=content;panel.classList.toggle('memo-editor-mode',Boolean(editor));syncCornerThemePresentation();
    const title=panel.querySelector('[data-memo-title]');requestAnimationFrame(()=>{if(title&&editor)title.focus();if(memoFocusId)memoScrollTo(memoFocusId,editor?'auto':'smooth')});
  }
  function card(g,index,entries) {
    const skin=cornerThemeSkin();
    const live=orderedRefs(g).map(r=>({ref:r,source:resolve(r,entries)})).filter(x=>x.source);

    const meta=moduleMeta(),countLabel=meta.countLabel;
    const markup='<article class="corner-card '+(isInbox(g)?'corner-inbox ':'')+(flipped.has(g.id)?'is-flipped ':'')+(coverOpen.has(g.id)?'is-cover-open':'')+'" data-corner-card="'+g.id+'" data-corner-object="'+skin.object+'" data-corner-cover="'+skin.cover+'" data-corner-flip="'+skin.flip+'" style="--card-order:'+index+'"><div class="corner-card-turn"><section class="corner-card-front" tabindex="0" aria-label="'+esc(g.name)+'，点击卡牌翻面编辑"><div class="corner-card-cover" '+(isInbox(g)?'title="暂存 · 点击翻面编辑"':'data-corner-drag-group="'+g.id+'" title="点击封面展开，点击下方编辑"')+'><span class="corner-card-number">'+(isInbox(g)?'默认':String(index).padStart(2,'0'))+'</span><span class="corner-card-logo">'+cardIcon(g)+'</span><h3>'+esc(g.name)+'</h3><small>'+live.length+' '+countLabel+'</small></div><div class="corner-links">'+live.map(({ref:r,source:x})=>'<div class="corner-link" data-corner-ref="'+r.id+'"><button class="corner-grip" data-corner-drag-ref="'+r.id+'" title="长按拖动网址" aria-label="拖动 '+esc(x.item[0])+'">'+grip+'</button><a href="'+esc(safeURL(x.url))+'" target="_blank" rel="noopener noreferrer" title="'+esc(x.item[0]+' · '+x.url+' · '+x.path)+'"><i>'+bookmarkMark(x.item)+'</i><span>'+esc(x.item[0])+'</span></a><button class="corner-link-remove" data-corner-remove="'+r.id+'" title="移出一隅" aria-label="移出一隅：'+esc(x.item[0])+'">移出一隅</button><a class="corner-link-open" href="'+esc(safeURL(x.url))+'" target="_blank" rel="noopener noreferrer" aria-label="打开 '+esc(x.item[0])+'">'+glyph('<path d="M6 18 18 6M7 6h11v11"/>')+'</a></div>').join('')+(!live.length?'<div class="corner-card-empty"><div class="corner-empty-lines">'+cardIcon(g)+'</div><p>'+(isInbox(g)?'还没想好放哪里，先留在这里':meta.empty)+'</p><small>'+(isInbox(g)?'之后可拖动网址到其他卡牌':meta.emptyHint)+'</small></div>':'')+'</div><span class="corner-flip-hint"><span class="corner-flip-copy">点击下方卡面翻面编辑</span> '+'<button type="button" data-corner-add-links="'+g.id+'" aria-label="为'+esc(g.name)+'添加网址" title="添加网址，可批量添加">'+glyph('<path d="M12 5v14M5 12h14"/>')+'</button></span></section><section class="corner-card-back" tabindex="-1" aria-label="编辑 '+esc(g.name)+'">'+backCard(g,live,entries)+'</section></div></article>';
    if(!isInbox(g))return markup;
    const template=document.createElement('template');template.innerHTML=markup;
    const front=template.content.querySelector('.corner-card-front');front.setAttribute('aria-label','暂存');
    const cover=template.content.querySelector('.corner-card-cover');cover.title='点击收起暂存';cover.dataset.inboxFold='';cover.setAttribute('role','button');cover.tabIndex=0;cover.setAttribute('aria-label','收起暂存');
    const back=template.content.querySelector('.corner-card-back');back.classList.add('corner-inbox-lid');back.setAttribute('aria-label','展开暂存');back.setAttribute('role','button');back.tabIndex=0;back.dataset.inboxUnfold='';
    back.innerHTML='<div class="corner-inbox-note"><span>把片刻留在这里</span><p>有些遇见，不必急着安放。<br>留一处空白，等日子慢慢作答。</p></div>';
    template.content.querySelector('.corner-inbox').classList.toggle('is-inbox-open',inboxExpanded??live.length>0);
    const hint=template.content.querySelector('.corner-flip-hint');hint.textContent='点击空白处，暂且收起';
    const empty=template.content.querySelector('.corner-card-empty small');if(empty)empty.textContent='随时打开，也可以移出';
    return template.innerHTML;
  }
  function applyCardColor(el,g){
    if(!el||!g||isInbox(g))return;
    const palette=cardColors.find(c=>c.id===g.color),custom=/^#[0-9a-f]{6}$/i.test(g.color||''),dark=document.body.dataset.dark==='true';
    for(const key of ['--surface','--ink','--accent','--muted','--corner-cover-face','--corner-cover-ink','--corner-cover-muted','--corner-cover-header','--corner-cover-header-ink','--corner-vinyl-ink','--corner-vinyl-paper','--corner-space-ink','--corner-star'])el.style.removeProperty(key);
    const root=getComputedStyle(document.body);
    const fallbackSurface=root.getPropertyValue('--surface').trim()||(dark?'#242b29':'#ffffff');
    const fallbackInk=root.getPropertyValue('--ink').trim()||(dark?'#f1f5f2':'#27312b');
    const fallbackAccent=root.getPropertyValue('--accent').trim()||'#587b64';
    const surface=palette?(dark?palette.dark:palette.light):custom?'color-mix(in srgb,'+g.color+' '+(dark?'23% , #20252b':'16%, #ffffff')+')':fallbackSurface;
    const ink=palette?(dark?palette.night:palette.ink):custom?(dark?'#f4f5f7':'#252b34'):fallbackInk;
    const accent=palette?palette.accent:custom?g.color:fallbackAccent;
    el.style.setProperty('--surface',surface);el.style.setProperty('--ink',ink);el.style.setProperty('--accent',accent);
    el.style.setProperty('--muted','color-mix(in srgb,var(--ink) 78%,var(--surface))');
    // Covers use their own contrast pair. This keeps the cover readable even
    // when the card palette and the page theme switch at the same time.
    const coverFace=dark?'color-mix(in srgb,'+surface+' 90%,#0b100d)':'color-mix(in srgb,'+surface+' 92%,#ffffff)';
    const coverInk=ink;
    const coverMuted=dark?'#cbd8d0':'#5d6a61';
    const coverHeader=dark?'color-mix(in srgb,'+surface+' 58%,#080d0b)':'color-mix(in srgb,'+surface+' 88%,'+accent+')';
    el.style.setProperty('--corner-cover-face',coverFace);el.style.setProperty('--corner-cover-ink',coverInk);el.style.setProperty('--corner-cover-muted',coverMuted);el.style.setProperty('--corner-cover-header',coverHeader);el.style.setProperty('--corner-cover-header-ink',coverInk);
    el.style.setProperty('--corner-vinyl-ink',dark?'color-mix(in srgb,'+surface+' 68%,#080a0a)':'color-mix(in srgb,'+surface+' 70%,#d0ddd4)');
    el.style.setProperty('--corner-vinyl-paper',dark?'#f5ead1':'#28332d');
    el.style.setProperty('--corner-space-ink',dark?'color-mix(in srgb,'+surface+' 68%,#081329)':'color-mix(in srgb,'+surface+' 78%,#ffffff)');
    el.style.setProperty('--corner-star',dark?'#e9f1ff':'#2b4059');
  }
  function todoLibrary(){return moduleCollection('todo');}
  function todoDateKey(date){return date.toISOString().slice(0,10)}
  function todoWeekStart(){const d=new Date();d.setHours(0,0,0,0);const day=d.getDay()||7;d.setDate(d.getDate()-day+1);return d}
  function todoTime(min){const h=Math.floor(min/60),m=min%60;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')}
  function todoWeekMarkup(library){
    const start=todoWeekStart(),days=Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d}),today=todoDateKey(new Date());
    const labels=['一','二','三','四','五','六','日'];
    const head=days.map((d,i)=>'<div class="todo-day-head '+(todoDateKey(d)===today?'is-today':'')+'"><span>周'+labels[i]+'</span><b>'+d.getDate()+'</b></div>').join('');
    const rows=Array.from({length:24},(_,i)=>'<div class="todo-hour"><span>'+String(i).padStart(2,'0')+':00</span></div>').join('');
    const grid=days.map(d=>'<div class="todo-day-column" data-todo-date="'+todoDateKey(d)+'"></div>').join('');
    const events=(library.tasks||[]).filter(t=>days.some(d=>todoDateKey(d)===t.date)).map(t=>{const col=days.findIndex(d=>todoDateKey(d)===t.date);return '<article class="todo-event todo-'+(t.color||'blue')+'" draggable="true" data-todo-task="'+t.id+'" style="--todo-col:'+(col+1)+';--todo-start:'+Number(t.start||540)+';--todo-duration:'+Number(t.duration||60)+'"><button class="todo-event-resize" data-todo-resize="'+t.id+'" aria-label="调整时长"></button><strong>'+esc(t.title)+'</strong><small>'+todoTime(t.start||540)+' – '+todoTime((t.start||540)+(t.duration||60))+'</small></article>'}).join('');
    return '<div class="todo-week"><div class="todo-calendar-head"><div class="todo-month-label">'+(start.getMonth()+1)+'月 · 本周</div>'+head+'</div><div class="todo-calendar-body"><div class="todo-time-axis">'+rows+'</div><div class="todo-grid">'+grid+'<div class="todo-grid-lines">'+rows+'</div>'+events+'</div></div></div>';
  }
  function renderTodoPanel(){
    const library=todoLibrary(),meta=moduleMeta(),view=library.view||'week';panel.dataset.cornerModule='todo';
    const inbox=(library.inbox||[]).map(item=>'<div class="todo-inbox-item" draggable="true" data-todo-inbox="'+item.id+'"><span>○</span>'+esc(item.title)+'</div>').join('');
    const board=(library.tasks||[]).map(t=>'<article class="todo-board-item todo-'+(t.color||'blue')+'" draggable="true" data-todo-task="'+t.id+'"><span>○</span><strong>'+esc(t.title)+'</strong><small>'+esc(t.date||'未排期')+'</small></article>').join('');
    const content='<div class="corner-stage todo-stage"><div class="corner-stage-heading"><div class="corner-heading-title"><h2>'+esc(meta.panelName||meta.name)+'</h2></div><p>把要做的事，安放在合适的时刻</p></div><div class="todo-toolbar"><div class="todo-view-switch"><button type="button" data-todo-view="week" class="'+(view==='week'?'is-active':'')+'">周视图</button><button type="button" data-todo-view="board" class="'+(view==='board'?'is-active':'')+'">看板视图</button></div><button type="button" class="todo-add" data-todo-add>＋ 新增事项</button></div><div class="todo-layout"><aside class="todo-inbox"><div class="todo-inbox-title"><strong>收集箱</strong><span>'+((library.inbox||[]).length)+'</span></div><p>还没决定日期的事项，先放在这里。</p><div class="todo-inbox-list">'+(inbox||'<small class="todo-empty">收集箱很安静</small>')+'</div><form class="todo-inbox-form" data-todo-form><input name="title" placeholder="添加一件待安排的事" aria-label="添加待安排事项"><button>添加</button></form></aside><main class="todo-main">'+(view==='week'?todoWeekMarkup(library):'<div class="todo-board">'+['today','doing','done'].map((status,i)=>'<section class="todo-board-column" data-todo-status="'+status+'"><header><strong>'+['今天','进行中','已完成'][i]+'</strong><span>'+((library.tasks||[]).filter(t=>(t.status||'today')===status).length)+'</span></header>'+((library.tasks||[]).filter(t=>(t.status||'today')===status).map(t=>'<article class="todo-board-item todo-'+(t.color||'blue')+'" draggable="true" data-todo-task="'+t.id+'"><span>○</span><strong>'+esc(t.title)+'</strong><small>'+esc(t.date||'未排期')+'</small></article>').join('')||'<div class="todo-board-empty">把事项拖到这里</div>')+'</section>').join('')+'</div>')+'</main></div></div>';
    let body=panel.querySelector('.corner-body');if(!body){body=document.createElement('div');body.className='corner-body';panel.append(body);}body.innerHTML=content;syncCornerThemePresentation();
  }
  function backCard(g){
    const choices=themeChoices();if(!followsTheme(g)&&g.icon&&!choices.some(x=>x.id===g.icon))choices.push({id:g.icon,name:'当前图标'});
    const legacy='';
    const icons='<button class="corner-follow-icon" data-corner-follow-icon aria-pressed="'+followsTheme(g)+'">跟随主题</button>'+choices.map(x=>'<button data-corner-icon="'+x.id+'" title="'+x.name+'" aria-label="'+x.name+'图标" aria-pressed="'+(!followsTheme(g)&&g.icon===x.id)+'">'+renderCardIcon(x.id)+'</button>').join('');
    const colors='<button data-corner-color="theme" aria-pressed="'+(!g.color)+'"><i class="corner-theme-swatch"></i><span>跟随主题</span></button>'+cardColors.map(c=>'<button data-corner-color="'+c.id+'" aria-pressed="'+(g.color===c.id)+'"><i style="background:'+c.accent+'"></i><span>'+c.name+'</span>'+memberBadge()+'</button>').join('')+'<button data-corner-custom><i>'+glyph('<path d="M12 5v14M5 12h14"/>')+'</i><span>自选颜色</span>'+memberBadge()+'</button><input type="color" class="corner-custom-color" aria-label="自选卡片颜色" value="'+(/^#[0-9a-f]{6}$/i.test(g.color||'')?g.color:'#648a78')+'" tabindex="-1">';
    return '<div class="corner-back-header"><span>编辑卡片</span></div><div class="corner-back-scroll"><label>卡片名称<input data-corner-name="'+g.id+'" maxlength="24" value="'+esc(g.name)+'"></label><div class="corner-appearance-tabs" role="tablist" aria-label="卡片外观"><button role="tab" aria-selected="true" aria-controls="corner-icons-'+g.id+'" data-corner-tab="icons">图标</button><button role="tab" aria-selected="false" aria-controls="corner-colors-'+g.id+'" data-corner-tab="colors">颜色</button></div><div class="corner-icon-choices" id="corner-icons-'+g.id+'" role="tabpanel" aria-label="图标">'+legacy+icons+'</div><div class="corner-color-options" id="corner-colors-'+g.id+'" role="tabpanel" aria-label="颜色" hidden>'+colors+'</div><fieldset class="corner-sort"><legend>网址排序</legend><div><button data-corner-sort="manual" aria-pressed="'+(g.sort!=='frequency')+'">手动</button><button data-corner-sort="frequency" aria-pressed="'+(g.sort==='frequency')+'">常用优先</button></div><small>'+(g.sort==='frequency'?'打开次数越多，排得越靠前':'在正面长按网址拖动柄调整顺序')+'</small></fieldset></div><div class="corner-back-footer">'+(isInbox(g)?'<span>默认卡片 · 不可删除</span>':'<button data-corner-delete="'+g.id+'">删除卡片</button>')+'<span>修改自动保存</span></div><div class="corner-delete-confirm" hidden><p>删除这张卡片？</p><small>这里的常用入口会移除，原空间收藏不受影响。</small><div><button data-corner-cancel-delete>保留</button><button data-corner-confirm-delete="'+g.id+'">删除</button></div></div>';
  }
  function syncFaces(el){const back=el.classList.contains('is-flipped');el.querySelector('.corner-card-front').inert=back;if(el.querySelector('.corner-card-back'))el.querySelector('.corner-card-back').inert=!back;el.querySelector('.corner-card-front').setAttribute('aria-hidden',String(back));el.querySelector('.corner-card-back')?.setAttribute('aria-hidden',String(!back));}
  function syncCoverState(){if(!panel)return;for(const el of panel.querySelectorAll('[data-corner-card]'))el.classList.toggle('is-cover-open',coverOpen.has(el.dataset.cornerCard));}
  function setCoverOpen(id,open=true){if(open){coverOpen.clear();coverOpen.add(id);}else coverOpen.delete(id);syncCoverState();}
  function activateCard(id){if(activeId!==id){activeId=id;layoutFan(true);return;}if(fanMotion.frame)return;flipCard(id,true);}
  function syncInbox(el){
    const open=el.classList.contains('is-inbox-open'),front=el.querySelector('.corner-card-front'),lid=el.querySelector('.corner-inbox-lid');
    front.inert=!open;front.setAttribute('aria-hidden',String(!open));lid.inert=open;lid.setAttribute('aria-hidden',String(open));
    for(const heading of el.querySelectorAll('[data-inbox-fold],[data-inbox-unfold]'))heading.setAttribute('aria-expanded',String(open));
  }
  function toggleInbox(el){
    if(!el||flipped.size)return;
    inboxExpanded=!el.classList.contains('is-inbox-open');el.classList.toggle('is-inbox-open',inboxExpanded);syncInbox(el);
    el.querySelector(inboxExpanded?'[data-inbox-fold]':'[data-inbox-unfold]').focus({preventScroll:true});
  }
  function flipCard(id,back){
    if(isInbox(collection().groups.find(g=>g.id===id))){toggleInbox(panel.querySelector('[data-corner-card="'+id+'"]'));return;}
    if(back&&flipped.size&&!flipped.has(id))return;
    if(back)activeId=id;flipped.clear();if(back)flipped.add(id);
    for(const el of panel.querySelectorAll('[data-corner-card]')){
      if(el.classList.contains('corner-inbox'))continue;
      const confirm=el.querySelector('.corner-delete-confirm');if(confirm)confirm.hidden=true;
      const next=flipped.has(el.dataset.cornerCard),changed=el.classList.contains('is-flipped')!==next;
      if(changed){
        clearTimeout(flipTimers.get(el));
        const turn=el.querySelector('.corner-card-turn');
        // Settled faces are flattened for crisp text; restore their starting angle before animating.
        const start=el.classList.contains('is-settled')?(el.classList.contains('is-flipped')?'rotateY(180deg)':'rotateY(0deg)'):getComputedStyle(turn).transform;
        turn.style.transition='none';turn.style.transform=start;el.classList.remove('is-settled');void turn.offsetWidth;
        turn.style.removeProperty('transition');el.classList.toggle('is-flipped',next);turn.style.transform=next?'rotateY(180deg)':'rotateY(0deg)';
        const settle=()=>{el.classList.add('is-settled');turn.style.removeProperty('transform');};
        if(reduced())settle();else flipTimers.set(el,setTimeout(settle,850));
      }
      syncFaces(el);
    }
    resetFloat();layoutFan(true);const el=panel.querySelector('[data-corner-card="'+id+'"]');(back?el?.querySelector('.corner-card-back'):el?.querySelector('.corner-card-front'))?.focus({preventScroll:true});
  }
  function onPanelClick(e) {
    if(activeModule==='memo'){onMemoPanelClick(e);return;}
    if(activeModule==='todo'){onTodoPanelClick(e);return;}
    if(performance.now()<swallowClickUntil){e.preventDefault();e.stopPropagation();return;}
    const b=e.target.closest('button'),el=e.target.closest('[data-corner-card]'),g=el&&collection().groups.find(g=>g.id===el.dataset.cornerCard);
    if(!e.target.closest('button,a,input,select,[data-corner-card],.corner-pull-cord')&&!drag?.active){const cards=[...panel.querySelectorAll('.corner-card:not(.is-away)')].map(card=>card.getBoundingClientRect()).filter(box=>box.right>0&&box.left<innerWidth),bottom=Math.max(...cards.map(box=>box.bottom));if(cards.length&&e.clientY>bottom){closeCorner();return;}}
    if(b?.hasAttribute('data-corner-next-theme')){cycleCornerTheme();return;}
    if(b?.dataset.cornerDone){flipCard(b.dataset.cornerDone,false);return;}
    if(flipped.size&&!el){if(e.target.closest('button'))return;flipCard([...flipped][0],false);return;}
    if(b?.hasAttribute('data-corner-new')){if(flipped.size)return;const groups=collection().groups;if(!window.ShiyuEntitlements?.requireQuota('corner',customCount()))return;const newGroup={id:uid(),name:'新卡片',iconMode:'theme',iconSlot:customCount()%20,refs:[]};groups.push(newGroup);persist();renderPanel();requestAnimationFrame(()=>flipCard(newGroup.id,true));return;}
    if(b?.dataset.cornerPage){navigate(Number(b.dataset.cornerPage));return;}
    if(!g)return;
    if(flipped.size&&!flipped.has(g.id))return;
    if(isInbox(g)){
      if(e.target.closest('[data-inbox-fold],[data-inbox-unfold]')||el.classList.contains('is-inbox-open')&&!e.target.closest('a,button,input,select')){if(activeId!==g.id){activeId=g.id;layoutFan(true);}toggleInbox(el);return;}
      if(!e.target.closest('a,button'))return;
    }
    const cover=e.target.closest('.corner-card-cover');
    if(cover&&!isInbox(g)){
      if(activeId!==g.id){activeId=g.id;layoutFan(true);}
      return;
    }
    if(b?.dataset.cornerTab){const tab=b.dataset.cornerTab;for(const t of el.querySelectorAll('[data-corner-tab]'))t.setAttribute('aria-selected',String(t===b));el.querySelector('.corner-icon-choices').hidden=tab!=='icons';el.querySelector('.corner-color-options').hidden=tab!=='colors';return;}
    if(b?.dataset.cornerColor){if(!window.ShiyuEntitlements?.require('corner-colors',b.dataset.cornerColor,'corner'))return;g.color=b.dataset.cornerColor==='theme'?'':b.dataset.cornerColor;persist();applyCardColor(el,g);for(const c of el.querySelectorAll('[data-corner-color]'))c.setAttribute('aria-pressed',String(c===b));return;}
    if(b?.hasAttribute('data-corner-custom')){if(!window.ShiyuEntitlements?.require('corner-colors','custom','corner'))return;el.querySelector('.corner-custom-color').click();return;}
    if(b?.hasAttribute('data-corner-follow-icon')||b?.hasAttribute('data-corner-art')||b?.dataset.cornerIcon){g.iconMode=b.hasAttribute('data-corner-follow-icon')?'theme':'manual';if(g.iconMode==='theme'){g.iconSlot??=Math.max(0,collection().groups.indexOf(g))%20;}else if(b.dataset.cornerIcon)g.icon=b.dataset.cornerIcon;else{g.icon='';g.art=Number(b.dataset.cornerArt);}persist();for(const icon of el.querySelectorAll('[data-corner-art],[data-corner-icon],[data-corner-follow-icon]'))icon.setAttribute('aria-pressed',String(icon===b));el.querySelector('.corner-card-logo').innerHTML=cardIcon(g);const empty=el.querySelector('.corner-empty-lines');if(empty)empty.innerHTML=cardIcon(g);return;}
    if(b?.dataset.cornerIcons){const rail=el.querySelector('.corner-icon-choices');rail.scrollBy({left:Number(b.dataset.cornerIcons)*rail.clientWidth*.8,behavior:reduced()?'instant':'smooth'});return;}
    if(b?.dataset.cornerSort){g.sort=b.dataset.cornerSort;persist();for(const option of el.querySelectorAll('[data-corner-sort]'))option.setAttribute('aria-pressed',String(option===b));if(el.querySelector('.corner-sort small'))el.querySelector('.corner-sort small').textContent=g.sort==='frequency'?'打开次数越多，排得越靠前':'在正面长按网址拖动柄调整顺序';const tmp=document.createElement('template');tmp.innerHTML=card(g,collection().groups.indexOf(g),sources());el.querySelector('.corner-links').innerHTML=tmp.content.querySelector('.corner-links').innerHTML;return;}
    if(b?.dataset.cornerDelete){if(isInbox(g))return;el.querySelector('.corner-delete-confirm').hidden=false;return;}
    if(b?.hasAttribute('data-corner-cancel-delete')){el.querySelector('.corner-delete-confirm').hidden=true;return;}
    if(b?.dataset.cornerConfirmDelete){if(isInbox(g))return;collection().groups=collection().groups.filter(x=>x.id!==g.id);flipped.delete(g.id);persist();renderPanel();return;}
    if(b?.dataset.cornerAddLinks){if(!isInbox(g))openPicker(g.id);return;}
    if(b?.dataset.cornerRemove){g.refs=g.refs.filter(r=>r.id!==b.dataset.cornerRemove);persist();refreshLinks([g.id]);if(isInbox(g)){panel.querySelector('.corner-feedback')?.remove();const notice=document.createElement('div');notice.className='corner-feedback';notice.setAttribute('role','status');notice.textContent='已移出成功';panel.append(notice);setTimeout(()=>notice.remove(),2800);}return;}
    const ref=b?.dataset.cornerRefUp||b?.dataset.cornerRefDown;
    if(ref){const at=g.refs.findIndex(r=>r.id===ref),to=at+(b.dataset.cornerRefUp?-1:1);if(to>=0&&to<g.refs.length){[g.refs[at],g.refs[to]]=[g.refs[to],g.refs[at]];persist();renderPanel();}return;}
    if(e.target.closest('.corner-card-back')&&!e.target.closest('a,button,input,select,label,fieldset,.corner-appearance-tabs,.corner-icon-choices,.corner-color-options,.corner-delete-confirm')){flipCard(g.id,false);return;}
    if(e.target.closest('.corner-card-front')&&!e.target.closest('a,button,input,select')){if(isInbox(g)){activeId=g.id;layoutFan(true);}else activateCard(g.id);}
  }
  function onMemoPanelClick(e){
    if(performance.now()<swallowClickUntil){e.preventDefault();e.stopPropagation();return;}
    if(e.target.closest('[data-corner-next-theme]')){cycleCornerTheme();return;}
    const done=e.target.closest('[data-memo-done]');if(done){memoFocusId=memoEditingId;memoEditingId=null;renderPanel();return;}
    const add=e.target.closest('[data-memo-new]');if(add){const library=memoLibrary(),now=Date.now(),note={id:uid(),title:'未命名的灵感',content:'',updatedAt:now,icon:'✦'};library.notes.push(note);persist();memoEditingId=note.id;memoFocusId=note.id;renderPanel();return;}
    const edit=e.target.closest('[data-memo-edit]');if(edit){const note=memoLibrary().notes.find(item=>item.id===edit.dataset.memoEdit);if(note){memoFocusId=note.id;memoEditingId=note.id;renderPanel();}return;}
    const card=e.target.closest('[data-memo-card]');if(card){const note=memoLibrary().notes.find(item=>item.id===card.dataset.memoCard);if(note){memoFocusId=note.id;syncMemoFocus();memoScrollTo(note.id);}return;}
    if(!e.target.closest('button,a,input,textarea,select,.corner-pull-cord,.memo-editor,.corner-close-entry,.memo-board')){
      const board=panel.querySelector('.memo-board'),bottom=board?.getBoundingClientRect().bottom||innerHeight;
      if(e.clientY>bottom+28)closeCorner();
    }
  }
  function onPanelInput(e){
    if(activeModule==='memo'){
      const field=e.target.closest('[data-memo-title],[data-memo-content]');if(!field)return;
      const note=memoLibrary().notes.find(item=>item.id===(field.dataset.memoTitle||field.dataset.memoContent));if(!note)return;
      if(field.hasAttribute('data-memo-title'))note.title=field.value;else note.content=field.value;note.updatedAt=Date.now();persist();
      const meta=panel.querySelector('.memo-editor-meta');if(meta)meta.lastElementChild.textContent='最后编辑于 '+memoTime(note.updatedAt);const card=panel.querySelector('[data-memo-card="'+note.id+'"]');if(card){card.querySelector('h3').textContent=note.title||'无题';card.querySelector('p').textContent=note.content||'还没有写下什么。';card.querySelector('.memo-note-time').textContent=memoTime(note.updatedAt);}return;
    }
    const g=collection().groups.find(g=>g.id===e.target.closest('[data-corner-card]')?.dataset.cornerCard);if(!g||isInbox(g))return;
    if(e.target.matches('.corner-custom-color')){if(!window.ShiyuEntitlements?.require('corner-colors','custom','corner'))return;g.color=e.target.value;persist();const el=e.target.closest('.corner-card');applyCardColor(el,g);for(const c of el.querySelectorAll('[data-corner-color]'))c.setAttribute('aria-pressed','false');return;}
    if(e.target.hasAttribute('data-corner-name')){const name=e.target.value.trim();if(name){g.name=name;e.target.closest('.corner-card').querySelector('.corner-card-cover h3').textContent=name;persist();}}
  }
  function onPanelChange(e){if(e.target.hasAttribute('data-corner-name')&&!e.target.value.trim()){const g=collection().groups.find(g=>g.id===e.target.dataset.cornerName);e.target.value=g.name;}}
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fanMetrics(){const deck=panel.querySelector('.corner-deck'),width=deck.clientWidth||innerWidth-96,cardWidth=innerWidth<=760?Math.min(340,width-72):330;return {deck,cardWidth,step:cardWidth+40,half:Math.max(0,Math.floor((width-cardWidth)/(2*(cardWidth+40))))};}
  function fanOffset(distance,m){return distance<=m.half+1?distance*m.step:(m.half+1)*m.step+(distance-m.half-1)*30;}
  function paintFan(position){
    const m=fanMetrics(),ids=[...collection().groups.map(g=>g.id),ADD_CARD];panel.classList.toggle('corner-editing',flipped.size>0);
    for(const el of m.deck.querySelectorAll(':scope > .corner-card')){const id=el.dataset.cornerCard||ADD_CARD,i=ids.indexOf(id),delta=i-position,distance=Math.abs(delta),outer=Math.max(0,distance-m.half),visible=distance<m.half+3,selected=id===activeId;el.style.width=m.cardWidth+'px';el.style.setProperty('--fan-x',Math.sign(delta)*fanOffset(distance,m)+'px');el.style.setProperty('--fan-y',(outer?m.half*m.half*9+outer*14:distance*distance*9)+'px');el.style.setProperty('--fan-angle',(flipped.has(id)?0:Math.sign(delta)*(Math.min(distance,m.half)*1.4+Math.min(outer*3,12-m.half*1.4)))+'deg');el.style.setProperty('--fan-scale',String(1-.04*Math.min(outer,1)));el.style.zIndex=String(20-Math.min(Math.round(distance),15));el.dataset.fanOffset=String(i-ids.indexOf(activeId));el.classList.toggle('is-center',selected);el.classList.toggle('is-away',!visible);el.inert=!visible||flipped.size>0&&!flipped.has(id);el.setAttribute('aria-current',String(selected));}
  }
  function layoutFan(animate=false,fast=false){
    if(!panel||activeModule==='memo')return;const groups=collection().groups,ids=[...groups.map(g=>g.id),ADD_CARD];if(!ids.includes(activeId))activeId=groups[Math.min(1,groups.length-1)]?.id||ADD_CARD;
    const target=drag?.active&&drag.type==='group'?drag.anchorIndex:ids.indexOf(activeId);fanMotion.target=target;fanMotion.tau=fast?55:90;
    if(!animate||reduced()||fanMotion.position===null){cancelAnimationFrame(fanMotion.frame);fanMotion.frame=0;fanMotion.position=target;panel.classList.remove('corner-animating');paintFan(target);updateArrows();return;}
    panel.classList.add('corner-animating');if(!fanMotion.frame){fanMotion.last=performance.now();fanMotion.frame=requestAnimationFrame(advanceFan);}updateArrows();
  }
  function advanceFan(now){
    const dt=Math.max(0,Math.min(40,now-fanMotion.last));fanMotion.last=now;fanMotion.position+=(fanMotion.target-fanMotion.position)*(1-Math.exp(-dt/fanMotion.tau));
    const settled=Math.abs(fanMotion.target-fanMotion.position)<.001;if(settled)fanMotion.position=fanMotion.target;paintFan(fanMotion.position);
    if(settled){fanMotion.frame=0;panel.classList.remove('corner-animating');}else fanMotion.frame=requestAnimationFrame(advanceFan);
  }
  function navigate(direction,fast=false){if(flipped.size||drag?.active)return;const ids=[...collection().groups.map(g=>g.id),ADD_CARD],index=ids.indexOf(activeId),next=((index+direction)%ids.length+ids.length)%ids.length;if(next===index||!ids[next])return;activeId=ids[next];layoutFan(true,fast);playCardSound();}
  function onWheel(e){
    if(e.ctrlKey||drag?.active)return;
    if(activeModule==='memo'){
      if(e.target.closest('.memo-editor'))return;
      const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(Math.abs(delta)<2)return;e.preventDefault();const now=performance.now();if(now<memoWheelLock)return;memoWheelLock=now+220;focusMemo(delta>0?1:-1);return;
    }
    if(flipped.size){if(!e.target.closest('.corner-back-scroll'))e.preventDefault();e.stopPropagation();return;}
    const inner=e.target.closest('.corner-links');if(!e.shiftKey&&inner&&inner.scrollHeight>inner.clientHeight+2&&Math.abs(e.deltaY)>=Math.abs(e.deltaX)){e.stopPropagation();return;}
    if(e.target.closest('input,select'))return;e.preventDefault();
    const now=performance.now(),delta=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1),gap=now-wheelLast;
    if(gap>180||Math.sign(wheelSum)!==Math.sign(delta))wheelSum=0;wheelLast=now;wheelSum=Math.max(-240,Math.min(240,wheelSum+delta));
    const fast=e.shiftKey||Math.abs(delta)>=100||gap<130,interval=e.shiftKey?38:fast?55:170,threshold=e.shiftKey?12:38;
    if(now<wheelLock||Math.abs(wheelSum)<threshold)return;const steps=fast?Math.min(e.shiftKey?3:2,Math.max(1,Math.floor(Math.abs(delta)/220))):1;navigate(Math.sign(wheelSum)*steps,fast);wheelSum=0;wheelLock=now+interval;
  }
  function updateArrows(){if(!panel)return;const ids=[...collection().groups.map(g=>g.id),ADD_CARD],index=ids.indexOf(activeId);for(const b of panel.querySelectorAll('[data-corner-page]')){b.hidden=ids.length<2;b.disabled=flipped.size>0||(Number(b.dataset.cornerPage)<0?index<=0:index>=ids.length-1);}}
  function resetFloat(){if(!panel)return;for(const c of panel.querySelectorAll('.corner-card')){c.style.setProperty('--tilt-x','0deg');c.style.setProperty('--tilt-y','0deg');}}
  // Count actual openings of tracked URLs, including their original space entries.
  function noteVisit(e){if(e.defaultPrevented||e.type==='auxclick'&&e.button!==1||e.type==='click'&&e.button!==0)return;const a=e.target.closest('a[href]'),library=prefs.cornerCollections?.[owner()];if(!a||!library)return;const url=safeURL(a.href);if(url==='#'||!library.groups.some(g=>g.refs.some(r=>safeURL(r.url)===url)))return;library.usage??={};library.usage[url]=(Number(library.usage[url])||0)+1;persist();}
  document.addEventListener('click',noteVisit);document.addEventListener('auxclick',noteVisit);
  function refreshLinks(groupIds){
    const entries=sources(),rows=new Map([...panel.querySelectorAll('.corner-deck [data-corner-ref]')].map(el=>[el.dataset.cornerRef,el]));
    for(const id of new Set(groupIds)){const g=collection().groups.find(g=>g.id===id),el=panel.querySelector('.corner-deck [data-corner-card="'+id+'"]');if(!g||!el)continue;
      const list=el.querySelector('.corner-links'),scroll=list.scrollTop,tmp=document.createElement('template');tmp.innerHTML=card(g,collection().groups.indexOf(g),entries);const generated=tmp.content.querySelector('.corner-links'),desired=[...generated.children].map(row=>{const old=rows.get(row.dataset.cornerRef);return old&&!!old.querySelector('.corner-grip')===!!row.querySelector('.corner-grip')?old:row;}),keep=new Set(desired);
      for(const row of [...list.children])if(!keep.has(row))row.remove();let cursor=list.firstChild;for(const row of desired){if(row!==cursor)list.insertBefore(row,cursor);cursor=row.nextSibling;}list.scrollTop=scroll;el.querySelector('.corner-card-cover small').textContent=tmp.content.querySelector('.corner-card-cover small').textContent;
      for(const option of el.querySelectorAll('[data-corner-sort]'))option.setAttribute('aria-pressed',String(option.dataset.cornerSort===(g.sort==='frequency'?'frequency':'manual')));if(el.querySelector('.corner-sort small'))el.querySelector('.corner-sort small').textContent=g.sort==='frequency'?'打开次数越多，排得越靠前':'在正面长按网址拖动柄调整顺序';
    }
  }
  function findRef(id){return collection().groups.find(g=>g.refs.some(r=>r.id===id));}
  function moveRef(id,gid,before) {
    const from=findRef(id),to=collection().groups.find(g=>g.id===gid);if(!from||!to||before===id)return;
    if(isInbox(to)){if(from===to)return;before=undefined;}
    if(to.sort==='frequency'){to.refs=orderedRefs(to);to.sort='manual';}
    const at=from.refs.findIndex(r=>r.id===id),[ref]=from.refs.splice(at,1),dest=before?to.refs.findIndex(r=>r.id===before):-1;
    to.refs.splice(dest<0?to.refs.length:dest,0,ref);
  }
  function openPicker(gid, selectedSource) {
    picker??=dialog('corner-picker','选择常用网址');const entries=sources(),groups=collection().groups;
    const expired=signed&&!isMember()&&Math.max(Number(prefs.membership?.expiresAt)||0,Number(prefs.membershipDemo?.expiresAt)||0)>0;
    const destination=expired?groups.find(isInbox)?.id:(gid||groups.find(isInbox)?.id);
    const branches=data.flatMap(s=>s.scenes.flatMap(c=>c.groups.map(g=>({sid:s.id,cid:c.id,gid:g.id,name:g.name,path:s.name+' / '+c.name+' / '+g.name}))));
    let current=branches.find(g=>g.gid===selectedSource?.gid)||branches[0];
    picker.innerHTML=heading('添加网址')+`<label>收进哪张卡片<select id="corner-destination">${groups.map(g=>`<option value="${g.id}" ${g.id===destination?'selected':''}>${esc(g.name)}</option>`).join('')}</select></label><label>搜索收藏<input id="corner-search" type="search" placeholder="搜索空间、场景、分组、名称或网址"></label><div class="corner-library-browser"><nav class="corner-library-nav" aria-label="空间、场景和分组"></nav><section class="corner-library-content"><div class="corner-library-toolbar"></div><div class="corner-source-list"></div></section></div><p class="corner-picker-note" role="status"></p><button class="primary" id="corner-save">添加到卡片</button>`;
    const chosen=new Set(selectedSource?[entries.findIndex(x=>x.gid===selectedSource.gid&&x.url===selectedSource.url)]:[]);chosen.delete(-1);
    const nav=picker.querySelector('.corner-library-nav');
    nav.innerHTML=data.map(s=>`<details ${s.id===current?.sid?'open':''}><summary>${esc(s.name)}</summary>${s.scenes.map(c=>`<details ${c.id===current?.cid?'open':''}><summary>${esc(c.name)}</summary>${c.groups.map(g=>`<button type="button" data-library-group="${g.id}" aria-current="${g.id===current?.gid}"><span>${esc(g.name)}</span><small>${g.items.length}</small></button>`).join('')}</details>`).join('')}</details>`).join('')||'<p>还没有空间</p>';
    function listing(preserveScroll=false){
      const list=picker.querySelector('.corner-source-list'),scroll=preserveScroll===true?list.scrollTop:0;
      const q=picker.querySelector('#corner-search').value.trim().toLowerCase(),rows=entries.map((x,i)=>({x,i})).filter(({x})=>q?(x.item[0]+' '+x.url+' '+x.path).toLowerCase().includes(q):x.gid===current?.gid);
      const all=rows.length>0&&rows.every(({i})=>chosen.has(i));
      picker.querySelector('.corner-library-toolbar').innerHTML='<span>'+esc(q?'搜索结果 · '+rows.length+' 个网址':current?.path||'选择分组')+'</span>'+(!q&&current?'<button type="button" data-library-select-group '+(!rows.length?'disabled':'')+'>'+(all?'取消本组选中':'全选本组网址')+'</button>':'');
      picker.querySelector('[data-library-select-group]')?.addEventListener('click',()=>{for(const {i} of rows)all?chosen.delete(i):chosen.add(i);listing(true);});
      picker.querySelector('.corner-source-list').innerHTML=rows.map(({x,i})=>`<label class="corner-source"><input type="checkbox" value="${i}" ${chosen.has(i)?'checked':''}><i>${bookmarkMark(x.item)}</i><span>${esc(x.item[0])}<small>${esc(q?x.path:x.url)}</small></span></label>`).join('')||`<p>${q?'没有匹配的网址，换个词试试':'这个分组还没有网址'}</p>`;
      picker.querySelector('.corner-picker-note').textContent='已选择 '+chosen.size+' 个网址';
      list.scrollTop=scroll;
    }
    nav.onclick=e=>{const b=e.target.closest('[data-library-group]');if(!b)return;current=branches.find(g=>g.gid===b.dataset.libraryGroup);picker.querySelector('#corner-search').value='';for(const el of nav.querySelectorAll('[data-library-group]'))el.setAttribute('aria-current',String(el===b));listing();};
    listing();picker.querySelector('#corner-search').oninput=listing;
    picker.querySelector('.corner-source-list').onchange=e=>{if(!e.target.matches('input[type=checkbox]'))return;const i=Number(e.target.value);e.target.checked?chosen.add(i):chosen.delete(i);listing(true);};
    picker.querySelector('#corner-save').onclick=()=>{
      if(!chosen.size){picker.querySelector('.corner-picker-note').textContent='先选一个常用的网址吧';return;}
      const target=groups.find(g=>g.id===picker.querySelector('select').value)||groups.find(isInbox);
      for(const i of chosen){const x=entries[i];if(!x)continue;let existing;
        for(const g of groups){const ref=g.refs.find(r=>r.gid===x.gid&&r.url===x.url);if(ref){existing=ref;g.refs=g.refs.filter(r=>r!==ref);break;}}
        target.refs.push(existing||{id:uid(),sid:x.sid,cid:x.cid,gid:x.gid,url:x.url});
      }
      persist();picker.close();if(panel?.open)refreshLinks(groups.map(g=>g.id));toast('已收进我的一隅');
    };
    if(gid)enablePastedLinks(gid);
    if(!picker.open)picker.showModal();
  }
  function enablePastedLinks(gid){
    picker.querySelector('h2').textContent='添加网址';
    picker.querySelector('.dialog-heading p')?.remove();
    const tabs=document.createElement('div');tabs.className='corner-add-tabs';tabs.setAttribute('role','tablist');tabs.innerHTML='<button role="tab" aria-selected="true" data-add-tab="saved">已有收藏</button><button role="tab" aria-selected="false" data-add-tab="paste">粘贴网址</button>';
    picker.querySelector('.dialog-heading').after(tabs);
    const pasted=document.createElement('label');pasted.className='corner-pasted-links';pasted.hidden=true;pasted.innerHTML='网址<textarea rows="6" placeholder="https://example.com 网站名称&#10;https://example.org 另一个网站"></textarea><small>每行一个网址，可在网址后用空格填写名称；支持批量粘贴</small>';picker.querySelector('.corner-picker-note').before(pasted);
    let mode='saved';tabs.onclick=e=>{const b=e.target.closest('[data-add-tab]');if(!b)return;mode=b.dataset.addTab;for(const t of tabs.children)t.setAttribute('aria-selected',String(t===b));picker.querySelector('#corner-search').closest('label').hidden=mode!=='saved';picker.querySelector('.corner-library-browser').hidden=mode!=='saved';pasted.hidden=mode!=='paste';picker.querySelector('.corner-picker-note').textContent='';};
    const save=picker.querySelector('#corner-save'),saveExisting=save.onclick;save.textContent='添加到卡片';save.onclick=()=>{
      if(mode==='saved'){saveExisting();return;}
      const lines=pasted.querySelector('textarea').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),parsed=[];
      if(!lines.length){picker.querySelector('.corner-picker-note').textContent='先粘贴一个网址吧';return;}
      for(let i=0;i<lines.length;i++){const [raw,...name]=lines[i].split(/\s+/);const value=/^https?:\/\//i.test(raw)?raw:/^[\w.-]+\.[a-z]{2,}(?:[/:?#]|$)/i.test(raw)?'https://'+raw:raw,url=safeURL(value);if(url==='#'){picker.querySelector('.corner-picker-note').textContent='第 '+(i+1)+' 行的网址无法识别，请检查后再添加';return;}parsed.push({url,name:name.join(' ')||new URL(url).hostname});}
      const groups=collection().groups,target=groups.find(g=>g.id===picker.querySelector('select').value)||groups.find(g=>g.id===gid);if(!target)return;
      const all=sources(),unique=new Map(parsed.map(x=>[x.url,x]));
      for(const x of unique.values()){if(target.refs.some(r=>safeURL(r.url)===x.url))continue;let ref;for(const g of groups){const at=g.refs.findIndex(r=>safeURL(r.url)===x.url);if(at>=0){[ref]=g.refs.splice(at,1);break;}}const source=all.find(s=>safeURL(s.url)===x.url);target.refs.push(ref||(source?{id:uid(),sid:source.sid,cid:source.cid,gid:source.gid,url:source.url}:{id:uid(),url:x.url,own:[x.name,x.url,'']}));}
      persist();picker.close();if(panel?.open)refreshLinks(groups.map(g=>g.id));toast('已添加到卡片');
    };
  }
  function startDrag(e) {
    const inboxRow=e.target.closest('.corner-inbox [data-corner-ref]');
    const handle=inboxRow||e.target.closest('[data-corner-drag-group],[data-corner-drag-ref]');if(!handle||e.button!==0||flipped.size||e.target.closest('input,select,.corner-card-logo')||(!inboxRow&&e.target.closest('a'))||(inboxRow&&e.target.closest('button:not([data-corner-drag-ref]),.corner-link-open')))return;
    const type=handle.hasAttribute('data-corner-drag-group')?'group':'ref',id=type==='group'?handle.dataset.cornerDragGroup:(inboxRow?.dataset.cornerRef||handle.dataset.cornerDragRef);
    drag={id,type,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,pid:e.pointerId,active:false,snapshot:JSON.stringify(collection().groups),originalActive:activeId};
    drag.timer=setTimeout(()=>{
      if(!drag)return;drag.active=true;const groups=collection().groups;drag.anchorIndex=[...groups.map(g=>g.id),ADD_CARD].indexOf(activeId);cancelAnimationFrame(fanMotion.frame);fanMotion.frame=0;panel.classList.remove('corner-animating');
      if(type==='ref'){const g=findRef(id);if(g?.sort==='frequency'){g.refs=orderedRefs(g);g.sort='manual';}}
      const node=handle.closest(type==='group'?'.corner-card':'.corner-link');drag.node=node;drag.rect=node.getBoundingClientRect();drag.transform=getComputedStyle(node).transform;panel.classList.add('corner-dragging');panel.setPointerCapture(e.pointerId);
      if(type==='group'){node.classList.add('corner-held-card');node.style.transform=drag.transform;updateDragSlots();}
      else{drag.ghost=node.cloneNode(true);drag.ghost.classList.add('corner-ref-ghost');drag.ghost.removeAttribute('data-corner-ref');for(const n of drag.ghost.querySelectorAll('[data-corner-drag-ref],[data-corner-remove]')){n.removeAttribute('data-corner-drag-ref');n.removeAttribute('data-corner-remove');}drag.ghost.style.width=drag.rect.width+'px';drag.ghost.setAttribute('aria-hidden','true');panel.append(drag.ghost);node.classList.add('corner-held-ref');}
      positionDrag(drag.x,drag.y);
    },320);
  }
  function updateDragSlots(){const m=fanMetrics(),center=m.deck.getBoundingClientRect().left+m.deck.clientWidth/2;drag.slots=collection().groups.map((g,i)=>{const delta=i-drag.anchorIndex;return center+Math.sign(delta)*fanOffset(Math.abs(delta),m);});}
  function positionDrag(x,y){if(!drag?.active)return;drag.lastX=x;drag.lastY=y;const dx=x-drag.x,dy=y-drag.y;if(drag.type==='group')drag.node.style.transform='translate3d('+dx+'px,'+dy+'px,0) '+drag.transform;else{drag.ghost.style.left=drag.rect.left+dx+'px';drag.ghost.style.top=drag.rect.top+dy+'px';}}
  function syncCardOrder(){const deck=panel.querySelector('.corner-deck'),nodes=new Map([...deck.querySelectorAll('[data-corner-card]')].map(el=>[el.dataset.cornerCard,el])),add=deck.querySelector('[data-corner-add-card]');collection().groups.forEach((g,i)=>{const el=nodes.get(g.id);deck.insertBefore(el,add);el.querySelector('.corner-card-number').textContent=isInbox(g)?'默认':String(i).padStart(2,'0');});}
  window.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.pid)return;if(!drag.active){if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7)finishDrag(true);return;}
    e.preventDefault();positionDrag(e.clientX,e.clientY);const m=fanMetrics(),box=m.deck.getBoundingClientRect(),groups=collection().groups;
    if(drag.type==='group'){
      if(performance.now()>(drag.edgeAt||0)&&(e.clientX>box.right-12||e.clientX<box.left+12)){const dir=e.clientX>box.right-12?1:-1;drag.anchorIndex=Math.max(0,Math.min(groups.length-1,drag.anchorIndex+dir));layoutFan();updateDragSlots();drag.edgeAt=performance.now()+650;}
      const center=drag.rect.left+drag.rect.width/2+e.clientX-drag.x,from=groups.findIndex(g=>g.id===drag.id);let to=from;
      while(to>1&&center<(drag.slots[to-1]+drag.slots[to])/2-18)to--;
      while(to<groups.length-1&&center>(drag.slots[to]+drag.slots[to+1])/2+18)to++;
      if(to!==from){const [g]=groups.splice(from,1);groups.splice(to,0,g);layoutFan();}return;
    }
    if(performance.now()>(drag.edgeAt||0)&&(e.clientX>box.right-12||e.clientX<box.left+12)){const ids=groups.map(g=>g.id),index=ids.indexOf(activeId),next=Math.max(0,Math.min(ids.length-1,index+(e.clientX>box.right-12?1:-1)));activeId=ids[next];layoutFan(true,true);drag.edgeAt=performance.now()+650;}
    const target=document.elementFromPoint(e.clientX,e.clientY),el=target?.closest('.corner-deck [data-corner-card]');if(!el)return;
    const row=target.closest('[data-corner-ref]'),list=el.querySelector('.corner-links'),r=list.getBoundingClientRect();if(e.clientY>r.bottom-30)list.scrollTop+=12;else if(e.clientY<r.top+30)list.scrollTop-=12;
    if(performance.now()<(drag.reorderAt||0)||row?.dataset.cornerRef===drag.id)return;
    const from=findRef(drag.id),to=el.dataset.cornerCard;let beforeId=row?.dataset.cornerRef;if(row&&e.clientY>row.getBoundingClientRect().top+row.offsetHeight/2)beforeId=row.nextElementSibling?.dataset.cornerRef;
    const previous=JSON.stringify(groups);moveRef(drag.id,to,beforeId);if(previous!==JSON.stringify(groups)){refreshLinks([from.id,to]);drag.reorderAt=performance.now()+130;}
  },{passive:false});
  function finishDrag(cancel=false){
    if(!drag)return;const state=drag;clearTimeout(state.timer);drag=null;
    if(!state.active){if(cancel)swallowClickUntil=performance.now()+350;return;}
    if(cancel){collection().groups=JSON.parse(state.snapshot);activeId=state.originalActive;}else persist();
    state.ghost?.remove();panel.querySelectorAll('.corner-held-ref').forEach(el=>el.classList.remove('corner-held-ref'));
    if(state.type==='group'){if(!cancel)activeId=collection().groups[Math.min(state.anchorIndex,collection().groups.length-1)]?.id||ADD_CARD;syncCardOrder();layoutFan();state.node.classList.remove('corner-held-card');state.node.style.removeProperty('transform');}
    else{if(cancel){syncCardOrder();layoutFan();}refreshLinks(collection().groups.map(g=>g.id));}
    panel.classList.remove('corner-dragging');if(panel.hasPointerCapture(state.pid))panel.releasePointerCapture(state.pid);swallowClickUntil=performance.now()+350;
  }
  window.addEventListener('pointerup',()=>finishDrag());window.addEventListener('pointercancel',()=>finishDrag(true));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drag){e.preventDefault();e.stopImmediatePropagation();finishDrag(true);}},true);
  function closeSwitch(){if(switchMenu)switchMenu.hidden=true;switchOrigin?.setAttribute('aria-expanded','false');}
  function openSwitch(trigger){
    if(switchOrigin===trigger&&switchMenu&&!switchMenu.hidden){closeSwitch();return;}
    closeSwitch();switchOrigin=trigger;
    if(!switchMenu){switchMenu=document.createElement('div');switchMenu.id='corner-space-menu';switchMenu.setAttribute('role','region');switchMenu.setAttribute('aria-label','切换与管理空间');document.body.append(switchMenu);}
    switchMenu.innerHTML=`<div class="corner-switch-heading"><p>切换空间</p><button data-organize="space">管理空间</button></div><div class="corner-switch-list">${data.map(s=>`<button data-corner-space="${s.id}" aria-current="${s.id===spaceId}"><i>${entityIcon(s.icon)}</i><span>${esc(s.name)}</span>${s.id===spaceId?'<small>✓</small>':''}</button>`).join('')}</div><button class="corner-add-space" data-create="space">${glyph('<path d="M12 5v14M5 12h14"/>')}添加空间</button>`;
    switchMenu.hidden=false;const r=trigger.getBoundingClientRect();switchMenu.style.left=Math.max(12,Math.min(r.left,innerWidth-272))+'px';switchMenu.style.top=r.bottom+10+'px';trigger.setAttribute('aria-expanded','true');
  }
  document.addEventListener('click',e=>{
    const button=e.target.closest('button');
    if(button?.hasAttribute('data-corner-switch')){openSwitch(button);return;}
    if(button?.dataset.cornerSpace){closeSwitch();goSpace(button.dataset.cornerSpace);window.scrollTo({top:0,behavior:'instant'});return;}
    if(button?.closest('#corner-space-menu')&&(button.dataset.organize||button.dataset.create))closeSwitch();
    if(!e.target.closest('#corner-space-menu'))closeSwitch();
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&switchMenu&&!switchMenu.hidden){closeSwitch();switchOrigin?.focus();}});
  addEventListener('resize',()=>{closeSwitch();if(panel?.open){layoutFan();if(entrySlot?.isConnected){const r=entrySlot.getBoundingClientRect();origin.style.left=r.left+'px';origin.style.top=r.top+'px';entryAnchor={left:r.left,top:r.top,width:r.width,height:r.height};}}});
  function onTodoPanelClick(e){
    if(!e.target.closest('button,a,input,textarea,select,.corner-pull-cord,.todo-stage,.corner-close-entry')){
      const stage=panel.querySelector('.todo-stage'),bottom=stage?.getBoundingClientRect().bottom||innerHeight;
      if(e.clientY>bottom){closeCorner();return;}
    }
    const view=e.target.closest('[data-todo-view]');if(view){todoLibrary().view=view.dataset.todoView;persist();renderTodoPanel();return;}
    const add=e.target.closest('[data-todo-add]');if(add){const title=prompt('给这件事留一个名字');if(title?.trim()){const l=todoLibrary(),d=todoWeekStart();l.tasks.push({id:uid(),title:title.trim(),date:todoDateKey(d),start:9*60,duration:60,color:'blue',status:'today'});persist();renderTodoPanel();}return;}
    const task=e.target.closest('[data-todo-task]');if(task&&!e.target.closest('[data-todo-resize]')){const item=todoLibrary().tasks.find(t=>t.id===task.dataset.todoTask);if(item){item.status=item.status==='done'?'today':'done';item.completed=item.status==='done';persist();renderTodoPanel();}return;}
  }
  function onTodoDragStart(e){if(activeModule!=='todo')return;const item=e.target.closest('[data-todo-task],[data-todo-inbox]');if(!item)return;e.dataTransfer.setData('text/plain',item.dataset.todoTask?'task:'+item.dataset.todoTask:'inbox:'+item.dataset.todoInbox);e.dataTransfer.effectAllowed='move';}
  function onTodoResizeStart(e){if(activeModule!=='todo')return;const handle=e.target.closest('[data-todo-resize]');if(!handle)return;e.preventDefault();const task=todoLibrary().tasks.find(t=>t.id===handle.dataset.todoResize);if(!task)return;const startY=e.clientY,startDuration=Number(task.duration)||60;const move=ev=>{task.duration=Math.max(30,Math.round((startDuration+(ev.clientY-startY)*1440/(panel.querySelector('.todo-calendar-body')?.clientHeight||620))/15)*15);renderTodoPanel()};const up=()=>{removeEventListener('pointermove',move);removeEventListener('pointerup',up);persist()};addEventListener('pointermove',move);addEventListener('pointerup',up,{once:true});}
  function onTodoSubmit(e){if(activeModule!=='todo'||!e.target.matches('[data-todo-form]'))return;e.preventDefault();const input=e.target.elements.title,title=input.value.trim();if(!title)return;const l=todoLibrary();l.inbox??=[];l.inbox.push({id:uid(),title});input.value='';persist();renderTodoPanel();}
  function onTodoDragOver(e){if(activeModule==='todo'&&e.target.closest('.todo-day-column,.todo-board-column')){e.preventDefault();e.dataTransfer.dropEffect='move';}}
  function onTodoDrop(e){if(activeModule!=='todo')return;const zone=e.target.closest('.todo-day-column,.todo-board-column');if(!zone)return;e.preventDefault();const raw=e.dataTransfer.getData('text/plain'),l=todoLibrary();if(raw.startsWith('inbox:')){const id=raw.slice(6),item=(l.inbox||[]).find(x=>x.id===id);if(!item)return;const date=zone.dataset.todoDate||todoDateKey(todoWeekStart()),task={id:uid(),title:item.title,date,start:9*60,duration:60,color:'blue',status:zone.dataset.todoStatus||'today'};l.tasks.push(task);l.inbox=l.inbox.filter(x=>x.id!==id);}else if(raw.startsWith('task:')){const task=l.tasks.find(x=>x.id===raw.slice(5));if(!task)return;if(zone.dataset.todoDate)task.date=zone.dataset.todoDate;if(zone.dataset.todoStatus)task.status=zone.dataset.todoStatus;}persist();renderTodoPanel();}
  // Exact standalone file from the "悬浮菜单对话" task. An iframe isolates
  // its document-wide styles and wheel interaction from the existing home page.
  function syncOrbitPreviewTheme(preview){
    if(!preview?.contentDocument)return;
    const documentInOrbit=preview.contentDocument;
    // A new iframe exposes about:blank before its actual document loads.
    // Never reveal that frame until the real menu can be themed.
    if(!documentInOrbit.querySelector('#liquidMenu .core'))return;
    const orbitThemeIcon={base:'lib-Leaf',music:'lib-Disc3',reading:'lib-BookOpen',flow:'lib-Waves',poly:'lib-Triangle',cosmos:'lib-Atom',flip:'lib-Calendar',rain:'lib-Droplets',projection:'lib-Presentation',cinema:'lib-Clapperboard',paper:'lib-Newspaper'};
    const themeIconId=orbitThemeIcon[cornerTheme()]||orbitThemeIcon.base;
    const logo=documentInOrbit.querySelector('.logo-mark');
    if(logo&&cornerTheme()==='paper'&&logo.dataset.shiyuThemeIcon!=='paper-daily'){
      logo.setAttribute('viewBox','0 0 24 24');
      logo.innerHTML='<g class="paper-logo"><path d="M2 4h20M2 6h20"/><text x="12" y="15" text-anchor="middle">日报</text><path d="M2 20h20"/></g>';
      logo.dataset.shiyuThemeIcon='paper-daily';
    }else if(logo&&cornerTheme()!=='paper'&&logo.dataset.shiyuThemeIcon!==themeIconId){
      const iconPaths=typeof ENTITY_ICONS==='object'&&ENTITY_ICONS[themeIconId]?ENTITY_ICONS[themeIconId][1]:'<circle cx="12" cy="12" r="8"/><path d="m8 13 3 3 5-7"/>';
      logo.setAttribute('viewBox','0 0 24 24');logo.innerHTML='<g class="theme-icon">'+iconPaths+'</g>';logo.dataset.shiyuThemeIcon=themeIconId;
    }
    const dockObject=document.querySelector('#dock .dock-trigger .dock-object'),dockSvg=dockObject?.querySelector('svg');
    if(logo&&dockObject&&cornerTheme()!=='paper'&&logo.dataset.shiyuThemeIcon!=='dock-'+cornerTheme()){
      logo.setAttribute('viewBox',dockSvg?.getAttribute('viewBox')||'0 0 24 24');
      logo.innerHTML=dockSvg?dockSvg.innerHTML:'<text x="12" y="16" text-anchor="middle">'+esc(dockObject.textContent?.trim()||'◎')+'</text>';
      logo.dataset.shiyuThemeIcon='dock-'+cornerTheme();
    }
    const coreTitle=documentInOrbit.querySelector('.core-title');if(coreTitle)coreTitle.textContent='我的一隅';
    const coreSubtitle=documentInOrbit.querySelector('.core-subtitle');if(coreSubtitle){coreSubtitle.textContent='';coreSubtitle.hidden=true;}
    const sectorModuleIds=enabledCornerModuleIds();
    const orbit=documentInOrbit.querySelector('#orbit'),items=[...documentInOrbit.querySelectorAll('.menu-item')],activeItems=items.slice(0,sectorModuleIds.length),stage=documentInOrbit.querySelector('.stage');
    stage?.classList.toggle('is-single-module',activeItems.length<2);
    const sectorStep=360/activeItems.length;
    const threeLabels=sectorModuleIds.map(id=>cornerModuleConfig(id).entryName||cornerModuleConfig(id).name);
    activeItems.forEach((item,index)=>{
      item.querySelector('span')?.replaceChildren(documentInOrbit.createTextNode(threeLabels[index]));
      item.setAttribute('aria-label',threeLabels[index]);
      item.style.setProperty('--angle',`${index*sectorStep}deg`);
      const iconMarkup=moduleIcon(sectorModuleIds[index]);
      if(item.dataset.shiyuModuleIcon!==sectorModuleIds[index]){
        const holder=documentInOrbit.createElement('template');holder.innerHTML=iconMarkup;
        const icon=holder.content.firstElementChild,source=item.querySelector('svg');
        if(icon&&source)source.replaceWith(icon);
        item.dataset.shiyuModuleIcon=sectorModuleIds[index];
      }
    });
    items.slice(activeItems.length).forEach(item=>{item.hidden=true;item.classList.remove('is-selected');});
    if(orbit&&items.length&&!orbit.dataset.shiyuTextOrientation){
      const updateTextOrientation=()=>{
        // The item itself rotates around the center. Keep its label's local
        // baseline horizontal so that the baseline stays perpendicular to
        // the radius and the whole label follows the turntable naturally.
        activeItems.forEach(item=>item.style.setProperty('--content-rotation','0deg'));
      };
      const observer=new preview.contentWindow.MutationObserver(updateTextOrientation);observer.observe(orbit,{attributes:true,attributeFilter:['style']});
      orbit.dataset.shiyuTextOrientation='orbit';updateTextOrientation();
    }
    if(orbit&&!orbit.dataset.shiyuThreeMenu){
      const mod=(value,length)=>((value%length)+length)%length;
      const marker=documentInOrbit.createElement('div');marker.className='orbit-selection-marker';marker.setAttribute('aria-hidden','true');stage.append(marker);
      let opening=false;
      const openOrbitModule=(index,event)=>{
        if(opening||panel?.open)return;
        const trigger=document.querySelector('#dock .corner-entry');if(!trigger)return;
        const frameRect=preview.getBoundingClientRect();
        const point={detail:{orbit:true},clientX:frameRect.left+(event?.clientX??frameRect.width/2),clientY:frameRect.top+(event?.clientY??frameRect.height/2)};
        const moduleId=sectorModuleIds[mod(index,sectorModuleIds.length)];
        opening=true;
        const feedback=event?.target?.closest?.('.core-hit')?documentInOrbit.querySelector('.core'):activeItems[mod(index,activeItems.length)];
        const animation=!reduced()?feedback?.animate([{scale:'1',opacity:1},{scale:'.95',opacity:.75},{scale:'1',opacity:1}],{duration:180,easing:'ease-out'}):null;
        (animation?animation.finished.catch(()=>{}):Promise.resolve()).then(()=>{opening=false;openCorner(trigger,null,point,moduleId);});
      };
      const indexFromPointer=event=>{
        const rect=stage.getBoundingClientRect(),x=event.clientX-rect.left-rect.width/2,y=event.clientY-rect.top-rect.height/2;
        const matrix=new preview.contentWindow.DOMMatrix(preview.contentWindow.getComputedStyle(orbit).transform);
        const rotation=Math.atan2(matrix.b,matrix.a)*180/Math.PI;
        return mod(Math.floor((Math.atan2(x,-y)*180/Math.PI-rotation+sectorStep/2)/sectorStep),activeItems.length);
      };
      orbit.addEventListener('pointermove',event=>{const index=indexFromPointer(event);activeItems.forEach((item,i)=>item.classList.toggle('is-pointer-hover',i===index));});
      orbit.addEventListener('pointerleave',()=>activeItems.forEach(item=>item.classList.remove('is-pointer-hover')));
      const setThreeRotation=(nextRotation,announce=false)=>{
        const previous=Number.parseFloat(orbit.style.getPropertyValue('--rotation'))||0;
        const rotation=Math.round(nextRotation/sectorStep)*sectorStep;
        orbit.style.setProperty('--rotation',`${rotation}deg`);
        const selected=mod(Math.round(-rotation/sectorStep),activeItems.length);
        activeItems.forEach((item,index)=>item.classList.toggle('is-selected',index===selected));
        try{localStorage.setItem('shiyu-corner-selected-module',sectorModuleIds[selected]||'');}catch{}
        if(announce&&rotation!==previous)playCardSound();
      };
      const nearestRotationForIndex=(index,current)=>{
        const base=-index*sectorStep,turns=Math.round((current-base)/360);
        return base+turns*360;
      };
      stage?.addEventListener('wheel',event=>{
        if(!stage.classList.contains('is-hover'))return;
        prepareCardAudio();
        event.preventDefault();event.stopImmediatePropagation();
        const rotation=Number.parseFloat(orbit.style.getPropertyValue('--rotation'))||0;
        setThreeRotation(rotation+(event.deltaY>0?sectorStep:-sectorStep),true);
      },{capture:true,passive:false});
      orbit.addEventListener('click',event=>{
        if(!stage?.classList.contains('is-hover'))return;
        if(event.target?.closest?.('.core-hit,.core'))return;
        event.preventDefault();event.stopImmediatePropagation();
        const index=indexFromPointer(event);
        const currentRotation=Number.parseFloat(orbit.style.getPropertyValue('--rotation'))||0;
        // Keep the current revolution. Clicking after several wheel turns now
        // takes the shortest local step instead of rewinding to turn zero.
        setThreeRotation(nearestRotationForIndex(index,currentRotation),true);
        openOrbitModule(index,event);
      },{capture:true});
      let initialIndex=0;try{const saved=localStorage.getItem('shiyu-corner-selected-module');const found=sectorModuleIds.indexOf(saved);if(found>=0)initialIndex=found;}catch{}
      setThreeRotation(-initialIndex*sectorStep);orbit.dataset.shiyuThreeMenu='true';
      orbit._shiyuOpenOrbitModule=openOrbitModule;
    }
    const coreHit=documentInOrbit.querySelector('.core-hit');
    if(coreHit&&!coreHit.dataset.shiyuDragBound){
      let pressTimer=0,dragging=false,suppressClick=false,startX=0,startY=0,startLeft=0,startTop=0;
      const endDrag=()=>{clearTimeout(pressTimer);coreHit.classList.remove('is-dragging');if(dragging){dragging=false;suppressClick=true;setTimeout(()=>{suppressClick=false},0)}};
      coreHit.addEventListener('pointerdown',event=>{
        if(event.button!==0)return;
        prepareCardAudio();
        const rect=preview.getBoundingClientRect();
        startX=event.screenX;startY=event.screenY;startLeft=rect.left;startTop=rect.top;
        pressTimer=window.setTimeout(()=>{dragging=true;coreHit.classList.add('is-dragging');preview.style.transform='none';preview.style.left=`${startLeft}px`;preview.style.top=`${startTop}px`;coreHit.setPointerCapture?.(event.pointerId);preview.dataset.orbitDragged='true';},280);
      });
      coreHit.addEventListener('pointermove',event=>{
        if(!dragging)return;event.preventDefault();
        // screen coordinates stay stable when the iframe itself moves.
        preview.style.left=`${startLeft+event.screenX-startX}px`;preview.style.top=`${startTop+event.screenY-startY}px`;preview.style.right='auto';preview.style.bottom='auto';preview.style.transform='none';
      });
      coreHit.addEventListener('pointerup',endDrag);coreHit.addEventListener('pointercancel',endDrag);
      coreHit.addEventListener('click',event=>{
        if(suppressClick||dragging)return;
        event.preventDefault();event.stopImmediatePropagation();
        const rotation=Number.parseFloat(orbit?.style.getPropertyValue('--rotation'))||0;
        const selected=((Math.round(-rotation/sectorStep)%sectorModuleIds.length)+sectorModuleIds.length)%sectorModuleIds.length;
        orbit?._shiyuOpenOrbitModule?.(selected,event);
      });
      documentInOrbit.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopImmediatePropagation();}},true);
      coreHit.dataset.shiyuDragBound='true';
    }
    const root=getComputedStyle(document.documentElement),bodyStyle=getComputedStyle(document.body);
    const read=(name,fallback)=>{
      const value=(bodyStyle.getPropertyValue(name)||root.getPropertyValue(name)||'').trim();
      return value.replace(/[{}<>]/g,'')||fallback;
    };
    const accent=read('--accent','#48614c'),surface=read('--surface','#fff'),ink=read('--ink','#27312b'),muted=read('--muted','#69736b'),line=read('--line','#d8ddd8'),font=read('--font','Inter,"Segoe UI","Microsoft YaHei",sans-serif');
    // The menu runs in its own iframe, so the parent page's @font-face rules
    // do not cross the document boundary. Register the known Shiyu fonts in
    // the iframe before applying the inherited --font stack.
    const fontFace=/Shiyu Youfeng Preview/i.test(font)
      ? "@font-face{font-family:'Shiyu Youfeng Preview';font-style:normal;font-weight:400;font-display:swap;src:url('/assets/fonts/shiyu-youfeng/ShiyuYoufeng-Preview-Regular.woff2') format('woff2')}"
      :/Shiyu Qingya Song Preview/i.test(font)
        ? "@font-face{font-family:'Shiyu Qingya Song Preview';font-style:normal;font-weight:400;font-display:swap;src:url('/assets/fonts/shiyu-qingya-song/ShiyuQingyaSong-Preview-Regular.woff2') format('woff2')}"
        :/Shiyu Wenrun Kai Preview/i.test(font)
          ? "@font-face{font-family:'Shiyu Wenrun Kai Preview';font-style:normal;font-weight:400;font-display:swap;src:url('/assets/fonts/shiyu-wenrun-kai/ShiyuWenrunKai-Preview-Regular.woff2') format('woff2')}"
          :'';
    const css=`
      ${fontFace}
      :root{color-scheme:light!important;--orbit-accent:${accent};--orbit-surface:${surface};--orbit-ink:${ink};--orbit-muted:${muted};--orbit-line:${line};--orbit-font:${font}}
      html,body{background:transparent!important}
      body,button,.menu-item span,.core-title,.core-subtitle,.status-line{color:var(--orbit-ink)!important;font-family:var(--orbit-font)!important}
      body::before,body::after{display:none!important}
      .stage::before{display:none!important}
      .stage::after{display:none!important}
      .orbit-track,.orbit-track::before,.orbit-track::after{display:none!important}
      .stage:not(.is-hover) .orbit{opacity:0!important;pointer-events:none!important;transition:opacity .28s ease!important}
      .stage.is-hover .orbit{opacity:1!important;pointer-events:auto!important;transition:opacity .28s ease!important}
      /* Keep the six interactive sectors, but clip their outer tips to one
         shared circular envelope. This changes the silhouette only; the
         source wheel/click handlers and their hit flow remain untouched. */
      .orbit{clip-path:circle(40% at 50% 50%)!important}
      .orbit::before{border-color:color-mix(in srgb,var(--orbit-accent) 42%,transparent)!important;box-shadow:0 0 30px color-mix(in srgb,var(--orbit-accent) 10%,transparent),inset 0 0 22px color-mix(in srgb,var(--orbit-accent) 8%,transparent)!important}
      .orbit::after{border-color:color-mix(in srgb,var(--orbit-accent) 36%,transparent)!important}
      /* Only the visible center disc is slightly smaller; keep the original
         invisible core hit area so the hover interaction does not move. */
      .core{inset:35%!important}
      .core-hit{inset:35%!important;border-radius:50%!important}
      .menu-item{color:var(--orbit-ink)!important;background:conic-gradient(from ${-sectorStep/2+2}deg,color-mix(in srgb,var(--orbit-accent) 22%,var(--orbit-surface)) 0 ${sectorStep-4}deg,transparent ${sectorStep-4}deg 360deg)!important;-webkit-mask:radial-gradient(circle at center,transparent 0 31%,#000 31.5% 100%),conic-gradient(from ${-sectorStep/2+2}deg,#000 0 ${sectorStep-4}deg,transparent ${sectorStep-4}deg 360deg)!important;mask:radial-gradient(circle at center,transparent 0 31%,#000 31.5% 100%),conic-gradient(from ${-sectorStep/2+2}deg,#000 0 ${sectorStep-4}deg,transparent ${sectorStep-4}deg 360deg)!important;-webkit-mask-composite:source-in!important;mask-composite:intersect!important;filter:drop-shadow(0 10px 18px #0001)!important}
      .menu-item[hidden]{display:none!important}
      .orbit-selection-marker{position:absolute;left:50%;top:8%;width:22px;height:5px;border-radius:8px;transform:translateX(-50%);background:color-mix(in srgb,var(--orbit-accent) 65%,var(--orbit-ink));box-shadow:0 0 10px color-mix(in srgb,var(--orbit-accent) 65%,transparent);z-index:5;pointer-events:none;opacity:0;transition:opacity .25s}
      .orbit-selection-marker{display:none!important}
      .stage.is-hover .orbit-selection-marker{opacity:1;transition-delay:1s}
      .stage .menu-item.is-pointer-hover{background:conic-gradient(from ${-sectorStep/2+2}deg,color-mix(in srgb,var(--orbit-accent) 52%,var(--orbit-surface)) 0 ${sectorStep-4}deg,transparent ${sectorStep-4}deg 360deg)!important;filter:brightness(1.15)!important}
      .stage .menu-item span{text-shadow:0 1px 3px color-mix(in srgb,#000 38%,transparent);font-weight:650!important;-webkit-font-smoothing:antialiased}
      .stage .menu-item.is-pointer-hover span,.stage .menu-item:hover span,.stage .menu-item.is-selected span{font-weight:700!important;text-shadow:0 1px 4px color-mix(in srgb,#000 48%,transparent)}
      .menu-item.is-pointer-hover svg{width:27px;height:27px}
      .menu-item svg{transition:width .18s ease,height .18s ease}

      .menu-item:hover,.menu-item.is-selected{color:var(--orbit-ink)!important;background:conic-gradient(from ${-sectorStep/2+2}deg,color-mix(in srgb,var(--orbit-accent) 36%,var(--orbit-surface)) 0 ${sectorStep-4}deg,transparent ${sectorStep-4}deg 360deg)!important;filter:drop-shadow(0 0 9px color-mix(in srgb,var(--orbit-accent) 32%,transparent)) drop-shadow(0 12px 20px #0002)!important}
      .menu-item.is-selected{background:conic-gradient(from ${-sectorStep/2+2}deg,color-mix(in srgb,var(--orbit-accent) 54%,var(--orbit-surface)) 0 ${sectorStep-4}deg,transparent ${sectorStep-4}deg 360deg)!important;filter:brightness(1.18) drop-shadow(0 0 12px color-mix(in srgb,var(--orbit-accent) 48%,transparent))!important}
      .core{background:color-mix(in srgb,var(--orbit-surface) 68%,transparent)!important;backdrop-filter:blur(12px) saturate(1.12)!important;-webkit-backdrop-filter:blur(12px) saturate(1.12)!important;border-color:color-mix(in srgb,var(--orbit-accent) 46%,transparent)!important;box-shadow:0 0 0 10px color-mix(in srgb,var(--orbit-accent) 6%,transparent),0 0 44px color-mix(in srgb,var(--orbit-accent) 18%,transparent),inset 0 0 38px color-mix(in srgb,var(--orbit-accent) 10%,transparent)!important;transition:opacity .62s ease,border-color .3s ease,box-shadow .3s ease}
      .stage:not(.is-hover) .core{opacity:1!important}
      .stage:not(.is-hover) .core{background:color-mix(in srgb,var(--orbit-surface) 28%,transparent)!important;border-color:color-mix(in srgb,var(--orbit-ink) 20%,transparent)!important;box-shadow:0 8px 25px color-mix(in srgb,#111326 12%,transparent)!important;backdrop-filter:blur(12px) saturate(1.08)!important;-webkit-backdrop-filter:blur(12px) saturate(1.08)!important}
      .stage.is-hover .core{opacity:1!important}
      .stage.is-single-module .orbit,.stage.is-single-module .orbit-track{display:none!important}
      .core-hit{cursor:pointer!important}
      .core-hit.is-dragging{cursor:grabbing!important}
      .core::before{border-color:color-mix(in srgb,var(--orbit-accent) 32%,transparent)!important}
      .core::after{border-color:color-mix(in srgb,var(--orbit-accent) 28%,transparent)!important}
      .logo-mark circle,.logo-mark path{stroke:var(--orbit-ink)!important}
      .logo-mark :is(circle,path,rect,line,polyline,polygon,ellipse){fill:none!important;stroke:var(--orbit-ink)!important}
      .logo-mark .accent{stroke:color-mix(in srgb,var(--orbit-accent) 60%,var(--orbit-ink))!important}
      .logo-mark .paper-logo text{fill:var(--orbit-ink)!important;stroke:none!important;font-family:serif;font-size:16px;font-weight:600;letter-spacing:1px}
      .logo-mark text{fill:var(--orbit-ink)!important;stroke:none!important;font-size:18px;font-weight:600;font-family:var(--orbit-font)!important}
      .stage.is-hover .logo-mark :is(circle,path,rect,line,polyline,polygon,ellipse){stroke:var(--orbit-accent)!important;transition:stroke .25s ease}
      .core-title{color:var(--orbit-ink)!important;font-size:clamp(12px,2vw,17px)!important;letter-spacing:.1em!important;text-indent:.1em!important;font-weight:400!important;transform:translateY(-4px)!important;transition:font-weight .2s ease,transform .2s ease}
      .stage.is-hover .core-title{font-weight:650!important}
      .core-content{gap:5px!important;max-width:82%!important}
      .logo-mark{width:42px!important;height:42px!important;overflow:visible!important}
      .core-title{font-size:clamp(10px,1.45vw,13px)!important;letter-spacing:.07em!important;text-indent:.07em!important;transform:translateY(-4px)!important}
      .menu-item svg{top:14%!important;transition:top .18s ease,width .18s ease,height .18s ease}
      .menu-item svg{stroke-width:1.8!important;shape-rendering:geometricPrecision}
      .menu-item span{top:24%!important;font-size:clamp(11px,2vw,14px)!important;font-weight:500!important;letter-spacing:.08em!important;text-rendering:optimizeLegibility;font-synthesis:none;-webkit-font-smoothing:auto;text-shadow:none;opacity:1!important}
      .menu-item span{font-size:clamp(14px,2.6vw,18px)!important;font-weight:700!important;letter-spacing:.04em!important;line-height:1.2!important;color:var(--orbit-ink)!important;text-rendering:geometricPrecision; font-synthesis:none;-webkit-font-smoothing:antialiased;text-shadow:0 1px 2px color-mix(in srgb,#000 34%,transparent);transform:translate(-50%,-50%) rotate(var(--content-rotation,0deg)) translateZ(0);}
      .core-subtitle,.status-line{display:none!important}
      .stage.is-hover.is-filled .core{background:var(--orbit-accent)!important}
      .stage.is-hover.is-filled .water-fill{background:var(--orbit-accent)!important}
      .stage.is-hover.is-filled .core-title{color:#fff!important}
      .stage.is-hover.is-filled .logo-mark :is(circle,path,rect,line,polyline,polygon,ellipse){stroke:#fff!important}
      .stage.is-hover.is-filled .logo-mark text{fill:#fff!important;stroke:none!important}
      .water-fill{background:linear-gradient(180deg,color-mix(in srgb,var(--orbit-accent) 40%,var(--orbit-surface)),color-mix(in srgb,var(--orbit-accent) 26%,var(--orbit-surface)) 48%,color-mix(in srgb,var(--orbit-accent) 18%,var(--orbit-surface)))!important}
    `;
    let style=preview.contentDocument.getElementById('shiyu-orbit-adapter');
    if(!style){style=preview.contentDocument.createElement('style');style.id='shiyu-orbit-adapter';preview.contentDocument.head.append(style)}
    if(style.textContent!==css)style.textContent=css;
    if(preview.id==='corner-orbit-demo'&&!documentInOrbit.querySelector('#orbit-demo-motion')){
      const demoStyle=documentInOrbit.createElement('style');demoStyle.id='orbit-demo-motion';
      demoStyle.textContent=`
        :root{--demo-gradient:linear-gradient(114.41deg,#0ae448 20.74%,#abff84 65.5%)}
        .stage .core,.stage.is-hover .core,.stage.is-hover.is-filled .core{background:color-mix(in srgb,var(--orbit-surface) 34%,transparent)!important;border-color:color-mix(in srgb,var(--orbit-ink) 16%,transparent)!important;backdrop-filter:blur(18px) saturate(115%)!important;-webkit-backdrop-filter:blur(18px) saturate(115%)!important;box-shadow:0 10px 30px color-mix(in srgb,var(--orbit-ink) 10%,transparent),inset 0 1px 0 color-mix(in srgb,white 42%,transparent)!important}
        .stage .core-title,.stage.is-hover .core-title{color:var(--orbit-ink)!important}
        .stage:not(.is-hover) .core{background:color-mix(in srgb,var(--orbit-surface) 34%,transparent)!important;border-color:color-mix(in srgb,var(--orbit-ink) 14%,transparent)!important}
        .stage:not(.is-hover) .core-title{color:var(--orbit-ink)!important}
        .stage.is-hover .core-title{color:#fff!important}
        .stage.is-hover:not(.is-filled) .core-title{color:var(--orbit-ink)!important}
        .stage:not(.is-hover) .core,.stage:not(.is-hover) .core-hit{border-radius:999px!important}
        .stage:not(.is-hover) .core-hit{pointer-events:none!important}
        .stage:not(.is-hover) .core::before,.stage:not(.is-hover) .core::after,.stage:not(.is-hover) .orbit-track{display:none!important}
        .stage .logo-mark :is(circle,path,rect,line,polyline,polygon,ellipse){stroke:#fff!important}
        .stage .logo-mark text{fill:#fff!important;stroke:none!important}
        .stage.is-hover .water-fill,.stage.is-hover.is-filled .water-fill{background:linear-gradient(160deg,color-mix(in srgb,var(--orbit-accent) 78%,white),color-mix(in srgb,var(--orbit-accent) 72%,#111827))!important}
        .stage .core,.stage .core-hit{inset:43% 24%!important;translate:var(--magnet-x,0px) var(--magnet-y,0px);rotate:var(--magnet-angle,0deg);transition:inset .5s cubic-bezier(.34,1.56,.64,1),background .25s ease!important}
        .stage.is-hover .core,.stage.is-hover .core-hit{inset:35%!important}
        .stage:not(.is-filled) .logo-mark{display:none!important}
        .stage:not(.is-filled) .core-content{transform:none!important}
        .stage .core-title{white-space:nowrap!important;flex-shrink:0}
        .stage:not(.is-filled) .core-title{transform:none!important}
        .stage:not(.is-hover):not(.is-filled) .core-title{transform:translate(var(--label-x,0px),var(--label-y,0px))!important}
        .stage .menu-shell{opacity:0!important;transform:scale(.55)!important;pointer-events:none!important;transition:opacity .25s ease,transform .6s cubic-bezier(.34,1.56,.64,1)!important;transition-delay:0s!important}
        .stage.is-hover.is-filled .menu-shell{opacity:1!important;transform:scale(1)!important;pointer-events:auto!important}
      `;
      documentInOrbit.head.append(demoStyle);
      stage.addEventListener('wheel',event=>{event.stopImmediatePropagation();},{capture:true,passive:true});
      // One animation loop updates magnetic properties only; shape and fill stay independent.
      let magnetFrame=0,lastMagnetTime=0,returning=false,wiggleFrame=0;
      const magnet={x:0,y:0,angle:0,vx:0,vy:0,va:0,tx:0,ty:0,ta:0};
      const paintMagnet=()=>{stage.style.setProperty('--magnet-x',magnet.x+'px');stage.style.setProperty('--magnet-y',magnet.y+'px');stage.style.setProperty('--magnet-angle',(magnet.angle+Math.sin(performance.now()/1500*Math.PI*2)*.6)+'deg')};
      const stepMagnet=now=>{
        const dt=Math.min((now-lastMagnetTime)/1000||1/60,1/30);lastMagnetTime=now;
        const stiffness=returning?180:420,damping=returning?15:30;
        for(const [pos,velocity,target] of [['x','vx','tx'],['y','vy','ty'],['angle','va','ta']]){magnet[velocity]+=(stiffness*(magnet[target]-magnet[pos])-damping*magnet[velocity])*dt;magnet[pos]+=magnet[velocity]*dt}
        paintMagnet();
        if(Math.abs(magnet.tx-magnet.x)+Math.abs(magnet.ty-magnet.y)+Math.abs(magnet.ta-magnet.angle)+Math.abs(magnet.vx)+Math.abs(magnet.vy)+Math.abs(magnet.va)>.08)magnetFrame=preview.contentWindow.requestAnimationFrame(stepMagnet);
        else{magnet.x=magnet.tx;magnet.y=magnet.ty;magnet.angle=magnet.ta;magnet.vx=magnet.vy=magnet.va=0;paintMagnet();magnetFrame=0}
      };
      const aimMagnet=(x,y,angle,release=false)=>{returning=release;magnet.tx=x;magnet.ty=y;magnet.ta=angle;if(reduced()){magnet.x=x;magnet.y=y;magnet.angle=angle;paintMagnet();return}if(!magnetFrame){lastMagnetTime=performance.now();magnetFrame=preview.contentWindow.requestAnimationFrame(stepMagnet)}};
      const tickWiggle=()=>{paintMagnet();wiggleFrame=preview.contentWindow.requestAnimationFrame(tickWiggle)};
      if(!reduced())wiggleFrame=preview.contentWindow.requestAnimationFrame(tickWiggle);
      stage.addEventListener('orbit-hover-activated',()=>aimMagnet(0,0,0));
      /* 暂停外围监听区域：先仅保留胶囊本体的悬停展开，便于验证误触发来源。 */
      /*
      stage.addEventListener('pointermove',event=>{if(stage.classList.contains('is-hover'))return;const rect=stage.getBoundingClientRect(),x=event.clientX-rect.left-rect.width/2,y=event.clientY-rect.top-rect.height/2;aimMagnet(Math.max(-42,Math.min(42,x*.34)),Math.max(-28,Math.min(28,y*.28)),Math.max(-1.5,Math.min(1.5,x*.012)));stage.style.setProperty('--label-x',Math.max(-30,Math.min(30,x*.24))+'px');stage.style.setProperty('--label-y',Math.max(-20,Math.min(20,y*.2))+'px')});
      */
      coreHit.addEventListener('pointerenter',()=>{stage.style.setProperty('--label-x','0px');stage.style.setProperty('--label-y','0px')});
      /*
      stage.addEventListener('pointerleave',event=>{const rect=stage.getBoundingClientRect();if(Number.isFinite(event.clientX)&&event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom)return;stage.style.setProperty('--label-x','0px');stage.style.setProperty('--label-y','0px');aimMagnet(0,0,0,true)});
      */
    }
    if(preview.dataset.themeReady!=='true'&&!preview._orbitRevealPending){
      preview._orbitRevealPending=true;
      const core=documentInOrbit.querySelector('.core');
      core.style.setProperty('transition','none','important');
      const titleStyle=preview.contentWindow.getComputedStyle(coreTitle);
      const fonts=documentInOrbit.fonts.load(`${titleStyle.fontSize} ${titleStyle.fontFamily}`,'我的一隅');
      fonts.catch(()=>{}).then(()=>{
        if(preview.contentDocument!==documentInOrbit)return;
        documentInOrbit.documentElement.dataset.shiyuOrbitReady='true';
        alignOrbitPreview(preview);
        preview.contentWindow.getComputedStyle(core).opacity;
        preview.dataset.themeReady='true';
        requestAnimationFrame(()=>requestAnimationFrame(()=>core.style.removeProperty('transition')));
      });
    }
  }
  function alignOrbitPreview(preview){
    if(!preview||preview.dataset.orbitDragged==='true'||!['home','space'].includes(document.body.dataset.view))return;
    preview.style.left='50%';preview.style.right='auto';preview.style.transform='translateX(-50%)';
    // The iframe contains the orbit stage with internal lower padding. Offset
    // the host downward so the visible center circle sits near the bottom safe
    // area rather than appearing in the middle of the page.
    // A world-page reload initializes this iframe while display:none. Anchor to
    // the viewport instead of measuring a zero-height frame and placing it below it.
    preview.style.top='auto';
    preview.style.bottom='-120px';
  }
  function wakeOrbitPreview(preview){
    if(!preview)return;
    preview.classList.remove('is-idle-hidden');
    clearTimeout(preview._shiyuIdleTimer);
    preview._shiyuIdleTimer=window.setTimeout(()=>{
      if(document.body.dataset.view==='home'&&!preview._shiyuOrbitInside)preview.classList.add('is-idle-hidden');
    },10000);
  }
  function refreshOrbitPreview(){
    let preview=document.querySelector('#corner-orbit-preview');
    if(!preview){
      preview=document.createElement('iframe');preview.id='corner-orbit-preview';
      preview.dataset.themeReady='false';
      preview.title='悬浮菜单原版组件预览';preview.src='liquid-orbit-menu.html?center-core=v31';
      preview.addEventListener('load',()=>{
        syncOrbitPreviewTheme(preview);
        preview.contentWindow?.addEventListener('pointerenter',()=>{preview._shiyuOrbitInside=true;wakeOrbitPreview(preview)},{passive:true});
        preview.contentWindow?.addEventListener('pointermove',()=>{preview._shiyuOrbitInside=true;wakeOrbitPreview(preview)},{passive:true});
        preview.contentWindow?.addEventListener('pointerleave',()=>{preview._shiyuOrbitInside=false;wakeOrbitPreview(preview)},{passive:true});
      });
      document.body.append(preview);
    }
    syncOrbitPreviewTheme(preview);
    alignOrbitPreview(preview);
    if(!document.documentElement.dataset.shiyuOrbitThemeWatch){
      const themeWatch=new MutationObserver(()=>{
        const current=document.querySelector('#corner-orbit-preview');
        if(current)syncOrbitPreviewTheme(current);
        const demo=document.querySelector('#corner-orbit-demo');if(demo)syncOrbitPreviewTheme(demo);
      });
      themeWatch.observe(document.documentElement,{attributes:true,attributeFilter:['style']});
      themeWatch.observe(document.body,{attributes:true,attributeFilter:['data-theme','data-dark']});
      document.documentElement.dataset.shiyuOrbitThemeWatch='true';
    }
    if(!document.documentElement.dataset.shiyuOrbitIdleWatch){
      window.addEventListener('pointermove',event=>{
        const current=document.querySelector('#corner-orbit-preview');if(!current)return;
        const rect=current.getBoundingClientRect();
        current._shiyuOrbitInside=event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom;
        wakeOrbitPreview(current);
      },{passive:true});
      document.documentElement.dataset.shiyuOrbitIdleWatch='true';
    }
    if(!document.documentElement.dataset.shiyuOrbitViewWatch){
      const viewWatch=new MutationObserver(()=>refreshOrbitPreview());
      viewWatch.observe(document.body,{attributes:true,attributeFilter:['data-view']});
      document.documentElement.dataset.shiyuOrbitViewWatch='true';
    }
    if(!document.documentElement.dataset.shiyuOrbitWheelRelay){
      window.addEventListener('message',event=>{
        const current=document.querySelector('#corner-orbit-preview');
        if(!current||event.source!==current.contentWindow||event.data?.type!=='shiyu-orbit-wheel')return;
        const delta=Number(event.data.deltaY)||0;if(!delta)return;
        const atBoundary=document.body.dataset.view==='home'
          ?window.scrollY+innerHeight>=document.documentElement.scrollHeight-8
          :document.body.dataset.view==='space'&&window.scrollY<=2;
        if(atBoundary){
          document.documentElement.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:delta,deltaMode:Number(event.data.deltaMode)||0}));
        }else window.scrollBy({top:delta,left:0,behavior:'auto'});
      });
      document.documentElement.dataset.shiyuOrbitWheelRelay='true';
    }
    preview.hidden=!['home','space'].includes(document.body.dataset.view);
    wakeOrbitPreview(preview);
    let demo=document.querySelector('#corner-orbit-demo');
    if(!demo){
      demo=document.createElement('iframe');demo.id='corner-orbit-demo';demo.title='我的一隅 · 自动展开预览';demo.dataset.themeReady='false';
      // Register before the module wheel listener: this version opens on hover only.
      demo.addEventListener('load',()=>{demo.contentDocument.querySelector('.stage')?.addEventListener('wheel',event=>event.stopImmediatePropagation(),{capture:true,passive:true});syncOrbitPreviewTheme(demo)});
      demo.src='liquid-orbit-menu.html?interaction=hover-preview';document.body.append(demo);
    }
    demo.hidden=!['home','space'].includes(document.body.dataset.view);syncOrbitPreviewTheme(demo);alignOrbitPreview(demo);
  }

  addEventListener('resize',refreshOrbitPreview);
  let lastCardLimit=cardLimit();
  addEventListener('shiyu-user-entitlements',()=>{const next=cardLimit();if(next===lastCardLimit)return;lastCardLimit=next;if(panel?.open)renderPanel()});
  function syncCornerAvailability(){
    const entry=document.querySelector('#dock .corner-entry'),dockEl=document.querySelector('#dock .dock');
    if(!entry)return;
    const locked=document.body.classList.contains('theme-preview-corner-disabled');
    entry.disabled=locked;entry.setAttribute('aria-disabled',String(locked));entry.classList.toggle('is-disabled',locked);entry.tabIndex=locked?-1:0;

    if(locked){dockEl?.classList.remove('open');entry.setAttribute('aria-expanded','false');}
  }
  addEventListener('shiyu-theme-preview-state',syncCornerAvailability);
  const previousDock=dock;
  dock=function(){
    if(view==='home'){const host=document.querySelector('#dock');host.dataset.dockTheme=dockTheme();host.innerHTML='<div class="dock"><button class="dock-trigger"><span class="dock-label"></span></button></div>';}else previousDock();const dockEl=document.querySelector('#dock .dock');if(!dockEl)return;
    // Keep original space options in place for a reversible entry change.
    const legacy=dockEl.querySelector('.dock-options');if(legacy){legacy.hidden=true;legacy.setAttribute('aria-hidden','true');legacy.inert=true;}
    const entry=dockEl.querySelector('.dock-trigger');if(!entry)return;
    entry.removeAttribute('data-action');entry.classList.add('corner-entry','corner-themed-entry','corner-legacy-hidden');entry.title='';entry.setAttribute('aria-label','');entry.setAttribute('aria-hidden','true');entry.setAttribute('aria-haspopup','dialog');entry.tabIndex=-1;entry.querySelector('.dock-label').textContent='';
    dockEl.classList.add('corner-unified');refreshOrbitPreview();
    const requireCornerLogin=()=>{if(signed)return true;show('#login');return false;};
    entry.onclick=e=>{if(entry.disabled)return;e.stopPropagation();if(!requireCornerLogin())return;openCorner(entry,null,e,'common');};
    syncCornerAvailability();
  };
  // A website action adds only that website; card-level collection tools stay separate.
  window.ShiyuCorner=Object.freeze({
    cards:()=>moduleCollection('common').groups.map(g=>({id:g.id,name:g.name,icon:cardIcon(g),inbox:isInbox(g)})),
    addBookmark(source,gid){
      const x=sources().find(x=>x.sid===source.sid&&x.cid===source.cid&&x.gid===source.gid&&x.url===source.url);
      if(!x){toast('这个网址已被移动或删除，请重新选择');return}
      const groups=moduleCollection('common').groups,target=gid?groups.find(g=>g.id===gid):groups.find(isInbox);if(!target){toast('这张卡片已不存在，请重新选择');return}
      if(target.refs.some(r=>r.gid===x.gid&&r.url===x.url)){toast('已在「'+target.name+'」中');return}
      let existing;for(const g of groups){const ref=g.refs.find(r=>r.gid===x.gid&&r.url===x.url);if(ref){existing??=ref;g.refs=g.refs.filter(r=>r!==ref)}}
      target.refs.push(existing||{id:uid(),sid:x.sid,cid:x.cid,gid:x.gid,url:x.url});persist();
      if(panel?.open)refreshLinks(groups.map(g=>g.id));toast('已添加到「'+target.name+'」');
    }
  });
  const previousEdit=editBookmark;
  editBookmark=function(index){
    const group=currentGroup(),item=group.items[index],source={sid:spaceId,cid:sceneId,gid:group.id,url:item[1]};previousEdit(index);
    const form=document.querySelector('#bookmark-editor-form');if(!form)return;
    const submit=form.onsubmit;form.onsubmit=function(e){submit.call(this,e);if(document.querySelector('#bookmark-editor').open)return;const next=group.items[index];if(!next)return;
      for(const library of Object.values(prefs.cornerCollections||{}))for(const g of library.groups)for(const r of g.refs)if(r.gid===source.gid&&r.url===source.url)r.url=next[1];persist();
    };
  };
  const renderBeforeSwitchCleanup=render;render=function(){closeSwitch();return renderBeforeSwitchCleanup();};
  dock();
  void loadCornerConfig();
})();

/* Actions for the existing website cards. Keep collection data and editors shared. */
(()=>{
 'use strict';
 const svg=path=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
 const icons={more:svg('<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'),edit:svg('<path d="m4 16 11-11 4 4L8 20H4zM13 7l4 4"/>'),corner:svg('<rect x="5" y="3" width="15" height="17" rx="2"/><path d="M2 7v14h14M9 11h7m-3-3v6"/>'),move:svg('<path d="M4 6h10m-4-4 4 4-4 4M20 18H10m4-4-4 4 4 4"/>'),batch:svg('<rect x="3" y="4" width="7" height="7" rx="1"/><path d="m4 7 2 2 3-3M14 7h7M3 15h7m-7 5h7m5-5 5 3-5 3m-2-3h7"/>'),delete:svg('<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>')};
 let menu,anchor,source,leaveTimer;
 icons.open=svg('<path d="M14 3h7v7M21 3 10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>');
 const contexts=()=>data.flatMap(s=>s.scenes.flatMap(c=>c.groups.map(g=>({s,c,g}))));
 const context=()=>({s:space(),c:scene(),g:currentGroup()});
 function valid(ctx){return contexts().some(x=>x.g===ctx.g)&&ctx.g.items.includes(ctx.item)}
 function authorize(ctx,fn){authorizeOrganization(()=>{if(!valid(ctx)){toast('这个网址已被移动或删除，请重新选择');return}if(memberReadOnly()){memberGate('space');return}fn()})}
 function closeMenu(focus=false){clearTimeout(leaveTimer);if(!menu)return;hideCornerTargets();if(menu.matches(':popover-open'))menu.hidePopover();menu.hidden=true;anchor?.setAttribute('aria-expanded','false');if(focus&&anchor?.isConnected)anchor.focus();anchor=null;source=null}
 function hideCornerTargets(){const sub=menu?.querySelector('.bookmark-corner-targets');if(sub)sub.hidden=true;menu?.querySelector('[data-bookmark-action=corner]')?.setAttribute('aria-expanded','false')}
 function showCornerTargets(button,keyboard=false){
   clearTimeout(leaveTimer);let sub=menu.querySelector('.bookmark-corner-targets');
   if(!sub){sub=document.createElement('div');sub.className='bookmark-corner-targets';sub.id='bookmark-corner-targets';sub.setAttribute('role','menu');sub.setAttribute('aria-label','添加到我的一隅卡片');menu.append(sub)}
   if(sub.hidden||!sub.childElementCount)sub.innerHTML=window.ShiyuCorner.cards().map(g=>'<button type="button" role="menuitem" data-corner-target="'+esc(g.id)+'">'+g.icon+'<span>'+esc(g.name)+'</span>'+(g.inbox?'<small>默认</small>':'')+'</button>').join('');
   sub.hidden=false;button.setAttribute('aria-expanded','true');
   const r=button.getBoundingClientRect(),m=menu.getBoundingClientRect(),width=sub.offsetWidth;
   const left=m.right+4+width<=innerWidth-8?m.right+4:m.left-width-4>=8?m.left-width-4:Math.max(8,innerWidth-width-8);
   sub.style.left=left+'px';sub.style.top=Math.max(8,Math.min(r.top,innerHeight-sub.offsetHeight-8))+'px';
   if(keyboard)sub.querySelector('button')?.focus();
 }
 function deferClose(){clearTimeout(leaveTimer);leaveTimer=setTimeout(()=>{if(!menu?.matches(':hover')&&!anchor?.matches(':hover')&&!menu?.contains(document.activeElement))closeMenu()},180)}
 function openMenu(button,ctx,keyboard=false){
   clearTimeout(leaveTimer);if(anchor===button&&menu&&!menu.hidden){if(keyboard)menu.querySelector('button').focus();return}
   closeMenu();anchor=button;source=ctx;
   if(!menu){menu=document.createElement('div');menu.id='bookmark-action-menu';menu.className='bookmark-action-menu';menu.setAttribute('popover','manual');menu.setAttribute('role','menu');document.body.append(menu);menu.onpointerenter=()=>clearTimeout(leaveTimer);menu.onpointerleave=deferClose;menu.onfocusout=deferClose;
     menu.onclick=event=>{const target=event.target.closest('[data-corner-target]'),b=event.target.closest('[data-bookmark-action]');if(!b&&!target)return;const ctx=source,gid=target?.dataset.cornerTarget;closeMenu();if(b?.dataset.bookmarkAction==='open'){run('open',ctx);return}authorize(ctx,()=>target?addToCorner(ctx,gid):run(b.dataset.bookmarkAction,ctx))};
     menu.onkeydown=event=>{const corner=menu.querySelector('[data-bookmark-action=corner]'),sub=event.target.closest('.bookmark-corner-targets');if(event.key==='ArrowRight'&&event.target===corner){event.preventDefault();showCornerTargets(corner,true);return}if(event.key==='ArrowLeft'&&sub){event.preventDefault();hideCornerTargets();corner.focus();return}const buttons=[...(sub||menu).querySelectorAll(sub?'button':':scope>[data-bookmark-action]')],at=buttons.indexOf(document.activeElement);if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(at+(event.key==='ArrowUp'?-1:1)+buttons.length)%buttons.length].focus()}};
   }
   menu.innerHTML=[['open','打开网址'],['edit','修改编辑'],['corner','添加到我的一隅'],['move','移动至...'],['batch','批量移动网址'],...(ctx.atlas?[['batch-edit','批量修改网址']]:[]),['delete','删除']].map(([key,label])=>'<button type="button" role="menuitem" data-bookmark-action="'+key+'">'+(icons[key]||icons.edit)+'<span>'+label+'</span></button>').join('');
   const corner=menu.querySelector('[data-bookmark-action=corner]');corner.setAttribute('aria-haspopup','menu');corner.setAttribute('aria-controls','bookmark-corner-targets');corner.setAttribute('aria-expanded','false');corner.insertAdjacentHTML('beforeend','<i class="bookmark-submenu-arrow" aria-hidden="true">›</i>');corner.onpointerenter=()=>showCornerTargets(corner);
   for(const b of menu.querySelectorAll('[data-bookmark-action]:not([data-bookmark-action=corner])')){b.onpointerenter=hideCornerTargets;b.onfocus=hideCornerTargets}
   menu.hidden=false;menu.showPopover();button.setAttribute('aria-expanded','true');
   const r=button.getBoundingClientRect(),m=menu.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(r.right-m.width,innerWidth-m.width-8))+'px';menu.style.top=(r.bottom+6+m.height<=innerHeight-8?r.bottom+6:Math.max(8,r.top-m.height-6))+'px';
   if(keyboard)menu.querySelector('button').focus();
 }
 function attachMenus(){
   document.querySelectorAll('.workspace .bookmark [data-bookmark-edit]').forEach(b=>{
     const ctx={...context(),item:currentGroup().items[Number(b.dataset.bookmarkEdit)]};if(!ctx.item)return;
     b.removeAttribute('data-bookmark-edit');b.dataset.bookmarkMenu='';b.innerHTML=icons.more;b.title='网址操作';b.setAttribute('aria-label','管理 '+ctx.item[0]);b.setAttribute('aria-haspopup','menu');b.setAttribute('aria-controls','bookmark-action-menu');b.setAttribute('aria-expanded','false');
     b.onpointerenter=()=>openMenu(b,ctx);b.onpointerleave=deferClose;b.onclick=event=>{event.preventDefault();event.stopPropagation();openMenu(b,ctx,event.detail===0)};
     b.onkeydown=event=>{if(event.key==='ArrowDown'){event.preventDefault();openMenu(b,ctx,true)}};
   });
 }
 window.ShiyuBookmarkActions=Object.freeze({attach(button,ctx){
   button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-controls','bookmark-action-menu');button.setAttribute('aria-expanded','false');
   button.onpointerenter=()=>openMenu(button,ctx);button.onpointerleave=deferClose;
   button.onclick=event=>{event.preventDefault();event.stopPropagation();openMenu(button,ctx,event.detail===0)};
   button.onkeydown=event=>{if(event.key==='ArrowDown'){event.preventDefault();event.stopPropagation();openMenu(button,ctx,true)}};
 },open:openMenu,close:closeMenu});
 const previousGroups=renderGroups;renderGroups=function(...args){closeMenu();const result=previousGroups(...args);attachMenus();return result};
 function createDialog(id,title){let d=document.getElementById(id);if(!d){d=document.createElement('dialog');d.id=id;d.className='bookmark-action-dialog';document.body.append(d)}d.innerHTML='<div class="dialog-heading"><h2>'+esc(title)+'</h2><button data-action="close" aria-label="关闭">×</button></div>';return d}
 function refresh(){persist();render()}
 function deleteDialog(ctx){
   const d=createDialog('bookmark-delete-dialog','删除网址');d.insertAdjacentHTML('beforeend','<p>确认删除「'+esc(ctx.item[0])+'」？</p><div class="bookmark-dialog-footer"><button data-action="close">取消</button><button class="primary" data-confirm-delete>确认删除</button></div>');
   d.querySelector('[data-confirm-delete]').onclick=()=>authorize(ctx,()=>{ctx.g.items.splice(ctx.g.items.indexOf(ctx.item),1);d.close();document.querySelector('#bookmark-editor[open]')?.close();refresh();toast('已删除网址')});d.showModal();
 }
 function addToCorner(ctx,gid){window.ShiyuCorner.addBookmark({sid:ctx.s.id,cid:ctx.c.id,gid:ctx.g.id,url:ctx.item[1]},gid)}
 function run(action,ctx){
   if(action==='open'){if(!valid(ctx)){toast('这个网址已被移动或删除，请重新选择');return}let url;try{url=new URL(ctx.item[1])}catch{}if(!url||!['http:','https:'].includes(url.protocol)){toast('这个网址地址无效，请先编辑');return}window.open(url.href,'_blank','noopener,noreferrer');return}
   if(action==='edit'){spaceId=ctx.s.id;sceneId=ctx.c.id;activeGroups[sceneId]=ctx.g.id;editBookmark(ctx.g.items.indexOf(ctx.item));return}
   if(action==='corner'){addToCorner(ctx);return}
   if(action==='delete'){deleteDialog(ctx);return}
   if(action==='batch-edit'){batchEditDialog(ctx);return}
   moveDialog(ctx,action==='batch');
 }
 function selectionStep(d,items,selected,onNext){
   const panel=document.createElement('section');panel.className='bookmark-selection-step';
   panel.innerHTML='<div class="bookmark-batch-list"></div><div class="bookmark-selection-footer"><button type="button" data-select-page aria-pressed="false">全选本页</button><span data-page-count></span><span data-selection-count aria-live="polite"></span><div class="bookmark-batch-pagination"><button type="button" data-page-prev aria-label="上一页">‹</button><span data-page-number></span><button type="button" data-page-next aria-label="下一页">›</button></div><button type="button" class="primary" data-batch-next>下一步</button></div>';
   d.querySelector('.dialog-heading').after(panel);let page=0,pages=1;const pageSize=50;
   function update(){
     const current=items.slice(page*pageSize,(page+1)*pageSize);
     const button=panel.querySelector('[data-select-page]'),count=current.filter(x=>selected.has(x)).length;button.setAttribute('aria-pressed',count===current.length&&count>0?'true':count>0?'mixed':'false');button.disabled=!current.length;
     panel.querySelector('[data-selection-count]').textContent='已选 '+selected.size+' 条';
     panel.querySelector('[data-batch-next]').disabled=!selected.size;
   }
   function listing(){
     pages=Math.max(1,Math.ceil(items.length/pageSize));page=Math.min(page,pages-1);
     panel.querySelector('.bookmark-batch-list').innerHTML=items.slice(page*pageSize,(page+1)*pageSize).map((item,i)=>'<label><input type="checkbox" value="'+(page*pageSize+i)+'" '+(selected.has(item)?'checked':'')+'><span><b>'+esc(item[0])+'</b><small>'+esc(item[1])+'</small></span></label>').join('')||'<p>当前分组暂无网址</p>';
     panel.querySelector('.bookmark-batch-list').scrollTop=0;
     panel.querySelector('[data-page-count]').textContent='共 '+items.length+' 条 · '+pages+' 页';panel.querySelector('[data-page-number]').textContent=(page+1)+' / '+pages;
     panel.querySelector('[data-page-prev]').disabled=page===0;panel.querySelector('[data-page-next]').disabled=page===pages-1;update();
   }
   panel.querySelector('.bookmark-batch-list').onchange=e=>{const item=items[Number(e.target.value)];if(!item)return;e.target.checked?selected.add(item):selected.delete(item);update()};
   panel.querySelector('[data-select-page]').onclick=()=>{const current=items.slice(page*pageSize,(page+1)*pageSize),all=current.every(item=>selected.has(item)),scroll=panel.querySelector('.bookmark-batch-list').scrollTop;for(const item of current)all?selected.delete(item):selected.add(item);listing();panel.querySelector('.bookmark-batch-list').scrollTop=scroll};
   panel.querySelector('[data-page-prev]').onclick=()=>{page--;listing()};panel.querySelector('[data-page-next]').onclick=()=>{page++;listing()};
   panel.querySelector('[data-batch-next]').onclick=()=>{if(selected.size)onNext()};panel.refreshItems=()=>{page=0;listing()};listing();return panel;
 }
 function batchEditDialog(ctx){
   const d=createDialog('bookmark-batch-edit-dialog','第一步 · 选择网址'),items=[...ctx.g.items],selected=new Set([ctx.item]),drafts=new Map();d.classList.add('is-batch');
   const form=document.createElement('form');form.hidden=true;form.innerHTML='<div class="bookmark-batch-edit-list"></div><p class="edit-error" role="alert"></p><div class="bookmark-dialog-footer"><button type="button" data-batch-back>上一步</button><button type="submit" class="primary">保存修改</button></div>';d.append(form);
   const panel=selectionStep(d,items,selected,()=>{
     panel.hidden=true;form.hidden=false;d.querySelector('h2').textContent='第二步 · 修改网址';
     form.querySelector('.bookmark-batch-edit-list').innerHTML=items.filter(x=>selected.has(x)).map(item=>{const i=items.indexOf(item),draft=drafts.get(item)||item;return '<fieldset data-edit-item="'+i+'"><legend>'+esc(item[0])+'</legend><label>名称<input name="name-'+i+'" data-field="0" required value="'+esc(draft[0])+'"></label><label>链接<input name="url-'+i+'" data-field="1" type="url" required value="'+esc(draft[1])+'"></label><label>描述<input name="description-'+i+'" data-field="2" value="'+esc(draft[2]||'')+'"></label></fieldset>'}).join('');
     form.querySelector('input')?.focus();
   });
   form.oninput=e=>{const row=e.target.closest('[data-edit-item]');if(!row||!e.target.hasAttribute('data-field'))return;const item=items[Number(row.dataset.editItem)],draft=drafts.get(item)||[...item];draft[Number(e.target.dataset.field)]=e.target.value;drafts.set(item,draft)};
   form.querySelector('[data-batch-back]').onclick=()=>{form.hidden=true;panel.hidden=false;d.querySelector('h2').textContent='第一步 · 选择网址';panel.querySelector('[data-batch-next]').focus()};
   form.onsubmit=e=>{e.preventDefault();authorize(ctx,()=>{
     const chosen=items.filter(x=>selected.has(x)),error=form.querySelector('.edit-error');
     if(chosen.some(x=>!ctx.g.items.includes(x))){error.textContent='网址已发生变化，请关闭后重新选择。';return}
     const changes=chosen.map(item=>({item,draft:(drafts.get(item)||item).slice(0,3).map(x=>(x||'').trim())}));
     if(changes.some(({draft})=>{try{return !draft[0]||!['http:','https:'].includes(new URL(draft[1]).protocol)}catch{return true}})){error.textContent='请填写名称和有效的 HTTP / HTTPS 网址。';return}
     const changedURLs=new Map(changes.map(({item,draft})=>[item[1],draft[1]]));
     for(const library of Object.values(prefs.cornerCollections||{}))for(const group of library.groups||[])for(const ref of group.refs||[])if(ref.gid===ctx.g.id&&changedURLs.has(ref.url))ref.url=changedURLs.get(ref.url);
     for(const {item,draft} of changes)item.splice(0,3,...draft);
     d.close();refresh();toast('已修改 '+chosen.length+' 个网址');
   })};d.showModal();
 }
 function moveDialog(ctx,batch){
   const d=createDialog('bookmark-move-dialog',batch?'批量移动网址':'移动位置'),items=[...ctx.g.items],selected=new Set([ctx.item]);let target={...ctx};d.classList.toggle('is-batch',batch);
   d.insertAdjacentHTML('beforeend',(batch?'':'<div class="bookmark-moving-card"><i>'+bookmarkMark(ctx.item)+'</i><span><b>'+esc(ctx.item[0])+'</b><small>'+esc(ctx.item[1])+'</small></span></div>')+'<form><div class="destination-cascade bookmark-move-cascade"><label>空间<select name="space" aria-label="目标空间"></select></label><label>场景<select name="scene" aria-label="目标场景"></select></label><label>分组<select name="group" aria-label="目标分组"></select></label></div><label class="bookmark-move-position">放置位置<select name="position" aria-label="放置位置"></select></label><p class="edit-error" role="alert"></p><div class="bookmark-dialog-footer">'+(batch?'<button type="button" data-batch-back>上一步</button>':'<button type="button" data-action="close">取消</button>')+'<button type="submit" class="primary">确认移动</button></div></form>');
   const form=d.querySelector('form'),select=name=>form.elements.namedItem(name),options=(list,current)=>list.map(x=>'<option value="'+esc(x.id)+'" '+(x===current?'selected':'')+'>'+esc(x.name)+'</option>').join('');
   function positions(){select('position').innerHTML='<option value="end">末尾</option><option value="start">最前面</option>';form.querySelector('[type=submit]').disabled=!selected.size||!target.g;enhanceControls()}
   function destinations(level){
     if(level==='space'){select('space').innerHTML=options(data,target.s);select('scene').innerHTML=options(target.s.scenes,target.c)}
     if(level==='scene')select('scene').innerHTML=options(target.s.scenes,target.c);
     select('group').innerHTML=options(target.c?.groups||[],target.g);positions();
   }
   select('space').onchange=()=>{target.s=data.find(s=>s.id===select('space').value);target.c=target.s.scenes[0];target.g=target.c?.groups[0];destinations('scene')};
   select('scene').onchange=()=>{target.c=target.s.scenes.find(c=>c.id===select('scene').value);target.g=target.c?.groups[0];destinations('group')};
   select('group').onchange=()=>{target.g=target.c.groups.find(g=>g.id===select('group').value);positions()};
   destinations('space');
   if(batch){
     const heading=d.querySelector('h2'),panel=selectionStep(d,items,selected,()=>{panel.hidden=true;form.hidden=false;heading.textContent='第二步 · 选择目标位置';positions();form.querySelector('select').focus()});
     const filters=document.createElement('div');filters.className='destination-cascade bookmark-source-cascade';filters.innerHTML='<label>空间<select data-source-space aria-label="筛选空间"></select></label><label>场景<select data-source-scene aria-label="筛选场景"></select></label><label>分组<select data-source-group aria-label="筛选分组"></select></label>';panel.prepend(filters);
     const source={...ctx},sourceSelect=name=>filters.querySelector('[data-source-'+name+']');
     function sourceOptions(){sourceSelect('space').innerHTML=options(data,source.s);sourceSelect('scene').innerHTML=options(source.s.scenes,source.c);sourceSelect('group').innerHTML=options(source.c?.groups||[],source.g);enhanceControls();}
     function sourceChanged(){ctx={...source,item:source.g?.items[0]};items.splice(0,items.length,...(source.g?.items||[]));selected.clear();panel.refreshItems();sourceOptions();}
     sourceSelect('space').onchange=()=>{source.s=data.find(s=>s.id===sourceSelect('space').value);source.c=source.s.scenes[0];source.g=source.c?.groups[0];sourceChanged()};
     sourceSelect('scene').onchange=()=>{source.c=source.s.scenes.find(c=>c.id===sourceSelect('scene').value);source.g=source.c?.groups[0];sourceChanged()};
     sourceSelect('group').onchange=()=>{source.g=source.c.groups.find(g=>g.id===sourceSelect('group').value);sourceChanged()};sourceOptions();
     form.hidden=true;heading.textContent='第一步 · 选择网址';
     form.querySelector('[data-batch-back]').onclick=()=>{form.hidden=true;panel.hidden=false;heading.textContent='第一步 · 选择网址';panel.querySelector('[data-batch-next]').focus()};
   }
   form.onsubmit=event=>{event.preventDefault();authorize(ctx,()=>{
     const moving=items.filter(x=>selected.has(x));if(!moving.length||!target.g)return;
     if(!contexts().some(x=>x.g===target.g)||moving.some(x=>!ctx.g.items.includes(x))){form.querySelector('.edit-error').textContent='网址或分组已发生变化，请关闭后重新选择。';return}
     const rest=target.g.items.filter(x=>!selected.has(x)),position=select('position').value,at=position==='end'?rest.length:position==='start'?0:Number(position);
     ctx.g.items=ctx.g.items.filter(x=>!selected.has(x));rest.splice(at,0,...moving);target.g.items=rest;
     if(target.g!==ctx.g)for(const library of Object.values(prefs.cornerCollections||{}))for(const group of library.groups||[])for(const ref of group.refs||[])if(ref.gid===ctx.g.id&&moving.some(x=>x[1]===ref.url)){ref.sid=target.s.id;ref.cid=target.c.id;ref.gid=target.g.id}
     d.close();refresh();toast('已移动 '+moving.length+' 个网址');
   })};d.showModal();
 }
 const previousEdit=editBookmark;editBookmark=function(index){const ctx={...context(),item:currentGroup().items[index]};previousEdit(index);const form=document.querySelector('#bookmark-editor-form');if(!form||!ctx.item)return;const button=document.createElement('button');button.type='button';button.className='bookmark-editor-delete';button.textContent='删除网址';button.onclick=()=>deleteDialog(ctx);const footer=document.createElement('div');footer.className='bookmark-editor-footer';footer.append(button,form.querySelector('[type=submit]'));form.append(footer)};
 document.addEventListener('pointerdown',event=>{if(menu&&!menu.hidden&&!menu.contains(event.target)&&!anchor?.contains(event.target))closeMenu()},true);
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu&&!menu.hidden){event.preventDefault();event.stopImmediatePropagation();closeMenu(true)}},true);
 addEventListener('resize',()=>closeMenu());addEventListener('scroll',event=>{if(!menu?.contains(event.target))closeMenu()},true);
 if(view==='space')attachMenus();
})();
