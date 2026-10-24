// ACT 2, THE HUSH: FLOOR 15'S BOSS, THE LAIR'S: THE CENSOR: his rules (game/act1_rules/types.ts).
//
// HIS DOC ("Wordsmith Act 2: The Hush", level 15, the Great Library): "Boss: The Censor. His floor is The Reading Room. The
// leader of the Silent Order, robed in black, with a great ink brush. Whatever he strikes through is gone." His moves: "a
// brush slash (his basic attack); Redaction, black bars slamming across the floor in a telegraphed pattern; Strike-Through,
// a line drawn straight through you, which you have to dodge; the Hush, silence across the whole room. At half life he
// blacks out parts of the floor for good, so the room shrinks." And: "when he falls, the book bursts and the words fly
// home, and across the city people speak again." His look and every move of his are the art chat's (art/censor.ts,
// censor_moves.ts, censor_shots.ts; docs/mockups/act2_library/README.md), made on his word of 18 Oct 2026, 21:24 Pacific
// ("Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15").
// His mouth is a bar of ink: nothing of him makes a sound with a mouth (no roar: his brush slams and swings).
//
//   THE BRUSH SLASH, his basic blow: the brush heaved up over his right shoulder (the warning, 0.34 to 0.64), then a great
//     stroke down and across before him from his right to his left, its blow at 24/30 of a second, its point about 2.6
//     tiles out; whoever is before him in the arc it comes down through is struck. Where its bristles swept, an arc of
//     ink lies on the floor a moment (the art's slash mark: a picture only).
//   STRIKE-THROUGH: side-on, the brush drawn back and levelled at you (the warning, 0.26 to 0.78; the line it will take
//     marked on the floor from him through where you stood as he began, in the enemy's pink), then the thrust at 27/30:
//     the brush itself strikes whoever is along it, and a line of ink runs out from its point straight across the room at
//     the art's pace (STRIKE_SPEED, 16 tiles a second) to the first wall, or `most` tiles: whoever its head runs through
//     is struck. He does not turn once he has begun: step off the line, or roll through it.
//   REDACTION: the brush raised over his head (the warning), slammed down onto the floor at 30/30: as it lands, black bars
//     slam down across the floor about the hero, in a pattern marked out on the floor in the enemy's pink from REDACT_WARN
//     (0.6 s) before: `n` bars side by side, each `long` tiles long and a tile wide, a tile's gap between each (the gaps to
//     stand in), the middle one over where the hero stood as the marking began; across the floor's x one time, its y the
//     next. Whoever is under a bar as it slams is struck, once; then they lie wet (REDACT_FOR, 2 s, drying away over the
//     last half second), and whoever walks in the wet ink is slowed by it (the game's own chill on the hero).
//   THE HUSH: a finger to the inked bar of his mouth (the warning, 0.3 to 1.0), and at 1.06 he lets the silence go: a ring
//     of it rolls out from him across the whole room in ROOM_HUSH_RING (1 s); as it passes the hero, wherever he stands in
//     the room, his words go dark (Game.hush: HUSH_FOR, about four seconds, every attack as with no word in it). Silence
//     is not a blow: it is not rolled out of. Not made while the hero is hushed still.
//   AT HALF HIS LIFE HE BLACKS OUT PARTS OF THE FLOOR FOR GOOD (a move the rules bring: his Redaction played, its bars laid
//     for good): runs of three to five tiles along the walls of his ground, about a quarter of it (never more than a third),
//     those nearest the hero first (he sees the room close in round him), the ways in and the way on kept clear, the room
//     kept joined (every tile that could be walked to before still can).
//     Each becomes the art's "the floor blacked out" (a floor tile of the dressing: render/act1_pieces.ts), and is walked
//     on no more (Level.walk 0): whoever is under one as it slams is struck, and anyone left on one is put off it. So the
//     room shrinks. Where the floor has no dressing (the practice room) his own pictures lay the tile (render/act1_fx).
//   AS HE DIES (his picture: the brush falls, his mask cracks, the words of the city burst out of him): what of his is still
//     to come does not (bars not slammed, a line still running, the silence still rolling); what is laid for good stays.
//     And the book of stolen words, where it lies on its lectern on his floor, bursts: the words fly out of it, pink going
//     pale (render/act1_fx/censor.ts draws them; the prop is marked burst, `state` 1, for the picture of it emptied that
//     the art has yet to paint).
//
// HIS GROUND (for the Hush's reach and the blacking out): the Reading Room where the floor's map-maker says which tiles are
// it (Land.zones, the library's LB_ZONE.Reading); else his open area (the stand-in floor: Land.areas' boss); else the floor
// round where he stood (the practice room), each as far as it is joined to where he stood.
//
// THE INK FILLS THE FLOOR (CENSOR_FIGHT, below; his gameplay rulebook, "Fights": a boss's fight made long by what it
// throws, not by more life). The owner's pick, 24 Oct 2026, by 06:48 (Pacific), “Floor 15's Censor”; his words to the main
// chat at 06:49, “He’s not the act 2 boss, but he is the boss of the lower city so he does need to be something special”;
// shown him made harder each of three phases (floor15_censor.mp4), by 08:42: “I don’t think he needs three phases.  Just
// one phase is fine.  I like the ink spreading on the floor.  What is this boss’s thing?  What’s his story I don’t
// remember”, and “I’d like the ink to fill the floor as you fight and you take damage if you stand on the ink spots. Does
// that make sense?”. So: one phase, his life as it was. Bars of ink slam down round the hero all the while (a cross), and
// now and then a line of ink run across the room through him from its walls; Strike-Through twice in a row; Redaction one
// way, both ways at once (the squares between to stand in), and the page struck out line by line (every line of it marked
// out first, each with its gap), by turns. AND WHAT HE LAYS STAYS: every bar and every line of ink lies on the floor where
// it fell, and whoever stands on it is hurt; so the floor fills as the fight goes, the more the more of his life is gone
// (from `fill.least` of his ground to `fill.most`), the oldest ink drying away when there is more than that. It takes the
// place of the floor blacked out at half his life. As he dies, all of it dries away.
//
// Every number here that is a picture's is written down here; tests/act2_censor.test.ts holds it to the art.

import { RNG } from '../../engine/rng';
import { blobDist } from '../act1_layout';
import type { ActDef, BossRules, GaitDef } from '../bosses';
import { HUSH_FOR, MSG, TUNE } from '../defs';
import { beside, fromFigure, handOf } from '../facing';
import type { Game } from '../game';
import type { Level, Monster, Peril } from '../state';
import { T_FLOOR } from '../types';
import type { Act1Rules } from './types';

const D = Math.PI / 180;
const sm = (v: number): number => {
  const c = v < 0 ? 0 : v > 1 ? 1 : v;
  return c * c * (3 - 2 * c);
};

/** The name of the floor tile he lays for good (art/floor15.ts greatLibraryPieces). */
export const BLACKED_TILE = 'the floor blacked out';
/** The name of the book of stolen words (art/floor15.ts), where the floor's dresser lays it on its lectern. */
export const STOLEN_BOOK = 'the book of stolen words';
/** The Reading Room's zone on the library's floor (art/library.ts LB_ZONE.Reading; Land.zones). */
export const READING_ZONE = 2;

