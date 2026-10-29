// FLOOR 17'S BOSS, THE PRINCE: WHAT HIS MOVES LEAVE ON THE FLOOR (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME,
// behind PRINCE_ON (art/prince.ts, off). His moves are art/prince_moves.ts; each of these begins as his blow lands (its
// `hit`), where the game puts it. Every one of them big, on the scale of a boss arena (about 17 by 20 tiles): his words,
// 28 Oct, “It’s all too slow and too narrow and too small” and “And bigger AOE to compensate for the extra time the player
// gets to evade”.
//
//   THE DANCE: a ring of masked partners rises round you out of the floor, grey fog figures each in a smiling gilt mask, 9
//     tiles across; they waltz round you, turning as they go, closing in (the warning: the ring tightening, their masks
//     turned on you, glinting); at 5 tiles across they hold a beat, arms lifted; then THE RING SNAPS SHUT in two frames,
//     smeared, every one of them flung in at you; and they burst into fog and are gone.
//   MASKS: a fan of smiling gilt masks, each flung spinning across the room the length of the arena, smeared behind; at the
//     end of its flight each bursts into gilt shards and a puff of fog.
//   MIDNIGHT: each chime of the great clock (the clock itself is a piece of the floor) a ring rolling out across the floor
//     from the clock's place as wide as the arena, a dark crimson wave with a gilt crest, the floor's dust thrown up behind
//     it; with a gap in it (`gap`, the game's to place) to slip through. Twelve of them, faster each phase.

import { HUSH } from './crier';
import { BREATH_PALE } from './hushed';
import type { Painted } from './kit';
import { hash } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { paintBits, sphere, TILE3 } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { GILT, SMEAR, maskFace } from './prince';
import { stage } from './skin';
import type { GameView, Ring } from './skin';
import { add, cross, mul, norm } from './skeleton';
import type { V3 } from './skeleton';

const TAU = Math.PI * 2;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const lay = (px: Painted['px'], x: number, y: number, c: string, size = 1): void => {
  const xi = Math.round(x - size / 2);
  const yi = Math.round(y - size / 2);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, c);
};
/** The Hush's grey fog, the dancers' stuff. */
const FOGGY = HUSH;

// =============================================================================================
// THE DANCE: the ring of masked partners

export const DANCE_CANVAS = { w: 520, h: 380, ax: 260, ay: 230 } as const;
/**
 * Its times (seconds from his blow landing): rising out of the floor; circling and closing in (the warning); held a beat,
 * their arms lifted; THE SNAP (two frames: `snap`, landing on its second, `hit`); bursting into fog, gone. How many, and
 * how far out they rise and how far they have closed when they snap (the figure's own lengths: 9 tiles across, then 5).
 */
