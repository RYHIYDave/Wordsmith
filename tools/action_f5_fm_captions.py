#!/usr/bin/env python3
"""THE FLESHMANCER'S MOVES DONE THE ACTION WAY: the sheet, put together with its captions for the owner's phone (the panels are
   tools/action_f5_fm_sheet.ts's).
   python3 tools/action_f5_fm_captions.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
ROWS = [
    ('shards_front.png', 'THE BONE SHARDS · FROM IN FRONT', 'Drawn up out of the floor, the fan HELD, aimed, lanes marked · hammered: it flies · a second fan in its gaps'),
    ('shards_old.png', 'BEFORE AND AFTER: HIS OLD SHARDS · THE NEW', 'Old: staff cocked · 7 small shards spat from the skull · New: 9 big shards hanging, HELD, hammered (and 8 more after)'),
    ('shards_back.png', 'THE BONE SHARDS · FROM BEHIND', 'The same three moments'),
    ('rings_front.png', 'THE RINGS OF HANDS · FROM IN FRONT', 'Arms up, 5 rings of cracks lit, gaps dark, HELD · SLAM: every other ring · SLAM: the rest'),
    ('rings_back.png', 'THE RINGS OF HANDS · FROM BEHIND', 'The same three moments'),
    ('arena_rings.png', 'THE RINGS OVER THE WHOLE LAIR', 'Lit out to the walls (6.2 tiles) · the second slam, the first rings sinking'),
    ('fire_front.png', 'THE FIRE SWEEP · FROM IN FRONT', 'Reared back, the fire gathering, HELD · the stream WHIPS ROUND (1.2 s) · the floor burning in lanes'),
    ('fire_back.png', 'THE FIRE SWEEP · FROM BEHIND', 'The same three moments'),
    ('arena_fire.png', 'THE FIRE OVER THE WHOLE LAIR', 'Out to 7 tiles, whipped round · ten lanes left burning 3 s: stand between them'),
    ('raise_front.png', 'RAISE THE DEAD · FROM IN FRONT', 'Arms up, the heaps shaking, lit from under, HELD · flung down: the dead BURST up · up and coming'),
    ('raise_back.png', 'RAISE THE DEAD · FROM BEHIND', 'The same three moments'),
    ('teleport_front.png', 'THE TELEPORT · FROM IN FRONT', 'YANKED down into a pit of his dead · where he will rise marked first · he ERUPTS: a burst all round'),
    ('teleport_back.png', 'THE TELEPORT · FROM BEHIND', 'The same three moments'),
    ('mini_front.png', 'THE MINI FLESHMANCER’S FIRE · FROM IN FRONT', 'Claws cocked, HELD · thrust: the fire whipped across (0.6 s) · the floor left burning'),
    ('mini_back.png', 'THE MINI FLESHMANCER’S FIRE · FROM BEHIND', 'The same three moments'),
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
