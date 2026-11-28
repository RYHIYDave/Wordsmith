#!/usr/bin/env python3
# FLOOR 2 UNDER ONE NIGHT SKY (his words, 27 Nov 2026: “The art is good. Look at all the black empty space. I don't like that”;
# “I really like just the night sky. Drawing the whole thing I think will fix it.”): two pictures for look.gd's F2_SKY.
#   godot/assets/looks/floor2_cover.png (+ .json): where the prison's own pictures stand, a pixel to every 4 game pixels, as
#     look.gd's dark lays its veil (DARK_GRAIN): white where something of the place is drawn, black where nothing is. The dark is
#     laid only where the place is; past it the night sky is seen.
#   godot/assets/looks/floor2_cliff_l.png, floor2_cliff_r.png: the rock the prison stands on, a cliff face falling from every
#     edge of its ground toward the eye into the night sky (floor2_cover.json `cliff`: those edges).
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
    # (THE CLIFFS, his “You see the massive problem in the lower left quadrant here right?”, the sky seen under the walls: “A for
    # sure.  If you put a cliff edge under the walls maybe it will look better”. Every edge of the prison's ground with nothing
    # past it toward the eye, a cliff face hangs from: a tile's lower-left edge where the tile below-left of it is empty (a face
    # to the left), its lower-right edge where the tile below-right is (a face to the right); in game pixels, farthest first)
    L = json.load(open('godot/assets/floor2/layout.json'))
    tw, th, tiles = L['w'], L['h'], L['tiles']
    def solid(x: int, y: int) -> bool:
        return 0 <= x < tw and 0 <= y < th and tiles[y * tw + x] != 0
    cliff = []
    for ty in range(th):
        for tx in range(tw):
            if not solid(tx, ty):
                continue
            bx, by = (tx - ty) * 16, (tx + ty + 2) * 8
            if not solid(tx, ty + 1):
                cliff.append([bx - 16, by - 8, bx, by, 0])
            if not solid(tx + 1, ty):
                cliff.append([bx, by, bx + 16, by - 8, 1])
    cliff.sort(key=lambda e: max(e[1], e[3]))
    json.dump({'x': lx // 2, 'y': ly // 2, 'grain': GRAIN, 'w': W // step, 'h': H // step, 'cliff': cliff}, open(LOOKS + 'floor2_cover.json', 'w'))
    print('cliff edges', len(cliff))
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


CLIFF_W, CLIFF_H = 64, 150  # game pixels: a cliff face's picture, repeating along it, and how far it falls


def cliffs() -> None:
    # (the rock under the walls, the prison's own stone as the night leaves it: a lit lip, layers of rock a shade apart with
    # dark seams, cracks down them; the face to the left in the moon's light, the one to the right in shadow; going down into
    # the night, dithered away into the sky below over its lower half)
    bayer = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0
    for side, base, lip in ((0, (40, 39, 62), (72, 72, 106)), (1, (28, 27, 45), (48, 48, 72))):
        rng = random.Random(11 + side)
        W, H = CLIFF_W, CLIFF_H
        img = np.zeros((H, W, 4), float)
        img[:, :, 3] = 255
        # (rock in broken blocks, taller than wide as a cliff's are: each pixel the block of its nearest seed, wrapping end to
        # end; each block its own shade; dark crevices where blocks meet; a lit upper-left rim on each and a shaded foot)
        seeds = [(rng.uniform(0, W), rng.uniform(-6, H), rng.uniform(-6, 6)) for _ in range(34)]
        yy, xx = np.mgrid[0:H, 0:W].astype(float)
        best = np.full((H, W), 1e9)
        second = np.full((H, W), 1e9)
        owner = np.zeros((H, W), int)
        for k, (sx, sy, _) in enumerate(seeds):
            dx = np.minimum(np.abs(xx - sx), W - np.abs(xx - sx)) * 1.0
            dy = (yy - sy) * 0.55
            d = np.sqrt(dx * dx + dy * dy)
            closer = d < best
            second = np.where(closer, best, np.minimum(second, d))
            owner = np.where(closer, k, owner)
            best = np.where(closer, d, best)
        shade = np.array([seeds[k][2] for k in range(len(seeds))])[owner]
        img[:, :, :3] = np.array(base)[None, None, :] + shade[:, :, None]
        edge = (second - best) < 1.1
        img[edge, :3] = np.array(base) * 0.5
        # (the rim: just below and right of a crevice, lit; just above and left of one, shaded)
        rim = np.roll(edge, 1, axis=0) & ~edge
        img[rim, :3] = np.minimum(255, np.array(base) * 1.28)
        foot = np.roll(edge, -1, axis=0) & ~edge & ~rim
        img[foot, :3] = np.array(base) * 0.78
        # (a few specks of the moon's light on the rock)
        for _ in range(60):
            x = rng.randrange(W)
            y = rng.randrange(H // 2)
            if not edge[y, x]:
                img[y, x, :3] = np.minimum(255, np.array(base) * 1.4)
        # the lip, a pixel or two of moonlit edge, and its shadow under it
        img[0:2, :, :3] = lip
        img[2, :, :3] = np.array(base) * 0.7
        # down into the night: dithered away over the lower half, the sky's own colour coming into it as it goes
        sky_low = np.array([14, 18, 43], float)
        for yy in range(H):
            t = (yy - H * 0.45) / (H * 0.55)
            if t <= 0:
                continue
            img[yy, :, :3] = img[yy, :, :3] * (1 - 0.6 * t) + sky_low * 0.6 * t
            for xx in range(W):
                if bayer[yy % 4, xx % 4] < t:
                    img[yy, xx, 3] = 0
        out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), 'RGBA').resize((W * 2, H * 2), Image.NEAREST)
        out.save(LOOKS + ('floor2_cliff_l.png' if side == 0 else 'floor2_cliff_r.png'))
    print('cliffs', CLIFF_W * 2, CLIFF_H * 2)


if __name__ == '__main__':
    cover()
    sky()
    cliffs()
