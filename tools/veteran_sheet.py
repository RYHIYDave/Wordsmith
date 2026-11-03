#!/usr/bin/env python3
"""THE VETERAN'S MOVES, A SHEET: the pictures tools/veteran_sheet.ts made, laid out with their captions (about 1200 wide).
   python3 tools/veteran_sheet.py <dir> <out.png>"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
W = 1200
BG, PANEL, PANEL2, GOLD, TEXT, SOFT = (23, 20, 46), (38, 35, 84), (33, 30, 75), (255, 216, 102), (228, 224, 255), (168, 162, 216)
rows = json.load(open(os.path.join(src, 'sheet.json')))['rows']
big, mid, small = ImageFont.truetype(B, 34), ImageFont.truetype(B, 24), ImageFont.truetype(R, 19)
def wrap(d, text, font, maxw):
    out, line = [], ''
    for w in text.split(' '):
        t = (line + ' ' + w).strip()
        if d.textlength(t, font=font) > maxw and line:
            out.append(line); line = w
        else:
            line = t
    if line: out.append(line)
    return out
probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
HEAD = 178
# (each row's own pictures: the push kick's cone and the spinning kick's crescent are two wide ones)
cellhs = [Image.open(os.path.join(src, r['cells'][0]['file'])).height for r in rows]
heights = []
for r, cellh in zip(rows, cellhs):
    lines = wrap(probe, r['line'], small, W - 40)
    heights.append(40 + 24 * len(lines) + 6 + cellh + 30 + 12)
total = HEAD + sum(heights) + 20
im = Image.new('RGB', (W, total), BG)
d = ImageDraw.Draw(im)
d.text((18, 16), 'The Veteran: his moves', font=big, fill=GOLD)
for k, ln in enumerate(wrap(d, 'The key moments of every move: the big wind-up held so you can read it, the strike in a frame or two (now with his step in and the force off the blow, out to 2½ tiles; the push kick\'s cone and the spinning kick\'s crescent to 3½), the big wind-down. Then each combo, its globes filling over him. From in front, at the arena\'s scale, twice the game size, with a stand-in foe. Pictures only: not in the game.', small, W - 36)):
    d.text((18, 64 + k * 25), ln, font=small, fill=SOFT)
y = HEAD
for i, r in enumerate(rows):
    h = heights[i]
    d.rectangle([8, y, W - 8, y + h - 8], fill=PANEL if i % 2 == 0 else PANEL2)
    d.text((20, y + 8), r['title'], font=mid, fill=GOLD)
    lines = wrap(d, r['line'], small, W - 40)
    for k, ln in enumerate(lines):
        d.text((20, y + 40 + k * 24), ln, font=small, fill=TEXT)
    cy = y + 40 + 24 * len(lines) + 6
    cells = r['cells']
    cellh = cellhs[i]
    cw = Image.open(os.path.join(src, cells[0]['file'])).width
    gap = (W - 16 - len(cells) * cw) // (len(cells) + 1)
    for k, c in enumerate(cells):
        pic = Image.open(os.path.join(src, c['file'])).convert('RGB')
        x = 8 + gap + k * (cw + gap)
        im.paste(pic, (x, cy))
        d.text((x + 4, cy + cellh + 6), c['label'], font=small, fill=SOFT)
    y += h
im.save(out, optimize=True)
print(out, im.size)
