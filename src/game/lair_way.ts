// FLOOR 5 AS THE MINE THAT BECOMES HIS TEMPLE: WHERE ITS OWN THINGS GO (the art chat's art/lair_temple.ts, behind LAIR_TEMPLE: his
// words, 1 Nov 2026, “I like the temple but I need the mine to be a prominent part of it.  Like you start in the mine then it
// becomes a temple further on”; his pick “A, through the threshold (Recommended)”, and “Yes, hand them over (Recommended)”; off
// until his yes to it in play). As the art chat's README lays it out (docs/mockups/floor5_look/README.md, "How to bring it in"):
//   WHICH IS WHICH: the temple is his hall and the room his doorway opens from, and what is only reached through them; the rest,
//     and the first room (where he comes out of the cave), the mine; a corridor takes the part of the room it leads from, toward
//     the start;
//   THE THRESHOLDS: every doorway where the mine meets the temple, a carved front of black stone standing in it, two braziers just
//     inside the temple either side of its way;
//   THE RAILS along the way the floor leads through the mine (straight, bending, an end at each end), their last end a tile before
//     the threshold with the rails' stop on it, a cart on them somewhere; THE RIFT'S CRACKS out from the rift in his hall, a short
//     one in the room before it;
//   lantern posts in the mine's rooms, braziers in the temple's and by his gate; the floor's own pieces each in its own part.
// What is placed here is the level's (Level.lair, Level.props); what is drawn is render/lair.ts's.

import { LAIR_PART, LAIR_TEMPLE } from '../art/lair_temple';
import { doorTiles } from './doors';
import { T_FLOOR } from './types';
import type { Floor, Room } from './types';
import type { Level, PropInst } from './state';

/** A threshold: a doorway of three tiles where the mine meets the temple (`a` the first along its wall; `line` the wall's row; `temple` the way into the temple: +1 or -1 across). */
export interface Threshold {
  alongX: boolean;
  a: number;
  line: number;
  temple: 1 | -1;
}
export interface LairPlan {
  /** Each tile's part: 0 not floor, 1 the mine, 2 the temple. */
  part: Uint8Array;
  thresholds: Threshold[];
  /** The floor tiles laid with the rails and with the rift's cracks: the tile, the art's name for it. */
  rails: { i: number; name: string }[];
  cracks: { i: number; name: string; glow: boolean }[];
}

/** Is floor `depth` the mine and the temple (floor 5, LAIR_TEMPLE on)? */
export function lairHere(depth: number): boolean {
  return LAIR_TEMPLE.on && depth === 5;
}

const MINE = 1;
const TEMPLE = 2;

/** The room a tile is in (none: a corridor or a wall). */
function roomAt(f: Floor, x: number, y: number): Room | null {
  for (const r of f.rooms) if (x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h) return r;
  return null;
}

/** A small hash of a tile, 0 to 1. */
function hash(x: number, y: number, k: number): number {
  let h = Math.imul(x * 374761393 + y * 668265263 + k * 2147483647, 1274126177);
  h ^= h >>> 13;
  h = Math.imul(h, 1103515245);
  return ((h >>> 0) % 10007) / 10007;
}

type Edge = '-x' | '+x' | '-y' | '+y';
const STEP: Record<Edge, [number, number]> = { '-x': [-1, 0], '+x': [1, 0], '-y': [0, -1], '+y': [0, 1] };

/** The rails' tile with these two edges (or one: an end). */
function railName(a: Edge, b: Edge | null): string {
  if (!b) return `rails' end, from ${a[1] === 'x' ? (a[0] === '-' ? 'low x' : 'high x') : a[0] === '-' ? 'low y' : 'high y'}`;
  const set = new Set([a, b]);
  if (set.has('-x') && set.has('+x')) return 'rails along x';
  if (set.has('-y') && set.has('+y')) return 'rails along y';
  const x = set.has('-x') ? 'low x' : 'high x';
  const y = set.has('-y') ? 'low y' : 'high y';
  return `rails bending, ${x} to ${y}`;
}

