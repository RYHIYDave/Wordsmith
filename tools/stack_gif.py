#!/usr/bin/env python3
"""Two moving pictures of the same length, one above the other, each under a caption: a before
   and an after for the owner's phone.
   python3 tools/stack_gif.py <out.gif> <ms per frame> "<title>" <frames folder>;<caption> <frames folder>;<caption>
   (the folders are what tools/turn_gif.mjs and its like leave in shots/gif_frames_*)"""
import os
import sys
import tempfile
import subprocess
from PIL import Image, ImageDraw, ImageFont

out, ms, title = sys.argv[1], sys.argv[2], sys.argv[3]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
big, cap = ImageFont.truetype(B, 30), ImageFont.truetype(B, 24)
parts = []
for spec in sys.argv[4:]:
    folder, text = spec.split(';', 1)
    names = sorted(n for n in os.listdir(folder) if n.endswith('.png'))
    parts.append(([os.path.join(folder, n) for n in names], text))
n = min(len(p[0]) for p in parts)
w, h = Image.open(parts[0][0][0]).size
pad, bar, head = 10, 40, 52 if title else 0
W = w + pad * 2
H = head + len(parts) * (bar + h + pad) + pad
tmp = tempfile.mkdtemp(prefix='stack_gif_')
for i in range(n):
    sheet = Image.new('RGB', (W, H), (14, 11, 20))
    d = ImageDraw.Draw(sheet)
    if title:
        d.text((pad, 10), title, font=big, fill=(255, 224, 112))
    y = head
    for frames, text in parts:
        d.text((pad + 2, y + 6), text, font=cap, fill=(245, 236, 214))
        y += bar
        sheet.paste(Image.open(frames[i]).convert('RGB'), (pad, y))
        y += h + pad
    sheet.save(os.path.join(tmp, f'f{i:03d}.png'))
here = os.path.dirname(os.path.abspath(__file__))
print(subprocess.run(['python3', os.path.join(here, 'hero_gif.py'), tmp, out, ms], capture_output=True, text=True).stdout.strip())
