// Concept art, not part of the game: ten different designs for the warrior, for the owner to choose
// from. Every one is painted in the colours of the chosen art style (the last Look in styles.ts)
// and with the same helpers, so they sit beside the figures in styles.ts and styles_cast.ts.

import { Px, mix } from '../engine/px';
import { FAX, FAY, FW, LOOKS, ball, hash, layer, limb, lit, stack, stamp } from './styles';
import type { Ramp } from './styles';

const N = LOOKS[LOOKS.length - 1];
const INK = N.ink;
const STEEL = N.steel;
const MAIL = N.mail;
const PINK = N.cloth;
const TEAL = N.cloak;
const PLUM = N.leather;
const CYAN = N.brass;
const INDIGO = N.wood;
/** The glowing blade. Its two lightest tones are used for nothing else, so a page can find what shines. */
export const BLADE: Ramp = N.bladeRamp ?? N.brass;
export const SHINE: ReadonlyArray<string> = [BLADE[3], BLADE[4]];

const flat = (d: string, m: string, l: string): Ramp => [d, d, m, l, l];
/** A few neighbouring tones, mixed from the style's own colours. */
const SKIN = flat(mix(N.skin[1], PINK[2], 0.18), mix(N.skin[2], PINK[3], 0.22), mix(N.skin[3], PINK[3], 0.1));
const WHITE = flat(STEEL[2], mix(STEEL[2], N.bone[4], 0.62), N.bone[4]);
const WINE = flat(mix(PINK[0], INK, 0.5), PINK[0], PINK[2]);
const dim = (r: Ramp): Ramp => [r[0], r[0], r[1], r[2], r[3]];

/** The heights a standing figure is hung from, and its widths. */
interface Fr {
  X: number;
  B: number;
  hip: number;
  sy: number;
  beltY: number;
  hipY: number;
  chinY: number;
  c: number;
  w: number;
  R: number;
  lw: number;
  ar: number;
  cx: number;
  cy: number;
}

function fr(X: number, B: number, legShare: number, c: number, w: number, R: number, lw: number, ar: number): Fr {
  const hip = Math.round(B * legShare);
  const belt = hip + Math.max(4, Math.round((B - hip) * 0.36));
  const chinY = FAY - B;
  return { X, B, hip, sy: FAY - (B - 2), beltY: FAY - belt, hipY: FAY - hip, chinY, c, w, R, lw, ar, cx: X - 0.5, cy: chinY - R + 1 };
}

// ---------------------------------------------------------------------------------------------
// Parts

function legP(p: Px, hipX: number, sole: number, len: number, w: number, far: boolean, upper: Ramp, lower: Ramp, share: number, knee: Ramp | null): void {
  const top = sole - len;
  const lowTop = sole - Math.round(len * share);
  const up = far ? dim(upper) : upper;
  const lo = far ? dim(lower) : lower;
  lit(p, up, [0, 2], [1, 2], (l) => l.rect(hipX, top, w, lowTop - top + 1, INK));
  lit(p, lo, [0, 2], [1, 2], (l) => {
    for (let y = lowTop; y <= sole; y++) {
      const cuff = y <= lowTop + 1;
      l.rect(hipX - (cuff ? 1 : 0), y, cuff ? w + 2 : y >= sole - 1 ? w + 3 : w, 1, INK);
    }
  });
  p.hline(hipX, sole, w + 3, lo[0]);
  if (knee) {
    const k = far ? dim(knee) : knee;
    p.rect(hipX - 1, lowTop, w + 2, 2, k[2]);
    p.hline(hipX - 1, lowTop, w + 1, k[4]);
  }
}

/** Two legs: the foot nearer the camera (screen-left) stands lower. */
function legs(p: Px, F: Fr, upper: Ramp, lower: Ramp, share: number, knee: Ramp | null = null, spread = 0): void {
  legP(p, F.X + 1 + spread, FAY - 3, F.hip - 2, F.lw, true, upper, lower, share, knee);
  legP(p, F.X - F.lw - 2 - spread, FAY - 1, F.hip, F.lw, false, upper, lower, share, knee);
}

function torso(p: Px, F: Fr, ramp: Ramp, top = F.sy, bottom = F.beltY): void {
  lit(p, ramp, N.hi, [N.lo[0], N.lo[1] + 1], (l) => {
    for (let y = top; y < bottom; y++) {
      const t = (y - top) / Math.max(1, bottom - top - 1);
      const half = F.c + (F.w - F.c) * t - (y < top + 2 ? 1 : 0);
      l.rect(Math.round(F.X - half), y, Math.round(half * 2), 1, INK);
    }
  });
}

function beltP(p: Px, X: number, y: number, half: number, strap: Ramp, buckle: Ramp = CYAN): void {
  const x0 = Math.round(X - half);
  const w = Math.round(half * 2);
  p.rect(x0, y, w, 3, strap[2]);
  p.hline(x0, y, w, strap[3]).hline(x0, y + 2, w, strap[1]);
  stamp(p, X - 2, y, ['GYy', 'YVz', 'yzZ'], { G: buckle[4], Y: buckle[3], y: buckle[2], z: buckle[1], Z: buckle[0], V: strap[0] });
}

type Hem = 'flat' | 'zig' | 'rag' | 'strips';

/** Hanging cloth (a cape, a skirt, a tabard): it widens from h0 to h1 and may drift to one side. */
function hang(p: Px, ramp: Ramp, X: number, top: number, bottom: number, h0: number, h1: number, hem: Hem = 'flat', drift = 0): void {
  lit(p, ramp, [0, 2], [1, 3], (l) => {
    for (let y = top; y <= bottom; y++) {
      const t = (y - top) / Math.max(1, bottom - top);
      const half = h0 + (h1 - h0) * t;
      const mid = X + drift * t;
      for (let x = Math.round(mid - half); x < Math.round(mid + half); x++) {
        const k = (((x - Math.round(mid)) % 6) + 6) % 6;
        if (hem === 'zig' && y > bottom - Math.abs(k - 3)) continue;
        if (hem === 'rag' && y > bottom - 1 - Math.floor(hash(x, 7) * 4)) continue;
        if (hem === 'strips' && t > 0.3 && k % 3 === 2) continue;
        l.set(x, y, INK);
      }
    }
  });
}

/** Folds: darker lines that follow the cloth down. */
function folds(p: Px, ramp: Ramp, X: number, top: number, bottom: number, h0: number, h1: number, at: ReadonlyArray<number>, drift = 0): void {
  for (let y = top; y <= bottom; y++) {
    const t = (y - top) / Math.max(1, bottom - top);
    for (const f of at) {
      const x = Math.round(X + drift * t + f * (h0 + (h1 - h0) * t));
      const c = p.get(x, y);
      if (c !== null && ramp.indexOf(c) >= 2 && hash(x, y, 3) > 0.2) p.set(x, y, ramp[0]);
    }
  }
}

/** A bright band along the bottom of whatever cloth is here. */
function hemBand(p: Px, ramp: Ramp, trim: Ramp, y0: number, y1: number): void {
  for (let x = 0; x < FW; x++) {
    for (let y = y1; y >= y0; y--) {
      const c = p.get(x, y);
      if (c !== null && ramp.indexOf(c) >= 0) {
        p.set(x, y, trim[ramp.indexOf(c) >= 3 ? 3 : 2]);
        break;
      }
    }
  }
}

