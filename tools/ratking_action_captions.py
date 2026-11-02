#!/usr/bin/env python3
"""THE RAT KING DONE THE ACTION WAY: the sheet, put together with its captions for the owner's phone (the panels are
   tools/ratking_action_sheet.ts's).
   python3 tools/ratking_action_captions.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
ROWS = [
    ('cistern_held.png', 'THE SLUICES OPEN · 1: HELD', 'He rears up as a heap, screaming · the lanes marked, the gates grinding open · the knight up onto a dry ledge'),
    ('cistern_burst.png', 'THE SLUICES OPEN · 2: THE GATES BURST', 'The heap slams down · the water floods the lanes in a few frames, its front a wall of foam'),
    ('cistern_flood.png', 'THE SLUICES OPEN · 3: THE FLOOD', 'White and black water full of tumbling rats, for three seconds · the dry ledges between are safe'),
    ('sluice_front.png', 'THE SLUICES OPEN · FROM IN FRONT', 'Reared up as a heap, clawing, screaming, HELD, the knight up on the ledge · slammed down in 2 frames: the gates burst'),
    ('sluice_back.png', 'THE SLUICES OPEN · FROM BEHIND', 'The same two moments · the lanes marked, the gates grinding open behind him'),
    ('bite_front.png', 'THE BITE · FROM IN FRONT', 'The front three reared, jaws wide, HELD, the wedge marked · out of it · they leap out on their tails and snap in 2 frames'),
    ('bite_back.png', 'THE BITE · FROM BEHIND', 'The same two moments · the wedge 130° across, 3.4 tiles out (the old bite 108°, 2.5 tiles)'),
    ('words_front.png', 'STOLEN WORDS · FROM IN FRONT', 'Its line LOCKED, the knight stepped out of it · spat in 2 frames, twice as fast · it bursts, twice as wide'),
    ('words_back.png', 'STOLEN WORDS · FROM BEHIND', 'The same three moments (a word of lightning: he steals one of yours)'),
    ('unknot_front.png', 'UNKNOT · FROM IN FRONT', 'Swollen, tense, HELD · they BURST outward in 2 frames · the swarm streams past you, twice as many'),
    ('unknot_back.png', 'UNKNOT · FROM BEHIND', 'The same three moments'),
    ('roll_old.png', 'BEFORE: HIS OLD ROLL', 'Curled into a ball, its lane marked · rolling down it'),
    ('roll_new.png', 'AFTER: THE SLUICES OPEN, IN ITS PLACE', 'The gates burst, the lanes flood · stand on the dry ledges between'),
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
