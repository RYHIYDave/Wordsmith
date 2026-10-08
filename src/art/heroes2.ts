// The heroes at twice the detail. Each frame is a 64x80 canvas anchored at (32, 72): the floor
// point between the feet. One pixel here is half a pixel of the first-generation art in
// heroes.ts, so a figure covers the same space on screen with four times as many pixels in it.
//
// As before, every frame faces screen-RIGHT (the renderer mirrors for screen-left), "front" faces
// the camera and "back" faces away, and a frame is painted from a Pose by one rig function. What
// is new is how the parts are painted:
//   - Solid forms (helm, shoulder plates, limbs, tabard) are filled as shapes and then shaded by
//     `lit`, which finds each pixel's distance to the lit (upper-left) and the shaded (lower-right)
//     edge of its shape and picks one of five tones. Every part is lit the same way, so the
//     figure reads as one solid object.
//   - Round metal (the helm, the shield boss) is shaded as a ball, with a highlight.
//   - The sword and shield are painted in their own frame of reference, so they stay crisp at
//     any angle.
//   - Small things that need a hand (the face, the plume, buckles) are still character maps.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { P } from './palette';
import type { ActorArt, AnimSet } from './actor_types';

const W = 64;
const H = 80;
/** Anchor: the floor point between the feet. */
const AX = 32;
const AY = 72;

/** Tones of one material, dark to light. */
type Ramp = readonly [string, string, string, string, string];
const STEEL: Ramp = [P.sl1, P.sl2, P.sl3, P.sl4, P.sl5];
const RED: Ramp = [P.bl1, P.bl2, P.bl3, P.bl4, P.bl5];
const WOOD: Ramp = [P.wd1, P.wd2, P.wd3, P.wd4, P.wd5];
const GOLD: Ramp = [P.gd1, P.gd2, P.gd3, P.gd4, P.gd5];
const MAIL: Ramp = [P.sl1, P.sl1, P.sl2, P.sl3, P.sl4];

// ---------------------------------------------------------------------------------------------
// Pose (in pixels of this art: twice the numbers of heroes.ts)

interface Pose {
  /** Upper body pushed down this many pixels (breathing, footfalls). The feet stay put. */
  bob: number;
  /** Upper body pushed toward screen-right (+) or left (-). */
  lean: number;
  /** Stride of the foot nearer the camera: + forward, - back. */
  near: number;
  /** Stride of the foot further from the camera. */
  far: number;
  /** Pixels the near / far foot is raised off the floor. */
  nearLift: number;
  farLift: number;
  /** Arm swing of a walk: + weapon arm forward, - back. */
  swing: number;
  /** Weapon hand, as an offset from where it rests. */
  hx: number;
  hy: number;
  /** Direction the weapon points, in degrees: 0 = forward (screen-right), 90 = straight up. */
  aim: number;
  /** Shield: 0 at rest, 1 raised, -1 swung down and back. */
  off: number;
  /** Front view only: draw the weapon behind the body (a sword raised behind the head). */
  behind: boolean;
}

const REST: Pose = { bob: 0, lean: 0, near: 0, far: 0, nearLift: 0, farLift: 0, swing: 0, hx: 0, hy: 0, aim: 90, off: 0, behind: false };

/** A walk in four steps: contact, passing, contact on the other foot, passing. */
const GAIT: ReadonlyArray<Partial<Pose>> = [
  { bob: 2, near: 3, far: -3, swing: 2 },
  { bob: 0, farLift: 4, swing: 0 },
  { bob: 2, near: -3, far: 3, swing: -2 },
  { bob: 0, nearLift: 4, swing: 0 },
];

// ---------------------------------------------------------------------------------------------
// Painting helpers

function layer(): Px {
  return new Px(W, H);
}

/** Stack layers bottom to top. Each one is outlined first so overlapping parts stay separate. */
function stack(layers: ReadonlyArray<Px>): Px {
  const out = layer();
  for (const l of layers) out.blit(l.outline(P.ink), 0, 0);
  return out;
}

