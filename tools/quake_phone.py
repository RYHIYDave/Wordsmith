#!/usr/bin/env python3
"""THE EARTHQUAKE'S GROUND, A PICTURE FOR HIS PHONE (docs/mockups/warrior_weapons/pictures/quake_phone.png; step 3c): six moments
of the one Earthquake, big, two across, from the slow, close shot of the film (tools/scenarios/hammer_film.mjs `quake_slow`:
twice the game's size); and under them the three quakes of Tremors side by side (`tremors_slow`). His rule for stills: no wider
than 1260, no taller than 2200, a few big things.
   python3 tools/quake_phone.py <frames dir> <stills dir> <out.png>
(the frames dir holds the film's manifest.json; the stills dir every picture of the film, from tools/warrior_axe_film.py)"""
import json
import os
import sys
from PIL import Image, ImageDraw, ImageFont

src, stills, out = sys.argv[1], sys.argv[2], sys.argv[3]
m = json.load(open(os.path.join(src, 'manifest.json')))['frames']
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
big, small = ImageFont.truetype(B, 30), ImageFont.truetype(B, 24)
BG, PALE, CYAN = (16, 13, 30), (240, 232, 255), (40, 220, 240)
first = {s: next(i for i, f in enumerate(m) if f['shot'] == s) for s in ('quake_slow', 'tremors_slow')}
BLOW = 19 * 2  # the blow's frame in the slow shots (half speed)
ROLL = 21      # the wave out to the edge, in the slow shots' pictures (0.35 s at half speed)
# (the mark, on the slow pictures: the middle across, 22 game pixels below the middle down, five screen pixels to a game pixel)
MX, MY = 633, 293 + 22 * 5
def cut(i, w, h, up):
    # (no lower than the picture: the film's caption band begins at 586)
    y1 = min(586, MY + h // 2 - up)
    return Image.open(os.path.join(stills, f'c{i:05d}.png')).crop((MX - w // 2, y1 - h, MX + w // 2, y1))
moments = [(0, 'The blow'), (ROLL // 3, 'The wave, a third out'), (2 * ROLL // 3, 'Two thirds out'), (ROLL, 'At the ring\'s edge'), (ROLL + 22, 'The dust settling'), (ROLL + 64, 'What is left')]
W, H, CAP = 620, 420, 44
tre = [(0 + 14, 'First quake'), (22 + 14, 'Second, wider, weaker'), (42 + 14, 'Third, widest, weakest')]
TW, TH = 410, 260
total_h = 60 + 3 * (H + CAP) + 60 + TH + CAP
pic = Image.new('RGB', (1260, total_h), BG)
d = ImageDraw.Draw(pic)
d.text((10, 12), 'EARTHQUAKE: the ground quaking (half speed, twice the size)', font=big, fill=CYAN)
for k, (dt, say) in enumerate(moments):
    x, y = (k % 2) * 630, 60 + (k // 2) * (H + CAP)
    pic.paste(cut(first['quake_slow'] + BLOW + dt, W, H, 60), (x, y))
    d.text((x + 8, y + H + 6), say, font=small, fill=PALE)
y0 = 60 + 3 * (H + CAP)
d.text((10, y0 + 12), 'TREMORS: three quakes from the one blow', font=big, fill=CYAN)
for k, (dt, say) in enumerate(tre):
    im = cut(first['tremors_slow'] + BLOW + dt, 840, 532, 0).resize((TW, TH), Image.BOX)
    pic.paste(im, (k * 425, y0 + 60))
    d.text((k * 425 + 6, y0 + 60 + TH + 6), say, font=small, fill=PALE)
pic.save(out)
print(out, pic.size)
