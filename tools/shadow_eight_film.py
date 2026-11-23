#!/usr/bin/env python3
"""THE LIVING SHADOW FROM ALL EIGHT SIDES, AS THE GAME HOLDS IT (art/sides_more.ts EIGHT_MORE.demon; the queue's
draw-the-demon-from-eight-sides, 22 Nov 2026; docs/mockups/demon_eight/README.md; a mock-up, not in the game). Eight panels, one
a side, all playing the same list of the game's at once, every move it has: its stand; dropping down, running and rearing up;
its two slashes; the two made walking; Damning; the smoke step; struck hard and from behind; burning out. Five sides truly
turned, the three facing left their mirrors (his word, 22 Nov 2026, 09:01), each so labelled; its burning out truly turned on
all eight (the man in it). On a plain floor of the game's tiles, which goes by under each the way that one goes. Two film pixels
a picture pixel; sixty film frames a second, each list at its own speed. MP4 (his word: GIFs do not play on his phone).
   tsx tools/shadow_eight_pics.ts <dir> front,toward,side,frontL      (and back,away,sideL,backL: two at once)
   python3 tools/shadow_eight_film.py <dir> <out.mp4> [sheet.png]"""
import json, math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
sheet_out = sys.argv[3] if len(sys.argv) > 3 else None
# (the eight, in the game's words for them: how far each is turned to its left; which way on the screen it faces)
SIDES = [
    ('front', 0, 'down and right'), ('toward', -45, 'down, toward you'), ('frontL', -90, 'down and left'), ('sideL', -135, 'left'),
    ('backL', 180, 'up and left'), ('away', 135, 'up, away from you'), ('back', 90, 'up and right'), ('side', 45, 'right'),
]
WORDS = {name: words for name, _, words in SIDES}
NOTE = {name: json.load(open(os.path.join(src, f'{name}.json'))) for name, _, _ in SIDES}
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG, PALE, CYAN, GREY = (20, 18, 40), (226, 222, 244), (64, 232, 240), (150, 146, 172)
S = 2
# (each panel: the box round its floor point, in picture pixels (two to the game's pixel), as big as eight panels can be on his
# phone's screen held sideways, 2556 x 1178)
PW, PH = 312, 256
FX, FY = 156, 208
GAP, TOP, FOOT, CAP = 12, 60, 30, 26
W = PW * S * 4 + GAP * 5
H = TOP + (PH * S + CAP) * 2 + GAP + FOOT
W += W % 2
H += H % 2
big, line, small = ImageFont.truetype(B, 28), ImageFont.truetype(R, 20), ImageFont.truetype(B, 19)
TILE = 32.0 / (2.0 / 3.0) ** 0.5
CARRY = NOTE['front']['carry']

_frames = {}
def frame(side, lst, f):
    k = (side, lst, f)
    if k not in _frames:
        if len(_frames) > 3000:
            _frames.clear()
        w, h, ax, ay, kk = NOTE[side]['lists'][lst]['boxes'][f]
        im = Image.open(os.path.join(src, side, f'{lst}_{f:03d}.png')).convert('RGBA')
        panel = Image.new('RGBA', (PW, PH), (0, 0, 0, 0))
        x0, y0 = round(FX - ax * kk), round(FY - ay * kk)
        # (laid at its anchor; whatever falls outside the panel cut at its edge)
        sx0, sy0 = max(0, -x0), max(0, -y0)
        dx0, dy0 = max(0, x0), max(0, y0)
        cw, ch = min(im.width - sx0, PW - dx0), min(im.height - sy0, PH - dy0)
        if cw > 0 and ch > 0:
            panel.alpha_composite(im.crop((sx0, sy0, sx0 + cw, sy0 + ch)), (dx0, dy0))
        _frames[k] = panel
    return _frames[k]

