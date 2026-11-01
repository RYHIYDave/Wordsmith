#!/usr/bin/env python3
"""THE PICTURES FOR THE OWNER: the new classes painted now and on the graphics chip, side by side (docs/mockups/gpu_sculpt).

Reads the frames tools/gpu_sculpt_check.mjs `pics` saved (shots/gpu_sculpt/pics) and makes
  docs/mockups/gpu_sculpt/pictures/gpu_side_by_side.png   rows of NOW | GRAPHICS CHIP | DIFFERENCES, three times as big
  docs/mockups/gpu_sculpt/pictures/gpu_side_by_side.mp4   the demon's rake and the change, NOW left, GRAPHICS CHIP right, twice as big
  python3 tools/gpu_sculpt_pictures.py [png|mp4|both]
"""
import base64
import glob
import json
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PICS = os.path.join(ROOT, 'shots/gpu_sculpt/pics')
OUT = os.path.join(ROOT, 'docs/mockups/gpu_sculpt/pictures')
BG = (44, 40, 54)
PANEL = (30, 27, 38)
TEXT = (236, 230, 220)
DIM = (160, 152, 172)
LIT = (255, 236, 64)


def font(size, bold=False):
    for f in (['DejaVuSans-Bold.ttf', 'LiberationSans-Bold.ttf'] if bold else ['DejaVuSans.ttf', 'LiberationSans-Regular.ttf']):
        for d in ('/usr/share/fonts/truetype/dejavu', '/usr/share/fonts/truetype/liberation', '/usr/share/fonts/truetype'):
            p = os.path.join(d, f)
            if os.path.exists(p):
                return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def load(path):
    r = json.load(open(path))
    w, h = r['pw'], r['ph']
    cpu = np.frombuffer(base64.b64decode(r['cpu']), np.uint8).reshape(h, w, 4)
    gpu = np.frombuffer(base64.b64decode(r['gpu']), np.uint8).reshape(h, w, 4)
    mark = np.frombuffer(base64.b64decode(r['mark']), np.uint8).reshape(h, w)
    return r, cpu, gpu, mark


def on_bg(a, bg=PANEL):
    """A frame laid on a plain ground (its pixels are crisp: wholly there or not)."""
    out = np.empty(a.shape[:2] + (3,), np.uint8)
    out[:] = bg
    m = a[:, :, 3] > 0
    out[m] = a[:, :, :3][m]
    return out


def box_of(*arrs, pad=4):
    m = np.zeros(arrs[0].shape[:2], bool)
    for a in arrs:
        m |= a[:, :, 3] > 0
    ys, xs = np.nonzero(m)
    if not len(xs):
        return 0, 0, arrs[0].shape[1], arrs[0].shape[0]
    h, w = m.shape
    return max(0, xs.min() - pad), max(0, ys.min() - pad), min(w, xs.max() + 1 + pad), min(h, ys.max() + 1 + pad)


def big(img, k):
    return Image.fromarray(img).resize((img.shape[1] * k, img.shape[0] * k), Image.NEAREST)


def diff_panel(cpu, mark, k):
    """The frame dimmed, every pixel that differs lit bright, and ringed so a lone one can be found."""
    base = on_bg(cpu).astype(np.float32) * 0.32
    base = base.astype(np.uint8)
    base[mark > 0] = LIT
    im = big(base, k)
    d = ImageDraw.Draw(im)
    ys, xs = np.nonzero(mark)
    for x, y in zip(xs, ys):
        cx, cy = x * k + k / 2, y * k + k / 2
        d.ellipse([cx - 4 * k, cy - 4 * k, cx + 4 * k, cy + 4 * k], outline=LIT, width=2)
    return im


def count_words(n):
    return f'{n:,}'


def png():
    K = 3
    rows = []
    for p in sorted(glob.glob(os.path.join(PICS, 'row*.json')), key=lambda s: int(os.path.basename(s)[3:-5])):
        r, cpu, gpu, mark = load(p)
        x0, y0, x1, y1 = box_of(cpu, gpu, pad=6)
        c, g, m = cpu[y0:y1, x0:x1], gpu[y0:y1, x0:x1], mark[y0:y1, x0:x1]
        d = r['diff']
        share = 100 * d['diff'] / max(1, d['fig'])
        if d['diff'] == 0:
            cap = f"{r['label']}: not one pixel differs (of {count_words(d['fig'])})"
        else:
            cap = f"{r['label']}: {count_words(d['diff'])} of {count_words(d['fig'])} pixels differ ({share:.2f}%)"
        rows.append((cap, big(on_bg(c), K), big(on_bg(g), K), diff_panel(c, m, K)))
    gap = 18
    head_h = 120
    cap_h = 46
    col_w = max(max(a.width for _, a, _, _ in rows), 300)
    W = gap + 3 * (col_w + gap)
    H = head_h + sum(cap_h + a.height + gap for _, a, _, _ in rows) + gap
    sheet = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(sheet)
    f_title, f_head, f_cap = font(40, True), font(30, True), font(28)
    d.text((gap, 14), 'The new classes: painted now, and on the graphics chip', font=f_title, fill=TEXT)
    for j, t in enumerate(['NOW', 'GRAPHICS CHIP', 'DIFFERENCES (lit and ringed)']):
        d.text((gap + j * (col_w + gap), 72), t, font=f_head, fill=LIT if j == 2 else TEXT)
    y = head_h
    for cap, a, b, c in rows:
        d.text((gap, y + 8), cap, font=f_cap, fill=TEXT)
        y += cap_h
        for j, im in enumerate((a, b, c)):
            x = gap + j * (col_w + gap) + (col_w - im.width) // 2
            sheet.paste(im, (x, y))
        y += a.height + gap
    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, 'gpu_side_by_side.png')
    sheet.save(out, optimize=True)
    print('wrote', out, sheet.size)


