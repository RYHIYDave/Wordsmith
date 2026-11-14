"""THE FINAL BOSS, A SECOND ROUND: four great four-legged beasts, none of them a dragon or a wyvern. His words, 12 Nov 2026: “I want a
big four legged thing.  I was thinking a dragon or a wyvern or something but that seems a little cliche”. Rough, each beside the
Brawler for size, facing him."""
import math
import numpy as np
from kit import Pic, S, INK, PINK, dilate, erode, shift
from bosses import pink_edge, ramp, glyphs


def leg(p, pts, radii, tones):
    m = p.curve_limb(pts, radii)
    p.shade(m, tones)
    return m


# ---------------------------------------------------------------------------------------------------------------------------
# 1. THE SPHINX OF THE STACKS: a lion of the shaft's stone, crouched to spring; its mane a fan of pages, its folded wings two great
# book covers; for a face, a cracked stone mask that speaks. It asks riddles, and its blows are words.

def sphinx(p, fx, fy):
    ST = ramp((44, 34, 44), (168, 150, 130))
    STF = ramp((30, 24, 32), (112, 98, 92))
    PAGE = ramp((130, 116, 96), (240, 232, 210))
    COVER = ramp((50, 18, 24), (150, 62, 60))
    GILT = ramp((120, 84, 30), (240, 206, 116))
    MASKT = ramp((110, 100, 104), (226, 218, 206))
    # (far legs: a hind leg and a forepaw, in shade)
    leg(p, [(fx - 70, fy - 62), (fx - 60, fy - 32), (fx - 70, fy - 4)], [13, 8, 7], STF)
    leg(p, [(fx + 34, fy - 60), (fx + 44, fy - 28), (fx + 56, fy - 5)], [11, 7, 6], STF)
    # (its tail, long, a brush at its end)
    tail = p.curve_limb([(fx - 76, fy - 70), (fx - 96, fy - 84), (fx - 104, fy - 110), (fx - 92, fy - 124)], [4, 3, 2.5, 2])
    p.shade(tail, ST)
    p.shade(p.poly([(fx - 98, fy - 124), (fx - 86, fy - 132), (fx - 84, fy - 120), (fx - 92, fy - 116)]), PAGE)
    # (its body: a lion's, the haunches high and round, the waist drawn in, the chest low and deep, ready to spring)
    body = p.poly([(fx - 84, fy - 64), (fx - 86, fy - 82), (fx - 76, fy - 98), (fx - 56, fy - 102), (fx - 34, fy - 94), (fx - 10, fy - 90), (fx + 14, fy - 96), (fx + 34, fy - 98), (fx + 48, fy - 88), (fx + 52, fy - 70), (fx + 44, fy - 52), (fx + 26, fy - 46), (fx + 4, fy - 56), (fx - 24, fy - 60), (fx - 48, fy - 50), (fx - 72, fy - 50)])
    p.shade(body, ST)
    # (its muscle: the haunch and the shoulder, a shade apart)
    p.fill(p.ellipse(fx - 58, fy - 74, 18, 16) & body & ~p.ellipse(fx - 62, fy - 79, 16, 14), ST[1])
    p.fill(p.ellipse(fx + 28, fy - 72, 16, 18) & body & ~p.ellipse(fx + 24, fy - 77, 14, 16), ST[1])
    # (its wings, folded along its back: two great book covers, gilt at the edges, pages showing at their foot)
    wing = p.poly([(fx - 56, fy - 96), (fx - 30, fy - 128), (fx + 18, fy - 120), (fx + 22, fy - 94), (fx - 14, fy - 90)])
    p.shade(wing, COVER)
    pages = p.poly([(fx - 54, fy - 94), (fx + 20, fy - 94), (fx + 20, fy - 90), (fx - 52, fy - 90)])
    p.shade(pages, PAGE)
    for k in range(4):
        p.line((fx - 50 + k * 18, fy - 104 - k * 5), (fx - 40 + k * 18, fy - 122 + k * 2), GILT[2])
    p.line((fx - 30, fy - 128), (fx + 18, fy - 120), GILT[3])
    # (near legs: the hind leg drawn up, the forepaw reaching, claws of stone)
    leg(p, [(fx - 58, fy - 64), (fx - 40, fy - 38), (fx - 52, fy - 6)], [16, 10, 8], ST)
    leg(p, [(fx + 20, fy - 60), (fx + 34, fy - 30), (fx + 46, fy - 8)], [12, 8, 7], ST)
    for paw, sx in (((fx - 52, fy - 5), 1), ((fx + 48, fy - 6), 1)):
        p.shade(p.ellipse(paw[0] + 3, paw[1], 9, 4.5), ST)
        for j in range(3):
            p.line((paw[0] + 6 + j * 3, paw[1] + 2), (paw[0] + 9 + j * 3, paw[1] + 4), S[7])
    # (its neck, thick, up out of the chest; its mane a fan of pages round the head)
    hx, hy = fx + 58, fy - 106
    neck = p.curve_limb([(fx + 34, fy - 84), (fx + 46, fy - 96), (hx - 2, hy + 4)], [16, 13, 11])
    p.shade(neck, ST)
    for k in range(15):
        a = -math.pi * 1.05 + k * (math.pi * 1.45 / 14)
        r0, r1 = 9, 22 + (k % 3) * 3
        pts = [(hx + math.cos(a - 0.12) * r0, hy + math.sin(a - 0.12) * r0), (hx + math.cos(a - 0.09) * r1, hy + math.sin(a - 0.09) * r1), (hx + math.cos(a + 0.09) * r1, hy + math.sin(a + 0.09) * r1), (hx + math.cos(a + 0.12) * r0, hy + math.sin(a + 0.12) * r0)]
        p.shade(p.poly(pts), PAGE)
        p.line((hx + math.cos(a) * (r0 + 4), hy + math.sin(a) * (r0 + 4)), (hx + math.cos(a) * (r1 - 4), hy + math.sin(a) * (r1 - 4)), PAGE[1])
    # (its face: a stone mask, a woman's, calm, cracked across; its eyes and open mouth burning pink: it speaks)
    face = p.poly([(hx - 8, hy - 12), (hx + 6, hy - 14), (hx + 13, hy - 6), (hx + 14, hy + 6), (hx + 8, hy + 16), (hx - 2, hy + 18), (hx - 9, hy + 8)])
    p.shade(face, MASKT)
    p.glow(hx + 5, hy, 7, PINK[2], 0.2, bands=2)
    for ex in (hx + 1, hx + 9):
        p.line((ex - 2, hy - 2), (ex + 2, hy - 3), PINK[3])
        p.px(ex, hy - 2.5, PINK[4])
    p.fill(p.ellipse(hx + 6, hy + 10, 3, 2), PINK[1])
    p.px(hx + 6, hy + 10, PINK[3])
    p.line((hx + 9, hy - 14), (hx + 6, hy - 4), INK)
    p.line((hx + 6, hy - 4), (hx + 10, hy + 4), INK)
    # (what it says: words coming off its mouth)
    glyphs(p, hx + 30, hy + 4, 7, 12, [PINK[2], PINK[3], PINK[4]], seed=21)
    pink_edge(p, p.a > 0.9)


