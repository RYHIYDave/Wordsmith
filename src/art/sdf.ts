// THE OPENING'S FIGURES, SCULPTED (art/opening.ts): a figure built of solids melted into one another, as the art chat
// sculpts its new classes (its dev/sculpt.ts on mockup/classes: “a smooth union of distance fields, so a shoulder runs into
// the arm, a muscle into the body under it, a jaw into the skull”), and drawn as the comic draws: from any side and as
// close as a box wants, by sending a ray from the eye through each pixel; lit in flat bands from one light, the last band
// dotted; inked round the whole figure, where one stuff meets another, and where a part passes in front of another, but
// not where two parts of one stuff run into each other. His art rulebook, rule 9: real shapes, not circles and squares.

import { Px } from '../engine/px';
import { INK, clamp01, dot, toneAt } from './comic';
import type { Tones } from './comic';

export type V3 = readonly [number, number, number];

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dt = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V3): V3 => mul(a, 1 / (len(a) || 1));
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export { add, cross, mul, sub, unit };

/** A material: its tones in the light (darkest first), and a colour of its own at a point if it likes (a stripe, an eye). */
export interface Stuff {
  tones: Tones;
  paint?: (p: V3, n: V3, lit: number) => string | null;
  /** Hatch its darkest band with ink, lines this far apart. */
  hatch?: number;
  /** It shines (steel, a blade): a hard glint where the light comes off it toward the eye, this strong (0..1). */
  shine?: number;
  /** Grows out of what it lies on (a beard on a jaw): no ink where it meets another stuff at one depth. */
  meld?: boolean;
  /** How deep its creases go (1: as deep as they are; less for a face or a hand, all small parts close together). */
  crease?: number;
}

interface Base {
  stuff: number;
  /** How far it melts into what went before it of its stuff (0: a crisp join). */
  blend: number;
  /** It takes away from its stuff (a socket, a groove). */
  carve?: boolean;
}
/** A rod that tapers from `a` (radius `ra`) to `b` (radius `rb`), rounded at its ends. */
interface Rod extends Base { k: 'rod'; a: V3; b: V3; ra: number; rb: number }
/** An egg: its middle and its three half-lengths, each along its own line (`ax`: unit lines). */
interface Egg extends Base { k: 'egg'; c: V3; ax: readonly [V3, V3, V3]; r: V3 }
/** A block with rounded edges: its middle, its half-lengths along its own lines, how round. */
interface Block extends Base { k: 'block'; c: V3; ax: readonly [V3, V3, V3]; r: V3; round: number }
type Solid = Rod | Egg | Block;

const X: V3 = [1, 0, 0];
const Y: V3 = [0, 1, 0];
const Z: V3 = [0, 0, 1];
/** Three unit lines turned `yaw` about the up line (z), then `tilt` about the new x, then `roll` about the new y. */
export function axes(yaw = 0, tilt = 0, roll = 0): readonly [V3, V3, V3] {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  let x: V3 = [cy, sy, 0];
  let y: V3 = [-sy, cy, 0];
  let z: V3 = Z;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const y2 = add(mul(y, ct), mul(z, st));
  const z2 = add(mul(z, ct), mul(y, -st));
  y = y2;
  z = z2;
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);
  const x2 = add(mul(x, cr), mul(z, -sr));
  const z3 = add(mul(z, cr), mul(x, sr));
  x = x2;
  z = z3;
  return [x, y, z];
}

function smin(a: number, b: number, k: number): number {
  if (k <= 0) return Math.min(a, b);
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}
function smax(a: number, b: number, k: number): number {
  return -smin(-a, -b, k);
}

