"""Floor 2's rock: the crag the prison stands on, at night (his ask, 27 Nov 2026: "There's a new cliff I need for floor 2").

Under every edge of the prison's ground with nothing past it toward the eye (godot/assets/looks/floor2_cover.json `cliff`: x1, y1,
x2, y2 in game pixels, and its face: 0 the face to the left, in the moon's light; 1 the face to the right, in shadow), the rock
falls away: broken into facets as stone breaks, each facet's top edge catching the moon and its foot in shadow, a lip of ground
along the top, and with depth the rock goes into the night's haze (the night sky's lowest colour) and out of sight.

Drawn in game pixels (the game draws it two to one), farthest edge first so the nearer rock stands in front, and cut into tiles
of TILE pixels: godot/assets/looks/floor2_rock_<i>_<j>.png, and floor2_rock.json {x, y, tile, tiles: [[i, j, file]]}.

Also THE UNDERSIDE OF THE PRISON'S GROUND: the dark of the place laid under all of it (floor2_cover.png's cells, its holes
filled, a cell in from its edge), so that no sky is seen through it (a wall faded round him, a gap between its pictures); and in
its holes, the tops the look never drew (the tops of thick wall runs, left empty: seen as holes with stars in them under the
night sky), a wall-walk's stones: floor2_under_<i>_<j>.png, at floor2_rock.json `under`. The cover itself is written with its
holes filled (floor2_cover.png; as first drawn, floor2_cover_drawn.png), so the dark lies over them as over the rest.

Run: python3 tools/f2_rock.py   (then `godot --headless --path godot --import`)
"""
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy.ndimage import binary_fill_holes, binary_dilation, binary_erosion
from scipy.spatial import cKDTree

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "godot", "assets", "looks")
DEPTH = 440          # how far the rock is drawn below its edge (game pixels)
TILE = 1024
SEED = 20261127

# the rock's tones, darkest first: the face in the moon's light (0) and the face in shadow (1)
LIT = np.array([(8, 8, 18), (13, 13, 27), (19, 20, 38), (26, 28, 50), (35, 38, 64), (48, 52, 84)], float)
SHADE = np.array([(6, 6, 14), (9, 9, 20), (13, 13, 28), (18, 19, 37), (24, 25, 47), (33, 35, 60)], float)
HAZE = np.array((14, 18, 43), float)   # the night sky's lowest colour (floor2_nightsky.png)
BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], float) / 16.0


def _cells(w: int, h: int, sx: float, sy: float, rng: np.random.Generator):
    """Jittered points over w by h, about sx by sy apart; for each pixel the distances to its nearest two (F1, F2) and which."""
    gx = np.arange(-1, int(w / sx) + 3)
    gy = np.arange(-1, int(h / sy) + 3)
    px, py = np.meshgrid(gx, gy)
    pts = np.stack([(px + rng.uniform(0.1, 0.9, px.shape)) * sx, (py + rng.uniform(0.1, 0.9, py.shape)) * sy], -1).reshape(-1, 2)
    uu, vv = np.meshgrid(np.arange(w), np.arange(h))
    q = np.stack([uu.ravel(), vv.ravel()], -1).astype(float)
    d, k = cKDTree(pts).query(q, k=2)
    return d[:, 0].reshape(h, w), d[:, 1].reshape(h, w), k[:, 0].reshape(h, w)


def _smooth_noise(n: int, step: float, amp: float, rng: np.random.Generator) -> np.ndarray:
    """A smooth wobble n long: random values every `step`, eased between, times `amp`."""
    k = int(n / step) + 3
    pts = rng.uniform(-1, 1, k)
    x = np.arange(n) / step
    i = np.floor(x).astype(int)
    f = x - i
    f = f * f * (3 - 2 * f)
    return (pts[i] * (1 - f) + pts[i + 1] * f) * amp


