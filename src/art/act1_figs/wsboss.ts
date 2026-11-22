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
import { DEATH, FALL, SHADE, SHADE_CANVAS, SPENT, paintShade, wsMob } from '../endless_boss';
import { mobSet, skeletonAt } from '../new_mobs3';
import type { Mob, Moment } from '../new_mobs3';
import type { Px } from '../../engine/px';
import type { Stage } from '../skin';
import type { EightArt } from '../sides';
import type { Act1Fig } from './types';
import { toSprite } from '../kit';
import type { Painted } from '../kit';
import type { Sprite } from '../../engine/px';
import { BLIGHT, BLIGHT_TREE_CANVAS, CLOUD_CANVAS, FIRE, FROST, HAMMER_CANVAS, ICE_CLUSTER_CANVAS, METEOR_CANVAS, ORB_CANVAS, POWER, SPORE, SPORE_CANVAS, TRAP_CANVAS, paintIceCluster, paintMeteor, paintOrbAt, paintPowerHammer, paintBlightTree, paintSporeCloud, paintSporeFlight, paintTrap } from '../endless_boss';
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

/**
 * STAGE 3: HIM ON FOOT, HIS SHADE BEHIND HIM. The boar's death (`fall`: killed mid-charge, he thrown clear, its power streaming into
 * him, it greying to ash, his slam, his shade torn up out of him), his stand on foot (`foot`), his melds (one picture for all ten:
 * his body writes, raises and slams the same in each, the art's `meldRiderAt`; what he writes and what it makes are drawn by the
 * game), and spent (`spent`). HIS SHADE (art/endless_boss.ts paintShade: his own figure made great and made of his pink, a beat
 * behind him) is laid in each of these pictures under him, see-through, as the art's films lay it: risen through the fall's last
 * moments, dimmed and flickering when he is spent.
 */
export const WS_PHASE2 = ['fall', 'foot', 'hailstorm', 'spent', 'death'] as const;
/** His melds' one picture (the art's melds share his body's every move). */
export const MELD_CLIP = 'hailstorm';
/** The picture's canvas on foot: room for the shade looming over him (a little off the shade's own size, so that its pool of
 * sheets is never the shade's: art/skin.ts stage). */
