#!/usr/bin/env python3
"""THE PRINCESS, FLOOR 16'S BOSS, as a moving picture for the owner's phone (game/act1_rules/princess.ts, behind HIGH_CITY): the
frames tools/scenarios/princess_film.mjs took in the practice room, cut round the hero (the camera follows him), what she is doing
over them and a line under them, at the game's own speed.
   python3 tools/princess_film.py <frames dir> <out.mp4> [crop share, 0.9]  (as tools/warlock_film.py, its frames numbered in fours)"""
import glob, json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
src, out = sys.argv[1], sys.argv[2]
share = float(sys.argv[3]) if len(sys.argv) > 3 else 0.9
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
W = 900
BG, GREY, PALE, CYAN = (23, 20, 46), (168, 162, 184), (232, 226, 248), (64, 232, 240)
note = json.load(open(glob.glob(os.path.join(src, '*_film.json'))[0]))
fps, parts = note['fps'], note['parts']
sw, sh = note['size']
frames = sorted(glob.glob(os.path.join(src, '*_f[0-9][0-9][0-9][0-9].png')))
first = Image.open(frames[0])
K = first.width / sw
cw, ch = round(sw * share * K), round(sh * share * K)
cx, cy = first.width / 2, first.height / 2 - ch * 0.06
box = (round(cx - cw / 2), round(cy - ch / 2), round(cx + cw / 2), round(cy + ch / 2))
H = round(ch * W / cw)
top, foot = 64, 52
total = top + H + foot
total += total % 2
big, line = ImageFont.truetype(B, 30), ImageFont.truetype(R, 22)
tmp = out + '_frames'
os.makedirs(tmp, exist_ok=True)
n = 0
for path in frames:
    i = int(path[-8:-4])
    t = i / fps
    part = [p for p in parts if t >= p[0]][-1]
    im = Image.open(path).convert('RGB').crop(box).resize((W, H), Image.LANCZOS)
    card = Image.new('RGB', (W, total), BG)
    d = ImageDraw.Draw(card)
    d.text((18, top // 2), part[1], font=big, fill=CYAN, anchor='lm')
    card.paste(im, (0, top))
    d.text((W // 2, top + H + foot // 2), part[2], font=line, fill=PALE, anchor='mm')
    card.save(os.path.join(tmp, f'c{n:04d}.png'))
    n += 1
for j in range(fps):
    card.save(os.path.join(tmp, f'c{n:04d}.png'))
    n += 1
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', str(fps), '-i', os.path.join(tmp, 'c%04d.png'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], check=True)
shots = sorted(glob.glob(os.path.join(tmp, 'c*.png')))[::15]
tw2, th2 = W // 3, total // 3
sheet = Image.new('RGB', (5 * tw2, ((len(shots) + 4) // 5) * th2), BG)
for k, p in enumerate(shots):
    sheet.paste(Image.open(p).resize((tw2, th2), Image.LANCZOS), ((k % 5) * tw2, (k // 5) * th2))
sheet.save(out.replace('.mp4', '_sheet.png'))
for f in os.listdir(tmp):
    os.remove(os.path.join(tmp, f))
os.rmdir(tmp)
print(out, n, 'frames', round(os.path.getsize(out) / 1e6, 2), 'MB')
