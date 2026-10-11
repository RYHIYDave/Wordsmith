// CHAINS THAT SWING (the art chat, 9 Oct 2026), for the Chained One (art/bosses3.ts). A MOCK-UP: NOT
// IN THE GAME; nothing of the game imports this file.
//
// A chain is a rope of links. Its first link is held (at a cuff, at a collar), and the rest hangs,
// swings, whips, lies and drags on the floor as a heavy chain does, worked out moment by moment
// through a move from where the bones put what holds it: a heavy chain follows a moving hand late,
// swings on after it stops, and comes to lie on the floor (the art rulebook: "Loose things follow";
// and the owner's word on the bosses, at 16:48: "I’d like the same principals for animations used for
// characters on the bosses"). It keeps out of the floor and out of the body it hangs from.
//
// All of it is worked out once, when a move is first asked for, in small steps of time (SIM_STEP),
// and kept a hundred and twenty times a second (SIM_KEEP); a frame between two kept moments is the
// two mixed. The same numbers come out every time, so every picture of a move is the same.

import { add, dot, len, lerp3, mul, sub } from './skeleton';
import type { Rot, V3 } from './skeleton';

/** A chain: how long it is (the figure's own lengths), in how many pieces; how heavy its end is (as so many links: a hook, a ball); how thick it is, and how big its end is (it lies on the floor that high). */
export interface ChainSpec {
  long: number;
  n: number;
  endMass: number;
  r: number;
  endR: number;
  /** How much of its swing it keeps each small step (the air, and the links rubbing on each other: a heavier chain swings less wildly). AIR if not said. */
  air?: number;
  /** Its end too heavy to be lifted by the chain: it stays on the floor and is dragged along it (an iron ball), unless a hand holds it. */
  endOnFloor?: boolean;
  /** How far its end is kept out of him, if more than it is big (a hook, longer than it is thick). */
  endPad?: number;
}
/** A part of the body for a chain to keep out of: a limb, from `a` to `b`, `r` thick. */
export interface Limb {
  a: V3;
  b: V3;
  r: number;
}
/** A part of the body for a chain to keep out of: a solid, its middle, how it is turned, and its half-lengths along its own forward, left and up. */
export interface Lump {
  c: V3;
  rot: Rot;
  h: V3;
}
/** What holds a chain at a moment: its first link (null: let go of), and links held in a hand (which link, and where the hand is). */
export interface ChainHold {
  from: V3 | null;
  held: ReadonlyArray<readonly [number, V3]>;
}

/** The small steps the chains are worked out in, and how often they are kept (seconds). */
export const SIM_STEP = 1 / 960;
export const SIM_KEEP = 1 / 120;
/** How hard a chain falls (the figure's own lengths a second, each second: as what falls in art/new_mobs3.ts). */
const SIM_G = 400;
/** How many times each small step the links are pulled back to their lengths. */
const SIM_ITER = 12;
/** What the air takes from a chain's swing each small step, and how much of its slide along the floor a link lying on it keeps (stone is rough: a chain on it drags, and stops when it is not pulled). */
const AIR = 0.9994;
const GRIP = 0.9;
/** And how much of its slide a link lying against him keeps (iron on skin and rags: it clings, and slides only when pulled); and how fast one must be pulled to slide at all (the figure's own lengths a second). */
const BODY_GRIP = 0.82;
const STICK = 14;
/** How hard the floor stops a link slammed onto it (as Coulomb's friction, against how hard it was driven down). */
const SLAM = 2.5;

type Pm = [number, number, number];

