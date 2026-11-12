#!/usr/bin/env python3
"""THE LIVING SHADOW FROM ALL EIGHT SIDES, as a moving picture for the owner's phone held sideways (the queue's
finish-mage-and-warlock-eight-sides, 12 Nov 2026; docs/mockups/warlock_up2/README.md; a mock-up, not in the game). Eight
panels, each it truly turned before the game's camera, 45 degrees apart (art/warrior_up.ts WU_SPIN: none a mirror), all
playing the same move at once: its stand, its slashes, its roar, dropping down to run and rearing up, its slashes again at
half speed. On a plain floor of the game's tiles, which goes by under each the way that one runs. Two film pixels a picture
pixel; sixty film frames a second, its stand, slashes, roar and rearing up each picture twice (thirty a second, as the game
shows them), its run and dropping down each picture once (sixty). MP4, not a GIF (his word: GIFs do not play on his phone).
   npx tsx tools/shadow_moves_pics.ts <dir>/t<turn> stand,slashL,slashR,roar,drop,run,rear5 front <turn>    for each of the
       eight turns 0,-45,-90,-135,180,135,90,45 (about two and a half minutes each)
   python3 tools/shadow_sides_film.py <dir> <out.mp4> [sheet.png]"""
import json, math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
sheet_out = sys.argv[3] if len(sys.argv) > 3 else None
# (the eight, in the game's own words for them, art/warrior_up.ts WuSide: how far each is turned to its left; which way on the
# screen it faces, as an arrow and in plain words)
SIDES = [
    ('front', 0, 'down and right'), ('toward', -45, 'down, toward you'), ('frontL', -90, 'down and left'), ('sideL', -135, 'left'),
    ('backL', 180, 'up and left'), ('away', 135, 'up, away from you'), ('back', 90, 'up and right'), ('side', 45, 'right'),
]
note = json.load(open(os.path.join(src, 't0', 'moves.json')))
MOVES = note['moves']
SC = note['canvas']
CARRY = note['carry']
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG, PALE, CYAN, GREY = (20, 18, 40), (226, 222, 244), (64, 232, 240), (150, 146, 172)
S = 2
KEYS = ['stand', 'slashL', 'slashR', 'roar', 'drop', 'run', 'rear5']

# ---- what is cut out of each painted frame: as big as eight panels can be on his phone's screen held sideways (2556 x 1179),
# two film pixels a picture pixel. All of it fits but the far tips of its widest slashes' streaks and the tops of its roar's
# rings, which are cut at the panel's edge (measured over every frame and side: it itself, 226 x 235 at most).
BOX = (SC['ax'] - 156, SC['ay'] - 208, SC['ax'] + 156, SC['ay'] + 48)
PW, PH = BOX[2] - BOX[0], BOX[3] - BOX[1]
FX, FY = SC['ax'] - BOX[0], SC['ay'] - BOX[1]
GAP, TOP, FOOT, CAP = 12, 60, 30, 26
W = PW * S * 4 + GAP * 5
H = TOP + (PH * S + CAP) * 2 + GAP + FOOT
W += W % 2
H += H % 2
big, line, small = ImageFont.truetype(B, 28), ImageFont.truetype(R, 20), ImageFont.truetype(B, 19)
TILE = 32.0 / (2.0 / 3.0) ** 0.5

_frames = {}
def frame(turn, key, f):
    k = (turn, key, f)
    if k not in _frames:
        if len(_frames) > 4000:
            _frames.clear()
        _frames[k] = Image.open(os.path.join(src, f't{turn}', f'{key}_front_f{f:03d}.png')).convert('RGBA').crop(BOX)
    return _frames[k]