/**
 * Paint a shape with `paint` (any colour), then shade it: pixels near its upper-left edge get the
 * light tones, pixels near its lower-right edge the dark ones. `hi` and `lo` say how deep the
 * light and the shade reach: [rim, band] in pixels. A rim of 0 leaves out the brightest/darkest tone.
 */
function lit(dst: Px, ramp: Ramp, hi: readonly [number, number], lo: readonly [number, number], paint: (l: Px) => void): void {
  const l = layer();
  paint(l);
  // distance (in diagonal steps, up to `max`) to the edge of the shape, toward (-1,-1) or (+1,+1)
  const reach = (x: number, y: number, step: number, max: number): number => {
    for (let k = 1; k <= max; k++) {
      // the edge counts if the diagonal neighbour, or both side neighbours, are empty
      if (!l.has(x + step * k, y + step * k)) return k;
      if (!l.has(x + step * k, y + step * (k - 1)) && !l.has(x + step * (k - 1), y + step * k)) return k;
    }
    return max + 1;
  };
  l.each((x, y) => {
    const a = reach(x, y, -1, hi[1]);
    const b = reach(x, y, 1, lo[1]);
    if (a <= hi[0] && b > lo[0]) return ramp[4];
    if (b <= lo[0]) return ramp[0];
    if (a <= hi[1] && b > lo[1]) return ramp[3];
    if (b <= lo[1] && a > hi[1]) return ramp[1];
    return ramp[2];
  });
  dst.blit(l, 0, 0);
}

// Light comes from the upper left, a little toward the viewer.
const LX = -0.52;
const LY = -0.62;
const LZ = 0.59;

/** A ball of metal (or anything round): five tones and a highlight. */
function ball(p: Px, cx: number, cy: number, rx: number, ry: number, ramp: Ramp): void {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const nx = (x + 0.5 - cx) / rx;
      const ny = (y + 0.5 - cy) / ry;
      const d2 = nx * nx + ny * ny;
      if (d2 > 1) continue;
      const nz = Math.sqrt(1 - d2);
      const i = nx * LX + ny * LY + nz * LZ;
      p.set(x, y, ramp[i > 0.9 ? 4 : i > 0.62 ? 3 : i > 0.22 ? 2 : i > -0.2 ? 1 : 0]);
    }
  }
}

/** A limb: a thick line that tapers from radius r0 to r1, shaded across its width. */
function limb(p: Px, x0: number, y0: number, x1: number, y1: number, r0: number, r1: number, ramp: Ramp, texture = false): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len2 = dx * dx + dy * dy || 1;
  const rMax = Math.max(r0, r1) + 1;
  for (let y = Math.floor(Math.min(y0, y1) - rMax); y <= Math.ceil(Math.max(y0, y1) + rMax); y++) {
    for (let x = Math.floor(Math.min(x0, x1) - rMax); x <= Math.ceil(Math.max(x0, x1) + rMax); x++) {
      const t = Math.max(0, Math.min(1, ((x + 0.5 - x0) * dx + (y + 0.5 - y0) * dy) / len2));
      const ax = x0 + dx * t;
      const ay = y0 + dy * t;
      const r = r0 + (r1 - r0) * t;
      const ox = x + 0.5 - ax;
      const oy = y + 0.5 - ay;
      if (ox * ox + oy * oy > r * r) continue;
      // how far toward the light this pixel sits across the limb, -1 .. 1
      const s = (ox * LX + oy * LY) / (r * 0.81);
      let tone = s > 0.5 ? 3 : s < -0.45 ? 1 : 2;
      // chain mail: rows of darker links
      if (texture && x % 2 === 0 && y % 2 === 0) tone = Math.max(0, tone - 1);
      p.set(x, y, ramp[tone]);
    }
  }
}

type Key = Readonly<Record<string, string>>;

