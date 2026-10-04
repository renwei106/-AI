/* Personal-profile security editors; reuse the existing account dialogs and APIs. */
(()=>{
 const cooldowns=new Map(),sending=new Set();
 let disposeEditor=()=>{};
 async function api(path,body,method=body?'POST':'GET'){
  const response=await fetch('/api/shiyu/auth/'+path,{method,credentials:'same-origin',cache:'no-store',...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});
  const value=await response.json();if(!response.ok)throw Object.assign(new Error(value.message||'操作失败，请重试'),value);return value;
 }
 const label=(name,input)=>'<label class="security-field"><span>'+name+'</span>'+input+'</label>';
 const password=(attr,name)=>label(name,'<input '+attr+' type="password" autocomplete="'+(attr.includes('current')?'current-password':'new-password')+'" maxlength="'+(attr.includes('current')?'64':'20')+'"'+(attr.includes('current')?'':' minlength="6"')+'>');
 const boundText=p=>p.wechatBound||p.wechatNickname?(p.wechatNickname?'已绑定 · '+p.wechatNickname:'已绑定'):'未绑定';
 const recognizableEmail=(value,fallback)=>{const address=String(value||'').trim(),at=address.lastIndexOf('@');if(at<1)return fallback;const name=address.slice(0,at),domain=address.slice(at+1);if(!domain)return fallback;const hidden=Math.min(name.length-2,name.length>=8?4:3);if(hidden<1)return fallback;const before=Math.ceil((name.length-hidden)/2);return name.slice(0,before)+'*'.repeat(hidden)+name.slice(before+hidden)+'@'+domain};
 function remember(security){prefs.accountProfile={...accountProfile(),hasPassword:security.hasPassword,wechatBound:security.wechatBound,wechatNickname:security.wechatNickname||''};persist();}
 function attachSender(d,button,target,valid,purpose){
  let stopped=false;
  const key=()=>String(target()).trim().toLowerCase();
  const deadline=k=>{try{return Math.max(cooldowns.get(k)||0,Number(sessionStorage.getItem('shiyu-security-cooldown:'+k))||0)}catch{return cooldowns.get(k)||0}};
  const set=(k,seconds)=>{const until=Date.now()+Math.max(1,Number(seconds)||60)*1000;cooldowns.set(k,until);try{sessionStorage.setItem('shiyu-security-cooldown:'+k,String(until))}catch{}};
  const sync=()=>{if(stopped)return;const k=key(),left=Math.max(0,Math.ceil((deadline(k)-Date.now())/1000)),busy=sending.has(k);button.disabled=busy||left>0||!valid(k);button.textContent=busy?'发送中…':left?left+' 秒后重发':'获取验证码';button.classList.toggle('is-ready',!button.disabled)};
  const timer=setInterval(sync,250),stop=()=>{stopped=true;clearInterval(timer);d.removeEventListener('input',sync);d.removeEventListener('change',sync)};d.addEventListener('input',sync);d.addEventListener('change',sync);
  button.onclick=async()=>{sync();if(button.disabled)return;const k=key();sending.add(k);sync();try{const isEmail=k.includes('@');const result=await api(isEmail?'email/send':'send-code',{[isEmail?'email':'phone']:k,purpose});set(k,result.resendAfter||60);if(!stopped)toast('验证码已发送')}catch(error){if(error.retryAfter)set(k,error.retryAfter);if(!stopped)toast(error.message)}finally{sending.delete(k);sync()}};sync();return stop;
 }
 async function open(kind,{dialog}){
  disposeEditor();
  document.querySelector('#account-security-editor[open]')?.close();
  const profile=accountProfile(),title=kind==='password'?'密码设置':kind==='wechat'?'微信绑定':kind==='phone'?(profile.phone?'换绑手机号':'绑定手机号'):(profile[kind]?'修改':'设置')+'邮箱';
  const d=dialog('account-security-editor',title);d.dataset.securityKind=kind;let closed=false;const cleanups=[];
  const onClose=()=>{if(!d.open)dispose()};
  const dispose=()=>{closed=true;d.removeEventListener('close',onClose);cleanups.forEach(fn=>fn())};disposeEditor=dispose;d.addEventListener('close',onClose);
  const current=()=>!closed&&d.open;
  const finish=(message)=>{d.close();openAccountCenter();toast(message)};
  const save=(button,fn)=>{button.onclick=async()=>{if(button.disabled)return;button.disabled=true;try{await fn()}catch(error){if(current())toast(error.message)}finally{if(current())button.disabled=false}}};
  d.showModal();
  if(kind==='phone'||kind==='email'){
   const isEmail=kind==='email',name=isEmail?'邮箱':'手机号',action=isEmail?'保存邮箱':profile.phone?'换绑手机号':'绑定手机号',valid=v=>isEmail?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v):/^1\d{10}$/.test(v);
   d.insertAdjacentHTML('beforeend',(kind==='phone'&&!profile.phone?'':'<p class="account-note">当前'+name+'：'+esc(profile[kind]||'未绑定')+'</p>')+'<div class="security-form">'+label(name,'<input data-security-'+kind+' '+(isEmail?'type="email" autocomplete="email"':'type="tel" autocomplete="tel"')+' placeholder="请输入'+name+'">')+label('验证码','<div class="account-input-row"><input data-security-'+kind+'-code inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="'+(isEmail?'邮箱':'短信')+'验证码"><button type="button" data-security-'+kind+'-send>获取验证码</button></div>')+'<button class="primary" data-security-editor-save>'+action+'</button></div>');
   const input=d.querySelector('[data-security-'+kind+']');cleanups.push(attachSender(d,d.querySelector('[data-security-'+kind+'-send]'),()=>input.value,valid,'change-'+kind));
   save(d.querySelector('[data-security-editor-save]'),async()=>{const target=input.value.trim().toLowerCase(),code=d.querySelector('[data-security-'+kind+'-code]').value.trim();if(!valid(target))throw Error('请输入正确的'+name);if(!code)throw Error('请输入验证码');await api('security',{action:kind,[kind]:target,code},'PUT');prefs.accountProfile={...accountProfile(),[kind]:target};persist();finish(isEmail?'邮箱保存成功':profile.phone?'手机号换绑成功':'手机号绑定成功')});return;
  }
  d.insertAdjacentHTML('beforeend','<p class="account-note" data-security-loading>正在读取账号状态…</p>');
  let security;try{security=(await api('security')).security;if(!current())return;remember(security)}catch(error){if(current())d.querySelector('[data-security-loading]').textContent=error.message;return}
  d.querySelector('[data-security-loading]').remove();
  if(kind==='password'){
   let useCode=!security.hasPassword;
   const channels=[...(security.email?[['email',recognizableEmail(accountProfile().email,security.email),accountProfile().email]]:[]),...(security.phone?[['phone',security.phone,accountProfile().phone]]:[])];
   let stopSender=()=>{};cleanups.push(()=>stopSender());
   function draw(){
    stopSender();
    d.querySelector('.security-content')?.remove();d.querySelector('h2').textContent=security.hasPassword?'修改密码':'设置密码';
    const noContact=useCode&&!channels.length;
    d.insertAdjacentHTML('beforeend','<div class="security-content"><p class="account-note">'+(noContact?'请先绑定手机号或邮箱，验证身份后即可设置密码。':useCode?'验证已绑定的手机号或邮箱后，设置新密码。':'验证当前密码后，设置新密码。')+'</p>'+(noContact?'<button class="primary" data-bind-contact>绑定手机号或邮箱</button>':'<div class="security-form">'+(useCode?label('验证方式','<div class="security-channel-picker"><select data-security-channel hidden>'+channels.map(([channel,masked])=>'<option value="'+channel+'">'+(channel==='email'?'邮箱 ':'手机 ')+esc(masked)+'</option>').join('')+'</select><button type="button" class="security-channel-trigger" data-security-channel-trigger aria-haspopup="listbox" aria-expanded="false"><span>'+esc(channels[0][0]==='email'?'邮箱 '+channels[0][1]:'手机 '+channels[0][1])+'</span><span class="security-channel-chevron" aria-hidden="true"></span></button><div class="security-channel-options" role="listbox" aria-label="验证方式" hidden>'+channels.map(([channel,masked],index)=>'<button type="button" role="option" data-security-channel-option="'+channel+'" aria-selected="'+(index===0)+'"><span>'+(channel==='email'?'邮箱 ':'手机 ')+esc(masked)+'</span><span aria-hidden="true">'+(index===0?'✓':'')+'</span></button>').join('')+'</div></div>')+label('验证码','<div class="account-input-row"><input data-security-code inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="请输入验证码"><button type="button" data-security-send>获取验证码</button></div>'):password('data-security-current','当前密码'))+password('data-security-new','新密码')+'<p class="account-note security-password-hint">6–20 位，包含字母、数字或符号中的至少两类。</p>'+password('data-security-confirm','确认新密码')+'<button class="primary" data-security-editor-save>保存新密码</button>'+(security.hasPassword?'<button type="button" data-security-switch>'+(useCode?'使用当前密码验证':'忘记当前密码？通过验证码重设')+'</button>':'')+'</div>')+'</div>');
    if(noContact){d.querySelector('[data-bind-contact]').onclick=()=>{d.close();window.openShiyuSecuritySettings()};return}
    if(useCode){
     const picker=d.querySelector('.security-channel-picker'),select=picker.querySelector('[data-security-channel]'),trigger=picker.querySelector('[data-security-channel-trigger]'),options=picker.querySelector('.security-channel-options');
     const close=()=>{options.hidden=true;trigger.setAttribute('aria-expanded','false')};
     trigger.onclick=()=>{options.hidden=!options.hidden;trigger.setAttribute('aria-expanded',String(!options.hidden))};
     picker.querySelectorAll('[data-security-channel-option]').forEach(option=>{option.onclick=()=>{select.value=option.dataset.securityChannelOption;trigger.querySelector('span').textContent=option.querySelector('span').textContent;picker.querySelectorAll('[data-security-channel-option]').forEach(item=>{const selected=item===option;item.setAttribute('aria-selected',String(selected));item.lastElementChild.textContent=selected?'✓':''});select.dispatchEvent(new Event('change',{bubbles:true}));close();trigger.focus()}});
     const outside=event=>{if(!picker.contains(event.target))close()},escape=event=>{if(event.key==='Escape'&&!options.hidden){close();trigger.focus();event.stopPropagation()}};
     document.addEventListener('pointerdown',outside);d.addEventListener('keydown',escape);cleanups.push(()=>{document.removeEventListener('pointerdown',outside);d.removeEventListener('keydown',escape)});
     stopSender=attachSender(d,d.querySelector('[data-security-send]'),()=>channels.find(x=>x[0]===select.value)?.[2]||'',v=>!!v,'password-verify');
    }
    d.querySelector('[data-security-switch]')?.addEventListener('click',()=>{useCode=!useCode;draw()});
    save(d.querySelector('[data-security-editor-save]'),async()=>{const next=d.querySelector('[data-security-new]').value,confirm=d.querySelector('[data-security-confirm]').value,currentPassword=d.querySelector('[data-security-current]')?.value||'',code=d.querySelector('[data-security-code]')?.value.trim();if(!next||(!useCode&&!currentPassword))throw Error('请完整填写密码');if(next!==confirm)throw Error('两次输入的新密码不一致');if(useCode&&!code)throw Error('请输入验证码');const result=await api('security',{action:'password',newPassword:next,...(useCode?{verification:'code',channel:d.querySelector('[data-security-channel]').value,code}:{currentPassword})},'PUT');remember(result.security);finish(security.hasPassword?'密码修改成功':'密码设置成功')});
   }draw();return;
  }
  if(kind==='wechat'){
   d.insertAdjacentHTML('beforeend','<p class="account-note" data-wechat-binding-status>当前状态：'+esc(boundText(security))+'</p>');
   if(security.wechatBound)return;
   d.insertAdjacentHTML('beforeend','<div class="security-wechat-qr" data-security-qr></div><p class="account-note" data-wechat-hint role="status">正在加载微信二维码…</p><button type="button" data-wechat-refresh hidden>重新加载二维码</button><button class="primary" data-wechat-confirm hidden>确认绑定当前账号</button>');
   let timer,scene='',generation=0;cleanups.push(()=>{generation++;clearTimeout(timer)});
   const hint=d.querySelector('[data-wechat-hint]'),refresh=d.querySelector('[data-wechat-refresh]'),confirm=d.querySelector('[data-wechat-confirm]'),qrSlot=d.querySelector('[data-security-qr]');
   const unavailable=()=>{clearTimeout(timer);qrSlot.innerHTML='<div class="security-wechat-placeholder" role="img" aria-label="微信二维码暂不可用"><span class="security-wechat-placeholder-mark" aria-hidden="true"></span></div>';hint.textContent='二维码暂时无法加载，请稍后重试。';refresh.hidden=false;confirm.hidden=true};
   async function start(){const round=++generation;clearTimeout(timer);refresh.hidden=true;confirm.hidden=true;qrSlot.replaceChildren();hint.textContent='正在加载微信二维码…';try{const qr=await api('wechat/qr?purpose=profile-bind');if(!current()||round!==generation)return;scene=qr.scene;const img=document.createElement('img');img.className='wechat-login-qr';img.alt='微信绑定二维码';img.onerror=()=>{if(current()&&round===generation)unavailable()};img.src=qr.qrUrl;qrSlot.append(img);hint.textContent='请用微信扫码，扫码后确认绑定当前账号。';timer=setTimeout(()=>poll(round),1500)}catch(error){if(current()&&round===generation)unavailable()}}
   async function poll(round){if(!current()||round!==generation)return;try{const result=await api('wechat/status?scene='+encodeURIComponent(scene));if(!current()||round!==generation)return;if(result.status==='ready-to-bind'){hint.textContent=result.nickname?'已扫码：'+result.nickname+'。请确认绑定。':'扫码成功，请确认绑定当前账号。';confirm.hidden=false;return}hint.textContent='请用微信扫码，扫码后确认绑定当前账号。';timer=setTimeout(()=>poll(round),1500)}catch(error){if(current()&&round===generation)unavailable()}}
   refresh.onclick=start;save(confirm,async()=>{await api('wechat/bind',{scene,purpose:'profile-bind'});remember((await api('security')).security);finish('微信绑定成功')});start();
  }
 }
 async function refreshProfile(d){const id=accountProfile().id;try{const {security}=await api('security');if(!d.open||accountProfile().id!==id)return;remember(security);const wx=d.querySelector('[data-security-item="wechat"] span,[data-security-item="wechat"] small'),pw=d.querySelector('[data-security-item="password"] span');if(wx)wx.innerHTML=esc(boundText(security))+(wx.tagName==='SPAN'?'<i class="profile-row-arrow">›</i>':'');if(pw)pw.innerHTML=(security.hasPassword?'修改密码':'设置密码')+'<i class="profile-row-arrow">›</i>';const summary=d.querySelector('.profile-view-summary>div'),methods=[['邮箱',!!security.email],['手机号',!!security.phone],['微信',security.wechatBound===true]].filter(([,bound])=>bound);if(summary){summary.querySelector('.profile-bound-methods')?.remove();if(methods.length)summary.insertAdjacentHTML('beforeend','<div class="profile-bound-methods" aria-label="已绑定的账号方式">'+methods.map(([name])=>'<span class="profile-bound-method" aria-label="'+name+'已绑定"><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.5 13 3.4v4.1c0 3-1.7 5.2-5 7-3.3-1.8-5-4-5-7V3.4L8 1.5Z" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"/><path d="m5.5 8 1.6 1.6 3.4-3.5" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>'+name+'</span>').join('')+'</div>')}}catch{/* Editors retry and show the actual error. */}}
 window.ShiyuAccountSecurity={open,boundText,refreshProfile};
})();
