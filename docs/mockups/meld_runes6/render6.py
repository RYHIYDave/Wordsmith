# Draws the 110 meld runes of the High City (design.py) with ../meld_runes/render.py's own stone(), writes stones/<id>.png (12 x 12)
# and runes.json, and a review sheet: python3 render6.py review.png [big.png]
# Before drawing, it checks what his rules ask: no glyph the same as another (here or among the 192 stones before, or one of them
# turned or mirrored), none an empty or plain box or ring, and no colour near the enemy's pink or gold (his Art Rulebook: Colour 3).
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
exec(open(HERE + '/design.py').read())
os.chdir(HERE + '/../meld_runes')
src = open('render.py').read().split("if __name__=='__main__':")[0]
env = {}
exec(src, env)
os.chdir(HERE)
# --- the checks
def norm(g):
    return tuple(r.replace('o', 'X') for r in g)
def turns(g):
    g = [list(r) for r in norm(g)]
    out = []
    for _ in range(4):
        g = [list(r) for r in zip(*g[::-1])]
        out.append(tuple(''.join(r) for r in g))
        out.append(tuple(''.join(r[::-1]) for r in g))
    return set(out)
before = {}
for d in ['meld_runes', 'meld_runes2', 'meld_runes3', 'meld_runes4', 'meld_runes5']:
    for k, v in json.load(open(HERE + '/../%s/runes.json' % d)).items():
        before[k] = v['glyph']
bad = []
seen = {}
for k, v in R6.items():
    g = v['glyph']
    for k2, g2 in list(before.items()) + list(seen.items()):
        if norm(g2) in turns(g):
            bad.append('%s is %s turned or mirrored' % (k, k2))
    seen[k] = g
    n = sum(r.count('X') + r.count('o') for r in g)
    if n < 7:
        bad.append('%s has only %d marks' % (k, n))
    if 'o' not in ''.join(g):
        bad.append('%s has no glow' % k)
    box = all(g[0][i] != '.' and g[6][i] != '.' and g[i][0] != '.' and g[i][6] != '.' for i in range(7)) and all(g[y][x] == '.' for y in range(1, 6) for x in range(1, 6))
    if box:
        bad.append('%s is a plain box' % k)
    import colorsys
    c = v['color'].lstrip('#'); r, gg, b = int(c[0:2], 16) / 255, int(c[2:4], 16) / 255, int(c[4:6], 16) / 255
    h, l, sat = colorsys.rgb_to_hls(r, gg, b)
    h *= 360
    # (the enemy's hot pink and magenta: blood reds and salmon are his side's, as Maw, Bloodbloom and Lamprey were made)
    if 300 <= h < 348 and sat > 0.3:
        bad.append('%s colour %s is a pink, the enemy\'s' % (k, v['color']))
    # (the enemy's gold: a pale warm yellow; Lightning's own yellow and Flame's orange are those words' colours)
    words = set(v['of'])
    if 34 <= h < 52 and l > 0.62 and sat > 0.5 and not words & {'lightning', 'fire'}:
        bad.append('%s colour %s is near the enemy\'s gold' % (k, v['color']))
# (each reads on the stone: its colour's light against the stone's face, at least 1.3 to 1)
def lum(hx):
    hx = hx.lstrip('#'); cc = [int(hx[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    f = lambda q: q / 12.92 if q <= 0.04045 else ((q + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(cc[0]) + 0.7152 * f(cc[1]) + 0.0722 * f(cc[2])
for k, v in R6.items():
    a, b = lum(v['color']), lum('#655868')
    if (max(a, b) + 0.05) / (min(a, b) + 0.05) < 1.3:
        bad.append('%s colour %s is too near the stone\'s face' % (k, v['color']))
cols = {}
for k, v in R6.items():
    cols.setdefault(v['color'].lower(), []).append(k)
for c, ks in cols.items():
    if len(ks) > 1:
        bad.append('the same colour %s for %s' % (c, ', '.join(ks)))
if bad:
    print('\n'.join(bad))
    sys.exit(1)
env['R'].update(R6)
from PIL import Image, ImageDraw, ImageFont
os.makedirs('stones', exist_ok=True)
for k in R6:
    env['stone'](k).save('stones/%s.png' % k)
json.dump(R6, open('runes.json', 'w'), indent=1)
if len(sys.argv) > 1:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
    small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 11)
    ids = list(R6); sc = 8; cw = 150; ch = 12 * sc + 56; cols = 8
    rows = (len(ids) + cols - 1) // cols
    out = Image.new('RGBA', (cols * cw + 10, rows * ch + 10), (14, 12, 36, 255)); dr = ImageDraw.Draw(out)
    for i, k in enumerate(ids):
        x = 10 + (i % cols) * cw; y = 10 + (i // cols) * ch
        s = env['stone'](k).resize((12 * sc, 12 * sc), Image.NEAREST); out.paste(s, (x + (cw - 12 * sc) // 2 - 5, y), s)
        dr.text((x, y + 12 * sc + 4), R6[k]['name'], font=font, fill=(220, 224, 250))
        dr.text((x, y + 12 * sc + 22), '%s+%s' % tuple(R6[k]['of']), font=small, fill=(150, 156, 196))
    out.save(sys.argv[1])
print(len(R6), 'stones')
