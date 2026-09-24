# Firefox 桌面版

与 Chrome 共用弹窗、登录桥接和收藏逻辑。使用 Firefox 原生 Promise API；构建时单独生成事件页 manifest，最低 Firefox 142。

## 构建与本地验证

运行 `node build-firefox-extension.cjs`，输出在 `.local/firefox-extension/`。
在 `about:debugging#/runtime/this-firefox` 点击“临时载入附加组件”，选择该目录的 manifest.json。此方式仅用于开发验证，重启浏览器后失效。

安装开发工具后，构建同时输出待签名 ZIP 到 `.local/firefox-artifacts/`：
`npm install --prefix .local/firefox-tools web-ext selenium-webdriver`

检查：`node .local/firefox-tools/node_modules/web-ext/bin/web-ext.js lint --source-dir .local/firefox-extension`

运行回归：`node checks/verify-firefox-extension.cjs`。可通过 FIREFOX_BINARY 和 GECKODRIVER 环境变量指定本地浏览器与驱动；测试采用独立临时配置和本地收藏数据，不访问线上账号。

## 正式安装包

正式版 Firefox 要求 Mozilla 签名。先运行 `node build-firefox-extension.cjs --production`，将生成的 ZIP 提交 Mozilla Add-on Developer Hub，选择自行分发（Unlisted），取得签名 XPI；不要将 ZIP 或 CRX 改名为 XPI。
签名提交前确认线上权限仅包含正式域名，并核对隐私披露：插件读取用户主动收藏的网址、标题和备注，通过拾隅页面保存；不读取整个浏览历史。

签名包在正式 Firefox 验证通过后，放入 `dist/extension/downloads/shiyu-extension-firefox-0.1.1.xpi`，然后将 `dist/extension/firefox-release.json` 中 ready 设为 true。发布仍需单独确认。
签名前下载页显示“Firefox 版准备中”，不会发给用户无法正式安装的包。