# ---- the floor: the game's tiles, plain, as the game's camera sees them from in front; gone by under it as it is carried,
# the way it faces (turned `turn` to its left)
yy, xx = np.mgrid[0:PH, 0:PW].astype(np.float64)
sx, sy = xx - FX, yy - FY
FWD = (sx / 32 + sy / 16) / 2
LEFT = (sx / 32 - sy / 16) / 2
_floors = {}
def floor(gone):
    key = (round(gone[0], 2), round(gone[1], 2))
    if key in _floors:
        return _floors[key]
    a = FWD + gone[0] / TILE
    b = LEFT + gone[1] / TILE
    ia, ib = np.floor(a), np.floor(b)
    fa, fb = a - ia, b - ib
    dark = ((ia + ib) % 2 == 0)
    edge = (fa < 0.045) | (fb < 0.045)
    h = np.sin(ia * 12.9898 + ib * 78.233) * 43758.5453
    odd = (h - np.floor(h)) > 0.82
    img = np.empty((PH, PW, 3), np.uint8)
    img[:] = (52, 50, 72)
    img[dark] = (46, 44, 66)
    img[odd] = (58, 56, 78)
    img[edge] = (34, 32, 52)
    im = Image.fromarray(img, 'RGB').convert('RGBA')
    sh = Image.new('RGBA', (PW, PH), (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse([FX - 44, FY - 16, FX + 44, FY + 16], fill=(12, 10, 26, 110))
    im.alpha_composite(sh)
    if len(_floors) > 600:
        _floors.clear()
    _floors[key] = im
    return im

def arrow(d, cx, cy, turn, size=13):
    """Which way it faces on the screen: its forward (turned `turn` to its left) as the game's camera sees the floor."""
    th = math.radians(turn)
    fx, fl = math.cos(th), math.sin(th)
    # (a step forward on the floor, on the screen: forward is down and right, its left is up and right, as the tiles lie)
    vx, vy = 32 * fx + 32 * fl, 16 * fx - 16 * fl
    n = math.hypot(vx, vy)
    vx, vy = vx / n, vy / n
    tip = (cx + vx * size, cy + vy * size)
    tail = (cx - vx * size, cy - vy * size)
    d.line([tail, tip], fill=CYAN, width=3)
    px, py = -vy, vx
    d.polygon([tip, (tip[0] - vx * 8 + px * 6, tip[1] - vy * 8 + py * 6), (tip[0] - vx * 8 - px * 6, tip[1] - vy * 8 - py * 6)], fill=CYAN)

# ---- what is shown, film frame by film frame: (move, its picture, how far it has been carried ahead, the part's number)
PARTS = [
    ('THE LIVING SHADOW FROM ALL EIGHT SIDES', 'Each truly turned, none a mirror. Its hump, shoulders, embers and tail now move with its bones.'),
    ('ITS SLASHES, FROM ALL EIGHT SIDES', 'Left claw, then right: the wind-up, the swing all the way round, the freeze as it lands.'),
    ('ITS ROAR, FROM ALL EIGHT SIDES', 'The roar you said yes to, seen from every way it can face.'),
    ('DOWN ON ALL FOURS TO RUN, UP ON TWO LEGS TO STOP', 'The floor goes by under each the way that one runs.'),
    ('ITS SLASHES AT HALF SPEED', 'So each side can be followed through the swing.'),
]
film = []
gone = 0.0
def hold_move(key, part, hold=2, last=False, a=0, b=None):
    n = MOVES[key]['frames']
    for f in range(a, (b if b is not None else (n if last else n - 1))):
        film.extend([(key, f, gone, part)] * hold)
N_STAND = MOVES['stand']['frames']
RUN_N = MOVES['run']['frames']
# 1. its stand, a round
hold_move('stand', 0, last=True)
# 2. its slashes, left then right, then standing a moment
hold_move('slashL', 1)
hold_move('slashR', 1)
hold_move('stand', 1, a=0, b=30)
# 3. its roar
hold_move('roar', 2)
hold_move('stand', 2, a=0, b=30)
# 4. dropping down, running a round and to the moment it rears up from, rearing up
step = CARRY / 60
for f in range(MOVES['drop']['frames'] - 1):
    film.append(('drop', f, gone, 3))
    gone += step
f0 = round(note['dropInto'] * RUN_N)
f1 = round(5 / note['rears'] * RUN_N) + RUN_N
for f in range(f0, f1):
    film.append(('run', f % RUN_N, gone, 3))
    gone += step
for f in range(MOVES['rear5']['frames']):
    film.extend([('rear5', f, gone, 3)] * 2)
hold_move('stand', 3, a=0, b=30)
# 5. its slashes at half speed
hold_move('slashL', 4, hold=4)
hold_move('slashR', 4, hold=4)
hold_move('stand', 4, a=0, b=30)

def canvas_for(key, f, g, part):
    im = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(im)
    title, sub = PARTS[part]
    d.text((GAP + 4, 4), title, font=big, fill=PALE)
    d.text((GAP + 4, 36), sub, font=line, fill=GREY)
    for i, (name, turn, words) in enumerate(SIDES):
        col, row = i % 4, i // 4
        x = GAP + col * (PW * S + GAP)
        y = TOP + row * (PH * S + CAP + GAP)
        th = math.radians(turn)
        p = floor((g * math.cos(th), g * math.sin(th))).copy()
        p.alpha_composite(frame(turn, key, f))
        im.paste(p.convert('RGB').resize((PW * S, PH * S), Image.NEAREST), (x, y))
        arrow(d, x + 18, y + PH * S + CAP // 2, turn, 11)
        d.text((x + 36, y + PH * S + 2), f'facing {words}', font=small, fill=PALE)
    d.text((GAP + 4, H - FOOT + 4), 'A mock-up: not in the game yet. Two film pixels for each pixel of its picture.', font=line, fill=GREY)
    return im

if sheet_out:
    # (a picture of it every half second, for whoever checks it: its film frames 0, 30, 60, ...)
    picks = list(range(0, len(film), 30))
    first = canvas_for(*film[0])
    k = 0.5
    tw, th_ = round(W * k), round(H * k)
    cols = 3
    sheet = Image.new('RGB', (tw * cols, th_ * math.ceil(len(picks) / cols)), BG)
    for j, i in enumerate(picks):
        sheet.paste(canvas_for(*film[i]).resize((tw, th_), Image.LANCZOS), ((j % cols) * tw, (j // cols) * th_))
    sheet.save(sheet_out)
    print(f'sheet: {sheet_out} ({sheet.size[0]} x {sheet.size[1]}, {len(picks)} pictures)')

cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '60', '-i', '-',
       '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]
pipe = subprocess.Popen(cmd, stdin=subprocess.PIPE)
for item in film:
    pipe.stdin.write(canvas_for(*item).tobytes())
pipe.stdin.close()
pipe.wait()
print(f'{out}: {W} x {H}, {len(film)} frames, {len(film) / 60:.1f} s, {os.path.getsize(out) / 1e6:.1f} MB; the box cut from each picture {BOX}')
