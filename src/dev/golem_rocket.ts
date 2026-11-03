// HER GOLEM'S ROCKET JUMP, AND ITS RUN (the art chat's helper, 2 Nov 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His words to the main chat, 2 Nov 2026, 21:29: “And the golem is gonna need that rocket jump for positioning, and probably
// more movespeed”. The main chat's stand-in in the game (game/game.ts, game/tinkerer.ts golem.jump): further than 5 tiles from
// where it is going, seeing it, it blasts off and comes down there, at most 8 tiles on, 0.7 s in the air, 46 game pixels up at
// the top; its pace 5.5 tiles a second. Drawn here on its own sculpted body (dev/sculpt_golem.ts), by his rulebook's
// Animations 1 (“as big and wild and kinetic and weighty as possible.  I’d rather it be a notch too high than a notch too
// low.”) and Movement 9 (a big held wind-up, the strike a flash, a big wind-down):
//
// THE TAKE-OFF: it sinks into a deep crouch, its knees bent under it and its giant fist braced on the floor before it; its two
// stacks swing back and down on their feet like a rocket's nozzles and lock (a clank: they kick past and settle); held there,
// shuddering harder and harder, the fire in their mouths flaring from the friend's dark cyan to white-hot, fire licking out of
// them, steam venting; then THE BLAST, a flash: a column of fire driven down into the floor, a ring of dust and stone blown
// out, and it is flung up off the floor, its legs thrown straight.
// THE FLIGHT: it rides its stacks up and on in an arc, flames streaming back and down out of them and smoke trailing behind
// it, leaning into its flight, its legs tucked and braced under it and its giant fist thrust out ahead; over the top its fire
// sputters out, it hauls its fist up over its shoulder, its legs reach down for the floor, and it falls like the great weight
// it is.
// THE LANDING: a flash: its feet and its fist SLAM down together, its body crushed down into its knees, the floor cracked open
// round it in a crater, a ring of dust and stone blown out; it heaves itself back up, its stacks swing back up and lock, steam
// hissing out of them, and it stands as it was.
//
// ITS RUN (his “probably more movespeed”: 5.5 tiles a second, was 4.6): its walk's round played at that pace would be six
// rounds a second, a scurry; so a run of its own, A GALLOP: its giant fist planted far out ahead, its body vaulting over it,
// its feet swung under it to land one and the other and drive it off the floor in a bound, its fist flung out ahead again.
// Its fist and its feet grip the floor while down, keeping pace with the floor as the game carries it along.

import { fistOf, reachFist } from './golem_moves';
import { UNITS_PER_TILE } from '../art/moves3';

/**
 * THE ROCKET JUMP through time, in frames (30 a second). `crouch`: sunk into its crouch, its stacks locked down; held,
 * charging, to `blast`: THE BLAST, the frame it leaves the floor (its flight's frame 0); in the air `flight` frames (0.7 s, the
 * game's); `land` its feet and fist slam down (= blast + flight); deepest in its landing at `absorb`; up out of it by `rise`;
 * its stacks back up and standing as it was at `stand`; done (the last of the steam) at `end`.
 */
export const ROCKET = { crouch: 6, lock: 8, blast: 15, flight: 21, land: 36, absorb: 39, rise: 48, stand: 52, end: 56 };
/** How high it goes (game pixels at the top of its arc, the game's), and when it is there (of its flight). */
export const ROCKET_ARC = { high: 46, top: 0.55 };
/** Picture pixels to a game pixel (the heroes' grain). */
export const ROCKET_GRAIN = 2;
/** The blast and the slam, each a flash (his rulebook's Movement 9): not judged frame by frame. */
export const ROCKET_STRIKE: [number, number][] = [
  [ROCKET.blast - 1, ROCKET.blast + 2],
  [ROCKET.land - 2, ROCKET.land + 1],
];
/** How far its stacks swing back and down (degrees), and its stacks' fire. */
const STACKS_DOWN = 148;
/** How far they splay out, each to its own side, as they swing down (degrees): clear of its boiler, pointing down past it. */
const STACKS_SPLAY = 22;

