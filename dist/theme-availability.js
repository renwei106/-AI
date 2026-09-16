(function(){
 let enabled=new Set(),installed=false
 const configId=id=>id==='wallfilm'?'projection':id
 const allowed=id=>enabled.has(configId(id))
 const visible=id=>id!=='wallfilm'&&enabled.has(id)
 const fallback=()=>enabled.has('base')?'base':[...enabled][0]
 function sanitize(){
  const next=fallback();if(!next)return false
  let changed=false
  if(!allowed(prefs.theme)){prefs.theme=next;changed=true}
  for(const value of Object.values(overrides||{}))if(value?.theme&&!allowed(value.theme)){value.theme=next;changed=true}
  if(typeof copyEditingTheme!=='undefined'&&copyEditingTheme&&!allowed(copyEditingTheme))copyEditingTheme=next
  if(changed)persist()
  return changed
 }
 function prune(){document.querySelectorAll('[data-v2-theme],[data-brand-theme],[data-copy-theme]').forEach(button=>{const id=button.dataset.v2Theme||button.dataset.brandTheme||button.dataset.copyTheme;if(id&&!visible(id))button.remove()})}
 function install(){
  if(installed)return;installed=true
  const beforeEffective=effective;effective=function(){const value=beforeEffective();return allowed(value.theme)?value:{...value,theme:fallback()}}
  const beforeChangeTheme=changeTheme;changeTheme=function(id){if(!allowed(id)){const ids=Object.keys(THEMES),start=ids.indexOf(id);id=ids.find((candidate,index)=>index>start&&visible(candidate))||ids.find(visible)||fallback()}return beforeChangeTheme(id)}
  const beforeSettings=renderSettings;renderSettings=function(){beforeSettings();prune()}
  const beforeDiscovery=addBrandDiscovery;addBrandDiscovery=function(){beforeDiscovery();prune()}
  const beforeRender=render;render=function(){sanitize();beforeRender();prune()}
 }
 async function refresh(){
  try{
   const response=await fetch('/api/shiyu/themes',{cache:'no-store'});if(!response.ok)return
   const data=await response.json(),next=new Set((data.items||[]).filter(item=>item.enabled&&THEMES[item.id]).map(item=>item.id));if(!next.size)return
   const changed=[...next].join('|')!==[...enabled].join('|');enabled=next;install();if(changed){sanitize();render()}else prune()
  }catch{}
 }
 refresh();window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});setInterval(refresh,15000)
})()
