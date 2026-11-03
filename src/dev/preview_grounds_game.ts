// Dev page: FLOOR 2 AS THE PRISON'S GROUNDS AT NIGHT, BUILT FROM ITS GAME-READY PIECES (art/grounds.ts, behind GROUNDS, off),
// laid tile by tile as the game lays a floor: the sky over the far walls of the courtyard the knight is in (as the yard's), the
// floor a tile at a time, then the walls, the ways and what stands in the order of depth, the figures; then the dark laid over it
// with holes where the lights are, as the renderer does (render.ts, light), the yard's moonlit dark. Nothing of the game imports it.
//   PREVIEW_TIMEOUT=300000 node tools/preview.mjs src/dev/preview_grounds_game.ts docs/mockups/floor2_look/pictures/grounds.png 1200 2560 "sheet"
//   ("run" 1200 x 840, "inside" and "out" 600 x 520, "gate" 1200 x 600, "phone" 1014 x 468 give those alone)
import type { Sprite } from '../engine/px';
import { drawLights } from '../engine/px';
import { headsmanPieces } from '../art/floor2';
import type { Piece } from '../art/floorkit';
import { makeHeroArt3 } from '../art/heroes3';
import { PILLAR, STRIP } from '../art/gates';
import type { Strip } from '../art/gates';
import { YARD_WALL, makeYardArt } from '../art/yard';
import { makeYardGateArt } from '../art/yard_gate';
import { BLOCK_KINDS, GROUNDS_LIGHTS, makeGroundsArt } from '../art/grounds';

const [mode = 'sheet'] = decodeURIComponent(location.hash.slice(1)).split(':');
const G = makeGroundsArt();
const Y = makeYardArt();
const gate = makeYardGateArt();
const yardOwn = headsmanPieces();
const hero = makeHeroArt3().of('warrior', { twoHanded: false });

// =================================================================================================
// THE PLACE, in the world's tiles (as the game would lay it: see the README, "What the main chat must lay")

