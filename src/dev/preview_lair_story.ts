// Dev page: FLOOR 5'S STORY PIECES (art/lair_story.ts, behind LAIR_STORY, off) LAID IN LOOK A, THE MINE THAT BECOMES HIS TEMPLE,
// as the game lays a level (the level, its walls, its things, the dark and the lights exactly as src/dev/preview_lair_game.ts
// lays them: that page's own code, with the story's pieces set in it). The story as these pictures lay it (the rooms are the main
// chat's to lay): in the shrine gallery of the mine, EMPTY SHACKLES along the back wall and DRAG MARKS from under them, across the
// earth, through the threshold; on over the temple's flags, past THE EYE IN THE STONE beside his gate, BLACK WATER down the wall
// by it and pooled at its foot; under his gate and into his hall. Nothing of the game imports it.
//   node tools/preview.mjs src/dev/preview_lair_story.ts shots/story/mine.png 1014 468 "mine"        one phone screen, the knight in the gallery
//   node tools/preview.mjs src/dev/preview_lair_story.ts shots/story/hall.png 1014 468 "hall"        one phone screen, the knight in his hall
//   node tools/preview.mjs src/dev/preview_lair_story.ts shots/story/c_shackles.png 1200 672 "shackles"   four times the game's size: the gallery
//   node tools/preview.mjs src/dev/preview_lair_story.ts shots/story/c_eye.png 1200 672 "eye"             the Eye and the water, in his hall
//   node tools/preview.mjs src/dev/preview_lair_story.ts shots/story/c_heap.png 1200 672 "heap"           the marks over the flags to his bone heap
//   node tools/preview.mjs src/dev/preview_lair_story.ts shots/story/c_chained.png 1200 672 "chained"     the shackles on the temple's stone
//   node tools/preview.mjs src/dev/preview_lair_story.ts shots/story/run.png 1200 840 "run"          the whole floor
// (after a view's name: " before", the floor without the story's pieces; " lit", no dark laid; " brawler", the Brawler in the knight's place)
import type { Sprite } from '../engine/px';
import { drawGlow, drawLights } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { makeFleshmancerArt3 } from '../art/fleshmancer';
import { lairGround } from '../art/lair';
import { shaftStill } from '../art/shaft';
import type { Piece } from '../art/floorkit';
import { GATE_UP, PILLAR, STRIP } from '../art/gates';
import type { GateArt, Strip } from '../art/gates';
import { LAIR_LIGHTS, makeLairTempleArt } from '../art/lair_temple';
import type { LairArt } from '../art/lair_temple';
import { makeLairGateArt } from '../art/lair_gate';
import { makeLairStoryArt } from '../art/lair_story';
import type { LairStoryArt } from '../art/lair_story';

const mode = decodeURIComponent(location.hash.slice(1)) || 'run';
// (made once the page has loaded: painting them takes a while)
let A!: LairArt;
let G!: GateArt;
let ST!: LairStoryArt;
/** With the story's pieces laid (or, without: the floor as it is today). */
const STORY = !mode.includes('before');
const ground = lairGround();

// =================================================================================================
// THE LEVEL, in tiles (x down the screen to the right, y down to the left): floor 5 laid COMBO as the look's pictures had it,
// but as the game would build it: THE LANDING (D, bottom left), its left wall cut by THE CAVE'S MOUTH from floor 4; THE SHRINE
// GALLERY (C) and THE DRIFT (B), the mine; THE ANTECHAMBER (A), the temple, its two ways in from the mine each through A
// THRESHOLD; the boss's doorway with his gate; HIS HALL, flat, the rift in its floor, the miners' shaft where placeShaft puts it.