export const DANCE_FX = { long: 2.35, rise: [0, 0.4] as const, close: [0.4, 1.45] as const, hold: [1.45, 1.6667] as const, snap: [1.6667, 1.7333] as const, hit: 1.7333, burst: [1.75, 2.35] as const, n: 8, r0: 4.5 * TILE3, r1: 2.5 * TILE3, rIn: 0.7 * TILE3, turns: 0.55 } as const;
/** Where the ring is: how far out (the figure's own lengths) and how far round it has turned (radians), `t` seconds from his blow. */
export function danceRing(t: number): { r: number; turn: number; up: number; snapK: number } {
  const F = DANCE_FX;
  const up = smooth(F.rise[0], F.rise[1], t);
  const close = smooth(F.close[0], F.close[1], t);
  const [s0, s1] = F.snap;
  const snapK = t <= s0 ? 0 : t >= s1 ? 1 : (t - s0) / (s1 - s0);
  const r = snapK > 0 ? F.r1 + (F.rIn - F.r1) * snapK : F.r0 + (F.r1 - F.r0) * close;
  // (they go round you as they close: fastest in the middle of it, still as they hold)
  const turn = F.turns * TAU * smooth(F.rise[0], F.hold[0], t);
  return { r, turn, up, snapK };
}
/** One partner: a grey fog figure, a lady in a ball gown or a gentleman in a coat by turns, its masked head turned on you, waltzing with nobody; `k` 0..1 how far risen out of the floor, `arms` 0 in a waltz's hold to 1 lifted to snatch at you, `spin` its own turn (radians), `fade` 0 whole to 1 gone. */
function partner(put: Put, i: number, at: V3, toward: V3, k: number, arms: number, spin: number, fade: number, t: number): void {
  if (k <= 0.02 || fade >= 1) return;
  // (it faces round as it turns, but its head and mask stay turned on you)
  const fy = norm([toward[0], toward[1], 0], [1, 0, 0]);
  const sp = 0.6 * Math.sin(spin);
  const f: V3 = [fy[0] * Math.cos(sp) - fy[1] * Math.sin(sp), fy[0] * Math.sin(sp) + fy[1] * Math.cos(sp), 0];
  const l: V3 = [-f[1], f[0], 0];
  const lHead: V3 = [-fy[1], fy[0], 0];
  const sink = (1 - k) * 50;
  const Z = (h: number): number => h - sink;
  const lady = i % 2 === 0;
  const part = `partner${i}`;
  const thin = 1 - 0.45 * fade;
  const P = (fw: number, lf: number, h: number): V3 => add(at, add(mul(f, fw), add(mul(l, lf), [0, 0, Z(h)])));
  const above = (p: V3): boolean => p[2] > 0.8;
  if (lady) {
    // HER GOWN: a bell of fog from her waist to the floor, its hem swirling out as she turns, ragged, trailing into wisps
    const hem: V3[] = [];
    const hemR = 12.5 * thin;
    for (let j = 0; j < 22; j++) {
      const a = (j / 22) * TAU + spin * 0.5;
      const flare = 1 + 0.22 * Math.sin(a * 3 + t * 7 + i);
      hem.push(add(at, [Math.cos(a) * hemR * flare, Math.sin(a) * hemR * flare, Math.max(0.6, Z(1.2 + 2.6 * Math.max(0, Math.sin(a * 2 + t * 6))))]));
    }
    const rings: Ring[] = [
      { c: add(at, [0, 0, Math.max(0.6, Z(1.5))]), u: [hemR, 0, 0], v: [0, hemR, 0], pts: hem },
      { c: add(at, [0, 0, Math.max(0.8, Z(12))]), u: mul(f, 8.6 * thin), v: mul(l, 8.6 * thin) },
      { c: add(at, [0, 0, Math.max(1, Z(24))]), u: mul(f, 4.6 * thin), v: mul(l, 5.0 * thin) },
      { c: add(at, [0, 0, Math.max(1.2, Z(31))]), u: mul(f, 2.3 * thin), v: mul(l, 2.8 * thin) },
    ];
    put(part, 'fog', { k: 'cloth', rings, ramp: FOGGY, look: { ragged: true, folds: [25, -25, 70, -70, 120, -120, 170], lift: 0.25 } });
    // her bodice: a slim waist up to her shoulders, bare arms of fog
    const bod: Ring[] = [
      { c: P(0, 0, 30), u: mul(f, 2.3 * thin), v: mul(l, 2.8 * thin) },
      { c: P(0.3, 0, 38), u: mul(f, 3.0 * thin), v: mul(l, 3.6 * thin) },
      { c: P(0, 0, 43.5), u: mul(f, 2.6 * thin), v: mul(l, 5.2 * thin) },
    ];
    if (above(bod[2].c)) put(part, 'fog', { k: 'cloth', rings: bod, ramp: FOGGY, look: { lift: 0.05 } });
  } else {
    // HIS LEGS in a waltz's step, and a short coat of fog flared over them
    for (const sg of [1, -1]) {
      const step = Math.sin(spin * 2 + (sg > 0 ? 0 : Math.PI)) * 4;
      const hip = P(0, sg * 2.6, 30);
      const knee = P(step * 0.5 + 1, sg * 3.2, 16);
      const ankle = P(step, sg * 3.4, 2.6);
      if (above(knee)) put(part, 'fog', { k: 'rod', a: hip, b: knee, ra: 2.4 * thin, rb: 1.9 * thin, ramp: FOGGY });
      if (above(ankle)) {
        put(part, 'fog', { k: 'rod', a: knee, b: ankle, ra: 1.9 * thin, rb: 1.4 * thin, ramp: FOGGY });
        put(part, 'fog', { k: 'rod', a: ankle, b: add(ankle, add(mul(f, 4), [0, 0, -1.6])), ra: 1.3 * thin, rb: 1.0 * thin, ramp: FOGGY });
      }
    }
    const hem: V3[] = [];
    for (let j = 0; j < 18; j++) {
      const a = (j / 18) * TAU + spin * 0.5;
      hem.push(add(at, [Math.cos(a) * 7.5 * thin, Math.sin(a) * 7.5 * thin, Math.max(0.8, Z(17 + 2 * Math.sin(a * 2 + t * 6)))]));
    }
    const coat: Ring[] = [
      { c: add(at, [0, 0, Math.max(0.8, Z(17))]), u: [7, 0, 0], v: [0, 7, 0], pts: hem },
      { c: P(0, 0, 30), u: mul(f, 3.0 * thin), v: mul(l, 3.6 * thin) },
      { c: P(0.4, 0, 40), u: mul(f, 3.6 * thin), v: mul(l, 5.4 * thin) },
      { c: P(0, 0, 45), u: mul(f, 2.8 * thin), v: mul(l, 6.4 * thin) },
    ];
    if (above(coat[3].c)) put(part, 'fog', { k: 'cloth', rings: coat, ramp: FOGGY, look: { ragged: true, folds: [40, -40, 140, -140], lift: 0.1 } });
  }
  // the neck and head, the mask turned on you; the hair up in a knot (hers) or tied back (his)
  const neck = P(0, 0, lady ? 44 : 45.5);
  const head = add(at, add(mul(fy, 0.3), [0, 0, Z(lady ? 50.5 : 52)]));
  if (above(head)) {
    put(part, 'fog', { k: 'rod', a: neck, b: add(head, [0, 0, -3]), ra: 1.5 * thin, rb: 1.4 * thin, ramp: FOGGY });
    put(part, 'fog', { k: 'ball', c: head, ax: [mul(fy, 3.9 * thin), mul(lHead, 3.5 * thin), [0, 0, 4.4 * thin]], skin: FOGGY });
    put(part, 'fog', { k: 'ball', c: add(head, add(mul(fy, -3.4), [0, 0, lady ? 3.2 : 0.5])), ax: sphere((lady ? 2.6 : 1.6) * thin), skin: FOGGY });
    if (fade < 0.5) put(part, 'mask', { k: 'ball', c: add(head, mul(fy, 0.3)), ax: [mul(fy, 4.3), mul(lHead, 4.0), [0, 0, 4.8]], skin: maskFace() });
  }
  // the arms: held up in a waltz's frame round nobody, then flung up and out to snatch at you
  for (const sg of [1, -1]) {
    const sh = P(0, sg * (lady ? 4.8 : 6.0) * thin, lady ? 42.5 : 43.5);
    if (!above(sh)) continue;
    const holdHand = sg > 0 ? P(5, sg * 12, 52) : P(9, sg * 3, 38);
    const holdEl = sg > 0 ? P(1, sg * 10, 43) : P(5, sg * 8, 36);
    const snatch = P(13, sg * 6, 44);
    const snatchEl = P(6, sg * 8, 41);
    const hand = add(holdHand, mul(add(snatch, mul(holdHand, -1)), arms));
    const el = add(holdEl, mul(add(snatchEl, mul(holdEl, -1)), arms));
    put(part, 'fog', { k: 'rod', a: sh, b: el, ra: 1.5 * thin, rb: 1.2 * thin, ramp: FOGGY });
    put(part, 'fog', { k: 'rod', a: el, b: hand, ra: 1.2 * thin, rb: 0.8 * thin, ramp: FOGGY });
    // (the fingers, spread: a hand that reaches)
    put(part, 'fog', { k: 'ball', c: hand, ax: sphere(1.2 * thin), skin: FOGGY });
  }
}
/** The fog trailing off a partner as it turns: wisps off its hem and shoulders, drifting up and back, as grains. */
function partnerWisps(at: V3, i: number, t: number, k: number, fade: number): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  if (k < 0.3 || fade >= 0.9) return out;
  for (let j = 0; j < 9; j++) {
    const life = (t * 1.3 + hash(i, j, 7758)) % 1;
    const a = hash(i, j, 7759) * TAU + t * 2;
    const r = (i % 2 === 0 ? 12 : 7) + 3 * life;
    out.push([add(at, [Math.cos(a) * r, Math.sin(a) * r, 1 + life * 14 + (j % 3) * 10]), life < 0.35 ? BREATH_PALE : life < 0.7 ? FOGGY[4] : FOGGY[3], 1]);
  }
  return out;
}
/** THE RING OF PARTNERS `t` seconds after his blow lands, seen from in front or from behind; centred on the floor point where it closes (you, as he struck). */
export function dancePainted(t: number, view: GameView = 'front'): Painted {
  const can = DANCE_CANVAS;
  const st = stage(view === 'back' ? 'rear' : view, can.ax, can.ay, can);
  const F = DANCE_FX;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const ring = danceRing(t);
  const fade = smooth(F.burst[0], F.burst[1] - 0.15, t);
  const arms = smooth(F.close[1] - 0.15, F.hold[0] + 0.1, t);
  const pos: V3[] = [];
  for (let i = 0; i < F.n; i++) {
    const a = ring.turn + (i / F.n) * TAU;
    const p: V3 = [Math.cos(a) * ring.r, Math.sin(a) * ring.r, 0];
    pos.push(p);
    const rise = smooth(F.rise[0] + 0.03 * i, F.rise[1], t);
    partner(put, i, p, mul(p, -1), rise, arms, a * 3 + t * 9 + i, fade, t);
  }
  if (t < F.long) paintBits(st, bits, [0, 0, 0]);
  const px = st.whole(t < F.burst[0] + 0.25 ? ENEMY_RIM : null);
  // the fog trailing off each as it turns
  for (let i = 0; i < F.n; i++) for (const [p, c, size] of partnerWisps(pos[i], i, t, smooth(F.rise[0] + 0.03 * i, F.rise[1], t), fade)) {
    const [x, y] = st.at(p);
    lay(px, x, y, c, size);
  }
  // rising: the fog boiling up out of the floor where each will stand
  if (t < F.rise[1] + 0.1) {
    for (let i = 0; i < F.n; i++) {
      for (let j = 0; j < 14; j++) {
        const a = hash(i, j, 7751) * TAU;
        const rr = 4 + 8 * hash(i, j, 7752);
        const life = (t * 2.5 + hash(i, j, 7753)) % 1;
        const [x, y] = st.at(add(pos[i], [Math.cos(a) * rr * (1 - life * 0.5), Math.sin(a) * rr * 0.8, life * 26]));
        lay(px, x, y, life < 0.35 ? BREATH_PALE : life < 0.7 ? FOGGY[4] : FOGGY[3], life < 0.5 ? 2 : 1);
      }
    }
  }
  // closing: their masks' eye holes glinting pink, by turns (the warning)
  if (t >= F.close[0] && t <= F.hit) {
    const tick = Math.floor(t * 15);
    for (let i = 0; i < F.n; i++) {
      if ((i + tick) % 2) continue;
      const f = norm(mul(pos[i], -1), [1, 0, 0]);
      const l: V3 = [-f[1], f[0], 0];
      for (const sg of [-1, 1]) {
        const e = add(pos[i], add(mul(f, 4.4), add(mul(l, sg * 1.4), [0, 0, (i % 2 === 0 ? 50.5 : 52) + 0.8])));
        if (st.near(f) > -0.2) {
          const [x, y] = st.at(e);
          lay(px, x, y, (i + tick) % 4 ? FLAME[3] : FLAME[2]);
        }
      }
    }
  }
  // THE SNAP: each flung in at you, its way smeared behind it
  if (t > F.snap[0] && t <= F.snap[1] + 1 / 30 + 1e-6) {
    const newest = Math.min(t, F.snap[1]);
    for (let i = 0; i < F.n; i++) {
      for (let s = 0; s <= 6; s++) {
        const u = F.snap[0] + ((newest - F.snap[0]) * s) / 6;
        const rr = danceRing(u);
        const a = rr.turn + (i / F.n) * TAU;
        for (const h of [8, 20, 34, 48]) {
          const [x, y] = st.at([Math.cos(a) * rr.r, Math.sin(a) * rr.r, h]);
          lay(px, x, y, s > 4 ? SMEAR[2] : s > 2 ? SMEAR[1] : SMEAR[0], s > 4 ? 2 : 1);
        }
      }
    }
  }
  // bursting: each a puff of grey breath, and gone
  if (t >= F.burst[0] && t < F.long) {
    const k = (t - F.burst[0]) / (F.burst[1] - F.burst[0]);
    for (let i = 0; i < F.n; i++) {
      for (let j = 0; j < 22; j++) {
        if (hash(i, j, 7754) < k * k) continue;
        const a = hash(i, j, 7755) * TAU;
        const rr = 3 + 22 * k * (0.5 + hash(i, j, 7756));
        const [x, y] = st.at(add(pos[i], [Math.cos(a) * rr, Math.sin(a) * rr, 6 + 40 * hash(i, j, 7757) + 16 * k]));
        lay(px, x, y, k < 0.3 ? BREATH_PALE : j % 2 ? FOGGY[4] : FOGGY[3], k < 0.5 ? 2 : 1);
      }
    }
  }
  return { px, lights: [] };
}

