# A SMALL SCULPTOR FOR PIXEL ART (the Reaping creatures, his "work on reaping", 24 Nov 2026): a figure built in 3D of
# ellipsoids and chains of spheres, as his Art Rulebook allows ("A figure may be built in 3D in code and turned into pixel art,
# as the heroes are"), turned to the game's one angle, lit from the upper left, and laid down as crisp pixel art: each pixel
# the part it shows most of, in that part's colours by how the light falls on it; a seam of deep indigo where one part ends in
# front of another; its edge all round in its side's colour (the friend's cyan, the enemy's pink). Pure Python and numpy.
import math
import numpy as np

SEAM = (26, 22, 48)          # deep indigo, where one part ends in front of another (Rulebook, Pixels 5)
FRIEND = (40, 220, 240)      # the friend's edge, as Reaping's grey Shade has it (W7_FRIEND[2], #28dcf0)
ENEMY = (255, 79, 138)       # the enemy's edge (ENEMY_RIM, #ff4f8a)
PITCH = math.radians(25.0)   # how far the camera looks down
LIGHT = np.array([-0.55, 0.62, 0.56])
LIGHT = LIGHT / np.linalg.norm(LIGHT)


def hexc(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rot_matrix(rx, ry, rz):
    rx, ry, rz = math.radians(rx), math.radians(ry), math.radians(rz)
    cx, sx, cy, sy, cz, sz = math.cos(rx), math.sin(rx), math.cos(ry), math.sin(ry), math.cos(rz), math.sin(rz)
    X = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]])
    Y = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]])
    Z = np.array([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]])
    return Y @ X @ Z


class Model:
    """Parts: each an ellipsoid {c, radii, R (its turn), mat, group}. Model space: x right, y up, z toward the viewer when it
    faces him; the ground at y = 0, the figure stood on its origin."""

    def __init__(self):
        self.parts = []

    def ell(self, c, radii, mat, group, rot=(0, 0, 0)):
        self.parts.append({'c': np.array(c, float), 'r': np.array(radii, float), 'R': rot_matrix(*rot), 'mat': mat, 'group': group})

    def ball(self, c, r, mat, group):
        self.ell(c, (r, r, r), mat, group)

    def chain(self, pts, radii, mat, group, step=0.45):
        """Spheres along the line through `pts`, their radii going from each of `radii` to the next: a limb, a horn, a tail."""
        pts = [np.array(p, float) for p in pts]
        for i in range(len(pts) - 1):
            a, b = pts[i], pts[i + 1]
            ra, rb = radii[i], radii[i + 1]
            n = max(1, int(np.linalg.norm(b - a) / step))
            for k in range(n + (1 if i == len(pts) - 2 else 0)):
                t = k / n
                self.ball(a + (b - a) * t, ra + (rb - ra) * t, mat, group)

    def curve(self, pts, radii, mat, group, n=24):
        """A smooth chain through `pts` (a Catmull-Rom curve), its radius eased along it."""
        P = [np.array(p, float) for p in pts]
        P = [P[0]] + P + [P[-1]]
        out, rr = [], []
        segs = len(pts) - 1
        for i in range(segs):
            p0, p1, p2, p3 = P[i], P[i + 1], P[i + 2], P[i + 3]
            for k in range(n):
                t = k / n
                t2, t3 = t * t, t * t * t
                q = 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
                out.append(q)
                u = (i + t) / segs
                j = min(len(radii) - 2, int(u * (len(radii) - 1)))
                f = u * (len(radii) - 1) - j
                rr.append(radii[j] + (radii[j + 1] - radii[j]) * f)
        out.append(np.array(pts[-1], float))
        rr.append(radii[-1])
        for q, r in zip(out, rr):
            self.ball(q, r, mat, group)


