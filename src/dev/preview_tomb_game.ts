// Dev page: FLOOR 1, THE KING'S TOMB WITH DAYLIGHT, LOOK B (THE ROOTS BREAK IN), BUILT FROM ITS GAME-READY PIECES (art/tomb.ts,
// behind TOMB, off; his gate, art/tomb_gate.ts, behind TOMB_GATE, off), laid tile by tile as the game lays a level: the floor a
// tile at a time (the tomb's flags, and their tiles laid in their place: the roots, puddles, moss, leaves, the court's slabs),
// the walls a face at a time where floor lies before them and none that would hide floor behind them (render/walls.ts,
// wallsAway: the game's rule), what stands sorted as the renderer sorts it, the ways between the rooms, the town's stairs and the
// gate as render.ts stands a gate's strips; the daylight's pools and columns ADDED to what is under them; then the dark laid over
// it with holes where the lights are, and the lights' glow drawn over that, as the renderer does (render.ts, light). Nothing of
// the game imports it.
//   node tools/preview.mjs src/dev/preview_tomb_game.ts shots/tomb/run.png 1200 840 "run"
//   node tools/preview.mjs src/dev/preview_tomb_game.ts shots/tomb/phone.png 1014 468 "phone"
//   node tools/preview.mjs src/dev/preview_tomb_game.ts shots/tomb/close.png 1200 664 "close"
//   node tools/preview.mjs src/dev/preview_tomb_game.ts shots/tomb/gate.png 1120 600 "gate"
//   PREVIEW_TIMEOUT=400000 node tools/preview.mjs src/dev/preview_tomb_game.ts docs/mockups/floor1_look/pictures/game_ready.png 1200 2396 "sheet"
import type { Sprite } from '../engine/px';
import { drawGlow, drawLights } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { makeWardenArt } from '../art/monster_warden';
import { cryptGround } from '../art/crypt';
import type { Piece } from '../art/floorkit';
import { GATE_UP, PILLAR, STRIP } from '../art/gates';
import type { GateArt, Strip } from '../art/gates';
import { TOMB_ADDED, TOMB_LIGHTS, makeTombArt } from '../art/tomb';
import type { TombArt } from '../art/tomb';
import { makeTombGateArt } from '../art/tomb_gate';

const [mode = 'run'] = decodeURIComponent(location.hash.slice(1)).split(':');
// (made once the page has loaded: painting them takes a while)
let A!: TombArt;
let G!: GateArt;
const ground = cryptGround(1);

// =================================================================================================
// THE LEVEL, in tiles (x down the screen to the right, y down to the left): floor 1 laid COMBO as the look's pictures had it, but
// as the game would build it: THE STAIR HALL (D, bottom left), the town's stairs coming down in its left wall; THE KING'S COURT
// (C) and THE EFFIGY HALL (B); THE ANTECHAMBER (A); the boss's doorway with his gate; HIS HALL, flat, its middle open for his
// Lockdown, the throne, the cressets and the chained tombs at its back.

