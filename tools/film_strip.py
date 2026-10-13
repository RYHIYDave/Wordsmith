# film_strip.py <strip.png> <out.gif> <frames> <fps> [cell=340] [cols=3] [scale=1] [cell height=cell]
# Cuts a strip of frames (src/dev/preview_unfinished.ts, hash strip:...) into a looping film.
import sys
from PIL import Image
src, out, n, fps = sys.argv[1], sys.argv[2], int(sys.argv[3]), float(sys.argv[4])
cell = int(sys.argv[5]) if len(sys.argv) > 5 else 340
cols = int(sys.argv[6]) if len(sys.argv) > 6 else 3
scale = int(sys.argv[7]) if len(sys.argv) > 7 else 1
ch = int(sys.argv[8]) if len(sys.argv) > 8 else cell
im = Image.open(src).convert('RGB')
frames = []
for i in range(n):
    x, y = (i % cols) * cell, (i // cols) * ch
    f = im.crop((x, y, x + cell, y + ch))
    if scale != 1:
        f = f.resize((cell * scale, ch * scale), Image.NEAREST)
    frames.append(f)
strip = Image.new('RGB', (frames[0].width, frames[0].height * min(4, n)))
for i in range(min(4, n)):
    strip.paste(frames[(i * n) // min(4, n)], (0, frames[0].height * i))
pal = strip.quantize(colors=255, method=Image.Quantize.FASTOCTREE)
q = [f.quantize(palette=pal, dither=Image.Dither.NONE) for f in frames]
q[0].save(out, save_all=True, append_images=q[1:], duration=int(round(1000 / fps)), loop=0)
print(out, n, 'frames')
