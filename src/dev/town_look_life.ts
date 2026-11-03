// THE TOWN'S NEW LOOK, WHAT LIVES IN IT (the art chat, 2 Nov 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// THE OWL IN THE RAFTERS (his words, 2 Nov 2026, 15:37: “An owl in the rafters.”): a barn owl, an original drawing at the
// heroes' grain (a picture pixel each): a pale heart-shaped face with dark eyes, a buff and grey back and wings, a white
// breast flecked, feathered legs and dark talons gripping the beam. Alive: it breathes (its breast rising and falling), it
// blinks (the lids down over the eyes, slowly), it turns its head (the face swinging round to one side, the far eye going
// out of sight, then back), and now and then it ruffles (its feathers lifted all over, then smoothed).
//
// THE TREE (B: an old tree leaning in through the fallen roof; A and C: its boughs over the gable): trunk and boughs of
// bark lit on their upper left, leaves in two-pixel clusters, lit and dappled.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { hash } from '../art/kit';
import { Deep, fbm, mixC, noise } from './floor1_look_paint';
import { PALS, atPx } from './town_look_paint';
import type { Look } from './town_look_paint';

// =================================================================================================
// THE OWL

/** Its moment: how far its lids are down (0 open, 1 shut), its head turned (-1..1; past 0.85 either way, turned right round, its back to us), its feathers ruffled (0..1), its breath (-1 out .. 1 in). */
export interface OwlPose { blink: number; turn: number; ruffle: number; breath: number }
/**
 * THE OWL, SECOND PASS (the castle hall): a real barn owl's shape at the game's size, a picture pixel each, 36 x 42, its
 * anchor on the beam's top between its feet. A round head, flat-topped, no neck; in it the HEART-SHAPED PALE FACE (a white
 * disc in a thin ochre ruff, notched at the top, pointed at the chin, a soft ridge down its middle to the little pale beak)
 * with the DARK EYES set in it, a brown smudge before each; the crown golden-buff washed with grey, peppered with white dots.
 * The breast white, a few dark specks, buff at its shoulders; THE WINGS FOLDED soft along its sides, golden-buff and grey in
 * rows of feathers, white-dotted, their long tips barred and reaching down past the belly either side; the legs long and
 * feathered white, a little knock-kneed; THE FEET GRIPPING THE BEAM, three toes each over its top, the dark talons curled
 * over its edge. Lit from the upper left, an outline round it.
 */
export const OWL = { w: 36, h: 42, ax: 18, ay: 38 };
const O = {
  disc: ['#d4c8b2', '#ece3d2', '#faf5ea'],
  ruff: ['#5e3a1a', '#875826', '#a8783a'],
  ridge: '#e2d0b0',
  smudge: '#b49470',
  buff: ['#5e3c1c', '#86592a', '#ae7a3a', '#cc9a50', '#e0b468'],
  grey: ['#6a6660', '#8e8a82', '#aaa59a'],
  breast: ['#c6b9a2', '#ddd2bf', '#efe8da', '#fbf8f0'],
  speck: '#4a3524',
  dot: '#f6efe2',
  eye: '#0d0805',
  eyeHi: '#54443a',
  lid: '#7a5a3c',
  beak: ['#9c8a68', '#c8b68e', '#e6dabb'],
  toe: ['#3e3832', '#5e5650', '#7c746a'],
  talon: '#120d0a',
  ink: '#22160c',
};

