// FLOOR 7'S SMALL MOBS, THE VULTURES OF THE LEDGE ROAD: a mock-up (nothing of the game imports this file;
// `VULTURE_ON` is off).
//
// HIS BRIEF, asked as his art rulebook's questions for a new character (14 Oct, each his pick, the labels as he
// tapped them): how big, “About your height (Recommended)”, asked as “The floor 7 vulture: how big? (They circle
// over the drop, and the cult chains some on its perch.)”; the one thing to know it by, “Bald head, hooked beak
// (Recommended)”; how it moves, “Circling, then a sudden dive (Recommended)”; what it carries, and how it attacks,
// “A broken cult chain on one leg” (its own words: its attack is still the dive); how it dies, “Knocked from the
// air, lands on its back (Recommended)”; what it must never look like, “Not a cute or heroic bird (Recommended)”;
// its sound, “A harsh shriek on the dive” (its own words: quiet while it circles, a screech as it dives, its wings
// flapping).
//
// ITS STANDING PICTURE: his yes, 14 Oct (his words, 10:34: "Yes"). It is built as every monster is, on the heroes' bones
// (art/skeleton.ts), at the knight's height (KNIGHT_BODY's 58), dressed in solids through art/new_mobs3.ts's painter,
// lit from the upper left, the enemy's pink edge round it: a bird on a man's bones, hunched, its wings folded down its
// back like a ragged mantle, its feathers hung from the arm's bones; its legs his, bare and scaled below the
// trousers of feathers, the feet with great taloned toes; its neck bare and wrinkled, its head small and bald, its
// hooked beak dull horn, its eyes the enemy's fire. On its left leg the cult's shackle, its chain broken, dragging.
// Dull and dusty: never a songbird, never a proud eagle, never a sleek crow.
//
// ITS WALK: circling flight, sixteen frames a second (`VULTURE_WALK`, below): a flier, its feet tucked up and off the
// floor all the round, one wing beat a round, its chain and tail streaming behind it. ITS DIVE, its one attack
// (`VULTURE_DIVE`): the warning, the head-first stoop, the strike held a tenth of a second, the pull-out. Both are drawn
// for his yes (14 Oct; his "Yes" to the first walk came before the rulebook check, so the walk was revised: see the
// README). Its flinch and its death (knocked from the air, down on its back) are still placeholders no picture shows.

