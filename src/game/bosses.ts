// THE FIRST FIVE FLOORS: THE BOSSES OF FLOORS 2 TO 5, AND WHAT COMES WITH THEM. The rules.
//
// The owner's outline (his gameplay rulebook): a boss on every floor, the lair boss on the fifth.
// The Crypt's: 1 the Warden; 2 the Headsman; 3 the prisoner, the Chained One; 4 the ossuary
// amalgamation; 5 "a very powerful cultist fleshmancer, human sized, whose spells fill the room and
// must be dodged". His rule of 9 Oct 2026, 08:15: "the boss 4 [attacks].  They should always have a
// basic, single target attack ... The bigger the hit, the longer the cooldown." His picks of what each
// does are the art chat's briefs (docs/mockups/bosses, docs/mockups/fleshmancer), each move filmed and
// said yes to; WHAT EACH MOVE HURTS, HOW FAR, HOW OFTEN are this file, the main chat's.
//
// HOW A BOSS IS RUN. The art chat's bosses stand, take up a weapon, set off, walk, stop, and make
// moves, each a film with its own length, and each handing over to the next only at the moments the
// art's checks hold (docs/mockups/bosses/README.md, "How the moves hand over"). So one of these has
//   a GAIT (Monster.gait): standing, setting off, walking, stopping (the Headsman, who stands with his
//     axe planted, takes it up before he moves or strikes and sets it down when he has stood a while).
//     He is carried over the floor at his pace from the first moment of setting off to the last of
//     stopping, and stops as his walk comes round to its first frame;
//   and ACTS (Monster.act): a move played by its own clock from start to end. What it does, it does at
//     the moments its picture does it (`hit` and the rest are the pictures' own numbers:
//     tests/first5_bosses.test.ts holds them equal to the art's). Until its blow, a chill slows it, as it
//     slows any monster's wind-up.
// What an act leaves on the floor or sends across it that goes on by itself is a PERIL (state.ts).
//
// The rules know nothing of the pictures: every number here that is a picture's is written down here,
// and a test holds it to the art. Which side of him a thing is on is the side his picture shows it
// (game/facing.ts, `handOf`).

import { MONSTERS, MSG, SUMMON, TUNE, wordShare } from './defs';
import type { MonsterDef } from './defs';
import { beside, fromFigure, handOf } from './facing';
import type { Game } from './game';
import type { ActId, Monster, Peril, PerilKind } from './state';
import type { Element, MonsterKind } from './types';

/**
 * THE BOSSES OF FLOORS 2 TO 5 (and the bone beasts): in the game, behind this switch. Off, every
 * floor's boss is the Warden, as up to Version 20.2.
 */
export const BOSSES5 = { on: true };

/** Which boss a floor has. Past the fifth (no set of five there yet), the Warden, as before. */
export function bossKind(depth: number): MonsterKind {
  if (!BOSSES5.on) return 'warden';
  return depth === 2 ? 'headsman' : depth === 3 ? 'chained' : depth === 4 ? 'amalgam' : depth === 5 ? 'fleshmancer' : 'warden';
}

// ---------------------------------------------------------------------------------------------
// GAITS

/** One whose pictures set off, walk and stop: the numbers of them (the art's: seconds of its pictures, tiles). */
export interface GaitDef {
  /** The pace its walk is painted for (tiles a second), and how long its walk's loop is. */
  pace: number;
  cycle: number;
  setOff: number;
  halt: number;
  /** (the Headsman) taking his axe up from where it stands, and setting it down: 0 for the others. */
  raise: number;
  lower: number;
  /** How near the hero it comes before it stops (tiles, middle to middle), and how much further off he must be before it sets off again. */
  stopAt: number;
  slack: number;
  /** Its pictures from behind are as the camera truly sees it (game/facing.ts). */
  trueBack: boolean;
}
export type GaitedKind = 'headsman' | 'chained' | 'amalgam' | 'beast' | 'fleshmancer' | 'minifm';
export const GAITS: Record<GaitedKind, GaitDef> = {
  headsman: { pace: 0.8, cycle: 1.25, setOff: 0.409, halt: 0.534, raise: 0.6, lower: 0.6, stopAt: 2.3, slack: 0.7, trueBack: true },
  chained: { pace: 1.1, cycle: 1.0, setOff: 0.389, halt: 0.389, raise: 0, lower: 0, stopAt: 2.1, slack: 0.7, trueBack: true },
  amalgam: { pace: 0.8, cycle: 0.8, setOff: 0.7, halt: 0.5, raise: 0, lower: 0, stopAt: 1.9, slack: 0.6, trueBack: false },
  beast: { pace: 1.5, cycle: 0.4, setOff: 0.3, halt: 0.3, raise: 0, lower: 0, stopAt: 1.0, slack: 0.4, trueBack: false },
  fleshmancer: { pace: 1.0, cycle: 1.0, setOff: 0.5, halt: 0.6, raise: 0, lower: 0, stopAt: 3.6, slack: 1.6, trueBack: true },
  minifm: { pace: 1.0, cycle: 1.0, setOff: 0.4, halt: 0.5, raise: 0, lower: 0, stopAt: 1.8, slack: 0.5, trueBack: true },
};
/** How long the Headsman holds his axe across him, doing nothing, before he sets it down again (seconds). */
export const CARRY_FOR = 0.7;
export function gaitOf(kind: MonsterKind): GaitDef | null {
  return BOSSES5.on && kind in GAITS ? GAITS[kind as GaitedKind] : null;
}

// ---------------------------------------------------------------------------------------------
// ACTS

