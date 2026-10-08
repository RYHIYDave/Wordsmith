// Concept art, not part of the game: ten different looks for the mage, all in the colours of the
// chosen art style (NEON, "Bold and modern"), for the owner to choose from. Same toolkit and the
// same finish as styles.ts / styles_cast.ts: flat tones, no black outlines, magic that glows.

import { Px, mix } from '../engine/px';
import { LOOKS, ball, finish, hash, limb, stamp } from './styles';
import type { Look, Ramp } from './styles';

/** The canvas every option is painted on (a little roomier than the style sheet's), and its floor point. */
export const OW = 96;
export const OH = 112;
export const OAX = 48;
export const OAY = 104;

/** The chosen style: the last look. */
const N = LOOKS[LOOKS.length - 1] as Look;
const INK = N.ink;
const AY = OAY;

// --- the palette of style 6, plus a few neighbours mixed from it ---
const ROBE: Ramp = ['#3a1a7a', '#3a1a7a', '#7a3ae0', '#b890ff', '#b890ff'];
const SPARK: Ramp = ['#0c6a80', '#0c6a80', '#22d0e0', '#b8fff8', '#ffffff'];
const MAGENTA = N.cloth;
const TEAL = N.cloak;
const STEEL = N.steel;
const PLUM = N.leather;
const WOOD = N.wood;
const CYAN = N.brass;
const MAIL = N.mail;
const BONE = N.bone;
/** A face under a hat or hood: in shadow. */
const SKIN: Ramp = [N.skin[0], N.skin[0], N.skin[1], N.skin[2], N.skin[3]];
/** A bare face. */
const FACE: Ramp = [N.skin[0], N.skin[1], N.skin[2], N.skin[2], N.skin[3]];

function dim(r: Ramp): Ramp {
  return [r[0], r[0], r[1], r[2], r[3]];
}
function blend(a: Ramp, b: Ramp, t: number): Ramp {
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t), mix(a[3], b[3], t), mix(a[4], b[4], t)];
}
/** Blue-violet: the robe's purple pulled toward the palette's indigo. */
const DUSK = blend(ROBE, WOOD, 0.45);

/** A light a figure gives off, in its own canvas: the sheet adds the glow. */
export interface Light {
  x: number;
  y: number;
  r: number;
  color: string;
}
export const OPTION_LIGHTS = new WeakMap<Px, Light[]>();

type Pt = readonly [number, number];

// ---------------------------------------------------------------------------------------------
// Helpers (the same ideas as styles.ts, on this file's canvas)

function layer(): Px {
  return new Px(OW, OH);
}

/** Paint a shape, then shade it by how near each pixel is to its lit (upper-left) and shaded (lower-right) edge. */
function lit(dst: Px, ramp: Ramp, paint: (l: Px) => void, hi: readonly [number, number] = N.hi, lo: readonly [number, number] = N.lo): void {
  const l = layer();
  paint(l);
  const reach = (x: number, y: number, step: number, max: number): number => {
    for (let k = 1; k <= max; k++) {
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

/** Stack the layers (each edged in the look's ink, which melts into the deep blue), then the glowing bits on top. */
function compose(layers: ReadonlyArray<Px>, over: Px, lights: Light[]): Px {
  const out = layer();
  for (const l of layers) out.blit(l.outline(INK), 0, 0);
  const done = finish(out, N);
  done.blit(over, 0, 0);
  OPTION_LIGHTS.set(done, lights);
  return done;
}

interface Fr {
  X: number;
  B: number;
  hip: number;
  shoulderY: number;
  beltY: number;
  hipY: number;
  chinY: number;
  cx: number;
  cy: number;
  R: number;
  /** The middle of the face, turned a little toward screen-right. */
  fx: number;
}

/** The heights a standing figure is hung from (as in styles_cast.ts). */
function frame(X: number, scale: number, R: number = N.headR): Fr {
  const B = Math.round(N.bodyH * scale);
  const hip = Math.round(B * N.legs);
  const belt = hip + Math.max(4, Math.round((B - hip) * 0.36));
  const cx = X - 0.5;
  return { X, B, hip, shoulderY: AY - (B - 2), beltY: AY - belt, hipY: AY - hip, chinY: AY - B, cx, cy: AY - B - R + 1, R, fx: Math.round(cx) + 1 };
}

function inEllipse(cx: number, cy: number, rx: number, ry: number): [number, number][] {
  const out: [number, number][] = [];
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) out.push([x, y]);
    }
  }
  return out;
}

/** A tapering stroke along a curve through four control points (for scarves, hair, hat points). */
function bez(l: Px, P: readonly [Pt, Pt, Pt, Pt], r0: number, r1: number): void {
  for (let k = 0; k <= 60; k++) {
    const t = k / 60;
    const a = (1 - t) ** 3;
    const b = 3 * (1 - t) ** 2 * t;
    const c = 3 * (1 - t) * t ** 2;
    const d = t ** 3;
    const x = a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0];
    const y = a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1];
    const r = r0 + (r1 - r0) * t;
    l.ellipse(x, y, r, r, INK);
  }
}

/** A gown: from the shoulders in to the waist, then out to the hem. Returns its half width at each height. */
function gown(p: Px, ramp: Ramp, X: number, top: number, waistY: number, hem: number, c: number, w: number, flare: number, pow = 0.8, folds: ReadonlyArray<number> = [-0.6, 0.45]): (y: number) => number {
  const half = (y: number): number =>
    y <= waistY ? c + (w - c) * ((y - top) / Math.max(1, waistY - top)) : w + (flare - w) * ((y - waistY) / Math.max(1, hem - waistY)) ** pow;
  lit(
    p,
    ramp,
    (l) => {
      for (let y = top; y <= hem; y++) {
        const h = half(y);
        l.rect(Math.round(X - h), y, Math.round(X + h) - Math.round(X - h), 1, INK);
      }
    },
    N.hi,
    [N.lo[0], N.lo[1] + 1],
  );
  for (let y = waistY + 4; y <= hem; y++) {
    for (const f of folds) {
      const x = Math.round(X + f * half(y));
      if (p.has(x, y) && hash(x, y, 31) > 0.2) p.set(x, y, ramp[1]);
    }
  }
  return half;
}

/** Turn one row of a garment into glowing trim. */
function band(p: Px, ramp: Ramp, y: number, X: number, every = 1): void {
  for (let x = 0; x < OW; x++) {
    const c = p.get(x, y);
    if (c !== null && ramp.includes(c) && x % every === 0) p.set(x, y, CYAN[x < X ? 3 : 2]);
  }
}

/** Glowing trim along the lowest pixel of every column of a shape. */
function hemTrim(p: Px, X: number): void {
  for (let x = 0; x < OW; x++) {
    for (let y = OH - 1; y >= 0; y--) {
      if (p.has(x, y)) {
        p.set(x, y, CYAN[x < X ? 3 : 2]);
        break;
      }
    }
  }
}

/** A belt with a buckle. */
function belt(p: Px, X: number, y: number, half: number, strap: Ramp): void {
  const x0 = Math.round(X - half);
  const w = Math.round(half * 2);
  p.rect(x0, y, w, 3, strap[2]);
  p.hline(x0, y, w, strap[3]).hline(x0, y + 2, w, strap[1]);
  stamp(p, X - 2, y, ['GYy', 'YVz', 'yzZ'], { G: CYAN[4], Y: CYAN[3], y: CYAN[2], z: CYAN[1], Z: CYAN[0], V: strap[0] });
}

/** A leg in hose with a boot or shoe; the toe points to screen-right. */
function leg(p: Px, hipX: number, sole: number, len: number, w: number, far: boolean, hose: Ramp, bootShare: number, boot: Ramp = PLUM): void {
  const top = sole - len;
  const bootTop = sole - Math.round(len * bootShare);
  const b = far ? dim(boot) : boot;
  lit(p, far ? dim(hose) : hose, (l) => l.rect(hipX, top, w, bootTop - top + 1, INK), [0, 2], [1, 2]);
  lit(
    p,
    b,
    (l) => {
      for (let y = bootTop; y <= sole; y++) {
        const cuff = bootShare > 0.3 && y <= bootTop + 1;
        l.rect(hipX - (cuff ? 1 : 0), y, cuff ? w + 2 : y >= sole - 1 ? w + 3 : w, 1, INK);
      }
    },
    [0, 2],
    [1, 2],
  );
  p.hline(hipX, sole, w + 3, b[0]);
}

