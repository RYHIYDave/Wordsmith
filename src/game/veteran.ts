// THE VETERAN: the Brawler made again, a fighter of punches and kicks with three globes over him (the art chat's
// art/brawler-looks, docs/mockups/brawler_looks/README.md; his pick of its looks, 2 Nov 2026, “7, the Veteran”).
//
// His words, 2 Nov 2026 (to the art chat): “So what I want is three empty globes above him.  Cyan is punch, pink is kick,
// and yellow is jump.  As you tap or hold, the globes fill and it locks in your combo.  And early swipe just does a jump,
// like inputting a dodge.  A swipe then an input puts the globe in either pink or cyan fire, and that’s the uppercut or jump
// kick.  I don’t want anything reused from the original brawler, we need a totally new look.  Going to have to be heavy and
// weighty so you have time to react and input to the situation.  As your attack speed goes up, hopefully you’ve learned the
// character and will be able to input the combos faster”; told pink and gold glows are the enemy's by his rulebook, “Keep
// the rule (Recommended)” (cyan punch, hot orange kick, white jump; the fires cyan and orange). “Like jab cross flying knee
// will be the strongest combo for single target.” Handed to the main chat with his “Yes, hand them over (Recommended)” (the
// art chat's post of 3 Nov, 08:52). To the main chat, 3 Nov: 08:16, of the jump in a combo, “Swipes spend the jump
// (Recommended)”; 09:14, “Got time to put in the new brawler and the rocket jump?”, and 25.0 held for him, “Hold 25.0 for
// them”; 09:18, “And redo the skill tree to better match his new style” and “You should have everything from art”; his tree
// (game/talents.ts VETERAN_TREE) by 09:42, “Yes, build it (Recommended)”, and by 09:53, “Swap two in (Recommended)”.
//
// THE RULES HERE are the main chat's reading of his words and the art chat's table of his combos (VET_COMBOS in
// src/dev/veteran_moves.ts): his moves' frames, blows and reach are the art's own, every one (a test holds them to it).
//
// HOW A COMBO GOES. Three globes over him. Each press fills the next: a TAP a punch (cyan), a HOLD a kick (hot orange), a
// SWIPE the jump (white). Three in and the combo is LOCKED: nothing more goes in until it has been played out. Presses go in
// as fast as they are made (his “hopefully you’ve learned the character and will be able to input the combos faster”) and
// are played in turn, each move whole: its held wind-up, its blow, its wind-down. A swipe is the dodging jump; a TAP OR A
// HOLD MADE WHILE A SWIPE'S JUMP HAS NOT YET LEFT THE FLOOR (or before it has begun) sets that globe in FIRE instead: a tap
// the flying uppercut (cyan fire), a hold the flying knee after two punches, else the spinning jump kick (orange fire; as
// the combo's first, the spinning jump kick that closes in). Every swipe spends the jump (his “Swipes spend the jump”): with
// it not ready, a swipe does nothing. The combo is over when its last move is played and nothing more is pressed for
// VET_TUNE.gap seconds; the globes go out.
//
// WHICH MOVE A PRESS MAKES (the art chat's six combos, and the rest by the same rule): a TAP is the jab as the first of a
// combo or after the jump; after the jab the cross, after the cross the hook; after a kick the spinning elbow; after the hook,
// the elbow or the uppercut, the cross. A HOLD is the round kick, but after the round kick the push kick. A swipe and a tap,
// the flying uppercut. A swipe and a hold: as the first, the spinning jump kick that closes in; after two punches the flying
// knee; else the spinning jump kick.

import { VET_BAKED } from './veteran_baked';

/**
 * THE SWITCH: off, the Brawler is as he was (and he is left out of the release besides: game/brawler.ts BRAWLER, his
 * 22:52, 2 Nov, “Leave him out for now (Recommended)”); on, the Brawler is the Veteran: his tree (game/talents.ts
 * VETERAN_TREE), his moves and his globes. Off until he has seen him in play and said yes.
 */
export const VETERAN = { on: false };

