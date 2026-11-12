// FLOOR 4, THE BURIED CHAPEL OF BONES, DRAWN (the art chat's pictures, art/chapel.ts: his “A with B's break-in (Recommended)”, 2 Nov
// 2026, and his “Yes, hand it over (Recommended)”; behind CHAPEL, off until his yes to it in play). As the art chat's README lays it
// out (docs/mockups/floor4_look/README.md, "How to bring it in"):
//   - THE FLOOR: the worn flags; grave slabs down the middle of the rooms (two tiles long in the bigger ones, one in the smaller),
//     bone dust at the feet of the walls that stand and in drifts, bone chips here and there; the rubble and the earth spilled
//     before each break-in;
//   - THE WALLS: the chapel's, its niches full of the dead and their candles burning (four frames, about 6 a second); his hall's
//     own ring of wall, fuller; the way in from floor 3 and the break-ins standing in place of their three tiles of wall;
//   - THE LIGHT: its candlelit dark, 0.76; a candle's light at every tile of wall drawn, the candles on the floor, the cult's
//     altar as a brazier, the way in's firelight up its stair, the miners' lanterns at the break-ins.
// Where the way in and the break-ins are, and what stands on the floor of its own, is the rules' (game/chapel_way.ts).

import { forgetGraded as forgetChapelGraded } from '../art/chapel';
import { CHAPEL, CHAPEL_LIGHTS, chapelStretchSteps, gradedA, makeChapelArt } from '../art/chapel';
import type { ChapelArt } from '../art/chapel';
import { floorLook } from '../art/floors';
import { WALL_LOOK } from '../art/ground';
import { hash } from '../art/kit';
import type { Sprite } from '../engine/px';
import { stretchAnchor, stretchTiles } from '../game/chapel_way';
import { T_FLOOR, T_WALL } from '../game/types';
import type { DoorSpot, Room } from '../game/types';
import type { Level } from '../game/state';
import { gradeOnPage } from './looks';
import type { LookLight, LookStand, LookView } from './looks';
import { wallFaces, wallsAway } from './walls';
import type { LoadStep } from '../engine/steps';

interface Laid {
  tiles: Map<number, Sprite[]>;
  hall: Room | null;
  /** The wall tiles that a stretch's picture takes the place of, and which face. */
  stretched: Map<number, boolean>;
  stretches: { s: DoorSpot; way: boolean }[];
  lights: LookLight[];
}

export class ChapelView implements LookView {
  readonly dark = CHAPEL_LIGHTS.dark;
  private art: ChapelArt | null = null;
  private cache: Laid | null = null;
  private cacheFor: Level | null = null;
  private gradedMemo = new WeakMap<Sprite, Sprite>();

  /** Its pictures let go (another floor is come into): made again if it is come back to. His words, 4 Nov 2026, 08:12: “I don’t know if my phone is getting to hot or whatever but it’s crashing every couple of levels” (render.ts forgetLooks). */
  forget(): void {
    forgetChapelGraded();
    this.art = null;
    this.cache = null;
    this.cacheFor = null;
    this.gradedMemo = new WeakMap();
  }

  on(L: Level): boolean {
    return CHAPEL.on && !L.town && L.floor.depth >= 1 && floorLook(L.floor.depth) === 4 && !!L.dress;
  }
  warm(): void {
    this.A();
  }
  /** (main.ts LOAD_SLICE) Ahead of its first drawing: the mine's break-ins and the way in this level has, a frame a step (art/chapel.ts chapelStretchSteps). */
  steps(L: Level): LoadStep[] {
    const out: LoadStep[] = [];
    if (L.chapel?.wayIn) out.push(...chapelStretchSteps(L.chapel.wayIn.alongX, true));
    for (const b of L.chapel?.breaks ?? []) out.push(...chapelStretchSteps(b.alongX, false));
    return out;
  }
  private A(): ChapelArt {
    return (this.art ??= makeChapelArt());
  }
  private tileNamed(n: string): Sprite[] {
    return this.A().tiles.find((q) => q.name === n)?.frames ?? [];
  }

