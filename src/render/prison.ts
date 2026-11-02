// FLOOR 3, THE BLACK IRON PRISON, DRAWN (the art chat's pictures, art/prison.ts, his “B, torchlit dark (Recommended)”, 2 Nov 2026, and
// his “Yes, hand it over (Recommended)”; behind PRISON, off until his yes to it in play). What the renderer asks of it (render.ts), as
// the art chat's README ("How to bring it in") lays it out:
//   - `floor`: the dark flags of every floor tile of floor 3; and where the prison's own tiles lie, those: grates (now and then one
//     glowing, the fire under it flickering), soot under the fire baskets, rust stains by the walls, a drain, straw before the
//     cells' doors; in HIS HALL (flat), the great grate four tiles each way under where he stands, glowing, its iron ring and his
//     ball's grooves round it;
//   - `face`: the prison's wall for every face of floor 3 (the ribs every two tiles); on each cell block's back wall, between its
//     real cells' doorways, a cell's front three tiles long (bars, a door, the cell seen through them); his hall's own ring of wall;
//   - `baskets`: more fire baskets than the floor's own dressing lays (look B has them every few tiles: on the cell blocks' back
//     walls between the cells, and on his hall's walls), stood in the walls' faces;
//   - `lights`: where the dark is cut (render.ts light): each fire basket, each glowing grate, the great grate; and THE DARK, 0.8.
// The pieces (floor 3's own in look B's colours, and the prison's chains) are art/floors.ts lookPieces's, with PRISON on.

import { GREAT, HALL_RINGS, PRISON, PRISON_LIGHTS, gradedB, makePrisonArt } from '../art/prison';
import type { PrisonArt } from '../art/prison';
import { floorLook } from '../art/floors';
import type { Piece } from '../art/floorkit';
import type { Sprite } from '../engine/px';
import { hash } from '../art/kit';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor, Room } from '../game/types';
import type { Level } from '../game/state';
import { EXIT_LIGHTS, exitSpill } from '../art/prison_exit';
import { channelXY, prisonDoorTiles } from '../game/prison_way';
import { gradeOnPage } from './looks';
import type { LookStand, LookView } from './looks';

/** Where a light burns: its floor point (tiles), how far up from it (game pixels), the hole's radius and strength, its glow. */
export interface PrisonLight {
  x: number;
  y: number;
  up: number;
  r: number;
  strength: number;
  glow: { r: number; color: string; a: number };
}
/** A fire basket stood in a wall face: the wall tile, which face (0 along x, 1 along y). */
interface Basket {
  i: number;
  side: 0 | 1;
}
interface Laid {
  /** The prison's own floor tiles where they lie (by tile index): its frames. */
  tiles: Map<number, Sprite[]>;
  /** The great grate's far corner, and the hall's room. */
  gx: number;
  gy: number;
  hall: Room | null;
  /** The wall tiles that are a cell's front: [k] its place along it, and which face. */
  cells: Map<number, { k: number; alongX: boolean }>;
  /** Fire baskets the prison adds. */
  baskets: Basket[];
  lights: PrisonLight[];
  /** What the prison stands on the floor: the railings along its fire channels, the great chains in his hall (a floor point, depth x + y). */
  stands: { x: number; y: number; s: Sprite }[];
}

export class PrisonView implements LookView {
  /** Look B's deep shadow between its fires (art/prison.ts PRISON_LIGHTS). */
  readonly dark = PRISON_LIGHTS.dark;
  private art: PrisonArt | null = null;
  private cache: Laid | null = null;
  private cacheFor: Level | null = null;

  /** Is the prison to be drawn on this floor (floor 3 of the dungeon, PRISON on)? */
  on(L: Level): boolean {
    return PRISON.on && !L.town && L.floor.depth >= 1 && floorLook(L.floor.depth) === 3 && !!L.dress;
  }

  /** Make its pictures now (as the floor is come into). */
  warm(): void {
    this.A();
  }

