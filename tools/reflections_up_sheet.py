# THE SHEETS OF FLOOR 18'S REFLECTIONS OF THE HEROES AS THEY LOOK NOW, from the frames tools/reflections_up_pics.ts made:
#   python3 tools/reflections_up_sheet.py <frames dir> <out dir>
# Two pictures of three heroes each, wide rather than tall (his phone shows a tall sheet too small to read): each hero beside
# his reflection three times as big (from in front, from the side, from behind, his tap's blow and his hold's), and under
# them the same at the game's own size (a picture pixel to a pixel). And a picture of the stepping out and the shattering.
import json
import sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
idx = json.load(open(f'{src}/index.json'))
BG = (24, 18, 38, 255)
FLOOR = (40, 32, 62, 255)
INK = (235, 228, 250, 255)
DIM = (170, 160, 200, 255)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
big = ImageFont.truetype(FONT, 30)
mid = ImageFont.truetype(FONT, 22)
small = ImageFont.truetype(FONT, 18)
NAME = {'warrior': 'WARRIOR', 'ranger': 'RANGER', 'mage': 'MAGE', 'warlock': 'WARLOCK', 'tinkerer': 'TINKERER', 'brawler': 'BRAWLER'}


def frame(key):
    e = idx[key]
    return Image.open(f"{src}/{e['file']}").convert('RGBA'), e['ax'], e['ay']


def cut(key, left, right, up, down):
    """The frame cut to a box round its feet: `left` and `right` of them, `up` above, `down` below."""
    im, ax, ay = frame(key)
    return im.crop((ax - left, ay - up, ax + right, ay + down))


S = 2
L, R, U, D = 58, 66, 128, 14
CW, CH = (L + R) * S, (U + D) * S
COLS = [('_you', 'YOU'), ('_stand_front', 'REFLECTION'), ('_run', 'RUNNING'), ('_stand_back', 'FROM BEHIND'), ('_tap', 'TAP'), ('_hold', 'HOLD')]


def extent(keys):
    """How far the frames of a row reach from their feet: left, right, up (picture pixels)."""
    l = r = u = 0
    for k in keys:
        im, ax, ay = frame(k)
        bb = im.getbbox()
        if not bb:
            continue
        l, r, u = max(l, ax - bb[0]), max(r, bb[2] - ax), max(u, ay - bb[1])
    return min(l, 80) + 2, min(r, 80) + 2, min(u, 150) + 2


def sheet(classes, name):
    pad = 14
    head = 64
    rows = []
    for cls in classes:
        keys = [cls + suf for suf, _ in COLS]
        l, r, u = extent(keys)
        rows.append((cls, l, r, u))
    cw = max((l + r) for _, l, r, _ in rows) * S
    W = pad + len(COLS) * (cw + pad)
    hs = [(u + D) * S + 34 for _, _, _, u in rows]
    small_h = 110 + 40
    H = head + sum(h + 10 for h in hs) + small_h + pad
    im = Image.new('RGBA', (W, H), BG)
    dr = ImageDraw.Draw(im)
    dr.text((pad, 14), 'Floor 18: your reflections, the heroes as they look now', font=big, fill=INK)
    y = head
    for (cls, l, r, u), h in zip(rows, hs):
        dr.text((pad, y), NAME[cls], font=mid, fill=INK)
        x = pad
        lw = cw // S
        lw_l = lw * l // (l + r)
        for suf, label in COLS:
            key = cls + suf
            cell = Image.new('RGBA', (lw, u + D), FLOOR)
            cell.alpha_composite(cut(key, lw_l, lw - lw_l, u, D))
            cell = cell.resize((lw * S, (u + D) * S), Image.NEAREST)
            im.alpha_composite(cell, (x, y + 30))
            dr.text((x + 6, y + 32), label, font=small, fill=DIM if suf != '_you' else (120, 230, 240, 255))
            x += cw + pad
        y += h + 10
    # at the game's own size: each hero, then his reflection, a picture pixel to a pixel
    dr.text((pad, y + 4), "At the game's own size: you, then your reflection", font=small, fill=DIM)
    x = pad
    for cls in classes:
        for suf in ('_you', '_stand_front'):
            c = Image.new('RGBA', (90, 110), FLOOR)
            c.alpha_composite(cut(cls + suf, 44, 46, 100, 10))
            im.alpha_composite(c, (x, y + 30))
            x += 90 + 6
        x += 18
    im.save(f'{out}/{name}.png')
    print(f'{out}/{name}.png', im.size)


def moments(classes, name):
    """Its stepping out of a mirror and its shattering, a few moments of each, for each hero."""
    mirror = frame('mirror')[0]
    steps = [30, 80, 100, 125]
    shat = [5, 20, 45]
    sw, sh = 150, 150
    pad = 10
    W = pad + (len(steps) + len(shat)) * (sw * 2 // 2 + pad) + 120
    H = 60 + len(classes) * (sh + 16)
    im = Image.new('RGBA', (W, H), BG)
    dr = ImageDraw.Draw(im)
    dr.text((pad, 12), 'Stepping out of a mirror, and shattering', font=big, fill=INK)
    y = 60
    for cls in classes:
        dr.text((pad, y + sh // 2 - 10), NAME[cls], font=small, fill=INK)
        x = pad + 120
        for t in steps:
            f, ax, ay = frame(f'{cls}_step_{t}')
            bg = Image.new('RGBA', f.size, FLOOR)
            bg.alpha_composite(mirror)
            bg.alpha_composite(f)
            c = bg.crop((ax - 120, ay - 140, ax + 30, ay + 10))
            im.alpha_composite(c, (x, y))
            x += sw + pad
        for k in shat:
            f, ax, ay = frame(f'{cls}_shatter_{k}')
            bg = Image.new('RGBA', f.size, FLOOR)
            bg.alpha_composite(f)
            c = bg.crop((ax - 75, ay - 130, ax + 75, ay + 20))
            im.alpha_composite(c, (x, y))
            x += sw + pad
        y += sh + 16
    im.save(f'{out}/{name}.png')
    print(f'{out}/{name}.png', im.size)


sheet(['warrior', 'ranger', 'mage'], 'reflections_up_1')
sheet(['warlock', 'tinkerer', 'brawler'], 'reflections_up_2')
moments(['warrior', 'ranger', 'mage', 'warlock', 'tinkerer', 'brawler'], 'reflections_up_moments')
