// THE STILT TOWN, ONE OF THE TOWNS TO UNLOCK OR BUY: ITS WATER, ITS PLATFORMS, ITS WALKS (the queue's draw-eight-other-towns;
// his pick of which next, 14 Nov 2026: “3 The Stilt Town”). The sketch he kept (docs/mockups/endless_town, 3, floor 10, the
// Sunken Fen): “Each station on its own platform over black water, lanterns doubled in it: a town that should have sunk long
// ago.” Drawn straight to the game's standard, the stations where the sketch had them, in the fen's own colours (art/fen.ts:
// its black-green water, its peat, its sedge, its mist; nothing glows, nothing cyan or pink but what is the friend's).
// Nothing of the game imports this file: how the towns are won and laid is the main chat's.
//
// Painted as the other towns' grounds are (art/frozen_mere.ts): every picture pixel a line of sight, what it meets first found
// by its numbers (here the platforms stand up out of the water on their stilts); flat tones, light in bands; two picture pixels
// to a game pixel.
//   - THE GROUND, one picture: a low night sky; far off, the fen's dead trees grey in the mist; the black water everywhere, slow
//     lines of scum, duckweed in drifts, the mist lying over it in pale streaks; THE PLATFORMS, each a deck of planks on stilts
//     a little over the water, some leaning (it should have sunk long ago), a plank missing here and there; the WALKS between
//     them, narrower; the posts under their edges going down into the water; THE LANTERNS' LIGHT doubled in the water under
//     each; the HATCH cut in the deck for the way down, a ladder going down through it into the water.

import { bay, hx, mixc, rnd } from './endless_splash';
import type { C } from './endless_splash';

// ---------------------------------------------------------------------------------------------------------------------------
// THE PLACE, in tiles.

/** The middle of the town (the wordsmith's platform). */
export const STILT = { cx: 12, cy: 12 } as const;
/** How high the decks stand over the water (game pixels). */
export const DECK = 6;

/** A deck: from (x0, y0) to (x1, y1) in tiles; how it leans (game pixels across it, along x and along y); its planks run along x
 * or along y. */
export interface Deck { x0: number; y0: number; x1: number; y1: number; tx?: number; ty?: number; along: 'x' | 'y'; walk?: boolean }
/** THE PLATFORMS, each a station's or two; and THE WALKS between them. */
export const DECKS: readonly Deck[] = [
  // the wordsmith's, in the middle
  { x0: 9.5, y0: 9.5, x1: 15.5, y1: 15.5, along: 'x' },
  // the trophies and the Lexicon, up the screen
  { x0: 7, y0: 4.5, x1: 11.2, y1: 8, ty: 1.2, along: 'y' },
  // the record and the way down, up to the left
  { x0: 3.5, y0: 9, x1: 7, y1: 12.6, tx: -1.4, along: 'x' },
  // the stash, to the left
  { x0: 6, y0: 14, x1: 9, y1: 17, ty: 1.0, along: 'y' },
  // the smithy and the gate, up to the right
  { x0: 13, y0: 2.8, x1: 19.6, y1: 8.5, tx: 0.8, along: 'x' },
  // the seller's, to the right
  { x0: 16.5, y0: 9.4, x1: 21, y1: 13.5, ty: -1.0, along: 'y' },
  // the portal's, down the screen
  { x0: 13, y0: 16, x1: 17.2, y1: 20.2, tx: 1.2, ty: 0.6, along: 'x' },
  // the stranger's, down to the right
  { x0: 17.6, y0: 14, x1: 21, y1: 17.2, along: 'y' },
  // THE WALKS
  { x0: 9.6, y0: 8, x1: 10.5, y1: 9.5, along: 'y', walk: true },
  { x0: 7, y0: 10.3, x1: 9.5, y1: 11.2, along: 'x', walk: true },
  { x0: 9, y0: 14.5, x1: 9.5, y1: 15.3, along: 'x', walk: true },
  { x0: 13.6, y0: 8.5, x1: 14.5, y1: 9.5, along: 'y', walk: true },
  { x0: 15.5, y0: 11, x1: 16.5, y1: 11.9, along: 'x', walk: true },
  { x0: 13.6, y0: 15.5, x1: 14.5, y1: 16, along: 'y', walk: true },
  { x0: 19, y0: 13.5, x1: 19.9, y1: 14, along: 'y', walk: true },
  { x0: 11.2, y0: 6, x1: 13, y1: 6.9, along: 'x', walk: true },
];

