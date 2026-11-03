// Dev page: FLOOR 3, THE BLACK IRON PRISON, LOOK B, BUILT FROM ITS GAME-READY PIECES (art/prison.ts, behind PRISON, off; his
// gate, art/prison_gate.ts, behind PRISON_GATE, off), laid tile by tile as the game lays a level: the floor a tile at a time
// (the flags, and the prison's own tiles laid in their place), the walls a face at a time where floor lies before them (none
// toward the eye, as the game's), what stands sorted as the renderer sorts it, the gate as render.ts stands a boss gate; then
// the dark laid over it with holes where the lights are, and the lights' glow drawn over that, as the renderer does
// (render.ts, light). Nothing of the game imports it.
//   node tools/preview.mjs src/dev/preview_prison_game.ts shots/prison/run.png 1200 840 "run"
//   node tools/preview.mjs src/dev/preview_prison_game.ts shots/prison/phone.png 1014 468 "phone"
//   node tools/preview.mjs src/dev/preview_prison_game.ts shots/prison/gate.png 1120 540 "gate"
//   node tools/preview.mjs src/dev/preview_prison_game.ts docs/mockups/floor3_look/pictures/game_ready.png 1200 1700 "sheet"
import type { Sprite } from '../engine/px';
import { drawGlow, drawLights } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { makeChainedArt3 } from '../art/bosses3';
import { cryptGround } from '../art/crypt';
import type { Piece } from '../art/floorkit';
import { GATE_UP, PILLAR, STRIP } from '../art/gates';
import type { Strip } from '../art/gates';
import { GREAT, HALL_RINGS, PRISON_LIGHTS, makePrisonArt } from '../art/prison';
import { makePrisonGateArt } from '../art/prison_gate';

const [mode = 'run'] = decodeURIComponent(location.hash.slice(1)).split(':');
const A = makePrisonArt();
const G = makePrisonGateArt();
const ground = cryptGround(3);

// =================================================================================================
// THE LEVEL, in tiles (x down the screen to the right, y down to the left), as the art's three looks have it but its boss
// hall flat: the corridor in, the cell block (its cells along its back wall, the fire channel down its middle), the corridor
// on, the boss's doorway with his gate, and his hall with the great grate where he stands.

type R = { x0: number; y0: number; x1: number; y1: number };
const ROOMS: R[] = [
  { x0: -2, y0: -9, x1: 8, y1: 0 }, // his hall
  { x0: 2, y0: 0, x1: 5, y1: 1 }, // the doorway
  { x0: 2, y0: 1, x1: 5, y1: 4 }, // the corridor to it
  { x0: -1, y0: 4, x1: 7, y1: 16 }, // the cell block
  { x0: 2, y0: 16, x1: 5, y1: 23 }, // the corridor in
];
const isFloor = (x: number, y: number): boolean => ROOMS.some((r) => x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1);
/** The great grate's far corner (tiles), and where he stands on it. */
const GX = 2;
const GY = -7;
const BOSS: [number, number] = [GX + GREAT / 2, GY + GREAT / 2];
/** The cells' fronts in the cell block's back wall (the wall at x = -2, along y): the first tile of each. */
const CELLS = [5, 9, 13];
/** The fire channel down the cell block, along y, two tiles wide from x = 2. */
const CH = { x: 2, y0: 5, y1: 15, open0: 8, open1: 13, bridge: 10 };
/** Where the knight stands: in the cell block (the run), in the corridor before the gate (the phone), at the gate. */
const HERO_RUN: [number, number] = [5.2, 8.3];
const HERO_PHONE: [number, number] = [3.6, 2.7];
const HERO_GATE: [number, number] = [3.4, 2.1];

