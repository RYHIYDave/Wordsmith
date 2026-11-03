// THE CASTLE HALL'S OWL, ON ITS BEAM, ALIVE: MADE GAME-READY (the art chat, 2 Nov 2026). Behind the castle hall's switch
// (art/castle_hall.ts, CASTLE_HALL, off); nothing of the game imports it until the main chat puts it in.
//
// His words, 2 Nov 2026, 15:37: “Unfortunately that means the first town is going to have to be redone as well.  In sort of
// the same style as the wardens.  Maybe more sun, and more plants.  An owl in the rafters.  Hastily barricaded windows”.
// The owl as he saw it in the castle hall (docs/mockups/town_look, its second pass, the mock-up's own drawing), here as the
// game's frames, with the times for the game to play them.
//
// A BARN OWL, an original drawing at the heroes' grain (a picture pixel each): a round, flat-topped head with no neck; the
// HEART-SHAPED PALE FACE in a thin ochre ruff with the DARK EYES set in it; a white breast with a few dark specks; THE WINGS
// FOLDED soft along its sides, golden-buff and grey, white-dotted, their barred tips reaching down past the belly; long
// feathered legs; THE FEET GRIPPING THE BEAM, the dark talons curled over its edge. Lit from the upper left, outlined.
// ALIVE (his rulebook: it breathes when still): it breathes all the time (its breast and wings swelling and settling), it
// blinks every few seconds (the lids down and up), now and then it turns its head to look about and back, seldom it looks
// right round behind it, and seldom it ruffles (its feathers lifted all over, then smoothed). Never a jump: every turn goes
// through a frame between.
//
// EACH FRAME a picture of the game's measures: 40 x 144 picture pixels (two to a game pixel), ANCHORED AT THE FLOOR POINT
// UNDER IT (20, 142), the beam's top 102 picture pixels (51 game pixels) over that point: it stands where it perches, as the
// floor's own pieces stand (on the castle hall's hammer beam over the smithy: CASTLE_OWL_AT, art/castle_hall.ts).

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { GRAIN, hash } from './kit';

/** Plain smooth noise (the mock-up's, the same numbers). */
function noise(x: number, y: number, k = 0): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(i, j, k) + (hash(i + 1, j, k) - hash(i, j, k)) * sx;
  const b = hash(i, j + 1, k) + (hash(i + 1, j + 1, k) - hash(i, j + 1, k)) * sx;
  return a + (b - a) * sy;
}

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
function paintBird(p: OwlPose): Px {
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
  return px;
}

/** How high its beam's top is over the floor point it stands on (picture pixels); its picture's size and anchor. */
export const OWL_PERCH = 102;
export const OWL_PIC = { w: OWL.w + 4, h: 144, ax: OWL.ax + 2, ay: OWL.ay + 2 + OWL_PERCH };

/** One moment of the owl, as the game's picture: anchored at the floor point under it, its beam OWL_PERCH over it. */
export function paintOwl(p: OwlPose): Sprite {
  const bird = paintBird(p);
  const out = new Px(OWL_PIC.w, OWL_PIC.h);
  out.blit(bird, 2, 2);
  return out.sprite(OWL_PIC.ax, OWL_PIC.ay, GRAIN);
}
/** The bird alone, anchored on its beam between its feet (for a picture of it close). */
export function owlOnBeam(p: OwlPose): Sprite {
  return paintBird(p).sprite(OWL.ax, OWL.ay, GRAIN);
}

/**
 * ITS FRAMES: breathing (four steps from out to in: 0 to 3); blinking (4 half, 5 shut); its head turned toward screen-right
 * (6 a little, 7 well round) and toward screen-left (8, 9), on round to looking behind (10, 11); ruffled (12 lifting, 13
 * fluffed right out).
 */
export const OWL_POSES: readonly OwlPose[] = [
  { blink: 0, turn: 0, ruffle: 0, breath: -1 },
  { blink: 0, turn: 0, ruffle: 0, breath: -0.34 },
  { blink: 0, turn: 0, ruffle: 0, breath: 0.34 },
  { blink: 0, turn: 0, ruffle: 0, breath: 1 },
  { blink: 0.5, turn: 0, ruffle: 0, breath: 0.34 },
  { blink: 1, turn: 0, ruffle: 0, breath: 0.34 },
  { blink: 0, turn: 0.3, ruffle: 0, breath: 0 },
  { blink: 0, turn: 0.6, ruffle: 0, breath: 0 },
  { blink: 0, turn: -0.3, ruffle: 0, breath: 0 },
  { blink: 0, turn: -0.6, ruffle: 0, breath: 0 },
  { blink: 0, turn: -0.8, ruffle: 0, breath: 0 },
  { blink: 0, turn: -1, ruffle: 0, breath: 0 },
  { blink: 0.2, turn: 0, ruffle: 0.5, breath: 0.5 },
  { blink: 0.3, turn: 0, ruffle: 1, breath: 0.5 },
];
/** What each frame is, for the pictures. */
export const OWL_NAMES: readonly string[] = [
  'breathing out', 'breathing', 'breathing', 'breathing in', 'blinking', 'blinking, shut', 'turning its head', 'its head turned',
  'turning its head', 'its head turned', 'looking round', 'looking behind', 'ruffling', 'ruffled',
];

/** One breath: out to in and back, 0.3 s a step (2.4 s a breath). */
const BREATH: [number, number][] = [[0, 0.3], [1, 0.3], [2, 0.3], [3, 0.3], [3, 0.3], [2, 0.3], [1, 0.3], [0, 0.3]];
const breaths = (n: number): [number, number][] => Array.from({ length: n }, () => BREATH).flat();
const BLINK: [number, number][] = [[4, 0.06], [5, 0.12], [4, 0.06]];
/**
 * ITS LIFE, a loop of 28.06 seconds for the game to play (each entry: a frame, how long it holds, in seconds): it breathes all
 * through; a blink every few seconds; its head turned to the right and back; looking round behind it to the left and back (a
 * long look); a ruffle. The game plays it by the clock (`owlFrameAt`), each owl from its own start so two never move together.
 */
export const OWL_LOOP: readonly (readonly [number, number])[] = [
  ...breaths(2), ...BLINK, ...breaths(1),
  [6, 0.14], [7, 1.7], [6, 0.14], ...BLINK, ...breaths(1),
  ...breaths(1), ...BLINK, ...breaths(1),
  [8, 0.14], [9, 0.14], [10, 0.14], [11, 1.6], [10, 0.14], [9, 0.14], [8, 0.14], ...breaths(1), ...BLINK,
  ...breaths(1), [1, 0.3], [12, 0.12], [13, 0.6], [12, 0.12], ...BLINK, ...breaths(1),
];
/** How long its loop is, in seconds. */
export const OWL_LOOP_SECS = OWL_LOOP.reduce((t, [, s]) => t + s, 0);
/** The frame to show at time `t` (seconds, the game's clock; `from`: when this owl's loop began). */
export function owlFrameAt(t: number, from = 0): number {
  let u = (((t - from) % OWL_LOOP_SECS) + OWL_LOOP_SECS) % OWL_LOOP_SECS;
  for (const [f, s] of OWL_LOOP) {
    if (u < s) return f;
    u -= s;
  }
  return OWL_LOOP[OWL_LOOP.length - 1][0];
}

let frames: Sprite[] | null = null;
/** Its frames (OWL_POSES), painted the first time they are asked for and kept. */
export function owlFrames(): Sprite[] {
  return (frames ??= OWL_POSES.map(paintOwl));
}