def render(model, yaw, mats, W, H, ox, oy, S=4, side=FRIEND, seams=True, extra=None, post=None, scale=1.0):
    """The figure turned `yaw` degrees (0: facing the viewer; positive: turned to the viewer's right), on a W x H picture whose
    ground origin is at pixel (ox, oy). `mats`: name -> {ramp: [colours dark to light], glow: bool}. Returns an RGBA uint8 array
    (H, W, 4), its edge in `side`'s colour (None: no edge)."""
    Ry = rot_matrix(0, yaw, 0)
    cp, sp = math.cos(PITCH), math.sin(PITCH)
    # camera space: X right, Y up on the picture, Z toward the viewer
    def cam(v):
        return np.array([v[0], v[1] * cp - v[2] * sp, v[1] * sp + v[2] * cp])
    Wt, Ht = W * S, H * S
    xs = (np.arange(Wt) + 0.5) / S - ox
    ys = oy - (np.arange(Ht) + 0.5) / S
    X, Y = np.meshgrid(xs, ys)
    depth = np.full((Ht, Wt), -1e9)
    pid = np.full((Ht, Wt), -1, int)
    nrm = np.zeros((Ht, Wt, 3))
    C2M = np.array([[1, 0, 0], [0, cp, sp], [0, -sp, cp]])  # camera -> world (inverse of the pitch)
    for i, p in enumerate(model.parts):
        if scale != 1.0:
            p = dict(p, c=p['c'] * scale, r=p['r'] * scale)
        c = cam(Ry @ p['c'])
        Rw = C2M.T @ (Ry @ p['R'])           # the part's axes in camera space
        M = np.diag(1.0 / p['r']) @ Rw.T       # camera space -> the part's unit sphere
        rmax = float(p['r'].max())
        x0 = max(0, int((c[0] - rmax + ox) * S) - 1)
        x1 = min(Wt, int((c[0] + rmax + ox) * S) + 2)
        y0 = max(0, int((oy - c[1] - rmax) * S) - 1)
        y1 = min(Ht, int((oy - c[1] + rmax) * S) + 2)
        if x0 >= x1 or y0 >= y1:
            continue
        Xs, Ys = X[y0:y1, x0:x1], Y[y0:y1, x0:x1]
        w = np.stack([Xs - c[0], Ys - c[1], -c[2] * np.ones_like(Xs)], -1)
        Mw = w @ M.T
        Mez = M[:, 2]
        A = float(Mez @ Mez)
        B = Mw @ Mez
        Cq = (Mw * Mw).sum(-1) - 1.0
        disc = B * B - A * Cq
        hit = disc >= 0
        if not hit.any():
            continue
        z = (-B + np.sqrt(np.maximum(disc, 0))) / A
        sub = depth[y0:y1, x0:x1]
        win = hit & (z > sub)
        if not win.any():
            continue
        q = w.copy()
        q[..., 2] = q[..., 2] + z
        g = (q @ M.T) @ M                      # the gradient of |M q|^2 / 2
        g = g / np.maximum(1e-9, np.linalg.norm(g, axis=-1, keepdims=True))
        sub[win] = z[win]
        pid[y0:y1, x0:x1][win] = i
        nrm[y0:y1, x0:x1][win] = g[win]
    out = np.zeros((H, W, 4), np.uint8)
    grp = np.full((H, W), -1, int)
    dep = np.full((H, W), -1e9)
    body = np.zeros((H, W), bool)
    for yy in range(H):
        for xx in range(W):
            ids = pid[yy * S:(yy + 1) * S, xx * S:(xx + 1) * S].ravel()
            hitn = (ids >= 0).sum()
            if hitn * 2 < S * S:
                continue
            vals, cnt = np.unique(ids[ids >= 0], return_counts=True)
            k = int(vals[np.argmax(cnt)])
            sel = (pid[yy * S:(yy + 1) * S, xx * S:(xx + 1) * S] == k)
            n = nrm[yy * S:(yy + 1) * S, xx * S:(xx + 1) * S][sel].mean(0)
            n = n / max(1e-9, np.linalg.norm(n))
            part = model.parts[k]
            mat = mats[part['mat']]
            ramp = mat['ramp']
            if mat.get('glow'):
                lv = 0.35 + 0.65 * max(0.0, n[2])
            else:
                lam = max(0.0, float(n @ LIGHT))
                lv = 0.12 + 0.88 * lam
                lv = lv ** mat.get('gamma', 0.9)
            idx = min(len(ramp) - 1, int(lv * len(ramp)))
            out[yy, xx, :3] = hexc(ramp[idx])
            out[yy, xx, 3] = 255
            body[yy, xx] = True
            grp[yy, xx] = -2 if mat.get('glow') else part['group']
            dep[yy, xx] = depth[yy * S:(yy + 1) * S, xx * S:(xx + 1) * S][sel].mean()
    if seams:
        sm = np.zeros((H, W), bool)
        for yy in range(H):
            for xx in range(W):
                if not body[yy, xx] or grp[yy, xx] == -2:
                    continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    x2, y2 = xx + dx, yy + dy
                    if 0 <= x2 < W and 0 <= y2 < H and body[y2, x2] and grp[y2, x2] not in (grp[yy, xx], -2) and dep[y2, x2] > dep[yy, xx] + 1.2:
                        sm[yy, xx] = True
        out[sm, :3] = SEAM
    if extra is not None:
        extra(out, body)
        body = out[..., 3] > 0
    if side is not None:
        edge = np.zeros((H, W), bool)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            sh = np.zeros((H, W), bool)
            sh[max(0, dy):H + min(0, dy), max(0, dx):W + min(0, dx)] = body[max(0, -dy):H + min(0, -dy), max(0, -dx):W + min(0, -dx)]
            edge |= sh
        edge &= ~body
        out[edge, :3] = side
        out[edge, 3] = 255
    if post is not None:
        post(out, yaw)
    return out


def crop(img, ox, oy):
    """The picture cut to what is drawn, and where its ground origin falls in it."""
    a = img[..., 3] > 0
    if not a.any():
        return img[:1, :1], ox, oy
    ys, xs = np.where(a)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    return img[y0:y1, x0:x1], ox - x0, oy - y0