# ---- the floor: the game's tiles, plain, as the game's camera sees them; gone by under it as it is carried, the way it faces
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
    hsh = np.sin(ia * 12.9898 + ib * 78.233) * 43758.5453
    odd = (hsh - np.floor(hsh)) > 0.82
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
    vx, vy = 32 * fx + 32 * fl, 16 * fx - 16 * fl
    n = math.hypot(vx, vy)
    vx, vy = vx / n, vy / n
    tip = (cx + vx * size, cy + vy * size)
    tail = (cx - vx * size, cy - vy * size)
    d.line([tail, tip], fill=CYAN, width=3)
    px, py = -vy, vx
    d.polygon([tip, (tip[0] - vx * 8 + px * 6, tip[1] - vy * 8 + py * 6), (tip[0] - vx * 8 - px * 6, tip[1] - vy * 8 - py * 6)], fill=CYAN)

# ---- what is shown, film frame by film frame: (list, its picture, how far it has been carried, the part's number)
PARTS = [
    ('THE LIVING SHADOW FROM ALL EIGHT SIDES', 'Five truly turned. The three facing left are mirrors of the three facing right, as you said.'),
    ('DOWN ON ALL FOURS TO RUN, UP ON TWO LEGS TO STOP', 'The floor goes by under each the way that one runs.'),
    ('ITS TWO SLASHES', 'Left claw, then right, with their streaks.'),
    ('ITS TWO SLASHES MADE WALKING', 'Striding ahead as it swings.'),
    ('DAMNING', 'The floor torn under its claws.'),
    ('THE SMOKE STEP', 'Gone into smoke, and out of it.'),
    ('STRUCK HARD, THEN STRUCK FROM BEHIND', ''),
    ('BURNING OUT', 'Never a mirror: the man getting up in it keeps his demon arm on its own side, from all eight.'),
]
L = NOTE['front']['lists']
film = []
gone = 0.0
def play(lst, part, a=0, b=None, carry=None, slow=1):
    """A list at its own speed (sixty film frames a second), from picture `a` to `b`; `carry`, how far it goes by each picture."""
    global gone
    n, fps = L[lst]['n'], L[lst]['fps']
    b = n if b is None else b
    along = L[lst].get('along')
    base = gone
    m = round((b - a) * 60 * slow / fps)
    for i in range(m):
        f = min(b - 1, a + int(i * fps / (60 * slow)))
        g = base + along[f] if along else gone
        film.append((lst, f, g, part))
        if carry is not None and not along:
            gone += carry / slow
    if along:
        gone = base + along[b - 1]

play('idle', 0)
# (dropping down into the run, the run to the eighth of its round it rears up from, rearing up)
RUN = L['walk']['n']
play('start', 1, carry=CARRY / 60)
f0 = round(NOTE['front']['startAt'] * RUN)
for f in range(f0, round(5 / 8 * RUN) + RUN):
    film.append(('walk', f % RUN, gone, 1))
    gone += CARRY / 60
play('stop5', 1)
play('idle', 1, 0, 24)
play('attack', 2)
play('attack2', 2)
play('idle', 2, 0, 24)
play('attackWalk0', 3)
play('attack2Walk0', 3)
play('idle', 3, 0, 24)
play('heavy', 4)
play('idle', 4, 0, 24)
play('leap', 5)
play('land', 5)
play('idle', 5, 0, 18)
play('reel', 6)
play('idle', 6, 0, 12)
play('lurch', 6)
play('idle', 6, 0, 18)
play('change', 7)
film.extend([film[-1]] * 45)

def canvas_for(lst, f, g, part):
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
        p.alpha_composite(frame(name, lst, f))
        im.paste(p.convert('RGB').resize((PW * S, PH * S), Image.NEAREST), (x, y))
        arrow(d, x + 18, y + PH * S + CAP // 2, turn, 11)
        of = NOTE[name]['mirrorOf']
        label = f'facing {words}' + (f'   (mirror of {WORDS[of]})' if of and lst != 'change' else '')
        d.text((x + 36, y + PH * S + 2), label, font=small, fill=GREY if of and lst != 'change' else PALE)
    d.text((GAP + 4, H - FOOT + 4), 'A mock-up: not in the game yet. Two film pixels for each pixel of its picture.', font=line, fill=GREY)
    return im

if sheet_out:
    # (a picture of it every half second, for whoever checks it)
    picks = list(range(0, len(film), 30))
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
print(f'{out}: {W} x {H}, {len(film)} frames, {len(film) / 60:.1f} s, {os.path.getsize(out) / 1e6:.1f} MB')