/** The floor tiles of the prison's own laid in their place (by "x,y"), and their frame. */
const laid = new Map<string, Sprite>();
const tileNamed = (n: string, f = 0): Sprite => {
  const p = A.tiles.find((q) => q.name === n) ?? A.pieces.find((q) => q.name === n);
  if (!p?.frames) throw new Error(`no tile ${n}`);
  return p.frames[f % p.frames.length];
};
/** The glowing ones: where their light is (the world's, the middle of what glows), its kind. */
const glows: { x: number; y: number; kind: 'grate' | 'channel' }[] = [];
{
  // the grates let into the floor: dark ones, and two glowing
  for (const [x, y, hot] of [[3, 18, false], [3, 2, true], [0, 9, false], [6, 13, true], [6, 5, false]] as const) {
    laid.set(`${x},${y}`, tileNamed(hot ? 'a grate, glowing' : 'a grate', 1));
    if (hot) glows.push({ x: x + 0.5, y: y + 0.5, kind: 'grate' });
  }
  // the fire channel, two tiles wide: its grated far end dark, open (burnt low) with the bridge over it, its grated near end glowing
  for (let y = CH.y0; y < CH.y1; y++) {
    let n: string;
    if (y < CH.open0) n = "the channel's grate along y";
    else if (y >= CH.open1) n = "the channel's grate along y, glowing";
    else if (y === CH.bridge) n = 'the bridge along y';
    else if (y === CH.open0) n = 'the open channel along y, where it begins';
    else n = 'the open channel along y';
    laid.set(`${CH.x},${y}`, tileNamed(`${n}, its far half`, 2));
    laid.set(`${CH.x + 1},${y}`, tileNamed(`${n}, its near half`, 2));
    if (y >= CH.open1) glows.push({ x: CH.x + 1, y: y + 0.5, kind: 'grate' });
    else if (y >= CH.open0 && y % 2 === 0) glows.push({ x: CH.x + 1, y: y + 0.5, kind: 'channel' });
  }
  // soot under the fire baskets, rust stains, drains; the floor's own straw kicked out before the cells
  for (const [x, y, n] of [
    [-1, 8, 'soot'], [-1, 12, 'soot'], [0, 3, 'soot'], [6, 6, 'rust stains'], [0, 5, 'rust stains'], [4, 20, 'rust stains'], [6, 15, 'a drain'], [2, 19, 'a drain'],
    [-1, 6, 'straw before a cell'], [-1, 10, 'straw before a cell'], [-1, 14, 'straw before a cell'], [-1, 5, 'straw before a cell'], [5, -2, 'soot'], [-1, -8, 'rust stains'],
  ] as const) laid.set(`${x},${y}`, tileNamed(n));
}

// =================================================================================================
// THE CAMERA: game pixels; the floor's (0, 0) at (OX, OY) on the run's picture (600 x 420 game pixels, at two picture pixels each)

const RW = 600;
const RH = 420;
const OX = 296;
const OY = 170;
const at = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * 16, OY + (x + y) * 8 - z];

const hero = makeHeroArt3().of('warrior', { twoHanded: false });
const boss = makeChainedArt3();
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

