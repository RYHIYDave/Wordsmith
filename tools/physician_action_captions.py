#!/usr/bin/env python3
"""THE PHYSICIAN'S MOVES DONE THE ACTION WAY: the sheet, put together with its captions for the owner's phone (the panels are
   tools/physician_action_sheet.ts's).
   python3 tools/physician_action_captions.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
ROWS = [
    ('diag_arena1.png', 'NOW: DIAGNOSIS · 1. HIS LENS FINDS YOU', 'A cone of pale light follows you across the theatre · the mark round you (and over your head) fills while you stand in it'),
    ('diag_arena2.png', '2. HIDE BEHIND A BED OR A PILLAR', 'They throw hard shadows down the light · out of it, the mark drains'),
    ('diag_arena3.png', '3. FULL: HE OPERATES', 'The field round where you stood is marked · his lens flares over his head, HELD · run'),
    ('diag_arena4.png', '4. ONE HUGE STRIKE', 'In 2 frames the light through the lens burns the cuts into the floor, 2.5 tiles round'),
    ('tonic_old.png', 'BEFORE: HIS OLD TONIC', 'Three phials flung at you · clouds of the Hush on the floor'),
    ('diag_front.png', 'DIAGNOSIS, THEN HE OPERATES · FROM IN FRONT', 'Peering through the lens, the mark filling · the lens flung up flaring, his instruments fanned out, HELD · the strike'),
    ('diag_back.png', 'DIAGNOSIS, THEN HE OPERATES · FROM BEHIND', 'The same three moments'),
    ('rap_front.png', 'THE RAP · FROM IN FRONT', 'The cane hauled up over his shoulder, HELD · down in 2 frames at the end of a long step · cracks 1.5 tiles round'),
    ('rap_back.png', 'THE RAP · FROM BEHIND', 'The ferrule lands 1.9 tiles out (old 1.2) · the knight caught in the star'),
    ('draw_front.png', 'THE DRAW · FROM IN FRONT', 'En garde, HELD · the lunge in 2 frames, a needle of light 3.6 tiles down the lane (old 2.2)'),
    ('draw_word.png', 'THE DRAW · YOUR WORD TAKEN', 'Held there while the barrel fills · then your word hangs over his head until you beat it out of him (as now)'),
    ('draw_back.png', 'THE DRAW · FROM BEHIND', 'Out of the marked lane while he holds en garde'),
    ('rounds_front.png', 'ROUNDS · FROM IN FRONT', 'The cane hoisted, HELD · three raps, 2 frames each · a ring of the Hush rolls out from each'),
    ('rounds_back.png', 'ROUNDS · FROM BEHIND, THE WHOLE RING', 'Rings 6.5 tiles out (old 3.5) · out past the marked ring while he holds the cane up'),
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
