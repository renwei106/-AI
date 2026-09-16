from __future__ import annotations

import hashlib
import json
import shutil
import sys
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

PACKAGE = Path(__file__).resolve().parent
WORKSPACE = PACKAGE.parent.parent
TOOLS = WORKSPACE / "checks" / "shiyu-type-study-20260916" / "tools" / "fonttools"
INPUTS = WORKSPACE / "checks" / "shiyu-type-study-20260916" / "fonts"
BUILD = PACKAGE / "_build"
sys.path.insert(0, str(TOOLS))

from fontTools.merge import Merger
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

FAMILY = "Shiyu Youfeng Preview"
STYLE = "Regular"
VERSION = "Version 0.1"
TTF_NAME = "ShiyuYoufeng-Preview-Regular.ttf"
WOFF2_NAME = "ShiyuYoufeng-Preview-Regular.woff2"
SVG_NAME = "ShiyuYoufeng-Preview-glyphs.svg"
SAMPLE_SVG_NAME = "ShiyuYoufeng-Preview-brand-samples.svg"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def subset_font(font: TTFont, unicodes: set[int]) -> TTFont:
    options = Options()
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_legacy = True
    options.name_languages = ["*"]
    options.notdef_outline = True
    options.recalc_average_width = True
    subsetter = Subsetter(options=options)
    subsetter.populate(unicodes=unicodes)
    subsetter.subset(font)
    return font


def set_names(font: TTFont) -> None:
    name = font["name"]
    copyright_text = (
        "Derived font system combining Ma Shan Zheng and Alegreya. "
        "Copyright remains with the respective upstream authors. Licensed under SIL OFL 1.1."
    )
    values = {
        0: copyright_text,
        1: FAMILY,
        2: STYLE,
        3: f"{FAMILY} {VERSION}",
        4: f"{FAMILY} {STYLE}",
        5: VERSION,
        6: "ShiyuYoufengPreview-Regular",
        13: "This Font Software is licensed under the SIL Open Font License, Version 1.1.",
        14: "https://openfontlicense.org",
    }
    for name_id, value in values.items():
        name.setName(value, name_id, 3, 1, 0x409)
        name.setName(value, name_id, 1, 0, 0)
    if "OS/2" in font:
        font["OS/2"].usWeightClass = 400
        font["OS/2"].fsSelection &= ~0b100001
        font["OS/2"].fsSelection |= 0b1000000
    font["head"].macStyle = 0
    font["post"].italicAngle = 0


def export_svg_sprite(font: TTFont, destination: Path) -> int:
    cmap = font.getBestCmap()
    glyph_set = font.getGlyphSet()
    hmtx = font["hmtx"].metrics
    ascent = font["hhea"].ascent
    descent = font["hhea"].descent
    height = ascent - descent
    symbols: list[str] = []
    for codepoint, glyph_name in sorted(cmap.items()):
        pen = SVGPathPen(glyph_set)
        glyph_set[glyph_name].draw(pen)
        path_data = pen.getCommands()
        advance = max(1, hmtx.get(glyph_name, (font["head"].unitsPerEm, 0))[0])
        title = escape(chr(codepoint)) if codepoint >= 0x20 else f"U+{codepoint:04X}"
        outline = (
            f'<path d="{path_data}"/>' if path_data else ""
        )
        symbols.append(
            f'<symbol id="u{codepoint:04X}" viewBox="0 0 {advance} {height}">'
            f'<title>{title} / U+{codepoint:04X}</title>'
            f'<g transform="translate(0 {ascent}) scale(1 -1)">{outline}</g>'
            "</symbol>"
        )
    destination.write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<svg xmlns="http://www.w3.org/2000/svg">\n<defs>\n'
        + "\n".join(symbols)
        + "\n</defs>\n</svg>\n",
        encoding="utf-8",
    )
    return len(symbols)