import type { Sprite } from '../engine/px';
import { hash, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME, IRON } from './mkit';
import { at3, canvasOf, paintMob, sphere, TILE3 } from './new_mobs3';
import type { Bit, Mob, MobMove, Moment, Put } from './new_mobs3';
import type { GameView, Stage } from './skin';
import { add, buildOf, cross, dot, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const VULTURE_ON = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const fr = (t: number): number => t - Math.floor(t);
const Z: V3 = [0, 0, 1];

// ---------------------------------------------------------------------------------------------
// ITS BODY: about the knight's height (KNIGHT_BODY: 58), hunched, a bird's trunk and long bare neck, its limbs his.

/** ABOUT YOUR HEIGHT: the knight's picture (moves3.ts's KNIGHT_BODY). */
export const VULTURE_TALL = 58;
const V = VULTURE_TALL;
export const VULTURE_BODY: Build = {
  ...buildOf(V, 0.85, { shoulders: 1.2, chest: 1.5, depth: 1.4, waist: 1.3, hips: 1.25, legs: 0.72, arms: 1.25, trunk: 1.06, limbs: 1.3, pad: 1.3 }),
  neck: 0.13 * V,
  headFwd: 0.05 * V,
};
const VB = VULTURE_BODY;
/** Her, the body's plumage round its great chest: the radii of the plumage ball over the ribs. */
const VCR: V3 = [VB.ribDeep + 2.2, VB.ribHalf + 2.4, VB.chest * 0.8];
const ARM = VB.upperArm + VB.foreArm;

// Its colours (never pink, never glossy: dull, dusty, the bare skin grey-tan). The enemy's fire is the only pink.
const PLUME: Ramp = ['#1a1614', '#1a1614', '#3a302a', '#56483f', '#6e5e52'];
const MANTLE: Ramp = ['#161311', '#161311', '#332a24', '#4d4139', '#665850'];
const QUILL: Ramp = ['#141110', '#141110', '#2e2723', '#463b35', '#5e5049'];
const RUFF: Ramp = ['#2c2622', '#2c2622', '#463c36', '#5a4f46', '#6b6056'];
const BALD: Ramp = ['#4a4440', '#4a4440', '#8a817a', '#a39a92', '#bdb4ab'];
const SCALY: Ramp = ['#3a3634', '#3a3634', '#77706a', '#948c85', '#b0a8a0'];
const TALON: Ramp = ['#100e0d', '#100e0d', '#2a2624', '#46403c', '#625b55'];
const HORN: Ramp = ['#3a322c', '#3a322c', '#7a6c5e', '#9a8c7c', '#b8aa98'];

/** ITS REST: hunched, its body tipped forward, its head low on its sunk neck; its wings folded down its back. */
export const VULTURE_REST: Bones = {
  ...standing(VB),
  pz: -2, px: 0, yaw: 0, pitch: 10, roll: 0, twist: 0, bend: 8, side: 0,
  faceTurn: -10, faceUp: -14, faceTilt: 3,
  lfx: 1, lfy: 3, lft: 8, lk: 8, rfx: -1, rfy: -3, rft: -6, rk: -8,
  lhIn: 0, lhx: 6, lhy: ARM * 0.55, lhz: -ARM * 0.25, le: 55,
  rhIn: 0, rhx: 6, rhy: -ARM * 0.55, rhz: -ARM * 0.25, re: 55,
};

/** ITS BREATH: its bulk heaves, its wings stir and settle, its head turns to look, then back. 2.4 s round. */
export const VULTURE_BREATH = 2.4;
function vStand(): Motion {
  const R = VULTURE_REST;
  return {
    loop: 0,
    keys: [
      { at: 0, pose: {} },
      { at: 0.9, pose: { pz: R.pz + 1.5, py: 2, pitch: R.pitch + 1.5, lhy: R.lhy + 2, rhy: R.rhy - 2, lhz: R.lhz + 2, rhz: R.rhz + 2 }, ease: 'io' },
      { at: 1.2, pose: { pz: R.pz + 1, py: 1.6, faceTurn: R.faceTurn + 16, faceUp: R.faceUp + 3, faceTilt: R.faceTilt - 4 }, ease: 'out' },
      { at: 1.8, pose: { pz: R.pz + 0.6, py: 0.8, faceTurn: R.faceTurn + 18, faceUp: R.faceUp + 2, faceTilt: R.faceTilt - 4 }, ease: 'io' },
      { at: VULTURE_BREATH, pose: {}, ease: 'io' },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// ITS PAINTER: the same solids as the Queen's (a feather as a flat panel, a plumed ball, a rod, a dot), at its size.

/** A feather as a long flat panel (as carrion_queen.ts's, at the vulture's size): from `root` along `dir`. */
function feather(put: Put, part: string, root: V3, dir: V3, across: V3, len: number, w: number, ramp: Ramp, seed: number): void {
  const d = norm(dir, [0, 0, -1]);
  const a0 = norm(sub(across, mul(d, dot(across, d))), [0, 1, 0]);
  const c = add(root, mul(d, len / 2));
  const flat = Math.abs(cross(d, a0)[2]) > 0.55;
  put(part, part, {
    k: 'panel',
    c,
    u: mul(d, len / 2),
    v: mul(a0, w),
    skin: (a, b, _front, tone) => {
      const along = (a + len / 2) / len;
      const half = w * (along > 0.8 ? 1 - (along - 0.8) * 3.2 : 1);
      if (Math.abs(b) > half) return null;
      if (along > 0.86 && hash(seed, Math.floor(b * 0.8 + 9), 3101) > 0.62) return null;
      const t = flat ? Math.min(tone, 2) : tone;
      if (Math.abs(b) < 0.5 && along < 0.9) return ramp[Math.min(flat ? 3 : 4, t + 1)];
      if (Math.abs(b) > half - 0.9) return ramp[Math.max(0, t - 1)];
      return ramp[t];
    },
  });
}

/** Its plumage on a round solid: the scalloped tips of the small feathers in rows, each row's tips a tone down. */
const plumed = (u: V3, tone: number): string => {
  const t = Math.min(3, tone);
  const rowF = (u[2] + 1) * 4.5;
  const row = Math.floor(rowF);
  const around = (Math.atan2(u[1], u[0]) + Math.PI) * 2.6 + row * 0.5;
  const cx = fr(around) - 0.5;
  const fy = fr(rowF);
  const edge = fy < 0.1 + 1.6 * cx * cx && fy > 1.6 * cx * cx - 0.08;
  if (edge) return PLUME[Math.max(0, t - 2)];
  if (fy < 0.3 + 1.6 * cx * cx) return PLUME[Math.max(0, t - 1)];
  return PLUME[t];
};
/** The same for its wings: the mantle's rows, darker. */
const mantled = (u: V3, tone: number): string => {
  const c = plumed(u, tone);
  return c === PLUME[0] || c === PLUME[1] ? MANTLE[1] : c === PLUME[2] ? MANTLE[2] : c === PLUME[3] ? MANTLE[3] : MANTLE[4];
};

/**
 * ITS WING on one side, folded down its back: the coverts over the arm, the secondaries down from the forearm, the
 * primaries from the wrist. IN FLIGHT (`flying`: its feet tucked up, see vBits) the same wing is spread: its primaries
 * fan out from the wrist along the arm and trail back, its secondaries trail back from the forearm, so that the wing is
 * a sheet that beats up and down rather than a cloak. At rest (the approved standing picture) nothing of this is used.
 */
function vWing(put: Put, s: Skeleton, side: 'L' | 'R', cf: V3, flying = false): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const wr = side === 'L' ? s.handL : s.handR;
  const sgn = side === 'L' ? 1 : -1;
  const part = side === 'L' ? 'wingL' : 'wingR';
  const out = norm(sub(wr, sh), [0, sgn, 0]);
  // (a folded wing hangs: down, a little back, out at the tips)
  const hangDir = (k: number): V3 => norm(add(add(mul(Z, -1), mul(cf, -0.1 - 0.2 * k)), mul(out, 0.2 * (1 - k))));
  // (in flight: out along the arm, back, and a little down; the far feathers swing further out and back)
  const fanDir = (k: number): V3 => norm(add(add(mul(out, 0.85 - k * 0.25), mul(cf, -0.55 - 0.25 * k)), mul(Z, -0.1)));
  const trailDir = (k: number): V3 => norm(add(add(mul(cf, -0.95), mul(out, 0.25 * (1 - k))), mul(Z, -0.15)));
  const base = side === 'L' ? 3000 : 3100;
  for (let i = 0; i < 6; i++) {
    const k = i / 5;
    const dir = flying ? fanDir(k) : norm(add(add(mul(Z, -1), mul(cf, -0.1 * k)), mul(out, 0.9 - k * 0.8)));
    feather(put, part, add(wr, mul(out, 1.5 - k * 3)), dir, out, 20 - k * 3, 2.6, QUILL, base + i);
  }
  for (let i = 0; i < 6; i++) {
    const k = i / 5;
    feather(put, part, lerp3(wr, el, k), flying ? trailDir(k) : hangDir(k), out, 18 - k * 3, 2.8, QUILL, base + 20 + i);
  }
  for (let i = 0; i < 3; i++) {
    const k = i / 2;
    feather(put, part, lerp3(el, sh, k * 0.6), norm(add(hangDir(1), mul(cf, -0.25))), out, 16 - k * 2, 3.2, MANTLE, base + 40 + i);
  }
  for (let i = 0; i <= 8; i++) {
    const k = i / 8;
    const p = k < 0.45 ? lerp3(sh, el, k / 0.45) : lerp3(el, wr, (k - 0.45) / 0.55);
    const r = (VB.armR[0] * (1 - k) + VB.armR[2] * k) * 0.8 + 0.9;
    put(part, part, { k: 'ball', c: add(p, mul(Z, -r * 0.3)), ax: [mul(cf, r), mul(out, r * 1.1), mul(Z, r * 1.15)], skin: mantled });
  }
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 6; i++) {
      const k = i / 5;
      feather(put, part, add(lerp3(wr, sh, k * 0.9), mul(Z, 2 - row * 3)), hangDir(k), out, 10 - row * 2, 2.8, MANTLE, base + 60 + row * 10 + i);
    }
  }
}

/** ITS LEG on one side: the thigh lost in a trouser of dark feathers, the bare scaled shank, the great toes and talons; on its left, the cult's shackle, its chain broken, dragging. */
function vLeg(put: Put, s: Skeleton, side: 'L' | 'R', cf: V3, trail?: V3[]): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const part = side === 'L' ? 'legL' : 'legR';
  const [rH, rK, rA] = VB.legR;
  const tc = lerp3(hip, knee, 0.6);
  const tu = norm(sub(hip, knee), Z);
  const tf = norm(sub(cf, mul(tu, dot(cf, tu))), [1, 0, 0]);
  put(part, part, { k: 'ball', c: tc, ax: [mul(tf, rH * 1.25), mul(cross(tu, tf), rH * 1.2), mul(tu, (Math.hypot(...sub(hip, knee)) / 2) * 1.1)], skin: (u, tone) => (fr((u[2] + 1) * 3 + u[1] * 0.6) < 0.16 ? PLUME[Math.max(0, tone - 1)] : PLUME[tone]) });
  put(part, part, { k: 'rod', a: lerp3(knee, ankle, 0.15), b: ankle, ra: rK * 0.5, rb: rA * 0.6, ramp: SCALY });
  put(part, part, { k: 'ball', c: ankle, ax: sphere(rA * 0.7), skin: SCALY });
  // the foot: three great toes forward, spread, one back; each a dark talon hooked down at its end
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const acr: V3 = norm([-fwd[1], fwd[0], 0], [0, 1, 0]);
  const toes: [number, number][] = [[-0.55, 7], [0, 8.5], [0.55, 7], [Math.PI, 4.5]];
  toes.forEach(([ang, len]) => {
    const dir = norm(add(mul(fwd, Math.cos(ang)), mul(acr, Math.sin(ang))));
    const a = add(ankle, mul(Z, -rA * 0.4));
    const kn = add(a, add(mul(dir, len * 0.55), [0, 0, -rA * 0.7]));
    const end = add(kn, add(mul(dir, len * 0.45), [0, 0, -1]));
    put(part, part, { k: 'rod', a, b: kn, ra: rA * 0.4, rb: rA * 0.34, ramp: SCALY });
    put(part, part, { k: 'rod', a: kn, b: end, ra: rA * 0.34, rb: rA * 0.28, ramp: SCALY });
    put(part, part, { k: 'rod', a: end, b: add(end, add(mul(dir, 2.6), [0, 0, -1.8])), ra: rA * 0.3, rb: 0.5, ramp: TALON });
  });
  if (side === 'L') {
    const su = norm(sub(knee, ankle), Z);
    const sf = norm(sub(cf, mul(su, dot(cf, su))), [1, 0, 0]);
    const rc = lerp3(ankle, knee, 0.25);
    // (the chain drags out to its own side, so it shows from in front as well as behind)
    const cl = s.chest[1];
    put('shackle', 'shackle', { k: 'ball', c: rc, ax: [mul(sf, rK * 0.7), mul(cross(su, sf), rK * 0.7), mul(su, 1.6)], skin: IRON });
    for (let i = 0; i < 6; i++) {
      const k = (i + 1) / 6;
      let p = add(add(rc, mul(cl, rK * 0.6 + k * 9)), [0, 0, -(rc[2] - 0.5) * Math.min(1, k * 1.6)]);
      // IN FLIGHT the chain streams back and down from the foot: each link where the foot was a little earlier
      // (`trail`: the foot's own history, newest first), and dragged back and down by the air
      if (trail) {
        const was = trail[Math.min(trail.length - 1, Math.round(k * 8))];
        p = add(add(rc, mul(sub(was, trail[0]), 0.6)), add(mul(cf, -(3 + 9 * k)), mul(Z, -(2 + 10 * k))));
      }
      put('shackle', 'shackle', { k: 'ball', c: p, ax: sphere(1.1), skin: IRON });
    }
  }
}