function arm(p: Px, sx: number, sy: number, ex: number, ey: number, hx: number, hy: number, r: number, upper: Ramp, lower: Ramp, links = false): void {
  limb(p, sx, sy, ex, ey, r, r - 0.3, upper, links);
  limb(p, ex, ey, hx, hy, r - 0.3, r - 0.6, lower);
}

function fist(p: Px, hx: number, hy: number, ramp: Ramp = PLUM): void {
  const x = Math.round(hx) - 2;
  const y = Math.round(hy) - 2;
  p.rect(x, y, 4, 4, ramp[2]);
  p.hline(x, y, 3, ramp[4]).vline(x, y, 3, ramp[3]);
  p.hline(x + 1, y + 3, 3, ramp[1]).vline(x + 3, y + 1, 3, ramp[1]);
}

/** A curved, tapering form (a plume, a horn, a ponytail, a scarf): circles strung along a curve. */
function tube(p: Px, ramp: Ramp, pts: ReadonlyArray<readonly [number, number]>, rad: (t: number) => number): void {
  lit(p, ramp, [1, 2], [1, 2], (l) => {
    for (let k = 0; k <= 60; k++) {
      const t = k / 60;
      const a = (1 - t) ** 3;
      const b = 3 * (1 - t) ** 2 * t;
      const c = 3 * (1 - t) * t ** 2;
      const d = t ** 3;
      const r = rad(t);
      l.ellipse(a * pts[0][0] + b * pts[1][0] + c * pts[2][0] + d * pts[3][0], a * pts[0][1] + b * pts[1][1] + c * pts[2][1] + d * pts[3][1], r, r, INK);
    }
  });
}

/** A sword for two hands. (hx, hy) is the leading hand; the grip runs back from it. */
function blade(p: Px, hx: number, hy: number, deg: number, len: number, bw: number, grip = 7, guard = 3.2): void {
  const a = (deg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = -Math.sin(a);
  const litSide = 0.65 * dy - 0.75 * dx > 0 ? 1 : -1;
  const tip = 4 + len;
  const reach = len + grip + 10;
  for (let y = Math.floor(hy - reach); y <= Math.ceil(hy + reach); y++) {
    for (let x = Math.floor(hx - reach); x <= Math.ceil(hx + reach); x++) {
      const rx = x + 0.5 - hx;
      const ry = y + 0.5 - hy;
      const u = rx * dx + ry * dy;
      const v = (-rx * dy + ry * dx) * litSide;
      let c: string | null = null;
      if (u >= 4 && u <= tip) {
        const half = u > tip - 4 ? (tip - u) * (bw / 4) : bw;
        if (Math.abs(v) <= half) c = v > bw * 0.35 ? BLADE[4] : v < -bw * 0.35 ? BLADE[2] : BLADE[3];
        if (c && Math.abs(v) < 0.5 && u < tip - 6) c = BLADE[2];
      } else if (u >= 2.2 && u < 4 && Math.abs(v) <= bw + guard) {
        c = v > 1.5 ? STEEL[4] : v < -2.5 ? STEEL[0] : STEEL[2];
      } else if (u >= 2 - grip && u < 2.2 && Math.abs(v) <= 1.3) {
        c = Math.floor(u + 40) % 2 === 0 ? PLUM[2] : PLUM[3];
      } else if (u >= -grip - 0.6 && u < 2 - grip && Math.abs(v) <= 2) {
        c = v > 0.4 ? STEEL[4] : v < -0.9 ? STEEL[0] : STEEL[2];
      }
      if (c) p.set(x, y, c);
    }
  }
}

/** A shield of any shape: a painted field inside a steel rim. */
function slab(p: Px, field: Ramp, shape: (l: Px) => void): void {
  const m = layer();
  shape(m);
  lit(p, field, [0, 5], [0, 5], shape);
  m.each((x, y) => {
    const out = (ox: number, oy: number): boolean => !m.has(x + ox, y + oy);
    if (out(-1, 0) || out(0, -1) || out(-2, 0) || out(0, -2) || out(-1, -1)) p.set(x, y, STEEL[4]);
    else if (out(1, 0) || out(0, 1) || out(2, 0) || out(0, 2) || out(1, 1)) p.set(x, y, STEEL[1]);
    return null;
  });
}

function rrect(l: Px, x: number, y: number, w: number, h: number, r: number): void {
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const dx = i < r ? r - i - 0.5 : i >= w - r ? i - (w - r) + 0.5 : 0;
      const dy = j < r ? r - j - 0.5 : j >= h - r ? j - (h - r) + 0.5 : 0;
      if (dx * dx + dy * dy <= r * r) l.set(x + i, y + j, INK);
    }
  }
}

/** Swap one material for another along a row (a brow band, a trim). */
function band(p: Px, y: number, from: Ramp, to: Ramp, x0 = 0, x1 = FW): void {
  for (let x = x0; x < x1; x++) {
    const c = p.get(x, y);
    const i = c === null ? -1 : from.indexOf(c);
    if (i >= 0) p.set(x, y, to[i]);
  }
}

/** Two points of light in a shadowed face. */
function glints(p: Px, F: Fr, y: number): void {
  const fx = Math.round(F.cx) + 1;
  p.set(fx - 2, y, N.glint).set(fx + 2, y, N.glint);
}

/** A bare head: lilac skin, two dark eyes turned a little toward screen-right, a neck. */
function head(p: Px, F: Fr): void {
  p.rect(F.X - 2, F.chinY - 1, 4, 4, SKIN[1]);
  ball(p, F.cx, F.cy, F.R, F.R, SKIN);
  const fx = Math.round(F.cx) + 1;
  const ey = Math.round(F.cy);
  p.set(fx - 3, ey, INK).set(fx - 3, ey + 1, INK).set(fx + 1, ey, INK).set(fx + 1, ey + 1, INK);
  p.set(fx - 4, ey + 2, PINK[3]).set(fx + 2, ey + 2, PINK[3]);
  p.set(fx - 1, ey + 3, SKIN[0]).set(fx, ey + 3, SKIN[0]);
}

/** Hair over the crown and down both sides of the face. */
function hairCap(p: Px, F: Fr, ramp: Ramp, fringe = 0.3, drop = 0.7): void {
  const r = F.R + 0.8;
  lit(p, ramp, [0, 2], [0, 3], (l) => {
    for (let y = Math.floor(F.cy - r); y <= Math.ceil(F.cy + r * drop); y++) {
      for (let x = Math.floor(F.cx - r); x <= Math.ceil(F.cx + r); x++) {
        const dx = (x + 0.5 - F.cx) / r;
        const dy = (y + 0.5 - F.cy) / r;
        if (dx * dx + dy * dy > 1) continue;
        if (dy < -fringe || dx < -0.6 || dx > 0.8) l.set(x, y, INK);
      }
    }
  });
}

