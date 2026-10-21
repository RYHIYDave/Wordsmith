// ACT 2, THE HUSH: FLOOR 13'S DOUBLE BOSS, THE SCRAPER AND THE QUILL, in place of the Palimpsest: what the two share
// (game/act1_rules/scraper.ts and quill.ts are each one's own rules).
//
// His words to the art chat, 20 Oct 2026, 14:14 Pacific: “I’d like the palimpsest to be something different.  There’s too
// many humanoid looking enemies”; his answers since: “I’d like a double boss.  What ideas do you have for two bosses at the
// same time”, “Scraper and Quill (Recommended)”, at 14:46 “New attacks for sure tho” and “And have them team up for a combo
// attack as well”; to the moves, “Sounds good.  But make the hit boxes on the attacks, and the attacks themselves big”; to
// their look, “Yes, animate them (Recommended)”; to their three videos, by 21:30, “Looks good (Recommended)” (the art chat's
// board post of 00:32 Eastern, 21 Oct). The art: mockup/act2-palimpsest at ca004ef (docs/mockups/act2_pair/README.md).
//
// HIS WORD ON THE HIT AREAS: BIG, AS BIG AS THE MARKS. Every hit area here is the art's mark on the floor for that blow
// (art/pair_shots.ts), taken as it draws it: where the mark is, the blow lands.
//
// THE TWO TOGETHER (the main chat's, the rest of the fight being the art's to show and these files' to rule):
// - They come into the world side by side in the Pulping Floor, the Scraper the floor's boss (Game.boss), the Quill beside
//   it, a boss too; both wait for the hero to come into their ground, and wake together. Each has a bar of its life over
//   the screen while both stand (ui/hud.ts). One falling, the other fights on alone; the way on opens when both have
//   fallen. The first to fall leaves part of a boss's hoard, the last the whole of it.
// - THE PALIMPSEST, THEIR COMBO, MADE THEIR ULTIMATE. His words to the main chat, 21 Oct 2026, 10:58 Pacific, to the video
//   of them from the game: “The combo attack needs to be huge.  It’s their ultimate ability.  And I’d like the quill to
//   move much faster.  I like the scraper being slow but a heron should be quick” and, the same minute, “Have them do the
//   combo move, but do it 5 times in a row and about twice as fast”; his picks: “Each one at you (Recommended)”, “Twice as
//   fast (Recommended)” (the Quill), “About every 30 s (Recommended)”. So: now and then (`combo`), both free and the room
//   letting them, they make it `times` times in a row, each `rate` times as fast as its pictures were painted. Each time
//   the Scraper holds its ground and the Quill flies off to the far end of the line it will write, the line toward where
//   the hero is then; as it lands there the Scraper slams its claws down and scrapes the strip bare before it (its
//   `strip`); the Quill, facing back down it, swoops down the strip writing it from its far end (its `swoop`, started so
//   that it sets off as the strip has run out), and lands short of the Scraper's claws; the strip bursts after it, a wall
//   of ink along it as it was written, from its far end to its near end: whoever is on it as the burst passes is struck
//   hard. Then the next, until all are made. The Quill felled before it has written one, that strip lies bare and does
//   not burst, and the ultimate is over. While it lasts the Scraper does nothing else.
// - THE QUILL IS QUICK (his word above): it walks `quick` times as fast as its wade was painted for (its steps played as
//   much faster, game/defs.ts MONSTERS.quill.speed), and flies `quick` times as fast, its taking off and landing too.
// - OVERWRITE: now and then (`overwrite`), the Scraper hurt and the Quill free, the Quill flies to stand beside the Scraper
//   (following it as it goes), facing it, and writes over its wounds, healing it while it writes, for as long as `most` at
//   the longest; a blow on the Quill stops it (it reels), and so does the Scraper burning (the hero's fire: “Fire words
//   shine here”, his doc's word for the Millrace). From the Quill's landing beside it until it is done, the Scraper holds
//   its ground, striking from where it stands.

import type { Game } from '../game';
import type { Monster } from '../state';

