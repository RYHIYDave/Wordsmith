# THE WARRIOR BROUGHT UP: THE SHEET AND THE FILM, LAID OUT WITH THEIR CAPTIONS (the art chat's helper, 6 Nov 2026).
# From the pictures tools/warrior_up_pics.ts paints (RGBA, his picture: 192 by 176, his feet at 92, 132: the game's hero canvas
# with room on either side, so that he has as much before him facing left as facing right).
#   python3 tools/warrior_up_pics.py sheet <dir> <out.png>
#   python3 tools/warrior_up_pics.py sheet2 <dir> <out.png>     (his helm close, and his eight facings)
#   python3 tools/warrior_up_pics.py film <dir> <out.mp4>
import json
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
AX, AY = 92, 132
PW, PH = 192, 176


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


def union_box(paths, pad=4):
    bb = [999, 999, -1, -1]
    for p in paths:
        b = Image.open(p).getbbox()
        if b:
            bb = [min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3])]
    return (max(0, bb[0] - pad), max(0, bb[1] - pad), min(PW, bb[2] + pad), min(PH, bb[3] + pad + 2))


UP, LOW, SALMON = (255, 214, 102), (120, 230, 140), (255, 140, 120)


def draw_legs(d, leg, box, k, x0, y0, w):
    """Over a figure: one leg as the screen shows it, hip to knee (yellow), knee to ankle to the floor (green), a tick at each."""
    P = [(x0 + (p[0] - box[0]) * k, y0 + (p[1] - box[1]) * k) for p in leg['pts']]
    seen = leg['seen'] >= 0.5
    up, low = (UP, LOW) if seen else ((150, 140, 110), (110, 140, 120))
    d.line([P[0], P[1]], fill=up, width=w)
    d.line([P[1], P[2], P[3]], fill=low, width=w)
    for q in (P[0], P[1], P[3]):
        r = w + 2
        d.ellipse((q[0] - r, q[1] - r, q[0] + r, q[1] + r), fill=INK, outline=(20, 20, 40))


def legs_panel(dir, spec, W, fonts, measure_only=False, img=None, d=None, y0=0):
    """HIS LEGS, MADE TRUE: his guard from in front and toward the camera, as approved and now, the legs marked, the ratios written."""
    big, mid, small, tiny = fonts
    probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    intro = ('His guard, three times as big, from in front and from straight toward you: as you approved him, beside now. Over '
             'each leg, as the screen shows it: hip to knee (yellow), knee to the floor (green), and below, knee to floor over '
             'hip to knee. Standing straight his lower leg is a little longer than his thigh, as on a real person; in his crouch '
             'his knees were bent toward you, so each shin was seen end-on and looked short. Now the same low guard, his body '
             'as it was: his front foot further forward, his back foot further back, a longer, lower guard (and his sword '
             'now carried level behind him, so that it is seen from every side: the second sheet). A leg drawn dim is one '
             'whose shin is hidden from that side. The same holds for every pose he holds, from all eight sides (a test).')
    lines = wrap(probe, intro, small, W - 48)
    paths = [os.path.join(dir, e['file']) for e in spec]
    box = union_box(paths)
    K = 3
    fw, fh = (box[2] - box[0]) * K, (box[3] - box[1]) * K
    per = 4 if 4 * fw + 3 * 18 <= W - 48 else 2
    rows = 4 // per
    cell_h = 26 + 22 + fh + 10 + 24 * 2 + 16
    h = 22 + 34 + len(lines) * 24 + 16 + rows * cell_h + 10
    if measure_only:
        return h
    y = y0 + 22
    d.text((24, y), "HIS LEGS, MADE TRUE (his word: “long upper legs and short legs below the knee”)", font=mid, fill=CYAN)
    y += 34
    for ln in lines:
        d.text((24, y), ln, font=small, fill=DIM)
        y += 24
    y += 16
    names = {'approved': 'AS YOU APPROVED HIM', 'after': 'NOW, HIS LEGS TRUE'}
    views = {'front': 'in front', 'toward': 'toward you'}
    gap = (W - 48 - per * fw) // max(1, per - 1) if per > 1 else 0
    for i, (e, p) in enumerate(zip(spec, paths)):
        r, c = i // per, i % per
        x = 24 + c * (fw + gap)
        yy = y + r * cell_h
        d.text((x + 2, yy), names[e['who']], font=tiny, fill=CYAN if e['who'] == 'after' else DIM)
        d.text((x + 2, yy + 22), views[e['view']], font=tiny, fill=DIM)
        fig = figure(p, box, K)
        img.paste(fig, (x, yy + 48))
        for leg in e['legs']:
            draw_legs(d, leg, box, K, x, yy + 48, 3)
        ty = yy + 48 + fh + 10
        for leg in e['legs']:
            name = 'left leg' if leg['leg'] == 'L' else 'right leg'
            seen = leg['seen'] >= 0.5
            col = (CYAN if leg['ratio'] >= 1.05 else SALMON) if seen else DIM
            txt = f"{name} {leg['lower']:.1f}/{leg['thigh']:.1f} = {leg['ratio']:.2f}" + ('' if seen else ', hidden')
            f15 = font(B, 15)
            tx = min(x + 2, W - 12 - d.textlength(txt, font=f15))
            d.text((tx, ty), txt, font=f15, fill=col)
            ty += 24
    return y + rows * cell_h + 10 - y0


