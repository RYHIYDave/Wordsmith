# THE TOWN'S PEOPLE, NOW AND REDRAWN: a picture of each for a phone held sideways, the two side by side, each half 800x672 cut
# from the game's own picture (eight screen pixels to a game pixel), a hero standing by for size. The stills are made by
# tools/scenarios/townsfolk3_film.mjs with MODE=still, once with OLD=1 and once without, into <stills>/s_<who>[_old].png.
#   python3 tools/townsfolk3_pairs.py <stills> <out dir>
import sys
from PIL import Image, ImageDraw, ImageFont

stills, out_dir = sys.argv[1], sys.argv[2]
FONT = ImageFont.load_default()


def tag(text, color):
    """A label in whole pixels: the default letters, four times as big, on the menus' deep blue."""
    small = Image.new('L', (len(text) * 7 + 6, 13), 0)
    ImageDraw.Draw(small).text((3, 1), text, fill=255, font=FONT)
    big = small.resize((small.width * 4, small.height * 4), Image.NEAREST)
    box = Image.new('RGB', (big.width + 8, big.height + 8), (13, 16, 48))
    box.paste(Image.new('RGB', big.size, color), (4, 4), big)
    return box


NOW = tag('NOW', (233, 236, 255))
NEW = tag('REDRAWN', (40, 220, 240))
for who in ['armourer', 'mystic', 'wordsmith', 'stranger']:
    a = Image.open(f'{stills}/s_{who}_old.png').convert('RGB')
    b = Image.open(f'{stills}/s_{who}.png').convert('RGB')
    x0 = (a.width - 800) // 2
    out = Image.new('RGB', (1608, a.height), (13, 16, 48))
    out.paste(a.crop((x0, 0, x0 + 800, a.height)), (0, 0))
    out.paste(b.crop((x0, 0, x0 + 800, b.height)), (808, 0))
    out.paste(NOW, (0, a.height - NOW.height))
    out.paste(NEW, (808, a.height - NEW.height))
    out.save(f'{out_dir}/{who}_now_and_redrawn.png')
    print(who, out.size)
