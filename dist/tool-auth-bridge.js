(() => {
  'use strict';
  const params=new URLSearchParams(location.search);
  const mode=params.get('tool-login');
  if(mode!=='1'&&mode!=='embed')return;
  const environment=window.ShiyuEnvironment?.resolve();
  if(!environment)return;
  const embedded=mode==='embed'&&window.parent!==window;
  let parentOrigin='';
  if(embedded){try{parentOrigin=new URL(document.referrer).origin}catch{}if(!environment.allows('tool',parentOrigin))return;}
  const target=embedded?null:environment.toolReturn(params.get('return')||'');
  if(!embedded&&!target)return;
  if(embedded){
    const style=document.createElement('style');
    style.textContent='body> :not(#login){visibility:hidden!important}html,body{background:transparent!important}#login{visibility:visible!important}';
    document.head.append(style);
  }
  let returning=false;
  const notify=(type,authenticated=false)=>window.parent.postMessage({type,authenticated},parentOrigin);
  const back=authenticated=>{if(returning)return;returning=true;if(embedded)notify('shiyu-login-close',authenticated);else location.replace(target);};
  const session=async()=>{try{const response=await fetch('/api/shiyu/auth/session',{credentials:'same-origin',cache:'no-store'});if(!response.ok)return false;return Boolean((await response.json()).authenticated);}catch{return false;}};
  const start=async()=>{
    const dialog=document.querySelector('#login');
    if(!dialog||typeof window.show!=='function'||typeof window.renderAccountLogin!=='function'){requestAnimationFrame(start);return;}
    dialog.addEventListener('close',async()=>back(await session()),{once:true});
    window.renderAccountLogin();
    window.show('#login');
    if(embedded)notify('shiyu-login-ready');
  };
  start();
})();
