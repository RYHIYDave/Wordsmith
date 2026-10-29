#!/usr/bin/env python3
"""THE KING'S PICTURES, captioned for the owner's phone: a band over each picture with what it is.
   python3 tools/king_captions.py <raw dir> <out dir>
(the raw pictures are tools/king_pictures.ts's: raw_sheet.png, raw_game_size.png, raw_hush.png, raw_songbird.png, raw_blows.png)"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 30), ImageFont.truetype(R, 21)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
PICS = [
    ('raw_sheet.png', 'king_sheet.png', 'THE KING, STANDING', 'From in front and from behind, beside the knight; three times as big. The Hush rides his back.'),
    ('raw_game_size.png', 'king_game_size.png', 'AT THE GAME’S SIZE', 'In his hall (the floor a stand-in); behind, his last phase, the Hush at his side.'),
    ('raw_hush.png', 'king_hush.png', 'HIS LAST PHASE: THE HUSH AT HIS SIDE', 'Climbed off his back, it stands at his left; from in front and from behind, three times as big.'),
    ('raw_songbird.png', 'king_songbird.png', 'THE CLOCKWORK SONGBIRD', 'Broken; winding itself up; singing. In front above, behind below; four times as big.'),
    ('raw_blows.png', 'king_blows.png', 'HIS BLOWS ACROSS THE HALL', 'The sweep’s wave, the Decree’s knights, the Crown’s ring, the faces from the curtains.'),
]
for raw, name, title, line in PICS:
    p = os.path.join(src, raw)
    if not os.path.exists(p):
        continue
    im = Image.open(p).convert('RGB')
    band = 78
    card = Image.new('RGB', (im.width, im.height + band), BG)
    d = ImageDraw.Draw(card)
    d.text((18, 12), title, font=big, fill=TITLE)
    d.text((18, 48), line, font=small, fill=LINE)
    card.paste(im, (0, band))
    card.save(os.path.join(out, name), optimize=True)
    print(name, card.size)
