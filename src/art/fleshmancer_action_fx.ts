// WHAT THE FLESHMANCER SENDS OUT, DONE THE ACTION WAY (the art chat's helper, 1 Nov 2026; docs/mockups/action_f5_fleshmancer). A
// MOCK-UP: NOTHING OF THE GAME IMPORTS IT, and it is behind FLESH_ACTION (art/fleshmancer_action.ts), off. Under the owner's Movement
// 9 and his rule for the enemies (28 Oct): “Start from now on, but every enemy is going to need that change eventually.  And bigger
// AOE to compensate for the extra time the player gets to evade”; and his rulebook's Monsters 9 (bosses fill the arena with things
// to dance around).
//
//   THE SHARDS (SHARDS): bone dragged up out of the floor before him into a fan hanging in the air, each shard pointed along its way,
//     pink-lit, trembling, its lane marked on the floor in his pink; flung at his hammer, fast, a streak of fire behind each; a second
//     fan in the first one's gaps.
//   THE RINGS (RINGS): five rings of cracks lit pink in the floor round him, out to his lair's walls, their gaps dark, every other
//     ring hot first; the hands of his dead (the game's own, art/fleshmancer.ts makeRingHandArt) burst up out of them at his slams.
//   THE FIRE (FIRE): the stream out of the skull's jaws down onto the floor and along it out to his lair's walls, whipped round once
//     and more; the floor left burning in lanes where it gouted (as the cultist's sigil burns on: art/action_f2_fx.ts).
//   THE DEAD (RAISE): the bone heaps shaking and lit from under while he summons; bone and grave dirt thrown as the dead burst up.
//   THE TELEPORT (PIT, RISE_MARK): the pit of his dead under him as he is yanked down; where he will rise, a ring of his pink fire
//     on the floor, filling in; the burst as he erupts, out to the ring.
// Each is painted onto a picture through `at` (a floor point, tiles, and a height, picture pixels, to the picture), in picture
// pixels as the figures are, every pixel whole; `keep` says which of it to paint (by how far down the picture its floor point is),
// so that what stands up off the floor is laid in among the figures by their floor points.

import { Px } from '../engine/px';
import { FLAME } from './mkit';
import { hash } from './kit';
import { FIRE_HIT, FIRE_STOP, MINI_HIT, MINI_STOP, MINI_WHIP, RAISE_HIT, RAISE_HOLD, RING_HITS, SHARD_DRAW, SHARD_HITS, WHIP, fireWay, miniWay, f } from './fleshmancer_action';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (u: number): number => {
  const k = clamp01(u);
  return k * k * (3 - 2 * k);
};
const TAU = Math.PI * 2;
/** A white hotter than his gold: the heart of a flame, a shard's newest after-image. */
const WHITE = '#fff6e0';
/** Bone: lit, middle, shade, deep (his staff's warm ivory). */
const BONE = ['#f2e8d4', '#d6c4a2', '#a48a6e', '#6a5450'] as const;
/** The floor's cracks, dark; scorched stone. */
const INK = '#0b0710';
const CHAR = ['#170b14', '#26121c', '#3a1a24'] as const;
/** Grave dirt and his dead's flesh (never blood: a dark plum knotted with bone, as his robes). */
const DIRT = ['#1e1612', '#34261e', '#4e3a2c'] as const;
const FLESH = ['#1c0a1e', '#36123a', '#5a1e52', '#82306e'] as const;

/** Where a floor point (tiles from the scene's middle) and a height over it (picture pixels) is on the picture. */
export type At = (x: number, y: number, z?: number) => readonly [number, number];
/** Which of a picture's things to paint, by the picture row of its floor point. */
export type Keep = (floorY: number) => boolean;
const ALL: Keep = () => true;
const dot = (p: Px, x: number, y: number, c: string, size = 1): void => {
  const X = Math.round(x);
  const Y = Math.round(y);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) p.set(X + i - (size >> 1), Y + j - (size >> 1), c);
};
const line = (p: Px, x0: number, y0: number, x1: number, y1: number, c: (u: number) => string | null, size = 1): void => {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const col = c(u);
    if (col) dot(p, x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, col, size);
  }
};
/** A tongue of flame standing on the picture at (x, y): `tall` and `wide` pixels, its tip swaying by `lean`; `hot`, how far its heart goes white. */
function tongue(p: Px, x: number, y: number, tall: number, wide: number, lean: number, hot: number, seed: number): void {
  if (tall < 2 || wide < 1) return;
  const shells: [number, string][] = [[1, FLAME[1]], [0.78, FLAME[2]], [0.56, FLAME[3]], [0.34, FLAME[4]]];
  if (hot > 0) shells.push([0.16 + 0.12 * hot, WHITE]);
  for (const [s, c] of shells) {
    const rows = Math.max(1, Math.round(tall * (s === 1 ? 1 : 0.35 + 0.65 * s)));
    for (let i = 0; i < rows; i++) {
      const u = i / Math.max(1, rows - 1);
      const prof = u < 0.2 ? Math.sqrt(1 - ((0.2 - u) / 0.2) ** 2 * 0.6) : Math.pow(1 - (u - 0.2) / 0.8, 1.3);
      const hw = Math.max(0.5, (wide / 2) * s * prof);
      const mid = x + lean * u * u * (tall / 30) + Math.sin(u * 5 + seed) * 0.6 * u;
      const y0 = Math.round(y - i - (s < 1 ? Math.round((1 - s) * tall * 0.08) : 0));
      for (let X = Math.round(mid - hw); X < Math.max(Math.round(mid - hw) + 1, Math.round(mid + hw)); X++) p.set(X, y0, c);
    }
  }
}
/** The way he faces on the floor and the way his left is, seen `view` (tiles): from in front, down the picture to the right; from behind, up it. */
export const facing = (view: 'front' | 'back'): { ahead: [number, number]; left: [number, number] } => (view === 'front' ? { ahead: [1, 0], left: [0, -1] } : { ahead: [0, -1], left: [-1, 0] });
/** The floor way `a` radians to the left of a way he faces at `aim` radians (on the floor's own axes). */
const way = (aim: number, a: number): [number, number] => [Math.cos(aim + a), Math.sin(aim + a)];