function distOf(s: Solid, p: V3): number {
  if (s.k === 'rod') {
    const ba = sub(s.b, s.a);
    const pa = sub(p, s.a);
    const L2 = dt(ba, ba) || 1e-9;
    const t = clamp01(dt(pa, ba) / L2);
    const r = s.ra + (s.rb - s.ra) * t;
    return len(sub(pa, mul(ba, t))) - r;
  }
  const d = sub(p, s.c);
  const q: V3 = [dt(d, s.ax[0]), dt(d, s.ax[1]), dt(d, s.ax[2])];
  if (s.k === 'egg') {
    const k0 = Math.hypot(q[0] / s.r[0], q[1] / s.r[1], q[2] / s.r[2]);
    const k1 = Math.hypot(q[0] / (s.r[0] * s.r[0]), q[1] / (s.r[1] * s.r[1]), q[2] / (s.r[2] * s.r[2]));
    return k1 > 0 ? (k0 * (k0 - 1)) / k1 : -Math.min(s.r[0], s.r[1], s.r[2]);
  }
  const qx = Math.abs(q[0]) - s.r[0] + s.round;
  const qy = Math.abs(q[1]) - s.r[1] + s.round;
  const qz = Math.abs(q[2]) - s.r[2] + s.round;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - s.round;
}

/** A point light and the comic's way of lighting with it. */
export interface Light {
  /** The key: a lamp at a point (`at`), or a direction it comes from (`from`, a unit toward the light). */
  at?: V3;
  from?: V3;
  /** How hard the light falls: 1, the far side in the dark. */
  hard?: number;
  /** A dim fill from this direction, at this strength (0..1 of a band or two). */
  fill?: V3;
  fillK?: number;
  /** A rim from behind (the colour, and the direction on the screen it comes from: x right, y down). */
  rim?: string;
  rimFrom?: readonly [number, number];
  /**
   * Inked as a comic inks it, in place of shading round: below `black` the shadow is solid ink (the spotted blacks), a band of
   * hatching at its edge; then one flat middle tone; above `light` the lit tone; above `hi` its brightest.
   */
  cel?: { black: number; light: number; hi?: number };
}

/** The camera: looking along `look` (a unit), `up` up the screen; `scale` pixels to a unit; the figure's origin at (ox, oy) on the canvas. */
export interface Camera {
  look: V3;
  up: V3;
  scale: number;
  ox: number;
  oy: number;
  /**
   * Seen in perspective, the eye this far back from the plane through the figure's origin (its units): what is nearer is
   * bigger, what is further smaller, lines running away draw together. Not given: seen square on (no perspective).
   */
  persp?: number;
}

/** A figure, sculpted. */
export class Figure {
  readonly stuffs: Stuff[] = [];
  readonly solids: Solid[] = [];
  readonly marks: { p: V3; c: readonly string[]; w: number }[] = [];
  stuff(s: Stuff): number {
    this.stuffs.push(s);
    return this.stuffs.length - 1;
  }
  rod(stuff: number, a: V3, b: V3, ra: number, rb = ra, blend = 0.8, carve = false): this {
    this.solids.push({ k: 'rod', stuff, a, b, ra, rb, blend, carve });
    return this;
  }
  egg(stuff: number, c: V3, r: V3, ax: readonly [V3, V3, V3] = [X, Y, Z], blend = 0.8, carve = false): this {
    this.solids.push({ k: 'egg', stuff, c, r, ax, blend, carve });
    return this;
  }
  block(stuff: number, c: V3, r: V3, round: number, ax: readonly [V3, V3, V3] = [X, Y, Z], blend = 0.6, carve = false): this {
    this.solids.push({ k: 'block', stuff, c, r, ax, round, blend, carve });
    return this;
  }
  readonly lines: { pts: readonly V3[]; c: string; w: number }[] = [];
  /** A line inked on the figure through `pts` (a wrinkle, a knuckle, a fold), drawn only where those points are seen. */
  line(pts: readonly V3[], c = INK, w = 1): this {
    this.lines.push({ pts, c, w });
    return this;
  }
  /** A mark drawn on the figure where its point is seen (an eye's light): colours from its middle out, `w` wide. */
  mark(p: V3, c: readonly string[], w = 2): this {
    this.marks.push({ p, c, w });
    return this;
  }

