#!/usr/bin/env python3
"""Join the frames collected by tools/hero_gif.mjs into a moving picture.
   python3 tools/hero_gif.py <folder of f00.png, f01.png, ...> <out.gif> [ms per frame = 62]"""
import os
import sys
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
ms = int(sys.argv[3]) if len(sys.argv) > 3 else 62
every = int(sys.argv[4]) if len(sys.argv) > 4 else 0
names = sorted(n for n in os.listdir(src) if n.endswith('.png'))
def frame(i):
    return Image.open(os.path.join(src, names[i])).convert('RGB')
w, h = frame(0).size
# One palette for every frame, so colours do not shimmer from frame to frame. It is taken from a
# spread of the frames, not all of them, and the frames are read one at a time as they are
# written: a long film of big frames, held all at once, was more than the machine has (6 Oct 2026).
picks = sorted(set(round(k * (len(names) - 1) / 23) for k in range(24))) if len(names) > 24 else list(range(len(names)))
strip = Image.new('RGB', (w, h * len(picks)))
for k, i in enumerate(picks):
    strip.paste(frame(i), (0, k * h))
pal = strip.quantize(colors=255, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
del strip
def quantized(start):
    for i in range(start, len(names)):
        yield frame(i).quantize(palette=pal, dither=Image.Dither.NONE)
frame(0).quantize(palette=pal, dither=Image.Dither.NONE).save(out, save_all=True, append_images=quantized(1), duration=ms, loop=0, optimize=False)
class Frames:
    def __len__(self): return len(names)
    def __getitem__(self, i): return frame(i)
frames = Frames()
# Most of each frame is the same as the one before (the floor, the captions): ImageMagick, where
# it is installed, keeps only what changed, which makes the file a quarter of the size. (It shifts
# a few colours by a shade or two as it goes: checked, and not to be seen.)
import shutil
import subprocess
if shutil.which('convert'):
    small = out + '.small.gif'
    try:
        subprocess.run(['convert', out, '-layers', 'Optimize', small], check=True, timeout=300)
        if os.path.getsize(small) < os.path.getsize(out):
            os.replace(small, out)
    except Exception as e:  # noqa: BLE001 (the unshrunk picture is still good)
        print('not shrunk:', e)
    finally:
        if os.path.exists(small):
            os.remove(small)
print(out, (w, h), f'{len(frames)} frames', f'{os.path.getsize(out) // 1024} KB')
if every > 0:
    # a contact sheet: one frame in `every`, left to right and top to bottom, each with its number
    from PIL import ImageDraw
    picks = list(range(0, len(frames), every))
    cols = max(1, min(len(picks), 2400 // w))
    rows = (len(picks) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * w, rows * h), (22, 19, 28))
    for k, i in enumerate(picks):
        sheet.paste(frames[i], ((k % cols) * w, (k // cols) * h))
        ImageDraw.Draw(sheet).text(((k % cols) * w + w - 60, (k // cols) * h + 10), f'#{i}', fill=(255, 216, 102))
    name = out[:-4] + '.sheet.png'
    sheet.save(name)
    print(name, sheet.size)
