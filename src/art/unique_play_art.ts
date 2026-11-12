// WHAT THE UNIQUE ITEMS SHOW IN PLAY: THE PICTURES (the art chat, 11 Nov 2026; queue item draw-unique-items).
//
// The first three, the ones the build had no picture for at all (docs/uniques/README.md 4 and 5). Each is behind a switch of
// its own that is off (render/unique_play.ts UNIQUE_PLAY); render/unique_fx.ts lays them in the game. Nothing here draws on a
// screen: every picture is painted pixel by pixel at the heroes' grain (two picture pixels to a game pixel), crisp, lit from
// the upper left, and each keeps to its unique's bag picture (art/items_unique.ts), which has his yes.
//
// THE RESTLESS TOME (the Warlock's; his idea: “I’d like a tome that swirls around you and puts hellfire on any enemy it
// touches”). The bag picture is his red book open and in the air, its boards spread like wings, its leaves lifting, the demon's
// fire streaming off it. In play it is that book TRULY TURNED: built of its boards and leaves and seen from the game's one
// camera, sixteen ways round, beating its boards like wings as it flies (eight frames a beat), its inner board dipped into
// its turn, two leaves lifting off the gutter, its ribbon flying behind. Its fire is the demon's red-orange (his 3 Nov:
// “cyan fire in the demonic hand, red/orange fire on the tome”), in the shape of the Warlock's own fire (dev/sculpt_warlock.ts
// fireAt): tongues of it left along its way, and a burst of it on the one it touches, before his cyan hellfire takes there.
//
// THE FLESHMANCER'S BRAND: the elite he killed, risen to fight for him. Its own pictures (whatever kind it was), the life gone
// out of them: its colours drained to a cold grey, and all that glowed the enemy's pink on it glowing the friend's cyan (its
// eyes, its edge of light): `risenLook`. Under it THE BRAND as its bag picture has it, a ring and a stroke through it, in the
// friend's cyan on the floor, turning slowly, its ring burning away as its time runs out; and cracks of light in the floor
// where it rose.
//
// THE FOURTH GLOBE is the Brawler's row of globes with one more (dev/veteran_globes.ts paintGlobes takes four).
//
// HIS RULES KEPT: what glows on a friend is cyan; pink and gold glows are the enemy's (none here); honest fire is orange, and
// the tome's the demon's red-orange. No ball, box or plain ring: the book is a book, the brand the brand of its glove.

import { Px, rgba } from '../engine/px';
import { INK } from './kit';
import type { Ramp } from './kit';
import { HELL, fireAt, fireFoot } from '../dev/sculpt_warlock';
import { Light, burst } from '../dev/warlock_fx';
import { STUFF, crackStar, drawCrack } from '../dev/demon_fx';

// ---------------------------------------------------------------------------------------------------------------------------
// THE RESTLESS TOME

/** The book's red leather (dev/sculpt_warlock.ts BOOKRED, the bag picture's `bookred`). */
export const TOME_RED: Ramp = ['#22040c', '#420a16', '#6e1420', '#a02a2c', '#c84a3e'];
/** Its leaves (the bag picture's `linen`). */
export const TOME_LEAF: Ramp = ['#463a38', '#7a6a62', '#ae9c8e', '#dccebe', '#f8f0e2'];
/** Its ribbon and its corners (the bag picture's `gold`: a metal, lit, not a glow). */
export const TOME_GOLD: Ramp = ['#4a2408', '#8a4e14', '#d0902c', '#f6cc5c', '#fff4c0'];
/** THE DEMON'S FIRE, red and orange (the bag picture's `fire`), ragged edge to hot heart: never pink, never a gold glow. */
export const TOME_FIRE = ['#8e1a0a', '#d8401a', '#ff8a2c', '#ffd49a'] as const;
/** The light it throws on the floor. */
export const TOME_GLOW = '#ff7a2c';

/**
 * The book's measures: how many ways round it is painted and how many frames a beat of its boards; its picture's size and the
 * pixel of it that is the middle of its spine (picture pixels); its spine's length and a board's width.
 */
export const TOME = { headings: 16, flaps: 8, w: 76, h: 68, ax: 38, ay: 42, spine: 19, board: 14 };

type V3 = [number, number, number];
type P2 = [number, number];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: V3): V3 => {
  const n = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};
