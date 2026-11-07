# THE RANGER BROUGHT UP: THE PICTURES LAID OUT WITH THEIR CAPTIONS (the art chat's helper, 6 Nov 2026).
# From the pictures tools/ranger_up_pics.ts paints (RGBA, his canvas: 176 by 176, his feet at 84, 132).
#   python3 tools/ranger_up_pics.py look <dir> <out.png>     (one still of him standing: before beside now, from in front)
import os
import subprocess
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


def legs_mark(d, x, ty, k, leg, box, font_, label=True):
    """Beside a figure: a line from his hip down to the floor, ticks at the hip, the knee and the floor (his near leg, as the
    screen shows it), and the two lengths along the leg in the game's pixels."""
    def Y(p):
        return ty + (p[1] - box[1]) * k
    yh, yk, yf = Y(leg['hip']), Y(leg['knee']), Y(leg['floor'])
    up, low = (255, 214, 102), (120, 230, 140)
    w = max(2, k)
    d.line((x, yh, x, yk), fill=up, width=w)
    d.line((x, yk, x, yf), fill=low, width=w)
    for yy in (yh, yk, yf):
        d.line((x - 3 * w, yy, x + 3 * w, yy), fill=INK, width=max(1, w // 2 + 1))
    if label:
        for yy, name in ((yh, 'hip'), (yk, 'knee'), (yf, 'floor')):
            d.text((x - 8 - d.textlength(name, font=font_), yy - 9), name, font=font_, fill=DIM)
        d.text((x + 10, (yh + yk) / 2 - 10), f"{leg['thigh']:.1f}", font=font_, fill=up)
        d.text((x + 10, (yk + yf) / 2 - 10), f"{leg['lower']:.1f}", font=font_, fill=low)


def look(dir, out):
    import json
    W = 1200
    big, mid, small, tiny = font(B, 34), font(B, 23), font(R, 20), font(B, 17)
    probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    whos = ['before', 'now', 'legs']
    names = [('BEFORE', 'the game today'), ('FIRST SCULPT', 'the one you saw'), ('NOW', 'his legs true')]
    paths = [os.path.join(dir, f'look_{w}.png') for w in whos]
    legs = json.load(open(os.path.join(dir, 'look.json')))
    box = union_box(paths)
    K = 3
    figs = [figure(p, box, K) for p in paths]
    fw, fh = figs[0].size
    intro = ('Standing in a fight, from in front, three times as big. Beside each, the leg nearer you as it is on the screen: '
             'hip to knee (yellow) and knee to floor (green), in the game\'s pixels. Standing straight, his lower leg is '
             'a little longer than his thigh, as on a real person; in his crouch both knees were bent toward the camera, '
             'so each shin was seen end-on and looked short. Now the same low crouch, his front foot a little further '
             'forward with its knee bent out over it, his back foot further back: each shin is seen at its length.')
    lines = wrap(probe, intro, small, W - 48)
    gap = (W - 48 - 3 * fw) // 3
    top = 20 + 46 + len(lines) * 26 + 22
    small_box = (box[0], box[1], box[2], box[3])
    gw, gh = small_box[2] - small_box[0], small_box[3] - small_box[1]
    H = top + 60 + fh + 30 + 30 + gh + 40
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    y = 20
    d.text((24, y), "THE RANGER'S LEGS, MADE TRUE", font=big, fill=INK)
    y += 46
    for ln in lines:
        d.text((24, y), ln, font=small, fill=DIM)
        y += 26
    y = top
    for i, (g, w, (name, sub)) in enumerate(zip(figs, whos, names)):
        x = 24 + i * ((W - 48) // 3) + 100
        col = CYAN if w == 'legs' else DIM
        d.text((x - 80, y), name, font=mid, fill=col)
        d.text((x - 80, y + 28), sub, font=tiny, fill=DIM)
        img.paste(g, (x, y + 60))
        leg = legs[w]
        legs_mark(d, x - 14, y + 60, K, leg, box, tiny)
        ratio = leg['lower'] / leg['thigh']
        d.text((x - 80, y + 60 + fh + 6), f"knee to floor = {ratio:.2f} x hip to knee", font=tiny, fill=CYAN if ratio >= 1 else (255, 140, 120))
        # at the game's own size, under it
        yy = y + 60 + fh + 30 + 30
        sg = figure(paths[i], small_box, 1)
        img.paste(sg, (x + (fw - gw) // 2, yy))
        legs_mark(d, x + (fw - gw) // 2 - 6, yy, 1, leg, box, tiny, label=False)
    d.text((24, top + 60 + fh + 34), "at the game's own size:", font=tiny, fill=DIM)
    img.save(out)
    print(out, img.size)


def sheet(dir, out):
    """Before beside now for every list (three times as big, in front and from behind), a legs panel at the top, a side-on stride
    strip of his run with the swinging thigh's angle, and the game's own size at the foot."""
    import json
    spec = json.load(open(os.path.join(dir, 'sheet.json')))
    W = 1200
    big, mid, small, tiny = font(B, 34), font(B, 23), font(R, 18), font(B, 15)
    probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    intro = ('Before (the Ranger in the game today) beside now, three times as big, from in front and from behind. His look kept: '
             'his soft teal cap and its feather, his face and moustache, his pink neckerchief, green jerkin, teal cloak and hood, '
             'his quiver and his long indigo bow. Now sculpted as one body; every list 30 pictures a second; his guard\'s feet as '
             'far apart as the game\'s; his run a hunter\'s, never a high-step; the Shot and the Volley a big held draw, a one-frame release '
             'with its after-image, a big follow-through. Pictures only: not in the game.')
    lines = wrap(probe, intro, small, W - 48)
    blocks = []
    for sec in spec['sections']:
        rows = []
        for r in sec['rows']:
            paths = [os.path.join(dir, f) for f in r['files']]
            rows.append((r['label'], paths, union_box(paths, 4)))
        blocks.append((sec['title'], rows))
    def row_h(box):
        return 28 + 2 * (20 + (box[3] - box[1]) * 3 + 10) + 24
    legs_h = 40 + 2 * (96 * 3 + 30) + 120
    strip_h = 60 + 2 * (24 + 92 * 2 + 30) + 10
    hgt = 20 + 46 + len(lines) * 24 + 20 + legs_h + strip_h
    for title, rows in blocks:
        hgt += 56 + sum(row_h(b) for _, _, b in rows)
    hgt += 56 + 200 + 150 * (len(spec['small']) // 4)
    img = Image.new('RGB', (W, hgt), BG)
    d = ImageDraw.Draw(img)
    y = 20
    d.text((24, y), 'THE RANGER, BROUGHT UP', font=big, fill=INK)
    y += 46
    for ln in lines:
        d.text((24, y), ln, font=small, fill=DIM)
        y += 24
    y += 20
    # --- the legs panel: his guard as the game has it, last night's wide one and now, from in front and from behind
    d.text((24, y), 'HIS GUARD: the game\'s, last night\'s wide one, and now', font=mid, fill=CYAN)
    y += 40
    names = {'before': 'THE GAME\'S', 'wide': 'LAST NIGHT\'S, WIDE', 'now': 'NOW'}
    cols = {'before': DIM, 'wide': (255, 140, 120), 'now': CYAN}
    box = (AX - 50, 44, AX + 70, 140)
    x = 24
    for lg in spec['legs']:
        g = figure(os.path.join(dir, lg['file']), box, 3)
        img.paste(g, (x + 50, y))
        legs_mark(d, x + 44, y, 3, lg, box, tiny, label=lg['who'] == 'before')
        col = cols[lg['who']]
        ratio = lg['lower'] / lg['thigh']
        d.text((x + 50, y + g.height + 2), names[lg['who']], font=tiny, fill=col)
        d.text((x + 50, y + g.height + 20), f"feet {lg['apart']:.0f} apart, {lg['side']:.0f} to the side", font=tiny, fill=col)
        d.text((x + 50, y + g.height + 38), f"legs {ratio:.2f} from in front, {lg['least']:.2f} at worst", font=tiny, fill=col)
        x += 390
    y += 96 * 3 + 64
    x = 24
    for lg in spec['legs']:
        g = figure(os.path.join(dir, lg['behind']), box, 3)
        img.paste(g, (x + 50, y))
        d.text((x + 50, y + g.height + 2), names[lg['who']] + ' · from behind', font=tiny, fill=cols[lg['who']])
        x += 390
    y += 96 * 3 + 40
    # --- the stride strip
    d.text((24, y), 'HIS RUN SIDE-ON, EIGHT FRAMES OF A STRIDE: the swinging thigh, degrees from hanging straight down (the check: 50 at most)', font=mid, fill=CYAN)
    y += 44
    for who in ('before', 'now'):
        cells = [c for c in spec['strip'] if c['who'] == who]
        d.text((24, y), 'BEFORE (the game\'s run)' if who == 'before' else 'NOW', font=tiny, fill=DIM if who == 'before' else CYAN)
        y += 22
        x = 24
        for c in cells:
            box = (AX - 38, 70, AX + 34, 162)
            g = figure(os.path.join(dir, c['file']), box, 2)
            img.paste(g, (x, y))
            col = (255, 140, 120) if c['deg'] > 50 else CYAN
            d.text((x + 4, y + g.height + 2), f"{c['deg']}°" if c['deg'] else 'both feet down', font=tiny, fill=col)
            x += g.width + 6
        y += 92 * 2 + 30
    y += 10
    # --- every list
    names = ['BEFORE · in front', 'NOW · in front', 'BEFORE · behind', 'NOW · behind']
    cuts = []
    for title, rows in blocks:
        cuts.append(y)
        y += 22
        d.text((24, y), title, font=mid, fill=CYAN)
        y += 34
        for label, paths, box in rows:
            d.text((24, y), label, font=small, fill=INK)
            y += 28
            bw, bh = (box[2] - box[0]) * 3, (box[3] - box[1]) * 3
            cw = max(bw, 170)
            for r in range(2):
                x0 = (W - (2 * cw + 12)) // 2
                for i in range(2):
                    j = r * 2 + i
                    x = x0 + i * (cw + 12)
                    d.text((x + 2, y), names[j], font=tiny, fill=CYAN if 'NOW' in names[j] else DIM)
                    img.paste(figure(paths[j], box, 3), (x, y + 20))
                y += 20 + bh + 10
            y += 24
    # --- at the game's own size
    cuts.append(y)
    y += 22
    d.text((24, y), "At the game's own size (each of his pixels one pixel here): before, now", font=mid, fill=CYAN)
    y += 40
    x = 24
    for item in spec['small']:
        if x + 250 > W:
            x = 24
            y += 150
        for k, f in enumerate(item['files']):
            box = (AX - 50, AY - 110, AX + 60, AY + 14)
            g = figure(os.path.join(dir, f), box, 1)
            img.paste(g, (x, y))
            d.text((x + 4, y + g.height + 2), 'BEFORE' if k == 0 else 'NOW', font=tiny, fill=DIM if k == 0 else CYAN)
            x += g.width + 4
        x += 20
    y += 150
    img = img.crop((0, 0, W, min(img.height, y + 10)))
    # (no taller than 7500: split where a list begins, the second part under a heading of its own)
    if img.height <= 7500:
        img.save(out)
        print(out, img.size)
        return
    cut = max(c for c in cuts if c <= 7400)
    a = img.crop((0, 0, W, cut))
    rest = img.crop((0, cut, W, img.height))
    b = Image.new('RGB', (W, rest.height + 70), BG)
    ImageDraw.Draw(b).text((24, 20), 'THE RANGER, BROUGHT UP (continued)', font=big, fill=INK)
    b.paste(rest, (0, 70))
    a.save(out)
    out2 = out.replace('.png', '_2.png')
    b.save(out2)
    print(out, a.size, out2, b.size)


def sheet2(dir, out):
    """His head six times as big, before and now from every side; and the turnaround of eight true facings."""
    import json, math
    spec = json.load(open(os.path.join(dir, 'sheet2.json')))
    W = 1440
    big, mid, small, tiny = font(B, 34), font(B, 23), font(R, 18), font(B, 15)
    probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    intro = ('HIS HEAD, six times as big: before (the game today) and now, from each of his eight sides, each truly painted (none '
             'mirrored). HIS EIGHT FACINGS: his guard, a stride of his run and the Shot\'s release, each laid where he faces (down '
             'and to the right at the bottom right, and so round). Pictures only: not in the game.')
    lines = wrap(probe, intro, small, W - 48)
    heads = spec['heads']
    K = 6
    HW, HH = 36, 30
    def headbox(p):
        im = Image.open(p)
        a = im.getchannel('A')
        bb = a.getbbox()
        # the top of him, the head: his topmost painted row, the box across his middle
        top = bb[1]
        cx = AX
        return (cx - HW // 2 - 2, top + 8, cx + HW // 2 - 2, top + 8 + HH)
    grids = []
    for sec in spec['turn']:
        paths = [os.path.join(dir, c['file']) for c in sec['cells']]
        grids.append((sec, paths, union_box(paths, 4)))
    gap = 14
    def grid_h(box, k):
        return 3 * ((box[3] - box[1]) * k + 40) + 2 * gap
    hgt = 20 + 46 + len(lines) * 24 + 20 + 56 + 2 * (42 + HH * K + 20) + 40
    for sec, paths, box in grids:
        hgt += 56 + grid_h(box, 2) + 10
    img = Image.new('RGB', (W, hgt + 20), BG)
    d = ImageDraw.Draw(img)
    y = 20
    d.text((24, y), 'THE RANGER: HIS HEAD, AND HIS EIGHT FACINGS', font=big, fill=INK)
    y += 46
    for ln in lines:
        d.text((24, y), ln, font=small, fill=DIM)
        y += 24
    y += 20
    d.text((24, y), 'His head, six times as big, in his guard', font=mid, fill=CYAN)
    y += 36
    rows = [heads[:5], heads[5:]]
    for row in rows:
        x = 24
        for h in row:
            p = os.path.join(dir, h['file'])
            box = headbox(p)
            im = Image.open(p).convert('RGBA').crop(box)
            im = im.resize((im.width * K, im.height * K), Image.NEAREST)
            bg = Image.new('RGB', im.size, BG)
            bg.paste(im, (0, 0), im)
            for n, part in enumerate(h['label'].replace('facing ', '').split(' · ')):
                d.text((x + 2, y + n * 18), part, font=tiny, fill=CYAN if h['now'] else DIM)
            img.paste(bg, (x, y + 38))
            x += im.width + 10
        y += 42 + HH * K + 20
    y += 20
    POS = {0: (2, 2), 1: (1, 2), 2: (0, 2), 3: (0, 1), 4: (0, 0), 5: (1, 0), 6: (2, 0), 7: (2, 1)}
    for sec, paths, box in grids:
        y += 22
        d.text((24, y), sec['title'] + ': his eight facings, twice as big', font=mid, fill=CYAN)
        y += 34
        k = 2
        fw, ch = (box[2] - box[0]) * k, (box[3] - box[1]) * k
        cw = max(fw, 230)
        x0 = (W - (3 * cw + 2 * gap)) // 2
        for c, p in zip(sec['cells'], paths):
            col, row = POS[c['k']]
            x = x0 + col * (cw + gap)
            yy = y + row * (ch + 40 + gap)
            img.paste(figure(p, box, k), (x + (cw - fw) // 2, yy + 20))
            d.text((x + 2, yy), 'facing ' + c['name'], font=tiny, fill=CYAN)
        mx = x0 + (cw + gap) + cw // 2
        my = y + (ch + 40 + gap) + (ch + 40) // 2
        for kk in range(8):
            a = math.radians(kk * 45)
            fx, fy = math.cos(a), math.sin(a)
            sx, sy = fx - fy, (fx + fy) * 0.5
            nn = math.hypot(sx, sy)
            L = min(cw, ch) * 0.3
            d.line((mx, my, mx + sx / nn * L, my + sy / nn * L), fill=CYAN, width=2)
        y += grid_h(box, k) + 10
    img = img.crop((0, 0, W, min(img.height, y + 10)))
    img.save(out)
    print(out, img.size)


def film(dir, out):
    import json, math
    spec = json.load(open(os.path.join(dir, 'film.json')))
    cap, lab, tiny = font(B, 24), font(B, 18), font(B, 14)
    W, H = 1100, 1060
    box = (26, 14, 150, 162)
    bw, bh = (box[2] - box[0]) * 3, (box[3] - box[1]) * 3
    probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    proc = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                             '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    title = Image.new('RGB', (W, H), BG)
    td = ImageDraw.Draw(title)
    td.text((40, 360), 'THE RANGER, BROUGHT UP', font=font(B, 44), fill=INK)
    for i, ln in enumerate(wrap(td, 'First: his eight facings, each truly painted, running round a circle and shooting each of the eight '
                                     'ways, at the game\'s size and three times as big. Then before (the game today) beside now, from in '
                                     'front and from behind, three times as big; and at the game\'s size. The Shot and the Volley again at '
                                     'half speed. Pictures only: not in the game.', font(R, 24), W - 80)):
        td.text((40, 430 + i * 34), ln, font=font(R, 24), fill=DIM)
    for _ in range(45):
        proc.stdin.write(title.tobytes())
    SW, SH = 560, 420
    for fr in spec['scenes']:
        img = Image.new('RGB', (W, H), BG)
        d = ImageDraw.Draw(img)
        y = 14
        for ln in wrap(probe, fr['caption'], cap, W - 40)[:3]:
            d.text((20, y), ln, font=cap, fill=INK)
            y += 30
        top = 110
        cx, cy = SW // 2, SH // 2 + 50
        floor = Image.new('RGB', (SW, SH), (22, 21, 50))
        fd = ImageDraw.Draw(floor)
        if 'path' in fr:
            r = fr['path']['r']
            fd.ellipse((cx - 32 * 2 ** 0.5 * r, cy - 16 * 2 ** 0.5 * r, cx + 32 * 2 ** 0.5 * r, cy + 16 * 2 ** 0.5 * r), outline=FLOOR, width=3)
        else:
            for k in range(8):
                a = math.radians(k * 45)
                fx, fy = math.cos(a), math.sin(a)
                fd.line((cx, cy, cx + (fx - fy) * 32 * 3.2, cy + (fx + fy) * 16 * 3.2), fill=CYAN if k == fr['way'] else FLOOR, width=2 if k == fr['way'] else 1)
        fx_, fy_ = fr['at']
        for i in range(6, 0, -1):
            rx, ry = 15 * i / 6, 5 * i / 6
            c = tuple(int(FLOOR[j] + (8 - FLOOR[j]) * (1 - i / 6) * 0.9) for j in range(3))
            fd.ellipse((fx_ - rx, fy_ - ry, fx_ + rx, fy_ + ry), fill=c)
        him = Image.open(os.path.join(dir, fr['scene'])).convert('RGBA')
        floor.paste(him, (0, 0), him)
        d.text((20, top), "AT THE GAME'S SIZE", font=lab, fill=INK)
        img.paste(floor, (20, top + 28))
        cell = Image.open(os.path.join(dir, fr['cell'])).convert('RGBA').crop(box)
        cell = cell.resize((cell.width * 3, cell.height * 3), Image.NEAREST)
        g = ground(cell.width, cell.height, 3, (AX - box[0]) * 3, (AY - box[1]) * 3)
        g.paste(cell, (0, 0), cell)
        d.text((20 + SW + 30, top), 'THREE TIMES AS BIG', font=lab, fill=CYAN)
        img.paste(g, (20 + SW + 30, top + 28))
        d.text((20, top + 28 + SH + 24), 'facing ' + fr['facing'], font=cap, fill=CYAN)
        proc.stdin.write(img.tobytes())
    for fr in spec['frames']:
        strip = Image.open(os.path.join(dir, fr['file'])).convert('RGBA')
        cells = [strip.crop((i * 176, 0, (i + 1) * 176, 176)) for i in range(4)]
        img = Image.new('RGB', (W, H), BG)
        d = ImageDraw.Draw(img)
        y = 14
        for ln in wrap(probe, fr['caption'], cap, W - 40)[:3]:
            d.text((20, y), ln, font=cap, fill=INK)
            y += 30
        top = 110
        names = [('BEFORE · in front', 0), ('NOW · in front', 1), ('BEFORE · from behind', 2), ('NOW · from behind', 3)]
        for name, j in names:
            col, row = j % 2, j // 2
            x = 20 + col * (bw + 14)
            yy = top + row * (bh + 36)
            im = cells[j].crop(box).resize((bw, bh), Image.NEAREST)
            g = ground(bw, bh, 3, (AX - box[0]) * 3, (AY - box[1]) * 3)
            g.paste(im, (0, 0), im)
            d.text((x, yy), name, font=lab, fill=CYAN if 'NOW' in name else DIM)
            img.paste(g, (x, yy + 24))
        gx = 20 + 2 * (bw + 14) + 16
        d.text((gx, top), "AT THE GAME'S SIZE", font=lab, fill=INK)
        for j in range(4):
            col, row = j % 2, j // 2
            sb = (34, 24, 134, 156)
            im = cells[j].crop(sb)
            g = ground(im.width, im.height, 1, AX - sb[0], AY - sb[1])
            g.paste(im, (0, 0), im)
            x = gx + col * (g.width + 14)
            yy = top + 30 + row * (g.height + 30)
            d.text((x, yy), ['BEFORE', 'NOW', 'BEFORE', 'NOW'][j], font=tiny, fill=CYAN if j % 2 else DIM)
            img.paste(g, (x, yy + 18))
        proc.stdin.write(img.tobytes())
    proc.stdin.close()
    proc.wait()
    print(out, len(spec['scenes']) + len(spec['frames']) + 45, 'frames')


if __name__ == '__main__':
    mode, dir, out = sys.argv[1:4]
    {'look': look, 'sheet': sheet, 'sheet2': sheet2, 'film': film}[mode](dir, out)
