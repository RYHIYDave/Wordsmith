# THE WARLOCK BROUGHT UP, THE MAN: PICTURES AND FILMS FROM HIS FRAMES (the queue's finish-mage-and-warlock-eight-sides, step 4,
# 12 Nov 2026; docs/mockups/warlock_up2/README.md, "The man"). Lays out what tools/warlock_man_pics.ts painted.
#   python3 tools/warlock_man_film.py sheet <dir> <out.png> [scale] [key] [who,...] [crop w,h]
#       a row for each of `who` (game, up) and each moment, a column for each side, each frame `scale` times (nearest)
import json, sys
from PIL import Image, ImageDraw, ImageFont

BG = (34, 30, 40)
LABEL = (226, 220, 236)
SIDE_NAME = {'front': 'down-right', 'toward': 'toward you', 'frontL': 'down-left', 'sideL': 'left', 'backL': 'up-left',
             'away': 'away from you', 'back': 'up-right', 'side': 'right'}
WHO_NAME = {'game': 'as he is now', 'up': 'brought up'}

def font(n):
    for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf']:
        try:
            return ImageFont.truetype(f, n)
        except Exception:
            pass
    return ImageFont.load_default()

def crop_box(frames, d):
    # the box round every frame's figure (the same for all, so they line up)
    x0 = y0 = 10**9; x1 = y1 = -1
    for f in frames:
        im = Image.open(f"{d}/{f['name']}")
        b = im.getbbox()
        if b:
            x0 = min(x0, b[0]); y0 = min(y0, b[1]); x1 = max(x1, b[2]); y1 = max(y1, b[3])
    return (max(0, x0 - 3), max(0, y0 - 3), x1 + 3, y1 + 3)

def sheet(d, out, scale=4, key=None, whos=None):
    frames = json.load(open(f'{d}/frames.json'))
    if key: frames = [f for f in frames if f['key'] == key]
    if whos: frames = [f for f in frames if f['who'] in whos]
    sides = []
    for f in frames:
        if f['side'] not in sides: sides.append(f['side'])
    rows = []
    for f in frames:
        r = (f['who'], f['t'])
        if r not in rows: rows.append(r)
    box = crop_box(frames, d)
    cw = (box[2] - box[0]) * scale; ch = (box[3] - box[1]) * scale
    lab = 34; left = 0
    W = left + cw * len(sides); H = lab + (ch + lab) * len(rows)
    img = Image.new('RGB', (W, H), BG)
    dr = ImageDraw.Draw(img)
    F = font(22)
    for i, sd in enumerate(sides):
        dr.text((left + i * cw + 8, 6), SIDE_NAME.get(sd, sd), fill=LABEL, font=F)
    for j, (who, t) in enumerate(rows):
        y = lab + j * (ch + lab)
        dr.text((8, y + 4), f"{WHO_NAME.get(who, who)}, {t:.2f} s", fill=LABEL, font=F)
        for i, sd in enumerate(sides):
            f = next((g for g in frames if g['who'] == who and g['t'] == t and g['side'] == sd), None)
            if not f: continue
            im = Image.open(f"{d}/{f['name']}").convert('RGBA').crop(box)
            im = im.resize((im.width * scale, im.height * scale), Image.NEAREST)
            img.paste(im, (left + i * cw, y + lab), im)
    img.save(out)
    print(out, img.size)

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'sheet':
        d, out = sys.argv[2], sys.argv[3]
        scale = int(sys.argv[4]) if len(sys.argv) > 4 else 4
        key = sys.argv[5] if len(sys.argv) > 5 and sys.argv[5] != '-' else None
        whos = sys.argv[6].split(',') if len(sys.argv) > 6 else None
        sheet(d, out, scale, key, whos)

# ---------------------------------------------------------------------------------------------------------------------------
# IN PLAY (tools/scenarios/warlock_up_look.mjs on pages made by tools/warlock_up_page.mjs):
#   python3 tools/warlock_man_film.py film <now frames dir> <brought up frames dir> <out.mp4> [scale]
#       the two films side by side, what each part is written over them, at the game's own speed (MP4, not a GIF)
#   python3 tools/warlock_man_film.py measure <brawler.png> <now.png> <up.png> <out.png>
#   python3 tools/warlock_man_film.py sides <prefix> <out.png>        (prefix_<way>.png, eight of them, two rows of four)
import glob, os, subprocess

B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
DEEP, PALE, GREY, CYAN = (20, 18, 40), (226, 222, 244), (150, 146, 172), (90, 220, 236)

def part_at(plan, t):
    for p in plan['parts']:
        if p['from'] <= t < p['to']:
            return p['part']
    return plan['parts'][-1]['part']

