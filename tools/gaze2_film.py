# THE SWAMP COLOSSUS'S PHASE 2 GAZE, THE FILM FOR THE OWNER (game/colossus_fight.ts GAZE2_AIMED): the pictures of
# tools/scenarios/colossus_gaze2_film.mjs (each named by the fight's clock, the gaze's beginning in its note), laid at an even 30 a
# second from a second before the gaze to half a second after it, each the picture nearest its time, a line written over the top;
# each clip at the game's pace, then at half speed; the clips one after another into one MP4.
#   python3 tools/gaze2_film.py <out.mp4> <dir>:<line> [<dir>:<line> ...]
import glob
import json
import os
import re
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont

FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def frames(d):
    """The pictures of a clip, by the fight's clock (seconds), and the time the gaze began."""
    note = json.load(open(glob.glob(os.path.join(d, '*gaze.json'))[0]))
    pics = []
    for p in glob.glob(os.path.join(d, '*t_*.png')):
        m = re.search(r't_(\d+)\.png$', p)
        pics.append((int(m.group(1)) / 1000.0, p))
    pics.sort()
    return pics, note['t0']


def lay(d, line, tmp, n0, slow):
    """The clip's frames at an even 30 a second (at half speed: 15 of the game's a second), captioned; numbered from n0."""
    pics, t0 = frames(d)
    step = (1 / 30) * (0.5 if slow else 1)
    t = t0 - 1.0
    n = n0
    font = ImageFont.truetype(FONT, 34)
    while t <= t0 + 3.4 + 0.5:
        best = min(pics, key=lambda q: abs(q[0] - t))[1]
        im = Image.open(best).convert('RGB')
        dr = ImageDraw.Draw(im)
        text = line + ('   (half speed)' if slow else '')
        w = dr.textlength(text, font=font)
        dr.rectangle([0, 0, im.width, 54], fill=(0, 0, 0))
        dr.text(((im.width - w) / 2, 8), text, font=font, fill=(255, 255, 255))
        im.save(os.path.join(tmp, f'f_{n:05d}.png'))
        n += 1
        t += step
    return n


def main():
    out = sys.argv[1]
    clips = [a.split(':', 1) for a in sys.argv[2:]]
    tmp = tempfile.mkdtemp(prefix='gaze2_')
    n = 0
    for slow in (False, True):
        for d, line in clips:
            n = lay(d, line, tmp, n, slow)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', os.path.join(tmp, 'f_%05d.png'), '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', out], check=True)
    print(f'{n} frames ({n / 30:.1f} s) into {out}')


main()
