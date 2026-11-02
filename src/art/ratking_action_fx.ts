// THE RAT KING DONE THE ACTION WAY: WHAT HE DOES TO HIS CISTERN AND SENDS ACROSS IT (the art chat's helper, 2 Nov 2026;
// docs/mockups/action_f12_ratking/README.md). A MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE (RATKING_ACTION, off).
//
//   THE SLUICES OPEN: the cistern's lanes (`lanesFor`: lanes LANE.w tiles wide running across it from the sluice gates in one wall to
//     the drain along the other, dry ledges between them); their warning (`paintLaneMarks`: each lane's edges dashed in his pink,
//     chevrons down it the way the water will run); the gates in the wall grinding open and bursting (`paintGate`); THE FLOOD
//     (`paintFlood`: murky water white and black, its front a wall of foam, full of tumbling rats with the enemy's pink eyes; the
//     ledges left dry), running FLOOD.runs seconds and draining.
//   THE BITE'S WEDGE (`paintWedge`), marked while it is held, and torn where the jaws snap.
//   STOLEN WORDS: the word's line (`paintWordLine`: following you, then LOCKED); the word in flight, twice the old size, in the shape of
//     one of the hero's own words in the enemy's fire (`paintWord`); its burst, twice as wide (`paintWordBurst`).
//   UNKNOT: the ring of rats bursting out (`paintBurstRing`); THE SWARM, twice as many and twice as wide (`paintSwarm9`).
// Every colour the enemy's, the sewer's or the water's: never the friend's cyan.

import { Px } from '../engine/px';
import { hash } from './kit';
import { FLAME } from './mkit';
import { BITE9, SLUICE, SLUICE_HIT, UNKNOT9, WORDS9 } from './ratking_action';
import { BELLY, FUR, SKIN } from './rat_king';

const cl01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const sm = (v: number): number => {
  const c = cl01(v);
  return c * c * (3 - 2 * c);
};
const TAU = Math.PI * 2;
/** A floor point (tiles, `z` picture pixels up) to the picture. */
export type At = (x: number, y: number, z?: number) => [number, number];
/** The floor's tiles on the picture: a tile 32 by 16 picture pixels, the cistern's middle at (cx, cy). */
export interface Iso {
  cx: number;
  cy: number;
}
export const isoAt = (I: Iso): At => (x, y, z = 0) => [I.cx + 32 * (x - y), I.cy + 16 * (x + y) - z];
const toFloor = (I: Iso, X: number, Y: number): [number, number] => {
  const a = (X + 0.5 - I.cx) / 32;
  const b = (Y + 0.5 - I.cy) / 16;
  return [(a + b) / 2, (b - a) / 2];
};
const PINK = ['#7a1058', '#e0287a', '#ff7aa8'] as const;
const INK = '#0e0c24';
function pen(px: Px): (x: number, y: number, c: string) => void {
  return (x, y, c) => {
    const X = Math.round(x);
    const Y = Math.round(y);
    if (X >= 1 && Y >= 1 && X < px.w - 1 && Y < px.h - 1) px.set(X, Y, c);
  };
}
/** A beat that quickens as `m` nears `to` (on or off). */
const beat = (m: number, from: number, to: number): boolean => {
  const k = cl01((m - from) / (to - from));
  return Math.sin(TAU * (2 + 7 * k) * (m - from)) > -0.2;
};

// =============================================================================================
// THE CISTERN'S LANES

/** A lane: its middle across the cistern (tiles), half its width. Between the lanes, and along the walls, the dry ledges. */
export interface Lane {
  y: number;
  half: number;
}
/** THE LANES' NUMBERS: each lane `w` tiles wide; a dry ledge at least `ledge` tiles wide between two and along each wall. */
export const LANE = { w: 3.0, ledge: 1.75 } as const;
/** The lanes across a cistern `across` tiles wide (its middle at 0): as many as fit with a ledge at least LANE.ledge between each and along each wall; the ledges share what is left. (16: three lanes, ledges 1.75; the game's 22: four, ledges 2.0; 26: five, ledges 1.83.) */
export function lanesFor(across: number): { lanes: Lane[]; ledge: number } {
  const n = Math.max(1, Math.floor((across - LANE.ledge) / (LANE.w + LANE.ledge)));
  const ledge = (across - n * LANE.w) / (n + 1);
  const lanes: Lane[] = [];
  for (let i = 0; i < n; i++) lanes.push({ y: -across / 2 + ledge * (i + 1) + LANE.w * (i + 0.5), half: LANE.w / 2 });
  return { lanes, ledge };
}
/** THE PICTURES' CISTERN (a stand-in): 16 tiles each way, its middle at 0; the sluice gates in its wall at x = -8, the drain along x = +8. */
export const CISTERN = { half: 8 } as const;
export const LANES = lanesFor(2 * CISTERN.half).lanes;
/** Which lane a floor point is in (its index), or -1 on a dry ledge. */
export const laneOf = (y: number, lanes: readonly Lane[] = LANES): number => lanes.findIndex((l) => Math.abs(y - l.y) < l.half);