/** A CHAIN as it is at one moment: its links (each a point along it), as they are and as they were a small step before. */
export class Chain {
  readonly spec: ChainSpec;
  readonly seg: number;
  x: Pm[];
  p: Pm[];
  /** How light each link is (the end is heavier: a hook, a ball), and how high it lies on the floor. */
  readonly w: number[];
  readonly lie: number[];
  /** Which links lay against his trunk a small step ago (they cling there: a chain draped over his back stays; over a limb, it slides off as the limb moves). */
  touch: boolean[];
  constructor(spec: ChainSpec, pts: ReadonlyArray<V3>) {
    this.spec = spec;
    this.seg = spec.long / spec.n;
    const at = alongPath(pts, spec.n);
    this.x = at.map((q) => [q[0], q[1], q[2]] as Pm);
    this.p = at.map((q) => [q[0], q[1], q[2]] as Pm);
    this.w = at.map((_, i) => (i === spec.n ? 1 / spec.endMass : 1));
    this.lie = at.map((_, i) => (i === spec.n ? spec.endR : spec.r));
    this.touch = at.map(() => false);
  }
  /** Where its links are now (a copy). */
  now(): V3[] {
    return this.x.map((q) => [q[0], q[1], q[2]] as V3);
  }
  /** Laid along `pts` again, still (when it comes back to be his to paint: a thrown hook hauled in). */
  lay(pts: ReadonlyArray<V3>): void {
    const at = alongPath(pts, this.spec.n);
    this.x = at.map((q) => [q[0], q[1], q[2]] as Pm);
    this.p = at.map((q) => [q[0], q[1], q[2]] as Pm);
    this.touch = at.map(() => false);
  }
}

/** `n + 1` points evenly along a path (by its length), from its first to its last. */
export function alongPath(pts: ReadonlyArray<V3>, n: number): V3[] {
  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + len(sub(pts[i], pts[i - 1])));
  const total = cum[cum.length - 1];
  const out: V3[] = [];
  let j = 1;
  for (let k = 0; k <= n; k++) {
    const d = (total * k) / n;
    while (j < pts.length - 1 && cum[j] < d) j++;
    const a = cum[j - 1];
    const b = cum[j];
    out.push(pts.length < 2 ? pts[0] : lerp3(pts[j - 1], pts[j], b > a ? Math.max(0, Math.min(1, (d - a) / (b - a))) : 0));
  }
  return out;
}

/** A point put out of a limb, if it is in it (`pad` more all round): whether it was. */
export function outOfLimb(q: Pm, l: Limb, pad: number): boolean {
  const ab = sub(l.b, l.a);
  const L2 = dot(ab, ab);
  const k = L2 > 1e-9 ? Math.max(0, Math.min(1, ((q[0] - l.a[0]) * ab[0] + (q[1] - l.a[1]) * ab[1] + (q[2] - l.a[2]) * ab[2]) / L2)) : 0;
  const c0 = l.a[0] + ab[0] * k;
  const c1 = l.a[1] + ab[1] * k;
  const c2 = l.a[2] + ab[2] * k;
  const dx = q[0] - c0;
  const dy = q[1] - c1;
  const dz = q[2] - c2;
  const d = Math.hypot(dx, dy, dz);
  const want = l.r + pad;
  if (d >= want) return false;
  if (d < 1e-6) {
    q[2] = c2 + want;
    return true;
  }
  const s = want / d;
  q[0] = c0 + dx * s;
  q[1] = c1 + dy * s;
  q[2] = c2 + dz * s;
  return true;
}
/** A point put out of a solid of the body, if it is in it: straight out from its middle to its skin (`pad` more all round): whether it was. */
export function outOfLump(q: Pm, o: Lump, pad: number): boolean {
  const d: V3 = [q[0] - o.c[0], q[1] - o.c[1], q[2] - o.c[2]];
  const hx = o.h[0] + pad;
  const hy = o.h[1] + pad;
  const hz = o.h[2] + pad;
  const u0 = dot(d, o.rot[0]) / hx;
  const u1 = dot(d, o.rot[1]) / hy;
  const u2 = dot(d, o.rot[2]) / hz;
  const m = Math.hypot(u0, u1, u2);
  if (m >= 1) return false;
  const k = m < 1e-4 ? 0 : 1 / m;
  const o0 = m < 1e-4 ? 1 : u0 * k;
  const o1 = u1 * k;
  const o2 = u2 * k;
  const p = add(o.c, add(add(mul(o.rot[0], o0 * hx), mul(o.rot[1], o1 * hy)), mul(o.rot[2], o2 * hz)));
  q[0] = p[0];
  q[1] = p[1];
  q[2] = p[2];
  return true;
}

