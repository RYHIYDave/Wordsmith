// Concept art, not part of the game: ten different designs for the RANGER, all in the colours of
// the chosen art style (the last look in LOOKS, "Bold and modern"), for the owner to pick from.
// Painted with the helpers of styles.ts, so the shading and the finish match the style sheet.

import { Px, mix } from '../engine/px';
import { FAX, FAY, LOOKS, ball, finish, hash, layer, limb, lit, stamp } from './styles';
import type { Look, Ramp } from './styles';

const N: Look = LOOKS[LOOKS.length - 1];
const INK = N.ink;

type V = readonly [number, number];

/** A light a figure gives off, in its own canvas: the page adds the glow. */
export interface Glow {
  x: number;
  y: number;
  r: number;
  color: string;
}
export const GLOWS = new WeakMap<Px, Glow[]>();

export interface Option {
  n: number;
  name: string;
  note: string;
  /** How the figure reads: a woman, a man, or either. */
  reads: 'woman' | 'man' | 'either';
  paint: () => Px;
}

// ---------------------------------------------------------------------------------------------
// Colours: the style's own ramps, and a few neighbours mixed from them.

function dim(r: Ramp): Ramp {
  return [r[0], r[0], r[1], r[2], r[3]];
}
function blend(a: Ramp, b: Ramp, t: number): Ramp {
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t), mix(a[3], b[3], t), mix(a[4], b[4], t)];
}

/** The ranger's green. */
const LEAF: Ramp = ['#0e4a2c', '#0e4a2c', '#22b060', '#8af078', '#8af078'];
/** The same green in shade: a dark cloth with a green edge of light. */
const PINE: Ramp = dim(LEAF);
/** Green leaning to the style's teal. */
const MOSS: Ramp = blend(LEAF, N.cloak, 0.5);
const DEEP = mix(LEAF[0], INK, 0.5);
const PLUM = N.leather;
const WOOD = N.wood;
const STEEL = N.steel;
const HOSE = N.mail;
const PINK = N.cloth;
const TEAL = N.cloak;
const CYAN = N.brass;
const SKIN: Ramp = [N.skin[0], N.skin[1], N.skin[2], N.skin[3], N.skin[3]];
const STRING = CYAN[3];
const SHAFT = STEEL[3];

// ---------------------------------------------------------------------------------------------
// Parts

interface Frame {
  X: number;
  B: number;
  hip: number;
  shoulderY: number;
  beltY: number;
  hipY: number;
  chinY: number;
}

/** The heights a standing figure is hung from. */
function frame(X: number, scale: number, legs = N.legs): Frame {
  const B = Math.round(N.bodyH * scale);
  const hip = Math.round(B * legs);
  const belt = hip + Math.max(4, Math.round((B - hip) * 0.36));
  return { X, B, hip, shoulderY: FAY - (B - 2), beltY: FAY - belt, hipY: FAY - hip, chinY: FAY - B };
}

/** Stack layers (each with the style's dark seam round it), with one under and one over that get none. */
function compose(under: Px | null, layers: ReadonlyArray<Px>, over: Px | null, glows: Glow[] = []): Px {
  const out = layer();
  if (under) out.blit(under, 0, 0);
  for (const l of layers) out.blit(l.outline(INK), 0, 0);
  const done = finish(out, N);
  if (over) done.blit(over, 0, 0);
  GLOWS.set(done, glows);
  return done;
}

function shape(p: Px, ramp: Ramp, paint: (l: Px) => void, lo: readonly [number, number] = N.lo): void {
  lit(p, ramp, N.hi, lo, paint);
}

/** A leg in hose with a boot; the toe points to screen-right. */
function bootLeg(p: Px, hipX: number, sole: number, len: number, w: number, far: boolean, hose: Ramp, share: number, bootR: Ramp = PLUM, cuff: Ramp | null = null): void {
  const top = sole - len;
  const bootTop = sole - Math.round(len * share);
  const boot = far ? dim(bootR) : bootR;
  lit(p, far ? dim(hose) : hose, [0, 2], [1, 2], (l) => l.rect(hipX, top, w, bootTop - top + 1, INK));
  lit(p, boot, [0, 2], [1, 2], (l) => {
    for (let y = bootTop; y <= sole; y++) {
      const c = y <= bootTop + 1;
      l.rect(hipX - (c ? 1 : 0), y, c ? w + 2 : y >= sole - 1 ? w + 3 : w, 1, INK);
    }
  });
  p.hline(hipX, sole, w + 3, boot[0]);
  if (cuff) p.hline(hipX - 1, bootTop, w + 2, cuff[far ? 2 : 3]).hline(hipX - 1, bootTop + 1, w + 2, cuff[far ? 1 : 2]);
}

/** A body part that narrows or widens from one height to another. */
function taper(p: Px, ramp: Ramp, X: number, y0: number, y1: number, h0: number, h1: number): void {
  lit(p, ramp, N.hi, [N.lo[0], N.lo[1] + 1], (l) => {
    for (let y = y0; y <= y1; y++) {
      const h = h0 + (h1 - h0) * ((y - y0) / Math.max(1, y1 - y0));
      l.rect(Math.round(X - h), y, Math.round(X + h) - Math.round(X - h), 1, INK);
    }
  });
}

function arm(p: Px, s: V, e: V, h: V, r: number, upper: Ramp, lower: Ramp): void {
  limb(p, s[0], s[1], e[0], e[1], r, r - 0.2, upper);
  limb(p, e[0], e[1], h[0], h[1], r - 0.2, r - 0.5, lower);
}

function fist(p: Px, hx: number, hy: number, r: Ramp = PLUM): void {
  const x = Math.round(hx) - 2;
  const y = Math.round(hy) - 2;
  p.rect(x, y, 4, 4, r[2]);
  p.hline(x, y, 3, r[4]).vline(x, y, 3, r[3]);
  p.hline(x + 1, y + 3, 3, r[1]).vline(x + 3, y + 1, 3, r[1]);
}

function belt(p: Px, X: number, y: number, half: number, strap: Ramp = dim(PLUM)): void {
  const x0 = Math.round(X - half);
  const w = Math.round(half * 2);
  p.rect(x0, y, w, 3, strap[2]);
  p.hline(x0, y, w, strap[3]).hline(x0, y + 2, w, strap[1]);
  stamp(p, X - 2, y, ['GYy', 'YVz', 'yzZ'], { G: CYAN[4], Y: CYAN[3], y: CYAN[2], z: CYAN[1], Z: CYAN[0], V: strap[0] });
}

