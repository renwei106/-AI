(() => {
  'use strict';
  const params=new URLSearchParams(location.search);
  const mode=params.get('tool-login');
  if(mode!=='1'&&mode!=='embed')return;
  const embedded=mode==='embed'&&window.parent!==window;
  if(embedded){
    const style=document.createElement('style');
    style.textContent='body> :not(#login){visibility:hidden!important}html,body{background:transparent!important}#login{visibility:visible!important}';
    document.head.append(style);
  }
  const raw=params.get('return')||'';
  let target;
  if(!embedded)try{
      target=new URL(raw);
      const local=['localhost','127.0.0.1'].includes(target.hostname);
      if(!local&&!target.hostname.endsWith('.shiyubox.com'))throw Error();
      if(!['http:','https:'].includes(target.protocol))throw Error();
    }catch{return;}
  let returning=false;
  const notify=(type,authenticated=false)=>window.parent.postMessage({type,authenticated},'*');
  const back=authenticated=>{if(returning)return;returning=true;if(embedded)notify('shiyu-login-close',authenticated);else location.replace(target.href);};
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