/** THE LAYOUT (the sketch's): each station's anchor tile. */
export const STILT_LAYOUT = {
  wordsmith: [12, 12] as [number, number],
  trophies: [7.5, 5] as [number, number],
  lexicon: [9.6, 6.6] as [number, number],
  record: [4, 9.4] as [number, number],
  way: [4.6, 11.2] as [number, number],
  waypoint: [6.2, 10.0] as [number, number],
  stash: [7, 15] as [number, number],
  gate: [13.4, 3] as [number, number],
  forge: [18, 5] as [number, number],
  tentBack: [18, 9.8] as [number, number],
  portal: [15.1, 18.1] as [number, number],
  stranger: [19.4, 15.4] as [number, number],
  lanterns: [[9.8, 9.8], [15.2, 9.8], [9.8, 15.2], [7.3, 7.6], [3.8, 12.2], [18.9, 3.2], [20.6, 13.0], [13.4, 19.8], [8.6, 16.6]] as [number, number][],
};
/** The hatch in the deck for the way down: its corner, how big (tiles). */
export const STILT_HATCH = { x: 4.4, y: 11.0, w: 0.9, d: 0.9 } as const;
/** The portal's round: its middle and radius. */
export const STILT_PORTAL = { at: [STILT_LAYOUT.portal[0] + 0.5, STILT_LAYOUT.portal[1] + 0.5] as [number, number], r: 1.1 } as const;

