"""FOUR TAKES ON THE FINAL BOSS, rough, each standing beside the Brawler (his own standing picture from the game's bake) for
size. Enemies: a pink edge round the living, pink burning to gold for what glows on them; light from the upper left."""
import math
import numpy as np
from PIL import Image
from kit import Pic, S, INK, PINK, CY, dilate, erode, shift

EDGE = (255, 79, 138)


def pink_edge(p, m):
    """The enemy's one-pixel edge of light round the living."""
    e = m & ~erode(m, 1)
    p.fill(e & (~shift(m, -1, 0) | ~shift(m, 1, 0) | ~shift(m, 0, 1)), EDGE, 0.6)


def ramp(c0, c1, n=4):
    return [tuple(c0[i] + (c1[i] - c0[i]) * k / (n - 1) for i in range(3)) for k in range(n)]


def glyphs(p, cx, cy, n, r, colours, seed=1, squash=0.6):
    """Bits of words torn loose: little letter-shapes (strokes of two or three pixels), wheeling round a point."""
    rng = np.random.default_rng(seed)
    shapes = [[(0, 0), (0, 3), (2, 3)], [(0, 0), (2, 0), (2, 3), (0, 3)], [(0, 3), (1, 0), (2, 3)], [(0, 0), (0, 3), (2, 0), (2, 3)], [(2, 0), (0, 0), (0, 3), (2, 3)], [(0, 0), (2, 0), (1, 0), (1, 3)]]
    for k in range(n):
        a = k * (2 * math.pi / n) + rng.uniform(-0.3, 0.3)
        rr = r * rng.uniform(0.55, 1.0)
        x, y = cx + math.cos(a) * rr, cy + math.sin(a) * rr * squash
        sh = shapes[rng.integers(0, len(shapes))]
        c = colours[k % len(colours)]
        for a0, b0 in zip(sh, sh[1:]):
            p.line((x + a0[0], y + a0[1]), (x + b0[0], y + b0[1]), c)


# ---------------------------------------------------------------------------------------------------------------------------
# 1. THE HEAD LIBRARIAN: the witch of his story, who hexed the kid in detention. Tall, gaunt, leaning in over you; her hair dragged
# into a hard bun stuck with quills, half-moon glasses burning pink; a fitted coat with sharp shoulders, keys at her belt; below it
# her gown opens on a petticoat of hanging pages, and pages tear loose off its hem; a long brass-shod ruler in one hand, and round
# the other the words she has taken from you, wheeling.

