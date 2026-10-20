// ACT 2, THE HUSH: THE BELLS, the event of floors 11 to 15 in place of the descent's strongholds (behind ACT2, game/act1.ts).
//
// HIS DESIGN (his doc "Wordsmith Act 2: The Hush", the project's claude/act2_hush.md), 18 Oct 2026, Pacific:
//   05:27 "I like the bells.  So you activate the hush somehow, then there are 4-7 bells that spawn around the map, you have
//     a limited time to run around and activate those bells.  Enemies constantly spawn in the hush, ramping up difficulty.
//     They drop loot, but if you get all the bells before the time runs out you get a big loot explosion at the end."
//   05:28 "Or they just spawn whatever enemies, but when you activate a bell, a tough enemy spawns"
//   05:31, asked whether the Hush should ramp up over time as well: "Let’s try the ramp up and if it’s too difficult then we
//     can tone it back down"
//   05:31 "I’d like the affected area of the hush to be visible on the minimap somehow"
//   05:40, asked whether it keeps spreading or covers a fixed area: "Fixed area, and the bells start to chip that area down so
//     the density of enemies ramps as well."
//   05:41 "I’d like there to be a small chance of spawning a boss specific to the Hush when you activate the last bell and
//     clear the hush" (THE KNELL: not built yet; it is not drawn).
// AND THE PLANNING CHAT'S PICKS, told him on 19 Oct (about 11:05 Pacific) as his to change: the Muffled Bell off the main way,
// gagged by the Silent Order, struck to start it (starting it his choice, as a stronghold's door was); a bell rung by hitting
// it with any attack (a ranger can ring one from afar); 15 seconds a bell; each tough enemy tougher than the last, shown as a
// yellow pack's leader; a bell's ring knocks back the enemies near it; time out: the Hush lifts, no explosion, what fell is
// kept; the explosion gear, gold, runedust and a chance at a word (floors 11 to 15's runedust, as the strongholds' was on 6
// to 10); one event a floor; the event's Hush brings enemies only (it does not darken his words: that is the bosses').
//
// WHERE: each floor's map-maker lays the plan (Land.bells, game/act2_types.ts) and its dresser the pieces (props of kind
// 'piece' by the art's names, render/act1_pieces.ts draws them by their `state`); the rules are Game's ("ACT 2: THE BELLS"),
// these are their numbers and the Hush's ground; what it looks like is render/bells.ts and the HUD's.

import type { BellsPlan } from './act2_types';
import type { Level } from './state';
import { RNG } from '../engine/rng';
import { T_FLOOR } from './types';

export const BELLS_TUNE = {
  /** The clock: this many seconds a bell (his doc: "about 15 seconds a bell (60 seconds for four, 105 for seven)"). */
  perBell: 15,
  /** How near a hit must come to a bell's middle to ring it (tiles, beyond the hit's own reach). */
  strike: 0.55,
  /** THE RAMP: the first gap between the Hush's risings (seconds), how much shorter it grows each second, and the least. */
  gap0: 5.5,
  gapFall: 0.045,
  gapMin: 1.8,
  /** How many rise at once: `size0`, one more each `sizeEvery` seconds, at most `sizeMost`. */
  size0: 2,
  sizeEvery: 22,
  sizeMost: 5,
  /** How much more life each risen one has for each second the Hush has lasted (0.006: 36% more after a minute). */
  lifeRamp: 0.006,
  /** Never more of the Hush's own awake at once than this (a phone's room): no more rise until some fall. */
  most: 16,
  /** Where they rise: within the Hush, this far from the hero (tiles). */
  near: 6,
  far: 13,
  /** THE TOUGH ONE AT EACH BELL RUNG: a yellow pack's leader of the floor's medium kind, `tough` more life for each bell rung before it. */
  tough: 0.35,
  /** EACH BELL RUNG CHIPS THE HUSH: everything of it within this share of its radius of the bell (at least `chipMin` tiles) is gone. */
  chip: 0.42,
  chipMin: 6,
  /** THE RING KNOCKS BACK what is near the bell: within `knockR` tiles, shoved `knock` tiles out. */
  knockR: 3.5,
  knock: 2.2,
  /** How long the bells ring on once it is over, won or lost, before they hang still (seconds). */
  ringOut: 4,
  /** THE EXPLOSION: runedust (`dust` + one for every two bells), gear (one a bell, the first two of the best), gold (`gold` a bell, by depth), and a word at this chance. */
  dust: 2,
  gold: 14,
  word: 0.5,
};

/** A bell's prop `state` once it has rung out and hangs still (0 quiet, 1 awake, 2 ringing: render/act1_pieces.ts bellFrame). */
export const BELL_STILL = 3;

/** The pack numbers of what the Hush raises (each rising a pack of its own), and of the tough ones the bells call. */
export const BELLS_PACK_ID = (k: number): number => 8000 + (k % 800);
export const BELLS_TOUGH_ID = (k: number): number => 8900 + k;

export type BellsPhase = 'asleep' | 'on' | 'won' | 'lost';

