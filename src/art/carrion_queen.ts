// FLOOR 7'S BOSS, THE CARRION QUEEN: a mock-up (nothing of the game imports this file; `CARRION_QUEEN_ON` is
// off).
//
// The planning chat's, with his yes (12 Oct, 18:07, "All the main ones rock.  I like them all"): a huge
// cult-bound vulture nesting on an outcrop over the drop; the ledge crumbles section by section as the fight
// goes on; a talon rake (basic), a wing gust that shoves you toward the edge, a dive along a marked line, a
// call that brings her flock. His word on the Ledge Road (13 Oct, 20:59): the boss area "on some peak where
// we can see the city".
//
// HIS BRIEF, asked as his art rulebook's questions for a new character (13 Oct, asked after 22:25): how big, “Wings
// wider than the trail (Recommended)”, offered as: huge: perched, about the Unfinished's height; wings spread,
// wider than the trail is across; menacing. The one thing to know her by, “Bone crown and cult chains
// (Recommended)”, offered as: a ruff of pale bone-white feathers like a crown, a broken cult shackle and chain
// on one leg, the cult's mark burning pink on her breast. How she moves, “Hunched hops, a blur in the air
// (Recommended)”, offered as: heavy and lurching on the ground, hopping and dragging her wings; then
// terrifyingly fast once she takes off. How she dies: “All these are great.  I think I want to see them
// all” (falls off the edge; the ledge gives way; bursts into feathers). Her sound, “A shrieking screech,
// beating wings (Recommended)”. What she must never look like, “Not like a phoenix or eagle”, offered as: no
// proud, noble bird look: ugly, a carrion eater.
//
// THIS FILE, SO FAR: how she looks, standing (pictures first). She is built as every boss is, on the heroes'
// bones (art/skeleton.ts), dressed in solids through art/new_mobs3.ts's painter, lit from the upper left, the
// indigo seam, the enemy's pink edge round her: a bird on a man's bones, her wings his arms (shoulder, elbow,
// wrist), her feathers hung from them; her legs his, the thighs lost in the feathers of her trousers, the
// shanks bare and scaled, the feet great taloned toes. She stands as vultures do, MANTLED: hunched, her wings
// held half open and drooping round her like a ragged cloak to the ground, her bare grey neck sunk into her
// crown of bone-white feathers, her hooked beak low; ugly, never noble. On her left leg the cult's shackle,
// its chain broken, dragging; on her breast the cult's mark burning; her eyes the cult's fire.

