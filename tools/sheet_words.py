# The picture for the owner: every word on one ability, in front (left) and behind (right).
#   python3 tools/sheet_words.py <prefix> <slow|quick> <Ability name> <out.png> <front frames> <behind frames> [crop w] [crop up] [crop down] [zoom] [title] [hero|mid|target]
# <front frames> / <behind frames>: eight frame numbers, one per word in the order
#   power,swift,twin,fire,frost,lightning,leech,volatile   (they index the TIMES list of wordfx.mjs)
import json
import sys
from PIL import Image, ImageDraw, ImageFont

WORDS = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile']
FRONT = {'power': 'Power', 'swift': 'Swift', 'twin': 'Twin', 'fire': 'Flame', 'frost': 'Frost', 'lightning': 'Lightning', 'leech': 'Leeching', 'volatile': 'Volatile'}
BEHIND = {'power': 'Power', 'swift': 'Swiftness', 'twin': 'Echoes', 'fire': 'Flame', 'frost': 'Frost', 'lightning': 'Lightning', 'leech': 'Leeching', 'volatile': 'Ruin'}
HUE = {'power': (255, 150, 70), 'swift': (150, 230, 110), 'twin': (90, 220, 210), 'fire': (255, 170, 60), 'frost': (150, 205, 255), 'lightning': (255, 230, 90), 'leech': (255, 110, 110), 'volatile': (200, 150, 255)}

prefix, which, ability, out = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
ff = [int(x) for x in sys.argv[5].split(',')]
bf = [int(x) for x in sys.argv[6].split(',')]
cw = int(sys.argv[7]) if len(sys.argv) > 7 else 300
up = int(sys.argv[8]) if len(sys.argv) > 8 else 120
down = int(sys.argv[9]) if len(sys.argv) > 9 else 80
zoom = int(sys.argv[10]) if len(sys.argv) > 10 else 2
title = sys.argv[11] if len(sys.argv) > 11 else ability
# what each picture is centred on: 'hero', 'mid' (half way to the target) or 'target'
focus = sys.argv[12] if len(sys.argv) > 12 else 'mid'
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, mid, cap = ImageFont.truetype(B, 44), ImageFont.truetype(R, 26), ImageFont.truetype(B, 30)

def cell(tag, frame, text, hue):
    im = Image.open(f'{prefix}_{tag}_{which}_{frame:02d}.png').convert('RGB')
    W, H = im.size
    # the hero is in the middle of the screen; the note beside the pictures says where the target was
    cx, cy = W // 2, H // 2
    if focus != 'hero':
        try:
            at = json.load(open(f'{prefix}_{tag}_{which}.json'))
            k = 0.5 if focus == 'mid' else 1.0
            cx, cy = round(cx + (at['x'] - cx) * k), round(cy + (at['y'] + 10 - cy) * k)
        except (FileNotFoundError, KeyError, ValueError):
            pass
    cx = min(max(cx, cw // 2), W - cw // 2)
    cy = min(max(cy, up), H - down)
    c = im.crop((cx - cw // 2, cy - up, cx + cw // 2, cy + down))
    c = c.resize((c.width * zoom, c.height * zoom), Image.NEAREST)
    d = ImageDraw.Draw(c, 'RGBA')
    d.rectangle((0, 0, c.width, 46), fill=(8, 6, 14, 190))
    d.text((12, 6), text, font=cap, fill=hue)
    return c

cells = []
for i, w in enumerate(WORDS):
    cells.append((cell(f'{w}_-', ff[i], f'{FRONT[w]} {ability}', HUE[w]), cell(f'-_{w}', bf[i], f'{ability} of {BEHIND[w]}', HUE[w])))
W, H = cells[0][0].size
gap, pad, head = 8, 16, 150
sheet = Image.new('RGB', (pad * 2 + W * 2 + gap, head + len(cells) * (H + gap) - gap + pad), (14, 11, 20))
d = ImageDraw.Draw(sheet)
d.text((pad, 14), title, font=big, fill=(245, 236, 214))
d.text((pad, 72), 'Left: the word in front (it changes the hit).', font=mid, fill=(200, 192, 180))
d.text((pad, 104), 'Right: the same word behind (it changes what is left).', font=mid, fill=(200, 192, 180))
for r, (a, b) in enumerate(cells):
    y = head + r * (H + gap)
    sheet.paste(a, (pad, y))
    sheet.paste(b, (pad + W + gap, y))
sheet.save(out)
print(out, sheet.size)
