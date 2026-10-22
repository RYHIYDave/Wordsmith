// Dev page: ACT 2'S TOWN HUB IN VELLUM, the two places he asked to see (22 Oct 2026, to the art chat: “I like the market
// square and the camp.  Can I see both?”), each laid here by hand and painted as the game paints the Gate Ward (art/
// terrain.ts, the look art/gateward.ts), with the town's four people and their places moved in (art/townsfolk.ts,
// art/town.ts in the city's stone, art/hub2.ts CITY), the Gate Ward's pieces (art/floor11.ts, art/act2_set.ts) and
// the hub's own (art/hub2.ts), at dusk, warm. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_hub2.ts shots/hub/square.png 2000 1150 square
//     THE LAMPLIT MARKET SQUARE, the whole of it (1000 by 575 game pixels, two picture pixels to one)
//   node tools/preview.mjs src/dev/preview_hub2.ts shots/hub/square_phone.png 1014 468 square-phone
//     the same as a phone shows it, the knight by the fountain
//   node tools/preview.mjs src/dev/preview_hub2.ts shots/hub/camp.png 2000 1150 camp
//     THE CAMP INSIDE THE GATE, the whole of it
//   node tools/preview.mjs src/dev/preview_hub2.ts shots/hub/camp_phone.png 1014 468 camp-phone
//     the same as a phone shows it, the knight by the cooking fire
//   node tools/preview.mjs src/dev/preview_hub2.ts shots/hub/camp_all.png 2000 1150 camp-all
//     THE CAMP with the rest camp-style too (camp-all-phone: as a phone shows it)
//   node tools/preview.mjs src/dev/preview_hub2.ts shots/hub/pieces.png 1400 1750 pieces
//     the hub's own pieces, each frame

import { hushSetPieces } from '../art/act2_set';
import { gateWardPieces } from '../art/floor11';
import type { Piece } from '../art/floorkit';
import { GW_RISE, GW_ZONE, gateWardLook, gateWardPaintFloor } from '../art/gateward';
import { CITY, hubPieces } from '../art/hub2';
import type { HubPiece } from '../art/hub2';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { makeDungeonProps } from '../art/props';
import { HHP, HWP, paintTerrain, pictureOf, terrainOf } from '../art/terrain';
import type { Terrain } from '../art/terrain';
import { makeTownProps } from '../art/town';
import { TOWN_WORK, makeTownsfolk, townFrame } from '../art/townsfolk';
import type { Townsfolk } from '../art/townsfolk';
import { makeWaypointArt } from '../art/crypt_ways';
import { drawText, textWidth } from '../engine/font';
import type { Sprite } from '../engine/px';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'square';
const PHONE = HASH.endsWith('-phone');
const PW = HASH === 'pieces' ? 1400 : PHONE ? 1014 : 2000;
const PH = HASH === 'pieces' ? 1750 : PHONE ? 468 : 1150;

const cvs = document.createElement('canvas');
cvs.width = PW;
cvs.height = PH;
cvs.style.display = 'block';
const g = cvs.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
function show(): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

// ---------------------------------------------------------------------------------------------------
// WHAT IS LAID

type Rect = [number, number, number, number]; // x0, y0, x1, y1 (x1, y1 not in it)
/** A piece of the Gate Ward's or the hub's, by name: on the floor, hung on a house front ('left': a front along x; 'right': along y), or on the roofs. */
interface Laid { name: string; frame: number; x: number; y: number; on?: 'left' | 'right' | 'top'; flat?: boolean }
/** The town's own things (art/town.ts) and its four people, each on its tile; `kind` as the game names them. */
type TownKind = 'forge' | 'anvil' | 'rack' | 'trough' | 'tentBack' | 'tentTable' | 'rug' | 'runeRing' | 'runeSlab' | 'runeStone' | 'lexicon' | 'stash' | 'brazier' | 'waypoint' | 'armourer' | 'mystic' | 'wordsmith' | 'stranger';
interface TownLaid { kind: TownKind; x: number; y: number; v?: number }
interface Place {
  name: string;
  w: number;
  h: number;
  open: Rect;
  streets: Rect[];
  squares: { x: number; y: number; r: number }[];
  dress: Laid[];
  town: TownLaid[];
  /** The services' names, where the game writes them (render.ts NAME_LIFT). */
  labels: [string, number, number, number][];
  hero: [number, number];
  whole: [number, number];
}

