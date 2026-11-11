#!/usr/bin/env python3
"""THE EARTHQUAKE'S GROUND ON THREE FLOORS, A PICTURE FOR HIS PHONE (docs/mockups/warrior_weapons/pictures/quake_floors_phone.png;
step 3d): the three stills tools/quake_floors_phone.ts paints (the game's size in picture pixels), each made twice as big again,
one above another, captioned.
   npx tsx tools/quake_floors_phone.ts <dir> && python3 tools/quake_floors_phone.py <dir> <out.png>"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
big, small = ImageFont.truetype(B, 30), ImageFont.truetype(B, 26)
BG, PALE, CYAN = (16, 13, 30), (240, 232, 255), (40, 220, 240)
floors = [('practice', 'The practice room'), ('crypt3', 'The Crypt, its third floor'), ('gateward', 'Floor 11, the Gate Ward')]
W, H, CAP = 1240, 560, 46
pic = Image.new('RGB', (1260, 60 + 3 * (H + CAP)), BG)
d = ImageDraw.Draw(pic)
d.text((10, 12), 'The quake in each floor\'s own stone', font=big, fill=CYAN)
for k, (name, say) in enumerate(floors):
    im = Image.open(os.path.join(src, name + '.png')).convert('RGB')
    im = im.resize((im.width * 2, im.height * 2), Image.NEAREST)
    x0, y0 = (im.width - W) // 2, (im.height - H) // 2
    y = 60 + k * (H + CAP)
    pic.paste(im.crop((x0, y0, x0 + W, y0 + H)), (10, y))
    d.text((18, y + H + 8), say, font=small, fill=PALE)
pic.save(out)
print(out, pic.size)
