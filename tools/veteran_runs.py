#!/usr/bin/env python3
"""HIS RUN MADE NEW, BEFORE AND NOW: the old Brawler's run, the Veteran's old run (built on it) and his new run (the
   fighter's bounce), side by side at the same four moments, each from in front and from behind, three times the game's
   size (about 1200 wide), from the pictures tools/veteran_runs.ts made.
   python3 tools/veteran_runs.py <brawler dir> <old dir> <new dir> <out.png>"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
dirs, out = sys.argv[1:4], sys.argv[4]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
W = 1200
K = 3
BG, PANEL, PANEL2, GOLD, TEXT, SOFT, OLD, NEW, SHADOW = (23, 20, 46), (38, 35, 84), (33, 30, 75), (255, 216, 102), (228, 224, 255), (168, 162, 216), (240, 150, 160), (120, 230, 240), (22, 19, 48)
big, mid, small, tiny = ImageFont.truetype(B, 34), ImageFont.truetype(B, 20), ImageFont.truetype(R, 18), ImageFont.truetype(R, 15)
COLS = [
    ('THE OLD BRAWLER\'S RUN', 'Not his: what his old run was built on. Leaning in, fists pumping low at his sides, the heel flung up behind, set down flat.', OLD),
    ('HIS OLD RUN (gone)', 'Built on it: the same foot cycle, the same carry, the same pumping fists. A round of 12 frames.', OLD),
    ('HIS NEW RUN: THE FIGHTER\'S BOUNCE', 'Written new: light springs on the balls of his feet, heels never down, both feet off the floor; his guard up, chin down, shoulders weaving. A round of 16.', NEW),
]
MOMENTS = ['A foot comes down', 'On it', 'Springing off it', 'In the air: both feet off the floor']
shots = [json.load(open(os.path.join(d, 'shots.json'))) for d in dirs]
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
def pic(d, s):
    """A picture cut to the box round what is painted, made K times as big, and where its floor point is in it."""
    # (the pictures are painted on black: black is nothing there)
    rgb = Image.open(os.path.join(d, s['file'])).convert('RGB')
    mask = rgb.convert('L').point(lambda v: 255 if v > 0 else 0)
    rgba = rgb.convert('RGBA')
    rgba.putalpha(mask)
    x0, y0, x1, y1 = mask.getbbox()
    g = rgba.crop((x0, y0, x1, y1)).resize(((x1 - x0) * K, (y1 - y0) * K), Image.NEAREST)
    return g, ((s['ax'] - x0) * K, (s['ay'] - y0) * K)
# (each moment: the three runs' frames for it, from in front and from behind)
rows = []
for mi in range(len(MOMENTS)):
    cells = []
    for d, sh in zip(dirs, shots):
        fs = sorted(set(x['f'] for x in sh))
        f = fs[mi]
        pair = [pic(d, next(x for x in sh if x['f'] == f and x['view'] == v)) for v in ('front', 'back')]
        cells.append((f, sh[0]['long'], pair))
    rows.append(cells)
UP = max(a[1] for r in rows for c in r for _, a in c[2])
DOWN = max(g.height - a[1] for r in rows for c in r for g, a in c[2])
CW = (W - 16) // 3
probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
intro = ('His words (3 Nov, 18:08): “And his running animation is reused which I explicitly said not to do”. He was right: his '
         'run was built on the old Brawler\'s, the same foot cycle and the same pumping fists. It is gone. His new run is the '
         'fighter\'s bounce, his pick, written new: he goes in springs, on the balls of his feet the whole way (his heels never '
         'come down), each ball held on its spot on the floor while he passes over it, both feet off the floor between; his guard '
         'up all the way (elbows tucked to his ribs, fists by his cheeks), chin down, eyes ahead, his shoulders weaving a little. '
         'The three side by side at the same four moments, from in front and from behind, three times the game\'s size.')
ilines = wrap(probe, intro, small, W - 36)
colh = max(len(wrap(probe, c[1], small, CW - 20)) for c in COLS)
HEAD = 62 + 24 * len(ilines) + 16
COLHEAD = 12 + 2 * 24 + colh * 22 + 10
ROWH = 58 + UP + DOWN + 30
total = HEAD + COLHEAD + len(rows) * (ROWH + 8) + 12
im = Image.new('RGB', (W, total), BG)
d = ImageDraw.Draw(im)
d.text((18, 14), 'The Veteran: his run made new', font=big, fill=GOLD)
for k, ln in enumerate(ilines):
    d.text((18, 62 + k * 24), ln, font=small, fill=SOFT)
y = HEAD
for ci, (name, line, col) in enumerate(COLS):
    x = 8 + ci * CW
    d.rectangle([x + 2, y, x + CW - 4, y + COLHEAD - 6], fill=PANEL2)
    for k, ln in enumerate(wrap(d, name, mid, CW - 20)):
        d.text((x + 10, y + 10 + k * 24), ln, font=mid, fill=col)
    nl = len(wrap(d, name, mid, CW - 20))
    for k, ln in enumerate(wrap(d, line, small, CW - 20)):
        d.text((x + 10, y + 12 + nl * 24 + k * 22), ln, font=small, fill=TEXT)
y += COLHEAD
for ri, cells in enumerate(rows):
    d.rectangle([8, y, W - 8, y + ROWH], fill=PANEL if ri % 2 == 0 else PANEL2)
    d.text((18, y + 8), f'{ri + 1}. {MOMENTS[ri]}', font=mid, fill=GOLD)
    base = y + 58 + UP
    for ci, (f, long, pair) in enumerate(cells):
        x = 8 + ci * CW
        note = f'frame {f} of {long}'
        d.text((x + 12, y + 36), note, font=tiny, fill=COLS[ci][2])
        for vi, (g, (ax, ay)) in enumerate(pair):
            cx = x + CW // 4 + vi * (CW // 2)
            # (a shadow on the floor under his floor point)
            d.ellipse([cx - 13 * K, base - 4 * K, cx + 13 * K, base + 4 * K], fill=SHADOW)
            im.paste(g, (cx - ax, base - ay), g)
            lab = 'in front' if vi == 0 else 'behind'
            d.text((cx - d.textlength(lab, font=tiny) / 2, y + ROWH - 24), lab, font=tiny, fill=SOFT)
    y += ROWH + 8
im.save(out, optimize=True)
print(out, im.size)
