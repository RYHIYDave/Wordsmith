#!/usr/bin/env python3
"""THE FIXES OF 9 OCT 2026 (his notes of 22:12) IN PICTURES, for the owner's phone: the stone's reminder (four
stills), the ring then the word (a film), and burning without the white flash (the live game and the fixed
one side by side). From the frames of tools/scenarios/ring_word.mjs (shots/ring/ph_*) and
tools/scenarios/dot_flash.mjs (shots/dot/was_* on the live game, shots/dot/now_* on the fixed one).
   python3 tools/fix_pictures.py <the repository> previews/fixes20"""
import glob
import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

root, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG = (23, 20, 46)
PALE, GREY, CYAN = (240, 232, 255), (168, 162, 184), (0x28, 0xdc, 0xf0)
big, mid, small = ImageFont.truetype(B, 24), ImageFont.truetype(R, 18), ImageFont.truetype(R, 15)
W = 844


def screen(path):
    return Image.open(path).convert('RGB').resize((W, 390), Image.LANCZOS)


def film(cards, name, fps, hold):
    tmp = os.path.join(out, '_' + name)
    os.makedirs(tmp, exist_ok=True)
    seq = cards + [cards[-1]] * hold
    for i, c in enumerate(seq):
        c.save(os.path.join(tmp, f'c{i:03d}.png'))
    path = os.path.join(out, name + '.gif')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', str(fps), '-i', os.path.join(tmp, 'c%03d.png'), '-vf',
                    'split[a][b];[a]palettegen=max_colors=192:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle',
                    '-loop', '0', path], check=True)
    for n in os.listdir(tmp):
        os.remove(os.path.join(tmp, n))
    os.rmdir(tmp)
    print(path, seq[0].size, len(seq), 'frames', round(os.path.getsize(path) / 1e6, 2), 'MB')


# 1. THE STONE'S REMINDER: four stills, one under another
steps = [('pick', 'Taking the stone: the reminder at the top, and a shorter line.'),
         ('pick_gone', 'A few seconds later: both gone.'),
         ('line_on', 'Back in town: the reminder again, for a few seconds.'),
         ('line_gone', 'Then gone.')]
head = 58
cap = 34
sheet = Image.new('RGB', (W, head + len(steps) * (cap + 390) + 10), BG)
d = ImageDraw.Draw(sheet)
d.text((16, 14), "THE STONE'S REMINDER", font=big, fill=CYAN)
y = head
for i, (n, text) in enumerate(steps):
    d.text((16, y + 6), f'{i + 1}.  {text}', font=mid, fill=PALE)
    sheet.paste(screen(os.path.join(root, f'shots/ring/ph_{n}.png')), (0, y + cap))
    y += cap + 390
p = os.path.join(out, 'stone_reminder.png')
sheet.save(p)
print(p, sheet.size)

# 2. THE RING, THEN THE WORD: the whole screen, a picture every tenth of a second of the game's time
top = 74
cards = []
for path in sorted(glob.glob(os.path.join(root, 'shots/ring/ph_f*.png'))):
    c = Image.new('RGB', (W, top + 390 + 26), BG)
    d = ImageDraw.Draw(c)
    d.text((16, 10), 'THE RING POWERS UP, THEN THE WORD', font=big, fill=CYAN)
    d.text((16, 44), 'You hand over the stone; the ring powers up; only then the word.', font=mid, fill=PALE)
    c.paste(screen(path), (0, top))
    d.text((16, top + 390 + 5), 'the game at its own speed, on a phone', font=small, fill=GREY)
    cards.append(c)
film(cards, 'ring_then_word', 10, 25)

# 3. BURNING, NO WHITE FLASH: the game as it is live, and fixed, side by side
K = 5
x0, y0, x1, y1 = 215, 78, 320, 148
half = 406
h = round((y1 - y0) * half / (x1 - x0))
top = 104
cards = []
was = sorted(glob.glob(os.path.join(root, 'shots/dot/was_f*.png')))
now = sorted(glob.glob(os.path.join(root, 'shots/dot/now_f*.png')))
for a, b in zip(was, now):
    c = Image.new('RGB', (W, top + h + 30), BG)
    d = ImageDraw.Draw(c)
    d.text((16, 10), 'BURNING: NO WHITE FLASH', font=big, fill=CYAN)
    d.text((16, 44), 'The skeleton burns for three seconds, then takes one blow.', font=mid, fill=PALE)
    d.text((12, top - 26), 'As it is now (19.9)', font=mid, fill=GREY)
    d.text((W - half - 4 + 8, top - 26), 'Fixed', font=mid, fill=CYAN)
    for k, path in enumerate((a, b)):
        im = Image.open(path).convert('RGB').crop((x0 * K, y0 * K, x1 * K, y1 * K)).resize((half, h), Image.LANCZOS)
        c.paste(im, (10 if k == 0 else W - half - 4, top))
    d.text((16, top + h + 7), 'the game at its own speed, on a phone; a blow still flashes', font=small, fill=GREY)
    cards.append(c)
film(cards, 'burning_no_flash', 30, 40)