/** Toward the game's one camera (across the screen, toward the eye along the floor, up): it looks down at thirty degrees. */
const EYE: V3 = [0, 0.866, 0.5];
/** Where the light comes from: the upper left. */
const SUN: V3 = unit([-0.55, 0.3, 0.78]);

/** A flat piece of the book: its corners, its colours, which part of the book it is (a seam is drawn where two parts meet). */
interface Face {
  pts: V3[];
  ramp: Ramp;
  part: number;
  /** Lighter or darker than the light alone makes it (tones). */
  bias?: number;
  /** The lightest tone it may take (its leaves lying on it: the lifting ones are whiter). */
  most?: number;
  /** Lines drawn on it (writing, a corner of brass): from, to, colour. */
  marks?: { a: V3; b: V3; c: string }[];
}

/** One picture pixel, solid, and which part it belongs to. */
function dab(px: Px, ids: Int16Array, x: number, y: number, c: string, part: number): void {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || y < 0 || x >= px.w || y >= px.h) return;
  const v = rgba(c);
  const i = (y * px.w + x) * 4;
  px.d[i] = v[0];
  px.d[i + 1] = v[1];
  px.d[i + 2] = v[2];
  px.d[i + 3] = 255;
  ids[y * px.w + x] = part;
}
function stroke(px: Px, ids: Int16Array, a: P2, b: P2, c: string, part: number): void {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))));
  for (let i = 0; i <= n; i++) dab(px, ids, a[0] + ((b[0] - a[0]) * i) / n - 0.5, a[1] + ((b[1] - a[1]) * i) / n - 0.5, c, part);
}
/** A shape filled, whole pixels, and its own edge drawn in its colour (so that one seen nearly edge-on is still there). */
function fill(px: Px, ids: Int16Array, pts: P2[], c: string, part: number): void {
  const ys = pts.map((p) => p[1]);
  const y0 = Math.max(0, Math.floor(Math.min(...ys)));
  const y1 = Math.min(px.h - 1, Math.ceil(Math.max(...ys)));
  for (let y = y0; y <= y1; y++) {
    const yc = y + 0.5;
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) dab(px, ids, x, y, c, part);
  }
  for (let i = 0; i < pts.length; i++) stroke(px, ids, pts[i], pts[(i + 1) % pts.length], c, part);
}

/**
 * THE BOOK IN FLIGHT, one way round (`heading` of TOME.headings: the way it flies on the picture, 0 to the right, a quarter of
 * them on straight toward the eye) at one moment of its beat (`flap` of TOME.flaps). Its spine lies along its flight; its
 * boards are its wings, beating; the board on the inside of its turn (its left: it goes round him with him on its left) dips.
 */
