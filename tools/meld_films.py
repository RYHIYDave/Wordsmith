#!/usr/bin/env python3
"""THE MELDED WORDS AT WORK, as moving pictures for the owner's phone (render/melds3.ts, behind MELD3,
off: not in the game): the frames tools/scenarios/meld_looks.mjs took in the practice room (a phone's
screen, 844 x 390 at three picture pixels to a point, the game at five screen pixels to a game pixel),
cut round the hero and what he strikes, with the word's name, its rune, and what it does over the top,
IN FRONT or BEHIND as the film goes, at the game's own speed (a frame a thirtieth of a second).
   python3 tools/meld_films.py <frames dir> <out dir> [word ...]
The frames are <frames dir>/<word>/<word>_fNNN.png with <word>_where.json beside them; each film goes
to <out dir>/<word>.mp4 (small enough for a phone; GIF=1 makes <word>.gif as well), with a sheet of
every eighth frame beside it, <word>_sheet.png, to look over."""
import glob
import json
import os
import re
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
ORDER = ['eruption', 'avalanche', 'thunder', 'blight', 'scald', 'wildfire', 'fumes', 'hailstorm', 'frostbite', 'contagion']
words = sys.argv[3:] or ORDER
root = __file__.rsplit('/tools/', 1)[0]
m3 = open(f'{root}/src/render/melds3.ts').read()
RAMP = {k: re.findall(r"'(#[0-9a-fA-F]{6})'", v) for k, v in re.findall(r'^  (\w+): \[(.*?)\],$', re.search(r'MELD_RAMP[^=]*=\s*\{(.*?)\n\};', m3, re.S).group(1), re.M)}
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
K = 5  # screen pixels to a game pixel in the frames
W = 800
BG = (23, 20, 46)
PALE, GREY = (240, 232, 255), (168, 162, 184)
NAMES = {'eruption': 'Eruption', 'avalanche': 'Avalanche', 'thunder': 'Thunder', 'blight': 'Blight', 'scald': 'Scald', 'wildfire': 'Wildfire', 'fumes': 'Fumes', 'hailstorm': 'Hailstorm', 'frostbite': 'Frostbite', 'contagion': 'Contagion'}
OF = {'eruption': 'Power + Flame', 'avalanche': 'Power + Frost', 'thunder': 'Power + Lightning', 'blight': 'Power + Poison', 'scald': 'Flame + Frost', 'wildfire': 'Flame + Lightning', 'fumes': 'Flame + Poison', 'hailstorm': 'Frost + Lightning', 'frostbite': 'Frost + Poison', 'contagion': 'Lightning + Poison'}
MELEE = (-55, -100, 200, 125)
RANGED = (-35, -86, 260, 116)
FILMS = {
    'eruption': {'box': MELEE, 'behind': 70, 'front': 'A volcano\'s blow: molten rock bursts up, and it leaves a pool of lava.', 'back': 'Each hit builds heat, embers circling your feet. At full heat the next hit erupts.'},
    'avalanche': {'box': MELEE, 'behind': 78, 'front': 'Snow and ice smash it back. One that can\'t go back freezes.', 'back': 'Snowdrifts on the ground, and every hit on the chilled crushes harder.'},
    'thunder': {'box': MELEE, 'behind': 44, 'front': 'One great bolt out of the sky, and it stuns.', 'back': 'Sparks gather round you; every 4th hit, a thunderclap. A thunderhead hangs where it hits.'},
    'blight': {'box': MELEE, 'behind': 74, 'front': 'Rot. Its veins climb what you hit, worse as its life runs out.', 'back': 'A cloud of rot. What it poisons is branded, and takes more from everything.'},
    'scald': {'box': MELEE, 'behind': 74, 'front': 'Fire and ice twist together. Hit a burning or chilled one and it cracks.', 'back': 'Scalding steam boils up off the ground. Standing in it, you are hidden.'},
    'wildfire': {'box': RANGED, 'behind': 80, 'front': 'Burning lightning leaps from what you hit to the rest, setting them on fire.', 'back': 'Burning ground that throws fire at whatever comes near it.'},
    'fumes': {'box': MELEE, 'behind': 74, 'front': 'Sour smoke. A burning, poisoned one gives off a toxic cloud.', 'back': 'Smouldering ground, and a cloud that explodes when fire walks into it.'},
    'hailstorm': {'box': RANGED, 'behind': 78, 'front': 'Ice-white lightning that chills. The frozen pass it on.', 'back': 'A storm cloud of hail that strikes and slows.'},
    'frostbite': {'box': MELEE, 'behind': 74, 'front': 'Jaws of ice bite what you hit, and keep biting while it is chilled.', 'back': 'Ice with venom frozen in it, under a cold, sick mist.'},
    'contagion': {'box': RANGED, 'behind': 78, 'front': 'Sick green lightning. Everything it strikes is poisoned.', 'back': 'A green storm, and a cloud that shocks whatever stands in it.'},
}


