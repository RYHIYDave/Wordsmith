// WHAT THE UNIQUE ITEMS SHOW IN PLAY, THE NEXT ONES: THE PICTURES (the art chat's helper, 12 Nov 2026; queue item draw-unique-items).
// No screen needed: each painter makes a picture (engine/px.ts Px) at the heroes' grain (two picture pixels to a game pixel),
// lit from the upper left, edged in the style's ink; render/unique_fx.ts lays them in the game, each behind its switch
// (render/unique_play.ts UNIQUE_PLAY), off.
//
//   THE DROWNED ARM   (amulet, the Swamp Colossus's: “Every 5 seconds a tentacle bursts up under the enemy you are fighting and
//                     slams it”): his drowned olive flesh, pale suckers down its inside (its bag picture's, art/items_unique.ts
//                     drownedarm, and the Colossus's own arm). As it is warned (game.ts stepArm: 'warn', half a second before),
//                     black water wells up on the floor there and churns; the arm bursts up out of it, towers, cocks back and
//                     whips down across the enemy as the blow lands ('slam'), lies there a moment, and is pulled back under; the
//                     water closes and is gone.
//   THE QUEEN'S TALONS (boots, the Carrion Queen's: “Each critical hit calls one of her birds: it dives on the nearest enemy”): one
//                     of her birds, her black-violet feathers and a pale ruff (its bag picture's), the yellow shank and black
//                     talons of the boot: it drops out of the air over him, dives on that enemy, wings swept back, in the
//                     rules' 0.35 seconds ('dive'), strikes talons first, flaps away up and is gone.

import { Px } from '../engine/px';
import { INK } from './kit';
import type { Ramp } from './kit';

/** His drowned olive flesh (the bag picture's `arm`), and its suckers. */
export const ARM_FLESH: Ramp = ['#12180e', '#263220', '#42542e', '#687c46', '#a2b07c'];
export const ARM_SUCKER = ['#5e5a40', '#8a8460', '#b4aa80', '#d8d0a6'] as const;
/** The black water it comes out of (the bag picture's deep `teal`, the darkest of it): never bright enough to read as a glow. */
export const ARM_WATER = ['#03090e', '#06161e', '#06222e', '#0c3a50', '#1e5866'] as const;

/**
 * THE DROWNED ARM'S TIMES AND SIZES. `frames` at 30 a second from the warning; the blow lands at frame `slam` (the rules' half a
 * second). Where it comes up: `from` tiles from the enemy (back and to the left on the screen, so that it whips down across him
 * from the side); how long it is (picture pixels), how thick at its root. The water's reach (tiles). Its canvas: `w` by `h`, its
 * root at (`ax`, `ay`).
 */
export const ARM = { frames: 36, slam: 15, from: [-0.8, 0.2] as const, long: 112, thick: 10, pool: 1.15, w: 236, h: 196, ax: 84, ay: 146 };
/** Its pale inside, where its suckers are (the bag picture's suckers' colour, shaded as its flesh is). */
export const ARM_INSIDE: Ramp = ['#22241a', '#3c4028', '#5a5e38', '#7e8050', '#a6a470'];

const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
const ease = (k: number): number => {
  const u = clamp(k, 0, 1);
  return u * u * (3 - 2 * u);
};
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;