  private of(L: Level): Laid {
    if (this.cacheFor === L && this.cache) return this.cache;
    this.cacheFor = L;
    const f = L.floor;
    const W = f.w;
    const tiles = new Map<number, Sprite[]>();
    const isFloor = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < f.h && f.tiles[y * W + x] === T_FLOOR && !(f.cut && f.cut[y * W + x] !== 0);
    const isWall = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < f.h && f.tiles[y * W + x] === T_WALL;
    const solidAt = new Set<number>();
    for (const p of L.props) if (p.solid) solidAt.add(p.ty * W + p.tx);
    const taken = (i: number): boolean => tiles.has(i) || !!L.dress?.tiles.some((t) => t.i === i);
    const hall = f.rooms.find((r) => r.kind === 'boss') ?? null;
    const stretches: { s: DoorSpot; way: boolean }[] = [];
    if (L.chapel?.wayIn) stretches.push({ s: L.chapel.wayIn, way: true });
    for (const b of L.chapel?.breaks ?? []) stretches.push({ s: b, way: false });
    const stretched = new Map<number, boolean>();
    for (const q of stretches) for (const i of stretchTiles(f, q.s)) stretched.set(i, q.s.alongX);
    // WHERE THE MINE BROKE IN: its rubble on the three tiles at the wall's foot, the earth spilled on the row out from them
    for (const q of stretches) {
      if (q.way) continue;
      const s = q.s;
      const w = s.alongX ? 'along x' : 'along y';
      for (let k = -1; k <= 3; k++) {
        for (const d of [0, 1]) {
          if (d === 0 && (k < 0 || k > 2)) continue;
          const [x, y] = s.alongX ? [s.a + k, s.plane + d] : [s.plane + d, s.a + k];
          if (isFloor(x, y) && !solidAt.has(y * W + x)) tiles.set(y * W + x, this.tileNamed(d === 0 ? `rubble from the break, ${w}` : `earth spilled from the break, ${w}`));
        }
      }
    }
    // GRAVE SLABS down the middle of the rooms: two tiles long along a room at least six across, a tile and a gap between; one
    // tile in a smaller room, here and there
    for (const r of f.rooms) {
      const alongX = r.w >= r.h;
      const len = alongX ? r.w : r.h;
      const wide = alongX ? r.h : r.w;
      const mid = (alongX ? r.y : r.x) + Math.floor(wide / 2);
      const at = (k: number): [number, number] => (alongX ? [r.x + k, mid] : [mid, r.y + k]);
      const free = (x: number, y: number): boolean => isFloor(x, y) && !taken(y * W + x) && !solidAt.has(y * W + x) && L.walk[y * W + x] === 1;
      if (wide >= 6 && len >= 6) {
        for (let k = 2; k + 1 < len - 1; k += 3) {
          const [x0, y0] = at(k);
          const [x1, y1] = at(k + 1);
          if (!free(x0, y0) || !free(x1, y1)) continue;
          const w = alongX ? 'along x' : 'along y';
          tiles.set(y0 * W + x0, this.tileNamed(`a grave slab ${w}, its head`));
          tiles.set(y1 * W + x1, this.tileNamed(`a grave slab ${w}, its foot`));
        }
      } else {
        for (let k = 1; k < len - 1; k += 2) {
          const [x, y] = at(k);
          if (free(x, y) && hash(x, y, 4401) < 0.4) tiles.set(y * W + x, this.tileNamed('a grave slab'));
        }
      }
    }
    // BONE DUST at the feet of the walls that stand (thick at the wall), in drifts in the open; chips here and there
    const away = wallsAway(f, WALL_LOOK);
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (!isFloor(x, y) || taken(i) || solidAt.has(i)) continue;
        const h = hash(x, y, 4403);
        const wallX = isWall(x, y - 1) && !away[(y - 1) * W + x] && !stretched.has((y - 1) * W + x);
        const wallY = isWall(x - 1, y) && !away[y * W + x - 1] && !stretched.has(y * W + x - 1);
        if (wallX && h < 0.3) tiles.set(i, this.tileNamed('bone dust at a wall along x'));
        else if (wallY && h < 0.3) tiles.set(i, this.tileNamed('bone dust at a wall along y'));
        else if (h > 0.985) tiles.set(i, this.tileNamed('bone dust'));
        else if (h > 0.955) tiles.set(i, this.tileNamed('bone chips'));
      }
    }
    // THE LIGHT: a candle's light at every tile of wall that is drawn (the niches' candles), at the foot of its face under its
    // middle; fuller in his hall
    const lights: LookLight[] = [];
    const inHall = (x: number, y: number): boolean => !!hall && x >= hall.x && y >= hall.y && x < hall.x + hall.w && y < hall.y + hall.h;
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (f.tiles[i] !== T_WALL || away[i]) continue;
        const which = wallFaces(f, i);
        for (const side of [0, 1] as const) {
          if (!(which & (side === 0 ? 1 : 2)) || (stretched.has(i) && stretched.get(i) === (side === 0))) continue;
          const fx = side === 0 ? x : x + 1;
          const fy = side === 0 ? y + 1 : y;
          const N = inHall(fx, fy) ? CHAPEL_LIGHTS.hallNiche : CHAPEL_LIGHTS.niche;
          lights.push({ x: side === 0 ? x + 0.5 : x + 1, y: side === 0 ? y + 1 : y + 0.5, up: N.up, r: N.r, strength: N.strength, glow: { ...N.glow } });
        }
      }
    }
    // the candles on the floor, the cult's altar (as a brazier), the way in and the miners' lanterns (their pictures' own light)
    for (const p of L.props) {
      if (p.kind !== 'piece' || !p.name) continue;
      if (p.name.startsWith('candles on the floor')) {
        const C = CHAPEL_LIGHTS.floorCandles;
        lights.push({ x: p.x, y: p.y, up: C.up, r: C.r, strength: C.strength, glow: null });
      } else if (p.name === "the cult's altar") lights.push({ x: p.x, y: p.y, up: 14, r: 62, strength: 0.9, glow: null });
    }
    for (const q of stretches) {
      const A = stretchAnchor(q.s);
      const pic = (q.way ? this.A().wayIn(q.s.alongX) : this.A().breakIn(q.s.alongX)).frames[0];
      const l = pic.lights?.[0];
      const C = q.way ? CHAPEL_LIGHTS.wayIn : CHAPEL_LIGHTS.lantern;
      // (the hole where its picture's light is; its glow is the picture's own)
      lights.push({ x: A.x, y: A.y, up: l ? pic.ay - l.y : 'up' in C ? C.up : 30, dx: l ? l.x - pic.ax : 0, r: C.r, strength: C.strength, glow: null });
    }
    this.cache = { tiles, hall, stretched, stretches, lights };
    return this.cache;
  }

  laid(L: Level, tx: number, ty: number, t: number): Sprite | null {
    const laid = this.of(L).tiles.get(ty * L.floor.w + tx);
    return laid && laid.length ? laid[Math.floor(t * 6 + hash(tx, ty, 4405) * 4) % laid.length] : null;
  }

  flags(tx: number, ty: number): Sprite {
    return this.A().floor(tx, ty);
  }

  face(L: Level, left: boolean, tx: number, ty: number, t: number): Sprite {
    const C = this.of(L);
    const A = this.A();
    const fr = Math.floor(t * 6 + hash(tx, ty, 4407) * 4) % 4;
    const H = C.hall;
    if (H && tx >= H.x - 1 && ty >= H.y - 1 && tx <= H.x + H.w && ty <= H.y + H.h) {
      const k = (((left ? tx : ty) % 4) + 4) % 4;
      return (left ? A.hall.faceLeft : A.hall.faceRight)[k][fr];
    }
    return A.face(left, tx, ty, fr);
  }

  unfaced(L: Level, i: number, which: number): number {
    const a = this.of(L).stretched.get(i);
    return a === undefined ? which : which & (a ? ~1 : ~2);
  }

  graded(s: Sprite): Sprite {
    const hit = this.gradedMemo.get(s);
    if (hit) return hit;
    const out = gradeOnPage(s, gradedA);
    this.gradedMemo.set(s, out);
    return out;
  }

  lights(L: Level): readonly LookLight[] {
    return this.of(L).lights;
  }

  /** The way in and the break-ins, each in place of its three tiles of wall, its frame by time; sorted at the wall's face. */
  stands(L: Level, t: number): readonly LookStand[] {
    const out: LookStand[] = [];
    const A = this.A();
    for (const q of this.of(L).stretches) {
      const at = stretchAnchor(q.s);
      const frames = (q.way ? A.wayIn(q.s.alongX) : A.breakIn(q.s.alongX)).frames;
      out.push({ x: at.x, y: at.y, s: frames[Math.floor(t * 6) % frames.length], d: at.x + at.y - 1.49 });
    }
    return out;
  }
}
