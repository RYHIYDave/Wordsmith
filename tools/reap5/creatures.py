# THE REAPING CREATURES (his words, 24 Nov 2026: “Should there be a specific new creature per damage type for reaping.  Like
# reaping and fire makes little imps that throw fireballs instead of the shades.  What would the others be?”; offered the five
# and asked to build them: “Yes and work on reaping”): each built in 3D (sculpt.py), posed frame by frame for its stand, its
# walk and its attack (a big wind-up, the blow a flash, a big wind-down: Rulebook, Movement 9).
#   IMP (Reaping and Flame): a little horned imp, bat-winged, a spade-tipped tail, the fire in its belly showing through; it
#     rears back with a fireball swelling in its claw and hurls it.
#   RIMELING (Reaping and Frost): a hooded frost wraith with no legs, its hem a skirt of icicles; it draws an icicle between its
#     claws over its head and flings it.
#   STORMWISP (Reaping and Lightning): a crackling wisp of storm-light with a spiked crown and a hooked tail; it coils and darts
#     its spark at what it strikes.
#   BLIGHT TOAD (Reaping and Poison): a squat warty toad, its back studded with venom blisters; it swells its throat and spits.
#   BONEBRUTE (Reaping and Power): a hulking hunched skeleton with great fists; it raises both over its head and slams the
#     ground.
# Their eyes glow in their side's colour (his rule: what glows on a friend is cyan, on the enemy pink).
import math
from sculpt import Model

TAU = math.pi * 2


def s(x):
    return math.sin(x * TAU)


def c(x):
    return math.cos(x * TAU)


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def mix(a, b, t):
    return a + (b - a) * t


