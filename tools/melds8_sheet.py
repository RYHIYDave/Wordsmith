# THE EIGHT MELDS' RUNE STONES AND COLOURS, one sheet for his phone (tall, big). python3 tools/melds8_sheet.py <stones.json> <out.png>
import json, sys
from PIL import Image, ImageDraw, ImageFont

d = json.load(open(sys.argv[1]))
W, ROW, TOP = 1170, 330, 150
BG = (16, 13, 24)
img = Image.new('RGB', (W, TOP + ROW * len(d) + 40), BG)
g = ImageDraw.Draw(img)
bold = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
reg = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
F = lambda s, b=False: ImageFont.truetype(bold if b else reg, s)
hexc = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))

def stone(pic, scale):
    im = Image.frombytes('RGBA', (pic['w'], pic['h']), bytes(pic['rgba']))
    return im.resize((pic['w'] * scale, pic['h'] * scale), Image.NEAREST)

g.text((40, 34), 'The eight new melds: stones and colours', font=F(40, True), fill=(236, 232, 244))
g.text((40, 94), 'Each stone as the game cuts it, its two words, its colours.', font=F(28), fill=(170, 164, 186))
for i, m in enumerate(d):
    y = TOP + i * ROW
    g.line((40, y, W - 40, y), fill=(44, 38, 58), width=2)
    img.paste(stone(m['stone'], 20), (24, y + 20), stone(m['stone'], 20))
    x = 290
    g.text((x, y + 26), m['name'], font=F(58, True), fill=hexc(m['color']))
    px = x
    for j, p in enumerate(m['parts']):
        s = stone(p['stone'], 6)
        img.paste(s, (px, y + 110), s)
        g.text((px + 80, y + 124), p['word'].capitalize(), font=F(32, True), fill=hexc(p['color']))
        px += 80 + int(g.textlength(p['word'].capitalize(), font=F(32, True))) + 26
        if j == 0:
            g.text((px - 8, y + 120), '+', font=F(36, True), fill=(200, 196, 214))
            px += 34
    for k, c in enumerate(m['ramp']):
        g.rectangle((x + k * 70, y + 196, x + k * 70 + 62, y + 246), fill=hexc(c), outline=(236, 232, 244) if k == 3 else None, width=3)
    g.text((x + 6 * 70 + 16, y + 206), m['color'], font=F(26), fill=(150, 144, 166))
    g.text((x, y + 264), 'Rune: ' + m['is'], font=F(30), fill=(200, 196, 214))
img.save(sys.argv[2])
print(img.size)
