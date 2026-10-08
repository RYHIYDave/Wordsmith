#!/usr/bin/env python3
"""Cut the hero out of the pictures taken by tools/scenarios/heroes.mjs and lay them on one sheet.
   python3 tools/crop_heroes.py shots/heroes warrior shots/heroes_warrior_sheet.png [scale]
The hero stands at the middle of the screen, 12 game pixels below centre."""
import sys
from PIL import Image, ImageDraw

prefix, cls, out = sys.argv[1], sys.argv[2], sys.argv[3]
names = ['front_right', 'back_right', 'front_left', 'back_left']
kinds = ['walk_a', 'walk_b', 'idle', 'attack_a', 'attack_b']
cells = []
for n in names:
    row = []
    for k in kinds:
        im = Image.open(f'{prefix}_{cls}_{n}_{k}.png').convert('RGB')
        w, h = im.size
        s = max(1, round(h / 270))          # device pixels per game pixel
        cx, cy = w // 2, h // 2 + 12 * s
        box = (cx - 44 * s, cy - 62 * s, cx + 44 * s, cy + 14 * s)
        row.append(im.crop(box))
    cells.append(row)
# the slow attack and the evasive move, if they were photographed
import os
extra = [k for k in ['slow_a', 'slow_b', 'slow_c', 'evade_a', 'evade_b'] if os.path.exists(f'{prefix}_{cls}_{k}.png')]
if extra:
    row = []
    for k in extra:
        im = Image.open(f'{prefix}_{cls}_{k}.png').convert('RGB')
        w, h = im.size
        s = max(1, round(h / 270))
        cx, cy = w // 2, h // 2 + 12 * s
        row.append(im.crop((cx - 44 * s, cy - 62 * s, cx + 44 * s, cy + 14 * s)))
    while len(row) < len(kinds):
        row.append(Image.new('RGB', row[0].size, (22, 19, 28)))
    cells.append(row)
    names.append('')
    extra_names = extra
else:
    extra_names = []
cw, ch = cells[0][0].size
pad = 6
sheet = Image.new('RGB', (len(kinds) * (cw + pad) + pad, len(names) * (ch + pad + 16) + pad), (22, 19, 28))
d = ImageDraw.Draw(sheet)
for j, row in enumerate(cells):
    for i, c in enumerate(row):
        x, y = pad + i * (cw + pad), pad + j * (ch + pad + 16) + 16
        sheet.paste(c, (x, y))
        label = f'{cls} {names[j]} {kinds[i]}' if names[j] else (f'{cls} {extra_names[i]}' if i < len(extra_names) else '')
        d.text((x + 2, y - 14), label, fill=(255, 216, 102))
sheet.save(out)
print(out, sheet.size)
