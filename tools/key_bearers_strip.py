# THE KEY-BEARERS' MOVES AS A STRIP: frames of tools/key_bearers_film.ts side by side, each at 2x, its time under it.
#   python3 tools/key_bearers_strip.py <in.json> <out.png> [per row]
import json, sys
from PIL import Image, ImageDraw, ImageFont
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 14)
d = json.load(open(sys.argv[1])); S = int(sys.argv[4]) if len(sys.argv) > 4 else 2; per = int(sys.argv[3]) if len(sys.argv) > 3 else 8
top, bot, half = 110, 24, 70
cells = []
for f in d:
    w = f['w']
    x0 = f['ax'] - half; y0 = f['ay'] - top
    im = Image.new('RGB', (2 * half * S, (top + bot) * S + 18), (38, 34, 58)); dr = ImageDraw.Draw(im)
    dr.rectangle([0, top * S, im.size[0], top * S + 1], fill=(58, 52, 84))
    for i, c in enumerate(f['px']):
        if c:
            x, y = i % w - x0, i // w - y0
            if 0 <= x < 2 * half and 0 <= y < top + bot: dr.rectangle([x * S, y * S, x * S + S - 1, y * S + S - 1], fill=c[:7])
    dr.text((4, (top + bot) * S + 1), '%.2f s' % f['t'], font=F, fill=(232, 246, 255))
    cells.append(im)
cw, ch = cells[0].size
rows = (len(cells) + per - 1) // per
s = Image.new('RGB', (cw * min(per, len(cells)), ch * rows), (38, 34, 58))
for i, c in enumerate(cells): s.paste(c, ((i % per) * cw, (i // per) * ch))
s.save(sys.argv[2]); print(s.size)
