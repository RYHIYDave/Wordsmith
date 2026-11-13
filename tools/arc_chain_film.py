# ARCS KEEP JUMPING: his film, from the frames tools/scenarios/arc_chain_look.mjs takes (two taps as today, then two with the switch
# on), each frame labelled. python3 tools/arc_chain_film.py <frames prefix> <out.mp4>
import glob, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

prefix, out = sys.argv[1:3]
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 44)
tmp = tempfile.mkdtemp()
for i, f in enumerate(sorted(glob.glob(f'{prefix}_f*.png'))):
    im = Image.open(f).convert('RGB')
    d = ImageDraw.Draw(im)
    text, col = ('Today: each arc strikes once', (220, 216, 236)) if i < 78 else ('Arcs keep jumping', (255, 240, 96))
    d.rectangle((0, 0, im.width, 76), fill=(10, 8, 22))
    d.text((24, 12), text, font=F, fill=col)
    im.save(f'{tmp}/f{i:04d}.png')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', f'{tmp}/f%04d.png', '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], check=True)
print(out)