type R = { x0: number; y0: number; x1: number; y1: number };
const HALL: R = { x0: -1, y0: -10, x1: 9, y1: 0 };
const DOOR: R = { x0: 3, y0: 0, x1: 6, y1: 1 };
const RA: R = { x0: 2, y0: 1, x1: 7, y1: 6 };
const RB: R = { x0: 2, y0: 7, x1: 7, y1: 12 };
const RC: R = { x0: -4, y0: 1, x1: 1, y1: 6 };
const RD: R = { x0: -4, y0: 7, x1: 1, y1: 12 };
const B_TO_A: R = { x0: 3, y0: 6, x1: 6, y1: 7 };
const C_TO_A: R = { x0: 1, y0: 2, x1: 2, y1: 5 };
const D_TO_C: R = { x0: -3, y0: 6, x1: 0, y1: 7 };
const D_TO_B: R = { x0: 1, y0: 8, x1: 2, y1: 11 };
const ROOMS: R[] = [HALL, DOOR, RA, RB, RC, RD, B_TO_A, C_TO_A, D_TO_C, D_TO_B];
const inR = (x: number, y: number, r: R): boolean => x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1;
const isFloor = (x: number, y: number): boolean => ROOMS.some((r) => inR(x, y, r));
const inHall = (x: number, y: number): boolean => x >= HALL.x0 - 1 && x <= HALL.x1 && y >= HALL.y0 - 1 && y <= HALL.y1 - 1;
/** A wall that would hide floor behind it is left out (render/walls.ts, wallsAway: the game's faces look). */
const away = (x: number, y: number): boolean => {
  for (const [a, b] of [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]] as const) if (isFloor(x - a, y - b)) return true;
  return false;
};
/** A doorway (as the game's DoorSpot): along x or y, its first tile `a`, the plane of its face. */
interface Way { alongX: boolean; a: number; face: number }
const ARCHWAYS: Way[] = [{ alongX: true, a: 3, face: 7 }, { alongX: false, a: 2, face: 2 }, { alongX: true, a: -3, face: 7 }, { alongX: false, a: 8, face: 2 }];
const GATE: Way = { alongX: true, a: 3, face: 1 };
/** THE TOWN'S STAIRS: floor 1's first doorway (a 'waygate'), three tiles of the stair hall's left wall (along y, its face at x = -4). */
const STAIRS: Way = { alongX: false, a: 8, face: -4 };
const inStairs = (x: number, y: number): boolean => x === STAIRS.face - 1 && y >= STAIRS.a && y < STAIRS.a + 3;
/** Where he stands; where the knight stands: in the effigy hall in a shaft of light (the run, the phone), come down from the town (the close), at the gate, in the hall. */
const BOSS: [number, number] = [4.6, -4.6];
const HERO_RUN: [number, number] = [4.6, 9.2];
const HERO_DOWN: [number, number] = [-2.1, 10.4];
const HERO_GATE: [number, number] = [4.0, 2.0];
const HERO_IN: [number, number] = [2.5, -1.1];

/** The floor tiles laid in their place (by "x,y"). */
const laid = new Map<string, Sprite[]>();
const tileNamed = (n: string): Piece => {
  const p = [...A.tiles, ...A.pieces].find((q) => q.name === n);
  if (!p?.frames) throw new Error(`no tile ${n}`);
  return p;
};
/** The puddles (a drip over each). */
const PUDDLES: [number, number][] = [[-1, 10], [5, 8], [-2, 4], [6, -2], [1, -8], [3, 3]];
function layTiles(): void {
  const put = (x: number, y: number, n: string, f?: number): void => void laid.set(`${x},${y}`, f === undefined ? tileNamed(n).frames! : [tileNamed(n).frames![f]]);
  // THE ROOTS across the floor, out from the walls' feet
  // (the king's court: from its back wall, bending away along it)
  put(-3, 1, "a root's end, from high y");
  put(-2, 1, 'a root bending, low x to high y');
  put(-2, 2, 'a root along y');
  put(-2, 3, "a root's end, from low y");
  put(-4, 4, 'a root along x');
  put(-3, 4, 'a root bending, low x to high y');
  put(-3, 5, "a root's end, from low y");
  // (the stair hall: from its left wall by the stairs, and from its back)
  put(-4, 11, 'a root along x');
  put(-3, 11, 'a root along x');
  put(-2, 11, "a root's end, from low x");
  put(0, 7, 'a root along y');
  put(0, 8, "a root's end, from low y");
  // (the effigy hall)
  put(6, 7, 'a root along y');
  put(6, 8, 'a root bending, high x to low y');
  put(2, 11, 'a root along x');
  put(3, 11, "a root's end, from low x");
  // (the antechamber, from its back wall by the gate)
  put(2, 1, 'a root along y');
  put(2, 2, 'a root bending, high x to low y');
  put(3, 2, "a root's end, from low x");
  // (his hall: great roots in from its back walls, its middle kept open)
  put(-1, -6, 'a root along x');
  put(0, -6, 'a root along x');
  put(1, -6, "a root's end, from low x");
  put(8, -10, 'a root along y');
  put(8, -9, 'a root along y');
  put(8, -8, 'a root bending, high x to low y');
  put(7, -8, "a root's end, from high x");
  put(3, -10, 'a root along y');
  put(3, -9, "a root's end, from low y");
  // PUDDLES where the water drips
  for (const [x, y] of PUDDLES) put(x, y, 'a puddle');
  // MOSS; LEAVES AND EARTH fallen through the cracks
  for (const [x, y] of [[-4, 7], [-1, 1], [6, 11], [2, 5], [-1, -1], [8, -1], [-1, -10], [0, 5], [6, 4]]) put(x, y, 'moss');
  for (const [x, y] of [[0, 9], [-3, 3], [3, 4], [2, -7], [7, -6], [-2, 10]]) put(x, y, 'fallen leaves and earth');
  for (const [x, y] of [[4, 10], [-1, 8], [5, 5], [1, -3], [7, -4], [-3, 2], [5, 11]]) put(x, y, 'fallen leaves');
  // THE GRAVE SLABS OF THE KING'S COURT, two tiles long
  for (const x of [-1, 0]) {
    put(x, 2, 'a grave slab along y, its head');
    put(x, 3, 'a grave slab along y, its foot');
  }
  put(-4, 2, 'a grave slab along x, its head');
  put(-3, 2, 'a grave slab along x, its foot');
  put(-1, 4, 'a grave slab along x, its head');
  put(0, 4, 'a grave slab along x, its foot');
  // THE KING'S RUNNER from his gate to his throne (floor 1's own); the crown in the floor, a sunken slab, a drain, a ledger stone
  for (let ty = -1; ty >= -8; ty--) put(4, ty, "the king's runner", 3 + (ty % 2 === 0 ? 1 : 0));
  put(4, 3, 'the crown in the floor', 0);
  put(-2, 8, 'sunken grave slab', 0);
  put(5, 3, 'drain', 0);
  put(-3, 9, 'ledger stone', 0);
}

