# A look at one creature's frames, zoomed: python3 tools/reap5/preview.py <creature> <out.png> [anim ...]
import sys, os
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from sculpt import render, FRIEND, ENEMY
from creatures import CREATURES

name, out = sys.argv[1], sys.argv[2]
anims = sys.argv[3:] or ['idle', 'walk', 'attack']
C = CREATURES[name]
W, H = C['canvas']
ox, oy = C['origin']
rows = []
for side, rim in (('friend', FRIEND), ('foe', ENEMY)):
    for yaw in (C['yaw_front'], C['yaw_back']):
        for an in anims:
            n = C['frames'][an]
            ims = []
            for i in range(n):
                res = C['make'](an, i / n, side)
                ims.append(render(res[0], yaw, res[1], W, H, ox, oy, side=rim, post=res[2] if len(res) > 2 else None))
            rows.append(np.concatenate(ims, 1))
        if side == 'foe':
            break
wmax = max(r.shape[1] for r in rows)
sheet = np.zeros((H * len(rows), wmax, 4), np.uint8)
for i, r in enumerate(rows):
    sheet[i * H:(i + 1) * H, :r.shape[1]] = r
bg = Image.new('RGBA', (wmax, H * len(rows)), (34, 30, 44, 255))
bg.alpha_composite(Image.fromarray(sheet))
z = int(sys.argv[4]) if False else 3
bg.resize((bg.width * z, bg.height * z), Image.NEAREST).save(out)
print(out, bg.size)
