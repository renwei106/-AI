# 拾隅统一线上发布

以后前后台统一使用 `publish.ps1` 发布，不要分别运行前台脚本或手动重启后台。

```powershell
& '.\deploy\online\publish.ps1'
```

脚本按固定顺序执行：

1. 构建并检查后台代码已提交；
2. 切换后台版本，保留服务器 `.local` 数据和依赖；
3. 发布前台版本；
4. 检查后台、前台和 `/api/shiyu/operations` 是否可用。

当前已验证的线上地址是 `http://39.106.4.85/`。`admin.shiyubox.com` 目前受域名备案拦截，`app.shiyubox.com` 尚未配置有效解析，因此不作为发布地址。
