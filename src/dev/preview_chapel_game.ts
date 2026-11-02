// Dev page: FLOOR 4, THE BURIED CHAPEL OF BONES, LOOK A WITH B'S BREAK-IN, BUILT FROM ITS GAME-READY PIECES (art/chapel.ts,
// behind CHAPEL, off; his gate, art/chapel_gate.ts, behind CHAPEL_GATE, off), laid tile by tile as the game lays a level: the
// floor a tile at a time (the flags, and the chapel's own tiles laid in their place), the walls a face at a time where floor
// lies before them and none that would hide floor behind them (render/walls.ts, wallsAway: the game's rule), what stands sorted
// as the renderer sorts it, the gate as render.ts stands a boss gate; then the dark laid over it with holes where the lights
// are, and the lights' glow drawn over that, as the renderer does (render.ts, light). Nothing of the game imports it.
//   node tools/preview.mjs src/dev/preview_chapel_game.ts shots/chapel/run.png 1200 840 "run"
//   node tools/preview.mjs src/dev/preview_chapel_game.ts shots/chapel/phone.png 1014 468 "phone"
//   node tools/preview.mjs src/dev/preview_chapel_game.ts shots/chapel/gate.png 1140 600 "gate"
//   node tools/preview.mjs src/dev/preview_chapel_game.ts docs/mockups/floor4_look/pictures/game_ready.png 1200 2400 "sheet"
//   (PREVIEW_TIMEOUT=200000: the cave's film is painted for its first frame)
import type { Sprite } from '../engine/px';
import { drawGlow, drawLights } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { makeAmalgamActionArt } from '../art/amalgam_action';
import { cryptGround } from '../art/crypt';
import type { Piece } from '../art/floorkit';
import { GATE_UP, PILLAR, STRIP } from '../art/gates';
import type { Strip } from '../art/gates';
import type { GateArt } from '../art/gates';
import { CHAPEL_LIGHTS, makeChapelArt } from '../art/chapel';
import type { ChapelArt } from '../art/chapel';
import { makeChapelGateArt } from '../art/chapel_gate';

const [mode = 'run'] = decodeURIComponent(location.hash.slice(1)).split(':');
// (made once the page has loaded: painting them takes a while)
let A!: ChapelArt;
let G!: GateArt;
const ground = cryptGround(4);

// =================================================================================================
// THE LEVEL, in tiles (x down the screen to the right, y down to the left): floor 4 laid COMBO as the look's pictures had it,
// four small chapels you find your way through, but as the game would build it: the first chapel (D, bottom left) with THE WAY
// IN from floor 3 in its left wall and THE BREAK-IN in its back wall; the side chapel (C) with a second break-in in its left
// wall; the nave bay (B); the chapel before the gate (A); the boss's doorway with his gate; his hall, flat, the cult's altar at
// its back, its piers in its back corners, the cave's stretch of its left back wall.

