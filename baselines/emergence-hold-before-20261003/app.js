import { SCENES, defaultsFor, fieldsFor, sanitize } from './scenes.js';
import { EmergenceEngine } from './engine.js';

const $ = selector => document.querySelector(selector);
const ICONS = {
  sliders: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2.5" fill="var(--bg)"/><circle cx="15" cy="17" r="2.5" fill="var(--bg)"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  restart: '<path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/>',
  pause: '<path d="M9 6v12M15 6v12"/>',
  play: '<path d="m9 5 10 7-10 7Z"/>',
  moon: '<path d="M20 14a8 8 0 0 1-10-10 8.2 8.2 0 1 0 10 10Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1"/>',
  tune: '<path d="M5 3v18M12 3v18M19 3v18"/><path d="M2 8h6M9 16h6M16 7h6"/>',
  chevron: '<path d="m7 10 5 5 5-5"/>',
  birds: '<path d="m3 15 8-11-2 10Zm10 7 6-13 2 9Z"/><path d="m7 21 3-5 1 5"/>',
  fish: '<path d="M4 12c5-8 11-7 15 0-4 7-10 8-15 0Z"/><path d="m19 12 4-4v8Z"/><circle cx="8" cy="11" r=".7" fill="currentColor"/>',
  water: '<path d="M12 3c-3 5-7 8-7 12a7 7 0 0 0 14 0c0-4-4-7-7-12Z"/><path d="M8 15a4 4 0 0 0 3 4"/>',
  cosmos: '<ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(-35 12 12)"/><circle cx="12" cy="12" r="6"/><circle cx="20" cy="6" r="1.5" fill="currentColor" stroke="none"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
document.querySelectorAll('[data-icon]').forEach(node => node.innerHTML = icon(node.dataset.icon));

const STORAGE = 'shiyu-emergence-prototype-v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(STORAGE) || '{}') || {}; } catch {}
let sceneId = Object.hasOwn(SCENES, saved.scene) ? saved.scene : 'birds';
let dark = typeof saved.dark === 'boolean' ? saved.dark : false;
const configs = Object.fromEntries(Object.keys(SCENES).map(id => [id, sanitize(id, saved.configs?.[id])]));
let storageAvailable = true, saveTimer, toastTimer;

// Use the existing project's color source. The preview server serves that exact
// bootstrap from dist/index.html, including the public backend color catalog.
function resolveThemeColor() {
  if (typeof window.resolveThemeColor === 'function') return window.resolveThemeColor();
  let preference;
  try { preference = JSON.parse(localStorage.getItem('yiyu-prototype-v1') || '{}')?.prefs?.color; } catch {}
  return window.ShiyuThemeColors.resolve(preference);
}
let color = resolveThemeColor();
const engine = new EmergenceEngine($('#world'), { scene: sceneId, config: configs[sceneId], color, dark });
// Read-only diagnostics and the engine are confined to this local prototype.
window.__emergence = { engine, snapshot: () => engine.snapshot(), configs, scenes: SCENES };

function status(text) { $('#save-status').innerHTML = `<i></i>${text}`; }
function persist() {
  clearTimeout(saveTimer);
  try { localStorage.setItem(STORAGE, JSON.stringify({ scene: sceneId, dark, configs })); storageAvailable = true; status('已保存在此浏览器'); }
  catch { storageAvailable = false; status('仅本次有效 · 存储不可用'); }
}
function scheduleSave() { status('正在保存…'); clearTimeout(saveTimer); saveTimer = setTimeout(persist, 180); }
function toast(text) { clearTimeout(toastTimer); $('#toast').textContent = text; $('#toast').classList.add('visible'); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2400); }

function applyAppearance() {
  document.body.dataset.dark = String(dark);
  document.documentElement.style.setProperty('--accent', color);
  document.documentElement.style.setProperty('--bg', `color-mix(in srgb, ${color} ${dark ? '10%' : '5%'}, ${dark ? '#111a17' : '#f9faf5'})`);
  for (const button of [$('#appearance'), $('#panel-appearance')].filter(Boolean)) {
    button.innerHTML = icon(dark ? 'sun' : 'moon');
    button.setAttribute('aria-label', dark ? '切换浅色外观' : '切换深色外观'); button.title = dark ? '切换浅色外观' : '切换深色外观';
  }
  engine.setPalette(color, dark);
}