/** A hand (or a glove, given a ramp). */
function fist(p: Px, x: number, y: number, ramp: Ramp = SKIN): void {
  const x0 = Math.round(x) - 2;
  const y0 = Math.round(y) - 2;
  p.rect(x0, y0, 4, 4, ramp[3]);
  p.hline(x0, y0, 3, ramp[4]).vline(x0 + 3, y0 + 1, 3, ramp[2]).hline(x0, y0 + 3, 3, ramp[2]);
}

/** A staff's pole, two pixels wide. */
function pole(p: Px, x: number, top: number, bottom: number, ramp: Ramp = WOOD): void {
  for (let y = top; y <= bottom; y++) p.set(x, y, ramp[y % 7 === 0 ? 2 : 3]).set(x + 1, y, ramp[1]);
}

/** A point of light with four short rays. */
function sparkle(p: Px, x: number, y: number, big = false): void {
  p.set(x - 1, y, SPARK[3]).set(x + 1, y, SPARK[3]).set(x, y - 1, SPARK[3]).set(x, y + 1, SPARK[3]);
  if (big) p.set(x - 2, y, SPARK[2]).set(x + 2, y, SPARK[2]).set(x, y - 2, SPARK[2]).set(x, y + 2, SPARK[2]);
  p.set(x, y, '#ffffff');
}

/** A wand: a pale stick with a dark grip, and a light at its tip. */
function wand(p: Px, over: Px, x0: number, y0: number, x1: number, y1: number, lights: Light[], r = 18): void {
  p.line(x0, y0, x1, y1, BONE[3]);
  const tx = Math.round(x1);
  const ty = Math.round(y1);
  ball(over, tx + 0.5, ty + 0.5, 1.7, 1.7, SPARK);
  sparkle(over, tx, ty);
  lights.push({ x: tx + 0.5, y: ty + 0.5, r, color: SPARK[3] });
}

/** A cut crystal: a tall diamond, lit on its upper-left faces. */
function crystal(p: Px, cx: number, cy: number, hw: number, hh: number): void {
  for (let y = Math.floor(cy - hh); y <= Math.ceil(cy + hh); y++) {
    for (let x = Math.floor(cx - hw); x <= Math.ceil(cx + hw); x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (Math.abs(dx) / hw + Math.abs(dy) / hh > 1) continue;
      p.set(x, y, dx < 0 ? (dy < 0 ? '#ffffff' : SPARK[3]) : dy < 0 ? SPARK[3] : SPARK[2]);
    }
  }
}

/** The dark where the eyes are, and two glints in it. */
function eyes(p: Px, cx: number, cy: number, R: number, top: number, rows: number, fx: number, gy: number): void {
  for (const [x, y] of inEllipse(cx, cy, R, R)) if (y >= top && y < top + rows) p.set(x, y, N.eye);
  p.set(fx - 2, gy, N.glint).set(fx + 1, gy, N.glint);
}

/** Hair over the top of a head, down to (not including) row `below`. */
function hairCap(p: Px, ramp: Ramp, cx: number, cy: number, R: number, below: number): void {
  lit(p, ramp, (l) => {
    for (const [x, y] of inEllipse(cx, cy - 0.4, R + 0.8, R + 0.8)) if (y < below) l.set(x, y, INK);
  });
}

// ---------------------------------------------------------------------------------------------
// 1. The Don: an academic gown hanging open over a waistcoat, a mortarboard, a pointed little
// beard, and the wand held up like a conductor's baton.

function don(): Px {
  const f = frame(48, 1);
  const { X, shoulderY, beltY, hipY, cx, cy, R, fx } = f;
  const hem = AY - 8;
  const lights: Light[] = [];
  const body = layer();
  const arm = layer();
  const over = layer();

  // trousers and shoes
  leg(body, X + 1, AY - 3, f.hip - 2, 4, true, MAIL, 0.16);
  leg(body, X - 5, AY - 1, f.hip, 4, false, MAIL, 0.16);
  // waistcoat, shirt front, bow tie, buttons
  lit(body, TEAL, (l) => {
    for (let y = shoulderY; y <= hipY + 2; y++) {
      const h = 6.5 - Math.min(1.5, (y - shoulderY) * 0.12);
      l.rect(Math.round(X - h), y, Math.round(h * 2), 1, INK);
    }
  });
  body.rect(X - 2, shoulderY, 4, 4, BONE[3]);
  stamp(body, X - 3, shoulderY + 1, ['Mm..mM', 'MMmmMM', 'Mm..mM'], { M: MAGENTA[2], m: MAGENTA[3] });
  for (let k = 0; k < 4; k++) body.set(X, shoulderY + 6 + k * 3, CYAN[3]);

  // the gown: two wide panels that hang open, edged with light
  const t01 = (y: number): number => Math.max(0, (y - shoulderY) / (hem - shoulderY));
  const gh = (y: number): number => 9 + 4.5 * t01(y) ** 0.9;
  const gq = (y: number): number => 2.5 + 3 * t01(y);
  lit(
    body,
    ROBE,
    (l) => {
      for (let y = shoulderY - 1; y <= hem; y++) {
        const h = gh(y);
        const q = gq(y);
        l.rect(Math.round(X - h), y, Math.round(X - q) - Math.round(X - h), 1, INK);
        l.rect(Math.round(X + q), y, Math.round(X + h) - Math.round(X + q), 1, INK);
      }
    },
    N.hi,
    [0, 4],
  );
  for (let y = shoulderY; y <= hem; y++) {
    const q = gq(y);
    body.set(Math.round(X - q) - 1, y, CYAN[2]).set(Math.round(X + q), y, CYAN[2]);
  }

  // the far arm hangs in its long bag of a sleeve; the hand holds a small book against the hip
  lit(body, dim(ROBE), (l) =>
    l.poly(
      [
        [X + 7, shoulderY],
        [X + 13, shoulderY + 3],
        [X + 16, beltY + 2],
        [X + 14, hipY + 7],
        [X + 11, hipY + 9],
        [X + 9, beltY + 2],
      ],
      INK,
    ),
  );
  lit(body, MAGENTA, (l) => l.rect(X + 6, beltY + 1, 6, 8, INK));
  body.vline(X + 11, beltY + 2, 6, BONE[3]);
  body.set(X + 8, beltY + 4, CYAN[3]).set(X + 8, beltY + 5, CYAN[2]);
  fist(body, X + 9, beltY + 9);

  // the head: a shadowed face, grey at the temples, a moustache and a pointed beard
  ball(body, cx, cy, R, R, FACE);
  eyes(body, cx, cy, R, cy - 1, 2, fx, cy);
  body.rect(Math.round(cx - R), cy - 2, 2, 4, PLUM[2]).rect(Math.round(cx + R) - 2, cy - 2, 2, 4, PLUM[1]);
  stamp(body, fx - 3, cy + 3, ['GG.Ggg', '.GGGg.', '..GGg.', '..GGg.', '...G..'], { G: PLUM[2], g: PLUM[1] });
  // the mortarboard: a cap, and a flat board on top of it with a tassel
  lit(body, dim(ROBE), (l) => {
    for (const [x, y] of inEllipse(cx, cy, R + 0.7, R + 0.7)) if (y < cy - 2) l.set(x, y, INK);
  });
  const bx = cx + 0.5;
  const by = cy - R - 0.5;
  body.poly([[bx - 12, by + 1.5], [bx - 1, by - 3], [bx + 12, by + 0.5], [bx + 1, by + 5]], ROBE[0]);
  body.poly([[bx - 12, by + 0.5], [bx - 1, by - 4], [bx + 12, by - 0.5], [bx + 1, by + 4]], ROBE[3]);
  body.poly([[bx + 1, by - 3.2], [bx + 12, by - 0.5], [bx + 1, by + 4]], ROBE[2]);
  const tx = Math.round(bx);
  const ty = Math.round(by);
  body.line(tx, ty, tx + 8, ty + 1, CYAN[3]);
  body.vline(tx + 8, ty + 1, 6, CYAN[2]);
  body.rect(tx + 7, ty + 7, 3, 2, CYAN[3]);
  body.set(tx, ty, '#ffffff');

  // the near arm is raised: the sleeve hangs from it like a wing
  lit(arm, ROBE, (l) =>
    l.poly(
      [
        [X - 8, shoulderY],
        [X - 16, shoulderY - 3],
        [X - 20, shoulderY - 1],
        [X - 17, shoulderY + 16],
        [X - 13, shoulderY + 19],
        [X - 8, shoulderY + 9],
      ],
      INK,
    ),
  );
  limb(arm, X - 8, shoulderY + 3, X - 14, shoulderY + 5, 2.8, 2.8, ROBE);
  limb(arm, X - 14, shoulderY + 5, X - 17, shoulderY - 3, 2.8, 2.6, ROBE);
  fist(arm, X - 17, shoulderY - 6);
  wand(arm, over, X - 18, shoulderY - 8, X - 24, shoulderY - 20, lights, 20);

  return compose([body, arm], over, lights);
}