def lerp3(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


def key(t, keys):
    """A value at `t` from keys [(t0, v0), (t1, v1), ...], eased between them (numbers or 3-tuples)."""
    if t <= keys[0][0]:
        return keys[0][1]
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if t <= t1:
            f = ease((t - t0) / max(1e-6, t1 - t0))
            if isinstance(v0, tuple):
                return lerp3(v0, v1, f)
            return mix(v0, v1, f)
    return keys[-1][1]


# ---------------------------------------------------------------------------------------------------------------------------
# THE IMP
IMP_MATS = {
    'skin': {'ramp': ['#2a0e14', '#4c1618', '#74231e', '#a23a24', '#c95a2e']},
    'dark': {'ramp': ['#1a0a10', '#2c1016', '#40181a', '#5a2420']},
    'wing': {'ramp': ['#220a12', '#3a1218', '#561c1e', '#76281f']},
    'horn': {'ramp': ['#1c1418', '#3a2c28', '#5e4a3c', '#8a7258', '#b09a78']},
    'bone': {'ramp': ['#2a1214', '#4a2020', '#6e3226', '#8e4a30']},
    'fire': {'ramp': ['#c8401a', '#ff8a2a', '#ffc050', '#fff0a0'], 'glow': True},
    'ember': {'ramp': ['#a83018', '#ff8a2a', '#ffc050'], 'glow': True},
    'mouth': {'ramp': ['#12060a', '#1e0a0e']},
    'eye': {'ramp': ['#28dcf0', '#9cf4ff'], 'glow': True},
}


def imp(anim, t, side='friend'):
    m = Model()
    mats = dict(IMP_MATS)
    if side == 'foe':
        mats['eye'] = {'ramp': ['#ff4f8a', '#ffb0c8'], 'glow': True}
    bob, lean, twist = 0.0, 0.0, 0.0
    legL = legR = 0.0     # stride, -1..1
    armR = (8.4, 10.5, 4.2)
    armL = (-8.4, 10.5, 4.2)
    elbR = (8.4, 14.0, 1.8)
    elbL = (-8.4, 14.0, 1.8)
    wing = 0.0
    fire = 0.0
    fire_at = None
    tail = 0.0
    jaw = 0.0
    if anim == 'idle':
        bob = 0.5 * s(t)
        wing = 0.5 + 0.5 * s(t)
        tail = s(t + 0.2)
        armR = (8.6, 10.4 + 0.5 * s(t), 4.0)
        armL = (-8.6, 10.4 + 0.5 * s(t + 0.1), 4.0)
    elif anim == 'walk':
        bob = 0.9 * abs(s(t))
        lean = 10.0
        legL = s(t)
        legR = -s(t)
        wing = 0.6 + 0.4 * s(t * 2)
        tail = s(t * 2) * 0.7
        armR = (8.2, 11.5 + 1.2 * s(t), 4.0 - 2.5 * s(t))
        armL = (-8.2, 11.5 - 1.2 * s(t), 4.0 + 2.5 * s(t))
    elif anim == 'attack':
        # the fireball swells in his raised claw, he rears back; the throw a flash; the follow-through and back
        back = key(t, [(0, 0), (0.55, 1), (0.62, 1.05), (0.68, -1), (0.85, -0.7), (1, 0)])
        lean = -14 * max(0, back) + 18 * max(0, -back)
        twist = 16 * max(0, back) - 10 * max(0, -back)
        bob = 0.6 * max(0, back) - 0.6 * max(0, -back)
        wing = 0.5 + 0.5 * max(0, back) + 0.4 * max(0, -back)
        tail = -0.8 * back
        jaw = max(0, back) * 0.6 + max(0, -back)
        if back >= 0:
            elbR = lerp3((8.4, 14.0, 1.8), (9.0, 21.0, -3.5), back)
            armR = lerp3((8.4, 10.5, 4.2), (8.0, 27.0, -6.5), back)
        else:
            f = -back
            elbR = lerp3((8.4, 14.0, 1.8), (6.5, 17.0, 6.5), f)
            armR = lerp3((8.4, 10.5, 4.2), (4.0, 14.5, 11.0), f)
        armL = lerp3((-8.4, 10.5, 4.2), (-9.5, 15.0, 6.0), max(0, back))
        elbL = lerp3((-8.4, 14.0, 1.8), (-10.0, 16.5, 2.5), max(0, back))
        fire = key(t, [(0, 0.2), (0.55, 1.0), (0.64, 1.0), (0.66, 0.0), (1, 0)])
        legL = 0.35 * back
        legR = -0.35 * back
    y0 = bob
    # (the body leans from the hips: what is above the hips is turned about them)
    hip = (0.0, 9.5 + y0, 0.0)

    def up(p, k=1.0):
        # a point of the upper body, leaned forward (lean > 0) about the hips, and twisted about the spine
        x, y, z = p
        a = math.radians(lean * k)
        b = math.radians(twist * k)
        dy, dz = y - hip[1], z - hip[2]
        y2 = hip[1] + dy * math.cos(a) - dz * math.sin(a)
        z2 = hip[2] + dy * math.sin(a) + dz * math.cos(a)
        x2 = x * math.cos(b) + z2 * math.sin(b)
        z3 = -x * math.sin(b) + z2 * math.cos(b)
        return (x2, y2, z3)

    # LEGS: digitigrade, a stride
    for sx, st in ((-1, legL), (1, legR)):
        h = (sx * 3.0, 9.5 + y0, 0.0)
        knee = (sx * 4.3, 5.6 + y0 + 0.6 * max(0, st), 2.8 + 2.2 * st)
        ank = (sx * 4.0, 2.4 + 1.4 * max(0, st), -1.2 + 2.6 * st)
        toe = (sx * 4.5, 0.7 + 1.2 * max(0, st), 2.2 + 3.0 * st)
        g = 10 if sx < 0 else 11
        m.chain([h, knee, ank, toe], [2.5, 1.7, 1.25, 1.1], 'skin', g)
        m.chain([toe, (toe[0] - 0.8, toe[1] - 0.2, toe[2] + 1.6)], [0.7, 0.35], 'horn', g)
        m.chain([toe, (toe[0] + 0.8, toe[1] - 0.2, toe[2] + 1.4)], [0.6, 0.3], 'horn', g)
    # HIPS AND BELLY
    m.ell(up((0, 10.5 + y0, 0.2)), (5.0, 4.4, 4.2), 'skin', 1)
    # CHEST, a little barrel, the fire showing through cracks in it
    m.ell(up((0, 15.5 + y0, 0.6)), (6.0, 4.8, 4.6), 'skin', 1, rot=(lean * 0.0, 0, 0))
    m.curve([up((-0.6, 17.2 + y0, 4.9)), up((0.6, 15.2 + y0, 5.2)), up((-0.4, 13.2 + y0, 4.9)), up((0.4, 11.4 + y0, 4.2))],
            [0.7, 0.9, 0.8, 0.6], 'ember', 1, n=6)
    # WINGS: small bat wings behind the shoulders
    for sx in (-1, 1):
        root = up((sx * 3.2, 18.5 + y0, -3.0))
        spread = 0.65 + 0.35 * wing
        elbow = up((sx * (6.0 + 3.0 * spread), 25.0 + y0 + 1.5 * wing, -5.5))
        tip = up((sx * (9.0 + 4.5 * spread), 28.5 + y0 + 2.5 * wing, -6.5 + 1.0 * wing))
        g = 20 + (sx > 0)
        m.chain([root, elbow, tip], [1.0, 0.7, 0.35], 'bone', g)
        # (the membrane hangs from the arm in three scallops, to the fingers' ends)
        fingers = [up((sx * (7.5 + 2.0 * spread), 17.0 + y0, -6.0)), up((sx * (10.0 + 3.0 * spread), 19.5 + y0, -6.4)), tip]
        for k, f in enumerate(fingers[:2]):
            m.chain([elbow, f], [0.45, 0.3], 'bone', g)
        anchors = [root, fingers[0], fingers[1], tip]
        for k in range(3):
            a0, a1 = anchors[k], anchors[k + 1]
            top = elbow if k > 0 else root
            ctr = ((a0[0] + a1[0] + top[0]) / 3, (a0[1] + a1[1] + top[1]) / 3 + 0.5, (a0[2] + a1[2] + top[2]) / 3 - 0.3)
            m.ell(ctr, (2.3, 3.0, 0.45), 'wing', g, rot=(0, sx * 25, sx * (-25 + 18 * k)))
    # TAIL: from the base of the spine, curling, a spade at its tip
    tl = [(0, 9.0 + y0, -3.5), (0.6 * tail, 6.5 + y0, -7.5), (2.0 + 1.6 * tail, 5.0 + y0, -10.5), (3.5 + 2.4 * tail, 6.5 + y0, -13.0)]
    m.curve(tl, [1.4, 1.1, 0.8, 0.55], 'skin', 30, n=10)
    tip = tl[-1]
    m.ell((tip[0] + 0.6, tip[1] + 1.2, tip[2] - 1.0), (1.6, 1.4, 0.7), 'dark', 30, rot=(0, 30, 20 + 15 * tail))
    # HEAD: big for its body, a jutting muzzle, long ears, two horns sweeping back
    hc = up((0, 23.2 + y0, 1.6), 1.2)
    m.ell(hc, (5.9, 5.2, 5.0), 'skin', 2)
    m.ell(up((0, 20.8 + y0, 4.8), 1.2), (3.6, 2.3, 2.6), 'skin', 2)
    m.ell(up((0, 24.6 + y0, 5.0), 1.2), (4.6, 1.3, 1.5), 'dark', 2)  # the brow ridge, heavy over the eyes
    m.ell(up((0, 19.9 - 0.9 * jaw + y0, 6.4), 1.2), (2.8, 0.6 + 0.8 * jaw, 0.8), 'mouth', 2)
    for sx in (-1, 1):
        m.ell(up((sx * 2.1, 23.2 + y0, 6.0), 1.2), (1.35, 1.0, 0.8), 'eye', 2)
        m.chain([up((sx * 5.2, 23.6 + y0, 1.0), 1.2), up((sx * 8.2, 24.6 + y0, 0.0), 1.2)], [1.3, 0.3], 'skin', 2)
        m.curve([up((sx * 3.2, 27.4 + y0, 2.4), 1.2), up((sx * 5.4, 29.4 + y0, 1.4), 1.2), up((sx * 6.2, 31.6 + y0, -0.8), 1.2),
                 up((sx * 5.4, 33.2 + y0, -3.0), 1.2)], [1.9, 1.3, 0.8, 0.35], 'horn', 2, n=8)
    # ARMS: shoulder, elbow, claw
    for sx, elb, hand in ((-1, elbL, armL), (1, elbR, armR)):
        sh = up((sx * 5.6, 17.6 + y0, 0.4))
        e = up((elb[0], elb[1] + y0, elb[2]))
        hd = up((hand[0], hand[1] + y0, hand[2]))
        g = 40 + (sx > 0)
        m.chain([sh, e, hd], [1.9, 1.45, 1.55], 'skin', g)
        for k in (-1, 0, 1):
            m.chain([hd, (hd[0] + 0.7 * k, hd[1] - 1.6, hd[2] + 1.2)], [0.55, 0.25], 'horn', g)
        if sx > 0 and fire > 0.05:
            fire_at = (hd[0], hd[1] + 2.2 * fire, hd[2] + 0.5)
    if fire_at is not None:
        r = 1.2 + 2.6 * fire
        m.ball(fire_at, r, 'fire', 50)
        m.ball((fire_at[0] - 0.4, fire_at[1] + r * 0.9, fire_at[2] - 0.2), r * 0.55, 'fire', 50)
        m.ball((fire_at[0] + 0.6, fire_at[1] + r * 1.4, fire_at[2]), r * 0.3, 'fire', 50)
    return m, mats


# ---------------------------------------------------------------------------------------------------------------------------
# THE RIMELING
RIME_MATS = {
    'cloak': {'ramp': ['#16284a', '#22406a', '#335c90', '#4a7cb4', '#6c9cd0']},
    'ice': {'ramp': ['#2a5e98', '#4a90d8', '#80c4f8', '#c4ecff', '#f0fbff']},
    'void': {'ramp': ['#060a16', '#0c1222']},
    'eye': {'ramp': ['#28dcf0', '#c8f8ff'], 'glow': True},
    'shard': {'ramp': ['#4a90d8', '#9ad4ff', '#e8f8ff'], 'glow': True},
}
# (the hem's icicles: angle round it, how long)
HEM = [(0.05, 9.5), (0.18, 7.0), (0.31, 10.0), (0.44, 7.5), (0.57, 9.0), (0.70, 6.5), (0.83, 9.8), (0.95, 8.0)]


def rimeling(anim, t, side='friend'):
    m = Model()
    mats = dict(RIME_MATS)
    if side == 'foe':
        mats['eye'] = {'ramp': ['#ff4f8a', '#ffc0d4'], 'glow': True}
    hov = 6.0
    lean = 0.0
    trail = 0.0
    handR = (9.6, 13.6, 5.0)
    handL = (-9.6, 13.6, 5.0)
    elbR = (10.0, 17.6, 2.6)
    elbL = (-10.0, 17.6, 2.6)
    spike = 0.0
    spike_at = None
    sway = 0.0
    if anim == 'idle':
        hov += 1.2 * s(t)
        sway = s(t + 0.25)
        handR = (8.8, 13.2 + 0.8 * s(t + 0.1), 4.2)
        handL = (-8.8, 13.2 + 0.8 * s(t + 0.35), 4.2)
    elif anim == 'walk':
        hov += 0.6 * s(t * 2)
        lean = 14.0
        trail = 1.0
        sway = 0.5 * s(t)
        handR = (8.0, 12.6, 2.6 + 1.0 * s(t))
        handL = (-8.0, 12.6, 2.6 - 1.0 * s(t))
    elif anim == 'attack':
        back = key(t, [(0, 0), (0.55, 1), (0.62, 1.05), (0.68, -1), (0.85, -0.7), (1, 0)])
        lean = -10 * max(0, back) + 18 * max(0, -back)
        hov += 1.5 * max(0, back)
        trail = 0.6 * max(0, -back) - 0.4 * max(0, back)
        if back >= 0:
            handR = lerp3((9.6, 13.6, 5.0), (3.6, 33.5, 1.5), back)
            handL = lerp3((-9.6, 13.6, 5.0), (-3.6, 33.5, 1.5), back)
            elbR = lerp3((10.0, 17.6, 2.6), (9.0, 27.5, 1.0), back)
            elbL = lerp3((-10.0, 17.6, 2.6), (-9.0, 27.5, 1.0), back)
        else:
            f = -back
            handR = lerp3((8.6, 13.4, 4.4), (2.6, 19.0, 11.5), f)
            handL = lerp3((-8.6, 13.4, 4.4), (-2.6, 19.0, 11.5), f)
            elbR = lerp3((9.2, 17.0, 2.4), (6.5, 20.0, 6.0), f)
            elbL = lerp3((-9.2, 17.0, 2.4), (-6.5, 20.0, 6.0), f)
        spike = key(t, [(0, 0.15), (0.55, 1.0), (0.64, 1.0), (0.66, 0.0), (1, 0)])
        sway = -0.5 * back
    y = hov
    piv = (0.0, 12.0 + y, 0.0)

    def up(p):
        x, yy, z = p
        a = math.radians(lean)
        dy, dz = yy - piv[1], z - piv[2]
        return (x, piv[1] + dy * math.cos(a) - dz * math.sin(a), piv[2] + dy * math.sin(a) + dz * math.cos(a))

    # THE HEM: icicles hanging round it, swaying, trailing as it glides
    for k, (a, ln) in enumerate(HEM):
        ang = a * TAU
        r = 4.6
        top = up((r * math.cos(ang), 11.5 + y, r * math.sin(ang) * 0.9))
        sw = 0.9 * math.sin(ang * 2 + sway * 2.0)
        low = up((1.05 * r * math.cos(ang) + sw, 11.5 + y - ln, 1.05 * r * math.sin(ang) * 0.9 - 3.5 * trail - 0.6))
        m.chain([top, low], [2.0, 0.3], 'ice', 60 + k % 2)
    # THE ROBE: tapering down from the mantle
    m.ell(up((0, 12.5 + y, 0.0)), (4.4, 3.0, 3.6), 'cloak', 1)
    m.ell(up((0, 15.5 + y, 0.2)), (5.4, 4.6, 4.2), 'cloak', 1)
    m.ell(up((0, 20.5 + y, -0.4)), (7.4, 4.0, 4.9), 'cloak', 1)
    # (frost crusted on the mantle: shards standing off the shoulders)
    for sx in (-1, 1):
        m.chain([up((sx * 6.0, 22.0 + y, 0.4)), up((sx * 10.0, 26.4 + y, -0.6))], [1.6, 0.3], 'ice', 3)
        m.chain([up((sx * 5.0, 23.0 + y, -1.4)), up((sx * 7.2, 28.6 + y, -3.0))], [1.3, 0.25], 'ice', 3)
    # THE HOOD: a deep cowl, its point falling back; in it, the dark and two eyes
    m.ell(up((0, 26.6 + y, 0.2)), (5.0, 5.2, 5.0), 'cloak', 2)
    m.curve([up((0, 30.0 + y, -1.0)), up((0, 32.6 + y, -3.6)), up((0.4, 32.4 + y, -6.4)), up((1.2, 30.6 + y, -8.4))],
            [3.0, 2.0, 1.1, 0.4], 'cloak', 2, n=8)
    m.ell(up((0, 26.2 + y, 3.8)), (3.3, 3.9, 1.4), 'void', 2)
    for sx in (-1, 1):
        m.ell(up((sx * 1.35, 26.6 + y, 4.9)), (0.85, 0.65, 0.5), 'eye', 2)
    # ARMS: long and thin, their sleeves ragged, their claws of ice
    for sx, elb, hand in ((-1, elbL, handL), (1, elbR, handR)):
        sh = up((sx * 6.2, 21.0 + y, 0.2))
        e = up((elb[0], elb[1] + y, elb[2]))
        hd = up((hand[0], hand[1] + y, hand[2]))
        g = 40 + (sx > 0)
        m.chain([sh, e], [1.7, 1.3], 'cloak', g)
        m.chain([e, hd], [1.3, 1.6], 'cloak', g)
        for k in (-1, 0, 1):
            m.chain([hd, (hd[0] + 0.8 * k, hd[1] - 2.2, hd[2] + 1.4)], [0.6, 0.2], 'ice', g)
    # THE ICICLE it draws between its claws over its head, growing
    if spike > 0.05:
        hr = up((handR[0], handR[1] + y, handR[2]))
        hl = up((handL[0], handL[1] + y, handL[2]))
        mid = ((hr[0] + hl[0]) / 2, (hr[1] + hl[1]) / 2 + 2.5, (hr[2] + hl[2]) / 2 + 0.5)
        ln = 3.0 + 8.0 * spike
        m.chain([(mid[0] - ln * 0.5, mid[1] - 0.4, mid[2] + 0.6), (mid[0] + ln * 0.6, mid[1] + 1.0, mid[2] + 1.2)], [1.2 + 1.3 * spike, 0.3], 'shard', 50)
    return m, mats


# ---------------------------------------------------------------------------------------------------------------------------
# THE STORMWISP
WISP_MATS = {
    'wisp': {'ramp': ['#5a4e86', '#a49a78', '#ecd456', '#fff27a', '#fffde8'], 'gamma': 0.75},
    'core': {'ramp': ['#fff060', '#fffbd0', '#ffffff'], 'glow': True},
    'void': {'ramp': ['#1a1406', '#2a200a']},
    'eye': {'ramp': ['#28dcf0', '#c8f8ff'], 'glow': True},
}
SPARK = [(255, 251, 208), (255, 240, 96)]


def draw_sparks(img, n, seed):
    """Zigzag sparks crackling off it: `n` of them, each from a pixel just off its edge, jagging outward 3 to 5 pixels; drawn
    after its edge, as light, not body."""
    import random
    import numpy as np
    H, W = img.shape[:2]
    a = img[..., 3] > 0
    if not a.any():
        return
    ys, xs = np.where(a)
    cx, cy = xs.mean(), ys.mean()
    rnd = random.Random(seed)
    edge = []
    for y, x in zip(ys, xs):
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            if 0 <= x + dx < W and 0 <= y + dy < H and not a[y + dy, x + dx]:
                edge.append((x + dx, y + dy))
                break
    for _ in range(n):
        x, y = rnd.choice(edge)
        vx, vy = x - cx, y - cy
        d = max(1e-6, (vx * vx + vy * vy) ** 0.5)
        vx, vy = vx / d, vy / d
        for k in range(rnd.randint(3, 5)):
            if 0 <= x < W and 0 <= y < H and img[y, x, 3] == 0:
                img[y, x, :3] = SPARK[k % 2]
                img[y, x, 3] = 255
            side = rnd.choice((-1, 1))
            x = int(round(x + vx + side * -vy * 0.9))
            y = int(round(y + vy + side * vx * 0.9))


def stormwisp(anim, t, side='friend'):
    m = Model()
    mats = dict(WISP_MATS)
    if side == 'foe':
        mats['eye'] = {'ramp': ['#ff4f8a', '#ffc0d4'], 'glow': True}
    hov = 8.0
    lean = 0.0
    fwd = 0.0
    whip = 0.0
    spk = 3
    flash = 0.0
    armR = (7.6, 17.0, 4.2)
    armL = (-7.6, 17.0, 4.2)
    crown = 1.0
    if anim == 'idle':
        hov += 1.5 * s(t)
        whip = s(t + 0.3)
        crown = 0.85 + 0.15 * s(t * 2)
    elif anim == 'walk':
        hov += 0.8 * s(t * 2)
        lean = 26.0
        whip = 0.6 * s(t * 2)
        armR = (6.6, 15.4, 0.8)
        armL = (-6.6, 15.4, 0.8)
    elif anim == 'attack':
        back = key(t, [(0, 0), (0.55, 1), (0.62, 1.05), (0.66, -1), (0.82, -0.8), (1, 0)])
        lean = -16 * max(0, back) + 30 * max(0, -back)
        fwd = -2.0 * max(0, back) + 4.0 * max(0, -back)
        hov += 1.0 * max(0, back)
        whip = -1.0 * back
        spk = 3 + int(5 * max(0, back))
        crown = 1.0 + 0.4 * max(0, back)
        flash = key(t, [(0, 0), (0.62, 0), (0.64, 1.0), (0.74, 0.5), (0.8, 0)])
        if back >= 0:
            armR = lerp3((7.6, 17.0, 4.2), (8.4, 20.5, -2.0), back)
            armL = lerp3((-7.6, 17.0, 4.2), (-8.4, 20.5, -2.0), back)
        else:
            armR = lerp3((7.6, 17.0, 4.2), (3.4, 18.0, 8.5), -back)
            armL = lerp3((-7.6, 17.0, 4.2), (-3.4, 18.0, 8.5), -back)
    y = hov
    piv = (0.0, 16.0 + y, 0.0)

    def up(p):
        x, yy, z = p
        a = math.radians(lean)
        dy, dz = yy - piv[1], z - piv[2]
        return (x, piv[1] + dy * math.cos(a) - dz * math.sin(a), piv[2] + dy * math.sin(a) + dz * math.cos(a) + fwd)

    # THE TAIL: streaming down and back from the head, hooked at its end
    m.curve([up((0, 17.5 + y, -0.6)), up((0.4 + 0.8 * whip, 13.0 + y, -2.6)), up((1.6 + 1.8 * whip, 9.0 + y, -4.4)),
             up((3.8 + 2.0 * whip, 6.6 + y, -4.2)), up((5.4 + 1.6 * whip, 7.2 + y, -2.0))],
            [3.6, 2.4, 1.5, 0.8, 0.3], 'wisp', 1, n=10)
    # THE HEAD: a flame-shaped crown of spikes on it
    m.ell(up((0, 21.0 + y, 0.4)), (4.8, 5.0, 4.6), 'wisp', 1)
    for k, (ax, az, h) in enumerate(((0.0, 0.0, 1.0), (-2.6, 0.6, 0.8), (2.6, 0.6, 0.8), (-1.4, -2.2, 0.75), (1.6, -2.0, 0.7))):
        hh = h * crown
        base = up((ax * 0.8, 24.2 + y, az * 0.8 + 0.2))
        tip = up((ax * 1.9, 24.2 + y + 4.6 * hh, az * 1.9 - 0.8))
        m.chain([base, tip], [1.4, 0.2], 'wisp', 1)
    # THE FACE: two slanted dark eyes with points of light in them, a crooked grin
    for sx in (-1, 1):
        m.ell(up((sx * 1.8, 21.5 + y, 4.3)), (1.45, 1.7, 0.7), 'void', 2, rot=(0, 0, sx * 25))
        m.ball(up((sx * 1.7, 21.3 + y, 4.95)), 0.6, 'eye', 2)
    m.ell(up((0.3, 18.8 + y, 4.5)), (1.8, 0.45, 0.5), 'void', 2, rot=(0, 0, -8))
    # ARMS: two little spark-arms, crackling
    for sx, hand in ((-1, armL), (1, armR)):
        sh = up((sx * 4.0, 18.6 + y, 0.8))
        hd = up((hand[0], hand[1] + y, hand[2]))
        el = up(((sx * 4.0 + hand[0]) / 2 + sx * 1.0, (18.6 + hand[1]) / 2 - 1.2 + y, (0.8 + hand[2]) / 2))
        m.chain([sh, el, hd], [1.2, 0.8, 0.45], 'wisp', 40 + (sx > 0))
    if flash > 0.05:
        fa = up((0, 19.0 + y, 9.5))
        m.ball(fa, 1.0 + 1.8 * flash, 'core', 50)
    seed = int(t * 1000) + {'idle': 1, 'walk': 2, 'attack': 3}[anim] * 7919
    return m, mats, (lambda img, yaw: draw_sparks(img, spk, seed + int(yaw)))


# ---------------------------------------------------------------------------------------------------------------------------
# THE BLIGHT TOAD
TOAD_MATS = {
    'skin': {'ramp': ['#1a2410', '#2c3e16', '#44601c', '#628226', '#86a432']},
    'belly': {'ramp': ['#4a4a22', '#6e6c30', '#949040', '#bcb658']},
    'wart': {'ramp': ['#7a9a1c', '#b4cc24', '#e4f46a'], 'glow': True},
    'eyeball': {'ramp': ['#6a6a1a', '#a8a42a', '#d8d04a', '#f0ec88']},
    'void': {'ramp': ['#0e1206', '#1a200c']},
    'eye': {'ramp': ['#28dcf0', '#c8f8ff'], 'glow': True},
    'venom': {'ramp': ['#7a9a1c', '#b4cc24', '#e4f46a'], 'glow': True},
}
WARTS = [(-3.5, 14.2, -2.0, 1.0), (3.0, 14.6, -1.0, 1.1), (0.0, 15.6, -4.5, 0.9), (-5.6, 12.0, -4.0, 0.8), (5.4, 12.4, -4.6, 0.9),
         (-1.8, 14.8, 1.5, 0.7), (2.2, 13.0, -6.6, 0.8), (-3.0, 12.4, -6.8, 0.7)]


def toad(anim, t, side='friend'):
    m = Model()
    mats = dict(TOAD_MATS)
    if side == 'foe':
        mats['eye'] = {'ramp': ['#ff4f8a', '#ffc0d4'], 'glow': True}
    lift = 0.0       # how high off the ground
    squash = 1.0     # body height
    pitch = 0.0      # nose up (+) or down
    sac = 0.4        # throat sac, 0..1
    mouth = 0.0
    legs = 0.0       # back legs out, 0 tucked .. 1 kicked out behind
    arms = 0.0       # front legs reach, 0 .. 1
    glob = 0.0
    if anim == 'idle':
        sac = 0.35 + 0.35 * max(0, s(t))
        squash = 1.0 + 0.03 * s(t)
    elif anim == 'walk':
        # a hop: crouch, spring, fly, land
        ph = t
        lift = 7.0 * max(0.0, math.sin(min(1.0, max(0.0, (ph - 0.25) / 0.6)) * math.pi))
        squash = key(ph, [(0, 1.0), (0.2, 0.82), (0.3, 1.12), (0.75, 1.05), (0.88, 0.8), (1, 1.0)])
        legs = key(ph, [(0, 0.0), (0.25, 0.0), (0.35, 1.0), (0.7, 0.6), (0.88, 0.0), (1, 0)])
        arms = key(ph, [(0, 0.0), (0.3, 0.2), (0.6, 0.9), (0.85, 0.4), (1, 0)])
        pitch = key(ph, [(0, 0), (0.3, 12), (0.7, -6), (0.88, -4), (1, 0)])
    elif anim == 'attack':
        back = key(t, [(0, 0), (0.55, 1), (0.62, 1.05), (0.66, -1), (0.82, -0.8), (1, 0)])
        sac = 0.4 + 0.6 * max(0, back)
        pitch = 14 * max(0, back) - 12 * max(0, -back)
        squash = 1.0 + 0.08 * max(0, back) - 0.08 * max(0, -back)
        mouth = max(0, -back)
        glob = key(t, [(0, 0), (0.62, 0), (0.645, 1.0), (0.72, 0.0), (1, 0)])
        arms = 0.3 * max(0, -back)
    y = lift
    piv = (0.0, 6.0 + y, 3.0)

    def up(p):
        x, yy, z = p
        yy = 0.0 + (yy - 0.0) * squash if lift == 0 else yy
        a = math.radians(-pitch)
        dy, dz = yy + y - piv[1], z - piv[2]
        return (x, piv[1] + dy * math.cos(a) - dz * math.sin(a), piv[2] + dy * math.sin(a) + dz * math.cos(a))

    # BACK LEGS: big folded haunches, the feet kicked out behind as it leaps
    for sx in (-1, 1):
        g = 10 + (sx > 0)
        m.ell(up((sx * 7.0, 5.6, -3.4)), (3.6, 4.0, 5.0), 'skin', g, rot=(-20 - 30 * legs, sx * 10, 0))
        knee = up((sx * 8.2, 5.0 - 1.0 * legs, 1.0 - 6.0 * legs))
        foot = up((sx * 8.6, 1.0 + 1.0 * legs, -1.0 - 9.0 * legs))
        m.chain([up((sx * 7.0, 4.0, -5.0)), knee, foot], [2.0, 1.4, 1.2], 'skin', g)
        for k in (-1, 0, 1):
            m.chain([foot, (foot[0] + sx * 0.6 + k * 1.0, foot[1] - 0.6, foot[2] + 2.4 - 3.0 * legs)], [0.7, 0.4], 'skin', g)
    # THE BODY: squat and wide, a pale belly under it
    m.ell(up((0, 8.4, -1.6)), (8.6, 6.4, 8.0), 'skin', 1, rot=(10, 0, 0))
    m.ell(up((0, 5.8, 1.8)), (6.6, 4.0, 5.6), 'belly', 1)
    for (wx, wy, wz, wr) in WARTS:
        m.ball(up((wx, wy, wz)), wr, 'wart', 1)
    # THE HEAD: broad and flat, the mouth a long line, a throat sac under it
    m.ell(up((0, 9.8, 6.4)), (7.6, 4.6, 5.2), 'skin', 2)
    m.ell(up((0, 6.2, 9.0)), (3.8 + 1.8 * sac, 2.2 + 1.8 * sac, 2.4 + 1.4 * sac), 'belly', 2)
    m.ell(up((0, 8.4 - 1.2 * mouth, 11.0)), (5.6, 0.55 + 1.6 * mouth, 1.0), 'void', 2, rot=(0, 0, 0))
    for sx in (-1, 1):
        m.ball(up((sx * 4.2, 13.6, 6.4)), 2.9, 'eyeball', 3 + (sx > 0))
        m.ell(up((sx * 4.6, 13.8, 9.1)), (1.2, 1.5, 0.6), 'void', 3 + (sx > 0))
        m.ell(up((sx * 4.6, 13.9, 9.5)), (0.6, 0.8, 0.4), 'eye', 3 + (sx > 0))
    # FRONT LEGS
    for sx in (-1, 1):
        g = 1
        sh = up((sx * 5.4, 5.4, 6.4))
        el = up((sx * 8.2, 3.4, 7.4 + 1.5 * arms))
        hd = up((sx * 8.6, 0.9 + 1.0 * arms, 9.6 + 2.5 * arms))
        m.chain([sh, el, hd], [1.9, 1.4, 1.2], 'skin', g)
        for k in (-1, 0, 1):
            m.chain([hd, (hd[0] + k * 1.0, hd[1] - 0.4, hd[2] + 1.8)], [0.6, 0.35], 'skin', g)
    if glob > 0.05:
        m.ball(up((0, 8.6, 14.0)), 1.2 + 1.8 * glob, 'venom', 50)
    return m, mats


# ---------------------------------------------------------------------------------------------------------------------------
# THE BONEBRUTE
BONE_MATS = {
    'bone': {'ramp': ['#2c2824', '#585044', '#8c8270', '#bcb29a', '#e6dec8']},
    'dark': {'ramp': ['#141018', '#201a22']},
    'eye': {'ramp': ['#28dcf0', '#c8f8ff'], 'glow': True},
}


def bonebrute(anim, t, side='friend'):
    m = Model()
    mats = dict(BONE_MATS)
    if side == 'foe':
        mats['eye'] = {'ramp': ['#ff4f8a', '#ffc0d4'], 'glow': True}
    bob = 0.0
    hunch = 18.0
    sway = 0.0
    stride = 0.0
    breathe = 0.0
    jaw = 0.0
    fistR = (12.6, 12.0, 6.0)
    fistL = (-12.6, 12.0, 6.0)
    elbR = (14.4, 23.0, 1.5)
    elbL = (-14.4, 23.0, 1.5)
    crouch = 0.0
    if anim == 'idle':
        breathe = s(t)
        bob = 0.5 * s(t)
        fistR = (12.6, 12.0 + 0.6 * s(t), 6.0)
        fistL = (-12.6, 12.0 + 0.6 * s(t + 0.1), 6.0)
        jaw = 0.3 + 0.3 * s(t)
    elif anim == 'walk':
        stride = s(t)
        bob = 1.2 * abs(c(t))
        sway = 6 * s(t)
        fistR = (12.4, 12.6 + 1.0 * c(t), 6.0 - 4.0 * s(t))
        fistL = (-12.4, 12.6 - 1.0 * c(t), 6.0 + 4.0 * s(t))
        elbR = (14.2, 23.0, 1.5 - 2.0 * s(t))
        elbL = (-14.2, 23.0, 1.5 + 2.0 * s(t))
    elif anim == 'attack':
        # both fists up over its head, rearing back; down on the ground in a flash; held, then back up
        back = key(t, [(0, 0), (0.52, 1), (0.6, 1.05), (0.64, -1), (0.8, -1), (1, 0)])
        hunch = 18 - 22 * max(0, back) + 14 * max(0, -back)
        crouch = 3.5 * max(0, -back)
        jaw = 0.8 * max(0, back) + 0.4 * max(0, -back)
        if back >= 0:
            fistR = lerp3((12.6, 12.0, 6.0), (6.0, 52.0, -3.0), back)
            fistL = lerp3((-12.6, 12.0, 6.0), (-6.0, 52.0, -3.0), back)
            elbR = lerp3((14.4, 23.0, 1.5), (13.0, 44.0, -2.0), back)
            elbL = lerp3((-14.4, 23.0, 1.5), (-13.0, 44.0, -2.0), back)
        else:
            f = -back
            fistR = lerp3((12.6, 12.0, 6.0), (5.0, 4.6, 14.0), f)
            fistL = lerp3((-12.6, 12.0, 6.0), (-5.0, 4.6, 14.0), f)
            elbR = lerp3((14.4, 23.0, 1.5), (11.0, 18.0, 8.0), f)
            elbL = lerp3((-14.4, 23.0, 1.5), (-11.0, 18.0, 8.0), f)
    y = bob - crouch
    hipy = 19.0 + y
    piv = (0.0, hipy, 0.0)

    def up(p, k=1.0):
        x, yy, z = p
        a = math.radians(hunch * k)
        b = math.radians(sway * k)
        dy, dz = yy - piv[1], z - piv[2]
        y2 = piv[1] + dy * math.cos(a) - dz * math.sin(a)
        z2 = piv[2] + dy * math.sin(a) + dz * math.cos(a)
        return (x * math.cos(b) + z2 * math.sin(b), y2, -x * math.sin(b) + z2 * math.cos(b))

    # LEGS: thick bones, wide-set, a heavy stride
    for sx, st in ((-1, stride), (1, -stride)):
        g = 10 + (sx > 0)
        hp = (sx * 4.6, hipy, 0.0)
        kn = (sx * 6.0, 10.5 + y * 0.5 + 1.5 * max(0, st), 2.6 + 3.0 * st)
        an = (sx * 6.0, 2.6 + 1.8 * max(0, st), -0.6 + 3.5 * st)
        m.chain([hp, kn], [2.4, 2.0], 'bone', g)
        m.ball(kn, 2.5, 'bone', g)
        m.chain([kn, an], [1.9, 1.7], 'bone', g)
        m.ell((an[0], an[1] - 1.4, an[2] + 2.0), (2.4, 1.3, 3.6), 'bone', g)
    # PELVIS
    m.ell(up((0, hipy + 0.5, -0.4)), (6.4, 3.2, 4.2), 'bone', 1)
    # SPINE: vertebrae up the hunched back
    for k in range(9):
        f = k / 8
        m.ball(up((0, hipy + 2.0 + f * 18.0, -2.6 - 1.5 * math.sin(f * math.pi))), 1.9 - 0.4 * f, 'bone', 1)
    # RIBS: a cage of curved bones round the chest, rising and falling as it breathes
    for k, (ry, rw, rd) in enumerate(((26.0, 7.6, 5.6), (29.0, 8.6, 6.2), (32.0, 9.0, 6.4), (35.0, 8.4, 6.0))):
        ry2 = ry + 0.4 * breathe * (k / 3) + y
        pts = []
        for j in range(15):
            a = -math.pi * 0.95 + j / 14 * math.pi * 1.9
            pts.append(up((rw * math.sin(a), ry2 - 1.2 * math.cos(a) - 1.0, -2.4 + rd * math.cos(a) * -1)))
        m.curve(pts, [1.1, 1.1], 'bone', 30 + k, n=3)
    m.chain([up((0, 25.0 + y, 4.0)), up((0, 35.5 + y, 4.2))], [1.3, 1.1], 'bone', 2)
    # SHOULDERS: great shoulder bones, the blades on its back
    for sx in (-1, 1):
        m.ell(up((sx * 9.6, 37.6 + y, 0.2)), (4.4, 2.8, 3.8), 'bone', 3, rot=(0, 0, sx * -14))
        m.ell(up((sx * 4.4, 33.0 + y, -5.4)), (3.6, 4.6, 1.2), 'bone', 3, rot=(-10, sx * 20, 0))
        # (bone spurs jutting off the shoulders)
        m.chain([up((sx * 11.0, 39.0 + y, -1.0)), up((sx * 15.0, 42.4 + y, -3.0))], [1.3, 0.3], 'bone', 3)
    # SKULL: small for its bulk, thrust forward; a heavy jaw
    # (its neck thrust forward, the skull low between the shoulders, as a brute holds it)
    m.chain([up((0, 36.0 + y, -1.0)), up((0, 35.6 + y, 4.0))], [1.6, 1.4], 'bone', 4)
    sk = up((0, 36.4 + y, 8.0), 1.0)
    m.ell(sk, (4.4, 4.6, 4.6), 'bone', 4)
    m.ell(up((0, 38.4 + y, 11.4), 1.0), (4.0, 1.3, 1.4), 'bone', 4)          # (the brow, heavy)
    m.ell(up((0, 32.6 - 1.6 * jaw + y, 10.2), 1.0), (3.8, 1.8, 3.2), 'bone', 5)
    for k in range(5):
        m.ball(up((-1.8 + k * 0.9, 34.2 - 0.8 * jaw + y, 12.8), 1.0), 0.45, 'bone', 5)
    for sx in (-1, 1):
        m.ell(up((sx * 1.9, 36.8 + y, 12.0), 1.0), (1.7, 1.6, 0.9), 'dark', 4)
        m.ball(up((sx * 1.9, 36.7 + y, 12.7), 1.0), 0.85, 'eye', 4)
    m.ell(up((0, 34.9 + y, 12.7), 1.0), (0.7, 0.8, 0.5), 'dark', 4)
    # ARMS: long, ending in great knuckled fists
    for sx, elb, fist in ((-1, elbL, fistL), (1, elbR, fistR)):
        g = 40 + (sx > 0)
        sh = up((sx * 10.6, 37.0 + y, 0.4))
        e = up((elb[0], elb[1] + y, elb[2])) if anim != 'attack' else (elb[0], elb[1] + y, elb[2])
        f = up((fist[0], fist[1] + y, fist[2])) if anim != 'attack' else (fist[0], fist[1] + y, fist[2])
        m.chain([sh, e], [2.3, 2.0], 'bone', g)
        m.ball(e, 2.4, 'bone', g)
        m.chain([e, f], [2.6, 3.2], 'bone', g)
        m.ell(f, (4.0, 3.6, 3.8), 'bone', g)
        for k in (-1.5, -0.5, 0.5, 1.5):
            m.ball((f[0] + k * 1.6, f[1] - 0.6, f[2] + 3.4), 1.35, 'bone', g)
        m.ball((f[0] - sx * 3.6, f[1] + 0.4, f[2] + 1.6), 1.3, 'bone', g)
    return m, mats


CREATURES = {
    'imp': {'make': imp, 'yaw_front': 38, 'yaw_back': 142, 'canvas': (64, 64), 'origin': (32, 54),
            'frames': {'idle': 8, 'walk': 8, 'attack': 18}, 'fps': {'idle': 8, 'walk': 14, 'attack': 24}, 'hit': 0.66},
    'rimeling': {'make': rimeling, 'yaw_front': 38, 'yaw_back': 142, 'canvas': (64, 64), 'origin': (32, 58),
                 'frames': {'idle': 8, 'walk': 8, 'attack': 18}, 'fps': {'idle': 8, 'walk': 10, 'attack': 24}, 'hit': 0.66},
    'stormwisp': {'make': stormwisp, 'yaw_front': 38, 'yaw_back': 142, 'canvas': (64, 72), 'origin': (32, 66), 'scale': 1.3,
                  'frames': {'idle': 8, 'walk': 8, 'attack': 18}, 'fps': {'idle': 10, 'walk': 14, 'attack': 24}, 'hit': 0.64},
    'toad': {'make': toad, 'yaw_front': 38, 'yaw_back': 142, 'canvas': (72, 60), 'origin': (36, 50), 'scale': 1.15,
             'frames': {'idle': 8, 'walk': 8, 'attack': 16}, 'fps': {'idle': 8, 'walk': 12, 'attack': 24}, 'hit': 0.645},
    'bonebrute': {'make': bonebrute, 'yaw_front': 26, 'yaw_back': 142, 'canvas': (88, 96), 'origin': (44, 84),
                  'frames': {'idle': 8, 'walk': 8, 'attack': 20}, 'fps': {'idle': 6, 'walk': 10, 'attack': 24}, 'hit': 0.64},
}