import type { Sprite } from '../engine/px';
import { shriekAt } from './floor5';
import { hash, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME, IRON } from './mkit';
import { TILE3, at3, canvasOf, paintMob, sphere } from './new_mobs3';
import type { Bit, Mob, MobCanvas, MobMove, Moment, Put } from './new_mobs3';
import type { GameView, Stage } from './skin';
import { add, buildOf, cross, dot, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const CARRION_QUEEN_ON = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const fr = (t: number): number => t - Math.floor(t);
const Z: V3 = [0, 0, 1];

// ---------------------------------------------------------------------------------------------
// HER BODY: perched, about the Unfinished's height (224): a vulture's, on the bones: a great deep body, short
// legs, a long neck, a small bare head; her arms her wings, long.

export const CQ_TALL = 264;
const BASE: Build = buildOf(CQ_TALL, 0.85, { shoulders: 1.25, chest: 1.55, depth: 1.45, waist: 1.35, hips: 1.3, legs: 0.6, arms: 1.3, trunk: 1.08, limbs: 1.35, pad: 6 });
/** (her neck long, her head carried forward on it) */
export const CQ_BODY: Build = { ...BASE, neck: 0.13 * CQ_TALL, headFwd: 0.05 * CQ_TALL };
const B = CQ_BODY;

/** Her canvas: room for her standing mantled, and (to come) her wings spread wider than the trail. */
export const CQ_CANVAS: MobCanvas = { w: 820, h: 640, ax: 410, ay: 520 };

// ---------------------------------------------------------------------------------------------
// HER COLOURS: a figure's (her deep twice, the body, the lit, the sheen)

/** Her plumage: brown-black, a dull sheen where the light lies along it. */
export const PLUMAGE: Ramp = ['#1d1820', '#1d1820', '#4a3e45', '#6e5e66', '#8c7a80'];
/** The feathers cloaking her back: as her plumage, never in its sheen (they lie up into the light). */
export const MANTLE: Ramp = ['#1d1820', '#1d1820', '#3e343a', '#5a4c54', '#5a4c54'];
/** Her flight feathers: a step browner and more worn. */
export const QUILLS: Ramp = ['#201a1e', '#201a1e', '#514248', '#76646a', '#927f84'];
/** Her crown: the ruff of bone-white feathers. */
export const CROWN: Ramp = ['#5a4e48', '#5a4e48', '#b0a492', '#d8cdb9', '#ece4d4'];
/** Her bare head and neck: wrinkled grey-tan skin (never pink). */
export const BARE: Ramp = ['#3c3434', '#3c3434', '#857770', '#a89a90', '#bfb3a8'];
/** Her shanks and toes: grey, scaled. */
export const SCALES: Ramp = ['#2c2830', '#2c2830', '#6a6270', '#8a8290', '#a39ca8'];
/** Her talons and the tip of her beak: near black, glossy. */
export const TALON: Ramp = ['#121014', '#121014', '#2c2830', '#4a4450', '#6a6470'];
/** Her beak: pale horn. */
export const BEAK: Ramp = ['#4a4038', '#4a4038', '#b8aa90', '#d9ccb2', '#ece2cc'];

// ---------------------------------------------------------------------------------------------
// HOW SHE STANDS: MANTLED. Hunched over, her body tipped forward, her head low on her sunk neck; her wings
// held out from her sides and drooping to the floor like a ragged cloak; her feet planted, her talons spread.

const ARM = B.upperArm + B.foreArm;
export const CQ_REST: Bones = {
  ...standing(B),
  pz: -10, px: 0, yaw: 0, pitch: 28, roll: 0, twist: 0, bend: 16, side: 0,
  faceTurn: -16, faceUp: -18, faceTilt: 4,
  lfx: 2, lfy: 10, lft: 16, lk: 12, rfx: -3, rfy: -10, rft: -14, rk: -12,
  lhIn: 0, lhx: 10, lhy: ARM * 0.6, lhz: -ARM * 0.2, le: 60,
  rhIn: 0, rhx: 10, rhy: -ARM * 0.6, rhz: -ARM * 0.2, re: 60,
};

/** HER BREATH: her bulk heaves, her wings stir and settle, her head jerks round to look, then back. 2.6 s round. */
function cqStand(): Motion {
  const R = CQ_REST;
  return {
    loop: 0,
    keys: [
      { at: 0, pose: {} },
      // (her bulk heaves up and her weight goes over onto her left foot, her wings lifting a little with it)
      { at: 0.9, pose: { pz: R.pz + 2, py: 3, roll: -1.4, bend: R.bend - 2, lhy: R.lhy + 4, rhy: R.rhy - 4, lhz: R.lhz + 3, rhz: R.rhz + 3 }, ease: 'io' },
      // (her head jerks round to look, and holds)
      { at: 1.15, pose: { pz: R.pz + 1.6, py: 2.6, roll: -1.2, faceTurn: R.faceTurn + 22, faceUp: R.faceUp + 4, faceTilt: R.faceTilt - 6 }, ease: 'out' },
      { at: 1.7, pose: { pz: R.pz + 0.8, py: 1.2, roll: -0.4, faceTurn: R.faceTurn + 24, faceUp: R.faceUp + 3, faceTilt: R.faceTilt - 6 }, ease: 'io' },
      { at: 2.6, pose: {}, ease: 'io' },
    ],
  };
}
export const CQ_BREATH = 2.6;

// ---------------------------------------------------------------------------------------------
// HER MOVES, his “Hunched hops, a blur in the air”

type Track = ReadonlyArray<readonly [number, number]>;
/**
 * A SMOOTH WAY THROUGH THESE (time, value) POINTS, easing to a stop at each turn and at its ends, never
 * overshooting (a monotone cubic); `period`, if given, the time it comes round in (the last point leading
 * on to the first).
 */
function curve(pts: Track, period = 0): (t: number) => number {
  const n = pts.length;
  const P = (i: number): readonly [number, number] => {
    if (!period) return pts[Math.max(0, Math.min(n - 1, i))];
    const k = ((i % n) + n) % n;
    return [pts[k][0] + Math.floor(i / n) * period, pts[k][1]];
  };
  const slope = pts.map((_, i) => {
    if (!period && (i === 0 || i === n - 1)) return 0;
    const [x0, y0] = P(i - 1);
    const [x1, y1] = P(i);
    const [x2, y2] = P(i + 1);
    const d0 = (y1 - y0) / (x1 - x0);
    const d1 = (y2 - y1) / (x2 - x1);
    return d0 * d1 <= 0 ? 0 : (2 * d0 * d1) / (d0 + d1);
  });
  return (t: number): number => {
    let q = t;
    if (period) q = t - Math.floor((t - pts[0][0]) / period) * period;
    if (!period && q <= pts[0][0]) return pts[0][1];
    if (!period && q >= pts[n - 1][0]) return pts[n - 1][1];
    let i = n - 1;
    while (i > 0 && pts[i][0] > q) i--;
    const [x0, y0] = P(i);
    const [x1, y1] = P(i + 1);
    const h = x1 - x0;
    const s = (q - x0) / h;
    const m0 = slope[i] * h;
    const m1 = slope[(i + 1) % n] * h;
    const s2 = s * s;
    const s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * y0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * y1 + (s3 - s2) * m1;
  };
}
/** A move from smooth curves, one for each of the bones it moves: a key at every frame (`fps`) for `long` seconds. */
function byCurves(long: number, fps: number, at: (t: number) => Partial<Bones>): Key3[] {
  const keys: Key3[] = [];
  const n = Math.round(long * fps);
  for (let i = 0; i <= n; i++) keys.push({ at: i / fps, ease: 'lin', pose: at(i / fps) });
  return keys;
}
/** Both her wings at once, the left as given and the right its mirror: raised by `lift` (0 her mantle, 1 high), and as given. */
function wings(lift: number, more: { x?: number; y?: number; z?: number; e?: number } = {}): Partial<Bones> {
  const R = CQ_REST;
  const x = R.lhx - 6 * lift + (more.x ?? 0);
  const y = R.lhy + 18 * lift + (more.y ?? 0);
  const z = R.lhz + ARM * 0.42 * lift + (more.z ?? 0);
  const e = R.le + (more.e ?? 0);
  return { lhx: x, lhy: y, lhz: z, le: e, rhx: x, rhy: -y, rhz: z, re: e };
}

/** Her pace on the ground, tiles a second, and her hop: a round of sixteen frames at sixteen a second (one hop). */
export const CQ_PACE = 0.8;
export const CQ_WALK = { frames: 16, fps: 16, off: 0.3, land: 0.64 } as const;
/**
 * HER WALK, A HOP (one round, 1 s): settled on both feet (her stand), carried back under her as she goes on;
 * she crouches, her wings opening and rising; she springs, her wings flaring up and out; in the air both
 * feet tucked and swung through under her, her wings held up; she comes down heavy on both at once and
 * sinks, her wings still up, then dropping and dragging as she settles into her stand again. She stops only
 * where the round begins (her stand), as the game's bosses stop.
 */
function cqWalk(): Motion {
  const R = CQ_REST;
  const T = CQ_WALK.frames / CQ_WALK.fps;
  const { off, land } = CQ_WALK;
  const v = CQ_PACE * TILE3;
  const loop = (pts: Track): ((t: number) => number) => curve(pts, T);
  const pz = loop([[0, 0], [0.1, -2], [0.22, -7.5], [0.45, 13], [0.57, 6], [0.64, -1], [0.72, -8], [0.86, -2]]);
  const pitch = loop([[0, 0], [0.12, 2], [0.22, 6.5], [0.46, -5], [0.6, -1], [0.72, 7], [0.88, 1]]);
  const bend = loop([[0, 0], [0.12, 2], [0.22, 7.5], [0.46, -2], [0.6, 0], [0.72, 7], [0.88, 1]]);
  const faceUp = loop([[0, 0], [0.22, -4.2], [0.46, 6], [0.62, 2], [0.74, -6], [0.9, -1]]);
  const lift = loop([[0, 0], [0.12, 0.15], [0.26, 0.6], [0.34, 0.98], [0.4, 1], [0.52, 0.93], [0.66, 0.86], [0.8, 0.3], [0.92, 0.04]]);
  /** Her feet: carried back with the floor while down; tucked and swung through while she is in the air. */
  const feet = (t: number): Partial<Bones> => {
    const air = t > off && t < land;
    const u = (t - off) / (land - off);
    const g = u * u * u * (u * (u * 6 - 15) + 10);
    const fx = !air ? v * (t <= off ? -t : T - t) : -v * off + v * (T - land + off) * g;
    const fz = air ? 20 * Math.sin(Math.PI * u) : 0;
    const fp = air ? 22 * Math.sin(Math.PI * u) : 0;
    return { lfx: R.lfx + fx, lfz: fz, lfp: fp, rfx: R.rfx + fx, rfz: fz, rfp: fp, lk: R.lk + fp * 0.3, rk: R.rk - fp * 0.3 };
  };
  const keys = byCurves(T, CQ_WALK.fps, (t) => ({
    pz: R.pz + pz(t),
    pitch: R.pitch + pitch(t),
    bend: R.bend + bend(t),
    faceUp: R.faceUp + faceUp(t),
    ...feet(t),
    ...wings(lift(t)),
  }));
  return { keys, loop: 0 };
}

/** HER TALON RAKE: how long, when her talons land (on a frame of the game's thirty a second), when she warns. */
export const CQ_RAKE = { long: 1.7, hit: 28 / 30, warn: 0.3 } as const;
/**
 * HER TALON RAKE, as vultures fight, a leap and a kick: she crouches, her wings rising; she springs up off
 * both feet, her wings beating; at the top she hangs in the air, her wings high and wide, both feet thrust
 * out before her, their talons spread (THE WARNING, held, trembling); her body pitches forward first, her
 * wings beat down, and both feet rake down and back through whoever is before her (`CQ_RAKE.hit`); she comes
 * down heavy on both where she stood, hunched over what she struck, her wings spread low over it; and draws
 * back into her mantle.
 */
function cqRake(): Motion {
  const R = CQ_REST;
  const { long } = CQ_RAKE;
  const c = (pts: Track): ((t: number) => number) => curve(pts);
  const pz = c([[0, 0], [0.24, -8], [0.3, -7], [0.46, 30], [0.56, 35], [0.76, 36], [0.92, 16], [1.05, -2], [1.13, -9], [1.42, -3], [long, 0]]);
  const px = c([[0, 0], [0.25, -2], [0.52, -8], [0.76, -8.5], [0.97, 6], [1.12, 14], [1.25, 15], [1.45, 6], [long, 0]]);
  const pitch = c([[0, 0], [0.24, 7], [0.3, 7], [0.52, -24], [0.72, -26], [0.94, 8], [1.08, 22], [1.2, 24], [1.45, 10], [long, 0]]);
  const bend = c([[0, 0], [0.24, 6], [0.32, 6], [0.54, -12], [0.75, -12.5], [0.96, 4], [1.1, 8], [1.45, 4], [long, 0]]);
  const faceUp = c([[0, 0], [0.24, -4], [0.52, 14], [0.75, 15], [0.96, -2], [1.12, -9], [1.45, -3], [long, 0]]);
  const faceTurn = c([[0, 0], [0.5, 10], [0.75, 10.5], [0.98, -4], [1.15, -6], [long, 0]]);
  // her wings: rising as she crouches; beating as she springs; high and wide as she hangs; beating down as
  // she rakes; spread low over what she struck
  const lift = c([[0, 0], [0.26, 0.9], [0.4, 0.45], [0.56, 1.3], [0.76, 1.32], [1.0, -0.3], [1.2, -0.4], [1.5, -0.15], [long, 0]]);
  const wx = c([[0, 0], [0.52, -8], [0.76, -8], [0.97, 4], [1.12, 9], [1.45, 3], [long, 0]]);
  const we = c([[0, 0], [0.26, 10], [0.4, -8], [0.56, 20], [0.76, 21], [0.97, -6], [1.12, -18], [1.45, -6], [long, 0]]);
  // both feet: off the floor as she springs, tucked, then thrust out before her, talons spread; raked down and
  // back; down where they stood
  const fx = c([[0, 0], [0.3, 0], [0.42, 4], [0.56, 22], [0.78, 23], [0.94, 9], [1.06, 0], [long, 0]]);
  const fz = c([[0, 0], [0.3, 0], [0.42, 12], [0.56, 30], [0.78, 31], [0.94, 12], [1.06, 0], [long, 0]]);
  const fp = c([[0, 0], [0.3, 0], [0.42, 20], [0.56, -40], [0.78, -42], [0.96, 8], [1.06, 0], [long, 0]]);
  // (hanging there, the warning: her wings and her talons trembling)
  const shiver = (t: number): number => (t > 0.56 && t < 0.78 ? Math.sin((t - 0.56) * Math.PI * 2 * 11) * Math.sin(((t - 0.56) / 0.22) * Math.PI) : 0);
  const keys = byCurves(long, 30, (t) => ({
    px: px(t),
    pz: R.pz + pz(t),
    pitch: R.pitch + pitch(t),
    bend: R.bend + bend(t),
    faceUp: R.faceUp + faceUp(t),
    faceTurn: R.faceTurn + faceTurn(t),
    ...wings(lift(t), { x: wx(t), z: 2.2 * shiver(t), e: we(t) }),
    lfx: R.lfx + fx(t),
    lfz: fz(t),
    lfp: fp(t) + 2.5 * shiver(t),
    rfx: R.rfx + fx(t),
    rfz: fz(t),
    rfp: fp(t) - 2.5 * shiver(t),
  }));
  return { keys, hit: CQ_RAKE.hit };
}

/** STRUCK: her head snaps back, her wings jerk up, she is knocked back on her feet, hunches again. */
function cqReel(): Motion {
  const R = CQ_REST;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.09, pose: { pitch: R.pitch - 10, bend: R.bend - 6, px: -5, pz: R.pz + 2, faceUp: R.faceUp + 16, faceTurn: R.faceTurn + 12, faceTilt: R.faceTilt - 10, lhz: R.lhz + 22, rhz: R.rhz + 22, lhy: R.lhy + 8, rhy: R.rhy - 8 }, ease: 'out' },
      { at: 0.22, pose: { pitch: R.pitch - 4, bend: R.bend - 2, px: -3, pz: R.pz + 0.6, faceUp: R.faceUp + 6, faceTurn: R.faceTurn + 6, lhz: R.lhz + 8, rhz: R.rhz + 8 }, ease: 'io' },
      { at: 0.4, pose: {}, ease: 'io' },
    ],
  };
}


