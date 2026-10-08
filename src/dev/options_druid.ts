// Concept art, not part of the game: ten different designs for the DRUID (a new class that changes
// shape), all in the colours of the chosen art style (the last look in LOOKS, "Bold and modern"),
// for the owner to pick from. These are the druid's own two-legged form; the shapes (bull, owl,
// squid) come later. Painted with the helpers of styles.ts, so the shading and the finish match the
// sheets of the ranger, the mage and the warrior.

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

/** A material in shade: one tone darker all through. */
function dim(r: Ramp): Ramp {
  return [r[0], r[0], r[1], r[2], r[3]];
}
/** The same material on the side away from the light: not as dark as dim(). */
function far(r: Ramp): Ramp {
  return [r[0], r[0], mix(r[0], r[2], 0.55), r[2], r[2]];
}
function blend(a: Ramp, b: Ramp, t: number): Ramp {
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t), mix(a[3], b[3], t), mix(a[4], b[4], t)];
}

const PLUM = N.leather;
const PINK = N.cloth;
const STEEL = N.steel;
const HOSE = N.mail;
const BONE = N.bone;
/**
 * The druid's own colour: AMBER. Honey where the light falls, amber in the body, and a shade of wine
 * pulled toward the style's plum, the way its pink and its cyan keep their colour in shade. None of
 * the three heroes wears a warm colour, so it cannot be taken for the ranger's green, the mage's
 * purple or the warrior's teal and pink.
 */
export const AMBER: Ramp = ['#7a2e3c', '#7a2e3c', '#f09a2c', '#ffe08a', '#ffe08a'];
/** Bark: the style's plum leather, warmed with the amber. Staffs, masks, pelts. */
const BARK: Ramp = blend(PLUM, AMBER, 0.3);
/** The druid's cloth: bark in deep shade, with an edge of amber light. */
const DUSK: Ramp = [BARK[0], BARK[0], BARK[0], mix(BARK[2], AMBER[2], 0.4), mix(BARK[3], AMBER[3], 0.4)];
/** A fold in that cloth. */
const SHADE = mix(BARK[0], INK, 0.45);
/** Straw, wicker and new-cut wood: half way from the bark to the amber. */
const STRAW: Ramp = blend(BARK, AMBER, 0.5);
/** Leaves that have turned further: the amber leaning to the style's pink. */
const RUST: Ramp = blend(AMBER, PINK, 0.4);
const SKIN: Ramp = [N.skin[0], N.skin[1], N.skin[2], N.skin[3], N.skin[3]];
/** What shines: buds, fireflies, eyes in the dark. */
const LIGHT = AMBER[3];
const HOT = '#fff6d0';

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

/** Stack layers (each with the style's dark seam round it), then what shines, which gets none. */
function compose(layers: ReadonlyArray<Px>, over: Px, glows: Glow[]): Px {
  const out = layer();
  for (const l of layers) out.blit(l.outline(INK), 0, 0);
  const done = finish(out, N);
  done.blit(over, 0, 0);
  GLOWS.set(done, glows);
  return done;
}

function shape(p: Px, ramp: Ramp, paint: (l: Px) => void, lo: readonly [number, number] = N.lo): void {
  lit(p, ramp, N.hi, lo, paint);
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

/** A leg: `upper` down to the shin, `lower` below it (a boot, a wrap, or a bare foot). The toe points to screen-right. */
function leg(p: Px, hipX: number, sole: number, len: number, w: number, isFar: boolean, upper: Ramp, lower: Ramp, share: number, cuff = false): void {
  const top = sole - len;
  const lowTop = sole - Math.round(len * share);
  const up = isFar ? dim(upper) : upper;
  const lo = isFar ? dim(lower) : lower;
  lit(p, up, [0, 2], [1, 2], (l) => l.rect(hipX, top, w, lowTop - top + 1, INK));
  lit(p, lo, [0, 2], [1, 2], (l) => {
    for (let y = lowTop; y <= sole; y++) {
      const c = cuff && y <= lowTop + 1;
      l.rect(hipX - (c ? 1 : 0), y, c ? w + 2 : y >= sole - 1 ? w + 3 : w, 1, INK);
    }
  });
  p.hline(hipX, sole, w + 3, lo[0]);
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

function fist(p: Px, hx: number, hy: number, r: Ramp = SKIN): void {
  const x = Math.round(hx) - 2;
  const y = Math.round(hy) - 2;
  p.rect(x, y, 4, 4, r[2]);
  p.hline(x, y, 3, r[4]).vline(x, y, 3, r[3]);
  p.hline(x + 1, y + 3, 3, r[1]).vline(x + 3, y + 1, 3, r[1]);
}

function belt(p: Px, X: number, y: number, half: number, strap: Ramp = dim(PLUM), buckle: Ramp = AMBER): void {
  const x0 = Math.round(X - half);
  const w = Math.round(half * 2);
  p.rect(x0, y, w, 3, strap[2]);
  p.hline(x0, y, w, strap[3]).hline(x0, y + 2, w, strap[1]);
  stamp(p, X - 2, y, ['GYy', 'YVz', 'yzZ'], { G: buckle[4], Y: buckle[3], y: buckle[2], z: buckle[1], Z: buckle[0], V: strap[0] });
}

/** A sash of amber: the druid's colour worn at the waist. */
function sash(p: Px, x0: number, y: number, w: number, h: number): void {
  p.rect(x0, y, w, h, AMBER[2]);
  p.hline(x0, y, w, AMBER[3]).hline(x0, y + h - 1, w, AMBER[1]);
}

/** A point on a curve through four control points. */
function along(pts: readonly [V, V, V, V], t: number): V {
  const a = (1 - t) ** 3;
  const b = 3 * (1 - t) ** 2 * t;
  const c = 3 * (1 - t) * t ** 2;
  const d = t ** 3;
  return [a * pts[0][0] + b * pts[1][0] + c * pts[2][0] + d * pts[3][0], a * pts[0][1] + b * pts[1][1] + c * pts[2][1] + d * pts[3][1]];
}

/** A curved stroke that swells and thins: horns, hair, ribbons. */
function sweep(p: Px, ramp: Ramp, pts: readonly [V, V, V, V], r0: number, r1: number, bulge = 0): void {
  lit(p, ramp, [0, 2], [0, 2], (l) => {
    for (let k = 0; k <= 48; k++) {
      const t = k / 48;
      const [x, y] = along(pts, t);
      const r = r0 + (r1 - r0) * t + bulge * Math.sin(Math.PI * t);
      l.ellipse(x, y, r, r, INK);
    }
  });
}

type Hem = 'flat' | 'zig' | 'rag' | 'strips';

/** Hanging cloth (a cape, a skirt, a kilt): it widens from h0 to h1 and may drift to one side. */
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

/** Trim the lowest pixel of every column of a garment with amber (the lit side brighter). */
function hemTrim(p: Px, from: number, X: number): void {
  p.each((x, y) => (y < from || p.has(x, y + 1) ? null : AMBER[x < X ? 3 : 2]));
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

/** One leaf: lit above, shaded below, coming to a point. */
function leaf(p: Px, x: number, y: number, r: Ramp): void {
  stamp(p, Math.round(x), Math.round(y), ['.HH.', 'HMMm', 'MMmm', '.md.', '..d.'], { H: r[3], M: r[2], m: r[2], d: r[1] });
}

/** A bigger leaf that hangs point down, with a dark edge so that a row of them stays a row of leaves. */
function bigLeaf(p: Px, x: number, y: number, r: Ramp): void {
  stamp(p, Math.round(x), Math.round(y), ['.HHH.', 'HHMMD', 'HMMMD', 'HMMDD', '.MMD.', '.MDD.', '..D..'], { H: r[3], M: r[2], D: r[1] });
}

/** A small leaf, as on a twig or on the wind. */
function sprig(p: Px, x: number, y: number, r: Ramp): void {
  stamp(p, Math.round(x), Math.round(y), ['.H.', 'HMm', '.m.'], { H: r[3], M: r[2], m: r[1] });
}

const MAPLE = ['...X...', '.X.X.X.', '.XXXXX.', 'XXXXXXX', '.XXXXX.', '..XXX..', '...s...', '...s...'];

/** A leaf with three points and a stalk, centred on (x, y) and turned by quarter turns. */
function maple(p: Px, x: number, y: number, turns: number, r: Ramp): void {
  const spot = (i: number, j: number): V => {
    let dx = i - 3;
    let dy = j - 3;
    for (let k = 0; k < ((turns % 4) + 4) % 4; k++) [dx, dy] = [-dy, dx];
    return [Math.round(x) + dx, Math.round(y) + dy];
  };
  lit(p, r, [0, 2], [0, 2], (l) => {
    MAPLE.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) if (row.charAt(i) === 'X') l.set(...spot(i, j), INK);
    });
  });
  MAPLE.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) if (row.charAt(i) === 's') p.set(...spot(i, j), r[1]);
  });
}

