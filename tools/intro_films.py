#!/usr/bin/env python3
"""THE BOSS'S ENTRANCE AND THE FLOORS' NAMES (game/defs.ts BOSS_INTRO, FLOOR_NAMES),
as moving pictures for the owner's phone, from the frames tools/scenarios/boss_intro.mjs took with
FILM=1 or FILM=wait (a phone's screen, 844 x 390 points), at the game's own speed: a frame every 15th
of a second.
   python3 tools/intro_films.py <prefix (shots/intro/film)> <out dir> [films: f, b, w; all by default]
Writes Intro_1_floor_name.gif, Intro_2_boss.gif and Intro_3_boss_waits.gif, each with a line or two over
it, from whichever frames are asked for."""
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
    ('f', 'Intro_1_floor_name.gif', "A FLOOR'S NAME",
     ['As you come into a floor, its own name comes up, with its level under it.',
      'Floor 2 is "The Headsman\'s Yard", Prison Level 2.'],
     'Not in the game yet: behind a switch that is off.'),
    ('b', 'Intro_2_boss.gif', "THE BOSS'S ENTRANCE",
     ['In his hall the gate slams shut behind you. He says his line, then his',
      'name comes up across the screen. He waits until it has; then he fights.'],
     'Not in the game yet: behind a switch that is off.'),
    ('w', 'Intro_3_boss_waits.gif', "THE BOSS WAITS AT THE BACK",
     ['Shot from the open gate, he can\'t be hurt: "Not yet". Walk in, the gate',
      'shuts behind you, he says his line and his name comes up; then he fights.'],
     'For the next version (the first five floors). Not live yet.'),
]


def card(path, title, lines, note):
    shot = Image.open(path).convert('RGB')
    if shot.width > 844:
        # (frames taken at the phone's own pixels, three to a point, shown at a point to a pixel)
        shot = shot.resize((844, round(shot.height * 844 / shot.width)), Image.LANCZOS)
    top = 14 + 34 + len(lines) * 24 + 10
    c = Image.new('RGB', (shot.width, top + shot.height + 28), BG)
    d = ImageDraw.Draw(c)
    d.text((16, 12), title, font=big, fill=CYAN)
    for k, line in enumerate(lines):
        d.text((16, 50 + k * 24), line, font=mid, fill=PALE)
    c.paste(shot, (0, top))
    d.text((16, top + shot.height + 6), note, font=small, fill=GREY)
    return c


os.makedirs(out, exist_ok=True)
want = sys.argv[3].split(',') if len(sys.argv) > 3 else [f[0] for f in FILMS]
for key, name, title, lines, note in FILMS:
    if key not in want:
        continue
    frames = sorted(glob.glob(f'{prefix}_{key}_f*.png'))
    if not frames:
        sys.exit(f'no frames for film {key} at {prefix}_{key}_f*.png')
    tmp = os.path.join(out, f'_{key}_frames')
    os.makedirs(tmp, exist_ok=True)
    cards = [card(f, title, lines, note) for f in frames]
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