type R = { x0: number; y0: number; x1: number; y1: number };
const ROOMS: R[] = [
  { x0: -1, y0: -9, x1: 8, y1: 0 }, // his hall
  { x0: 2, y0: 0, x1: 5, y1: 1 }, // the doorway
  { x0: 1, y0: 1, x1: 6, y1: 6 }, // A, before the gate
  { x0: 1, y0: 7, x1: 6, y1: 12 }, // B, the nave bay
  { x0: -4, y0: 1, x1: 0, y1: 6 }, // C, the side chapel
  { x0: -7, y0: 7, x1: 0, y1: 12 }, // D, the first chapel
  { x0: 2, y0: 6, x1: 5, y1: 7 }, // A to B
  { x0: -3, y0: 6, x1: 0, y1: 7 }, // C to D
  { x0: 0, y0: 2, x1: 1, y1: 5 }, // C to A
  { x0: 0, y0: 8, x1: 1, y1: 11 }, // D to B
];
const isFloor = (x: number, y: number): boolean => ROOMS.some((r) => x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1);
const inHall = (x: number, y: number): boolean => x >= -2 && x <= 8 && y >= -10 && y <= -1;
/** A wall that would hide floor behind it is left out (render/walls.ts, wallsAway: the game's faces look, solid 28 game pixels). */
const away = (x: number, y: number): boolean => {
  for (const [a, b] of [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]] as const) if (isFloor(x - a, y - b)) return true;
  return false;
};
/** The stretches of three tiles that take the place of wall tiles: the way in, the break-ins, the cave. `a` the first tile along the wall, `row` the wall's row (along x: its y; along y: its x). */
interface Stretch3 { alongX: boolean; a: number; row: number }
const WAY_IN: Stretch3 = { alongX: false, a: 8, row: -8 };
const BREAKS: Stretch3[] = [{ alongX: true, a: -7, row: 6 }, { alongX: false, a: 2, row: -5 }];
const CAVE: Stretch3 = { alongX: false, a: -7, row: -2 };
const stretches = [WAY_IN, ...BREAKS, CAVE];
const inStretch = (x: number, y: number, alongX: boolean): Stretch3 | undefined =>
  stretches.find((s) => s.alongX === alongX && (alongX ? y === s.row && x >= s.a && x < s.a + 3 : x === s.row && y >= s.a && y < s.a + 3));
/** A stretch's anchor: the foot of the face under the middle of its middle tile (render/dress.ts anchorOf). */
const anchorOf = (s: Stretch3): [number, number] => (s.alongX ? [s.a + 1.5, s.row + 1] : [s.row + 1, s.a + 1.5]);
/** Where he stands, and where the knight stands: in the first chapel (the run, the phone), at the gate, in the hall. */
const BOSS: [number, number] = [3.4, -4.6];
const HERO_RUN: [number, number] = [-3.6, 9.4];
const HERO_PHONE: [number, number] = [-1.6, 8.8];
const HERO_GATE: [number, number] = [3.3, 2.1];
const HERO_IN: [number, number] = [1.6, -1.0];

/** The floor tiles of the chapel's own laid in their place (by "x,y"). */
const laid = new Map<string, Sprite>();
const tileNamed = (n: string, f = 0): Sprite => {
  const p = A.tiles.find((q) => q.name === n) ?? A.pieces.find((q) => q.name === n);
  if (!p?.frames) throw new Error(`no tile ${n}`);
  return p.frames[f % p.frames.length];
};
function layTiles(): void {
  const put = (x: number, y: number, n: string): void => void laid.set(`${x},${y}`, tileNamed(n));
  // grave slabs: two tiles long in the nave bay, the chapel before the gate and his hall; one tile in the side chapel
  for (const [x, y] of [[2, 8], [4, 8], [2, 3], [4, 3], [0, -6], [6, -6], [0, -3], [6, -3]]) {
    put(x, y, 'a grave slab along y, its head');
    put(x, y + 1, 'a grave slab along y, its foot');
  }
  put(-4, 10, 'a grave slab along x, its head');
  put(-3, 10, 'a grave slab along x, its foot');
  for (const [x, y] of [[-3, 2], [-2, 2], [3, 10]]) put(x, y, 'a grave slab');
  // bone dust at the feet of the walls that stand, in drifts, chips
  for (const x of [-1, 1, 2, 5, 7]) put(x, -9, 'bone dust at a wall along x');
  for (const y of [-9, -4, -2]) put(-1, y, 'bone dust at a wall along y');
  for (const y of [1, 5]) put(-4, y, 'bone dust at a wall along y');
  for (const y of [7, 11]) put(-7, y, 'bone dust at a wall along y');
  for (const x of [-4, -3, -2]) if (!laid.has(`${x},1`)) put(x, 1, 'bone dust at a wall along x');
  for (const [x, y] of [[5, 4], [1, 11], [-1, 3], [6, -1], [3, 5]]) put(x, y, 'bone dust');
  for (const [x, y] of [[4, 1], [1, -2], [3, 9], [-2, 4], [5, 10], [-5, 11], [2, -5]]) put(x, y, 'bone chips');
  // WHERE THE MINE BROKE IN: rubble at the breaks' feet, earth spilled further out
  for (const x of [-7, -6, -5]) put(x, 7, 'rubble from the break, along x');
  for (const x of [-7, -6, -5, -4]) put(x, 8, 'earth spilled from the break, along x');
  for (const y of [2, 3, 4]) put(-4, y, 'rubble from the break, along y');
  for (const y of [2, 3, 4]) put(-3, y, 'earth spilled from the break, along y');
}

