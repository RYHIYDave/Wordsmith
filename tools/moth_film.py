#!/usr/bin/env python3
"""THE MOTH'S FILM (tools/moth_pictures.ts film): its frames come in on stdin, each a line with the length of its header, the
header (JSON: the move's name, a line saying what it is, how it is seen), then its picture (raw RGB); each is captioned
over the top in a bar and put into an MP4 for the owner's phone.
   npx tsx tools/moth_pictures.ts film docs/mockups/moth/pictures/moth_film.mp4"""
import json, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
if sys.argv[1] == 'label':
    # (a picture for him: a bar over it with its title and what it shows, and tags laid on it where it says)
    #   python3 tools/moth_film.py label <in.png> <out.png> <title> <sub> [<tag>@<x>,<y> ...]
    src, dst, title, sub = sys.argv[2:6]
    im = Image.open(src).convert('RGB')
    B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
    R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    big, small, tagf = ImageFont.truetype(B, 34), ImageFont.truetype(R, 21), ImageFont.truetype(B, 22)
    lines = sub.split('|')
    BAR = 58 + 30 * len(lines)
    card = Image.new('RGB', (im.width, im.height + BAR), (23, 21, 28))
    card.paste(im, (0, BAR))
    d = ImageDraw.Draw(card)
    d.text((18, 30), title, font=big, fill=(232, 226, 214), anchor='lm')
    for i, line in enumerate(lines):
        d.text((18, 70 + 30 * i), line, font=small, fill=(168, 162, 154), anchor='lm')
    for spec in sys.argv[6:]:
        tag, at = spec.rsplit('@', 1)
        x, y = (int(v) for v in at.split(','))
        tw = d.textlength(tag, font=tagf) + 24
        d.rounded_rectangle((x, BAR + y, x + tw, BAR + y + 34), radius=6, fill=(52, 48, 60))
        d.text((x + tw / 2, BAR + y + 17), tag, font=tagf, fill=(232, 226, 214), anchor='mm')
    card.save(dst, optimize=True)
    print('saved', dst, card.size)
    sys.exit(0)
if sys.argv[1] == 'grid':
    # (moments of its moves at a glance: two across, each half as big, each captioned under it)
    #   python3 tools/moth_film.py grid <out.png> <title> <sub> <img>@<caption> ...
    dst, title, sub = sys.argv[2:5]
    B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
    R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    big, small, capf = ImageFont.truetype(B, 34), ImageFont.truetype(R, 21), ImageFont.truetype(B, 19)
    tiles = [a.split('@', 1) for a in sys.argv[5:]]
    first = Image.open(tiles[0][0])
    tw, th = first.width // 2, first.height // 2
    CAP = 34
    BAR = 92
    rows = (len(tiles) + 1) // 2
    card = Image.new('RGB', (tw * 2, BAR + rows * (th + CAP)), (23, 21, 28))
    d = ImageDraw.Draw(card)
    d.text((18, 30), title, font=big, fill=(232, 226, 214), anchor='lm')
    d.text((18, 70), sub, font=small, fill=(168, 162, 154), anchor='lm')
    for i, (src, cap) in enumerate(tiles):
        im = Image.open(src).convert('RGB').resize((tw, th), Image.NEAREST)
        x = (i % 2) * tw
        y = BAR + (i // 2) * (th + CAP)
        card.paste(im, (x, y))
        d.text((x + 12, y + th + CAP // 2), cap, font=capf, fill=(232, 226, 214), anchor='lm')
    card.save(dst, optimize=True)
    print('saved', dst, card.size)
    sys.exit(0)
W, H, out = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
BAR = 92
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small, tagf = ImageFont.truetype(B, 34), ImageFont.truetype(R, 21), ImageFont.truetype(B, 22)
BG, PALE, GREY = (23, 21, 28), (232, 226, 214), (168, 162, 154)
TAGS = {'FROM IN FRONT': (52, 48, 60), 'FROM BEHIND': (40, 44, 58), 'HALF SPEED': (86, 30, 58)}
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H + BAR}', '-framerate', '30', '-i', '-',
                       '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
inp = sys.stdin.buffer
n = 0
last = None
bar = None
while True:
    line = inp.readline()
    if not line:
        break
    head = json.loads(inp.read(int(line)))
    raw = inp.read(W * H * 3)
    if len(raw) < W * H * 3:
        break
    key = (head['title'], head['sub'], head['tag'])
    if key != last:
        bar = Image.new('RGB', (W, BAR), BG)
        d = ImageDraw.Draw(bar)
        d.text((18, 30), head['title'], font=big, fill=PALE, anchor='lm')
        d.text((18, 70), head['sub'], font=small, fill=GREY, anchor='lm')
        tw = d.textlength(head['tag'], font=tagf) + 28
        d.rounded_rectangle((W - 18 - tw, 12, W - 18, 50), radius=6, fill=TAGS.get(head['tag'], (52, 48, 60)))
        d.text((W - 18 - tw / 2, 31), head['tag'], font=tagf, fill=(255, 196, 214) if head['tag'] == 'HALF SPEED' else PALE, anchor='mm')
        last = key
    ff.stdin.write(bar.tobytes() + raw)
    n += 1
ff.stdin.close()
ff.wait()
print(out, n, 'frames', f'{n / 30:.1f} s')
