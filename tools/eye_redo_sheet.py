#!/usr/bin/env python3
"""THE SWAMP COLOSSUS (the new Drowned Eye), THE SHEETS for the owner's phone (art/eye_colossus.ts; a mock-up, not in the game):
the pieces tools/eye_redo_pics.ts painted, one under another, 1200 wide, each with its caption over it.
   python3 tools/eye_redo_sheet.py look <pieces dir> <out.png>
   python3 tools/eye_redo_sheet.py arena <pieces dir> <today's shot (tools/scenarios/eye_today.mjs, x_risen.png)> <out.png>"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
W = 1200
BG, PALE, GREY = (20, 19, 26), (236, 232, 240), (176, 172, 188)
big, mid, small = ImageFont.truetype(B, 30), ImageFont.truetype(B, 22), ImageFont.truetype(R, 20)
probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))

def wrap(text, font, width):
    words, lines, line = text.split(), [], ''
    for w in words:
        t = (line + ' ' + w).strip()
        if probe.textlength(t, font=font) > width and line:
            lines.append(line); line = w
        else:
            line = t
    if line: lines.append(line)
    return lines

def block(title, note, img):
    tl = wrap(title, mid, W - 48)
    nl = wrap(note, small, W - 48) if note else []
    h = 16 + 30 * len(tl) + 26 * len(nl) + 10 + (img.height if img else 0) + 12
    b = Image.new('RGB', (W, h), BG)
    d = ImageDraw.Draw(b)
    y = 16
    for l in tl: d.text((24, y), l, font=mid, fill=PALE); y += 30
    for l in nl: d.text((24, y), l, font=small, fill=GREY); y += 26
    if img: b.paste(img, ((W - img.width) // 2, y + 10))
    return b

def header(title, lines):
    ls = []
    for t in lines: ls += wrap(t, small, W - 48)
    h = 24 + 40 + 26 * len(ls) + 10
    b = Image.new('RGB', (W, h), BG)
    d = ImageDraw.Draw(b)
    d.text((24, 22), title, font=big, fill=PALE)
    for i, l in enumerate(ls): d.text((24, 66 + 26 * i), l, font=small, fill=GREY)
    return b

def stack(parts, out):
    H = sum(p.height for p in parts)
    sheet = Image.new('RGB', (W, H), BG)
    y = 0
    for p in parts: sheet.paste(p, (0, y)); y += p.height
    assert sheet.height <= 7000, sheet.height
    sheet.save(out)
    print(out, sheet.size)

def plan():
    # top down: across (tiles) and down the screen (tiles) from his middle at the water
    T = 26
    tiles_w, quay, deep = 30 / 2 ** 0.5, 8.4 / 2 ** 0.5, 17 / 2 ** 0.5
    Wp, Hp = W, int((quay + deep + 3.8 + 1.4) * T) + 44
    im = Image.new('RGB', (Wp, Hp), BG)
    d = ImageDraw.Draw(im)
    ox, oy = Wp // 2, int(3.8 * T) + 8
    X = lambda u: ox + u * T
    Y = lambda v: oy + v * T
    # the water
    d.rectangle([X(-tiles_w / 2 - 1.2), Y(-3.7), X(tiles_w / 2 + 1.2), Y(quay)], fill=(12, 20, 16))
    # him: his hill across the water, his eye
    d.ellipse([X(-9.7), Y(-3.4), X(9.7), Y(4.3)], fill=(40, 46, 34), outline=(120, 60, 90))
    d.ellipse([X(-0.5), Y(2.2), X(0.5), Y(2.9)], fill=(255, 79, 138))
    d.text((X(-1.2), Y(0.6)), 'him', font=mid, fill=PALE)
    # the stone, a tile grid
    d.rectangle([X(-tiles_w / 2), Y(quay), X(tiles_w / 2), Y(quay + deep)], fill=(78, 74, 86), outline=(160, 156, 170), width=2)
    k = -tiles_w / 2
    while k <= tiles_w / 2 + 1e-6:
        d.line([X(k), Y(quay), X(k), Y(quay + deep)], fill=(92, 88, 100)); k += 1
    k = quay
    while k <= quay + deep + 1e-6:
        d.line([X(-tiles_w / 2), Y(k), X(tiles_w / 2), Y(k)], fill=(92, 88, 100)); k += 1
    # the obelisks
    for (u, v) in [(-tiles_w / 2 - 0.6, quay + 5.5), (tiles_w / 2 + 0.6, quay + 5.5), (0, quay + deep + 0.7)]:
        d.rectangle([X(u) - 7, Y(v) - 7, X(u) + 7, Y(v) + 7], fill=(255, 79, 138))
    # the tentacles: where each rises (his lengths / 39.19 to a tile)
    TL = 32 / (2 / 3) ** 0.5
    marks = [('1', [(-236, 214), (236, 220)], (236, 220, 214)), ('2', [(-262, 228), (282, 222), (-150, 220)], (255, 176, 112)), ('3', [(-230, 360), (230, 360), (0, 400)], (255, 79, 138))]
    for lab, pts, col in marks:
        for (x, y) in pts:
            u, v = x / TL, y / TL
            off = {'1': (0, -0.6), '2': (0, 0.45), '3': (0, 0)}[lab]
            cx, cy = X(u + off[0]), Y(v + off[1])
            d.ellipse([cx - 13, cy - 13, cx + 13, cy + 13], outline=col, width=3, fill=BG if lab != '2' else (60, 40, 20))
            d.text((cx - 6, cy - 12), lab, font=mid, fill=col)
    # the hero, at the middle of the stone
    hx, hy = X(0), Y(quay + deep / 2)
    d.polygon([(hx, hy - 12), (hx + 9, hy + 8), (hx - 9, hy + 8)], fill=(40, 220, 240))
    d.text((X(-tiles_w / 2), Y(quay + deep) + 30), 'the stone: 21 tiles across, 12 deep', font=small, fill=GREY)
    d.text((X(-tiles_w / 2 - 1.1), Y(-3.6)), 'the black water', font=small, fill=GREY)
    return im

mode = sys.argv[1]
src = sys.argv[2]
spec = {p['file']: p for p in json.load(open(os.path.join(src, 'sheet.json')))}
img = lambda f: Image.open(os.path.join(src, f)).convert('RGB')
if mode == 'look':
    parts = [header('THE SWAMP COLOSSUS: HIS LOOK (A MOCK-UP)', [
        'The new Drowned Eye, from nothing: a rotting hill of moss-grown flesh, one huge bloodshot eye under a heavy brow, a maw split down the middle, slime, weed and old bones on him, thick slimy tentacles. Painted at the game\'s own size (two picture pixels to a game pixel), on the fen\'s own water and stone.'])]
    for f in ['look_risen.png', 'look_face.png', 'look_arm.png', 'look_under.png', 'look_back.png']:
        p = spec[f]
        parts.append(block(p['title'], p['note'], img(f)))
    stack(parts, sys.argv[3])
else:
    today = Image.open(sys.argv[3]).convert('RGB').resize((507, 234), Image.NEAREST)
    parts = [header('THE NEW ARENA, AS THE PLAYER SEES IT (A MOCK-UP)', [
        'A phone held sideways: the game\'s screen, 507 by 234 game pixels, at the game\'s own size (two picture pixels to a game pixel). The stone a big rectangle; the black water across the top of the screen; him in it, filling the top of the screen, facing you always. The camera leaned toward him (as it leans toward the Moth) so the hero stands low on the screen.'])]
    for name in ['arena_p1', 'arena_p2']:
        p = spec[name + '.png']
        parts.append(block(p['title'], p['note'], img(name + '.png')))
        a, b = img(name + '_2a.png'), img(name + '_2b.png')
        both = Image.new('RGB', (a.width, a.height + 6 + b.height), BG)
        both.paste(a, (0, 0)); both.paste(b, (0, a.height + 6))
        parts.append(block('The same, twice the size: its left half, then its right half', '', both))
    new_small = img('arena_p2.png').resize((507, 234), Image.NEAREST)
    row = Image.new('RGB', (W, 234), BG)
    row.paste(today, (24, 0)); row.paste(new_small, (W - 24 - 507, 0))
    parts.append(block('TODAY (LEFT) AND NEW (RIGHT), SMALL', 'Left, the game today: the pool in the middle of the round ring, the Eye lying in it, about as tall as the hero, seen from above. Right, the new arena: the stone a rectangle, the water across the top, him risen and filling it.', row))
    p = spec['arena_mid.png']
    parts.append(block(p['title'], p['note'], img('arena_mid.png')))
    parts.append(block('THE ARENA FROM ABOVE: A PLAN', 'A tile a square. Where the tentacles rise: phase 1 (1), phase 2 (2); phase 3, a suggestion (3): up through the stone. The cult\'s three obelisks pink; the hero cyan.', plan()))
    stack(parts, sys.argv[4])
