// THE NEW MONSTERS' WARNINGS ON THE FLOOR: A MOCK-UP (the art chat, 9 Oct 2026). NOT IN THE GAME.
//
// His words, 9 Oct, 07:44: "When you get to attacks, I’d like to see something other than a big
// red circle on the ground." Today a monster's ground attack is warned of by a red circle that
// fills (render/render.ts, the 'warn' zone). These are the three new monsters' own warnings
// (art/new_mobs3.ts), each in a shape of its own. Each shows WHERE its blow will land from the
// first moment of the wind-up (faint), and WHEN, by how it lights up; then the blow's own mark
// where it landed, for a moment, fading.
//   THE SHADE: three claw marks on the floor before it, faint; they light one after another
//     (three, two, one) and beat; its claws come through: the marks flash white-gold and are left
//     as torn gouges that fade.
//   THE BONEWARD: a lane from its shield out to its spear's reach, marked with the dashes and
//     diamonds of its rune and a spear-head at the end, faint; they light one after another from
//     it outward, and the spear-head last; the thrust runs down the lane in a white-gold streak.
//   THE OSSUARY GOLEM: where the club will come down, the floor cracks: faint hairlines first, out
//     to the edge of what it will hit; the cracks open along them from the middle outward, glowing
//     hotter, pink to gold; grit hops on the floor and dust rises; the club lands: the cracks
//     blaze, stone is thrown up, dust bursts out; they cool, and fade.
// In the enemy's colours, pink burning to gold (`FLAME`), with the floor's own stone and dust;
// nothing cyan. Drawn in the game's own pixels, on the floor under the figures, as the floor's
// effects are (render/fx.ts: its cracks): `drawWarning`, given where a point of the floor is on
// the screen. Nothing of the game draws them yet: that is the main chat's, with his yes.

import { drawGlow } from '../engine/px';
import { hash } from './kit';
import { FLAME } from './mkit';
import { P } from './palette';

export type WarnId = 'shade' | 'boneward' | 'golem';

/** One monster's warning, at one moment. */
export interface Warn {
  id: WarnId;
  /** The monster's floor point (tiles), and the way it faces, toward what it strikes at (a unit vector on the floor). */
  x: number;
  y: number;
  fx: number;
  fy: number;
  /** Seconds since its wind-up began. The blow lands at `windup`; after it, the blow's mark. */
  t: number;
  windup: number;
  /** How far ahead the blow reaches (tiles; for the Golem, where its club comes down), and for the Golem how far round that what it hits goes (tiles). The painted ones (`WARN`) if left out. */
  reach?: number;
  r?: number;
  /** Its own number: its cracks are its own, and keep still from frame to frame. */
  seed?: number;
}

/** Where a point of the floor (tiles) is on the screen, in the game's pixels. */
export type FloorAt = (x: number, y: number) => readonly [number, number];
/** A soft light (engine/px.ts `drawGlow`): at (x, y), `r` across, in the game's pixels. */
export type Glow = (g: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, a: number) => void;

/**
 * Each one's warning as painted, where its blow lands in its pictures (the rules may give it
 * other numbers): how far ahead its blow reaches (tiles: for the Golem, where its club comes
 * down); how far its line is to the side of its hand that strikes (tiles; + its right hand, as the
 * game shows it, mirrored or not); how far to either side of that line it strikes, or for the Golem
 * how far round where its club lands (tiles); and how long the blow's mark stays once it lands
 * (seconds). (In their pictures, at the blow: the Shade's claws come down about 0.6 tiles ahead, a
 * fifth of a tile to either side; the Boneward's spear-head is about 1.15 tiles ahead, a fifth of a
 * tile to its right; the Golem's club comes down about 0.8 tiles ahead, a sixth of a tile to its
 * left: tests/mob_warnings.test.ts holds each inside its warning.)
 */
export const WARN: Readonly<Record<WarnId, { reach: number; side: number; r: number; mark: number }>> = {
  shade: { reach: 1.05, side: 0, r: 0.36, mark: 0.5 },
  boneward: { reach: 1.6, side: 0.2, r: 0.2, mark: 0.45 },
  golem: { reach: 0.8, side: -0.16, r: 1.4, mark: 1.4 },
};