/** Where its head is: low, forward of the root of its neck, turned as its face is. */
const vHead = (s: Skeleton): V3 => {
  const f = s.face[0];
  const flat = norm([f[0], f[1], 0], [1, 0, 0]);
  return add(add(s.neck, mul(s.chest[0], 0.5)), add(mul(flat, 5.5), [0, 0, 1.3 + f[2] * 2.2]));
};

/** ITS BODY AS SOLIDS: legs, tail, the great chest and its folded wings, the ruff, the bare neck, the bald head, the hooked beak, its eyes. */
function vBits(st: Stage, m: Moment): Bit[] {
  void st;
  const { s, q } = m;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);

  // --- ITS LEGS ---
  vLeg(put, s, 'L', cf, m.trails?.[0]);
  vLeg(put, s, 'R', cf);

  // --- ITS TAIL: a short fan of worn feathers behind ---
  const [hf, hl, hu] = s.hips;
  const tailTrail = m.trails?.[1];
  for (let i = 0; i < 5; i++) {
    const k = (i - 2) / 2;
    const root = add(s.pelvis, add(mul(hf, -VB.pelvisDeep - 1), mul(hl, k * 4)));
    let dir = norm(add(add(mul(hf, -0.7), mul(hu, -0.8)), mul(hl, k * 0.3)));
    // IN FLIGHT the tail streams back as the body has been: each feather stays on the body, and points back the way the
    // pelvis came (the air streams it out behind)
    if (tailTrail) {
      const lag = sub(tailTrail[Math.min(tailTrail.length - 1, 2 + i)], tailTrail[0]);
      const len = Math.hypot(...lag);
      if (len > 1e-6) dir = norm(add(dir, mul(lag, 0.7 / len)));
    }
    feather(put, 'tail', root, dir, hl, 20 - Math.abs(k) * 2.5, 2.4, QUILL, 3300 + i);
  }

  // --- ITS BODY: the great chest, its back's mantle ---
  const chestC = add(s.ribs, add(mul(cu, VB.chest * 0.3), mul(cf, 2)));
  const spineUp = norm(sub(add(chestC, mul(cu, VCR[2] * 0.6)), s.pelvis), cu);
  const bodyF = norm(sub(cf, mul(spineUp, dot(cf, spineUp))), cf);
  const bodyL = norm(cross(spineUp, bodyF), cl);
  const bodyLen = Math.hypot(...sub(add(chestC, mul(cu, VCR[2] * 0.6)), s.pelvis));
  put('body', 'body', { k: 'ball', c: lerp3(s.pelvis, add(chestC, mul(cu, VCR[2] * 0.6)), 0.5), ax: [mul(bodyF, VCR[0] + 1), mul(bodyL, VCR[1] * 0.9), mul(spineUp, bodyLen * 0.62)], skin: plumed });

  // --- ITS WINGS, folded down its back (spread, in flight: its feet tucked up, which its standing pose never has) ---
  const flying = q.lfz > 10;
  vWing(put, s, 'L', cf, flying);
  vWing(put, s, 'R', cf, flying);

  // --- ITS RUFF: a ring of dull pale feathers round the foot of its neck: short, sunk, never a crown ---
  const nr = add(s.neck, mul(cf, 1));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const radial = norm(add(mul(cf, Math.cos(a)), mul(cl, Math.sin(a))));
    const root = add(nr, mul(radial, 2.5));
    const dir = norm(add(mul(radial, 0.7), mul(Z, 0.5)));
    feather(put, 'ruff', root, dir, cross(dir, radial), 8 + (i % 2) * 2 - Math.max(0, Math.cos(a)) * 2, 1.9, RUFF, 3500 + i);
  }

  // --- ITS BARE NECK, wrinkled; ITS HEAD, small and bald; ITS HOOKED BEAK; ITS EYES, the enemy's fire ---
  const [ff, fl, fu] = s.face;
  const hr: V3 = [VB.headR[0] * 1.15, VB.headR[1] * 1.1, VB.headR[2] * 1.05];
  const head = vHead(s);
  const mid = add(lerp3(nr, head, 0.5), mul(Z, 1.5));
  const wrinkled = (u: V3, tone: number): string => (fr((u[2] + 1) * 4 + u[0] * 1.5) < 0.2 ? BALD[Math.max(0, tone - 1)] : BALD[tone]);
  put('neck', 'neck', { k: 'rod', a: add(nr, mul(cu, 2)), b: mid, ra: 3.0, rb: 2.4, ramp: BALD });
  put('neck', 'neck', { k: 'rod', a: mid, b: head, ra: 2.4, rb: 2.2, ramp: BALD });
  put('head', 'head', { k: 'ball', c: head, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: wrinkled });
  // (a brow ridge over each eye: a scowl, never noble)
  put('head', 'head', { k: 'ball', c: at3(head, s.face, hr[0] * 0.25, 0, hr[2] * 0.55), ax: [mul(ff, hr[0] * 0.6), mul(fl, hr[1] * 1.0), mul(fu, hr[2] * 0.3)], skin: BALD });
  // its beak: deep at its root, hooked down hard at its tip, the tip dark
  const b0 = at3(head, s.face, hr[0] * 0.6, 0, -hr[2] * 0.05);
  const b1 = at3(head, s.face, hr[0] * 1.7, 0, hr[2] * 0.1);
  const b2 = at3(head, s.face, hr[0] * 2.1, 0, -hr[2] * 0.9);
  put('beak', 'beak', { k: 'rod', a: b0, b: b1, ra: hr[2] * 0.55, rb: hr[2] * 0.42, ramp: HORN });
  put('beak', 'beak', { k: 'ball', c: b1, ax: [mul(ff, hr[2] * 0.5), mul(fl, hr[2] * 0.45), mul(fu, hr[2] * 0.55)], skin: HORN });
  put('beak', 'beak', { k: 'rod', a: add(b1, mul(ff, hr[2] * 0.2)), b: b2, ra: hr[2] * 0.36, rb: 0.6, ramp: TALON });
  // its eyes, burning pink (the enemy's fire, as the Queen's), burning hotter and going to gold as it winds up and
  // strikes (`glint`; at rest it is 0, the standing picture as it was)
  const g = clamp01(m.glint);
  for (const sgn of [1, -1]) {
    const e = at3(head, s.face, hr[0] * 0.3, sgn * hr[1] * 0.9, hr[2] * 0.35);
    put('head', 'eye', { k: 'dot', p: e, c: lit > 0.3 ? (g > 0.6 ? FLAME[3] : FLAME[2]) : BALD[1], facing: add(mul(fl, sgn), mul(ff, 0.6)), c2: lit > 0.3 ? FLAME[3] : undefined });
    if (lit > 0.3) put('glow', 'glow', { k: 'glow', p: e, c: FLAME[2], r: 6 + 4 * g, a: 0.4 * lit * (1 + 1.5 * g) });
  }
  return bits;
}

