# THE NEW DEMONS: THE PICTURES LAID OUT FOR A PHONE HELD SIDEWAYS (the Warlock chat, 11 Nov 2026).
#   python3 tools/demon_new_pics.py <dir of tools/demon_new_pics.ts> <out dir>
# Writes three_new_demons.png (each five times as big) and new_demons_at_game_size.png (three screen pixels a picture
# pixel, as his phone shows the game), each wider than tall (his word of a tall sheet, 9 Nov).
import sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
PLAIN = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
f1 = ImageFont.truetype(BOLD, 44)
f2 = ImageFont.truetype(PLAIN, 30)
f3 = ImageFont.truetype(BOLD, 34)
BG = (24, 26, 56, 255)
CYAN = (40, 220, 240)
TEXT = (205, 210, 238)
NEW = [
    ('pact', 'A. THE PACT MADE FLESH', ['His demon arm grown over all of him:', 'old-blood hide, black horn armour,', 'great crescent horns.']),
    ('pale', 'B. THE PALE CRAWLER', ['Starved and bone-white, no eyes,', 'a mouth from ear to ear, a crown of', 'black thorns, arms dipped in soot.']),
    ('mane', 'C. THE BURNING MANE', ['Dusk-violet, four eyes, sabre fangs,', 'a mane of his cyan hellfire down', 'its neck, back and tail.']),
]
load = lambda n: Image.open(f'{src}/{n}.png').convert('RGBA')

# ---- the three, five times as big
S = 5
box = (112, 170, 258, 314)
cw, ch = (box[2] - box[0]) * S, (box[3] - box[1]) * S
sheet = Image.new('RGBA', (cw * 3 + 40 * 4, ch + 220), BG)
d = ImageDraw.Draw(sheet)
for i, (k, title, lines) in enumerate(NEW):
    x = 40 + i * (cw + 40)
    d.rectangle([x, 84, x + cw, 84 + ch], fill=(30, 33, 68, 255))
    sheet.alpha_composite(load(f'new_{k}_front').crop(box).resize((cw, ch), Image.NEAREST), (x, 84))
    d.text((x, 18), title, font=f1, fill=CYAN)
    for j, l in enumerate(lines):
        d.text((x, 84 + ch + 12 + j * 36), l, font=f2, fill=TEXT)
sheet.convert('RGB').save(f'{out}/three_new_demons.png')

# ---- at the game's own size, beside the game's demon, the Warlock and the Brawler (each on one floor line)
S = 3
W, H, floor = 2480, 900, 700
sh = Image.new('RGBA', (W, H), BG)
d = ImageDraw.Draw(sh)
def put(im, ax, ay, x):
    sh.alpha_composite(im.resize((im.width * S, im.height * S), Image.NEAREST), (x - ax * S, floor - ay * S))
put(load('brawler_front'), 18, 60, 120)
put(load('warlock_front'), 84, 132, 330)
put(load('demon_today_front'), 180, 276, 880)
for i, (k, _, _) in enumerate(NEW):
    put(load(f'new_{k}_front'), 180, 276, 1480 + i * 400)
d.text((40, 20), "AT THE GAME'S OWN SIZE", font=f1, fill=CYAN)
for x, t in [(50, 'Brawler'), (260, 'Warlock'), (640, 'his demon today'), (1420, 'A'), (1820, 'B'), (2220, 'C')]:
    d.text((x, floor + 130), t, font=f3, fill=TEXT)
sh.convert('RGB').save(f'{out}/new_demons_at_game_size.png')