/** Is it showing at this moment (the warning, or the blow's mark after it)? */
export function warnShowing(w: Warn): boolean {
  return w.t >= 0 && w.t < w.windup + WARN[w.id].mark;
}

const [F0, F1, F2, F3, F4] = FLAME;
const INK = P.ink;
/** The floor's own stone (grit and rubble) and its dust. */
const GRIT: readonly string[] = [P.st5, P.st6, P.st7];
const DUST = P.st7;
/** A crack gone cold: the floor's darkest stone. */
const COLD = P.st2;
/** Every colour a warning is drawn in (the tests hold it to these). */
export const WARN_COLOURS: readonly string[] = [F0, F1, F2, F3, F4, INK, COLD, ...GRIT, DUST];

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const easeOut = (u: number): number => 1 - (1 - u) * (1 - u);

/** THE WARNING (or the blow's mark) of one of the new monsters, at its moment, on the floor. */
export function drawWarning(g: CanvasRenderingContext2D, w: Warn, at: FloorAt, glow: Glow = drawGlow): void {
  if (!warnShowing(w)) return;
  const alpha = g.globalAlpha;
  if (w.id === 'shade') shadeWarn(g, w, at, glow);
  else if (w.id === 'boneward') bonewardWarn(g, w, at, glow);
  else golemWarn(g, w, at, glow);
  g.globalAlpha = alpha;
}

// ---------------------------------------------------------------------------------------------
// The pixels

/**
 * Where a point is: `a` tiles ahead of the monster, along the way it faces, and `c` across, to the
 * side its right hand is on as the game shows it (render.ts shows a monster facing to the left of
 * the screen mirrored, so its right hand is then on the other side).
 */
function ahead(w: Warn, at: FloorAt): (a: number, c: number) => readonly [number, number] {
  const m = w.fx - w.fy < 0 ? -1 : 1;
  return (a, c) => at(w.x + w.fx * a - w.fy * c * m, w.y + w.fy * a + w.fx * c * m);
}

function dot(g: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), 1, 1);
}