/** A long feather from its root to its tip: pale, with a bar of colour across it. */
function plume(p: Px, a: V, b: V, r: number, ramp: Ramp, bar: string): void {
  const m = layer();
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  for (let k = 0; k <= 40; k++) {
    const t = k / 40;
    const w = r * (t < 0.2 ? 0.55 + (t / 0.2) * 0.45 : 1 - 0.3 * Math.max(0, (t - 0.75) / 0.25));
    m.ellipse(a[0] + dx * t, a[1] + dy * t, w, w, INK);
  }
  lit(p, ramp, [0, 2], [0, 2], (l) => l.blit(m, 0, 0));
  m.each((x, y) => {
    const t = ((x + 0.5 - a[0]) * dx + (y + 0.5 - a[1]) * dy) / (dx * dx + dy * dy);
    if (t > 0.6 && t < 0.74) p.set(x, y, bar);
    return null;
  });
}

/** Swap one material for another in a box (a ring on a horn, a tattoo round a limb). */
function band(p: Px, x0: number, y0: number, x1: number, y1: number, from: Ramp, to: string): void {
  for (let y = Math.round(y0); y <= Math.round(y1); y++) {
    for (let x = Math.round(x0); x <= Math.round(x1); x++) {
      const c = p.get(x, y);
      if (c !== null && from.includes(c)) p.set(x, y, to);
    }
  }
}

/** Basket weave: every other little square of a material goes one tone darker. */
function weave(p: Px, ramp: Ramp, x0: number, y0: number, x1: number, y1: number): void {
  for (let y = Math.round(y0); y <= Math.round(y1); y++) {
    for (let x = Math.round(x0); x <= Math.round(x1); x++) {
      const c = p.get(x, y);
      if (c === null) continue;
      const i = ramp.lastIndexOf(c);
      if (i >= 2 && ((x >> 1) + (y >> 1)) % 2 === 0) p.set(x, y, ramp[i >= 3 ? 2 : 1]);
    }
  }
}

/** A point of the druid's light, with its glow. */
function spark(over: Px, glows: Glow[], x: number, y: number, r: number): void {
  over.set(x, y, HOT);
  glows.push({ x: Math.floor(x) + 0.5, y: Math.floor(y) + 0.5, r, color: LIGHT });
}

/** A hood: a ball, a dark opening with a lit edge, and two amber eyes that shine in it. */
function hood(p: Px, cx: number, cy: number, hr: number, ramp: Ramp, dx: number, dy: number, rx: number, ry: number, big = false): void {
  ball(p, cx, cy, hr, hr, ramp);
  const ox = cx + dx;
  const oy = cy + dy;
  const open = inEllipse(ox, oy, rx, ry);
  for (const [x, y] of open) p.set(x, y, N.eye);
  for (const [x, y] of open) if (!open.some(([a, b]) => a === x - 1 && b === y)) p.set(x - 1, y, ramp[4]);
  const eyeY = Math.round(oy - ry * 0.12);
  for (const ex of [Math.round(ox - rx * 0.5), Math.round(ox + rx * 0.4)]) {
    p.set(ex, eyeY, LIGHT);
    if (big) p.set(ex + 1, eyeY, LIGHT).set(ex, eyeY + 1, AMBER[2]).set(ex + 1, eyeY + 1, AMBER[2]).set(ex, eyeY, HOT);
  }
}

/** A bare face on a head of hair: two dark eyes, turned a little toward screen-right. Returns where the eyes are. */
function face(p: Px, cx: number, cy: number, R: number, hair: Ramp): V {
  ball(p, cx - 0.5, cy - 0.8, R + 0.9, R + 0.7, hair);
  ball(p, cx + 0.9, cy + 1.3, R - 1.1, R - 1.3, SKIN);
  const fx = Math.round(cx) + 1;
  const ey = Math.round(cy) + 1;
  p.set(fx - 1, ey, INK).set(fx - 1, ey + 1, INK).set(fx + 2, ey, INK).set(fx + 2, ey + 1, INK);
  return [fx, ey];
}

// ---------------------------------------------------------------------------------------------
// 1. Budding antlers: a deep hood with antlers that are coming into bud, a long cloak with a collar
// of turned leaves, bare feet, and a crook of living wood that curls round a glowing bud.

function antlered(): Px {
  const { X, hip, shoulderY, beltY, chinY } = frame(35, 0.95);
  const R = 6;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const glows: Glow[] = [];
  const over = layer();
  const back = layer();
  const staff = layer();
  const body = layer();
  const hand = layer();

  // the crook: a pole of living wood whose head curls in like a fern, round a bud
  const sx = X + 14;
  const curl: V = [sx + 5.7, cy - 12];
  for (let y = Math.round(curl[1]); y <= FAY - 2; y++) staff.set(sx, y, BARK[y % 7 === 0 ? 2 : 3]).set(sx + 1, y, BARK[1]);
  shape(staff, BARK, (l) => {
    for (let k = 0; k <= 90; k++) {
      const t = k / 90;
      const a = Math.PI + t * Math.PI * 2.3;
      const r = 5.2 - 2.9 * t;
      l.ellipse(curl[0] + Math.cos(a) * r, curl[1] + Math.sin(a) * r, 1.1 - 0.25 * t, 1.1 - 0.25 * t, INK);
    }
  });
  sprig(staff, sx + 2, cy - 2, AMBER);
  sprig(staff, sx + 2, beltY + 6, RUST);
  ball(over, curl[0] + 0.3, curl[1] + 0.2, 1.6, 1.6, AMBER);
  spark(over, glows, Math.round(curl[0]), Math.round(curl[1]), 17);

  // bare feet under the cloak
  leg(body, X + 1, FAY - 3, hip - 2, 3, true, HOSE, SKIN, 0.14);
  leg(body, X - 4, FAY - 1, hip, 3, false, HOSE, SKIN, 0.14);
  // the cloak, closed, down to the shins; its hem is cut into points and edged with amber
  const hem = FAY - 6;
  const half = (y: number): number => 8 + 5.5 * ((y - shoulderY) / (hem - shoulderY));
  const drift = (y: number): number => -Math.round(((y - shoulderY) / (hem - shoulderY)) * 2);
  const cloak = layer();
  lit(cloak, DUSK, N.hi, [0, 4], (l) => {
    for (let y = shoulderY - 1; y <= hem; y++) {
      for (let x = Math.round(X - half(y)) + drift(y); x < Math.round(X + half(y)) + drift(y); x++) {
        const k = (((x - X) % 6) + 6) % 6;
        if (y > hem - Math.abs(k - 3)) continue;
        l.set(x, y, INK);
      }
    }
  });
  hemTrim(cloak, hem - 3, X - 2);
  for (let y = shoulderY + 8; y <= hem - 3; y++) {
    for (const f of [-0.6, -0.15, 0.62]) {
      const x = Math.round(X + f * half(y)) + drift(y);
      if (cloak.has(x, y) && hash(x, y, 3) > 0.2) cloak.set(x, y, SHADE);
    }
    // where the cloak's two edges meet, and a glimpse of its amber lining near the hem
    const t = (y - beltY) / (hem - beltY);
    const ox = X + 3 + drift(y);
    cloak.set(ox, y, SHADE);
    if (t > 0.4) for (let k = 1; k <= Math.round((t - 0.4) * 5); k++) if (cloak.has(ox + k, y)) cloak.set(ox + k, y, AMBER[2]);
  }
  body.blit(cloak, 0, 0);
  // the hand that holds the crook comes out of the cloak
  const gy = beltY - 5;
  limb(body, X + 5, gy - 2, sx - 1, gy, 2.4, 2, DUSK);
  fist(hand, sx + 0.5, gy);
  // a collar of turned leaves: a row behind, and a row over it
  for (const [dx, dy, k] of [[-10, -4, 1], [-5, -4, 0], [1, -4, 1], [6, -4, 0]] as const) bigLeaf(body, X + dx, shoulderY + dy, k === 0 ? AMBER : RUST);
  for (const [dx, dy, k] of [[-12, -1, 0], [-7, 0, 1], [-2, 1, 0], [3, 0, 1], [8, -1, 0]] as const) bigLeaf(body, X + dx, shoulderY + dy, k === 0 ? AMBER : RUST);
  // the hood
  hood(body, cx, cy - 0.5, R + 1.6, DUSK, 1.4, 1.4, 3.9, 5.1);

  // antlers behind the hood: a long beam that leans out, short tines, a bud at every tip
  for (const s of [-1, 1]) {
    const ramp = s > 0 ? far(BONE) : BONE;
    const at = (dx: number, dy: number): V => [cx + s * (3 + dx * 1.15), cy - 7 + dy * 1.08];
    const seg = (a: V, b: V, r0: number, r1: number): void => limb(back, a[0], a[1], b[0], b[1], r0, r1, ramp);
    seg(at(0, 1), at(2.5, -5), 1.4, 1.2);
    seg(at(2.5, -5), at(6, -10), 1.2, 0.95);
    seg(at(6, -10), at(6.5, -15), 0.95, 0.75);
    seg(at(0.8, -1.5), at(-1.5, -5.5), 0.85, 0.75);
    seg(at(4, -7.5), at(8.5, -9.5), 0.85, 0.75);
    seg(at(6.2, -12), at(3.5, -15.5), 0.8, 0.75);
    // the two highest buds are open enough to shine
    [at(6.5, -15), at(3.5, -15.5), at(8.5, -9.5), at(-1.5, -5.5)].forEach(([tx, ty], k) => {
      const bx = Math.floor(tx - 0.5);
      const by = Math.floor(ty - 0.5);
      over.set(bx, by - 1, LIGHT).set(bx, by, AMBER[2]);
      if (k < 2) glows.push({ x: bx + 0.5, y: by - 0.5, r: 4.5, color: LIGHT });
    });
  }

  return compose([back, staff, body, hand], over, glows);
}

