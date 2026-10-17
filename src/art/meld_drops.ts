// RUNEDUST AND THE MELDSTONE: their pictures (the main chat, 16 Oct 2026). A MOCK-UP BEHIND A SWITCH
// THAT IS OFF: MELD_DROPS.
//
// His words to the main chat, 16 Oct 2026, 17:40: "Runedust and the meldstone need to be done". Read as
// (and told him so): the two still had the planning chat's stand-ins (art/icons.ts runedust, meldstone);
// drawn properly now, lying on the floor, falling as they drop, taken up, the Meldstone carried and
// given to the wordsmith, as big and wild as his art rulebook asks (Animations 1), pictures to him first.
// What they are was set with him on 13 Oct (game/melds.ts): runedust, what wordmelding is paid in, the
// friend's cyan; the Meldstone, the Fleshmancer's drop that opens melding at the wordsmith, "a rune stone
// of two halves fused along a cyan seam" (the planning chat's stand-in, which he said yes to as shown).
//
// SO, AS DRAWN HERE:
//   RUNEDUST: rune stone ground to glittering grit, the friend's cyan, a few chips of the stone it was
//     ground from lying in it, each with a fleck of its rune still lit. Lying, it glitters (grains
//     catch the light one after another), motes rise off it, and now and then a curl of it lifts off the
//     top, turns and falls back. Three heaps, by how much lies there. AS IT DROPS it bursts up out of
//     the floor in a fountain and rains down into its heap, a puff of it rolling out where it lands.
//     TAKEN, it whirls up round the hero in a spiral and pours into him.
//   THE MELDSTONE: two halves of two different rune stones, one ash-grey, one slate, each with half of
//     a rune cut in it, fused along a jagged seam of the friend's light; the two half-runes together
//     make a third. It hangs in the air over the floor, turning to and fro, its seam crackling; every
//     round the halves strain apart, the light blazing out between them, and snap back together. AS IT
//     DROPS it bursts up out of the Fleshmancer's closing pit, spinning, its halves torn apart, slams
//     together at the top and comes down to hang. TAKEN, it leaps over the hero's head, wrenches apart,
//     SLAMS together in a burst of light and dives into him; while carried it shows by INVENTORY, as the
//     master rune-stone does. GIVEN to the wordsmith, it floats over his slab, splits, its halves whirl
//     round each other faster and faster and slam together in a great burst; and from then on it hangs
//     over his slab, turning in the column of light: the sign that he can meld.
// Where each plays and when are the main chat's (render/meld_drops.ts); here are only the pictures.

import { Px, mix } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { CYAN, GRAIN, hash, lazyFrames } from './kit';
import type { Ramp } from './kit';
import { SLATE } from './quest3';
import { GRID } from './skeleton';

/**
 * The switch (on since his yes of 16 Oct, 22:17, to the films: "Yes"; off, the stand-ins of art/icons.ts are
 * drawn, as before), and the moment on the clock the hero took up the Meldstone (-1: not this run), which the
 * screen's carried picture waits on.
 */
export const MELD_DROPS = { on: true, takenAt: -1 };

/** Their light: the friend's cyan (CYAN), its deepest and its white. */
const DEEP = '#0a3a4a';
const WHITE = '#ffffff';

// ---------------------------------------------------------------------------------------------
// The round, seen from the game's one camera (as art/quest3.ts and the skeleton: a length along the
// floor is GRID of a pixel across and half that down; a height one for one). World x is down the
// screen to the right, world y down it to the left, z up.

type P3 = readonly [number, number, number];
const add3 = (a: P3, b: P3): P3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul3 = (a: P3, k: number): P3 => [a[0] * k, a[1] * k, a[2] * k];
const dot3 = (a: P3, b: P3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm3 = (a: P3): P3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross3 = (a: P3, b: P3): P3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** Where a point is seen: across and down the picture. */
export const seen3 = (p: P3): [number, number] => [GRID * (p[0] - p[1]), GRID * 0.5 * (p[0] + p[1]) - p[2]];
/** The way to the eye. */
const EYE: P3 = norm3([1, 1, GRID]);
/** The light: from above, a little from the left of the screen (as the master rune-stone's). */
const LIGHT: P3 = norm3([0.12, 0.5, 0.86]);
/** A floor tile is 39.19 lengths across. */
export const TILE_LENGTHS = 64 / (2 * GRID);

const smooth = (a: number, b: number, x: number): number => {
  const k = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};
/** 0 outside (a, b), rising to 1 in the middle and back. */
const bump = (a: number, b: number, x: number): number => (x <= a || x >= b ? 0 : Math.sin(((x - a) / (b - a)) * Math.PI));

function insidePoly(pts: ReadonlyArray<readonly [number, number]>, px: number, py: number): boolean {
  let sign = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const c = (b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0]);
    if (Math.abs(c) < 1e-9) continue;
    const s = c > 0 ? 1 : -1;
    if (sign === 0) sign = s;
    else if (s !== sign) return false;
  }
  return true;
}

/** A shape with straight sides that bulges everywhere, filled pixel by pixel (where `colour` gives null, left as it was). */
function fillPoly(p: Px, pts: ReadonlyArray<readonly [number, number]>, colour: (x: number, y: number) => string | null): void {
  const xs = pts.map((q) => q[0]);
  const ys = pts.map((q) => q[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
    for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
      if (!insidePoly(pts, x + 0.5, y + 0.5)) continue;
      const c = colour(x, y);
      if (c !== null) p.set(x, y, c);
    }
  }
}

/** A line of pixels from a to b, each given by `colour` (k from 0 at a to 1 at b). */
function line(p: Px, ax: number, ay: number, bx: number, by: number, colour: (k: number, x: number, y: number) => string | null): void {
  const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) * 1.4));
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const x = Math.round(ax + (bx - ax) * k - 0.5);
    const y = Math.round(ay + (by - ay) * k - 0.5);
    const c = colour(k, x, y);
    if (c) p.set(x, y, c);
  }
}

/** Lay `top` over `p`. */
function over(p: Px, top: Px): void {
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (top.has(x, y)) p.set(x, y, top.get(x, y) as string);
}