/**
 * THE FLOOD'S NUMBERS (seconds from the summons' start; tiles):
 *   the gates grind open from SLUICE.gates, a crack of water spurting under each; BURST at SLUICE_HIT
 *   the water's front races across from the gates at `front` tiles a second (16 tiles in 0.2 s: a few frames), each lane `stagger`
 *   later than the one before; it runs `runs` seconds from the burst at full; the gates drop and its tail drains away from them down
 *   the lanes in `drain` seconds. Its current `flow` tiles a second (the rats tumbling in it go at `rats`)
 *   struck: whoever is in a lane as its front passes them; then carried with the water at `carry` tiles a second while they are in
 *   it, struck again every `every` seconds (a suggestion: the rules' own)
 */
export const FLOOD = { front: 80, stagger: 0.033, runs: 3.0, drain: 0.8, flow: 7, rats: 6, carry: 5, every: 0.5, gateLift: 0.3 } as const;
/** How far the water has come from the gate wall in lane `i` and how far its tail has drained (tiles from the wall), `m` seconds into the summons, the lane `len` tiles long. */
export function floodSpan(m: number, i: number, len: number): [number, number] {
  const s = m - SLUICE_HIT - i * FLOOD.stagger;
  if (s <= 0) return [0, 0];
  const front = Math.min(len, FLOOD.front * s);
  const tail = s < FLOOD.runs ? 0 : Math.min(len, (len * (s - FLOOD.runs)) / FLOOD.drain);
  return [tail, front];
}
/** Is the floor point (x, y) under the flood, `m` seconds into the summons (the gates at x = -half)? */
export function flooded(x: number, y: number, m: number, half: number = CISTERN.half, lanes: readonly Lane[] = LANES): boolean {
  const i = laneOf(y, lanes);
  if (i < 0 || x < -half || x > half) return false;
  const [tail, front] = floodSpan(m, i, 2 * half);
  const d = x + half;
  return front > tail && d >= tail && d <= front;
}
/** How far up a gate is (0 shut, 1 up), `m` seconds into the summons. */
export function gateUp(m: number, i: number): number {
  const s0 = SLUICE.gates + i * 0.05;
  if (m < s0) return 0;
  if (m < SLUICE_HIT) return FLOOD.gateLift * sm((m - s0) / (SLUICE_HIT - s0 - 0.1)) + 0.02 * Math.sin(m * 40) * (m < SLUICE_HIT - 0.1 ? 1 : 0);
  const s = m - SLUICE_HIT - i * FLOOD.stagger;
  if (s < 2 / 30) return FLOOD.gateLift + (1 - FLOOD.gateLift) * cl01(s / (2 / 30));
  if (s < FLOOD.runs) return 1;
  return 1 - sm((s - FLOOD.runs) / 0.35);
}

// THE WATER: murky, white and black; its colours deep to foam
const WATER = ['#070b0a', '#0d1512', '#14201b', '#1d2c24', '#2b3c32', '#4a5a50'] as const;
const FOAM = ['#7e877c', '#aab2a4', '#d2d6c8', '#eef0e4'] as const;
const WET = ['#1a1418', '#231a1c'] as const;

/** THE LANES' WARNING: each lane's two edges dashed in his pink from the gate wall to the drain, chevrons down it the way the water will run, beating faster as the burst nears; `m` seconds into the summons. */
export function paintLaneMarks(px: Px, at: At, m: number, half: number = CISTERN.half, lanes: readonly Lane[] = LANES): void {
  if (m < SLUICE.mark || m > SLUICE_HIT + 0.25) return;
  const dot = pen(px);
  const k = sm((m - SLUICE.mark) / 0.3);
  const on = beat(m, SLUICE.mark, SLUICE_HIT);
  const len = 2 * half;
  lanes.forEach((L, i) => {
    const [tail, front] = floodSpan(m, i, len);
    const covered = (d: number): boolean => front > tail && d <= front && d >= tail;
    // its edges, laid out from the gates
    for (let d = 0.15; d <= len * k - 0.1; d += 0.05) {
      if (Math.round(d * 20) % 6 >= 4 || covered(d)) continue;
      for (const sd of [-1, 1]) {
        const [x, y] = at(-half + d, L.y + sd * (L.half - 0.1));
        dot(x, y, on ? PINK[2] : PINK[1]);
        dot(x + 1, y, on ? PINK[2] : PINK[1]);
        dot(x, y + 1, PINK[1]);
        dot(x + 1, y + 1, PINK[0]);
        dot(x, y + 2, PINK[0]);
      }
    }
    // chevrons down its middle, running the way the water will
    const run = (m * 3) % 1;
    for (let c = 0; c < len / 2.2; c++) {
      const d0 = 0.9 + (c + run) * 2.2;
      if (d0 > len * k - 0.4 || covered(d0)) continue;
      for (let s = -1.0; s <= 1.0; s += 0.03) {
        for (const th of [0, 0.09]) {
          const d = d0 - Math.abs(s) * 0.6 - th;
          const [x, y] = at(-half + d, L.y + s);
          dot(x, y, on ? PINK[2] : PINK[1]);
          dot(x + 1, y, th ? PINK[1] : on ? PINK[2] : PINK[1]);
          dot(x, y + 1, PINK[0]);
        }
      }
    }
    // the floor inside hatched faintly: a place to be out of
    for (let j = 0; j < len * 110 * k; j++) {
      const d = hash(i, j, 7101) * len * k;
      const s = (hash(i, j, 7102) - 0.5) * 2 * (L.half - 0.15);
      if (covered(d)) continue;
      const [x, y] = at(-half + d, L.y + s);
      if ((Math.round(x) + Math.round(y)) % 2) continue;
      dot(x, y, on ? PINK[1] : PINK[0]);
    }
  });
}

