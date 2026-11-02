#!/usr/bin/env python3
"""THE FLOORS 9 AND 10 ACTION SHEET, put together with its captions for the owner's phone (the panels are tools/action_f9_sheet.ts's).
   python3 tools/action_f9_captions.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
ROWS = [
    ('charge_front.png', 'THE TWISTED DEER’S BRAMBLE CHARGE · FROM IN FRONT', 'Stamping · antlers down, HELD · bursting off (2 frames, smeared) · away · galloping · tossing its antlers'),
    ('charge_back.png', '', 'From behind: the same six moments'),
    ('charge_scene_a.png', 'THE LANE, THE CHARGE, THE HEDGE', 'Its lane marked before it goes (get out of it) · off down the lane, 11 tiles a second'),
    ('charge_scene_b.png', '', 'A hedge of thorns bursts up behind it all along its path · a wall the knight cannot cross, for 4 s'),
    ('charge_old_new.png', 'THE OLD STOMP · THE NEW CHARGE · SAME SCALE', 'Old: reared, thorns burst round it · New: antlers down and held, then off down the lane'),
    ('gore_front.png', 'ITS GORE, BY MOVEMENT 9 · FROM IN FRONT', 'Lowered · HELD · lunging a stride · hooked up (2 frames, smeared) · flung up · stepping back'),
    ('gore_back.png', '', 'From behind: the same six moments'),
    ('gore_old_new.png', 'THE OLD GORE · THE NEW · SAME SCALE', 'Old: a short lunge · New: held low longer, then a stride and a hook, reaching 1.6 tiles (was 1.1)'),
    ('leap_front_a.png', 'THE FOG WOLF’S LUNGE · FROM IN FRONT', 'Crouched into its fog · HELD · in the air (2 frames, smeared: its fog and its eyes’ fire drawn out)'),
    ('leap_front_b.png', '', 'Snapped shut past you · skidding on to the ring across · back into its fog'),
    ('leap_back.png', '', 'From behind: crouched and held · snapped shut past you · back into its fog'),
    ('pack_scene_a.png', 'THE PACK STRIKE', 'They spread in a ring round you (2.6 tiles) · then one leaps through you, 4.4 tiles in 2 frames'),
    ('pack_scene_b.png', '', 'The next, from the next side, 0.35 s after · all four, and still a ring round you'),
    ('pack_above.png', 'FROM ABOVE', 'One after another, going round, each from its own side, a beat apart'),
    ('leap_old_new.png', 'THE OLD BITE · THE NEW LUNGE · SAME SCALE', 'Old: a lunge and a snap, 1.2 tiles · New: held, then 4.4 tiles in 2 frames'),
    ('retch_front.png', 'THE DROWNED’S BOG RETCH · FROM IN FRONT', 'Risen · HELD, heaving · lurching · retching (2 frames, smeared) · pouring · hunched again'),
    ('retch_back.png', '', 'From behind: the same six moments'),
    ('retch_scene.png', 'THE CONE, THE GUSH', 'The cone marked as it heaves · the gush of black bog water thrown over it, 3.2 tiles out'),
    ('retch_scene_b.png', 'THE SLICK', 'It lies 5 s, black and oily, its edge pink: it slows and stings · the knight wades out at half his pace'),
    ('grab_front.png', 'THE DROWNED’S FROST GRAB · FROM IN FRONT', 'Arms up · HELD, frost on its hands · lunging · clutching (2 frames, smeared) · wrenching · hunched'),
    ('grab_back.png', '', 'From behind: the same six moments'),
    ('grab_scene.png', 'FROZEN IN PLACE', 'Rime over the floor, 1 tile round, and ice round his feet: held 0.8 s · it shatters as he is let go'),
    ('grab_old_new.png', 'THE OLD GRAB · THE NEW · SAME SCALE', 'Old: arms up, a clutch · New: held with frost on its hands, then a grab that freezes · grey-white frost, never cyan'),
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
