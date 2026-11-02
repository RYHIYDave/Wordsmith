// Dev page: THE FIRST TOWN AS THE CASTLE'S HALL, BUILT FROM ITS GAME-READY PIECES (art/castle_hall.ts behind CASTLE_HALL, off; its
// owl art/hall_owl.ts), laid as the game lays the town (game/level.ts makeTown, game/ways.ts: its floor a tile at a time, its two
// back walls a face at a time, none toward the eye; the stairs down, the shaft's head and its cage, the gate in the back wall,
// barred; everything that stands sorted as the renderer sorts it), every townsperson, vendor's place, the ring, the Lexicon, the
// stash, the waypoint and the cage the game's own pictures, as they are; the sun's slats and its light in the air ADDED to what
// is under them; then the town's own dark laid over it with holes where the lights are, and the lights' glow over that, as the
// renderer does (render.ts, light). Nothing of the game imports it.
//   node tools/preview.mjs src/dev/preview_castle_hall_game.ts shots/castle/town.png 1200 840 "town"
//   node tools/preview.mjs src/dev/preview_castle_hall_game.ts shots/castle/phone.png 1014 468 "phone"
//   node tools/preview.mjs src/dev/preview_castle_hall_game.ts shots/castle/owl.png 1200 604 "owl"
//   node tools/preview.mjs src/dev/preview_castle_hall_game.ts shots/castle/gate.png 1200 462 "gate"
//   PREVIEW_TIMEOUT=600000 node tools/preview.mjs src/dev/preview_castle_hall_game.ts docs/mockups/town_look/pictures/game_ready.png 1200 2237 "sheet"
import type { Sprite } from '../engine/px';
import { drawGlow, drawLights } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { makeDungeonProps } from '../art/props';
import { makeTownProps } from '../art/town';
import { townSprite } from '../art/townscene';
import type { TownArt } from '../art/townscene';
import { makeTownsfolk } from '../art/townsfolk';
import { gateBars, gateLeft, townShaft } from '../art/town_ways';
import { lookWays } from '../art/floors';
import { makeGroundArt } from '../art/ground';
import { GATE_UP, PILLAR, STRIP, makeGateArt } from '../art/gates';
import type { Strip } from '../art/gates';
import type { Piece } from '../art/floorkit';
import { AIR_DEPTH, CASTLE_ADDED, CASTLE_LIGHTS, CASTLE_OWL_AT, CASTLE_THEME, HALL, SUN, SUN_WINDOWS, TRUSSES_X, TRUSSES_Y, TRUSS_DEPTH, makeCastleHallArt } from '../art/castle_hall';
import type { CastleHallArt } from '../art/castle_hall';
import { OWL_NAMES, OWL_POSES, owlOnBeam } from '../art/hall_owl';

const [mode = 'town'] = decodeURIComponent(location.hash.slice(1)).split(':');
let A!: CastleHallArt;
const G0 = makeGateArt();
const GROUND = makeGroundArt(CASTLE_THEME);
const props = makeDungeonProps();
const ART: TownArt = { town: makeTownProps(), folk: makeTownsfolk() };
const hero = makeHeroArt3().of('warrior', { twoHanded: false, town: true });
const WAYS = lookWays(1);
const shaft = townShaft();

// =================================================================================================
// THE TOWN, as game/level.ts makes it: its floor x 6 to 21, y 6 to 19; the gate's doorway (x 13 to 15 at y 5) opened as floor;
// its back walls at y 5 (along x) and x 5 (along y); the walls toward the eye left out (render/walls.ts, the game's rule).