// ---------------------------------------------------------------------------------------------
// 2. Mushroom cap: the small one. A cap wider than the shoulders with spots that glow, a smock like
// a bell, bare feet, and a jar of fireflies held out to light the way.

function toadstool(): Px {
  const { X, hip, shoulderY, beltY, hipY, chinY } = frame(34, 0.7, 0.42);
  const R = 6.5;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const glows: Glow[] = [];
  const over = layer();
  const body = layer();
  const near = layer();
  const lamp = layer();

  leg(body, X + 1, FAY - 3, hip - 2, 3, true, SKIN, SKIN, 0.2);
  leg(body, X - 4, FAY - 1, hip, 3, false, SKIN, SKIN, 0.2);
  // the far arm holds a jar of fireflies out to the side
  const hx = X + 14;
  const hy = shoulderY + 3;
  arm(body, [X + 5, shoulderY + 3], [X + 9.5, shoulderY + 6], [hx - 1, hy], 2.2, dim(BARK), dim(BARK));
  // a smock like a bell
  const hemY = hipY + 3;
  shape(
    body,
    BARK,
    (l) => {
      for (let y = shoulderY; y <= hemY; y++) {
        const h = 5.5 + 4 * ((y - shoulderY) / (hemY - shoulderY)) ** 0.8;
        for (let x = Math.round(X - h); x < Math.round(X + h); x++) {
          if (y === hemY && (x + 40) % 4 >= 2) continue;
          l.set(x, y, INK);
        }
      }
    },
    [0, 4],
  );
  for (let k = 0; k < 3; k++) body.set(X, shoulderY + 5 + k * 3, AMBER[2]);
  // the near arm hangs
  arm(near, [X - 5.5, shoulderY + 3], [X - 7.5, beltY - 1], [X - 7.5, beltY + 3], 2.2, BARK, BARK);
  fist(near, X - 7.5, beltY + 5);

  // the cap: its rim sags over the brow, and the pale gills show at each side of the face
  const rimY = Math.round(cy) - 3;
  const capR = 17.5;
  const capH = 13;
  const sag = (x: number): number => 1.8 * (1 - ((x + 0.5 - cx) / capR) ** 2);
  for (let x = Math.round(cx - capR) + 3; x < Math.round(cx + capR) - 3; x++) {
    const y0 = Math.floor(rimY + sag(x)) + 1;
    body.set(x, y0, x % 2 === 0 ? BONE[3] : BONE[2]).set(x, y0 + 1, x % 2 === 0 ? BONE[2] : BONE[0]);
  }
  // the face under it: round cheeks, the brow in the cap's shadow
  ball(body, cx, cy, R, R, SKIN);
  const fx = Math.round(cx) + 1;
  const ey = Math.round(cy) + 1;
  for (const [x, y] of inEllipse(cx, cy, R, R)) if (y <= ey - 2) body.set(x, y, N.skin[0]);
  body.set(fx - 3, ey, INK).set(fx - 3, ey + 1, INK).set(fx + 2, ey, INK).set(fx + 2, ey + 1, INK);
  body.set(fx - 4, ey + 2, PINK[3]).set(fx + 3, ey + 2, PINK[3]);
  body.set(fx - 1, ey + 3, N.skin[0]).set(fx, ey + 3, N.skin[0]);
  shape(
    body,
    AMBER,
    (l) => {
      for (let x = Math.round(cx - capR); x < Math.round(cx + capR); x++) {
        const u = Math.abs((x + 0.5 - cx) / capR);
        const top = rimY - capH * Math.sqrt(Math.max(0, 1 - u ** 2.4));
        for (let y = Math.round(top); y <= Math.floor(rimY + sag(x)); y++) l.set(x, y, INK);
      }
      l.ellipse(cx - 0.5, rimY - capH + 0.5, 3.4, 2.4, INK);
    },
    [0, 4],
  );
  // its spots, three of them alight
  for (const [dx, dy, r, shines] of [[-11, -4, 1.7, 1], [-5, -9, 1.5, 0], [3, -5, 2.1, 1], [10, -7, 1.4, 0], [13, -2, 1.2, 1], [-15, 0, 1.1, 0], [0, -11.5, 1.1, 0]] as const) {
    body.ellipse(cx + dx, rimY + dy, r, r * 0.85, BONE[3]);
    if (shines) {
      over.set(Math.floor(cx + dx - 0.5), Math.floor(rimY + dy - 0.5), HOT);
      glows.push({ x: cx + dx, y: rimY + dy, r: 6, color: LIGHT });
    }
  }

  // the jar
  lamp.vline(hx, hy + 1, 2, STEEL[3]);
  stamp(lamp, hx - 2, hy + 3, ['.SSS.', 'gAAAg', 'gAAAg', 'gAAAg', 'gAAAg', '.ggg.'], { S: BARK[3], g: STEEL[3], A: AMBER[2] });
  over.set(hx - 1, hy + 5, HOT).set(hx + 1, hy + 6, HOT).set(hx, hy + 7, LIGHT).set(hx - 1, hy + 7, LIGHT);
  glows.push({ x: hx + 0.5, y: hy + 6, r: 17, color: LIGHT });
  fist(lamp, hx, hy);
  // and a few that got out
  for (const [dx, dy] of [[-17, -9], [20, -12], [9, -26], [-9, -30], [23, 6]] as const) spark(over, glows, X + dx, shoulderY + dy, 5);

  return compose([body, near, lamp], over, glows);
}

// ---------------------------------------------------------------------------------------------
// 3. Tree-ring mask: a slice cut across a trunk and tied on over a dark cowl: the rings for a face,
// the bark still on its rim, two slits for eyes. A narrow robe, and a seedling alight in the hands.

