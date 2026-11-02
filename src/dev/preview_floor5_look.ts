// Dev page: FLOOR 5, THE MINE THAT BECOMES HIS TEMPLE (dev/floor5_look_paint.ts), three looks for the owner to pick from.
// Nothing of the game imports it.
//   node tools/preview.mjs src/dev/preview_floor5_look.ts docs/mockups/floor5_look/pictures/a_through_the_threshold.png 1200 840 "overview:threshold"
//   node tools/preview.mjs src/dev/preview_floor5_look.ts docs/mockups/floor5_look/pictures/a_phone.png 1014 468 "phone:threshold"
//   PREVIEW_TIMEOUT=300000 node tools/preview.mjs src/dev/preview_floor5_look.ts docs/mockups/floor5_look/pictures/floor5_look_sheet.png 1200 5200 "sheet"
//     overview  the landing to the gate and his hall, the knight in the drift (600 x 420 game pixels at two picture pixels each)
//     phone     one phone screen as the game would show it, the camera on the knight where the mine turns to temple
//     gate      the gate close, the knight before it, twice as big
//     sheet     the three looks and their phone screens, labelled, and the gate close beside the knight in each
//   look: threshold (A), creep (B) or pit (C)
import { drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import { lairPieces } from '../art/floor5';
import type { Piece } from '../art/floorkit';
import { SHINES } from '../art/floorkit';
import { makeHeroArt3 } from '../art/heroes3';
import { makeFleshmancerArt3 } from '../art/fleshmancer';
import { lairMouth } from '../art/cave4';
import {
  BOSS_AT, BRAZIERS, CAPTION, Deep, HERO_GATE, HERO_PHONE, HERO_RUN, LETTER, LOOKS, LOWS, MOUTH_AT, PALS, PHONE, PICTURE,
  atPx, bands, brazier, lightsOf, litBy, lowWall, mixC, paintCandles, paintChips, paintFloors, paintGate, paintLanterns,
  paintMouthRim, paintParapets, paintPit, paintSets, paintStop, paintWalls, templeK,
} from './floor5_look_paint';
import type { Look } from './floor5_look_paint';

const [mode = 'overview', lookArg = 'threshold'] = decodeURIComponent(location.hash.slice(1)).split(':');
const ONE: Look = (LOOKS as string[]).includes(lookArg) ? (lookArg as Look) : 'threshold';
const { W, H } = PICTURE;

// ---- the floor's own pieces (art/floor5.ts, his yes), their colours brought into each look's light; fire stays as it is
const pieces = lairPieces();
const piece = (n: string): Piece => {
  const p = pieces.find((q) => q.name === n);
  if (!p) throw new Error(`no piece named ${n}`);
  return p;
};
/** A colour of the floor's own, brought toward the look: the mine's pieces toward its rock and timber, the temple's toward its black stone. */
function graded(c: string, look: Look, temple: number): string {
  if (SHINES.has(c)) return c;
  const n = parseInt(c.slice(1, 7), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const l = 0.3 * r + 0.55 * g + 0.15 * b;
  // (a third of its colour kept; warmed in the mine, cooled toward violet-black in the temple)
  const keep = 0.4;
  const warm = look === 'creep' ? 0.6 : 1;
  const wr = 1.06 * (1 - temple) + 0.96 * temple;
  const wg = 0.99 * (1 - temple) + 0.94 * temple;
  const wb = 0.86 * (1 - temple) + 1.04 * temple;
  r = (l + (r - l) * keep) * (1 + (wr - 1) * warm) + 3;
  g = (l + (g - l) * keep) * (1 + (wg - 1) * warm) + 1;
  b = (l + (b - l) * keep) * (1 + (wb - 1) * warm);
  const f = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
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
  flat?: boolean;
  shadow?: number;
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
const boss = makeFleshmancerArt3();

// ---- WHERE THE FLOOR'S OWN PIECES STAND, look by look
type Thing = [name: string, x: number, y: number, frame: number];
type OnWall = [name: string, along: number, face: number, alongX: boolean];
type Tile = [name: string, tx: number, ty: number, frame: number];

/** In his hall, every look: the rift, the miners' shaft at its far corner, his dead heaped, the cult's own. */
const HALL_THINGS: Thing[] = [
  ['the rift', 4.6, -7.4, 0], ['the mine shaft', 0.5, -8.5, 0], ['the great bone heap', 7.6, -2.6, 0], ['the long bone heap', 1.0, -2.2, 0],
  ['skulls given to him', 3.0, -8.9, 0], ['skulls given to him', 6.3, -8.9, 0], ['the skull standard', 2.4, -6.0, 0], ['the skull standard', 7.0, -6.0, 0],
  ["the cult's coffer", 8.2, -8.4, 1],
];
const THINGS: Record<Look, Thing[]> = {
  threshold: [
    ...HALL_THINGS,
    // the landing and the drift: the mine
    ['the pile of props', -3.1, 11.3, 0], ['powder keg', -3.3, 7.6, 0], ['basket of ore', 0.3, 7.7, 0], ['the spilled kibble', -0.3, 11.2, 0],
    ['the cart on its side', 5.9, 11.0, 0], ['basket of ore', 6.3, 7.7, 0], ['a dropped lantern', 3.4, 11.5, 0],
    // the shrine gallery: still the mine
    ['the winding drum', -1.2, 2.3, 0], ['the sump pump', -3.2, 2.6, 0], ["a miner's bones", 0.2, 2.0, 0],
    // the antechamber: the temple
    ['the skull standard', 2.6, 3.0, 0], ['the skull standard', 6.5, 3.0, 0], ['the effigy', 2.7, 5.2, 0], ['offering jar', 6.4, 5.4, 0], ['box of candles', 6.3, 4.5, 0],
  ],
  creep: [
    ...HALL_THINGS,
    ['the pile of props', -3.1, 11.3, 0], ['powder keg', -3.3, 7.6, 0], ['basket of ore', 0.3, 7.7, 0], ['the spilled kibble', -0.3, 11.2, 0],
    ['the cart on its side', 5.9, 11.0, 0], ['offering jar', 6.3, 7.8, 0], ['skulls given to him', 3.4, 11.4, 0],
    ['the winding drum', -1.2, 2.3, 0], ['skulls given to him', 0.3, 2.2, 0], ["a miner's bones", -3.2, 2.6, 0],
    ['the skull standard', 2.6, 3.0, 0], ['the skull standard', 6.5, 3.0, 0], ['the effigy', 2.7, 5.2, 0], ['box of candles', 6.3, 4.5, 0],
  ],
  pit: [
    ...HALL_THINGS,
    ['the pile of props', -3.1, 11.3, 0], ['powder keg', -3.3, 7.6, 0], ['the spilled kibble', -0.3, 11.2, 0], ['basket of ore', 0.3, 7.7, 0],
    ['the cart on its side', 5.9, 11.0, 0], ['a dropped lantern', 3.4, 11.5, 0], ['basket of ore', 6.3, 7.7, 0],
    ['the winding drum', -2.6, 1.9, 0], ['the sump pump', 0.2, 2.4, 0], ["a miner's bones", -3.4, 3.4, 0],
    ['the skull standard', 2.6, 3.0, 0], ['the skull standard', 6.5, 3.0, 0], ['the effigy', 2.7, 5.2, 0], ['offering jar', 6.4, 5.4, 0],
  ],
};
const ON_WALLS: Record<Look, OnWall[]> = {
  threshold: [
    ['rope and pulley', -2.5, 1, true], ['the hung kibble', -0.5, 1, true], ["a miner's candle", 3.5, -4, false],
    ["the cult's banner", 1.5, -10, true], ["the cult's banner", 7.5, -10, true], ['the candle ledge', -6.5, -1, false], ['the candle ledge', -2.5, -1, false],
  ],
  creep: [
    ['rope and pulley', -2.5, 1, true], ['the daubed mark', -0.5, 1, true], ["a miner's candle", 3.5, -4, false], ["a cultist's robe", 5.5, -4, false],
    ["the cult's banner", 1.5, -10, true], ["the cult's banner", 7.5, -10, true], ['the candle ledge', -6.5, -1, false], ['bones on cords', -2.5, -1, false],
  ],
  pit: [
    ["a miner's candle", 3.5, -4, false], ['the hung kibble', 5.5, -4, false],
    ["the cult's banner", 1.5, -10, true], ["the cult's banner", 7.5, -10, true],
  ],
};
const TILES: Record<Look, Tile[]> = {
  threshold: [['the plank walk', -1, 5, 0], ['spoil', -3, 1, 0], ['spoil', 0, 11, 0], ["the cult's slab", 4, 4, 0], ["the cult's ring", 4, -5, 0]],
  creep: [['the plank walk', -1, 5, 0], ['spoil', 0, 11, 0], ["the cult's ring", -2, 3, 0], ["the cult's slab", 4, 4, 0], ["the cult's ring", 4, -5, 0]],
  pit: [['spoil', -3, 3, 0], ['spoil', 0, 11, 0], ["the cult's slab", 4, 4, 0], ["the cult's ring", 4, -5, 0]],
};

/** Every picture of the place for a look, with the knight at `heroAt`: the whole picture, W x H. */
function scene(look: Look, heroAt: [number, number]): HTMLCanvasElement {
  const P = PALS[look];
  const L = lightsOf(look, heroAt);
  const D = new Deep(W, H, P.beyond);
  const toneAt = (x: number, y: number, z: number) => {
    const [w, k, p] = bands(x, y, z + 16, L);
    const t = templeK(look, x, y);
    return (c: string): string => (SHINES.has(c) ? c : litBy(P, graded(c, look, t), w - 1, k - 1, p - 1));
  };

  // ---- THE PIT (C), THE FLOOR, the pieces laid flat on it, the stones; the walls; what is built
  paintPit(D, look, L);
  paintFloors(D, look, L);
  for (const [n, tx, ty, f] of TILES[look]) {
    const s = piece(n).frames![f];
    blit(D, { s, x: tx, y: ty, z: 0, d: tx + ty, tone: toneAt(tx + 0.5, ty + 0.5, 0), flat: true });
  }
  paintChips(D, look, L);
  // THE CAVE'S MOUTH where he comes in from floor 4 (art/cave4.ts lairMouth, its shape and anchor): cut through the landing's
  // left wall, the cave seen through it (its throat climbing away), a rim of the mine's rock round it, earth fallen before it
  const mouth = lairMouth(false);
  const mouthY = (MOUTH_AT.y0 + MOUTH_AT.y1) / 2;
  const under: Blit = { s: mouth.under, x: MOUTH_AT.x, y: mouthY, z: 0, d: MOUTH_AT.x + mouthY - 0.4, tone: toneAt(MOUTH_AT.x - 0.5, mouthY, 20) };
  const hole = ((): ((px: number, py: number) => boolean) => {
    const { X, Y, k } = placeOf(under);
    const im = pixOf(under.s);
    return (px, py) => {
      const i = Math.floor((px - X) / k);
      const j = Math.floor((py - Y) / k);
      if (i < 0 || j < 0 || i >= im.width || j >= im.height) return false;
      // (a pixel's grace round it, so that no sliver of the wall is left standing in it)
      for (const [di, dj] of [[0, 0], [1, 0], [-1, 0], [0, 1]]) {
        const ii = i + di;
        const jj = j + dj;
        if (ii >= 0 && jj >= 0 && ii < im.width && jj < im.height && im.data[(jj * im.width + ii) * 4 + 3] >= 128) return true;
      }
      return false;
    };
  })();
  blit(D, under);
  paintWalls(D, look, L, hole);
  paintMouthRim(D, look, L);
  paintParapets(D, look, L);
  paintGate(D, look, L);
  paintSets(D, look, L);
  paintStop(D, look, L);
  paintLanterns(D, look);
  paintCandles(D, look);
  BRAZIERS[look].forEach(([x, y], i) => brazier(D, look, x, y, i));

  // ---- WHAT STANDS, each at its depth
  const blits: Blit[] = [];
  for (const [n, along, face, ax] of ON_WALLS[look]) {
    const p = piece(n);
    const s = (ax ? p.left! : p.right!)[0];
    const [x, y] = ax ? [along, face] : [face, along];
    blits.push({ s, x, y, z: 0, d: x + y + 0.6, tone: toneAt(x, y, 40) });
  }
  for (const [n, x, y, f] of THINGS[look]) {
    const p = piece(n);
    blits.push({ s: p.frames![f], x, y, z: 0, d: x + y, tone: toneAt(x, y, 0), shadow: p.shadow ?? 0 });
  }
  // THE FLESHMANCER, in his hall, as the game has him; THE KNIGHT
  blits.push({ s: boss.front.idle[0], x: BOSS_AT[0], y: BOSS_AT[1], z: 0, d: BOSS_AT[0] + BOSS_AT[1], shadow: 0.5 });
  blits.push({ s: hero.front.idle[0], x: heroAt[0], y: heroAt[1], z: 0, d: heroAt[0] + heroAt[1], shadow: 0.36 });
  blits.sort((a, b) => a.d - b.d);
  for (const b of blits) {
    shadowUnder(D, b);
    blit(D, b);
  }

  // ---- THE WALLS TOWARD THE EYE, cut low as the game leaves them
  LOWS.forEach((r, i) => lowWall(D, look, L, r, 451 + i));

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

function phoneOf(look: Look): HTMLCanvasElement {
  const at = HERO_PHONE[look];
  const src = scene(look, at);
  const [hx, hy] = atPx(at[0], at[1]);
  const cv = document.createElement('canvas');
  cv.width = PHONE.W;
  cv.height = PHONE.H;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = PALS[look].beyond;
  g.fillRect(0, 0, cv.width, cv.height);
  g.drawImage(src, Math.round(PHONE.W / 2 - hx), Math.round(PHONE.H / 2 - (hy - PHONE.lift)));
  return cv;
}
/** The gate close, the knight before it: a crop of the picture, twice as big. */
export const GATE_CROP = { x: 548, y: 206, w: 200, h: 304 };
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
  blocks.push(text("Floor 5: you start in the mine, and it becomes the Fleshmancer's temple. Three looks.", 22, true));
  blocks.push(text("From the cave out of floor 4 (left), through tight rooms, two ways round, to his gate and his hall (right).", 18, false, '#b8ab98'));
  for (const look of LOOKS) {
    blocks.push(text(CAPTION[look], 18, true));
    blocks.push(pic(scene(look, HERO_RUN)));
    blocks.push(text(`${LETTER[look].toUpperCase()} on a phone: one screen, the knight where the mine turns to temple.`, 18, false, '#b8ab98'));
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

// (drawn once the page has loaded: the sheet takes longer than a page is given to load)
const draw = (): void => {
  const out = mode === 'sheet' ? sheet() : mode === 'phone' ? phoneOf(ONE) : mode === 'gate' ? gateOf(ONE) : scene(ONE, HERO_RUN);
  out.style.display = 'block';
  document.body.style.margin = '0';
  document.body.style.background = '#000';
  document.body.appendChild(out);
  (window as unknown as { __ready: boolean; __size: [number, number] }).__size = [out.width, out.height];
  (window as unknown as { __ready: boolean }).__ready = true;
};
if (document.readyState === 'complete') setTimeout(draw, 50);
else window.addEventListener('load', () => setTimeout(draw, 50));