type OwlPart = 'head' | 'breast' | 'wing' | 'tip' | 'leg' | 'foot';
/** One moment of the owl, painted (picture pixels; its anchor between its feet, on the beam). */
export function paintOwl(p: OwlPose): Sprite {
  const W = OWL.w;
  const H = OWL.h;
  const px = new Px(W, H);
  const cx = W / 2;
  const fl = p.ruffle * 1.5;
  const br = p.breath;
  const rag = (x: number, y: number, k: number): number => (p.ruffle > 0 ? (hash(Math.floor(x), Math.floor(y / 2), k) - 0.5) * 0.22 * p.ruffle : 0);
  // THE HEAD: round, a little flat on top, as wide as the shoulders
  const hx = cx + p.turn * 0.4;
  const hy = 9.6 - fl * 0.5 - br * 0.15;
  const rx = 8.7 + fl * 0.8;
  const ry = 7.6 + fl * 0.6;
  const inHead = (x: number, y: number): boolean => (Math.abs(x - hx) / rx) ** 2.3 + (Math.abs(y - hy) / (y < hy ? ry * 0.96 : ry)) ** 2.1 + rag(x, y, 9) < 1;
  // THE BREAST: an egg under the head, the white front between the folded wings
  const B0 = 12;
  const B1 = 30;
  const hb = (y: number): number => {
    const t = (y - B0) / (B1 - B0);
    if (t < 0 || t > 1) return 0;
    const f = t < 0.45 ? 0.8 + 0.2 * Math.sin((t / 0.45) * (Math.PI / 2)) : 1 - 0.5 * ((t - 0.45) / 0.55) ** 1.5;
    return (4.7 + br * 0.45 + fl * 0.9) * f;
  };
  // THE WINGS, folded along its sides from the shoulder to their tips low down either side of the legs
  const W0 = 12.5;
  const W1 = 37.2;
  const ww = (y: number): number => {
    const t = (y - W0) / (W1 - W0);
    if (t < 0 || t > 1) return 0;
    // (a pear: the shoulders under the head, fullest a third of the way down, drawn in to the tips)
    const f = t < 0.32 ? 0.84 + 0.16 * Math.sin((t / 0.32) * (Math.PI / 2)) : 1 - 0.6 * ((t - 0.32) / 0.68) ** 1.35;
    return (10.2 + br * 0.45 + fl * 1.1) * f;
  };
  const legX = (y: number, side: number): number => cx + side * (2.6 - (y - 30) * 0.08);
  const part = (x: number, y: number): OwlPart | null => {
    if (inHead(x, y)) return 'head';
    const dx = Math.abs(x - cx);
    const b = hb(y);
    if (b > 0 && dx < b + rag(x, y, 11) * 4) return 'breast';
    // the feet on the beam: three toes each, splayed over its top, the talons curled over its edge
    if (y > 35.2 && y < 40) {
      for (const side of [-1, 1]) {
        const fx = legX(35, side);
        const ddx = x - fx;
        if (y < 37 && Math.abs(ddx) < 2.6) return 'foot';
        if (y >= 37 && y < 39.6 && [-2, 0, 2].some((tx) => Math.abs(ddx - tx) < 0.6)) return 'foot';
      }
    }
    // the legs: feathered, long, under the belly
    if (y > 28 && y <= 35.2) for (const side of [-1, 1]) if (Math.abs(x - legX(y, side)) < 1.55) return 'leg';
    const w = ww(y);
    if (w > 0 && dx < w + rag(x, y, 13) * 5) {
      if (y < B1 - 1) return 'wing';
      // (below the belly only the long tips, either side)
      if (dx > w - 3.2) return 'tip';
    }
    return null;
  };
  const map: (OwlPart | null)[] = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) map.push(part(x + 0.5, y + 0.5));
  const at = (x: number, y: number): OwlPart | null => (x < 0 || y < 0 || x >= W || y >= H ? null : map[y * W + x]);

  // THE FACE: a heart, its middle swung with the head's turn, narrowed as it turns; gone when the head is turned right round
  const away = Math.abs(p.turn) >= 0.85;
  const fxc = hx - p.turn * 3.4;
  const fw = 7.1 * (1 - Math.abs(p.turn) * 0.38) + fl * 0.5;
  const fyc = hy + 0.7;
  const fh = 7.4 + fl * 0.4;
  /** How far inside the heart a point is (in pixels; < 0 outside). */
  const heart = (x: number, y: number): number => {
    const u = (x - fxc) / fw;
    const v = (y - fyc) / fh;
    const au = Math.abs(u);
    if (au >= 1) return -1;
    const top = -0.94 + 0.34 * Math.max(0, 1 - au / 0.26) + (au > 0.68 ? ((au - 0.68) / 0.32) ** 2 * 0.95 : 0);
    const bot = 1.0 - 0.92 * au ** 1.45;
    return Math.min((v - top) * fh, (bot - v) * fh, (1 - au) * fw);
  };
  const eyes: [number, number, boolean][] = [-1, 1].map((side) => {
    const ex = fxc + side * 2.75 * (fw / 7.1);
    const far = (side < 0 && p.turn < -0.25) || (side > 0 && p.turn > 0.25);
    return [ex, fyc - 1.1, far];
  });

  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const m = at(x, y);
    if (!m) continue;
    const X = x + 0.5;
    const Y = y + 0.5;
    // (the outline: where it meets the air; the toes and talons keep their own dark)
    const edge = !at(x - 1, y) || !at(x + 1, y) || !at(x, y - 1) || !at(x, y + 1);
    if (edge && m !== 'foot') {
      px.set(x, y, O.ink);
      continue;
    }
    if (m === 'foot') {
      if (Y > 37.6) px.set(x, y, Y > 38.6 ? O.talon : O.toe[0]);
      else px.set(x, y, X < cx ? O.toe[Y < 36.2 ? 2 : 1] : O.toe[Y < 36.2 ? 1 : 0]);
      continue;
    }
    if (m === 'leg') {
      const side = X < cx ? -1 : 1;
      const lx = X - legX(Y, side);
      px.set(x, y, lx < -0.4 ? O.breast[3] : lx < 0.6 ? O.breast[2] : O.breast[1]);
      continue;
    }
    if (m === 'head') {
      const h = away ? -1 : heart(X, Y);
      if (h >= 0) {
        const u = (X - fxc) / fw;
        if (h < 1.6) {
          px.set(x, y, O.ruff[u < -0.15 ? 2 : u > 0.3 ? 0 : 1]);
          continue;
        }
        // the eyes
        let done = false;
        for (const [ex, ey, far] of eyes) {
          const erx = far ? 1.15 * (1 - Math.abs(p.turn) * 0.55) : 1.2;
          const ery = 1.65;
          const dx = (X - ex) / erx;
          const dy = (Y - ey) / ery;
          if (dx * dx + dy * dy < 1) {
            if (p.blink > 0.6) px.set(x, y, Math.abs(Y - ey - 0.4) < 0.6 ? O.lid : O.disc[1]);
            else if (p.blink > 0.25 && Y < ey) px.set(x, y, O.disc[1]);
            else px.set(x, y, dx < -0.1 && dy < -0.2 && p.blink < 0.25 ? O.eyeHi : O.eye);
            done = true;
            break;
          }
          // (the brown smudge before each eye, toward the beak)
          const toward = Math.sign(fxc - ex);
          if (Math.abs(X - (ex + toward * 1.6)) < 0.55 && Y > ey - 1.6 && Y < ey && !far) {
            px.set(x, y, O.smudge);
            done = true;
            break;
          }
        }
        if (done) continue;
        // the beak, down the middle under the eyes, mostly hid in the feathers
        if (Math.abs(X - fxc) < 0.95 && Y > fyc + 0.2 && Y < fyc + 3.6) {
          px.set(x, y, Y > fyc + 2.8 ? O.beak[0] : X < fxc ? O.beak[2] : O.beak[1]);
          continue;
        }
        // the ridge down the disc's middle from its notch
        if (Math.abs(X - fxc) < 0.55 && Y < fyc - 0.6) {
          px.set(x, y, O.ridge);
          continue;
        }
        // the disc: lit on its left, a soft shade to its right and toward the chin; fluffed (ruffled) in rows
        let k = u < -0.25 ? 2 : u > 0.35 ? 0 : 1;
        if ((Y - fyc) / fh > 0.6 && k > 0) k--;
        if (p.ruffle > 0.3 && (x * 3 + y * 2) % 7 === 0) k = Math.max(0, k - 1);
        px.set(x, y, O.disc[k]);
        continue;
      }
      // (turned right round: a sliver of the face's rim and disc at the side it went to)
      if (away) {
        const sd = (X - hx) * -Math.sign(p.turn);
        if (sd > rx * 0.62 && Math.abs(Y - hy - 0.8) < 5.2) {
          px.set(x, y, sd > rx * 0.82 ? O.disc[1] : O.ruff[1]);
          continue;
        }
      }
      // the crown and back of the head: golden-buff washed grey, white dots each with a dark fleck under it
      const l = (hx - X) * 0.13 + (hy - Y) * 0.17;
      let k = l > 0.55 ? 4 : l > 0 ? 3 : l > -0.6 ? 2 : 1;
      let c = O.buff[k];
      const g = noise(X / 3.2, Y / 3.2, 21);
      if (g > 0.58) c = O.grey[Math.min(2, Math.max(0, k - 1))];
      if (hash(x, y, 23) > 0.9 && hash(x, y + 1, 23) <= 0.9) c = O.dot;
      else if (hash(x, y - 1, 23) > 0.9) c = O.speck;
      if (away && Math.abs(X - hx) < 0.6 && Y > hy - 3) c = O.buff[Math.max(0, k - 1)];
      px.set(x, y, c);
      continue;
    }
    if (m === 'breast') {
      const dx = X - cx;
      const b = hb(Y);
      const l = -dx / Math.max(1, b) * 0.9 + (B0 + 6 - Y) * 0.04;
      let k = l > 0.35 ? 3 : l > -0.25 ? 2 : l > -0.75 ? 1 : 0;
      if (Y > B1 - 3 && k > 0) k--;
      let c = O.breast[k];
      // (buff at its shoulders, where the wings meet it; a few dark specks down it)
      if (Y < B0 + 6 && Math.abs(dx) > b - 1.6) c = O.buff[4];
      if (hash(x, y >> 1, 19) > 0.92 && Y > B0 + 3 && (x + (y >> 1)) % 2 === 0) c = O.speck;
      if (p.ruffle > 0.3 && (x + y * 2) % 5 === 0) c = O.breast[Math.max(0, k - 1)];
      px.set(x, y, c);
      continue;
    }
    // THE WINGS: rows of feathers, golden-buff and grey, their edges paler; white dots; the long tips barred
    const side = X < cx ? -1 : 1;
    const dx = Math.abs(X - cx);
    const w = ww(Y);
    const lit = side < 0 ? 1 : -1;
    // (where the wing's inner edge lies on the breast: a darker line)
    if (m === 'wing' && dx < hb(Y) + 1.2) {
      px.set(x, y, O.buff[1]);
      continue;
    }
    const lower = Y > 25 || m === 'tip';
    const row = lower ? Math.floor((Y + (w - dx) * 0.6) / 3) : Math.floor((Y + (w - dx) * 1.2) / 3.4);
    const into = lower ? (Y + (w - dx) * 0.6) / 3 - row : (Y + (w - dx) * 1.2) / 3.4 - row;
    let k = 2 + (lit > 0 ? 1 : 0);
    if (into < 0.3) k += 1;
    if (lower && into > 0.72) k -= 2;
    if (dx > w - 1.6) k -= 1;
    let c = O.buff[Math.max(0, Math.min(4, k))];
    if (noise(X / 2.6 + side * 7, Y / 2.6, 27) > 0.56 && !(lower && into > 0.72)) c = O.grey[Math.max(0, Math.min(2, k - 2))];
    if (hash(x, y, 29) > 0.93 && !lower) c = O.dot;
    if (p.ruffle > 0.3 && into < 0.2) c = O.buff[4];
    px.set(x, y, c);
  }
  return px.sprite(OWL.ax, OWL.ay, 2);
}

