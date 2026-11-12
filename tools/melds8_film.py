# THE EIGHT MELDS AT WORK: ONE FILM AND ONE SHEET FOR HIS PHONE, from the frames tools/scenarios/melds8_looks.mjs takes
# (shots/melds8/<meld>_f0000.png on, 30 a second).
#   python3 tools/melds8_film.py <frames dir> <out dir> "<meld>:<still frame>,<still frame>" ...
# Makes <out dir>/2_melds8_at_work.mp4 (an MP4, not a GIF: his phone's, 3 Nov): each meld in turn, its name in its colour and its
# two words in a corner of every frame; and <out dir>/2_melds8_stills.png: the frames named, one above another, each with its
# name over it (tall and narrow, as his phone is held upright: his 9 Nov, of a sheet of small pictures, he could not see anything).
import glob
import json
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1:3]
picks = [(a.split(':')[0], [int(f) for f in a.split(':')[1].split(',')]) for a in sys.argv[3:]]
info = {m['id']: m for m in json.load(open('docs/mockups/melds8/stones.json'))}
bold = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
F = lambda s: ImageFont.truetype(bold, s)
hexc = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def label(im, meld, small=False):
    d = ImageDraw.Draw(im)
    m = info[meld]
    words = ' + '.join(p['word'].capitalize() for p in m['parts'])
    big, sub = (F(52), F(30)) if not small else (F(44), F(26))
    d.rectangle((0, 0, im.width, 96 if not small else 84), fill=(10, 8, 22))
    d.text((24, 10), m['name'], font=big, fill=hexc(m['color']))
    d.text((30 + d.textlength(m['name'], font=big), 30), words, font=sub, fill=(200, 196, 214))
    return im


tmp = tempfile.mkdtemp()
n = 0
for meld, _ in picks:
    for f in sorted(glob.glob(f'{src}/{meld}_f*.png')):
        label(Image.open(f).convert('RGB'), meld).save(f'{tmp}/f{n:05d}.png')
        n += 1
subprocess.run(['mkdir', '-p', out], check=True)
subprocess.run(
    ['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{tmp}/f%05d.png', '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', f'{out}/2_melds8_at_work.mp4'],
    check=True,
)
print(f'{out}/2_melds8_at_work.mp4', n, 'frames', f'{n / 30:.1f} s')
ims = []
for meld, fs in picks:
    for f in fs:
        ims.append(label(Image.open(f'{src}/{meld}_f{f:04d}.png').convert('RGB'), meld, True))
W = ims[0].width
sheet = Image.new('RGB', (W, sum(im.height + 16 for im in ims)), (10, 8, 22))
y = 0
for im in ims:
    sheet.paste(im, (0, y))
    y += im.height + 16
sheet.save(f'{out}/2_melds8_stills.png')
print(f'{out}/2_melds8_stills.png', sheet.size)
