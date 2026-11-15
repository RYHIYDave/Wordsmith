"""THREE TAKES ON THE ROUND STONE TABLET, each as its four quarters drop (apart) and set together (whole, at work)."""
import math
import numpy as np
from kit import Pic, S, INK, CY, tones, light_t, dilate, erode
from emblems import MARKS

DARK = (7, 6, 15)
R = 30
# (the quarters, clockwise from the top left: the bosses of floors 5, 10, 15 and 20)
QUAD = [(-1, -1), (1, -1), (1, 1), (-1, 1)]


def quad_mask(p, cx, cy, k):
    yy, xx = np.mgrid[0:p.h, 0:p.w]
    sx, sy = QUAD[k]
    return ((xx + 0.5 - cx) * sx > 0.5) & ((yy + 0.5 - cy) * sy > 0.5)


def ring(p, cx, cy, r0, r1):
    return p.ellipse(cx, cy, r1, r1) & ~p.ellipse(cx, cy, r0, r0)


def disc_base(p, cx, cy, lit):
    d = p.ellipse(cx, cy, R, R)
    p.shade(d, [S[3], S[4], S[6]])
    # (its edge, the stone's thickness, seen a little below its face: a darker band at the foot)
    foot = d & ~p.ellipse(cx, cy - 1.5, R, R)
    p.fill(foot, S[2])
    return d


def chips(p, cx, cy, k, seed):
    """Wear: a few chips and pits in the stone of a quarter."""
    rng = np.random.default_rng(seed)
    sx, sy = QUAD[k]
    for _ in range(7):
        a = rng.uniform(0.15, 1.4)
        r = rng.uniform(8, R - 3)
        x = cx + sx * math.cos(a) * r
        y = cy + sy * math.sin(a) * r
        p.px(x, y, S[2])
        p.px(x + 1, y + 1, S[6])


def carve_line(p, pts, w=1):
    for a, b in zip(pts, pts[1:]):
        p.line(a, b, INK, w)


# ---------------------------------------------------------------------------------------------------------------------------
# TAKE A: THE STAIR SEAL. The shaft from above: a stair cut in a spiral, down into a black hole in its middle; a wide rim with the
# four bosses' marks. Set whole, the stair is one and its depth lights.

def take_a(p, cx, cy, which=(0, 1, 2, 3), lit=False):
    disc_base(p, cx, cy, lit)
    # (the rim, raised: its inner edge a cut)
    band = ring(p, cx, cy, R - 8, R - 1)
    p.shade(band, [S[4], S[5], S[7]], seam=False)
    p.fill(p.ellipse(cx, cy, R - 8, R - 8) & ~p.ellipse(cx, cy, R - 9, R - 9), INK)
    # (the shaft's walls inside the rim: falling to the hole, dark, in bands)
    yy, xx = np.mgrid[0:p.h, 0:p.w]
    rr = np.hypot(xx + 0.5 - cx, yy + 0.5 - cy)
    inner = p.ellipse(cx, cy, R - 9, R - 9)
    for b, c in enumerate([S[2], S[1], (26, 20, 32), (16, 12, 24)]):
        p.fill(inner & (rr < (R - 9) - b * 4), c)
    # (the stair: a ribbon of steps winding down the wall, each tread flat and a step darker than the last, its nose lit, its
    # riser cut; under its inner edge the drop to the turn below, in shadow)
    n = 15
    a0 = -math.pi * 0.95
    turn = 1.3 * 2 * math.pi
    for i in range(n):
        t0, t1 = i / n, (i + 1) / n
        aa, ab = a0 + turn * t0, a0 + turn * t1
        ro0, ro1 = (R - 9.5) - 11.5 * t0, (R - 9.5) - 11.5 * t1
        wide = 6 - 2.2 * t0
        def at(u, inset):
            a = aa + (ab - aa) * u
            r = ro0 + (ro1 - ro0) * u - inset
            return (cx + math.cos(a) * r, cy + math.sin(a) * r)
        outer = [at(j / 6, 0) for j in range(7)]
        inner_e = [at(1 - j / 6, wide) for j in range(7)]
        m = p.poly(outer + inner_e)
        shadow = p.poly([at(j / 6, wide - 0.5) for j in range(7)] + [at(1 - j / 6, wide + 2) for j in range(7)])
        p.fill(shadow & ~m, (12, 9, 20))
        p.fill(m, S[max(2, 6 - int(t0 * 4.5))])
        # (its nose, toward the light)
        p.line(at(0.04, 0.3), at(0.04, wide - 0.4), S[min(7, 7 - int(t0 * 3.5))])
        # (the riser down to the next: a cut)
        p.line(at(1, 0.2), at(1, wide - 0.2), INK)
    # (the hole: the shaft's black)
    hole = p.ellipse(cx, cy, 5, 5)
    p.ink(hole)
    p.fill(hole, DARK)
    if lit:
        p.fill(ring(p, cx, cy, 3, 5), CY[1])
        p.fill(ring(p, cx, cy, 2, 3), CY[3])
        p.px(cx - 1, cy - 1, CY[4])
    # (the bosses' marks, one on each quarter's rim)
    for k in range(4):
        sx, sy = QUAD[k]
        ex = cx + sx * (R - 4.5) * math.cos(math.pi / 4)
        ey = cy + sy * (R - 4.5) * math.sin(math.pi / 4)
        MARKS[k](p, ex, ey, 0.62, carved=not lit)
    for k in range(4):
        chips(p, cx, cy, k, 11 + k)


