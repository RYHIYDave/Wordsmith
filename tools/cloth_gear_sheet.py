#!/usr/bin/env python3
"""THE BARRIER GEAR'S COWL AND SLIPPERS, A SHEET (docs/mockups/cloth_gear/cloth_gear_sheet.png): the two new pictures (art/items_a.ts
cowl, slippers) at their four rarities beside today's robe, hood and boots, each in a slot as the Godot game draws one, three times
as big as a phone shows it; then the Velvet Cowl in the Mage's helmet slot and the new pieces in the bag, put into the Godot game's
own screenshots (docs/mockups/defences) at their real size, as the game will draw them (its loot pictures are these, baked).
   npx tsx tools/items_a_sheet.ts <raw dir>
   python3 tools/cloth_gear_sheet.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
W = 1200
BG, PANEL, PANEL2, GOLD, TEXT, SOFT = (23, 20, 46), (38, 35, 84), (33, 30, 75), (255, 216, 102), (228, 224, 255), (168, 162, 216)
SLOT = (14, 12, 36)
RARITY = [(0xcf, 0xc6, 0xbc), (0x6f, 0x8c, 0xff), (0xff, 0xe0, 0x70), (0xff, 0x8a, 0x3a)]
RNAME = ['Normal', 'Magic', 'Rare', 'Unique']
big, mid, name_f, small, tiny = (ImageFont.truetype(B, 34), ImageFont.truetype(B, 25), ImageFont.truetype(B, 21),
                                 ImageFont.truetype(R, 19), ImageFont.truetype(R, 16))
ROWS = [
    ('cowl', 'NEW: Cowl', 'Linen, Silk or Velvet, for the head. A soft cowl, its face in shadow, a swag of cloth at the throat, a '
     'short pointed mantle. Finer with rarity: a blue band and stone; a gold band, hem and yellow stone; black, gold, orange stones.'),
    ('slippers', 'NEW: Slippers', 'Linen, Silk or Velvet, for the feet. A soft slipper, its toe curled up with a tassel, its mouth '
     'banded. Finer with rarity: a blue band and stone; a gold toe, band and stitching, a yellow stone; black, gold, orange stones.'),
    ('robe', 'Robe (today)', 'The cloth robe: the colours the two new pieces take from it, its violet cloth, its band and its sash.'),
    ('hood', 'Hood (today)', 'The hood (leather gear, Dodge), so the cowl is not mistaken for it.'),
    ('boots', 'Boots (today)', 'The boots (leather and heavy gear), so the slippers are not mistaken for them.'),
]


def wrap(d, text, font, maxw):
    lines, line = [], ''
    for w in text.split(' '):
        t = (line + ' ' + w).strip()
        if d.textlength(t, font=font) > maxw and line:
            lines.append(line); line = w
        else:
            line = t
    if line: lines.append(line)
    return lines


probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
K = 6                 # sheet pixels to a game pixel: a slot 19 game pixels, the picture 16 (three to a picture pixel)
SLOTW = 19 * K
LABEL = 360
COLW = (W - 16 - LABEL) // 4
ROWH = SLOTW + 36


def pic(k, r):
    return Image.open(os.path.join(src, f'A_{k}_{r}.png')).convert('RGBA')


def slot(im, x, y, p):
    d = ImageDraw.Draw(im)
    d.rectangle([x, y, x + SLOTW - 1, y + SLOTW - 1], fill=SLOT, outline=(26, 22, 72))
    q = p.resize((p.width * K // 2, p.height * K // 2), Image.NEAREST)
    im.paste(q, (x + (SLOTW - q.width) // 2, y + (SLOTW - q.height) // 2), q)


blocks = []


def head_block():
    text = ('For the Mage’s cloth gear, which gives Barrier: until now cloth had a robe, gloves and a sash but no helmet and no '
            'boots. Two new pieces, in the robe’s colours: a Cowl for the head and Slippers for the feet, each Linen, Silk or '
            'Velvet. As with the robes, the three share one picture, and it gets finer with rarity like the rest of the gear. '
            'Each is shown in a slot three times as big as your phone shows it; below, in the game at real size. Not in the game yet.')
    lines = wrap(probe, text, small, W - 36)
    h = 62 + 25 * len(lines) + 14
    def draw(im, d, y):
        d.text((18, y + 14), 'Barrier gear: the Cowl and the Slippers', font=big, fill=GOLD)
        for k, ln in enumerate(lines):
            d.text((18, y + 62 + k * 25), ln, font=small, fill=SOFT)
    return h, draw


def items_block():
    h = 44 + len(ROWS) * ROWH + 10
    def draw(im, d, y):
        d.rectangle([8, y, W - 8, y + h - 8], fill=PANEL2)
        for r in range(4):
            cx = 8 + LABEL + r * COLW + COLW // 2
            d.text((cx, y + 10), RNAME[r], font=mid, fill=RARITY[r], anchor='ma')
        yy = y + 44
        for i, (k, name, how) in enumerate(ROWS):
            if i % 2 == 1:
                d.rectangle([8, yy - 6, W - 8, yy + ROWH - 8], fill=PANEL)
            if i == 2:
                d.line([20, yy - 7, W - 20, yy - 7], fill=SOFT, width=2)
            d.text((22, yy + 2), name, font=name_f, fill=GOLD if i < 2 else TEXT)
            for j, ln in enumerate(wrap(d, how, tiny, LABEL - 34)[:6]):
                d.text((22, yy + 30 + j * 19), ln, font=tiny, fill=TEXT if i < 2 else SOFT)
            for r in range(4):
                slot(im, 8 + LABEL + r * COLW + (COLW - SLOTW) // 2, yy, pic(k, r))
            yy += ROWH
    return h, draw


def shot_block(title, sub, img):
    lines = wrap(probe, sub, tiny, W - 40)
    h = 44 + img.height + 10 + 20 * len(lines) + 16
    def draw(im, d, y):
        d.rectangle([8, y, W - 8, y + h - 8], fill=PANEL2)
        d.text((20, y + 8), title, font=mid, fill=GOLD)
        im.paste(img, ((W - img.width) // 2, y + 44))
        for k, ln in enumerate(lines):
            d.text((20, y + 44 + img.height + 8 + k * 20), ln, font=tiny, fill=SOFT)
    return h, draw


def put(shot, x, y, p):
    """An item picture into a 76 by 76 slot of the game's screenshot at (x, y): 4 screen pixels to a game pixel, as the game draws it."""
    d = ImageDraw.Draw(shot)
    d.rectangle([x, y, x + 75, y + 75], fill=SLOT)
    q = p.resize((64, 64), Image.NEAREST)
    shot.paste(q, (x + 6, y + 6), q)


