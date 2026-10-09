#!/usr/bin/env python3
"""THE NEW WORDS AT WORK, as moving pictures for the owner's phone (render/words3.ts, a mock-up: not in
the game): the frames tools/scenarios/words3.mjs took in the practice room (a phone's screen, 844 x 390
at three picture pixels to a point, the game at five screen pixels to a game pixel), cut round what
the word does, with the word's name and what it does over the top, at the game's own speed (a frame
is a thirtieth of a second of the game's time).
   python3 tools/words3_films.py <frames dir> <out dir> [word ...]
The frames are <frames dir>/<word>_fNNN.png; each film goes to <out dir>/<word>.gif."""
import glob
import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
words = sys.argv[3:] or ['pulling', 'heavy', 'hexing', 'frenzied', 'splitting', 'precise', 'stilling', 'guarding']
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
K = 5  # screen pixels to a game pixel in the frames
W = 600
BG = (23, 20, 46)
PALE, GREY = (240, 232, 255), (168, 162, 184)

FILMS = {
    # box: x, y, w, h in game pixels; colour: the word's own
    'pulling': {'box': (212, 46, 240, 128), 'colour': (0x7a, 0x76, 0xe0), 'lines': ['In front: drags what it hits in to the impact.', 'Behind: a vortex that keeps pulling.']},
    'heavy': {'box': (192, 52, 196, 112), 'colour': (0xac, 0x87, 0x53), 'lines': ['In front: a heavy blow. Everything holds for a tenth', 'of a second; it stuns, and knocks them back a step.', 'Behind: cracked ground that staggers what walks in.']},
    'hexing': {'box': (226, 40, 196, 118), 'colour': (0xb8, 0xb4, 0xc8), 'lines': ['In front: a curse. Its sign hangs over the cursed,', 'and every hit on it flares.', 'Behind: a hex circle. What stands in it is drained grey.']},
    'frenzied': {'box': (190, 56, 156, 102), 'colour': (0xff, 0x5c, 0x33), 'lines': ['In front: every attack adds to the frenzy, up to five.', 'The ring at his feet fills; from three he shivers in it.', 'Behind: a kill sends a spark back and keeps it going.']},
    'splitting': {'box': (236, 48, 210, 112), 'colour': (0xdc, 0xaa, 0xf6), 'lines': ['In front: on its first hit it breaks into three', 'smaller copies that fly on.', 'Behind: where it ends, shards scatter and lie glinting.']},
    'precise': {'box': (236, 42, 180, 116), 'colour': (0xee, 0xf4, 0xfa), 'lines': ['In front: a narrow, exact hit: a needle of light', 'and a small bright star.', 'Behind: a sight closes on the enemy; the next hit', 'on it is a certain critical.']},
    'stilling': {'box': (228, 35, 214, 140), 'colour': (0x86, 0xea, 0xae), 'lines': ['In front: time slows for what it hits: a ripple, a clock', 'at its feet, and its echoes linger as it moves.', 'Behind: a bubble where enemies and their shots crawl.']},
    'guarding': {'box': (196, 48, 140, 108), 'colour': (0x30, 0xa8, 0x68), 'lines': ['In front: using it gives a brief shield, a shell round', 'the hero that flares where a blow lands.', 'Behind: a ward circle; the hero takes less damage inside.']},
    'mystical': {'box': (200, 46, 180, 112), 'colour': (0xac, 0xbc, 0xfe), 'lines': ['In front: a bigger spell hit. A crescent of moonlight', 'sweeps round the struck; a spell that hits one enemy', 'splashes the ones beside it.', 'Behind: each spell hit sends a star to the little moon', 'at her shoulder. It waxes to full at five.']},
}

os.makedirs(out, exist_ok=True)
big, mid, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 17), ImageFont.truetype(R, 14)
for word in words:
    f = FILMS[word]
    x, y, w, h = f['box']
    scale = W / (w * K)
    H = round(h * K * scale)
    top = 14 + 32 + len(f['lines']) * 22 + 10
    frames = sorted(glob.glob(os.path.join(src, f'{word}_f*.png')))
    shots = []
    for path in frames:
        im = Image.open(path).convert('RGB').crop((x * K, y * K, (x + w) * K, (y + h) * K)).resize((W, H), Image.LANCZOS)
        card = Image.new('RGB', (W, top + H + 22), BG)
        d = ImageDraw.Draw(card)
        d.text((14, 10), word.upper(), font=big, fill=f['colour'])
        d.text((W - 14, 18), 'a mock-up: not in the game', font=small, fill=GREY, anchor='ra')
        for i, line in enumerate(f['lines']):
            d.text((14, 46 + i * 22), line, font=mid, fill=PALE)
        card.paste(im, (0, top))
        d.text((14, top + H + 4), 'the game at its own speed, on a phone', font=small, fill=GREY)
        shots.append(card)
    # (ffmpeg makes the GIF: one palette for the film, and each frame only where it differs from the last)
    tmp = os.path.join(out, f'_{word}')
    os.makedirs(tmp, exist_ok=True)
    for i, card in enumerate(shots):
        card.save(os.path.join(tmp, f'c{i:03d}.png'))
    # (the last picture is held a little before the film starts again)
    for j in range(1, 28):
        shots[-1].save(os.path.join(tmp, f'c{len(shots) - 1 + j:03d}.png'))
    path = os.path.join(out, f'{word}.gif')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', os.path.join(tmp, 'c%03d.png'), '-vf', 'split[a][b];[a]palettegen=max_colors=192:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle', '-loop', '0', path], check=True)
    for name in os.listdir(tmp):
        os.remove(os.path.join(tmp, name))
    os.rmdir(tmp)
    print(path, shots[0].size, len(shots), 'frames', round(os.path.getsize(path) / 1e6, 2), 'MB')
