// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16, THE SWAN GARDENS: THE PALACE GUARD: their rules (game/act1_rules/types.ts).
//
// His doc ("Wordsmith Act 2, Part Two: The High City (Levels 16–20)", level 16): "Enemies: the Hushed gardeners and grooms, the
// palace guard, and the swans." His answers to the art chat (28 Oct 2026; docs/mockups/swan_gardens/README.md): who and what
// they carry, “1 and 2” (royal guards with partisans, and with sword and shield); their size, “A head taller, fewer
// (Recommended)”; how they move, “March in step (Recommended)”; their two attacks, “Long thrust, wide sweep (Recommended)”;
// their death, “To one knee, then a crash (Recommended)”; their sound, “Clank and stamp (Recommended)”; and to their pictures,
// “Yes, that's the guard (Recommended)”. The art chat's pictures (art/palace_guard.ts, palace_guard_moves.ts): THE MARCH,
// painted for GD_PACE (0.8) tiles a second, twelve frames at ten a second, both boots down at frames 0 and 6; THE LONG THRUST
// (GD_THRUST, 1.5 s): the weapon brought down level and drawn back, its point glinting pink, held shaking (THE WARNING, 0.28 to
// 0.48 s); hips first, a lunge, thrust out at 20/30 of a second (THE BLOW), carried on, drawn back; THE WIDE SWEEP (GD_SWEEP,
// 1.8 s, `more.sweep`): heaved up high over the right shoulder, held shaking (THE WARNING, 0.32 to 0.62 s); hips first, a step
// in, swept round low before them from their right to their left, straight before them at 24/30, carried on round; brought back
// up. Struck, 0.4 s; TO ONE KNEE, THEN A CRASH (GD_DIES, 2.8 s), in their pictures. Medium: two attacks.
//
// WHAT THEY DO, by those (the main chat's helper's, as the art leaves it to the game):
// - A SQUAD OF THE TWO: each one of the partisan guard (Monster.form 0) or the sword guard (form 1, the figure 'pguard:1',
//   art/act1_figs/pguard.ts `looks`), in turn by its number in the game, so a squad comes mixed; one kind in the rules, but
//   each blow's reach is its own weapon's (`thrust`, `sweep`: by its form), the sword the shorter.
// - THE LONG THRUST, their basic blow: at its moment, whoever is in the line along the weapon, from their breast out past where
//   its point is thrust (`thrust.at`, measured off the picture: the partisan's tip, the sword's) and on through where it is
//   carried (`thrust.out`) by `more`, `thrust.half` to either side of its line, is struck. No cooldown of its own (his
//   gameplay rulebook, "Their attacks": "every one a basic single-target attack to use while its big ones cool down"): it is
//   made between sweeps, `thrust.after` seconds after whatever they did last.
// - THE WIDE SWEEP, the bigger: the blade strikes whoever it passes as it comes round low before them, from its first frame low
//   enough to strike a man to its last before it rises (`sweep.at`, frame by frame its bearing to their left of the way they face
//   and how far the weapon reaches then, measured off the picture: the partisan's tip, the sword's), its edges `pad` further round
//   at either end, as far out as the weapon ever reaches in it and `more` beyond; once, and knocked a little way on (`knock`, of a
//   Heavy blow's step, as the Hushed watch's halberd). A blow and a third; every `sweep.cooldown` seconds at most.
// - HIS RULE OF 28 OCT (“And bigger AOE to compensate for the extra time the player gets to evade”): the partisan guard's sweep
//   a fan 3.3 tiles out, 250 degrees round (the Hushed watch's halberd, the Hush's like kind, 2.8 tiles out and 200 round); its
//   thrust a line 3.3 tiles long and 1.3 across (the carter's lash, 2.8 and a tile). The sword guard's are its own weapon's,
//   shorter: its sweep 2.06 tiles out (its sword reaches 1.46), its thrust 2.18 long. Through each wind-up the fan or the line
//   is marked on the floor in the enemy's pink (render/act1_fx/pguard.ts).
// - MARCHING IN STEP (his “March in step”): those of them marching at once keep one beat, the game's clock: each one's march is
//   brought round to it a little at a time (`step.catch` of its own pace at most), so a squad that sets off out of step falls
//   into it within a few strides.
//
// Every number here that is a picture's is written down here; tests/act2_pguard.test.ts holds it to the art.

