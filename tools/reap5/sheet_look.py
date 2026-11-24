# All five side by side, for a look: python3 tools/reap5/sheet_look.py <out.png>
import sys, os
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from sculpt import render, FRIEND, ENEMY
from creatures import CREATURES
out = sys.argv[1]
cols = []
for name in ('imp', 'rimeling', 'stormwisp', 'toad', 'bonebrute'):
    C = CREATURES[name]
    W, H = C['canvas']; ox, oy = C['origin']
    cells = []
    for an, i, side, face in (('idle', 0, 'friend', 'f'), ('attack', int(C['frames']['attack'] * 0.5), 'friend', 'f'),
                              ('attack', int(C['frames']['attack'] * 0.7), 'friend', 'f'), ('idle', 0, 'friend', 'b'), ('idle', 0, 'foe', 'f')):
        res = C['make'](an, i / C['frames'][an], side)
        yaw = C['yaw_front'] if face == 'f' else C['yaw_back']
        im = render(res[0], yaw, res[1], W, H, ox, oy, side=FRIEND if side == 'friend' else ENEMY, post=res[2] if len(res) > 2 else None)
        cell = np.zeros((96, 88, 4), np.uint8)
        y0 = 92 - oy; x0 = 44 - ox
        cell[max(0, y0):y0 + H, max(0, x0):x0 + W] = im[max(0, -y0):, max(0, -x0):][:96 - max(0, y0), :88 - max(0, x0)]
        cells.append(cell)
    cols.append(np.concatenate(cells, 1))
sheet = np.concatenate(cols, 0)
bg = Image.new('RGBA', (sheet.shape[1], sheet.shape[0]), (34, 30, 44, 255))
bg.alpha_composite(Image.fromarray(sheet))
bg.resize((bg.width * 4, bg.height * 4), Image.NEAREST).save(out)
print(out, bg.size)