/**
 * HOW HIGH IT IS (game pixels over the floor) `k` frames after it leaves it (fractions allowed): flung up by the blast, fastest
 * at first, riding its stacks to the top at ROCKET_ARC.top of its flight; then falling like a stone, faster and faster, onto
 * the floor at ROCKET.flight. (The stand-in's was a half wave, Math.sin; this is its weight.)
 */
export function rocketUp(k: number, flight: number = ROCKET.flight, high: number = ROCKET_ARC.high): number {
  const u = k / flight;
  if (u <= 0 || u >= 1) return 0;
  const T = ROCKET_ARC.top;
  if (u < T) return high * (1 - (1 - u / T) ** 3);
  return high * (1 - ((u - T) / (1 - T)) ** 2);
}
/** How far along its way it is (0 to 1) `k` frames after it leaves the floor: steady, as the game carries it. */
export function rocketAlong(k: number, flight: number = ROCKET.flight): number {
  return Math.max(0, Math.min(1, k / flight));
}

/** A number through keys (frame, value), eased in and out between them. */
function track(ks: [number, number][], f: number): number {
  if (f <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (f <= ks[i][0]) {
      const u = (f - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]);
      return ks[i - 1][1] + (ks[i][1] - ks[i - 1][1]) * u * u * (3 - 2 * u);
    }
  }
  return ks[ks.length - 1][1];
}
/** Through keys smoothly (a curve through each key, not stopping at each). */
function smooth(ks: [number, number][], f: number): number {
  if (f <= ks[0][0]) return ks[0][1];
  const n = ks.length;
  for (let i = 1; i < n; i++) {
    if (f <= ks[i][0]) {
      const [x1, y1] = ks[i - 1];
      const [x2, y2] = ks[i];
      const [x0, y0] = i >= 2 ? ks[i - 2] : [x1 - (x2 - x1), y1];
      const [x3, y3] = i + 1 < n ? ks[i + 1] : [x2 + (x2 - x1), y2];
      const h = x2 - x1;
      const m1 = ((y2 - y0) / (x2 - x0)) * h;
      const m2 = ((y3 - y1) / (x3 - x1)) * h;
      const u = (f - x1) / h;
      const u2 = u * u;
      const u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * y1 + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * y2 + (u3 - u2) * m2;
    }
  }
  return ks[n - 1][1];
}
const ease = (u: number): number => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * (3 - 2 * c);
};

export type RocketPose = {
  swing: number;
  fold: number;
  lean: number;
  bob: number;
  feet: [number, number, number, number];
  level: number;
  stacks: number;
  splay: number;
  flare: number;
  hips: number;
};
/** Its fist at rest on the floor before it (forward, up, as it was built). */
const REST_FIST: [number, number] = [27, 12.8];

/**
 * Its shudder as it holds its crouch, charging (lean, bob): from nothing as its stacks lock to all it has as it blasts off.
 */
function shudder(f: number): [number, number] {
  const R = ROCKET;
  if (f <= R.lock || f >= R.blast) return [0, 0];
  const s = ((f - R.lock) / (R.blast - R.lock)) ** 1.5;
  return [s * 1.6 * Math.sin((f - R.lock) * 2.6), s * 0.6 * Math.cos((f - R.lock) * 3.1)];
}

