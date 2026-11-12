# THE NEW DEMONS: THE PICTURES LAID OUT FOR A PHONE HELD SIDEWAYS (the Warlock chat, 11 Nov 2026).
#   python3 tools/demon_new_pics.py <dir of tools/demon_new_pics.ts> <out dir>
#   python3 tools/demon_new_pics.py <dir> <out dir> ideas     (the ten quick ideas: ten_ideas_1_to_5.png, ten_ideas_6_to_10.png)
#   python3 tools/demon_new_pics.py <dir> <out dir> shadow    (the Living Shadow, his pick: living_shadow.png, living_shadow_at_game_size.png)
# Writes new_demons_on_two_legs.png and new_demons_running.png (each four times as big) and new_demons_at_game_size.png
# (three screen pixels a picture pixel, as his phone shows the game), each wider than tall (his word of a tall sheet, 9 Nov).
import sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
PLAIN = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
f1 = ImageFont.truetype(BOLD, 44)
f2 = ImageFont.truetype(PLAIN, 30)
f3 = ImageFont.truetype(BOLD, 34)
BG = (24, 26, 56, 255)
PANEL = (30, 33, 68, 255)
CYAN = (40, 220, 240)
TEXT = (205, 210, 238)
NEW = [
    ('pact', 'A. THE PACT MADE FLESH', ['His demon arm grown over all of him:', 'old-blood hide, black horn armour,', 'great crescent horns.']),
    ('pale', 'B. THE PALE CRAWLER', ['Bone-white, no eyes, a mouth from', 'ear to ear, a crown of black thorns,', 'arms and legs dipped in soot.']),
    ('mane', 'C. THE BURNING MANE', ['Dusk-violet, four eyes, sabre fangs,', 'a mane of his cyan hellfire down', 'its neck, back and tail.']),
]
load = lambda n: Image.open(f'{src}/{n}.png').convert('RGBA')

IDEAS = [
    ('1. YOURS, REBUILT', ['The demon you have, on the', 'new frame, with wings.']),
    ('2. THE HORNED OWL', ['Feathers, a hooked beak,', 'great round eyes.']),
    ('3. THE SCALED', ['A long snout of teeth,', 'scales, a heavy tail.']),
    ('4. THE MANY-EYED', ["A spider's face: eight", 'eyes, two great fangs.']),
    ('5. THE ONE EYE', ['One burning eye, tusks,', 'horns hooked down.']),
    ('6. THE LIVING SHADOW', ['Pure black. Only its eyes,', 'grin and claws burn.']),
    ('7. THE SPLIT FACE', ['Its mouth runs up its', 'face. Six eyes.']),
    ('8. THE GARGOYLE', ['Cracked stone, a square', 'jaw, wings like a cloak.']),
    ('9. THE ANGLER', ['Needle teeth, a fin, his', 'fire as its lure.']),
    ('10. THE OBSIDIAN', ['Black glass in facets,', 'a crown of shards.']),
]


def ideas():
    """The ten quick ideas, five a picture, three times as big, each in a panel of one size."""
    S = 3
    ims = [load(f'idea_{n}_up_front') for n in range(1, 11)]
    bs = [i.getbbox() for i in ims]
    box = (min(b[0] for b in bs) - 3, min(b[1] for b in bs) - 3, max(b[2] for b in bs) + 3, max(b[3] for b in bs) + 3)
    cw, ch = (box[2] - box[0]) * S, (box[3] - box[1]) * S
    for part, name in ((0, 'ten_ideas_1_to_5'), (5, 'ten_ideas_6_to_10')):
        sheet = Image.new('RGBA', (cw * 5 + 24 * 6, ch + 80 + 110), BG)
        d = ImageDraw.Draw(sheet)
        for i in range(5):
            title, says = IDEAS[part + i]
            x = 24 + i * (cw + 24)
            d.rectangle([x, 70, x + cw, 70 + ch], fill=PANEL)
            sheet.alpha_composite(ims[part + i].crop(box).resize((cw, ch), Image.NEAREST), (x, 70))
            d.text((x, 14), title, font=f3, fill=CYAN)
            for j, l in enumerate(says):
                d.text((x, 70 + ch + 10 + j * 36), l, font=f2, fill=TEXT)
        sheet.convert('RGB').save(f'{out}/{name}.png')


