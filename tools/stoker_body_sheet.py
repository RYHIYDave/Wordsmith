#!/usr/bin/env python3
"""THE STOKER'S BODY, BEFORE AND NOW, for the owner's phone (art/stoker.ts; a mock-up, not in the game): the pieces
tools/stoker_pics.ts painted (`body <dir>`) once on his body as it was and once as it is, side by side, 1200 wide, each with
its caption: from in front, from behind and from the side, three times the game's size; at the game's size; moments of his moves.
   python3 tools/stoker_body_sheet.py <before dir> <now dir> <out.png>"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

before, now, out = sys.argv[1], sys.argv[2], sys.argv[3]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
W = 1200
BG, PALE, GREY, CARD = (20, 19, 26), (236, 232, 240), (176, 172, 188), (26, 24, 30)
big, small, tag = ImageFont.truetype(B, 30), ImageFont.truetype(R, 22), ImageFont.truetype(B, 20)
spec = json.load(open(os.path.join(now, 'body.json')))


def wrap(d, text, font, width):
    words, lines, line = text.split(), [], ''
    for w in words:
        t = (line + ' ' + w).strip()
        if d.textlength(t, font=font) > width and line:
            lines.append(line)
            line = w
        else:
            line = t
    if line:
        lines.append(line)
    return lines


def bbox(ims):
    """The smallest box holding all of what is painted on these pictures (each on the same dark)."""
    x0 = y0 = 10 ** 9
    x1 = y1 = -1
    for im in ims:
        px = im.load()
        w, h = im.size
        for y in range(h):
            for x in range(w):
                p = px[x, y]
                if abs(p[0] - CARD[0]) + abs(p[1] - CARD[1]) + abs(p[2] - CARD[2]) > 12:
                    x0, x1, y0, y1 = min(x0, x), max(x1, x), min(y0, y), max(y1, y)
    return x0, y0, x1 + 1, y1 + 1


def pair(name, k, cw=None):
    """Before and now of one piece, cut alike (to the box that holds both, `cw` wide if given) and `k` times as big, side by side."""
    a = Image.open(os.path.join(before, name)).convert('RGB')
    b = Image.open(os.path.join(now, name)).convert('RGB')
    x0, y0, x1, y1 = bbox([a, b])
    y0, y1 = max(0, y0 - 6), min(a.size[1], y1 + 6)
    if cw:
        mid = (x0 + x1) // 2
        x0, x1 = mid - cw // 2, mid - cw // 2 + cw
    else:
        x0, x1 = max(0, x0 - 6), min(a.size[0], x1 + 6)
    box = (x0, y0, x1, y1)

    def cut(im):
        # (cut to the box, the dark laid where the box runs past the picture)
        o = Image.new('RGB', (x1 - x0, y1 - y0), CARD)
        o.paste(im.crop((max(0, x0), y0, min(im.size[0], x1), y1)), (max(0, -x0), 0))
        return o
    a, b = cut(a), cut(b)
    cw2, ch = a.size
    o = Image.new('RGB', (cw2 * 2, ch), CARD)
    o.paste(a, (0, 0))
    o.paste(b, (cw2, 0))
    return o.resize((o.size[0] * k, o.size[1] * k), Image.NEAREST)


def card(title, note, im, labels=()):
    probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    lines = wrap(probe, note, small, W - 48)
    head = 24 + 38 + 28 * len(lines) + 14
    if im.size[0] < W:
        pad = Image.new('RGB', (W, im.size[1]), CARD)
        pad.paste(im, ((W - im.size[0]) // 2, 0))
        im = pad
    c = Image.new('RGB', (W, head + im.size[1]), BG)
    d = ImageDraw.Draw(c)
    d.text((24, 18), title, font=big, fill=PALE)
    for i, line in enumerate(lines):
        d.text((24, 60 + 28 * i), line, font=small, fill=GREY)
    c.paste(im, (0, head))
    for x, y, text in labels:
        tw = d.textlength(text, font=tag)
        d.rectangle([x - 4, head + y - 2, x + tw + 6, head + y + 26], fill=(14, 13, 18))
        d.text((x + 1, head + y), text, font=tag, fill=PALE)
    return c


def stack(*ims):
    w = max(i.size[0] for i in ims)
    o = Image.new('RGB', (w, sum(i.size[1] for i in ims)), CARD)
    y = 0
    for i in ims:
        o.paste(i, ((w - i.size[0]) // 2, y))
        y += i.size[1]
    return o


cards = []
# 1-3. STANDING, THREE TIMES THE GAME'S SIZE: before (left), now (right); each half 600 wide, 200 of the game's pixels
for name, title, note in [
    ('stand_front.png', 'HIS BODY RESHAPED · FROM IN FRONT', 'Three times the game’s size; before (left), now (right). No tubes and no balls: a great deltoid under a riveted pauldron of overlapping plates, the upper arm swelling under its leather wraps and an iron band, a hinged couter at the elbow, the forearm thick at the top and narrowing into its vambrace, heavy gauntleted fists round the haft. The helm shaped: a crown and crest, a heavy brow, a jaw jutting with the grille, sunk on a thick gorget between his shoulders.'),
    ('stand_back.png', 'FROM BEHIND', 'Before (left), now (right). The pauldrons’ lames shingled down each arm, the couters, the crest over his crown; his thighs under the skirt (laid over them, so nothing comes through it), the calves swelling into the iron boots.'),
    ('stand_side.png', 'FROM THE SIDE (HIS RIGHT, THE SHOVEL’S)', 'Before (left), now (right): truly turned, not flipped. Top-heavy: the shoulders high and broad, the head sunk between them; the knee under its poleyn; the boot shaped with its toe and its heel.'),
]:
    im = pair(name, 3, cw=200)
    cards.append(card(title, note, im, [(10, 6, 'before'), (610, 6, 'now')]))
# 4. AT THE GAME'S SIZE: before and now, from in front and from behind, one of his pixels to one of the game's
if True:
    a = pair('stand_front.png', 1, cw=290)
    b = pair('stand_back.png', 1, cw=290)
    row = Image.new('RGB', (a.size[0] + b.size[0], max(a.size[1], b.size[1])), CARD)
    row.paste(a, (0, 0))
    row.paste(b, (a.size[0], 0))
    cards.append(card('AT THE GAME’S OWN SIZE', 'From in front, then from behind: before, now; before, now. As big as the game paints him: the plated shoulders, the arms swelling and narrowing, the helm sunk between his shoulders, the shaped knees and boots.', row, [(10, 6, 'before'), (300, 6, 'now'), (590, 6, 'before'), (880, 6, 'now')]))
# 5. MOMENTS OF HIS MOVES, before and now (his moves themselves unchanged), twice the game's size
for i, (move, t, say) in enumerate(spec['moments']):
    im = pair(f'm{i}_{move}.png', 2, cw=300)
    title = 'HIS MOVES, BEFORE AND NOW: ' + say.upper() if i == 0 else say.upper()
    note = 'Twice the game’s size, from in front; before (left), now (right). His moves, their timing and their poses are as they were: only his body is reshaped.' if i == 0 else f'{move} at {t} s; before (left), now (right).'
    cards.append(card(title, note, im, [(10, 6, 'before'), (610, 6, 'now')]))
H = sum(c.size[1] for c in cards)
sheet = Image.new('RGB', (W, H), BG)
y = 0
for c in cards:
    sheet.paste(c, (0, y))
    y += c.size[1]
sheet.save(out, optimize=True)
print(out, sheet.size, round(os.path.getsize(out) / 1e6, 2), 'MB')
