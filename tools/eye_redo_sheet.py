#!/usr/bin/env python3
"""THE SWAMP COLOSSUS (the new Drowned Eye), THE SHEETS for the owner's phone (art/eye_colossus.ts; a mock-up, not in the game):
the pieces tools/eye_redo_pics.ts painted, one under another, 1200 wide, each with its caption over it.
   python3 tools/eye_redo_sheet.py look <pieces dir> <out.png>          (his drawing: docs/ref/eye_drawing_from_owner_2026-11-07.jpg)
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
    # top down, a tile a square: across the screen and down it (tiles) from his middle at the water (art/eye_colossus.ts STONE, ARM_ROOTS)
    T = 22
    TL = 32 / (2 / 3) ** 0.5
    across, deep, edge = 17, 11, 310 / TL
    root_y = 256 / TL
    top, bottom = -5.3, edge + deep + 1.6
    Wp, Hp = W, int((bottom - top) * T) + 40
    im = Image.new('RGB', (Wp, Hp), BG)
    d = ImageDraw.Draw(im, 'RGBA')
    ox, oy = Wp // 2, int(-top * T) + 6
    X = lambda u: ox + u * T
    Y = lambda v: oy + v * T
    # the black water before the stone, the fen's water round it
    d.rectangle([X(-13), Y(top), X(13), Y(edge)], fill=(12, 20, 16))
    d.rectangle([X(-13), Y(edge), X(-across / 2), Y(bottom - 0.4)], fill=(18, 28, 22))
    d.rectangle([X(across / 2), Y(edge), X(13), Y(bottom - 0.4)], fill=(18, 28, 22))
    # him: his two jaws at the water, the V between them opening toward you, his throat at the back of it; his tongue up out of the
    # bottom of the V, the eye on its tip (pink) (art/eye_colossus.ts JAW_MAKE, FACES, EYE_RISEN)
    for sx in (-1, 1):
        pts = [(sx * 20 / TL, 130 / TL), (sx * 40 / TL, -60 / TL), (sx * 120 / TL, -150 / TL), (sx * 250 / TL, -110 / TL), (sx * 300 / TL, 0), (sx * 260 / TL, 110 / TL), (sx * 150 / TL, 150 / TL)]
        d.polygon([(X(u), Y(v)) for (u, v) in pts], fill=(40, 46, 34), outline=(120, 60, 90))
    d.polygon([(X(-20 / TL), Y(130 / TL)), (X(20 / TL), Y(130 / TL)), (X(40 / TL), Y(-60 / TL)), (X(-40 / TL), Y(-60 / TL))], fill=(46, 16, 32))
    d.line([X(0), Y(-40 / TL), X(0), Y(46 / TL)], fill=(110, 70, 72), width=8)
    d.ellipse([X(-6 / TL) - 16, Y(46 / TL) - 6, X(-6 / TL) + 16, Y(46 / TL) + 6], fill=(255, 79, 138))
    d.text((X(2.2), Y(-1.4)), 'his jaws', font=mid, fill=PALE)
    # the stone, a tile grid
    d.rectangle([X(-across / 2), Y(edge), X(across / 2), Y(edge + deep)], fill=(78, 74, 86), outline=(160, 156, 170), width=2)
    for k in range(1, across):
        d.line([X(-across / 2 + k), Y(edge), X(-across / 2 + k), Y(edge + deep)], fill=(92, 88, 100))
    for k in range(1, deep):
        d.line([X(-across / 2), Y(edge + k), X(across / 2), Y(edge + k)], fill=(92, 88, 100))
    hero = (0, edge + deep / 2)
    # a slam: from a root, 6 tiles along the stone toward the hero, 1.2 wide
    for rx in (-222 / TL, 0, 222 / TL):
        dx, dy = hero[0] - rx, hero[1] - root_y
        L = (dx * dx + dy * dy) ** 0.5
        ux, uy = dx / L, dy / L
        px, py = -uy * 0.6, ux * 0.6
        a = (rx, root_y + 0.0)
        b = (rx + ux * 6, root_y + uy * 6)
        d.polygon([(X(a[0] + px), Y(a[1] + py)), (X(b[0] + px), Y(b[1] + py)), (X(b[0] - px), Y(b[1] - py)), (X(a[0] - px), Y(a[1] - py))], fill=(255, 176, 112, 70), outline=(255, 176, 112, 160))
    # where they rise: phase 1 (1), phases 2 and 3 (2/3)
    for lab, xs, col in [('1', (-111, 111), (236, 220, 214)), ('2/3', (-222, 0, 222), (255, 176, 112))]:
        for x in xs:
            cx, cy = X(x / TL), Y(root_y)
            d.ellipse([cx - 12, cy - 12, cx + 12, cy + 12], outline=col, width=3, fill=BG)
            d.text((cx - (6 if lab == '1' else 16), cy - 34), lab, font=mid, fill=col)
    # the pillars for phase 3 (not drawn yet): round the stone
    for (u, v) in [(-across / 2 - 0.9, edge + deep * 0.55), (across / 2 + 0.9, edge + deep * 0.55), (0, edge + deep + 0.9)]:
        d.rectangle([X(u) - 8, Y(v) - 8, X(u) + 8, Y(v) + 8], fill=(255, 79, 138))
    d.polygon([(X(hero[0]), Y(hero[1]) - 12), (X(hero[0]) + 9, Y(hero[1]) + 8), (X(hero[0]) - 9, Y(hero[1]) + 8)], fill=(40, 220, 240))
    d.text((X(across / 2) + 26, Y(edge) + 4), 'the stone:', font=small, fill=GREY)
    d.text((X(across / 2) + 26, Y(edge) + 30), '17 tiles across,', font=small, fill=GREY)
    d.text((X(across / 2) + 26, Y(edge) + 56), '11 deep', font=small, fill=GREY)
    d.text((X(-13) + 6, Y(top) + 4), 'the black water', font=small, fill=GREY)
    d.text((X(-13) + 6, Y(edge) + 4), 'his middle', font=small, fill=GREY)
    d.text((X(-13) + 6, Y(edge) + 30), '%.1f tiles' % edge, font=small, fill=GREY)
    d.text((X(-13) + 6, Y(edge) + 56), 'out', font=small, fill=GREY)
    return im

mode = sys.argv[1]
src = sys.argv[2]
spec = {p['file']: p for p in json.load(open(os.path.join(src, 'sheet.json')))}
img = lambda f: Image.open(os.path.join(src, f)).convert('RGB')
if mode == 'look':
    parts = [header('THE SWAMP COLOSSUS: HIS DRAWING, PAINTED (A MOCK-UP)', [
        'His drawing taken as the idea: he rises out of the black water already split wide open in a deep V, two tall pointed jaws pried apart, teeth down both edges, his throat inside; his tongue twisting up out of it in an S, towering over his jaws, the eye on its tip the highest of all, lying on its side; tentacles curling out on both sides. Melting and dripping, spittle and goo. Painted at the game\'s own size (two picture pixels to a game pixel) unless it says, on the fen\'s own water and stone.'])]
    # (his drawing beside the still, both the same height)
    still = img('look_still.png')
    drawing = Image.open('docs/ref/eye_drawing_from_owner_2026-11-07.jpg').convert('RGB').crop((70, 960, 1110, 1960))
    H = still.height
    gap = 16
    if drawing.width * H / drawing.height + gap + still.width > W - 24:
        raise SystemExit('the drawing and the still are too wide side by side')
    dw = round(drawing.width * H / drawing.height)
    drawing = drawing.resize((dw, H), Image.LANCZOS)
    row = Image.new('RGB', (dw + gap + still.width, H), BG)
    row.paste(drawing, (0, 0)); row.paste(still, (dw + gap, 0))
    p = spec['look_still.png']
    parts.append(block(p['title'], p['note'], row))
    for f in ['look_risen.png', 'look_2x.png', 'look_eye.png', 'look_teeth.png', 'look_under.png', 'look_back.png']:
        p = spec[f]
        parts.append(block(p['title'], p['note'], img(f)))
    stack(parts, sys.argv[3])
else:
    today = Image.open(sys.argv[3]).convert('RGB').resize((507, 234), Image.NEAREST)
    parts = [header('THE NEW ARENA, AS THE PLAYER SEES IT (A MOCK-UP)', [
        'A phone held sideways: the game\'s screen, 507 by 234 game pixels, at the game\'s own size. The stone a big rectangle; the black water across the top; him in it, facing you. The camera leaned toward him, the hero at the foot of the screen, his eye on it.'])]
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
    parts.append(block('TODAY (LEFT) AND NEW (RIGHT), SMALL', 'Left, the game today: the pool in the middle of the round ring, the Eye lying in it, about as tall as the hero, seen from above. Right, the new arena: the stone a rectangle, the water across the top, him risen in it, split open, his eye high on the screen.', row))
    p = spec['arena_mid.png']
    parts.append(block(p['title'], p['note'], img('arena_mid.png')))
    parts.append(block('THE ARENA FROM ABOVE: A PLAN', 'A tile a square. His jaws at the water, the V between them, his throat at its back, the eye on his tongue (pink). His tentacles rise in the water just off the stone: phase 1 at a third and two thirds along it (1); phases 2 and 3 left, middle and right (2/3). A slam: 6 tiles along the stone toward the hero, 1.2 wide (orange). The three pillars of phase 3, where they could stand (pink, not drawn yet). The hero cyan.', plan()))
    stack(parts, sys.argv[4])
