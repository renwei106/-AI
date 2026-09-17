(function(){
 const retired=new Set(['reading','projection','wallfilm'])
 let order=Object.keys(THEMES).filter(id=>!retired.has(id)),enabled=new Set(order),free=new Set(['base']),member=false,ready=false,installed=false,defaultTheme='base',selection=0,refreshing=null,expiryTimer=null
 const deadlines=new Map(),configId=id=>id==='wallfilm'?'projection':id
 const visible=id=>!retired.has(id)&&enabled.has(id)
 const selectable=()=>order.filter(visible)
 const fallback=()=>defaultTheme
 const allowed=id=>{id=configId(id);return id===fallback()||enabled.has(id)&&(member||free.has(id)||(deadlines.get(id)||0)>performance.now())}
 const beforeChangeTheme=changeTheme
 function sanitize(){
  if(!ready)return false
  let changed=false;const next=fallback()
  if(!allowed(prefs.theme)){prefs.theme=next;changed=true}
  for(const value of Object.values(overrides||{}))if(value?.theme&&!allowed(value.theme)){value.theme=next;changed=true}
  if(typeof copyEditingTheme!=='undefined'&&copyEditingTheme&&!visible(copyEditingTheme))copyEditingTheme=next
  if(changed)persist();return changed
 }
 function reorder(selector,key){
  const groups=new Map();document.querySelectorAll(selector).forEach(node=>{if(!groups.has(node.parentElement))groups.set(node.parentElement,[]);groups.get(node.parentElement).push(node)})
  const rank=new Map(order.map((id,index)=>[id,index]));groups.forEach((nodes,parent)=>{const sorted=[...nodes].sort((a,b)=>(rank.get(a.dataset[key])??999)-(rank.get(b.dataset[key])??999)),other=[...parent.children].filter(node=>!nodes.includes(node)),tail=other.filter(node=>node.matches('.brand-origin-link')),desired=[...other.filter(node=>!tail.includes(node)),...sorted,...tail];let cursor=parent.firstElementChild;for(const node of desired){if(node!==cursor)parent.insertBefore(node,cursor);cursor=node.nextElementSibling}})
 }
 function prune(){
  document.querySelectorAll('[data-v2-theme],[data-brand-theme],[data-copy-theme]').forEach(button=>{const id=button.dataset.v2Theme||button.dataset.brandTheme||button.dataset.copyTheme;if(id&&!visible(id))button.remove()})
  reorder('[data-v2-theme]','v2Theme');reorder('[data-brand-theme]','brandTheme');reorder('[data-copy-theme]','copyTheme')
  document.querySelectorAll('[data-brand-theme]').forEach(button=>{const premium=ready&&!free.has(button.dataset.brandTheme);button.querySelector('.theme-member-badge')?.remove();if(premium){const badge=document.createElement('small');badge.className='theme-member-badge';badge.textContent='会员';badge.setAttribute('aria-label','会员主题');badge.style.cssText='font-size:10px;line-height:1.5;padding:1px 5px;border:1px solid currentColor;border-radius:4px;opacity:.8;margin-left:auto;white-space:nowrap';button.querySelector('b')?.after(badge)}})
 }
 function schedule(){clearTimeout(expiryTimer);if(member)return;const pending=[...deadlines.values()].filter(t=>t>performance.now());if(pending.length)expiryTimer=setTimeout(()=>{if(sanitize()){render();toast('主题预览已结束，已返回默认主题')}schedule()},Math.max(0,Math.min(...pending)-performance.now())+20)}
 function apply(data){
  const items=data.items.filter(x=>THEMES[x.id]&&!retired.has(x.id));order=items.map(x=>x.id);enabled=new Set(items.filter(x=>x.enabled).map(x=>x.id));free=new Set(items.filter(x=>!x.memberOnly).map(x=>x.id));member=data.member===true;defaultTheme=THEMES[data.fallback]?data.fallback:'base';ready=true
  for(const [id,expiresAt]of Object.entries(data.previews||{})){const deadline=data.requestStarted+Math.max(0,expiresAt-data.serverTime);deadlines.set(id,Math.min(deadlines.get(id)??Infinity,deadline))}schedule()
 }
 async function fetchAccess(theme){const requestStarted=performance.now();const r=await fetch('/api/shiyu/theme-access'+(theme?'/preview':''),{cache:'no-store',...(theme?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({theme})}:{})});const data=await r.json();if(!r.ok)throw Error(data.message||'主题权限暂时无法校验');data.requestStarted=requestStarted;return data}
 async function select(id){
  id=configId(id);const ticket=++selection
  if(ready&&visible(id)&&(member||free.has(id))){beforeChangeTheme(id);prune();return}
  try{const data=await fetchAccess(id);if(ticket!==selection)return;apply(data);if(!allowed(id))throw Error('该主题的 30 秒预览已结束');beforeChangeTheme(id);prune();if(!member&&!free.has(id))toast('会员主题可预览 30 秒')}
  catch(error){if(ticket!==selection)return;toast(error.message);if(sanitize())render()}
 }
 function install(){
  if(installed)return;installed=true
  const beforeEffective=effective;effective=function(){const value=beforeEffective();return allowed(value.theme)?value:{...value,theme:fallback()}}
  changeTheme=function(id){if(ready&&(member||free.has(configId(id)))&&visible(configId(id))){++selection;return beforeChangeTheme(configId(id))}return select(id)}
  const beforeSettings=renderSettings;renderSettings=function(){beforeSettings();prune()}
  const beforeDiscovery=addBrandDiscovery;addBrandDiscovery=function(){beforeDiscovery();prune()}
  const beforeRender=render;render=function(){sanitize();beforeRender();prune()}
  window.addEventListener('click',event=>{
   const manual=event.target.closest?.('[data-brand-theme]'),cycle=event.target.closest?.('[data-action="next-theme"]');if(manual||cycle){event.preventDefault();event.stopImmediatePropagation();if(manual){void select(manual.dataset.brandTheme);return}const ids=selectable().filter(id=>free.has(id));if(!ready||!ids.length)return;const index=ids.indexOf(configId(effective().theme));changeTheme(ids[(index+1)%ids.length]);return}
   if(event.target.closest?.('[data-account-signout]')){member=false;deadlines.clear();void fetch('/api/shiyu/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).then(()=>refresh());setTimeout(()=>{if(sanitize())render()},0)}
  },true)
 }
 async function refresh(){
  if(refreshing)return refreshing
  refreshing=(async()=>{try{const old=JSON.stringify([order,[...enabled],[...free],member]),data=await fetchAccess();apply(data);const changed=sanitize();if(changed||old!==JSON.stringify([order,[...enabled],[...free],member]))render();else prune()}catch{member=false;if(sanitize())render()}finally{refreshing=null}})();return refreshing
 }
 install();prune();void refresh();window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(sanitize())render();void refresh()}});setInterval(()=>{if(!document.hidden)void refresh()},5000)
})()
