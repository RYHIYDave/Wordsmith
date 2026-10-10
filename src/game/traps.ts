// THE TRAPS: what the dungeon itself lays for the hero. The spike floor, the dart wall, and the
// sealed word door.
//
// The owner, 4 Oct 2026, 20:23: "And let's add some puzzles and traps in the dungeons when the
// dungeons get overhauled". A list of six went to him with Version 14.1; he picked none, and was
// told that the first to be built would then be the spike floor, the dart wall and the word door.
// His gameplay rulebook (approved 8 Oct 2026, 10:33: `docs/gameplay/RULEBOOK.md`) has "Traps and
// puzzles: the spike floor, the dart wall, and the word door, which opens only to an attack
// carrying its word", next on the list; and his order of the same morning: the traps, then Normal
// mode. (In the code these are HAZARDS and the SEALED DOOR, since the ranger's own Trap has the
// name already; on the screen, "spikes", "darts", "a sealed door".)
//
// PICTURES FIRST, THEN HIS YES. The hall laid by hand for them (`#hall=traps`, game/level.ts,
// `makeTrapHall`) shows every one. Pictures went to him at 11:27 on 8 Oct 2026 (traps_spikes.gif,
// traps_pack.gif, traps_darts.gif, traps_door.gif, traps_stills.png) with "Put the traps into the
// dungeons, as in the pictures?"; HIS ANSWER, 11:36: "Yes, as they are (Recommended)". SO THE
// MAP-MAKER LAYS THEM (`TRAPS.on`), FROM THE SECOND DUNGEON ON (`TRAPS_FROM`: the first is a new
// player's lesson, and is laid as it always was): one or two spike floors, one or two dart walls,
// and one treasure vault sealed with a word (`sealVault`, `layHazards`, below; game/dungeon.ts
// calls them, with dice of their own, so a dungeon's rooms, packs and props are what they were).
//
//   THE SPIKE FLOOR. A patch of floor whose spikes come up on a beat: down, then a moment's
//   warning (the holes glint), then up. Up, they hurt whatever walks on the patch, the hero and
//   the monsters alike (a share of each one's life, so a pack can be led over them), once each
//   time they rise. Bats fly over them. The holes are always to be seen.
//   THE DART WALL. A plate in a corridor's floor and a slot in the wall at the corridor's end. The
//   hero steps on the plate (it clicks): three darts leave the slot one after another, all at the
//   place where the hero stood as it clicked, and hurt what they meet, hero or monster. So the
//   click is the warning: move, and they go by; a roll or a leap gets past them, as it gets past
//   an arrow. A monster on the plate does not set it off. It is ready again a few seconds later.
//   THE SEALED DOOR (a door kind, 'worddoor': game/doors.ts). In the way in of a small room, a
//   door with a rune of a word on it, in that word's own colour. It opens to nobody who comes near:
//   only to a hit from an attack that carries its word ("FLAME on the door: hit it with a flame
//   attack"); then it swings open as a door does, and stays open. Until then nothing passes it,
//   nor a shot, nor sight. The first time it is seen from near, a line says what it wants.

import type { RNG } from '../engine/rng';
import { doorTiles } from './doors';
import { T_FLOOR, T_WALL, WORD_IDS } from './types';
import type { Floor, HazardSpot, Room } from './types';

/**
 * Whether the map-maker lays traps in a dungeon. ON since his yes (8 Oct 2026, 11:36: see the head
 * of this file). The hall laid by hand for them shows them whatever this says; the tests that ask
 * about something else lay their dungeons without them, and put it back.
 */
export const TRAPS = { on: true };
/** The first dungeon with any trap (dungeon 1 is a new player's lesson). */
export const TRAPS_FROM = 2;

/**
 * THE SPIKE FLOOR'S BEAT, in seconds: down, the warning, up; how long the spikes take to come up
 * (they snap up) and to go down again at the end of `up`; and what one rise takes: this share of
 * the life of whatever is on the patch (the hero's before armour; a monster's own).
 */
export const SPIKE = { down: 1.6, warn: 0.3, up: 0.6, rise: 0.06, sink: 0.15, share: 1 / 6 };
/** One whole beat. */
export const SPIKE_BEAT = SPIKE.down + SPIKE.warn + SPIKE.up;

