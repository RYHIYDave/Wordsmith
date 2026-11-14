// FLOOR 20'S BOSS, THE MOTH, MADE GHOSTLY: WHAT HER NEW ATTACKS LOOK LIKE (art/moth2.ts has his words, where each strikes and
// its numbers; render/act1_fx/moth.ts draws these in place of the old while MOTH2 is on). Drawn straight onto the game's own
// pixels each frame, given where a point of the floor is on the screen (`at`) and how high above it (game pixels), so none of
// them is a big painting held in memory (the old ones were, and her Dust's held the game up to paint).
//   GHOST WING: a see-through ghost of her wings, eyes and all, sweeping out over the floor before her, spreading as it goes,
//     its leading edge bright, scales streaming off its trailing edge.
//   ECLIPSE: a pale moon rising behind her, its halo round her; her shadow thrown out across the top toward him, growing, the
//     eyes of her wings opening in it and following him, its edge the enemy's pink (the warning); then the shadow strikes: black,
//     the eyes burning, darkness rising out of it, and gone upward in motes.
//   PHANTOMS: copies of her shimmering off her as she wraps her wings round herself; then three gliding moths of pale light,
//     see-through, wings beating slow, eyes burning, after-images behind, each down its lane.
//   THE HUSH: glowing scales falling like slow snow; settled, a faint haze of light where letters glow, go dark and crumble.
//   THE UNWRITING: pages tearing loose from the chapter and circling up; then a ring of pale pages, burning at their edges,
//     wheeling out over the whole top, embers off them.
// Her colours only: moonlight, bone, the Hush's grey-violet, and the enemy's pink and gold where she burns. Never cyan.

import { hash } from './kit';
import { FLAME } from './mkit';
import { ECLIPSE, PHANTOMS, PHANTOM_LANE, eclipseShape, eclipseSize, eclipseToWorld, flatBody, flatEye, flatRim, flatWings, inFlat, phantomAlong, phantomWay } from './moth2';
import type { FlatWing } from './moth2';

/** Where a spot of the floor (tiles) is on the screen, in game pixels. */
export type FloorAt = (x: number, y: number) => readonly [number, number];
/** A light given off (screen game pixels; how wide; how strong). */
export type Spot = (x: number, y: number, r: number, a: number) => void;

/** Her ghosts' light: from deepest to brightest, a cold grey-violet into the white of moonlight (never cyan). */
export const GHOST: readonly string[] = ['#1c1828', '#3a3450', '#6a6288', '#a29cc0', '#d6d2e8', '#f6f4fc'];
/** The moon: its seas and its face. */
export const MOON: readonly string[] = ['#8c8478', '#b8b0a2', '#ddd6c8', '#f2ede2', '#fffdf6'];
/** Her shadow, and what rises out of it. */
export const DARK: readonly string[] = ['#08070d', '#14111f', '#2a2438'];
/** The last chapter's pages: old paper, its ink. */
export const PAGE: readonly string[] = ['#6e675c', '#a39a8a', '#cfc6b4', '#ece6d8'];

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const easeOut = (v: number): number => 1 - (1 - clamp01(v)) ** 3;

function dot(g: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}
/** A shape on the screen filled, crisp, row by row (its points in game pixels; even-odd, so a ring is a ring). */
function fill(g: CanvasRenderingContext2D, rings: readonly (readonly (readonly [number, number])[])[], color: string, alpha: number): void {
  if (alpha <= 0.003) return;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const r of rings) for (const [, y] of r) {
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  if (!isFinite(y0)) return;
  const was = g.globalAlpha;
  g.globalAlpha = was * Math.min(1, alpha);
  g.fillStyle = color;
  const xs: number[] = [];
  for (let y = Math.ceil(y0 - 0.5) + 0.5; y <= y1; y += 1) {
    xs.length = 0;
    for (const r of rings) {
      for (let i = 0; i < r.length; i++) {
        const [ax, ay] = r[i];
        const [bx, by] = r[(i + 1) % r.length];
        if (ay > y !== by > y) xs.push(ax + ((y - ay) * (bx - ax)) / (by - ay));
      }
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const a = Math.round(xs[i]);
      const b = Math.round(xs[i + 1]);
      if (b > a) g.fillRect(a, Math.floor(y), b - a, 1);
    }
  }
  g.globalAlpha = was;
}
/** Shapes on the screen filled as one, each place once however many of them lie over it (so no seam darker where they overlap). */
function fillUnion(g: CanvasRenderingContext2D, shapes: readonly (readonly (readonly [number, number])[])[], color: string, alpha: number): void {
  if (alpha <= 0.003) return;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const r of shapes) for (const [, y] of r) {
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  if (!isFinite(y0)) return;
  const was = g.globalAlpha;
  g.globalAlpha = was * Math.min(1, alpha);
  g.fillStyle = color;
  const xs: number[] = [];
  const spans: [number, number][] = [];
  for (let y = Math.ceil(y0 - 0.5) + 0.5; y <= y1; y += 1) {
    spans.length = 0;
    for (const r of shapes) {
      xs.length = 0;
      for (let i = 0; i < r.length; i++) {
        const [ax, ay] = r[i];
        const [bx, by] = r[(i + 1) % r.length];
        if (ay > y !== by > y) xs.push(ax + ((y - ay) * (bx - ax)) / (by - ay));
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) spans.push([Math.round(xs[i]), Math.round(xs[i + 1])]);
    }
    spans.sort((a, b) => a[0] - b[0]);
    let s0 = -Infinity;
    let s1 = -Infinity;
    for (const [a, b] of spans) {
      if (a > s1) {
        if (s1 > s0) g.fillRect(s0, Math.floor(y), s1 - s0, 1);
        s0 = a;
        s1 = b;
      } else s1 = Math.max(s1, b);
    }
    if (s1 > s0) g.fillRect(s0, Math.floor(y), s1 - s0, 1);
  }
  g.globalAlpha = was;
}
/** Dots round a closed run of screen points, every `step` pixels, some left out (`gap`, by `seed`). */
function rim(g: CanvasRenderingContext2D, pts: readonly (readonly [number, number])[], color: string, alpha: number, step = 1.5, gap = 0, seed = 0, size = 1): void {
  if (alpha <= 0.003) return;
  const was = g.globalAlpha;
  g.globalAlpha = was * Math.min(1, alpha);
  let j = 0;
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % pts.length];
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / step));
    for (let s = 0; s < n; s++, j++) {
      if (gap > 0 && hash(j, seed, 7301) < gap) continue;
      dot(g, ax + ((bx - ax) * s) / n, ay + ((by - ay) * s) / n, color, size, size);
    }
  }
  g.globalAlpha = was;
}
/** An ellipse of the floor (a circle of radius `r` tiles about (x, y)) on the screen, `n` points, `h` game pixels above it. */
function floorCircle(at: FloorAt, x: number, y: number, r: number, h = 0, n = 24): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
    out.push([sx, sy - h]);
  }
  return out;
}