/**
 * A bolt of the seam's light, from (x, y) out `len` pixels the way `ang` (radians on the picture),
 * jagged: white where it leaves, the friend's cyan along it, its deepest at its tip.
 */
function bolt(p: Px, x: number, y: number, ang: number, len: number, seed: number): void {
  const n = 3 + Math.floor(hash(seed, 1, 7) * 2);
  let px = x;
  let py = y;
  const cx = Math.cos(ang);
  const cy = Math.sin(ang);
  for (let i = 1; i <= n; i++) {
    const along = (len * i) / n;
    const off = i === n ? 0 : (hash(seed, i, 9) - 0.5) * len * 0.55;
    const qx = x + cx * along - cy * off;
    const qy = y + cy * along + cx * off;
    const k0 = (i - 1) / n;
    line(p, px, py, qx, qy, (k) => {
      const kk = k0 + k / n;
      return kk < 0.34 ? WHITE : kk < 0.75 ? CYAN[3] : CYAN[2];
    });
    // (a fork off it, now and then)
    if (i === 2 && hash(seed, 3, 13) < 0.45) {
      const fa = ang + (hash(seed, 4, 15) < 0.5 ? -0.9 : 0.9);
      line(p, qx, qy, qx + Math.cos(fa) * len * 0.3, qy + Math.sin(fa) * len * 0.3, (k) => (k < 0.5 ? CYAN[3] : CYAN[2]));
    }
    px = qx;
    py = qy;
  }
}

/** A spark flying off: its head, and a short tail behind it. */
function spark(p: Px, x: number, y: number, dx: number, dy: number, hot: boolean): void {
  p.set(Math.round(x), Math.round(y), hot ? WHITE : CYAN[3]);
  p.set(Math.round(x - dx), Math.round(y - dy), CYAN[2]);
  if (hot) p.set(Math.round(x - 2 * dx), Math.round(y - 2 * dy), CYAN[0]);
}

// =============================================================================================
// THE MELDSTONE

/** Its size, in picture pixels: across its face, up it, and how thick it is. */
const ACROSS = 22;
const UP = 28;
const THICK = 7;

/** The two stones it is made of: an ash-grey one, and a slate like the master rune-stone's, a little lighter (it hangs in the dark). */
export const ASH: Ramp = ['#1c1828', '#1c1828', '#3a3349', '#574d68', '#7a6e8e'];
export const MELD_SLATE: Ramp = ['#16203a', '#16203a', '#2a3d5c', '#3f5f80', '#5a86a6'];
const STONES: readonly [Ramp, Ramp] = [ASH, MELD_SLATE];

/** Its halves' outlines (across and up its face, each -1 to 1), split down its middle; the last edge of each is the seam. */
const HALVES: readonly (readonly (readonly [number, number])[])[] = [
  [[0, -1], [-0.55, -1], [-1, -0.5], [-1, 0.55], [-0.6, 1], [0, 1]],
  [[0, 1], [0.6, 1], [1, 0.5], [1, -0.55], [0.55, -1], [0, -1]],
];

/** The half-runes cut in each half (strokes across and up its face): an ash crescent and bar; a slate bracket and dot. Whole, a third rune. */
const HALF_RUNES: readonly (readonly (readonly [number, number])[][])[] = [
  [
    [[-0.16, 0.76], [-0.42, 0.62], [-0.6, 0.3], [-0.64, 0], [-0.6, -0.3], [-0.42, -0.62], [-0.16, -0.76]],
    [[-0.5, 0.02], [-0.12, 0.02]],
  ],
  [
    [[0.16, 0.8], [0.52, 0.42], [0.52, -0.42], [0.16, -0.8]],
    [[0.3, 0.2], [0.3, -0.16]],
  ],
];

export interface StoneLook {
  /** Turned from facing the eye (degrees) round its upright. */
  yaw: number;
  /** How far its halves stand apart, in picture pixels (0: fused). */
  sep: number;
  /** How bright its seam and runes burn, 0 cold to 1 white-hot. */
  burn: number;
  /** Bolts lashing out of its seam. */
  bolts: number;
  /** Motes going round it. */
  motes: number;
  /** A ring of its light going out round it (0 none; its size else, 0 to 1). */
  ring: number;
  /** Which frame (the crackle's dice, the motes' places). */
  frame: number;
  /** One half only (-1 the ash, 1 the slate), for its halves flying apart; absent, both. */
  only?: -1 | 1;
}

/** Its picture's canvas, in picture pixels, its middle at the middle. */
const SW = 84;
const SH = 84;

