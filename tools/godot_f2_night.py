#!/usr/bin/env python3
# FLOOR 2 UNDER ONE NIGHT SKY (his words, 27 Nov 2026: “The art is good. Look at all the black empty space. I don't like that”;
# “I really like just the night sky. Drawing the whole thing I think will fix it.”): two pictures for look.gd's F2_SKY.
#   godot/assets/looks/floor2_cover.png (+ .json): where the prison's own pictures stand, a pixel to every 4 game pixels, as
#     look.gd's dark lays its veil (DARK_GRAIN): white where something of the place is drawn, black where nothing is. The dark is
#     laid only where the place is; past it the night sky is seen.
#   godot/assets/looks/floor2_ground.png: the plain dark ground under the sky's line, round and under the prison.
#   godot/assets/looks/floor2_nightsky.png: the night sky itself, in the colours of the courtyards' own sky (the look's
#     'night sky' picture: render/grounds.ts), stars and drifting cloud bands, its moon, wrapping round end to end; as dark as
#     the courtyards' sky is seen through their dark (the yard's dark 0.42, lifted 0.55 over the far walls).
# python3 tools/godot_f2_night.py
import json
import math
import random

import numpy as np
from PIL import Image

LOOKS = 'godot/assets/looks/'
GRAIN = 4  # game pixels to a pixel of the cover (look.gd DARK_GRAIN)


