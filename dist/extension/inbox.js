'use strict';
const store = window.ShiyuExtensionStore, $ = selector => document.querySelector(selector);
let state, selected;
function node(tag, text, cls) { const element = document.createElement(tag); element.textContent = text; if (cls) element.className = cls; return element; }
function draw() {
  try {
    state = store.snapshot(); const list = $('#inbox'); list.replaceChildren();
    if (!state.signed) { const empty = node('div', '', 'empty'); empty.append(node('p', '登录拾隅后，查看和整理稍后再归类的收藏。')); const login = node('a', '登录拾隅 ↗', 'primary'); login.href = '/?extension=login'; empty.append(login); list.append(empty); $('#count').textContent = ''; return; }
    const entries = store.inbox(); $('#count').textContent = entries.length + ' 条待整理';
    if (!entries.length) { list.append(node('div', '这里还没有内容。浏览网页时，点击拾隅插件，把喜欢的先收下来。', 'empty')); return; }
    for (const entry of entries) {
      const card = node('article', '', 'inbox-card'), copy = node('div', '', 'inbox-copy');
      const title = node('a', entry.item[0] + ' ↗');
      try { const url = new URL(entry.item[1]); if (['http:', 'https:'].includes(url.protocol)) title.href = url.href; } catch {}
      title.target = '_blank'; title.rel = 'noopener noreferrer';
      copy.append(title, node('small', entry.item[1])); if (entry.item[2]) copy.append(node('p', entry.item[2]));
      const move = node('button', '归入分组', 'organize'); move.onclick = () => openMove(entry);
      card.append(copy, move); list.append(card);
    }
  } catch (error) { $('#status').textContent = error.message; }
}
function options(select, values) { select.replaceChildren(...values.map(x => new Option(x.name, x.id))); }
function scenes() { options($('#scene'), state.spaces.find(x => x.id === $('#space').value)?.scenes || []); groups(); }
function groups() { options($('#group'), state.spaces.find(x => x.id === $('#space').value)?.scenes.find(x => x.id === $('#scene').value)?.groups || []); }
function openMove(entry) {
  state = store.snapshot(); if (!state.signed) { draw(); return; }
  selected = { id: entry.id, accountId: state.accountId }; $('#move-title').textContent = entry.item[0]; $('#move-error').textContent = '';
  options($('#space'), state.spaces); scenes(); $('#move-dialog').showModal();
}
$('#space').onchange = scenes; $('#scene').onchange = groups; $('#cancel').onclick = () => $('#move-dialog').close();
$('#move-form').onsubmit = event => {
  event.preventDefault();
  try { const result = store.move({ ...selected, spaceId: $('#space').value, sceneId: $('#scene').value, groupId: $('#group').value }); $('#move-dialog').close(); draw(); $('#status').textContent = '已归入「' + result.label + '」。'; }
  catch (error) { $('#move-error').textContent = error.message; }
};
addEventListener('storage', event => { if (event.key === store.KEY) { if ($('#move-dialog').open) $('#move-dialog').close(); draw(); } });
addEventListener('focus', draw); draw();