def librarian(p, fx, fy):
    COAT = ramp((22, 12, 30), (92, 56, 104))
    PAGE = ramp((130, 116, 96), (240, 232, 210))
    SKIN = ramp((96, 84, 104), (210, 198, 206))
    HAIR = ramp((16, 12, 22), (78, 70, 92))
    BRASS = ramp((110, 76, 28), (240, 206, 116))
    WOOD = ramp((60, 42, 28), (160, 124, 84))
    lean = 6  # (she leans in: her top is this far to the right of her feet)
    rng = np.random.default_rng(7)
    # (pages torn loose off her hem, drifting behind)
    for k in range(6):
        x = fx - 40 + rng.uniform(-6, 10) + k * 3
        y = fy - 8 - k * 9 + rng.uniform(-3, 3)
        pg = p.poly([(x, y), (x + 5, y - 2), (x + 7, y + 3), (x + 2, y + 5)])
        p.shade(pg, PAGE[:3])
    # (her petticoat of pages: leaves hanging from her hips, overlapping, the hem torn)
    leaves = []
    for i in range(15):
        u = (i - 7) / 7
        top = (fx + lean * 0.4 + u * 11, fy - 66)
        bot = (fx + u * 26 + rng.uniform(-2, 2), fy - rng.uniform(0, 4))
        w0, w1 = 3.0, 5.5
        leaves.append((abs(u), [(top[0] - w0, top[1]), (top[0] + w0, top[1]), (bot[0] + w1, bot[1] - 3), (bot[0] + w1 * 0.2, bot[1] + 0.5), (bot[0] - w1 * 0.6, bot[1] - 2.5), (bot[0] - w1, bot[1] - 4)]))
    for _, pts in sorted(leaves, key=lambda l: -l[0]):
        m = p.poly(pts)
        p.shade(m, PAGE)
        for k in range(4):
            y = pts[0][1] + 12 + k * 12
            x0 = (pts[0][0] + pts[5][0]) / 2 + (pts[5][0] - pts[0][0]) * k * 0.05
            p.line((x0 - 1, y), (x0 + 1, y), PAGE[1])
    # (her gown, open down the front, its tails swept back to the left)
    gown = p.poly([(fx + lean * 0.5 - 13, fy - 68), (fx + lean * 0.5 - 4, fy - 68), (fx - 14, fy - 30), (fx - 20, fy - 2), (fx - 44, fy - 4), (fx - 30, fy - 24), (fx - 22, fy - 52)])
    p.shade(gown, COAT)
    gown2 = p.poly([(fx + lean * 0.5 + 4, fy - 68), (fx + lean * 0.5 + 13, fy - 68), (fx + 24, fy - 34), (fx + 30, fy - 3), (fx + 18, fy - 6), (fx + 12, fy - 36)])
    p.shade(gown2, COAT)
    # (her coat: fitted, a narrow waist cinched by a belt, a long body, shoulders cut sharp and high)
    coat = p.poly([(fx + lean * 0.5 - 7, fy - 70), (fx + lean * 0.5 + 7, fy - 70), (fx + lean * 0.7 + 9, fy - 92), (fx + lean + 18, fy - 112), (fx + lean + 21, fy - 120), (fx + lean + 6, fy - 118), (fx + lean - 6, fy - 118), (fx + lean - 21, fy - 120), (fx + lean - 18, fy - 112), (fx + lean * 0.7 - 9, fy - 92)])
    p.shade(coat, COAT)
    # (its buttons, a line of brass down the front)
    for k in range(5):
        p.px(fx + lean * 0.6 + 1, fy - 76 - k * 8, BRASS[2])
    # (the belt, and the keys hung from it on a ring)
    p.line((fx + lean * 0.5 - 7, fy - 71), (fx + lean * 0.5 + 7, fy - 71), BRASS[1], 2)
    for k in range(4):
        kx, ky = fx + lean * 0.5 + 6 + k * 2, fy - 68 + (k % 2)
        p.line((kx, ky), (kx + (k - 1.5) * 0.6, ky + 6), BRASS[2])
        p.px(kx + (k - 1.5) * 0.6 + 1, ky + 6, BRASS[3])
    # (her high stiff collar, flared to two points)
    hx = fx + lean + 1
    collar = p.poly([(hx - 14, fy - 118), (hx - 10, fy - 134), (hx - 4, fy - 125), (hx + 4, fy - 125), (hx + 10, fy - 134), (hx + 14, fy - 118), (hx + 5, fy - 116), (hx - 5, fy - 116)])
    p.shade(collar, ramp((34, 18, 40), (120, 80, 132)))
    # (a long neck, and her head: long, the chin sharp, the cheekbones high, the nose long and hooked)
    neck = p.poly([(hx - 2.5, fy - 124), (hx + 2.5, fy - 124), (hx + 2, fy - 131), (hx - 2, fy - 131)])
    p.shade(neck, SKIN)
    head = p.poly([(hx - 7, fy - 142), (hx - 6.5, fy - 134), (hx - 2.5, fy - 128), (hx + 1.5, fy - 127), (hx + 6, fy - 132), (hx + 7.5, fy - 140), (hx + 7, fy - 149), (hx - 6.5, fy - 149)])
    p.shade(head, SKIN)
    # (the nose, long, hooked, a shade under it)
    p.line((hx + 1, fy - 140), (hx + 3, fy - 134), SKIN[3])
    p.line((hx + 2, fy - 140), (hx + 4, fy - 134), SKIN[0])
    # (her hair dragged back hard over the top of her head, and a tall bun, two quills through it side by side)
    hair = p.poly([(hx - 7.5, fy - 141), (hx - 7.5, fy - 150), (hx - 2, fy - 155), (hx + 4, fy - 155), (hx + 8, fy - 150), (hx + 7.5, fy - 144), (hx + 4, fy - 149), (hx - 4, fy - 149)])
    p.shade(hair, HAIR)
    bun = p.poly([(hx - 5, fy - 154), (hx - 6, fy - 162), (hx - 3, fy - 168), (hx + 3, fy - 168), (hx + 6, fy - 162), (hx + 5, fy - 154)])
    p.shade(bun, HAIR)
    for d in (0, 3):
        p.line((hx - 7 + d, fy - 160 - d * 0.3), (hx + 7 + d, fy - 175 - d * 0.3), PAGE[3])
        p.line((hx + 5 + d, fy - 173 - d * 0.3), (hx + 8 + d, fy - 177 - d * 0.3), (226, 222, 236))
    # (half-moon glasses: a rim of pink burning to gold, all the light on her face)
    for sx in (-1, 1):
        p.line((hx + sx * 3 - 2, fy - 139), (hx + sx * 3 + 2, fy - 139), PINK[4])
        p.line((hx + sx * 3 - 2, fy - 140), (hx + sx * 3 - 2, fy - 139), PINK[2])
        p.line((hx + sx * 3 + 2, fy - 140), (hx + sx * 3 + 2, fy - 139), PINK[2])
    p.glow(hx, fy - 139, 6, PINK[2], 0.22, bands=2)
    # (a thin mouth, turned down)
    p.line((hx - 1.5, fy - 131), (hx + 2, fy - 131.5), SKIN[0])
    # (her near arm down, long, the ruler in her hand like a staff, brass-shod at its foot)
    ruler = p.poly([(fx - 27, fy - 134), (fx - 23.5, fy - 134), (fx - 22, fy - 1), (fx - 25.5, fy - 1)])
    p.shade(ruler, WOOD)
    for k in range(0, 128, 5):
        p.px(fx - 23.5 + k * 0.012, fy - 132 + k, WOOD[0])
    p.fill(p.poly([(fx - 26, fy - 8), (fx - 21.5, fy - 8), (fx - 22, fy - 1), (fx - 25.5, fy - 1)]), BRASS[2])
    p.fill(p.poly([(fx - 27, fy - 136), (fx - 23, fy - 136), (fx - 23.3, fy - 132), (fx - 27, fy - 132)]), BRASS[2])
    arm_r = p.curve_limb([(fx + lean - 17, fy - 114), (fx - 18, fy - 96), (fx - 23, fy - 80)], [3.4, 2.8, 2.4])
    p.shade(arm_r, COAT)
    p.shade(p.poly([(fx - 27, fy - 82), (fx - 21, fy - 82), (fx - 20, fy - 76), (fx - 22, fy - 72), (fx - 26, fy - 74)]), SKIN)
    # (her far arm raised, the long fingers spread, and round her hand the words she has taken, wheeling)
    p.glow(fx + 44, fy - 148, 26, PINK[1], 0.26, bands=3)
    arm_l = p.curve_limb([(fx + lean + 17, fy - 114), (fx + 32, fy - 124), (fx + 40, fy - 140)], [3.4, 2.8, 2.2])
    p.shade(arm_l, COAT)
    for k in range(5):
        a = -2.2 + k * 0.32
        p.line((fx + 41, fy - 142), (fx + 41 + math.cos(a) * 8, fy - 142 + math.sin(a) * 8), SKIN[2])
        p.px(fx + 41 + math.cos(a) * 8.5, fy - 142 + math.sin(a) * 8.5, SKIN[3])
    p.shade(p.ellipse(fx + 41, fy - 141, 2.6, 2.6), SKIN)
    glyphs(p, fx + 44, fy - 150, 14, 22, [PINK[2], PINK[3], PINK[4]], seed=4)
    pink_edge(p, p.a > 0.9)


