#!/usr/bin/env python3
"""THE CANYON'S PERSPECTIVE: a rough 3D model of a place on a floor of the descent, seen from the game's own camera, beside the game's
picture of it. The rock (every tile not walked on) stands `rise` game pixels over the floor as solid blocks; each block's top is
lifted that high and its faces that look toward the eye are drawn, lit from the upper left (his art rulebook): what the place would
look like if nothing were cut away. From tools/scenarios/canyon_model.mjs's MODEL line and its pictures.
   python3 tools/canyon_model.py <MODEL json file> <pictures prefix> <out dir> [rise game px, 75]"""
import json, sys, os
from PIL import Image, ImageDraw, ImageFont

src, prefix, out = sys.argv[1], sys.argv[2], sys.argv[3]
RISE = float(sys.argv[4]) if len(sys.argv) > 4 else 75.0
os.makedirs(out, exist_ok=True)
line = open(src).read().strip()
data = json.loads(line[line.index('{'):])
GW, GH = 507, 234  # the game's own pixels on a phone held sideways
FLOOR = (222, 186, 140)
TOP = (120, 128, 84)
LIT = (196, 120, 80)
SHADE = (110, 64, 46)
EDGE = (60, 36, 28)
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
for p in data['places']:
    ox, oy = p['cam']['ox'], p['cam']['oy']
    rows = p['rows']
    x0, y0 = p['x0'], p['y0']
    S = 4  # drawn at 4 times, then brought down: smooth edges
    im = Image.new('RGB', (GW * S, GH * S), (20, 16, 30))
    dr = ImageDraw.Draw(im)
    def at(x, y, h=0.0):
        return ((ox + (x - y) * 16) * S, (oy + (x + y) * 8 - h) * S)
    def rock(tx, ty):
        r, c = ty - y0, tx - x0
        if r < 0 or c < 0 or r >= len(rows) or c >= len(rows[0]):
            return True
        return rows[r][c] == '0'
    tiles = [(tx, ty) for ty in range(y0, y0 + len(rows)) for tx in range(x0, x0 + len(rows[0]))]
    # the floor first, all of it, then the rock back to front (by x + y), each block's faces toward the eye and its top
    for tx, ty in tiles:
        if not rock(tx, ty):
            dr.polygon([at(tx, ty), at(tx + 1, ty), at(tx + 1, ty + 1), at(tx, ty + 1)], fill=FLOOR)
    for tx, ty in sorted(tiles, key=lambda t: (t[0] + t[1], t[0])):
        if not rock(tx, ty):
            continue
        # the face looking down the screen to the right (+y side... the face at x+1 looks to the lower right): in shade
        if not rock(tx + 1, ty):
            dr.polygon([at(tx + 1, ty, RISE), at(tx + 1, ty + 1, RISE), at(tx + 1, ty + 1), at(tx + 1, ty)], fill=SHADE)
        # the face at y+1 looks to the lower left: lit
        if not rock(tx, ty + 1):
            dr.polygon([at(tx, ty + 1, RISE), at(tx + 1, ty + 1, RISE), at(tx + 1, ty + 1), at(tx, ty + 1)], fill=LIT)
        dr.polygon([at(tx, ty, RISE), at(tx + 1, ty, RISE), at(tx + 1, ty + 1, RISE), at(tx, ty + 1, RISE)], fill=TOP)
    # the hero: a marker where he stands
    hx, hy = at(p['hero'][0], p['hero'][1])
    dr.ellipse([hx - 5 * S, hy - 3 * S, hx + 5 * S, hy + 3 * S], fill=(40, 200, 220))
    dr.rectangle([hx - 3 * S, hy - 22 * S, hx + 3 * S, hy], fill=(220, 60, 60))
    model = im.resize((GW * 2, GH * 2), Image.LANCZOS)
    pic = Image.open(f"{prefix}_{p['name']}.png").convert('RGB').resize((GW * 2, GH * 2), Image.LANCZOS)
    font = ImageFont.truetype(B, 20)
    sheet = Image.new('RGB', (GW * 2, GH * 4 + 80), (23, 20, 46))
    d2 = ImageDraw.Draw(sheet)
    d2.text((12, 20), 'AS THE GAME DRAWS IT', font=font, fill=(236, 232, 255), anchor='lm')
    sheet.paste(pic, (0, 40))
    d2.text((12, GH * 2 + 60), f'A ROUGH 3D MODEL OF THE SAME PLACE, SAME CAMERA (the rock {RISE:.0f} game pixels tall, nothing cut away)', font=ImageFont.truetype(B, 16), fill=(236, 232, 255), anchor='lm')
    sheet.paste(model, (0, GH * 2 + 80))
    path = os.path.join(out, f"model_{p['name']}.png")
    sheet.save(path)
    print('made', path)