/** Its feet in the air (forward, up from where each stands): pushing off, thrown down and back; tucked up under it; reaching down for the floor. */
const LEG_F: [number, number][] = [[ROCKET.blast, -3], [ROCKET.blast + 2, -7], [ROCKET.blast + 6, 4], [ROCKET.blast + 12, 7], [ROCKET.land - 4, 3], [ROCKET.land, 0]];
const LEG_Z: [number, number][] = [[ROCKET.blast, 0], [ROCKET.blast + 2, 4], [ROCKET.blast + 6, 12], [ROCKET.blast + 12, 13], [ROCKET.land - 4, 5], [ROCKET.land, 0]];
/** THE ROCKET JUMP's pose at frame `f` (ROCKET): its body, its giant arm, its legs, its stacks and their fire. */
export function golemRocket(f: number): RocketPose {
  const R = ROCKET;
  const k = f - R.blast;
  // ITS BODY: sunk into its crouch and coiled lower as it holds; flung up straight at the blast; leaning into its flight;
  // upright as it falls; crushed down into its knees as it lands; heaved back up
  const lean = track(
    [
      [0, 0],
      [R.crouch, 9],
      [R.blast - 1, 11],
      [R.blast, 4],
      [R.blast + 3, 14],
      [R.blast + 10, 16],
      [R.blast + 15, 6],
      [R.land - 1, -2],
      [R.land, 12],
      [R.absorb, 14],
      [R.rise, -2],
      [R.stand, 0],
      [R.end, 0],
    ],
    f,
  );
  const bob = track(
    [
      [0, 0],
      [R.crouch, -10.5],
      [R.blast - 1, -12],
      [R.blast, 1],
      [R.blast + 3, 2],
      [R.blast + 12, 1],
      [R.land - 1, 2.5],
      [R.land, -11],
      [R.absorb, -12.5],
      [R.rise, 0.8],
      [R.stand, 0],
      [R.end, 0],
    ],
    f,
  );
  const [sl, sb] = shudder(f);
  // ITS LEGS (each [forward, up] of its foot from where it stands, as GOLEM_POSE.feet): planted through its crouch; thrown
  // straight down at the blast (pushing off); tucked up under it in the air; reaching down for the floor; planted as it lands
  let lf: number;
  let lz: number;
  if (f < R.blast) {
    lf = 0;
    lz = 0;
  } else if (f < R.land) {
    lf = smooth(LEG_F, f);
    lz = smooth(LEG_Z, f);
  } else {
    lf = 0;
    lz = 0;
  }
  // (its far foot a little after its near one, as legs are)
  const lag = (v: (g: number) => number): number => v(f < R.blast || f >= R.land ? f : Math.max(R.blast, f - 1));
  const rf = lag((g) => (g < R.blast || g >= R.land ? 0 : smooth(LEG_F, g)));
  const rz = lag((g) => (g < R.blast || g >= R.land ? 0 : smooth(LEG_Z, g)));
  // ITS GIANT FIST (forward, up, as it was built): braced on the floor before it through its crouch; flung down and back as it
  // blasts off; thrust out ahead of it in the air; hauled up over its shoulder over the top; SLAMMED down onto the floor as it
  // lands; braced there as it takes the blow; back to where it rests
  let to: [number, number];
  if (f <= R.blast - 1) {
    const u = ease(f / R.crouch);
    to = [REST_FIST[0] + (24 - REST_FIST[0]) * u, REST_FIST[1]];
  } else if (f < R.land) {
    to = [
      smooth([[R.blast - 1, 24], [R.blast, 21], [R.blast + 2, 25], [R.blast + 7, 40], [R.blast + 11, 38], [R.land - 4, 18], [R.land - 2, 16], [R.land - 1, 26], [R.land, 30]], f),
      smooth([[R.blast - 1, 12.8], [R.blast, 13.2], [R.blast + 2, 16], [R.blast + 7, 30], [R.blast + 11, 52], [R.land - 4, 82], [R.land - 2, 86], [R.land - 1, 46], [R.land, 12.8]], f),
    ];
  } else if (f <= R.rise - 4) to = [30, 12.8];
  else {
    const u = ease((f - (R.rise - 4)) / (R.stand - (R.rise - 4)));
    to = [30 + (REST_FIST[0] - 30) * u, REST_FIST[1] + 6 * Math.sin(Math.PI * u)];
  }
  const L = lean + sl;
  const B = bob + sb;
  const arm = reachFist(to, L, B);
  // ITS STACKS: swung back and down and locked (kicking past and settling) as it crouches; down through its flight; swung back
  // up and locked as it stands again. THEIR FIRE: flaring as it holds, white-hot as it blasts off and rides them up, sputtering
  // out over the top, dark as it falls
  const stacks = track(
    [
      [0, 0],
      [1, 0],
      [R.crouch, STACKS_DOWN + 8],
      [R.lock, STACKS_DOWN],
      [R.land + 4, STACKS_DOWN],
      [R.stand - 2, -7],
      [R.stand, 0],
    ],
    f,
  );
  let flare = 0;
  if (f >= R.crouch && f < R.blast) flare = 0.2 + 0.8 * ((f - R.crouch) / (R.blast - 1 - R.crouch)) ** 1.3;
  else if (k >= 0 && k <= 11) flare = 1;
  else if (k > 11 && k <= 16) flare = [0.67, 0.34, 0.67, 0.34, 0][k - 12];
  const splay = STACKS_SPLAY * Math.max(0, Math.min(1, stacks / STACKS_DOWN));
  return { ...arm, lean: L, bob: B, feet: [lf, lz, rf, rz], level: f < R.blast || f >= R.land ? 1 : 0, stacks, splay, flare: Math.min(1, flare), hips: 1 };
}