import { along } from '../bosses';
import type { ActDef, BossRules, GaitDef } from '../bosses';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/** Their looks: the partisan guard (Monster.form 0, its own pictures) and the sword guard (form 1). */
export const PARTISAN_GUARD = 0;
export const SWORD_GUARD = 1;

/** THE PALACE GUARD'S NUMBERS (tiles before them and to their left; seconds of their pictures; each of two by their look, the partisan's first). */
export const PGUARD = {
  /** Their march's pace (GD_PACE, tiles a second), and its round (GD_WALK: twelve frames at ten a second). */
  pace: 0.8,
  round: 12 / 10,
  /** A weapon's reach is given `more` beyond the steel (his rule of 28 Oct). */
  more: 0.6,
  /**
   * THE LONG THRUST (GD_THRUST): how long, the warning from and to, the blow's moment; the point `at` as it is thrust out (tiles
   * before them, to their left), carried on to `out`; the line `half` to either side; how far off it is made from (`far`); how
   * long they stand after it, or after a sweep, before the next (`after`).
   */
  thrust: {
    long: 1.5,
    warn: [0.28, 0.48] as const,
    hit: 20 / 30,
    at: [[2.563, -0.016], [1.457, -0.204]] as ReadonlyArray<readonly [number, number]>,
    out: [2.693, 1.58] as const,
    from: -0.2,
    half: 0.65,
    far: [2.7, 1.7] as const,
    after: 0.8,
  },
  /**
   * THE WIDE SWEEP (GD_SWEEP): how long, the warning from and to, its moment (the blade straight before them); `at` each frame
   * from the first low enough to strike a man to the last before it rises, for each look: the moment, the bearing (radians to
   * their left of the way they face) and how far the weapon reaches then (its tip). Its edges `pad` further round; out as far as
   * it ever reaches and `more`; how far off it is made from (`far`); its cooldown and first wait; thrown `knock`.
   */
  sweep: {
    long: 1.8,
    warn: [0.32, 0.62] as const,
    hit: 24 / 30,
    at: [
      [
        [21 / 30, -1.676, 2.315], [22 / 30, -1.061, 2.494], [23 / 30, -0.523, 2.627], [24 / 30, -0.013, 2.694], [25 / 30, 0.337, 2.649],
        [26 / 30, 0.733, 2.545], [27 / 30, 1.133, 2.444], [28 / 30, 1.454, 2.363], [29 / 30, 1.7, 2.31], [30 / 30, 1.87, 2.275], [31 / 30, 1.965, 2.255],
      ],
      [
        [21 / 30, -1.694, 1.037], [22 / 30, -1.13, 1.329], [23 / 30, -0.635, 1.401], [24 / 30, -0.145, 1.46], [25 / 30, 0.139, 1.401],
        [26 / 30, 0.435, 1.343], [27 / 30, 0.735, 1.292], [28 / 30, 1.008, 1.219], [29 / 30, 1.221, 1.174], [30 / 30, 1.368, 1.147],
        [31 / 30, 1.451, 1.133], [32 / 30, 1.466, 1.13],
      ],
    ] as ReadonlyArray<ReadonlyArray<readonly [number, number, number]>>,
    pad: 0.3,
    far: [2.8, 1.6] as const,
    cooldown: 6,
    first: 2.5,
    knock: 0.5,
  },
  /** MARCHING IN STEP: how much of its own pace a guard's march may be brought on or held back by, to come round to the beat. */
  step: { catch: 0.12 },
};

/** Which look one of them is (0 the partisan guard, 1 the sword guard). */
export function lookOf(m: { form?: number }): number {
  return (m.form ?? 0) === SWORD_GUARD ? SWORD_GUARD : PARTISAN_GUARD;
}

/** THE LONG THRUST's line for a look: from `from` to `to` before them, from `left0` to `left1` to their left. */
export function thrustLine(look: number): { from: number; to: number; left0: number; left1: number } {
  const T = PGUARD.thrust;
  const mid = T.at[look][1];
  return { from: T.from, to: T.out[look] + PGUARD.more, left0: mid - T.half, left1: mid + T.half };
}

/** THE WIDE SWEEP's fan for a look: from bearing `b0` (their right) round to `b1` (their left), `r` tiles out; struck from `t0` to `t1`. */
export function sweepFan(look: number): { b0: number; b1: number; r: number; t0: number; t1: number } {
  const S = PGUARD.sweep;
  const A = S.at[look];
  let reach = 0;
  for (const [, , r] of A) reach = Math.max(reach, r);
  return { b0: A[0][1] - S.pad, b1: A[A.length - 1][1] + S.pad, r: reach + PGUARD.more, t0: A[0][0], t1: A[A.length - 1][0] };
}