# ---------------------------------------------------------------------------------------------------------------------------
# 2. THE BOTTOM OF THE STAIR: what lives where the shaft's stair ends. A hulk built of the stair's own dressed stone, hunched like
# an ape on its knuckles, a flight of steps for a spine climbing its back, its head a broken doorway low between its shoulders, one
# eye burning in the dark of it; iron railings bent round its arms, balusters hanging off them.

def stairbeast(p, fx, fy):
    ST = [S[1], S[3], S[4], S[6]]
    IRONT = ramp((28, 24, 38), (110, 104, 124))
    # (its far arm, behind: knuckles down, the stone hand a fist of blocks)
    def arm(sx, back):
        top = (fx + sx * 34, fy - 112)
        elbow = (fx + sx * 60, fy - 76)
        hand = (fx + sx * 62, fy - 16)
        a = p.curve_limb([top, elbow, hand], [17 if not back else 15, 13, 11])
        p.shade(a, ST if not back else [S[0], S[2], S[3], S[4]])
        # (courses across the arm)
        for k in range(1, 6):
            y = top[1] + k * 16
            p.line((hand[0] - 13, y), (hand[0] + 13, y), INK)
        # (an iron railing bent round it, balusters hanging)
        p.line((top[0] + sx * 8, top[1] + 8), (elbow[0] + sx * 10, elbow[1]), IRONT[2], 2)
        p.line((elbow[0] + sx * 10, elbow[1]), (hand[0] + sx * 10, hand[1] - 12), IRONT[2], 2)
        for k in range(5):
            u = k / 5
            x = top[0] + sx * 8 + (elbow[0] - top[0] + sx * 2) * u
            y = top[1] + 8 + (elbow[1] - top[1] - 8) * u
            p.line((x, y), (x, y + 7), IRONT[1])
            p.px(x, y + 7, IRONT[3])
        # (the fist: blocks, knuckles on the floor)
        fist = p.poly([(hand[0] - 14, hand[1] - 6), (hand[0] + 14, hand[1] - 6), (hand[0] + 15, hand[1] + 12), (hand[0] + 6, hand[1] + 15), (hand[0] - 6, hand[1] + 15), (hand[0] - 15, hand[1] + 12)])
        p.shade(fist, ST)
        for j in (-5, 0, 5):
            p.line((hand[0] + j, hand[1] + 6), (hand[0] + j, hand[1] + 14), INK)
    arm(1, True)
    # (its legs: short, thick, bowed, folded under it)
    for sx in (-1, 1):
        leg = p.curve_limb([(fx + sx * 14, fy - 56), (fx + sx * 28, fy - 34), (fx + sx * 22, fy - 6)], [14, 12, 11])
        p.shade(leg, ST)
        p.line((fx + sx * 12, fy - 22), (fx + sx * 33, fy - 22), INK)
    # (its body: the hunched mass, a small hip, a vast chest and shoulders)
    body = p.poly([(fx - 18, fy - 50), (fx - 34, fy - 76), (fx - 50, fy - 108), (fx - 44, fy - 128), (fx - 26, fy - 140), (fx, fy - 146), (fx + 26, fy - 140), (fx + 44, fy - 128), (fx + 50, fy - 108), (fx + 36, fy - 76), (fx + 18, fy - 50), (fx, fy - 44)])
    p.shade(body, ST)
    # (its stones: dressed blocks in courses, the joints staggered)
    yy, xx = np.mgrid[0:p.h, 0:p.w]
    for k in range(9):
        y = fy - 54 - k * 10
        row = body & (np.abs(yy + 0.5 - y) < 0.5)
        p.fill(row, INK)
        off = (k % 2) * 7
        for x in range(int(fx - 52 + off), int(fx + 52), 14):
            for j in range(10):
                if body[int(y - j), x]:
                    p.px(x, y - j, INK)
    # (its spine: a flight of steps climbing up over its back to its shoulders, each a lit tread)
    for k in range(7):
        t = k / 6
        x = fx - 36 + t * 30
        y = fy - 108 - t * 38
        step = p.poly([(x - 9, y), (x + 9, y), (x + 9, y + 6), (x - 9, y + 6)])
        p.shade(step, [S[2], S[5], S[6], S[7]])
        p.line((x - 9, y), (x + 9, y), S[7])
    # (its near arm, in front)
    arm(-1, False)
    # (its head: a broken doorway, low and thrust forward between its shoulders; in its dark, one eye)
    hx, hy = fx + 6, fy - 112
    door = p.poly([(hx - 17, hy + 22), (hx - 17, hy - 6), (hx - 10, hy - 19), (hx, hy - 23), (hx + 8, hy - 20), (hx + 12, hy - 22), (hx + 17, hy - 8), (hx + 17, hy + 22)])
    p.shade(door, [S[3], S[5], S[6], S[7]])
    for k in range(5):
        a = math.pi * (1 + k / 4)
        p.line((hx + math.cos(a) * 11, hy + 2 + math.sin(a) * 15), (hx + math.cos(a) * 17, hy + 2 + math.sin(a) * 22), INK)
    dark = p.poly([(hx - 10, hy + 22), (hx - 10, hy - 2), (hx - 6, hy - 11), (hx, hy - 14), (hx + 6, hy - 11), (hx + 10, hy - 2), (hx + 10, hy + 22)])
    p.fill(dark, (8, 6, 16))
    p.glow(hx, hy + 1, 13, PINK[1], 0.4, bands=3)
    eye = p.ellipse(hx, hy + 1, 5.5, 3.2)
    p.fill(eye, PINK[2])
    p.fill(p.ellipse(hx, hy + 1, 2.4, 2.8), PINK[4])
    p.fill(p.ellipse(hx, hy + 1, 0.8, 2.8), (50, 0, 24))
    # (its jaw: the broken steps of a sill, like teeth)
    for j in range(-2, 3):
        p.fill(p.poly([(hx + j * 4 - 1.8, hy + 22), (hx + j * 4 + 1.8, hy + 22), (hx + j * 4 + 0.5, hy + 13)]), S[6])
    pink_edge(p, p.a > 0.9)