/** His moves, by the art's own names (src/dev/veteran_moves.ts VET_MOTIONS). */
export type VetMoveId = 'stand' | 'run' | 'dodge' | 'jab' | 'cross' | 'hook' | 'roundkick' | 'push' | 'elbow' | 'uppercut' | 'spinkick' | 'spinkickClose' | 'knee' | 'hurt' | 'fall';
/** A move made by a press (not his stand, run, hurt or fall). */
export type VetBlowId = Exclude<VetMoveId, 'stand' | 'run' | 'hurt' | 'fall'>;
/** What a press is. */
export type VetInput = 'tap' | 'hold' | 'swipe' | 'swipeTap' | 'swipeHold';
/** What a globe is filled with: a punch (cyan), a kick (hot orange), the jump (white), or set in fire, cyan or orange. */
export type VetGlobe = 'punch' | 'kick' | 'jump' | 'punchFire' | 'kickFire';
/** How a foe takes a blow (the art's reactions). */
export type VetReact = 'snap' | 'reel' | 'knock' | 'launch' | 'fly' | 'kneed' | 'aside' | 'shove';

/** The frames of his moves are thirty a second, at his own pace (faster as his attack speed rises). */
export const VET_FPS = 30;

/**
 * A BLOW'S FORCE, in tiles and degrees, from where he stood as the move began, along the way he faced then: a CONE shot out
 * along a straight blow, a CRESCENT flung out flat across a round one, the spinning jump kick's ROUND crescent rolled out
 * round him; `long` the frames its front takes to get out to its reach, from the blow (or `from`). (The push kick's is a cone
 * along the floor from his heel.) Each foe it comes to is hit once, as its front reaches him.
 */
export interface VetForce {
  shape: 'cone' | 'crescent' | 'round';
  reach: number;
  deg: number;
  long: number;
  react: VetReact;
  /** Its line, degrees to his left of his forward (0: straight ahead). */
  dir?: number;
  /** The frame it is thrown, if later than the blow. */
  from?: number;
}
export interface VetMoveDef {
  /** Frames, at thirty a second. */
  long: number;
  /** The blow: the last frame of the held wind-up, and the frame it lands; a punch's or a kick's. */
  strike: { from: number; at: number; kind: 'punch' | 'kick' } | null;
  force: VetForce | null;
  /** How far the move carries him in all, tiles along his forward and to his left; the frame it is all done by. */
  carry: readonly [number, number];
  /** Frames he is off the floor (first and last), if any. */
  air: readonly [number, number] | null;
  /** Its share of the hit of the ability it is made by (the tap's for a punch, the hold's for a kick: the fire moves', their kind's). */
  share: number;
  /** The globe it fills. */
  globe: VetGlobe;
}

/**
 * HIS MOVES' NUMBERS, the art's own (src/dev/veteran_moves.ts: each motion's `long`, its strike's `from`, `at` and `force`,
 * where its `carry` ends and the frames it is in the air; tests/veteran_rules.test.ts holds them to it). The shares are the
 * main chat's starting numbers, his to try and change: the jab light, the cross and the hook steady, the kicks heavier, the
 * fire moves big; the flying knee the strongest single blow (his “jab cross flying knee will be the strongest combo for
 * single target”).
 */