/**
 * THE DART WALL: how many darts leave the slot, the time between them (and before the first: the
 * plate's click), how fast they fly (an archer's arrow flies at 10), the share of life one takes
 * (as the spikes'), the seconds before the plate is ready again, how big a dart is, and how far it
 * flies.
 */
export const DART = { count: 3, gap: 0.2, first: 0.25, speed: 13, share: 0.12, rearm: 3, r: 0.14, reach: 18 };

export type SpikeAt = 'down' | 'warn' | 'up';

/** Where a spike floor is in its beat at time `t` (seconds since the level began), and how far through that part of it (0 to 1). */
export function spikeAt(s: HazardSpot, t: number): { at: SpikeAt; k: number } {
  let u = (t + (s.phase ?? 0)) % SPIKE_BEAT;
  if (u < 0) u += SPIKE_BEAT;
  if (u < SPIKE.down) return { at: 'down', k: u / SPIKE.down };
  u -= SPIKE.down;
  if (u < SPIKE.warn) return { at: 'warn', k: u / SPIKE.warn };
  u -= SPIKE.warn;
  return { at: 'up', k: u / SPIKE.up };
}

/** How far up a spike floor's spikes stand at time `t`: 0 down, 1 all the way up (for the picture: they snap up, and sink at the end). */
export function spikeHeight(s: HazardSpot, t: number): number {
  const { at, k } = spikeAt(s, t);
  if (at !== 'up') return 0;
  const u = k * SPIKE.up;
  if (u < SPIKE.rise) return u / SPIKE.rise;
  if (u > SPIKE.up - SPIKE.sink) return Math.max(0, (SPIKE.up - u) / SPIKE.sink);
  return 1;
}

/** Is this place on the hazard's tiles (a spike floor's patch; a dart wall's plate)? */
export function onHazard(s: HazardSpot, x: number, y: number): boolean {
  return x >= s.x && y >= s.y && x < s.x + s.w && y < s.y + s.h;
}

/** Where a dart wall's darts leave its slot: just out from the face of the slot's wall, in the middle of it. */
export function slotMouth(s: HazardSpot): { x: number; y: number } {
  const q = s.slot;
  if (!q) return { x: s.x + 0.5, y: s.y + 0.5 };
  return { x: q.x + 0.5 + q.dx * 0.62, y: q.y + 0.5 + q.dy * 0.62 };
}

/** A hazard as the game keeps it. */
export interface HazardInst {
  spot: HazardSpot;
  /** (spikes) Who has been hurt by this rise: monsters' ids, and -1 for the hero. */
  hit: number[];
  /** (spikes) Whether they were up in the last step. */
  wasUp: boolean;
  /** (darts) Seconds until the plate is ready again (0: ready). */
  ready: number;
  /** (darts) Darts still to leave the slot, and the seconds until the next does. */
  left: number;
  next: number;
  /** (darts) Seconds the plate still shows pressed down. */
  pressed: number;
  /** (darts) Where the hero stood as the plate clicked: where every dart of that click flies. */
  aimX: number;
  aimY: number;
}

/** The hazards of a level as a run begins: every plate ready. */
export function makeHazards(f: Floor): HazardInst[] {
  return (f.hazards ?? []).map((spot) => ({ spot, hit: [], wasUp: false, ready: 0, left: 0, next: 0, pressed: 0, aimX: 0, aimY: 0 }));
}

// =================================================================================================
// THE MAP-MAKER'S PART (game/dungeon.ts calls these, with dice of their own)

/** A treasure vault, if the dungeon has one that is not part of the mix, is SEALED WITH A WORD: before the doors are laid (doors.ts, `layDoors`, stands the sealed door in its way in). */
export function sealVault(f: Floor, rng: RNG): void {
  const vaults = f.rooms.filter((r) => r.kind === 'treasure' && !r.gated && !r.locks && !r.nook && !r.nextDoor);
  if (vaults.length === 0) return;
  const r = rng.pick(vaults);
  r.sealed = rng.pick(WORD_IDS);
}

/** After the doors: a vault that was to be sealed and has no doorway for a door to stand in (a room come into at a corner) is not sealed. */
export function unsealDoorless(f: Floor): void {
  for (const r of f.rooms) if (r.sealed && !(f.doors ?? []).some((d) => d.kind === 'worddoor' && d.room === r.id)) delete r.sealed;
}

/** How far apart two traps keep, in tiles (middle to middle). */
const TRAP_GAP = 5;

