#!/usr/bin/env python3
"""HIS KNEES THROUGH HIS TROUSERS, BEFORE AND NOW: the pictures tools/veteran_knees.ts made of the old version and of this
   one, each moment before above now, three times the game's size, captioned (about 1200 wide).
   python3 tools/veteran_knees.py <before dir> <now dir> <out.png>"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
a, b, out = sys.argv[1], sys.argv[2], sys.argv[3]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
W = 1200
K = 3
COLS = 4
BG, PANEL, PANEL2, GOLD, TEXT, SOFT, OLD, NEW, FLOOR = (23, 20, 46), (38, 35, 84), (33, 30, 75), (255, 216, 102), (228, 224, 255), (168, 162, 216), (240, 150, 160), (120, 230, 240), (52, 48, 104)
big, mid, small, tiny = ImageFont.truetype(B, 34), ImageFont.truetype(B, 19), ImageFont.truetype(R, 19), ImageFont.truetype(R, 16)
A = json.load(open(os.path.join(a, 'shots.json')))
N = json.load(open(os.path.join(b, 'shots.json')))
assert [(x['id'], x['f']) for x in A] == [(x['id'], x['f']) for x in N], 'the same frames in both'
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
# each moment's two pictures cut to the box round both (the same box, so before and now line up), three times as big
pairs = []
for pa, pn in zip(A, N):
    # (the pictures are painted on black: black is nothing there)
    def clear(path):
        rgb = Image.open(path).convert('RGB')
        mask = rgb.convert('L').point(lambda v: 255 if v > 0 else 0)
        im = rgb.convert('RGBA')
        im.putalpha(mask)
        return im, rgb.getbbox()
    (ia, ba), (ib, bb) = clear(os.path.join(a, pa['file'])), clear(os.path.join(b, pn['file']))
    box = (min(ba[0], bb[0]) - 3, min(ba[1], bb[1]) - 3, max(ba[2], bb[2]) + 3, max(ba[3], bb[3]) + 3)
    pairs.append((pa, pn, ia.crop(box).resize(((box[2] - box[0]) * K, (box[3] - box[1]) * K), Image.NEAREST), ib.crop(box).resize(((box[2] - box[0]) * K, (box[3] - box[1]) * K), Image.NEAREST)))
CW = (W - 16) // COLS
probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
rows = [pairs[i:i + COLS] for i in range(0, len(pairs), COLS)]
def rowh(row):
    cap = max(len(wrap(probe, f"{p[1]['label']} (frame {p[1]['f']})", mid, CW - 16)) for p in row)
    ph = max(p[2].height for p in row)
    return 10 + cap * 23 + 8 + 2 * (24 + ph + 8) + 8, cap, ph
intro = 'His words (3 Nov, 18:07): “Well first off the brawlers knees are clipping through his pants which is against the rules which I reminded you to follow multiple times”. Each trouser leg was one straight tube from the hip to below the knee, so when he bent a knee, the knee and the thigh above it stuck out of it. Now each leg of the trousers is built over his leg: the thigh, a bag of cloth round the knee, and the shin down to the ragged hem, so the cloth stays outside his leg however far the knee bends (with folds in the crook behind it). Shown at the frames where it was worst in each move (the most of his skin through the cloth), from the game\'s view, three times the game\'s size: before above, now below.'
ilines = wrap(probe, intro, small, W - 36)
HEAD = 64 + 25 * len(ilines) + 14
total = HEAD + sum(rowh(r)[0] + 8 for r in rows) + 12
im = Image.new('RGB', (W, total), BG)
d = ImageDraw.Draw(im)
d.text((18, 14), 'The Veteran: his knees inside his trousers', font=big, fill=GOLD)
for k, ln in enumerate(ilines):
    d.text((18, 62 + k * 25), ln, font=small, fill=SOFT)
y = HEAD
for ri, row in enumerate(rows):
    h, cap, ph = rowh(row)
    for ci, (pa, pn, ga, gb) in enumerate(row):
        x = 8 + ci * CW
        d.rectangle([x + 2, y, x + CW - 4, y + h], fill=PANEL if (ri + ci) % 2 == 0 else PANEL2)
        for k, ln in enumerate(wrap(d, f"{pn['label']} (frame {pn['f']})", mid, CW - 16)):
            d.text((x + 10, y + 10 + k * 23), ln, font=mid, fill=GOLD)
        cy = y + 10 + cap * 23 + 8
        for tag, col, g, J in (('BEFORE', OLD, ga, pa), ('NOW', NEW, gb, pn)):
            n = J['now']
            d.text((x + 10, cy + 2), tag, font=mid, fill=col)
            note = f"{n} px of skin through" if n else 'none through'
            d.text((x + CW - 14 - d.textlength(note, font=tiny), cy + 4), note, font=tiny, fill=col if n else SOFT)
            cy += 24
            gx = x + (CW - g.width) // 2
            gy = cy + (ph - g.height) // 2
            im.paste(g, (gx, gy), g)
            cy += ph + 8
    y += h + 8
im.save(out, optimize=True)
print(out, im.size)