// ---------------------------------------------------------------------------------------------
// ITS WALK: CIRCLING FLIGHT (his brief: "Circling, then a sudden dive (Recommended)"). It is a flier, not a walker:
// its feet are tucked up under it and off the floor all the round (there is no floor for them to grip, so
// art/act1_feet.ts's footwork does not apply); its wings beat once a round (a second: down, its body lifting on the
// stroke, then up again); its body is banked and pitched into its turn, and its head held down toward the ground it
// circles over.

/** ITS PACE, tiles a second: the drift of its circling. Mine to set (the game's own speed for it is the main chat's). */
export const VULTURE_PACE = 1.2;
/** ITS WALK: one round is one wing beat, sixteen frames at sixteen a second (the rulebook's: monsters walk 16). */
export const VULTURE_WALK = { frames: 16, fps: 16 } as const;
/** How far its body is lifted over its standing height, and its feet over the floor, in picture pixels. */
const FLY_BODY = 12;
const FLY_FEET = 20;

/**
 * ITS POSE `t` seconds into a round of its walk. `k` runs from 1 (its wings up) through 0 to -1 (its wings down,
 * half a round on) and back: the downstroke lifts its body, the upstroke lets it sink a little. Its wings are spread
 * out to either side, their hands rising and falling with the stroke; its feet are drawn up under its belly.
 */