/** A hood with a point that falls back, darkness inside it and two eyes. */
function hood(p: Px, F: Fr, ramp: Ramp): void {
  const { cx, cy } = F;
  const hr = F.R + 0.9;
  lit(p, ramp, N.hi, N.lo, (l) => l.poly([[cx + hr * 0.35, cy - hr * 0.85], [cx - hr * 0.5, cy - hr - 3], [cx - hr * 0.95, cy - hr * 0.3]], INK));
  ball(p, cx, cy, hr, hr, ramp);
  const ox = cx + hr * 0.26;
  const oy = cy + hr * 0.16;
  const orx = hr * 0.6;
  const ory = hr * 0.72;
  const open: [number, number][] = [];
  for (let y = Math.floor(oy - ory); y <= Math.ceil(oy + ory); y++) {
    for (let x = Math.floor(ox - orx); x <= Math.ceil(ox + orx); x++) {
      const dx = (x + 0.5 - ox) / orx;
      const dy = (y + 0.5 - oy) / ory;
      if (dx * dx + dy * dy <= 1) open.push([x, y]);
    }
  }
  for (const [x, y] of open) p.set(x, y, INK);
  for (const [x, y] of open) if (!open.some(([a, b]) => a === x - 1 && b === y)) p.set(x - 1, y, ramp[4]);
  const eyeY = Math.round(oy - ory * 0.12);
  p.set(Math.round(ox - orx * 0.5), eyeY, N.glint).set(Math.round(ox + orx * 0.4), eyeY, N.glint);
}

/** Cloth or fur lying over the shoulders and coming to a point on the chest. */
function mantle(p: Px, F: Fr, ramp: Ramp, depth: number, extra: number): void {
  const bot = F.sy + Math.round((F.beltY - F.sy) * depth);
  lit(p, ramp, N.hi, N.lo, (l) => {
    for (let y = F.sy - 2; y <= bot; y++) {
      const t = Math.max(0, (y - F.sy) / (bot - F.sy));
      const half = (F.c + extra) * (1 - t ** 1.7);
      if (half < 0.6) continue;
      l.rect(Math.round(F.X - half), y, Math.round(F.X + half) - Math.round(F.X - half), 1, INK);
    }
  });
}

/** A shaggy band of fur. */
function fur(p: Px, ramp: Ramp, X: number, top: number, bottom: number, half: number, seed: number): void {
  lit(p, ramp, [0, 2], [0, 2], (l) => {
    for (let x = Math.round(X - half); x < Math.round(X + half); x++) {
      const e = Math.abs(x + 0.5 - X) / half;
      const y0 = top + Math.round(e * e * 3) - (hash(x, seed) < 0.4 ? 1 : 0);
      const y1 = bottom - Math.round(e * 2) - Math.floor(hash(x, seed + 1) * 3);
      for (let y = y0; y <= y1; y++) l.set(x, y, INK);
    }
  });
}

/** The ridge over the crown of a round helm. */
function ridge(p: Px, cx: number, cy: number, R: number): void {
  for (let k = 0; k < R - 1; k++) {
    const y = Math.round(cy - R) + k;
    const x = Math.round(cx) - 1 - Math.round(k * 0.2);
    if (p.has(x, y)) p.set(x, y, STEEL[4]);
    if (p.has(x + 1, y)) p.set(x + 1, y, STEEL[2]);
  }
}

// ---------------------------------------------------------------------------------------------
// 1. A child in armour two sizes too big, leaning on a sword as tall as they are.

function littleKnight(): Px {
  const F = fr(FAX, 31, 0.42, 8, 7, 9, 4, 2.6);
  const { X, sy, beltY, hipY, cx, cy, R } = F;
  const back = layer();
  hang(back, PINK, X, sy + 1, hipY + 8, F.c + 2, F.c + 6, 'zig', -2);
  folds(back, PINK, X, sy + 3, hipY + 8, F.c + 2, F.c + 6, [-0.62, 0.6], -2);

  const body = layer();
  legs(body, F, MAIL, STEEL, 0.7, null, 1);
  hang(body, STEEL, X, beltY + 3, hipY + 3, F.w + 1, F.w + 2.5, 'strips');
  torso(body, F, STEEL);
  beltP(body, X, beltY, F.w, PLUM);
  const hy = sy + 8;
  arm(body, X + F.c, sy + 3, X + F.c + 2, sy + 7, X + 1.5, hy - 4, F.ar, dim(MAIL), dim(STEEL), true);
  arm(body, X - F.c, sy + 3, X - F.c - 2, sy + 8, X - 1, hy, F.ar, MAIL, STEEL, true);
  ball(body, X + F.c + 2, sy + 1.5, 4.6, 4, dim(STEEL));
  ball(body, X - F.c - 2, sy + 1.5, 5.6, 4.8, STEEL);
  // a huge plume, sweeping back from the crown
  const top = cy - R;
  tube(body, CYAN, [[cx + 1, top + 2], [cx - 1, top - 15], [cx - 17, top - 13], [cx - 19, top + 5]], (t) => 2 + 3.4 * Math.sin(Math.PI * Math.min(1, t * 1.15)));
  // the helm: far too big, with a visor
  ball(body, cx, cy, R, R, STEEL);
  ridge(body, cx, cy, R);
  const vy = Math.round(cy);
  band(body, vy - 2, STEEL, CYAN);
  body.rect(Math.round(cx - R * 0.5), vy, Math.round(R * 1.25), 3, INK);
  glints(body, F, vy + 1);
  for (let k = 0; k < 3; k++) body.set(Math.round(cx) - 1 + k * 2, vy + 5, STEEL[0]).set(Math.round(cx) + k * 2, vy + 7, STEEL[0]);

  const weapon = layer();
  blade(weapon, X + 0.5, hy, -90, 19, 2.8, 8, 3.6);
  const hands = layer();
  fist(hands, X + 1, hy - 4);
  fist(hands, X, hy);
  return stack([back, body, weapon, hands], INK);
}

// ---------------------------------------------------------------------------------------------
// 2. Tall and narrow: a flat-topped great helm, a tabard to the ankles, the sword held upright.

