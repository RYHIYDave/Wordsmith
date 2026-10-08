#!/usr/bin/env python3
"""Films side by side, for the owner's phone (the art chat's two tests of weight, 8 Oct 2026).
   python3 tools/weight_film.py <out.gif> "<title>" "<label>@<frames prefix>@<where>" ...
   Each pane is cut out of every frame of its film (<prefix>_f000.png ..., a picture every
   sixtieth of a second of the game's time, as tools/scenarios/film_heavy_blow.mjs and
   film_run_feet.mjs make them) round a point: <where> is "x,y" (game pixels on the screen, the same
   in every frame) or the name of a field of <prefix>_at.json that says it for each frame (so a pane
   can stand still on the floor while the camera follows the hero). The film is played as it plays
   in the game (every other picture, thirty a second), then once more SLOW times slower (every
   picture), each pass ending on a pause.
   env: W, H     the size of a pane in game pixels (default 120 x 90)
        UP       how much of a pane is above the point, 0..1 (default 0.5)
        OFF      dx,dy: game pixels added to every point (default 0,0)
        S        film pixels to a game pixel (default 2: a pixel of the heroes' art is one)
        COLS     panes to a row (default 2)
        SLOW     how many times slower the second pass is (default 4; 0: no second pass)
        REAL     0: no pass at the game's own speed
        FROM, TO the pictures used (default all)
        PAUSE    how long each pass ends on its last picture, hundredths of a second (default 90)
        SHEET    also a still sheet beside the film (<out>.png): every SHEET-th picture of FROM..TO,
                 one row per pane, at S
        SHEET_FROM, SHEET_TO  the pictures of the sheet (default FROM..TO)
        MARKS    1: where a pane's film has <prefix>_feet.json (tools/feet_marks.ts), a short white
                 line on the floor under the spot where each toe came down, for as long as it stays
                 down: a toe that slides is seen to leave its mark. In the slowed pass and the still
                 sheet only: the pass at the game's own speed is the game as it plays.
        SLOW_NOTE the note at the top right of the slowed pass (default "four times slower", or so)
        FOOT     a line of words under the panes in the slowed pass (what the marks are, say)
        FUZZ     a share in hundredths (2, say): a pixel that has changed less than that since the
                 picture before is not stored again (ImageMagick's -fuzz, -layers OptimizeTransparency).
                 The pool of light round a hero brightens a little of the floor in every picture;
                 FUZZ=2 makes a film of them about two thirds the size, and no pixel of any picture
                 is then more than about 14 of 255 off in any colour (measured on the films of 8 Oct)."""
import json, os, shutil, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

out, title = sys.argv[1], sys.argv[2]
specs = sys.argv[3:]
W, H = int(os.environ.get('W', 120)), int(os.environ.get('H', 90))
UP = float(os.environ.get('UP', 0.5))
S = int(os.environ.get('S', 2))
COLS = int(os.environ.get('COLS', 2))
SLOW = int(os.environ.get('SLOW', 4))
REAL = os.environ.get('REAL', '1') != '0'
PAUSE = int(os.environ.get('PAUSE', 90))
SHEET = int(os.environ.get('SHEET', 0))
RES = 2   # screenshot pixels to a game pixel (tools/playtest.mjs at 960 x 540)
OFF = tuple(float(v) for v in os.environ.get('OFF', '0,0').split(','))

panes = []
for spec in specs:
    label, prefix, where = spec.split('@')
    names = []
    i = 0
    while os.path.exists(f'{prefix}_f{i:03d}.png'):
        names.append(f'{prefix}_f{i:03d}.png')
        i += 1
    if not names:
        sys.exit('no frames for ' + prefix)
    if ',' in where:
        x, y = (float(v) for v in where.split(','))
        points = [(x, y)] * len(names)
    else:
        at = json.load(open(prefix + '_at.json'))
        points = [tuple(a[where]) for a in at]
    # (the marks under the toes: each is where a toe came down, as the floor stands, against `mid`)
    marks = []
    if os.environ.get('MARKS') == '1' and os.path.exists(prefix + '_feet.json'):
        mids = [tuple(a['mid']) for a in json.load(open(prefix + '_at.json'))]
        for m in json.load(open(prefix + '_feet.json'))['marks']:
            marks.append((m['from'], m['to'], m['at'], mids))
    panes.append((label, names, points, marks))
n = min(len(p[1]) for p in panes)
first = int(os.environ.get('FROM', 0))
last = min(n - 1, int(os.environ.get('TO', n - 1)))

try:
    B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
    font = ImageFont.truetype(B, 17)
    small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
except Exception:
    font = small = ImageFont.load_default()