// =============================================================================================
// A FLAT WING OF HERS (her shadow, the ghost wing, the phantoms) on the screen

/** Where a point of a flat thing of hers is on the screen: (u, v) of its own, cast from (x, y) along (ax, ay), lifted `h` (and `lift(v)` more). */
type Lay = (u: number, v: number) => [number, number];
function layOf(at: FloorAt, x: number, y: number, ax: number, ay: number, h: number, beat = 0): Lay {
  return (u, v) => {
    // (a wing beating: its far parts lifted, and drawn in toward her as they rise)
    const vv = beat ? v * Math.cos(beat) : v;
    const up = beat ? Math.abs(v) * Math.sin(Math.abs(beat)) * 15 : 0;
    const [wx, wy] = eclipseToWorld(x, y, ax, ay, u, vv);
    const [sx, sy] = at(wx, wy);
    return [sx, sy - h - up];
  };
}
/** An eye of hers laid on a flat thing: its rings, its lids open `open` (0 shut to 1 wide; more, burning), looking toward (lx, ly) on the screen. */
function flatEyeDrawn(g: CanvasRenderingContext2D, lay: Lay, u: number, v: number, r: number, open: number, lx: number, ly: number, alpha: number, spot?: Spot): void {
  if (alpha <= 0.01 || open <= 0.02) return;
  const ring = (k: number, n = 18): [number, number][] => {
    const out: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      out.push(lay(u + Math.cos(a) * r * k, v + Math.sin(a) * r * k * 1.25));
    }
    return out;
  };
  const [cx, cy] = lay(u, v);
  // (the lids: only the part of the eye between them shows)
  const lid = (k: number): [number, number][] => ring(k).map(([x, y]) => [x, cy + (y - cy) * Math.min(1, open)] as [number, number]);
  const burning = open > 1;
  fill(g, [lid(1.15)], DARK[0], alpha * 0.9);
  fill(g, [lid(1.0)], burning ? MOON[3] : MOON[2], alpha);
  // (the iris and pupil, turned toward him)
  const dx = lx - cx;
  const dy = ly - cy;
  const d = Math.hypot(dx, dy) || 1;
  const [ex] = lay(u + r, v);
  const rs = Math.max(2, Math.abs(ex - cx));
  const ox = (dx / d) * rs * 0.3;
  const oy = (dy / d) * rs * 0.3 * Math.min(1, open);
  const iris = lid(0.62).map(([x, y]) => [x + ox, y + oy] as [number, number]);
  fill(g, [iris], burning ? FLAME[2] : FLAME[1], alpha);
  const pupil = lid(0.26).map(([x, y]) => [x + ox, y + oy] as [number, number]);
  fill(g, [pupil], burning ? FLAME[4] : '#0a0508', alpha);
  dot(g, cx + ox - rs * 0.25, cy + oy - rs * 0.25 * Math.min(1, open), MOON[4], 1, 1);
  if (spot) spot(cx, cy, rs * (burning ? 5 : 2.5), alpha * (burning ? 0.35 : 0.12));
}

// =============================================================================================
// GHOST WING (the buffet)