function crusader(): Px {
  const F = fr(FAX - 4, 50, 0.5, 8, 6.5, 5.5, 4, 2.6);
  const { X, sy, beltY, cx, cy, R } = F;
  const body = layer();
  legs(body, F, MAIL, MAIL, 0.3, null, 0);
  const hem = FAY - 8;
  hang(body, PINK, X, beltY + 3, hem, F.w, F.w + 4, 'flat');
  folds(body, PINK, X, beltY + 5, hem, F.w, F.w + 4, [-0.62, 0.55]);
  for (let y = beltY + 6; y <= hem; y++) body.set(X - 1, y, PINK[0]);
  hemBand(body, PINK, CYAN, hem - 1, hem);
  // mail sleeves; the far arm first, then the tabard over both shoulders
  const hx = X + 10;
  const hy = beltY - 4;
  arm(body, X + F.c, sy + 3, X + F.c + 3, sy + 9, hx, hy + 4, F.ar, dim(MAIL), dim(STEEL), true);
  torso(body, F, PINK);
  // a cross on the chest
  body.rect(X - 1, sy + 3, 2, 9, CYAN[2]).rect(X - 4, sy + 5, 8, 2, CYAN[2]);
  body.vline(X - 1, sy + 3, 9, CYAN[3]).hline(X - 4, sy + 5, 8, CYAN[3]);
  beltP(body, X, beltY, F.w, PLUM);
  arm(body, X - F.c, sy + 3, X - F.c, sy + 10, hx - 1, hy, F.ar, MAIL, STEEL, true);
  // the helm: a bucket with a glowing cross on its face
  const x0 = Math.round(cx - R);
  const y0 = Math.round(cy - R) - 1;
  const w = Math.round(R * 2);
  const h = Math.round(R * 2 + 3);
  lit(body, MAIL, [0, 2], [1, 2], (l) => l.rect(X - 4, F.chinY - 1, 8, 4, INK));
  lit(body, STEEL, N.hi, N.lo, (l) => {
    l.rect(x0 + 1, y0, w - 2, 1, INK);
    l.rect(x0, y0 + 1, w, h - 2, INK);
    l.rect(x0 + 1, y0 + h - 1, w - 2, 1, INK);
  });
  const slitY = y0 + Math.round(h * 0.4);
  const barX = x0 + Math.round(w * 0.58);
  for (let y = y0 + 1; y < y0 + h - 1; y++) body.set(barX, y, CYAN[2]).set(barX + 1, y, CYAN[1]);
  for (let x = x0 + 1; x < x0 + w - 1; x++) body.set(x, slitY - 1, CYAN[3]).set(x, slitY + 1, CYAN[1]);
  for (let x = x0 + 2; x < x0 + w - 1; x++) if (x !== barX && x !== barX + 1) body.set(x, slitY, INK);
  body.set(barX - 2, slitY, N.glint).set(barX + 3, slitY, N.glint);
  for (let k = 0; k < 2; k++) body.set(barX + 3, slitY + 3 + k * 2, STEEL[0]).set(barX - 3, slitY + 3 + k * 2, STEEL[0]);

  const weapon = layer();
  blade(weapon, hx, hy, 90, 35, 2.3, 8, 3.4);
  const hands = layer();
  fist(hands, hx, hy + 4);
  fist(hands, hx - 0.5, hy);
  return stack([body, weapon, hands], INK);
}

// ---------------------------------------------------------------------------------------------
// 3. Broad, in furs, a horned helm and a great beard; the sword rides across both shoulders.

function barbarian(): Px {
  const F = fr(FAX, 45, 0.47, 11, 8, 6, 5, 3.4);
  const { X, sy, beltY, hipY, cx, cy, R } = F;
  const hx = X + F.c + 7;
  const hy = sy - 4;
  const back = layer();
  blade(back, hx - 3, hy, 176, 44, 2.8, 8, 3.4);

  const body = layer();
  legs(body, F, PLUM, INDIGO, 0.42, WHITE, 1);
  hang(body, TEAL, X, beltY + 3, hipY + 9, F.w + 1, F.w + 3, 'rag');
  folds(body, TEAL, X, beltY + 4, hipY + 9, F.w + 1, F.w + 3, [-0.5, 0.45]);
  torso(body, F, SKIN);
  // straps crossing the chest, and a wide belt
  for (let y = sy + 4; y < beltY; y++) {
    const t = (y - sy - 4) / (beltY - sy - 5);
    const xa = Math.round(X - F.c + 3 + t * (F.c * 2 - 7));
    const xb = Math.round(X + F.c - 4 - t * (F.c * 2 - 7));
    body.set(xa, y, PLUM[2]).set(xa + 1, y, PLUM[0]).set(xb, y, PLUM[2]).set(xb + 1, y, PLUM[0]);
  }
  beltP(body, X, beltY - 1, F.w, PLUM);
  body.hline(Math.round(X - F.w), beltY + 2, Math.round(F.w * 2), PLUM[1]);
  // arms up and out, to hold the blade on the shoulders
  for (const s of [1, -1]) {
    const ramp = s > 0 ? dim(SKIN) : SKIN;
    const gy = hy + (s > 0 ? 0 : -2);
    arm(body, X + s * F.c, sy + 3, X + s * (F.c + 7), sy + 6, X + s * (F.c + 7), gy + 2, F.ar, ramp, ramp);
    body.rect(X + s * (F.c + 7) - 3, gy + 4, 6, 3, PLUM[2]);
    body.hline(X + s * (F.c + 7) - 3, gy + 4, 6, PLUM[3]);
  }
  fur(body, INDIGO, X, sy, sy + 8, F.c + 4, 3);
  // head: a helm with horns, a shadowed face, a beard
  ball(body, cx, cy, R, R, dim(SKIN));
  const fx = Math.round(cx) + 1;
  lit(body, WHITE, [0, 2], [0, 2], (l) => {
    const by = Math.round(cy) + 3;
    for (let y = by; y <= by + 12; y++) {
      const t = (y - by) / 12;
      const half = (R + 1.5) * Math.sqrt(1 - t ** 2.4);
      for (let x = Math.round(fx - half); x < Math.round(fx + half); x++) {
        if (t > 0.6 && Math.abs(x - fx + 0.5) < 1) continue; // forked
        if (t > 0.5 && hash(x, y, 41) < 0.12) continue;
        l.set(x, y, INK);
      }
    }
  });
  body.hline(fx - 2, Math.round(cy) + 5, 4, WHITE[0]);
  lit(body, STEEL, N.hi, N.lo, (l) => {
    for (let y = Math.floor(cy - R); y <= Math.round(cy); y++) {
      for (let x = Math.floor(cx - R - 1); x <= Math.ceil(cx + R + 1); x++) {
        const dx = (x + 0.5 - cx) / (R + 0.6);
        const dy = (y + 0.5 - cy) / (R + 0.6);
        if (dx * dx + dy * dy <= 1) l.set(x, y, INK);
      }
    }
  });
  band(body, Math.round(cy), STEEL, PLUM);
  body.rect(fx - 4, Math.round(cy) + 1, 8, 2, INK);
  glints(body, F, Math.round(cy) + 1);
  body.vline(fx, Math.round(cy) + 1, 2, STEEL[3]);
  for (const s of [1, -1]) {
    tube(body, s > 0 ? dim(WHITE) : WHITE, [[cx + s * (R - 1), cy - 3], [cx + s * (R + 6), cy - 2], [cx + s * (R + 8), cy - 7], [cx + s * (R + 5), cy - 12]], (t) => 2.4 * (1 - t * 0.72));
  }

  const hands = layer();
  fist(hands, hx, hy, SKIN);
  fist(hands, X - F.c - 7, hy - 2, SKIN);
  return stack([back, body, hands], INK);
}

// ---------------------------------------------------------------------------------------------
// 4. Slim, in half armour, a high ponytail; a long blade held across the body in both hands.

