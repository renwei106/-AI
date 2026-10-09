/* Local prototype adapter. Replace with authenticated server transactions for production. */
(function (root) {
  'use strict';
  const KEY = 'yiyu-prototype-v1';
  const EVENT_KEY = 'shiyu-extension-change';
  const PENDING_KEY = 'shiyu-extension-pending-v1';
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
    if (!g) throw new Error('该分组已变更，请刷新后重新选择。');
    return { group: g, label: [s.name, c.name, g.name].join(' / ') };
  }
  function pending(accountId) {
    let entries; try { entries = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch { entries = []; }
    return (Array.isArray(entries) ? entries : []).filter(entry => entry && typeof entry.id === 'string' && (!accountId || entry.accountId === accountId));
  }
  function ackPending(accountId, ids) {
    const selected = new Set(ids);
    if (!accountId || !selected.size) return;
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending().filter(entry => entry.accountId !== accountId || !selected.has(entry.id))));
  }
  function applyPending(value, entries, options = {}) {
    const owner = identity(value), applied = [];
    if (!owner) return applied;
    for (const entry of entries) {
      if (entry.accountId !== owner) continue;
      if (entry.kind === 'inbox' && options.inbox !== false) {
        const row = entry.entry;
        if (!row?.id || !Array.isArray(row.item)) continue;
        let item; try { item = bookmark({ title: row.item[0], url: row.item[1], description: row.item[2], icon: row.item[3] }); } catch { continue; }
        value.prefs ||= {}; const inbox = value.prefs.extensionInbox ||= [];
        if (!inbox.some(saved => saved.id === row.id || saved.item[1] === item[1])) inbox.unshift({ ...row, item });
        applied.push(entry.id);
      } else if (['group', 'move'].includes(entry.kind)) {
        let target; try { target = destination(value, entry); } catch { continue; }
        if (options.groups !== false) {
          if (!Array.isArray(entry.item)) continue;
          let item; try { item = bookmark({ title: entry.item[0], url: entry.item[1], description: entry.item[2], icon: entry.item[3] }); } catch { continue; }
          if (!target.group.items.some(saved => saved[1] === item[1])) target.group.items.push(item);
          applied.push(entry.id);
        }
        if (options.inbox !== false && entry.removeInboxIds?.length) {
          const removed = new Set(entry.removeInboxIds);
          value.prefs ||= {}; value.prefs.extensionInbox = (value.prefs.extensionInbox || []).filter(row => !removed.has(row.id));
        }
      }
    }
    return applied;
  }
  function journalEntry(value, fields) { return { id: crypto.randomUUID(), accountId: requireLogin(value), createdAt: Date.now(), ...fields }; }
  function commit(value, detail, changes) {
    // Persist state and its journal together; roll back our state write if either fails.
    const previous = localStorage.getItem(KEY), serialized = JSON.stringify(value);
    try {
      localStorage.setItem(KEY, serialized);
      if (changes) {
        const owner = requireLogin(value), removed = new Set(changes.removeInboxIds || []);
        const discarded = new Set(changes.removePendingIds || []);
        const entries = pending().filter(entry => entry.accountId !== owner || !discarded.has(entry.id) && (entry.kind !== 'inbox' || !removed.has(entry.entry?.id)));
        if (changes.category) for (const entry of entries) if (entry.accountId === owner && entry.kind === 'inbox' && changes.category.ids.includes(entry.entry?.id)) entry.entry.category = changes.category.value;
        entries.push(...(changes.add || []));
        localStorage.setItem(PENDING_KEY, JSON.stringify(entries));
      }
    } catch {
      // If the journal cannot be saved, do not report a bookmark that could disappear
      // during account hydration. Never roll back another tab's newer state.
      if (localStorage.getItem(KEY) === serialized) try { if (previous === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, previous); } catch {}
      throw new Error('本机存储空间不足，尚未保存，请清理后重试。');
    }
    try { localStorage.setItem(EVENT_KEY, crypto.randomUUID()); } catch { /* Data is already committed. */ }
    root.dispatchEvent(new CustomEvent('shiyu-extension-change', { detail }));
  }
  function save(input) {
    const value = read(), owner = requireLogin(value, input?.accountId);
    const item = bookmark(input); value.prefs ||= {};
    if (input.mode === 'temporary') {
      const inbox = value.prefs.extensionInbox ||= [];
      if (inbox.some(x => x.item[1] === item[1])) return { duplicate: true, label: '稍后整理' };
      const entry = { id: crypto.randomUUID(), item, category: 'archive', createdAt: Date.now() };
      inbox.unshift(entry);
      commit(value, undefined, { add: [journalEntry(value, { kind: 'inbox', entry })] }); return { label: '稍后整理' };
    }
    if (input.mode !== 'group') throw new Error('请选择收藏方式。');
    const { group, label } = destination(value, input);
    const existing = group.items.find(x => x[1] === item[1]);
    if (existing) {
      // Only the authenticated bridge requests confirmation of an existing local
      // item. A duplicate may be a website edit that has not reached the cloud.
      if (input.confirmCloud === true && !pending(owner).some(entry => ['group', 'move'].includes(entry.kind) && entry.spaceId === input.spaceId && entry.sceneId === input.sceneId && entry.groupId === input.groupId && entry.item?.[1] === item[1])) {
        commit(value, undefined, { add: [journalEntry(value, { kind: 'group', item: existing, spaceId: input.spaceId, sceneId: input.sceneId, groupId: input.groupId })] });
      }
      return { duplicate: true, label };
    }
    group.items.push(item); commit(value, undefined, { add: [journalEntry(value, { kind: 'group', item, spaceId: input.spaceId, sceneId: input.sceneId, groupId: input.groupId })] }); return { label };
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
    for (const entry of value.prefs?.extensionInbox || []) add(entry.item, '稍后整理');
    return { total: found.length, items: found.slice(0, 5) };
  }
  function move(input) {
    const value = read(); requireLogin(value, input.accountId);
    const entries = value.prefs?.extensionInbox || [], entry = entries.find(x => x.id === input.id);
    if (!entry) throw new Error('这条待整理收藏已变更，请刷新。');
    const { group, label } = destination(value, input);
    if (!group.items.some(x => x[1] === entry.item[1])) group.items.push(bookmark({ title: entry.item[0], url: entry.item[1], description: entry.item[2], icon: entry.item[3] }));
    value.prefs.extensionInbox = entries.filter(x => x.id !== input.id);
    commit(value, undefined, { removeInboxIds: [entry.id], add: [journalEntry(value, { kind: 'move', item: entry.item, spaceId: input.spaceId, sceneId: input.sceneId, groupId: input.groupId, removeInboxIds: [entry.id], ...(input.confirmCloud === true ? { inboxEntry: entry } : {}) })] }); return { label };
  }
  function recoverPendingMoves(accountId, ids) {
    const value = read(); requireLogin(value, accountId);
    const selected = new Set(ids), recovered = [], replacements = [];
    value.prefs ||= {}; const inbox = value.prefs.extensionInbox ||= [];
    let sidecar; try { sidecar = JSON.parse(localStorage.getItem('shiyu-extension-inbox:' + accountId) || '[]'); } catch { sidecar = []; }
    for (const entry of pending(accountId)) {
      if (!selected.has(entry.id) || entry.kind !== 'move' || !entry.removeInboxIds?.[0] || !Array.isArray(entry.item)) continue;
      // Restore the original local row only after the server confirms that its
      // destination no longer exists. Replacing the failed move prevents a later
      // retry from silently replaying it to a different/old destination.
      const source = entry.inboxEntry || (Array.isArray(sidecar) ? sidecar.find(row => row.id === entry.removeInboxIds[0]) : null) || { category: 'archive', createdAt: entry.createdAt };
      bookmark({ title: entry.item[0], url: entry.item[1], description: entry.item[2], icon: entry.item[3] });
      const row = inbox.find(row => row.id === entry.removeInboxIds[0] || row.item?.[1] === entry.item[1]) || { ...source, id: entry.removeInboxIds[0], item: [...entry.item] };
      if (!inbox.includes(row)) inbox.unshift(row);
      replacements.push(journalEntry(value, { kind: 'inbox', entry: row })); recovered.push(entry.id);
    }
    if (recovered.length) commit(value, undefined, { removePendingIds: recovered, add: replacements });
    return recovered;
  }
  function updateInbox(input) {
    const value=read();requireLogin(value,input.accountId);
    const entries=value.prefs?.extensionInbox||[],ids=new Set(input.ids||[]),selected=entries.filter(x=>ids.has(x.id));
    if(!ids.size||selected.length!==ids.size)throw new Error('所选内容已变更，请重新选择。');
    let label='',journal;
    if(input.action==='archive'){
      const target=destination(value,input);label=target.label;
      const items=selected.map(x=>bookmark({title:x.item[0],url:x.item[1],description:x.item[2],icon:x.item[3]}));
      for(const item of items)if(!target.group.items.some(x=>x[1]===item[1]))target.group.items.push(item);
      value.prefs.extensionInbox=entries.filter(x=>!ids.has(x.id));
      journal={removeInboxIds:[...ids],add:items.map(item=>journalEntry(value,{kind:'group',item,spaceId:input.spaceId,sceneId:input.sceneId,groupId:input.groupId,removeInboxIds:[...ids]}))};
    }else if(input.action==='clear'){value.prefs.extensionInbox=entries.filter(x=>!ids.has(x.id));journal={removeInboxIds:[...ids]};}
    else if(input.action==='category'&&['temporary','archive'].includes(input.category)){
      for(const entry of selected)entry.category=input.category;
      journal={category:{ids:[...ids],value:input.category}};
    }else throw new Error('不支持的整理操作。');
    commit(value,input.action==='category'?{type:'inbox-category'}:undefined,journal);return {count:selected.length,label};
  }
  function seedInboxDemo(){
    const value=read(),id=requireLogin(value);value.prefs||={};value.prefs.laterDemoOwners||={};
    if(value.prefs.laterDemoOwners[id])return;
    const examples=[['哔哩哔哩 · 随手看看','https://www.bilibili.com/','temporary'],['豆瓣 · 电影与阅读','https://www.douban.com/','temporary'],['维基百科 · 随意探索','https://zh.wikipedia.org/','temporary'],['MDN · 开发文档','https://developer.mozilla.org/zh-CN/','archive'],['Figma · 设计工具','https://www.figma.com/','archive'],['GitHub · 开源项目','https://github.com/','archive']];
    const inbox=value.prefs.extensionInbox||=[];
    for(const [title,url,category] of examples)if(!inbox.some(x=>x.item[1]===url))inbox.push({id:crypto.randomUUID(),item:[title,url,'演示网址，可归档或清除'],category,demo:true,createdAt:Date.now()});
    value.prefs.laterDemoOwners[id]=true;commit(value);
  }
  root.ShiyuExtensionStore = Object.freeze({ snapshot, save, search, inbox, move, recoverPendingMoves, updateInbox, seedInboxDemo, pending, applyPending, ackPending, KEY, EVENT_KEY, PENDING_KEY });
})(globalThis);
