/* Local prototype adapter. Replace with authenticated server transactions for production. */
(function (root) {
  'use strict';
  const KEY = 'yiyu-prototype-v1';
  const EVENT_KEY = 'shiyu-extension-change';
  function read() {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (!value || typeof value !== 'object') throw new Error("Couldn't read Shiyu data. Open Shiyu first.");
    return value;
  }
  function identity(value) { return value.signed ? String(value.prefs?.accountProfile?.id || 'local-experience') : null; }
  function requireLogin(value, expected) {
    const id = identity(value);
    if (!id) throw new Error("Sign in to Shiyu before saving.");
    if (expected && id !== expected) throw new Error("Account changed. Refresh and save again.");
    return id;
  }
  function snapshot() {
    const value = read(), id = identity(value);
    return { signed: !!id, accountId: id, name: id ? value.prefs?.accountProfile?.name || "Me" : '',
      theme: id ? { color: value.prefs?.color || '#48614c', mode: value.prefs?.mode || 'system' } : null,
      inboxCount: id ? (value.prefs?.extensionInbox || []).length : 0,
      spaces: id ? (value.data || []).map(s => ({ id: s.id, name: s.name, scenes: s.scenes.map(c => ({ id: c.id, name: c.name, groups: c.groups.map(g => ({ id: g.id, name: g.name })) })) })) : [] };
  }
  function bookmark(input) {
    if (!input || typeof input.url !== 'string' || input.url.length > 8192) throw new Error("URL is invalid or too long.");
    let url; try { url = new URL(input.url); } catch { throw new Error("Enter a valid URL."); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error("Use an HTTP or HTTPS URL without embedded credentials.");
    const title = String(input.title || '').trim(), description = String(input.description || '').trim();
    if (!title || title.length > 100 || description.length > 300) throw new Error("Name: 1–100 characters. Note: up to 300 characters.");
    const rawIcon = String(input.icon || '').trim();
    let icon = '';
    if (/^data:image\/(?:png|jpeg|webp);base64,/i.test(rawIcon) && rawIcon.length <= 100_000) icon = rawIcon;
    else try { const parsed = new URL(rawIcon); if (['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password) icon = parsed.href; } catch {}
    return [title, url.href, description, icon || url.origin + '/favicon.ico'];
  }
  function destination(value, target) {
    const s = value.data?.find(x => x.id === target?.spaceId);
    const c = s?.scenes.find(x => x.id === target?.sceneId);
    const g = c?.groups.find(x => x.id === target?.groupId);
    if (!g) throw new Error("Group changed. Refresh and select it again.");
    return { group: g, label: [s.name, c.name, g.name].join(' / ') };
  }
  function commit(value, detail) {
    // One atomic localStorage write: quota failures never report success or remove inbox entries.
    try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { throw new Error("Local storage is full. Free some space and try again."); }
    try { localStorage.setItem(EVENT_KEY, crypto.randomUUID()); } catch { /* Data is already committed. */ }
    root.dispatchEvent(new CustomEvent('shiyu-extension-change', { detail }));
  }
  function save(input) {
    const value = read(); requireLogin(value, input?.accountId);
    const item = bookmark(input); value.prefs ||= {};
    if (input.mode === 'temporary') {
      const inbox = value.prefs.extensionInbox ||= [];
      if (inbox.some(x => x.item[1] === item[1])) return { duplicate: true, label: "Inbox" };
      inbox.unshift({ id: crypto.randomUUID(), item, category: 'archive', createdAt: Date.now() });
      commit(value); return { label: "Inbox" };
    }
    if (input.mode !== 'group') throw new Error("Choose how to save.");
    const { group, label } = destination(value, input);
    if (group.items.some(x => x[1] === item[1])) return { duplicate: true, label };
    group.items.push(item); commit(value); return { label };
  }
  function inbox() { const value = read(); requireLogin(value); return value.prefs?.extensionInbox || []; }
  function search(input) {
    const value = read(); requireLogin(value, input?.accountId);
    const query = String(input?.query || '').trim().toLocaleLowerCase();
    if (!query) return { total: 0, items: [] };
    const found = [], seen = new Set();
    const add = (item, path) => {
      if (!Array.isArray(item) || typeof item[1] !== 'string' || seen.has(item[1])) return;
      let url; try { url = new URL(item[1]); } catch { return; }
      if (!['http:', 'https:'].includes(url.protocol)) return;
      const title = String(item[0] || url.hostname), description = String(item[2] || '');
      if (![title, url.href, description, path].some(text => text.toLocaleLowerCase().includes(query))) return;
      seen.add(url.href); found.push({ title, url: url.href, description, path, domain: url.hostname.replace(/^www\./i, '') });
    };
    for (const space of value.data || []) for (const scene of space.scenes || []) for (const group of scene.groups || []) {
      const path = [space.name, scene.name, group.name].join(' / ');
      for (const item of group.items || []) add(item, path);
    }
    for (const entry of value.prefs?.extensionInbox || []) add(entry.item, "Inbox");
    return { total: found.length, items: found.slice(0, 5) };
  }
  function move(input) {
    const value = read(); requireLogin(value, input.accountId);
    const entries = value.prefs?.extensionInbox || [], entry = entries.find(x => x.id === input.id);
    if (!entry) throw new Error("This inbox item changed. Refresh.");
    const { group, label } = destination(value, input);
    if (!group.items.some(x => x[1] === entry.item[1])) group.items.push(bookmark({ title: entry.item[0], url: entry.item[1], description: entry.item[2], icon: entry.item[3] }));
    value.prefs.extensionInbox = entries.filter(x => x.id !== input.id);
    commit(value); return { label };
  }
  function updateInbox(input) {
    const value=read();requireLogin(value,input.accountId);
    const entries=value.prefs?.extensionInbox||[],ids=new Set(input.ids||[]),selected=entries.filter(x=>ids.has(x.id));
    if(!ids.size||selected.length!==ids.size)throw new Error("Selected items changed. Select them again.");
    let label='';
    if(input.action==='archive'){
      const target=destination(value,input);label=target.label;
      const items=selected.map(x=>bookmark({title:x.item[0],url:x.item[1],description:x.item[2],icon:x.item[3]}));
      for(const item of items)if(!target.group.items.some(x=>x[1]===item[1]))target.group.items.push(item);
      value.prefs.extensionInbox=entries.filter(x=>!ids.has(x.id));
    }else if(input.action==='clear')value.prefs.extensionInbox=entries.filter(x=>!ids.has(x.id));
    else if(input.action==='category'&&['temporary','archive'].includes(input.category)){
      for(const entry of selected)entry.category=input.category;
    }else throw new Error("Unsupported action.");
    commit(value,input.action==='category'?{type:'inbox-category'}:undefined);return {count:selected.length,label};
  }
  function seedInboxDemo(){
    const value=read(),id=requireLogin(value);value.prefs||={};value.prefs.laterDemoOwners||={};
    if(value.prefs.laterDemoOwners[id])return;
    const examples=[["Bilibili · Videos",'https://www.bilibili.com/','temporary'],["Douban · Books & Films",'https://www.douban.com/','temporary'],["Wikipedia · Explore",'https://zh.wikipedia.org/','temporary'],["MDN · Web Docs",'https://developer.mozilla.org/zh-CN/','archive'],["Figma · Design",'https://www.figma.com/','archive'],["GitHub · Open Source",'https://github.com/','archive']];
    const inbox=value.prefs.extensionInbox||=[];
    for(const [title,url,category] of examples)if(!inbox.some(x=>x.item[1]===url))inbox.push({id:crypto.randomUUID(),item:[title,url,"Demo link. File or clear it."],category,demo:true,createdAt:Date.now()});
    value.prefs.laterDemoOwners[id]=true;commit(value);
  }
  root.ShiyuExtensionStore = Object.freeze({ snapshot, save, search, inbox, move, updateInbox, seedInboxDemo, KEY, EVENT_KEY });
})(globalThis);