function duelist(): Px {
  const F = fr(FAX - 1, 46, 0.54, 6.5, 4.5, 5.5, 3, 2.1);
  const { X, sy, beltY, hipY, cx, cy, R } = F;
  const back = layer();
  hang(back, TEAL, X + 6, sy + 1, hipY + 11, 5, 8, 'zig', 4);
  folds(back, TEAL, X + 6, sy + 3, hipY + 11, 5, 8, [-0.2, 0.55], 4);

  const body = layer();
  legs(body, F, MAIL, PLUM, 0.62, null, 0);
  hang(body, PINK, X, beltY + 2, hipY + 3, F.w + 0.5, F.w + 3, 'zig');
  torso(body, F, STEEL);
  body.rect(X - 2, sy + 4, 4, 1, STEEL[0]);
  // a sash, knotted at the hip with its ends hanging
  body.rect(Math.round(X - F.w), beltY, Math.round(F.w * 2), 3, PINK[2]);
  body.hline(Math.round(X - F.w), beltY, Math.round(F.w * 2), PINK[3]);
  body.rect(Math.round(X - F.w) - 1, beltY + 1, 3, 9, PINK[2]).vline(Math.round(X - F.w) - 1, beltY + 1, 9, PINK[3]);
  const hx = X + 4;
  const hy = beltY + 1;
  arm(body, X + F.c, sy + 3, X + F.c + 3, sy + 10, hx + 2.5, hy + 3.2, F.ar, dim(MAIL), dim(STEEL));
  arm(body, X - F.c, sy + 3, X - F.c - 1, sy + 10, hx, hy, F.ar, MAIL, STEEL);
  ball(body, X + F.c + 1, sy + 1.5, 3.8, 3.2, STEEL);
  // head: an open face and a ponytail that swings out behind
  tube(body, PINK, [[cx + 2, cy - R + 1], [cx + 8, cy - R - 7], [cx + 16, cy - R - 2], [cx + 13, cy + 9]], (t) => 2.6 - 1.4 * t);
  head(body, F);
  hairCap(body, F, PINK, 0.25, 0.3);
  body.rect(Math.round(cx) + 1, Math.round(cy - R) - 1, 3, 2, CYAN[2]);

  const weapon = layer();
  blade(weapon, hx, hy, 128, 34, 1.7, 8, 3.2);
  const hands = layer();
  fist(hands, hx + 2.5, hy + 3.2);
  fist(hands, hx, hy);
  return stack([back, body, weapon, hands], INK);
}

// ---------------------------------------------------------------------------------------------
// 5. Mostly pauldrons and a tower shield, under a kettle hat and a big beard.

function wall(): Px {
  const F = fr(FAX + 4, 40, 0.45, 11, 9, 5, 6, 3.4);
  const { X, sy, beltY, hipY } = F;
  const body = layer();
  legs(body, F, MAIL, STEEL, 0.62, STEEL, 1);
  hang(body, STEEL, X, beltY + 3, hipY + 3, F.w, F.w + 1.5, 'strips');
  hang(body, PINK, X, beltY + 3, hipY + 8, 4, 4.5, 'zig');
  torso(body, F, STEEL);
  beltP(body, X, beltY, F.w, PLUM);
  const hx = X + F.c + 6;
  const hy = beltY;
  arm(body, X + F.c, sy + 4, X + F.c + 4, sy + 9, hx, hy, F.ar, dim(STEEL), dim(STEEL));
  // head, sunk between the shoulders
  const cx = X - 0.5;
  const cy = sy - 5;
  const R = F.R;
  const fx = Math.round(cx) + 1;
  // pauldrons as big as the head
  ball(body, X + F.c + 3, sy + 2, 7.5, 6.5, dim(STEEL));
  ball(body, X - F.c - 3, sy + 2, 8.5, 7.5, STEEL);
  ball(body, cx, cy, R, R, dim(SKIN));
  body.rect(fx - 4, Math.round(cy) + 1, 8, 3, INK);
  body.set(fx - 2, Math.round(cy) + 2, N.glint).set(fx + 2, Math.round(cy) + 2, N.glint);
  lit(body, PINK, [0, 2], [0, 2], (l) => {
    const by = Math.round(cy) + 4;
    for (let y = by; y <= by + 13; y++) {
      const t = (y - by) / 13;
      const half = (R + 2) * Math.sqrt(1 - t ** 2.2);
      for (let x = Math.round(fx - half); x < Math.round(fx + half); x++) if (!(t > 0.55 && hash(x, y, 43) < 0.14)) l.set(x, y, INK);
    }
  });
  body.set(fx - 1, Math.round(cy) + 4, SKIN[3]).set(fx, Math.round(cy) + 4, SKIN[2]);
  body.hline(fx - 2, Math.round(cy) + 6, 4, PINK[0]);
  ball(body, cx, cy - 3.5, R + 0.5, R - 0.5, STEEL);
  lit(body, STEEL, [0, 1], [0, 1], (l) => l.ellipse(cx, cy - 1, R + 5, 2, INK));
  band(body, Math.round(cy - 4), STEEL, CYAN, Math.round(cx - R), Math.round(cx + R));
  for (const [px, r] of [[X + F.c + 3, 7.5], [X - F.c - 3, 8.5]] as const) {
    for (let x = Math.round(px - r + 2); x < Math.round(px + r - 1); x++) if (body.has(x, sy + 6)) body.set(x, sy + 6, CYAN[2]);
  }

  const weapon = layer();
  blade(weapon, hx, hy, -64, 15, 3.2, 4, 2.6);
  const hands = layer();
  fist(hands, hx, hy);
  // the shield: a slab that covers him from shoulder to shin
  const shield = layer();
  const s0 = X - F.c - 14;
  const sTop = sy + 3;
  slab(shield, INDIGO, (l) => rrect(l, s0, sTop, 21, FAY - 1 - sTop, 4));
  const mx = s0 + 10;
  const my = sTop + 15;
  shield.rect(mx - 1, sTop + 4, 2, FAY - sTop - 10, CYAN[2]).rect(s0 + 4, my, 13, 2, CYAN[2]);
  shield.vline(mx - 1, sTop + 4, FAY - sTop - 10, CYAN[3]).hline(s0 + 4, my, 13, CYAN[3]);
  ball(shield, mx, my + 1, 3, 3, STEEL);
  for (const [ox, oy] of [[3, 3], [17, 3], [3, FAY - sTop - 5], [17, FAY - sTop - 5]] as const) shield.set(s0 + ox, sTop + oy, STEEL[4]);
  return stack([body, weapon, hands, shield], INK);
}

// ---------------------------------------------------------------------------------------------
// 6. A hood and a ragged cloak, the face in shadow, a long sword resting on one shoulder.

