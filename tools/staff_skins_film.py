# THE MAGE'S UNIQUE STAVES IN HER HANDS, IN THE GAME: the film for the owner, from the frames tools/scenarios/staff_skins_film.mjs
# took (one folder of frames for each staff, notes.json), each staff's name above her, one after the other, as one MP4 (his
# rule: films, not GIFs); and a sheet of stills, each staff a row, her from four sides.
#   python3 tools/staff_skins_film.py /dev/shm/staffs/film docs/mockups/staff_skins/pictures/staves_in_game.mp4
import json
import os
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
notes = json.load(open(os.path.join(src, 'notes.json')))
FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
BAR = 56


def labelled(img, text):
    w, h = img.size
    o = Image.new('RGB', (w, h + BAR), (18, 16, 26))
    o.paste(img.convert('RGB'), (0, BAR))
    d = ImageDraw.Draw(o)
    tw = d.textlength(text, font=FONT)
    d.text(((w - tw) / 2, 11), text, font=FONT, fill=(236, 232, 248))
    return o


tmp = tempfile.mkdtemp(prefix='staves_')
n = 0
for note in notes:
    d = os.path.join(src, note['id'])
    files = sorted(f for f in os.listdir(d) if f.endswith('.png'))
    for f in files:
        labelled(Image.open(os.path.join(d, f)), note['name']).save(os.path.join(tmp, f'f{n:05d}.png'))
        n += 1
os.makedirs(os.path.dirname(out), exist_ok=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', os.path.join(tmp, 'f%05d.png'),
                '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], check=True)
print(f'{out}: {n} frames')

# (the stills: down and to the right, side-on to the left, away, side-on to the right: the film's moments for those sides)
AT = [('toward you', 18), ('side-on', 66), ('away', 90), ('other side', 114)]
rows = []
for note in notes:
    d = os.path.join(src, note['id'])
    ims = [Image.open(os.path.join(d, f'f{i:04d}.png')).convert('RGB') for _, i in AT]
    w, h = ims[0].size
    cut = [im.crop((w // 4, h // 10, 3 * w // 4, h)) for im in ims]
    cw, ch = cut[0].size
    row = Image.new('RGB', (cw * len(cut), ch))
    for k, c in enumerate(cut):
        row.paste(c, (k * cw, 0))
    rows.append(labelled(row, note['name']))
sheet = Image.new('RGB', (rows[0].width, sum(r.height for r in rows)))
y = 0
for r in rows:
    sheet.paste(r, (0, y))
    y += r.height
still = out.replace('.mp4', '_sides.png')
sheet.save(still)
print(f'{still}: {sheet.size[0]}x{sheet.size[1]}')
