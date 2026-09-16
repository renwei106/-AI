from __future__ import annotations

import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / "checks" / "shiyu-type-study-20260916" / "tools" / "fonttools"
sys.path.insert(0, str(TOOLS))

from fontTools.ttLib import TTFont
from build_additional_fonts import CONFIGS


def app_characters() -> set[str]:
    characters: set[str] = set()
    for pattern in ("*.html", "*.js", "*.css"):
        for source in (ROOT / "dist").rglob(pattern):
            characters.update(re.findall(r"[\u3400-\u9fff]", source.read_text(encoding="utf-8", errors="ignore")))
    return characters


def verify(config: dict, current_app_characters: set[str]) -> dict:
    package = ROOT / "font-package" / config["slug"]
    stem = config["stem"]
    ttf_path = package / f"{stem}-Regular.ttf"
    woff2_path = package / f"{stem}-Regular.woff2"
    svg_path = package / f"{stem}-glyphs.svg"
    sample_svg_path = package / f"{stem}-brand-samples.svg"
    zip_path = package.parent / f"{config['slug']}.zip"
    ttf = TTFont(ttf_path)
    webfont = TTFont(woff2_path)
    cmap = set(ttf.getBestCmap())
    if cmap != set(webfont.getBestCmap()):
        raise AssertionError(f"{config['slug']}: TTF and WOFF2 cmap coverage differ")
    if ttf["name"].getDebugName(1) != config["family"]:
        raise AssertionError(f"{config['slug']}: family name mismatch")
    required = "拾隅拾起喜欢安放日常万千世界始于一点喜欢ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    missing_required = sorted({character for character in required if ord(character) not in cmap})
    missing_app = sorted(character for character in current_app_characters if ord(character) not in cmap)
    if missing_required or missing_app:
        raise AssertionError(f"{config['slug']}: missing required={missing_required}, app={missing_app}")
    symbol_count = 0
    for _, element in ElementTree.iterparse(svg_path, events=("end",)):
        if element.tag.endswith("symbol"):
            symbol_count += 1
        element.clear()
    sample_paths = sum(1 for element in ElementTree.parse(sample_svg_path).iter() if element.tag.endswith("path"))
    if symbol_count != len(cmap) or sample_paths < 20:
        raise AssertionError(f"{config['slug']}: SVG outline count mismatch")
    expected = {
        f"{stem}-Regular.ttf",
        f"{stem}-Regular.woff2",
        f"{stem}-glyphs.svg",
        f"{stem}-brand-samples.svg",
        config["css"],
        "coverage.json",
        "README.md",
        "FONTLOG.md",
        "OFL-Chinese.txt",
        "OFL-Latin.txt",
    }
    with zipfile.ZipFile(zip_path) as archive:
        files = {Path(name).name for name in archive.namelist() if not name.endswith("/")}
        bad = archive.testzip()
    if bad or files != expected:
        raise AssertionError(f"{config['slug']}: ZIP verification failed")
    result = {
        "family": config["family"],
        "ttf_loads": True,
        "woff2_loads": True,
        "total_codepoints": len(cmap),
        "svg_symbols": symbol_count,
        "sample_svg_paths": sample_paths,
        "required_phrase_missing": missing_required,
        "app_unique_hanzi": len(current_app_characters),
        "app_missing_hanzi": missing_app,
        "zip_valid": True,
        "zip_bytes": zip_path.stat().st_size,
    }
    package.joinpath("verification.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return result


if __name__ == "__main__":
    characters = app_characters()
    print(json.dumps({config["slug"]: verify(config, characters) for config in CONFIGS}, ensure_ascii=False, indent=2))
