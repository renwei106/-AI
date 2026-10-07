(()=>{
 const button=document.querySelector('#install'),status=document.querySelector('#status'),guide=document.querySelector('#guide');
 const chooser=document.querySelector('#browser'),browserHelp=document.querySelector('#browser-help'),shortcutPanel=document.querySelector('#shortcut-panel');
 const ua=navigator.userAgent,ios=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
 const windows=/Windows/.test(ua)&&!ios;
 let pending=null,installed=false,busy=false;
 const detected=/Quark/i.test(ua)?'quark':/QQBrowser/i.test(ua)?'qq':/360SE|360EE|QihooBrowser/i.test(ua)?'360':/Edg\//.test(ua)?'edge':/Firefox\//.test(ua)?'firefox':/Chrome\//.test(ua)?'chrome':/Safari\//.test(ua)?'safari':'other';
 const names={chrome:'谷歌浏览器',edge:'微软 Edge 浏览器',qq:'QQ 浏览器',quark:'夸克浏览器','360':'360 浏览器',firefox:'火狐 Firefox 浏览器',safari:'Safari'};
 chooser.options[0].textContent=names[detected]?'自动识别：'+names[detected]:'自动识别';
 const instructions={
  chrome:['打开右上角菜单 → 投放、保存和分享。','选择「将网页安装为应用」，确认名称为「拾隅」。'],
  edge:['打开右上角「…」菜单 → 应用。','选择「将此站点作为应用安装」，名称填写「拾隅」。','安装后选择创建桌面快捷方式，或固定到任务栏。'],
  qq:['在 QQ 浏览器菜单中查看是否有「安装应用」「添加到桌面」或「创建快捷方式」。','支持原生安装的版本可直接安装；没有这些入口时，可下载下方 Windows 桌面快捷方式。'],
  quark:['在夸克浏览器菜单中查看是否有「安装应用」「添加到桌面」或「创建快捷方式」。','支持原生安装的版本可直接安装；没有这些入口时，可下载下方 Windows 桌面快捷方式。'],
  '360':['在 360 浏览器菜单中查看是否有「安装应用」「添加到桌面」或「创建快捷方式」。','支持原生安装的版本可直接安装；没有这些入口时，可下载下方 Windows 桌面快捷方式。'],
  firefox:windows?['在普通浏览窗口打开拾隅，点击地址栏的网站应用按钮。','Firefox 143 及以上版本支持此功能；Microsoft Store 安装版需 150 及以上版本。','按浏览器提示固定到任务栏；没有该入口时，可下载下方桌面快捷方式。']:['Firefox 的网站应用功能目前仅在 Windows 提供。','手机端可查看浏览器菜单中的「添加到主屏幕」；其他系统可将拾隅保存为书签。'],
  safari:['在支持网站应用的 Safari 中打开「文件」菜单。','选择「添加到程序坞」，名称填写「拾隅」。'],
  other:['打开浏览器菜单，查看是否提供「安装应用」或「添加到桌面」。','Windows 用户也可以下载下方桌面快捷方式。']
 };
 function help(){
  const browser=chooser.value==='auto'?detected:chooser.value;
  const steps=ios?['点击分享按钮。','选择「添加到主屏幕」，确认名称为「拾隅」。']:instructions[browser]||instructions.other;
  guide.replaceChildren(...steps.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));
 }
 function markInstalled(message){installed=true;pending=null;button.hidden=true;guide.hidden=true;browserHelp.hidden=true;shortcutPanel.hidden=true;status.textContent=message;}
 shortcutPanel.hidden=!windows;help();
 chooser.onchange=()=>{if(installed)return;help();guide.hidden=false;};
 document.querySelector('#shortcut').onclick=()=>{status.textContent='请解压下载的快捷方式，将「拾隅.url」文件放到桌面，双击后通过系统默认浏览器打开。';};
 addEventListener('beforeinstallprompt',event=>{event.preventDefault();if(installed||typeof event.prompt!=='function')return;pending=event;guide.hidden=true;status.textContent='点击添加，在当前浏览器中确认安装。'});
 button.onclick=async()=>{
  if(installed||busy)return;
  if(!pending){guide.hidden=false;help();status.textContent='请按上方指引添加；自动识别不准确时，可选择你使用的浏览器。';return;}
  const prompt=pending;pending=null;busy=true;button.disabled=true;
  try{await prompt.prompt();const result=await prompt.userChoice;if(!installed){status.textContent=result?.outcome==='accepted'?'已确认安装，请按浏览器提示选择桌面或任务栏。':'已取消添加，可按上方步骤重试。';guide.hidden=false;}}
  catch{if(!installed){guide.hidden=false;help();status.textContent='暂时无法打开安装提示，请按上方指引添加，或下载桌面快捷方式。';}}
  finally{busy=false;button.disabled=false;}
 };
 addEventListener('appinstalled',()=>markInstalled('拾隅已添加。'));
 if(matchMedia('(display-mode: standalone)').matches||navigator.standalone)markInstalled('已在拾隅应用中。');
})();
