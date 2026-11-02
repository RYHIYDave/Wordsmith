// FLOOR 3'S WAYS: THE DOOR OUT THE BACK OF HIS HALL, and THE FIRE CHANNEL down each cell block (at the foot). THE DOOR: the way down to floor 4 (the art chat's art/prison_exit.ts, behind PRISON_EXIT; his
// words, 1 Nov 2026: “Love it, but let’s not have stairs down from his arena cause if under it is fire, going down to something else
// is gonna be weird”, then “Door out the back (Recommended)”; off until his yes to it in play). With it on, floor 3's hall has no
// stairwell: two tiles of the back wall farthest from his gate are a black iron door, barred and locked while he lives. As he falls
// it opens (its film, EXIT_OPEN_SECS); then walking into its doorway takes the hero down to floor 4 (the curtain, as the stairs').
//
// The door's two tiles stay wall in the floor's plan all the while (so the walls either side of it stand as they did): while it is
// shut nobody walks there; once open the two are walked on, and stepping onto either takes him on (game.ts).

import { EXIT_OPEN_SECS, PRISON_EXIT } from '../art/prison_exit';
import { PRISON } from '../art/prison';
import { doorMiddle } from './doors';
import { SOLID_PROPS, T_FLOOR, T_VOID, T_WALL } from './types';
import type { Floor } from './types';

/** The door as the level keeps it. */
export interface PrisonDoor {
  /** Its wall runs along x (a back wall at the hall's far side up the screen to the right), or along y. */
  alongX: boolean;
  /** The first of its two tiles along the wall: an x if along x, else a y. */
  a: number;
  /** The wall's row: a y if along x, else an x. */
  line: number;
  /** Shut (he lives), opening (its film playing, `t` seconds since he fell), open (walked into). */
  state: 'shut' | 'opening' | 'open';
  t: number;
}

/** How many tiles of the wall it takes. */
export const DOOR_TILES = 2;
/** From his fall until it is open to walk into, in seconds (the art chat's film: art/prison_exit.ts EXIT_OPEN_SECS, 90 frames at 30). */
export const DOOR_OPENING = EXIT_OPEN_SECS;
/** How far back from the wall the passage behind it goes, in tiles (the art chat's picture of it: about 9 back): the dark wanted there. */
const BACK = 9;

/** Is floor `depth` one whose way down is the door (floor 3, PRISON_EXIT on)? */
export function prisonDoorHere(depth: number): boolean {
  return PRISON_EXIT.on && depth === 3;
}

/** The door's two tiles in the wall's row (tile indices). */
export function prisonDoorTiles(f: Floor, d: { alongX: boolean; a: number; line: number }): number[] {
  const out: number[] = [];
  for (let k = 0; k < DOOR_TILES; k++) out.push(d.alongX ? d.line * f.w + d.a + k : (d.a + k) * f.w + d.line);
  return out;
}

/** Where the art chat's pictures of it are anchored: the foot of the wall's face under the door's middle (the joint of its two tiles). */
export function prisonDoorAnchor(d: { alongX: boolean; a: number; line: number }): { x: number; y: number } {
  return d.alongX ? { x: d.a + 1, y: d.line + 1 } : { x: d.line + 1, y: d.a + 1 };
}

/** The middle of its doorway, on the floor before it (where its name is shown once open). */
export function prisonDoorMiddle(d: { alongX: boolean; a: number; line: number }): { x: number; y: number } {
  return d.alongX ? { x: d.a + 1, y: d.line + 0.5 } : { x: d.line + 0.5, y: d.a + 1 };
}

/** Is tile (x, y) on the two rows of the hall's floor before it, or the tiles either side along the wall (nothing is left standing or lying there)? */
export function beforePrisonDoor(d: { alongX: boolean; a: number; line: number }, x: number, y: number): boolean {
  const along = d.alongX ? x : y;
  const out = (d.alongX ? y : x) - d.line;
  return along >= d.a - 1 && along <= d.a + DOOR_TILES && out >= 1 && out <= 2;
}

/**
 * WHERE THE DOOR GOES: a back wall of his hall (the one along x, at its far side up the screen to the right, or the one along y),
 * the one farthest from his gate, so that the passage leads away from the hall; two of its tiles side by side, with wall on either
 * side of them (a fire basket is set in each); beyond them no floor, and the dark (nothing of the level) as far back as the passage
 * goes; before them two rows of the hall's floor whole, with no chest nor lever on them; nearest the middle of its wall. Null where
 * the hall has no place for it (the floor then keeps its stairwell).
 */
