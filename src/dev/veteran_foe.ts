// A STAND-IN FOE FOR THE VETERAN'S FILM (the art chat, 2 Nov 2026): something for his blows to land on. A MOCK-UP; NOTHING
// OF THE GAME IMPORTS IT. Not a design for the game: a plain hooded brute in sackcloth, an enemy (the enemy's pink rim,
// dull pink eyes), sculpted with the shared sculptor on bones of his own, about the knight's size. He stands guard, swings
// a heavy haymaker, and is hit: his head snapped back (a jab), reeling (a cross, a hook), knocked back sliding (a round
// kick, the elbow), launched into the air and down stunned (the uppercut), or flung away to his knees (the knee, the
// spinning kick).

import { ENEMY_RIM } from '../art/mkit';
import type { Ramp } from '../art/kit';
import { buildOf, lerp3, mul, norm, solve, standing, sub, add } from '../art/skeleton';
import type { Bones, Posed, V3 } from '../art/skeleton';
import { Sculpt, draw } from './sculpt';
import type { Drawn } from './sculpt';
import type { Reaction } from './veteran_moves';

const FOE_B = buildOf(52, 1.45, { shoulders: 1.12, chest: 1.08, waist: 1.0, hips: 1.0, limbs: 1.08, arms: 1.0 });
const SACK: Ramp = ['#1c1a16', '#36302a', '#544a3e', '#766a58', '#988a74'];
const HOOD: Ramp = ['#161212', '#2c2220', '#463632', '#624c44', '#7c6458'];
const HIDE: Ramp = ['#22181c', '#46303a', '#6e5058', '#987078', '#b8949a'];
const WRAP: Ramp = ['#22202a', '#3e3a48', '#5e5868', '#827a88', '#a49ca8'];
const EYE = '#c45a7a';
const sh = (r: Ramp, k: number): string => r[Math.max(0, Math.min(4, k))];

/** His guard: square on to who he faces, fists up, feet apart. */
export const FOE_GUARD: Partial<Bones> = {
  pz: -3.5, yaw: -10, twist: 4, bend: 10, pitch: 2, faceTurn: -4, faceUp: 6,
  lfx: 4.5, lfy: 2.5, lft: 14, lk: 16, rfx: -4.5, rfy: -2.5, rft: -16, rk: -16,
  lhIn: 0, lhx: 9.5, lhy: -1.0, lhz: 2.0, le: 20, rhIn: 0, rhx: 8.5, rhy: 1.0, rhz: 1.0, re: 22,
};
const REST: Bones = { ...standing(FOE_B), ...FOE_GUARD } as Bones;

const tr = (f: number, ks: [number, number][]): number => {
  if (f <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (f <= ks[i][0]) {
      const u = (f - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]);
      return ks[i - 1][1] + (ks[i][1] - ks[i - 1][1]) * u * u * (3 - 2 * u);
    }
  }
  return ks[ks.length - 1][1];
};

/** What he is doing at a moment: his pose, how far he has been driven back (along the blow) and lifted, and whether he is stunned. */
export interface FoeState {
  pose: Partial<Bones>;
  back: number;
  lift: number;
  stars: boolean;
  /** Down for good (the light out of him, a little). */
  down: boolean;
}
/** How long each reaction plays (frames), and whether he ends where he started (he comes back in) or stays down. */
export const REACT_LONG: Record<Reaction, number> = { snap: 14, reel: 24, knock: 34, launch: 60, fly: 46, kneed: 46, aside: 34, shove: 34 };
export const REACT_STAYS: Record<Reaction, boolean> = { snap: false, reel: false, knock: false, launch: true, fly: true, kneed: true, aside: false, shove: false };
/** Which way a blow sends him, turned from straight away from the Veteran (degrees to the left): the spinning elbow knocks him ASIDE. */
export const REACT_VEER: Record<Reaction, number> = { snap: 0, reel: 0, knock: 0, launch: 0, fly: 0, kneed: 0, aside: -40, shove: 0 };

