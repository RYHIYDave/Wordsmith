// THE HOUSE OF QUIET'S MOMENT AROUND THE HERO (the art chat for floors 11 to 15, 19 Oct 2026; a mock-up, nothing of the
// game imports it).
//
// His rulebook's Places 8, his words of 10 Oct: “I’d also like a couple environmental things happening around you for
// immersion unique for each floor.  Something shifts above you and dust comes down, you spook a pack of birds and they
// fly off,  a root shrivels as you walk by.  That sort of stuff”. Made on his word to this chat of 18 Oct, 21:24
// Pacific: “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least
// for 11-15”: the pick this chat would have marked recommended, sent him as a film. Not birds (floor 11's pigeons), not
// water (floor 12's surge), not paper on the wind (floor 13's whirl): the wards' own. Checked against his Animations 1
// before he sees it: “as big and wild and kinetic and weighty as possible.  I’d rather it be a notch too high than a
// notch too low.”
//
//   THE SCREEN FALLS: one of the wards' linen screens stands near you, three panels on iron frames in a zigzag, its
//     linen stirring (`before`). A draught finds it: the linen bellies out, the screen rocks on its feet, rocks harder,
//     nearly goes, settles back; then it tips past its balance and comes down toward you, gathering speed, and CRASHES
//     FLAT on the boards (a jolt): its panels splay out flat, it bounces and settles, and a cloud of dust rolls out from
//     under it and drifts away. It lies there after (`after`). In the House of Quiet it makes no sound at all.
//
// Laid in a ward (art/housequiet.ts), on open floor: its anchor is the middle of the screen's foot, its length along x;
// it falls toward +y (toward the hero, down the screen to the left), its top coming down about 1.6 tiles out, so leave
// that clear. Built as floor 13's whirl is (art/floor2.ts onPic, picture pixels, KT to a tile).

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { Moment, Track } from './floorkit';
import { onPic } from './floor2';
import { GRAIN, hash } from './kit';

const sm = (v: number): number => {
  const c = Math.max(0, Math.min(1, v));
  return c * c * (3 - 2 * c);
};

/** The screen's linen and its iron, the wards' own (art/floor14.ts: LINEN, BEDIRON); the dust of the boards. */
const LINEN = ['#5c5a52', '#827f76', '#a4a296', '#c0beb0', '#d6d4c6'] as const;
const IRON = ['#3a3c38', '#5e6159', '#85887c', '#a8ab9e'] as const;
const DUST = ['#6a6656', '#8a8572', '#aaa48e', '#c4beaa'] as const;
/** The stain on its middle panel (as the piece has it). */
const STAIN = '#857c5c';

/** The screen as it stands (as art/floor14.ts `wardScreen`): its four uprights' feet, how tall, its rails. */
const FEET: ReadonlyArray<readonly [number, number]> = [[-36, -6], [-12, 6], [12, -6], [36, 6]];
const TALL = 58;
const RAIL = 6;
/** The line along its front feet it tips over on. */
const HINGE = 7;

/** When things happen (frames at 30 a second): the draught rocks it to `rock`; it nearly goes, `near`; it tips past its balance at `tip`; it strikes the floor at `slam`; it has stopped bouncing by `still`. */
const T = { rock: 24, near: 34, tip: 40, slam: 56, still: 70 } as const;
/** How far it is tipped over toward the hero (degrees) at a frame. */
function tipAt(f: number): number {
  if (f < T.rock) return 4 * Math.abs(Math.sin(f * 0.27)) * sm(f / 8);
  const a0 = 4 * Math.abs(Math.sin(T.rock * 0.27));
  if (f < T.near) return a0 + (11 - a0) * Math.sin((Math.PI * (f - T.rock)) / (T.near - T.rock));
  if (f < T.tip) {
    // (it rocks back a little, and over it goes)
    const k = (f - T.near) / (T.tip - T.near);
    return a0 - 3 * Math.sin(Math.PI * k) + (18 - a0) * k * k;
  }
  if (f < T.slam) {
    const k = (f - T.tip) / (T.slam - T.tip);
    return 18 + 72 * k * k;
  }
  // (the bounce: up off the floor at its top end and down again, and a smaller one)
  const b = f - T.slam;
  if (b < 8) return 90 - 7 * Math.sin((Math.PI * b) / 8);
  if (b < 13) return 90 - 2 * Math.sin((Math.PI * (b - 8)) / 5);
  return 90;
}
/** How far its panels have splayed out flat (0 a zigzag, 1 flat), a frame. */
const splayAt = (f: number): number => sm((f - T.slam + 1) / 5);
/** How far the linen bellies out in the draught (0 none, 1 most), a frame. */
const bellyAt = (f: number): number => (f < 0 ? 0.15 : f < T.slam ? 0.25 + 0.75 * sm(f / 10) * (1 - 0.6 * sm((f - T.tip) / 10)) : 0.1 * Math.max(0, 1 - (f - T.slam) / 10));

