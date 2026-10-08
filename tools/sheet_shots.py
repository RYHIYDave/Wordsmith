# A picture for the owner's phone: screenshots (or parts of them, enlarged), one under another,
# each under its caption. Used to show something new that has no "before" (ledges and stairs).
#   python3 tools/sheet_shots.py <out.png> "<title>" "<subtitle|second line>" "<shot.png>;<caption>[;x0,y0,x1,y1[;scale]]" ...
# A crop is in the screenshot's own pixels; the scale is how many pixels of the picture each pixel
# of the crop becomes (a crop 422 wide at 3, or 633 wide at 2, fills the sheet exactly).
import sys
from PIL import Image, ImageDraw, ImageFont

out, title, sub = sys.argv[1], sys.argv[2], sys.argv[3]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, mid, cap = ImageFont.truetype(B, 46), ImageFont.truetype(R, 27), ImageFont.truetype(B, 30)
W = 1266
pad, gap = 18, 14
BG, GOLD, PALE = (23, 20, 46), (255, 216, 102), (240, 232, 255)

def fit(path, crop, scale):
    im = Image.open(path).convert('RGB')
    if crop:
        im = im.crop(crop)
        if scale:
            im = im.resize((im.width * scale, im.height * scale), Image.NEAREST)
    if im.width == W:
        return im
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

shots = []
for spec in sys.argv[4:]:
    parts = spec.split(';')
    crop = tuple(int(v) for v in parts[2].split(',')) if len(parts) > 2 and parts[2] else None
    scale = int(parts[3]) if len(parts) > 3 else 0
    shots.append((fit(parts[0], crop, scale), wrap(parts[1], cap, W)))

subs = sub.split('|') if sub else []
H = pad + 58 + len(subs) * 34 + 10
for im, lines in shots:
    H += len(lines) * 38 + 8 + im.height + gap * 2
sheet = Image.new('RGB', (W + pad * 2, H + pad), BG)
d = ImageDraw.Draw(sheet)
y = pad
d.text((pad, y), title, font=big, fill=GOLD)
y += 58
for s in subs:
    d.text((pad, y), s, font=mid, fill=PALE)
    y += 34
y += 10
for im, lines in shots:
    for line in lines:
        d.text((pad, y), line, font=cap, fill=GOLD)
        y += 38
    y += 8
    sheet.paste(im, (pad, y))
    y += im.height + gap * 2
sheet.save(out)
print(out, sheet.size)