/** The deck at tile (x, y), if any (a platform before a walk where both are). */
function deckOf(x: number, y: number): Deck | null {
  for (const d of DECKS) if (x >= d.x0 && x <= d.x1 && y >= d.y0 && y <= d.y1) return d;
  return null;
}
/** How high a deck's top is at tile (x, y) (it leans). */
function deckZ(d: Deck, x: number, y: number): number {
  const u = (x - d.x0) / (d.x1 - d.x0) - 0.5;
  const v = (y - d.y0) / (d.y1 - d.y0) - 0.5;
  return DECK + (d.tx ?? 0) * u + (d.ty ?? 0) * v;
}
/** Whether a body may stand at tile (x, y): on a deck, held off its edge, not in the hatch. */
export function onDeck(x: number, y: number, r = 0.25): boolean {
  const d = deckOf(x, y);
  if (!d) return false;
  if (x - d.x0 < r || d.x1 - x < r || y - d.y0 < r || d.y1 - y < r) {
    // (at the end of a walk, where it meets a platform, a body may pass)
    return !!(deckOf(x - r, y) && deckOf(x + r, y) && deckOf(x, y - r) && deckOf(x, y + r));
  }
  const h = STILT_HATCH;
  return !(x > h.x && x < h.x + h.w && y > h.y && y < h.y + h.d);
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE COLOURS: the fen's (art/fen.ts), and the town's wood.

const SKY = ['#04060a', '#070a0e', '#0a0e12', '#0e1418'].map(hx);
/** The fen's water: near black, murky green, the light on it (art/fen.ts C_FEN). */
const FEN = ['#0c1210', '#101814', '#16211b', '#1c2a22', '#23332a', '#2b3d32', '#36493c'].map(hx);
const WEED = ['#1e2716', '#28331c', '#344224', '#42532c'].map(hx);
const MIST = ['#3c4642', '#4a5450', '#5a6460'].map(hx);
/** The planks: grey-brown, old, wet (shade to lit). */
const PLANK = ['#120e0a', '#1e1812', '#2a221a', '#3a3024', '#4a3e2e', '#5c4e3a'].map(hx);
/** The moss on them. */
const MOSS = ['#222b1b', '#2e3a22', '#3c4b2b'].map(hx);
const TREE = ['#141a18', '#1a2220', '#222c28'].map(hx);
const EMBER = ['#8a2a14', '#d0501a', '#ff8a2a', '#ffc860'].map(hx);

function vn(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const s = (t: number): number => t * t * (3 - 2 * t);
  const a = rnd(xi, yi, seed);
  const b = rnd(xi + 1, yi, seed);
  const c = rnd(xi, yi + 1, seed);
  const d = rnd(xi + 1, yi + 1, seed);
  return a + (b - a) * s(fx) + (c - a) * s(fy) + (a - b - c + d) * s(fx) * s(fy);
}
function band(r: readonly C[], k: number, px: number, py: number, dither = 0.22): C {
  const v = Math.max(0, Math.min(1, k)) * (r.length - 1);
  const i = Math.floor(v);
  const th = 0.5 + (bay(px, py) - 0.5) * dither;
  return r[Math.min(r.length - 1, i + (v - i > th ? 1 : 0))];
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE GROUND'S PICTURE

export const STILT_GROUND = { gx: -420, gy: -120, w: 840, h: 500 } as const;
const MID_Y = (STILT.cx + STILT.cy) * 8;
export const STILT_HORIZON = 30;
const tileAt = (gx: number, gy: number): [number, number] => {
  const U = gx / 16;
  const S0 = (gy - MID_Y) / 8;
  return [STILT.cx + (S0 + U) / 2, STILT.cy + (S0 - U) / 2];
};
const screenOf = (x: number, y: number, z = 0): [number, number] => [(x - y) * 16, (x + y) * 8 - z];

/** The posts under the decks: at their corners and every tile or so along their edges (tiles). */
const POSTS: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (const d of DECKS) {
    const nx = Math.max(1, Math.round((d.x1 - d.x0) / (d.walk ? 1.6 : 1.3)));
    const ny = Math.max(1, Math.round((d.y1 - d.y0) / (d.walk ? 1.6 : 1.3)));
    for (let i = 0; i <= nx; i++) for (const y of [d.y0 + 0.08, d.y1 - 0.08]) out.push([d.x0 + 0.08 + (i / nx) * (d.x1 - d.x0 - 0.16), y]);
    for (let j = 1; j < ny; j++) for (const x of [d.x0 + 0.08, d.x1 - 0.08]) out.push([x, d.y0 + 0.08 + (j / ny) * (d.y1 - d.y0 - 0.16)]);
  }
  return out;
})();
/** A post at tile (x, y)? (a square stake a tenth of a tile across) */
function postAt(x: number, y: number): boolean {
  for (const [px, py] of POSTS) if (Math.abs(x - px) < 0.06 && Math.abs(y - py) < 0.06) return true;
  return false;
}

/** The lanterns' light doubled in the water: how much falls at game pixel (gx, gy) of the water, and its colour. */
function reflectAt(gx: number, gy: number): number {
  let best = 0;
  for (const [lx, ly] of STILT_LAYOUT.lanterns) {
    // (the flame stands about 26 game pixels over its deck; its image as far under the water)
    const [sx0, sy] = screenOf(lx, ly, 0);
    // (the lantern hangs off its pole's arm, a little to the right)
    const sx = sx0 + 6;
    const top = sy + 4;
    const bottom = sy + DECK + 40;
    if (gy < top || gy > bottom) continue;
    const t = (gy - top) / (bottom - top);
    const w = 3 + 3 * t;
    const dx = Math.abs(gx - sx + Math.sin(gy * 0.9) * 1.5);
    if (dx > w) continue;
    const e = (1 - t) * (1 - dx / w) * (Math.floor(gy) % 2 === 0 ? 1 : 0.35);
    best = Math.max(best, e);
  }
  return best;
}

/** The water at game pixel (gx, gy) (tile (x, y) at the water): near black, scum and duckweed, the mist in streaks, the lanterns'
 * light doubled. */
