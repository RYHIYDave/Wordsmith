# The five beside the game's own skeleton and shade, at the game's size: python3 tools/reap5/compare.py <out.png> [side]
import sys, os, json
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sculpt import render, crop, FRIEND, ENEMY
from creatures import CREATURES
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
side = sys.argv[2] if len(sys.argv) > 2 else 'friend'
def frame(name, i):
    d = json.load(open(ROOT + '/godot/assets/monsters/%s.json' % name)); f = d['frames'][i]
    im = Image.open(ROOT + '/godot/assets/monsters/%s-%d.png' % (name, f[0])).convert('RGBA')
    return im.crop((f[1], f[2], f[1] + f[3], f[2] + f[4]))
ims = [frame('skeleton', 0), frame('shade', 0)]
for name in ('imp', 'rimeling', 'stormwisp', 'toad', 'bonebrute'):
    C = CREATURES[name]
    W, H = C['canvas']; ox, oy = C['origin']
    for an, fr, face in (('idle', 0.0, 'f'), ('attack', C['hit'] - 0.12, 'f'), ('idle', 0.0, 'b')):
        n = C['frames'][an]
        res = C['make'](an, int(fr * n) / n, side)
        im = render(res[0], C['yaw_front'] if face == 'f' else C['yaw_back'], res[1], W, H, ox, oy, side=FRIEND if side == 'friend' else ENEMY,
                    post=res[2] if len(res) > 2 else None, scale=C.get('scale', 1.0))
        c, ax, ay = crop(im, ox, oy)
        ims.append(Image.fromarray(c))
Hh = max(i.height for i in ims); Ww = sum(i.width + 6 for i in ims)
sh = Image.new('RGBA', (Ww, Hh + 4), (34, 30, 44, 255)); x = 0
for i in ims:
    sh.alpha_composite(i, (x, Hh + 2 - i.height)); x += i.width + 6
sh.resize((sh.width * 4, sh.height * 4), Image.NEAREST).save(sys.argv[1]); print(sh.size)