const st = (facing: number, v: number): number => facing * 4 + v;
/** The wordsmith's ring round the tile (x, y): him, his slab before him, six standing stones, the circle in the floor (level.ts TOWN). */
function ring(x: number, y: number): TownLaid[] {
  const stones: [number, number][] = [[-2, -1], [-1, -2], [1, -2], [-2, 1], [2, -1], [-1, 2]];
  return [
    { kind: 'runeRing', x, y },
    { kind: 'wordsmith', x, y },
    { kind: 'runeSlab', x, y: y + 1 },
    ...stones.map(([dx, dy], i) => ({ kind: 'runeStone' as const, x: x + dx, y: y + dy, v: i % 5 })),
  ];
}
/** The armourer's smithy against a house front along x at row y: the forge, his rack, his trough; him, his anvil. */
function smithy(x: number, y: number): TownLaid[] {
  return [
    { kind: 'forge', x, y },
    { kind: 'rack', x: x - 3, y },
    { kind: 'trough', x: x + 1, y },
    { kind: 'armourer', x: x - 1, y: y + 1 },
    { kind: 'anvil', x: x - 1, y: y + 2 },
  ];
}
/** The mystic's tent, its back toward -y: its rug, its back, him, his table of wares. */
function bazaar(x: number, y: number): TownLaid[] {
  return [
    { kind: 'rug', x, y },
    { kind: 'tentBack', x, y: y - 1 },
    { kind: 'mystic', x, y },
    { kind: 'tentTable', x, y: y + 1 },
  ];
}

/**
 * THE LAMPLIT MARKET SQUARE: a square of Vellum 22 tiles by 20, its houses round it lit at their windows; the fountain
 * in its middle on its ring of setts; the ward arch, the way on (the gate), out of its back edge, the waypoint by it;
 * the smithy against the back row on the right, the mystic's tent on the right, the wordsmith's ring on the left, the
 * Lexicon between it and the fountain, the stash toward the front; the stranger in the mouth of the alley on the left.
 * Market stalls along its edges, lamps at the mouths of its streets, lanterns and bunting on the fronts.
 */
