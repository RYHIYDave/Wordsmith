// FLOOR 2 AS THE PRISON'S GROUNDS AT NIGHT: WHERE ITS OWN THINGS GO (the art chat's art/grounds.ts, behind GROUNDS: his words of 2
// Nov 2026, of floor 2's halls, “Yes, redo the halls (Recommended)”; asked whether more of it should be outside, “Mostly outside”;
// and “Yes, hand it over (Recommended)”; off until his yes to it in play). As the art chat's README lays it out
// (docs/mockups/floor2_look/README.md, "What the main chat must lay"):
//   THE COURTYARDS: floor 2's great rooms (game/dungeon.ts planOpen, `court`), 14 to 18 tiles by 12 to 15, under the sky;
//   THE CELL BLOCKS between them, six tiles deep, standing whole; A WAY THREE TILES WIDE through each between two neighbours (all
//     those on the walk and most of the rest), a gatehouse at its mouth in the courtyard it opens into (one in three barred: its
//     portcullis drawn up);
//   THE GAOLER'S ROOM, six by six, indoors, where he comes in: THE STAIR DOWN FROM FLOOR 1 in a back wall of it, he a tile and a half
//     before it; his house six tiles deep, a passage straight through it, THE GAOLER'S DOOR at its mouth in the first courtyard;
//   THE LONG WALK, two tiles wide, from the gaoler's door through each gateway on the way to the way down to his yard, in straight
//     runs turning at a courtyard's middle;
//   THE LAST-RITES CHAPEL: three tiles of a block's face in a back wall of a courtyard at the walk's end, a little way from its
//     gateway, two braziers before it;
//   THE WELL one in each courtyard or two, THE TUMBRIL one or two on the floor.
// What is placed here is the level's (Level.grounds, Level.props); what is drawn is render/grounds.ts's.

import { GROUNDS } from '../art/grounds';
import type { GatewayKind } from '../art/grounds';
import { beforeStretch, stretchTiles } from './chapel_way';
import { placeInBackWall } from './ways';
import { T_FLOOR, T_VOID, T_WALL } from './types';
import type { DoorSpot, Floor } from './types';
import type { Level, PropInst } from './state';

/** The grounds' measures (game/dungeon.ts planOpen): its courtyards' sizes, the blocks' depth, the gaoler's room, how many blocks between two are left without a way through, how many gateways are barred. */
export const GROUNDS_HALL = { room: [14, 18] as const, row: [12, 15] as const, gap: 6, gaol: 6, wall: 0.18, barred: 1 / 3 };

/** Is floor `depth` the prison's grounds (floor 2, GROUNDS on)? (game/dungeon.ts lays it so only where floor 2 is laid open.) */
export function groundsHere(depth: number): boolean {
  return GROUNDS.on && Math.floor(depth) === 2;
}

/** A way through a block, at its mouth in the courtyard it opens into: its face's line (that courtyard's first row or column), the first of its three tiles along it. */
export interface GroundsGate {
  alongX: boolean;
  a: number;
  line: number;
  kind: GatewayKind;
}
/** A room's floor rectangle (tiles). */
export interface GroundsRect {
  x: number;
  y: number;
  w: number;
  h: number;
}
/** Floor 2's own: its courtyards, the gaoler's room and the passage out through his house, the ways through the blocks, the long walk, the chapel, the stair down from floor 1. */
export interface GroundsPlan {
  courts: GroundsRect[];
  gaol: GroundsRect;
  house: GroundsRect | null;
  gates: GroundsGate[];
  /** The long walk's tiles (1 where it is laid). */
  walk: Uint8Array;
  chapel: DoorSpot | null;
  wayIn: DoorSpot | null;
}

/** A small hash of a tile, 0 to 1. */
function hash(x: number, y: number, k: number): number {
  let h = Math.imul(x * 374761393 + y * 668265263 + k * 2147483647, 1274126177);
  h ^= h >>> 13;
  h = Math.imul(h, 1103515245);
  return ((h >>> 0) % 10007) / 10007;
}

