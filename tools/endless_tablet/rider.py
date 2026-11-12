"""THE FINAL BOSS, ROUND 3: A WARPED RUNESMITH RIDING A FOUR-LEGGED BEAST. His words, 12 Nov 2026: “Ooo let’s have you fight a warped
runesmith”; then, asked, “A new runesmith of his own”, “Riding a four-legged beast”. One rider, three mounts; rough, beside the
Brawler for size."""
import math
import numpy as np
from kit import Pic, S, INK, PINK, dilate
from bosses import pink_edge, ramp, glyphs
import beasts

ASHEN = ramp((54, 46, 64), (176, 166, 180))       # his skin, gone grey in the depth
LEATHER = ramp((34, 20, 18), (128, 82, 56))
IRON = ramp((26, 24, 34), (132, 128, 146))
SCAR = [PINK[1], PINK[2], PINK[3]]


def rune_scar(p, pts, c=None):
    """A rune cut into him, its cut burning pink."""
    for a, b in zip(pts, pts[1:]):
        p.line(a, b, c or PINK[2])


def rider(p, sx, sy, face=1):
    """The warped wordsmith in the saddle: (sx, sy) his seat. Facing right (the Brawler's way). One of the old order who keep the
    words, who went down the shaft for the deepest words and was warped by them (the lore his yes of 12 Nov, 14:01, “Yeah thats not
    bad”): a wordsmith as the Old Skald is one, with a staff of runes, writing runes on the air; but gaunt, his order's teal cloak gone
    to rags of violet, his skin ashen and cut with runes that burn pink, his eyes and his staff's rune burning pink."""
    CLOAK = ramp((26, 16, 36), (96, 64, 118))
    HAIR = ramp((120, 116, 128), (232, 230, 238))
    STAFF = ramp((40, 28, 24), (140, 104, 70))
    # (his cloak, ragged, streaming back behind him)
    cloak = p.poly([(sx - 10, sy - 50), (sx - 30, sy - 40), (sx - 44, sy - 22), (sx - 52, sy - 4), (sx - 40, sy - 8), (sx - 42, sy + 6), (sx - 30, sy - 2), (sx - 26, sy + 10), (sx - 16, sy - 2), (sx - 6, sy - 4)])
    p.shade(cloak, CLOAK)
    # (his far arm: reaching forward, the hand open, writing a rune on the air in pink)
    far = p.curve_limb([(sx + 8, sy - 36), (sx + 22, sy - 32), (sx + 32, sy - 38)], [3.6, 3, 2.6])
    p.shade(far, CLOAK)
    for k in range(4):
        a = -1.9 + k * 0.4
        p.line((sx + 33, sy - 39), (sx + 33 + math.cos(a) * 6, sy - 39 + math.sin(a) * 6), ASHEN[2])
    p.glow(sx + 46, sy - 50, 14, PINK[2], 0.32, bands=3)
    rune = [(sx + 42, sy - 60), (sx + 42, sy - 42), (sx + 42, sy - 52), (sx + 48, sy - 58), (sx + 42, sy - 52), (sx + 50, sy - 44)]
    for a, b in zip(rune, rune[1:]):
        p.line(a, b, PINK[3], 2)
    for a, b in zip(rune, rune[1:]):
        p.line(a, b, PINK[4], 1)
    # (his leg astride, the near one down the flank, a boot in an iron stirrup)
    legm = p.curve_limb([(sx - 2, sy - 6), (sx + 6, sy + 10), (sx + 2, sy + 26)], [6, 5, 4.5])
    p.shade(legm, CLOAK)
    boot = p.poly([(sx - 4, sy + 22), (sx + 7, sy + 22), (sx + 11, sy + 30), (sx - 4, sy + 31)])
    p.shade(boot, LEATHER)
    p.line((sx - 5, sy + 32), (sx + 12, sy + 32), IRON[3], 1)
    # (his body: tall, gaunt, stooped forward over the beast's neck; a robe of his order, rags of it; his chest bare and ashen where
    # it has torn, runes cut in it burning)
    torso = p.poly([(sx - 10, sy - 2), (sx + 8, sy - 2), (sx + 14, sy - 22), (sx + 14, sy - 42), (sx + 4, sy - 50), (sx - 10, sy - 48), (sx - 16, sy - 30)])
    p.shade(torso, CLOAK)
    bare = p.poly([(sx + 2, sy - 46), (sx + 12, sy - 40), (sx + 12, sy - 26), (sx + 4, sy - 28)])
    p.shade(bare, ASHEN)
    rune_scar(p, [(sx + 7, sy - 43), (sx + 7, sy - 32)])
    rune_scar(p, [(sx + 4, sy - 39), (sx + 7, sy - 36), (sx + 10, sy - 39)])
    p.line((sx - 12, sy - 22), (sx + 12, sy - 22), LEATHER[2])
    # (rune stones going round him, as round the Old Skald, but cracked and burning pink)
    for k, (dx, dy) in enumerate(((-24, -58), (-30, -26), (18, -66))):
        st = p.poly([(sx + dx - 3, sy + dy - 4), (sx + dx + 3, sy + dy - 4), (sx + dx + 4, sy + dy + 3), (sx + dx - 3, sy + dy + 4)])
        p.shade(st, [S[3], S[5], S[7]])
        p.line((sx + dx, sy + dy - 2), (sx + dx, sy + dy + 2), PINK[3])
        p.px(sx + dx - 1, sy + dy - 1, PINK[3])
    # (his head: long and gaunt, thrust forward; long white hair and a beard to his belt, wild; his eyes burning pink; a band of
    # iron on his brow, its stone cracked)
    hx, hy = sx + 10, sy - 56
    hair_back = p.poly([(hx - 8, hy - 8), (hx - 14, hy + 4), (hx - 18, hy + 16), (hx - 10, hy + 10), (hx - 6, hy + 2)])
    p.shade(hair_back, HAIR)
    head = p.poly([(hx - 7, hy - 2), (hx - 6, hy - 10), (hx + 2, hy - 13), (hx + 8, hy - 9), (hx + 10, hy - 2), (hx + 8, hy + 4), (hx - 4, hy + 4)])
    p.shade(head, ASHEN)
    beard = p.poly([(hx - 2, hy + 1), (hx + 10, hy - 1), (hx + 12, hy + 10), (hx + 8, hy + 24), (hx + 4, hy + 34), (hx + 2, hy + 20), (hx - 3, hy + 10)])
    p.shade(beard, HAIR)
    p.line((hx - 7, hy - 7), (hx + 9, hy - 8), IRON[2], 1)
    p.px(hx + 1, hy - 8, PINK[3])
    for gx in (hx + 2, hx + 7):
        p.line((gx - 1, hy - 4), (gx + 1, hy - 4.5), PINK[4])
    p.glow(hx + 5, hy - 4, 7, PINK[2], 0.16, bands=2)
    # (his near arm: the staff of his order, taller than he is, held up and out; runes cut down it burning pink; at its head a ring,
    # and in the ring his great rune, burning)
    arm = p.curve_limb([(sx - 12, sy - 42), (sx - 22, sy - 54), (sx - 20, sy - 68)], [5, 4.2, 3.8])
    p.shade(arm, CLOAK)
    p.shade(p.ellipse(sx - 20, sy - 70, 3, 3), ASHEN)
    staff = p.poly([(sx - 24, sy - 120), (sx - 20, sy - 120), (sx - 18, sy + 20), (sx - 22, sy + 20)])
    p.shade(staff, STAFF)
    for k in range(9):
        y = sy - 108 + k * 13
        p.line((sx - 22, y), (sx - 20, y + 3), PINK[2])
    ringm = p.ellipse(sx - 22, sy - 128, 9, 9) & ~p.ellipse(sx - 22, sy - 128, 6.5, 6.5)
    p.shade(ringm, IRON)
    p.glow(sx - 22, sy - 128, 18, PINK[2], 0.34, bands=3)
    for a, b in (((sx - 22, sy - 134), (sx - 22, sy - 122)), ((sx - 26, sy - 130), (sx - 22, sy - 126)), ((sx - 18, sy - 130), (sx - 22, sy - 126))):
        p.line(a, b, PINK[3], 2)
    p.line((sx - 22, sy - 134), (sx - 22, sy - 122), PINK[4])


