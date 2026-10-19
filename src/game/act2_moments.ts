// ACT 2, THE HUSH: EACH FLOOR'S MOMENT AROUND THE HERO, LAID (floors 11 to 15; behind ACT2, game/act1.ts, off).
//
// His rulebook's Places 8 (docs/gameplay/RULEBOOK.md), his words of 10 Oct 2026: “I’d also like a couple environmental
// things happening around you for immersion unique for each floor.  Something shifts above you and dust comes down, you spook
// a pack of birds and they fly off,  a root shrivels as you walk by.  That sort of stuff”. The art chat made one for each of
// floors 11 to 15, a film each (art/floor11_moments.ts to floor15_moments.ts, and each floor's docs/mockups/act2_*/README.md,
// "Its moment around the hero"): floor 11's his own pick, 18 Oct (“Pigeons burst off a roof (Recommended)”, and to its film
// “Yes, as shown (Recommended)”); floors 12 to 15 gone ahead on his word to the art chat of 18 Oct, 21:24 Pacific (“Hey go
// without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15”). And to the
// planning chat, 19 Oct, 11:01 Pacific: "Get levels 11-15 into the game". WHERE each is laid is the game's (the planning
// chat's helper's), here, once the floor's own dresser has laid the rest (game/act2_dress.ts asks it); HOW it plays is
// render/act1_pieces.ts's, as the first five floors' moments play (render/pieces.ts): once, as he comes near it and sees it,
// by the game's clock; what was there before until then, what is left after once it is over.
//
// WHERE (the art's word for each; the rest the game's):
//   11, THE PIGEONS BURST OFF A ROOF: on a roof whose ridge runs along x (the art: "lay it on a roof whose ridge runs along x
//     (`gateWardRidge`)": its roofs, art/gateward.ts, held here as `roofRidge`, the game not importing the art), the ridge at
//     least three tiles long (as the art's own page lays it, src/dev/preview_gateward.ts), every bird of the nine on the roof
//     at its full height (the ground paints no roof over walkable floor: so the houses go on up the screen behind it, and no
//     house walked into is in it, its roof being open), a street of the main way at the foot of its houses. DRAWN OVER EVERY
//     FIGURE, as the art's own page draws it: the flock swoops out low over the street and over his head.
//   12, THE SURGE: on a straight run of channel two tiles across running along x with walkways either side (the art's word; as
//     the Undercity's own `surgeSites` finds them, game/act2/undercity.ts, but shorter), in a tunnel of the main way, nothing
//     solid on its walkways and no trap of the floor's where the film plays, the film shown over that run alone.
//   13, THE WHIRL OF PAGES: on open corn in a field of the main way (the art: "LAY IT on open corn: its anchor any point of the
//     field"), clear of the river, the race, the cart tracks and the mill yard's setts, nothing standing where the whirl stands
//     up and wanders and the sheets come down: `millraceMomentAt`.
//   14, THE SCREEN FALLS: in a ward of the main way, on open boards, its foot's middle on the line between two tiles, the floor
//     it comes down on clear (the art: "LAY IT in a ward, on open floor ... it falls toward +y ... so leave that clear; where it
//     stands, no screen piece"). The House of Quiet's dresser lays one for it (game/act2/housequiet.ts HouseDress.moment); where
//     that one is off the main way, or none was laid, one is found here the same way.
//   15, THE CHANDELIER FALLS: on the open floor of a great hall (the art: "on open floor (a hall's marble or the Reading Room's
//     carpet), away from walls ... leave about 2.2 tiles clear round the anchor. Where it hangs, no chandelier piece"). The
//     Library's dresser lays one (game/act2/library.ts LibraryDress.moment); where it laid none, one is found here: a room of the
//     main way with that much clear, no chandelier hung near it.
//   And every one (the planning chat's brief): where he will see it, ON OR BESIDE THE MAIN WAY (MOMENT_NEAR_WAY of its middle
//   line), PAST THE START (MOMENT_FROM_START, as the first floors' moments keep from where he comes in: game/first5.ts), NOT IN
//   THE BOSS'S GROUND, NOT ON A BELL (MOMENT_FROM_BELL from every one of the Bells: their event is theirs).
// None is solid: each plays as he comes within MOMENT_NEAR of it (render/act1_pieces.ts), before he can reach it, and what is
// left is flat on the floor (the screen, the wreck, the sheets), on a roof, or in the water.

