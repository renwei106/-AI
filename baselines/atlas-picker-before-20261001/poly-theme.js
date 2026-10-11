/* 棱光拾景: an additive home theme; existing navigation and bookmark actions stay shared. */
(() => {
  'use strict';
  const PRESETS=[['mountain','山岚','把远山，收进日常','01'],['ocean','潮汐','心里有一片海','02'],['dunes','沙丘','风走过，留下形状','03'],['fox','狐影','与一份灵动相遇','04'],['deer','林鹿','在安静里，遇见自然','05'],['portrait','侧影','每个人，都有自己的棱角','06']];
  const gem='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="m4 8 5-5h6l5 5-8 13L4 8Z M4 8h16M9 3 8 8l4 13 4-13-1-5"/></svg>';
  // Register a selectable bookmark style in the existing scope / persistence flow.
  LINK_VIEWS.poly=['棱光拾景',3,6];
  const linkModeBefore=linkMode;
  linkMode=function(id){return id==='follow'&&effective().theme==='poly'?'poly':linkModeBefore(id);};
  const linkSettingsBefore=openLinkSettings;
  openLinkSettings=function(){
    linkSettingsBefore();
    const panel=$('#link-view-settings'),choice=panel?.querySelector('[data-link-view=poly]'),main=panel?.querySelector('.style-scroll-body>.link-view-grid');
    if(!choice||!main)return;
    // Theme companions belong beside cards, not among the member-only extra styles.
    choice.innerHTML=`<span>${gem}</span>棱光拾景`;
    choice.title='三角切面的轻量卡片，保留网址图标与名称';
    const cards=main.querySelector('[data-link-view=cards]');
    if(cards)cards.after(choice);else main.append(choice);
  };
  const svgCache=new Map(); let shapeId=0, custom=null, loadDone=false, menu, upload, job=0, worker=null, rejectWorker=null, busy=false;
  const options=()=>({preset:'mountain',detail:'balanced',tone:'original',...(prefs.polyScene||{})});
  COPY_DEFAULTS.poly={title:'把喜欢，拾成风景',intro:'一片山海，一点灵感。让日常有自己的形状。'};
  function faceted(points,palette,seed,density=50) {
    density*=({simple:3,balanced:6,fine:10})[options().detail]||6;
    const rng=ShiyuPolyEngine.random(seed), xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
    const dots=points.slice();for(let i=0;i<density;i++)dots.push([x0+rng()*(x1-x0),y0+rng()*(y1-y0)]);
    const indices=Delaunator.from(dots).triangles,id='poly-facet-'+(++shapeId);let result=`<defs><clipPath id="${id}"><polygon points="${points.map(p=>p.join(',')).join(' ')}"/></clipPath></defs><g clip-path="url(#${id})" stroke-linejoin="round" stroke-width=".8">`;
    for(let i=0;i<indices.length;i+=3){const p=[dots[indices[i]],dots[indices[i+1]],dots[indices[i+2]]];const y=p.reduce((s,a)=>s+a[1],0)/3;const c=palette[Math.min(palette.length-1,Math.floor(((y-y0)/(y1-y0)*.6+rng()*.4)*palette.length))];result+=`<polygon points="${p.map(a=>a.map(v=>v.toFixed(1)).join(',')).join(' ')}" fill="${c}" stroke="${c}"/>`;}
    return result+'</g>';
  }
  function subjectArtwork(id='mountain') {
    const key=`subject:${id}:${options().detail}`;
    if(svgCache.has(key))return svgCache.get(key);
    let art='';const shape=(p,c,s,n)=>faceted(p,c,s,n);
    if(id==='mountain') {
      art='<circle cx="738" cy="174" r="62" fill="#d5b77f" opacity=".64"/>';
      art+=shape([[40,505],[216,310],[319,388],[470,155],[664,383],[751,276],[974,498],[883,656],[616,701],[269,678],[91,619]],['#dce5df','#c7d8d0','#a7c2b8','#87a99b','#779b90'],13,63);
      art+=shape([[207,483],[470,155],[411,348],[514,427],[596,424],[483,612],[182,614]],['#f2f1e7','#e0e7dd','#b8cdbf','#8db19c','#719e8d'],37,33);
      art+=shape([[401,660],[591,352],[677,431],[719,394],[880,589],[807,649],[619,702]],['#8bbaac','#78aa9c','#588e7f','#457969','#37695e'],48,31);
      art+=shape([[53,533],[208,456],[353,568],[438,670],[245,677],[81,615]],['#9fbcad','#80a594','#739787','#5e8779'],94,20);
      art+='<path d="m471 155-46 66 16-4 13 26 19-30 27 5Z" fill="#f2f3e9"/><path d="m710 580 28 60 58 14-43 21 29 4 25-30-44-31-20-47Z" fill="#c6ded5" opacity=".66"/>';
    } else if(id==='ocean') {
      art='<circle cx="712" cy="183" r="70" fill="#e4c9a3"/>';
      art+=shape([[75,327],[502,328],[950,340],[941,579],[748,676],[301,691],[65,568]],['#b9d9da','#8bbdbf','#6da3af','#4f8b9d','#326d85'],6,100);
      art+=shape([[45,501],[266,530],[535,562],[745,539],[951,573],[748,676],[301,691],[65,568]],['#e4dec6','#d7d4ba','#b5c7b8','#a5b9a9'],26,30);
      art+='<path d="m73 497 195 25 274 34 202-23 200 32-201-24-208 32-274-39-195-27Z" fill="#f0f0dc"/><path d="m739 291 0-121 68 121Z" fill="#f2eee0"/><path d="m733 291 0-89-54 89Z" fill="#d4dfd9"/><path d="m680 300 131 0-20 21-88 0Z" fill="#526d70"/>';
    } else if(id==='dunes') {
      art='<circle cx="727" cy="171" r="76" fill="#d4a36f" opacity=".64"/>';
      art+=shape([[51,418],[279,322],[406,346],[710,283],[953,374],[974,548],[849,670],[256,691],[55,594]],['#e0c4a0','#dfb68b','#cda377','#b28b67'],8,45);
      art+=shape([[55,594],[279,322],[347,489],[592,553],[850,670],[256,691]],['#e9d0a6','#dbb17f','#cf9d6b','#b5875e'],26,32);
      art+=shape([[347,489],[710,283],[662,451],[792,535],[974,548],[849,670],[592,553]],['#dfb88d','#c4946b','#bb845e','#a77959'],61,32);
    } else if(id==='fox') {
      art='<circle cx="508" cy="404" r="290" fill="#d5b992" opacity=".15"/>';
      art+=shape([[366,411],[561,402],[661,521],[706,611],[825,584],[896,465],[916,566],[859,648],[671,696],[416,650],[313,550]],['#daba8e','#c18d5e','#bb7d51','#965c40'],40,40);
      art+=shape([[243,139],[411,255],[563,217],[727,101],[723,335],[645,460],[478,534],[331,448],[241,313]],['#edcf98','#dfaa6b','#d49754','#bb7946','#a6653e'],31,70);
      art+=shape([[267,183],[366,271],[272,287]],['#584c46','#8c6555','#b57b5c'],66,4);
      art+=shape([[684,148],[607,254],[697,289]],['#584c46','#8c6555','#b57b5c'],67,4);
      art+=shape([[278,327],[414,343],[478,493],[354,433]],['#f0e5cf','#e5d4b7','#d4c1a4'],82,9);
      art+=shape([[488,492],[556,326],[694,303],[638,426]],['#f4e6c8','#e6d1ad','#ccb590'],84,9);
      art+='<path d="m348 323 48 17-18 13-31-13Z m220-11 43-21 2 25-35 11Z" fill="#343c37"/><path d="m452 476 49-3-20 27Z" fill="#303b35"/>';
      art+=shape([[825,584],[896,465],[916,566],[859,648],[833,654],[848,605]],['#efe2c7','#ded1b4','#c4b59b'],19,8);
    } else if(id==='deer') {
      art='<circle cx="507" cy="421" r="286" fill="#a3ba9c" opacity=".17"/>';
      art+=shape([[210,438],[387,382],[563,403],[650,340],[650,260],[708,217],[789,260],[756,332],[705,364],[668,508],[583,551],[361,530],[281,574]],['#c4b294','#b89f79','#a08464','#816e52','#6d634e'],3,59);
      art+=shape([[294,525],[340,524],[313,674],[294,684]],['#9b8868','#867559','#6b5e48'],50,6);
      art+=shape([[379,526],[409,528],[430,673],[411,682]],['#9b8868','#867559','#6b5e48'],51,6);
      art+=shape([[574,527],[608,510],[644,662],[623,674]],['#b29773','#947b59','#6b5e48'],52,6);
      art+=shape([[635,498],[664,457],[687,637],[667,657]],['#b29773','#947b59','#6b5e48'],53,6);
      art+='<path d="m699 244-39-56-24-91m28 96 36-53 2-66m-57 65-43-40m97 56 39-31m-9 111 15-62 57-81m-54 84-6-65m17 49 52-11" fill="none" stroke="#8f8267" stroke-width="11" stroke-linecap="round"/><path d="m658 281-46-30-20 8 57 43m81-20 75-2-30 24-39-4" fill="#9c8868"/><path d="m762 289 8-3 5 8-8 3Z" fill="#303d35"/>';
    } else {
      art='<circle cx="553" cy="369" r="285" fill="#c9a69b" opacity=".17"/>';
      art+=shape([[302,703],[309,588],[417,516],[456,459],[596,467],[609,546],[767,612],[795,703]],['#aec2bd','#8eaba4','#719087','#4d756c'],7,36);
      art+=shape([[455,381],[597,375],[592,511],[541,555],[464,514]],['#dac4b2','#c5a78f','#b2947a','#aa8b75'],70,19);
      art+=shape([[354,213],[430,142],[569,149],[659,226],[661,312],[703,358],[659,378],[645,446],[590,483],[482,445],[425,370],[372,339]],['#eedec4','#ddc5a8','#c9ab8d','#b89a7f'],81,59);
      art+=shape([[337,254],[355,159],[435,104],[560,111],[653,162],[684,235],[648,289],[610,241],[537,264],[466,233],[420,309],[389,348],[353,314]],['#727d70','#626e61','#4e5d50','#3c4d43'],88,40);
      art+='<path d="m608 313 29 6-14 7-15-2Z" fill="#536252"/><path d="m642 407 25-7-23-1Z" fill="#9f7a64"/>';
    }
    const result=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 760" role="img" aria-label="${PRESETS.find(p=>p[0]===id)?.[1]||'棱光拾景'}，三角切面插画">${art}</svg>`;
    svgCache.set(key,result);return result;
  }
  function artwork(id='mountain') {
    const opt=options(),dark=document.body.dataset.dark==='true',narrow=innerWidth/innerHeight<.8,key=`wallpaper:${id}:${dark}:${narrow}:${opt.detail}:${opt.tone}:${effective().color}`;
    if(svgCache.has(key))return svgCache.get(key);
    const shape=(p,light,night,seed,n)=>faceted(p,dark?night:light,seed,n);
    const canvas=[[0,0],[1600,0],[1600,1000],[0,1000]];
    let art='';
    if(id==='mountain'){
      art+=shape(canvas,['#e4e5d8','#e0e3d6','#d9dfd2','#d4ddcf'],['#1d2d35','#21323a','#253940','#283e44'],101,20);
      art+=`<circle cx="1095" cy="240" r="82" fill="${dark?'#bdb79b':'#f3edcf'}"/>`;
      art+=shape([[0,495],[142,361],[310,483],[475,325],[703,534],[845,392],[1128,510],[1377,352],[1600,460],[1600,1000],[0,1000]],['#bac9bf','#b1c3b9','#a5bcb0','#99b2a5'],['#425961','#3e565e','#354c56','#304650'],103,42);
      // One dominant summit with two distinct faces and a quiet, broken snowline.
      art+=shape([[0,782],[365,570],[610,398],[832,187],[924,342],[1055,476],[1298,605],[1600,834],[1600,1000],[0,1000]],['#becfc5','#adc7b8','#8baf9e','#6b9483','#587d6f'],['#889f9d','#6f8f90','#50737b','#3c5d69','#304c59'],111,60);
      art+=shape([[832,187],[770,354],[797,438],[713,573],[815,717],[720,1000],[0,1000],[0,782],[365,570],[610,398]],['#e4e6d8','#cddccc','#aec8b6','#8fb29c','#769b85'],['#bdc8bc','#9aacaa','#71918d','#547975','#43645f'],121,40);
      art+=shape([[832,187],[924,342],[1055,476],[1298,605],[1600,834],[1600,1000],[720,1000],[815,717],[713,573],[797,438],[770,354]],['#aec6bc','#8baea2','#6e968a','#4e7b70','#3e625b'],['#7c949b','#5b7b86','#43636f','#304d5e','#263e4f'],125,41);
      art+=shape([[610,398],[832,187],[924,342],[989,412],[911,388],[869,343],[845,397],[802,359],[766,444],[729,414],[702,466],[688,390]],['#f2efdc','#e5e8d7','#d4dfce'],['#d1d5c5','#bdcbbe','#a5bcb4'],130,14);
      art+=shape([[0,617],[153,704],[308,748],[439,861],[693,1000],[0,1000]],['#648c7e','#577f71','#47705f','#375849'],['#304e52','#28434a','#213b41','#193038'],145,26);
      art+=shape([[1600,639],[1470,726],[1291,752],[1122,899],[896,1000],[1600,1000]],['#638b7c','#51796a','#406757','#305340'],['#2e4a51','#264149','#20393f','#193036'],155,25);
    }else if(id==='ocean'){
      art+=shape(canvas,['#e5e6dd','#dde2da','#d6dfd7','#cbdad2'],['#202e3c','#253445','#2c4050','#324b59'],201,21);
      art+=`<circle cx="1050" cy="257" r="85" fill="${dark?'#c1c9c3':'#f5ebcd'}"/>`;
      art+=shape([[0,486],[350,464],[730,479],[1220,460],[1600,478],[1600,1000],[0,1000]],['#9cbdbe','#81aaaf','#66959f','#477d8d','#326276'],['#476771','#3a5969','#304d61','#243e53','#1c3046'],208,85);
      art+=shape([[0,807],[252,836],[525,898],[759,1000],[0,1000]],['#d9d0b5','#c7bea0','#b6ad90','#a1a38c'],['#657374','#526269','#445761','#354a56'],214,18);
      art+=`<path d="M0 793 252 822 525 884 780 1000h-38L514 904 247 844 0 817Z" fill="${dark?'#91aaa9':'#e7e7ce'}" opacity=".7"/>`;
      art+=`<path d="m915 496 0-222 143 222Z" fill="${dark?'#c4d0c6':'#f5eedc'}"/><path d="m900 496 0-167-91 167Z" fill="${dark?'#8baba9':'#d6e0d4'}"/><path d="m816 510 243 0-34 30H850Z" fill="${dark?'#738d8d':'#496d70'}"/><path d="m827 555 189 8-104 72Z" fill="${dark?'#7e9898':'#d0dccc'}" opacity=".18"/>`;
    }else if(id==='dunes'){
      art+=shape(canvas,['#e5d5bb','#e1cfb3','#dac5a5','#d5bd9b'],['#322f38','#3c343e','#493c43','#524148'],301,20);
      art+=`<circle cx="1070" cy="263" r="94" fill="${dark?'#b79378':'#f0dfb4'}"/>`;
      art+=shape([[0,564],[277,424],[551,526],[928,367],[1293,454],[1600,411],[1600,1000],[0,1000]],['#dab68b','#d1a778','#c59b6d','#b68a62'],['#84695f','#795d56','#6d504e','#5f4548'],306,33);
      art+=shape([[0,822],[328,662],[692,444],[847,633],[1120,753],[1600,920],[1600,1000],[0,1000]],['#e8c38c','#dcb079','#c59663','#ad7b51'],['#aa8167','#956c59','#805648','#69453c'],312,43);
      art+=shape([[692,444],[768,631],[669,758],[536,1000],[1600,1000],[1600,920],[1120,753],[847,633]],['#ca9b70','#b2845d','#9e6f4e','#865c42'],['#755448','#66473e','#563b36','#45312f'],316,35);
      art+=shape([[0,884],[161,813],[350,913],[536,1000],[0,1000]],['#c3976a','#a77e58','#8f6647'],['#765648','#5f443c','#49332f'],320,12);
    }else{
      const warm=id==='fox',person=id==='portrait';
      art+=shape(canvas,person?['#c4b5a6','#bba99b','#b09b8d','#a28c7e']:warm?['#dad0bc','#d1c5ad','#c5b89d','#b7aa8c']:['#c7d3c4','#bfcdbb','#b0c0aa','#a3b49e'],person?['#403437','#493b3b','#51403e','#5c4640']:warm?['#293934','#304139','#364a3f','#3a5042']:['#213630','#293e35','#2e4638','#344b3b'],401,30);
      art+=shape([[0,828],[307,723],[680,806],[1050,681],[1600,755],[1600,1000],[0,1000]],person?['#9b867b','#927d72','#846e65']:warm?['#b8aa8c','#ad9f7f','#978e70']:['#8d9f86','#7d9177','#6f8268'],person?['#473938','#3f3232','#382d2d']:['#304537','#2a3e31','#223629'],409,23);
      const subject=subjectArtwork(id).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'').replace(/^<circle[^>]*\/>/,'');
      const transform=narrow?(person?'translate(132,170) scale(1.18)':warm?'translate(393,120) scale(.84)':'translate(450,235) scale(.70)'):(person?'translate(-60,-35) scale(1.55)':warm?'translate(74,0) scale(1.42)':'translate(80,56) scale(1.37)');
      art+=`<g transform="${transform}"${dark?' opacity=".86"':''}>${subject}</g>`;
    }
    if(opt.tone==='theme'){
      const tint=effective().color.match(/[a-f\d]{2}/gi)?.map(v=>parseInt(v,16)/255)||[.39,.55,.51],id='poly-tone-'+(++shapeId);
      art=`<defs><filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".77 0 0 0 ${tint[0]*.23} 0 .77 0 0 ${tint[1]*.23} 0 0 .77 0 ${tint[2]*.23} 0 0 0 1 0"/></filter></defs><g filter="url(#${id})">${art}</g>`;
    }
    const result=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${PRESETS.find(p=>p[0]===id)?.[1]||'棱光拾景'}，全景三角切面壁纸">${art}</svg>`;
    svgCache.set(key,result);return result;
  }
  const artBefore=themeArtwork;themeArtwork=function(id){return id==='poly'?artwork('mountain'):artBefore(id);};
  function paintArt(){
    const opt=options(),preset=PRESETS.find(p=>p[0]===opt.preset)||PRESETS[0],isCustom=opt.preset==='custom'&&custom;
    document.querySelectorAll('[data-poly-art]').forEach(el=>{
      el.innerHTML=isCustom?custom.svg:artwork(preset[0]);
      el.querySelector('svg')?.setAttribute('preserveAspectRatio',isCustom?'xMidYMid slice':'xMidYMin slice');
      el.classList.toggle('poly-custom-art',!!isCustom);el.classList.toggle('poly-loading',opt.preset==='custom'&&!loadDone);
    });
    document.querySelectorAll('[data-poly-caption]').forEach(el=>el.textContent=isCustom?'私藏风景':preset[1]);
  }
  const homeBefore=home;home=function(){
    homeBefore();if(effective().theme!=='poly')return;const root=$('.home-poly');if(!root)return;
    root.insertAdjacentHTML('afterbegin',`<figure class="poly-wallpaper"><div class="poly-art" data-poly-art></div><figcaption><span data-poly-caption></span><div class="poly-tools"><span class="poly-progress" role="status" aria-live="polite"></span><button class="poly-change" data-poly-next aria-label="更换壁纸">${gem}<span>换一幅</span></button><button class="poly-change poly-tool-icon" data-poly-file aria-label="上传本地图片" title="上传本地图片"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 5 9.5 3h5L16 5h4a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/><circle cx="12" cy="12" r="4"/></svg></button><button class="poly-change" data-poly-open popovertarget="poly-effects" aria-expanded="false" aria-controls="poly-effects">${icon('settings')}<span>效果</span></button></div></figcaption></figure>`);
    paintArt();
  };
  const applyBefore=apply;apply=function(){applyBefore();if(view==='home'&&effective().theme==='poly')paintArt();};
  let narrowViewport=innerWidth/innerHeight<.8;
  window.addEventListener('resize',()=>{const narrow=innerWidth/innerHeight<.8;if(narrow===narrowViewport)return;narrowViewport=narrow;if(view==='home'&&effective().theme==='poly')paintArt();});
  // Only the new theme receives the faceted dock symbol; action and accessible label are unchanged.
  const dockBefore=dock;dock=function(){dockBefore();if(dockTheme()!=='poly')return;const trigger=$('.dock-trigger');if(!trigger)return;const label=trigger.querySelector('.dock-label')?.outerHTML||'<span class="dock-label">我的空间</span>';trigger.innerHTML=`<span class="poly-dock-gem">${gem}</span>${label}`;};
  const settingsBefore=renderSettings;renderSettings=function(){settingsBefore();if(effective().theme!=='poly'||settingsTab!=='themes')return;const panel=$('#settings-body .settings-panel');if(panel&&!panel.querySelector('[data-poly-open]'))panel.insertAdjacentHTML('beforeend',`<button class="poly-settings-entry" data-poly-open popovertarget="poly-effects">${gem}<span>棱光拾景 · 画面设置</span><span>↗</span></button>`);};
  const dbPromise=new Promise((resolve,reject)=>{try{const req=indexedDB.open('shiyu-local-art',1);req.onupgradeneeded=()=>req.result.createObjectStore('images');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);}catch(error){reject(error);}});
  function dbAccess(mode,work){return dbPromise.then(db=>new Promise((resolve,reject)=>{const tx=db.transaction('images',mode),req=work(tx.objectStore('images'));tx.oncomplete=()=>resolve(req.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);}));}
  const ready=dbAccess('readonly',s=>s.get('poly-cover')).then(value=>{custom=value||null;}).catch(()=>{}).finally(()=>{loadDone=true;paintArt();});
  function cancelJob(){job++;worker?.terminate();worker=null;rejectWorker?.(new Error('cancelled'));rejectWorker=null;busy=false;}
  function status(message){document.querySelectorAll('.poly-tools .poly-progress').forEach(el=>el.textContent=message);}
  function syncMenu(){
    const opt=options();
    menu?.querySelectorAll('[data-poly-detail],[data-poly-tone]').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.polyDetail?opt.detail===b.dataset.polyDetail:opt.tone===b.dataset.polyTone);b.disabled=busy;});
    const remove=menu?.querySelector('[data-poly-remove]');if(remove)remove.hidden=!custom;
    document.querySelectorAll('[data-poly-open]').forEach(b=>b.setAttribute('aria-expanded',!!menu?.matches(':popover-open')));
  }
  function initEffects(){
    if(!menu){
      menu=document.createElement('div');menu.id='poly-effects';menu.className='poly-effects';menu.setAttribute('popover','auto');menu.setAttribute('aria-label','棱光拾景效果');
      menu.innerHTML=`<div class="poly-effect-group"><span>切面细节</span>${[['simple','简约'],['balanced','均衡'],['fine','精细']].map(([value,label])=>`<button data-poly-detail="${value}" aria-pressed="false">${label}<span aria-hidden="true">✓</span></button>`).join('')}</div><div class="poly-effect-group"><span>画面配色</span>${[['original','接近原图'],['theme','融入主题']].map(([value,label])=>`<button data-poly-tone="${value}" aria-pressed="false">${label}<span aria-hidden="true">✓</span></button>`).join('')}</div><button class="poly-remove" data-poly-remove hidden>删除我的图片</button><p class="poly-menu-status" role="status" aria-live="polite"></p>`;
      document.body.append(menu);menu.addEventListener('toggle',syncMenu);
    }
    syncMenu();
  }
  function report(message){status(message);const el=menu?.querySelector('.poly-menu-status');if(el)el.textContent=message;}
  async function decode(file){
    const url=URL.createObjectURL(file);
    try{const image=new Image();image.src=url;await image.decode();const scale=Math.min(1,1400/Math.max(image.naturalWidth,image.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(4,Math.round(image.naturalWidth*scale));canvas.height=Math.max(4,Math.round(image.naturalHeight*scale));const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,canvas.width,canvas.height);return ctx.getImageData(0,0,canvas.width,canvas.height);}finally{URL.revokeObjectURL(url);}
  }
  async function generate(file,opt){
    cancelJob();const token=job;busy=true;syncMenu();report('正在处理图片…');
    try{
      const image=await decode(file);if(token!==job)return;
      const payload={pixels:image.data,width:image.width,height:image.height,detail:opt.detail,tone:opt.tone,accent:effective().color};let svg;
      try{svg=await new Promise((resolve,reject)=>{rejectWorker=reject;worker=new Worker(new URL('poly-worker.js',document.baseURI));worker.onmessage=e=>e.data.error?reject(new Error(e.data.error)):resolve(e.data.svg);worker.onerror=reject;worker.postMessage(payload);});}
      catch(error){if(token!==job)return;svg=ShiyuPolyEngine.convert(payload);}
      if(token!==job)return;worker?.terminate();worker=null;rejectWorker=null;
      const value={file,svg};await dbAccess('readwrite',s=>s.put(value,'poly-cover'));
      if(token!==job)return;custom=value;prefs.polyScene={...opt,preset:'custom'};persist();paintArt();syncMenu();report('');toast('已换好风景');
    }catch(error){if(token===job)report('图片处理或保存失败，请换一张图片重试');}
    finally{if(token===job){busy=false;syncMenu();}}
  }
  async function acceptFile(file){
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024){report('请选择 15 MB 以内的 JPG、PNG 或 WebP 图片');return;}
    await ready;await generate(file,options());
  }
  function chooseFile(){
    if(!upload){upload=document.createElement('input');upload.type='file';upload.accept='image/jpeg,image/png,image/webp';upload.hidden=true;upload.dataset.polyUpload='';upload.setAttribute('aria-label','选择一张本地图片');document.body.append(upload);upload.addEventListener('change',()=>{const file=upload.files[0];upload.value='';if(file)acceptFile(file);});}
    upload.click();
  }
  async function nextPicture(){
    cancelJob();report('');await ready;
    const ids=PRESETS.map(p=>p[0]);if(custom)ids.push('custom');
    prefs.polyScene={...options(),preset:ids[(ids.indexOf(options().preset)+1)%ids.length]};persist();paintArt();syncMenu();
  }
  async function chooseEffect(button){
    if(busy)return;
    const opt=options(),prop=button.dataset.polyDetail?'detail':'tone',value=button.dataset.polyDetail||button.dataset.polyTone;
    if(opt[prop]===value)return;opt[prop]=value;
    await ready;
    if(opt.preset==='custom'&&custom)await generate(custom.file,opt);
    else{prefs.polyScene=opt;persist();paintArt();syncMenu();report('');}
  }
  document.addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-poly-next'))nextPicture();
    else if(b.hasAttribute('data-poly-file'))chooseFile();
    else if(b.hasAttribute('data-poly-open')){
      const parent=b.closest('dialog')||document.body;if(menu.parentElement!==parent)parent.append(menu);
    }
    else if(b.dataset.polyDetail||b.dataset.polyTone)chooseEffect(b);
    else if(b.hasAttribute('data-poly-remove')){
      cancelJob();try{await dbAccess('readwrite',s=>s.delete('poly-cover'));custom=null;if(options().preset==='custom'){prefs.polyScene={...options(),preset:'mountain'};persist();}paintArt();syncMenu();report('');toast('已删除我的图片');}catch{report('暂时无法删除图片，请重试');}
    }
  });
  initEffects();
  // A shareable local preview link opts in without changing other users' defaults.
  const preview=new URL(location.href).searchParams.get('theme');if(preview==='poly'){scope='global';changeTheme('poly');}else if(effective().theme==='poly')render();
})();