/** How far the ghost wing has gone out (tiles) `t` seconds after the blow, and how much of it is left. */
export const GHOST_WING = { reach: 0.65, long: 1.25, from: 1.2, to: 9 } as const;
export function ghostWingAt(t: number): { R: number; fade: number } {
  return { R: GHOST_WING.from + (GHOST_WING.to - GHOST_WING.from) * easeOut(t / GHOST_WING.reach), fade: 1 - sm((t - GHOST_WING.reach) / (GHOST_WING.long - GHOST_WING.reach)) };
}
/** Its wings at `R` tiles out: a pair of hers, flat, spreading as they go, filling the gust's cone. */
export function ghostWings(R: number): FlatWing[] {
  return flatWings(0.72 * R, 0.72 * R, 0.5 * R, 84, 120);
}
export function drawGhostWing(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, fx: number, fy: number, t: number, spot?: Spot): void {
  if (t < 0 || t > GHOST_WING.long) return;
  const { R, fade } = ghostWingAt(t);
  const h = 6 + 4 * Math.sin(t * 9);
  const lay = layOf(at, x, y, fx, fy, h);
  const wings = ghostWings(R);
  // (the wind under it: dashes running out across the cone)
  const was = g.globalAlpha;
  for (let i = 0; i < 26; i++) {
    const a = ((-70 + (140 * (i + 0.5)) / 26 + (hash(i, 1, 7311) - 0.5) * 4) * Math.PI) / 180;
    const s0 = ((t * 2.6 + hash(i, 2, 7311)) % 1) * R;
    if (s0 < 1 || hash(i, 3, 7311) > fade) continue;
    const s1 = Math.min(R, s0 + 0.6);
    const [ax, ay] = lay(Math.cos(a) * s0, Math.sin(a) * s0);
    const [bx, by] = lay(Math.cos(a) * s1, Math.sin(a) * s1);
    g.globalAlpha = was * 0.35 * fade;
    for (let k = 0; k <= 6; k++) dot(g, ax + ((bx - ax) * k) / 6, ay + ((by - ay) * k) / 6, GHOST[4]);
  }
  g.globalAlpha = was;
  for (const w of wings) {
    const pts = flatRim(w, 44).map(([u, v]) => lay(u, v));
    const rim40 = flatRim(w, 40);
    // (the sheet of it, see-through; its scales' bands a shade deeper)
    fill(g, [pts], GHOST[3], 0.26 * fade);
    const band = flatRim({ ...w, len: w.len * 0.7 }, 30).map(([u, v]) => lay(u, v));
    fill(g, [band], GHOST[4], 0.1 * fade);
    // (its veins out from its root)
    const [rx, ry] = lay(w.root[0], w.root[1]);
    const rimPts = flatRim(w, 12);
    for (let i = 2; i < rimPts.length - 1; i++) {
      const [ex, ey] = lay(rimPts[i][0], rimPts[i][1]);
      g.globalAlpha = was * 0.28 * fade;
      const n = Math.max(2, Math.round(Math.hypot(ex - rx, ey - ry) / 3));
      for (let k = 1; k < n; k++) dot(g, rx + ((ex - rx) * k) / n, ry + ((ey - ry) * k) / n, GHOST[4]);
    }
    g.globalAlpha = was;
    // (its edge: bright, broken toward its trailing side)
    rim(g, pts, GHOST[5], 0.8 * fade, 1.4, 0.15, w.hind ? 2 : 1);
    // (its eye)
    const e = flatEye(w);
    flatEyeDrawn(g, lay, e.u, e.v, e.r * 1.2, 0.75, rx, ry - 40, 0.75 * fade, spot);
    // (scales streaming off its trailing edge, left behind as it goes)
    for (let i = 0; i < 40; i++) {
      const q = rim40[Math.floor(hash(i, 4, 7312) * 40)];
      const lag = hash(i, 5, 7312) * 1.4;
      const [sx, sy] = lay(q[0] * (1 - lag / Math.max(2, R)), q[1] * (1 - lag / Math.max(2, R)));
      if (hash(i, 6, 7312) > fade) continue;
      g.globalAlpha = was * (0.4 + 0.5 * (1 - lag / 1.4)) * fade;
      dot(g, sx, sy - lag * 10, i % 5 === 0 ? FLAME[1] : GHOST[i % 2 ? 4 : 5]);
    }
    g.globalAlpha = was;
  }
  if (spot) {
    const [sx, sy] = lay(R * 0.7, 0);
    spot(sx, sy, 60 + R * 10, 0.18 * fade);
  }
}

// =============================================================================================
// ECLIPSE

