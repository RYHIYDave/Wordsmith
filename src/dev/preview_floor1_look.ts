// Dev page: FLOOR 1, THE KING'S TOMB WITH DAYLIGHT (dev/floor1_look_paint.ts), three looks for the owner to pick from.
// Nothing of the game imports it.
//   node tools/preview.mjs src/dev/preview_floor1_look.ts docs/mockups/floor1_look/pictures/a_morning_light.png 1200 840 "overview:morning"
//   node tools/preview.mjs src/dev/preview_floor1_look.ts docs/mockups/floor1_look/pictures/a_phone.png 1014 468 "phone:morning"
//   PREVIEW_TIMEOUT=400000 node tools/preview.mjs src/dev/preview_floor1_look.ts docs/mockups/floor1_look/pictures/floor1_look_sheet.png 1200 5100 "sheet"
//     overview  the stairs down from the town to the gate and his hall, the knight in a shaft of light in the effigy hall
//     phone     one phone screen as the game would show it, the camera on the knight in the shaft
//     gate      the gate close, the knight before it, twice as big
//     sheet     the three looks and their phone screens, labelled, and the gate close beside the knight in each
//   look: morning (A), roots (B) or noon (C)
import { drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import { WINE, wardenPieces } from '../art/floor1';
import type { Piece } from '../art/floorkit';
import { SHINES } from '../art/floorkit';
import { CRYPT_FLOORS, OLD_IRON, OLD_RUST, TIMBER } from '../art/crypt';
import { GOLD, stoneOf } from '../art/props';
import { makeHeroArt3 } from '../art/heroes3';
import { makeWardenArt } from '../art/monster_warden';
import {
  BOSS_AT, CAPTION, CHESTS, CRESSETS, Deep, HERO_GATE, HERO_PHONE, HERO_RUN, LETTER, LOOKS, LOWS, PALS, PHONE, PICTURE,
  WALLS, atPx, bands, bayOf, lightsOf, litBy, lowWall, mixC, paintBeams, paintChest, paintChips, paintDrips, paintFloors,
  paintGate, paintStairs, paintWalls,
} from './floor1_look_paint';
import type { Look, R5 } from './floor1_look_paint';

const [mode = 'overview', lookArg = 'morning'] = decodeURIComponent(location.hash.slice(1)).split(':');
const ONE: Look = (LOOKS as string[]).includes(lookArg) ? (lookArg as Look) : 'morning';
const { W, H } = PICTURE;

// ---- the floor's own pieces (art/floor1.ts, his yes), their colours brought into each look's stone, iron, wood, cloth
const pieces = wardenPieces();
const piece = (n: string): Piece => {
  const p = pieces.find((q) => q.name === n);
  if (!p) throw new Error(`no piece named ${n}`);
  return p;
};
type Fam = 'stone' | 'iron' | 'wood' | 'wine' | 'bone' | 'brass';
const TH = CRYPT_FLOORS[0];
const KNOWN: [Fam, readonly string[]][] = [
  ['stone', [...TH.slab, ...TH.cap, ...TH.capLow, ...TH.lit, ...TH.shade, TH.mortar, ...stoneOf(TH), '#1a162e', '#363052', '#544c7a', '#6e6696', '#2c2840', '#3e3a54', '#575270']],
  ['iron', [...OLD_IRON, ...OLD_RUST, '#1c1a3a', '#4c4884', '#8480bc', '#a8a4dc', '#9a96c8']],
  ['wood', [...TIMBER]],
  ['wine', [...WINE]],
  ['bone', ['#26203e', '#6a6294', '#a29ac6', '#c2bae2', '#1e1a34', '#3e3862', '#5a5484', '#3a3252', '#867ea4', '#b8b0d2', '#d4cce8']],
  ['brass', [...GOLD]],
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
/** A colour of the floor's own, brought into a look: its family (stone, iron, wood, the Warden's wine, bone, gold) by the nearest of its own, and its place in that family's light. */
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
  const ramp: R5 = best === 'stone' ? P.stone : best === 'iron' ? P.iron : best === 'wood' ? P.wood : best === 'wine' ? P.wine : best === 'bone' ? P.bone : P.brass;
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
  flat?: boolean;
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
  D.figure = false;
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
      const a = 0.62 * (r < 0.4 ? 1 - 0.15 * (r / 0.4) : 0.85 * (1 - (r - 0.4) / 0.6));
      const o = D.get(x, y);
      if (!o || SHINES.has(o)) continue;
      D.over(x, y, mixC(o, '#000000', a));
    }
  }
}

const hero = makeHeroArt3().of('warrior', { twoHanded: false });
const warden = makeWardenArt();