def row_height(box, rows):
    return 28 + 20 + (box[3] - box[1]) * 3 * rows + (rows - 1) * 30 + 14


def draw_row(img, d, y, W, label, paths, box, rows, small, tiny):
    d.text((24, y), label, font=small, fill=INK)
    y += 28
    names = ['BEFORE · from in front', 'NOW · from in front', 'BEFORE · from behind', 'NOW · from behind']
    per = 4 // rows
    bw = (box[2] - box[0]) * 3
    bh = (box[3] - box[1]) * 3
    gap = 12
    x0 = (W - (per * bw + (per - 1) * gap)) // 2
    for r in range(rows):
        for i in range(per):
            j = r * per + i
            x = x0 + i * (bw + gap)
            d.text((x + 2, y), names[j], font=tiny, fill=CYAN if 'NOW' in names[j] else DIM)
            img.paste(figure(paths[j], box, 3), (x, y + 20))
        y += 20 + bh + (30 if r < rows - 1 else 0)
        if r < rows - 1:
            y -= 10
    return y + 14


def sheet(dir, out):
    spec = json.load(open(os.path.join(dir, 'sheet.json')))
    W = 1440
    big, mid, small = font(B, 34), font(B, 23), font(R, 18)
    tiny = font(B, 15)
    blocks = []
    probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    head = ['THE WARRIOR, BROUGHT UP TO THE BRAWLER\'S LEVEL']
    intro = ('Before (the Warrior as he is in the game today) beside now, three times as big, from in front and from behind. '
             'His look is kept: his pig-faced helm (brought back, as he asked), his red tabard and its pointed skirt, his dark red '
             'scarf, his steel and mail, his glowing great sword. What changes is how he is drawn (sculpted as one body, like the Brawler, not balls and '
             'tubes) and how he moves (30 pictures a second everywhere, alive when still, every blow a big held wind-up, a '
             'two-frame strike and a big wind-down, his feet gripping the floor). His scarf\'s two ends are moved by the game '
             'as before. His helm close and his eight facings: the second sheet. Pictures only: not in the game.')
    blocks.append(('head', head, wrap(probe, intro, small, W - 48)))
    if spec.get('legs'):
        blocks.append(('legs', spec['legs']))
    for sec in spec['sections']:
        blocks.append(('title', sec['title']))
        for row in sec['rows']:
            paths = [os.path.join(dir, f) for f in row['files']]
            box = union_box(paths)
            bw = box[2] - box[0]
            blocks.append(('row', row['label'], paths, box, 1 if 4 * bw * 3 + 3 * 12 <= W - 24 else 2))
    blocks.append(('title', 'At the game\'s own size (each of his pixels one pixel here)'))
    blocks.append(('small', spec['small']))
    # measure
    hgt = 0
    for b in blocks:
        if b[0] == 'head':
            hgt += 20 + 46 + len(b[2]) * 24 + 16
        elif b[0] == 'legs':
            hgt += legs_panel(dir, b[1], W, (big, mid, small, tiny), measure_only=True)
        elif b[0] == 'title':
            hgt += 22 + 34
        elif b[0] == 'row':
            box = b[3]
            hgt += row_height(box, b[4])
        else:
            hgt += 22 + 170 + 30
    img = Image.new('RGB', (W, hgt + 20), BG)
    d = ImageDraw.Draw(img)
    y = 20
    for b in blocks:
        if b[0] == 'head':
            d.text((24, y), b[1][0], font=big, fill=INK)
            y += 46
            for ln in b[2]:
                d.text((24, y), ln, font=small, fill=DIM)
                y += 24
            y += 16
        elif b[0] == 'legs':
            y += legs_panel(dir, b[1], W, (big, mid, small, tiny), img=img, d=d, y0=y)
        elif b[0] == 'title':
            y += 22
            d.text((24, y), b[1], font=mid, fill=CYAN)
            y += 34
        elif b[0] == 'row':
            _, label, paths, box, rows = b
            y = draw_row(img, d, y, W, label, paths, box, rows, small, tiny)
        else:
            y += 22
            x = 24
            for item in b[1]:
                for k, f in enumerate(item['files']):
                    p = os.path.join(dir, f)
                    box = (AX - 46, AY - 124, AX + 46, AY + 24)
                    fig = figure(p, box, 1)
                    img.paste(fig, (x, y))
                    d.text((x + 4, y + fig.height + 2), 'BEFORE' if k == 0 else 'NOW', font=tiny, fill=DIM if k == 0 else CYAN)
                    x += fig.width + 4
                d.text((x - 2 * (92 + 4) + 4, y - 20), item['label'], font=tiny, fill=INK)
                x += 26
            y += 170 + 30
    img = img.crop((0, 0, W, min(img.height, y + 10)))
    img.save(out)
    print(out, img.size)