export function vultureWalkPose(t: number): Partial<Bones> {
  const R = VULTURE_REST;
  const ph = 2 * Math.PI * t;
  const k = Math.cos(ph);
  const s = Math.sin(ph);
  const wingY = ARM * 0.88;
  // THE STROKE, kinetic (the rulebook's Animations 1, a notch high): its hands go a long way up (k = 1) and a long way
  // down (k = -1); its elbows fold on the way up and straighten on the way down; its body heaves up on each downstroke
  // and banks, and its head dips with the beat
  const wingZ = -ARM * 0.1 + ARM * 0.95 * k;
  const fp = 14;
  return {
    pz: R.pz + FLY_BODY - 4 * k,
    pitch: R.pitch + 14 + 2.5 * k,
    roll: 9 + 4 * s,
    yaw: 5 * s,
    faceUp: R.faceUp - 8 - 1.5 * k,
    faceTurn: R.faceTurn + 4 * s,
    faceTilt: -5,
    lhx: R.lhx, lhy: wingY, lhz: wingZ, le: R.le + 22 * k,
    rhx: R.rhx, rhy: -wingY, rhz: wingZ, re: R.re + 22 * k,
    lfx: R.lfx + 4, lfy: R.lfy - 0.45 * VB.stance, lfz: FLY_FEET, lfp: fp, lk: R.lk + fp * 0.3,
    rfx: R.rfx + 4, rfy: R.rfy + 0.45 * VB.stance, rfz: FLY_FEET, rfp: fp, rk: R.rk - fp * 0.3,
  };
}