type Kind = 'floor' | 'wall';
const tiles = new Map<string, Kind>();
const floorPic = new Map<string, Sprite>();
const key = (x: number, y: number): string => `${x},${y}`;
const isFloor = (x: number, y: number): boolean => tiles.get(key(x, y)) === 'floor';
interface Rect { x0: number; y0: number; x1: number; y1: number }
const fill = (r: Rect, pic: (x: number, y: number) => Sprite): void => {
  for (let x = r.x0; x <= r.x1; x++) for (let y = r.y0; y <= r.y1; y++) {
    tiles.set(key(x, y), 'floor');
    floorPic.set(key(x, y), pic(x, y));
  }
};
const tile = (n: string): Sprite => G.tiles.find((p) => p.name === n)!.frames![0];
const lay = (x: number, y: number, n: string): void => {
  if (isFloor(x, y)) floorPic.set(key(x, y), tile(n));
};
/** THE GAOLER'S ROOM (indoors), the passage out through his house, the courtyards A (where you come out), B (beside it) and C (the last, the chapel's), the way down to his yard, and his yard. */
const GAOL: Rect = { x0: -12, y0: 4, x1: -7, y1: 9 };
const PASS: Rect = { x0: -6, y0: 4, x1: -1, y1: 6 };
const A: Rect = { x0: 0, y0: 0, x1: 13, y1: 11 };
const AB: Rect = { x0: 14, y0: 4, x1: 19, y1: 6 };
const B: Rect = { x0: 20, y0: 0, x1: 33, y1: 11 };
const AC: Rect = { x0: 5, y0: 12, x1: 7, y1: 17 };
const C: Rect = { x0: 0, y0: 18, x1: 13, y1: 29 };
const DOWN: Rect = { x0: 5, y0: 30, x1: 7, y1: 32 };
const YD: Rect = { x0: -1, y0: 33, x1: 11, y1: 45 };
/** How deep a cell block is between two courtyards (tiles): so deep that its face never hides the courtyard behind it. */
const DEEP = 6;
/** Where the ways are: the gaoler's door (along y, its face at x 0), the gateway into B (along y, at x 17), the gateway into C (along x, at y 15), the chapel (along x, at y 15), his yard's doorway (along x, at y 30). */
const GAOL_DOOR = { a: 4, line: 0 };
const TO_B = { a: 4, line: B.x0 };
const TO_C = { a: 5, line: C.y0 };
const CHAPEL = { a: 10, line: C.y0 };
const YARD_DOOR = { a: 5, line: YD.y0 };
void DEEP;
fill(GAOL, (x, y) => G.gaol.floor(x, y));
fill(PASS, (x, y) => G.gaol.floor(x, y));
for (const r of [A, AB, B, AC, C, DOWN]) fill(r, (x, y) => G.floor(x, y));
fill(YD, (x, y) => Y.floor(x - YD.x0, y - YD.y0));
// THE LONG WALK, two tiles wide: from the gaoler's door across A to the gateway into B, and from A's middle down through the gateway
// into C, on through C to the way down to his yard
for (let x = 0; x <= AB.x1; x++) for (const y of [5, 6]) floorPic.set(key(x, y), G.walk(x, y));
for (let y = 7; y <= DOWN.y1; y++) for (const x of [6, 7]) floorPic.set(key(x, y), G.walk(x, y));
// (the gutter at the outer wall's foot; weeds at the blocks' feet; straw by the gaoler's door; mud round the well; puddles)
for (let x = 0; x <= B.x1; x++) if (x !== 6 && x !== 7) lay(x, 0, 'gutter along x');
for (const y of [0, 1, 2, 3, 8, 9, 10, 11]) lay(0, y, 'weeds along y');
for (const y of [1, 2, 3, 8, 9, 10, 11]) lay(B.x0, y, 'weeds along y');
for (const x of [0, 1, 2, 3, 4, 13]) lay(x, C.y0, 'weeds along x');
for (const y of [19, 21, 23, 25, 27, 29]) lay(0, y, 'weeds along y');
for (const [x, y, n] of [
  [1, 4, 'a drift of straw'], [2, 4, 'straw'], [1, 7, 'straw'], [2, 7, 'a drift of straw'], [3, 7, 'straw'], [1, 3, 'straw'],
  [11, 7, 'mud'], [12, 8, 'churned mud'], [11, 9, 'mud'], [9, 9, 'churned mud'], [12, 9, 'a puddle'], [3, 1, 'beaten earth'],
  [4, 2, 'beaten earth'], [12, 2, 'a little puddle'], [23, 7, 'mud'], [24, 8, 'a long puddle'], [22, 2, 'beaten earth'], [26, 3, 'straw'],
  [2, 20, 'a puddle'], [10, 21, 'beaten earth'], [9, 24, 'mud'], [3, 25, 'churned mud'], [11, 25, 'straw'], [2, 11, 'a little puddle'],
  [4, 10, 'churned mud'], [6, 14, 'mud'], [-10, 6, 'straw'], [-11, 8, 'a drift of straw'], [-4, 5, 'straw'],
] as [number, number, string][]) lay(x, y, n);
// (the yard's own, as render/yard.ts lays them: the gutter at its left wall's foot, beaten earth where its doorway is walked from)
const YDOOR = YARD_DOOR.a - YD.x0;
for (let y = 0; y < 13; y++) floorPic.set(key(YD.x0, YD.y0 + y), Y.tiles.find((p) => p.name === 'gutter along y')!.frames![0]);
for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [2, 2], [1, 3]]) floorPic.set(key(YD.x0 + YDOOR + dx, YD.y0 + dy), Y.tiles.find((p) => p.name === 'beaten earth')!.frames![0]);

// =================================================================================================
// WHAT STANDS: the walls a tile at a time, the ways, the pieces; each with its depth (x + y of its near point), as the renderer sorts