export function paintTome(heading: number, flap: number): Px {
  const px = new Px(TOME.w, TOME.h);
  const ids = new Int16Array(TOME.w * TOME.h);
  const al = (heading / TOME.headings) * Math.PI * 2;
  const ph = (flap / TOME.flaps) * Math.PI * 2;
  const F: V3 = [Math.cos(al), Math.sin(al), 0];
  const L: V3 = [-F[1], F[0], 0];
  const U: V3 = [0, 0, 1];
  const at = (p: V3): P2 => [TOME.ax + p[0], TOME.ay + 0.5 * p[1] - 0.866 * p[2]];
  const half = TOME.spine / 2;
  const W = TOME.board;
  // (the beat: the boards swept down fast and lifted slower, as a bird's; the whole book riding up as they come down)
  const beat = Math.sin(ph) + 0.25 * Math.sin(2 * ph);
  const lift = -1.2 * Math.cos(ph);
  const deg = Math.PI / 180;
  const up: V3 = [0, 0, lift];
  const faces: { f: Face; near: number }[] = [];
  const push = (f: Face, near?: number): void => {
    const mid = f.pts.reduce((a, p) => add(a, p), [0, 0, 0] as V3);
    faces.push({ f, near: near ?? dot(mul(mid, 1 / f.pts.length), EYE) });
  };
  // ITS TWO BOARDS, each with its block of leaves on it (s: 1 its left, the inside of its turn; -1 its right)
  const wing = (s: number): { top: boolean; near: number; faces: Face[] } => {
    const phi = (15 + 30 * beat - s * 13) * deg;
    const d: V3 = add(mul(L, s * Math.cos(phi)), mul(U, Math.sin(phi)));
    const n: V3 = add(mul(U, Math.cos(phi)), mul(L, -s * Math.sin(phi)));
    const top = dot(n, EYE) > 0.06;
    const P = (f: number, t: number, hgt: number): V3 => add(add(add(mul(F, f), mul(d, t)), mul(n, hgt)), up);
    const part = s > 0 ? 1 : 2;
    const out: Face[] = [];
    const board: V3[] = [P(-half, 0, 0), P(half, 0, 0), P(half, W, 0), P(-half, W, 0)];
    if (!top) {
      // (seen from under: its red board, a corner of brass at each outer corner)
      const brass = TOME_GOLD[2];
      out.push({
        pts: board, ramp: TOME_RED, part, bias: 1.4,
        marks: [
          { a: P(half - 0.4, W - 0.4, 0), b: P(half - 2.6, W - 0.4, 0), c: brass }, { a: P(half - 0.4, W - 0.4, 0), b: P(half - 0.4, W - 2.6, 0), c: brass },
          { a: P(-half + 0.4, W - 0.4, 0), b: P(-half + 2.6, W - 0.4, 0), c: brass }, { a: P(-half + 0.4, W - 0.4, 0), b: P(-half + 0.4, W - 2.6, 0), c: brass },
        ],
      });
      return { top, near: dot(P(0, W * 0.5, 0), EYE), faces: out };
    }
    // (seen from above: the board's rim round the leaves; the leaves swelling up from the gutter and falling away to their
    // edge; three lines of writing; the leaves' edge, and their end toward the eye)
    out.push({ pts: board, ramp: TOME_RED, part, bias: 1.5 });
    const t0 = 0.5;
    const tm = W * 0.4;
    const t1 = W - 2.8;
    const h0 = 0.5;
    const hm = 3.2;
    const h1 = 1.3;
    const e = half - 2.2;
    const hOf = (t: number): number => (t < tm ? h0 + ((hm - h0) * (t - t0)) / (tm - t0) : hm + ((h1 - hm) * (t - tm)) / (t1 - tm));
    const lines = [-4.6, -1.4, 1.8, 5.0].map((f, i) => {
      const a = tm + 0.6;
      const b = t1 - 1.0 - (i === 3 ? 3.0 : 0);
      return { a: P(f, a, hOf(a) + 0.05), b: P(f, b, hOf(b) + 0.05), c: TOME_LEAF[2] };
    });
    out.push({ pts: [P(-e, t0, h0), P(e, t0, h0), P(e, tm, hm), P(-e, tm, hm)], ramp: TOME_LEAF, part: part + 2, bias: 0.5, most: 3 });
    out.push({ pts: [P(-e, tm, hm), P(e, tm, hm), P(e, t1, h1), P(-e, t1, h1)], ramp: TOME_LEAF, part: part + 2, bias: 0.5, most: 3, marks: lines });
    out.push({ pts: [P(-e, t1, h1), P(e, t1, h1), P(e, t1 + 0.6, 0), P(-e, t1 + 0.6, 0)], ramp: TOME_LEAF, part: part + 2, bias: -0.4 });
    const end = F[1] > 0 ? e : -e;
    out.push({ pts: [P(end, t0, 0), P(end, t0, h0), P(end, tm, hm), P(end, t1, h1), P(end, t1 + 0.6, 0)], ramp: TOME_LEAF, part: part + 2, bias: 0 });
    return { top, near: dot(P(0, W * 0.5, 0), EYE), faces: out };
  };
  // TWO LEAVES LIFTING off the gutter, each curling over at its tip and blown back off its flight, fluttering
  const leaf = (th0: number, swing: number, off: number, part: number): Face[] => {
    const th = (th0 + swing * Math.sin(ph + off)) * deg;
    const th2 = th + (th0 < 90 ? -40 : 40) * deg * (0.6 + 0.4 * Math.sin(ph + off + 1.1));
    const e1: V3 = add(mul(L, Math.cos(th)), mul(U, Math.sin(th)));
    const e2: V3 = add(mul(L, Math.cos(th2)), mul(U, Math.sin(th2)));
    const b0: V3 = add(add(mul(F, -half + 4.6), mul(U, 0.9)), up);
    const b1: V3 = add(add(mul(F, half - 4.0), mul(U, 0.9)), up);
    const back = mul(F, -1.4);
    const m0 = add(add(b0, mul(e1, 4.2)), mul(back, 0.5));
    const m1 = add(add(b1, mul(e1, 4.2)), mul(back, 0.5));
    const q0 = add(add(m0, mul(e2, 3.8)), back);
    const q1 = add(add(m1, mul(e2, 3.8)), back);
    return [{ pts: [b0, b1, m1, m0], ramp: TOME_LEAF, part, bias: 1.6 }, { pts: [m0, m1, q1, q0], ramp: TOME_LEAF, part, bias: 1.6 }];
  };
  const a = wing(1);
  const b = wing(-1);
  const [far, nr] = a.near <= b.near ? [a, b] : [b, a];
  let order = 0;
  const lay = (fs: Face[]): void => {
    for (const f of fs) push(f, order++);
  };
  // ITS RIBBON, flying from the foot of its spine, back along its way and waving: drawn first when its tail is the far end
  const ribbon = (): void => {
    let p: V3 = add(add(mul(F, -half + 0.6), mul(U, 0.6)), up);
    for (let k = 0; k < 4; k++) {
      const q: V3 = add(p, add(add(mul(F, -3.0), mul(L, 1.5 * Math.sin(ph * 2 + k * 1.3))), mul(U, 1.0 * Math.cos(ph + k * 1.1) - 0.3)));
      const c = TOME_GOLD[k === 0 ? 3 : k === 3 ? 2 : 3];
      const pa = at(p);
      const pb = at(q);
      stroke(px, ids, pa, pb, c, 9);
      stroke(px, ids, [pa[0], pa[1] + 1], [pb[0], pb[1] + 1], TOME_GOLD[1], 9);
      p = q;
    }
  };
  if (F[1] > 0) ribbon();
  lay(far.faces);
  if (nr.top) lay(nr.faces);
  const leaves = [leaf(58, 22, 0.4, 5), leaf(124, 20, 2.3, 6)];
  // (the one leaning away from the eye first)
  leaves.sort((p, q) => dot(p[1].pts[2], EYE) - dot(q[1].pts[2], EYE));
  for (const l of leaves) lay(l);
  if (!nr.top) lay(nr.faces);
  for (const { f } of faces.sort((p, q) => p.near - q.near)) {
    // (its tone by how it faces the light; the side of it that faces the eye is the side that is seen)
    let n = unit(cross(sub(f.pts[1], f.pts[0]), sub(f.pts[f.pts.length - 1], f.pts[0])));
    if (dot(n, EYE) < 0) n = mul(n, -1);
    const lit = dot(n, SUN);
    const tone = Math.max(0, Math.min(f.most ?? 4, Math.round((lit > 0.8 ? 3.4 : lit > 0.55 ? 2.8 : lit > 0.3 ? 2 : lit > 0.05 ? 1.3 : 0.6) + (f.bias ?? 0))));
    fill(px, ids, f.pts.map(at), f.ramp[tone], f.part);
    for (const m of f.marks ?? []) stroke(px, ids, at(m.a), at(m.b), m.c, f.part);
  }
  if (F[1] <= 0) ribbon();
  // THE SEAMS: where one part of it ends in front of another, a line of deep indigo, on the lower pixel of the two (and
  // the gutter between its two blocks of leaves)
  const seam: number[] = [];
  for (let y = 0; y < px.h - 1; y++) {
    for (let x = 0; x < px.w - 1; x++) {
      const p = ids[y * px.w + x];
      if (!p) continue;
      const r = ids[y * px.w + x + 1];
      const d = ids[(y + 1) * px.w + x];
      // (a board and its own leaves are not parted, nor a lifting leaf or the ribbon from anything: its red rim, the leaf's white
      // and the ribbon's gold part them already)
      const kin = (m: number, n: number): boolean => m === n || (m <= 2 && n === m + 2) || (n <= 2 && m === n + 2) || (m <= 2 && n <= 2) || m >= 5 || n >= 5;
      const apart = (q: number): boolean => q !== 0 && p !== 9 && q !== 9 && !kin(p, q);
      if (apart(d)) seam.push((y + 1) * px.w + x);
      else if (apart(r)) seam.push(y * px.w + x + 1);
    }
  }
  const ink = rgba(INK);
  for (const i of seam) {
    px.d[i * 4] = ink[0];
    px.d[i * 4 + 1] = ink[1];
    px.d[i * 4 + 2] = ink[2];
  }
  return px;
}

