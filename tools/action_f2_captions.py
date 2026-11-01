#!/usr/bin/env python3
"""THE FLOOR 2 ACTION SHEET, put together with its captions for the owner's phone (the panels are tools/action_f2_sheet.ts's).
   python3 tools/action_f2_captions.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
ROWS = [
    ('cultist_front.png', 'THE CULTIST’S FIRE SIGIL · FROM IN FRONT', 'Fire raised · tracing a ring in the air · traced · HELD (the warning) · the SLAM (one frame) · bent over it'),
    ('cultist_back.png', 'FROM BEHIND', 'The same six moments'),
    ('sigil_1.png', 'THE SIGIL UNDER YOU · 1.75 TILES ROUND', 'Traced in step with its hand · then burning, pink-edged, sparks rising, for a second in all'),
    ('sigil_2.png', 'THE ERUPTION, IN TWO FRAMES', 'A streak of fire shooting up · the pillar, twice the knight’s height'),
    ('sigil_3.png', 'THE FLOOR BURNS ON (3 s), SHRINKING IN', 'Burning, 1 s after · 2.6 s after: nearly out'),
    ('shade_front.png', 'THE SHADE’S RAKE, COLD · FROM IN FRONT', 'Claws raised, frost gathering · held, cold falling off them · the rake · the cold bursting off · drifting down'),
    ('shade_back.png', 'FROM BEHIND', 'The same five moments (the rake itself as the game has it)'),
    ('rime.png', 'THE RIME · 1.2 TILES ROUND, 4 s, IT SLOWS', 'Spreading (0.1 s after the rake) · lying, the knight in it · melting from its edge (3.6 s)'),
    ('headsman_walk.png', 'THE HEADSMAN · SETTING OFF, WALKING · BEFORE | AFTER', 'Before: the blade turned 70 degrees in his hand from his stand. After: as his guard holds it'),
    ('headsman_lunge_before.png', 'HIS LUNGE’S WIND-DOWN · BEFORE', 'Whipped up over his head: between these two frames the blade flips 60 degrees round the haft'),
    ('headsman_lunge_after.png', 'AFTER (MENDED)', 'Brought back round, low and flat before him, then up onto his shoulder: the blade held firm'),
    ('headsman_flurry.png', 'HIS FLURRY · BEFORE | AFTER', 'Much the same: the edge brought round to lead each cut, turned in his hands smoothly between them'),
    ('headsman_wheel.png', 'HIS AXE WHEEL · BEFORE | AFTER', 'The same frames; the wheel of fire, drawn through the moments between, now true to the wheel'),
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
    colour = (255, 154, 154) if title.endswith('BEFORE') else (184, 240, 176) if title.startswith('AFTER') else TITLE
    d.text((16, 8), title, font=big, fill=colour)
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