function masked(): Px {
  const { X, hip, shoulderY, beltY, chinY } = frame(38, 1.08);
  const R = 6;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const glows: Glow[] = [];
  const over = layer();
  const body = layer();
  const arms = layer();
  const head = layer();
  const mask = layer();

  leg(body, X + 1, FAY - 3, hip - 2, 3, true, HOSE, SKIN, 0.14);
  leg(body, X - 4, FAY - 1, hip, 3, false, HOSE, SKIN, 0.14);
  // a narrow robe to the ankles
  const hem = FAY - 7;
  const half = (y: number): number => (y <= beltY ? 6.5 - 1.5 * ((y - shoulderY) / (beltY - shoulderY)) : 5 + 3.4 * ((y - beltY) / (hem - beltY)) ** 0.9);
  shape(
    body,
    DUSK,
    (l) => {
      for (let y = shoulderY - 1; y <= hem; y++) {
        for (let x = Math.round(X - half(y)); x < Math.round(X + half(y)); x++) {
          if (y > hem - ((((x - X) % 4) + 4) % 4 < 2 ? 0 : 1)) continue;
          l.set(x, y, INK);
        }
      }
    },
    [0, 4],
  );
  for (let y = beltY + 5; y <= hem; y++) for (const f of [-0.5, 0.45]) if (hash(f * 10, y, 3) > 0.2 && body.has(Math.round(X + f * half(y)), y)) body.set(Math.round(X + f * half(y)), y, SHADE);
  // an amber sash, one end hanging
  body.rect(X - 5, beltY + 1, 10, 2, AMBER[2]).hline(X - 5, beltY + 1, 10, AMBER[3]);
  body.rect(X + 2, beltY + 3, 2, 9, AMBER[2]).vline(X + 2, beltY + 3, 9, AMBER[3]);

  // both hands come together in front, round a seed that has sprouted and begun to shine
  const hy = beltY - 1;
  arm(arms, [X + 6.5, shoulderY + 3], [X + 8.5, beltY - 2], [X + 4, hy + 0.5], 2.3, DUSK, DUSK);
  arm(arms, [X - 6.5, shoulderY + 3], [X - 8.5, beltY - 2], [X - 4, hy + 0.5], 2.3, DUSK, DUSK);
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? X - 5 : X + 2;
    arms.rect(x0, hy - 1, 3, 3, SKIN[s < 0 ? 3 : 2]).hline(x0, hy + 1, 3, SKIN[1]);
  }
  ball(over, X, hy - 2, 2, 2, AMBER);
  over.vline(X - 1, hy - 6, 2, LIGHT).set(X - 2, hy - 7, LIGHT).set(X - 3, hy - 7, AMBER[2]).set(X, hy - 7, LIGHT).set(X + 1, hy - 8, LIGHT);
  spark(over, glows, X - 1, hy - 3, 16);

  // the cowl: a hood, and its cape on the shoulders
  shape(head, DUSK, (l) => {
    for (let y = shoulderY - 3; y <= shoulderY + 4; y++) {
      const t = Math.max(0, (y - shoulderY) / 4);
      const h = 9.5 * Math.sqrt(1 - t * t * 0.5);
      for (let x = Math.round(X - h); x < Math.round(X + h); x++) {
        if (y === shoulderY + 4 && (x + 40) % 4 < 2) continue;
        l.set(x, y, INK);
      }
    }
  });
  ball(head, cx, cy - 0.5, R + 1.9, R + 1.9, DUSK);

  // the peak of the hood shows behind the mask
  shape(head, DUSK, (l) => l.poly([[cx + 4, cy - 7], [cx - 1, cy - 13], [cx - 6, cy - 15], [cx - 9, cy - 11.5], [cx - 8, cy - 4]], INK));
  // the mask: a slice cut across a trunk, its rings for a face, the bark still on its rim
  const mr = 9.4;
  const pale = mix(STRAW[3], AMBER[3], 0.5);
  const ringed = mix(STRAW[2], AMBER[2], 0.5);
  const my = cy - 0.5;
  const pith: V = [cx + 1.5, my - 2.5];
  const fx = Math.round(cx) + 1;
  const ey = Math.round(cy) + 1;
  for (const [x, y] of inEllipse(cx, my, mr + 0.6, mr + 0.6)) {
    const ox = x + 0.5 - cx;
    const oy = y + 0.5 - my;
    const d = Math.hypot(ox, oy);
    const edge = mr + 0.45 * Math.sin(Math.atan2(oy, ox) * 5 + 1);
    if (d > edge) continue;
    const side = (ox * -0.52 + oy * -0.62) / mr;
    if (d > edge - 1.8) mask.set(x, y, BARK[side > 0.25 ? 3 : side > -0.35 ? 2 : 0]);
    else {
      const k = Math.hypot(x + 0.5 - pith[0], (y + 0.5 - pith[1]) * 1.12);
      const ring = (k + 0.45) % 3.1 < 0.9;
      mask.set(x, y, side > -0.4 ? (ring ? ringed : pale) : ring ? BARK[2] : STRAW[2]);
    }
  }
  // a crack from the rim to the heart, two slits for eyes
  mask.line(cx + 6.5, my - 6, cx + 2.5, my - 3, STRAW[0]);
  mask.line(cx - 7, my + 4.5, cx - 4.5, my + 3, STRAW[0]);
  mask.rect(fx - 5, ey, 3, 2, INK).rect(fx + 1, ey, 3, 2, INK);
  mask.set(fx - 4, ey + 1, LIGHT).set(fx + 2, ey + 1, LIGHT);
  // the cords that tie it on, and a leaf or two still on the rim
  mask.set(Math.round(cx - mr) - 1, ey - 1, AMBER[2]).set(Math.round(cx + mr), ey - 1, AMBER[2]);
  leaf(mask, cx + 5, my - 12.5, AMBER);
  leaf(mask, cx + 8.5, my - 9, RUST);
  stamp(mask, Math.round(cx - mr - 1), Math.round(my + 2), ['HHM', 'Mm.'], { H: AMBER[3], M: AMBER[2], m: AMBER[1] });

  return compose([body, arms, head, mask], over, glows);
}

// ---------------------------------------------------------------------------------------------
// 4. Cloak of leaves: a cloak made of turned leaves, lifted by the wind and coming apart at its
// end; silver hair blown the same way, and a whirl of bright leaves over one raised hand.

function windblown(): Px {
  const { X, hip, shoulderY, beltY, hipY, chinY } = frame(46, 1.0);
  const R = 6;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const glows: Glow[] = [];
  const over = layer();
  const back = layer();
  const body = layer();
  const front = layer();

  // the cloak: from both shoulders, out behind and up on the wind
  const m = layer();
  m.poly(
    [
      [X + 4, shoulderY - 1],
      [X - 6, shoulderY - 1],
      [X - 12, shoulderY + 6],
      [X - 19, beltY + 1],
      [X - 27, hipY],
      [X - 33, hipY + 6],
      [X - 25, hipY + 12],
      [X - 13, hipY + 15],
      [X - 2, hipY + 12],
      [X + 2, hipY + 3],
      [X + 3, beltY],
    ],
    INK,
  );
  m.each((x, y) => {
    back.set(x, y, AMBER[0]);
    return null;
  });
  const tones: ReadonlyArray<Ramp> = [AMBER, RUST, AMBER, BARK, RUST];
  const b = m.bounds();
  if (b) {
    for (let row = Math.ceil(b.h / 5); row >= 0; row--) {
      for (let col = 0; col <= Math.ceil(b.w / 5); col++) {
        const x = b.x + col * 5 + (row % 2 === 0 ? 1 : 3) + Math.round(hash(col, row, 3) * 2 - 1);
        const y = b.y + row * 5 + 2 + Math.round(hash(col, row, 4) * 2 - 1);
        if (!m.has(x, y)) continue;
        maple(back, x, y, Math.floor(hash(col, row, 5) * 4), tones[Math.floor(hash(col, row, 6) * tones.length)]);
      }
    }
  }
  // the leaves at its end are letting go
  maple(back, X - 38, hipY + 13, 1, AMBER);
  maple(back, X - 37, hipY - 2, 3, RUST);
  maple(back, X - 30, hipY + 20, 2, RUST);
  sprig(back, X - 40, hipY + 5, AMBER);
  // hair, blown the same way: three long locks
  sweep(back, STEEL, [[cx - 3, cy - 5], [cx - 9, cy - 9], [cx - 14, cy - 5], [cx - 20, cy - 8]], 2.7, 0.8, 0.4);
  sweep(back, STEEL, [[cx - 4, cy - 2], [cx - 9, cy - 4], [cx - 12, cy], [cx - 17, cy - 2]], 2.6, 0.8, 0.3);
  sweep(back, far(STEEL), [[cx - 4, cy + 1], [cx - 8, cy + 1], [cx - 12, cy + 5], [cx - 19, cy + 3]], 2.4, 0.8, 0.3);
  sprig(back, cx - 13, cy - 9, RUST);

  leg(body, X + 1, FAY - 3, hip - 2, 3, true, HOSE, PLUM, 0.45, true);
  leg(body, X - 4, FAY - 1, hip, 3, false, HOSE, PLUM, 0.45, true);
  // the far arm is raised, palm up
  const hx = X + 13;
  const hy = shoulderY - 3;
  arm(body, [X + 6, shoulderY + 3], [X + 11, shoulderY + 6], [hx, hy + 2], 2.1, DUSK, dim(SKIN));
  fist(body, hx, hy, dim(SKIN));
  // a dark tunic, its skirt blown a little too
  hang(body, DUSK, X, beltY + 2, hipY + 5, 5, 7.5, 'zig', -2);
  taper(body, DUSK, X, shoulderY, beltY - 1, 6, 4.5);
  sash(body, X - 5, beltY - 1, 10, 3);
  // two of its leaves lie over the shoulders, and a pin of amber holds it at the throat
  maple(body, X - 5, shoulderY + 1, 2, RUST);
  maple(body, X + 4, shoulderY + 1, 2, AMBER);
  body.set(X - 1, shoulderY, HOT).set(X, shoulderY, LIGHT).set(X - 1, shoulderY + 1, LIGHT).set(X, shoulderY + 1, AMBER[2]);
  // the near arm hangs in front of the cloak
  arm(front, [X - 6, shoulderY + 4], [X - 8.5, beltY - 2], [X - 8, beltY + 3], 2.1, DUSK, SKIN);
  fist(front, X - 8, beltY + 5);
  // the head: silver hair, a band of amber
  const [fx, ey] = face(body, cx, cy, R, STEEL);
  body.hline(fx - 3, ey - 4, 8, STEEL[2]).hline(fx - 3, ey - 3, 3, STEEL[2]);
  band(body, cx - R - 2, ey - 5, cx + R + 2, ey - 5, STEEL, AMBER[2]);

  // the whirl of leaves over the raised hand
  const wx = hx + 1;
  const wy = hy - 10;
  for (const [dx, dy, k] of [[-1, 4, 0], [3, 1, 1], [1, -4, 0], [-4, -3, 1], [-5, 2, 0]] as const) sprig(over, wx + dx - 1, wy + dy - 1, k === 0 ? AMBER : RUST);
  spark(over, glows, wx, wy, 15);
  over.set(wx + 6, wy - 6, LIGHT).set(wx - 7, wy - 7, LIGHT).set(wx + 7, wy + 5, AMBER[2]);

  return compose([back, body, front], over, glows);
}

// ---------------------------------------------------------------------------------------------
// 5. Hive helm: armour of wicker over dark hose, a round wicker shield, a club like a honey
// dipper, and for a helm a straw beehive with the bees still in it.