// ---- WHERE THE FLOOR'S OWN PIECES STAND, look by look
type Thing = [name: string, x: number, y: number, frame: number];
type OnWall = [name: string, along: number, face: number, alongX: boolean];
type Tile = [name: string, tx: number, ty: number, frame: number];

/** In his hall, every look: the king's throne between two cressets, horned knights, the Warden's racks; its middle open. */
const HALL_THINGS: Thing[] = [
  ["the king's throne", 4.5, -9.3, 0], ['cresset', CRESSETS[0][0], CRESSETS[0][1], 0], ['cresset', CRESSETS[1][0], CRESSETS[1][1], 2],
  ['horned knight', 0.1, -5.4, 0], ['horned knight', 8.75, -5.4, 0], ['rack of mauls', 8.4, -1.0, 0], ["the king's coffer", 0.3, -1.1, 0],
  ['chain', 6.6, -3.2, 0], ['dropped keys', 2.6, -2.4, 0],
];
const THINGS: Record<Look, Thing[]> = {
  morning: [
    ...HALL_THINGS,
    // the stair hall
    ['sarcophagus', 0.2, 7.7, 0], ['candles', -3.3, 7.4, 1], ['funeral urn', 0.5, 11.5, 0], ['fallen banner', -1.0, 11.4, 0],
    // the effigy hall
    ['funeral urn', 2.4, 7.4, 0], ['squat urn', 6.6, 7.5, 0], ['candles', 3.4, 11.5, 2], ["the statue's head", 5.6, 11.6, 0],
    // the king's court
    ['horned knight', -3.6, 1.4, 0], ['skull jar', 0.5, 1.5, 0], ['bone box', -3.4, 5.6, 0],
    // the antechamber
    ['horned knight', 2.4, 3.1, 0], ['rack of mauls', 6.5, 5.4, 0], ['open sarcophagus', 2.6, 4.4, 0],
  ],
  roots: [
    ...HALL_THINGS,
    ['open sarcophagus', 0.2, 7.7, 0], ['funeral urn', 0.5, 11.5, 0], ['fallen banner', -1.0, 11.4, 0],
    ['squat urn', 2.4, 7.4, 0], ['skull jar', 6.6, 7.5, 0], ["the statue's head", 5.6, 11.6, 0],
    ['horned knight', -3.6, 1.4, 0], ['bone box', -3.4, 5.6, 0], ['candles', 0.4, 1.5, 3],
    ['horned knight', 2.4, 3.1, 0], ['sarcophagus', 2.6, 4.4, 0], ['funeral urn', 6.5, 5.5, 0],
  ],
  noon: [
    ...HALL_THINGS,
    ['sarcophagus', 0.2, 7.7, 0], ['funeral urn', 0.5, 11.5, 0], ['candles', -3.3, 7.4, 0],
    ['funeral urn', 2.4, 7.4, 0], ['funeral urn', 6.6, 7.5, 0], ['chain', 5.6, 11.5, 0],
    ['horned knight', -3.6, 1.4, 0], ['horned knight', 0.4, 1.4, 0], ['skull jar', -3.4, 5.6, 0],
    ['horned knight', 2.4, 3.1, 0], ['rack of mauls', 6.5, 5.4, 0], ['open sarcophagus', 2.6, 4.4, 0],
  ],
};
/** The floor's wall pieces: tried at these places, set only where the wall's bay is bare. */
const ON_WALLS: OnWall[] = [
  ['keys on a hook', 0.5, -10, true], ['shackles', 2.5, -10, true], ['horned helm on a peg', 6.5, -10, true], ['shield', 8.5, -10, true],
  ['shackles', -8.5, -1, false], ['keys on a hook', -2.5, -1, false], ['horned helm on a peg', -6.5, -1, false],
  ['shield', -2.5, 1, true], ['crossed mauls', 5.5, 1, true], ['keys on a hook', 2.5, -4, false], ['shackles', 10.5, -4, false],
  ['horned helm on a peg', 3.5, 2, false], ['shield', 6.5, 2, false], ['crossed mauls', -1.5, 7, true],
];
/** The floor's tiles laid in it: the king's runner from his gate to his throne; ledger stones, the crown in the floor. */
const RUNNER: Tile[] = [-1, -2, -3, -4, -5, -6, -7, -8].map((ty, i): Tile => ["the king's runner", 4, ty, 3 + (i % 2)]);
const TILES: Record<Look, Tile[]> = {
  morning: [...RUNNER, ['ledger stone', 0, 9, 0], ['the crown in the floor', 4, 3, 0], ['grave slab and ring', 5, 4, 0], ['ledger stone', -2, 5, 0]],
  roots: [...RUNNER, ['sunken grave slab', 0, 9, 0], ['the crown in the floor', 4, 3, 0], ['drain', 5, 4, 0], ['ledger stone', -2, 5, 0]],
  noon: [...RUNNER, ['ledger stone', 0, 9, 0], ['the crown in the floor', 4, 3, 0], ['grave slab and ring', 5, 4, 0], ['ledger stone', -2, 5, 0]],
};

