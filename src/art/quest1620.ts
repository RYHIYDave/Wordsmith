// THE QUEST LINE OF FLOORS 16 TO 20 (game/quests1620.ts, QUESTS1620): what it lays on the floor, SCULPTED as the 11-to-15
// quests' things are (art/quest1115.ts; art/act2_kit.ts: built in depth, 40 units to a tile, pixel art at two picture pixels
// to a game pixel, seams in deep indigo, lit from the upper left), in the clockwork songbird's own gold and steel (art/floor19.ts).
//   THE SONGBIRD'S KEY (the Prince's, floor 17): a little golden winding key lying on the floor, its bow two rounded wings
//     with a sapphire set where they meet, its shaft ending in the square socket that winds the bird; a breath of the
//     friend's cyan round it (a quest's thing, his rulebook: what glows on a friend is cyan); a soft shadow under it.
//   THE SONGBIRD'S SPRING (the Queen's, floor 18): its mainspring, a ribbon of blued steel wound flat in a tight coil, its
//     outer end sprung loose and lying out across the floor, the hook at its heart; the same breath of cyan; a soft shadow.
// The broken bird itself is the art chat's (art/floor19.ts songbird); the knight-captain is the Keep's knight (the bestiary's
// kknight); the captain's jar, the Crier's jar (art/floor12.ts criersJar).

import type { Sprite } from '../engine/px';
import { SOFT_ID, checker, done, scene } from './act2_kit';
import { toneAt } from './floor4';
import type { V3 } from './floor4';
import type { Ramp } from './kit';
import { CYAN } from './kit';
import { GOLD, STEEL } from './floor19';

let KEY: Sprite | null = null;
let SPRING: Sprite | null = null;

/** The soft shadow on the floor (as art/quest1115.ts). */
const SHADOW = '#08060c';
const SAPPHIRE = '#3c4a8a';
const SAPPHIRE_HI = '#7c8ad0';
/** Blued steel: the spring's temper, the floor's steel a breath toward blue. */
const BLUED: Ramp = [STEEL[0], '#3c4660', '#5e6c8e', '#8c9cc0', '#c8d2e8'];

/** The songbird's key, lying on the floor (anchored where its middle lies). */
export function keySprite(): Sprite {
  if (KEY) return KEY;
  const S = scene(80, 52, 40, 30);
  // (it lies across the screen: along the world's +x and -y, the bow to the left; drawn at K times the first size, to read)
  const K = 1.45;
  const dx = 0.8;
  const dy = -0.6;
  const side: V3 = [-dy, dx, 0];
  const at = (a: number, b: number, z: number): V3 => [(a * dx + b * side[0]) * K, (a * dy + b * side[1]) * K, z * K];
  const bowC = at(-7, 0, 1.4);
  const tip = at(9, 0, 1.2);
  // its shadow on the floor
  S.quad([[-22, -22, 0.05], [22, -22, 0.05], [22, 22, 0.05], [-22, 22, 0.05]], (_u, _v, w) => {
    const a = (w[0] * dx + w[1] * dy) / K - 0.6;
    const b = (w[0] * side[0] + w[1] * side[1]) / K - 0.6;
    const wing = Math.hypot((a + 7) / 4.6, Math.abs(b) - 2.6 < 0 ? 0 : (Math.abs(b) - 2.6) / 2.6) < 1 && Math.abs(b) < 6.2;
    const shaft = a > -4 && a < 10.5 && Math.abs(b) < 1.6;
    return (wing || shaft) && checker(S, w) ? SHADOW : null;
  }, SOFT_ID + 1);
  // its bow: two rounded wings, flat on the floor, either side of the shaft
  for (const s of [-1, 1]) {
    S.egg(at(-7.4, s * 3.1, 1.2), [[dx, dy, 0], side, [0, 0, 1]], [3.6 * K, 3 * K, 1.1 * K], (n, w) => {
      // (each wing pierced: a hole through it, the floor's dark showing)
      const c = at(-7.8, s * 3.5, 0);
      if (Math.hypot(w[0] - c[0], w[1] - c[1]) < 1.1 * K) return null;
      return toneAt(n, GOLD, 0.2);
    }, 1);
  }
  // the boss where the wings meet, a sapphire set in it
  S.egg(bowC, [[dx, dy, 0], side, [0, 0, 1]], [2.2 * K, 2.2 * K, 1.6 * K], (n, w) => (Math.hypot(w[0] - bowC[0], w[1] - bowC[1]) < 1.1 * K && w[2] > 2.2 * K ? (n[0] + n[1] < -0.2 ? SAPPHIRE_HI : SAPPHIRE) : toneAt(n, GOLD, 0.25)), 2);
  // the shaft, a collar on it, and the square socket that winds the bird
  S.rod(at(-5, 0, 1.3), tip, 0.9 * K, 0.9 * K, GOLD, 3);
  S.ball(at(-3.6, 0, 1.3), 1.4 * K, GOLD, 4, undefined, 0.2);
  S.box(at(9.6, 0, 1.4), [[dx, dy, 0], side, [0, 0, 1]], [1.6 * K, 1.4 * K, 1.4 * K], (f, _u, _v, n) => (f === 0 ? GOLD[0] : toneAt(n, GOLD, 0.1)), 5);
  KEY = done(S, 40, 30, [{ at: bowC, r: 9, color: CYAN[2], a: 0.14 }]);
  return KEY;
}

