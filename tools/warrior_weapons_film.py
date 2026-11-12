#!/usr/bin/env python3
"""THE WARRIOR'S THREE WEAPONS IN PLAY, as one film for the owner's phone: the frames tools/scenarios/warrior_weapons_film.mjs took
of each weapon (the greatsword, the battle axe, the warhammer), cut round the hero, the weapon's name over them and the move
being made, at the game's own speed.
   python3 tools/warrior_weapons_film.py <out.mp4> <greatsword frames dir> <battleaxe frames dir> <warhammer frames dir>"""
import glob, os, shutil, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

out, dirs = sys.argv[1], sys.argv[2:5]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
W = 960
BG, GREY = (23, 20, 46), (168, 162, 184)
PARTS = [
    ('GREATSWORD', (111, 168, 255), ['TAP: STRIKE', 'HOLD: WHIRL (one spin, harder than Strike)', 'SWIPE: LUNGE']),
    ('BATTLE AXE', (255, 106, 80), ['TAP: CLEAVE (every enemy in its arc; Rend: they bleed)', 'HOLD: AXE THROW (it comes back to his hand)', 'SWIPE: LEAPING CHOP']),
    ('WARHAMMER', (172, 135, 83), ['TAP: SMASH (knocks back; two quick blows stun)', 'HOLD: EARTHQUAKE (a full spin; the ground quakes)', 'SWIPE: SHOULDER CHARGE (strikes all in his way)']),
]
# the moves begin at frames 5, 41 and 96 of each part (the scenario's plan)
MOVE_AT = [0, 40, 95]
big, cap, small = ImageFont.truetype(B, 34), ImageFont.truetype(R, 22), ImageFont.truetype(R, 16)
tmp = out + '_frames'
shutil.rmtree(tmp, ignore_errors=True)
os.makedirs(tmp)
n = 0
for (name, col, moves), d in zip(PARTS, dirs):
    frames = sorted(glob.glob(os.path.join(d + '*f[0-9][0-9][0-9].png')) or glob.glob(os.path.join(d, '*f[0-9][0-9][0-9].png')))
    for i, path in enumerate(frames):
        im = Image.open(path).convert('RGB')
        w, h = im.size
        # (the hero is kept in the middle of the screen: the middle half of it, across and down)
        cw, ch = int(w * 0.62), int(h * 0.62)
        x0, y0 = (w - cw) // 2, (h - ch) // 2 - int(h * 0.04)
        pic = im.crop((x0, y0, x0 + cw, y0 + ch)).resize((W, round(ch * W / cw)), Image.LANCZOS)
        top, foot = 60, 52
        card = Image.new('RGB', (W, top + pic.height + foot), BG)
        card.paste(pic, (0, top))
        dr = ImageDraw.Draw(card)
        dr.text((16, top // 2), name, font=big, fill=col, anchor='lm')
        k = max(j for j, a in enumerate(MOVE_AT) if i >= a)
        dr.text((16, top + pic.height + foot // 2), moves[k], font=cap, fill=(236, 232, 255), anchor='lm')
        card.save(os.path.join(tmp, f'{n:05d}.png'))
        n += 1
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', os.path.join(tmp, '%05d.png'), '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', out], check=True)
shutil.rmtree(tmp, ignore_errors=True)
print('made', out, n, 'frames')
