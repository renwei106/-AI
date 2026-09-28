// Read-only analytics observer. It never changes application state or user content.
(() => {
  if (window.ShiyuAnalyticsObserver) return;
  window.ShiyuAnalyticsObserver = true;
  const endpoint = '/api/shiyu/auth/analytics';
  const uuid = () => crypto.randomUUID();
  const storedId = (storage, key) => { try { let id = storage.getItem(key); if (!/^[\w-]{8,80}$/.test(id || '')) { id = uuid(); storage.setItem(key, id); } return id; } catch { return uuid(); } };
  let device, session;
  try { device = storedId(localStorage, 'shiyu-analytics-device'); session = storedId(sessionStorage, 'shiyu-analytics-session'); } catch { return; }
  let queue = [], inFlight = false, lastInput = Date.now(), lastSnapshot = '', lastIdentity = '', stoppedUntil = 0;
  const browser = () => { const ua = navigator.userAgent; for (const [pattern, name] of [[/Edg\//,'Edge'],[/Firefox\//,'Firefox'],[/OPR\//,'Opera'],[/Chrome\//,'Chrome'],[/Safari\//,'Safari']]) if (pattern.test(ua)) return name; return '未知'; };
  const os = () => /Android/.test(navigator.userAgent) ? 'Android' : /iPhone|iPad/.test(navigator.userAgent) ? 'iOS / iPadOS' : /Windows/.test(navigator.userAgent) ? 'Windows' : /Macintosh/.test(navigator.userAgent) ? 'macOS' : /Linux/.test(navigator.userAgent) ? 'Linux' : '未知';
  const colorGroup = value => { const m = /^#([a-f\d]{6})$/i.exec(value || ''); if (!m) return '默认／其他'; const rgb = [0,2,4].map(i => parseInt(m[1].slice(i,i+2),16)), max=Math.max(...rgb),min=Math.min(...rgb); if(max-min<30) return max<70?'深色系':min>200?'浅色系':'中性色'; return rgb[0]===max?(rgb[1]>rgb[2]*1.3?'黄橙色系':'红紫色系'):rgb[1]===max?'绿色系':'蓝色系'; };
  function context() {
    const p = typeof effective === 'function' ? effective() : {}, raw = typeof prefs === 'object' ? prefs : {};
    const page = document.body.dataset.view || 'home';
    const identity = typeof signed !== 'undefined' && signed ? raw.accountProfile?.id || '' : '';
    if (lastIdentity !== identity) { queue=[];lastIdentity=identity;lastSnapshot=''; }
    let pet = null; try { pet=window.ShiyuDesktopPet?.read?.()||JSON.parse(localStorage.getItem('shiyu-desktop-pet-v1')||'null'); } catch {}
    const group = page==='space' && typeof currentGroup==='function' ? currentGroup() : null;
    const display = page==='space' && typeof displayRule==='function' ? displayRule() : null;
    const groupStyle = group && typeof styles==='object' ? display?.style || styles[group.id] || 'cards' : '';
    const groupElement = document.querySelector('#groups .group:not([hidden])');
    const viewMode = page==='space' ? (document.querySelector('.space-atlas:not([hidden]),.atlas-shell:not([hidden])')?'图谱':groupElement?(typeof linkMode==='function'?linkMode(groupStyle):groupStyle):'未知') : '不适用';
    return {
      page,scope:page==='space'?`space:${typeof spaceId==='string'?spaceId:'unknown'}:${group?.id||'none'}`:'global',
      theme:typeof THEMES==='object'&&THEMES[p.theme]?THEMES[p.theme].name:p.theme||'未知',font:p.font||'未知',color:colorGroup(p.color),mode:p.mode||'未知',
      width:page==='space'?p.width||'未知':'不适用',actualWidth:page==='space'?(innerWidth<1120?'受窗口宽度限制':p.width||'未知'):'不适用',spaceView:viewMode,viewStyle:groupStyle?`${groupStyle} · ${display?.columns||raw.groupColumns?.[group?.id]||'默认'}列`:'不适用',
      petEnabled:pet?.enabled!==false,petSkin:pet?.enabled===false?'未开启':pet?.skin||'cat',petVisible:Boolean(document.querySelector('.desktop-pet:not([hidden])')),
      selection:'已观测配置',gender:['male','female','private','男','女'].includes(raw.accountProfile?.gender)?raw.accountProfile.gender:'未填写',
      browser:browser(),os:os(),deviceType:/iPad|Tablet/i.test(navigator.userAgent)?'平板':/Mobi|Android/i.test(navigator.userAgent)?'手机':'电脑／其他',
      country:/^[A-Z]{2}$/.test(window.SHIYU_LOCALE_STATE?.country||'')?window.SHIYU_LOCALE_STATE.country:'未知',
      screen:`${screen.width} × ${screen.height}`,viewport:`${Math.round(innerWidth/100)*100} × ${Math.round(innerHeight/100)*100}`,
    };
  }
  function enqueue(kind, props) { if(Date.now()<stoppedUntil)return; queue.push({id:uuid(),time:Date.now(),kind,device,session,props});if(queue.length>20)queue.shift();void flush(); }
  async function flush() {
    if(inFlight||!queue.length||Date.now()<stoppedUntil)return;
    inFlight=true;const batch=queue.splice(0,20);
    try {const response=await fetch(endpoint,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({events:batch}),keepalive:true});if(!response.ok)stoppedUntil=Date.now()+60_000;}
    catch {stoppedUntil=Date.now()+60_000;} finally {inFlight=false;}
  }
  function sample(active=false) {try { if(document.visibilityState!=='visible')return;const props=context(),state=JSON.stringify(props);if(state!==lastSnapshot){lastSnapshot=state;enqueue('preference',props);}if(active&&Date.now()-lastInput<60_000)enqueue('usage',{...props,seconds:15}); } catch { /* Collection never interrupts the application. */ } }
  for(const event of ['pointerdown','keydown','scroll'])addEventListener(event,e=>{if(e.isTrusted)lastInput=Date.now();},{passive:true});
  addEventListener('focus',()=>{lastInput=Date.now();sample();});
  addEventListener('error',event=>{try {enqueue('client_error',{page:document.body.dataset.view||'home',code:event.error?.name||'resource_error'});}catch{}},true);
  addEventListener('unhandledrejection',()=>{try {enqueue('client_error',{page:document.body.dataset.view||'home',code:'unhandled_rejection'});}catch{}});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){lastInput=Date.now();sample();}else void flush();});
  // Poll the observer's own state; do not replace render, save, login, or fetch functions.
  let membershipViewed=false;
  setInterval(()=>{try{const visible=document.visibilityState==='visible'&&Boolean(document.querySelector('#member-center[open],#member-gate[open],#member-order[open]'));if(visible&&!membershipViewed)enqueue('feature',{page:'membership',feature:'membership_view'});membershipViewed=visible;}catch{}},5000);
  setTimeout(()=>sample(),1500);
  setInterval(()=>sample(),5000);
  setInterval(()=>sample(true),15000);
})();