// =================================================================================================
// THE CAMERA: game pixels; the floor's (0, 0) at (OX, OY) on the run's picture (600 x 420 game pixels, at two picture pixels each)

let RW = 600;
let RH = 420;
let OX = 308;
let OY = 196;
const at = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * 16, OY + (x + y) * 8 - z];

let hero!: ReturnType<ReturnType<typeof makeHeroArt3>['of']>;
let boss!: ReturnType<typeof makeAmalgamActionArt>;
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

interface Stand { d: number; s: Sprite; x: number; y: number; z: number; shadow: number; lit: boolean }

/** The candles on the floor (the pieces): where, and how many. */
const CANDLES: [number, number, 'many' | 'a few'][] = [
  [1.55, 1.45, 'many'], [5.45, 1.45, 'many'], [1.5, 5.5, 'a few'], [5.4, 5.4, 'a few'], [1.4, 7.4, 'a few'], [5.6, 11.4, 'many'], [-6.6, 7.5, 'a few'],
  [-0.5, 11.4, 'a few'], [-3.6, 1.4, 'many'], [-0.6, 5.5, 'a few'], [2.0, -8.2, 'many'], [5.1, -8.2, 'many'], [-0.5, -8.4, 'a few'], [7.4, -1.0, 'a few'],
  [-0.5, -0.6, 'a few'], [-6.5, 11.5, 'a few'], [2.6, -6.0, 'a few'], [4.6, -6.0, 'a few'],
];

