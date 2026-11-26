# python3 sheet.py <out.jpg> <films dir> <id>:<t>,<t>,... ...   frames at those times (s), one row a film, at 1:1 of the film (2x the game)
# t may be front+0.5 / behind+0.5 / foe+1.0 (from the side's start)
import sys, json, subprocess, os
from PIL import Image, ImageDraw, ImageFont
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 14)
out, d, specs = sys.argv[1], sys.argv[2], sys.argv[3:]
crop = os.environ.get('CROP', '160,110,640,450')
x0, y0, x1, y1 = map(int, crop.split(','))
W, H = x1 - x0, y1 - y0
scale = float(os.environ.get('SCALE', '0.5'))
w, h = int(W * scale), int(H * scale)
rows = []
for sp in specs:
    m, ts = sp.split(':', 1)
    j = json.load(open(f'{d}/{m}.json'))['sides'] if os.path.exists(f'{d}/{m}.json') else {}
    rows.append((m, ts.split(','), j))
cols = max(len(r[1]) for r in rows)
sheet = Image.new('RGB', (w * cols, h * len(rows)), (10, 8, 30)); dr = ImageDraw.Draw(sheet)
for r, (m, ts, j) in enumerate(rows):
    for c, t in enumerate(ts):
        if '+' in t:
            s, o = t.split('+'); tt = j.get(s, 0) / 30.0 + float(o)
        else:
            tt = float(t)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{tt:.3f}', '-i', f'{d}/{m}.mp4', '-frames:v', '1', '/tmp/sf.png'])
        im = Image.open('/tmp/sf.png').convert('RGB').crop((x0, y0, x1, y1)).resize((w, h), Image.NEAREST if scale >= 1 else Image.BILINEAR)
        sheet.paste(im, (c * w, r * h))
        dr.text((c * w + 3, r * h + 2), f'{m} {t}', font=font, fill=(255, 255, 255))
sheet.save(out, quality=88)
