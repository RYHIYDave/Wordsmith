#!/usr/bin/env python3
"""THE CHAINED ONE'S MOVES DONE THE ACTION WAY: the sheet, put together with its captions for the owner's phone (the panels are
   tools/action_f3_chained_sheet.ts's).
   python3 tools/action_f3_chained_captions.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
ROWS = [
    ('lash_front.png', 'THE LASH, A COMBO · FROM IN FRONT', 'Cocked, HELD · the forehand (2 frames) · the backhand (2 frames) · both fists up, HELD · the finisher'),
    ('lash_old.png', 'BEFORE: HIS OLD LASH', 'One blow: cocked · held · over the top · snapped down · through'),
    ('lash_back.png', 'THE LASH · FROM BEHIND', 'The same five moments: each blow a step in'),
    ('whirl_front.png', 'THE WHIRL · FROM IN FRONT', 'Chains gathered, HELD · spun on one foot, flat out · fists up as he slows · HELD · slammed down'),
    ('whirl_back.png', 'THE WHIRL · FROM BEHIND', 'The same five moments'),
    ('hook_front.png', 'THE HOOK · FROM IN FRONT', 'AIMED, HELD · flung (2 frames) · hauled in · fists up, HELD · the blow waiting (2 frames)'),
    ('hook_back.png', 'THE HOOK · FROM BEHIND', 'The same five moments'),
    ('ball_front.png', 'THE BALL · FROM IN FRONT', 'HELD HIGH · drawn back, HELD · whipped over · and down (2 frames) · hauled back'),
    ('ball_back.png', 'THE BALL · FROM BEHIND', 'The same five moments'),
    ('floor1.png', 'ON THE FLOOR: THE CRACK · THE WHIRL’S RING', 'The finisher’s crack runs 6.4 tiles, 1.6 wide · the whirl’s slam: a ring 3.5 tiles round him'),
    ('floor2.png', 'THE BALL’S RING · THE BLOW WAITING', 'Where the ball lands, 4.5 tiles off: a ring 2.5 · after the drag, his fists: a ring 1.5, 2 tiles before him'),
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
