#!/usr/bin/env python3
# THE MAGE BROUGHT UP: THE FILM AND THE PICTURES FOR THE OWNER, LAID OUT (the Mage chat, 11 Nov 2026;
# docs/mockups/mage_up/README.md). From the pictures tools/scenarios/mage_up_look.mjs takes of her in the game.
#   python3 tools/mage_up_film.py film <frames_old> <frames_new> <out.mp4>     the two films side by side, captioned
#   python3 tools/mage_up_film.py three <old.png> <new.png> <brawler.png> <out.png>     as she is, redrawn, the Brawler
#   python3 tools/mage_up_film.py sides <dir/prefix> <out.png>                 her eight sides, four across
#   python3 tools/mage_up_film.py row <out.png> <caption> <label=file.png> ...  pictures in a row, each with its label
# Every picture is wider than it is tall, its pixels whole and big: made to be read on a phone held sideways (his word of a
# tall sheet, 9 Nov 2026: the picture resolutions were so bad on his phone he could not see anything).
import os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
BG = (13, 16, 48)
FG = (233, 236, 255)
MUTED = (163, 171, 216)
CYAN = (40, 220, 240)

def font(size):
    try:
        return ImageFont.truetype(B, size)
    except Exception:
        return ImageFont.load_default()

def label(d, xy, text, size, fill, anchor='la'):
    d.text(xy, text, font=font(size), fill=fill, anchor=anchor)

# (the film's parts, by its frames at 30 a second: tools/scenarios/mage_up_look.mjs, MODE=film)
PARTS = [(0, 'STANDING IN A FIGHT'), (72, 'TURNING: HER EIGHT SIDES'), (216, 'RUNNING'), (348, 'THE WAVE'), (409, 'THE ORB')]

def film(old, new, out):
    a = sorted(f for f in os.listdir(old) if f.endswith('.png'))
    b = sorted(f for f in os.listdir(new) if f.endswith('.png'))
    n = min(len(a), len(b))
    w, h = Image.open(os.path.join(new, b[0])).size
    gap, top, foot = 12, 64, 52
    W, H = w * 2 + gap, h + top + foot
    W += W % 2
    H += H % 2
    tmp = tempfile.mkdtemp()
    for i in range(n):
        im = Image.new('RGB', (W, H), BG)
        im.paste(Image.open(os.path.join(old, a[i])).convert('RGB'), (0, top))
        im.paste(Image.open(os.path.join(new, b[i])).convert('RGB'), (w + gap, top))
        d = ImageDraw.Draw(im)
        label(d, (w // 2, top // 2), 'AS SHE IS NOW', 34, MUTED, 'mm')
        label(d, (w + gap + w // 2, top // 2), 'REDRAWN', 34, CYAN, 'mm')
        part = [p for p in PARTS if p[0] <= i][-1][1]
        label(d, (W // 2, top + h + foot // 2), part, 28, FG, 'mm')
        im.save(os.path.join(tmp, f'{i:04d}.png'))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', os.path.join(tmp, '%04d.png'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], check=True)
    print(f'{out}: {n} frames, {W}x{H}, {n / 30:.1f} s')

def row(out, caption, items, cols=None):
    ims = [(lab, Image.open(f).convert('RGB')) for lab, f in items]
    cols = cols or len(ims)
    rows = (len(ims) + cols - 1) // cols
    w, h = ims[0][1].size
    gap, top, lab_h = 8, (56 if caption else 0), 40
    W = cols * w + (cols - 1) * gap
    H = top + rows * (h + lab_h) + (rows - 1) * gap
    im = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(im)
    if caption:
        label(d, (W // 2, top // 2), caption, 30, FG, 'mm')
    for i, (lab, p) in enumerate(ims):
        x = (i % cols) * (w + gap)
        y = top + (i // cols) * (h + lab_h + gap)
        label(d, (x + w // 2, y + lab_h // 2), lab.replace('_', ' '), 26, CYAN if lab.upper().startswith('REDRAWN') else MUTED if lab.upper().startswith('AS SHE') or lab.upper().startswith('NOW') else FG, 'mm')
        im.paste(p, (x, y + lab_h))
    im.save(out)
    print(f'{out}: {W}x{H}')

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else ''
    if mode == 'film':
        film(sys.argv[2], sys.argv[3], sys.argv[4])
    elif mode == 'three':
        row(sys.argv[5], '', [('AS SHE IS NOW', sys.argv[2]), ('REDRAWN', sys.argv[3]), ('THE BRAWLER, THE MEASURE', sys.argv[4])])
    elif mode == 'sides':
        names = ['down-right', 'toward you', 'down-left', 'left', 'up-left', 'away', 'up-right', 'right']
        row(sys.argv[3], 'REDRAWN: HER EIGHT SIDES, EACH TRULY PAINTED, NONE FLIPPED', [(names[i], f'{sys.argv[2]}_side_{i}.png') for i in range(8)], 4)
    elif mode == 'row':
        row(sys.argv[2], sys.argv[3], [tuple(a.split('=', 1)) for a in sys.argv[4:]])
    else:
        print(__doc__ or 'usage: see the head of this file')

if __name__ == '__main__':
    main()
