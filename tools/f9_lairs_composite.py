# THE SIDE AREAS' PICTURES WITH THEIR BOSSES LAID IN: the game's own canvas (a picture pixel to a pixel) with the sculpted boss stood
# at his spot, then made 3 times as big.   python3 tools/f9_lairs_composite.py <bosses.json> <canvas dir> <name> <chief|wolf> <out.png>
import json, sys
from PIL import Image
B = json.load(open(sys.argv[1])); d = sys.argv[2]; name = sys.argv[3]; who = sys.argv[4]
im = Image.open(f'{d}/{name}.png').convert('RGB'); spot = json.load(open(f'{d}/{name}.json'))[who]
f = B[who]; px = im.load()
if spot:
    x0 = round(spot[0]) - f['ax']; y0 = round(spot[1]) - f['ay']
    for i, c in enumerate(f['px']):
        if c:
            x, y = x0 + i % f['w'], y0 + i // f['w']
            if 0 <= x < im.size[0] and 0 <= y < im.size[1]:
                px[x, y] = tuple(int(c[k:k + 2], 16) for k in (1, 3, 5))
im = im.resize((im.size[0] * 3, im.size[1] * 3), Image.NEAREST)
im.save(sys.argv[5]); print(im.size, spot)