/** A quiver: a leather tube and three glowing fletchings above its mouth. `lean` slants it. */
function quiver(p: Px, qx: number, qy: number, h = 11, lean = 0): void {
  lit(p, PLUM, [1, 2], [1, 2], (l) => {
    for (let i = 0; i < h; i++) l.rect(qx + Math.round(i * lean), qy + i, 4, 1, INK);
  });
  for (let k = 0; k < 3; k++) {
    const ax = qx + k + (k === 2 ? 1 : 0) - Math.round(lean * 3);
    const ay = qy - 3 - (k === 1 ? 1 : 0);
    p.set(ax, ay, CYAN[4]).set(ax, ay + 1, CYAN[3]).set(ax, ay + 2, CYAN[2]);
  }
}

/** Everything inside an ellipse, as a list of pixels. */
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

/**
 * A bow. (gx, gy) is the grip; `deg` turns it from upright (positive = the top leans right);
 * `side` says which way the belly bulges (+1 = right when upright). Returns the two tips.
 */
function bowAt(p: Px, gx: number, gy: number, H: number, k: number, deg: number, side: 1 | -1, thick = 2): { top: V; bot: V } {
  const a = (deg * Math.PI) / 180;
  const ax = Math.sin(a);
  const ay = -Math.cos(a);
  const bx = Math.cos(a) * side;
  const by = Math.sin(a) * side;
  const upright = Math.abs(ay) >= Math.abs(ax);
  const at = (t: number): V => {
    const u = Math.abs(t);
    const off = -k * t * t + (u > 0.86 ? (u - 0.86) * 2.8 * k : 0);
    return [gx + ax * t * H + bx * off, gy + ay * t * H + by * off];
  };
  const n = Math.ceil(H * 3);
  for (let pass = 0; pass < 2; pass++) {
    for (let i = -n; i <= n; i++) {
      const t = i / n;
      const u = Math.abs(t);
      const [x, y] = at(t);
      const px = Math.round(x);
      const py = Math.round(y);
      if (pass === 0) {
        if (thick >= 2 && u < 0.8) p.set(px + (upright ? 1 : 0), py + (upright ? 0 : 1), WOOD[u < 0.2 ? 1 : 2]);
        if (thick >= 3 && u < 0.55) p.set(px + (upright ? 2 : 0), py + (upright ? 0 : 2), WOOD[1]);
      } else p.set(px, py, WOOD[u < 0.2 ? 2 : 4]);
    }
  }
  return { top: at(1), bot: at(-1) };
}

function str(p: Px, a: V, b: V): void {
  p.line(a[0], a[1], b[0], b[1], STRING);
}

/** An arrow from its nock to its glowing head. */
function arrow(p: Px, from: V, to: V, glows: Glow[] | null = null): void {
  p.line(from[0], from[1], to[0], to[1], SHAFT);
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  for (let k = 0; k < 3; k++) p.set(Math.round(to[0] - (dx / len) * k), Math.round(to[1] - (dy / len) * k), k === 0 ? '#ffffff' : CYAN[3]);
  for (let k = 0; k < 3; k++) p.set(Math.round(from[0] + (dx / len) * k), Math.round(from[1] + (dy / len) * k), CYAN[2]);
  if (glows) glows.push({ x: to[0], y: to[1], r: 9, color: CYAN[3] });
}

/** A curved stroke that swells and thins: feathers, tails of hair, the flying end of a scarf. */
function sweep(p: Px, ramp: Ramp, pts: readonly [V, V, V, V], r0: number, r1: number, bulge = 0): void {
  lit(p, ramp, [0, 2], [0, 2], (l) => {
    for (let k = 0; k <= 48; k++) {
      const t = k / 48;
      const a = (1 - t) ** 3;
      const b = 3 * (1 - t) ** 2 * t;
      const c = 3 * (1 - t) * t ** 2;
      const d = t ** 3;
      const x = a * pts[0][0] + b * pts[1][0] + c * pts[2][0] + d * pts[3][0];
      const y = a * pts[0][1] + b * pts[1][1] + c * pts[2][1] + d * pts[3][1];
      const r = r0 + (r1 - r0) * t + bulge * Math.sin(Math.PI * t);
      l.ellipse(x, y, r, r, INK);
    }
  });
}

/** A hood: a ball, an optional peak, a dark opening with a lit edge and two eyes. */
function hood(p: Px, cx: number, cy: number, hr: number, ramp: Ramp, peak: ReadonlyArray<V> | null, dx: number, dy: number, rx: number, ry: number): void {
  if (peak) shape(p, ramp, (l) => l.poly(peak, INK));
  ball(p, cx, cy, hr, hr, ramp);
  const ox = cx + dx;
  const oy = cy + dy;
  const open = inEllipse(ox, oy, rx, ry);
  for (const [x, y] of open) p.set(x, y, N.eye);
  for (const [x, y] of open) if (!open.some(([a, b]) => a === x - 1 && b === y)) p.set(x - 1, y, ramp[4]);
  const eyeY = Math.round(oy - ry * 0.12);
  p.set(Math.round(ox - rx * 0.5), eyeY, N.glint).set(Math.round(ox + rx * 0.4), eyeY, N.glint);
}

// ---------------------------------------------------------------------------------------------
// 1. Long-cloak stalker: wrapped to the ankles, a tall hood whose tip droops, the bow held close.

function stalker(): Px {
  const { X, hip, shoulderY, beltY, chinY } = frame(36, 1.0);
  const R = 6;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const under = layer();
  const back = layer();
  quiver(back, X - 11, shoulderY - 7);
  const body = layer();
  bootLeg(body, X + 1, FAY - 3, hip - 2, 3, true, HOSE, 0.5);
  bootLeg(body, X - 4, FAY - 1, hip, 3, false, HOSE, 0.5);
  // the cloak, closed, down to the ankles
  const hem = FAY - 5;
  const half = (y: number): number => 8 + 5 * ((y - shoulderY) / (hem - shoulderY));
  const drift = (y: number): number => -Math.round(((y - shoulderY) / (hem - shoulderY)) * 2);
  lit(body, PINE, N.hi, [0, 4], (l) => {
    for (let y = shoulderY - 1; y <= hem; y++) {
      for (let x = Math.round(X - half(y)) + drift(y); x < Math.round(X + half(y)) + drift(y); x++) {
        if (y > hem - ((x + 40) % 5 < 2 ? 1 : 0)) continue;
        l.set(x, y, INK);
      }
    }
  });
  for (let y = shoulderY + 7; y <= hem; y++) {
    for (const f of [-0.6, -0.15, 0.62]) {
      const x = Math.round(X + f * half(y)) + drift(y);
      if (body.has(x, y) && hash(x, y, 3) > 0.2) body.set(x, y, DEEP);
    }
    // where the cloak's two edges meet, and a glimpse of its lining near the hem
    const t = (y - beltY) / (hem - beltY);
    const ox = X + 3 + drift(y);
    body.set(ox, y, DEEP);
    if (t > 0.35) for (let k = 1; k <= Math.round((t - 0.35) * 5); k++) if (body.has(ox + k, y)) body.set(ox + k, y, PINK[0]);
  }
  // one hand out of the cloak, holding the bow upright like a staff
  const gx = X + 12;
  const gy = beltY - 4;
  limb(body, X + 5, gy - 2, gx - 2, gy, 2.4, 2, MOSS);
  // the cowl on the shoulders, and the hood
  shape(body, MOSS, (l) => {
    for (let y = shoulderY - 3; y <= shoulderY + 6; y++) {
      const t = Math.max(0, (y - shoulderY) / 6);
      const h = 10.5 * Math.sqrt(1 - t * t * 0.5);
      for (let x = Math.round(X - h); x < Math.round(X + h); x++) {
        if (y === shoulderY + 6 && (x + 40) % 4 < 2) continue;
        l.set(x, y, INK);
      }
    }
  });
  body.set(X + 1, shoulderY + 2, CYAN[4]).set(X + 2, shoulderY + 2, CYAN[2]).set(X + 1, shoulderY + 3, CYAN[2]).set(X + 2, shoulderY + 3, CYAN[1]);
  const hr = R + 1.6;
  hood(
    body,
    cx,
    cy - 0.5,
    hr,
    MOSS,
    [
      [cx + 4, cy - 6],
      [cx - 0.5, cy - hr - 5],
      [cx - 5, cy - hr - 8],
      [cx - 8.5, cy - hr - 6],
      [cx - 8, cy - 2],
    ],
    1.6,
    1.4,
    hr * 0.5,
    hr * 0.68,
  );
  const bow = layer();
  const tips = bowAt(bow, gx, gy, 25, 5, 0, 1);
  str(under, tips.top, tips.bot);
  const hand = layer();
  fist(hand, gx, gy);
  return compose(under, [back, body, bow, hand], null);
}