const KEY: Key = {
  // steel
  A: P.sl5,
  B: P.sl4,
  C: P.sl3,
  D: P.sl2,
  E: P.sl1,
  // crimson
  T: P.bl5,
  R: P.bl4,
  r: P.bl3,
  q: P.bl2,
  Q: P.bl1,
  // leather and wood
  M: P.wd5,
  L: P.wd4,
  l: P.wd3,
  w: P.wd2,
  V: P.wd1,
  // gold
  G: P.gd5,
  Y: P.gd4,
  y: P.gd3,
  z: P.gd2,
  Z: P.gd1,
  // skin
  K: P.sk4,
  k: P.sk3,
  j: P.sk2,
  J: P.sk1,
  // eyes and lines
  e: P.ink,
  X: P.white,
};

/** Paint a hand-drawn pixel map with its top-left corner at (x, y). '.' leaves a pixel alone. */
function stamp(p: Px, x: number, y: number, rows: ReadonlyArray<string>): void {
  for (let j = 0; j < rows.length; j++) {
    const row = rows[j];
    for (let i = 0; i < row.length; i++) {
      const c = KEY[row.charAt(i)];
      if (c) p.set(x + i, y + j, c);
    }
  }
}

/** Unit step for an angle in degrees: 0 = screen-right, 90 = up. */
function dir(deg: number): [number, number] {
  const r = (deg * Math.PI) / 180;
  return [Math.cos(r), -Math.sin(r)];
}

// ---------------------------------------------------------------------------------------------
// Warrior: stocky, steel helm with a crimson plume, shoulder plates over a crimson tabard, mail
// sleeves and leggings, sword and round shield.

/** Heights above the floor, in pixels. */
const HIP = 14;
const BELT = 21;
const SHOULDER = 31;
const CHIN = 33;

// The face inside the helm's opening, 11 wide: brows, eyes with a glint, nose, mouth, chin.
const FACE_FRONT = [
  'JJJJJJJJJJJ',
  'jJJkkkJJkjJ',
  'kXekKkXekjJ',
  'keekKkeekjJ',
  'KKkkKKkkkjJ',
  '.kKkJJJkjJ.',
  '..jkkkkjJ..',
  '...jjjjJ...',
];

// The plume: crimson feathers rising from the crown and falling back.
const PLUME = [
  '.....TRRr...',
  '...TRRRRRr..',
  '..TRRRrrrrq.',
  '.TRRrrrrrrq.',
  '.RRrrqrrrqqQ',
  'TRrrq.qrrqQ.',
  'Rrrq...qqQ..',
  'rrq.........',
  'rq..........',
];

/** One leg: mail from the hip, a plate at the knee, a greave, and a leather boot whose toe points screen-right. */
function leg(p: Px, hipX: number, sole: number, stride: number, far: boolean): void {
  const top = AY - HIP;
  const rows = sole - top;
  const steel: Ramp = far ? [P.sl1, P.sl1, P.sl2, P.sl3, P.sl4] : STEEL;
  const boot: Ramp = far ? [P.wd1, P.wd1, P.wd2, P.wd3, P.wd4] : WOOD;
  const xAt = (y: number): number => hipX + Math.round((stride * (y - top)) / rows);
  // mail leggings down to the knee
  lit(p, far ? [P.sl1, P.sl1, P.sl1, P.sl2, P.sl3] : MAIL, [0, 2], [1, 2], (l) => {
    for (let y = top; y <= sole - 8; y++) l.rect(xAt(y), y, 6, 1, P.ink);
  });
  for (let y = top; y <= sole - 8; y++) {
    for (let x = xAt(y); x < xAt(y) + 6; x++) if (x % 2 === 0 && y % 2 === 0 && p.get(x, y) !== steel[0]) p.set(x, y, far ? P.sl1 : P.sl2);
  }
  // greave: a plate over the shin, with the knee cop a pixel wider
  lit(p, steel, [1, 2], [1, 2], (l) => {
    for (let y = sole - 9; y <= sole - 4; y++) {
      const knee = y <= sole - 8;
      l.rect(xAt(y) - (knee ? 1 : 0), y, knee ? 8 : 6, 1, P.ink);
    }
  });
  // boot: cuff, upper, and a toe that reaches forward
  lit(p, boot, [0, 2], [1, 2], (l) => {
    for (let y = sole - 3; y <= sole; y++) {
      const x = xAt(y);
      l.rect(x - (y === sole - 3 ? 1 : 0), y, y === sole - 3 ? 8 : y >= sole - 1 ? 9 : 6, 1, P.ink);
    }
  });
  p.hline(xAt(sole), sole, 9, boot[0]); // the sole
}

