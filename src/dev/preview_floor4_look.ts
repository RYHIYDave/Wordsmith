// Dev page: FLOOR 4, THE BURIED CHAPEL OF BONES (dev/floor4_look_paint.ts), three looks for the owner to pick from. Nothing of
// the game imports it.
//   node tools/preview.mjs src/dev/preview_floor4_look.ts docs/mockups/floor4_look/pictures/a_candlelit.png 1200 840 "overview:candle"
//   node tools/preview.mjs src/dev/preview_floor4_look.ts docs/mockups/floor4_look/pictures/a_phone.png 1014 468 "phone:candle"
//   node tools/preview.mjs src/dev/preview_floor4_look.ts docs/mockups/floor4_look/pictures/floor4_look_sheet.png 1200 5200 "sheet"
//     overview  the four chapels to the gate and his hall, the knight in the nave bay (600 x 420 game pixels at two picture
//               pixels each)
//     phone     one phone screen as the game would show it, the camera on the knight before the gate (507 x 234 game pixels)
//     gate      the gate close, the knight before it, twice as big
//     sheet     the three looks and their phone screens, labelled, and the gate close beside the knight in each
//   look: candle (A), breach (B) or cold (C)
import { drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import { ossuaryPieces } from '../art/floor4';
import type { Piece } from '../art/floorkit';
import { SHINES } from '../art/floorkit';
import { makeHeroArt3 } from '../art/heroes3';
import { makeAmalgamActionArt } from '../art/amalgam_action';
import { EMBER } from '../art/props';
import {
  BOSS_AT, BRAZIERS_C, CAPTION, DAIS, Deep, HERO_GATE, HERO_PHONE, HERO_RUN, LETTER, LOOKS, LOWS, PALS, PHONE, PICTURE, WALL_LANTERNS,
  atPx, flamePx, lightsOf, litBy, bands, lowWall, mixC, paintBreaks, paintChips, paintFloorCandles, paintFloors, paintGate, paintPews, paintPiers,
  paintPropLanterns, paintProps, paintStacks, paintWalls, shaftHaze,
} from './floor4_look_paint';
import type { Lights, Look, Pal } from './floor4_look_paint';

const [mode = 'overview', lookArg = 'candle'] = decodeURIComponent(location.hash.slice(1)).split(':');
const ONE: Look = (LOOKS as string[]).includes(lookArg) ? (lookArg as Look) : 'candle';
const { W, H } = PICTURE;

// ---- the floor's own pieces (art/floor4.ts, his yes), their colours brought into each look's light; fire stays as it is
const pieces = ossuaryPieces();
const piece = (n: string): Piece => {
  const p = pieces.find((q) => q.name === n);
  if (!p) throw new Error(`no piece named ${n}`);
  return p;
};
function graded(c: string, look: Look): string {
  if (SHINES.has(c)) return c;
  const n = parseInt(c.slice(1, 7), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const l = 0.3 * r + 0.55 * g + 0.15 * b;
  if (look === 'candle') {
    // (the bone toward ivory, the stone toward grey: a third of its colour kept, warmed)
    r = (l + (r - l) * 0.3) * 1.04 + 5;
    g = (l + (g - l) * 0.3) * 0.98 + 2;
    b = (l + (b - l) * 0.3) * 0.86 - 2;
  } else if (look === 'breach') {
    r = (l + (r - l) * 0.35) * 0.98 + 3;
    g = (l + (g - l) * 0.35) * 0.95 + 1;
    b = (l + (b - l) * 0.35) * 0.92;
  } else {
    r = (l + (r - l) * 0.3) * 0.94;
    g = (l + (g - l) * 0.3) * 0.98 + 1;
    b = (l + (b - l) * 0.3) * 1.06 + 4;
  }
  const f = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
}

/** A sprite's pixels, read once. */
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
  /** The depth it stands at (x + y of its foot, or more for a piece on a wall). */
  d: number;
  /** Its colour, brought into the look's light (none: as it is: the figures). */
  tone?: (c: string) => string;
  /** Lying flat on the floor (a floor tile): painted over the floor only. */
  flat?: boolean;
  shadow?: number;
}

/** Where a sprite's top-left falls on the picture, in picture pixels, and how many picture pixels to one of its own. */
function placeOf(b: Blit): { X: number; Y: number; k: number } {
  const [px, py] = atPx(b.x, b.y, b.z);
  const dens = b.s.density ?? 1;
  return { X: (Math.round(px / 2) - b.s.ax) * 2, Y: (Math.round(py / 2) - b.s.ay) * 2, k: 2 / dens };
}

function blit(D: Deep, b: Blit): void {
  const { X, Y, k } = placeOf(b);
  const im = pixOf(b.s);
  const memo = new Map<number, string>();
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
        if (b.flat) {
          const at = D.depthAt(x, y);
          if (at > b.d + 2.05 || at < b.d - 0.05) continue;
          D.over(x, y, c);
        } else {
          D.depth = b.d;
          D.set(x, y, c);
        }
      }
    }
  }
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
      if (D.depthAt(x, y) > b.d + 0.6) continue;
      const a = 0.7 * (r < 0.4 ? 1 - 0.15 * (r / 0.4) : 0.85 * (1 - (r - 0.4) / 0.6));
      const o = D.get(x, y);
      if (!o || SHINES.has(o)) continue;
      D.over(x, y, mixC(o, '#000000', a));
    }
  }
}