export function placePrisonDoor(f: Floor): PrisonDoor | null {
  const r = f.rooms.find((q) => q.kind === 'boss');
  if (!r) return null;
  const tile = (x: number, y: number): number => (x < 0 || y < 0 || x >= f.w || y >= f.h ? T_VOID : f.tiles[y * f.w + x]);
  const plain = (x: number, y: number): boolean => {
    if (x < 0 || y < 0 || x >= f.w || y >= f.h) return false;
    const i = y * f.w + x;
    return f.tiles[i] === T_FLOOR && !(f.cut && f.cut[i] !== 0) && !(f.stair && f.stair[i] !== 0) && !(f.height && f.height[i] !== 0);
  };
  const standing = new Map<number, boolean>();
  for (const p of f.props) if (SOLID_PROPS.includes(p.kind)) standing.set(p.y * f.w + p.x, p.kind === 'chest' || p.kind === 'lever');
  // (his gate: the doorway into his hall)
  const gate = (f.doors ?? []).find((d) => d.kind === 'bossgate' && d.room === r.id) ?? (f.doors ?? []).find((d) => d.kind === 'bossgate');
  const gm = gate ? doorMiddle(gate) : { x: r.x + r.w, y: r.y + r.h };
  const walls = [
    { alongX: true, line: r.y - 1, from: r.x, len: r.w, mid: { x: r.x + r.w / 2, y: r.y } },
    { alongX: false, line: r.x - 1, from: r.y, len: r.h, mid: { x: r.x, y: r.y + r.h / 2 } },
  ];
  const far = walls.map((w) => Math.hypot(w.mid.x - gm.x, w.mid.y - gm.y));
  let best: PrisonDoor | null = null;
  let bestScore = Infinity;
  walls.forEach((w, wi) => {
    // (the wall nearer his gate only where the far one has no place)
    const rank = far[wi] >= far[1 - wi] ? 0 : 1;
    // (k along the wall from its first tile; d out of it: 0 the wall's row, + into the hall, - back beyond it)
    const at = (k: number, d: number): number => (w.alongX ? tile(w.from + k, w.line + d) : tile(w.line + d, w.from + k));
    const xy = (k: number, d: number): [number, number] => (w.alongX ? [w.from + k, w.line + d] : [w.line + d, w.from + k]);
    const mid = (w.len - DOOR_TILES) / 2;
    for (let k = 0; k + DOOR_TILES <= w.len; k++) {
      let ok = true;
      for (let j = k - 1; j <= k + DOOR_TILES && ok; j++) ok = at(j, 0) === T_WALL;
      for (let j = k; j < k + DOOR_TILES && ok; j++) {
        ok = at(j, -1) !== T_FLOOR;
        for (const d of [1, 2]) {
          const [x, y] = xy(j, d);
          if (ok) ok = plain(x, y) && standing.get(y * f.w + x) !== true;
        }
      }
      if (!ok) continue;
      // (what of the level is behind it, where the passage is drawn: floor worst, wall less so)
      let behind = 0;
      for (let d = 1; d <= BACK; d++) for (let j = k - 1; j <= k + DOOR_TILES; j++) {
        const c = at(j, -d);
        if (c === T_FLOOR) behind += 4;
        else if (c !== T_VOID) behind += d === 1 ? 0 : 1;
      }
      let things = 0;
      for (let j = k - 1; j <= k + DOOR_TILES; j++) for (const d of [1, 2]) {
        const [x, y] = xy(j, d);
        if (standing.has(y * f.w + x)) things++;
      }
      const score = rank * 1000 + behind * 40 + things * 30 + Math.abs(k - mid);
      if (score >= bestScore) continue;
      bestScore = score;
      best = { alongX: w.alongX, a: w.from + k, line: w.line, state: 'shut', t: 0 };
    }
  });
  return best;
}

// =================================================================================================
// THE FIRE CHANNEL down the middle of each cell block (the art chat's art/prison.ts, behind PRISON: "How to bring it in", step 4):
// two tiles wide, along the block's length; a few tiles of its grate at its far end, then the open run, burnt low, with a bridge
// over its middle, then two tiles of the glowing grate at its near end. The open run is not walked on (as a pit is: the bridge and
// the grates are); a railing on both its rims.

/** A fire channel as the level keeps it. */
export interface PrisonChannel {
  /** It runs along x (its two tiles across, rows `row` and `row + 1`) or along y (columns `row` and `row + 1`). */
  alongX: boolean;
  /** Its far half's row (the one away from the eye): a y if along x, else an x. */
  row: number;
  /** Along it: from its first tile to one past its last; the open run [open0, open1), the bridge over it at `bridge`. */
  a0: number;
  a1: number;
  open0: number;
  open1: number;
  bridge: number;
}

/** Is floor `depth` the prison, with its fire channels (floor 3, PRISON on)? */
export function prisonChannelsHere(depth: number): boolean {
  return PRISON.on && depth === 3;
}