const isFloor = (x: number, y: number): boolean => (x >= HALL.x0 && x < HALL.x1 && y >= HALL.y0 && y < HALL.y1) || (y === 5 && x >= 13 && x <= 15);
const isWall = (x: number, y: number): boolean => !isFloor(x, y) && x >= HALL.x0 - 1 && x <= HALL.x1 && y >= HALL.y0 - 1 && y <= HALL.y1;
const GATE = { alongX: true, a: 13, face: 6 };
const STAIR = { x: 14, y: 17 };
const SHAFT = { x: 20, y: 18 };
const WAY = { x: 9.5, y: 7.5 };
const T = {
  lexicon: [13, 12], stash: [12, 18], armourer: [19, 7], anvil: [19, 8], forge: [20, 6], rack: [17, 6], trough: [21, 6], tentBack: [19, 11], mystic: [19, 12],
  tentTable: [19, 13], wordsmith: [9, 14], runeSlab: [9, 15], stranger: [6, 7],
} as const;
const STONES: [number, number][] = [[-2, -1], [-1, -2], [1, -2], [-2, 1], [2, -1], [-1, 2]];
const BRAZIERS: [number, number][] = [[11, 6], [16, 6], [6, 19]];
const PILLARS: [number, number][] = [[10, 9], [7, 10]];
const BARRELS: [number, number][] = [[21, 10], [21, 11], [6, 17]];
const URN: [number, number] = [20, 10];
/** The plants, where they stand (the castle hall's, as he saw it). */
const POTS: [string, number, number][] = [
  ['potted herbs', 7.55, 6.42], ['potted flowers', 12.45, 6.45], ['potted herbs', 12.35, 11.4], ['potted flowers', 14.1, 11.35], ['a fern in a pot', 17.35, 10.35],
  ['potted flowers', 17.4, 14.5], ['potted herbs', 11.25, 18.55], ['a bay tree in a pot', 21.55, 8.5], ['potted flowers', 11.4, 15.6], ['a fern in a pot', 13.2, 19.45],
  ['a bay tree in a pot', 6.42, 10.0], ['potted flowers', 6.42, 13.0], ['potted herbs', 6.42, 16.0], ['potted flowers', 8.7, 6.42],
];
const IVY: [boolean, number, number][] = [[true, 7.0, 6], [true, 10.0, 6], [false, 6, 9.2], [false, 6, 15.3], [false, 6, 12.2]];
/** The floor's own tiles laid over the flags. */
const LAID = new Map<string, string>();
function layTiles(): void {
  for (const [x, y] of [[6, 11], [7, 18], [8, 6], [16, 18], [20, 14], [6, 14], [11, 7], [18, 16]]) LAID.set(`${x},${y}`, 'moss');
  for (const [x, y] of [[9, 9], [13, 15], [15, 9], [8, 17], [17, 12], [20, 9], [10, 12], [14, 7]]) LAID.set(`${x},${y}`, 'moss, a little');
  for (const [x, y] of [[8, 11], [12, 9], [16, 15], [10, 17], [19, 16], [7, 13], [15, 13], [18, 9], [11, 13], [13, 8]]) LAID.set(`${x},${y}`, 'grass and flowers in the joints');
  for (const [x, y] of [[9, 12], [14, 10], [12, 16], [17, 17], [20, 12], [7, 8], [16, 8], [10, 10], [18, 13]]) LAID.set(`${x},${y}`, 'grass in the joints');
}
const HERO_AT: [number, number] = [15.7, 12.3];

// =================================================================================================
// THE CAMERA: game pixels; the floor's (0, 0) at (OX, OY) (the castle hall's picture as he saw it: 600 x 420 game pixels)

let RW = 600;
let RH = 420;
let OX = 284;
let OY = 55;
const at = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * 16, OY + (x + y) * 8 - z];
const tile = (n: string): Piece => {
  const p = [...A.tiles, ...A.pieces].find((q) => q.name === n);
  if (!p?.frames) throw new Error(`no piece ${n}`);
  return p;
};

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
interface Look { heroAt: [number, number]; raise: number; barred: boolean; time: number; lights: boolean }

