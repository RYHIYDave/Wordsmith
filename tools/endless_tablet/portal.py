"""THREE TAKES ON THE PORTAL, each painted over the Shaft's Rim's own picture (docs/mockups/endless_town/pictures/rim3_whole.png),
on the landing at the end of the tongue, where the portal opens once the tablet is set."""
import math
import numpy as np
from PIL import Image
from kit import Pic, S, INK, CY, PINK, dilate
from tablet import take_a, R

CROP = (400, 230, 720, 470)
# (the landing's middle and its radii in the crop; it is a round seen in the game's slant)
LX, LY, LRX, LRY = 137, 116, 41, 21


def base():
    im = Image.open('../../docs/mockups/endless_town/pictures/rim3_whole.png').convert('RGB').crop(CROP)
    p = Pic(im.width, im.height)
    p.rgb[:] = np.array(im).astype(np.float32)
    p.a[:] = 1
    return p


def darken(p, m, k):
    p.rgb[m] *= k


def oval_ring(p, cx, cy, rx, ry, w):
    return p.ellipse(cx, cy, rx, ry) & ~p.ellipse(cx, cy, rx - w, ry - w * ry / rx)


# ---------------------------------------------------------------------------------------------------------------------------
# P1: A STANDING RING. An upright ring of the friend's light stands on the landing, as tall as two heroes; inside it, the night of
# the shaft's bottom turning; the four quarters of the tablet ride round its rim.

def portal_ring(p):
    cx, cy = LX, LY - 34
    rx, ry = 20, 36
    # (its light on the landing)
    p.glow(LX, LY, 46, CY[2], 0.22, bands=3, squash=0.5)
    # (the night inside, turning: bands of the deep, a spiral)
    inside = p.ellipse(cx, cy, rx - 3, ry - 3)
    yy, xx = np.mgrid[0:p.h, 0:p.w]
    a = np.arctan2((yy + 0.5 - cy) / ry, (xx + 0.5 - cx) / rx)
    r = np.hypot((xx + 0.5 - cx) / rx, (yy + 0.5 - cy) / ry)
    sw = np.sin(a * 3 + r * 9)
    deep = [(8, 6, 16), (16, 12, 30), (26, 22, 52), (14, 50, 70)]
    for i, c in enumerate(deep):
        p.fill(inside & (sw > -1 + i * 0.6) & (r > 0.05 + 0.18 * (3 - i)), c)
    p.fill(inside & (r < 0.18), (6, 4, 12))
    # (the ring: a band of light, its edge whitest)
    band = oval_ring(p, cx, cy, rx, ry, 4)
    p.ink(dilate(band, 0))
    p.fill(band, CY[2])
    p.fill(oval_ring(p, cx, cy, rx - 1, ry - 1, 1.5), CY[4])
    p.fill(oval_ring(p, cx, cy, rx, ry, 1), CY[1])
    # (sparks off it)
    rng = np.random.default_rng(3)
    for _ in range(26):
        t = rng.uniform(0, 2 * math.pi)
        d = rng.uniform(1.0, 1.35)
        p.px(cx + math.cos(t) * rx * d, cy + math.sin(t) * ry * d, CY[rng.integers(2, 5)])
    # (the four quarters riding round it)
    for k, t in enumerate([-2.3, -0.8, 0.8, 2.3]):
        qx, qy = cx + math.cos(t) * (rx + 7), cy + math.sin(t) * (ry + 5)
        q = Pic(p.w, p.h)
        q.clip = None
        mini = Pic(24, 24)
        take_a_small(mini, 12, 12, k)
        p.paste(mini.image(), int(qx - 12), int(qy - 12))
    p.glow(cx, cy, 40, CY[2], 0.18, bands=3, squash=1.6)


def take_a_small(p, cx, cy, k):
    """A quarter of the tablet, small, glowing at its edge (riding the ring)."""
    rr = 8
    yy, xx = np.mgrid[0:p.h, 0:p.w]
    sx, sy = [(-1, -1), (1, -1), (1, 1), (-1, 1)][k]
    q = p.ellipse(cx, cy, rr, rr) & ((xx + 0.5 - cx) * sx > 0) & ((yy + 0.5 - cy) * sy > 0)
    p.ink(q)
    p.shade(q, [S[3], S[5], S[7]], seam=False)
    edge = q & ~p.ellipse(cx, cy, rr - 1.5, rr - 1.5)
    p.fill(edge, CY[2])


# ---------------------------------------------------------------------------------------------------------------------------
# P2: THE LANDING OPENS. The landing splits in four as the tablet did and its quarters draw back; under them a way goes on down,
# a stair into a pit of the friend's light; the boss's own glow far below.