function hived(): Px {
  const { X, hip, shoulderY, beltY, hipY, chinY } = frame(41, 0.94, 0.47);
  const R = 6;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const c = 8.5;
  const w = 7;
  const glows: Glow[] = [];
  const over = layer();
  const body = layer();
  const weapon = layer();
  const hand = layer();
  const shield = layer();
  const helm = layer();

  // woven greaves over dark hose
  for (const [lx, sole, len, isFar] of [[X + 1, FAY - 3, hip - 2, true], [X - 6, FAY - 1, hip, false]] as const) {
    leg(body, lx, sole, len, 4, isFar, HOSE, STRAW, 0.6, true);
    weave(body, isFar ? dim(STRAW) : STRAW, lx - 1, sole - Math.round(len * 0.6), lx + 5, sole - 3);
  }
  // a skirt of woven strips
  hang(body, STRAW, X, beltY + 3, hipY + 5, w, w + 2, 'strips');
  // the far arm holds the club upright
  const hx = X + c + 6;
  const hy = beltY;
  arm(body, [X + c, shoulderY + 4], [X + c + 4, shoulderY + 9], [hx, hy], 2.6, dim(HOSE), dim(STRAW));
  // the cuirass
  shape(
    body,
    STRAW,
    (l) => {
      for (let y = shoulderY; y <= beltY - 1; y++) {
        const h = c + (w - c) * ((y - shoulderY) / (beltY - 1 - shoulderY));
        l.rect(Math.round(X - h), y, Math.round(X + h) - Math.round(X - h), 1, INK);
      }
    },
    [0, 2],
  );
  weave(body, STRAW, X - c, shoulderY, X + c, beltY - 1);
  belt(body, X, beltY, w);
  // round shoulders
  ball(body, X + c + 1, shoulderY + 2, 4.2, 3.8, dim(STRAW));
  ball(body, X - c - 1.5, shoulderY + 2, 5, 4.4, STRAW);
  weave(body, STRAW, X - c - 8, shoulderY - 3, X - c + 4, shoulderY + 7);

  // the helm: a hive of coiled straw, and its door for the eyes
  const top = Math.round(cy) - 13;
  const bot = chinY + 2;
  shape(
    helm,
    STRAW,
    (l) => {
      for (let y = top; y <= bot; y++) {
        const t = (y - top) / (bot - top);
        const h = 8.6 * Math.sin(Math.PI * Math.min(1, 0.1 + t * 0.72)) ** 0.75;
        l.rect(Math.round(cx - h), y, Math.round(cx + h) - Math.round(cx - h), 1, INK);
      }
      l.rect(Math.round(cx) - 1, top - 2, 3, 2, INK);
    },
    [0, 2],
  );
  // the coils
  for (let y = top + 2; y <= bot; y += 3) band(helm, cx - 10, y, cx + 10, y, STRAW, STRAW[1]);
  const fx = Math.round(cx) + 1;
  const ey = Math.round(cy) + 1;
  helm.rect(fx - 4, ey - 1, 8, 3, N.eye).rect(fx - 3, ey - 2, 6, 1, N.eye);
  helm.set(fx - 2, ey, LIGHT).set(fx + 1, ey, LIGHT);
  // honey at the sill
  helm.set(fx + 2, ey + 2, AMBER[2]).set(fx + 2, ey + 3, AMBER[2]).set(fx + 2, ey + 4, LIGHT).set(fx - 3, ey + 2, AMBER[2]);

  // the club: a honey dipper
  for (let y = shoulderY - 6; y <= hy + 4; y++) weapon.set(hx, y, BARK[3]).set(hx + 1, y, BARK[1]);
  for (let k = 0; k < 4; k++) {
    const y = shoulderY - 16 + k * 3;
    weapon.rect(hx - 2, y, 6, 2, STRAW[2]).hline(hx - 2, y, 5, STRAW[3]).set(hx + 3, y + 1, STRAW[1]);
    weapon.rect(hx - 1, y + 2, 4, 1, STRAW[1]);
  }
  over.set(hx + 3, shoulderY - 5, AMBER[2]).set(hx + 3, shoulderY - 4, LIGHT);
  fist(hand, hx, hy, dim(STRAW));

  // the shield: wicker, wound round and round, with a boss of amber
  const scx = X - c - 4.5;
  const scy = beltY - 2.5;
  const r = 10.5;
  for (let y = Math.floor(scy - r); y <= Math.ceil(scy + r); y++) {
    for (let x = Math.floor(scx - r); x <= Math.ceil(scx + r); x++) {
      const ox = x + 0.5 - scx;
      const oy = y + 0.5 - scy;
      const d = Math.hypot(ox, oy);
      if (d > r) continue;
      const side = (ox * -0.52 + oy * -0.62) / r;
      const ring = Math.floor(d / 1.8);
      const spoke = Math.abs((((Math.atan2(oy, ox) / Math.PI) * 6 + 12) % 1) - 0.5) > 0.4;
      if (d > r - 1.7) shield.set(x, y, STRAW[side > 0.2 ? 4 : side > -0.4 ? 2 : 0]);
      else shield.set(x, y, spoke ? STRAW[0] : ring % 2 === 0 ? STRAW[side > -0.3 ? 3 : 2] : STRAW[side > 0.3 ? 2 : 1]);
    }
  }
  ball(shield, scx, scy, 2.8, 2.8, AMBER);
  spark(over, glows, Math.floor(scx - 1), Math.floor(scy - 1), 10);

  // the bees
  for (const [dx, dy] of [[-14, -8], [12, -17], [22, -7], [-7, -18], [4, -21]] as const) {
    const bx = Math.round(cx + dx);
    const by = Math.round(cy + dy);
    over.set(bx, by, LIGHT).set(bx + 1, by, AMBER[0]).set(bx, by - 1, BONE[3]);
    glows.push({ x: bx + 0.5, y: by + 0.5, r: 4.5, color: LIGHT });
  }

  return compose([body, weapon, hand, shield, helm], over, glows);
}

// ---------------------------------------------------------------------------------------------
// 6. Skull and pelt: broad, in a shaggy pelt, under the horned skull of a great bull worn as a
// helm. Bare arms and legs with tattoos that glow, bare feet, both fists closed. (It leans toward the bull.)

function skulled(): Px {
  const { X, hip, shoulderY, beltY, hipY, chinY } = frame(38, 1.0, 0.48);
  const R = 6;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const c = 10;
  const w = 7.5;
  const glows: Glow[] = [];
  const over = layer();
  const back = layer();
  const body = layer();
  const front = layer();

  // the pelt hangs down the back
  hang(back, DUSK, X, shoulderY + 2, hipY + 9, c + 1, c + 3, 'rag');

  // bare legs, wide apart, bound at the ankle, a band of light round each shin
  for (const [hx, sole, len, isFar] of [[X + 2, FAY - 3, hip - 2, true], [X - 6, FAY - 1, hip, false]] as const) {
    leg(body, hx, sole, len, 4, isFar, SKIN, SKIN, 0.16);
    body.rect(hx, sole - 6, 4, 2, isFar ? BARK[1] : BARK[2]);
    body.hline(hx, sole - 11, 4, AMBER[isFar ? 1 : 2]).hline(hx, sole - 13, 4, AMBER[isFar ? 1 : 2]);
  }
  // a kilt of bark strips
  hang(body, BARK, X, beltY + 3, hipY + 6, w + 0.5, w + 2.5, 'strips');
  // the far arm hangs, the fist closed
  arm(body, [X + c, shoulderY + 4], [X + c + 5, beltY - 3], [X + c + 4.5, beltY + 4], 2.9, far(SKIN), far(SKIN));
  fist(body, X + c + 4.5, beltY + 6, far(SKIN));
  band(body, X + c - 2, shoulderY + 10, X + c + 9, shoulderY + 11, far(SKIN), AMBER[2]);
  for (let k = 0; k < 3; k++) body.set(X + c + 4 + (k % 2), beltY - 1 + k * 2, AMBER[2]);
  // a sleeveless tunic and a wide belt
  taper(body, DUSK, X, shoulderY, beltY - 1, c, w);
  belt(body, X, beltY - 1, w, dim(PLUM), BONE);
  body.hline(Math.round(X - w), beltY + 2, Math.round(w * 2), PLUM[0]);

  // the near arm, the same
  arm(front, [X - c, shoulderY + 4], [X - c - 5.5, beltY - 3], [X - c - 5, beltY + 4], 2.9, SKIN, SKIN);
  fist(front, X - c - 5, beltY + 6);
  band(front, X - c - 9, shoulderY + 10, X - c + 2, shoulderY + 11, SKIN, AMBER[2]);
  for (let k = 0; k < 3; k++) front.set(X - c - 5 - (k % 2), beltY - 1 + k * 2, LIGHT);
  glows.push({ x: X - c - 4, y: shoulderY + 11, r: 7, color: LIGHT });

  // the pelt across the shoulders, shaggy along its lower edge
  const pelt = layer();
  fur(pelt, BARK, X, shoulderY - 2, shoulderY + 7, c + 4, 3);
  pelt.each((x, y) => (pelt.has(x, y + 1) || hash(x, 5) < 0.5 ? null : BARK[1]));
  front.blit(pelt, 0, 0);
  // an amber stone on a cord
  stamp(front, X - 2, shoulderY + 8, ['.c.c', '.HM.', '.Mm.'], { c: BONE[2], H: LIGHT, M: AMBER[2], m: AMBER[1] });

  // the skull: a broad brow, a long muzzle down over the face, a light in each socket
  const head = layer();
  const fx = Math.round(cx) + 1;
  const ey = Math.round(cy);
  head.rect(X - 2, chinY - 1, 4, 3, N.skin[0]);
  for (const s of [-1, 1]) {
    const ramp = s > 0 ? far(BONE) : BONE;
    sweep(head, ramp, [[cx + s * 4.5, cy - 4], [cx + s * 12, cy - 3], [cx + s * 16, cy - 8], [cx + s * 13, cy - 14.5]], 2.4, 0.7);
    band(head, cx + s * 9 - 1, cy - 9, cx + s * 9, cy, ramp, AMBER[2]);
  }
  ball(head, cx, cy - 1.5, R + 0.8, R - 0.4, BONE);
  shape(head, BONE, (l) => {
    for (let y = ey; y <= chinY + 3; y++) {
      const h = 4.6 - 1.7 * ((y - ey) / (chinY + 3 - ey));
      l.rect(Math.round(cx + 0.5 - h), y, Math.round(cx + 0.5 + h) - Math.round(cx + 0.5 - h), 1, INK);
    }
  });
  head.rect(fx - 5, ey - 1, 3, 3, INK).rect(fx + 1, ey - 1, 3, 3, INK);
  head.set(fx - 4, ey, LIGHT).set(fx + 2, ey, LIGHT);
  head.set(fx - 2, chinY + 1, BONE[0]).set(fx, chinY + 1, BONE[0]);
  head.set(fx - 1, ey - 5, BONE[0]).set(fx, ey - 4, BONE[0]);

  return compose([back, body, front, head], over, glows);
}

