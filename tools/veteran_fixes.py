#!/usr/bin/env python3
"""THE VETERAN'S FIXES, BEFORE AND AFTER: the pictures tools/veteran_fixes.ts made of the old version and of this one, laid
   out one above the other with captions (about 1200 wide).
   python3 tools/veteran_fixes.py <before dir> <after dir> <out.png>"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
a, b, out = sys.argv[1], sys.argv[2], sys.argv[3]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
W = 1200
BG, PANEL, PANEL2, GOLD, TEXT, SOFT, OLD, NEW = (23, 20, 46), (38, 35, 84), (33, 30, 75), (255, 216, 102), (228, 224, 255), (168, 162, 216), (200, 150, 160), (120, 230, 240)
big, mid, small = ImageFont.truetype(B, 34), ImageFont.truetype(B, 24), ImageFont.truetype(R, 19)
A = json.load(open(os.path.join(a, 'fixes.json')))
N = json.load(open(os.path.join(b, 'fixes.json')))
ROWS = [
  ('stance', 'His stance', 'Before: his elbows out wide. Now: a fighter’s guard, elbows tucked in front of his ribs, forearms up, fists by his cheeks; still up on his toes.'),
  ('knee', 'The flying knee', 'Now: a longer, lower lunge held; the leap; the knee driven up into them, thigh level, shin tucked, both hands pulling them down onto it; snapped back; a heavy landing.'),
  ('elbow', 'The spinning elbow', 'Now: a bigger coil, his back turned to them; a whole turn drawn as a great arc of light round him at head height, the elbow leading; knocked aside; back to his guard.'),
  ('combo4', 'Combo 4: hold, hold, swipe and hold', 'Before: two round kicks the same. Now: a push kick that shoves back everyone in a cone in front (60 degrees, 2.5 tiles), then the round kick, then the spinning jump kick.'),
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
def strip(dirn, cells):
    ims = [Image.open(os.path.join(dirn, c['file'])).convert('RGB') for c in cells]
    return ims
blocks = []
for key, title, line in ROWS:
    lines = wrap(probe, line, small, W - 40)
    ha = Image.open(os.path.join(a, A[key][0]['file'])).height
    hb = Image.open(os.path.join(b, N[key][0]['file'])).height
    h = 40 + 24 * len(lines) + 10 + (30 + ha + 28) + (30 + hb + 28) + 10
    blocks.append((key, title, lines, h))
HEAD = 150
total = HEAD + sum(x[3] for x in blocks) + 20
im = Image.new('RGB', (W, total), BG)
d = ImageDraw.Draw(im)
d.text((18, 16), 'The Veteran: the fixes, before and now', font=big, fill=GOLD)
for k, ln in enumerate(wrap(d, 'His word on the moves (3 Nov): his elbows out too much in his stance; the knee and the elbow to read better, bigger wind-ups and hits; the three-kick combo two of the same kick. Each: before above, now below. From in front, twice the game size or more. Pictures only: not in the game.', small, W - 36)):
    d.text((18, 64 + k * 25), ln, font=small, fill=SOFT)
y = HEAD
for i, (key, title, lines, h) in enumerate(blocks):
    d.rectangle([8, y, W - 8, y + h - 8], fill=PANEL if i % 2 == 0 else PANEL2)
    d.text((20, y + 8), title, font=mid, fill=GOLD)
    for k, ln in enumerate(lines):
        d.text((20, y + 40 + k * 24), ln, font=small, fill=TEXT)
    cy = y + 40 + 24 * len(lines) + 10
    for tag, col, dirn, cells in (('BEFORE', OLD, a, A[key]), ('NOW', NEW, b, N[key])):
        d.text((20, cy + 2), tag, font=small, fill=col)
        cy += 30
        ims = strip(dirn, cells)
        cw = ims[0].width
        gap = max(6, (W - 16 - len(ims) * cw) // (len(ims) + 1))
        for k, (pic, c) in enumerate(zip(ims, cells)):
            x = 8 + gap + k * (cw + gap)
            im.paste(pic, (x, cy))
            d.text((x + 4, cy + pic.height + 4), c['label'], font=small, fill=SOFT)
        cy += ims[0].height + 28
    y += h
im.save(out, optimize=True)
print(out, im.size)