  private A(): PrisonArt {
    return (this.art ??= makePrisonArt());
  }

  private tileNamed(n: string): Sprite[] {
    const p = this.A().tiles.find((q) => q.name === n);
    return p?.frames ?? [];
  }

  /** The fire basket's picture for a face (the floor's own, in look B's colours). */
  private basketPiece(): Piece | undefined {
    return this.A().pieces.find((p) => p.name === 'fire basket');
  }

  /** What the prison lays on this level, worked out once a level. */
  private of(L: Level): Laid {
    if (this.cacheFor === L && this.cache) return this.cache;
    this.cacheFor = L;
    const f = L.floor;
    const W = f.w;
    const tiles = new Map<number, Sprite[]>();
    const isFloor = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < f.h && f.tiles[y * W + x] === T_FLOOR;
    const isWall = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < f.h && f.tiles[y * W + x] === T_WALL;
    const taken = (i: number): boolean => tiles.has(i) || !!L.dress?.tiles.some((t) => t.i === i);
    const hall = f.rooms.find((r) => r.kind === 'boss') ?? null;
    const gx = Math.floor(f.boss.x) - GREAT / 2;
    const gy = Math.floor(f.boss.y) - GREAT / 2;
    const inHall = (x: number, y: number): boolean => !!hall && x >= hall.x && y >= hall.y && x < hall.x + hall.w && y < hall.y + hall.h;
    const nearHall = (x: number, y: number): boolean => x >= gx - 3 && y >= gy - 3 && x < gx + GREAT + 3 && y < gy + GREAT + 3;
    const solidAt = new Set<number>();
    for (const p of L.props) if (p.solid) solidAt.add(p.ty * W + p.tx);
    const lights: PrisonLight[] = [];
    const B = PRISON_LIGHTS;
    // (the cells' fronts: on each cell block's back wall, three tiles at a time, where no doorway is)
    const cells = new Map<number, { k: number; alongX: boolean }>();
    for (const r of f.rooms) {
      const plan = r as Room & { block?: boolean };
      if (!plan.block) continue;
      const alongX = r.w >= r.h;
      const row = alongX ? r.y - 1 : r.x - 1;
      const len = alongX ? r.w : r.h;
      const at = (k: number): [number, number] => (alongX ? [r.x + k, row] : [row, r.y + k]);
      let k = 1;
      while (k + 3 <= len - 1) {
        const run = [0, 1, 2].map((j) => at(k + j));
        // (the wall whole along the three, the floor before each, no real doorway among them or beside them)
        const ok = run.every(([x, y]) => isWall(x, y) && (alongX ? isFloor(x, y + 1) : isFloor(x + 1, y))) && [at(k - 1), at(k + 3)].every(([x, y]) => isWall(x, y));
        if (ok) {
          run.forEach(([x, y], j) => cells.set(y * W + x, { k: j, alongX }));
          k += 4;
        } else k += 1;
      }
    }
    // THE FIRE CHANNEL down each cell block (game/prison_way.ts): its grated far end, the open run with the bridge over it, its
    // glowing near end; a hole in the dark every second tile of the run, and over each glowing grate; railings on both its rims
    const stands: { x: number; y: number; s: Sprite }[] = [];
    const piece = (n: string): Sprite | null => this.A().pieces.find((q) => q.name === n)?.frames?.[0] ?? null;
    for (const c of L.channels ?? []) {
      const w = c.alongX ? 'along x' : 'along y';
      for (let k = c.a0; k < c.a1; k++) {
        const n = k < c.open0 ? `the channel's grate ${w}` : k >= c.open1 ? `the channel's grate ${w}, glowing` : k === c.bridge ? `the bridge ${w}` : k === c.open0 ? `the open channel ${w}, where it begins` : `the open channel ${w}`;
        for (const j of [0, 1]) {
          const [x, y] = channelXY(c, k, j);
          tiles.set(y * W + x, this.tileNamed(`${n}, its ${j === 0 ? 'far' : 'near'} half`));
        }
        const [mx, my] = c.alongX ? [k + 0.5, c.row + 1] : [c.row + 1, k + 0.5];
        if (k >= c.open1) lights.push({ x: mx, y: my, up: 0, r: B.grate.r, strength: B.grate.strength, glow: { ...B.grate.glow } });
        else if (k >= c.open0 && k !== c.bridge && k % 2 === 0) lights.push({ x: mx, y: my, up: 0, r: B.channel.r, strength: B.channel.strength, glow: { ...B.channel.glow } });
      }
      const rail = piece(c.alongX ? 'railing along x' : 'railing along y');
      const post = piece('railing post');
      for (const rim of [c.row, c.row + 2]) {
        for (const [k0, k1] of [[c.open0, c.bridge], [c.bridge + 1, c.open1]]) {
          if (rail) for (let k = k0; k < k1; k++) stands.push(c.alongX ? { x: k + 0.5, y: rim, s: rail } : { x: rim, y: k + 0.5, s: rail });
          if (post) stands.push(c.alongX ? { x: k1, y: rim, s: post } : { x: rim, y: k1, s: post });
        }
      }
    }
    // (the prison's own tiles over the flags, now and then: grates, some glowing; rust by the walls; a drain; never in his hall's
    // grate, nor where the floor's own are laid, nor under what stands)
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (!isFloor(x, y) || taken(i) || solidAt.has(i) || nearHall(x, y)) continue;
        const h = hash(x, y, 3301);
        const byWall = isWall(x - 1, y) || isWall(x, y - 1);
        if (h < 0.012) {
          tiles.set(i, this.tileNamed('a grate, glowing'));
          lights.push({ x: x + 0.5, y: y + 0.5, up: 0, r: B.grate.r, strength: B.grate.strength, glow: { ...B.grate.glow } });
        } else if (h < 0.03) tiles.set(i, this.tileNamed('a grate'));
        else if (h < 0.04) tiles.set(i, this.tileNamed('a drain'));
        else if (byWall && h < 0.1) tiles.set(i, this.tileNamed('rust stains'));
      }
    }
    // (straw before each real cell's door: the tile inside its doorway)
    for (const r of f.rooms) {
      const plan = r as Room & { cell?: boolean };
      if (!plan.cell) continue;
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (!taken(y * W + x) && !solidAt.has(y * W + x) && hash(x, y, 3303) < 0.35) tiles.set(y * W + x, this.tileNamed('straw before a cell'));
    }
    // FIRE BASKETS: the floor's own (its dressing), and more: on the cell blocks' back walls between the cells' fronts, every few
    // tiles along the long walls, and on his hall's walls; each a hole in the dark, a glow, and soot on the floor before it
    const baskets: Basket[] = [];
    // (FLOOR 3, PRISON_EXIT: the door out the back of his hall: none on its two tiles, one lit either side of it, so that it reads in the fight)
    const ex = L.ways?.exit ?? null;
    const doorAt = new Set(ex ? prisonDoorTiles(f, ex) : []);
    const doorSide = new Set<number>();
    if (ex) for (const k of [ex.a - 1, ex.a + 2]) doorSide.add(ex.alongX ? ex.line * W + k : k * W + ex.line);
    const own = new Set<string>();
    for (const w of L.dress?.wall ?? []) {
      if (w.name === 'fire basket' || w.name === "the jailers' lamp") own.add(`${w.i}:${w.side}`);
      else own.add(`${w.i}:${w.side}:other`);
    }
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < W; x++) {
        if (!isWall(x, y)) continue;
        const i = y * W + x;
        for (const side of [0, 1] as const) {
          // (a face along x is turned to screen-left: the floor before it at y + 1; along y, at x + 1)
          const fx = side === 0 ? x : x + 1;
          const fy = side === 0 ? y + 1 : y;
          if (!isFloor(fx, fy)) continue;
          if (cells.has(i) || doorAt.has(i)) continue;
          if (own.has(`${i}:${side}:other`)) continue;
          const along = side === 0 ? x : y;
          const hallWall = inHall(fx, fy);
          const byDoor = !!ex && doorSide.has(i) && (side === 0) === ex.alongX;
          const want = byDoor || own.has(`${i}:${side}`) || (hallWall ? along % 4 === 1 && !(ex && doorNear(ex, x, y)) : along % 6 === 3 && hash(x, y, 3305 + side) < 0.55);
          if (!want) continue;
          if (!own.has(`${i}:${side}`)) baskets.push({ i, side });
          // (where render/pieces.ts stands a wall piece: the face's foot under the tile's middle, at px - 8 or px + 8, py + 12)
          lights.push({ x: side === 0 ? x + 0.5 : x + 1, y: side === 0 ? y + 1 : y + 0.5, up: B.basket.up, r: B.basket.r, strength: B.basket.strength, glow: { ...B.basket.glow } });
          const si = fy * W + fx;
          if (!taken(si) && !solidAt.has(si) && !nearHall(fx, fy)) tiles.set(si, this.tileNamed('soot'));
        }
      }
    }
    // THE GREAT GRATE in his hall, and the great chains from the dark down to the rings in its floor
    if (hall) {
      lights.push({ x: gx + GREAT / 2, y: gy + GREAT / 2, up: 0, r: B.great.r, strength: B.great.strength, glow: { ...B.great.glow } });
      const chain = piece('a great chain from the dark');
      if (chain) for (const [rx, ry] of HALL_RINGS) if (isFloor(Math.floor(gx + rx), Math.floor(gy + ry))) stands.push({ x: gx + rx, y: gy + ry, s: chain });
    }
    this.cache = { tiles, gx, gy, hall, cells, baskets, lights, stands };
    return this.cache;
  }

  /** His hall's floor at tile (tx, ty), or a tile the prison lays there; null for neither. `t` the clock (the fire under the grates flickers about 6 a second). */
  laid(L: Level, tx: number, ty: number, t: number): Sprite | null {
    const P = this.of(L);
    const hs = this.A().hall.floor(tx, ty, tx - P.gx, ty - P.gy);
    const fr = Math.floor(t * 6 + hash(tx, ty, 3307) * 4);
    if (hs && hs.length) return hs[fr % hs.length];
    const laid = P.tiles.get(ty * L.floor.w + tx);
    return laid && laid.length ? laid[fr % laid.length] : null;
  }

  /** The dark flags of tile (tx, ty). */
  flags(tx: number, ty: number): Sprite {
    return this.A().floor(tx, ty);
  }

  /** The face of wall tile (tx, ty): `left` the face turned to screen-left (a wall along x). His hall's, a cell's front, or the prison's. */
  face(L: Level, left: boolean, tx: number, ty: number, _t = 0): Sprite {
    const P = this.of(L);
    const A = this.A();
    const f = L.floor;
    const i = ty * f.w + tx;
    const c = P.cells.get(i);
    if (c && c.alongX === left) return left ? A.cellLeft[c.k] : A.cellRight[c.k];
    const H = P.hall;
    // (his hall's ring of wall: a wall tile next to its floor)
    if (H && tx >= H.x - 1 && ty >= H.y - 1 && tx <= H.x + H.w && ty <= H.y + H.h) {
      const k = (((left ? tx : ty) % 4) + 4) % 4;
      return left ? A.hall.faceLeft[k] : A.hall.faceRight[k];
    }
    return A.face(left, tx, ty);
  }

  /** The fire baskets the prison adds in the faces of wall tile `i` (its top corner at (px, py), its depth `s`): their pictures, where to stand them. */
  walls(L: Level, i: number, faces: number, t: number, put: (s: Sprite, side: 0 | 1) => void): void {
    const P = this.of(L);
    const p = this.basketPiece();
    if (!p) return;
    for (const b of P.baskets) {
      if (b.i !== i || !(faces & (b.side === 0 ? 1 : 2))) continue;
      const spots = p.spots && p.spots.length ? p.spots : null;
      const frames = spots ? (b.side === 0 ? spots[0].left : spots[0].right) : b.side === 0 ? p.left : p.right;
      if (!frames || !frames.length) continue;
      put(frames[Math.floor(t * 8 + i) % frames.length], b.side);
    }
  }

  /** The faces of wall tile `i` to draw (`which`, render/walls.ts wallFaces): none on the door's two tiles (its own picture stands there: render/dress.ts). */
  unfaced(_L: Level, _i: number, which: number): number {
    return which;
  }
  /** (PRISON_EXIT) The faces of wall tile `i` with none on the door's two tiles, once its pictures are drawn there (render/dress.ts). */
  doorUnfaced(L: Level, i: number, which: number): number {
    const ex = L.ways?.exit;
    if (!ex || !which) return which;
    return prisonDoorTiles(L.floor, ex).includes(i) ? which & (ex.alongX ? ~1 : ~2) : which;
  }

  /**
   * (PRISON_EXIT) The door's lights at frame `f` of its film (art/prison_exit.ts EXIT_LIGHTS): game pixels from its anchor (along y,
   * x mirrored): the passage's fire baskets (a hole and a glow) and its floor (holes), all the while; the doorway's light once the
   * leaf moves.
   */
  exitLights(alongX: boolean, f: number): { dx: number; dy: number; r: number; strength: number; glow: { r: number; color: string; a: number } | null }[] {
    const E = EXIT_LIGHTS;
    const m = alongX ? 1 : -1;
    const out: { dx: number; dy: number; r: number; strength: number; glow: { r: number; color: string; a: number } | null }[] = [];
    for (const b of E.baskets) out.push({ dx: b.x * m, dy: b.y, r: E.basket.r, strength: E.basket.strength, glow: { ...E.basket.glow } });
    for (const p of E.path) out.push({ dx: p.x * m, dy: p.y, r: p.r, strength: p.strength, glow: null });
    const k = exitSpill(f);
    if (k > 0) out.push({ dx: E.spill.x * m, dy: E.spill.y, r: E.spill.r, strength: E.spill.strength * k, glow: { ...E.spill.glow, a: E.spill.glow.a * k } });
    return out;
  }

  /** (the game's own pictures in look B's colours, made the first time each is wanted) */
  private gradedMemo = new WeakMap<Sprite, Sprite>();
  /**
   * One of the game's own pictures (a slanting wall, which the prison's art has none of) in look B's colours: every colour drawn
   * toward the prison's charcoal as floor 3's own pieces are (art/prison.ts gradedB). Where there is no page to paint on (the
   * tests), the picture as it is.
   */
  graded(s: Sprite): Sprite {
    const hit = this.gradedMemo.get(s);
    if (hit) return hit;
    const out = gradeOnPage(s, gradedB);
    this.gradedMemo.set(s, out);
    return out;
  }

  /** What the prison stands on the floor (the channels' railings, the great chains in his hall): a floor point each, its depth x + y. */
  stands(L: Level, _t = 0): readonly LookStand[] {
    return this.of(L).stands;
  }

  /** Where the dark is cut on this level (render.ts light). */
  lights(L: Level): readonly PrisonLight[] {
    return this.of(L).lights;
  }
}

/** Is wall tile (x, y) within two tiles along the door's wall of it (its own baskets stand either side of it; no other there)? */
function doorNear(ex: { alongX: boolean; a: number; line: number }, x: number, y: number): boolean {
  const along = ex.alongX ? x : y;
  const row = ex.alongX ? y : x;
  return row === ex.line && along >= ex.a - 3 && along <= ex.a + 4;
}