/** The tile (x, y) of a channel at k along it and j across it (0 the far half, 1 the near). */
export function channelXY(c: PrisonChannel, k: number, j: number): [number, number] {
  return c.alongX ? [k, c.row + j] : [c.row + j, k];
}

/** The open tiles of a channel (not walked on): its open run but the bridge, both halves. */
export function channelOpen(f: Floor, c: PrisonChannel): number[] {
  const out: number[] = [];
  for (let k = c.open0; k < c.open1; k++) {
    if (k === c.bridge) continue;
    for (const j of [0, 1]) {
      const [x, y] = channelXY(c, k, j);
      out.push(y * f.w + x);
    }
  }
  return out;
}

/** Is tile (x, y) on the channel, or `ring` tiles round it? */
export function onChannel(c: PrisonChannel, x: number, y: number, ring = 0): boolean {
  const k = c.alongX ? x : y;
  const j = (c.alongX ? y : x) - c.row;
  return k >= c.a0 - ring && k < c.a1 + ring && j >= -ring && j < 2 + ring;
}

/**
 * WHERE THE CHANNELS GO: one down the middle of each cell block, a tile short of either end of it, on its plain floor; cut short
 * where a chest, a lever, a trap, the way in or where the boss stands is on it or beside it; where what is left is long enough
 * (its grates and an open run of three or more). Takes away whatever else stood or lay on it.
 */
export function placeChannels(f: Floor): PrisonChannel[] {
  const out: PrisonChannel[] = [];
  const plain = (x: number, y: number): boolean => {
    if (x < 0 || y < 0 || x >= f.w || y >= f.h) return false;
    const i = y * f.w + x;
    return f.tiles[i] === T_FLOOR && !(f.cut && f.cut[i] !== 0) && !(f.stair && f.stair[i] !== 0) && !(f.height && f.height[i] !== 0);
  };
  for (const r of f.rooms) {
    if (!r.block) continue;
    const alongX = r.w >= r.h;
    const from = alongX ? r.x : r.y;
    const len = alongX ? r.w : r.h;
    const wide = alongX ? r.h : r.w;
    if (wide < 6) continue;
    // (its rows: the middle two of the block's breadth; or, where something there rules it out, a row to either side, so long as two
    // rows of floor are left on either side of it)
    const r0 = alongX ? r.y : r.x;
    const mid = r0 + Math.floor((wide - 2) / 2);
    let best: PrisonChannel | null = null;
    for (const row of [mid, mid + 1, mid - 1]) {
      if (row < r0 + 2 || row + 2 > r0 + wide - 2) continue;
      // (along the block, a tile short of either end; where a trap, a chest, a lever, the way in or the boss is on it or beside it,
      // it is cut short there: the longest stretch left, long enough for its grates and an open run of three)
      const free = new Uint8Array(len);
      for (let k = 1; k < len - 1; k++) {
        const a = from + k;
        free[k] = 1;
        for (const j of [0, 1]) {
          const [x, y] = alongX ? [a, row + j] : [row + j, a];
          if (!plain(x, y)) free[k] = 0;
        }
      }
      const block = (x: number, y: number, w = 1, h = 1): void => {
        const across0 = alongX ? y : x;
        const across1 = across0 + (alongX ? h : w);
        if (across1 < row || across0 > row + 2) return;
        const al0 = (alongX ? x : y) - 1;
        const al1 = (alongX ? x + w : y + h) + 1;
        for (let a = al0; a < al1; a++) if (a - from >= 0 && a - from < len) free[a - from] = 0;
      };
      for (const p of f.props) if (p.kind === 'chest' || p.kind === 'lever') block(p.x, p.y);
      for (const l of f.levers ?? []) block(l.x, l.y);
      for (const z of f.hazards ?? []) block(z.x, z.y, z.w, z.h);
      block(Math.floor(f.start.x), Math.floor(f.start.y));
      block(Math.floor(f.boss.x), Math.floor(f.boss.y));
      let k = 0;
      while (k < len) {
        if (!free[k]) { k++; continue; }
        let e = k;
        while (e < len && free[e]) e++;
        const a0 = from + k;
        const a1 = from + e;
        const n = a1 - a0;
        const far = n >= 14 ? 3 : 2;
        const open0 = a0 + far;
        const open1 = a1 - 2;
        if (open1 - open0 >= 3 && (!best || n > best.a1 - best.a0)) best = { alongX, row, a0, a1, open0, open1, bridge: open0 + Math.floor((open1 - open0) / 2) };
        k = e;
      }
    }
    if (!best) continue;
    const c = best;
    f.props = f.props.filter((p) => !onChannel(c, p.x, p.y));
    if (f.heaps) f.heaps = f.heaps.filter((h) => !onChannel(c, Math.floor(h.x), Math.floor(h.y)));
    out.push(c);
  }
  return out;
}
