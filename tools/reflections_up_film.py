# THE FILM OF FLOOR 18'S REFLECTIONS OF THE HEROES AS THEY LOOK NOW, from the frames `tools/reflections_up_pics.ts <dir> film` made:
#   python3 tools/reflections_up_film.py <frames dir> <out.mp4>
# For each hero: you and your reflection side by side; it stepping out of a mirror; turning round (every side it has); running;
# its tap; its hold; struck, it shatters. Four and five times as big, captioned, 1080 x 1080, 30 a second (an MP4: his phone's).
import json
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
idx = json.load(open(f'{src}/index.json'))
W = H = 1080
S = 3
BG = (24, 18, 38)
FLOOR = (36, 28, 56)
INK = (235, 228, 250)
DIM = (170, 160, 200)
CYAN = (120, 230, 240)
PINK = (255, 120, 170)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
big = ImageFont.truetype(FONT, 46)
mid = ImageFont.truetype(FONT, 32)
NAME = {'warrior': 'THE WARRIOR', 'ranger': 'THE RANGER', 'mage': 'THE MAGE', 'warlock': 'THE WARLOCK', 'tinkerer': 'THE TINKERER', 'brawler': 'THE BRAWLER'}
TAP = {'warrior': 'Strike', 'ranger': 'the Shot', 'mage': 'the Wave', 'warlock': 'the hellfire bolt', 'tinkerer': 'the vial toss', 'brawler': 'the jab'}
HOLD = {'warrior': 'the Slam', 'ranger': 'the Volley', 'mage': 'the Orb', 'warlock': 'the Curse', 'tinkerer': 'her whistle', 'brawler': 'the roundhouse kick'}
FEET_Y = 860
cache = {}


def img(key):
    if key not in cache:
        e = idx[key]
        cache[key] = (Image.open(f"{src}/{e['file']}").convert('RGBA'), e['ax'], e['ay'])
    return cache[key]


def seq(prefix):
    out_ = []
    i = 0
    while f'{prefix}_{i}' in idx:
        out_.append(f'{prefix}_{i}')
        i += 1
    return out_


def base(title, sub, sub_colour=DIM):
    f = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(f)
    d.rectangle((0, FEET_Y - 40, W, H), fill=FLOOR)
    d.text((40, 36), title, font=big, fill=INK)
    d.text((40, 100), sub, font=mid, fill=sub_colour)
    return f


def put(f, key, x, y=FEET_Y, scale=S, under=None):
    """Lays frame `key` with its feet at (x, y), `scale` times as big (`under` laid first: the mirror)."""
    im, ax, ay = img(key)
    if under:
        u, _, _ = img(under)
        b = Image.new('RGBA', u.size, (0, 0, 0, 0))
        b.alpha_composite(u)
        b.alpha_composite(im)
        im = b
    im = im.resize((im.width * scale, im.height * scale), Image.NEAREST)
    f.paste(im, (int(x - ax * scale), int(y - ay * scale)), im)


p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)


class Out:
    """Each frame straight to the film (a thousand of them held would not fit)."""
    n = 0

    def append(self, f):
        p.stdin.write(f.tobytes())
        self.n += 1


frames = Out()
for cls in ['warrior', 'ranger', 'mage', 'warlock', 'tinkerer', 'brawler']:
    name = NAME[cls]
    stand = seq(f'{cls}_film_stand')
    # you and your reflection
    for i in range(36):
        f = base(name, 'You, and your reflection')
        put(f, f'{cls}_film_you', 290, scale=4)
        put(f, stand[i % len(stand)], 770, scale=4)
        d = ImageDraw.Draw(f)
        d.text((240, FEET_Y + 50), 'YOU', font=mid, fill=CYAN)
        d.text((660, FEET_Y + 50), 'REFLECTION', font=mid, fill=PINK)
        frames.append(f)
    # stepping out of a mirror (the mirror a stand-in: the gallery's own are the floor's)
    step = seq(f'{cls}_film_step')
    for k in step + [step[-1]] * 12:
        f = base(name, 'It steps out of a mirror')
        put(f, k, 700, scale=4, under='mirror')
        frames.append(f)
    # turning round
    turn = seq(f'{cls}_film_turn')
    per = 8 if len(turn) > 2 else 18
    for k in turn:
        for _ in range(per):
            f = base(name, 'From every side' if len(turn) > 2 else 'From in front, and from behind')
            put(f, k, 540, scale=5)
            frames.append(f)
    for label, prefix in (('Running', 'run'), (f'Tap: {TAP[cls]}', 'tap'), (f'Hold: {HOLD[cls]}', 'hold')):
        ks = seq(f'{cls}_film_{prefix}')
        for k in ks + [ks[-1]] * 6:
            f = base(name, label)
            put(f, k, 500, scale=5)
            frames.append(f)
    sh = seq(f'{cls}_film_shatter')
    for k in sh + [sh[-1]] * 10:
        f = base(name, 'Struck down, it shatters')
        put(f, k, 540, scale=4)
        frames.append(f)
    print(cls, frames.n)
    cache.clear()

p.stdin.close()
p.wait()
print(out, frames.n, 'frames', round(frames.n / 30, 1), 's')