# ---------------------------------------------------------------------------------------------------------------------------
# 2. THE BOUND BEHEMOTH: a great bull of a beast, its hide a hoard of bound books: thick spines in rows down its back, gilt bands,
# corners of iron for hooves; its head a closed tome with a jaw of page edges and an iron clasp for a horn. Pages tear loose as it
# charges.

def behemoth(p, fx, fy):
    LEATH = [ramp((44, 14, 18), (140, 56, 52)), ramp((20, 36, 26), (70, 112, 76)), ramp((50, 34, 20), (150, 108, 66)), ramp((30, 24, 50), (92, 78, 140))]
    HIDE = ramp((30, 20, 22), (110, 80, 72))
    PAGE = ramp((130, 116, 96), (240, 232, 210))
    GILT = ramp((120, 84, 30), (240, 206, 116))
    IRON = ramp((34, 30, 44), (130, 124, 140))
    rng = np.random.default_rng(17)
    # (far legs, in shade)
    leg(p, [(fx - 56, fy - 50), (fx - 50, fy - 24), (fx - 56, fy - 6)], [13, 10, 9], ramp((22, 14, 16), (80, 58, 54)))
    leg(p, [(fx + 30, fy - 52), (fx + 38, fy - 26), (fx + 34, fy - 6)], [13, 10, 9], ramp((22, 14, 16), (80, 58, 54)))
    # (its body: a huge hump over the shoulders, sloping to a narrower rump)
    body = p.poly([(fx - 76, fy - 50), (fx - 78, fy - 80), (fx - 56, fy - 104), (fx - 10, fy - 118), (fx + 30, fy - 132), (fx + 52, fy - 112), (fx + 58, fy - 74), (fx + 44, fy - 44), (fx - 10, fy - 40), (fx - 60, fy - 42)])
    p.shade(body, HIDE)
    # (its hide of books: spines in rows down its back, each its own leather, gilt bands across)
    for row in range(5):
        y0 = fy - 116 + row * 14
        x = fx - 70 + (row % 2) * 6
        while x < fx + 52:
            w = rng.integers(7, 12)
            h = 16 + rng.integers(0, 5)
            top = y0 - (x - fx) * 0.18 if x > fx - 10 else y0 + (fx - 10 - x) * 0.25
            sp = p.poly([(x, top), (x + w, top - 1), (x + w + 1, top + h), (x + 1, top + h + 1)])
            sp &= body
            if sp.any():
                p.shade(sp, LEATH[rng.integers(0, 4)])
                p.line((x + 1, top + 3), (x + w, top + 2), GILT[2])
                p.line((x + 1, top + h - 3), (x + w, top + h - 4), GILT[1])
            x += w + 1
    # (its belly: bare dark leather, creased)
    belly = body & p.poly([(fx - 70, fy - 56), (fx + 50, fy - 60), (fx + 44, fy - 42), (fx - 60, fy - 40)])
    p.fill(belly, HIDE[0])
    # (near legs: pillars of stacked volumes, corners of iron for hooves)
    for (x0, y0) in ((fx - 46, fy - 52), (fx + 40, fy - 54)):
        lg = leg(p, [(x0, y0), (x0 + 4, y0 + 24), (x0, fy - 8)], [15, 12, 11], LEATH[0])
        for k in range(3):
            p.line((x0 - 11, y0 + 12 + k * 11), (x0 + 13, y0 + 11 + k * 11), GILT[1])
        hoof = p.poly([(x0 - 12, fy - 10), (x0 + 12, fy - 10), (x0 + 13, fy - 1), (x0 - 13, fy - 1)])
        p.shade(hoof, IRON)
    # (its head: low and forward, a great closed tome, its edge of pages a jaw; an iron clasp for a horn)
    hx, hy = fx + 72, fy - 72
    neck = p.poly([(fx + 40, fy - 116), (fx + 66, fy - 96), (fx + 70, fy - 60), (fx + 46, fy - 52)])
    p.shade(neck, HIDE)
    head = p.poly([(hx - 18, hy - 26), (hx + 14, hy - 20), (hx + 22, hy + 2), (hx + 16, hy + 22), (hx - 14, hy + 20), (hx - 20, hy - 4)])
    p.shade(head, LEATH[3])
    # (the page edge: its jaw, open a little, ragged teeth of page)
    jaw = p.poly([(hx - 12, hy + 8), (hx + 18, hy + 6), (hx + 16, hy + 18), (hx - 12, hy + 18)])
    p.shade(jaw, PAGE)
    for j in range(7):
        p.line((hx - 10 + j * 4, hy + 10), (hx - 10 + j * 4, hy + 17), PAGE[0])
    p.fill(p.poly([(hx - 8, hy + 12), (hx + 16, hy + 11), (hx + 15, hy + 13), (hx - 8, hy + 14)]), (30, 6, 20))
    # (gilt corners, and the clasp: an iron horn curving up off its brow)
    for (cx, cy) in ((hx - 17, hy - 24), (hx + 13, hy - 19)):
        p.fill(p.poly([(cx, cy), (cx + 6, cy), (cx, cy + 6)]), GILT[2])
    horn = p.curve_limb([(hx + 6, hy - 18), (hx + 16, hy - 32), (hx + 14, hy - 46)], [5, 3.5, 1.5])
    p.shade(horn, IRON)
    p.glow(hx + 6, hy - 6, 11, PINK[2], 0.3, bands=2)
    p.fill(p.ellipse(hx + 6, hy - 6, 3, 2), PINK[3])
    p.px(hx + 6, hy - 6, PINK[4])
    # (pages tearing loose behind it)
    for k in range(8):
        x = fx - 70 - rng.uniform(0, 30)
        y = fy - 120 + rng.uniform(0, 70)
        if p.a[int(y), int(x)] < 0.5:
            p.shade(p.poly([(x, y), (x + 6, y - 2), (x + 8, y + 3), (x + 2, y + 6)]), PAGE[1:])
    pink_edge(p, p.a > 0.9)


