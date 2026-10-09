#!/usr/bin/env python3
"""THE MONSTERS' ATTACKS (Version 19.8), as moving pictures for the owner's phone: the frames that
tools/scenarios/attacks_film.mjs took in the game (the practice room, 960 by 540, a frame every
twentieth of a second of the game's time), cut round the fight, a title and a line over it, at the
game's own speed.
   python3 tools/attacks_films.py <frames prefix> <out.gif> "<TITLE>" "<line>" "<line>" x,y,w,h [ms=50]
(the prefix is the playtest's --out: <prefix>_fNNN.png; x,y,w,h the part of each frame kept)"""
import glob
import os
import shutil
import subprocess
import sys
import tempfile
from PIL import Image, ImageDraw, ImageFont

prefix, out, title, line1, line2, box = sys.argv[1:7]
ms = int(sys.argv[7]) if len(sys.argv) > 7 else 50
x, y, w, h = (int(v) for v in box.split(','))
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG, GOLD, PALE, GREY = (23, 20, 46), (255, 216, 102), (240, 232, 255), (168, 162, 184)
big, mid, small = ImageFont.truetype(B, 22), ImageFont.truetype(R, 15), ImageFont.truetype(R, 13)
frames = sorted(glob.glob(prefix + '_f*.png'))
if not frames:
    sys.exit('no frames at ' + prefix)
top = 10 + 28 + 2 * 20 + 6


def fit(d, line):
    """The caption's font, smaller if the line would not fit across the picture."""
    for size in (15, 14, 13, 12):
        f = ImageFont.truetype(R, size)
        if d.textlength(line, font=f) <= w - 20:
            return f
    return ImageFont.truetype(R, 11)


here = os.path.dirname(os.path.abspath(__file__))
tmp = tempfile.mkdtemp(prefix='attacks_film_')
try:
    for i, f in enumerate(frames):
        c = Image.new('RGB', (w, top + h + 22), BG)
        d = ImageDraw.Draw(c)
        d.text((10, 8), title, font=big, fill=GOLD)
        for k, line in enumerate((line1, line2)):
            d.text((10, 40 + 20 * k), line, font=fit(d, line), fill=PALE)
        c.paste(Image.open(f).convert('RGB').crop((x, y, x + w, y + h)), (0, top))
        d.text((10, top + h + 4), 'in the game, at its own speed (the warrior cannot die here)', font=small, fill=GREY)
        c.save(os.path.join(tmp, f'f{i:04d}.png'))
    print(subprocess.run(['python3', os.path.join(here, 'hero_gif.py'), tmp, out, str(ms), '0'], check=True, capture_output=True, text=True).stdout.strip())
finally:
    shutil.rmtree(tmp, ignore_errors=True)
