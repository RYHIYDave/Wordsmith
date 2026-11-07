# THE RANGER BROUGHT UP: THE PICTURES LAID OUT WITH THEIR CAPTIONS (the art chat's helper, 6 Nov 2026).
# From the pictures tools/ranger_up_pics.ts paints (RGBA, his canvas: 176 by 176, his feet at 84, 132).
#   python3 tools/ranger_up_pics.py look <dir> <out.png>     (one still of him standing: before beside now, from in front)
import os
import sys

from PIL import Image, ImageDraw, ImageFont

B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG = (16, 15, 40)
FLOOR = (30, 28, 62)
INK = (232, 230, 255)
DIM = (170, 166, 210)
CYAN = (34, 208, 224)
AX, AY = 84, 132


def font(path, size):
    return ImageFont.truetype(path, size)


def wrap(d, text, f, maxw):
    out, line = [], ''
    for word in text.split(' '):
        t = (line + ' ' + word).strip()
        if d.textlength(t, font=f) > maxw and line:
            out.append(line)
            line = word
        else:
            line = t
    if line:
        out.append(line)
    return out


def ground(w, h, k, ax, ay):
    """A patch of floor with a soft shadow under his feet, `k` times as big."""
    im = Image.new('RGB', (w, h), BG)
    d = ImageDraw.Draw(im)
    for i in range(6, 0, -1):
        rx, ry = 15 * k * i / 6, 5 * k * i / 6
        c = tuple(int(FLOOR[j] + (8 - FLOOR[j]) * (1 - i / 6) * 0.9) for j in range(3))
        d.ellipse((ax - rx, ay - ry, ax + rx, ay + ry), fill=c)
    return im


def figure(path, box, k):
    """His picture cut to `box` (picture pixels), made `k` times as big (whole pixels), on the floor with his shadow."""
    im = Image.open(path).convert('RGBA').crop(box)
    im = im.resize((im.width * k, im.height * k), Image.NEAREST)
    g = ground(im.width, im.height, k, (AX - box[0]) * k, (AY - box[1]) * k)
    g.paste(im, (0, 0), im)
    return g


def union_box(paths, pad=6):
    bb = [999, 999, -1, -1]
    for p in paths:
        b = Image.open(p).getbbox()
        if b:
            bb = [min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3])]
    return (max(0, bb[0] - pad), max(0, bb[1] - pad), min(176, bb[2] + pad), min(176, bb[3] + pad + 2))


def look(dir, out):
    W = 1200
    big, mid, small, tiny = font(B, 36), font(B, 24), font(R, 21), font(B, 18)
    probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    paths = [os.path.join(dir, 'look_before.png'), os.path.join(dir, 'look_now.png')]
    box = union_box(paths)
    K = 3
    figs = [figure(p, box, K) for p in paths]
    fw, fh = figs[0].size
    intro = ('Standing in a fight, from in front, three times as big: before (the Ranger in the game today) beside now. '
             'One still, to show his look. His moves come after, on your yes.')
    kept = ['His wide soft teal cap and its long glowing feather',
            'His bare face and brown moustache',
            'His pink neckerchief, green jerkin and pointed skirt',
            'His teal cloak, quiver, bracers and boots',
            'His long indigo bow, its cyan string, the arrow on it',
            'His colours, his build and his low archer\'s crouch']
    changed = ['Sculpted as one body, like the Brawler and the Warrior, not balls and tubes',
               'His face made to read at a glance: his head a touch bigger and lit, the cap pushed back off his brow, both eyes and their brows clear, the moustache full',
               'His cap a soft puff of cloth, cocked a little, its top slumped back',
               'A belt with its cyan buckle; the skirt in leaf-cut points that hang and follow',
               'Boots of soft leather with turned cuffs, a cloak that hangs in folds',
               'A bow with a leather grip and curled tips; the arrow\'s head drawn to a point']
    lines = wrap(probe, intro, small, W - 48)
    small_box = (AX - 40, box[1], AX + 40, box[3])
    gw, gh = small_box[2] - small_box[0], small_box[3] - small_box[1]
    # the two notes, side by side under the figures
    colw = (W - 48 - 40) // 2
    def block_h(items):
        return 34 + sum(len(wrap(probe, it, small, colw - 22)) * 27 + 6 for it in items)
    gap = 160
    top = 20 + 48 + len(lines) * 28 + 26
    figs_h = 34 + fh + 22 + 30 + gh
    H = top + figs_h + 40 + max(block_h(kept), block_h(changed)) + 24
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    y = 20
    d.text((24, y), 'THE RANGER, REDONE: A STILL OF HIM', font=big, fill=INK)
    y += 48
    for ln in lines:
        d.text((24, y), ln, font=small, fill=DIM)
        y += 28
    y = top
    x0 = (W - (2 * fw + gap)) // 2
    for i, (g, p, name) in enumerate(zip(figs, paths, ['BEFORE', 'NOW'])):
        x = x0 + i * (fw + gap)
        col = CYAN if name == 'NOW' else DIM
        d.text((x + 2, y), name, font=mid, fill=col)
        d.text((x + 2 + d.textlength(name, font=mid) + 10, y + 5), '(the game today)' if name == 'BEFORE' else '(sculpted)', font=tiny, fill=DIM)
        img.paste(g, (x, y + 34))
        # the same at the game's own size, under it
        yy = y + 34 + fh + 22
        d.text((x + 2, yy), "at the game's own size:", font=tiny, fill=DIM)
        sg = figure(p, small_box, 1)
        img.paste(sg, (x + (fw - gw) // 2, yy + 30))
    y = top + figs_h + 40
    for j, (title, items) in enumerate((('KEPT', kept), ('NEW', changed))):
        tx = 24 + j * (colw + 40)
        yy = y
        d.text((tx, yy), title, font=mid, fill=CYAN if title == 'NEW' else INK)
        yy += 34
        for it in items:
            d.text((tx, yy), '-', font=small, fill=DIM)
            for ln in wrap(probe, it, small, colw - 22):
                d.text((tx + 20, yy), ln, font=small, fill=INK if title == 'NEW' else DIM)
                yy += 27
            yy += 6
    img.save(out)
    print(out, img.size)


if __name__ == '__main__':
    mode, dir, out = sys.argv[1:4]
    if mode == 'look':
        look(dir, out)
