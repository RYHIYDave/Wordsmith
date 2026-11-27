## THE TOWN GATE IN WOOD (his words, 27 Nov 2026, 17:13: “I need the gate that leads out to the wilds from the town to be like
## solid wood instead of like a wrought iron sort of open thing”): every frame of the portcullis's strips (assets/fx/fx.json,
## films tg_port_1..13, each a strip of the gate as it rises, its top held by the arch) painted again as a solid gate of planks,
## a plank to a strip, two iron bands across it, studded; its frames the same sizes and offsets as the iron's, so it rises as that
## did. Out: assets/fx/tg_wood.png and assets/fx/tg_wood.json ({"sheet", "films": {"tgw_port_<k>": [[x, y, w, h, ox, oy] or
## ["fx", pic]]}}), read by scripts/night.gd.
import json, sys, random
from PIL import Image

root = sys.argv[1]
fx = json.load(open(root + '/assets/fx/fx.json'))
sheets = {}
def src(q):
    s = q[0]
    if s not in sheets:
        sheets[s] = Image.open(root + '/assets/fx/' + fx['sheets'][s]).convert('RGBA')
    return sheets[s].crop((q[1], q[2], q[1] + q[3], q[2] + q[4]))

WOOD = {"base": (112, 76, 46), "light": (142, 100, 60), "shade": (84, 56, 34), "seam": (52, 34, 20), "grain": (98, 66, 40)}
IRON = {"base": (62, 60, 70), "light": (104, 100, 114), "shade": (40, 38, 46), "stud": (156, 150, 164)}
BANDS = [(10, 14), (40, 44)]  # rows above the gate's foot, picture pixels
random.seed(7)
GRAIN = {}
def grain(u, v):
    key = (u, v // 3)
    if key not in GRAIN:
        GRAIN[key] = random.random()
    return GRAIN[key]

def wood_px(u, v, top_gap):
    """The gate's colour at u (pixels along it from its left edge) and v (pixels up from its foot); top_gap: pixels below the
    arch's edge (0 at it)."""
    col = u % 8
    in_band = any(a <= v < b for a, b in BANDS)
    if in_band:
        a, b = [bd for bd in BANDS if bd[0] <= v < bd[1]][0]
        c = IRON["light"] if v == b - 1 else (IRON["shade"] if v == a else IRON["base"])
        if col == 4 and v == a + 2:
            c = IRON["stud"]
        if col == 3 and v == a + 2:
            c = IRON["light"]
    elif col == 0:
        c = WOOD["seam"]
    elif col == 1:
        c = WOOD["light"]
    elif col == 7:
        c = WOOD["shade"]
    else:
        c = WOOD["grain"] if grain(u, v) < 0.18 else WOOD["base"]
    if v == 0:
        c = WOOD["seam"]
    # (in under the arch, its edge's shadow)
    if top_gap < 2:
        c = tuple(int(x * 0.62) for x in c)
    elif top_gap < 4:
        c = tuple(int(x * 0.82) for x in c)
    return c + (255,)

out_pics = []  # (strip k, frame i, image, ox, oy)
films = {}
lefts = {}
u0 = 0
for k in range(1, 14):
    L = fx['films']['tg_port_%d' % k]['layers']['stand']
    first = fx['pics'][L[0]]
    lefts[k] = u0
    u0 += first[3]
    frames = []
    for i, pi in enumerate(L):
        q = fx['pics'][pi]
        w, h, ox, oy = q[3], q[4], q[5], q[6]
        if q[0] != first[0] or w != first[3] or ox != first[5] or oy != first[6]:
            frames.append(["hide"])
            continue
        im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        # (its top held by the arch; its foot, the frame's last row, risen as the frame shortens: the planks go up with it)
        for y in range(h):
            for x in range(w):
                im.putpixel((x, y), wood_px(lefts[k] + x, h - 1 - y, y))
        frames.append([im, ox, oy])
    films['tgw_port_%d' % k] = frames

# (packed on one sheet, a row a strip)
W = sum(1 for _ in [0])
rows = []
sheet_w = 0
sheet_h = 0
for k in range(1, 14):
    fr = films['tgw_port_%d' % k]
    rw = sum(f[0].width + 1 for f in fr if f[0] != "hide")
    rh = max([f[0].height for f in fr if f[0] != "hide"] + [1])
    rows.append((k, rw, rh))
    sheet_w = max(sheet_w, rw)
    sheet_h += rh + 1
sheet = Image.new('RGBA', (sheet_w, sheet_h), (0, 0, 0, 0))
y = 0
outj = {"sheet": "tg_wood.png", "films": {}}
for k, rw, rh in rows:
    x = 0
    lst = []
    for f in films['tgw_port_%d' % k]:
        if f[0] == "hide":
            lst.append([])
            continue
        im, ox, oy = f
        sheet.paste(im, (x, y))
        lst.append([x, y, im.width, im.height, ox, oy])
        x += im.width + 1
    outj["films"]['tgw_port_%d' % k] = lst
    y += rh + 1
sheet.save(root + '/assets/fx/tg_wood.png')
json.dump(outj, open(root + '/assets/fx/tg_wood.json', 'w'))
print('sheet', sheet.size, 'films', len(outj['films']))