// ---------------------------------------------------------------------------------------------
// 2. Wide brim, long scarf: a traveller's hat wider than the shoulders, a scarf up to the eyes with
// one end flying, a long coat, a satchel of books, and a staff that cradles a cut crystal.

function wanderer(): Px {
  const f = frame(46, 1);
  const { X, shoulderY, beltY, chinY, cx, cy, R, fx } = f;
  const hem = AY - 6;
  const lights: Light[] = [];
  const staff = layer();
  const body = layer();
  const hand = layer();
  const over = layer();

  // the staff: a fork that holds a crystal
  const sx = X + 16;
  const ky = chinY - 25;
  pole(staff, sx, ky + 9, AY - 2);
  for (const [dx, dy, t] of [[-1, 8, 3], [-2, 7, 3], [-3, 6, 3], [-3, 5, 3], [-3, 4, 3], [2, 8, 1], [3, 7, 1], [4, 6, 1], [4, 5, 1], [4, 4, 1]] as const) staff.set(sx + dx, ky + dy, WOOD[t]);
  crystal(over, sx + 1, ky, 3, 6);
  lights.push({ x: sx + 1, y: ky, r: 26, color: SPARK[3] });

  // boots under the coat
  leg(body, X + 1, AY - 3, 8, 4, true, MAIL, 0.95);
  leg(body, X - 5, AY - 1, 9, 4, false, MAIL, 0.95);
  // the far arm reaches to the staff
  const hy = beltY - 8;
  limb(body, X + 6.5, shoulderY + 3, X + 11.5, hy + 5, 2.6, 2.9, dim(ROBE));
  limb(body, X + 11.5, hy + 5, sx - 1, hy + 1, 2.9, 3.3, dim(ROBE));
  // a long coat
  gown(body, ROBE, X, shoulderY, beltY, hem, 8, 6.5, 10.5, 1);
  for (let y = shoulderY + 6; y <= hem; y++) body.set(X + 1, y, ROBE[1]);
  for (let k = 0; k < 4; k++) body.set(X - 1, beltY + 6 + k * 5, CYAN[3]);
  band(body, ROBE, hem - 1, X);
  belt(body, X, beltY, 6.5, dim(PLUM));
  // a satchel on a strap, and the near hand resting on it
  for (let k = 0; k <= 22; k++) {
    const t = k / 22;
    const x = Math.round(X + 5 - 13 * t);
    const y = Math.round(shoulderY + 1 + (beltY + 5 - shoulderY) * t);
    if (body.has(x, y)) body.set(x, y, PLUM[1]).set(x, y + 1, PLUM[2]);
  }
  lit(body, PLUM, (l) => l.rect(X - 14, beltY + 6, 9, 8, INK));
  body.hline(X - 14, beltY + 9, 9, PLUM[1]);
  body.set(X - 10, beltY + 10, CYAN[3]).set(X - 10, beltY + 11, CYAN[2]);
  limb(body, X - 8, shoulderY + 3, X - 10, beltY + 1, 2.6, 2.9, ROBE);
  fist(body, X - 10, beltY + 4, PLUM);

  // the head: all that shows is a strip of shadow between brim and scarf
  ball(body, cx, cy, R, R, SKIN, 0.1);
  eyes(body, cx, cy, R, cy - 2, 5, fx, cy);
  // the scarf: round the neck and over the chin, one end down the front, one flying
  lit(body, TEAL, (l) => {
    l.ellipse(cx + 0.5, chinY + 0.5, 7, 3.7, INK);
    l.rect(X + 1, chinY + 2, 4, 15, INK);
    bez(l, [[X - 4, chinY + 1], [X - 11, chinY - 4], [X - 16, chinY + 5], [X - 24, chinY - 1]], 2.4, 1.6);
  });
  for (let x = X + 1; x <= X + 4; x += 2) body.set(x, chinY + 17, CYAN[2]).set(x, chinY + 18, CYAN[2]);
  body.set(X - 26, chinY - 3, CYAN[2]).set(X - 27, chinY - 1, CYAN[2]).set(X - 26, chinY + 1, CYAN[2]);
  // the hat: a low flat crown with a feather in its band, and a brim wider than the shoulders
  lit(body, CYAN, (l) => bez(l, [[cx + 4, cy - 8], [cx + 8, cy - 14], [cx + 12, cy - 17], [cx + 16, cy - 13]], 1.5, 0.8));
  lit(body, ROBE, (l) =>
    l.poly(
      [
        [cx - 6, cy - 5],
        [cx - 5.5, cy - 11],
        [cx - 3, cy - 12.5],
        [cx + 4, cy - 11.5],
        [cx + 6, cy - 10],
        [cx + 6, cy - 5],
      ],
      INK,
    ),
  );
  band(body, ROBE, cy - 7, X);
  band(body, ROBE, cy - 8, X);
  lit(body, ROBE, (l) => l.ellipse(cx, cy - 4, 18, 3, INK));

  fist(hand, sx + 0.5, hy);
  return compose([staff, body, hand], over, lights);
}

// ---------------------------------------------------------------------------------------------
// 3. The small apprentice: a child in a hand-me-down robe that pools on the floor, sleeves past the
// hands, a huge hat that has flopped over, and a wand with a star on it.

