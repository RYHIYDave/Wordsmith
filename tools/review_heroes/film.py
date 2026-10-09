#!/usr/bin/env python3
"""A moving picture for the owner from the frames tools/page_gif.mjs saved of src/dev/preview_play.ts:
a heading and a few lines in plain words over it, played at the game's own speed and then slowed.
   python3 tools/review_heroes/film.py <frames dir> <out.gif> <slow> "<heading>" "<line>" ["<line>" ...]"""
import glob, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont
frames_dir, out, slow, heading, *lines = sys.argv[1:]
slow = int(slow)
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, mid, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19), ImageFont.truetype(R, 16)
BG, GOLD, PALE, GREY = (23, 20, 46), (255, 216, 102), (240, 232, 255), (168, 162, 184)
files = sorted(glob.glob(os.path.join(frames_dir, 'f*.png')))
first = Image.open(files[0])
W, H = first.size
def wrap(text, font, width):
    out, line = [], ''
    for word in text.split(' '):
        test = (line + ' ' + word).strip()
        if font.getlength(test) <= width or not line:
            line = test
        else:
            out.append(line); line = word
    if line: out.append(line)
    return out
heading_lines = wrap(heading, big, W - 28)
lines = [l for text in lines for l in wrap(text, mid, W - 28)]
top = 12 + len(heading_lines) * 32 + len(lines) * 25 + 12
def card(path, note):
    im = Image.open(path).convert('RGB')
    # (the page writes its own small heading in its top 30 px: covered by ours)
    c = Image.new('RGB', (W, top + H - 30 + 30), BG)
    d = ImageDraw.Draw(c)
    for j, line in enumerate(heading_lines):
        d.text((14, 10 + j * 32), line, font=big, fill=GOLD)
    for j, line in enumerate(lines):
        d.text((14, 14 + len(heading_lines) * 32 + j * 25), line, font=mid, fill=PALE)
    c.paste(im.crop((0, 30, W, H)), (0, top))
    d.text((14, top + H - 30 + 6), note, font=small, fill=GREY)
    return c
with tempfile.TemporaryDirectory() as tmp:
    k = 0
    for speed in ([1, slow] if slow > 1 else [1]):
        note = 'the game at its own speed' if speed == 1 else f'again, {slow} times slower'
        for f in files:
            c = card(f, note)
            for _ in range(speed):
                c.save(os.path.join(tmp, f'c{k:05d}.png')); k += 1
        for _ in range(20):
            c.save(os.path.join(tmp, f'c{k:05d}.png')); k += 1
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', os.path.join(tmp, 'c%05d.png'), '-vf', 'split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle', '-loop', '0', out], check=True)
print(out, round(os.path.getsize(out) / 1e6, 2), 'MB', k, 'frames')
