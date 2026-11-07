// THE WARLOCK BROUGHT UP: HIS MOVES (the art chat's helper, 7 Nov 2026; behind art/warlock_up.ts WARLOCK_UP, off).
// STAGE 1 (as with the Ranger and the Mage, the owner sees one still before the whole job): only what the still needs. His stance
// with his legs true (his stand, the game's own, its keys moved only at his feet and knees); and his run's stride with no knee
// come up (the prance check), for the stride the still shows. His other lists, every one at 30 a second, come in stage 2.

import { GRIP_SPEED } from './moves3';
import type { Bones, Key3, Motion } from './skeleton';
import { STAND_FIRE, STAND_LONG, RUN_CARRY, RUN_FIRE, RUN_ROUND, STANCE, clutch, warlockMoves } from '../dev/warlock_moves';
import type { WarlockMove } from '../dev/warlock_moves';
import { WARLOCK_SCULPT_BODY } from '../dev/sculpt_warlock';

/** The game's Warlock, as he is: his stand and his run (dev/warlock_moves.ts). */
export const WL_GAME = (() => {
  const [stand, run] = warlockMoves();
  return { stand, run };
})();

/** The fields of his feet and knees: the only ones his stance is re-posed in. */
export const WL_LEG_FIELDS = ['lfx', 'lfy', 'lk', 'lft', 'rfx', 'rfy', 'rk', 'rft'] as const;

/**
 * HIS STANCE WITH HIS LEGS TRUE (the owner, of the Ranger's still: “Can you make sure his leg ratio is correct cause it seems like
 * all these guys have long upper legs and short legs below the knee”; and of mending every hero: “Yes, every hero
 * (Recommended)”). Hunched and pained, his weight back, his knees bent (dev/sculpt_warlock.ts warlockStance), his feet close
 * under him (2.4 forward, 2 back): from in front his lower legs read 0.92 of his thighs, from toward the camera 0.82, and as the
 * pain folds him over in his spasm 0.65 from toward the camera. His body, arms, crouch and every key of his stand as they were;
 * only his feet placed again: his lead foot (the left, the demon's side) further forward (12.84; it was 2.4), his back foot
 * further back (-11.88; it was -2). A longer stance, as low and as hunched; each shin is seen at its length from every side.
 * Every key of his stand moves his feet by as much (his stumble step goes on from his new lead foot, and back to it).
 */
export const WL_FEET: Readonly<Partial<Record<(typeof WL_LEG_FIELDS)[number], number>>> = { lfx: 10.44, rfx: -9.88 };
export const WL_STANCE: Bones = (() => {
  const s = { ...STANCE } as unknown as Record<string, number>;
  for (const [k, v] of Object.entries(WL_FEET)) s[k] += v as number;
  return s as unknown as Bones;
})();

/** A move of his with every key's feet moved by WL_FEET (each key given its feet in full, so no key falls back on another stance). */
function onNewFeet(m: Motion): Motion {
  const S = STANCE as unknown as Record<string, number>;
  return {
    ...m,
    keys: m.keys.map((k) => {
      const p = { ...(k.pose as Record<string, number>) };
      for (const f of WL_LEG_FIELDS) p[f] = (p[f] ?? S[f]) + ((WL_FEET as Record<string, number>)[f] ?? 0);
      return { ...k, pose: p as Partial<Bones> };
    }),
  };
}

/** HIS STAND, the game's own (6.6 s: his breathing, the arm restless, the spasm, the fold, his glare), on his new feet. */
export const WL_STAND: WarlockMove = { ...WL_GAME.stand, name: 'Standing: hunched and pained (brought up)', motion: onNewFeet(WL_GAME.stand.motion), fire: STAND_FIRE, long: STAND_LONG };

// ---------------------------------------------------------------------------------------------
// HIS RUN, LURCHING AND PAINED, NO KNEE COME UP (the owner, 7 Nov 2026, of the Warrior's re-posed run: “all that time and you
// screwed up his run.  why is he high stepping with his knees up?”; the prance check: a swinging thigh more than 50 degrees from
// hanging fails). The game's run (dev/warlock_moves.ts warlockRun, his pick “Lurching, pained (Recommended)”): the left, the
// demon's side, a long heavy step that stays down, dragged low through the next; the right a quick short hop of a step, kicked up
// behind. Before, the right came through high, its thigh up to 54 degrees: now it is kicked up behind as high as before, and
// comes through under him low (its height there 0.35 of what it was), its thigh at most 41 degrees; nothing else of the run moves.