const FOOT_CANVAS = { w: SHADE_CANVAS.w + 2, h: SHADE_CANVAS.h + 40, ax: SHADE_CANVAS.ax + 1, ay: SHADE_CANVAS.ay + 40 };
/** How strongly his shade is laid under him (the films' layShade), and whether it is shown, `t` seconds into `move`. */
export function shadeLaid(move: string, t: number): { a: number; grow: number; at: number; lean?: number } | null {
  if (move === 'death') {
    // (his death: dragged back down into him, writhing, flickering, gone: the film's)
    const g0 = Math.min(1, Math.max(0, (t - DEATH.shade[0]) / (DEATH.shade[1] - DEATH.shade[0])));
    const g = 1 - g0 * g0;
    if (g <= 0.02 || (g0 > 0 && Math.floor(t * 30) % 3 === 0)) return null;
    return { a: 0.67 * (0.4 + 0.6 * g), grow: g, at: Math.max(0, t - SHADE.lag), lean: 6 * Math.sin(t * 40) * g0 };
  }
  if (move === 'fall') {
    if (t <= FALL.shade[0]) return null;
    const u = Math.min(1, (t - FALL.shade[0]) / (FALL.shade[1] - FALL.shade[0]));
    const g = u * u * (3 - 2 * u);
    return { a: 0.25 + 0.42 * g, grow: g, at: Math.max(FALL.shade[0], t - SHADE.lag) };
  }
  if (move === 'spent') {
    const dim = Math.min(1, t / 0.35) * (1 - Math.min(1, Math.max(0, (t - (SPENT.long - 0.45)) / 0.45)));
    if (dim > 0.5 && Math.floor(t * 30) % 4 === 0) return null;
    return { a: 0.78 * (1 - 0.65 * dim), grow: 1, at: Math.max(0, t - SHADE.lag) };
  }
  return { a: 0.78, grow: 1, at: Math.max(0, t - SHADE.lag) };
}
export function wsPhase2Mob(): Mob {
  const m = wsMob() as Mob & { more: Record<string, unknown>; stand: { motion: { keys: unknown[] } }; finish?: (px: Px, st: Stage, mo: Moment, partAt: (k: number) => string | null) => void };
  const more: Record<string, unknown> = {};
  for (const k of WS_PHASE2) more[k] = m.more[k];
  const still = { ...m.stand, motion: { keys: m.stand.motion.keys.slice(0, 2) } };
  const own = m.finish;
  const mob = { ...m, more, attack: still, walk: still, walkFrames: 1, walkFps: 1, canvas: FOOT_CANVAS } as unknown as Mob;
  (mob as unknown as { finish: typeof own }).finish = (px, st, mo, partAt) => {
    own?.(px, st, mo, partAt);
    const move = mo.move ?? 'foot';
    const laid = shadeLaid(move, mo.t);
    if (!laid) return;
    // (his shade, from his bones a beat before, anchored on his pelvis's floor point, laid under him, see-through)
    const sk = skeletonAt(mob, move, laid.at);
    const sh = paintShade(sk, mo.t, st.view as 'front' | 'rear' | 'frontL' | 'rearL', laid.grow, laid.lean ?? 0).px;
    const [px0, py0] = st.at([sk.pelvis[0], sk.pelvis[1], 0]);
    const x0 = Math.round(px0 - SHADE_CANVAS.ax);
    const y0 = Math.round(py0 - SHADE_CANVAS.ay);
    const A = Math.round(255 * laid.a);
    for (let y = 0; y < sh.h; y++) {
      const Y = y0 + y;
      if (Y < 0 || Y >= px.h) continue;
      for (let x = 0; x < sh.w; x++) {
        const X = x0 + x;
        if (X < 0 || X >= px.w) continue;
        const i = (y * sh.w + x) * 4;
        if (sh.d[i + 3] === 0) continue;
        const o = (Y * px.w + X) * 4;
        if (px.d[o + 3] !== 0) continue;
        px.d[o] = sh.d[i];
        px.d[o + 1] = sh.d[i + 1];
        px.d[o + 2] = sh.d[i + 2];
        px.d[o + 3] = A;
      }
    }
  };
  return mob;
}

/** His pictures from his four sides, standing for the game's eight: in the saddle, and on foot with his shade. */
export function makeWsArt(): ActorArt {
  const m1 = wsPhase1Mob();
  const m2 = wsPhase2Mob();
  const side = (v: 'front' | 'back' | 'frontL' | 'rearL') => {
    const a = mobSet(m1, v, 1);
    const b = mobSet(m2, v, 1);
    // (his death is his own act, and of him nothing is left lying: no fall of the figure's)
    a.clips = { ...(a.clips ?? {}), moves: { ...(a.clips?.moves ?? {}), ...(b.clips?.moves ?? {}) }, die: undefined };
    return a;
  };
  const front = side('front');
  const back = side('back');
  const frontL = side('frontL');
  const backL = side('rearL');
  const art: EightArt = { front, back, frontL, backL, toward: front, sideL: frontL, away: backL, side: back, coarse: true };
  return art;
}

export const FIG: Act1Fig | null = {
  make: () => makeWsArt(),
  // (his size as his picture has it, 66 up over the boar's back and 31 to his widest side: it came in at twice that, as if counted in
  // picture pixels; set right at the queue's final-boss-size-to-picture)
  size: { top: 66, half: 31 },
  heavy: true,
};

// ---------------------------------------------------------------------------------------------
// HIS WORDS' THINGS, PAINTED AHEAD (art/films.ts things:wsboss), as render/act1_fx/wsboss.ts asks for them: at 15 frames a second,
// each from its own floor point (art/endless_boss.ts: the films' very solids, a thing at a time).