// =============================================================================================
// MASKS: smiling gilt masks flung spinning across the room in a fan

/** How many, the fan's spread (degrees, either side of his front), how fast each flies (tiles a second), how far (tiles), how high (the figure's own lengths), how fast each spins (turns a second). */
export const MASKS_FX = { n: 5, spread: 36, speed: 15, reach: 12, high: 34, spin: 3.5, burst: 0.3 } as const;
/** How long a mask flies before it bursts (seconds). */
export const MASK_FLIGHT = MASKS_FX.reach / MASKS_FX.speed;
/** Mask `i` of the fan `t` seconds after it leaves his hand: where it is on the floor from where it left his hand (his own lengths, forward and to his left), how high, its spin (radians), and the way it flies. */
export function flungMask(i: number, t: number): { at: V3; spin: number; way: V3 } {
  const F = MASKS_FX;
  const deg = F.n > 1 ? -F.spread + (2 * F.spread * i) / (F.n - 1) : 0;
  const way: V3 = [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180), 0];
  const d = F.speed * TILE3 * Math.min(t, MASK_FLIGHT);
  const h = F.high - 6 * Math.min(t, MASK_FLIGHT) / MASK_FLIGHT + 2 * Math.sin(t * 9 + i);
  return { at: [way[0] * d, way[1] * d, h], spin: TAU * F.spin * t + i * 1.3, way };
}
export const MASK_CANVAS = { w: 64, h: 64, ax: 32, ay: 50 } as const;
/** ONE FLUNG MASK, spinning (`spin` radians about the upright), seen from in front or from behind: a smiling gilt mask a little bigger than a face, its back plain gilt; on its own picture, its floor point under it (it flies `h` up: drawn there). */
export function maskPainted(spin: number, view: GameView = 'front', h: number = MASKS_FX.high - 20): Painted {
  const can = MASK_CANVAS;
  const st = stage(view === 'back' ? 'rear' : view, can.ax, can.ay, can);
  const c: V3 = [0, 0, h];
  const f: V3 = [Math.cos(spin), Math.sin(spin), 0];
  // (tipped back a little, as a thing thrown flat)
  const up = norm([-0.3 * f[0], -0.3 * f[1], 1]);
  const l = norm(cross(up, f), [0, 1, 0]);
  const face = maskFace();
  const bits: Bit[] = [];
  // the face: a shell, bigger than his own; its back: plain gilt, hollow
  bits.push({ part: 'mask', piece: 'mask', shape: { k: 'ball', c, ax: [mul(f, 3.4), mul(l, 7.6), mul(up, 9.4)], skin: (u, tone, x, y) => (u[0] >= 0.2 ? face(u, tone, x, y) : u[0] > -0.95 && (u[1] / 0.9) ** 2 + (u[2] / 0.98) ** 2 <= 1 ? GILT[Math.max(0, tone - 1)] : null) } });
  // a ribbon off its side, streaming
  const rib = add(c, mul(l, 7));
  bits.push({ part: 'mask', piece: 'ribbon', shape: { k: 'rod', a: rib, b: add(rib, add(mul(l, 3), mul(f, -4))), ra: 0.6, rb: 0.4, ramp: GILT } });
  const lights = paintBits(st, bits, c);
  return { px: st.whole(ENEMY_RIM), lights };
}
/** A flung mask's smear: where it has just been (the way it flies, its own lengths), oldest first, as grains (where, colour, size), drawn behind it. */
export function maskSmear(i: number, t: number): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  if (t <= 0 || t >= MASK_FLIGHT) return out;
  const now = flungMask(i, t);
  for (let s = 1; s <= 14; s++) {
    const back = MASKS_FX.speed * TILE3 * (1 / 30) * (s / 3.2);
    const p = add(now.at, mul(now.way, -back));
    const k = s / 14;
    for (const dz of [-6, 0, 6]) out.push([add(p, [0, 0, dz * (1 - k * 0.5)]), k < 0.3 ? SMEAR[2] : k < 0.65 ? SMEAR[1] : SMEAR[0], k < 0.3 ? 2 : 1]);
  }
  return out;
}
/** A mask bursting at the end of its flight, `u` seconds after: gilt shards and a puff of grey breath, as grains round where it was. */
export function maskBurst(i: number, u: number): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  if (u < 0 || u > MASKS_FX.burst) return out;
  const at = flungMask(i, MASK_FLIGHT).at;
  const k = u / MASKS_FX.burst;
  for (let j = 0; j < 24; j++) {
    if (hash(i, j, 7761) < k * 0.9) continue;
    const a = hash(i, j, 7762) * TAU;
    const r = 4 + 26 * k * (0.5 + hash(i, j, 7763));
    const z = Math.max(0.5, at[2] + 14 * k * (hash(i, j, 7764) - 0.3) - 40 * k * k);
    const c = j % 3 === 0 ? GILT[4] : j % 3 === 1 ? GILT[2] : k < 0.4 ? BREATH_PALE : HUSH[4];
    out.push([[at[0] + Math.cos(a) * r, at[1] + Math.sin(a) * r, z], c, j % 4 === 0 ? 2 : 1]);
  }
  return out;
}