// =================================================================================================
// THE CAMERA: game pixels; the floor's (0, 0) at (OX, OY) on the run's picture (600 x 420 game pixels, at two picture pixels each)

let RW = 600;
let RH = 420;
let OX = 268;
let OY = 196;
const at = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * 16, OY + (x + y) * 8 - z];

let hero!: ReturnType<ReturnType<typeof makeHeroArt3>['of']>;
let boss!: ReturnType<typeof makeWardenArt>;
const piece = (n: string): Piece => {
  const p = A.pieces.find((q) => q.name === n);
  if (!p) throw new Error(`no piece ${n}`);
  return p;
};

/** THE SOFT SHADOW the game draws under what stands (render.ts): a soft oval, darkest under it, gone at its rim. */
const blot = ((): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const q = c.getContext('2d') as CanvasRenderingContext2D;
  const grd = q.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(0,0,0,1)');
  grd.addColorStop(0.4, 'rgba(0,0,0,0.85)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  q.fillStyle = grd;
  q.fillRect(0, 0, 64, 64);
  return c;
})();
const pool = ((): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const q = c.getContext('2d') as CanvasRenderingContext2D;
  const grd = q.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,0,0,1)');
  grd.addColorStop(0.5, 'rgba(0,0,0,0.7)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  q.fillStyle = grd;
  q.fillRect(0, 0, 128, 128);
  return c;
})();

interface Stand { d: number; s: Sprite; x: number; y: number; shadow: number; added?: boolean }

/** Where the floor's own pieces and the place's own stand. */
const THINGS: [string, number, number, number][] = [
  // his hall: the king's throne between two cressets, the chained tombs of his court at its back, horned knights, the Warden's racks
  ["the king's throne", 4.5, -9.3, 0], ['cresset', 3.0, -9.0, 0], ['cresset', 6.0, -9.0, 2], ['a chained tomb, along y', 1.6, -8.4, 0],
  ['a chained tomb, along y', 7.4, -8.4, 0], ['horned knight', 0.1, -5.4, 0], ['horned knight', 8.75, -5.4, 0], ['rack of mauls', 8.4, -1.0, 0],
  ["the king's coffer", 0.3, -1.1, 0], ['chain', 6.6, -3.2, 0], ['dropped keys', 2.6, -2.4, 0],
  // the stair hall
  ['open sarcophagus', 0.2, 7.7, 0], ['funeral urn', 0.5, 11.5, 0], ['fallen banner', -1.0, 11.4, 0],
  // the effigy hall: the court's tombs, chained
  ['a chained tomb, along y', 2.95, 9.6, 0], ['a chained tomb, along y', 6.15, 9.6, 0], ['squat urn', 2.4, 7.4, 0], ['skull jar', 6.6, 7.5, 0],
  ["the statue's head", 5.6, 11.6, 0],
  // the king's court
  ['horned knight', -3.6, 1.4, 0], ['bone box', -3.4, 5.6, 0], ['candles', 0.4, 1.5, 3], ['a tomb of the court, along x', -1.6, 5.3, 0],
  // the antechamber
  ['horned knight', 2.4, 3.1, 0], ['sarcophagus', 2.6, 4.4, 0], ['funeral urn', 6.5, 5.5, 0],
];
/** The shafts of daylight: where each falls, its size (look B's, through the roots' holes). */
const SHAFTS: [number, number, 'small' | 'middle' | 'large'][] = [
  [4.6, 9.2, 'large'], [-1.3, 10.6, 'middle'], [0.0, 8.3, 'small'], [6.2, 11.3, 'small'], [-2.6, 2.6, 'middle'], [0.1, 4.9, 'small'],
  [3.5, 4.2, 'small'], [2.0, -7.0, 'middle'], [7.1, -5.6, 'small'], [4.0, -2.0, 'small'],
];

