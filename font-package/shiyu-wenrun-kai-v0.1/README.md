# 拾隅温润楷字体包 v0.1

这是原方案 B「温润楷」 的可安装、可下载预览包，气质为温润、亲近、自然书写感。它是基于开源字库组合形成的衍生版本，不是已经逐字原创完成的独占字库。

## 文件

- `ShiyuWenrunKai-Preview-Regular.ttf`：桌面安装字体。
- `ShiyuWenrunKai-Preview-Regular.woff2`：拾隅网站使用的压缩网页字体。
- `ShiyuWenrunKai-Preview-glyphs.svg`：全部已覆盖字符的 SVG 轮廓符号，共 44695 个。
- `ShiyuWenrunKai-Preview-brand-samples.svg`：打开即可查看的品牌样句 SVG，文字已经全部转为路径。
- `shiyu-wenrun-kai.css`：网站接入示例。
- `coverage.json`：字符覆盖、来源与文件哈希。
- `OFL-Chinese.txt`、`OFL-Latin.txt`：上游许可原文。
- `FONTLOG.md`：衍生包说明。

## 当前覆盖

- 汉字及汉字兼容区：30558 个。
- 总 Unicode 字符：44695 个，包括英文、数字和常用标点。
- 字形采用简体中文（zh-CN）方向，不做繁体自动转换。

当前覆盖不等于全部 Unicode 汉字。缺失字形会由系统后备字体显示；若要所有扩展区字符保持同一设计，需要继续生成并逐字验收。

## 使用

安装：双击 `ShiyuWenrunKai-Preview-Regular.ttf`，按系统提示安装。

网页：引入 `shiyu-wenrun-kai.css`，然后使用：

```css
body { font-family: "Shiyu Wenrun Kai Preview", sans-serif; }
```

SVG 是可自由缩放和变形的轮廓源；网页正文使用 WOFF2，桌面安装使用 TTF。
