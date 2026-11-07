# THE WARLOCK BROUGHT UP: THE PICTURES LAID OUT WITH THEIR CAPTIONS (the art chat's helper, 7 Nov 2026).
# From the pictures tools/warlock_up_pics.ts paints (RGBA, his canvas: 176 by 176, his feet at 84, 132).
#   python3 tools/warlock_up_pics.py look <dir> <out.png>     (stage 1, the still: docs/mockups/warlock_up/pictures/warlock_look.png)
# (the drawing helpers as tools/mage_up_pics.py has them)
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
    """A patch of floor with a soft shadow under his feet, `k` times as big."""
    im = Image.new('RGB', (w, h), PANEL)
    d = ImageDraw.Draw(im)
    for i in range(6, 0, -1):
        rx, ry = 15 * k * i / 6, 5 * k * i / 6
        c = tuple(int(FLOOR[j] + (8 - FLOOR[j]) * (1 - i / 6) * 0.9) for j in range(3))
        d.ellipse((ax - rx, ay - ry, ax + rx, ay + ry), fill=c)
    return im


def figure(path, box, k, floor=True):
    """His picture cut to `box` (picture pixels), made `k` times as big (whole pixels), on the floor with his shadow."""
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



RED = (255, 140, 120)
ORDER = ['front', 'toward', 'frontL', 'sideL', 'backL', 'away', 'back', 'side']
ARROW = {'front': '↘', 'toward': '↓', 'frontL': '↙', 'sideL': '←', 'backL': '↖', 'away': '↑', 'back': '↗', 'side': '→'}


