#!/usr/bin/env python3
"""THE AMALGAMATION'S ACTION REWORK, SECOND ROUND: the sheet, put together with its captions for the owner's phone (the panels are
   tools/action_f4_amalgam_sheet2.ts's).
   python3 tools/action_f4_amalgam_captions2.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
ROWS = [
    ('rakes_front.png', 'THE RAKES · FROM IN FRONT', 'Hauled up, HELD, claws glowing · RAKED (2 frames) · the hit, frozen · carried round · the backhand HELD · its hit'),
    ('rakes_back.png', 'THE RAKES · FROM BEHIND', 'The same six moments: its slash reaches 3.3 tiles, the backhand 3.5 (its old swipe 2.45)'),
    ('beside.png', 'BEFORE AND NOW', 'Left: the first round’s right rake as it lands (“lackluster”) · right: the new one, the knight where he stood'),
    ('mite_front.png', 'A BONE MITE · FROM IN FRONT (3× the game)', 'Its bones pulling together · up on its legs · skittering · crouched, HELD · the SNAP · one blow: chips'),
    ('mite_back.png', 'A BONE MITE · FROM BEHIND', 'The same six moments'),
    ('swarm.png', 'THEY SWARM THE KNIGHT (2× the game)', 'A third of his height, quick; his every swing bursts the ones it reaches'),
    ('arena1.png', 'THE BONE RAIN OVER THE WHOLE FLOOR', 'The first wave burst: a bone mite pulling together where each skull landed; the next wave’s shadows'),
    ('arena2.png', 'A TON OF THEM', 'Every skull of the rain a bone mite: 58 on this floor, all going for the knight'),
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
