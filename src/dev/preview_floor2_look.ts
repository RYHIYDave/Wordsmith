// Dev page: FLOOR 2'S HALLS, THE CONDEMNED'S ROAD (dev/floor2_look_paint.ts), three looks for the owner to pick from, leading out
// into his yard at night (art/yard.ts and art/yard_gate.ts, his yes, unchanged). Nothing of the game imports it.
//   node tools/preview.mjs src/dev/preview_floor2_look.ts docs/mockups/floor2_look/pictures/a_whitewashed_cells.png 1200 840 "overview:whitewash"
//   node tools/preview.mjs src/dev/preview_floor2_look.ts docs/mockups/floor2_look/pictures/a_phone.png 1014 468 "phone:whitewash"
//   PREVIEW_TIMEOUT=600000 node tools/preview.mjs src/dev/preview_floor2_look.ts docs/mockups/floor2_look/pictures/floor2_look_sheet.png 1200 5200 "sheet"
//     overview  down from floor 1's stair to the long walk and out through his gate into the yard, the knight on the long walk
//     phone     one phone screen as the game would show it, the camera on the knight on the long walk
//     gate      the way out into the yard close, the knight just through it, the walk's end behind, twice as big
//     sheet     the three looks and their phone screens, labelled, and the way out close beside the knight in each
//   look: whitewash (A), walk (B) or slits (C)
import { drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import { HOOD, RAVEN, headsmanPieces } from '../art/floor2';
import type { Piece } from '../art/floorkit';
import { SHINES } from '../art/floorkit';
import { CRYPT_FLOORS, OLD_IRON, OLD_RUST, TIMBER } from '../art/crypt';
import { stoneOf } from '../art/props';
import { makeHeroArt3 } from '../art/heroes3';
import { makeHeadsman2Art } from '../art/headsman2_moves';
import { PILLAR, STRIP } from '../art/gates';
import type { Strip } from '../art/gates';
import { makeYardArt } from '../art/yard';
import { makeYardGateArt } from '../art/yard_gate';
import {
  BOSS_AT, CAPTION, DOOR, Deep, FLOOR_BACK, HERO_GATE, HERO_PHONE, HERO_RUN, LETTER, LOOKS, LOWS, PALS, PHONE, PICTURE, VIEW,
  WALLS, YARD, YARD_TORCHES, atPx, bands, lightsOf, litBy, lowWall, mixC, paintAltar, paintBeams, paintBenches, paintChips,
  paintFloors, paintLectern, paintStairs, paintWalls, setView,
} from './floor2_look_paint';
import type { Lights, Look, R5 } from './floor2_look_paint';

const [mode = 'overview', lookArg = 'whitewash'] = decodeURIComponent(location.hash.slice(1)).split(':');
const ONE: Look = (LOOKS as string[]).includes(lookArg) ? (lookArg as Look) : 'whitewash';

// ---- the floor's own pieces (art/floor2.ts, his yes), their colours brought into each look's stone, iron, wood, rope, straw
const pieces = headsmanPieces();
const Y = makeYardArt();
const gate = makeYardGateArt();
const piece = (n: string): Piece => {
  const p = pieces.find((q) => q.name === n) ?? Y.pieces.find((q) => q.name === n);
  if (!p) throw new Error(`no piece named ${n}`);
  return p;
};
type Fam = 'stone' | 'iron' | 'wood' | 'hood' | 'bone' | 'rope' | 'straw';
const TH = CRYPT_FLOORS[1];
const KNOWN: [Fam, readonly string[]][] = [
  ['stone', [...TH.slab, ...TH.cap, ...TH.capLow, ...TH.lit, ...TH.shade, TH.mortar, ...stoneOf(TH), '#110f17', '#19161f', '#221e29']],
  ['iron', [...OLD_IRON, ...OLD_RUST, '#1c1a3a', '#4c4884', '#8480bc', '#a8a4dc', '#16142c', '#34305e', '#4c4880', '#9a96c8', '#16132e', '#2e2a5a', '#4c4888', '#6a66a8', '#a4a0d4', '#262036', '#3c3452', '#4e4666', ...RAVEN]],
  ['wood', [...TIMBER, '#100c18', '#211a2e', '#352c46', '#433856']],
  ['hood', [...HOOD]],
  ['bone', ['#26203e', '#6a6294', '#a29ac6', '#c2bae2', '#1e1a34', '#3e3862', '#5a5484']],
  ['rope', ['#1e1820', '#4a3e48', '#6a5c64', '#7e7078', '#1e1626', '#3c2e3c', '#58465a', '#6a5868']],
  ['straw', ['#2e2a3a', '#433e52', '#5a546a', '#3e3a52', '#4a4660', '#58526a']],
];
const rgbOf = (c: string): [number, number, number] => {
  const n = parseInt(c.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lumOf = (c: string): number => {
  const [r, g, b] = rgbOf(c);
  return 0.3 * r + 0.55 * g + 0.15 * b;
};
const RANGE = new Map<Fam, [number, number]>(KNOWN.map(([f, cs]) => [f, [Math.min(...cs.map(lumOf)), Math.max(...cs.map(lumOf))]]));
const gradeMemo = new Map<string, string>();
/** A colour of the floor's own, brought into a look: its family by the nearest of its own, and its place in that family's light. */
function graded(c: string, look: Look): string {
  if (SHINES.has(c)) return c;
  const key = c + look;
  const hit = gradeMemo.get(key);
  if (hit) return hit;
  const [r, g, b] = rgbOf(c);
  let best: Fam = 'stone';
  let bd = 1e9;
  for (const [f, cs] of KNOWN) for (const k of cs) {
    const [r2, g2, b2] = rgbOf(k);
    const d = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
    if (d < bd) {
      bd = d;
      best = f;
    }
  }
  const P = PALS[look];
  // (their stone a step lighter than the walls', so that a piece stands off them)
  const STONE: R5 = [P.bare[1], P.bare[2], P.bare[3], P.bare[4], mixC(P.bare[4], '#ffffff', 0.12)];
  const ramp: R5 = best === 'stone' ? STONE : best === 'iron' ? P.iron : best === 'wood' ? P.wood : best === 'hood' ? P.hood : best === 'bone' ? P.bone : best === 'rope' ? P.rope : P.straw;
  const [lo, hi] = RANGE.get(best)!;
  const t = Math.max(0, Math.min(4, ((lumOf(c) - lo) / Math.max(1, hi - lo)) * 4.4 - 0.2));
  const i = Math.min(3, Math.floor(t));
  const out = mixC(ramp[i], ramp[i + 1], t - i);
  gradeMemo.set(key, out);
  return out;
}

const pixMemo = new Map<Sprite, ImageData>();
function pixOf(s: Sprite): ImageData {
  let d = pixMemo.get(s);
  if (!d) {
    const q = s.img.getContext('2d') as CanvasRenderingContext2D;
    pixMemo.set(s, (d = q.getImageData(0, 0, s.img.width, s.img.height)));
  }
  return d;
}

interface Blit {
  s: Sprite;
  x: number;
  y: number;
  z: number;
  d: number;
  tone?: (c: string) => string;
  /** Toned pixel by pixel, where it lands on the picture (the yard's own, lit by its torches as the renderer cuts its dark). */
  ptone?: (c: string, X: number, Y: number) => string;
  /** Laid flat on the floor (only over floor, under what stands). */
  flat?: boolean;
  /** Laid as floor itself (the yard's cobbles). */
  ground?: boolean;
  shadow?: number;
  figure?: boolean;
}

function placeOf(b: Blit): { X: number; Y: number; k: number } {
  const [px, py] = atPx(b.x, b.y, b.z);
  const dens = b.s.density ?? 1;
  return { X: (Math.round(px / 2) - b.s.ax) * 2, Y: (Math.round(py / 2) - b.s.ay) * 2, k: 2 / dens };
}

function blit(D: Deep, b: Blit): void {
  const { X, Y, k } = placeOf(b);
  const im = pixOf(b.s);
  const memo = new Map<number, string>();
  D.figure = !!b.figure;
  D.floor = !!b.ground;
  for (let j = 0; j < im.height; j++) {
    for (let i = 0; i < im.width; i++) {
      const o = (j * im.width + i) * 4;
      if (im.data[o + 3] < 128) continue;
      const key = (im.data[o] << 16) | (im.data[o + 1] << 8) | im.data[o + 2];
      let c = memo.get(key);
      if (!c) {
        c = `#${key.toString(16).padStart(6, '0')}`;
        if (b.tone) c = b.tone(c);
        memo.set(key, c);
      }
      for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) {
        const x = X + i * k + dx;
        const y = Y + j * k + dy;
        const cc = b.ptone ? b.ptone(c, x, y) : c;
        if (b.flat) {
          if (!D.isFloor(x, y) || D.depthAt(x, y) > b.d + 1.2) continue;
          D.over(x, y, cc);
        } else {
          D.depth = b.d;
          D.set(x, y, cc);
        }
      }
    }
  }
  D.figure = false;
  D.floor = false;
}

/** THE SOFT SHADOW the game draws under what stands (render.ts): a soft oval, darkest under it, gone at its rim; on the floor only. */
function shadowUnder(D: Deep, b: Blit): void {
  if (!b.shadow) return;
  const [px, py] = atPx(b.x, b.y, b.z);
  const w = b.shadow * 22.6 * 1.5 * 2;
  const h = b.shadow * 11.3 * 1.5 * 2;
  for (let y = Math.floor(py - h); y <= py + h; y++) {
    for (let x = Math.floor(px - w); x <= px + w; x++) {
      const r = Math.hypot((x + 0.5 - px) / w, (y + 0.5 - py) / h);
      if (r >= 1) continue;
      if (!D.isFloor(x, y)) continue;
      const a = 0.62 * (r < 0.4 ? 1 - 0.15 * (r / 0.4) : 0.85 * (1 - (r - 0.4) / 0.6));
      const o = D.get(x, y);
      if (!o || SHINES.has(o)) continue;
      D.over(x, y, mixC(o, '#000000', a));
    }
  }
}

/** (the Headsman waits at the foot of his scaffold's steps, just out of the picture: not drawn) */
const SHOW_HIM = false;
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
let headsman: Sprite | null = null;
const headsmanSprite = (): Sprite => headsman ?? (headsman = makeHeadsman2Art().front.idle[0]);

// ---- WHERE THE FLOOR'S OWN PIECES STAND, look by look
type Thing = [name: string, x: number, y: number, frame: number];
type OnWall = [name: string, along: number, face: number, alongX: boolean];
type Tile = [name: string, tx: number, ty: number, frame: number];

const THINGS: Record<Look, Thing[]> = {
  whitewash: [
    // the gaoler's room
    ["the headsman's strongbox", -7.2, -4.3, 0], ['crate', -4.3, -4.4, 0], ['pail', -3.7, 0.4, 0], ['dropped lantern', -6.4, 0.3, 0],
    // the holding cells
    ['the stocks', 3.4, -2.7, 0], ['kicked-over stool', 1.3, -1.6, 0], ['basket', 6.3, -0.8, 0], ['pail', 0.6, -4.6, 0], ['sawdust barrel', 6.4, -4.7, 0],
    // the walk
    ['coil of rope', 14.4, 8.9, 0],
  ],
  walk: [
    ["the headsman's strongbox", -7.2, -4.3, 0], ['crate', -4.3, -4.4, 0], ['dropped lantern', -6.4, 0.3, 0],
    ['kicked-over stool', 2.0, -2.2, 0], ['pail', 0.6, -4.6, 0], ['crate', 6.4, -4.7, 0], ['basket', 6.3, -0.8, 0],
    ['coil of rope', 14.4, 8.9, 0],
  ],
  slits: [
    ["the headsman's strongbox", -7.2, -4.3, 0], ['sawdust barrel', -4.3, -4.4, 0], ['pail', -3.7, 0.4, 0],
    ['the stocks', 3.4, -2.7, 0], ['pail', 0.6, -4.6, 0], ['basket', 6.4, -4.7, 0], ['kicked-over stool', 5.8, -1.0, 0],
    ['coil of rope', 14.4, 8.9, 0],
  ],
};
/** Wall pieces of the floor's own, in bare bays. */
const ON_WALLS: Record<Look, OnWall[]> = {
  whitewash: [['hoods on pegs', 0.1, -8, false], ['axe on hooks', 0.1, 0, false], ['chain from the dark', -5.0, 0, false]],
  walk: [['hoods on pegs', 0.1, -8, false], ['axe on hooks', 0.1, 0, false], ['chain from the dark', -5.0, 0, false], ['tools of the trade', -7.9, -5, true]],
  slits: [['hoods on pegs', 0.1, -8, false], ['axe on hooks', 0.1, 0, false], ['chain from the dark', -5.0, 0, false]],
};
/** The floor's own tiles laid in it: his hood in the floor at the walk's start, a trapdoor in the cells. */
const TILES: Record<Look, Tile[]> = {
  whitewash: [['the hood in the floor', 13, 2, 0], ['trapdoor', 5, -3, 0]],
  walk: [['the hood in the floor', 13, 2, 0], ['trapdoor', 4, -3, 0]],
  slits: [['the hood in the floor', 13, 2, 0], ['trapdoor', 5, -2, 0]],
};

// ---- HIS YARD, as the game lays it (game/yard.ts; the doorway at the yard's 9th to 11th tiles, so the gallows and the bell's corner
// change places), its own pictures in its own night (art/yard.ts), lit by its torches; its gate (art/yard_gate.ts) in the doorway
const YX = YARD.x0;
const YY = YARD.y0;
/** The yard's things, from its far corner (as game/yard.ts sets them for this doorway). */
const YARD_THINGS: [string, number, number, number][] = [
  ['the scaffold, draped', 6.5, 5.4, 1.6], ['the long gallows', 2.5, 1.05, 0.8], ['the great bell', 1.6, 5.8, 0], ['sawdust barrel', 2.5, 4.5, 0],
  ['crate', 1.5, 4.5, 0], ['the grindstone', 11.9, 5.9, 0], ['the stocks', 2.0, 9.0, 0], ['brazier of irons', 3.5, 8.5, 0], ['brazier of irons', 10.5, 8.5, 0],
];
const YARD_LAID: [number, number, string][] = [
  [9, 0, 'beaten earth'], [10, 0, 'beaten earth'], [11, 0, 'beaten earth'], [10, 1, 'beaten earth'], [11, 11, 'a little puddle'], [8, 11, 'a puddle'],
  [12, 4, 'a long puddle'], [6, 8, 'yard sawdust'], [5, 8, 'yard sawdust'], [6, 9, 'yard sawdust'], [7, 9, 'yard sawdust'],
];
const YARD_FLAT: [string, number, number][] = [['a wide puddle', 2.6, 6.0], ['a great puddle', 10.8, 6.6], ['a wide puddle', 4.6, 11.2]];
const YARD_STONE: R5 = ['#0e0c24', '#1b1c36', '#262850', '#343867', '#566090'];
const NIGHT = '#06040e';

/** The yard's own colours under its moonlit dark, lit where its torches and braziers burn: as the renderer cuts its dark, a hole
 * round each light on the picture, here in three bands, their edges a checker of two-pixel squares. */
function yardToner(P: (typeof PALS)[Look], lights: { x: number; y: number; z: number; r: number }[]): (c: string, X: number, Y: number) => string {
  const spots = lights.map((l) => {
    const [sx, sy] = atPx(l.x, l.y, l.z);
    return { sx, sy, r: l.r };
  });
  const memo = new Map<string, string>();
  return (c: string, X: number, Y: number): string => {
    if (SHINES.has(c)) return c;
    const jit = ((X >> 1) + (Y >> 1)) & 1 ? 0.05 : -0.05;
    let w = 0;
    for (const s of spots) {
      const d = Math.hypot((X - s.sx) / s.r, (Y - s.sy) / (s.r * 0.7)) + jit;
      const b = d < 0.3 ? 3 : d < 0.58 ? 2 : d < 1 ? 1 : 0;
      if (b > w) w = b;
    }
    const key = c + w;
    const hit = memo.get(key);
    if (hit) return hit;
    let o = mixC(c, NIGHT, [0.34, 0.26, 0.18, 0.1][w]);
    if (w > 0) o = mixC(o, P.warm[w - 1], [0.12, 0.2, 0.3][w - 1]);
    memo.set(key, o);
    return o;
  };
}

/** Every picture of the place for a look, with the knight at `heroAt`, painted into the view as it is set. */
function scene(look: Look, heroAt: [number, number]): HTMLCanvasElement {
  const P = PALS[look];
  const L = lightsOf(look, heroAt);
  // (the yard's braziers burn too)
  for (const [n, x, y] of YARD_THINGS) if (n === 'brazier of irons') L.lamps.push({ x: YX + x, y: YY + y, z: 30, r: 1.9, k: 3, kind: 'warm' });
  const D = new Deep(VIEW.W, VIEW.H, P.beyond);
  const yt = yardToner(P, [
    ...YARD_TORCHES.map(([x, y]) => ({ x, y, z: 92, r: 150 })),
    ...YARD_THINGS.filter((t) => t[0] === 'brazier of irons').map(([, x, y]) => ({ x: YX + x, y: YY + y, z: 24, r: 130 })),
  ]);
  const toneAt = (x: number, y: number, z: number) => {
    const [m, w, p] = bands(x, y, z + 16, L);
    return (c: string): string => (SHINES.has(c) ? c : litBy(P, graded(c, look), m, w, p));
  };
  const onView = (x: number, y: number, pad: number): boolean => {
    const [px, py] = atPx(x, y);
    return px > -pad && px < VIEW.W + pad && py > -pad && py < VIEW.H + pad * 2;
  };

  // ---- THE YARD'S GROUND: its cobbles and what is laid on them
  const laid = new Map(YARD_LAID.map(([x, y, n]) => [`${x},${y}`, n]));
  for (let ty = YARD.y0; ty < YARD.y1; ty++) for (let tx = YARD.x0; tx < YARD.x1; tx++) {
    if (!onView(tx + 0.5, ty + 0.5, 80)) continue;
    const n = laid.get(`${tx - YX},${ty - YY}`);
    const s = n ? Y.tiles.find((p) => p.name === n)!.frames![0] : Y.floor(tx - YX, ty - YY);
    blit(D, { s, x: tx, y: ty, z: 0, d: tx + ty + 1 - FLOOR_BACK, ground: true, ptone: yt });
  }
  for (const [n, x, y] of YARD_FLAT) blit(D, { s: piece(n).frames![0], x: YX + x, y: YY + y, z: 0, d: YX + x + YY + y, flat: true, ptone: yt });

  // ---- THE HALLS' FLOOR, the pieces laid flat on it, the straws and grit; the walls; the stair down from floor 1; the chapel
  paintFloors(D, look, L);
  for (const [n, tx, ty, f] of TILES[look]) {
    const s = piece(n).frames![f];
    blit(D, { s, x: tx, y: ty, z: 0, d: tx + ty, tone: toneAt(tx + 0.5, ty + 0.5, -16), flat: true });
  }
  paintChips(D, look, L);
  paintWalls(D, look, L);
  paintStairs(D, look, L);
  paintAltar(D, look, L);
  paintBenches(D, look, L);
  paintLectern(D, look, L);

  // ---- WHAT STANDS, each at its depth
  const blits: Blit[] = [];
  // the yard's far wall, a tile at a time (the doorway's three left out), its torches
  for (let x = YARD.x0; x < YARD.x1; x++) {
    if (x >= DOOR.x0 && x < DOOR.x1) continue;
    if (!onView(x, DOOR.row, 200)) continue;
    blits.push({ s: Y.faceLeft[(x * 5 + 2) % 4], x, y: DOOR.row, z: 0, d: x + DOOR.row + 0.4, ptone: yt });
  }
  const yTorch = piece("the yard's torch");
  for (const [x, y] of YARD_TORCHES) blits.push({ s: yTorch.left![1], x, y, z: 0, d: x + y - 0.5, ptone: yt });
  // HIS GATE, as render.ts stands a boss gate: a pillar at each end, the portcullis at the back of the way (drawn up), the arch's strips
  const WIDE = PILLAR / 32;
  const gat = (t: number, back = 0): [number, number] => [DOOR.x0 + t, DOOR.face - back];
  const strips = (list: Strip[], t0: number, back: number): void => {
    for (const q of list) {
      const [x, y] = gat(t0 + q.t, back);
      blits.push({ s: q.s, x, y, z: 0, d: x + y + STRIP / 64, ptone: yt });
    }
  };
  const pillar = gate.pillar(true);
  for (const [x, y] of [gat(0), gat(3 + WIDE)]) blits.push({ s: pillar, x, y, z: 0, d: x + y - WIDE, ptone: yt });
  strips(gate.portcullis(true, true, 60), -WIDE, WIDE);
  strips(gate.arch(true, true, false), -WIDE, 0);
  // the yard's things
  for (const [n, x, y, near] of YARD_THINGS) {
    const p = piece(n);
    const wx = YX + x;
    const wy = YY + y;
    if (!onView(wx, wy, 260)) continue;
    blits.push({ s: p.frames![n === 'brazier of irons' ? (x > 5 ? 2 : 0) : 0], x: wx, y: wy, z: 0, d: wx + wy + near, ptone: yt, shadow: Math.min(1.2, p.shadow ?? 0) });
  }
  // the halls' things, the floor's own
  for (const [n, along, face, ax] of ON_WALLS[look]) {
    const p = piece(n);
    const s = (ax ? p.left! : p.right!)[0];
    const [x, y] = ax ? [along, face] : [face, along];
    blits.push({ s, x, y, z: 0, d: x + y + 0.6, tone: toneAt(x, y, 40) });
  }
  const torch = piece('torch');
  for (const w of WALLS) {
    w.bays[look].forEach((b, k) => {
      if (b !== 'torch') return;
      const along = w.b0 + (k + 0.5) * w.bw;
      const [x, y] = w.alongX ? [along, w.at] : [w.at, along];
      blits.push({ s: (w.alongX ? torch.left! : torch.right!)[k % 4], x, y, z: 0, d: x + y + 0.6, tone: toneAt(x, y, 40) });
    });
  }
  for (const [n, x, y, f] of THINGS[look]) {
    const p = piece(n);
    blits.push({ s: p.frames![f], x, y, z: 0, d: x + y, tone: toneAt(x, y, 0), shadow: p.shadow ?? 0 });
  }
  // THE HEADSMAN at the foot of his scaffold's steps, as the game has him; THE KNIGHT
  if (SHOW_HIM && onView(BOSS_AT[0], BOSS_AT[1], 120)) blits.push({ s: headsmanSprite(), x: BOSS_AT[0], y: BOSS_AT[1], z: 0, d: BOSS_AT[0] + BOSS_AT[1], shadow: 0.62, figure: true, ptone: yt });
  blits.push({ s: hero.front.idle[0], x: heroAt[0], y: heroAt[1], z: 0, d: heroAt[0] + heroAt[1], shadow: 0.36, figure: true });
  blits.sort((a, b) => a.d - b.d);
  for (const b of blits) {
    shadowUnder(D, b);
    blit(D, b);
  }

  // ---- THE WALLS TOWARD THE EYE, cut low as the game leaves them; the yard's right wall in its own stone
  LOWS.forEach((r, i) => lowWall(D, look, L, r, 451 + i));
  lowWall(D, look, L, { x0: YARD.x1, y0: DOOR.row, x1: YARD.x1 + 1, y1: YARD.y1 }, 471, YARD_STONE.map((c) => mixC(c, NIGHT, 0.3)) as unknown as R5);
  // ---- THE MOON IN THE AIR of each shaft
  paintBeams(D, look, L);

  const cv = D.toCanvas();
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.setTransform(2, 0, 0, 2, 0, 0);
  for (const b of blits) {
    if (!b.s.lights || b.s.lights.length === 0) continue;
    const [px, py] = atPx(b.x, b.y, b.z);
    drawLights(g, b.s, Math.round(px / 2), Math.round(py / 2));
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  return cv;
}

// =================================================================================================

function overviewOf(look: Look, at: [number, number]): HTMLCanvasElement {
  setView(PICTURE.W, PICTURE.H, PICTURE.OX, PICTURE.OY);
  return scene(look, at);
}
function phoneOf(look: Look): HTMLCanvasElement {
  const [hx, hy] = HERO_PHONE[look];
  setView(PHONE.W, PHONE.H, Math.round(PHONE.W / 2 - (hx - hy) * 32), Math.round(PHONE.H / 2 + PHONE.lift - (hx + hy) * 16));
  return scene(look, HERO_PHONE[look]);
}
/** The way out close, the knight just through it in the yard, the long walk's end beside it: a part of the picture, twice as big. */
export const GATE_CROP = { w: 200, h: 300 };
function gateOf(look: Look): HTMLCanvasElement {
  const C = GATE_CROP;
  // (the gate's middle a little left of the crop's, its top in view)
  const mx = (DOOR.x0 + DOOR.x1) / 2;
  setView(C.w, C.h, Math.round(C.w / 2 - (mx - DOOR.face) * 32 - 10), Math.round(C.h - 58 - (mx + DOOR.face) * 16));
  const src = scene(look, HERO_GATE);
  const cv = document.createElement('canvas');
  cv.width = C.w * 2;
  cv.height = C.h * 2;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.drawImage(src, 0, 0, C.w, C.h, 0, 0, C.w * 2, C.h * 2);
  return cv;
}

function sheet(): HTMLCanvasElement {
  const SW = 1200;
  const blocks: { h: number; draw: (g: CanvasRenderingContext2D, y: number) => void }[] = [];
  const text = (s: string, size: number, bold = false, color = '#e8dccb'): { h: number; draw: (g: CanvasRenderingContext2D, y: number) => void } => ({
    h: size + 22,
    draw: (g, y) => {
      g.fillStyle = color;
      g.font = `${bold ? 'bold ' : ''}${size}px sans-serif`;
      g.textBaseline = 'top';
      g.fillText(s, 24, y + 12);
    },
  });
  const pic = (c: HTMLCanvasElement, gap = 10): { h: number; draw: (g: CanvasRenderingContext2D, y: number) => void } => ({
    h: c.height + gap,
    draw: (g, y) => g.drawImage(c, Math.round((SW - c.width) / 2), y),
  });
  blocks.push(text("Floor 2: the condemned's road, from the stair down to his yard. Three looks.", 22, true));
  blocks.push(text('Down the stair from floor 1 (top left), the holding cells, the chapel of last rites, the long walk, out through his gate.', 18, false, '#b8ab98'));
  for (const look of LOOKS) {
    blocks.push(text(CAPTION[look], 18, true));
    blocks.push(pic(overviewOf(look, HERO_RUN)));
    blocks.push(text(`${LETTER[look].toUpperCase()} on a phone: one screen, the knight on the long walk.`, 18, false, '#b8ab98'));
    blocks.push(pic(phoneOf(look), 26));
  }
  blocks.push(text('The way out into his yard, close: the knight just through his gate (A, B, C), twice as big.', 21, true));
  const gates = LOOKS.map(gateOf);
  blocks.push({
    h: gates[0].height + 30,
    draw: (g, y) => {
      gates.forEach((c, i) => {
        g.drawImage(c, i * 400, y);
        g.fillStyle = '#e8dccb';
        g.font = 'bold 22px sans-serif';
        g.textBaseline = 'top';
        g.fillText(LETTER[LOOKS[i]].toUpperCase(), i * 400 + 12, y + 10);
      });
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

// (drawn once the page has loaded: the sheet takes longer than a page is given to load)
const draw = (): void => {
  const out = mode === 'sheet' ? sheet() : mode === 'phone' ? phoneOf(ONE) : mode === 'gate' ? gateOf(ONE) : overviewOf(ONE, HERO_RUN);
  out.style.display = 'block';
  document.body.style.margin = '0';
  document.body.style.background = '#000';
  document.body.appendChild(out);
  (window as unknown as { __ready: boolean; __size: [number, number] }).__size = [out.width, out.height];
  (window as unknown as { __ready: boolean }).__ready = true;
};
if (document.readyState === 'complete') setTimeout(draw, 50);
else window.addEventListener('load', () => setTimeout(draw, 50));
