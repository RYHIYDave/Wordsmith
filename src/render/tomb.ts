// FLOOR 1, THE KING'S TOMB, THE ROOTS BREAKING IN, DRAWN (the art chat's pictures, art/tomb.ts: his “Tomb with daylight
// (Recommended)”, “B, roots break in” and “Yes, hand it over (Recommended)”, 2 Nov 2026; behind TOMB, off until his yes to it in
// play). As the art chat's README lays it out (docs/mockups/floor1_look/README.md, "How to bring it in"):
//   - THE FLOOR: the tomb's flags; the roots out from the feet of the walls (a run a tile at a time, a bend, an end), two or three a
//     room and more in his hall, out of its middle; a puddle here and there, water dripping into it; moss on a tile in ten; fallen
//     leaves; the grave slabs in pairs down the rooms;
//   - THE DAYLIGHT: many small shafts, one to every eight to twelve tiles of floor in every room, a few in his hall; each a pool on
//     the floor and a column of lit air, both drawn added, as light is; and the town's daylight down the stairs onto the first room;
//   - THE WALLS: the tomb's bays, his hall's own; THE ARCHWAYS in every doorway left open between the rooms, the wall either side of
//     its way its own;
//   - THE LIGHT: its cool day-lit dark, 0.5, the brightest floor; a hole where each shaft falls and up its column; the cressets as
//     braziers; the stone of every wall that stands lit low.
// What stands of its own (the tombs) is the rules' (game/tomb_way.ts).

import { ROOT_TILES, SHAFTS, TOMB, TOMB_LIGHTS, gradeColour, makeTombArt } from '../art/tomb';
import type { TombArt } from '../art/tomb';
import { floorLook } from '../art/floors';
import { STRIP } from '../art/gates';
import { WALL_LOOK } from '../art/ground';
import { hash } from '../art/kit';
import type { Sprite } from '../engine/px';
import { doorMiddle, doorTiles } from '../game/doors';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Room } from '../game/types';
import type { Level } from '../game/state';
import { gradeOnPage } from './looks';
import type { LookLight, LookStand, LookView } from './looks';
import { WHOLE_WALLS, wallFaces, wallsAway, wholeFaces } from './walls';

type Edge = '-x' | '+x' | '-y' | '+y';
const STEP: Record<Edge, [number, number]> = { '-x': [-1, 0], '+x': [1, 0], '-y': [0, -1], '+y': [0, 1] };
const BACK: Record<Edge, Edge> = { '-x': '+x', '+x': '-x', '-y': '+y', '+y': '-y' };
type Size = keyof typeof SHAFTS;

interface Laid {
  tiles: Map<number, Sprite[]>;
  hall: Room | null;
  covered: Map<number, boolean>;
  /** The archways' strips (stood, as a gate's arch is), the drips over the puddles. */
  stands: LookStand[];
  drips: { x: number; y: number }[];
  /** The shafts of daylight: where each falls, its size. */
  shafts: { x: number; y: number; size: Size }[];
  /** The town's daylight down the stairs onto the first room's floor: where its pool lies. */
  stairPool: { x: number; y: number } | null;
  lights: LookLight[];
}

export class TombView implements LookView {
  readonly dark = TOMB_LIGHTS.dark.a;
  readonly tint = TOMB_LIGHTS.dark.rgb;
  private art: TombArt | null = null;
  private cache: Laid | null = null;
  private cacheFor: Level | null = null;
  private gradedMemo = new WeakMap<Sprite, Sprite>();

  on(L: Level): boolean {
    return TOMB.on && !L.town && L.floor.depth >= 1 && floorLook(L.floor.depth) === 1 && !!L.dress;
  }
  warm(): void {
    this.A();
  }
  private A(): TombArt {
    return (this.art ??= makeTombArt());
  }
  private tileNamed(n: string): Sprite[] {
    return this.A().tiles.find((q) => q.name === n)?.frames ?? [];
  }
  private piece(n: string): Sprite[] {
    return this.A().pieces.find((q) => q.name === n)?.frames ?? [];
  }