function apprentice(): Px {
  const R = 6.5;
  const f = frame(46, 0.64, R);
  const { X, shoulderY, beltY, cx, cy, fx } = f;
  const lights: Light[] = [];
  const body = layer();
  const arm = layer();
  const over = layer();

  const half = (y: number): number => 6 + 5.5 * Math.max(0, (y - shoulderY) / (AY - shoulderY)) ** 0.8;
  lit(
    body,
    ROBE,
    (l) => {
      for (let y = shoulderY; y <= AY - 1; y++) {
        const h = half(y);
        l.rect(Math.round(X - h), y, Math.round(h * 2), 1, INK);
      }
      l.ellipse(X - 1, AY - 1.5, 14.5, 2.8, INK); // it pools on the floor
    },
    N.hi,
    [0, 4],
  );
  for (let y = beltY + 3; y <= AY - 3; y++) {
    for (const k of [-0.55, 0.4]) {
      const x = Math.round(X + k * half(y));
      if (hash(x, y, 31) > 0.2) body.set(x, y, ROBE[1]);
    }
  }
  band(body, ROBE, AY - 4, X);
  // a sash, tied, one end hanging; and a patch
  body.rect(X - 7, beltY, 14, 2, MAGENTA[2]);
  body.hline(X - 7, beltY, 14, MAGENTA[3]);
  body.rect(X + 2, beltY + 2, 2, 6, MAGENTA[2]);
  stamp(body, X - 6, beltY + 7, ['TTT', 'TtT', 'TTT'], { T: TEAL[3], t: TEAL[2] });
  // the near sleeve hangs well past the hand
  limb(body, X - 6, shoulderY + 3, X - 10, beltY + 2, 2.8, 3.4, ROBE);
  limb(body, X - 10, beltY + 2, X - 11.5, beltY + 9, 3.4, 2.2, ROBE);

  // the head: big cheeks under a brim that sits on the nose
  ball(body, cx, cy, R, R, FACE);
  const gy = Math.round(cy) + 1;
  eyes(body, cx, cy, R, gy - 2, 4, fx, gy);
  body.set(fx - 4, gy + 3, MAGENTA[3]).set(fx + 3, gy + 3, MAGENTA[3]);
  body.set(fx - 1, gy + 4, N.skin[0]).set(fx, gy + 4, N.skin[0]);
  // the hat: far too big, the point flopped over, a star on the end
  lit(body, ROBE, (l) => bez(l, [[cx, cy - 7], [cx - 3, cy - 19], [cx + 5, cy - 28], [cx + 13, cy - 20]], 7, 1.3));
  for (const dy of [5, 6]) {
    for (let x = 0; x < OW; x++) {
      const c = body.get(x, Math.round(cy) - dy);
      if (c !== null && ROBE.includes(c)) body.set(x, Math.round(cy) - dy, c === ROBE[3] ? MAGENTA[3] : MAGENTA[2]);
    }
  }
  lit(body, ROBE, (l) => l.ellipse(cx, cy - 2, 13.5, 3, INK));
  for (const [dx, dy] of [[-2, -11], [1, -17], [-3, -15], [6, -22]] as const) body.set(Math.round(cx) + dx, Math.round(cy) + dy, CYAN[3]);
  ball(over, cx + 13.5, cy - 18, 1.8, 1.8, SPARK);

  // the far arm holds the wand up
  limb(arm, X + 6, shoulderY + 3, X + 11, shoulderY + 2, 2.8, 3.2, dim(ROBE));
  limb(arm, X + 11, shoulderY + 2, X + 13, shoulderY - 4, 3.2, 3.6, dim(ROBE));
  fist(arm, X + 13.5, shoulderY - 8);
  arm.line(X + 14, shoulderY - 10, X + 17, shoulderY - 20, BONE[3]);
  stamp(over, X + 15, shoulderY - 25, ['..C..', 'CCWCC', '.CWC.', '.C.C.'], { C: SPARK[3], W: '#ffffff' });
  sparkle(over, X + 22, shoulderY - 27);
  over.set(X + 12, shoulderY - 28, SPARK[2]).set(X + 21, shoulderY - 19, SPARK[2]);
  lights.push({ x: X + 17.5, y: shoulderY - 23, r: 20, color: SPARK[3] });

  return compose([body, arm], over, lights);
}

// ---------------------------------------------------------------------------------------------
// 4. The scholar: hair in a bun with a quill through it, glowing spectacles, a high-waisted dress,
// a hand on her hip, and a book that floats open beside her at the point of her wand.

function scholar(): Px {
  const f = frame(41, 0.98);
  const { X, shoulderY, chinY, cx, cy, R, fx } = f;
  const hem = AY - 1;
  const wy = shoulderY + 9;
  const lights: Light[] = [];
  const body = layer();
  const book = layer();
  const over = layer();

  // the far arm, raised toward the book
  limb(body, X + 5.5, shoulderY + 3, X + 10, wy - 1, 2.4, 2.3, dim(ROBE));
  limb(body, X + 10, wy - 1, X + 13, shoulderY + 2, 2.3, 2.1, dim(ROBE));
  fist(body, X + 13.5, shoulderY);
  wand(body, over, X + 14, shoulderY - 2, X + 17, shoulderY - 6, lights, 10);

  // the dress
  gown(body, ROBE, X, shoulderY, wy, hem, 6.5, 4.5, 12, 0.7, [-0.55, 0.1, 0.6]);
  band(body, ROBE, hem - 2, X);
  band(body, ROBE, hem - 5, X, 2);
  body.rect(Math.round(X - 4.5), wy, 9, 2, CYAN[2]);
  body.hline(Math.round(X - 4.5), wy, 9, CYAN[3]);
  // a pale collar with a brooch
  body.poly([[X - 4, shoulderY - 1], [X + 5, shoulderY - 1], [X + 0.5, shoulderY + 5]], BONE[3]);
  body.poly([[X + 0.5, shoulderY - 1], [X + 5, shoulderY - 1], [X + 0.5, shoulderY + 5]], BONE[2]);
  body.set(X, shoulderY + 1, MAGENTA[2]);
  // puffed shoulders; the near arm akimbo, hand on hip
  ball(body, X + 6.5, shoulderY + 2.5, 3, 2.8, dim(ROBE));
  ball(body, X - 7, shoulderY + 2.5, 3.4, 3.1, ROBE);
  limb(body, X - 7.5, shoulderY + 4, X - 13, wy + 2, 2.3, 2.1, ROBE);
  limb(body, X - 13, wy + 2, X - 6.5, wy + 6, 2.1, 1.9, ROBE);
  fist(body, X - 5.5, wy + 6.5);

  // the head
  body.rect(X - 2, chinY - 1, 3, 3, N.skin[1]);
  ball(body, cx, cy, R, R, FACE);
  // the quill, then the bun over its middle
  body.line(Math.round(cx) - 6, cy - R, Math.round(cx) + 6, cy - R - 7, BONE[3]);
  body.set(Math.round(cx) + 7, cy - R - 8, CYAN[3]).set(Math.round(cx) + 7, cy - R - 7, BONE[3]);
  ball(body, cx + 0.5, cy - R - 2.2, 3.7, 3.4, PLUM);
  hairCap(body, PLUM, cx, cy, R, cy - 1);
  lit(body, PLUM, (l) => {
    l.rect(Math.round(cx - R - 0.8), cy - 2, 2, 7, INK);
    l.rect(Math.round(cx + R - 1.2), cy - 2, 2, 6, INK);
  });
  // spectacles: two lit lenses in the shadow under her fringe
  eyes(body, cx, cy, R, cy - 1, 3, fx, cy);
  for (const lx of [fx - 3, fx + 1]) {
    body.rect(lx, cy - 1, 2, 2, CYAN[2]);
    body.set(lx, cy - 1, '#ffffff');
  }
  body.set(fx - 1, cy - 1, BONE[3]).set(fx, cy - 1, BONE[3]);
  body.set(fx - 1, cy + 4, N.skin[0]).set(fx, cy + 4, N.skin[0]);

  // the book: open, facing us, its lines of text alight
  const bx = X + 15;
  const by = chinY - 15;
  stamp(
    book,
    bx,
    by,
    ['.WWWWWW.WWWWWW.', 'WWWWWWWsWWWWWWw', 'WWcccWWsWcccWWw', 'WWWWWWWsWWWWWWw', 'WWccccWsWccWWWw', 'WWWWWWWsWWWWWWw', 'MMMMMMMmMMMMMMM'],
    { W: BONE[3], w: BONE[2], s: BONE[2], c: CYAN[2], M: MAGENTA[2], m: MAGENTA[0] },
  );
  sparkle(over, bx + 4, by - 4);
  over.set(bx + 11, by - 3, SPARK[3]).set(bx + 8, by - 7, SPARK[2]).set(bx + 13, by - 6, SPARK[2]);
  lights.push({ x: bx + 7.5, y: by + 3, r: 24, color: SPARK[3] });

  return compose([body, book], over, lights);
}

// ---------------------------------------------------------------------------------------------
// 5. The hooded astronomer: a teal cloak scattered with stars over the purple robe, a deep hood
// whose point trails behind, a rolled chart, and a tall staff with a star on top.