/** THE TOWN DRAWN: RW x RH game pixels, at two picture pixels each. */
function scene(L: Look): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = RW * 2;
  cv.height = RH * 2;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#07050a';
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
  const t = L.time;

  // ---- THE STONE ABOVE THE GAME'S 80 AND THE ROOF: behind everything, over the dark above the back walls
  draw(A.roof, ...at(HALL.x0, HALL.y0));
  // ---- THE FLOOR, a tile at a time; the shadow of a wall over it; the edge toward the eye against the dark
  for (let x = 4; x < 24; x++) for (let y = 4; y < 22; y++) {
    if (!isFloor(x, y)) continue;
    const [px, py] = at(x, y);
    draw(A.floor(x, y), px, py);
    const n = LAID.get(`${x},${y}`);
    if (n) draw(tile(n).frames![0], px, py);
    const wl = isWall(x - 1, y);
    const wr = isWall(x, y - 1);
    if (wl) draw(GROUND.shadeLeft, px, py);
    if (wr) draw(GROUND.shadeRight, px, py);
    if (!wl && !wr && isWall(x - 1, y - 1)) draw(GROUND.shadeCorner, px, py);
    if (isWall(x + 1, y)) draw(GROUND.edgeRight, px, py);
    if (isWall(x, y + 1)) draw(GROUND.edgeLeft, px, py);
  }
  // ---- WHAT LIES ON THE FLOOR: the stairs down, the waypoint's dais (the game's), the rug, the ring cut in the floor (the game's)
  draw(A.stairs('x'), ...at(STAIR.x, STAIR.y));
  draw(WAYS.way.asleep, ...at(WAY.x, WAY.y));
  for (const [kind, p] of [['rug', T.mystic], ['runeRing', T.wordsmith]] as const) {
    const s = townSprite(ART, kind, 0, t);
    if (s) draw(s, ...at(p[0] + 0.5, p[1] + 0.5));
  }
  // THROUGH THE GATE: the passage and the day beyond, with the floor (anchored as the arch's strips are)
  const wide = PILLAR / 32;
  draw(A.gate.beyond(true), ...at(GATE.a - wide, GATE.face));
  // THE SUN'S SLATS on the floor, added
  for (let x = HALL.x0; x < HALL.x1; x++) for (let y = HALL.y0; y < HALL.y1; y++) {
    const s = A.sun(x, y);
    if (s) added(s, ...at(x, y));
  }

  // ---- WHAT STANDS, sorted as the renderer sorts it
  const stands: Stand[] = [];
  const lit: { s: Sprite; x: number; y: number }[] = [];
  const stand = (d: number, s: Sprite | null, x: number, y: number, shadow = 0, add = false): void => {
    if (s) stands.push({ d, s, x, y, shadow, added: add });
  };
  // the back walls, a face at a time
  for (let x = HALL.x0; x < HALL.x1; x++) if (isWall(x, HALL.y0 - 1)) stand(x + HALL.y0, A.face(true, x, HALL.y0 - 1), x, HALL.y0 - 1);
  for (let y = HALL.y0; y < HALL.y1; y++) stand(HALL.x0 + y, A.face(false, HALL.x0 - 1, y), HALL.x0 - 1, y);
  // the trusses on them, the owl on its beam
  const truss = tile('a hammer-beam truss').frames![0];
  const post = tile('a wall post and brace').frames![0];
  for (const xt of TRUSSES_X) stand(xt + HALL.y0 + TRUSS_DEPTH, truss, xt, HALL.y0);
  for (const yt of TRUSSES_Y) stand(HALL.x0 + yt + TRUSS_DEPTH, post, HALL.x0, yt);
  {
    const f = A.owl.frameAt(t, 3.1);
    stand(CASTLE_OWL_AT[0] + CASTLE_OWL_AT[1], A.owl.frames[f], CASTLE_OWL_AT[0], CASTLE_OWL_AT[1]);
  }
  // the sun in the air, through each window (added)
  SUN_WINDOWS.forEach((W, i) => {
    const p = tile(`the sun in the air, window ${i + 1}`);
    stand(HALL.x0 + W.c + AIR_DEPTH, p.frames![Math.floor(t * 4) % 4], HALL.x0, W.c, 0, CASTLE_ADDED.has(p.name));
  });
  // the town's own things and its people: the game's own pictures, as they are
  for (const [kind, p] of Object.entries(T)) {
    const person = kind === 'armourer' || kind === 'mystic' || kind === 'wordsmith' || kind === 'stranger';
    stand(p[0] + p[1] + 1, townSprite(ART, kind, 0, t), p[0] + 0.5, p[1] + 0.5, person ? 0.36 : 0);
  }
  STONES.forEach(([dx, dy], i) => stand(T.wordsmith[0] + dx + T.wordsmith[1] + dy + 1, townSprite(ART, 'runeStone', i, t), T.wordsmith[0] + dx + 0.5, T.wordsmith[1] + dy + 0.5));
  for (const [x, y] of BRAZIERS) stand(x + y + 1, props.brazier[(Math.floor(t * 8) + x) % 4], x + 0.5, y + 0.5);
  for (const [x, y] of BARRELS) stand(x + y + 1, props.barrel, x + 0.5, y + 0.5);
  stand(URN[0] + URN[1] + 1, props.urn, URN[0] + 0.5, URN[1] + 0.5);
  for (const [x, y] of PILLARS) stand(x + y + 1, tile('a pillar of the hall').frames![0], x + 0.5, y + 0.5, 0.4);
  // the plants
  for (const [n, x, y] of POTS) stand(x + y, tile(n).frames![0], x, y, tile(n).shadow ?? 0);
  for (const [ax, x, y] of IVY) stand(x + y + 0.2, tile(`ivy at the foot of a wall, along ${ax ? 'x' : 'y'}`).frames![0], x, y);
  // the shaft's head with its cage standing in it (the game's own: render/dress.ts)
  {
    const d = SHAFT.x + SHAFT.y + 1;
    stand(d - 0.002, shaft.back, SHAFT.x + 0.5, SHAFT.y + 0.5);
    stand(d + 0.002, shaft.front, SHAFT.x + 0.5, SHAFT.y + 0.5);
  }
  // THE GATE, as render.ts stands it: a pillar at each end, the game's own portcullis at the back of the arch, the town's bars, the arch
  const pAt = (tt: number, back = 0): [number, number] => [GATE.a + tt, GATE.face - back];
  const strips = (list: Strip[], t0: number, back: number): void => {
    for (const q of list) {
      const [x, y] = pAt(t0 + q.t, back);
      stand(x + y + STRIP / 64, q.s, x, y);
    }
  };
  for (const [x, y] of [pAt(0), pAt(3 + wide)]) stand(x + y - wide, A.gate.pillar, x, y);
  strips(G0.portcullis(true, false, L.raise), -wide, wide);
  strips(L.barred ? gateBars(true) : L.raise > 0 ? gateLeft(true) : [], -wide, wide - 0.03);
  strips(A.gate.arch(true), -wide, 0);
  // THE KNIGHT
  stand(L.heroAt[0] + L.heroAt[1], hero.front.idle[0], L.heroAt[0], L.heroAt[1], 0.36);
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
  if (!L.lights) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    return cv;
  }

  // ---- THE TOWN'S OWN DARK, as the renderer lays it (render.ts, light): over everything, a hole cut by each light
  const LL = CASTLE_LIGHTS;
  const dark = document.createElement('canvas');
  dark.width = RW;
  dark.height = RH;
  const dg = dark.getContext('2d') as CanvasRenderingContext2D;
  dg.fillStyle = `rgba(${LL.dark.rgb.join(',')},${LL.dark.a})`;
  dg.fillRect(0, 0, RW, RH);
  dg.globalCompositeOperation = 'destination-out';
  dg.imageSmoothingEnabled = true;
  const spot = (x: number, y: number, r: number, strength: number): void => {
    dg.globalAlpha = Math.min(1, strength);
    dg.drawImage(pool, Math.round(x - r), Math.round(y - r * 0.62), Math.round(r * 2), Math.round(r * 1.24));
  };
  const glows: [number, number, number, string, number][] = [];
  {
    const [hx, hy] = at(L.heroAt[0], L.heroAt[1]);
    spot(hx, hy - 8, LL.hero.r, LL.hero.strength);
  }
  // the gate lights the floor before it (as now), the day in its way
  {
    const [gx, gy] = at(14.7, 6.7);
    spot(gx, gy - LL.gate.up, LL.gate.r, LL.gate.strength);
    const [mx, my] = at(14.5, 6);
    glows.push([mx, my - LL.gate.glow.up, LL.gate.glow.r, LL.gate.glow.color, LL.gate.glow.a]);
  }
  // the town's own lights, as now: the braziers, the Lexicon, the forge, the table of wares, the wordsmith's slab
  for (const [x, y] of BRAZIERS) {
    const [px, py] = at(x + 0.5, y + 0.5);
    spot(px, py - 14, 62 + Math.sin(t * 9 + x) * 3, 0.9);
  }
  {
    const s = (p: readonly number[], up: number, r: number, k: number, dx = 0): void => {
      const [px, py] = at(p[0] + 0.5, p[1] + 0.5);
      spot(px + dx, py - up, r, k);
    };
    s(T.lexicon, 14, 46 + Math.sin(t * 3) * 3, 0.8);
    s(T.forge, 6, 60 + Math.sin(t * 9) * 3, 0.9);
    s(T.tentTable, 18, 56, 0.8);
    s(T.runeSlab, 12, 64 + Math.sin(t * 2) * 3, 0.75, 8);
  }
  // THE WINDOWS: the day through their gaps; THE SLATS OF SUN on the floor
  for (const W of SUN_WINDOWS) {
    const [px, py] = at(HALL.x0, W.c);
    spot(px, py - LL.window.up, LL.window.r, LL.window.strength);
    glows.push([px, py - LL.window.up, LL.window.glow.r, LL.window.glow.color, LL.window.glow.a]);
    const [fx, fy] = at(HALL.x0 + LL.window.floor.out, W.c + LL.window.floor.out * 0.3);
    spot(fx, fy, LL.window.floor.r, LL.window.floor.strength);
    glows.push([fx, fy, LL.window.floor.glow.r, LL.window.floor.glow.color, LL.window.floor.glow.a]);
  }
  // every tile of wall that stands: a low hole at the foot of its face
  for (let x = HALL.x0; x < HALL.x1; x++) if (isWall(x, HALL.y0 - 1)) {
    const [px, py] = at(x + 0.5, HALL.y0);
    spot(px, py - LL.wall.up, LL.wall.r, LL.wall.strength);
  }
  for (let y = HALL.y0; y < HALL.y1; y++) {
    const [px, py] = at(HALL.x0, y + 0.5);
    spot(px, py - LL.wall.up, LL.wall.r, LL.wall.strength);
  }
  for (const q of A.slatLights()) {
    const [px, py] = at(q.x, q.y);
    spot(px, py, q.r, q.strength);
  }
  dg.globalAlpha = 1;
  dg.globalCompositeOperation = 'source-over';
  {
    dg.save();
    dg.translate(RW / 2, RH / 2);
    dg.scale(RW / 2, RH / 2);
    const grd = dg.createRadialGradient(0, 0, 0.55, 0, 0, Math.SQRT2);
    grd.addColorStop(0, 'rgba(4,3,10,0)');
    grd.addColorStop(1, `rgba(4,3,10,${LL.vignette})`);
    dg.fillStyle = grd;
    dg.fillRect(-1, -1, 2, 2);
    dg.restore();
  }
  g.setTransform(2, 0, 0, 2, 0, 0);
  g.drawImage(dark, 0, 0);
  // ---- WHAT GIVES LIGHT, over the dark
  for (const q of lit) drawLights(g, q.s, q.x, q.y);
  for (const [x, y, r, c, a] of glows) drawGlow(g, x, y, r, c, a);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return cv;
}