/** Is the bay of a wall at this place bare (no banner, tomb, cell or crown carved in it)? */
function bareAt(look: Look, alongX: boolean, face: number, along: number): number | null {
  const w = WALLS.find((q) => q.alongX === alongX && q.at === face && along > q.a && along < q.b);
  if (!w) return null;
  return bayOf(look, w.seed, Math.floor((along * 32) / 64)) === 'plain' ? w.seed : null;
}

/** Every picture of the place for a look, with the knight at `heroAt`: the whole picture, W x H. */
function scene(look: Look, heroAt: [number, number]): HTMLCanvasElement {
  const P = PALS[look];
  const L = lightsOf(look, heroAt);
  const D = new Deep(W, H, P.beyond);
  const toneAt = (x: number, y: number, z: number) => {
    const [s, w, p] = bands(x, y, z + 16, L);
    return (c: string): string => (SHINES.has(c) ? c : litBy(P, graded(c, look), s, w - 1, p - 1));
  };

  // ---- THE FLOOR, the pieces laid flat on it, the dust; the stairs up; the walls; the gate
  paintFloors(D, look, L);
  for (const [n, tx, ty, f] of TILES[look]) {
    const s = piece(n).frames![f];
    blit(D, { s, x: tx, y: ty, z: 0, d: tx + ty, tone: toneAt(tx + 0.5, ty + 0.5, -16), flat: true });
  }
  paintChips(D, look, L);
  paintWalls(D, look, L);
  paintStairs(D, look, L);
  paintGate(D, look, L);
  for (const c of CHESTS[look]) paintChest(D, look, L, c);

  // ---- WHAT STANDS, each at its depth
  const blits: Blit[] = [];
  for (const [n, along, face, ax] of ON_WALLS) {
    if (bareAt(look, ax, face, along) === null) continue;
    const p = piece(n);
    const s = (ax ? p.left! : p.right!)[0];
    const [x, y] = ax ? [along, face] : [face, along];
    blits.push({ s, x, y, z: 0, d: x + y + 0.6, tone: toneAt(x, y, 40) });
  }
  for (const [n, x, y, f] of THINGS[look]) {
    const p = piece(n);
    blits.push({ s: p.frames![f], x, y, z: 0, d: x + y, tone: toneAt(x, y, 0), shadow: p.shadow ?? 0 });
  }
  // THE WARDEN, in his hall, as the game has him; THE KNIGHT
  blits.push({ s: warden.front.idle[0], x: BOSS_AT[0], y: BOSS_AT[1], z: 0, d: BOSS_AT[0] + BOSS_AT[1], shadow: 0.62, figure: true });
  blits.push({ s: hero.front.idle[0], x: heroAt[0], y: heroAt[1], z: 0, d: heroAt[0] + heroAt[1], shadow: 0.36, figure: true });
  blits.sort((a, b) => a.d - b.d);
  for (const b of blits) {
    shadowUnder(D, b);
    blit(D, b);
  }

  // ---- THE WALLS TOWARD THE EYE, cut low as the game leaves them
  LOWS.forEach((r, i) => lowWall(D, look, L, r, 451 + i));
  // ---- THE DAYLIGHT IN THE AIR of each shaft; B's drips
  paintBeams(D, look, L);
  paintDrips(D, look);

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
export const GATE_CROP = { x: 548, y: 196, w: 200, h: 314 };
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
  blocks.push(text("Floor 1: the king's tomb under the town, with daylight, and the Warden's iron. Three looks.", 22, true));
  blocks.push(text("Down the town's stairs (left), through tight rooms, two ways round, to the Warden's gate and his hall (right).", 18, false, '#b8ab98'));
  for (const look of LOOKS) {
    blocks.push(text(CAPTION[look], 18, true));
    blocks.push(pic(scene(look, HERO_RUN)));
    blocks.push(text(`${LETTER[look].toUpperCase()} on a phone: one screen, the knight in a shaft of light among the tombs.`, 18, false, '#b8ab98'));
    blocks.push(pic(phoneOf(look), 26));
  }
  blocks.push(text("The Warden's gate, close, the knight before it (A, B, C), twice as big.", 21, true));
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