import { RNG } from '../engine/rng';
import { act2Floor } from './act1';
import type { Act1Dress } from './act1_dress';
import { blobDist, segDist } from './act1_layout';
import type { Land } from './act1_layout';
import { HOUSE_ZONE } from './act2/housequiet';
import type { HouseDress } from './act2/housequiet';
import { LB, LB_PIECES } from './act2/library';
import type { LibraryDress } from './act2/library';
import { ZONE as UC_ZONE } from './act2/undercity';
import type { Level, PropInst } from './state';
import { T_FLOOR } from './types';

/**
 * ONE OF THE HUSH'S MOMENTS AROUND THE HERO, where its floor's dresser laid it (Act1Dress.moments): its film's key (art/films.ts,
 * `moment:<floor>:0`, made by the painter, render/painter.ts); the film's anchor (world), as the art says where it is; the tile
 * whose sight, with him near, sets it going (the anchor's own; for a roof or the water, the floor before it, which he sees);
 * and `over`: drawn over every figure (the pigeons), where every other stands in depth at its anchor among them.
 */
export interface HushMoment {
  key: string;
  x: number;
  y: number;
  seen: number;
  over?: true;
  /** (the surge) the world x its channel's straight run begins and ends at: its film is shown over that run alone. */
  span?: [number, number];
}

/** A moment is at least this far from where he comes in (tiles): the first five floors' own (game/first5.ts MOMENTS_APART). */
export const MOMENT_FROM_START = 14;
/** And at least this far from every bell, the Muffled Bell too (tiles): clear of the eight round each (the Bells' contract) and of the event that plays there. */
export const MOMENT_FROM_BELL = 4.5;
/** And its anchor no further than this from the main way's middle line (Land.way, tiles): he comes by it. */
export const MOMENT_NEAR_WAY = 9;

/** The film's key for floor `n`'s moment (art/films.ts momentKeys: one a floor, the first). */
export const hushMomentKey = (n: number): string => `moment:${n}:0`;

/**
 * LAY FLOOR `depth`'s MOMENT (11 to 15), once its own dresser has laid it (`D`, its dressing), by dice of its own (`seed`):
 * changes nothing of the floor. Empty where none has room (the tests hold every floor to having one), or off the Hush.
 */
export function layHushMoments(L: Level, depth: number, seed: number, D: Act1Dress): HushMoment[] {
  const land = L.land;
  if (!act2Floor(depth) || !land) return [];
  const rng = new RNG((Math.imul(seed, 2654435761) ^ 0x6d0e17a5) >>> 0);
  const at =
    depth === 11 ? gateWardMomentAt(L, land, rng)
    : depth === 12 ? undercityMomentAt(L, land, rng)
    : depth === 13 ? millraceMomentAt(L, land, rng)
    : depth === 14 ? houseMomentAt(L, land, rng, D as HouseDress)
    : libraryMomentAt(L, land, rng, D as LibraryDress);
  return at ? [{ key: hushMomentKey(depth), ...at }] : [];
}

// ---------------------------------------------------------------------------------------------------
// WHAT EVERY FLOOR'S MOMENT KEEPS TO

/** How far (x, y) is from the main way's middle line (tiles). */
export function wayDist(land: Land, x: number, y: number): number {
  const w = land.way;
  if (w.length === 1) return Math.hypot(x - w[0][0], y - w[0][1]);
  let d = Infinity;
  for (let i = 0; i + 1 < w.length; i++) d = Math.min(d, segDist(x, y, w[i][0], w[i][1], w[i + 1][0], w[i + 1][1]));
  return d;
}

