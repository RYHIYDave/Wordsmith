#!/usr/bin/env python3
"""THE LIVING SHADOW'S MOVES, as a moving picture for the owner's phone held sideways (the Warlock chat, 11 Nov 2026;
docs/mockups/warlock_up2/README.md; dev/shadow_moves.ts: a mock-up, not in the game). The frames tools/shadow_moves_pics.ts
painted, from in front and from behind side by side, two film pixels a picture pixel, sixty film frames a second: its
stand, its slashes and its rearing up each picture twice (thirty a second, as the game shows them), its run and its dropping
down each picture once (sixty). On a plain floor of the game's own tiles (64 by 32 picture pixels), which goes by under it
as fast as the game carries it; the Brawler beside it at the start, for its size. MP4, not a GIF (his word: GIFs do not
play on his phone).
   python3 tools/shadow_moves_film.py <frames dir> <out.mp4>"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
note = json.load(open(os.path.join(src, 'moves.json')))
MOVES = note['moves']
SC = note['canvas']
CARRY = note['carry']
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG, PALE, CYAN, GREY = (20, 18, 40), (226, 222, 244), (64, 232, 240), (150, 146, 172)
S = 2
# (what is cut out of each painted frame: room for its widest slash; where its floor point is in it)
BOX = (96, 100, 444, 384)
PW, PH = BOX[2] - BOX[0], BOX[3] - BOX[1]
FX, FY = SC['ax'] - BOX[0], SC['ay'] - BOX[1]
GAP, TOP, FOOT = 16, 76, 58
W = PW * S * 2 + GAP * 3
H = TOP + PH * S + FOOT
H += H % 2
big, line, small = ImageFont.truetype(B, 34), ImageFont.truetype(R, 24), ImageFont.truetype(B, 20)
TILE = 32.0 / (2.0 / 3.0) ** 0.5
GRID = (2.0 / 3.0) ** 0.5

_frames = {}
def frame(key, view, f):
    k = (key, view, f)
    if k not in _frames:
        _frames[k] = Image.open(os.path.join(src, f'{key}_{view}_f{f:03d}.png')).convert('RGBA').crop(BOX)
    return _frames[k]

# ---- the floor: the game's tiles, plain; which way it lies under each view, and gone by under it as it is carried
yy, xx = np.mgrid[0:PH, 0:PW].astype(np.float64)
sx, sy = xx - FX, yy - FY
# (a point of the floor so far forward and to its left, in tiles, from the place on the picture)
FWD = {'front': (sx / 32 + sy / 16) / 2, 'back': (sx / 32 - sy / 16) / 2}
LEFT = {'front': (sx / 32 - sy / 16) / 2, 'back': (-sx / 32 - sy / 16) / 2}
def floor(view, gone):
    a = FWD[view] + gone / TILE
    b = LEFT[view]
    ia, ib = np.floor(a), np.floor(b)
    fa, fb = a - ia, b - ib
    dark = ((ia + ib) % 2 == 0)
    # (each flag a little darker at its edges: its joints)
    edge = (fa < 0.045) | (fb < 0.045)
    # (a flag here and there a tone off, by its own place: so the floor is seen to go by)
    h = np.sin(ia * 12.9898 + ib * 78.233) * 43758.5453
    odd = (h - np.floor(h)) > 0.82
    img = np.empty((PH, PW, 3), np.uint8)
    img[:] = (52, 50, 72)
    img[dark] = (46, 44, 66)
    img[odd] = (58, 56, 78)
    img[edge] = (34, 32, 52)
    return Image.fromarray(img, 'RGB')

BRAWLER = {v: Image.open(os.path.join(src, f'brawler_{v}.png')).convert('RGBA') for v in ('front', 'back')}
def panel(view, key, f, gone, brawler):
    p = floor(view, gone).convert('RGBA')
    # (a soft shadow under it, so it stands on the floor)
    sh = Image.new('RGBA', (PW, PH), (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse([FX - 44, FY - 16, FX + 44, FY + 16], fill=(12, 10, 26, 110))
    p.alpha_composite(sh)
    if brawler:
        # (the Brawler, the measure: not quite three tiles to its right)
        ax, ay, dens = note['brawler'][view]
        ax, ay = ax * dens, ay * dens
        off = 2.8 * TILE
        bx = FX + (GRID * -off if view == 'front' else GRID * off)
        by = FY + GRID * 0.5 * off
        p.alpha_composite(BRAWLER[view], (round(bx - ax), round(by - ay)))
    p.alpha_composite(frame(key, view, f))
    return p.convert('RGB').resize((PW * S, PH * S), Image.NEAREST)

# ---- what is shown, film frame by film frame: (move, its picture, how far it has gone, the part's number, the Brawler)
PARTS = [
    ('STANDING: UP ON TWO LEGS', 'Breathing, its weight shifting, its claws flexing. The Brawler beside it for size.'),
    ('TAP: REALLY WIDE SLASHES', 'Left claw, then right, and again. A big wind-up, a three-frame swing, a freeze as it lands.'),
    ('THE SAME, AT HALF SPEED', 'The claw comes all the way round, from behind its shoulder to past its other side.'),
    ('TO RUN IT DROPS TO ALL FOURS; TO STOP IT REARS UP', 'The run itself is the one already in the game.'),
    ('THE SAME, AT HALF SPEED', 'Dropping down, running, rearing up.'),
    ('ALL OF IT TOGETHER', 'Slash, slash, drop and run, rear up, slash.'),
]
film = []
gone = 0.0
def stand(a, b, part, hold=2, brawler=False):
    for f in range(a, b):
        film.extend([('stand', f, gone, part, brawler)] * hold)
def clip(key, part, hold=2):
    for f in range(MOVES[key]['frames']):
        film.extend([(key, f, gone, part, False)] * hold)
RUN_N = MOVES['run']['frames']
def dash(part, rounds, rear, hold=1):
    """It drops down, runs so many rounds and a part of one to the moment it rears up from, and rears up."""
    global gone
    step = CARRY / 60
    for f in range(MOVES['drop']['frames'] - 1):
        film.extend([('drop', f, gone, part, False)] * hold)
        gone += step
    f0 = round(note['dropInto'] * RUN_N)
    f1 = round(rear / note['rears'] * RUN_N) + rounds * RUN_N
    for f in range(f0, f1):
        film.extend([('run', f % RUN_N, gone, part, False)] * hold)
        gone += step
    clip(f'rear{rear}', part, hold * 2)
N_STAND = MOVES['stand']['frames']
REAR = 5
# 1. standing: two rounds
stand(0, N_STAND, 0, brawler=True)
stand(0, N_STAND, 0, brawler=True)
# 2. the slashes: left, right, left, right, as four taps would have them
clip('slashL', 1)
clip('slashR', 1)
clip('slashL', 1)
clip('slashR', 1)
stand(0, 24, 1)
# 3. the same at half speed
clip('slashL', 2, 4)
clip('slashR', 2, 4)
stand(0, 12, 2, 4)
# 4. dropping down, running, rearing up
stand(N_STAND - 30, N_STAND, 3)
dash(3, 2, REAR)
stand(0, 45, 3)
# 5. the same at half speed
stand(N_STAND - 10, N_STAND, 4, 4)
dash(4, 1, REAR, 2)
stand(0, 12, 4, 4)
# 6. all of it
stand(N_STAND - 30, N_STAND, 5)
clip('slashL', 5)
clip('slashR', 5)
dash(5, 2, REAR)
clip('slashR', 5)
clip('slashL', 5)
dash(5, 1, REAR)
stand(0, N_STAND, 5)

ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-framerate', '60', '-i', '-',
                       '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
last = None
card = None
shots = []
for n, shot in enumerate(film):
    if shot != last:
        key, f, g, part, brawler = shot
        card = Image.new('RGB', (W, H), BG)
        d = ImageDraw.Draw(card)
        d.text((GAP, TOP // 2), PARTS[part][0], font=big, fill=CYAN, anchor='lm')
        d.text((W - GAP, TOP // 2), 'THE LIVING SHADOW', font=small, fill=GREY, anchor='rm')
        for i, v in enumerate(('front', 'back')):
            x = GAP + i * (PW * S + GAP)
            card.paste(panel(v, key, f, g, brawler), (x, TOP))
            d.text((x + 10, TOP + 8), 'FROM IN FRONT' if v == 'front' else 'FROM BEHIND', font=small, fill=PALE)
        d.text((W // 2, TOP + PH * S + FOOT // 2), PARTS[part][1], font=line, fill=PALE, anchor='mm')
        last = shot
    ff.stdin.write(card.tobytes())
    if n % 20 == 0:
        shots.append(card.copy())
ff.stdin.close()
ff.wait()
# (a sheet of it, a picture every third of a second: for whoever checks the film)
tw, th = W // 4, H // 4
cols = 6
sheet = Image.new('RGB', (cols * tw, ((len(shots) + cols - 1) // cols) * th), BG)
for k, im in enumerate(shots):
    sheet.paste(im.resize((tw, th), Image.LANCZOS), ((k % cols) * tw, (k // cols) * th))
sheet.save(out.replace('.mp4', '_sheet.png'))
print(out, len(film), 'frames', round(len(film) / 60, 1), 's', f'{W}x{H}', round(os.path.getsize(out) / 1e6, 2), 'MB')
