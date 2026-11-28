"""Floor 2's cliff: the prison built on THE EDGE of a cliff, at night (his ask, 27 Nov 2026: "There's a new cliff I need for floor
2"; and of the first try: "Make it look like it was built on THE EDGE of a cliff, not directly into the cliff ... Do it right.
Follow the rules.").

Under every edge of the prison's ground with nothing past it toward the eye (godot/assets/looks/floor2_cover.json `cliff`: x1, y1,
x2, y2 in game pixels; the foot of its walls), drawn by the art rulebook (docs/art/RULEBOOK.md):
  THE RIM: the prison stands back from the edge. Between the foot of its walls and the drop, a strip of the clifftop's rock, wide
    here and narrow there, its edge broken in straight runs as rock breaks; the walls' shadow at their foot; pebbles, cracks and
    moss on it; along its edge a lip of pale caprock catching the moon.
  THE DROP: from the rim's edge the cliff falls in faces and ledges. Each face is flat and upright, lit as the rulebook lights
    every upright face (light from the upper left: what faces up lightest, what faces left in between, what faces right
    darkest; three tones to a material, a seam of deep indigo where one part ends in front of another): a face looking left in
    the middle tone, one looking right in the dark, every ledge's top in the light. Cracks run down the faces and the bedding
    across them. Each ledge further down is a step deeper in the dark (the dark is part of the look), and below the last the
    rock goes out of sight by a dither, crisp, as the game's pixels go; at the two ends of the whole the ledges step in.
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

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "godot", "assets", "looks")
TILE = 1024
SEED = 20261127

# the cliff's rock, a cool slate a step quieter than the prison's walls (the place's own palette): three tones, lit from the
# upper left, and the seam
TOP = np.array((52, 55, 86), float)      # what faces up
LEFT = np.array((35, 37, 63), float)     # what faces left
RIGHT = np.array((22, 23, 44), float)    # what faces right
SEAM = np.array((14, 12, 36), float)     # #0e0c24, where one part ends in front of another
CAP = np.array((68, 72, 108), float)     # the pale caprock along the rim's edge, catching the moon
MOSS = np.array((27, 41, 38), float)
MOSS_D = np.array((18, 28, 29), float)
# each ledge further down a step deeper in the dark
LEVELS = 4
DARK = [1.0, 0.8, 0.64, 0.5, 0.4]
FADE = 44              # the last face, out of sight by a dither
BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], float) / 16.0


def _runs(n: int, step_lo: int, step_hi: int, lo: float, hi: float, rng: np.random.Generator) -> np.ndarray:
    """n values in straight runs, as rock breaks: a point every step_lo to step_hi columns, each between lo and hi, and a
    straight line between."""
    xs = [0]
    while xs[-1] < n + step_hi:
        xs.append(xs[-1] + int(rng.integers(step_lo, step_hi + 1)))
    vs = rng.uniform(lo, hi, len(xs))
    return np.interp(np.arange(n), xs, vs)


def _dark(c: np.ndarray, k: int) -> np.ndarray:
    f = DARK[min(k, len(DARK) - 1)]
    return SEAM + (c - SEAM) * f


def _smooth_noise(n: int, step: float, amp: float, rng: np.random.Generator) -> np.ndarray:
    """A smooth wobble n long: random values every `step`, eased between, times `amp`."""
    k = int(n / step) + 3
    pts = rng.uniform(-1, 1, k)
    x = np.arange(n) / step
    i = np.floor(x).astype(int)
    f = x - i
    f = f * f * (3 - 2 * f)
    return (pts[i] * (1 - f) + pts[i + 1] * f) * amp


def main() -> None:
    cover = json.load(open(os.path.join(ROOT, "floor2_cover.json")))
    edges = cover["cliff"]
    rng = np.random.default_rng(SEED)
    xs = [e[0] for e in edges] + [e[2] for e in edges]
    ys = [e[1] for e in edges] + [e[3] for e in edges]
    MARGIN = 2 * 21 + 6                  # (room past the ends for the rim to turn round a corner)
    X0, X1 = int(min(xs)) - MARGIN, int(max(xs)) + MARGIN
    W = X1 - X0
    # the rim's width, and each ledge's face and shelf: straight runs across the whole, the same for every edge at a column
    rim = _runs(W, 8, 26, 6, 21, rng)
    face = [_runs(W, 16, 52, 26, 60, rng) for _ in range(LEVELS)]
    shelf = [np.clip(_runs(W, 10, 34, -7, 9, rng), 0, None) for _ in range(LEVELS)]
    deep = rim.max() + sum(f.max() + s.max() for f, s in zip(face, shelf)) + FADE + 4
    Y0, Y1 = int(min(ys)) - 30, int(max(ys) + deep) + 4
    H = Y1 - Y0
    out = np.zeros((H, W, 4), np.uint8)
    # (the faces broken into upright columns of rock, as cliffs split: a crack down each face every few columns, running
    # most of its height and jogging a pixel now and then; the column to its right standing a little proud, its left edge
    # catching the light; here and there a crack ends short)
    crack = np.zeros(W, bool)
    c = int(rng.integers(2, 8))
    while c < W:
        crack[c] = True
        c += int(rng.choice([6, 7, 8, 9, 10, 12, 14, 17, 21]))
    crack_a = rng.integers(0, 6, (LEVELS + 1, W))
    crack_l = np.where(rng.random((LEVELS + 1, W)) < 0.7, 999, rng.integers(10, 30, (LEVELS + 1, W)))
    jog = np.cumsum(rng.random((LEVELS + 1, W, 80)) < 0.12, axis=2) % 2   # (a crack's pixel step aside, down its length)
    # (on the rim: pebbles, cracks, moss at the walls' foot)
    pebble = rng.random((H, W)) < 0.006
    pebble[:, 1:] |= pebble[:, :-1]      # (two pixels wide)
    moss = _runs(W, 6, 20, -1, 1, rng) > 0.35
    # (stones lying on the rim, fallen from the edge: one every so often, each its own size, just in from the lip)
    stones = {}
    c = int(rng.integers(10, 40))
    while c < W:
        stones[c] = (int(rng.integers(4, 10)), int(rng.integers(3, 6)), float(rng.uniform(0.35, 0.8)))
        c += int(rng.integers(26, 72))
    # (tufts of grass on the ledges, dark in the night)
    tuft = rng.random((LEVELS, W)) < 0.05
    inL = np.cumsum(rng.integers(2, 14, LEVELS + 2))
    inR = np.cumsum(rng.integers(2, 14, LEVELS + 2))

    # THE CORNERS: where the prison's ground comes to a point toward the open air (a run of edges ends, and nothing of the
    # prison or its rock lies beyond it), the rim turns round the corner with it, so that the corner too stands back from the
    # drop; the cliff under it turns with it
    filled0 = binary_fill_holes(_cover_drawn())
    g0 = int(cover["grain"])

    def covered(x: float, y: float) -> bool:
        cx = int((x - cover["x"]) // g0)
        cy = int((y - cover["y"]) // g0)
        return 0 <= cx < filled0.shape[1] and 0 <= cy < filled0.shape[0] and bool(filled0[cy, cx])

    tops_at = {}
    for e in edges:
        for x in range(int(e[0]), int(e[2])):
            tops_at.setdefault(x, []).append(e[1] + (e[3] - e[1]) * (x - e[0]) / (e[2] - e[0]))

    def free(x: float, y: float, way: int) -> bool:
        """Whether past this end of a run of edges (way -1 its left, 1 its right) nothing lies: none of the prison and no
        other edge, 48 pixels across and from 30 above to 120 below."""
        for d in range(2, 50, 3):
            xx = x + way * d
            for t in tops_at.get(int(xx), []):
                if y - 30 <= t <= y + 120:
                    return False
            for j in range(-30, 120, 6):
                if covered(xx, y + j):
                    return False
        return True

    starts = {(e[0], e[1]) for e in edges}
    ends = {(e[2], e[3]) for e in edges}
    tips = {}                                 # (edge's index) -> [(x, y, way)]
    for k, e in enumerate(edges):
        if (e[0], e[1]) not in ends and e[3] > e[1] and free(e[0], e[1], -1):
            tips.setdefault(k, []).append((e[0], e[1], -1))
        if (e[2], e[3]) not in starts and e[3] < e[1] and free(e[2], e[3], 1):
            tips.setdefault(k, []).append((e[2], e[3], 1))
    XL = min(e[0] for e in edges) - X0
    XR = max(e[2] for e in edges) - X0
    for k in tips:
        for (tx, ty, way) in tips[k]:
            r = rim[int(tx) - X0]
            if way < 0:
                XL = min(XL, int(tx - 2 * r) - X0)
            else:
                XR = max(XR, int(tx + 2 * r) - X0)

    def put(y: int, x: int, col) -> None:
        """Game pixel (x, y) the colour `col`."""
        yy = y - Y0
        xx = x - X0
        if 0 <= yy < H and 0 <= xx < W:
            out[yy, xx, :3] = np.clip(col, 0, 255).astype(np.uint8)
            out[yy, xx, 3] = 255

    def stone(x: int, y: int, w: int, h: int) -> None:
        """A stone on the rim, its foot at (x, y), w across and h tall: its top in the light, its left side in between, its
        right side dark, the seam under it."""
        for row in range(h):
            yy = y - h + row
            inset = 1 if row == 0 else 0
            for i in range(inset, w - inset):
                if row <= 1:
                    col = CAP if row == 0 else TOP
                else:
                    col = LEFT if i < w // 2 else RIGHT
                put(yy, x - w // 2 + i, col)
        for i in range(w):
            put(y, x - w // 2 + i, SEAM)

    def column(x: int, back: float, edge: float, slope: float, foot: bool) -> None:
        """One column of the cliff at game x: THE RIM from `back` (the walls' foot, or, where it turns a corner, its far lip)
        to `edge`, then THE DROP from the edge, its top running at `slope`."""
        cx = x - X0
        cn = min(cx + 1, W - 1)
        yb = int(np.floor(back + 0.5))
        ye = int(np.floor(edge + 0.5))
        for y in range(yb, ye):
            d = y - yb
            col = TOP
            if foot and d < 2:
                col = LEFT                       # (the walls' shadow at their foot)
                if d == 1 and moss[cx]:
                    col = MOSS_D
            elif foot and d == 2 and moss[cx]:
                col = MOSS
            elif not foot and d == 0:
                col = CAP                        # (the far lip, round the corner, catching the moon)
            elif y == ye - 1:
                col = CAP                        # (the caprock's lip, catching the moon)
            elif pebble[y - Y0, cx]:
                col = CAP
            elif y - Y0 > 0 and pebble[y - Y0 - 1, cx]:
                col = SEAM
            put(y, x, col)
        # THE DROP: faces and ledges, each a step deeper in the dark
        top = edge
        top_n = edge + slope
        for lv in range(LEVELS + 1):
            if cx < XL + inL[lv] or cx > XR - inR[lv]:
                break
            last = lv == LEVELS
            h = FADE if last else face[lv][cx]
            h_n = FADE if last else face[lv][cn]
            # (the face looks left where its top runs down to the right, right where it runs up)
            looks_left = top_n - top >= 0
            tone = _dark(LEFT if looks_left else RIGHT, lv)
            lit_edge = _dark(TOP if looks_left else LEFT, lv)
            t0 = int(np.floor(top + 0.5))
            t1 = int(np.floor(top + h + 0.5))
            for y in range(t0, t1):
                d = y - t0
                col = tone
                j = jog[lv, cx, min(d // 3, 79)]
                # (a crack here, or one a column to the left jogged here)
                here = crack[cx] and crack_a[lv, cx] <= d < crack_a[lv, cx] + crack_l[lv, cx] and j == 0
                left = cx > 0 and crack[cx - 1] and crack_a[lv, cx - 1] <= d < crack_a[lv, cx - 1] + crack_l[lv, cx - 1]
                jl = jog[lv, cx - 1, min(d // 3, 79)] if cx > 0 else 0
                if here or (left and jl == 1):
                    col = _dark(SEAM, 0)
                elif (left and jl == 0) or (cx > 1 and crack[cx - 2] and jog[lv, cx - 2, min(d // 3, 79)] == 1
                                            and crack_a[lv, cx - 2] <= d < crack_a[lv, cx - 2] + crack_l[lv, cx - 2]):
                    col = lit_edge     # (the proud column's lit edge)
                if last:
                    # (out of sight below, by a dither)
                    if (d / FADE) > 1.0 - BAYER[(y - Y0) % 4, x % 4] * 0.999:
                        continue
                put(y, x, col)
            if last:
                break
            # the ledge's top, in the light, its edge the next face's top
            s = shelf[lv][cx]
            s_n = shelf[lv][cn]
            t2 = int(np.floor(top + h + s + 0.5))
            for y in range(t1, t2):
                put(y, x, _dark(TOP, lv + 1) if y < t2 - 1 else _dark(CAP, lv + 1))
            if s >= 3 and tuft[lv, cx]:
                for i in range(1 + (cx * 7) % 3):
                    put(t1 + 1 - i, x, _dark(MOSS if i else MOSS_D, lv))
            top = top + h + s
            top_n = top_n + h_n + s_n

    order = sorted(range(len(edges)), key=lambda k: (edges[k][1] + edges[k][3]) / 2)
    for k in order:
        x1, y1, x2, y2, _f = edges[k]
        slope_seg = (y2 - y1) / (x2 - x1)
        for x in range(int(x1), int(x2)):
            cx = x - X0
            base = y1 + slope_seg * (x - x1)
            nb = base + slope_seg + rim[min(cx + 1, W - 1)]
            column(x, base, base + rim[cx], nb - (base + rim[cx]), True)
        # (round a corner: the rim's two lips meeting in a point, as far out as the rim is wide on both sides)
        for (tx, ty, way) in tips.get(k, []):
            r = rim[int(tx) - X0]
            for i in range(1, int(2 * r) + 1):
                x = int(tx) + way * i
                u = i / 2.0
                back = ty - r + u
                edge = ty + r - u
                if edge - back < 1:
                    break
                column(x, back, edge, 0.5 if way < 0 else -0.5, False)
        for sc, (sw, sh, at) in stones.items():
            x = sc + X0
            if int(x1) <= x < int(x2) and rim[sc] >= 9:
                base = y1 + slope_seg * (x - x1)
                stone(x, int(np.floor(base + rim[sc] * at + 2 + 0.5)), sw, sh)
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