def export_svg_sample(font: TTFont, destination: Path) -> None:
    cmap = font.getBestCmap()
    glyph_set = font.getGlyphSet()
    hmtx = font["hmtx"].metrics
    lines = [
        ("拾隅", 0.22, 245),
        ("拾起喜欢，安放日常。", 0.105, 455),
        ("Shiyu 0123456789", 0.08, 610),
    ]
    groups: list[str] = []
    for text, scale, baseline in lines:
        glyphs: list[str] = []
        cursor = 0
        for character in text:
            glyph_name = cmap.get(ord(character))
            if glyph_name is None:
                continue
            pen = SVGPathPen(glyph_set)
            glyph_set[glyph_name].draw(pen)
            path_data = pen.getCommands()
            if path_data:
                glyphs.append(f'<path transform="translate({cursor} 0)" d="{path_data}"/>')
            cursor += hmtx.get(glyph_name, (font["head"].unitsPerEm, 0))[0]
        x = (1200 - cursor * scale) / 2
        groups.append(
            f'<g transform="translate({x:.2f} {baseline}) scale({scale} {-scale})">'
            + "".join(glyphs)
            + "</g>"
        )
    destination.write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" role="img" '
        'aria-labelledby="title desc">\n'
        '<title id="title">拾隅游风品牌样句</title>\n'
        '<desc id="desc">全部文字已经转换为可缩放 SVG 路径。</desc>\n'
        '<rect width="1200" height="720" fill="#f7f5ee"/>\n'
        '<g fill="#23443a">\n'
        + "\n".join(groups)
        + "\n</g>\n</svg>\n",
        encoding="utf-8",
    )


def write_readme(stats: dict) -> None:
    (PACKAGE / "README.md").write_text(
        f"""# 拾隅游风字体包 v0.1

这是 D「游风」方向的可安装、可下载预览包。它已经是可用的字体文件，但仍是基于开源字库组合形成的衍生版本，不是已经逐字原创完成的独占字库。

## 文件

- `{TTF_NAME}`：桌面安装字体，可用于常见设计与办公软件。
- `{WOFF2_NAME}`：拾隅网站使用的压缩网页字体。
- `{SVG_NAME}`：全部已覆盖字符的 SVG 轮廓符号，共 {stats['svg_symbols']} 个；可无损缩放、旋转、扭曲和转路径编辑。
- `{SAMPLE_SVG_NAME}`：打开即可查看的品牌样句 SVG，文字已经全部转为路径。
- `shiyu-youfeng.css`：网站接入示例。
- `coverage.json`：字符覆盖、来源与文件哈希。
- `OFL-Ma-Shan-Zheng.txt`、`OFL-Alegreya.txt`：上游许可原文。
- `FONTLOG.md`：本衍生包说明。

## 当前覆盖

- 汉字：{stats['cjk_unified']} 个，覆盖 Ma Shan Zheng 完整母版中的 GB 2312 常用简体汉字规模。
- 总 Unicode 字符：{stats['total_codepoints']} 个，包括英文字母、数字和常用标点。
- 字形采用简体中文（zh-CN）方向，不做繁体自动转换。

这不是“全部 Unicode 汉字”。现行 GB 18030—2022 涵盖的汉字规模远高于本包；若要求所有罕见字、生僻字和扩展区汉字都保持同一游风风格，需要继续生成并逐字验收，不能通过浏览器自动补齐。

## 使用

安装：双击 `{TTF_NAME}`，按系统提示安装。

网页：引入 `shiyu-youfeng.css`，然后使用：

```css
body {{ font-family: "Shiyu Youfeng Preview", sans-serif; }}
```

SVG 文件是轮廓源，不是网页正文的运行格式。网页正文使用 WOFF2；桌面应用使用 TTF。
""",
        encoding="utf-8",
    )