/**
 * WHICH PART EACH TILE OF FLOOR IS (0 not floor, 1 the mine, 2 the temple): from where he comes in, every tile takes the part of
 * the tile it is come to from, but the temple's rooms (his hall, the room before it) are the temple; so a corridor takes the part
 * of the room it leads from, toward the start, and a room only reached through the temple is the temple's.
 */
export function partsOf(f: Floor): Uint8Array {
  const W = f.w;
  const n = W * f.h;
  const part = new Uint8Array(n);
  const hall = f.rooms.find((r) => r.kind === 'boss') ?? null;
  const ante = anteOf(f);
  const temple = (x: number, y: number): boolean => {
    const r = roomAt(f, x, y);
    return !!r && (r === hall || r === ante);
  };
  const floorish = (i: number): boolean => f.tiles[i] === T_FLOOR;
  const s0 = Math.floor(f.start.y) * W + Math.floor(f.start.x);
  const q = [s0];
  part[s0] = temple(s0 % W, Math.floor(s0 / W)) ? TEMPLE : MINE;
  for (let h = 0; h < q.length; h++) {
    const i = q[h];
    const x = i % W;
    for (const d of [1, -1, W, -W]) {
      const j = i + d;
      if (j < 0 || j >= n || (d === 1 && x === W - 1) || (d === -1 && x === 0) || part[j] || !floorish(j)) continue;
      part[j] = temple(j % W, Math.floor(j / W)) ? TEMPLE : part[i];
      q.push(j);
    }
  }
  // (any floor not come to from where he comes in: by its room, else the mine)
  for (let i = 0; i < n; i++) if (!part[i] && floorish(i)) part[i] = temple(i % W, Math.floor(i / W)) ? TEMPLE : MINE;
  return part;
}

/** The room before his hall on the main way: the one his doorway opens from. */
function anteOf(f: Floor): Room | null {
  const hall = f.rooms.find((r) => r.kind === 'boss') ?? null;
  let ante: Room | null = null;
  for (const r of f.rooms) if (r !== hall && r.path >= 0 && (!ante || r.path > ante.path)) ante = r;
  return ante;
}

/**
 * THE WAYS INTO THE TEMPLE LEFT OPEN (before the level is made from the floor): a doorway with a plain door where the mine meets
 * the temple loses its door and the stone either side of it, so that the threshold stands in a way three tiles wide.
 */
export function openLairDoors(f: Floor): void {
  if (!f.doors) return;
  const part = partsOf(f);
  const W = f.w;
  f.doors = f.doors.filter((d) => {
    if (d.kind !== 'door') return true;
    const tiles = doorTiles(f, d);
    const way = tiles[1];
    const x = way % W;
    const y = Math.floor(way / W);
    const across = d.alongX ? [(y - 1) * W + x, (y + 1) * W + x] : [y * W + x - 1, y * W + x + 1];
    const parts = new Set(across.map((i) => part[i]));
    if (!(parts.has(MINE) && parts.has(TEMPLE))) return true;
    for (const i of tiles) f.tiles[i] = T_FLOOR;
    return false;
  });
}

