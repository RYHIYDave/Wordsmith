# FLOOR 9'S SIDE BOSSES IN PLAY, THE FILM (tools/scenarios/f9_bosses_film.mjs): its frames whole, as his phone shows the game held
# sideways (a picture pixel to a pixel), each part's name in a band under it, as an mp4 at thirty frames a second; the blows also at
# half speed where SLOW names them.
#   python3 tools/f9_bosses_cut.py <frames prefix, e.g. shots/f9bosses/b> <out.mp4> [slow parts, e.g. smash,slam]
import glob, json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont
pre, out = sys.argv[1], sys.argv[2]
slow = set(sys.argv[3].split(',')) if len(sys.argv) > 3 and sys.argv[3] else set()
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 28)
frames = sorted(glob.glob(pre + '_f*.png'))
note = json.load(open(pre + '_film.json')) if os.path.exists(pre + '_film.json') else None
parts = note['parts'] if note else []
tmp = tempfile.mkdtemp()
n = 0
for i, f in enumerate(frames):
    title = ''
    for part in parts:
        if i >= part[0]:
            title = part[1]
    im = Image.open(f).convert('RGB')
    W, H = im.size
    canvas = Image.new('RGB', (W, H + 56), (20, 16, 30))
    canvas.paste(im, (0, 0))
    d = ImageDraw.Draw(canvas)
    d.text((W // 2, H + 28), title, font=F, fill=(232, 246, 255), anchor='mm')
    reps = 2 if any(s in title.lower() for s in slow) else 1
    for _ in range(reps):
        canvas.save(os.path.join(tmp, 'f%05d.png' % n))
        n += 1
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', os.path.join(tmp, 'f%05d.png'), '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-crf', '21', out], check=True)
for f in glob.glob(os.path.join(tmp, '*.png')):
    os.remove(f)
os.rmdir(tmp)
print(out, n, 'frames')