  /** Each stuff's solids, each with a ball round it (its middle, its reach): made when it is drawn. */
  private groups: { s: Solid; c: V3; r: number }[][] = [];
  private group(): void {
    this.groups = this.stuffs.map((_, m) =>
      this.solids
        .filter((s) => s.stuff === m)
        .map((s) => {
          if (s.k === 'rod') return { s, c: mul(add(s.a, s.b), 0.5), r: len(sub(s.b, s.a)) / 2 + Math.max(s.ra, s.rb) };
          if (s.k === 'block') return { s, c: s.c, r: Math.hypot(s.r[0], s.r[1], s.r[2]) };
          return { s, c: s.c, r: Math.max(s.r[0], s.r[1], s.r[2]) };
        }),
    );
  }
  /**
   * The field of one stuff at `p`: its solids melted together, its carvings taken away. (A solid whose ball is further than
   * what is already nearest by more than its melt cannot change it, nor a carving whose ball is further than its melt: both
   * passed over.)
   */
  private ofStuff(m: number, p: V3): number {
    let d = Infinity;
    for (const { s, c, r } of this.groups[m]) {
      const b = len(sub(p, c)) - r;
      if (s.carve) {
        if (d === Infinity || b > s.blend + 0.02) continue;
        d = smax(d, -distOf(s, p), s.blend);
      } else {
        if (d !== Infinity && b >= d + s.blend) continue;
        const e = distOf(s, p);
        d = d === Infinity ? e : smin(d, e, s.blend);
      }
    }
    return d;
  }
  /** The nearest stuff at `p`, and how far. */
  private at(p: V3): { d: number; m: number } {
    let d = Infinity;
    let m = -1;
    for (let k = 0; k < this.stuffs.length; k++) {
      const e = this.ofStuff(k, p);
      if (e < d) {
        d = e;
        m = k;
      }
    }
    return { d, m };
  }