function valueText(field, value) {
  if (field.key === 'predators' && value === 0) return '关闭';
  if (field.unit === '×') return `${value.toFixed(2).replace(/0$/, '')}×`;
  return `${Number(value.toFixed(2))}${field.unit ? ' ' + field.unit : ''}`;
}
function fieldHTML(field) {
  const value = configs[sceneId][field.key], id = `control-${field.key}`;
  if (field.type === 'choice') return `<div class="control choice-control"><div class="control-heading"><span id="label-${field.key}" class="control-label">${field.label}</span></div><div class="segments" role="group" aria-labelledby="label-${field.key}">${field.options.map(([key, label]) => `<button data-field="${field.key}" data-value="${key}" aria-pressed="${value === key}">${label}</button>`).join('')}</div></div>`;
  const fill = (value - field.min) / (field.max - field.min) * 100;
  const hints = field.hint || (field.key === 'count' || field.key === 'predators' ? ' ' : '');
  return `<div class="control"><div class="control-heading"><label for="${id}">${field.label}</label><output class="value" id="value-${field.key}" for="${id}">${valueText(field, value)}</output></div><input id="${id}" class="range" type="range" data-field="${field.key}" min="${field.min}" max="${field.max}" step="${field.step}" value="${value}" aria-valuetext="${valueText(field, value)}" style="--fill:${fill}%"${hints ? ` aria-describedby="hint-${field.key}"` : ''}><div class="range-ends" aria-hidden="true"><span>${field.key === 'speed' ? '舒缓' : field.min === 0 ? '无' : field.min}</span><span>${field.key === 'speed' ? '轻快' : field.max}</span></div>${hints ? `<p class="control-hint" id="hint-${field.key}">${hints}</p>` : ''}</div>`;
}
function updatePointerHint() {
  const mode = configs[sceneId].pointer;
  $('#pointer-hint').textContent = mode === 'none' ? '让这一刻，自然发生' : mode === 'repel' ? `移动鼠标，轻轻拨动${SCENES[sceneId].name}` : '移动鼠标，让微小的世界向你靠近';
}
function updatePopulation() {
  const hint = $('#hint-count'); if (!hint) return;
  const c = configs[sceneId];
  hint.textContent = SCENES[sceneId].lifecycle ? `当前 ${engine.particles.length} · 起始 ${c.count} · 上限 ${c.populationCap}` : '';
  hint.hidden = !hint.textContent;
  const predatorHint = $('#hint-predators');
  if (predatorHint) predatorHint.textContent = `当前 ${engine.predators.length} · 起始 ${c.predators} · 上限 ${c.predatorCap}；接触时捕获。`;
  if (SCENES[sceneId].lifecycle) {
    const birth = c.breeding !== 'yes' ? '群体繁衍已关闭' : !engine.particles.length ? '群体已消失，等待补充或重新播种' : engine.particles.length >= c.populationCap ? '群体已达数量上限' : `下次繁衍约 ${Math.max(0, Math.ceil(c.birthInterval - engine.birthClock))} 秒`;
    const predator = !engine.predators.length ? '加入捕食者后可开始繁衍' : c.predatorBreeding !== 'yes' ? '捕食者繁衍已关闭' : engine.predators.length >= c.predatorCap ? '捕食者已达数量上限' : engine.predatorBirthClock < c.predatorBirthInterval ? `捕食者最早 ${Math.ceil(c.predatorBirthInterval - engine.predatorBirthClock)} 秒后繁衍` : '捕食者等待进食条件满足';
    $('#population-status').textContent = `已繁衍 ${engine.born} 个个体、${engine.predatorBorn} 只捕食者。${birth}；${predator}。`;
  }
}
function renderScene() {
  const scene = SCENES[sceneId];
  $('#scene-options').innerHTML = Object.values(SCENES).map(item => `<button class="scene-choice" data-scene="${item.id}" aria-pressed="${sceneId === item.id}" aria-label="${item.name}场景"><span class="scene-glyph">${icon(item.id)}</span><span class="choice-text"><strong>${item.name}</strong><small>${item.en}</small></span><i class="selected-dot"></i></button>`).join('');
  $('#scene-en').textContent = scene.en; $('#scene-title').textContent = scene.title; $('#scene-description').textContent = scene.description;
  $('#scene-name').textContent = scene.name; $('#scene-number').textContent = String(Object.keys(SCENES).indexOf(sceneId) + 1).padStart(2, '0'); $('#scene-subtitle').textContent = scene.subtitle;
  $('#rules').innerHTML = scene.rules.map((rule, i) => `<li><span>0${i + 1}</span>${rule}</li>`).join('');
  $('#basic-controls').innerHTML = scene.basic.map(fieldHTML).join(''); $('#advanced-controls').innerHTML = scene.advanced.map(fieldHTML).join(''); $('#model-note').textContent = scene.note;
  $('#lifecycle').hidden = !scene.lifecycle;
  $('#lifecycle-controls').innerHTML = (scene.lifecycle || []).map(group => `<section class="lifecycle-group"><h4>${group.title}</h4>${group.fields.map(fieldHTML).join('')}</section>`).join('');
  $('#world').setAttribute('aria-label', `${scene.name}动态场景。${scene.rules.join('；')}。`);
  updatePointerHint(); updatePopulation();
}
function setScene(id) {
  if (!Object.hasOwn(SCENES, id) || id === sceneId) return;
  sceneId = id; engine.setScene(id, configs[id]); renderScene(); persist();
  $(`[data-scene="${id}"]`).focus({ preventScroll: true });
}
function updateField(key, value) {
  const field = fieldsFor(sceneId).find(item => item.key === key); if (!field) return;
  configs[sceneId] = sanitize(sceneId, { ...configs[sceneId], [key]: value });
  engine.setConfig(configs[sceneId]);
  if (field.type === 'range') {
    const range = $(`#control-${key}`), safeValue = configs[sceneId][key];
    range.value = safeValue; range.style.setProperty('--fill', `${(safeValue - field.min) / (field.max - field.min) * 100}%`);
    range.setAttribute('aria-valuetext', valueText(field, safeValue)); $(`#value-${key}`).textContent = valueText(field, safeValue);
  } else document.querySelectorAll(`button[data-field="${key}"]`).forEach(button => button.setAttribute('aria-pressed', String(button.dataset.value === configs[sceneId][key])));
  // A population ceiling cannot be below its configured starting population.
  for (const dependent of fieldsFor(sceneId).filter(item => item.key === 'populationCap' || item.key === 'predatorCap')) {
    const range = $(`#control-${dependent.key}`), safeValue = configs[sceneId][dependent.key];
    range.value = safeValue; range.style.setProperty('--fill', `${(safeValue - dependent.min) / (dependent.max - dependent.min) * 100}%`);
    range.setAttribute('aria-valuetext', valueText(dependent, safeValue)); $(`#value-${dependent.key}`).textContent = valueText(dependent, safeValue);
  }
  updatePointerHint(); updatePopulation(); scheduleSave();
}