/** A little rat at a picture point, `ang` its way on the picture (radians), `size` (1 about 14 picture pixels long), tumbling belly up when `belly`; its eye the enemy's pink. */
export function paintRat(px: Px, X: number, Y: number, ang: number, size: number, belly: boolean, seed: number, wet = false, rim: string = INK): void {
  const dot = pen(px);
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const L = 5.2 * size;
  const Wd = 2.6 * size;
  const fur = wet ? ['#1a1418', '#3a302e', '#5a4e48', '#7e7066'] : [FUR[0], FUR[3], FUR[4], '#7e7066'];
  // its tail first, curling behind
  for (let i = 0; i <= 10; i++) {
    const q = i / 10;
    const bx = -L - q * 7 * size;
    const by = Math.sin(q * 3 + seed) * 2.5 * size * q;
    dot(X + c * bx - s * by, Y + s * bx * 0.6 + c * by * 0.6, SKIN[q < 0.5 ? 2 : 1]);
  }
  // its body: an egg along its way, dark edged, its back lit (or its pale belly, legs up)
  for (let j = -Math.ceil(Wd) - 1; j <= Math.ceil(Wd) + 1; j++) {
    for (let i = -Math.ceil(L) - 1; i <= Math.ceil(L) + 1; i++) {
      const e = (i / L) ** 2 + (j / Wd) ** 2;
      if (e > 1.25) continue;
      const x = X + c * i - s * j;
      const y = Y + (s * i + c * j) * 0.6;
      if (e > 1) dot(x, y, rim);
      else if (belly) dot(x, y, j < -Wd * 0.3 ? BELLY[3] : e > 0.6 ? BELLY[1] : BELLY[2]);
      else dot(x, y, j < -Wd * 0.35 && e < 0.7 ? fur[3] : e > 0.65 ? fur[1] : fur[2]);
    }
  }
  // its head and snout before it; an ear; its eye
  const hx = X + c * (L + 2 * size);
  const hy = Y + s * (L + 2 * size) * 0.6;
  for (let j = -2; j <= 2; j++) for (let i = -2; i <= 3; i++) if ((i / 3) ** 2 + (j / 2) ** 2 <= 1.1) dot(hx + c * i * size - s * j * size, hy + (s * i * size + c * j * size) * 0.6, belly ? BELLY[2] : fur[2]);
  dot(hx + c * 4 * size, hy + s * 4 * size * 0.6, SKIN[3]);
  dot(hx - s * 2 * size - c * size, hy + c * 2 * size * 0.6 - 1, SKIN[2]);
  dot(hx - s * 1.2 * size + c * size, hy + c * 1.2 * size * 0.6 - 1, FLAME[2]);
  if (size > 1.4) dot(hx - s * 1.2 * size + c * size + 1, hy + c * 1.2 * size * 0.6 - 1, FLAME[3]);
  if (belly) for (const k of [-1, 1]) for (const f of [-0.5, 0.5]) dot(X + c * f * L - s * k * (Wd + 1.5), Y + (s * f * L + c * k * (Wd + 1.5)) * 0.6 - 1, SKIN[3]);
}

/**
 * THE FLOOD, `m` seconds into the summons: the water in each lane from its tail to its front, murky, streaked white and black
 * along its flow, its front a churning wall of foam with spray over it, foam lipping the ledges' edges; FULL OF TUMBLING RATS carried
 * with it. Parted round `him` (his floor point, if he stands in it). On the picture whose cistern's middle is at `I`.
 */