// ---------------------------------------------------------------------------------------------
// 2. Braid and fur collar: bare-headed, a long braid, fur on the shoulders, the bow on her back.

function huntress(): Px {
  const { X, hip, shoulderY, beltY, hipY, chinY } = frame(37, 0.95);
  const R = 6;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const c = 5.5;
  const w = 4;
  const lw = 3;
  const back = layer();
  const tips = bowAt(back, X + 2, shoulderY + 6, 25, 8, 32, -1);
  str(back, tips.top, tips.bot);
  quiver(back, X - 11, shoulderY - 6);
  const body = layer();
  bootLeg(body, X + 1, FAY - 3, hip - 2, lw, true, HOSE, 0.62, PLUM, STEEL);
  bootLeg(body, X - lw - 1, FAY - 1, hip, lw, false, HOSE, 0.62, PLUM, STEEL);
  const hemY = hipY + 5;
  shape(body, LEAF, (l) => {
    for (let y = beltY + 2; y <= hemY; y++) {
      const h = w + 0.5 + ((y - beltY - 2) / (hemY - beltY - 2)) * 3.2;
      l.rect(Math.round(X - h), y, Math.round(X + h) - Math.round(X - h), 1, INK);
    }
  });
  for (let x = X - 8; x <= X + 8; x++) if (body.has(x, hemY)) body.set(x, hemY, CYAN[2]);
  // one arm hangs with a single arrow in the hand; the other hand is on the hip
  const hx = X - c - 2.5;
  const hy = beltY + 5;
  arrow(body, [hx + 1, hy - 9], [hx - 2, hy + 12]);
  arm(body, [X - c, shoulderY + 3], [X - c - 2, beltY - 3], [hx, hy - 2], 2, SKIN, PLUM);
  fist(body, hx, hy, SKIN);
  arm(body, [X + c, shoulderY + 3], [X + c + 6, beltY - 4], [X + w + 1, beltY + 1], 2, SKIN, PLUM);
  taper(body, LEAF, X, shoulderY, beltY - 1, c, w);
  // the string of the bow on her back crosses her chest
  for (let i = 0; i <= 60; i++) {
    const x = Math.round(tips.bot[0] + ((tips.top[0] - tips.bot[0]) * i) / 60);
    const y = Math.round(tips.bot[1] + ((tips.top[1] - tips.bot[1]) * i) / 60);
    if (body.has(x, y) && y < beltY) body.set(x, y, STRING);
  }
  belt(body, X, beltY, w + 0.5);
  // the fur collar
  for (const i of [-3, 3, -2, 2, -1, 1, 0]) ball(body, X + i * 3 + 0.5, shoulderY + 1.5 - Math.abs(i) * 0.5, 2.9, 2.6, STEEL);
  // head: hair first, then the face in front of it
  ball(body, cx - 0.5, cy - 0.8, R + 0.9, R + 0.7, PINK);
  ball(body, cx + 0.9, cy + 1.3, 4.9, 4.7, SKIN);
  const fx = Math.round(cx) + 1;
  const ey = Math.round(cy) + 1;
  body.set(fx - 1, ey, INK).set(fx - 1, ey + 1, INK).set(fx + 2, ey, INK).set(fx + 2, ey + 1, INK);
  body.hline(fx - 3, ey - 4, 8, PINK[2]).hline(fx + 1, ey - 3, 4, PINK[2]).set(fx + 4, ey - 2, PINK[2]);
  // the braid, over the shoulder and down the chest
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = cx - 5.3 + t * 2.2 + (i % 2 === 0 ? 0.5 : -0.5);
    const y = cy + 3 + t * (beltY - 3 - cy - 3);
    ball(body, x, y, 2, 1.7, PINK);
  }
  for (let i = 1; i <= n; i++) {
    const t = (i - 0.5) / n;
    body.set(Math.round(cx - 5.3 + t * 2.2), Math.round(cy + 3 + t * (beltY - 3 - cy - 3)), PINK[0]);
  }
  body.rect(Math.round(cx - 4.6), beltY - 2, 3, 1, CYAN[3]);
  body.set(Math.round(cx - 4.6), beltY - 1, PINK[3]).set(Math.round(cx - 3.6), beltY - 1, PINK[2]).set(Math.round(cx - 3.6), beltY, PINK[2]);
  return compose(null, [back, body], null);
}

// ---------------------------------------------------------------------------------------------
// 3. Feather-cap scout: a masked face, a soft cap with a long feather, a short cape, a hand
// reaching back for an arrow.

