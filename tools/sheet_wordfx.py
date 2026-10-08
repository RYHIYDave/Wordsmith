# Contact sheets from the frames that tools/scenarios/wordfx.mjs saves.
#   python3 tools/sheet_wordfx.py shots/wfx_warrior [columns]
# One sheet per loadout and ability: <prefix>_<tag>_<slow|quick>_sheet.png
import glob, re, sys
from PIL import Image

prefix = sys.argv[1]
cols = int(sys.argv[2]) if len(sys.argv) > 2 else 4
groups = {}
for f in sorted(glob.glob(prefix + '_*_[0-9][0-9].png')):
    m = re.match(re.escape(prefix) + r'_(.+)_(\d\d)\.png$', f)
    if m:
        groups.setdefault(m.group(1), []).append(f)
for tag, files in groups.items():
    ims = [Image.open(f) for f in files]
    w, h = ims[0].size
    box = (w // 2 - 230, h // 2 - 170, w // 2 + 230, h // 2 + 120)
    crops = [im.crop(box) for im in ims]
    cw, ch = crops[0].size
    rows = (len(crops) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (cw + 4) - 4, rows * (ch + 4) - 4), (20, 16, 24))
    for i, c in enumerate(crops):
        sheet.paste(c, ((i % cols) * (cw + 4), (i // cols) * (ch + 4)))
    sheet.save(f'{prefix}_{tag}_sheet.png')
    print(tag, len(files))