/** One picture of the Meldstone (or one of its halves), anchored at its middle. */
export function meldstoneSprite(look: StoneLook): Sprite {
  const { yaw, sep, burn, frame } = look;
  const p = new Px(SW, SH);
  const top = new Px(SW, SH);
  const back = new Px(SW, SH);
  const cx = SW / 2;
  const cy = SH / 2;
  const Y = (yaw * Math.PI) / 180;
  const face: P3 = [Math.cos(Y + Math.PI / 4), Math.sin(Y + Math.PI / 4), 0];
  const across: P3 = [Math.cos(Y - Math.PI / 4), Math.sin(Y - Math.PI / 4), 0];
  const upv: P3 = [0, 0, 1];
  const on = (q: P3): [number, number] => {
    const [x, y] = seen3(q);
    return [cx + x, cy + y];
  };
  /** A point of half `h` (0 ash, 1 slate): across and up its face, through it (k: 1 its face, -1 its back). */
  const at3 = (h: number, i: number, j: number, k: number): P3 =>
    add3(add3(mul3(across, (i * ACROSS) / 2 + (h === 0 ? -sep / 2 : sep / 2)), mul3(upv, (j * UP) / 2)), mul3(face, (k * THICK) / 2));
  const toward = dot3(across, EYE);
  // (which half is the far one: painted first)
  const order = (look.only ? [look.only === -1 ? 0 : 1] : toward > 0 ? [0, 1] : [1, 0]) as number[];
  const lit = (h: number, n: P3, front: boolean): string => {
    const l = dot3(n, LIGHT);
    const tone = front ? (l > 0.75 ? 4 : l > 0.4 ? 3 : 2) : l > 0.6 ? 3 : l > 0.25 ? 2 : 1;
    return STONES[h][tone];
  };
  const seamHot = (x: number, y: number): string => (hash(x, y, frame * 7 + 3) < 0.25 + 0.5 * burn ? CYAN[3] : CYAN[2]);

  // ---- the motes going round it: those behind it first
  const moteAt = (m: number): { x: number; y: number; front: boolean; c: string } => {
    const ph = frame / 24 + m / Math.max(1, look.motes);
    const a = ph * Math.PI * 2;
    const r = 15 + 2 * Math.sin(a * 3 + m);
    const q: P3 = [Math.cos(a) * r, Math.sin(a) * r, 7 * Math.sin(a * 2 + m * 1.7) - 1];
    const [x, y] = on(q);
    return { x: Math.round(x), y: Math.round(y), front: dot3(q, EYE) > 0, c: hash(m, frame, 21) < 0.4 ? WHITE : CYAN[3] };
  };
  for (let m = 0; m < look.motes; m++) {
    const mo = moteAt(m);
    if (!mo.front) back.set(mo.x, mo.y, mo.c);
  }

  // ---- a half: its faces, far to near
  const paintHalf = (h: number): void => {
    const out = HALVES[h];
    const mid = out.reduce((s, q) => [s[0] + q[0] / out.length, s[1] + q[1] / out.length] as [number, number], [0, 0] as [number, number]);
    const midP = at3(h, mid[0], mid[1], 0);
    const faces: { c: P3[]; n: P3; kind: 'front' | 'back' | 'side' | 'seam' }[] = [
      { c: out.map(([i, j]) => at3(h, i, j, 1)), n: face, kind: 'front' },
      { c: [...out].reverse().map(([i, j]) => at3(h, i, j, -1)), n: mul3(face, -1), kind: 'back' },
    ];
    for (let e = 0; e < out.length; e++) {
      const [ai, aj] = out[e];
      const [bi, bj] = out[(e + 1) % out.length];
      const c = [at3(h, ai, aj, -1), at3(h, bi, bj, -1), at3(h, bi, bj, 1), at3(h, ai, aj, 1)];
      const along: P3 = [c[1][0] - c[0][0], c[1][1] - c[0][1], c[1][2] - c[0][2]];
      let n = norm3(cross3(along, face));
      const mE = at3(h, (ai + bi) / 2, (aj + bj) / 2, 0);
      if (dot3(n, [mE[0] - midP[0], mE[1] - midP[1], mE[2] - midP[2]]) < 0) n = mul3(n, -1);
      faces.push({ c, n, kind: e === out.length - 1 ? 'seam' : 'side' });
    }
    const centre = (f: { c: P3[] }): P3 => mul3(f.c.reduce((q, r) => add3(q, r), [0, 0, 0] as P3), 1 / f.c.length);
    const shown = faces.filter((f) => dot3(f.n, EYE) > 0.02).sort((a, b) => dot3(centre(a), EYE) - dot3(centre(b), EYE));
    for (const f of shown) {
      const pts = f.c.map((q) => on(q));
      if (f.kind === 'seam') {
        // (its broken face, where it was fused: the seam's light pours off it when the halves are apart)
        fillPoly(p, pts, (x, y) => (sep > 0.3 || look.only ? seamHot(x, y) : lit(h, f.n, false)));
        continue;
      }
      const front = f.kind === 'front' || f.kind === 'back';
      fillPoly(p, pts, (x, y) => {
        const c = lit(h, f.n, front);
        // (its edges worn: a darker pixel here and there; its faces pitted)
        return hash(x, y, 77 + h) < 0.09 ? STONES[h][Math.max(1, STONES[h].indexOf(c) - 1)] : c;
      });
      if (front) {
        // ITS HALF-RUNE, cut in its face (and its back): cold, dark; its light when it burns
        const k = f.kind === 'front' ? 1.15 : -1.15;
        // (cold it is cut dark; it smoulders the friend's deepest; it burns when the stone strains)
        const heart = burn > 0.92 ? WHITE : burn > 0.8 ? CYAN[3] : burn > 0.62 ? CYAN[2] : burn > 0.2 ? CYAN[0] : STONES[h][0];
        for (const stroke of HALF_RUNES[h]) {
          for (let s = 0; s + 1 < stroke.length; s++) {
            const [ax, ay] = on(at3(h, stroke[s][0], stroke[s][1], k));
            const [bx, by] = on(at3(h, stroke[s + 1][0], stroke[s + 1][1], k));
            line(p, ax, ay, bx, by, (_k, x, y) => (p.has(x, y) ? heart : null));
          }
        }
      }
    }
  };

  // ---- the light between the halves when they are apart: a sheet of it, where they were fused
  const paintSheet = (): void => {
    if (sep <= 0.3 || look.only) return;
    const pts = [at3(0, 0, -0.96, -0.9), at3(0, 0, 0.96, -0.9), at3(0, 0, 0.96, 0.9), at3(0, 0, -0.96, 0.9)].map((q) => {
      // (the middle plane: halfway between the halves)
      const m = add3(q, mul3(across, sep / 2));
      return on(m);
    });
    fillPoly(p, pts, (x, y) => (hash(x, y, frame * 5 + 1) < 0.35 + 0.4 * burn ? WHITE : CYAN[3]));
  };

  for (let n = 0; n < order.length; n++) {
    if (n === 1) paintSheet();
    paintHalf(order[n]);
  }
  if (order.length === 1) paintSheet();

  // ---- its edge of the friend's light all round it (as every friend has: his art rulebook, Pixels 5),
  // so that it stands out from whatever is behind it, dark or bright
  const edge: [number, number][] = [];
  for (let y = 0; y < SH; y++) {
    for (let x = 0; x < SW; x++) {
      if (!p.has(x, y)) continue;
      if (!p.has(x - 1, y) || !p.has(x + 1, y) || !p.has(x, y - 1) || !p.has(x, y + 1)) edge.push([x, y]);
    }
  }
  for (const [x, y] of edge) p.set(x, y, mix(p.get(x, y) as string, CYAN[2], 0.7));

  // ---- the seam, where the halves are fused: a jagged crack of light down its face, crackling
  const seamPts: [number, number][] = [];
  const faceShown = dot3(face, EYE) > 0 ? 1 : -1;
  if (!look.only) {
    const N = 9;
    for (let s = 0; s <= N; s++) {
      const j = -0.95 + (1.9 * s) / N;
      const i = (hash(s, Math.floor(frame / 2), 31) - 0.5) * 0.16;
      // (on the face that is seen; between the halves when they are apart)
      seamPts.push(on(add3(at3(0, i, j, faceShown * 1.05), mul3(across, sep / 2))));
    }
    if (sep <= 0.3) {
      for (let s = 0; s + 1 < seamPts.length; s++) {
        line(top, seamPts[s][0], seamPts[s][1], seamPts[s + 1][0], seamPts[s + 1][1], (_k, x, y) => {
          if (!p.has(x, y)) return null;
          // (its glow either side of it, on the stone)
          for (const dx of [-1, 1]) if (p.has(x + dx, y) && !top.has(x + dx, y)) top.set(x + dx, y, burn > 0.4 ? CYAN[2] : CYAN[0]);
          return hash(x, y, frame * 3 + 11) < 0.2 + 0.6 * burn ? WHITE : CYAN[3];
        });
      }
      // (and over its top)
      const [ax, ay] = on(at3(0, 0, 1, -1));
      const [bx, by] = on(at3(0, 0, 1, 1));
      line(top, ax, ay, bx, by, (_k, x, y) => (p.has(x, y) ? CYAN[3] : null));
    }
  } else {
    // (a half alone: its broken edge is the seam)
    const h = look.only === -1 ? 0 : 1;
    for (let s = 0; s <= 6; s++) seamPts.push(on(at3(h, 0, -0.9 + (1.8 * s) / 6, 0)));
  }

  // ---- bolts lashing out of the seam, and sparks spat off it
  // (the way across the stone, on the picture: out of its seam to either side)
  const [awx, awy] = seen3(across);
  const awl = Math.hypot(awx, awy);
  for (let b = 0; b < look.bolts; b++) {
    const seed = frame * 37 + b * 11 + (look.only ?? 0) * 101;
    const sp = seamPts[Math.floor(hash(seed, 2, 3) * seamPts.length)];
    // (a half alone lashes out of its broken face, toward where the other was; the whole stone, to either side)
    const side = look.only ? -look.only : hash(seed, 5, 5) < 0.5 ? -1 : 1;
    const base = awl > 0.25 ? Math.atan2(awy * side, awx * side) : hash(seed, 12, 12) * Math.PI * 2;
    const ang = base + (hash(seed, 6, 6) - 0.5) * 1.6;
    bolt(top, sp[0], sp[1], ang, 6 + hash(seed, 7, 7) * (6 + 8 * burn), seed);
  }
  if (sep > 0.3 && !look.only) {
    // (bolts across the gap, half to half)
    for (let b = 0; b < 2; b++) {
      const seed = frame * 53 + b * 17;
      const j = (hash(seed, 1, 1) - 0.5) * 1.6;
      const [ax, ay] = on(at3(0, 0, j, faceShown * 0.6));
      const [bx, by] = on(at3(1, 0, j + (hash(seed, 2, 2) - 0.5) * 0.4, faceShown * 0.6));
      const mx = (ax + bx) / 2 + (hash(seed, 3, 3) - 0.5) * 4;
      const my = (ay + by) / 2 + (hash(seed, 4, 4) - 0.5) * 4;
      line(top, ax, ay, mx, my, () => WHITE);
      line(top, mx, my, bx, by, () => CYAN[3]);
    }
  }
  const sparks = Math.round(look.bolts * 1.5);
  for (let s = 0; s < sparks; s++) {
    const seed = frame * 29 + s * 7;
    const sp = seamPts[Math.floor(hash(seed, 8, 8) * seamPts.length)];
    const a = hash(seed, 9, 9) * Math.PI * 2;
    const d = 4 + hash(seed, 10, 10) * 12;
    spark(top, sp[0] + Math.cos(a) * d, sp[1] + Math.sin(a) * d * 0.8, Math.cos(a), Math.sin(a) * 0.8, hash(seed, 11, 11) < 0.5);
  }

  // ---- a ring of its light going out round it
  if (look.ring > 0) {
    const rx = 12 + 22 * look.ring;
    const ry = rx * 0.5;
    const n = Math.round(rx * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      if (hash(i, frame, 41) < 0.25 * look.ring) continue;
      top.set(Math.round(cx + Math.cos(a) * rx), Math.round(cy + 6 + Math.sin(a) * ry), look.ring < 0.5 ? WHITE : CYAN[3]);
    }
  }
  // ---- the motes in front of it
  for (let m = 0; m < look.motes; m++) {
    const mo = moteAt(m);
    if (mo.front) top.set(mo.x, mo.y, mo.c);
  }

  const out = new Px(SW, SH);
  over(out, back);
  over(out, p);
  over(out, top);
  const s = out.sprite(SW / 2, SH / 2, GRAIN);
  // (its light: small and soft, so that it lights what is round it and does not wash out the stone itself)
  const lights: Light[] = [{ x: SW / 2 / GRAIN, y: SH / 2 / GRAIN, r: 6 + 8 * burn + (sep > 0.3 ? 6 : 0), color: CYAN[2], a: 0.1 + 0.22 * burn + (sep > 0.3 ? 0.12 : 0) }];
  s.lights = lights;
  return s;
}

