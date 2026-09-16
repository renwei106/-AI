# 拾隅清雅宋字体包 v0.1

这是原方案 A「清雅宋」 的可安装、可下载预览包，气质为书卷气、留白感、克制的精致。它是基于开源字库组合形成的衍生版本，不是已经逐字原创完成的独占字库。

## 文件

- `ShiyuQingyaSong-Preview-Regular.ttf`：桌面安装字体。
- `ShiyuQingyaSong-Preview-Regular.woff2`：拾隅网站使用的压缩网页字体。
- `ShiyuQingyaSong-Preview-glyphs.svg`：全部已覆盖字符的 SVG 轮廓符号，共 30762 个。
- `ShiyuQingyaSong-Preview-brand-samples.svg`：打开即可查看的品牌样句 SVG，文字已经全部转为路径。
- `shiyu-qingya-song.css`：网站接入示例。
- `coverage.json`：字符覆盖、来源与文件哈希。
- `OFL-Chinese.txt`、`OFL-Latin.txt`：上游许可原文。
- `FONTLOG.md`：衍生包说明。

## 当前覆盖

- 汉字及汉字兼容区：27938 个。
- 总 Unicode 字符：30762 个，包括英文、数字和常用标点。
- 字形采用简体中文（zh-CN）方向，不做繁体自动转换。

当前覆盖不等于全部 Unicode 汉字。缺失字形会由系统后备字体显示；若要所有扩展区字符保持同一设计，需要继续生成并逐字验收。

## 使用

安装：双击 `ShiyuQingyaSong-Preview-Regular.ttf`，按系统提示安装。

网页：引入 `shiyu-qingya-song.css`，然后使用：

```css
body { font-family: "Shiyu Qingya Song Preview", sans-serif; }
```

SVG 是可自由缩放和变形的轮廓源；网页正文使用 WOFF2，桌面安装使用 TTF。