def film(dir, out):
    spec = json.load(open(os.path.join(dir, 'film.json')))
    cap, lab, tiny = font(B, 24), font(B, 18), font(B, 14)
    W, H = 1100, 1060
    box = (34, 14, 158, 162)
    bw, bh = (box[2] - box[0]) * 3, (box[3] - box[1]) * 3
    probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    proc = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                             '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    title = Image.new('RGB', (W, H), BG)
    td = ImageDraw.Draw(title)
    td.text((40, 360), 'THE WARRIOR, BROUGHT UP', font=font(B, 44), fill=INK)
    for i, ln in enumerate(wrap(td, 'First, new: his eight facings, running round a circle and striking each of the eight ways, '
                                     'at the game\'s size and three times as big; his pig-faced helm brought back. Then before (the '
                                     'game today) beside now, from in front and from behind, three times as big; and on the right, at '
                                     'the game\'s own size. Every list now 30 pictures a second; every blow a big held wind-up, a '
                                     'strike of two frames, a big wind-down. Pictures only: not in the game.', font(R, 24), W - 80)):
        td.text((40, 430 + i * 34), ln, font=font(R, 24), fill=DIM)
    for _ in range(54):
        proc.stdin.write(title.tobytes())
    for fr in spec.get('scenes', []):
        proc.stdin.write(scene_frame(dir, fr, W, H, cap, lab, tiny, probe).tobytes())
    for fr in spec['frames']:
        strip = Image.open(os.path.join(dir, fr['file'])).convert('RGBA')
        cells = [strip.crop((i * PW, 0, (i + 1) * PW, PH)) for i in range(4)]
        img = Image.new('RGB', (W, H), BG)
        d = ImageDraw.Draw(img)
        y = 14
        for ln in wrap(probe, fr['caption'], cap, W - 40)[:3]:
            d.text((20, y), ln, font=cap, fill=INK)
            y += 30
        top = 110
        if fr['card']:
            # (his class card: before and now, from in front, side by side, bigger)
            for i, (c, name) in enumerate([(cells[0], 'BEFORE'), (cells[1], 'NOW')]):
                k = 4
                bx = (48, 20, 144, 156)
                im = c.crop(bx).resize(((bx[2] - bx[0]) * k, (bx[3] - bx[1]) * k), Image.NEAREST)
                g = ground(im.width, im.height, k, (AX - bx[0]) * k, (AY - bx[1]) * k)
                g.paste(im, (0, 0), im)
                x = 60 + i * (g.width + 80)
                d.text((x, top), name, font=lab, fill=CYAN if name == 'NOW' else DIM)
                img.paste(g, (x, top + 28))
        else:
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
            # at the game's own size
            gx = 20 + 2 * (bw + 14) + 16
            d.text((gx, top), "AT THE GAME'S SIZE", font=lab, fill=INK)
            for j in range(4):
                col, row = j % 2, j // 2
                sb = (42, 24, 142, 156)
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
    print(out, len(spec.get('scenes', [])) + len(spec['frames']) + 54, 'frames')