/** Is (x, y) in the boss's ground: his room (Floor.rooms, kind 'boss'), or his area's shape (Land.areas, role 'boss')? */
export function inBossGround(L: Level, x: number, y: number): boolean {
  const r = L.floor.rooms.find((q) => q.kind === 'boss');
  if (r && x >= r.x - 1 && y >= r.y - 1 && x < r.x + r.w + 1 && y < r.y + r.h + 1) return true;
  return !!L.land?.areas.some((a) => a.role === 'boss' && blobDist(a.blob, x, y) < 1.1);
}

/** How far (x, y) is from the nearest of the floor's bells (the Muffled Bell too), or Infinity where it has none. */
export function bellDist(land: Land, x: number, y: number): number {
  const B = land.bells;
  if (!B) return Infinity;
  return Math.min(...[B.muffled, ...B.bells].map((b) => Math.hypot(b.x - x, b.y - y)));
}

/** Whether a moment may be laid with its anchor at (x, y): past the start, near the way, out of the boss's ground, away from the bells. */
function allowed(L: Level, land: Land, x: number, y: number): boolean {
  const f = L.floor;
  return Math.hypot(x - f.start.x, y - f.start.y) >= MOMENT_FROM_START && wayDist(land, x, y) <= MOMENT_NEAR_WAY && !inBossGround(L, x, y) && bellDist(land, x, y) >= MOMENT_FROM_BELL;
}

/** The floor's solid things by the tile they are on, once a level (for `crowded`, asked of many places). */
const SOLIDS = new WeakMap<Level, Map<number, PropInst[]>>();
function solidsOf(L: Level): Map<number, PropInst[]> {
  let m = SOLIDS.get(L);
  if (!m) {
    m = new Map();
    for (const p of L.props) {
      if (!p.solid) continue;
      const i = p.ty * L.floor.w + p.tx;
      const list = m.get(i) ?? [];
      list.push(p);
      m.set(i, list);
    }
    SOLIDS.set(L, m);
  }
  return m;
}

/** Anything solid standing within `r` of (x, y) (its world point, within a tile of its own tile), or a trap of the floor's (its patch) within `r` of it? */
function crowded(L: Level, x: number, y: number, r: number): boolean {
  const W = L.floor.w;
  const by = solidsOf(L);
  for (let ty = Math.floor(y - r) - 1; ty <= Math.floor(y + r) + 1; ty++) for (let tx = Math.floor(x - r) - 1; tx <= Math.floor(x + r) + 1; tx++) {
    if (tx < 0 || ty < 0 || tx >= W) continue;
    for (const p of by.get(ty * W + tx) ?? []) if (Math.hypot(p.x - x, p.y - y) < r) return true;
  }
  for (const z of L.floor.hazards ?? []) {
    const cx = Math.max(z.x, Math.min(z.x + z.w, x));
    const cy = Math.max(z.y, Math.min(z.y + z.h, y));
    if (Math.hypot(cx - x, cy - y) < r) return true;
  }
  return false;
}

/** The tiles something of the floor's stands or lies on (solid or not). */
function takenOf(L: Level): Uint8Array {
  const on = new Uint8Array(L.floor.w * L.floor.h);
  for (const p of L.props) on[p.ty * L.floor.w + p.tx] = 1;
  return on;
}

/** Every tile whose middle is within `r` of (x, y) whole floor, walked on, and nothing standing on it (solid or not: `on`, takenOf)? */
function openRound(L: Level, x: number, y: number, r: number, on: Uint8Array): boolean {
  const f = L.floor;
  const W = f.w;
  for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) {
    if (Math.hypot(tx + 0.5 - x, ty + 0.5 - y) > r) continue;
    if (tx < 0 || ty < 0 || tx >= W || ty >= f.h) return false;
    const i = ty * W + tx;
    if (f.tiles[i] !== T_FLOOR || (f.cut && f.cut[i] !== 0) || L.walk[i] !== 1 || on[i]) return false;
  }
  return true;
}