/** A burst of its light (as it slams together): a ring of light and its rays; anchored at its middle. */
function burstSprite(): Sprite {
  const W = 120;
  const H = 72;
  const p = new Px(W, H);
  const cx = W / 2;
  const cy = H / 2;
  for (const [rx, c, gap] of [[54, WHITE, 3], [46, CYAN[3], 2], [38, CYAN[2], 2]] as const) {
    const n = Math.round(rx * 4);
    for (let i = 0; i < n; i++) {
      if (i % gap === 0 && rx < 50) continue;
      const a = (i / n) * Math.PI * 2;
      p.set(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * rx * 0.5), c);
    }
  }
  // (rays out of its middle, long and short)
  for (let r = 0; r < 12; r++) {
    const a = (r / 12) * Math.PI * 2 + 0.13;
    const len = r % 2 === 0 ? 30 : 18;
    line(p, cx + Math.cos(a) * 5, cy + Math.sin(a) * 2.5, cx + Math.cos(a) * len, cy + Math.sin(a) * len * 0.5, (k) => (k < 0.4 ? WHITE : k < 0.8 ? CYAN[3] : CYAN[2]));
  }
  p.rect(cx - 2, cy - 2, 4, 4, WHITE);
  const s = p.sprite(cx, cy, GRAIN);
  s.lights = [{ x: cx / GRAIN, y: cy / GRAIN, r: 44, color: CYAN[2], a: 0.85 }];
  return s;
}

