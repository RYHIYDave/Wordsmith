#!/usr/bin/env python3
"""Cut cells out of preview_hero pictures and set them side by side, enlarged (for looking closely).
   usage: cells.py out.png zoom  file:col:row[:scale[:perRow]] ...
   (scale = the scale the preview was made at; default 4)"""
import sys
from PIL import Image
out, zoom = sys.argv[1], int(sys.argv[2])
cells = []
for a in sys.argv[3:]:
    parts = a.split(':')
    f, c, r = parts[0], int(parts[1]), int(parts[2])
    S = int(parts[3]) if len(parts) > 3 else 4
    CW, CH, GAP = (112 - 12) * S, (112 - 8) * S, 6
    im = Image.open(f).convert('RGB')
    x = GAP + c * (CW + GAP)
    y = 22 + r * (CH + GAP)
    # the figure sits in the middle of the cell: keep the part worth looking at
    cell = im.crop((x + 22 * S, y + 22 * S, x + 84 * S, y + 100 * S))
    cells.append(cell.resize((cell.width * zoom // S * 1, cell.height * zoom // S * 1), Image.NEAREST))
W = sum(c.width for c in cells) + 8 * (len(cells) + 1)
H = max(c.height for c in cells) + 16
sheet = Image.new('RGB', (W, H), (22, 19, 28))
x = 8
for c in cells:
    sheet.paste(c, (x, 8))
    x += c.width + 8
sheet.save(out)
print(out, sheet.size)
