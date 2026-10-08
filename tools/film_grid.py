#!/usr/bin/env python3
# film_grid.py <out.gif> "<title>" "<label>@<frames prefix>@x,y;..." [columns=4] [scale=2]
# Joins several films (tools/scenarios/film_*.mjs: <prefix>_f000.png ...) into one moving picture:
# a pane for each, cut out of every frame of its film round the point given (the figure's feet, in
# pixels of the screenshot). Played as it plays in the game, then once more slower.
#   env: BW, BH = the size of a pane in pixels of the screenshot (default 150 x 130)
#        UP = how much of a pane is above the feet, 0..1 (default 0.7)
#        SLOW = how many times slower the second pass is (default 3; 0 = no second pass)
#        HOLD = how long the last frame of each pass stands, in hundredths of a second (default 120)
import glob, os, shutil, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
out, title, spec = sys.argv[1], sys.argv[2], sys.argv[3]
COLS = int(sys.argv[4]) if len(sys.argv) > 4 else 4
S = int(sys.argv[5]) if len(sys.argv) > 5 else 2
BW, BH = int(os.environ.get('BW', 150)), int(os.environ.get('BH', 130))
UP = float(os.environ.get('UP', 0.7))
SLOW = int(os.environ.get('SLOW', 3))
HOLD = int(os.environ.get('HOLD', 120))
panes = []
for one in spec.split(';'):
    label, prefix, at = one.split('@')
    x, y = (int(v) for v in at.split(','))
    box = (x - BW // 2, y - int(BH * UP), x - BW // 2 + BW, y - int(BH * UP) + BH)
    frames = [Image.open(f).convert('RGB').crop(box) for f in sorted(glob.glob(prefix + '_f[0-9][0-9][0-9].png'))]
    if not frames: sys.exit('no frames for ' + prefix)
    panes.append((label, frames))
n = min(len(f) for _, f in panes)
PAD, HEAD, LAB = 6, 34, 24
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)
    small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
except Exception:
    font = small = ImageFont.load_default()
cw, ch = BW * S, BH * S
cols = min(COLS, len(panes))
rows = -(-len(panes) // cols)
FW = cols * cw + (cols + 1) * PAD
FH = HEAD + rows * (ch + LAB + PAD) + PAD
GOLD, GREY, PAGE = (255, 216, 102), (168, 162, 184), (22, 19, 28)
def frame(i, note):
    im = Image.new('RGB', (FW, FH), PAGE)
    dr = ImageDraw.Draw(im)
    dr.text((PAD, 7), title, fill=GOLD, font=font)
    dr.text((FW - PAD - dr.textlength(note, font=small), 9), note, fill=GREY, font=small)
    for k, (label, frames) in enumerate(panes):
        x0 = PAD + (k % cols) * (cw + PAD)
        y0 = HEAD + (k // cols) * (ch + LAB + PAD)
        im.paste(frames[i].resize((cw, ch), Image.NEAREST), (x0, y0))
        dr.text((x0 + (cw - dr.textlength(label, font=small)) / 2, y0 + ch + 4), label, fill=GREY, font=small)
    return im
frames, dur = [], []
real = [3, 3, 4]   # hundredths of a second: thirty pictures a second
for i in range(n):
    frames.append(frame(i, 'as it plays')); dur.append(real[i % 3] * 10)
dur[-1] = HOLD * 10
if SLOW:
    words = {2: 'twice', 3: 'three times', 4: 'four times'}.get(SLOW, f'{SLOW} times')
    for i in range(n):
        frames.append(frame(i, f'{words} slower')); dur.append(real[i % 3] * 10 * SLOW)
    dur[-1] = HOLD * 13
strip = Image.new('RGB', (FW * 4, FH))
for k, i in enumerate([0, n // 3, n // 2, n - 1]): strip.paste(frames[i], (k * FW, 0))
# (the captions' own colours are few pixels: give them room in the palette)
for k, c in enumerate([GOLD, GREY, PAGE]): strip.paste(c, (k * 60, 0, k * 60 + 60, 60))
pal = strip.quantize(colors=255, method=Image.MEDIANCUT, dither=Image.NONE)
q = [f.quantize(palette=pal, dither=Image.NONE) for f in frames]
q[0].save(out, save_all=True, append_images=q[1:], duration=dur, loop=0, optimize=False, disposal=1)
if shutil.which('convert'):
    sm = out + '.small.gif'
    try:
        subprocess.run(['convert', out, '-layers', 'Optimize', sm], check=True, timeout=600)
        if os.path.getsize(sm) < os.path.getsize(out): os.replace(sm, out)
    except Exception as e:
        print('not shrunk:', e)
    finally:
        if os.path.exists(sm): os.remove(sm)
print(out, (FW, FH), len(q), 'frames', os.path.getsize(out) // 1024, 'KB')