def build() -> None:
    PACKAGE.mkdir(parents=True, exist_ok=True)
    BUILD.mkdir(parents=True, exist_ok=True)
    ma_path = INPUTS / "MaShanZheng-Regular-full.ttf"
    alegreya_path = INPUTS / "Alegreya-full.ttf"
    if not ma_path.exists() or not alegreya_path.exists():
        raise FileNotFoundError("Full upstream TTF inputs are missing")

    ma = TTFont(ma_path)
    alegreya_variable = TTFont(alegreya_path)
    alegreya = instantiateVariableFont(alegreya_variable, {"wght": 500}, inplace=False)

    ma_cmap = set(ma.getBestCmap())
    alegreya_cmap = set(alegreya.getBestCmap())
    chinese_unicodes = {cp for cp in ma_cmap if cp >= 0x2E80}
    latin_unicodes = {cp for cp in alegreya_cmap if cp < 0x2E80}
    subset_font(ma, chinese_unicodes)
    subset_font(alegreya, latin_unicodes)

    ma_subset = BUILD / "chinese.ttf"
    latin_subset = BUILD / "latin.ttf"
    ma.save(ma_subset)
    alegreya.save(latin_subset)

    merged = Merger().merge([str(ma_subset), str(latin_subset)])
    set_names(merged)
    ttf_path = PACKAGE / TTF_NAME
    merged.save(ttf_path)

    webfont = TTFont(ttf_path)
    webfont.flavor = "woff2"
    woff2_path = PACKAGE / WOFF2_NAME
    webfont.save(woff2_path)

    final_font = TTFont(ttf_path)
    cmap = set(final_font.getBestCmap())
    svg_path = PACKAGE / SVG_NAME
    svg_symbols = export_svg_sprite(final_font, svg_path)
    sample_svg_path = PACKAGE / SAMPLE_SVG_NAME
    export_svg_sample(final_font, sample_svg_path)
    stats = {
        "family": FAMILY,
        "version": VERSION,
        "total_codepoints": len(cmap),
        "cjk_unified": sum(0x4E00 <= cp <= 0x9FFF for cp in cmap),
        "cjk_extension_a": sum(0x3400 <= cp <= 0x4DBF for cp in cmap),
        "latin_and_symbols_below_2e80": sum(cp < 0x2E80 for cp in cmap),
        "svg_symbols": svg_symbols,
        "files": {},
        "sources": [
            {
                "family": "Ma Shan Zheng",
                "role": "Simplified Chinese glyph outlines",
                "license": "SIL OFL 1.1",
            },
            {
                "family": "Alegreya",
                "instance": "weight 500",
                "role": "Latin letters, numbers and non-CJK punctuation",
                "license": "SIL OFL 1.1",
            },
        ],
        "coverage_note": "Preview package: common Simplified Chinese scale, not complete GB 18030-2022 Han coverage.",
    }
    for path in (ttf_path, woff2_path, svg_path, sample_svg_path):
        stats["files"][path.name] = {"bytes": path.stat().st_size, "sha256": sha256(path)}
    (PACKAGE / "coverage.json").write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8")
    (PACKAGE / "shiyu-youfeng.css").write_text(
        '@font-face {\n'
        f'  font-family: "{FAMILY}";\n'
        '  font-style: normal;\n'
        '  font-weight: 400;\n'
        '  font-display: swap;\n'
        f'  src: url("./{WOFF2_NAME}") format("woff2");\n'
        '}\n',
        encoding="utf-8",
    )
    shutil.copyfile(INPUTS / "Ma-Shan-Zheng-OFL.txt", PACKAGE / "OFL-Ma-Shan-Zheng.txt")
    shutil.copyfile(INPUTS / "Alegreya-OFL.txt", PACKAGE / "OFL-Alegreya.txt")
    (PACKAGE / "FONTLOG.md").write_text(
        "# FONTLOG\n\n"
        "Shiyu Youfeng Preview v0.1 combines the Simplified Chinese glyph coverage of Ma Shan Zheng "
        "with a static weight-500 instance of Alegreya for Latin letters and numbers. The sources were "
        "subset to non-overlapping Unicode ranges and merged into one installable font. Family names and "
        "metadata were changed to avoid presenting the derivative as either upstream original. No Chinese "
        "glyph outline has yet been redrawn as an exclusive original design.\n",
        encoding="utf-8",
    )
    write_readme(stats)

    zip_path = PACKAGE.parent / "shiyu-youfeng-v0.1.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for filename in (
            TTF_NAME,
            WOFF2_NAME,
            SVG_NAME,
            SAMPLE_SVG_NAME,
            "shiyu-youfeng.css",
            "coverage.json",
            "README.md",
            "FONTLOG.md",
            "OFL-Ma-Shan-Zheng.txt",
            "OFL-Alegreya.txt",
        ):
            archive.write(PACKAGE / filename, arcname=f"shiyu-youfeng-v0.1/{filename}")
    print(json.dumps({"package": str(PACKAGE), "zip": str(zip_path), **stats}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    build()