function sellsword(): Px {
  const F = fr(FAX - 3, 47, 0.5, 7.5, 5.5, 5.8, 4, 2.5);
  const { X, sy, beltY, hipY } = F;
  const back = layer();
  hang(back, WINE, X - 1, sy + 1, FAY - 8, F.c + 2, F.c + 8, 'rag', -4);
  folds(back, WINE, X - 1, sy + 4, FAY - 8, F.c + 2, F.c + 8, [-0.7, -0.3, 0.35, 0.75], -4);

  const body = layer();
  legs(body, F, MAIL, PLUM, 0.52, null, 0);
  hang(body, PLUM, X, beltY + 3, hipY + 4, F.w, F.w + 1.8, 'flat');
  const hx = X + 5;
  const hy = beltY - 3;
  arm(body, X + F.c, sy + 3, X + F.c + 3, sy + 10, hx, hy, F.ar, dim(WINE), dim(STEEL));
  torso(body, F, PLUM);
  for (let y = sy + 5; y < beltY - 1; y += 2) body.set(X, y, PLUM[0]).set(X + 1, y, PLUM[4]);
  beltP(body, X, beltY, F.w, dim(PLUM));
  arm(body, X - F.c, sy + 3, X - F.c - 0.5, sy + 11, hx - 2, hy + 3.5, F.ar, WINE, STEEL);
  ball(body, X + F.c + 1.5, sy + 1.5, 4.2, 3.6, STEEL);
  mantle(body, F, WINE, 0.55, 2.5);
  // a scarf under the hood, one end loose
  lit(body, TEAL, [0, 1], [0, 1], (l) => {
    l.rect(X - 5, sy - 2, 10, 3, INK);
    l.rect(X - 6, sy, 3, 8, INK);
  });
  hood(body, F, WINE);

  const weapon = layer();
  blade(weapon, hx, hy, 62, 34, 2.3, 8, 3.2);
  const hands = layer();
  fist(hands, hx - 1.9, hy + 3.5);
  fist(hands, hx, hy);
  return stack([back, body, weapon, hands], INK);
}

// ---------------------------------------------------------------------------------------------
// 7. A floor-length cape, long hair, a sunburst behind the head; the blade held low.

function paladin(): Px {
  const F = fr(FAX + 3, 48, 0.52, 7.5, 5, 5.5, 4, 2.4);
  const { X, sy, beltY, hipY, cx, cy, R } = F;
  const back = layer();
  hang(back, TEAL, X + 1, sy + 1, FAY - 2, F.c + 2, F.c + 12, 'zig', 2);
  folds(back, TEAL, X + 1, sy + 4, FAY - 2, F.c + 2, F.c + 12, [-0.72, -0.35, 0.3, 0.7], 2);
  hemBand(back, TEAL, CYAN, FAY - 8, FAY - 2);
  // the sunburst: long and short rays round the head
  const rays = layer();
  for (let k = 0; k <= 10; k++) {
    const a = ((188 + k * 16.4) * Math.PI) / 180;
    const r1 = R + (k % 2 === 0 ? 9.5 : 6);
    const ox = Math.cos(a);
    const oy = Math.sin(a);
    const bx = cx + ox * (R + 1);
    const by = cy - 1 + oy * (R + 1);
    const wd = k % 2 === 0 ? 1.7 : 1.2;
    rays.poly([[bx - oy * wd, by + ox * wd], [cx + ox * r1, cy - 1 + oy * r1], [bx + oy * wd, by - ox * wd]], k % 2 === 0 ? BLADE[3] : CYAN[2]);
    rays.line(bx, by, cx + ox * (r1 - 1), cy - 1 + oy * (r1 - 1), k % 2 === 0 ? BLADE[3] : CYAN[2]);
  }
  const hair = layer();
  hang(hair, PLUM, cx, cy - 2, sy + 13, R + 1, R + 4, 'zig', -1);

  const body = layer();
  legs(body, F, MAIL, STEEL, 0.62, STEEL, 0);
  hang(body, STEEL, X, beltY + 3, hipY + 3, F.w + 1, F.w + 3, 'strips');
  hang(body, PINK, X, beltY + 3, hipY + 14, 3.5, 4.5, 'zig');
  torso(body, F, STEEL);
  stamp(body, X - 2, sy + 4, ['.cCc.', 'cCWCc', '.cCc.'], { c: CYAN[2], C: CYAN[3], W: '#ffffff' });
  beltP(body, X, beltY, F.w, PINK);
  const hx = X + 2;
  const hy = beltY + 1;
  arm(body, X + F.c, sy + 3, X + F.c + 2.5, sy + 10, hx + 3, hy - 2.7, F.ar, dim(MAIL), dim(STEEL), true);
  arm(body, X - F.c, sy + 3, X - F.c - 0.5, sy + 11, hx, hy, F.ar, MAIL, STEEL, true);
  ball(body, X + F.c + 1.5, sy + 1.5, 4, 3.4, dim(STEEL));
  ball(body, X - F.c - 1.5, sy + 1.5, 4.8, 4, STEEL);
  band(body, sy + 4, STEEL, CYAN, X - F.c - 7, X - F.c + 3);
  head(body, F);
  hairCap(body, F, PLUM, 0.3, 1);
  for (const s of [-1, 1]) {
    const lx = Math.round(cx + s * (R - 0.5));
    lit(body, s > 0 ? dim(PLUM) : PLUM, [0, 1], [0, 1], (l) => {
      for (let y = Math.round(cy) + 3; y <= sy + 9; y++) l.rect(lx - 1 + (y > sy + 6 ? (s > 0 ? 1 : 0) : 0), y, y > sy + 6 ? 2 : 3, 1, INK);
    });
  }
  band(body, Math.round(cy - R * 0.45), PLUM, CYAN);
  body.set(Math.round(cx) + 1, Math.round(cy - R * 0.45) - 1, '#ffffff');

  const weapon = layer();
  blade(weapon, hx, hy, 222, 33, 2.2, 8, 3.2);
  const hands = layer();
  fist(hands, hx + 3, hy - 2.7);
  fist(hands, hx, hy);
  return stack([back, rays, hair, body, weapon, hands], INK);
}

// ---------------------------------------------------------------------------------------------
// 8. A winged cap, long braids, a fur collar; a spear and a big painted round shield.