/** Its pose at a frame: how much of it is out of the water (0..1), the way its root leaves the water (degrees, the screen's: -90 up), how much it bends along its length, how much its tip curls, how high off the floor its far end is lifted (lying). */
export function armPose(f: number): { out: number; a0: number; bend: number; curl: number; lie: number; wave: number } | null {
  const S = ARM.slam;
  // (where it lies across the floor: along the way from its root to the enemy, as the screen shows it)
  const lieA = (Math.atan2((ARM.from[0] * -1 + ARM.from[1] * -1) * 8, (ARM.from[0] * -1 - ARM.from[1] * -1) * 16) * 180) / Math.PI;
  const sway = 10 * Math.sin(f * 0.9);
  if (f < 3) return null;
  if (f < 10) {
    // (it bursts up, its tip hooked over, swaying)
    const k = ease((f - 3) / 6);
    return { out: 0.15 + 0.85 * k, a0: lerp(-98, -84, k), bend: lerp(30, 4, k), curl: lerp(150, 110, k) + sway, lie: 0, wave: 9 };
  }
  if (f < 13) {
    // (it cocks back, coiling)
    const k = ease((f - 9) / 3);
    return { out: 1, a0: lerp(-84, -112, k), bend: lerp(4, -46, k), curl: lerp(110, -130, k), lie: 0, wave: lerp(9, 4, k) };
  }
  if (f < S) {
    // (the whip: two frames, the second near the floor)
    const k = (f - 12) / (S - 12);
    return { out: 1, a0: lerp(-112, lieA - 4, k * k), bend: lerp(-46, 4, k), curl: lerp(-130, -40, k), lie: 0, wave: 2 };
  }
  if (f < S + 6) {
    // (it lies across him, its tip curling; it bounces once)
    const b = f === S + 2 ? 0.35 : f === S + 3 ? 0.18 : 0;
    return { out: 1, a0: lieA + 4, bend: 2, curl: -50 - (f - S) * 6, lie: b, wave: 3 };
  }
  if (f < ARM.frames - 2) {
    // (pulled back under: it lifts off the floor and sinks into the water, its tip last, curling up)
    const k = ease((f - S - 6) / (ARM.frames - 2 - S - 6));
    return { out: 1 - k, a0: lerp(lieA + 4, -70, Math.min(1, k * 2)), bend: lerp(2, 30, k), curl: lerp(-80, 160, k), lie: 0, wave: 6 };
  }
  return null;
}

/** Its line: the points down its middle from where it leaves the water to its tip, and how thick it is at each (picture pixels, on its canvas). */
export function armLine(f: number): { pts: [number, number][]; r: number[] } | null {
  const p = armPose(f);
  if (!p) return null;
  const N = 40;
  const L = ARM.long * p.out;
  const pts: [number, number][] = [[ARM.ax, ARM.ay]];
  const r: number[] = [];
  let x = ARM.ax;
  let y = ARM.ay;
  // (what is out of the water is its far end: its thick root shows only once it is all out)
  const s0 = 1 - p.out;
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    const sg = s0 + s * p.out;
    r.push(1 + (ARM.thick - 1) * Math.pow(1 - sg, 0.75));
    if (i === N) break;
    const a = ((p.a0 + p.bend * s + p.curl * s * s * s + p.wave * Math.sin(s * Math.PI * 2.2)) * Math.PI) / 180;
    x += Math.cos(a) * (L / N);
    // (lying, its far end lifted a little off the floor as it bounces)
    y += Math.sin(a) * (L / N) - p.lie * s * 2.2;
    pts.push([x, y]);
  }
  return { pts, r };
}