/** A tongue of the tome's fire: the sizes it is painted at (its half-width at its foot, picture pixels), and how many flickers of each. */
export const TOME_FLAME = { sizes: [1.2, 1.7, 2.3, 3.0, 3.8, 4.8], frames: 8, lean: 0.4 };

/**
 * A TONGUE OF ITS FIRE, of size `size` (one of TOME_FLAME.sizes), at flicker `frame`, leaning `lean` (-1, 0 or 1: blown back
 * off the way the book flies, to the picture's left or right): the Warlock's own fire's shape, in the demon's red and orange.
 * Its anchor is its heart.
 */
export function paintTomeFlame(size: number, frame: number, lean: number): { px: Px; ax: number; ay: number } {
  const l = new Light();
  const H = Math.round(size * 3.3);
  const reach = Math.ceil(size * 1.5 * 1.6 + TOME_FLAME.lean * H * 1.3) + 1;
  const top = -Math.round(H * 1.25);
  const foot = Math.ceil(fireFoot(size));
  // (Light.lay leaves two pixels round the picture's edge empty)
  const px = new Px(reach * 2 + 5, foot - top + 5);
  const cx = reach + 2;
  const cy = 2 - top;
  for (let yy = top; yy <= foot; yy++) {
    for (let x = -reach; x <= reach; x++) {
      const k = fireAt(x, yy, size, frame * 0.11 + size, lean * TOME_FLAME.lean);
      if (k >= 0) l.put(cx + x, cy + yy, k);
    }
  }
  l.lay(px, TOME_FIRE);
  return { px, ax: cx, ay: cy };
}