// =============================================================================================
// THE SHARDS

/**
 * ITS NUMBERS. Two fans: the first of `fan[0]`, `apart` degrees from each other (old: 7, 12 degrees apart, 72 across); the second of
 * `fan[1]` in the first one's gaps (half `apart` off). Each hangs `hang.r` tiles out from his middle along its way, `hang.z` up (his
 * chest), drawn up out of the floor over SHARD_DRAW; flies at its fan's hit at `speed` tiles a second (old 9) for `reach` tiles (old
 * 9); strikes a hero within `r` of it. Its lane is marked on the floor out to `lane` tiles while it hangs.
 */
export const SHARDS = { fan: [9, 8] as const, apart: 12, hang: { r: 1.6, z: 40 }, speed: 15, reach: 10, r: 0.3, lane: 6.5, burst: 0.35 } as const;
/** A shard, `t` seconds into his shards, the fan aimed along `aim` (radians, on the floor): where it is (tiles from his middle, and up), the way it points, what it is doing. */
export interface ShardNow {
  x: number;
  y: number;
  z: number;
  a: number;
  state: 'rising' | 'hanging' | 'flying' | 'burst';
  k: number;
  fan: number;
}
export function shardAngles(fan: number): number[] {
  const n = SHARDS.fan[fan];
  return Array.from({ length: n }, (_, j) => ((j - (n - 1) / 2) * SHARDS.apart * Math.PI) / 180);
}
export function shardsAt(t: number, aim: number): ShardNow[] {
  const out: ShardNow[] = [];
  for (let fan = 0; fan < 2; fan++) {
    const [d0, d1] = SHARD_DRAW[fan];
    const hit = SHARD_HITS[fan];
    shardAngles(fan).forEach((da, j) => {
      const a = aim + da;
      const [ux, uy] = [Math.cos(a), Math.sin(a)];
      // (each drawn up a little after the one beside it, from the middle out)
      const lag = Math.abs(j - (SHARDS.fan[fan] - 1) / 2) * 0.012;
      const rise = (t - d0 - lag) / (d1 - d0 - 0.06);
      if (rise <= 0) return;
      const hr = SHARDS.hang.r;
      if (t < hit) {
        const k = smooth(rise);
        // (up out of the floor where it will hang, turning from upright to its way)
        out.push({ x: ux * hr, y: uy * hr, z: SHARDS.hang.z * (1 - (1 - k) ** 2), a, state: rise < 1 ? 'rising' : 'hanging', k, fan });
        return;
      }
      const d = hr + SHARDS.speed * (t - hit);
      const end = SHARDS.reach;
      if (d < end) out.push({ x: ux * d, y: uy * d, z: SHARDS.hang.z - (SHARDS.hang.z - 10) * clamp01((d - hr) / 3), a, state: 'flying', k: (d - hr) / (end - hr), fan });
      else {
        const tb = t - hit - (end - hr) / SHARDS.speed;
        if (tb < SHARDS.burst) out.push({ x: ux * end, y: uy * end, z: 10, a, state: 'burst', k: tb / SHARDS.burst, fan });
      }
    });
  }
  return out;
}
/** A shard on the picture: its point at (x, y), pointing along (ux, uy) on the picture; `big` its length's share; lit pink at `heat`. */
function shardPix(p: Px, x: number, y: number, ux: number, uy: number, big: number, heat: number, seed: number): void {
  const L = Math.round(30 * big);
  let nx = -uy;
  let ny = ux;
  // (its lit side: toward the upper left)
  if (nx + ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  for (let s = 0; s <= L; s++) {
    const u = s / L;
    const w = 3.4 * big * Math.pow(u, 0.62) * (u > 0.85 ? 1 - (u - 0.85) * 2.4 : 1);
    const cx = x - ux * s + nx * Math.sin(u * 3.1 + seed) * 0.6;
    const cy = y - uy * s + ny * Math.sin(u * 3.1 + seed) * 0.6;
    for (let o = -Math.ceil(w); o <= Math.ceil(w); o++) {
      if (Math.abs(o) > w + 0.35) continue;
      const lit = o / Math.max(1, w);
      const c = u < 0.08 ? BONE[0] : lit < -0.35 ? BONE[0] : lit < 0.3 ? BONE[1] : lit < 0.75 ? BONE[2] : heat > 0.3 ? FLAME[2] : BONE[3];
      dot(p, cx + nx * o, cy + ny * o, c);
    }
    // (its broken end glowing)
    if (u > 0.86) dot(p, cx, cy, heat > 0.5 ? FLAME[4] : FLAME[3]);
  }
}
/**
 * THE SHARDS, `t` seconds into his shards, aimed along `aim`, from his middle at `C` (tiles), painted `layer` 'floor' (their lanes and
 * shadows) or 'air' (the shards). `only`: that fan alone (the game aims each fan where the hero is as it is drawn up: the main chat's).
 */
export function paintShards(p: Px, at: At, t: number, C: readonly [number, number], aim: number, layer: 'floor' | 'air', keep: Keep = ALL, only = -1): void {
  const list = shardsAt(t, aim);
  for (const [i, s] of list.entries()) {
    if (only >= 0 && s.fan !== only) continue;
    const X = C[0] + s.x;
    const Y = C[1] + s.y;
    const [fx, fy] = at(X, Y);
    if (!keep(fy)) continue;
    const [ux, uy] = [Math.cos(s.a), Math.sin(s.a)];
    if (layer === 'floor') {
      if (s.state === 'hanging' || s.state === 'rising') {
        // ITS LANE, marked on the floor in his pink: dashes out along its way, pulsing faster as the hit comes
        const hit = SHARD_HITS[s.fan];
        const beat = 0.6 + 0.4 * Math.sin(t * (14 + 30 * clamp01(1 - (hit - t) / 0.5)) + i);
        const lit = s.k * beat;
        for (let d = SHARDS.hang.r + 0.2; d < SHARDS.lane; d += 0.05) {
          const on = Math.floor(d / 0.05) % 4 !== 0;
          if (!on) continue;
          const [x, y] = at(C[0] + ux * d, C[1] + uy * d);
          const far = d / SHARDS.lane;
          if (hash(Math.floor(d * 40), i, 551) < far * 0.4) continue;
          dot(p, x, y, lit > 0.75 ? FLAME[3] : lit > 0.45 ? FLAME[2] : lit > 0.2 ? FLAME[1] : CHAR[2], 2);
        }
        // (and the crack it was drawn up out of)
        if (s.state === 'rising') for (let k = -4; k <= 4; k++) dot(p, fx + k, fy + Math.round(Math.sin(k + i) * 0.8), Math.abs(k) < 2 ? FLAME[3] : INK);
      }
      if (s.state !== 'burst') {
        // its shadow, under it
        for (let k = -3; k <= 3; k++) dot(p, fx + k, fy, INK);
        for (let k = -2; k <= 2; k++) dot(p, fx + k, fy + 1, INK);
      }
      continue;
    }
    const [px, py] = at(X, Y, s.z);
    // (the way it points on the picture)
    const [ax, ay] = at(X + ux * 0.2, Y + uy * 0.2, s.z);
    let wx = ax - px;
    let wy = ay - py;
    if (s.state === 'rising') {
      // (drawn up point first, turning to its way as it comes up)
      const k = s.k;
      wx = wx * k;
      wy = wy * k - (1 - k) * 4;
    }
    const wl = Math.hypot(wx, wy) || 1;
    wx /= wl;
    wy /= wl;
    if (s.state === 'burst') {
      // BURST where it ends: a flash and chips of bone flung up
      const k = s.k;
      if (k < 0.3) for (let r = 0; r < 6 - 10 * k; r++) for (let a = 0; a < 8; a++) dot(p, px + Math.cos(a) * r * 1.4, py + Math.sin(a) * r * 0.8, r < 2 ? WHITE : FLAME[3]);
      for (let j = 0; j < 6; j++) {
        const th = hash(j, i, 552) * TAU;
        const sp = 14 + 18 * hash(j, i, 553);
        const z = 30 * k * (1 - k) * 4 * hash(j, i, 554);
        dot(p, px + Math.cos(th) * sp * k, py + Math.sin(th) * sp * k * 0.5 - z, j % 2 ? BONE[1] : BONE[2], 2);
      }
      continue;
    }
    if (s.state === 'flying') {
      // A STREAK OF FIRE BEHIND IT, and its after-images along the way it came
      const tail = 26 + 6 * Math.sin(t * 40 + i);
      for (let d = 6; d < tail; d++) {
        const u = d / tail;
        const c = u < 0.25 ? FLAME[4] : u < 0.5 ? FLAME[3] : u < 0.8 ? FLAME[2] : FLAME[1];
        const wob = Math.sin(d * 0.8 - t * 50 + i) * 0.8 * u;
        dot(p, px - wx * d - wy * wob, py - wy * d + wx * wob, c, u < 0.45 ? 2 : 1);
      }
    } else {
      // hanging: lit from round it by his pink, trembling
      const g = 0.5 + 0.5 * Math.sin(t * 23 + i * 1.7);
      for (let a = 0; a < 10; a++) {
        const th = (a / 10) * TAU + t * 3;
        if (hash(a, i + Math.floor(t * 12), 555) > 0.55) continue;
        dot(p, px - wx * 10 + Math.cos(th) * 11, py - wy * 10 + Math.sin(th) * 7, g > 0.5 ? FLAME[2] : FLAME[1]);
      }
    }
    const shake = s.state === 'hanging' ? Math.round(Math.sin(t * 41 + i * 2.3) * 0.7) : 0;
    shardPix(p, px + shake, py, wx, wy, s.state === 'rising' ? 0.6 + 0.4 * s.k : 1, 1, i);
  }
}

// =============================================================================================
// THE RINGS

/**
 * ITS NUMBERS. Five rings round him (`radii`, tiles; old: three, 1.5, 2.9 and 4.3), a hand of his dead every `apart` tiles round each
 * (old: 8, 14 and 20 hands), and two gaps in each, opposite each other, each `gapHands` hands wide, every ring's turned on from the
 * last (`turn` radians) so that the way out winds. The rings `first` burst up at his first slam (RING_HITS[0]), the others at his
 * second (RING_HITS[1]), each ring a frame after the one inside it; a hand strikes a hero within `r` of it as it comes up (the
 * game's `grab`). Their cracks light from `lit` (seconds into the move).
 */
export const RINGS = { radii: [1.4, 2.6, 3.8, 5.0, 6.2] as const, apart: 0.62, gapHands: 3, turn: 1.15, first: [0, 2, 4] as const, r: 0.5, lit: f(6), ripple: f(1) } as const;
/** When a ring's hands burst up (seconds into the move). */
export const ringBurst = (i: number): number => ((RINGS.first as readonly number[]).includes(i) ? RING_HITS[0] : RING_HITS[1]) + Math.floor(i / 2) * RINGS.ripple;
/** A ring's hands: how many round it, which are left out (its gaps), and where each is (radians round, from the way he faces). */
export function ringHands(i: number): { n: number; hands: { j: number; a: number }[]; gaps: number[] } {
  const r = RINGS.radii[i];
  const n = Math.round((TAU * r) / RINGS.apart);
  const g0 = (i * RINGS.turn + 0.6) % TAU;
  const gaps = [g0, g0 + Math.PI];
  const step = TAU / n;
  const hands: { j: number; a: number }[] = [];
  for (let j = 0; j < n; j++) {
    const a = j * step;
    const inGap = gaps.some((g) => Math.abs(((a - g + Math.PI * 3) % TAU) - Math.PI) < (RINGS.gapHands * step) / 2);
    if (!inGap) hands.push({ j, a });
  }
  return { n, hands, gaps };
}
/** Whether a hero at (x, y) tiles from his middle is struck by ring `i` as it bursts up. */
export function ringStrikes(i: number, x: number, y: number, aim = 0): boolean {
  const r = RINGS.radii[i];
  return ringHands(i).hands.some(({ a }) => Math.hypot(x - Math.cos(aim + a) * r, y - Math.sin(aim + a) * r) <= RINGS.r);
}
/** THE RINGS' CRACKS IN THE FLOOR, `t` seconds into his rings, round his middle `C`, the move aimed along `aim`. */
export function paintRingCracks(p: Px, at: At, t: number, C: readonly [number, number], aim: number): void {
  if (t < RINGS.lit) return;
  RINGS.radii.forEach((r, i) => {
    const burst = ringBurst(i);
    const first = (RINGS.first as readonly number[]).includes(i);
    const since = t - burst;
    if (since > 1.6) return;
    // (how hot: lit from when he rises, the first slam's rings hot, the others dim until the first slam; dark once their hands are up, gone after)
    const up = smooth((t - RINGS.lit - i * 0.05) / 0.3);
    const pulse = 0.75 + 0.25 * Math.sin(t * (16 + 20 * clamp01(1 - Math.abs(burst - t) / 0.5)) + i);
    const heat = since >= 0 ? clamp01(1 - since / 0.25) : first || t > RING_HITS[0] ? up * pulse : 0.38 * up;
    const fade = since > 0.9 ? 1 - (since - 0.9) / 0.7 : 1;
    const { n, gaps } = ringHands(i);
    const step = TAU / n;
    const N = Math.max(120, Math.round(r * 230));
    for (let s = 0; s < N; s++) {
      const a = (s / N) * TAU;
      if (gaps.some((g) => Math.abs(((a - g + Math.PI * 3) % TAU) - Math.PI) < (RINGS.gapHands * step) / 2 + 0.02)) continue;
      // (its reach round: grown out from the side nearest him first)
      if (up < 1 && hash(s, i, 561) > up) continue;
      if (fade < 1 && hash(s, i, 562) > fade) continue;
      const jag = (hash(Math.floor(s / 3), i, 563) - 0.5) * 0.09;
      const rr = r + jag;
      const [x, y] = at(C[0] + Math.cos(aim + a) * rr, C[1] + Math.sin(aim + a) * rr);
      const core = heat > 0.85 ? FLAME[4] : heat > 0.6 ? FLAME[3] : heat > 0.3 ? FLAME[2] : heat > 0.12 ? FLAME[1] : INK;
      // (a crack two pixels wide, its heart his fire, lit up out of it, its lip dark)
      dot(p, x, y, core, 2);
      dot(p, x, y + 2, INK);
      if (heat > 0.3) dot(p, x, y - 1, heat > 0.6 ? FLAME[2] : FLAME[1]);
      if (heat > 0.6 && s % 3 === 0) dot(p, x, y - 2, FLAME[1]);
      // (short cracks branching off it)
      if (s % 11 === 0) {
        const out = hash(s, i, 564) > 0.5 ? 1 : -1;
        for (let k = 1; k < 6; k++) {
          const [bx, by] = at(C[0] + Math.cos(aim + a + 0.01 * k) * (rr + out * k * 0.035), C[1] + Math.sin(aim + a + 0.01 * k) * (rr + out * k * 0.035));
          dot(p, bx, by, k < 3 && heat > 0.3 ? FLAME[2] : INK);
        }
      }
    }
    // THE BURST: a flash of his fire round the ring as its hands come up
    if (since >= 0 && since < 0.2) {
      const k = since / 0.2;
      for (let s = 0; s < N; s += 2) {
        const a = (s / N) * TAU;
        if (hash(s, i, 565) < k) continue;
        const [x, y] = at(C[0] + Math.cos(aim + a) * r, C[1] + Math.sin(aim + a) * r, 2 + 8 * k);
        dot(p, x, y, k < 0.4 ? WHITE : FLAME[3]);
      }
    }
  });
}

// =============================================================================================
// THE FIRE

/**
 * ITS NUMBERS. The stream comes down `land` tiles from him (old 1.0) and runs on along the floor to `reach` (old 4.8), `half` to either
 * side of its way (old 0.45), whipped round (art/fleshmancer_action.ts WHIP: a turn and more in 1.2 s; old: once round in 3.3 s).
 * Every `every` radians of its turn it gouts, and leaves a LANE of the floor burning, `laneHalf` to either side of its way, from
 * `land` to `reach`, for `burn` seconds (dying back from its end over the last `die`), then scorched a while (`scorch`).
 */
export const FIRE = { land: 0.9, reach: 7.0, half: 0.5, every: (40 * Math.PI) / 180, laneHalf: 0.3, burn: 3.0, die: 0.8, scorch: 1.2 } as const;
/** The mini fleshmancer's, smaller (old: down 0.6 before him, on to 2.6, a third of the way round in 1.5 s, nothing left burning). */
export const MINI_FIRE = { land: 0.5, reach: 3.6, half: 0.38, every: (32 * Math.PI) / 180, laneHalf: 0.24, burn: 2.0, die: 0.6, scorch: 0.9 } as const;
export type FireSize = typeof FIRE | typeof MINI_FIRE;
/** His fire's or the mini fleshmancer's: which way it pours at a moment, when it begins and stops, how it whips. */
const fireOf = (mini: boolean) => (mini ? { way: miniWay, hit: MINI_HIT, stop: MINI_STOP, whip: MINI_WHIP, size: MINI_FIRE as FireSize } : { way: fireWay, hit: FIRE_HIT, stop: FIRE_STOP, whip: WHIP, size: FIRE as FireSize });
/** Its lanes: the way each burns (radians to his left), and when the stream passed it (seconds into the move). */
export function fireLanes(mini = false): { a: number; at: number }[] {
  const F = fireOf(mini);
  const out: { a: number; at: number }[] = [];
  const n = Math.floor(F.whip.round / F.size.every + 1e-6);
  for (let k = 0; k <= n; k++) {
    const a = F.whip.from + k * F.size.every;
    // (when it got there: the whip's ease undone)
    const u = 1 - Math.pow(1 - (a - F.whip.from) / F.whip.round, 1 / F.whip.ease);
    out.push({ a, at: F.hit + u * (F.stop - F.hit) });
  }
  return out;
}
/** Whether a hero `x`, `y` tiles from him (before him, to his left) is burned at `t` seconds into his fire: in the stream, or in a lane burning. */
export function fireStrikes(t: number, fwd: number, left: number, mini = false): boolean {
  const F = fireOf(mini);
  const S = F.size;
  const d = Math.hypot(fwd, left);
  if (d < S.land - 0.2 || d > S.reach + 0.3) return false;
  const b = Math.atan2(left, fwd);
  const near = (a: number, half: number): boolean => Math.abs(((b - a + Math.PI * 3) % TAU) - Math.PI) <= Math.atan2(half, d);
  const now = F.way(t);
  if (now !== null && near(now, S.half)) return true;
  return fireLanes(mini).some((l) => t >= l.at && t < l.at + S.burn && near(l.a, S.laneHalf));
}
/**
 * THE FIRE, `t` seconds into his fire (or the mini fleshmancer's), from him at `C` facing `aim` (radians on the floor), the stream
 * pouring out of `mouth` (a point on the picture). 'floor': the scorch and the char under the lanes; 'air': the stream, its smear,
 * and the lanes' flames.
 */
export function paintFire(p: Px, at: At, t: number, C: readonly [number, number], aim: number, mouth: readonly [number, number] | null, layer: 'floor' | 'air', mini = false, keep: Keep = ALL): void {
  const F = fireOf(mini);
  const S = F.size;
  const big = mini ? 0.75 : 1;
  const ptAt = (a: number, d: number, z = 0): readonly [number, number] => {
    const [ux, uy] = way(aim, -a);
    return at(C[0] + ux * d, C[1] + uy * d, z);
  };
  // THE LANES LEFT BURNING
  for (const [li, l] of fireLanes(mini).entries()) {
    const since = t - l.at;
    if (since < 0 || since > S.burn + S.scorch) continue;
    // (it dies back from its end toward him)
    const out = since < S.burn - S.die ? S.reach : S.land + (S.reach - S.land) * clamp01(1 - (since - (S.burn - S.die)) / S.die);
    for (let d = S.land; d <= S.reach; d += 0.14) {
      for (let o = -1; o <= 1; o++) {
        const off = (o * S.laneHalf * 0.7) / Math.max(d, 0.5);
        const [x, y] = ptAt(l.a + off, d + o * 0.03);
        if (!keep(y)) continue;
        const seed = Math.floor(d * 20) * 3 + o + li * 101;
        if (layer === 'floor') {
          // (the char under it, thinning away as it cools)
          if (since > S.burn && hash(seed, 1, 571) < (since - S.burn) / S.scorch) continue;
          dot(p, x, y, CHAR[(seed & 3) % 3], 2);
          dot(p, x + 1, y + 1, CHAR[0]);
          continue;
        }
        if (d > out || since > S.burn) continue;
        if (hash(seed, 2, 572) > 0.62) continue;
        const flick = 0.6 + 0.4 * Math.sin(t * 19 + seed * 1.3);
        const fresh = clamp01(1 - since / 0.3);
        const tall = big * (9 + 9 * hash(seed, 3, 573)) * flick * (1 + 0.8 * fresh) * (d > out - 0.5 ? clamp01((out - d) / 0.5) + 0.2 : 1);
        tongue(p, x, y, tall, big * (4 + 2 * hash(seed, 4, 574)), Math.sin(t * 7 + seed) * 4, fresh, seed);
      }
    }
  }
  const now = F.way(t);
  if (now === null || layer === 'floor' || !mouth) return;
  // THE STREAM: its after-images first (where it was the two frames before: the whip), then it
  for (const back of [2, 1, 0]) {
    const a = F.way(Math.max(F.hit, t - back / 30)) ?? now;
    if (back && Math.abs(a - now) < 0.05) continue;
    const full = back === 0;
    // (out of the jaws, arcing down onto the floor at its landing)
    const [lx, ly] = ptAt(a, S.land);
    if (full) {
      const [mx, my] = mouth;
      const midx = (mx + lx) / 2;
      const midy = Math.min(my, ly) - 14 * big;
      for (let i = 0; i <= 24; i++) {
        const u = i / 24;
        const x = (1 - u) * (1 - u) * mx + 2 * u * (1 - u) * midx + u * u * lx;
        const y = (1 - u) * (1 - u) * my + 2 * u * (1 - u) * midy + u * u * ly;
        if (!keep(ly)) break;
        const r = big * (2.5 + 2 * u + Math.sin(t * 37 + i) * 0.6);
        for (let k = -Math.ceil(r); k <= Math.ceil(r); k++) for (let j = -Math.ceil(r); j <= Math.ceil(r); j++) {
          const q = Math.hypot(k, j * 1.2) / r;
          if (q > 1) continue;
          dot(p, x + k, y + j, q < 0.35 ? WHITE : q < 0.6 ? FLAME[4] : q < 0.85 ? FLAME[3] : FLAME[2]);
        }
      }
    }
    // (along the floor out to its reach: a river of flame, thick near him, its heart white)
    for (let d = S.land; d <= S.reach; d += full ? 0.16 : 0.32) {
      for (let o = -1; o <= 1; o++) {
        const off = (o * S.half * 0.75) / Math.max(d, 0.5);
        const [x, y] = ptAt(a + off, d);
        if (!keep(y)) continue;
        const seed = Math.floor(d * 13) * 5 + o + back * 7;
        const far = (d - S.land) / (S.reach - S.land);
        if (!full) {
          // (the whip's after-image: a dull streak low over the floor)
          if (o !== 0) continue;
          dot(p, x, y - 2, back === 1 ? FLAME[2] : FLAME[1], 2);
          continue;
        }
        const tall = big * (16 + 14 * (1 - far)) * (0.7 + 0.3 * Math.sin(t * 31 + seed));
        tongue(p, x, y, tall, big * (6 + 4 * (1 - far)), -6 * Math.sin(t * 5 + d), o === 0 ? 1 : 0.4, seed);
      }
    }
  }
}

// =============================================================================================
// THE DEAD

/** ITS NUMBERS: how long each of the dead bursts up after his call (each `apart` after the one before), how far its bone and dirt is thrown (tiles), and how long. */
export const RAISE = { apart: 0.05, throw: 1.4, long: 0.7, shake: RAISE_HOLD } as const;
/** When the dead of heap `i` burst up (seconds into the move). */
export const raiseBurst = (i: number): number => RAISE_HIT + i * RAISE.apart;
/** How much a heap shakes, `t` seconds into his summoning (0 still, 1 shaking hardest): from his arms flung up to the call. */
export const heapShake = (t: number): number => smooth((t - RAISE.shake[0] + 0.2) / 0.4) * (t < RAISE_HIT ? 1 : 0);
/** A BONE HEAP's ground: lit from under while he summons, cracking; the burst of bone and grave dirt as its dead comes up (`since` seconds after it). */
export function paintHeap(p: Px, at: At, t: number, H: readonly [number, number], i: number, layer: 'floor' | 'air'): void {
  const sh = heapShake(t);
  const since = t - raiseBurst(i);
  if (layer === 'floor') {
    // (the floor round it cracking, lit from under in his pink, beating faster)
    const glow = since < 0 ? sh * (0.7 + 0.3 * Math.sin(t * (20 + 20 * sh) + i)) : clamp01(1 - since / 0.5);
    if (glow <= 0.02) return;
    for (let k = 0; k < 11; k++) {
      const a = (k / 11) * TAU + hash(k, i, 581);
      const L = 0.55 + 0.6 * hash(k, i, 582) * (0.4 + 0.6 * sh);
      for (let d = 0.3; d < L; d += 0.02) {
        const [x, y] = at(H[0] + Math.cos(a + Math.sin(d * 9) * 0.2) * d, H[1] + Math.sin(a + Math.sin(d * 9) * 0.2) * d);
        dot(p, x, y, glow > 0.6 && d < L * 0.7 ? FLAME[3] : glow > 0.3 ? FLAME[2] : FLAME[1], 2);
      }
    }
    // (and a ring of his light round it)
    for (let s = 0; s < 48; s++) {
      if (hash(s, i + Math.floor(t * 15), 589) > glow) continue;
      const [x, y] = at(H[0] + Math.cos((s / 48) * TAU) * 0.62, H[1] + Math.sin((s / 48) * TAU) * 0.62);
      dot(p, x, y, FLAME[2], 2);
    }
    return;
  }
  if (since < 0) {
    // (bones hopping off it as it shakes)
    if (sh > 0.1) for (let k = 0; k < 5; k++) {
      const ph = (t * 4 + hash(k, i, 583)) % 1;
      const [x, y] = at(H[0] + (hash(k, i, 584) - 0.5) * 0.5, H[1] + (hash(k, i, 585) - 0.5) * 0.4, 14 * sh * ph * (1 - ph) * 4);
      dot(p, x, y, BONE[1], 2);
    }
    return;
  }
  if (since > RAISE.long) return;
  // THE BURST: a flash, and bone and grave dirt thrown up and out
  const k = since / RAISE.long;
  if (since < 0.12) {
    const [x, y] = at(H[0], H[1], 10);
    const r = 6 + 60 * since;
    for (let a = 0; a < 24; a++) dot(p, x + Math.cos((a / 24) * TAU) * r, y + Math.sin((a / 24) * TAU) * r * 0.5, since < 0.05 ? WHITE : FLAME[3], 2);
  }
  for (let j = 0; j < 22; j++) {
    const th = hash(j, i, 586) * TAU;
    const sp = RAISE.throw * (0.4 + 0.6 * hash(j, i, 587));
    const vz = 120 + 110 * hash(j, i, 588);
    const tt = since;
    const z = vz * tt - 420 * tt * tt;
    if (z < 0 && tt > 0.1) continue;
    const d = sp * (1 - (1 - k) ** 2);
    const [x, y] = at(H[0] + Math.cos(th) * d, H[1] + Math.sin(th) * d, Math.max(0, z));
    const bone = j % 3 === 0;
    dot(p, x, y, bone ? (j % 2 ? BONE[0] : BONE[1]) : DIRT[j % 3], j % 4 === 0 ? 3 : 2);
  }
}

// =============================================================================================
// THE TELEPORT

/** THE PIT OF HIS DEAD he is yanked down into: `r` tiles round, open from `open` to `shut` seconds into his going. */
export const PIT = { r: 0.85, open: f(4), shut: f(28) } as const;
/**
 * WHERE HE WILL RISE, marked on the floor first: from `warn` seconds before he erupts (the rules' pause and the rise's first
 * moments), a ring of his fire `r` tiles round filling in, the pit of his dead churning in its middle; THE BURST as he erupts,
 * out to the ring in `out` seconds: a hero within `r` of where he comes up is struck.
 */
export const RISE_MARK = { warn: 1.0, r: 2.0, out: 0.16 } as const;
/** THE PIT, `open` its share open (0 to 1): a churning mass of his dead, dark plum knotted with bone, his pink fire in its cracks. */
function pitPix(p: Px, at: At, P: readonly [number, number], open: number, t: number, r: number = PIT.r): void {
  if (open <= 0.02) return;
  const R = r * open;
  for (let k = 0; k < 220; k++) {
    const a = hash(k, 1, 591) * TAU + t * (hash(k, 2, 591) - 0.5) * 2;
    const d = Math.sqrt(hash(k, 3, 591)) * R;
    const [x, y] = at(P[0] + Math.cos(a) * d, P[1] + Math.sin(a) * d, 1 + 2 * Math.sin(t * 9 + k));
    const edge = d / Math.max(R, 1e-6);
    const c = edge > 0.88 ? FLAME[1] : hash(k, 4, 591) > 0.86 ? BONE[1] : hash(k, 5, 591) > 0.8 ? FLAME[2] : FLESH[Math.floor(hash(k, 6, 591) * 4)];
    dot(p, x, y, c, edge > 0.88 ? 2 : 3);
  }
}
/** THE PIT UNDER HIM AS HE IS YANKED DOWN, `t` seconds into his going, at `P`. */
export function paintSinkPit(p: Px, at: At, t: number, P: readonly [number, number]): void {
  const open = smooth((t - PIT.open) / 0.12) * (1 - smooth((t - PIT.shut) / 0.06));
  pitPix(p, at, P, open, t);
}
/** WHERE HE WILL RISE, `m` seconds from his eruption (negative before), at `P`: the mark ('floor'), the burst ('air'). */
export function paintRiseMark(p: Px, at: At, m: number, P: readonly [number, number], layer: 'floor' | 'air'): void {
  const M = RISE_MARK;
  if (m < -M.warn || m > 0.9) return;
  if (layer === 'floor') {
    if (m < 0) {
      const k = 1 - -m / M.warn;
      // the ring of his fire, its dashes filling in round it
      const n = 150;
      const beat = 0.65 + 0.35 * Math.sin(m * (18 + 30 * k));
      for (let s = 0; s < n; s++) {
        if (s / n > 0.25 + 0.75 * smooth(k * 1.6)) continue;
        if (s % 6 === 5) continue;
        const a = (s / n) * TAU;
        const [x, y] = at(P[0] + Math.cos(a) * M.r, P[1] + Math.sin(a) * M.r);
        dot(p, x, y, beat > 0.8 ? FLAME[3] : FLAME[2], 3);
        const [x2, y2] = at(P[0] + Math.cos(a) * (M.r - 0.12), P[1] + Math.sin(a) * (M.r - 0.12));
        if (s % 2 === 0) dot(p, x2, y2, FLAME[1], 2);
      }
      // cracks out from the middle toward it
      for (let j = 0; j < 7; j++) {
        const a = (j / 7) * TAU + 0.4;
        for (let d = 0.3; d < M.r * k * 0.9; d += 0.03) {
          const [x, y] = at(P[0] + Math.cos(a + Math.sin(d * 7 + j) * 0.12) * d, P[1] + Math.sin(a + Math.sin(d * 7 + j) * 0.12) * d);
          dot(p, x, y, d < M.r * k * 0.6 ? FLAME[2] : FLAME[1], 2);
        }
      }
      pitPix(p, at, P, 0.45 + 0.75 * k, m, PIT.r * 1.15);
    } else pitPix(p, at, P, 1 - smooth(m / 0.5), m);
    return;
  }
  if (m < 0) return;
  // THE BURST: a ring of his fire thrown out to its reach, his dead's flesh and bone flung
  const k = clamp01(m / M.out);
  if (m < M.out + 0.12) {
    const r = M.r * smooth(k);
    for (let s = 0; s < 80; s++) {
      const a = (s / 80) * TAU;
      if (hash(s, 7, 592) < (m - M.out) / 0.12) continue;
      const [x, y] = at(P[0] + Math.cos(a) * r, P[1] + Math.sin(a) * r, 4);
      dot(p, x, y, k < 0.5 ? WHITE : FLAME[3], 3);
      const [x2, y2] = at(P[0] + Math.cos(a) * r * 0.9, P[1] + Math.sin(a) * r * 0.9, 10);
      dot(p, x2, y2, FLAME[2], 2);
    }
  }
  for (let j = 0; j < 26; j++) {
    const th = hash(j, 8, 592) * TAU;
    const sp = M.r * (0.5 + 0.6 * hash(j, 9, 592));
    const vz = 150 + 120 * hash(j, 10, 592);
    const z = vz * m - 450 * m * m;
    if (z < 0 && m > 0.1) continue;
    const d = sp * (1 - (1 - clamp01(m / 0.6)) ** 2);
    const [x, y] = at(P[0] + Math.cos(th) * d, P[1] + Math.sin(th) * d, Math.max(0, z));
    dot(p, x, y, j % 4 === 0 ? BONE[0] : j % 4 === 1 ? FLAME[2] : FLESH[1 + (j % 3)], 3);
  }
}