/** THE NUMBERS OF HIS FIGHT: his pictures' own (art/censor_moves.ts, art/censor_shots.ts, in tiles and seconds), and the rules'. */
export const CENSOR = {
  /**
   * His slash (CE_SLASH, 1.8 s): its blow at `hit` (24/30), its point `reach` tiles out then (brushOf: 2.55), coming down
   * across him from his right to his left, through a man's height from `from` to `to` degrees to his left of his way (the
   * point at 0.77 s, 35 to his right, and at 0.87 s, 29 to his left, on the floor); `through` (27/30) its bristles down at
   * his left. The ink it lays (SLASH_MARK_REACH 1.9, SLASH_MARK_HALF 55, SLASH_MARK_FOR 1.2), from its blow.
   */
  slash: { long: 1.8, hit: 24 / 30, through: 27 / 30, reach: 2.55, from: -40, to: 35, mark: 1.2 },
  /**
   * Strike-Through (CE_STRIKE, 2.2 s): the warning `warn`; the thrust at `hit` (27/30), the brush's point `point` tiles
   * before him and to his left (brushOf: 2.46 before him, 0.19 to his right, low over the floor); the line of ink from it at
   * `speed` tiles a second (STRIKE_SPEED), to the first wall or `most` tiles from him; whoever is within `half` of it (and
   * his own size) as its head runs through is struck. It lies `lie` (STRIKE_FOR).
   */
  strike: { long: 2.2, warn: [0.26, 0.78] as const, hit: 27 / 30, point: [2.457, -0.186] as const, speed: 16, most: 12, half: 0.4, lie: 1.4 },
  /**
   * Redaction (CE_REDACT, 2.6 s): the slam at `hit` (30/30); the bars marked out `warn` before it (REDACT_WARN), laid in
   * `lay` (REDACT_LAY), lying `lie` (REDACT_FOR). The rules': `n` bars, `apart` tiles middle to middle, each `bar` tiles
   * long and `wide` across; a hero whose middle is within `half` of a bar's line is under it; the wet ink slows by `slow`.
   */
  redact: { long: 2.6, hit: 30 / 30, warn: 0.6, lay: 0.12, lie: 2.0, n: 5, apart: 2, bar: 7, wide: 1, half: 0.55, slow: 0.35 },
  /** The Hush (CE_HUSH, 2.6 s): let go at `hit` (1.06); its ring out in `ring` (ROOM_HUSH_RING), its veil gone by `veil` (ROOM_HUSH_FOR); how far it reaches (the room: `least` to `most` tiles); his words dark HUSH_FOR. */
  hush: { long: 2.6, hit: 1.06, ring: 1.0, veil: 3.0, least: 6, most: 20 },
  /**
   * The floor blacked out at half his life (`at`): about `want` of his ground's open floor, never more than `most`; runs of
   * `run` tiles along its walls (no deeper in than `deep` tiles); none within `clearWay` of the way on, `clearDoor` of a way
   * into his ground, `clearHim` of him; none where something stands or is laid. Those nearest the hero first (give or take
   * `jitter` tiles, by the floor's dice): he sees the room close in round him.
   */
  blackout: { at: 0.5, want: 0.25, most: 0.32, deep: 3, run: [3, 5] as const, clearWay: 2.5, clearDoor: 2.2, clearHim: 1.6, jitter: 8 },
  /** His ground where the floor does not say (tiles: an open area's blob; on a floor with none, the practice room, its floor as far as this round him: all of it). */
  ground: { blob: 1.08, far: 24 },
  /** The book of stolen words bursting as he dies: how long its words fly. */
  book: { fly: 3.0 },
};

/** His walk, painted for 0.8 tiles a second (CE_PACE; twelve frames at eight a second): stopped at any frame of it. */
export const CENSOR_GAIT: GaitDef = { pace: 0.8, cycle: 1 / 8, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 2.0, slack: 0.6, trueBack: true };

/**
 * THE INK FILLS THE FLOOR (see above). `on`: so; off, his fight as it was (the blacking out at half his life; what he lays
 * dried away). One phase.
 *   INK, all the while (not through his Redaction until its last bar has slammed, nor at a hero gone from his ground): every
 *     `ink.every` seconds, a cross of two bars `ink.bar` tiles long through where the hero is heading (or stands), each
 *     marked out as Redaction's are and struck with `ink.dmg` of his blow; every `ink.line`th time with it a line of ink run
 *     across the room through where the hero stands from the wall behind him (marked `ink.warn` before, as Strike-Through's
 *     aim), `ink.lineDmg`.
 *   STRIKE-THROUGH, `row` in a row, one straight after another; the second where the hero is heading.
 *   REDACTION by turns: its bars one way (as it was); both ways at once (the hatch: the squares between to stand in); the
 *     page struck out (`page`): `n` lines across his room a tile apart, from his side of the hero to past him, every one
 *     marked out at once, each with a gap `gap` tiles wide within `wander` of the hero, slammed one after another `apart`
 *     seconds apart, each `long` tiles at most, its first as his brush comes down. Its cooldown `redactCd`; the Hush's
 *     `hushCd`; his rests after a move `rest` of what they were.
 *   WHAT HE LAYS STAYS (`fill`): every bar as it slams, every line of ink once its head has run out (his Strike-Through's
 *     and the room's), lies on the floor, on the tiles it covers; whoever stands on such a tile is hurt every `tick` seconds,
 *     `dmg` of his blow. As much of his ground may lie under it as `least` of it at his full life, to `most` as he comes to
 *     his end; past that, the oldest of it dries away (in `dry` seconds) as more is laid.
 *   HE MOVES (`walk`; the owner, shown it, by 09:34: “The ink is good but the censor needs to move more or melee classes
 *     will always be stuck fighting on ink”): standing with `crowd` or more of the nine tiles round him under his ink, or
 *     his Redaction, his Hush or his row of Strike-Through over, he walks off to clean floor: a spot `near` to `far` tiles
 *     from him with none of his ink within a tile of it, the nearer the hero the better (so that the fight goes with him),
 *     walked to straight; at `speed` (his walk's frames as far apart on the floor as they are painted for: quicker, his feet
 *     never sliding); not again for `again` seconds; given up after `most`.
 */
export const CENSOR_FIGHT = {
  on: true,
  ink: { every: 1.8, bar: 5, dmg: 0.8, line: 3, warn: 0.8, lineDmg: 1.0, lineLeast: 5 },
  lead: { lead: 0.5, most: 2.2 },
  row: 2,
  page: { n: 9, apart: 0.3, long: 13, gap: 2, wander: 3 },
  redactCd: 9,
  hushCd: 15,
  rest: 0.85,
  fill: { least: 0.08, most: 0.32, tick: 0.5, dmg: 0.25, dry: 0.8 },
  walk: { speed: 1.2, crowd: 3, near: 3, far: 6.5, again: 2.5, most: 7 },
};

/** His four, his basic blow first and his biggest last (his rulebook: the bigger the hit, the longer the cooldown), and the blacking out, brought by the rules. */
export const CENSOR_ACTS: readonly ActDef[] = [
  { id: 'censor:slash', clip: 'attack', long: CENSOR.slash.long, hit: CENSOR.slash.hit, dmg: 1, cooldown: 0, first: 0, after: 0.5, near: 0, far: 2.7 },
  { id: 'censor:strike', clip: 'strike', long: CENSOR.strike.long, hit: CENSOR.strike.hit, dmg: 1.5, cooldown: 7, first: 3, after: 0.6, near: 0, far: 11 },
  { id: 'censor:redact', clip: 'redact', long: CENSOR.redact.long, hit: CENSOR.redact.hit, dmg: 1.2, cooldown: 10, first: 5, after: 0.6, near: 0, far: 9 },
  { id: 'censor:hush', clip: 'hush', long: CENSOR.hush.long, hit: CENSOR.hush.hit, dmg: 0, cooldown: 18, first: 9, after: 0.6, near: 0, far: 12 },
  { id: 'censor:blackout', clip: 'redact', long: CENSOR.redact.long, hit: CENSOR.redact.hit, dmg: 1.2, cooldown: 0, first: 0, after: 0.8, near: 0, far: 99, forced: true },
];

// ---------------------------------------------------------------------------------------------
// WHAT HE LAYS ON THE FLOOR

/** A bar of Redaction (art/censor_shots.ts Bar): its middle (tiles), which way it runs (0 along x, 1 along y), how long and how wide. */
export interface Bar {
  x: number;
  y: number;
  along: 0 | 1;
  long: number;
  wide: number;
}
/** Each Redaction's bars, and the blacking out's bars and tiles, kept with its peril (the peril holds numbers only). */
const BARS = new WeakMap<Peril, Bar[]>();
const TILES = new WeakMap<Peril, number[]>();
export function barsOf(p: Peril): readonly Bar[] {
  return BARS.get(p) ?? [];
}
export function tilesOf(p: Peril): readonly number[] {
  return TILES.get(p) ?? [];
}

/** Is (x, y) under bar `b` (its middle within `half` of the bar's line, and within its ends)? */
export function underBar(b: Bar, x: number, y: number, half: number = CENSOR.redact.half): boolean {
  const u = b.along === 0 ? x - b.x : y - b.y;
  const v = b.along === 0 ? y - b.y : x - b.x;
  return Math.abs(u) <= b.long / 2 + 0.05 && Math.abs(v) <= Math.min(half, b.wide / 2 + 0.05);
}

/**
 * REDACTION'S BARS round (cx, cy): `n` of them side by side, `apart` tiles middle to middle, each `long` along `along` and
 * `wide` across, the middle one through (cx, cy); each trimmed back to the floor (its ends never over a wall), none left
 * shorter than a tile and a half.
 */