def scene_frame(dir, fr, W, H, cap, lab, tiny, probe):
    """A frame of his eight facings: the floor at the game's own size on the left, him three times as big on the right."""
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    y = 14
    for ln in wrap(probe, fr['caption'], cap, W - 40)[:3]:
        d.text((20, y), ln, font=cap, fill=INK)
        y += 30
    top = 110
    SW, SH = 560, 420
    cx, cy = SW // 2, SH // 2 + 50
    floor = Image.new('RGB', (SW, SH), BG)
    fd = ImageDraw.Draw(floor)
    fd.rectangle((0, 0, SW - 1, SH - 1), fill=(22, 21, 50))
    if 'path' in fr:
        r = fr['path']['r']
        ax_, ay_ = 32 * 2 ** 0.5 * r, 16 * 2 ** 0.5 * r
        fd.ellipse((cx - ax_, cy - ay_, cx + ax_, cy + ay_), outline=FLOOR, width=3)
    else:
        import math
        for k in range(8):
            a = math.radians(k * 45)
            fx, fy = math.cos(a), math.sin(a)
            ex, ey = cx + (fx - fy) * 32 * 3.2, cy + (fx + fy) * 16 * 3.2
            fd.line((cx, cy, ex, ey), fill=CYAN if k == fr['way'] else FLOOR, width=2 if k == fr['way'] else 1)
    # (his shadow, under his feet)
    fx_, fy_ = fr['at']
    for i in range(6, 0, -1):
        rx, ry = 15 * i / 6, 5 * i / 6
        c = tuple(int(FLOOR[j] + (8 - FLOOR[j]) * (1 - i / 6) * 0.9) for j in range(3))
        fd.ellipse((fx_ - rx, fy_ - ry, fx_ + rx, fy_ + ry), fill=c)
    him = Image.open(os.path.join(dir, fr['scene'])).convert('RGBA')
    floor.paste(him, (0, 0), him)
    d.text((20, top), "AT THE GAME'S SIZE", font=lab, fill=INK)
    img.paste(floor, (20, top + 28))
    # three times as big, beside it
    box = (34, 14, 158, 162)
    k = 3
    cell = Image.open(os.path.join(dir, fr['cell'])).convert('RGBA').crop(box)
    cell = cell.resize((cell.width * k, cell.height * k), Image.NEAREST)
    g = ground(cell.width, cell.height, k, (AX - box[0]) * k, (AY - box[1]) * k)
    g.paste(cell, (0, 0), cell)
    x = 20 + SW + 30
    d.text((x, top), 'THREE TIMES AS BIG', font=lab, fill=CYAN)
    img.paste(g, (x, top + 28))
    yy = top + 28 + SH + 24
    d.text((20, yy), 'facing ' + fr['facing'], font=cap, fill=CYAN)
    d.text((20, yy + 34), 'drawn from ' + fr['side'], font=lab, fill=DIM)
    return img


