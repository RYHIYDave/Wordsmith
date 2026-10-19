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
//     the ways in and the way on kept clear, the room kept joined (every tile that could be walked to before still can).
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
// Every number here that is a picture's is written down here; tests/act2_censor.test.ts holds it to the art.

import { RNG } from '../../engine/rng';
import { blobDist } from '../act1_layout';
import type { ActDef, BossRules, GaitDef } from '../bosses';
import { HUSH_FOR, MSG, TUNE } from '../defs';
import { beside, fromFigure } from '../facing';
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
  hush: { long: 2.6, hit: 1.06, ring: 1.0, veil: 3.0, least: 6, most: 12 },
  /**
   * The floor blacked out at half his life (`at`): about `want` of his ground's open floor, never more than `most`; runs of
   * `run` tiles along its walls (no deeper in than `deep` tiles); none within `clearWay` of the way on, `clearDoor` of a way
   * into his ground, `clearHim` of him; none where something stands or is laid.
   */
  blackout: { at: 0.5, want: 0.25, most: 0.32, deep: 3, run: [3, 5] as const, clearWay: 2.5, clearDoor: 2.2, clearHim: 1.6 },
  /** His ground where the floor does not say (tiles: an open area's blob; on a floor with none, the practice room, its floor as far as this round him: all of it). */
  ground: { blob: 1.08, far: 24 },
  /** The book of stolen words bursting as he dies: how long its words fly. */
  book: { fly: 3.0 },
};

/** His walk, painted for 0.8 tiles a second (CE_PACE; twelve frames at eight a second): stopped at any frame of it. */
export const CENSOR_GAIT: GaitDef = { pace: 0.8, cycle: 1 / 8, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 2.0, slack: 0.6, trueBack: true };

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

/** Every tile walked to from the floor's start, as the floor's walk now has it but for `less`. */
function reached(L: Level, less: ReadonlySet<number>): Uint8Array {
  const f = L.floor;
  const W = f.w;
  const out = new Uint8Array(W * f.h);
  const s = Math.floor(f.start.y) * W + Math.floor(f.start.x);
  if (L.walk[s] !== 1 || less.has(s)) return out;
  const q = [s];
  out[s] = 1;
  while (q.length) {
    const i = q.pop()!;
    const x = i % W;
    const y = (i - x) / W;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= f.h) continue;
      const j = ny * W + nx;
      if (out[j] || L.walk[j] !== 1 || less.has(j)) continue;
      out[j] = 1;
      q.push(j);
    }
  }
  return out;
}

/**
 * WHICH PARTS OF HIS GROUND HE BLACKS OUT (see above): runs of tiles along its walls, chosen by the floor's own dice, each
 * kept only if the room stays joined; as the bars that lay them (a tile wide). Empty where there is no room for any.
 */
export function blackoutPlan(R: BossRules, m: Monster): { tiles: number[]; bars: Bar[] } {
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
      if (nx >= 0 && ny >= 0 && nx < W && ny < H && L.walk[j] === 1) doors.push({ x: nx + 0.5, y: ny + 0.5 });
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
  const dice = new RNG((f.seed ^ 0xb1ac4ed0) >>> 0);
  for (let i = runs.length - 1; i > 0; i--) {
    const j = dice.int(0, i);
    [runs[i], runs[j]] = [runs[j], runs[i]];
  }
  const want = Math.round(opens.length * B.want);
  const most = Math.floor(opens.length * B.most);
  const chosen = new Set<number>(BLACKED.get(L) ?? []);
  const before = reached(L, chosen);
  const picked: { tiles: number[]; along: 0 | 1 }[] = [];
  let n = 0;
  for (const r of runs) {
    if (n >= want) break;
    if (n + r.tiles.length > most) continue;
    if (r.tiles.some((i) => chosen.has(i))) continue;
    for (const i of r.tiles) chosen.add(i);
    // (the room kept joined: every tile walked to before is walked to still, but these)
    const now = reached(L, chosen);
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

  can(R, m, a) {
    // (the Hush: not while the hero's words are dark still)
    if (a.id === 'censor:hush') return R.g.hushT <= 0.5;
    return true;
  },

  forced(R, m, acts) {
    // AT HALF HIS LIFE: the floor blacked out, where there is floor to black out (`blk`: 0 not yet, 1 to come as soon as
    // he stands, 2 made or not to be made)
    const s = m.a1;
    if (!s || s.blk === 2) return -1;
    if (!s.blk) {
      if (m.life > m.maxLife * CENSOR.blackout.at) return -1;
      s.blk = blackoutPlan(R, m).tiles.length ? 1 : 2;
      if (s.blk === 2) return -1;
    }
    return acts.findIndex((x) => x.id === 'censor:blackout');
  },

  start(R, m, a) {
    const g = R.g;
    const act = m.act!;
    if (a.id === 'censor:strike') {
      // (the line he will draw: from his brush's line, the way he faces now, to the first wall)
      act.a = strikeLine(R, m, act.hand).reach;
      g.sfx('swing', 0.3);
    } else if (a.id === 'censor:redact') {
      m.a1 = { ...(m.a1 ?? {}), rp: ((m.a1?.rp ?? 0) + 1) % 2 };
    } else if (a.id === 'censor:blackout') {
      // (worked out where he stands now: he may have walked a step or two to a stand since it was brought)
      m.a1 = { ...(m.a1 ?? {}), blk: 2 };
      const plan = blackoutPlan(R, m);
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
          const bars = redactBars(g.level, Math.floor(h.x) + 0.5, Math.floor(h.y) + 0.5, along);
          const p = R.peril(m, 'act1', h.x, h.y, { a1: 'censor:bars', t: -Rd.warn, hit: 0, dur: Rd.lie, dmg: 0, a: along });
          BARS.set(p, bars);
          LAYING.set(m, p);
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
        } else slam(R, m, a, barsOf(p));
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

  end(_R, m) {
    LAYING.delete(m);
  },

  peril(R, p, dt) {
    const g = R.g;
    const h = g.hero;
    void dt;
    switch (p.a1) {
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
        // (lying wet: whoever walks in it is slowed by it, until it dries)
        const Rd = CENSOR.redact;
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
        if (L.act1) for (const i of tilesOf(p)) L.act1.tiles.push({ i, name: BLACKED_TILE, frame: 0 });
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
      else if (p.a1 === 'censor:line') {
        // (a line still running stops where its head is, harming no more, and dries there)
        p.done = 1;
        p.a = Math.min(p.a, p.b + CENSOR.strike.speed * Math.max(0, p.t));
      } else if (p.a1 === 'censor:hush') {
        p.done = 1;
        p.dur = Math.min(p.dur, p.t + 0.6);
      }
    }
    LAYING.delete(m);
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