const SQUARE: Place = {
  name: 'Vellum',
  w: 56,
  h: 56,
  open: [16, 14, 38, 34],
  streets: [
    [25, 2, 28, 14], // the way on, out of the back edge
    [4, 21, 16, 24], // the stranger's alley, off to the left
    [38, 24, 52, 27], // a street off to the right
    [24, 34, 27, 50], // a street toward the eye
  ],
  squares: [{ x: 27, y: 24, r: 3.4 }],
  dress: [
    { name: 'the fountain', frame: 0, x: 27, y: 24 },
    { name: 'the ward arch', frame: 0, x: 26.5, y: 14.05 },
    // the back edge, left of the arch: stalls facing in, their goods, crates and a barrel
    { name: 'market stall', frame: st(0, 0), x: 18.6, y: 14.7 },
    { name: 'market stall', frame: st(0, 1), x: 22.0, y: 14.7 },
    { name: 'baskets of produce', frame: 0, x: 20.3, y: 16.2 },
    { name: 'crates', frame: 0, x: 16.8, y: 16.4 },
    { name: 'barrel', frame: 0, x: 16.7, y: 17.6 },
    // the left edge, below the alley: a stall facing in, hay
    { name: 'market stall', frame: st(1, 2), x: 16.7, y: 28.4 },
    { name: 'sacks of grain', frame: 0, x: 16.9, y: 30.6 },
    // the near edges: stalls with their backs to the eye, a handcart, the horse trough
    { name: 'market stall', frame: st(2, 3), x: 31.2, y: 33.3 },
    { name: 'market stall', frame: st(2, 0), x: 20.0, y: 33.3 },
    { name: 'handcart', frame: 0, x: 35.6, y: 31.2 },
    { name: 'the horse trough', frame: 0, x: 37.0, y: 19.6 },
    // the lamps, at the mouths of the streets and round the fountain
    { name: 'street lamp', frame: 0, x: 23.8, y: 15.0 },
    { name: 'street lamp', frame: 1, x: 17.4, y: 24.6 },
    { name: 'street lamp', frame: 0, x: 37.5, y: 27.6 },
    { name: 'street lamp', frame: 1, x: 27.8, y: 33.4 },
    { name: 'street lamp', frame: 0, x: 20.6, y: 29.8 },
    { name: 'street lamp', frame: 1, x: 30.6, y: 20.4 },
    // on the house fronts of the back row (along x) and the left (along y)
    { name: 'paper lanterns', frame: 0, x: 20.3, y: 14, on: 'left' },
    { name: 'paper lanterns', frame: 0, x: 30.2, y: 14, on: 'left' },
    { name: 'festival bunting', frame: 0, x: 18.0, y: 14, on: 'left' },
    { name: 'festival bunting', frame: 0, x: 36.4, y: 14, on: 'left' },
    { name: 'wall lantern', frame: 0, x: 23.0, y: 14, on: 'left' },
    { name: "a house's door", frame: 1, x: 33.6, y: 14, on: 'left' },
    { name: 'wall lantern', frame: 1, x: 16, y: 19.0, on: 'right' },
    { name: 'paper lanterns', frame: 0, x: 16, y: 27.0, on: 'right' },
    { name: 'festival bunting', frame: 0, x: 16, y: 31.8, on: 'right' },
    { name: "a house's door", frame: 1, x: 16, y: 25.5, on: 'right' },
    { name: 'washing on a line', frame: 0, x: 10.0, y: 21, on: 'left' },
    // the roofs
    { name: 'chimney', frame: 0, x: 21.6, y: 11.4, on: 'top' },
    { name: 'chimney', frame: 1, x: 33.4, y: 10.8, on: 'top' },
    { name: 'chimney', frame: 0, x: 12.4, y: 27.5, on: 'top' },
  ],
  town: [
    { kind: 'waypoint', x: 28.6, y: 16.2 },
    ...smithy(34, 14),
    ...bazaar(35, 22),
    ...ring(20, 24),
    { kind: 'lexicon', x: 23, y: 21 },
    { kind: 'stash', x: 28, y: 30 },
    { kind: 'stranger', x: 16, y: 20 },
  ],
  labels: [
    ['GATE', 26.5, 14.6, 92],
    ['ARMOURER', 33.5, 15.5, 50],
    ['MYSTIC', 35.5, 23.5, 86],
    ['WORDSMITH', 20.5, 24.5, 44],
    ['LEXICON', 23.5, 21.5, 40],
    ['STASH', 28.5, 30.5, 26],
    ['STRANGER', 16.5, 20.5, 40],
  ],
  hero: [27.6, 28.6],
  whole: [27.0, 23.0],
};

/**
 * THE CAMP INSIDE THE GATE (his pick, 22 Oct: “The camp yes.  Also some different looks for the shops”): the yard just
 * inside the city's broken gate, 20 tiles by 18, where the survivors of the siege camp: the gatehouse at the end of the
 * short street in from the left (the gate, the way on), the waypoint at its mouth; tents of patched canvas along the
 * back, bedrolls before them; the cooking fire in the middle, logs round it to sit on; THE ARMOURER'S FIELD FORGE ON ITS
 * CART against the back row on the right, his anvil on its stump before it (his pick); THE MYSTIC'S PAINTED CARAVAN on
 * the right, its side let down, he before it and his trestle of wares before him (his pick); the wordsmith's ring at the
 * front on the left, the Lexicon by the gate's street, the stash by a handcart; the stranger in the gatehouse's shadow.
 * A cart barricade across the street off to the right, braziers, crates and sacks of what was saved. `all`: the rest
 * camp-style too, to look at (his words: “I’d like to see all of them in a new style but more than likely we’ll stick
 * to just the vendors for new looks”): the ring of stones prised up out of the street round a column's drum, chalked;
 * the Lexicon on crates; the stash on a handcart; the stranger's barrel of dice.
 */
