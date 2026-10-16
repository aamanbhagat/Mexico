"""Subset Archivo (variable: wght + wdth) to the glyphs in published locale source,
and limit its axes to the ranges the design uses (weight 400–800, width 100–125 %).

Run when the font package or the character set changes:
    pip install fonttools brotli && python3 scripts/subset-fonts.py

Keeps both variation axes and every OpenType layout feature (tabular figures, kerning).
Characters outside the subset (rare symbols typed by a visitor) fall back to the system font.
Future scripts such as Japanese will still need their own font.
"""
from pathlib import Path

from fontTools import subset
from fontTools.varLib import instancer

SRC = "node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2"
OUT = "src/assets/fonts/archivo-es.woff2"
UNICODES = set(range(0x20, 0x7F)) | {0xA0}
for path in Path('src').rglob('*'):
    if path.suffix in ('.astro', '.css', '.json', '.ts', '.tsx'):
        UNICODES.update(map(ord, path.read_text(encoding='utf-8')))

options = subset.Options()
options.flavor = "woff2"
options.layout_features = ["*"]
options.name_IDs = ["*"]
options.notdef_outline = True
options.hinting = False
font = subset.load_font(SRC, options)
subsetter = subset.Subsetter(options)
subsetter.populate(unicodes=UNICODES)
subsetter.subset(font)
# Drop masters outside the ranges we use (body 400, strong 650, display 800; width 100–118 %).
font = instancer.instantiateVariableFont(font, {"wght": (400, 800), "wdth": (100, 125)})
subset.save_font(font, OUT, options)
print("written", OUT)