# ---------------------------------------------------------------------------------------------------------------------------
# A: THE FORGED BEAST, his own make: a great boar of riveted iron on legs of rune-cut stone, a furnace burning in its chest, its head
# an anvil with tusks, a stack smoking behind his saddle.

def forged(p, fx, fy):
    PLATE = ramp((30, 28, 38), (140, 134, 150))
    STF = ramp((24, 20, 28), (100, 88, 92))
    ST = ramp((40, 32, 40), (164, 146, 128))
    # (far legs)
    beasts.leg(p, [(fx - 52, fy - 50), (fx - 56, fy - 26), (fx - 50, fy - 5)], [12, 10, 9], STF)
    beasts.leg(p, [(fx + 34, fy - 52), (fx + 42, fy - 26), (fx + 40, fy - 5)], [12, 10, 9], STF)
    # (the stack behind the saddle, smoking)
    stack = p.poly([(fx - 40, fy - 104), (fx - 30, fy - 104), (fx - 30, fy - 136), (fx - 40, fy - 136)])
    p.shade(stack, PLATE)
    p.line((fx - 41, fy - 136), (fx - 29, fy - 136), PLATE[3], 2)
    for k in range(6):
        p.fill(p.ellipse(fx - 36 - k * 4, fy - 142 - k * 5, 4 + k * 0.6, 3 + k * 0.4), ramp((30, 26, 36), (70, 64, 78))[k % 3], 0.9)
    # (its body: a barrel of iron plates, heavy at the shoulders, the back sloping to the rump)
    body = p.poly([(fx - 72, fy - 52), (fx - 74, fy - 80), (fx - 50, fy - 102), (fx + 0, fy - 108), (fx + 40, fy - 112), (fx + 60, fy - 90), (fx + 58, fy - 60), (fx + 40, fy - 44), (fx - 10, fy - 40), (fx - 56, fy - 42)])
    p.shade(body, PLATE)
    # (its plates: seams and rivets)
    for k in range(5):
        x = fx - 60 + k * 24
        for j in range(60):
            y = fy - 104 + j
            if body[int(y), int(x + j * 0.08)]:
                p.px(x + j * 0.08, y, INK)
        for j in range(0, 56, 7):
            y = fy - 100 + j
            if body[int(y), int(x + 3)]:
                p.px(x + 3, y, PLATE[3])
    # (runes cut down its flank, burning)
    for k in range(4):
        x0, y0 = fx - 52 + k * 22, fy - 84
        rune_scar(p, [(x0, y0), (x0, y0 + 14)])
        rune_scar(p, [(x0 - 3, y0 + 3), (x0, y0 + 7), (x0 + 3, y0 + 3)])
    # (the saddle: a seat of riveted iron, a blanket of leather under it)
    p.shade(p.poly([(fx - 18, fy - 106), (fx + 16, fy - 110), (fx + 18, fy - 98), (fx - 18, fy - 94)]), LEATHER)
    p.shade(p.poly([(fx - 14, fy - 112), (fx + 12, fy - 116), (fx + 14, fy - 106), (fx - 12, fy - 102)]), PLATE)
    # (near legs: stone, bound in iron, hooves like anvils)
    for x0 in (fx - 38, fx + 46):
        beasts.leg(p, [(x0, fy - 52), (x0 + 4, fy - 28), (x0, fy - 8)], [14, 12, 11], ST)
        p.line((x0 - 13, fy - 34), (x0 + 15, fy - 34), PLATE[2], 2)
        p.shade(p.poly([(x0 - 13, fy - 10), (x0 + 13, fy - 10), (x0 + 16, fy - 1), (x0 - 16, fy - 1)]), PLATE)
    # (its chest: a furnace, its grate glowing pink to gold)
    p.glow(fx + 52, fy - 70, 22, PINK[2], 0.32, bands=3)
    grate = p.poly([(fx + 44, fy - 84), (fx + 60, fy - 84), (fx + 62, fy - 58), (fx + 46, fy - 58)])
    p.fill(dilate(grate, 1) & ~grate, INK)
    p.fill(grate, PINK[3])
    p.fill(p.poly([(fx + 48, fy - 78), (fx + 58, fy - 78), (fx + 59, fy - 64), (fx + 49, fy - 64)]), PINK[4])
    for k in range(4):
        p.line((fx + 46 + k * 4, fy - 84), (fx + 47 + k * 4, fy - 58), IRON[0])
    # (its head: an anvil, low and thrust forward, tusks curving up, eyes two slits of fire)
    hx, hy = fx + 80, fy - 74
    neck = p.poly([(fx + 46, fy - 108), (fx + 70, fy - 92), (fx + 72, fy - 62), (fx + 52, fy - 56)])
    p.shade(neck, PLATE)
    head = p.poly([(hx - 14, hy - 16), (hx + 20, hy - 16), (hx + 26, hy - 12), (hx + 20, hy - 8), (hx + 14, hy - 6), (hx + 16, hy + 10), (hx - 10, hy + 12), (hx - 16, hy - 2)])
    p.shade(head, PLATE)
    for sxk in (0, 6):
        tusk = p.curve_limb([(hx + 10 + sxk * 0.5, hy + 8), (hx + 22 + sxk * 0.5, hy + 4), (hx + 26 + sxk * 0.5, hy - 6)], [3, 2, 1])
        p.shade(tusk, ramp((150, 140, 120), (240, 232, 214)))
    p.line((hx + 2, hy - 10), (hx + 10, hy - 11), PINK[3])
    p.px(hx + 6, hy - 10.5, PINK[4])
    p.glow(hx + 6, hy - 10, 9, PINK[2], 0.28, bands=2)
    # (the reins: a chain from its jaw back to his fist)
    for k in range(10):
        u = k / 9
        p.px(hx - 8 + (fx + 40 - (hx - 8)) * u, hy + 2 + (fy - 140 - (hy + 2)) * u * 0.6 + math.sin(u * 3.1) * 6, IRON[3])


