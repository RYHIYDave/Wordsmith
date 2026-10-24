// THE BRAWLER MOVING (the art chat, 24 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His brief, 23 Oct (Pacific), by 22:07: “Bare-knuckle boxer” (jabs, hooks and uppercuts; footwork and combos); “Light and
// bouncy” (always on his toes, darting in and out); “Bone-crunching (Recommended)” (fewer, huge blows: a freeze, a
// shockwave and a screen kick on each); standing still, “Cocky, taunting (Recommended)”. Asked what next, 24 Oct, by 12:43:
// “Animate the brawler (Recommended)”. His art rulebook: Animations 1, “as big and wild and kinetic and weighty as
// possible”; Movement: weight first, every blow winds up and follows through, loose things follow, alive when still, feet
// grip the floor.
//
// His moves are keys of the heroes' own bones (art/skeleton.ts Key3, bonesAt), as the knight's are (art/moves3.ts), drawn
// by the brawler's sculpt (dev/sculpt_classes.ts sculptBrawler) a frame at a time; his coat's tails trail his body
// (COAT_SWING).

import { HEAD_B, run } from '../art/moves3';
import type { Gait } from '../art/moves3';
import { bonesAt, buildOf, solve } from '../art/skeleton';
import type { Bones, Build, Key3, Motion, Posed, V3 } from '../art/skeleton';
import { BRAWLER_BUILD, BRAWLER_LOOKS, COAT_SWING, boxerStance, sculptBrawler } from './sculpt_classes';
import type { Drawn } from './sculpt';
import type { GameView } from '../art/skin';

const FR = 1 / 30;
void FR;

/** His build (his pick, B) and his stance: what every key of his starts from. */
export const BRAWLER_B: Build = (() => {
  const L = BRAWLER_LOOKS[BRAWLER_BUILD];
  return buildOf(L.tall, HEAD_B * L.head, L.shape);
})();
export const GUARD: Bones = boxerStance(BRAWLER_B);
const T = BRAWLER_B.tall / 57;

/** Up `k` of the way onto his toes (0 his stance, 1 high, below 0 sunk into his knees): the body and both feet together. */
function onHisToes(k: number): Partial<Bones> {
  const up = 2.8 * T * k;
  if (k <= 0) return { pz: GUARD.pz + up };
  return planted({ pz: GUARD.pz + up, lfz: GUARD.lfz + up, rfz: GUARD.rfz + up });
}
/**
 * THE TIPS OF HIS FEET STAY WHERE THEY STAND (Movement 8): an ankle lifted, its foot is tipped down onto its toes just so far
 * that the toe stays on the floor, and the ankle moved over by as much as the tipping carries the toe, so it stays put.
 */
function planted(feet: Partial<Bones>, at: Bones = GUARD): Partial<Bones> {
  const want = solve(BRAWLER_B, at);
  const out = { ...feet };
  for (const side of ['l', 'r'] as const) {
    const toe = side === 'l' ? 'toeL' : 'toeR';
    const fx = `${side}fx` as const;
    const fy = `${side}fy` as const;
    const fp = `${side}fp` as const;
    // (the tip that brings the toe down to where it stood: found by halving, the toe's place kept as it goes)
    let lo = at[fp];
    let hi = 89;
    for (let i = 0; i < 26; i++) {
      out[fp] = (lo + hi) / 2;
      for (let j = 0; j < 3; j++) {
        const got = solve(BRAWLER_B, { ...at, ...out } as Posed);
        out[fx] = (out[fx] ?? at[fx]) - (got[toe][0] - want[toe][0]);
        out[fy] = (out[fy] ?? at[fy]) - (got[toe][1] - want[toe][1]);
      }
      const z = solve(BRAWLER_B, { ...at, ...out } as Posed)[toe][2];
      if (z > want[toe][2]) lo = out[fp] as number;
      else hi = out[fp] as number;
    }
  }
  return out;
}

/**
 * STANDING, COCKY AND TAUNTING, LIGHT ON HIS TOES (a 3.2 s round): he bounces, four bounces, his shoulders rolling, his
 * fists bobbing late behind his body; then he drops his hands to his hips, juts his chin out at you, waggles his head and
 * shuffles his feet, quick as a dancer (come on, hit me); then the guard snaps back up and he bounces on.
 */
