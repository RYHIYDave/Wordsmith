# THE WARRIOR'S MOVES LAID OUT (tools/scenarios/warrior_moves_look.mjs's pictures): one sheet a weapon, a row a move and facing,
# its pictures left to right as the game's time goes, each row named. For looking at every move of his at once.
#   python3 tools/warrior_moves_sheet.py shots/wmoves      -> shots/wmoves/<weapon>.png
import os
import re
import sys
from collections import OrderedDict

from PIL import Image, ImageDraw

root = sys.argv[1]
for kit in sorted(os.listdir(root)):
    d = os.path.join(root, kit)
    if not os.path.isdir(d):
        continue
    rows = OrderedDict()
    for f in sorted(os.listdir(d)):
        m = re.match(r'(.+)_(\d\d)\.png$', f)
        if m:
            rows.setdefault(m.group(1), []).append(os.path.join(d, f))
    if not rows:
        continue
    first = Image.open(next(iter(rows.values()))[0])
    w, h = first.size
    scale = 0.5
    tw, th = int(w * scale), int(h * scale)
    cols = max(len(v) for v in rows.values())
    label = 150
    sheet = Image.new('RGB', (label + cols * tw, len(rows) * th), (20, 22, 40))
    draw = ImageDraw.Draw(sheet)
    for r, (name, files) in enumerate(rows.items()):
        draw.text((6, r * th + th // 2 - 6), name, fill=(230, 236, 255))
        for c, f in enumerate(files):
            im = Image.open(f).convert('RGB').resize((tw, th))
            sheet.paste(im, (label + c * tw, r * th))
    out = os.path.join(root, f'{kit}.png')
    sheet.save(out)
    print(out, sheet.size)