def wrap(d, text, font, width):
    """The line broken into as few lines as fit `width`."""
    lines, line = [], ''
    for word in text.split():
        trial = f'{line} {word}'.strip()
        if d.textlength(trial, font=font) <= width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    return lines + [line]


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


os.makedirs(out, exist_ok=True)
big, small, tag = ImageFont.truetype(B, 34), ImageFont.truetype(R, 18), ImageFont.truetype(B, 22)
for word in words:
    f = FILMS[word]
    where = json.load(open(os.path.join(src, word, f'{word}_where.json')))['hero']
    rx, ry, w, h = f['box']
    x, y = where['x'] + rx, where['y'] + ry
    scale = W / (w * K)
    H = round(h * K * scale)
    top = 58
    H += (top + H) % 2  # a film's height must be even
    frames = sorted(glob.glob(os.path.join(src, word, f'{word}_f*.png')))
    colour = hexrgb(RAMP[word][3])
    glow = hexrgb(RAMP[word][4])
    shots = []
    for i, path in enumerate(frames):
        behind = i >= f['behind']
        im = Image.open(path).convert('RGB').crop((x * K, y * K, (x + w) * K, (y + h) * K)).resize((W, H), Image.LANCZOS)
        # a bar over the film: the word, what it is melded from, and which side it is on now
        card = Image.new('RGB', (W, top + H), BG)
        d = ImageDraw.Draw(card)
        d.text((16, top // 2), NAMES[word].upper(), font=big, fill=colour if sum(colour) > 330 else glow, anchor='lm')
        nw = d.textlength(NAMES[word].upper(), font=big)
        d.text((16 + nw + 14, top // 2 + 2), OF[word], font=small, fill=GREY, anchor='lm')
        side = 'BEHIND' if behind else 'IN FRONT'
        tw = d.textlength(side, font=tag) + 28
        d.rounded_rectangle((W - 16 - tw, 11, W - 16, top - 11), radius=5, fill=(46, 40, 92) if behind else (30, 60, 72))
        d.text((W - 16 - tw / 2, top // 2), side, font=tag, fill=glow, anchor='mm')
        card.paste(im, (0, top))
        shots.append(card)
    tmp = os.path.join(out, f'_{word}')
    os.makedirs(tmp, exist_ok=True)
    for i, card in enumerate(shots):
        card.save(os.path.join(tmp, f'c{i:03d}.png'))
    for j in range(1, 24):
        shots[-1].save(os.path.join(tmp, f'c{len(shots) - 1 + j:03d}.png'))
    path = os.path.join(out, f'{word}.mp4')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', os.path.join(tmp, 'c%03d.png'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path], check=True)
    if os.environ.get('GIF') == '1':
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', os.path.join(tmp, 'c%03d.png'), '-vf', 'split[a][b];[a]palettegen=max_colors=200:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle', '-loop', '0', os.path.join(out, f'{word}.gif')], check=True)
    # a still for the page to show before the film plays: the first blow landing
    shots[min(len(shots) - 1, f.get('poster', 8 if f['box'] is MELEE else 16))].save(os.path.join(out, f'{word}.jpg'), quality=86)
    # every eighth frame on one sheet, half size, to look over
    picks = shots[::8]
    tw, th = W // 2, shots[0].height // 2
    cols = 4
    sheet = Image.new('RGB', (cols * tw, ((len(picks) + cols - 1) // cols) * th), BG)
    for i, card in enumerate(picks):
        sheet.paste(card.resize((tw, th), Image.LANCZOS), ((i % cols) * tw, (i // cols) * th))
    sheet.save(os.path.join(out, f'{word}_sheet.png'))
    for name in os.listdir(tmp):
        os.remove(os.path.join(tmp, name))
    os.rmdir(tmp)
    print(path, shots[0].size, len(shots), 'frames', round(os.path.getsize(path) / 1e6, 2), 'MB')
