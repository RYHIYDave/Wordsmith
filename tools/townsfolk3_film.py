# THE TOWN'S PEOPLE, NOW AND REDRAWN, A FILM: each of the four at their work in the game's own town, as he is now and redrawn,
# side by side, thirty frames a second, each doing what he does now and then (the frames are the game's own, made a frame at
# a time by tools/scenarios/townsfolk3_film.mjs with N=190, once with OLD=1 and once without). H.264, for a phone.
#   python3 tools/townsfolk3_film.py <frames dir> <out.mp4>
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

frames, out = sys.argv[1], sys.argv[2]
N = 190
FONT = ImageFont.load_default()


def tag(text, color):
    small = Image.new('L', (len(text) * 7 + 6, 13), 0)
    ImageDraw.Draw(small).text((3, 1), text, fill=255, font=FONT)
    big = small.resize((small.width * 4, small.height * 4), Image.NEAREST)
    box = Image.new('RGB', (big.width + 8, big.height + 8), (13, 16, 48))
    box.paste(Image.new('RGB', big.size, color), (4, 4), big)
    return box


NOW = tag('NOW', (233, 236, 255))
NEW = tag('REDRAWN, 30 A SECOND', (40, 220, 240))
W, H = 1608, 672
ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                       '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'slow', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
for who in ['armourer', 'mystic', 'wordsmith', 'stranger']:
    for i in range(N):
        a = Image.open(f'{frames}/{who}_old/f{i:04d}.png').convert('RGB')
        b = Image.open(f'{frames}/{who}/f{i:04d}.png').convert('RGB')
        x0 = (a.width - 800) // 2
        fr = Image.new('RGB', (W, H), (13, 16, 48))
        fr.paste(a.crop((x0, 0, x0 + 800, H)), (0, 0))
        fr.paste(b.crop((x0, 0, x0 + 800, H)), (808, 0))
        fr.paste(NOW, (0, H - NOW.height))
        fr.paste(NEW, (808, H - NEW.height))
        ff.stdin.write(fr.tobytes())
ff.stdin.close()
ff.wait()
print('wrote', out)