def portal_open(p):
    cx, cy = LX, LY
    yy, xx = np.mgrid[0:p.h, 0:p.w]
    # (where the landing was: a hole as wide, falling away; light up out of it from far below)
    hole = p.ellipse(cx, cy, LRX - 1, LRY - 1)
    p.fill(dilate(hole, 1) & ~hole, INK)
    rr = np.hypot((xx + 0.5 - cx) / (LRX - 1), (yy + 0.5 - cy) / (LRY - 1))
    # (its near wall, seen falling: the far half of the hole shows wall, the near half its lip)
    bands = [(12, 10, 22), (14, 26, 40), (14, 52, 70), (20, 100, 122), (40, 180, 200)]
    for i, c in enumerate(bands):
        p.fill(hole & (rr < 1 - i * 0.19), c)
    # (the stair going on down round its wall: steps in a spiral, each a lit tread and a dark riser)
    for i in range(18):
        t = i / 18
        a = math.pi * (0.75 + 1.7 * t)
        sc = 0.92 - 0.6 * t
        x = cx + math.cos(a) * (LRX - 4) * sc
        y = cy + math.sin(a) * (LRY - 3) * sc + 10 * t
        w = 5 - 3 * t
        tone = S[6 - int(t * 4)]
        p.line((x - w, y), (x + w, y), tone)
        p.line((x - w, y + 1), (x + w, y + 1), INK)
    # (far down: the boss's own pink burning to gold)
    p.glow(cx, cy + 9, 7, PINK[2], 0.6, bands=2, squash=0.5)
    p.px(cx, cy + 9, PINK[4])
    p.px(cx + 1, cy + 9, PINK[3])
    # (the landing's four quarters, drawn back onto the rim, each a thick slab)
    for k, (sx, sy) in enumerate([(-1, -1), (1, -1), (1, 1), (-1, 1)]):
        qx, qy = cx + sx * 30, cy + sy * 15
        top = p.ellipse(qx - sx * 10, qy - sy * 5, 20, 10) & ((xx + 0.5 - (qx - sx * 10)) * sx > 0) & ((yy + 0.5 - (qy - sy * 5)) * sy > 0)
        side = top.copy()
        for d in range(1, 5):
            from kit import shift
            side |= shift(top, 0, d)
        side &= ~top
        p.ink(top | side)
        p.fill(side, S[2])
        p.shade(top, [S[4], S[5], S[6]], seam=False)
        # (its broken inner edges catch the friend's light from the hole)
        edge = top & ~p.ellipse(qx - sx * 10, qy - sy * 5, 18.5, 9)
        p.fill(edge & ~shift(top, 0, -1), S[7])
    # (light standing up out of the hole)
    p.glow(cx, cy - 6, 40, CY[2], 0.22, bands=3, squash=1.1)
    for i in range(16):
        x = cx + (i - 8) * 3.4
        h = 22 + 12 * math.sin(i * 1.9)
        for j in range(int(h)):
            if (j + i) % 3 != 2:
                p.px(x, cy + 4 - j, CY[2 if j < h * 0.5 else 1], 0.55)


# ---------------------------------------------------------------------------------------------------------------------------
# P3: THE TABLET MADE GREAT. The tablet rises over the landing, grown taller than the gate's doorway; its quarters part as a frame,
# and between them is a door of night, with the boss's own glow deep in it.

def portal_tablet(p):
    cx, cy = LX, LY - 44
    big = Pic(120, 120)
    # (a great copy of take A, its quarters drawn apart)
    from tablet import quad_mask
    for k in range(4):
        sx, sy = [(-1, -1), (1, -1), (1, 1), (-1, 1)][k]
        q = Pic(120, 120)
        qcx, qcy = 60 + sx * 6, 60 + sy * 6
        q.clip = quad_mask(q, qcx, qcy, k)
        take_a(q, qcx, qcy, lit=True)
        q.clip = None
        qm = q.ellipse(qcx, qcy, R, R) & quad_mask(q, qcx, qcy, k)
        edge = dilate(qm, 1) & ~qm
        q.rgb[edge] = INK
        q.a[edge] = 1
        q.a[~dilate(qm, 1)] = 0
        big.paste(q.image(), 0, 0)
    # (the door of night between the quarters, where it stands open)
    door = Pic(120, 120)
    yy, xx = np.mgrid[0:120, 0:120]
    cross = ((np.abs(xx + 0.5 - 60) < 6) | (np.abs(yy + 0.5 - 60) < 6)) & door.ellipse(60, 60, R + 6, R + 6)
    door.fill(cross, (10, 8, 22))
    door.fill(door.ellipse(60, 60, 9, 9), (10, 8, 22))
    door.glow(60, 60, 8, PINK[2], 0.5, bands=2)
    # (it stands upright: seen in the game's slant only a little narrowed)
    stand = Pic(p.w, p.h)
    p.glow(LX, LY, 48, CY[2], 0.2, bands=3, squash=0.5)
    p.glow(cx, cy, 52, CY[2], 0.16, bands=3)
    p.paste(door.image().resize((96, 112), Image.NEAREST), cx - 48, cy - 56)
    p.paste(big.image().resize((96, 112), Image.NEAREST), cx - 48, cy - 56)
    # (light falling from it onto the landing)
    for i in range(9):
        x = cx + (i - 4) * 4
        for j in range(0, 20, 2):
            p.px(x, cy + 50 + j, CY[2], 0.5)


TAKES = [
    ('A: A STANDING RING', 'A ring of the friend’s light stands on the landing, as tall as two heroes. Inside it the shaft’s night turns; the four quarters ride round its rim.', portal_ring),
    ('B: THE LANDING OPENS', 'The landing splits in four as the tablet does, and its quarters draw back. Under them a stair goes on down, lit cyan, the boss’s glow far below.', portal_open),
    ('C: THE TABLET MADE GREAT', 'The tablet rises over the landing, grown huge. Its quarters part into a frame, and between them stands a door of night.', portal_tablet),
]