interface Stand { d: number; s: Sprite; x: number; y: number; z?: number; shadow?: number; alpha?: number; tag?: string; wall?: boolean }
const stands: Stand[] = [];
const torches: { x: number; y: number; alongX: boolean }[] = [];
const torch = G.pieces.find((p) => p.name === "the yard's torch")!;
const TORCH_FACE = [G.block.faceLeft[BLOCK_KINDS.indexOf('torch')], G.block.faceRight[BLOCK_KINDS.indexOf('torch')]];
const wallX = (x: number, row: number, s: Sprite, tag: string): void => {
  stands.push({ d: x + row + 1, s, x, y: row, tag, wall: true });
  // (a block's torch bay: the yard's torch on it, at the foot of its middle)
  if (s === TORCH_FACE[0]) torches.push({ x: x + 0.5, y: row + 1, alongX: true });
};
const wallY = (col: number, y: number, s: Sprite, tag: string): void => {
  stands.push({ d: col + y + 1, s, x: col, y, tag, wall: true });
  if (s === TORCH_FACE[1]) torches.push({ x: col + 1, y: y + 0.5, alongX: false });
};
const strips = (list: Strip[], alongX: boolean, a: number, line: number, t0: number, back: number, tag: string): void => {
  for (const q of list) {
    const [x, y] = alongX ? [a + t0 + q.t, line - back] : [line - back, a + t0 + q.t];
    stands.push({ d: x + y + STRIP / 64, s: q.s, x, y, tag, wall: true });
  }
};
/** A run of block along x at `row` (its face at row + 1) from x0 to x1, the ways in it left to their own pictures; corners at its ends. */
const blockX = (row: number, x0: number, x1: number, skip: (x: number) => boolean, tag: string): void => {
  for (let x = x0; x <= x1; x++) if (!skip(x)) wallX(x, row, G.block.face(true, x, row, x === x0 ? 'low' : x === x1 ? 'high' : undefined), tag);
};
const blockY = (col: number, y0: number, y1: number, skip: (y: number) => boolean, tag: string): void => {
  for (let y = y0; y <= y1; y++) if (!skip(y)) wallY(col, y, G.block.face(false, col, y, y === y0 ? 'low' : y === y1 ? 'high' : undefined), tag);
};
const way = (a: number) => (t: number): boolean => t >= a - 1 && t <= a + 3;
// THE GAOLER'S ROOM: its back walls (along x, the stair down from floor 1 in it; along y), the passage's wall
for (let x = GAOL.x0; x <= GAOL.x1; x++) if (x < -11 || x > -9) wallX(x, GAOL.y0 - 1, G.gaol.face(true, x, GAOL.y0 - 1), 'gaol');
stands.push({ d: -9.5 + GAOL.y0 - 0.5, s: G.wayIn(true), x: -9.5, y: GAOL.y0, tag: 'gaol', wall: true });
for (let y = GAOL.y0; y <= GAOL.y1; y++) wallY(GAOL.x0 - 1, y, G.gaol.face(false, GAOL.x0 - 1, y), 'gaol');
for (let x = PASS.x0; x <= PASS.x1; x++) wallX(x, PASS.y0 - 1, G.gaol.face(true, x, PASS.y0 - 1), 'gaol');
// THE GAOLER'S HOUSE FRONT: A's wall along y (its face at x 0), his door in it (the way out)
blockY(-1, A.y0, A.y1, way(GAOL_DOOR.a), 'house');
strips(G.gateway(false, 'gaol'), false, GAOL_DOOR.a, GAOL_DOOR.line, 0, 0, 'house');
// THE OUTER WALL along x over A and B (the yard's), its torches
for (let x = A.x0; x <= B.x1; x++) wallX(x, -1, G.wall.faceLeft[(x * 5 + 2) % 4], 'outer');
for (const x of [2.5, 11.5, 20.5, 27.5]) torches.push({ x, y: 0, alongX: true });
// THE CELL BLOCK between A and B: its face toward B (along y, its face at x 17), the gateway in it
blockY(TO_B.line - 1, A.y0, A.y1, way(TO_B.a), 'ab');
strips(G.gateway(false, 'open'), false, TO_B.a, TO_B.line, 0, 0, 'ab');
// THE CELL BLOCK between A and C (and B and its own): its face toward C (along x, its face at y 15), the barred gateway, the chapel
blockX(TO_C.line - 1, A.x0, A.x1, (x) => way(TO_C.a)(x) || (x >= CHAPEL.a && x <= CHAPEL.a + 2), 'ac');
blockX(TO_C.line - 1, A.x1 + 1, B.x1, () => false, 'ac');
strips(G.gateway(true, 'barred'), true, TO_C.a, TO_C.line, 0, 0, 'ac');
stands.push({ d: CHAPEL.a + 1.5 + CHAPEL.line - 0.4, s: G.chapel(true), x: CHAPEL.a + 1.5, y: CHAPEL.line, tag: 'ac', wall: true });
// C's left wall: the outer wall along y (the yard's), its torches
for (let y = C.y0; y <= C.y1; y++) wallY(-1, y, G.wall.faceRight[(y * 3 + 1) % 4], 'outerC');
torches.push({ x: 0, y: 21.5, alongX: false }, { x: 0, y: 27.5, alongX: false });
// THE WAY DOWN TO HIS YARD: his yard's far wall and its left wall, the yard's own, his gate in its doorway
for (let x = YD.x0; x <= YD.x1; x++) if (x < YARD_DOOR.a || x > YARD_DOOR.a + 2) wallX(x, YD.y0 - 1, Y.faceLeft[(((x * 5 + 2) % 4) + 4) % 4], 'yard');
for (let y = YD.y0; y <= YD.y1; y++) wallY(YD.x0 - 1, y, Y.faceRight[(y * 3 + 1) % 4], 'yard');
// (the way down between the blocks: its wall toward the light, the block's)
blockY(DOWN.x0 - 1, DOWN.y0, DOWN.y1, () => false, 'yard');
const WIDE = PILLAR / 32;
const pillar = gate.pillar(true);
for (const t of [0, 3 + WIDE]) stands.push({ d: YARD_DOOR.a + t + YARD_DOOR.line - WIDE, s: pillar, x: YARD_DOOR.a + t, y: YARD_DOOR.line, tag: 'yard', wall: true });
strips(gate.portcullis(true, true, 60), true, YARD_DOOR.a, YARD_DOOR.line, -WIDE, WIDE, 'yard');
strips(gate.arch(true, true, false), true, YARD_DOOR.a, YARD_DOOR.line, -WIDE, 0, 'yard');
for (const x of [YARD_DOOR.a - 0.75, YARD_DOOR.a + 3.75, 0.5, 10.5]) torches.push({ x, y: YARD_DOOR.line, alongX: true });
for (const t of torches) {
  const s = (t.alongX ? torch.left! : torch.right!)[1];
  stands.push({ d: t.x + t.y - 0.5, s, x: t.x, y: t.y, tag: t.y >= YD.y0 ? 'yard' : 'torch' });
}
// THE PIECES: the grounds' own and floor 2's own (in the night's colours); in his yard, his yard's own as the game stands them
const P = (n: string): Piece => G.pieces.find((p) => p.name === n)!;
const put = (n: string, x: number, y: number, frame = 0, near = 0): void => {
  const p = P(n);
  stands.push({ d: x + y + near, s: p.frames![Math.min(frame, p.frames!.length - 1)], x, y, shadow: p.shadow ?? 0.4 });
};
const braziers: [number, number][] = [[2.6, 2.6], [11.6, 2.6], [4.2, 11.0], [9.4, 11.0], [9.6, 19.6], [13.2, 19.6], [22.6, 3.0], [-8.0, 8.4]];
for (const [x, y] of braziers) put('brazier of irons', x, y, Math.round(x * 3) % 4);
put('the well', 10.6, 8.4);
put('the tumbril, along x', 3.0, 9.4, 0, 0.5);
put('crate', 1.3, 10.5);
put('sawdust barrel', 1.4, 1.3);
put('pail', 9.3, 7.8);
put('the stocks', 12.4, 1.4);
put('kicked-over stool', 4.2, 1.6);
put('coil of rope', 12.6, 3.6);
put('the tumbril, along y', 28.2, 7.2, 0, 0.5);
put('the great bell', 25.6, 1.6);
put('crate', 32.4, 1.4);
put('basket', 2.4, 22.2);
put('broken wheel', 10.0, 24.2);
put('sawdust barrel', -11.4, 5.0);
put('crate', -7.6, 5.0);
put('dropped lantern', -9.0, 8.4);
put('kicked-over stool', -10.6, 7.2);
const own = (n: string): Piece => yardOwn.find((p) => p.name === n)!;
const yardPut = (n: string, x: number, y: number, near = 0): void => {
  const p = own(n) ?? Y.pieces.find((q) => q.name === n)!;
  stands.push({ d: x + y + near, s: p.frames![0], x, y, shadow: p.shadow ?? 0.4, tag: 'yard' });
};
// (his doorway near the far wall's middle: the gallows and the bell's corner change places, as game/yard.ts lays them, `mirror`)
const gal = Y.pieces.find((p) => p.name === 'the long gallows')!;
stands.push({ d: YD.x0 + 2.5 + YD.y0 + 1.05 + 0.6, s: gal.frames![0], x: YD.x0 + 2.5, y: YD.y0 + 1.05, shadow: 1.4, tag: 'yard' });
yardPut('the great bell', YD.x0 + 10.6, YD.y0 + 2.8);
yardPut('sawdust barrel', YD.x0 + 11.5, YD.y0 + 1.5);
yardPut('crate', YD.x0 + 10.5, YD.y0 + 1.5);
const yardBraziers: [number, number][] = [[2.5, YD.y0 + 8.5], [9.5, YD.y0 + 8.5]];
for (const [x, y] of yardBraziers) yardPut('brazier of irons', x, y);

