#!/usr/bin/env python3
"""THE AMALGAMATION'S MOVES DONE THE ACTION WAY: the sheet, put together with its captions for the owner's phone (the panels are
   tools/action_f4_amalgam_sheet.ts's).
   python3 tools/action_f4_amalgam_captions.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
ROWS = [
    ('swipe_front.png', 'THE SWIPE, A COMBO · FROM IN FRONT', 'Right arm drawn back, HELD · raked (2 frames) · left drawn back, HELD · raked · REARED, HELD · slammed'),
    ('swipe_old.png', 'BEFORE: ITS OLD SWIPE', 'One arm: drawn back · held a moment · raked · back down. Low, never above the knight'),
    ('swipe_back.png', 'THE SWIPE · FROM BEHIND', 'The same six moments'),
    ('rain_front.png', 'THE BONE RAIN · FROM IN FRONT', 'Rearing · reared, ROARING, HELD · all four arms slammed (2 frames) · pressed, shuddering'),
    ('rain_back.png', 'THE BONE RAIN · FROM BEHIND', 'The same four moments'),
    ('arena1.png', 'THE BONE RAIN OVER THE WHOLE FLOOR · THE SHADOWS', 'The niches shed their skulls: each one’s shadow and its reach on the floor before it lands'),
    ('arena2.png', 'THE WAVES COMING DOWN', 'The first wave burst, its piles lying; the second coming down between them; the third’s shadows'),
    ('arena3.png', 'THE PILES', 'Each skull leaves a pile of bones that slows you for 6 seconds: the floor taken away'),
    ('arms_front.png', 'THE FLOOR ARMS · FROM IN FRONT', 'Reared higher, HELD · slammed flat (2 frames) · pressed while the arms come up · letting go'),
    ('arms_back.png', 'THE FLOOR ARMS · FROM BEHIND', 'The same four moments'),
    ('devour_front.png', 'DEVOUR · FROM IN FRONT', 'Reared, maw gaping, arms flung wide, HELD · the RAKE (2 frames) · the drag · the BITE (2 frames)'),
    ('devour_back.png', 'DEVOUR · FROM BEHIND', 'The same four moments'),
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