export interface ActDef {
  id: ActId;
  /** Which of its pictures' moves it is: 'attack', or one of its others by name. */
  clip: string;
  /** How long the move is, and the moment its (first) blow lands: the warning is what comes before. */
  long: number;
  hit: number;
  /** How hard it hits, times the monster's own blow (each blow of it, where it has several). */
  dmg: number;
  /** Seconds before it may be used again (0: the basic blow); from waking before it may first be used; after it before the next act. */
  cooldown: number;
  first: number;
  after: number;
  /** The hero's distance (tiles) at which it is used. */
  near: number;
  far: number;
  /** It is not chosen: it comes when the rules bring it (a chain breaks, a beast bursts out, a beast is made or dragged). */
  forced?: boolean;
}
export const ACTS: Record<GaitedKind, readonly ActDef[]> = {
  // THE HEADSMAN: his chop; the wide sweep when the hero is at his feet; the whirling throw at one who
  // stands off; the sentence, the long line, his biggest.
  headsman: [
    { id: 'chop', clip: 'attack', long: 1.85, hit: 0.9, dmg: 1, cooldown: 0, first: 0, after: 0.45, near: 0, far: 3.1 },
    { id: 'sweep', clip: 'sweep', long: 2.27, hit: 0.78, dmg: 1.15, cooldown: 9, first: 4, after: 0.6, near: 0, far: 2.7 },
    { id: 'axe', clip: 'throw', long: 3.1, hit: 0.8, dmg: 0.9, cooldown: 6.5, first: 2, after: 0.5, near: 3.3, far: 9.5 },
    { id: 'sentence', clip: 'sentence', long: 2.65, hit: 1.35, dmg: 1.7, cooldown: 11, first: 6, after: 0.7, near: 2.4, far: 8.4 },
  ],
  // THE CHAINED ONE: his lash; the chain whirl at one who stands close; the hook, which drags a hero
  // who stands off in to him; the ball, his biggest, while he has it. His chains break as he is hurt.
  chained: [
    { id: 'lash', clip: 'attack', long: 1.74, hit: 0.86, dmg: 0.9, cooldown: 0, first: 0, after: 0.4, near: 0, far: 3.0 },
    { id: 'whirl', clip: 'whirl', long: 2.6, hit: 0.8, dmg: 0.55, cooldown: 10, first: 5, after: 0.6, near: 0, far: 2.5 },
    { id: 'hook', clip: 'hook', long: 3.15, hit: 1.2, dmg: 0.5, cooldown: 8, first: 2.5, after: 0.15, near: 3.0, far: 7.5 },
    { id: 'ball', clip: 'ball', long: 4.11, hit: 1.78, dmg: 1.5, cooldown: 12, first: 7, after: 0.6, near: 3.2, far: 4.9 },
    { id: 'breakL', clip: 'breakL', long: 2.3, hit: 0.8, dmg: 0.5, cooldown: 0, first: 0, after: 0.3, near: 0, far: 0, forced: true },
    { id: 'breakBall', clip: 'breakBall', long: 2.3, hit: 0.8, dmg: 0.5, cooldown: 0, first: 0, after: 0.3, near: 0, far: 0, forced: true },
  ],
  // THE AMALGAMATION: its swipe; its swarm of skulls at one who stands off; arms of the dead out of the
  // floor wherever the hero is; devour, its biggest, which drags him in. Bone beasts burst out of it as
  // it is hurt, and it eats back any it can reach.
  amalgam: [
    { id: 'swipe', clip: 'attack', long: 1.5, hit: 0.82, dmg: 1, cooldown: 0, first: 0, after: 0.5, near: 0, far: 2.45 },
    { id: 'swarm', clip: 'swarm', long: 2.0, hit: 1.0, dmg: 0.32, cooldown: 7, first: 3, after: 0.6, near: 2.6, far: 11 },
    { id: 'floorArms', clip: 'floorArms', long: 2.3, hit: 1.0, dmg: 0.75, cooldown: 9, first: 5, after: 0.6, near: 0, far: 11 },
    { id: 'devour', clip: 'devour', long: 2.8, hit: 1.6, dmg: 1.8, cooldown: 12, first: 8, after: 0.8, near: 0, far: 3.3 },
    { id: 'burst', clip: 'burst', long: 1.5, hit: 0.6, dmg: 0, cooldown: 0, first: 0, after: 0.3, near: 0, far: 0, forced: true },
  ],
  beast: [
    { id: 'bite', clip: 'attack', long: 1.12, hit: 0.62, dmg: 1, cooldown: 0, first: 0, after: 0.8, near: 0, far: 1.45 },
    { id: 'emerge', clip: 'emerge', long: 1.0, hit: 1.0, dmg: 0, cooldown: 0, first: 0, after: 0.2, near: 0, far: 0, forced: true },
    { id: 'dragged', clip: 'dragged', long: 1e9, hit: 1e9, dmg: 0, cooldown: 0, first: 0, after: 0.5, near: 0, far: 0, forced: true },
  ],
  // THE FLESHMANCER: his fan of bone shards; rings of hands round him when the hero is near; the
  // sweeping fire, once round the room; and raising the dead out of the bone heaps of his hall.
  fleshmancer: [
    { id: 'shards', clip: 'attack', long: 1.4, hit: 0.8, dmg: 0.42, cooldown: 0, first: 0, after: 0.9, near: 0, far: 9.5 },
    { id: 'rings', clip: 'rings', long: 2.2, hit: 0.86, dmg: 0.9, cooldown: 9, first: 4, after: 0.8, near: 0, far: 5.2 },
    { id: 'fire', clip: 'fire', long: 4.6, hit: 0.56, dmg: 0.5, cooldown: 15, first: 9, after: 1.0, near: 0, far: 5.4 },
    { id: 'raise', clip: 'raise', long: 2.6, hit: 0.72, dmg: 0, cooldown: 17, first: 6, after: 0.8, near: 0, far: 14 },
  ],
  // THE MINI FLESHMANCER: his smaller fire, swept across before him; his call, which raises the dead
  // out of the cult's bodies that lie near.
  minifm: [
    { id: 'miniFire', clip: 'attack', long: 2.8, hit: 17 / 30, dmg: 0.4, cooldown: 0, first: 0, after: 1.6, near: 0, far: 2.4 },
    { id: 'miniRaise', clip: 'raise', long: 2.2, hit: 1.1, dmg: 0, cooldown: 9, first: 1.5, after: 0.8, near: 0, far: 12 },
  ],
};
/** The acts one of them has, as free as he is (the Chained One: none that needs a chain he has broken). */
export function actsOf(m: { kind: MonsterKind }): readonly ActDef[] | null {
  return BOSSES5.on && m.kind in ACTS ? ACTS[m.kind as GaitedKind] : null;
}
export function actDef(m: { kind: MonsterKind; act?: { id: ActId } }): ActDef | null {
  const acts = actsOf(m);
  return acts && m.act ? (acts.find((a) => a.id === m.act!.id) ?? null) : null;
}

// ---------------------------------------------------------------------------------------------
// THE NUMBERS OF EACH FIGHT (the pictures' own where they are the pictures'; the rest the rules')

/** THE HEADSMAN. */
export const HEADSMAN = {
  /** His chop: where the blade bites (tiles before him, to his left), and the strip it harms. */
  chop: { bite: 2.956, left: -0.077, reach: 3.3, half: 0.6 },
  /** The sentence: where the blade bites; the line splits from `from` to `to` tiles before where it would start (art/boss_shots.ts), and burns for `burn`; what stands in it then is burned every `tick` for `tickDmg` of his blow. */
  sentence: { bite: 3.251, left: -0.081, from: 2.7, to: 8.2, half: 0.55, burn: 1.8, tick: 0.3, tickDmg: 0.3, warnFrom: 0.5 },
  /** The wide sweep: round him from `from` to `to`, as far as `reach`; the blade's bearing (radians to his left of the way he faces) at moments of it. */
  sweep: { from: 0.78, to: 1.32, reach: 3.069, warnFrom: 0.35 },
  sweepAt: [[0.78, -2.01], [0.84, -1.85], [0.9, -1.38], [0.93, -0.94], [0.96, -0.19], [0.99, 0.76], [1.02, 1.72], [1.05, 2.55], [1.08, 3.11], [1.2, 4.77], [1.32, 6.4]] as ReadonlyArray<readonly [number, number]>,
  /** The whirling throw: it leaves his hand at `let` and is caught at `back`; from and to where (tiles before him, to his left); how far out its loop goes at the least, and at the most for a hero who stands far off; how near it must pass to harm. */
  axe: { let: 0.8, back: 2.3, from: [0.499, -0.902] as const, to: [0.752, -1.061] as const, far: 4.2, most: 9, wide: 1.35, r: 0.75, warnFrom: 0.4 },
};

/** THE CHAINED ONE. */
export const CHAINED = {
  /** He breaks his left chain when his life falls below `breakAt[0]` of it, the ball's below `breakAt[1]`; and is this many times as fast with each. */
  breakAt: [0.66, 0.33] as const,
  faster: [1, 1.5, 2.2] as const,
  /** As a chain snaps (`snap` seconds into the breaking): whoever is within `r` of him is struck and thrown back. */
  snap: { at: 0.8, r: 2.3 },
  lash: { reach: 3.2, half: 0.6 },
  /** The hook: let go at `let`, it bites at `bite`, and is back at `back`; from where it leaves his hand (tiles before him, to his left), to where it bites at its own reach, to where it falls at his feet; each of his pulls (when it begins and ends). */
  hook: {
    let: 1.2, bite: 1.52, back: 2.6, reach: 4.5, most: 7.5, r: 0.6, warnFrom: 0.3,
    from: [1.527, -0.831] as const, toLeft: -0.249, home: [0.198, -0.423] as const,
    pulls: [[1.6, 1.78], [1.96, 2.14], [2.14, 2.32], [2.32, 2.58]] as ReadonlyArray<readonly [number, number]>,
  },
  /** The chain whirl: round him from `from` to `to`, as far as `reach`; his right chain's bearing goes from `a0` by `turn` radians in that time (his left chain is opposite it); no more than one blow in `gap` seconds. */
  whirl: { from: 0.85, to: 1.87, reach: 2.831, a0: -2.9, turn: 18.5, gap: 0.3, warnFrom: 0.3 },
  /** The ball: thrown at `let`, it comes down `reach` tiles before him at `land`, and harms within `r`. */
  ball: { let: 1.78, land: 2.22, back: 3.26, reach: 4.0, r: 1.5, warnFrom: 0.9 },
};