/** THE LEVEL DRAWN, the knight at `heroAt`, the gate's drop at `raise` (and the lock alight once it is down), frame `frame`: RW x RH game pixels, at two picture pixels each. */
function scene(heroAt: [number, number], raise: number, frame = 1): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = RW * 2;
  cv.height = RH * 2;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#07060a';
  g.fillRect(0, 0, cv.width, cv.height);
  g.setTransform(2, 0, 0, 2, 0, 0);
  const draw = (s: Sprite, x: number, y: number): void => {
    g.drawImage(s.img, Math.round(x) - s.ax, Math.round(y) - s.ay, s.w, s.h);
  };
  const added = (s: Sprite, x: number, y: number): void => {
    g.globalCompositeOperation = 'lighter';
    draw(s, x, y);
    g.globalCompositeOperation = 'source-over';
  };

  // ---- THE FLOOR, a tile at a time; the shadow of a wall over it, the edge toward the eye against the dark
  for (let x = -9; x < 12; x++) for (let y = -12; y < 14; y++) {
    if (!isFloor(x, y)) continue;
    const [px, py] = at(x, y);
    draw(A.floor(x, y), px, py);
    const t = laid.get(`${x},${y}`);
    if (t) draw(t[frame % t.length], px, py);
    if (!isFloor(x - 1, y)) draw(ground.shadeLeft, px, py);
    if (!isFloor(x, y - 1)) draw(ground.shadeRight, px, py);
    if (!isFloor(x + 1, y)) draw(ground.edgeRight, px, py);
    if (!isFloor(x, y + 1)) draw(ground.edgeLeft, px, py);
  }
  // THE TOWN'S STAIRS, seen through their arch, with the floor (render.ts: anchored as the arch's strips are)
  {
    const wide = PILLAR / 32;
    draw(A.stairsUp(STAIRS.alongX), ...at(STAIRS.face, STAIRS.a - wide));
  }
  // THE DAYLIGHT WHERE IT FALLS, added to the floor; the town's daylight come down the stairs onto the floor at their foot
  for (const [x, y, n] of SHAFTS) added(piece(`daylight on the floor, ${n}`).frames![0], ...at(x, y));
  added(piece('daylight on the floor, large').frames![0], ...at(STAIRS.face + TOMB_LIGHTS.stairs.into, STAIRS.a + 1.5));

  // ---- WHAT STANDS, sorted as the renderer sorts it
  const stands: Stand[] = [];
  const lit: { s: Sprite; x: number; y: number }[] = [];
  const stand = (d: number, s: Sprite, x: number, y: number, shadow = 0, add = false): void => void stands.push({ d, s, x, y, shadow, added: add });
  const wallLights: [number, number][] = [];
  for (let x = -10; x < 12; x++) for (let y = -12; y < 14; y++) {
    if (isFloor(x, y) || away(x, y)) continue;
    const d = x + y + 1;
    for (const alongX of [true, false]) {
      const [fx, fy] = alongX ? [x, y + 1] : [x + 1, y];
      if (!isFloor(fx, fy)) continue;
      if (!alongX && inStairs(x, y)) continue;
      const k = (((alongX ? x : y) % 8) + 8) % 8;
      const s = inHall(x, y) ? (alongX ? A.hall.faceLeft : A.hall.faceRight)[k][frame % 4] : A.face(alongX, x, y, frame);
      stand(d, s, x, y);
      wallLights.push(alongX ? [x + 0.5, y + 1] : [x + 1, y + 0.5]);
    }
  }
  // THE THINGS THAT STAND: floor 1's own, in look B's colours; the place's own
  for (const [n, x, y, f] of THINGS) {
    const p = piece(n);
    stand(x + y, p.frames![f % p.frames!.length], x, y, p.shadow ?? 0);
  }
  // THE COLUMNS OF LIT AIR (added), stood at the back of their pools, so that what stands in them is drawn over them
  for (const [x, y, n] of SHAFTS) {
    const p = piece(`a shaft of daylight, ${n}`);
    stand(x + y - 0.7, p.frames![frame % 4], x, y, 0, TOMB_ADDED.has(p.name));
  }
  for (const [x, y] of PUDDLES) stand(x + y + 0.5, piece('water dripping').frames![(frame * 3 + x * 5 + y * 3 + 80) % 8], x + 0.46, y + 0.48);
  // THE WAYS BETWEEN THE ROOMS, THE TOWN'S STAIRS' ARCH and HIS GATE, as render.ts stands a gate: its strips at the face's line
  const pAt = (w: Way, t: number, back = 0): [number, number] => (w.alongX ? [w.a + t, w.face - back] : [w.face - back, w.a + t]);
  const strips = (w: Way, list: Strip[], t0: number, back: number): void => {
    for (const q of list) {
      const [x, y] = pAt(w, t0 + q.t, back);
      stand(x + y + STRIP / 64, q.s, x, y);
    }
  };
  for (const w of ARCHWAYS) strips(w, A.archway(w.alongX), 0, 0);
  const wide = PILLAR / 32;
  {
    for (const [x, y] of [pAt(STAIRS, 0), pAt(STAIRS, 3 + wide)]) stand(x + y - wide, G.pillar(false), x, y);
    strips(STAIRS, G.arch(STAIRS.alongX, false, false), -wide, 0);
  }
  {
    for (const [x, y] of [pAt(GATE, 0), pAt(GATE, 3 + wide)]) stand(x + y - wide, G.pillar(true), x, y);
    strips(GATE, G.portcullis(true, true, raise), -wide, wide);
    strips(GATE, G.arch(true, true, raise === 0), -wide, 0);
  }
  // HIM, in his hall; THE KNIGHT
  stand(BOSS[0] + BOSS[1], boss.front.idle[0], BOSS[0], BOSS[1], 0.62);
  stand(heroAt[0] + heroAt[1], hero.front.idle[0], heroAt[0], heroAt[1], 0.36);
  stands.sort((p, q) => p.d - q.d);
  for (const st of stands) {
    const [sx, sy] = at(st.x, st.y);
    if (st.shadow) {
      const w = st.shadow * 22.6 * 1.5;
      const hh = st.shadow * 11.3 * 1.5;
      g.save();
      g.imageSmoothingEnabled = true;
      g.globalAlpha = 0.7;
      g.drawImage(blot, sx - w, sy - hh, w * 2, hh * 2);
      g.restore();
    }
    if (st.added) added(st.s, sx, sy);
    else draw(st.s, sx, sy);
    if (st.s.lights) lit.push({ s: st.s, x: Math.round(sx), y: Math.round(sy) });
  }

  // ---- THE DARK, as the renderer lays it (render.ts, light): over everything, a hole cut by each light
  const L = TOMB_LIGHTS;
  const dark = document.createElement('canvas');
  dark.width = RW;
  dark.height = RH;
  const dg = dark.getContext('2d') as CanvasRenderingContext2D;
  dg.fillStyle = `rgba(${L.dark.rgb.join(',')},${L.dark.a})`;
  dg.fillRect(0, 0, RW, RH);
  dg.globalCompositeOperation = 'destination-out';
  dg.imageSmoothingEnabled = true;
  const spot = (x: number, y: number, r: number, strength: number): void => {
    dg.globalAlpha = Math.min(1, strength);
    dg.drawImage(pool, Math.round(x - r), Math.round(y - r * 0.62), Math.round(r * 2), Math.round(r * 1.24));
  };
  const [hx, hy] = at(heroAt[0], heroAt[1]);
  spot(hx, hy - 8, 380, 0.36);
  spot(hx, hy - 8, 165, 1);
  const glowsOver: [number, number, number, string, number][] = [];
  // the shafts: a hole where each falls, a fainter one up its column, a green-gold glow at its foot
  for (const [x, y, n] of SHAFTS) {
    const [px, py] = at(x, y);
    spot(px, py, L.shaft[n].r, L.shaft[n].strength);
    spot(px - 10, py - L.shaft.column.up, L.shaft.column.r, L.shaft.column.strength);
    glowsOver.push([px, py - 4, L.shaft.glow.r, L.shaft.glow.color, L.shaft.glow.a]);
  }
  // the town's daylight down the stairs
  {
    const [px, py] = at(STAIRS.face + L.stairs.into, STAIRS.a + 1.5);
    spot(px, py - L.stairs.up, L.stairs.r, L.stairs.strength);
    glowsOver.push([px, py - L.stairs.up, L.stairs.glow.r, L.stairs.glow.color, L.stairs.glow.a]);
  }
  // the walls: a low hole at the foot of every face, the stone reading in the rooms' daylight
  for (const [x, y] of wallLights) {
    const [px, py] = at(x, y);
    spot(px, py - L.wall.up, L.wall.r, L.wall.strength);
  }
  // the cressets (their glows are on their pictures), the lock alight, his own
  const cressets = new Set(piece('cresset').frames);
  for (const q of lit) {
    const l = q.s.lights![0];
    const [lx, ly] = [q.x - q.s.ax + l.x, q.y - q.s.ay + l.y];
    if (cressets.has(q.s)) spot(q.x, q.y - L.cresset.up, L.cresset.r, L.cresset.strength);
    else spot(lx, ly, 30, 0.6);
  }
  {
    const [cx, cy] = at(BOSS[0], BOSS[1]);
    spot(cx, cy - 12, 56, 0.7);
  }
  dg.globalAlpha = 1;
  dg.globalCompositeOperation = 'source-over';
  {
    dg.save();
    dg.translate(RW / 2, RH / 2);
    dg.scale(RW / 2, RH / 2);
    const grd = dg.createRadialGradient(0, 0, 0.55, 0, 0, Math.SQRT2);
    grd.addColorStop(0, 'rgba(4,3,10,0)');
    grd.addColorStop(1, 'rgba(4,3,10,0.62)');
    dg.fillStyle = grd;
    dg.fillRect(-1, -1, 2, 2);
    dg.restore();
  }
  g.setTransform(2, 0, 0, 2, 0, 0);
  g.drawImage(dark, 0, 0);
  // ---- WHAT GIVES LIGHT, over the dark: the cressets', the lock's own glows; the daylight's glow at the shafts' feet
  for (const q of lit) drawLights(g, q.s, q.x, q.y);
  for (const [x, y, r, c, a] of glowsOver) drawGlow(g, x, y, r, c, a);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return cv;
}