export function redactBars(L: Level, cx: number, cy: number, along: 0 | 1, n: number = CENSOR.redact.n): Bar[] {
  const R = CENSOR.redact;
  const f = L.floor;
  const floorAt = (x: number, y: number): boolean => {
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    return tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && f.tiles[ty * f.w + tx] === T_FLOOR;
  };
  const out: Bar[] = [];
  const ux = along === 0 ? 1 : 0;
  const uy = along === 0 ? 0 : 1;
  for (let k = 0; k < n; k++) {
    const off = (k - (n - 1) / 2) * R.apart;
    const mx = cx + (along === 0 ? 0 : off);
    const my = cy + (along === 0 ? off : 0);
    if (!floorAt(mx, my)) continue;
    let lo = 0;
    let hi = 0;
    for (let s = 0.25; s <= R.bar / 2 + 1e-6; s += 0.25) {
      if (!floorAt(mx + ux * s, my + uy * s)) break;
      hi = s;
    }
    for (let s = 0.25; s <= R.bar / 2 + 1e-6; s += 0.25) {
      if (!floorAt(mx - ux * s, my - uy * s)) break;
      lo = s;
    }
    const long = lo + hi + 0.2;
    if (long < 1.5) continue;
    const mid = (hi - lo) / 2;
    out.push({ x: mx + ux * mid, y: my + uy * mid, along, long, wide: R.wide });
  }
  return out;
}

/**
 * (CENSOR_FIGHT) A BAR through (x, y) along `along`, at most `long` tiles, over floor that can be walked on: from there each
 * way as far as it goes (to `long` / 2 either side, or from `lo` to `hi` along it); null where it would be shorter than `least`.
 */
export function barThrough(L: Level, x: number, y: number, along: 0 | 1, long: number, least = 1.5, lo = -long / 2, hi = long / 2): Bar | null {
  const f = L.floor;
  const walk = (px: number, py: number): boolean => {
    const tx = Math.floor(px);
    const ty = Math.floor(py);
    return tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && L.walk[ty * f.w + tx] === 1;
  };
  const ux = along === 0 ? 1 : 0;
  const uy = along === 0 ? 0 : 1;
  // (from the point of it nearest (x, y), each way)
  const s0 = Math.max(lo, Math.min(hi, 0));
  if (!walk(x + ux * s0, y + uy * s0)) return null;
  let a = s0;
  let b = s0;
  for (let s = s0 + 0.25; s <= hi + 1e-6; s += 0.25) {
    if (!walk(x + ux * s, y + uy * s)) break;
    b = s;
  }
  for (let s = s0 - 0.25; s >= lo - 1e-6; s -= 0.25) {
    if (!walk(x + ux * s, y + uy * s)) break;
    a = s;
  }
  const len = b - a + 0.2;
  if (len < least) return null;
  const mid = (a + b) / 2;
  return { x: x + ux * mid, y: y + uy * mid, along, long: len, wide: CENSOR.redact.wide };
}

/**
 * (CENSOR_FIGHT) THE PAGE STRUCK OUT round the hero at (hx, hy), from his side (him at (mx, my)): `page.n` lines along
 * `along`, a tile apart, the first on his side of the hero and the last past him; each `page.long` at most, cut where the
 * floor is, a gap `page.gap` wide in it within `page.wander` of the hero (`pick`: a number 0 to 1 for each line's gap).
 * Each line its bars (one either side of its gap), in the order they slam.
 */
export function pageLines(L: Level, hx: number, hy: number, mx: number, my: number, along: 0 | 1, pick: () => number): Bar[][] {
  const P = CENSOR_FIGHT.page;
  const cx = Math.floor(hx) + 0.5;
  const cy = Math.floor(hy) + 0.5;
  // (the lines march across the way they lie: from his side)
  const toward = along === 0 ? Math.sign(hy - my) || 1 : Math.sign(hx - mx) || 1;
  const K = (P.n - 1) / 2;
  const out: Bar[][] = [];
  for (let k = 0; k < P.n; k++) {
    const off = (k - K) * toward;
    const x = along === 0 ? cx : cx + off;
    const y = along === 0 ? cy + off : cy;
    // (the gap whole tiles: from the edge of one)
    const g0 = Math.round((pick() * 2 - 1) * P.wander) - P.gap / 2 + 0.5;
    const line: Bar[] = [];
    const a = barThrough(L, x, y, along, P.long, 0.6, -P.long / 2, g0 - 0.1);
    const b = barThrough(L, x, y, along, P.long, 0.6, g0 + P.gap + 0.1, P.long / 2);
    if (a) line.push(a);
    if (b) line.push(b);
    out.push(line);
  }
  return out;
}

/** Where the Strike-Through's line is measured from: on his brush's line (a little to his right), level with him. */
export function strikeFrom(m: { x: number; y: number; fx: number; fy: number }, hand: number): { x: number; y: number } {
  return beside(m.x, m.y, m.fx, m.fy, hand, 0, CENSOR.strike.point[1]);
}
/** And how far it can go, from there along the way he faces: to the first wall, or `most`. */
export function strikeLine(R: BossRules, m: { x: number; y: number; fx: number; fy: number }, hand: number): { x: number; y: number; reach: number } {
  const S = CENSOR.strike;
  const o = strikeFrom(m, hand);
  let reach = S.point[0];
  for (let s = S.point[0]; s <= S.most + 1e-6; s += 0.1) {
    if (!R.g.isOpen(o.x + m.fx * s, o.y + m.fy * s)) break;
    reach = s;
  }
  return { x: o.x, y: o.y, reach };
}

// ---------------------------------------------------------------------------------------------
// HIS GROUND

const GROUNDS = new WeakMap<Level, { key: number; tiles: number[] }>();

/** The tiles of his ground (floor tiles, joined to where he stood: see above), from where he stood (hx, hy). */
export function censorGround(L: Level, hx: number, hy: number): number[] {
  const f = L.floor;
  const W = f.w;
  const H = f.h;
  const key = Math.floor(hy) * W + Math.floor(hx);
  const was = GROUNDS.get(L);
  if (was && was.key === key) return was.tiles;
  const land = L.land;
  const zones = land?.zones;
  const floorAt = (i: number): boolean => f.tiles[i] === T_FLOOR;
  let inside: (x: number, y: number) => boolean;
  const boss = land?.areas.find((a) => a.role === 'boss' && blobDist(a.blob, hx, hy) < 1.2);
  if (zones && zones[key] === READING_ZONE) inside = (x, y) => zones[y * W + x] === READING_ZONE;
  else if (boss) inside = (x, y) => blobDist(boss.blob, x + 0.5, y + 0.5) < CENSOR.ground.blob;
  else inside = (x, y) => Math.hypot(x + 0.5 - hx, y + 0.5 - hy) <= CENSOR.ground.far;
  const tiles: number[] = [];
  const seen = new Uint8Array(W * H);
  // (from the floor tile he stood on, or the nearest)
  let start = key;
  if (!floorAt(start)) {
    let bd = Infinity;
    for (let y = Math.max(0, Math.floor(hy) - 3); y <= Math.min(H - 1, Math.floor(hy) + 3); y++) {
      for (let x = Math.max(0, Math.floor(hx) - 3); x <= Math.min(W - 1, Math.floor(hx) + 3); x++) {
        const d = Math.hypot(x + 0.5 - hx, y + 0.5 - hy);
        if (floorAt(y * W + x) && d < bd) {
          bd = d;
          start = y * W + x;
        }
      }
    }
  }
  if (floorAt(start)) {
    const q = [start];
    seen[start] = 1;
    while (q.length) {
      const i = q.pop()!;
      tiles.push(i);
      const x = i % W;
      const y = (i - x) / W;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny * W + nx;
        if (seen[j] || !floorAt(j) || !inside(nx, ny)) continue;
        seen[j] = 1;
        q.push(j);
      }
    }
  }
  tiles.sort((a, b) => a - b);
  GROUNDS.set(L, { key, tiles });
  return tiles;
}

/** How far the Hush reaches from (x, y): to the far side of his ground, `least` to `most`. */
export function hushReach(L: Level, m: Monster, x: number, y: number): number {
  const H = CENSOR.hush;
  const home = homeOf(m);
  let far = 0;
  const W = L.floor.w;
  for (const i of censorGround(L, home.x, home.y)) {
    const tx = i % W;
    far = Math.max(far, Math.hypot(tx + 0.5 - x, (i - tx) / W + 0.5 - y));
  }
  return Math.max(H.least, Math.min(H.most, far + 0.5));
}

/** Where he stood as he came into the world. */
function homeOf(m: Monster): { x: number; y: number } {
  return m.a1 && m.a1.hx !== undefined ? { x: m.a1.hx, y: m.a1.hy } : { x: m.x, y: m.y };
}