/** WHICH PART EACH TILE IS, THE THRESHOLDS, THE RAILS AND THE CRACKS (after the level is made: its walk). */
export function planLair(L: Level): LairPlan {
  const f = L.floor;
  const W = f.w;
  const n = W * f.h;
  const hall = f.rooms.find((r) => r.kind === 'boss') ?? null;
  const ante = anteOf(f);
  const part = partsOf(f);
  const s0 = Math.floor(f.start.y) * W + Math.floor(f.start.x);
  // THE THRESHOLDS: where a tile of the mine and a tile of the temple meet, in runs along the wall's row (not in a doorway that
  // has a door or a gate of its own: his gate's, a locked door's)
  const doorAt = new Set<number>();
  for (const d of L.doors) for (const i of doorTiles(f, d.spot)) doorAt.add(i);
  // (every crossing from the mine into the temple; a threshold stands in those with no door nor gate of their own)
  const crossings: (Threshold & { gated: boolean })[] = [];
  const seen = new Set<string>();
  for (let y = 1; y < f.h - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      if (part[i] !== MINE) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const j = (y + dy) * W + x + dx;
        if (part[j] !== TEMPLE) continue;
        // (the mine's tile is the doorway's, in the wall's row; the temple's room is across it)
        const alongX = dy !== 0;
        const line = alongX ? y : x;
        const along = alongX ? x : y;
        const meets = (k: number): boolean => {
          const [px, py] = alongX ? [k, line] : [line, k];
          const [tx, ty] = alongX ? [k, line + dy] : [line + dx, k];
          return part[py * W + px] === MINE && part[ty * W + tx] === TEMPLE;
        };
        let a0 = along;
        while (meets(a0 - 1)) a0--;
        let a1 = along + 1;
        while (meets(a1)) a1++;
        const id = `${alongX}:${line}:${dx + dy}:${a0}`;
        if (seen.has(id)) continue;
        seen.add(id);
        // (a doorway's way: three tiles of it, from its middle; a threshold stands only in a way of three whole tiles, straight
        // across, with no door nor gate in it: not where a corridor comes in slantwise at a corner)
        const a = a0 + Math.floor((a1 - a0 - 3) / 2);
        const whole = [0, 1, 2].every((k) => {
          const [px, py] = alongX ? [a + k, line] : [line, a + k];
          const [tx, ty] = alongX ? [a + k, line + dy] : [line + dx, a + k];
          const p0 = py * W + px;
          const t0 = ty * W + tx;
          return part[p0] === MINE && part[t0] === TEMPLE && !(f.cut && (f.cut[p0] !== 0 || f.cut[t0] !== 0));
        });
        const gated = !whole || [0, 1, 2].some((k) => doorAt.has(alongX ? line * W + a + k : (a + k) * W + line));
        crossings.push({ alongX, a, line, temple: (dx + dy > 0 ? 1 : -1) as 1 | -1, gated });
      }
    }
  }
  const thresholds: Threshold[] = crossings.filter((c) => !c.gated).map(({ alongX, a, line, temple }) => ({ alongX, a, line, temple }));
  // THE RAILS: the way the floor leads through the mine from where he comes in to a threshold (else to the gate into the temple),
  // a tile short of it,
  // keeping straight where it can (each turn costs as three tiles more)
  const rails: { i: number; name: string }[] = [];
  for (const th of [...thresholds, ...crossings.filter((c) => c.gated)]) {
    if (rails.length) break;
    // (the end: two tiles back from the threshold's middle, in the mine; or the nearest tile to there that the rails may run on)
    const mid = th.a + 1;
    const [ex, ey] = th.alongX ? [mid, th.line - th.temple] : [th.line - th.temple, mid];
    let goal = -1;
    for (let r = 0; r <= 3 && goal < 0; r++) {
      for (let dy = -r; dy <= r && goal < 0; dy++) {
        for (let dx = -r; dx <= r && goal < 0; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const x = ex + dx;
          const y = ey + dy;
          if (x < 0 || y < 0 || x >= W || y >= f.h) continue;
          const i = y * W + x;
          if (part[i] === MINE && L.walk[i] === 1 && !(f.cut && f.cut[i] !== 0)) goal = i;
        }
      }
    }
    if (goal < 0) continue;
    const DIRS: Edge[] = ['-x', '+x', '-y', '+y'];
    const cost = new Int32Array(n * 4).fill(-1);
    const from = new Int32Array(n * 4).fill(-1);
    const buckets: number[][] = [];
    const push = (c: number, st: number): void => {
      (buckets[c] ??= []).push(st);
    };
    for (let k = 0; k < 4; k++) {
      cost[s0 * 4 + k] = 0;
      push(0, s0 * 4 + k);
    }
    // (through the floor's doorways too, shut or not: a gate down until its lever is pulled is on the way)
    const ok = (i: number): boolean => part[i] === MINE && (L.walk[i] === 1 || doorAt.has(i));
    let end = -1;
    for (let c = 0; c < buckets.length && end < 0; c++) {
      const list = buckets[c];
      if (!list) continue;
      for (const st of list) {
        if (cost[st] !== c) continue;
        const i = st >> 2;
        const k = st & 3;
        if (i === goal) {
          end = st;
          break;
        }
        for (let k2 = 0; k2 < 4; k2++) {
          const [dx, dy] = STEP[DIRS[k2]];
          const x = (i % W) + dx;
          const y = Math.floor(i / W) + dy;
          if (x < 0 || y < 0 || x >= W || y >= f.h) continue;
          const j = y * W + x;
          if (!ok(j)) continue;
          const nc = c + 1 + (k2 !== k ? 3 : 0);
          const s2 = j * 4 + k2;
          if (cost[s2] >= 0 && cost[s2] <= nc) continue;
          cost[s2] = nc;
          from[s2] = st;
          push(nc, s2);
        }
      }
    }
    if (end >= 0) {
      const path: number[] = [];
      for (let st = end; st >= 0; st = from[st]) path.push(st >> 2);
      path.reverse();
      // (from a tile or two out from where he comes in, so that he does not stand on its end)
      const way = path.slice(Math.min(2, Math.max(0, path.length - 4)));
      const edge = (a: number, b: number): Edge => {
        const dx = (b % W) - (a % W);
        const dy = Math.floor(b / W) - Math.floor(a / W);
        return dx > 0 ? '+x' : dx < 0 ? '-x' : dy > 0 ? '+y' : '-y';
      };
      for (let k = 0; k < way.length; k++) {
        const i = way[k];
        const a = k > 0 ? edge(i, way[k - 1]) : null;
        const b = k < way.length - 1 ? edge(i, way[k + 1]) : null;
        const name = a && b ? railName(a, b) : railName((a ?? b)!, null);
        rails.push({ i, name });
      }
    }
  }
  // THE RIFT'S CRACKS: out from the rift in his hall (where the floor's own rift is laid, if in his hall; else where he stands),
  // four runs, glowing within two tiles of it, each closed by an ending; a short one in the room before his hall
  const cracks: { i: number; name: string; glow: boolean }[] = [];
  const taken = new Set<number>(rails.map((r) => r.i));
  for (const t of L.dress?.tiles ?? []) taken.add(t.i);
  const solid = new Set<number>();
  for (const p of L.props) if (p.solid) solid.add(p.ty * W + p.tx);
  const runFrom = (cx: number, cy: number, len: number, glowTo: number, seed: number, dirs: Edge[]): void => {
    for (const d of dirs) {
      const [dx, dy] = STEP[d];
      const long = len + Math.floor(hash(cx, cy, seed + d.length + dx * 3 + dy * 7) * 3);
      const run: number[] = [];
      for (let k = 1; k <= long; k++) {
        const x = cx + dx * k;
        const y = cy + dy * k;
        const i = y * W + x;
        if (x < 0 || y < 0 || x >= W || y >= f.h || part[i] !== TEMPLE || taken.has(i) || solid.has(i)) break;
        run.push(i);
      }
      if (run.length < 2) continue;
      run.forEach((i, k) => {
        const last = k === run.length - 1;
        const axis = dx !== 0 ? 'x' : 'y';
        const name = last ? `a crack of the rift ending, from ${dx + dy > 0 ? `low ${axis}` : `high ${axis}`}` : `a crack of the rift along ${axis}${k + 1 <= glowTo ? ', glowing' : ''}`;
        cracks.push({ i, name, glow: !last && k + 1 <= glowTo });
        taken.add(i);
      });
    }
  };
  if (hall) {
    // (floor 5's third moment is the rift: game/first5.ts FLOOR_SETS)
    const rift = (L.dress?.moments ?? []).find((m) => m.n === 2 && roomAt(f, Math.floor(m.x), Math.floor(m.y)) === hall);
    const cx = Math.floor(rift ? rift.x : f.boss.x);
    const cy = Math.floor(rift ? rift.y : f.boss.y);
    runFrom(cx, cy, 4, 2, 5101, ['-x', '+x', '-y', '+y']);
  }
  if (ante) runFrom(Math.floor(ante.x + ante.w / 2), Math.floor(ante.y + ante.h / 2), 2, 1, 5103, [hash(ante.x, ante.y, 5105) < 0.5 ? '+x' : '+y']);
  return { part, thresholds, rails, cracks };
}