type R = { x0: number; y0: number; x1: number; y1: number };
const HALL: R = { x0: -1, y0: -10, x1: 9, y1: 0 };
const DOOR: R = { x0: 3, y0: 0, x1: 6, y1: 1 };
const RA: R = { x0: 2, y0: 1, x1: 7, y1: 6 };
const RB: R = { x0: 2, y0: 7, x1: 7, y1: 12 };
const RC: R = { x0: -4, y0: 1, x1: 1, y1: 6 };
const RD: R = { x0: -4, y0: 7, x1: 1, y1: 12 };
/** The doorways between the rooms: the drift's into the antechamber and the gallery's (each a threshold); the landing's into the gallery and the drift (the mine's). */
const B_TO_A: R = { x0: 3, y0: 6, x1: 6, y1: 7 };
const C_TO_A: R = { x0: 1, y0: 2, x1: 2, y1: 5 };
const D_TO_C: R = { x0: -3, y0: 6, x1: 0, y1: 7 };
const D_TO_B: R = { x0: 1, y0: 8, x1: 2, y1: 11 };
const ROOMS: R[] = [HALL, DOOR, RA, RB, RC, RD, B_TO_A, C_TO_A, D_TO_C, D_TO_B];
const inR = (x: number, y: number, r: R): boolean => x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1;
const isFloor = (x: number, y: number): boolean => ROOMS.some((r) => inR(x, y, r));
const inHall = (x: number, y: number): boolean => x >= HALL.x0 - 1 && x <= HALL.x1 && y >= HALL.y0 - 1 && y <= HALL.y1 - 1;
/** The temple's floor: his hall, his doorway, the antechamber, and the thresholds' ways. */
const isTemple = (x: number, y: number): boolean => [HALL, DOOR, RA, B_TO_A, C_TO_A].some((r) => inR(x, y, r));
/** A wall that would hide floor behind it is left out (render/walls.ts, wallsAway: the game's faces look). */
const away = (x: number, y: number): boolean => {
  for (const [a, b] of [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]] as const) if (isFloor(x - a, y - b)) return true;
  return false;
};
/** A doorway (as the game's DoorSpot): along x or y, its first tile `a`, the plane of its face. */
interface Way { alongX: boolean; a: number; face: number }
const THRESHOLDS: Way[] = [{ alongX: true, a: 3, face: 7 }, { alongX: false, a: 2, face: 2 }];
const GATE: Way = { alongX: true, a: 3, face: 1 };
/** THE CAVE'S MOUTH from floor 4: three tiles of the landing's left wall (along y, its face at x = -4). */
const MOUTH: Way = { alongX: false, a: 8, face: -4 };
const inMouth = (x: number, y: number): boolean => x === MOUTH.face - 1 && y >= MOUTH.a && y < MOUTH.a + 3;
/** A doorway's anchor: the foot of the face under the middle of its middle tile (render/dress.ts anchorOf). */
const anchorOf = (s: Way): [number, number] => (s.alongX ? [s.a + 1.5, s.face] : [s.face, s.a + 1.5]);
/** Where he stands; where the knight stands: in the drift (the run), before the threshold (the phone, the close), at the gate, in the hall. */
const BOSS: [number, number] = [4.6, -4.6];
const HERO_RUN: [number, number] = [4.6, 9.2];
const HERO_PHONE: [number, number] = [4.1, 8.1];
const HERO_GATE: [number, number] = [4.0, 2.0];
const HERO_IN: [number, number] = [2.5, -1.1];
/** For the story's pictures: in the shrine gallery by the shackles; in the antechamber before the Eye and his gate. */
const HERO_MINE: [number, number] = [-1.0, 5.0];
const HERO_TEMPLE: [number, number] = [5.3, 3.4];
const HERO_HALL: [number, number] = [6.0, -7.7];
const HERO_HEAP: [number, number] = [5.7, -2.7];
const HERO_CHAINED: [number, number] = [1.0, -4.9];
/** THE SHAFT, where game/ways.ts placeShaft puts it: the hall's far corner, a tile off its back walls, its 3 x 3 plain. */
const SHAFT: [number, number] = [HALL.x0 + 1, HALL.y0 + 1];

