"""Floor 2's main building: the warden's quarters, where he comes in by the waypoint, made the prison's great main building, a
block of cells stories high (his idea, 27 Nov 2026: "the little room you come out of where the waypoint is at, thats the prison.
so maybe when you walk out of that room you should see a huge wall behind you as the wall of the prisons main building").

The building is the block of tiles x 1 to 13, y 68 to 75 (godot/assets/floor2/layout.json): the start room, the passage out of
it, and the walls round them. Seen from outside, it stands whole (the art rulebook, Places 9): its two faces toward the eye run
up STORIES stories higher than the prison's other walls, and a hipped slate roof closes it over the top. Once he steps inside,
the whole of it fades clear in a third of a second and the room is as it was (look.gd, F2_KEEP).

Made from the look's own pictures (godot/assets/looks/floor2.png), so it is the prison's own stone:
  THE FACES. One column a tile wide for each tile along the south face (y 75, facing +y) and the east face (x 13, facing +x),
    each from one of the prison's windowed wall faces: its foot as the look has it, then a story of it (its upper row of barred
    windows, the band 88 to 43 picture pixels above its anchor) laid in again STORIES times, each story from one of the faces of
    that side, some windows lit; then its coping. Where the look's own face stands on a tile, its own picture is used, so its
    lit windows keep their glow. Over the passage's door on the east face (y 70 to 74) the face begins above the gatehouse's
    gable, which stands in front of it as the look draws it.
  THE ROOF. Hipped, in the slate the look's walls carry on their tops (the same slates, the same pitch: 27 picture pixels a
    tile), the face toward +y lit as the left-facing slates are and the hip toward +x as the right-facing ones; a ridge and the
    hip between them capped and catching the moon.
Writes godot/assets/looks/floor2_keep.png (the pieces side by side) and floor2_keep.json:
  {"sheet", "pieces": [[sheet x, y, w, h, screen x, y (picture pixels, its top left), depth]], "inside": [x0, y0, x1, y1] (the
   hero's tiles in which it fades), "lights": [[x, y]] (game pixels: the lights inside it, hidden while it stands whole),
   "cover": {"x", "y", "grain", "file"} (its outline in game pixels, for the night sky's dark: floor2_keep_cover.png)}.

Run: python3 tools/f2_keep.py   (then `godot --headless --path godot --import`)
"""
import json
import os

import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "godot", "assets", "looks")
STORY = 45          # a story of the wall, picture pixels (the windows' rows are 45 apart)
STORIES = 6         # how many stories higher than the prison's walls
BAND_TOP = 88       # the story laid in again: from this many picture pixels above the face's anchor, STORY down
PITCH = 27          # the slate's rise, picture pixels a tile (the look's own slates)
SEED = 271127
X0T, X1T, Y0T, Y1T = 1, 14, 68, 76     # the building's tiles: x 1 to 13, y 68 to 75 (edges 1..14, 68..76)
DOOR = (70, 75)     # the east face's tiles that the gatehouse stands on (its gable in front)
LEFT = ["face left 10", "face left 11", "face left 12", "face left 13", "face left 14"]
RIGHT = ["face right 10", "face right 11", "face right 12", "face right 13"]
LIT_STORY = []      # the faces whose story (upper window) is lit: found from the pictures (main)


