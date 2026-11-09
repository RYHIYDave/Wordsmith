#!/usr/bin/env python3
"""HIS THREE NEW WORDS AT WORK: the film (docs/mockups/words10/pictures/words3_film.mp4), from the pictures of
tools/scenarios/words10_film.mjs (the game's own screen in the practice room, two screen pixels to a game pixel, a picture every
thirtieth of a second of the game's clock; a sixtieth for the close ones). Each word in turn: a card with its rune stone and its
colours; on his abilities and on a monster at full speed, the whole screen as the player sees it; then its best moment again, at
twice the size and half speed. Captioned. 30 a second, H.264, yuv420p.
   python3 tools/words10_film.py <pictures' prefix, e.g. /dev/shm/w10f/f> <out.mp4>"""
import base64
import glob
import io
import json
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

pre, out = sys.argv[1:3]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, mid, small = ImageFont.truetype(B, 40), ImageFont.truetype(B, 22), ImageFont.truetype(R, 21)
W, H = 1266, 540
BG = (16, 14, 26)
PALE, GREY, PINK = (240, 232, 214), (186, 180, 204), (255, 122, 168)
STAT = {'lasting': 'Int', 'fleeting': 'Dex', 'vast': 'Str'}
RUNE_IS = {'lasting': 'an hourglass, its sand held', 'fleeting': 'a feather', 'vast': 'rings opening outward from a point'}
COLOUR_IS = {'lasting': 'old sand at dusk, pale amber where the light is in it',
             'fleeting': 'a lilac so pale at its edge it is nearly white',
             'vast': 'deep earth, and the dust off it'}

plan = json.load(open(pre + '_plan.json'))
runes = json.load(open(pre + '_runes.json'))


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def wrap(d, text, font, width):
    words, lines, cur = text.split(' '), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) <= width:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def caption(im, word, text, colour, note=None):
    d = ImageDraw.Draw(im, 'RGBA')
    name = word.upper()
    x = 14 + d.textlength(name, font=mid) + 14
    lines = wrap(d, text, small, W - x - 14)
    d.rectangle((0, 0, W, 18 + 28 * len(lines)), fill=(12, 10, 20, 215))
    d.text((14, 9), name, font=mid, fill=colour)
    for k, ln in enumerate(lines):
        d.text((x, 11 + 28 * k), ln, font=small, fill=PINK if text.startswith('On a monster') else PALE)
    if note:
        tw = d.textlength(note, font=small)
        d.rectangle((W - tw - 26, H - 40, W, H), fill=(12, 10, 20, 215))
        d.text((W - tw - 14, H - 33), note, font=small, fill=GREY)
    return im


def card(word, ramp):
    im = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(im)
    st = Image.open(io.BytesIO(base64.b64decode(runes[word].split(',', 1)[1]))).convert('RGBA')
    stb = st.resize((st.width * 14, st.height * 14), Image.NEAREST)
    im.paste(stb, (120, (H - stb.height) // 2), stb)
    col = hexrgb(ramp[3]) if sum(hexrgb(ramp[3])) > 200 else hexrgb(ramp[4])
    d.text((330, 130), word.upper(), font=big, fill=col)
    d.text((330, 190), f'({STAT[word]})  its rune: {RUNE_IS[word]}', font=small, fill=PALE)
    d.text((330, 222), f'its colour: {COLOUR_IS[word]}', font=small, fill=GREY)
    for j, c in enumerate(ramp):
        d.rectangle((330 + j * 70, 266, 330 + j * 70 + 62, 302), fill=(8, 6, 12))
        d.rectangle((332 + j * 70, 268, 330 + j * 70 + 60, 300), fill=hexrgb(c))
    for j, line in enumerate(['On his abilities and on a monster, at full speed;', 'then its best moment again, twice the size, half speed.']):
        d.text((330, 326 + 28 * j), line, font=small, fill=GREY)
    return im


enc = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
n = 0


def put(im):
    global n
    enc.stdin.write(im.convert('RGB').tobytes())
    n += 1


last = None
for p in plan:
    word = p['word']
    if word != last:
        c = card(word, p['ramp'])
        for _ in range(24):
            put(c)
        last = word
    files = sorted(glob.glob(f"{pre}_{p['name']}_*.png"))
    col = hexrgb(p['ramp'][3]) if sum(hexrgb(p['ramp'][3])) > 200 else hexrgb(p['ramp'][4])
    for f in files:
        im = Image.open(f).convert('RGB')
        if im.size != (W, H):
            im = im.resize((W, H), Image.NEAREST)
        if p['best']:
            fc = p['focus']
            s = W / fc['w']
            cx, cy = fc['x'] * s, fc['y'] * s
            cw, ch = W / 2, H / 2
            x0 = max(0, min(W - cw, cx - cw / 2))
            y0 = max(0, min(H - ch, cy - ch / 2))
            im = im.crop((round(x0), round(y0), round(x0 + cw), round(y0 + ch))).resize((W, H), Image.NEAREST)
            caption(im, word, p['cap'], col, 'again: twice the size, half speed')
        else:
            caption(im, word, p['cap'], col)
        put(im)
    # a breath after each piece: its last picture held
    if files:
        for _ in range(6):
            put(im)
enc.stdin.close()
enc.wait()
print(out, n, 'pictures', round(n / 30, 1), 's')