/** How long the burst on the one it touches lasts (frames of a thirtieth of a second). */
export const TOME_TOUCH_FRAMES = 9;
/**
 * ITS FIRE LEAPING ONTO THE ONE IT TOUCHES, `age` frames after (0 the touch): a great tongue of it flaring up there, and a ring
 * of flame flecks flung out from it, breaking up as it goes. Its anchor is where it touched (the height of a man's chest).
 */
export function paintTomeTouch(age: number, seed: number): { px: Px; ax: number; ay: number } {
  const l = new Light();
  const px = new Px(64, 60);
  const cx = 32;
  const cy = 36;
  const u = age / TOME_TOUCH_FRAMES;
  if (age < 5) {
    const size = [5.2, 6.0, 5.0, 3.8, 2.6][age];
    const H = Math.round(size * 3.3);
    for (let yy = -Math.round(H * 1.25); yy <= Math.ceil(fireFoot(size)); yy++) {
      for (let x = -Math.ceil(size * 2.6); x <= Math.ceil(size * 2.6); x++) {
        const k = fireAt(x, yy, size, age * 0.13 + seed, 0);
        if (k >= 0) l.put(cx + x, cy + yy + 2, k);
      }
    }
  }
  burst(l, cx, cy - 2, 7 + 15 * (1 - (1 - u) * (1 - u)), u, seed + 3);
  if (age < 6) burst(l, cx, cy - 2, 4 + 9 * u, Math.min(1, u * 1.5), seed + 11);
  l.lay(px, TOME_FIRE);
  return { px, ax: cx, ay: cy };
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE FLESHMANCER'S BRAND: THE RISEN ELITE

/** The friend's cyan as the risen one glows it: dark to white (art/kit.ts CYAN, the Warlock's HELL). */
export const RISEN_CYAN = HELL;

/**
 * THE RISEN LOOK, a pixel at a time (red, green, blue of 255 in; the same out): what glowed the enemy's pink (its eyes, its
 * runes, its fire's root, its edge of light: art/mkit.ts ENEMY_RIM, FLAME, MENACE) glows the friend's cyan, as bright as it
 * was; the gold at its fire's tip goes the cyan's white; and all the rest of it is drained: most of its colour gone, cold and
 * a little darker, as a dead thing is. A grey stays the grey it was but for the cold.
 */
export function risenPixel(r: number, g: number, b: number): [number, number, number] {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 510;
  const dl = mx - mn;
  const s = dl === 0 ? 0 : dl / 255 / (1 - Math.abs(2 * l - 1) || 1);
  let h = 0;
  if (dl > 0) {
    if (mx === r) h = ((g - b) / dl + 6) % 6;
    else if (mx === g) h = (b - r) / dl + 2;
    else h = (r - g) / dl + 4;
    h *= 60;
  }
  // (the enemy's pink, from its deep magenta to its hot pink, not what is all but black; and its fire's gold tip, bright and strong)
  const pink = s >= 0.42 && l >= 0.15 && h >= 296 && h <= 349;
  const gold = s >= 0.85 && l >= 0.68 && dl >= mx * 0.3 && h >= 18 && h <= 58;
  if (pink || gold) {
    // (the friend's cyan at that brightness: #0c6a80 dark, #22d0e0 its body, #b8fff8 light, white)
    const k = gold ? Math.min(1, l + 0.1) : l;
    const stops: [number, [number, number, number]][] = [[0.0, [4, 40, 52]], [0.27, [12, 106, 128]], [0.5, [34, 208, 224]], [0.85, [184, 255, 248]], [1, [255, 255, 255]]];
    for (let i = 1; i < stops.length; i++) {
      if (k <= stops[i][0]) {
        const t = (k - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]);
        const a = stops[i - 1][1];
        const c = stops[i][1];
        return [Math.round(a[0] + (c[0] - a[0]) * t), Math.round(a[1] + (c[1] - a[1]) * t), Math.round(a[2] + (c[2] - a[2]) * t)];
      }
    }
    return [255, 255, 255];
  }
  const y = 0.3 * r + 0.59 * g + 0.11 * b;
  const keep = 0.26;
  const d = (v: number, cold: number): number => Math.max(0, Math.min(255, Math.round((y + (v - y) * keep) * cold)));
  return [d(r, 0.72), d(g, 0.84), d(b, 1.02)];
}

