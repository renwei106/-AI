/* Published feature availability for the existing global settings and desktop companion. */
// Preserve the established palette controls while grouping color types.
(()=>{
 const beforeColors=colorChoices;
 colorChoices=function(value,local=false){const holder=document.createElement('div');holder.innerHTML=beforeColors(value,local);const list=holder.querySelector('.named-colors');if(!list)return holder.innerHTML;const tiles=[...list.children],custom=list.querySelector('.custom-color'),rainbow='conic-gradient(from 30deg,#b28bbf,#8098be,#78a993,#c2b97e,#c18b79,#b28bbf)';
  if(custom){const sample=custom.querySelector('.color-sample'),badge=custom.querySelector('.custom-palette-badge');sample.style.background=rainbow;sample.querySelector('i').style.removeProperty('color');const saved=local?prefs.spacePreferences?.[spaceId]?.customColor:prefs.customColor;const chosen=!PALETTES.some(([v])=>v===value)?value:saved;if(badge){badge.style.background=chosen||rainbow;badge.setAttribute('aria-label',chosen?'已选自定义颜色':'自定义色板');}}
  list.replaceChildren();for(const [name,gradient] of [['纯色',false],['渐变',true]]){const group=tiles.filter(tile=>!tile.classList.contains('custom-color')&&tile.style.getPropertyValue('--swatch').trim().startsWith('linear-gradient(')===gradient);if(!group.length&&(gradient||!custom))continue;const heading=document.createElement('small');heading.className='palette-group-title';heading.textContent=name;list.append(heading,...group);if(!gradient&&custom)list.append(custom);}return holder.innerHTML;
 };
 const beforeSettings=renderSettings;
 renderSettings=function(){const dialogs=[...document.querySelectorAll('#settings[open],#display-scope-dialog[open]')].map(d=>[d,d.scrollTop]);beforeSettings();for(const [d,top] of dialogs)d.scrollTop=top;};
})();
(()=>{
 'use strict';
 let config=null,loading=null;
 const escapeId=value=>String(value||'');
 const access=id=>config?.access?.[id]!==false;
 const category=id=>access(id)&&config?.personalization?.[id]?.enabled!==false;
 const option=(id,value)=>{const key=escapeId(value);const choices=config?.personalization?.[id]?.options;const selected=id==='colors'?Object.keys(choices||{}).find(item=>item===key||choices[item]?.value===key)||(key==='custom'||/^#[0-9a-f]{6}$/i.test(key)?'custom':key):key;return category(id)&&choices?.[selected]?.enabled!==false};
 const label=(key,fallback)=>config?.optionNames?.[key]||fallback;
 const optionLabel=(id,value,fallback)=>config?.personalization?.[id]?.options?.[id==='colors'?colorKey(escapeId(value)):escapeId(value)]?.name||fallback;
 const order=id=>config?.personalization?.[id]?.order||Object.keys(config?.personalization?.[id]?.options||{});
 const first=(id,fallback)=>{const choices=config?.personalization?.[id]?.options||{},key=order(id).find(key=>key!=='custom'&&choices[key]?.enabled);return id==='colors'?(choices[key]?.value||key||fallback):(key||fallback)};
 const colorKey=value=>Object.keys(config?.personalization?.colors?.options||{}).find(id=>id===value||config.personalization.colors.options[id]?.value===value)||'custom';
 const applyColorCatalog=()=>{if(!config?.personalization?.colors||typeof PALETTES==='undefined')return;const choices=config.personalization.colors.options;PALETTES.splice(0,PALETTES.length,...order('colors').filter(id=>id!=='custom'&&choices[id]?.enabled).map(id=>[choices[id].value||id,choices[id].name]));};
 const reorder=(nodes,ids,getId)=>{const groups=new Map();nodes.forEach(node=>{const parent=node.parentElement;if(parent){if(!groups.has(parent))groups.set(parent,[]);groups.get(parent).push(node)}});const ranks=new Map(ids.map((id,index)=>[id,index]));groups.forEach((items,parent)=>{const anchor=items[items.length-1].nextSibling,sorted=[...items].sort((a,b)=>(ranks.get(getId(a))??999)-(ranks.get(getId(b))??999));for(const item of sorted)parent.insertBefore(item,anchor)});};
 const originalEffective=effective;
 effective=function(){
  const result={...originalEffective()};
  if(!option('themes',result.theme))result.theme=!category('themes')||option('themes','base')?'base':first('themes','base');
  const matching=config?.personalization?.colors?.options?.[result.color];if(matching?.value)result.color=matching.value;
  if(!option('colors',result.color))result.color=category('colors')?first('colors','#48614c'):'#48614c';
  if(!option('fonts',result.font))result.font=category('fonts')?first('fonts','youfeng'):'youfeng';
  return result;
 };
 const originalChangeTheme=changeTheme;
 changeTheme=function(id){if(!option('themes',id))return;return originalChangeTheme(id)};
 const oldPanel=settingsPanel;
 settingsPanel=function(p){const selected=effective();return oldPanel({...p,theme:selected.theme,color:selected.color,font:selected.font})};
 function decorate(root){
  if(!root)return;
  root.querySelectorAll('[data-v2-theme],[data-brand-theme]').forEach(node=>{
   const id=node.dataset.v2Theme||node.dataset.brandTheme;
   if(!option('themes',id)){node.remove();return}
   const name=optionLabel('themes',id,'');if(name){const title=node.querySelector('.theme-tile-label b')||node.querySelector('b');if(title){const last=title.lastChild;if(last?.nodeType===Node.TEXT_NODE)last.textContent=name;else title.append(document.createTextNode(name))}}
  });
  root.querySelectorAll('[data-pref="color"],[data-space-color]').forEach(node=>{
   const id=node.dataset.value||node.dataset.spaceColor;
   if(!option('colors',id)){node.remove();return}
   const name=optionLabel('colors',id,'');if(name){node.title=name;node.setAttribute('aria-label',name);const title=node.querySelector('b');if(title)title.textContent=name}
  });
  root.querySelectorAll('[data-custom-color]').forEach(node=>{if(!option('colors','custom'))node.remove();else{const title=node.querySelector('b');if(title)title.textContent=optionLabel('colors','custom','自定义配色')}});
  root.querySelectorAll('[data-pref="font"],[data-space-font]').forEach(node=>{
   const id=node.dataset.value||node.dataset.spaceFont;
   if(!option('fonts',id)){node.remove();return}
   const name=optionLabel('fonts',id,'');const title=node.querySelector('small');if(name&&title){const mark=title.querySelector('i');title.textContent=name;if(mark)title.append(mark)}
  });
  reorder([...root.querySelectorAll('[data-v2-theme],[data-brand-theme]')],order('themes'),node=>node.dataset.v2Theme||node.dataset.brandTheme);
  reorder([...root.querySelectorAll('[data-pref="font"],[data-space-font]')],order('fonts'),node=>node.dataset.value||node.dataset.spaceFont);
  const colorNodes=[...root.querySelectorAll('[data-pref="color"],[data-space-color]')];for(const gradient of [false,true])reorder(colorNodes.filter(node=>(node.dataset.value||node.dataset.spaceColor||'').startsWith('linear-gradient(')===gradient),order('colors'),node=>colorKey(node.dataset.value||node.dataset.spaceColor));
 }
 const oldSettings=renderSettings;
 renderSettings=function(){
  const tabs={themes:'themes',colors:'colors',type:'fonts','desktop-pet':'pet'};
  if(tabs[settingsTab]&&!category(tabs[settingsTab]))settingsTab='layout';
  oldSettings();
  const root=document.querySelector('#settings');if(!root)return;
  for(const [tab,id]of Object.entries(tabs))if(!category(id))root.querySelector(`[data-settings-tab="${tab}"]`)?.remove();
  decorate(root);
 };
 const oldScopeDialog=scopeDialog;
 scopeDialog=function(...args){const result=oldScopeDialog(...args);decorate(document.querySelector('#display-scope-dialog'));return result};
 const oldDiscovery=addBrandDiscovery;
 addBrandDiscovery=function(...args){const result=oldDiscovery(...args);decorate(document);return result};
 const oldRender=render;
 render=function(...args){const result=oldRender(...args);decorate(document);return result};
 document.addEventListener('click',event=>{
  const node=event.target.closest?.('[data-v2-theme],[data-brand-theme],[data-pref="color"],[data-space-color],[data-custom-color],.custom-color-confirm,[data-pref="font"],[data-space-font],[data-pet-pref="skin"]');
  if(!node)return;
  const id=node.dataset.v2Theme||node.dataset.brandTheme||node.dataset.value||node.dataset.spaceFont||node.dataset.spaceColor||(node.matches('[data-custom-color],.custom-color-confirm')?'custom':'');
  const group=node.dataset.v2Theme||node.dataset.brandTheme?'themes':node.dataset.petPref?'pet':node.dataset.spaceFont||node.dataset.pref==='font'?'fonts':'colors';
  if(option(group,id))return;
  event.preventDefault();event.stopImmediatePropagation();
 },true);
 async function refresh(){
  if(loading)return loading;
  const initial=window.ShiyuThemeColors?.takeInitialRequest();
  loading=(initial||fetch('/api/shiyu/operations',{credentials:'include',cache:'no-store'}).then(async response=>{if(!response.ok)throw Error('配置加载失败');return response.json()})).then(raw=>{
   if(!raw)throw Error('配置加载失败');window.ShiyuThemeColors?.update(raw);const next=window.ShiyuI18n?.operations(raw)||raw;
   const incoming={onboarding:next.onboarding||{enabled:false},world:next.world||{},access:next.access||{},personalization:next.personalization||{},petActions:next.petActions||{},petTiming:next.petTiming||{},optionNames:next.optionNames||{}};
   if(JSON.stringify(config)===JSON.stringify(incoming))return;
   config=incoming;
   applyColorCatalog();
   window.dispatchEvent(new Event('shiyu-feature-config'));
   window.dispatchEvent(new Event('shiyu-pet-context'));
   if(typeof render==='function')render();
   const settings=document.querySelector('#settings');if(settings?.open)renderSettings();
  }).catch(()=>{if(typeof apply==='function')apply()}).finally(()=>{window.ShiyuThemeColors?.release();loading=null});
  return loading;
 }
 window.ShiyuFeatureConfig=Object.freeze({onboarding:()=>config?.onboarding,worldAvailable:()=>config?.world?.enabled===true&&config?.world?.eligible!==false&&access('world'),allowed:access,category,option,label,optionLabel,order,petAction:id=>config?.petActions?.[id]!==false,petTiming:()=>config?.petTiming,refresh});
 setInterval(()=>{if(!document.hidden)void refresh()},30000);
 window.addEventListener('shiyu-account-state',()=>void refresh());
 window.addEventListener('focus',()=>void refresh());
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refresh()});
 void refresh();
})();
