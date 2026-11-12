# WHAT THE UNIQUE ITEMS SHOW IN PLAY: HIS FILM AND HIS STILLS, from the frames tools/scenarios/uniques_play_look.mjs takes
# (FILM=<seconds>: <frames>_f0000.png on, 30 a second, each cut to the part of the screen round the hero, a phone's own
# pixels: 852 by 393 points, three screen dots to a point).
#   python3 tools/uniques_play_film.py <frames prefix> <out dir> <name> "<frame>:<line under it>" ...
# Makes <out dir>/<name>.mp4 (an MP4, not a GIF: his phone's, 3 Nov), and <out dir>/<name>.png: the frames named, one above
# another, each with its line in plain words under it. NOT A WIDE SHEET: a picture as tall and narrow as his phone held upright,
# every game pixel some four of its screen's dots (his 9 Nov, of a sheet of small pictures: he could not see anything).
import glob
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

prefix, out, name = sys.argv[1:4]
picks = [(int(a.split(':', 1)[0]), a.split(':', 1)[1]) for a in sys.argv[4:]]
frames = sorted(glob.glob(f'{prefix}_f*.png'))
if not frames:
    sys.exit(f'no frames at {prefix}_f*.png')
subprocess.run(['mkdir', '-p', out], check=True)
# the film: the frames as they are, their size made even (the film's rule), every pixel kept sharp
subprocess.run(
    ['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{prefix}_f%04d.png', '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', f'{out}/{name}.mp4'],
    check=True,
)
print(f'{out}/{name}.mp4', len(frames), 'frames')
if not picks:
    sys.exit(0)
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 34)
BG = (14, 12, 36)
INK = (232, 230, 250)
PAD = 22


def wrap(d, text, width):
    lines, cur = [], ''
    for w in text.split():
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) <= width:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


ims = [Image.open(frames[min(i, len(frames) - 1)]).convert('RGB') for i, _ in picks]
W = ims[0].width + PAD * 2
probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
texts = [wrap(probe, line, W - PAD * 2) for _, line in picks]
LH = 44
H = PAD + sum(im.height + 14 + len(t) * LH + PAD for im, t in zip(ims, texts))
sheet = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(sheet)
y = PAD
for im, t in zip(ims, texts):
    sheet.paste(im, (PAD, y))
    y += im.height + 14
    for line in t:
        d.text((PAD, y), line, fill=INK, font=font)
        y += LH
    y += PAD
sheet.save(f'{out}/{name}.png')
print(f'{out}/{name}.png', sheet.size)
