#!/usr/bin/env python3
"""THE SECOND ROUND OF FIXES' SHEET (docs/mockups/action_fixes/pictures/action_fixes2_sheet.png), for the owner's phone: for each of
the five that lost their hit-hit-slam combo, its OLD combo beside its NEW move at the same scale (the figures' own frames:
tools/action_fixes2_frames.ts, the old run on the branch before these changes), and the key moments of the new move on its floor with the
knight (stills of the film: tools/action_fixes2_stills.ts).
   python3 tools/action_fixes2_sheet.py <frames dir> <stills dir> <out.png>"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

frames, stills, out = sys.argv[1], sys.argv[2], sys.argv[3]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG = (20, 18, 30)
CELL = (24, 22, 36)
PALE, GREY, PINK = (240, 232, 214), (186, 180, 204), (255, 122, 168)
big, mid, small = ImageFont.truetype(B, 30), ImageFont.truetype(B, 21), ImageFont.truetype(R, 16)
W = 1200

FIGS = [
    ('amalgam', 'THE AMALGAMATION (floor 4) · THE GRASPING FAN', 'Rake, rake, rearing slam', [1, 3, 5],
     'A dozen arms bunched · out 5 tiles in 2 frames · snatched shut', [0, 3, 4],
     ['p0_1.00.png', 'p0_1.50.png', 'p1_1.90.png'], ['Swelling, each arm’s line marked, HELD', 'Out across the floor in a 120° fan', 'Snatched shut, hauled back in']),
    ('crier', 'THE CRIER (floor 11) · THE TOLL FOLLOWS YOU', 'Swing, backswing, slammed finisher', [1, 3, 5],
     'Handbell up, HELD · rung in 2 frames · five tolls', [1, 3, 4],
     ['p3_1.55.png', 'p4_2.60.png', 'p3_2.20.png'], ['A toll marks where you stand', 'From higher up: each bursts a beat later', 'Keep moving: they burst behind you']),
    ('reaper', 'THE HUSHED REAPER (floor 13) · THE SICKLE BOOMERANG', 'Cut, cut, leaping hook', [1, 3, 5],
     'Drawn back, HELD · flung in 2 frames · caught', [0, 2, 4],
     ['p6_0.90.png', 'p7_1.60.png', 'p6_2.75.png'], ['Its curve marked, HELD', 'From higher up: 6 tiles out and back', 'Caught: a stagger back']),
    ('gardener', 'THE HUSHED GARDENER (floor 16) · THE SHEAR LUNGE', 'Snip, snip, scissoring leap', [1, 3, 5],
     'A long crouch, HELD · 3 tiles in 2 frames · shut', [0, 2, 4],
     ['p10_1.10.png', 'p10_1.53.png', 'p11_1.60.png'], ['The long crouch, the lane marked', 'Three tiles in two frames', 'Caught where the blades shut']),
    ('guard', 'THE PALACE GUARD (floor 16) · THE JAVELIN', 'Chop, spin, driven-in slam', [1, 3, 5],
     'Hauled back, HELD · hurled in 2 frames', [0, 3, 4],
     ['p13_1.10.png', 'p13_1.95.png', 'p15_3.00.png'], ['Where you stand marked, HELD', 'It sticks quivering: a burst of turf', 'His sword out till he wrenches it back']),
]


def bbox_crop(im):
    bb = im.getchannel('A').getbbox()
    return im.crop(bb) if bb else im


def load(which, name, i):
    # (the frames are written without their see-through: what is pure black is the canvas's empty)
    im = Image.open(os.path.join(frames, f'{which}_{name}_{i}_front.png')).convert('RGB')
    a = Image.eval(im.convert('L'), lambda v: 255 if v > 0 else 0)
    rgba = im.convert('RGBA')
    rgba.putalpha(a)
    return bbox_crop(rgba)


blocks = []
for name, title, oldline, oldi, newline, newi, keys, keylines in FIGS:
    olds = [load('old', name, i) for i in oldi]
    news = [load('new', name, i) for i in newi]
    allf = olds + news
    k = min(3.0, 186 / max(f.width for f in allf), 200 / max(f.height for f in allf))
    fh = int(max(f.height for f in allf) * k) + 8
    hb = 46 + 26 + fh + 12 + 232 + 26 + 18
    blk = Image.new('RGB', (W, hb), BG)
    d = ImageDraw.Draw(blk)
    d.text((18, 10), title, font=mid, fill=PALE)
    d.text((18, 46), 'BEFORE: ' + oldline, font=small, fill=GREY)
    d.text((612, 46), 'NOW: ' + newline, font=small, fill=PINK)
    y0 = 72
    for j, f in enumerate(olds + news):
        cx = 18 + j * 196 + (12 if j >= 3 else 0)
        d.rectangle([cx, y0, cx + 188, y0 + fh], fill=CELL)
        g = f.resize((max(1, int(f.width * k)), max(1, int(f.height * k))), Image.NEAREST)
        blk.paste(g, (cx + (188 - g.width) // 2, y0 + fh - g.height - 4), g)
    d.line([(606, y0), (606, y0 + fh)], fill=PINK, width=2)
    y1 = y0 + fh + 12
    for j, (kf, kl) in enumerate(zip(keys, keylines)):
        im = Image.open(os.path.join(stills, kf)).convert('RGB').resize((388, 218), Image.LANCZOS)
        x = 18 + j * 394
        blk.paste(im, (x, y1))
        d.text((x + 2, y1 + 222), kl, font=small, fill=GREY)
    blocks.append(blk)

head = Image.new('RGB', (W, 96), BG)
d = ImageDraw.Draw(head)
d.text((18, 12), 'FIVE NEW MOVES IN PLACE OF “HIT, HIT, SLAM”', font=big, fill=PALE)
d.text((18, 56), 'Each old combo beside its new move, same scale; then the new move on its floor with the knight.', font=small, fill=GREY)
H = head.height + sum(b.height + 10 for b in blocks)
sheet = Image.new('RGB', (W, H), BG)
sheet.paste(head, (0, 0))
y = head.height
for b in blocks:
    sheet.paste(b, (0, y))
    y += b.height + 10
sheet.save(out, optimize=True)
print(out, sheet.size)
