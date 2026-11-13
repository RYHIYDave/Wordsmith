# THE KEY-BEARERS' FILM (tools/scenarios/key_bearers_film.mjs): its frames cut in round the hero and the bearer, made bigger, each
# part's name over it, as an mp4 at thirty frames a second.
#   python3 tools/key_bearers_cut.py <frames prefix, e.g. shots/keybearers/k> <out.mp4> [crop w] [centre y]
#   (crop w 0: the whole screen as the player sees it, every part, its name in a band under it)
import glob, json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont
pre, out = sys.argv[1], sys.argv[2]
cw = int(sys.argv[3]) if len(sys.argv) > 3 else 1100
cy = int(sys.argv[4]) if len(sys.argv) > 4 else 340
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
frames = sorted(glob.glob(pre + '_f*.png'))
note = json.load(open(pre + '_film.json')) if os.path.exists(pre + '_film.json') else None
parts = note['parts'] if note else []
tmp = tempfile.mkdtemp()
ch = round(cw * 9 / 16)
for i, f in enumerate(frames):
    title = ''
    pw, pc = cw, cy
    for part in parts:
        if i >= part[0]:
            title = part[1]
            if len(part) > 3 and cw != 0: pw, pc = part[2], part[3]
    ph = round(pw * 9 / 16)
    im = Image.open(f).convert('RGB')
    W, H = im.size
    if cw == 0:
        # (the whole screen, its name in a band under it)
        full = Image.new('RGB', (W, H + 56), (20, 16, 30))
        full.paste(im, (0, 0))
        if title:
            ImageDraw.Draw(full).text((W // 2, H + 28), title, font=F, fill=(232, 246, 255), anchor='mm')
        full.save(os.path.join(tmp, 'f%04d.png' % i))
        continue
    x0 = W // 2 - pw // 2
    y0 = max(0, min(H - ph, pc - ph // 2))
    im = im.crop((x0, y0, x0 + pw, y0 + ph)).resize((1280, 720), Image.NEAREST)
    if title:
        d = ImageDraw.Draw(im)
        d.rectangle([0, 670, 1280, 720], fill=(20, 16, 30))
        d.text((640, 695), title, font=F, fill=(232, 246, 255), anchor='mm')
    im.save(os.path.join(tmp, 'f%04d.png' % i))
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', os.path.join(tmp, 'f%04d.png'), '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-crf', '20', out], check=True)
print(out, len(frames), 'frames')
