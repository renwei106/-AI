# 用户体系接入方案

本次交付为登录与个人中心前端原型。短信/邮件发送、密码验证、微信/华为/小米认证、服务端会话和账号数据隔离尚未接入。signed 和本机 UUID 仅用于体验，不是安全身份。现有用户收藏不清空、不迁移。

## 身份与联合登录
- users：id（服务端 UUID 主键）、display_name、avatar_key、status、created_at。
- identities：user_id、provider、provider_app_id、subject、union_id；(provider, provider_app_id, subject) 唯一。第三方昵称不作为关联依据。
- verified_contacts：user_id、type（phone/email）、normalized_value、verified_at；已验证联系方式唯一约束。
- password_credentials：user_id、argon2id_hash；不保存明文密码。
- sessions：服务端会话，Secure/HttpOnly/SameSite Cookie，过期、注销及撤销。
- verification_challenges：用途、目标、验证码哈希、过期时间、重试次数、消费时间；频率限制和一次性消费。
- spaces/scenes/groups/bookmarks：owner_user_id 与父级外键。服务端每次创建、修改、删除校验会话及所有权，不能信任客户端 signed 或提交的 user_id。

首次注册事务：创建 user，绑定已验证 identity/contact，并幂等创建三个空空间「工作空间」「生活空间」「灵感空间」，各带日常场景与未分类分组。不导入大容量演示数据。初始化失败整笔回滚，不重复创建。

微信：网站扫码 OAuth → 验证 state、服务端交换 code → 获取第三方 subject → 暂存待关联身份 → 短信验证手机号 → 绑定或登录已有用户。手机号冲突需已有账号验证，禁止仅凭客户端手机号合并账号。已有用户绑定第三方也需重新认证。微信内关联入口需对应公众号网页授权资质。网站扫码不能假定获得手机号。

接口建议：POST /auth/sms/send、/auth/sms/verify、/auth/password、/auth/email/send、/auth/email/verify；GET /auth/:provider/start、/auth/:provider/callback；POST /auth/bind-phone、/auth/logout；GET/PATCH /me；POST /me/avatar。

头像服务端重复检查真实文件类型、像素、大小：1:1，128–2048 px，≤2MB，PNG/JPEG/WebP；去元数据并转码存储。内置头像直接存图标 ID。

## 第三方调研
- 小米：官方 OAuth 2.0 文档明确 Web/Wap 站点可用 Authorization Code；需要开放平台应用与回调地址，不能直接读取电脑登录态。https://dev.mi.com/docs/passport/oauth2/
- 华为：Account Kit 提供华为账号登录能力。具体 Web 应用权限、地域和审核需开发者控制台确认，未承诺免审接入。https://developer.huawei.com/consumer/en/hms/huawei-accountkit
- 微信网站扫码参考：https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html 。本次工具未能读取官方该页，应在注册应用时再次核对最新要求。

上线所需：部署域名与 HTTPS、数据库、短信服务资质及签名模板、邮件发送服务、微信开放平台网站应用 AppID/Secret 与回调域名、厂商 OAuth 客户端配置。密钥仅部署服务端，不进前端或 Git。
