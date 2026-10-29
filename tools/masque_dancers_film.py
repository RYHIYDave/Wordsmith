#!/usr/bin/env python3
"""THE MASKED DANCERS' FILM AND PICTURES, captioned for the owner's phone (art/masque_dancers.ts; behind DANCERS_ON, off:
not in the game). The frames are painted by tools/masque_dancers_film.ts; this puts a caption over each and makes the film.
   python3 tools/masque_dancers_film.py film <frames dir> <out.mp4>
   python3 tools/masque_dancers_film.py label <in.png> <out.png> "<title>" "<line>" """
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG, GREY, PALE, ROSE = (18, 15, 30), (172, 166, 190), (236, 232, 246), (232, 150, 190)
big, small, note = ImageFont.truetype(B, 30), ImageFont.truetype(R, 19), ImageFont.truetype(R, 19)

def card(im, title, sub, line):
    W, H = im.size
    top, foot = 54, 44
    out = Image.new('RGB', (W, top + H + foot), BG)
    out.paste(im, (0, top))
    d = ImageDraw.Draw(out)
    d.text((16, top // 2), title, font=big, fill=PALE, anchor='lm')
    if sub:
        d.text((W - 16, top // 2 + 2), sub, font=small, fill=GREY, anchor='rm')
    if line:
        d.text((W // 2, top + H + foot // 2), line, font=note, fill=ROSE, anchor='mm')
    return out

if sys.argv[1] == 'film':
    src, mp4 = sys.argv[2], sys.argv[3]
    caps = json.load(open(os.path.join(src, 'captions.json')))
    tmp = mp4 + '_frames'
    os.makedirs(tmp, exist_ok=True)
    for i, c in enumerate(caps):
        im = Image.open(os.path.join(src, f'f{i:04d}.png')).convert('RGB')
        card(im, c['title'], c['sub'], c['note']).save(os.path.join(tmp, f'c{i:04d}.png'))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', os.path.join(tmp, 'c%04d.png'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], check=True)
    for n in os.listdir(tmp):
        os.remove(os.path.join(tmp, n))
    os.rmdir(tmp)
    print(mp4, len(caps), 'frames', round(len(caps) / 30, 1), 's', round(os.path.getsize(mp4) / 1e6, 2), 'MB')
elif sys.argv[1] == 'label':
    im = Image.open(sys.argv[2]).convert('RGB')
    card(im, sys.argv[4], '', sys.argv[5]).save(sys.argv[3])
