const fs=require('fs'),f='dist/corner.js';let s=fs.readFileSync(f,'utf8');
const soundA=s.indexOf('  function playCardSound(){'),soundB=s.indexOf('  const libraryIcons=',soundA);
s=s.slice(0,soundA)+`  function playCardSound(){
    prepareCardAudio();if(!cardAudio||cardAudio.state!=='running')return;
    const ctx=cardAudio,t=ctx.currentTime;
    // A dry ratchet click: a short tooth impact plus a very light paper-like tail.
    const hit=ctx.createOscillator(),envelope=ctx.createGain();hit.type='triangle';hit.frequency.setValueAtTime(1450,t);hit.frequency.exponentialRampToValueAtTime(420,t+.025);envelope.gain.setValueAtTime(.001,t);envelope.gain.linearRampToValueAtTime(.055,t+.002);envelope.gain.exponentialRampToValueAtTime(.001,t+.045);hit.connect(envelope).connect(ctx.destination);hit.start(t);hit.stop(t+.05);hit.onended=()=>{hit.disconnect();envelope.disconnect();};
    if(!cardNoise){cardNoise=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.045),ctx.sampleRate);const samples=cardNoise.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;}
    const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=cardNoise;filter.type='highpass';filter.frequency.value=1800;gain.gain.setValueAtTime(.018,t);gain.gain.exponentialRampToValueAtTime(.001,t+.035);source.connect(filter).connect(gain).connect(ctx.destination);source.start(t);source.stop(t+.045);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
  }
`+s.slice(soundB);
const maps={base:'House Coffee Heart Leaf Sun BookOpen Briefcase Star Compass Mountain Flower Camera Bike Globe Music Lightbulb Folder Pen Map TrainFront',music:'Disc Disc3 Music Headphones Mic Radio Guitar Piano Drum Speaker Volume2 Play Film BookOpen Coffee Heart Star Camera Tv Clapperboard',reading:'BookOpen Book Library BookMarked Bookmark NotebookPen ScrollText Pen Pencil GraduationCap Languages School Lamp Coffee Leaf Flower Globe Newspaper Lightbulb Archive',flow:'Waves Droplets Wind Shapes Circle Triangle Hexagon Pentagon Square Component Spline Layers Atom Magnet Snowflake CloudSnow Rainbow Star Leaf Fish',poly:'Triangle Hexagon Pentagon Square Circle Shapes Component Layers Gem Spline Ruler PenTool Palette Brush Pipette Mountain Building2 Rocket Diamond Target',cosmos:'Globe Star Moon Sun Telescope Rocket Atom Compass Navigation Cloud Sunrise Sunset Mountain Waves Magnet FlaskConical Lightbulb Plane Map Orbit',flip:'AlarmClock Calendar Notebook Clipboard Pen Hourglass Sunrise Sunset Sun Moon Archive BookMarked History Files Stamp Calculator Target Activity Coffee Briefcase',rain:'CloudRain Droplets Umbrella Cloud CloudLightning Wind Waves Rainbow CloudSnow Snowflake Leaf Flower Sprout TreePine Coffee BookOpen Lamp Moon Sun Fish',projection:'Presentation Monitor Video Film Camera Tv Play Lightbulb Sun Moon Star Palette Layers Shapes Spline Circle Triangle Music Speaker BookOpen',cinema:'Clapperboard Film Video Camera Tv Play Popcorn Disc Mic Speaker Music Headphones Star Heart BookOpen Ticket Wine Coffee Plane Globe',paper:'Newspaper FileText Files Pen Pencil NotebookPen BookOpen BookMarked ScrollText Stamp Archive Clipboard Calendar Printer Scan Languages Globe Coffee Camera Bookmark'};
// All theme sets use the existing SVG library; replace unavailable specialist names.
for(const k in maps)maps[k]=maps[k].replace('Diamond','Flag').replace('Orbit','Circle').replace('Hourglass','AlarmClock').replace('History','NotebookPen').replace('Ticket','Award');
const names={House:'居所',Coffee:'咖啡',Heart:'心意',Leaf:'绿叶',Sun:'日光',BookOpen:'阅读',Briefcase:'工作',Star:'星辰',Compass:'指南',Mountain:'山川',Flower:'花朵',Camera:'影像',Bike:'骑行',Globe:'世界',Music:'旋律',Lightbulb:'灵感',Folder:'文件',Pen:'钢笔',Map:'地图',TrainFront:'列车',Disc:'唱片',Disc3:'光碟',Headphones:'耳机',Mic:'麦克风',Radio:'电台',Guitar:'吉他',Piano:'钢琴',Drum:'鼓点',Speaker:'音箱',Volume2:'音量',Play:'播放',Film:'胶片',Tv:'银幕',Clapperboard:'场记',Book:'书本',Library:'书库',BookMarked:'书签册',Bookmark:'书签',NotebookPen:'手记',ScrollText:'书卷',Pencil:'铅笔',GraduationCap:'学业',Languages:'语言',School:'校园',Lamp:'台灯',Newspaper:'报刊',Archive:'归档',Waves:'水波',Droplets:'水滴',Wind:'微风',Shapes:'形态',Circle:'圆形',Triangle:'三角',Hexagon:'六边形',Pentagon:'五边形',Square:'方形',Component:'构件',Spline:'曲线',Layers:'层叠',Atom:'原子',Magnet:'磁场',Snowflake:'雪花',CloudSnow:'落雪',Rainbow:'彩虹',Fish:'游鱼',Gem:'晶石',Ruler:'尺度',PenTool:'钢笔工具',Palette:'调色',Brush:'画刷',Pipette:'取色',Building2:'建筑',Rocket:'火箭',Flag:'旗帜',Target:'目标',Moon:'月亮',Telescope:'望远镜',Navigation:'航向',Cloud:'云朵',Sunrise:'日出',Sunset:'日落',FlaskConical:'实验',Plane:'飞机',AlarmClock:'时钟',Calendar:'日历',Notebook:'笔记',Clipboard:'记录',Files:'文档集',Stamp:'印章',Calculator:'计算',Activity:'脉动',CloudRain:'落雨',Umbrella:'雨伞',CloudLightning:'雷雨',Sprout:'萌芽',TreePine:'松树',Presentation:'投影',Monitor:'显示器',Video:'视频',Popcorn:'爆米花',Award:'奖章',Wine:'红酒',FileText:'文稿',Printer:'打印',Scan:'扫描'};
// flip must also have twenty different choices.
maps.flip=maps.flip.replace('AlarmClock Calendar Notebook Clipboard Pen AlarmClock','AlarmClock Calendar Notebook Clipboard Pen Book');
const code=`  const themeIconSets=${JSON.stringify(maps)};
  const themeIconNames=${JSON.stringify(names)};
  const followsTheme=g=>g.iconMode==='theme'||(!g.iconMode&&!g.icon&&!Object.hasOwn(g,'art'));
  function themeChoices(){const key=effective().theme;return (themeIconSets[key]||themeIconSets.base).split(' ').map(id=>({id:'lib-'+id,name:themeIconNames[id]||id}));}
  function themeIconId(g){const choices=themeChoices(),slot=Number.isInteger(g.iconSlot)?g.iconSlot:Math.max(0,collection().groups.findIndex(x=>x.id===g.id));return choices[slot%choices.length].id;}
  const cardIcon=g=>followsTheme(g)?entityIcon(themeIconId(g)):g.icon&&ENTITY_ICONS[g.icon]?entityIcon(g.icon):glyph(drawings[(g.art||0)%drawings.length]);
`;
s=s.replace(/  const cardIcon=g=>[^\n]+\n/,code);
s=s.replace("name:names[i],art:i,refs:[]","name:names[i],iconMode:'theme',iconSlot:i,refs:[]");s=s.replace("name:'新卡片',art:groups.length%drawings.length,refs:[]","name:'新卡片',iconMode:'theme',iconSlot:groups.length%20,refs:[]");
const a=s.indexOf('    const legacy=drawings.map',s.indexOf('  function backCard')),b=s.indexOf('    const colors=',a);
s=s.slice(0,a)+`    const choices=themeChoices();if(!followsTheme(g)&&g.icon&&!choices.some(x=>x.id===g.icon))choices.push({id:g.icon,name:'当前图标'});
    const legacy='';
    const icons='<button class="corner-follow-icon" data-corner-follow-icon aria-pressed="'+followsTheme(g)+'">跟随主题</button>'+choices.map(x=>'<button data-corner-icon="'+x.id+'" title="'+x.name+'" aria-label="'+x.name+'图标" aria-pressed="'+(!followsTheme(g)&&g.icon===x.id)+'">'+entityIcon(x.id)+'</button>').join('');
`+s.slice(b);
s=s.replace("if(b?.hasAttribute('data-corner-art')||b?.dataset.cornerIcon){if(b.dataset.cornerIcon)g.icon=b.dataset.cornerIcon;","if(b?.hasAttribute('data-corner-follow-icon')||b?.hasAttribute('data-corner-art')||b?.dataset.cornerIcon){g.iconMode=b.hasAttribute('data-corner-follow-icon')?'theme':'manual';if(g.iconMode==='theme'){g.iconSlot??=Math.max(0,collection().groups.indexOf(g))%20;}else if(b.dataset.cornerIcon)g.icon=b.dataset.cornerIcon;");
s=s.replace("el.querySelectorAll('[data-corner-art],[data-corner-icon]')","el.querySelectorAll('[data-corner-art],[data-corner-icon],[data-corner-follow-icon]')");
s=s.replace("const flipped=new Set();","const flipped=new Set(),flipTimers=new WeakMap();");
s=s.replace("syncFaces(el);applyCardColor(el,groups.find", "syncFaces(el);el.classList.add('is-settled');applyCardColor(el,groups.find");
const flipA=s.indexOf('  function flipCard(id,back){'),flipB=s.indexOf('  function onPanelClick',flipA);
s=s.slice( flipA?0:0,flipA)+`  function flipCard(id,back){
    if(back&&flipped.size&&!flipped.has(id))return;
    if(back)activeId=id;flipped.clear();if(back)flipped.add(id);
    for(const el of panel.querySelectorAll('[data-corner-card]')){
      el.querySelector('.corner-delete-confirm').hidden=true;
      const next=flipped.has(el.dataset.cornerCard),changed=el.classList.contains('is-flipped')!==next;
      if(changed){clearTimeout(flipTimers.get(el));el.classList.remove('is-settled');void el.offsetWidth;el.classList.toggle('is-flipped',next);if(reduced())el.classList.add('is-settled');else flipTimers.set(el,setTimeout(()=>el.classList.add('is-settled'),850));}
      syncFaces(el);
    }
    resetFloat();layoutFan();const el=panel.querySelector('[data-corner-card="'+id+'"]');(back?el?.querySelector('[data-corner-done]'):el?.querySelector('.corner-card-front'))?.focus({preventScroll:true});
  }
`+s.slice(flipB);
s=s.replace("(edge?16+(distance-half)*12:distance*5)","(edge?16+(distance-half)*12:distance*distance*9)");
s=s.replace("(edge?Math.sign(delta)*Math.min(12,(distance-half)*4):0)","(flipped.has(el.dataset.cornerCard)?0:Math.sign(delta)*(edge?Math.min(12,half*1.4+(distance-half)*3):distance*1.4))");
// No rasterizing pointer tilt: gentle floating and the fan rotation provide depth.
s=s.replace("      panel.addEventListener('pointermove',floatCards);\n",'');const fa=s.indexOf('  function floatCards('),fb=s.indexOf('  function resetFloat',fa);s=s.slice(0,fa)+s.slice(fb);
fs.writeFileSync(f,s);
