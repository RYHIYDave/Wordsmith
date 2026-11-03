#!/usr/bin/env python3
"""THE NEW ITEM PICTURES, STYLE A, A SHEET (docs/mockups/items_look/pictures/items_a_sheet.png): every item in a row of its four
rarities, each in a slot drawn as the game draws one (its frame in the rarity's colour, the picture in its middle), three times
as big as a phone shows it; then the gear and the bag, and a few pieces lying on the floor, as an iPhone 16 shows them, drawn by
the game itself (tools/scenarios/items_a_phone.mjs), at their real size.
   python3 tools/items_a_sheet.py <raw dir> <phone dir> <out.png>"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

src, shots, out = sys.argv[1], sys.argv[2], sys.argv[3]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
W = 1200
BG, PANEL, PANEL2, GOLD, TEXT, SOFT = (23, 20, 46), (38, 35, 84), (33, 30, 75), (255, 216, 102), (228, 224, 255), (168, 162, 216)
SLOT = (14, 12, 36)
RARITY = [(0xcf, 0xc6, 0xbc), (0x6f, 0x8c, 0xff), (0xff, 0xe0, 0x70), (0xff, 0x8a, 0x3a)]
RNAME = ['Normal', 'Magic', 'Rare', 'Unique']
big, mid, name_f, small, tiny = (ImageFont.truetype(B, 34), ImageFont.truetype(B, 25), ImageFont.truetype(B, 21),
                                 ImageFont.truetype(R, 19), ImageFont.truetype(R, 15))
names = json.load(open(os.path.join(src, 'names.json')))
KINDS, NAME = names['kinds'], names['names']

# how each gets finer, Normal to Unique, in plain words
HOW = {
    'sword': 'Plain steel; a blue grip and stone; a gold guard and a yellow stone; a blackened blade inlaid with gold, a swept gold guard, orange stones.',
    'greatsword': 'Plain steel; a blue grip, a blue stone in the guard; gold quillons and yellow stones; blackened and gilded, longer quillons, orange stones.',
    'bow': 'Plain wood, horn tips; a blue grip and stone; gold tips and bands, a yellow stone; blackened wood inlaid with gold, orange stones in its tips.',
    'wand': 'Wood, an iron collar; carved ivory, a blue stone at its foot; gold claws up the crystal, a yellow stone; blackened, a gold spiral, orange stones.',
    'staff': 'Gnarled wood, an iron band; a blue ribbon and stone; a gold band and caps, a yellow stone; blackened wood, gilded prongs, orange stones.',
    'wraps': 'The Veteran’s two-handed weapon. Plain linen; blue straps, steel studs, blue stones; gold studs and bands, yellow stones; deep red, gilded, orange stones.',
    'tome': 'The Warlock’s. Red leather and iron, a horned demon’s face, pages edged in fire; chained; its third eye open, flames licking out; blackened and gilded, its eyes burning, a burning sigil.',
    'wrench': 'The Tinkerer’s big wrench. Plain steel; a blue grip, a brass gear; a gold gear and a gauge, a yellow stone; blackened and gilded, two gears, a glowing core.',
    'shield': 'Planks and steel; a blue field, a steel chevron, a blue stone; a red field, a gold chevron, a yellow stone; blackened, a gold rim, orange stones.',
    'quiver': 'Leather, white feathers; blue feathers, strap and stone; a gold mouth, tooled in gold, a yellow stone; black leather, gold mouth and foot, an orange stone.',
    'focus': 'A sea-green crystal in a steel cradle; a blue stone; taller gold claws, a yellow stone; a blackened cradle, gold claws, orange stones.',
    'helm': 'Plain steel, a horsehair crest; a blue crest and stone; a gold brow and ridge, a red crest, a yellow stone; blackened, inlaid with gold, orange stones.',
    'hood': 'Green wool; a blue edge and clasp; a gold edge and hem, a yellow stone; black, edged in gold, an orange stone, its eyes glinting.',
    'armor': 'Plain steel plate; a blue belt and stone; gold trim, a red belt, a yellow stone; blackened plate inlaid with gold, orange stones.',
    'robe': 'Plain violet; blue trim, sash and stone; gold trim and hem, a red sash, a yellow stone; black, trimmed in gold, orange stones.',
    'gloves': 'A steel gauntlet; blue leather, a blue stone; gold trim, a yellow stone; blackened, inlaid with gold, orange stones.',
    'belt': 'Leather, an iron buckle; a blue pouch and stone; a gold buckle and studs, a yellow stone; dark leather tooled in gold, orange stones.',
    'boots': 'Plain leather; a blue cuff and stone; a gold buckle, a steel toe cap, a yellow stone; dark leather, gold toe, heel and trim, orange stones.',
    'ring': 'Steel and a red garnet; a sapphire; gold and a topaz; gold and an orange stone, two more set in its band.',
    'amulet': 'Steel and a red garnet; a sapphire; gold and a topaz; a wider gold setting, an orange stone and three more.',
}


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
K = 6               # sheet pixels to a game pixel: a slot 20 game pixels, its frame 1, the picture 16 (three to a picture pixel)
SLOTW = 20 * K
LABEL = 330
COLW = (W - 16 - LABEL) // 4
ROWH = SLOTW + 18


def slot(im, x, y, r, pic):
    d = ImageDraw.Draw(im)
    d.rectangle([x, y, x + SLOTW - 1, y + SLOTW - 1], fill=RARITY[r])
    d.rectangle([x + K, y + K, x + SLOTW - 1 - K, y + SLOTW - 1 - K], fill=SLOT)
    p = pic.resize((pic.width * K // 2, pic.height * K // 2), Image.NEAREST)
    im.paste(p, (x + 2 * K, y + 2 * K), p)


blocks = []


def head_block():
    text = ('Your pick, “A, painted”, with “Finer and a rim”: every item, each rarer one finer in its own way, and a thin line of its '
            'rarity’s colour round the item itself, in the bag and on the floor. With the Veteran’s brawler’s wraps, the Warlock’s '
            'demonic tome and the Tinkerer’s big wrench. Each is shown in a slot as the game draws one, three times as big as your '
            'phone shows it; below, the bag and the floor on your phone at their real size. Not in the game yet.')
    lines = wrap(probe, text, small, W - 36)
    h = 62 + 25 * len(lines) + 14
    def draw(im, d, y):
        d.text((18, y + 14), 'New item pictures: every item, four rarities', font=big, fill=GOLD)
        for k, ln in enumerate(lines):
            d.text((18, y + 62 + k * 25), ln, font=small, fill=SOFT)
    return h, draw


def items_block():
    h = 44 + len(KINDS) * ROWH + 10
    def draw(im, d, y):
        d.rectangle([8, y, W - 8, y + h - 8], fill=PANEL2)
        for r in range(4):
            cx = 8 + LABEL + r * COLW + COLW // 2
            d.text((cx, y + 10), RNAME[r], font=mid, fill=RARITY[r], anchor='ma')
        yy = y + 44
        for i, k in enumerate(KINDS):
            if i % 2 == 1:
                d.rectangle([8, yy - 4, W - 8, yy + ROWH - 6], fill=PANEL)
            d.text((22, yy + 4), NAME[k], font=name_f, fill=GOLD)
            for j, ln in enumerate(wrap(d, HOW[k], tiny, LABEL - 30)[:5]):
                d.text((22, yy + 32 + j * 17), ln, font=tiny, fill=TEXT)
            for r in range(4):
                pic = Image.open(os.path.join(src, f'A_{k}_{r}.png')).convert('RGBA')
                slot(im, 8 + LABEL + r * COLW + (COLW - SLOTW) // 2, yy, r, pic)
            yy += ROWH
    return h, draw


def shot_block(title, sub, img):
    lines = wrap(probe, sub, tiny, W - 40)
    h = 44 + img.height + 10 + 18 * len(lines) + 16
    def draw(im, d, y):
        d.rectangle([8, y, W - 8, y + h - 8], fill=PANEL2)
        d.text((20, y + 8), title, font=mid, fill=GOLD)
        px = (W - img.width) // 2
        im.paste(img, (px, y + 44))
        for k, ln in enumerate(lines):
            d.text((20, y + 44 + img.height + 8 + k * 18), ln, font=tiny, fill=SOFT)
    return h, draw


inv = Image.open(os.path.join(shots, '_inventory.png')).convert('RGB').crop((1300, 160, 1300 + 1180, 1179))
floor = Image.open(os.path.join(shots, '_floor.png')).convert('RGB').crop((760, 420, 1800, 1000))
blocks.append(head_block())
blocks.append(items_block())
blocks.append(shot_block('Your gear and your bag, on an iPhone 16 held sideways, real size',
                         'Drawn by the game itself. Each slot’s frame is the rarity’s colour, as today; the thin line round each item is the new rim. '
                         'In the bag: the brawler’s wraps (first row, fifth; second row, fifth), the demonic tome (first row, sixth; second row, sixth) '
                         'and the wrench (first row, seventh; second row, seventh).', inv))
blocks.append(shot_block('Lying on the floor as loot, real size',
                         'Each named in its rarity’s colour above it, as today, with the rim of that colour round the piece itself.', floor))
total = sum(h for h, _ in blocks) + 12
im = Image.new('RGB', (W, total), BG)
d = ImageDraw.Draw(im)
y = 0
for h, draw in blocks:
    draw(im, d, y)
    y += h
im.save(out, optimize=True)
print(out, im.size)
