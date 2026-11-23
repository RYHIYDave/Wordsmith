# python3 peaks.py <film dir> <out.png> id ...  : for each film, the 4 frames where the meld's own colours cover most of the screen
import sys, subprocess, os, json, glob
import numpy as np
from PIL import Image, ImageDraw, ImageFont
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
d, out, ids = sys.argv[1], sys.argv[2], sys.argv[3:]
C = json.load(open('/home/user/Wordsmith/godot/assets/words/melds52.json'))['color']
W, H = 340, 250
sheet = Image.new('RGB', (W * 4, H * len(ids)), (10, 8, 30)); dr = ImageDraw.Draw(sheet)
tmp = '/tmp/claude-0/pk'
for r, m in enumerate(ids):
    os.makedirs(tmp, exist_ok=True)
    for f in glob.glob(tmp + '/*.png'): os.remove(f)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f'{d}/{m}.mp4', '-vf', 'fps=10', tmp + '/%04d.png'])
    c = np.array([int(C[m][i:i + 2], 16) for i in (1, 3, 5)], dtype=float)
    shades = [c, c * 0.65, c + (255 - c) * 0.45]
    scores = []
    files = sorted(glob.glob(tmp + '/*.png'))
    for i, f in enumerate(files):
        a = np.asarray(Image.open(f).convert('RGB'), dtype=float)
        n = 0
        for s in shades:
            n += int((np.sqrt(((a - s) ** 2).sum(axis=2)) < 28).sum())
        scores.append((n, i))
    picks = []
    for n, i in sorted(scores, reverse=True):
        if all(abs(i - j) >= 6 for j in picks):
            picks.append(i)
        if len(picks) == 4:
            break
    for k, i in enumerate(sorted(picks)):
        im = Image.open(files[i]).convert('RGB').crop((170, 135, 170 + W, 135 + H))
        sheet.paste(im, (k * W, r * H))
        dr.text((k * W + 4, r * H + 2), f'{m} {i / 10:.1f}', font=font, fill=(255, 255, 255))
sheet.save(out)