/** Is tile (x, y) floor? */
function floorAt(f: Floor, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < f.w && y < f.h && f.tiles[y * f.w + x] === T_FLOOR;
}

/** The runs of `len` floor tiles side by side along a line of tiles: the first of each. */
function runsOf(open: (k: number) => boolean, from: number, to: number, len: number): number[] {
  const out: number[] = [];
  let run = 0;
  for (let k = from; k <= to + 1; k++) {
    if (k <= to && open(k)) {
      run++;
      continue;
    }
    if (run === len) out.push(k - len);
    run = 0;
  }
  return out;
}

/**
 * THE GROUNDS' PLAN, read off the floor as it was laid (before the level's things are set): its courtyards and the ways between
 * them, the gaoler's room and his door, the long walk, the stair down from floor 1 and the chapel. Null where floor 2 is not the
 * grounds (or was laid otherwise).
 */
export function planGrounds(f: Floor): GroundsPlan | null {
  const courts = f.rooms.filter((r) => r.court);
  const start = f.rooms.find((r) => r.kind === 'start');
  if (!courts.length || !start) return null;
  const G = GROUNDS_HALL.gap;
  const gates: GroundsGate[] = [];
  const kindAt = (x: number, y: number): GatewayKind => (hash(x, y, 31) < GROUNDS_HALL.barred ? 'barred' : 'open');
  /** (the ways between two courtyards: `from`, `to` their ids; where along, which way) */
  const links: { a: number; b: number; gate: GroundsGate }[] = [];
  for (const A of courts) {
    for (const B of courts) {
      // (B beside A along x, the block between them six deep: a way through it along x, its mouth in B's wall along y)
      if (B.x === A.x + A.w + G && B.y < A.y + A.h && A.y < B.y + B.h) {
        const lo = Math.max(A.y, B.y);
        const hi = Math.min(A.y + A.h, B.y + B.h) - 1;
        for (const a of runsOf((y) => [...Array(G).keys()].every((k) => floorAt(f, A.x + A.w + k, y)), lo, hi, 3)) {
          const gate: GroundsGate = { alongX: false, a, line: B.x, kind: kindAt(B.x, a) };
          gates.push(gate);
          links.push({ a: A.id, b: B.id, gate });
        }
      }
      // (B below A along y: a way through along y, its mouth in B's wall along x)
      if (B.y === A.y + A.h + G && B.x < A.x + A.w && A.x < B.x + B.w) {
        const lo = Math.max(A.x, B.x);
        const hi = Math.min(A.x + A.w, B.x + B.w) - 1;
        for (const a of runsOf((x) => [...Array(G).keys()].every((k) => floorAt(f, x, A.y + A.h + k)), lo, hi, 3)) {
          const gate: GroundsGate = { alongX: true, a, line: B.y, kind: kindAt(a, B.y) };
          gates.push(gate);
          links.push({ a: A.id, b: B.id, gate });
        }
      }
    }
  }
  // THE GAOLER'S DOOR: the passage out of his room, at its mouth in the first courtyard's wall along y
  const first = courts.find((r) => r.path === 1) ?? courts[0];
  let house: GroundsRect | null = null;
  let gaolDoor: GroundsGate | null = null;
  const outs = runsOf((y) => floorAt(f, first.x - 1, y) && floorAt(f, start.x + start.w, y), start.y, start.y + start.h - 1, 3);
  if (outs.length) {
    const a = outs[0];
    gaolDoor = { alongX: false, a, line: first.x, kind: 'gaol' };
    gates.push(gaolDoor);
    house = { x: start.x + start.w, y: a, w: first.x - start.x - start.w, h: 3 };
  }
  // THE LONG WALK: the courtyards from the first to the last on the main path, by the ways between them (fewest courtyards)
  const last = courts.reduce((m, r) => (r.path > m.path ? r : m), first);
  const prev = new Map<number, { from: number; gate: GroundsGate }>();
  const seen = new Set<number>([first.id]);
  const queue = [first.id];
  while (queue.length) {
    const id = queue.shift()!;
    if (id === last.id) break;
    for (const l of links) {
      const other = l.a === id ? l.b : l.b === id ? l.a : -1;
      if (other < 0 || seen.has(other)) continue;
      seen.add(other);
      prev.set(other, { from: id, gate: l.gate });
      queue.push(other);
    }
  }
  const chain: { court: number; gate: GroundsGate | null }[] = [];
  for (let id: number | undefined = seen.has(last.id) ? last.id : first.id; id !== undefined; ) {
    const p = prev.get(id);
    chain.unshift({ court: id, gate: p ? p.gate : gaolDoor });
    id = p ? p.from : undefined;
  }
  const walk = new Uint8Array(f.w * f.h);
  const lay = (x: number, y: number): void => {
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) if (floorAt(f, x + dx, y + dy)) walk[(y + dy) * f.w + x + dx] = 1;
  };
  /** A straight run of the walk's two-wide stamp from (x0, y0) to (x1, y1) (one of them the same). */
  const run = (x0: number, y0: number, x1: number, y1: number): void => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let k = 0; k <= n; k++) lay(x0 + Math.sign(x1 - x0) * k, y0 + Math.sign(y1 - y0) * k);
  };
  /** Where a way meets a courtyard: its side ('x': a wall along y, the way runs along x), the stamp's place at the courtyard's edge, the stamp's place out at the way's far end. */
  const mouth = (r: GroundsRect, g: GroundsGate): { alongX: boolean; at: [number, number]; far: [number, number] } => {
    const lane = g.a + 1;
    if (!g.alongX) {
      // (the way runs along x: in r's wall along y at g.line, or in its far wall, the way's other end)
      const west = g.line === r.x;
      const at: [number, number] = [west ? r.x : r.x + r.w - 2, lane];
      const far: [number, number] = [west ? r.x - G : r.x + r.w + G - 2, lane];
      return { alongX: true, at, far };
    }
    const north = g.line === r.y;
    const at: [number, number] = [lane, north ? r.y : r.y + r.h - 2];
    const far: [number, number] = [lane, north ? r.y - G : r.y + r.h + G - 2];
    return { alongX: false, at, far };
  };
  // (the way down to his yard: the floor straight out of the last courtyard's near wall along x)
  let down: { alongX: boolean; at: [number, number]; far: [number, number] } | null = null;
  const downs = runsOf((x) => floorAt(f, x, last.y + last.h), last.x, last.x + last.w - 1, 3);
  if (downs.length) {
    const Y = f.yard;
    const end = Y ? Y.y - 1 : last.y + last.h + 2;
    down = { alongX: false, at: [downs[0] + 1, last.y + last.h - 2], far: [downs[0] + 1, end - 1] };
  }
  chain.forEach((c, i) => {
    const r = courts.find((q) => q.id === c.court)!;
    const inn = c.gate ? mouth(r, c.gate) : null;
    const out = i + 1 < chain.length ? mouth(r, chain[i + 1].gate!) : down;
    // (through the way in, from its far end: the gaoler's door is walked from its doorway, not through his house)
    if (inn && c.gate && c.gate.kind !== 'gaol') run(inn.far[0], inn.far[1], inn.at[0], inn.at[1]);
    if (!inn || !out) return;
    const mx = r.x + Math.floor(r.w / 2) - 1;
    const my = r.y + Math.floor(r.h / 2) - 1;
    if (inn.alongX !== out.alongX) {
      // (the one turn, where the two lanes cross)
      const turn: [number, number] = inn.alongX ? [out.at[0], inn.at[1]] : [inn.at[0], out.at[1]];
      run(inn.at[0], inn.at[1], turn[0], turn[1]);
      run(turn[0], turn[1], out.at[0], out.at[1]);
    } else if (inn.alongX) {
      run(inn.at[0], inn.at[1], mx, inn.at[1]);
      run(mx, inn.at[1], mx, out.at[1]);
      run(mx, out.at[1], out.at[0], out.at[1]);
    } else {
      run(inn.at[0], inn.at[1], inn.at[0], my);
      run(inn.at[0], my, out.at[0], my);
      run(out.at[0], my, out.at[0], out.at[1]);
    }
    if (out === down && down) run(down.at[0], down.at[1], down.far[0], down.far[1]);
  });
  // THE STAIR DOWN FROM FLOOR 1, in a back wall of the gaoler's room (as the first floor's gate: game/ways.ts)
  const wayIn = placeInBackWall(f, start);
  // THE BLOCKS STAND WHOLE: the dark between two courtyards' walls (and in the gaoler's house) made wall, so that the blocks are
  // solid six tiles deep and none of their inner sides is seen
  const solid = (x0: number, y0: number, x1: number, y1: number): void => {
    for (let y = Math.max(0, y0); y <= Math.min(f.h - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(f.w - 1, x1); x++) if (f.tiles[y * f.w + x] === T_VOID) f.tiles[y * f.w + x] = T_WALL;
  };
  const gx0 = Math.min(...courts.map((r) => r.x));
  const gy0 = Math.min(...courts.map((r) => r.y));
  const gx1 = Math.max(...courts.map((r) => r.x + r.w - 1));
  const gy1 = Math.max(...courts.map((r) => r.y + r.h - 1));
  solid(gx0, gy0, gx1, gy1);
  if (house) solid(house.x, start.y - 1, house.x + house.w - 1, start.y + start.h);
  // THE CHAPEL: three tiles of a block's face in a back wall of a courtyard at the walk's end, clear of its ways
  const chapel = placeChapelFront(f, chain.map((c) => courts.find((q) => q.id === c.court)!).reverse(), gates);
  return { courts: courts.map((r) => ({ x: r.x, y: r.y, w: r.w, h: r.h })), gaol: { x: start.x, y: start.y, w: start.w, h: start.h }, house, gates, walk, chapel, wayIn };
}

