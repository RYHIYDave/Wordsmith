#!/usr/bin/env python3
"""THE CHANGE INTO THE LIVING SHADOW, as a moving picture for the owner's phone held sideways (the queue's
finish-mage-and-warlock-eight-sides, 12 Nov 2026; dev/shadow_change.ts; docs/mockups/warlock_up2/README.md; a mock-up, not in
the game). At his phone's own size (2556 x 1178): the change from in front and from behind side by side, four film pixels a
picture pixel, at its own speed and at half speed; then from all eight sides at once, two film pixels a picture pixel. Sixty
film frames a second, each picture twice (thirty a second, as the game shows it). MP4, not a GIF.
   npx tsx tools/shadow_moves_pics.ts <dir>/t0 change front,back 0      and for each of the other seven turns
   npx tsx tools/shadow_moves_pics.ts <dir>/t<turn> change front <turn>  (-45,-90,-135,180,135,90,45)
   python3 tools/shadow_change_film.py <dir> <out.mp4> [sheet.png]"""
import json, math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
sheet_out = sys.argv[3] if len(sys.argv) > 3 else None
SIDES = [
    (0, 'down and right'), (-45, 'down, toward you'), (-90, 'down and left'), (-135, 'left'),
    (180, 'up and left'), (135, 'up, away from you'), (90, 'up and right'), (45, 'right'),
]
note = json.load(open(os.path.join(src, 't0', 'moves.json')))
SC = note['canvas']
CH = note['moves']['change']
N = CH['frames']
MORPH, ROARF = round(CH['morphAt'] * 30), round(CH['roarAt'] * 30)
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG, PALE, CYAN, GREY = (20, 18, 40), (226, 222, 244), (64, 232, 240), (150, 146, 172)
W, H = 2556, 1178
BOX = (SC['ax'] - 156, SC['ay'] - 208, SC['ax'] + 156, SC['ay'] + 48)
PW, PH = BOX[2] - BOX[0], BOX[3] - BOX[1]
FX, FY = SC['ax'] - BOX[0], SC['ay'] - BOX[1]
big, line, small = ImageFont.truetype(B, 28), ImageFont.truetype(R, 20), ImageFont.truetype(B, 19)

_frames = {}
def frame(turn, view, f):
    k = (turn, view, f)
    if k not in _frames:
        _frames[k] = Image.open(os.path.join(src, f't{turn}', f'change_{view}_f{f:03d}.png')).convert('RGBA').crop(BOX)
    return _frames[k]

yy, xx = np.mgrid[0:PH, 0:PW].astype(np.float64)
sx, sy = xx - FX, yy - FY
FWD = {'front': (sx / 32 + sy / 16) / 2, 'back': (sx / 32 - sy / 16) / 2}
LEFT = {'front': (sx / 32 - sy / 16) / 2, 'back': (-sx / 32 - sy / 16) / 2}
_floors = {}
def floor(view):
    if view in _floors:
        return _floors[view]
    a, b = FWD[view], LEFT[view]
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
    _floors[view] = im
    return im

def arrow(d, cx, cy, turn, size=11):
    th = math.radians(turn)
    fx, fl = math.cos(th), math.sin(th)
    vx, vy = 32 * fx + 32 * fl, 16 * fx - 16 * fl
    n = math.hypot(vx, vy)
    vx, vy = vx / n, vy / n
    tip = (cx + vx * size, cy + vy * size)
    d.line([(cx - vx * size, cy - vy * size), tip], fill=CYAN, width=3)
    px, py = -vy, vx
    d.polygon([tip, (tip[0] - vx * 8 + px * 6, tip[1] - vy * 8 + py * 6), (tip[0] - vx * 8 - px * 6, tip[1] - vy * 8 - py * 6)], fill=CYAN)

def stage(f):
    """What is happening at this picture of it, in a few words."""
    if f < MORPH:
        return 'Tapped: he jolts and the pain doubles him over (the game\'s own).'
    if f < ROARF:
        return 'He becomes it: its black spreads from his demon arm; claws, body, horns, head, embers, tail, then wings.'
    return 'It roars: the roar you said yes to.'