/** A point of the standing screen (x along it, y across, z up) where it is at a frame: tipped about its front feet toward the hero, its zigzag splayed flat as it lands. */
function placed(x: number, y: number, z: number, f: number): [number, number, number] {
  const th = (tipAt(f) * Math.PI) / 180;
  const yy = y * (1 - splayAt(f));
  const dy = yy - HINGE;
  return [x, HINGE + dy * Math.cos(th) + z * Math.sin(th), Math.max(0.6, -dy * Math.sin(th) + z * Math.cos(th))];
}

/** A puff of the dust thrown out from under it as it lands: where along it, which way out, how fast, when. */
interface Puff {
  along: number;
  out: number;
  speed: number;
  born: number;
  seed: number;
}
const PUFFS: Puff[] = Array.from({ length: 110 }, (_, i) => ({ along: -42 + 84 * hash(i, 1, 7801), out: hash(i, 2, 7801) < 0.45 ? -1 : 1, speed: 1.8 + 2.8 * hash(i, 3, 7801), born: T.slam + Math.floor(5 * hash(i, 4, 7801)), seed: i }));

function theScreen(): Moment {
  const LAST = 140;
  const LEFT = -220;
  const RIGHT = 220;
  const W = RIGHT - LEFT + 20;
  const H = 300;
  const ax = -LEFT + 10;
  const ay = 190;
  const tracks: Track[] = [
    { name: 'the screen', at: [] },
    { name: 'the dust', at: [] },
  ];
  const paint = (f: number, before: number | null, record: boolean): Px => {
    const q = new Px(W, H);
    const zbuf = new Float32Array(W * H).fill(-Infinity);
    const put = (sx: number, sy: number, c: string, depth = 1e9): void => {
      const X = Math.round(ax + sx);
      const Y = Math.round(ay + sy);
      if (X < 0 || Y < 0 || X >= W || Y >= H) return;
      const i = Y * W + X;
      if (depth < zbuf[i]) return;
      zbuf[i] = depth;
      q.set(X, Y, c);
    };
    const g = before === null ? f : 0;
    const stir = before === null ? 0 : before;
    // THE DUST, rolling out from under it as it lands, rising a little and drifting, thinning away (behind it and in
    // front: drawn first, the screen over it where it lies)
    let dustShown = 0;
    if (before === null && f >= T.slam) {
      let n = 0;
      for (const p of PUFFS) {
        const t = f - p.born;
        if (t < 0 || t > 34) continue;
        const life = t / 34;
        if (hash(p.seed, Math.floor(f / 2), 7802) < life * life) continue;
        n++;
        const flatY = HINGE + (TALL / 2) * (0.5 + 0.5 * p.out);
        const y = flatY + p.out * (8 + p.speed * t * (1 - 0.4 * life));
        const x = p.along + (p.along > 0 ? 1 : -1) * 0.5 * t * hash(p.seed, 5, 7801);
        const z = 1 + 16 * Math.sqrt(life) * hash(p.seed, 6, 7801);
        const [sx, sy] = onPic(x, y, z);
        const c = DUST[life < 0.3 ? 3 : life < 0.6 ? 2 : 1];
        const size = life < 0.35 ? 4 : life < 0.7 ? 3 : 2;
        for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) put(sx + dx, sy + dy, c, (y > HINGE ? 1 : -1) * 1e6);
      }
      dustShown = Math.min(1, n / 80);
    }
    // THE SCREEN: each panel's linen, its frame, its little feet; nearest the eye wins
    for (let i = 0; i < 3; i++) {
      const [x0, y0] = FEET[i];
      const [x1, y1] = FEET[i + 1];
      const P = (u: number, v: number): [number, number, number] => {
        // (u along the panel, v up it; the linen inside its frame)
        const x = x0 + (x1 - x0) * u;
        const y = y0 + (y1 - y0) * u;
        const z = RAIL + 1 + (TALL - 2 - RAIL - 1) * v;
        // the linen bellying out of its frame in the draught, more in its middle
        const b = bellyAt(g) * Math.sin(Math.PI * u) * Math.sin(Math.PI * v) * (2.6 + 0.6 * Math.sin(g * 0.5 + i)) + (before === null ? 0 : 0.5 * Math.sin(stir * 1.6 + i + u * 3) * Math.sin(Math.PI * u));
        const nx = -(y1 - y0);
        const ny = x1 - x0;
        const nl = Math.hypot(nx, ny);
        const side = ny / nl > 0 ? 1 : -1;
        return placed(x + (side * b * nx) / nl, y + (side * b * ny) / nl, z, g);
      };
      // the linen, as a mesh of little quads, each its own depth and light
      const NU = 14;
      const NV = 18;
      for (let a = 0; a < NU; a++) {
        for (let b = 0; b < NV; b++) {
          const c00 = P(a / NU, b / NV);
          const c10 = P((a + 1) / NU, b / NV);
          const c11 = P((a + 1) / NU, (b + 1) / NV);
          const c01 = P(a / NU, (b + 1) / NV);
          // its face's turn toward the eye (TOWARD 0.61, 0.61, 0.5)
          const e1 = [c10[0] - c00[0], c10[1] - c00[1], c10[2] - c00[2]];
          const e2 = [c01[0] - c00[0], c01[1] - c00[1], c01[2] - c00[2]];
          const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
          const nl = Math.hypot(n[0], n[1], n[2]) || 1;
          const face = Math.abs(n[0] * 0.61 + n[1] * 0.61 + n[2] * 0.5) / nl;
          const lit = (n[0] * -0.45 + n[1] * -0.2 + n[2] * 0.87) / nl;
          const pleat = (a % 3) === 0 ? -1 : (a % 3) === 2 ? 1 : 0;
          // (the middle panel turned the other way to the light: darker, so the zigzag reads)
          const tone = Math.max(0, Math.min(4, Math.round(2.4 + 1.4 * Math.abs(lit) * (lit > 0 ? 1 : -0.6) + 0.5 * pleat - (face < 0.15 ? 1 : 0) - (i === 1 ? 1 : 0))));
          let c: string = LINEN[tone];
          if (i === 1 && Math.hypot((a / NU - 0.6) * 2, b / NV - 0.55) < 0.14) c = STAIN;
          const pts = [c00, c10, c11, c01].map((p) => onPic(p[0], p[1], p[2]));
          const depth = (c00[0] + c00[1] + c11[0] + c11[1]) / 2 + (c00[2] + c11[2]) * 0.41;
          const xs = pts.map((p) => p[0]);
          const ys = pts.map((p) => p[1]);
          for (let Y = Math.floor(Math.min(...ys)); Y <= Math.ceil(Math.max(...ys)); Y++) {
            for (let X = Math.floor(Math.min(...xs)); X <= Math.ceil(Math.max(...xs)); X++) {
              let inside = false;
              for (let k = 0, j = 3; k < 4; j = k++) {
                const [xi, yi] = pts[k];
                const [xj, yj] = pts[j];
                if (yi > Y + 0.5 !== yj > Y + 0.5 && X + 0.5 < ((xj - xi) * (Y + 0.5 - yi)) / (yj - yi) + xi) inside = !inside;
              }
              if (inside) put(X, Y, c, depth);
            }
          }
        }
      }
      // its frame: the uprights, the top and bottom rails, the little feet; iron painted white long ago
      const line = (a: [number, number, number], b: [number, number, number], c: string, thick: number): void => {
        const pa = onPic(a[0], a[1], a[2]);
        const pb = onPic(b[0], b[1], b[2]);
        const n = Math.ceil(Math.hypot(pb[0] - pa[0], pb[1] - pa[1])) + 1;
        for (let k = 0; k <= n; k++) {
          const u = k / n;
          const depth = (a[0] + a[1] + (b[0] + b[1] - a[0] - a[1]) * u) + (a[2] + (b[2] - a[2]) * u) * 0.82 + 1.5;
          for (let t = 0; t < thick; t++) put(pa[0] + (pb[0] - pa[0]) * u, pa[1] + (pb[1] - pa[1]) * u + t, t === 0 ? c : IRON[0], depth);
        }
      };
      for (const [x, y] of [[x0, y0], [x1, y1]] as const) {
        line(placed(x, y, 0, g), placed(x, y, TALL, g), IRON[1], 2);
        line(placed(x - 2, y, 0.6, g), placed(x + 2, y, 0.6, g), IRON[1], 1);
      }
      line(placed(x0, y0, TALL, g), placed(x1, y1, TALL, g), IRON[2], 2);
      line(placed(x0, y0, RAIL, g), placed(x1, y1, RAIL, g), IRON[1], 1);
    }
    if (record) {
      const [tx, ty] = onPic(...placed(0, 0, TALL, g));
      tracks[0].at.push({ x: tx, y: ty, shown: 1, size: 44 });
      tracks[1].at.push(dustShown > 0 ? { x: 0, y: onPic(0, HINGE + TALL / 2, 0)[1], shown: dustShown, size: 60 } : null);
    }
    return q;
  };
  const cut = (q: Px): Sprite => {
    const lone: [number, number][] = [];
    for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
      if (!q.has(x, y)) continue;
      let n = 0;
      for (let dy = -1; dy <= 1 && !n; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && q.has(x + dx, y + dy)) n++;
      if (!n) lone.push([x, y]);
    }
    for (const [x, y] of lone) q.d[(y * q.w + x) * 4 + 3] = 0;
    const bb = q.bounds(GRAIN)!;
    const c = new Px(bb.w, bb.h);
    for (let y = 0; y < bb.h; y++) for (let x = 0; x < bb.w; x++) {
      const v = q.get(bb.x + x, bb.y + y);
      if (v) c.set(x, y, v);
    }
    return c.sprite(ax - bb.x, ay - bb.y, GRAIN);
  };
  // it is over once it lies still and the last of the dust is gone
  const frames: Sprite[] = [];
  let last = -1;
  const sum = (q: Px): number => {
    let h = 0;
    for (let i = 0; i < q.d.length; i++) h = (Math.imul(h, 31) + q.d[i]) | 0;
    return h;
  };
  for (let f = 0; f < LAST; f++) {
    const q = paint(f, null, true);
    if (f > T.still) {
      const s = sum(q);
      if (s === last) {
        for (const t of tracks) t.at.pop();
        break;
      }
      last = s;
    }
    frames.push(cut(q));
  }
  const NF = frames.length;
  if (NF === LAST) throw new Error('the screen is still going at the end');
  for (const t of tracks) t.at = t.at.slice(0, NF);
  const before = [0, 1, 2, 3].map((k) => cut(paint(0, k, false)));
  // (its first frame is what was there: the screen standing as before's first)
  frames[0] = before[0];
  return { name: 'the screen falls', frames, fps: 30, before, after: [frames[NF - 1]], tracks, jolts: [T.slam], holds: [] };
}

let moments: Moment[] | null = null;
/** The House of Quiet's moment around the hero: the screen falls. */
export function houseOfQuietMoments(): Moment[] {
  return (moments ??= [theScreen()]);
}
