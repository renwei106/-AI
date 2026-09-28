# 人物宠物素材

- 工具：内置 imagegen，生成模式，透明背景。
- 用途：默认纸片人物，草帽、侧辫、浅蓝衬衫、米白裙。
- 生产文件：`dist/assets/desktop-pet/paper-person.webp`（1024 × 1536，保留透明度）。
- 原始 PNG 本地副本：`.local/desktop-pet/human-source/paper-person.png`。
- 图像转换：Sharp WebP 编码，quality 90、alphaQuality 100，不改变构图与尺寸。
- 线条人物沿用项目的代码原生 SVG 方式绘制，独立分组用于头部和手臂动作，描线根据现有主题明暗调整。
- 两个前端使用相同资源；替换纸片人物的姿态或构图时，需要同步调整 SVG 关节和遮罩坐标。

## 最终生成提示词

Create one beautiful full-body paper-cutout illustrated human character for a tiny desktop companion in a Chinese calm personal workspace app. A friendly young adult woman wearing a pale wheat straw hat with a modest curved brim, dark brown hair with ONE side braid, a soft light-blue button blouse with sleeves to the wrists, a cream white gently tiered skirt ending just below the knees, and simple cream canvas shoes. Four-head-tall stylized human proportions, not a baby and not a doll. Warm friendly minimal face: dot-like dark eyes, faint blush, small smile. Delicate hand-drawn warm dark outlines, very restrained flat shading and subtle paper texture, cream narrow sticker-like outer paper edge. Polished Japanese editorial picture-book illustration, cozy and understated. Entire figure visible from top of hat through feet. Front-facing relaxed standing pose with a slight natural asymmetry; feet planted on the same baseline, head upright. Arms angled slightly outward away from the torso (15 degrees), small relaxed hands, with generous transparent air between the arms and skirt so each limb can be animated independently; no overlaps of hands with clothes. Braid stays fully within the head-and-shoulder region. The neck is short and the blouse has a clean neckline. Readable silhouette at just 80 pixels tall. Centered on a TRUE transparent background with generous empty padding on every side. No background, scenery, props, ground, shadow plane, text, labels, symbols, layout frame, or multiple figures. This is the actual production sprite asset, not a mockup.