const hero = makeHeroArt3().of('warrior', { twoHanded: false });
const boss = makeAmalgamActionArt();

// ---- WHERE THE FLOOR'S OWN PIECES STAND, look by look
type Thing = [name: string, x: number, y: number, frame: number, z?: number];
type OnWall = [name: string, along: number, face: number, alongX: boolean];
type Tile = [name: string, tx: number, ty: number, frame: number];

const ALTAR: Thing = ["the cult's altar", 4.0, -9.3, 0, DAIS.z * 2];
const THINGS: Record<Look, Thing[]> = {
  candle: [
    ALTAR, ['pyramid of skulls', -2.9, 11.0, 0], ['the reliquary', -2.6, 4.9, 0], ['heap of skulls', -0.4, 2.0, 0], ['rib cage', 6.2, 10.6, 0],
    ["a cultist's robe", 5.9, 2.4, 0], ['oil jug', 2.8, 2.2, 0], ['the eldest skull', -1.6, 9.5, 0],
    ['the charnel heap', 7.6, -1.6, 0], ['heap of skulls', 6.3, 4.8, 0],
  ],
  breach: [
    ALTAR, ['the mine cart', -1.0, 9.1, 0], ['ore sack', -2.2, 12.2, 0], ['ore tub', -0.2, 11.4, 0], ['drill steels', 3.0, 11.3, 0],
    ['broken ladder', 6.2, 7.8, 0], ['empty boots', 3.2, 4.6, 0], ['timber crib', 1.4, -1.8, 0], ['the boulder', 6.2, 5.0, 0],
    ['heap of skulls', -0.6, 4.6, 0], ['the charnel heap', 7.6, -1.6, 0], ['snapped prop', 6.0, -6.6, 0],
  ],
  cold: [
    ALTAR, ['the bone column', 0.5, -7.7, 0], ['pyramid of skulls', 8.0, -4.6, 0], ['pyramid of skulls', -2.6, 10.8, 0], ['pyramid of skulls', 6.2, 4.9, 0],
    ['the charnel heap', 7.6, -1.6, 0], ['the reliquary', -0.4, 4.6, 0], ['rib cage', 6.2, 11.0, 0], ['arm from a heap', 2.9, 2.4, 0],
    ['the eldest skull', -1.6, 9.5, 0], ['heap of skulls', -2.8, 4.9, 0],
  ],
};
const ON_WALLS: Record<Look, OnWall[]> = {
  candle: [
    ["the cult's candle", 0.5, -10, true], ["the cult's candle", 8.5, -10, true], ['garland of skulls', -2.5, 1, true], ['garland of skulls', 9.5, -4, false],
    ["the cult's daub", -3.5, 7, true], ["the dead's arm", 4.5, -4, false],
  ],
  breach: [
    ...WALL_LANTERNS.map(([along, face, ax]): OnWall => ["miner's lantern", along, face, ax]),
    ['pick in the wall', -2.5, 1, true], ["the miners' ladder", 7.5, -10, true], ["the miners' tools", -3.5, -1, false], ['seam of ore', -1.5, -1, false],
  ],
  cold: [
    ['garland of skulls', -2.5, 1, true], ['ribs on a spike', 0.5, -10, true], ['ribs on a spike', 8.5, -10, true], ["the cult's daub", -3.5, 7, true],
    ["the dead's arm", 4.5, -4, false], ['garland of skulls', 9.5, -4, false],
  ],
};
/** Wall tiles of the floor's own (each in place of a tile of the face): B's shored rock and the miners' breach. */
const WALL_TILES: Record<Look, OnWall[]> = {
  candle: [],
  breach: [['shored rock', -9.5, -1, false], ["the miners' breach", 3.5, -4, false]],
  cold: [],
};
const TILES: Record<Look, Tile[]> = {
  candle: [['bone-paved floor', -2, 11, 0], ['bone-paved floor', -1, 11, 0], ['the drag', 5, -3, 0], ['the drag', 6, -2, 0], ['earth and bones', 6, -7, 0]],
  breach: [
    ['the rails', -3, 9, 0], ['the rails', -2, 9, 0], ['the rails', -1, 9, 0], ['the rails', 0, 9, 0], ['spilled ore', -2, 10, 0], ['earth and bones', 3, 4, 0],
    ['raked earth', 5, -3, 0], ['the drag', 6, -2, 0], ['earth and bones', 0, -6, 0],
  ],
  cold: [['bone-paved floor', 4, 9, 0], ['bone-paved floor', 4, 10, 0], ['the drag', 5, -3, 0], ['the drag', 6, -2, 0], ['raked earth', 2, -6, 0]],
};