function waterAt(gx: number, gy: number, x: number, y: number, px: number, py: number, shade: number): C {
  const back = Math.max(0, 1 - (gy - STILT_HORIZON) / 280);
  let c = band(FEN, 0.18 + 0.3 * back + 0.06 * vn(x * 0.7, y * 0.7, 201) - shade, px, py);
  // (duckweed in drifts, thickest by the decks)
  const near = deckOf(x - 0.4, y) || deckOf(x + 0.4, y) || deckOf(x, y - 0.4) || deckOf(x, y + 0.4);
  const weed = vn(x * 1.6, y * 1.6, 202) + (near ? 0.12 : 0);
  if (weed > 0.86 && rnd(px >> 1, py >> 1, 203) > 0.45) c = WEED[weed > 0.95 ? 1 : 0];
  // (slow lines of scum)
  else if (Math.abs(vn(x * 0.5 + 3, y * 2.2, 204) - 0.5) < 0.012) c = FEN[4];
  // (the lanterns' light in it, broken by the water)
  const r = reflectAt(gx, gy);
  if (r > 0.12) c = mixc(c, r > 0.6 ? EMBER[3] : r > 0.35 ? EMBER[2] : EMBER[1], Math.min(0.85, r * 1.1));
  // (the mist, lying over it in pale streaks)
  const mist = vn(gx / 70, gy / 5, 205) + 0.3 * vn(gx / 20, gy / 2.5, 206);
  if (mist > 1.0) c = mixc(c, MIST[0], 0.14 + 0.14 * back + (mist > 1.1 ? 0.08 : 0));
  return c;
}

/** A deck's top at tile (x, y): planks along it, a dark seam between, their ends staggered; moss; a plank gone here and there. */
function deckTop(d: Deck, x: number, y: number, px: number, py: number, lean: number): C | 'gap' {
  const a = d.along === 'x' ? x : y;
  const b = d.along === 'x' ? y : x;
  const plank = Math.floor(b * 4.5);
  const fb = b * 4.5 - plank;
  const len = 1.6 + rnd(plank, 0, 211) * 1.6;
  const end = Math.floor((a + rnd(plank, 1, 212) * 3) / len);
  const fa = (a + rnd(plank, 1, 212) * 3) / len - end;
  // (a plank gone, the water under it; never on a walk, never where a station stands)
  if (!d.walk && rnd(plank, end, 213) > 0.965) return 'gap';
  if (fb < 0.14) return PLANK[0];
  if (fa < 0.03) return PLANK[1];
  const moss = vn(x * 3, y * 3, 214) > 0.74;
  if (moss) return MOSS[vn(x * 9, y * 9, 215) > 0.6 ? 2 : 1];
  const k = 0.55 + 0.18 * (rnd(plank, end, 216) - 0.5) + lean + (fb > 0.82 ? 0.12 : 0);
  return band(PLANK, k, px, py, 0);
}

/** The far fen: dead trees grey in the mist on the horizon. Null: none here. */
function farAt(gx: number, gy: number): C | null {
  const col = Math.floor(gx / 5);
  const tall = rnd(col, 0, 221) > 0.55 ? 6 + rnd(col, 1, 222) * 22 * vn(gx / 60, 0, 223) : 0;
  const trunkX = col * 5 + 2 + Math.floor(rnd(col, 2, 224) * 2);
  if (tall > 0 && Math.abs(gx - trunkX) < (gy > STILT_HORIZON - tall * 0.4 ? 1 : 0.6) && gy > STILT_HORIZON - tall) return TREE[1];
  // (a bare branch or two)
  if (tall > 8) {
    const by = STILT_HORIZON - tall * 0.7;
    if (Math.abs(gy - (by - (gx - trunkX) * 0.6)) < 0.6 && gx > trunkX && gx < trunkX + 5) return TREE[1];
  }
  const bank = 3 + 2 * vn(gx / 30, 3, 225);
  if (gy > STILT_HORIZON - bank) return TREE[0];
  return null;
}