// ---------------------------------------------------------------------------------------------
// 7. Feather mantle: a mantle of long striped feathers that opens like a wing on one raised arm, a
// hood with a tuft of feather at each side, and the round face of an owl. (It leans toward the owl.)

function feathered(): Px {
  const { X, hip, shoulderY, beltY, hipY, chinY } = frame(45, 1.0);
  const R = 6;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const glows: Glow[] = [];
  const over = layer();
  const back = layer();
  const body = layer();
  const wing = layer();
  const head = layer();
  const rad = (deg: number): number => (deg * Math.PI) / 180;
  const tip = (a: V, deg: number, len: number): V => [a[0] + Math.cos(rad(deg)) * len, a[1] + Math.sin(rad(deg)) * len];

  // on the far side the mantle hangs folded
  for (const [dx, dy, deg, len] of [[9.5, 5, 80, 13], [7, 4, 85, 17]] as const) {
    const a: V = [X + dx, shoulderY + dy];
    plume(back, a, tip(a, deg, len), 1.7, far(BONE), RUST[1]);
  }
  for (const [dx, deg] of [[9.5, 78], [6.5, 86]] as const) {
    const a: V = [X + dx, shoulderY + 1];
    plume(back, a, tip(a, deg, 8), 1.8, far(STEEL), far(STEEL)[2]);
  }

  leg(body, X + 1, FAY - 3, hip - 2, 3, true, HOSE, PLUM, 0.4, true);
  leg(body, X - 4, FAY - 1, hip, 3, false, HOSE, PLUM, 0.4, true);
  hang(body, DUSK, X, beltY + 2, hipY + 5, 5, 7, 'zig');
  taper(body, DUSK, X, shoulderY, beltY - 1, 6, 4.5);
  sash(body, X - 5, beltY - 1, 10, 3);

  // the wing: long striped feathers fanned along the raised arm
  const S: V = [X - 5, shoulderY + 2.5];
  const H: V = [X - 22, shoulderY - 1];
  const on = (u: number, dy: number): V => [S[0] + (H[0] - S[0]) * u, S[1] + (H[1] - S[1]) * u + dy];
  for (let i = 6; i >= 0; i--) {
    const u = i / 6;
    const a = on(u, 2.5);
    plume(wing, a, tip(a, 96 + 66 * u ** 1.3, 15.5 - 3.5 * u), 1.6, BONE, i % 2 === 0 ? AMBER[2] : RUST[2]);
  }
  // the short feathers over their roots: one band along the arm, its lower edge in scallops
  shape(wing, STEEL, (l) => {
    for (let k = 0; k <= 60; k++) {
      const u = k / 60;
      const [ax, ay] = on(u, 0);
      const deep = 4.2 - 1.2 * u + (Math.round(ax) % 3 === 0 ? -1 : 0);
      for (let d = -2; d <= deep; d++) l.set(ax, ay + d, INK);
    }
  });
  wing.rect(Math.round(H[0]) - 2, Math.round(H[1]) - 2, 3, 3, SKIN[2]).hline(Math.round(H[0]) - 2, Math.round(H[1]) - 2, 3, SKIN[3]);

  // a ruff of down at the neck
  for (const i of [-2, 2, -1, 1, 0]) ball(head, X + i * 3.2, shoulderY + 0.5 - Math.abs(i) * 0.4, 2.5, 2.2, BONE);
  // the hood, and a tuft of feather at each side of it, like the ears of an owl
  const hr = R + 1.6;
  for (const s of [-1, 1]) {
    const a: V = [cx + s * 3.5, cy - 5];
    plume(head, a, [cx + s * 8.5, cy - 11], 1.7, s > 0 ? far(BONE) : BONE, AMBER[2]);
  }
  ball(head, cx, cy - 0.5, hr, hr, DUSK);
  // the face: a pale disc round each eye, the way an owl's is, and a small beak between
  const ox = cx + 0.8;
  const oy = cy + 0.9;
  const disc = [...inEllipse(ox - 2.6, oy, 3.4, 3.6), ...inEllipse(ox + 2.6, oy, 3.4, 3.6)];
  for (const [x, y] of disc) head.set(x, y, x < ox - 1 ? BONE[3] : BONE[2]);
  for (const [x, y] of [...inEllipse(ox - 2.6, oy, 2.4, 2.6), ...inEllipse(ox + 2.6, oy, 2.4, 2.6)]) head.set(x, y, N.eye);
  for (const ex of [Math.round(ox - 3.4), Math.round(ox + 1.8)]) {
    head.set(ex, Math.round(oy) - 1, HOT).set(ex + 1, Math.round(oy) - 1, LIGHT).set(ex, Math.round(oy), AMBER[2]).set(ex + 1, Math.round(oy), AMBER[2]);
  }
  head.set(Math.round(ox - 0.5), Math.round(oy) + 1, AMBER[2]).set(Math.round(ox - 0.5), Math.round(oy) + 2, AMBER[1]);
  glows.push({ x: ox, y: oy - 0.5, r: 9, color: LIGHT });

  return compose([back, body, wing, head], over, glows);
}

// ---------------------------------------------------------------------------------------------
// 8. Tide hood: a tall pointed hood with two fins, and a robe that ends in curling ribbons, with
// two longer ones for sleeves. Spots of light run down every one. (It leans toward the squid.)