/** The crack of its light in the floor where it will burst up, `k` (0 to 1) of the way open; anchored at the spot. */
function crackSprite(k: number, frame: number): Sprite {
  const W = 64;
  const H = 36;
  const p = new Px(W, H);
  const cx = W / 2;
  const cy = H / 2;
  // (a jagged star of cracks out from the spot, longer as it opens)
  for (let r = 0; r < 5; r++) {
    const a = (r / 5) * Math.PI * 2 + 0.4;
    let x = cx;
    let y = cy;
    const len = (8 + 10 * hash(r, 1, 3)) * k;
    for (let s = 1; s <= 4; s++) {
      const aa = a + (hash(r, s, 5) - 0.5) * 0.9;
      const nx = x + Math.cos(aa) * (len / 4);
      const ny = y + Math.sin(aa) * (len / 4) * 0.5;
      line(p, x, y, nx, ny, () => (s === 1 && k > 0.5 ? WHITE : hash(s, frame, r) < 0.5 ? CYAN[3] : CYAN[2]));
      x = nx;
      y = ny;
    }
  }
  if (k > 0.3) p.rect(cx - 1, cy - 1, 2, 2, WHITE);
  const s = p.sprite(cx, cy, GRAIN);
  s.lights = [{ x: cx / GRAIN, y: cy / GRAIN, r: 6 + 14 * k, color: CYAN[2], a: 0.3 + 0.4 * k }];
  return s;
}

// =============================================================================================
// RUNEDUST

/** Its tones, deepest to the glint. */
const DUST: readonly string[] = [DEEP, '#0f4456', '#176a80', '#2496ac', '#46c4d6', '#8ce8f2'];

/** The three heaps: how far out (lengths) and how high (picture pixels); by how much lies there. */
export const HEAPS: readonly { r: number; h: number }[] = [
  { r: 7, h: 5 },
  { r: 10, h: 7 },
  { r: 13, h: 9.5 },
];
/** Which heap `n` runedust makes. */
export const heapOf = (n: number): number => (n <= 2 ? 0 : n <= 4 ? 1 : 2);

/** Its heap's canvas, in picture pixels, and where the floor point is on it. */
const DW = 72;
const DH = 72;
const DAX = 36;
const DAY = 52;

/** How high the heap is at (a, b) on the floor (lengths from its middle): its rim ragged, its top lumpy. */
function heapZ(a: number, b: number, r: number, h: number): number {
  const th = Math.atan2(b, a);
  const reff = r * (1 + 0.12 * Math.sin(3 * th + 1) + 0.08 * Math.sin(5 * th + 2));
  const rho = Math.hypot(a, b) / reff;
  if (rho >= 1) return -1;
  const lump = 0.5 * Math.sin(a * 0.9 + 1) * Math.sin(b * 1.1 + 2);
  return Math.max(0, h * Math.pow(1 - rho * rho, 1.15) + lump * (1 - rho));
}

/**
 * The heap painted into `p` (its floor point at (ax, ay)), `grow` (0 to 1) of it there; `frame` of its
 * glitter (16 round), and `alive` whether it glitters and breathes (the icon does not).
 */