/** Both legs. They do not lean or bob: the feet are what the anchor is measured from. */
function legs(p: Px, q: Pose, back: boolean): void {
  const left = AX - 8;
  const right = AX + 1;
  // The foot nearer the camera stands lower on screen. Facing the camera that is the screen-left
  // foot; facing away it is the screen-right one.
  const nearX = back ? right : left;
  const farX = back ? left : right;
  const slope = back ? -1 : 1; // a step forward goes down the screen when facing the camera
  leg(p, farX, AY - 3 + slope * Math.sign(q.far) * 2 - q.farLift, q.far, true);
  leg(p, nearX, AY - 1 + slope * Math.sign(q.near) * 2 - q.nearLift, q.near, false);
}

/** The tabard's skirt below the belt: it flares, splits at the front, and sways with the stride. */
function skirt(p: Px, X: number, Y: number, sway: number, back: boolean): void {
  const top = AY - BELT + 3 + Y;
  const bottom = AY - HIP + 5 + Y;
  lit(p, RED, [0, 2], [1, 3], (l) => {
    for (let y = top; y <= bottom; y++) {
      const t = (y - top) / (bottom - top);
      const half = 8 + Math.round(t * 2);
      const shift = Math.round(sway * t);
      l.rect(X - half + shift, y, half * 2, 1, P.ink);
    }
  });
  // folds: darker lines that fan out toward the hem
  for (let y = top + 1; y <= bottom; y++) {
    const t = (y - top) / (bottom - top);
    const shift = Math.round(sway * t);
    for (const f of [-5, 4]) p.set(X + Math.round(f * (1 + t * 0.25)) + shift, y, P.bl2);
    if (!back && y >= top + 2) p.set(X - 1 + shift, y, P.bl1); // the split
  }
  // hem: a band of gold trim
  const hemShift = Math.round(sway);
  for (let x = X - 10 + hemShift; x < X + 10 + hemShift; x++) {
    if (p.has(x, bottom)) p.set(x, bottom, x < X - 3 + hemShift ? P.gd3 : x < X + 5 + hemShift ? P.gd2 : P.gd1);
  }
}

/** Chest and belt, facing the camera. */
function chestFront(p: Px, X: number, Y: number): void {
  const top = AY - SHOULDER + Y;
  const belt = AY - BELT + Y;
  // mail at the neck and under the arms
  lit(p, MAIL, [0, 2], [1, 2], (l) => l.rect(X - 4, top - 3, 9, 4, P.ink));
  // the tabard
  lit(p, RED, [1, 3], [1, 3], (l) => {
    for (let y = top; y < belt; y++) {
      const half = y < top + 2 ? 8 : y < belt - 3 ? 9 : 8;
      l.rect(X - half, y, half * 2, 1, P.ink);
    }
  });
  // neckline: a gold-trimmed V
  for (let k = 0; k < 4; k++) {
    p.set(X - 4 + k, top + k, P.gd3).set(X + 3 - k, top + k, P.gd2);
    for (let x = X - 3 + k; x <= X + 2 - k; x++) p.set(x, top + k, x % 2 === 0 && (top + k) % 2 === 0 ? P.sl1 : P.sl2);
  }
  // emblem: an open book in gold thread
  stamp(p, X - 3, top + 5, ['YGyzYYy', 'YYyzYyy', 'yyzZyyz']);
  // belt and buckle
  p.rect(X - 8, belt, 16, 3, P.wd3);
  p.hline(X - 8, belt, 16, P.wd4).hline(X - 8, belt + 2, 16, P.wd2);
  p.rect(X + 5, belt, 3, 3, P.wd2);
  stamp(p, X - 2, belt, ['GYy', 'YVz', 'yzZ']);
}

