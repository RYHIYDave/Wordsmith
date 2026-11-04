# FLOORS 8 AND 9 FROM HIS PHONE: the sheet for him (docs/mockups/f8f9_fixes/pictures/f8f9_fixes.png). For each of the three: his
# phone picture beside the game after (F8F9_FIX on, his phone's size), and below them the same place in the game before and a
# close look after; then a wide view of floor 9's stream and its bridges, and of floor 8's canyon.
#   python3 tools/f8f9_sheet.py <his pictures' folder> <shots folder> <out.png>
# (the shots: tools/scenarios/f8f9_look.mjs, FIX=1 to shots/f8f9/after and FIX=0 to shots/f8f9/before)
import sys
from PIL import Image, ImageDraw, ImageFont

his, shots, out = sys.argv[1], sys.argv[2], sys.argv[3]
W = 1200
G = 10
PW = (W - 3 * G) // 2
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
f_title = ImageFont.truetype(BOLD, 30)
f_head = ImageFont.truetype(BOLD, 24)
f_cap = ImageFont.truetype(FONT, 18)
BG = (24, 20, 34)
INK = (236, 230, 220)
DIM = (178, 170, 190)

def phone(path, w=PW, box=None):
    im = Image.open(path).convert('RGB')
    if box:
        im = im.crop(box)
    h = round(im.height * w / im.width)
    return im.resize((w, h), Image.LANCZOS)

def wrap(d, text, font, width):
    words = text.split(' ')
    lines, line = [], ''
    for wd in words:
        t = (line + ' ' + wd).strip()
        if d.textlength(t, font=font) > width and line:
            lines.append(line)
            line = wd
        else:
            line = t
    if line:
        lines.append(line)
    return lines

rows = []  # each: ('title', text) | ('head', text) | ('pair', imgA, capA, imgB, capB) | ('one', img, cap)
rows.append(('title', 'Floors 8 and 9: the bridges, the stronghold door, the canyon walls'))
rows.append(('note', 'Left: your phone picture. Right: the game with the fix, at your phone’s size. Under them: the same place in the game before, and a closer look after.'))

# 1. THE BRIDGES
rows.append(('head', '1. The Pinewood’s bridges'))
rows.append(('pair', phone(f'{his}/floor9_bridges.png'), 'Yours: planks laid tile by tile, slanted to the stream', phone(f'{shots}/after_f9_bridge2_by.png'), 'After: one whole footbridge, square to the stream'))
rows.append(('pair', phone(f'{shots}/before_f9_bridge2_on.png'), 'The same bridge before', phone(f'{shots}/after_f9_bridge2_on.png', box=(700, 370, 1856, 903)), 'After, close: logs under it, planks across, a rail each side'))

# 2. THE STRONGHOLD ENTRANCE
rows.append(('head', '2. Echo Canyon’s stronghold entrance'))
rows.append(('pair', phone(f'{his}/floor8_stronghold_entrance.png'), 'Yours: the door floating, the plateau over it', phone(f'{shots}/after_f8_hold1.png'), 'After: the door cut into the canyon wall'))
rows.append(('pair', phone(f'{shots}/before_f8_hold1.png'), 'The same stronghold before', phone(f'{shots}/after_f8_hold1.png', box=(980, 40, 1980, 501)), 'After, close: stone frame, the door set back in the rock'))

# 3. THE CANYON WALLS
rows.append(('head', '3. Echo Canyon’s walls'))
rows.append(('pair', phone(f'{his}/floor8_canyon_walls.png'), 'Yours: where the plateau juts out, no wall below it', phone(f'{shots}/after_f8_walls3.png'), 'After: the wall drawn down to the canyon floor'))
rows.append(('pair', phone(f'{shots}/before_f8_walls0.png'), 'Another place before: the far wall lost', phone(f'{shots}/after_f8_walls0.png'), 'The same place after: the wall all the way down'))

# THE WIDE VIEWS
rows.append(('head', 'Wider: floor 9’s stream and three of its bridges'))
rows.append(('one', phone(f'{shots}/after_f9_wide.png', w=W - 2 * G), 'Each bridge turned to the stream where it crosses it.'))
rows.append(('head', 'Wider: floor 8’s canyon'))
rows.append(('one', phone(f'{shots}/after_f8_wide.png', w=W - 2 * G), 'Walls on both sides wherever a cliff faces you.'))

scratch = ImageDraw.Draw(Image.new('RGB', (10, 10)))
H = G
for r in rows:
    if r[0] == 'title':
        H += 46
    elif r[0] == 'note':
        H += 26 * len(wrap(scratch, r[1], f_cap, W - 2 * G)) + 12
    elif r[0] == 'head':
        H += 44
    elif r[0] == 'pair':
        H += max(r[1].height, r[3].height) + 30 + G
    else:
        H += r[1].height + 30 + G
sheet = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(sheet)
y = G
for r in rows:
    if r[0] == 'title':
        d.text((G, y), r[1], font=f_title, fill=INK)
        y += 46
    elif r[0] == 'note':
        for ln in wrap(d, r[1], f_cap, W - 2 * G):
            d.text((G, y), ln, font=f_cap, fill=DIM)
            y += 26
        y += 12
    elif r[0] == 'head':
        y += 8
        d.text((G, y), r[1], font=f_head, fill=INK)
        y += 36
    elif r[0] == 'pair':
        _, a, ca, b, cb = r
        sheet.paste(a, (G, y))
        sheet.paste(b, (2 * G + PW, y))
        hh = max(a.height, b.height)
        d.text((G, y + hh + 4), ca, font=f_cap, fill=DIM)
        d.text((2 * G + PW, y + hh + 4), cb, font=f_cap, fill=DIM)
        y += hh + 30 + G
    else:
        _, a, ca = r
        sheet.paste(a, (G, y))
        d.text((G, y + a.height + 4), ca, font=f_cap, fill=DIM)
        y += a.height + 30 + G
sheet.save(out)
print(out, sheet.size)
