# Put several screenshots on one sheet, each with its file name under it (for looking at many at once).
#   python3 tools/montage.py out.png cols shot1.png shot2.png ...
import sys
from PIL import Image, ImageDraw, ImageFont
out, cols = sys.argv[1], int(sys.argv[2])
files = sys.argv[3:]
ims = [Image.open(f).convert('RGB') for f in files]
w = max(i.width for i in ims); h = max(i.height for i in ims)
rows = (len(ims) + cols - 1) // cols
pad, cap = 8, 18
sheet = Image.new('RGB', (cols * (w + pad) + pad, rows * (h + cap + pad) + pad), (30, 24, 36))
d = ImageDraw.Draw(sheet)
try:
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
except Exception:
    f = ImageFont.load_default()
for k, (im, name) in enumerate(zip(ims, files)):
    x = pad + (k % cols) * (w + pad); y = pad + (k // cols) * (h + cap + pad)
    sheet.paste(im, (x, y))
    d.text((x + 2, y + h + 1), name.split('/')[-1], fill=(220, 210, 200), font=f)
sheet.save(out)
print(out, sheet.size)
