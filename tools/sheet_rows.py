# A sheet with a row per loadout, for looking closely at a few of them.
#   python3 tools/sheet_rows.py <prefix> <slow|quick> <out.png> <tags, comma separated> [frames] [crop half-width] [crop up] [crop down] [zoom]
# e.g. python3 tools/sheet_rows.py shots/v_ranger/f quick out.png "swift_-,twin_-" 0,1,2,3 150 110 70 2
import sys
from PIL import Image, ImageDraw, ImageFont
prefix, which, out = sys.argv[1], sys.argv[2], sys.argv[3]
tags = sys.argv[4].split(',')
frames = [int(x) for x in (sys.argv[5] if len(sys.argv) > 5 and sys.argv[5] else '0,1,2,3,4,5').split(',')]
hw = int(sys.argv[6]) if len(sys.argv) > 6 else 190
up = int(sys.argv[7]) if len(sys.argv) > 7 else 150
down = int(sys.argv[8]) if len(sys.argv) > 8 else 100
zoom = int(sys.argv[9]) if len(sys.argv) > 9 else 1
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
rows = []
for tag in tags:
    ims = []
    for f in frames:
        try:
            im = Image.open(f'{prefix}_{tag}_{which}_{f:02d}.png')
        except FileNotFoundError:
            continue
        W, H = im.size
        c = im.crop((W // 2 - hw, H // 2 - up, W // 2 + hw, H // 2 + down))
        if zoom > 1:
            c = c.resize((c.width * zoom, c.height * zoom), Image.NEAREST)
        ims.append(c)
    if ims:
        rows.append((tag, ims))
cw, ch = rows[0][1][0].size
label = 150
sheet = Image.new('RGB', (label + len(frames) * (cw + 4) - 4, len(rows) * (ch + 4) - 4), (16, 13, 22))
d = ImageDraw.Draw(sheet)
for r, (tag, ims) in enumerate(rows):
    d.text((8, r * (ch + 4) + ch // 2 - 10), tag, font=font, fill=(240, 232, 210))
    for i, im in enumerate(ims):
        sheet.paste(im, (label + i * (cw + 4), r * (ch + 4)))
sheet.save(out)
print(out, sheet.size)
