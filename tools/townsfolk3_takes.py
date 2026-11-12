# THE MYSTIC'S HEAD, TAKES TO PICK FROM: the same place in the game's own town with each take of his head
# (dev/sculpt_townsfolk.ts MYSTIC_HEAD), side by side, a letter under each, eight screen pixels to a game pixel. The stills
# are made by tools/scenarios/townsfolk3_film.mjs with WHO=mystic MODE=still TAKE=<n> into <stills>/s_mystic_take<n>.png.
#   python3 tools/townsfolk3_takes.py <stills> <out.png> 1,2,3,4
import sys
from PIL import Image, ImageDraw, ImageFont

stills, out, takes = sys.argv[1], sys.argv[2], [int(k) for k in sys.argv[3].split(',')]
FONT = ImageFont.load_default()


def tag(text, color):
    small = Image.new('L', (len(text) * 7 + 6, 13), 0)
    ImageDraw.Draw(small).text((3, 1), text, fill=255, font=FONT)
    big = small.resize((small.width * 6, small.height * 6), Image.NEAREST)
    box = Image.new('RGB', (big.width + 8, big.height + 8), (13, 16, 48))
    box.paste(Image.new('RGB', big.size, color), (4, 4), big)
    return box


W = 400
sheet = Image.new('RGB', (len(takes) * (W + 4) - 4, 560), (13, 16, 48))
for i, k in enumerate(takes):
    im = Image.open(f'{stills}/s_mystic_take{k}.png').convert('RGB')
    # (the mystic stands right of the picture's middle, his head near its top third)
    sheet.paste(im.crop((560, 40, 560 + W, 600)), (i * (W + 4), 0))
    t = tag('ABCDEFGH'[i], (40, 220, 240))
    sheet.paste(t, (i * (W + 4), 560 - t.height))
sheet.save(out)
print(out, sheet.size)
