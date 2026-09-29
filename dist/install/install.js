(()=>{
 let pending=null;const button=document.querySelector('#install'),status=document.querySelector('#status'),guide=document.querySelector('#guide'),ua=navigator.userAgent;
 const ios=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
 const steps=ios?['点击分享按钮。','选择「添加到主屏幕」，确认名称为「拾隅」。']:/Edg\//.test(ua)?['打开右上角「…」菜单 → 更多工具 → 应用。','选择「将此站点作为应用安装」，名称填写「拾隅」。','安装后选择创建桌面快捷方式，或固定到任务栏。']:/Chrome/.test(ua)?['打开右上角菜单 → 投放、保存和分享。','选择「将网页安装为应用」，确认名称为「拾隅」。']:/Safari/.test(ua)?['打开 Safari「文件」菜单。','选择「添加到程序坞」，名称填写「拾隅」。']:['请使用 Chrome、Edge 或 Safari 打开此页面。','在浏览器菜单中选择安装应用或添加到主屏幕。'];
 function help(){guide.replaceChildren(...steps.map(t=>{const li=document.createElement('li');li.textContent=t;return li}));}
 help();
 addEventListener('beforeinstallprompt',event=>{event.preventDefault();pending=event;guide.hidden=true;status.textContent='点击添加，在浏览器中确认安装。'});
 button.onclick=async()=>{if(!pending){guide.hidden=false;help();status.textContent='请按上方步骤，在当前浏览器中添加。';return;}const prompt=pending;pending=null;await prompt.prompt();const result=await prompt.userChoice;status.textContent=result.outcome==='accepted'?'已确认安装，请按浏览器提示选择桌面或任务栏。':'已取消添加，可随时重试。';guide.hidden=false;};
 addEventListener('appinstalled',()=>{button.hidden=true;guide.hidden=true;status.textContent='拾隅已添加。'});
 if(matchMedia('(display-mode: standalone)').matches||navigator.standalone){button.hidden=true;guide.hidden=true;status.textContent='已在拾隅应用中。';}
})();