  /**
   * Draw it onto `p` (only its own pixels; then inked) seen by `cam`, lit by `light`. Returns its depth at each pixel
   * (-Infinity where it is not), for what is drawn over it.
   */
  draw(p: Px, cam: Camera, light: Light, inkOut = true): Float32Array {
    const W = p.w;
    const H = p.h;
    this.group();
    const look = unit(cam.look);
    const right = unit(cross(look, cam.up));
    const down = unit(cross(look, right));
    const D = cam.persp ?? 0;
    const eye: V3 = mul(look, -D);
    /** Where a point is seen on the canvas, and how much nearer or further it is drawn (1 at the origin's plane). */
    const proj = (q: V3): [number, number, number] => {
      const f = D > 0 ? D / Math.max(0.05 * D, D + dt(q, look)) : 1;
      return [dt(q, right) * f * cam.scale + cam.ox, dt(q, down) * f * cam.scale + cam.oy, f];
    };
    // (the figure's reach: the bounds of its solids on the screen, and how near and far)
    let near = -Infinity;
    let far = Infinity;
    // (and its box on the screen: only the pixels in it are looked for it)
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    for (const s of this.solids) {
      if (s.carve) continue;
      const pts: V3[] = s.k === 'rod' ? [s.a, s.b] : [s.c];
      const r = s.k === 'rod' ? Math.max(s.ra, s.rb) : s.k === 'block' ? Math.hypot(s.r[0], s.r[1], s.r[2]) : Math.max(s.r[0], s.r[1], s.r[2]);
      for (const q of pts) {
        near = Math.max(near, -dt(q, look) + r + 1);
        far = Math.min(far, -dt(q, look) - r - 1);
        const [sx, sy, f] = proj(q);
        const rr = (r + s.blend) * cam.scale * f * 1.15 + 2;
        x0 = Math.min(x0, sx - rr);
        x1 = Math.max(x1, sx + rr);
        y0 = Math.min(y0, sy - rr);
        y1 = Math.max(y1, sy + rr);
      }
    }
    const XA = Math.max(0, Math.floor(x0));
    const XB = Math.min(W - 1, Math.ceil(x1));
    const YA = Math.max(0, Math.floor(y0));
    const YB = Math.min(H - 1, Math.ceil(y1));
    const N = W * H;
    const depth = new Float32Array(N).fill(-Infinity);
    const stuffAt = new Int16Array(N).fill(-1);
    const colour: (string | null)[] = new Array(N).fill(null);
    const key = light.at;
    const hard = light.hard ?? 1;
    const E = 0.04;
    for (let y = YA; y <= YB; y++) {
      for (let x = XA; x <= XB; x++) {
        const sx = (x + 0.5 - cam.ox) / cam.scale;
        const sy = (y + 0.5 - cam.oy) / cam.scale;
        const base = add(mul(right, sx), mul(down, sy));
        // (the ray: square on, from in front of the figure straight back along the look; in perspective, from the eye
        // out through this pixel on the origin's plane)
        const o: V3 = D > 0 ? eye : add(base, mul(look, -near));
        const dir: V3 = D > 0 ? unit(sub(base, eye)) : look;
        const along = dt(dir, look);
        let s0 = D > 0 ? Math.max(0, (D - near) / along) : 0;
        const s1 = D > 0 ? (D - far) / along : near - far;
        let hit = false;
        let q: V3 = o;
        let m = -1;
        for (let i = 0; i < 140 && s0 < s1; i++) {
          q = add(o, mul(dir, s0));
          const a = this.at(q);
          if (a.d < 0.004) {
            hit = true;
            m = a.m;
            break;
          }
          s0 += Math.max(0.004, a.d * 0.85);
        }
        const t = -dt(q, look);
        if (!hit) continue;
        const g = (dx: number, dy: number, dz: number): number => this.ofStuff(m, [q[0] + dx, q[1] + dy, q[2] + dz]);
        const n = unit([g(E, 0, 0) - g(-E, 0, 0), g(0, E, 0) - g(0, -E, 0), g(0, 0, E) - g(0, 0, -E)]);
        const L = key ? unit(sub(key, q)) : unit(light.from ?? [0, 0, 1]);
        const dl = dt(n, L);
        const fall = key ? Math.min(1, 2.2 / (0.6 + len(sub(key, q)) * 0.25)) : 1;
        let v = clamp01((dl * (0.5 + hard * 0.35) + 0.5 - hard * 0.25) * fall);
        if (light.fill) v = Math.max(v, clamp01(dt(n, unit(light.fill))) * (light.fillK ?? 0.25));
        // (a shining stuff's glint: where the light comes off it toward the eye)
        const shineK = this.stuffs[m].shine ?? 0;
        if (shineK > 0) {
          const toEye = D > 0 ? unit(sub(eye, q)) : mul(look, -1);
          const rf = sub(mul(n, 2 * dl), L);
          v += Math.pow(clamp01(dt(rf, toEye)), 14) * shineK;
        }
        // its creases: how hemmed in the skin is, a little way out from it (darker; deep in one, an ink line)
        const o1 = this.at(add(q, mul(n, 0.12))).d / 0.12;
        const o2 = this.at(add(q, mul(n, 0.3))).d / 0.3;
        const open = clamp01((o1 + o2) / 2);
        const st = this.stuffs[m];
        const ck = st.crease ?? 1;
        v -= (1 - open) * 0.45 * ck;
        const k = y * W + x;
        depth[k] = t;
        stuffAt[k] = m;
        const own = st.paint ? st.paint(q, n, v) : null;
        if (open < 0.32 * ck && !own) colour[k] = INK;
        else if (own) colour[k] = own;
        else if (light.cel) {
          const c = light.cel;
          const n = st.tones.length;
          if (v < c.black) colour[k] = INK;
          else if (v < c.black + 0.07 && (x + y) % 3 === 0) colour[k] = INK;
          else if (v < c.light) colour[k] = st.tones[Math.max(1, Math.floor((n - 1) * 0.45))];
          else if (v < (c.hi ?? 2)) colour[k] = st.tones[n - 2];
          else colour[k] = st.tones[n - 1];
        } else if (st.hatch && v < 1 / st.tones.length && (x + y) % st.hatch === 0) colour[k] = INK;
        else colour[k] = toneAt(st.tones, v, x, y);
      }
    }
    // the rim from behind: the figure's edge toward it
    if (light.rim && light.rimFrom) {
      const [bx, by] = light.rimFrom;
      const rimC = light.rim;
      const marks: number[] = [];
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const k = y * W + x;
          if (stuffAt[k] < 0) continue;
          const nx = bx > 0.3 ? x + 1 : bx < -0.3 ? x - 1 : x;
          const ny = by > 0.3 ? y + 1 : by < -0.3 ? y - 1 : y;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H || stuffAt[ny * W + nx] < 0) marks.push(k);
          else if (nx !== x || ny !== y) {
            const k2 = ny * W + nx;
            if (depth[k2] < depth[k] - 0.35) marks.push(k);
          }
        }
      }
      // (the light along the edge, not a line drawn round it: the edge's own colour warmed toward the rim's)
      for (const k of marks) {
        const c0 = colour[k];
        colour[k] = c0 && c0.length === 7 && c0 !== INK ? mixHex(c0, rimC, 0.42) : c0;
      }
    }
    // ink: round the whole figure, where stuffs meet (unless one grows out of the other), where a part passes before another
    const inked = new Uint8Array(N);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const k = y * W + x;
        if (stuffAt[k] < 0) continue;
        for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]] as const) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const k2 = ny * W + nx;
          if (stuffAt[k2] < 0) continue;
          const a = stuffAt[k];
          const b = stuffAt[k2];
          // (the nearer of the two keeps its colour; the further takes the ink)
          if (depth[k] > depth[k2]) continue;
          const jump = depth[k2] - depth[k] > 0.3;
          const meet = a !== b && !((this.stuffs[a].meld || this.stuffs[b].meld) && !jump);
          if (jump || meet) inked[k] = 1;
        }
      }
    }
    for (let k = 0; k < N; k++) {
      if (stuffAt[k] < 0) continue;
      p.set(k % W, (k - (k % W)) / W, inked[k] ? INK : colour[k]);
    }
    if (inkOut) {
      const out: number[] = [];
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const k = y * W + x;
          if (stuffAt[k] >= 0) continue;
          if ((x > 0 && stuffAt[k - 1] >= 0) || (x < W - 1 && stuffAt[k + 1] >= 0) || (y > 0 && stuffAt[k - W] >= 0) || (y < H - 1 && stuffAt[k + W] >= 0)) out.push(x, y);
        }
      }
      for (let i = 0; i < out.length; i += 2) p.set(out[i], out[i + 1], INK);
    }
    // the lines inked on it, where they are seen
    for (const ln of this.lines) {
      for (let i = 1; i < ln.pts.length; i++) {
        const a = ln.pts[i - 1];
        const b = ln.pts[i];
        const [ax, ay] = proj(a);
        const [bx, by] = proj(b);
        const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) * 1.5));
        for (let j = 0; j <= n; j++) {
          const u = j / n;
          const X = Math.round(ax + (bx - ax) * u);
          const Y = Math.round(ay + (by - ay) * u);
          if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
          const kk = Y * W + X;
          const zd = -dt(add(a, mul(sub(b, a), u)), look);
          if (stuffAt[kk] < 0 || depth[kk] > zd + 0.3) continue;
          p.set(X, Y, ln.c);
          if (ln.w > 1 && X + 1 < W && stuffAt[kk + 1] >= 0) p.set(X + 1, Y, ln.c);
        }
      }
    }
    // the marks (an eye's light), where their point is seen
    for (const mk of this.marks) {
      const [sx, sy] = proj(mk.p);
      const X0 = Math.floor(sx);
      const Y0 = Math.floor(sy);
      if (X0 < 0 || Y0 < 0 || X0 >= W || Y0 >= H) continue;
      const k = Y0 * W + X0;
      if (stuffAt[k] < 0 || depth[k] > -dt(mk.p, look) + 0.6) continue;
      p.set(X0, Y0, mk.c[0]);
      if (mk.w > 1) {
        p.set(X0 + 1, Y0, mk.c[1] ?? mk.c[0]);
        p.set(X0, Y0 + 1, mk.c[2] ?? mk.c[0]);
      }
    }
    return depth;
  }
}

void dot;

/** Two colours (#rrggbb) mixed, `u` of the second. */
function mixHex(a: string, b: string, u: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * u).toString(16).padStart(2, '0')).join('');
}