def mp4():
    K = 2
    fps = 30
    films = []
    for k in (0, 1):
        files = sorted(glob.glob(os.path.join(PICS, f'film{k}', '*.json')))
        frames = [load(p) for p in files]
        films.append(frames)
    # one stage per film, big enough for every frame of it, each laid by its anchor
    W, H = 1600, 900
    f_title, f_cap, f_small = font(44, True), font(34, True), font(26)
    video = []

    def card(lines):
        im = Image.new('RGB', (W, H), BG)
        d = ImageDraw.Draw(im)
        y = H // 2 - 40 * len(lines)
        for i, (t, f, c) in enumerate(lines):
            tw = d.textlength(t, font=f)
            d.text(((W - tw) / 2, y), t, font=f, fill=c)
            y += 80
        return im

    def stage(frames):
        x0 = min(r['ax'] - 0 for r, *_ in frames)
        # (the union of every frame's drawn pixels, by anchor, so nothing jumps)
        lo_x, lo_y, hi_x, hi_y = 1e9, 1e9, -1e9, -1e9
        for r, c, g, m in frames:
            bx0, by0, bx1, by1 = box_of(c, g, pad=4)
            ax, ay = round(r['ax']), round(r['ay'])
            lo_x, lo_y = min(lo_x, bx0 - ax), min(lo_y, by0 - ay)
            hi_x, hi_y = max(hi_x, bx1 - ax), max(hi_y, by1 - ay)
        return int(lo_x), int(lo_y), int(hi_x), int(hi_y)

    def frame_img(r, c, g, m, st, label, speed):
        lo_x, lo_y, hi_x, hi_y = st
        fw, fh = hi_x - lo_x, hi_y - lo_y
        ax, ay = round(r['ax']), round(r['ay'])

        def placed(a):
            out = np.zeros((fh, fw, 4), np.uint8)
            sx, sy = lo_x + ax, lo_y + ay
            h, w = a.shape[:2]
            ys0, xs0 = max(0, sy), max(0, sx)
            ys1, xs1 = min(h, sy + fh), min(w, sx + fw)
            out[ys0 - sy:ys1 - sy, xs0 - sx:xs1 - sx] = a[ys0:ys1, xs0:xs1]
            return out

        a = big(on_bg(placed(c)), K)
        b = big(on_bg(placed(g)), K)
        im = Image.new('RGB', (W, H), BG)
        d = ImageDraw.Draw(im)
        top = 150
        gap = (W - a.width - b.width) // 3
        im.paste(a, (gap, top))
        im.paste(b, (2 * gap + a.width, top))
        d.text((gap, top - 52), 'NOW', font=f_cap, fill=TEXT)
        d.text((2 * gap + a.width, top - 52), 'GRAPHICS CHIP', font=f_cap, fill=TEXT)
        d.text((40, 24), f'{label}{speed}', font=f_title, fill=TEXT)
        dd = r['diff']
        msg = 'not one pixel differs' if dd['diff'] == 0 else f"{dd['diff']} of {dd['fig']:,} pixels differ ({100 * dd['diff'] / max(1, dd['fig']):.2f}%)"
        d.text((40, H - 60), f"frame {r['i'] + 1} of {len(frames_now)}: {msg}", font=f_small, fill=DIM)
        return im

    intro = card([('The new classes, painted now and on the graphics chip', f_title, TEXT), ('NOW on the left, GRAPHICS CHIP on the right, twice as big', f_small, DIM)])
    video += [intro] * (fps * 2)
    for frames in films:
        frames_now = frames
        label = frames[0][0]['label']
        st = stage(frames)
        imgs = [frame_img(r, c, g, m, st, label, '') for r, c, g, m in frames]
        slow = [frame_img(r, c, g, m, st, label, ', at half speed') for r, c, g, m in frames]
        video += [card([(label, f_title, TEXT)])] * fps
        for _ in range(2):
            video += imgs + [imgs[-1]] * 8
        for im in slow:
            video += [im, im]
        video += [slow[-1]] * 12
    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, 'gpu_side_by_side.mp4')
    tmp = os.path.join(ROOT, 'shots/gpu_sculpt/film_frames')
    os.makedirs(tmp, exist_ok=True)
    for f in glob.glob(os.path.join(tmp, '*.png')):
        os.remove(f)
    for i, im in enumerate(video):
        im.save(os.path.join(tmp, f'{i:05d}.png'))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(fps), '-i', os.path.join(tmp, '%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', out], check=True)
    print('wrote', out, f'{len(video) / fps:.1f} s')


if __name__ == '__main__':
    what = sys.argv[1] if len(sys.argv) > 1 else 'both'
    if what in ('png', 'both'):
        png()
    if what in ('mp4', 'both'):
        mp4()