# ---------------------------------------------------------------------------------------------------------------------------
# 3. THE ERASURE: a tall blank of white paper and chalk, stooped, faceless but for one slit of pink; wrapped in pages that peel off
# it as it moves; one arm a great block raised high to wipe down, its wiping face smeared with the dark of what it has taken; the
# other arm hanging long, dripping pink ink. Where it passes, your words go dark.

def erasure(p, fx, fy):
    PAPER = ramp((120, 120, 140), (246, 246, 250))
    CHALK = ramp((100, 98, 116), (226, 224, 234))
    rng = np.random.default_rng(5)
    # (its legs: long, bent back like a heron's, ending in points: it stands on its tips)
    for sx, d in ((-1, 0), (1, 4)):
        leg = p.curve_limb([(fx + sx * 7, fy - 70), (fx + sx * 6 + 10, fy - 42), (fx + sx * 9 + d, fy - 2)], [7, 4.5, 1.2])
        p.shade(leg, CHALK)
    # (its body: stooped forward, a narrow core of chalk, and over it long sheets of paper hanging from its shoulders like a
    # torn cloak, their ends ragged, some lifting off it)
    core = p.curve_limb([(fx, fy - 70), (fx + 6, fy - 100), (fx + 16, fy - 124), (fx + 28, fy - 140)], [9, 11, 12, 9])
    p.shade(core, CHALK)
    sheets = []
    for k in range(11):
        u = (k - 5) / 5
        top = (fx + 20 + u * 14, fy - 140 + abs(u) * 6)
        bot = (fx + 2 + u * 20 + rng.uniform(-3, 3), fy - 62 - rng.uniform(0, 10) + abs(u) * 6)
        w0, w1 = 3.5, 5.5
        lift = rng.uniform(-4, 4)
        pts = [(top[0] - w0, top[1]), (top[0] + w0, top[1]), (bot[0] + w1 + lift, bot[1] - 2), (bot[0] + w1 * 0.3 + lift, bot[1] + 3), (bot[0] - w1 * 0.4 + lift, bot[1] - 1), (bot[0] - w1 + lift, bot[1] + 2)]
        sheets.append((-abs(u), pts))
    for _, pts in sorted(sheets, key=lambda l: l[0]):
        p.shade(p.poly(pts), PAPER)
        mx = (pts[0][0] + pts[5][0]) / 2
        for j in range(3):
            y = pts[0][1] + 14 + j * 16
            p.line((mx - 1 + j * 0.5, y), (mx + 1 + j * 0.5, y), PAPER[1])
    for k in range(7):
        x = fx - 30 + rng.uniform(0, 70)
        y = fy - 50 - rng.uniform(0, 110)
        if p.a[int(y), int(x)] < 0.5:
            pg = p.poly([(x, y), (x + 6, y - 2), (x + 8, y + 3), (x + 2, y + 6)])
            p.shade(pg, PAPER[1:])
    # (its head: hung forward on a long neck, a smooth blank, faceless but for one slit of pink)
    hx, hy = fx + 40, fy - 136
    neck = p.curve_limb([(fx + 28, fy - 140), (hx - 4, hy - 4)], [6, 4])
    p.shade(neck, CHALK)
    head = p.poly([(hx - 7, hy - 6), (hx - 2, hy - 13), (hx + 6, hy - 12), (hx + 10, hy - 4), (hx + 9, hy + 6), (hx + 3, hy + 11), (hx - 4, hy + 8)])
    p.shade(head, PAPER)
    p.glow(hx + 4, hy + 1, 9, PINK[2], 0.25, bands=2)
    p.line((hx - 1, hy + 2), (hx + 8, hy - 1), PINK[2])
    p.line((hx + 1, hy + 1), (hx + 6, hy - 0.5), PINK[4])
    # (its block arm raised high over its head, about to come down and wipe)
    arm = p.curve_limb([(fx + 10, fy - 128), (fx - 4, fy - 150), (fx + 6, fy - 172)], [6, 5, 4.5])
    p.shade(arm, CHALK)
    blk = p.poly([(fx - 16, fy - 196), (fx + 26, fy - 186), (fx + 22, fy - 164), (fx - 20, fy - 172)])
    side = p.poly([(fx - 20, fy - 172), (fx + 22, fy - 164), (fx + 21, fy - 158), (fx - 21, fy - 166)])
    p.shade(blk, ramp((150, 144, 160), (240, 236, 246)))
    p.ink(side)
    p.fill(side, (70, 46, 76))
    # (the dark of what it has taken, smeared on its wiping face, and a word in it going out)
    for k in range(5):
        p.line((fx - 18 + k * 8, fy - 166 + k * 1.5), (fx - 14 + k * 8, fy - 163 + k * 1.5), PINK[1])
    # (its other arm hanging long, the hand open, pink ink running off the fingers)
    arm2 = p.curve_limb([(fx + 20, fy - 128), (fx + 34, fy - 98), (fx + 36, fy - 68)], [5, 3.6, 2.6])
    p.shade(arm2, CHALK)
    for k in range(4):
        a = 1.25 + k * 0.22
        p.line((fx + 36, fy - 68), (fx + 36 + math.cos(a) * 10, fy - 68 + math.sin(a) * 10), CHALK[3])
    for dx, l in ((-2, 12), (1, 22), (4, 8), (6, 16)):
        for j in range(l):
            p.px(fx + 37 + dx, fy - 58 + j, PINK[1] if j < l - 3 else PINK[2])
        p.px(fx + 37 + dx, fy - 58 + l, PINK[3])
    p.fill(p.ellipse(fx + 40, fy - 2, 9, 2), PINK[0])
    p.fill(p.ellipse(fx + 40, fy - 2.5, 5, 1), PINK[1])
    # (words it has eaten, dark, drifting off it)
    glyphs(p, fx - 10, fy - 120, 9, 30, [(58, 40, 70), (80, 60, 92)], seed=9, squash=1.2)
    pink_edge(p, p.a > 0.9)