function tidal(): Px {
  const { X, shoulderY, beltY, hipY, chinY } = frame(38, 1.03);
  const R = 6;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const glows: Glow[] = [];
  const over = layer();
  const back = layer();
  const body = layer();
  const arms = layer();
  const head = layer();

  // the robe ends in ribbons that fan out and curl
  const splitY = hipY + 1;
  const strips: [V, V, V, V][] = [];
  for (const i of [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5]) {
    const a = Math.abs(i);
    const s = Math.sign(i);
    const x0 = X + i * 2.7;
    const out = a > 2 ? 18.5 : a > 1 ? 10 : 3;
    const endY = FAY - (a > 2 ? 10 : a > 1 ? 3 : 1);
    const wave = a > 1 ? 3.5 : 2;
    strips.push([[x0, splitY - 2], [x0 + s * (out * 0.3 + wave), splitY + 9], [X + s * (out - (a > 1 ? 5.5 : wave + 1)), FAY + (a > 2 ? 3 : a > 1 ? 1 : -5)], [X + s * out, endY]]);
  }
  strips.forEach((pts, k) => {
    const l = k % 2 === 0 ? back : body;
    sweep(l, k % 2 === 0 ? dim(RUST) : RUST, pts, 2.1, 1.1);
    for (let j = 2; j <= 9; j += 2) {
      const [x, y] = along(pts, j / 10);
      l.set(x, y, j > 6 ? HOT : LIGHT);
    }
  });
  // the robe itself
  const half = (y: number): number => (y <= beltY ? 6.2 - 1.2 * ((y - shoulderY) / (beltY - shoulderY)) : 5 + 3 * ((y - beltY) / (splitY - beltY)));
  shape(
    body,
    RUST,
    (l) => {
      for (let y = shoulderY - 1; y <= splitY; y++) l.rect(Math.round(X - half(y)), y, Math.round(X + half(y)) - Math.round(X - half(y)), 1, INK);
    },
    [0, 4],
  );
  // a cord at the waist with a shell on it
  body.hline(Math.round(X - 5), beltY, 10, BONE[2]).hline(Math.round(X - 5), beltY + 1, 10, BONE[0]);
  stamp(body, X - 1, beltY - 1, ['.HH', 'HMH', 'HHm'], { H: BONE[3], M: AMBER[2], m: BONE[2] });

  // the arms are held a little out, and a long ribbon hangs from each wrist
  for (const s of [1, -1]) {
    const ramp = s > 0 ? dim(RUST) : RUST;
    const hx = X + s * 13;
    const hy = beltY + 2;
    const rib: [V, V, V, V] = [[hx, hy], [hx + s * 1, hy + 9], [hx + s * 2, hipY + 13], [hx + s * 7, hipY + 9]];
    sweep(arms, ramp, rib, 1.6, 0.9);
    // each ends in a pad, like the two long arms of a squid
    shape(arms, ramp, (l) => l.ellipse(rib[3][0] + s * 0.5, rib[3][1] - 0.5, 2.6, 1.9, INK));
    for (let j = 1; j <= 9; j += 2) {
      const [x, y] = along(rib, j / 10);
      arms.set(x, y, j > 6 ? HOT : LIGHT);
    }
    arms.set(rib[3][0] + s * 1.5, rib[3][1] - 1, HOT);
    arm(arms, [X + s * 6, shoulderY + 3], [X + s * 10.5, beltY - 4], [hx, hy], 2.4, ramp, ramp);
    fist(arms, hx, hy + 1, s > 0 ? dim(SKIN) : SKIN);
  }

  // a short cape with a scalloped edge
  shape(head, RUST, (l) => {
    for (let y = shoulderY - 3; y <= shoulderY + 5; y++) {
      const t = Math.max(0, (y - shoulderY) / 5);
      const h = 9.5 * Math.sqrt(1 - t * t * 0.45);
      for (let x = Math.round(X - h); x < Math.round(X + h); x++) {
        if (y === shoulderY + 5 && (x + 40) % 4 < 2) continue;
        l.set(x, y, INK);
      }
    }
  });
  // the hood: a tall point, a fin at each side of it
  const hr = R + 1.6;
  const tip = cy - hr - 13;
  shape(head, RUST, (l) => {
    l.poly([[cx - 6.8, cy - 2], [cx - 2, tip + 1], [cx - 0.5, tip], [cx + 1, tip + 1], [cx + 6.8, cy - 2]], INK);
    l.poly([[cx - 2.5, tip + 3], [cx - 9, tip + 9], [cx - 4, tip + 11]], INK);
    l.poly([[cx + 1.5, tip + 3], [cx + 8, tip + 9], [cx + 3, tip + 11]], INK);
  });
  hood(head, cx, cy - 0.5, hr, RUST, 1.2, 1.4, 4.4, 5, true);
  for (const [dx, dy] of [[-1, 6], [1, 10], [-2, 13], [2, 15]] as const) head.set(Math.round(cx + dx), Math.round(tip + dy), LIGHT);
  glows.push({ x: cx + 1.2, y: cy + 0.5, r: 9, color: LIGHT });

  return compose([back, body, arms, head], over, glows);
}

// ---------------------------------------------------------------------------------------------
// 9. Flower crown: bare-headed and barefoot. Long amber hair under a crown of flowers, a plain dark
// shift, a vine of light wound round each arm and leg, and a bough in blossom held up for a moth.

function crowned(): Px {
  const { X, hip, shoulderY, beltY, hipY, chinY } = frame(34, 0.96);
  const R = 6;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const c = 5.5;
  const w = 4;
  const glows: Glow[] = [];
  const over = layer();
  const back = layer();
  const bough = layer();
  const body = layer();
  const hand = layer();
  const front = layer();

  // hair, loose down the back to the hips: wider than she is, ending in locks
  const hairEnd = hipY + 1;
  shape(
    back,
    AMBER,
    (l) => {
      for (let y = Math.round(cy - 3); y <= hairEnd; y++) {
        const t = Math.max(0, (y - cy) / (hairEnd - cy));
        const h = 7.6 + 3.2 * Math.sin(Math.PI * Math.min(1, t * 0.8));
        for (let x = Math.round(cx - h); x < Math.round(cx + h); x++) {
          const k = (((x - X) % 5) + 5) % 5;
          if (y > hairEnd - (k === 0 ? 4 : k === 4 || k === 1 ? 2 : 0)) continue;
          l.set(x, y, INK);
        }
      }
    },
    [0, 2],
  );
  for (let y = shoulderY + 1; y <= hairEnd - 3; y++) for (const dx of [-9, 8]) if (back.has(Math.round(cx + dx), y) && hash(dx, y, 5) > 0.25) back.set(Math.round(cx + dx), y, AMBER[1]);

  // a vine of light wound round a limb: a short slanting stroke every few rows
  const vine = (p: Px, x0: number, y0: number, y1: number, wd: number, col: string): void => {
    for (let y = y0; y <= y1; y += 4) for (let k = 0; k < wd; k++) if (p.has(x0 + k, y - k)) p.set(x0 + k, y - k, col);
  };

  // bare legs and feet
  for (const [lx, sole, len, isFar] of [[X + 1, FAY - 3, hip - 2, true], [X - 4, FAY - 1, hip, false]] as const) {
    leg(body, lx, sole, len, 3, isFar, SKIN, SKIN, 0.14);
    vine(body, lx, sole - 14, sole - 4, 3, isFar ? AMBER[2] : LIGHT);
  }

  // the far arm is raised, and in the hand a bough in blossom; a moth of light has come to it
  const hx = X + c + 8.5;
  const hy = shoulderY - 3;
  limb(bough, hx - 0.5, hy + 8, hx + 1.5, hy - 18, 1.05, 0.75, BARK);
  limb(bough, hx + 0.5, hy - 5, hx + 7.5, hy - 12, 0.85, 0.7, BARK);
  limb(bough, hx + 1, hy - 10, hx - 5, hy - 16, 0.85, 0.7, BARK);
  limb(bough, hx + 4, hy - 8.5, hx + 5, hy - 15, 0.75, 0.7, BARK);
  const bloom = (x: number, y: number, col: Ramp): void => {
    bough.set(x, y - 1, col[3]).set(x - 1, y, col[3]).set(x + 1, y, col[2]).set(x, y + 1, col[2]).set(x, y, HOT);
  };
  bloom(Math.round(hx + 8), Math.round(hy - 13), PINK);
  bloom(Math.round(hx + 1), Math.round(hy - 20), PINK);
  bloom(Math.round(hx - 6), Math.round(hy - 17), PINK);
  bloom(Math.round(hx + 5), Math.round(hy - 17), BONE);
  bloom(Math.round(hx - 3), Math.round(hy - 12), BONE);
  bloom(Math.round(hx + 4), Math.round(hy - 5), PINK);
  bough.set(Math.round(hx - 2), Math.round(hy - 6), AMBER[2]).set(Math.round(hx + 8), Math.round(hy - 8), AMBER[2]);
  arm(body, [X + c, shoulderY + 3], [X + c + 5.5, shoulderY + 6], [hx, hy + 2], 1.9, far(SKIN), far(SKIN));
  vine(body, X + c + 3, shoulderY + 7, shoulderY + 8, 3, AMBER[2]);
  fist(hand, hx, hy, far(SKIN));
  stamp(over, hx + 9, hy - 25, ['H...H', 'WH.HW', '.WHW.', '.H.H.'], { H: LIGHT, W: HOT });
  glows.push({ x: hx + 11.5, y: hy - 23, r: 13, color: LIGHT });
  over.set(hx + 6, hy - 26, LIGHT).set(hx + 15, hy - 17, AMBER[2]);

  // a plain shift, its hem cut like petals and edged with amber
  const hemY = hipY + 7;
  const dress = layer();
  shape(
    dress,
    DUSK,
    (l) => {
      for (let y = shoulderY; y <= hemY; y++) {
        const h = y <= beltY ? c + (w - c) * ((y - shoulderY) / (beltY - shoulderY)) : w + 4.5 * ((y - beltY) / (hemY - beltY)) ** 0.8;
        for (let x = Math.round(X - h); x < Math.round(X + h); x++) {
          const k = (((x - X) % 6) + 6) % 6;
          if (y > hemY - Math.abs(k - 3)) continue;
          l.set(x, y, INK);
        }
      }
    },
    [0, 4],
  );
  hemTrim(dress, hemY - 3, X);
  body.blit(dress, 0, 0);
  // a girdle of flowers
  for (let k = 0; k < 4; k++) {
    const gx = Math.round(X - w) + k * 2;
    const col = k % 2 === 0 ? PINK : BONE;
    body.set(gx, beltY, col[3]).set(gx + 1, beltY, col[2]).set(gx, beltY + 1, col[2]).set(gx + 1, beltY + 1, col[0]);
  }
  // the neck
  body.rect(X - 2, chinY - 1, 3, 3, N.skin[1]);
  // the head: a bare face, a fringe, and the crown
  const [fx, ey] = face(body, cx, cy, R, AMBER);
  body.hline(fx - 3, ey - 4, 8, AMBER[2]).hline(fx - 3, ey - 3, 3, AMBER[2]).hline(fx + 2, ey - 3, 3, AMBER[2]);
  body.set(fx - 2, ey + 2, PINK[3]).set(fx + 3, ey + 2, PINK[3]);
  for (let k = 0; k <= 4; k++) {
    const px = Math.round(cx - 6.5 + k * 3.2);
    const py = Math.round(cy - 5.5 + Math.abs(k - 2) * 0.9);
    const col = k % 2 === 0 ? PINK : BONE;
    body.set(px, py - 1, col[3]).set(px - 1, py, col[3]).set(px + 1, py, col[2]).set(px, py + 1, col[2]).set(px, py, HOT);
  }

  // the near arm hangs, a little out from the side
  arm(front, [X - c, shoulderY + 3], [X - c - 2.5, beltY - 2], [X - c - 3, beltY + 5], 1.9, SKIN, SKIN);
  fist(front, X - c - 3, beltY + 7);
  vine(front, X - c - 4, shoulderY + 8, beltY + 4, 4, LIGHT);

  return compose([back, bough, body, hand, front], over, glows);
}