/** THE OWL'S MOMENTS (for the pictures): it breathes in and out, blinks (half, shut), turns its head one way and right round, ruffles. */
export const OWL_MOMENTS: { name: string; pose: OwlPose }[] = [
  { name: 'sitting, breathing in', pose: { blink: 0, turn: 0, ruffle: 0, breath: 1 } },
  { name: 'breathing out', pose: { blink: 0, turn: 0, ruffle: 0, breath: -1 } },
  { name: 'blinking', pose: { blink: 1, turn: 0, ruffle: 0, breath: 0 } },
  { name: 'head turned', pose: { blink: 0, turn: 0.6, ruffle: 0, breath: 0 } },
  { name: 'looking behind', pose: { blink: 0, turn: -1, ruffle: 0, breath: 0 } },
  { name: 'ruffled', pose: { blink: 0.3, turn: 0, ruffle: 1, breath: 0.5 } },
];

/** Blit a sprite (density 2: a picture pixel each) into the place at a world point, at a depth. */
export function blitSprite(D: Deep, s: Sprite, at: [number, number, number], d: number, k = 1): void {
  const [px, py] = atPx(at[0], at[1], at[2]);
  const q = s.img.getContext('2d') as CanvasRenderingContext2D;
  const im = q.getImageData(0, 0, s.img.width, s.img.height);
  const dens = s.density ?? 1;
  const X0 = Math.round(px) - Math.round(s.ax * dens) * k;
  const Y0 = Math.round(py) - Math.round(s.ay * dens) * k;
  for (let j = 0; j < im.height; j++) for (let i = 0; i < im.width; i++) {
    const o = (j * im.width + i) * 4;
    if (im.data[o + 3] < 128) continue;
    const c = `#${((im.data[o] << 16) | (im.data[o + 1] << 8) | im.data[o + 2]).toString(16).padStart(6, '0')}`;
    D.depth = d;
    for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) D.set(X0 + i * k + dx, Y0 + j * k + dy, c);
  }
}