const STONES: [number, number][] = [[-2, -1], [-1, -2], [1, -2], [-2, 1], [2, -1], [-1, 2]];
function campPlace(all: boolean): Place {
  const R: [number, number] = [21, 28];
  return {
    name: 'Vellum',
    w: 56,
    h: 56,
    open: [16, 14, 36, 32],
    streets: [
      [11, 21, 16, 24], // in from the broken gate
      [36, 25, 50, 28], // a street off to the right, barricaded
      [22, 32, 25, 46], // a street toward the eye
    ],
    squares: [],
    dress: [
      { name: 'the city gate, held', frame: 1, x: 11.4, y: 22.5 },
      // the tents along the back, their bedrolls; one on the left, one at the front with its back to the eye
      { name: 'a tent', frame: 0 * 4 + 0, x: 18.4, y: 15.4 },
      { name: 'a tent', frame: 1 * 4 + 0, x: 22.4, y: 15.4 },
      { name: 'a tent', frame: 2 * 4 + 1, x: 17.2, y: 25.0 },
      { name: 'a tent', frame: 3 * 4 + 2, x: 26.0, y: 30.8 },
      { name: 'a bedroll', frame: 0 * 2 + 0, x: 18.3, y: 17.9 },
      { name: 'a bedroll', frame: 2 * 2 + 0, x: 22.6, y: 18.0 },
      // the cooking fire, the logs round it
      { name: 'the cooking fire', frame: 0, x: 25.6, y: 22.6 },
      { name: 'a log to sit on', frame: 0, x: 25.6, y: 20.5 },
      { name: 'a log to sit on', frame: 1, x: 23.4, y: 22.8 },
      { name: 'a log to sit on', frame: 1, x: 27.8, y: 23.0 },
      // THE ARMOURER'S FIELD FORGE, his anvil before it; THE MYSTIC'S CARAVAN, his trestle before him
      { name: "the armourer's field forge", frame: 1, x: 31.6, y: 15.3 },
      { name: "the armourer's anvil, on its stump", frame: 0, x: 32.05, y: 17.4 },
      { name: "the mystic's caravan", frame: 0, x: 26.4, y: 15.7 },
      { name: "the mystic's trestle", frame: 1, x: 26.4, y: 18.6 },
      { name: 'a tent', frame: 1 * 4 + 3, x: 33.8, y: 21.0 },
      // what was saved: crates, a barrel, sacks, hay; the handcart; the barricade across the street off to the right
      { name: 'crates', frame: 0, x: 31.6, y: 30.9 },
      { name: 'barrel', frame: 0, x: 30.4, y: 31.2 },
      { name: 'sacks of grain', frame: 0, x: 23.6, y: 15.8 },
      { name: 'hay bales', frame: 0, x: 34.9, y: 29.6 },
      { name: 'handcart', frame: 0, x: 33.0, y: 30.6 },
      { name: 'the cart barricade', frame: 0, x: 36.4, y: 26.4 },
      { name: 'crates', frame: 0, x: 35.2, y: 24.4 },
      { name: 'street lamp', frame: 0, x: 16.6, y: 20.6 },
      { name: 'street lamp', frame: 1, x: 18.6, y: 31.4 },
      // on the fronts: washing strung out, lanterns, bunting
      { name: 'washing on a line', frame: 0, x: 20.4, y: 14, on: 'left' },
      { name: 'paper lanterns', frame: 0, x: 22.0, y: 14, on: 'left' },
      { name: 'wall lantern', frame: 0, x: 29.4, y: 14, on: 'left' },
      { name: 'festival bunting', frame: 0, x: 34.8, y: 14, on: 'left' },
      { name: 'wall lantern', frame: 1, x: 16, y: 19.2, on: 'right' },
      { name: 'washing on a line', frame: 0, x: 16, y: 29.6, on: 'right' },
      { name: 'paper lanterns', frame: 0, x: 14.4, y: 21, on: 'left' },
      // the roofs
      { name: 'chimney', frame: 0, x: 23.6, y: 11.2, on: 'top' },
      { name: 'chimney', frame: 1, x: 12.6, y: 27.4, on: 'top' },
      // THE REST CAMP-STYLE, to look at
      ...(all
        ? [
            { name: "the wordsmith's chalk ring", frame: 0, x: R[0] + 0.5, y: R[1] + 0.5, flat: true },
            { name: "the wordsmith's drum", frame: 0, x: R[0] + 0.5, y: R[1] + 1.5 },
            ...STONES.map(([dx, dy], i) => ({ name: "the wordsmith's stone, propped", frame: i % 5, x: R[0] + dx + 0.5, y: R[1] + dy + 0.5 })),
            { name: 'the Lexicon, on its crates', frame: 0, x: 19.5, y: 20.5 },
            { name: 'the stash, on its cart', frame: 0, x: 29.5, y: 29.5 },
            { name: "the stranger's barrel", frame: 0, x: 16.6, y: 20.5 },
          ]
        : []),
    ],
    town: [
      { kind: 'waypoint', x: 17.0, y: 22.0 },
      { kind: 'armourer', x: 31.6, y: 16.0 },
      { kind: 'mystic', x: 25.9, y: 17.1 },
      ...(all ? [{ kind: 'wordsmith' as const, x: R[0], y: R[1] }] : [...ring(R[0], R[1]), { kind: 'lexicon' as const, x: 19, y: 20 }, { kind: 'stash' as const, x: 29, y: 29 }]),
      { kind: 'stranger', x: 16, y: 19 },
      { kind: 'brazier', x: 22.6, y: 25.2 },
      { kind: 'brazier', x: 29.4, y: 19.4 },
      { kind: 'brazier', x: 34, y: 27 },
    ],
    labels: [
      ['GATE', 11.9, 22.5, 150],
      ['ARMOURER', 32.1, 16.5, 50],
      ['MYSTIC', 26.4, 18.6, 96],
      ['WORDSMITH', 21.5, 28.5, 44],
      ['LEXICON', 19.5, 20.5, all ? 50 : 40],
      ['STASH', 29.5, 29.5, all ? 34 : 26],
      ['STRANGER', 16.5, 19.5, 40],
    ],
    hero: [25.4, 25.6],
    whole: [23.8, 22.4],
  };
}

