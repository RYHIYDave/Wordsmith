#!/usr/bin/env python3
"""Cut panes out of a sheet made by src/dev/preview_skin.ts in `still` mode, at full size.
   python3 tools/crop_skin.py <sheet.png> <S> <out.png> <first pane> <how many> [canvas side = 176]"""
import sys
from PIL import Image
src, S, out, first, n = sys.argv[1], int(sys.argv[2]), sys.argv[3], int(sys.argv[4]), int(sys.argv[5])
C = int(sys.argv[6]) if len(sys.argv) > 6 else 176
im = Image.open(src)
PAD, HEADING, LABEL = 8, 40, 24
W = C * S
sheet = Image.new('RGB', (n * W + (n - 1) * 4, 2 * (W + LABEL) + 4), (0, 0, 0))
for r in range(2):
    for k in range(n):
        x = PAD + (first + k) * (W + PAD)
        y = PAD + HEADING + r * (W + LABEL + PAD)
        sheet.paste(im.crop((x, y, x + W, y + W + LABEL)), (k * (W + 4), r * (W + LABEL + 4)))
sheet.save(out)
print(out, sheet.size)
