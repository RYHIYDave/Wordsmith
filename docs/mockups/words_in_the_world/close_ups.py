# (MOCK-UP, NOT IN THE GAME) The close-ups on the words-in-the-world sheet: pieces of the stills of
# tools/scenarios/words_world.mjs, enlarged two times, today's beside the mock-up's, each pair as wide
# as tools/sheet_shots.py lays a picture (1266). See README.md beside this file.
#   python3 docs/mockups/words_in_the_world/close_ups.py shots/words/c <out>
# The boxes are in the stills' own pixels (844x390 at dpr 3), for the stills the README names.
import os
import sys
from PIL import Image, ImageDraw, ImageFont

pre, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
W = 1266
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)


def crop(name, box, s=2):
    im = Image.open(f'{pre}_{name}.png').convert('RGB').crop(box)
    return im.resize((im.width * s, im.height * s), Image.NEAREST)


def pair(left, right, name, labels):
    h = max(left.height, right.height)
    im = Image.new('RGB', (W, h), (23, 20, 46))
    im.paste(left, (0, 0))
    im.paste(right, (W - right.width, 0))
    d = ImageDraw.Draw(im)
    for x, text in ((10, labels[0]), (W - right.width + 10, labels[1])):
        d.rectangle((x - 6, 6, x + d.textlength(text, font=font) + 6, 42), fill=(23, 20, 46))
        d.text((x, 9), text, font=font, fill=(255, 216, 102))
    im.save(f'{out}/{name}')
    print(name, im.size)


pair(crop('now', (1400, 470, 1716, 760)), crop('ring_rise_plain', (1400, 470, 1716, 760)), 'monster.png', ('today', 'written in its word'))
pair(crop('now', (1080, 410, 1396, 690)), crop('ring_rise_plain', (1080, 410, 1396, 690)), 'blade.png', ('today', 'the word rising'))
pair(crop('ring_rise_plain', (1420, 140, 1736, 350)), crop('ring_rise_glow', (1420, 140, 1736, 350)), 'carved.png', ('cut in the stone', 'cut and glowing'))