// =============================================================================================
// MIDNIGHT: the clock's chimes, each a ring rolling out across the floor

/**
 * The chimes: twelve; in each of his three phases, seconds between them and how fast each ring rolls out (tiles a second),
 * faster each phase (his brief, “Each phase the clock strikes faster”); how far a ring goes (tiles: the whole arena from
 * its edge); how deep its wave is (tiles); the gap in it to slip through (tiles across), the game's to place.
 */
export const CHIME = { rings: 12, every: [1.0, 0.75, 0.5] as const, speed: [5, 6.5, 8] as const, reach: 20, band: 0.75, gap: 2.4 } as const;
export const CHIME_CANVAS = { w: 1880, h: 980, ax: 940, ay: 490 } as const;
/** How far out a chime's ring has rolled `t` seconds after the chime (the figure's own lengths), in phase `phase` (0, 1, 2); and how much of it is left (it thins at the end of its reach). */
export function chimeRing(t: number, phase: 0 | 1 | 2 = 0): { r: number; left: number } {
  const v = CHIME.speed[phase] * TILE3;
  const r = Math.max(0, v * t);
  const reach = CHIME.reach * TILE3;
  return { r, left: t < 0 ? 0 : 1 - smooth(reach * 0.85, reach, r) };
}
/** Whether a point of the floor round the clock (its own lengths) is in the gap of a ring whose gap faces `gapAt` (radians; null: no gap). */
function inGap(a: number, r: number, gapAt: number | null): boolean {
  if (gapAt === null || r < 1) return false;
  const half = (CHIME.gap * TILE3) / 2 / r;
  const d = Math.abs(((a - gapAt + Math.PI) % TAU + TAU) % TAU - Math.PI);
  return d < half;
}
/**
 * ONE CHIME'S RING `t` seconds after it strikes, round the clock's floor point (the canvas's middle), seen from in front or
 * from behind: a dark crimson wave rolling out, its crest a line of gilt light, the floor's dust thrown up behind it; a gap
 * in it facing `gapAt` (radians round from the figure's forward; null: none). `canvas`: the picture to paint it on.
 */
