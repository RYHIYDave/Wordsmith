// THE UNDERCITY'S MOMENT AROUND THE HERO (the art chat for floors 11 to 15, 19 Oct 2026; a mock-up, nothing of the
// game imports it).
//
// His rulebook's Places 8, his words of 10 Oct: “I’d also like a couple environmental things happening around you for
// immersion unique for each floor.  Something shifts above you and dust comes down, you spook a pack of birds and they
// fly off,  a root shrivels as you walk by.  That sort of stuff”. Made on his word to this chat of 18 Oct, 21:24
// Pacific: “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least
// for 11-15”: the pick this chat would have marked recommended, sent him as a film. Not rats: floor 1's rats bolt
// already (art/floor1.ts), and each floor's moment is its own. Checked against his Animations 1 before he sees it: “as
// big and wild and kinetic and weighty as possible.  I’d rather it be a notch too high than a notch too low.”
//
//   THE SURGE: in the channel's far wall, an outfall: an arched culvert mouth shut by a hanging iron flap, dripping
//     (`before`). Somewhere behind it a sluice gives. The flap rattles; then it is flung up and a torrent bursts out,
//     arcing across the channel and crashing into it, spray thrown high; the water heaves up round it and a breaking
//     wave runs off down the channel past the hero, slopping over the coping, dying away as it goes; the Order's
//     corks, a sodden notice and a plank come tumbling out on the torrent and are swept off down the channel. The
//     torrent slackens to a trickle, the water drains back down, the flap swings shut with a clank; what it brought
//     out is left floating where it came to rest (`after`).
//
// Laid on a channel of the ground (art/undercity.ts) that runs along x and is two tiles across, its water sunk UC_SINK
// below the walkways: the picture's anchor is the point on the middle of the channel at the walkways' height, the
// culvert in its far wall (toward -y) a tile upstream of it. Built as floor 11's pigeons are (art/floor11_moments.ts:
// onPic, picture pixels, KT to a tile).

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { Moment, Track } from './floorkit';
import { onPic } from './floor2';
import { GRAIN, hash } from './kit';
import { UC_SINK } from './undercity';

const sm = (v: number): number => {
  const c = Math.max(0, Math.min(1, v));
  return c * c * (3 - 2 * c);
};
const fr = (t: number): number => t - Math.floor(t);

/** The water as it rises (the ground's own greens, art/undercity.ts UC_WATER, deep to lit, and the silt it brings); its foam, a dirty pale grey-green. */
const WATER = ['#0d1513', '#14221c', '#1a2c22', '#25392b', '#2f3c2a', '#3a4a34'] as const;
const FOAM = ['#4c5648', '#6e786a', '#929a8a', '#b6bcac', '#d6d9cc'] as const;
const WET = ['#151a18', '#1e2420'] as const;
const STONE = ['#1c1c22', '#2e2e36', '#45454c', '#56565b'] as const;
const DARK = '#07090b';
const IRON = ['#16171d', '#2a2b33', '#45454d', '#5a5a62'] as const;
const RUST = ['#3e2620', '#5c3624'] as const;
const CORK = ['#2a1e14', '#7a6448', '#9a7e5a'] as const;
const PLANK = ['#1a1310', '#3d2e25', '#4f3c2e', '#634c3a'] as const;
const PAPER = ['#3a3830', '#8c887c', '#a8a496'] as const;

/** The channel: how far each side of its middle (a tile: it is two across), and how far below the walkways its water lies. */
const HALF = 40;
const BASE = -UC_SINK;
/** The culvert: where along the channel, how wide each side of its middle, how high its arch, where its flap hangs from. */
const XC = -40;
const MOUTH = 8;
const ARCH = -4;
const HINGE = -5;
const FLAP_LONG = 13;
/** The picture: from this far left of the anchor to this far right (picture pixels across the screen). */
const LEFT = -190;
const RIGHT = 330;
/** When things happen (frames at 30 a second): the flap rattles, bursts open (a jolt), the torrent eases, the flap swings shut (a jolt). */
const RATTLE = 3;
const BURST = 8;
const EASE = 44;
const SHUT = 84;
const SHUT_LONG = 7;
/** How fast the wave runs off down the channel (a frame), and how soon it dies away, downstream and up. */
const V = 8.5;
const DOWN = 150;
const UP = 30;