export function paintFlood(px: Px, I: Iso, m: number, him: [number, number] | null = null, half: number = CISTERN.half, lanes: readonly Lane[] = LANES): void {
  const at = isoAt(I);
  const dot = pen(px);
  const len = 2 * half;
  const spans = lanes.map((_, i) => floodSpan(m, i, len));
  if (spans.every(([a, b]) => b <= a)) return;
  // (the picture's box round the cistern)
  const [l] = at(-half, half);
  const [r] = at(half, -half);
  const [, t] = at(-half, -half);
  const [, b] = at(half, half);
  const s = m - SLUICE_HIT;
  for (let Y = Math.max(1, Math.floor(t)); Y < Math.min(px.h - 1, Math.ceil(b)); Y++) {
    for (let X = Math.max(1, Math.floor(l)); X < Math.min(px.w - 1, Math.ceil(r)); X++) {
      const [x, y] = toFloor(I, X, Y);
      if (x < -half || x > half) continue;
      const i = laneOf(y, lanes);
      if (i < 0) continue;
      const [tail, front] = spans[i];
      const d = x + half;
      if (front <= tail || d > front || d < tail) continue;
      const L = lanes[i];
      const edge = L.half - Math.abs(y - L.y);
      let ring = Infinity;
      if (him) {
        ring = Math.hypot(x - him[0], y - him[1]);
        if (ring < 1.15) continue;
      }
      const u = x - FLOOD.flow * Math.max(0, s);
      // white and black: troughs near black, crests broken white, streaked along the flow
      const w = Math.sin(u * 3.3 + Math.sin(y * 2.1 + u * 0.8) * 1.6) + 0.7 * Math.sin(u * 8.1 - y * 5.3 + s * 4) + 0.5 * (hash(Math.floor(u * 5), Math.floor(y * 7), 7111 + i) - 0.5) * 2;
      const g = hash(X, Y, 7112);
      let c: string = w > 1.45 ? FOAM[g > 0.5 ? 3 : 2] : w > 1.0 ? (g > 0.55 ? FOAM[1] : WATER[5]) : w > 0.3 ? WATER[3] : w > -0.6 ? WATER[2] : w > -1.3 ? WATER[1] : WATER[0];
      // its front: a churning wall of foam
      const fromFront = front - d;
      if (front < len && fromFront < 0.9) c = fromFront < 0.35 || g > fromFront ? FOAM[g > 0.4 ? 3 : 2] : FOAM[1];
      // its tail draining: thin, broken, the wet floor showing
      const fromTail = d - tail;
      if (tail > 0 && fromTail < 1.2 && g > fromTail / 1.2) c = WET[g > 0.7 ? 1 : 0];
      // foam lipping the ledges' edges, and round him
      if (edge < 0.18 && g > 0.35) c = FOAM[edge < 0.08 ? 2 : 1];
      if (ring < 1.5 && g > (ring - 1.15) / 0.35) c = FOAM[ring < 1.3 ? 3 : 2];
      px.set(X, Y, c);
    }
  }
  // spray thrown up off its front, and where it hits the drain
  lanes.forEach((L, i) => {
    const [tail, front] = spans[i];
    if (front <= tail) return;
    const sf = m - SLUICE_HIT - i * FLOOD.stagger;
    for (let j = 0; j < 60; j++) {
      const ys = L.y + (hash(i, j, 7121) - 0.5) * 2 * L.half;
      const life = 0.3;
      const age = ((sf + hash(i, j, 7122) * life) % life) / life;
      const atFront = front < len;
      const d = atFront ? front - 0.2 + age * 0.6 : len - 0.1 - age * 0.3;
      if (sf > FLOOD.runs) continue;
      const up = (atFront ? 26 : 18) * Math.sin(Math.PI * age) * (0.5 + hash(i, j, 7123));
      const [x, y] = at(-half + d, ys, up);
      dot(x, y, age < 0.5 ? FOAM[3] : FOAM[1]);
      if (age < 0.4) dot(x + 1, y, FOAM[2]);
    }
    // THE RATS IN IT, tumbling: loosed from the gates through the flood, a crowd of them at its front
    const N = 18;
    for (let k = 0; k < N; k++) {
      const rel = k < 4 ? 0.02 * k : (FLOOD.runs - 0.4) * ((k - 4 + hash(i, k, 7131)) / (N - 4));
      const age = sf - rel;
      if (age < 0) continue;
      const dd = k < 4 ? Math.min(front - 0.4 - 0.5 * k, FLOOD.rats * age + (len - 1) * cl01(age / 0.2)) : FLOOD.rats * age;
      if (dd < tail + 0.3 || dd > front - 0.2 || dd > len - 0.4) continue;
      const side = (hash(i, k, 7132) - 0.5) * 1.6 * (L.half - 0.4) + Math.sin(age * 5 + k) * 0.25;
      const [x, y] = at(-half + dd, L.y + side, 2 + 2 * Math.sin(age * 9 + k));
      const spin = age * (6 + 4 * hash(i, k, 7133)) * (hash(i, k, 7134) > 0.5 ? 1 : -1) + k;
      // (the water broken white round it)
      for (let a = 0; a < 16; a++) dot(x + Math.cos(a * 0.4) * 17, y + 4 + Math.sin(a * 0.4) * 6, FOAM[hash(k, a, 7135) > 0.4 ? 3 : 2]);
      paintRat(px, x, y, Math.atan2(16, 32) + 0.9 * Math.sin(spin), 2.0, Math.cos(spin) < -0.2, k, true);
    }
  });
}

/**
 * A SLUICE GATE in the cistern's wall at x = -half, before lane `L`: its arch of wet brick, the dark of the culvert behind, the iron gate
 * (bars and cross-straps, rusted) lifted `up` of the way; under it, as it grinds open, water spurting; once burst, the flood pouring
 * out over the sill. `m` seconds into the summons.
 */
