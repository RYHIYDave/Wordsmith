// THE CHECKS A SCULPTED FIGURE GOES THROUGH, IN ONE PICTURE AND IN ITS SOLIDS (dev/sculpt.ts): shared by the tests of the
// new classes standing (tests/classes_sculpt.test.ts) and moving (tests/brawler_moves.test.ts). His art rulebook's Pixels 1
// and 5, Colour 3, Heroes 6 and Movement 8, as the heroes had them on 8 Oct.

import { FRIEND_RIM } from '../src/art/hero3_knight';
import { RIM_ALPHA } from '../src/art/kit';
import type { Px } from '../src/engine/px';
import { primDist, primLow } from '../src/dev/sculpt';
import type { Prim, Sculpt } from '../src/dev/sculpt';
import { hsv, rgb } from './floor_checks';

const FRIEND = rgb(FRIEND_RIM);
/** Everything the checks find wrong with one picture of a figure. */
export function pictureFindings(px: Px): string[] {
  const out: string[] = [];
  const { w, h, d } = px;
  let x0 = w;
  let x1 = -1;
  let y0 = h;
  let y1 = -1;
  let fuzzy = 0;
  let wrongRim = 0;
  let alone = 0;
  let pink = 0;
  const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] === 255;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const a = d[i + 3];
      if (a === 0) continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
      if (a !== 255 && a !== RIM_ALPHA) fuzzy++;
      if (a === RIM_ALPHA && (d[i] !== FRIEND[0] || d[i + 1] !== FRIEND[1] || d[i + 2] !== FRIEND[2])) wrongRim++;
      if (a === 255) {
        if (!solid(x - 1, y) && !solid(x + 1, y) && !solid(x, y - 1) && !solid(x, y + 1)) alone++;
        const [hu, s, v] = hsv(d[i], d[i + 1], d[i + 2]);
        if (hu >= 320 && hu <= 352 && s > 0.55 && v > 0.62) pink++;
      }
    }
  }
  if (x1 < 0) return ['nothing painted'];
  if (fuzzy) out.push(`${fuzzy} pixels neither there nor not`);
  if (wrongRim) out.push(`${wrongRim} pixels of its edge not the friend's cyan`);
  if (alone) out.push(`${alone} pixels alone`);
  if (pink) out.push(`${pink} pixels of the enemy's pink`);
  if (x0 < 2 || y0 < 2 || x1 > w - 3 || y1 > h - 3) out.push(`cut off at its picture's edge (${x0},${y0} to ${x1},${y1} of ${w} by ${h})`);
  return out;
}
const TRUNK = new Set(['ribs', 'yoke', 'belly', 'pec', 'lat', 'bust', 'chest', 'hump', 'pelvis', 'abs', 'waist', 'drum', 'shell']);
const LIMB = new Set(['upper', 'fore', 'finger', 'gauntlet', 'wrist', 'thigh', 'shin', 'shank', 'pastern', 'calf', 'quad']);
/** Points along a solid's line (a rod's), from `from` of the way along it to its end. */
function along(p: Prim, from: number): [number, number, number][] {
  if (p.k !== 'cone') return [];
  const out: [number, number, number][] = [];
  for (let k = 0; k <= 4; k++) {
    const t = from + ((1 - from) * k) / 4;
    out.push([p.a[0] + (p.b[0] - p.a[0]) * t, p.a[1] + (p.b[1] - p.a[1]) * t, p.a[2] + (p.b[2] - p.a[2]) * t]);
  }
  return out;
}
/** Everything the checks find wrong with the solids of one figure: its body clean, its feet on the floor. */
export function bodyFindings(sc: Sculpt, body: boolean): string[] {
  const out: string[] = [];
  const solids = sc.prims.filter((p) => !p.carve);
  // NOTHING SINKS INTO THE FLOOR; SOMETHING STANDS ON IT
  const lows = solids.map((p) => [primLow(p), p] as const);
  const sunk = lows.filter(([z]) => z < -0.35);
  if (sunk.length) out.push(`sunk into the floor: ${sunk.map(([z, p]) => `${p.piece}/${p.tag ?? p.k} to ${z.toFixed(2)}`).join(', ')}`);
  const lowest = Math.min(...lows.map(([z]) => z));
  if (lowest > 1.2) out.push(`standing on nothing: its lowest point ${lowest.toFixed(2)} over the floor`);
  if (!body) return out;
  // CLEAN BODIES: no arm's line inside the trunk; no leg's line inside the other leg
  const trunk = solids.filter((p) => TRUNK.has(p.tag ?? '') && (p.piece === 'torso' || p.piece === 'hips'));
  for (const p of solids) {
    if (!p.piece.startsWith('arm') || !LIMB.has(p.tag ?? '')) continue;
    for (const q of along(p, p.tag === 'upper' ? 0.5 : 0)) {
      const inside = Math.min(...trunk.map((t) => primDist(t, q)));
      if (inside < -1.0) out.push(`${p.piece}'s ${p.tag} through the trunk (${inside.toFixed(2)} inside)`);
    }
  }
  for (const [mine, other] of [['legL', 'legR'], ['legR', 'legL']] as const) {
    const others = solids.filter((p) => p.piece === other && LIMB.has(p.tag ?? ''));
    for (const p of solids) {
      if (p.piece !== mine || !LIMB.has(p.tag ?? '')) continue;
      for (const q of along(p, 0.15)) {
        const inside = Math.min(...others.map((t) => primDist(t, q)));
        if (inside < -0.5) out.push(`${mine}'s ${p.tag} through ${other} (${inside.toFixed(2)} inside)`);
      }
    }
  }
  return [...new Set(out)];
}

export const HEIGHT = (px: Px): number => {
  let top = -1;
  let low = -1;
  for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) if (px.d[(y * px.w + x) * 4 + 3] === 255) {
    if (top < 0) top = y;
    low = y;
  }
  return low - top + 1;
};

