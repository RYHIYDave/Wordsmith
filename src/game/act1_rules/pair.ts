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
// - THE PALIMPSEST, THEIR COMBO: now and then (`combo`), both free and the room letting them, the Scraper holds its ground
//   and the Quill flies off to the far end of the line it will write, the line on the hero's side of the Scraper; landed
//   there, facing back down it, it waits, and the Scraper slams its claws down and scrapes the strip bare before it (its
//   `strip`); the Quill swoops down the strip writing it from its far end (its `swoop`, started so that it sets off as the
//   strip has run out), and lands short of the Scraper's claws; the strip bursts after it, a wall of ink along it as it was
//   written, from its far end to its near end: whoever is on it as the burst passes is struck hard. The Quill felled before
//   it has written it, the strip lies bare and does not burst.
// - OVERWRITE: now and then (`overwrite`), the Scraper hurt and the Quill free, the Quill flies to stand beside the Scraper,
//   facing it, and writes over its wounds, healing it while it writes, for as long as `most` at the longest; a blow on the
//   Quill stops it (it reels), and so does the Scraper burning (the hero's fire: “Fire words shine here”, his doc's
//   word for the Millrace). While it is written over, the Scraper holds its ground, striking from where it stands.

import { QL_FLY_PACE, QL_SWOOP, SWOOP_TILES, WRITE_AT } from '../../art/quill';
import { SR_STRIP } from '../../art/scraper';
import { STRIP_BURST_AFTER, STRIP_BURST_FOR, STRIP_BURST_RUN, STRIP_FROM, STRIP_HALF, STRIP_STAIN_FOR, STRIP_TILES } from '../../art/pair_shots';
import type { Game } from '../game';
import type { Monster } from '../state';

/** THE PAIR ON: floor 13's boss the Scraper with the Quill beside it (game/act1.ts, Game.spawnMonsters); off, the Palimpsest as before. */
export const PAIR = { on: true };

export const PAIR_TUNE = {
  /**
   * THE PALIMPSEST: made once in `every` seconds at most (the first `first` seconds after they wake), both free, the Scraper
   * no further than `far` from the hero and no nearer than `near`; along the way to the hero or within `turn` radians of it,
   * where the floor lets the Quill stand at its far end (`stand` tiles before the Scraper: the strip's far end and its swoop
   * past it) and swoop all the way down. The Quill sets off down it `start` seconds after the Scraper begins its strip (its
   * `go` then comes as the strip has run out); the strip bursts STRIP_BURST_AFTER after the Quill is home. `dmg` times the
   * Scraper's blow. Given up if the Quill has not landed at its end within `wait` seconds.
   */
  combo: { every: 22, first: 12, near: 2.5, far: 8.5, turn: 0.9, stand: STRIP_FROM + 0.4 + SWOOP_TILES, start: 0.9, dmg: 2.2, wait: 6 },
  /**
   * OVERWRITE: made once in `every` seconds at most (the first `first` after they wake), with the Scraper below `below` of
   * its life; the Quill stands WRITE_AT.ahead tiles from the Scraper's middle, beside it, facing it; while it writes the
   * Scraper is healed `heal` of its life a second, for `most` seconds at the longest.
   */
  overwrite: { every: 20, first: 16, below: 0.8, heal: 0.02, most: 6 },
  /** The Quill's flight: QL_FLY_PACE tiles a second, straight to where it is going. */
  fly: QL_FLY_PACE,
};

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

/** The strip's times, from the Scraper's slam: when the Quill sets off down it, when it is written to its near end, when it bursts. */
export const STRIP_TIMES = {
  /** (the Quill's swoop begins `combo.start` after the Scraper's strip, which slams at SR_STRIP.slam) */
  swoopFrom: PAIR_TUNE.combo.start - SR_STRIP.slam,
  burst: PAIR_TUNE.combo.start - SR_STRIP.slam + QL_SWOOP.stop + STRIP_BURST_AFTER,
  gone: PAIR_TUNE.combo.start - SR_STRIP.slam + QL_SWOOP.stop + STRIP_BURST_AFTER + STRIP_BURST_RUN + STRIP_STAIN_FOR,
};

export { STRIP_BURST_FOR, STRIP_FROM, STRIP_HALF, STRIP_TILES, WRITE_AT };

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
