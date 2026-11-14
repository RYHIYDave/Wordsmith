# FLOOR 9'S SIDE BOSSES' SHEET: the pixels of tools/f9_bosses_sheet.ts at 3x, captioned, on one floor line.
#   python3 tools/f9_bosses_sheet.py <in.json> <out.png> [half width] [height above the floor]
import json, sys
from PIL import Image, ImageDraw, ImageFont
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
d = json.load(open(sys.argv[1])); S = 3
half = int(sys.argv[3]) if len(sys.argv) > 3 else 110
top = int(sys.argv[4]) if len(sys.argv) > 4 else 150
bot = 24
cells = []
for f in d:
    w = f['w']
    hw = 45 if f['w'] < 80 else half
    x0 = f['ax'] - hw; y0 = f['ay'] - top
    im = Image.new('RGB', (2 * hw * S, (top + bot) * S + 62), (38, 34, 58)); dr = ImageDraw.Draw(im)
    dr.rectangle([0, 62 + top * S, im.size[0], 62 + top * S + 1], fill=(58, 52, 84))
    for i, c in enumerate(f['px']):
        if c:
            x, y = i % w - x0, i // w - y0
            if 0 <= x < 2 * hw and 0 <= y < top + bot: dr.rectangle([x * S, 62 + y * S, x * S + S - 1, 62 + y * S + S - 1], fill=c[:7])
    dr.multiline_text((8, 4), f['name'], font=F, fill=(232, 246, 255))
    cells.append(im)
W = sum(c.size[0] for c in cells); H = max(c.size[1] for c in cells)
s = Image.new('RGB', (W, H), (38, 34, 58)); x = 0
for c in cells: s.paste(c, (x, 0)); x += c.size[0]
s.save(sys.argv[2]); print(s.size)
