# THE REAPING CREATURES' PICTURES, for the Godot game: python3 tools/reap5/paint.py
# Each creature (creatures.py) posed frame by frame, from in front and from behind, its edge in the friend's cyan (rising for
# him) and in the enemy's pink (rising out of an enemy that carried it), cut to what is drawn and laid in a row on one sheet:
# godot/assets/words/reap5_<name>.png, with reap5_<name>.json saying where each picture is and its feet (ax, ay), two picture
# pixels to a game pixel (dn 2), and which pictures each move shows at what pace, as Reaping's grey Shade's (spirit7.json).
import sys, os, json
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sculpt import render, crop, FRIEND, ENEMY
from creatures import CREATURES
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = ROOT + '/godot/assets/words'
only = sys.argv[1:] or list(CREATURES)
for name in only:
    C = CREATURES[name]
    W, H = C['canvas']
    ox, oy = C['origin']
    made, pics = [], []
    looks = {}
    for side, rim in (('friend', FRIEND), ('foe', ENEMY)):
        sides = []
        for yaw in (C['yaw_front'], C['yaw_back']):
            d = {}
            for an in ('idle', 'walk', 'attack'):
                n = C['frames'][an]
                ids = []
                for i in range(n):
                    res = C['make'](an, i / n, side)
                    im = render(res[0], yaw, res[1], W, H, ox, oy, side=rim, post=res[2] if len(res) > 2 else None, scale=C.get('scale', 1.0))
                    cim, ax, ay = crop(im, ox, oy)
                    made.append(cim)
                    pics.append({'w': int(cim.shape[1]), 'h': int(cim.shape[0]), 'ax': int(ax), 'ay': int(ay), 'dn': 2})
                    ids.append(len(made) - 1)
                d[an] = ids
            fps = C['fps']
            d.update(idleFps=fps['idle'], walkFps=fps['walk'], attackFps=fps['attack'],
                     attackHit=round(C['hit'] * C['frames']['attack'] / fps['attack'], 4))
            sides.append(d)
        looks[side] = sides
    Wt = sum(m.shape[1] + 1 for m in made)
    Ht = max(m.shape[0] for m in made)
    sheet = np.zeros((Ht, Wt, 4), np.uint8)
    x = 0
    for m, p in zip(made, pics):
        sheet[:m.shape[0], x:x + m.shape[1]] = m
        p['x'], p['y'] = x, 0
        x += m.shape[1] + 1
    Image.fromarray(sheet).save(OUT + '/reap5_%s.png' % name, optimize=True)
    json.dump({'pics': pics, 'friend': looks['friend'], 'foe': looks['foe']}, open(OUT + '/reap5_%s.json' % name, 'w'))
    print(name, len(made), 'pictures, sheet', sheet.shape[1], 'x', sheet.shape[0])