# ---------------------------------------------------------------------------------------------------------------------------
# 4. THE FOUR MADE ONE: the four bosses whose quarters you carried, come back as one: the Swamp Colossus's olive bulk, hunched,
# its great arm with pale suckers knuckled on the floor; the Moth's ash wings, torn, raised behind; the Censor's cracked white mask
# for a face, eyes burning through it; the Fleshmancer's fused-bone staff in its other fist, his plum rags on its shoulders.

def fourmade(p, fx, fy):
    OL = ramp((30, 34, 16), (124, 128, 66))
    ASH = ramp((30, 28, 36), (118, 112, 124))
    PLUM = ramp((44, 14, 40), (140, 64, 120))
    BONE = ramp((120, 100, 70), (244, 232, 196))
    MASKT = ramp((140, 138, 150), (250, 250, 252))
    SUCK = ramp((150, 146, 110), (238, 234, 204))
    rng = np.random.default_rng(13)
    # (the Moth's wings raised behind, torn, an eye on each, shut)
    for sx in (-1, 1):
        pts = [(fx + sx * 8, fy - 124), (fx + sx * 34, fy - 182), (fx + sx * 52, fy - 194), (fx + sx * 76, fy - 180), (fx + sx * 70, fy - 160), (fx + sx * 80, fy - 146), (fx + sx * 62, fy - 130), (fx + sx * 72, fy - 104), (fx + sx * 54, fy - 92), (fx + sx * 46, fy - 100), (fx + sx * 22, fy - 104)]
        wing = p.poly(pts)
        p.shade(wing, ASH)
        for k in range(4):
            p.line((fx + sx * 12, fy - 122), (fx + sx * (48 + k * 9), fy - (186 - k * 22)), ASH[0])
        # (tears in it)
        for k in range(3):
            x = fx + sx * (40 + k * 10)
            y = fy - 150 + k * 14
            p.fill(p.poly([(x, y), (x + sx * 4, y - 2), (x + sx * 2, y + 4)]), (0, 0, 0), 0)
        p.shade(p.ellipse(fx + sx * 52, fy - 156, 9, 5.5), [ASH[1], ASH[2], ASH[3], (150, 144, 156)])
        p.line((fx + sx * 45, fy - 156), (fx + sx * 59, fy - 156), INK)
    # (its legs: short, thick, bowed under the weight)
    for sx in (-1, 1):
        leg = p.curve_limb([(fx + sx * 14, fy - 58), (fx + sx * 26, fy - 32), (fx + sx * 20, fy - 6)], [13, 11, 10])
        p.shade(leg, OL)
    # (its body: the Colossus's bulk, hunched forward, a swollen chest)
    body = p.poly([(fx - 24, fy - 52), (fx - 36, fy - 86), (fx - 34, fy - 116), (fx - 18, fy - 132), (fx + 6, fy - 136), (fx + 30, fy - 128), (fx + 42, fy - 108), (fx + 38, fy - 76), (fx + 24, fy - 52), (fx, fy - 46)])
    p.shade(body, OL)
    # (its belly's folds, a swamp thing's)
    for k in range(3):
        p.line((fx - 16, fy - 66 - k * 8), (fx + 18, fy - 64 - k * 8), OL[0])
    # (the Fleshmancer's plum rags on its shoulders, hanging in tatters)
    rags = p.poly([(fx - 34, fy - 112), (fx - 20, fy - 132), (fx + 28, fy - 130), (fx + 40, fy - 110), (fx + 30, fy - 92), (fx + 24, fy - 102), (fx + 16, fy - 88), (fx + 8, fy - 100), (fx - 2, fy - 86), (fx - 10, fy - 100), (fx - 20, fy - 90), (fx - 26, fy - 102)])
    p.shade(rags, PLUM)
    # (its great arm, the Colossus's, hanging to the floor, knuckles down, its pale suckers in a row)
    arm = p.curve_limb([(fx + 34, fy - 118), (fx + 54, fy - 88), (fx + 58, fy - 50), (fx + 54, fy - 16)], [12, 11, 9, 8])
    p.shade(arm, OL)
    for k in range(6):
        p.shade(p.ellipse(fx + 48 + k * 1.4, fy - 96 + k * 13, 2.6, 2.0), SUCK)
        p.px(fx + 48 + k * 1.4, fy - 96 + k * 13, (90, 84, 60))
    fist = p.poly([(fx + 42, fy - 22), (fx + 66, fy - 22), (fx + 68, fy - 6), (fx + 58, fy - 2), (fx + 46, fy - 2), (fx + 40, fy - 8)])
    p.shade(fist, OL)
    # (its other arm, raised, the bone staff gripped, a burnt skull at its head with pink in its sockets)
    staff = p.poly([(fx - 52, fy - 168), (fx - 47, fy - 168), (fx - 40, fy - 2), (fx - 45, fy - 2)])
    p.shade(staff, BONE)
    for k in range(13):
        p.line((fx - 51 + k * 0.55, fy - 158 + k * 12.5), (fx - 46 + k * 0.55, fy - 156 + k * 12.5), BONE[0])
    arm2 = p.curve_limb([(fx - 30, fy - 118), (fx - 48, fy - 104), (fx - 50, fy - 84)], [10, 9, 8])
    p.shade(arm2, OL)
    p.shade(p.ellipse(fx - 48, fy - 84, 7, 6), OL)
    from emblems import skull
    skull(p, fx - 50, fy - 174, 1.3)
    p.glow(fx - 50, fy - 175, 9, PINK[1], 0.3, bands=2)
    p.px(fx - 52.5, fy - 175, PINK[3])
    p.px(fx - 47.5, fy - 175, PINK[3])
    # (its head: low between its shoulders, the Censor's white mask for a face, cracked across, its eyes burning through)
    hx, hy = fx + 4, fy - 128
    head = p.ellipse(hx, hy - 4, 13, 12)
    p.shade(head, OL)
    mask = p.poly([(hx - 10, hy - 16), (hx + 10, hy - 16), (hx + 11, hy - 4), (hx + 7, hy + 6), (hx, hy + 10), (hx - 7, hy + 6), (hx - 11, hy - 4)])
    p.shade(mask, MASKT)
    p.glow(hx, hy - 6, 12, PINK[2], 0.28, bands=2)
    for sx in (-1, 1):
        p.line((hx + sx * 2.5, hy - 6), (hx + sx * 7.5, hy - 8), PINK[3])
        p.px(hx + sx * 5, hy - 7, PINK[4])
    p.line((hx + 3, hy - 16), (hx + 1, hy - 9), INK)
    p.line((hx + 1, hy - 9), (hx + 4, hy + 0), INK)
    p.line((hx + 4, hy + 0), (hx + 2, hy + 6), INK)
    p.line((hx - 3, hy + 3), (hx + 3, hy + 3), INK)
    # (the Moth's feelers rising from its brow)
    for sx in (-1, 1):
        for k in range(8):
            x = hx + sx * (3 + k * 1.6)
            y = hy - 16 - k * 3
            p.px(x, y, ASH[3])
            p.px(x + sx, y + 1, ASH[1])
    pink_edge(p, p.a > 0.9)


