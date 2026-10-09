#!/usr/bin/env python3
"""THE STILL SHEET of the skeleton on the heroes' bones (a mock-up: art/monster_bones3.ts), for the
owner's phone: today's skeleton and the new one, side by side, facing you and facing away, at the
size the game shows them on a phone (cut from the game's own pictures, one picture pixel of the
phone to one of the sheet) and enlarged (src/dev/preview_skeleton3.ts, `sheet`).
   python3 tools/skeleton3_sheet.py <out.png> <today.png> <today_where.json> <bones.png> <bones_where.json> <enlarged.png>
The game's pictures and where its figures stand come from tools/scenarios/skeleton3.mjs (taken
at a phone's size: --touch --size 844x390 --dpr 3); the first and third figure it stands are the
one facing you and the one facing away, with the hero between them."""
import json
import sys
from PIL import Image, ImageDraw, ImageFont

out, now_png, now_json, bones_png, bones_json, big_png = sys.argv[1:7]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, mid, cap, small = ImageFont.truetype(B, 40), ImageFont.truetype(R, 25), ImageFont.truetype(B, 27), ImageFont.truetype(R, 21)
W = 1266
PAD = 18
BG, GOLD, PALE, GREY = (23, 20, 46), (255, 216, 102), (240, 232, 255), (168, 162, 184)


def cut(png, where_json, w, h):
    """The part of a game picture round the figure facing you, the hero and the figure facing away."""
    im = Image.open(png).convert('RGB')
    where = json.load(open(where_json))
    k = where.get('scale') or 5
    a, c = where['where'][0], where['where'][2]
    # (a box round the two figures, the hero to the right of them)
    # (and clear of the words the practice room shows on its left, which are fading out)
    x = round(min(a['x'], c['x']) * k) - 74
    y = round(a['y'] * k) - 200
    return im.crop((x, y, x + w, y + h))


def trimmed(im, bg=(7, 5, 10)):
    """A page's picture without the empty page below what is drawn on it."""
    px = im.load()
    y = im.height - 1
    while y > 0 and all(px[x, y] == bg for x in range(0, im.width, 7)):
        y -= 1
    return im.crop((0, 0, im.width, y + 1))


cw = (W - PAD * 3) // 2
ch = 620
now = cut(now_png, now_json, cw, ch)
bones = cut(bones_png, bones_json, cw, ch)
enlarged = trimmed(Image.open(big_png).convert('RGB'))
if enlarged.width != W:
    enlarged = enlarged.resize((W, round(enlarged.height * W / enlarged.width)), Image.NEAREST)

H = 0
lines = [("THE SKELETON, BUILT LIKE THE HEROES", big, GOLD), ("Today's skeleton beside the same monster built on the heroes' 3D bones.", mid, PALE), ('A mock-up: not in the game.', mid, GREY)]
sheet = Image.new('RGB', (W, 4000), BG)
d = ImageDraw.Draw(sheet)
y = PAD
for text, font, colour in lines:
    d.text((PAD, y), text, font=font, fill=colour)
    y += font.size + 12
y += 8
d.text((PAD, y), 'IN THE GAME, AT THE SIZE A PHONE SHOWS IT', font=cap, fill=GOLD)
y += 42
for i, label in enumerate(("today's", 'on the bones')):
    x = PAD + i * (cw + PAD)
    d.text((x + cw // 2 - d.textlength(label, font=cap) // 2, y), label, font=cap, fill=PALE if i == 0 else GOLD)
y += 38
for i, im in enumerate((now, bones)):
    sheet.paste(im, (PAD + i * (cw + PAD), y))
d.text((PAD, y + ch + 8), 'up the screen: facing you.  down the screen: facing away.  the hero between them, for size', font=small, fill=GREY)
y += ch + 48
d.text((PAD, y), 'ENLARGED', font=cap, fill=GOLD)
y += 40
sheet.paste(enlarged, (0, y))
y += enlarged.height + PAD
sheet = sheet.crop((0, 0, W, y))
sheet.save(out)
print(out, sheet.size)