/** THE ARM AT A FRAME (from its warning; 0 to ARM.frames - 1): its picture, its root at (ARM.ax, ARM.ay). Empty where it is under. */
export function paintArm(f: number): Px {
  const out = new Px(ARM.w, ARM.h);
  const line = armLine(f);
  if (!line) return out;
  const { pts, r } = line;
  const W = ARM.w;
  const H = ARM.h;
  // each pixel: how near it is to its line, which side, how far along
  const best = new Float32Array(W * H).fill(Infinity);
  const along = new Float32Array(W * H);
  const side = new Float32Array(W * H);
  const nx = new Float32Array(W * H);
  const ny = new Float32Array(W * H);
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const R = Math.max(r[i], r[i + 1]) + 1;
    const x0 = Math.floor(Math.min(ax, bx) - R);
    const x1 = Math.ceil(Math.max(ax, bx) + R);
    const y0 = Math.floor(Math.min(ay, by) - R);
    const y1 = Math.ceil(Math.max(ay, by) + R);
    const dx = bx - ax;
    const dy = by - ay;
    const l2 = dx * dx + dy * dy || 1e-6;
    for (let y = Math.max(0, y0); y <= Math.min(H - 1, y1); y++) {
      for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        const u = clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1);
        const cx = ax + dx * u;
        const cy = ay + dy * u;
        const d = Math.hypot(px - cx, py - cy);
        const rr = lerp(r[i], r[i + 1], u);
        const k = d / rr;
        const q = y * W + x;
        if (k <= 1 && k < best[q]) {
          best[q] = k;
          along[q] = (i + u) / (pts.length - 1);
          const l = Math.sqrt(l2);
          // (which side of its line: its right as it goes, the inside of a curl that bends right)
          side[q] = ((px - ax) * dy - (py - ay) * dx) / l >= 0 ? 1 : -1;
          nx[q] = d > 1e-6 ? (px - cx) / d : 0;
          ny[q] = d > 1e-6 ? (py - cy) / d : 0;
        }
      }
    }
  }
  // its flesh: lit from the upper left, round as a limb
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const q = y * W + x;
      const k = best[q];
      if (k > 1) continue;
      const nz = Math.sqrt(Math.max(0, 1 - k * k));
      const lit = nz * 0.55 + (nx[q] * -0.55 + ny[q] * -0.75) * k * 0.75 + 0.1;
      const tone = clamp(Math.round(lit * 4.2), 0, 4);
      // (its inside, where the suckers are, pale: its right as it goes)
      out.set(x, y, side[q] > 0 && k > 0.4 ? ARM_INSIDE[clamp(tone, 1, 4)] : ARM_FLESH[tone]);
      // (wet: a glint on its lit side, now and then along it)
      if (k > 0.35 && k < 0.62 && nx[q] * -0.55 + ny[q] * -0.75 > 0.6 && Math.floor(along[q] * 26) % 3 === 0) out.set(x, y, '#c6d09a');
    }
  }
  // its suckers down its inside (its right as it goes): rings, a dark pit in each, bigger toward its root
  let since = 0;
  for (let i = 1; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const dx = bx - ax;
    const dy = by - ay;
    const l = Math.hypot(dx, dy) || 1;
    since += l;
    const rr = r[i];
    const gap = Math.max(3, rr * 0.9);
    if (since < gap || rr < 1.8) continue;
    since = 0;
    const sx = -dy / l;
    const sy = dx / l;
    const cx = ax + sx * rr * 0.6;
    const cy = ay + sy * rr * 0.6;
    const X = Math.round(cx - 0.5);
    const Y = Math.round(cy - 0.5);
    const inside = (xx: number, yy: number): boolean => xx >= 0 && yy >= 0 && xx < W && yy < H && best[yy * W + xx] <= 0.9;
    if (!inside(X, Y)) continue;
    if (rr > 5.5) {
      for (const [ox, oy, c] of [[-1, 0, 2], [1, 0, 1], [0, -1, 3], [0, 1, 1], [0, 0, 0]] as [number, number, number][]) if (inside(X + ox, Y + oy)) out.set(X + ox, Y + oy, c === 0 ? ARM_SUCKER[0] : ARM_SUCKER[c]);
    } else if (rr > 3.2) {
      out.set(X, Y, ARM_SUCKER[2]);
      if (inside(X + 1, Y)) out.set(X + 1, Y, ARM_SUCKER[0]);
    } else out.set(X, Y, ARM_SUCKER[3]);
  }
  out.outline(INK);
  // black water running off it, as it rises and as it is pulled back
  if (f >= 5 && f < ARM.frames - 2) {
    for (let i = 4; i < pts.length - 2; i += 7) {
      const [x, y] = pts[i];
      const drop = ((f * 3 + i * 5) % 9) / 9;
      const X = Math.round(x + (i % 2 ? 2 : -2));
      const Y = Math.round(y + r[i] + 1 + drop * 6);
      if (Y < H - 1 && X > 0 && X < W - 1 && !out.has(X, Y)) {
        out.set(X, Y, ARM_WATER[4]);
        out.set(X, Y + 1, ARM_WATER[3]);
      }
    }
  }
  return out;
}

/**
 * THE BLACK WATER on the floor where it comes up, at a frame (0 to ARM.frames - 1): welling up and churning as it is warned,
 * thrown out in a ring as it slams, closing as it is pulled under. An ellipse as the floor lies (twice as wide as deep), its
 * middle at (ax, ay); `ry` its depth.
 */
