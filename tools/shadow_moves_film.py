#!/usr/bin/env python3
"""THE LIVING SHADOW'S MOVES, as a moving picture for the owner's phone held sideways (the Warlock chat, 11 Nov 2026;
docs/mockups/warlock_up2/README.md; dev/shadow_moves.ts: a mock-up, not in the game). The frames tools/shadow_moves_pics.ts
painted, from in front and from behind side by side, two film pixels a picture pixel, sixty film frames a second: its
stand, its slashes and its rearing up each picture twice (thirty a second, as the game shows them), its run and its dropping
down each picture once (sixty). On a plain floor of the game's own tiles (64 by 32 picture pixels), which goes by under it
as fast as the game carries it; the Brawler beside it at the start, for its size. MP4, not a GIF (his word: GIFs do not
play on his phone).
   python3 tools/shadow_moves_film.py <frames dir> <out.mp4>            its stand, slashes, dropping down, run and rearing up
   python3 tools/shadow_moves_film.py <frames dir> <out.mp4> walking    its slashes made walking on two legs, each way it may go
                                                                       (his word of the first film, 11 Nov: “This but I want
                                                                       him to be able to move around on two legs as he’s
                                                                       swiping”): the floor goes by the way it goes, slowed
                                                                       for each slash's first moment as the game slows it
   python3 tools/shadow_moves_film.py <frames dir> <out.mp4> others     its other moves, all up on two legs (his word, 11 Nov,
                                                                       “Yes, all on two legs (Recommended)”): Damning, the
                                                                       smoke step (the eye going with it, the floor going by
                                                                       under it), its roar as the change into it ends, its
                                                                       burning out, struck hard and from behind; and all of
                                                                       them in a fight"""
import json, math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
WALKING = len(sys.argv) > 3 and sys.argv[3] == 'walking'
OTHERS = len(sys.argv) > 3 and sys.argv[3] == 'others'
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
    # (gone: how far it has been carried, forward and to its left)
    a = FWD[view] + gone[0] / TILE
    b = LEFT[view] + gone[1] / TILE
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
def panel(view, key, f, gone, brawler, shade=1.0):
    p = floor(view, gone).convert('RGBA')
    # (a soft shadow under it, so it stands on the floor; none while it is smoke, a man's under him once it has crumbled away)
    if shade > 0.05:
        sh = Image.new('RGBA', (PW, PH), (0, 0, 0, 0))
        ImageDraw.Draw(sh).ellipse([FX - 44 * shade, FY - 16 * shade, FX + 44 * shade, FY + 16 * shade], fill=(12, 10, 26, 110))
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
side = 0.0
def stand(a, b, part, hold=2, brawler=False):
    for f in range(a, b):
        film.extend([('stand', f, (gone, side), part, brawler)] * hold)
def clip(key, part, hold=2):
    for f in range(MOVES[key]['frames']):
        film.extend([(key, f, (gone, side), part, False)] * hold)
def walked(key, part, hold=2):
    """A slash made walking: the floor gone by the way it goes, as far as the game has carried it by each frame. (Its last
    frame is its stance again, as the next move's first is: left out.)"""
    global gone, side
    m = MOVES[key]
    th = math.radians(m['way'])
    for f in range(m['frames'] - 1):
        film.extend([(key, f, (gone + m['along'][f] * math.cos(th), side + m['along'][f] * math.sin(th)), part, False)] * hold)
    gone += m['along'][-1] * math.cos(th)
    side += m['along'][-1] * math.sin(th)
RUN_N = MOVES.get('run', {}).get('frames', 0)
def dash(part, rounds, rear, hold=1):
    """It drops down, runs so many rounds and a part of one to the moment it rears up from, and rears up."""
    global gone
    step = CARRY / 60
    for f in range(MOVES['drop']['frames'] - 1):
        film.extend([('drop', f, (gone, side), part, False)] * hold)
        gone += step
    f0 = round(note['dropInto'] * RUN_N)
    f1 = round(rear / note['rears'] * RUN_N) + rounds * RUN_N
    for f in range(f0, f1):
        film.extend([('run', f % RUN_N, (gone, side), part, False)] * hold)
        gone += step
    clip(f'rear{rear}', part, hold * 2)
N_STAND = MOVES['stand']['frames']
def shade_of(key, f):
    """How big its shadow on the floor is: none of it while it is smoke; a man's once it has crumbled away to him."""
    m = MOVES[key]
    if m.get('gone'):
        return 1.0 - m['gone'][f]
    if key == 'burnout':
        sag = round(52)
        return 1.0 if f <= sag else max(0.5, 1.0 - 0.5 * (f - sag) / 27.0)
    return 1.0
def other(key, part, hold=2, last=False, after=0):
    """One of its other moves; a move that takes it across the floor (its smoke step), the eye going with it, the floor
    gone by as far as it has gone. (Its last frame is its stance again, as the next move's first is: left out, unless asked.)
    `after`: so many frames more, it standing where the move left it, what the move left on the floor cooling there (Damning,
    the smoke step: painted so by tools/shadow_moves_pics.ts); the stand goes on from that frame of it."""
    global gone
    m = MOVES[key]
    n = m.get('own', m['frames'])
    for f in range(n + after if last or after else n - 1):
        g = gone + (m['along'][f] if m.get('along') else 0.0)
        film.extend([(key, f, (g, side), part, False, shade_of(key, f))] * hold)
    if m.get('along'):
        gone += m['along'][-1]