def look(dir, out):
    J = json.load(open(os.path.join(dir, 'look.json')))
    P = lambda n: os.path.join(dir, n)
    S = Sheet()
    d = S.d
    d.text((24, S.y), 'THE WARLOCK, BROUGHT UP: A FIRST LOOK', font=S.big, fill=INK)
    S.y += 48
    intro = ('A still of him, as with the Ranger and the Mage, before the whole job. His look stays exactly as you passed it: the big '
             'man in the long dark coat, hunched and pained; the horned hood and two points of cyan for eyes; the spiked pauldron; '
             'his demon arm with the cyan fire in its claws, his right hand clamped on it; the red book chained at his hip. What '
             'changes: his feet are set further apart so his lower legs read longer than his thighs from every side, his coat '
             'hanging over the longer stance; his boots come up to his knee; and he is painted from all eight sides, none flipped, '
             'his demon arm always his left.')
    for ln in wrap(d, intro, S.small, W - 48):
        d.text((24, S.y), ln, font=S.small, fill=DIM)
        S.y += 25
    S.y += 18

    # ---- his stance, before beside now, from in front and from behind ----
    S.title('STANDING, THREE TIMES AS BIG', 'One moment of his stance: breathing hard, the demon arm restless, the fire in its claws. Before is the game today; now is him brought up.')
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

    # ---- his legs ----
    S.title('HIS LEGS', 'His near leg as the screen shows it, from in front: hip to knee in yellow, knee to the floor in green, in the game\'s pixels. '
            'His feet were close under him with his knees bent, so his lower legs looked short. Now his lead foot (the demon\'s side) '
            'is further forward and his back foot further back, as low and as hunched: each lower leg reads longer than the thigh above it. '
            'Cyan marks where his coat\'s edge falls over the leg, and the top of his boot.')
    legs = J['legs']
    lfiles = [P(J['stance'][0]['before']), P(J['stance'][0]['now'])]
    lb = union_box(lfiles)
    lb = (lb[0], max(lb[1], 88), lb[2], lb[3])
    K = 3
    lfig = [figure(f, lb, K) for f in lfiles]
    lw, lh = lfig[0].size
    ty = S.y
    for i, (who, fig) in enumerate(zip(['before', 'now'], lfig)):
        x = 24 + 80 + i * (lw + 260)
        leg = legs[who]
        S.label(x - 60, ty, who.upper(), CYAN if who == 'now' else DIM, S.mid)
        S.img.paste(fig, (x, ty + 34))
        legs_mark(d, x - 14, ty + 34, K, leg, lb, S.tiny)
        eye = leg['eye']
        for at, name in ((eye.get('hemAt'), "coat's edge"), (eye.get('seenAt'), 'boot top')):
            if not at:
                continue
            px_, py_ = x + (at[0] - lb[0]) * K, ty + 34 + (at[1] - lb[1]) * K
            ly = py_ + (12 if name == 'boot top' else -12)
            d.line((px_ + 3, py_, px_ + 14, py_), fill=CYAN, width=2)
            d.line((px_ + 14, py_, x + lw + 6, ly), fill=CYAN, width=1)
            d.text((x + lw + 9, ly - 9), name, font=S.tiny, fill=CYAN)
        if not eye.get('hemAt') and not eye.get('seenAt'):
            S.label(x + lw + 9, ty + 34 + lh // 2, 'his coat hides', DIM)
            S.label(x + lw + 9, ty + 34 + lh // 2 + 20, 'the whole leg', DIM)
        ratio = leg['lower'] / leg['thigh']
        S.label(x - 60, ty + 34 + lh + 6, f"this leg: knee-floor {ratio:.2f} x hip-knee", CYAN if ratio >= 1.05 else RED)
    ty += 34 + lh + 40
    for ln in wrap(d, 'Knee to floor over hip to knee: the least of either leg, from each side he can face (at least 1.05 asked). '
                      'Through his breathing; and through his whole stand, the spasm and the pain folding him over among it:', S.tiny, W - 48):
        S.label(24, ty, ln, INK)
        ty += 22
    ty += 6
    cw = (W - 48 - 300) // 8
    for j, v in enumerate(ORDER):
        S.label(24 + 300 + j * cw + 8, ty - 4, ARROW[v], DIM, S.mid)
    ty += 28
    for key, what in (('per', 'breathing'), ('whole', 'his whole stand')):
        for who in ['before', 'now']:
            S.label(24, ty, f'{what}, {who}', CYAN if who == 'now' else DIM)
            for j, v in enumerate(ORDER):
                r = legs[who][key][v]
                S.label(24 + 300 + j * cw, ty, f'{r:.2f}', CYAN if r >= 1.05 else RED)
            ty += 22
        ty += 6
    S.y = ty + 20

    # ---- his eight sides ----
    S.title('NOW, FROM ALL EIGHT SIDES, STANDING, THREE TIMES AS BIG', 'Each side truly painted, none flipped: the demon arm always his left, the spiked pauldron on it, the book at his right hip. Each is laid as he faces on the screen.')
    K = 3
    sfiles = [P(x['file']) for x in J['sides']]
    sb = union_box(sfiles)
    per = 3
    cw = (W - 48) // per
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

    # ---- a stride of his run, side-on ----
    run = J['run']
    S.title('ONE STRIDE OF HIS RUN, SIDE-ON, TWICE AS BIG',
            'His limp kept: the demon side a long heavy step that stays down, the other a quick hop kicked up behind. Under each: '
            'how far the leg in the air has its thigh up from hanging straight down (more than 50 fails: no prancing). Before, the '
            f"quick foot came through high, its knee up to {run['most']['before']:.0f} degrees; now it comes through low, at most "
            f"{run['most']['now']:.0f}. Before is the game's run turned side-on (the game drew him only in front and from behind); "
            'now his boots come to his knee, so the knee you see is his knee.')
    rf = [P(f['file']) for f in run['before'] + run['now']]
    rb = union_box(rf)
    K = 2
    n = len(run['before'])
    cw = (W - 48 - 112) // n
    for r, who in enumerate(['before', 'now']):
        yy = S.y + r * ((rb[3] - rb[1]) * K + 56)
        S.label(24, yy + (rb[3] - rb[1]) * K // 2 - 12, who.upper(), CYAN if who == 'now' else DIM, S.mid)
        for i, f in enumerate(run[who]):
            g = figure(P(f['file']), rb, K)
            x = 24 + 112 + i * cw
            S.img.paste(g, (x, yy))
            sw = [t for t in f['thighs'] if t['swinging']]
            if sw:
                deg = max(t['deg'] for t in sw)
                S.label(x + 4, yy + g.size[1] + 4, f'{deg:.0f}°', CYAN if deg <= 50 else RED, S.mid)
            else:
                S.label(x + 4, yy + g.size[1] + 8, 'both down', DIM)
    S.y += 2 * ((rb[3] - rb[1]) * K + 56) + 10

    # ---- at the game's size ----
    S.title("AT THE GAME'S OWN SIZE", 'Before and now, in front and from behind; then his eight sides now.')
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
