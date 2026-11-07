// THE WARLOCK BROUGHT UP (the art chat's helper, 7 Nov 2026; docs/mockups/warlock_up/README.md).
// A MOCK-UP BEHIND A SWITCH THAT IS OFF: `WARLOCK_UP`. Nothing of the game imports this file: the game's Warlock is exactly as he
// is (art/warlock_art.ts, his sculpt dev/sculpt_warlock.ts, his moves dev/warlock_*.ts and dev/demon_*.ts).
//
// HIS LOOK STAYS EXACTLY AS IT IS: sculpted already (dev/sculpt.ts), his look and every move given the owner's yes in the art chat
// (docs/mockups/classes/BRIEF.md on mockup/classes). The big man in the long dark coat, hunched and pained; the horned hood, two
// points of cyan for eyes; the spiked pauldron on his left shoulder; his left arm the demon's, red hide, spines and cracks of cyan
// light, its claws round a cyan hellfire; his right hand clamped on it; the red book chained at his right hip. This file paints
// that very sculpture, by its own painter (dev/sculpt_warlock.ts warlockSculpt, drawWarlockSculpt), only:
//   - FROM ALL EIGHT SIDES, EACH TRULY PAINTED, NONE FLIPPED (his rulebook's Heroes 7; the owner, 6 Nov: “Are you actually painting
//     8 drawings or flipping some?”, his pick “Paint all 8 (Recommended)”): the Warrior's eight (art/warrior_up.ts WuSide, WU_SPIN),
//     his figure truly turned under the game's camera (Sculpt.spin), so that the demon arm is his left, the pauldron on it, and the
//     book at his right hip, whichever way he faces. The three sides that face left are laid with his floor point 98 across his
//     canvas, as the Warrior's, the Ranger's and the Mage's.
//   - HIS BOOTS TO THE KNEE (the one change to how he is drawn, for his legs: the owner, of the Ranger's still, “Can you make sure
//     his leg ratio is correct cause it seems like all these guys have long upper legs and short legs below the knee”): the same
//     boots of hide, their tops brought up from below the middle of his shin to just under his knee, so where his coat opens (in
//     his run, flung open) the knee the eye sees is his knee and not a point 6.3 game pixels down his shin.
//   - on his moves re-posed where his legs need it (art/warlock_up_moves.ts).

import { CANVAS3 } from './skin';
import { add, dot, lerp3, mul, norm, sub } from './skeleton';
import type { Bones, Posed, Skeleton, V3 } from './skeleton';
import { solve, bonesAt } from './skeleton';
import type { Drawn, Sculpt } from '../dev/sculpt';
import { WARLOCK_SCULPT_BODY, drawWarlockSculpt, warlockSculpt } from '../dev/sculpt_warlock';
import { STANCE, withWarlockAt } from '../dev/warlock_moves';
import type { WarlockMove } from '../dev/warlock_moves';
import { WU_SIDES, WU_SPIN } from './warrior_up';
import type { WuSide } from './warrior_up';

/** THE SWITCH: off. The main chat's to turn on, on his yes to the pictures (and once his lists are brought up as well, stage 2). */
export const WARLOCK_UP = { on: false };

/** His sides: the Warrior's eight (art/warrior_up.ts). */
export type WlSide = WuSide;
export const WL_SIDES = WU_SIDES;

/** His build (dev/sculpt_warlock.ts): the knight's height, broad. */
export const WL_BODY = WARLOCK_SCULPT_BODY;

/**
 * HIS BOOTS TO THE KNEE: how far down his shin, from the knee joint, the top of each boot is (a share of knee to ankle). The game's
 * are 0.42 down (dev/sculpt_classes.ts tailorFor `boots`, high); these 0.1, just under the knee.
 */
export const WL_BOOT_TOP = 0.1;
/** Before (the game's high boot), for the pictures' before. */
export const WL_BOOT_TOP_BEFORE = 0.42;

/** What a painted frame of him is, for the checks and the pictures. */
export interface WlFrame {
  px: Drawn['px'];
  drawn: Drawn;
  sc: Sculpt;
  s: Skeleton;
  /** How far he was turned for the side he was seen from (degrees to his left). */
  spin: number;
  /** Where on his canvas the floor point under him is (WU_SPIN's `ax`: 98 for the three sides that face left), and its height. */
  ax: number;
  ay: number;
  /** The materials of his sculpture by what they are (for the measures and the checks): his coat, his trousers, his boots. */
  mats: { coat: number; trousers: number; boots: number };
}

/** His pose at a moment of a move (his moves' keys over his stance, as dev/warlock_moves.ts warlockPose). */
export function wlPose(m: WarlockMove, t: number): Posed {
  return bonesAt(m.motion.keys, STANCE, t);
}

const sig = (r: readonly string[]): string => r.join(',');

