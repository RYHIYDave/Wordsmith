#!/usr/bin/env python3
# frame_compose.py <photo.png> <frame.png> <out.png> [options]
# THE PICTURE OF A DUNGEON'S SHAPE, FOR HIM (his yes by 18:28, 9 Oct 2026: "Yes, after 19.9
# (Recommended)"): a view of the game above (tools/scenarios/frame_photo.mjs), the same view in plain
# lines below (src/dev/preview_frame.ts, its "cam" view: the two are the same size and line up), and
# the key under them. The counts are the page's [log] lines, given here:
#   --depth 3            the dungeon's number
#   --here 4,18,2,16     shown: wide stretches, their tiles of wall, single tiles, places on the floor
#   --whole 45,276,13,222  the whole dungeon: the same four
#   --standing "braziers (boxes), rubble (a cross)"   what stands in the view today
#   --door "the barred door into the lower room"      the doorway in the view (left out if not given)
# Example (the picture of 9 Oct):
#   python3 tools/frame_compose.py shots/frame/photo_view.png shots/frame/cam.png previews/dungeon_shape.png \
#     --depth 3 --here 4,18,2,16 --whole 45,276,13,222 --standing "braziers (boxes), rubble (a cross)" \
#     --door "the barred door into the lower room"
import argparse
from PIL import Image, ImageDraw, ImageFont

ap = argparse.ArgumentParser()
ap.add_argument('photo'); ap.add_argument('frame'); ap.add_argument('out')
ap.add_argument('--depth', type=int, default=3)
ap.add_argument('--here', required=True)
ap.add_argument('--whole', required=True)
ap.add_argument('--standing', default='barrels, urns, braziers, pillars (boxes); bones, rubble (crosses)')
ap.add_argument('--door', default='')
a = ap.parse_args()
wide, wide_tiles, single, floor = (int(v) for v in a.here.split(','))
w_wide, w_tiles, w_single, w_floor = (int(v) for v in a.whole.split(','))

REG = '/usr/share/fonts/opentype/inter/Inter-Regular.otf'
BOLD = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'
f_title = ImageFont.truetype(BOLD, 36)
f_sub = ImageFont.truetype(REG, 22)
f_label = ImageFont.truetype(BOLD, 21)
f_key = ImageFont.truetype(REG, 21)
# the page's own colours (src/dev/preview_frame.ts C): none of them the game's glows
BG = (17, 19, 42); TEXT = (233, 236, 255); MUTED = (163, 171, 216); EDGE = (52, 58, 120)
GREEN = (120, 223, 138); VIOLET = (185, 140, 255); BLUE = (125, 177, 255); GREY = (158, 164, 189); WHITE = (255, 255, 255)

P = Image.open(a.photo).convert('RGB')
# (the page's screenshot can run a few pixels past its canvas: cut it to the photo's size)
F = Image.open(a.frame).convert('RGB').crop((0, 0) + P.size)
pw, ph = P.size
M = 24
W = pw + 2 * M


def wrap(d, text, font, width):
    words = text.split(' '); lines = []; cur = ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) <= width: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines


def n(k, one, many):
    return f'{k} {one if k == 1 else many}'


scratch = ImageDraw.Draw(Image.new('RGB', (10, 10)))
title = 'The shape of a dungeon'
sub = (f'Dungeon {a.depth}, as the game laid it for one run (every run lays its own). Above, a view of it in the game; '
       'below, the same view in plain lines, from the game’s own map, with the places marked where a decoration fits.')
sub_lines = wrap(scratch, sub, f_sub, pw)
key = [
    (GREEN, 'fill', f'Wall two tiles wide or more: a banner, a tapestry, a row of shields. Here: {n(wide, "stretch", "stretches")}, {n(wide_tiles, "tile", "tiles")} of wall.'),
    (VIOLET, 'fill', f'Wall one tile wide: a torch, a small gargoyle head. Here: {single}.'),
    (BLUE, 'fill', f'Floor along a back wall, out of the way: bones, rubble, a statue, a pillar. Here: {floor}.'),
    (GREY, 'line', f'What stands there today: {a.standing}.'),
    (WHITE, 'line', (f'A doorway: {a.door}. ' if a.door else '') + 'Dashed: the top of a wall, where it fades into the dark.'),
    (MUTED, 'none', 'Not marked: walls behind a raised floor (they are shorter), and anywhere within a tile of a doorway, a lever or a trap.'),
    (MUTED, 'none', f'In the whole of this dungeon the game finds {w_wide} stretches of wall like the green ones ({w_tiles} tiles of wall), {w_single} like the violet ones and {w_floor} places on the floor.'),
]
key_lines = [(c, kind, wrap(scratch, t, f_key, pw - 34)) for c, kind, t in key]
LH = 29
head_h = M + 44 + len(sub_lines) * 30 + 18
label_h = 34
key_h = sum(len(ls) * LH + 8 for _, _, ls in key_lines) + M
H = head_h + label_h + ph + 22 + label_h + ph + 18 + key_h
im = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(im)
y = M
d.text((M, y), title, font=f_title, fill=TEXT); y += 50
for line in sub_lines:
    d.text((M, y), line, font=f_sub, fill=MUTED); y += 30
y = head_h
d.text((M, y), 'IN THE GAME TODAY', font=f_label, fill=TEXT); y += label_h
im.paste(P, (M, y)); d.rectangle([M - 1, y - 1, M + pw, y + ph], outline=EDGE, width=1); y += ph + 22
d.text((M, y), 'THE SAME VIEW IN PLAIN LINES', font=f_label, fill=TEXT); y += label_h
im.paste(F, (M, y)); d.rectangle([M - 1, y - 1, M + pw, y + ph], outline=EDGE, width=1); y += ph + 18
for c, kind, ls in key_lines:
    if kind == 'fill':
        d.rectangle([M, y + 6, M + 20, y + 22], fill=tuple(int(v * 0.8 + b * 0.2) for v, b in zip(c, BG)), outline=c)
    elif kind == 'line':
        d.rectangle([M + 2, y + 6, M + 18, y + 22], outline=c, width=2)
    for k, line in enumerate(ls):
        d.text((M + (34 if kind != 'none' else 0), y + k * LH), line, font=f_key, fill=TEXT if kind != 'none' else MUTED)
    y += len(ls) * LH + 8
im = im.crop((0, 0, W, y + M - 8))
im.save(a.out)
print(a.out, im.size)