// ---- ITS RUN: A GALLOP -------------------------------------------------------------------------------------------------------

/**
 * ITS RUN: a round of `round` frames, carried `speed` tiles a second (the game's 5.5): its stride `stride` tiles a round, the
 * floor it covers (for the game's walkStride: its frames by the ground it covers, so its fist and feet grip).
 */
export const GRUN = { round: 16, speed: 5.5, stride: (16 / 30) * 5.5 };
/** The Golem's size as drawn (dev/sculpt_golem.ts GOLEM_SIZE.ape): its own measure to the floor's. */
const SIZE = 0.82;
/** The floor going by under it, in its own measure (as it was built), a frame. */
const RUN_V = (GRUN.speed * UNITS_PER_TILE) / 30 / SIZE;

/** Through periodic keys (phase 0 to 1, value) smoothly, round and round. */
function loopKeys(ks: [number, number][], ph: number): number {
  const ext: [number, number][] = [[ks[ks.length - 2][0] - 1, ks[ks.length - 2][1]], ...ks, [ks[1][0] + 1, ks[1][1]]];
  const p = ((ph % 1) + 1) % 1;
  return smooth(ext, p);
}
/** A foot or a fist through its round: down from `at` for `on` of the round, going back under it at the floor's pace from `from` (forward); then up, swung on ahead along an arc `lift` high, to plant again. [forward, up]. */
function stride(ph: number, at: number, on: number, from: number, lift: number): [number, number] {
  const P = GRUN.round;
  const q = (((ph - at) % 1) + 1) % 1;
  const L = RUN_V * on * P;
  if (q < on) return [from - RUN_V * q * P, 0];
  const u = (q - on) / (1 - on);
  // (lifted quick off the floor, carried on, set down soft: speed easing in and out along the way, and up over an arc)
  const e = u * u * (3 - 2 * u);
  return [from - L + L * e, lift * Math.sin(Math.PI * u) ** 0.8];
}
/** Its run's pose at frame `f` (a round of GRUN.round; the game carries it GRUN.speed tiles a second). */
export function golemRun(f: number): RocketPose {
  const P = GRUN.round;
  const ph = (((f / P) % 1) + 1) % 1;
  // (vaulting up over its planted fist; dropping onto its feet; driven up off them into its bound; down onto its fist)
  const bob = loopKeys([[0, 0.5], [2 / P, 2.4], [4.5 / P, 0], [7.5 / P, -4.5], [10 / P, -1.5], [13 / P, 3.2], [1, 0.5]], ph);
  // (reaching out over its fist as it plants it; back as it vaults past it and lands on its feet; into its bound)
  const lean = loopKeys([[0, 13], [3 / P, 4], [5.5 / P, -3], [8 / P, -5], [10.5 / P, 3], [13 / P, 10], [1, 13]], ph);
  // ITS FIST: planted far out ahead, the body vaulting over it, flung out ahead again
  const [ff, fz] = stride(ph, 0, 4.2 / P, 33, 16);
  const arm = reachFist([ff, REST_FIST[1] + fz], lean, bob);
  // ITS FEET, one and the other (offsets from where each stands, as GOLEM_POSE.feet; the rest ankle 13 behind its middle)
  const [lf0, lz] = stride(ph, 5.3 / P, 3.2 / P, 2, 9);
  const [rf0, rz] = stride(ph, 6.3 / P, 3.2 / P, 2, 9);
  return { ...arm, lean, bob, feet: [lf0 + 13, lz, rf0 + 13, rz], level: 1, stacks: 0, splay: 0, flare: 0, hips: 1 };
}
/** Where its fist would be for a pose (forward, up), for checking it reached. */
export const fistAt = (q: RocketPose): [number, number] => fistOf(q.swing, q.fold, q.lean, q.bob);