/** The floor tiles laid in their place (by "x,y"): the rails, grit, the rift's cracks, bones. */
const laid = new Map<string, { s: Sprite[]; glow: boolean }>();
const tileNamed = (n: string): Piece => {
  const p = [...A.mine.tiles, ...A.temple.tiles, ...A.pieces].find((q) => q.name === n);
  if (!p?.frames) throw new Error(`no tile ${n}`);
  return p;
};
function layTiles(): void {
  const put = (x: number, y: number, n: string): void => void laid.set(`${x},${y}`, { s: tileNamed(n).frames!, glow: n.endsWith('glowing') });
  // THE RAILS: from the landing by the cave's mouth along the drift, turning to end at the threshold on their stop
  put(-4, 9, "rails' end, from high x");
  for (let x = -3; x <= 3; x++) put(x, 9, 'rails along x');
  put(4, 9, 'rails bending, low x to low y');
  put(4, 8, 'rails along y');
  put(4, 7, "rails' end, from high y");
  // grit at the feet of the mine's walls that stand, and here and there
  for (const x of [-4, -3, -2]) put(x, 1, 'grit at a wall along x');
  for (const y of [2, 4, 7, 11]) put(-4, y, 'grit at a wall along y');
  for (const [x, y] of [[-1, 4], [6, 10], [-2, 11], [3, 11], [0, 1]]) put(x, y, 'grit and stones');
  // THE RIFT'S CRACKS, out from the rift in his hall (glowing near it), and one in the antechamber
  put(4, -7, 'a crack of the rift along y, glowing');
  put(4, -6, 'a crack of the rift along y, glowing');
  put(4, -5, 'a crack of the rift along y');
  put(4, -4, 'a crack of the rift along y');
  put(4, -3, 'a crack of the rift ending, from low y');
  put(6, -8, 'a crack of the rift along x, glowing');
  put(7, -8, 'a crack of the rift along x');
  put(8, -8, 'a crack of the rift ending, from low x');
  put(3, -8, 'a crack of the rift along x, glowing');
  put(2, -8, 'a crack of the rift along x');
  put(1, -8, 'a crack of the rift ending, from high x');
  put(4, 5, 'a crack of the rift ending, from high x');
  put(5, 5, 'a crack of the rift along x');
  put(6, 5, 'a crack of the rift ending, from low x');
  for (const [x, y] of [[6, -3], [1, -5], [5, 2], [2, 4], [7, -1]]) put(x, y, 'bones on the flags');
  if (!STORY) return;
  // THE STORY'S TILES, each from its part's set (the mine's earth or the temple's flags under it)
  const story = (x: number, y: number, n: string): void => {
    const p = (isTemple(x, y) ? ST.temple : ST.mine).find((q) => q.name === n);
    if (!p?.frames) throw new Error(`no story tile ${n}`);
    laid.set(`${x},${y}`, { s: p.frames, glow: false });
  };
  // DRAG MARKS: from under the shackles on the gallery's back wall, across the earth, through the threshold, over the temple's
  // flags, under his gate and into his hall
  for (const [x, y, n] of STORY_TRAIL) story(x, y, n);
  // BLACK WATER POOLED at the foot of the walls it comes down
  for (const [x, y, n] of STORY_POOLS) story(x, y, n);
}
const STORY_TRAIL: [number, number, string][] = [
  [-3, 1, "drag marks' end, from high y"], [-3, 2, 'drag marks along y'], [-3, 3, 'drag marks bending, high x to low y'],
  [-2, 3, 'drag marks along x'], [-1, 3, 'drag marks along x'], [0, 3, 'drag marks along x'], [1, 3, 'drag marks along x'], [2, 3, 'drag marks along x'], [3, 3, 'drag marks along x'],
  [4, 3, 'drag marks bending, low x to low y'], [4, 2, 'drag marks along y'], [4, 1, 'drag marks along y'], [4, 0, 'drag marks along y'],
  [4, -1, 'drag marks bending, high x to high y'], [5, -1, 'drag marks along x'], [6, -1, 'drag marks bending, low x to low y'], [6, -2, "drag marks' end, from high y"],
];
const STORY_POOLS: [number, number, string][] = [[6, -10, 'black water pooled, at a wall along x'], [-4, 4, 'black water pooled, at a wall along y']];
/** The story's wall pieces: the piece, its wall's tile, along x or y, its spot. */
const STORY_WALLS: [string, number, number, boolean, number][] = [
  ['empty shackles', -3, 0, true, 0], ['empty shackles', -5, 1, false, 1], ['empty shackles', -5, 3, false, 2],
  ['the Eye in the stone', 5, -11, true, 0], ['black water down the wall', 6, -11, true, 0], ['black water down the wall', -5, 4, false, 0],
  ['empty shackles', -2, -6, false, 0],
];