here = os.path.dirname(os.path.abspath(__file__))
shots = os.path.join(here, '..', 'docs', 'mockups', 'defences')
# the Mage's gear (her robe as she wore it, the Rare robe's picture), a Rare cowl in her empty helmet slot to go with it
gear = Image.open(os.path.join(shots, 'def04_card_robe.png')).convert('RGB')
put(gear, 986, 110, pic('cowl', 2))
gear = gear.crop((970, 0, 1920, 398))
# the bag: the cowl and the slippers at their four rarities, today's hood and boots beside them, and the robes
bag = Image.open(os.path.join(shots, 'def07_stats_ranger.png')).convert('RGB')
layout = [[('cowl', 0), ('cowl', 1), ('cowl', 2), ('cowl', 3), None, ('hood', 0), ('helm', 0)],
          [('slippers', 0), ('slippers', 1), ('slippers', 2), ('slippers', 3), None, ('boots', 0)],
          [('robe', 0), ('robe', 1), ('robe', 2), ('robe', 3), None, ('gloves', 0), ('belt', 0)]]
for j, row in enumerate(layout):
    for i, it in enumerate(row):
        if it: put(bag, 986 + 88 * i, 818 + 88 * j, pic(*it))
bag = bag.crop((970, 780, 1920, 1080))

blocks.append(head_block())
blocks.append(items_block())
blocks.append(shot_block('In the Mage’s gear, real size',
                         'The Godot game’s own screen, with a Rare cowl put in her empty helmet slot, above the robe she wears '
                         '(the Rare robe’s picture). (Made by placing the picture into a screenshot: the game will draw it the same, pixel for pixel.)', gear))
blocks.append(shot_block('In the bag, real size',
                         'First row: the Cowl at Normal, Magic, Rare and Unique, then today’s hood and helmet. Second row: the Slippers '
                         'at the four rarities, then today’s boots. Third row: the robe at the four rarities, then today’s gloves and sash. '
                         '(Placed into a screenshot of the game, as above.)', bag))
total = sum(h for h, _ in blocks) + 12
im = Image.new('RGB', (W, total), BG)
d = ImageDraw.Draw(im)
y = 0
for h, draw in blocks:
    draw(im, d, y)
    y += h
os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
im.save(out, optimize=True)
print(out, im.size)