function paintHeap(p: Px, top: Px, ax: number, ay: number, heap: number, grow: number, frame: number, alive: boolean): void {
  const { r: r0, h: h0 } = HEAPS[heap];
  const r = r0 * (0.4 + 0.6 * grow);
  const h = h0 * grow;
  if (grow <= 0.02) return;
  const breath = 0.5 - 0.5 * Math.cos((frame / 16) * Math.PI * 2);
  const step = 0.3;
  // far to near: what is nearer the eye is painted over what is behind it
  const pts: { a: number; b: number }[] = [];
  for (let a = -r * 1.25; a <= r * 1.25; a += step) for (let b = -r * 1.25; b <= r * 1.25; b += step) pts.push({ a, b });
  pts.sort((u, v) => u.a + u.b - (v.a + v.b));
  for (const { a, b } of pts) {
    const z = heapZ(a, b, r, h);
    if (z < 0) continue;
    const dzda = (heapZ(a + 0.3, b, r, h) - heapZ(a - 0.3, b, r, h)) / 0.6;
    const dzdb = (heapZ(a, b + 0.3, r, h) - heapZ(a, b - 0.3, r, h)) / 0.6;
    const n = norm3([-dzda, -dzdb, 1]);
    const l = dot3(n, LIGHT);
    let tone = l > 0.95 ? 4 : l > 0.85 ? 3 : l > 0.7 ? 2 : l > 0.5 ? 1 : 0;
    if (z < 0.7) tone = Math.min(tone, 1);
    // (grit: grain by grain darker or lighter, and here and there a grain of the light itself)
    const gx = Math.round(a * 1.6);
    const gy = Math.round(b * 1.6);
    const g = hash(gx, gy, 11);
    let c = DUST[tone];
    if (g < 0.16) c = DUST[Math.max(0, tone - 1)];
    else if (g > 0.97 - 0.02 * tone) c = CYAN[3];
    else if (g > 0.86 - 0.03 * tone) c = DUST[Math.min(5, tone + 2)];
    // (breathing: the light inside it swells and ebbs)
    if (alive && breath > 0.55 && tone >= 2 && hash(gx, gy, 12) < 0.3) c = DUST[Math.min(5, tone + 1)];
    const [sx, sy] = seen3([a, b, z]);
    p.set(Math.round(ax + sx - 0.5), Math.round(ay + sy - 0.5), c);
  }
  // (its foot: a dark rim where it meets the floor, below it)
  for (let i = 0; i < 64; i++) {
    const th = (i / 64) * Math.PI * 2;
    const reff = r * (1 + 0.12 * Math.sin(3 * th + 1) + 0.08 * Math.sin(5 * th + 2));
    const [sx, sy] = seen3([Math.cos(th) * reff, Math.sin(th) * reff, 0]);
    const x = Math.round(ax + sx - 0.5);
    const y = Math.round(ay + sy - 0.5);
    if (sy > 0 && !p.has(x, y + 1)) p.set(x, y + 1, DUST[0]);
  }
  // CHIPS OF THE STONE IT WAS GROUND FROM, lying in it, a fleck of each one's rune still lit
  const chips = [1, 2, 4][heap];
  for (let c = 0; c < chips; c++) {
    const th = hash(c, heap, 51) * Math.PI * 2;
    const rr = (c >= 3 ? 1.15 : 0.25 + 0.5 * hash(c, heap, 52)) * r;
    const a = Math.cos(th) * rr;
    const b = Math.sin(th) * rr;
    const z = Math.max(0, heapZ(a, b, r, h));
    const [sx, sy] = seen3([a, b, z]);
    const x = Math.round(ax + sx - 1);
    const y = Math.round(ay + sy - 1);
    p.set(x, y, SLATE[3]).set(x + 1, y, SLATE[4]).set(x + 2, y, SLATE[3]);
    p.set(x, y + 1, SLATE[2]).set(x + 1, y + 1, SLATE[2]).set(x + 2, y + 1, SLATE[1]);
    top.set(x + 1, y, alive && (frame + c * 5) % 16 < 8 ? CYAN[3] : CYAN[2]);
  }
  if (!alive) return;
  // GLINTS: grain after grain catches the light, a star for a moment
  const glints = [6, 9, 13][heap];
  for (let k = 0; k < glints; k++) {
    const ph = Math.floor(hash(k, heap, 61) * 16);
    const f = (frame + ph) % 16;
    if (f > 1) continue;
    const th = hash(k, heap, 62) * Math.PI * 2;
    const rr = Math.sqrt(hash(k, heap, 63)) * 0.85 * r;
    const a = Math.cos(th) * rr;
    const b = Math.sin(th) * rr;
    const z = Math.max(0, heapZ(a, b, r, h));
    const [sx, sy] = seen3([a, b, z]);
    const x = Math.round(ax + sx - 0.5);
    const y = Math.round(ay + sy - 0.5);
    top.set(x, y, WHITE);
    if (f === 0) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) top.set(x + dx, y + dy, CYAN[3]);
  }
}

/** Motes rising off the heap, and now and then a curl of it lifting off its top, turning and falling back. */
function paintBreath(top: Px, ax: number, ay: number, heap: number, frame: number): void {
  const { r, h } = HEAPS[heap];
  const motes = [2, 3, 4][heap];
  for (let m = 0; m < motes; m++) {
    const u = (frame / 16 + hash(m, heap, 71)) % 1;
    if (u > 0.92) continue;
    const th = hash(m, heap, 72) * Math.PI * 2;
    const rr = hash(m, heap, 73) * 0.6 * r;
    const [sx, sy] = seen3([Math.cos(th) * rr, Math.sin(th) * rr, h * 0.7 + u * 26]);
    const x = Math.round(ax + sx + Math.sin(u * 6 + m) * 2.5 - 0.5);
    const y = Math.round(ay + sy - 0.5);
    top.set(x, y, u < 0.3 ? WHITE : u < 0.65 ? CYAN[3] : CYAN[2]);
  }
  // (the curl: six grains spiralling up off its top and falling back, late in each round)
  const ph = frame / 16;
  const k = bump(0.5, 0.98, ph);
  if (k <= 0) return;
  for (let g = 0; g < 6; g++) {
    const a = (g / 6) * Math.PI * 2 + ph * 9;
    const rr = 2 + 4 * k;
    const [sx, sy] = seen3([Math.cos(a) * rr, Math.sin(a) * rr, h + 12 * k * (0.7 + 0.3 * hash(g, 1, 74))]);
    top.set(Math.round(ax + sx - 0.5), Math.round(ay + sy - 0.5), g % 3 === 0 ? WHITE : CYAN[3]);
  }
}

function dustLight(heap: number, k: number): Light[] {
  return [{ x: DAX / GRAIN, y: (DAY - HEAPS[heap].h / 2) / GRAIN, r: 6 + 3 * heap + 4 * k, color: CYAN[2], a: 0.18 + 0.07 * heap + 0.1 * k }];
}

/** A heap of runedust lying, frame `frame` of its 16; anchored at its floor point. */
function heapSprite(heap: number, frame: number): Sprite {
  const p = new Px(DW, DH);
  const top = new Px(DW, DH);
  paintHeap(p, top, DAX, DAY, heap, 1, frame, true);
  paintBreath(top, DAX, DAY, heap, frame);
  over(p, top);
  const s = p.sprite(DAX, DAY, GRAIN);
  s.lights = dustLight(heap, 0.5 - 0.5 * Math.cos((frame / 16) * Math.PI * 2));
  return s;
}