// =================================================================================================
// A VIEW: where the camera is, where the knight stands, which courtyard he is in (its far walls: the sky over them), what is seen
// through (a wall he is behind)

interface View {
  W: number;
  H: number;
  hero: [number, number];
  /** The camera: the screen point (game pixels) of the hero. */
  at: [number, number];
  /** The courtyard he is in (its far walls' line: along x at y0, along y at x0), or indoors. */
  court: Rect | null;
  /** Tiles drawn: everything but what lies behind the court's far walls (and a few tiles through its ways). */
  shows: (x: number, y: number) => boolean;
  /** Walls drawn seen through (he is behind them). */
  through?: Set<string>;
  /** Things not drawn (behind the walls he is looking at). */
  hide?: Set<string>;
  dark: number;
}
const UP = (YARD_WALL + 24) / 2;
function render(v: View): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = v.W;
  cv.height = v.H;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#04040a';
  g.fillRect(0, 0, v.W, v.H);
  g.setTransform(2, 0, 0, 2, 0, 0);
  const [hx0, hy0] = v.hero;
  const OX = v.at[0] - (hx0 - hy0) * 16;
  const OY = v.at[1] - (hx0 + hy0) * 8;
  const at = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * 16, OY + (x + y) * 8 - z / 2];
  const draw = (s: Sprite, x: number, y: number, alpha = 1): void => {
    if (alpha < 1) g.globalAlpha = alpha;
    g.drawImage(s.img, Math.round(x) - s.ax, Math.round(y) - s.ay, s.w, s.h);
    g.globalAlpha = 1;
  };
  const W2 = v.W / 2;
  const H2 = v.H / 2;
  // THE SKY over the court's far walls (as render/yard.ts `back`): the yard's backdrop and its tower, anchored at the court's far corner
  const c = v.court;
  const skyPath = (q: CanvasRenderingContext2D): void => {
    if (!c) return;
    const [lx, ly] = at(c.x0, c.y1 + 1);
    const [tx, ty] = at(c.x0, c.y0);
    const [rx, ry] = at(c.x1 + 1 + 40, c.y0);
    q.beginPath();
    q.moveTo(lx - 2000, ly - UP + 1000);
    q.lineTo(lx, ly - UP);
    q.lineTo(tx, ty - UP);
    q.lineTo(rx, ry - UP);
    q.lineTo(rx, -10);
    q.lineTo(lx - 2000, -10);
    q.closePath();
  };
  if (c) {
    g.save();
    skyPath(g);
    g.clip();
    const [bx, by] = at(c.x0, c.y0);
    draw(G.beyond, bx, by);
    draw(G.tower, bx, by);
    g.restore();
  }
  // THE FLOOR, a tile at a time
  for (const [k, s] of floorPic) {
    const [x, y] = k.split(',').map(Number);
    if (!v.shows(x, y)) continue;
    const [sx, sy] = at(x, y);
    if (sx < -40 || sx > W2 + 40 || sy < -40 || sy > H2 + 40) continue;
    draw(s, sx, sy);
  }
  // (the yard's wide puddles, lying on its floor)
  for (const [n, x, y] of [['a wide puddle', 2.6, 6.0], ['a great puddle', 10.8, 6.6]] as const) {
    if (!v.shows(Math.floor(YD.x0 + x), Math.floor(YD.y0 + y))) continue;
    draw(Y.pieces.find((p) => p.name === n)!.frames![0], ...at(YD.x0 + x, YD.y0 + y));
  }
  draw(G.pieces.find((p) => p.name === 'a wide puddle')!.frames![0], ...at(5.2, 7.6));
  // WHAT STANDS, far to near, the knight among it
  const list: Stand[] = stands.filter((st) => !(st.tag && v.hide?.has(st.tag))).filter((st) => v.shows(Math.floor(st.x - 0.01), Math.floor(st.y - 0.01)) || v.shows(Math.floor(st.x), Math.floor(st.y)) || st.tag === 'yard' && v.shows(Math.floor(st.x), Math.floor(st.y) - 1));
  list.push({ d: hx0 + hy0, s: hero.front.idle[0], x: hx0, y: hy0, shadow: 0.36, tag: 'hero' });
  for (const st of list) if (!st.s) console.log(`no picture: ${st.tag} at ${st.x}, ${st.y}`);
  list.sort((a, b) => a.d - b.d);
  const blot = document.createElement('canvas');
  blot.width = 64;
  blot.height = 64;
  {
    const q = blot.getContext('2d') as CanvasRenderingContext2D;
    const grd = q.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(0,0,0,1)');
    grd.addColorStop(0.4, 'rgba(0,0,0,0.85)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    q.fillStyle = grd;
    q.fillRect(0, 0, 64, 64);
  }
  const [hsx, hsy] = at(hx0, hy0);
  for (const st of list) {
    const [sx, sy] = at(st.x, st.y, st.z ?? 0);
    if (sx < -200 || sx > W2 + 200 || sy < -60 || sy > H2 + 260) continue;
    if (st.shadow) {
      const w = st.shadow * 22.6 * 1.5;
      const hh = st.shadow * 11.3 * 1.5;
      g.save();
      g.imageSmoothingEnabled = true;
      g.globalAlpha = 0.7;
      g.drawImage(blot, sx - w, sy - hh, w * 2, hh * 2);
      g.restore();
    }
    // (a wall nearer than the knight that covers him is seen through, as the renderer sees through the walls beside doors)
    const covers = st.wall && st.d > hx0 + hy0 && sx - st.s.ax < hsx + 6 && sx - st.s.ax + st.s.w > hsx - 6 && sy - st.s.ay < hsy - 4 && sy - st.s.ay + st.s.h > hsy - 30;
    draw(st.s, sx, sy, (st.tag && v.through?.has(st.tag)) || covers ? 0.35 : 1);
  }
  // THE DARK, as the renderer lays it: over everything, a hole cut by each light
  const dark = document.createElement('canvas');
  dark.width = W2;
  dark.height = H2;
  const dg = dark.getContext('2d') as CanvasRenderingContext2D;
  dg.fillStyle = `rgba(6,4,14,${v.dark})`;
  dg.fillRect(0, 0, W2, H2);
  dg.globalCompositeOperation = 'destination-out';
  const pool = document.createElement('canvas');
  pool.width = 128;
  pool.height = 128;
  {
    const q = pool.getContext('2d') as CanvasRenderingContext2D;
    const grd = q.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(0,0,0,1)');
    grd.addColorStop(0.5, 'rgba(0,0,0,0.7)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    q.fillStyle = grd;
    q.fillRect(0, 0, 128, 128);
  }
  const spot = (x: number, y: number, r: number, strength: number): void => {
    dg.globalAlpha = Math.min(1, strength);
    dg.drawImage(pool, Math.round(x - r), Math.round(y - r * 0.62), Math.round(r * 2), Math.round(r * 1.24));
  };
  // (the sky's own light, as the yard's: the dark taken down over what lies behind the far walls)
  if (c) {
    dg.save();
    dg.globalAlpha = GROUNDS_LIGHTS.dark.skyLift;
    skyPath(dg);
    dg.fillStyle = '#000';
    dg.fill();
    dg.restore();
  }
  const [hx, hy] = at(hx0, hy0);
  spot(hx, hy - 8, 380, 0.36);
  spot(hx, hy - 8, 165, 1);
  const L = GROUNDS_LIGHTS;
  for (const t of torches) {
    const [px, py] = at(t.x, t.y);
    spot(px, py - L.torch.up, L.torch.r, L.torch.strength);
  }
  for (const [x, y] of [...braziers, ...yardBraziers]) {
    const [px, py] = at(x, y);
    spot(px, py - L.brazier.up, L.brazier.r, L.brazier.strength);
  }
  {
    const [px, py] = at(GAOL_DOOR.line, GAOL_DOOR.a + 1.5);
    spot(px, py - L.lantern.up, L.lantern.r, L.lantern.strength);
    const [qx, qy] = at(GAOL_DOOR.line - L.lantern.room.into, GAOL_DOOR.a + 1.5);
    spot(qx, qy, L.lantern.room.r, L.lantern.room.strength);
  }
  {
    const [px, py] = at(CHAPEL.a + 1.5, CHAPEL.line + L.chapel.out);
    spot(px, py - L.chapel.up, L.chapel.r, L.chapel.strength);
  }
  {
    const [px, py] = at(-9.5, GAOL.y0 + L.wayIn.into);
    spot(px, py - L.wayIn.up, L.wayIn.r, L.wayIn.strength);
  }
  // (the vignette: the corners of the screen a little darker, as the renderer's)
  dg.globalCompositeOperation = 'source-over';
  dg.globalAlpha = 1;
  {
    const grd = dg.createRadialGradient(W2 / 2, H2 / 2, Math.min(W2, H2) * 0.45, W2 / 2, H2 / 2, Math.hypot(W2, H2) * 0.62);
    grd.addColorStop(0, 'rgba(6,4,14,0)');
    grd.addColorStop(1, `rgba(6,4,14,${c ? L.dark.vignette : 0.6})`);
    dg.fillStyle = grd;
    dg.fillRect(0, 0, W2, H2);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(dark, 0, 0, v.W, v.H);
  // (what gives off light, drawn again over the dark: fire, lit windows, the lantern, the chapel's door, the stair's head)
  g.setTransform(2, 0, 0, 2, 0, 0);
  for (const st of list) {
    if (!st.s.lights) continue;
    const [sx, sy] = at(st.x, st.y, st.z ?? 0);
    drawLights(g, st.s, Math.round(sx), Math.round(sy));
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  return cv;
}

// =================================================================================================
// THE VIEWS

const inCourt = (r: Rect, x: number, y: number, through: [number, number, number, number][] = []): boolean => {
  if (x >= r.x0 - 1 && y >= r.y0 - 1) return true;
  return through.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1);
};
// (in A: what lies behind its far walls is the sky's, but the gaoler's door shows the passage and a little of his room)
const showsA = (x: number, y: number): boolean => inCourt(A, x, y, [[-4, 4, -1, 6]]);
const VIEWS: Record<string, () => View> = {
  run: () => ({ W: 1200, H: 840, hero: [7.6, 6.2], at: [300, 300], court: A, shows: showsA, hide: new Set(['gaol']), dark: GROUNDS_LIGHTS.dark.a }),
  phone: () => ({ W: 1014, H: 468, hero: [9.0, 9.4], at: [253, 131], court: A, shows: showsA, hide: new Set(['gaol']), dark: GROUNDS_LIGHTS.dark.a }),
  inside: () => ({ W: 600, H: 520, hero: [-9.6, 5.9], at: [150, 175], court: null, shows: (x, y) => x <= 0 && y >= 3 && y <= 10, dark: GROUNDS_LIGHTS.gaol.a }),
  out: () => ({ W: 600, H: 520, hero: [0.9, 5.6], at: [200, 200], court: A, shows: showsA, hide: new Set(['gaol']), dark: GROUNDS_LIGHTS.dark.a }),
  gate: () => ({ W: 1200, H: 600, hero: [6.5, YD.y0 + 1.4], at: [300, 196], court: YD, shows: (x, y) => inCourt(YD, x, y, [[4, YD.y0 - 5, 8, YD.y0 - 1]]), dark: GROUNDS_LIGHTS.dark.a }),
};

if (mode === 'sheet') {
  const W = 1200;
  const parts: [string, HTMLCanvasElement[]][] = [
    ['Floor 2, the prison grounds at night: courtyard under the sky, cell blocks all round, gateways and the chapel through them', [render(VIEWS.run())]],
    ['Where you come in: the stair down from floor 1 into the gaoler\'s room (left); out of his door into the first courtyard (right)', [render(VIEWS.inside()), render(VIEWS.out())]],
    ['The end of the long walk: through his gate into the Headsman\'s yard (his yard and gate unchanged)', [render(VIEWS.gate())]],
    ['On a phone, at the game\'s own size: the knight in a courtyard by the well', [render(VIEWS.phone())]],
  ];
  const CAP = 34;
  const H = parts.reduce((t, [, cs]) => t + CAP + Math.max(...cs.map((c) => c.height)), 0);
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = '#0b0a14';
  g.fillRect(0, 0, W, H);
  let y = 0;
  for (const [cap, cs] of parts) {
    g.fillStyle = '#d8d4e8';
    g.font = '18px sans-serif';
    g.textBaseline = 'middle';
    g.fillText(cap, 12, y + CAP / 2);
    y += CAP;
    const total = cs.reduce((t, c) => t + c.width, 0);
    let x = Math.round((W - total) / 2);
    for (const c of cs) {
      g.drawImage(c, x, y);
      x += c.width;
    }
    y += Math.max(...cs.map((c) => c.height));
  }
  document.body.style.margin = '0';
  document.body.style.background = '#0b0a14';
  cv.style.display = 'block';
  document.body.appendChild(cv);
  console.log(`sheet ${W} x ${H}`);
} else {
  let cv: HTMLCanvasElement;
  try {
    cv = render(VIEWS[mode]());
  } catch (e) {
    console.log((e as Error).stack);
    throw e;
  }
  document.body.style.margin = '0';
  cv.style.display = 'block';
  document.body.appendChild(cv);
}
(window as unknown as { __ready: boolean }).__ready = true;
