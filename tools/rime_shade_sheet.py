#!/usr/bin/env python3
"""THE RIME SHADE, THE SHEET, for the owner's phone (art/rime_shade*.ts; a mock-up, not in the game): the pieces
tools/rime_shade_pics.ts painted (`sheet <dir>`), one under another, 1200 wide, each with its caption over it.
   python3 tools/rime_shade_sheet.py <pieces dir> <out.png>"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
spec = json.load(open(os.path.join(src, 'sheet.json')))
W = 1200
BG, PALE, GREY = (20, 19, 26), (236, 232, 240), (176, 172, 188)
big, small, tag = ImageFont.truetype(B, 30), ImageFont.truetype(R, 22), ImageFont.truetype(B, 20)

def wrap(d, text, font, width):
    words, lines, line = text.split(), [], ''
    for w in words:
        t = (line + ' ' + w).strip()
        if d.textlength(t, font=font) > width and line:
            lines.append(line)
            line = w
        else:
            line = t
    if line:
        lines.append(line)
    return lines

parts = []
probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
for p in spec['pieces']:
    im = Image.open(os.path.join(src, p['file'])).convert('RGB')
    if im.size[0] != W:
        im = im.resize((W, round(im.size[1] * W / im.size[0])), Image.NEAREST)
    note = wrap(probe, p['note'], small, W - 48)
    head = 24 + 38 + 28 * len(note) + 14
    card = Image.new('RGB', (W, head + im.size[1]), BG)
    d = ImageDraw.Draw(card)
    d.text((24, 18), p['title'], font=big, fill=PALE)
    for i, line in enumerate(note):
        d.text((24, 60 + 28 * i), line, font=small, fill=GREY)
    card.paste(im, (0, head))
    for lb in p.get('labels', []):
        x, y = lb['x'], head + lb['y']
        tw = d.textlength(lb['text'], font=tag)
        d.rectangle([x - 4, y - 2, x + tw + 6, y + 26], fill=(14, 13, 18))
        d.text((x + 1, y), lb['text'], font=tag, fill=PALE)
    parts.append(card)
H = sum(c.size[1] for c in parts)
sheet = Image.new('RGB', (W, H), BG)
y = 0
for c in parts:
    sheet.paste(c, (0, y))
    y += c.size[1]
sheet.save(out, optimize=True)
print(out, sheet.size, round(os.path.getsize(out) / 1e6, 2), 'MB')