// ---------------------------------------------------------------------------------------------------
// THE GROUND: every tile that is not open is houses, painted by the Gate Ward's look

function groundOf(pl: Place): { T: Terrain; tiles: Uint8Array } {
  const { w: W, h: H } = pl;
  const tiles = new Uint8Array(W * H).fill(T_WALL);
  const zone = new Uint8Array(W * H);
  const inR = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (pl.streets.some((r) => inR(r, x, y))) tiles[i] = T_FLOOR;
      if (inR(pl.open, x, y)) {
        tiles[i] = T_FLOOR;
        zone[i] = GW_ZONE.Square;
      }
    }
  }
  const FLOOR = { depth: 11, seed: 21, w: W, h: H, tiles, cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
  const LAND = { floor: FLOOR, zone: (tx: number, ty: number) => zone[ty * W + tx], squares: pl.squares, houses: [], swept: true };
  return { T: terrainOf(gateWardPaintFloor(LAND, 'open'), gateWardLook(LAND, 'open')), tiles };
}

// ---------------------------------------------------------------------------------------------------
// THE PICTURES OF WHAT STANDS

const PIECES = new Map<string, Piece | HubPiece>([...gateWardPieces(), ...hushSetPieces(), ...hubPieces()].map((p) => [p.name, p]));
const TP = makeTownProps(CITY);
const DP = makeDungeonProps(CITY);
const WAY = makeWaypointArt(CITY);
let FOLK: Townsfolk | null = null;
const folk = (): Townsfolk => (FOLK ??= makeTownsfolk());

function spriteOfLaid(l: Laid): Sprite | null {
  const p = PIECES.get(l.name) as Piece | undefined;
  if (!p) return null;
  if (l.on === 'left') return p.left ? p.left[l.frame] : null;
  if (l.on === 'right') return p.right ? p.right[l.frame] : null;
  return p.frames ? p.frames[l.frame] : null;
}
const T0 = 0.6;
function spriteOfTown(t: TownLaid): Sprite {
  switch (t.kind) {
    case 'forge': return TP.forge[1];
    case 'anvil': return TP.anvil;
    case 'rack': return TP.rack;
    case 'trough': return TP.trough;
    case 'tentBack': return TP.tentBack;
    case 'tentTable': return TP.tentTable;
    case 'rug': return TP.rug;
    case 'runeRing': return TP.runeRing[2];
    case 'runeSlab': return TP.runeSlab[2];
    case 'runeStone': return TP.runeStone[t.v ?? 0].alight;
    case 'lexicon': return TP.lexicon[1];
    case 'stash': return TP.stash;
    case 'brazier': return DP.brazier[Math.floor(t.x + t.y) % 4];
    case 'waypoint': return WAY.awake[3];
    case 'armourer': return townFrame(folk().armourer, T0, 0.1, TOWN_WORK.armourer);
    case 'mystic': return townFrame(folk().mystic, T0, 0.7, TOWN_WORK.mystic);
    case 'wordsmith': return townFrame(folk().wordsmith, T0, 1.3, TOWN_WORK.wordsmith);
    case 'stranger': return townFrame(folk().stranger, T0, 0.4, TOWN_WORK.stranger);
  }
}
const FLAT_TOWN = new Set<TownKind>(['rug', 'runeRing']);