/** The Bells on a level, as they stand now (Level.bells). */
export interface BellsState {
  plan: BellsPlan;
  phase: BellsPhase;
  /** Seconds since the Muffled Bell was struck; and the clock's whole length. */
  t: number;
  limit: number;
  /** Which bells are rung, in the plan's order. */
  rung: boolean[];
  /** The props of the bells (Level.props indices, the plan's order; -1 where none was laid) and of the Muffled Bell. */
  props: number[];
  muffled: number;
  /** THE HUSH'S GROUND: 1 for every walkable tile it still lies on (the plan's circle, chipped back as bells are rung). */
  mask: Uint8Array;
  /** How many tiles it lay on at first, and lies on now. */
  first: number;
  left: number;
  /** Changes each time the mask does (for what draws it). */
  version: number;
  /** The next rising (seconds of `t`), and how many have risen. */
  next: number;
  risen: number;
  /** The monsters the Hush has raised (ids). */
  ids: number[];
  /** Seconds since it ended (won or lost), for what is drawn as it ends. */
  since: number;
}

/** A tile's middle within the plan's circle? */
function inCircle(plan: BellsPlan, tx: number, ty: number): boolean {
  return Math.hypot(tx + 0.5 - plan.hush.x, ty + 0.5 - plan.hush.y) <= plan.hush.r;
}

/** The Bells of a level as it is made, asleep; null where it has none. The pieces are found where the plan says they stand. */
export function makeBells(L: Level): BellsState | null {
  const plan = L.land?.bells;
  if (!plan || plan.bells.length === 0) return null;
  const f = L.floor;
  const W = f.w;
  const mask = new Uint8Array(W * f.h);
  let first = 0;
  const r = Math.ceil(plan.hush.r) + 1;
  for (let ty = Math.max(0, Math.floor(plan.hush.y - r)); ty <= Math.min(f.h - 1, Math.floor(plan.hush.y + r)); ty++) {
    for (let tx = Math.max(0, Math.floor(plan.hush.x - r)); tx <= Math.min(W - 1, Math.floor(plan.hush.x + r)); tx++) {
      const i = ty * W + tx;
      if (f.tiles[i] !== T_FLOOR || !inCircle(plan, tx, ty)) continue;
      mask[i] = 1;
      first++;
    }
  }
  const propAt = (x: number, y: number, bell: (name: string) => boolean): number =>
    L.props.findIndex((p) => p.kind === 'piece' && !!p.name && bell(p.name) && p.tx === Math.floor(x) && p.ty === Math.floor(y));
  const muffled = propAt(plan.muffled.x, plan.muffled.y, (n) => n.endsWith('(the Muffled Bell)'));
  const props = plan.bells.map((b) => propAt(b.x, b.y, (n) => !n.endsWith('(the Muffled Bell)')));
  return {
    plan,
    phase: 'asleep',
    t: 0,
    limit: BELLS_TUNE.perBell * plan.bells.length,
    rung: plan.bells.map(() => false),
    props,
    muffled,
    mask,
    first,
    left: first,
    version: 0,
    next: 1.5,
    risen: 0,
    ids: [],
    since: 0,
  };
}

/** Is world (x, y) in the Hush now? */
export function inHush(B: BellsState, W: number, x: number, y: number): boolean {
  if (B.phase !== 'on') return false;
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  return tx >= 0 && ty >= 0 && tx < W && B.mask[ty * W + tx] === 1;
}

/** A bell rung chips the Hush back round it (his 05:40). How far: a share of the Hush's radius, at least a few tiles. */
export function chipAt(B: BellsState, L: Level, x: number, y: number): void {
  const f = L.floor;
  const W = f.w;
  const r = Math.max(BELLS_TUNE.chipMin, B.plan.hush.r * BELLS_TUNE.chip);
  for (let ty = Math.max(0, Math.floor(y - r)); ty <= Math.min(f.h - 1, Math.floor(y + r)); ty++) {
    for (let tx = Math.max(0, Math.floor(x - r)); tx <= Math.min(W - 1, Math.floor(x + r)); tx++) {
      const i = ty * W + tx;
      if (B.mask[i] && Math.hypot(tx + 0.5 - x, ty + 0.5 - y) <= r) {
        B.mask[i] = 0;
        B.left--;
      }
    }
  }
  B.version++;
}

/** The gap before the next rising, `t` seconds in (the ramp: his 05:31). */
export function gapAt(t: number): number {
  return Math.max(BELLS_TUNE.gapMin, BELLS_TUNE.gap0 - BELLS_TUNE.gapFall * t);
}
/** How many rise at once, `t` seconds in. */
export function sizeAt(t: number): number {
  return Math.min(BELLS_TUNE.sizeMost, BELLS_TUNE.size0 + Math.floor(t / BELLS_TUNE.sizeEvery));
}

/** Where the next of the Hush may rise: a tile of it, in reach of the hero but not on him (null: nowhere this time). */
export function riseSpot(B: BellsState, L: Level, hx: number, hy: number, rng: RNG): { x: number; y: number } | null {
  const f = L.floor;
  const W = f.w;
  for (let k = 0; k < 40; k++) {
    const a = rng.range(0, Math.PI * 2);
    const d = rng.range(BELLS_TUNE.near, BELLS_TUNE.far);
    const tx = Math.floor(hx + Math.cos(a) * d);
    const ty = Math.floor(hy + Math.sin(a) * d);
    if (tx < 1 || ty < 1 || tx >= W - 1 || ty >= f.h - 1) continue;
    const i = ty * W + tx;
    if (B.mask[i] !== 1 || L.walk[i] !== 1) continue;
    return { x: tx + 0.5, y: ty + 0.5 };
  }
  return null;
}

/** How many bells are still to ring. */
export function bellsLeft(B: BellsState): number {
  return B.rung.reduce((n, r) => n + (r ? 0 : 1), 0);
}
