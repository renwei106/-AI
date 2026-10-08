# 官网与首页搜索基础调整（未发布）

官网标题：拾隅官网｜个性化起始页，网址收藏与导航。

官网描述：拾隅是一站式个性化网址收藏与导航平台，将网址收藏、快捷导航和日常工具融入浏览器起始页，打造属于你的个性首页。

## 已准备的代码

- 官网 HTML 声明 `https://www.shiyubox.com/` 为 canonical。内部 v3 预览保留访问与资源路径，使用同一 canonical，不添加重复介绍页。
- 官网的 `robots.txt` 和 `sitemap.xml` 放在 `dist/official/v3/`。现有 www 代理将这两个根路径映射到该目录，保持 `/api/shiyu/operations` 的既有例外配置。
- 应用首页 sitemap 移除 v2，只列 `https://shiyubox.com/`；官网 sitemap 只列 `https://www.shiyubox.com/`。两个域名分别提交所属站点的 sitemap，避免混用域名归属。
- 应用首页 canonical 在服务端生成，仅正式主域 `/`、`/index.html` 且无 `page` 参数时添加。空间、世界、会员入口和本地预览不添加这一声明。
- v2 页面入口使用 301 到官网，保留查询参数；旧版脚本及素材维持 410，不恢复旧文件。
- 正文、H1、布局、配色、字体、登录、账号、支付及工具服务均不调整。应用首页原 title 和 description 保留。

## 发布前必须核对

当前 Nginx 会把应用、空间、世界的 Host 都传成 `127.0.0.1:4318`，所以需只在这个应用代理块追加 `proxy_set_header X-Shiyu-Public-Host $host;`。它保留原 Host 和路由，只用于区分服务端 canonical 的适用域名；Node 仅信任来自回环地址的此头。外部用户传入的同名头必须由 Nginx 覆盖。

使用 `node deploy/online/prepare-seo-nginx.mjs 当前配置副本 候选配置` 生成候选。不要将本地旧快照直接覆盖线上；发布时重新读取当前配置、比较唯一差异、保存配置备份，并执行 `nginx -t` 后平滑 reload。若配置或服务健康验证失败，恢复旧配置及网站版本。只改网站服务，不重启后台、工具或其他应用。

受影响文件：`dist/official/v3/index.html`、`dist/official/v3/robots.txt`、`dist/official/v3/sitemap.xml`、`dist/sitemap.xml`、`preview.cjs`、`i18n/frontend-server.cjs`，以及上述单条应用代理头。

发布内容与版本仍需另行确认；本轮没有修改线上、追加发布历史或向百度推送网址。

## 本地验证

`node checks/verify-seo-basics.cjs` 使用隔离的本地配置夹具与反向代理模拟，不读取真实账号。验证 sitemap/robots 的状态及 MIME、旧版 301/410、查询参数保留、官网和首页 canonical、私有入口与外部代理头隔离、安装弹窗及脚本/资源错误。桌面 1440×900、手机 390×844 与 V1.2.11 已发布官网截图逐字节一致，HTML body 也保持一致。Nginx 候选配置仅增加一条代理头，真正 `nginx -t` 与域名验证留到发布前执行。

## 百度资源平台操作

发布并验证后，登录站点所有者账户，分别核对主域与 www 的站点归属。保持现有百度验证代码和验证文件；不要凭本地 meta 标签认定验证已成功。

分别提交 `https://shiyubox.com/` 和 `https://www.shiyubox.com/`，以及各自 `/sitemap.xml`。提交配额和 sitemap 权限以实际账户显示为准；需要 API 推送时使用对应站点 token，不写入前端或日志。

检查抓取诊断返回状态和正文，再观察抓取频次、索引量、品牌词展现/点击。人工使用 Baiduspider UA 的测试不能作为真实蜘蛛来访的证据；真实来访需双向 DNS 核验。提交成功也不代表已建立索引，不承诺排名和固定生效天数。