/** THE LEVEL DRAWN, the knight at `heroAt`, the gate's portcullis at `raise` (and his mark alight once it is down): RW x RH game pixels, at two picture pixels each. */
function scene(heroAt: [number, number], raise: number, frame = 1): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = RW * 2;
  cv.height = RH * 2;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#040406';
  g.fillRect(0, 0, cv.width, cv.height);
  g.setTransform(2, 0, 0, 2, 0, 0);
  const draw = (s: Sprite, x: number, y: number): void => {
    g.drawImage(s.img, Math.round(x) - s.ax, Math.round(y) - s.ay, s.w, s.h);
  };

  // ---- THE FLOOR, a tile at a time; the shadow of a wall over it, the edge toward the eye against the dark
  for (let x = -4; x < 10; x++) for (let y = -11; y < 24; y++) {
    if (!isFloor(x, y)) continue;
    const [px, py] = at(x, y);
    const hall = A.hall.floor(x, y, x - GX, y - GY);
    const s = hall ? hall[frame % hall.length] : laid.get(`${x},${y}`) ?? A.floor(x, y);
    draw(s, px, py);
    if (!isFloor(x - 1, y)) draw(ground.shadeLeft, px, py);
    if (!isFloor(x, y - 1)) draw(ground.shadeRight, px, py);
    if (!isFloor(x + 1, y)) draw(ground.edgeRight, px, py);
    if (!isFloor(x, y + 1)) draw(ground.edgeLeft, px, py);
  }

  // ---- WHAT STANDS, sorted as the renderer sorts it
  const stands: Stand[] = [];
  const lit: { s: Sprite; x: number; y: number }[] = [];
  const stand = (d: number, s: Sprite, x: number, y: number, z = 0, shadow = 0): void => {
    stands.push({ d, s, x, y, z, shadow, lit: !!s.lights });
  };
  // THE WALLS: a wall tile's face where floor lies before it (along x: floor at y + 1; along y: at x + 1), none toward the eye
  // (a wall with floor right behind it), as the game's; the cell block's back wall carries the cells' fronts; his hall's walls its rings
  const inHall = (x: number, y: number): boolean => x >= -3 && x <= 8 && y >= -10 && y <= -1;
  for (let x = -4; x < 10; x++) for (let y = -11; y < 24; y++) {
    if (isFloor(x, y)) continue;
    const d = x + y + 1;
    if (isFloor(x, y + 1) && !isFloor(x, y - 1)) {
      const s = inHall(x, y) ? A.hall.faceLeft[((x % 4) + 4) % 4] : A.face(true, x, y);
      stand(d, s, x, y);
    }
    if (isFloor(x + 1, y) && !isFloor(x - 1, y)) {
      const cell = x === -2 ? CELLS.find((c) => y >= c && y < c + 3) : undefined;
      const s = cell !== undefined ? A.cellRight[y - cell] : inHall(x, y) ? A.hall.faceRight[((y % 4) + 4) % 4] : A.face(false, x, y);
      stand(d, s, x, y);
    }
  }
  // WHAT IS SET IN THE WALLS (as render/pieces.ts sets a wall piece: at the foot of the face under its tile's middle)
  const onWall = (n: string, tx: number, ty: number, alongX: boolean, spot = 0): void => {
    const p = piece(n);
    const q = p.spots?.[spot % p.spots.length];
    const list = q ? (alongX ? q.left : q.right) : alongX ? p.left! : p.right!;
    const s = list[frame % list.length];
    // (the foot of the face under its tile's middle: render/pieces.ts's px -/+ 8, py + 12)
    const [wx, wy] = alongX ? [tx + 0.5, ty + 1] : [tx + 1, ty + 0.5];
    stand(tx + ty + 1.01, s, wx, wy);
  };
  // the fire baskets (the floor's own, look B's), the jailers' lamp, the floor's own things on the walls, chains hung from the dark
  const BASKETS: [number, number, boolean][] = [[0, 3, true], [1, 2, false], [-2, 8, false], [-2, 12, false], [0, -10, true], [6, -10, true], [-3, -3, false], [1, 18, false]];
  for (const [x, y, ax] of BASKETS) onWall('fire basket', x, y, ax, 0);
  onWall("the jailers' lamp", 1, 21, false);
  onWall('rings and chains', -1, 3, true);
  onWall('balls on a rack', 6, 3, true);
  onWall('goad and catch-pole', 1, 1, false);
  onWall('the wall winch', 1, 17, false);
  onWall('a chain from the dark, a shackle', -2, 4, false);
  onWall('a chain from the dark, a hook', 5, 3, true, 1);
  onWall('a chain from the dark, a hook', -3, -7, false, 2);
  // THE THINGS THAT STAND: the floor's own, in look B's colours
  const things: [string, number, number, number][] = [
    ['the great winch', 4.6, -8.45, 0], ['the chain post', 1.4, -8.5, 0], ['the chain post', 7.4, -8.5, 0], ['a heap of chains', 6.9, -1.2, 0], ['ball and chain', 0.6, -0.9, 0],
    ['straw bale', -0.45, 7.85, 0], ['meal sack', -0.4, 11.75, 0], ['the feed trough', -0.25, 15.25, 0], ["the jailers' kettle", 6.1, 9.4, frame], ['the anvil', 6.15, 11.3, 0],
    ['the stone bench', 6.25, 14.6, 0], ["the jailers' chest", 6.3, 4.85, 0], ['box of irons', 0.6, 4.75, 0], ['water jug', 4.6, 15.4, 0], ['a heap of chains', 0.3, 14.6, 0],
    ['a snapped chain', 2.6, 3.4, 0], ['a bowl kicked over', 2.7, 18.4, 0], ['a burst cuff', 4.3, 19.6, 0], ['ball and chain', 4.5, 4.6, 0],
  ];
  for (const [n, x, y, f] of things) {
    const p = piece(n);
    stand(x + y, p.frames![f % p.frames!.length], x, y, 0, p.shadow ?? 0);
  }
  // THE RAILINGS along the open channel (both rims), a post closing each run; the bridge between
  for (const rim of [CH.x, CH.x + 2]) {
    for (const [y0, y1] of [[CH.open0, CH.bridge], [CH.bridge + 1, CH.open1]]) {
      for (let y = y0; y < y1; y++) stand(rim + y + 0.5, tileNamed('railing along y'), rim, y + 0.5);
      stand(rim + y1, tileNamed('railing post'), rim, y1);
    }
  }
  // CHAINS HUNG FROM THE DARK: in the cell block to a hook and a cage; in his hall the great ones down to the rings in its floor
  stand(0.9 + 6.3, tileNamed('a chain from the dark, hanging to a hook'), 0.9, 6.3);
  stand(5.7 + 12.9, tileNamed('a chain from the dark, hanging to a cage'), 5.7, 12.9);
  for (const [rx, ry] of HALL_RINGS) stand(GX + rx + GY + ry, tileNamed('a great chain from the dark'), GX + rx, GY + ry);
  // HIS GATE, as render.ts stands a boss gate: its pillars, its portcullis at the back of the arch, the arch's strips
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
  // HIM, on the great grate; THE KNIGHT
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
  dg.fillStyle = `rgba(6,4,14,${PRISON_LIGHTS.dark})`;
  dg.fillRect(0, 0, RW, RH);
  dg.globalCompositeOperation = 'destination-out';
  dg.imageSmoothingEnabled = true;
  const spot = (x: number, y: number, r: number, strength: number): void => {
    dg.globalAlpha = Math.min(1, strength);
    dg.drawImage(pool, Math.round(x - r), Math.round(y - r * 0.62), Math.round(r * 2), Math.round(r * 1.24));
  };
  const [hx, hy] = at(heroAt[0], heroAt[1]);
  // (the wide gentle pool round the hero, and the bright one: render.ts NEAR_POOL, NEAR_LIFT)
  spot(hx, hy - 8, 380, 0.36);
  spot(hx, hy - 8, 165, 1);
  const L = PRISON_LIGHTS;
  const glowsOver: [number, number, number, string, number][] = [];
  for (const [x, y, ax] of BASKETS) {
    const [fx, fy] = ax ? at(x + 0.5, y + 1) : at(x + 1, y + 0.5);
    spot(fx, fy - L.basket.up, L.basket.r, L.basket.strength);
    glowsOver.push([fx, fy - L.basket.up, L.basket.glow.r, L.basket.glow.color, L.basket.glow.a]);
  }
  for (const q of glows) {
    const [px, py] = at(q.x, q.y);
    const k = q.kind === 'grate' ? L.grate : L.channel;
    spot(px, py, k.r, k.strength);
    glowsOver.push([px, py, k.glow.r, k.glow.color, k.glow.a]);
  }
  {
    const [cx, cy] = at(BOSS[0], BOSS[1]);
    spot(cx, cy, L.great.r, L.great.strength);
    glowsOver.push([cx, cy, L.great.glow.r, L.great.glow.color, L.great.glow.a]);
    // (a boss stands in a light of his own: render.ts)
    spot(cx, cy - 12, 56, 0.7);
  }
  // (the jailers' kettle is the floor's fire, as a brazier: render.ts lights a brazier so)
  {
    const [kx, ky] = at(6.1, 9.4);
    spot(kx, ky - 14, 62, 0.9);
  }
  dg.globalAlpha = 1;
  dg.globalCompositeOperation = 'source-over';
  // (the vignette, as render.ts lays it: VIGNETTE 0.62 from VIGNETTE_FROM)
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
  // ---- WHAT GIVES LIGHT, over the dark: the fire baskets' and the lamp's own lights, the grates' and the great grate's glow
  for (const q of lit) drawLights(g, q.s, q.x, q.y);
  for (const [x, y, r, c, a] of glowsOver) drawGlow(g, x, y, r, c, a);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return cv;
}