def main() -> None:
    rng = np.random.default_rng(SEED)
    d = json.load(open(os.path.join(ROOT, "floor2.json")))
    pics = json.load(open(os.path.join(ROOT, "floor2_pics.json")))
    sheet = Image.open(os.path.join(ROOT, "floor2.png")).convert("RGBA")

    def pic(name: str) -> np.ndarray:
        x, y, w, h, _ax, _ay = pics[name]
        return np.array(sheet.crop((x, y, x + w, y + h)))

    # the faces whose story's window burns (orange in it)
    for n in LEFT + RIGHT:
        x, y, w, h, _ax, ay = pics[n]
        band = np.array(sheet.crop((x, y + ay - BAND_TOP, x + w, y + ay - BAND_TOP + STORY)))
        if ((band[..., 0] > 180) & (band[..., 1] < 150) & (band[..., 3] > 0)).sum() > 10:
            LIT_STORY.append(n)
    print("lit stories:", LIT_STORY)
    # the look's own faces on the building's tiles
    own = {}
    for it in d["items"]:
        if it.get("layer") == "stand" and it.get("kind") == "wall" and it.get("frames"):
            n = it["frames"][0]
            if n in LEFT or n in RIGHT:
                tx = round((it["x"] / 16 + it["y"] / 8) / 2)
                ty = round((it["y"] / 8 - it["x"] / 16) / 2)
                own[(tx, ty, "L" if n in LEFT else "R")] = n

    def face_mask(h: int, side: str) -> np.ndarray:
        """The face's own pixels in a face picture (its slates on top taken off): left faces x < 32 under the eave (0, 45) to
        (32, 61); right faces x >= 32 under the eave (64, 45) to (32, 61)."""
        yy, xx = np.mgrid[0:h, 0:64]
        if side == "L":
            return (xx < 32) & (yy >= 45 + xx * 0.5)
        return (xx >= 32) & (yy >= 45 + (63 - xx) * 0.5)

    def column(side: str, name: str) -> np.ndarray:
        """A face STORIES stories higher: its top (the coping), STORIES stories from the faces of its side, its own foot."""
        base = pic(name)
        h = base.shape[0]
        ay = pics[name][5]
        s = ay - BAND_TOP
        m = face_mask(h, side)
        out = np.zeros((h + STORY * STORIES, 64, 4), np.uint8)
        top = base[:s].copy()
        top[~m[:s]] = 0
        out[:s] = top
        names = LEFT if side == "L" else RIGHT
        for k in range(STORIES):
            # (mostly its own face's story; now and then another of its side; a window lit in few of them)
            src = name if rng.random() < 0.5 else str(rng.choice([n for n in names if n not in LIT_STORY]))
            if rng.random() < 0.08:
                src = str(rng.choice([n for n in names if n in LIT_STORY] or names))
            elif src in LIT_STORY:
                src = str(rng.choice([n for n in names if n not in LIT_STORY]))
            b = pic(src)[s:s + STORY].copy()
            b[~m[s:s + STORY]] = 0
            out[s + k * STORY:s + (k + 1) * STORY] = b
        foot = base[s:].copy()
        foot[~m[s:]] = 0
        out[s + STORY * STORIES:] = foot
        return out

    pieces = []      # (image, screen x, screen y, depth)
    # THE SOUTH FACE: the tiles (x, 75), facing +y
    for tx in range(X0T, X1T):
        name = own.get((tx, Y1T - 1, "L")) or LEFT[int(rng.integers(0, len(LEFT)))]
        col = column("L", name)
        ax, ay = 32, pics[name][5] + STORY * STORIES
        gx, gy = (tx - (Y1T - 1)) * 16, (tx + Y1T - 1) * 8
        pieces.append((col, gx * 2 - ax, gy * 2 - ay, tx + Y1T + 0.9))
    # THE EAST FACE: the tiles (13, y), facing +x
    arch = gatehouse(d, pics, sheet)
    for ty in range(Y0T, Y1T):
        name = own.get((X1T - 1, ty, "R")) or RIGHT[int(rng.integers(0, len(RIGHT)))]
        col = column("R", name)
        ax, ay = 32, pics[name][5] + STORY * STORIES
        gx, gy = (X1T - 1 - ty) * 16, (X1T - 1 + ty) * 8
        sx, sy = gx * 2 - ax, gy * 2 - ay
        depth = X1T + ty + 0.05
        if DOOR[0] <= ty < DOOR[1]:
            # (over the door: the face only above the gatehouse's gable, which stands in front of it)
            for x in range(64):
                top = arch.get(sx + x)
                if top is not None:
                    col[max(0, top - sy):, x] = 0
            depth = X1T + ty + 0.1
        pieces.append((col, sx, sy, depth))
    # THE ROOF
    roof, rx, ry = make_roof(pic, rng, 121 + STORY * STORIES)
    pieces.append((roof, rx, ry, 81.5))

    # the sheet, and the outline for the night sky's dark
    W = sum(p[0].shape[1] + 1 for p in pieces)
    H = max(p[0].shape[0] for p in pieces)
    big = np.zeros((H, W, 4), np.uint8)
    out = []
    cx = 0
    for im, sx, sy, depth in pieces:
        h, w = im.shape[:2]
        big[:h, cx:cx + w] = im
        out.append([cx, 0, w, h, int(sx), int(sy), float(depth)])
        cx += w + 1
    Image.fromarray(big).save(os.path.join(ROOT, "floor2_keep.png"))
    lo_x = min(p[1] for p in pieces)
    lo_y = min(p[2] for p in pieces)
    hi_x = max(p[1] + p[0].shape[1] for p in pieces)
    hi_y = max(p[2] + p[0].shape[0] for p in pieces)
    G = 8   # picture pixels to a cell of the cover (the cover's own grain: 4 game pixels)
    cw, ch = (hi_x - lo_x) // G + 2, (hi_y - lo_y) // G + 2
    cov = np.zeros((ch, cw), bool)
    for im, sx, sy, _d in pieces:
        ys, xs = np.nonzero(im[..., 3] > 0)
        cov[(sy - lo_y + ys) // G, (sx - lo_x + xs) // G] = True
    Image.fromarray((cov * 255).astype(np.uint8)).save(os.path.join(ROOT, "floor2_keep_cover.png"))
    info = {"sheet": "floor2_keep.png", "pieces": out, "inside": [X0T, Y0T, X1T, Y1T],
            "lights": inside_lights(d),
            "cover": {"x": lo_x / 2, "y": lo_y / 2, "grain": G / 2, "file": "floor2_keep_cover.png"}}
    json.dump(info, open(os.path.join(ROOT, "floor2_keep.json"), "w"))
    print("keep: %d pieces, %d stories higher, the sheet %dx%d; %d lights inside" % (len(out), STORIES, W, H, len(info["lights"])))


def gatehouse(d: dict, pics: dict, sheet: Image.Image) -> dict:
    """The gatehouse over the passage's door on the east face (the look's pieces standing on x 14, y 70 to 75): for each column
    of the screen (picture pixels) the top of its gable."""
    top = {}
    for it in d["items"]:
        if it.get("layer") != "stand" or not it.get("frames"):
            continue
        tx = (it["x"] / 16 + it["y"] / 8) / 2
        ty = (it["y"] / 8 - it["x"] / 16) / 2
        if abs(tx - X1T) < 0.05 and DOOR[0] - 0.05 <= ty < DOOR[1] and it["frames"][0].startswith("look piece"):
            x, y, w, h, ax, ay = pics[it["frames"][0]]
            a = np.array(sheet.crop((x, y, x + w, y + h)))[..., 3]
            sx = int(it["x"] * 2 - ax)
            sy = int(it["y"] * 2 - ay)
            for c in range(w):
                rows = np.nonzero(a[:, c] > 0)[0]
                if len(rows):
                    t = sy + int(rows.min())
                    top[sx + c] = min(top.get(sx + c, t), t)
    return top


def make_roof(pic, rng, Hf: int):
    """The hipped roof over the building at Hf picture pixels above the ground: its picture and its top left on the screen."""
    SL = [pic(n) for n in LEFT]
    SR = [pic(n) for n in RIGHT]
    half = (Y1T - Y0T) / 2.0
    ridge_v = Y0T + half
    rise = half * PITCH
    corners = [(X0T, Y1T, 0), (X1T, Y1T, 0), (X1T, Y0T, 0), (X0T, Y0T, 0),
               (X0T + half, ridge_v, rise), (X1T - half, ridge_v, rise)]
    xs = [(u - v) * 32 for u, v, z in corners]
    ys = [(u + v) * 16 - Hf - z for u, v, z in corners]
    x0, x1 = int(min(xs)) - 2, int(max(xs)) + 2
    y0, y1 = int(min(ys)) - 2, int(max(ys)) + 2
    W, H = x1 - x0, y1 - y0
    img = np.zeros((H, W, 4), np.uint8)
    yy, xx = np.mgrid[0:H, 0:W]
    X = (xx + x0).astype(float)
    Y = (yy + y0).astype(float)
    # the south face of the roof: z = Hf + PITCH * (Y1T - v)
    v = (Y - X / 2 + Hf + PITCH * Y1T) / (32 + PITCH)
    u = v + X / 32
    bs = Y1T - v
    south = (bs >= 0) & (bs <= X1T - u) & (bs <= u - X0T) & (bs <= half)
    # the east hip: z = Hf + PITCH * (X1T - u)
    u2 = (Y + X / 2 + Hf + PITCH * X1T) / (32 + PITCH)
    v2 = u2 - X / 32
    be = X1T - u2
    east = (be >= 0) & (be < Y1T - v2) & (be <= v2 - Y0T) & ~south
    var = rng.integers(0, 1000, (64, 64))
    for mask, U, V, B, side in ((south, u, v, bs, "L"), (east, u2, v2, be, "R")):
        ys_, xs_ = np.nonzero(mask)
        uu, vv, bb = U[ys_, xs_], V[ys_, xs_], B[ys_, xs_]
        a = (uu if side == "L" else vv) % 1.0
        b = bb % 1.0
        a = 0.04 + a * 0.92
        b = 0.14 + b * 0.72
        px = 32 * a + 32 * b if side == "L" else 64 - 32 * a - 32 * b
        py = 45 + 16 * a - 43 * b
        src = SL if side == "L" else SR
        k = var[np.floor(uu if side == "L" else vv).astype(int) % 64, np.floor(bb).astype(int) % 64] % len(src)
        for i in range(len(src)):
            m = k == i
            col = src[i][np.clip(py[m].astype(int), 0, src[i].shape[0] - 1), np.clip(px[m].astype(int), 0, 63)]
            img[ys_[m], xs_[m]] = col
        # (the eave's drip: under the slates, their shadow)
        drip = bb < 0.05
        img[ys_[drip], xs_[drip], :3] = (img[ys_[drip], xs_[drip], :3] * 0.55).astype(np.uint8)
    hole = (south | east) & (img[..., 3] == 0)
    img[hole] = (30, 31, 56, 255)

    # (the ridge, and the hip between the two faces: capped, catching the moon; the far hips an edge)
    def line(p, q, cols):
        (pu, pv, pz), (qu, qv, qz) = p, q
        n = int(max(abs((pu - pv) - (qu - qv)) * 32, abs((pu + pv) - (qu + qv)) * 16 + abs(pz - qz)) * 2) + 2
        for t in np.linspace(0, 1, n):
            uu = pu + (qu - pu) * t
            vv = pv + (qv - pv) * t
            zz = pz + (qz - pz) * t
            sx = int(round((uu - vv) * 32 - x0))
            sy = int(round((uu + vv) * 16 - Hf - zz - y0))
            for k, c in enumerate(cols):
                if 0 <= sy + k < H and 0 <= sx < W:
                    img[sy + k, sx] = (*c, 255)
    rw = (X0T + half, ridge_v, rise)
    re = (X1T - half, ridge_v, rise)
    line(rw, re, [(118, 120, 164), (88, 90, 132), (40, 41, 72)])
    line((X1T, Y1T, 0), re, [(104, 106, 150), (60, 62, 100)])
    line((X0T, Y1T, 0), rw, [(78, 80, 120)])
    line((X1T, Y0T, 0), re, [(44, 45, 78)])
    return img, x0, y0


def inside_lights(d: dict) -> list:
    """The lights of the things standing inside the building (its braziers, the waypoint's glow and light), game pixels."""
    L = json.load(open(os.path.join(ROOT, "..", "floor2", "layout.json")))
    w = L["w"]
    T = L["tiles"]
    pts = []
    pl = d.get("pic_lights", {})
    for it in d["items"]:
        if not it.get("frames") or it["frames"][0] not in pl:
            continue
        tx = (it["x"] / 16 + it["y"] / 8) / 2
        ty = (it["y"] / 8 - it["x"] / 16) / 2
        ix, iy = int(np.floor(tx)), int(np.floor(ty))
        if X0T < tx < X1T - 1 and Y0T < ty < Y1T - 1 and T[iy * w + ix] == 1:
            for p in pl[it["frames"][0]]:
                pts.append((it["x"] + p[0], it["y"] + p[1], 8))
    wp = d.get("waypoint")
    if wp:
        pts.append((wp["x"], wp["y"], 32))
    out = []
    for l in d.get("lights", []):
        for (x, y, r) in pts:
            if abs(l["x"] - x) <= r and abs(l["y"] - y) <= 8:
                out.append([l["x"], l["y"]])
                break
    for (x, y, r) in pts:
        if r == 8:
            out.append([x, y])
    return out


if __name__ == "__main__":
    main()