function shieldMaiden(): Px {
  const F = fr(FAX + 1, 44, 0.5, 7.5, 5.5, 5.6, 4, 2.4);
  const { X, sy, beltY, hipY, cx, cy, R } = F;
  const back = layer();
  hang(back, INDIGO, X, sy, hipY + 4, F.c + 2, F.c + 4, 'rag');

  const body = layer();
  legs(body, F, MAIL, PLUM, 0.5, WHITE, 0);
  hang(body, TEAL, X, beltY + 3, hipY + 9, F.w + 0.5, F.w + 4.5, 'flat');
  folds(body, TEAL, X, beltY + 4, hipY + 9, F.w + 0.5, F.w + 4.5, [-0.55, 0.1, 0.6]);
  hemBand(body, TEAL, CYAN, hipY + 8, hipY + 9);
  limb(body, X + F.c, sy + 3, X + F.c + 2, sy + 11, F.ar, F.ar - 0.3, dim(TEAL));
  torso(body, F, TEAL);
  beltP(body, X, beltY, F.w, PLUM);
  const sx = X - F.c - 8;
  const hy = sy + 11;
  arm(body, X - F.c, sy + 3, X - F.c - 3, sy + 9, sx + 1, hy, F.ar, TEAL, PLUM);
  fur(body, INDIGO, X, sy - 2, sy + 5, F.c + 3, 5);
  head(body, F);
  hairCap(body, F, WHITE, 0.2, 0.9);
  // braids, tied at the ends
  for (const s of [-1, 1]) {
    const bx = Math.round(cx + s * (R - 0.5));
    for (let y = Math.round(cy) + 3; y <= beltY - 2; y++) {
      const k = (y + (s > 0 ? 1 : 0)) % 3;
      body.set(bx, y, WHITE[k === 0 ? 2 : 4]).set(bx + 1, y, WHITE[k === 1 ? 2 : 3]).set(bx - 1, y, k === 2 ? WHITE[2] : null);
    }
    body.rect(bx - 1, beltY - 2, 3, 2, PINK[2]);
    body.set(bx, beltY, WHITE[4]).set(bx, beltY + 1, WHITE[2]);
  }
  // a steel cap with a wing at each temple
  lit(body, STEEL, N.hi, N.lo, (l) => {
    for (let y = Math.floor(cy - R - 1); y <= Math.round(cy - R * 0.4); y++) {
      for (let x = Math.floor(cx - R - 1); x <= Math.ceil(cx + R + 1); x++) {
        const dx = (x + 0.5 - cx) / (R + 0.9);
        const dy = (y + 0.5 - cy) / (R + 0.9);
        if (dx * dx + dy * dy <= 1) l.set(x, y, INK);
      }
    }
  });
  band(body, Math.round(cy - R * 0.4), STEEL, CYAN);
  for (const s of [-1, 1]) {
    const wx = cx + s * (R - 0.5);
    const wy = cy - R * 0.5;
    lit(body, s > 0 ? dim(WHITE) : WHITE, [0, 1], [0, 1], (l) => {
      l.poly([[wx, wy], [wx + s * 2.5, wy - 9], [wx + s * 5, wy - 6], [wx + s * 6.5, wy - 7.5], [wx + s * 5.5, wy - 2], [wx + s * 2, wy + 1]], INK);
    });
  }

  // the spear, its butt on the floor
  const spear = layer();
  const tipY = cy - R - 22;
  for (let y = Math.round(tipY) + 8; y <= FAY - 1; y++) spear.set(sx, y, INDIGO[3]).set(sx + 1, y, INDIGO[2]);
  stamp(spear, sx - 2, Math.round(tipY), ['..W...', '..WB..', '.WWBb.', '.WWBb.', 'WWBBbb', 'WWBBbb', '.WBBb.', '.WBBb.', '..Bb..'], { W: BLADE[4], B: BLADE[3], b: BLADE[2] });
  spear.rect(sx - 1, Math.round(tipY) + 9, 4, 2, STEEL[3]);
  spear.rect(sx - 2, Math.round(tipY) + 11, 2, 5, PINK[2]).vline(sx + 2, Math.round(tipY) + 11, 4, PINK[3]);
  const hands = layer();
  fist(hands, sx + 1, hy);

  const shield = layer();
  const scx = X + F.c + 4.5;
  const scy = beltY - 1.5;
  const r = 10.5;
  for (let y = Math.floor(scy - r); y <= Math.ceil(scy + r); y++) {
    for (let x = Math.floor(scx - r); x <= Math.ceil(scx + r); x++) {
      const ox = x + 0.5 - scx;
      const oy = y + 0.5 - scy;
      const d = Math.hypot(ox, oy);
      if (d > r) continue;
      const side = (ox * -0.52 + oy * -0.62) / r;
      if (d > r - 2) shield.set(x, y, STEEL[side > 0.2 ? 4 : side > -0.4 ? 2 : 0]);
      else shield.set(x, y, (ox >= 0 !== oy >= 0 ? PINK : INDIGO)[side > 0.3 ? 3 : side > -0.45 ? 2 : 1]);
    }
  }
  ball(shield, scx, scy, 3.2, 3.2, CYAN);
  return stack([back, body, spear, hands, shield], INK);
}

// ---------------------------------------------------------------------------------------------
// 9. A fan-crested helm, one armoured arm, a skirt of straps; a short sword and a small shield.

function champion(): Px {
  const F = fr(FAX + 1, 45, 0.5, 9, 7, 5.8, 5, 3);
  const { X, sy, beltY, hipY, cx, cy, R } = F;
  const body = layer();
  legs(body, F, SKIN, STEEL, 0.5, CYAN, 0);
  hang(body, PLUM, X, beltY + 3, hipY + 6, F.w + 1, F.w + 3, 'strips');
  hang(body, PINK, X, beltY + 3, hipY + 10, 3.5, 4, 'zig');
  // the sword arm, sheathed in bands of steel
  const hx = X + F.c + 7;
  const hy = beltY;
  const sleeve = layer();
  arm(sleeve, X + F.c, sy + 3, X + F.c + 4, sy + 9, hx, hy, F.ar + 0.5, STEEL, STEEL);
  sleeve.each((x, y) => ((x + y) % 3 === 0 ? STEEL[0] : null));
  body.blit(sleeve, 0, 0);
  torso(body, F, PLUM);
  for (let y = sy + 2; y < beltY; y++) {
    const x = Math.round(X - F.c + 2 + ((y - sy - 2) / (beltY - sy - 3)) * (F.c * 2 - 5));
    body.set(x, y, CYAN[2]).set(x + 1, y, CYAN[0]);
  }
  beltP(body, X, beltY - 1, F.w, STEEL);
  body.hline(Math.round(X - F.w), beltY + 2, Math.round(F.w * 2), STEEL[1]);
  limb(body, X - F.c, sy + 3, X - F.c - 2, sy + 10, F.ar, F.ar - 0.3, SKIN);
  ball(body, X + F.c + 1.5, sy + 1, 6, 5, STEEL);
  band(body, sy + 4, STEEL, CYAN, X + F.c - 4, X + F.c + 8);
  // head: a brimmed helm with a grille, and a fan of feathers from ear to ear
  body.rect(X - 2, F.chinY - 1, 4, 4, dim(SKIN)[2]);
  lit(body, PINK, [0, 2], [0, 2], (l) => {
    for (let y = Math.floor(cy - R - 9); y <= Math.round(cy); y++) {
      for (let x = Math.floor(cx - R - 9); x <= Math.ceil(cx + R + 9); x++) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - (cy - 0.5);
        const d = Math.hypot(dx, dy * 0.92);
        if (d >= R - 1 && d <= R + 6.5 && dy < -1.5) l.set(x, y, INK);
      }
    }
  });
  for (let k = 0; k <= 8; k++) {
    const a = ((196 + k * 18.5) * Math.PI) / 180;
    body.line(cx + Math.cos(a) * (R + 1.5), cy - 0.5 + Math.sin(a) * (R + 1.5), cx + Math.cos(a) * (R + 5), cy - 0.5 + Math.sin(a) * (R + 5), PINK[0]);
  }
  ball(body, cx, cy, R, R, STEEL);
  const fx = Math.round(cx) + 1;
  const vy = Math.round(cy);
  body.rect(fx - 4, vy + 1, 8, 4, INK);
  for (let x = fx - 4; x < fx + 4; x += 2) body.set(x, vy + 3, STEEL[0]).set(x + 1, vy + 4, STEEL[0]);
  glints(body, F, vy + 2);
  lit(body, STEEL, [0, 1], [0, 1], (l) => l.ellipse(cx, cy + 0.2, R + 3.5, 1.7, INK));
  band(body, vy - 1, STEEL, CYAN, Math.round(cx - R), Math.round(cx + R));

  const weapon = layer();
  blade(weapon, hx, hy, -22, 12, 2.6, 4, 2.4);
  const hands = layer();
  fist(hands, hx, hy);
  const shield = layer();
  const s0 = X - F.c - 10;
  const sTop = beltY - 11;
  slab(shield, PINK, (l) => rrect(l, s0, sTop, 14, 19, 3));
  ball(shield, s0 + 7, sTop + 9.5, 2.6, 2.6, CYAN);
  shield.hline(s0 + 3, sTop + 4, 8, PINK[0]).hline(s0 + 3, sTop + 15, 8, PINK[0]);
  return stack([body, weapon, hands, shield], INK);
}

