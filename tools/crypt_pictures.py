#!/usr/bin/env python3
"""THE CRYPT'S FLOORS AS MAPS, for the owner (game/dungeon.ts, CRYPT_LAYOUT): each floor drawn as the
game's own map draws it (seen from the same corner, in its colour), the cells picked out, and the
same floor as it is today beside the fourth for comparison. From tools/crypt_maps.ts's JSON.
   python3 tools/crypt_pictures.py maps.json out.png [shots/cells (the pictures from the game, tools/scenarios/crypt_cells.mjs)]"""
import json
import sys

from PIL import Image, ImageDraw, ImageFont

B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, mid, small = ImageFont.truetype(B, 30), ImageFont.truetype(R, 21), ImageFont.truetype(B, 22)
BG = (13, 16, 48)
PANEL = (20, 24, 64)
FLOOR = (122, 116, 200)  # the game's map
CELL = (236, 232, 255)
DOOR = (34, 28, 74)
START = (255, 255, 255)
BOSS = (230, 70, 80)
CYAN = (40, 220, 240)
PALE = (210, 214, 245)
MUTED = (160, 168, 214)

floors = json.load(open(sys.argv[1]))
out = sys.argv[2]
PW, PH = 760, 430  # a panel
S = 2  # half a tile's width on the screen, before the panel's own scale


def iso(x, y):
    return (x - y) * S, (x + y) * S / 2


def bounds(f):
    """The floor's box on the screen, before any scale."""
    w = f['w']
    pts = [(i % w, i // w) for i, t in enumerate(f['tiles']) if t == 1]
    xs = [(x - y) * S for x, y in pts] + [(x + 1 - y) * S for x, y in pts] + [(x - y - 1) * S for x, y in pts]
    ys = [(x + y) * S / 2 for x, y in pts] + [(x + y + 2) * S / 2 for x, y in pts]
    return min(xs), max(xs), min(ys), max(ys)


# ONE SCALE FOR EVERY MAP, so that a room's size on one floor can be set against another's
K = min(min((PW - 40) / (b[1] - b[0]), (PH - 90) / (b[3] - b[2])) for b in map(bounds, floors[:6]))


def draw_floor(f):
    """The floor as the game's map draws it: every tile a diamond, the cells pale, their doors dark; the way in and the boss marked."""
    w = f['w']
    cell = bytearray(w * f['h'])
    for r in f['rooms']:
        if r['cell']:
            for y in range(r['y'], r['y'] + r['h']):
                for x in range(r['x'], r['x'] + r['w']):
                    cell[y * w + x] = 1
    pts = [(i % w, i // w) for i, t in enumerate(f['tiles']) if t == 1]
    xs = [iso(x, y)[0] for x, y in pts] + [iso(x + 1, y + 1)[0] for x, y in pts] + [iso(x + 1, y)[0] for x, y in pts] + [iso(x, y + 1)[0] for x, y in pts]
    ys = [iso(x, y)[1] for x, y in pts] + [iso(x + 1, y + 1)[1] for x, y in pts]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    k = K
    img = Image.new('RGB', (PW, PH), PANEL)
    d = ImageDraw.Draw(img)
    ox = (PW - (x1 - x0) * k) / 2 - x0 * k
    oy = 70 + (PH - 90 - (y1 - y0) * k) / 2 - y0 * k

    def P(x, y):
        a, b = iso(x, y)
        return a * k + ox, b * k + oy

    doors = {dd['tile']: dd['kind'] for dd in f['doors']}
    for x, y in pts:
        i = y * w + x
        col = DOOR if i in doors and cell[(y - 1) * w + x] + cell[(y + 1) * w + x] + cell[y * w + x - 1] + cell[y * w + x + 1] > 0 else CELL if cell[i] else FLOOR
        d.polygon([P(x, y), P(x + 1, y), P(x + 1, y + 1), P(x, y + 1)], fill=col)
    for (c, col) in ((f['start'], START), (f['boss'], BOSS)):
        cx, cy = P(c['x'], c['y'])
        d.rectangle([cx - 6, cy - 6, cx + 6, cy + 6], fill=col, outline=BG, width=2)
    return img


def label(f):
    if not f['on']:
        return f"FLOOR {f['depth']} AS IT IS TODAY", 'for comparison: rooms and long corridors'
    k = f['depth']
    cells = sum(1 for r in f['rooms'] if r['cell'])
    sub = {
        1: f'all stone; two cell blocks, {cells} cells, each with a door',
        2: f'rooms bigger, corridors shorter; {cells} cells',
        3: f'bigger still, and some rooms run into each other; {cells} cells',
        4: f'about half earth: wide open spaces; {cells} cells',
        5: f'the lair boss\'s floor, as open as the fourth; {cells} cells',
    }[k]
    return f'FLOOR {k}', sub


cols, rows = 2, 3
W = cols * PW + (cols + 1) * 20
H = 150 + rows * PH + rows * 20 + 70
sheet = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(sheet)
d.text((20, 18), "THE CRYPT'S FIVE FLOORS, AS MAPS", font=big, fill=CYAN)
d.text((20, 62), 'Rows of cells along the walls on every floor. From floor 2 down, the floors open up as they get less finished.', font=mid, fill=PALE)
d.text((20, 94), 'Drawn as the game\'s own map draws them, all at one scale. Pale: the cells. White: the way in. Red: the boss.', font=mid, fill=MUTED)
for n, f in enumerate(floors[: cols * rows]):
    img = draw_floor(f)
    dd = ImageDraw.Draw(img)
    t, s = label(f)
    dd.text((16, 12), t, font=small, fill=CYAN if f['on'] else MUTED)
    dd.text((16, 40), s, font=mid, fill=PALE)
    x = 20 + (n % cols) * (PW + 20)
    y = 140 + (n // cols) * (PH + 20)
    sheet.paste(img, (x, y))
d.text((20, H - 50), 'Not in the game yet: behind a switch that is off, until you say yes.', font=mid, fill=MUTED)
sheet.save(out)
print('wrote', out, sheet.size)


# ---- THE PICTURES FROM THE GAME, each with a line saying what it is (when their shots are given) ----
SHOTS = [
    ('c_cells_hall.png', 'Crypt_cells.png', 'FLOOR 1: A CELL BLOCK',
     'A long hall. Along its back wall a row of cells, each a small room with its own barred door.'),
    ('c_cell_inside.png', 'Crypt_in_a_cell.png', 'INSIDE A CELL',
     'Four tiles across, three deep. Its door swings open as you come near; bones inside, now and then an urn.'),
    ('c_open_d4_breach.png', 'Crypt_floor4_open.png', 'FLOOR 4: OPENED UP',
     'Half earth and rock. Bigger rooms, some run into each other; fewer and shorter corridors.'),
]
if len(sys.argv) > 3:
    import os
    src = sys.argv[3]
    dst = os.path.dirname(out)
    for name, save, title, line in SHOTS:
        shot = Image.open(os.path.join(src, name)).convert('RGB')
        shot = shot.resize((shot.width * 2 // 3, shot.height * 2 // 3), Image.LANCZOS)
        img = Image.new('RGB', (shot.width, shot.height + 104), BG)
        d = ImageDraw.Draw(img)
        d.text((20, 16), title, font=big, fill=CYAN)
        d.text((20, 60), line, font=mid, fill=PALE)
        img.paste(shot, (0, 104))
        img.save(os.path.join(dst, save))
        print('wrote', os.path.join(dst, save), img.size)
