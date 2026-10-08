import { SITE_URLS } from './config.js';
const extensionApi = globalThis.browser || globalThis.chrome;

const sites = SITE_URLS.map(value => new URL(value));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const detectBrowser = () => {
  const agent = navigator.userAgent;
  if (/Firefox\//.test(agent)) return 'firefox';
  if (/Edg\//.test(agent)) return 'edge';
  if (/Quark\//i.test(agent)) return 'quark';
  if (/QQBrowser\//i.test(agent)) return 'qq';
  if (/360(?:SE|EE)|QihooBrowser/i.test(agent)) return '360';
  return 'chrome';
};
const newer = (latest, current) => {
  const a = String(latest).split('.').map(Number), b = String(current).split('.').map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index++) if ((a[index] || 0) !== (b[index] || 0)) return (a[index] || 0) > (b[index] || 0);
  return false;
};
async function versionStatus() {
  const current = extensionApi.runtime.getManifest().version;
  for (const site of sites) try {
    const response = await fetch(new URL('extension/release.json', site), { cache: 'no-store' });
    if (!response.ok) continue;
    const release = await response.json(), latest = /^\d+\.\d+\.\d+$/.test(release.latest || '') ? release.latest : current;
    return { current, latest, hasUpdate: newer(latest, current), browser: detectBrowser() };
  } catch { /* Try the next configured site. */ }
  return { current, latest: current, hasUpdate: false, browser: detectBrowser() };
}
let bridgeTabPromise;
const ACCOUNT_STATE_CACHE = 'shiyuAccountState';
function connectedSiteTab() {
  bridgeTabPromise ||= siteTab().finally(() => { bridgeTabPromise = null; });
  return bridgeTabPromise;
}
async function siteTab() {
  for (const site of sites) {
    const tabs = await extensionApi.tabs.query({ url: site.origin + '/*' });
    const tab = tabs.find(tab => { try { return new URL(tab.url).origin === site.origin; } catch { return false; } });
    if (tab) return { tab, site };
  }
  const site = sites[0];
  return { tab: await extensionApi.tabs.create({ url: site.href + '?extension=bridge', active: false }), site };
}
async function directAccountState(tab, site) {
    const results = await extensionApi.scripting.executeScript({ target: { tabId: tab.id }, world: 'MAIN',
      func: async expectedOrigin => {
        if (location.origin !== expectedOrigin) return;
        const key = 'yiyu-prototype-v1', before = localStorage.getItem(key);
        let value; try { value = JSON.parse(before || 'null'); } catch { value = null; }
        const localPreview = ['127.0.0.1', 'localhost'].includes(location.hostname);
        // A website account already saved on this origin is available before its UI scripts.
        // Do not turn a prototype's `signed` flag without an account id into a production login.
        if (!value?.signed || !value.prefs?.accountProfile?.id && !localPreview) {
          if (!localPreview) {
            const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 1800);
            try {
              const sessionResponse = await fetch('/api/shiyu/auth/session', { credentials: 'same-origin', cache: 'no-store', signal: controller.signal });
              if (!sessionResponse.ok) throw Error('无法读取拾隅登录状态，请重试。');
              const session = await sessionResponse.json();
              if (session.authenticated === true && session.user?.id) {
                const accountResponse = await fetch('/api/shiyu/auth/account', { credentials: 'same-origin', cache: 'no-store', signal: controller.signal });
                const account = await accountResponse.json();
                if (!accountResponse.ok || account.userId !== session.user.id) throw Error('登录账号已变化，请重新打开插件。');
                if (location.origin !== expectedOrigin || localStorage.getItem(key) !== before) throw Error('登录账号已变化，请重新打开插件。');
                const sameOwner = value?.prefs?.accountProfile?.id === session.user.id;
                value = { ...(value || {}), signed: true, data: Array.isArray(account.data) ? account.data : sameOwner && Array.isArray(value?.data) ? value.data : [],
                  prefs: { ...(value?.prefs || {}), ...(!sameOwner ? { membership: null, membershipDemo: null, demoMemberOrders: [] } : {}),
                    accountProfile: { ...session.user, ...(sameOwner ? value?.prefs?.accountProfile : {}), id: session.user.id }, accountDataUserId: session.user.id,
                    extensionInbox: sameOwner ? value?.prefs?.extensionInbox || [] : [] } };
                localStorage.setItem(key, JSON.stringify(value));
                try { localStorage.setItem('shiyu-extension-change', crypto.randomUUID()); } catch { /* The account data is already committed. */ }
                window.dispatchEvent(new CustomEvent('shiyu-extension-change'));
              } else return { signed: false, accountId: null, name: '', theme: null, inboxCount: 0, spaces: [] };
            } finally { clearTimeout(timer); }
          }
        }
        if (!value || typeof value.signed !== 'boolean') return;
        // Keep the loaded page's effective theme (including scene overrides).
        const bridge = window.shiyuExtensionBridge;
        if (bridge) { const response = await bridge.dispatch({ type: 'state' }); if (response?.ok) return response.value; }
        const store = window.ShiyuExtensionStore;
        return store?.snapshot();
      },
      args: [site.origin] });
    return results[0]?.result;
}
async function readySiteTab() {
  const connection = await connectedSiteTab();
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const result = await extensionApi.scripting.executeScript({ target: { tabId: connection.tab.id }, world: 'MAIN',
        func: origin => location.origin === origin ? !!window.ShiyuExtensionStore : undefined, args: [connection.site.origin] });
      if (result[0]?.result === undefined) { await delay(150); continue; }
      if (!result[0].result) await extensionApi.scripting.executeScript({ target: { tabId: connection.tab.id }, world: 'MAIN', files: ['account-store.js'] });
      return connection;
    } catch { await delay(150); }
  }
  throw Error('暂时连不上拾隅，请重试。');
}
async function verifyAccount(connection, payload) {
  const results = await extensionApi.scripting.executeScript({ target: { tabId: connection.tab.id }, world: 'MAIN',
    args: [connection.site.origin, payload?.accountId], func: async (origin, accountId) => {
      try {
        const current = () => window.ShiyuExtensionStore?.snapshot()?.accountId;
        if (location.origin !== origin || !accountId || current() !== accountId) throw Error('登录账号已变化，请重新打开插件。');
        if (!['127.0.0.1', 'localhost'].includes(location.hostname)) {
          const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 1800);
          try {
            const response = await fetch('/api/shiyu/auth/session', { credentials: 'same-origin', cache: 'no-store', signal: controller.signal });
            if (!response.ok) throw Error('无法读取拾隅登录状态，请重试。');
            const session = await response.json();
            if (session.authenticated !== true || session.user?.id !== accountId || location.origin !== origin || current() !== accountId) throw Error('登录账号已变化，请重新打开插件。');
          } finally { clearTimeout(timer); }
        }
        return { ok: true };
      } catch (error) { return { ok: false, error: error.name === 'AbortError' ? '读取超时，请重试连接拾隅。' : error.message }; }
    } });
  if (!results[0]?.result?.ok) throw Error(results[0]?.result?.error || '无法确认拾隅登录状态，请重试。');
}
async function relay(request, attempts = 24) {
  const connection = await readySiteTab(), { tab, site } = connection;
  if (request.type !== 'state') await verifyAccount(connection, request.payload);
  for (let attempt = 0; attempt < attempts; attempt++) {
    let result;
    try {
      const results = await extensionApi.scripting.executeScript({ target: { tabId: tab.id }, world: 'MAIN',
        func: async (message, expectedOrigin) => {
          if (location.origin !== expectedOrigin) return;
          try {
            const store = window.ShiyuExtensionStore;
            const state = store?.snapshot();
            if (!state) return;
            if (message.type !== 'state' && (!state.signed || !message.payload?.accountId || state.accountId !== message.payload.accountId)) throw Error('登录账号已变化，请刷新后重试。');
            if (window.shiyuExtensionBridge) return window.shiyuExtensionBridge.dispatch(message);
            const method = { state: 'snapshot', save: 'save', search: 'search' }[message.type];
            if (!method) throw Error('不支持的插件操作。');
            return { ok: true, value: store[method](message.payload) };
          } catch (error) { return { ok: false, error: error.message }; }
        },
        args: [request, site.origin] });
      result = results[0]?.result;
    } catch { /* The tab may still be loading; never fall back to a different site. */ }
    if (result) {
      if (!result.ok) throw new Error(result.error);
      return result.value;
    }
    await delay(250);
  }
  throw new Error('暂时连不上拾隅。请刷新拾隅网页后重试，已填内容会保留。');
}
async function freshAccountState() {
  const { tab, site } = await readySiteTab();
  const value = await directAccountState(tab, site) || await relay({ type: 'state' }, 8);
  await extensionApi.storage.local.set({ [ACCOUNT_STATE_CACHE]: value });
  return value;
}
async function accountState() {
  // Reading the current origin is cheap; an extension cache can belong to a logged-out
  // or different account and must never be returned ahead of this read.
  return freshAccountState();
}
extensionApi.runtime.onMessage.addListener((request, sender, reply) => {
  if (sender.id !== extensionApi.runtime.id || ![extensionApi.runtime.getURL('popup.html'),extensionApi.runtime.getURL('panel.html')].includes(sender.url)) return false;
  (async () => {
    if(request.type==='open-shortcuts'){
      const browser=detectBrowser();
      const url={chrome:'chrome://extensions/shortcuts',edge:'edge://extensions/shortcuts'}[browser];
      if(!url)throw new Error('当前浏览器不支持此快捷键设置入口');
      await extensionApi.tabs.create({url});return true;
    }
    if(request.type==='tool-records')return toolRecords(request.payload);
    if(request.type==='list'||request.type==='move')return trialRelay(request);
    if (request.type === 'state') return accountState();
    if (request.type === 'save') return relay({ type: 'save', payload: request.payload });
    if (request.type === 'search') return relay({ type: 'search', payload: request.payload });
    if (request.type === 'version') return versionStatus();
    if (request.type === 'open-update') {
      const site = sites[0], browser = detectBrowser();
      await extensionApi.tabs.create({ url: new URL(`extension/?browser=${encodeURIComponent(browser)}#download`, site).href }); return true;
    }
    if (request.type === 'open-url') {
      let url; try { url = new URL(request.url); } catch { throw new Error('网址无效。'); }
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('仅支持打开普通网页。');
      await extensionApi.tabs.create({ url: url.href }); return true;
    }
    if (request.type === 'open') {
      const route = { login: '?extension=login', collection: 'extension/inbox.html', guide: 'extension/' }[request.page];
      if (route === undefined) throw new Error('无效的页面。');
      const { site } = await siteTab();
      await extensionApi.tabs.create({ url: new URL(route, site).href }); return true;
    }
    throw new Error('无效的插件操作。');
  })().then(value => reply({ ok: true, value }), error => reply({ ok: false, error: error.message }));
  return true;
});