// =================================================================================================
// THE TREE: its trunk and boughs (world points, each with a radius in tiles), and its leaves in clumps.

interface Bough { pts: [number, number, number][]; r0: number; r1: number }
interface Clump { at: [number, number, number]; r: number; inside: boolean }
interface TreeShape { boughs: Bough[]; clumps: Clump[] }

/** B: the old tree outside the back corner, leaning in over the broken gable and through the hole. A, C: its boughs over the gable. */
export const TREES: Record<Look, TreeShape> = {
  fallen: {
    boughs: [
      { pts: [[3.4, 3.8, 0], [3.9, 4.3, 90], [4.6, 5.0, 160], [5.6, 6.1, 215], [7.0, 7.4, 250]], r0: 0.62, r1: 0.3 },
      { pts: [[4.6, 5.0, 160], [5.4, 7.0, 190], [6.4, 8.6, 205], [7.6, 9.6, 200]], r0: 0.3, r1: 0.12 },
      { pts: [[5.6, 6.1, 215], [7.6, 6.6, 240], [9.2, 7.0, 230], [10.4, 7.6, 205]], r0: 0.26, r1: 0.1 },
      { pts: [[7.0, 7.4, 250], [8.4, 8.6, 268], [9.6, 9.8, 262]], r0: 0.22, r1: 0.08 },
      { pts: [[3.9, 4.3, 90], [3.0, 6.0, 150], [2.6, 8.0, 190]], r0: 0.28, r1: 0.1 },
      // (a bough come down through the hole, hanging into the hall)
      { pts: [[9.2, 7.0, 230], [9.6, 7.8, 175], [9.9, 8.3, 140]], r0: 0.1, r1: 0.05 },
    ],
    clumps: [
      { at: [7.6, 9.6, 205], r: 40, inside: false }, { at: [10.4, 7.6, 205], r: 34, inside: false }, { at: [9.6, 9.8, 262], r: 46, inside: false },
      { at: [8.4, 6.8, 250], r: 36, inside: false }, { at: [6.0, 8.0, 245], r: 40, inside: false }, { at: [2.6, 8.0, 190], r: 44, inside: false },
      { at: [4.2, 5.6, 260], r: 46, inside: false }, { at: [6.8, 5.6, 280], r: 40, inside: false }, { at: [11.0, 9.0, 290], r: 40, inside: false },
      { at: [9.9, 8.3, 136], r: 18, inside: true }, { at: [9.4, 7.6, 160], r: 14, inside: true },
    ],
  },
  boards: {
    boughs: [{ pts: [[3.6, 9.0, 120], [4.6, 10.4, 190], [5.6, 11.6, 236]], r0: 0.22, r1: 0.1 }, { pts: [[4.6, 10.4, 190], [4.4, 12.6, 210], [4.6, 14.0, 200]], r0: 0.16, r1: 0.07 }],
    clumps: [{ at: [5.6, 11.6, 236], r: 30, inside: false }, { at: [4.6, 14.0, 200], r: 30, inside: false }, { at: [4.2, 12.6, 250], r: 34, inside: false }, { at: [3.0, 10.0, 210], r: 34, inside: false }],
  },
  // (the castle hall: no tree; it is inside the castle's walls)
  castle: { boughs: [], clumps: [] },
  rafters: {
    boughs: [
      { pts: [[3.6, 4.6, 120], [5.0, 5.6, 210], [6.6, 6.6, 280], [8.0, 7.4, 320]], r0: 0.3, r1: 0.12 },
      { pts: [[3.6, 9.0, 120], [4.6, 10.4, 190], [5.6, 11.6, 236]], r0: 0.22, r1: 0.1 },
    ],
    clumps: [
      { at: [8.0, 7.4, 320], r: 40, inside: false }, { at: [6.6, 6.6, 300], r: 36, inside: false }, { at: [5.0, 5.6, 230], r: 36, inside: false },
      { at: [5.6, 11.6, 236], r: 30, inside: false }, { at: [4.2, 12.6, 250], r: 34, inside: false },
    ],
  },
};