/** How far up the moon is (0 down behind her, 1 risen) and how much of it is left, `t` seconds into her Eyes' move (on after the blow too). */
export function moonAt(t: number): number {
  const [m0, m1] = ECLIPSE.moon;
  return sm((t - m0) / (m1 - m0)) * (1 - sm((t - ECLIPSE.hit - 0.4) / (ECLIPSE.after - 0.4)));
}
/** THE MOON behind her: (sx, sy) where its middle is when it has risen (screen game pixels), `k` how far risen. */
export function drawMoon(g: CanvasRenderingContext2D, sx: number, sy: number, k: number, t: number, spot?: Spot): void {
  if (k <= 0.01) return;
  const r = 46;
  const cy = sy + (1 - k) * 70;
  const was = g.globalAlpha;
  // (its halo: rings of light thinning out, a slow shimmer in them)
  for (let ring = 0; ring < 7; ring++) {
    const rr = r + 10 + ring * 15;
    const n = Math.round(rr * 2.2);
    g.globalAlpha = was * k * (0.32 - ring * 0.04);
    for (let i = 0; i < n; i++) {
      if (hash(i, ring, 7321 + Math.floor(t * 6)) < 0.35 + ring * 0.08) continue;
      const a = (i / n) * Math.PI * 2;
      dot(g, sx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.96, ring < 2 ? MOON[4] : GHOST[ring < 4 ? 5 : 4]);
    }
  }
  // (its rays, faint, out across the sky)
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + 0.1;
    g.globalAlpha = was * k * 0.12;
    for (let s = r + 6; s < r + 150; s += 3) if (hash(i, s, 7322) > 0.3) dot(g, sx + Math.cos(a) * s, cy + Math.sin(a) * s, MOON[4]);
  }
  g.globalAlpha = was;
  // (its face: pale, its seas)
  const disc: [number, number][] = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    disc.push([sx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  fill(g, [disc], MOON[3], k);
  for (let i = 0; i < 9; i++) {
    const a = hash(i, 1, 7323) * Math.PI * 2;
    const d = Math.sqrt(hash(i, 2, 7323)) * r * 0.7;
    const rr = 5 + hash(i, 3, 7323) * 12;
    const sea: [number, number][] = [];
    for (let j = 0; j < 14; j++) {
      const b = (j / 14) * Math.PI * 2;
      const wob = 1 + 0.18 * Math.sin(b * 3 + i);
      sea.push([sx + Math.cos(a) * d + Math.cos(b) * rr * wob, cy + Math.sin(a) * d + Math.sin(b) * rr * wob * 0.9]);
    }
    fill(g, [sea], i % 3 ? MOON[2] : MOON[1], k * 0.8);
  }
  rim(g, disc, MOON[4], k, 1);
  g.globalAlpha = was;
  if (spot) {
    spot(sx, cy, 170, 0.32 * k);
    spot(sx, cy, 80, 0.3 * k);
  }
}
/** Her shadow's outline on the screen: its wings' and its body's, each a closed run (size `s` of its whole). */
function shadowShapes(lay: Lay, s: number): [number, number][][] {
  const S = eclipseShape(s);
  const out: [number, number][][] = S.wings.map((w) => flatRim(w, 40).map(([u, v]) => lay(u, v)));
  for (const b of S.body) {
    const ring: [number, number][] = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      ring.push(lay(b.u + Math.cos(a) * b.ru, b.v + Math.sin(a) * b.rv));
    }
    out.push(ring);
  }
  return out;
}
/** The outline of her whole shadow (each shape's edge where no other shape lies over it), dots on the screen, in order round each. */
function shadowEdge(S: ReturnType<typeof eclipseShape>, lay: Lay): [number, number][] {
  const inOther = (u: number, v: number, not: number): boolean => {
    for (let j = 0; j < S.wings.length; j++) if (j !== not && inFlat(S.wings[j], u, v) > 0.004) return true;
    for (let j = 0; j < S.body.length; j++) {
      const b = S.body[j];
      if (j + S.wings.length !== not && ((u - b.u) / b.ru) ** 2 + ((v - b.v) / b.rv) ** 2 < 0.97) return true;
    }
    return false;
  };
  const out: [number, number][] = [];
  const keep = (run: [number, number][], i: number): void => {
    for (let k = 0; k < run.length; k++) {
      const [au, av] = run[k];
      const [bu, bv] = run[(k + 1) % run.length];
      const n = Math.max(1, Math.round(Math.hypot(bu - au, bv - av) / 0.07));
      for (let s = 0; s < n; s++) {
        const u = au + ((bu - au) * s) / n;
        const v = av + ((bv - av) * s) / n;
        if (!inOther(u, v, i)) out.push(lay(u, v));
      }
    }
  };
  S.wings.forEach((w, i) => keep(flatRim(w, 40), i));
  S.body.forEach((b, j) => {
    const run: [number, number][] = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      run.push([b.u + Math.cos(a) * b.ru, b.v + Math.sin(a) * b.rv]);
    }
    keep(run, S.wings.length + j);
  });
  return out;
}
/** The enemy's pink warning on a run of dots already spaced: dashed, marching, brightening as the blow comes. */
function warnDots(g: CanvasRenderingContext2D, pts: readonly (readonly [number, number])[], k: number, t: number): void {
  const was = g.globalAlpha;
  g.globalAlpha = was * (0.45 + 0.55 * k);
  for (let j = 0; j < pts.length; j++) {
    if ((Math.floor(j / 4 - t * 9) & 1) === 0) continue;
    dot(g, pts[j][0], pts[j][1], k > 0.75 ? FLAME[3] : FLAME[2], 2, 1);
  }
  g.globalAlpha = was;
}
/**
 * HER SHADOW, cast from (x, y) along (ax, ay), `t` seconds into her Eyes' move (on after the blow too: t > ECLIPSE.hit), (hx, hy)
 * on the screen where he is (her eyes in it follow him), `clock` the screen's.
 */