// ---------------------------------------------------------------------------------------------------
// DRAWING: two picture pixels to a game pixel; the camera with (cx, cy) on the screen's middle

let VX = 0;
let VY = 0;
function camOn(x: number, y: number): void {
  const [cx, cy] = pictureOf(x, y);
  VX = Math.round(cx - PW / 2);
  VY = Math.round(cy - PH / 2);
}
function paintPanel(T: Terrain): void {
  const piece = 256;
  for (let py = 0; py < PH; py += piece) {
    for (let px = 0; px < PW; px += piece) {
      const pw = Math.min(piece, PW - px);
      const ph = Math.min(piece, PH - py);
      const p = paintTerrain(T, VX + px, VY + py, pw, ph);
      g.putImageData(new ImageData(p.rgba, pw, ph), px, py);
    }
  }
}
/** A sprite with its anchor at the world's (x, y), `up` picture pixels raised. Sizes in game pixels: two picture pixels each. */
function drawSprite(sp: Sprite, x: number, y: number, up = 0): void {
  const [sx0, sy0] = pictureOf(x, y);
  g.drawImage(sp.img, Math.round(sx0 - VX - sp.ax * 2), Math.round(sy0 - VY - up - sp.ay * 2), sp.w * 2, sp.h * 2);
}
function shadowAt(x: number, y: number, k: number): void {
  if (k <= 0) return;
  const [sx0, sy0] = pictureOf(x, y);
  g.fillStyle = 'rgba(14, 10, 24, 0.4)';
  g.beginPath();
  g.ellipse(sx0 - VX, sy0 - VY, 30 * k, 13 * k, 0, 0, Math.PI * 2);
  g.fill();
}
interface Lit { sp: Sprite; x: number; y: number; up: number }
function lightsOver(lits: Lit[]): void {
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const { sp, x, y, up } of lits) {
    if (!sp.lights) continue;
    const [sx0, sy0] = pictureOf(x, y);
    for (const L of sp.lights) {
      const lx = sx0 - VX - sp.ax * 2 + L.x * 2;
      const ly = sy0 - VY - up - sp.ay * 2 + L.y * 2;
      const r = L.r * 2 * 1.5;
      const grd = g.createRadialGradient(lx, ly, 0, lx, ly, r);
      grd.addColorStop(0, L.color);
      if (/^#[0-9a-f]{6}$/i.test(L.color)) grd.addColorStop(0.35, L.color + '80');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = Math.min(1, (L.a ?? 0.5) * 0.85);
      g.fillStyle = grd;
      g.fillRect(lx - r, ly - r, 2 * r, 2 * r);
    }
  }
  g.restore();
}
/** DUSK, WARM (his pick): the last of the day's warmth over everything, a soft vignette; the lamps, windows and fires do the rest. */
function dusk(): void {
  g.save();
  g.globalCompositeOperation = 'soft-light';
  g.fillStyle = 'rgba(255, 160, 90, 0.38)';
  g.fillRect(0, 0, PW, PH);
  g.restore();
  g.fillStyle = 'rgba(46, 22, 40, 0.08)';
  g.fillRect(0, 0, PW, PH);
  const grd = g.createRadialGradient(PW / 2, PH / 2, 0.45 * Math.hypot(PW, PH) / 2, PW / 2, PH / 2, Math.hypot(PW, PH) / 2);
  grd.addColorStop(0, 'rgba(10,6,16,0)');
  grd.addColorStop(1, 'rgba(10,6,16,0.32)');
  g.fillStyle = grd;
  g.fillRect(0, 0, PW, PH);
}
function labelsOf(pl: Place): void {
  g.save();
  g.scale(2, 2);
  for (const [text, x, y, lift] of pl.labels) {
    const [sx0, sy0] = pictureOf(x, y);
    const w = textWidth(text, 'small') + 4;
    const lx = Math.round((sx0 - VX) / 2 - w / 2);
    const ly = Math.round((sy0 - VY) / 2 - lift);
    g.globalAlpha = 0.78;
    g.fillStyle = P.black;
    g.fillRect(lx, ly - 1, w, 7);
    g.globalAlpha = 1;
    drawText(g, text, lx + 2, ly, P.tl5, { font: 'small' });
  }
  g.restore();
}
function nameOf(pl: Place, tiles: Uint8Array, hero: [number, number]): void {
  g.save();
  g.scale(2, 2);
  drawText(g, pl.name, 4, 3, THEME.text, { shadow: P.ink });
  g.restore();
  const [mx, my, mw, mh] = [PW - 137, 11, 126, 86];
  g.fillStyle = '#100e22';
  g.fillRect(mx, my, mw, mh);
  const k = 0.11;
  for (let yy = 0; yy < mh; yy += 2) {
    for (let xx = 0; xx < mw; xx += 2) {
      const a = (xx - mw / 2) / (HWP * k);
      const b = (yy - mh / 2) / (HHP * k);
      const tx = Math.floor(hero[0] + (a + b) / 2);
      const ty = Math.floor(hero[1] + (b - a) / 2);
      if (tx >= 0 && ty >= 0 && tx < pl.w && ty < pl.h && tiles[ty * pl.w + tx] === T_FLOOR) {
        g.fillStyle = '#5b55c7';
        g.fillRect(mx + xx, my + yy, 2, 2);
      }
    }
  }
  g.fillStyle = '#28dcf0';
  g.fillRect(mx + mw / 2 - 2, my + mh / 2 - 2, 4, 4);
}