// =================================================================================================

/** One phone screen (507 x 234 game pixels at two picture pixels each), the camera on the knight a little up the screen of him. */
function phone(heroAt = HERO_RUN): HTMLCanvasElement {
  const keep = [RW, RH, OX, OY];
  RW = 507;
  RH = 234;
  OX = Math.round(253 - (heroAt[0] - heroAt[1]) * 16);
  OY = Math.round(117 + 14 - (heroAt[0] + heroAt[1]) * 8);
  const cv = scene(heroAt, GATE_UP);
  [RW, RH, OX, OY] = keep;
  return cv;
}
/** A part of the run, `k` times the game's size. */
function crop(src: HTMLCanvasElement, cx: number, cy: number, W: number, H: number, k: number): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = W * k;
  cv.height = H * k;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#07060a';
  g.fillRect(0, 0, cv.width, cv.height);
  g.drawImage(src, (cx - W / 2) * 2, (cy - H / 2) * 2, W * 2, H * 2, 0, 0, W * k, H * k);
  return cv;
}
/** The gate close, the knight before it, twice as big: its drop up (as he comes to it) or down (behind him, the lock alight). */
function gate(raise: number, heroAt: [number, number]): HTMLCanvasElement {
  const [gx, gy] = at(4.5, 1);
  return crop(scene(heroAt, raise), gx, gy - 62, 140, 150, 4);
}
/** Where you come down from the town, twice as big: the stairs in the stair hall's wall, the daylight down them, the knight at their foot. */
function close(): HTMLCanvasElement {
  const [cx, cy] = at(-2.6, 9.2);
  return crop(scene(HERO_DOWN, GATE_UP), cx + 64, cy - 30, 300, 166, 4);
}