async function trialRelay(request){
 const connection=await readySiteTab(),{tab,site}=connection;await verifyAccount(connection,request.payload);
 const result=await extensionApi.scripting.executeScript({target:{tabId:tab.id},world:'MAIN',args:[request,site.origin],func:(request,origin)=>{
  try{if(location.origin!==origin)throw Error('站点已变化');const store=window.ShiyuExtensionStore;if(!store)throw Error('请稍后重试');const state=store.snapshot();if(!state.signed||!request.payload?.accountId||state.accountId!==request.payload.accountId)throw Error('登录账号已变化，请刷新后重试');
  if(request.type==='move')return {ok:true,value:store.move(request.payload)};
  const value=JSON.parse(localStorage.getItem(store.KEY)||'{}'),items=[];
  const add=(item,extra)=>{try{const u=new URL(item[1]);if(!['https:','http:'].includes(u.protocol))return;items.push({title:String(item[0]||u.hostname),url:u.href,description:String(item[2]||''),icon:String(item[3]||''),domain:u.hostname,...extra})}catch{}};
  for(const s of value.data||[])for(const c of s.scenes||[])for(const g of c.groups||[])for(const item of g.items||[])add(item,{spaceId:s.id,sceneId:c.id,groupId:g.id,path:[s.name,c.name,g.name].join(' / ')});
  for(const row of store.inbox())add(row.item,{id:row.id,inbox:true,path:'稍后整理'});
  const library=value.prefs?.cornerCollections?.[state.accountId];
  const commonGroups=(library?.groups||[]).filter(g=>g.system!=='inbox').map(g=>{
   const refs=[...(g.refs||[])];
   if(g.sort==='frequency')refs.sort((a,b)=>(library.usage?.[b.url]||0)-(library.usage?.[a.url]||0));
   const commonItems=refs.flatMap(ref=>{
    let url;try{url=new URL(ref.url).href}catch{return []}
    if(ref.own){const before=items.length;add(ref.own,{path:'我的常用'});return items.length>before?[items[items.length-1]]:[]}
    const item=items.find(x=>!x.inbox&&x.groupId===ref.gid&&x.url===url)||items.find(x=>!x.inbox&&x.url===url);
    return item?[item]:[];
   });
   return {id:g.id,name:g.name,items:commonItems};
  });
  return {ok:true,value:{items,commonGroups,accountId:state.accountId}};
  }catch(e){return {ok:false,error:e.message}}
 }});const response=result[0]?.result;if(!response?.ok)throw Error(response?.error||'读取失败，请重试');return response.value;
}
async function applyMode(){const {opening='popup'}=await extensionApi.storage.local.get('opening');const side=opening==='side'&&!!(extensionApi.sidePanel?.open||extensionApi.sidebarAction?.open);await extensionApi.action.setPopup({popup:side?'':'popup.html'});if(extensionApi.sidePanel?.setPanelBehavior)await extensionApi.sidePanel.setPanelBehavior({openPanelOnActionClick:side});}
if(extensionApi.sidebarAction)extensionApi.action.onClicked.addListener(()=>extensionApi.sidebarAction.open());
extensionApi.runtime.onInstalled.addListener(applyMode);extensionApi.runtime.onStartup.addListener(applyMode);extensionApi.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.opening)void applyMode()});

