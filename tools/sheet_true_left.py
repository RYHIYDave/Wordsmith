#!/usr/bin/env python3
# The sheet for the owner of the TRUE LEFT mock-up (8 Oct 2026; not in the game): the knight facing
# all four ways AS NOW and TURNED FOR REAL, standing, in one frame of his run and at the blow of his
# Strike; at about the size the game shows him, and the two left-facing ways enlarged.
# It lays out pictures made by src/dev/preview_true_left.ts ("cells:4" and "cells:6"):
#   node tools/preview.mjs src/dev/preview_true_left.ts shots/true_left/cells4.png 1100 1400 "cells:4" | grep CELLS > shots/true_left/cells4.json
#   node tools/preview.mjs src/dev/preview_true_left.ts shots/true_left/cells6.png 1600 2100 "cells:6" | grep CELLS > shots/true_left/cells6.json
#   python3 tools/sheet_true_left.py shots/true_left previews/true_left/knight_true_left.png
# Pixels are never smoothed: every picture is cut from the page's own, at its own scale.
import json
import os
import sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
font = lambda path, size: ImageFont.truetype(path, size)
TITLE, SUB, HEAD, LABEL, SMALL = font(B, 44), font(R, 26), font(B, 30), font(B, 23), font(R, 21)
BG, GOLD, PALE, GREY, CYAN, PINKISH = (23, 20, 46), (255, 216, 102), (240, 232, 255), (160, 152, 190), (122, 248, 240), (255, 170, 120)
PAD = 18
W = 1266

def atlas(scale):
    im = Image.open(os.path.join(src, f'cells{scale}.png')).convert('RGB')
    line = open(os.path.join(src, f'cells{scale}.json')).read()
    return im, json.loads(line[line.index('{'):])

def cut(at, row, col, wide, top, bottom):
    """One picture from an atlas: `wide` game pixels across, centred on what it shows (kept inside its cell), from `top` above his feet to `bottom` below."""
    im, m = at
    s = m['scale']
    e = m['extents'][row * len(m['cols']) + col]
    left = m['fx'] + (e['x0'] + e['x1']) / 2 - wide / 2
    left = max(0, min(m['cw'] - wide, left))
    x0 = (col * m['cw'] + left) * s
    y0 = (row * m['ch'] + m['fy'] - top) * s
    return im.crop((round(x0), round(y0), round(x0 + wide * s), round(y0 + (top + bottom) * s)))

small, big = atlas(4), atlas(6)
POSES = ['STANDING', 'RUNNING', 'STRIKING']
WAYS = ['down-right', 'up-right', 'down-left', 'up-left']
# (rows of an atlas: each pose now, then true; columns: the four ways)
row_of = lambda pose, true: pose * 2 + (1 if true else 0)

probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
def wrap(text, f, width):
    lines, line = [], ''
    for w in text.split(' '):
        t = (line + ' ' + w).strip()
        if probe.textlength(t, font=f) <= width:
            line = t
        else:
            lines.append(line)
            line = w
    if line:
        lines.append(line)
    return lines

def arrow(d, cx, cy, way, size, color):
    """An arrow along the floor the way he faces (the grid's diagonals as the screen shows them)."""
    dx, dy = {'down-right': (2, 1), 'up-right': (2, -1), 'down-left': (-2, 1), 'up-left': (-2, -1)}[way]
    n = (dx * dx + dy * dy) ** 0.5
    ux, uy = dx / n, dy / n
    tail = (cx - ux * size, cy - uy * size)
    tip = (cx + ux * size, cy + uy * size)
    d.line([tail, tip], fill=color, width=5)
    px, py = -uy, ux
    head = size * 0.62
    d.polygon([(tip[0] + ux * 4, tip[1] + uy * 4), (tip[0] - ux * head + px * head * 0.6, tip[1] - uy * head + py * head * 0.6), (tip[0] - ux * head - px * head * 0.6, tip[1] - uy * head - py * head * 0.6)], fill=color)

def sun(sheet, x, y, color=(255, 226, 120)):
    """Where the light falls from: a small sun, on a dark disc so that it stands clear of the picture under it."""
    import math
    disc = Image.new('L', sheet.size, 0)
    ImageDraw.Draw(disc).ellipse([x - 19, y - 19, x + 19, y + 19], fill=170)
    sheet.paste((14, 12, 30), (0, 0), disc)
    d = ImageDraw.Draw(sheet)
    r = 7
    d.ellipse([x - r, y - r, x + r, y + r], fill=color)
    for k in range(8):
        a = k * math.pi / 4
        d.line([(x + math.cos(a) * (r + 3), y + math.sin(a) * (r + 3)), (x + math.cos(a) * (r + 8), y + math.sin(a) * (r + 8))], fill=color, width=3)

# ---- the parts of the sheet, each drawn at a given top and returning its height ----
parts = []

def header(d, y, draw=True):
    h = 0
    if draw:
        d.text((PAD, y), 'The knight facing left: as now, and turned for real', font=TITLE, fill=GOLD)
    h += 58
    for line in ['NOW: the game turns his right-facing picture over.', 'TRUE: the same knight, turned round for real.', 'Only a picture: none of this is in the game.']:
        if draw:
            d.text((PAD, y + h), line, font=SUB, fill=PALE)
        h += 34
    return h + 12