// ---------------------------------------------------------------------------------------------
// HER SOLIDS

/** The middle of her chest and its half-sizes (her solids, and the checks'). */
export const chestOf = (s: Skeleton): V3 => add(s.ribs, add(mul(s.chest[2], B.chest * 0.3), mul(s.chest[0], 4)));
export const CR: V3 = [B.ribDeep + 10, B.ribHalf + 10, B.chest * 0.8];

/**
 * A FEATHER, as a long flat panel: from `root` along `dir`, `len` long and `w` half-wide, its face across
 * `across`; its shaft a tone up, its vane a tone down at its edges, its tip worn ragged (by `seed`).
 */
function feather(put: Put, part: string, root: V3, dir: V3, across: V3, len: number, w: number, ramp: Ramp, seed: number): void {
  const d = norm(dir, [0, 0, -1]);
  const a0 = norm(sub(across, mul(d, dot(across, d))), [0, 1, 0]);
  const c = add(root, mul(d, len / 2));
  // (a feather lying flat, as when her wings are raised and spread, faces up into the light: never in its
  // sheen, as the feathers cloaking her back are not, so that her raised wings stay dark and never noble)
  const flat = Math.abs(cross(d, a0)[2]) > 0.55;
  put(part, part, {
    k: 'panel',
    c,
    u: mul(d, len / 2),
    v: mul(a0, w),
    skin: (a, b, _front, tone) => {
      const along = (a + len / 2) / len; // 0 at its root, 1 at its tip
      const half = w * (along > 0.8 ? 1 - (along - 0.8) * 3.2 : 1); // (its tip rounding off)
      if (Math.abs(b) > half) return null;
      // ragged: a notch out of its worn tip, by the feather
      if (along > 0.86 && hash(seed, Math.floor(b * 0.8 + 9), 3101) > 0.62) return null;
      const t = flat ? Math.min(tone, 2) : tone;
      if (Math.abs(b) < 0.7 && along < 0.9) return ramp[Math.min(flat ? 3 : 4, t + 1)]; // its shaft
      if (Math.abs(b) > half - 1.1) return ramp[Math.max(0, t - 1)]; // its edge
      return ramp[t];
    },
  });
}

