#!/usr/bin/env python3
"""THE STILL SHEET of the bone archer on the heroes' bones (a mock-up: art/monster_bones3.ts,
`makeArcherArt3`), for the owner's phone: today's archers and the new, each beside the skeleton of
its kind (today's skeleton beside today's archer; beside the new archer, the skeleton on the bones
he said yes to on 8 Oct), facing you and facing away, at the size the game shows them on a phone
(cut from the game's own pictures, one pixel of the phone to one of the sheet), and the four
standing archers enlarged (src/dev/preview_archer3.ts, `sheet`).
   python3 tools/archer3_sheet.py <out.png> <today.png> <today_where.json> <bones.png> <bones_where.json> <enlarged.png>
The game's pictures and where its figures stand come from tools/scenarios/archer3.mjs (taken at a
phone's size: --touch --size 844x390 --dpr 3, WHO='archer@-58,-34;skeleton@58,-34;archer@-58,34;skeleton@58,34'):
the first and third figure it stands are the archers, facing you and facing away; the second and
fourth the skeletons; the hero between them."""
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
CW = W - PAD * 2
CH = 560


def cut(png, where_json):
    """The part of a game picture round the four figures and the hero between them."""
    im = Image.open(png).convert('RGB')
    where = json.load(open(where_json))
    k = where.get('scale') or 5
    a, b = where['where'][0], where['where'][1]
    cx = round((a['x'] + b['x']) / 2 * k)
    y = round(a['y'] * k) - 180
    return im.crop((cx - CW // 2, y, cx - CW // 2 + CW, y + CH))


def trimmed(im, bg=(7, 5, 10)):
    """A page's picture without the empty page below what is drawn on it."""
    px = im.load()
    y = im.height - 1
    while y > 0 and all(px[x, y] == bg for x in range(0, im.width, 7)):
        y -= 1
    return im.crop((0, 0, im.width, y + 1))


now = cut(now_png, now_json)
bones = cut(bones_png, bones_json)
enlarged = trimmed(Image.open(big_png).convert('RGB'))
if enlarged.width != W:
    enlarged = enlarged.resize((W, round(enlarged.height * W / enlarged.width)), Image.NEAREST)

lines = [("THE BONE ARCHER, BUILT LIKE THE HEROES", big, GOLD), ("Today's bone archer beside the same monster on the new skeleton's bones.", mid, PALE), ('A mock-up: not in the game.', mid, GREY)]
sheet = Image.new('RGB', (W, 4000), BG)
d = ImageDraw.Draw(sheet)
y = PAD
for text, font, colour in lines:
    d.text((PAD, y), text, font=font, fill=colour)
    y += font.size + 12
y += 8
d.text((PAD, y), 'IN THE GAME, AT THE SIZE A PHONE SHOWS IT', font=cap, fill=GOLD)
y += 44
for label, colour, im in (("today's: archers on the left, skeletons on the right", PALE, now), ('on the bones: the new archers, beside the new skeletons', GOLD, bones)):
    d.text((PAD, y), label, font=cap, fill=colour)
    y += 38
    sheet.paste(im, (PAD, y))
    y += CH + 14
d.text((PAD, y), 'up the screen: facing you.  down the screen: facing away.  the hero between them, for size', font=small, fill=GREY)
y += 40
d.text((PAD, y), 'ENLARGED', font=cap, fill=GOLD)
y += 40
sheet.paste(enlarged, (0, y))
y += enlarged.height + PAD
sheet = sheet.crop((0, 0, W, y))
sheet.save(out)
print(out, sheet.size)