// ---------------------------------------------------------------------------------------------
// THE FLOOR BLACKED OUT

/** Which tiles of the floor are blacked out for good on this level (and walked on no more). */
const BLACKED = new WeakMap<Level, Set<number>>();
export function blackedOut(L: Level): ReadonlySet<number> {
  return BLACKED.get(L) ?? new Set<number>();
}

/**
 * Every tile of his ground and of its ways in (`room`: 1 for each) walked to from `from` without leaving them, as the floor's walk
 * now has it but for `less`. (Only his ground is blacked out: so long as all of it that is left, and every way into it, is
 * joined as before, every tile of the floor walked to before is walked to still.)
 */
function reached(L: Level, room: Uint8Array, from: number, less: ReadonlySet<number>): Uint8Array {
  const f = L.floor;
  const W = f.w;
  const out = new Uint8Array(W * f.h);
  if (from < 0 || L.walk[from] !== 1 || less.has(from)) return out;
  const q = [from];
  out[from] = 1;
  while (q.length) {
    const i = q.pop()!;
    const x = i % W;
    const y = (i - x) / W;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= f.h) continue;
      const j = ny * W + nx;
      if (out[j] || !room[j] || L.walk[j] !== 1 || less.has(j)) continue;
      out[j] = 1;
      q.push(j);
    }
  }
  return out;
}

/**
 * WHICH PARTS OF HIS GROUND HE BLACKS OUT (see above): runs of tiles along its walls, chosen by the floor's own dice, each
 * kept only if the room stays joined; as the bars that lay them (a tile wide). Empty where there is no room for any.
 * `share`: of his ground's floor (what is blacked out already counted in it), never more than `most` in all.
 */
export function blackoutPlan(R: BossRules, m: Monster, share: number = CENSOR.blackout.want): { tiles: number[]; bars: Bar[] } {
  const g = R.g;
  const L = g.level;
  const f = L.floor;
  const W = f.w;
  const H = f.h;
  const B = CENSOR.blackout;
  const home = homeOf(m);
  const ground = censorGround(L, home.x, home.y);
  const inG = new Uint8Array(W * H);
  for (const i of ground) inG[i] = 1;
  // (what stands or is laid there: not inked over)
  const taken = new Uint8Array(W * H);
  for (const p of L.props) if (p.tx >= 0 && p.ty >= 0 && p.tx < W && p.ty < H) taken[p.ty * W + p.tx] = 1;
  for (const t of L.act1?.tiles ?? []) taken[t.i] = 1;
  for (const z of L.hazards) for (let y = Math.floor(z.spot.y); y < z.spot.y + z.spot.h; y++) for (let x = Math.floor(z.spot.x); x < z.spot.x + z.spot.w; x++) if (x >= 0 && y >= 0 && x < W && y < H) taken[y * W + x] = 1;
  const open = (i: number): boolean => inG[i] === 1 && L.walk[i] === 1 && !taken[i] && !(BLACKED.get(L)?.has(i));
  const opens = ground.filter(open);
  if (!opens.length) return { tiles: [], bars: [] };
  // HOW DEEP INTO HIS GROUND each tile is (1: at its edge), and its ways in (a tile of it beside open floor that is not)
  const deep = new Uint16Array(W * H);
  const q: number[] = [];
  const doors: { x: number; y: number }[] = [];
  const door = new Uint8Array(W * H);
  for (const i of ground) {
    const x = i % W;
    const y = (i - x) / W;
    let edge = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      const j = ny * W + nx;
      const outside = nx < 0 || ny < 0 || nx >= W || ny >= H || !inG[j];
      if (!outside) continue;
      edge = true;
      if (nx >= 0 && ny >= 0 && nx < W && ny < H && L.walk[j] === 1) {
        doors.push({ x: nx + 0.5, y: ny + 0.5 });
        door[j] = 1;
      }
    }
    if (edge) {
      deep[i] = 1;
      q.push(i);
    }
  }
  for (let k = 0; k < q.length; k++) {
    const i = q[k];
    const x = i % W;
    const y = (i - x) / W;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const j = (y + dy) * W + x + dx;
      if (x + dx < 0 || y + dy < 0 || x + dx >= W || y + dy >= H || !inG[j] || deep[j]) continue;
      deep[j] = deep[i] + 1;
      q.push(j);
    }
  }
  const ways: { x: number; y: number }[] = [];
  if (L.land) ways.push(L.land.exit);
  if (L.ways?.onward) ways.push(L.ways.onward);
  const clear = (i: number): boolean => {
    const x = (i % W) + 0.5;
    const y = Math.floor(i / W) + 0.5;
    if (ways.some((w) => Math.hypot(w.x - x, w.y - y) < B.clearWay)) return false;
    if (doors.some((d) => Math.hypot(d.x - x, d.y - y) < B.clearDoor)) return false;
    return Math.hypot(m.x - x, m.y - y) >= B.clearHim;
  };
  const ok = (i: number): boolean => open(i) && deep[i] >= 1 && deep[i] <= B.deep && clear(i);
  // THE RUNS: from each tile, along x and along y, as long as it may go (to five)
  const runs: { tiles: number[]; along: 0 | 1 }[] = [];
  for (const i of opens) {
    if (!ok(i)) continue;
    const x = i % W;
    const y = (i - x) / W;
    for (const along of [0, 1] as const) {
      const run = [i];
      for (let k = 1; k < B.run[1]; k++) {
        const nx = x + (along === 0 ? k : 0);
        const ny = y + (along === 0 ? 0 : k);
        if (nx >= W || ny >= H || !ok(ny * W + nx)) break;
        run.push(ny * W + nx);
      }
      if (run.length >= B.run[0]) runs.push({ tiles: run, along });
    }
  }
  // (the nearest the hero first, by the floor's own dice a little: so that he sees the room close in round him)
  const dice = new RNG((f.seed ^ 0xb1ac4ed0) >>> 0);
  const h = g.hero;
  const near = (r: { tiles: number[] }): number => {
    const i = r.tiles[Math.floor(r.tiles.length / 2)];
    return Math.hypot((i % W) + 0.5 - h.x, Math.floor(i / W) + 0.5 - h.y);
  };
  const order = runs.map((r) => ({ r, k: near(r) + dice.range(0, B.jitter) }));
  order.sort((a, b) => a.k - b.k);
  runs.length = 0;
  for (const o of order) runs.push(o.r);
  let gone = 0;
  for (const i of ground) if (BLACKED.get(L)?.has(i)) gone++;
  const total = opens.length + gone;
  const want = Math.round(total * share);
  const most = Math.floor(total * B.most) - gone;
  const chosen = new Set<number>(BLACKED.get(L) ?? []);
  // (his ground and its ways in, walked from where he stands, or from a way in)
  const room = new Uint8Array(W * H);
  for (let i = 0; i < room.length; i++) room[i] = inG[i] || door[i];
  const here = Math.floor(m.y) * W + Math.floor(m.x);
  const from = L.walk[here] === 1 ? here : (opens[0] ?? -1);
  const before = reached(L, room, from, chosen);
  const picked: { tiles: number[]; along: 0 | 1 }[] = [];
  let n = 0;
  for (const r of runs) {
    if (n >= want) break;
    if (n + r.tiles.length > most) continue;
    if (r.tiles.some((i) => chosen.has(i))) continue;
    for (const i of r.tiles) chosen.add(i);
    // (the room kept joined: every tile walked to before is walked to still, but these)
    const now = reached(L, room, from, chosen);
    let joined = true;
    for (let i = 0; i < before.length && joined; i++) if (before[i] && !now[i] && !chosen.has(i)) joined = false;
    if (!joined) {
      for (const i of r.tiles) chosen.delete(i);
      continue;
    }
    picked.push(r);
    n += r.tiles.length;
  }
  const tiles = picked.flatMap((r) => r.tiles);
  const bars = picked.map((r): Bar => {
    const x0 = r.tiles[0] % W;
    const y0 = Math.floor(r.tiles[0] / W);
    const len = r.tiles.length;
    return r.along === 0 ? { x: x0 + len / 2, y: y0 + 0.5, along: 0, long: len, wide: 1 } : { x: x0 + 0.5, y: y0 + len / 2, along: 1, long: len, wide: 1 };
  });
  return { tiles, bars };
}

