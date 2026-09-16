# 拾隅 · 七幕粒子版本

日期：2026-09-16。修改前版本：Git `6028bd4`，快照 `baselines/official-v2-20260916/`。

## 本次调整

七幕叙事现为「点、旋律、鸟群、地球、太阳系、银河、原子」，天体意象沿用本轮确认的方向。

开场取消黑灰山景，全程取消照片。保留此前认可的五段主要文案，补充旋律与轨道两幕；品牌标识、深色基调、居中叙事、无需点击的浏览方式、产品入口维持原有方向。

## 视觉与节奏

- 同一批粒子保持索引对应，滚动控制形态插值，支持连续推进及倒放。
- 第一段由五条流动谱线与五枚音符组成，谱线连续起伏，音符按错开的节拍上下律动。
- 17 只点阵鸟组成 V 形队列，各自错开振翅节奏。
- 地球由海陆点阵和浅经纬线组成，缓慢自转。
- 太阳系展示八条固定轨道、八颗球形行星与土星环；行星同时公转和自转，地球使用蓝绿表面纹理并拥有独立绕行的月亮。土星本体沿星环法线自转，星环独立保持固定平面，只随公转平移；太阳进行更缓慢的自转并保留轻微呼吸。尺寸、距离用于构图，不是科学比例模型。
- 银河以短棒结构为骨架，使用两条更宽、更亮的主要旋臂和两条较柔和的次旋臂；星点顺旋臂方向持续缓慢转动，内层略快于外层。中心不是发光的黑洞本体，而是小型暗核与外围发光气体环：事件视界本身不发光，能被看见的是周围的炽热物质。暗核与发光环为叙事辨识度做了比例放大。
- 所有幕间加入松散阶段：粒子先向外打散并降低亮度，再分批重组为下一形态。银河回到原点时使用更大的松散幅度。
- 最终形态采用快速呼吸的原子核与三颗高速电子，电子约两至三秒完成一圈。每颗电子刚刚划过的位置形成接近整圈的粒子余辉，使三条圆形轨迹清晰可辨；尾迹末端仍逐渐变稀、变暗并消融，亮度梯度随电子高速转动。图形本身可点击，底部单独提供「进入拾隅」按钮，结尾标题明确出现「拾隅」。第 06 幕继续向下滚动会回到开篇。
- 横向展开的形态针对手机单独缩小，地球保持相对更大的辨识尺寸。
- 全程原生滚动，无点击启动或滚动吸附。滚动轨道从 820svh 增至 1780svh；仅在最后一段完成首尾闭合后复位到开篇，以便继续向下浏览。

## 海岸线数据

使用 [Natural Earth 1:110m land 数据](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson)。Natural Earth 在其[使用条款](https://www.naturalearthdata.com/about/terms-of-use/)中将矢量与栅格地图数据列为公共领域。

原始数据保存在 `checks/official-v2/natural-earth-land.geojson`。生成脚本提取 127 个陆地多边形，将经纬度保留两位小数，输出约 77 KB 的本地脚本 `dist/official/v2/assets/land-outline.js`；页面运行时无外部地图或图片请求。

重新生成：

```powershell
node checks/official-v2/build-land-data.cjs checks/official-v2/natural-earth-land.geojson
```

## 银河结构参考

- [NASA：Milky Way Galaxy](https://science.nasa.gov/resource/the-milky-way-galaxy/)：银河系以中央棒为核心，由两条主要旋臂与两条较弱旋臂构成；太阳位于猎户臂支。
- [NASA/JPL：Two of the Milky Way's Spiral Arms Go Missing](https://www.jpl.nasa.gov/news/two-of-the-milky-ways-spiral-arms-go-missing/)：斯库盾—半人马臂与英仙臂为主要旋臂，另外两条旋臂较弱。
- [ESO/EHT：First Image of the Black Hole at the Centre of the Milky Way](https://www.eso.org/public/images/eso2208-eht-mwa/)：人马座 A* 图像中的暗部是黑洞阴影，周围亮环来自发光气体；页面据此避免把黑洞本体画成发光球。

## 验证入口

运行 `node checks/official-v2/verify-particles.cjs`，覆盖七幕显示、固定视口、桌面滚轮与回看、所有主要形态的持续运动、手机触摸、窄屏与横屏、过渡文案互斥、圆形入口、末尾回到开篇、减少动态效果、无 WebGL 及无 JavaScript 的降级。

结果及逐幕截图：`checks/official-v2/particles-review/`。旧版图片和验证结果继续保留，不作为当前视觉的引用。

本轮通过 `node checks/official-v2/review-entry-rings.cjs` 记录土星在 0、8、16 秒及银河在 0、30、60 秒的对照画面，检查星环平面与银河倾角的稳定性。截图位于 `checks/official-v2/particles-review/entry-rings/`。调整前的代码和截图保存在 `baselines/official-v2-before-entry-rings-20260916-103258/`。
