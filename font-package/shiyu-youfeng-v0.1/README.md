# 拾隅游风字体包 v0.1

这是 D「游风」方向的可安装、可下载预览包。它已经是可用的字体文件，但仍是基于开源字库组合形成的衍生版本，不是已经逐字原创完成的独占字库。

## 文件

- `ShiyuYoufeng-Preview-Regular.ttf`：桌面安装字体，可用于常见设计与办公软件。
- `ShiyuYoufeng-Preview-Regular.woff2`：拾隅网站使用的压缩网页字体。
- `ShiyuYoufeng-Preview-glyphs.svg`：全部已覆盖字符的 SVG 轮廓符号，共 8136 个；可无损缩放、旋转、扭曲和转路径编辑。
- `ShiyuYoufeng-Preview-brand-samples.svg`：打开即可查看的品牌样句 SVG，文字已经全部转为路径。
- `shiyu-youfeng.css`：网站接入示例。
- `coverage.json`：字符覆盖、来源与文件哈希。
- `OFL-Ma-Shan-Zheng.txt`、`OFL-Alegreya.txt`：上游许可原文。
- `FONTLOG.md`：本衍生包说明。

## 当前覆盖

- 汉字：6763 个，覆盖 Ma Shan Zheng 完整母版中的 GB 2312 常用简体汉字规模。
- 总 Unicode 字符：8136 个，包括英文字母、数字和常用标点。
- 字形采用简体中文（zh-CN）方向，不做繁体自动转换。

这不是“全部 Unicode 汉字”。现行 GB 18030—2022 涵盖的汉字规模远高于本包；若要求所有罕见字、生僻字和扩展区汉字都保持同一游风风格，需要继续生成并逐字验收，不能通过浏览器自动补齐。

## 使用

安装：双击 `ShiyuYoufeng-Preview-Regular.ttf`，按系统提示安装。

网页：引入 `shiyu-youfeng.css`，然后使用：

```css
body { font-family: "Shiyu Youfeng Preview", sans-serif; }
```

SVG 文件是轮廓源，不是网页正文的运行格式。网页正文使用 WOFF2；桌面应用使用 TTF。
