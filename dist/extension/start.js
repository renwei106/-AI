'use strict'
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
const resetPageScroll = () => requestAnimationFrame(() => scrollTo({ top: 0, left: 0, behavior: 'auto' }))
addEventListener('pageshow', resetPageScroll)
addEventListener('load', resetPageScroll, { once: true })
const themeMedia = matchMedia('(prefers-color-scheme: dark)')
const officialFonts = { 'youfeng': '"Shiyu Youfeng"', 'qingya-song': '"Shiyu Qingya Song"', 'wenrun-kai': '"Shiyu Wenrun Kai"' }
async function applyOfficialFont() {
  let font = officialFonts.youfeng
  try {
    const response = await fetch('/api/shiyu/operations', { cache: 'no-store' })
    if (response.ok) { const { officialFont } = await response.json(); font = officialFonts[officialFont] || font }
  } catch {}
  document.documentElement.style.setProperty('--official-font', font)
  try { await Promise.race([document.fonts.load(`16px ${font}`), new Promise(resolve => setTimeout(resolve, 1800))]) } catch {}
  document.documentElement.classList.remove('font-pending')
}
function applyPageMode() {
  let mode = 'system', color = '#48614c'
  try { const prefs = JSON.parse(localStorage.getItem('yiyu-prototype-v1') || '{}').prefs || {}; mode = prefs.mode || mode; color = /^#[0-9a-f]{6}$/i.test(prefs.color || '') ? prefs.color : color } catch {}
  document.documentElement.style.setProperty('--action-color', color)
  document.documentElement.style.setProperty('--theme-color', color)
  document.documentElement.dataset.extensionDark = String(mode === 'dark' || mode === 'system' && themeMedia.matches)
  document.documentElement.dataset.themed = 'true'
  document.documentElement.dataset.themeDark = document.documentElement.dataset.extensionDark
}
themeMedia.addEventListener('change', applyPageMode); addEventListener('storage', applyPageMode); applyPageMode()
applyOfficialFont()

const homeURL = location.origin + '/'
const ua = navigator.userAgent
const platform = navigator.userAgentData?.platform || navigator.platform || ''
const browser = /Firefox\//.test(ua) ? 'Firefox' : /Edg\//.test(ua) ? 'Microsoft Edge' : /Quark/i.test(ua) ? '夸克浏览器' : /QQBrowser/i.test(ua) ? 'QQ 浏览器' : /360SE|360EE|QihooBrowser/i.test(ua) ? '360 浏览器' : /Chrome\//.test(ua) ? 'Google Chrome' : /Safari\//.test(ua) ? 'Safari' : '当前浏览器'
const guides = {
  'Google Chrome': '打开设置 → 启动时 → 打开特定网页或一组网页，添加复制的拾隅地址。',
  'Microsoft Edge': '打开设置 → 开始、主页和新建标签页 → Edge 启动时，添加复制的拾隅地址。',
  'Firefox': '打开设置 → 主页 → 主页和新窗口，选择自定义网址并粘贴拾隅地址。',
  'Safari': '打开设置 → 通用 → 主页，粘贴拾隅地址；也可将“新窗口打开方式”设为主页。',
  '夸克浏览器': '打开浏览器设置，找到启动时或主页设置，选择自定义网页并粘贴拾隅地址。',
  'QQ 浏览器': '打开浏览器设置 → 常规设置，找到启动时打开或主页，粘贴拾隅地址。',
  '360 浏览器': '打开浏览器设置 → 基本设置，找到启动时打开或主页设置，粘贴拾隅地址。',
  '当前浏览器': '打开浏览器设置，找到“启动时”或“主页”，选择自定义网页并粘贴拾隅地址。'
}
const installGuides = {
  'Google Chrome': '点击按钮后会直接打开 Chrome 安装确认；若没有弹出，请打开右上角菜单 → 投放、保存和分享 → 将网页安装为应用。',
  'Microsoft Edge': '点击按钮后会直接打开 Edge 安装确认；若没有弹出，请打开右上角“…” → 应用 → 将此站点作为应用安装。',
  'Firefox': '点击按钮后会直接打开 Firefox 网站应用确认；若没有弹出，请点击地址栏中的网站应用按钮。',
  'Safari': '请打开“文件”菜单 → 添加到程序坞，名称确认使用“拾隅”。',
  '夸克浏览器': '点击按钮后会尝试直接安装；若没有弹出，请打开浏览器菜单中的“安装应用”或“添加到桌面”。',
  'QQ 浏览器': '点击按钮后会尝试直接安装；若没有弹出，请打开浏览器菜单中的“安装应用”或“创建快捷方式”。',
  '360 浏览器': '点击按钮后会尝试直接安装；若没有弹出，请打开浏览器菜单中的“安装应用”或“创建快捷方式”。',
  '当前浏览器': '点击按钮后会尝试直接安装；若没有弹出，请从当前浏览器菜单中选择“安装应用”或“添加到桌面”。'
}
const settings = {
  'Google Chrome': 'chrome://settings/onStartup',
  'Microsoft Edge': 'edge://settings/startHomeNTP',
  'Firefox': 'about:preferences#home'
}
document.querySelector('#install-browser').textContent = browser
document.querySelector('#install-guide').textContent = installGuides[browser]
document.querySelector('#homepage-browser').textContent = browser
document.querySelector('#homepage-guide').textContent = guides[browser]
const bookmarkShortcut = /Mac/i.test(platform) ? 'Command＋D' : 'Ctrl＋D'
document.querySelector('#bookmark-browser').textContent = browser
document.querySelector('#bookmark-guide').textContent = `在 ${browser} 中按 ${bookmarkShortcut} 收藏拾隅，再选择显示在书签栏。`
document.querySelector('#bookmark-action').textContent = `设为书签（${bookmarkShortcut}）`

async function copy(value, output, success) {
  try { await navigator.clipboard.writeText(value); output.textContent = success; return true }
  catch { output.textContent = `请手动复制：${value}`; return false }
}
document.querySelector('#copy-homepage').onclick = async () => {
  const status = document.querySelector('#homepage-status'), fallback = document.querySelector('#homepage-fallback'), setting = settings[browser]
  fallback.hidden = true
  const copied = await copy(homeURL, status, '拾隅首页地址已复制，正在打开浏览器设置…')
  if (!setting) { fallback.textContent = homeURL; fallback.hidden = false; status.textContent = copied ? '当前浏览器不支持网页直达内部设置。地址已复制，请按上方路径粘贴。' : '当前浏览器不支持网页直达内部设置，请复制上方地址。'; return }
  const link = document.createElement('a'); link.href = setting; link.target = '_blank'; link.rel = 'noopener'; link.click()
  setTimeout(() => { fallback.textContent = homeURL; fallback.hidden = false; status.textContent = `地址已复制。如设置页没有打开，请在地址栏输入 ${setting}，再粘贴拾隅地址。` }, 900)
}
document.querySelector('#bookmark-action').onclick = () => {
  document.querySelector('#shortcut-status').textContent = `浏览器不允许网页代替你创建书签。请按 ${bookmarkShortcut}，确认名称为“拾隅”并保存到书签栏。`
  const bookmark = document.querySelector('.visual-bookmarks b'); bookmark.classList.remove('bookmark-pulse'); requestAnimationFrame(() => bookmark.classList.add('bookmark-pulse'))
}

let installPrompt = null
const installButton = document.querySelector('#install-app'), installStatus = document.querySelector('#install-status')
addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; installStatus.textContent = '当前浏览器支持直接安装。' })
addEventListener('appinstalled', () => { installPrompt = null; installButton.disabled = true; installButton.textContent = '已添加到桌面'; installStatus.textContent = '拾隅桌面应用已安装。' })
installButton.onclick = async () => {
  if (matchMedia('(display-mode: standalone)').matches || navigator.standalone) { installStatus.textContent = '你当前已经在拾隅桌面应用中。'; return }
  if (!installPrompt) { installStatus.textContent = installGuides[browser]; return }
  const prompt = installPrompt; installPrompt = null; await prompt.prompt(); const result = await prompt.userChoice
  installStatus.textContent = result?.outcome === 'accepted' ? '已确认安装，请按浏览器提示完成。' : '已取消安装，之后仍可重新添加。'
}