/** The risen look laid on a whole picture's pixels (four bytes each), in place; what is clear stays clear. */
export function risenLook(d: Uint8ClampedArray): void {
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const [r, g, b] = risenPixel(d[i], d[i + 1], d[i + 2]);
    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
  }
}

/** The brand on the floor: how many places in its turn it is painted at, and how many steps of its time left. */
export const BRAND = { turns: 48, steps: 24 };

/**
 * THE BRAND UNDER IT, on the floor (the floor's own slant: twice as wide as it is deep): the glove's brand, A RING AND A
 * STROKE THROUGH IT, a bar across each end of the stroke as a branding iron's has, in the friend's cyan. `r` its ring's
 * half-width (picture pixels); `turn` where it is in its slow turn (of BRAND.turns: half a turn, the stroke the same either
 * end); `left` how much of its time is left (of BRAND.steps): the ring burns away from its top round as its time runs out, the
 * burnt part left as a few dim embers; `hot`, as it is stamped down, all of it white. Its anchor is its middle.
 */
export function paintBrand(r: number, turn: number, left: number, hot = false): { px: Px; ax: number; ay: number } {
  const reach = r + 7;
  const w = reach * 2 + 1;
  const h = reach + 3;
  const px = new Px(w, h);
  const cx = reach;
  const cy = Math.floor(h / 2);
  const put = (x: number, y: number, c: string): void => {
    px.set(Math.round(cx + x), Math.round(cy + y * 0.5), c);
  };
  const [dim, body, light, white] = RISEN_CYAN;
  const share = left / BRAND.steps;
  // the ring: two pixels thick, its lit arc from its top round the way a clock goes
  const n = Math.ceil(r * 7);
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const a = -Math.PI / 2 + u * Math.PI * 2;
    const lit = u < share;
    const tip = lit && share < 1 && u > share - 0.035;
    for (const [rr, c] of [[r, hot ? white : tip ? white : lit ? body : dim], [r - 1.1, hot ? white : tip ? white : lit ? light : dim]] as [number, string][]) {
      // (what is burnt away: an ember here and there, not a line)
      if (!lit && !hot && (i % 7 > 1 || rr < r)) continue;
      put(Math.cos(a) * rr, Math.sin(a) * rr, c);
    }
  }
  // the stroke through it, out past the ring either end, a bar across each end
  const a = (turn / BRAND.turns) * Math.PI;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const R = r + 4.5;
  for (let t = -R; t <= R; t += 0.4) {
    const c = hot ? white : Math.abs(t) < r * 0.5 ? light : body;
    put(ux * t, uy * t, c);
    put(ux * t - uy * 0.9, uy * t + ux * 0.9, hot ? white : body);
  }
  for (const e of [-R, R]) for (let t = -2.6; t <= 2.6; t += 0.4) put(ux * e - uy * t, uy * e + ux * t, hot ? white : light);
  return { px, ax: cx, ay: cy };
}