export const VET_MOVES: Record<VetBlowId, VetMoveDef> = {
  dodge: { long: 40, strike: null, force: null, carry: [-1.02, 0.31], air: [13, 24], share: 0, globe: 'jump' },
  jab: { long: 28, strike: { from: 11, at: 12, kind: 'punch' }, force: { shape: 'cone', reach: 2.5, deg: 36, dir: 0, long: 3, react: 'snap' }, carry: [0.75, 0], air: null, share: 0.6, globe: 'punch' },
  cross: { long: 28, strike: { from: 12, at: 14, kind: 'punch' }, force: { shape: 'cone', reach: 2.5, deg: 42, dir: 0, long: 3, react: 'reel' }, carry: [0.75, 0], air: null, share: 1.0, globe: 'punch' },
  hook: { long: 32, strike: { from: 13, at: 15, kind: 'punch' }, force: { shape: 'crescent', reach: 2.5, deg: 84, dir: 0, long: 4, react: 'reel' }, carry: [0.75, 0], air: null, share: 1.1, globe: 'punch' },
  elbow: { long: 50, strike: { from: 18, at: 20, kind: 'punch' }, force: { shape: 'crescent', reach: 2.5, deg: 64, dir: 0, long: 4, react: 'aside' }, carry: [0.75, 0], air: null, share: 1.2, globe: 'punch' },
  roundkick: { long: 36, strike: { from: 14, at: 16, kind: 'kick' }, force: { shape: 'crescent', reach: 2.5, deg: 90, dir: 0, long: 4, react: 'knock' }, carry: [1, 0], air: null, share: 1.0, globe: 'kick' },
  push: { long: 44, strike: { from: 15, at: 17, kind: 'kick' }, force: { shape: 'cone', reach: 3.5, deg: 60, dir: 0, long: 7, react: 'shove' }, carry: [1, 0], air: null, share: 0.8, globe: 'kick' },
  uppercut: { long: 46, strike: { from: 13, at: 15, kind: 'punch' }, force: { shape: 'cone', reach: 2.5, deg: 40, dir: 4, long: 3, react: 'launch' }, carry: [1.75, 0], air: [15, 30], share: 1.8, globe: 'punchFire' },
  spinkick: { long: 50, strike: { from: 14, at: 16, kind: 'kick' }, force: { shape: 'round', reach: 3.5, deg: 200, long: 8, react: 'fly' }, carry: [0, 0], air: [15, 29], share: 1.5, globe: 'kickFire' },
  spinkickClose: { long: 52, strike: { from: 14, at: 16, kind: 'kick' }, force: { shape: 'round', reach: 3.5, deg: 200, long: 6, react: 'fly', from: 22 }, carry: [2, 0], air: [15, 31], share: 1.5, globe: 'kickFire' },
  knee: { long: 58, strike: { from: 19, at: 21, kind: 'kick' }, force: { shape: 'cone', reach: 2.5, deg: 42, dir: 5, long: 3, react: 'kneed' }, carry: [1.5, 0], air: [20, 33], share: 2.4, globe: 'kickFire' },
};

/** What a foe does when each kind of blow lands: driven back (tiles, for good: “so that in a combo the next blow finds them at its reach again”), staggered or stunned (seconds), thrown up. */
export const VET_REACT: Record<VetReact, { back: number; stagger?: number; stun?: number; up?: number }> = {
  snap: { back: 0.75, stagger: 0.15 },
  reel: { back: 0.75, stagger: 0.35 },
  knock: { back: 1.0, stagger: 0.4 },
  shove: { back: 1.0, stagger: 0.5 },
  aside: { back: 1.0, stagger: 0.4 },
  launch: { back: 0.75, stun: 1.2, up: 0.9 },
  kneed: { back: 1.2, stun: 0.8 },
  fly: { back: 1.6, stun: 0.6 },
};

/** His other numbers (starting numbers, his to try and change). */
export const VET_TUNE = {
  /** Seconds after his last move is played out in which a press still goes on with the combo; after that the globes go out. */
  gap: 0.5,
  /** How much of a foe's middle counts as reached (tiles): a blow reaches one whose near side its force comes to. */
  body: 0.3,
  /** Seconds a foe that is driven back takes to be carried there. */
  driveSecs: 0.18,
  /** Seconds a swipe made while his combo is locked waits to go in. */
  swipeWaits: 0.35,
};

/**
 * HIS TREE'S NUMBERS (game/talents.ts VETERAN_TREE; their rules in game.ts, “THE VETERAN”): starting numbers, as the cards say
 * them, his to try and change.
 */
