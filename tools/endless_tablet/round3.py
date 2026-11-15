import sys
from PIL import Image, ImageDraw
from kit import font, wrap
import sheets, rider
OUT = sys.argv[1]
W, BG, DIM = sheets.W, sheets.BG, sheets.DIM
b = Image.open('brawler.png')
probe = Image.new('RGB', (W, 4000), BG)
d = ImageDraw.Draw(probe)
y = sheets.header(d, 'THE FINAL BOSS: the warped wordsmith, one of the old order who went down the shaft for the deepest words, riding a four-legged beast. A staff of runes, runes written on the air, burning pink. Rough, beside the Brawler.', size=36)
ps = [rider.ride_panel(t, b) for t in rider.TAKES]
# (A big, on its own)
p = ps[0]
sc = 2.9
im = sheets.on_panel(p.image(4).resize((int(p.w * sc), int(p.h * sc)), Image.NEAREST))
probe.paste(im, (20, y), im)
y = sheets.text_block(d, 20, y + im.height + 8, rider.TAKES[0][0], rider.TAKES[0][1], W - 40, tsize=28, wsize=24) + 20
# (B and C side by side)
sc = (W - 60) / (ps[1].w + ps[2].w)
x = 20
yb = y
ims = [sheets.on_panel(q.image(4).resize((int(q.w * sc), int(q.h * sc)), Image.NEAREST)) for q in ps[1:]]
for t, im in zip(rider.TAKES[1:], ims):
    probe.paste(im, (x, y), im)
    yb = max(yb, sheets.text_block(d, x, y + im.height + 8, t[0], t[1], im.width - 10, tsize=26, wsize=22))
    x += im.width + 20
probe.crop((0, 0, W, yb + 20)).save(f'{OUT}/endless_9_warped_wordsmith.png')
print(Image.open(f'{OUT}/endless_9_warped_wordsmith.png').size)