/**
 * HIM AT A MOMENT OF A MOVE, painted from one of his eight sides: his own sculpture (dev/sculpt_warlock.ts) on his own bones, the
 * coat's skirts trailing and the fire in his claws as the move has them (dev/warlock_moves.ts withWarlockAt), truly turned;
 * `boots`: how far down his shin his boot tops are (WL_BOOT_TOP; WL_BOOT_TOP_BEFORE, the game's, for a before).
 */
export function paintWarlockUp(m: WarlockMove, t: number, side: WlSide, boots = WL_BOOT_TOP): WlFrame {
  const { spin, ax } = WU_SPIN[side];
  return withWarlockAt(m, t, spin, () => {
    const q = wlPose(m, t);
    const ws = warlockSculpt('front', q as unknown as Bones, spin);
    const mats = matsOf(ws.sc);
    if (boots < WL_BOOT_TOP_BEFORE - 1e-6) {
      // HIS BOOTS TO THE KNEE: the same boot of hide carried up the shin over his trousers, a little fuller at its top as a boot's mouth is
      const B = WL_BODY;
      const [, lK, lA] = B.legR;
      for (const sd of ['L', 'R'] as const) {
        const knee = sd === 'L' ? ws.s.kneeL : ws.s.kneeR;
        const ankle = sd === 'L' ? ws.s.ankleL : ws.s.ankleR;
        // (over his trousers all the way down to where the game's boot is fuller than they are)
        ws.sc.cone(mats.boots, `leg${sd}`, lerp3(knee, ankle, boots), lerp3(knee, ankle, 0.78), lK * 0.98 + 1.15, lK + (lA - lK) * 0.78 + 0.95, 1.0, { tag: 'top' });
      }
    }
    if (boots < WL_BOOT_TOP_BEFORE - 1e-6) overWideFeet(ws.sc, ws.s);
    const drawn = drawWarlockSculpt(ws, undefined, { ...CANVAS3, ax });
    return { px: drawn.px, drawn, sc: ws.sc, s: ws.s, spin, ax, ay: CANVAS3.ay, mats };
  });
}

/**
 * HIS COAT HANGING OVER HIS LONGER STANCE (standing, his coat hangs closed, open down the front below the belt: dev/sculpt_warlock.ts).
 * His feet further apart, the coat's skirts are carried with them as a long coat is: their foot drawn back over his back leg and
 * flared out just enough that it hangs over it (his back leg inside it, never through it), and the opening down its front widened
 * to let his front leg through. Where his feet are as close as they were, nothing changes.
 */
function overWideFeet(sc: Sculpt, s: Skeleton): void {
  const skirt = sc.prims.find((p) => p.k === 'cone' && p.piece === 'skirt' && p.tag === 'skirt') as { a: V3; b: V3; ra: number; rb: number } | undefined;
  const slit = sc.prims.find((p) => p.k === 'box' && p.piece === 'skirt' && p.carve) as { c: V3; axes: [V3, V3, V3] } | undefined;
  if (!skirt || !slit) return;
  const fw = norm([s.hips[0][0], s.hips[0][1], 0]);
  const [, , lA] = WL_BODY.legR;
  // (his back ankle: the one further back along the way his hips face)
  const back = dot(sub(s.ankleL, s.ankleR), fw) < 0 ? s.ankleL : s.ankleR;
  const flat = (v: V3): V3 => [v[0], v[1], 0];
  const toBack = flat(sub(back, skirt.b));
  const far = Math.hypot(toBack[0], toBack[1]);
  const need = far + lA + 1.6;
  if (need > skirt.rb) {
    // (half of what it lacks made up by drawing its foot back toward that leg, half by flaring it)
    const shift = Math.min(far, (need - skirt.rb) * 0.6);
    skirt.b = add(skirt.b, mul(norm(toBack), shift));
    skirt.rb = Math.max(skirt.rb, need - shift);
    // (the opening down its front: as wide as his front leg at the knee and a little more, carried to its new hem)
    const [, , up] = slit.axes;
    const across = slit.axes[1];
    const w = Math.hypot(across[0], across[1], across[2]);
    const want = WL_BODY.legR[1] + 1.4;
    if (w < want) slit.axes = [slit.axes[0], mul(across, want / w), up];
  }
}

/** His coat (the first of the coat's cloth made), his trousers (the second), his boots (the first hide after them). */
function matsOf(sc: Sculpt): WlFrame['mats'] {
  const COAT = sig(['#0e0b1c', '#1e1832', '#322a50', '#4c4270', '#6c6094']);
  const HIDE = sig(['#1e1018', '#3a2026', '#64382e', '#94583c', '#b8784e']);
  const coat = sc.mats.findIndex((m) => sig(m.ramp) === COAT);
  const trousers = sc.mats.findIndex((m, i) => i > coat && sig(m.ramp) === COAT);
  const boots = sc.mats.findIndex((m, i) => i > trousers && sig(m.ramp) === HIDE);
  return { coat, trousers, boots };
}

/** His skeleton at a moment of a move (no painting). */
export function wlSkeleton(m: WarlockMove, t: number): Skeleton {
  return solve(WL_BODY, wlPose(m, t));
}
