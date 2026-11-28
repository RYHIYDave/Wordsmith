"""Floor 2's main building: the warden's quarters, where he comes in by the waypoint, made the prison's great main building, a
block of cells stories high (his idea, 27 Nov 2026: "the little room you come out of where the waypoint is at, thats the prison.
so maybe when you walk out of that room you should see a huge wall behind you as the wall of the prisons main building").

The building is the block of tiles x 1 to 13, y 68 to 75 (godot/assets/floor2/layout.json): the start room, the passage out of
it, and the walls round them. Seen from outside, it stands whole (the art rulebook, Places 9), a fortress keep: its two faces
toward the eye run up in plain ashlar far higher than the prison's other walls, few openings in them but narrow arrow slits,
battlements along its top round a flat stone roof, and a tower over the gate at its corner standing higher again. Once he
steps inside, the whole of it fades clear in a third of a second and the room is as it was (look.gd, F2_KEEP). His word on
the first pictures (a cell block of barred windows under a slate roof): "Different top, Less like an apartment block".

Made in the look's own stone (godot/assets/looks/floor2.png):
  THE FACES. One column a tile wide for each tile along the south face (y 75, facing +y) and the east face (x 13, facing +x):
    at its foot the look's own face of that tile (the room's two rows of windows, as the look has them) or the prison's outer
    wall; above, RISE picture pixels of ashlar laid course by course as the outer walls are (courses 12 pixels, a lit top row,
    a dark joint, blocks of their lengths and tones), a string course where it meets the windowed foot and another under the
    battlements, arrow slits here and there (a few with a light in them); at its top the outer wall's own top and merlon.
    Over the passage's door on the east face (y 70 to 74) the face begins above the gatehouse's gable, which stands in front
    of it as the look draws it.
  THE ROOF. Flat, in the courtyards' own flagstones, at the battlements' level; along its far edges the tops and merlons of
    the walls (the outer walls' own).
  THE TOWER over the gate: the keep's corner tiles x 11 to 13, y 73 to 75, TOWER picture pixels higher, its own battlements and
    roof.
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
RISE = 276          # how much higher than the prison's outer walls, picture pixels (23 courses)
TOWER = 144         # the tower over the gate, how much higher again (12 courses)
COURSE = 12         # the outer walls' courses, picture pixels
WALL = 150          # the outer walls' height (their faces), picture pixels
CUT = 88            # where a face is cut: this many picture pixels above its anchor (the look's faces' foot below it)
SEED = 271127
X0T, X1T, Y0T, Y1T = 1, 14, 68, 76     # the building's tiles: x 1 to 13, y 68 to 75 (edges 1..14, 68..76)
DOOR = (70, 75)     # the east face's tiles that the gatehouse stands on (its gable in front)
TOWER_AT = (11, 73) # the tower's tiles: x 11 to 13, y 73 to 75
LEFT = ["face left 10", "face left 11", "face left 12", "face left 13", "face left 14"]
RIGHT = ["face right 10", "face right 11", "face right 12", "face right 13"]
OUTER_L = ["face left", "face left 1", "face left 2", "face left 3"]
OUTER_R = ["face right", "face right 1", "face right 2", "face right 3"]
# the outer walls' stone (read off their pictures): for each side, a block's tones (its lit top row, its body, its foot) as the
# most of them are, and a lighter and a darker block; the joint
STONE = {"L": [((52, 56, 103), (38, 40, 80), (27, 28, 54)), ((86, 96, 144), (52, 56, 103), (38, 40, 80)),
               ((38, 40, 80), (27, 28, 54), (20, 20, 44))],
         "R": [((38, 40, 80), (27, 28, 54), (14, 12, 36)), ((52, 56, 103), (38, 40, 80), (27, 28, 54)),
               ((27, 28, 54), (20, 20, 44), (14, 12, 36))]}
JOINT = (14, 12, 36)


def main() -> None:
    rng = np.random.default_rng(SEED)
    d = json.load(open(os.path.join(ROOT, "floor2.json")))
    pics = json.load(open(os.path.join(ROOT, "floor2_pics.json")))
    sheet = Image.open(os.path.join(ROOT, "floor2.png")).convert("RGBA")

    def pic(name: str) -> np.ndarray:
        x, y, w, h, _ax, _ay = pics[name]
        return np.array(sheet.crop((x, y, x + w, y + h)))

    # the look's own windowed faces on the building's tiles (their feet kept, so the room's windows and their glow stay)
    own = {}
    for it in d["items"]:
        if it.get("layer") == "stand" and it.get("kind") == "wall" and it.get("frames"):
            n = it["frames"][0]
            if n in LEFT or n in RIGHT:
                tx = round((it["x"] / 16 + it["y"] / 8) / 2)
                ty = round((it["y"] / 8 - it["x"] / 16) / 2)
                own[(tx, ty, "L" if n in LEFT else "R")] = n

    def face_mask(h: int, side: str, top: int) -> np.ndarray:
        """A face's own pixels in a face picture, under its top edge (`top` picture pixels down at the face's high end)."""
        yy, xx = np.mgrid[0:h, 0:64]
        if side == "L":
            return (xx < 32) & (yy >= top + xx * 0.5)
        return (xx >= 32) & (yy >= top + (64 - xx) * 0.5)

    def shear(side: str, x: int) -> int:
        return x // 2 if side == "L" else (63 - x) // 2

    def phase(side: str, name: str) -> int:
        """Where the courses of an outer wall's face lie: the row of their lit tops, less the shear, modulo COURSE."""
        a = pic(name).astype(int)
        lit = np.array(STONE[side][0][0])
        votes = []
        for x in (range(4, 28) if side == "L" else range(36, 60)):
            for y in range(60, 180):
                if np.abs(a[y, x, :3] - lit).sum() < 6:
                    votes.append((y - shear(side, x)) % COURSE)
        return int(np.bincount(votes, minlength=COURSE).argmax()) if votes else 0

    def ashlar(side: str, h: int, ph: int) -> np.ndarray:
        """`h` rows of the outer walls' ashlar for a face of side `side` (64 wide, the face's half), courses at phase `ph`."""
        out = np.zeros((h, 64, 4), np.uint8)
        xs = range(0, 32) if side == "L" else range(32, 64)
        tones = STONE[side]
        ncourse = h // COURSE + 3
        # (each course: its joints along it, and each block's tone)
        for c in range(-1, ncourse):
            cuts = []
            x = int(rng.integers(-14, 0))
            while x < 64:
                cuts.append(x)
                x += int(rng.choice([8, 10, 12, 12, 14, 16, 18]))
            for bi in range(len(cuts)):
                x0, x1 = cuts[bi], (cuts[bi + 1] if bi + 1 < len(cuts) else 64)
                r = rng.random()
                tone = tones[1] if r < 0.06 else tones[2] if r < 0.15 else tones[0]
                speck = (int(rng.integers(x0 + 2, max(x0 + 3, x1 - 1))), int(rng.integers(2, 9))) if rng.random() < 0.5 else None
                for x in range(max(x0, 0), min(x1, 64)):
                    if x not in xs:
                        continue
                    for k in range(COURSE):
                        y = ph + shear(side, x) + c * COURSE + k - COURSE * 2
                        if not 0 <= y < h:
                            continue
                        if x == x0 or k == COURSE - 1:
                            col = JOINT
                        elif k == 0:
                            col = tone[0]
                        elif k == COURSE - 2:
                            col = tone[2]
                        else:
                            col = tone[1]
                        if speck and x == speck[0] and k == speck[1]:
                            col = tone[2]
                        out[y, x, :3] = col
                        out[y, x, 3] = 255
        return out

    def string_course(img: np.ndarray, side: str, row: int) -> None:
        """A string course along the face: a ledge of stone one course high, unbroken, its top catching the light."""
        tone = STONE[side][0]
        for x in (range(0, 32) if side == "L" else range(32, 64)):
            for k, col in enumerate((STONE[side][1][0], tone[0], tone[1], tone[1], tone[2], JOINT)):
                y = row + shear(side, x) + k
                if 0 <= y < img.shape[0] and img[y, x, 3] > 0:
                    img[y, x, :3] = col

    def slit(img: np.ndarray, side: str, x: int, row: int, lit: bool) -> None:
        """An arrow slit at column `x`, its top `row` rows down (on the face's shear): dark and narrow, its left side lit and its
        right in shadow, a stone over it and a sill under it; a light in a few of them."""
        tone = STONE[side][0]
        y0 = row + shear(side, x)
        for k in range(-1, 21):
            y = y0 + k
            for dx, col in ((-1, tone[0]), (0, (8, 8, 20)), (1, (8, 8, 20)), (2, tone[2])):
                c = col
                if k in (-1, 20):
                    c = STONE[side][1][0] if dx in (0, 1) else tone[0]
                elif lit and dx in (0, 1) and 5 <= k <= 15:
                    c = (196, 110, 52) if dx == 0 else (140, 70, 36)
                if 0 <= y < img.shape[0] and img[y, x + dx, 3] > 0:
                    img[y, x + dx, :3] = c

    def quoins(img: np.ndarray, side: str, edge: str, rows: tuple) -> None:
        """Quoins up a corner of the keep (`edge` "lo": the face's left end in the picture, "hi": its right end): long and short
        stones by turns, lighter than the wall, their joints dark; between the rows `rows` (from the top)."""
        tone = STONE[side][1]
        x_end = (0 if side == "L" else 32) if edge == "lo" else (31 if side == "L" else 63)
        step = 1 if edge == "lo" else -1
        for c in range(-2, img.shape[0] // COURSE + 3):
            width = 9 if c % 2 == 0 else 5
            for i in range(width + 1):
                x = x_end + step * i
                for k in range(COURSE):
                    y = (rows[0] // COURSE) * COURSE + c * COURSE + k + shear(side, x) + ph_of[id(img)]
                    if not rows[0] <= y < rows[1] or not 0 <= y < img.shape[0] or img[y, x, 3] == 0:
                        continue
                    if i == width or k == COURSE - 1:
                        col = JOINT
                    elif k == 0:
                        col = tone[0]
                    elif k == COURSE - 2:
                        col = tone[2]
                    else:
                        col = tone[1]
                    img[y, x, :3] = col

    ph_of = {}

    def column(side: str, tx: int, ty: int, rise: int, courses: list, edges=()) -> np.ndarray:
        """A face of the keep: the outer wall's top (its merlon), `rise` picture pixels of ashlar, the look's own foot or the
        outer wall's; string courses at the rows `courses` (from the top), arrow slits."""
        outer = (OUTER_L if side == "L" else OUTER_R)[(tx * 3 + ty) % 4]
        top = pic(outer)[:CUT]
        foot_name = own.get((tx, ty, side))
        if foot_name:
            fb = pic(foot_name)
            ay = pics[foot_name][5]
            foot = fb[ay - CUT:].copy()
            foot[~face_mask(fb.shape[0], side, 45)[ay - CUT:]] = 0
        else:
            foot = pic(outer)[CUT:]
        ph = phase(side, outer)
        mid = ashlar(side, rise, (ph - CUT) % COURSE)
        img = np.concatenate([top, mid, foot], 0).copy()
        ph_of[id(img)] = ph % COURSE
        for e in edges:
            quoins(img, side, e, (CUT, CUT + rise))
        for r in courses:
            string_course(img, side, r)
        # (arrow slits: a few, between the courses)
        lo, hi = CUT + COURSE * 2, CUT + rise - COURSE * 3
        r = lo + int(rng.integers(0, COURSE * 3))
        while r < hi:
            if rng.random() < 0.3:
                x = int(rng.integers(8, 22)) if side == "L" else int(rng.integers(42, 56))
                slit(img, side, x, r + 2 - shear(side, x) + shear(side, x), rng.random() < 0.12)
            r += COURSE * 4
        return img

    def in_tower(tx: int, ty: int) -> bool:
        return tx >= TOWER_AT[0] and ty >= TOWER_AT[1]

    pieces = []      # (image, screen x, screen y, depth)
    # THE SOUTH FACE: the tiles (x, 75), facing +y
    for tx in range(X0T, X1T):
        ty = Y1T - 1
        rise = RISE + (TOWER if in_tower(tx, ty) else 0)
        courses = [CUT, CUT + rise - COURSE] + ([CUT + TOWER] if rise > RISE else [])
        edges = (("lo",) if tx in (X0T, TOWER_AT[0]) else ()) + (("hi",) if tx == X1T - 1 else ())
        col = column("L", tx, ty, rise, courses, edges)
        gx, gy = (tx - ty) * 16, (tx + ty) * 8
        pieces.append((col, gx * 2 - 32, gy * 2 - (176 + rise), tx + Y1T + 0.9))
    # THE EAST FACE: the tiles (13, y), facing +x
    arch = gatehouse(d, pics, sheet)
    for ty in range(Y0T, Y1T):
        tx = X1T - 1
        rise = RISE + (TOWER if in_tower(tx, ty) else 0)
        courses = [CUT, CUT + rise - COURSE] + ([CUT + TOWER] if rise > RISE else [])
        edges = (("hi",) if ty in (Y0T, TOWER_AT[1]) else ()) + (("lo",) if ty == Y1T - 1 else ())
        col = column("R", tx, ty, rise, courses, edges)
        gx, gy = (tx - ty) * 16, (tx + ty) * 8
        sx, sy = gx * 2 - 32, gy * 2 - (176 + rise)
        depth = X1T + ty + 0.05
        if DOOR[0] <= ty < DOOR[1]:
            # (over the door: the face only above the gatehouse's gable, which stands in front of it)
            for x in range(64):
                top = arch.get(sx + x)
                if top is not None:
                    col[max(0, top - sy):, x] = 0
            depth = X1T + ty + 0.1
        pieces.append((col, sx, sy, depth))
    # THE ROOF, and the tower's
    def cap(side: str, name: str) -> np.ndarray:
        a = pic(name).copy()
        a[face_mask(a.shape[0], side, 42)] = 0
        return a

    flags = [n for n in pics if n.startswith("grounds flags")]

    def top(tiles_flag, caps_l, caps_r, rise):
        layers = []   # (order, image, screen x, screen y)
        for (u, v) in tiles_flag:
            f = pic(flags[(u * 7 + v * 3) % len(flags)])
            layers.append(((u + v) * 2, f, (u - v) * 32 - 32, (u + v) * 16 - (WALL + rise)))
        for (u, v) in caps_l:
            layers.append(((u + v) * 2 + 1, cap("L", OUTER_L[(u * 3 + v) % 4]), (u - v) * 32 - 32, (u + v) * 16 - 176 - rise))
        for (u, v) in caps_r:
            layers.append(((u + v) * 2 + 1, cap("R", OUTER_R[(u * 3 + v) % 4]), (u - v) * 32 - 32, (u + v) * 16 - 176 - rise))
        x0 = min(l[2] for l in layers)
        y0 = min(l[3] for l in layers)
        x1 = max(l[2] + l[1].shape[1] for l in layers)
        y1 = max(l[3] + l[1].shape[0] for l in layers)
        img = Image.new("RGBA", (x1 - x0, y1 - y0), (0, 0, 0, 0))
        for _o, im, sx, sy in sorted(layers, key=lambda l: l[0]):
            img.alpha_composite(Image.fromarray(im), (sx - x0, sy - y0))
        return np.array(img), x0, y0

    inner = [(u, v) for u in range(X0T + 1, X1T - 1) for v in range(Y0T + 1, Y1T - 1) if not in_tower(u, v)]
    roof, rx, ry = top(inner, [(u, Y0T) for u in range(X0T, X1T - 1)], [(X0T, v) for v in range(Y0T + 1, Y1T - 1)], RISE)
    pieces.append((roof, rx, ry, 81.5))
    t0x, t0y = TOWER_AT
    troof, tx_, ty_ = top([(u, v) for u in range(t0x + 1, X1T - 1) for v in range(t0y + 1, Y1T - 1)],
                          [(u, t0y) for u in range(t0x, X1T - 1)], [(t0x, v) for v in range(t0y + 1, Y1T - 1)], RISE + TOWER)
    pieces.append((troof, tx_, ty_, 86.95))

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
    print("keep: %d pieces, %d picture pixels higher (the tower %d more), the sheet %dx%d; %d lights inside" % (len(out), RISE, TOWER, W, H, len(info["lights"])))


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