export function paintGate(px: Px, I: Iso, L: Lane, i: number, m: number, half: number = CISTERN.half): void {
  const at = isoAt(I);
  const dot = pen(px);
  const up = gateUp(m, i);
  const H = 64;
  const w = L.half - 0.15;
  const s = m - SLUICE_HIT - i * FLOOD.stagger;
  const pouring = s > 0 && s < FLOOD.runs + 0.3;
  for (let q = -w; q <= w; q += 1 / 32) {
    const y = L.y + q;
    const top = H - 18 * (1 - Math.sqrt(Math.max(0, 1 - (q / w) ** 2)));
    const [X, Y0] = at(-half, y);
    for (let z = 0; z <= top; z++) {
      const Y = Y0 - z;
      // the arch's edge of dressed stone
      if (top - z < 3 || w - Math.abs(q) < 0.1) {
        dot(X, Y, top - z < 1.5 || w - Math.abs(q) < 0.04 ? '#6e6d70' : '#45454c');
        continue;
      }
      let c = z < 8 ? '#0b1110' : '#06070a';
      // the gate: bars every 0.28 tiles, two straps across, rust, lifted `up` of the way
      const lift = up * (top - 6);
      const gz = z - lift;
      if (gz >= 0 && gz <= top - 6) {
        const bar = Math.abs(((q + w) % 0.28) - 0.14) < 0.045;
        const strap = Math.abs(gz - 12) < 2.5 || Math.abs(gz - (top - 14)) < 2.5;
        if (bar || strap) c = strap ? (Math.abs(gz - 12) < 1 ? '#45454d' : '#2a2b33') : hash(Math.round(q * 32), z, 7141) > 0.85 ? '#5c3624' : '#2a2b33';
      }
      // under it, water: spurting as it grinds, pouring once it bursts
      const gap = up * (top - 6);
      if (z < gap && !(gz >= 0 && gz <= top - 6 && c !== '#06070a' && c !== '#0b1110')) {
        const col = Math.floor((q + w) * 16);
        const w2 = hash(col, Math.floor((z + m * 220 + hash(col, 1, 7148) * 40) / 7), 7142) + 0.35 * Math.sin(col * 1.7);
        c = w2 > 0.95 ? FOAM[3] : w2 > 0.7 ? FOAM[2] : w2 > 0.45 ? WATER[4] : w2 > 0.2 ? WATER[3] : WATER[1];
      }
      dot(X, Y, c);
    }
  }
  // spurts under the gate as it grinds open: jets of white out over the floor
  if (m > SLUICE.gates && s < 0) {
    for (let j = 0; j < 18; j++) {
      const q = (hash(i, j, 7143) - 0.5) * 2 * w;
      const age = ((m * 3 + hash(i, j, 7144)) % 1);
      const [x, y] = at(-half + 0.2 + age * 1.2, L.y + q, 10 * Math.sin(Math.PI * age) + 2);
      dot(x, y, age < 0.5 ? FOAM[3] : FOAM[1]);
    }
  }
  // the flood pouring out over the sill, falling white
  if (pouring) {
    for (let j = 0; j < 40; j++) {
      const q = (hash(i, j, 7145) - 0.5) * 2 * w;
      const age = ((m * 4 + hash(i, j, 7146)) % 1);
      const [x, y] = at(-half + 0.15 + age * 0.9, L.y + q, 22 * (1 - age) * (0.6 + 0.4 * hash(i, j, 7147)));
      dot(x, y, age < 0.5 ? FOAM[3] : FOAM[2]);
      dot(x, y + 1, FOAM[1]);
    }
  }
}

// =============================================================================================
// THE BITE'S WEDGE

/** THE WEDGE before him (`aim` his way on the floor, radians; `B` his floor point), `m` seconds into the bite: marked while held; torn where the jaws snap. */
export function paintWedge(px: Px, at: At, m: number, B: readonly [number, number], aim: number): void {
  const dot = pen(px);
  const half = ((BITE9.arc / 2) * Math.PI) / 180;
  const P = (r: number, a: number): [number, number] => at(B[0] + Math.cos(aim + a) * r, B[1] + Math.sin(aim + a) * r);
  if (m > BITE9.mark && m < BITE9.hit) {
    const k = sm((m - BITE9.mark) / 0.2);
    const on = beat(m, BITE9.mark, BITE9.hit);
    for (let i = 0; i <= 200; i++) {
      if (i % 6 >= 4) continue;
      const a = -half + (2 * half * i) / 200;
      if (Math.abs(a) > half * k) continue;
      for (const r of [BITE9.reach, BITE9.near]) {
        const [x, y] = P(r, a);
        dot(x, y, on ? PINK[2] : PINK[1]);
        dot(x + 1, y, PINK[1]);
        dot(x, y + 1, PINK[0]);
      }
    }
    for (const sd of [-1, 1]) for (let r = BITE9.near; r <= BITE9.reach; r += 0.05) {
      if (Math.round(r * 20) % 6 >= 4 || k < 0.98) continue;
      const [x, y] = P(r, sd * half);
      dot(x, y, on ? PINK[2] : PINK[1]);
      dot(x, y + 1, PINK[0]);
    }
    for (let i = 0; i < 320 * k; i++) {
      const a = (hash(i, 1, 7151) - 0.5) * 2 * half * k;
      const r = BITE9.near + 0.1 + (BITE9.reach - BITE9.near - 0.2) * Math.sqrt(hash(i, 2, 7151));
      const [x, y] = P(r, a);
      if ((Math.round(x) + Math.round(y)) % 2) continue;
      dot(x, y, on ? PINK[1] : PINK[0]);
    }
  }
  // THE SNAP: the wedge flashes; where each jaw struck, the floor scored (three pairs of tooth-marks), dust thrown
  const s = m - BITE9.hit;
  if (s >= 0 && s < 0.8) {
    if (s < 0.1) {
      for (let i = 0; i < 500; i++) {
        const a = (hash(i, 3, 7152) - 0.5) * 2 * half;
        const r = BITE9.near + (BITE9.reach - BITE9.near) * Math.sqrt(hash(i, 4, 7152));
        const [x, y] = P(r, a);
        dot(x, y, hash(i, 5, 7152) > 0.6 ? '#fff0f4' : PINK[2]);
      }
    }
    for (const a of [-50, 0, 50]) {
      const ar = (a * Math.PI) / 180;
      for (let t = 0; t < 3; t++) {
        for (let r = BITE9.reach - 0.55; r <= BITE9.reach - 0.05; r += 0.03) {
          const [x, y] = P(r, ar + (t - 1) * 0.06);
          if (s < 0.6 || (Math.round(r * 33) + t) % 2) dot(x, y, s < 0.25 ? FLAME[3] : '#3a2a26');
        }
      }
      for (let j = 0; j < 14; j++) {
        const q = cl01(s / 0.4);
        if (q >= 1) continue;
        const da = (hash(j, a, 7153) - 0.5) * 1.2;
        const [x, y] = at(B[0] + Math.cos(aim + ar + da * 0.3) * (BITE9.reach - 0.2 + q * 0.6), B[1] + Math.sin(aim + ar + da * 0.3) * (BITE9.reach - 0.2 + q * 0.6), 14 * Math.sin(Math.PI * q) * hash(j, 1, 7153));
        dot(x, y, '#8a7a68');
      }
    }
  }
}

