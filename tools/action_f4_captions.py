#!/usr/bin/env python3
"""THE FLOOR 4 ACTION SHEET, put together with its captions for the owner's phone (the panels are tools/action_f4_sheet.ts's).
   python3 tools/action_f4_captions.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
ROWS = [
    ('hurl_front_a.png', 'THE OSSUARY GOLEM’S SKELETON HURL · FROM IN FRONT', 'Its fist down to the floor · a whole skeleton hauled up out of it · held aloft, HELD (the warning)'),
    ('hurl_front_b.png', '', 'Over the top · loosed (the throw: 2 frames, smeared) · bent over after it'),
    ('hurl_back_a.png', 'FROM BEHIND', 'The same six moments'),
    ('hurl_back_b.png', '', ''),
    ('flight.png', 'THE SKELETON IN FLIGHT', 'Cartwheeling, limbs flung wide · its shadow growing as it comes down'),
    ('burst_a.png', 'THE BURST · 2.25 TILES ROUND', 'Its reach marked as it is held (the knight gets out) · coming down, its shadow on the mark · it lands and bursts'),
    ('burst_b.png', '', 'Bones flung out all round, as shrapnel · lying where they fell · crumbling to dust, gone by 1.8 s'),
    ('old_new.png', 'THE OLD SKULL LOB · THE NEW HURL · SAME SCALE', 'Old: a skull from its shoulder, the skull in flight · New: a whole skeleton held aloft, the skeleton in flight'),
    ('swing.png', 'ITS CLUB SWING, BY MOVEMENT 9', 'Gathered · wound and HELD · round in 2 frames, smeared · on round · held, bent'),
    ('frenzy_front_a.png', 'THE DAGGER CULTIST’S FRENZY · FROM IN FRONT', 'Coiled, HELD · a stab (1 frame, smeared) · drawn back, a step on · the fourth stab'),
    ('frenzy_front_b.png', '', 'The fourth stab · WINDED, bent over, heaving (twice) · up again, 1.2 tiles on'),
    ('frenzy_back_a.png', 'FROM BEHIND', 'The same seven moments'),
    ('frenzy_back_b.png', '', ''),
    ('frenzy_scene.png', 'THE FRENZY WITH THE KNIGHT', 'A stab, stepping in · the fourth · winded: the knight’s opening'),
]
W = 1200
parts = []
for name, title, line in ROWS:
    im = Image.open(os.path.join(src, name)).convert('RGB')
    if im.width > W:
        im = im.resize((W, round(im.height * W / im.width)), Image.NEAREST)
    band = 70 if title else (36 if line else 4)
    card = Image.new('RGB', (W, im.height + band), BG)
    d = ImageDraw.Draw(card)
    if title:
        d.text((16, 8), title, font=big, fill=TITLE)
    if line:
        d.text((16, 42 if title else 8), line, font=small, fill=LINE)
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
