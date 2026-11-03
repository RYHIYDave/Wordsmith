#!/usr/bin/env python3
"""THE FLOORS 6 TO 8 ACTION SHEET, put together with its captions for the owner's phone (the panels are tools/action_f6_sheet.ts's).
   python3 tools/action_f6_captions.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
ROWS = [
    ('lob_front.png', 'THE FIREPOT THROWER’S LOB, MADE BIG · FROM IN FRONT', 'Whirling · wound back and HELD (the warning) · over the top · slung (2 frames, smeared) · bent after it · another pot'),
    ('lob_back.png', 'FROM BEHIND', 'The same six moments'),
    ('lob_scene.png', 'HIGH, AND MUCH BIGGER', 'Coming down on its shadow, its reach marked · the whoosh, 1.6 tiles round · the floor burning 1.4 round, for 5 s'),
    ('lob_old_new.png', 'THE OLD LOB · THE NEW · SAME SCALE', 'Old: whirled, let go · New: wound back and held, then slung over the top'),
    ('cast_front.png', 'THE CHANTER’S CHAIN LIGHTNING · FROM IN FRONT', 'The book heaved up · HELD, crackling · down at you · the lightning leaves it (2 frames, smeared) · rocked over · smoking'),
    ('cast_back.png', 'FROM BEHIND', 'The same six moments'),
    ('chain_scene.png', 'THE RING, THE STRIKE, THE JUMPS', 'A ring crackles under you: get out · struck, it jumps on to anyone within 2.5 tiles of you (two stand-ins here)'),
    ('cast_old_new.png', 'THE OLD BOLT · THE NEW CAST · SAME SCALE', 'Old: the book raised, the bolt thrust out · New: held high and crackling, then brought down at you'),
    ('roll_front_a.png', 'THE QUARRY GOLEM’S BOULDER ROLL · FROM IN FRONT', 'Torn up out of the rock · swung up at arm’s length · HELD overhead (the lane marked)'),
    ('roll_front_b.png', '', 'Over and down · bowled onto the floor (2 frames, smeared) · bent after it'),
    ('roll_back_a.png', 'FROM BEHIND', 'The same six moments'),
    ('roll_back_b.png', '', ''),
    ('roll_scene.png', 'THE LANE, THE ROLL, THE SMASH', 'Its lane marked as it heaves the boulder up · rolling, bouncing, 7 tiles a second · smashing 1.5 tiles round'),
    ('roll_old_new.png', 'THE OLD THROWN CHUNK · THE NEW BOULDER · SAME SCALE', 'Old: a chunk off its shoulder, thrown · New: a boulder overhead, bowled'),
    ('hammer.png', 'ITS HAMMER, BY MOVEMENT 9', 'Raised · HELD · down in 2 frames, smeared · on the floor · crouched after it'),
    ('hammer_scene.png', '', 'The floor cracks and a ring of dust goes out 1.5 tiles round (was 0.8); the knight steps back out of it'),
    ('spit_front.png', 'THE CANYON SCORPION’S ACID SPIT · FROM IN FRONT', 'Cocked · HELD, dripping · flung over · spat (2 frames, smeared) · on down · settling'),
    ('spit_back.png', 'FROM BEHIND', 'The same six moments'),
    ('spit_scene.png', 'UP HIGH, DOWN WHERE YOU STOOD: A POOL', 'Coming down on its shadow, its splash marked · the pool, 1.4 tiles round, hissing and smoking for 4.5 s'),
    ('snap.png', 'ITS SNAP, BY MOVEMENT 9', 'Spread wide · HELD · lunging in · shut (2 frames, smeared) · squeezing · back'),
    ('spit_old_new.png', 'THE OLD TAIL STRIKE · THE NEW SPIT · SAME SCALE', 'Old: stabbing, its venom splashed two tiles on · New: held dripping, then spat high'),
    ('twister_front.png', 'THE DUST DEVIL’S TWISTER · FROM IN FRONT', 'Spinning up · HELD, crackling · bursting up (2 frames) · the twister · throwing lightning · collapsing'),
    ('twister_back.png', 'FROM BEHIND', 'The same six moments'),
    ('twister_scene.png', 'THE DRAG, THE LIGHTNING', 'Sand swirling in shows how far it drags you (2.6 tiles) · each bolt’s place crackles first · it chases you'),
    ('twister_old_new.png', 'THE OLD LASH · THE NEW TWISTER · SAME SCALE', 'Old: spun up, its whip of sand cracked out · New: held, then a twister taller than the knight'),
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