async function toolRecords(payload){
 if(!['memo','todo'].includes(payload?.tool)||!['read','save'].includes(payload?.action))throw Error('无效的工具操作');
 const {tab,site}=await readySiteTab();
 const results=await extensionApi.scripting.executeScript({target:{tabId:tab.id},world:'MAIN',args:[payload,site.origin],func:async(p,origin)=>{
  try{
   const current=()=>window.ShiyuExtensionStore?.snapshot()?.accountId;
   if(location.origin!==origin||!p.accountId||current()!==p.accountId)throw Error('登录账号已变化，请重新打开插件');
   const response=await fetch('/api/shiyu/auth/tools',{credentials:'same-origin',cache:'no-store'}),state=await response.json();
   if(!response.ok||state.userId!==p.accountId||current()!==p.accountId)throw Error(state.message||'无法获取账号数据');
   const doc=state.tools?.[p.tool];let data=structuredClone(doc?.data|| (p.tool==='memo'?{notes:[],lastNumber:0}:{calendarV2:{version:2,revision:0,groups:[],tasks:[],initialized:true}}));
   if(p.action==='save'){
    if((doc?.revision||0)!==p.revision)throw Error('内容已在其他页面更新，请刷新列表后重试');
    if(p.tool==='todo'&&!data.calendarV2){const {initialState}=await import('/todo-calendar-core.js');data.calendarV2=initialState({...data,tasks:data.tasks||[],inbox:data.inbox||[]})}
    const items=p.tool==='memo'?(data.notes||=[]):data.calendarV2.tasks;
    const input=p.item;if(!input||typeof input.id!=='string')throw Error('记录无效');
    let item=items.find(x=>x.id===input.id);
    if(item?.deletedAt||item?.archivedAt)throw Error('这条记录已删除或归档，请刷新后重试');
    if(!item){item={id:input.id,createdAt:Date.now()};if(p.tool==='memo'){data.lastNumber=Math.max(data.lastNumber||0,...items.map(x=>x.number||0))+1;Object.assign(item,{number:data.lastNumber,title:'',icon:'✦',color:'theme'})}else Object.assign(item,{start:null,duration:30,groupId:'',description:'',dateEnd:'',done:false});items.unshift(item)}
    if(p.tool==='memo'){if(typeof input.content!=='string'||!input.content.trim()||Array.from(input.content).length>300)throw Error('小记内容请填写1–300字');item.content=input.content}
    else{if(typeof input.title!=='string'||!input.title.trim()||input.title.length>200)throw Error('待办标题请填写1–200字');if(input.date&&!/^\d{4}-\d{2}-\d{2}$/.test(input.date))throw Error('日期无效');if(item.date!==input.date)item.dateEnd=input.date;Object.assign(item,{title:input.title,date:input.date||'',priority:Math.max(0,Math.min(3,Number(input.priority)||0)),done:!!input.done,completedAt:input.done?(item.completedAt||Date.now()):null});data.calendarV2.revision=(data.calendarV2.revision||0)+1}
    if(p.tool==='todo'&&Object.hasOwn(input,'groupId')){if(input.groupId&&!data.calendarV2.groups.some(g=>g.id===input.groupId))throw Error('分组已变化，请刷新后重试');item.groupId=input.groupId||''}
    if(p.tool==='todo'&&Object.hasOwn(input,'start')){const start=input.start,duration=Number(input.duration);if(start!==null&&(!Number.isInteger(start)||start<0||start>=1440||!Number.isFinite(duration)||duration<=0||duration>525600||!input.date))throw Error('时间段无效');if(input.dateEnd&&(!/^\d{4}-\d{2}-\d{2}$/.test(input.dateEnd)||input.dateEnd<input.date))throw Error('结束日期无效');Object.assign(item,{start,duration:Number.isFinite(duration)&&duration>0?duration:30,dateEnd:input.date?(input.dateEnd||input.date):''})}item.updatedAt=Date.now();if(current()!==p.accountId)throw Error('账号已切换');
    const saved=await fetch('/api/shiyu/auth/tools',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:p.accountId,tool:p.tool,data,revision:doc?.revision||0,initialize:false})});
    const result=await saved.json();if(!saved.ok||result.userId!==p.accountId||current()!==p.accountId)throw Error(result.message||'保存失败，请重试');return {ok:true,value:{data:result.data,revision:result.revision}};
   }
   return {ok:true,value:{data,revision:doc?.revision||0}};
  }catch(e){return {ok:false,error:e.message}}
 }});const result=results[0]?.result;if(!result?.ok)throw Error(result?.error||'无法连接账号数据');return result.value;
}
