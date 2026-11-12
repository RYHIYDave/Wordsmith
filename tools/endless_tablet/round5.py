import sys
from PIL import Image, ImageDraw
import sheets, mountains
OUT = sys.argv[1]
W, BG = sheets.W, sheets.BG
b = Image.open('brawler.png')
probe = Image.new('RGB', (W, 4000), BG)
d = ImageDraw.Draw(probe)
y = sheets.header(d, 'A MIX OF THE RAM AND THE TUSKER: two ways. Rough, beside the Brawler.', size=34)
for t in mountains.MIXES:
    p = mountains.mount_panel(t, b)
    sc = (W - 40) / p.w * 0.82
    im = sheets.on_panel(p.image(4).resize((int(p.w * sc), int(p.h * sc)), Image.NEAREST))
    probe.paste(im, (20, y), im)
    y = sheets.text_block(d, 20, y + im.height + 8, t[0], t[1], W - 40, tsize=28, wsize=24) + 24
probe.crop((0, 0, W, y)).save(f'{OUT}/endless_11_mount_mix.png')
print(Image.open(f'{OUT}/endless_11_mount_mix.png').size)