/** HER WING on one side, hung from the arm's bones: coverts over the arm, the secondaries down from the forearm, the primaries fanned from the wrist; `spread` 0 drooping (mantled) to 1 spread (to come). */
function wing(put: Put, s: Skeleton, side: 'L' | 'R', cf: V3): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const wr = side === 'L' ? s.handL : s.handR;
  const sgn = side === 'L' ? 1 : -1;
  const part = side === 'L' ? 'wingL' : 'wingR';
  const out = norm(sub(wr, sh), [0, sgn, 0]);
  // HOW SPREAD: drooping (her mantle, 0) the feathers hang; raised (1) they trail back from the arm and out from
  // the wrist, as a wing beats and flies
  const spread = clamp01((wr[2] - sh[2]) / (ARM * 0.3) + 0.7);
  const back = norm(sub(mul(cf, -1), mul(out, dot(mul(cf, -1), out))), mul(cf, -1));
  const toward = (hang: V3, trail: V3): V3 => norm(add(mul(hang, 1 - spread), mul(trail, spread)));
  // (the way the feathers hang: down, drooping, a little back, as a mantle hangs; or trailing, spread)
  const hangDir = (k: number): V3 => toward(norm(add(add(mul(Z, -1), mul(cf, -0.12 - 0.22 * k)), mul(out, 0.12 * (1 - k)))), norm(add(back, mul(Z, -0.25))));
  const base = side === 'L' ? 3000 : 3100;
  // the primaries, from the wrist, the longest, hanging down and a little out, splayed at their tips
  for (let i = 0; i < 7; i++) {
    const k = i / 6;
    // (fanned like fingers, from out and down at the wing's tip to straight down, each separate at its end)
    const dir = toward(norm(add(add(mul(Z, -1), mul(cf, -0.12 * k)), mul(out, 0.95 - k * 0.85))), norm(add(add(mul(out, 1 - k * 0.7), mul(back, 0.2 + k * 0.8)), mul(Z, -0.15))));
    feather(put, part, add(wr, add(mul(out, 3 - k * 5), mul(cf, -k * 3))), dir, out, 88 - k * 10, 7, QUILLS, base + i);
  }
  // the secondaries, down from the forearm, overlapping
  for (let i = 0; i < 9; i++) {
    const k = i / 8;
    const root = lerp3(wr, el, k);
    const dir = hangDir(k);
    feather(put, part, root, dir, out, 96 - k * 10, 8, QUILLS, base + 20 + i);
  }
  // the tertials, from the elbow in toward the body
  for (let i = 0; i < 4; i++) {
    const k = i / 3;
    const root = lerp3(el, sh, k * 0.65);
    const dir = norm(add(hangDir(1), mul(cf, -0.3)));
    feather(put, part, root, dir, out, 74 - k * 10, 8.5, PLUMAGE, base + 40 + i);
  }
  // the leading edge over the bones: a thick feathered edge (rows of small round feathers), not a bare arm
  for (let i = 0; i <= 12; i++) {
    const k = i / 12;
    const p = k < 0.45 ? lerp3(sh, el, k / 0.45) : lerp3(el, wr, (k - 0.45) / 0.55);
    const r = (B.armR[0] * (1 - k) + B.armR[2] * k) * 0.8 + 1;
    put(part, part, { k: 'ball', c: add(p, mul(Z, -r * 0.3)), ax: [mul(cf, r), mul(out, r * 1.1), mul(Z, r * 1.15)], skin: plumed });
  }
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 8; i++) {
      const k = i / 7;
      const root = add(lerp3(wr, sh, k * 0.9), mul(Z, 6 - row * 12));
      const dir = hangDir(k);
      feather(put, part, root, dir, out, 34 - row * 4, 7.5, PLUMAGE, base + 60 + row * 10 + i);
    }
  }
}