/** A line of the game's pixels (as render/fx.ts `pline`); `every`: only one pixel in that many (a dotted line). */
function line(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, every = 1): void {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  g.fillStyle = color;
  for (let n = 0; n < 400; n++) {
    if (n % every === 0) g.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

type Pt = readonly [number, number];

/** A run of points, drawn from its start as far as `upto` of its length (0 to 1), shifted down by `dy`. */
function polyline(g: CanvasRenderingContext2D, pts: ReadonlyArray<Pt>, color: string, upto = 1, dy = 0, every = 1, from = 0): void {
  const n = pts.length - 1;
  const end = upto * n;
  for (let i = Math.floor(from * n); i < n && i < end; i++) {
    const [x0, y0] = pts[i];
    let [x1, y1] = pts[i + 1];
    if (i + 1 > end) {
      const u = end - i;
      x1 = x0 + (x1 - x0) * u;
      y1 = y0 + (y1 - y0) * u;
    }
    line(g, x0, y0 + dy, x1, y1 + dy, color, every);
  }
}

/** A puff of dust: a little lozenge of the floor's dust, `size` across each way from its middle, thinner at its edge. */
function puff(g: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number): void {
  if (alpha <= 0.01) return;
  const X = Math.round(x);
  const Y = Math.round(y);
  const rows = Math.max(1, Math.round(size / 2));
  g.fillStyle = DUST;
  for (let row = -rows; row <= rows; row++) {
    const half = Math.max(0, Math.round(size * (1 - Math.abs(row) / (rows + 1))));
    for (let i = -half; i <= half; i++) {
      const edge = Math.abs(i) >= half || Math.abs(row) === rows;
      if (edge && (i + row) % 2 !== 0) continue;
      g.globalAlpha = alpha * (edge ? 0.6 : 1);
      g.fillRect(X + i, Y + row, 1, 1);
    }
  }
  g.globalAlpha = 1;
}

// ---------------------------------------------------------------------------------------------
// THE SHADE: three claw marks

/** When each of its three marks lights, in parts of its wind-up: one after another. */
const CLAW_LIGHTS = [0.06, 0.3, 0.54];

function shadeWarn(g: CanvasRenderingContext2D, w: Warn, at: FloorAt, glow: Glow): void {
  const W = Math.max(0.05, w.windup);
  const t = w.t;
  const k = t / W;
  const since = t - W;
  const reach = w.reach ?? WARN.shade.reach;
  const half = w.r ?? WARN.shade.r;
  const P3 = ahead(w, at);
  const frame = Math.floor(t * 30);
  // each mark a stroke raked a little on the slant and bowed, the middle one the longest
  const marks = [-1, 0, 1].map((s) => {
    const a0 = 0.25 + 0.06 * Math.abs(s);
    const a1 = reach - 0.1 * Math.abs(s);
    const pts: Pt[] = [];
    for (let i = 0; i <= 10; i++) {
      const u = i / 10;
      pts.push(P3(a0 + (a1 - a0) * u, s * half * 0.92 + 0.08 * (0.5 - u) + 0.05 * Math.sin(u * Math.PI)));
    }
    return pts;
  });
  const middle = (pts: ReadonlyArray<Pt>): Pt => pts[5];
  if (since < 0) {
    const beat = k > 0.8;
    marks.forEach((pts, i) => {
      const lit = (t - CLAW_LIGHTS[i] * W) / 0.045;
      if (lit <= 0) {
        // faint, waiting its turn: where it will be
        g.globalAlpha = 0.9;
        polyline(g, pts, F0, 1, 0, 2);
        g.globalAlpha = 1;
        return;
      }
      const col = beat ? (frame % 4 < 2 ? F3 : F2) : F2;
      // torn open from its near end in an instant, the tear's leading edge white-hot
      const upto = Math.min(1, lit);
      polyline(g, pts, F0, upto, 1);
      polyline(g, pts, col, upto);
      if (upto < 1) {
        const [x, y] = pts[Math.min(10, Math.round(upto * 10))];
        dot(g, x, y, F4);
      } else if (lit < 2.2) {
        // (just lit: a white-gold glint along it)
        polyline(g, pts.slice(2, 9), F4, 1, 0, 3);
      }
      const [mx, my] = middle(pts);
      glow(g, mx, my, 5, F2, beat ? 0.3 : 0.18);
      // pink motes rising off it
      for (let m = 0; m < 2; m++) {
        const life = 0.3;
        const ph = (t + hash(i, m, 31) * life) / life;
        const u = hash(i, m * 7 + Math.floor(ph), 32);
        const [px, py] = pts[Math.min(10, Math.round(2 + u * 6))];
        const rise = (ph % 1) * 6;
        dot(g, px + (hash(i, Math.floor(ph), 33) < 0.5 ? 0 : 1), py - 1 - rise, ph % 1 < 0.55 ? F2 : F1);
      }
    });
    return;
  }
  // ITS CLAWS COME THROUGH: the marks flash, and are left torn into the floor
  const mark = WARN.shade.mark;
  if (since < 0.07) {
    for (const pts of marks) {
      polyline(g, pts, F3, 1, 1);
      polyline(g, pts, F4);
      const [mx, my] = middle(pts);
      glow(g, mx, my, 9, F3, 0.45);
    }
    return;
  }
  g.globalAlpha = since < 0.25 ? 1 : clamp01(1 - (since - 0.25) / (mark - 0.25));
  const rim = since < 0.18 ? F2 : since < 0.3 ? F1 : F0;
  for (const pts of marks) {
    polyline(g, pts, rim, 1, -1);
    polyline(g, pts, INK);
    polyline(g, pts.slice(2, 9), INK, 1, 1);
    if (since < 0.2) {
      const [mx, my] = middle(pts);
      glow(g, mx, my, 9, F2, 0.3 * (1 - since / 0.2));
    }
  }
  g.globalAlpha = 1;
}

// ---------------------------------------------------------------------------------------------
// THE BONEWARD: the lane of its rune's marks, out to its spear's reach

/** Its marks along the lane, from it outward: how many, and the first's distance from it (tiles). */
const LANE_MARKS = 5;
const LANE_FROM = 0.45;

function bonewardWarn(g: CanvasRenderingContext2D, w: Warn, at: FloorAt, glow: Glow): void {
  const W = Math.max(0.05, w.windup);
  const t = w.t;
  const k = t / W;
  const since = t - W;
  const reach = w.reach ?? WARN.boneward.reach;
  const side = WARN.boneward.side;
  const A = ahead(w, at);
  const P3 = (a: number, c: number): Pt => A(a, c + side);
  const frame = Math.floor(t * 30);
  // the lane's way on the screen, and across it
  const [ox, oy] = P3(0, 0);
  const [ux, uy] = P3(1, 0);
  const ul = Math.hypot(ux - ox, uy - oy) || 1;
  const dx = (ux - ox) / ul;
  const dy = (uy - oy) / ul;
  const nx = -dy;
  const ny = dx;
  const markAt = (j: number): Pt => P3(LANE_FROM + ((reach - 0.12 - LANE_FROM) * j) / (LANE_MARKS - 1), 0);
  const [sx0, sy0] = P3(LANE_FROM - 0.15, 0);
  const [sx1, sy1] = P3(reach, 0);
  const shape = (j: number, x: number, y: number, col: string, shade: string | null): void => {
    if (j === LANE_MARKS - 1) {
      // the spear-head
      const tx = x + dx * 4;
      const ty = y + dy * 4;
      const bx = x - dx * 1.5;
      const by = y - dy * 1.5;
      if (shade) {
        line(g, tx, ty + 1, bx + nx * 2.6, by + ny * 2.6 + 1, shade);
        line(g, tx, ty + 1, bx - nx * 2.6, by - ny * 2.6 + 1, shade);
      }
      line(g, tx, ty, bx + nx * 2.6, by + ny * 2.6, col);
      line(g, tx, ty, bx - nx * 2.6, by - ny * 2.6, col);
      line(g, bx + nx * 2.6, by + ny * 2.6, bx - nx * 2.6, by - ny * 2.6, col);
      line(g, tx, ty, bx, by, col);
    } else if (j % 2 === 1) {
      // a diamond, the rune's heart, lying on the floor
      if (shade) line(g, x - 1, y + 2, x + 1, y + 2, shade);
      line(g, x - 2, y, x + 2, y, col);
      dot(g, x, y - 1, col);
      dot(g, x, y + 1, col);
    } else {
      // a dash along the lane
      if (shade) line(g, x - dx * 2, y - dy * 2 + 1, x + dx * 2, y + dy * 2 + 1, shade);
      line(g, x - dx * 2, y - dy * 2, x + dx * 2, y + dy * 2, col);
    }
  };
  if (since < 0) {
    const beat = k > 0.84;
    // the lane: a faint line down its middle, where the spear will go
    g.globalAlpha = 0.85;
    line(g, sx0, sy0, sx1, sy1, F0, 3);
    g.globalAlpha = 1;
    for (let j = 0; j < LANE_MARKS; j++) {
      const [x, y] = markAt(j);
      const lit = t - (0.08 + (0.72 * j) / (LANE_MARKS - 1)) * W;
      if (lit < 0) {
        g.globalAlpha = 0.9;
        shape(j, x, y, F0, null);
        g.globalAlpha = 1;
        continue;
      }
      const head = j === LANE_MARKS - 1;
      const col = lit < 0.05 ? F4 : beat ? (frame % 4 < 2 ? (head ? F4 : F3) : head ? F3 : F2) : F2;
      shape(j, x, y, col, F0);
      if (j % 2 === 1 && lit >= 0.05) dot(g, x, y, F3);
      glow(g, x, y, head ? 7 : 5, head && beat ? F3 : F2, head && beat ? 0.42 : 0.28);
    }
    return;
  }
  // THE THRUST: a white-gold streak down the lane, and sparks off its end
  const mark = WARN.boneward.mark;
  const [ex, ey] = P3(reach + 0.1, 0);
  if (since < 0.07) {
    line(g, sx0, sy0 - 1, ex, ey - 1, F3);
    line(g, sx0, sy0, ex, ey, F4);
    line(g, sx0, sy0 + 1, ex, ey + 1, F4);
    line(g, sx0, sy0 + 2, ex, ey + 2, F3);
    for (let i = 0; i <= 2; i++) glow(g, sx0 + ((ex - sx0) * i) / 2, sy0 + ((ey - sy0) * i) / 2, 10, F3, 0.5);
  } else {
    g.globalAlpha = clamp01(1 - (since - 0.2) / (mark - 0.2));
    const col = since < 0.16 ? F3 : since < 0.26 ? F2 : F1;
    line(g, sx0, sy0, ex, ey, col);
    line(g, sx0, sy0 + 1, ex, ey + 1, F0);
    for (let j = 0; j < LANE_MARKS; j++) {
      const [x, y] = markAt(j);
      shape(j, x, y, col, F0);
    }
    if (since < 0.25) glow(g, (sx0 + ex) / 2, (sy0 + ey) / 2, 12, F2, 0.35 * (1 - since / 0.25));
    g.globalAlpha = 1;
  }
  // sparks off the spear's end
  for (let i = 0; i < 7; i++) {
    const life = 0.18 + 0.1 * hash(i, 1, 41);
    if (since >= life) continue;
    const a = (hash(i, 2, 41) - 0.5) * 2.2 * (w.fx - w.fy < 0 ? -1 : 1);
    const sp = 40 + 50 * hash(i, 3, 41);
    const vx = (dx * Math.cos(a) - dy * Math.sin(a)) * sp;
    const vy = (dy * Math.cos(a) + dx * Math.sin(a)) * sp;
    dot(g, ex + vx * since, ey + vy * since + 60 * since * since - 1, since < life * 0.5 ? F4 : F3);
  }
}

// ---------------------------------------------------------------------------------------------
// THE OSSUARY GOLEM: the floor cracks where the club will come down

interface Crack {
  /** Its points (tiles, from where the club lands), and how far each is from there. */
  pts: Pt[];
  d: number[];
  /** A crack from the middle (not a fork off one). */
  main: boolean;
}
const CRACKS = new Map<string, Crack[]>();

/** The cracks for one blow: eight from the middle out to the edge, some forking. Its own for its number, and the same every frame. */
export function golemCracks(seed: number, R: number): ReadonlyArray<Crack> {
  const key = `${seed}:${R.toFixed(3)}`;
  const had = CRACKS.get(key);
  if (had) return had;
  const out: Crack[] = [];
  const of = (pts: Pt[], main: boolean): Crack => ({ pts, d: pts.map(([x, y]) => Math.hypot(x, y)), main });
  const n = 8;
  const a0 = hash(seed, 7, 1) * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const ang = a0 + (i / n) * Math.PI * 2 + (hash(seed, i, 2) - 0.5) * 0.45;
    const len = R * (0.8 + 0.2 * hash(seed, i, 3));
    const segs = 5;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    const pts: Pt[] = [[c * R * 0.06, s * R * 0.06]];
    for (let k = 1; k <= segs; k++) {
      const along = (len * k) / segs;
      const off = (hash(seed, i, 10 + k) - 0.5) * 0.24 * R * (k < segs ? 1 : 0.5);
      pts.push([c * along - s * off, s * along + c * off]);
    }
    out.push(of(pts, true));
    if (hash(seed, i, 4) < 0.55) {
      const m = 2 + Math.floor(hash(seed, i, 5) * 2);
      const b = ang + (hash(seed, i, 6) < 0.5 ? 0.75 : -0.75);
      const bl = len * (0.25 + 0.15 * hash(seed, i, 8));
      const [x0, y0] = pts[m];
      const j = (hash(seed, i, 9) - 0.5) * 0.08 * R;
      out.push(of([[x0, y0], [x0 + Math.cos(b) * bl * 0.5 - Math.sin(b) * j, y0 + Math.sin(b) * bl * 0.5 + Math.cos(b) * j], [x0 + Math.cos(b) * bl, y0 + Math.sin(b) * bl]], false));
    }
  }
  CRACKS.set(key, out);
  return out;
}

/** How hot a crack burns as the wind-up goes on (the middle one step hotter): pink to gold. */
function heat(k: number, inner: boolean): string {
  const i = (k < 0.3 ? 0 : k < 0.55 ? 1 : k < 0.8 ? 2 : 3) + (inner ? 1 : 0);
  return FLAME[Math.min(4, i)];
}

function golemWarn(g: CanvasRenderingContext2D, w: Warn, at: FloorAt, glow: Glow): void {
  const W = Math.max(0.05, w.windup);
  const t = w.t;
  const k = t / W;
  const since = t - W;
  const reach = w.reach ?? WARN.golem.reach;
  const R = w.r ?? WARN.golem.r;
  const seed = w.seed ?? 1;
  // where the club comes down: ahead of it, a little to the side of the hand it is in; and a point
  // of the floor from there, `u` on along the way it faces and `v` across (as `ahead`, so that the
  // cracks turn with it, and are the mirror when it is shown mirrored)
  const A = ahead(w, at);
  const side = WARN.golem.side;
  const from = (u: number, v: number): readonly [number, number] => A(reach + u, side + v);
  const [cx, cy] = from(0, 0);
  const frame = Math.floor(t * 30);
  const cracks = golemCracks(seed, R);
  // a crack, as far out from the middle as `vis` (tiles), one pixel to the side (`sx`) and down (`sy`)
  const crack = (cr: Crack, vis: number, color: string | ((seg: number) => string), sx = 0, sy = 0, every = 1, first = 0, last = 99): void => {
    for (let s = first; s < Math.min(last, cr.pts.length - 1); s++) {
      const d0 = cr.d[s];
      const d1 = cr.d[s + 1];
      if (d0 >= vis) break;
      const [x0, y0] = cr.pts[s];
      let [x1, y1] = cr.pts[s + 1];
      if (d1 > vis) {
        const u = (vis - d0) / Math.max(1e-6, d1 - d0);
        x1 = x0 + (x1 - x0) * u;
        y1 = y0 + (y1 - y0) * u;
      }
      const [X0, Y0] = from(x0, y0);
      const [X1, Y1] = from(x1, y1);
      line(g, X0 + sx, Y0 + sy, X1 + sx, Y1 + sy, typeof color === 'string' ? color : color(s), every);
    }
  };
  // the grit on the floor in it, all over it out to its edge
  const grit = (hop: number, alpha: number): void => {
    for (let i = 0; i < 22; i++) {
      const a = hash(seed, i, 51) * Math.PI * 2;
      const rr = R * (i < 8 ? 0.85 + 0.12 * hash(seed, i, 52) : Math.sqrt(hash(seed, i, 52)) * 0.85);
      const [x, y] = from(Math.cos(a) * rr, Math.sin(a) * rr);
      const z = hop > 0 ? Math.round(Math.abs(Math.sin(t * 38 + hash(seed, i, 53) * 6.28)) * hop) : 0;
      g.globalAlpha = alpha;
      if (z > 0) dot(g, x, y, INK);
      dot(g, x, y - z, GRIT[Math.floor(hash(seed, i, 54) * GRIT.length)]);
    }
    g.globalAlpha = 1;
  };
  if (since < 0) {
    // hairlines out to the edge of what it will hit, from the first moment
    g.globalAlpha = 0.8;
    for (const cr of cracks) crack(cr, 99, F0, 0, 0, 2);
    g.globalAlpha = 1;
    // the floor trembles: grit hops all over it, more and more
    grit(k < 0.12 ? 0 : k < 0.6 ? 1 : 2, 1);
    // the cracks open along them from the middle outward, hotter as it goes, reaching the edge as the club comes down
    const vis = R * easeOut(clamp01((k - 0.04) / 0.84));
    const shake = k > 0.85 ? [0, 1, 0, -1][frame % 4] : 0;
    for (const cr of cracks) {
      crack(cr, vis, INK, shake, 1);
      crack(cr, vis, (s) => heat(k, s < 2 && cr.main), shake + 1, 0, 1, 0, cr.main ? 2 : 0);
      crack(cr, vis, (s) => heat(k, s < 1 && cr.main), shake, 0);
    }
    // the middle, sinking and burning
    if (k > 0.5) {
      dot(g, cx + shake, cy, heat(k, true));
      dot(g, cx + shake + 1, cy, heat(k, true));
    }
    // dust rising off the cracks' ends
    if (k > 0.45) {
      cracks.forEach((cr, i) => {
        if (!cr.main) return;
        const s = Math.min(cr.pts.length - 1, Math.max(1, Math.floor((vis / R) * (cr.pts.length - 1))));
        const [x, y] = from(cr.pts[s][0], cr.pts[s][1]);
        const ph = (t * 2.2 + hash(seed, i, 61)) % 1;
        puff(g, x, y - 1 - ph * 7, 1 + ph * 2, 0.4 * (1 - ph));
      });
    }
    glow(g, cx, cy, 8 + 24 * k, F2, 0.08 + 0.32 * k);
    if (k > 0.8) glow(g, cx, cy, 10, F3, (k - 0.8) * 2);
    return;
  }
  // THE CLUB COMES DOWN: the cracks blaze; stone is thrown up and dust bursts out; they cool and fade
  const mark = WARN.golem.mark;
  const fade = since < 0.9 ? 1 : clamp01(1 - (since - 0.9) / (mark - 0.9));
  const col = since < 0.09 ? F4 : since < 0.3 ? F3 : since < 0.55 ? F2 : since < 0.8 ? F1 : since < 1.05 ? F0 : null;
  g.globalAlpha = fade;
  for (const cr of cracks) {
    crack(cr, 99, INK, 0, 1);
    if (since < 0.09) {
      crack(cr, 99, F3, 1, 0);
      crack(cr, 99, F3, -1, 0, 1, 0, 2);
    } else if (col) crack(cr, 99, col === F0 ? F0 : FLAME[Math.max(0, FLAME.indexOf(col) - 1)], 1, 0, 1, 0, cr.main ? 2 : 0);
    crack(cr, 99, col ?? COLD, 0, 0);
  }
  // the dent where it struck: white-hot, then dark
  const dent = since < 0.09 ? F4 : INK;
  line(g, cx - 3, cy, cx + 3, cy, dent);
  line(g, cx - 1, cy - 1, cx + 1, cy - 1, dent);
  line(g, cx - 1, cy + 1, cx + 1, cy + 1, dent);
  if (since >= 0.09 && col) {
    dot(g, cx - 4, cy, col);
    dot(g, cx + 4, cy, col);
  }
  g.globalAlpha = 1;
  if (since < 0.6) glow(g, cx, cy, 34 * (1 - since * 0.5), F3, 0.75 * (1 - since / 0.6));
  if (since < 0.15) glow(g, cx, cy, 12, F4, 0.9 * (1 - since / 0.15));
  // stone thrown up, falling, and lying where it fell
  for (let i = 0; i < 16; i++) {
    const a = hash(seed, i, 81) * Math.PI * 2;
    const sp = 0.9 + 1.5 * hash(seed, i, 82);
    const vz = 60 + 70 * hash(seed, i, 83);
    const G = 420;
    const flight = (2 * vz) / G;
    const s = Math.min(since, flight);
    const out = R * 0.1 + sp * s;
    const z = Math.max(0, vz * s - 0.5 * G * s * s);
    const [x, y] = from(Math.cos(a) * out, Math.sin(a) * out);
    const big = hash(seed, i, 84) < 0.4;
    g.globalAlpha = fade;
    if (z > 0.5) dot(g, x, y, INK);
    const X = Math.round(x);
    const Y = Math.round(y - z);
    g.fillStyle = P.st6;
    g.fillRect(X, Y, big ? 2 : 1, big ? 2 : 1);
    if (big) {
      dot(g, X, Y, P.st7);
      dot(g, X + 1, Y + 1, P.st5);
    }
  }
  g.globalAlpha = 1;
  // dust bursting out round it, each puff its own way and as far, rising as it spreads
  if (since < 0.65) {
    for (let i = 0; i < 9; i++) {
      const a = ((i + hash(seed, i, 91) * 0.7) / 9) * Math.PI * 2;
      const rr = R * (0.25 + (0.4 + 0.45 * hash(seed, i, 92)) * easeOut(clamp01(since / 0.45)));
      const [x, y] = from(Math.cos(a) * rr, Math.sin(a) * rr);
      puff(g, x, y - since * (6 + 6 * hash(seed, i, 93)), 1 + 2 * clamp01(since / 0.3), 0.45 * (1 - since / 0.65));
    }
  }
}