// ---------------------------------------------------------------------------------------------
// THE ART'S NUMBERS, written down here under the art's own names (art/scraper.ts, art/quill.ts, art/pair_shots.ts), as the
// game's rules hold every picture's numbers of their own; tests/pair_rules.test.ts holds each to the art. Seconds from a
// move's start; tiles.

/** THE SCRAPER: its scuttle's pace; its claw snap, the scour, the backward rush (carried back RUSH_TILES between `go` and `stop`), its half of the Palimpsest. */
export const SR_PACE = 1.0;
export const SR_SNAP = { long: 1.0, hit: 0.5 } as const;
export const SR_SCOUR = { long: 2.6, slam: 1.0, sweep: [1.0, 1.5] } as const;
export const SR_RUSH = { long: 1.9, flip: 0.66, go: 0.7, stop: 1.2 } as const;
export const RUSH_TILES = 5;
export const SR_STRIP = { long: 2.6, slam: 1.0 } as const;
/** THE QUILL: its wade's pace; the nib stab (the nib in the floor STAB_AT before it); ink lines' three strokes; taking off, landing; its swoop (carried SWOOP_TILES between `go` and `stop`); its flight's pace; where it stands to write (WRITE_AT.ahead from the Scraper's middle). */
export const QL_PACE = 1.1;
export const QL_STAB = { long: 1.3, hit: 0.6 } as const;
export const STAB_AT = 2.4;
export const QL_LINES = { long: 2.6, strokes: [[0.7, 0.92], [1.02, 1.24], [1.34, 1.56]] } as const;
export const QL_TAKEOFF = { long: 0.9, spring: 0.34 } as const;
export const QL_LAND = { long: 0.8, down: 0.45 } as const;
export const QL_SWOOP = { long: 2.6, spring: 0.55, go: 0.7, stop: 1.8 } as const;
export const SWOOP_TILES = 8;
export const QL_FLY_PACE = 4.5;
export const WRITE_AT = { ahead: 1.85 } as const;
/** THEIR MARKS ON THE FLOOR, WHICH ARE THEIR HIT AREAS (his word: big): where each lies, how big, how long it lies. */
export const SNAP_AT = { ahead: 3.4, left: -0.3 } as const;
export const SNAP_R = 1.15;
export const SNAP_FOR = 0.9;
export const SCOUR_REACH = 4.0;
export const SCOUR_HALF = 82;
export const SCOUR_FOR = 1.8;
export const RUSH_LANE = 7.4;
export const RUSH_HALF = 1.3;
export const RUSH_WAKE_FOR = 1.4;
export const STRIP_FROM = 3.0;
export const STRIP_TILES = 6;
export const STRIP_HALF = 0.85;
export const STRIP_BURST_RUN = 0.35;
export const STRIP_BURST_AFTER = 0.45;
export const STRIP_BURST_FOR = 0.5;
export const STRIP_STAIN_FOR = 1.6;
export const STAB_R = 1.05;
export const STAB_FOR = 1.0;
export const LINES_AT = [1.8, 3.3, 4.8] as const;
export const LINE_LONG = 5.2;
export const LINE_HALF = 0.45;
export const LINE_BURST_AFTER = 0.6;
export const LINE_BURST_FOR = 0.5;
export const LINE_STAIN_FOR = 1.4;
/** How long one stroke of the ink lines takes to lay its line (art/pair_shots.ts LINE_STROKE). */
export const LINE_STROKE = 0.22;

/** THE PAIR ON: floor 13's boss the Scraper with the Quill beside it (game/act1.ts, Game.spawnMonsters); off, the Palimpsest as before. */
export const PAIR = { on: true };