/** HER LEG on one side: the thigh lost in the feathers of her trousers, the bare scaled shank, the foot's great toes and talons; on her left the cult's shackle, its chain broken and dragging. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R', cf: V3): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const part = side === 'L' ? 'legL' : 'legR';
  const [rH, rK, rA] = B.legR;
  // the trousers: shaggy feathers over the thigh, to below the knee
  const tc = lerp3(hip, knee, 0.62);
  const tu = norm(sub(hip, knee), Z);
  const tf = norm(sub(cf, mul(tu, dot(cf, tu))), [1, 0, 0]);
  put(part, part, { k: 'ball', c: tc, ax: [mul(tf, rH * 1.35), mul(cross(tu, tf), rH * 1.3), mul(tu, (Math.hypot(...sub(hip, knee)) / 2) * 1.25)], skin: (u, tone) => (fr((u[2] + 1) * 3 + u[1] * 0.6) < 0.16 ? PLUMAGE[Math.max(0, tone - 1)] : PLUMAGE[tone]) });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const r = add(lerp3(hip, knee, 0.95), add(mul(tf, Math.cos(a) * rH * 0.9), mul(cross(tu, tf), Math.sin(a) * rH * 0.9)));
    feather(put, part, r, norm(add(mul(tu, -1), mul(tf, Math.cos(a) * 0.3))), cross(tu, tf), 18, 5, PLUMAGE, 3200 + i + (side === 'L' ? 0 : 10));
  }
  // the bare shank, scaled
  put(part, part, { k: 'rod', a: lerp3(knee, ankle, 0.15), b: ankle, ra: rK * 0.55, rb: rA * 0.62, ramp: SCALES });
  put(part, part, { k: 'ball', c: ankle, ax: sphere(rA * 0.75), skin: SCALES });
  // the foot: three great toes forward, spread, one back; each a black talon hooked down at its end
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const acr: V3 = norm([-fwd[1], fwd[0], 0], [0, 1, 0]);
  const toes: [number, number][] = [[-0.55, 30], [0, 36], [0.55, 30], [Math.PI, 16]];
  toes.forEach(([ang, len]) => {
    const dir = norm(add(mul(fwd, Math.cos(ang)), mul(acr, Math.sin(ang))));
    const a = add(ankle, mul(Z, -rA * 0.4));
    const kn = add(a, add(mul(dir, len * 0.55), [0, 0, -rA * 0.7]));
    const end = add(kn, add(mul(dir, len * 0.45), [0, 0, -1.5]));
    put(part, part, { k: 'rod', a, b: kn, ra: rA * 0.42, rb: rA * 0.36, ramp: SCALES });
    put(part, part, { k: 'rod', a: kn, b: end, ra: rA * 0.36, rb: rA * 0.3, ramp: SCALES });
    put(part, part, { k: 'rod', a: end, b: add(end, add(mul(dir, 7), [0, 0, -3.5])), ra: rA * 0.32, rb: 0.6, ramp: TALON });
  });
  // the cult's shackle on her left leg, its chain broken, dragging on the floor
  if (side === 'L') {
    const su = norm(sub(knee, ankle), Z);
    const sf = norm(sub(cf, mul(su, dot(cf, su))), [1, 0, 0]);
    const rc = lerp3(ankle, knee, 0.22);
    put('shackle', 'shackle', { k: 'ball', c: rc, ax: [mul(sf, rK * 0.82), mul(cross(su, sf), rK * 0.82), mul(su, 3.4)], skin: IRON });
    for (let i = 0; i < 9; i++) {
      const k = (i + 1) / 9;
      const p = add(add(rc, mul(sf, -rK * 0.7 - k * 26)), [0, 0, -(rc[2] - 1.5) * Math.min(1, k * 1.6)]);
      put('shackle', 'shackle', { k: 'ball', c: p, ax: sphere(2.1), skin: IRON });
    }
  }
}

/** Where her head is: low, forward of the root of her neck (in her crown), turned as her face is. */
export const headOf = (s: Skeleton): V3 => {
  const f = s.face[0];
  const flat = norm([f[0], f[1], 0], [1, 0, 0]);
  return add(add(s.neck, mul(s.chest[0], 2)), add(mul(flat, 26), [0, 0, 6 + f[2] * 10]));
};

