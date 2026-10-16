#!/usr/bin/env python3
"""THE TEN MELDED WORDS' RUNE STONES (render/melds3.ts, MELD_GLYPH and MELD_RAMP; a mock-up behind
MELD3, off: not in the game), each beside the two words it is melded from, painted the way the game
paints a rune stone (art/icons.ts, `runeSprite`: a tablet lit from the upper left, the glyph cut into
it in the word's colour with its glowing core, an ink edge), read out of the source files themselves.
   python3 tools/meld_runes.py <out.png> [stones dir]
With a stones dir, each stone alone as well, for a page: rune_<word>.png (8 picture pixels to the
stone's pixel) and part_<word>.png for the five words they are melded from (4 to one)."""
import re
import sys
from PIL import Image, ImageDraw, ImageFont

out = sys.argv[1]
root = __file__.rsplit('/tools/', 1)[0]
P = dict(re.findall(r"^\s+(\w+): '(#[0-9a-fA-F]{6})'", open(f'{root}/src/art/palette.ts').read(), re.M))
P['white'] = P.get('white', '#ffffff')
icons = open(f'{root}/src/art/icons.ts').read()
m3 = open(f'{root}/src/render/melds3.ts').read()


def table(src, name):
    return re.search(name + r'[^=]*=\s*\{(.*?)\n\};', src, re.S).group(1)


def glyphs(src, name):
    return {k: re.findall(r"'([.Xo]+)'", v) for k, v in re.findall(r'^\s+(\w+): \[(.*?)\],?$', table(src, name), re.M)}


def colours(src, name):
    out = {}
    for k, v in re.findall(r'^\s+(\w+): (P\.\w+|\'#[0-9a-fA-F]{6}\')', table(src, name), re.M):
        out[k] = P[v[2:]] if v.startswith('P.') else v.strip("'")
    return out


OLD = glyphs(icons, 'export const GLYPH')
OLD_C = colours(icons, 'export const WORD_COLOR')
OLD_G = colours(icons, 'export const WORD_GLOW')
NEW = glyphs(m3, 'export const MELD_GLYPH')
RAMP = {k: re.findall(r"'(#[0-9a-fA-F]{6})'", v) for k, v in re.findall(r'^\s+(\w+): \[(.*?)\],?$', table(m3, 'export const MELD_RAMP'), re.M)}
IS = dict(re.findall(r"^\s+(\w+): '(.*?)',$", table(m3, 'export const MELD_GLYPH_IS'), re.M))
NAMES = {'power': 'Power', 'fire': 'Flame', 'frost': 'Frost', 'lightning': 'Lightning', 'poison': 'Poison'}
MELDS = [('eruption', 'power', 'fire'), ('avalanche', 'power', 'frost'), ('thunder', 'power', 'lightning'), ('blight', 'power', 'poison'),
         ('scald', 'fire', 'frost'), ('wildfire', 'fire', 'lightning'), ('fumes', 'fire', 'poison'), ('hailstorm', 'frost', 'lightning'),
         ('frostbite', 'frost', 'poison'), ('contagion', 'lightning', 'poison')]


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rune(rows, colour, glow, pips=None):
    """art/icons.ts, runeSprite, cell for cell (a 12 x 12 tablet), with its ink edge; a melded word's
    stone carries its two words' colours along its foot (`pips`), as the game paints it."""
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
    if pips:
        for x in (2, 3, 4):
            px[(x, 10)] = pips[0]
        for x in (7, 8, 9):
            px[(x, 10)] = pips[1]
    im = Image.new('RGBA', (14, 14), (0, 0, 0, 0))
    for (x, y), c in px.items():
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            if (x + dx, y + dy) not in px:
                im.putpixel((x + dx + 1, y + dy + 1), hexrgb(P['ink']) + (255,))
    for (x, y), c in px.items():
        im.putpixel((x + 1, y + 1), hexrgb(c) + (255,))
    return im


def stone(rows, colour, glow, size, pips=None):
    return rune(rows, colour, glow, pips).resize((size, size), Image.NEAREST)


B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, name_f, part_f, small = ImageFont.truetype(B, 30), ImageFont.truetype(B, 28), ImageFont.truetype(B, 15), ImageFont.truetype(R, 17)
BG, GOLD, PALE, GREY, PANEL = (23, 20, 46), (255, 216, 102), (240, 232, 255), (168, 162, 184), (32, 28, 64)
SMALL, BIG = 14 * 4, 14 * 8
W = 900
ROW = BIG + 28
H = 100 + len(MELDS) * (ROW + 10) + 10
sheet = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(sheet)
d.text((18, 14), 'THE TEN MELDED WORDS\' RUNE STONES', font=big, fill=GOLD)
d.text((18, 54), 'as the game paints them, much enlarged; each beside the two it is melded from.', font=small, fill=GREY)
d.text((18, 76), 'A mock-up: not in the game.', font=small, fill=GREY)
y = 108
for meld, a, b in MELDS:
    d.rounded_rectangle((10, y, W - 10, y + ROW), radius=8, fill=PANEL)
    cy = y + ROW // 2
    x = 24
    for i, part in enumerate((a, b)):
        s = stone(OLD[part], OLD_C[part], OLD_G[part], SMALL)
        sheet.paste(s, (x, cy - SMALL // 2 - 8), s)
        d.text((x + SMALL // 2, cy + SMALL // 2 - 4), NAMES[part], font=part_f, fill=hexrgb(OLD_C[part]), anchor='ma')
        x += SMALL + 14
        if i == 0:
            d.text((x + 2, cy - 8), '+', font=name_f, fill=GREY, anchor='mm')
            x += 22
    d.text((x + 8, cy - 8), '=', font=name_f, fill=GREY, anchor='mm')
    x += 30
    C = RAMP[meld]
    s = stone(NEW[meld], C[3], C[4], BIG, (OLD_C[a], OLD_C[b]))
    sheet.paste(s, (x, y + (ROW - BIG) // 2), s)
    x += BIG + 18
    d.text((x, cy - 30), meld.upper(), font=name_f, fill=hexrgb(C[3]), anchor='ls')
    d.text((x, cy + 2), IS[meld], font=small, fill=PALE, anchor='ls')
    # its colours, darkest to white-hot, as its looks use them
    for j, c in enumerate(C):
        d.rectangle((x + j * 26, cy + 14, x + j * 26 + 22, cy + 32), fill=hexrgb(c))
    y += ROW + 10
sheet = sheet.crop((0, 0, W, y))
sheet.save(out)
print(out, sheet.size)
if len(sys.argv) > 2:
    import os
    os.makedirs(sys.argv[2], exist_ok=True)
    for meld, a, b in MELDS:
        C = RAMP[meld]
        stone(NEW[meld], C[3], C[4], BIG, (OLD_C[a], OLD_C[b])).save(os.path.join(sys.argv[2], f'rune_{meld}.png'))
    for part in NAMES:
        stone(OLD[part], OLD_C[part], OLD_G[part], SMALL).save(os.path.join(sys.argv[2], f'part_{part}.png'))
    print('stones in', sys.argv[2])
