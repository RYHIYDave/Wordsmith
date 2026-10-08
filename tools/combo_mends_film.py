#!/usr/bin/env python3
"""STRIKE'S COMBO, TODAY'S BESIDE MENDED (art/moves3.ts, COMBO_MENDS: a mock-up behind a switch that is
off), as one moving picture for the owner's phone: the frames tools/scenarios/combo_mends.mjs took in
the practice room (a phone's screen, the game at five screen pixels to a game pixel), cut round the
knight, today's on the left and the mended on the right, at the game's own speed and then again at a
third of it.
   python3 tools/combo_mends_film.py <today's frames prefix> <mended frames prefix> <out.gif>
(the prefixes are the playtest's --out: <prefix>_fNNN.png)"""
import glob
import os
import subprocess
import sys
import tempfile
from PIL import Image, ImageDraw, ImageFont

a_prefix, b_prefix, out = sys.argv[1:4]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
K = 5
BOX = (220, 66, 84, 84)  # x, y, w, h in game pixels round the knight
PW = 300
BG, GOLD, PALE, GREY = (23, 20, 46), (255, 216, 102), (240, 232, 255), (168, 162, 184)
big, mid, cap, small = ImageFont.truetype(B, 24), ImageFont.truetype(R, 16), ImageFont.truetype(B, 18), ImageFont.truetype(R, 14)
LINES = ['His feet: they lift for his step and land, instead of sliding.', 'No arm through his head; his hips turn first; no jerk.', 'The streak only through the cut: the blade stays a blade.']

a_frames = sorted(glob.glob(a_prefix + '_f*.png'))
b_frames = sorted(glob.glob(b_prefix + '_f*.png'))
n = min(len(a_frames), len(b_frames), 60)
x, y, w, h = BOX
PH = round(h * PW / w)
top = 12 + 30 + len(LINES) * 21 + 34


def panel(path):
    return Image.open(path).convert('RGB').crop((x * K, y * K, (x + w) * K, (y + h) * K)).resize((PW, PH), Image.LANCZOS)


def card(i, speed):
    c = Image.new('RGB', (PW * 2 + 6, top + PH + 24), BG)
    d = ImageDraw.Draw(c)
    d.text((12, 8), "STRIKE'S COMBO, MENDED", font=big, fill=GOLD)
    d.text((PW * 2 - 6, 15), 'a mock-up: not in the game', font=small, fill=GREY, anchor='ra')
    for j, line in enumerate(LINES):
        d.text((12, 42 + j * 21), line, font=mid, fill=PALE)
    d.text((12, top - 26), 'TODAY', font=cap, fill=GREY)
    d.text((PW + 18, top - 26), 'MENDED', font=cap, fill=GOLD)
    c.paste(panel(a_frames[i]), (0, top))
    c.paste(panel(b_frames[i]), (PW + 6, top))
    d.text((12, top + PH + 4), 'the game at its own speed, on a phone' if speed == 1 else 'again, at a third of the speed', font=small, fill=GREY)
    return c


with tempfile.TemporaryDirectory() as tmp:
    k = 0
    for speed in (1, 3):
        for i in range(n):
            c = card(i, speed)
            for _ in range(speed):
                c.save(os.path.join(tmp, f'c{k:04d}.png'))
                k += 1
        for _ in range(15):
            c.save(os.path.join(tmp, f'c{k:04d}.png'))
            k += 1
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', os.path.join(tmp, 'c%04d.png'), '-vf', 'split[a][b];[a]palettegen=max_colors=192:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle', '-loop', '0', out], check=True)
print(out, round(os.path.getsize(out) / 1e6, 2), 'MB', k, 'frames')
