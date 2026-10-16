#!/usr/bin/env python3
"""RUNEDUST AND THE MELDSTONE DRAWN, as moving pictures for the owner's phone (art/meld_drops.ts, behind
MELD_DROPS, off: not in the game): the frames tools/scenarios/meld_drops_film.mjs took (a phone's screen,
844 x 390 at two picture pixels to a point), cut round what happens, with a line over the top saying what
it is, at the game's own speed (a frame a thirtieth of a second).
   python3 tools/meld_drops_films.py <frames prefix dir> <out dir>
Makes <out>/fall.mp4, take.mp4, give.mp4 (and a sheet of every sixth frame beside each, to look over)."""
import glob
import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG = (23, 20, 46)
PALE, GREY, CY = (240, 232, 255), (168, 162, 184), (120, 236, 248)
# (each film: its frames, the box cut out of them (full-size pixels: centre x, y; half width), and what it says, by frame)
FILMS = {
    'fall': {'pre': 'fall_fall', 'first': 54, 'last': 179, 'centre': (1000, 300), 'half': 300,
             'title': 'As it drops',
             'lines': [(0, 'The Fleshmancer is dragged under. His pit grinds shut...'),
                       (25, 'The Meldstone bursts up out of it, spinning, torn apart.'),
                       (48, 'Its halves SLAM together. Runedust rains down.'),
                       (75, 'It hangs over the floor, its seam crackling, glittering dust below.')]},
    'take': {'pre': 'fall_take', 'first': 0, 'last': 74, 'centre': (900, 320), 'half': 270,
             'title': 'Taken up',
             'lines': [(0, 'Walk up, and they come to you.'),
                       (6, 'The runedust whirls up round you and pours in.'),
                       (10, 'The Meldstone leaps over your head and wrenches apart...'),
                       (22, '...SLAMS together, and dives into you.'),
                       (40, 'While you carry it, it shows by INVENTORY.')]},
    'give': {'pre': 'give_give', 'first': 0, 'last': 119, 'centre': (730, 330), 'half': 300,
             'title': 'Given to the wordsmith',
             'lines': [(0, 'Given by using him: it rises out of you, over his slab.'),
                       (44, 'It splits. Its halves whirl round each other, faster and faster...'),
                       (68, '...and SLAM together in a great burst.'),
                       (88, 'From then on it circles the column of light: he can meld.')]},
}
SCALE = 1.5
CAP = 64


def font(path, size):
    return ImageFont.truetype(path, size)


for name, f in FILMS.items():
    cx, cy = f['centre']
    h = f['half']
    box = (cx - h, cy - int(h * 0.62), cx + h, cy + int(h * 0.62))
    W = int((box[2] - box[0]) * SCALE)
    H = int((box[3] - box[1]) * SCALE)
    tmp = os.path.join(out, f'_{name}')
    os.makedirs(tmp, exist_ok=True)
    for old in glob.glob(os.path.join(tmp, '*.png')):
        os.remove(old)
    frames = []
    for k, n in enumerate(range(f['first'], f['last'] + 1)):
        p = os.path.join(src, f"{f['pre']}_f{n:03d}.png")
        if not os.path.exists(p):
            break
        im = Image.open(p).convert('RGB').crop(box).resize((W, H), Image.NEAREST)
        frame = Image.new('RGB', (W, H + CAP), BG)
        frame.paste(im, (0, CAP))
        d = ImageDraw.Draw(frame)
        d.text((14, 8), f['title'].upper(), font=font(B, 22), fill=CY)
        line = ''
        for at, text in f['lines']:
            if k >= at:
                line = text
        d.text((14, 36), line, font=font(R, 18), fill=PALE)
        frame.save(os.path.join(tmp, f'{k:04d}.png'))
        frames.append(frame)
    # hold the last frame a moment, so it does not loop back too soon
    for j in range(20):
        frames[-1].save(os.path.join(tmp, f'{len(frames) + j:04d}.png'))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', os.path.join(tmp, '%04d.png'),
                    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24',
                    '-preset', 'slow', '-movflags', '+faststart', os.path.join(out, f'{name}.mp4')], check=True)
    # a sheet of every sixth frame, to look over
    pick = frames[::6]
    cols = 4
    tw, th = W // 2, (H + CAP) // 2
    sheet = Image.new('RGB', (cols * tw, ((len(pick) + cols - 1) // cols) * th), BG)
    for i, fr in enumerate(pick):
        sheet.paste(fr.resize((tw, th)), ((i % cols) * tw, (i // cols) * th))
    sheet.save(os.path.join(out, f'{name}_sheet.png'))
    print(name, len(frames), 'frames', os.path.getsize(os.path.join(out, f'{name}.mp4')) // 1024, 'KB')