/** May the tree be painted over this pixel? Outside the hall it shows only where the hall shows nothing (the dark, the sky). */
function behindOk(D: Deep, x: number, y: number, sky: string): boolean {
  if (x < 0 || y < 0 || x >= D.w || y >= D.h) return false;
  return D.depthAt(x, y) < -1e8 || D.get(x, y) === sky;
}

export function paintTree(D: Deep, look: Look): void {
  const P = PALS[look];
  const T = TREES[look];
  const bark = ['#1e150e', '#33251a', '#4a3826', '#604a34', '#776046'];
  const sky = P.sky;
  // the boughs: thick lines, lit on their upper left, the bark streaked along them; fading into the dark low down
  for (const b of T.boughs) {
    const n = b.pts.length;
    for (let i = 0; i + 1 < n; i++) {
      const [ax, ay, az] = b.pts[i];
      const [bx, by, bz] = b.pts[i + 1];
      const steps = 60;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const wx = ax + (bx - ax) * t;
        const wy = ay + (by - ay) * t;
        const wz = az + (bz - az) * t;
        const rr = (b.r0 + (b.r1 - b.r0) * ((i + t) / (n - 1))) * 45;
        const [sx, sy] = atPx(wx, wy, wz);
        const inside = wx > 6 && wy > 6;
        const d = wx + wy;
        for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) {
          const r = Math.hypot(dx, dy) / rr;
          if (r > 1) continue;
          const X = Math.round(sx + dx);
          const Y = Math.round(sy + dy);
          if (!inside && !behindOk(D, X, Y, sky)) continue;
          const l = -dx * 0.7 - dy * 0.7;
          let k = r > 0.86 ? 0 : l > rr * 0.4 ? 4 : l > 0 ? 3 : l > -rr * 0.4 ? 2 : 1;
          if (hash(X, Math.floor(Y / 3), 141) > 0.82) k = Math.max(0, k - 1);
          let c = bark[k];
          if (k >= 3 && fbm(X / 6, Y / 6, 143) > 0.6) c = P.moss[3];
          // (low down, outside, the trunk goes into the dark)
          if (wz < 80 && !inside) c = mixC(c, P.beyond, Math.min(0.85, (80 - wz) / 80));
          D.depth = inside ? d : -1e8 + 1;
          if (inside) D.set(X, Y, c);
          else D.over(X, Y, c);
        }
      }
    }
  }
  // the leaves: clumps of two-pixel clusters, lit on their upper left, dappled with the sun
  for (const cl of T.clumps) {
    const [sx, sy] = atPx(cl.at[0], cl.at[1], cl.at[2]);
    const R = cl.r;
    const d = cl.at[0] + cl.at[1] + 0.5;
    for (let dy = -R; dy <= R; dy += 2) for (let dx = -R * 1.3; dx <= R * 1.3; dx += 2) {
      const X = Math.round((sx + dx) / 2) * 2;
      const Y = Math.round((sy + dy) / 2) * 2;
      const r = Math.hypot(dx / 1.3, dy) / R;
      const n = fbm(X / 14, Y / 14, 151 + Math.round(cl.at[2]));
      if (r > 0.55 + n * 0.6) continue;
      if (hash(X >> 1, Y >> 1, 153) < 0.12 + r * 0.25) continue;
      const l = (-dx * 0.6 - dy * 0.8) / R;
      const lf = hash(X >> 1, Y >> 1, 155);
      let k = l > 0.35 ? 4 : l > 0 ? 3 : l > -0.4 ? 2 : 1;
      if (lf > 0.8) k = Math.min(4, k + 1);
      if (lf < 0.15) k = Math.max(0, k - 1);
      let c = P.leaf[k];
      // (the sun through the canopy: patches of it lit gold-green)
      if (noise(X / 9, Y / 9, 157) > 0.62 && k >= 2) c = mixC(c, P.sun, 0.45);
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
        if (cl.inside) {
          D.depth = d;
          D.set(X + i, Y + j, c);
        } else if (behindOk(D, X + i, Y + j, sky)) D.over(X + i, Y + j, c);
      }
    }
  }
}