/** The blade's bearing `t` seconds into the sweep (radians to their left of the way they face), for a look: its padded edges at its first and last frames. */
export function sweepBearing(look: number, t: number): number {
  const S = PGUARD.sweep;
  const A = S.at[look];
  const F = sweepFan(look);
  if (t <= F.t0) return F.b0;
  if (t >= F.t1) return F.b1;
  return along(A.map(([tt, b]) => [tt, b] as const), t);
}

/**
 * Their march, painted for 0.8 tiles a second, twelve frames round; they stop only where both boots are down (each half of it).
 * They stand off inside the sword's thrust; the partisan guard thrusts from further, as soon as the hero is in its reach.
 */
const GAIT: GaitDef = { pace: PGUARD.pace, cycle: PGUARD.round / 2, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.3, slack: 0.4, trueBack: true };

const ACTS: readonly ActDef[] = [
  { id: 'pguard:thrust', clip: 'attack', long: PGUARD.thrust.long, hit: PGUARD.thrust.hit, dmg: 1, cooldown: 0, first: 0, after: PGUARD.thrust.after, near: 0, far: PGUARD.thrust.far[0] },
  { id: 'pguard:sweep', clip: 'sweep', long: PGUARD.sweep.long, hit: PGUARD.sweep.hit, dmg: 1.3, cooldown: PGUARD.sweep.cooldown, first: PGUARD.sweep.first, after: PGUARD.thrust.after, near: 0, far: PGUARD.sweep.far[0] },
];

/** MARCHING IN STEP: while it marches, its march brought a little nearer the beat (the game's clock) every step. */
function inStep(R: BossRules, m: Monster, dt: number): void {
  const gt = m.gait;
  if (m.state === 'act' || !gt || gt.mode !== 'walk') return;
  const P = PGUARD.round;
  const beat = (R.g.time % P) / P;
  const own = (((gt.t % P) + P) % P) / P;
  let off = beat - own;
  if (off > 0.5) off -= 1;
  if (off < -0.5) off += 1;
  const most = PGUARD.step.catch * dt;
  gt.t += Math.max(-most, Math.min(most, off * P));
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  spawned(_R, m) {
    // (a partisan or a sword, in turn: a mixed squad)
    m.form = m.id % 2 === 0 ? PARTISAN_GUARD : SWORD_GUARD;
  },
  tick(R, m, dt) {
    inStep(R, m, dt);
    return false;
  },
  can(_R, m, a, dist) {
    // (each blow from as far as its own weapon reaches)
    const look = lookOf(m);
    if (a.id === 'pguard:thrust') return dist <= PGUARD.thrust.far[look];
    if (a.id === 'pguard:sweep') return dist <= PGUARD.sweep.far[look];
    return true;
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const look = lookOf(m);
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (a.id === 'pguard:sweep') {
      // THE WIDE SWEEP: the blade strikes him as it passes where he stands, if he is within its reach
      const F = sweepFan(look);
      if (at(F.t0 - 0.04)) g.sfx('swing', 0.9);
      if (t1 <= F.t0 || t0 >= F.t1 + 1e-6 || act.b) return;
      const r = R.rel(m);
      const bearing = Math.atan2(r.left, r.fwd);
      const b0 = t0 <= F.t0 ? F.b0 : sweepBearing(look, t0);
      const b1 = sweepBearing(look, t1);
      if (!R.passes(b0 - 1e-9, b1, bearing)) return;
      if (Math.hypot(r.fwd, r.left) > F.r) return;
      act.b = 1;
      R.blow(m, a.dmg);
      if (!h.move && h.invuln <= 0 && !g.over) g.knockHero(m.x, m.y, PGUARD.sweep.knock);
      return;
    }
    if (a.id !== 'pguard:thrust') return;
    // THE LONG THRUST: the point thrust out; whoever is along the line it is thrust on is struck
    if (at(PGUARD.thrust.hit - 0.1)) g.sfx('swing', 0.6);
    if (!at(a.hit)) return;
    const L = thrustLine(look);
    const r = R.rel(m);
    if (r.fwd >= L.from && r.fwd <= L.to && r.left >= L.left0 && r.left <= L.left1) R.blow(m, a.dmg);
  },
};