/** Its walk's keys: a key at each of its frames, so that the round is exactly the frames it is shown in. */
function vultureWalkKeys(): Key3[] {
  const keys: Key3[] = [];
  for (let i = 0; i <= VULTURE_WALK.frames; i++) {
    const t = i / VULTURE_WALK.fps;
    keys.push({ at: t, ease: 'lin', pose: vultureWalkPose(t) });
  }
  return keys;
}

// ---------------------------------------------------------------------------------------------
// ITS LOOSE THINGS FOLLOW (the rulebook's Movement 4): in flight its chain and its tail stream back as its body has
// been, so the flight leaves them where its foot and its pelvis were a little earlier (`trail`, newest first).

/** The points of it whose way the flight streams: its left foot (the chain's end) and its pelvis (the tail's root). */
const trailOfFlight = (s: Skeleton): V3[] => [s.ankleL, s.pelvis];

// ---------------------------------------------------------------------------------------------
// ITS DIVE, its one attack (the rulebook: every attack winds up, holds its warning, strikes and follows through). It
// climbs with its wings up high and holds there, trembling (THE WARNING, from 0.25 s); it stoops head first, its wings
// folded back and its talons out before it; it strikes at 0.70 s and holds for a tenth of a second (Movement 7: a heavy
// blow lands with a freeze); it pulls out heavily, its wings snapped wide, and comes back to its circling. It ends on
// the walk's first pose, so the walk takes it up again with no jump. Thirty frames a second (attacks and moves 30).