/**
 * ONE SMALL STEP of a chain: it swings on as it was swinging, falls, drags on the floor (which goes by
 * under him at `floorV` along his forward, while he walks), and is pulled back to its length from
 * whatever holds it; it keeps out of the floor and out of the body (`limbs`, `lumps`).
 */
export function stepChain(c: Chain, hold: ChainHold, limbs: ReadonlyArray<Limb>, lumps: ReadonlyArray<Lump>, floorV: number, dt: number, air = c.spec.air ?? AIR): void {
  const n = c.x.length;
  const fv = floorV * dt;
  const g = SIM_G * dt * dt;
  for (let i = 0; i < n; i++) {
    const x = c.x[i];
    const p = c.p[i];
    const cling = c.touch[i] ? BODY_GRIP : 1;
    let vx = (x[0] - p[0]) * air * cling;
    let vy = (x[1] - p[1]) * air * cling;
    const vz = (x[2] - p[2]) * air * cling;
    if (x[2] <= c.lie[i] + 0.2) {
      // (lying on the floor: it drags, its slide along the floor going to the floor's own)
      vx = fv + (vx - fv) * GRIP;
      vy *= GRIP;
    }
    p[0] = x[0];
    p[1] = x[1];
    p[2] = x[2];
    x[0] += vx;
    x[1] += vy;
    x[2] += vz - g;
  }
  const pinned: boolean[] = new Array(n).fill(false);
  const put = (i: number, q: V3): void => {
    c.x[i][0] = q[0];
    c.x[i][1] = q[1];
    c.x[i][2] = q[2];
    pinned[i] = true;
  };
  for (let i = 0; i < n; i++) c.touch[i] = false;
  const sunk: number[] = new Array(n).fill(0);
  // (each part of him, a ball round it: a link outside that ball, with its pad, is outside the part, and is not
  // looked at further: the same pictures, worked out several times faster)
  const lb: number[] = [];
  for (const l of limbs) lb.push((l.a[0] + l.b[0]) / 2, (l.a[1] + l.b[1]) / 2, (l.a[2] + l.b[2]) / 2, Math.hypot(l.b[0] - l.a[0], l.b[1] - l.a[1], l.b[2] - l.a[2]) / 2 + l.r);
  const ob: number[] = [];
  for (const o of lumps) ob.push(o.c[0], o.c[1], o.c[2], Math.max(o.h[0], o.h[1], o.h[2]));
  const near = (q: Pm, b: number[], k: number, pad: number): boolean => {
    const dx = q[0] - b[k];
    const dy = q[1] - b[k + 1];
    const dz = q[2] - b[k + 2];
    const r = b[k + 3] + pad;
    return dx * dx + dy * dy + dz * dz < r * r;
  };
  for (let it = 0; it < SIM_ITER; it++) {
    if (hold.from) put(0, hold.from);
    for (const [i, q] of hold.held) put(Math.max(0, Math.min(n - 1, i)), q);
    // each link pulled back to its length from the one before (a chain does not stretch; it folds and heaps up, and is not pushed out again)
    for (let i = 0; i < n - 1; i++) {
      const a = c.x[i];
      const b = c.x[i + 1];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const dz = b[2] - a[2];
      const d = Math.hypot(dx, dy, dz);
      if (d <= c.seg) continue;
      const want = c.seg;
      const wa = pinned[i] ? 0 : c.w[i];
      const wb = pinned[i + 1] ? 0 : c.w[i + 1];
      const sum = wa + wb;
      if (sum <= 0) continue;
      const k = (d - want) / d / sum;
      a[0] += dx * k * wa;
      a[1] += dy * k * wa;
      a[2] += dz * k * wa;
      b[0] -= dx * k * wb;
      b[1] -= dy * k * wb;
      b[2] -= dz * k * wb;
    }
    for (let i = 0; i < n; i++) {
      if (pinned[i]) continue;
      const q = c.x[i];
      const pad = i === n - 1 && c.spec.endPad !== undefined ? c.spec.endPad : c.lie[i];
      // (the links nearest what holds it hang against the limb it is fixed to: they are not pushed off it)
      if (i > 2) {
        for (let j = 0; j < limbs.length; j++) if (near(q, lb, j * 4, pad)) outOfLimb(q, limbs[j], pad);
        for (let j = 0; j < lumps.length; j++) if (near(q, ob, j * 4, pad) && outOfLump(q, lumps[j], pad)) c.touch[i] = true;
      }
      if (q[2] < c.lie[i]) {
        sunk[i] = Math.max(sunk[i], c.lie[i] - q[2]);
        q[2] = c.lie[i];
      }
      // (a ball too heavy for the chain to lift: dragged along the floor, not swung up off it)
      if (i === n - 1 && c.spec.endOnFloor) q[2] = c.lie[i];
    }
  }
  // (a link slammed onto the floor is stopped by it: stone takes from its slide as much as it was driven into it, and more: iron on stone does not skid far)
  for (let i = 0; i < n; i++) {
    if (pinned[i] || sunk[i] <= 0) continue;
    const x = c.x[i];
    const p = c.p[i];
    const vx = x[0] - p[0] - fv;
    const vy = x[1] - p[1];
    const v = Math.hypot(vx, vy);
    if (v < 1e-9) continue;
    const k = Math.max(0, 1 - (SLAM * sunk[i]) / v);
    p[0] = x[0] - fv - vx * k;
    p[1] = x[1] - vy * k;
  }
  // (a link lying against him that is barely pulled stays where it lies: iron clings to skin, and a chain draped over his back does not creep off it)
  for (let i = 0; i < n; i++) {
    if (pinned[i] || !c.touch[i]) continue;
    const x = c.x[i];
    const p = c.p[i];
    if (Math.hypot(x[0] - p[0], x[1] - p[1], x[2] - p[2]) < STICK * dt) {
      x[0] = p[0];
      x[1] = p[1];
      x[2] = p[2];
    }
  }
}

