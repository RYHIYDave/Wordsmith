#!/usr/bin/env python3
"""FLOOR 18'S REFLECTIONS OF THE HEROES AS THEY LOOK NOW, IN PLAY, as a moving picture for the owner's phone: the frames
tools/scenarios/reflections_in_play.mjs took (one folder a hero: shots/rplay/<cls>[_<weapon>]/), each cut round the hero (the
camera follows him), its name over it and its two blows under it, at the game's own speed, one after another.
   python3 tools/reflections_play_film.py <frames root> <out.mp4> [crop share, 0.62]"""
import glob, json, os, shutil, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

root, out = sys.argv[1], sys.argv[2]
share = float(sys.argv[3]) if len(sys.argv) > 3 else 0.62
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
W = 1280
BG, GREY, PALE, PINK = (23, 20, 46), (168, 162, 184), (232, 226, 248), (255, 120, 170)
# (each hero's copy, in the order shown, its name and what its two blows are)
PARTS = [
    ('warrior', 'THE WARRIOR, GREAT SWORD', 'Tap: Strike, a cut before it.   Hold: the Slam, brought down before it.'),
    ('warrior_battleaxe', 'THE WARRIOR, WAR AXE', 'Tap: Cleave.   Hold: the axe thrown at you, and back to its hand.'),
    ('warrior_warhammer', 'THE WARRIOR, MAUL', 'Tap: Smash.   Hold: the Earthquake, all round it.'),
    ('ranger', 'THE RANGER', 'Tap: the Shot.   Hold: the Volley.'),
    ('mage', 'THE MAGE', 'Tap: the Wave.   Hold: the Orb.'),
    ('warlock', 'THE WARLOCK', 'Tap: a Hellfire Bolt.   Hold: the Curse, all round it.'),
    ('tinkerer', 'THE TINKERER', 'Tap: a vial.   Hold: three vials, side by side (no whistle).'),
    ('brawler', 'THE BRAWLER', 'Tap: the jab.   Hold: the roundhouse kick.'),
]
SUB = 'Floor 18: your reflection steps out of a mirror and fights with your moves'
top, foot = 78, 52
big, small, line = ImageFont.truetype(B, 30), ImageFont.truetype(R, 17), ImageFont.truetype(R, 22)
tmp = out + '_frames'
shutil.rmtree(tmp, ignore_errors=True)
os.makedirs(tmp)
n = 0
fps = 30
for name, title, said in PARTS:
    src = os.path.join(root, name)
    notes = glob.glob(os.path.join(src, '*_film.json'))
    if not notes:
        if os.environ.get('ONLY') is None: print('missing', name)
        continue
    note = json.load(open(notes[0]))
    fps = note['fps']
    sw, sh = note['size']
    frames = sorted(glob.glob(os.path.join(src, '*_f[0-9][0-9][0-9][0-9].png')))
    first = Image.open(frames[0])
    K = first.width / sw
    cw, ch = round(sw * share * K), round(sh * share * K)
    cx, cy = first.width / 2, first.height / 2 - ch * 0.08
    box = (round(cx - cw / 2), round(cy - ch / 2), round(cx + cw / 2), round(cy + ch / 2))
    H = round(ch * W / cw)
    H += H % 2
    for f in frames:
        im = Image.open(f).convert('RGB').crop(box).resize((W, H), Image.LANCZOS)
        c = Image.new('RGB', (W, top + H + foot), BG)
        c.paste(im, (0, top))
        d = ImageDraw.Draw(c)
        d.text((20, 8), title, font=big, fill=PALE)
        d.text((20, 48), SUB, font=small, fill=GREY)
        d.text((20, top + H + 12), said, font=line, fill=PINK)
        c.save(os.path.join(tmp, f'{n:05d}.png'))
        n += 1
    print(name, len(frames), 'frames')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(fps), '-i', os.path.join(tmp, '%05d.png'), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '25', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], check=True)
shutil.rmtree(tmp)
print(out, n, 'frames', f'{n / fps:.1f} s')
