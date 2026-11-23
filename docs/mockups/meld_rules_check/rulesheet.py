# python3 rulesheet.py <out.png> <dir>:<id> ...  one row per meld: front 0.62, 1.3; behind 3.4, 4.2; on a monster 6.2
import sys, subprocess, os
from PIL import Image, ImageDraw, ImageFont
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
out, specs = sys.argv[1], sys.argv[2:]
T = [0.62, 1.3, 3.4, 4.2, 6.2]
W, H = 340, 250
sheet = Image.new('RGB', (W * len(T), H * len(specs)), (10, 8, 30)); dr = ImageDraw.Draw(sheet)
tmp = '/tmp/claude-0/rs'
os.makedirs(tmp, exist_ok=True)
for r, sp in enumerate(specs):
    d, m = sp.rsplit(':', 1)
    for c, t in enumerate(T):
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(t), '-i', f'{d}/{m}.mp4', '-frames:v', '1', f'{tmp}/f.png'])
        im = Image.open(f'{tmp}/f.png').convert('RGB').crop((170, 135, 170 + W, 135 + H))
        sheet.paste(im, (c * W, r * H))
        dr.text((c * W + 4, r * H + 2), f'{m} {t}', font=font, fill=(255, 255, 255))
sheet.save(out)