function scout(): Px {
  const { X, hip, shoulderY, beltY, hipY, chinY } = frame(38, 0.97);
  const R = 6;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const c = 6.5;
  const w = 5;
  const lw = 3;
  const ar = 2.1;
  const glows: Glow[] = [];
  const under = layer();
  const back = layer();
  shape(back, TEAL, (l) =>
    l.poly(
      [
        [X - 7, shoulderY - 1],
        [X + 7, shoulderY - 1],
        [X + 8, beltY + 2],
        [X - 2, hipY + 4],
        [X - 17, hipY + 1],
        [X - 12, shoulderY + 8],
      ],
      INK,
    ),
  );
  for (let y = shoulderY + 6; y <= hipY + 2; y++) for (const dx of [-9, -5]) if (back.has(X + dx - Math.round((y - shoulderY) * 0.2), y)) back.set(X + dx - Math.round((y - shoulderY) * 0.2), y, TEAL[0]);
  quiver(back, X - 13, shoulderY - 11);
  const body = layer();
  const gx = X + 15;
  const gy = beltY - 2;
  arm(body, [X + c, shoulderY + 3], [X + c + 4, shoulderY + 9], [gx, gy], ar, LEAF, PLUM);
  bootLeg(body, X + 1, FAY - 3, hip - 2, lw, true, HOSE, 0.42, PLUM, PLUM);
  bootLeg(body, X - lw - 1, FAY - 1, hip, lw, false, HOSE, 0.42, PLUM, PLUM);
  // a jerkin with a hem cut into points
  shape(body, LEAF, (l) => {
    for (let y = beltY + 3; y <= hipY + 5; y++) {
      for (let x = X - w - 2; x < X + w + 2; x++) {
        const tooth = (x - (X - w - 2)) % 4;
        if (y > hipY + (tooth === 1 || tooth === 2 ? 5 : 2)) continue;
        l.set(x, y, INK);
      }
    }
  });
  taper(body, LEAF, X, shoulderY, beltY - 1, c, w);
  for (let y = shoulderY; y < beltY; y++) {
    const t = (y - shoulderY) / Math.max(1, beltY - shoulderY - 1);
    const x = Math.round(X - c + 2 + (w - 1 + c - 2) * t);
    body.set(x, y, PLUM[1]).set(x + 1, y, PLUM[2]);
  }
  belt(body, X, beltY, w);
  // a magenta neckerchief
  shape(body, PINK, (l) =>
    l.poly(
      [
        [X - 5, shoulderY - 1],
        [X + 5, shoulderY - 1],
        [X + 1, shoulderY + 5],
      ],
      INK,
    ),
  );
  // head: a mask across the eyes, a soft cap that sags to one side
  ball(body, cx, cy, R, R, SKIN);
  const fx = Math.round(cx) + 1;
  const ey = Math.round(cy);
  for (const [x, y] of inEllipse(cx, cy, R, R)) if (y >= ey - 1 && y <= ey + 1) body.set(x, y, N.eye);
  body.set(fx - 2, ey, N.glint).set(fx + 1, ey, N.glint);
  shape(body, TEAL, (l) => {
    l.ellipse(cx + 0.5, cy - R + 1, R + 2.2, 3.6, INK);
    l.ellipse(cx + 4, cy - R + 2, R - 1.5, 4.2, INK);
  });
  for (let x = Math.round(cx - R); x <= Math.round(cx + R); x++) if (body.has(x, ey - 2)) body.set(x, ey - 2, TEAL[0]);
  sweep(
    body,
    CYAN,
    [
      [cx + 1, cy - R - 1],
      [cx + 4, cy - R - 12],
      [cx - 4, cy - R - 17],
      [cx - 12, cy - R - 11],
    ],
    1.1,
    0.7,
    1,
  );
  glows.push({ x: cx - 1, y: cy - R - 12, r: 12, color: CYAN[3] });
  // the arm that reaches over the shoulder for an arrow
  const reach = layer();
  arm(reach, [X - c, shoulderY + 3], [X - c - 7, shoulderY - 1], [X - c - 4.5, shoulderY - 7], ar, LEAF, LEAF);
  fist(reach, X - c - 4.5, shoulderY - 8.5);
  const bow = layer();
  const tips = bowAt(bow, gx, gy, 19, 5, 10, 1);
  str(under, tips.top, tips.bot);
  const hand = layer();
  fist(hand, gx, gy);
  return compose(under, [back, body, reach, bow, hand], null, glows);
}

// ---------------------------------------------------------------------------------------------
// 4. Tall longbow: long legs, cropped hair and a beard, a very big bow carried across the shoulders.

function tall(): Px {
  const { X, hip, shoulderY, beltY, hipY, chinY } = frame(42, 1.13, 0.56);
  const R = 5.2;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const c = 7.5;
  const w = 4.5;
  const lw = 3;
  const under = layer();
  const back = layer();
  quiver(back, X + 5, shoulderY - 8, 12);
  const body = layer();
  bootLeg(body, X + 1, FAY - 3, hip - 2, lw, true, HOSE, 0.45);
  bootLeg(body, X - lw - 1, FAY - 1, hip, lw, false, HOSE, 0.45);
  // the far arm hangs, a thumb in the sash
  arm(body, [X + c, shoulderY + 3], [X + c + 2, beltY - 4], [X + c - 0.5, beltY + 2], 2.3, dim(SKIN), dim(PLUM));
  taper(body, PLUM, X, shoulderY, beltY - 1, c, w);
  // the open neck of the jerkin
  for (let k = 0; k < 4; k++) for (let x = X - 3 + k; x <= X + 2 - k; x++) body.set(x, shoulderY + k, SKIN[k === 0 ? 1 : 2]);
  for (let y = shoulderY + 5; y < beltY - 1; y += 2) body.set(X, y, PLUM[0]).set(X + 1, y, PLUM[4]);
  // a green sash, its end hanging at the hip
  body.rect(Math.round(X - w - 0.5), beltY - 1, Math.round(w * 2 + 1), 4, LEAF[2]);
  body.hline(Math.round(X - w - 0.5), beltY - 1, Math.round(w * 2 + 1), LEAF[3]).hline(Math.round(X - w - 0.5), beltY + 2, Math.round(w * 2 + 1), LEAF[1]);
  shape(body, LEAF, (l) => {
    for (let y = beltY + 2; y <= hipY + 10; y++) l.rect(X + w - 2 + Math.round((y - beltY) * 0.12), y, 4, 1, INK);
  });
  fist(body, X + c - 0.5, beltY + 2, dim(SKIN));
  // head: short dark hair, a headband, a beard
  ball(body, cx, cy, R, R, SKIN);
  const fx = Math.round(cx) + 1;
  const ey = Math.round(cy);
  for (const [x, y] of inEllipse(cx, cy, R, R)) {
    if (y <= ey - 3) body.set(x, y, WOOD[x < cx - 1 ? 3 : 2]);
    else if (y === ey - 2) body.set(x, y, CYAN[x < cx ? 3 : 2]);
    else if (y >= ey + 3) body.set(x, y, WOOD[y >= ey + 4 ? 1 : 2]);
  }
  body.set(fx - 2, ey, INK).set(fx + 1, ey, INK);
  body.set(Math.round(cx - R) - 1, ey - 2, CYAN[2]).set(Math.round(cx - R) - 2, ey - 1, CYAN[2]).set(Math.round(cx - R) - 2, ey, CYAN[0]);
  // a bow taller than he is, its foot on the floor, held at arm's length
  const gx = X - c - 9;
  const gy = beltY + 1;
  const bow = layer();
  const tips = bowAt(bow, gx, gy, 33, 10, 0, -1, 3);
  str(bow, tips.top, tips.bot);
  const front = layer();
  arm(front, [X - c, shoulderY + 3], [X - c - 4, shoulderY + 10], [gx + 1, gy - 0.5], 2.3, SKIN, PLUM);
  fist(front, gx + 0.5, gy);
  return compose(under, [back, body, bow, front], null);
}