def shadow():
    """The Living Shadow: up on two legs and running, from in front and from behind, four times as big; and at the game's size."""
    S = 4
    views = [('shadow_up_front', 'up on two legs'), ('shadow_up_back', 'from behind'), ('shadow_run_front', 'running on all fours'), ('shadow_run_back', 'from behind')]
    ims = [load(n) for n, _ in views]
    bs = [i.getbbox() for i in ims]
    box = (min(b[0] for b in bs) - 3, min(b[1] for b in bs) - 3, max(b[2] for b in bs) + 3, max(b[3] for b in bs) + 3)
    cw, ch = (box[2] - box[0]) * S, (box[3] - box[1]) * S
    sheet = Image.new('RGBA', (cw * 4 + 24 * 5, ch + 90 + 60), BG)
    d = ImageDraw.Draw(sheet)
    d.text((24, 16), 'THE LIVING SHADOW', font=f1, fill=CYAN)
    for i, (_, label) in enumerate(views):
        x = 24 + i * (cw + 24)
        d.rectangle([x, 84, x + cw, 84 + ch], fill=PANEL)
        sheet.alpha_composite(ims[i].crop(box).resize((cw, ch), Image.NEAREST), (x, 84))
        d.text((x, 84 + ch + 10), label, font=f3, fill=TEXT)
    sheet.convert('RGB').save(f'{out}/living_shadow.png')
    S = 3
    W, H, floor = 2300, 900, 720
    sh = Image.new('RGBA', (W, H), BG)
    d = ImageDraw.Draw(sh)
    def put(im, ax, ay, x):
        sh.alpha_composite(im.resize((im.width * S, im.height * S), Image.NEAREST), (x - ax * S, floor - ay * S))
    put(load('brawler_front'), 18, 60, 110)
    put(load('warlock_front'), 84, 132, 300)
    put(load('demon_today_front'), 180, 276, 820)
    put(load('shadow_up_front'), 180, 276, 1330)
    put(load('shadow_run_front'), 180, 276, 1860)
    d.text((40, 20), "AT THE GAME'S OWN SIZE", font=f1, fill=CYAN)
    for x, t in [(40, 'Brawler'), (230, 'Warlock'), (560, 'his demon today'), (1200, 'the Living Shadow'), (1760, 'running')]:
        d.text((x, floor + 124), t, font=f3, fill=TEXT)
    sh.convert('RGB').save(f'{out}/living_shadow_at_game_size.png')


def three(pose, head, name, S=4, lines=True):
    """The three in one pose, each in a panel of one size, `S` times as big."""
    ims = [load(f'new_{k}_{pose}_front') for k, _, _ in NEW]
    bs = [i.getbbox() for i in ims]
    box = (min(b[0] for b in bs) - 4, min(b[1] for b in bs) - 4, max(b[2] for b in bs) + 4, max(b[3] for b in bs) + 4)
    cw, ch = (box[2] - box[0]) * S, (box[3] - box[1]) * S
    foot = 124 if lines else 20
    sheet = Image.new('RGBA', (cw * 3 + 40 * 4, ch + 150 + foot), BG)
    d = ImageDraw.Draw(sheet)
    d.text((40, 16), head, font=f1, fill=CYAN)
    for i, (k, title, says) in enumerate(NEW):
        x = 40 + i * (cw + 40)
        d.rectangle([x, 130, x + cw, 130 + ch], fill=PANEL)
        sheet.alpha_composite(ims[i].crop(box).resize((cw, ch), Image.NEAREST), (x, 130))
        d.text((x, 80), title, font=f3, fill=TEXT)
        if lines:
            for j, l in enumerate(says):
                d.text((x, 130 + ch + 12 + j * 36), l, font=f2, fill=TEXT)
    sheet.convert('RGB').save(f'{out}/{name}.png')


if len(sys.argv) > 3 and sys.argv[3] == 'shadow':
    shadow()
    sys.exit(0)
if len(sys.argv) > 3 and sys.argv[3] == 'ideas':
    ideas()
    sys.exit(0)

three('up', "A WEREWOLF'S FRAME, UP ON TWO LEGS: STANDING AND FIGHTING", 'new_demons_on_two_legs')
three('run', 'DOWN ON ALL FOURS: RUNNING', 'new_demons_running', lines=False)

# ---- at the game's own size, beside the game's demon, the Warlock and the Brawler (each on one floor line)
S = 3
W, H, floor = 2480, 880, 700
sh = Image.new('RGBA', (W, H), BG)
d = ImageDraw.Draw(sh)
def put(im, ax, ay, x):
    sh.alpha_composite(im.resize((im.width * S, im.height * S), Image.NEAREST), (x - ax * S, floor - ay * S))
put(load('brawler_front'), 18, 60, 110)
put(load('warlock_front'), 84, 132, 300)
put(load('demon_today_front'), 180, 276, 820)
for i, (k, _, _) in enumerate(NEW):
    put(load(f'new_{k}_up_front'), 180, 276, 1270 + i * 430)
d.text((40, 20), "AT THE GAME'S OWN SIZE", font=f1, fill=CYAN)
for x, t in [(40, 'Brawler'), (230, 'Warlock'), (560, 'his demon today'), (1230, 'A'), (1660, 'B'), (2090, 'C')]:
    d.text((x, floor + 124), t, font=f3, fill=TEXT)
sh.convert('RGB').save(f'{out}/new_demons_at_game_size.png')
