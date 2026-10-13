"""Subset Archivo (variable: wght + wdth) to the glyphs Spanish pages use, and limit its axes
to the ranges the design uses (weight 400–800, width 100–125 %): 90 KB → about 52 KB.

Run when the font package or the character set changes:
    pip install fonttools brotli && python3 scripts/subset-fonts.py

Keeps both variation axes and every OpenType layout feature (tabular figures, kerning).
Characters outside the subset (rare symbols typed by a visitor) fall back to the system font.
Other locales will need their own subset (latin-ext for pl/tr/de; a CJK face for ja).
"""
from fontTools import subset
from fontTools.varLib import instancer

SRC = "node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2"
OUT = "src/assets/fonts/archivo-es.woff2"
UNICODES = (
    "U+0020-007E,"  # ASCII
    "U+00A0-00FF,"  # Latin-1: á é í ó ú ñ ü ¿ ¡ « » ° · × ª º
    "U+2010-2027,"  # dashes, quotes, bullet, ellipsis
    "U+2039-203A,U+20AC,U+2122,U+2212"  # ‹ › € ™ −
)

options = subset.Options()
options.flavor = "woff2"
options.layout_features = ["*"]
options.name_IDs = ["*"]
options.notdef_outline = True
options.hinting = False
font = subset.load_font(SRC, options)
subsetter = subset.Subsetter(options)
subsetter.populate(unicodes=subset.parse_unicodes(UNICODES))
subsetter.subset(font)
# Drop masters outside the ranges we use (body 400, strong 650, display 800; width 100–118 %).
font = instancer.instantiateVariableFont(font, {"wght": (400, 800), "wdth": (100, 125)})
subset.save_font(font, OUT, options)
print("written", OUT)