/** THE OSSUARY AMALGAMATION. */
export const AMALGAM = {
  swipe: { reach: 2.45 },
  /** Arms from the floor: its hands slam at `slam` (tiles before it, to its left) and harm within `slamR`; then `n` arms of the dead burst up, the first under the hero, the others round him between `near` and `far` tiles; each `first` to `last` seconds after the slam (its crack glows `warn` before), harming within `r` as it comes up (`up` after). */
  arms: { slam: [[1.48, -0.51], [1.531, 0.561]] as ReadonlyArray<readonly [number, number]>, slamR: 0.95, n: 5, near: 1.2, far: 2.8, first: 0.55, last: 1.0, warn: 0.5, up: 0.12, r: 0.62, time: 1.3, after: 0.8 },
  /** The skull swarm: each skull's own place and way as it leaves its picture (tiles before it, to its left, its height in game pixels; its way; seconds after the blow), art/bosses3.ts amSwarmSkulls. They fly at `speed` for `far` tiles (a little more or less each), and harm within `r`. */
  swarm: {
    speed: 4, far: 8, r: 0.42, burst: 0.7,
    skulls: [
      [2.415, 0.555, 4.829, 0.925, 0.38, 0.34], [2.447, -0.405, 5.766, 0.961, -0.277, 0.358], [2.483, -0.034, 5.853, 1, -0.024, 0.376], [2.314, -0.642, 6.291, 0.898, -0.439, 0.394],
      [2.194, 0.815, 6.294, 0.83, 0.557, 0.412], [2.385, 0.33, 7.459, 0.974, 0.226, 0.43], [2.31, -0.517, 5.8, 0.935, -0.354, 0.448], [2.28, 0.553, 5.988, 0.926, 0.378, 0.466],
      [2.375, 0.001, 6.658, 1, 0.001, 0.484], [2.168, -0.729, 7.461, 0.867, -0.499, 0.502], [2.192, -0.67, 4.544, 0.889, -0.459, 0.52], [2.225, -0.592, 4.692, 0.914, -0.405, 0.538],
      [2.142, 0.75, 5.809, 0.859, 0.513, 0.556], [2.263, 0.492, 4.345, 0.942, 0.337, 0.574],
    ] as ReadonlyArray<readonly [number, number, number, number, number, number]>,
  },
  /** Devour: its arms rake in from `from` to `to`; what is before it within `reach` and `wide` to either side is dragged to its maw (`maw` tiles before it) at `pull` tiles a second; at the blow the maw harms within `r`. A bone beast eaten gives it back `heal` of its life. */
  devour: { from: 0.92, to: 1.56, reach: 3.6, wide: 1.7, maw: 0.95, pull: 3.1, r: 1.3, heal: 0.05, warnFrom: 0.5 },
  /** A bone beast bursts out of it each time its life falls below one of these shares, where its picture throws it (tiles before it and to its left: behind its right flank), unless `most` already live. */
  burstAt: [0.8, 0.6, 0.4, 0.2] as const,
  burst: { spot: [-1.174, -1.378] as const, way: [-0.789, -0.614] as const, most: 4 },
};

/** THE FLESHMANCER. */
export const FLESHMANCER = {
  /** Below this share of his life he is quicker to cast again, by this much. */
  hurryAt: 0.5,
  hurry: 1.35,
  /** The shards: `fan` of them, `apart` degrees from each other, from the skull (tiles before him, to his left), at `speed` for `reach` tiles; each harms within `r`. */
  shards: { fan: 7, apart: 12, from: [1.476, -0.265] as const, speed: 9, reach: 9, r: 0.42, high: 12, burst: 0.4 },
  /** The rings of hands, as the films lay them: each ring's radius, how many hands, how many left out for a gap; the wave from his slam reaches each at `speed`; a hand harms within `r` of it for `grab` seconds from when it bursts up. */
  rings: { laid: [[1.5, 8, 2], [2.9, 14, 3], [4.3, 20, 4]] as ReadonlyArray<readonly [number, number, number]>, speed: 3.6, r: 0.5, grab: 0.6, time: 1.2, warn: 0.4, left: 0.6, wave: 1.6 },
  /** Raising the dead: as many as `n` at a casting, one from each bone heap of his hall (round him, where it has none); never more than `most` standing; each stirs for `stir` and is up `rise` after. */
  raise: { n: 3, most: 6, stir: 0.3, rise: 1.0, apart: 0.14 },
  /** The sweeping fire: it pours from `pour` to `stop`, coming down `land` tiles from him and running on to `reach`; the floor it has swept burns on `burn` seconds; whoever is in it is burned every `tick`. Which way it pours (radians to his left of the way he faces) at moments of it. */
  fire: { burst: 0.56, pour: 0.62, stop: 3.9, land: 1.0, reach: 4.8, half: 0.45, burn: 0.6, tick: 0.22, burnDmg: 0.5 },
  fireAt: [[0.56, -0.35], [0.62, -0.35], [1, 0.309], [1.5, 1.256], [2, 2.26], [2.5, 3.283], [3, 4.288], [3.5, 5.238], [3.9, 5.933]] as ReadonlyArray<readonly [number, number]>,
};

/** THE MINI FLESHMANCER. */
export const MINIFM = {
  fire: { burst: 17 / 30, pour: 0.6, stop: 2.1, land: 0.6, reach: 2.6, half: 0.4, burn: 0.6, tick: 0.22, burnDmg: 0.5 },
  fireAt: [[17 / 30, -1.1], [0.6, -1.1], [2.1, 1.1]] as ReadonlyArray<readonly [number, number]>,
  /** His call: the dead come up out of as many as `n` of the cult's bodies within `reach` of him, the second `apart` after the first, as the Warden's dead come (SUMMON.rise); never more than `most` of his standing. A body is his to use from `fresh` seconds after it fell. */
  raise: { n: 2, reach: 7, apart: 0.16, most: 4, fresh: 0.8, glow: 0.3 },
};

/** A cultist's body lies this long (seconds), and no more than this many lie at once. */
export const CORPSES = { secs: 90, most: 24, kinds: ['dagger', 'cultist', 'priest'] as readonly MonsterKind[] };

// ---------------------------------------------------------------------------------------------
// Where things are, moment by moment (for the rules, and for the pictures of them: render/bossfx.ts)

/** A number along a list of [moment, number], straight between them. */
export function along(keys: ReadonlyArray<readonly [number, number]>, t: number): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return v0 + ((v1 - v0) * (t - t0)) / Math.max(1e-9, t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
}

/** THE HEADSMAN'S AXE IN FLIGHT, `u` of the way from his hand (0) back to it (1): tiles before him and to his left, its loop going `far` out (art/boss_shots.ts throwPathAt). */
export function axeAt(u: number, far: number = HEADSMAN.axe.far): { fwd: number; left: number } {
  const A = HEADSMAN.axe;
  const k = Math.max(0, Math.min(1, u));
  const s = Math.sin(Math.PI * k);
  return {
    fwd: A.from[0] + (A.to[0] - A.from[0]) * k + (far - (A.from[0] + A.to[0]) / 2) * s,
    left: A.from[1] + (A.to[1] - A.from[1]) * k + A.wide * Math.sin(2 * Math.PI * k) * (0.6 + 0.4 * s),
  };
}

/** THE CHAINED ONE'S HOOK, `t` seconds into his hook and drag, thrown `reach` tiles: tiles before him and to his left, and whether it is flying still; null while it is in his hand. (art/bosses3.ts coHookPath, its reach the rules'.) */
export function hookAt(t: number, reach: number = CHAINED.hook.reach): { fwd: number; left: number; flying: boolean } | null {
  const H = CHAINED.hook;
  if (t < H.let || t >= H.back) return null;
  if (t < H.bite) {
    const k = (t - H.let) / (H.bite - H.let);
    return { fwd: H.from[0] + (reach - H.from[0]) * k, left: H.from[1] + (H.toLeft - H.from[1]) * k, flying: true };
  }
  let done = 0;
  for (const [a, b] of H.pulls) {
    if (t >= b) done += 1;
    else if (t > a) {
      const k = (t - a) / (b - a);
      done += k * k * (3 - 2 * k);
    }
  }
  const k = done / H.pulls.length;
  return { fwd: reach + (H.home[0] - reach) * k, left: H.toLeft + (H.home[1] - H.toLeft) * k, flying: false };
}