// ---------------------------------------------------------------------------------------------
// 5. Bandana and scarf: small and quick. A scarf over the nose, a bandana, an arrow on the string.

function sneak(): Px {
  const { X, hip, shoulderY, beltY, chinY } = frame(37, 0.8, 0.46);
  const R = 6.3;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const c = 6;
  const w = 5;
  const ar = 2.2;
  const glows: Glow[] = [];
  const back = layer();
  // the scarf's long end and the bandana's tails fly out behind
  sweep(
    back,
    TEAL,
    [
      [cx - 4, chinY - 1],
      [cx - 11, chinY - 4],
      [cx - 15, chinY + 3],
      [cx - 23, chinY - 2],
    ],
    2.4,
    1.1,
    0.6,
  );
  sweep(
    back,
    PINK,
    [
      [cx - 5, cy - 3],
      [cx - 9, cy - 5],
      [cx - 11, cy - 1],
      [cx - 14, cy - 3],
    ],
    1.5,
    0.8,
  );
  sweep(
    back,
    PINK,
    [
      [cx - 5, cy - 2],
      [cx - 8, cy],
      [cx - 10, cy + 3],
      [cx - 12, cy + 3],
    ],
    1.4,
    0.8,
  );
  // a short quiver across the small of the back
  quiver(back, X + 5, shoulderY - 5, 9);
  const body = layer();
  // wide stance, baggy trousers
  bootLeg(body, X + 2, FAY - 3, hip - 2, 4, true, HOSE, 0.42);
  bootLeg(body, X - 7, FAY - 1, hip, 4, false, HOSE, 0.42);
  taper(body, HOSE, X, beltY + 2, beltY + 6, w + 1, w + 2.5);
  taper(body, LEAF, X, shoulderY, beltY - 1, c, w);
  body.vline(X, shoulderY + 3, beltY - shoulderY - 4, LEAF[1]);
  belt(body, X, beltY, w + 0.5);
  // head: bandana above, scarf below, eyes between
  ball(body, cx, cy, R, R, SKIN);
  const fx = Math.round(cx) + 1;
  const ey = Math.round(cy);
  for (const [x, y] of inEllipse(cx, cy, R, R)) if (y >= ey - 1 && y <= ey + 1) body.set(x, y, N.eye);
  body.set(fx - 3, ey, N.glint).set(fx - 2, ey, N.glint).set(fx + 1, ey, N.glint).set(fx + 2, ey, N.glint);
  shape(body, PINK, (l) => {
    for (const [x, y] of inEllipse(cx, cy - 0.3, R + 0.6, R + 0.6)) if (y <= ey - 2) l.set(x, y, INK);
  });
  shape(body, TEAL, (l) => {
    for (const [x, y] of inEllipse(cx, cy + 0.6, R + 0.5, R + 0.4)) if (y >= ey + 2) l.set(x, y, INK);
    l.ellipse(X, shoulderY + 0.5, c + 0.5, 2.6, INK);
  });
  // the bow, held low and ready, an arrow already on the string
  const gx = X + 11;
  const gy = beltY - 1;
  const bow = layer();
  const over = layer();
  const tips = bowAt(bow, gx, gy, 15, 4, 24, 1);
  str(over, tips.top, tips.bot);
  arm(body, [X + c, shoulderY + 3], [X + c + 3, shoulderY + 7], [gx, gy], ar, HOSE, PLUM);
  const front = layer();
  const ax = X - c - 4;
  const ay = beltY + 1;
  arrow(front, [ax + 5, ay - 6], [ax - 6, ay + 7], glows);
  arm(front, [X - c, shoulderY + 3], [X - c - 2.5, beltY - 4], [ax, ay - 1], ar, HOSE, PLUM);
  fist(front, ax, ay);
  const hand = layer();
  fist(hand, gx, gy);
  return compose(null, [back, body, bow, hand, front], over, glows);
}

// ---------------------------------------------------------------------------------------------
// 6. Walking bush: a mantle of leaves from the crown to the knee, twigs on top, two eyes inside.

function bush(): Px {
  const { X, hip, shoulderY, beltY, hipY, chinY } = frame(36, 0.92);
  const R = 6;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const under = layer();
  const back = layer();
  quiver(back, X - 13, shoulderY - 5);
  const body = layer();
  bootLeg(body, X + 1, FAY - 3, hip - 2, 3, true, HOSE, 0.6);
  bootLeg(body, X - 4, FAY - 1, hip, 3, false, HOSE, 0.6);
  // the arm that holds the bow comes out of the leaves
  const gx = X + 16;
  const gy = beltY - 2;
  limb(body, X + 8, gy - 1, gx, gy, 2.4, 2, PINE);
  // the mantle: a dome of dark green, then leaves laid over it like roof tiles
  const top = cy - 10;
  const hem = hipY + 6;
  const half = (y: number): number => {
    const t = Math.min(1, ((y - top) / (hem - top)) * 1.2);
    return 14.5 * Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t)));
  };
  for (let y = Math.round(top); y <= hem; y++) for (let x = Math.round(X - half(y)); x < Math.round(X + half(y)); x++) body.set(x, y, LEAF[0]);
  const tones: ReadonlyArray<Ramp> = [LEAF, LEAF, MOSS, PINE];
  for (let row = Math.ceil((hem + 1 - top) / 3); row >= 0; row--) {
    const y = Math.round(top) + row * 3;
    for (let col = -5; col <= 5; col++) {
      const x = X + col * 4 + (row % 2 === 0 ? 0 : 2);
      if (Math.abs(x + 1 - X) > half(Math.min(hem, y)) + 0.5) continue;
      const r = tones[Math.floor(hash(col, row, 7) * tones.length)];
      // a leaf: lit above, shaded below, coming to a point
      stamp(body, x - 1, y, ['.HH.', 'HMMm', 'MMmm', '.md.', '..d.'], { H: r[3], M: r[2], m: r[2], d: r[1] });
    }
  }
  // a few flowers, because it is a child's dream
  for (const [fx, fy] of [[X - 8, shoulderY + 9], [X + 6, shoulderY + 15], [X - 2, hipY + 2]] as const) {
    body.set(fx, fy, PINK[3]).set(fx + 1, fy, PINK[2]).set(fx, fy + 1, PINK[2]).set(fx + 1, fy + 1, PINK[0]);
  }
  // the face: a dark hollow under the leaves
  const open = inEllipse(cx + 1, cy + 1.5, 5, 3.2);
  for (const [x, y] of open) body.set(x, y, N.eye);
  body.set(Math.round(cx) - 1, Math.round(cy) + 1, N.glint).set(Math.round(cx) + 3, Math.round(cy) + 1, N.glint);
  // twigs on top
  body.line(cx - 3, top + 1, cx - 6, top - 6, PLUM[2]);
  body.line(cx - 5, top - 3, cx - 8, top - 4, PLUM[2]);
  body.line(cx + 3, top + 2, cx + 6, top - 4, PLUM[1]);
  stamp(body, Math.round(cx - 8), Math.round(top - 9), ['.H.', 'HMm', '.m.'], { H: LEAF[3], M: LEAF[2], m: LEAF[1] });
  stamp(body, Math.round(cx - 11), Math.round(top - 6), ['.H.', 'HMm', '.m.'], { H: LEAF[3], M: LEAF[2], m: LEAF[1] });
  stamp(body, Math.round(cx + 5), Math.round(top - 7), ['.H.', 'HMm', '.m.'], { H: MOSS[3], M: MOSS[2], m: MOSS[1] });
  const bow = layer();
  const tips = bowAt(bow, gx, gy, 18, 5, 16, 1);
  str(bow, tips.top, tips.bot);
  // leaves tied along the bow
  for (const t of [-0.6, -0.3, 0.35, 0.65]) {
    const x = Math.round(gx + Math.sin(0.28) * t * 18 - 5 * t * t * 0.9);
    const y = Math.round(gy - Math.cos(0.28) * t * 18);
    bow.set(x + 1, y, LEAF[3]).set(x + 2, y, LEAF[2]).set(x + 2, y + 1, LEAF[2]);
  }
  const hand = layer();
  fist(hand, gx, gy, LEAF);
  return compose(under, [back, body, bow, hand], null);
}

