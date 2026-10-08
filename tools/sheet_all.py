# One overview sheet of every word on one ability: a row per word, a column per chosen frame.
#   python3 tools/sheet_all.py <prefix> <front|behind> <slow|quick> <out.png> [frames, e.g. 0,1,2,3,5] [title]
# The frames come from tools/scenarios/wordfx.mjs (default SETS: each word alone in front, then alone behind).
import sys
from PIL import Image, ImageDraw, ImageFont

WORDS = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile']
NAMES = {
    'front': {'power': 'Power', 'swift': 'Swift', 'twin': 'Twin', 'fire': 'Flame', 'frost': 'Frost', 'lightning': 'Lightning', 'leech': 'Leeching', 'volatile': 'Volatile'},
    'behind': {'power': 'of Power', 'swift': 'of Swiftness', 'twin': 'of Echoes', 'fire': 'of Flame', 'frost': 'of Frost', 'lightning': 'of Lightning', 'leech': 'of Leeching', 'volatile': 'of Ruin'},
}
prefix, side, which, out = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
# the frame numbers index the TIMES list of wordfx.mjs (0.02 0.07 0.13 0.2 0.3 0.45 0.7 0.84 0.95 1.24 1.36 1.42 1.5 1.66 1.72 s)
frames = [int(x) for x in (sys.argv[5] if len(sys.argv) > 5 and sys.argv[5] else ('0,1,2,3,5' if side == 'front' else '1,3,5,7,9')).split(',')]
title = sys.argv[6] if len(sys.argv) > 6 else ''
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
    big = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
except Exception:
    font = big = ImageFont.load_default()
rows = []
for w in WORDS:
    tag = f'{w}_-' if side == 'front' else f'-_{w}'
    ims = []
    for f in frames:
        try:
            im = Image.open(f'{prefix}_{tag}_{which}_{f:02d}.png')
        except FileNotFoundError:
            continue
        W, H = im.size
        ims.append(im.crop((W // 2 - 190, H // 2 - 150, W // 2 + 190, H // 2 + 100)))
    if ims:
        rows.append((w, ims))
if not rows:
    sys.exit('no frames found for ' + prefix)
cw, ch = rows[0][1][0].size
gap, label, head = 4, 150, 46 if title else 0
cols = max(len(r[1]) for r in rows)
sheet = Image.new('RGB', (label + cols * (cw + gap) - gap, head + len(rows) * (ch + gap) - gap), (16, 13, 22))
d = ImageDraw.Draw(sheet)
if title:
    d.text((10, 8), title, font=big, fill=(240, 232, 210))
for r, (w, ims) in enumerate(rows):
    y = head + r * (ch + gap)
    d.text((10, y + ch // 2 - 12), NAMES[side][w], font=font, fill=(240, 232, 210))
    for c, im in enumerate(ims):
        sheet.paste(im, (label + c * (cw + gap), y))
sheet.save(out)
print(out, sheet.size, len(rows), 'rows')