def face_texture(w: int, h: int, lit: bool, rng: np.random.Generator) -> np.ndarray:
    """A face of cliff rock, w by h: its tones (float, 0..5) before its haze, NaN where the rock has run out. Made as stone
    breaks: the face pushed out into great angular masses, each broken into smaller blocks (a height over the face, from the
    distance to the edges of its cells, so that every block is a few flat planes), lit by the moon (up and to the left, and
    for the face in shadow, from behind it), the cracks between in shadow."""
    f1a, f2a, ka = _cells(w, h, 62.0, 84.0, rng)
    f1b, f2b, kb = _cells(w, h, 10.0, 17.0, rng)
    # (each block a low pyramid: highest at its middle, flat planes falling to its edges)
    big = np.minimum(f2a - f1a, 14.0)
    small = np.minimum(f2b - f1b, 3.5)
    lift_a = rng.uniform(0, 9, ka.max() + 1)[ka]
    lift_b = rng.uniform(0, 2, kb.max() + 1)[kb]
    hgt = big * 0.9 + lift_a + small * 0.8 + lift_b
    # (ledges across the face every so often: the rock below set back, so that the lip catches the moon)
    vv = np.arange(h)[:, None].astype(float)
    v = 30.0 + rng.uniform(0, 20)
    while v < h:
        line = v + _smooth_noise(w, rng.uniform(20, 46), 3.0, rng)[None, :]
        hgt = hgt - np.clip((vv - line) / 3.0, 0, 1) * 5.0
        v += rng.uniform(56, 104)
    gy, gx = np.gradient(hgt)
    n = np.stack([-gx, -gy, np.full_like(gx, 1.6)], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    L = np.array([-0.62, -0.55, 0.55]) if lit else np.array([-0.75, -0.45, 0.12])
    L /= np.linalg.norm(L)
    lum = np.clip((n * L).sum(-1), -0.2, 1.0)
    t = (1.0 + lum * 4.2) if lit else (0.6 + lum * 4.0)
    # (the clefts between the great masses deep, the rock darkening into them; and the cracks between the blocks)
    t = t - np.clip(1.0 - (f2a - f1a) / 5.0, 0, 1) * 1.4
    t = np.where(f2a - f1a < 1.6, 0.0, t)
    t = np.where((f2b - f1b < 0.8) & (big > 2.5), t - 0.8, t)
    # (grit)
    g = rng.random((h, w))
    t = np.where(g < 0.02, t + 0.7, np.where(g > 0.98, t - 0.7, t))
    # (the great masses run out at different depths, far down)
    end = (h - rng.uniform(0, 170, ka.max() + 1))[ka]
    t = np.where(np.arange(h)[:, None] >= end, np.nan, t)
    return t


def tones_to_rgb(t: np.ndarray, lit: bool) -> np.ndarray:
    """Tones to colours: NaN (no rock) as -1 alpha, kept in a fourth channel."""
    pal = LIT if lit else SHADE
    none = np.isnan(t)
    i = np.clip(np.round(np.nan_to_num(t, nan=0)), 0, len(pal) - 1).astype(int)
    out = np.concatenate([pal[i], np.where(none, 0.0, 1.0)[..., None]], -1)
    return out


def main() -> None:
    cover = json.load(open(os.path.join(ROOT, "floor2_cover.json")))
    edges = cover["cliff"]
    rng = np.random.default_rng(SEED)
    xs = [e[0] for e in edges] + [e[2] for e in edges]
    ys = [e[1] for e in edges] + [e[3] for e in edges]
    X0, X1 = int(min(xs)) - 2, int(max(xs)) + 2
    Y0, Y1 = int(min(ys)) - 4, int(max(ys)) + DEPTH + 4
    W, H = X1 - X0, Y1 - Y0
    tex = {0: face_texture(W, DEPTH, True, rng), 1: face_texture(W, DEPTH, False, rng)}
    rgb = {f: tones_to_rgb(tex[f], f == 0) for f in (0, 1)}
    out = np.zeros((H, W, 4), np.uint8)
    # (each column's face, top and which edge: to find the corners)
    v = np.arange(DEPTH)
    fog = np.clip((v - 24) / 330.0, 0, 1) ** 1.15
    fog = fog[:, None] * 0.92
    gone = np.clip((v - (DEPTH - 90)) / 90.0, 0, 1)
    # (THE ROCK'S ENDS: the prison's ground is one mass of rock, each face of it hanging from its edge, the nearer in front; at
    # its two ends, far left and far right, it does not stop in a straight line down but is cut away beneath, more the further
    # down, as a crag hangs)
    XL = min(e[0] for e in edges)
    XR = max(e[2] for e in edges)
    jag = _smooth_noise(W, 7.0, 9.0, rng) + _smooth_noise(W, 23.0, 14.0, rng)
    TAPER = 1.7
    # farthest first
    order = sorted(range(len(edges)), key=lambda k: (edges[k][1] + edges[k][3]) / 2)
    for k in order:
        x1, y1, x2, y2, f = edges[k]
        for x in range(int(x1), int(x2)):
            top = y1 + (y2 - y1) * (x - x1) / (x2 - x1)
            top_i = int(np.floor(top + 0.5))
            col4 = rgb[f][:, x - X0].copy()
            col = col4[:, :3]
            here = col4[:, 3] > 0
            # (the lip of the ground along the top: lit, and under it the shadow of its overhang)
            col[0] = (54, 58, 92) if f == 0 else (34, 36, 62)
            col[1] = (38, 41, 68) if f == 0 else (24, 25, 46)
            col[2] = (10, 10, 22)
            col[3] = (7, 7, 17)
            # (the corners: a convex corner's edge, toward the eye, in the moon's light)
            if f == 0 and x == int(x2) - 1:
                nxt = [e for e in edges if e[0] == x2 and abs(e[1] - y2) < 1 and e[4] == 1]
                if nxt:
                    col[4:] = np.minimum(col[4:] + 12, 255)
            if f == 1 and x == int(x1):
                prv = [e for e in edges if e[2] == x1 and abs(e[3] - y1) < 1 and e[4] == 0]
                if prv:
                    col[4:] = col[4:] * 0.6
            col = col * (1 - fog) + HAZE * fog
            yy = top_i + v - Y0
            ok = (yy >= 0) & (yy < H)
            # (out of sight below, by a dither, as the game's pixels go)
            keep = gone < (1.0 - BAYER[(yy % 4), x % 4] * 0.999)
            m = ok & keep & here
            # (the crag's two ends, far left and far right: cut away beneath, its underside slanting in)
            vmax = min(DEPTH, (x - XL) * TAPER + 12 + jag[x - X0], (XR - x) * TAPER + 12 + jag[x - X0])
            m = m & (v < vmax)
            out[yy[m], x - X0, :3] = np.clip(col[m], 0, 255).astype(np.uint8)
            out[yy[m], x - X0, 3] = 255
    # THE UNDERSIDE OF THE PRISON'S GROUND: under all of it (the cover, its holes filled, a cell in from its edge), the dark of
    # the place, so that nothing of the sky is seen through it (a wall faded round him, a gap between pictures); and in its
    # holes, the tops the look never drew, a wall-walk's stones
    cimg = _cover_drawn()
    filled = binary_fill_holes(cimg)
    holes = filled & ~cimg
    g = int(cover["grain"])
    inner = binary_erosion(filled, iterations=1) | holes
    tops_mask = binary_dilation(holes, iterations=2) & filled
    uh, uw = filled.shape[0] * g, filled.shape[1] * g
    ux0, uy0 = int(cover["x"]), int(cover["y"])
    under = np.zeros((uh, uw, 4), np.uint8)
    up = lambda m: np.repeat(np.repeat(m, g, 0), g, 1)
    under[up(inner)] = (7, 7, 16, 255)
    walk = wall_walk(uw, uh, ux0, uy0, rng)
    tm = up(tops_mask)
    under[tm] = walk[tm]
    Image.fromarray((filled * 255).astype(np.uint8)).save(os.path.join(ROOT, "floor2_cover.png"))
    print("under: %d holes' cells topped; %dx%d at (%d, %d)" % (holes.sum(), uw, uh, ux0, uy0))
    under_tiles = _tiles(under, "floor2_under")
    tiles = _tiles(out, "floor2_rock")
    info = {"x": X0, "y": Y0, "tile": TILE, "tiles": tiles, "under": {"x": ux0, "y": uy0, "tiles": under_tiles}}
    json.dump(info, open(os.path.join(ROOT, "floor2_rock.json"), "w"))
    if "--whole" in sys.argv:
        Image.fromarray(out).save("/tmp/floor2_rock_whole.png")
    print("rock: %dx%d at (%d, %d), %d tiles" % (W, H, X0, Y0, len(tiles)))


def _cover_drawn() -> np.ndarray:
    """The cover as the look's pictures make it (floor2_cover.png as tools/godot_f2_night.py wrote it), kept aside the first
    time, since floor2_cover.png is written again with its holes filled."""
    drawn = os.path.join(ROOT, "floor2_cover_drawn.png")
    if not os.path.exists(drawn):
        Image.open(os.path.join(ROOT, "floor2_cover.png")).save(drawn)
    return np.array(Image.open(drawn).convert("L")) > 127


def _tiles(img: np.ndarray, stem: str) -> list:
    """`img` cut into TILE-square pictures, <stem>_<i>_<j>.png, those with anything in them: [[i, j, file]]."""
    out = []
    for j in range(0, img.shape[0], TILE):
        for i in range(0, img.shape[1], TILE):
            t = img[j:j + TILE, i:i + TILE]
            if t[..., 3].any():
                name = "%s_%d_%d.png" % (stem, i // TILE, j // TILE)
                Image.fromarray(t).save(os.path.join(ROOT, name))
                out.append([i // TILE, j // TILE, name])
    return out


def wall_walk(w: int, h: int, gx0: int, gy0: int, rng: np.random.Generator) -> np.ndarray:
    """The top of a thick wall: a wall-walk's flagstones on the game's tile grid (a tile 32 by 16 game pixels), in the prison's
    night stone; w by h from (gx0, gy0) in game pixels."""
    yy, xx = np.mgrid[0:h, 0:w]
    sx = (xx + gx0).astype(float)
    sy = (yy + gy0).astype(float)
    # (to the floor's tiles, each split in four stones)
    tx = (sx / 16.0 + sy / 8.0) / 2.0 * 2.0
    ty = (sy / 8.0 - sx / 16.0) / 2.0 * 2.0
    fx = tx - np.floor(tx)
    fy = ty - np.floor(ty)
    cell = (np.floor(tx).astype(int) * 7919 + np.floor(ty).astype(int) * 104729) % 9973
    base = np.array([(30, 31, 56), (34, 35, 62), (27, 28, 51), (37, 38, 66)], float)[cell % 4]
    img = base.copy()
    # (joints, and each stone's lit far edge)
    joint = (fx < 0.07) | (fy < 0.07)
    lip = ((fx > 0.07) & (fx < 0.16)) | ((fy > 0.07) & (fy < 0.16))
    img[lip] = img[lip] + 10
    img[joint] = (15, 15, 30)
    g = rng.random((h, w))
    img[g < 0.03] += 8
    img[g > 0.97] -= 8
    out = np.zeros((h, w, 4), np.uint8)
    out[..., :3] = np.clip(img, 0, 255).astype(np.uint8)
    out[..., 3] = 255
    return out


if __name__ == "__main__":
    main()