// =============================================================================================
// STOLEN WORDS

/** The four stolen words (the game's own: art/rat_king_shots.ts StolenWord). */
export type Word = 'fire' | 'frost' | 'lightning' | 'poison';
/** THE WORD'S LINE on the floor from (x0, y0) along to (x1, y1), `m` seconds into the move: following you (dashed, two lines), then LOCKED at WORDS9.lock (solid, bright, its end ringed where it bursts). */
export function paintWordLine(px: Px, at: At, x0: number, y0: number, x1: number, y1: number, m: number): void {
  if (m < WORDS9.aim || m >= WORDS9.hit) return;
  const dot = pen(px);
  const len = Math.hypot(x1 - x0, y1 - y0) || 1;
  const fx = (x1 - x0) / len;
  const fy = (y1 - y0) / len;
  const k = sm((m - WORDS9.aim) / 0.25);
  const locked = m >= WORDS9.lock;
  const on = beat(m, WORDS9.aim, WORDS9.hit);
  const run = (m * 4) % 1;
  for (let d = 0.3; d <= len * k; d += 0.03) {
    const i = Math.round(d * 33);
    for (const sd of [-1, 1]) {
      if (!locked && (i + Math.floor(run * 8)) % 8 >= 5) continue;
      const [x, y] = at(x0 + fx * d - fy * sd * 0.3, y0 + fy * d + fx * sd * 0.3);
      dot(x, y, locked ? (on ? '#fff0f4' : PINK[2]) : on ? PINK[2] : PINK[1]);
      dot(x + 1, y, locked ? PINK[2] : PINK[1]);
      dot(x, y + 1, PINK[1]);
      dot(x + 1, y + 1, PINK[0]);
    }
    // (between them hatched; solid down its middle once it is locked)
    if (i % 3 === 0) {
      const s0 = (hash(i, 1, 7163) - 0.5) * 0.5;
      const [x, y] = at(x0 + fx * d - fy * s0, y0 + fy * d + fx * s0);
      dot(x, y, locked ? PINK[1] : PINK[0]);
    }
    if (locked) {
      const [x, y] = at(x0 + fx * d, y0 + fy * d);
      dot(x, y, on ? PINK[2] : PINK[1]);
    }
  }
  if (locked) {
    // (where it will burst, its ring)
    for (let a = 0; a < TAU; a += 0.03) {
      const [x, y] = at(x1 + Math.cos(a) * WORDS9.burst, y1 + Math.sin(a) * WORDS9.burst);
      if (Math.round(a * 30) % 5 >= 3) continue;
      dot(x, y, on ? PINK[2] : PINK[1]);
      dot(x, y + 1, PINK[0]);
    }
  }
}
/** A blob of whole pixels. */
function blob(dot: (x: number, y: number, c: string) => void, x: number, y: number, rx: number, ry: number, cin: string, cout: string, hi?: string): void {
  for (let j = -Math.ceil(ry); j <= Math.ceil(ry); j++) for (let i = -Math.ceil(rx); i <= Math.ceil(rx); i++) {
    const e = (i / rx) ** 2 + (j / ry) ** 2;
    if (e > 1) continue;
    dot(x + i, y + j, hi && i + j < -(rx + ry) * 0.35 ? hi : e > 0.55 ? cout : cin);
  }
}
/**
 * THE WORD IN FLIGHT, `t` seconds after it leaves his mouth at floor point (x0, y0) `rise` picture pixels up, toward (x1, y1), at
 * WORDS9.speed; false once it is there. Twice the size of the game's own, in its shape: fire a teardrop of the enemy's flame
 * streaming embers; frost a cluster of spinning shards of pink ice; lightning a forked bolt jumping ahead; poison a swollen gob
 * dripping. Its smear behind it.
 */
