# FLOOR 9'S SIDE AREAS' PIECES' SHEET: the pixels of tools/f9_lairs_sheet.ts at 3x, captioned, in rows on a floor of the Pinewood's grass.
#   python3 tools/f9_lairs_sheet.py <in.json> <out.png> [cells a row]
import json, sys
from PIL import Image, ImageDraw, ImageFont
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
d = json.load(open(sys.argv[1])); S = 3; per = int(sys.argv[3]) if len(sys.argv) > 3 else 7
rows = [d[i:i + per] for i in range(0, len(d), per)]
ims = []
for row in rows:
    top = max(f['ay'] for f in row) + 4; bot = max(f['h'] - f['ay'] for f in row) + 4
    cells = []
    for f in row:
        w = f['w'] + 8
        im = Image.new('RGB', (w * S, (top + bot) * S + 30), (74, 96, 52)); dr = ImageDraw.Draw(im)
        x0 = f['ax'] - w // 2; y0 = f['ay'] - top
        for i, c in enumerate(f['px']):
            if c:
                x, y = i % f['w'] - x0, i // f['w'] - y0
                dr.rectangle([x * S, 30 + y * S, x * S + S - 1, 30 + y * S + S - 1], fill=c[:7])
        dr.text((6, 4), f['name'], font=F, fill=(240, 240, 255))
        cells.append(im)
    W = sum(c.size[0] for c in cells); H = max(c.size[1] for c in cells)
    r = Image.new('RGB', (W, H), (74, 96, 52)); x = 0
    for c in cells: r.paste(c, (x, 0)); x += c.size[0]
    ims.append(r)
W = max(i.size[0] for i in ims); H = sum(i.size[1] for i in ims)
s = Image.new('RGB', (W, H), (40, 50, 30)); y = 0
for i in ims: s.paste(i, (0, y)); y += i.size[1]
s.save(sys.argv[2]); print(s.size)