// =================================================================================================
// THE CAMERA: game pixels; the floor's (0, 0) at (OX, OY) on the run's picture (600 x 420 game pixels, at two picture pixels each)

let RW = 600;
let RH = 420;
let OX = 268;
let OY = 196;
const at = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * 16, OY + (x + y) * 8 - z];

let hero!: ReturnType<ReturnType<typeof makeHeroArt3>['of']>;
let boss!: ReturnType<typeof makeFleshmancerArt3>;
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

interface Stand { d: number; s: Sprite; x: number; y: number; shadow: number; hole?: [number, number] }

/** Where the floor's own pieces and the place's own stand. */
const THINGS: [string, number, number, number][] = [
  // his hall: the rift, his dead heaped, the cult's own
  ['the rift', 4.6, -7.4, 0], ['the great bone heap', 7.6, -2.6, 0], ['the long bone heap', 1.0, -2.2, 0], ['skulls given to him', 3.0, -9.0, 0],
  ['skulls given to him', STORY ? 7.9 : 6.3, STORY ? -8.6 : -9.0, 0], ['the skull standard', 2.4, -6.0, 0], ['the skull standard', 7.0, -6.0, 0], ["the cult's coffer", 8.2, -8.4, 1],
  // the antechamber: the temple
  ['the skull standard', 6.4, STORY ? 3.0 : 2.3, 0], ['the effigy', 6.4, STORY ? 4.0 : 3.7, 0], ['box of candles', 6.3, 4.9, 0],
  // the landing, the drift: the mine
  ['the pile of props', -3.1, 11.3, 0], ['powder keg', -3.3, 7.6, 0], ['basket of ore', 0.3, 7.7, 0], ['the spilled kibble', -0.3, 11.2, 0],
  ['the cart on its side', 6.0, 11.0, 0], ['basket of ore', 6.3, 7.7, 0], ['a dropped lantern', 3.4, 11.5, 0], ['a cart on the rails, along x', -1.6, 9.5, 0],
  ["the rails' stop, along y", 4.5, 7.42, 0],
  // the shrine gallery: the mine
  ['the winding drum', STORY ? 0.2 : -1.2, STORY ? 5.4 : 2.3, 0], ['the sump pump', STORY ? -1.7 : -3.2, STORY ? 2.3 : 2.6, 0], ["a miner's bones", 0.2, 2.0, 0],
];
const POSTS: [number, number][] = [[2.7, 10.4], [-3.4, 10.3], STORY ? [-0.6, 1.5] : [-0.3, 4.6]];
/** The braziers: two in each threshold's way (just inside the temple, either side of it), by his gate, in his hall. */
const BRAZIERS: [number, number][] = [[3.25, 5.5], [5.75, 5.5], [2.5, 2.2], [2.5, 4.8], [STORY ? 6.6 : 6.5, STORY ? 2.1 : 1.5], [2.4, -9.4], [8.3, -9.3], [2.2, -1.0], [STORY ? 7.7 : 6.9, STORY ? -0.6 : -1.0]];