/** Back and belt, facing away. */
function chestBack(p: Px, X: number, Y: number): void {
  const top = AY - SHOULDER + Y;
  const belt = AY - BELT + Y;
  lit(p, MAIL, [0, 2], [1, 2], (l) => l.rect(X - 4, top - 3, 9, 4, P.ink));
  lit(p, RED, [1, 3], [1, 3], (l) => {
    for (let y = top; y < belt; y++) {
      const half = y < top + 2 ? 8 : y < belt - 3 ? 9 : 8;
      l.rect(X - half, y, half * 2, 1, P.ink);
    }
  });
  // the seam down the back
  p.vline(X, top + 1, belt - top - 1, P.bl2);
  p.rect(X - 8, belt, 16, 3, P.wd3);
  p.hline(X - 8, belt, 16, P.wd4).hline(X - 8, belt + 2, 16, P.wd2);
}

/** A shoulder plate: a rounded cap of steel with a darker lip. */
function pauldron(p: Px, cx: number, cy: number, far: boolean): void {
  ball(p, cx, cy, far ? 4.5 : 5.5, far ? 4 : 4.5, far ? [P.sl1, P.sl1, P.sl2, P.sl3, P.sl4] : STEEL);
  // lip
  const half = far ? 4 : 5;
  for (let x = -half; x < half; x++) p.set(Math.round(cx) + x, Math.round(cy + (far ? 3 : 4)), x < 0 ? P.sl2 : P.sl1);
}

/** The helm, facing the camera or away, with its plume. */
function helm(p: Px, X: number, Y: number, back: boolean): void {
  const cx = X + (back ? 0.5 : -0.5);
  const cy = AY - CHIN - 9 + Y;
  // plume first, so the crown overlaps its root
  stamp(p, Math.round(cx) - 13, Math.round(cy) - 14, PLUME);
  ball(p, cx, cy, 9, 9, STEEL);
  // a ridge over the crown
  for (let k = 0; k < 8; k++) {
    const y = Math.round(cy) - 9 + k;
    const x = Math.round(cx) - 1 - Math.round(k * 0.2);
    if (p.has(x, y)) p.set(x, y, P.sl5);
    if (p.has(x + 1, y)) p.set(x + 1, y, k < 5 ? P.sl4 : P.sl3);
  }
  // brow band: gold, two rows, following the helm's shading
  const by = Math.round(cy) - 1;
  for (let y = by; y <= by + 1; y++) {
    for (let x = 0; x < W; x++) {
      const c = p.get(x, y);
      if (c === null) continue;
      const i = STEEL.indexOf(c);
      if (i >= 0) p.set(x, y, GOLD[Math.max(0, i - (y === by + 1 ? 1 : 0))]);
    }
  }
  if (back) {
    // neck guard: the helm's skirt flares over the collar
    lit(p, STEEL, [0, 2], [1, 2], (l) => {
      for (let k = 0; k < 4; k++) l.rect(Math.round(cx) - 8 - (k > 1 ? 1 : 0), Math.round(cy) + 6 + k, 16 + (k > 1 ? 2 : 0), 1, P.ink);
    });
    return;
  }
  // the opening: face, nasal bar, and the cheek pieces left as steel either side
  stamp(p, Math.round(cx) - 3, by + 2, FACE_FRONT);
  // far cheek piece in shade
  for (let k = 0; k < 5; k++) p.set(Math.round(cx) + 8 - (k > 3 ? 1 : 0), by + 2 + k, P.sl1);
}