export const PAIR_TUNE = {
  /**
   * THE PALIMPSEST: made once in `every` seconds at most (the first `first` seconds after they wake), both free, the Scraper
   * no further than `far` from the hero and no nearer than `near`; along the way to the hero or within `turn` radians of it,
   * where the floor lets the Quill stand at its far end (`stand` tiles before the Scraper: the strip's far end and its swoop
   * past it) and swoop all the way down. The Quill sets off down it `start` seconds after the Scraper begins its strip (its
   * `go` then comes as the strip has run out); the strip bursts STRIP_BURST_AFTER after the Quill is home. `dmg` times the
   * Scraper's blow. Given up if the Quill has not landed at its end within `wait` seconds. THE ULTIMATE (his words above):
   * `times` in a row, the first `near` to `far` from the hero and the rest wherever he is, each at `rate` times the speed
   * of its pictures (the Scraper's strip and the Quill's swoop, and with them `start`, the strip's burst and its staying);
   * where the floor has no room for the Quill at `stand`, it may stand up to `short` nearer, its swoop carrying it less;
   * `every` from the start of one to the next.
   */
  combo: { every: 30, first: 12, near: 2.5, far: 8.5, turn: 0.9, stand: STRIP_FROM + 0.4 + SWOOP_TILES, short: 1.5, start: 0.9, dmg: 2.2, wait: 6, times: 5, rate: 2 },
  /**
   * OVERWRITE: made once in `every` seconds at most (the first `first` after they wake), with the Scraper below `below` of
   * its life; the Quill stands WRITE_AT.ahead tiles from the Scraper's middle, beside it, facing it; while it writes the
   * Scraper is healed `heal` of its life a second, for `most` seconds at the longest.
   */
  overwrite: { every: 20, first: 16, below: 0.8, heal: 0.02, most: 6 },
  /** THE QUILL IS QUICK: twice as fast as its pictures were painted for, walking (game/defs.ts MONSTERS.quill.speed) and flying (its taking off and landing too). */
  quick: 2,
  /** The Quill's flight: QL_FLY_PACE tiles a second as painted, times `quick`, straight to where it is going. */
  fly: QL_FLY_PACE * 2,
};

/** The Quill's moments with the Scraper (Monster.a1.mode): free to fight, on its way (taking off, flying, landing), writing over the Scraper, waiting at the strip's far end, swooping down it, between two of the ultimate's strips. */
export const QMODE = { free: 0, going: 1, writing: 2, waiting: 4, swooping: 5, between: 6 } as const;

/** Where the Quill's nib is on the strip as it swoops down it: how much of it is written, from its far end (0 to 1), `t` seconds into its swoop. */
export function writtenAt(t: number): number {
  const S = QL_SWOOP;
  const k = (t - S.go) / (S.stop - S.go);
  return k <= 0 ? 0 : k >= 1 ? 1 : k;
}

/** The strip's burst: when it reaches `f` tiles before the Scraper (STRIP_FROM to STRIP_FROM + STRIP_TILES), seconds after it began to burst (it runs from the far end in, as the art draws it: eased). */
export function burstReaches(f: number): number {
  const far = STRIP_FROM + STRIP_TILES;
  const u = Math.max(0, Math.min(1, (far - f) / STRIP_TILES));
  // (the art's run is STRIP_TILES * sm(t / STRIP_BURST_RUN): the time at which sm reaches u)
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const s = mid * mid * (3 - 2 * mid);
    if (s < u) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * STRIP_BURST_RUN;
}

/** The other of the pair, alive: the Quill for the Scraper, the Scraper for the Quill; null if it has fallen. */
export function partnerOf(g: Game, m: Monster): Monster | null {
  const want = m.kind === 'scraper' ? 'quill' : m.kind === 'quill' ? 'scraper' : null;
  if (!want) return null;
  return g.monsters.find((o) => !o.dead && o.kind === want && o.packId === m.packId) ?? null;
}

/** Is it free to be made part of something (awake, not acting, not frozen or stunned)? */
export function free(m: Monster): boolean {
  return !m.dead && m.state !== 'sleep' && m.state !== 'act' && m.frozenT <= 0 && !(m.stunT > 0);
}

/** A point `f` tiles ahead of (x, y) along (ux, uy) and `s` to its left (the art's left: (uy, -ux)). */
export function ahead(x: number, y: number, ux: number, uy: number, f: number, s = 0): { x: number; y: number } {
  return { x: x + ux * f + uy * s, y: y + uy * f - ux * s };
}

/** Where a point is from (x, y) facing (ux, uy): how far ahead, and how far to the art's left. */
export function relOf(x: number, y: number, ux: number, uy: number, px: number, py: number): { f: number; s: number } {
  const dx = px - x;
  const dy = py - y;
  return { f: dx * ux + dy * uy, s: dx * uy - dy * ux };
}
