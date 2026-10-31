#!/usr/bin/env python3
"""THE FLOOR 1 ACTION SHEET, put together with its captions for the owner's phone (the panels are tools/action_f1_sheet.ts's).
   python3 tools/action_f1_captions.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
ROWS = [
    ('archer_front.png', 'THE BONE ARCHER’S ARROW RAIN · FROM IN FRONT', 'Rest · hand to the string · bow swung up · drawn and HELD · the LOOSE (one frame) · bow held up · a fresh arrow'),
    ('archer_back.png', 'FROM BEHIND', 'The same seven moments'),
    ('ring_1.png', 'THE RING WHERE THE HERO STOOD · 2 TILES ROUND', 'Down in pink at the loose · filling with falling shadows · denser and darker, pink points: the last moments'),
    ('ring_2.png', '1.5 s AFTER THE LOOSE: THE STRIKE, IN TWO FRAMES', 'A streak of arrows · struck: the ring flashes, splinters fly · stuck in the stones, dust rising (then they crumble away)'),
    ('warden_front.png', 'THE WARDEN’S LOCKDOWN · FROM IN FRONT', 'Rest · the keys taken at his hip · up over his helm and HELD · WRENCHED DOWN (one frame) · the keys swinging'),
    ('warden_back.png', 'FROM BEHIND', 'The same five moments'),
    ('bars_1.png', 'THE BARS: A ROW 3 TILES LONG, THE KNIGHT IN THE CELL BESIDE IT', 'The shadow, soft · sharp and pink-edged (what the bars will strike) · the crash’s first frame: a streak'),
    ('bars_2.png', 'ROWS 2.75 TILES APART ACROSS THE ARENA: STAND IN A CELL', 'Planted: sparks, chips, dust · standing (1.5 s, the cage) · rising away'),
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
