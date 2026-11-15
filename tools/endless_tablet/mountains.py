"""THE WARPED WORDSMITH'S MOUNT, FROM THE COLD MOUNTAINS. His pick, 12 Nov 2026: the order of wordsmiths comes from a cold mountain
monastery in the north (“Cold mountain is good, but save all these for further quests and acts where you have to visit temples in all
these regions”), and “What he rides is kinda dictated by where they’re from”. Three beasts of the high cold, each warped as he is: his
runes branded into it, burning pink. Rough, the rider the same, beside the Brawler."""
import math
import numpy as np
from kit import Pic, S, INK, PINK, dilate, erode, shift
from bosses import pink_edge, ramp
import beasts
from rider import rider, rune_scar, LEATHER, IRON


def shaggy(p, m, tones, seed=1, long=8, hang=True):
    """A coat of long hair over a shape: the shape lit, then strands down it, and locks hanging off its lower edge."""
    rng = np.random.default_rng(seed)
    p.shade(m, tones)
    ys, xs = np.where(m)
    if len(xs) == 0:
        return
    # (strands down it, a tone darker and a tone lighter)
    for _ in range(len(xs) // 14):
        i = rng.integers(0, len(xs))
        x, y = xs[i], ys[i]
        l = rng.integers(3, long)
        c = tones[max(0, min(len(tones) - 1, (1 if rng.random() < 0.6 else 2) + (0 if y > ys.mean() else 1)))]
        for j in range(l):
            if m[min(p.h - 1, y + j), x]:
                p.px(x + (j // 3) * (1 if i % 2 else 0), y + j, c)
    if hang:
        # (locks hanging off its lower edge)
        bottom = m & ~shift(m, 0, -1)
        bys, bxs = np.where(bottom)
        for k in range(0, len(bxs), 3):
            x, y = bxs[k], bys[k]
            l = rng.integers(2, long)
            for j in range(l):
                p.px(x, y + j, tones[0] if j > l - 2 else tones[1])
            p.px(x, y + l, INK)


# ---------------------------------------------------------------------------------------------------------------------------
# A: THE GREAT RAM OF THE HEIGHTS: a beast like a mountain ram grown huge, its wool to the ground, matted with frost; its horns curl
# round twice, his runes cut down them burning; patches of its wool burnt away where he branded it.

def ram(p, fx, fy):
    WOOL = ramp((84, 80, 92), (226, 224, 230))
    WOOLF = ramp((54, 50, 62), (150, 146, 156))
    HORN = ramp((70, 60, 50), (210, 196, 170))
    HOOF = ramp((24, 22, 30), (90, 86, 98))
    # (far legs, short under the wool)
    for x in (fx - 44, fx + 38):
        beasts.leg(p, [(x, fy - 40), (x + 2, fy - 18), (x, fy - 6)], [9, 7, 6], ramp((40, 36, 44), (110, 104, 114)))
        p.shade(p.poly([(x - 7, fy - 8), (x + 7, fy - 8), (x + 8, fy - 1), (x - 8, fy - 1)]), HOOF)
    # (its body: a deep shaggy barrel, the shoulders humped high)
    body = p.poly([(fx - 70, fy - 40), (fx - 76, fy - 74), (fx - 60, fy - 98), (fx - 20, fy - 104), (fx + 20, fy - 116), (fx + 44, fy - 110), (fx + 58, fy - 86), (fx + 56, fy - 50), (fx + 40, fy - 30), (fx - 60, fy - 28)])
    shaggy(p, body, WOOL, seed=3, long=10)
    # (where he branded it: a patch of wool burnt off, the hide ashen and cut with a rune)
    burn = p.ellipse(fx - 30, fy - 72, 10, 8)
    p.fill(burn & body, ramp((60, 50, 64), (150, 136, 150))[1])
    rune_scar(p, [(fx - 30, fy - 80), (fx - 30, fy - 64)])
    rune_scar(p, [(fx - 34, fy - 76), (fx - 30, fy - 72), (fx - 26, fy - 76)])
    # (near legs, with hooves split)
    for x in (fx - 30, fx + 46):
        beasts.leg(p, [(x, fy - 36), (x + 2, fy - 18), (x, fy - 6)], [10, 8, 7], ramp((60, 54, 64), (150, 142, 152)))
        p.shade(p.poly([(x - 8, fy - 8), (x + 8, fy - 8), (x + 9, fy - 1), (x + 1, fy - 1), (x, fy - 4), (x - 1, fy - 1), (x - 9, fy - 1)]), HOOF)
    # (its saddle: a frame of iron and old leather, his order's cloth hanging from it, teal gone violet)
    p.shade(p.poly([(fx - 14, fy - 108), (fx + 18, fy - 116), (fx + 22, fy - 100), (fx - 12, fy - 92)]), ramp((30, 18, 40), (100, 70, 120)))
    p.shade(p.poly([(fx - 10, fy - 114), (fx + 14, fy - 120), (fx + 16, fy - 110), (fx - 8, fy - 104)]), LEATHER)
    # (its head: long, low, a heavy brow and a muzzle like a sheep's, a beard of wool under its jaw; eyes slit and burning)
    hx, hy = fx + 74, fy - 84
    neck = p.poly([(fx + 40, fy - 112), (fx + 62, fy - 100), (fx + 66, fy - 70), (fx + 46, fy - 60)])
    shaggy(p, neck, WOOL, seed=5, long=8, hang=False)
    head = p.poly([(hx - 12, hy - 14), (hx + 6, hy - 14), (hx + 18, hy - 2), (hx + 20, hy + 8), (hx + 12, hy + 14), (hx - 2, hy + 12), (hx - 12, hy + 2)])
    p.shade(head, ramp((70, 64, 74), (196, 190, 196)))
    beard = p.poly([(hx - 2, hy + 10), (hx + 12, hy + 12), (hx + 6, hy + 26), (hx + 2, hy + 20)])
    shaggy(p, beard, WOOL, seed=7, long=6)
    p.line((hx + 4, hy - 6), (hx + 10, hy - 5), PINK[3])
    p.px(hx + 7, hy - 5.5, PINK[4])
    p.glow(hx + 7, hy - 5, 9, PINK[2], 0.26, bands=2)
    # (its horns: curled round twice, ridged, his runes cut down them burning)
    for k, (cx, cy, r0, sc) in enumerate(((hx - 6, hy - 10, 21, 1.0),)):
        pts, radii = [], []
        for j in range(22):
            t = j / 21
            a = -0.6 - t * 2 * math.pi * 1.15
            r = r0 * (1 - 0.62 * t)
            pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r * 0.9))
            radii.append(8 * (1 - 0.7 * t) + 1.2)
        horn = p.curve_limb(pts, radii, steps=90)
        p.shade(horn, HORN)
        for j in range(2, 20, 2):
            a, b = pts[j], pts[j + 1]
            p.line(a, b, HORN[0])
        for j in (4, 9, 14):
            x, y = pts[j]
            rune_scar(p, [(x - 2, y - 2), (x + 2, y + 2)], PINK[3])


# ---------------------------------------------------------------------------------------------------------------------------
# B: THE WHITE BEAR OF THE PASS: a cave bear grown huge, its white fur gone grey and torn; an iron collar and a muzzle of iron, the
# chain of its reins in his fist; his runes branded down its flank, burning.

def bear(p, fx, fy):
    FUR = ramp((80, 78, 92), (218, 216, 224))
    FURF = ramp((50, 48, 60), (140, 138, 150))
    CLAW = ramp((40, 36, 40), (180, 170, 160))
    # (far legs: thick pillars of fur)
    beasts.leg(p, [(fx - 52, fy - 54), (fx - 56, fy - 26), (fx - 52, fy - 6)], [16, 13, 12], FURF)
    beasts.leg(p, [(fx + 30, fy - 56), (fx + 40, fy - 28), (fx + 38, fy - 6)], [15, 12, 11], FURF)
    # (its body: the huge hump of a bear's shoulders, the back falling to the rump)
    body = p.poly([(fx - 74, fy - 44), (fx - 80, fy - 74), (fx - 64, fy - 98), (fx - 26, fy - 108), (fx + 12, fy - 128), (fx + 40, fy - 124), (fx + 58, fy - 98), (fx + 56, fy - 62), (fx + 40, fy - 40), (fx - 50, fy - 36)])
    shaggy(p, body, FUR, seed=9, long=7)
    # (his runes branded down its flank, the fur burnt round them)
    for k in range(3):
        x0, y0 = fx - 48 + k * 22, fy - 84 + k * 2
        p.fill(p.ellipse(x0, y0 + 6, 6, 9) & body, ramp((60, 50, 64), (150, 136, 150))[1])
        rune_scar(p, [(x0, y0), (x0, y0 + 12)])
        rune_scar(p, [(x0 - 3, y0 + 2), (x0 + 3, y0 + 6)])
    # (near legs: the claws long and black)
    for x0 in (fx - 34, fx + 48):
        beasts.leg(p, [(x0, fy - 52), (x0 + 4, fy - 26), (x0, fy - 8)], [16, 13, 12], FUR)
        for j in range(4):
            p.line((x0 - 6 + j * 4, fy - 4), (x0 - 4 + j * 4 + 3, fy - 1), CLAW[3])
    # (the saddle)
    p.shade(p.poly([(fx - 12, fy - 118), (fx + 22, fy - 128), (fx + 26, fy - 112), (fx - 10, fy - 104)]), ramp((30, 18, 40), (100, 70, 120)))
    p.shade(p.poly([(fx - 8, fy - 124), (fx + 16, fy - 132), (fx + 18, fy - 122), (fx - 6, fy - 114)]), LEATHER)
    # (its head: broad, low, thrust out; small ears; an iron muzzle over its jaws, a collar, the chain of its reins)
    hx, hy = fx + 76, fy - 82
    neck = p.poly([(fx + 36, fy - 122), (fx + 64, fy - 100), (fx + 68, fy - 66), (fx + 48, fy - 56)])
    shaggy(p, neck, FUR, seed=11, long=6, hang=False)
    head = p.poly([(hx - 16, hy - 14), (hx + 2, hy - 18), (hx + 16, hy - 8), (hx + 26, hy - 2), (hx + 26, hy + 8), (hx + 10, hy + 14), (hx - 12, hy + 10)])
    shaggy(p, head, FUR, seed=13, long=4, hang=False)
    for ex in (hx - 10, hx - 2):
        p.shade(p.ellipse(ex, hy - 17, 4, 4), FUR)
    muzzle = p.poly([(hx + 8, hy - 4), (hx + 27, hy - 2), (hx + 27, hy + 9), (hx + 8, hy + 12)])
    p.fill(dilate(muzzle, 1) & ~muzzle, INK)
    for j in range(5):
        p.line((hx + 9 + j * 4, hy - 3), (hx + 9 + j * 4, hy + 11), IRON[2])
    p.line((hx + 8, hy + 3), (hx + 27, hy + 3), IRON[3])
    p.line((fx + 50, fy - 112), (fx + 66, fy - 64), IRON[2], 3)
    p.line((hx + 2, hy - 8), (hx + 7, hy - 9), PINK[3])
    p.px(hx + 4, hy - 8.5, PINK[4])
    p.glow(hx + 4, hy - 8, 9, PINK[2], 0.26, bands=2)
    for k in range(10):
        u = k / 9
        p.px(hx + 6 + (fx + 40 - hx - 6) * u, hy + 2 + (fy - 150 - hy - 2) * u * 0.7 + math.sin(u * 3.1) * 5, IRON[3])


# ---------------------------------------------------------------------------------------------------------------------------
# C: THE WOOLLY TUSKER OF THE GLACIER: a great shaggy beast like a tusked elephant of the ice, its tusks long and curved and cut with
# his runes, burning; its trunk raised; he rides high on its neck.

def tusker(p, fx, fy):
    COAT = ramp((54, 40, 36), (170, 140, 116))
    COATF = ramp((36, 26, 24), (110, 88, 76))
    TUSK = ramp((150, 140, 120), (246, 240, 224))
    # (far legs: pillars of shag)
    for x in (fx - 50, fx + 34):
        leg = p.curve_limb([(x, fy - 56), (x, fy - 30), (x, fy - 4)], [14, 13, 14])
        shaggy(p, leg, COATF, seed=17, long=6, hang=False)
    # (its body: a high domed back, sloping down to the rump, the coat hanging long)
    body = p.poly([(fx - 72, fy - 44), (fx - 78, fy - 80), (fx - 60, fy - 108), (fx - 20, fy - 124), (fx + 20, fy - 132), (fx + 46, fy - 122), (fx + 58, fy - 96), (fx + 54, fy - 58), (fx + 38, fy - 40), (fx - 50, fy - 36)])
    shaggy(p, body, COAT, seed=19, long=12)
    # (a rune branded on its flank, the coat burnt round it)
    p.fill(p.ellipse(fx - 26, fy - 84, 10, 12) & body, ramp((60, 46, 50), (150, 126, 120))[1])
    rune_scar(p, [(fx - 26, fy - 94), (fx - 26, fy - 74)])
    rune_scar(p, [(fx - 31, fy - 90), (fx - 26, fy - 84), (fx - 21, fy - 90)])
    rune_scar(p, [(fx - 30, fy - 78), (fx - 22, fy - 78)])
    # (near legs)
    for x in (fx - 34, fx + 48):
        leg = p.curve_limb([(x, fy - 56), (x + 2, fy - 30), (x, fy - 4)], [15, 14, 15])
        shaggy(p, leg, COAT, seed=21, long=7, hang=False)
        for j in range(3):
            p.shade(p.ellipse(x - 6 + j * 6, fy - 2, 3, 2), ramp((60, 54, 50), (170, 160, 150)))
    # (its saddle, high on its back)
    p.shade(p.poly([(fx - 4, fy - 124), (fx + 30, fy - 134), (fx + 34, fy - 118), (fx - 2, fy - 110)]), ramp((30, 18, 40), (100, 70, 120)))
    p.shade(p.poly([(fx + 0, fy - 130), (fx + 24, fy - 138), (fx + 26, fy - 128), (fx + 2, fy - 120)]), LEATHER)
    # (its head: a high dome, small ears, eyes small and burning; its trunk raised in a curl)
    hx, hy = fx + 70, fy - 96
    head = p.poly([(hx - 22, hy - 22), (hx - 4, hy - 30), (hx + 12, hy - 22), (hx + 16, hy - 4), (hx + 10, hy + 14), (hx - 12, hy + 12), (hx - 24, hy - 2)])
    shaggy(p, head, COAT, seed=23, long=6, hang=False)
    p.line((hx - 2, hy - 10), (hx + 4, hy - 11), PINK[3])
    p.px(hx + 1, hy - 10.5, PINK[4])
    p.glow(hx + 1, hy - 10, 9, PINK[2], 0.26, bands=2)
    trunk = p.curve_limb([(hx + 8, hy + 4), (hx + 20, hy + 20), (hx + 30, hy + 18), (hx + 36, hy + 4), (hx + 32, hy - 6)], [7, 6, 5, 4, 3])
    p.shade(trunk, COAT)
    for j in range(8):
        u = j / 7
        p.line((hx + 10 + u * 22, hy + 6 + math.sin(u * 3) * 14), (hx + 13 + u * 22, hy + 6 + math.sin(u * 3) * 14), COAT[0])
    # (its tusks: long, curving out and up, cut with his runes, burning)
    for k, (dx, sc) in enumerate(((0, 1.0), (-6, 0.86))):
        pts = [(hx + 6 + dx, hy + 8), (hx + 26 + dx, hy + 28), (hx + 50 + dx * 1.5, hy + 26), (hx + 62 + dx * 1.5, hy + 8)]
        tusk = p.curve_limb(pts, [5 * sc, 4.5 * sc, 3.5 * sc, 1.2 * sc])
        p.shade(tusk, TUSK if k == 0 else ramp((110, 102, 90), (200, 194, 180)))
        if k == 0:
            for j in (1, 2):
                x, y = pts[j]
                rune_scar(p, [(x - 2, y - 3), (x + 2, y + 3)], PINK[3])
                rune_scar(p, [(x - 3, y + 1), (x + 3, y - 1)], PINK[2])


TAKES = [
    ('A: THE GREAT RAM OF THE HEIGHTS', 'A mountain ram grown huge, its wool to the ground and matted with frost. Its horns curl round twice, cut with his runes, and the wool is burnt away where he branded it.', ram, (2, -112)),
    ('B: THE WHITE BEAR OF THE PASS', 'A cave bear grown huge, its white fur gone grey and torn. It wears an iron collar and an iron muzzle, the chain of its reins is in his fist, and his runes are branded down its flank.', bear, (6, -124)),
    ('C: THE GLACIER TUSKER', 'A great shaggy tusked beast of the ice, its trunk raised and its long tusks cut with his runes. He rides high on its back.', tusker, (14, -132)),
]


def mount_panel(take, brawler, w=260, h=270):
    name, words, mount, (ox, oy) = take
    p = Pic(w + 50, h)
    fx, fy = int(w * 0.42), h - 4
    mount(p, fx, fy)
    edge_mount = p.a > 0.9
    rider(p, fx + ox, fy + oy)
    pink_edge(p, p.a > 0.9)
    p.paste(brawler, w + 4, h - brawler.height - 1)
    return p


# ---------------------------------------------------------------------------------------------------------------------------
# HIS PICK, 12 Nov 2026: “Gimme a mix of a and c”. Two ways to mix the great ram and the glacier tusker.

def ram_horns(p, cx, cy, r0=22, w=8.5, flip=1):
    HORN = ramp((70, 60, 50), (210, 196, 170))
    pts, radii = [], []
    for j in range(24):
        t = j / 23
        a = -0.6 - t * 2 * math.pi * 1.15
        r = r0 * (1 - 0.62 * t)
        pts.append((cx + flip * math.cos(a) * r, cy + math.sin(a) * r * 0.9))
        radii.append(w * (1 - 0.7 * t) + 1.2)
    horn = p.curve_limb(pts, radii, steps=100)
    p.shade(horn, HORN)
    for j in range(2, 22, 2):
        p.line(pts[j], pts[j + 1], HORN[0])
    for j in (4, 9, 14):
        x, y = pts[j]
        rune_scar(p, [(x - 2, y - 2), (x + 2, y + 2)], PINK[3])


def mix_tusker_wool(p, fx, fy):
    """MIX 1: the tusker's bulk, trunk and tusks, in the ram's pale frosted wool, with the ram's horns curled twice on its brow."""
    WOOL = ramp((84, 80, 92), (226, 224, 230))
    WOOLF = ramp((54, 50, 62), (150, 146, 156))
    TUSK = ramp((150, 140, 120), (246, 240, 224))
    for x in (fx - 50, fx + 34):
        leg = p.curve_limb([(x, fy - 56), (x, fy - 30), (x, fy - 4)], [14, 13, 14])
        shaggy(p, leg, WOOLF, seed=17, long=6, hang=False)
    body = p.poly([(fx - 72, fy - 44), (fx - 78, fy - 80), (fx - 60, fy - 108), (fx - 20, fy - 124), (fx + 20, fy - 132), (fx + 46, fy - 122), (fx + 58, fy - 96), (fx + 54, fy - 58), (fx + 38, fy - 40), (fx - 50, fy - 36)])
    shaggy(p, body, WOOL, seed=19, long=12)
    p.fill(p.ellipse(fx - 26, fy - 84, 10, 12) & body, ramp((60, 50, 64), (150, 136, 150))[1])
    rune_scar(p, [(fx - 26, fy - 94), (fx - 26, fy - 74)])
    rune_scar(p, [(fx - 31, fy - 90), (fx - 26, fy - 84), (fx - 21, fy - 90)])
    for x in (fx - 34, fx + 48):
        leg = p.curve_limb([(x, fy - 56), (x + 2, fy - 30), (x, fy - 4)], [15, 14, 15])
        shaggy(p, leg, WOOL, seed=21, long=7, hang=False)
        for j in range(3):
            p.shade(p.ellipse(x - 6 + j * 6, fy - 2, 3, 2), ramp((60, 54, 50), (170, 160, 150)))
    p.shade(p.poly([(fx - 4, fy - 124), (fx + 30, fy - 134), (fx + 34, fy - 118), (fx - 2, fy - 110)]), ramp((30, 18, 40), (100, 70, 120)))
    p.shade(p.poly([(fx + 0, fy - 130), (fx + 24, fy - 138), (fx + 26, fy - 128), (fx + 2, fy - 120)]), LEATHER)
    hx, hy = fx + 70, fy - 96
    head = p.poly([(hx - 22, hy - 22), (hx - 4, hy - 30), (hx + 12, hy - 22), (hx + 16, hy - 4), (hx + 10, hy + 14), (hx - 12, hy + 12), (hx - 24, hy - 2)])
    shaggy(p, head, WOOL, seed=23, long=6, hang=False)
    trunk = p.curve_limb([(hx + 8, hy + 4), (hx + 20, hy + 20), (hx + 30, hy + 18), (hx + 36, hy + 4), (hx + 32, hy - 6)], [7, 6, 5, 4, 3])
    p.shade(trunk, ramp((70, 64, 74), (196, 190, 196)))
    for j in range(8):
        u = j / 7
        p.line((hx + 10 + u * 22, hy + 6 + math.sin(u * 3) * 14), (hx + 13 + u * 22, hy + 6 + math.sin(u * 3) * 14), (70, 64, 74))
    for k, (dx, sc) in enumerate(((0, 1.0), (-6, 0.86))):
        pts = [(hx + 6 + dx, hy + 8), (hx + 26 + dx, hy + 28), (hx + 50 + dx * 1.5, hy + 26), (hx + 62 + dx * 1.5, hy + 8)]
        tusk = p.curve_limb(pts, [5 * sc, 4.5 * sc, 3.5 * sc, 1.2 * sc])
        p.shade(tusk, TUSK if k == 0 else ramp((110, 102, 90), (200, 194, 180)))
    ram_horns(p, hx - 8, hy - 14, r0=20, w=8)
    p.line((hx - 2, hy - 8), (hx + 4, hy - 9), PINK[3])
    p.px(hx + 1, hy - 8.5, PINK[4])
    p.glow(hx + 1, hy - 8, 9, PINK[2], 0.26, bands=2)


def mix_ram_tusked(p, fx, fy):
    """MIX 2: the ram grown to the tusker's size, its wool to the ground, its horns curled twice, and tusks curving up out of its
    jaw."""
    ram(p, fx, fy)
    hx, hy = fx + 74, fy - 84
    TUSK = ramp((150, 140, 120), (246, 240, 224))
    for k, (dx, sc) in enumerate(((0, 1.0), (-5, 0.85))):
        pts = [(hx + 8 + dx, hy + 8), (hx + 24 + dx, hy + 22), (hx + 38 + dx, hy + 16), (hx + 44 + dx, hy + 0)]
        tusk = p.curve_limb(pts, [4 * sc, 3.6 * sc, 2.6 * sc, 1 * sc])
        p.shade(tusk, TUSK if k == 0 else ramp((110, 102, 90), (200, 194, 180)))
        if k == 0:
            x, y = pts[2]
            rune_scar(p, [(x - 2, y - 2), (x + 2, y + 2)], PINK[3])


MIXES = [
    ('MIX 1: THE TUSKER IN THE RAM’S WOOL', 'The tusker’s bulk, trunk and tusks, in the ram’s pale frosted wool, with the ram’s horns curled twice on its brow.', mix_tusker_wool, (14, -132)),
    ('MIX 2: THE RAM WITH TUSKS', 'The ram grown to the tusker’s size: its wool to the ground, its horns curled twice, and tusks curving up out of its jaw.', mix_ram_tusked, (2, -112)),
]


# ---------------------------------------------------------------------------------------------------------------------------
# HIS WORDS, 12 Nov 2026: “Maybe a big wooly boar would kinda satisfy the mix of the two”. THE GREAT WOOLLY BOAR of the heights: a
# boar grown huge, high at the shoulders, its wool long and pale and matted with frost (the ram's), a bristled crest down its spine,
# tusks curving up out of its jaw and cut with his runes (the tusker's), a heavy snout, small eyes burning; short thick legs, cloven
# hooves. With the ram's horns curled on its brow, or without.

def boar(p, fx, fy, horns=False):
    WOOL = ramp((84, 80, 92), (226, 224, 230))
    WOOLF = ramp((54, 50, 62), (150, 146, 156))
    HIDE = ramp((60, 50, 58), (176, 160, 160))
    TUSK = ramp((150, 140, 120), (246, 240, 224))
    HOOF = ramp((24, 22, 30), (90, 86, 98))
    # (far legs: short and thick)
    for x in (fx - 46, fx + 34):
        leg = p.curve_limb([(x, fy - 44), (x + 2, fy - 22), (x, fy - 8)], [13, 10, 9])
        shaggy(p, leg, WOOLF, seed=31, long=5, hang=False)
        p.shade(p.poly([(x - 8, fy - 9), (x + 8, fy - 9), (x + 9, fy - 1), (x + 1, fy - 1), (x, fy - 4), (x - 1, fy - 1), (x - 9, fy - 1)]), HOOF)
    # (its body: a wedge, huge and high at the shoulders, falling away to a small rump; the wool long)
    body = p.poly([(fx - 72, fy - 40), (fx - 78, fy - 64), (fx - 66, fy - 84), (fx - 34, fy - 98), (fx + 4, fy - 118), (fx + 34, fy - 130), (fx + 54, fy - 116), (fx + 64, fy - 86), (fx + 60, fy - 52), (fx + 44, fy - 32), (fx - 56, fy - 28)])
    shaggy(p, body, WOOL, seed=33, long=12)
    # (the crest: bristles standing up along its spine, dark)
    for k in range(18):
        t = k / 17
        x = fx - 60 + t * 104
        y = fy - 88 - t * 40 if t < 0.86 else fy - 124 + (t - 0.86) * 60
        l = 5 + 5 * math.sin(t * math.pi)
        p.line((x, y), (x - 2, y - l), WOOLF[0])
        p.line((x + 1, y), (x - 1, y - l + 1), WOOLF[1])
    # (where he branded it: two runes on its flank, the wool burnt off round them)
    for (rx, ry) in ((fx - 34, fy - 72), (fx - 10, fy - 80)):
        p.fill(p.ellipse(rx, ry, 8, 10) & body, ramp((60, 50, 64), (150, 136, 150))[1])
        rune_scar(p, [(rx, ry - 8), (rx, ry + 8)])
        rune_scar(p, [(rx - 4, ry - 4), (rx, ry), (rx + 4, ry - 4)])
    # (near legs)
    for x in (fx - 30, fx + 50):
        leg = p.curve_limb([(x, fy - 42), (x + 2, fy - 22), (x, fy - 8)], [14, 11, 10])
        shaggy(p, leg, WOOL, seed=35, long=6, hang=False)
        p.shade(p.poly([(x - 9, fy - 9), (x + 9, fy - 9), (x + 10, fy - 1), (x + 1, fy - 1), (x, fy - 4), (x - 1, fy - 1), (x - 10, fy - 1)]), HOOF)
    # (the saddle, high on the hump)
    p.shade(p.poly([(fx + 2, fy - 118), (fx + 34, fy - 132), (fx + 38, fy - 116), (fx + 4, fy - 104)]), ramp((30, 18, 40), (100, 70, 120)))
    p.shade(p.poly([(fx + 6, fy - 124), (fx + 28, fy - 134), (fx + 30, fy - 124), (fx + 8, fy - 114)]), LEATHER)
    # (its head: low and long, a heavy snout, the wool thinning to bristled hide; small eyes burning)
    hx, hy = fx + 80, fy - 66
    head = p.poly([(hx - 22, hy - 28), (hx - 2, hy - 24), (hx + 16, hy - 10), (hx + 28, hy - 2), (hx + 30, hy + 10), (hx + 20, hy + 16), (hx - 4, hy + 14), (hx - 20, hy + 4)])
    shaggy(p, head, HIDE, seed=37, long=4, hang=False)
    snout = p.ellipse(hx + 28, hy + 4, 5, 7)
    p.shade(snout, ramp((90, 70, 80), (200, 170, 176)))
    p.fill(p.ellipse(hx + 29, hy + 2, 1.2, 1.6), INK)
    p.fill(p.ellipse(hx + 29, hy + 7, 1.2, 1.6), INK)
    p.line((hx + 4, hy - 12), (hx + 10, hy - 10), PINK[3])
    p.px(hx + 7, hy - 11, PINK[4])
    p.glow(hx + 7, hy - 11, 10, PINK[2], 0.28, bands=2)
    # (its tusks: out of the jaw, curving up and back, cut with his runes)
    for k, (dx, sc) in enumerate(((0, 1.0), (-7, 0.85))):
        pts = [(hx + 14 + dx, hy + 12), (hx + 26 + dx, hy + 16), (hx + 36 + dx, hy + 4), (hx + 34 + dx, hy - 12)]
        tusk = p.curve_limb(pts, [4.5 * sc, 4 * sc, 3 * sc, 1 * sc])
        p.shade(tusk, TUSK if k == 0 else ramp((110, 102, 90), (200, 194, 180)))
        if k == 0:
            for j in (1, 2):
                x, y = pts[j]
                rune_scar(p, [(x - 2, y - 2), (x + 2, y + 2)], PINK[3])
    # (its ear, torn)
    p.shade(p.poly([(hx - 14, hy - 26), (hx - 22, hy - 38), (hx - 6, hy - 28)]), HIDE)
    if horns:
        ram_horns(p, hx - 10, hy - 22, r0=17, w=7)


BOARS = [
    ('THE GREAT WOOLLY BOAR', 'A boar grown huge, high at the shoulders: the ram’s long pale wool matted with frost, a dark crest down its spine, and the tusker’s tusks curving up out of its jaw, cut with his runes.', lambda p, x, y: boar(p, x, y, False), (22, -128)),
    ('THE SAME, WITH THE RAM’S HORNS', 'The boar with the ram’s horns curled on its brow too.', lambda p, x, y: boar(p, x, y, True), (22, -128)),
]