/** THE LEVEL DRAWN, the knight at `heroAt`, the gate's drop at `raise` (and his maw alight once it is down), frame `frame`: RW x RH game pixels, at two picture pixels each. */
function scene(heroAt: [number, number], raise: number, frame = 1): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = RW * 2;
  cv.height = RH * 2;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#060508';
  g.fillRect(0, 0, cv.width, cv.height);
  g.setTransform(2, 0, 0, 2, 0, 0);
  const draw = (s: Sprite, x: number, y: number): void => {
    g.drawImage(s.img, Math.round(x) - s.ax, Math.round(y) - s.ay, s.w, s.h);
  };

  // ---- THE FLOOR, a tile at a time; the shadow of a wall over it, the edge toward the eye against the dark
  for (let x = -9; x < 10; x++) for (let y = -12; y < 14; y++) {
    if (!isFloor(x, y)) continue;
    const [px, py] = at(x, y);
    draw(laid.get(`${x},${y}`) ?? A.floor(x, y), px, py);
    if (!isFloor(x - 1, y)) draw(ground.shadeLeft, px, py);
    if (!isFloor(x, y - 1)) draw(ground.shadeRight, px, py);
    if (!isFloor(x + 1, y)) draw(ground.edgeRight, px, py);
    if (!isFloor(x, y + 1)) draw(ground.edgeLeft, px, py);
  }

  // ---- WHAT STANDS, sorted as the renderer sorts it
  const stands: Stand[] = [];
  const lit: { s: Sprite; x: number; y: number }[] = [];
  const niches: { x: number; y: number; hall: boolean }[] = [];
  const stand = (d: number, s: Sprite, x: number, y: number, z = 0, shadow = 0): void => {
    stands.push({ d, s, x, y, z, shadow, lit: !!s.lights });
  };
  // THE WALLS: a wall tile's face where floor lies before it (along x: floor at y + 1; along y: at x + 1), none that would hide
  // floor behind it; his hall's walls its own; where a stretch of three stands (the way in, a break-in, the cave), it in their place
  for (let x = -10; x < 10; x++) for (let y = -12; y < 14; y++) {
    if (isFloor(x, y) || away(x, y)) continue;
    const d = x + y + 1;
    if (isFloor(x, y + 1)) {
      if (!inStretch(x, y, true)) {
        const s = inHall(x, y) ? A.hall.faceLeft[((x % 4) + 4) % 4][frame % 4] : A.face(true, x, y, frame);
        stand(d, s, x, y);
        niches.push({ x: x + 0.5, y: y + 1, hall: inHall(x, y) });
      }
    }
    if (isFloor(x + 1, y)) {
      if (!inStretch(x, y, false)) {
        const s = inHall(x, y) ? A.hall.faceRight[((y % 4) + 4) % 4][frame % 4] : A.face(false, x, y, frame);
        stand(d, s, x, y);
        niches.push({ x: x + 1, y: y + 0.5, hall: inHall(x, y) });
      }
    }
  }
  // THE STRETCHES: the way in, the break-ins (and the rock spilled before each), the cave's wall standing (he lives)
  const way = A.wayIn(WAY_IN.alongX).frames[frame % 4];
  {
    const [x, y] = anchorOf(WAY_IN);
    stand(x + y, way, x, y);
  }
  for (const b of BREAKS) {
    const [x, y] = anchorOf(b);
    stand(x + y, A.breakIn(b.alongX).frames[frame % 4], x, y);
    const [sx, sy] = b.alongX ? [x, y + 0.32] : [x + 0.32, y];
    stand(sx + sy, piece(`rock spilled from the break, ${b.alongX ? 'along x' : 'along y'}`).frames![0], sx, sy, 0, 0.5);
  }
  {
    const [x, y] = anchorOf(CAVE);
    stand(x + y, A.hall.cave(CAVE.alongX).before, x, y);
  }
  // WHAT IS SET IN THE WALLS (as render/pieces.ts sets a wall piece: at the foot of the face under its tile's middle)
  const onWall = (n: string, tx: number, ty: number, alongX: boolean, spot = 0): void => {
    const p = piece(n);
    const q = p.spots?.[spot % p.spots.length];
    const list = q ? (alongX ? q.left : q.right) : alongX ? p.left! : p.right!;
    const s = list[frame % list.length];
    const [wx, wy] = alongX ? [tx + 0.5, ty + 1] : [tx + 1, ty + 0.5];
    stand(tx + ty + 1.01, s, wx, wy);
  };
  onWall("the cult's candle", 0, -10, true, 0);
  onWall("the cult's candle", 6, -10, true, 1);
  onWall('garland of skulls', 3, -10, true, 1);
  onWall('garland of skulls', -2, -3, false, 0);
  onWall("the cult's daub", -3, 0, true, 1);
  onWall("the dead's arm", -5, 5, false, 1);
  onWall('garland of skulls', -8, 11, false, 2);
  // THE THINGS THAT STAND: floor 4's own, in look A's colours; the break-in's; the hall's piers and the cult's altar
  const things: [string, number, number, number][] = [
    ["the cult's altar", 3.5, -8.35, frame], ['a pier of the hall, its ribs toward x', -0.66, -9.66, 0], ['a pier of the hall, its ribs away from x', 7.66, -9.66, 0],
    ['the charnel heap', 6.6, -1.6, 0], ['pyramid of skulls', 6.8, -6.0, 0], ['heap of skulls', 5.3, 4.8, 0], ['rib cage', 5.2, 10.6, 0],
    ["a cultist's robe", 4.9, 2.4, 0], ['oil jug', 1.6, 2.2, 0], ['the reliquary', -3.6, 4.9, 0], ['heap of skulls', -1.4, 1.8, 0],
    ['pyramid of skulls', -0.8, 9.2, 0], ['a broken pew', -3.0, 10.7, 0], ['a pew thrown down', -1.5, 8.2, 0], ['a dropped pick', -4.4, 8.25, 0],
    ["the rails' end", -6.2, 9.9, 0], ['the eldest skull', 2.6, 10.6, 0],
  ];
  for (const [n, x, y, f] of things) {
    const p = piece(n);
    stand(x + y, p.frames![f % p.frames!.length], x, y, 0, p.shadow ?? 0);
  }
  for (const [x, y, n] of CANDLES) stand(x + y, piece(`candles on the floor, ${n}`).frames![frame % 4], x, y);
  // HIS GATE, as render.ts stands a boss gate: its pillars, its drop at the back of the arch, the arch's strips
  {
    const a = 2;
    const face = 1;
    const wide = PILLAR / 32;
    const pAt = (t: number, back = 0): [number, number] => [a + t, face - back];
    const strips = (list: Strip[], t0: number, back: number): void => {
      for (const q of list) {
        const [x, y] = pAt(t0 + q.t, back);
        stand(x + y + STRIP / 64, q.s, x, y);
      }
    };
    for (const [x, y] of [pAt(0), pAt(3 + wide)]) stand(x + y - wide, G.pillar(true), x, y);
    strips(G.portcullis(true, true, raise), -wide, wide);
    strips(G.arch(true, true, raise === 0), -wide, 0);
  }
  // HIM, in his hall; THE KNIGHT
  stand(BOSS[0] + BOSS[1], boss.front.idle[0], BOSS[0], BOSS[1], 0, 0.9);
  stand(heroAt[0] + heroAt[1], hero.front.idle[0], heroAt[0], heroAt[1], 0, 0.36);
  stands.sort((p, q) => p.d - q.d);
  for (const st of stands) {
    const [sx, sy] = at(st.x, st.y, st.z);
    if (st.shadow) {
      const w = st.shadow * 22.6 * 1.5;
      const hh = st.shadow * 11.3 * 1.5;
      g.save();
      g.imageSmoothingEnabled = true;
      g.globalAlpha = 0.7;
      g.drawImage(blot, sx - w, sy - hh, w * 2, hh * 2);
      g.restore();
    }
    draw(st.s, sx, sy);
    if (st.lit) lit.push({ s: st.s, x: Math.round(sx), y: Math.round(sy) });
  }

  // ---- THE DARK, as the renderer lays it (render.ts, light): over everything, a hole cut by each light
  const dark = document.createElement('canvas');
  dark.width = RW;
  dark.height = RH;
  const dg = dark.getContext('2d') as CanvasRenderingContext2D;
  dg.fillStyle = `rgba(6,4,14,${CHAPEL_LIGHTS.dark})`;
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
  const L = CHAPEL_LIGHTS;
  const glowsOver: [number, number, number, string, number][] = [];
  // the niches' candles, one to every tile of wall
  for (const q of niches) {
    const k = q.hall ? L.hallNiche : L.niche;
    const [px, py] = at(q.x, q.y);
    spot(px, py - k.up, k.r, k.strength);
    glowsOver.push([px, py - k.up, k.glow.r, k.glow.color, k.glow.a]);
  }
  // the candles on the floor
  for (const [x, y] of CANDLES) {
    const [px, py] = at(x, y);
    spot(px, py - L.floorCandles.up, L.floorCandles.r, L.floorCandles.strength);
  }
  // the lanterns on the break-ins' props (their glow is on their pictures), the way in's firelight up the stair
  for (const s of [...BREAKS.map((b) => ({ b, sp: A.breakIn(b.alongX).frames[frame % 4] })), { b: WAY_IN, sp: way }]) {
    const [x, y] = anchorOf(s.b);
    const [px, py] = at(x, y);
    const l = s.sp.lights![0];
    const k = s.b === WAY_IN ? L.wayIn : L.lantern;
    spot(px - s.sp.ax + l.x, py - s.sp.ay + l.y, k.r, k.strength);
  }
  // the cult's altar's candles and the cult's candles on the walls are lit as a brazier (render.ts lights a brazier so)
  {
    const [kx, ky] = at(3.5, -8.35);
    spot(kx, ky - 14, 62, 0.9);
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
  // ---- WHAT GIVES LIGHT, over the dark: the candles' and lanterns' own lights, the niches' glow
  for (const q of lit) drawLights(g, q.s, q.x, q.y);
  for (const [x, y, r, c, a] of glowsOver) drawGlow(g, x, y, r, c, a);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return cv;
}

