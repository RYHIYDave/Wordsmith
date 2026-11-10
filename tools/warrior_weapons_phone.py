"""The Warrior's weapons' looks cut for a phone: from weapons_looks.png (the whole sheet), two tall narrow pictures, the three
axes side by side and the three hammers side by side, each view scaled up whole pixels so it reads on a phone held upright.
His word, 9 Nov 2026, of the whole sheet: "These picture resolutions are so bad on phone I can see anything".
Since his word on the heads (9 Nov, "Have the blades and the hammers point down"): he is shown held and wound up FROM HIS
SIDE, where the edge or the face is seen pointing down (held facing you, the head is seen end on).
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

def trim(b, s, pad=3):
    """The panel cut down to what is drawn in it (a few of its own pixels of ground left round it), at the game's own size:
    the sheet drew it `s` times as big, each of its pixels a block of s by s, so every s-th pixel is the picture itself."""
    y, x, w, h = b
    sub = a[y:y + h, x:x + w]
    m = np.abs(sub - np.array(PANEL)).sum(axis=2) > 6
    ys, xs = np.where(m)
    y0, y1 = max(0, ys.min() // s - pad) * s, min(h // s, ys.max() // s + 1 + pad) * s
    x0, x1 = max(0, xs.min() // s - pad) * s, min(w // s, xs.max() // s + 1 + pad) * s
    c = im.crop((x + x0, y + y0, x + x1, y + y1))
    return c.resize((c.width // s, c.height // s), Image.NEAREST)

# (where each take's rows of panels begin down the sheet: its first row (alone, turned, his guard from three sides), its
# second (the wind-up, town from three sides), and its row of slots; mended whenever the sheet's layout moves)
TAKES = {
    'axe': [('A', 'The bearded axe', (270, 312), (515, 583), 843), ('B', 'The war axe', (1352, 1416), (1603, 1681), 1951),
            ('C', 'The crescent axe', (2471, 2544), (2747, 2819), 3093)],
    'hammer': [('A', 'The maul', (3622, 3672), (3875, 3969), 4229), ('B', 'The banded hammer', (4736, 4782), (5001, 5091), 5351),
               ('C', 'The rune hammer', (5873, 5923), (6126, 6220), 6482)],
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
        # (alone, three times the game's size on the sheet; his guard from his side and the wind-up from his side, twice)
        cols.append([letter, name, trim(p1[0], 3), trim(p1[3], 2), trim(p2[0], 2), im.crop((24, bag, 24 + bagb[2], bag + bagb[3]))])
    # (each row as big as whole pixels allow in its column, the same for A, B and C: at most 9, 5 and 4 times the game's size)
    for i, most in ((2, 9), (3, 5), (4, 4)):
        k = min(most, min((COL - 8) // c[i].width for c in cols))
        for c in cols:
            c[i] = up(c[i], k)
    rows = [('The weapon', 2), ('Held, seen from his side: the edge or the face down', 3), (move, 4), ('As loot: Normal, Magic, Rare, Unique', 5)]
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

sheet('axe', 'Battle axe: pick A, B or C', 'Wound up for its Cleave: the edge coming down')
sheet('hammer', 'Warhammer: pick A, B or C', 'Wound up for its Smash: the face coming down')