// ---------------------------------------------------------------------------------------------
// 10. A pointed helm, a long scarf blowing in the wind, a kite shield and the sword at rest.

function scarfKnight(): Px {
  const F = fr(FAX + 3, 45, 0.5, 8, 6, 5.6, 4, 2.6);
  const { X, sy, beltY, hipY, cx, cy, R } = F;
  const back = layer();
  tube(back, PINK, [[X - 2, sy - 1], [X - 12, sy - 8], [X - 19, sy + 2], [X - 30, sy - 6]], (t) => 2.6 - 1.2 * t);
  tube(back, dim(PINK), [[X - 2, sy], [X - 9, sy + 3], [X - 15, sy - 4], [X - 24, sy + 1]], (t) => 2.2 - 1.1 * t);

  const body = layer();
  legs(body, F, MAIL, STEEL, 0.56, STEEL, 0);
  hang(body, TEAL, X, beltY + 3, hipY + 8, F.w, F.w + 3, 'zig');
  folds(body, TEAL, X, beltY + 4, hipY + 8, F.w, F.w + 3, [-0.55, 0.5]);
  const hx = X + F.c + 4;
  const hy = beltY + 2;
  arm(body, X + F.c, sy + 3, X + F.c + 3, sy + 10, hx, hy, F.ar, dim(MAIL), dim(STEEL), true);
  torso(body, F, TEAL);
  // a chevron on the chest
  for (let k = 0; k < 5; k++) for (const s of [-1, 1]) body.set(X + s * k - (s > 0 ? 0 : 1), sy + 9 - k, CYAN[2]).set(X + s * k - (s > 0 ? 0 : 1), sy + 8 - k, CYAN[3]);
  beltP(body, X, beltY, F.w, PLUM);
  limb(body, X - F.c, sy + 3, X - F.c - 1, sy + 10, F.ar, F.ar - 0.3, MAIL, true);
  ball(body, X + F.c + 1.5, sy + 1.5, 3.6, 3, dim(STEEL));
  ball(body, X - F.c - 1.5, sy + 1.5, 4.2, 3.5, STEEL);
  // head: mail under a pointed helm with a nasal bar
  ball(body, cx, cy, R, R, MAIL);
  const fx = Math.round(cx) + 1;
  const base = Math.round(cy);
  body.rect(fx - 4, base + 1, 8, 3, INK);
  glints(body, F, base + 2);
  lit(body, STEEL, N.hi, N.lo, (l) => {
    const top = Math.round(cy - R - 7);
    for (let y = top; y <= base; y++) {
      const t = (y - top) / (base - top);
      const half = Math.max(0.6, (R + 0.5) * Math.sin((Math.min(1, t * 1.08) * Math.PI) / 2) ** 0.85);
      l.rect(Math.round(cx - half), y, Math.max(1, Math.round(half * 2)), 1, INK);
    }
  });
  band(body, base, STEEL, CYAN);
  body.vline(fx, base + 1, 3, STEEL[3]);
  // the scarf, wound round the neck
  lit(body, PINK, [0, 1], [0, 1], (l) => {
    l.rect(X - 6, sy - 3, 12, 3, INK);
    l.rect(X - 5, sy, 10, 1, INK);
  });

  const weapon = layer();
  blade(weapon, hx, hy, -72, 19, 2, 4, 2.8);
  const hands = layer();
  fist(hands, hx, hy);
  // the kite shield
  const shield = layer();
  const kx = X - F.c - 4;
  const top = sy + 2;
  const bot = hipY + 14;
  const half = (y: number): number => {
    const t = (y - top) / (bot - top);
    return t < 0.25 ? 8.5 * Math.sqrt(1 - ((0.25 - t) / 0.25) ** 2 * 0.55) : 8.5 * (1 - ((t - 0.25) / 0.75) ** 1.6);
  };
  slab(shield, INDIGO, (l) => {
    for (let y = top; y <= bot; y++) l.rect(Math.round(kx - half(y)), y, Math.max(1, Math.round(half(y) * 2)), 1, INK);
  });
  for (let k = 0; k < 6; k++) {
    for (const s of [-1, 1]) {
      const x = Math.round(kx) + s * k - (s > 0 ? 0 : 1);
      for (let j = 0; j < 3; j++) if (INDIGO.indexOf(shield.get(x, top + 8 + k + j) ?? '') >= 0) shield.set(x, top + 8 + k + j, j === 0 ? PINK[3] : PINK[2]);
    }
  }
  return stack([back, body, weapon, hands, shield], INK);
}

// ---------------------------------------------------------------------------------------------

export interface WarriorOption {
  n: number;
  name: string;
  note: string;
  paint: () => Px;
}

export const OPTIONS: ReadonlyArray<WarriorOption> = [
  { n: 1, name: 'Little Big Knight', note: 'A child in armour two sizes too big: giant helm, huge plume, and a sword as tall as they are.', paint: littleKnight },
  { n: 2, name: 'Great-helm Crusader', note: 'Tall and narrow. Flat-topped helm, tabard to the ankles, the long sword held upright.', paint: crusader },
  { n: 3, name: 'Horned Barbarian', note: 'Broad and bare-armed in furs, with horns and a big beard. The sword rides across his shoulders.', paint: barbarian },
  { n: 4, name: 'Ponytail Duelist', note: 'Slim, in half armour, with a high ponytail and a short cape. A long thin blade held across her body.', paint: duelist },
  { n: 5, name: 'The Wall', note: 'Pauldrons and a tower shield, with a kettle hat and a big pink beard. Short broad sword.', paint: wall },
  { n: 6, name: 'Hooded Sellsword', note: 'Hood and ragged cloak, face in shadow, the long sword resting on one shoulder.', paint: sellsword },
  { n: 7, name: 'Sunburst Paladin', note: 'A cape to the floor, long hair, a crown of light behind her head. The blade held low.', paint: paladin },
  { n: 8, name: 'Winged Shield-maiden', note: 'Winged cap, long braids and a fur collar. A spear and a big painted round shield.', paint: shieldMaiden },
  { n: 9, name: 'Arena Champion', note: 'Fan-crested helm, one armoured arm, a skirt of straps. Short sword and small shield.', paint: champion },
  { n: 10, name: 'Scarf Knight', note: 'Pointed helm, a long scarf blowing in the wind, a kite shield, the sword at rest.', paint: scarfKnight },
];
