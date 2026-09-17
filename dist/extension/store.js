/* Local prototype adapter. Replace with authenticated server transactions for production. */
(function (root) {
  'use strict';
  const KEY = 'yiyu-prototype-v1';
  const EVENT_KEY = 'shiyu-extension-change';
  function read() {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (!value || typeof value !== 'object') throw new Error('无法读取拾隅数据，请先打开拾隅。');
    return value;
  }
  function identity(value) { return value.signed ? String(value.prefs?.accountProfile?.id || 'local-experience') : null; }
  function requireLogin(value, expected) {
    const id = identity(value);
    if (!id) throw new Error('请先登录拾隅，再保存收藏。');
    if (expected && id !== expected) throw new Error('登录账号已变化，请刷新后重新收藏。');
    return id;
  }
  function snapshot() {
    const value = read(), id = identity(value);
    return { signed: !!id, accountId: id, name: id ? value.prefs?.accountProfile?.name || '我' : '',
      theme: id ? { color: value.prefs?.color || '#48614c', mode: value.prefs?.mode || 'system' } : null,
      inboxCount: id ? (value.prefs?.extensionInbox || []).length : 0,
      spaces: id ? (value.data || []).map(s => ({ id: s.id, name: s.name, scenes: s.scenes.map(c => ({ id: c.id, name: c.name, groups: c.groups.map(g => ({ id: g.id, name: g.name })) })) })) : [] };
  }
  function bookmark(input) {
    if (!input || typeof input.url !== 'string' || input.url.length > 8192) throw new Error('网址过长或无效。');
    let url; try { url = new URL(input.url); } catch { throw new Error('请输入有效的网址。'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('仅支持不含账号密码的 HTTP / HTTPS 网页。');
    const title = String(input.title || '').trim(), description = String(input.description || '').trim();
    if (!title || title.length > 100 || description.length > 300) throw new Error('名称需为 1–100 字，备注不超过 300 字。');
    return [title, url.href, description, Array.from(title)[0]];
  }
  function destination(value, target) {
    const s = value.data?.find(x => x.id === target?.spaceId);
    const c = s?.scenes.find(x => x.id === target?.sceneId);
    const g = c?.groups.find(x => x.id === target?.groupId);
    if (!g) throw new Error('该分组已变更，请刷新后重新选择。');
    return { group: g, label: [s.name, c.name, g.name].join(' / ') };
  }
  function commit(value, detail) {
    // One atomic localStorage write: quota failures never report success or remove inbox entries.
    try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { throw new Error('本机存储空间不足，尚未保存，请清理后重试。'); }
    try { localStorage.setItem(EVENT_KEY, crypto.randomUUID()); } catch { /* Data is already committed. */ }
    root.dispatchEvent(new CustomEvent('shiyu-extension-change', { detail }));
  }
  function save(input) {
    const value = read(); requireLogin(value, input?.accountId);
    const item = bookmark(input); value.prefs ||= {};
    if (input.mode === 'temporary') {
      const inbox = value.prefs.extensionInbox ||= [];
      if (inbox.some(x => x.item[1] === item[1])) return { duplicate: true, label: '稍后整理' };
      inbox.unshift({ id: crypto.randomUUID(), item, category: 'archive', createdAt: Date.now() });
      commit(value); return { label: '稍后整理' };
    }
    if (input.mode !== 'group') throw new Error('请选择收藏方式。');
    const { group, label } = destination(value, input);
    if (group.items.some(x => x[1] === item[1])) return { duplicate: true, label };
    group.items.push(item); commit(value); return { label };
  }
  function inbox() { const value = read(); requireLogin(value); return value.prefs?.extensionInbox || []; }
  function move(input) {
    const value = read(); requireLogin(value, input.accountId);
    const entries = value.prefs?.extensionInbox || [], entry = entries.find(x => x.id === input.id);
    if (!entry) throw new Error('这条待整理收藏已变更，请刷新。');
    const { group, label } = destination(value, input);
    if (!group.items.some(x => x[1] === entry.item[1])) group.items.push(bookmark({ title: entry.item[0], url: entry.item[1], description: entry.item[2] }));
    value.prefs.extensionInbox = entries.filter(x => x.id !== input.id);
    commit(value); return { label };
  }
  function updateInbox(input) {
    const value=read();requireLogin(value,input.accountId);
    const entries=value.prefs?.extensionInbox||[],ids=new Set(input.ids||[]),selected=entries.filter(x=>ids.has(x.id));
    if(!ids.size||selected.length!==ids.size)throw new Error('所选内容已变更，请重新选择。');
    let label='';
    if(input.action==='archive'){
      const target=destination(value,input);label=target.label;
      const items=selected.map(x=>bookmark({title:x.item[0],url:x.item[1],description:x.item[2]}));
      for(const item of items)if(!target.group.items.some(x=>x[1]===item[1]))target.group.items.push(item);
      value.prefs.extensionInbox=entries.filter(x=>!ids.has(x.id));
    }else if(input.action==='clear')value.prefs.extensionInbox=entries.filter(x=>!ids.has(x.id));
    else if(input.action==='category'&&['temporary','archive'].includes(input.category)){
      for(const entry of selected)entry.category=input.category;
    }else throw new Error('不支持的整理操作。');
    commit(value,input.action==='category'?{type:'inbox-category'}:undefined);return {count:selected.length,label};
  }
  function seedInboxDemo(){
    const value=read(),id=requireLogin(value);value.prefs||={};value.prefs.laterDemoOwners||={};
    if(value.prefs.laterDemoOwners[id])return;
    const examples=[['哔哩哔哩 · 随手看看','https://www.bilibili.com/','temporary'],['豆瓣 · 电影与阅读','https://www.douban.com/','temporary'],['维基百科 · 随意探索','https://zh.wikipedia.org/','temporary'],['MDN · 开发文档','https://developer.mozilla.org/zh-CN/','archive'],['Figma · 设计工具','https://www.figma.com/','archive'],['GitHub · 开源项目','https://github.com/','archive']];
    const inbox=value.prefs.extensionInbox||=[];
    for(const [title,url,category] of examples)if(!inbox.some(x=>x.item[1]===url))inbox.push({id:crypto.randomUUID(),item:[title,url,'演示网址，可归档或清除'],category,demo:true,createdAt:Date.now()});
    value.prefs.laterDemoOwners[id]=true;commit(value);
  }
  root.ShiyuExtensionStore = Object.freeze({ snapshot, save, inbox, move, updateInbox, seedInboxDemo, KEY, EVENT_KEY });
})(globalThis);
