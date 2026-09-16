# 拾隅浏览器收藏插件 · 第一版

本次范围：头像下拉菜单新增一个「浏览器插件」入口；新增独立介绍/下载页、Manifest V3 桌面扩展、「稍后整理」与归类流程。现有首页、主题、导航、个人中心、登录交互、收藏层级不重做。基线见 `baselines/v196-before-bookmark-extension/`。

## 已实现的体验

- 头像菜单 → 新标签页 `/extension/`：说明、交互预览、下载、四步安装指引及兼容性说明。
- 点击工具栏插件：通过 `activeTab` 取得当前 HTTP/HTTPS 网页标题和完整网址。标题与备注都直接在紧凑的网页卡片内修改，并以轻量铅笔图标提示可编辑。
- 稍后整理：先收下网址，不需要立即选择分类。弹窗用抽屉示意明确去向；空间页在「收藏网址」旁提供同样的抽屉入口和待整理数量。
- 分类收藏：按既有空间 → 场景 → 分组选择，保存到原收藏数组。
- 稍后整理页：打开 `/extension/inbox.html`；可以把待整理收藏移入分组，也可以前往原有收藏空间。移入成功才移除待整理条目。
- 未登录：进入站内现有登录页；插件保留当前网页草稿。登录后重新打开插件即可继续。
- 同一目的地的同一完整 URL 去重；不同分组允许分别收藏；保留路径、查询参数和片段。
- 连接失败、分组被删除、账号变化、容量不足均提供可恢复的反馈，不显示虚假的保存成功。
- 未登录时使用默认暖白/灰绿配色；登录后读取用户当前主题色，并按用户日间、夜间或跟随系统设置联动。界面保留键盘焦点、原生表单和必要状态提示。

## 运行和打包

```powershell
node preview.cjs
node build-extension.cjs
```

- 介绍页：`http://127.0.0.1:4318/extension/`
- 稍后整理：`http://127.0.0.1:4318/extension/inbox.html`
- 源码：`browser-extension/`
- 可下载包：`dist/extension/downloads/shiyu-extension-0.1.0.zip`
- ZIP 根目录直接含 `manifest.json`。解压后加载这个目录即可；无需 npm 或编译工具。
- 构建脚本只打包固定文件清单，生成 16/32/48/128 像素图标，并复制相同弹窗代码供介绍页预览；预览不会写入真实收藏。
- 本地静态路由通过 `extension-routes.cjs` 加入。正式静态部署需要连同 `dist/extension/` 一起发布。

## 当前数据边界

现有站点是本机原型，`signed` 和本机 UUID 不是真实认证。本版复用已有体验登录，不新增另一套登录，也不宣称云端同步。正式账号后端尚未接通。

插件服务工作线程仅向配置的 `http://127.0.0.1:4318/` 标签页发送受限的 `state/save` 请求。页面适配器读取最新的 `yiyu-prototype-v1` 数据，以一次 localStorage 写入完成保存或归类；临时条目位于 `prefs.extensionInbox`，原收藏仍位于 `data[].scenes[].groups[].items`。既有标签页通过专用变更事件更新视图。

浏览器标签页之间的 localStorage 通知存在传播延迟。本机适配器适合当前体验验证，并非多设备事务系统；正式环境的并发控制、所有权、认证和幂等均必须在服务端完成，不能把本机 `signed` 当授权依据。

插件权限只有 `activeTab`、`storage`、`scripting` 和配置站点的 host permission；浏览器匹配规则无法限制端口，执行时另行校验完整 origin（含端口）。不申请浏览历史、原生书签、所有网站访问、代理控制权限。未配置远程脚本、外部消息接口或全站内容脚本。草稿位于扩展本机存储，保存成功后清除。网页内容不拼接为可执行 HTML。

## 浏览器与分发决策

| 浏览器 | 第一版策略 | 安装方式 |
| --- | --- | --- |
| Chrome 桌面 | Chromium MV3 同一套源码与 ZIP | 解压 → 开发者模式 → 加载已解压的扩展程序 |
| Edge 桌面 | 同上 | 同上，管理地址为 `edge://extensions` |
| 夸克桌面 | 有官方扩展中心，具体版本待验证 MV3/API/安装政策 | 先不提供未经验证的专用安装包或管理地址 |
| QQ 桌面 | 具体版本待实机验证 | 同上 |
| 360 安全/极速 | 官方提供扩展机制，但不同内核版本须验证 MV3 | 同上 |
| Firefox / Safari / 手机浏览器 | 不在本次支持范围 | 后续单独适配和分发 |

