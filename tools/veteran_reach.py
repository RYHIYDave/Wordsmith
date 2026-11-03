#!/usr/bin/env python3
"""THE VETERAN'S REACH, BEFORE AND NOW: the pictures tools/veteran_reach.ts made of the old version and of this one, laid out
   one above the other with captions and the ruler's rings labelled (about 1200 wide).
   python3 tools/veteran_reach.py <before dir> <now dir> <out.png>"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
a, b, out = sys.argv[1], sys.argv[2], sys.argv[3]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
W = 1200
BG, PANEL, PANEL2, GOLD, TEXT, SOFT, OLD, NEW = (23, 20, 46), (38, 35, 84), (33, 30, 75), (255, 216, 102), (228, 224, 255), (168, 162, 216), (200, 150, 160), (120, 230, 240)
RING = {'2½': (216, 208, 255), '3½': (255, 230, 168)}
big, mid, small, tiny = ImageFont.truetype(B, 34), ImageFont.truetype(B, 24), ImageFont.truetype(R, 19), ImageFont.truetype(B, 17)
A = json.load(open(os.path.join(a, 'reach.json')))
N = json.load(open(os.path.join(b, 'reach.json')))
ROWS = [
  ('hook', 'The hook (tap)', 'Before: the fist reached about a tile. Now: a stamping step in (¾ of a tile), and a crescent of force flung out flat from the fist, out to 2½ tiles from where he stood: through two of them side by side.'),
  ('roundkick', 'The round kick (hold, and the first hold of combos 4 and 5)', 'Before: the shin reached about a tile. Now: a skipping step in (a tile), and a crescent of hot orange force off the shin, out to 2½ tiles from where he stood.'),
  ('push', 'The push kick (the second hold of combo 4)', 'Before: the cone ran 2½ tiles from his heel. Now: a skip in (a tile), and the cone fans out from his heel, 60 degrees wide, to 3½ tiles from where he stood: all in it shoved back.'),
  ('spinkick', 'The spinning jump kick (swipe, then hold)', 'Before: his leg about a tile round him, through two whole turns. Now: one heavy crescent of force thrown off his leg as it comes round, rolled out to 3½ tiles round him; each foe hit once as it passes him, knocked flying. Not the Whirlwind: no ring of blades, nothing again and again.'),
]
def wrap(d, text, font, maxw):
    res, line = [], ''
    for w in text.split(' '):
        t = (line + ' ' + w).strip()
        if d.textlength(t, font=font) > maxw and line:
            res.append(line); line = w
        else:
            line = t
    if line: res.append(line)
    return res
probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
blocks = []
for key, title, line in ROWS:
    lines = wrap(probe, line, small, W - 40)
    ha = Image.open(os.path.join(a, A[key]['file'])).height
    hb = Image.open(os.path.join(b, N[key]['file'])).height
    blocks.append((key, title, lines, 40 + 24 * len(lines) + 10 + (30 + ha + 10) + (30 + hb + 10) + 10))
intro = 'His word (3 Nov): more reach on all his moves; shown both ways: he steps in further, and force flies off each blow. Each move at the moment it reaches furthest, from the game’s view: before above, now below. On the floor, rings round where he stood (the small cross) at 1, 2, 2½, 3 and 3½ of the game’s tiles. Pictures only: not in the game.'
ilines = wrap(probe, intro, small, W - 36)
HEAD = 70 + 25 * len(ilines) + 16
im = Image.new('RGB', (W, HEAD + sum(x[3] for x in blocks) + 20), BG)
d = ImageDraw.Draw(im)
d.text((18, 16), 'The Veteran: his reach, before and now', font=big, fill=GOLD)
for k, ln in enumerate(ilines):
    d.text((18, 64 + k * 25), ln, font=small, fill=SOFT)
y = HEAD
for i, (key, title, lines, h) in enumerate(blocks):
    d.rectangle([8, y, W - 8, y + h - 8], fill=PANEL if i % 2 == 0 else PANEL2)
    d.text((20, y + 8), title, font=mid, fill=GOLD)
    for k, ln in enumerate(lines):
        d.text((20, y + 40 + k * 24), ln, font=small, fill=TEXT)
    cy = y + 40 + 24 * len(lines) + 10
    for tag, col, dirn, J in (('BEFORE', OLD, a, A[key]), ('NOW', NEW, b, N[key])):
        d.text((20, cy + 2), tag, font=small, fill=col)
        cy += 30
        pic = Image.open(os.path.join(dirn, J['file'])).convert('RGB')
        x0 = (W - pic.width) // 2
        im.paste(pic, (x0, cy))
        # (the rings' labels where each crosses his forward; 2½ and 3½ brightest)
        for lb in J['labels']:
            c = RING.get(lb['t'], (150, 144, 190))
            tx, ty = x0 + lb['x'], cy + lb['y']
            if 0 <= ty < cy + pic.height - 14:
                d.text((tx + 1, ty + 1), lb['t'], font=tiny, fill=(8, 6, 16))
                d.text((tx, ty), lb['t'], font=tiny, fill=c)
        cy += pic.height + 10
    y += h
im.save(out, optimize=True)
print(out, im.size)
