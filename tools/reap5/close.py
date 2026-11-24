# A close look at a few frames: python3 tools/reap5/close.py <creature> <out.png> anim:i:side:face ...
import sys, os
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from sculpt import render, FRIEND, ENEMY, crop
from creatures import CREATURES
name, out = sys.argv[1], sys.argv[2]
C = CREATURES[name]
W, H = C['canvas']; ox, oy = C['origin']
ims = []
for spec in sys.argv[3:]:
    an, i, side, face = spec.split(':')
    n = C['frames'][an]
    res = C['make'](an, int(i) / n, side)
    m, mats = res[0], res[1]
    post = res[2] if len(res) > 2 else None
    yaw = C['yaw_front'] if face == 'f' else C['yaw_back']
    ims.append(render(m, yaw, mats, W, H, ox, oy, side=FRIEND if side == 'friend' else ENEMY, post=post, scale=C.get('scale', 1.0)))
sheet = np.concatenate(ims, 1)
bg = Image.new('RGBA', (sheet.shape[1], sheet.shape[0]), (34, 30, 44, 255))
bg.alpha_composite(Image.fromarray(sheet))
bg.resize((bg.width * 6, bg.height * 6), Image.NEAREST).save(out)