export function brawlerStand(): Motion {
  const keys: Key3[] = [];
  const add = (at: number, pose: Partial<Bones>, ease: Key3['ease'] = 'io'): void => {
    keys.push({ at, pose, ease });
  };
  add(0, { ...onHisToes(0) });
  // FOUR BOUNCES: up on his toes and down into his knees, the fists a beat behind
  for (let i = 0; i < 4; i++) {
    const t0 = i * 0.4;
    const roll = i % 2 ? -1 : 1;
    add(t0 + 0.2, { ...onHisToes(1), twist: GUARD.twist + 5 * roll, side: 3 * roll, lhz: GUARD.lhz - 1.3, rhz: GUARD.rhz - 1.0, faceTilt: -3 * roll }, 'out');
    add(t0 + 0.4, { ...onHisToes(-0.45), twist: GUARD.twist, lhz: GUARD.lhz + 1.0, rhz: GUARD.rhz + 0.8 }, 'in');
  }
  // THE TAUNT: hands dropped to his hips, chin out at you, his whole body swaying side to side on his toes (come on, hit
  // me). (His hands go down and come back up out in front of him, the arms long: not past his shoulders, where an elbow
  // would kick up.)
  const low: Partial<Bones> = {
    lhIn: 0, lhx: 3.4 * T, lhy: 3.2 * T, lhz: -13.5 * T, le: 30,
    rhIn: 0, rhx: 2.6 * T, rhy: -3.4 * T, rhz: -13.5 * T, re: 30,
    bend: 2, pitch: -4, faceUp: 12,
  };
  const mid: Partial<Bones> = { lhIn: 0, lhx: 9.0 * T, lhy: 2.2 * T, lhz: -6.5 * T, le: 26, rhIn: 0, rhx: 7.2 * T, rhy: -3.2 * T, rhz: -7.0 * T, re: 22 };
  add(1.72, { ...onHisToes(0.35), ...mid, twist: GUARD.twist - 3, faceUp: 6 }, 'io');
  add(1.86, { ...onHisToes(0.6), ...low, twist: GUARD.twist - 6, faceTilt: 4 }, 'out');
  const sway = (k: number, up: number): Partial<Bones> => ({
    ...onHisToes(up),
    ...low,
    twist: GUARD.twist - 6 + 6 * k, side: 7 * k, py: 1.3 * k * T, faceTilt: 14 * k, faceTurn: GUARD.faceTurn - 8 * k,
  });
  add(2.02, sway(-1, 0.8), 'io');
  add(2.18, sway(1, 0.45), 'io');
  add(2.34, sway(-1, 0.8), 'io');
  add(2.48, sway(0, 0.5), 'io');
  // the guard comes back up, and a bounce home
  add(2.6, { ...onHisToes(0.1), ...mid, faceUp: 4 }, 'in');
  add(2.72, { ...onHisToes(-0.4), lhz: GUARD.lhz + 0.8, rhz: GUARD.rhz + 0.6 }, 'out');
  add(2.96, { ...onHisToes(1) }, 'out');
  add(3.2, { ...onHisToes(0) }, 'in');
  return { keys, loop: 0 };
}

/** How long two steps of his footwork take: fourteen frames at 30 a second (quick steps). */
export const RUN_ROUND = 14 / 30;
/** HIS FOOTWORK, light and bouncy: a run on the balls of his feet, his fists up in his guard bobbing with each step. */
const BRAWLER_GAIT: Gait = {
  reach: 5.8, push: 7.4, kick: 6.0, lean: 8, hunch: 7, sink: 2.0, bob: 2.6, hips: 8, counter: -0.6, yaw: -18, twist: 6, look: 0,
  arms: (swing, step) => ({
    lhIn: 0, lhx: GUARD.lhx - 1.2 + swing * 1.4, lhy: GUARD.lhy, lhz: GUARD.lhz + 0.8 * Math.cos(step * Math.PI * 2), le: GUARD.le,
    rhIn: 0, rhx: GUARD.rhx - swing * 1.2, rhy: GUARD.rhy, rhz: GUARD.rhz + 0.6 * Math.cos(step * Math.PI * 2), re: GUARD.re,
  }),
};
export function brawlerRun(): Motion {
  return run(BRAWLER_GAIT, RUN_ROUND);
}

/** A move of his, ready to draw: its keys, how long it is, and whether it goes round. */
export interface BrawlerMove {
  name: string;
  motion: Motion;
  long: number;
  loops: boolean;
  /** How fast the game carries him across the floor while it plays (tiles a second; 0 for none): his coat blown back by it. */
  travel?: number;
}
export function brawlerMoves(): BrawlerMove[] {
  return [
    { name: 'Standing: cocky, on his toes', motion: brawlerStand(), long: 3.2, loops: true },
    { name: 'Footwork: light and bouncy', motion: brawlerRun(), long: RUN_ROUND, loops: true, travel: 4 },
  ];
}

/** His pose at a moment of a move. */
export function brawlerPose(m: Motion, t: number): Posed {
  return bonesAt(m.keys, GUARD, t);
}

/**
 * Draw him at a moment of a move, his coat's tails trailing behind where his body has been: they hang from where his hips
 * were `LAG` seconds ago, as cloth does (Movement 4, “Loose things follow”).
 */
const LAG = 0.12;
export function drawBrawlerAt(view: GameView, m: Move, t: number, turn = 0): Drawn {
  const pose = brawlerPose(m.motion, t);
  const before = brawlerPose(m.motion, m.loops ? (((t - LAG) % m.long) + m.long) % m.long : Math.max(0, t - LAG));
  const now = solve(BRAWLER_B, pose).pelvis;
  const was = solve(BRAWLER_B, before).pelvis;
  const blown = (m.travel ?? 0) * 0.9;
  const v: V3 = [(was[0] - now[0]) * 1.4 - blown, (was[1] - now[1]) * 1.4, (was[2] - now[2]) * 0.8 + blown * 0.25];
  const cap = 4.5;
  const n = Math.hypot(v[0], v[1], v[2]);
  COAT_SWING.v = n > cap ? [(v[0] * cap) / n, (v[1] * cap) / n, (v[2] * cap) / n] : v;
  try {
    return sculptBrawler(view, pose, BRAWLER_BUILD, undefined, turn);
  } finally {
    COAT_SWING.v = [0, 0, 0];
  }
}
type Move = BrawlerMove;
