# THE WARRIOR BROUGHT UP: THE SHEET AND THE FILM, LAID OUT WITH THEIR CAPTIONS (the art chat's helper, 6 Nov 2026).
# From the pictures tools/warrior_up_pics.ts paints (RGBA, his canvas: 176 by 176, his feet at 84, 132).
#   python3 tools/warrior_up_pics.py sheet <dir> <out.png>
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


def union_box(paths, pad=4):
    bb = [999, 999, -1, -1]
    for p in paths:
        b = Image.open(p).getbbox()
        if b:
            bb = [min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3])]
    return (max(0, bb[0] - pad), max(0, bb[1] - pad), min(176, bb[2] + pad), min(176, bb[3] + pad + 2))


def sheet(dir, out):
    spec = json.load(open(os.path.join(dir, 'sheet.json')))
    W = 1200
    big, mid, small = font(B, 34), font(B, 23), font(R, 18)
    tiny = font(B, 15)
    blocks = []
    probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    head = ['THE WARRIOR, BROUGHT UP TO THE BRAWLER\'S LEVEL']
    intro = ('Before (the Warrior as he is in the game today) beside now, three times as big, from in front and from behind. '
             'His look is kept: his pointed helm, his red tabard and its pointed skirt, his dark red scarf, his steel and mail, '
             'his glowing great sword. What changes is how he is drawn (sculpted as one body, like the Brawler, not balls and '
             'tubes) and how he moves (30 pictures a second everywhere, alive when still, every blow a big held wind-up, a '
             'two-frame strike and a big wind-down, his feet gripping the floor). His scarf\'s two ends are moved by the game '
             'as before. Pictures only: not in the game.')
    blocks.append(('head', head, wrap(probe, intro, small, W - 48)))
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
        elif b[0] == 'title':
            hgt += 22 + 34
        elif b[0] == 'row':
            box = b[3]
            hgt += 28 + 20 + (box[3] - box[1]) * 3 * b[4] + (b[4] - 1) * 30 + 14
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
        elif b[0] == 'title':
            y += 22
            d.text((24, y), b[1], font=mid, fill=CYAN)
            y += 34
        elif b[0] == 'row':
            _, label, paths, box, rows = b
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
            y += 14
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
    box = (26, 14, 150, 162)
    bw, bh = (box[2] - box[0]) * 3, (box[3] - box[1]) * 3
    probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    proc = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                             '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    title = Image.new('RGB', (W, H), BG)
    td = ImageDraw.Draw(title)
    td.text((40, 360), 'THE WARRIOR, BROUGHT UP', font=font(B, 44), fill=INK)
    for i, ln in enumerate(wrap(td, 'Before (the game today) beside now, from in front and from behind, three times as big; '
                                     'and on the right, at the game\'s own size. Every list now 30 pictures a second; every blow a '
                                     'big held wind-up, a strike of two frames, a big wind-down. Pictures only: not in the game.', font(R, 24), W - 80)):
        td.text((40, 430 + i * 34), ln, font=font(R, 24), fill=DIM)
    for _ in range(54):
        proc.stdin.write(title.tobytes())
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
        if fr['card']:
            # (his class card: before and now, from in front, side by side, bigger)
            for i, (c, name) in enumerate([(cells[0], 'BEFORE'), (cells[1], 'NOW')]):
                k = 4
                bx = (40, 20, 136, 156)
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
    print(out, len(spec['frames']) + 54, 'frames')


if __name__ == '__main__':
    mode, dir, out = sys.argv[1:4]
    if mode == 'sheet':
        sheet(dir, out)
    else:
        film(dir, out)