GOLD, GREY, INK, PAGE = (255, 216, 102), (168, 162, 184), (245, 236, 214), (22, 19, 28)
PAD, HEAD, LAB = 6, 30, 22
cw, ch = W * S, H * S
cols = min(COLS, len(panes))
rows = -(-len(panes) // cols)
FW = cols * cw + (cols + 1) * PAD
FOOT = os.environ.get('FOOT', '')
FH = HEAD + rows * (ch + LAB + PAD) + PAD + (22 if FOOT else 0)

def cut(name, point, marks=(), i=0):
    """The pane round `point` (game pixels) out of one screenshot, enlarged S/RES times with hard
    edges; and the marks under the toes that are down in picture i."""
    x, y = point[0] + OFF[0], point[1] + OFF[1]
    left = round(x * RES - W * RES / 2)
    top = round(y * RES - H * RES * UP)
    im = Image.open(name).convert('RGB').crop((left, top, left + W * RES, top + H * RES))
    im = im.resize((cw, ch), Image.NEAREST) if S != RES else im
    if marks:
        dr = ImageDraw.Draw(im)
        k = S / RES
        for a, b, at, mids in marks:
            if not a <= i <= b:
                continue
            # (where the toe came down, on the screen in this picture: the floor's place now, and the toe's on it)
            gx, gy = mids[i][0] + at[0], mids[i][1] + at[1]
            px = (gx * RES - left) * k
            py = (gy * RES - top) * k
            # a short upright line on the floor just under that spot, a game pixel wide
            dr.rectangle((round(px - k / 2), round(py + 1.5 * RES * k), round(px + k / 2) - 1, round(py + 4.5 * RES * k)), fill=(255, 255, 255))
    return im

def frame(i, note, marked=False):
    im = Image.new('RGB', (FW, FH), PAGE)
    dr = ImageDraw.Draw(im)
    dr.text((PAD, 6), title, fill=GOLD, font=font)
    dr.text((FW - PAD - dr.textlength(note, font=small), 8), note, fill=GREY, font=small)
    for k, (label, names, points, marks) in enumerate(panes):
        x0 = PAD + (k % cols) * (cw + PAD)
        y0 = HEAD + (k // cols) * (ch + LAB + PAD)
        im.paste(cut(names[i], points[i], marks if marked else (), i), (x0, y0))
        dr.text((x0 + (cw - dr.textlength(label, font=small)) / 2, y0 + ch + 3), label, fill=INK, font=small)
    if FOOT and marked:
        dr.text((PAD, FH - 22), FOOT, fill=GREY, font=small)
    return im

tmp = tempfile.mkdtemp(prefix='weight_film_')
durs = []
k = 0
def put(im, cs):
    global k
    im.save(os.path.join(tmp, f'{k:04d}.png'))
    durs.append(cs)
    k += 1
words = {2: 'twice', 3: 'three times', 4: 'four times', 5: 'five times', 6: 'six times', 8: 'eight times'}
if REAL:
    real = [3, 3, 4]   # hundredths of a second: thirty pictures a second
    for j, i in enumerate(range(first, last + 1, 2)):
        put(frame(i, 'as it plays'), real[j % 3])
    durs[-1] = PAUSE
if SLOW:
    # (every picture, each standing SLOW sixtieths of a second: in whole hundredths, spread so that
    # the sum is right, as 7, 7, 6 for four times slower)
    note = os.environ.get('SLOW_NOTE', f'{words.get(SLOW, str(SLOW) + " times")} slower')
    total = 0
    for j, i in enumerate(range(first, last + 1)):
        want = round((j + 1) * SLOW * 100 / 60)
        put(frame(i, note, True), max(2, want - total))
        total = want
    durs[-1] = PAUSE + 40

files = sorted(os.listdir(tmp))
if not files:
    # (REAL=0 SLOW=0: only the still sheet)
    out = os.path.splitext(out)[0] + '.none'
# One palette for every picture, from a spread of them (so colours do not shimmer), with room for the captions' own.
picks = [files[round(j * (len(files) - 1) / 15)] for j in range(16)] if files else []
if files:
    strip = Image.new('RGB', (FW, FH * len(picks)))
    for j, f in enumerate(picks):
        strip.paste(Image.open(os.path.join(tmp, f)), (0, j * FH))
    for j, c in enumerate([GOLD, GREY, INK, PAGE]):
        strip.paste(c, (j * 40, 0, j * 40 + 40, 40))
    pal = strip.quantize(colors=255, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    del strip
    ims = [Image.open(os.path.join(tmp, f)).quantize(palette=pal, dither=Image.Dither.NONE) for f in files]
    ims[0].save(out, save_all=True, append_images=ims[1:], duration=[d * 10 for d in durs], loop=0, optimize=False, disposal=1)
if files and shutil.which('convert'):
    small_out = out + '.small.gif'
    fuzz = os.environ.get('FUZZ', '')
    how = ['-fuzz', f'{fuzz}%', '-layers', 'OptimizeTransparency'] if fuzz else ['-layers', 'Optimize']
    try:
        subprocess.run(['convert', out, *how, small_out], check=True, timeout=600)
        if os.path.getsize(small_out) < os.path.getsize(out):
            os.replace(small_out, out)
        else:
            os.remove(small_out)
    except Exception as e:
        print('(not made smaller:', e, ')')
if files:
    print(f'{out}: {len(files)} pictures, {sum(durs) / 100:.1f} s, {FW} x {FH}, {os.path.getsize(out) / 1024:.0f} KB')

if SHEET:
    sf = int(os.environ.get('SHEET_FROM', first))
    st = int(os.environ.get('SHEET_TO', last))
    picks = list(range(sf, st + 1, SHEET))
    LW = 0
    sheet = Image.new('RGB', (PAD + len(picks) * (cw + PAD), HEAD + len(panes) * (ch + LAB + PAD)), PAGE)
    dr = ImageDraw.Draw(sheet)
    dr.text((PAD, 6), title + '  (a picture every ' + ('sixtieth' if SHEET == 1 else f'{SHEET} sixtieths') + ' of a second)', fill=GOLD, font=font)
    for r, (label, names, points, marks) in enumerate(panes):
        y0 = HEAD + r * (ch + LAB + PAD)
        for c, i in enumerate(picks):
            x0 = PAD + c * (cw + PAD)
            sheet.paste(cut(names[i], points[i], marks, i), (x0, y0))
        dr.text((PAD, y0 + ch + 3), label, fill=INK, font=small)
    sheet.save(os.path.splitext(out)[0] + '.png')
    print('sheet', os.path.splitext(out)[0] + '.png', sheet.size)
shutil.rmtree(tmp)