function astronomer(): Px {
  const f = frame(52, 1.02);
  const { X, shoulderY, beltY, chinY, cx, cy, R } = f;
  const hem = AY - 1;
  const lights: Light[] = [];
  const staff = layer();
  const body = layer();
  const hand = layer();
  const over = layer();

  const sx = X - 18;
  const sy = chinY - 21;
  pole(staff, sx, sy + 5, AY - 1);
  stamp(
    over,
    sx - 3,
    sy - 4,
    ['....W....', '....C....', '...CCC...', 'WCCCWCCCW', '.CCWWWCC.', '..CCWCC..', '..cCCCc..', '.ccc.ccc.', '.c.....c.'],
    { W: '#ffffff', C: SPARK[3], c: SPARK[2] },
  );
  over.set(sx + 6, sy - 7, SPARK[2]).set(sx + 7, sy - 3, SPARK[2]);
  lights.push({ x: sx + 1.5, y: sy, r: 26, color: SPARK[3] });

  // the robe
  gown(body, ROBE, X, shoulderY, beltY, hem, 7, 6, 9.5, 1);
  band(body, ROBE, hem - 2, X);
  // the cloak: wide, open down the front, its hem cut into points
  const cTop = shoulderY - 2;
  const cBot = hem - 10;
  const ch = (y: number): number => 8.5 + 7.5 * ((y - cTop) / (cBot - cTop)) ** 0.85;
  const cq = (y: number): number => 1.5 + 4.5 * ((y - cTop) / (cBot - cTop));
  lit(
    body,
    TEAL,
    (l) => {
      for (let y = cTop; y <= cBot; y++) {
        const h = ch(y);
        const q = cq(y);
        for (let x = Math.round(X - h); x < Math.round(X + h); x++) {
          if (x >= Math.round(X - q) && x < Math.round(X + q)) continue;
          if (y > cBot - ((((x - X) % 6) + 6) % 6 < 3 ? 0 : 2)) continue;
          l.set(x, y, INK);
        }
      }
    },
    N.hi,
    [0, 4],
  );
  for (let y = shoulderY + 3; y <= cBot - 2; y++) {
    const q = cq(y);
    body.set(Math.round(X - q) - 1, y, CYAN[2]).set(Math.round(X + q), y, CYAN[2]);
  }
  for (const [dx, dy] of [[-8, 12], [-12, 22], [-6, 27], [8, 13], [12, 24], [7, 30], [-11, 33], [11, 34], [-7, 19]] as const) {
    if (body.has(X + dx, cTop + dy)) body.set(X + dx, cTop + dy, CYAN[3]);
  }
  sparkle(body, X + 10, cTop + 19);
  sparkle(body, X - 10, cTop + 28);

  // a crescent clasp at the throat
  stamp(body, X - 2, shoulderY + 3, ['.CC.', 'C...', 'C...', '.CC.'], { C: CYAN[3] });
  // the near arm comes out from under the cloak to the staff
  const hy = beltY - 9;
  limb(body, X - 8, shoulderY + 5, X - 12.5, beltY - 3, 2.8, 3, ROBE);
  limb(body, X - 12.5, beltY - 3, sx + 3, hy + 1, 3, 3.3, ROBE);

  // the hood: its point trails back, and the mantle spreads onto the shoulders
  const hr = R + 1.8;
  lit(body, TEAL, (l) => {
    bez(l, [[cx + 2, cy - hr + 2], [cx + 9, cy - hr - 4], [cx + 13, cy - hr + 2], [cx + 13, cy + 5]], 3.2, 1);
    for (let y = Math.round(cy + hr * 0.5); y <= shoulderY + 3; y++) {
      const t = (y - (cy + hr * 0.5)) / Math.max(1, shoulderY + 3 - (cy + hr * 0.5));
      const h = hr * 0.8 + (9.5 - hr * 0.8) * t;
      l.rect(Math.round(X - h), y, Math.round(h * 2), 1, INK);
    }
  });
  ball(body, cx, cy, hr, hr, TEAL);
  const ox = cx - hr * 0.18;
  const oy = cy + hr * 0.18;
  const open = inEllipse(ox, oy, hr * 0.62, hr * 0.7);
  for (const [x, y] of open) body.set(x, y, N.eye);
  for (const [x, y] of open) if (!open.some(([a, b]) => a === x - 1 && b === y)) body.set(x - 1, y, TEAL[4]);
  const eyeY = Math.round(oy - 0.5);
  body.set(Math.round(ox - hr * 0.32), eyeY, N.glint).set(Math.round(ox + hr * 0.22), eyeY, N.glint);
  body.set(Math.round(cx + 13), Math.round(cy + 7), CYAN[3]).set(Math.round(cx + 13), Math.round(cy + 8), CYAN[2]);

  fist(hand, sx + 1, hy);
  return compose([staff, body, hand], over, lights);
}

// ---------------------------------------------------------------------------------------------
// 6. The tidy duellist: no robe at all. A waistcoat, shirt sleeves, breeches and tall boots, a short
// cape off one shoulder, neat hair and a moustache, and the wand held out like a fencing foil.

function duellist(): Px {
  const f = frame(43, 1);
  const { X, shoulderY, beltY, hipY, cx, cy, R, fx } = f;
  const lights: Light[] = [];
  const body = layer();
  const arm = layer();
  const over = layer();

  // the wand arm, in a shirt sleeve, held out toward screen-right
  limb(body, X + 7, shoulderY + 3, X + 12, shoulderY + 7, 2.7, 2.7, BONE);
  limb(body, X + 12, shoulderY + 7, X + 17, shoulderY + 2, 2.7, 2.3, BONE);
  // legs apart: breeches and tall boots
  leg(body, X + 2, AY - 3, f.hip - 2, 4, true, MAIL, 0.55);
  leg(body, X - 7, AY - 1, f.hip, 4, false, MAIL, 0.55);
  lit(body, MAIL, (l) => l.rect(X - 7, beltY + 2, 13, hipY - beltY + 2, INK));
  // the hand that rests on the hip, under the cape
  fist(body, X - 10, beltY + 8, PLUM);
  // the waistcoat
  lit(
    body,
    DUSK,
    (l) => {
      for (let y = shoulderY; y <= beltY + 4; y++) {
        const t = (y - shoulderY) / (beltY + 4 - shoulderY);
        const h = 7.5 - 2 * t;
        if (y > beltY + 2) {
          // two points at the bottom
          const cut = y - beltY - 2;
          l.rect(Math.round(X - h), y, Math.round(h) - cut, 1, INK);
          l.rect(X + cut, y, Math.round(h) - cut, 1, INK);
        } else l.rect(Math.round(X - h), y, Math.round(h * 2), 1, INK);
      }
    },
    N.hi,
    [0, 4],
  );
  for (let k = 0; k < 4; k++) body.hline(X - 3 + k, shoulderY + k, 7 - 2 * k, k === 0 ? BONE[3] : BONE[2]);
  body.set(X, shoulderY + 1, CYAN[2]).set(X, shoulderY + 2, CYAN[3]).set(X, shoulderY + 3, CYAN[2]);
  for (let k = 0; k < 3; k++) body.set(X, shoulderY + 6 + k * 3, CYAN[3]);
  belt(body, X, beltY, 5.6, dim(PLUM));
  // a small book in a holster on the hip
  lit(body, MAGENTA, (l) => l.rect(X + 3, beltY + 3, 5, 6, INK));
  body.vline(X + 7, beltY + 4, 4, BONE[3]);
  body.set(X + 5, beltY + 5, CYAN[3]);

  // the cape: off the near shoulder, to the waist, its edge alight
  const cp = layer();
  lit(
    cp,
    ROBE,
    (l) =>
      l.poly(
        [
          [X - 1, shoulderY - 2],
          [X - 9, shoulderY - 2],
          [X - 16, beltY + 5],
          [X - 9, beltY + 8],
          [X - 4, shoulderY + 8],
        ],
        INK,
      ),
    N.hi,
    [0, 4],
  );
  hemTrim(cp, X - 9);
  body.blit(cp, 0, 0);
  body.set(X - 2, shoulderY - 1, CYAN[3]).set(X - 1, shoulderY - 1, CYAN[2]);

  // the head: neat hair with a parting, eyes in shadow, a moustache
  body.rect(X - 2, cy + R - 1, 3, 2, N.skin[1]);
  ball(body, cx, cy, R, R, FACE);
  hairCap(body, TEAL, cx, cy, R, cy - 1);
  lit(body, TEAL, (l) => l.ellipse(cx - 2, cy - R, 4.2, 2, INK));
  body.rect(Math.round(cx + R - 1.2), cy - 2, 2, 3, TEAL[1]);
  eyes(body, cx, cy, R, cy - 1, 2, fx, cy);
  stamp(body, fx - 4, cy + 2, ['T.....T', '.TT.TT.'], { T: TEAL[1] });

  fist(arm, X + 17.5, shoulderY, PLUM);
  wand(arm, over, X + 18, shoulderY - 1, X + 25, shoulderY - 11, lights, 20);
  return compose([body, arm], over, lights);
}

