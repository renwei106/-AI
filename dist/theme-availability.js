(function(){
 let enabled=new Set(),order=[],installed=false
 const configId=id=>id==='wallfilm'?'projection':id
 const allowed=id=>enabled.has(configId(id))
 const visible=id=>id!=='wallfilm'&&enabled.has(id)
 const selectable=()=>order.filter(id=>visible(id))
 const fallback=()=>enabled.has('base')?'base':selectable()[0]
 function sanitize(){
  const next=fallback();if(!next)return false
  let changed=false
  if(!allowed(prefs.theme)){prefs.theme=next;changed=true}
  for(const value of Object.values(overrides||{}))if(value?.theme&&!allowed(value.theme)){value.theme=next;changed=true}
  if(typeof copyEditingTheme!=='undefined'&&copyEditingTheme&&!allowed(copyEditingTheme))copyEditingTheme=next
  if(changed)persist()
  return changed
 }
 function reorder(selector,key){
  const groups=new Map()
  document.querySelectorAll(selector).forEach(node=>{if(!groups.has(node.parentElement))groups.set(node.parentElement,[]);groups.get(node.parentElement).push(node)})
  const rank=new Map(order.map((id,index)=>[id,index]))
  groups.forEach((nodes,parent)=>{
   const sorted=[...nodes].sort((a,b)=>(rank.get(a.dataset[key])??999)-(rank.get(b.dataset[key])??999)),other=[...parent.children].filter(node=>!nodes.includes(node)),tail=other.filter(node=>node.matches('.brand-origin-link'))
   const desired=[...other.filter(node=>!tail.includes(node)),...sorted,...tail];let cursor=parent.firstElementChild
   for(const node of desired){if(node!==cursor)parent.insertBefore(node,cursor);cursor=node.nextElementSibling}
  })
 }
 function prune(){
  document.querySelectorAll('[data-v2-theme],[data-brand-theme],[data-copy-theme]').forEach(button=>{const id=button.dataset.v2Theme||button.dataset.brandTheme||button.dataset.copyTheme;if(id&&!visible(id))button.remove()})
  reorder('[data-v2-theme]','v2Theme');reorder('[data-brand-theme]','brandTheme');reorder('[data-copy-theme]','copyTheme')
  document.querySelectorAll('.brand-theme-menu .brand-origin-link').forEach(link=>{if(link!==link.parentElement.lastElementChild)link.parentElement.append(link)})
 }
 function install(){
  if(installed)return;installed=true
  const beforeEffective=effective;effective=function(){const value=beforeEffective();return allowed(value.theme)?value:{...value,theme:fallback()}}
  const beforeChangeTheme=changeTheme;changeTheme=function(id){if(!allowed(id)){const ids=selectable(),start=ids.indexOf(configId(id));id=ids[(start+1+ids.length)%ids.length]||fallback()}return beforeChangeTheme(id)}
  const beforeSettings=renderSettings;renderSettings=function(){beforeSettings();prune()}
  const beforeDiscovery=addBrandDiscovery;addBrandDiscovery=function(){beforeDiscovery();prune()}
  const beforeRender=render;render=function(){sanitize();beforeRender();prune()}
  window.addEventListener('click',event=>{const button=event.target.closest?.('[data-action="next-theme"]');if(!button)return;const ids=selectable();if(!ids.length)return;event.preventDefault();event.stopPropagation();const current=configId(effective().theme),index=ids.indexOf(current);changeTheme(ids[(index+1+ids.length)%ids.length])},true)
 }
 async function refresh(){
  try{
   const response=await fetch('/api/shiyu/themes',{cache:'no-store'});if(!response.ok)return
   const data=await response.json(),items=(data.items||[]).filter(item=>THEMES[item.id]);const nextOrder=items.map(item=>item.id),next=new Set(items.filter(item=>item.enabled).map(item=>item.id));if(!next.size)return
   const changed=nextOrder.join('|')!==order.join('|')||[...next].join('|')!==[...enabled].join('|');order=nextOrder;enabled=next;install();if(changed){sanitize();render()}else prune()
  }catch{}
 }
 refresh();window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});setInterval(refresh,15000)
})()
