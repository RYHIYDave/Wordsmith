# THE WARRIOR'S BATTLE AXE AND WARHAMMER, STEP 1: THE SHEET, LAID OUT WITH ITS CAPTIONS (the art chat's helper, 9 Nov 2026).
# From the pictures tools/warrior_weapons_pics.ts paints (RGBA; his canvas 192 by 176, his feet at 92, 132).
#   python3 tools/warrior_weapons_pics.py <dir> <out.png>
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
W = 1200
M = 24
BG = (16, 15, 40)
PANEL = (24, 22, 54)
FLOOR = (30, 28, 62)
INK = (232, 230, 255)
DIM = (170, 166, 210)
CYAN = (34, 208, 224)
SLOT = (14, 12, 36)
RARITY = [(0xcf, 0xc6, 0xbc), (0x6f, 0x8c, 0xff), (0xff, 0xe0, 0x70), (0xff, 0x8a, 0x3a)]
RNAME = ['Normal', 'Magic', 'Rare', 'Unique']
big, mid, small, tiny = (ImageFont.truetype(B, 30), ImageFont.truetype(B, 21), ImageFont.truetype(R, 16), ImageFont.truetype(R, 13))
lab = ImageFont.truetype(B, 12)

src, out = sys.argv[1], sys.argv[2]
said = json.load(open(os.path.join(src, 'said.json')))
AX, AY = said['canvas']['ax'], said['canvas']['ay']
probe = ImageDraw.Draw(Image.new('RGB', (4, 4)))

SIDE_WORDS = {
    'front': 'down and right', 'toward': 'toward you', 'frontL': 'down and left', 'sideL': 'to the left',
    'backL': 'up and left', 'away': 'away from you', 'back': 'up and right', 'side': 'to the right',
}
EIGHT = ['front', 'toward', 'frontL', 'sideL', 'backL', 'away', 'back', 'side']
SHORT = {'front': 'down-right', 'toward': 'toward you', 'frontL': 'down-left', 'sideL': 'left', 'backL': 'up-left', 'away': 'away',
         'back': 'up-right', 'side': 'right'}
KIND = {'axe': 'Battle axe', 'hammer': 'Warhammer'}
KEY = {'cleave': 'the Cleave, held at the top of its wind-up', 'smash': 'the Smash, held at the top of its wind-up'}
SAYS = {
    'axeA': 'One broad blade whose edge sweeps long and low, its beard hooked down toward his hands with the hollow under it open; '
            'a thick cheek round the eye, a short squared poll behind.',
    'axeB': 'Two flared bits, one each side of the haft, their edges swept out into horns; a narrow waist at the eye and a spike '
            'standing on top. Throws the same either way round.',
    'axeC': 'A great half-moon blade held off a long haft by two sockets, the hollow between them open, its horns reaching up past '
            'the top and down toward his hands. The longest of the three.',
    'hammerA': 'A squared iron block, its striking face a broad plate standing proud of it with its rim honed bright, a long spike '
               'behind, iron straps down the haft.',
    'hammerB': 'A round iron drum with flat faces, bound in three raised bands of blackened iron, a boss glowing in the middle of '
               'each face.',
    'hammerC': 'A head that flares out from a blunt peen to a broad square face, his own runes cut into the face and its sides and '
               'burning cyan.',
}


def wrap(text, f, maxw):
    lines, line = [], ''
    for word in text.split(' '):
        t = (line + ' ' + word).strip()
        if probe.textlength(t, font=f) > maxw and line:
            lines.append(line)
            line = word
        else:
            line = t
    if line:
        lines.append(line)
    return lines


def pic(name):
    return Image.open(os.path.join(src, name + '.png')).convert('RGBA')


def ground(w, h, k, fx, fy):
    """A patch of floor with a soft shadow under his feet, `k` times as big."""
    im = Image.new('RGB', (w, h), PANEL)
    d = ImageDraw.Draw(im)
    for i in range(6, 0, -1):
        rx, ry = 15 * k * i / 6, 5 * k * i / 6
        c = tuple(int(FLOOR[j] + (8 - FLOOR[j]) * (1 - i / 6) * 0.9) for j in range(3))
        d.ellipse((fx - rx, fy - ry, fx + rx, fy + ry), fill=c)
    return im