// ---------------------------------------------------------------------------------------------
// 7. The veiled sage: a pale veil over head and shoulders and across the face, a slim gown, a
// silver staff with a crescent, and a crystal orb floating over her raised palm.

function sage(): Px {
  const f = frame(50, 1.05);
  const { X, shoulderY, beltY, chinY, cx, cy, R, fx } = f;
  const hem = AY - 1;
  const lights: Light[] = [];
  const staff = layer();
  const body = layer();
  const arm = layer();
  const hand = layer();
  const over = layer();

  const sx = X + 13;
  const top = chinY - 21;
  pole(staff, sx, top + 5, AY - 2, STEEL);
  stamp(over, sx - 3, top, ['C.....c', 'C.....c', 'CC...cc', '.CCCcc.', '..CCc..'], { C: SPARK[3], c: SPARK[2] });
  sparkle(over, sx, top - 1);
  lights.push({ x: sx + 0.5, y: top + 1, r: 16, color: SPARK[3] });

  // the far arm, to the staff
  const hy = beltY - 8;
  limb(body, X + 5.5, shoulderY + 3, X + 10, hy + 5, 2.4, 2.6, dim(ROBE));
  limb(body, X + 10, hy + 5, sx - 1, hy + 1, 2.6, 3.1, dim(ROBE));
  // the gown: slim, with a sash
  gown(body, ROBE, X, shoulderY, beltY, hem, 6, 4.2, 9.5, 0.85, [-0.5, 0.5]);
  band(body, ROBE, hem - 2, X);
  band(body, ROBE, hem - 5, X, 3);
  body.rect(Math.round(X - 4.2), beltY, 8, 2, TEAL[3]);
  body.hline(Math.round(X - 4.2), beltY + 1, 8, TEAL[2]);
  body.rect(X - 3, beltY + 2, 2, 10, TEAL[2]);
  body.vline(X - 3, beltY + 2, 10, TEAL[3]);
  body.set(X - 1, shoulderY + 2, CYAN[3]).set(X, shoulderY + 3, CYAN[3]).set(X + 1, shoulderY + 2, CYAN[2]);

  // the face: eyes in shadow, the rest behind the veil
  ball(body, cx, cy, R, R, SKIN, 0.1);
  eyes(body, cx, cy, R, cy - 2, 3, fx, cy - 1);
  for (const [x, y] of inEllipse(cx, cy, R, R)) if (y > cy) body.set(x, y, x < cx - 1 ? STEEL[3] : STEEL[2]);
  // the veil
  const vr = R + 1.5;
  const vBot = beltY - 3;
  lit(
    body,
    STEEL,
    (l) => {
      for (let y = Math.floor(cy - vr); y <= vBot; y++) {
        const h = y + 0.5 < cy ? Math.sqrt(Math.max(0, vr * vr - (y + 0.5 - cy) ** 2)) : vr + (10.5 - vr) * Math.min(1, (y - cy) / (vBot - cy)) ** 0.6;
        const q = y < cy - 2 ? 0 : y <= chinY ? 4.4 : 2.5 + 3.5 * ((y - chinY) / (vBot - chinY));
        for (let x = Math.round(cx - h); x < Math.round(cx + h); x++) {
          if (q > 0 && x + 0.5 > cx - q && x + 0.5 < cx + q) continue;
          if (y > vBot - (((x % 4) + 4) % 4 < 2 ? 0 : 1)) continue;
          l.set(x, y, INK);
        }
      }
    },
    N.hi,
    [0, 4],
  );
  // a circlet with a stone
  for (let x = Math.round(cx - 5); x <= Math.round(cx + 4); x++) body.set(x, cy - 3, CYAN[x < cx ? 3 : 2]);
  body.set(fx - 1, cy - 4, '#ffffff').set(fx - 1, cy - 3, '#ffffff');

  // the near arm is raised, palm up; the orb floats above it
  limb(arm, X - 5.5, shoulderY + 4, X - 11, shoulderY + 9, 2.5, 2.6, ROBE);
  limb(arm, X - 11, shoulderY + 9, X - 14, shoulderY + 2, 2.6, 3.3, ROBE);
  arm.rect(X - 17, shoulderY - 3, 6, 2, N.skin[2]);
  arm.hline(X - 17, shoulderY - 3, 6, N.skin[3]);
  ball(over, X - 14, shoulderY - 10, 4.8, 4.8, SPARK);
  sparkle(over, X - 20, shoulderY - 16);
  over.set(X - 8, shoulderY - 15, SPARK[2]);
  lights.push({ x: X - 14, y: shoulderY - 10, r: 28, color: SPARK[3] });

  fist(hand, sx + 0.5, hy);
  return compose([staff, body, arm, hand], over, lights);
}

// ---------------------------------------------------------------------------------------------
// 8. The stooped elder: bent over a gnarled staff with both hands, a beard to the belt, a little
// tasselled cap, a shawl, slippers, and a bundle of books on his back.