export function paintWord(px: Px, at: At, kind: Word, x0: number, y0: number, rise: number, x1: number, y1: number, t: number): boolean {
  const len = Math.hypot(x1 - x0, y1 - y0) || 1;
  const long = len / WORDS9.speed;
  if (t < 0 || t >= long) return false;
  const dot = pen(px);
  const u = t / long;
  const P = (q: number): [number, number] => at(x0 + (x1 - x0) * q, y0 + (y1 - y0) * q, rise * (1 - q) + 8 * q);
  const [sx, sy] = P(u);
  const [bx, by] = P(Math.max(0, u - 0.06));
  const dir = Math.atan2(sy - by, sx - bx);
  const cx = Math.cos(dir);
  const cy = Math.sin(dir);
  // its streak behind it, along the way it came
  for (let i = 1; i < 26; i++) {
    const q = u - (i / 25) * Math.min(u, 0.16);
    const [x, y] = P(q);
    if (i > 14 && i % 2) continue;
    dot(x, y, i < 6 ? FLAME[3] : i < 14 ? FLAME[2] : FLAME[1]);
    if (i < 10) dot(x, y + 1, FLAME[1]);
  }
  // its shadow on the floor under it
  const [fx2, fy2] = at(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u);
  for (let i = -7; i <= 7; i++) dot(fx2 + i, fy2 + (Math.abs(i) > 5 ? 0 : 1), INK);
  if (kind === 'fire') {
    for (let i = 12; i >= 0; i--) {
      const r = 7 - i * 0.5;
      blob(dot, sx - cx * i * 2.6, sy - cy * i * 2.6 + Math.sin(t * 40 + i) * 0.8, Math.max(1, r), Math.max(1, r * 0.75), i < 2 ? FLAME[4] : i < 5 ? FLAME[3] : i < 9 ? FLAME[2] : FLAME[1], i < 5 ? FLAME[2] : FLAME[1]);
    }
    for (let i = 0; i < 10; i++) dot(sx - cx * (22 + i * 5) + (hash(i, Math.floor(t * 20), 7161) - 0.5) * 10, sy - cy * (22 + i * 5) + (hash(i, 1, 7161) - 0.5) * 10, FLAME[i % 2 ? 2 : 3]);
  } else if (kind === 'frost') {
    for (let i = 0; i < 6; i++) {
      const a = t * 14 + (i / 6) * TAU;
      const ox = Math.cos(a) * 8;
      const oy = Math.sin(a) * 4;
      for (let k = -6; k <= 6; k++) {
        const c = Math.abs(k) === 6 ? FLAME[3] : Math.abs(k) < 2 ? FLAME[4] : FLAME[2];
        dot(sx + ox + cx * k, sy + oy + cy * k, c);
        if (Math.abs(k) < 4) dot(sx + ox + cx * k, sy + oy + cy * k + 1, FLAME[1]);
      }
    }
    blob(dot, sx, sy, 3, 2.5, FLAME[4], FLAME[3]);
  } else if (kind === 'lightning') {
    let lx = sx;
    let ly = sy;
    for (let i = 0; i < 9; i++) {
      const nx = lx - cx * 7 + (hash(i, Math.floor(t * 30), 7162) - 0.5) * 11;
      const ny = ly - cy * 7 + (hash(i, Math.floor(t * 30) + 7, 7162) - 0.5) * 11;
      for (let k = 0; k <= 7; k++) {
        const x = lx + ((nx - lx) * k) / 7;
        const y = ly + ((ny - ly) * k) / 7;
        dot(x, y, i < 3 ? FLAME[4] : FLAME[3]);
        dot(x + 1, y, i < 3 ? FLAME[3] : FLAME[2]);
      }
      if (i === 2 || i === 5) for (let k = 0; k <= 8; k++) dot(nx + k * 1.6, ny + k * (i === 2 ? 1 : -1), FLAME[2]);
      lx = nx;
      ly = ny;
    }
    blob(dot, sx, sy, 4, 3.5, FLAME[4], FLAME[3]);
  } else {
    blob(dot, sx, sy, 9, 7, FLAME[2], FLAME[1], FLAME[3]);
    blob(dot, sx - 3, sy - 3, 3, 2, FLAME[4], FLAME[3]);
    for (let i = 1; i < 9; i++) blob(dot, sx - cx * i * 6, sy - cy * i * 6 + i * 1.8, 2, 2, FLAME[i % 2 ? 1 : 2], FLAME[1]);
  }
  return true;
}
/** WHERE IT BURSTS, `q` seconds after, at (x, y): a ring out to WORDS9.burst tiles (twice the old), each word its own way (fire flames up round it, frost a star of shards, lightning forks, poison a splash and a pool), its heart burning and fading. */
export function paintWordBurst(px: Px, at: At, kind: Word, x: number, y: number, q0: number): void {
  if (q0 < 0 || q0 >= WORDS9.burstFor) return;
  const dot = pen(px);
  const q = q0 / WORDS9.burstFor;
  const R = WORDS9.burst * (0.25 + 0.75 * Math.sqrt(Math.min(1, q * 2.2)));
  const n = 72;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const r = kind === 'frost' ? R * (i % 3 ? 1 : 0.6) : kind === 'lightning' ? R * (0.65 + 0.35 * hash(i, Math.floor(q0 * 30), 7171)) : R;
    const up = kind === 'fire' ? 18 * Math.sin(q * Math.PI) * hash(i, 1, 7171) : kind === 'poison' ? 12 * 4 * q * (1 - q) * hash(i, 2, 7171) : 0;
    if (hash(i, 9, 7171) < q * 0.9) continue;
    const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r, up);
    const c = q < 0.3 ? FLAME[4] : q < 0.6 ? FLAME[3] : FLAME[2];
    dot(sx, sy, c);
    dot(sx + 1, sy, c);
    dot(sx - 1, sy, FLAME[2]);
    dot(sx, sy + 1, FLAME[2]);
    dot(sx + 1, sy + 1, FLAME[1]);
    dot(sx, sy - 1, FLAME[2]);
    if (kind === 'fire' && up > 6) dot(sx, sy + 2, FLAME[2]);
  }
  // inside: scorched, shards, forks or the pool, thinning
  for (let i = 0; i < 700 * (1 - q); i++) {
    const a = hash(i, 4, 7172) * TAU;
    const r = R * Math.sqrt(hash(i, 5, 7172));
    const [sx, sy] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
    dot(sx, sy, kind === 'poison' ? (hash(i, 6, 7172) > 0.5 ? FLAME[2] : FLAME[1]) : hash(i, 6, 7172) > 0.7 ? FLAME[3] : FLAME[1]);
  }
  const [cx, cy] = at(x, y, 4);
  if (q < 0.7) blob(dot, cx, cy, 16 * (1 - q), 10 * (1 - q), q < 0.4 ? FLAME[4] : FLAME[3], FLAME[2]);
}

