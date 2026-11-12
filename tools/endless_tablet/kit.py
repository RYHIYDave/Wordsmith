"""A small pixel-art sketch kit for concept sheets (not the game's own painter).

Everything is painted at the game's picture-pixel grain (two picture pixels to a game pixel), lit from the upper left, with a
one-pixel seam of the game's ink round every part, three tones a material, banded glows: as docs/art/RULEBOOK.md asks.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFont

INK = (14, 12, 36)
# the rim's stone (art/shaft_props.ts S), dark to light
S = [(20, 16, 24), (36, 28, 38), (53, 43, 52), (70, 58, 64), (88, 74, 76), (106, 90, 88), (126, 108, 100), (149, 132, 116)]
CY = [(11, 74, 90), (18, 143, 160), (34, 208, 224), (40, 220, 240), (191, 248, 255)]
PINK = [(122, 16, 88), (192, 32, 106), (255, 79, 138), (255, 176, 112), (255, 240, 160)]
EMBER = [(150, 60, 20), (232, 160, 32), (255, 216, 96), (255, 244, 192)]


def hexc(s):
    s = s.lstrip('#')
    return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))


class Pic:
    def __init__(self, w, h, bg=None):
        self.w, self.h = w, h
        self.rgb = np.zeros((h, w, 3), np.float32)
        self.a = np.zeros((h, w), np.float32)
        self.clip = None
        if bg is not None:
            self.rgb[:] = bg
            self.a[:] = 1

    # ---- masks
    def poly(self, pts):
        im = Image.new('L', (self.w, self.h), 0)
        ImageDraw.Draw(im).polygon([(float(x), float(y)) for x, y in pts], fill=255)
        return np.array(im) > 0

    def ellipse(self, cx, cy, rx, ry):
        yy, xx = np.mgrid[0:self.h, 0:self.w]
        return ((xx + 0.5 - cx) / max(rx, 0.5)) ** 2 + ((yy + 0.5 - cy) / max(ry, 0.5)) ** 2 <= 1

    def limb(self, p0, p1, r0, r1, steps=24):
        """A tapered limb from p0 (radius r0) to p1 (radius r1): a smooth swell, not a box with ends."""
        m = np.zeros((self.h, self.w), bool)
        for i in range(steps + 1):
            t = i / steps
            x = p0[0] + (p1[0] - p0[0]) * t
            y = p0[1] + (p1[1] - p0[1]) * t
            r = r0 + (r1 - r0) * t
            m |= self.ellipse(x, y, r, r)
        return m

    def curve_limb(self, pts, radii, steps=40):
        """A limb along a polyline of points, its radius going through `radii` (one a point)."""
        m = np.zeros((self.h, self.w), bool)
        n = len(pts) - 1
        for i in range(steps + 1):
            t = i / steps * n
            k = min(int(t), n - 1)
            u = t - k
            x = pts[k][0] + (pts[k + 1][0] - pts[k][0]) * u
            y = pts[k][1] + (pts[k + 1][1] - pts[k][1]) * u
            r = radii[k] + (radii[k + 1] - radii[k]) * u
            m |= self.ellipse(x, y, r, r)
        return m

    # ---- painting
    def fill(self, m, c, a=1.0):
        if self.clip is not None:
            m = m & self.clip
        c = np.array(c, np.float32)
        self.rgb[m] = self.rgb[m] * (1 - a) + c * a
        self.a[m] = np.maximum(self.a[m], a)

    def ink(self, m, w=1):
        ring = dilate(m, w) & ~m
        self.fill(ring, INK)

    def shade(self, m, tones, seam=True, cut=(0.32, 0.7), dirn=(-1, -1)):
        """A part lit from the upper left: `tones` dark to light (3 or more); where along the light's way through it each pixel
        lies decides its tone. With `seam`, a one-pixel ink seam round it, over what is behind."""
        if seam:
            self.ink(m)
        t = light_t(m, dirn)
        k = len(tones)
        if k == 3:
            idx = np.where(t < cut[0], 2, np.where(t > cut[1], 0, 1))
        else:
            idx = np.clip(((1 - t) * k).astype(int), 0, k - 1)
        for i, c in enumerate(tones):
            self.fill(m & (idx == i), c)

    def glow(self, cx, cy, r, c, a=0.5, bands=3, squash=1.0):
        yy, xx = np.mgrid[0:self.h, 0:self.w]
        d = np.hypot(xx + 0.5 - cx, (yy + 0.5 - cy) / squash) / r
        v = np.clip(1 - d, 0, 1)
        v = np.ceil(v * bands) / bands * a
        c = np.array(c, np.float32)
        self.rgb = np.clip(self.rgb + v[..., None] * c * (self.a[..., None] * 0 + 1), 0, 255)
        self.a = np.maximum(self.a, np.where(v > 0, np.minimum(1, v * 1.6), 0))

    def line(self, p0, p1, c, w=1):
        n = int(max(abs(p1[0] - p0[0]), abs(p1[1] - p0[1]), 1) * 2)
        for i in range(n + 1):
            x = p0[0] + (p1[0] - p0[0]) * i / n
            y = p0[1] + (p1[1] - p0[1]) * i / n
            x0, y0 = int(round(x - (w - 1) / 2)), int(round(y - (w - 1) / 2))
            for dy in range(w):
                for dx in range(w):
                    self.px(x0 + dx, y0 + dy, c)

    def px(self, x, y, c, a=1.0):
        x, y = int(x), int(y)
        if 0 <= x < self.w and 0 <= y < self.h and (self.clip is None or self.clip[y, x]):
            self.rgb[y, x] = self.rgb[y, x] * (1 - a) + np.array(c, np.float32) * a
            self.a[y, x] = max(self.a[y, x], a)

    def paste(self, img, x, y):
        """An RGBA picture (PIL) laid with its top left at (x, y)."""
        arr = np.array(img.convert('RGBA')).astype(np.float32)
        h, w = arr.shape[:2]
        x0, y0 = max(0, x), max(0, y)
        x1, y1 = min(self.w, x + w), min(self.h, y + h)
        if x1 <= x0 or y1 <= y0:
            return
        sub = arr[y0 - y:y1 - y, x0 - x:x1 - x]
        al = sub[..., 3:4] / 255
        self.rgb[y0:y1, x0:x1] = self.rgb[y0:y1, x0:x1] * (1 - al) + sub[..., :3] * al
        self.a[y0:y1, x0:x1] = np.maximum(self.a[y0:y1, x0:x1], al[..., 0])

    def image(self, scale=1):
        out = np.dstack([np.clip(self.rgb, 0, 255), np.clip(self.a * 255, 0, 255)]).astype(np.uint8)
        im = Image.fromarray(out, 'RGBA')
        if scale != 1:
            im = im.resize((self.w * scale, self.h * scale), Image.NEAREST)
        return im


def shift(m, dx, dy):
    out = np.zeros_like(m)
    h, w = m.shape
    xs0, xs1 = max(0, dx), min(w, w + dx)
    ys0, ys1 = max(0, dy), min(h, h + dy)
    out[ys0:ys1, xs0:xs1] = m[ys0 - dy:ys1 - dy, xs0 - dx:xs1 - dx]
    return out


def dilate(m, w=1):
    out = m.copy()
    for dy in range(-w, w + 1):
        for dx in range(-w, w + 1):
            if dx or dy:
                out |= shift(m, dx, dy)
    return out


def erode(m, w=1):
    return ~dilate(~m, w)


def light_t(m, dirn=(-1, -1), most=200):
    """For each pixel of m: how far along the light's way through the shape it lies, 0 at the lit edge, 1 at the dark."""
    dx, dy = dirn
    up = np.zeros(m.shape, np.float32)
    dn = np.zeros(m.shape, np.float32)
    cur_u = m.copy()
    cur_d = m.copy()
    for i in range(1, most):
        cur_u = cur_u & shift(m, -dx * i, -dy * i)
        cur_d = cur_d & shift(m, dx * i, dy * i)
        up += cur_u
        dn += cur_d
        if not cur_u.any() and not cur_d.any():
            break
    return np.where(m, (up + 0.5) / (up + dn + 1), 0)


def tones(base, n=3, spread=0.28):
    """Three tones of a colour: dark, mid, light."""
    b = np.array(base, np.float32)
    return [tuple(np.clip(b * (1 - spread), 0, 255)), tuple(b), tuple(np.clip(b + (255 - b) * spread * 0.8, 0, 255))]


# ---- sheets

FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def font(n):
    return ImageFont.truetype(FONT, n)


def label(img, xy, text, size=34, fill=(235, 232, 245)):
    ImageDraw.Draw(img).text(xy, text, font=font(size), fill=fill)


def wrap(text, size, width):
    d = ImageDraw.Draw(Image.new('RGB', (4, 4)))
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font(size)) > width and cur:
            lines.append(cur)
            cur = w
        else:
            cur = t
    if cur:
        lines.append(cur)
    return lines
