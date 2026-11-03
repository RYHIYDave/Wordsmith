#!/usr/bin/env python3
"""THE SHAPES OF THE HUSH, THEIR RHYTHM (30 Oct): THE SHEET, for the owner's phone (a mock-up, not in the game): the picture
tools/hush_shapes_pics.ts painted (`spiralsheet <dir>`: sheet_base.png) with what is written on it (sheet.json).
   python3 tools/hush_shapes_spiral_sheet.py <dir> <out.png>"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
im = Image.open(os.path.join(src, 'sheet_base.png')).convert('RGB')
d = ImageDraw.Draw(im)
for l in json.load(open(os.path.join(src, 'sheet.json')))['labels']:
    f = ImageFont.truetype(B if l['size'] >= 24 else R, l['size'])
    x, y = l['x'], l['y']
    # (a dark band behind each, so it reads on the floor)
    w = d.textlength(l['text'], font=f)
    if l['size'] < 24:
        d.rectangle([x - 6, y - 3, x + w + 6, y + l['size'] + 6], fill=(20, 19, 26))
    d.text((x, y), l['text'], font=f, fill=l.get('color', '#ece8f4'))
im.save(out, optimize=True)
print(out, im.size)