export function chimePainted(t: number, view: GameView = 'front', phase: 0 | 1 | 2 = 0, gapAt: number | null = 0, canvas: { w: number; h: number; ax: number; ay: number } = CHIME_CANVAS): Painted {
  const st = stage(view === 'back' ? 'rear' : view, canvas.ax, canvas.ay, canvas);
  const px = st.whole(null);
  const { r, left } = chimeRing(t, phase);
  if (t < 0 || left <= 0.01) return { px, lights: [] };
  const band = CHIME.band * TILE3;
  const n = Math.max(48, Math.ceil(TAU * r * 1.3));
  // (the strike itself: at the clock's foot, a flash of gilt as it rings out)
  if (t < 0.12) {
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * TAU;
      const rr = 6 + 30 * (t / 0.12);
      const [x, y] = st.at([Math.cos(a) * rr, Math.sin(a) * rr, 0.5]);
      lay(px, x, y, i % 2 ? FLAME[4] : GILT[4], 2);
    }
  }
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    if (inGap(a, r, gapAt)) continue;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    // the wave: from its crest back, a band of the black room's crimson, dithered thinner toward its back
    for (let j = 0; j <= 8; j++) {
      const back = (j / 8) * band;
      const rr = r - back;
      if (rr < 0) continue;
      const k = j / 8;
      if (k > 0.25 && hash(i, j, 7771) > (1 - k) * 1.3 * left) continue;
      const lift = 3.2 * Math.sin(Math.PI * Math.min(1, k * 1.6)) * (1 - k * 0.6) + 0.4;
      const [x, y] = st.at([ca * rr, sa * rr, lift]);
      const c = j === 0 ? (i % 3 ? FLAME[4] : GILT[4]) : j === 1 ? FLAME[3] : j <= 3 ? '#a4161c' : j <= 5 ? '#6e0e14' : '#3c080c';
      lay(px, x, y, c, j <= 1 ? 2 : 1);
    }
    // the dust thrown up behind it, drifting
    if (i % 5 === 0 && hash(i, 1, 7772) < 0.6 * left) {
      const life = (t * 3 + hash(i, 2, 7772)) % 1;
      const rr = r - band * (0.6 + 0.8 * life);
      if (rr > 0) {
        const [x, y] = st.at([ca * rr, sa * rr, 2 + life * 9]);
        lay(px, x, y, life < 0.5 ? '#5a4650' : '#3a2c36');
      }
    }
  }
  return { px, lights: [] };
}
void sphere;
