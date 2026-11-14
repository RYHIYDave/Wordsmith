// ENDLESS MODE'S FINAL BOSS: THE WARPED WORDSMITH ON HIS BOAR, its pictures as the game holds a monster (art/act1_figs/types.ts), the
// art chat's (art/endless_boss.ts wsMob; every move with his yes: docs/mockups/endless_tablet/README.md, FIGHT_FLOW.md).
//
// SEEN FROM FOUR SIDES, EACH TRULY PAINTED, NEVER MIRRORED (his words, 12 Nov 2026: “I see his staff swapping hands.  It’s gonna have
// to get unmirrored at some point”): his front (facing down the screen and to the right), his back (up and to the right), and the
// two turned round (`frontL`, `rearL`: art/skeleton.ts project), so that his staff is in his right hand whichever way he faces. The
// game's eight sides (art/sides.ts) each take the nearest of the four (the four between, the one clockwise of them).
//
// STAGE 2 (the queue's build-endless-tablet-and-final-boss): his first phase's moves, in the saddle: the boar's charge, its wheel
// round, its gore, its rear up and stomp, its winded stand after a charge; his five words (Power, Flame, Frost, Lightning, Poison).
// His fall, his second phase on foot and his death come with the stages after. Heavy: made for his arena, painted by the painter's
// worker, kept packed (render/painter.ts PACKED), never baked (render/monsters_bake_list.ts TOO_BIG).

import type { ActorArt } from '../actor_types';
import { wsMob } from '../endless_boss';
import { mobSet } from '../new_mobs3';
import type { Mob } from '../new_mobs3';
import type { EightArt } from '../sides';
import type { Act1Fig } from './types';
import { toSprite } from '../kit';
import type { Painted } from '../kit';
import type { Sprite } from '../../engine/px';
import { CLOUD_CANVAS, FIRE, FROST, HAMMER_CANVAS, ICE_CANVAS, METEOR_CANVAS, ORB_CANVAS, POWER, SPORE, SPORE_CANVAS, TRAP_CANVAS, paintFrostAt, paintMeteor, paintOrbAt, paintPowerHammer, paintSporeCloud, paintSporeFlight, paintTrap } from '../endless_boss';
import type { MobCanvas } from '../new_mobs3';

/** His first phase's moves (art/endless_boss.ts wsMob's `more`, by name). */
export const WS_PHASE1 = ['charge', 'wheel', 'gore', 'stomp', 'winded', 'power', 'flame', 'frost', 'lightning', 'poison'] as const;

/** Him as the game paints him for this stage: his stand, and his first phase's moves only (no walk: he never walks; his attack
 * no move of its own, a frame of his stand). */
export function wsPhase1Mob(): Mob {
  const m = wsMob() as Mob & { more: Record<string, unknown>; stand: { motion: { keys: unknown[] } } };
  const more: Record<string, unknown> = {};
  for (const k of WS_PHASE1) more[k] = m.more[k];
  const still = { ...m.stand, motion: { keys: m.stand.motion.keys.slice(0, 2) } };
  return { ...m, more, attack: still, walk: still, walkFrames: 1, walkFps: 1 } as unknown as Mob;
}

/** His pictures from his four sides, standing for the game's eight. */
export function makeWsArt(): ActorArt {
  const mob = wsPhase1Mob();
  const front = mobSet(mob, 'front', 1);
  const back = mobSet(mob, 'back', 1);
  const frontL = mobSet(mob, 'frontL', 1);
  const backL = mobSet(mob, 'rearL', 1);
  const art: EightArt = { front, back, frontL, backL, toward: front, sideL: frontL, away: backL, side: back, coarse: true };
  return art;
}

export const FIG: Act1Fig | null = {
  make: () => makeWsArt(),
  size: { top: 132, half: 62 },
  heavy: true,
};

// ---------------------------------------------------------------------------------------------
// HIS WORDS' THINGS, PAINTED AHEAD (art/films.ts things:wsboss), as render/act1_fx/wsboss.ts asks for them: at 15 frames a second,
// each from its own floor point (art/endless_boss.ts: the films' very solids, a thing at a time).

/** The things' frames a second. */
export const THING_FPS = 15;
/** How high the orb hangs over its floor point (its own lengths). */
export const ORB_HIGH = 70;
/** The four ways he is painted from, as the frost's lists are named. */
export const WS_VIEWS = ['front', 'frontL', 'rear', 'rearL'] as const;
const sp = (p: Painted, C: MobCanvas): Sprite => toSprite(p, null, C.ax, C.ay);
const n = (secs: number): number => Math.max(1, Math.ceil(secs * THING_FPS));

