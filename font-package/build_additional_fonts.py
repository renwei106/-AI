from __future__ import annotations

import hashlib
import json
import shutil
import sys
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
FONT_PACKAGE = ROOT / "font-package"
INPUTS = ROOT / "checks" / "shiyu-type-study-20260916" / "fonts"
TOOLS = ROOT / "checks" / "shiyu-type-study-20260916" / "tools" / "fonttools"
sys.path.insert(0, str(TOOLS))

from fontTools.merge import Merger
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


CONFIGS = [
    {
        "slug": "shiyu-qingya-song-v0.1",
        "display": "拾隅清雅宋",
        "family": "Shiyu Qingya Song Preview",
        "postscript": "ShiyuQingyaSongPreview-Regular",
        "stem": "ShiyuQingyaSong-Preview",
        "css": "shiyu-qingya-song.css",
        "cn_file": "NotoSerifSC-full.ttf",
        "cn_family": "Noto Serif SC",
        "cn_axes": {"wght": 400},
        "cn_license": "Noto-Serif-SC-OFL.txt",
        "latin_file": "CormorantGaramond-full.ttf",
        "latin_family": "Cormorant Garamond",
        "latin_axes": {"wght": 500},
        "latin_license": "Cormorant-Garamond-OFL.txt",
        "direction": "A「清雅宋」",
        "mood": "书卷气、留白感、克制的精致",
    },
    {
        "slug": "shiyu-wenrun-kai-v0.1",
        "display": "拾隅温润楷",
        "family": "Shiyu Wenrun Kai Preview",
        "postscript": "ShiyuWenrunKaiPreview-Regular",
        "stem": "ShiyuWenrunKai-Preview",
        "css": "shiyu-wenrun-kai.css",
        "cn_file": "LXGWWenKai-Regular.ttf",
        "cn_family": "LXGW WenKai",
        "cn_axes": {},
        "cn_license": "LXGW-WenKai-OFL.txt",
        "latin_file": "Lora-full.ttf",
        "latin_family": "Lora",
        "latin_axes": {"wght": 400},
        "latin_license": "Lora-OFL.txt",
        "direction": "B「温润楷」",
        "mood": "温润、亲近、自然书写感",
    },
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def is_han(codepoint: int) -> bool:
    return any(
        start <= codepoint <= end
        for start, end in (
            (0x3400, 0x4DBF),
            (0x4E00, 0x9FFF),
            (0xF900, 0xFAFF),
            (0x20000, 0x2FA1F),
            (0x30000, 0x323AF),
        )
    )


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


def static_font(path: Path, axes: dict[str, int]) -> TTFont:
    font = TTFont(path)
    return instantiateVariableFont(font, axes, inplace=False) if axes and "fvar" in font else font


def set_names(font: TTFont, config: dict) -> None:
    name = font["name"]
    copyright_text = (
        f"Derived font system combining {config['cn_family']} and {config['latin_family']}. "
        "Copyright remains with the respective upstream authors. Licensed under SIL OFL 1.1."
    )
    values = {
        0: copyright_text,
        1: config["family"],
        2: "Regular",
        3: f"{config['family']} Version 0.1",
        4: f"{config['family']} Regular",
        5: "Version 0.1",
        6: config["postscript"],
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
    with destination.open("w", encoding="utf-8", newline="\n") as output:
        output.write('<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg">\n<defs>\n')
        for codepoint, glyph_name in sorted(cmap.items()):
            pen = SVGPathPen(glyph_set)
            glyph_set[glyph_name].draw(pen)
            path_data = pen.getCommands()
            advance = max(1, hmtx.get(glyph_name, (font["head"].unitsPerEm, 0))[0])
            title = escape(chr(codepoint)) if codepoint >= 0x20 else f"U+{codepoint:04X}"
            outline = f'<path d="{path_data}"/>' if path_data else ""
            output.write(
                f'<symbol id="u{codepoint:04X}" viewBox="0 0 {advance} {height}">'
                f'<title>{title} / U+{codepoint:04X}</title>'
                f'<g transform="translate(0 {ascent}) scale(1 -1)">{outline}</g>'
                "</symbol>\n"
            )
        output.write("</defs>\n</svg>\n")
    return len(cmap)


def export_svg_sample(font: TTFont, destination: Path, title: str) -> int:
    cmap = font.getBestCmap()
    glyph_set = font.getGlyphSet()
    hmtx = font["hmtx"].metrics
    lines = [("拾隅", 0.22, 245), ("拾起喜欢，安放日常。", 0.105, 455), ("Shiyu 0123456789", 0.08, 610)]
    groups: list[str] = []
    path_count = 0
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
                path_count += 1
            cursor += hmtx.get(glyph_name, (font["head"].unitsPerEm, 0))[0]
        x = (1200 - cursor * scale) / 2
        groups.append(f'<g transform="translate({x:.2f} {baseline}) scale({scale} {-scale})">' + "".join(glyphs) + "</g>")
    destination.write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" role="img" aria-labelledby="title desc">\n'
        f'<title id="title">{escape(title)}品牌样句</title>\n'
        '<desc id="desc">全部文字已经转换为可缩放 SVG 路径。</desc>\n'
        '<rect width="1200" height="720" fill="#f7f5ee"/>\n'
        '<g fill="#23443a">\n' + "\n".join(groups) + "\n</g>\n</svg>\n",
        encoding="utf-8",
    )
    return path_count


def write_readme(package: Path, config: dict, stats: dict, names: dict) -> None:
    package.joinpath("README.md").write_text(
        f"""# {config['display']}字体包 v0.1

这是原方案 {config['direction']} 的可安装、可下载预览包，气质为{config['mood']}。它是基于开源字库组合形成的衍生版本，不是已经逐字原创完成的独占字库。

## 文件

- `{names['ttf']}`：桌面安装字体。
- `{names['woff2']}`：拾隅网站使用的压缩网页字体。
- `{names['svg']}`：全部已覆盖字符的 SVG 轮廓符号，共 {stats['svg_symbols']} 个。
- `{names['sample_svg']}`：打开即可查看的品牌样句 SVG，文字已经全部转为路径。
- `{config['css']}`：网站接入示例。
- `coverage.json`：字符覆盖、来源与文件哈希。
- `OFL-Chinese.txt`、`OFL-Latin.txt`：上游许可原文。
- `FONTLOG.md`：衍生包说明。

## 当前覆盖

- 汉字及汉字兼容区：{stats['han_codepoints']} 个。
- 总 Unicode 字符：{stats['total_codepoints']} 个，包括英文、数字和常用标点。
- 字形采用简体中文（zh-CN）方向，不做繁体自动转换。

当前覆盖不等于全部 Unicode 汉字。缺失字形会由系统后备字体显示；若要所有扩展区字符保持同一设计，需要继续生成并逐字验收。

## 使用

安装：双击 `{names['ttf']}`，按系统提示安装。

网页：引入 `{config['css']}`，然后使用：

```css
body {{ font-family: "{config['family']}", sans-serif; }}
```

SVG 是可自由缩放和变形的轮廓源；网页正文使用 WOFF2，桌面安装使用 TTF。
""",
        encoding="utf-8",
    )


def build_family(config: dict) -> dict:
    package = FONT_PACKAGE / config["slug"]
    build = package / "_build"
    package.mkdir(parents=True, exist_ok=True)
    build.mkdir(parents=True, exist_ok=True)
    names = {
        "ttf": f"{config['stem']}-Regular.ttf",
        "woff2": f"{config['stem']}-Regular.woff2",
        "svg": f"{config['stem']}-glyphs.svg",
        "sample_svg": f"{config['stem']}-brand-samples.svg",
    }

    chinese = static_font(INPUTS / config["cn_file"], config["cn_axes"])
    latin = static_font(INPUTS / config["latin_file"], config["latin_axes"])
    chinese_unicodes = {cp for cp in chinese.getBestCmap() if cp >= 0x2E80}
    latin_unicodes = {cp for cp in latin.getBestCmap() if cp < 0x2E80}
    subset_font(chinese, chinese_unicodes)
    subset_font(latin, latin_unicodes)
    # The Latin partners do not have East Asian vertical metrics. The product
    # uses horizontal web and desktop text, so remove unmatched vertical tables
    # before merging while keeping every horizontal glyph and layout feature.
    for font in (chinese, latin):
        for tag in ("vhea", "vmtx"):
            if tag in font:
                del font[tag]
    chinese_path = build / "chinese.ttf"
    latin_path = build / "latin.ttf"
    chinese.save(chinese_path)
    latin.save(latin_path)

    merged = Merger().merge([str(chinese_path), str(latin_path)])
    set_names(merged, config)
    ttf_path = package / names["ttf"]
    merged.save(ttf_path)
    webfont = TTFont(ttf_path)
    webfont.flavor = "woff2"
    woff2_path = package / names["woff2"]
    webfont.save(woff2_path)

    final_font = TTFont(ttf_path)
    cmap = set(final_font.getBestCmap())
    svg_path = package / names["svg"]
    svg_symbols = export_svg_sprite(final_font, svg_path)
    sample_svg_path = package / names["sample_svg"]
    sample_svg_paths = export_svg_sample(final_font, sample_svg_path, config["display"])
    stats = {
        "family": config["family"],
        "display_name": config["display"],
        "version": "Version 0.1",
        "total_codepoints": len(cmap),
        "han_codepoints": sum(is_han(cp) for cp in cmap),
        "cjk_unified": sum(0x4E00 <= cp <= 0x9FFF for cp in cmap),
        "cjk_extension_a": sum(0x3400 <= cp <= 0x4DBF for cp in cmap),
        "svg_symbols": svg_symbols,
        "sample_svg_paths": sample_svg_paths,
        "files": {},
        "sources": [
            {"family": config["cn_family"], "role": "Simplified Chinese glyph outlines", "license": "SIL OFL 1.1"},
            {"family": config["latin_family"], "role": "Latin letters, numbers and non-CJK punctuation", "license": "SIL OFL 1.1"},
        ],
        "coverage_note": "Preview package; not complete Unicode Han coverage.",
    }
    for path in (ttf_path, woff2_path, svg_path, sample_svg_path):
        stats["files"][path.name] = {"bytes": path.stat().st_size, "sha256": sha256(path)}
    package.joinpath("coverage.json").write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8")
    package.joinpath(config["css"]).write_text(
        '@font-face {\n'
        f'  font-family: "{config["family"]}";\n'
        '  font-style: normal;\n  font-weight: 400;\n  font-display: swap;\n'
        f'  src: url("./{names["woff2"]}") format("woff2");\n}}\n',
        encoding="utf-8",
    )
    shutil.copyfile(INPUTS / config["cn_license"], package / "OFL-Chinese.txt")
    shutil.copyfile(INPUTS / config["latin_license"], package / "OFL-Latin.txt")
    package.joinpath("FONTLOG.md").write_text(
        f"# FONTLOG\n\n{config['family']} v0.1 combines {config['cn_family']} for Chinese with "
        f"{config['latin_family']} for Latin letters and numbers. The sources were subset to non-overlapping "
        "Unicode ranges and merged into one installable font. Family names and metadata were changed. "
        "No glyph outline is claimed as an exclusive original design.\n",
        encoding="utf-8",
    )
    write_readme(package, config, stats, names)

    zip_path = FONT_PACKAGE / f"{config['slug']}.zip"
    files = [names["ttf"], names["woff2"], names["svg"], names["sample_svg"], config["css"], "coverage.json", "README.md", "FONTLOG.md", "OFL-Chinese.txt", "OFL-Latin.txt"]
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for filename in files:
            archive.write(package / filename, arcname=f"{config['slug']}/{filename}")
    return {"slug": config["slug"], "package": str(package), "zip": str(zip_path), "zip_bytes": zip_path.stat().st_size, **stats}


def main() -> None:
    results = [build_family(config) for config in CONFIGS]
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