# ---------------------------------------------------------------------------------------------------------------------------
# TAKE B: THE KEY WORD. Each quarter carries one letter of a word, carved; each boss guards one letter. Set whole, the word is
# whole: it burns in the friend's cyan and lifts off the stone, as a word does off the wordsmith's slab. The word is his to pick:
# DOWN stands in here.

LETTERS = {
    'D': [[(0, 0), (5, 0), (9, 3), (9, 9), (5, 12), (0, 12), (0, 0)]],
    'O': [[(4.5, 0), (8, 1.5), (9.5, 6), (8, 10.5), (4.5, 12), (1, 10.5), (-0.5, 6), (1, 1.5), (4.5, 0)]],
    'W': [[(0, 0), (2, 12), (5, 4), (8, 12), (10, 0)]],
    'N': [[(0, 12), (0, 0), (9, 12), (9, 0)]],
}


def letter(p, ch, x, y, s, body, edge=None, w=2):
    for stroke in LETTERS[ch]:
        pts = [(x + px * s, y + py * s) for px, py in stroke]
        if edge is not None:
            for a, b in zip(pts, pts[1:]):
                p.line((a[0] + 1, a[1] + 1), (b[0] + 1, b[1] + 1), edge, w)
        for a, b in zip(pts, pts[1:]):
            p.line(a, b, body, w)


def take_b(p, cx, cy, which=(0, 1, 2, 3), lit=False, word='DOWN'):
    disc_base(p, cx, cy, lit)
    band = ring(p, cx, cy, R - 5, R - 1)
    p.shade(band, [S[4], S[5], S[7]], seam=False)
    p.fill(ring(p, cx, cy, R - 6, R - 5), INK)
    # (a small round boss in the middle where the four meet)
    hub = p.ellipse(cx, cy, 4, 4)
    p.shade(hub, [S[3], S[5], S[7]])
    for k in range(4):
        sx, sy = QUAD[k]
        lx = cx + sx * 12.5 - 5
        ly = cy + sy * 12 - 6.5
        ch = word[[0, 1, 3, 2][k]]
        if lit:
            letter(p, ch, lx, ly, 1.0, CY[3], edge=CY[1])
        else:
            # (carved: the groove dark, its lower edge catching the light)
            letter(p, ch, lx, ly, 1.0, S[1], edge=S[6])
        ex = cx + sx * (R - 3) * math.cos(math.pi / 4) + sx * 0.2
        ey = cy + sy * (R - 3) * math.sin(math.pi / 4)
    for k in range(4):
        sx, sy = QUAD[k]
        # (each boss's mark small on the rim, by its letter)
        ex = cx + sx * (R - 3) * math.cos(math.pi / 3.2)
        ey = cy + sy * (R - 3) * math.sin(math.pi / 3.2)
        MARKS[k](p, ex, ey, 0.42, carved=True)
        chips(p, cx, cy, k, 31 + k)


