#!/usr/bin/env python3
"""THE MOTH'S FILM (tools/moth_pictures.ts film): its frames come in on stdin, each a line with the length of its header, the
header (JSON: the move's name, a line saying what it is, how it is seen), then its picture (raw RGB); each is captioned
over the top in a bar and put into an MP4 for the owner's phone.
   npx tsx tools/moth_pictures.ts film docs/mockups/moth/pictures/moth_film.mp4"""
import json, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
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
