from __future__ import annotations

import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree

PACKAGE = Path(__file__).resolve().parent
WORKSPACE = PACKAGE.parent.parent
TOOLS = WORKSPACE / "checks" / "shiyu-type-study-20260916" / "tools" / "fonttools"
sys.path.insert(0, str(TOOLS))

from fontTools.ttLib import TTFont


def verify() -> dict:
    ttf_path = PACKAGE / "ShiyuYoufeng-Preview-Regular.ttf"
    woff2_path = PACKAGE / "ShiyuYoufeng-Preview-Regular.woff2"
    svg_path = PACKAGE / "ShiyuYoufeng-Preview-glyphs.svg"
    sample_svg_path = PACKAGE / "ShiyuYoufeng-Preview-brand-samples.svg"
    zip_path = PACKAGE.parent / "shiyu-youfeng-v0.1.zip"
    ttf = TTFont(ttf_path)
    webfont = TTFont(woff2_path)
    cmap = set(ttf.getBestCmap())
    web_cmap = set(webfont.getBestCmap())
    required_phrase = "拾隅拾起喜欢安放日常万千世界始于一点喜欢ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    missing_phrase = sorted({character for character in required_phrase if ord(character) not in cmap})
    if missing_phrase:
        raise AssertionError(f"Missing required phrase characters: {missing_phrase}")
    if cmap != web_cmap:
        raise AssertionError("TTF and WOFF2 cmap coverage differ")
    if ttf["name"].getDebugName(1) != "Shiyu Youfeng Preview":
        raise AssertionError("Unexpected family name")
    app_characters: set[str] = set()
    for pattern in ("*.html", "*.js", "*.css"):
        for source in (WORKSPACE / "dist").rglob(pattern):
            app_characters.update(re.findall(r"[\u3400-\u9fff]", source.read_text(encoding="utf-8", errors="ignore")))
    app_missing = sorted(character for character in app_characters if ord(character) not in cmap)
    symbol_count = 0
    for _, element in ElementTree.iterparse(svg_path, events=("end",)):
        if element.tag.endswith("symbol"):
            symbol_count += 1
        element.clear()
    expected_zip_files = {
        "ShiyuYoufeng-Preview-Regular.ttf",
        "ShiyuYoufeng-Preview-Regular.woff2",
        "ShiyuYoufeng-Preview-glyphs.svg",
        "ShiyuYoufeng-Preview-brand-samples.svg",
        "shiyu-youfeng.css",
        "coverage.json",
        "README.md",
        "FONTLOG.md",
        "OFL-Ma-Shan-Zheng.txt",
        "OFL-Alegreya.txt",
    }
    with zipfile.ZipFile(zip_path) as archive:
        archive_files = {Path(name).name for name in archive.namelist() if not name.endswith("/")}
        bad = archive.testzip()
    if bad:
        raise AssertionError(f"Corrupt zip member: {bad}")
    if archive_files != expected_zip_files:
        raise AssertionError(f"Unexpected zip contents: {archive_files ^ expected_zip_files}")
    sample_svg = ElementTree.parse(sample_svg_path)
    sample_paths = sum(1 for element in sample_svg.iter() if element.tag.endswith("path"))
    if sample_paths < 20:
        raise AssertionError("Brand sample SVG is missing outlined glyphs")
    result = {
        "family": ttf["name"].getDebugName(1),
        "ttf_loads": True,
        "woff2_loads": True,
        "total_codepoints": len(cmap),
        "cjk_unified": sum(0x4E00 <= cp <= 0x9FFF for cp in cmap),
        "svg_symbols": symbol_count,
        "sample_svg_paths": sample_paths,
        "required_phrase_missing": missing_phrase,
        "app_unique_hanzi": len(app_characters),
        "app_missing_hanzi": app_missing,
        "zip_valid": True,
        "zip_files": sorted(expected_zip_files),
    }
    (PACKAGE / "verification.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return result


if __name__ == "__main__":
    verify()