// =================================================================================================

/** One phone screen (507 x 234 game pixels at two picture pixels each), the camera on the knight a little up the screen of him. */
function phone(): HTMLCanvasElement {
  // (the camera on the knight: the level drawn on a screen of the phone's own size, its dark and its vignette the screen's)
  const keep = [RW, RH, OX, OY];
  RW = 507;
  RH = 234;
  OX = Math.round(253 - (HERO_PHONE[0] - HERO_PHONE[1]) * 16);
  OY = Math.round(117 + 14 - (HERO_PHONE[0] + HERO_PHONE[1]) * 8);
  const cv = scene(HERO_PHONE, GATE_UP);
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
  g.fillStyle = '#060508';
  g.fillRect(0, 0, cv.width, cv.height);
  g.drawImage(src, (cx - W / 2) * 2, (cy - H / 2) * 2, W * 2, H * 2, 0, 0, W * k, H * k);
  return cv;
}
/** The gate close, the knight before it, twice as big: its drop up (as he comes to it) or down (behind him, the maw alight). */
function gate(raise: number, heroAt: [number, number]): HTMLCanvasElement {
  const [gx, gy] = at(3.5, 1);
  return crop(scene(heroAt, raise), gx, gy - 52, 140, 150, 4);
}
/** The first chapel close, twice as big: the way in from floor 3 and the break-in. */
function wayInClose(): HTMLCanvasElement {
  const [cx, cy] = at(-4.4, 8.4);
  return crop(scene(HERO_RUN, GATE_UP), cx, cy - 22, 300, 166, 4);
}