def sheet2(dir, out):
    """His helm close (six times as big), before and now; and his eight facings, three times as big and at the game's own size."""
    import math
    spec = json.load(open(os.path.join(dir, 'sheet2.json')))
    W = 1440
    big, mid, small = font(B, 34), font(B, 23), font(R, 18)
    tiny = font(B, 15)
    probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    intro = ('HIS HELM: his old pig-faced helm brought back, as he asked (a round skull, the visor a snout jutting forward like a '
             'pig\'s face), forged: a crisp ridge down the snout, rivets at its pivots, rows of breathing holes, the steel lit '
             'as armour, and the slit cut dark across the top of the snout, its upper lip lit and its lower edge in shadow, the '
             'faint cyan of his eyes in it. Seen from behind, the snout is hidden by his head. '
             'HIS EIGHT FACINGS: each truly painted, none of them a mirror, so that his sword is in his right hand whichever way he '
             'faces, as he asked. HIS SWORD, SEEN FROM EVERY SIDE: held as it was, point low behind him, from down and to the '
             'left it was wholly hidden by him and from toward you only a stub showed. Now his guard carries it level behind him, '
             'pointing back and out to his right, his run with his hands up by his right breast, and in town it rides point up on '
             'his back, over his right shoulder: from every side a good length of its light, its point among it, is seen. '
             'Each picture below sits where he faces: down and to the right at the bottom right, and so round. At the foot, his '
             'fall before and now (the first sheet\'s top now holds his legs, made true). Pictures only: not in the game.')
    lines = wrap(probe, intro, small, W - 48)
    helm = spec['helm']
    K = 6
    hw = (helm[0]['box'][2] - helm[0]['box'][0]) * K
    hh = (helm[0]['box'][3] - helm[0]['box'][1]) * K
    # each move's eight, cut to one box round all of them
    grids = []
    for sec in spec['turn']:
        paths = [os.path.join(dir, c['file']) for c in sec['cells']]
        box = union_box(paths)
        grids.append((sec, paths, box))
    gap = 14
    def grid_h(box, k):
        return 3 * ((box[3] - box[1]) * k + 40) + 2 * gap
    hgt = 20 + 46 + len(lines) * 24 + 16
    hgt += 22 + 34 + 3 * (24 + hh + 20) + 24 + 70
    for sec, paths, box in grids:
        hgt += 22 + 34 + grid_h(box, 3) + 10
    # (at the game's own size, the compasses side by side, as many to a line as fit)
    small_lines = []
    for sec, paths, box in grids:
        w = 3 * (box[2] - box[0]) + 2 * gap
        if not small_lines or small_lines[-1][0] + w > W - 24:
            small_lines.append([24, []])
        small_lines[-1][1].append((sec, paths, box, small_lines[-1][0]))
        small_lines[-1][0] += w + 40
    hgt += 22 + 34 + sum(max(grid_h(box, 1) for _, _, box, _ in ln) + 30 for _, ln in small_lines)
    more = []
    for sec in spec.get('sections', []):
        hgt += 22 + 34
        for row in sec['rows']:
            paths = [os.path.join(dir, f) for f in row['files']]
            box = union_box(paths)
            nrow = 1 if 4 * (box[2] - box[0]) * 3 + 3 * 12 <= W - 24 else 2
            more.append((sec['title'], row['label'], paths, box, nrow))
            hgt += row_height(box, nrow)
    img = Image.new('RGB', (W, hgt + 20), BG)
    d = ImageDraw.Draw(img)
    y = 20
    d.text((24, y), 'THE WARRIOR: HIS HELM, AND HIS EIGHT FACINGS', font=big, fill=INK)
    y += 46
    for ln in lines:
        d.text((24, y), ln, font=small, fill=DIM)
        y += 24
    y += 16
    # --- the helm, close
    y += 22
    d.text((24, y), 'His helm, six times as big: before (the game today) and now, at his guard', font=mid, fill=CYAN)
    y += 34
    for row in (helm[:2], helm[2:6], helm[6:]):
        x = 24
        for h in row:
            im = Image.open(os.path.join(dir, h['file'])).convert('RGBA').crop(tuple(h['box']))
            im = im.resize((im.width * K, im.height * K), Image.NEAREST)
            bg = Image.new('RGB', im.size, BG)
            bg.paste(im, (0, 0), im)
            d.text((x + 2, y), h['label'], font=tiny, fill=CYAN if h['now'] else DIM)
            img.paste(bg, (x, y + 22))
            x += im.width + 12
        y += 24 + hh + 20
    # the same heads at the game's own size
    d.text((24, y), "The same, at the game's own size:", font=tiny, fill=INK)
    x = 330
    for h in helm:
        im = Image.open(os.path.join(dir, h['file'])).convert('RGBA').crop(tuple(h['box']))
        bg = Image.new('RGB', im.size, BG)
        bg.paste(im, (0, 0), im)
        img.paste(bg, (x, y))
        x += im.width + 18
    y += 24 + 70
    # --- the eight facings, three times as big: a compass, each where he faces
    POS = {0: (2, 2), 1: (1, 2), 2: (0, 2), 3: (0, 1), 4: (0, 0), 5: (1, 0), 6: (2, 0), 7: (2, 1)}
    def compass(sec, paths, box, k, x0, y0, labels=True):
        cw, ch = (box[2] - box[0]) * k, (box[3] - box[1]) * k
        for c, p in zip(sec['cells'], paths):
            col, row = POS[c['k']]
            x = x0 + col * (cw + gap)
            yy = y0 + row * (ch + 40 + gap)
            fig = figure(p, box, k)
            img.paste(fig, (x, yy + (36 if labels else 18)))
            if labels:
                d.text((x + 2, yy), 'facing ' + c['name'], font=tiny, fill=CYAN)
                d.text((x + 2, yy + 17), 'drawn ' + c['side'], font=tiny, fill=DIM)
        # (the middle: which way is which)
        mx = x0 + (cw + gap) + cw // 2
        my = y0 + (ch + 40 + gap) + (ch + 40) // 2
        for kk in range(8):
            a = math.radians(kk * 45)
            fx, fy = math.cos(a), math.sin(a)
            sx, sy = fx - fy, (fx + fy) * 0.5
            n = math.hypot(sx, sy)
            L = min(cw, ch) * 0.32
            d.line((mx, my, mx + sx / n * L, my + sy / n * L), fill=CYAN, width=2)
            ex, ey = mx + sx / n * L, my + sy / n * L
            d.ellipse((ex - 3, ey - 3, ex + 3, ey + 3), fill=CYAN)
        return 3 * cw + 2 * gap
    for sec, paths, box in grids:
        y += 22
        d.text((24, y), sec['title'] + ': his eight facings, three times as big', font=mid, fill=CYAN)
        y += 34
        cw = (box[2] - box[0]) * 3
        compass(sec, paths, box, 3, (W - (3 * cw + 2 * gap)) // 2, y)
        y += grid_h(box, 3) + 10
    y += 22
    d.text((24, y), "The same at the game's own size", font=mid, fill=CYAN)
    y += 34
    for _, ln in small_lines:
        for sec, paths, box, x in ln:
            d.text((x, y - 4), sec['title'], font=tiny, fill=INK)
            compass(sec, paths, box, 1, x, y + 14, labels=False)
        y += max(grid_h(box, 1) for _, _, box, _ in ln) + 30
    # (and the rows of before and now that the first sheet has no room for)
    titled = set()
    for title, label, paths, box, nrow in more:
        if title not in titled:
            titled.add(title)
            y += 22
            d.text((24, y), title + ': before and now (from the first sheet)', font=mid, fill=CYAN)
            y += 34
        y = draw_row(img, d, y, W, label, paths, box, nrow, small, tiny)
    img = img.crop((0, 0, W, min(img.height, y + 10)))
    img.save(out)
    print(out, img.size)


if __name__ == '__main__':
    mode, dir, out = sys.argv[1:4]
    if mode == 'sheet':
        sheet(dir, out)
    elif mode == 'sheet2':
        sheet2(dir, out)
    else:
        film(dir, out)
