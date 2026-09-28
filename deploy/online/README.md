# 拾隅统一线上发布

以后前后台统一使用 `publish.ps1` 发布，不要分别运行前台脚本或手动重启后台。

```powershell
& '.\deploy\online\publish.ps1'
```

脚本按固定顺序执行：

1. 构建并检查后台代码已提交；
2. 从前后台 Git 提交打包，先上传两个版本；
3. 保留线上数据、权限和密钥；锁文件有变化时为新版本单独安装依赖，然后同步切换前后台；
4. 检查后台、前台、运营接口及英文资源，失败自动回退两端版本。

正式首页：`https://shiyubox.com/`。后台：`https://admin.shiyubox.com/`。
已在本次发布前构建验证后台时，可使用 `-SkipBuild` 跳过重复构建。脚本不修改 Nginx、证书或支付回调，不覆盖线上账号与业务数据；各版本记录 `RELEASE_COMMIT`，旧版本保留供回退。统计模块通过后台服务的 `analytics.conf` 设置 `SHIYU_ANALYTICS_ENV=production`；失败时连同原服务配置和两端代码一起回退。依赖安装在切换前进行，不修改旧版本依赖目录。