def film(now_dir, up_dir, out, scale=0.7, close=0.65, feet=105 / 130):
    plan = json.load(open(os.path.join(up_dir, 'plan.json')))
    fps = plan['fps']
    a = sorted(glob.glob(os.path.join(now_dir, 'f[0-9][0-9][0-9][0-9].png')))
    b = sorted(glob.glob(os.path.join(up_dir, 'f[0-9][0-9][0-9][0-9].png')))
    n = min(len(a), len(b))
    fw, fh = Image.open(b[0]).size
    pw, ph = int(fw * scale), int(fh * scale)
    TOP, LAB, FOOT, GAP = 58, 40, 40, 12
    W = pw * 2 + GAP; H = TOP + LAB + ph + FOOT
    W += W % 2; H += H % 2
    big, mid, line = ImageFont.truetype(B, 30), ImageFont.truetype(B, 24), ImageFont.truetype(R, 20)
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-',
           '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]
    pipe = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i in range(n):
        im = Image.new('RGB', (W, H), DEEP)
        d = ImageDraw.Draw(im)
        d.text((14, 12), part_at(plan, i / fps), font=big, fill=PALE)
        d.text((14, TOP + 6), 'As he is now', font=mid, fill=GREY)
        d.text((pw + GAP + 14, TOP + 6), 'Brought up', font=mid, fill=CYAN)
        # (closer on him while he is a man; the whole picture for the change, the demon being far bigger: `close`, a share of
        # the frame round where he stands, his feet `feet` of the way down it)
        part = part_at(plan, i / fps)
        def cut(path):
            fr = Image.open(path).convert('RGB')
            if close and 'changes' not in part:
                cw, ch = int(fw * close), int(fh * close)
                x0 = (fw - cw) // 2
                y0 = max(0, min(fh - ch, int(fh * feet - ch * 0.84)))
                fr = fr.crop((x0, y0, x0 + cw, y0 + ch))
            return fr.resize((pw, ph), Image.LANCZOS)
        im.paste(cut(a[i]), (0, TOP + LAB))
        im.paste(cut(b[i]), (pw + GAP, TOP + LAB))
        d.text((14, H - FOOT + 9), 'In the game, floor 11, at its own speed, the same moments. A test page only: not in the game yet.', font=line, fill=GREY)
        pipe.stdin.write(im.tobytes())
    pipe.stdin.close()
    pipe.wait()
    print(f'{out}: {W} x {H}, {n} frames, {n / fps:.1f} s, {os.path.getsize(out) / 1e6:.1f} MB')

def measure(paths, out):
    names = ['The Brawler (the measure)', 'The Warlock now', 'The Warlock brought up']
    ims = [Image.open(p).convert('RGB') for p in paths]
    w, h = ims[0].size
    f = ImageFont.truetype(B, 30)
    o = Image.new('RGB', (w * 3 + 40, h + 60), DEEP)
    d = ImageDraw.Draw(o)
    for i, im in enumerate(ims):
        o.paste(im, (10 + i * (w + 10), 50))
        d.text((16 + i * (w + 10), 10), names[i], font=f, fill=CYAN if i == 2 else PALE)
    o.save(out)
    print(out, o.size)

def sides(prefix, out):
    ways = [('downright', 'down-right'), ('toward', 'toward you'), ('downleft', 'down-left'), ('left', 'left'),
            ('upleft', 'up-left'), ('away', 'away from you'), ('upright', 'up-right'), ('right', 'right')]
    ims = [Image.open(f'{prefix}_{k}.png').convert('RGB') for k, _ in ways]
    w, h = ims[0].size
    f = ImageFont.truetype(B, 26)
    LAB = 40
    o = Image.new('RGB', (w * 4 + 30, (h + LAB) * 2 + 10), DEEP)
    d = ImageDraw.Draw(o)
    for i, (im, (_, name)) in enumerate(zip(ims, ways)):
        x = (i % 4) * (w + 10); y = (i // 4) * (h + LAB + 10)
        d.text((x + 10, y + 6), f'facing {name}', font=f, fill=PALE)
        o.paste(im, (x, y + LAB))
    o.save(out)
    print(out, o.size)

if __name__ == '__main__' and sys.argv[1] == 'film':
    film(sys.argv[2], sys.argv[3], sys.argv[4], float(sys.argv[5]) if len(sys.argv) > 5 else 0.7)
if __name__ == '__main__' and sys.argv[1] == 'measure':
    measure(sys.argv[2:5], sys.argv[5])
if __name__ == '__main__' and sys.argv[1] == 'sides':
    sides(sys.argv[2], sys.argv[3])