// =================================================================================================

/** One phone screen (507 x 234 game pixels at two picture pixels each), the camera on the knight a little up the screen of him. */
function phone(): HTMLCanvasElement {
  const src = scene(HERO_PHONE, GATE_UP);
  const [hx, hy] = at(HERO_PHONE[0], HERO_PHONE[1]);
  const cv = document.createElement('canvas');
  cv.width = 1014;
  cv.height = 468;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#040406';
  g.fillRect(0, 0, cv.width, cv.height);
  g.drawImage(src, Math.round(507 - hx * 2), Math.round(234 - (hy - 14) * 2));
  return cv;
}
/** The gate close, the knight before it, twice as big: its portcullis up (as he comes to it) or down (behind him, the mark alight). */
function gate(raise: number, heroAt: [number, number]): HTMLCanvasElement {
  const src = scene(heroAt, raise);
  const [gx, gy] = at(3.5, 1);
  const W = 140;
  const H = 135;
  const cv = document.createElement('canvas');
  cv.width = W * 4;
  cv.height = H * 4;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.drawImage(src, (gx - W / 2) * 2, (gy - 100) * 2, W * 2, H * 2, 0, 0, W * 4, H * 4);
  return cv;
}

async function sheet(): Promise<HTMLCanvasElement> {
  const SW = 1200;
  const picked = await new Promise<HTMLImageElement | null>((ok) => {
    const im = new Image();
    im.onload = () => ok(im);
    im.onerror = () => ok(null);
    im.src = '../docs/mockups/floor3_look/pictures/b_torchlit.png';
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
  text('Floor 3, the black iron prison: look B, built for the game.', 26, true);
  text('Left: built from the new pieces, laid and lit the way the game does it. Right: B as you picked it.', 18, false, '#b8ab98');
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
      g.fillText('B, as you picked it', RW + 12, y + 22);
    },
  });
  text('On a phone: one screen at the game\'s own size, the knight in the corridor before his gate.', 18, true);
  const ph = phone();
  blocks.push({ h: ph.height + 14, draw: (g, y) => g.drawImage(ph, Math.round((SW - ph.width) / 2), y) });
  text('His gate close, twice as big: the portcullis up as you come to it; down behind you as the fight begins, his mark alight.', 18, true);
  const up = gate(GATE_UP, HERO_GATE);
  const down = gate(0, [2.0, -0.6]);
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
  const out = mode === 'sheet' ? await sheet() : mode === 'phone' ? phone() : mode === 'gate' ? (() => {
    const c = document.createElement('canvas');
    const a = gate(GATE_UP, HERO_GATE);
    const b = gate(0, [2.0, -0.6]);
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