function elder(): Px {
  const X = 54;
  const R = 6;
  const hx = X - 9.5;
  const hy = AY - 38;
  const fx = Math.round(hx) - 1;
  const hem = AY - 1;
  const lights: Light[] = [];
  const staff = layer();
  const back = layer();
  const body = layer();
  const arms = layer();
  const head = layer();
  const hands = layer();
  const over = layer();

  // the staff: knotted and crooked, a light caught in its fork
  const pts: Pt[] = [[X - 21, AY - 1], [X - 20, AY - 16], [X - 21.5, AY - 30], [X - 19.5, AY - 42], [X - 21, AY - 52]];
  for (let i = 0; i + 1 < pts.length; i++) limb(staff, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 1.6, 1.5, WOOD);
  ball(staff, X - 19.8, AY - 42, 2, 2, WOOD);
  limb(staff, X - 21, AY - 52, X - 24.5, AY - 57, 1.4, 1, WOOD);
  limb(staff, X - 21, AY - 52, X - 17.5, AY - 57, 1.4, 1, WOOD);
  ball(over, X - 21, AY - 59, 2.6, 2.6, SPARK);
  sparkle(over, X - 21, AY - 60);
  lights.push({ x: X - 21, y: AY - 59, r: 22, color: SPARK[3] });

  // books on his back
  lit(back, MAGENTA, (l) => l.rect(X + 2, AY - 49, 10, 4, INK));
  lit(back, TEAL, (l) => l.rect(X + 4, AY - 45, 9, 4, INK));
  lit(back, STEEL, (l) => l.rect(X + 3, AY - 41, 11, 5, INK));
  back.vline(X + 7, AY - 49, 13, PLUM[1]);
  back.hline(X + 3, AY - 47, 3, BONE[3]).hline(X + 5, AY - 43, 2, BONE[3]);

  // the far arm reaches for the staff
  limb(body, X - 1, AY - 29, X - 19, AY - 24, 2.8, 3, dim(ROBE));
  // the robe: a round back that leans over the staff, the line of it sloping in to the feet
  const top = AY - 33;
  const t01 = (y: number): number => (y - top) / (hem - top);
  const rh = (y: number): number => 9 - t01(y);
  const rc = (y: number): number => X + 3 - 5 * t01(y) ** 0.8;
  lit(
    body,
    ROBE,
    (l) => {
      l.ellipse(X + 3, top, 9, 9, INK);
      for (let y = top; y <= hem; y++) l.rect(Math.round(rc(y) - rh(y)), y, Math.round(rh(y) * 2), 1, INK);
    },
    N.hi,
    [0, 4],
  );
  for (let y = top + 6; y <= hem; y++) for (const k of [-0.45, 0.35]) if (hash(k * 10, y, 31) > 0.2) body.set(Math.round(rc(y) + k * rh(y)), y, ROBE[1]);
  band(body, ROBE, hem - 2, X);
  // a shawl over the round of his back, its edge alight
  const shawl = layer();
  lit(shawl, TEAL, (l) => l.poly([[X - 5, AY - 37], [X + 4, AY - 42], [X + 12, AY - 37], [X + 12, AY - 29], [X + 3, AY - 24], [X - 6, AY - 29]], INK));
  hemTrim(shawl, X + 3);
  body.blit(shawl, 0, 0);
  // slippers
  body.rect(X - 14, AY - 2, 6, 2, MAGENTA[2]);
  body.hline(X - 14, AY - 2, 5, MAGENTA[3]);

  // the near arm: a wide sleeve that hangs from the wrist, a lit cuff
  lit(arms, ROBE, (l) => l.poly([[X - 5, AY - 34], [X - 19, AY - 33], [X - 18, AY - 21], [X - 14, AY - 20], [X - 6, AY - 27]], INK));
  arms.vline(X - 18, AY - 33, 12, CYAN[2]);

  // the head, pushed forward
  ball(head, hx, hy, R, R, FACE);
  lit(head, STEEL, (l) => l.ellipse(hx + R - 0.5, hy + 1.5, 2.2, 3.4, INK));
  eyes(head, hx, hy, R, hy - 1, 2, fx, hy);
  head.hline(fx - 3, hy - 1, 2, STEEL[3]).hline(fx + 1, hy - 1, 2, STEEL[3]);
  // the beard
  lit(head, STEEL, (l) => {
    for (let y = hy + 2; y <= hy + 20; y++) {
      const t = (y - hy - 2) / 18;
      const h = Math.max(0.6, 5.4 * (1 - t ** 1.7));
      const c = fx - 0.5 - 1.5 * t;
      l.rect(Math.round(c - h), y, Math.max(1, Math.round(h * 2)), 1, INK);
    }
  });
  head.set(fx - 2, hy + 1, N.skin[3]).set(fx - 1, hy + 1, N.skin[2]).set(fx - 2, hy + 2, N.skin[2]);
  // the cap and its tassel
  lit(head, MAGENTA, (l) => {
    l.rect(Math.round(hx - 4.5), hy - R - 1, 9, 4, INK);
    l.rect(Math.round(hx - 3.5), hy - R - 2, 7, 1, INK);
  });
  const tx = Math.round(hx);
  head.hline(tx, hy - R - 3, 5, CYAN[2]);
  head.vline(tx + 5, hy - R - 3, 4, CYAN[2]);
  head.rect(tx + 4, hy - R + 1, 3, 2, CYAN[3]);

  fist(hands, X - 20, AY - 31);
  fist(hands, X - 20, AY - 25);
  return compose([staff, back, body, arms, head, hands], over, lights);
}

// ---------------------------------------------------------------------------------------------
// 9. Storm hands: bare-headed, long hair flying, a short dress that blows the same way, both hands
// raised and alight. The wand is tucked in her belt: she does not need it.

function storm(): Px {
  const f = frame(50, 1);
  const { X, shoulderY, beltY, hipY, cx, cy, R, fx } = f;
  const lights: Light[] = [];
  const back = layer();
  const body = layer();
  const over = layer();

  // hair, streaming up and away to screen-left as if in a gale; one lock stays on the far shoulder
  lit(back, MAGENTA, (l) => {
    bez(l, [[cx - 1, cy - 3], [cx - 6, cy - 12], [cx - 13, cy - 10], [cx - 20, cy - 18]], 5, 1.4);
    bez(l, [[cx, cy - 4], [cx - 2, cy - 13], [cx - 9, cy - 15], [cx - 12, cy - 24]], 4.6, 1.4);
    bez(l, [[cx - 2, cy - 2], [cx - 9, cy - 9], [cx - 15, cy - 9], [cx - 23, cy - 14]], 4.4, 1.3);
    bez(l, [[cx + 3, cy], [cx + 8, cy + 1], [cx + 8, cy + 6], [cx + 10, cy + 9]], 3.4, 1.4);
  });

  // legs: hose and boots
  leg(body, X + 1, AY - 3, f.hip - 2, 3, true, MAIL, 0.5);
  leg(body, X - 5, AY - 1, f.hip, 3, false, MAIL, 0.5);
  // the far arm, raised
  limb(body, X + 5.5, shoulderY + 3, X + 12, shoulderY + 6, 2.4, 2.3, dim(ROBE));
  limb(body, X + 12, shoulderY + 6, X + 15, shoulderY - 4, 2.3, 2, dim(ROBE));
  // the dress: fitted, then a skirt that flies to the left
  const hemK = hipY + 7;
  const dress = layer();
  lit(
    dress,
    ROBE,
    (l) => {
      for (let y = shoulderY; y <= hemK; y++) {
        const t = y <= beltY ? 0 : (y - beltY) / (hemK - beltY);
        const h = y <= beltY ? 6.5 - 2 * ((y - shoulderY) / (beltY - shoulderY)) : 4.5 + 6 * t ** 0.8;
        const c = X - 3.5 * t ** 1.3;
        for (let x = Math.round(c - h); x < Math.round(c + h); x++) {
          if (y > hemK - (((x % 5) + 5) % 5 < 3 ? 0 : 1)) continue;
          l.set(x, y, INK);
        }
      }
    },
    N.hi,
    [0, 4],
  );
  hemTrim(dress, X);
  body.blit(dress, 0, 0);
  for (let y = beltY + 4; y < hemK - 1; y++) {
    const t = (y - beltY) / (hemK - beltY);
    for (const k of [-0.55, 0.4]) {
      const x = Math.round(X - 3.5 * t ** 1.3 + k * (4.5 + 6 * t ** 0.8));
      if (hash(x, y, 31) > 0.2) body.set(x, y, ROBE[1]);
    }
  }
  // neckline
  for (let k = 0; k < 3; k++) body.set(X - 3 + k, shoulderY + k, CYAN[3]).set(X + 2 - k, shoulderY + k, CYAN[2]);
  // the belt, and the wand tucked through it
  belt(body, X, beltY, 4.6, dim(PLUM));
  body.line(X + 2, beltY - 4, X + 5, beltY + 6, BONE[3]);
  body.set(X + 2, beltY - 5, SPARK[3]).set(X + 1, beltY - 5, SPARK[2]);
  // the near arm, raised
  limb(body, X - 5.5, shoulderY + 3, X - 12, shoulderY + 6, 2.5, 2.4, ROBE);
  limb(body, X - 12, shoulderY + 6, X - 15, shoulderY - 4, 2.4, 2.1, ROBE);
  body.rect(X - 17, shoulderY - 3, 5, 1, CYAN[2]).rect(X + 13, shoulderY - 3, 5, 1, CYAN[2]);
  fist(body, X - 15, shoulderY - 6);
  fist(body, X + 15.5, shoulderY - 6);

  // the head
  body.rect(X - 2, cy + R - 1, 3, 2, N.skin[1]);
  ball(body, cx, cy, R, R, FACE);
  hairCap(body, MAGENTA, cx, cy, R, cy - 1);
  body.rect(Math.round(cx - R - 0.8), cy - 2, 2, 4, MAGENTA[3]);
  eyes(body, cx, cy, R, cy - 1, 2, fx, cy);
  body.set(fx - 1, cy + 3, N.skin[0]).set(fx, cy + 3, N.skin[0]);

  // both hands alight
  for (const hx of [X - 15, X + 15.5]) {
    ball(over, hx, shoulderY - 10, 3.2, 3.2, SPARK);
    lights.push({ x: hx, y: shoulderY - 10, r: 20, color: SPARK[3] });
  }
  sparkle(over, X - 21, shoulderY - 15);
  sparkle(over, X + 21, shoulderY - 14);
  over.set(X - 10, shoulderY - 16, SPARK[2]).set(X + 11, shoulderY - 17, SPARK[2]).set(X + 20, shoulderY - 6, SPARK[2]);

  return compose([back, body], over, lights);
}

