#!/usr/bin/env python3
"""THE HOLLOW STAG DONE THE ACTION WAY: the sheet, put together with its captions for the owner's phone (the panels are
   tools/stag_action_sheet.ts's).
   python3 tools/stag_action_captions.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
ROWS = [
    ('clearing_full.png', 'THE CLEARING FROM ABOVE · FULL', 'His bounds round it (gold: each bound in the air, pink cross: each landing) · 3.3 tiles a bound, 5.5 tiles a second'),
    ('clearing_34.png', 'AT 3/4 OF HIS LIFE · THE CLEARING 80% ACROSS', 'The wall stays · round the smaller clearing · his gore: its sweep marked on the floor, the knight out of it'),
    ('clearing_12.png', 'AT 1/2 · 60% ACROSS', 'The last wall sinks as the new one rises · his charge: the lane marked down the clearing\'s length'),
    ('clearing_14.png', 'AT 1/4 · 40% ACROSS: LITTLE SAFE GROUND LEFT', 'Caught as it rose: struck and thrown in · he bounds on in what is left'),
    ('bounds_front.png', 'HIS BOUNDS · FROM IN FRONT', 'Landed, all four hoofs together · springing off, jinking · at the top, stiff legs · landing: leaves and earth thrown'),
    ('stare_front.png', 'HE STANDS TO STARE', 'A heavy landing: a ring of dust (it knocks) · up, head high, eye flaring · still, staring at you'),
    ('gore_front.png', 'THE GORE · FROM IN FRONT', 'Head down, antlers cocked, pawing, HELD · hooked up and across in 2 frames (150°, 3 tiles) · flung high'),
    ('gore_back.png', 'THE GORE · FROM BEHIND', 'The same three moments'),
    ('charge_front.png', 'THE CHARGE · FROM IN FRONT', 'The lane marked, pawing, HELD · he bursts off in 2 frames, 12 tiles a second · his antlers into the wall: it splinters'),
    ('charge_back.png', 'THE CHARGE · FROM BEHIND', 'The same three moments'),
    ('close_front.png', 'THE WOOD CLOSES IN · FROM IN FRONT', 'Reared up, bellowing, HELD, the new edge marked · crashed down in 2 frames · the wall bursts up all round'),
    ('close_back.png', 'THE WOOD CLOSES IN · FROM BEHIND', 'The same three moments'),
    ('roots_old.png', 'BEFORE: HIS OLD ROOT LINES', 'Reared, then slammed down · three lines of roots worming out toward you, 6 tiles'),
    ('roots_new.png', 'AFTER: THE WOOD CLOSES IN, IN THEIR PLACE', 'A wall of roots and thorny trunks all round the new edge, over your head · it stays'),
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
