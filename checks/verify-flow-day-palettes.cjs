const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const palettes=[['#48614c','苔径青绿'],['#45433c','山岩石墨'],['#bd9055','麦田暖金'],['#467ea5','远山雾蓝'],['#8b83d1','暮色浅紫'],['#ba794f','陶土暖橙'],['#a95e76','干枯玫瑰']];
function channels(color){return color.match(/[\d.]+/g).slice(0,3).map(Number).map(value=>color.startsWith('color(')?value*255:value)}
function luminance(color){const linear=channels(color).map(value=>{value/=255;return value<=.04045?value/12.92:((value+.055)/1.055)**2.4});return linear[0]*.2126+linear[1]*.7152+linear[2]*.0722}
function contrast(a,b){const first=luminance(a),second=luminance(b);return (Math.max(first,second)+.05)/(Math.min(first,second)+.05)}
let browser;
(async()=>{
 browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1288,height:1041}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:4318/?theme=flow',{waitUntil:'networkidle'});
 for(const [color,name] of palettes){
  await page.evaluate(color=>{signed=true;prefs.mode='light';prefs.color=color;prefs.flowStyle='chaos';persist();render();document.querySelector('.brand-guide')?.remove()},color);await page.waitForTimeout(180);
  const appearance=await page.evaluate(()=>{const cover=document.querySelector('.flow-cover');return {background:getComputedStyle(cover).backgroundColor,ink:getComputedStyle(cover).getPropertyValue('--flow-ink').trim(),title:getComputedStyle(document.querySelector('.flow-copy h1')).color}});
  assert.equal(appearance.ink,'#f5f7ff',`${name} should keep the light flow ink`);
  assert(contrast(appearance.background,appearance.title)>=4.5,`${name} should keep readable light copy`);
 }
 assert.deepEqual(errors,[]);console.log('PASS: all seven daytime flow palettes keep colored backgrounds with light copy and particles.');
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
