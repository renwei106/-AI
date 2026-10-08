// Reuse existing fixture tests; wait for account/runtime readiness rather than remote network idle.
process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const launch=chromium.launch.bind(chromium);
chromium.launch=async options=>{
 const browser=await launch(options),newContext=browser.newContext.bind(browser);
 browser.newContext=async options=>{
  const context=await newContext(options),newPage=context.newPage.bind(context);
  context.newPage=async()=>{
   const page=await newPage();
   for(const method of ['goto','reload']){
    const fn=page[method].bind(page);
    page[method]=async(...args)=>{
     const result=method==='goto'?await fn(args[0],{...args[1],waitUntil:'commit'}):await fn({...args[0],waitUntil:'commit'});
     await page.waitForFunction(()=>document.documentElement.classList.contains('shiyu-account-ready')&&window.ShiyuDesktopPet&&typeof renderSettings==='function');
     return result;
    };
   }
   return page;
  };
  return context;
 };
 return browser;
};