/** One of the places found, by the floor's dice, the nearer the main way's middle line the likelier (the nearest third of them). */
function pickNear<T extends { x: number; y: number }>(rng: RNG, land: Land, list: T[]): T | null {
  if (!list.length) return null;
  const sorted = [...list].sort((a, b) => wayDist(land, a.x, a.y) - wayDist(land, b.x, b.y));
  return rng.pick(sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 3))));
}

// ---------------------------------------------------------------------------------------------------
// 11, THE GATE WARD: THE PIGEONS ON A ROOF

/** The art's hash (art/kit.ts `hash`), for the roofs' plots: the same numbers (tests/act2_moments.test.ts holds them to it). */
function hash(x: number, y: number, k = 0): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * WHERE A ROOF'S RIDGE RUNS on the Gate Ward's houses, at world (x, y): the art's own (art/gateward.ts `gateWardRidge`: rows 2.5
 * tiles deep along y, plots 2 to 4 tiles long along x, each its ridge along x or along y), held here number for number (the
 * game does not import the art; tests/act2_moments.test.ts holds the two the same).
 */
export function roofRidge(x: number, y: number): { along: 'x' | 'y'; at: number; from: number; to: number } {
  const RY = 2.5;
  const RG = 0.42;
  const j = Math.floor(y / RY);
  const len = 2 + Math.floor(hash(j, 0, 1901) * 3);
  const off = hash(j, 1, 1901) * len;
  const i = Math.floor((x + off) / len);
  const h0 = hash(i, j, 1902);
  const ridgeY = h0 > 0.78 || (h0 > 0.4 && h0 < 0.48);
  return ridgeY ? { along: 'y', at: (i + RG) * len - off, from: j * RY, to: (j + 1) * RY } : { along: 'x', at: (j + RG) * RY, from: i * len - off, to: (i + 1) * len - off };
}

/**
 * THE PIGEONS' ROOF (the art, art/floor11_moments.ts): the picture's anchor the point of the floor under the middle of the
 * ridge, the nine birds along it 60 world units either side (KT 40 to a tile: a tile and a half), standing GW_RISE + 2 picture
 * pixels up (art/gateward.ts GW_RISE 150; two picture pixels to a game pixel). What of the ground each bird's picture lies over
 * (its feet to the top of its head, and as wide as a bird) must be houses, so that the roof under it is painted whole.
 */
const PIGEONS = { half: 1.5, rise: 152, tall: 34, wide: 14, ridge: 3 } as const;
/**
 * And the street at the foot of its houses no further than this in front of its plot (tiles), whence he sees it: so near that,
 * walking along it, the roof is on his screen (the roofs at the very top of it: render/act1_pieces.ts MOMENT_UP) while he is
 * still near enough for it to play.
 */
const PIGEONS_STREET = 1.5;

