#!/usr/bin/env python3
"""BINDING AT WORK, as a moving picture for the owner's phone (render/binding3.ts, behind BINDING3, off:
not in the game): the frames tools/scenarios/binding_look.mjs took in the practice room, cut round the
hero, the word's name over them, IN FRONT, BEHIND or ON A MONSTER as the film goes, and what it does
under them, at the game's own speed.
   python3 tools/binding_film.py <frames dir> <out.mp4>"""
import glob, json, os, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
src, out = sys.argv[1], sys.argv[2]
root = __file__.rsplit('/tools/', 1)[0]
ramp = re.findall(r"'(#[0-9a-fA-F]{6})'", re.search(r'BIND_RAMP[^=]*=\s*\[(.*?)\]', open(f'{root}/src/render/binding3.ts').read()).group(1))
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
K, W = 5, 800
BG, GREY, PALE = (23, 20, 46), (168, 162, 184), (232, 226, 248)
hexrgb = lambda h: tuple(int(h.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4))
where = json.load(open(os.path.join(src, 'binding_where.json')))
hero = where['hero']
rx, ry, w, h = (-62, -112, 236, 140)
x, y = hero['x'] + rx, hero['y'] + ry
scale = W / (w * K)
H = round(h * K * scale)
top, foot = 58, 46
total = top + H + foot
total += total % 2
big, small, tag, cap = ImageFont.truetype(B, 34), ImageFont.truetype(R, 18), ImageFont.truetype(B, 22), ImageFont.truetype(R, 21)
col, glow = hexrgb(ramp[3]), hexrgb(ramp[4])
SIDES = [(0, 'IN FRONT', 'Holds enemies in place.', (30, 60, 72)), (where['behind'], 'BEHIND', 'Leaves a snare for the next enemy to cross.', (46, 40, 92)), (where['monster'], 'ON A MONSTER', 'Monsters root you.', (80, 24, 52))]
frames = sorted(glob.glob(os.path.join(src, 'binding_f*.png')))
tmp = out + '_frames'
os.makedirs(tmp, exist_ok=True)
for i, path in enumerate(frames):
    side = [s for s in SIDES if i >= s[0]][-1]
    im = Image.open(path).convert('RGB').crop((x * K, y * K, (x + w) * K, (y + h) * K)).resize((W, H), Image.LANCZOS)
    card = Image.new('RGB', (W, total), BG)
    d = ImageDraw.Draw(card)
    d.text((16, top // 2), 'BINDING', font=big, fill=col, anchor='lm')
    d.text((16 + d.textlength('BINDING', font=big) + 14, top // 2 + 2), 'Control', font=small, fill=GREY, anchor='lm')
    tw = d.textlength(side[1], font=tag) + 28
    d.rounded_rectangle((W - 16 - tw, 11, W - 16, top - 11), radius=5, fill=side[3])
    d.text((W - 16 - tw / 2, top // 2), side[1], font=tag, fill=glow if side[1] != 'ON A MONSTER' else (255, 160, 190), anchor='mm')
    card.paste(im, (0, top))
    d.text((W // 2, top + H + foot // 2), side[2], font=cap, fill=PALE, anchor='mm')
    card.save(os.path.join(tmp, f'c{i:03d}.png'))
for j in range(1, 24):
    card.save(os.path.join(tmp, f'c{len(frames) - 1 + j:03d}.png'))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', os.path.join(tmp, 'c%03d.png'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], check=True)
shots = sorted(glob.glob(os.path.join(tmp, 'c*.png')))[::10]
tw2, th2 = W // 2, total // 2
sheet = Image.new('RGB', (4 * tw2, ((len(shots) + 3) // 4) * th2), BG)
for i, p in enumerate(shots):
    sheet.paste(Image.open(p).resize((tw2, th2), Image.LANCZOS), ((i % 4) * tw2, (i // 4) * th2))
sheet.save(out.replace('.mp4', '_sheet.png'))
for n in os.listdir(tmp):
    os.remove(os.path.join(tmp, n))
os.rmdir(tmp)
print(out, len(frames), 'frames', round(os.path.getsize(out) / 1e6, 2), 'MB')