/** Him, `g` frames after a blow of a kind landed (g >= 0). */
export function foeHit(kind: Reaction, g: number): FoeState {
  const G = FOE_GUARD;
  const lh = (G.lhz ?? 0);
  switch (kind) {
    case 'snap':
      return {
        pose: { ...G, px: tr(g, [[0, 0], [2, -3], [14, 0]]), pitch: tr(g, [[0, 2], [2, -10], [14, 2]]), bend: tr(g, [[0, 10], [2, -6], [14, 10]]), faceUp: tr(g, [[0, 6], [2, 34], [14, 6]]), faceTurn: tr(g, [[0, -4], [2, 16], [14, -4]]), lhz: tr(g, [[0, lh], [3, lh + 4], [14, lh]]) },
        back: tr(g, [[0, 0], [3, 4], [14, 0]]), lift: 0, stars: false, down: false,
      };
    case 'reel':
      return {
        pose: { ...G, pz: tr(g, [[0, -3.5], [4, -6], [24, -3.5]]), twist: tr(g, [[0, 4], [3, -30], [24, 4]]), yaw: tr(g, [[0, -10], [3, -30], [24, -10]]), pitch: tr(g, [[0, 2], [3, -12], [24, 2]]), bend: tr(g, [[0, 10], [3, -10], [12, 16], [24, 10]]), side: tr(g, [[0, 0], [3, 14], [24, 0]]), faceUp: tr(g, [[0, 6], [3, 30], [24, 6]]), faceTurn: tr(g, [[0, -4], [3, 40], [24, -4]]), faceTilt: tr(g, [[0, 0], [3, 20], [24, 0]]), lhx: tr(g, [[0, 9.5], [4, 2], [24, 9.5]]), lhy: tr(g, [[0, -1], [4, 9], [24, -1]]), lhz: tr(g, [[0, 2], [4, -4], [24, 2]]), rhx: tr(g, [[0, 8.5], [4, 0], [24, 8.5]]), rhz: tr(g, [[0, 1], [4, -6], [24, 1]]) },
        back: tr(g, [[0, 0], [5, 12], [12, 14], [24, 0]]), lift: 0, stars: false, down: false,
      };
    case 'knock':
      return {
        pose: { ...G, pz: tr(g, [[0, -3.5], [5, -9], [16, -8], [34, -3.5]]), pitch: tr(g, [[0, 2], [3, -18], [10, -6], [20, 12], [34, 2]]), bend: tr(g, [[0, 10], [3, -14], [14, 24], [34, 10]]), twist: tr(g, [[0, 4], [3, 26], [34, 4]]), side: tr(g, [[0, 0], [3, -16], [34, 0]]), faceUp: tr(g, [[0, 6], [3, 30], [14, -6], [34, 6]]), faceTurn: tr(g, [[0, -4], [3, -36], [34, -4]]), lhx: tr(g, [[0, 9.5], [4, -4], [20, 6], [34, 9.5]]), lhy: tr(g, [[0, -1], [4, 12], [34, -1]]), lhz: tr(g, [[0, 2], [4, 4], [20, -6], [34, 2]]), rhx: tr(g, [[0, 8.5], [4, -4], [20, 6], [34, 8.5]]), rhy: tr(g, [[0, 1], [4, -12], [34, 1]]), rhz: tr(g, [[0, 1], [4, 4], [20, -6], [34, 1]]), lfx: tr(g, [[0, 4.5], [8, 10], [34, 4.5]]) },
        back: tr(g, [[0, 0], [6, 30], [14, 34], [22, 30], [34, 0]]), lift: 0, stars: false, down: false,
      };
    case 'launch': {
      const air = tr(g, [[0, 0], [9, 44], [14, 48], [22, 30], [28, 0]]);
      const land = g >= 28;
      return {
        pose: land
          ? { ...G, pz: tr(g, [[28, -6], [32, -15], [60, -15]]), bend: tr(g, [[28, 20], [32, 34], [60, 30]]), pitch: tr(g, [[28, 10], [32, 14], [60, 12]]), faceUp: tr(g, [[28, 0], [34, -10], [60, -6]]) + 10 * Math.sin(g * 0.35), faceTilt: 18 * Math.sin(g * 0.3), faceTurn: 20 * Math.sin(g * 0.22), side: 6 * Math.sin(g * 0.3), lfx: 6, lfy: 3, lk: 30, rfx: -2, rfy: -3, rk: -30, lhx: 4, lhy: 4, lhz: -18, le: 10, rhx: 4, rhy: -4, rhz: -18, re: 10 }
          : { ...G, pz: -2, pitch: tr(g, [[0, 2], [6, -40], [14, -55], [24, -20], [28, 10]]), bend: tr(g, [[0, 10], [6, -20], [20, 10], [28, 20]]), faceUp: tr(g, [[0, 6], [2, 40], [20, 20], [28, 0]]), lfx: 4, lfz: tr(g, [[0, 0], [6, 10], [22, 6], [28, 0]]), lk: 40, lkUp: 30, rfx: -4, rfz: tr(g, [[0, 0], [6, 4], [22, 8], [28, 0]]), lhx: -2, lhy: 12, lhz: 10, le: 40, rhx: -2, rhy: -12, rhz: 12, re: 40 },
        back: tr(g, [[0, 0], [14, 18], [28, 24]]), lift: air, stars: g > 10, down: true,
      };
    }
    case 'fly': {
      const air = tr(g, [[0, 0], [5, 14], [10, 10], [15, 0]]);
      return {
        pose: g < 15
          ? { ...G, pz: -2, pitch: tr(g, [[0, 2], [4, -30], [14, -10]]), bend: tr(g, [[0, 10], [3, 34], [14, 20]]), faceUp: tr(g, [[0, 6], [3, 30], [14, 0]]), lfx: 8, lfz: tr(g, [[0, 0], [4, 8], [14, 0]]), lk: 30, lkUp: 20, rfx: 2, rfz: tr(g, [[0, 0], [4, 12], [14, 0]]), rk: -30, rkUp: 20, lhx: -4, lhy: 12, lhz: 6, le: 30, rhx: -4, rhy: -12, rhz: 6, re: 30 }
          : { ...G, pz: tr(g, [[15, -8], [20, -15], [46, -15.5]]), bend: tr(g, [[15, 20], [22, 38], [46, 40]]), pitch: tr(g, [[15, 8], [22, 16], [46, 16]]), faceUp: tr(g, [[15, 0], [24, -24], [46, -26]]), lfx: 6, lfy: 3, lk: 30, rfx: -2, rfy: -3, rk: -30, lhx: 5, lhy: 3, lhz: -20, le: 10, rhx: 5, rhy: -3, rhz: -20, re: 10 },
        back: tr(g, [[0, 0], [15, 46], [24, 56], [46, 58]]), lift: air, stars: false, down: true,
      };
    }
    case 'kneed': {
      // PULLED DOWN ONTO THE KNEE (doubled over, his face to it), then SNAPPED BACK, flung back off his feet, down on his knees
      const air = tr(g, [[0, 0], [3, 9], [8, 12], [15, 0]]);
      return {
        pose: g < 15
          ? { ...G, pz: tr(g, [[0, -5], [3, -2]]), pitch: tr(g, [[0, 12], [2, -40], [8, -30], [14, -10]]), bend: tr(g, [[0, 16], [2, -24], [8, -14], [14, 16]]), faceUp: tr(g, [[0, -14], [2, 46], [8, 36], [14, 0]]), faceTilt: tr(g, [[0, 0], [3, -14], [14, 0]]), lfx: tr(g, [[0, 4.5], [4, 9]]), lfz: tr(g, [[0, 0], [4, 8], [14, 0]]), lk: 30, lkUp: 20, rfx: tr(g, [[0, -4.5], [4, 2]]), rfz: tr(g, [[0, 0], [4, 12], [14, 0]]), rk: -30, rkUp: 20, lhx: tr(g, [[0, 6], [3, -4]]), lhy: tr(g, [[0, -1], [3, 13]]), lhz: tr(g, [[0, -4], [3, 8]]), le: 30, rhx: tr(g, [[0, 6], [3, -4]]), rhy: tr(g, [[0, 1], [3, -13]]), rhz: tr(g, [[0, -4], [3, 8]]), re: 30 }
          : { ...G, pz: tr(g, [[15, -8], [20, -15], [46, -15.5]]), bend: tr(g, [[15, 20], [22, 38], [46, 40]]), pitch: tr(g, [[15, 8], [22, 16], [46, 16]]), faceUp: tr(g, [[15, 0], [24, -24], [46, -26]]), lfx: 6, lfy: 3, lk: 30, rfx: -2, rfy: -3, rk: -30, lhx: 5, lhy: 3, lhz: -20, le: 10, rhx: 5, rhy: -3, rhz: -20, re: 10 },
        back: tr(g, [[0, 0], [3, 12], [15, 48], [24, 56], [46, 58]]), lift: air, stars: false, down: true,
      };
    }
    case 'aside':
      // KNOCKED ASIDE: his head and trunk wrenched round, thrown off sideways, stumbling; he comes back
      return {
        pose: { ...G, pz: tr(g, [[0, -3.5], [4, -8], [18, -7], [34, -3.5]]), yaw: tr(g, [[0, -10], [3, -46], [16, -30], [34, -10]]), twist: tr(g, [[0, 4], [3, -40], [14, -20], [34, 4]]), side: tr(g, [[0, 0], [3, 22], [14, 10], [34, 0]]), pitch: tr(g, [[0, 2], [3, -10], [12, 8], [34, 2]]), bend: tr(g, [[0, 10], [3, -8], [14, 20], [34, 10]]), faceTurn: tr(g, [[0, -4], [3, -64], [16, -20], [34, -4]]), faceUp: tr(g, [[0, 6], [3, 26], [14, -4], [34, 6]]), faceTilt: tr(g, [[0, 0], [3, 30], [16, 8], [34, 0]]), lhx: tr(g, [[0, 9.5], [4, 0], [20, 6], [34, 9.5]]), lhy: tr(g, [[0, -1], [4, 12], [34, -1]]), lhz: tr(g, [[0, 2], [4, 6], [20, -4], [34, 2]]), rhx: tr(g, [[0, 8.5], [4, -2], [20, 6], [34, 8.5]]), rhy: tr(g, [[0, 1], [4, -12], [34, 1]]), rhz: tr(g, [[0, 1], [4, 2], [20, -5], [34, 1]]), lfx: tr(g, [[0, 4.5], [8, 9], [34, 4.5]]), lfy: tr(g, [[0, 2.5], [8, -2], [34, 2.5]]) },
        back: tr(g, [[0, 0], [6, 30], [14, 34], [22, 28], [34, 0]]), lift: 0, stars: false, down: false,
      };
    case 'shove':
      // SHOVED BACK: doubled over round the heel in his middle, driven back skidding; he comes back
      return {
        pose: { ...G, pz: tr(g, [[0, -3.5], [3, -7], [12, -8], [34, -3.5]]), pitch: tr(g, [[0, 2], [2, 20], [12, 14], [34, 2]]), bend: tr(g, [[0, 10], [2, 36], [12, 28], [34, 10]]), faceUp: tr(g, [[0, 6], [2, -14], [12, 0], [34, 6]]), lhx: tr(g, [[0, 9.5], [3, 5], [20, 7], [34, 9.5]]), lhy: tr(g, [[0, -1], [3, -4], [34, -1]]), lhz: tr(g, [[0, 2], [3, -8], [20, -2], [34, 2]]), rhx: tr(g, [[0, 8.5], [3, 5], [20, 7], [34, 8.5]]), rhy: tr(g, [[0, 1], [3, 4], [34, 1]]), rhz: tr(g, [[0, 1], [3, -8], [20, -2], [34, 1]]), lfx: tr(g, [[0, 4.5], [3, 9], [14, 6], [34, 4.5]]), rfx: tr(g, [[0, -4.5], [3, 0], [14, -3], [34, -4.5]]) },
        back: tr(g, [[0, 0], [3, 16], [8, 34], [14, 38], [20, 36], [34, 0]]), lift: 0, stars: false, down: false,
      };
  }
}
/** His haymaker: `g` frames from its start; it lands at 16. */
export const SWING_HIT = 16;
export function foeSwing(g: number): FoeState {
  const G = FOE_GUARD;
  return {
    pose: {
      ...G,
      px: tr(g, [[0, 0], [12, -3], [14, -3.2], [16, 7], [20, 7], [32, 0]]), pz: tr(g, [[0, -3.5], [12, -7], [16, -6], [32, -3.5]]),
      yaw: tr(g, [[0, -10], [12, -40], [14, -42], [16, 20], [20, 22], [32, -10]]), twist: tr(g, [[0, 4], [12, -36], [14, -38], [16, 40], [20, 42], [32, 4]]),
      bend: tr(g, [[0, 10], [12, 4], [16, 20], [32, 10]]), faceTurn: tr(g, [[0, -4], [12, 20], [16, -10], [32, -4]]),
      rhx: tr(g, [[0, 8.5], [12, -8], [14, -8.5], [16, 20], [20, 20], [32, 8.5]]), rhy: tr(g, [[0, 1], [12, -6], [16, 3], [32, 1]]), rhz: tr(g, [[0, 1], [12, 12], [14, 12.5], [16, 2], [20, 1], [32, 1]]), re: tr(g, [[0, 22], [12, 70], [16, 20], [32, 22]]),
    },
    back: 0, lift: 0, stars: false, down: false,
  };
}