// ---------------------------------------------------------------------------------------------
// 7. Hat and long coat: a wide brim, a long plum coat, a hand to the hat, the bow carried low.

function hatter(): Px {
  const { X, hip, shoulderY, beltY, chinY } = frame(39, 1.03);
  const R = 5.8;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const c = 8;
  const w = 6;
  const under = layer();
  const back = layer();
  quiver(back, X - 11, shoulderY - 6);
  const body = layer();
  bootLeg(body, X + 1, FAY - 3, hip - 2, 3, true, HOSE, 0.5);
  bootLeg(body, X - 4, FAY - 1, hip, 3, false, HOSE, 0.5);
  // the coat: two panels that part below the belt
  const hem = FAY - 9;
  shape(body, PLUM, (l) => {
    for (let y = shoulderY; y <= hem; y++) {
      const below = y > beltY;
      const t = below ? (y - beltY) / (hem - beltY) : (y - shoulderY) / (beltY - shoulderY);
      const h = below ? w + 0.5 + t * 4.5 : c + (w + 0.5 - c) * t;
      const drift = below ? -Math.round(t * 2) : 0;
      const gap = below ? Math.round(t * 5) : 0;
      for (let x = Math.round(X - h) + drift; x < Math.round(X + h) + drift; x++) {
        if (gap > 0 && x >= X + 1 - Math.floor(gap / 2) && x < X + 1 + Math.ceil(gap / 2)) continue;
        if (y === hem && (x + 40) % 3 === 0) continue;
        l.set(x, y, INK);
      }
    }
  }, [0, 4]);
  // lapels, buttons
  for (let k = 0; k < 7; k++) body.set(X - 4 + Math.round(k * 0.6), shoulderY + 1 + k, PLUM[4]).set(X + 4 - Math.round(k * 0.5), shoulderY + 1 + k, PLUM[0]);
  body.set(X + 2, beltY - 4, CYAN[3]).set(X + 2, beltY - 7, CYAN[3]);
  belt(body, X, beltY, w + 0.5);
  // a green scarf at the neck, one end hanging
  shape(body, LEAF, (l) => {
    l.ellipse(X, shoulderY, 5.5, 2.4, INK);
    l.rect(X - 4, shoulderY + 1, 3, 7, INK);
  });
  // the near arm hangs, the bow in its hand
  const gx = X - c - 5;
  const gy = beltY + 6;
  arm(body, [X - c, shoulderY + 3], [X - c - 2.5, beltY - 3], [gx + 1, gy - 2], 2.5, PLUM, PLUM);
  // head: a jaw and a short beard under the shadow of the brim
  ball(body, cx, cy, R, R, SKIN);
  const fx = Math.round(cx) + 1;
  const ey = Math.round(cy);
  for (const [x, y] of inEllipse(cx, cy, R, R)) {
    if (y <= ey + 1) body.set(x, y, N.eye);
    else if (y >= ey + 4) body.set(x, y, WOOD[2]);
  }
  body.set(fx - 2, ey, N.glint).set(fx + 1, ey, N.glint);
  // the hat
  shape(body, PINE, (l) => {
    l.ellipse(cx, cy - 3.6, 13.5, 2.6, INK);
    for (let y = Math.round(cy - 11.5); y <= Math.round(cy - 4.5); y++) {
      const t = (y - (cy - 11.5)) / 7;
      const h = 4.6 + t * 1.6;
      l.rect(Math.round(cx - h), y, Math.round(cx + h) - Math.round(cx - h), 1, INK);
    }
  });
  for (let x = Math.round(cx - 7); x <= Math.round(cx + 7); x++) {
    if (body.get(x, Math.round(cy - 6.5)) !== null && Math.abs(x + 0.5 - cx) < 6.3) body.set(x, Math.round(cy - 6.5), LEAF[x < cx - 2 ? 3 : 2]);
  }
  // the far hand goes up to the brim
  const tip = layer();
  arm(tip, [X + c - 1, shoulderY + 3], [X + c + 6, shoulderY + 1], [X + c + 3.5, cy - 2], 2.5, dim(PLUM), dim(PLUM));
  fist(tip, X + c + 3, cy - 2.5, dim(PLUM));
  const bow = layer();
  const tips = bowAt(bow, gx, gy, 19, 6, -24, -1);
  str(bow, tips.top, tips.bot);
  const hand = layer();
  fist(hand, gx, gy, dim(PLUM));
  return compose(under, [back, body, tip, bow, hand], null);
}

// ---------------------------------------------------------------------------------------------
// 8. Poncho: pigtails, a striped poncho with a fringe, the bow resting on her shoulder.

