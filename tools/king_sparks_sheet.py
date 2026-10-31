#!/usr/bin/env python3
"""THE KING'S CHARGE: ITS SPARKS SHOOTING OFF AND POPPING (31 Oct), the sheet for the owner's phone (1200 wide).
   npx tsx tools/king_new_moves.ts sparks-sheet <panels dir>; python3 tools/king_sparks_sheet.py <panels dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small, tag = ImageFont.truetype(B, 30), ImageFont.truetype(R, 21), ImageFont.truetype(B, 18)
BG, TITLE, LINE, TAG = (12, 10, 20), (240, 232, 208), (200, 194, 220), (255, 240, 200)
W = 1200
TITLE_T = 'THE CHARGE: ITS LINE OF SPARKS'
LINES = ['0.6 s after he stops, held: the line white-hot, its sparks beaded on it. Then they shoot off it, up to 1.5 tiles high',
         'and 1.6 out, and each pops 0.28 to 0.4 s after leaving: shrapnel 1 tile round it. The hit: 2.6 tiles round the line.']
PANELS = [('sparks_0', 'held: white-hot, beaded'), ('sparks_1', 'shot off: two frames'), ('sparks_2', 'flying up and out'),
          ('sparks_3', 'each pops'), ('sparks_4', 'the shrapnel'), ('sparks_5', 'smoke, the scar; gone at 1 s')]
hall = Image.open(os.path.join(src, 'sparks_hall.png')).convert('RGB')
ims = [(Image.open(os.path.join(src, f + '.png')).convert('RGB'), t) for f, t in PANELS]
pw, ph = ims[0][0].size
band = 104
sheet = Image.new('RGB', (W, band + hall.height + ph * 3), BG)
d = ImageDraw.Draw(sheet)
d.text((16, 10), TITLE_T, font=big, fill=TITLE)
for i, l in enumerate(LINES):
    d.text((16, 50 + 24 * i), l, font=small, fill=LINE)
def labelled(im, x, y, t):
    sheet.paste(im, (x, y))
    d.rectangle([x, y, x + im.width - 1, y + im.height - 1], outline=(60, 54, 80))
    tw = d.textlength(t, font=tag)
    d.rectangle([x + 6, y + 6, x + 14 + tw, y + 30], fill=(7, 6, 12))
    d.text((x + 10, y + 8), t, font=tag, fill=TAG)
labelled(hall, 0, band, 'the shrapnel round the whole line, at the hall’s scale')
for i, (im, t) in enumerate(ims):
    labelled(im, (i % 2) * pw, band + hall.height + (i // 2) * ph, t)
sheet.save(out, optimize=True)
print(out, sheet.size)