/** Put one standing where it can no longer stand (on floor blacked out) off it: to the nearest place it can stand. */
function putOff(R: BossRules, b: { x: number; y: number }, r: number): void {
  const g = R.g;
  const L = g.level;
  if (g.free(L.walk, b.x, b.y, r)) return;
  const f = L.floor;
  let best: { x: number; y: number } | null = null;
  let bd = Infinity;
  const cx = Math.floor(b.x);
  const cy = Math.floor(b.y);
  for (let y = cy - 4; y <= cy + 4; y++) {
    for (let x = cx - 4; x <= cx + 4; x++) {
      if (x < 0 || y < 0 || x >= f.w || y >= f.h || L.walk[y * f.w + x] !== 1) continue;
      // (the nearest point of that tile to where it stands, a body's width in from its edges)
      const px = Math.max(x + r + 0.01, Math.min(x + 1 - r - 0.01, b.x));
      const py = Math.max(y + r + 0.01, Math.min(y + 1 - r - 0.01, b.y));
      const d = Math.hypot(px - b.x, py - b.y);
      if (d >= bd || !g.free(L.walk, px, py, r)) continue;
      bd = d;
      best = { x: px, y: py };
    }
  }
  if (best) {
    b.x = best.x;
    b.y = best.y;
  }
}

/** The blacking out as worked out where he stood (worked out again only if he has moved since). */
const PLANS = new WeakMap<Monster, { x: number; y: number; plan: { tiles: number[]; bars: Bar[] } }>();
function planFor(R: BossRules, m: Monster): { tiles: number[]; bars: Bar[] } {
  const c = PLANS.get(m);
  if (c && Math.hypot(c.x - m.x, c.y - m.y) < 0.05) return c.plan;
  const plan = blackoutPlan(R, m);
  PLANS.set(m, { x: m.x, y: m.y, plan });
  return plan;
}

// ---------------------------------------------------------------------------------------------
// THE INK FILLS THE FLOOR (CENSOR_FIGHT)

/** His ground, a tile to each: 1 for his. */
const MASKS = new WeakMap<readonly number[], Uint8Array>();
function groundMask(L: Level, m: Monster): Uint8Array {
  const home = homeOf(m);
  const tiles = censorGround(L, home.x, home.y);
  let k = MASKS.get(tiles);
  if (!k) {
    k = new Uint8Array(L.floor.w * L.floor.h);
    for (const i of tiles) k[i] = 1;
    MASKS.set(tiles, k);
  }
  return k;
}
/** Whether (x, y) is on his ground and can be walked on. */
function onGround(L: Level, m: Monster, x: number, y: number): boolean {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  const W = L.floor.w;
  if (tx < 0 || ty < 0 || tx >= W || ty >= L.floor.h) return false;
  const i = ty * W + tx;
  return groundMask(L, m)[i] === 1 && L.walk[i] === 1;
}

/** Where the hero is heading: where he will be `lead` seconds on at the pace he is going, on his ground; null if he stands, or it is nowhere he could stand. */
function ahead(R: BossRules, m: Monster): { x: number; y: number } | null {
  const h = R.g.hero;
  const s = m.a1;
  const vx = s?.vx ?? 0;
  const vy = s?.vy ?? 0;
  const v = Math.hypot(vx, vy);
  if (v < 0.8) return null;
  const k = Math.min(CENSOR_FIGHT.lead.lead, CENSOR_FIGHT.lead.most / v);
  const x = h.x + vx * k;
  const y = h.y + vy * k;
  return onGround(R.g.level, m, x, y) ? { x, y } : null;
}

/** Is a bar of his yet to slam (a Redaction's, the page's, his ink's)? */
function barsToCome(R: BossRules, m: Monster, page = false): boolean {
  for (const p of R.g.perils) if (p.kind === 'act1' && p.a1 === 'censor:bars' && !p.done && p.from === m.name && (!page || p.c === 2)) return true;
  return false;
}

/** Bars of ink marked out now and slamming down by themselves `wait` seconds after their warning (`c`: 1 his ink, 2 a line of the page). */
function inkBars(R: BossRules, m: Monster, bars: Bar[], dmg: number, c: number, wait = 0): Peril | null {
  if (!bars.length) return null;
  const Rd = CENSOR.redact;
  const b = bars[0];
  const p = R.peril(m, 'act1', b.x, b.y, { a1: 'censor:bars', t: -Rd.warn - wait, hit: 0, dur: Rd.lie, dmg: R.g.rollMonsterDmg(m) * dmg, a: b.along, c, d: 1 });
  BARS.set(p, bars);
  return p;
}

/**
 * A LINE OF INK RUN ACROSS THE ROOM through (x, y) from the wall behind it, along a way of eight (the one it runs furthest
 * along, of a few tried): marked out `ink.warn` before it runs, then run out as Strike-Through's line is.
 */
function marginLine(R: BossRules, m: Monster, x: number, y: number): Peril | null {
  const g = R.g;
  const I = CENSOR_FIGHT.ink;
  const S = CENSOR.strike;
  let best: { ox: number; oy: number; ux: number; uy: number; reach: number } | null = null;
  const first = Math.floor(g.rng.range(0, 8));
  for (let k = 0; k < 8; k++) {
    const a = ((first + k * 3) % 8) * (Math.PI / 4);
    const ux = Math.round(Math.cos(a) * 1e6) / 1e6;
    const uy = Math.round(Math.sin(a) * 1e6) / 1e6;
    // (back from him to the wall, then on through him to the wall before him)
    let back = 0;
    for (let s = 0.1; s <= 30; s += 0.1) {
      if (!g.isOpen(x - ux * s, y - uy * s)) break;
      back = s;
    }
    let on = 0;
    for (let s = 0.1; s <= 30; s += 0.1) {
      if (!g.isOpen(x + ux * s, y + uy * s)) break;
      on = s;
    }
    if (back < 2) continue;
    const reach = Math.min(back + on, S.most + 14);
    if (!best || reach > best.reach) best = { ox: x - ux * back, oy: y - uy * back, ux, uy, reach };
    if (k >= 2 && best.reach >= I.lineLeast + 4) break;
  }
  if (!best || best.reach < I.lineLeast) return null;
  return R.peril(m, 'act1', best.ox, best.oy, { a1: 'censor:margin', t: -I.warn, hit: 0, dur: S.lie, dmg: g.rollMonsterDmg(m) * I.lineDmg, a: best.reach, b: 0, fx: best.ux, fy: best.uy, hand: 1 });
}

/**
 * HIS INK, all the while (CENSOR_FIGHT.ink): a cross of bars slamming down where the hero is heading, and every so often a
 * line across the room through him; not through his Redaction (the page) until its last bar has slammed, nor at a hero
 * gone from his ground.
 */
function ink(R: BossRules, m: Monster, dt: number): void {
  const g = R.g;
  const h = g.hero;
  const s = m.a1!;
  const I = CENSOR_FIGHT.ink;
  if (s.iw === undefined) s.iw = I.every;
  if (h.life <= 0 || g.over) return;
  if (m.state === 'act' && m.act && m.act.id === 'censor:redact') return;
  if (barsToCome(R, m, true)) return;
  if (!onGround(g.level, m, h.x, h.y)) return;
  s.iw -= dt;
  if (s.iw > 0) return;
  s.iw += I.every;
  if (s.iw < 0) s.iw = I.every;
  const n = (s.ik = (s.ik ?? 0) + 1);
  const at = ahead(R, m) ?? { x: h.x, y: h.y };
  const cx = Math.floor(at.x) + 0.5;
  const cy = Math.floor(at.y) + 0.5;
  const bars: Bar[] = [];
  for (const along of [0, 1] as const) {
    const b = barThrough(g.level, cx, cy, along, I.bar);
    if (b) bars.push(b);
  }
  inkBars(R, m, bars, I.dmg, 1);
  if (I.line && n % I.line === 0) marginLine(R, m, h.x, h.y);
}

/** WHAT OF HIS INK LIES ON A LEVEL'S FLOOR: each bar's peril laid to stay, oldest first, with its tiles; how many lie on each tile, how many tiles have any; when it last hurt the hero, and how hard it hurts. */
interface Pool {
  list: Peril[];
  tiles: Map<Peril, number[]>;
  on: Uint16Array;
  n: number;
  hurtT: number;
  dmg: number;
}
const POOLS = new WeakMap<Level, Pool>();
function poolOf(L: Level): Pool {
  let k = POOLS.get(L);
  if (!k) {
    k = { list: [], tiles: new Map(), on: new Uint16Array(L.floor.w * L.floor.h), n: 0, hurtT: -1e9, dmg: 0 };
    POOLS.set(L, k);
  }
  return k;
}
/** Whether the tile (x, y) is on lies under his ink, laid to stay and not drying. */
export function inked(L: Level, x: number, y: number): boolean {
  const k = POOLS.get(L);
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  if (!k || tx < 0 || ty < 0 || tx >= L.floor.w || ty >= L.floor.h) return false;
  return k.on[ty * L.floor.w + tx] > 0;
}
/** How many tiles of a level lie under his ink, laid to stay and not drying. */
export function inkedCount(L: Level): number {
  return POOLS.get(L)?.n ?? 0;
}
/** A bar's peril laid to stay: since when it dries (seconds of its own clock; -1 not drying), or undefined if it is not laid to stay. */
const LASTING = new WeakMap<Peril, { dry: number }>();
export function lastingOf(p: Peril): { readonly dry: number } | undefined {
  return LASTING.get(p);
}