const START: Look = { heroAt: HERO_AT, raise: 0, barred: true, time: 1.35, lights: true };

// =================================================================================================

function phone(L: Look = START): HTMLCanvasElement {
  const keep = [RW, RH, OX, OY];
  RW = 507;
  RH = 234;
  OX = Math.round(253 - (L.heroAt[0] - L.heroAt[1]) * 16);
  OY = Math.round(117 + 14 - (L.heroAt[0] + L.heroAt[1]) * 8);
  const cv = scene(L);
  [RW, RH, OX, OY] = keep;
  return cv;
}
/** A part of the town, `k` times the game's size (cx, cy: game pixels on the whole town's picture). */
function crop(src: HTMLCanvasElement, cx: number, cy: number, W: number, H: number, k: number): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = W * k;
  cv.height = H * k;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#07050a';
  g.fillRect(0, 0, cv.width, cv.height);
  g.drawImage(src, (cx - W / 2) * 2, (cy - H / 2) * 2, W * 2, H * 2, 0, 0, W * k, H * k);
  return cv;
}
/** The owl on its beam, at the game's size (a crop of the town as the game draws it) and close: its frames three times as big. */
function owl(): HTMLCanvasElement {
  const town = scene({ ...START, heroAt: [17.6, 9.2] });
  const [ox, oy] = at(CASTLE_OWL_AT[0], CASTLE_OWL_AT[1], CASTLE_OWL_AT[2] / 2);
  const small = crop(town, ox - 40, oy + 10, 270, 170, 2);
  const close = crop(town, ox, oy - 10, 100, 64, 6);
  const K = 3;
  const sel = [0, 3, 5, 7, 11, 13];
  const cell = 190;
  const row = document.createElement('canvas');
  row.width = cell * sel.length;
  row.height = 200;
  const rg = row.getContext('2d') as CanvasRenderingContext2D;
  rg.imageSmoothingEnabled = false;
  rg.fillStyle = '#120e0a';
  rg.fillRect(0, 0, row.width, row.height);
  sel.forEach((f, i) => {
    const s = owlOnBeam(OWL_POSES[f]);
    const ox2 = Math.round(i * cell + cell / 2 - s.ax * 2 * K);
    const beamY = 150;
    rg.fillStyle = '#4c3826';
    rg.fillRect(i * cell + 20, beamY, cell - 40, 3 * K);
    rg.fillStyle = '#2e2014';
    rg.fillRect(i * cell + 20, beamY + 3 * K, cell - 40, 4 * K);
    rg.drawImage(s.img, ox2, beamY - s.ay * 2 * K, s.img.width * K, s.img.height * K);
    rg.fillStyle = '#e8dccb';
    rg.font = 'bold 15px sans-serif';
    rg.textBaseline = 'top';
    const tw = rg.measureText(OWL_NAMES[f]).width;
    rg.fillText(OWL_NAMES[f], Math.round(i * cell + cell / 2 - tw / 2), 176);
  });
  const cv = document.createElement('canvas');
  cv.width = 1200;
  cv.height = Math.max(small.height, close.height) + 20 + row.height;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#0a0809';
  g.fillRect(0, 0, cv.width, cv.height);
  g.drawImage(small, 10, Math.round((Math.max(small.height, close.height) - small.height) / 2));
  g.drawImage(close, 1200 - close.width - 10, 0);
  g.drawImage(row, Math.round((1200 - row.width) / 2), Math.max(small.height, close.height) + 20);
  return cv;
}
/** The gate close, three times the game's size: barred (as a new game finds it), and open (its portcullis up, the bars struck off). */
function gate(): HTMLCanvasElement {
  const [gx, gy] = at(14.5, 6);
  const a = crop(scene({ ...START, heroAt: [15.2, 9.6] }), gx, gy - 46, 190, 150, 3);
  const b = crop(scene({ ...START, heroAt: [15.2, 9.6], raise: GATE_UP, barred: false }), gx, gy - 46, 190, 150, 3);
  const w = Math.round((1200 - 30) / 2);
  const h = Math.round((a.height * w) / a.width);
  const cv = document.createElement('canvas');
  cv.width = 1200;
  cv.height = h;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#0a0809';
  g.fillRect(0, 0, cv.width, cv.height);
  g.drawImage(a, 0, 0, a.width, a.height, 10, 0, w, h);
  g.drawImage(b, 0, 0, b.width, b.height, 20 + w, 0, w, h);
  return cv;
}