/** Which way a stream of fire pours, `t` seconds into its act: radians to his left of the way he faces; null while it does not pour. */
export function fireTurn(mini: boolean, t: number): number | null {
  const F = mini ? MINIFM.fire : FLESHMANCER.fire;
  if (t < F.burst - 1e-6 || t > F.stop + 1e-6) return null;
  return along(mini ? MINIFM.fireAt : FLESHMANCER.fireAt, t);
}

/** Where a hand of a ring of hands is: the `j`th of `n` round a ring of radius `r` about (x, y), the ring turned by `rot`. */
export function ringHand(x: number, y: number, r: number, n: number, rot: number, j: number): { x: number; y: number } {
  const a = (j / n) * Math.PI * 2 + rot;
  return { x: x + Math.cos(a) * r, y: y + Math.sin(a) * r };
}
/** Is the `j`th hand of a ring one of those left out (its gap: `gap` hands from the `g0`th)? */
export function inGap(n: number, g0: number, gap: number, j: number): boolean {
  return (((j - g0) % n) + n) % n < gap;
}

const wrap = (a: number): number => {
  let v = a % (Math.PI * 2);
  if (v > Math.PI) v -= Math.PI * 2;
  if (v <= -Math.PI) v += Math.PI * 2;
  return v;
};

// ---------------------------------------------------------------------------------------------
// THE RULES

export class BossRules {
  private serial = 1;

  constructor(private readonly g: Game) {}

  // ----- a step of one of them ------------------------------------------------------------------

  /**
   * One step of a monster that has a gait and acts (game.ts, updateMonsters: awake, not frozen, not
   * stunned). `slow`: 1, or less while it is chilled. `rage`: 1, or more as Frenzied hurries it.
   */
  step(m: Monster, def: MonsterDef, dt: number, slow: number, rage: number, dx: number, dy: number, dist: number): void {
    const G = GAITS[m.kind as GaitedKind];
    const acts = ACTS[m.kind as GaitedKind];
    const g = this.g;
    const h = g.hero;
    if (!m.gait) m.gait = { mode: 'stand', t: 0 };
    if (!m.moveCd || m.moveCd.length !== acts.length) m.moveCd = acts.map((a) => a.first * g.rng.range(0.7, 1.2));
    // (the Fleshmancer, hurt, casts again sooner)
    const hurry = rage * (m.kind === 'fleshmancer' && m.life < m.maxLife * FLESHMANCER.hurryAt ? FLESHMANCER.hurry : 1);
    if (hurry !== rage) m.cd -= dt * (hurry - rage);
    for (let k = 0; k < m.moveCd.length; k++) m.moveCd[k] -= dt * hurry;
    if (m.state === 'act' && m.act) {
      this.stepAct(m, dt, slow);
      return;
    }
    m.state = 'chase';
    const gait = m.gait;
    const los = dist < 16 && g.sees(m.x, m.y, h.x, h.y);
    const forced = this.forcedAct(m, acts);
    const want = forced >= 0 ? forced : m.cd <= 0 ? this.pickAct(m, acts, dist, los) : -1;
    const moving = gait.mode === 'setOff' || gait.mode === 'walk' || gait.mode === 'halt';
    // (it sets off after a hero who is further off than it likes, or out of its sight)
    const go = forced < 0 && want < 0 && (dist > G.stopAt + G.slack || (!los && dist > 1.2));
    const face = (): void => {
      if (dist > 0.01) {
        m.fx = dx / dist;
        m.fy = dy / dist;
      }
    };
    const to = (mode: typeof gait.mode): void => {
      gait.mode = mode;
      gait.t = 0;
      gait.stop = false;
    };
    if (!moving) {
      m.anim = 'idle';
      gait.t += dt;
      if (gait.mode === 'stand') {
        face();
        if (want >= 0 || go) {
          if (G.raise > 0) to('raise');
          else if (want >= 0) this.startAct(m, acts, want);
          else to('setOff');
        }
      } else if (gait.mode === 'raise') {
        if (gait.t >= G.raise) to('carry');
      } else if (gait.mode === 'carry') {
        face();
        if (want >= 0) this.startAct(m, acts, want);
        else if (go) to('setOff');
        else if (gait.t >= CARRY_FOR) to('lower');
      } else if (gait.t >= G.lower) to('stand');
      return;
    }
    // CARRIED OVER THE FLOOR AT ITS PACE, from the first moment of setting off to the last of stopping
    const sp = m.speed * slow * rage;
    const v = g.wayTo(m, dist < 2.5 && los);
    if (gait.mode !== 'halt' && (v.x !== 0 || v.y !== 0)) {
      m.fx = v.x;
      m.fy = v.y;
    }
    g.slide(m, Math.min(m.r, 0.42), m.fx * sp * dt, m.fy * sp * dt, g.level.walk, true);
    m.anim = 'walk';
    const before = gait.t;
    gait.t += (dt * sp) / G.pace;
    // (it means to stop where its walk next comes round to its first frame: an act is ready and the hero
    // in its reach, or there is no way on; or, there, stopping would leave it as near him as it likes to stand)
    gait.stop = want >= 0 || forced >= 0 || (v.x === 0 && v.y === 0);
    const here = gait.stop || (los && dist - G.pace * G.halt <= G.stopAt);
    if (gait.mode === 'setOff') {
      if (gait.t >= G.setOff) {
        // (its walk's first frame: where stopping begins too)
        if (here) to('halt');
        else to('walk');
      }
    } else if (gait.mode === 'walk') {
      if (here && Math.floor(gait.t / G.cycle) > Math.floor(before / G.cycle)) to('halt');
    } else if (gait.t >= G.halt) {
      to(G.raise > 0 ? 'carry' : 'stand');
      m.anim = 'idle';
    }
  }

  /** An act the rules bring, whatever else it would do: the Chained One breaks a chain, a bone beast bursts out of the amalgamation. -1: none. */
  private forcedAct(m: Monster, acts: readonly ActDef[]): number {
    const frac = m.life / m.maxLife;
    if (m.kind === 'chained') {
      const form = m.form ?? 0;
      if (form < 2 && frac < CHAINED.breakAt[form]) return acts.findIndex((a) => a.id === (form === 0 ? 'breakL' : 'breakBall'));
    } else if (m.kind === 'amalgam') {
      if (m.phase < AMALGAM.burstAt.length && frac < AMALGAM.burstAt[m.phase]) {
        // (as many as may live are out: that one is not made)
        if (this.beasts(m) >= AMALGAM.burst.most) {
          m.phase++;
          return -1;
        }
        return acts.findIndex((a) => a.id === 'burst');
      }
    }
    return -1;
  }

  /** Which of its acts it makes now: the biggest that is ready and that the hero is in reach of; -1, none (it comes on, or waits). */
  private pickAct(m: Monster, acts: readonly ActDef[], dist: number, los: boolean): number {
    const g = this.g;
    for (let i = acts.length - 1; i >= 0; i--) {
      const a = acts[i];
      if (a.forced || (m.moveCd && m.moveCd[i] > 0)) continue;
      if (dist < a.near || dist > a.far) continue;
      // (the Chained One, free of the ball, has none to throw)
      if (a.id === 'ball' && (m.form ?? 0) >= 2) continue;
      if (a.id === 'raise') {
        if (this.called(m) > FLESHMANCER.raise.most - 1) continue;
      } else if (a.id === 'miniRaise') {
        if (this.called(m) > MINIFM.raise.most - 1 || this.bodiesNear(m).length === 0) continue;
      } else if (a.id === 'floorArms') {
        // (out of the floor, wherever he is: it needs no clear line to him)
      } else if (!los) continue;
      // (devour: only a hero who is before it, where its arms rake)
      if (a.id === 'ball' && !g.sees(m.x, m.y, g.hero.x, g.hero.y)) continue;
      return i;
    }
    return -1;
  }

  /** How many bone beasts of an amalgamation live. */
  private beasts(m: Monster): number {
    let n = 0;
    for (const o of this.g.monsters) if (!o.dead && o.kind === 'beast' && o.packId === m.packId) n++;
    return n;
  }

