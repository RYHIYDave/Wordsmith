#!/usr/bin/env python3
"""THE SHAPES OF THE HUSH, THE FILM, for the owner's phone (art/hush_shapes*.ts; a mock-up, not in the game): the frames
tools/hush_shapes_pics.ts painted (`film <dir>`), three times as big, every pixel square, each with its caption over it,
at the game's thirty frames a second. (The spiral film of 30 Oct, tools/hush_shapes_pics.ts `spiral`, is made at its size.)
   python3 tools/hush_shapes_film.py <frames dir> <out.mp4>"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
spec = json.load(open(os.path.join(src, 'film.json')))
# (three times as big; or as they are, when the frames are made at their size: the spiral film, `k` 1)
K = spec.get('k', 3)
W, H = spec['w'] * K, spec['h'] * K
TOP = 112
BG, PALE, GREY, PINK = (20, 19, 26), (236, 232, 240), (176, 172, 188), (255, 79, 138)
big, small = ImageFont.truetype(B, 38), ImageFont.truetype(R, 28)
tmp = out + '_frames'
os.makedirs(tmp, exist_ok=True)
for i, card in enumerate(spec['frames']):
    im = Image.open(os.path.join(src, f'f{i:04d}.png')).convert('RGB').resize((W, H), Image.NEAREST)
    frame = Image.new('RGB', (W, H + TOP), BG)
    frame.paste(im, (0, TOP))
    d = ImageDraw.Draw(frame)
    title = card['title']
    head, _, rest = title.partition(' · ')
    d.text((24, 16), head, font=big, fill=PALE)
    if rest:
        d.text((24 + d.textlength(head, font=big) + 18, 26), '· ' + rest, font=small, fill=PINK if 'half speed' in rest else GREY)
    d.text((24, 66), card['note'], font=small, fill=GREY)
    frame.save(os.path.join(tmp, f'c{i:04d}.png'))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', os.path.join(tmp, 'c%04d.png'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], check=True)
for n in os.listdir(tmp):
    os.remove(os.path.join(tmp, n))
os.rmdir(tmp)
print(out, len(spec['frames']), 'frames,', round(len(spec['frames']) / 30, 1), 's,', round(os.path.getsize(out) / 1e6, 2), 'MB')
