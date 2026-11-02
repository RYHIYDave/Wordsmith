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

/** Its moment: how far its lids are down (0 open, 1 shut), its head turned (-1 to its right, 1 to its left), its feathers ruffled (0..1), its breath (-1..1). */
export interface OwlPose { blink: number; turn: number; ruffle: number; breath: number }
export const OWL = { w: 36, h: 44, ax: 18, ay: 41 };
/** Its colours: the face, the buff of its back, the grey over it, the breast, the eyes, the beak, the talons, its outline. */
const O = {
  face: ['#c9bca6', '#e6dccb', '#f6f0e4'],
  rim: ['#6e4a26', '#9a6a36'],
  buff: ['#5a3a1c', '#8a5c2c', '#b4803e', '#d0a058'],
  grey: ['#6c6a66', '#9a968e'],
  breast: ['#c8bca8', '#e8e0d0', '#faf6ec'],
  speck: '#6a5034',
  eye: '#120c08',
  eyeHi: '#5a4a3a',
  beak: ['#8a7a64', '#c8b896'],
  talon: '#1c1612',
  ink: '#1e140c',
};

/** One moment of the owl, painted (picture pixels; its anchor between its feet, on the beam). */
export function paintOwl(p: OwlPose): Sprite {
  const W = OWL.w;
  const H = OWL.h;
  const px = new Px(W, H);
  const cx = W / 2;
  const fluff = p.ruffle * 2.6;
  const br = p.breath * 0.6;
  // the body: an egg, wider low down; the head over it
  const bodyC = [cx, 27 - br * 0.3];
  const bw = 10.5 + fluff + br * 0.5;
  const bh = 13.5 + fluff * 0.6;
  const headC = [cx + p.turn * 0.6, 12 - fluff * 0.4];
  const hw = 10 + fluff * 0.6;
  const hh = 8.6 + fluff * 0.4;
  const inBody = (x: number, y: number): number => {
    const dx = (x - bodyC[0]) / (bw * (y > bodyC[1] ? 1 : 0.9 + 0.1 * ((y - bodyC[1] + bh) / bh)));
    const dy = (y - bodyC[1]) / bh;
    const rag = p.ruffle > 0 ? (hash(Math.floor(x), Math.floor(y / 2), 7) - 0.5) * 0.18 * p.ruffle : 0;
    return Math.hypot(dx, dy) + rag;
  };
  const inHead = (x: number, y: number): number => {
    const rag = p.ruffle > 0 ? (hash(Math.floor(x / 2), Math.floor(y), 9) - 0.5) * 0.16 * p.ruffle : 0;
    return Math.hypot((x - headC[0]) / hw, (y - headC[1]) / hh) + rag;
  };
  // the facial disc: a heart, its middle swung with the head's turn
  const faceX = headC[0] - p.turn * 4.2;
  const faceW = 7.6 * (1 - Math.abs(p.turn) * 0.32);
  const inFace = (x: number, y: number): number => {
    const u = (x - faceX) / faceW;
    const v = (y - headC[1] - 0.6) / 7.2;
    // (a heart: two lobes at the top, a point at the chin)
    const lobe = Math.min(Math.hypot(u + 0.42, v + 0.32), Math.hypot(u - 0.42, v + 0.32));
    const chin = Math.abs(u) + Math.max(0, v) * 0.95;
    return v < -0.32 ? lobe / 0.62 : Math.max(Math.abs(u) / 0.98, chin / 1.0);
  };
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const X = x + 0.5;
      const Y = y + 0.5;
      const hd = inHead(X, Y);
      const bd = inBody(X, Y);
      // the feet and talons on the beam
      const foot = Y > 37.5 && Y < 41 && (Math.abs(X - cx + 4) < 2.6 || Math.abs(X - cx - 4) < 2.6);
      if (foot) {
        px.set(x, y, Y > 39.6 ? O.talon : (Math.floor(X) % 2 ? O.breast[1] : O.breast[0]));
        continue;
      }
      if (hd < 1) {
        const fd = inFace(X, Y);
        const turnedAway = Math.abs(p.turn) > 0.85;
        if (fd < 1 && !(turnedAway && fd > 0.55)) {
          if (fd > 0.84) {
            px.set(x, y, O.rim[X < faceX ? 1 : 0]);
            continue;
          }
          // the eyes: dark almonds, set in the disc; the near one wider when the head is turned
          const eyes: [number, number][] = [[faceX - 3.4, headC[1] + 0.2], [faceX + 3.4, headC[1] + 0.2]];
          let onEye = false;
          eyes.forEach(([ex, ey], i) => {
            const far = (i === 0 && p.turn < -0.3) || (i === 1 && p.turn > 0.3);
            const ew = far ? 1.2 * (1 - Math.abs(p.turn)) + 0.6 : 2.2;
            const open = 1.4 * (1 - p.blink);
            const dx = (X - ex) / ew;
            const dy = (Y - ey) / Math.max(0.35, open);
            if (Math.abs(X - ex) < ew && Math.abs(Y - ey) < 1.6) {
              if (p.blink > 0.6) {
                // (the lids down: a dark line where they meet, the lid's feathers over it)
                if (Math.abs(Y - ey - 0.3) < 0.5) {
                  px.set(x, y, O.ink);
                  onEye = true;
                } else if (Math.abs(Y - ey) < 1.4) {
                  px.set(x, y, O.face[0]);
                  onEye = true;
                }
              } else if (dx * dx + dy * dy < 1) {
                px.set(x, y, Math.abs(X - ex + 0.7) < 0.6 && Y < ey && p.blink < 0.3 ? O.eyeHi : O.eye);
                onEye = true;
              }
            }
          });
          if (onEye) continue;
          // the beak: down the disc's middle, between the eyes
          if (Math.abs(X - faceX) < 1 && Y > headC[1] + 1 && Y < headC[1] + 4.6) {
            px.set(x, y, X < faceX ? O.beak[1] : O.beak[0]);
            continue;
          }
          // the disc: lit on its left, a fold of darker down its middle
          const k = X < faceX - 1 ? 2 : X > faceX + 3 ? 0 : 1;
          px.set(x, y, Math.abs(X - faceX) < 0.6 && Y < headC[1] ? O.face[0] : O.face[k]);
          continue;
        }
        // the top and back of the head: buff, flecked grey, lit on its upper left
        const l = (headC[0] - X) * 0.12 + (headC[1] - Y) * 0.16;
        let c = O.buff[l > 0.5 ? 3 : l > -0.3 ? 2 : 1];
        if (hash(x, y, 13) > 0.8) c = O.grey[l > 0 ? 1 : 0];
        if (hd > 0.9) c = O.ink;
        px.set(x, y, c);
        continue;
      }
      if (bd < 1) {
        // the wings folded either side, the breast between; the breast flecked
        const side = (X - bodyC[0]) / bw;
        const wing = Math.abs(side) > 0.56 - (Y - bodyC[1]) * 0.012;
        if (bd > 0.93) {
          px.set(x, y, O.ink);
          continue;
        }
        if (wing) {
          const l = side < 0 ? 1 : -1;
          // (the wing's feathers in rows, their tips paler; grey over the buff, white dots)
          const row = Math.floor((Y + Math.abs(side) * 4) / 3.5);
          const tip = ((Y + Math.abs(side) * 4) % 3.5) < 1;
          let c = O.buff[l > 0 ? (tip ? 3 : 2) : tip ? 2 : 1];
          if (hash(row, Math.floor(X / 3), 15) > 0.62) c = O.grey[l > 0 ? 1 : 0];
          if (hash(x, y, 17) > 0.93) c = O.breast[2];
          px.set(x, y, c);
          continue;
        }
        const l = (bodyC[0] - X) * 0.1 + (bodyC[1] - Y) * 0.05;
        let c = O.breast[l > 0.35 ? 2 : l > -0.35 ? 1 : 0];
        if (hash(x >> 0, y >> 1, 19) > 0.9 && Y > bodyC[1] - 6) c = O.speck;
        // (ruffled: the breast's feathers stand, their edges catching light)
        if (p.ruffle > 0.3 && (x + y * 2) % 5 === 0) c = O.breast[0];
        px.set(x, y, c);
      }
    }
  }
  // the tail's tip under the body, over the beam
  for (let x = Math.floor(cx - 3); x < cx + 3; x++) for (let y = 39; y < 42; y++) if (!px.get(x, y)) px.set(x, y, y === 41 ? O.ink : O.buff[1]);
  return px.sprite(OWL.ax, OWL.ay, 2);
}

/** THE OWL'S MOMENTS (eight, for the pictures): sitting, breathing; blinking; its head turned one way and back; ruffled. */
export const OWL_MOMENTS: { name: string; pose: OwlPose }[] = [
  { name: 'sitting, breathing', pose: { blink: 0, turn: 0, ruffle: 0, breath: 0.6 } },
  { name: 'blinking', pose: { blink: 1, turn: 0, ruffle: 0, breath: -0.2 } },
  { name: 'head turned', pose: { blink: 0, turn: 0.9, ruffle: 0, breath: 0 } },
  { name: 'ruffled', pose: { blink: 0.4, turn: -0.2, ruffle: 1, breath: 0.4 } },
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