/** A brazier of the cult's (look C): a bowl of black iron on three legs, its fire honest orange. */
function brazier(D: Deep, P: Pal, L: Lights, x: number, y: number): void {
  const [X0, Y0] = atPx(x, y);
  const X = Math.round(X0 / 2) * 2;
  const Y = Math.round(Y0);
  D.depth = x + y + 0.05;
  for (const [lx, ly] of [[-7, 0], [7, 0], [0, 3]] as const) for (let j = 0; j < 18; j++) D.set(X + lx + Math.round((lx * j) / 60), Y + ly - j, j < 2 ? P.iron[1] : lx < 0 ? P.iron[3] : P.iron[2]);
  for (let j = 0; j < 7; j++) {
    const w = 9 - Math.floor(j / 3);
    for (let i = -w; i <= w; i++) D.set(X + i, Y - 18 - (6 - j), j === 0 ? P.iron[3] : i < -w + 2 ? P.iron[3] : i > w - 2 ? P.iron[0] : P.iron[1]);
  }
  // its coals and its fire
  for (let i = -8; i <= 8; i++) D.set(X + i, Y - 25, (i + 9) % 3 ? EMBER[1] : EMBER[0]);
  for (let j = 0; j < 14; j++) {
    const w = Math.max(0, Math.round(6 * (1 - j / 14) + Math.sin(j * 1.7) * 1.2));
    for (let i = -w; i <= w; i++) D.set(X + i + Math.round(Math.sin(j * 0.6) * 1.5), Y - 26 - j, j < 3 ? EMBER[2] : Math.abs(i) < w * 0.4 ? (j < 8 ? '#ffe6a8' : EMBER[3]) : j < 9 ? EMBER[3] : EMBER[2]);
  }
  void L;
}

