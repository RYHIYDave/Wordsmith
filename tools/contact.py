# contact.py <strip.png> <out.png> <frame,frame,...> [cell=340] [cols=3] [per_row=5] [cell height=cell]
# A contact sheet of chosen frames of a strip (each labelled by its number).
import sys
from PIL import Image, ImageDraw
src, out = sys.argv[1], sys.argv[2]
idx = [int(x) for x in sys.argv[3].split(',')]
cell = int(sys.argv[4]) if len(sys.argv) > 4 else 340
cols = int(sys.argv[5]) if len(sys.argv) > 5 else 3
per = int(sys.argv[6]) if len(sys.argv) > 6 else 5
ch = int(sys.argv[7]) if len(sys.argv) > 7 else cell
im = Image.open(src).convert('RGB')
rows = (len(idx) + per - 1) // per
sheet = Image.new('RGB', (cell * per, ch * rows), (13, 16, 48))
d = ImageDraw.Draw(sheet)
for k, i in enumerate(idx):
    x, y = (i % cols) * cell, (i // cols) * ch
    sheet.paste(im.crop((x, y, x + cell, y + ch)), ((k % per) * cell, (k // per) * ch))
    d.text(((k % per) * cell + 4, (k // per) * ch + 4), str(i), fill=(255, 255, 255))
sheet.save(out)
