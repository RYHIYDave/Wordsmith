import sys
from PIL import Image, ImageDraw
import sheets, mountains
OUT = sys.argv[1]
W, BG = sheets.W, sheets.BG
b = Image.open('brawler.png')
probe = Image.new('RGB', (W, 4000), BG)
d = ImageDraw.Draw(probe)
y = sheets.header(d, 'THE WARPED WORDSMITH’S MOUNT, from the cold mountains where his order began: three beasts of the high cold, warped as he is, his runes burning in them. Rough, beside the Brawler.', size=34)
ps = [mountains.mount_panel(t, b) for t in mountains.TAKES]
p = ps[0]
sc = (W - 40) / p.w
im = sheets.on_panel(p.image(4).resize((int(p.w * sc), int(p.h * sc)), Image.NEAREST))
probe.paste(im, (20, y), im)
y = sheets.text_block(d, 20, y + im.height + 8, mountains.TAKES[0][0], mountains.TAKES[0][1], W - 40, tsize=28, wsize=24) + 20
sc = (W - 60) / (ps[1].w + ps[2].w)
x, yb = 20, y
for t, q in zip(mountains.TAKES[1:], ps[1:]):
    im = sheets.on_panel(q.image(4).resize((int(q.w * sc), int(q.h * sc)), Image.NEAREST))
    probe.paste(im, (x, y), im)
    yb = max(yb, sheets.text_block(d, x, y + im.height + 8, t[0], t[1], im.width - 10, tsize=24, wsize=21))
    x += im.width + 20
probe.crop((0, 0, W, yb + 20)).save(f'{OUT}/endless_10_mounts.png')
print(Image.open(f'{OUT}/endless_10_mounts.png').size)
