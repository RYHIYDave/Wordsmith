# Larger contact sheets: every second frame, three across.
#   python3 tools/sheet_big.py shots/wfx_warrior "-_power" slow [step] [cols]
import glob, sys
from PIL import Image
prefix, tag, which = sys.argv[1], sys.argv[2], sys.argv[3]
step = int(sys.argv[4]) if len(sys.argv) > 4 else 2
cols = int(sys.argv[5]) if len(sys.argv) > 5 else 3
files = sorted(glob.glob(f'{prefix}_{tag}_{which}_[0-9][0-9].png'))[::step]
ims = [Image.open(f) for f in files]
w, h = ims[0].size
box = (w // 2 - 200, h // 2 - 150, w // 2 + 200, h // 2 + 110)
crops = [im.crop(box) for im in ims]
cw, ch = crops[0].size
rows = (len(crops) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (cw + 4) - 4, rows * (ch + 4) - 4), (20, 16, 24))
for i, c in enumerate(crops):
    sheet.paste(c, ((i % cols) * (cw + 4), (i // cols) * (ch + 4)))
out = f'shots/big_{tag}_{which}.png'
sheet.save(out); print(out, len(files), sheet.size)
