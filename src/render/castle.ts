// THE FIRST TOWN AS THE CASTLE'S HALL, DRAWN (the art chat's pictures, art/castle_hall.ts and its owl art/hall_owl.ts: his words of 2
// Nov 2026, 15:37, “Unfortunately that means the first town is going to have to be redone as well.  In sort of the same style as
// the wardens.  Maybe more sun, and more plants.  An owl in the rafters.  Hastily barricaded windows”; “Well it’s still supposed to
// be in the castle.  Like right inside.  The barred door in the back leads out of the prison to the quarry”; “A's sun through
// boards (Recommended)”; “Brighter, castle stone (Recommended)”; “Yes, hand them over (Recommended)”; behind CASTLE_HALL, off until
// his yes to it in play). As the art chat's README lays it out (docs/mockups/town_look/README.md, "How to bring it in"):
//   - THE ROOF: the castle's stone above the game's walls and the great hall's timber roof, behind everything, over the dark above
//     the back walls;
//   - THE FLOOR: the hall's flags a tile at a time; moss and grass laid over a tile here and there; THE SUN'S SLATS over it, added;
//   - THE WALLS: the castle's dressed stone, a face a tile at a time, the boarded windows in it; the walls toward the eye left out,
//     as the town's always are;
//   - THE TRUSSES on the walls, THE OWL on its hammer beam, THE SUN IN THE AIR before each window (added), the ivy at the walls'
//     feet, the pots (game/castle_way.ts: each blocking its tile);
//   - THE LIGHT: a day's thin warm dark, 0.1, its vignette 0.26; a hole where each window lets the day in, before it on the floor,
//     at the foot of every wall that stands, and under each slat; the day's warm glows over the hall; the gate's day in its way.
// The gate's pillars, arch and the day through it, the stairs down, the waypoint, the town's own things, its braziers, barrels,
// urn and pillars are drawn where the game draws them (render.ts, main.ts).

import { forgetMade as forgetCastleMade } from '../art/castle_hall';
import { AIR_DEPTH, CASTLE_HALL, CASTLE_LIGHTS, CASTLE_OWL_AT, GATE_AT, HALL, SUN_WINDOWS, TRUSSES_X, TRUSSES_Y, TRUSS_DEPTH, dayLights, makeCastleHallArt } from '../art/castle_hall';
import type { CastleHallArt } from '../art/castle_hall';
import type { Sprite } from '../engine/px';
import { POT_NAMES } from '../game/castle_way';
import type { Level } from '../game/state';
import { T_WALL } from '../game/types';
import type { LookLight, LookStand, LookView } from './looks';

/** The floor's own tiles laid over the flags (the art chat's laying, src/dev/preview_castle_hall_game.ts layTiles). */
export const CASTLE_LAID: readonly (readonly [string, readonly (readonly [number, number])[]])[] = [
  ['moss', [[6, 11], [7, 18], [8, 6], [16, 18], [20, 14], [6, 14], [11, 7], [18, 16]]],
  ['moss, a little', [[9, 9], [13, 15], [15, 9], [8, 17], [17, 12], [20, 9], [10, 12], [14, 7]]],
  ['grass and flowers in the joints', [[8, 11], [12, 9], [16, 15], [10, 17], [19, 16], [7, 13], [15, 13], [18, 9], [11, 13], [13, 8]]],
  ['grass in the joints', [[9, 12], [14, 10], [12, 16], [17, 17], [20, 12], [7, 8], [16, 8], [10, 10], [18, 13]]],
];
/** The ivy at the walls' feet: along x (the wall at y 5) or y, its floor point. */
export const CASTLE_IVY: readonly (readonly [boolean, number, number])[] = [[true, 7.0, 6], [true, 10.0, 6], [false, 6, 9.2], [false, 6, 15.3], [false, 6, 12.2]];