/** Runedust, as it drops: a fountain of it bursting up out of the floor and raining down into its heap, `t` seconds in. */
function spillSprite(heap: number, t: number): Sprite {
  const W = 104;
  const H = 120;
  const ax = W / 2;
  const ay = 100;
  const p = new Px(W, H);
  const top = new Px(W, H);
  const grow = smooth(0.12, 0.62, t);
  paintHeap(p, top, ax, ay, heap, grow, Math.floor(t * 20), grow > 0.9);
  // (the grains: shot up, falling, gone into the heap as they land)
  const G = 30 + 16 * heap;
  const gravity = 430;
  for (let i = 0; i < G; i++) {
    const ti = t - hash(i, 1, 81) * 0.1;
    if (ti <= 0) continue;
    const th = hash(i, 2, 82) * Math.PI * 2;
    const sp = 8 + 30 * hash(i, 3, 83) * (1 + 0.3 * heap);
    const vz = 95 + 70 * hash(i, 4, 84);
    const z = vz * ti - 0.5 * gravity * ti * ti;
    if (z < 0) continue;
    const a = Math.cos(th) * sp * ti;
    const b = Math.sin(th) * sp * ti;
    const [sx, sy] = seen3([a, b, z]);
    const [px, py] = seen3([Math.cos(th) * sp * (ti - 0.02), Math.sin(th) * sp * (ti - 0.02), vz * (ti - 0.02) - 0.5 * gravity * (ti - 0.02) ** 2]);
    const x = Math.round(ax + sx - 0.5);
    const y = Math.round(ay + sy - 0.5);
    top.set(Math.round(ax + px - 0.5), Math.round(ay + py - 0.5), CYAN[2]);
    top.set(x, y, hash(i, 5, 85) < 0.35 ? WHITE : CYAN[3]);
  }
  // (a star of light as it bursts out of the floor)
  if (t < 0.14) {
    const k = 1 - t / 0.14;
    for (let r = 0; r < 8; r++) {
      const a = (r / 8) * Math.PI * 2;
      const len = (r % 2 ? 7 : 12) * (0.5 + 0.5 * k);
      line(top, ax + Math.cos(a) * 2, ay - 4 + Math.sin(a), ax + Math.cos(a) * len, ay - 4 + Math.sin(a) * len * 0.6, (kk) => (kk < 0.5 ? WHITE : CYAN[3]));
    }
    top.rect(ax - 2, ay - 6, 4, 4, WHITE);
  }
  // (and where the grains come down, a puff of it rolling out across the floor)
  const pk = (t - 0.28) / 0.47;
  if (pk > 0 && pk < 1) {
    const rx = (HEAPS[heap].r * 1.15 + 14 * pk) * GRID * 1.4;
    const n = Math.round(rx * 3);
    for (let i = 0; i < n; i++) {
      if (hash(i, Math.floor(t * 30), 86) < 0.35 + 0.5 * pk) continue;
      const a = (i / n) * Math.PI * 2;
      top.set(Math.round(ax + Math.cos(a) * rx), Math.round(ay + Math.sin(a) * rx * 0.5), pk < 0.5 ? CYAN[2] : DUST[1]);
    }
  }
  over(p, top);
  const s = p.sprite(ax, ay, GRAIN);
  s.lights = [{ x: ax / GRAIN, y: (ay - 10) / GRAIN, r: 10 + 3 * heap + 14 * (1 - smooth(0, 0.5, t)), color: CYAN[2], a: 0.3 + 0.4 * (1 - smooth(0, 0.6, t)) }];
  return s;
}

/**
 * Runedust taken: it whirls up off the floor round the hero in a spiral and pours into him, `t`
 * seconds in. Two pictures, anchored at his feet: what goes round behind him, and what goes round in front.
 */
function whirlSprites(t: number): { back: Sprite; front: Sprite } {
  const W = 96;
  const H = 132;
  const ax = W / 2;
  const ay = 112;
  const back = new Px(W, H);
  const front = new Px(W, H);
  const N = 64;
  for (let i = 0; i < N; i++) {
    const d = hash(i, 1, 91) * 0.16;
    const k = Math.max(0, Math.min(1, (t - d) / 0.4));
    if (k <= 0 || k >= 1) continue;
    const at = (kk: number): [number, number, boolean] => {
      const th = hash(i, 2, 92) * Math.PI * 2 + 11 * kk;
      // (out wide round his feet, in tight at his chest: a funnel of it)
      const r = (14 + 22 * hash(i, 3, 93)) * Math.pow(1 - kk, 1.2) + 2.5;
      const z = 2 + 50 * Math.pow(kk, 0.8);
      const [sx, sy] = seen3([Math.cos(th) * r, Math.sin(th) * r, z]);
      return [ax + sx - 0.5, ay + sy - 0.5, Math.cos(th) + Math.sin(th) > 0];
    };
    const [x, y, inFront] = at(k);
    const [px, py] = at(Math.max(0, k - 0.07));
    const [qx, qy] = at(Math.max(0, k - 0.14));
    const p = inFront ? front : back;
    line(p, qx, qy, px, py, () => CYAN[0]);
    line(p, px, py, x, y, () => CYAN[2]);
    p.set(Math.round(x), Math.round(y), k > 0.7 || hash(i, 4, 94) < 0.4 ? WHITE : CYAN[3]);
  }
  // (as the last of it goes in, a flash at his chest)
  const fk = bump(0.4, 0.6, t);
  if (fk > 0) {
    const cy = ay - 46;
    for (let r = 0; r < 8; r++) {
      const a = (r / 8) * Math.PI * 2;
      const len = (r % 2 ? 4 : 8) * fk;
      line(front, ax + Math.cos(a), cy + Math.sin(a), ax + Math.cos(a) * len, cy + Math.sin(a) * len, (kk) => (kk < 0.5 ? WHITE : CYAN[3]));
    }
    front.rect(ax - 1, cy - 1, 2, 2, WHITE);
  }
  const b = back.sprite(ax, ay, GRAIN);
  const f = front.sprite(ax, ay, GRAIN);
  f.lights = [{ x: ax / GRAIN, y: (ay - 24) / GRAIN, r: 14 + 10 * fk, color: CYAN[2], a: 0.35 + 0.35 * fk }];
  return { back: b, front: f };
}

/** The small picture of runedust for the screens (beside the gold, on the wordsmith's melding page): its top left at the top left. */
function dustIcon(): Sprite {
  const p = new Px(DW, DH);
  const top = new Px(DW, DH);
  paintHeap(p, top, DAX, DAY, 1, 1, 0, false);
  // (two grains catching the light, fixed)
  top.set(DAX - 3, DAY - 6, WHITE).set(DAX + 4, DAY - 4, CYAN[4]);
  over(p, top);
  const b = p.bounds();
  if (!b) return p.sprite(0, 0, GRAIN);
  // (cropped to it, an even size so that it sits on whole game pixels)
  const w = b.w + (b.w % 2);
  const h = b.h + (b.h % 2);
  return p.crop(b.x, b.y, Math.min(w, DW - b.x), Math.min(h, DH - b.y)).sprite(0, 0, GRAIN);
}

