"""The Warrior's weapons' looks cut for a phone: from weapons_looks.png (the whole sheet), two tall narrow pictures, the three
axes side by side and the three hammers side by side, each view scaled up whole pixels so it reads on a phone held upright.
His word, 9 Nov 2026, of the whole sheet: "These picture resolutions are so bad on phone I can see anything".
usage: python3 tools/warrior_weapons_phone.py"""
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from scipy import ndimage as ni

DIR = 'docs/mockups/warrior_weapons/pictures/'
im = Image.open(DIR + 'weapons_looks.png').convert('RGB')
a = np.array(im).astype(int)
PAGE, PANEL = (16, 15, 40), (24, 22, 54)
mask = np.abs(a - np.array(PAGE)).sum(axis=2) > 6
lab, _ = ni.label(mask)
boxes = []
for sl in ni.find_objects(lab):
    y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
    if y1 - y0 >= 60 and x1 - x0 >= 50 and mask[sl].mean() > 0.9:
        boxes.append((y0, x0, x1 - x0, y1 - y0))

def row(lo, hi):
    return sorted([b for b in boxes if lo <= b[0] <= hi], key=lambda b: b[1])

def trim(b, pad=3):
    """The panel cut down to what is drawn in it (a few pixels of its ground left round it)."""
    y, x, w, h = b
    sub = a[y:y + h, x:x + w]
    m = np.abs(sub - np.array(PANEL)).sum(axis=2) > 6
    ys, xs = np.where(m)
    y0, y1 = max(0, ys.min() - pad), min(h, ys.max() + 1 + pad)
    x0, x1 = max(0, xs.min() - pad), min(w, xs.max() + 1 + pad)
    return im.crop((x + x0, y + y0, x + x1, y + y1))

TAKES = {
    'axe': [('A', 'The bearded axe', (250, 300), (500, 565), 829), ('B', 'The war axe', (1335, 1380), (1575, 1625), 1899),
            ('C', 'The crescent axe', (2405, 2480), (2688, 2735), 3014)],
    'hammer': [('A', 'The maul', (3550, 3585), (3795, 3880), 4144), ('B', 'The banded hammer', (4650, 4680), (4905, 4985), 5249),
               ('C', 'The rune hammer', (5765, 5805), (6015, 6095), 6364)],
}
F = '/usr/share/fonts/truetype/dejavu/DejaVuSans'
f_title, f_big, f_name, f_cap = (ImageFont.truetype(F + '-Bold.ttf', 46), ImageFont.truetype(F + '-Bold.ttf', 64),
                                 ImageFont.truetype(F + '-Bold.ttf', 30), ImageFont.truetype(F + '.ttf', 30))
W, COL = 1260, 420

def up(p, k):
    return p.resize((p.width * k, p.height * k), Image.NEAREST)

def sheet(kind, title, move):
    cols = []
    for letter, name, r1, r2, bag in TAKES[kind]:
        p1, p2 = row(*r1), row(*r2)
        assert len(p1) == 5 and len(p2) == 4, (letter, len(p1), len(p2))
        bagb = [b for b in boxes if b[0] == bag and b[1] == 24][0]
        cols.append((letter, name, up(trim(p1[0]), 3), up(trim(p1[2]), 3), up(trim(p2[0]), 2), im.crop((24, bag, 24 + bagb[2], bag + bagb[3]))))
    rows = [('The weapon', 2), ('Held, facing you', 3), (move, 4), ('As loot: Normal, Magic, Rare, Unique', 5)]
    heights = [max(c[i].height for c in cols) for _, i in rows]
    assert all(c[i].width <= COL - 8 for c in cols for _, i in rows), [(c[0], [c[i].width for _, i in rows]) for c in cols]
    H = 110 + 130 + sum(h + 70 for h in heights) + 20
    out = Image.new('RGB', (W, H), PAGE)
    d = ImageDraw.Draw(out)
    d.text((24, 28), title, font=f_title, fill=(232, 228, 255))
    for k, c in enumerate(cols):
        cx = k * COL + COL // 2
        d.text((cx, 110), c[0], font=f_big, fill=(40, 220, 240), anchor='ma')
        d.text((cx, 186), c[1], font=f_name, fill=(232, 228, 255), anchor='ma')
    y = 240
    for (cap, i), h in zip(rows, heights):
        d.text((24, y + 8), cap, font=f_cap, fill=(170, 166, 210))
        y += 56
        for k, c in enumerate(cols):
            d.rectangle((k * COL + 4, y, (k + 1) * COL - 5, y + h - 1), fill=PANEL)
            p = c[i]
            out.paste(p, (k * COL + (COL - p.width) // 2, y + (h - p.height)))
        y += h + 14
    out = out.crop((0, 0, W, y + 10))
    out.save(DIR + kind + 's_phone.png')
    print(kind, out.size)

sheet('axe', 'Battle axe: pick A, B or C', 'Wound up for its Cleave')
sheet('hammer', 'Warhammer: pick A, B or C', 'Wound up for its Smash')