/**
 * THE SPIKE FLOORS AND DART WALLS OF A DUNGEON: one or two of each, after its doors.
 *   A SPIKE FLOOR lies ACROSS A CORRIDOR (two tiles long, the corridor's whole width of three, wall
 *   on both sides, so that it cannot be walked round), or IN A ROOM (four by four, three by three
 *   in a small one, well clear of where the room's pack stands).
 *   A DART WALL is in a room: its PLATE one step inside a way out on a side toward the eye, and its
 *   SLOT in the wall straight across the room from it, which faces the eye (so it can be seen), the
 *   floor between them clear.
 * Never in the first room, nor the boss's hall, nor a vault or a lair, nor a lever's nook; never on
 * a doorway or a corridor's tile beside a room; never on a prop, a stair, raised or sunken or cut
 * floor; never within `TRAP_GAP` tiles of another trap.
 */
export function layHazards(f: Floor, rng: RNG): HazardSpot[] {
  const W = f.w;
  const H = f.h;
  const out: HazardSpot[] = [];
  const inRoom = new Int16Array(W * H).fill(-1);
  for (const r of f.rooms) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) inRoom[y * W + x] = r.id;
  const at = (x: number, y: number): number => (x < 0 || y < 0 || x >= W || y >= H ? -1 : y * W + x);
  const tile = (x: number, y: number): number => {
    const i = at(x, y);
    return i < 0 ? -1 : f.tiles[i];
  };
  // (what may not hold a trap: props, every doorway's three tiles, and a corridor's tiles that touch a room)
  const busy = new Uint8Array(W * H);
  for (const p of f.props) busy[p.y * W + p.x] = 1;
  for (const d of f.doors ?? []) for (const i of doorTiles(f, d)) busy[i] = 1;
  for (const q of f.levers ?? []) busy[q.y * W + q.x] = 1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (f.tiles[i] !== T_FLOOR || inRoom[i] >= 0) continue;
      for (let dy = -2; dy <= 2 && !busy[i]; dy++) for (let dx = -2; dx <= 2 && !busy[i]; dx++) if (Math.abs(dx) + Math.abs(dy) <= 2 && at(x + dx, y + dy) >= 0 && inRoom[at(x + dx, y + dy)] >= 0) busy[i] = 1;
    }
  }
  const flat = (x: number, y: number): boolean => {
    const i = at(x, y);
    return i >= 0 && f.tiles[i] === T_FLOOR && !busy[i] && !(f.cut && f.cut[i] !== 0) && !(f.height && f.height[i] !== 0) && !(f.stair && f.stair[i] !== 0);
  };
  // (a tile a dart flies over: floor at the room's own height, no stair, nothing standing on it)
  const level = (x: number, y: number): boolean => {
    const i = at(x, y);
    return i >= 0 && f.tiles[i] === T_FLOOR && !(f.cut && f.cut[i] !== 0) && !(f.height && f.height[i] !== 0) && !(f.stair && f.stair[i] !== 0) && !f.props.some((p) => p.x === x && p.y === y);
  };
  const clearOf = (cx: number, cy: number): boolean => out.every((z) => Math.hypot(z.x + z.w / 2 - cx, z.y + z.h / 2 - cy) >= TRAP_GAP);
  const fit = (r: Room): boolean => r.kind === 'normal' || r.kind === 'elite';
  const roomOk = (r: Room): boolean => fit(r) && r.path !== 0 && !r.nook && !r.sealed && !r.cell;

  // ---- THE SPIKE FLOORS -------------------------------------------------------------------------
  const spikeWant = rng.chance(0.5) ? 2 : 1;
  // (across a corridor: two long, three wide, wall on either side)
  const across: HazardSpot[] = [];
  for (let y = 1; y < H - 3; y++) {
    for (let x = 1; x < W - 3; x++) {
      if (inRoom[y * W + x] >= 0) continue;
      // the corridor runs along x: the patch two along x, three across (y), wall above and below it
      let ok = true;
      for (let k = 0; k < 2 && ok; k++) for (let j = 0; j < 3 && ok; j++) ok = flat(x + k, y + j) && inRoom[at(x + k, y + j)] < 0;
      for (let k = 0; k < 2 && ok; k++) ok = tile(x + k, y - 1) === T_WALL && tile(x + k, y + 3) === T_WALL;
      if (ok) across.push({ kind: 'spikes', x, y, w: 2, h: 3 });
      // the corridor runs along y: the patch three across (x), two along y, wall to either side
      ok = true;
      for (let k = 0; k < 2 && ok; k++) for (let j = 0; j < 3 && ok; j++) ok = flat(x + j, y + k) && inRoom[at(x + j, y + k)] < 0;
      for (let k = 0; k < 2 && ok; k++) ok = tile(x - 1, y + k) === T_WALL && tile(x + 3, y + k) === T_WALL;
      if (ok) across.push({ kind: 'spikes', x, y, w: 3, h: 2 });
    }
  }
  // (in a room: clear of where its pack stands)
  const inside: HazardSpot[] = [];
  for (const r of f.rooms) {
    if (!roomOk(r) || r.w < 7 || r.h < 7) continue;
    const n = r.w >= 9 && r.h >= 9 ? 4 : 3;
    for (let y = r.y + 1; y + n <= r.y + r.h - 1; y++) {
      for (let x = r.x + 1; x + n <= r.x + r.w - 1; x++) {
        let ok = true;
        for (let j = 0; j < n && ok; j++) for (let k = 0; k < n && ok; k++) ok = flat(x + k, y + j);
        if (!ok) continue;
        const cx = x + n / 2;
        const cy = y + n / 2;
        if (f.packs.some((p) => Math.hypot(p.x - cx, p.y - cy) < n / 2 + 3)) continue;
        inside.push({ kind: 'spikes', x, y, w: n, h: n });
      }
    }
  }
  for (let k = 0; k < spikeWant; k++) {
    // (the first across a corridor if any corridor will take one; the second in a room, or else across another)
    const pool = (k === 0 ? across : inside).filter((z) => clearOf(z.x + z.w / 2, z.y + z.h / 2));
    const alt = (k === 0 ? inside : across).filter((z) => clearOf(z.x + z.w / 2, z.y + z.h / 2));
    const from = pool.length > 0 ? pool : alt;
    if (from.length === 0) break;
    const z = rng.pick(from);
    z.phase = Math.round(rng.next() * 25) / 10;
    out.push(z);
  }

  // ---- THE DART WALLS ---------------------------------------------------------------------------
  const dartWant = rng.chance(0.4) ? 2 : 1;
  const walls: HazardSpot[] = [];
  for (const r of f.rooms) {
    if (!roomOk(r)) continue;
    // (each doorway of the room on a side toward the eye: the bottom, y = r.y + r.h, or the right, x = r.x + r.w)
    for (let k = 0; k < (r.w > r.h ? r.w : r.h); k++) {
      // a way out of the room in its bottom wall at column x: floor in the wall's row (a doorway's middle, a door's tile, a corner come in at)
      const bx = r.x + k;
      if (k < r.w && k > 0 && k < r.w - 1 && tile(bx, r.y + r.h) === T_FLOOR) {
        const plateY = r.y + r.h - 1;
        let ok = flat(bx, plateY) && tile(bx, r.y - 1) === T_WALL && tile(bx - 1, r.y - 1) === T_WALL && tile(bx + 1, r.y - 1) === T_WALL && r.h >= 6;
        for (let y = r.y; y < plateY && ok; y++) ok = level(bx, y);
        if (ok) walls.push({ kind: 'darts', x: bx, y: plateY, w: 1, h: 1, slot: { x: bx, y: r.y - 1, dx: 0, dy: 1 } });
      }
      // and in its right wall at row y
      const by = r.y + k;
      if (k < r.h && k > 0 && k < r.h - 1 && tile(r.x + r.w, by) === T_FLOOR) {
        const plateX = r.x + r.w - 1;
        let ok = flat(plateX, by) && tile(r.x - 1, by) === T_WALL && tile(r.x - 1, by - 1) === T_WALL && tile(r.x - 1, by + 1) === T_WALL && r.w >= 6;
        for (let x = r.x; x < plateX && ok; x++) ok = level(x, by);
        if (ok) walls.push({ kind: 'darts', x: plateX, y: by, w: 1, h: 1, slot: { x: r.x - 1, y: by, dx: 1, dy: 0 } });
      }
    }
  }
  for (let k = 0; k < dartWant; k++) {
    const pool = walls.filter((z) => clearOf(z.x + 0.5, z.y + 0.5) && !out.some((o) => o.slot && o.slot.x === z.slot?.x && o.slot.y === z.slot?.y));
    if (pool.length === 0) break;
    out.push(rng.pick(pool));
  }
  return out;
}