# ---------------------------------------------------------------------------------------------------------------------------
# TAKE C: THE FOUR FACES. Each quarter is a boss's face in relief, in its own colours, all four turned in to a keystone in the
# middle. Set whole, the keystone's cross opens on light.

def take_c(p, cx, cy, which=(0, 1, 2, 3), lit=False):
    disc_base(p, cx, cy, lit)
    band = ring(p, cx, cy, R - 4, R - 1)
    p.shade(band, [S[4], S[5], S[7]], seam=False)
    p.fill(ring(p, cx, cy, R - 5, R - 4), INK)
    # (the grooves between the four, deep)
    yy, xx = np.mgrid[0:p.h, 0:p.w]
    gx = (np.abs(xx + 0.5 - cx) < 1.2) & p.ellipse(cx, cy, R - 4, R - 4)
    gy = (np.abs(yy + 0.5 - cy) < 1.2) & p.ellipse(cx, cy, R - 4, R - 4)
    for k in range(4):
        sx, sy = QUAD[k]
        ex = cx + sx * 12.5
        ey = cy + sy * 12.5
        # (a sunk field for the face)
        field = p.ellipse(ex, ey, 9.5, 9.5)
        p.shade(field, [S[5], S[4], S[3]], seam=False)
        MARKS[k](p, ex, ey + 0.5, 1.2, carved=False)
    p.fill(gx | gy, INK)
    key = p.ellipse(cx, cy, 6, 6)
    p.shade(key, [S[3], S[5], S[7]])
    cross = (np.abs(xx + 0.5 - cx) < 1.1) & (np.abs(yy + 0.5 - cy) < 4.5) | (np.abs(yy + 0.5 - cy) < 1.1) & (np.abs(xx + 0.5 - cx) < 4.5)
    p.fill(cross, CY[3] if lit else DARK)
    if lit:
        p.fill((np.abs(xx + 0.5 - cx) < 0.6) & (np.abs(yy + 0.5 - cy) < 3), CY[4])
    for k in range(4):
        chips(p, cx, cy, k, 51 + k)


TAKES = [
    ('A: THE STAIR SEAL', 'The shaft from above: a stair cut in a spiral down to a black hole. A boss’s mark on each quarter’s rim. Set whole, its depth lights.', take_a),
    ('B: THE KEY WORD', 'Each boss guards one letter of a word. Set whole, the word burns cyan and lifts off it, as a word lifts off the slab. (DOWN stands in: the word is yours.)', take_b),
    ('C: THE FOUR FACES', 'Each quarter is a boss’s face in its own colours, all four turned to a keystone. Set whole, the keystone’s cross opens on light.', take_c),
]


def quarters_apart(take, size=100):
    """The four quarters as they drop, a little apart."""
    out = Pic(size, size)
    c = size / 2
    for k in range(4):
        sx, sy = QUAD[k]
        q = Pic(size, size)
        cx, cy = c + sx * 4, c + sy * 4
        q.clip = quad_mask(q, cx, cy, k) | ~dilate(q.ellipse(cx, cy, R + 1, R + 1), 1)
        # (a quarter's own seam: its two broken edges too)
        take(q, cx, cy, which=(k,), lit=False)
        qm = q.ellipse(cx, cy, R, R) & quad_mask(q, cx, cy, k)
        q.clip = None
        keep = dilate(qm, 1)
        q.a[~keep] = 0
        edge = keep & ~qm
        q.rgb[edge] = INK
        q.a[edge] = 1
        out.paste(q.image(), 0, 0)
    return out