/** How hard the culvert pours at `t` frames since it burst: hard at once, easing off to a trickle. */
const pour = (t: number): number => (t < 0 ? 0 : sm(t / 3) * (1 - 0.85 * sm((t - (EASE - BURST)) / 34)) * (1 - sm((t - (SHUT - BURST - 6)) / 8)));
/** How strong it is at x: what reaches it from the culvert, and when. */
const reach = (x: number): number => (x >= XC ? Math.exp(-(x - XC) / DOWN) : Math.exp(-(XC - x) / UP));
const lagAt = (x: number): number => Math.abs(x - XC) / V;

/** How high the water stands at (x, y) on frame `f`, up from the walkways (BASE as the ground paints it). */
function level(x: number, y: number, f: number): number {
  const tau = f - BURST - lagAt(x);
  const A = reach(x);
  const body = 11 * pour(tau);
  // (the breaking head of the wave as it first comes by)
  const head = tau > 0 && tau < 7 ? 7 * Math.sin((Math.PI * tau) / 7) : 0;
  const rise = A * (body + head);
  const chop = (1.6 * Math.sin(0.21 * x - 0.95 * f + 0.31 * y) + 1.0 * Math.sin(0.13 * x + 0.47 * y - 0.6 * f)) * Math.min(1, rise / 5);
  // (heaped up where the torrent strikes it, under the culvert)
  const strike = Math.abs(x - XC) < MOUTH + 6 && y < -HALF + 30 ? 3 * pour(f - BURST) * (1 - Math.abs(x - XC) / (MOUTH + 6)) : 0;
  return BASE + Math.max(0, rise + chop + strike);
}

/** Whether a point of the channel at (x, y, z) shows: not behind the near walkway's lip. */
function shows(x: number, y: number, z: number): boolean {
  if (z >= 0 || y >= HALF) return true;
  const [sx, sy] = onPic(x, y, z);
  return sy < sx / 2 + 0.8 * HALF;
}

/** The flap's angle, up from hanging shut (radians): rattling, flung up, held up by the torrent, swinging shut with a bounce. */
function flapAt(f: number): number {
  if (f < RATTLE) return 0;
  if (f < BURST) return 0.08 * Math.abs(Math.sin((f - RATTLE) * 2.3));
  const t = f - BURST;
  const open = 1.95 * sm(t / 3) + 0.25 * Math.sin(t * 0.7) * Math.exp(-t / 6) + 0.05 * Math.sin(t * 1.9);
  const held = 0.6 + 1.3 * pour(t);
  const k = Math.min(open, t < 6 ? open : held);
  if (f < SHUT) return Math.max(0, k);
  const s = (f - SHUT) / SHUT_LONG;
  if (s < 1) return Math.max(0, k * (1 - s * s));
  // (the clank: a bounce off its seat, settling)
  const b = f - SHUT - SHUT_LONG;
  return b < 6 ? 0.16 * Math.abs(Math.sin((b * Math.PI) / 3)) * Math.exp(-b / 2) : 0;
}

interface Drop { f0: number; x: number; y: number; z: number; vx: number; vy: number; vz: number; big: boolean }
interface Float { name: string; born: number; long: number; wide: number; seed: number; y: number }