function poncho(): Px {
  const { X, hip, shoulderY, beltY, hipY, chinY } = frame(35, 0.88);
  const R = 6.3;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const under = layer();
  const back = layer();
  // pigtails, behind the head
  for (const s of [-1, 1]) {
    const ramp = s > 0 ? dim(TEAL) : TEAL;
    sweep(
      back,
      ramp,
      [
        [cx + s * 5.5, cy],
        [cx + s * 10, cy - 1],
        [cx + s * 10.5, cy + 5],
        [cx + s * 9, cy + 10],
      ],
      2.6,
      0.9,
      0.9,
    );
  }
  const body = layer();
  bootLeg(body, X + 1, FAY - 3, hip - 2, 3, true, HOSE, 0.55, PLUM, PINK);
  bootLeg(body, X - 4, FAY - 1, hip, 3, false, HOSE, 0.55, PLUM, PINK);
  // the poncho: a wide triangle with its point in front
  const pTop = shoulderY - 2;
  const pSide = hipY + 1;
  const pTip = hipY + 9;
  const edge = (x: number): number => pSide + (pTip - pSide) * (1 - Math.abs(x + 0.5 - X) / 16);
  const inside = (x: number, y: number): boolean => {
    const t = (y - pTop) / (pSide - pTop);
    const h = 4 + 12 * Math.min(1, Math.max(0, t)) ** 0.85;
    return y >= pTop && Math.abs(x + 0.5 - X) <= h && y <= edge(x);
  };
  shape(body, LEAF, (l) => {
    for (let y = pTop; y <= pTip; y++) for (let x = X - 17; x <= X + 17; x++) if (inside(x, y)) l.set(x, y, INK);
  }, [0, 4]);
  // stripes that follow the hem, and a fringe
  for (let x = X - 17; x <= X + 17; x++) {
    const e = Math.floor(edge(x));
    if (!inside(x, e)) continue;
    if (inside(x, e - 3)) body.set(x, e - 3, PINK[x < X ? 3 : 2]);
    if (inside(x, e - 4)) body.set(x, e - 4, PINK[x < X ? 2 : 1]);
    if (inside(x, e - 7)) body.set(x, e - 7, CYAN[x < X ? 3 : 2]);
    if ((x + 40) % 2 === 0) body.set(x, e + 1, LEAF[x < X ? 3 : 2]);
  }
  // the strap of the quiver, and the quiver at the hip
  for (let i = 0; i <= 30; i++) {
    const x = Math.round(X + 6 - (i / 30) * 17);
    const y = Math.round(pTop + 2 + (i / 30) * (pSide - pTop - 6));
    if (body.has(x, y)) body.set(x, y, PLUM[1]);
  }
  quiver(body, X - 14, pSide - 6, 11, -0.2);
  // the hand that holds the bow comes out from under the poncho
  const hx = X + 2.5;
  const hy = shoulderY + 5.5;
  // collar
  shape(body, PINK, (l) => l.ellipse(X, shoulderY - 0.5, 5.5, 2.3, INK));
  // head: a fringe and a ribbon
  ball(body, cx - 0.3, cy - 0.8, R + 0.8, R + 0.6, TEAL);
  ball(body, cx + 0.8, cy + 1.4, 5.1, 4.8, SKIN);
  const fx = Math.round(cx) + 1;
  const ey = Math.round(cy) + 1;
  body.set(fx - 1, ey, INK).set(fx - 1, ey + 1, INK).set(fx + 2, ey, INK).set(fx + 2, ey + 1, INK);
  body.hline(fx - 3, ey - 4, 8, TEAL[2]).hline(fx - 3, ey - 3, 3, TEAL[2]).hline(fx + 2, ey - 3, 3, TEAL[2]);
  for (const s of [-1, 1]) body.set(Math.round(cx + s * 6.2), Math.round(cy) - 1, PINK[3]).set(Math.round(cx + s * 6.2), Math.round(cy), PINK[2]);
  const bow = layer();
  const tips = bowAt(bow, X + 13, shoulderY - 5, 18, 4, 38, 1);
  str(under, tips.top, tips.bot);
  fist(body, hx, hy, SKIN);
  return compose(under, [back, body, bow], null);
}

// ---------------------------------------------------------------------------------------------
// 9. Full draw: the bow raised, the string at her cheek, a ponytail flying.

function drawn(): Px {
  const { X, hip, shoulderY, beltY, hipY, chinY } = frame(29, 0.97);
  const R = 6;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const c = 6;
  const w = 4.5;
  const glows: Glow[] = [];
  const back = layer();
  // a short cape and a ponytail, both blown back
  shape(back, MOSS, (l) =>
    l.poly(
      [
        [X - 5, shoulderY],
        [X + 4, shoulderY],
        [X, beltY - 1],
        [X - 15, beltY + 6],
        [X - 12, beltY - 3],
        [X - 8, shoulderY + 4],
      ],
      INK,
    ),
  );
  sweep(
    back,
    STEEL,
    [
      [cx - 3, cy - 5],
      [cx - 10, cy - 10],
      [cx - 15, cy - 4],
      [cx - 17, cy + 5],
    ],
    2.4,
    0.9,
    0.8,
  );
  quiver(back, X - 9, beltY + 1, 12, -0.35);
  const body = layer();
  // a braced stance, tall boots
  bootLeg(body, X + 3, FAY - 3, hip - 2, 3, true, HOSE, 0.68);
  bootLeg(body, X - 7, FAY - 1, hip, 3, false, HOSE, 0.68);
  shape(body, LEAF, (l) => {
    for (let y = beltY + 2; y <= hipY + 4; y++) {
      const h = w + 1 + ((y - beltY - 2) / (hipY + 2 - beltY)) * 3.5;
      l.rect(Math.round(X - 1 - h), y, Math.round(h * 2), 1, INK);
    }
  });
  // the bow arm, straight out
  const gx = X + 24;
  const gy = shoulderY + 1;
  arm(body, [X + c, shoulderY + 2.5], [X + c + 8, shoulderY + 2.3], [gx - 1, gy + 0.5], 2.1, dim(SKIN), dim(PLUM));
  taper(body, LEAF, X, shoulderY, beltY - 1, c, w);
  body.rect(Math.round(X - w - 0.5), beltY - 3, Math.round(w * 2 + 1), 3, PLUM[2]);
  body.hline(Math.round(X - w - 0.5), beltY - 3, Math.round(w * 2 + 1), PLUM[3]);
  belt(body, X, beltY, w + 0.5);
  shape(body, MOSS, (l) => l.ellipse(X, shoulderY, 7, 2.7, INK));
  // head, turned toward the target
  ball(body, cx - 0.8, cy - 0.8, R + 0.8, R + 0.6, STEEL);
  ball(body, cx + 1.4, cy + 1.3, 4.8, 4.7, SKIN);
  const fx = Math.round(cx) + 2;
  const ey = Math.round(cy) + 1;
  body.set(fx - 1, ey, INK).set(fx - 1, ey + 1, INK).set(fx + 2, ey, INK).set(fx + 2, ey + 1, INK);
  body.hline(fx - 4, ey - 4, 9, STEEL[2]).hline(fx - 4, ey - 3, 4, STEEL[2]);
  body.set(Math.round(cx - 3), Math.round(cy - 6), CYAN[3]).set(Math.round(cx - 4), Math.round(cy - 5), CYAN[2]);
  // the bow, bent, the string drawn back to the cheek
  const bow = layer();
  const over = layer();
  const tips = bowAt(bow, gx, gy, 19, 8, 0, 1);
  const nock: V = [X + 4, shoulderY - 1];
  str(over, tips.top, nock);
  str(over, nock, tips.bot);
  arrow(over, nock, [gx + 7, gy - 2], glows);
  const hand = layer();
  fist(hand, gx, gy, dim(PLUM));
  // the drawing arm: elbow high and back, hand at the jaw
  const front = layer();
  arm(front, [X - c, shoulderY + 2.5], [X - c - 7, shoulderY - 0.5], [nock[0] - 2, nock[1] + 0.5], 2.1, SKIN, PLUM);
  fist(front, nock[0] - 1, nock[1] + 0.5);
  return compose(null, [back, body, bow, hand, front], over, glows);
}

