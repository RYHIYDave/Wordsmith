#!/usr/bin/env python3
# film_death.py <frames prefix> <out.gif> "<title>" "<label>@x,y;<label>@x,y;..." [scale=2]
# Joins the film of tools/scenarios/film_death.mjs into a moving picture: one pane for each
# figure, cut out of every frame round the point given (its feet, in pixels of the screenshot),
# two to a row. It is played as it plays in the game, then once more at a third of the speed.
#   env: BW, BH = the size of a pane in pixels of the screenshot (default 184 x 132)
#        UP = how much of a pane is above the feet, 0..1 (default 0.74)
#        SLOW = how many times slower the second pass is (default 3; 0 = no second pass)
import glob, os, shutil, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
prefix, out, title, spec = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
S = int(sys.argv[5]) if len(sys.argv) > 5 else 2
BW, BH = int(os.environ.get('BW', 184)), int(os.environ.get('BH', 132))
UP = float(os.environ.get('UP', 0.74))
SLOW = int(os.environ.get('SLOW', 3))
panes = []
for one in spec.split(';'):
    label, at = one.rsplit('@', 1)
    x, y = (int(v) for v in at.split(','))
    panes.append((label, (x - BW // 2, y - int(BH * UP), x - BW // 2 + BW, y - int(BH * UP) + BH)))
films = [Image.open(f).convert('RGB') for f in sorted(glob.glob(prefix + '_f[0-9][0-9][0-9].png'))]
n = len(films)
PAD, HEAD, LAB = 6, 34, 24
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)
    small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
except Exception:
    font = small = ImageFont.load_default()
cw, ch = BW * S, BH * S
cols = 2 if len(panes) > 1 else 1
rows = -(-len(panes) // cols)
FW = cols * cw + (cols + 1) * PAD
FH = HEAD + rows * (ch + LAB + PAD) + PAD
GOLD, GREY, PAGE = (255, 216, 102), (168, 162, 184), (22, 19, 28)
def frame(i, note):
    im = Image.new('RGB', (FW, FH), PAGE)
    dr = ImageDraw.Draw(im)
    dr.text((PAD, 7), title, fill=GOLD, font=font)
    dr.text((FW - PAD - dr.textlength(note, font=small), 9), note, fill=GREY, font=small)
    for k, (label, box) in enumerate(panes):
        x0 = PAD + (k % cols) * (cw + PAD)
        y0 = HEAD + (k // cols) * (ch + LAB + PAD)
        im.paste(films[i].crop(box).resize((cw, ch), Image.NEAREST), (x0, y0))
        dr.text((x0 + (cw - dr.textlength(label, font=small)) / 2, y0 + ch + 4), label, fill=GREY, font=small)
    return im
frames, dur = [], []
real = [3, 3, 4]   # hundredths of a second: thirty pictures a second
for i in range(n):
    frames.append(frame(i, 'as it plays')); dur.append(real[i % 3] * 10)
dur[-1] = 1100
if SLOW:
    for i in range(n):
        frames.append(frame(i, f'{["", "", "twice", "three times", "four times"][SLOW] if SLOW < 5 else str(SLOW) + " times"} slower')); dur.append(real[i % 3] * 10 * SLOW)
    dur[-1] = 1600
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
        subprocess.run(['convert', out, '-layers', 'Optimize', sm], check=True, timeout=300)
        if os.path.getsize(sm) < os.path.getsize(out): os.replace(sm, out)
    except Exception as e:
        print('not shrunk:', e)
    finally:
        if os.path.exists(sm): os.remove(sm)
print(out, (FW, FH), len(q), 'frames', os.path.getsize(out) // 1024, 'KB')
