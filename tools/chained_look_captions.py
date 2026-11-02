#!/usr/bin/env python3
"""THE CHAINED ONE IN HIS NEW LOOK: the sheet, put together with its captions for the owner's phone (the panels are
   tools/chained_look_sheet.ts's).
   python3 tools/chained_look_captions.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
ROWS = [
    ('standing.png', 'THE CHAINED ONE · THE GAUNT CHAIN-WRAITH', 'From in front · the knight for size · from behind (three times as big)'),
    ('before_now.png', 'BEFORE · NOW', 'As he is in the game now · the knight · as he would be: taller, thinner, his chains wound round him'),
    ('cage.png', 'HIS FACE CAGE, CLOSE', 'Bolted over his face, the pink burning in its dark · roaring as a chain breaks · from behind'),
    ('game_size.png', 'AT THE GAME’S SIZE, IN HIS PIT', 'His lash · his whirl · the ball held high (the knight for size)'),
    ('breaking.png', 'AS HIS CHAINS BREAK', 'All his chains on him · the first: his left chain snaps under his foot · the second: the ball’s chain torn from his collar'),
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
