#!/usr/bin/env python3
"""THE WORDSMITH ON BONES AND HIS RING (art/smith3.ts, art/ring3.ts; a mock-up: not in the game), as a
moving picture for the owner's phone: the frames tools/scenarios/smith_look.mjs took in the town (a
phone's screen, 844 x 390 at three picture pixels to a point), as it is above and new below, cut round
the ring, with what it is over the top. A frame is a tenth of a second of the town's time; the film
plays at that speed, and then again more slowly.
   python3 tools/smith_films.py <before prefix> <after prefix> <out.gif> [slow times]
e.g. python3 tools/smith_films.py shots/smith/off shots/smith/on previews/smith/smith.gif 2
The frames are <prefix>_fNNN.png."""
import glob
import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

before, after, out = sys.argv[1], sys.argv[2], sys.argv[3]
slow = int(sys.argv[4]) if len(sys.argv) > 4 else 2
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOX = tuple(int(v) for v in os.environ.get('BOX', '900,120,1560,600').split(','))
W = int(os.environ.get('WIDTH', '600'))
BG = (23, 20, 46)
PALE, GREY, CYAN, GOLD = (240, 232, 255), (168, 162, 184), (40, 220, 240), (255, 210, 122)
TITLE = 'The wordsmith and his ring, new'
LINES = [
    'Top: as it is in the game. Bottom: new, on bones.',
    'Taller and older, in a teal cowl; runes burn on his robe.',
    'He writes a great rune on the air and drives it into his',
    'slab: the letters swirl in, then burst out, and every',
    'stone flares. The column of light rises off the slab.',
]
big, mid, small, tag = ImageFont.truetype(B, 26), ImageFont.truetype(R, 17), ImageFont.truetype(R, 14), ImageFont.truetype(B, 16)
x0, y0, x1, y1 = BOX
H = round((y1 - y0) * W / (x1 - x0))
top = 12 + 34 + len(LINES) * 22 + 8


def panel(path):
    return Image.open(path).convert('RGB').crop(BOX).resize((W, H), Image.LANCZOS)


def card(i, note):
    c = Image.new('RGB', (W, top + 2 * (H + 24) + 24), BG)
    d = ImageDraw.Draw(c)
    d.text((14, 10), TITLE, font=big, fill=GOLD)
    d.text((W - 14, 18), 'a mock-up: not in the game', font=small, fill=GREY, anchor='ra')
    for k, line in enumerate(LINES):
        d.text((14, 46 + k * 22), line, font=mid, fill=PALE)
    y = top
    for label, colour, prefix in (('AS IT IS IN THE GAME', GREY, before), ('NEW', CYAN, after)):
        d.text((14, y + 3), label, font=tag, fill=colour)
        c.paste(panel(f'{prefix}_f{i:03d}.png'), (0, y + 24))
        y += H + 24
    d.text((14, y + 4), note, font=small, fill=GREY)
    return c


n = min(len(glob.glob(f'{before}_f*.png')), len(glob.glob(f'{after}_f*.png')))
shots = [card(i, 'the town at its own speed') for i in range(n)]
for i in range(n):
    shots.extend([card(i, f'again, {slow} times slower')] * slow)
os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
tmp = out + '_frames'
os.makedirs(tmp, exist_ok=True)
for k, c in enumerate(shots):
    c.save(os.path.join(tmp, f'c{k:04d}.png'))
for j in range(1, 10):
    shots[-1].save(os.path.join(tmp, f'c{len(shots) - 1 + j:04d}.png'))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '10', '-i', os.path.join(tmp, 'c%04d.png'), '-vf', 'split[a][b];[a]palettegen=max_colors=' + os.environ.get('COLOURS', '160') + ':stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle', '-loop', '0', out], check=True)
for name in os.listdir(tmp):
    os.remove(os.path.join(tmp, name))
os.rmdir(tmp)
print(out, shots[0].size, len(shots), 'frames', round(os.path.getsize(out) / 1e6, 2), 'MB')
