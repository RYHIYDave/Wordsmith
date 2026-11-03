// HER VINE: THE ONE RECIPE for the Princess's whip (art/princess.ts), her snare's cage (art/princess_fx.ts), and her vines
// in the gardens (art/floor16.ts), so that they match. His words to the art chat, 28 Oct: “Can you put some of these vines
// into the map as well?  Around where the hushed gardeners are at.  So you’re like “huh those vines are weird” then the
// boss has the big vine”, “Once we lock in the look.  So they match”. Of the whip as it was: “I thought it was a long
// green snake.  Didn’t really read as vine”. Of the vine as it is here, asked whether it read as a vine now: “Yes, lock it
// (Recommended)”.
//
// A VINE, NOT A SNAKE: a dark olive-brown wood with two strands twisted round it, one paler, so the twist shows; knots
// every few lengths; big bright nettle leaves in pairs all down it, each pair turned from the last, hanging with their
// weight; tendrils on stalks, curled a turn and a half; a few hooked pale thorns under it. Each painter hands its own
// brush (her figure's parts, or a place's scene); the shapes are the same.
//
// Nothing of the game imports this file's users; this file is only the vine's shape and colours.

import { hash } from './kit';
import type { Ramp } from './kit';
import { add, cross, dot, lerp3, mul, norm, sub } from './skeleton';
import type { V3 } from './skeleton';

/** Its wood, a dark olive going brown; the paler strand twisted round it. */
export const VINE_WOOD: Ramp = ['#17150c', '#2a2618', '#403a24', '#5a5232', '#766c44'];
export const VINE_WOOD_PALE: Ramp = ['#2a2618', '#403a24', '#5e5636', '#80784e', '#a49c6c'];
/** Its leaves and tendrils, a bright green, so it reads against the lawn as a vine. */
export const VINE_LEAF: Ramp = ['#1d3818', '#2d5824', '#468034', '#68a448', '#92c866'];
/** Its thorns, pale. */
export const VINE_THORN: Ramp = ['#3a3a30', '#6a6a58', '#a8a890', '#d8d6c0', '#f0eee0'];

/** How a painter lays the vine's shapes. */
export interface VineBrush {
  /** A length of its wood, as thick at both ends: `ramp` the core's or a strand's. */
  wood(a: V3, b: V3, r: number, ramp: Ramp): void;
  /** A knot in it. */
  knot(c: V3, r: number): void;
  /** A leaf out from `at` along `out`, `size` long (`leafShape`). */
  leaf(at: V3, out: V3, size: number, seed: number): void;
  /** A length of a tendril. */
  tendril(a: V3, b: V3, ra: number, rb: number): void;
  /** A thorn from its foot to its tip. */
  thorn(a: V3, b: V3): void;
  /** The tip of a thorn that is tipped (only her own: the gardens' have none). */
  tip?(p: V3): void;
}

/**
 * HER VINE through the points `v`, `ra` thick at its root, thinning to its tip. `across`: the way across the picture (her
 * figure's and a place's are not the same), so a tendril's curl shows. `bare`: withered, its leaves still on it but
 * nothing else.
 */