PARTS = [
    'THE CHANGE INTO THE LIVING SHADOW',
    'THE SAME, AT HALF SPEED',
    'THE CHANGE FROM ALL EIGHT SIDES',
]
TOP, FOOT = 60, 30

def two_up(f, part):
    im = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((16, 4), PARTS[part], font=big, fill=PALE)
    d.text((16, 36), stage(f), font=line, fill=GREY)
    S = 4
    gap = (W - 2 * PW * S) // 3
    for i, (view, words) in enumerate((('front', 'from in front'), ('back', 'from behind'))):
        x = gap + i * (PW * S + gap)
        p = floor(view).copy()
        p.alpha_composite(frame(0, view, f))
        im.paste(p.convert('RGB').resize((PW * S, PH * S), Image.NEAREST), (x, TOP))
        d.text((x + 8, TOP + PH * S + 4), words, font=small, fill=PALE)
    d.text((16, H - FOOT + 4), 'A mock-up: not in the game yet. Four film pixels for each pixel of its picture.', font=line, fill=GREY)
    return im

def eight_up(f, part):
    im = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((16, 4), PARTS[part], font=big, fill=PALE)
    d.text((16, 36), stage(f), font=line, fill=GREY)
    S, GAP, CAP = 2, 12, 26
    for i, (turn, words) in enumerate(SIDES):
        col, row = i % 4, i // 4
        x = GAP + col * (PW * S + GAP)
        y = TOP + row * (PH * S + CAP + GAP)
        p = floor('front').copy()
        p.alpha_composite(frame(turn, 'front', f))
        im.paste(p.convert('RGB').resize((PW * S, PH * S), Image.NEAREST), (x, y))
        arrow(d, x + 18, y + PH * S + CAP // 2, turn)
        d.text((x + 36, y + PH * S + 2), f'facing {words}', font=small, fill=PALE)
    d.text((16, H - FOOT + 4), 'A mock-up: not in the game yet. Two film pixels for each pixel of its picture.', font=line, fill=GREY)
    return im

film = []
# 1. him standing a moment, the change, its roar, and a moment after
film += [(two_up, 0, 0)] * 30
for f in range(N):
    film += [(two_up, f, 0)] * 2
film += [(two_up, N - 1, 0)] * 30
# 2. the same at half speed
for f in range(N):
    film += [(two_up, f, 1)] * 4
film += [(two_up, N - 1, 1)] * 30
# 3. from all eight sides
film += [(eight_up, 0, 2)] * 30
for f in range(N):
    film += [(eight_up, f, 2)] * 2
film += [(eight_up, N - 1, 2)] * 40

if sheet_out:
    picks = [(two_up, f, 0) for f in range(0, N, 6)]
    tw, th_ = W // 2, H // 2
    cols = 3
    sheet = Image.new('RGB', (tw * cols, th_ * math.ceil(len(picks) / cols)), BG)
    for j, (fn, f, part) in enumerate(picks):
        sheet.paste(fn(f, part).resize((tw, th_), Image.LANCZOS), ((j % cols) * tw, (j // cols) * th_))
    sheet.save(sheet_out)
    print(f'sheet: {sheet_out} ({sheet.size[0]} x {sheet.size[1]}, {len(picks)} pictures)')

cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '60', '-i', '-',
       '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]
pipe = subprocess.Popen(cmd, stdin=subprocess.PIPE)
last = None
for fn, f, part in film:
    key = (fn.__name__, f, part)
    if key != last:
        buf = fn(f, part).tobytes()
        last = key
    pipe.stdin.write(buf)
pipe.stdin.close()
pipe.wait()
print(f'{out}: {W} x {H}, {len(film)} frames, {len(film) / 60:.1f} s, {os.path.getsize(out) / 1e6:.1f} MB')