# ---------------------------------------------------------------------------------------------------------------------------
# 3. THE STAIR-BACK: where the shaft's stair ends, on the back of a beast. A colossus of masonry on four pillar legs bound with iron,
# a ruined spiral stair winding up a broken tower on its back; its head long and low like a ram's, its eye a window with a fire in it.

def stairback(p, fx, fy):
    ST = [S[1], S[3], S[4], S[6]]
    STF = [S[0], S[2], S[3], S[4]]
    IRON = ramp((28, 24, 38), (110, 104, 124))
    # (far legs)
    for x in (fx - 54, fx + 40):
        lg = leg(p, [(x, fy - 56), (x, fy - 30), (x, fy - 4)], [13, 12, 13], STF)
    # (its body: a broad dome of masonry, like a tortoise's back, its rim overhanging the legs)
    body = p.ellipse(fx - 6, fy - 66, 78, 40) & p.poly([(fx - 120, fy - 120), (fx + 120, fy - 120), (fx + 120, fy - 46), (fx - 120, fy - 46)])
    p.shade(body, ST)
    rimb = p.ellipse(fx - 6, fy - 52, 80, 8) & ~p.ellipse(fx - 6, fy - 55, 78, 7)
    p.fill(rimb, S[2])
    yy, xx = np.mgrid[0:p.h, 0:p.w]
    rr = np.hypot((xx + 0.5 - (fx - 6)) / 78, (yy + 0.5 - (fy - 50)) / 54)
    for k in range(4):
        p.fill(body & (np.abs(rr - (0.42 + k * 0.17)) < 0.012), INK)
    ang = np.arctan2(yy + 0.5 - (fy - 50), xx + 0.5 - (fx - 6))
    for k in range(14):
        a = -math.pi + k * math.pi / 13
        p.fill(body & (np.abs(ang - a) < 0.012) & ((k % 2 == 0) & (rr > 0.42) | (rr > 0.59) & (rr < 0.76)), INK)
    # (on its back a broken round tower, the stair winding up round it as a band of steps)
    tx, ty = fx - 14, fy - 98
    tower = p.poly([(tx - 17, ty + 4), (tx - 16, ty - 50), (tx - 8, ty - 58), (tx + 2, ty - 52), (tx + 10, ty - 64), (tx + 16, ty - 46), (tx + 17, ty + 4)])
    p.shade(tower, [S[2], S[4], S[5], S[7]])
    for k in range(4):
        y0 = ty - k * 14
        band = p.poly([(tx - 18, y0 - 2), (tx + 18, y0 - 10), (tx + 18, y0 - 6), (tx - 18, y0 + 2)]) & dilate(tower, 2)
        p.shade(band, [S[3], S[5], S[6], S[7]], seam=True)
        for j in range(6):
            x = tx - 15 + j * 6
            y = y0 - 1 - j * 1.35
            p.line((x, y - 1), (x, y + 2), INK)
    # (a dark doorway in it, and a slit of fire)
    p.fill(p.poly([(tx - 4, ty - 24), (tx + 4, ty - 24), (tx + 4, ty - 10), (tx - 4, ty - 10)]), (8, 6, 16))
    p.fill(p.poly([(tx - 2, ty - 20), (tx + 2, ty - 20), (tx + 2, ty - 14), (tx - 2, ty - 14)]), PINK[1])
    # (near legs: pillars, bound with iron)
    for x in (fx - 40, fx + 54):
        leg(p, [(x, fy - 56), (x + 2, fy - 30), (x, fy - 4)], [15, 14, 15], ST)
        for k in range(3):
            y = fy - 44 + k * 14
            p.line((x - 15, y), (x + 15, y), IRON[2], 2)
            p.line((x - 15, y + 2), (x + 15, y + 2), IRON[0])
    # (its head: long and low, a ram's head of stone, a horn curling back off it like a turn of the stair; its eye a window)
    hx, hy = fx + 92, fy - 60
    neck = p.curve_limb([(fx + 56, fy - 72), (fx + 72, fy - 66), (hx - 8, hy)], [14, 11, 10])
    p.shade(neck, ST)
    head = p.poly([(hx - 12, hy - 14), (hx + 8, hy - 14), (hx + 22, hy - 4), (hx + 26, hy + 6), (hx + 14, hy + 13), (hx - 8, hy + 12), (hx - 14, hy)])
    p.shade(head, ST)
    horn = p.curve_limb([(hx - 4, hy - 12), (hx - 14, hy - 24), (hx - 24, hy - 18), (hx - 22, hy - 6), (hx - 14, hy - 4)], [5, 5, 4.5, 4, 3])
    p.shade(horn, [S[3], S[5], S[6], S[7]])
    for k in range(5):
        a = -0.2 - k * 1.1
        p.line((hx - 15 + math.cos(a) * 5, hy - 14 + math.sin(a) * 5), (hx - 15 + math.cos(a) * 10, hy - 14 + math.sin(a) * 10), INK)
    win = p.poly([(hx + 6, hy - 8), (hx + 10, hy - 11), (hx + 14, hy - 8), (hx + 14, hy - 1), (hx + 6, hy - 1)])
    p.fill(dilate(win, 1) & ~win, INK)
    p.fill(win, PINK[2])
    p.fill(p.poly([(hx + 8, hy - 7), (hx + 12, hy - 7), (hx + 12, hy - 2), (hx + 8, hy - 2)]), PINK[4])
    p.glow(hx + 10, hy - 5, 12, PINK[2], 0.3, bands=2)
    # (chains hanging off it)
    for cx in (fx - 66, fx + 20, fx + 62):
        for j in range(7):
            p.px(cx + (j % 2), fy - 52 + j * 3, IRON[3])
            p.px(cx + (j % 2), fy - 51 + j * 3, IRON[0])
    pink_edge(p, p.a > 0.9)


