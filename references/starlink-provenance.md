# 星链主题来源

- 引擎：Vincent Garreau / particles.js，MIT License。
- 源码：https://github.com/VincentGarreau/particles.js
- 下载：https://raw.githubusercontent.com/VincentGarreau/particles.js/master/particles.js
- 获取日期：2026-10-12。
- 运行源码：../dist/assets/starlink/particles.js；许可证：../dist/assets/starlink/LICENSE.md。
- 原引擎不修改；frame.js 提供粒子数量、速度、连线距离与交互配置，点和连线按明暗模式使用黑白中性色。iframe 用于隔离原引擎全局对象、事件和动画生命周期。
- 数量设置按当前账号/访客保存在本机；会员资格、主题上架状态、体验时长使用项目现有后台及主题权限接口。
- 后台本地改动：membership/resources.json 追加 starlink，shiyu-feature-config.ts 追加个性化目录；既有免费方案不变，会员沿用新增主题继承规则。
- 浏览器验证采用隔离的权限/访客接口响应；未修改生产配置，未发布。
