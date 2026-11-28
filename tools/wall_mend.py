"""Mending the walls of floors 1 to 5 (his words, 28 Nov 2026, of the gaps found at the rooms' diagonal corners: “Fix them in a
way that keeps the wall flowing correcting.  There are already issues with the straight east-west walls where the square blocks
are not cut to make triangles so the wall is flat.  Make it look correct.”).

Two mends, each in the floor's own wall pictures (godot/assets/looks/<place>.json and its pictures):
  THE NEAR SLANTING WALLS. A wall that runs straight across the screen (its tiles stepping diagonally) on the near side of a room
    is drawn as square blocks seen corner on, a row of points along its foot (the floor's "slanting wall near" picture). Cut on
    the diagonal, it is one flat face, as the far slanting walls already are: each near slanting piece is drawn with the far
    slanting picture, at its own place and depth (its foot on the line through the blocks' side corners, where the cut runs).
  THE STEP FACES. Where a wall runs diagonally down the screen, the look leaves some of its steps without the face toward the
    room (or, on the near side, toward the eye), and the dark behind shows through as a slit. Each such face is laid in, the
    floor's own straight wall face of that side (a face toward +y: its left-hand face; toward +x: its right-hand), at the
    step's own tile, so that the steps' faces stand one over the next as one band and the wall runs on unbroken. Which faces
    are missing comes from the whole-floor pictures (godot/scripts/check_walls.gd, `--only=walls --floor=N`, and
    tools/wall_check.py): every face that shows only the background just above its foot.
Writes godot/assets/looks/<place>_mend.json {"swap": {near picture: far picture}, "add": [items], "fog": [tiles]}: look.gd (MEND)
lays it over the look as it loads.

Run: python3 tools/wall_mend.py <floor number> <wall_check json>   (e.g. 3 /tmp/wallcheck.json)
"""
import json
import os
import sys
from collections import Counter

import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "godot", "assets")


def main(f: int, check: str) -> None:
    looks = os.path.join(ROOT, "looks")
    place = "floor%dv2" % f if os.path.exists(os.path.join(looks, "floor%dv2.json" % f)) else "floor%d" % f
    d = json.load(open(os.path.join(looks, place + ".json")))
    pics = json.load(open(os.path.join(looks, place + "_pics.json")))
    sheets = d.get("sheets") or [place + ".png"]
    S = [np.array(Image.open(os.path.join(looks, s)).convert("RGBA")) for s in sheets]
    lp = os.path.join(ROOT, place, "layout.json")
    L = json.load(open(lp if os.path.exists(lp) else os.path.join(ROOT, "floor%d" % f, "layout.json")))
    w = L["w"]
    fmt = int(d.get("format", 1))

    def alpha(n):
        p = pics[n]
        s = S[p[6] if len(p) > 6 and p[6] >= 0 else 0]
        return s[p[1]:p[1] + p[3], p[0]:p[0] + p[2], 3]

    frames = lambda it: it.get("f") or it.get("frames") or []
    use = Counter()
    for it in d["items"]:
        for n in set(frames(it)):
            use[n] += 1
    near, far, left, right = [], [], [], []
    for n, p in pics.items():
        if p[2] != 64 or p[3] != 112:
            continue
        a = alpha(n)
        if a.shape != (112, 64):
            continue
        if a[110, 32] > 0 and a[110, 8] == 0 and a[95, 20] > 0 and a[95, 44] > 0:
            near.append(n)
        elif a[94, 20] > 0 and a[94, 44] > 0 and a[100, 32] == 0 and a[60, 1] > 0 and a[60, 62] > 0:
            far.append(n)
        elif a[70, 12] > 0 and a[70, 52] == 0:
            left.append(n)
        elif a[70, 52] > 0 and a[70, 12] == 0:
            right.append(n)
    # (the straight faces most used: the plain ones, not a door's or a banner's)
    left = sorted(left, key=lambda n: -use[n])[:3]
    right = sorted(right, key=lambda n: -use[n])[:3]
    far_pic = max(far, key=lambda n: use[n]) if far else None
    swap = {n: far_pic for n in near} if far_pic else {}
    # the step faces missing
    miss = json.load(open(check)).get(str(f), [])
    add = []
    fog = []
    seen = set()
    for x, y, kind, _v in miss:
        side = "L" if kind.startswith("+y") else "R"
        if (x, y, side) in seen:
            continue
        seen.add((x, y, side))
        names = left if side == "L" else right
        n = names[(x * 7 + y * 3) % len(names)]
        gx, gy = (x - y) * 16, (x + y) * 8
        dd = x + y + 1
        if fmt == 2:
            add.append({"f": [n], "x": gx, "y": gy, "d": dd, "wall": [gx, gy, dd, y * w + x]})
            fog.append(y * w + x)
        else:
            add.append({"layer": "stand", "kind": "wall", "what": "mended wall", "x": gx, "y": gy, "d": dd, "frames": [n]})
    json.dump({"swap": swap, "add": add, "fog": fog}, open(os.path.join(looks, place + "_mend.json"), "w"))
    n_near = sum(1 for it in d["items"] if frames(it) and frames(it)[0] in swap)
    print("%s: %d near slanting pieces cut flat (%s -> %s); %d step faces laid in (left %s, right %s)" % (
        place, n_near, near, far_pic, len(add), left, right))


if __name__ == "__main__":
    main(int(sys.argv[1]), sys.argv[2])