/** THE SURGE (see the head of this file). */
function theSurge(): Moment {
  const W = RIGHT - LEFT + 20;
  const H = 360;
  const ax = -LEFT + 10;
  const ay = 150;
  const LAST = 170;
  const G = 0.6;

  // THE SPRAY: a great burst as the flap goes; then thrown up off the torrent where it strikes the water, off the
  // head of the wave as it runs, and over the near coping where the wave stands high
  const drops: Drop[] = [];
  for (let f = BURST; f < LAST; f++) {
    const t = f - BURST;
    const p = pour(t);
    const r = (i: number, k: number, s: number): number => hash(f, i * 7 + k, s);
    const n0 = t === 0 ? 70 : t < 3 ? 30 : 0;
    for (let i = 0; i < n0; i++) drops.push({ f0: f, x: XC + (r(i, 0, 5201) - 0.5) * 2 * MOUTH, y: -HALF + 1, z: -12 + r(i, 1, 5201) * 6, vx: (r(i, 2, 5201) - 0.5) * 7, vy: 1.5 + r(i, 3, 5201) * 4.5, vz: 2 + r(i, 4, 5201) * 6, big: r(i, 5, 5201) < 0.4 });
    for (let i = 0; i < Math.round(10 * p); i++) {
      const x = XC + (r(i, 0, 5202) - 0.5) * 2 * MOUTH;
      const y = -HALF + 16 + r(i, 1, 5202) * 14;
      drops.push({ f0: f, x, y, z: level(x, y, f), vx: (r(i, 2, 5202) - 0.5) * 5, vy: (r(i, 3, 5202) - 0.3) * 3, vz: 3 + r(i, 4, 5202) * 5 * p, big: r(i, 5, 5202) < 0.3 });
    }
    // (off the head of the wave, wherever it has got to, while it stands high)
    const X = XC + V * t;
    if (reach(X) > 0.3 && t < 40) {
      for (let i = 0; i < Math.round(7 * reach(X)); i++) {
        const y = -HALF + 2 + r(i, 0, 5203) * (2 * HALF - 4);
        const x = X - r(i, 1, 5203) * 6;
        drops.push({ f0: f, x, y, z: level(x, y, f), vx: 3 + r(i, 2, 5203) * 4, vy: (r(i, 3, 5203) - 0.5) * 1.4 + (y > HALF - 12 ? 1.6 : 0), vz: (2.5 + r(i, 4, 5203) * 3.5) * reach(X), big: r(i, 5, 5203) < 0.25 });
      }
    }
  }
  /** Where a drop is `k` frames after it was thrown (null once it is back in the water, or on a walkway). */
  const dropAt = (d: Drop, k: number): [number, number, number] | null => {
    const x = d.x + d.vx * k;
    const y = d.y + d.vy * k;
    const z = d.z + d.vz * k - 0.5 * G * k * k;
    if (k > 0 && Math.abs(y) < HALF && z < level(x, y, d.f0 + k)) return null;
    if (Math.abs(y) >= HALF && z <= 0) return null;
    if (y < -HALF && z < 0) return null;
    return [x, y, z];
  };
  // where they land on the walkways, a wet blot a moment
  const blots: { f0: number; x: number; y: number }[] = [];
  for (const d of drops) {
    for (let k = 1; k < 40; k++) {
      const p = dropAt(d, k);
      if (p) continue;
      const y = d.y + d.vy * k;
      const z = d.z + d.vz * k - 0.5 * G * k * k;
      if (Math.abs(y) >= HALF && z <= 0) blots.push({ f0: d.f0 + k, x: d.x + d.vx * k, y });
      break;
    }
  }

  // WHAT IT BRINGS OUT: thrown out of the culvert on the torrent, swept off down the channel, left floating where it comes to rest
  const floats: Float[] = [
    { name: 'the corks', born: BURST + 1, long: 14, wide: 9, seed: 1, y: -6 },
    { name: 'the notice', born: BURST + 6, long: 11, wide: 9, seed: 2, y: 6 },
    { name: 'the plank', born: BURST + 12, long: 20, wide: 5, seed: 3, y: -14 },
  ];
  const floatPath = floats.map((fl) => {
    const out: ({ x: number; y: number; z: number; a: number; out: number } | null)[] = [];
    let x = XC;
    let y = -HALF;
    let a = 0;
    for (let f = 0; f < LAST; f++) {
      const t = f - fl.born;
      if (t < 0) {
        out.push(null);
        continue;
      }
      if (t < 6) {
        // (thrown out of the mouth on the torrent, end first, across to where it lands)
        const u = t / 6;
        y = -HALF + (HALF + fl.y) * u;
        x = XC + (fl.seed - 2) * 3 + 4 * u;
        a = 1.3 * (1 - u) + 0.3 * Math.sin(fl.seed);
        out.push({ x, y, z: Math.max(level(x, y, f), -8 - 14 * u * u), a, out: Math.min(1, 0.25 + u) });
        continue;
      }
      // (carried along at the water's pace there, slowing as it drains; drifting a little across, turning)
      const tau = f - BURST - lagAt(x);
      const flow0 = 7.5 * reach(x) * Math.max(pour(tau), 0.12 * (1 - sm((f - SHUT) / 20)));
      // (and at rest once the water has all but stopped)
      const flow = flow0 < 0.1 ? 0 : flow0;
      x += flow;
      y += 0.35 * Math.sin(f * 0.13 + fl.seed) * Math.min(1, flow / 2);
      y = Math.max(-HALF + fl.wide, Math.min(HALF - fl.wide, y));
      a += 0.04 * Math.sin(f * 0.21 + fl.seed) * Math.min(1, flow / 2);
      out.push({ x, y, z: level(x, y, f), a, out: 1 });
    }
    return out;
  });

  const tracks: Track[] = [
    { name: 'the flap', at: [] },
    { name: 'the head of the wave', fromEdge: true, at: [] },
    ...floats.map((fl) => ({ name: fl.name, fromEdge: true, at: [] as Track['at'] })),
  ];

  const paint = (f: number, loop: number, record: boolean): Px => {
    const q = new Px(W, H);
    const put = (sx: number, sy: number, c: string): boolean => {
      const X = Math.round(ax + sx);
      const Y = Math.round(ay + sy);
      if (X < 0 || Y < 0 || X >= W || Y >= H || sx < LEFT || sx > RIGHT) return false;
      q.set(X, Y, c);
      return true;
    };

    // THE CULVERT: an arch of dressed stone round a dark mouth, in the far wall of the channel, from the water up
    for (let x = XC - MOUTH - 4; x <= XC + MOUTH + 4; x += 0.5) {
      for (let z = BASE; z <= ARCH + 2; z += 0.5) {
        const u = (x - XC) / MOUTH;
        const top = ARCH - 3 + 3 * Math.sqrt(Math.max(0, 1 - u * u));
        const ring = Math.abs(u) <= 1.4 && z <= top + 3.2 * (1 - 0.3 * u * u) + 0.2;
        if (!ring) continue;
        const inside = Math.abs(u) < 1 && z < top;
        const [sx, sy] = onPic(x, -HALF + 0.3, z);
        if (inside) put(sx, sy, DARK);
        else {
          // (voussoirs: dark joints between them)
          const ang = Math.atan2(z - (ARCH - 3), (x - XC) * 0.8);
          const joint = fr(ang * 2.2) < 0.1 || (Math.abs(u) > 1.05 && fr((z - BASE) / 5) < 0.18);
          put(sx, sy, joint ? STONE[0] : z > ARCH - 1 ? STONE[3] : STONE[2]);
        }
      }
    }
    // THE FLAP: an iron plate hung from its top, shut over the mouth; rusted, two straps riveted across it
    const ang = flapAt(f);
    for (let x = XC - MOUTH + 0.5; x <= XC + MOUTH - 0.5; x += 0.5) {
      for (let r = 0; r <= FLAP_LONG; r += 0.5) {
        const y = -HALF + 0.8 + Math.sin(ang) * r;
        const z = HINGE - Math.cos(ang) * r;
        if (z < BASE + 0.5 && Math.cos(ang) > 0) continue;
        const [sx, sy] = onPic(x, y, z);
        const strap = Math.abs(r - 3) < 1.2 || Math.abs(r - 12) < 1.2;
        const rivet = strap && Math.abs(Math.abs(x - XC) - MOUTH + 2) < 0.6;
        const edge = Math.abs(x - XC) > MOUTH - 1.4 || r > FLAP_LONG - 1;
        const rust = hash(Math.round(x * 2), Math.round(r * 2), 5204) < 0.18;
        put(sx, sy, rivet ? IRON[3] : strap ? IRON[2] : edge ? IRON[0] : rust ? RUST[r > 8 ? 0 : 1] : ang > 1.2 ? IRON[1] : IRON[1 + (Math.round(r) % 5 === 0 ? 1 : 0)]);
      }
    }
    if (record) {
      const [sx, sy] = onPic(XC, -HALF + Math.sin(ang) * 8, HINGE - Math.cos(ang) * 8);
      tracks[0].at.push({ x: sx, y: sy, shown: 1, size: 16 });
    }
    // drips off the flap's foot while it hangs shut before (each a short streak, falling); none once it has clanked shut again
    if (f < BURST && ang < 0.2) {
      for (let i = 0; i < 3; i++) {
        const k = (loop * 2 + i * 5) % 9;
        const x = XC - 5 + i * 5;
        const z = HINGE - FLAP_LONG - 1 - k * 0.7 - 0.12 * k * k;
        if (z <= BASE + 0.5) continue;
        const [sx, sy] = onPic(x, -HALF + 1.2, z);
        put(sx, sy, FOAM[2]);
        put(sx, sy + 1, FOAM[1]);
      }
    }

    // THE WATER RISEN: every pixel of the channel whose water stands above the ground's, coloured by how it runs
    let headPx = 0;
    const Xh = XC + V * (f - BURST);
    for (let sx = LEFT; sx <= RIGHT; sx++) {
      const a = sx / 0.8;
      for (let sy = Math.floor(0.4 * a - 0.8 * HALF - 2); sy <= Math.ceil(0.4 * a + 0.8 * HALF + 2); sy++) {
        let h = BASE;
        let x = 0;
        let y = 0;
        for (let it = 0; it < 4; it++) {
          x = (a + (sy + h) / 0.4) / 2;
          y = x - a;
          h = level(x, y, f);
        }
        if (y < -HALF || y > HALF || h < BASE + 1.0 || !shows(x, y, h)) continue;
        const rise = h - BASE;
        const tau = f - BURST - lagAt(x);
        const n = hash(Math.floor(x * 0.35 - f * 2.4), Math.floor(y * 0.7), 5205);
        const streak = fr(x * 0.045 + y * 0.013 - f * 0.31 + hash(Math.floor(y / 3), 0, 5206) * 3);
        const strike = Math.abs(x - XC) < MOUTH + 5 && y < -HALF + 32 && pour(f - BURST) > 0.15;
        let c: string;
        if (tau > -1 && tau < 5 && rise > 5 && x > XC) {
          c = tau < 1.5 ? FOAM[4] : n < 0.5 ? FOAM[3] : FOAM[2];
          headPx++;
        } else if (strike && n < 0.4 + 0.5 * pour(f - BURST)) c = n < 0.25 ? FOAM[4] : FOAM[3];
        else if (y < -HALF + 2.5 && rise > 4) c = n < 0.5 ? FOAM[2] : FOAM[1];
        else if (tau > 0 && streak < 0.07 * Math.min(1, rise / 4)) c = FOAM[1];
        else {
          const lit = rise > 12 ? 4 : rise > 7 ? 3 : rise > 3.5 ? 2 : 1;
          c = streak < 0.16 && rise > 2.5 ? WATER[Math.min(5, lit + 1)] : WATER[lit];
          if (rise < 2.0) c = (sx + sy) % 2 ? WATER[1] : WATER[0];
        }
        put(sx, sy, c);
      }
    }
    if (record) {
      const [sx, sy] = onPic(Xh, 0, level(Xh, 0, f));
      tracks[1].at.push(headPx > 0 ? { x: sx, y: sy, shown: Math.min(1, headPx / 300), size: 30 } : f < BURST ? null : { x: sx, y: sy, shown: 0, size: 30 });
    }

    // THE TORRENT: out of the mouth under the flap, arcing across the channel and down into it
    const p = pour(f - BURST);
    if (p > 0.02) {
      const reachOut = 6 + 26 * p;
      for (let x = XC - MOUTH + 1; x <= XC + MOUTH - 1; x += 0.5) {
        const wob = Math.sin(f * 1.3 + x) * 0.8;
        for (let u = 0; u <= 1; u += 0.02) {
          const y = -HALF + 0.5 + reachOut * u;
          const z0 = -7 - 2 * (1 - p) - 15 * u * u + wob * u;
          const thick = 2 + 5 * p * (1 - 0.4 * u);
          for (let t = 0; t <= thick; t += 0.5) {
            const z = z0 - t;
            if (z < level(x, y, f)) break;
            if (!shows(x, y, z)) continue;
            const [sx, sy] = onPic(x, y, z);
            const n = hash(Math.round(x * 2 + f * 3), Math.round(u * 50 - f * 2), 5207);
            put(sx, sy, t < 1 ? (n < 0.5 ? FOAM[4] : FOAM[3]) : Math.abs(x - XC) > MOUTH - 2 ? FOAM[2] : n < 0.3 ? FOAM[2] : n < 0.7 ? WATER[5] : WATER[4]);
          }
        }
      }
    }

    // the wet blots where the spray lands on the walkways, drying back out
    for (const b of blots) {
      const k = f - b.f0;
      if (k < 0 || k >= 12) continue;
      const [sx, sy] = onPic(b.x, b.y, 0);
      const w = k < 6 ? 3 : 2;
      for (let dx = 0; dx < w; dx++) for (let dy = 0; dy < 2; dy++) put(sx + dx, sy + dy, WET[(dx + dy) % 2]);
    }

    // WHAT IT BROUGHT OUT
    floats.forEach((fl, j) => {
      const P = floatPath[j][f];
      if (!P) {
        if (record) tracks[2 + j].at.push(null);
        return;
      }
      let drawn = 0;
      let whole = 0;
      const dot = (u: number, v: number, c: string): void => {
        const ca = Math.cos(P.a);
        const sa = Math.sin(P.a);
        const x = P.x + u * ca - v * sa;
        const y = P.y + u * sa + v * ca;
        whole++;
        // (out of the culvert's mouth only so far as it has come out of it)
        if (y < -HALF + 0.5) return;
        if (!shows(x, y, P.z)) return;
        const [sx, sy] = onPic(x, y, P.z + 1);
        if (put(sx, sy, c)) drawn++;
      };
      if (fl.name === 'the corks') {
        for (let i = 0; i < 6; i++) {
          const cu = (hash(i, 2, 5208) - 0.5) * fl.long;
          const cv = (hash(i, 3, 5208) - 0.5) * fl.wide;
          for (let u = -2; u <= 2; u += 0.5) for (let v = -1.5; v <= 1.5; v += 0.5) if ((u * u) / 5 + (v * v) / 2.5 <= 1) dot(cu + u, cv + v, Math.abs(u) >= 1.8 ? CORK[0] : v < 0 ? CORK[2] : CORK[1]);
        }
      } else if (fl.name === 'the plank') {
        for (let u = -fl.long / 2; u <= fl.long / 2; u += 0.5) for (let v = -fl.wide / 2; v <= fl.wide / 2; v += 0.5) dot(u, v, Math.abs(u) > fl.long / 2 - 1 || Math.abs(v) > fl.wide / 2 - 0.6 ? PLANK[0] : v < 0 ? PLANK[3] : Math.round(u) % 7 === 0 ? PLANK[1] : PLANK[2]);
      } else {
        for (let u = -fl.long / 2; u <= fl.long / 2; u += 0.5) for (let v = -fl.wide / 2; v <= fl.wide / 2; v += 0.5) dot(u, v, Math.abs(u) > fl.long / 2 - 1 || Math.abs(v) > fl.wide / 2 - 0.6 ? PAPER[0] : Math.round(v + u * 0.3) % 3 === 0 ? PAPER[1] : PAPER[2]);
      }
      if (record) {
        const [sx, sy] = onPic(P.x, P.y, P.z);
        // (where it is drawn: on the picture's own pixels)
        tracks[2 + j].at.push({ x: Math.round(sx), y: Math.round(sy), shown: whole ? drawn / whole : 0, size: fl.long * 0.8 + 4 });
      }
    });

    // THE SPRAY
    for (const d of drops) {
      const k = f - d.f0;
      if (k < 0 || k > 40) continue;
      const P = dropAt(d, k);
      if (!P || !shows(P[0], P[1], P[2])) continue;
      const [sx, sy] = onPic(P[0], P[1], P[2]);
      const c = k < 3 ? FOAM[4] : k < 8 ? FOAM[3] : FOAM[2];
      put(sx, sy, c);
      put(sx + 1, sy, c);
      put(sx, sy + 1, FOAM[2]);
      put(sx + 1, sy + 1, FOAM[2]);
      if (d.big && k < 8) {
        put(sx - 1, sy, c);
        put(sx, sy - 1, c);
      }
    }
    return q;
  };
  const cut = (q: Px): Sprite => {
    // (no speckle: a lone pixel with nothing painted round it, a sliver of water or a drop clipped at the picture's end, is let go)
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

  // it is over once the flap is shut and still, the water back down, the spray all fallen, what it brought out at rest
  const frames: Sprite[] = [];
  let last = -1;
  const sum = (q: Px): number => {
    let h = 0;
    for (let i = 0; i < q.d.length; i++) h = (Math.imul(h, 31) + q.d[i]) | 0;
    return h;
  };
  for (let f = 0; f < LAST; f++) {
    const q = paint(f, f, true);
    frames.push(cut(q));
    if (f > SHUT + SHUT_LONG + 6) {
      const s = sum(q);
      if (s === last) {
        frames.pop();
        break;
      }
      last = s;
    }
  }
  const NF = frames.length;
  if (NF === LAST) throw new Error('the surge is still going at the end');
  for (const t of tracks) t.at = t.at.slice(0, NF);
  const before = [0, 1, 2, 3].map((k) => cut(paint(0, k, false)));
  return { name: 'the surge', frames, fps: 30, before, after: [frames[NF - 1]], tracks, jolts: [BURST, SHUT + SHUT_LONG], holds: [] };
}

let moments: Moment[] | null = null;
/** The Undercity's moment around the hero: the surge. */
export function undercityMoments(): Moment[] {
  return (moments ??= [theSurge()]);
}