export function paintArmPool(f: number): { px: Px; ax: number; ay: number } {
  const rx0 = Math.round(ARM.pool * 32);
  const W = rx0 * 2 + 12;
  const H = rx0 + 12;
  const ax = W >> 1;
  const ay = H >> 1;
  const out = new Px(W, H);
  const S = ARM.slam;
  // how far it has spread: welling up, then all of it, then closing
  const k = f < 6 ? ease((f + 1) / 6) : f < S + 8 ? 1 : 1 - ease((f - S - 8) / (ARM.frames - S - 8));
  if (k <= 0.02) return { px: out, ax, ay };
  const rx = rx0 * (0.35 + 0.65 * k);
  const ry = rx / 2;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = (x + 0.5 - ax) / rx;
      const v = (y + 0.5 - ay) / ry;
      const d = Math.hypot(u, v);
      // (its edge ragged, as water is)
      const rag = 0.06 * Math.sin(Math.atan2(v, u) * 7 + f * 0.7);
      if (d > 1 + rag) continue;
      // deepest in the middle; rings running out from where it comes up
      let tone = d < 0.45 ? 0 : d < 0.8 ? 1 : 2;
      const ring = (d * 5 - f * 0.55) % 1;
      if (ring > 0.82 && d > 0.3 && d < 0.95) tone = Math.min(4, tone + 1);
      if (d > 0.93 + rag) tone = 3;
      out.set(x, y, ARM_WATER[tone]);
    }
  }
  // bubbles breaking as it churns, before it comes up
  if (f < S) {
    for (let i = 0; i < 5; i++) {
      const a = i * 2.4 + f * 0.9;
      const rr = (0.2 + ((i * 37 + f * 13) % 10) / 14) * rx * 0.8;
      const X = Math.round(ax + Math.cos(a) * rr);
      const Y = Math.round(ay + Math.sin(a) * rr * 0.5);
      if (out.has(X, Y) && (f + i) % 3 !== 0) {
        out.set(X, Y, ARM_WATER[4]);
        if ((f + i) % 2) out.set(X + 1, Y, ARM_WATER[3]);
      }
    }
  }
  return { px: out, ax, ay };
}

// =============================================================================================
// THE QUEEN'S TALONS: ONE OF HER BIRDS

/** Her feathers (the bag picture's `raven`), its ruff (the bag picture's pale `feather`), its shank and its talons (`shank`, `horn`), its beak. */
export const BIRD_RAVEN: Ramp = ['#0a0718', '#17102e', '#2a1c4c', '#44306e', '#7a62a8'];
export const BIRD_RUFF: Ramp = ['#3a3446', '#6a6278', '#a49cb0', '#dcd6e4', '#ffffff'];
export const BIRD_SHANK: Ramp = ['#3a2a0a', '#6c5416', '#a8882c', '#d8bc58', '#fff0b4'];
export const BIRD_HORN: Ramp = ['#07060c', '#18141e', '#322a34', '#56484e', '#92848a'];
export const BIRD_BEAK = ['#5a4a34', '#9c8a62', '#d6c896'] as const;

/**
 * HER BIRD'S POSES, by what it is doing. `dive`: dropping on its prey, wings half swept back, talons drawn up; `strike`: talons
 * thrown forward, wings flung up and wide to brake; `flap0` to `flap3`: beating away, wings down through up.
 */
export type BirdPose = 'dive' | 'strike' | 'flap0' | 'flap1' | 'flap2' | 'flap3';
export const BIRD_POSES: readonly BirdPose[] = ['dive', 'strike', 'flap0', 'flap1', 'flap2', 'flap3'];
/** Its canvas: `w` by `h`, its middle (where its body is) at (`ax`, `ay`). */
export const BIRD = { w: 72, h: 60, ax: 36, ay: 30 };

type V = readonly [number, number];
/** Fill a shape (points, its outline) with a ramp, lit from the upper left by how far each pixel is toward that side of the shape, and a little darker at its bottom. */
function shaded(p: Px, pts: readonly V[], ramp: Ramp, bias = 0, flat = false): void {
  const tmp = new Px(p.w, p.h);
  tmp.poly(pts as [number, number][], '#ffffff');
  const b = tmp.bounds();
  if (!b) return;
  for (let y = b.y; y < b.y + b.h; y++) {
    for (let x = b.x; x < b.x + b.w; x++) {
      if (!tmp.has(x, y)) continue;
      const u = (x - b.x) / Math.max(1, b.w - 1);
      const v = (y - b.y) / Math.max(1, b.h - 1);
      const lit = flat ? 0.5 + bias : 1.05 - 0.55 * u - 0.75 * v + bias;
      p.set(x, y, ramp[clamp(Math.round(lit * 3.2), 0, 4)]);
    }
  }
}