// =============================================================================================
// UNKNOT: THE BURST, AND THE SWARM

/** THE RING OF RATS BURSTING OUT round his floor point `B`, `s` seconds after the burst: a ring of dust and flung grit racing out to UNKNOT9.ring tiles, lines of their going. */
export function paintBurstRing(px: Px, at: At, B: readonly [number, number], s: number): void {
  if (s < 0 || s > 0.6) return;
  const dot = pen(px);
  const q = cl01(s / 0.15);
  const R = 0.8 + (UNKNOT9.ring - 0.8) * Math.sqrt(q);
  const fade = 1 - cl01((s - 0.15) / 0.45);
  for (let i = 0; i < 160; i++) {
    const a = (i / 160) * TAU;
    if (hash(i, 1, 7181) > fade) continue;
    const r = R + (hash(i, 2, 7181) - 0.5) * 0.25;
    const [x, y] = at(B[0] + Math.cos(a) * r, B[1] + Math.sin(a) * r, 4 * hash(i, 3, 7181) * fade);
    dot(x, y, s < 0.1 ? '#f0e4d8' : '#8a7a68');
    if (i % 2) dot(x + 1, y, '#5e5248');
  }
  // the lines of their going, out from the heap
  if (s < 0.25) for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU + hash(i, 4, 7181) * 0.2;
    for (let r = 1.0; r < R; r += 0.05) {
      if (Math.round(r * 20) % 3 === 0) continue;
      const [x, y] = at(B[0] + Math.cos(a) * r, B[1] + Math.sin(a) * r);
      dot(x, y, r > R - 0.4 ? PINK[2] : PINK[0]);
    }
  }
}
/** THE SWARM'S NUMBERS: `rats` (old 18) running from where he burst to where he knots again in `for` seconds (old 0.9), `half` tiles to either side of its line (old 1.0 across... 0.8), each up to `late` seconds late, at 0.75 to 1 of its pace. */
export const SWARM9 = { rats: 36, for: 1.0, half: 1.5, late: 0.3 } as const;
/** Where the swarm's stream has come along its way (0 to 1), `tau` seconds from when they burst away: its back and its front. */
export function swarm9Span(tau: number): [number, number] {
  const run = SWARM9.for - SWARM9.late;
  return [cl01((tau - SWARM9.late) / run), cl01(tau / (run * 0.75))];
}
/** THE SWARM: SWARM9.rats rats running from (x0, y0) to (x1, y1) (tiles), `tau` seconds since they burst away, each its own path and pace, all there by SWARM9.for; their pink eyes; dust behind them. */
export function paintSwarm9(px: Px, at: At, x0: number, y0: number, x1: number, y1: number, tau: number): void {
  if (tau < 0 || tau >= SWARM9.for) return;
  const dot = pen(px);
  const dx = x1 - x0;
  const dy = y1 - y0;
  const d = Math.hypot(dx, dy) || 1;
  const nx = -dy / d;
  const ny = dx / d;
  const [ax, ay] = at(x0, y0);
  const [bx, by] = at(x1, y1);
  const ang = Math.atan2((by - ay) / 0.6, bx - ax);
  for (let i = 0; i < SWARM9.rats; i++) {
    const delay = hash(i, 0, 7191) * SWARM9.late;
    const pace = 0.75 + 0.25 * hash(i, 1, 7191);
    const q = cl01((tau - delay) / ((SWARM9.for - SWARM9.late) * pace));
    if (q <= 0 || q >= 1) continue;
    const side = (hash(i, 2, 7191) - 0.5) * 2 * SWARM9.half * Math.sin(Math.min(1, q * 1.4) * Math.PI * 0.5 + (q > 0.7 ? (q - 0.7) * 3 : 0)) * (q > 0.75 ? (1 - q) * 4 : 1);
    const wig = Math.sin(q * 34 + i) * 0.1;
    const [sx, sy] = at(x0 + dx * q + nx * (side + wig), y0 + dy * q + ny * (side + wig));
    // dust kicked up behind
    for (let k = 1; k < 4; k++) dot(sx - Math.cos(ang) * (10 + k * 4), sy - Math.sin(ang) * 0.6 * (10 + k * 4) + (hash(i, k, 7192) - 0.5) * 3, '#5e5248');
    paintRat(px, sx, sy, ang + Math.sin(q * 20 + i) * 0.25, 1.75, false, i, false, PINK[0]);
  }
}