/** ITS DIVE, in seconds: how long; when the warning begins; when the blow lands; how long it holds after that. */
export const VULTURE_DIVE = { long: 1.2, warn: 0.25, hit: 0.7, freeze: 0.1, fps: 30 } as const;

/**
 * A smooth way from one (time, value) point to the next: 'io' (the default, slow at both ends), 'in' (speeding up) or
 * 'out' (slowing down). The point's own ease is the stretch that leaves it. Held at the ends.
 */
function stretch(t: number, pts: ReadonlyArray<readonly [number, number, ('in' | 'out')?]>): number {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, va, how] = pts[i];
    const [b, vb] = pts[i + 1];
    if (t <= b) {
      const u = (t - a) / (b - a);
      const e = how === 'in' ? u * u : how === 'out' ? 1 - (1 - u) * (1 - u) : (1 - Math.cos(Math.PI * u)) / 2;
      return va + (vb - va) * e;
    }
  }
  return pts[pts.length - 1][1];
}

/** The dive's pose `te` seconds in, not counting the freeze: its wind-up, its hold, its stoop, its strike, its pull-out. */
function divePoseAt(te: number): Partial<Bones> {
  const R = VULTURE_REST;
  const W = (f: keyof Bones): number => vultureWalkPose(0)[f] as number;
  const A = ARM;
  // (hanging at the top, the warning: its wings and its tucked feet tremble, as the Queen's do)
  const w0 = VULTURE_DIVE.warn;
  const tremble = te > w0 && te < 0.5 ? Math.sin((te - w0) * 2 * Math.PI * 11) * Math.sin(((te - w0) / (0.5 - w0)) * Math.PI) : 0;
  const lhy = stretch(te, [[0, W('lhy')], [0.25, A], [0.5, A * 1.05, 'in'], [0.7, A * 0.55], [0.9, A * 1.15], [1.1, W('lhy')]]);
  const lhz = stretch(te, [[0, W('lhz')], [0.25, A * 1.05], [0.5, A * 1.05, 'in'], [0.7, -A * 0.5], [0.9, A * 0.7], [1.1, W('lhz')]]) + 2.2 * tremble;
  const le = stretch(te, [[0, W('le')], [0.25, R.le + 30], [0.5, R.le + 30, 'in'], [0.7, R.le + 52], [0.9, R.le + 8], [1.1, W('le')]]);
  // (its head pointing down at the strike: well past upright, the body's belly to the ground)
  const pitch = stretch(te, [[0, W('pitch')], [0.25, R.pitch - 6], [0.5, R.pitch - 6, 'in'], [0.7, R.pitch + 120], [0.9, R.pitch - 4], [1.1, W('pitch')]]);
  const pz = stretch(te, [[0, W('pz')], [0.25, R.pz + 26], [0.5, R.pz + 26, 'in'], [0.7, R.pz + 12], [0.9, R.pz + 20], [1.1, W('pz')]]);
  const px = stretch(te, [[0, R.px], [0.25, -4], [0.5, -4, 'in'], [0.7, 28], [0.9, 28], [1.1, R.px]]);
  const roll = stretch(te, [[0, W('roll')], [0.25, 0], [0.5, 0, 'in'], [0.7, 12], [0.9, 4], [1.1, W('roll')]]);
  const faceUp = stretch(te, [[0, W('faceUp')], [0.25, R.faceUp - 4], [0.5, R.faceUp - 4, 'in'], [0.7, R.faceUp - 20], [0.9, R.faceUp - 6], [1.1, W('faceUp')]]);
  const faceTurn = stretch(te, [[0, W('faceTurn')], [0.25, R.faceTurn + 6], [0.5, R.faceTurn + 6], [0.7, R.faceTurn + 2], [0.9, R.faceTurn], [1.1, W('faceTurn')]]);
  // its feet: tucked up under it, then its talons thrust out before it for the strike, then trailed back
  const fx = (rest: number, end: number): number => stretch(te, [[0, end], [0.25, rest - 3], [0.5, rest - 3, 'in'], [0.7, rest + 26], [0.9, rest - 4], [1.1, end]]);
  const fz = stretch(te, [[0, FLY_FEET], [0.25, FLY_FEET + 6], [0.5, FLY_FEET + 6, 'in'], [0.7, 14], [0.9, FLY_FEET + 6], [1.1, FLY_FEET]]);
  const fp = stretch(te, [[0, 14], [0.25, 20], [0.5, 20, 'in'], [0.7, 42], [0.9, 24], [1.1, 14]]);
  return {
    px, pz, pitch, roll, yaw: 0, faceUp, faceTurn, faceTilt: -5,
    lhx: R.lhx, lhy, lhz, le,
    rhx: R.rhx, rhy: -lhy, rhz: lhz, re: le,
    lfx: fx(R.lfx, W('lfx')), lfy: R.lfy - 0.45 * VB.stance, lfz: fz, lfp: fp + 2.5 * tremble, lk: R.lk + 14 * 0.3,
    rfx: fx(R.rfx, W('rfx')), rfy: R.rfy + 0.45 * VB.stance, rfz: fz, rfp: fp - 2.5 * tremble, rk: R.rk - 14 * 0.3,
  };
}