/** The whole tiles bars cover (their middle lines', on floor that can be walked on). */
function barTiles(L: Level, bars: readonly Bar[]): number[] {
  const W = L.floor.w;
  const out = new Set<number>();
  for (const b of bars) {
    const lo = (b.along === 0 ? b.x : b.y) - b.long / 2 + 0.15;
    const hi = (b.along === 0 ? b.x : b.y) + b.long / 2 - 0.15;
    for (let u = Math.floor(lo); u <= Math.floor(hi); u++) {
      const tx = b.along === 0 ? u : Math.floor(b.x);
      const ty = b.along === 0 ? Math.floor(b.y) : u;
      if (tx < 0 || ty < 0 || tx >= W || ty >= L.floor.h || L.walk[ty * W + tx] !== 1) continue;
      out.add(ty * W + tx);
    }
  }
  return [...out];
}

/** Its tiles no longer under it (it dries, or is gone). */
function lift(k: Pool, p: Peril): void {
  const tiles = k.tiles.get(p);
  if (!tiles) return;
  for (const i of tiles) if (k.on[i] > 0 && --k.on[i] === 0) k.n--;
  k.tiles.delete(p);
  const j = k.list.indexOf(p);
  if (j >= 0) k.list.splice(j, 1);
}

/** It begins to dry away (CENSOR_FIGHT.fill.dry): it hurts no more, and is gone once dried. */
function dryAway(k: Pool, p: Peril): void {
  const s = LASTING.get(p);
  if (!s || s.dry >= 0) return;
  s.dry = p.t;
  lift(k, p);
}

/**
 * THE BARS LAID TO STAY (CENSOR_FIGHT.fill), as they slam: on the tiles they cover; while more of his ground lies under his
 * ink than his share now (the more the more of his life is gone), the oldest dries away.
 */
function lay(g: Game, m: Monster, p: Peril): void {
  const F = CENSOR_FIGHT.fill;
  const L = g.level;
  const tiles = barTiles(L, barsOf(p));
  if (!tiles.length) return;
  const k = poolOf(L);
  p.dur = Infinity;
  LASTING.set(p, { dry: -1 });
  k.list.push(p);
  k.tiles.set(p, tiles);
  for (const i of tiles) if (k.on[i]++ === 0) k.n++;
  k.dmg = g.rollMonsterDmg(m) * F.dmg;
  // (his share: of his ground's floor, `least` at his full life to `most` at his end)
  const mask = groundMask(L, m);
  let room = 0;
  for (let i = 0; i < mask.length; i++) if (mask[i] && L.walk[i] === 1) room++;
  const gone = 1 - Math.max(0, Math.min(1, m.life / m.maxLife));
  const most = Math.round(room * (F.least + (F.most - F.least) * gone));
  while (k.n > most && k.list.length > 1 && k.list[0] !== p) dryAway(k, k.list[0]);
}

/** How many of the nine tiles round (x, y) lie under his ink. */
function inkAround(L: Level, x: number, y: number): number {
  let n = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (inked(L, x + dx, y + dy)) n++;
  return n;
}

/** (CENSOR_FIGHT.walk) Clean floor to walk off to: none of his ink within a tile of it; `near` to `far` from him, the nearer the hero the better; walked to straight. */
function cleanSpot(R: BossRules, m: Monster): { x: number; y: number } | null {
  const g = R.g;
  const L = g.level;
  const Wk = CENSOR_FIGHT.walk;
  const h = g.hero;
  const r = Math.min(m.r, 0.42);
  let best: { x: number; y: number } | null = null;
  let bs = Infinity;
  const R0 = Math.ceil(Wk.far);
  for (let dy = -R0; dy <= R0; dy++) {
    for (let dx = -R0; dx <= R0; dx++) {
      const x = Math.floor(m.x) + dx + 0.5;
      const y = Math.floor(m.y) + dy + 0.5;
      const d = Math.hypot(x - m.x, y - m.y);
      if (d < Wk.near || d > Wk.far || !onGround(L, m, x, y) || inkAround(L, x, y) > 0 || !g.free(L.walk, x, y, r)) continue;
      // (straight there, over floor he may stand on)
      let clear = true;
      for (let s = 0.25; s < d && clear; s += 0.25) if (!g.free(L.walk, m.x + ((x - m.x) * s) / d, m.y + ((y - m.y) * s) / d, r)) clear = false;
      if (!clear) continue;
      const score = Math.abs(Math.hypot(x - h.x, y - h.y) - 2.5) + 0.3 * Math.abs(d - (Wk.near + Wk.far) / 2) + g.rng.range(0, 0.6);
      if (score < bs) {
        bs = score;
        best = { x, y };
      }
    }
  }
  return best;
}

/**
 * (CENSOR_FIGHT.walk) HE WALKS OFF TO CLEAN FLOOR, standing in his ink or his big move over (`wo`): to a spot of it (`wx`,
 * `wy`; `wk` while he goes), straight, at his `walk.speed`, his walk's frames as far apart on the floor as they are painted
 * for. True while he goes (the step is all he does: his cooldowns run on).
 */
function walkOff(R: BossRules, m: Monster, dt: number): boolean {
  const g = R.g;
  const L = g.level;
  const Wk = CENSOR_FIGHT.walk;
  const s = m.a1!;
  if (m.state === 'act') return false;
  s.ww = (s.ww ?? 0) - dt;
  if (!s.wk) {
    const want = s.wo === 1 || (s.ww <= 0 && inkAround(L, m.x, m.y) >= Wk.crowd);
    if (!want || s.ww > 0) return false;
    s.wo = 0;
    s.ww = Wk.again;
    const to = cleanSpot(R, m);
    if (!to) return false;
    s.wk = 1;
    s.wx = to.x;
    s.wy = to.y;
    s.wt = 0;
    s.sn = 0;
  }
  const dx = s.wx - m.x;
  const dy = s.wy - m.y;
  const d = Math.hypot(dx, dy);
  s.wt = (s.wt ?? 0) + dt;
  const stop = (): boolean => {
    s.wk = 0;
    s.ww = Wk.again;
    m.gait = { mode: 'stand', t: 0 };
    m.anim = 'idle';
    m.state = 'chase';
    return false;
  };
  if (d < 0.12 || s.wt > Wk.most) return stop();
  const sp = Wk.speed * (m.chillT > 0 ? 1 - (m.chill ?? 0) : 1);
  m.fx = dx / d;
  m.fy = dy / d;
  const step = Math.min(d, sp * dt);
  const x0 = m.x;
  const y0 = m.y;
  g.slide(m, Math.min(m.r, 0.42), m.fx * step, m.fy * step, L.walk, true);
  // (held up: he stands, and looks again in a while)
  if (Math.hypot(m.x - x0, m.y - y0) < step * 0.2) return stop();
  if (!m.gait || m.gait.mode !== 'walk') m.gait = { mode: 'walk', t: 0 };
  m.gait.t += (Math.hypot(m.x - x0, m.y - y0)) / CENSOR_GAIT.pace;
  m.anim = 'walk';
  m.state = 'chase';
  if (m.moveCd) for (let k = 0; k < m.moveCd.length; k++) m.moveCd[k] -= dt;
  return true;
}

/** As he dies: all his ink dries away. */
function dryAll(L: Level): void {
  const k = POOLS.get(L);
  if (!k) return;
  for (const p of [...k.list]) dryAway(k, p);
}

/** The peril of his act now (his Redaction's bars, or the blacking out's), kept while the act is made. */
const LAYING = new WeakMap<Monster, Peril>();

/** The bars slam down (Redaction, or the blacking out): whoever is under one is struck, once. */
function slam(R: BossRules, m: Monster, a: ActDef, bars: readonly Bar[]): void {
  const g = R.g;
  const h = g.hero;
  if (bars.some((b) => underBar(b, h.x, h.y))) R.blow(m, a.dmg);
  g.emit({ t: 'shake', amount: a.id === 'censor:blackout' ? 7 : 5 });
  g.sfx('slam', 1);
}

