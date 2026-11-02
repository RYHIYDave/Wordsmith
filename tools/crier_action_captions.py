#!/usr/bin/env python3
"""THE CRIER'S MOVES DONE THE ACTION WAY: the sheet, put together with its captions for the owner's phone (the panels are
   tools/crier_action_sheet.ts's).
   python3 tools/crier_action_captions.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
ROWS = [
    ('swing_front.png', 'THE TRUMPET SWING · FROM IN FRONT', 'Hauled back, HELD · swung round in 2 frames · raised overhead, HELD · slammed: a ring of silence'),
    ('swing_back.png', 'THE TRUMPET SWING · FROM BEHIND', 'Each blow marked on the floor while it is held · the ring goes out 2.8 tiles round where the bell lands'),
    ('shout_old.png', 'BEFORE: HIS OLD CONE', 'A cone of silence before him, 7.4 tiles out · step out to the side'),
    ('shout_arena1.png', 'NOW: THE SHOUT OFF THE WALLS · 1. THE BREATH HELD', 'The whole square marked in pink · ONE SPOT left plain, ringed: behind him, against the wall at his back'),
    ('shout_arena2.png', '2. THE SHOUT CROSSES THE SQUARE', 'A wave of silence rolls out before him to the walls · the floor goes dark behind it'),
    ('shout_arena3.png', '3. BACK ACROSS FROM THREE SIDES', 'Off the far wall and both side walls · none of them reach the one spot'),
    ('shout_front.png', 'THE SHOUT · FROM IN FRONT', 'Trumpet to his lips, chest heaving, the air round the bell rippling, HELD · thrown in, 2 frames · the echoes'),
    ('shout_back.png', 'THE SHOUT · FROM BEHIND', 'The same three moments · the knight in the one spot'),
    ('decree_arena.png', 'THE SCROLL DOWN A LANE · THE WHOLE SQUARE', 'Flung down the square to the far wall, 3 tiles wide · its letters burn 4 seconds: floor taken away'),
    ('decree_front.png', 'THE SCROLL · FROM IN FRONT', 'The decree held high, the lane marked, HELD · flung, unrolling in a smear · the letters burning'),
    ('decree_back.png', 'THE SCROLL · FROM BEHIND', 'The same three moments'),
    ('crowd_arena.png', 'HE CALLS THE CROWD · THE WHOLE SQUARE', 'The Hush wells up in the lanes and doorways while he holds the summons · at the call the Hushed pour in'),
    ('crowd_front.png', 'HE CALLS THE CROWD · FROM IN FRONT', 'Sunk down, the trumpet to the floor, HELD · flung up to the sky in 2 frames · they come'),
    ('crowd_back.png', 'HE CALLS THE CROWD · FROM BEHIND', 'The same three moments'),
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