// ---------------------------------------------------------------------------------------------
// 10. High collar, lantern: a long narrow coat with its collar turned up past the ears so only the
// eyes show, silver hair above it, and a shepherd's crook with a lantern hung from the end.

function warden(): Px {
  const f = frame(43, 1.07);
  const { X, shoulderY, beltY, chinY, cx, cy, R, fx } = f;
  const hem = AY - 1;
  const lights: Light[] = [];
  const staff = layer();
  const body = layer();
  const hand = layer();
  const over = layer();

  // the crook: its head curls over to screen-right, and a lantern hangs from the end
  const sx = X + 14;
  const top = chinY - 22;
  pole(staff, sx, top + 5, AY - 2);
  for (let k = 0; k <= 40; k++) {
    const a = Math.PI + (k / 40) * Math.PI * 1.05;
    const x = Math.round(sx + 5 + Math.cos(a) * 4.6);
    const y = Math.round(top + 5 + Math.sin(a) * 4.6);
    staff.set(x, y, WOOD[3]).set(x, y + 1, WOOD[k > 20 ? 1 : 3]);
  }
  const lx = sx + 10;
  const ly = top + 8;
  staff.vline(lx, ly, 2, STEEL[3]);
  stamp(staff, lx - 3, ly + 2, ['...S...', '..SSS..', '.SSSSS.', '.s...s.', '.s...s.', '.s...s.', '.s...s.', '.SSSSS.', '..sss..'], { S: WOOD[3], s: WOOD[2] });
  stamp(over, lx - 1, ly + 5, ['cCc', 'CWC', 'CWC', 'cCc'], { C: SPARK[3], W: '#ffffff', c: SPARK[2] });
  lights.push({ x: lx + 0.5, y: ly + 7, r: 26, color: SPARK[3] });

  // the far arm, to the crook
  const hy = beltY - 7;
  limb(body, X + 7, shoulderY + 3, X + 11.5, hy + 5, 2.6, 2.8, dim(DUSK));
  limb(body, X + 11.5, hy + 5, sx - 1, hy + 1, 2.8, 3, dim(DUSK));
  // boots, seen where the coat parts
  leg(body, X + 1, AY - 3, 9, 3, true, MAIL, 0.95);
  leg(body, X - 4, AY - 1, 10, 3, false, MAIL, 0.95);
  // the coat: long and narrow, parted below the belt to show its lining
  gown(body, DUSK, X, shoulderY, beltY, hem - 2, 8, 5.5, 8.5, 1, [-0.6]);
  for (let y = beltY + 3; y <= hem - 2; y++) {
    const q = 0.5 + 3 * ((y - beltY - 3) / (hem - 5 - beltY));
    for (let x = Math.round(X + 1 - q); x < Math.round(X + 1 + q); x++) body.set(x, y, y > hem - 12 && x >= X - 4 ? null : TEAL[x < X + 1 ? 2 : 1]);
    body.set(Math.round(X + 1 - q) - 1, y, CYAN[2]);
  }
  for (let k = 0; k < 3; k++) body.set(X - 2, shoulderY + 5 + k * 3, CYAN[3]).set(X + 2, shoulderY + 5 + k * 3, CYAN[2]);
  belt(body, X, beltY, 5.5, dim(PLUM));
  // round shoulder capes
  ball(body, X + 8, shoulderY + 2.5, 3.6, 3.2, dim(DUSK));
  ball(body, X - 8.5, shoulderY + 2.5, 4, 3.5, DUSK);
  // the near arm hangs straight, a glove at the end
  limb(body, X - 9, shoulderY + 4, X - 10, beltY + 3, 2.7, 2.4, DUSK);
  fist(body, X - 10, beltY + 6, PLUM);

  // the head: silver hair swept up, eyes in shadow
  ball(body, cx, cy, R, R, FACE);
  hairCap(body, STEEL, cx, cy, R, cy - 1);
  lit(body, STEEL, (l) => l.ellipse(cx - 1.5, cy - R + 0.3, 5, 2.6, INK));
  eyes(body, cx, cy, R, cy - 1, 2, fx, cy);
  // the collar: a tall funnel turned up past the ears; only the eyes show over its dip
  const colTop = cy - 3;
  const col = layer();
  lit(col, DUSK, (l) => {
    for (let y = colTop; y <= shoulderY + 1; y++) {
      const h = 9.5 - 3 * ((y - colTop) / (shoulderY + 1 - colTop));
      for (let x = Math.round(cx - h); x < Math.round(cx + h); x++) {
        if (y < colTop + Math.max(0, 7 - Math.abs(x + 0.5 - cx) * 1.2)) continue;
        l.set(x, y, INK);
      }
    }
  });
  for (let x = 0; x < OW; x++) {
    for (let y = 0; y < OH; y++) {
      if (col.has(x, y)) {
        col.set(x, y, DUSK[4]);
        break;
      }
    }
  }
  body.blit(col, 0, 0);
  body.vline(X, cy + 4, shoulderY - cy - 3, CYAN[2]);

  fist(hand, sx + 0.5, hy);
  return compose([staff, body, hand], over, lights);
}

// ---------------------------------------------------------------------------------------------

export interface MageOption {
  n: number;
  name: string;
  /** One line: what is different about it. */
  note: string;
  reads: 'woman' | 'either' | 'man';
  tool: 'wand' | 'staff';
  paint: () => Px;
}

export const MAGE_OPTIONS: ReadonlyArray<MageOption> = [
  { n: 1, name: 'The Don', note: 'Open academic gown, mortarboard and tassel; the wand held up like a baton.', reads: 'man', tool: 'wand', paint: don },
  { n: 2, name: 'Wide Brim, Long Scarf', note: 'A hat wider than the shoulders, a scarf up to the eyes, a crystal on the staff.', reads: 'either', tool: 'staff', paint: wanderer },
  { n: 3, name: 'The Small Apprentice', note: 'Small: a robe that pools on the floor, a huge floppy hat, a star on the wand.', reads: 'either', tool: 'wand', paint: apprentice },
  { n: 4, name: 'The Scholar', note: 'Hair in a bun, lit spectacles, a book floating open beside her.', reads: 'woman', tool: 'wand', paint: scholar },
  { n: 5, name: 'The Hooded Astronomer', note: 'A teal cloak of stars over the robe, a deep hood, a star on the staff.', reads: 'either', tool: 'staff', paint: astronomer },
  { n: 6, name: 'The Tidy Duellist', note: 'No robe: waistcoat, short cape, tall boots; the wand held like a foil.', reads: 'man', tool: 'wand', paint: duellist },
  { n: 7, name: 'The Veiled Sage', note: 'A pale veil and a slim gown; a crystal orb floats over her palm.', reads: 'woman', tool: 'staff', paint: sage },
  { n: 8, name: 'The Stooped Elder', note: 'Bent over a gnarled staff: a beard to the belt, a shawl, books on his back.', reads: 'man', tool: 'staff', paint: elder },
  { n: 9, name: 'Storm Hands', note: 'Bare-headed, hair flying, both hands alight; the wand stays in her belt.', reads: 'woman', tool: 'wand', paint: storm },
  { n: 10, name: 'High Collar, Lantern', note: 'A long coat with its collar up past the ears, silver hair, a lantern on a crook.', reads: 'either', tool: 'staff', paint: warden },
];