/** THE LEVEL DRAWN, the knight at `heroAt`, the gate's drop at `raise` (and the skull alight once it is down), frame `frame`: RW x RH game pixels, at two picture pixels each. */
function scene(heroAt: [number, number], raise: number, frame = 1): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = RW * 2;
  cv.height = RH * 2;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#050407';
  g.fillRect(0, 0, cv.width, cv.height);
  g.setTransform(2, 0, 0, 2, 0, 0);
  const draw = (s: Sprite, x: number, y: number): void => {
    g.drawImage(s.img, Math.round(x) - s.ax, Math.round(y) - s.ay, s.w, s.h);
  };

  // ---- THE FLOOR, a tile at a time; the shadow of a wall over it, the edge toward the eye against the dark; THE CAVE seen
  // through its mouth, flat with the floor (render/dress.ts `flat`)
  const glowTiles: [number, number][] = [];
  for (let x = -9; x < 12; x++) for (let y = -12; y < 14; y++) {
    if (!isFloor(x, y)) continue;
    const [px, py] = at(x, y);
    const t = laid.get(`${x},${y}`);
    draw(t ? t.s[frame % t.s.length] : isTemple(x, y) ? A.temple.floor(x, y) : A.mine.floor(x, y), px, py);
    if (t?.glow) glowTiles.push([x + 0.5, y + 0.5]);
    if (!isFloor(x - 1, y)) draw(ground.shadeLeft, px, py);
    if (!isFloor(x, y - 1)) draw(ground.shadeRight, px, py);
    if (!isFloor(x + 1, y)) draw(ground.edgeRight, px, py);
    if (!isFloor(x, y + 1)) draw(ground.edgeLeft, px, py);
  }
  const mouth = A.mouth(MOUTH.alongX);
  {
    const [x, y] = anchorOf(MOUTH);
    draw(mouth.under, ...at(x, y));
  }

  // ---- WHAT STANDS, sorted as the renderer sorts it
  const stands: Stand[] = [];
  const lit: { s: Sprite; x: number; y: number }[] = [];
  const holes: [number, number, number, number][] = [];
  const glowsOver: [number, number, number, string, number][] = [];
  const stand = (d: number, s: Sprite, x: number, y: number, shadow = 0): void => void stands.push({ d, s, x, y, shadow });
  // THE WALLS: a wall tile's face where floor lies before it (along x: floor at y + 1; along y: at x + 1), none that would hide
  // floor behind it; the mine's before the mine's floor, the temple's before the temple's, his hall's its own; the mouth's three in
  // their place
  const wallLights: { x: number; y: number; s: Sprite; mine: boolean; crack: boolean }[] = [];
  const wallLit = new Set<Sprite>();
  for (let x = -10; x < 12; x++) for (let y = -12; y < 14; y++) {
    if (isFloor(x, y) || away(x, y)) continue;
    const d = x + y + 1;
    for (const alongX of [true, false]) {
      const [fx, fy] = alongX ? [x, y + 1] : [x + 1, y];
      if (!isFloor(fx, fy)) continue;
      if (!alongX && inMouth(x, y)) continue;
      const temple = isTemple(fx, fy);
      const k = (((alongX ? x : y) % 4) + 4) % 4;
      const s = inHall(x, y) ? (alongX ? A.hall.faceLeft : A.hall.faceRight)[k][frame % 4] : (temple ? A.temple : A.mine).face(alongX, x, y, frame);
      stand(d, s, x, y);
      const [wx, wy] = alongX ? [x + 0.5, y + 1] : [x + 1, y + 0.5];
      wallLights.push({ x: wx, y: wy, s, mine: !temple, crack: inHall(x, y) && k === 0 });
      if (s.lights) wallLit.add(s);
    }
  }
  // THE CAVE'S MOUTH, its rim and the mine's wall round it (render/dress.ts standAt)
  {
    const [x, y] = anchorOf(MOUTH);
    stand(x + y, mouth.over, x, y);
  }
  // WHAT IS SET IN THE WALLS (as render/pieces.ts sets a wall piece: at the foot of the face under its tile's middle)
  const onWall = (n: string, tx: number, ty: number, alongX: boolean, spot = 0, from: Piece[] = A.pieces): void => {
    const p = from.find((q) => q.name === n);
    if (!p) throw new Error(`no wall piece ${n}`);
    const q = p.spots?.[spot % p.spots.length];
    const list = q ? (alongX ? q.left : q.right) : alongX ? p.left! : p.right!;
    const s = list[frame % list.length];
    const [wx, wy] = alongX ? [tx + 0.5, ty + 1] : [tx + 1, ty + 0.5];
    stand(tx + ty + 1.01, s, wx, wy);
  };
  onWall("the cult's banner", 1, -11, true, 1);
  if (!STORY) onWall("the cult's banner", 6, -11, true, 0);
  if (!STORY) onWall("the cult's banner", -2, -6, false, 1);
  if (STORY) {
    onWall('the hung kibble', -2, 0, true, 1);
    for (const [n, tx, ty, alongX, spot] of STORY_WALLS) onWall(n, tx, ty, alongX, spot, isTemple(alongX ? tx : tx + 1, alongX ? ty + 1 : ty) ? ST.temple : ST.mine);
  } else {
    onWall('rope and pulley', -3, 0, true, 0);
    onWall('the hung kibble', -2, 0, true, 1);
  }
  onWall("a miner's candle", -5, STORY ? 2 : 3, false, 1);
  // THE THINGS THAT STAND: floor 5's own, in look A's colours; the place's own; the shaft as it is
  for (const [n, x, y, f] of THINGS) {
    const p = piece(n);
    stand(x + y, p.frames![f % p.frames!.length], x, y, p.shadow ?? 0);
  }
  {
    const [x, y] = [SHAFT[0] + 0.5, SHAFT[1] + 0.5];
    stand(SHAFT[0] + SHAFT[1] + 1, shaftStill().empty, x, y, 0.7);
  }
  for (const [x, y] of POSTS) stand(x + y, piece('a lantern post').frames![frame % 4], x, y, 0.2);
  for (const [x, y] of BRAZIERS) stand(x + y, piece('a brazier').frames![frame % 4], x, y, 0.26);
  // THE THRESHOLDS and HIS GATE, as render.ts stands a gate: its strips at the face's line, a strip at a time
  const pAt = (w: Way, t: number, back = 0): [number, number] => (w.alongX ? [w.a + t, w.face - back] : [w.face - back, w.a + t]);
  const strips = (w: Way, list: Strip[], t0: number, back: number): void => {
    for (const q of list) {
      const [x, y] = pAt(w, t0 + q.t, back);
      stand(x + y + STRIP / 64, q.s, x, y);
    }
  };
  for (const w of THRESHOLDS) strips(w, A.threshold(w.alongX), 0, 0);
  {
    const wide = PILLAR / 32;
    for (const [x, y] of [pAt(GATE, 0), pAt(GATE, 3 + wide)]) stand(x + y - wide, G.pillar(true), x, y);
    strips(GATE, G.portcullis(true, true, raise), -wide, wide);
    strips(GATE, G.arch(true, true, raise === 0), -wide, 0);
  }
  // HIM, in his hall; THE KNIGHT
  stand(BOSS[0] + BOSS[1], boss.front.idle[0], BOSS[0], BOSS[1], 0.5);
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
    draw(st.s, sx, sy);
    if (st.s.lights) lit.push({ s: st.s, x: Math.round(sx), y: Math.round(sy) });
  }

  // ---- THE DARK, as the renderer lays it (render.ts, light): over everything, a hole cut by each light
  const L = LAIR_LIGHTS;
  const dark = document.createElement('canvas');
  dark.width = RW;
  dark.height = RH;
  const dg = dark.getContext('2d') as CanvasRenderingContext2D;
  dg.fillStyle = `rgba(6,4,14,${L.dark})`;
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
  // the mine's walls: a lantern's light where one hangs, a low glow on the rock of the others; the hall's cracks
  for (const w of wallLights) {
    const [px, py] = at(w.x, w.y);
    if (w.mine && w.s.lights) continue;
    if (w.mine) spot(px, py - L.mineWall.up, L.mineWall.r, L.mineWall.strength);
    else if (w.crack) {
      spot(px, py - L.wallCrack.up, L.wallCrack.r, L.wallCrack.strength);
      glowsOver.push([px, py - L.wallCrack.up, L.wallCrack.glow.r, L.wallCrack.glow.color, L.wallCrack.glow.a]);
    }
  }
  // the lantern posts' and the braziers' lights (their glows are on their pictures); the rift's; the glowing cracks'
  const posts = new Set(piece('a lantern post').frames);
  const braziers = new Set(piece('a brazier').frames);
  for (const q of lit) {
    const l = q.s.lights![0];
    const [lx, ly] = [q.x - q.s.ax + l.x, q.y - q.s.ay + l.y];
    if (wallLit.has(q.s)) spot(lx, ly, L.lantern.r, L.lantern.strength);
    else if (posts.has(q.s)) spot(lx, ly, L.lanternPost.r, L.lanternPost.strength);
    else if (braziers.has(q.s)) spot(q.x, q.y - L.brazier.up, L.brazier.r, L.brazier.strength);
    else if (q.s === shaftStill().empty) spot(lx, ly, 40, 0.6);
    else if (l.color !== LAIR_LIGHTS.crack.glow.color && l.r < 24) spot(lx, ly, 30, 0.6);
  }
  {
    const [rx, ry] = at(4.6, -7.4);
    spot(rx, ry - L.rift.up, L.rift.r, L.rift.strength);
  }
  for (const [x, y] of glowTiles) {
    const [px, py] = at(x, y);
    spot(px, py, L.crack.r, L.crack.strength);
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
  if (!mode.includes(' lit')) g.drawImage(dark, 0, 0);
  // ---- WHAT GIVES LIGHT, over the dark: the lanterns', braziers', the rift's and the cracks' own glows
  for (const q of lit) drawLights(g, q.s, q.x, q.y);
  for (const [x, y, r, c, a] of glowsOver) drawGlow(g, x, y, r, c, a);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return cv;
}