/** Three tiles of block face in a back wall of the first of `rooms` that has them: wall either side, clear of every way's mouth, two rows of floor before, a courtyard behind (a block, not the outer wall), nearest the wall's middle but off it. */
function placeChapelFront(f: Floor, rooms: GroundsRect[], gates: GroundsGate[]): DoorSpot | null {
  const wall = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < f.w && y < f.h && f.tiles[y * f.w + x] === T_WALL;
  for (const r of rooms) {
    let best: DoorSpot | null = null;
    let bestScore = Infinity;
    for (const alongX of [true, false]) {
      const line = alongX ? r.y : r.x;
      const from = alongX ? r.x : r.y;
      const len = alongX ? r.w : r.h;
      const at = (k: number, d: number): [number, number] => (alongX ? [from + k, line - 1 - d] : [line - 1 - d, from + k]);
      const inside = (k: number, d: number): [number, number] => (alongX ? [from + k, line + d] : [line + d, from + k]);
      for (let k = 1; k + 3 < len; k++) {
        let ok = true;
        for (let j = k - 1; j <= k + 3 && ok; j++) ok = wall(...at(j, 0));
        for (let j = k; j <= k + 2 && ok; j++) ok = floorAt(f, ...inside(j, 0)) && floorAt(f, ...inside(j, 1));
        // (clear of every way in this wall, a tile and more either side of its mouth's pictures)
        for (const g of gates) if (ok && g.alongX === alongX && g.line === line && k + from + 2 >= g.a - 2 && k + from <= g.a + 4) ok = false;
        if (!ok) continue;
        // (a courtyard behind: floor within the block's depth and a little more)
        let behind = false;
        for (let d = 1; d <= GROUNDS_HALL.gap + 2 && !behind; d++) behind = floorAt(f, ...at(k + 1, d));
        const mid = (len - 3) / 2;
        const score = (behind ? 0 : 1000) + Math.abs(Math.abs(k - mid) - 3) + (alongX ? 0 : 0.5);
        if (score < bestScore) {
          bestScore = score;
          best = { kind: 'waygate', room: -1, alongX, near: false, a: from + k, plane: line, out: -1 };
        }
      }
    }
    if (best && bestScore < 1000) return best;
  }
  return null;
}

