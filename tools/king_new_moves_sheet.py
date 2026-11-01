#!/usr/bin/env python3
"""THE KING'S NEW MOVES, the sheet for the owner's phone (1200 wide): key frames of each, captioned.
   npx tsx tools/king_new_moves.ts sheet <panels dir>; python3 tools/king_new_moves_sheet.py <panels dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small, tag = ImageFont.truetype(B, 30), ImageFont.truetype(R, 21), ImageFont.truetype(B, 18)
BG, TITLE, LINE, TAG = (12, 10, 20), (240, 232, 208), (200, 194, 220), (255, 240, 200)
W = 1200
ROWS = [
    ('THE CHARGE (his basic, in place of the sweep)', 'He sets himself, the sword dragged back (held); bursts off his mark in two frames; runs 9 tiles at 12 a second, the blade cutting a line of sparks; it bursts.',
     [('charge_0', 'the warning, held'), ('charge_1', 'away: two frames'), ('charge_2', 'the run, the line cut'), ('charge_3', 'the line bursts')], 2),
    ('THE CROWN’S WEIGHT (in place of the leap)', 'Sent up off his head, grown huge; follows the knight, its shadow and the pink ring under it; stops and hangs (held); slams in two frames; flies home.',
     [('weight_0', 'sent up off his head'), ('weight_1', 'following the knight'), ('weight_2', 'held: the ring closes'), ('weight_3', 'slammed: two frames'), ('weight_4', 'lying, ringing'), ('weight_5', 'flying home')], 3),
    ('THE HUSH: GRAB AND DRAG', 'It rears back (held); its arms shoot out 8 tiles, catch the knight, and drag him back before the King.',
     [('grab_0', 'rearing back, held'), ('grab_1', 'its arms shooting out'), ('grab_2', 'caught'), ('grab_3', 'dragged in before the King')], 2),
    ('THE HUSH: SHIELD', 'It goes to him and wraps itself round him: nothing hurts him; struck off, it is flung back to his side, dazed.',
     [('shield_0', 'going to him'), ('shield_1', 'wrapped round him'), ('shield_2', 'struck off'), ('shield_3', 'dazed at his side')], 4),
    ('THE HUSH: GREY FOG', 'It draws in a breath (the places marked); breathes it out: three patches lie 7 s, slowing you; then thin and go.',
     [('fog_0', 'breath held: the marks'), ('fog_1', 'breathed out'), ('fog_2', 'lying'), ('fog_3', 'thinning, its last second')], 2),
]
blocks = []
for title, line, panels, per in ROWS:
    ims = [(Image.open(os.path.join(src, f + '.png')).convert('RGB'), t) for f, t in panels]
    pw = W // per
    rows = [ims[i:i + per] for i in range(0, len(ims), per)]
    ph = max(im.height for im, _ in ims)
    band = 96
    card = Image.new('RGB', (W, band + ph * len(rows)), BG)
    d = ImageDraw.Draw(card)
    d.text((16, 10), title, font=big, fill=TITLE)
    words, ln = line.split(), ['']
    for w in words:
        if d.textlength((ln[-1] + ' ' + w).strip(), font=small) > W - 32:
            ln.append('')
        ln[-1] = (ln[-1] + ' ' + w).strip()
    for i, l in enumerate(ln[:2]):
        d.text((16, 46 + 24 * i), l, font=small, fill=LINE)
    for r, row in enumerate(rows):
        for c, (im, t) in enumerate(row):
            x = c * pw + (pw - im.width) // 2
            y = band + r * ph
            card.paste(im, (x, y))
            d.rectangle([x, y, x + im.width - 1, y + im.height - 1], outline=(60, 54, 80))
            tw = d.textlength(t, font=tag)
            d.rectangle([x + 6, y + 6, x + 14 + tw, y + 30], fill=(7, 6, 12))
            d.text((x + 10, y + 8), t, font=tag, fill=TAG)
    blocks.append(card)
sheet = Image.new('RGB', (W, sum(b.height for b in blocks)), BG)
y = 0
for b in blocks:
    sheet.paste(b, (0, y))
    y += b.height
sheet.save(out, optimize=True)
print(out, sheet.size)