# ---------------------------------------------------------------------------------------------------------------------------
# 4. THE INK HOUND: a gaunt, too-tall hound of black ink, its ribs showing through, smoke off its back; a long muzzle set with
# quills for teeth and a row of pink eyes up it; ink runs off it and pools where it stands. What it bites goes dark.

def inkhound(p, fx, fy):
    INKT = ramp((10, 6, 18), (70, 56, 96))
    GLOSS = (120, 104, 150)
    QUILL = ramp((140, 130, 110), (244, 238, 220))
    rng = np.random.default_rng(29)
    # (the pool of ink under it)
    p.fill(p.ellipse(fx, fy - 2, 70, 4), (14, 8, 24))
    p.fill(p.ellipse(fx + 10, fy - 2.5, 40, 2), (40, 28, 60))
    # (far legs: long, thin, the joints high)
    leg(p, [(fx - 50, fy - 84), (fx - 64, fy - 54), (fx - 56, fy - 26), (fx - 62, fy - 4)], [7, 4, 3.5, 3], INKT)
    leg(p, [(fx + 34, fy - 86), (fx + 40, fy - 50), (fx + 34, fy - 4)], [6, 4, 3], INKT)
    # (its tail: smoke)
    for k in range(10):
        t = k / 9
        x = fx - 66 - t * 40
        y = fy - 92 - math.sin(t * 3) * 14
        p.fill(p.ellipse(x, y, 6 - t * 4, 4 - t * 2.5), INKT[1 + (k % 2)], 0.9)
    # (its body: a deep chest, a waist pinched to nothing, the spine a ridge)
    body = p.poly([(fx - 64, fy - 92), (fx - 50, fy - 106), (fx - 10, fy - 104), (fx + 26, fy - 116), (fx + 44, fy - 108), (fx + 48, fy - 84), (fx + 34, fy - 66), (fx + 10, fy - 70), (fx - 20, fy - 82), (fx - 52, fy - 78)])
    p.shade(body, INKT)
    # (its ribs, showing)
    for k in range(6):
        x = fx + 2 + k * 6
        p.line((x, fy - 104 + k * 0.5), (x - 4, fy - 74 + k), INKT[3])
        p.line((x + 1, fy - 104 + k * 0.5), (x - 3, fy - 74 + k), INKT[0])
    # (gloss along its back, and smoke rising off it)
    p.line((fx - 46, fy - 104), (fx + 26, fy - 114), GLOSS)
    for k in range(9):
        x = fx - 40 + k * 9 + rng.uniform(-2, 2)
        for j in range(5):
            p.px(x + math.sin(j + k) * 1.5, fy - 110 - j * 3 - (k % 3) * 2, INKT[2], 0.7)
    # (near legs)
    leg(p, [(fx - 40, fy - 84), (fx - 52, fy - 52), (fx - 42, fy - 26), (fx - 48, fy - 4)], [9, 5, 4, 3.5], INKT)
    leg(p, [(fx + 40, fy - 84), (fx + 50, fy - 48), (fx + 46, fy - 4)], [8, 5, 3.5], INKT)
    for x in (fx - 48, fx + 46, fx - 62, fx + 34):
        for j in range(3):
            p.line((x - 3 + j * 3, fy - 2), (x - 2 + j * 3 + 2, fy + 0), QUILL[1])
    # (its head: low, thrust out, a long muzzle set with quills for teeth, a row of pink eyes up it)
    hx, hy = fx + 70, fy - 92
    neck = p.curve_limb([(fx + 40, fy - 104), (fx + 56, fy - 98), (hx - 8, hy)], [10, 8, 7])
    p.shade(neck, INKT)
    head = p.poly([(hx - 12, hy - 10), (hx + 4, hy - 12), (hx + 30, hy - 6), (hx + 36, hy - 1), (hx + 30, hy + 2), (hx + 4, hy + 4), (hx - 10, hy + 8)])
    p.shade(head, INKT)
    jaw = p.poly([(hx - 6, hy + 6), (hx + 28, hy + 4), (hx + 30, hy + 10), (hx + 6, hy + 14)])
    p.shade(jaw, INKT)
    p.fill(p.poly([(hx - 2, hy + 4), (hx + 28, hy + 2), (hx + 28, hy + 5), (hx, hy + 8)]), (40, 4, 26))
    for j in range(8):
        x = hx + 2 + j * 3.4
        p.line((x, hy + 2), (x + 1, hy + 7), QUILL[3])
        p.px(x + 1, hy + 7, QUILL[1])
    p.glow(hx + 6, hy - 6, 14, PINK[2], 0.28, bands=2)
    for j in range(4):
        ex, ey = hx - 4 + j * 6, hy - 6 - j * 0.2
        p.fill(p.ellipse(ex, ey, 1.6, 1.2), PINK[3])
        p.px(ex, ey, PINK[4])
    # (its ears, torn, swept back)
    for d in (0, 6):
        p.shade(p.poly([(hx - 8 + d, hy - 10), (hx - 22 + d, hy - 26), (hx - 2 + d, hy - 14)]), INKT)
    # (ink running off its jaw and its belly)
    for x, l in ((hx + 14, 14), (hx + 22, 9), (fx + 10, 16), (fx - 18, 10)):
        y0 = hy + 12 if x > fx + 50 else fy - 72
        for j in range(l):
            p.px(x, y0 + j, (30, 20, 46))
        p.px(x, y0 + l, (70, 56, 96))
    # (words it has bitten, gone dark, drifting off)
    glyphs(p, hx + 40, hy - 14, 6, 10, [(70, 56, 96), (100, 84, 130)], seed=31)
    pink_edge(p, p.a > 0.9)


TAKES = [
    ('1: THE SPHINX OF THE STACKS', 'A lion of the shaft’s stone, crouched to spring; a mane of pages, wings of two great book covers, a cracked stone mask for a face. It speaks in riddles, and its blows are words.', sphinx, (230, 190)),
    ('2: THE BOUND BEHEMOTH', 'A huge bull of a beast whose hide is a hoard of bound books: spines down its back, gilt bands, iron corners for hooves, a clasp for a horn. Pages tear off as it charges.', behemoth, (230, 190)),
    ('3: THE STAIR-BACK', 'Where the shaft’s stair ends: on its back. A colossus of masonry on four iron-bound pillars, a broken tower on its back, a ram’s head of stone with a fire in its window eye.', stairback, (250, 190)),
    ('4: THE INK HOUND', 'A gaunt, too-tall hound of black ink, ribs showing, smoke off its back; quills for teeth, a row of pink eyes. Ink pools where it stands; what it bites goes dark.', inkhound, (240, 190)),
]


def beast_panel(take, brawler):
    name, words, fn, (w, h) = take
    p = Pic(w + 50, h)
    fn(p, int(w * 0.46), h - 4)
    p.paste(brawler, w + 4, h - brawler.height - 1)
    return p
