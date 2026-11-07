# THE MAGE BROUGHT UP: THE PICTURES LAID OUT WITH THEIR CAPTIONS (the art chat's helper, 7 Nov 2026).
# From the pictures tools/mage_up_pics.ts paints (RGBA, her canvas: 176 by 176, her feet at 84, 132).
#   python3 tools/mage_up_pics.py look <dir> <out.png>     (stage 1, the still: docs/mockups/mage_up/pictures/mage_look.png)
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG = (16, 15, 40)
PANEL = (24, 22, 54)
FLOOR = (30, 28, 62)
INK = (232, 230, 255)
DIM = (170, 166, 210)
CYAN = (34, 208, 224)
UP = (255, 214, 102)
LOW = (120, 230, 140)
AX, AY = 84, 132
W = 1200
SIDE_NAMES = {'front': 'down and to the right', 'toward': 'down, toward you', 'frontL': 'down and to the left', 'sideL': 'to the left',
              'backL': 'up and to the left', 'away': 'up, away from you', 'back': 'up and to the right', 'side': 'to the right'}


def font(path, size):
    return ImageFont.truetype(path, size)


def wrap(d, text, f, maxw):
    out, line = [], ''
    for word in text.split(' '):
        t = (line + ' ' + word).strip()
        if d.textlength(t, font=f) > maxw and line:
            out.append(line)
            line = word
        else:
            line = t
    if line:
        out.append(line)
    return out


def ground(w, h, k, ax, ay):
    """A patch of floor with a soft shadow under her feet, `k` times as big."""
    im = Image.new('RGB', (w, h), PANEL)
    d = ImageDraw.Draw(im)
    for i in range(6, 0, -1):
        rx, ry = 15 * k * i / 6, 5 * k * i / 6
        c = tuple(int(FLOOR[j] + (8 - FLOOR[j]) * (1 - i / 6) * 0.9) for j in range(3))
        d.ellipse((ax - rx, ay - ry, ax + rx, ay + ry), fill=c)
    return im


def figure(path, box, k, floor=True):
    """Her picture cut to `box` (picture pixels), made `k` times as big (whole pixels), on the floor with her shadow."""
    im = Image.open(path).convert('RGBA').crop(box)
    im = im.resize((im.width * k, im.height * k), Image.NEAREST)
    g = ground(im.width, im.height, k, (AX - box[0]) * k, (AY - box[1]) * k) if floor else Image.new('RGB', im.size, PANEL)
    g.paste(im, (0, 0), im)
    return g


def union_box(paths, pad=4):
    bb = [999, 999, -1, -1]
    for p in paths:
        b = Image.open(p).getbbox()
        if b:
            bb = [min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3])]
    return (max(0, bb[0] - pad), max(0, bb[1] - pad), min(176, bb[2] + pad), min(176, bb[3] + pad + 2))


def head_box(path):
    """A box round her head and hat: 38 across, 36 down from the top of her hat."""
    im = Image.open(path).convert('RGBA')
    b = im.getbbox()
    a = im.getchannel('A')
    xs = [x for y in range(b[1] + 16, b[1] + 24) for x in range(176) if a.getpixel((x, y)) == 255]
    cx = (min(xs) + max(xs)) // 2 if xs else AX
    return (cx - 19, b[1] - 1, cx + 19, b[1] + 39)


class Sheet:
    def __init__(self):
        self.img = Image.new('RGB', (W, 6000), BG)
        self.d = ImageDraw.Draw(self.img)
        self.y = 24
        self.big, self.mid, self.small, self.tiny = font(B, 34), font(B, 24), font(R, 19), font(B, 16)

    def title(self, text, sub=None):
        self.d.text((24, self.y), text, font=self.mid, fill=INK)
        self.y += 34
        if sub:
            for ln in wrap(self.d, sub, self.small, W - 48):
                self.d.text((24, self.y), ln, font=self.small, fill=DIM)
                self.y += 25
        self.y += 10

    def label(self, x, y, text, col=DIM, f=None):
        self.d.text((x, y), text, font=f or self.tiny, fill=col)