// ---------------------------------------------------------------------------------------------
// HIS RULES

export const RULES: Act1Rules | null = {
  gait: CENSOR_GAIT,
  acts: CENSOR_ACTS,

  spawned(_R, m) {
    m.a1 = { hx: m.x, hy: m.y, blk: 0, rp: 0 };
  },

  tick(R, m, dt) {
    if (!CENSOR_FIGHT.on || !m.a1) return false;
    const s = m.a1;
    // (the hero's pace, for where he is heading)
    const h = R.g.hero;
    if (s.lx !== undefined && s.ly !== undefined && dt > 0) {
      const ix = (h.x - s.lx) / dt;
      const iy = (h.y - s.ly) / dt;
      // (a leap or a warp is not a pace)
      const ok = Math.hypot(ix, iy) < 12;
      s.vx = (s.vx ?? 0) * 0.75 + (ok ? ix : 0) * 0.25;
      s.vy = (s.vy ?? 0) * 0.75 + (ok ? iy : 0) * 0.25;
    }
    s.lx = h.x;
    s.ly = h.y;
    ink(R, m, dt);
    // (he moves: off his ink to clean floor)
    return walkOff(R, m, dt);
  },

  can(R, m, a) {
    // (the Hush: not while the hero's words are dark still)
    if (a.id === 'censor:hush') return R.g.hushT <= 0.5;
    return true;
  },

  forced(R, m, acts) {
    const s = m.a1;
    if (s && CENSOR_FIGHT.on) {
      // (CENSOR_FIGHT: no blacking out: his ink fills the floor instead. Strike-Through in a row: the next straight after, while the hero is in its reach and his sight)
      if ((s.sn ?? 0) > 0) {
        const h = R.g.hero;
        const S = acts.find((x) => x.id === 'censor:strike')!;
        if (Math.hypot(h.x - m.x, h.y - m.y) <= S.far && R.g.sees(m.x, m.y, h.x, h.y)) return acts.indexOf(S);
        s.sn = 0;
      }
      return -1;
    }
    // AT HALF HIS LIFE: the floor blacked out, where there is floor to black out (`blk`: 0 not yet, 1 to come as soon as
    // he stands, 2 made or not to be made)
    if (!s || s.blk === 2) return -1;
    if (!s.blk) {
      if (m.life > m.maxLife * CENSOR.blackout.at) return -1;
      s.blk = planFor(R, m).tiles.length ? 1 : 2;
      if (s.blk === 2) return -1;
    }
    return acts.findIndex((x) => x.id === 'censor:blackout');
  },

  start(R, m, a) {
    const g = R.g;
    const act = m.act!;
    const F = CENSOR_FIGHT;
    const s = (m.a1 ??= {});
    if (a.id === 'censor:strike') {
      if (F.on) {
        // (CENSOR_FIGHT: a row begun, or the next of it; the second where the hero is heading)
        if (!(s.sn ?? 0)) {
          s.sn = F.row;
          s.sk = 0;
        } else s.sk = (s.sk ?? 0) + 1;
        const to = s.sk === 1 ? ahead(R, m) : null;
        if (to) {
          const d = Math.hypot(to.x - m.x, to.y - m.y);
          if (d > 0.5) {
            m.fx = (to.x - m.x) / d;
            m.fy = (to.y - m.y) / d;
            act.hand = handOf(CENSOR_GAIT.trueBack, m.fx, m.fy);
          }
        }
      }
      // (the line he will draw: from his brush's line, the way he faces now, to the first wall)
      act.a = strikeLine(R, m, act.hand).reach;
      g.sfx('swing', 0.3);
    } else if (a.id === 'censor:redact') {
      m.a1 = { ...(m.a1 ?? {}), rp: ((m.a1?.rp ?? 0) + 1) % 2 };
      // (CENSOR_FIGHT: by turns, his bars one way (`b` 0), both ways at once (1), the page struck out (2))
      if (F.on) {
        const n = (m.a1.rn = ((m.a1.rn ?? -1) + 1) % 3);
        act.b = n;
        if (act.b === 2) g.msg(`${m.name} strikes out the page`, MSG.foe);
      }
    } else if (a.id === 'censor:blackout') {
      // (worked out where he stands now: he may have walked a step or two to a stand since it was brought)
      m.a1 = { ...(m.a1 ?? {}), blk: 2 };
      const plan = planFor(R, m);
      const home = homeOf(m);
      const p = R.peril(m, 'act1', home.x, home.y, { a1: 'censor:black', t: -a.hit, hit: 0, dur: Infinity, dmg: 0 });
      BARS.set(p, plan.bars);
      TILES.set(p, plan.tiles);
      LAYING.set(m, p);
      g.msg(`${m.name} blacks out the floor`, MSG.foe);
    }
  },

  acting(R, m, a, t0, t1, dt) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    switch (a.id) {
      case 'censor:slash': {
        const S = CENSOR.slash;
        if (at(0.6)) g.sfx('swing', 0.9);
        if (!at(S.hit)) break;
        // (down and across before him, from his right to his left: whoever the stroke comes down through)
        const r = R.rel(m);
        const d = Math.hypot(r.fwd, r.left);
        const bearing = Math.atan2(r.left, r.fwd) / D;
        if (r.fwd > 0.2 && d <= S.reach + TUNE.heroRadius * 0.5 && bearing >= S.from && bearing <= S.to) R.blow(m, a.dmg);
        R.peril(m, 'act1', m.x, m.y, { a1: 'censor:slash', hit: 0, dur: S.mark, done: 1 });
        g.emit({ t: 'shake', amount: 2 });
        break;
      }
      case 'censor:strike': {
        const S = CENSOR.strike;
        if (!at(S.hit)) break;
        // THE THRUST: the brush itself strikes whoever is along it; then the line runs out from its point
        const o = strikeFrom(m, act.hand);
        const r = fromFigure(o.x, o.y, m.fx, m.fy, act.hand, h.x, h.y);
        const hit = r.fwd > 0.3 && r.fwd <= S.point[0] + 0.15 && Math.abs(r.left) <= S.half + TUNE.heroRadius * 0.5;
        if (hit) R.blow(m, a.dmg);
        R.peril(m, 'act1', o.x, o.y, { a1: 'censor:line', hit: 0, dur: S.lie, dmg: g.rollMonsterDmg(m) * a.dmg, a: act.a, b: S.point[0], done: hit ? 1 : 0 });
        g.emit({ t: 'shake', amount: 3 });
        g.sfx('swing', 1);
        break;
      }
      case 'censor:redact':
      case 'censor:blackout': {
        const Rd = CENSOR.redact;
        // (the bars marked out on the floor from REDACT_WARN before the slam: Redaction's about the hero as it begins)
        if (a.id === 'censor:redact' && at(a.hit - Rd.warn)) {
          const along = ((m.a1?.rp ?? 0) % 2) as 0 | 1;
          const cx = Math.floor(h.x) + 0.5;
          const cy = Math.floor(h.y) + 0.5;
          if (act.b === 2) {
            // (CENSOR_FIGHT) THE PAGE STRUCK OUT: every line of it marked out now; its first slams as his brush comes down,
            // the rest one after another after it, by themselves
            const lines = pageLines(g.level, h.x, h.y, m.x, m.y, along, () => g.rng.next());
            const P = CENSOR_FIGHT.page;
            lines.forEach((line, k) => {
              if (!line.length) return;
              if (k === 0) {
                const p = R.peril(m, 'act1', line[0].x, line[0].y, { a1: 'censor:bars', t: -Rd.warn, hit: 0, dur: Rd.lie, dmg: 0, a: along, c: 2 });
                BARS.set(p, line);
                LAYING.set(m, p);
              } else inkBars(R, m, line, a.dmg, 2, k * P.apart);
            });
          } else {
            // (CENSOR_FIGHT: by turns, both ways at once)
            const bars = act.b === 1 ? [...redactBars(g.level, cx, cy, 0), ...redactBars(g.level, cx, cy, 1)] : redactBars(g.level, cx, cy, along);
            const p = R.peril(m, 'act1', h.x, h.y, { a1: 'censor:bars', t: -Rd.warn, hit: 0, dur: Rd.lie, dmg: 0, a: along });
            BARS.set(p, bars);
            LAYING.set(m, p);
          }
        }
        const p = LAYING.get(m);
        if (!p || p.done) break;
        // (the bars' clock is his slam's: what is drawn of them keeps time with his picture; the perils' step adds this step after)
        p.t = t1 - a.hit - dt;
        if (!at(a.hit)) break;
        p.done = 1;
        if (a.id === 'censor:blackout') {
          // FOR GOOD: walked on no more; whoever is under a bar struck; anyone left on one put off it
          const L = g.level;
          const tiles = tilesOf(p);
          const set = BLACKED.get(L) ?? new Set<number>();
          for (const i of tiles) {
            L.walk[i] = 0;
            set.add(i);
          }
          BLACKED.set(L, set);
          slam(R, m, a, barsOf(p));
          putOff(R, h, TUNE.heroRadius);
          for (const o of g.monsters) if (!o.dead) putOff(R, o, Math.min(o.r, 0.42));
        } else {
          slam(R, m, a, barsOf(p));
          // (CENSOR_FIGHT: laid to stay)
          if (CENSOR_FIGHT.on) lay(g, m, p);
        }
        break;
      }
      case 'censor:hush': {
        const H = CENSOR.hush;
        if (!at(H.hit)) break;
        // HE LETS THE SILENCE GO: its ring rolls out across the room
        R.peril(m, 'act1', m.x, m.y, { a1: 'censor:hush', hit: 0, dur: H.veil, a: hushReach(g.level, m, m.x, m.y) });
        g.emit({ t: 'shake', amount: 1 });
        break;
      }
      default:
        break;
    }
  },

  end(R, m, a) {
    LAYING.delete(m);
    const F = CENSOR_FIGHT;
    const s = m.a1;
    if (!F.on || !s) return;
    // (Strike-Through in a row: the next straight after)
    if (a.id === 'censor:strike') {
      s.sn = Math.max(0, (s.sn ?? 0) - 1);
      if (s.sn > 0) {
        m.cd = 0;
        return;
      }
    }
    // (he moves: his big move over, he walks off to clean floor)
    if (a.id === 'censor:strike' || a.id === 'censor:redact' || a.id === 'censor:hush') {
      s.wo = 1;
      s.ww = 0;
    }
    // (his rests, and his cooldowns)
    m.cd *= F.rest;
    const i = CENSOR_ACTS.findIndex((x) => x.id === a.id);
    if (m.moveCd && i >= 0 && a.cooldown > 0) {
      if (a.id === 'censor:redact') m.moveCd[i] *= F.redactCd / a.cooldown;
      else if (a.id === 'censor:hush') m.moveCd[i] *= F.hushCd / a.cooldown;
    }
    void R;
  },

  peril(R, p, dt) {
    const g = R.g;
    const h = g.hero;
    void dt;
    switch (p.a1) {
      case 'censor:margin':
        // (CENSOR_FIGHT: a line of ink across the room from its wall: marked out first, then run out as his line is)
        if (p.t < 0) return;
      // falls through
      case 'censor:line': {
        // THE LINE runs out from his brush's point: whoever its head runs through is struck
        if (p.done) return;
        const S = CENSOR.strike;
        const head0 = Math.min(p.a, p.b + S.speed * Math.max(0, p.t - dt));
        const head1 = Math.min(p.a, p.b + S.speed * p.t);
        const r = fromFigure(p.x, p.y, p.fx, p.fy, p.hand, h.x, h.y);
        if (r.fwd >= head0 - 0.3 && r.fwd <= head1 + 0.15 && r.fwd >= p.b - 0.2 && Math.abs(r.left) <= S.half + TUNE.heroRadius * 0.5) {
          const was = h.life;
          g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
          if (h.life < was) p.done = 1;
        }
        if (head1 >= p.a) p.done = 1;
        return;
      }
      case 'censor:bars': {
        const Rd = CENSOR.redact;
        // (CENSOR_FIGHT: his ink, and the page's lines after its first, slam down by themselves as their warning ends)
        if (!p.done && p.d === 1 && p.t >= 0) {
          p.done = 1;
          if (!g.over && barsOf(p).some((b) => underBar(b, h.x, h.y))) g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
          g.emit({ t: 'shake', amount: p.c === 2 ? 2 : 1 });
          g.sfx('slam', p.c === 2 ? 0.6 : 0.35);
          // (CENSOR_FIGHT: laid to stay, while he lives)
          const m = CENSOR_FIGHT.on ? g.monsters.find((o) => !o.dead && o.kind === 'censor' && o.name === p.from) : undefined;
          if (m) lay(g, m, p);
        }
        // (CENSOR_FIGHT) LAID TO STAY: whoever stands on it is hurt, every `fill.tick` (once for all of it: the oldest's step
        // does it); drying away, gone once dried
        const last = LASTING.get(p);
        if (last) {
          const F = CENSOR_FIGHT.fill;
          if (last.dry >= 0) {
            if (p.t - last.dry >= F.dry) p.dur = p.t;
            return;
          }
          const k = poolOf(g.level);
          if (k.list[0] === p && !g.over && h.life > 0 && g.time - k.hurtT >= F.tick && inked(g.level, h.x, h.y)) {
            k.hurtT = g.time;
            g.hurtHero(k.dmg, p.el, p.words, null, p.from, h.x, h.y, p.half);
          }
        }
        // (lying wet: whoever walks in it is slowed by it, until it dries)
        if (!p.done || p.t > Rd.lie - 0.5) return;
        if (barsOf(p).some((b) => underBar(b, h.x, h.y))) {
          h.chill = Math.max(h.chillT > 0 ? h.chill : 0, Rd.slow);
          h.chillT = Math.max(h.chillT, 0.25);
        }
        return;
      }
      case 'censor:black': {
        // (laid along their lengths: then the floor's own tiles, where it is dressed; render/act1_fx lays them where it is not)
        if (!p.done || p.done & 2 || p.t < CENSOR.redact.lay) return;
        p.done |= 2;
        const L = g.level;
        if (L.act1) for (const i of tilesOf(p)) L.act1.tiles.push({ i, name: BLACKED_TILE, frame: 0, mid: 1 });
        return;
      }
      case 'censor:hush': {
        // THE SILENCE: as its ring passes the hero, wherever he stands in the room, his words go dark
        if (p.done) return;
        const H = CENSOR.hush;
        const ring = 0.3 + (p.a - 0.3) * sm(p.t / H.ring);
        const d = Math.hypot(h.x - p.x, h.y - p.y);
        if (d > p.a) {
          if (p.t >= H.ring) p.done = 1;
          return;
        }
        if (d > ring) return;
        p.done = 1;
        if (g.over) return;
        g.hush(HUSH_FOR);
        g.emit({ t: 'text', x: h.x, y: h.y, text: 'Hushed', color: '#9890b4' });
        return;
      }
      default:
        return;
    }
  },

  died(R, m) {
    const g = R.g;
    // (what of his is still to come does not; what is laid for good stays)
    for (const p of g.perils) {
      if (p.kind !== 'act1' || !p.a1 || !p.a1.startsWith('censor:') || p.from !== m.name) continue;
      if (p.a1 === 'censor:black') {
        if (!p.done) p.dur = p.t;
        continue;
      }
      if (p.a1 === 'censor:bars' && !p.done) p.dur = Math.min(p.dur, p.t);
      else if (p.a1 === 'censor:margin' && p.t < 0) p.dur = p.t;
      else if (p.a1 === 'censor:line' || p.a1 === 'censor:margin') {
        // (a line still running stops where its head is, harming no more, and dries there)
        p.done = 1;
        p.a = Math.min(p.a, p.b + CENSOR.strike.speed * Math.max(0, p.t));
      } else if (p.a1 === 'censor:hush') {
        p.done = 1;
        p.dur = Math.min(p.dur, p.t + 0.6);
      }
    }
    LAYING.delete(m);
    // (CENSOR_FIGHT: his ink on the floor dries away)
    dryAll(g.level);
    // THE BOOK OF STOLEN WORDS BURSTS, where it lies on its lectern: the words fly home
    let book = null as (typeof g.level.props)[number] | null;
    let bd = Infinity;
    for (const p of g.level.props) {
      if (p.kind !== 'piece' || p.name !== STOLEN_BOOK || p.state === 1) continue;
      const d = Math.hypot(p.x - m.x, p.y - m.y);
      if (d < bd) {
        bd = d;
        book = p;
      }
    }
    if (book) {
      book.state = 1;
      R.peril(m, 'act1', book.x, book.y, { a1: 'censor:book', hit: 0, dur: CENSOR.book.fly, done: 1 });
      g.emit({ t: 'shake', amount: 4 });
      g.sfx('explode', 0.6);
    }
  },
};
