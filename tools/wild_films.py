#!/usr/bin/env python3
"""BIG AND WILD, as a moving picture for the owner's phone (art/moves3.ts WILD, render/wild.ts; a
mock-up: not in the game): the frames tools/scenarios/wild_wave.mjs took in the practice room (a
phone's screen, 844 x 390 at three picture pixels to a point, the game at five screen pixels to a game
pixel), as it was above and big and wild below, cut round the mage and what she strikes, with what it
is over the top. First at the game's own speed (a frame is a thirtieth of a second of the game's
time), then a piece of it again, slower.
   python3 tools/wild_films.py <before prefix> <after prefix> <out.gif> [slow from-to[xN],...] [slow times] [wave|strike|shot]
e.g. python3 tools/wild_films.py shots/wild/off shots/wild/on previews/wild/wild_wave.gif 8-36 3
     python3 tools/wild_films.py shots/wild/strike_off shots/wild/strike_on previews/wild/wild_strike3.gif 9-34,94-123x2 3 strike
     python3 tools/wild_films.py shots/wild/shot_off shots/wild/shot_on previews/wild/wild_shot3.gif 8-30 3 shot
(Each piece played again slower is from-to, and xN for one played N times slower instead of [slow times].
FRAMES=from-to in the environment plays only those frames at the game's speed.)
The frames are <prefix>_fNNN.png."""
import glob
import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

before, after, out = sys.argv[1], sys.argv[2], sys.argv[3]
slow = int(sys.argv[5]) if len(sys.argv) > 5 else 3
pieces = []
for piece in (sys.argv[4] if len(sys.argv) > 4 else '8-36').split(','):
    span, _, times = piece.partition('x')
    a, b = (int(v) for v in span.split('-'))
    pieces.append((a, b, int(times) if times else slow))
what = sys.argv[6] if len(sys.argv) > 6 else 'wave'
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
K = 5  # screen pixels to a game pixel in the frames
# What each film is: the box cut from the frames (x, y, x-end, y-end in game pixels), its title, and what it says
FILMS = {
    'wave': {'box': (184, 50, 414, 160), 'title': 'The Wave, big and wild', 'before': 'AS YOU LAST SAW IT', 'lines': [
        'Top: as you last saw it. Bottom: big and wild.',
        'Her crystal crackles and spits sparks as it burns. She swings',
        'with her whole body, and the power kicks the staff back up.',
        'It goes with a blast and bolts that strike the floor; the wave',
        'stands up tall and crackles, and what it hits crackles too.',
    ]},
    'strike': {'box': (199, 60, 339, 140), 'title': 'Strike, big and wild', 'before': 'AS IT IS IN THE GAME', 'lines': [
        'Top: as it is in the game. Bottom: big and wild, his way.',
        'The first swing ends with the sword held up; the second',
        'tap swipes it from there back into his stance. No blue',
        'sparks: bone and dust fly off the skeleton, and yellow',
        'sparks off the armoured guardian.',
    ]},
    'strike_lone': {'box': (199, 60, 339, 140), 'title': 'Strike, no second tap', 'before': 'AS IT IS IN THE GAME', 'lines': [
        'Top: as it is in the game. Bottom: big and wild, his way.',
        'One swing and no second tap: he holds the sword up for',
        'as long as a second tap would still make the second',
        'swing, then lowers it round and down into his stance.',
    ]},
    'shot': {'box': (219, 60, 389, 141), 'title': 'Shot, big and wild', 'before': 'AS IT IS IN THE GAME', 'lines': [
        'Top: as it is in the game. Bottom: big and wild, his way.',
        'What was blue is wind now: a glint at the arrow\'s point,',
        'a gust and hoops of air at the loose, and a trail of air',
        'behind the arrow. It punches in, and what flies off is',
        'what it hits: bone and dust, yellow sparks off armour.',
    ]},
}
BOX = FILMS[what]['box']
W = int(os.environ.get('WIDTH', '640'))
BG = (23, 20, 46)
PALE, GREY, CYAN, GOLD = (240, 232, 255), (168, 162, 184), (40, 220, 240), (255, 210, 122)
TITLE = FILMS[what]['title']
LINES = FILMS[what]['lines']

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
    for label, colour, prefix in ((FILMS[what]['before'], GREY, before), ('BIG AND WILD', CYAN, after)):
        d.text((14, y + 3), label, font=tag, fill=colour)
        c.paste(panel(f'{prefix}_f{i:03d}.png'), (0, y + 24))
        y += H + 24
    d.text((14, y + 4), note, font=small, fill=GREY)
    return c


n = min(len(glob.glob(f'{before}_f*.png')), len(glob.glob(f'{after}_f*.png')))
first, last = (int(v) for v in os.environ.get('FRAMES', f'0-{n - 1}').split('-'))
shots = [card(i, 'the game at its own speed, on a phone') for i in range(first, min(last, n - 1) + 1)]
for a, b, times in pieces:
    for i in range(a, min(b, n - 1) + 1):
        c = card(i, f'again, {times} times slower')
        shots.extend([c] * times)
os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
tmp = out + '_frames'
os.makedirs(tmp, exist_ok=True)
for k, c in enumerate(shots):
    c.save(os.path.join(tmp, f'c{k:04d}.png'))
# (the last picture is held a little before the film starts again)
for j in range(1, 20):
    shots[-1].save(os.path.join(tmp, f'c{len(shots) - 1 + j:04d}.png'))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', os.path.join(tmp, 'c%04d.png'), '-vf', 'split[a][b];[a]palettegen=max_colors=' + os.environ.get('COLOURS', '200') + ':stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle', '-loop', '0', out], check=True)
for name in os.listdir(tmp):
    os.remove(os.path.join(tmp, name))
os.rmdir(tmp)
print(out, shots[0].size, len(shots), 'frames', round(os.path.getsize(out) / 1e6, 2), 'MB')
