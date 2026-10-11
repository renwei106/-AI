(()=>{
 let pending=null,installed=false,busy=false;const button=document.querySelector('#install'),status=document.querySelector('#status'),guide=document.querySelector('#guide'),ua=navigator.userAgent;
 const ios=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
 const steps=ios?['点击分享按钮。','选择「添加到主屏幕」，确认名称为「拾隅」。']:/Edg\//.test(ua)?['打开右上角「…」菜单 → 应用。','选择「将此站点作为应用安装」，名称填写「拾隅」。','安装后选择创建桌面快捷方式，或固定到任务栏。']:/Quark|QQBrowser|360SE|360EE|QihooBrowser/i.test(ua)?['打开浏览器菜单，查找「安装应用」「添加到桌面」或「创建快捷方式」。','若当前版本没有这些选项，可用 Chrome 或 Edge 打开拾隅并安装。']:/Chrome/.test(ua)?['打开右上角菜单 → 投放、保存和分享。','选择「将网页安装为应用」，确认名称为「拾隅」。']:/Safari/.test(ua)?['在支持网站应用的 Safari 中打开「文件」菜单。','选择「添加到程序坞」，名称填写「拾隅」。']:['打开浏览器菜单，查看是否提供「安装应用」「网站应用」或「添加到主屏幕」。','若当前版本没有这些选项，可用 Chrome、Edge 或支持网站应用的 Safari 安装。'];
 function help(){guide.replaceChildren(...steps.map(t=>{const li=document.createElement('li');li.textContent=t;return li}));}
 help();
 addEventListener('beforeinstallprompt',event=>{event.preventDefault();if(installed)return;pending=event;guide.hidden=true;status.textContent='点击添加，在浏览器中确认安装。'});
 button.onclick=async()=>{
  if(installed||busy)return;
  if(!pending){guide.hidden=false;help();status.textContent='请按上方步骤，在当前浏览器中添加。';return;}
  const prompt=pending;pending=null;busy=true;button.disabled=true;
  try{await prompt.prompt();const result=await prompt.userChoice;if(!installed){status.textContent=result.outcome==='accepted'?'已确认安装，请按浏览器提示选择桌面或任务栏。':'已取消添加，可按上方步骤重试。';guide.hidden=false;}}
  catch{if(!installed){guide.hidden=false;help();status.textContent='暂时无法打开安装提示，请按上方步骤添加。';}}
  finally{busy=false;button.disabled=false;}
 };
 addEventListener('appinstalled',()=>{installed=true;pending=null;button.hidden=true;guide.hidden=true;status.textContent='拾隅已添加。'});
 if(matchMedia('(display-mode: standalone)').matches||navigator.standalone){installed=true;button.hidden=true;guide.hidden=true;status.textContent='已在拾隅应用中。';}
})();