async function sheet(): Promise<HTMLCanvasElement> {
  const SW = 1200;
  const picked = await new Promise<HTMLImageElement | null>((ok) => {
    const im = new Image();
    im.onload = () => ok(im);
    im.onerror = () => ok(null);
    im.src = '../docs/mockups/floor4_look/pictures/a_candlelit.png';
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
  text("Floor 4, the buried chapel of bones: A with B's break-in, built for the game.", 26, true);
  text('Left: built from the new pieces, laid and lit the way the game does it. Right: A as you saw it.', 18, false, '#b8ab98');
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
      g.fillText('A, as you saw it', RW + 12, y + 22);
    },
  });
  text('Where you come in, twice as big: the stair down from floor 3 through its arch, and the mine broken through the wall.', 18, true);
  const close = wayInClose();
  blocks.push({ h: close.height + 14, draw: (g, y) => g.drawImage(close, Math.round((SW - close.width) / 2), y) });
  text("On a phone: one screen at the game's own size, the knight in the first chapel.", 18, true);
  const ph = phone();
  blocks.push({ h: ph.height + 14, draw: (g, y) => g.drawImage(ph, Math.round((SW - ph.width) / 2), y) });
  text('His gate close, twice as big: the bone grille up as you come to it; down behind you as the fight begins, his maw alight.', 18, true);
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
  A = makeChapelArt();
  G = makeChapelGateArt();
  hero = makeHeroArt3().of('warrior', { twoHanded: false });
  boss = makeAmalgamActionArt();
  layTiles();
  const out = mode === 'sheet' ? await sheet() : mode === 'phone' ? phone() : mode === 'close' ? wayInClose() : mode === 'gate' ? (() => {
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
