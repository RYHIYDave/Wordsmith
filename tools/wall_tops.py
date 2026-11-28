"""Wall tops: the top of every wall tile that the look leaves empty, painted as wall (the queue's item, his words of 28 Nov 2026
to the main chat: “I don't think I agree that it being black is an okay fix.  I'd like an actual wall there”).

A look of the first kind (godot/assets/looks/<place>.json, painted from the game's renderer: floor 1 and floor 2) draws a wall
only where it has a face toward the eye; each face's picture carries the top of its own tile (a strip of slate, or a wall-walk
and its merlon). A wall more than a tile thick (the cell blocks between the courtyards, the outer wall's thick runs) has tiles
with no face, and their tops are left empty: black in the dark, and stars under the night sky.

Each such tile gets its top, at the height and in the stone of the wall it belongs to (the nearest wall tile that has a face),
laid only where the look shows nothing on the screen: the look shows the ground behind a thick block as if the block were cut
away, and a top laid whole would hide it; so the tops fill the holes and nothing else:
  SLATE (a building's: the faces with a slate roof on top, 182 pixels high): flat at the height of the slate's back edge (148
    picture pixels), slates in the look's own tones laid in courses that run on from tile to tile, lit as a top is (a step
    lighter than the slopes), moss here and there.
  WALL-WALK (the outer walls': the faces with a merlon on top, 208 pixels high): flat at the walls' height (150), in their
    own flagstones (four to a tile, their joints dotted), as on their tops.
  LOW (the low walls'): flat at their height, a coping.
Where the wall ends beyond it, on the far side (toward -x or -y), its edge catches the light: a lit line, and under it the
joint.

Writes godot/assets/looks/<place>_tops.png and <place>_tops.json {"sheet", "pics": {name: [x, y, w, h, ax, ay]}, "items":
[{"layer": "stand", "kind": "wall", "x", "y", "d", "frames": [name], "what": "wall top", "seen_by": [x, y]}]}: look.gd
(WALL_TOPS) lays them among the look's own walls, so that they stand and fade as walls do; each is seen once the face of its
wall is (`seen_by`: the nearest wall tile beside the ground, which the sight falls on; it never falls on a wall's inner tiles),
or any such tile of its own wall within 14 tiles (`seen_by_any`).

Run: python3 tools/wall_tops.py floor2   (then `godot --headless --path godot --import`)
"""
import json
import os
import sys
from collections import deque

import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "godot", "assets")
SEED = 281126
SEAM = (14, 12, 36)
WALK = [(52, 56, 103), (38, 40, 80), (46, 49, 92)]      # the wall-walk's flags, lit as tops are (the outer walls' own)
LIT_EDGE = (68, 74, 118)


