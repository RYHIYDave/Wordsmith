#!/usr/bin/env python3
"""THE WAYS THROUGH THE CRYPT (game/ways.ts, WAYS: not in the game), as moving pictures for the owner's
phone, from the frames tools/scenarios/ways_film.mjs took (a phone's screen, 844 x 390 points, one
picture pixel to a point), at the game's own speed: a frame every 15th of a second.
   python3 tools/ways_films.py <prefix (shots/ways/w)> <out dir>
Writes Ways_1_gate.gif, Ways_2_stairwell.gif and Ways_3_waypoint.gif, each with a line or two
over it saying what it shows."""
import glob
import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

prefix, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG = (13, 16, 48)
PALE, GREY, CYAN = (226, 230, 255), (150, 158, 204), (40, 220, 240)
big, mid, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 18), ImageFont.truetype(R, 15)
RATE = 15

FILMS = [
    ('a', 'Ways_1_gate.gif', 'THE GATE IN TOWN',
     ['Walk up to it and it rises. Walk through: the screen goes dark, and you are',
      'on floor 1, just inside its gate. It stays open: walk back through it for town.']),
    ('b', 'Ways_2_stairwell.gif', 'THE STAIRWELL DOWN',
     ['Kill the floor\'s boss and a stairwell opens in his hall. Step onto its top',
      'step: down to the next floor. You come in beside its waypoint, which wakes.']),
    ('c', 'Ways_3_waypoint.gif', 'THE WAYPOINT',
     ['Stand on it and press use: a column of light takes you to town, onto the',
      'waypoint there. That one takes you back to the deepest floor you have reached.']),
]
NOTE = 'Not in the game yet: behind a switch that is off.'


def card(path, title, lines):
    shot = Image.open(path).convert('RGB')
    top = 14 + 34 + len(lines) * 24 + 10
    c = Image.new('RGB', (shot.width, top + shot.height + 28), BG)
    d = ImageDraw.Draw(c)
    d.text((16, 12), title, font=big, fill=CYAN)
    for k, line in enumerate(lines):
        d.text((16, 50 + k * 24), line, font=mid, fill=PALE)
    c.paste(shot, (0, top))
    d.text((16, top + shot.height + 6), NOTE, font=small, fill=GREY)
    return c


os.makedirs(out, exist_ok=True)
for key, name, title, lines in FILMS:
    frames = sorted(glob.glob(f'{prefix}_{key}_f*.png'))
    if not frames:
        sys.exit(f'no frames for film {key} at {prefix}_{key}_f*.png')
    tmp = os.path.join(out, f'_{key}_frames')
    os.makedirs(tmp, exist_ok=True)
    cards = [card(f, title, lines) for f in frames]
    # (and the last frame held a second and a half before it plays again)
    cards += [cards[-1]] * int(RATE * 1.5)
    for k, c in enumerate(cards):
        c.save(os.path.join(tmp, f'c{k:04d}.png'))
    dest = os.path.join(out, name)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', str(RATE), '-i', os.path.join(tmp, 'c%04d.png'),
                    '-vf', 'split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle',
                    '-loop', '0', dest], check=True)
    for f in os.listdir(tmp):
        os.remove(os.path.join(tmp, f))
    os.rmdir(tmp)
    print(dest, cards[0].size, len(cards), 'frames', round(os.path.getsize(dest) / 1e6, 2), 'MB')