/** Her plumage on a round solid: the scalloped tips of the small feathers in rows, each row's tips a tone down. */
const plumed = (u: V3, tone: number): string => {
  // (matte: no sheen on the small feathers. Each a scallop, its rounded tip a dark line, the rows laid down
  // her like tiles, each row's feathers between the last's)
  const t = Math.min(3, tone);
  const rowF = (u[2] + 1) * 7;
  const row = Math.floor(rowF);
  const around = (Math.atan2(u[1], u[0]) + Math.PI) * 3.2 + row * 0.5;
  const cx = fr(around) - 0.5;
  const fy = fr(rowF);
  const edge = fy < 0.1 + 1.6 * cx * cx && fy > 1.6 * cx * cx - 0.06;
  if (edge) return PLUMAGE[Math.max(0, t - 2)];
  if (fy < 0.3 + 1.6 * cx * cx) return PLUMAGE[Math.max(0, t - 1)];
  return PLUMAGE[t];
};

/** THE CARRION QUEEN AS SOLIDS. */
function cqBits(st: Stage, m: Moment): Bit[] {
  void st;
  const { s, q } = m;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const frame = Math.floor(m.t * 8);

  // --- HER LEGS ---
  leg(put, s, 'L', cf);
  leg(put, s, 'R', cf);

  // --- HER TAIL: a short fan of worn feathers down behind her ---
  const [hf, hl, hu] = s.hips;
  for (let i = 0; i < 7; i++) {
    const k = (i - 3) / 3;
    const root = add(s.pelvis, add(mul(hf, -B.pelvisDeep - 6), mul(hl, k * 10)));
    const dir = norm(add(add(mul(hf, -0.7), mul(hu, -0.75)), mul(hl, k * 0.3)));
    feather(put, 'tail', root, dir, hl, 46 - Math.abs(k) * 6, 7, QUILLS, 3300 + i);
  }

  // --- HER BODY: the belly, the great chest, her back's mantle of feathers ---
  const chestC = chestOf(s);
  // (one great body, from her tail to the root of her neck: never two balls)
  const spineUp = norm(sub(add(chestC, mul(cu, CR[2] * 0.6)), s.pelvis), cu);
  const bodyF = norm(sub(cf, mul(spineUp, dot(cf, spineUp))), cf);
  const bodyL = norm(cross(spineUp, bodyF), cl);
  const bodyLen = Math.hypot(...sub(add(chestC, mul(cu, CR[2] * 0.6)), s.pelvis));
  put('body', 'body', { k: 'ball', c: lerp3(s.pelvis, add(chestC, mul(cu, CR[2] * 0.6)), 0.5), ax: [mul(bodyF, CR[0] + 2), mul(bodyL, CR[1] * 0.84), mul(spineUp, bodyLen * 0.62)], skin: plumed });
  // the scapulars: long feathers from over each shoulder lying back down over the root of the wing, so the wing grows out of her back
  for (const side of [1, -1]) {
    const sh = side > 0 ? s.shoulderL : s.shoulderR;
    for (let i = 0; i < 5; i++) {
      const k = i / 4;
      const root = add(add(sh, mul(cl, -side * (4 + k * 10))), add(mul(cu, 6 - k * 4), mul(cf, -k * 6)));
      const dir = norm(add(add(mul(cf, -0.7), mul(Z, -1)), mul(cl, side * 0.25)));
      feather(put, 'body', root, dir, cl, 58 - k * 8, 9, PLUMAGE, 3700 + i + (side > 0 ? 0 : 10));
    }
  }
  // THE CULT'S MARK on her breast, burning: where a point of her chest is on it
  // (on her upper breast, under her crown, where it faces forward and up into the light whatever her hunch)
  const mn = norm(add(cf, mul(cu, 0.5)));
  const mup = norm(cross(cl, mn));
  const mc = add(chestC, mul(mn, Math.hypot(CR[0] * 0.89, CR[2] * 0.45) + 1.4));
  const MW = CR[1] * 0.45;
  const MH = CR[2] * 0.42;
  const markAt = (p: V3): string | null => {
    const d = sub(p, mc);
    const x = -dot(d, cl) / MW;
    const y = dot(d, mup) / MH;
    const mk = shriekAt(x, y);
    if (mk === 'dark') return PLUMAGE[0];
    if (mk !== 'bone') return null;
    if (lit < 0.3) return FLAME[0];
    const edge = shriekAt(x + 0.07, y) !== 'bone' || shriekAt(x - 0.07, y) !== 'bone' || shriekAt(x, y + 0.06) !== 'bone' || shriekAt(x, y - 0.06) !== 'bone';
    if (edge) return FLAME[2];
    return fr(y * 3 - frame * 0.25 + hash(Math.floor(x * 6), 1, 3401) * 0.5) < 0.3 ? FLAME[4] : FLAME[3];
  };
  // the cult's mark on her breast, burning
  const mr = mul(cl, -1);
  put('mark', 'mark', { k: 'panel', c: mc, u: mul(mr, MW), v: mul(mup, MH), skin: (a, b, front) => (front ? markAt(add(mc, add(mul(mr, a), mul(mup, b)))) : null) });
  put('glow', 'glow', { k: 'glow', p: add(mc, mul(mn, 8)), c: FLAME[2], r: 46, a: 0.3 * lit });

  // --- HER WINGS, mantled round her ---
  wing(put, s, 'L', cf);
  wing(put, s, 'R', cf);

  // --- HER CROWN: the ruff of bone-white feathers round the root of her neck, standing up and out like a crown ---
  const nr = add(s.neck, mul(cf, 2));
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const radial = norm(add(mul(cf, Math.cos(a)), mul(cl, Math.sin(a))));
    const root = add(nr, mul(radial, 12));
    // (stiff and standing, a crown's points, the longest behind and at the sides)
    const dir = norm(add(mul(radial, 0.42), Z));
    feather(put, 'crown', root, dir, cross(dir, radial), 30 + (i % 2) * 10 - Math.max(0, Math.cos(a)) * 10, 3.8, CROWN, 3500 + i);
  }
  put('crown', 'crown', { k: 'ball', c: add(nr, mul(cu, 2)), ax: [mul(cf, 15), mul(cl, 15), mul(cu, 8)], skin: (u, tone) => (fr((u[0] + 3) * 4 + (u[1] + 3) * 3) < 0.2 ? CROWN[Math.max(0, tone - 1)] : CROWN[tone]) });

  // --- HER BARE NECK, sunk and curving forward out of the crown, wrinkled; HER HEAD, small and bare; HER HOOKED BEAK; her eyes the cult's fire ---
  const [ff, fl, fu] = s.face;
  const hr: V3 = [B.headR[0] * 1.3, B.headR[1] * 1.05, B.headR[2] * 0.95];
  // (sunk: her head carried low, forward of her crown, on the curve of her bare neck; turned as her face is)
  const head = headOf(s);
  const mid = add(lerp3(nr, head, 0.5), mul(Z, 9));
  const wrinkled = (u: V3, tone: number): string => (fr((u[2] + 1) * 6 + u[0] * 2) < 0.18 ? BARE[Math.max(0, tone - 1)] : BARE[tone]);
  put('neck', 'neck', { k: 'rod', a: add(nr, mul(cu, 4)), b: mid, ra: 8, rb: 6.4, ramp: BARE });
  put('neck', 'neck', { k: 'rod', a: mid, b: head, ra: 6.4, rb: 5.6, ramp: BARE });
  put('head', 'head', { k: 'ball', c: head, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: wrinkled });
  // her brow, a heavy ridge over the eye (a scowl, never a noble look)
  put('head', 'head', { k: 'ball', c: at3(head, s.face, hr[0] * 0.25, 0, hr[2] * 0.62), ax: [mul(ff, hr[0] * 0.7), mul(fl, hr[1] * 1.02), mul(fu, hr[2] * 0.32)], skin: BARE });
  // her beak: deep at its root, hooked down hard at its tip, the tip dark
  const b0 = at3(head, s.face, hr[0] * 0.7, 0, 0);
  const b1 = at3(head, s.face, hr[0] * 1.65, 0, hr[2] * 0.05);
  const b2 = at3(head, s.face, hr[0] * 2.0, 0, -hr[2] * 0.85);
  put('beak', 'beak', { k: 'rod', a: b0, b: b1, ra: hr[2] * 0.66, rb: hr[2] * 0.52, ramp: BEAK });
  put('beak', 'beak', { k: 'ball', c: b1, ax: [mul(ff, hr[2] * 0.5), mul(fl, hr[2] * 0.45), mul(fu, hr[2] * 0.55)], skin: BEAK });
  put('beak', 'beak', { k: 'rod', a: add(b1, mul(ff, hr[2] * 0.3)), b: b2, ra: hr[2] * 0.42, rb: 1, ramp: TALON });
  // the lower beak under it, and the dark gape between
  put('beak', 'beak', { k: 'rod', a: at3(head, s.face, hr[0] * 0.75, 0, -hr[2] * 0.5), b: at3(head, s.face, hr[0] * 1.5, 0, -hr[2] * 0.5), ra: hr[2] * 0.3, rb: hr[2] * 0.22, ramp: BEAK });
  // her eyes, burning
  for (const sgn of [1, -1]) {
    const e = at3(head, s.face, hr[0] * 0.5, sgn * hr[1] * 0.78, hr[2] * 0.3);
    put('head', 'eye', { k: 'dot', p: e, c: lit > 0.3 ? FLAME[3] : BARE[1], facing: add(mul(fl, sgn), mul(ff, 0.6)), c2: lit > 0.3 ? FLAME[2] : undefined });
    if (lit > 0.3) put('glow', 'glow', { k: 'glow', p: e, c: FLAME[2], r: 10, a: 0.4 * lit });
  }
  return bits;
}

