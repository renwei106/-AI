/* Reuse the live homepage account component, including its session and actions. */
(()=>{
 const embedded=new URLSearchParams(location.search).get('tool-account')==='embed'&&parent!==window;
 const header=()=>document.querySelector('body>header .header-right');
 function place(){
  let wrap=document.querySelector('.account-menu-wrap');if(!wrap){if(header()){previous();wrap=document.querySelector('.account-menu-wrap')}if(!wrap)return;}
  const host=embedded?document.body:document.body.classList.contains('world-active')?document.querySelector('#world-page .world-header'):document.querySelector('#space-atlas[open] .at-header-actions')||(view==='space'?document.querySelector('.workspace .space-top-actions'):header());
  if(host&&wrap.parentElement!==host)host.append(wrap);
 }
 const previous=updateHeader;updateHeader=function(){const wrap=document.querySelector('.account-menu-wrap'),h=header();if(wrap&&h&&wrap.parentElement!==h)h.append(wrap);previous();place()};
 let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;place();if(embedded)report()})}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','open']});
 let parentOrigin='';try{parentOrigin=new URL(document.referrer).origin}catch{}
 const allowed=parentOrigin==='https://tool.shiyubox.com'||(parentOrigin&&['127.0.0.1','localhost'].includes(new URL(parentOrigin).hostname));
 let last='',lastUser;function report(){if(!allowed)return;const user=signed?accountProfile().id||accountProfile().name:'';if(lastUser!==user){lastUser=user;parent.postMessage({type:'shiyu-account-session'},parentOrigin)}const dialog=!!document.querySelector('dialog[open]'),wrap=document.querySelector('.account-menu-wrap'),menu=wrap?.matches(':hover,:focus-within')||wrap?.classList.contains('menu-pinned'),mode=dialog?'dialog':menu?'menu':'compact';if(last!==mode){last=mode;parent.postMessage({type:'shiyu-account-size',mode},parentOrigin)}}
 if(embedded){window.addEventListener('click',e=>{const logout=e.target.closest('[data-account-signout]');if(!logout||logout.dataset.approved==='true')return;e.preventDefault();e.stopImmediatePropagation();if(allowed)parent.postMessage({type:'shiyu-account-before-logout'},parentOrigin)},true);window.addEventListener('message',e=>{if(!allowed||e.origin!==parentOrigin||e.source!==parent)return;if(e.data?.type==='shiyu-account-dismiss'){document.querySelector('.account-menu-wrap')?.classList.remove('menu-pinned');document.activeElement?.blur();report();return}if(e.data?.type!=='shiyu-account-logout-approved')return;const button=document.querySelector('[data-account-signout]');if(button){button.dataset.approved='true';button.click();delete button.dataset.approved}});document.documentElement.dataset.toolAccount='embed';document.addEventListener('pointerover',report);document.addEventListener('pointerout',()=>setTimeout(report,80));document.addEventListener('focusin',report);document.addEventListener('focusout',report);document.addEventListener('click',()=>setTimeout(report,0));}
 place();if(embedded)report();
})();