/** A sword held at (hx, hy), pointing along `deg`: blade, cross-guard, grip and pommel, and the gauntlet. */
function sword(p: Px, hx: number, hy: number, deg: number): void {
  const [dx, dy] = dir(deg);
  // which side of the blade faces the light
  const litSide = 0.65 * dy - 0.75 * dx > 0 ? 1 : -1;
  const reach = 24;
  for (let y = Math.floor(hy - reach); y <= Math.ceil(hy + reach); y++) {
    for (let x = Math.floor(hx - reach); x <= Math.ceil(hx + reach); x++) {
      const rx = x + 0.5 - hx;
      const ry = y + 0.5 - hy;
      const u = rx * dx + ry * dy; // along the blade, from the hand
      const v = (-rx * dy + ry * dx) * litSide; // across it, positive toward the light
      let c: string | null = null;
      if (u >= 4 && u <= 21) {
        const half = u > 17.5 ? (21 - u) * 0.57 : 2;
        if (Math.abs(v) <= half) c = v > 0.7 ? P.sl5 : v < -0.7 ? P.sl3 : P.sl4;
        if (c && Math.abs(v) < 0.5 && u < 15) c = P.sl3; // the fuller
      } else if (u >= 2.2 && u < 4 && Math.abs(v) <= 4.6) {
        c = v > 1.5 ? P.gd4 : v < -2.5 ? P.gd1 : u < 3 ? P.gd2 : P.gd3;
      } else if (u >= -2.6 && u < 2.2 && Math.abs(v) <= 1.3) {
        c = Math.floor(u + 3) % 2 === 0 ? P.wd3 : P.wd2;
      } else if (u >= -4.8 && u < -2.6 && Math.abs(v) <= 1.9) {
        c = v > 0.4 ? P.gd4 : v < -0.9 ? P.gd1 : P.gd3;
      }
      if (c) p.set(x, y, c);
    }
  }
}

/** The gauntlet that holds the sword: a steel cuff and a leather fist. */
function gauntlet(p: Px, hx: number, hy: number): void {
  const x = Math.round(hx) - 2;
  const y = Math.round(hy) - 2;
  p.rect(x, y, 4, 4, P.wd3);
  p.hline(x, y, 3, P.wd5).vline(x, y, 3, P.wd4);
  p.hline(x + 1, y + 3, 3, P.wd2).vline(x + 3, y + 1, 3, P.wd2);
  p.set(x + 1, y + 1, P.wd4);
}

/** A round wooden shield, 17 px across: iron rim with rivets, planks, an iron band, and a boss. */
function roundShield(p: Px, cx: number, cy: number): void {
  const r = 8.5;
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const ox = x + 0.5 - cx;
      const oy = y + 0.5 - cy;
      const d = Math.hypot(ox, oy);
      if (d > r) continue;
      const side = (ox * LX + oy * LY) / r; // toward the light: positive
      if (d > r - 1.9) {
        p.set(x, y, side > 0.55 ? P.sl5 : side > 0.2 ? P.sl4 : side > -0.35 ? P.sl3 : side > -0.7 ? P.sl2 : P.sl1);
      } else {
        // planks run up and down; seams every four pixels
        const seam = ((Math.floor(ox) % 4) + 4) % 4 === 0;
        const tone = side > 0.45 ? 4 : side > 0.05 ? 3 : side > -0.45 ? 2 : 1;
        p.set(x, y, seam ? WOOD[Math.max(0, tone - 2)] : WOOD[tone]);
      }
    }
  }
  // an iron band across the middle
  for (let x = Math.floor(cx - r + 2); x <= Math.ceil(cx + r - 3); x++) {
    p.set(x, Math.round(cy) - 1, P.sl4).set(x, Math.round(cy), P.sl2);
  }
  // rivets round the rim
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + 0.4;
    const x = Math.floor(cx + Math.cos(a) * (r - 1));
    const y = Math.floor(cy + Math.sin(a) * (r - 1));
    p.set(x, y, P.sl5);
  }
  ball(p, cx, cy - 0.5, 3, 3, STEEL);
}