export class CastleView implements LookView {
  readonly dark = CASTLE_LIGHTS.dark.a;
  readonly tint = CASTLE_LIGHTS.dark.rgb;
  readonly vignette = CASTLE_LIGHTS.vignette;
  private art: CastleHallArt | null = null;
  private laidAt: Map<number, string> | null = null;
  private laidMemo = new Map<string, Sprite>();
  private lit: LookLight[] | null = null;
  private suns: LookStand[] | null = null;

  /** Its pictures let go (another floor is come into): made again if it is come back to. His words, 4 Nov 2026, 08:12: “I don’t know if my phone is getting to hot or whatever but it’s crashing every couple of levels” (render.ts forgetLooks). */
  forget(): void {
    forgetCastleMade();
    this.art = null;
    this.laidAt = null;
    this.laidMemo = new Map();
    this.lit = null;
    this.suns = null;
  }

  on(L: Level): boolean {
    return CASTLE_HALL.on && L.town && !L.act1;
  }
  warm(): void {
    void this.A().roof;
  }
  /** The hall's pictures (made the first time they are wanted). */
  A(): CastleHallArt {
    return (this.art ??= makeCastleHallArt());
  }
  private piece(n: string): Sprite[] {
    return this.A().pieces.find((q) => q.name === n)?.frames ?? [];
  }

  /** A tile of the floor with one of its own laid over it: the flags and the tile as one picture (made once each). */
  laid(L: Level, tx: number, ty: number): Sprite | null {
    if (!this.laidAt) {
      this.laidAt = new Map();
      for (const [n, list] of CASTLE_LAID) for (const [x, y] of list) this.laidAt.set(y * 1000 + x, n);
    }
    const n = this.laidAt.get(ty * 1000 + tx);
    if (!n) return null;
    const key = `${tx},${ty}`;
    const had = this.laidMemo.get(key);
    if (had) return had;
    const base = this.flags(tx, ty);
    const over = this.A().tiles.find((q) => q.name === n)?.frames?.[0];
    if (!over) return null;
    let s: Sprite = base;
    try {
      const a = base.img as unknown as CanvasImageSource & { width: number; height: number };
      const b = over.img as unknown as CanvasImageSource & { width: number; height: number };
      const c = document.createElement('canvas');
      c.width = a.width;
      c.height = a.height;
      const g = c.getContext('2d');
      if (g) {
        g.imageSmoothingEnabled = false;
        g.drawImage(a, 0, 0);
        // (laid at the same top corner: the two pictures are of one size and anchor)
        const k = a.width / base.w;
        g.drawImage(b, (base.ax - over.ax) * k, (base.ay - over.ay) * k, over.w * k, over.h * k);
        s = { ...base, img: c as unknown as Sprite['img'] };
      }
    } catch {
      s = base;
    }
    this.laidMemo.set(key, s);
    return s;
  }
  flags(tx: number, ty: number): Sprite {
    return this.A().floor(tx, ty);
  }
  face(L: Level, left: boolean, tx: number, ty: number): Sprite {
    return this.A().face(left, tx, ty);
  }
  unfaced(L: Level, i: number, which: number): number {
    return which;
  }
  graded(s: Sprite): Sprite {
    return s;
  }

  /** THE ROOF, behind everything, at the floor point of the hall's back corner. */
  back(): readonly LookStand[] {
    return [{ x: HALL.x0, y: HALL.y0, s: this.A().roof }];
  }

