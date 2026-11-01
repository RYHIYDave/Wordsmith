#!/usr/bin/env python3
"""THE FLOOR 3 ACTION SHEET, put together with its captions for the owner's phone (the panels are tools/action_f3_sheet.ts's).
   python3 tools/action_f3_captions.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
ROWS = [
    ('rampage_front.png', 'THE GREEN TROLL’S RAMPAGE · FROM IN FRONT', 'Wound up, HELD · the swing (2 frames) · the backhand · club up, crouched, HELD · the leap · the slam'),
    ('rampage_back.png', 'FROM BEHIND', 'The same six moments'),
    ('ring.png', 'THE SLAM’S RING · 2.5 TILES', 'Marked as he leaps (the game’s red circle) · the slam · the ring going out · cracks and dust after'),
    ('rush_front.png', 'THE BULL RUSH · FROM IN FRONT', 'Head down, brow first · a fist on the floor, pawing · HELD · the run · a foot dug in · rocked back'),
    ('rush_back.png', 'FROM BEHIND', 'The same six moments'),
    ('lane.png', 'ITS LANE · 1.8 TILES WIDE, ON PAST YOU', 'Marked as he paws (the red troll’s charge lane) · run at 11 tiles a second'),
    ('boneward_front.png', 'THE BONEWARD’S SHIELD WALL · FROM IN FRONT', 'Braced behind it · advancing (two frames) · a blow GLANCES OFF · struck from the side · lowering it to throw'),
    ('boneward_back.png', 'FROM BEHIND', 'The same six moments'),
    ('wall_scene.png', 'FROM IN FRONT IT GLANCES OFF · FROM THE SIDE IT LANDS', 'Within 120 degrees of its front: sparks, the shield rings, it holds its ground · from the side: rocked back'),
]
W = 1200
parts = []
for name, title, line in ROWS:
    im = Image.open(os.path.join(src, name)).convert('RGB')
    if im.width > W:
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
