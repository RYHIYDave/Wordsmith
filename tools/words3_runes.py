#!/usr/bin/env python3
"""THE WORDS' RUNE STONES, the nine of today, the eight new ones and Mystical (render/words3.ts, a mock-up: not in
the game), painted the way the game paints a rune stone (art/icons.ts, `runeSprite`: a tablet lit from
the upper left, the glyph cut into it in the word's colour with its glowing core, an ink edge), from
the glyphs and colours as they stand in the code, read out of the source files themselves.
   python3 tools/words3_runes.py <out.png>"""
import re
import sys
from PIL import Image, ImageDraw, ImageFont

out = sys.argv[1]
root = __file__.rsplit('/tools/', 1)[0]
pal_src = open(f'{root}/src/art/palette.ts').read()
P = dict(re.findall(r"^\s+(\w+): '(#[0-9a-fA-F]{6})'", pal_src, re.M))
P['white'] = P.get('white', '#ffffff')
icons = open(f'{root}/src/art/icons.ts').read()
w3 = open(f'{root}/src/render/words3.ts').read()


def table(src, name):
    body = re.search(name + r'[^=]*=\s*\{(.*?)\n\};', src, re.S).group(1)
    return body


def glyphs(src, name):
    body = table(src, name)
    return {k: re.findall(r"'([.Xo]+)'", v) for k, v in re.findall(r'^\s+(\w+): \[(.*?)\],?$', body, re.M)}


def colours(src, name):
    body = table(src, name)
    out = {}
    for k, v in re.findall(r'^\s+(\w+): (P\.\w+|\'#[0-9a-fA-F]{6}\')', body, re.M):
        out[k] = P[v[2:]] if v.startswith('P.') else v.strip("'")
    return out


OLD = glyphs(icons, 'const GLYPH')
OLD_C = colours(icons, 'export const WORD_COLOR')
OLD_G = colours(icons, 'const WORD_GLOW')
NEW = glyphs(w3, 'export const NEW_GLYPH')
ramps = dict((k, re.findall(r"'(#[0-9a-fA-F]{6})'", v)) for k, v in re.findall(r'^\s+(\w+): \[(.*?)\],?$', table(w3, 'export const NEW_RAMP'), re.M))
NEW_C = {k: v[3] for k, v in ramps.items()}
NEW_G = {k: v[4] for k, v in ramps.items()}
NAMES = {'power': 'Power', 'swift': 'Swift', 'twin': 'Twin', 'fire': 'Flame', 'frost': 'Frost', 'lightning': 'Lightning', 'leech': 'Leech', 'volatile': 'Volatile', 'poison': 'Poison'}


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rune(rows, colour, glow):
    """art/icons.ts, runeSprite, cell for cell (a 12 x 12 tablet), with its ink edge."""
    tab = ['............', '..11111111..'] + ['.1222222223.'] * 8 + ['..33333333..', '............']
    px = {}
    for y, r in enumerate(tab):
        for x, ch in enumerate(r):
            if ch != '.':
                px[(x, y)] = {'1': P['st6'], '2': P['st5'], '3': P['st3']}[ch]
    n = len(rows)
    on = lambda gx, gy: 0 <= gy < n and 0 <= gx < len(rows[gy]) and rows[gy][gx] != '.'
    for gy in range(n):
        for gx in range(n):
            if not on(gx, gy):
                continue
            if not on(gx, gy - 1):
                px[(3 + gx, 2 + gy)] = P['st3']
            if not on(gx - 1, gy):
                px[(2 + gx, 3 + gy)] = P['st3']
    for gy in range(n):
        for gx in range(n):
            if on(gx, gy):
                px[(3 + gx, 3 + gy)] = glow if rows[gy][gx] == 'o' else colour
    im = Image.new('RGBA', (14, 14), (0, 0, 0, 0))
    for (x, y), c in px.items():
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            if (x + dx, y + dy) not in px:
                im.putpixel((x + dx + 1, y + dy + 1), hexrgb(P['ink']) + (255,))
    for (x, y), c in px.items():
        im.putpixel((x + 1, y + 1), hexrgb(c) + (255,))
    return im


S = 7  # picture pixels to a cell of the stone
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, cap, small = ImageFont.truetype(B, 30), ImageFont.truetype(B, 20), ImageFont.truetype(R, 16)
BG, GOLD, PALE, GREY = (23, 20, 46), (255, 216, 102), (240, 232, 255), (168, 162, 184)
cell = 14 * S
gap = 26
W = 18 * 2 + 9 * cell + 8 * gap
rows = [('TODAY\'S NINE', [(NAMES[k], OLD[k], OLD_C[k], OLD_G[k]) for k in ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison']]),
        ('THE EIGHT HE CHOSE', [(k.capitalize(), NEW[k], NEW_C[k], NEW_G[k]) for k in ['pulling', 'splitting', 'heavy', 'precise', 'hexing', 'stilling', 'frenzied', 'guarding']])]
# (and Mystical, his word for spells, beside Power, his word for attacks: drawn after the eight)
if 'mystical' in NEW:
    rows.append(('MYSTICAL: FOR SPELLS, AS POWER IS FOR ATTACKS', [(NAMES['power'], OLD['power'], OLD_C['power'], OLD_G['power']), ('Mystical', NEW['mystical'], NEW_C['mystical'], NEW_G['mystical'])]))
H = 18 + 44 + 30 + len(rows) * (40 + cell + 60) + 20
sheet = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(sheet)
d.text((18, 14), 'THE WORDS\' RUNE STONES', font=big, fill=GOLD)
d.text((18, 54), 'as the game paints them, much enlarged. The new ones are a mock-up: not in the game.', font=small, fill=GREY)
y = 92
for title, items in rows:
    d.text((18, y), title, font=cap, fill=PALE)
    y += 36
    for i, (name, g, c, gl) in enumerate(items):
        x = 18 + i * (cell + gap)
        sheet.paste(rune(g, c, gl).resize((cell, cell), Image.NEAREST), (x, y), rune(g, c, gl).resize((cell, cell), Image.NEAREST))
        d.text((x + cell // 2, y + cell + 8), name, font=cap, fill=hexrgb(c), anchor='ma')
        d.text((x + cell // 2, y + cell + 32), c, font=small, fill=GREY, anchor='ma')
    y += cell + 64
sheet = sheet.crop((0, 0, W, y))
sheet.save(out)
print(out, sheet.size)