  lights(L: Level): readonly LookLight[] {
    if (this.lit) return this.lit;
    const C = CASTLE_LIGHTS;
    const f = L.floor;
    const out: LookLight[] = [];
    const wallAt = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < f.w && y < f.h && f.tiles[y * f.w + x] === T_WALL;
    // THE WINDOWS: the day through their gaps; the room's daylight before each, on the floor
    for (const W of SUN_WINDOWS) {
      out.push({ x: HALL.x0, y: W.c, up: C.window.up, r: C.window.r, strength: C.window.strength, glow: { ...C.window.glow }, still: true });
      const F = C.window.floor;
      out.push({ x: HALL.x0 + F.out, y: W.c + F.out * 0.3, up: 0, r: F.r, strength: F.strength, glow: { ...F.glow }, still: true });
    }
    // EVERY TILE OF WALL THAT STANDS: a low hole at the foot of its face
    for (let x = HALL.x0; x < HALL.x1; x++) if (wallAt(x, HALL.y0 - 1)) out.push({ x: x + 0.5, y: HALL.y0, up: C.wall.up, r: C.wall.r, strength: C.wall.strength, glow: null, still: true });
    for (let y = HALL.y0; y < HALL.y1; y++) if (wallAt(HALL.x0 - 1, y)) out.push({ x: HALL.x0, y: y + 0.5, up: C.wall.up, r: C.wall.r, strength: C.wall.strength, glow: null, still: true });
    // THE SLATS OF SUN on the floor
    for (const q of this.A().slatLights()) out.push({ x: q.x, y: q.y, up: 0, r: q.r, strength: q.strength, glow: null, still: true });
    // THE GATE: the day in its way (the floor before it is lit as the town's always is: render.ts)
    out.push({ x: GATE_AT.a + 1.5, y: GATE_AT.line + 1, up: C.gate.glow.up, r: 0, strength: 0, glow: { r: C.gate.glow.r, color: C.gate.glow.color, a: C.gate.glow.a }, still: true });
    // THE DAY THAT FILLS THE HALL: its glows over the floor and on every tile of wall
    for (const q of dayLights()) out.push({ x: q.x, y: q.y, up: q.up, r: 0, strength: 0, glow: { r: q.r, color: q.color, a: q.a }, still: true });
    return (this.lit = out);
  }

  /** THE SUN'S SLATS on the floor, added (after the floor's tiles). */
  flats(): readonly LookStand[] {
    if (this.suns) return this.suns;
    const out: LookStand[] = [];
    const A = this.A();
    for (let tx = HALL.x0; tx < HALL.x1; tx++) for (let ty = HALL.y0; ty < HALL.y1; ty++) {
      const s = A.sun(tx, ty);
      if (s) out.push({ x: tx, y: ty, s, add: true });
    }
    return (this.suns = out);
  }

  stands(L: Level, t: number): readonly LookStand[] {
    const A = this.A();
    const out: LookStand[] = [];
    // the trusses on the walls
    const truss = this.piece('a hammer-beam truss')[0];
    const post = this.piece('a wall post and brace')[0];
    if (truss) for (const x of TRUSSES_X) out.push({ x, y: HALL.y0, s: truss, d: x + HALL.y0 + TRUSS_DEPTH });
    if (post) for (const y of TRUSSES_Y) out.push({ x: HALL.x0, y, s: post, d: HALL.x0 + y + TRUSS_DEPTH });
    // the owl on its hammer beam
    const [ox, oy] = CASTLE_OWL_AT;
    out.push({ x: ox, y: oy, s: A.owl.frames[A.owl.frameAt(t, 3.1)] });
    // the sun in the air before each window, added
    SUN_WINDOWS.forEach((W, i) => {
      const fr = this.piece(`the sun in the air, window ${i + 1}`);
      if (fr.length) out.push({ x: HALL.x0, y: W.c, s: fr[Math.floor(t * 4) % fr.length], d: HALL.x0 + W.c + AIR_DEPTH, add: true });
    });
    // the ivy at the walls' feet
    for (const [ax, x, y] of CASTLE_IVY) {
      const fr = this.piece(`ivy at the foot of a wall, along ${ax ? 'x' : 'y'}`);
      if (fr.length) out.push({ x, y, s: fr[0], d: x + y + 0.2 });
    }
    // the pots (each blocking its tile: game/castle_way.ts)
    for (const p of L.props) {
      if (p.kind !== 'piece' || !p.name || !POT_NAMES.has(p.name)) continue;
      const fr = this.piece(p.name);
      if (fr.length) out.push({ x: p.x, y: p.y, s: fr[0] });
    }
    return out;
  }
}