// =================================================================================================

/** One phone screen (507 x 234 game pixels at two picture pixels each), the camera on the knight a little up the screen of him. */
function phone(heroAt = HERO_PHONE): HTMLCanvasElement {
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
  g.fillStyle = '#050407';
  g.fillRect(0, 0, cv.width, cv.height);
  g.drawImage(src, (cx - W / 2) * 2, (cy - H / 2) * 2, W * 2, H * 2, 0, 0, W * k, H * k);
  return cv;
}
/** A part of the floor close, `k` times the game's size (W x H game pixels about the floor point (x, y), `lift` up the screen of it). */
function closeAt(heroAt: [number, number], x: number, y: number, lift: number, W = 150, H = 84, k = 4): HTMLCanvasElement {
  const [cx, cy] = at(x, y);
  return crop(scene(heroAt, GATE_UP), cx, cy - lift, W, H, k * 2);
}

void (async () => {
  await new Promise((ok) => setTimeout(ok, 0));
  A = makeLairTempleArt();
  G = makeLairGateArt();
  ST = makeLairStoryArt();
  // (' brawler': the Brawler stands in the knight's place: he and the Gate Ward are the measure for new art)
  hero = mode.includes(' brawler') ? makeHeroArt3().of('brawler', { twoHanded: false, vet: true }) : makeHeroArt3().of('warrior', { twoHanded: false });
  boss = makeFleshmancerArt3();
  layTiles();
  const view = mode.replace(' before', '').replace(' lit', '').replace(' brawler', '');
  const out =
    view === 'mine' ? phone(HERO_MINE)
    : view === 'temple' ? phone(HERO_TEMPLE)
    : view === 'hall' ? phone(HERO_HALL)
    : view === 'shackles' ? closeAt(HERO_MINE, -2.5, 3.0, 9)
    : view === 'eye' ? closeAt(HERO_HALL, 6.0, -9.3, 24)
    : view === 'heap' ? closeAt(HERO_HEAP, 5.8, -1.3, 14)
    : view === 'chained' ? closeAt(HERO_CHAINED, -0.2, -5.4, 22)
    : scene(HERO_RUN, GATE_UP);
  out.style.display = 'block';
  document.body.style.margin = '0';
  document.body.style.background = '#000';
  document.body.appendChild(out);
  (window as unknown as { __size: [number, number] }).__size = [out.width, out.height];
  (window as unknown as { __ready: boolean }).__ready = true;
})();