  /** How many of the dead one of them has raised still stand, or are coming. */
  private called(m: Monster): number {
    let n = 0;
    for (const r of this.g.risers) if (r.m.packId === m.packId) n++;
    for (const o of this.g.monsters) if (!o.dead && o !== m && o.packId === m.packId && o.kind === 'skeleton') n++;
    return n;
  }

  /** The cult's bodies a mini fleshmancer could raise the dead out of now: within his reach, lain long enough, not already taken; the nearest first. */
  private bodiesNear(m: Monster): { x: number; y: number; t: number; taken?: boolean }[] {
    const R = MINIFM.raise;
    return this.g.corpses
      .filter((c) => !c.taken && c.t >= R.fresh && Math.hypot(c.x - m.x, c.y - m.y) <= R.reach)
      .sort((a, b) => Math.hypot(a.x - m.x, a.y - m.y) - Math.hypot(b.x - m.x, b.y - m.y));
  }

  // ----- acts --------------------------------------------------------------------------------

  /** It begins an act: turned to the hero, and from here on turned no more until it is over. */
  startAct(m: Monster, acts: readonly ActDef[], i: number): void {
    const g = this.g;
    const h = g.hero;
    const a = acts[i];
    const G = GAITS[m.kind as GaitedKind];
    const dx = h.x - m.x;
    const dy = h.y - m.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.01 && a.id !== 'emerge' && a.id !== 'dragged') {
      m.fx = dx / dist;
      m.fy = dy / dist;
    }
    m.state = 'act';
    m.anim = 'attack';
    m.animT = 0;
    m.move = i;
    m.act = { id: a.id, t: 0, n: this.serial++, hand: handOf(G.trueBack, m.fx, m.fy), a: 0, b: 0, x: h.x, y: h.y };
    const act = m.act;
    if (a.id === 'axe') act.a = Math.max(HEADSMAN.axe.far, Math.min(HEADSMAN.axe.most, dist + 0.7));
    else if (a.id === 'hook') act.a = Math.max(3.5, Math.min(CHAINED.hook.most, dist + 0.6));
    else if (a.id === 'ball') {
      const p = beside(m.x, m.y, m.fx, m.fy, act.hand, CHAINED.ball.reach, 0);
      act.x = p.x;
      act.y = p.y;
    } else if (a.id === 'breakL' || a.id === 'breakBall') {
      g.sfx('bossRoar', 0.9);
      g.msg(a.id === 'breakL' ? `${m.name} tears a chain loose` : `${m.name} tears free of the ball`, MSG.foe);
    } else if (a.id === 'raise' || a.id === 'miniRaise') {
      g.sfx('bossRoar', a.id === 'raise' ? 0.8 : 0.4);
      if (a.id === 'raise') g.msg(`${m.name} raises the dead`, MSG.foe);
    } else if (a.id === 'sentence' || a.id === 'devour' || a.id === 'fire') g.sfx('bossRoar', 0.5);
  }

  /** A step of the act it is making: its clock runs (slowed by a chill until its blow), and what it does at each moment is done. */
  private stepAct(m: Monster, dt: number, slow: number): void {
    const a = actDef(m);
    const act = m.act;
    if (!a || !act) {
      this.breakOff(m);
      return;
    }
    const t0 = act.t;
    act.t = Math.min(a.long, t0 + dt * (t0 < a.hit ? 0.6 + 0.4 * slow : 1));
    const t1 = act.t;
    m.t = a.long - t1;
    this.acting(m, a, t0, t1, dt);
    // (the act itself may have ended it: one eaten, one dead)
    if (m.dead || m.act !== act) return;
    if (t1 >= a.long) this.endAct(m, a);
  }

  /** The act is over: it stands as its pictures leave it, and waits its moment. */
  private endAct(m: Monster, a: ActDef): void {
    const g = this.g;
    const G = GAITS[m.kind as GaitedKind];
    const swift = 1 - 0.3 * wordShare(m, 'swift');
    const i = m.move ?? -1;
    m.state = 'chase';
    m.anim = 'idle';
    m.animT = 0;
    m.act = undefined;
    m.move = -1;
    m.gait = { mode: G.raise > 0 ? 'carry' : 'stand', t: 0 };
    m.cd = a.after * swift * g.rng.range(0.9, 1.15);
    if (m.moveCd && i >= 0 && a.cooldown > 0) m.moveCd[i] = a.cooldown * swift;
    if (a.id === 'breakL' || a.id === 'breakBall') {
      // (free of one more chain, and quicker for it)
      const was = m.form ?? 0;
      m.form = was + 1;
      m.speed *= CHAINED.faster[was + 1] / CHAINED.faster[was];
    } else if (a.id === 'burst') m.phase++;
  }

  /** An act is broken off (a stun, a stagger: never a boss's). */
  breakOff(m: Monster): void {
    if (m.state !== 'act') return;
    const G = gaitOf(m.kind);
    m.state = 'chase';
    m.anim = 'idle';
    m.act = undefined;
    m.move = -1;
    m.gait = { mode: G && G.raise > 0 ? 'carry' : 'stand', t: 0 };
    if (this.g.hero.held && m.kind === 'chained') this.g.hero.held = 0;
  }

  /** What one of them does to the hero with a blow of its own, `mult` times its blow. */
  private blow(m: Monster, mult: number): void {
    const g = this.g;
    g.hurtHero(g.rollMonsterDmg(m) * mult, g.monsterElement(m), m.words, m);
  }

  /** Where the hero is from one of them as it acts: tiles before it, and to the left it is drawn with. */
  private rel(m: Monster): { fwd: number; left: number } {
    const h = this.g.hero;
    return fromFigure(m.x, m.y, m.fx, m.fy, m.act ? m.act.hand : 1, h.x, h.y);
  }

  private peril(m: Monster, kind: PerilKind, x: number, y: number, more: Partial<Peril> = {}): Peril {
    const g = this.g;
    const p: Peril = {
      kind, x, y, fx: m.fx, fy: m.fy, t: 0, hit: 0, dur: 1, dmg: 0, el: g.monsterElement(m), words: m.words, from: m.name, done: 0, a: 0, b: 0, c: 0, d: 0,
      hand: m.act ? m.act.hand : 1, ...more,
    };
    const half = g.halfOf(m);
    if (half) p.half = half;
    g.perils.push(p);
    return p;
  }

  /** From `t0` to `t1` of act `a`: what it does. */
  private acting(m: Monster, a: ActDef, t0: number, t1: number, dt: number): void {
    const g = this.g;
    const h = g.hero;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const here = (fwd: number, left: number): { x: number; y: number } => beside(m.x, m.y, m.fx, m.fy, act.hand, fwd, left);
    const dist = Math.hypot(h.x - m.x, h.y - m.y);
    switch (a.id) {
      // ----- THE HEADSMAN
      case 'chop': {
        if (!at(a.hit)) break;
        const C = HEADSMAN.chop;
        const r = this.rel(m);
        if (r.fwd > -0.2 && r.fwd <= C.reach && Math.abs(r.left - C.left) <= C.half) this.blow(m, a.dmg);
        const b = here(C.bite, C.left);
        this.peril(m, 'crack', b.x, b.y, { dur: 1.2 });
        g.emit({ t: 'shake', amount: 3 });
        g.sfx('slam', 0.7);
        break;
      }
      case 'sentence': {
        if (!at(a.hit)) break;
        const S = HEADSMAN.sentence;
        const r = this.rel(m);
        if (r.fwd > -0.2 && r.fwd <= S.bite - S.from + S.to + 0.2 && Math.abs(r.left - S.left) <= S.half) this.blow(m, a.dmg);
        // (the split: from where the line begins, the blade's bite `from` along it)
        const o = here(S.bite - S.from, S.left);
        this.peril(m, 'split', o.x, o.y, { dur: S.burn, dmg: g.rollMonsterDmg(m) * S.tickDmg, el: 'fire' });
        g.emit({ t: 'shake', amount: 6 });
        g.sfx('slam', 1);
        break;
      }
      case 'sweep': {
        const S = HEADSMAN.sweep;
        if (t1 <= S.from || t0 >= S.to || act.b) break;
        if (at(S.from)) g.sfx('swing', 0.9);
        if (dist > S.reach + TUNE.heroRadius * 0.5) break;
        // (the blade comes round: it strikes him as it passes where he stands)
        const r = this.rel(m);
        const bearing = Math.atan2(r.left, r.fwd);
        const b0 = along(HEADSMAN.sweepAt, Math.max(S.from, t0));
        const b1 = along(HEADSMAN.sweepAt, Math.min(S.to, t1));
        if (this.passes(b0, b1, bearing)) {
          act.b = 1;
          this.blow(m, a.dmg);
          g.knockHero(m.x, m.y, 1);
        }
        break;
      }
      case 'axe': {
        const A = HEADSMAN.axe;
        if (at(A.let)) g.sfx('swing', 0.8);
        if (t1 <= A.let || t0 >= A.back) break;
        // (out and back: it harms once on its way out and once on its way back)
        const steps = Math.max(1, Math.ceil((t1 - t0) / 0.012));
        for (let s = 1; s <= steps; s++) {
          const t = t0 + ((t1 - t0) * s) / steps;
          const u = (t - A.let) / (A.back - A.let);
          if (u <= 0 || u >= 1) continue;
          const bit = u < 0.5 ? 1 : 2;
          if (act.b & bit) continue;
          const p = axeAt(u, act.a);
          const w = here(p.fwd, p.left);
          if (Math.hypot(h.x - w.x, h.y - w.y) <= A.r) {
            act.b |= bit;
            this.blow(m, a.dmg);
          }
        }
        break;
      }
      // ----- THE CHAINED ONE
      case 'lash': {
        if (!at(a.hit)) break;
        const L = CHAINED.lash;
        const r = this.rel(m);
        if (r.fwd > -0.2 && r.fwd <= L.reach && Math.abs(r.left) <= L.half) this.blow(m, a.dmg);
        g.emit({ t: 'shake', amount: 2 });
        g.sfx('slam', 0.5);
        break;
      }
      case 'hook': {
        const H = CHAINED.hook;
        if (at(H.let)) g.sfx('swing', 0.7);
        if (t1 <= H.let) break;
        if (!act.b && t0 < H.bite + 0.06) {
          // (flung: it catches a hero it passes, or bites the floor)
          const steps = Math.max(1, Math.ceil((t1 - t0) / 0.012));
          for (let s = 1; s <= steps && !act.b; s++) {
            const p = hookAt(Math.min(H.bite, t0 + ((t1 - t0) * s) / steps), act.a);
            if (!p) continue;
            const w = here(p.fwd, p.left);
            if (Math.hypot(h.x - w.x, h.y - w.y) <= H.r && h.invuln <= 0 && !h.move && !g.over) {
              act.b = 1;
              this.blow(m, a.dmg);
              h.held = H.back - t1 + 0.05;
              g.emit({ t: 'text', x: h.x, y: h.y, text: 'Hooked', color: '#ff8a80' });
              g.sfx('hit', 0.8);
            }
          }
          if (at(H.bite) && !act.b) g.sfx('slam', 0.4);
        }
        if (act.b === 1) {
          // (dragged in with it, hand over hand)
          const p = hookAt(t1, act.a);
          if (p && !g.over) {
            const w = here(Math.max(p.fwd, 0.9), p.left);
            g.slide(h, TUNE.heroRadius, w.x - h.x, w.y - h.y, g.level.walk);
            h.held = Math.max(h.held ?? 0, 0.05);
          } else {
            act.b = 2;
            h.held = 0;
          }
        }
        break;
      }
      case 'whirl': {
        const W = CHAINED.whirl;
        if (at(W.from)) g.sfx('swing', 1);
        if (t1 <= W.from || t0 >= W.to) break;
        if (dist > W.reach + TUNE.heroRadius * 0.5 || t1 - act.a < W.gap) break;
        const r = this.rel(m);
        const bearing = Math.atan2(r.left, r.fwd);
        const ang = (t: number): number => W.a0 + (W.turn * (Math.max(W.from, Math.min(W.to, t)) - W.from)) / (W.to - W.from);
        // (his right chain, and his left opposite it)
        if (this.passes(ang(t0), ang(t1), bearing) || this.passes(ang(t0) + Math.PI, ang(t1) + Math.PI, bearing)) {
          act.a = t1;
          this.blow(m, a.dmg);
          g.knockHero(m.x, m.y, 0.6);
        }
        break;
      }
      case 'ball': {
        const B = CHAINED.ball;
        if (at(B.let)) g.sfx('swing', 1);
        if (!at(B.land)) break;
        if (Math.hypot(h.x - act.x, h.y - act.y) <= B.r) {
          this.blow(m, a.dmg);
          g.knockHero(act.x, act.y, 1);
        }
        this.peril(m, 'crash', act.x, act.y, { dur: 1.4 });
        g.emit({ t: 'shake', amount: 6 });
        g.sfx('slam', 1);
        break;
      }
      case 'breakL':
      case 'breakBall': {
        if (!at(CHAINED.snap.at)) break;
        if (dist <= CHAINED.snap.r) {
          this.blow(m, a.dmg);
          g.knockHero(m.x, m.y, 1);
        }
        g.emit({ t: 'burst', x: m.x, y: m.y, r: CHAINED.snap.r, el: 'phys', style: 'shock' });
        g.emit({ t: 'shake', amount: 5 });
        g.sfx('explode', 0.8);
        // (what is left lying where it broke: the art's, of the way he is seen)
        this.peril(m, 'left', m.x, m.y, { dur: Infinity, a: a.id === 'breakL' ? 0 : 1 });
        break;
      }
      // ----- THE AMALGAMATION
      case 'swipe': {
        if (!at(a.hit)) break;
        const r = this.rel(m);
        if (dist <= AMALGAM.swipe.reach && r.fwd > -0.3) {
          this.blow(m, a.dmg);
          g.knockHero(m.x, m.y, 0.6);
        }
        g.emit({ t: 'shake', amount: 2 });
        g.sfx('swing', 0.8);
        break;
      }
      case 'floorArms': {
        if (!at(a.hit)) break;
        const A = AMALGAM.arms;
        let struck = false;
        for (const [f, l] of A.slam) {
          const s = here(f, l);
          this.peril(m, 'crash', s.x, s.y, { dur: 1.4 });
          if (!struck && Math.hypot(h.x - s.x, h.y - s.y) <= A.slamR) {
            struck = true;
            this.blow(m, a.dmg);
          }
        }
        g.emit({ t: 'shake', amount: 5 });
        g.sfx('slam', 1);
        // (arms of the dead: the first where he stands now, the others round him)
        const dmg = g.rollMonsterDmg(m) * a.dmg;
        const spots: { x: number; y: number }[] = [{ x: h.x, y: h.y }];
        for (let k = 0, tries = 0; spots.length < A.n && tries < 40; tries++) {
          const ang = g.rng.range(0, Math.PI * 2);
          const far = g.rng.range(A.near, A.far);
          const x = h.x + Math.cos(ang) * far;
          const y = h.y + Math.sin(ang) * far;
          if (!g.isOpen(x, y) || spots.some((q) => Math.hypot(q.x - x, q.y - y) < 1.1)) continue;
          spots.push({ x, y });
          k++;
        }
        spots.forEach((s, k) => {
          const hit = A.first + ((A.last - A.first) * k) / Math.max(1, A.n - 1);
          this.peril(m, 'arm', s.x, s.y, { hit, dur: hit + A.time + A.after, dmg, c: k });
        });
        break;
      }
      case 'swarm': {
        if (!at(a.hit)) break;
        const S = AMALGAM.swarm;
        g.sfx('fire', 0.9);
        g.emit({ t: 'shake', amount: 2 });
        const dmg = g.rollMonsterDmg(m) * a.dmg;
        S.skulls.forEach(([f, l, high, wf, wl, after], k) => {
          const s = here(f, l);
          const w = beside(0, 0, m.fx, m.fy, act.hand, wf, wl);
          const n = Math.hypot(w.x, w.y) || 1;
          this.peril(m, 'skull', s.x, s.y, { fx: w.x / n, fy: w.y / n, t: -after, hit: 1e9, dur: 1e9, dmg, a: S.far * g.rng.range(0.75, 1.1), b: high, c: k });
        });
        break;
      }
      case 'devour': {
        const D = AMALGAM.devour;
        const maw = here(D.maw, 0);
        if (t1 > D.from && t0 < D.to) {
          // (its arms rake in: what is before it is dragged to its maw, a bone beast of its own too)
          const pull = (b: { x: number; y: number }, rad: number): boolean => {
            const r = fromFigure(m.x, m.y, m.fx, m.fy, act.hand, b.x, b.y);
            if (r.fwd < 0.2 || r.fwd > D.reach || Math.abs(r.left) > D.wide) return false;
            const ddx = maw.x - b.x;
            const ddy = maw.y - b.y;
            const d = Math.hypot(ddx, ddy);
            if (d < 0.25) return true;
            const step = Math.min(d, D.pull * dt);
            g.slide(b, rad, (ddx / d) * step, (ddy / d) * step, g.level.walk);
            return true;
          };
          if (!h.move && !g.over) pull(h, TUNE.heroRadius);
          for (const o of g.monsters) {
            if (o.dead || o.kind !== 'beast' || o.packId !== m.packId) continue;
            if (o.act && o.act.id === 'emerge') continue;
            if (pull(o, 0.3)) this.drag(o, m);
            else if (o.act && o.act.id === 'dragged') this.breakOff(o);
          }
        }
        if (at(a.hit)) {
          if (Math.hypot(h.x - maw.x, h.y - maw.y) <= D.r) this.blow(m, a.dmg);
          g.emit({ t: 'shake', amount: 4 });
          g.sfx('slam', 0.9);
          // (any bone beast it has dragged in is eaten back)
          for (const o of g.monsters) {
            if (o.dead || o.kind !== 'beast' || !o.act || o.act.id !== 'dragged') continue;
            if (Math.hypot(o.x - maw.x, o.y - maw.y) <= D.r + 0.5) {
              o.dead = true;
              m.life = Math.min(m.maxLife, m.life + m.maxLife * D.heal);
              g.emit({ t: 'gone', x: o.x, y: o.y, what: 'beast' });
              g.emit({ t: 'text', x: m.x, y: m.y, text: 'heals', color: '#ff8a80' });
            } else this.breakOff(o);
          }
        }
        break;
      }
      case 'burst': {
        if (!at(a.hit)) break;
        const B = AMALGAM.burst;
        let s = here(B.spot[0], B.spot[1]);
        if (!g.free(g.level.walk, s.x, s.y, 0.36)) {
          const alt = g.spotsRound(m.x, m.y, 6).find((q) => Math.hypot(q.x - m.x, q.y - m.y) > m.r + 0.3);
          if (alt) s = alt;
        }
        const beast = g.spawn('beast', s.x, s.y, m.packId, 0, false, g.rng);
        const w = beside(0, 0, m.fx, m.fy, act.hand, B.way[0], B.way[1]);
        const n = Math.hypot(w.x, w.y) || 1;
        beast.fx = w.x / n;
        beast.fy = w.y / n;
        beast.gait = { mode: 'stand', t: 0 };
        beast.moveCd = ACTS.beast.map(() => 0);
        this.startAct(beast, ACTS.beast, ACTS.beast.findIndex((q) => q.id === 'emerge'));
        beast.fx = w.x / n;
        beast.fy = w.y / n;
        g.emit({ t: 'shake', amount: 3 });
        g.sfx('explode', 0.5);
        break;
      }
      // ----- THE BONE BEAST
      case 'bite': {
        if (!at(a.hit)) break;
        const r = this.rel(m);
        if (dist <= 1.5 + TUNE.heroRadius * 0.5 && r.fwd > -0.2) this.blow(m, a.dmg);
        g.sfx('swing', 0.4);
        break;
      }
      case 'emerge':
      case 'dragged':
        break;
      // ----- THE FLESHMANCER
      case 'shards': {
        if (!at(a.hit)) break;
        const S = FLESHMANCER.shards;
        const o = here(S.from[0], S.from[1]);
        const aim = Math.atan2(h.y - o.y, h.x - o.x);
        const dmg = g.rollMonsterDmg(m) * a.dmg;
        for (let i = 0; i < S.fan; i++) {
          const ang = aim + ((i - (S.fan - 1) / 2) * S.apart * Math.PI) / 180;
          // (it is out of the skull's jaws a little way before it is the game's: `d`, how far it has flown)
          this.peril(m, 'shard', o.x + Math.cos(ang) * 0.3, o.y + Math.sin(ang) * 0.3, { fx: Math.cos(ang), fy: Math.sin(ang), hit: 1e9, dur: 1e9, dmg, b: i, c: S.high, d: 0.3 });
        }
        g.sfx('fire', 0.8);
        g.emit({ t: 'shake', amount: 2 });
        break;
      }
      case 'rings': {
        if (!at(a.hit)) break;
        const R = FLESHMANCER.rings;
        this.peril(m, 'wave', m.x, m.y, { dur: R.wave });
        const dmg = g.rollMonsterDmg(m) * a.dmg;
        R.laid.forEach(([rad, n, gap], i) => {
          const hit = rad / R.speed;
          // (each ring turned its own way, its gap where the dice put it)
          this.peril(m, 'ring', m.x, m.y, { fx: g.rng.range(0, Math.PI * 2), fy: gap, hit, dur: hit + R.time + R.left, dmg, a: rad, b: n, c: g.rng.int(0, n - 1), d: i });
        });
        g.emit({ t: 'shake', amount: 5 });
        g.sfx('slam', 0.9);
        break;
      }
      case 'raise': {
        if (!at(a.hit)) break;
        this.raiseFromHeaps(m);
        g.emit({ t: 'shake', amount: 3 });
        break;
      }
      case 'fire':
      case 'miniFire': {
        const mini = a.id === 'miniFire';
        const F = mini ? MINIFM.fire : FLESHMANCER.fire;
        if (at(F.burst)) {
          g.sfx('fire', 1);
          g.emit({ t: 'shake', amount: mini ? 1 : 3 });
        }
        if (at(F.stop)) {
          // (the floor it swept stays scorched a while: a picture only)
          this.peril(m, 'scorch', m.x, m.y, { dur: 7, a: mini ? 1 : 0 });
        }
        if (t1 < F.pour || t0 > F.stop + F.burn) break;
        // (burned every `tick` while he is in the stream, or on the floor it has just swept)
        if (t1 - act.a < F.tick) break;
        const r = this.rel(m);
        const d = Math.hypot(r.fwd, r.left);
        if (d < F.land - 0.3 || d > F.reach + 0.35) break;
        const bearing = Math.atan2(r.left, r.fwd);
        const now = fireTurn(mini, Math.min(F.stop, t1));
        if (now === null) break;
        const tol = Math.atan2(F.half, d);
        const off = wrap(bearing - now);
        const inStream = t1 <= F.stop && Math.abs(off) <= tol;
        // (how far the stream has turned in the time the floor burns on)
        const was = fireTurn(mini, Math.max(F.pour, t1 - F.burn));
        const swept = was === null ? 0 : now - was;
        const inBurn = off < 0 && off >= -(swept + tol);
        if (!inStream && !inBurn) break;
        act.a = t1;
        g.hurtHero(g.rollMonsterDmg(m) * a.dmg * (inStream ? 1 : F.burnDmg), 'fire', m.words, m);
        break;
      }
      case 'miniRaise': {
        const R = MINIFM.raise;
        // (his fire catches the bodies a moment before the dead come up out of them)
        if (at(a.hit - R.glow)) {
          const bodies = this.bodiesNear(m).slice(0, Math.max(0, Math.min(R.n, R.most - this.called(m))));
          bodies.forEach((c, k) => {
            c.taken = true;
            const add = g.spawn('skeleton', c.x, c.y, m.packId, 0, false, g.rng);
            g.monsters.splice(g.monsters.indexOf(add), 1);
            add.state = 'chase';
            add.cd = 0.8;
            add.xp = 0;
            const ddx = h.x - c.x;
            const ddy = h.y - c.y;
            const dd = Math.hypot(ddx, ddy) || 1;
            add.fx = ddx / dd;
            add.fy = ddy / dd;
            g.risers.push({ m: add, age: -(R.glow + k * R.apart) });
            g.emit({ t: 'gone', x: c.x, y: c.y, what: 'corpse' });
          });
        }
        break;
      }
    }
  }

  /** Does something that turns from bearing `b0` to `b1` (radians, going up) pass bearing `at`? */
  private passes(b0: number, b1: number, at: number): boolean {
    if (b1 <= b0) return false;
    // (the least turn from b0 that reaches `at`)
    let need = (at - b0) % (Math.PI * 2);
    if (need < 0) need += Math.PI * 2;
    return need <= b1 - b0;
  }

  /** A bone beast is being dragged in to its maker's maw: it does nothing else. */
  private drag(o: Monster, maker: Monster): void {
    if (o.act && o.act.id === 'dragged') return;
    this.breakOff(o);
    this.startAct(o, ACTS.beast, ACTS.beast.findIndex((q) => q.id === 'dragged'));
    const dx = maker.x - o.x;
    const dy = maker.y - o.y;
    const d = Math.hypot(dx, dy) || 1;
    // (its skull turned back toward what drags it; it is drawn going from it)
    o.fx = -dx / d;
    o.fy = -dy / d;
  }

  /** THE FLESHMANCER RAISES THE DEAD: one out of each bone heap of his hall (where it has none, round him), each a little after the one before. */
  private raiseFromHeaps(m: Monster): void {
    const g = this.g;
    const h = g.hero;
    const R = FLESHMANCER.raise;
    const room = Math.max(0, Math.min(R.n, R.most - this.called(m)));
    if (room <= 0) return;
    const heaps = (g.level.floor.heaps ?? [])
      .filter((p) => Math.hypot(p.x - m.x, p.y - m.y) <= 18)
      .sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y));
    const spots: { x: number; y: number }[] = [];
    for (const p of heaps) {
      if (spots.length >= room) break;
      // (it stands up beside its heap, on the side the hero is)
      const s = g.spotsRound(p.x, p.y, 5).sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0];
      if (s) spots.push(s);
    }
    if (spots.length < room) for (const s of g.spotsRound(m.x, m.y, room + 1).slice(1)) if (spots.length < room) spots.push(s);
    spots.forEach((s, k) => {
      const add = g.spawn('skeleton', s.x, s.y, m.packId, 0, false, g.rng);
      g.monsters.splice(g.monsters.indexOf(add), 1);
      add.state = 'chase';
      add.cd = 0.8;
      add.xp = 0;
      const dx = h.x - s.x;
      const dy = h.y - s.y;
      const d = Math.hypot(dx, dy) || 1;
      add.fx = dx / d;
      add.fy = dy / d;
      g.risers.push({ m: add, age: -k * R.apart, way: 'gather', rise: R.stir + R.rise });
    });
  }

  // ----- what they leave on the floor, and send across it -----------------------------------------

  /** A step of every peril. */
  stepPerils(dt: number): void {
    const g = this.g;
    const h = g.hero;
    const list = g.perils;
    for (let k = list.length - 1; k >= 0; k--) {
      const p = list[k];
      const t0 = p.t;
      p.t += dt;
      const hurt = (mult = 1): void => g.hurtHero(p.dmg * mult, p.el, p.words, null, p.from, p.x, p.y, p.half);
      if (p.kind === 'split') {
        // (the split burns: whoever stands in it is burned, tick by tick)
        const S = HEADSMAN.sentence;
        const next = 0.12 + S.tick * p.done;
        if (p.t >= next && next < S.burn) {
          p.done++;
          const r = fromFigure(p.x, p.y, p.fx, p.fy, 1, h.x, h.y);
          if (r.fwd >= S.from - 0.2 && r.fwd <= S.to + 0.2 && Math.abs(r.left) <= S.half - 0.05) hurt();
        }
      } else if (p.kind === 'arm') {
        if (!p.done && p.t >= p.hit + AMALGAM.arms.up) {
          p.done = 1;
          if (Math.hypot(h.x - p.x, h.y - p.y) <= AMALGAM.arms.r) hurt();
          g.emit({ t: 'shake', amount: 1 });
        }
      } else if (p.kind === 'skull' || p.kind === 'shard') {
        if (p.t > 0 && !p.done) {
          const skull = p.kind === 'skull';
          const speed = skull ? AMALGAM.swarm.speed : FLESHMANCER.shards.speed;
          const rad = skull ? AMALGAM.swarm.r : FLESHMANCER.shards.r;
          const far = skull ? p.a : FLESHMANCER.shards.reach;
          const fly = Math.min(dt, p.t) * speed;
          const steps = Math.max(1, Math.ceil(fly / 0.2));
          let burst = false;
          for (let s = 0; s < steps && !burst; s++) {
            p.x += (p.fx * fly) / steps;
            p.y += (p.fy * fly) / steps;
            p.d += fly / steps;
            if (Math.hypot(h.x - p.x, h.y - p.y) <= rad && h.invuln <= 0 && !h.move && !g.over) {
              hurt();
              burst = true;
            } else if (p.d >= far || !g.isOpen(p.x, p.y)) burst = true;
          }
          if (burst) {
            p.done = 1;
            p.hit = p.t;
            p.dur = p.t + (skull ? AMALGAM.swarm.burst : FLESHMANCER.shards.burst);
          }
        }
      } else if (p.kind === 'ring') {
        const R = FLESHMANCER.rings;
        if (!p.done && p.t >= p.hit + 0.05 && t0 <= p.hit + R.grab) {
          const d = Math.hypot(h.x - p.x, h.y - p.y);
          if (Math.abs(d - p.a) <= R.r) {
            // (the hand nearest him round the ring: is it there, and near enough?)
            const n = p.b;
            const ang = Math.atan2(h.y - p.y, h.x - p.x) - p.fx;
            const j = ((Math.round((ang / (Math.PI * 2)) * n) % n) + n) % n;
            const q = ringHand(p.x, p.y, p.a, n, p.fx, j);
            if (!inGap(n, p.c, p.fy, j) && Math.hypot(h.x - q.x, h.y - q.y) <= R.r) {
              p.done = 1;
              hurt();
            }
          }
        }
      }
      if (p.t >= p.dur) list.splice(k, 1);
    }
    // (the cult's bodies lie a while, and are gone)
    const cs = g.corpses;
    for (let k = cs.length - 1; k >= 0; k--) {
      cs[k].t += dt;
      if (cs[k].t > CORPSES.secs) cs.splice(k, 1);
    }
  }

  // ----- as one of them dies -----------------------------------------------------------------------

  /** One of the monsters has died (game.ts, kill): what that means here. */
  died(m: Monster): void {
    const g = this.g;
    if (m.kind === 'chained' && g.hero.held) g.hero.held = 0;
    if (m.kind === 'amalgam') {
      // (its bone beasts fall apart with it)
      for (const o of [...g.monsters]) if (!o.dead && o.kind === 'beast' && o.packId === m.packId) g.kill(o);
    }
    if (m.kind === 'fleshmancer' || m.kind === 'minifm') {
      // (THE DEAD HE RAISED FALL WITH HIM: they were up by his will alone. Those still coming up go back
      // into the ground; those up fall where they stand, worth nothing: they were his)
      g.risers = g.risers.filter((r) => r.m.packId !== m.packId || r.m.kind !== 'skeleton');
      for (const o of g.monsters) {
        if (o.dead || o === m || o.kind !== 'skeleton' || o.packId !== m.packId) continue;
        o.dead = true;
        g.emit({ t: 'die', x: o.x, y: o.y, kind: o.kind, elite: o.elite, champion: o.champion, boss: false, fx: o.fx, fy: o.fy });
      }
    }
    if (CORPSES.kinds.includes(m.kind)) {
      g.corpses.push({ x: m.x, y: m.y, t: 0 });
      if (g.corpses.length > CORPSES.most) g.corpses.shift();
    }
  }
}

/** What a boss's or a beast's element is when nothing else says (for the checks). */
export const elementOf = (kind: MonsterKind): Element => MONSTERS[kind].element;
/** (for the checks) How long the Warden's dead take to come up: the mini fleshmancer's come the same way. */
export const CRAWL_RISE = SUMMON.rise;