if OTHERS:
    PARTS = [
        ('TAP AND HOLD: DAMNING, UP ON TWO LEGS', 'It drops onto its claws, they bite the floor, it heaves, tears them up, and is back on two legs.'),
        ('THE SAME, AT HALF SPEED', 'No rear-up and slam. What it does to the ones it damns is the game\'s own, as now.'),
        ('SWIPE: THE SMOKE STEP, UP ON TWO LEGS', 'It hunkers down, bursts into smoke, goes six tiles, bursts out slamming its claws down, and rises.'),
        ('THE SAME, AT HALF SPEED', 'This smoke is the move itself, as it is in the game now. No smoke comes off its body.'),
        ('THE CHANGE INTO IT ENDS UP ON TWO LEGS: ITS ROAR', 'How the change will end. The change itself (him turning into it) comes next, with its eight sides.'),
        ('THE METER RUNS DRY: IT BURNS OUT', 'Its light gutters and dies, it sinks onto one knee, crumbles away, and he is left kneeling.'),
        ('STRUCK HARD, THEN STRUCK FROM BEHIND', 'Rocked back on its legs; then driven forward, with a glare back over its shoulder. Twice each.'),
        ('THE SAME, AT HALF SPEED', 'Struck hard; struck from behind.'),
        ('ALL OF IT IN A FIGHT, UP ON TWO LEGS', 'Slash, slash, struck, the smoke step, slash, slash, Damning, and it stands.'),
    ]
    # 1. Damning; it stands on over what it tore up
    stand(N_STAND - 30, N_STAND, 0)
    other('damning', 0, after=50)
    # 2. the same at half speed
    stand(N_STAND - 6, N_STAND, 1, 4)
    other('damning', 1, 4, after=12)
    # 3. the smoke step; it stands on as its smoke clears
    stand(N_STAND - 30, N_STAND, 2)
    other('step', 2, after=48)
    # 4. the same at half speed
    stand(N_STAND - 6, N_STAND, 3, 4)
    other('step', 3, 4, after=14)
    # 5. its roar, twice
    stand(N_STAND - 20, N_STAND, 4)
    other('roar', 4)
    stand(0, 24, 4)
    other('roar', 4)
    stand(0, 30, 4)
    # 6. its burning out: its sagging, its crumbling, him getting up; and he stands a moment
    stand(N_STAND - 30, N_STAND, 5)
    other('burnout', 5, last=True)
    film.extend([film[-1]] * 40)
    # 7. struck hard, twice; from behind, twice
    stand(N_STAND - 24, N_STAND, 6)
    other('reel', 6)
    stand(0, 16, 6)
    other('reel', 6)
    stand(0, 24, 6)
    other('lurch', 6)
    stand(0, 16, 6)
    other('lurch', 6)
    stand(0, 24, 6)
    # 8. the same at half speed
    stand(N_STAND - 4, N_STAND, 7, 4)
    other('reel', 7, 4)
    stand(0, 6, 7, 4)
    other('lurch', 7, 4)
    stand(0, 6, 7, 4)
    # 9. all of it in a fight: the smoke step in, and Damning last, it standing on over what it tore up
    stand(N_STAND - 20, N_STAND, 8)
    clip('slashL', 8)
    clip('slashR', 8)
    other('reel', 8)
    # (48 frames on, half way round its stand, it is in its stance exactly: the slash takes it up with no jump)
    other('step', 8, after=48)
    clip('slashR', 8)
    clip('slashL', 8)
    other('damning', 8, after=60)
elif WALKING:
    PARTS = [
        ('SLASHING ON THE MOVE, ON TWO LEGS', 'Going ahead: left, right, left, right. Two great strides to each slash; a hoof comes down as the blow lands.'),
        ('THE SAME, AT HALF SPEED', 'A hoof on the floor stays where it is; the floor goes by as fast as the game carries it.'),
        ('GOING TO ITS LEFT AS IT SLASHES', 'It keeps facing what it fights and steps across.'),
        ('BACKING AWAY AS IT SLASHES', 'It keeps facing what it fights and gives ground.'),
        ('GOING TO ITS RIGHT AS IT SLASHES', 'It keeps facing what it fights and steps across.'),
        ('AND AHEAD AGAIN', 'Then it stands. All fours is only for running with no slash.'),
    ]
    stand(N_STAND - 30, N_STAND, 0)
    for key in ('slashLw0', 'slashRw0', 'slashLw0', 'slashRw0'):
        walked(key, 0)
    stand(0, 30, 0)
    stand(N_STAND - 8, N_STAND, 1, 4)
    walked('slashLw0', 1, 4)
    walked('slashRw0', 1, 4)
    stand(0, 8, 1, 4)
    stand(N_STAND - 20, N_STAND, 2)
    walked('slashLw1', 2)
    walked('slashRw2', 3)
    walked('slashLw3', 4)
    walked('slashRw0', 5)
    stand(0, 60, 5)
else:
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

# (every line of words fits its picture)
_m = ImageDraw.Draw(Image.new('RGB', (8, 8)))
for _t, _l in PARTS:
    assert _m.textlength(_t, font=big) < W - 2 * GAP - 240, _t
    assert _m.textlength(_l, font=line) < W - 2 * GAP, _l
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-framerate', '60', '-i', '-',
                       '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
last = None
card = None
shots = []
for n, shot in enumerate(film):
    if shot != last:
        key, f, g, part, brawler = shot[:5]
        shade = shot[5] if len(shot) > 5 else 1.0
        card = Image.new('RGB', (W, H), BG)
        d = ImageDraw.Draw(card)
        d.text((GAP, TOP // 2), PARTS[part][0], font=big, fill=CYAN, anchor='lm')
        d.text((W - GAP, TOP // 2), 'THE LIVING SHADOW', font=small, fill=GREY, anchor='rm')
        for i, v in enumerate(('front', 'back')):
            x = GAP + i * (PW * S + GAP)
            card.paste(panel(v, key, f, g, brawler, shade), (x, TOP))
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