/** Which of a meteor's frames is shown `u` seconds from its landing: its fall, its blast and settling, then its burning going round. */
export function meteorFrame(u: number): number {
  if (u < 0) return Math.max(0, Math.min(METEOR_FALL - 1, Math.floor((u + FIRE.fall) * THING_FPS)));
  if (u < 0.6) return METEOR_FALL + Math.min(METEOR_LAND - 1, Math.floor(u * THING_FPS));
  return METEOR_FALL + METEOR_LAND + (Math.floor(u * THING_FPS) % METEOR_BURN);
}
const METEOR_FALL = n(FIRE.fall);
const METEOR_LAND = n(0.6);
const METEOR_BURN = 8;
const meteorU = (i: number): number => (i < METEOR_FALL ? -FIRE.fall + i / THING_FPS : i < METEOR_FALL + METEOR_LAND ? (i - METEOR_FALL) / THING_FPS : 0.6 + (i - METEOR_FALL - METEOR_LAND) / THING_FPS);
/** A trap's frames: growing in, its pulse going round, its snap. */
export const TRAP_N = { grow: n(SPORE.sprout), pulse: 24, snap: 4 } as const;
export function trapFrame(u: number, sw: number): number {
  if (sw > 0) return TRAP_N.grow + TRAP_N.pulse + Math.min(TRAP_N.snap - 1, Math.floor(sw * TRAP_N.snap));
  if (u < SPORE.sprout) return Math.min(TRAP_N.grow - 1, Math.floor(u * THING_FPS));
  return TRAP_N.grow + (Math.floor((u - SPORE.sprout) * THING_FPS) % TRAP_N.pulse);
}
const trapAt = (i: number): [number, number] => (i < TRAP_N.grow ? [i / THING_FPS, 0] : i < TRAP_N.grow + TRAP_N.pulse ? [SPORE.sprout + (i - TRAP_N.grow) / THING_FPS, 0] : [SPORE.sprout, (i - TRAP_N.grow - TRAP_N.pulse + 1) / TRAP_N.snap]);
/** The orb's frames, going round, at three swellings. */
export const ORB_N = 10;
export const ORB_SWELLS = [0, 0.5, 1] as const;

/** Each list's maker, by name (each frame made when first asked for where the painter has not made it). */
export const WS_THING_MAKERS: Record<string, { n: number; make: (i: number) => Sprite }> = {
  hammer: { n: n(POWER.long - POWER.cast), make: (i) => sp(paintPowerHammer(POWER.cast + i / THING_FPS, 'front'), HAMMER_CANVAS) },
  ...Object.fromEntries([0, 1, 2, 3].map((k) => [`meteor${k}`, { n: METEOR_FALL + METEOR_LAND + METEOR_BURN, make: (i: number) => sp(paintMeteor(k, meteorU(i), 1), METEOR_CANVAS) }])),
  ...Object.fromEntries(WS_VIEWS.map((v) => [`frost:${v}`, { n: n(FROST.long - FROST.hit), make: (i: number) => sp(paintFrostAt(FROST.hit + i / THING_FPS, v), ICE_CANVAS) }])),
  ...Object.fromEntries(ORB_SWELLS.map((s, j) => [`orb${j}`, { n: ORB_N, make: (i: number) => sp(paintOrbAt(i / THING_FPS, s, ORB_HIGH), ORB_CANVAS) }])),
  flight: { n: n(SPORE.land[1] - SPORE.burst), make: (i) => sp(paintSporeFlight(SPORE.burst + i / THING_FPS), SPORE_CANVAS) },
  trap: { n: TRAP_N.grow + TRAP_N.pulse + TRAP_N.snap, make: (i) => { const [u, sw] = trapAt(i); return sp(paintTrap(0, u, sw), TRAP_CANVAS); } },
  cloud: { n: n(SPORE.cloud), make: (i) => sp(paintSporeCloud(0, i / THING_FPS), CLOUD_CANVAS) },
};

/** HIS THINGS, painted ahead (art/films.ts things:wsboss). */
export function wsThings(): Record<string, Sprite[]> {
  return Object.fromEntries(Object.entries(WS_THING_MAKERS).map(([name, m]) => [name, Array.from({ length: m.n }, (_, i) => m.make(i))]));
}