def figure(name, k, pad=4):
    """Him from one side, cut to the box round him (and the floor under his feet), `k` times as big, on the floor with his shadow."""
    im = pic(name)
    bb = im.getbbox()
    x0, y0 = min(bb[0], AX - 16) - pad, bb[1] - pad
    x1, y1 = max(bb[2], AX + 16) + pad, max(bb[3], AY + 6) + pad
    im = im.crop((x0, y0, x1, y1))
    im = im.resize((im.width * k, im.height * k), Image.NEAREST)
    g = ground(im.width, im.height, k, (AX - x0) * k, (AY - y0) * k)
    g.paste(im, (0, 0), im)
    return g


def alone(name, k, pad=3):
    im = pic(name)
    bb = im.getbbox()
    im = im.crop((bb[0] - pad, bb[1] - pad, bb[2] + pad, bb[3] + pad))
    im = im.resize((im.width * k, im.height * k), Image.NEAREST)
    g = Image.new('RGB', im.size, PANEL)
    g.paste(im, (0, 0), im)
    return g


def slots(take):
    """The four rarities, each in a slot as the game draws one (its frame the rarity's colour, the picture in its middle), twice
    as big as the phone shows it; and their names."""
    K = 4
    SW = 20 * K
    gap = 14
    im = Image.new('RGB', (4 * SW + 3 * gap, SW + 20), PANEL)
    d = ImageDraw.Draw(im)
    for r in range(4):
        x = r * (SW + gap)
        d.rectangle([x, 0, x + SW - 1, SW - 1], fill=RARITY[r])
        d.rectangle([x + K, K, x + SW - 1 - K, SW - 1 - K], fill=SLOT)
        p = pic('%s_item_%d' % (take, r))
        p = p.resize((p.width * K // 2, p.height * K // 2), Image.NEAREST)
        im.paste(p, (x + 2 * K, 2 * K), p)
        d.text((x + SW // 2, SW + 3), RNAME[r], font=lab, fill=RARITY[r], anchor='ma')
    return im


def floor(take, kind):
    """The four lying on a dungeon's floor as the game lays loot, twice the game's size, each named over it in its rarity's colour."""
    k = 2
    p = pic('%s_floor' % take)
    p = p.resize((p.width * k, p.height * k), Image.NEAREST)
    im = Image.new('RGB', (p.width, p.height + 4), PANEL)
    im.paste(p, (0, 4), p)
    d = ImageDraw.Draw(im)
    for r in range(4):
        cx = (24 + r * 76 + 16) * k
        d.text((cx, 4), KIND[kind], font=lab, fill=RARITY[r], anchor='ma', stroke_width=2, stroke_fill=(10, 8, 24))
    return im


def strip(names, k, pad=2):
    """Pictures of one take alone side by side, `k` times as big."""
    ims = [pic(n) for n in names]
    boxes = [i.getbbox() for i in ims]
    x0 = min(b[0] for b in boxes) - pad
    y0 = min(b[1] for b in boxes) - pad
    x1 = max(b[2] for b in boxes) + pad
    y1 = max(b[3] for b in boxes) + pad
    w, h = (x1 - x0) * k, (y1 - y0) * k
    out = Image.new('RGB', (w * len(ims) + 6 * (len(ims) - 1), h), PANEL)
    for i, im in enumerate(ims):
        c = im.crop((x0, y0, x1, y1)).resize((w, h), Image.NEAREST)
        out.paste(c, (i * (w + 6), 0), c)
    return out


def pad(im, least=70):
    """A picture made at least `least` wide (centred), so the caption under it has room."""
    if im.width >= least:
        return im
    out = Image.new('RGB', (least, im.height), BG)
    out.paste(im, ((least - im.width) // 2, 0))
    return out


class Sheet:
    def __init__(self):
        self.blocks = []  # (height, draw(im, d, y))

    def text(self, lines, f, fill, gap=4, after=6):
        h = sum(f.size + gap for _ in lines) + after

        def draw(im, d, y):
            for ln in lines:
                d.text((M, y), ln, font=f, fill=fill)
                y += f.size + gap
        self.blocks.append((h, draw))

    def row(self, panels, after=9, gap=16):
        """Panels (image, caption) left to right, wrapping as need be, each caption under its picture."""
        lines, line, x = [], [], 0
        panels = [(pad(im), c) for im, c in panels]
        for p in panels:
            if line and x + p[0].width > W - 2 * M:
                lines.append(line)
                line, x = [], 0
            line.append(p)
            x += p[0].width + gap
        if line:
            lines.append(line)
        for ln in lines:
            capl = [wrap(c, tiny, max(70, im.width)) for im, c in ln]
            hh = max(im.height for im, _ in ln) + 6 + max(len(c) for c in capl) * 16 + after

            def draw(im0, d, y, ln=ln, capl=capl):
                x = M
                base = max(im.height for im, _ in ln)
                for (im, _), cl in zip(ln, capl):
                    im0.paste(im, (x, y + base - im.height))
                    for i, c in enumerate(cl):
                        d.text((x, y + base + 6 + i * 16), c, font=tiny, fill=DIM)
                    x += im.width + gap
            self.blocks.append((hh, draw))

    def rule(self):
        def draw(im, d, y):
            d.line([(M, y + 8), (W - M, y + 8)], fill=(60, 56, 120), width=2)
        self.blocks.append((22, draw))

    def render(self, path):
        h = sum(b[0] for b in self.blocks) + 2 * M
        im = Image.new('RGB', (W, h), BG)
        d = ImageDraw.Draw(im)
        y = M
        for hh, draw in self.blocks:
            draw(im, d, y)
            y += hh
        im.save(path, optimize=True)
        return im.size


s = Sheet()
s.text(['The Warrior’s battle axe and warhammer: three looks each'], big, INK, after=8)
s.text(wrap('Pictures only: how each looks, so you can pick one axe and one hammer. The moves come next, on the one you pick. Each row '
            'is one look: the weapon alone; held by him in his guard, the way he holds his great sword in a dungeon, and on his back in '
            'town; the moment its tap is wound up and held, to show its weight; and how it drops, at its four rarities. Big pictures '
            'are twice the game’s size; the last line of each row is at the game’s own size, from all eight sides he can face. '
            'Every cutting edge and every hammer face now points down. What glows on him is cyan, as on his great sword.', small, W - 2 * M), small, DIM, after=10)
for tid, t in said['takes'].items():
    s.rule()
    kind, letter, key = t['kind'], t['letter'], t['key']
    s.text(['%s %s' % (KIND[kind], letter) + '  ·  ' + t['name'].split(':')[0]], mid, CYAN, after=2)
    s.text(wrap(SAYS[tid], small, W - 2 * M), small, INK, after=10)
    # line 1: alone, close; his guard from three sides; the wind-up held
    row1 = [(alone('%s_alone_0' % tid, 3), 'Alone, three times the game’s size'),
            (alone('%s_alone_50' % tid, 3), 'Turned')]
    for side in ['toward', 'side', 'away']:
        row1.append((figure('%s_guard_%s' % (tid, side), 2), 'His guard, %s' % SIDE_WORDS[side]))
    s.row(row1)
    row2 = [(figure('%s_%s_side' % (tid, key), 2), 'The tap: ' + KEY[key])]
    for side in ['toward', 'side', 'away']:
        row2.append((figure('%s_town_%s' % (tid, side), 2), 'In town, on his back, %s' % SIDE_WORDS[side]))
    s.row(row2)
    row3 = [(slots(tid), 'As it drops: in the bag, Normal, Magic, Rare, Unique (twice the size a phone shows it)'),
            (floor(tid, kind), 'Lying on the floor as the game lays loot, its name over it in its rarity’s colour (twice the game’s size)')]
    s.row(row3)
    # line 4: the game's own size
    row4 = [(figure('%s_guard_%s' % (tid, side), 1, 2), SHORT[side]) for side in EIGHT]
    row4 += [(figure('%s_town_%s' % (tid, side), 1, 2), 'town, ' + SHORT[side]) for side in ['toward', 'side', 'away']]
    row4 += [(figure('%s_%s_%s' % (tid, key, side), 1, 2), ('Cleave' if key == 'cleave' else 'Smash') + ', ' + SHORT[side]) for side in ['side', 'sideL']]
    fly = ['%s_%s_%d' % (tid, 'fly' if kind == 'axe' else 'turn', a) for a in t['flight']]
    row4.append((strip(fly, 1), 'Thrown, spinning flat as it flies' if kind == 'axe' else 'Turned in the hand'))
    s.text(['At the game’s own size: his guard from all eight sides, in town, the tap’s wind-up%s' % (', and thrown' if kind == 'axe' else '')], tiny, INK, after=4)
    s.row(row4, after=8, gap=8)
size = s.render(out)
print(out, size)
