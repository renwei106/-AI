const directions = {
  a: { name: '清雅宋', en: 'QUIET SERIF', index: 'A / 01', mood: '书卷气 · 留白感 · 克制的精致', note: '建议主方向。中文保留宋体的书卷气，英文与数字以细腻衬线呼应。', fonts: 'Noto Serif SC + Cormorant Garamond' },
  b: { name: '温润楷', en: 'HUMANIST KAI', index: 'B / 02', mood: '自然笔意 · 亲近感 · 日常的诗意', note: '更温暖的方向。适合品牌短句和情绪表达，手写感更明显。', fonts: '霞鹜文楷 LXGW WenKai + Lora' },
  c: { name: '疏朗黑', en: 'AIRY SANS', index: 'C / 03', mood: '轻盈骨架 · 清晰感 · 安静的现代', note: '更现代的方向。适合产品化表达，清爽易读，书卷气较弱。', fonts: 'Noto Sans SC Light + Manrope' },
  d: { name: '游风', en: 'CLEARLY HUMAN', index: 'D / 04', mood: '清楚骨架 · 微微笔意 · 克制的个性', note: '笔触方向参考。正式生成必须先通过结构识别规范；当前样张中的“起”是需要在生成阶段拦截的不合格示例，不采用逐字换字体的方式修补。', fonts: '马善政 Ma Shan Zheng + Alegreya' }
};
function selectDirection(key) {
  const choice = directions[key];
  if (!choice) return;
  document.querySelector('#board').dataset.variant = key;
  for (const [id,value] of Object.entries({'direction-index':choice.index,'direction-name':choice.name,'direction-en':choice.en,'direction-mood':choice.mood,'direction-note':choice.note,'font-source':'字样基底：'+choice.fonts})) document.getElementById(id).textContent = value;
  for (const type of ['desktop','mobile']) {const img=document.getElementById(type+'-preview');img.src='captures/'+key+'-'+type+'.png';img.alt=choice.name+'在现有官网'+(type==='desktop'?'桌面':'手机')+'首屏的字体效果';}
  document.querySelectorAll('[data-variant].tabs button, .tabs [data-variant]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.variant===key)));
  const url=new URL(location.href);url.searchParams.set('variant',key);history.replaceState(null,'',url);
}
document.querySelectorAll('.tabs [data-variant]').forEach(button=>button.addEventListener('click',()=>selectDirection(button.dataset.variant)));
document.querySelector('.theme-toggle').addEventListener('click',event=>{const dark=document.querySelector('#board').dataset.dark!=='true';document.querySelector('#board').dataset.dark=String(dark);event.currentTarget.setAttribute('aria-pressed',String(dark));event.currentTarget.textContent=dark?'查看浅色字样':'查看深色字样';});
const params=new URLSearchParams(location.search);selectDirection(params.get('variant')||'a');if(params.has('export'))document.body.classList.add('export');