function gateWardMomentAt(L: Level, land: Land, rng: RNG): Omit<HushMoment, 'key'> | null {
  const f = L.floor;
  const W = f.w;
  const H = f.h;
  const floorAt = (tx: number, ty: number): boolean => tx >= 0 && ty >= 0 && tx < W && ty < H && f.tiles[ty * W + tx] === T_FLOOR;
  // (the houses walked into, a tile each, once)
  const inside = new Uint8Array(W * H);
  for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) if (walkedInto(land, tx, ty)) inside[ty * W + tx] = 1;
  const houseAt = (tx: number, ty: number): boolean => tx >= 0 && ty >= 0 && tx < W && ty < H && !floorAt(tx, ty) && !inside[ty * W + tx];
  // (the ground's picture pixels: half a tile's diamond 32 across and 16 down, art/terrain.ts pictureOf and worldOf)
  const toWorld = (px: number, py: number): [number, number] => {
    const a = (px + 0.5) / 32;
    const b = (py + 0.5) / 16;
    return [(a + b) / 2, (b - a) / 2];
  };
  const roofWhole = (bx: number, by: number): boolean => {
    const px = (bx - by) * 32;
    const py = (bx + by) * 16 - PIGEONS.rise;
    for (let yy = py + 4; yy >= py - PIGEONS.tall; yy -= 3) for (let xx = px - PIGEONS.wide; xx <= px + PIGEONS.wide; xx += 3) {
      const [x, y] = toWorld(xx, yy);
      if (!houseAt(Math.floor(x), Math.floor(y))) return false;
    }
    return houseAt(Math.floor(bx), Math.floor(by));
  };
  const seenPlots = new Set<string>();
  const found: Omit<HushMoment, 'key'>[] = [];
  for (let j = 0; j * 2.5 < H; j++) {
    for (let x = 0; x < W; x += 0.5) {
      const r = roofRidge(x, j * 2.5 + 1);
      if (r.along !== 'x' || r.to - r.from < PIGEONS.ridge) continue;
      const key = `${j}:${r.from}`;
      if (seenPlots.has(key)) continue;
      seenPlots.add(key);
      const mx = (r.from + r.to) / 2;
      const my = r.at;
      if (!allowed(L, land, mx, my)) continue;
      // (the plot itself all houses, and every bird on the roof whole)
      let ok = true;
      for (let ty = Math.floor(j * 2.5); ty < Math.ceil((j + 1) * 2.5) && ok; ty++) for (let tx = Math.floor(r.from); tx < Math.ceil(r.to) && ok; tx++) ok = houseAt(tx, ty);
      for (let k = -2; k <= 2 && ok; k++) ok = roofWhole(mx + (k * PIGEONS.half) / 2, my);
      if (!ok) continue;
      // (the street at the foot of its houses, before the plot's middle: where he sees it from)
      let seen = -1;
      for (let ty = Math.ceil((j + 1) * 2.5); ty <= (j + 1) * 2.5 + PIGEONS_STREET && seen < 0; ty++) {
        const tx = Math.floor(mx);
        if (floorAt(tx, ty) && !inside[ty * W + tx] && L.walk[ty * W + tx] === 1) seen = ty * W + tx;
        else if (floorAt(tx, ty)) break;
      }
      if (seen < 0) continue;
      const sx = (seen % W) + 0.5;
      const sy = Math.floor(seen / W) + 0.5;
      if (!allowed(L, land, sx, sy)) continue;
      found.push({ x: mx, y: my, seen, over: true });
    }
  }
  return pickNear(rng, land, found);
}