$('#settings').addEventListener('input', event => { if (event.target.matches('input[data-field]')) updateField(event.target.dataset.field, Number(event.target.value)); });
$('#settings').addEventListener('click', event => {
  const scene = event.target.closest('[data-scene]'); if (scene) setScene(scene.dataset.scene);
  const option = event.target.closest('button[data-field]'); if (option) updateField(option.dataset.field, option.dataset.value);
});
let panelOpen = true;
function setPanel(open, focus = true) {
  panelOpen = open; $('#settings').classList.toggle('open', open); $('#settings').inert = !open;
  document.body.classList.toggle('panel-open', open); $('#open-panel').setAttribute('aria-expanded', String(open));
  engine.pointer.active = false;
  if (focus) (open ? $('#close-panel') : $('#open-panel')).focus({ preventScroll: true });
}
$('#open-panel').onclick = () => setPanel(true); $('#close-panel').onclick = () => setPanel(false);
const appearanceToggle = () => { dark = !dark; applyAppearance(); persist(); };
$('#appearance').onclick = appearanceToggle;
const headerActions = document.createElement('div'); headerActions.style.display = 'flex'; headerActions.style.gap = '2px';
const panelAppearance = document.createElement('button'); panelAppearance.id = 'panel-appearance'; panelAppearance.className = 'icon-button'; panelAppearance.onclick = appearanceToggle;
$('#close-panel').before(headerActions); headerActions.append(panelAppearance, $('#close-panel'));
function renderPlayback() {
  $('#pause').innerHTML = icon(engine.paused ? 'play' : 'pause'); $('#pause').setAttribute('aria-label', engine.paused ? '继续动画' : '暂停动画'); $('#pause').title = engine.paused ? '继续' : '暂停';
  $('#live-label').textContent = engine.paused ? '停在这一刻' : '正在自然演化';
}
$('#pause').onclick = () => { engine.setPaused(!engine.paused); renderPlayback(); };
$('#restart').onclick = () => { engine.reset(); updatePopulation(); toast('已重新播种，参数保持不变'); };
$('#reset').onclick = () => { configs[sceneId] = defaultsFor(sceneId); engine.setScene(sceneId, configs[sceneId]); renderScene(); persist(); toast(`已恢复${SCENES[sceneId].name}的默认设置`); };
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && panelOpen) { setPanel(false); return; }
  if (event.code === 'Space' && !event.target.closest('button,input,summary,select,textarea,[contenteditable]')) { event.preventDefault(); $('#pause').click(); }
});
document.addEventListener('pointermove', event => {
  if (event.target !== $('#world')) { engine.pointer.active = false; return; }
  engine.setPointer(event.clientX, event.clientY);
});
document.addEventListener('pointerout', event => { if (!event.relatedTarget) engine.pointer.active = false; });
document.addEventListener('pointerup', event => { if (event.pointerType !== 'mouse') engine.pointer.active = false; });
window.addEventListener('blur', () => engine.pointer.active = false);
document.addEventListener('visibilitychange', () => { if (document.hidden) { engine.pointer.active = false; persist(); } });
window.addEventListener('pagehide', persist);
setInterval(updatePopulation, 500);

renderScene(); applyAppearance(); renderPlayback(); setPanel(innerWidth > 700, false); persist();
window.ShiyuThemeColors.takeInitialRequest()?.then(() => { color = resolveThemeColor(); applyAppearance(); });
