# (MOCK-UP, NOT IN THE GAME) The close-ups on the decorations' sheets: pieces of the stills of
# tools/scenarios/decor.mjs, enlarged, alone or two side by side, each exactly as wide as
# tools/sheet_shots.py lays a picture (1266). See README.md beside this file.
#   python3 docs/mockups/decorations/close_ups.py shots/decor/final shots/decor/final/comp
# The boxes are in the stills' own pixels (844x390 at dpr 3), for the four sets of stills the
# README names (a, b, c, d); other stills want other boxes.
import os
import sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
W = 1266
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
label_font = ImageFont.truetype(B, 26)


def crop(name, box, s):
    im = Image.open(f'{src}/{name}').convert('RGB').crop(box)
    return im.resize((im.width * s, im.height * s), Image.NEAREST)


def pair(left, right, name, labels=None):
    h = max(left.height, right.height)
    im = Image.new('RGB', (W, h), (23, 20, 46))
    im.paste(left, (0, 0))
    im.paste(right, (W - right.width, 0))
    if labels:
        d = ImageDraw.Draw(im)
        for x, text in ((10, labels[0]), (W - right.width + 10, labels[1])):
            d.rectangle((x - 6, 6, x + d.textlength(text, font=label_font) + 6, 42), fill=(23, 20, 46))
            d.text((x, 9), text, font=label_font, fill=(255, 216, 102))
    im.save(f'{out}/{name}')
    print(name, im.size)


def box(cx, cy, w, h):
    return (cx - w // 2, cy - h // 2, cx - w // 2 + w, cy - h // 2 + h)


# 1. the gargoyle and the tapestry, close (the hero near them)
pair(crop('b_room0_after.png', box(1062, 392, 210, 190), 3), crop('b_room0_after.png', box(1488, 402, 210, 190), 3), 'close_wall.png')
# 2. the broken floor, close
im = crop('b_room0_after.png', box(1600, 680, 422, 130), 3)
im.save(f'{out}/close_floor.png')
print('close_floor.png', im.size)
# 3. the shadows at the foot of the barrels and the urns: before and after
pair(crop('a_room0_before.png', box(1336, 872, 315, 230), 2), crop('a_room0_after.png', box(1336, 872, 315, 230), 2), 'close_shadows.png', ('now', 'with shadows'))
# 4. the second room's wall, close: a gargoyle on the lit wall throwing its shadow, the tapestry, the hero in front of it
im = crop('c_room11_after.png', (960, 270, 960 + 633, 270 + 400), 2)
im.save(f'{out}/close_room11.png')
print('close_room11.png', im.size)
# 5. the figure in front of a fire, before and after
pair(crop('d_fire0_plain.png', box(1270, 530, 210, 210), 3), crop('d_fire0_near.png', box(1270, 530, 210, 210), 3), 'close_fire.png', ('now', 'a step darker'))