/** A wing, from its shoulder: `span` how far out, `lift` how far up its tip (picture pixels; less than 0 down), `sweep` how far back; its ragged fingers at the tip. */
function wing(p: Px, sx: number, sy: number, dir: 1 | -1, span: number, lift: number, sweep: number, near: boolean): void {
  const tipX = sx + dir * span;
  const tipY = sy - lift;
  const back = sweep;
  // (its leading edge from the shoulder to the tip; its trailing edge back along the fingers and the secondaries)
  const lead: V[] = [
    [sx, sy - 2],
    [sx + dir * span * 0.35, sy - lift * 0.45 - 4],
    [sx + dir * span * 0.7, sy - lift * 0.8 - 3],
    [tipX, tipY],
  ];
  const fingers: V[] = [];
  for (let i = 0; i < 5; i++) {
    const k = i / 4;
    const fx = tipX - dir * (k * span * 0.38 + back * 0.5 * k);
    const fy = tipY + 3 + k * (lift * 0.3 + 4) + back * 0.25;
    fingers.push([fx, fy]);
    fingers.push([fx - dir * 1.5, fy - 2]);
  }
  const trail: V[] = [
    [sx + dir * span * 0.45 - dir * back * 0.6, sy - lift * 0.45 + 7 + back * 0.3],
    [sx - dir * 2, sy + 5],
  ];
  shaded(p, [...lead, ...fingers, ...trail], BIRD_RAVEN, near ? 0.15 : -0.25);
  // (a row of its coverts, a shade lighter, along the leading edge)
  p.line(Math.round(sx + dir * 2), Math.round(sy - 1), Math.round(sx + dir * span * 0.62), Math.round(sy - lift * 0.7 - 1), near ? BIRD_RAVEN[4] : BIRD_RAVEN[3]);
}

/**
 * ONE OF HER BIRDS in a pose, facing the picture's right (the game flips it to face left). Its body a tilted egg of her
 * feathers, the pale ruff round its neck, a bare head and hooked beak, a fanned tail, the yellow shank and four black talons,
 * and its two wings, the far one behind it, a shade darker.
 */
