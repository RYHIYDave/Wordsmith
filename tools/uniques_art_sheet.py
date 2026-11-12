# THE UNIQUE ITEMS' OWN PICTURES: a sheet for him, sized for his phone held upright (1080 wide).
#   tsx tools/uniques_art_peek.ts --dump shots/uniques_art/raw
#   python3 tools/uniques_art_sheet.py <batch> <out.png> [in-game shot.png x0,y0,x1,y1]
# <batch>: a key of BATCHES below (which uniques, and a line on what each shows). Each is drawn six times its size in a slot
# as the bag draws one, under the picture it wears today (its base's orange look); then, if a shot of the game is given, that
# part of it: the same pictures as the game itself shows them.
import json
import sys
from PIL import Image, ImageDraw, ImageFont

RAW = 'shots/uniques_art/raw/'
BATCHES = {
    'boots': {
        'title': 'The nine boots, each its own',
        'was': 'boots',
        'lines': {
            'longecho': 'A tall sea-blue boot banded in silver, and its own echo behind it, twice.',
            'brokenshackles': "A prisoner's worn boot, an iron shackle round it, its chain snapped.",
            'queenstalons': "A carrion bird's leg: her black feathers, a pale ruff, three talons.",
            'dancingshoes': "The prince's pair: black velvet, red heels, gilt buckles.",
            'standingstone': 'Hewn from a standing stone: a ring cut in it, moss on it.',
            'pivot': 'A steel sabaton, a gilt pivot at the ankle for the turn, a spur.',
            'shortway': "Soft violet, its toe curled back on itself, the Warp's cyan round the ankle.",
            'clovenboots': "The demon's leg: red leather, black fur, a cloven hoof, an ember in it.",
            'sprungheels': 'Bound in linen like his wraps, a brass spring coiled under the heel.',
        },
    },
}

BG = (26, 22, 72)
SLOT = (14, 12, 36)
ORANGE = (255, 154, 60)
PALE = (255, 236, 200)
SOFT = (200, 196, 232)


def font(size):
    return ImageFont.load_default(size=size)


def icon(name, k):
    im = Image.frombytes('RGBA', (32, 32), open(RAW + name + '.rgba', 'rb').read())
    return im.resize((32 * k, 32 * k), Image.NEAREST)


def wrap(d, text, f, maxw):
    lines, cur = [], ''
    for w in text.split(' '):
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= maxw:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def main():
    key, out = sys.argv[1], sys.argv[2]
    shot = sys.argv[3] if len(sys.argv) > 3 else None
    box = tuple(int(v) for v in sys.argv[4].split(',')) if len(sys.argv) > 4 else None
    b = BATCHES[key]
    names = {e['id']: e['name'] for e in json.load(open(RAW + 'list.json'))}
    ids = list(b['lines'].keys())
    W, cols, k = 1080, 3, 6
    cw = W // cols
    slot = 32 * k + 28
    ft, fn, fl, fh = font(40), font(27), font(20), font(24)
    probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    cells = []
    for i in ids:
        cells.append((i, wrap(probe, names[i], fn, cw - 24), wrap(probe, b['lines'][i], fl, cw - 36)))
    rows = [cells[r:r + cols] for r in range(0, len(cells), cols)]
    row_h = [slot + 14 + max(len(c[1]) for c in row) * 32 + 6 + max(len(c[2]) for c in row) * 25 + 34 for row in rows]
    top = 250
    game_h = 0
    crop = None
    if shot:
        crop = Image.open(shot).convert('RGB')
        if box:
            crop = crop.crop(box)
        gw = W - 60
        crop = crop.resize((gw, round(crop.height * gw / crop.width)), Image.LANCZOS)
        game_h = crop.height + 110
    H = top + sum(row_h) + game_h + 30
    im = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((30, 28), b['title'], font=ft, fill=PALE)
    # what they all wear today
    wk = 3
    ws = 32 * wk + 16
    d.rectangle([30, 100, 30 + ws - 1, 100 + ws - 1], fill=SLOT, outline=ORANGE, width=3)
    wi = icon('base_' + b['was'], wk)
    im.paste(wi, (38, 108), wi)
    d.text((30 + ws + 20, 112), 'Today all %d wear this picture.' % len(ids), font=fh, fill=SOFT)
    d.text((30 + ws + 20, 146), 'Below: a picture of its own for each.', font=fh, fill=SOFT)
    y = top
    for row, rh in zip(rows, row_h):
        for c, (i, nlines, tlines) in enumerate(row):
            cx = c * cw + cw // 2
            x0 = cx - slot // 2
            d.rectangle([x0, y, x0 + slot - 1, y + slot - 1], fill=SLOT, outline=ORANGE, width=3)
            ic = icon(i, k)
            im.paste(ic, (x0 + 14, y + 14), ic)
            ty = y + slot + 14
            for t in nlines:
                d.text((cx - d.textlength(t, font=fn) / 2, ty), t, font=fn, fill=ORANGE)
                ty += 32
            ty += 6
            for t in tlines:
                d.text((cx - d.textlength(t, font=fl) / 2, ty), t, font=fl, fill=SOFT)
                ty += 25
        y += rh
    if crop:
        d.text((30, y + 10), 'In the game, on your phone', font=fh, fill=PALE)
        d.text((30, y + 44), 'The bag, as the game itself draws it, with three ordinary pieces after them.', font=fl, fill=SOFT)
        im.paste(crop, (30, y + 84))
    im.save(out)
    print(out, im.size)


main()