export function herVine(v: ReadonlyArray<V3>, ra: number, seed: number, brush: VineBrush, across: V3, bare = false): void {
  const n = v.length;
  // (its line, four times as fine, for the twist)
  const fine: V3[] = [];
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < 4; j++) fine.push(lerp3(v[i], v[i + 1], j / 4));
  fine.push(v[n - 1]);
  const frameAt = (pts: ReadonlyArray<V3>, i: number): { dir: V3; side: V3; up: V3 } => {
    const dir = norm(sub(pts[Math.min(pts.length - 1, i + 1)], pts[Math.max(0, i - 1)]), [1, 0, 0]);
    const side = norm(cross(dir, [0, 0, 1]), [0, 1, 0]);
    return { dir, side, up: norm(cross(side, dir), [0, 0, 1]) };
  };
  let long = 0;
  for (let i = 1; i < n; i++) long += Math.hypot(...sub(v[i], v[i - 1]));
  const turns = Math.max(2, long / 22);
  // THE WOOD: a dark core, and two strands twisted round it, one paler, so the twist shows
  for (let i = 1; i < fine.length; i++) {
    const u = i / (fine.length - 1);
    brush.wood(fine[i - 1], fine[i], ra * (1 - 0.4 * u) * 0.8, VINE_WOOD);
  }
  for (let j = 0; j < 2; j++) {
    let prev: V3 | null = null;
    for (let i = 0; i < fine.length; i++) {
      const u = i / (fine.length - 1);
      const f = frameAt(fine, i);
      const w = ra * (1 - 0.4 * u);
      const ph = j * Math.PI + u * Math.PI * 2 * turns + seed;
      const p = add(fine[i], add(mul(f.side, Math.cos(ph) * w * 0.55), mul(f.up, Math.sin(ph) * w * 0.55)));
      if (prev) brush.wood(prev, p, w * 0.5, j ? VINE_WOOD_PALE : VINE_WOOD);
      prev = p;
    }
  }
  // its knots
  for (let i = 3; i < n - 1; i += 4) brush.knot(v[i], ra * 1.3 * (1 - 0.4 * (i / (n - 1))));
  // ITS LEAVES, in pairs all down it, each pair turned from the last; bright, big, hanging with their weight
  for (let i = 1; i < n; i++) {
    const u = i / (n - 1);
    const f = frameAt(v, i);
    const turn = (i % 2) * 1.1;
    for (const sgn of [1, -1]) {
      const out = norm(add(mul(f.side, sgn * Math.cos(turn)), add(mul(f.up, 0.35 + 0.5 * Math.sin(turn) * sgn), mul(f.dir, 0.45))));
      brush.leaf(v[i], out, (4.2 + 1.6 * Math.min(1, ra / 2)) * (1 - 0.3 * u), seed + i * 2 + (sgn > 0 ? 0 : 1));
    }
  }
  if (bare) return;
  // its tendrils: a stalk up off it, then a curl of a turn and a half (curled across the view, so the curl shows)
  for (let i = 2; i < n - 1; i += 3) {
    const f = frameAt(v, i);
    const sgn = i % 2 ? 1 : -1;
    const top = add(v[i], add(mul(f.side, sgn * 1.5), mul(f.up, 6)));
    brush.tendril(v[i], top, 0.6, 0.5);
    let prev = top;
    for (let k = 1; k <= 12; k++) {
      const a = k * 0.8;
      const r = 3.6 * (1 - k / 16);
      const p = add(top, add(mul(across, sgn * (r - r * Math.cos(a))), mul(f.up, r * Math.sin(a))));
      brush.tendril(prev, p, 0.5, 0.45);
      prev = p;
    }
  }
  // a few hooked thorns, pale, every other one tipped (where the brush tips them)
  for (let i = 1; i < n; i += 2) {
    const f = frameAt(v, i);
    const sgn = i % 4 === 1 ? -1 : 1;
    const base = add(v[i], add(mul(f.up, -ra * 0.5), mul(f.side, sgn * ra * 0.5)));
    const tipP = add(base, add(mul(f.side, sgn * 2.4), add(mul(f.up, -2.2), mul(f.dir, -1.4))));
    brush.thorn(base, tipP);
    if (i % 4 === 1 && brush.tip) brush.tip(tipP);
  }
}

/**
 * A NETTLE LEAF'S SHAPE: a pointed oval out from `at` along `out`, its tip drooping along `down` (fluttering at `t`), `size`
 * long: its middle `c`, its axes `A` (along it, across it, through it) and its half-sizes `r` along them. A leaf whose
 * stalk lies along the floor lies on the floor, not in it.
 */
export function leafShape(at: V3, out: V3, down: V3, size: number, t: number, seed: number): { c: V3; A: [V3, V3, V3]; r: V3 } {
  const o = norm(out, [0, 0, 1]);
  const d = norm(sub(down, mul(o, dot(down, o))), [0, 0, -1]);
  const flutter = 0.25 * Math.sin(t * 5 + seed);
  const along = norm(add(o, mul(d, 0.6 + flutter)));
  const c0 = add(at, mul(along, size * 0.9));
  const acrossIt = norm(cross(along, d), [1, 0, 0]);
  const A: [V3, V3, V3] = [along, acrossIt, norm(cross(along, acrossIt), [0, 0, 1])];
  const r: V3 = [size, size * 0.55, 0.35];
  const low = c0[2] - Math.hypot(A[0][2] * r[0], A[1][2] * r[1], A[2][2] * r[2]);
  return { c: low < 0.2 ? [c0[0], c0[1], c0[2] + 0.2 - low] : c0, A, r };
}
/** A NETTLE LEAF'S FACE at `u` (its own axes, -1..1) turned to the light `tone` (0..4): its toothed edge (null, nothing there), its pale vein. */
export function leafFace(u: readonly number[], tone: number, seed: number, ramp: Ramp): string | null {
  const r = Math.hypot(u[0], u[1]);
  if (r > 0.82 && hash(Math.round(Math.atan2(u[1], u[0]) * 4), seed, 7501) < 0.4) return null;
  if (Math.abs(u[1]) < 0.08 && u[0] > -0.6) return ramp[Math.min(4, tone + 1)];
  return ramp[Math.max(1, tone)];
}