不因浏览器名称机械地生成多份相同包。只有发现实际 API/Manifest 差异才做独立构建，并在下载页显示相应选项。

CRX 是扩展打包格式（现代 Chromium 使用 CRX3），Manifest V3 是开发规范，不是一个概念。本版不提供无法保证通用安装的自签 CRX。Chrome 在 Windows/macOS 上限制商店外分发，不能承诺把 CRX 或 ZIP 拖到工具栏就能安装。浏览器内部 `chrome://` 页面也不能从普通网页直接链接；介绍页提供复制地址和明确步骤，不伪造一键跳转。

公开发布优先顺序：Chrome Web Store + Microsoft Edge Add-ons → 按实机适配结果申请国内浏览器扩展商店。商店版支持浏览器管理的安装与更新；当前开发者模式版需保留解压目录并手动更新。

## 网络策略

插件界面、图标、样式、脚本全部本地随包，不依赖 Google、CDN 或第三方 favicon 服务，也不会抓取被收藏网页。保存只需连接拾隅站点。正式版应选择目标用户可稳定访问的 HTTPS 域名、同源 API 和静态资源，并验证弱网与断线场景；连接失败时保留草稿供重试。

## 下一阶段接口框架

1. 正式账号：沿用站内登录。通过一次性授权码 + PKCE（或服务端认可的等价流程）向插件签发可撤销、有限范围的凭证；不导出网页 localStorage 或复制主站会话密码。会话过期回到同一登录入口。
2. 收藏 API：`GET /api/extension/me`、`GET /api/extension/destinations`、`POST /api/extension/bookmarks`、`GET /api/extension/inbox`、`POST /api/extension/inbox/:id/move`。服务端校验用户、目的地所有权、HTTP/HTTPS 地址及长度限制。
3. 服务端事务：收藏写入和「稍后整理」移出原子执行；幂等请求键避免网络重试造成重复；结构版本失效时刷新分组并让用户重选，不能静默保存到别处。
4. 用服务端 API 替换 `dist/extension/store.js` 的原型适配器和扩展 `relay` 实现。把 `config.js` 与 `host_permissions` 收紧到正式域名。仅改域名不足以构成正式账号版本。
5. 提交商店前补齐开发者账号、隐私说明 URL、支持入口、真实使用截图、商店签名与更新配置，并完成具体浏览器版本矩阵。不得将签名私钥或服务端密钥打入 ZIP。

## 验证

```powershell
node checks/verify-extension.cjs
$env:EXTENSION_BROWSER='chrome'
node checks/verify-extension.cjs
```

脚本使用临时独立浏览器配置，不碰用户日常浏览器数据。通过真实扩展 action 触发 `activeTab`，验证标题/完整 URL、登录跳转、两种保存、去重、「稍后整理」归类、系统主题、下载、移动端布局、无效 URL、账号变更、删除的目的地、容量失败、连接失败与草稿恢复。

实测 Chrome 152.0.7977.83、Edge 152.0.4191.53，均通过上述真实扩展链路。结果及截图在 `checks/extension/`，报告分别为 `results-chrome.json`、`results-msedge.json`。`home-before.png` 与 `home-after.png` 在相同主题、视口、状态下哈希一致；原 `app.js`、`v4.js`、`style.css`、`v4.css` 按修改前基线检查哈希，不纳入此次变更。

## 官方依据（2026-09-16 核对）

- Chrome 解压安装、固定图标、内部页不可链接：https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world
- Chrome 外部分发限制：https://developer.chrome.com/docs/extensions/how-to/distribute/install-extensions
- Manifest V3：https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3
- activeTab 权限：https://developer.chrome.com/docs/extensions/develop/concepts/activeTab
- Edge 本地加载：https://learn.microsoft.com/en-us/microsoft-edge/extensions/getting-started/extension-sideloading
- Chrome 扩展移植 Edge：https://learn.microsoft.com/en-us/microsoft-edge/extensions/developer-guide/port-chrome-extension
- 夸克官方扩展中心：https://extensions.quark.cn/
- 360 官方扩展说明：https://browser.360.cn/se/help/extension.html

官方拥有扩展中心不等于当前安装包已兼容全部版本；未完成实机验证的浏览器均标为待验证。