export function paintBird(pose: BirdPose): Px {
  const p = new Px(BIRD.w, BIRD.h);
  const cx = BIRD.ax;
  const cy = BIRD.ay;
  // how the wings are, and the legs, by pose
  const W: Record<BirdPose, { span: number; lift: number; sweep: number; tilt: number; legs: 'up' | 'fore' | 'hang' }> = {
    dive: { span: 22, lift: 9, sweep: 12, tilt: 0.45, legs: 'up' },
    strike: { span: 28, lift: 20, sweep: 2, tilt: -0.25, legs: 'fore' },
    flap0: { span: 30, lift: 12, sweep: 0, tilt: -0.1, legs: 'hang' },
    flap1: { span: 30, lift: -2, sweep: 2, tilt: -0.1, legs: 'hang' },
    flap2: { span: 26, lift: -14, sweep: 4, tilt: -0.1, legs: 'hang' },
    flap3: { span: 28, lift: 22, sweep: 0, tilt: -0.1, legs: 'hang' },
  };
  const w = W[pose];
  const t = w.tilt;
  const at = (fx: number, fy: number): [number, number] => [cx + fx * Math.cos(t) - fy * Math.sin(t), cy + fx * Math.sin(t) + fy * Math.cos(t)];
  // THE FAR WING, behind it
  wing(p, cx + 2, cy - 2, -1, w.span * 0.7, w.lift * 0.8, w.sweep, false);
  // ITS TAIL, fanned behind (to the left)
  shaded(p, [at(-6, -2), at(-16, -5), at(-19, 0), at(-16, 4), at(-6, 3)], BIRD_RAVEN, -0.1);
  // ITS LEGS: the yellow shank, the talons black
  const hip = at(2, 4);
  const legTo = w.legs === 'fore' ? at(14, 10) : w.legs === 'up' ? at(-3, 8) : at(3, 12);
  for (const o of [-1, 1]) {
    p.line(Math.round(hip[0] + o), Math.round(hip[1]), Math.round(legTo[0] + o), Math.round(legTo[1]), BIRD_SHANK[o > 0 ? 3 : 2]);
    p.line(Math.round(hip[0] + o), Math.round(hip[1] + 1), Math.round(legTo[0] + o), Math.round(legTo[1] + 1), BIRD_SHANK[1]);
    // talons: three hooks forward, one back
    const [fx, fy] = legTo;
    const open = w.legs === 'fore' ? 1 : 0.5;
    for (const [dx, dy] of [[3, 1], [3, -1 - open * 2], [2, 3], [-2, 1]] as V[]) {
      const tx = Math.round(fx + o + dx * (0.8 + open * 0.5));
      const ty = Math.round(fy + dy);
      p.line(Math.round(fx + o), Math.round(fy), tx, ty, BIRD_HORN[1]);
      p.set(tx, ty + 1, BIRD_HORN[3]);
    }
  }
  // ITS BODY: an egg of her feathers
  const body: V[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const rx = Math.cos(a) > 0 ? 9 : 10;
    body.push(at(Math.cos(a) * rx, Math.sin(a) * 5.5));
  }
  shaded(p, body, BIRD_RAVEN, 0.12);
  // (its breast feathers, in rows)
  for (let i = 0; i < 3; i++) {
    const [x0, y0] = at(-2 + i * 3, 1 + (i % 2));
    p.set(Math.round(x0), Math.round(y0), BIRD_RAVEN[3]);
  }
  // THE PALE RUFF round its neck, THE BARE HEAD and THE HOOKED BEAK
  const neck = at(9, -3);
  const ruff: V[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const rr = i % 2 ? 4.5 : 3.4;
    ruff.push([neck[0] + Math.cos(a) * rr, neck[1] + Math.sin(a) * rr * 0.8]);
  }
  shaded(p, ruff, BIRD_RUFF, 0.1);
  const head = at(13, -5);
  p.ellipse(Math.round(head[0]), Math.round(head[1]), 3, 2, BIRD_RAVEN[2]);
  p.set(Math.round(head[0]) - 1, Math.round(head[1]) - 1, BIRD_RAVEN[4]);
  // (its eye: a dark bead with a pale glint; never a glow)
  p.set(Math.round(head[0]) + 1, Math.round(head[1]) - 1, '#0e0c24');
  const beak: V[] = [at(15, -6), at(19, -5), at(20, -3), at(18, -3.5), at(15, -4)];
  shaded(p, beak, [BIRD_BEAK[0], BIRD_BEAK[0], BIRD_BEAK[1], BIRD_BEAK[2], BIRD_BEAK[2]], 0.2);
  // THE NEAR WING, over it
  wing(p, cx - 1, cy - 1, 1, w.span, w.lift, w.sweep, true);
  p.outline(INK);
  return p;
}

/** Where her bird is at a moment of its dive (`k` 0..1 of the rules' `secs`, then 1..2 flying off): along the floor (0 at him, 1 at the enemy) and how high over the floor (game pixels), and its pose. */
export function birdAt(k: number): { along: number; high: number; pose: BirdPose; alpha: number } {
  if (k < 0.82) {
    // (dropping out of the air over him onto it, faster as it comes)
    const u = k / 0.82;
    return { along: u * u * 0.9, high: 46 - 34 * u, pose: 'dive', alpha: Math.min(1, k * 6) };
  }
  if (k < 1.12) return { along: 0.95 + (k - 0.82) * 0.15, high: 12 - (k - 0.82) * 10, pose: 'strike', alpha: 1 };
  // (flapping away up and on, fading)
  const u = (k - 1.12) / 0.88;
  const flaps: BirdPose[] = ['flap0', 'flap1', 'flap2', 'flap3'];
  return { along: 1 + u * 0.9, high: 10 + u * 40, pose: flaps[Math.floor(u * 9) % 4], alpha: Math.max(0, 1 - u * 1.2) };
}