export function drawEclipse(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, ax: number, ay: number, t: number, hx: number, hy: number, clock: number, spot?: Spot): void {
  const after = t - ECLIPSE.hit;
  if (t < ECLIPSE.grow[0] || after > ECLIPSE.after) return;
  const s = eclipseSize(t);
  const lay = layOf(at, x, y, ax, ay, 0);
  const shapes = shadowShapes(lay, s);
  // (darkening as it grows; black as it strikes; gone up out of it after)
  const gone = sm((after - 0.45) / (ECLIPSE.after - 0.45));
  const dark = after < 0 ? 0.25 + 0.5 * sm((t - ECLIPSE.grow[0]) / 0.9) : 0.92 * (1 - gone);
  fillUnion(g, shapes, DARK[0], dark);
  // (its edge, the outline of the whole of it: the moonlight round it, and the warning on it till the blow)
  const S = eclipseShape(s);
  if (after < 0) {
    const edge = shadowEdge(S, lay);
    rim(g, edge, GHOST[4], 0.25, 1, 0.5, 9);
    if (t >= ECLIPSE.warn) warnDots(g, edge, clamp01((t - ECLIPSE.warn) / (ECLIPSE.hit - ECLIPSE.warn)), clock);
  }
  // (darkness rising out of it as it waits: thin wisps; as it strikes, a whole wall of them, then motes going up)
  const rims = S.wings.map((w) => flatRim(w, 30));
  const was = g.globalAlpha;
  const n = after < 0 ? Math.round(30 + 40 * sm((t - 0.5) / 0.6)) : 170;
  for (let i = 0; i < n; i++) {
    const w = S.wings[i % 4];
    const q = rims[i % 4][Math.floor(hash(i, 1, 7331) * 30)];
    const into = hash(i, 2, 7331) * 0.8;
    const u = w.root[0] + (q[0] - w.root[0]) * into;
    const v = w.root[1] + (q[1] - w.root[1]) * into;
    const [sx, sy] = lay(u, v);
    if (after < 0) {
      const life = (clock * 0.7 + hash(i, 3, 7331)) % 1;
      g.globalAlpha = was * 0.5 * (1 - life) * dark;
      for (let k = 0; k < 4; k++) dot(g, sx, sy - life * 34 - k, DARK[2]);
    } else {
      // (a wall of darkness thrown up out of it: plumes, dark at their feet, the Hush's grey-violet at their tops, curling)
      const life = clamp01(after / (0.45 + 0.55 * hash(i, 4, 7331)));
      const tall = (16 + 46 * hash(i, 5, 7331)) * (0.35 + 0.65 * easeOut(life / 0.4)) * (1 - 0.4 * life);
      const lift = easeOut(life) * 26;
      const curl = Math.sin(after * 5 + i) * 4 * life;
      const gone = 1 - sm((life - 0.45) / 0.55);
      for (let k = 0; k < tall; k += 1) {
        const f = k / tall;
        // (thinning as it rises: fewer of its grains, and curling)
        if (hash(i, k, 7332) < f * 0.75) continue;
        g.globalAlpha = was * gone * (0.95 - 0.55 * f);
        dot(g, sx + curl * f + Math.sin(f * 7 + i + after * 3) * 2.5 * f, sy - lift - k, f < 0.4 ? DARK[0] : f < 0.75 ? DARK[2] : GHOST[2], f < 0.3 ? 2 : 1, 1);
      }
      if (i % 3 === 0 && life > 0.25) {
        g.globalAlpha = was * (1 - life);
        dot(g, sx + Math.sin(after * 4 + i) * 7, sy - lift - tall - 6 - life * 30, i % 2 ? GHOST[5] : MOON[4]);
      }
    }
  }
  g.globalAlpha = was;
  // (the eyes of her wings in it: opening as it waits, following him; burning as it strikes, then shutting)
  const open = after < 0 ? sm((t - 0.45) / 0.55) : after < 0.35 ? 1.3 : 1.3 * (1 - sm((after - 0.35) / 0.35));
  for (const w of S.wings) {
    const e = flatEye(w);
    flatEyeDrawn(g, lay, e.u, e.v, e.r * 1.45, open, hx, hy, after < 0 ? 0.95 : 1 - gone, spot);
  }
  if (spot && after >= 0 && after < 0.3) {
    const [sx, sy] = lay(ECLIPSE.thorax, 0);
    spot(sx, sy, 160, 0.4 * (1 - after / 0.3));
  }
}

// =============================================================================================
// PHANTOMS

/** A phantom of her: gliding moth of pale light, (x, y) where its thorax is over the floor, along (ax, ay), `h` up, its wings at `beat`. */
function drawPhantom(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, ax: number, ay: number, h: number, beat: number, alpha: number, seed: number, solid: boolean, spot?: Spot): void {
  if (alpha <= 0.01) return;
  const lay = layOf(at, x, y, ax, ay, h, beat);
  const wings = flatWings(0, PHANTOMS.fore, PHANTOMS.hind, 82, 124);
  for (const w of wings) {
    const pts = flatRim(w, 36).map(([u, v]) => lay(u, v));
    if (solid) {
      fill(g, [pts], GHOST[3], 0.3 * alpha);
      const band = flatRim({ ...w, len: w.len * 0.62 }, 24).map(([u, v]) => lay(u, v));
      fill(g, [band], GHOST[4], 0.16 * alpha);
    }
    rim(g, pts, GHOST[5], (solid ? 0.85 : 0.5) * alpha, 1.3, solid ? 0.1 : 0.45, seed + (w.hind ? 2 : 1));
    if (solid) {
      const e = flatEye(w);
      const [ex, ey] = lay(e.u, e.v);
      dot(g, ex - 1, ey - 1, FLAME[2], 2, 2);
      dot(g, ex, ey, FLAME[4], 1, 1);
      if (spot) spot(ex, ey, 14, 0.25 * alpha);
    }
  }
  if (solid) {
    for (const b of flatBody(0, 0.45)) {
      const ring: [number, number][] = [];
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        ring.push(lay(b.u + Math.cos(a) * b.ru, b.v + Math.sin(a) * b.rv));
      }
      fill(g, [ring], GHOST[4], 0.5 * alpha);
    }
    if (spot) {
      const [sx, sy] = lay(0, 0);
      spot(sx, sy, 50, 0.22 * alpha);
    }
  }
}
/** Copies of her shimmering off her as she wraps her wings round herself (`k`: how far they have come), (sx, sy) her middle on the screen. */
export function drawPhantomsGather(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, ax: number, ay: number, k: number, high: number, clock: number): void {
  if (k <= 0.01) return;
  for (let i = 0; i < PHANTOMS.n; i++) {
    const [wx, wy] = phantomWay(ax, ay, i);
    // (each drawn a little out of her toward its own lane, flickering)
    const out = 0.3 + 0.6 * k + 0.15 * Math.sin(clock * 7 + i * 2);
    const flick = hash(i, Math.floor(clock * 14), 7341) < 0.2 ? 0.4 : 1;
    drawPhantom(g, at, x + wx * out, y + wy * out, wx, wy, high + 10 * Math.sin(clock * 3 + i), 0.5 * Math.sin(clock * 5 + i), 0.85 * k * flick, 40 + i, k > 0.55);
  }
}
/** THE PHANTOMS `t` seconds after her Swarm's burst, from (x, y) aimed at (ax, ay). */
export function drawPhantoms(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, ax: number, ay: number, t: number, spot?: Spot): void {
  for (let i = 0; i < PHANTOMS.n; i++) {
    const s = phantomAlong(i, t);
    const [wx, wy] = phantomWay(ax, ay, i);
    const end = (s - PHANTOMS.long) / (0.3 * PHANTOMS.speed);
    if (s < 0 || end > 1) continue;
    const alpha = (1 - clamp01(end)) * sm((s - PHANTOMS.start + 0.3) / 1.2 + 0.4);
    const beat = 0.55 * Math.sin(t * 8 + i * 1.7);
    const h = PHANTOMS.high + 8 * Math.sin(t * 4 + i) - 6 * Math.cos(t * 8 + i * 1.7);
    // (its after-images, behind it, thinning)
    for (let j = 3; j >= 1; j--) {
      const sj = s - j * 0.75;
      if (sj < PHANTOMS.start) continue;
      drawPhantom(g, at, x + wx * sj, y + wy * sj, wx, wy, h, 0.55 * Math.sin((t - j * 0.07) * 8 + i * 1.7), alpha * (0.4 - j * 0.11), 60 + i * 5 + j, false);
    }
    // (scales falling off it as it goes, settling)
    const was = g.globalAlpha;
    for (let k = 0; k < 24; k++) {
      const back = hash(k, i, 7342) * 3.5;
      const sk = s - back;
      if (sk < PHANTOMS.start) continue;
      const fall = back / 3.5;
      const side = (hash(k, i + 9, 7342) - 0.5) * 2.4;
      const [px, py] = at(x + wx * sk - wy * side, y + wy * sk + wx * side);
      g.globalAlpha = was * alpha * (1 - fall) * 0.8;
      dot(g, px, py - h * (1 - fall), k % 6 === 0 ? FLAME[1] : GHOST[k % 2 ? 4 : 5]);
    }
    g.globalAlpha = was;
    drawPhantom(g, at, x + wx * s, y + wy * s, wx, wy, h, beat, alpha, 50 + i, true, spot);
  }
}
/** Where each phantom's lane lies (for the warnings): its start, its way, its length, its half width; whether it has set off yet. */
export function phantomLanes(ax: number, ay: number): { way: [number, number]; from: number; to: number; half: number; i: number }[] {
  return PHANTOM_LANE.map((_, i) => ({ way: phantomWay(ax, ay, i), from: PHANTOMS.start, to: PHANTOMS.long, half: PHANTOMS.half, i }));
}