/** A CHAIN KEPT THROUGH A MOVE: where its links are at each kept moment (null while it is not his to paint), from `t0`. */
export interface ChainTrack {
  readonly t0: number;
  readonly frames: ReadonlyArray<ReadonlyArray<V3> | null>;
}
/** Where a kept chain's links are at `t` (the two kept moments either side mixed), or null while it is not his. */
export function chainAt(tr: ChainTrack, t: number): ReadonlyArray<V3> | null {
  const f = (t - tr.t0) / SIM_KEEP;
  const n = tr.frames.length;
  if (n === 0) return null;
  if (f <= 0) return tr.frames[0];
  if (f >= n - 1) return tr.frames[n - 1];
  const i = Math.floor(f);
  const a = tr.frames[i];
  const b = tr.frames[i + 1];
  if (!a || !b) return a ?? b;
  const k = f - i;
  return a.map((q, j) => lerp3(q, b[j], k));
}
/**
 * A KEPT LOOP CLOSED: the chain's last moment made its first, the difference spread evenly over the
 * round (so a chain swinging round with a walk or a stand goes on round without a jump).
 */
export function closeLoop(frames: ReadonlyArray<ReadonlyArray<V3>>): ReadonlyArray<ReadonlyArray<V3>> {
  const n = frames.length - 1;
  if (n < 1) return frames;
  const first = frames[0];
  const last = frames[n];
  return frames.map((f, i) => f.map((q, j) => add(q, mul(sub(first[j], last[j]), i / n))));
}
