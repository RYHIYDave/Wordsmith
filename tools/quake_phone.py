#!/usr/bin/env python3
"""THE EARTHQUAKE'S GROUND, PICTURES FOR HIS PHONE (steps 3c and 3d), from the slow, close shots of the film
(tools/scenarios/hammer_film.mjs `quake_slow`, `tremors_slow`: twice the game's size, half speed), each cut CENTRED ON THE MARK
(the ring's middle, worked out as the film's own cut is: tools/warrior_axe_film.py) so the whole ring is in it:
  docs/mockups/warrior_weapons/pictures/quake_phone.png    six moments of the one Earthquake, two across
  docs/mockups/warrior_weapons/pictures/tremors_phone.png  Tremors' three quakes, one above another
His rule for stills: no wider than 1260, no taller than 2200, a few big things, captions of three or four plain words.
   python3 tools/quake_phone.py <frames dir> <stills dir> <pictures dir>"""
import json
import os
import sys
from PIL import Image, ImageDraw, ImageFont

src, stills, out = sys.argv[1], sys.argv[2], sys.argv[3]
man = json.load(open(os.path.join(src, 'manifest.json')))
m, K = man['frames'], man['scale']
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
big, small = ImageFont.truetype(B, 30), ImageFont.truetype(B, 26)
BG, PALE, CYAN = (16, 13, 30), (240, 232, 255), (40, 220, 240)
FW, FH = 1266, 586  # the film's picture (its caption band below)
first = {s: next(i for i, f in enumerate(m) if f['shot'] == s) for s in ('quake_slow', 'tremors_slow')}
BLOW = 19 * 2  # the blow, in the slow shots' pictures
ROLL = 21      # the wave out to the edge (0.35 s at half speed)

def mark_of(i):
    """Where the mark is in still `i` (the film's cut: round the hero and his lead, 22 game pixels up, kept on the screen)."""
    f = m[i]
    full = Image.open(os.path.join(src, f['file']))
    lead = f.get('lead') or [0, 0]
    cx = round((f['hero']['x'] + lead[0]) * K)
    cy = round((f['hero']['y'] + lead[1]) * K) - 22 * K
    x0 = max(0, min(full.width - FW, cx - FW // 2))
    y0 = max(0, min(full.height - FH, cy - FH // 2))
    return cx - x0, cy - y0 + 22 * K

def cut(i, w, h, below):
    """A `w` by `h` cut of still `i` with the mark in the middle across and `below` from its foot (padded where the film ends)."""
    im = Image.open(os.path.join(stills, f'c{i:05d}.png')).crop((0, 0, FW, FH))
    mx, my = mark_of(i)
    x0, y0 = mx - w // 2, my + below - h
    pad = Image.new('RGB', (w, h), BG)
    pad.paste(im.crop((max(0, x0), max(0, y0), min(FW, x0 + w), min(FH, y0 + h))), (max(0, -x0), max(0, -y0)))
    return pad

moments = [(0, 'The blow'), (ROLL // 3, 'A third out'), (2 * ROLL // 3, 'Two thirds out'), (ROLL, 'At the edge'), (ROLL + 22, 'The dust settling'), (ROLL + 64, 'What is left')]
W, H, CAP = 620, 440, 46
pic = Image.new('RGB', (1260, 60 + 3 * (H + CAP)), BG)
d = ImageDraw.Draw(pic)
d.text((10, 12), 'EARTHQUAKE: the ground quaking', font=big, fill=CYAN)
for k, (dt, say) in enumerate(moments):
    x, y = (k % 2) * 640, 60 + (k // 2) * (H + CAP)
    pic.paste(cut(first['quake_slow'] + BLOW + dt, W, H, 150), (x, y))
    d.text((x + 8, y + H + 8), say, font=small, fill=PALE)
pic.save(os.path.join(out, 'quake_phone.png'))
print('quake_phone.png', pic.size)

tre = [(14, 'The first quake'), (22 + 14, 'The second, wider, weaker'), (42 + 14, 'The third, widest, weakest')]
W, H = 1260, 540
pic = Image.new('RGB', (1260, 60 + 3 * (H + CAP)), BG)
d = ImageDraw.Draw(pic)
d.text((10, 12), 'TREMORS: three quakes, one blow', font=big, fill=CYAN)
for k, (dt, say) in enumerate(tre):
    y = 60 + k * (H + CAP)
    pic.paste(cut(first['tremors_slow'] + BLOW + dt, W, H, 220), (0, y))
    d.text((8, y + H + 8), say, font=small, fill=PALE)
pic.save(os.path.join(out, 'tremors_phone.png'))
print('tremors_phone.png', pic.size)