def main(place: str) -> None:
    rng = np.random.default_rng(SEED)
    looks = os.path.join(ROOT, "looks")
    d = json.load(open(os.path.join(looks, place + ".json")))
    pics = json.load(open(os.path.join(looks, place + "_pics.json")))
    sheet = Image.open(os.path.join(looks, place + ".png")).convert("RGBA")
    floor = place.replace("v2", "")
    L = json.load(open(os.path.join(ROOT, floor, "layout.json")))
    w, h = L["w"], L["h"]
    T = np.array(L["tiles"]).reshape(h, w)

    # each wall tile that has a face: its kind (by its picture)
    kind = {}
    for it in d["items"]:
        if it.get("layer") != "stand" or it.get("kind") != "wall" or not it.get("frames"):
            continue
        n = it["frames"][0]
        tx = int(round((it["x"] / 16 + it["y"] / 8) / 2))
        ty = int(round((it["y"] / 8 - it["x"] / 16) / 2))
        ph = pics[n][3]
        k = "slate" if ph == 182 else "walk" if ph >= 200 else "low"
        if 0 <= tx < w and 0 <= ty < h:
            kind[(tx, ty)] = (k, n)
    # the wall tiles with none: each takes the kind of the nearest that has one, through the wall
    holes = [(x, y) for y in range(h) for x in range(w) if T[y, x] == 2 and (x, y) not in kind]
    owner = {}
    q = deque()
    for (x, y), v in kind.items():
        owner[(x, y)] = v
        q.append((x, y))
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and T[ny, nx] == 2 and (nx, ny) not in owner:
                owner[(nx, ny)] = owner[(x, y)]
                q.append((nx, ny))
    # (what the sight falls on: the wall tiles beside the ground; each other wall tile seen with the nearest of them)
    def by_ground(x, y):
        return any(0 <= x + dx < w and 0 <= y + dy < h and T[y + dy, x + dx] in (1, 3)
                   for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
    seen_by = {}
    q = deque()
    for y in range(h):
        for x in range(w):
            if T[y, x] == 2 and by_ground(x, y):
                seen_by[(x, y)] = (x, y)
                q.append((x, y))
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and T[ny, nx] == 2 and (nx, ny) not in seen_by:
                seen_by[(nx, ny)] = seen_by[(x, y)]
                q.append((nx, ny))

    def wall(x, y):
        return 0 <= x < w and 0 <= y < h and T[y, x] == 2

    # WHAT THE LOOK ALREADY COVERS on the screen (every picture of its ground, its floor and what stands): a top is laid only
    # where nothing is, so that it fills the holes and never covers the ground the look shows (the floor in front of a wall
    # block is shown as if the block were cut away: a top laid whole would hide it)
    xs, ys = [], []
    for it in d["items"]:
        if it.get("frames") and it.get("layer") in ("back", "floor", "flat", "stand"):
            p = pics[it["frames"][0]]
            xs += [it["x"] * 2 - p[4], it["x"] * 2 - p[4] + p[2]]
            ys += [it["y"] * 2 - p[5], it["y"] * 2 - p[5] + p[3]]
    CX0, CY0 = int(min(xs)) - 64, int(min(ys)) - 256
    cov = np.zeros((int(max(ys)) - CY0 + 64, int(max(xs)) - CX0 + 64), bool)
    sh = np.array(sheet)[..., 3] > 0
    for it in d["items"]:
        if it.get("frames") and it.get("layer") in ("back", "floor", "flat", "stand"):
            p = pics[it["frames"][0]]
            x0 = int(round(it["x"] * 2 - p[4])) - CX0
            y0 = int(round(it["y"] * 2 - p[5])) - CY0
            cov[y0:y0 + p[3], x0:x0 + p[2]] |= sh[p[1]:p[1] + p[3], p[0]:p[0] + p[2]]
    # (the hairline seams between the floor's diamonds, and any speck, are not holes: only a gap of some size is)
    from scipy.ndimage import label as _label
    lab, _n = _label(~cov)
    size = np.bincount(lab.ravel())
    cov |= size[lab] < 400

    # (and seen as soon as any of the wall tiles beside the ground within 14 tiles of it, of its own wall mass, is: a roof is seen
    # from the courtyard on either side of its block)
    by_ground_at = np.zeros((h, w), bool)
    for (ex, ey) in seen_by.values():
        by_ground_at[ey, ex] = True
    from scipy.ndimage import label as _lab2
    mass, _nm = _lab2(T == 2)

    def near_edge(x, y):
        out = []
        for yy in range(max(0, y - 14), min(h, y + 15)):
            for xx in range(max(0, x - 14), min(w, x + 15)):
                if by_ground_at[yy, xx] and mass[yy, xx] == mass[y, x]:
                    out.append([xx, yy])
        return out

    out_pics = {}
    items = []
    tiles = []
    # (and under the tops the faces carry, the same top, behind them: it fills what their strips leave between them, where
    # two roofs meet in a corner)
    under = [(x, y) for (x, y), v in kind.items() if v[0] != "low" and T[y, x] == 2]
    for (x, y) in holes + under:
        is_hole = (x, y) not in kind
        k, src = owner.get((x, y), ("walk", None))
        H = {"slate": 148, "walk": 150, "low": 80}[k]
        img = np.zeros((32, 64, 4), np.uint8)
        yy, xx = np.mgrid[0:32, 0:64]
        a = ((xx + 0.5 - 32) / 32 + (yy + 0.5) / 16) / 2      # along +x of the tile
        c = ((yy + 0.5) / 16 - (xx + 0.5 - 32) / 32) / 2      # along +y
        inside = (a >= 0) & (a < 1) & (c >= 0) & (c < 1)
        if k == "slate":
            # slates laid in courses along x, the courses running on from tile to tile (five to a tile), each slate its own
            # length and tone, their joints dark; moss here and there
            U = x + a
            V = y + c
            course = np.floor(V * 5).astype(int)
            f = V * 5 - course
            off = (course * 0.37) % 1.0
            sl = np.floor((U + off) * 3.2).astype(int)
            g = U * 3.2 + off * 3.2 - sl
            hsh = (sl * 73856093 ^ course * 19349663) & 0xffff
            tone = np.where(hsh % 7 == 0, 1, np.where(hsh % 5 == 0, 2, 0))
            pal = np.array([[(46, 50, 86), (35, 38, 69), (25, 27, 51)], [(56, 61, 99), (44, 48, 82), (31, 34, 62)],
                            [(38, 41, 73), (28, 31, 57), (20, 22, 43)]])
            row = np.where(f < 0.18, 0, np.where(f > 0.74, 2, 1))
            col = pal[tone, row]
            joint = (f > 0.88) | (g < 0.06)
            col[joint] = (13, 14, 32)
            mo = ((np.sin(U * 2.1 + V * 1.3 + x * 0.7) + np.sin(U * 5.3 - V * 3.1 + y)) > 1.55) & ~joint & (hsh % 3 == 0)
            col[mo] = (39, 52, 54)
            img[inside, :3] = col[inside].astype(np.uint8)
            img[inside, 3] = 255
        else:
            # flags, four to a tile, their joints dotted, each its own tone
            q2 = (np.floor(a * 2).astype(int) + 2 * np.floor(c * 2).astype(int)).clip(0, 3)
            tone = [WALK[int(rng.integers(0, 3))] if rng.random() < 0.6 else WALK[0] for _ in range(4)]
            for i in range(4):
                m = inside & (q2 == i)
                img[m, :3] = tone[i]
                img[m, 3] = 255
            ja = np.abs(a * 2 - np.round(a * 2)) * 32 < 0.8
            jc = np.abs(c * 2 - np.round(c * 2)) * 16 < 0.6
            dots = inside & (ja | jc) & (((xx + yy) % 2) == 0)
            img[dots, :3] = SEAM
            if k == "low":
                img[inside, :3] = (img[inside, :3] * 0.85).astype(np.uint8)
        # (its far edges, where the wall ends: lit, the joint under)
        for dx, dy, edge in ((0, -1, c < 1.6 / 16), (-1, 0, a < 1.6 / 32)):
            if is_hole and not wall(x + dx, y + dy):
                m = inside & edge
                img[m, :3] = LIT_EDGE
        # (only where the look covers nothing)
        sx0, sy0 = (x - y) * 32 - 32 - CX0, (x + y) * 16 - H - CY0
        img[cov[sy0:sy0 + 32, sx0:sx0 + 64], 3] = 0
        if not img[..., 3].any():
            continue
        name = "top %d %d" % (x, y)
        tiles.append((name, img, H))
        gx, gy = (x - y) * 16, (x + y) * 8
        items.append({"layer": "stand", "kind": "wall", "what": "wall top", "x": gx, "y": gy,
                      "d": x + y + (1 if is_hole else 0.5), "frames": [name], "seen_by": list(seen_by.get((x, y), (x, y))),
                      "seen_by_any": near_edge(x, y)})
    # the sheet: the tops in rows
    per = 32
    W = per * 65
    Hs = ((len(tiles) + per - 1) // per) * 33
    big = np.zeros((max(Hs, 33), W, 4), np.uint8)
    for i, (name, img, H) in enumerate(tiles):
        cx, cy = (i % per) * 65, (i // per) * 33
        big[cy:cy + 32, cx:cx + 64] = img
        out_pics[name] = [cx, cy, 64, 32, 32, H]
    Image.fromarray(big).save(os.path.join(looks, place + "_tops.png"))
    json.dump({"sheet": place + "_tops.png", "pics": out_pics, "items": items},
              open(os.path.join(looks, place + "_tops.json"), "w"))
    kinds = {}
    for (x, y) in holes:
        k = owner.get((x, y), ("walk",))[0]
        kinds[k] = kinds.get(k, 0) + 1
    print("%s: %d wall tops where the look has none (%s), %d under the faces' own; %d laid where the look shows nothing" % (place, len(holes), kinds, len(under), len(tiles)))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "floor2")
