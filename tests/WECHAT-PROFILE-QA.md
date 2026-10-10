# 微信服务号可选资料授权

实现范围：保留扫码关注及现有绑定/暂不设置登录流程。普通注册扫码事件以被动文本回复提供可选网页授权链接；不为资料绑定、注销二维码或旧账号补发链接。新注册账号在授权有效期内独立检查资料结果，无需等待手机授权完成才能登录。

微信配置：已确认网页授权域名为 `shiyubox.com`。回调路径 `/api/shiyu/auth/wechat/profile-callback`，作用域 `snsapi_userinfo`。继续使用既有服务号 AppID/AppSecret，不新增另一套微信账号配置。授权票据在内存保存 15 分钟；后台重启后旧链接失效，重新扫码可获取新链接。

保护：随机 state 绑定服务号 AppID 和扫码 OpenID；校验换取 token 和用户资料返回的 OpenID；单次使用、限时、限制待处理票据数量。不以 OAuth 回调发放登录会话。头像上游仅接受 qlogo.cn 域名、禁用重定向、限制类型/大小/超时，通过登录态接口返回。头像请求须匹配当前资料版本。用户编辑字段分别保护；头像弹窗保持打开，不被后台结果重新渲染。

修改文件：
- 网站：`dist/account-access.js`、`dist/avatar-catalog.js`、`shiyu-user-proxy.cjs`。
- 聚合后台：`shiyu-user-plugin.ts`、`shiyu-wechat-profile.cjs`。

验证命令：
- `node --test tests/wechat-profile.test.cjs tests/wechat-profile-proxy.test.cjs`：7 项通过。
- `node tests/wechat-profile-ui.cjs`：延迟 5.5 秒授权、输入中昵称、已打开头像弹窗和手动选择、账号切换迟到响应，4 项通过。API 使用隔离 fixture，不请求真实微信接口。
- `node tests/account-session-ui.cjs`：原有 9 项登录/账号隔离回归通过。
- 聚合后台 TypeScript 构建检查和 Vite 生产构建通过。Vite 保留原有运行时字体路径和大包提示。
- 同一主题/视口的注册资料页截图：`.local/wechat-profile-qa/before.png` 和 `after.png`。授权同步只改变头像和昵称，没有改变布局。

尚未上线，尚未用真实微信用户验证授权权限及手机授权。发布需要网站与聚合后台一起更新，网站代理须转发 OAuth Location 和资料写入 Origin。仅这两个服务受影响；工具服务、浏览器插件、其他后台不在发布范围。发布前仍需确认版本、追加上线记录、备份和按服务逐个健康验证。域名校验文件的既有 Nginx 路径需要保留。