/** The things' frames a second. */
export const THING_FPS = 15;
/** How high the orb hangs over its floor point (its own lengths). */
export const ORB_HIGH = 70;
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
/** A cluster of the ice's moments (seconds since it burst): bursting up, settled, standing, shattering. */
export const ICE_U = [0.03, 0.07, 0.12, 0.4, FROST.stand + 0.05, FROST.stand + 0.1, FROST.stand + 0.15] as const;
/** Which of a cluster's frames is shown `u` seconds since it burst (-1: none). */
export function iceFrame(u: number): number {
  if (u <= 0 || u > FROST.stand + 0.18) return -1;
  if (u < 0.05) return 0;
  if (u < 0.09) return 1;
  if (u < 0.2) return 2;
  if (u < FROST.stand) return 3;
  return Math.min(6, 4 + Math.floor((u - FROST.stand) / 0.06));
}
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
/** THE BLIGHT'S TREES (on foot): the art's trees painted alone, a few of them for all (its three about where the rune went in, then
 * four of those along its fingers); each through its life, burst up, standing, crumbling. */
export const TREE_OF = [0, 1, 2, 3, 5, 8, 12] as const;
export const TREE_LIFE = BLIGHT.rise + BLIGHT.hold + BLIGHT.wither;
/** Which of them stands for the art's `n`th tree. */
export const treeVariant = (n: number): number => (n < 3 ? n : 3 + (n % 4));
export const treeFrame = (u: number): number => Math.max(0, Math.min(n(TREE_LIFE) - 1, Math.floor(u * THING_FPS)));
export const WS_THING_MAKERS: Record<string, { n: number; make: (i: number) => Sprite }> = {
  ...Object.fromEntries(TREE_OF.map((t, v) => [`tree${v}`, { n: n(TREE_LIFE), make: (i: number) => sp(paintBlightTree(t, i / THING_FPS), BLIGHT_TREE_CANVAS) }])),
  hammer: { n: n(POWER.long - POWER.cast), make: (i) => sp(paintPowerHammer(POWER.cast + i / THING_FPS, 'front'), HAMMER_CANVAS) },
  ...Object.fromEntries([0, 1, 2, 3].map((k) => [`meteor${k}`, { n: METEOR_FALL + METEOR_LAND + METEOR_BURN, make: (i: number) => sp(paintMeteor(k, meteorU(i), 1), METEOR_CANVAS) }])),
  ...Object.fromEntries([0, 1].flatMap((v) => [0, 1, 2].map((big) => [`ice${v}${big}`, { n: ICE_U.length, make: (i: number) => sp(paintIceCluster(v, big, ICE_U[i]), ICE_CLUSTER_CANVAS) }]))),
  ...Object.fromEntries(ORB_SWELLS.map((s, j) => [`orb${j}`, { n: ORB_N, make: (i: number) => sp(paintOrbAt(i / THING_FPS, s, ORB_HIGH), ORB_CANVAS) }])),
  flight: { n: n(SPORE.land[1] - SPORE.burst), make: (i) => sp(paintSporeFlight(SPORE.burst + i / THING_FPS), SPORE_CANVAS) },
  trap: { n: TRAP_N.grow + TRAP_N.pulse + TRAP_N.snap, make: (i) => { const [u, sw] = trapAt(i); return sp(paintTrap(0, u, sw), TRAP_CANVAS); } },
  cloud: { n: n(SPORE.cloud), make: (i) => sp(paintSporeCloud(0, i / THING_FPS), CLOUD_CANVAS) },
};

/** HIS THINGS, painted ahead (art/films.ts things:wsboss). */
export function wsThings(): Record<string, Sprite[]> {
  return Object.fromEntries(Object.entries(WS_THING_MAKERS).map(([name, m]) => [name, Array.from({ length: m.n }, (_, i) => m.make(i))]));
}
