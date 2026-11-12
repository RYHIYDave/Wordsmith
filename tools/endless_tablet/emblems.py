"""The four bosses' marks, small (picture pixels), each from the boss's own look as the trophies wall has them
(art/shaft_props.ts paintTrophy): floor 5 the Fleshmancer's skull, floor 10 the Swamp Colossus's eye, floor 15 the Censor's
blank mask, floor 20 the Moth's wing with its eye. `carved`: in the tablet's own stone, a touch of the boss's colour."""
import math
from kit import S, INK, tones, hexc

BONE = [(150, 128, 92), (212, 192, 146), (240, 226, 190)]
PLUM = [(60, 20, 52), (96, 34, 80), (130, 56, 110)]
OLIVE = [(70, 72, 30), (120, 116, 50), (170, 160, 80)]
GOLD = [(140, 100, 20), (210, 160, 40), (250, 214, 90)]
MASK = [(170, 168, 176), (220, 220, 226), (248, 248, 252)]
ASH = [(44, 42, 50), (78, 74, 84), (118, 112, 120)]


def skull(p, cx, cy, s=1.0, carved=False):
    t = [S[4], S[5], S[7]] if carved else BONE
    cr = p.ellipse(cx, cy - 1.5 * s, 5.2 * s, 4.8 * s)
    jaw = p.poly([(cx - 3.4 * s, cy + 1.5 * s), (cx + 3.4 * s, cy + 1.5 * s), (cx + 2.4 * s, cy + 5.5 * s), (cx - 2.4 * s, cy + 5.5 * s)])
    p.shade(cr | jaw, t)
    for sx in (-1, 1):
        p.fill(p.ellipse(cx + sx * 2.1 * s, cy - 0.5 * s, 1.3 * s, 1.5 * s), INK)
    p.fill(p.poly([(cx, cy + 1.2 * s), (cx - 0.8 * s, cy + 2.6 * s), (cx + 0.8 * s, cy + 2.6 * s)]), INK)
    for k in range(-2, 3):
        p.px(cx + k * 1.1 * s, cy + 4.0 * s, INK)


def eye(p, cx, cy, s=1.0, carved=False, shut=False):
    t = [S[4], S[5], S[7]] if carved else [(160, 150, 96), (214, 204, 150), (238, 230, 190)]
    w, h = 6.5 * s, 3.6 * s
    alm = p.poly([(cx - w, cy)] + [(cx - w + 2 * w * i / 10, cy - h * math.sin(math.pi * i / 10)) for i in range(1, 10)] + [(cx + w, cy)] + [(cx + w - 2 * w * i / 10, cy + h * math.sin(math.pi * i / 10)) for i in range(1, 10)])
    p.shade(alm, t)
    if not shut:
        p.shade(p.ellipse(cx, cy, 2.6 * s, 2.6 * s) & alm, [S[3], S[5], S[6]] if carved else GOLD, seam=False)
        p.fill(p.poly([(cx - 0.5 * s, cy - 2.6 * s), (cx + 0.5 * s, cy - 2.6 * s), (cx + 0.5 * s, cy + 2.6 * s), (cx - 0.5 * s, cy + 2.6 * s)]) & alm, INK)
    else:
        p.line((cx - w + 1, cy), (cx + w - 1, cy), INK)


def mask(p, cx, cy, s=1.0, carved=False):
    t = [S[5], S[6], S[7]] if carved else MASK
    m = p.poly([(cx - 4.5 * s, cy - 4 * s), (cx + 4.5 * s, cy - 4 * s), (cx + 4.8 * s, cy), (cx + 3 * s, cy + 4.5 * s), (cx, cy + 6 * s), (cx - 3 * s, cy + 4.5 * s), (cx - 4.8 * s, cy)])
    p.shade(m, t)
    for sx in (-1, 1):
        p.line((cx + sx * 1.2 * s, cy - 0.6 * s), (cx + sx * 3.2 * s, cy - 1.0 * s), INK)
    p.line((cx - 1.2 * s, cy + 3 * s), (cx + 1.2 * s, cy + 3 * s), INK)
    # (its crack)
    p.line((cx + 1.5 * s, cy - 4 * s), (cx + 0.3 * s, cy - 1.5 * s), INK)
    p.line((cx + 0.3 * s, cy - 1.5 * s), (cx + 1.2 * s, cy + 1 * s), INK)


def moth(p, cx, cy, s=1.0, carved=False):
    t = [S[3], S[4], S[6]] if carved else ASH
    for sx in (-1, 1):
        w = p.poly([(cx, cy - 1 * s), (cx + sx * 6.5 * s, cy - 5 * s), (cx + sx * 7.5 * s, cy - 1 * s), (cx + sx * 5.5 * s, cy + 1.5 * s), (cx + sx * 6.5 * s, cy + 5 * s), (cx + sx * 2 * s, cy + 4 * s), (cx, cy + 1 * s)])
        p.shade(w, t)
        p.fill(p.ellipse(cx + sx * 4.2 * s, cy - 1.6 * s, 1.5 * s, 1.1 * s), INK)
        p.px(cx + sx * 4.2 * s, cy - 1.6 * s, [S[6], S[6], S[7]][0] if carved else (200, 190, 150))
    p.shade(p.ellipse(cx, cy + 0.5 * s, 1.2 * s, 4 * s), [S[2], S[3], S[5]] if carved else [(40, 34, 40), (70, 60, 66), (100, 90, 92)])
    for sx in (-1, 1):
        p.line((cx, cy - 3 * s), (cx + sx * 2.5 * s, cy - 6 * s), INK)


MARKS = [skull, eye, mask, moth]
NAMES = ['the Fleshmancer (5)', 'the Swamp Colossus (10)', 'the Censor (15)', 'the Moth (20)']
