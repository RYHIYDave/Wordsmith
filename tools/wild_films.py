#!/usr/bin/env python3
"""BIG AND WILD, as a moving picture for the owner's phone (art/moves3.ts WILD, render/wild.ts; a
mock-up: not in the game): the frames tools/scenarios/wild_wave.mjs took in the practice room (a
phone's screen, 844 x 390 at three picture pixels to a point, the game at five screen pixels to a game
pixel), as it was above and big and wild below, cut round the mage and what she strikes, with what it
is over the top. First at the game's own speed (a frame is a thirtieth of a second of the game's
time), then a piece of it again, slower.
   python3 tools/wild_films.py <before prefix> <after prefix> <out.gif> [slow from-to] [slow times]
e.g. python3 tools/wild_films.py shots/wild/off shots/wild/on previews/wild/wild_wave.gif 8-36 3
The frames are <prefix>_fNNN.png."""
import glob
import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

before, after, out = sys.argv[1], sys.argv[2], sys.argv[3]
slow_from, slow_to = (int(v) for v in (sys.argv[4] if len(sys.argv) > 4 else '8-36').split('-'))
slow = int(sys.argv[5]) if len(sys.argv) > 5 else 3
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
K = 5  # screen pixels to a game pixel in the frames
BOX = (184, 50, 414, 160)  # x, y, w-end, h-end in game pixels: the mage and the five she strikes
W = 640
BG = (23, 20, 46)
PALE, GREY, CYAN, GOLD = (240, 232, 255), (168, 162, 184), (40, 220, 240), (255, 210, 122)
TITLE = 'The Wave, big and wild'
LINES = [
    'Top: as you last saw it. Bottom: big and wild.',
    'Her crystal crackles and spits sparks as it burns. She swings',
    'with her whole body, and the power kicks the staff back up.',
    'It goes with a blast and bolts that strike the floor; the wave',
    'stands up tall and crackles, and what it hits crackles too.',
]

big, mid, small, tag = ImageFont.truetype(B, 26), ImageFont.truetype(R, 17), ImageFont.truetype(R, 14), ImageFont.truetype(B, 16)
x0, y0, x1, y1 = BOX
scale = W / ((x1 - x0) * K)
H = round((y1 - y0) * K * scale)
top = 12 + 34 + len(LINES) * 22 + 8


def panel(path):
    return Image.open(path).convert('RGB').crop((x0 * K, y0 * K, x1 * K, y1 * K)).resize((W, H), Image.LANCZOS)


def card(i, note):
    c = Image.new('RGB', (W, top + 2 * (H + 24) + 24), BG)
    d = ImageDraw.Draw(c)
    d.text((14, 10), TITLE, font=big, fill=GOLD)
    d.text((W - 14, 18), 'a mock-up: not in the game', font=small, fill=GREY, anchor='ra')
    for k, line in enumerate(LINES):
        d.text((14, 46 + k * 22), line, font=mid, fill=PALE)
    y = top
    for label, colour, prefix in (('AS YOU LAST SAW IT', GREY, before), ('BIG AND WILD', CYAN, after)):
        d.text((14, y + 3), label, font=tag, fill=colour)
        c.paste(panel(f'{prefix}_f{i:03d}.png'), (0, y + 24))
        y += H + 24
    d.text((14, y + 4), note, font=small, fill=GREY)
    return c


n = min(len(glob.glob(f'{before}_f*.png')), len(glob.glob(f'{after}_f*.png')))
shots = [card(i, 'the game at its own speed, on a phone') for i in range(n)]
for i in range(slow_from, min(slow_to, n - 1) + 1):
    c = card(i, f'again, {slow} times slower')
    shots.extend([c] * slow)
os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
tmp = out + '_frames'
os.makedirs(tmp, exist_ok=True)
for k, c in enumerate(shots):
    c.save(os.path.join(tmp, f'c{k:04d}.png'))
# (the last picture is held a little before the film starts again)
for j in range(1, 20):
    shots[-1].save(os.path.join(tmp, f'c{len(shots) - 1 + j:04d}.png'))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', os.path.join(tmp, 'c%04d.png'), '-vf', 'split[a][b];[a]palettegen=max_colors=200:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle', '-loop', '0', out], check=True)
for name in os.listdir(tmp):
    os.remove(os.path.join(tmp, name))
os.rmdir(tmp)
print(out, shots[0].size, len(shots), 'frames', round(os.path.getsize(out) / 1e6, 2), 'MB')
