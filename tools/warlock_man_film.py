# THE WARLOCK BROUGHT UP, THE MAN: PICTURES AND FILMS FROM HIS FRAMES (the queue's finish-mage-and-warlock-eight-sides, step 4,
# 12 Nov 2026; docs/mockups/warlock_up2/README.md, "The man"). Lays out what tools/warlock_man_pics.ts painted.
#   python3 tools/warlock_man_film.py sheet <dir> <out.png> [scale] [key] [who,...] [crop w,h]
#       a row for each of `who` (game, up) and each moment, a column for each side, each frame `scale` times (nearest)
import json, sys
from PIL import Image, ImageDraw, ImageFont

BG = (34, 30, 40)
LABEL = (226, 220, 236)
SIDE_NAME = {'front': 'down-right', 'toward': 'toward you', 'frontL': 'down-left', 'sideL': 'left', 'backL': 'up-left',
             'away': 'away from you', 'back': 'up-right', 'side': 'right'}
WHO_NAME = {'game': 'as he is now', 'up': 'brought up'}

def font(n):
    for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf']:
        try:
            return ImageFont.truetype(f, n)
        except Exception:
            pass
    return ImageFont.load_default()

def crop_box(frames, d):
    # the box round every frame's figure (the same for all, so they line up)
    x0 = y0 = 10**9; x1 = y1 = -1
    for f in frames:
        im = Image.open(f"{d}/{f['name']}")
        b = im.getbbox()
        if b:
            x0 = min(x0, b[0]); y0 = min(y0, b[1]); x1 = max(x1, b[2]); y1 = max(y1, b[3])
    return (max(0, x0 - 3), max(0, y0 - 3), x1 + 3, y1 + 3)

def sheet(d, out, scale=4, key=None, whos=None):
    frames = json.load(open(f'{d}/frames.json'))
    if key: frames = [f for f in frames if f['key'] == key]
    if whos: frames = [f for f in frames if f['who'] in whos]
    sides = []
    for f in frames:
        if f['side'] not in sides: sides.append(f['side'])
    rows = []
    for f in frames:
        r = (f['who'], f['t'])
        if r not in rows: rows.append(r)
    box = crop_box(frames, d)
    cw = (box[2] - box[0]) * scale; ch = (box[3] - box[1]) * scale
    lab = 34; left = 0
    W = left + cw * len(sides); H = lab + (ch + lab) * len(rows)
    img = Image.new('RGB', (W, H), BG)
    dr = ImageDraw.Draw(img)
    F = font(22)
    for i, sd in enumerate(sides):
        dr.text((left + i * cw + 8, 6), SIDE_NAME.get(sd, sd), fill=LABEL, font=F)
    for j, (who, t) in enumerate(rows):
        y = lab + j * (ch + lab)
        dr.text((8, y + 4), f"{WHO_NAME.get(who, who)}, {t:.2f} s", fill=LABEL, font=F)
        for i, sd in enumerate(sides):
            f = next((g for g in frames if g['who'] == who and g['t'] == t and g['side'] == sd), None)
            if not f: continue
            im = Image.open(f"{d}/{f['name']}").convert('RGBA').crop(box)
            im = im.resize((im.width * scale, im.height * scale), Image.NEAREST)
            img.paste(im, (left + i * cw, y + lab), im)
    img.save(out)
    print(out, img.size)

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'sheet':
        d, out = sys.argv[2], sys.argv[3]
        scale = int(sys.argv[4]) if len(sys.argv) > 4 else 4
        key = sys.argv[5] if len(sys.argv) > 5 and sys.argv[5] != '-' else None
        whos = sys.argv[6].split(',') if len(sys.argv) > 6 else None
        sheet(d, out, scale, key, whos)
