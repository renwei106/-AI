const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve('../聚合管理后台');
const vite=path.dirname(fs.realpathSync(path.join(root,'node_modules/vite')));
const esbuild=require(require.resolve('esbuild',{paths:[vite]}));
(async()=>{
 const bundle=await esbuild.build({stdin:{contents:"import React from 'react';import{createRoot}from'react-dom/client';import{ConfigProvider}from'antd';import{ShiyuOnboardingConfig}from'./src/ShiyuOnboardingConfig';createRoot(document.getElementById('root')).render(<ConfigProvider><ShiyuOnboardingConfig/></ConfigProvider>);",resolveDir:root,loader:'tsx'},bundle:true,write:false,format:'iife',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',error=>console.error(error.message));let config={enabled:true,welcome:true,home:true,space:true},saved=0;
  await page.route('http://127.0.0.1:4349/__onboarding-admin-review',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><meta charset="utf-8"><body style="margin:0;padding:30px;background:#f6f7f8;font-family:Arial"><main id="root"></main><script src="/__onboarding-admin-bundle.js"></script></body>'}));
  await page.route('**/__onboarding-admin-bundle.js',route=>route.fulfill({contentType:'text/javascript',body:bundle.outputFiles[0].text}));
  await page.route('**/api/shiyu/operations',route=>{if(route.request().method()==='PUT'){config=route.request().postDataJSON().onboarding;saved++;}return route.fulfill({json:{onboarding:config}});});
  await page.goto('http://127.0.0.1:4349/__onboarding-admin-review');
  await page.getByRole('button',{name:/配\s*置/}).click();await page.waitForTimeout(400);
  await page.screenshot({path:'checks/onboarding/07-admin-drawer.png'});
  await page.getByRole('switch').nth(1).click();await page.getByRole('button',{name:/保\s*存/}).click();
  await page.waitForFunction(()=>!document.querySelector('.ant-drawer-open'));
  assert.equal(saved,1);assert.equal(config.welcome,false);assert.equal(config.home,true);
  console.log('PASS: isolated admin drawer renders and saves only onboarding configuration.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
