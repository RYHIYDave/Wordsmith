// THE STONE OF ACT 1'S FIGURES (the Unfinished, the quarry golem): blocks of the quarry's stone as a figure's
// solids, each face a flat panel lit as one, and the raw stone's facets, scoring, pocks and drill holes.

import { hash } from './kit';
import type { Ramp } from './kit';
import type { Put } from './new_mobs3';
import { add, cross, dot, mul, norm, sub } from './skeleton';
import type { V3 } from './skeleton';

const fr = (t: number): number => t - Math.floor(t);

/** The raw stone: the same limestone as it came out of the bed, a little greyer, never rubbed. */
export const RAW: Ramp = ['#463e4c', '#463e4c', '#8d8381', '#b3a99d', '#b3a99d'];
/** The deep of a drill hole or a cut. */
export const HOLE = '#1f1826';

/** A face of a block: which (0 +F, 1 -F, 2 +L, 3 -L, 4 +U, 5 -U), `a` and `b` across it (the figure's lengths, from its middle), the light on it. */
export type FaceSkin = (face: number, a: number, b: number, tone: number) => string | null;
/**
 * THE RAW STONE ON A BLOCK'S FACE: each face broken into two or three flat planes a tone apart, the
 * claw's scored lines slanting across, the point's pocks, its edges knocked (a tone lighter where the
 * light catches them); `holes`: a row of drill holes on that face, where it says.
 */
export function rawFace(seed: number, holes?: (face: number, a: number, b: number) => boolean): FaceSkin {
  return (face, a, b, tone) => {
    if (holes && holes(face, a, b)) return HOLE;
    // (its planes: slanting, of no one size, as the point took the stone off)
    const ca = Math.floor((a + b * 0.55 + hash(face, 1, seed) * 9) / (8 + hash(face, 2, seed) * 5));
    const cb = Math.floor((b - a * 0.35 + hash(face, 3, seed) * 9) / (10 + hash(face, 4, seed) * 6));
    const k = hash(ca * 5 + face, cb, seed);
    let t = tone + (k > 0.78 ? 1 : k < 0.18 ? -1 : 0);
    if (fr((a * 0.6 + b) / 5.2 + seed * 0.17) < 0.09) t -= 1;
    if (hash(Math.floor(a / 1.6), Math.floor(b / 1.6) * 31 + face, seed + 3) > 0.96) t = Math.min(t, 1);
    return RAW[Math.max(0, Math.min(4, t))];
  };
}
/**
 * A BLOCK of the raw stone, turned as `A` (its forward, left and up: right-handed), its half-sizes `h`:
 * each face a flat panel lit as one, as a block cut from the bed is.
 */
export function block(put: Put, part: string, piece: string, c: V3, A: readonly [V3, V3, V3], h: V3, skin: FaceSkin): void {
  for (let k = 0; k < 3; k++) {
    const k1 = (k + 1) % 3;
    const k2 = (k + 2) % 3;
    for (const sgn of [1, -1] as const) {
      const face = k * 2 + (sgn > 0 ? 0 : 1);
      const fc = add(c, mul(A[k], sgn * h[k]));
      // (its two edges ordered so that the panel's own normal is the face's outward one)
      const U = mul(A[sgn > 0 ? k1 : k2], h[sgn > 0 ? k1 : k2]);
      const V = mul(A[sgn > 0 ? k2 : k1], h[sgn > 0 ? k2 : k1]);
      put(part, piece, { k: 'panel', c: fc, u: U, v: V, skin: (a, b, front, tone) => (front ? skin(face, a, b, tone) : null) });
    }
  }
}
/** A frame along a limb from `from` to `to` (its up, toward `from`), facing as near `fwd` as it can. */
export function limbFrame(from: V3, to: V3, fwd: V3): [V3, V3, V3] {
  const U = norm(sub(from, to), [0, 0, 1]);
  const F = norm(sub(fwd, mul(U, dot(fwd, U))), [1, 0, 0]);
  return [F, cross(U, F), U];
}