def whole(take, size=100, lit=True):
    out = Pic(size, size)
    c = size / 2
    if lit:
        out.glow(c, c, R + 14, CY[2], 0.28, bands=3)
    take(out, c, c, lit=lit)
    if lit:
        out.glow(c, c, 9, CY[3], 0.35, bands=2)
    return out


# ---------------------------------------------------------------------------------------------------------------------------
# TAKE B WITH RUNES (his pick, 12 Nov 2026: “I like B but I want runes over letters”): each quarter carries one of the game's own
# runes (art/town.ts RUNES, the wordsmith's: a few strokes on a 5 x 9 grid), drawn twice as big; each boss guards one. Carved and dark
# as they drop; set whole, the four burn in the friend's cyan, as the runes of the wordsmith's ring do when alight.

GAME_RUNES = [
    ['..#..', '.###.', '#.#.#', '..#..', '..#..', '..#..', '.#.#.', '#...#', '.....'],
    ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#', '#....', '#....'],
    ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#....', '#...#', '.###.'],
    ['#.#.#', '#.#.#', '.###.', '..#..', '..#..', '.###.', '#.#.#', '#...#', '.....'],
    ['..#..', '..#..', '#####', '..#..', '.#.#.', '#...#', '#...#', '.#.#.', '..#..'],
    ['#####', '....#', '...#.', '.###.', '...#.', '....#', '....#', '#...#', '.###.'],
]
# (the game's own colours for a rune: dim teal cut in stone, and alight, art/kit.ts TEAL and SPARK)
TEAL_DIM = (21, 122, 140)
SPARK = [(12, 106, 128), (34, 208, 224), (184, 255, 248), (255, 255, 255)]
# (which rune each boss guards: the Fleshmancer, the Colossus, the Censor, the Moth)
RUNE_OF = [0, 4, 3, 1]


def rune_at(p, k, x, y, lit, s=2):
    rows = GAME_RUNES[k]
    on = lambda i, j: 0 <= j < len(rows) and 0 <= i < 5 and rows[j][i] == '#'
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch != '#':
                continue
            x0, y0 = x + i * s, y + j * s
            for dy in range(s):
                for dx in range(s):
                    if lit:
                        # (alight: the friend's cyan, its upper edges whitest)
                        top = dy == 0 and not on(i, j - 1)
                        p.px(x0 + dx, y0 + dy, SPARK[2] if top else SPARK[1])
                    else:
                        # (cut: the groove dark; where a stroke ends below or to the right, the far wall of the cut catches the light)
                        p.px(x0 + dx, y0 + dy, S[1])
            if not lit:
                if not on(i, j + 1):
                    for dx in range(s):
                        p.px(x0 + dx, y0 + s, S[6])
                if not on(i + 1, j):
                    for dy in range(s):
                        p.px(x0 + s, y0 + dy, S[5])


def take_b_runes(p, cx, cy, which=(0, 1, 2, 3), lit=False):
    disc_base(p, cx, cy, lit)
    band = ring(p, cx, cy, R - 5, R - 1)
    p.shade(band, [S[4], S[5], S[7]], seam=False)
    p.fill(ring(p, cx, cy, R - 6, R - 5), INK)
    hub = p.ellipse(cx, cy, 4, 4)
    p.shade(hub, [S[3], S[5], S[7]])
    if lit:
        p.fill(p.ellipse(cx, cy, 2, 2), SPARK[1])
        p.px(cx - 1, cy - 1, SPARK[2])
    for k in range(4):
        sx, sy = QUAD[k]
        rx = cx + sx * 12 - 5
        ry = cy + sy * 11.5 - 9
        if lit:
            # (a little of its light on the stone round it)
            p.glow(rx + 5, ry + 9, 10, SPARK[1], 0.16, bands=2)
        rune_at(p, RUNE_OF[k], rx, ry, lit)
    for k in range(4):
        sx, sy = QUAD[k]
        ex = cx + sx * (R - 3) * math.cos(math.pi / 3.2)
        ey = cy + sy * (R - 3) * math.sin(math.pi / 3.2)
        MARKS[k](p, ex, ey, 0.42, carved=True)
        chips(p, cx, cy, k, 31 + k)
