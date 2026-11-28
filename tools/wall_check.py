"""Every wall face of floors 1 to 5 in their whole-floor pictures (`--only=walls --floor=N --shots=/tmp/wallN`, check_walls.gd), sampled just above its foot; one that shows only the empty background there is missing. Run: python3 tools/wall_check.py 1 2 3 4 5
empty background there is missing."""
import json, sys
import numpy as np
from PIL import Image
R = '/home/claude/wordsmith/godot/assets/'
def run(f):
    d = '/tmp/wall%d' % f
    J = json.load(open('%s/walls_f%d.json' % (d, f)))
    vw, vh = J['view']
    z = Image.open('%s/walls_f%d_0_0.png' % (d, f)).size[0] / vw
    shots = {(s[0], s[1]): s for s in J['shots']}
    imgs = {}
    def px(p):
        # the picture pixel p on the screen: which shot, where
        for (i, j), s in shots.items():
            x, y = (p[0] - s[2]) * z, (p[1] - s[3]) * z
            if 2 <= x < vw * z - 2 and 2 <= y < vh * z - 2:
                if (i, j) not in imgs:
                    imgs[(i, j)] = np.array(Image.open('%s/walls_f%d_%d_%d.png' % (d, f, i, j)).convert('RGB')).astype(int)
                return imgs[(i, j)], int(x), int(y)
        return None
    import os
    lp = R + 'floor%dv2/layout.json' % f
    L = json.load(open(lp if os.path.exists(lp) else R + 'floor%d/layout.json' % f)); w, h = L['w'], L['h']; T = np.array(L['tiles']).reshape(h, w)
    op = lambda x, y: 0 <= x < w and 0 <= y < h and T[y, x] in (1, 3)
    wl = lambda x, y: 0 <= x < w and 0 <= y < h and T[y, x] == 2
    def scr(a, b):
        return ((a - b) * 32.0, (a + b) * 16.0)
    def empty(p0, p1):
        """the middle of the edge p0-p1 (world corners), 6 to 26 picture pixels above it: share of background pixels"""
        a = ((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2)
        sx, sy = scr(*a)
        n = e = 0
        for dy in range(6, 27, 4):
            for dx in (-8, 0, 8):
                r = px((sx + dx, sy - dy))
                if r is None: continue
                im, x, y = r
                c = im[y, x]
                n += 1
                if c.max() < 16: e += 1
        return e / n if n else None
    missing = []
    checked = 0
    for y in range(h):
        for x in range(w):
            if not wl(x, y): continue
            faces = []
            if op(x + 1, y): faces.append(('+x back', (x + 1, y), (x + 1, y + 1)))
            if op(x, y + 1): faces.append(('+y back', (x, y + 1), (x + 1, y + 1)))
            if op(x - 1, y) and not wl(x + 1, y) and not op(x + 1, y): faces.append(('+x near', (x + 1, y), (x + 1, y + 1)))
            if op(x, y - 1) and not wl(x, y + 1) and not op(x, y + 1): faces.append(('+y near', (x, y + 1), (x + 1, y + 1)))
            for kind, p0, p1 in faces:
                v = empty(p0, p1)
                if v is None: continue
                checked += 1
                if v > 0.7: missing.append((x, y, kind, round(v, 2)))
    print('floor %d: %d wall faces looked at, %d show nothing above their foot: %s' % (f, checked, len(missing), missing[:40]))
    return missing
out = {}
for f in map(int, sys.argv[1:]):
    out[f] = run(f)
json.dump(out, open('/tmp/f2w/wallcheck.json', 'w'))