/** Where a threshold's art is stood from (as a gate's: its doorway's first tile along the wall, at its face line). */
export function thresholdFace(t: Threshold): number {
  return t.line + 1;
}

/**
 * THE MINE'S AND THE TEMPLE'S THINGS, laid last (after the floor's own pieces): the floor's own pieces kept to their own part; the
 * rails' stop on the rails' last end, a cart on them in a room; two braziers inside each threshold; lantern posts in the mine's
 * rooms, braziers in the temple's and two by his gate. What stands is not walked on.
 */
export function layLair(L: Level): void {
  const plan = L.lair;
  if (!plan) return;
  const f = L.floor;
  const W = f.w;
  const partAt = (x: number, y: number): number => plan.part[Math.floor(y) * W + Math.floor(x)];
  // (the floor's own pieces each in its own part: those laid in the other are taken away)
  const wrong = (name: string | undefined, x: number, y: number): boolean => {
    const p = name ? LAIR_PART[name] : undefined;
    if (!p) return false;
    const here = partAt(x, y);
    return here !== 0 && (p === 'mine' ? here !== MINE : here !== TEMPLE);
  };
  const keepProps: PropInst[] = [];
  for (const p of L.props) {
    if (p.kind === 'piece' && wrong(p.name, p.x, p.y)) {
      if (p.solid) L.walk[p.ty * W + p.tx] = f.tiles[p.ty * W + p.tx] === T_FLOOR ? 1 : 0;
      continue;
    }
    keepProps.push(p);
  }
  L.props = keepProps;
  if (L.dress) {
    L.dress.tiles = L.dress.tiles.filter((t) => !wrong(t.name, t.i % W, Math.floor(t.i / W)));
    L.dress.wall = L.dress.wall.filter((w) => {
      const x = w.i % W;
      const y = Math.floor(w.i / W);
      return !wrong(w.name, w.side === 0 ? x : x + 1, w.side === 0 ? y + 1 : y);
    });
    // (none of its own on the rails or the cracks)
    const laid = new Set<number>([...plan.rails.map((r) => r.i), ...plan.cracks.map((c) => c.i)]);
    L.dress.tiles = L.dress.tiles.filter((t) => !laid.has(t.i));
  }
  const taken = new Uint8Array(W * f.h);
  for (const p of L.props) taken[p.ty * W + p.tx] = 1;
  for (const r of plan.rails) taken[r.i] = 2;
  const plain = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < f.h && f.tiles[y * W + x] === T_FLOOR && !(f.cut && f.cut[y * W + x] !== 0) && !(f.height && f.height[y * W + x] !== 0) && L.walk[y * W + x] === 1;
  const keep = (x: number, y: number): boolean => {
    if (Math.hypot(x + 0.5 - f.start.x, y + 0.5 - f.start.y) < 2.5) return true;
    const w = L.ways?.way;
    if (w && Math.hypot(x + 0.5 - w.x, y + 0.5 - w.y) < 2.2) return true;
    if (Math.hypot(x + 0.5 - f.boss.x, y + 0.5 - f.boss.y) < 3.5) return true;
    const sh = L.ways?.shaft;
    if (sh && Math.abs(x - sh.x) <= 2 && Math.abs(y - sh.y) <= 2) return true;
    for (const d of L.doors) {
      const along = d.spot.alongX ? x : y;
      const inside = Math.abs((d.spot.alongX ? y : x) - d.spot.plane + 0.5);
      if (along >= d.spot.a - 1 && along <= d.spot.a + 3 && inside < 2.6) return true;
    }
    for (const t of plan.thresholds) {
      const along = t.alongX ? x : y;
      const across = (t.alongX ? y : x) - t.line;
      if (along >= t.a - 1 && along <= t.a + 3 && Math.abs(across) <= 2) return true;
    }
    return false;
  };
  const open = (x: number, y: number): boolean => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (!plain(x + dx, y + dy)) return false;
    return true;
  };
  const put = (name: string, x: number, y: number, solid: boolean): void => {
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    L.props.push({ kind: 'piece', name, tx, ty, x, y, solid, state: 0, variant: 0 });
    taken[ty * W + tx] = 1;
    if (solid) L.walk[ty * W + tx] = 0;
  };
  const free = (x: number, y: number): boolean => plain(x, y) && !taken[y * W + x] && !keep(x, y);
  // THE RAILS' STOP on their last end; a cart on a straight run of them in a room, open all round
  const R = plan.rails;
  if (R.length) {
    const last = R[R.length - 1];
    const ax = last.name.includes('x') ? 'along x' : 'along y';
    put(`the rails' stop, ${ax}`, (last.i % W) + 0.5, Math.floor(last.i / W) + 0.5, false);
    taken[last.i] = 1;
    const at = R.slice(Math.floor(R.length * 0.35)).find((r) => (r.name === 'rails along x' || r.name === 'rails along y') && !!roomAt(f, r.i % W, Math.floor(r.i / W)) && open(r.i % W, Math.floor(r.i / W)) && !keep(r.i % W, Math.floor(r.i / W)));
    if (at) put(`a cart on the rails, ${at.name === 'rails along x' ? 'along x' : 'along y'}`, (at.i % W) + 0.5, Math.floor(at.i / W) + 0.5, true);
  }
  // TWO BRAZIERS just inside the temple at each threshold, either side of its way (a quarter of a tile in from its ends, half a
  // tile into the room)
  for (const t of plan.thresholds) {
    const inside = t.temple > 0 ? t.line + 1.5 : t.line - 0.5;
    for (const u of [t.a + 0.25, t.a + 2.75]) {
      const [x, y] = t.alongX ? [u, inside] : [inside, u];
      if (plain(Math.floor(x), Math.floor(y)) && !taken[Math.floor(y) * W + Math.floor(x)]) put('a brazier', x, y, true);
    }
  }
  // LANTERN POSTS, one or two in each room of the mine; BRAZIERS, two to four in each of the temple's (his hall's by his gate)
  const hall = f.rooms.find((r) => r.kind === 'boss') ?? null;
  for (const r of f.rooms) {
    const isTemple = partAt(r.x + r.w / 2, r.y + r.h / 2) === TEMPLE;
    const want = isTemple ? (r === hall ? 2 : 2 + Math.floor(hash(r.x, r.y, 5107) * 3)) : 1 + Math.floor(hash(r.x, r.y, 5109) * 2);
    const spots: [number, number][] = [];
    for (let y = r.y + 1; y < r.y + r.h - 1; y++) for (let x = r.x + 1; x < r.x + r.w - 1; x++) if (free(x, y) && open(x, y)) spots.push([x, y]);
    // (his hall's two by his gate: the two nearest it)
    const gate = r === hall ? L.doors.find((d) => d.spot.kind === 'bossgate') ?? null : null;
    if (gate) {
      const gx = gate.spot.alongX ? gate.spot.a + 1.5 : gate.spot.plane;
      const gy = gate.spot.alongX ? gate.spot.plane : gate.spot.a + 1.5;
      spots.sort((p, q) => Math.hypot(p[0] - gx, p[1] - gy) - Math.hypot(q[0] - gx, q[1] - gy));
    } else spots.sort((p, q) => hash(p[0], p[1], 5111) - hash(q[0], q[1], 5111));
    const laid: [number, number][] = [];
    for (const [x, y] of spots) {
      if (laid.length >= want) break;
      if (laid.some(([u, v]) => Math.hypot(u - x, v - y) < (gate ? 2.5 : 4))) continue;
      if (!free(x, y) || !open(x, y)) continue;
      laid.push([x, y]);
      put(isTemple ? 'a brazier' : 'a lantern post', x + 0.5, y + 0.5, true);
    }
  }
}