/** ITS DIVE `t` seconds in, as the game holds it: the strike's freeze taken out of the time the pose moves in. */
export function vultureDivePose(t: number): Partial<Bones> {
  const { hit, freeze, long } = VULTURE_DIVE;
  const te = t <= hit ? t : t < hit + freeze ? hit : t - freeze;
  return divePoseAt(Math.min(te, long - freeze));
}

/** Its dive's keys: a key at each frame (thirty a second), the last at `long`, on the walk's first pose. */
function vultureDiveKeys(): Key3[] {
  const keys: Key3[] = [];
  const n = Math.round(VULTURE_DIVE.long * VULTURE_DIVE.fps);
  for (let i = 0; i <= n; i++) {
    const t = i / VULTURE_DIVE.fps;
    keys.push({ at: t, ease: 'lin', pose: vultureDivePose(t) });
  }
  return keys;
}

/** Its eyes: they burn hotter as it winds up (the warning), flare as it stoops, and fade after the strike. `glint`, 0 to 1. */
function vultureDiveGlint(t: number): number {
  const { warn, hit, freeze } = VULTURE_DIVE;
  if (t < warn) return 0;
  if (t < 0.5) return (t - warn) / (0.5 - warn);
  if (t < hit + freeze) return 1;
  return Math.max(0, 1 - (t - hit - freeze) / 0.3);
}

/** ITS DIVE, its one attack: the warning, the strike and the pull-out; its chain and its tail stream as it goes. */
const vultureDive: MobMove = {
  name: 'The vulture dives',
  motion: { keys: vultureDiveKeys(), hit: VULTURE_DIVE.hit },
  rest: VULTURE_REST,
  glint: vultureDiveGlint,
  trail: trailOfFlight,
  trailOver: () => true,
  trailSpan: 10,
};

// ---------------------------------------------------------------------------------------------
// ITS MOB. The flinch and the death are placeholders (the standing motion); no picture of them is made from this file yet.

function vMove(name: string, motion: Motion): MobMove {
  return { name, motion, rest: VULTURE_REST };
}

/** THE VULTURE, as it is for the game: a small monster (its one attack is the dive, `attack`). */
export const VULTURE: Mob = {
  id: 'vulture',
  name: 'The vulture',
  size: 'small: about your height; it circles over the drop',
  build: VB,
  stand: vMove('The vulture, hunched', vStand()),
  attack: vultureDive,
  idleFrames: 24,
  idleFps: 10,
  walk: { name: 'The vulture circles', motion: { keys: vultureWalkKeys(), loop: 0 }, rest: VULTURE_REST, period: VULTURE_WALK.frames / VULTURE_WALK.fps, ground: VULTURE_PACE * TILE3, trail: trailOfFlight, trailOver: () => true, trailSpan: 12 },
  walkFrames: VULTURE_WALK.frames,
  walkFps: VULTURE_WALK.fps,
  pace: VULTURE_PACE,
  reel: vMove('The vulture is struck (placeholder)', vStand()),
  reelTime: 0.4,
  hit: VULTURE_DIVE.hit,
  warn: VULTURE_DIVE.warn,
  dieTime: 1.2,
  dying: vMove('The vulture dies (placeholder)', vStand()),
  aura: { x: 84, y: 92, r: 60, color: '#ff3a78', a: 0.08 },
  shadow: 22,
  bits: (st, m) => vBits(st, m),
};

/** One picture of the vulture standing, `t` seconds into its breath, as the game holds a figure. */
export function vultureStanding(t: number, view: GameView = 'front'): Sprite {
  const can = canvasOf(VULTURE);
  return toSprite(paintMob(VULTURE, 'stand', t, view, ENEMY_RIM), null, can.ax, can.ay);
}

/** One picture of the vulture in any of its moves, `t` seconds into it, as the game holds a figure. */
export function vultureFrame(move: string, t: number, view: GameView = 'front'): Sprite {
  const can = canvasOf(VULTURE);
  return toSprite(paintMob(VULTURE, move, t, view, ENEMY_RIM), null, can.ax, can.ay);
}

/** The same, painted (for the checks). */
export function vulturePainted(t: number, view: GameView = 'front', move = 'stand'): Painted {
  return paintMob(VULTURE, move, t, view, ENEMY_RIM);
}
