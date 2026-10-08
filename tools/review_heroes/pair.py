#!/usr/bin/env python3
"""Today's beside the mended, for the owner: two sets of frames that tools/page_gif.mjs saved of
src/dev/preview_play.ts (the same scenarios, the switch off and on), side by side under a heading
and a few plain lines, at the game's speed and then slowed.
   python3 tools/review_heroes/pair.py <today frames dir> <mended frames dir> <out.gif> <slow> "<heading>" "<line>" ...
"""
import glob, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont
a_dir, b_dir, out, slow, heading, *lines = sys.argv[1:]
slow = int(slow)
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, mid, cap, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19), ImageFont.truetype(B, 20), ImageFont.truetype(R, 16)
BG, GOLD, PALE, GREY = (23, 20, 46), (255, 216, 102), (240, 232, 255), (168, 162, 184)
A = sorted(glob.glob(os.path.join(a_dir, 'f*.png')))
Bf = sorted(glob.glob(os.path.join(b_dir, 'f*.png')))
n = min(len(A), len(Bf))
w0, h0 = Image.open(A[0]).size
W = w0 * 2 + 6
def wrap(text, font, width):
    out, line = [], ''
    for word in text.split(' '):
        t = (line + ' ' + word).strip()
        if font.getlength(t) <= width or not line: line = t
        else: out.append(line); line = word
    if line: out.append(line)
    return out
hl = wrap(heading, big, W - 28)
ll = [l for t in lines for l in wrap(t, mid, W - 28)]
top = 12 + len(hl) * 32 + len(ll) * 25 + 14 + 28
def card(i, note):
    c = Image.new('RGB', (W, top + h0 - 30 + 30), BG)
    d = ImageDraw.Draw(c)
    for j, l in enumerate(hl): d.text((14, 10 + j * 32), l, font=big, fill=GOLD)
    for j, l in enumerate(ll): d.text((14, 14 + len(hl) * 32 + j * 25), l, font=mid, fill=PALE)
    d.text((14, top - 26), 'TODAY', font=cap, fill=GREY)
    d.text((w0 + 20, top - 26), 'MENDED', font=cap, fill=GOLD)
    c.paste(Image.open(A[i]).convert('RGB').crop((0, 30, w0, h0)), (0, top))
    c.paste(Image.open(Bf[i]).convert('RGB').crop((0, 30, w0, h0)), (w0 + 6, top))
    d.text((14, top + h0 - 30 + 6), note, font=small, fill=GREY)
    return c
with tempfile.TemporaryDirectory() as tmp:
    k = 0
    for speed in ([1, slow] if slow > 1 else [1]):
        note = 'the game at its own speed' if speed == 1 else f'again, {slow} times slower'
        for i in range(n):
            c = card(i, note)
            for _ in range(speed):
                c.save(os.path.join(tmp, f'c{k:05d}.png')); k += 1
        for _ in range(20):
            c.save(os.path.join(tmp, f'c{k:05d}.png')); k += 1
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', os.path.join(tmp, 'c%05d.png'), '-vf', 'split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle', '-loop', '0', out], check=True)
print(out, round(os.path.getsize(out) / 1e6, 2), 'MB', k, 'frames')