# THE TABLE AT GAME SIZE: a column of labels, then two columns (now, true) for each pose
LAB = 102
COL = 190
GAP = 4
TOP4, BOT4 = 34, 8          # game pixels above and below his feet
CELL4 = (TOP4 + BOT4) * 4

def table(sheet, d, y, draw=True):
    h = 0
    if draw:
        d.text((PAD, y), 'ALL FOUR WAYS', font=HEAD, fill=GOLD)
        d.text((PAD + probe.textlength('ALL FOUR WAYS', font=HEAD) + 14, y + 6), 'about the size you see in the game; framed: the ones that change', font=SUB, fill=PALE)
    h += 46
    # the poses over their two columns, and "now" / "TRUE" under each
    for p, pose in enumerate(POSES):
        x = PAD + LAB + p * 2 * (COL + GAP)
        if draw:
            tw = probe.textlength(pose, font=LABEL)
            d.text((x + (2 * COL + GAP - tw) / 2, y + h), pose, font=LABEL, fill=PALE)
            for k, (word, color) in enumerate([('now', GREY), ('TRUE', CYAN)]):
                tw = probe.textlength(word, font=LABEL)
                d.text((x + k * (COL + GAP) + (COL - tw) / 2, y + h + 30), word, font=LABEL, fill=color)
    h += 64
    for w, way in enumerate(WAYS):
        top = y + h
        if draw:
            d.text((PAD, top + CELL4 / 2 - 40), way.split('-')[0], font=LABEL, fill=PALE)
            d.text((PAD, top + CELL4 / 2 - 14), way.split('-')[1], font=LABEL, fill=PALE)
            arrow(d, PAD + 40, top + CELL4 / 2 + 34, way, 18, GOLD)
            for p in range(3):
                for k, true in enumerate([False, True]):
                    x = PAD + LAB + (p * 2 + k) * (COL + GAP)
                    sheet.paste(cut(small, row_of(p, true), w, COL / 4, TOP4, BOT4), (x, top))
                    # (the pictures that change: a cyan frame round the true ones)
                    if true and way.endswith('left'):
                        d.rectangle([x - 1, top - 1, x + COL, top + CELL4], outline=CYAN, width=3)
        h += CELL4 + GAP
    return h + 10

# THE TWO LEFT-FACING WAYS, ENLARGED: four columns (down-left now, true; up-left now, true), a row for each pose
BCOL = 306
BGAP = 14
TOP6, BOT6 = 35, 8
CELL6 = (TOP6 + BOT6) * 6
COLS6 = [('DOWN-LEFT', 'now', 2, False), ('DOWN-LEFT', 'TRUE', 2, True), ('UP-LEFT', 'now', 3, False), ('UP-LEFT', 'TRUE', 3, True)]
NOTES6 = ['picture turned over', 'turned for real', 'picture turned over', 'turned for real']

def enlarged(sheet, d, y, draw=True):
    h = 0
    if draw:
        d.text((PAD, y), 'FACING LEFT, ENLARGED', font=HEAD, fill=GOLD)
    h += 46
    for c, (way, which, col, true) in enumerate(COLS6):
        x = PAD + c * (BCOL + BGAP)
        if draw:
            d.text((x, y + h), f'{way} {which}', font=LABEL, fill=CYAN if true else GREY)
            d.text((x, y + h + 28), NOTES6[c], font=SMALL, fill=PALE)
    h += 62
    for p, pose in enumerate(POSES):
        if draw:
            d.text((PAD, y + h), pose, font=LABEL, fill=PALE)
        h += 32
        top = y + h
        for c, (way, which, col, true) in enumerate(COLS6):
            x = PAD + c * (BCOL + BGAP)
            if draw:
                sheet.paste(cut(big, row_of(p, true), col, BCOL / 6, TOP6, BOT6), (x, top))
                if true:
                    d.rectangle([x - 1, top - 1, x + BCOL, top + CELL6], outline=CYAN, width=3)
                # (where the light falls from: the picture's top left, or its top right on a picture turned over)
                sun(sheet, x + 24 if true else x + BCOL - 24, top + 24)
        h += CELL6 + 12
    return h

KEY = [
    ('NOW', GREY, 'facing left he is his picture turned over: walking down-left his sword is on his left side, and he is lit from the right.'),
    ('TRUE', CYAN, 'he is turned round for real: his sword stays on his right side and the light comes from the left, like everything else. But walking down-left he shows you his shoulder, and his sword is hidden behind him when he stands and runs.'),
    ('ALSO', PALE, 'up-left already shows him the right way round today: only the light changes. Up-right is the same in both.'),
]

def key(d, y, draw=True):
    h = 6
    for word, color, text in KEY:
        lead = probe.textlength(word + ':  ', font=LABEL)
        lines = wrap(text, SUB, W - lead)
        if draw:
            d.text((PAD, y + h + 2), word + ':', font=LABEL, fill=color)
            for k, line in enumerate(lines):
                d.text((PAD + lead, y + h + k * 34), line, font=SUB, fill=PALE)
        h += len(lines) * 34 + 10
    return h + 8

steps = [lambda s, d, y, draw: header(d, y, draw), table, enlarged, lambda s, d, y, draw: key(d, y, draw)]
H = PAD
for f in steps:
    H += f(None, probe, 0, False) + 14
sheet = Image.new('RGB', (W + PAD * 2, H + PAD), BG)
d = ImageDraw.Draw(sheet)
y = PAD
for f in steps:
    y += f(sheet, d, y, True) + 14
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
sheet.save(out)
print(out, sheet.size)
