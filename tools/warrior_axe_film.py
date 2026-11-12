#!/usr/bin/env python3
"""THE WARRIOR'S BATTLE AXE, THE FILM (docs/mockups/warrior_weapons/pictures/axe_moves.mp4): the pictures the scenario took in
the game's practice room on a phone's wide screen (tools/scenarios/axe_film.mjs: 2532 by 1170, five screen pixels to a game
pixel), made into one film, 30 pictures a second, H.264 (yuv420p). Each pass at the game's own size is the whole screen as the
player sees it (halved, for the film's width); each slow pass is the same pictures cut round him at their full size, so he is
TWICE THE SIZE, at half speed. A line under the picture says in plain words what is shown.
   python3 tools/warrior_axe_film.py <frames dir> <out.mp4> [stills dir]
(with a stills dir: every picture of the film as a PNG there too, for looking at)"""
import json
import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
stills = sys.argv[3] if len(sys.argv) > 3 else None
m = json.load(open(os.path.join(src, 'manifest.json')))
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
W, H, BAND = 1266, 586, 66
BG, PALE, GREY, CYAN = (16, 13, 30), (240, 232, 255), (168, 162, 190), (40, 220, 240)
big, small = ImageFont.truetype(B, 25), ImageFont.truetype(R, 19)
K = m['scale']  # screen pixels to a game pixel in the pictures

if stills:
    os.makedirs(stills, exist_ok=True)
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H + BAND}', '-r', '30', '-i', '-',
                       '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'slow', '-crf', '21', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
n = 0
for f in m['frames']:
    im = Image.open(os.path.join(src, f['file'])).convert('RGB')
    if f['zoom']:
        # (cut round him at full size: twice the size he is in the halved picture; a little above his feet, so that a leap fits)
        # (where he stands is told in game pixels: `K` screen pixels to each)
        lead = f.get('lead') or [0, 0]
        cx = round((f['hero']['x'] + lead[0]) * K)
        cy = round((f['hero']['y'] + lead[1]) * K) - 22 * K
        x0 = max(0, min(im.width - W, cx - W // 2))
        y0 = max(0, min(im.height - H, cy - H // 2))
        pic = im.crop((x0, y0, x0 + W, y0 + H))
    else:
        pic = im.resize((W, im.height // 2), Image.BOX).crop((0, 0, W, H))
    card = Image.new('RGB', (W, H + BAND), BG)
    card.paste(pic, (0, 0))
    d = ImageDraw.Draw(card)
    d.text((16, H + 5), f['caption'], font=big, fill=CYAN if f['zoom'] else PALE)
    note = f.get('say') or ''
    d.text((16, H + 37), note, font=small, fill=GREY)
    d.text((W - 16, H + 37), 'a mock-up in the practice room: not in the game yet', font=small, fill=GREY, anchor='ra')
    ff.stdin.write(card.tobytes())
    if stills:
        card.save(os.path.join(stills, f'c{n:05d}.png'))
    n += 1
ff.stdin.close()
ff.wait()
print(out, n, 'pictures,', round(n / 30, 1), 's,', round(os.path.getsize(out) / 1e6, 2), 'MB')