// =============================================================================================
// Their pictures, as the game holds them

export interface MeldDropsArt {
  /** RUNEDUST lying: by heap (heapOf), 16 frames at DUST_FPS; anchored at its floor point. */
  heap: Sprite[][];
  /** Runedust dropping: by heap, SPILL_FRAMES at 30 a second (SPILL_SECS); anchored at its floor point. */
  spill: Sprite[][];
  /** Runedust taken: WHIRL_FRAMES at 30 a second (WHIRL_SECS), behind the hero and in front; anchored at his feet. */
  whirl: { back: Sprite; front: Sprite }[];
  /** Runedust, small, for the screens: its top left at its anchor. */
  icon: Sprite;
  /** THE MELDSTONE hanging in the air: STONE_FRAMES at STONE_FPS; anchored at its middle. */
  stone: Sprite[];
  /** Spinning round (STONE_SPIN steps of its turn), its halves torn apart and blazing, and fused. */
  spinApart: Sprite[];
  spinWhole: Sprite[];
  /** Its two halves alone, each turned in STONE_SPIN steps: [ash, slate]. */
  halves: [Sprite[], Sprite[]];
  /** Carried: a small picture of it for the screen (anchored at its middle). */
  carried: Sprite;
  /** A burst of its light, as its halves slam together (anchored at its middle). */
  burst: Sprite;
  /** The crack of its light in the floor before it bursts up: CRACK_STEPS, from shut to open. */
  crack: Sprite[];
  /** Its light on the floor under it, where it hangs (nothing to see but the light; anchored at the floor point). */
  pool: Sprite;
}

export const DUST_FPS = 10;
export const SPILL_SECS = 0.75;
export const SPILL_FRAMES = Math.round(SPILL_SECS * 30);
export const WHIRL_SECS = 0.6;
export const WHIRL_FRAMES = Math.round(WHIRL_SECS * 30);
export const STONE_FRAMES = 24;
export const STONE_FPS = 12;
export const STONE_SPIN = 16;
export const CRACK_STEPS = 6;

/** The Meldstone hanging, frame `f` of its round (2 s): its look. Every round its halves strain apart and snap back. */
export function standingLook(f: number): StoneLook {
  const ph = f / STONE_FRAMES;
  const strain = bump(0.5, 0.8, ph);
  const snap = ph >= 0.79 && ph < 0.88 ? 1 - (ph - 0.79) / 0.09 : 0;
  return {
    yaw: 30 * Math.sin(ph * Math.PI * 2),
    sep: 2.4 * strain,
    burn: Math.min(1, 0.5 + 0.5 * strain + 0.5 * snap + 0.06 * Math.sin(ph * Math.PI * 8)),
    bolts: 1 + Math.round(3 * strain) + (snap > 0 ? 2 : 0) + (hash(f, 1, 3) < 0.3 ? 1 : 0),
    motes: 3,
    ring: snap > 0 ? 1 - snap : 0,
    frame: f,
  };
}

export function makeMeldDropsArt(): MeldDropsArt {
  return {
    heap: [0, 1, 2].map((h) => lazyFrames(16, (f) => heapSprite(h, f))),
    spill: [0, 1, 2].map((h) => lazyFrames(SPILL_FRAMES, (k) => spillSprite(h, k / 30))),
    whirl: (() => {
      const out: { back: Sprite; front: Sprite }[] = [];
      let made: { back: Sprite; front: Sprite }[] | null = null;
      for (let k = 0; k < WHIRL_FRAMES; k++) {
        Object.defineProperty(out, k, {
          get: () => {
            made ??= Array.from({ length: WHIRL_FRAMES }, (_, i) => whirlSprites(i / 30));
            return made[k];
          },
          enumerable: true,
        });
      }
      return out;
    })(),
    icon: dustIcon(),
    stone: lazyFrames(STONE_FRAMES, (f) => meldstoneSprite(standingLook(f))),
    spinApart: lazyFrames(STONE_SPIN, (k) => meldstoneSprite({ yaw: (360 * k) / STONE_SPIN, sep: 6, burn: 1, bolts: 4, motes: 0, ring: 0, frame: k + 40 })),
    spinWhole: lazyFrames(STONE_SPIN, (k) => meldstoneSprite({ yaw: (360 * k) / STONE_SPIN, sep: 0, burn: 0.9, bolts: 2, motes: 0, ring: 0, frame: k + 60 })),
    halves: [
      lazyFrames(STONE_SPIN, (k) => meldstoneSprite({ yaw: (360 * k) / STONE_SPIN, sep: 0, burn: 1, bolts: 2, motes: 0, ring: 0, frame: k + 80, only: -1 })),
      lazyFrames(STONE_SPIN, (k) => meldstoneSprite({ yaw: (360 * k) / STONE_SPIN, sep: 0, burn: 1, bolts: 2, motes: 0, ring: 0, frame: k + 100, only: 1 })),
    ],
    carried: meldstoneSprite({ yaw: -14, sep: 0, burn: 0.8, bolts: 0, motes: 0, ring: 0, frame: 0 }),
    burst: burstSprite(),
    crack: lazyFrames(CRACK_STEPS, (k) => crackSprite((k + 1) / CRACK_STEPS, k)),
    pool: (() => {
      const s = new Px(2, 2).sprite(1, 1, GRAIN);
      s.lights = [{ x: 0.5, y: 0.5, r: 16, color: CYAN[2], a: 0.4 }];
      return s;
    })(),
  };
}

/** The spin step for a turn of `yaw` degrees. */
export const spinStep = (yaw: number): number => ((Math.round((yaw / 360) * STONE_SPIN) % STONE_SPIN) + STONE_SPIN) % STONE_SPIN;
