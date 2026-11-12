#!/usr/bin/env python3
"""THE LIVING SHADOW IN PLAY, as a moving picture for the owner's phone held sideways (the queue's
finish-mage-and-warlock-eight-sides, step 3, 12 Nov 2026; art/shadow_art.ts behind LIVING_SHADOW, on in a test page only).
The frames tools/scenarios/shadow_look.mjs took of the game on floor 11's ground (a picture every thirtieth of a second of
the game's own time, cut round him), what each part is written over them, at the game's own speed. MP4, not a GIF.
   python3 tools/shadow_play_film.py <frames dir> <out.mp4> [measure.png: the Brawler | the Warlock | the Living Shadow]
   python3 tools/shadow_play_film.py measure <brawler.png> <warlock.png> <shadow.png> <out.png>"""
import glob, json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG, PALE, GREY = (20, 18, 40), (226, 222, 244), (150, 146, 172)

if sys.argv[1] == 'measure':
    # (THE MEASURE: each on the same spot of the Gate Ward's ground, at the game's size, side by side, named)
    names = ['The Brawler (the measure)', 'The Warlock', 'The Living Shadow']
    ims = [Image.open(p).convert('RGB') for p in sys.argv[2:5]]
    w, h = ims[0].size
    font = ImageFont.truetype(B, 30)
    out = Image.new('RGB', (w * 3 + 40, h + 60), BG)
    d = ImageDraw.Draw(out)
    for i, im in enumerate(ims):
        out.paste(im, (10 + i * (w + 10), 50))
        d.text((16 + i * (w + 10), 10), names[i], font=font, fill=PALE)
    out.save(sys.argv[5])
    print(f'{sys.argv[5]}: {out.size[0]} x {out.size[1]}')
    sys.exit(0)

src, out = sys.argv[1], sys.argv[2]
plan = json.load(open(os.path.join(src, 'plan.json')))
fps = plan['fps']
frames = sorted(glob.glob(os.path.join(src, 'f[0-9][0-9][0-9][0-9].png')))
first = Image.open(frames[0])
fw, fh = first.size
TOP, FOOT = 70, 44
W, H = fw, fh + TOP + FOOT
W += W % 2
H += H % 2
big, line = ImageFont.truetype(B, 32), ImageFont.truetype(R, 22)

def part_at(t):
    for p in plan['parts']:
        if p['from'] <= t < p['to']:
            return p['part']
    return plan['parts'][-1]['part']

cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-',
       '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]
pipe = subprocess.Popen(cmd, stdin=subprocess.PIPE)
for i, f in enumerate(frames):
    im = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((16, 16), part_at(i / fps), font=big, fill=PALE)
    im.paste(Image.open(f).convert('RGB'), (0, TOP))
    d.text((16, H - FOOT + 10), 'In the game, floor 11, at its own speed. A test page only: not in the game yet.', font=line, fill=GREY)
    pipe.stdin.write(im.tobytes())
pipe.stdin.close()
pipe.wait()
print(f'{out}: {W} x {H}, {len(frames)} frames, {len(frames) / fps:.1f} s, {os.path.getsize(out) / 1e6:.1f} MB')