/** Is the tile (x, y) on the floor of the gaoler's room or the passage through his house (indoors)? */
export function inGaol(P: GroundsPlan, x: number, y: number): boolean {
  const g = P.gaol;
  if (x >= g.x && x < g.x + g.w && y >= g.y && y < g.y + g.h) return true;
  const h = P.house;
  return !!h && x >= h.x && x < h.x + h.w && y >= h.y && y < h.y + h.h;
}

/** The courtyard tile (x, y) is in, or -1 (tiles: a point's floor). */
export function courtAt(P: GroundsPlan, x: number, y: number): number {
  return P.courts.findIndex((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
}

/** The grounds' stretches of wall that stay wall and are drawn as pictures of their own (the stair, the chapel): their tiles. */
export function groundsStretches(f: Floor, P: GroundsPlan): number[] {
  const out: number[] = [];
  for (const s of [P.wayIn, P.chapel]) if (s) out.push(...stretchTiles(f, s));
  return out;
}

/** Is tile (x, y) before the stair or the chapel (kept clear)? */
export function beforeGrounds(P: GroundsPlan, x: number, y: number): boolean {
  return [P.wayIn, P.chapel].some((s) => !!s && beforeStretch(s, x, y));
}

/**
 * THE GROUNDS' THINGS, set last (after the floor's own pieces): the well in each courtyard, a second in a big one; the tumbril, one
 * or two on the floor; two braziers before the chapel. Each blocks its tiles; none where anyone has to stand or pass: not on the walk,
 * before a way, the stair, the chapel, the waypoint or the stairwell, and none that would leave a tile cut off.
 */
export function layGrounds(L: Level): void {
  const P = L.grounds;
  if (!P) return;
  const f = L.floor;
  const W = f.w;
  const taken = new Uint8Array(W * f.h);
  for (const p of L.props) taken[p.ty * W + p.tx] = 1;
  for (const t of L.dress?.tiles ?? []) taken[t.i] = 1;
  const plain = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < f.h && f.tiles[y * W + x] === T_FLOOR && L.walk[y * W + x] === 1 && !taken[y * W + x];
  // (kept clear: where he comes in, the waypoint, the stairwell's places, before every way, the walk and a tile round it)
  const keep = (x: number, y: number): boolean => {
    if (Math.hypot(x + 0.5 - f.start.x, y + 0.5 - f.start.y) < 2.5) return true;
    const w = L.ways?.way;
    if (w && Math.hypot(x + 0.5 - w.x, y + 0.5 - w.y) < 2.2) return true;
    for (const s of L.ways?.stairs ?? []) if (x >= s.x - 1 && x <= s.x + 3 && y >= s.y - 1 && y <= s.y + 2) return true;
    if (beforeGrounds(P, x, y)) return true;
    for (const g of P.gates) {
      const along = g.alongX ? x : y;
      const across = (g.alongX ? y : x) - g.line;
      if (along >= g.a - 1 && along <= g.a + 3 && across >= -1 && across < 3) return true;
    }
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (x + dx >= 0 && y + dy >= 0 && x + dx < W && y + dy < f.h && P.walk[(y + dy) * W + x + dx]) return true;
    return false;
  };
  const reach = (): number => {
    const seen = new Uint8Array(W * f.h);
    const s = Math.floor(f.start.y) * W + Math.floor(f.start.x);
    const q = [s];
    seen[s] = 1;
    let n = 0;
    while (q.length) {
      const i = q.pop()!;
      n++;
      for (const d of [1, -1, W, -W]) {
        const j = i + d;
        if (j >= 0 && j < seen.length && !seen[j] && L.walk[j]) {
          seen[j] = 1;
          q.push(j);
        }
      }
    }
    return n;
  };
  let open = reach();
  /** Set a piece standing on `tiles` (its anchor x, y), if they are all free and none is cut off by it. */
  const put = (name: string, x: number, y: number, tiles: [number, number][], solid = true, near = false): boolean => {
    if (!tiles.every(([tx, ty]) => plain(tx, ty) && (near || !keep(tx, ty)) && !P.walk[ty * W + tx])) return false;
    if (solid) {
      for (const [tx, ty] of tiles) L.walk[ty * W + tx] = 0;
      const now = reach();
      if (now < open - tiles.length) {
        for (const [tx, ty] of tiles) L.walk[ty * W + tx] = 1;
        return false;
      }
      open = now;
    }
    const p: PropInst = { kind: 'piece', name, tx: Math.floor(x), ty: Math.floor(y), x, y, solid, state: 0, variant: 0 };
    L.props.push(p);
    for (const [tx, ty] of tiles) taken[ty * W + tx] = 1;
    return true;
  };
  /** Tiles of a courtyard, by a hash of their own, away from its walls by `inset`. */
  const spots = (r: GroundsRect, inset: number, k: number): [number, number][] => {
    const out: [number, number][] = [];
    for (let y = r.y + inset; y < r.y + r.h - inset; y++) for (let x = r.x + inset; x < r.x + r.w - inset; x++) out.push([x, y]);
    return out.sort((p, q) => hash(p[0], p[1], k) - hash(q[0], q[1], k));
  };
  // THE WELLS: one in each courtyard, a second in a big one
  P.courts.forEach((r, n) => {
    const want = r.w * r.h >= 230 ? 2 : 1;
    let laid = 0;
    const at: [number, number][] = [];
    for (const [x, y] of spots(r, 3, 61 + n)) {
      if (laid >= want) break;
      if (at.some(([u, v]) => Math.hypot(u - x, v - y) < 6)) continue;
      if (put('the well', x + 0.5, y + 0.5, [[x, y]])) {
        laid++;
        at.push([x, y]);
      }
    }
  });
  // THE TUMBRIL: one or two on the floor, in courtyards on the walk's way, along x or along y (three tiles by one)
  let carts = 1 + (hash(f.w, f.h, 67) < 0.5 ? 1 : 0);
  for (const [n, r] of P.courts.map((q, i) => [i, q] as const).sort((p, q) => hash(p[0], 7, 71) - hash(q[0], 7, 71))) {
    if (carts <= 0) break;
    for (const [x, y] of spots(r, 2, 73 + n)) {
      const alongX = hash(x, y, 79) < 0.5;
      const tiles: [number, number][] = alongX ? [[x - 1, y], [x, y], [x + 1, y]] : [[x, y - 1], [x, y], [x, y + 1]];
      if (put(alongX ? 'the tumbril, along x' : 'the tumbril, along y', x + 0.5, y + 0.5, tiles)) {
        carts--;
        break;
      }
    }
  }
  // TWO BRAZIERS BEFORE THE CHAPEL, either side of its doorway, two tiles out
  const c = P.chapel;
  if (c) {
    for (const s of [-0.9, 3.9]) {
      const [x, y] = c.alongX ? [c.a + s, c.plane + 2.2] : [c.plane + 2.2, c.a + s];
      put('brazier of irons', x, y, [[Math.floor(x), Math.floor(y)]], true, true);
    }
  }
}