/** Is tile (tx, ty) part of a house walked into (its room, its front or its doorway: its roof is open, and faded)? */
function walkedInto(land: Land, tx: number, ty: number): boolean {
  for (const h of land.houses ?? []) {
    const [x0, y0, x1, y1] = h.room;
    const F = h.front;
    if (F.along === 'x' ? tx >= x0 - 1 && tx <= x1 && ty >= y0 - 1 && ty <= F.at : ty >= y0 - 1 && ty <= y1 && tx >= x0 - 1 && tx <= F.at) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------------------------------
// 12, THE UNDERCITY: THE SURGE

/**
 * THE SURGE'S CHANNEL (the art, art/floor12_moments.ts and its README: "LAY IT on a channel two tiles across that runs along x,
 * its water `UC_SINK` below the walkways: its anchor is the point on the middle of the channel at the walkways' height, the
 * culvert in its far wall (toward -y) a tile upstream (-x) of it; the wave runs off toward +x and dies away about six tiles past
 * the anchor"). The Undercity's own `surgeSites` (game/act2/undercity.ts) asks for ten tiles of such a channel (two above the
 * anchor, seven below), and its floors have few (over seeds 1 to 10: none on two, one or two on the rest), most with a sluice
 * gate across the far walkway by the culvert (the floor lays one at nearly every tunnel's mouth). So here a straight run of it
 * (its walkways either side, the floor's own walkways, no crossing over it), as long as the first of these that some run of the
 * floor's has room for (SURGE: `up` tiles of it above the anchor, the culvert's and one more; `down` below it; no sluice gate
 * within `gate` tiles of the culvert along the channel, nothing solid and none of the floor's traps within `clear`); and the film
 * shown only over the run (HushMoment.span: render/act1_pieces.ts cuts it off at the run's two ends, a chamber's edge or a
 * crossing), so that a wave on a shorter run runs out of sight where the channel ends.
 */
const SURGE: readonly { up: number; down: number; gate: number; clear: number }[] = [
  { up: 2, down: 6, gate: 2, clear: 2 },
  { up: 2, down: 5, gate: 1, clear: 2 },
  { up: 1, down: 5, gate: 0, clear: 1 },
];
/** The Undercity's sluice gate (game/act2/undercity.ts), across a walkway: none on the culvert. */
const SLUICE = 'a sluice gate';
/** The Undercity's walkways' zone (game/act2/undercity.ts ZONE.Walk). */
const UC_WALK = UC_ZONE.Walk;

function undercityMomentAt(L: Level, land: Land, rng: RNG): Omit<HushMoment, 'key'> | null {
  const f = L.floor;
  const W = f.w;
  const H = f.h;
  const water = land.water;
  if (!water) return null;
  const wet = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && water[y * W + x] === 1;
  const dry = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && f.tiles[y * W + x] === T_FLOOR && (land.zones?.[y * W + x] ?? 0) === UC_WALK;
  const channel = (x: number, y: number): boolean => wet(x, y) && wet(x, y + 1) && dry(x, y - 1) && dry(x, y + 2);
  // (every straight run: its first tile, the tile past its last, its upper row of water)
  const runs: [number, number, number][] = [];
  for (let y = 1; y < H - 2; y++) {
    for (let x = 0; x < W; ) {
      if (!channel(x, y)) {
        x++;
        continue;
      }
      let e = x;
      while (e < W && channel(e, y)) e++;
      runs.push([x, e, y]);
      x = e;
    }
  }
  for (const S of SURGE) {
    const found: Omit<HushMoment, 'key'>[] = [];
    for (const [s0, e, y] of runs) {
      // (the anchor on the middle of the channel, between its two rows; the culvert a tile above it; the near walkway the row below)
      for (let ax = s0 + S.up; ax <= e - S.down; ax++) {
        const ay = y + 1;
        const cx = ax - 1;
        if (!allowed(L, land, ax, ay)) continue;
        const by = (tx: number, ty: number, r: number): boolean => Math.abs(tx - cx) <= r && ty >= y - 2 && ty <= y + 3;
        if (L.props.some((p) => (p.name === SLUICE && by(p.tx, p.ty, S.gate)) || (p.solid && by(p.tx, p.ty, S.clear)))) continue;
        if ((f.hazards ?? []).some((z) => z.x <= cx + S.clear && z.x + z.w > cx - S.clear && z.y <= y + 3 && z.y + z.h > y - 2)) continue;
        const seen = (y + 2) * W + ax;
        if (L.walk[seen] !== 1) continue;
        found.push({ x: ax, y: ay, seen, span: [s0, e] });
      }
    }
    const got = pickNear(rng, land, found);
    if (got) return got;
  }
  return null;
}

// ---------------------------------------------------------------------------------------------------
// 13, THE MILLRACE: THE WHIRL OF PAGES

/**
 * THE WHIRL'S CORN (the art, art/floor13_moments.ts): the whirl stands up 1.7 tiles toward -x and 0.9 toward -y of the anchor
 * and wanders off toward +x and +y (1.1 and 0.44 world units a frame, KT 40 to a tile, for some 64 frames: about 1.8 and 0.7
 * tiles); its six sheets lie about it and come down within a few tiles. So: corn all round the anchor out to `open` tiles (whole
 * floor, nothing on it), nothing solid within `clear`, the river and the race `water` tiles off, the cart tracks and the mill
 * yard `track` tiles off (their middles), in a field of the main way.
 */
const WHIRL = { open: 2.6, clear: 3.2, water: 3, track: 3 } as const;

/**
 * Where floor 13's moment is laid: open corn in a field of the main way (Land.areas, role 'path'), clear of what the Millrace's
 * map-maker lays (Land.river, race, tracks, yards). Kept to one function, for the Millrace's map.
 */
export function millraceMomentAt(L: Level, land: Land, rng: RNG): Omit<HushMoment, 'key'> | null {
  const f = L.floor;
  const W = f.w;
  const line = (pts: readonly [number, number][] | undefined, x: number, y: number): number => {
    if (!pts || pts.length < 2) return Infinity;
    let d = Infinity;
    for (let i = 0; i + 1 < pts.length; i++) d = Math.min(d, segDist(x, y, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]));
    return d;
  };
  const fields = land.areas.filter((a) => a.role === 'path');
  const on = takenOf(L);
  const found: Omit<HushMoment, 'key'>[] = [];
  for (const a of fields) {
    for (let ty = Math.floor(a.blob.y - a.blob.ry - 1); ty <= a.blob.y + a.blob.ry + 1; ty++) for (let tx = Math.floor(a.blob.x - a.blob.rx - 1); tx <= a.blob.x + a.blob.rx + 1; tx++) {
      const x = tx + 0.5;
      const y = ty + 0.5;
      if (blobDist(a.blob, x, y) > 0.7) continue;
      if ((land.yards ?? []).some(([x0, y0, x1, y1]) => x > x0 - WHIRL.track && x < x1 + WHIRL.track && y > y0 - WHIRL.track && y < y1 + WHIRL.track)) continue;
      if (!openRound(L, x, y, WHIRL.open, on) || crowded(L, x, y, WHIRL.clear)) continue;
      if (!allowed(L, land, x, y)) continue;
      if (line(land.river, x, y) < WHIRL.water || line(land.race, x, y) < WHIRL.water) continue;
      if ((land.tracks ?? []).some((t) => line(t, x, y) < WHIRL.track)) continue;
      if ((land.bridges ?? []).some((b) => b.tiles.some((i) => Math.hypot((i % W) + 0.5 - x, Math.floor(i / W) + 0.5 - y) < WHIRL.water))) continue;
      found.push({ x, y, seen: ty * W + tx });
    }
  }
  return pickNear(rng, land, found);
}

// ---------------------------------------------------------------------------------------------------
// 14, THE HOUSE OF QUIET: THE SCREEN FALLS

/**
 * THE SCREEN'S BOARDS (the art, art/floor14_moments.ts): its foot along x over two tiles (its anchor the middle of its foot, on
 * the line between them), 1.8 tiles long; it falls toward +y, its top coming down about 1.6 tiles out. So the two tiles it
 * stands on and the two rows before them clear (as the dresser keeps its own, game/act2/housequiet.ts), and a tile more round
 * them (it is drawn out to 2.75 tiles along x: art "what it draws stays within 220 of the anchor"), nothing solid nearer than
 * `clear` to where it lies.
 */
const SCREEN = { clear: 1.6 } as const;

function houseMomentAt(L: Level, land: Land, rng: RNG, D: HouseDress): Omit<HushMoment, 'key'> | null {
  const f = L.floor;
  const W = f.w;
  const zones = land.zones;
  const roomOf = (x: number, y: number) => f.rooms.find((r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h);
  const mainWard = (x: number, y: number): boolean => {
    const r = roomOf(x, y);
    return !!r && r.path >= 0 && r.kind !== 'boss' && !!zones && zones[Math.floor(y) * W + Math.floor(x)] === HOUSE_ZONE.Ward;
  };
  const fits = (x: number, y: number): boolean => {
    // (x the line between its two tiles; y the middle of their row)
    const ty = Math.floor(y);
    for (let b = ty - 1; b <= ty + 2; b++) for (let a = x - 2; a <= x + 1; a++) {
      if (a < 0 || b < 0 || a >= W || b >= f.h) return false;
      const i = b * W + a;
      if (f.tiles[i] !== T_FLOOR || L.walk[i] !== 1 || L.props.some((p) => p.tx === a && p.ty === b)) return false;
      if ((f.hazards ?? []).some((z) => a >= z.x && a < z.x + z.w && b >= z.y && b < z.y + z.h)) return false;
    }
    return !crowded(L, x, y + 0.8, SCREEN.clear);
  };
  // (the dresser's own, where it is on the main way)
  const own = D.moment;
  if (own && mainWard(own.x - 0.5, own.y) && allowed(L, land, own.x, own.y) && fits(own.x, own.y)) return { x: own.x, y: own.y, seen: Math.floor(own.y) * W + Math.floor(own.x) };
  const found: Omit<HushMoment, 'key'>[] = [];
  for (const r of f.rooms) {
    if (r.path < 0 || r.kind === 'boss') continue;
    for (let ty = r.y + 1; ty < r.y + r.h - 3; ty++) for (let tx = r.x + 2; tx < r.x + r.w - 1; tx++) {
      const x = tx;
      const y = ty + 0.5;
      if (!mainWard(x - 0.5, y) || !allowed(L, land, x, y) || !fits(x, y)) continue;
      found.push({ x, y, seen: ty * W + tx });
    }
  }
  return pickNear(rng, land, found);
}

// ---------------------------------------------------------------------------------------------------
// 15, THE GREAT LIBRARY: THE CHANDELIER FALLS

/** THE CHANDELIER'S FLOOR (the art, art/floor15_moments.ts): "leave about 2.2 tiles clear round the anchor"; no chandelier hung within `hung` of it. */
const CHANDELIER = { clear: 2.2, hung: 3 } as const;

function libraryMomentAt(L: Level, land: Land, rng: RNG, D: LibraryDress): Omit<HushMoment, 'key'> | null {
  const f = L.floor;
  const W = f.w;
  const zones = land.zones;
  const roomOf = (x: number, y: number) => f.rooms.find((r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h);
  const hung = (x: number, y: number): boolean => L.props.some((p) => p.kind === 'piece' && p.name === LB_PIECES.chandelier && Math.hypot(p.x - x, p.y - y) < CHANDELIER.hung);
  const on = takenOf(L);
  const fits = (x: number, y: number): boolean => openRound(L, x, y, CHANDELIER.clear, on) && !crowded(L, x, y, CHANDELIER.clear) && !hung(x, y);
  // (the dresser's own, in a great hall, where it is one of the main way's)
  const own = D.moment;
  const ownRoom = own ? roomOf(own.x, own.y) : undefined;
  if (own && ownRoom && ownRoom.path >= 0 && ownRoom.kind !== 'boss' && allowed(L, land, own.x, own.y) && fits(own.x, own.y)) return { x: own.x, y: own.y, seen: Math.floor(own.y) * W + Math.floor(own.x) };
  // (else: a hall of the main way, then any room of it but the stacks' aisles)
  for (const want of [[LB.Hall], [LB.Hall, LB.Scriptorium, LB.Reading]] as number[][]) {
    const found: Omit<HushMoment, 'key'>[] = [];
    for (let ty = 1; ty < f.h - 1; ty++) for (let tx = 1; tx < W - 1; tx++) {
      const x = tx + 0.5;
      const y = ty + 0.5;
      const r = roomOf(x, y);
      if (!r || r.path < 0 || r.kind === 'boss' || !zones || !want.includes(zones[ty * W + tx])) continue;
      if (!allowed(L, land, x, y) || !fits(x, y)) continue;
      found.push({ x, y, seen: ty * W + tx });
    }
    const got = pickNear(rng, land, found);
    if (got) return got;
  }
  return null;
}