async function sheet(): Promise<HTMLCanvasElement> {
  const SW = 1200;
  const picked = await new Promise<HTMLImageElement | null>((ok) => {
    const im = new Image();
    im.onload = () => ok(im);
    im.onerror = () => ok(null);
    im.src = '../docs/mockups/floor1_look/pictures/b_the_roots_break_in.png';
  });
  const blocks: { h: number; draw: (g: CanvasRenderingContext2D, y: number) => void }[] = [];
  const text = (s: string, size: number, bold = false, color = '#e8dccb'): void => {
    blocks.push({
      h: size + 18,
      draw: (g, y) => {
        g.fillStyle = color;
        g.font = `${bold ? 'bold ' : ''}${size}px sans-serif`;
        g.textBaseline = 'top';
        g.fillText(s, 24, y + 10);
      },
    });
  };
  text("Floor 1, the king's tomb: B, the roots break in, built for the game.", 25, true);
  text('Left: built from the new pieces, laid and lit the way the game does it. Right: B as you saw it.', 18, false, '#b8ab98');
  const run = scene(HERO_RUN, GATE_UP);
  blocks.push({
    h: RH + 14,
    draw: (g, y) => {
      g.imageSmoothingEnabled = true;
      g.drawImage(run, 0, y, RW, RH);
      if (picked) g.drawImage(picked, RW, y, RW, RH);
      g.imageSmoothingEnabled = false;
      g.fillStyle = '#e8dccb';
      g.font = 'bold 18px sans-serif';
      g.fillText('For the game', 12, y + 22);
      g.fillText('B, as you saw it', RW + 12, y + 22);
    },
  });
  text('Where you come down from the town, twice as big: the daylight down the stairs, roots through the walls.', 18, true);
  const cl = close();
  blocks.push({ h: cl.height + 14, draw: (g, y) => g.drawImage(cl, Math.round((SW - cl.width) / 2), y) });
  text("On a phone: one screen at the game's own size, the knight in a shaft of daylight.", 18, true);
  const ph = phone();
  blocks.push({ h: ph.height + 14, draw: (g, y) => g.drawImage(ph, Math.round((SW - ph.width) / 2), y) });
  text("His gate close, twice as big: the bars up as you come to it; down behind you as the fight begins, the lock alight.", 17, true);
  const up = gate(GATE_UP, HERO_GATE);
  const down = gate(0, HERO_IN);
  blocks.push({
    h: up.height + 16,
    draw: (g, y) => {
      g.drawImage(up, 30, y);
      g.drawImage(down, 30 + up.width + 20, y);
    },
  });
  const total = blocks.reduce((t, b) => t + b.h, 0);
  const cv = document.createElement('canvas');
  cv.width = SW;
  cv.height = total;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#0a0809';
  g.fillRect(0, 0, SW, total);
  let y = 0;
  for (const b of blocks) {
    b.draw(g, y);
    y += b.h;
  }
  return cv;
}

void (async () => {
  await new Promise((ok) => setTimeout(ok, 0));
  A = makeTombArt();
  G = makeTombGateArt();
  hero = makeHeroArt3().of('warrior', { twoHanded: false });
  boss = makeWardenArt();
  layTiles();
  const out = mode === 'sheet' ? await sheet() : mode === 'phone' ? phone() : mode === 'close' ? close() : mode === 'gate' ? (() => {
    const c = document.createElement('canvas');
    const a = gate(GATE_UP, HERO_GATE);
    const b = gate(0, HERO_IN);
    c.width = a.width * 2;
    c.height = a.height;
    const q = c.getContext('2d') as CanvasRenderingContext2D;
    q.drawImage(a, 0, 0);
    q.drawImage(b, a.width, 0);
    return c;
  })() : scene(HERO_RUN, GATE_UP);
  out.style.display = 'block';
  document.body.style.margin = '0';
  document.body.style.background = '#000';
  document.body.appendChild(out);
  (window as unknown as { __size: [number, number] }).__size = [out.width, out.height];
  (window as unknown as { __ready: boolean }).__ready = true;
})();