/** Every picture of the place for a look, with the knight at `heroAt`: the whole picture, W x H. */
function scene(look: Look, heroAt: [number, number]): HTMLCanvasElement {
  const P = PALS[look];
  const L = lightsOf(look, heroAt);
  const D = new Deep(W, H, P.beyond);
  // the colour of one of the floor's pieces, brought into the look and lit where it stands (a band less than the floor)
  const toneAt = (x: number, y: number, z: number) => {
    const [w, k, p] = bands(x, y, z + 16, L);
    return (c: string): string => (SHINES.has(c) ? c : litBy(P, graded(c, look), w - 1, k - 1, p - 1));
  };

  // ---- THE FLOOR, the pieces laid flat on it, the chips; the walls; what is built
  paintFloors(D, look, L);
  for (const [n, tx, ty, f] of TILES[look]) {
    const s = piece(n).frames![f];
    blit(D, { s, x: tx, y: ty, z: 0, d: tx + ty, tone: toneAt(tx + 0.5, ty + 0.5, 0), flat: true });
  }
  paintChips(D, look, L);
  paintWalls(D, look, L);
  paintGate(D, look, L);
  paintPiers(D, look, L);
  paintStacks(D, look, L);
  paintBreaks(D, look, L);
  paintProps(D, look, L);
  paintPews(D, look, L);
  paintFloorCandles(D, look, L);
  if (look === 'cold') for (const [x, y] of BRAZIERS_C) brazier(D, P, L, x, y);

  // ---- WHAT STANDS, each at its depth
  const blits: Blit[] = [];
  // the stretch of the hall's back wall where the dead are stacked floor to top: floor 4's own skull wall, three tiles (the cave's)
  for (const along of [-6.5, -5.5, -4.5]) {
    const s = piece('the skull wall').right![0];
    blits.push({ s, x: -1, y: along, z: 0, d: -1 + along + 0.55, tone: toneAt(-0.9, along, 30) });
  }
  for (const [n, along, face, ax] of WALL_TILES[look]) {
    const p = piece(n);
    const s = (ax ? p.left! : p.right!)[0];
    const [x, y] = ax ? [along, face] : [face, along];
    blits.push({ s, x, y, z: 0, d: x + y + 0.55, tone: toneAt(x, y, 30) });
    if (p.frames && p.frames[0]) blits.push({ s: p.frames[0], x: ax ? x : x + 0.5, y: ax ? y + 0.5 : y, z: 0, d: x + y + 0.7, tone: toneAt(x, y, 0), shadow: p.shadow });
  }
  for (const [n, along, face, ax] of ON_WALLS[look]) {
    const p = piece(n);
    const s = (ax ? p.left! : p.right!)[0];
    const [x, y] = ax ? [along, face] : [face, along];
    blits.push({ s, x, y, z: 0, d: x + y + 0.6, tone: toneAt(x, y, 40) });
  }
  for (const [n, x, y, f, z = 0] of THINGS[look]) {
    const p = piece(n);
    blits.push({ s: p.frames![f], x, y, z, d: x + y, tone: toneAt(x, y, z), shadow: p.shadow ?? 0 });
  }
  // THE AMALGAMATION, in his hall, as the game has him; THE KNIGHT
  blits.push({ s: boss.front.idle[0], x: BOSS_AT[0], y: BOSS_AT[1], z: 0, d: BOSS_AT[0] + BOSS_AT[1], shadow: 0.9 });
  blits.push({ s: hero.front.idle[0], x: heroAt[0], y: heroAt[1], z: 0, d: heroAt[0] + heroAt[1], shadow: 0.36 });
  blits.sort((a, b) => a.d - b.d);
  for (const b of blits) {
    shadowUnder(D, b);
    blit(D, b);
  }

  // ---- THE WALLS TOWARD THE EYE, cut low as the game leaves them
  LOWS.forEach((r, i) => lowWall(D, look, L, r, 451 + i));

  // ---- the shafts' grey light in the air (C), kept off the knight and off him
  const hp = atPx(heroAt[0], heroAt[1], 28);
  const bp = atPx(BOSS_AT[0], BOSS_AT[1], 50);
  shaftHaze(D, look, [[hp[0], hp[1], 44], [bp[0], bp[1], 120]]);

  const cv = D.toCanvas();
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  // what gives off light, its glow over the dark (as the renderer draws it)
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

function phoneOf(look: Look): HTMLCanvasElement {
  const src = scene(look, HERO_PHONE);
  const [hx, hy] = atPx(HERO_PHONE[0], HERO_PHONE[1]);
  const cv = document.createElement('canvas');
  cv.width = PHONE.W;
  cv.height = PHONE.H;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = PALS[look].beyond;
  g.fillRect(0, 0, cv.width, cv.height);
  // (the camera on the hero, a little up the screen of him, as the game's)
  g.drawImage(src, Math.round(PHONE.W / 2 - hx), Math.round(PHONE.H / 2 - (hy - PHONE.lift)));
  return cv;
}
/** The gate close, the knight before it: a crop of the picture, twice as big. */
export const GATE_CROP = { x: 548, y: 214, w: 200, h: 300 };
function gateOf(look: Look): HTMLCanvasElement {
  const src = scene(look, HERO_GATE);
  const C = GATE_CROP;
  const cv = document.createElement('canvas');
  cv.width = C.w * 2;
  cv.height = C.h * 2;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.drawImage(src, C.x, C.y, C.w, C.h, 0, 0, C.w * 2, C.h * 2);
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
  blocks.push(text("Floor 4, the Amalgamation's floor: the buried chapel of bones. Three looks to pick from.", 26, true));
  blocks.push(text('Four small chapels you find your way through (from the way in, bottom left), to his gate and his hall (top right).', 18, false, '#b8ab98'));
  for (const look of LOOKS) {
    blocks.push(text(CAPTION[look], 20, true));
    blocks.push(pic(scene(look, HERO_RUN)));
    blocks.push(text(`${LETTER[look].toUpperCase()} on a phone: one screen, the knight in the chapel before the gate.`, 18, false, '#b8ab98'));
    blocks.push(pic(phoneOf(look), 26));
  }
  blocks.push(text('His gate, close, the knight before it (A, B, C), twice as big.', 21, true));
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

const out = mode === 'sheet' ? sheet() : mode === 'phone' ? phoneOf(ONE) : mode === 'gate' ? gateOf(ONE) : scene(ONE, HERO_RUN);
out.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#000';
document.body.appendChild(out);
(window as unknown as { __ready: boolean; __size: [number, number] }).__size = [out.width, out.height];
(window as unknown as { __ready: boolean }).__ready = true;
void flamePx;