/** The songbird's mainspring, lying on the floor (anchored where its coil's heart lies). */
export function springSprite(): Sprite {
  if (SPRING) return SPRING;
  const S = scene(84, 52, 38, 28);
  const turns = 2.4;
  const steps = 110;
  const r0 = 2;
  const r1 = 11;
  const ptAt = (t: number): V3 => {
    const a = t * turns * Math.PI * 2;
    const r = r0 + (r1 - r0) * t;
    return [Math.cos(a) * r, Math.sin(a) * r, 1];
  };
  // (its outer end sprung loose, running out across the floor, a little hooked at the last)
  const end = ptAt(1);
  const loose: V3[] = [end, [end[0] + 4, end[1] - 3, 1], [end[0] + 8, end[1] - 4, 1], [end[0] + 11.5, end[1] - 3.2, 1.2], [end[0] + 12.6, end[1] - 1.4, 1.8]];
  // its shadow on the floor: under the coil, and under the loose end
  S.quad([[-16, -16, 0.05], [28, -16, 0.05], [28, 16, 0.05], [-16, 16, 0.05]], (_u, _v, w) => {
    const coil = Math.hypot(w[0] - 0.8, w[1] - 0.8) < r1 + 1.2;
    let near = false;
    for (let i = 0; i < loose.length - 1 && !near; i++) {
      const a = loose[i];
      const b = loose[i + 1];
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const k = Math.max(0, Math.min(1, ((w[0] - a[0] - 0.7) * (b[0] - a[0]) + (w[1] - a[1] - 0.7) * (b[1] - a[1])) / (L * L)));
      near = Math.hypot(w[0] - 0.7 - a[0] - (b[0] - a[0]) * k, w[1] - 0.7 - a[1] - (b[1] - a[1]) * k) < 1.1;
    }
    return (coil || near) && checker(S, w) ? SHADOW : null;
  }, SOFT_ID + 1);
  // the coil: a flat ribbon of steel, wound tight, each turn a little apart from the last (the floor's dark between them)
  for (let i = 0; i < steps; i++) {
    const a = ptAt(i / steps);
    const b = ptAt((i + 1) / steps);
    S.rod(a, b, 0.95, 0.95, BLUED, 1);
  }
  // the loose end
  for (let i = 0; i < loose.length - 1; i++) S.rod(loose[i], loose[i + 1], 0.95, 0.95, BLUED, 2);
  // the arbor at its heart, the spring's inner end hooked on it
  S.ball([0, 0, 1.6], 1.6, STEEL, 3, undefined, 0.2);
  SPRING = done(S, 38, 28, [{ at: [0, 0, 1], r: 11, color: CYAN[2], a: 0.14 }]);
  return SPRING;
}

/** Forget what was made (a test's painting without a canvas). */
export function forgetQuest1620Art(): void {
  KEY = null;
  SPRING = null;
}