TAKES = [
    ('1: THE HEAD LIBRARIAN', 'The witch of the story, who hexed the kid in detention, waiting at the very bottom. Gaunt and tall, glasses burning pink, her gown hanging in leaves of pages. She fights with the words she has taken from you.', librarian, (150, 200)),
    ('2: THE BOTTOM OF THE STAIR', 'What lives where the shaft’s stair ends: a hulk built of the stair’s own stone, hunched on its knuckles, a flight of steps for a spine, a broken doorway for a head with one eye in its dark.', stairbeast, (170, 200)),
    ('3: THE ERASURE', 'A stooped blank of white paper and chalk, faceless but for one pink slit. One arm is a great block raised to wipe; where it passes, your words go dark.', erasure, (150, 210)),
    ('4: THE FOUR MADE ONE', 'The four bosses whose quarters you carried, back as one: the Colossus’s bulk and arm, the Moth’s wings, the Censor’s mask for a face, the Fleshmancer’s staff.', fourmade, (180, 210)),
]


def boss_panel(take, brawler):
    name, words, fn, (w, h) = take
    p = Pic(w + 50, h)
    fn(p, int(w * 0.52), h - 4)
    # (the Brawler beside it, as he stands in the game)
    p.paste(brawler, w + 2, h - brawler.height - 1)
    return p