// =============================================================================================
// THE HUSH (her Dust; and what she sheds over him)

/** How long a fall of her Hush lasts: its scales falling, lying, fading (the old cloud's: art/moth_fx.ts CLOUD_FX). */
export const HUSH_FX = { fall: 1.4, hold: 4.0, fade: 1.2 } as const;
/** A tiny hand of letters (three across, five down), for the words going dark in the Hush. */
const LETTERS: readonly string[] = ['111101111101101', '110101110101110', '111100100100111', '111100110100111', '101101111101101', '010010010010010', '100100100100111', '101111111101101', '111101101101111', '111101111100100', '011100010001110', '111010010010010', '101101101101111', '101101101111101'];
/** Its haze and its letters, on the floor about (x, y), `R` tiles across its middle, `t` seconds after it was shaken off. */
export function drawHushGround(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, R: number, t: number, clock: number, spot?: Spot): void {
  const end = HUSH_FX.fall + HUSH_FX.hold + HUSH_FX.fade;
  if (t < 0 || t > end) return;
  const thin = sm((t - HUSH_FX.fall - HUSH_FX.hold) / HUSH_FX.fade);
  const haze = sm((t - 0.35) / (HUSH_FX.fall - 0.2)) * (1 - thin);
  if (haze <= 0.01) return;
  const ragged: [number, number][] = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const rr = R * (1 + 0.07 * Math.sin(a * 5 + 1) + 0.05 * Math.sin(a * 11 + clock * 0.4));
    ragged.push([...at(x + Math.cos(a) * rr, y + Math.sin(a) * rr)] as [number, number]);
  }
  fill(g, [ragged], GHOST[2], 0.26 * haze);
  fill(g, [floorCircle(at, x, y, R * 0.62, 0, 28)], GHOST[3], 0.14 * haze);
  // (its edge: a slow ring of light going round)
  const was = g.globalAlpha;
  for (let i = 0; i < ragged.length; i++) {
    const [ax, ay] = ragged[i];
    const [bx, by] = ragged[(i + 1) % ragged.length];
    for (let k = 0; k < 4; k++) {
      if (hash(i * 4 + k, Math.floor(clock * 3 + i * 0.2), 7351) < 0.45) continue;
      g.globalAlpha = was * 0.5 * haze;
      dot(g, ax + ((bx - ax) * k) / 4, ay + ((by - ay) * k) / 4, GHOST[5]);
    }
  }
  // (letters in it, his words: glowing, going dark, crumbling away)
  for (let i = 0; i < 16; i++) {
    const period = 1.7 + 0.6 * hash(i, 1, 7352);
    const life = ((clock + hash(i, 2, 7352) * period) / period) % 1;
    const cycle = Math.floor((clock + hash(i, 2, 7352) * period) / period);
    const a = hash(i, cycle, 7353) * Math.PI * 2;
    const d = Math.sqrt(hash(i, cycle, 7354)) * R * 0.8;
    const [lx, ly] = at(x + Math.cos(a) * d, y + Math.sin(a) * d);
    const glyph = LETTERS[Math.floor(hash(i, cycle, 7355) * LETTERS.length)];
    const col = life < 0.35 ? GHOST[5] : life < 0.6 ? GHOST[3] : DARK[1];
    for (let j = 0; j < 15; j++) {
      if (glyph[j] !== '1') continue;
      // (crumbling: its pieces gone one by one, falling)
      if (life > 0.7 && hash(i * 15 + j, cycle, 7356) < (life - 0.7) / 0.3) continue;
      g.globalAlpha = was * haze * (life < 0.1 ? life / 0.1 : 1) * 0.9;
      dot(g, lx - 3 + (j % 3) * 2, ly - 5 + Math.floor(j / 3) * 2 + (life > 0.7 ? (life - 0.7) * 6 : 0), col, 2, 2);
    }
    if (spot && life < 0.35) spot(lx, ly, 12, 0.1 * haze);
  }
  // (light lifting off it)
  for (let i = 0; i < 36; i++) {
    const a = hash(i, 1, 7357) * Math.PI * 2;
    const d = Math.sqrt(hash(i, 2, 7357)) * R * 0.95;
    const [mx, my] = at(x + Math.cos(a) * d, y + Math.sin(a) * d);
    const life = (clock * (0.35 + 0.3 * hash(i, 3, 7357)) + hash(i, 4, 7357)) % 1;
    g.globalAlpha = was * haze * (1 - life) * 0.8;
    dot(g, mx + Math.sin(life * 6 + i) * 2, my - life * 40, i % 7 === 0 ? FLAME[1] : GHOST[5]);
  }
  g.globalAlpha = was;
  if (spot) {
    const [cx, cy] = at(x, y);
    spot(cx, cy, R * 22, 0.14 * haze);
  }
}
/** Its scales falling like slow snow over (x, y), `R` tiles about it, `t` seconds after it was shaken off. */
export function drawHushSnow(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, R: number, t: number, spot?: Spot): void {
  const end = HUSH_FX.fall + HUSH_FX.hold + HUSH_FX.fade;
  if (t < -0.2 || t > end) return;
  const thin = sm((t - HUSH_FX.fall - HUSH_FX.hold) / HUSH_FX.fade);
  const was = g.globalAlpha;
  const N = 320;
  for (let i = 0; i < N; i++) {
    const a = hash(i, 1, 7361) * Math.PI * 2;
    const d = Math.sqrt(hash(i, 2, 7361)) * R * 0.97;
    const delay = 0.5 * hash(i, 3, 7361);
    const fall = 0.9 + 0.6 * hash(i, 4, 7361);
    const k = (t - delay) / fall;
    if (k < 0 || k > 1.2) continue;
    const z0 = 110 + 130 * hash(i, 5, 7361);
    const z = z0 * (1 - clamp01(k)) ** 1.6;
    const sway = 7 * Math.sin(t * (3 + 2 * hash(i, 6, 7361)) + i) * (1 - clamp01(k));
    const [px, py] = at(x + Math.cos(a) * d, y + Math.sin(a) * d);
    // (twinkling as it turns; settled, a last glint)
    if (hash(i, Math.floor(t * 12), 7362) < 0.18) continue;
    const c = hash(i, 7, 7361);
    const col = c < 0.05 ? FLAME[1] : c < 0.15 ? MOON[4] : c < 0.45 ? GHOST[4] : GHOST[5];
    g.globalAlpha = was * (k > 1 ? (1.2 - k) / 0.2 : 0.95);
    dot(g, px + sway, py - z, col, 1, k < 0.6 && hash(i, 8, 7361) < 0.3 ? 2 : 1);
  }
  // (and lingering, a few still drifting down through the haze)
  for (let i = 0; i < 40; i++) {
    if (t < HUSH_FX.fall) break;
    const a = hash(i, 9, 7361) * Math.PI * 2;
    const d = Math.sqrt(hash(i, 10, 7361)) * R * 0.9;
    const life = (t * 0.28 + hash(i, 11, 7361)) % 1;
    const [px, py] = at(x + Math.cos(a) * d, y + Math.sin(a) * d);
    g.globalAlpha = was * (1 - thin) * 0.75 * Math.sin(Math.PI * life);
    dot(g, px + 5 * Math.sin(t * 2 + i), py - 70 * (1 - life), i % 3 ? GHOST[5] : GHOST[4]);
  }
  g.globalAlpha = was;
  if (spot && t < HUSH_FX.fall + 0.5) {
    const [cx, cy] = at(x, y);
    spot(cx, cy - 60, R * 20, 0.12);
  }
}

