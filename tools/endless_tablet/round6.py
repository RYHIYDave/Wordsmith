import sys
from PIL import Image, ImageDraw
import sheets, mountains
OUT = sys.argv[1]
W, BG = sheets.W, sheets.BG
b = Image.open('brawler.png')
probe = Image.new('RGB', (W, 4000), BG)
d = ImageDraw.Draw(probe)
y = sheets.header(d, 'HIS MOUNT: a big woolly boar, the ram and the tusker in one. The warped wordsmith on it, beside the Brawler. Rough.', size=34)
for t in mountains.BOARS:
    p = mountains.mount_panel(t, b, w=270)
    sc = (W - 40) / p.w * 0.85
    im = sheets.on_panel(p.image(4).resize((int(p.w * sc), int(p.h * sc)), Image.NEAREST))
    probe.paste(im, (20, y), im)
    y = sheets.text_block(d, 20, y + im.height + 8, t[0], t[1], W - 40, tsize=28, wsize=24) + 24
probe.crop((0, 0, W, y)).save(f'{OUT}/endless_12_woolly_boar.png')
print(Image.open(f'{OUT}/endless_12_woolly_boar.png').size)