export const FOE_CANVAS = { w: 180, h: 190, ax: 90, ay: 150 };

/** HIM, sculpted and painted in a pose, turned (degrees to his left) as the scene has him. */
export function paintFoe(pose: Partial<Bones>, turn: number, lift = 0): Drawn {
  const B = FOE_B;
  const q = { ...REST, ...pose, pz: (pose.pz ?? REST.pz) + lift, lfz: (pose.lfz ?? 0) + lift, rfz: (pose.rfz ?? 0) + lift } as Posed;
  const s = solve(B, q);
  const sc = new Sculpt();
  sc.spin = turn;
  const [f, l, u] = s.upper;
  const hide = sc.mat({ ramp: HIDE });
  const sack = sc.mat({ ramp: SACK, paint: (h) => ((h.x * 3 + h.y * 5) % 11 === 0 ? sh(SACK, h.tone - 1) : null) });
  const hood = sc.mat({ ramp: HOOD, paint: (h) => (h.prim.tag === 'mouth' ? sh(HOOD, 0) : null) });
  const wrap = sc.mat({ ramp: WRAP, paint: (h) => ((h.x + h.y * 2) % 4 === 0 ? sh(WRAP, h.tone - 1) : null) });
  // the trunk: a barrel of a chest in sackcloth, a rope belt
  sc.ell(sack, 'torso', lerp3(s.ribs, s.neck, 0.3), [mul(f, 5.4), mul(l, B.shoulderHalf * 0.88), mul(u, 6.4)], 2.0, { tag: 'chest' });
  sc.ell(sack, 'torso', lerp3(s.waist, s.ribs, 0.4), [mul(s.belly[0], 5.6), mul(s.belly[1], 7.0), mul(s.belly[2], 6.0)], 2.0, { tag: 'belly' });
  sc.ell(sack, 'hips', add(s.pelvis, mul(s.hips[2], 1.0)), [mul(s.hips[0], 5.4), mul(s.hips[1], 7.4), mul(s.hips[2], 4.6)], 1.6, { tag: 'pelvis' });
  // the hood, heavy over his head and shoulders, his face a dark hollow in it with two dull pink eyes
  const [hf, hl, hu] = s.face;
  sc.ell(hood, 'head', add(s.head, mul(hu, 0.6)), [mul(hf, 6.0), mul(hl, 5.6), mul(hu, 6.6)], 1.2, { tag: 'hood' });
  sc.cone(hood, 'torso', s.neck, add(s.neck, mul(u, -3)), 7.4, 9.2, 1.4, { tag: 'cowl' });
  sc.ell(hood, 'head', add(s.head, add(mul(hf, 4.2), mul(hu, -0.6))), [mul(hf, 1.6), mul(hl, 3.4), mul(hu, 3.6)], 0.4, { tag: 'mouth' });
  for (const side of [1, -1]) sc.mark(add(s.head, add(mul(hf, 5.8), add(mul(hl, side * 1.5), mul(hu, 0.6)))), EYE, 1, 1, 0, 0, 3);
  // arms: bare and heavy, the forearms wrapped; big wrapped fists
  for (const side of ['L', 'R'] as const) {
    const sd = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const ha = side === 'L' ? s.handL : s.handR;
    const piece = `arm${side}`;
    sc.ell(hide, piece, sd, [mul(f, 3.6), mul(l, 3.4), mul(u, 3.6)], 1.2, { tag: 'delt' });
    sc.cone(hide, piece, sd, el, 3.3, 2.6, 1.4, { tag: 'upper' });
    sc.cone(wrap, piece, el, ha, 2.7, 2.2, 1.2, { tag: 'fore' });
    const d = norm(sub(ha, el));
    const a2 = norm(sub(u, mul(d, d[0] * u[0] + d[1] * u[1] + d[2] * u[2])), f);
    const a3 = norm([d[1] * a2[2] - d[2] * a2[1], d[2] * a2[0] - d[0] * a2[2], d[0] * a2[1] - d[1] * a2[0]]);
    sc.ell(wrap, piece, add(ha, mul(d, 1.4)), [mul(d, 2.3), mul(a2, 2.4), mul(a3, 2.2)], 0.8, { tag: 'fist' });
  }
  // legs: sackcloth breeches, wrapped shins, bare feet
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ank = side === 'L' ? s.ankleL : s.ankleR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const piece = `leg${side}`;
    sc.cone(sack, piece, hip, knee, 4.4, 3.6, 1.4, { tag: 'thigh' });
    sc.cone(wrap, piece, knee, ank, 3.4, 2.4, 1.2, { tag: 'shin' });
    sc.cone(hide, piece, add(heel, [0, 0, 1.7]), add(toe, [0, 0, 1.7]), 1.7, 1.5, 0.8, { tag: 'foot' });
  }
  return draw(sc, 'front', FOE_CANVAS.ax, FOE_CANVAS.ay, FOE_CANVAS, undefined, ENEMY_RIM);
}
