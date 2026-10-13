// FLOOR 6, THE QUARRY: INSIDE THE OVERSEERS' REDOUBT, the cult's stronghold, and its last room (a
// mock-up; nothing of the game imports it).
//
// As the planning chat painted the last room with his yes (13 Oct, by 10:19: "Yes, this is it
// (Recommended)"): drawn as the game draws a dungeon's room, the far walls standing, the near ones cut
// away, black beyond; a hall in the redoubt's dressed stone, the cult's banners and pink braziers; the
// obelisk the cult is cutting, pale, its runes burning pink, still joined at its far end to the bedrock,
// in a ring of the cult's magic on the floor (the quarry golems round it are the floor's mobs, to come).
// To the door, his: "Yes, on to the last room (Recommended)" (13 Oct, by 12:05).
//
// INSIDE IT IS A DUNGEON'S ROOM, so its floor and walls are a THEME of the ground's own painters
// (art/ground.ts), as the Crypt's floors are: the redoubt's dressed limestone, squared and coursed, in the
// dim of a hall lit by the cult's fire: greyer and warmer than the Crypt's indigo and plum, so the two
// are never mistaken (his rulebook, Places 3).
//
// THE OBELISK'S RUNES: his rulebook keeps letters for where a word is at work (Words in the world 3: "No
// carved words"), so what burns along it is not lettering: the cult's own mark, the shrieking skull, cut
// down its top in a row, and the channels of power that join them, burning pink (the enemy's glow).

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { CLOTH, PAINT, PAINT_SHADE } from './act1_cult';
import { FRESH, STONE } from './floor6';
import { Scene, XYZ, facetOf, toneAt } from './floor4';
import type { V3 } from './floor4';
import { shriekAt } from './floor5';
import { TOWARD } from './floor2';
import { flat, fx, fy, wallSet } from './floorkit';
import type { Piece } from './floorkit';
import { VAULT, makeGroundArt } from './ground';
import type { GroundArt, Theme } from './ground';
import { GRAIN, compose, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';

/** THE REDOUBT'S STONE, INSIDE: the quarry's limestone dressed and coursed, in a hall's dim. */
export const REDOUBT: Theme = {
  ...VAULT,
  id: 'redoubt',
  mortar: '#15121b',
  slab: ['#322c38', '#403946', '#4d4553', '#5b5361'],
  cap: ['#3e3744', '#5e5664', '#6e6674', '#665e6c', '#867e8c'],
  capLow: ['#38323e', '#564e5c', '#665e6c', '#5e5664', '#7c7482'],
  lit: ['#2a2530', '#463f4c', '#554d5b', '#4e4654', '#6e6674'],
  shade: ['#17141c', '#221e28', '#2d2834', '#2a2530', '#3a3442'],
};

let ground: GroundArt | null = null;
/** The redoubt's floor and walls, as the game paints a dungeon's (art/crypt.ts's cryptGround for the Crypt). */
export function redoubtGround(): GroundArt {
  return ground ?? (ground = makeGroundArt(REDOUBT));
}

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => {
  const n = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};
const fr = (t: number): number => t - Math.floor(t);
function seenNormal(q: readonly [V3, V3, V3, V3]): V3 {
  const n = norm(cross(sub(q[1], q[0]), sub(q[3], q[0])));
  return dot(n, TOWARD) >= 0 ? n : mul(n, -1);
}

/** The bedrock it is still joined to: the quarry's raw rock, broken and lumped. */
const BEDROCK: Ramp = ['#3a3442', '#524b5a', '#6a6270', '#857d88', '#9a929c'];

/**
 * THE HALF-CUT OBELISK: lying along x where the cult is cutting it, its far end (toward -x) still one
 * with the bedrock, a great broken mass of the raw rock it is coming out of; its shaft dressed and pale
 * toward its point, the cuts round it where it is being freed; down its top, the cult's mark cut in a row
 * and the channels of power between them, burning pink, pulsing (4 frames, at about 6 a second), its
 * light on the floor round it. 216 x 150 at (104, 96).
 */
function halfCutObelisk(f: number): Sprite {
  const S = new Scene(new Px(216, 150), 104, 96);
  const X0 = -50;
  const X1 = 64;
  const TIP = 88;
  const W0 = 15;
  const W1 = 10;
  const H0 = 28;
  const H1 = 18;
  const pulse = [0, 1, 2, 1][f % 4];
  // the bedrock it comes out of, at its far end: a raw mass of the rock, its faces broken, higher than it
  const rough = (n: V3, w: V3): string => {
    const k = hash(Math.floor(w[0] / 5), Math.floor((w[1] + w[2]) / 5), 981);
    if (k > 0.86) return BEDROCK[Math.max(0, BEDROCK.indexOf(toneAt(n, BEDROCK, 0)) - 1)];
    if (Math.abs(fr(w[2] / 9 + hash(Math.floor(w[0] / 8), 1, 982) * 0.3) - 0.5) < 0.05) return BEDROCK[1];
    return toneAt(n, BEDROCK, (k - 0.5) * 0.25);
  };
  S.box([-68, 0, 17], XYZ, [16, 24, 17], (_f, _u, _v, n) => toneAt(n, BEDROCK, 0), 1);
  S.quad([[-52, -24, 0], [-52, 24, 0], [-52, 24, 34], [-52, -24, 34]], (_u, _v, w) => rough([1, 0, 0], w), 1);
  S.quad([[-84, 24, 0], [-52, 24, 0], [-52, 24, 34], [-84, 24, 34]], (_u, _v, w) => rough([0, 1, 0], w), 1);
  // its broken top and edges: great faceted lumps of the rock, heaped and leaning, breaking its square
  const lumps: [V3, V3, number][] = [
    [[-70, -8, 36], [15, 16, 12], 0.3], [[-60, 12, 34], [11, 12, 9], -0.4], [[-78, 14, 32], [9, 11, 10], 0.6], [[-56, -18, 30], [9, 9, 8], -0.2],
    [[-54, 22, 14], [8, 7, 14], 0.2], [[-50, 2, 24], [6, 10, 11], 0.1], [[-66, 20, 46], [7, 7, 6], 0.9], [[-74, -4, 50], [8, 9, 7], -0.6],
  ];
  for (const [c, r, turn] of lumps) S.egg(c, [norm([Math.cos(turn), Math.sin(turn), 0.15]), norm([-Math.sin(turn), Math.cos(turn), 0]), norm([0, -0.15, 1])], r, facetOf(BEDROCK, 0.04), 1);
  // the cut round the shaft where it is being freed: a dark slot along its foot
  S.quad([[X0, W0 + 2.4, 0.3], [X1, W1 + 2.4, 0.3], [X1, W1 + 0.1, 0.3], [X0, W0 + 0.1, 0.3]], () => '#0e0b14', 2);
  const top: [V3, V3, V3, V3] = [[X0, -W0, H0], [X1, -W1, H1], [X1, W1, H1], [X0, W0, H0]];
  const side: [V3, V3, V3, V3] = [[X0, W0, 0], [X1, W1, 0], [X1, W1, H1], [X0, W0, H0]];
  const nTop = seenNormal(top);
  const nSide = seenNormal(side);
  const LEN = X1 - X0;
  // its top: rough where it leaves the bedrock, dressed toward its point; the marks and channels burning
  S.quad(top, (u, v) => {
    const a = u * LEN;
    const half = W0 + (W1 - W0) * u;
    const b = (v - 0.5) * 2 * half;
    // the marks: three of the cult's skulls in a row down it, each burning in its hollows
    for (let k = 0; k < 3; k++) {
      const ca = 22 + k * 32;
      const m = shriekAt(b / (9 - k), -(a - ca) / (10 - k));
      if (m === 'dark') return FLAME[Math.min(4, 2 + pulse)];
      if (m === 'bone') return FLAME[1];
    }
    // the channels between them, burning: one down its middle
    if (Math.abs(b) < 1.1 && a > 8 && a < 102) return FLAME[pulse > 1 ? 3 : 2];
    if (u < 0.12) return hash(Math.floor(u * 90), Math.floor(v * 16), 980) > 0.5 ? STONE[2] : STONE[3];
    const row = fr(u * 22);
    const col = fr(v * 5 + Math.floor(u * 22) * 0.45);
    if (row < 0.15 && col < 0.5) return FRESH[3];
    return toneAt(nTop, FRESH, 0.02);
  }, 3);
  S.quad(side, (u, v) => {
    if (v > 0.93) return FRESH[3];
    if (u < 0.1) return toneAt(nSide, STONE, 0);
    if (v < 0.22 && fr(u * 26) < 0.12) return FRESH[1];
    return toneAt(nSide, FRESH, -0.02);
  }, 3);
  const A: V3 = [TIP, 0, H1 * 0.5];
  const tf: [V3, V3, V3, V3] = [[X1, -W1, H1], [X1, W1, H1], A, A];
  const sf: [V3, V3, V3, V3] = [[X1, W1, 0], [X1, W1, H1], A, A];
  S.quad(tf, (_u, v) => (v < 0.08 ? FRESH[4] : toneAt(seenNormal(tf), FRESH, 0.05)), 4);
  S.quad(sf, (_u, v) => (v < 0.06 ? FRESH[3] : toneAt(seenNormal(sf), FRESH, -0.04)), 4);
  S.seams();
  const sp = compose(null, [S.p], null).sprite(104, 96, GRAIN);
  const [lx, ly] = S.at([10, 0, 20]);
  sp.lights = [{ x: lx / GRAIN, y: ly / GRAIN, r: 46 + pulse * 3, color: FLAME[2], a: 0.32 + pulse * 0.04 }] as Light[];
  return sp;
}

/**
 * THE CULT'S RING OF MAGIC, laid on the floor round what it is working on: an ellipse on the grid,
 * `rx` by `ry` tiles, of the cult's pink burning, a second ring inside it fainter, and between them the
 * cult's mark set round at its quarters, the whole pulsing (4 frames). Lying on the floor; it lights it.
 * Anchored at its middle.
 */
function magicRing(f: number, rx: number, ry: number): Sprite {
  const R = Math.hypot(rx, ry);
  const W = Math.ceil(R * 64 + 16);
  const H = Math.ceil(R * 32 + 16);
  const p = new Px(W, H);
  const ox = W / 2;
  const oy = H / 2;
  const pulse = [0, 1, 2, 1][f % 4];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // the world place under this pixel, from the ring's middle, in tiles
      const a = (x + 0.5 - ox) / 32;
      const b = (y + 0.5 - oy) / 16;
      const wx = (a + b) / 2;
      const wy = (b - a) / 2;
      const r = Math.hypot(wx / rx, wy / ry);
      const ang = Math.atan2(wy / ry, wx / rx);
      // the outer ring, two pixels; the inner, one, broken in dashes that crawl round
      const d = Math.abs(r - 1) * Math.min(rx, ry) * 32;
      if (d < 1.4) p.set(x, y, FLAME[Math.min(4, 2 + (pulse > 1 ? 1 : 0))]);
      else if (d < 2.6) p.set(x, y, FLAME[1]);
      const di = Math.abs(r - 0.86) * Math.min(rx, ry) * 32;
      if (di < 0.8 && fr(ang / (Math.PI / 12) + f * 0.12) < 0.6) p.set(x, y, FLAME[pulse ? 2 : 1]);
    }
  }
  // the mark at its quarters: the shrieking skull lying on the floor, seen at the floor's slant
  for (let q = 0; q < 4; q++) {
    const qa = (q / 4) * Math.PI * 2 + Math.PI / 4;
    const mx = Math.cos(qa) * 0.93 * rx;
    const my = Math.sin(qa) * 0.93 * ry;
    const cx = ox + (mx - my) * 32;
    const cy = oy + (mx + my) * 16;
    for (let y = Math.floor(cy - 6); y <= Math.ceil(cy + 6); y++) {
      for (let x = Math.floor(cx - 8); x <= Math.ceil(cx + 8); x++) {
        const m = shriekAt((x + 0.5 - cx) / 6.5, -(y + 0.5 - cy) / 4.6);
        if (m === 'bone') p.set(x, y, FLAME[pulse > 0 ? 2 : 1]);
        else if (m === 'dark') p.set(x, y, '#2a0f24');
      }
    }
  }
  const s = p.sprite(ox, oy, GRAIN);
  s.lights = [{ x: ox / GRAIN, y: oy / GRAIN, r: rx * 18, color: FLAME[2], a: 0.18 + pulse * 0.04 }];
  return s;
}