async function sheet(): Promise<HTMLCanvasElement> {
  const SW = 1200;
  const picked = await new Promise<HTMLImageElement | null>((ok) => {
    const im = new Image();
    im.onload = () => ok(im);
    im.onerror = () => ok(null);
    im.src = '../docs/mockups/town_look/pictures/castle_hall.png';
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
  const pic = (c: HTMLCanvasElement, gap = 14): void => void blocks.push({ h: c.height + gap, draw: (g, y) => g.drawImage(c, Math.round((SW - c.width) / 2), y) });
  text("The first town as the castle's hall, built for the game.", 25, true);
  text('Left: built from the new pieces, laid and lit the way the game does it. Right: the castle hall as you saw it.', 18, false, '#b8ab98');
  const run = scene(START);
  blocks.push({
    h: RH + 14,
    draw: (g, y) => {
      g.imageSmoothingEnabled = true;
      g.drawImage(run, 0, y, RW, RH);
      if (picked) g.drawImage(picked, RW, y, RW, RH);
      g.imageSmoothingEnabled = false;
      g.fillStyle = '#e8dccb';
      g.font = 'bold 18px sans-serif';
      g.textBaseline = 'top';
      g.fillText('For the game', 12, y + 8);
      g.fillText('As you saw it', RW + 12, y + 8);
    },
  });
  text("On a phone: one screen at the game's own size, the knight among the vendors, the owl over the smithy.", 18, true);
  pic(phone());
  text("The owl on its beam: at the game's size (left) and close (right); below, some of its moments, three times as big.", 18, true);
  text('It breathes all the time, blinks every few seconds, turns its head now and then, looks right round behind it, ruffles.', 16, false, '#b8ab98');
  pic(owl());
  text('The gate out to the Quarry, three times as big: barred, as a new game finds it; and open, the road out in the sun.', 18, true);
  pic(gate(), 20);
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
  A = makeCastleHallArt();
  layTiles();
  const out = mode === 'sheet' ? await sheet() : mode === 'phone' ? phone() : mode === 'owl' ? owl() : mode === 'gate' ? gate() : mode === 'flat' ? scene({ ...START, lights: false }) : scene(START);
  out.style.display = 'block';
  document.body.style.margin = '0';
  document.body.style.background = '#000';
  document.body.appendChild(out);
  (window as unknown as { __size: [number, number] }).__size = [out.width, out.height];
  console.log(`size ${out.width} x ${out.height}`);
  (window as unknown as { __ready: boolean }).__ready = true;
})();
