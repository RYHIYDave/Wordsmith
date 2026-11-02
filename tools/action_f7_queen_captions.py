#!/usr/bin/env python3
"""THE CARRION QUEEN'S MOVES DONE THE ACTION WAY: the sheet, put together with its captions for the owner's phone (the panels are
   tools/action_f7_queen_sheet.ts's).
   python3 tools/action_f7_queen_captions.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
ROWS = [
    ('rake_front.png', 'HER RAKE · FROM IN FRONT', 'Up and HELD high, her claws’ lanes lit · raked down in 2 frames · three gouges of fire out to 3.4 tiles'),
    ('rake_back.png', 'HER RAKE · FROM BEHIND', 'The same three moments: the knight runs back out of the wedge before she drops'),
    ('gust_front.png', 'HER GUST · FROM IN FRONT', 'Reared, wings drawn back, HELD, its rays marked · clapped in 2 frames · shoved straight away from her'),
    ('gust_old.png', 'BEFORE AND AFTER: HER OLD GUST · THE NEW', 'Old: drawn back · clapped, a spray of grit · New: HELD, the cone marked out to 7 tiles · clapped, the blast along it'),
    ('gust_back.png', 'HER GUST · FROM BEHIND', 'The rays run straight out from her: never toward the edge'),
    ('dive_front.png', 'HER DIVE · FROM IN FRONT', 'Up out of sight, her line marked, HELD · down it in 2 frames, 4 tiles out · ripped free, home'),
    ('dive_back.png', 'HER DIVE · FROM BEHIND', 'The same three moments: the knight stayed in the ring'),
    ('eclipse_front.png', 'THE ECLIPSE · FROM IN FRONT', 'Wings spread, screaming, HELD, the light dimming · swept down: her flock pours over · dark but for a pool'),
    ('eclipse_back.png', 'THE ECLIPSE · FROM BEHIND', 'The flock comes over the ledge from the drop behind her'),
    ('arena_0.png', 'THE ECLIPSE OVER THE WHOLE LEDGE · 1', 'The light goes: three pools of light drift across the ledge · the knight runs for one'),
    ('arena_1.png', 'THE ECLIPSE OVER THE WHOLE LEDGE · 2', 'Crossing the dark: a vulture’s line marked at him, a ring where it will strike'),
    ('arena_2.png', 'THE ECLIPSE OVER THE WHOLE LEDGE · 3', 'He stopped: out of the dark, down its line in 2 frames · in the light, nothing dives'),
]
W = 1200
parts = []
for name, title, line in ROWS:
    im = Image.open(os.path.join(src, name)).convert('RGB')
    if im.width != W:
        im = im.resize((W, round(im.height * W / im.width)), Image.NEAREST)
    band = 70
    card = Image.new('RGB', (W, im.height + band), BG)
    d = ImageDraw.Draw(card)
    d.text((16, 8), title, font=big, fill=TITLE)
    d.text((16, 42), line, font=small, fill=LINE)
    card.paste(im, ((W - im.width) // 2, band))
    parts.append(card)
H = sum(p.height for p in parts)
sheet = Image.new('RGB', (W, H), BG)
y = 0
for p in parts:
    sheet.paste(p, (0, y))
    y += p.height
sheet.save(out, optimize=True)
print(out, sheet.size)
