import json, sys
from PIL import Image, ImageDraw
f = int(sys.argv[1]); out = sys.argv[2]; spots = [tuple(map(float, s.split(','))) for s in sys.argv[3:]]
d = '/tmp/wall%d' % f
J = json.load(open('%s/walls_f%d.json' % (d, f)))
vw, vh = J['view']
z = Image.open('%s/walls_f%d_0_0.png' % (d, f)).size[0] / vw
whole = '%s/whole.png' % d
try:
    big = Image.open(whole)
except Exception:
    ni = max(s[0] for s in J['shots']) + 1; nj = max(s[1] for s in J['shots']) + 1
    W, H = int(vw * z), int(vh * z)
    big = Image.new('RGB', (W * ni, H * nj))
    for i, j, x, y in J['shots']:
        big.paste(Image.open('%s/walls_f%d_%d_%d.png' % (d, f, i, j)).convert('RGB'), (i * W, j * H))
    big.save(whole)
l0, t0 = J['shots'][0][2], J['shots'][0][3]
tiles = []
for (x, y) in spots:
    sx, sy = (x - y) * 32, (x + y) * 16
    cx, cy = (sx - l0) * z, (sy - t0) * z
    c = big.crop((int(cx - 320 * z), int(cy - 260 * z), int(cx + 320 * z), int(cy + 140 * z))).convert('RGB')
    dr = ImageDraw.Draw(c)
    px, py = 320 * z, 260 * z
    dr.ellipse((px - 5, py - 5, px + 5, py + 5), outline=(255, 0, 255), width=2)
    dr.text((6, 6), 'floor %d, tile %d,%d' % (f, x, y), fill=(255, 255, 0))
    tiles.append(c)
W = max(t.width for t in tiles); H = sum(t.height + 6 for t in tiles)
o = Image.new('RGB', (W, H), (30, 30, 30)); yy = 0
for t in tiles:
    o.paste(t, (0, yy)); yy += t.height + 6
o.save(out); print(o.size)