/** What the eye meets first at picture pixel (px, py) of the ground's picture. Numbers only. */
export function stiltGroundAt(px: number, py: number): C {
  const gx = STILT_GROUND.gx + (px + 0.5) / 2;
  const gy = STILT_GROUND.gy + (py + 0.5) / 2;
  if (gy < STILT_HORIZON) {
    const f = farAt(gx, gy);
    if (f !== null) return mixc(f, MIST[0], 0.25);
    const up = Math.max(0, Math.min(1, (STILT_HORIZON - gy) / 120));
    let c = band(SKY, 1 - up, px, py, 0.95);
    // (a band of mist at the horizon)
    if (STILT_HORIZON - gy < 14 && vn(gx / 40, gy / 3, 226) > 0.55) c = mixc(c, MIST[0], 0.35);
    if (rnd(Math.floor(gx), Math.floor(gy), 227) > 0.998 && up > 0.3) c = hx('#7a8090');
    return c;
  }
  // (THE LINE OF SIGHT: down from over the decks to the water)
  for (let z = DECK + 2; z >= 0; z -= 0.5) {
    const [x, y] = tileAt(gx, gy + z);
    const d = deckOf(x, y);
    if (d) {
      const top = deckZ(d, x, y);
      if (z <= top && z > top - 0.5) {
        const h = STILT_HATCH;
        if (x > h.x && x < h.x + h.w && y > h.y && y < h.y + h.d) {
          // THE HATCH: its frame, and the dark through it, a ladder's rungs going down
          if (x < h.x + 0.08 || x > h.x + h.w - 0.08 || y < h.y + 0.08 || y > h.y + h.d - 0.08) return PLANK[4];
          const rung = Math.floor((x - h.x) * 12) % 3 === 0 && Math.abs(y - (h.y + h.d * 0.5)) < 0.3;
          return rung ? PLANK[2] : FEN[0];
        }
        const t = deckTop(d, x, y, px, py, ((d.tx ?? 0) + (d.ty ?? 0)) * -0.02);
        if (t === 'gap') {
          const [wx, wy] = tileAt(gx, gy);
          return waterAt(gx, gy, wx, wy, px, py, 0.08);
        }
        return t;
      }
      // (THE DECK'S EDGE: the face of its outer planks, seen from before it)
      if (z < top - 0.5 && z >= top - 2.2) {
        const front = !deckOf(x + 0.05, y) || !deckOf(x, y + 0.05);
        if (front) return band(PLANK, !deckOf(x, y + 0.05) ? 0.62 : 0.32, px, py, 0);
      }
    }
    // THE POSTS, going down into the water under the decks' edges
    if (z < DECK - 1 && postAt(x, y)) return band(PLANK, 0.25 + 0.15 * (z / DECK), px, py, 0);
  }
  const [x, y] = tileAt(gx, gy);
  // (in the decks' shadow, the water darker)
  const under = deckOf(x - 0.25, y - 0.25) ? 0.12 : 0;
  // (the posts' doubles in the water, wavering)
  for (let z = 1; z < DECK; z += 1) {
    const [rx, ry] = tileAt(gx + Math.sin(gy * 1.3) * 0.6, gy - z);
    if (postAt(rx, ry)) return band(PLANK, 0.12, px, py, 0);
  }
  return waterAt(gx, gy, x, y, px, py, under);
}

export interface StiltGround {
  canvas: HTMLCanvasElement;
  gx: number;
  gy: number;
  ms: number;
}
export function paintStiltGround(): StiltGround {
  const t0 = performance.now();
  const W = STILT_GROUND.w * 2;
  const H = STILT_GROUND.h * 2;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d') as CanvasRenderingContext2D;
  const im = g.createImageData(W, H);
  for (let py = 0; py < H; py++)
    for (let px = 0; px < W; px++) {
      const c = stiltGroundAt(px, py);
      const o = (py * W + px) * 4;
      im.data[o] = (c >> 16) & 255;
      im.data[o + 1] = (c >> 8) & 255;
      im.data[o + 2] = c & 255;
      im.data[o + 3] = 255;
    }
  g.putImageData(im, 0, 0);
  return { canvas, gx: STILT_GROUND.gx, gy: STILT_GROUND.gy, ms: performance.now() - t0 };
}
/** Where a station on a deck stands (game pixels over the water): the deck's height there, or 0 over the water. */
export function standZ(x: number, y: number): number {
  const d = deckOf(x, y);
  return d ? deckZ(d, x, y) : 0;
}