// ---------------------------------------------------------------------------------------------
// 10. Wolf-hood tracker: crouched, one hand to the ground, a pelt with ears and a tail.

function tracker(): Px {
  const X = 37;
  const glows: Glow[] = [];
  const FUR: Ramp = dim(STEEL);
  const under = layer();
  const back = layer();
  quiver(back, X + 3, 61, 12, 0.3);
  const body = layer();
  // the far leg: knee up
  limb(body, X + 2, 79, X + 9, 75, 2.9, 2.6, dim(HOSE));
  limb(body, X + 9, 75, X + 8, 87, 2.5, 2.2, dim(PLUM));
  body.rect(X + 6, 87, 7, 3, dim(PLUM)[2]);
  body.hline(X + 6, 89, 7, PLUM[0]);
  // the body, leaning forward
  shape(body, LEAF, (l) => l.ellipse(X - 2.5, 72, 6.5, 8, INK));
  // the near leg: folded under
  limb(body, X - 1, 80, X - 9, 78, 3, 2.7, HOSE);
  limb(body, X - 9, 78, X - 6, 88, 2.6, 2.3, PLUM);
  body.rect(X - 8, 88, 7, 3, PLUM[2]);
  body.hline(X - 8, 88, 6, PLUM[3]).hline(X - 8, 90, 7, PLUM[0]);
  // the arm that holds the bow upright
  const gx = X + 17;
  const gy = 70;
  arm(body, [X + 2, 67], [X + 9, 70], [gx - 1, gy], 2.2, dim(LEAF), dim(PLUM));
  // the pelt over the back and shoulders
  shape(body, FUR, (l) => {
    l.ellipse(X - 3, 65, 9, 3.4, INK);
    l.poly([[X + 2, 63], [X + 8, 66], [X + 8, 74], [X + 5, 78], [X + 3, 70]], INK);
  });
  for (let x = X - 11; x <= X + 5; x += 2) if (body.has(x, 67)) body.set(x, 68, FUR[3]);
  // the hood: the wolf's head, with its ears
  const cx = X - 8.5;
  const cy = 57;
  const hr = 7.2;
  shape(body, FUR, (l) => {
    l.poly([[cx - 6.5, cy - 3], [cx - 5.5, cy - 11], [cx - 1, cy - 6]], INK);
    l.poly([[cx + 1, cy - 6.5], [cx + 5, cy - 11], [cx + 6.5, cy - 3]], INK);
  });
  hood(body, cx, cy, hr, FUR, null, -1.2, 1.6, 4.2, 4.6);
  body.set(Math.round(cx - 5), Math.round(cy - 8), PINK[2]).set(Math.round(cx + 4), Math.round(cy - 8), PINK[1]);
  // a snout over the brow: two fangs of the pelt hang over the opening
  body.set(Math.round(cx - 4), Math.round(cy - 3), STEEL[3]).set(Math.round(cx + 1), Math.round(cy - 3), STEEL[3]);
  // the near arm: fingers to the floor
  const front = layer();
  arm(front, [X - 10, 67], [X - 14, 77], [X - 16, 86], 2.2, LEAF, PLUM);
  fist(front, X - 16, 88.5);
  front.set(X - 19, 90, PLUM[3]).set(X - 17, 91, PLUM[3]).set(X - 15, 91, PLUM[2]);
  const bow = layer();
  const tips = bowAt(bow, gx, gy, 21, 5, 0, 1);
  str(under, tips.top, tips.bot);
  const hand = layer();
  fist(hand, gx, gy, dim(PLUM));
  return compose(under, [back, body, bow, hand, front], null, glows);
}

// ---------------------------------------------------------------------------------------------

export const RANGERS: ReadonlyArray<Option> = [
  { n: 1, name: 'Feather-cap scout', note: 'Masked, in a soft cap with a glowing feather and a short cape, reaching back for an arrow.', reads: 'either', paint: scout },
  { n: 2, name: 'Braid and fur collar', note: 'Bare-headed, a long pink braid, fur on her shoulders, a hand on her hip. The bow is slung across her back.', reads: 'woman', paint: huntress },
  { n: 3, name: 'Long-cloak stalker', note: 'Wrapped to the ankles in a dark cloak under a tall, drooping hood. The bow is held close, like a staff.', reads: 'either', paint: stalker },
  { n: 4, name: 'Tall longbow', note: 'Long legs, cropped hair and a beard. A bow taller than he is, planted on the floor like a staff.', reads: 'man', paint: tall },
  { n: 5, name: 'Bandana and scarf', note: 'The small, quick one: a scarf over the nose, bandana tails flying, an arrow ready in the other hand.', reads: 'either', paint: sneak },
  { n: 6, name: 'Walking bush', note: 'A mantle of leaves from crown to knee, twigs on top. Only two eyes and the bow show.', reads: 'either', paint: bush },
  { n: 7, name: 'Hat and long coat', note: 'A wide brim, a long plum coat, a hand to the hat. The bow hangs low at his side.', reads: 'man', paint: hatter },
  { n: 8, name: 'Poncho and pigtails', note: 'A striped poncho with a fringe, teal pigtails, the bow resting on her shoulder like a fishing rod.', reads: 'woman', paint: poncho },
  { n: 9, name: 'Full draw', note: 'Bow up, string at her cheek, ponytail flying, a glowing arrow aimed at whatever is over there.', reads: 'woman', paint: drawn },
  { n: 10, name: 'Wolf-hood tracker', note: 'Crouched with one hand to the floor, under a pelt hood with pointed ears. The bow stands beside.', reads: 'either', paint: tracker },
];

/** Where the figures stand on their canvas. */
export const ANCHOR = { x: FAX, y: FAY };
