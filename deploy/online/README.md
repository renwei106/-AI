# 拾隅统一线上发布

以后前后台统一使用 `publish.ps1` 发布，不要分别运行前台脚本或手动重启后台。

```powershell
& '.\deploy\online\publish.ps1' -ReleaseRecord '<已确认的网站上线记录 JSON 路径>'
```

脚本按固定顺序执行：

1. 构建并检查后台代码已提交；
2. 从主站、后台及工具站 Git 提交打包，先上传三个版本；
3. 保留线上数据、权限和密钥；确认没有正在执行的工具任务，备份账号 JSON 与支付数据库，追加已确认的上线记录，再同步切换三个服务；
4. 检查后台、前台、工具站、运营接口及英文资源，失败自动回退三个版本。历史上线记录保留，不能因为回退而删除。

上线记录 JSON 使用后台原有字段：`id`、`target: website`、`version`、`releasedAt`、`changeType`、`summary`、`createdAt`、`operator`。脚本校验版本为当前网站补丁版本递增 1；不允许用本地历史记录覆盖生产历史。用户指定其他版本跨度时需先调整相应校验。

经用户明确确认初始化本地已审核英文时，在该次记录添加 `initializeEnglish: true`。脚本先预检后台 `shiyu-i18n/english-seed.json`，备份并追加上线记录后，仅补入缺失英文、发布当前源码对应的英文包并启用 English；保留线上已有译文、中文默认语言、其他语言和公告。发布失败会恢复原语言库。此字段默认不设置，后续发布和服务重启不会自行导入或重新启用英文。

正式首页：`https://shiyubox.com/`。后台：`https://admin.shiyubox.com/`。工具站：`https://tool.shiyubox.com/`。
已在本次发布前构建验证后台时，可使用 `-SkipBuild` 跳过重复构建。脚本不修改 Nginx、证书或支付回调，不覆盖线上账号与业务数据；各版本记录 `RELEASE_COMMIT`，旧版本保留供回退。统计模块通过后台服务的 `analytics.conf` 设置 `SHIYU_ANALYTICS_ENV=production`；失败时连同原服务配置和三端代码一起回退。依赖安装在切换前进行，不修改旧版本依赖目录。