/** Eased both ways, 0 to 1 (as dev/warlock_moves.ts). */
const ease = (u: number): number => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * c * (c * (c * 6 - 15) + 10);
};
/** A soft bump, 0 to 1 and back, over `long` of a round from `at` (wrapping round). */
const bump = (ph: number, at: number, long: number): number => {
  const d = (((ph - at) % 1) + 1) % 1;
  return d < long ? 0.5 - 0.5 * Math.cos((d / long) * Math.PI * 2) : 0;
};
/** One of his feet through his round (as dev/warlock_moves.ts limpFoot): down at `land` for `on` of the round, going back under him at the game's speed; lifted, carried on and set down. */
function limpFoot(ph: number, land: number, on: number, ahead: number, lift: number, heel: number, S: number, kick = 1, rise = 0.75): { x: number; z: number; p: number } {
  const q = (((ph - land) % 1) + 1) % 1;
  const back = S * on;
  if (q < on) return { x: ahead - S * q, z: 0, p: 0 };
  const v = (q - on) / (1 - on);
  const go = ease((v - 0.12) / 0.76);
  // (high while it is behind him, kicked up; lower as it comes through under him: `kick`, the share of its height left as it comes
  // through (1: the game's); `rise`, how fast it goes up (the game's 0.75))
  const up = Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, v))), rise);
  const z = lift * up * (kick + (1 - kick) * (1 - go));
  const p = heel * Math.sin(Math.PI * Math.min(1, v * 1.4)) * (v < 0.7 ? 1 : 0) - 6 * bump(v, 0.7, 0.3);
  return { x: ahead - back + back * go, z, p };
}

/** The run's feet: the game's, and now. */
export const WL_RUN_FEET = {
  game: { left: { lift: 2.6, heel: 12, kick: 1, rise: 0.75 }, right: { lift: 6.0, heel: 48, kick: 1, rise: 0.75 } },
  now: { left: { lift: 2.6, heel: 12, kick: 1, rise: 0.75 }, right: { lift: 6.0, heel: 48, kick: 0.35, rise: 0.75 } },
};

/** His run with its feet as `feet` says (the game's run with WL_RUN_FEET.game: the same keys). */
export function wlRun(feet: typeof WL_RUN_FEET.now = WL_RUN_FEET.now, T = 1): Motion {
  const P = RUN_ROUND;
  const S = RUN_CARRY * P;
  const LEFT = { land: 0, on: 0.44, ahead: S * 0.24, ...feet.left };
  const RIGHT = { land: 0.58, on: 0.24, ahead: S * 0.1, ...feet.right };
  const L = ARM_L;
  const keys: Key3[] = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const ph = i / n;
    const l = limpFoot(ph, LEFT.land, LEFT.on, LEFT.ahead, LEFT.lift * T, LEFT.heel, S, LEFT.kick, LEFT.rise);
    const r = limpFoot(ph, RIGHT.land, RIGHT.on, RIGHT.ahead, RIGHT.lift * T, RIGHT.heel, S, RIGHT.kick, RIGHT.rise);
    const sink = bump(ph, LEFT.land - 0.04, 0.36);
    const hop = bump(ph, RIGHT.land + 0.06, 0.3);
    const sw = 0.5 - 0.5 * Math.cos((ph - RIGHT.land - 0.2) * Math.PI * 2);
    const yank = bump(ph, RIGHT.land + 0.12, 0.32);
    const pose: Partial<Bones> = {
      px: 1.2 * T * sink + 0.9 * T * yank, py: 0.9 * T * sink - 0.3 * T * hop,
      pz: -1.6 * T - 2.0 * T * sink + 0.9 * T * hop,
      yaw: -5 + 9 * sink - 6 * hop, pitch: -4 + 2 * sink, roll: -4 * sink + 2 * hop,
      twist: STANCE.twist + 8 * yank - 6 * sink, bend: 12 + 3 * sink + 2 * yank, side: -6 - 5 * sink + 2 * hop,
      hunch: 64 + 8 * sink + 4 * yank - 3 * hop, shrug: 0.9 + 0.1 * sink,
      faceTurn: -6, faceUp: 8 - 4 * sink + 3 * hop, faceTilt: -8 + 4 * sink,
      lfx: l.x, lfy: 1.4 * T, lfz: l.z, lfp: l.p, lft: 10, lk: 8,
      rfx: r.x, rfy: -1.0 * T, rfz: r.z, rfp: r.p, rft: -4, rk: -4,
      lhIn: 1, lhx: L * (0.12 + 0.5 * sw), lhy: 3.0 * T, lhz: L * (-0.92 + 0.2 * sw), le: 34,
    };
    keys.push({ at: ph * P, ease: 'lin', pose: { ...pose, ...clutch(pose) } });
  }
  return { keys, loop: 0 };
}
const ARM_L = WARLOCK_SCULPT_BODY.upperArm + WARLOCK_SCULPT_BODY.foreArm;

/** HIS RUN, brought up (stage 1: its stride, for the still; his run from all eight sides, its legs measured where a foot bears him, in stage 2). */
export const WL_RUN: WarlockMove = { ...WL_GAME.run, name: 'Running (brought up)', motion: wlRun(), long: RUN_ROUND, travel: GRIP_SPEED, carry: RUN_CARRY, fire: RUN_FIRE };