// ---------------------------------------------------------------------------------------------
// THE CARRION QUEEN AS A MONSTER OF THE BONES (her stand, her hop, her talon rake and her flinch, so far: her
// death is her stand, not for use)

function cqMove(name: string, motion: Motion): MobMove {
  return { name, motion, rest: CQ_REST };
}
export const CARRION_QUEEN: Mob = (() => {
  const stand = cqMove('The Carrion Queen, mantled', cqStand());
  const walk: MobMove = { ...cqMove('The Carrion Queen hops', cqWalk()), period: CQ_WALK.frames / CQ_WALK.fps, ground: CQ_PACE * TILE3 };
  const attack: MobMove = { ...cqMove('The Carrion Queen rakes with her talons', cqRake()), trail: (sk) => [sk.toeR], trailOver: (t) => t > 0.8 && t <= CQ_RAKE.hit + 0.05, trailSpan: 3 };
  return {
    id: 'carrion-queen',
    name: 'The Carrion Queen',
    size: 'a boss: perched, about the Unfinished; her wings wider than the trail',
    build: B,
    stand,
    attack,
    idleFrames: 26,
    idleFps: 10,
    walk,
    walkFrames: CQ_WALK.frames,
    walkFps: CQ_WALK.fps,
    pace: CQ_PACE,
    reel: cqMove('The Carrion Queen is struck', cqReel()),
    reelTime: 0.4,
    hit: CQ_RAKE.hit,
    warn: CQ_RAKE.warn,
    dieTime: 2,
    dying: stand,
    aura: { x: CQ_CANVAS.ax, y: CQ_CANVAS.ay - 120, r: 150, color: '#ff3a78', a: 0.16 },
    shadow: 80,
    canvas: CQ_CANVAS,
    bits: (st, m) => cqBits(st, m),
  };
})();

/** One picture of her in a move, `t` seconds in, as the game holds a figure. */
export function queenFrame(move: string, t: number, view: GameView = 'front'): Sprite {
  const can = canvasOf(CARRION_QUEEN);
  return toSprite(paintMob(CARRION_QUEEN, move, t, view, ENEMY_RIM), null, can.ax, can.ay);
}

/** One picture of her standing, `t` seconds into her breath, as the game holds a figure. */
export function queenStanding(t: number, view: GameView = 'front'): Sprite {
  const can = canvasOf(CARRION_QUEEN);
  return toSprite(paintMob(CARRION_QUEEN, 'stand', t, view, ENEMY_RIM), null, can.ax, can.ay);
}
/** The same, or in a move, as painted (for the checks). */
export function queenPainted(t: number, view: GameView = 'front', move = 'stand'): Painted {
  return paintMob(CARRION_QUEEN, move, t, view, ENEMY_RIM);
}