// =============================================================================================
// THE UNWRITING (on the book)

/** Pages tearing loose from the chapter as she rears (`k`: 0 to 1 through her wind-up), about (bx, by), the book on the floor. */
export function drawPagesLoosing(g: CanvasRenderingContext2D, at: FloorAt, bx: number, by: number, k: number, clock: number, spot?: Spot): void {
  if (k <= 0.01) return;
  for (let i = 0; i < 12; i++) {
    const own = clamp01(k * 1.4 - hash(i, 1, 7371) * 0.4);
    if (own <= 0) continue;
    const a = hash(i, 2, 7371) * Math.PI * 2 + clock * (1.6 + hash(i, 3, 7371));
    const r = 0.3 + 1.6 * own;
    const h = 4 + 46 * own + 6 * Math.sin(clock * 5 + i);
    page(g, at, bx + Math.cos(a) * r, by + Math.sin(a) * r, h, a + clock * 3, clock * (4 + 3 * hash(i, 4, 7371)) + i, own, own > 0.6 ? (own - 0.6) / 0.4 : 0, i, spot);
  }
}
/** A page of the chapter at (x, y), `h` up, turned to `turn` about the floor and flipping (`flip`), `burn` its edge alight (0 to 1). */
function page(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, h: number, turn: number, flip: number, alpha: number, burn: number, seed: number, spot?: Spot): void {
  const w = 0.27 * Math.max(0.15, Math.abs(Math.cos(flip)));
  const l = 0.36;
  const ca = Math.cos(turn);
  const sa = Math.sin(turn);
  const P = (a: number, b: number): [number, number] => {
    const [sx, sy] = at(x + ca * a - sa * b, y + sa * a + ca * b);
    // (a page flipping stands up off the floor as it turns)
    return [sx, sy - h - Math.sin(flip) * b * 30];
  };
  const q = [P(-l, -w), P(l, -w), P(l, w), P(-l, w)];
  fill(g, [q], Math.cos(flip) > 0 ? PAGE[3] : PAGE[2], 0.85 * alpha);
  // (its lines of writing, faded)
  const was = g.globalAlpha;
  for (let r = 0; r < 3; r++) {
    const [ax, ay] = P(-l * 0.7, -w * 0.6 + r * w * 0.6);
    const [bx, by] = P(l * (0.3 + 0.4 * hash(seed, r, 7372)), -w * 0.6 + r * w * 0.6);
    g.globalAlpha = was * 0.6 * alpha;
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay)));
    for (let s = 0; s < n; s += 1) if (hash(s, r + seed, 7373) > 0.3) dot(g, ax + ((bx - ax) * s) / n, ay + ((by - ay) * s) / n, PAGE[1]);
  }
  g.globalAlpha = was;
  rim(g, q, GHOST[5], 0.7 * alpha, 1, 0.2, seed);
  if (burn > 0) {
    // (its far edge burning: the enemy's pink and gold, embers off it)
    const [ax, ay] = q[1];
    const [bx, by] = q[2];
    g.globalAlpha = was * alpha;
    for (let s = 0; s <= 6; s++) dot(g, ax + ((bx - ax) * s) / 6, ay + ((by - ay) * s) / 6, s % 2 ? FLAME[2] : FLAME[3]);
    for (let e = 0; e < 4; e++) {
      const life = (flip * 0.3 + hash(seed, e, 7374)) % 1;
      g.globalAlpha = was * alpha * burn * (1 - life);
      dot(g, bx + Math.sin(life * 9 + e) * 3, by - life * 16, e % 2 ? FLAME[3] : FLAME[2]);
    }
    g.globalAlpha = was;
    if (spot) spot(bx, by, 16, 0.2 * alpha * burn);
  }
}
/** THE RING OF PAGES `t` seconds after she beats down, `R` tiles out from (x, y) (its band, where it strikes, `wide` either side of R). */
export function drawUnwritingGround(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, R: number, wide: number, fade: number): void {
  if (fade <= 0.01) return;
  const outer = floorCircle(at, x, y, R + wide * 0.4, 0, 48);
  const inner = floorCircle(at, x, y, Math.max(0.2, R - wide), 0, 48);
  fill(g, [outer, inner], GHOST[2], 0.2 * fade);
  rim(g, outer, GHOST[5], 0.6 * fade, 1.5, 0.3, 11);
}
export function drawUnwritingPages(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, R: number, t: number, fade: number, spot?: Spot): void {
  if (fade <= 0.01) return;
  const N = 56;
  for (let i = 0; i < N; i++) {
    const a = ((i + hash(i, 1, 7381) * 0.6) / N) * Math.PI * 2 + t * 0.9;
    const r = R + (hash(i, 2, 7381) - 0.65) * 1.1;
    const h = 8 + 28 * hash(i, 3, 7381) + 10 * Math.sin(t * 7 + i);
    const burn = clamp01(t / 0.9 + hash(i, 4, 7381) * 0.4);
    page(g, at, x + Math.cos(a) * r, y + Math.sin(a) * r, h, a + Math.PI / 2, t * (6 + 4 * hash(i, 5, 7381)) + i, fade * (1 - 0.5 * burn * sm((t - 0.6) / 0.6)), burn, i, i % 4 === 0 ? spot : undefined);
  }
  // (embers and ash off the ring, rising)
  const was = g.globalAlpha;
  for (let i = 0; i < 70; i++) {
    const a = hash(i, 6, 7381) * Math.PI * 2;
    const back = hash(i, 7, 7381) * 1.4;
    const [ex, ey] = at(x + Math.cos(a) * Math.max(0, R - back), y + Math.sin(a) * Math.max(0, R - back));
    g.globalAlpha = was * fade * (1 - back / 1.4);
    dot(g, ex, ey - 10 - back * 22, i % 3 === 0 ? FLAME[2] : i % 3 === 1 ? FLAME[3] : GHOST[5]);
  }
  g.globalAlpha = was;
}

// =============================================================================================
// HER DEATH: the light she comes apart into, over what her own pictures paint (art/moth_moves.ts)

/** Lights as she comes apart (`k`: how far she has crumbled), about (sx, sy) on the screen, her middle. */
export function deathLights(sx: number, sy: number, k: number, clock: number, spot: Spot): void {
  if (k <= 0 || k >= 1) return;
  for (let i = 0; i < 5; i++) {
    const a = hash(i, 1, 7391) * Math.PI * 2 + clock * 0.3;
    const d = 30 + 90 * hash(i, 2, 7391);
    spot(sx + Math.cos(a) * d, sy - 60 - k * 80 * hash(i, 3, 7391) + Math.sin(a) * d * 0.5, 70, 0.22 * Math.sin(Math.PI * k));
  }
}
void ECLIPSE;