/**
 * THE CULT'S HANGING, on a wall: a long cloth of its violet hung from an iron rod near the top of the
 * wall's solid stone, its foot cut into tails, the shrieking skull painted on it in bone-pale, a border
 * down its sides. (A wall piece: on the face turned to screen-left and the one in shade.)
 */
function hanging(p: Px): void {
  const half = 8;
  const top = 53;
  const cloth = new Px(p.w, p.h);
  for (let u = -half; u <= half; u++) {
    const tail = Math.abs(fr((u + half) / 5.67) - 0.5) * 2;
    const foot = 6 + Math.round(6 * (1 - tail));
    for (let v = foot; v <= top; v++) {
      const fold = Math.sin((u + half) * 0.75);
      let c = CLOTH[fold > 0.45 ? 3 : fold < -0.45 ? 1 : 2];
      if (u === -half + 1) c = CLOTH[4];
      if (u === half - 1) c = CLOTH[0];
      if (v === foot) c = CLOTH[1];
      cloth.set(fx(u), fy(v), c);
    }
  }
  for (let v = 20; v <= 46; v++) {
    for (let u = -7; u <= 6; u++) {
      const m = shriekAt((u + 0.5) / 6.4, (v - 34) / 9.6);
      if (m === 'bone') cloth.set(fx(u), fy(v), u > 3 ? PAINT_SHADE : PAINT);
    }
  }
  p.blit(cloth, 0, 0);
  for (let u = -half - 2; u <= half + 2; u++) p.set(fx(u), fy(top + 1), '#727083').set(fx(u), fy(top), '#24222e');
}

let made: Piece[] | null = null;
/** THE REDOUBT'S OWN PIECES, inside: its last room's. */
export function redoubtPieces(): Piece[] {
  if (made) return made;
  made = [
    { name: 'the half-cut obelisk', kind: 'obstacle', frames: [0, 1, 2, 3].map(halfCutObelisk), shadow: 1.1 },
    { name: "the cult's ring of magic", kind: 'on the floor', frames: [0, 1, 2, 3].map((f) => magicRing(f, 4.2, 2.6)) },
    { name: "the cult's hanging", kind: 'on the wall', ...wallSet(hanging) },
  ];
  return made;
}