function warrior(q: Pose, back: boolean): Px {
  const X = AX + q.lean; // body centre line
  const Y = q.bob;
  const fwd = back ? -q.swing : q.swing;
  const shoulderY = AY - SHOULDER + Y;

  // Sword hand, just outside the shoulder plate.
  const hx = X + 13 + q.hx + fwd;
  const hy = AY - 26 + Y + q.hy;
  const aim = q.aim + fwd * 2; // the blade rocks a little with the stride

  const weapon = layer();
  sword(weapon, hx, hy, aim);

  const body = layer();
  const swordArm = (): void => {
    // upper arm in mail, forearm in plate
    const ex = (X + 10 + hx) / 2 + (hy < shoulderY ? 2 : 1);
    const ey = (shoulderY + 3 + hy) / 2 + (hy < shoulderY ? 0 : 2);
    limb(body, X + 10, shoulderY + 3, ex, ey, 3, 2.6, MAIL, true);
    limb(body, ex, ey, hx, hy, 2.6, 2.2, STEEL);
  };
  // facing the camera, the sword arm is the far one: it goes behind the chest
  if (!back) swordArm();
  legs(body, q, back);
  skirt(body, X, Y, -fwd, back);
  // shield arm: mail sleeve hanging at the side, a gloved fist at the end of it
  limb(body, X - 10, shoulderY + 3, X - 11, shoulderY + 10, 3, 2.6, MAIL, true);
  gauntlet(body, X - 11, shoulderY + 13);
  if (back) chestBack(body, X, Y);
  else chestFront(body, X, Y);
  pauldron(body, X + 10.5, shoulderY + 1.5, !back);
  pauldron(body, X - 10, shoulderY + 1.5, back);
  if (back) {
    // facing away, the sword arm is the near one: over the chest
    swordArm();
    gauntlet(body, hx, hy);
  }
  helm(body, X, Y, back);

  const hand = layer();
  if (!back) gauntlet(hand, hx, hy);

  // Facing the camera the shield is on the near arm; facing away it is slung across the back.
  const shield = layer();
  if (back) roundShield(shield, X - 3, AY - 26 + Y);
  else roundShield(shield, X - 11 - fwd + q.off * 2, AY - 25 + Y - q.off * 4);

  if (back) return stack([weapon, body, shield]);
  return stack(q.behind ? [weapon, hand, body, shield] : [body, weapon, hand, shield]);
}

// ---------------------------------------------------------------------------------------------

type Rig = (q: Pose, back: boolean) => Px;

function animSet(rig: Rig, back: boolean, rest: Partial<Pose>, attack: ReadonlyArray<Partial<Pose>>): AnimSet {
  const frame = (o: Partial<Pose>): Sprite => rig({ ...REST, ...rest, ...o }, back).sprite(AX, AY);
  return {
    idle: [frame({}), frame({ bob: 1 })],
    walk: GAIT.map(frame),
    attack: attack.map(frame),
  };
}

/** The warrior at twice the detail. */
export function makeWarrior2Art(): ActorArt {
  return {
    // A big forward slash: sword raised behind the head, swung fully forward, then low.
    front: animSet(warrior, false, { aim: 70 }, [
      { lean: -2, hx: -2, hy: -20, aim: 108, off: 1, behind: true },
      { bob: 2, near: 3, hx: 0, hy: -7, aim: -35, off: -1 },
      { bob: 2, near: 3, hy: 2, aim: -65 },
    ]),
    back: animSet(warrior, true, { aim: 72 }, [
      { lean: -2, hx: -2, hy: -20, aim: 108 },
      { bob: 2, near: 3, hx: -4, hy: -10, aim: 42 },
      { bob: 2, near: 3, hx: -4, hy: 0, aim: -55 },
    ]),
  };
}
