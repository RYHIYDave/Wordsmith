# A picture for the owner's phone: whole screenshots stacked in one column, each under a numbered
# caption. Used for walking through a sequence (the tutorial, a word being found).
#   python3 tools/sheet_steps.py <out.png> "<title>" "<subtitle|second line>" <image>;<caption> ...
# An image path ending in "@rot" is turned a quarter turn first (a phone page that was upright).
import sys
from PIL import Image, ImageDraw, ImageFont

out, title, sub = sys.argv[1], sys.argv[2], sys.argv[3]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, mid, cap = ImageFont.truetype(B, 46), ImageFont.truetype(R, 27), ImageFont.truetype(B, 28)
W = 1266
pad, gap, bar = 18, 14, 50

cells = []
for i, spec in enumerate(sys.argv[4:]):
    path, text = spec.split(';', 1)
    rot = path.endswith('@rot')
    if rot:
        path = path[:-4]
    im = Image.open(path).convert('RGB')
    if rot:
        im = im.rotate(90, expand=True)
    h = round(im.height * W / im.width)
    cells.append((im.resize((W, h), Image.NEAREST), f'{i + 1}. {text}'))

probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
def wrap(text, font, width):
    lines, line = [], ''
    for w in text.split(' '):
        t = (line + ' ' + w).strip()
        if probe.textlength(t, font=font) > width and line:
            lines.append(line)
            line = w
        else:
            line = t
    lines.append(line)
    return lines

subs = []
for part in sub.split('|'):
    subs += wrap(part, mid, W)
head = 22 + 58 + len(subs) * 36 + 14
caps = [wrap(t, cap, W - 20) for _, t in cells]
total = head + sum(len(c) * 36 + 16 + im.height + gap for (im, _), c in zip(cells, caps)) + pad
sheet = Image.new('RGB', (W + pad * 2, total), (14, 11, 20))
d = ImageDraw.Draw(sheet)
d.text((pad, 20), title, font=big, fill=(255, 224, 112))
for i, ln in enumerate(subs):
    d.text((pad, 82 + 36 * i), ln, font=mid, fill=(210, 202, 190))
y = head
for (im, _), lines in zip(cells, caps):
    for i, ln in enumerate(lines):
        d.text((pad + 4, y + 4 + 36 * i), ln, font=cap, fill=(245, 236, 214))
    y += len(lines) * 36 + 16
    sheet.paste(im, (pad, y))
    y += im.height + gap
sheet.save(out)
print(out, sheet.size)
