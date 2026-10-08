#!/usr/bin/env python3
"""Cut close-ups out of the sheet made by src/dev/preview_heroes3.ts with "both:<S>".
   python3 tools/crop_heroes3.py <sheet.png> <S> <out prefix>
   Writes <prefix>_<knight|ranger|mage>.png: today facing you, new facing you, today facing away, new facing away."""
import sys
from PIL import Image
src, S, pre = sys.argv[1], int(sys.argv[2]), sys.argv[3]
im = Image.open(src)
PW = 112 * S; PH = 134 * S; PAD = 10; HEADING = 64; NAME = 30; LABEL = 26
for r, n in enumerate(['knight', 'ranger', 'mage']):
    top = PAD + HEADING + r * (NAME + PH + LABEL + PAD) + NAME
    xs = [PAD + c * (PW + PAD) for c in range(4)]
    # (the part of each pane the figure is in)
    box = lambda x: (x + 12 * S, top + 22 * S, x + PW - 6 * S, top + PH - 14 * S)
    parts = [im.crop(box(x)) for x in xs]
    out = Image.new('RGB', (sum(p.width for p in parts) + 30, parts[0].height), (0, 0, 0))
    x = 0
    for p in parts:
        out.paste(p, (x, 0)); x += p.width + 10
    out.save(f'{pre}_{n}.png')
    print(f'{pre}_{n}.png', out.size)
