#!/usr/bin/env python3
"""THE MASTER RUNE-STONE (art/quest3.ts; a mock-up: not in the game), as moving pictures for the owner's
phone, from the frames tools/scenarios/quest_dungeon.mjs and quest_town.mjs took (a phone's screen,
844 x 390 at three picture pixels to a point).
   python3 tools/quest_films.py dungeon <prefix> <out.gif>
   python3 tools/quest_films.py town <prefix> <out.gif>
The dungeon: the stone lying beside the fallen wordsmith, then taken up and flying into the hero, with
the corner of the screen where it then shows carried. The town: the ring dark, then the stone given and
the ring powering up; at the town's own speed, then again twice as slowly."""
import glob
import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

what, prefix, out = sys.argv[1], sys.argv[2], sys.argv[3]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG = (23, 20, 46)
PALE, GREY, CYAN, GOLD = (240, 232, 255), (168, 162, 184), (40, 220, 240), (255, 210, 122)
W = 600
big, mid, small, tag = ImageFont.truetype(B, 26), ImageFont.truetype(R, 17), ImageFont.truetype(R, 14), ImageFont.truetype(B, 16)

if what == 'dungeon':
    TITLE = 'The master rune-stone'
    LINES = [
        'In the first dungeon it lies beside the fallen',
        'wordsmith, its rune throbbing. Taken up, it rises,',
        'stands, bursts with light and flies into you; and the',
        'corner of the screen shows it while you carry it.',
    ]
    PANELS = [('BY THE FALLEN WORDSMITH', (860, 380, 1460, 740)), ('THE CORNER OF THE SCREEN', (0, 40, 760, 340))]
    frames = sorted(glob.glob(f'{prefix}_lie_*.png')) + sorted(glob.glob(f'{prefix}_take_*.png')) + [f'{prefix}_carried.png'] * 12
    rate, slow_from = 12, len(sorted(glob.glob(f'{prefix}_lie_*.png')))
else:
    TITLE = 'The ring powers up'
    LINES = [
        'The ring is dark and so are the wordsmith\'s runes;',
        'his slab has an empty hollow. Given the stone, it',
        'floats over, lies down and is laid in; its rune lights,',
        'the light runs round the circle stone by stone, and',
        'the whole ring flares into life.',
    ]
    PANELS = [('IN TOWN', (760, 120, 1480, 660))]
    frames = sorted(glob.glob(f'{prefix}_dark_*.png')) + sorted(glob.glob(f'{prefix}_f*.png'))
    rate, slow_from = 10, 0

top = 12 + 34 + len(LINES) * 22 + 8


def panel(path, box):
    x0, y0, x1, y1 = box
    h = round((y1 - y0) * W / (x1 - x0))
    return Image.open(path).convert('RGB').crop(box).resize((W, h), Image.LANCZOS)


heights = [round((b[3] - b[1]) * W / (b[2] - b[0])) for _, b in PANELS]


def card(path, note):
    c = Image.new('RGB', (W, top + sum(h + 24 for h in heights) + 24), BG)
    d = ImageDraw.Draw(c)
    d.text((14, 10), TITLE, font=big, fill=GOLD)
    d.text((W - 14, 18), 'a mock-up: not in the game', font=small, fill=GREY, anchor='ra')
    for k, line in enumerate(LINES):
        d.text((14, 46 + k * 22), line, font=mid, fill=PALE)
    y = top
    for (label, box), h in zip(PANELS, heights):
        d.text((14, y + 3), label, font=tag, fill=CYAN)
        c.paste(panel(path, box), (0, y + 24))
        y += h + 24
    d.text((14, y + 4), note, font=small, fill=GREY)
    return c


shots = [card(f, 'the game at its own speed') for f in frames]
shots += [c for f in frames[slow_from:] for c in [card(f, 'again, twice as slowly')] * 2]
os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
tmp = out + '_frames'
os.makedirs(tmp, exist_ok=True)
for k, c in enumerate(shots):
    c.save(os.path.join(tmp, f'c{k:04d}.png'))
for j in range(1, 10):
    shots[-1].save(os.path.join(tmp, f'c{len(shots) - 1 + j:04d}.png'))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', str(rate), '-i', os.path.join(tmp, 'c%04d.png'), '-vf', 'split[a][b];[a]palettegen=max_colors=' + os.environ.get('COLOURS', '160') + ':stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle', '-loop', '0', out], check=True)
for name in os.listdir(tmp):
    os.remove(os.path.join(tmp, name))
os.rmdir(tmp)
print(out, shots[0].size, len(shots), 'frames', round(os.path.getsize(out) / 1e6, 2), 'MB')
