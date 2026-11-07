# THE RANGER BROUGHT UP: THE PICTURES LAID OUT WITH THEIR CAPTIONS (the art chat's helper, 6 Nov 2026).
# From the pictures tools/ranger_up_pics.ts paints (RGBA, his canvas: 176 by 176, his feet at 84, 132).
#   python3 tools/ranger_up_pics.py look <dir> <out.png>     (one still of him standing: before beside now, from in front)
import os
import sys

from PIL import Image, ImageDraw, ImageFont

B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG = (16, 15, 40)
FLOOR = (30, 28, 62)
INK = (232, 230, 255)
DIM = (170, 166, 210)
CYAN = (34, 208, 224)
AX, AY = 84, 132


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
    im = Image.new('RGB', (w, h), BG)
    d = ImageDraw.Draw(im)
    for i in range(6, 0, -1):
        rx, ry = 15 * k * i / 6, 5 * k * i / 6
        c = tuple(int(FLOOR[j] + (8 - FLOOR[j]) * (1 - i / 6) * 0.9) for j in range(3))
        d.ellipse((ax - rx, ay - ry, ax + rx, ay + ry), fill=c)
    return im


def figure(path, box, k):
    """His picture cut to `box` (picture pixels), made `k` times as big (whole pixels), on the floor with his shadow."""
    im = Image.open(path).convert('RGBA').crop(box)
    im = im.resize((im.width * k, im.height * k), Image.NEAREST)
    g = ground(im.width, im.height, k, (AX - box[0]) * k, (AY - box[1]) * k)
    g.paste(im, (0, 0), im)
    return g


def union_box(paths, pad=6):
    bb = [999, 999, -1, -1]
    for p in paths:
        b = Image.open(p).getbbox()
        if b:
            bb = [min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3])]
    return (max(0, bb[0] - pad), max(0, bb[1] - pad), min(176, bb[2] + pad), min(176, bb[3] + pad + 2))


def legs_mark(d, x, ty, k, leg, box, font_, label=True):
    """Beside a figure: a line from his hip down to the floor, ticks at the hip, the knee and the floor (his near leg, as the
    screen shows it), and the two lengths along the leg in the game's pixels."""
    def Y(p):
        return ty + (p[1] - box[1]) * k
    yh, yk, yf = Y(leg['hip']), Y(leg['knee']), Y(leg['floor'])
    up, low = (255, 214, 102), (120, 230, 140)
    w = max(2, k)
    d.line((x, yh, x, yk), fill=up, width=w)
    d.line((x, yk, x, yf), fill=low, width=w)
    for yy in (yh, yk, yf):
        d.line((x - 3 * w, yy, x + 3 * w, yy), fill=INK, width=max(1, w // 2 + 1))
    if label:
        for yy, name in ((yh, 'hip'), (yk, 'knee'), (yf, 'floor')):
            d.text((x - 8 - d.textlength(name, font=font_), yy - 9), name, font=font_, fill=DIM)
        d.text((x + 10, (yh + yk) / 2 - 10), f"{leg['thigh']:.1f}", font=font_, fill=up)
        d.text((x + 10, (yk + yf) / 2 - 10), f"{leg['lower']:.1f}", font=font_, fill=low)


def look(dir, out):
    import json
    W = 1200
    big, mid, small, tiny = font(B, 34), font(B, 23), font(R, 20), font(B, 17)
    probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    whos = ['before', 'now', 'legs']
    names = [('BEFORE', 'the game today'), ('FIRST SCULPT', 'the one you saw'), ('NOW', 'his legs true')]
    paths = [os.path.join(dir, f'look_{w}.png') for w in whos]
    legs = json.load(open(os.path.join(dir, 'look.json')))
    box = union_box(paths)
    K = 3
    figs = [figure(p, box, K) for p in paths]
    fw, fh = figs[0].size
    intro = ('Standing in a fight, from in front, three times as big. Beside each, the leg nearer you as it is on the screen: '
             'hip to knee (yellow) and knee to floor (green), in the game\'s pixels. Standing straight, his lower leg is '
             'a little longer than his thigh, as on a real person; in his crouch both knees were bent toward the camera, '
             'so each shin was seen end-on and looked short. Now the same low crouch, his front foot a little further '
             'forward with its knee bent out over it, his back foot further back: each shin is seen at its length.')
    lines = wrap(probe, intro, small, W - 48)
    gap = (W - 48 - 3 * fw) // 3
    top = 20 + 46 + len(lines) * 26 + 22
    small_box = (box[0], box[1], box[2], box[3])
    gw, gh = small_box[2] - small_box[0], small_box[3] - small_box[1]
    H = top + 60 + fh + 30 + 30 + gh + 40
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    y = 20
    d.text((24, y), "THE RANGER'S LEGS, MADE TRUE", font=big, fill=INK)
    y += 46
    for ln in lines:
        d.text((24, y), ln, font=small, fill=DIM)
        y += 26
    y = top
    for i, (g, w, (name, sub)) in enumerate(zip(figs, whos, names)):
        x = 24 + i * ((W - 48) // 3) + 100
        col = CYAN if w == 'legs' else DIM
        d.text((x - 80, y), name, font=mid, fill=col)
        d.text((x - 80, y + 28), sub, font=tiny, fill=DIM)
        img.paste(g, (x, y + 60))
        leg = legs[w]
        legs_mark(d, x - 14, y + 60, K, leg, box, tiny)
        ratio = leg['lower'] / leg['thigh']
        d.text((x - 80, y + 60 + fh + 6), f"knee to floor = {ratio:.2f} x hip to knee", font=tiny, fill=CYAN if ratio >= 1 else (255, 140, 120))
        # at the game's own size, under it
        yy = y + 60 + fh + 30 + 30
        sg = figure(paths[i], small_box, 1)
        img.paste(sg, (x + (fw - gw) // 2, yy))
        legs_mark(d, x + (fw - gw) // 2 - 6, yy, 1, leg, box, tiny, label=False)
    d.text((24, top + 60 + fh + 34), "at the game's own size:", font=tiny, fill=DIM)
    img.save(out)
    print(out, img.size)


if __name__ == '__main__':
    mode, dir, out = sys.argv[1:4]
    if mode == 'look':
        look(dir, out)