def cover() -> None:
    d = json.load(open(LOOKS + 'floor2.json'))
    pics = json.load(open(LOOKS + 'floor2_pics.json'))
    sheet = np.asarray(Image.open(LOOKS + 'floor2.png').convert('RGBA'))[:, :, 3]
    boxes = []
    for it in d['items']:
        f = it.get('frames') or []
        if not f or f[0] not in pics:
            continue
        px, py, w, h, ax, ay = pics[f[0]][:6]
        x0 = int(it['x']) * 2 - ax
        y0 = int(it['y']) * 2 - ay
        boxes.append((x0, y0, px, py, w, h))
    lx = min(b[0] for b in boxes)
    ly = min(b[1] for b in boxes)
    hx = max(b[0] + b[4] for b in boxes)
    hy = max(b[1] + b[5] for b in boxes)
    # (in picture pixels, two to a game pixel; the origin on the cover's own grain)
    step = GRAIN * 2
    lx = (lx // step) * step
    ly = (ly // step) * step
    W = (hx - lx + step - 1) // step * step
    H = (hy - ly + step - 1) // step * step
    full = np.zeros((H, W), dtype=bool)
    for x0, y0, px, py, w, h in boxes:
        a = sheet[py:py + h, px:px + w] > 8
        full[y0 - ly:y0 - ly + h, x0 - lx:x0 - lx + w] |= a
    small = full.reshape(H // step, step, W // step, step).mean(axis=(1, 3))
    # (a body standing on the place's edge: its dark a little past where the pictures end, as the veil was)
    img = Image.fromarray((np.clip(small, 0.0, 1.0) * 255).astype(np.uint8), 'L')
    img.save(LOOKS + 'floor2_cover.png')
    # (THE SKYLINE, his “You see the massive problem in the lower left quadrant here right?”: the sky seen under the prison made
    # it float. The sky is seen only over the place's farthest tops; under that line, past the place's own pictures, plain dark
    # ground. For each column of the cover, in game pixels, the second row from its top that something of the place covers)
    covered = small > 0.5
    top = []
    for cx in range(covered.shape[1]):
        rows = np.nonzero(covered[:, cx])[0]
        top.append(int(ly // 2 + (int(rows[0]) + 1) * GRAIN) if rows.size else None)
    json.dump({'x': lx // 2, 'y': ly // 2, 'grain': GRAIN, 'w': W // step, 'h': H // step, 'top': top}, open(LOOKS + 'floor2_cover.json', 'w'))
    print('cover', img.size, 'origin game px', lx // 2, ly // 2)


def sky() -> None:
    rng = random.Random(2)
    # (game pixels; drawn two picture pixels to one)
    W, H = 1024, 300
    top = np.array([5, 6, 15], float)
    low = np.array([17, 22, 50], float)
    steps = [(5, 6, 15), (7, 9, 23), (10, 13, 31), (13, 17, 40), (15, 19, 40), (17, 22, 50)]
    img = np.zeros((H, W, 3), float)
    # (the sky in the courtyards' own steps of colour, darkest overhead, a row of the next step mixed in where they meet)
    for y in range(H):
        t = y / (H - 1)
        k = t * (len(steps) - 1)
        i = int(k)
        f = k - i
        for x in range(W):
            j = min(i + 1, len(steps) - 1) if (f > 0.66 or (f > 0.33 and (x + y) % 2 == 0)) else i
            img[y, x] = steps[j]
    # (cloud bands as the courtyards' own lie: long thin streaks, ragged in steps along their tops and bottoms, a lit pixel on
    # their upper edge; wrapping round end to end)
    body = np.zeros((H, W), dtype=bool)
    for _ in range(40):
        L = rng.randint(70, 330)
        x0 = rng.randrange(W)
        cy = rng.uniform(H * 0.12, H * 0.8)
        T = rng.uniform(2.5, 8.0)
        up_n = down_n = 0.0
        seg = 0
        for k in range(L):
            if seg <= 0:
                seg = rng.randint(6, 16)
                up_n = max(-0.4, min(0.5, up_n + rng.uniform(-0.25, 0.25)))
                down_n = max(-0.4, min(0.35, down_n + rng.uniform(-0.2, 0.2)))
            seg -= 1
            t = math.sin(math.pi * (k + 0.5) / L) ** 0.6
            top = int(round(cy - T * t * (1 + up_n)))
            bot = int(round(cy + T * 0.55 * t * (1 + down_n)))
            if bot <= top:
                continue
            x = (x0 + k) % W
            body[max(0, top):min(H, bot), x] = True
    img[body] = (26, 33, 64)
    # (their lit upper edges, and a darker lower lip)
    edge = body & ~np.roll(body, 1, axis=0)
    low = body & ~np.roll(body, -1, axis=0) & ~edge
    img[edge] = (58, 69, 112)
    img[low] = (17, 22, 50)
    haze = np.zeros((H, W), dtype=bool)
    # (stars in the open sky: many faint, a few bright, a very few crosses)
    for _ in range(900):
        x = rng.randrange(W)
        y = rng.randrange(int(H * 0.85))
        if body[y, x] or haze[y, x]:
            continue
        r = rng.random()
        if r < 0.80:
            img[y, x] = (58, 69, 112) if r < 0.45 else (106, 118, 168)
        elif r < 0.97:
            img[y, x] = (200, 208, 236)
        else:
            img[y, x] = (200, 208, 236)
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                img[(y + dy) % H, (x + dx) % W] = (106, 118, 168)
    # (the moon, the courtyards' own, high on the left of the first screen)
    moon = Image.open(LOOKS + 'floor2.png').convert('RGBA').crop((600, 240, 660, 300))
    m = np.asarray(moon.resize((30, 30), Image.NEAREST)).astype(float)
    mx, my = 150, 40
    lit = (m[:, :, 0] > 100) & (m[:, :, 3] > 0)
    for yy in range(30):
        for xx in range(30):
            if lit[yy, xx]:
                img[my + yy, mx + xx] = m[yy, xx, :3]
    # (a faint halo round it)
    for yy in range(-14, 44):
        for xx in range(-14, 44):
            rr = math.hypot(xx - 15, yy - 15)
            if 15 < rr < 26 and not lit[min(29, max(0, yy)), min(29, max(0, xx))]:
                k = (1 - (rr - 15) / 11) * 0.18
                img[my + yy, mx + xx] = img[my + yy, mx + xx] * (1 - k) + np.array([106, 118, 168]) * k
    # (as dark as the courtyards' sky is seen: under the open sky the dark is rgb (6, 4, 14) at 0.42, lifted 0.55 over the walls)
    a = 0.42 * (1 - 0.55)
    img = img * (1 - a) + np.array([6, 4, 14]) * a
    out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), 'RGB')
    out.save(LOOKS + 'floor2_nightsky.png')
    print('sky', out.size, 'below', tuple(int(v) for v in img[H - 1, 0]))


def ground() -> None:
    # (the plain dark ground round the prison at night: bare earth, a few shades speckled, nothing standing on it; a tile that
    # repeats, two picture pixels to a game pixel)
    rng = random.Random(5)
    N = 64
    base = np.array([18, 17, 30], float)
    img = np.tile(base, (N, N, 1))
    for _ in range(420):
        x = rng.randrange(N)
        y = rng.randrange(N)
        img[y, x] = rng.choice([(22, 21, 36), (15, 14, 25), (25, 23, 38), (13, 12, 22)])
    for _ in range(40):
        x = rng.randrange(N)
        y = rng.randrange(N)
        img[y, x] = (30, 28, 44)
        img[y, (x + 1) % N] = (22, 21, 36)
    out = Image.fromarray(img.astype(np.uint8), 'RGB').resize((N * 2, N * 2), Image.NEAREST)
    out.save(LOOKS + 'floor2_ground.png')
    print('ground', out.size)


if __name__ == '__main__':
    cover()
    sky()
    ground()