def legs_mark(d, x, ty, k, leg, box, f, label=True):
    """Beside a figure: a line from her hip down to the floor, ticks at the hip, the knee and the floor (her near leg as the
    screen shows it), and the two lengths in the game's pixels."""
    def Y(p):
        return ty + (p[1] - box[1]) * k
    yh, yk, yf = Y(leg['hip']), Y(leg['knee']), Y(leg['floor'])
    w = max(2, k)
    d.line((x, yh, x, yk), fill=UP, width=w)
    d.line((x, yk, x, yf), fill=LOW, width=w)
    for yy in (yh, yk, yf):
        d.line((x - 3 * w, yy, x + 3 * w, yy), fill=INK, width=max(1, w // 2 + 1))
    if label:
        for yy, name in ((yh, 'hip'), (yk, 'knee'), (yf, 'floor')):
            d.text((x - 10 - d.textlength(name, font=f), yy - 9), name, font=f, fill=DIM)
        d.text((x + 10, (yh + yk) / 2 - 10), f"{leg['thigh']:.1f}", font=f, fill=UP)
        d.text((x + 10, (yk + yf) / 2 - 10), f"{leg['lower']:.1f}", font=f, fill=LOW)


def look(dir, out):
    J = json.load(open(os.path.join(dir, 'look.json')))
    P = lambda n: os.path.join(dir, n)
    S = Sheet()
    d = S.d
    d.text((24, S.y), 'THE MAGE, REDRAWN: A FIRST LOOK', font=S.big, fill=INK)
    S.y += 48
    intro = ('A still of her, as you asked to see the Ranger before the whole job. Her look is kept: the tall purple hat with its '
             'tip fallen back, its wide brim and its band of light; her face bare and in the light, her eyes dark; her pink hair in '
             'two braids brought forward over her shoulders; the ragged teal cape; the purple bodice closed on a line of light; the '
             'short purple robe with its hem of light; the brown belt and the pouch at her hip; steel on her forearms; tall plum '
             'boots; her staff with its long crystal over a bar of steel. What changes is how she is drawn: one body with a real '
             'outline, cloth that hangs in folds, in place of balls and rods each ringed in ink; her face warm and lit; her staff '
             'carried at her side so it is seen from every side. Every glow on her is cyan.')
    for ln in wrap(d, intro, S.small, W - 48):
        d.text((24, S.y), ln, font=S.small, fill=DIM)
        S.y += 25
    S.y += 18

    # ---- her stance, before beside now, from in front and from behind ----
    S.title('STANDING IN A FIGHT, THREE TIMES AS BIG', 'One moment of her breathing stance: the staff level in both hands, the crystal alight. Before is the game today; now is her redrawn.')
    files = [P(J['stance'][0]['before']), P(J['stance'][0]['now']), P(J['stance'][1]['before']), P(J['stance'][1]['now'])]
    box = union_box(files)
    K = 3
    figs = [figure(f, box, K) for f in files]
    fw, fh = figs[0].size
    names = [('BEFORE', 'in front'), ('NOW', 'in front'), ('BEFORE', 'from behind'), ('NOW', 'from behind')]
    gap = (W - 48 - 4 * fw) // 3
    for i, (g, (a, b)) in enumerate(zip(figs, names)):
        x = 24 + i * (fw + gap)
        S.label(x, S.y, a, CYAN if a == 'NOW' else DIM, S.mid)
        S.label(x + S.d.textlength(a + '  ', font=S.mid), S.y + 6, b)
        S.img.paste(g, (x, S.y + 34))
    S.y += 34 + fh + 30

    # ---- her head ----
    S.title('HER HEAD, SIX TIMES AS BIG', 'In front, side-on, toward you and from behind. The game only ever drew her from in front and from behind (flipped for the other way); '
            'before, side-on and toward you, is the old drawing turned to that side, to compare. Now her face is warm and lit and a '
            'little bigger, the brim\'s shadow soft across her brow, her nose and cheeks shaded, her eyes dark with a brow and a lash; '
            'her hat sits higher so its brim is off her eyes. From behind, her hair is parted, drawn in strands to two woven plaits '
            'that begin behind her ears, her nape under it.')
    K = 6
    cols = ['front', 'side', 'toward', 'away']
    titles = {'front': 'in front', 'side': 'side-on', 'toward': 'toward you', 'away': 'from behind'}
    hw = 38 * K
    gap = (W - 48 - 4 * hw - 110) // 3
    y0 = S.y + 30
    for r, who in enumerate(['before', 'now']):
        yy = y0 + r * (40 * K + 30)
        S.label(24, yy + 40 * K // 2 - 12, who.upper(), CYAN if who == 'now' else DIM, S.mid)
        for c, v in enumerate(cols):
            h = next(x for x in J['head'] if x['view'] == v)
            f = P(h[who])
            hb = head_box(f)
            g = figure(f, hb, K, floor=False)
            x = 24 + 110 + c * (hw + gap)
            if r == 0:
                S.label(x, yy - 24, titles[v])
            S.img.paste(g, (x, yy))
    S.y = y0 + 2 * (40 * K + 30) + 10

    # ---- a held cast, and her legs ----
    S.title('HER STAFF RAISED IN A HELD CAST, AND HER LEGS', None)
    yrow = S.y
    cast = P(J['cast'])
    cb = union_box([cast])
    K = 3
    g = figure(cast, cb, K)
    S.img.paste(g, (24, yrow + 4))
    cap = ('Now, in front: a spell held at the top of its wind-up, the staff swung up and back over her shoulder, the crystal '
           'blazing, her other hand out at her mark.')
    yy = yrow + 4 + g.size[1] + 8
    for ln in wrap(d, cap, S.small, g.size[0] + 40):
        d.text((24, yy), ln, font=S.small, fill=DIM)
        yy += 24
    cast_bottom = yy
    # her legs: before and now from in front, the bones marked, and the eye's knee (where her robe ends, where her boot begins)
    lx = 24 + g.size[0] + 70
    legs = J['legs']
    lfiles = [P(J['stance'][0]['before']), P(J['stance'][0]['now'])]
    lb = union_box(lfiles)
    lb = (lb[0], max(lb[1], 90), lb[2], lb[3])
    K = 3
    lfig = [figure(f, lb, K) for f in lfiles]
    lw, lh = lfig[0].size
    text = ('Her near leg as the screen shows it: hip to knee in yellow, knee to the floor in green, in the game\'s pixels. '
            'In her low stance her knees were bent toward you, so her lower legs looked short. Now her feet are placed a little '
            'longer and wider, as low: each lower leg reads longer than the thigh above it, from every side. Cyan marks where '
            'her robe\'s hem and the top of her boot are: the knee your eye sees.')
    ty = yrow
    for ln in wrap(d, text, S.small, W - lx - 24):
        d.text((lx, ty), ln, font=S.small, fill=DIM)
        ty += 24
    ty += 12
    for i, (who, fig) in enumerate(zip(['before', 'now'], lfig)):
        x = lx + 70 + i * (lw + 165)
        leg = legs[who]
        S.label(x - 50, ty, who.upper(), CYAN if who == 'now' else DIM, S.mid)
        S.img.paste(fig, (x, ty + 34))
        legs_mark(d, x - 14, ty + 34, K, leg, lb, S.tiny)
        eye = leg['eye']
        for at, name in ((eye.get('hemAt'), 'hem'), (eye.get('seenAt'), 'boot top')):
            if not at:
                continue
            px_, py_ = x + (at[0] - lb[0]) * K, ty + 34 + (at[1] - lb[1]) * K
            ly = py_ + (12 if name == 'boot top' else -12)
            d.line((px_ + 3, py_, px_ + 14, py_), fill=CYAN, width=2)
            d.line((px_ + 14, py_, x + lw + 6, ly), fill=CYAN, width=1)
            d.text((x + lw + 9, ly - 9), name, font=S.tiny, fill=CYAN)
        ratio = leg['lower'] / leg['thigh']
        S.label(x - 50, ty + 34 + lh + 6, f"this leg: knee-floor {ratio:.2f} x hip-knee", CYAN if ratio >= 1.05 else (255, 140, 120))
    ty += 34 + lh + 36
    # the least from each of her eight sides
    for ln in wrap(d, 'Knee to floor over hip to knee: the least of either leg through her breathing, from each side she can face (at least 1.05 asked):', S.tiny, W - lx - 24):
        S.label(lx, ty, ln, INK)
        ty += 22
    ty += 4
    order = ['front', 'toward', 'frontL', 'sideL', 'backL', 'away', 'back', 'side']
    short = {'front': '↘', 'toward': '↓', 'frontL': '↙', 'sideL': '←', 'backL': '↖', 'away': '↑', 'back': '↗', 'side': '→'}
    cw = (W - lx - 24 - 80) // 8
    for j, v in enumerate(order):
        S.label(lx + 80 + j * cw + 8, ty - 4, short[v], DIM, S.mid)
    ty += 26
    for who in ['before', 'now']:
        S.label(lx, ty, who, CYAN if who == 'now' else DIM)
        for j, v in enumerate(order):
            r = legs[who]['per'][v]
            S.label(lx + 80 + j * cw, ty, f'{r:.2f}', CYAN if r >= 1.05 else (255, 140, 120))
        ty += 22
    S.y = max(cast_bottom, ty) + 26

    # ---- her eight sides ----
    S.title('NOW, FROM ALL EIGHT SIDES, STANDING, THREE TIMES AS BIG', 'Each side truly painted, none flipped: her staff always in her right hand, her pouch at her right hip, her cape open in front. Each is laid as she faces on the screen.')
    K = 3
    sfiles = [P(x['file']) for x in J['sides']]
    sb = union_box(sfiles)
    per = 3
    cw = (W - 48) // per
    # (each cell as wide as a third of the page, her floor point in its middle; as tall as the tallest of them)
    half = cw // (2 * K)
    cell = (AX - half, sb[1], AX + half, sb[3])
    for i, x in enumerate(J['sides']):
        g = figure(P(x['file']), cell, K)
        cx = 24 + (i % per) * cw
        cy = S.y + (i // per) * (g.size[1] + 40)
        S.label(cx + 6, cy, f"facing {SIDE_NAMES[x['view']]}", CYAN)
        S.img.paste(g, (cx, cy + 24))
    rows = (len(J['sides']) + per - 1) // per
    S.y += rows * (figure(P(J['sides'][0]['file']), cell, K).size[1] + 40) + 10

    # ---- at the game's size ----
    S.title("AT THE GAME'S OWN SIZE", 'Before and now, in front and from behind; then her eight sides now.')
    gb = union_box(files + sfiles)
    row = [(P(J['stance'][0]['before']), 'before'), (P(J['stance'][1]['before']), 'before'), (P(J['stance'][0]['now']), 'now'), (P(J['stance'][1]['now']), 'now')]
    gw = gb[2] - gb[0]
    x = 24
    for f, who in row:
        g = figure(f, gb, 1)
        S.label(x, S.y, who, CYAN if who == 'now' else DIM)
        S.img.paste(g, (x, S.y + 22))
        x += gw + 12
    S.y += 22 + (gb[3] - gb[1]) + 18
    x = 24
    for f in sfiles:
        g = figure(f, gb, 1)
        if x + gw > W - 24:
            x = 24
            S.y += (gb[3] - gb[1]) + 12
        S.img.paste(g, (x, S.y))
        x += gw + 6
    S.y += (gb[3] - gb[1]) + 24
    img = S.img.crop((0, 0, W, S.y))
    img.save(out)
    print(out, img.size)


if __name__ == '__main__':
    mode, dir, out = sys.argv[1:4]
    if mode == 'look':
        look(dir, out)