/** The cracks where it rose: how many frames they take to run out, and how many steps their light takes to die. */
export const RISE_CRACKS = { grow: 5, cool: 8, reach: 17 };
/**
 * THE FLOOR CRACKED WHERE IT ROSE: a star of jagged cracks run out from under it (`grow` of RISE_CRACKS.grow: how far they have
 * run), light in them (`cool` of RISE_CRACKS.cool: 0 white-hot, the last step dark: only the cracks left). The Warlock's own
 * cracks (dev/demon_fx.ts), lit the friend's cyan. Its anchor is its middle.
 */
export function paintRiseCracks(grow: number, cool: number, seed: number): { px: Px; ax: number; ay: number } {
  const R = RISE_CRACKS.reach + 9;
  const px = new Px(R * 2 + 5, R + 7);
  const cx = R + 2;
  const cy = Math.floor(px.h / 2);
  const dark = new Light();
  const glow = new Light();
  const heat = cool >= RISE_CRACKS.cool - 1 ? -1 : 3.4 - (cool / (RISE_CRACKS.cool - 1)) * 3.2;
  for (const c of crackStar(0, 0, 7, RISE_CRACKS.reach, 2.5, seed)) drawCrack(dark, glow, c, Math.min(1, (grow + 1) / RISE_CRACKS.grow), heat, (p) => [cx + p[0], cy + p[1] * 0.5]);
  dark.lay(px, STUFF);
  glow.lay(px, RISEN_CYAN);
  return { px, ax: cx, ay: cy };
}

/** How long the burst of its blow lasts (frames of a thirtieth of a second). */
export const RISEN_BLOW_FRAMES = 6;
/**
 * THE RISEN ONE'S BLOW, where it lands, `age` frames after (0 the blow): a jagged star of light flung out big, white at its
 * heart, the friend's cyan round it, then broken into streaks flying out. Its anchor is its middle.
 */
export function paintRisenBlow(age: number, seed: number): { px: Px; ax: number; ay: number } {
  const px = new Px(84, 72);
  const cx = 42;
  const cy = 36;
  const [, body, light, white] = RISEN_CYAN;
  const rnd = (i: number): number => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const disc = (x: number, y: number, r: number, c: string): void => {
    for (let yy = Math.floor(y - r); yy <= Math.ceil(y + r); yy++) for (let xx = Math.floor(x - r); xx <= Math.ceil(x + r); xx++) if ((xx + 0.5 - x) ** 2 + (yy + 0.5 - y) ** 2 <= r * r) px.set(xx, yy, c);
  };
  const n = 7;
  const way = (i: number): number => (i / n) * Math.PI * 2 + rnd(seed * 7 + i) * 0.6;
  if (age <= 2) {
    const k = [1, 0.9, 0.66][age];
    for (const [grow, c] of [[1.7, body], [0.7, light], [-0.7, white]] as [number, string][]) {
      for (let i = 0; i < n; i++) {
        const a = way(i);
        const len = 21 * k * (0.5 + 0.5 * rnd(seed * 13 + i));
        for (let q = 0; q <= len * 2; q++) {
          const t = q / (len * 2);
          const r = 2.7 * (1 - t) * k + grow * (1 - t * 0.6);
          if (r > 0.3) disc(cx + Math.cos(a) * len * t, cy + Math.sin(a) * len * t * 0.8, r, c);
        }
      }
      disc(cx, cy, 4.6 * k + grow, c);
    }
  } else if (age < RISEN_BLOW_FRAMES) {
    for (let i = 0; i < n; i++) {
      const a = way(i);
      const r0 = 21 * (0.5 + 0.17 * age);
      const r1 = r0 + 8 * (1 - (age - 3) / 3);
      for (let t = r0; t <= r1; t += 0.5) {
        const c = age < 5 ? light : body;
        px.set(cx + Math.cos(a) * t, cy + Math.sin(a) * t * 0.8, c);
        px.set(cx + Math.cos(a) * t + 1, cy + Math.sin(a) * t * 0.8, c);
      }
    }
  }
  return { px, ax: cx, ay: cy };
}
