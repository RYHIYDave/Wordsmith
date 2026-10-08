# A picture for the owner's phone: pairs of whole screenshots, BEFORE over AFTER, each pair under
# its caption. Used to show a change of look (the dungeon's overhaul, Version 17).
#   python3 tools/sheet_pairs.py <out.png> "<title>" "<subtitle|second line>" "<before.png>;<after.png>;<caption>" ...
# A pair may give a crop after its caption: ";x0,y0,x1,y1" (in the screenshots' own pixels), and
# then a scale ";3" (each pixel of the crop that many pixels of the picture).
import sys
from PIL import Image, ImageDraw, ImageFont

out, title, sub = sys.argv[1], sys.argv[2], sys.argv[3]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, mid, cap, tag = ImageFont.truetype(B, 46), ImageFont.truetype(R, 27), ImageFont.truetype(B, 30), ImageFont.truetype(B, 24)
W = 1266
pad, gap = 18, 14
BG, GOLD, PALE, DIM = (23, 20, 46), (255, 216, 102), (240, 232, 255), (156, 150, 220)

def fit(path, crop, scale):
    im = Image.open(path).convert('RGB')
    if crop:
        im = im.crop(crop)
        if scale:
            im = im.resize((im.width * scale, im.height * scale), Image.NEAREST)
    h = round(im.height * W / im.width)
    return im.resize((W, h), Image.NEAREST if im.width <= W else Image.LANCZOS)

probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
def wrap(text, font, width):
    lines, line = [], ''
    for w in text.split(' '):
        t = (line + ' ' + w).strip()
        if probe.textlength(t, font=font) <= width:
            line = t
        else:
            lines.append(line)
            line = w
    if line:
        lines.append(line)
    return lines

pairs = []
for spec in sys.argv[4:]:
    parts = spec.split(';')
    before, after, text = parts[0], parts[1], parts[2]
    crop = tuple(int(v) for v in parts[3].split(',')) if len(parts) > 3 and parts[3] else None
    scale = int(parts[4]) if len(parts) > 4 else 0
    pairs.append((fit(before, crop, scale), fit(after, crop, scale), wrap(text, cap, W)))

subs = sub.split('|') if sub else []
H = pad + 58 + len(subs) * 34 + 10
for a, b, lines in pairs:
    H += len(lines) * 38 + 8 + 34 + a.height + gap + 34 + b.height + gap * 2
sheet = Image.new('RGB', (W + pad * 2, H + pad), BG)
d = ImageDraw.Draw(sheet)
y = pad
d.text((pad, y), title, font=big, fill=GOLD)
y += 58
for s in subs:
    d.text((pad, y), s, font=mid, fill=PALE)
    y += 34
y += 10
for a, b, lines in pairs:
    for line in lines:
        d.text((pad, y), line, font=cap, fill=GOLD)
        y += 38
    y += 8
    for name, im in (('BEFORE (the game as it is now)', a), ('AFTER (not in the game yet)', b)):
        d.text((pad, y), name, font=tag, fill=DIM if name.startswith('BEFORE') else (122, 248, 240))
        y += 34
        sheet.paste(im, (pad, y))
        y += im.height + gap
    y += gap
sheet.save(out)
print(out, sheet.size)