export const VET_TALENTS = {
  /** Viper Jab: how much poison his jab leaves, as a share of its hit, over the poison's time. */
  viperJab: { dose: 0.6 },
  /** Guard Up: how much less a blow from in front does between his blows, and how far round counts as in front (the cosine). */
  guardUp: { less: 0.5, cos: 0.35 },
  /** Knockdown: seconds the third punch of a combo knocks them down. */
  knockdown: { down: 2 },
  /** Launcher: how much harder his blows land on one hanging in the air. */
  launcher: { mult: 2 },
  /** Switch Kick: how much of the round kick's wind-up is skipped. */
  switchKick: { skip: 0.5 },
  /** Long Legs: tiles more his kicks reach. */
  longLegs: { more: 1 },
  /** Wall Slam: seconds stunned. */
  wallSlam: { stun: 2 },
  /** Aftershock: how far round the one he kicked everything falls (tiles), and for how long. */
  aftershock: { r: 1.5, down: 1 },
  /** Thunder Knee: how many more the lightning jumps on to, how far, its share of the blow, seconds stunned. */
  thunderKnee: { n: 3, far: 3.5, share: 0.5, stun: 1.5 },
  /** Light on His Feet: his jump's wait, as a share of what it was. */
  lightFeet: { wait: 2 / 3 },
  /** Stoke: seconds off his jump's wait for a fire move that lands. */
  stoke: { secs: 2 },
  /** The Full Set: how much harder the finisher lands, and how far it throws them (tiles). */
  fullSet: { mult: 3, throw: 3 },
};

/** A move being played: which, how far through it (frames, at his pace), where he stood and the way he faced as it began, whom its blow has struck. */
export interface VetPlaying {
  id: VetBlowId;
  f: number;
  x0: number;
  y0: number;
  fx: number;
  fy: number;
  /** How far the game has carried him so far (tiles along his forward and to his left): the rest is carried as the frames go. */
  carried: [number, number];
  /** The monsters its blow has struck (each once). */
  hit: number[];
  /** Which globe it is (0 to 2). */
  globe: number;
}

/** What he keeps going in a fight (Hero.vet). */
export interface VetState {
  /** The globes filled so far in this combo, in order (none to three). */
  globes: VetGlobe[];
  /** The presses whose globes are filled and whose moves are still to be played, in turn: each the move it makes, its globe, and for a swipe where it was swiped to. */
  queue: { id: VetBlowId; globe: number; tx: number; ty: number }[];
  /** The move being played. */
  move: VetPlaying | null;
  /** The moves of this combo played or playing, in order (for which move a press makes). */
  done: VetBlowId[];
  /** Seconds since the last move was played out with nothing to follow it (the combo is over at VET_TUNE.gap). */
  idle: number;
  /** (Fire Starter) Landed from his dodge jump: his next tap or hold is in fire. */
  fireReady?: boolean;
}
export const newVet = (): VetState => ({ globes: [], queue: [], move: null, done: [], idle: 0 });

/** Is the combo locked (three globes in)? */
export const vetLocked = (v: VetState): boolean => v.globes.length >= 3;

const PUNCHES: ReadonlySet<VetBlowId> = new Set(['jab', 'cross', 'hook', 'elbow', 'uppercut']);
const KICKS: ReadonlySet<VetBlowId> = new Set(['roundkick', 'push', 'spinkick', 'spinkickClose', 'knee']);
export const isVetPunch = (id: VetBlowId): boolean => PUNCHES.has(id);
export const isVetKick = (id: VetBlowId): boolean => KICKS.has(id);

/** The move a press makes, after the moves of the combo so far (`before`, oldest first). */
export function vetMoveFor(input: VetInput, before: readonly VetBlowId[]): VetBlowId {
  const last = before.length ? before[before.length - 1] : null;
  switch (input) {
    case 'swipe':
      return 'dodge';
    case 'swipeTap':
      return 'uppercut';
    case 'swipeHold': {
      if (!before.length) return 'spinkickClose';
      const two = before.slice(-2);
      return two.length === 2 && two.every((m) => isVetPunch(m)) ? 'knee' : 'spinkick';
    }
    case 'hold':
      return last === 'roundkick' ? 'push' : 'roundkick';
    case 'tap':
    default:
      if (!last || last === 'dodge') return 'jab';
      if (last === 'jab') return 'cross';
      if (last === 'cross') return 'hook';
      if (isVetKick(last)) return 'elbow';
      return 'cross';
  }
}

