# A picture made of chosen frames, two across, each with a caption: used for stacked word loadouts.
#   python3 tools/sheet_cells.py <out.png> "<title>" "<subtitle>" <cell> <cell> ...
# A cell is  prefix;tag;slow|quick;frame;caption[;hero|mid|target]
#   e.g.  "shots/s_mage/f;power+fire_twin+volatile;quick;3;Power Flame Orb of Echoes and Ruin;mid"
import json
import sys
from PIL import Image, ImageDraw, ImageFont

out, title, sub = sys.argv[1], sys.argv[2], sys.argv[3]
cw, up, down, zoom = 320, 125, 85, 2
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, mid, cap = ImageFont.truetype(B, 44), ImageFont.truetype(R, 26), ImageFont.truetype(B, 25)

def cell(spec):
    parts = spec.split(';')
    prefix, tag, which, frame, text = parts[0], parts[1], parts[2], int(parts[3]), parts[4]
    focus = parts[5] if len(parts) > 5 else 'mid'
    im = Image.open(f'{prefix}_{tag}_{which}_{frame:02d}.png').convert('RGB')
    W, H = im.size
    cx, cy = W // 2, H // 2
    if focus != 'hero':
        try:
            at = json.load(open(f'{prefix}_{tag}_{which}.json'))
            k = 0.5 if focus == 'mid' else 1.0
            cx, cy = round(cx + (at['x'] - cx) * k), round(cy + (at['y'] + 10 - cy) * k)
        except (FileNotFoundError, KeyError, ValueError):
            pass
    cx = min(max(cx, cw // 2), W - cw // 2)
    cy = min(max(cy, up), H - down)
    c = im.crop((cx - cw // 2, cy - up, cx + cw // 2, cy + down)).resize((cw * zoom, (up + down) * zoom), Image.NEAREST)
    d = ImageDraw.Draw(c, 'RGBA')
    # the caption may need two lines
    words, lines, line = text.split(' '), [], ''
    for w in words:
        if d.textlength((line + ' ' + w).strip(), font=cap) > c.width - 24:
            lines.append(line)
            line = w
        else:
            line = (line + ' ' + w).strip()
    lines.append(line)
    d.rectangle((0, 0, c.width, 12 + 32 * len(lines)), fill=(8, 6, 14, 200))
    for i, ln in enumerate(lines):
        d.text((12, 6 + 32 * i), ln, font=cap, fill=(255, 226, 150))
    return c

cells = [cell(s) for s in sys.argv[4:]]
W, H = cells[0].size
gap, pad, head = 8, 16, 150
rows = (len(cells) + 1) // 2
sheet = Image.new('RGB', (pad * 2 + W * 2 + gap, head + rows * (H + gap) - gap + pad), (14, 11, 20))
d = ImageDraw.Draw(sheet)
d.text((pad, 14), title, font=big, fill=(245, 236, 214))
for i, ln in enumerate(sub.split('|')):
    d.text((pad, 72 + 32 * i), ln, font=mid, fill=(200, 192, 180))
for i, c in enumerate(cells):
    sheet.paste(c, (pad + (i % 2) * (W + gap), head + (i // 2) * (H + gap)))
sheet.save(out)
print(out, sheet.size)