function drawPlace(pl: Place, phone: boolean): void {
  const { T, tiles } = groundOf(pl);
  const cam = phone ? pl.hero : pl.whole;
  camOn(cam[0], cam[1]);
  paintPanel(T);
  const lits: Lit[] = [];
  // on the fronts and the roofs, first: they are part of the houses
  for (const l of pl.dress) {
    if (!l.on) continue;
    const sp = spriteOfLaid(l);
    if (!sp) continue;
    const up = l.on === 'top' ? GW_RISE : 0;
    drawSprite(sp, l.x, l.y, up);
    lits.push({ sp, x: l.x, y: l.y, up });
  }
  // what lies flat, then whatever stands, by depth
  type Thing = { d: number; draw: () => void };
  const things: Thing[] = [];
  for (const l of pl.dress) {
    if (l.on) continue;
    const sp = spriteOfLaid(l);
    if (!sp) continue;
    const p = PIECES.get(l.name) as { shadow?: number };
    things.push({ d: l.flat ? -1e6 + l.x + l.y : l.x + l.y, draw: () => { shadowAt(l.x, l.y, p.shadow ?? 0); drawSprite(sp, l.x, l.y); } });
    lits.push({ sp, x: l.x, y: l.y, up: 0 });
  }
  for (const t of pl.town) {
    const sp = spriteOfTown(t);
    const x = t.x + 0.5;
    const y = t.y + 0.5;
    const flat = FLAT_TOWN.has(t.kind);
    things.push({ d: flat ? -1e6 + x + y : x + y, draw: () => drawSprite(sp, x, y) });
    lits.push({ sp, x, y, up: 0 });
  }
  const knight = spriteOf3(MOVES3.rear, 0.3, 'front');
  things.push({ d: pl.hero[0] + pl.hero[1], draw: () => { shadowAt(pl.hero[0], pl.hero[1], 0.3); drawSprite(knight, pl.hero[0], pl.hero[1]); } });
  things.sort((a, b) => a.d - b.d);
  for (const t of things) t.draw();
  dusk();
  lightsOver(lits);
  labelsOf(pl);
  nameOf(pl, tiles, cam);
}

if (HASH === 'square' || HASH === 'square-phone') {
  drawPlace(SQUARE, PHONE);
  show();
} else if (HASH === 'camp' || HASH === 'camp-phone' || HASH === 'camp-all' || HASH === 'camp-all-phone') {
  drawPlace(campPlace(HASH.startsWith('camp-all')), PHONE);
  show();
} else if (HASH === 'pieces') {
  g.fillStyle = '#3a3440';
  g.fillRect(0, 0, PW, PH);
  let x = 20;
  let y = 30;
  let rowH = 0;
  for (const p of hubPieces()) {
    g.save();
    g.scale(2, 2);
    drawText(g, p.name, x / 2, (y - 24) / 2, THEME.text, { shadow: P.ink });
    g.restore();
    for (const sp of p.frames.slice(0, p.name === 'a tent' ? 4 : 5)) {
      const w = sp.w * 2;
      const h = sp.h * 2;
      if (x + w > PW - 10) {
        x = 20;
        y += rowH + 34;
        rowH = 0;
      }
      g.drawImage(sp.img, x, y, w, h);
      x += w + 6;
      rowH = Math.max(rowH, h);
    }
    x += 20;
  }
  show();
}