  private of(L: Level): Laid {
    if (this.cacheFor === L && this.cache) return this.cache;
    this.cacheFor = L;
    const f = L.floor;
    const W = f.w;
    const A = this.A();
    const tiles = new Map<number, Sprite[]>();
    const lights: LookLight[] = [];
    const stands: LookStand[] = [];
    const isFloor = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < f.h && f.tiles[y * W + x] === T_FLOOR && !(f.cut && f.cut[y * W + x] !== 0) && !(f.height && f.height[y * W + x] !== 0);
    const isWall = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < f.h && f.tiles[y * W + x] === T_WALL;
    const solidAt = new Set<number>();
    for (const p of L.props) if (p.solid) solidAt.add(p.ty * W + p.tx);
    const dressed = new Set<number>((L.dress?.tiles ?? []).map((t) => t.i));
    const doorAt = new Set<number>();
    for (const d of L.doors) for (const i of doorTiles(f, d.spot)) doorAt.add(i);
    const free = (x: number, y: number): boolean => isFloor(x, y) && !tiles.has(y * W + x) && !dressed.has(y * W + x) && !solidAt.has(y * W + x) && !doorAt.has(y * W + x);
    const hall = f.rooms.find((r) => r.kind === 'boss') ?? null;
    const inRoom = (r: Room, x: number, y: number): boolean => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
    const nearBoss = (x: number, y: number): boolean => Math.hypot(x + 0.5 - f.boss.x, y + 0.5 - f.boss.y) < 3.5;
    // THE ARCHWAYS: every doorway left open in a room's wall (no door nor gate in it), three tiles of way
    const covered = new Map<number, boolean>();
    const seen = new Set<string>();
    for (const r of f.rooms) {
      const lines: { alongX: boolean; line: number; from: number; len: number }[] = [
        { alongX: true, line: r.y - 1, from: r.x, len: r.w },
        { alongX: true, line: r.y + r.h, from: r.x, len: r.w },
        { alongX: false, line: r.x - 1, from: r.y, len: r.h },
        { alongX: false, line: r.x + r.w, from: r.y, len: r.h },
      ];
      for (const w of lines) {
        const at = (k: number): number => (w.alongX ? w.line * W + k : k * W + w.line);
        let k = w.from;
        while (k < w.from + w.len) {
          const i = at(k);
          if (f.tiles[i] !== T_FLOOR || doorAt.has(i)) {
            k++;
            continue;
          }
          let e = k;
          while (e < w.from + w.len && f.tiles[at(e)] === T_FLOOR && !doorAt.has(at(e))) e++;
          const run = e - k;
          if (run >= 3 && run <= 4) {
            const a = k + Math.floor((run - 3) / 2);
            const id = `${w.alongX}:${w.line}:${a}`;
            if (!seen.has(id)) {
              seen.add(id);
              const face = w.line + 1;
              for (const q of A.archway(w.alongX)) {
                const [x, y] = w.alongX ? [a + q.t, face] : [face, a + q.t];
                stands.push({ x, y, s: q.s, d: x + y + STRIP / 64 });
              }
              for (const c of [a - 1, a + 3]) {
                const [x, y] = w.alongX ? [c, w.line] : [w.line, c];
                if (isWall(x, y)) covered.set(y * W + x, w.alongX);
              }
            }
          }
          k = e;
        }
      }
    }
    // THE ROOTS: out from the feet of the walls, a run straight out, perhaps a bend, an end; two or three a room, more in his hall
    const rootName = (a: Edge, b: Edge | null): string => {
      if (!b) {
        const axis = a[1];
        return `a root's end, from ${a[0] === '-' ? 'low' : 'high'} ${axis}`;
      }
      const hit = ROOT_TILES.find(([, p, q]) => q !== null && ((p === a && q === b) || (p === b && q === a)));
      return hit ? hit[0] : 'a root along x';
    };
    for (const r of f.rooms) {
      const want = r === hall ? 5 : 2 + Math.floor(hash(r.x, r.y, 6201) * 2);
      const feet: [number, number, Edge][] = [];
      for (let x = r.x; x < r.x + r.w; x++) if (isWall(x, r.y - 1)) feet.push([x, r.y, '-y']);
      for (let y = r.y; y < r.y + r.h; y++) if (isWall(r.x - 1, y)) feet.push([r.x, y, '-x']);
      feet.sort((p, q) => hash(p[0], p[1], 6203) - hash(q[0], q[1], 6203));
      let made = 0;
      for (const [x0, y0, from] of feet) {
        if (made >= want) break;
        if (!free(x0, y0)) continue;
        const long = 3 + Math.floor(hash(x0, y0, 6205) * 4);
        const bendAt = hash(x0, y0, 6207) < 0.6 ? 1 + Math.floor(hash(x0, y0, 6209) * (long - 1)) : -1;
        const turn: Edge = from === '-y' ? (hash(x0, y0, 6211) < 0.5 ? '+x' : '-x') : hash(x0, y0, 6211) < 0.5 ? '+y' : '-y';
        const path: { x: number; y: number; in: Edge; out: Edge | null }[] = [];
        let x = x0;
        let y = y0;
        let inE: Edge = from;
        let dir: Edge = BACK[from];
        for (let k = 0; k < long; k++) {
          if (!free(x, y) || !inRoom(r, x, y) || (r === hall && nearBoss(x, y))) break;
          if (k === bendAt) dir = turn;
          path.push({ x, y, in: inE, out: dir });
          const [dx, dy] = STEP[dir];
          x += dx;
          y += dy;
          inE = BACK[dir];
        }
        if (path.length < 2) continue;
        path[path.length - 1].out = null;
        for (const p of path) tiles.set(p.y * W + p.x, this.tileNamed(rootName(p.in, p.out)));
        made++;
      }
    }
    // THE GRAVE SLABS in pairs down the middle of the bigger rooms
    for (const r of f.rooms) {
      if (r === hall) continue;
      const alongX = r.w >= r.h;
      const len = alongX ? r.w : r.h;
      const wide = alongX ? r.h : r.w;
      if (wide < 5 || len < 6) continue;
      const mid = (alongX ? r.y : r.x) + Math.floor(wide / 2);
      const w = alongX ? 'along x' : 'along y';
      for (let k = 2; k + 1 < len - 1; k += 3) {
        const [x0, y0] = alongX ? [r.x + k, mid] : [mid, r.y + k];
        const [x1, y1] = alongX ? [x0 + 1, y0] : [x0, y0 + 1];
        if (!free(x0, y0) || !free(x1, y1) || hash(x0, y0, 6213) < 0.25) continue;
        tiles.set(y0 * W + x0, this.tileNamed(`a grave slab ${w}, its head`));
        tiles.set(y1 * W + x1, this.tileNamed(`a grave slab ${w}, its foot`));
      }
    }
    // THE DAYLIGHT: many small shafts in every room, a few in his hall off its middle; leaves and earth under some
    const shafts: { x: number; y: number; size: Size }[] = [];
    for (const r of f.rooms) {
      const area = r.w * r.h;
      const want = r === hall ? 3 + Math.floor(hash(r.x, r.y, 6215) * 2) : Math.max(1, Math.round(area / (8 + hash(r.x, r.y, 6217) * 4)));
      const spots: [number, number][] = [];
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (isFloor(x, y) && !solidAt.has(y * W + x) && !(r === hall && nearBoss(x, y))) spots.push([x, y]);
      spots.sort((p, q) => hash(p[0], p[1], 6219) - hash(q[0], q[1], 6219));
      const laid: [number, number][] = [];
      for (const [x, y] of spots) {
        if (laid.length >= want) break;
        if (laid.some(([u, v]) => Math.hypot(u - x, v - y) < 2.6)) continue;
        laid.push([x, y]);
        const h = hash(x, y, 6221);
        const size: Size = h < 0.47 ? 'small' : h < 0.92 ? 'middle' : 'large';
        shafts.push({ x: x + 0.5, y: y + 0.5, size });
        if (free(x, y) && hash(x, y, 6223) < 0.35) tiles.set(y * W + x, this.tileNamed('fallen leaves and earth'));
      }
    }
    // PUDDLES with water dripping into them; MOSS on a tile in ten; FALLEN LEAVES about
    const drips: { x: number; y: number }[] = [];
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < W; x++) {
        if (!free(x, y)) continue;
        const h = hash(x, y, 6225);
        if (h < 0.016) {
          tiles.set(y * W + x, this.tileNamed('a puddle'));
          drips.push({ x: x + 0.5, y: y + 0.5 });
        } else if (h < 0.11) tiles.set(y * W + x, this.tileNamed('moss'));
        else if (h < 0.14) tiles.set(y * W + x, this.tileNamed('fallen leaves'));
      }
    }
    // THE TOWN'S DAYLIGHT down the stairs, onto the first room's floor
    let stairPool: { x: number; y: number } | null = null;
    const gate = L.ways && L.ways.gate >= 0 ? L.doors[L.ways.gate] : null;
    if (gate) {
      const m = doorMiddle(gate.spot);
      const into = TOMB_LIGHTS.stairs.into + 0.5;
      stairPool = gate.spot.alongX ? { x: m.x, y: m.y - gate.spot.out * into } : { x: m.x - gate.spot.out * into, y: m.y };
      const S = TOMB_LIGHTS.stairs;
      lights.push({ x: stairPool.x, y: stairPool.y, up: S.up, r: S.r, strength: S.strength, glow: { ...S.glow } });
    }
    // THE LIGHT: each shaft (where it falls, up its column, its glow), the cressets, the stone of every wall that stands
    const SH = TOMB_LIGHTS.shaft;
    for (const q of shafts) {
      lights.push({ x: q.x, y: q.y, up: 0, r: SH[q.size].r, strength: SH[q.size].strength, glow: { ...SH.glow } });
      lights.push({ x: q.x, y: q.y, up: SH.column.up, dx: -10, r: SH.column.r, strength: SH.column.strength, glow: null });
    }
    for (const p of L.props) {
      if (p.kind === 'piece' && p.name === 'cresset') {
        const C = TOMB_LIGHTS.cresset;
        lights.push({ x: p.x, y: p.y, up: C.up, r: C.r, strength: C.strength, glow: null });
      }
    }
    const whole = WHOLE_WALLS.on && WALL_LOOK.faces;
    const away = whole ? null : wallsAway(f, WALL_LOOK);
    const WL = TOMB_LIGHTS.wall;
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (f.tiles[i] !== T_WALL || (away && away[i])) continue;
        const which = whole ? wholeFaces(f, i) : wallFaces(f, i);
        if (which & 1) lights.push({ x: x + 0.5, y: y + 1, up: WL.up, r: WL.r, strength: WL.strength, glow: null });
        if (which & 2) lights.push({ x: x + 1, y: y + 0.5, up: WL.up, r: WL.r, strength: WL.strength, glow: null });
      }
    }
    this.cache = { tiles, hall, covered, stands, drips, shafts, stairPool, lights };
    return this.cache;
  }

  laid(L: Level, tx: number, ty: number, t: number): Sprite | null {
    const laid = this.of(L).tiles.get(ty * L.floor.w + tx);
    return laid && laid.length ? laid[Math.floor(t * 6 + hash(tx, ty, 6227) * 4) % laid.length] : null;
  }

  flags(tx: number, ty: number): Sprite {
    return this.A().floor(tx, ty);
  }

  face(L: Level, left: boolean, tx: number, ty: number, t: number): Sprite {
    const C = this.of(L);
    const A = this.A();
    const fr = Math.floor(t * 6 + hash(tx, ty, 6229) * 4) % 4;
    const H = C.hall;
    const fx = left ? tx : tx + 1;
    const fy = left ? ty + 1 : ty;
    if (H && fx >= H.x && fy >= H.y && fx < H.x + H.w && fy < H.y + H.h) {
      const k = (((left ? tx : ty) % 8) + 8) % 8;
      return (left ? A.hall.faceLeft : A.hall.faceRight)[k][fr];
    }
    return A.face(left, tx, ty, fr);
  }

  unfaced(L: Level, i: number, which: number): number {
    const a = this.of(L).covered.get(i);
    return a === undefined ? which : which & (a ? ~1 : ~2);
  }

  graded(s: Sprite): Sprite {
    const hit = this.gradedMemo.get(s);
    if (hit) return hit;
    const out = gradeOnPage(s, gradeColour);
    this.gradedMemo.set(s, out);
    return out;
  }

  lights(L: Level): readonly LookLight[] {
    return this.of(L).lights;
  }

  /** The archways; the water dripping over the puddles; the shafts' columns of lit air, added, a little before what stands in them. */
  stands(L: Level, t: number): readonly LookStand[] {
    const C = this.of(L);
    const out: LookStand[] = [...C.stands];
    const drip = this.piece('water dripping');
    if (drip.length) for (const q of C.drips) out.push({ x: q.x, y: q.y, s: drip[Math.floor(t * 8 + hash(Math.floor(q.x), Math.floor(q.y), 6231) * drip.length) % drip.length] });
    for (const q of C.shafts) {
      const air = this.piece(`a shaft of daylight, ${q.size}`);
      if (air.length) out.push({ x: q.x, y: q.y, s: air[Math.floor(t * 4 + hash(Math.floor(q.x), Math.floor(q.y), 6233) * 4) % air.length], d: q.x + q.y - 0.7, add: true });
    }
    return out;
  }

  /** The shafts' pools of daylight on the floor, and the town's down the stairs: added, with the floor. */
  flats(L: Level, _t: number): readonly LookStand[] {
    const C = this.of(L);
    const out: LookStand[] = [];
    for (const q of C.shafts) {
      const pool = this.piece(`daylight on the floor, ${q.size}`);
      if (pool.length) out.push({ x: q.x, y: q.y, s: pool[0], add: true });
    }
    if (C.stairPool) {
      const pool = this.piece('daylight on the floor, large');
      if (pool.length) out.push({ x: C.stairPool.x, y: C.stairPool.y, s: pool[0], add: true });
    }
    return out;
  }
}