def on_behemoth(p, fx, fy):
    beasts.behemoth(p, fx, fy)
    # (a saddle of leather on its hump)
    p.shade(p.poly([(fx - 4, fy - 124), (fx + 22, fy - 130), (fx + 24, fy - 118), (fx - 4, fy - 112)]), LEATHER)


def on_hound(p, fx, fy):
    beasts.inkhound(p, fx, fy)
    p.shade(p.poly([(fx - 10, fy - 110), (fx + 14, fy - 114), (fx + 16, fy - 102), (fx - 10, fy - 98)]), LEATHER)


TAKES = [
    ('A: ON A BEAST OF HIS OWN MAKING', 'A great boar of riveted iron on legs of rune-cut stone, a furnace burning in its chest, an anvil for a head with tusks, its flanks cut with his runes.', forged, (0, -110), (250, 260)),
    ('B: ON THE BOUND BEHEMOTH', 'The bull of bound books from the last round: a hoard of words he carried up out of the deep.', on_behemoth, (8, -122), (250, 260)),
    ('C: ON THE INK HOUND', 'The gaunt hound of ink from the last round: what it bites goes dark.', on_hound, (2, -108), (250, 260)),
]


def ride_panel(take, brawler):
    name, words, mount, (ox, oy), (w, h) = take
    p = Pic(w + 50, h)
    fx, fy = int(w * 0.44), h - 4
    mount(p, fx, fy)
    edge_mount = p.a > 0.9
    rider(p, fx + ox, fy + oy)
    pink_edge(p, (p.a > 0.9) & ~dilate(edge_mount, 0))
    p.paste(brawler, w + 4, h - brawler.height - 1)
    return p