// ---------------------------------------------------------------------------------------------
// 10. Three charms: stout, bearded, a wreath of leaves on his head and a broad sash of amber. His
// staff is hung with a horn, a feather and a curl of tentacle: one for each of the three shapes.

function charmed(): Px {
  const { X, hip, shoulderY, beltY, hipY, chinY } = frame(50, 0.97, 0.46);
  const R = 6;
  const cx = X - 0.5;
  const cy = chinY - R + 1;
  const c = 8.5;
  const w = 8.5;
  const glows: Glow[] = [];
  const over = layer();
  const staff = layer();
  const charms = layer();
  const back = layer();
  const body = layer();
  const front = layer();

  // the staff: a forked pole, and a cord strung between the two tines
  const sx = X - 23;
  const top = Math.round(cy) - 12;
  for (let y = top + 9; y <= FAY - 2; y++) staff.set(sx, y, BARK[y % 7 === 0 ? 2 : 3]).set(sx + 1, y, BARK[1]);
  limb(staff, sx + 0.5, top + 10, sx - 8, top, 1.25, 0.9, BARK);
  limb(staff, sx + 1.5, top + 10, sx + 11, top, 1.25, 0.9, far(BARK));
  for (let x = sx - 8; x <= sx + 10; x++) staff.set(x, top + 2 + Math.round(2.4 * (1 - ((x - sx - 1) / 9.5) ** 2)), BONE[2]);
  // a knot of amber where the pole forks
  ball(over, sx + 1, top + 10, 1.7, 1.7, AMBER);
  spark(over, glows, sx, top + 9, 9);
  // the horn, the curl of tentacle and the feather hang from it
  stamp(charms, sx - 12, top + 5, ['...AAAA.', '...HHHM.', '..HHHMM.', '..HHMM..', '.HHMM...', '.HHM....', 'HHM.....', 'HM......', 'H.......'], { A: AMBER[2], H: BONE[3], M: BONE[2] });
  charms.vline(sx + 1, top + 5, 7, BONE[1]);
  stamp(charms, sx - 2, top + 12, ['..PP..', '..PPo.', '..PPo.', '...PP.', '...PPo', '...PP.', '.pPPo.', 'Pp.PP.', 'PP.pP.', '.PPP..'], { P: RUST[2], p: RUST[1], o: LIGHT });
  stamp(charms, sx + 7, top + 5, ['.HH..', 'HHMm.', 'HAAm.', 'HHMm.', 'HAAm.', 'HHMm.', 'HAAm.', '.HMm.', '.HM..', '..m..'], { H: BONE[3], M: BONE[2], m: BONE[1], A: AMBER[2] });

  // a short cape off the far shoulder
  hang(back, dim(STEEL), X + 4, shoulderY, hipY + 3, c - 1, c + 1, 'zig', 3);

  leg(body, X + 1, FAY - 3, hip - 2, 4, true, HOSE, PLUM, 0.5, true);
  leg(body, X - 5, FAY - 1, hip, 4, false, HOSE, PLUM, 0.5, true);
  // the far arm: a fist on the hip
  arm(body, [X + c, shoulderY + 3], [X + c + 5, beltY - 4], [X + w + 1, beltY + 1], 2.5, DUSK, dim(SKIN));
  fist(body, X + w + 1, beltY + 1, dim(SKIN));
  // a tunic over a round belly, and a broad sash of amber
  hang(body, DUSK, X, beltY + 2, hipY + 6, w + 0.5, w + 1.5, 'zig');
  shape(
    body,
    DUSK,
    (l) => {
      for (let y = shoulderY; y <= beltY + 1; y++) {
        const t = (y - shoulderY) / (beltY + 1 - shoulderY);
        const h = c - 1 + 2 * Math.sin(Math.PI * Math.min(1, t * 0.85));
        l.rect(Math.round(X - h), y, Math.round(X + h) - Math.round(X - h), 1, INK);
      }
    },
    [0, 4],
  );
  sash(body, Math.round(X - w - 1), beltY - 2, Math.round(w * 2 + 2), 5);
  shape(body, AMBER, (l) => {
    for (let y = beltY + 3; y <= hipY + 9; y++) l.rect(X + 3 + Math.round((y - beltY) * 0.1), y, 4, 1, INK);
  });
  // the head: bald on top, a full red beard, and the wreath
  body.rect(X - 2, chinY - 1, 4, 3, SKIN[1]);
  ball(body, cx, cy, R, R, SKIN);
  const fx = Math.round(cx) + 1;
  const ey = Math.round(cy) - 1;
  body.set(fx - 2, ey, INK).set(fx - 2, ey + 1, INK).set(fx + 1, ey, INK).set(fx + 1, ey + 1, INK);
  shape(body, RUST, (l) => {
    for (let y = ey + 3; y <= chinY + 5; y++) {
      const t = (y - ey - 3) / (chinY + 2 - ey);
      const h = (R + 0.6) * Math.sqrt(Math.max(0, 1 - t ** 2.2));
      l.rect(Math.round(fx - 0.5 - h), y, Math.round(fx - 0.5 + h) - Math.round(fx - 0.5 - h), 1, INK);
    }
    // it runs up to the ears
    l.rect(Math.round(cx - R - 0.4), ey, 2, 3, INK);
    l.rect(Math.round(cx + R - 1.4), ey, 2, 3, INK);
  });
  body.set(fx - 1, ey + 3, SKIN[3]).set(fx, ey + 3, SKIN[2]);
  body.hline(fx - 2, ey + 5, 4, RUST[1]);
  for (let k = 0; k <= 6; k++) {
    const a = ((193 + k * 25.7) * Math.PI) / 180;
    sprig(body, cx - 1 + Math.cos(a) * 6.6, cy - 2.2 + Math.sin(a) * 6.2, k % 2 === 0 ? AMBER : RUST);
  }

  // the near arm, out to the staff
  const hy = shoulderY + 8;
  arm(front, [X - c, shoulderY + 3], [X - c - 5, shoulderY + 9], [sx + 2, hy], 2.5, DUSK, SKIN);
  fist(front, sx + 1, hy);

  return compose([staff, charms, back, body, front], over, glows);
}

// ---------------------------------------------------------------------------------------------

export const DRUIDS: ReadonlyArray<Option> = [
  { n: 1, name: 'Budding antlers', note: 'A deep hood under budding antlers, a collar of autumn leaves, a living crook curled round a glowing bud.', reads: 'either', paint: antlered },
  { n: 2, name: 'Mushroom cap', note: 'The small one: a cap wider than the shoulders with spots that glow, bare feet, a jar of fireflies.', reads: 'either', paint: toadstool },
  { n: 3, name: 'Tree-ring mask', note: 'A slice of tree trunk worn as a mask over a dark hood, its rings for a face. A seedling alight in the hands.', reads: 'either', paint: masked },
  { n: 4, name: 'Cloak of leaves', note: 'A cloak of autumn leaves coming apart on the wind, silver hair blown with it, a whirl of leaves at one hand.', reads: 'either', paint: windblown },
  { n: 5, name: 'Hive helm', note: 'Wicker armour and shield, a club like a honey dipper, and a straw beehive for a helm, bees and all.', reads: 'either', paint: hived },
  { n: 6, name: 'Skull and pelt', note: "Broad, under a bull's horned skull, in a shaggy pelt. Tattoos that glow on bare limbs. It leans toward the bull.", reads: 'either', paint: skulled },
  { n: 7, name: 'Feather mantle', note: "A mantle of striped feathers opened like a wing, a tufted hood, a face like an owl's. It leans toward the owl.", reads: 'either', paint: feathered },
  { n: 8, name: 'Tide hood', note: 'A tall finned hood and a robe that ends in curling ribbons, spotted with light. It leans toward the squid.', reads: 'either', paint: tidal },
  { n: 9, name: 'Flower crown', note: 'Barefoot, with long amber hair and a crown of flowers. Vines of light on her limbs, a bough in blossom.', reads: 'woman', paint: crowned },
  { n: 10, name: 'Three charms', note: 'Stout and red-bearded. His staff is hung with a horn, a feather and a tentacle: one for each shape.', reads: 'man', paint: charmed },
];

/** Where the figures stand on their canvas. */
export const ANCHOR = { x: FAX, y: FAY };
