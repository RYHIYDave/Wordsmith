#!/usr/bin/env python3
"""THE NEW ITEM PICTURES, A SHEET (docs/mockups/items_look/pictures/items_sheet.png): today's pictures, then the three styles, each the
whole set, the rarities on a sword, and the set in the inventory as an iPhone 16 shows it, held sideways, at its real size (the
inventory shot is tools/scenarios/items_look_phone.mjs's; the pictures tools/items_look_sheet.ts's).
   python3 tools/items_look_sheet.py <raw dir> <out.png>"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
W = 1200
BG, PANEL, PANEL2, GOLD, TEXT, SOFT = (23, 20, 46), (38, 35, 84), (33, 30, 75), (255, 216, 102), (228, 224, 255), (168, 162, 216)
SLOT, EDGE = (14, 12, 36), (58, 52, 120)
RARITY = [(0xcf, 0xc6, 0xbc), (0x6f, 0x8c, 0xff), (0xff, 0xe0, 0x70), (0xff, 0x8a, 0x3a)]
RNAME = ['Normal', 'Magic', 'Rare', 'Unique']
big, mid, small, tiny = ImageFont.truetype(B, 34), ImageFont.truetype(B, 25), ImageFont.truetype(R, 19), ImageFont.truetype(R, 15)
names = json.load(open(os.path.join(src, 'names.json')))
KINDS, NAME = names['kinds'], names['names']
inv = json.load(open(os.path.join(src, 'inventory.json')))
shot = Image.open(os.path.join(src, 'phone_inventory.png')).convert('RGB')
DEV = 5  # device pixels to a game pixel on an iPhone 16 held sideways (the game's own scale there: engine/screen.ts)

STYLES = [
    ('A', 'A · Painted',
     'Lit and shaded like the new heroes: five tones to each material, dark seams where one part meets another, a shadow under what lies on top, a bold dark outline. Clean and new.'),
    ('B', 'B · Classic loot',
     'Bright, flat colours, three tones to a material, a dark line round every part like a cartoon, and a rim in the item’s rarity colour round the whole thing, in the bag and on the floor.'),
    ('C', 'C · Worn and storied',
     'Painted like A, in old, dulled colours, scratched and grimed, each with a little story: a nicked blade, a patched hood, a ragged hem, a tally cut in a bow, a mended string, a dented helm.'),
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


def icon(name):
    return Image.open(os.path.join(src, name)).convert('RGBA')


def slot(im, x, y, size, edge, pic, k):
    d = ImageDraw.Draw(im)
    d.rectangle([x, y, x + size - 1, y + size - 1], fill=edge)
    d.rectangle([x + k, y + k, x + size - 1 - k, y + size - 1 - k], fill=SLOT)
    if pic is not None:
        p = pic.resize((pic.width * k, pic.height * k), Image.NEAREST)
        im.paste(p, (x + (size - p.width) // 2, y + (size - p.height) // 2), p)


def phone(style):
    """The inventory shot with the pictures of a style laid in every slot: each at 2.5 device pixels to a picture pixel, as the
    phone shows a picture painted two to a game pixel; the dashes under each (the item's properties) drawn over it, as the game does."""
    im = shot.copy()
    if style is None:
        return crop(im)
    for key, r in inv['marks'].items():
        if key == 'inventory': continue
        kind, rar = None, 0
        if key.startswith('gear:'):
            kind, rar = inv['gear'][key[5:]]
        else:
            b = inv['bag'][int(key[4:])]
            if b is None: continue
            kind, rar = b
        x, y = r['x'], r['y']
        fill = im.getpixel((int((x + 1.5) * DEV), int((y + 1.5) * DEV)))
        strip_box = (int((x + 1) * DEV), int(round((y + 17.5) * DEV)), int((x + 19) * DEV), int((y + 19) * DEV))
        strip = im.crop(strip_box)
        ImageDraw.Draw(im).rectangle([int((x + 1) * DEV), int((y + 1) * DEV), int((x + 19) * DEV) - 1, strip_box[1] - 1], fill=fill)
        pic = icon(f'{style}_{kind}_{rar}.png')
        p = pic.resize((int(pic.width * DEV / 2), int(pic.height * DEV / 2)), Image.NEAREST)
        im.paste(p, (int((x + 2) * DEV), int((y + 2) * DEV)), p)
        im.paste(strip, strip_box[:2])
    return crop(im)


def crop(im):
    return im.crop((1284, 118, 1284 + 920, 1179))


probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
PER, CW = 9, (W - 16) // 9
ISZ = 104  # a slot on the sheet: 32 picture pixels at 3 each, and its rim


def set_h():
    return 2 * (ISZ + 30) + 6


blocks = []  # (height, painter)


def head_block():
    lines = wrap(probe, 'Every item the game drops, and the Veteran’s brawler’s wraps (his two-handed weapon), drawn three ways, so you can see one style across everything. Each is the size today’s pictures are and fits today’s slots: drawn at the heroes’ fine grain, twice as fine as today’s. Pictures only: not in the game.', small, W - 36)
    h = 64 + 25 * len(lines) + 12
    def draw(im, d, y):
        d.text((18, y + 14), 'New item pictures: three styles to pick from', font=big, fill=GOLD)
        for k, ln in enumerate(lines):
            d.text((18, y + 62 + k * 25), ln, font=small, fill=SOFT)
    return h, draw


def grid(im, d, y, style, labels=True):
    for i, k in enumerate(KINDS):
        cx = 8 + (i % PER) * CW + (CW - ISZ) // 2
        cy = y + (i // PER) * (ISZ + 30)
        if style == 'today':
            pic = icon(f'today_{k}.png') if k != 'wraps' else None
            slot(im, cx, cy, ISZ, RARITY[0], pic, 3)
            if pic is None:
                d.text((cx + ISZ // 2, cy + ISZ // 2), 'none\nyet', font=tiny, fill=SOFT, anchor='mm', align='center')
        else:
            slot(im, cx, cy, ISZ, RARITY[0], icon(f'{style}_{k}_0.png'), 3)
        t = NAME[k]
        d.text((cx + ISZ // 2, cy + ISZ + 4), t, font=tiny, fill=TEXT, anchor='ma')


def today_block():
    line = 'Sixteen by sixteen big pixels each, from the first builds, every one with the same thin outline. (The Veteran’s wraps have none yet.)'
    lines = wrap(probe, line, small, W - 40)
    h = 44 + 24 * len(lines) + 8 + set_h() + 16
    def draw(im, d, y):
        d.rectangle([8, y, W - 8, y + h - 8], fill=PANEL2)
        d.text((20, y + 8), 'Today’s pictures, for comparison', font=mid, fill=GOLD)
        for k, ln in enumerate(lines):
            d.text((20, y + 42 + k * 24), ln, font=small, fill=TEXT)
        grid(im, d, y + 44 + 24 * len(lines) + 8, 'today')
    return h, draw


def style_block(code, title, line, alt):
    lines = wrap(probe, line, small, W - 40)
    ph = phone(code)
    rar_h = 40 + 136 + 34
    phone_h = 40 + ph.height + 34
    h = 44 + 24 * len(lines) + 8 + set_h() + rar_h + phone_h + 10
    def draw(im, d, y):
        d.rectangle([8, y, W - 8, y + h - 8], fill=PANEL if alt else PANEL2)
        d.text((20, y + 8), title, font=mid, fill=GOLD)
        for k, ln in enumerate(lines):
            d.text((20, y + 42 + k * 24), ln, font=small, fill=TEXT)
        yy = y + 44 + 24 * len(lines) + 8
        grid(im, d, yy, code)
        yy += set_h()
        sub = {'A': 'The rarities on a sword: plain steel; a blue stone in the pommel; a gold guard and a yellow stone; a blackened blade inlaid with gold, swept gold guard, orange stones. Each rarer one is finer, as his rulebook asks of weapons.',
               'B': 'The rarities on a sword: the same sword, ringed in the rarity’s colour: grey-white, blue, yellow, orange.',
               'C': 'The rarities on a sword: an old soldier’s sword, nicked, a cord round its grip; a blue stone; a gilt guard; a blackened heirloom with gold and orange stones.'}[code]
        sl = wrap(d, sub, tiny, W - 40)
        for k, ln in enumerate(sl[:2]):
            d.text((20, yy + 2 + k * 18), ln, font=tiny, fill=SOFT)
        yy += 40
        for r in range(4):
            x = 40 + r * 285
            slot(im, x, yy, 136, RARITY[r], icon(f'{code}_sword_{r}.png'), 4)
            d.text((x + 150, yy + 52), RNAME[r], font=mid, fill=RARITY[r])
        yy += 136 + 34
        d.text((20, yy + 6), 'On a phone, at its real size: your gear and your bag as an iPhone 16 shows them, held sideways', font=small, fill=GOLD)
        yy += 40
        px = (W - ph.width) // 2
        im.paste(ph, (px, yy))
        d.text((px, yy + ph.height + 6), 'Each slot’s rim is the item’s rarity, as in the game. The wraps are in the bag’s second row, at the left.', font=tiny, fill=SOFT)
    return h, draw


def today_phone_block():
    ph = phone(None)
    h = 40 + ph.height + 34 + 10
    def draw(im, d, y):
        d.rectangle([8, y, W - 8, y + h - 8], fill=PANEL2)
        d.text((20, y + 8), 'Today, on a phone, at its real size (iPhone 16, held sideways)', font=small, fill=GOLD)
        px = (W - ph.width) // 2
        im.paste(ph, (px, y + 40))
    return h, draw


blocks.append(head_block())
blocks.append(today_block())
for i, (code, title, line) in enumerate(STYLES):
    blocks.append(style_block(code, title, line, i % 2 == 0))
total = sum(h for h, _ in blocks) + 20
tp = today_phone_block()
if total + tp[0] <= 7480:
    blocks.insert(2, tp)
    total += tp[0]
im = Image.new('RGB', (W, total), BG)
d = ImageDraw.Draw(im)
y = 0
for h, draw in blocks:
    draw(im, d, y)
    y += h
im.save(out, optimize=True)
print(out, im.size)