/** The fire a tap or a hold sets a swipe's globe in (the move it makes instead of the dodge). */
export function vetFireFor(input: 'tap' | 'hold', before: readonly VetBlowId[]): VetBlowId {
  return vetMoveFor(input === 'tap' ? 'swipeTap' : 'swipeHold', before);
}

/** Where his blow's force reaches, worked out on the floor: a point (tiles) and when its front comes to it, or null. */
export interface VetReachAt {
  /** The frame of the move its front comes to the one standing there. */
  f: number;
}

/**
 * THE FRAME A BLOW'S FORCE REACHES ONE STANDING AT (px, py) (tiles, the floor), radius `r`, or null if it never does: from
 * where he stood as the move began (x0, y0), along the way he faced then (fx, fy): in its cone or crescent within its reach;
 * the round crescent all round him (its front rolled out to him). Its front goes out over `long` frames, fast then slowing.
 */
export function vetReach(m: VetMoveDef, p: { x0: number; y0: number; fx: number; fy: number }, px: number, py: number, r: number, more = 0): number | null {
  const F0 = m.force;
  const S = m.strike;
  if (!F0 || !S) return null;
  const F = more ? { ...F0, reach: F0.reach + more } : F0;
  const from = F.from ?? S.at;
  const dx = px - p.x0;
  const dy = py - p.y0;
  const d = Math.hypot(dx, dy);
  const near = Math.max(0, d - r - VET_TUNE.body);
  if (near > F.reach) return null;
  if (F.shape !== 'round') {
    // (its line: his forward, turned `dir` degrees to his left; on the game's floor his left is (fy, -fx))
    const a = ((F.dir ?? 0) * Math.PI) / 180;
    const [lx, ly] = vetLeft(p.fx, p.fy);
    const ux = p.fx * Math.cos(a) + lx * Math.sin(a);
    const uy = p.fy * Math.cos(a) + ly * Math.sin(a);
    const along = dx * ux + dy * uy;
    if (along <= -r) return null;
    const off = Math.abs(Math.atan2(dx * uy - dy * ux, along));
    const spare = Math.atan2(r + VET_TUNE.body, Math.max(0.3, d));
    if (off > ((F.deg / 2) * Math.PI) / 180 + spare) return null;
  }
  // (its front: out to its reach over `long` frames, fast then slowing, as the art's: 1 - (1 - u)^3)
  const u = Math.max(0, Math.min(1, near / F.reach));
  return from + F.long * (1 - Math.cbrt(1 - u));
}

/**
 * WHERE THE FLOOR POINT UNDER HIM IS, a frame into a move (tiles along his forward and to his left as it began): the art's own,
 * baked (game/veteran_baked.ts `place`: its carry, and the swing of the spinning elbow's turn about its pivot foot), between
 * its frames as they come. Carried there, his picture (drawn from his floor point) is where the art has him, his feet held.
 */
export function vetCarryAt(id: VetBlowId, f: number): [number, number] {
  const B = VET_BAKED[id];
  const P = B.place;
  const k = Math.max(0, Math.min(B.long, f));
  const i = Math.min(B.long - 1, Math.floor(k));
  const u = k - i;
  const a = P[i];
  const b = P[Math.min(B.long, i + 1)];
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
}

/**
 * HIS FOUR WAYS: he is drawn facing one of the four ways the game draws heroes (art/veteran_art.ts: down the screen to the
 * right, +x; down to the left, +y, mirrored; up to the right, -y; up to the left, -x, mirrored), so a move faces the nearest
 * of them to what he aims at, and its force goes out the way his picture throws it.
 */
export function vetFacing(dx: number, dy: number): [number, number] {
  if (Math.abs(dx) >= Math.abs(dy)) return [dx >= 0 ? 1 : -1, 0];
  return [0, dy >= 0 ? 1 : -1];
}

/** His left on the game's floor, facing (fx, fy): (fy, -fx); on a picture drawn mirrored (fx - fy < 0), the world's other side, as the picture has it. */
export function vetLeft(fx: number, fy: number): [number, number] {
  return fx - fy < 0 ? [-fy, fx] : [fy, -fx];
}
