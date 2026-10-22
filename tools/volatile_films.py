#!/usr/bin/env python3
"""THE FIVE VOLATILE MELDS AT WORK, as moving pictures for the owner's phone (render/volatile3.ts, behind
VOLATILE3, off: not in the game): the frames tools/scenarios/volatile_looks.mjs took in the practice room
(a phone's screen, 844 x 390 at three picture pixels to a point, the game at five screen pixels to a game
pixel), cut round the hero and what he strikes, with the word's name, what it is melded from, IN FRONT or
BEHIND as the film goes, and what it does (his page's words) under it, at the game's own speed (a frame a
thirtieth of a second).
   python3 tools/volatile_films.py <frames dir> <out dir> [word ...]
The frames are <frames dir>/<word>/<word>_fNNN.png with <word>_where.json beside them; each film goes to
<out dir>/<word>.mp4, with a sheet of every eighth frame beside it, <word>_sheet.png, to look over."""
import glob
import json
import os
import re
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
ORDER = ['demolition', 'powderkeg', 'shatter', 'chainreaction', 'rupture']
words = sys.argv[3:] or ORDER
root = __file__.rsplit('/tools/', 1)[0]
v3 = open(f'{root}/src/render/volatile3.ts').read()
RAMP = {k: re.findall(r"'(#[0-9a-fA-F]{6})'", v) for k, v in re.findall(r'^  (\w+): \[(.*?)\],$', re.search(r'VMELD_RAMP[^=]*=\s*\{(.*?)\n\};', v3, re.S).group(1), re.M)}
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
K = 5  # screen pixels to a game pixel in the frames
W = 800
BG = (23, 20, 46)
GREY, PALE = (168, 162, 184), (232, 226, 248)
NAMES = {'demolition': 'Demolition', 'powderkeg': 'Powderkeg', 'shatter': 'Shatter', 'chainreaction': 'Chain Reaction', 'rupture': 'Rupture'}
OF = {'demolition': 'Power + Volatile', 'powderkeg': 'Flame + Volatile', 'shatter': 'Frost + Volatile', 'chainreaction': 'Lightning + Volatile', 'rupture': 'Poison + Volatile'}
BOX = (-62, -112, 236, 140)
FILMS = {
    'demolition': {'behind': 118, 'front': 'Bigger explosions. Elites and bosses also explode once, at half life.', 'back': 'One huge rune, slow to go off.'},
    'powderkeg': {'behind': 96, 'front': 'Burning enemies explode when killed, and the blast sets others burning.', 'back': 'The rune leaves burning ground when it goes off.'},
    'shatter': {'behind': 90, 'front': 'Frozen enemies burst into shards that hit those around them.', 'back': 'The rune freezes what is near, then bursts.'},
    'chainreaction': {'behind': 110, 'front': 'An exploding enemy sends arcs to the nearest; those it kills explode too.', 'back': 'Runes are linked; one going off sets off the rest.'},
    'rupture': {'behind': 92, 'front': 'Poisoned enemies burst when killed, splashing poison on those around.', 'back': 'The rune bursts into a poison cloud.'},
}


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


os.makedirs(out, exist_ok=True)
big, small, tag, cap = ImageFont.truetype(B, 34), ImageFont.truetype(R, 18), ImageFont.truetype(B, 22), ImageFont.truetype(R, 21)
for word in words:
    f = FILMS[word]
    where = json.load(open(os.path.join(src, word, f'{word}_where.json')))['hero']
    rx, ry, w, h = BOX
    x, y = where['x'] + rx, where['y'] + ry
    scale = W / (w * K)
    H = round(h * K * scale)
    top, foot = 58, 46
    total = top + H + foot
    total += total % 2
    frames = sorted(glob.glob(os.path.join(src, word, f'{word}_f*.png')))
    colour = hexrgb(RAMP[word][3])
    glow = hexrgb(RAMP[word][4])
    name_col = colour if sum(colour) > 330 else glow
    shots = []
    for i, path in enumerate(frames):
        behind = i >= f['behind']
        im = Image.open(path).convert('RGB').crop((x * K, y * K, (x + w) * K, (y + h) * K)).resize((W, H), Image.LANCZOS)
        card = Image.new('RGB', (W, total), BG)
        d = ImageDraw.Draw(card)
        d.text((16, top // 2), NAMES[word].upper(), font=big, fill=name_col, anchor='lm')
        nw = d.textlength(NAMES[word].upper(), font=big)
        d.text((16 + nw + 14, top // 2 + 2), OF[word], font=small, fill=GREY, anchor='lm')
        side = 'BEHIND' if behind else 'IN FRONT'
        tw = d.textlength(side, font=tag) + 28
        d.rounded_rectangle((W - 16 - tw, 11, W - 16, top - 11), radius=5, fill=(46, 40, 92) if behind else (30, 60, 72))
        d.text((W - 16 - tw / 2, top // 2), side, font=tag, fill=glow, anchor='mm')
        card.paste(im, (0, top))
        d.text((W // 2, top + H + foot // 2), f['back'] if behind else f['front'], font=cap, fill=PALE, anchor='mm')
        shots.append(card)
    tmp = os.path.join(out, f'_{word}')
    os.makedirs(tmp, exist_ok=True)
    for i, card in enumerate(shots):
        card.save(os.path.join(tmp, f'c{i:03d}.png'))
    for j in range(1, 24):
        shots[-1].save(os.path.join(tmp, f'c{len(shots) - 1 + j:03d}.png'))
    path = os.path.join(out, f'{word}.mp4')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', os.path.join(tmp, 'c%03d.png'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path], check=True)
    picks = shots[::8]
    tw2, th2 = W // 2, shots[0].height // 2
    cols = 4
    sheet = Image.new('RGB', (cols * tw2, ((len(picks) + cols - 1) // cols) * th2), BG)
    for i, card in enumerate(picks):
        sheet.paste(card.resize((tw2, th2), Image.LANCZOS), ((i % cols) * tw2, (i // cols) * th2))
    sheet.save(os.path.join(out, f'{word}_sheet.png'))
    for name in os.listdir(tmp):
        os.remove(os.path.join(tmp, name))
    os.rmdir(tmp)
    print(path, shots[0].size, len(shots), 'frames', round(os.path.getsize(path) / 1e6, 2), 'MB')
