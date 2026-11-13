// FLOOR 5, THE TEMPLE DOOR'S TWO KEY-BEARERS (game/temple_door.ts, behind TEMPLE_DOOR, off; docs/mockups/temple_door/README.md has
// every word of his). His words, 13 Nov 2026: “I think just like a souped up version of the dagger cultist and a super version of the
// plane cult that makes sense flame fire cultist”; their brief: “Head taller, broad, menacing (Recommended)”, “Bone mask / burning robe
// (Recommended)”, “Key rings to the floor (Recommended)”.
//
// THE KEYBEARER OF THE KNIFE: the dagger cultist (art/cultists.ts, his yes long since) made a head taller and broader as one piece
// (every part of him, `KEY_K` times, from his floor point), and known at a glance by A BONE MASK in his cowl, its eye slits the enemy's
// pink; A BANDOLIER OF THROWING KNIVES across his chest; a heavier sacrificial blade of bone; and THE KEY on a chain at his hip.
//
// What glows on him is the enemy's: his mask's eyes, the key's. Nothing cyan. The enemy's pink edge while he lives.

import { COWL_R, DAGGER_CULTIST, FRENZY_CULTIST, KNIFE_BODY, KNIFE_CANVAS, KNIFE_PACE, KNIFE_REST, knifeCowlTop } from './cultists';
import { clamp01, curve, fireBall, rampAt, sampled, shiver, tr } from './fleshmancer';
import { FLAME } from './mkit';
import type { Ramp } from './kit';
import { TILE3, handAt, sphere } from './new_mobs3';
import type { Bit, Mob, Moment, Shape } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Stage } from './skin';
import { add, cross, dot, lerp3, mul, norm, sub } from './skeleton';
import type { Bones, Key3, Motion, V3 } from './skeleton';

/** How much bigger the key-bearers are than their cultists: a head taller (his pick). */
export const KEY_K = 1.24;

/** Every point and every length of a part made `k` times as big, from the figure's floor point. */
function grown(sh: Shape, k: number): Shape {
  const P = (p: V3): V3 => [p[0] * k, p[1] * k, p[2] * k];
  const R = (r: { c: V3; u: V3; v: V3; pts?: ReadonlyArray<V3> }) => ({ ...r, c: P(r.c), u: P(r.u), v: P(r.v), pts: r.pts ? r.pts.map(P) : undefined });
  switch (sh.k) {
    case 'rod':
      return { ...sh, a: P(sh.a), b: P(sh.b), ra: sh.ra * k, rb: sh.rb * k };
    case 'ball':
      return { ...sh, c: P(sh.c), ax: [P(sh.ax[0]), P(sh.ax[1]), P(sh.ax[2])] };
    case 'cloth':
      return { ...sh, rings: sh.rings.map(R) };
    case 'band':
      return { ...sh, ring: R(sh.ring) };
    case 'panel':
      return { ...sh, c: P(sh.c), u: P(sh.u), v: P(sh.v) };
    case 'thread':
      return { ...sh, a: P(sh.a), b: P(sh.b), lift: sh.lift * k };
    case 'dot':
      return { ...sh, p: P(sh.p) };
    case 'teeth':
      return { ...sh, pts: sh.pts.map(P) };
    case 'mote':
      return { ...sh, p: P(sh.p) };
    case 'glow':
      return { ...sh, p: P(sh.p), r: sh.r * k };
    case 'greatsword':
      return { ...sh, grip: P(sh.grip) };
  }
}
export function grownBits(bits: Bit[], k: number): Bit[] {
  return bits.map((b) => ({ ...b, shape: grown(b.shape, k) }));
}

/** The mask's bone: shadow to light. */
const MASK: Ramp = ['#2a2420', '#4a4038', '#7e7262', '#bcae94', '#ece2cc'];
/** The bandolier's leather, the knives' blades, the key's iron. */
const LEATHER: Ramp = ['#1a100c', '#2e1c14', '#4a2e1e', '#6a4428', '#7e5432'];
const KNIFE: Ramp = ['#4a4048', '#6e5e58', '#ab9a80', '#dccfb6', '#f6eedc'];
const KEY_IRON: Ramp = ['#0a0a0c', '#1c1a22', '#36323e', '#625b6c', '#a49cb6'];
/** The key itself: old brass, so that it reads on the violet of a robe. */
const BRASS: Ramp = ['#2e1a0c', '#6a4420', '#a8742e', '#dcaa52', '#f6dc96'];

/** THE KEY on its chain at his hip (both key-bearers): from a point at his belt, hanging and swinging; its bow's eyes the enemy's pink. */
export function keyAtHip(put: (part: string, piece: string, shape: Shape) => void, belt: V3, down: V3, side: V3, sway: number): void {
  const chainEnd = add(belt, add(mul(down, 2.4), mul(side, sway * 0.6)));
  put('key', 'key', { k: 'rod', a: belt, b: chainEnd, ra: 0.4, rb: 0.4, ramp: KEY_IRON });
  const bow = add(chainEnd, mul(down, 2.0));
  const out = norm(cross(down, side));
  // (the bow a ring with a hole: a ball, and a dark one in it)
  put('key', 'key', { k: 'ball', c: bow, ax: [mul(out, 0.7), mul(side, 2.2), mul(down, 2.0)], skin: BRASS });
  put('key', 'key', { k: 'ball', c: add(bow, mul(out, 0.45)), ax: [mul(out, 0.3), mul(side, 0.9), mul(down, 0.8)], skin: KEY_IRON });
  const tip = add(bow, add(mul(down, 7.6), mul(side, sway * 0.4)));
  put('key', 'key', { k: 'rod', a: add(bow, mul(down, 1.6)), b: tip, ra: 0.75, rb: 0.7, ramp: BRASS });
  put('key', 'key', { k: 'rod', a: add(tip, mul(down, -1.8)), b: add(tip, add(mul(down, -1.8), mul(side, 2.4))), ra: 0.65, rb: 0.65, ramp: BRASS });
  put('key', 'key', { k: 'rod', a: add(tip, mul(down, -0.2)), b: add(tip, add(mul(down, -0.2), mul(side, 1.8))), ra: 0.65, rb: 0.65, ramp: BRASS });
  put('key', 'key', { k: 'dot', p: add(bow, mul(out, 0.8)), c: FLAME[2], facing: out });
  put('key', 'key', { k: 'glow', p: bow, c: FLAME[3], r: 9, a: 0.35 });
}

/** HIS OWN, over the dagger cultist's: the bone mask, the bandolier and its knives, the heavier blade, the key. In his own lengths, before he is grown. */
function bladeBearerBits(st: Stage, m: Moment): Bit[] {
  const { s } = m;
  const bits: Bit[] = [];
  const put = (part: string, piece: string, shape: Shape): void => {
    bits.push({ part, piece, shape });
  };
  const B = KNIFE_BODY;
  const [cf, cl, cu] = s.chest;
  // THE BONE MASK in the opening of his cowl (where his cultists' dark and eyes are: art/cultists.ts, the cowl, turned toward the eye
  // as its opening is): a smooth face of bone, its eye slits slanting down, the enemy's pink in them
  const [ff, fl, fu] = wornOn(st, s, 12);
  const hc = add(s.head, add(ff, fu));
  const cam = Math.atan2(dot(st.eye, fl), dot(st.eye, ff)) * (180 / Math.PI);
  const toward = Math.max(0, Math.min(1, (110 - Math.abs(cam)) / 40));
  const midA = Math.max(-40, Math.min(40, cam * 0.8)) * toward * (Math.PI / 180);
  const od: V3 = norm(add(mul(ff, Math.cos(midA)), mul(fl, Math.sin(midA))));
  const ol = norm(cross(fu, od), fl);
  const mc = add(add(hc, mul(norm([od[0], od[1], od[2] * 0.4]), COWL_R[0] * 0.9 + 0.5)), [0, 0, -0.7]);
  // (shaped as a face, not a disc: broad over the brow, narrowing to a pointed chin)
  put('mask', 'mask', { k: 'ball', c: add(mc, mul(fu, 0.8)), ax: [mul(od, 0.75), mul(ol, 2.3), mul(fu, 1.6)], skin: MASK });
  put('mask', 'mask', { k: 'ball', c: add(mc, mul(fu, -0.6)), ax: [mul(od, 0.7), mul(ol, 1.6), mul(fu, 1.5)], skin: MASK });
  put('mask', 'mask', { k: 'ball', c: add(mc, add(mul(fu, -1.8), mul(od, -0.1))), ax: [mul(od, 0.55), mul(ol, 0.8), mul(fu, 0.9)], skin: MASK });
  // (its eye slits, slanting down toward the middle, the enemy's pink in them)
  for (const side of [-1, 1]) {
    for (const [o, u] of [[0.55, 0.35], [1.35, 0.75]] as const) {
      put('mask', 'mask', { k: 'dot', p: add(mc, add(mul(ol, side * o), add(mul(fu, u), mul(od, 0.82)))), c: FLAME[2], facing: od });
    }
  }
  put('mask', 'mask', { k: 'glow', p: add(mc, mul(od, 1)), c: FLAME[2], r: 7, a: 0.3 });
  // THE BANDOLIER across his chest, from his left shoulder to his right hip, and its throwing knives, points up
  const a0 = add(s.shoulderL, add(mul(cf, B.ribDeep + 2.4), mul(cu, -1.2)));
  const a1 = add(s.hipR, add(mul(cf, B.waistDeep + 2.2), mul(cu, 2.8)));
  put('bandolier', 'bandolier', { k: 'rod', a: a0, b: a1, ra: 0.75, rb: 0.75, ramp: LEATHER });
  // (over his shoulder and down his back the same way, so that it is seen from behind too)
  const b0 = add(s.shoulderL, add(mul(cf, -(B.ribDeep + 1.6)), mul(cu, -1.2)));
  const b1 = add(s.hipR, add(mul(cf, -(B.waistDeep + 1.6)), mul(cu, 2.8)));
  put('bandolier', 'bandolier', { k: 'rod', a: add(s.shoulderL, mul(cu, 1.6)), b: a0, ra: 0.75, rb: 0.75, ramp: LEATHER });
  put('bandolier', 'bandolier', { k: 'rod', a: add(s.shoulderL, mul(cu, 1.6)), b: b0, ra: 0.75, rb: 0.75, ramp: LEATHER });
  put('bandolier', 'bandolier', { k: 'rod', a: b0, b: b1, ra: 0.75, rb: 0.75, ramp: LEATHER });
  for (let i = 0; i < 4; i++) {
    const at = lerp3(a0, a1, 0.2 + i * 0.19);
    const out = add(at, mul(cf, 0.7));
    // (each knife's grip in the strap, its blade up and out over it)
    put('bandolier', 'knife', { k: 'rod', a: add(out, mul(cu, -0.6)), b: add(out, mul(cu, -1.6)), ra: 0.45, rb: 0.45, ramp: LEATHER });
    put('bandolier', 'knife', { k: 'rod', a: add(out, mul(cu, 0.2)), b: add(out, add(mul(cu, 3.4), mul(cf, 0.4))), ra: 0.6, rb: 0.12, ramp: KNIFE });
  }
  // THE BLADE, heavier: from his fist along the way it points, a long wavy blade of bone, its guard of dark iron
  {
    const p = norm(s.point, [1, 0, 0]);
    const across = norm(cross(p, [0, 0, 1]), cl);
    const g0 = add(s.handR, mul(p, 1.6));
    put('blade', 'guard', { k: 'rod', a: add(g0, mul(across, -1.6)), b: add(g0, mul(across, 1.6)), ra: 0.55, rb: 0.55, ramp: KEY_IRON });
    const tip = add(g0, mul(p, 13.5));
    const bend = Math.sin(m.wind * Math.PI * 2) * 0.1;
    const mid1 = add(lerp3(g0, tip, 0.35), mul(across, 0.5 + bend));
    const mid2 = add(lerp3(g0, tip, 0.7), mul(across, -0.45 - bend));
    put('blade', 'blade', { k: 'rod', a: g0, b: mid1, ra: 1.1, rb: 0.95, ramp: KNIFE });
    put('blade', 'blade', { k: 'rod', a: mid1, b: mid2, ra: 0.95, rb: 0.7, ramp: KNIFE });
    put('blade', 'blade', { k: 'rod', a: mid2, b: tip, ra: 0.7, rb: 0.1, ramp: KNIFE });
  }
  // A THROWING KNIFE in his left fist (his throw: drawn from the bandolier, held back by his ear, flung): its blade on from his forearm
  if (m.skull) {
    const fore = norm(sub(s.handL, s.elbowL), [1, 0, 0]);
    put('thrown', 'thrown', { k: 'rod', a: add(s.handL, mul(fore, -1.3)), b: add(s.handL, mul(fore, 0.6)), ra: 0.5, rb: 0.5, ramp: LEATHER });
    const tip = add(s.handL, mul(fore, 6.2));
    put('thrown', 'thrown', { k: 'rod', a: add(s.handL, mul(fore, 0.7)), b: tip, ra: 0.75, rb: 0.12, ramp: KNIFE });
    if (m.glint > 0.05) {
      put('thrown', 'thrown', { k: 'dot', p: tip, c: '#fff4ec', facing: mul(st.eye, -1) });
      put('thrown', 'thrown', { k: 'glow', p: tip, c: FLAME[2], r: 4 + 7 * m.glint, a: 0.55 * m.glint });
    }
  }
  // (the throw's streak: his fist's way through the air in the frame it is flung)
  if (m.move === KB_THROW_NAME && m.trails) {
    const line = m.trails[0];
    for (let i = line.length - 1; i >= 1; i--) {
      const age = i / (line.length - 1);
      const steps = 4;
      for (let k = 0; k < steps; k++) {
        if (age > 0.55 && k % 2 === 1) continue;
        put('streak2', 'streak2', { k: 'mote', p: lerp3(line[i], line[i - 1], k / steps), c: age > 0.6 ? KNIFE[1] : age > 0.3 ? KNIFE[2] : KNIFE[3], size: age < 0.4 ? 2 : 1 });
      }
    }
  }
  // THE KEY, on a chain at his right hip (till it is torn off him as he dies: the game drops it, ringing, to the floor)
  if (!(m.dying && m.t >= KEY_SNAP)) {
    const belt = add(s.pelvis, add(mul(s.belly[0], B.pelvisDeep + 1.6), add(mul(s.belly[1], B.pelvisHalf * 0.55), mul(s.belly[2], 2.4))));
    keyAtHip(put, belt, norm(add([0, 0, -1], mul(s.belly[0], 0.45))), norm(s.belly[1]), Math.sin(m.wind * Math.PI * 4) + m.come[0] * 0.3);
  }
  return bits;
}

/** When, into his death, the key is torn off its chain (the game drops it from him then: the key rings to the floor, his pick). */
export const KEY_SNAP = 0.05;

// THE KNIFE'S MOVES. His three blows, his picks (“The leap and the stab, a thrown dagger ranged attack”): THE STAB, the dagger
// cultist's frenzy (four stabs in a blur, stepping in, then winded: his attack); THE LEAP, the dagger cultist's leap and plunge; and
// THE THROW, his own, below. By Movement 9: a big wind-up, held (the warning), the blow itself in a frame or two, a big wind-down.

const FR30 = 1 / 30;
export const KB_THROW_NAME = 'The Keybearer of the Knife throws a dagger';
/** His throw: how long, when the knife is in his fist, the warning held, and when it leaves his hand (its blow). */
export const KB_THROW = { long: 1.2, grab: 0.24, held: [0.42, 0.58] as const, hit: 0.62 } as const;
/**
 * THE THROW. His left hand goes across his chest to the bandolier and draws a knife (0 to 0.24 s); he winds back, turning away, the
 * knife up by his ear, its point to you catching the light, his weight on his back foot (THE WARNING, held trembling, 0.42 to 0.58);
 * then in one frame he whips round and flings it (0.62), his arm out at you; and comes back, slowly.
 */
function knifeThrow(): Motion {
  const R = KNIFE_REST;
  const { long: L, hit: H } = KB_THROW;
  const held = (t: number): number => rampAt(t, 0.42, 0.46) * (1 - rampAt(t, 0.56, 0.59));
  const keys = sampled(L, {
    px: tr([[0, R.px], [0.24, R.px - 0.4], [0.42, R.px - 2.2], [0.58, R.px - 2.4], [H, R.px + 2.8], [0.78, R.px + 3.2], [L, R.px]]),
    pz: tr([[0, R.pz], [0.24, R.pz - 0.6], [0.42, R.pz - 0.8], [H, R.pz - 1.8], [0.85, R.pz - 1.4], [L, R.pz]]),
    twist: (t) => tr([[0, R.twist], [0.24, 12], [0.42, 34], [0.58, 36], [H, -30], [0.78, -32], [1.0, -12], [L, R.twist]])(t) + shiver(t, 1.2, 1) * held(t),
    yaw: tr([[0, R.yaw], [0.42, 12], [0.58, 12], [H, -12], [0.95, -6], [L, R.yaw]]),
    pitch: tr([[0, R.pitch], [0.42, 2], [0.58, 0], [H, 18], [0.85, 15], [L, R.pitch]]),
    bend: tr([[0, R.bend], [0.24, 15], [0.42, 4], [0.58, 2], [H, 24], [0.85, 21], [L, R.bend]]),
    faceTurn: tr([[0, R.faceTurn], [0.24, -8], [0.42, -30], [0.58, -32], [H, 18], [0.85, 16], [L, R.faceTurn]]),
    faceUp: tr([[0, R.faceUp], [0.24, -4], [0.42, 6], [H, 2], [L, R.faceUp]]),
    lhx: tr([[0, R.lhx], [0.18, 5.5], [0.26, 5.0], [0.42, -5.0], [0.58, -5.5], [H - FR30, 3], [H, 15], [0.78, 14], [1.0, 11], [L, R.lhx]]),
    lhy: tr([[0, R.lhy], [0.18, -6.5], [0.26, -6.0], [0.42, 3.5], [0.58, 4], [H, -1.5], [0.78, -3], [L, R.lhy]]),
    lhz: (t) => tr([[0, R.lhz], [0.18, -4], [0.26, -3.5], [0.42, 7.5], [0.58, 8], [H, 1.5], [0.78, -1.5], [1.0, -6], [L, R.lhz]])(t) + shiver(t, 0.4, 3) * held(t),
    le: tr([[0, R.le], [0.26, -40], [0.42, -75], [H, -10], [L, R.le]]),
    rhx: tr([[0, R.rhx], [0.42, 0.5], [H, 4.5], [L, R.rhx]]),
    rhz: tr([[0, R.rhz], [0.42, 6.5], [H, 4.5], [L, R.rhz]]),
    lfp: tr([[0, 0], [0.5, 0], [H, 24], [0.9, 20], [L, 0]]),
    gale: tr([[0, 0.1], [H, 0.75], [0.85, 0.3], [L, 0.1]]),
  }, {});
  return { keys, hit: H };
}
/** The light catching the knife as he holds it back (the warning): up as he draws it back, brightest held, gone as it flies. */
function throwGlint(t: number): number {
  const { hit: H } = KB_THROW;
  if (t < 0.3 || t >= H) return 0;
  return t < 0.42 ? (t - 0.3) / 0.12 : t < 0.58 ? 1 : 1 - (t - 0.58) / (H - 0.58);
}
const THROW_MOVE = {
  name: KB_THROW_NAME,
  motion: knifeThrow(),
  rest: KNIFE_REST,
  glint: throwGlint,
  skull: (t: number) => t >= KB_THROW.grab && t < KB_THROW.hit,
  trail: (s: { handL: V3 }) => [s.handL],
  trailOver: (t: number) => t > KB_THROW.hit - 0.06 && t <= KB_THROW.hit + 0.01,
  trailSpan: 2,
};
/** Where the knife leaves his hand as he throws (tiles before him, to his left; game pixels up): the game sends it from there. */
export function throwFrom(): [number, number, number] {
  const p = handAt(KEY_BLADE, 'throw', KB_THROW.hit, 'L');
  return [(p[0] * KEY_K) / TILE3, (p[1] * KEY_K) / TILE3, (p[2] * KEY_K) / 2];
}

/** THE KEYBEARER OF THE KNIFE, standing, running, his stab, his leap and plunge, his throw, struck, falling: the dagger cultist's, grown, with his own. */
export const KEY_BLADE: Mob = {
  ...FRENZY_CULTIST,
  id: 'keyBlade',
  name: 'The Keybearer of the Knife',
  size: 'a head taller than his cultists, and broader',
  // (his run's feet grip the floor at his cultist's pace made as much bigger as he is)
  pace: KNIFE_PACE * KEY_K,
  dying: { ...DAGGER_CULTIST.dying, name: 'The Keybearer of the Knife falls' },
  more: {
    leap: { ...DAGGER_CULTIST.attack, name: 'The Keybearer of the Knife leaps and plunges' },
    throw: THROW_MOVE,
  },
  canvas: { w: Math.round(KNIFE_CANVAS.w * KEY_K) + 8, h: Math.round(KNIFE_CANVAS.h * KEY_K) + 8, ax: Math.round(KNIFE_CANVAS.ax * KEY_K) + 4, ay: Math.round(KNIFE_CANVAS.ay * KEY_K) + 4 },
  shadow: Math.round(FRENZY_CULTIST.shadow * KEY_K),
  aura: { ...FRENZY_CULTIST.aura, x: Math.round(KNIFE_CANVAS.ax * KEY_K) + 2, y: Math.round(KNIFE_CANVAS.ay * KEY_K) - 36, r: 52 },
  bits: (st, m) => grownBits([...FRENZY_CULTIST.bits(st, m).filter((b) => b.part !== 'dagger'), ...bladeBearerBits(st, m)], KEY_K),
};

// =================================================================================================
// THE KEYBEARER OF THE FLAME: the cult's fire-throwing cultist made a head taller and broader, on the bones (the dagger cultist's
// rig and robe, grown), known at a glance by HIS ROBE'S HEM ALWAYS BURNING and A CROWN OF FLAME over his cowl; a living flame over his
// open hand; his robe down to the floor; the key at his hip.

const ROBE: Ramp = ['#1e0e38', '#1e0e38', '#40206a', '#6e4498', '#6e4498'];

/** His stand: upright, slow, his breath in his shoulders, the flame over his open hand bobbing, his cowl turning slowly as he watches. */
export const FIRE_REST: Bones = {
  ...KNIFE_REST,
  pz: -1.2, px: 0.2, pitch: 3, bend: 4, twist: -4, yaw: -4,
  faceTurn: 0, faceUp: 4,
  lfx: -2.0, lfy: 3.0, lft: 12, lk: 6, rfx: 2.0, rfy: -3.0, rft: -12, rk: -6,
  rhIn: 0, rhx: 1.5, rhy: -3.6, rhz: -16.5, re: 8,
  lhIn: 0, lhx: 8.5, lhy: 3.5, lhz: -4.5, le: -24,
  wAz: -90, wEl: -60,
  draw: 0.2,
};
export const FIRE_STAND_LONG = 3.0;
function fireStand(): Motion {
  const R = FIRE_REST;
  const keys: Key3[] = [];
  const N = 30;
  const look: ReadonlyArray<readonly [number, number]> = [[0, 0], [0.8, 0], [1.3, 12], [2.0, 12], [2.5, -6], [3.0, 0]];
  for (let i = 0; i <= N; i++) {
    const t = i / 10;
    const a = (t / FIRE_STAND_LONG) * Math.PI * 2;
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz - 0.4 * Math.max(0, Math.sin(2 * a)),
        px: R.px + 0.3 * Math.sin(a),
        bend: R.bend + 1.2 * Math.sin(2 * a),
        twist: R.twist + 2 * Math.sin(a + 1),
        faceTurn: R.faceTurn + curve(look, t),
        faceUp: R.faceUp + 1.5 * Math.sin(2 * a),
        lhz: R.lhz + 0.8 * Math.sin(2 * a + 0.5),
        lhx: R.lhx + 0.4 * Math.sin(a),
        rhz: R.rhz + 0.4 * Math.sin(2 * a + 1),
        gale: 0.1 + 0.08 * Math.sin(a),
      },
    });
  }
  return { loop: 0, keys };
}

/** A tongue of fire from a point, `h` tall, flickering by `t` and its own `seed`: motes from white at its root to the enemy's pink at its tip. */
function tongue(put: (part: string, piece: string, shape: Shape) => void, part: string, at: V3, h: number, t: number, seed: number, lean: V3 = [0, 0, 0]): void {
  const flick = 0.75 + 0.25 * Math.sin(t * 17 + seed * 2.3) + 0.15 * Math.sin(t * 31 + seed);
  const n = Math.max(2, Math.round(h * flick));
  for (let j = 0; j < n; j++) {
    const k = j / n;
    const sway = Math.sin(t * 13 + seed * 1.7 + k * 3) * 0.5 * k;
    const p = add(at, add([sway, sway * 0.6, j], mul(lean, k * k)));
    put(part, part, { k: 'mote', p, c: k < 0.2 ? '#fff0a0' : k < 0.45 ? FLAME[3] : k < 0.75 ? FLAME[2] : FLAME[1], size: k < 0.5 ? 2 : 1 });
  }
}

/** HIS OWN, over the cultist's rig: his long robe and its burning hem, his crown of flame, the flame over his hand, the key. Before he is grown. */
function flameBearerBits(st: Stage, m: Moment): Bit[] {
  const { s } = m;
  const B = KNIFE_BODY;
  const bits: Bit[] = [];
  const put = (part: string, piece: string, shape: Shape): void => {
    bits.push({ part, piece, shape });
  };
  void st;
  const t = m.t;
  // (his fires going out as he dies)
  const lit = m.move === FL_DIES_NAME ? 1 - clamp01((t - 0.1) / 0.9) : 1;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  // HIS ROBE, long: from his waist down to the floor, flaring, its hem lifting and falling in the heat
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const hemC: V3 = [s.pelvis[0], s.pelvis[1], 0.6];
  const hemD = B.pelvisDeep + 5.2;
  const hemW = B.pelvisHalf + 5.2;
  const hemPts: V3[] = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    hemPts.push(add(hemC, add(mul(f, Math.cos(a) * hemD), add(mul(l, Math.sin(a) * hemW), [0, 0, 0.5 + 0.5 * Math.sin(t * 6 + a * 3)]))));
  }
  const skirt: Ring[] = [
    { c: waistC, u: mul(s.belly[0], B.waistDeep + 1.8), v: mul(s.belly[1], B.waistHalf + 1.8) },
    { c: lerp3(waistC, hemC, 0.5), u: mul(f, (B.waistDeep + 1.8 + hemD) / 2 + 0.6), v: mul(l, (B.waistHalf + 1.8 + hemW) / 2 + 0.6) },
    { c: hemC, u: mul(f, hemD), v: mul(l, hemW), pts: hemPts },
  ];
  put('longrobe', 'longrobe', { k: 'cloth', rings: skirt, ramp: ROBE, look: { folds: [30, -30, 80, -80, 135, -135], lift: 0.06 } });
  // THE HEM BURNING all round, always: tongues of the cult's fire licking up off it, their light on the floor
  for (let i = 0; i < 20; i++) {
    if (lit < 1 && (i * 7) % 10 >= lit * 10) continue;
    tongue(put, 'hemfire', add(hemPts[i], [0, 0, 0.6]), ((i % 2 ? 3.6 : 5.6) + 1.6 * Math.sin(i * 1.3 + t * 3)) * (0.4 + 0.6 * lit), t, i);
  }
  // (embers going up off it)
  for (let i = 0; i < 6 * lit; i++) {
    const ph = (t * 0.9 + i * 0.17) % 1;
    const at = hemPts[(i * 7) % 20];
    put('hemfire', 'hemfire', { k: 'mote', p: add(at, [Math.sin(i * 3 + t * 4) * 1.2, Math.cos(i * 2 + t * 3) * 1.2, 3 + ph * 16]), c: ph < 0.5 ? FLAME[3] : FLAME[2], size: 1 });
  }
  if (lit > 0) for (const i of [0, 5, 10, 15]) put('hemfire', 'hemfire', { k: 'glow', p: hemPts[i], c: FLAME[2], r: 9, a: 0.28 * lit });
  // THE CROWN OF FLAME over his cowl: five tongues standing up in a ring round its point
  const top = knifeCowlTop(s);
  const crownC: V3 = [s.head[0], s.head[1], top - 1.4];
  const [ff, fl] = s.face;
  // (it roars up as he gathers his fire for a cast)
  const roar = 1 + 0.6 * m.charge;
  if (lit > 0) {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const at = add(crownC, add(mul(ff, Math.cos(a) * 3.6), mul(fl, Math.sin(a) * 3.6)));
      tongue(put, 'crown', at, (7.5 + 2.5 * Math.cos(a * 2 + 0.6)) * roar * lit, t, i + 30, mul(add(mul(ff, Math.cos(a)), mul(fl, Math.sin(a))), 1.2));
    }
    tongue(put, 'crown', add(crownC, [0, 0, 1]), 10 * roar * lit, t, 41);
    put('crown', 'crown', { k: 'glow', p: add(crownC, [0, 0, 4]), c: FLAME[3], r: 18 * roar, a: 0.45 * lit });
  }
  // THE FLAME over his open hand (in his casts, the fire he gathers instead: `heldFire`)
  if (lit > 0 && !castingFire(m)) {
    const flameAt = add(s.handL, [0, 0, 1.6]);
    for (let i = 0; i < 5; i++) tongue(put, 'handfire', add(flameAt, [Math.cos(i * 1.3) * 1.2, Math.sin(i * 1.3) * 1.2, 0]), (8 - i) * lit, t, 60 + i);
    put('handfire', 'handfire', { k: 'glow', p: add(flameAt, [0, 0, 3]), c: FLAME[3], r: 16, a: 0.5 * lit });
  }
  // HIS SLEEVES down to his wrists (a priest's, not pushed back as the knife's are)
  for (const side of ['L', 'R'] as const) {
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    const e1 = norm(cross(fore, [0, 0, 1]), l);
    const e2 = norm(cross(e1, fore));
    const cuff = add(hand, mul(fore, -1.2));
    put(`sleeve${side}`, `sleeve${side}`, { k: 'cloth', rings: [{ c: el, u: mul(e1, 2.6), v: mul(e2, 2.6) }, { c: cuff, u: mul(e1, 3.1), v: mul(e2, 3.1) }], ramp: ROBE, look: { folds: [90, -90], lift: 0.1 } });
  }
  // THE KEY, on a chain at his right hip (till it is torn off him as he dies)
  if (!(m.dying && m.t >= KEY_SNAP)) {
    const belt = add(s.pelvis, add(mul(s.belly[0], B.pelvisDeep + 2.2), add(mul(s.belly[1], B.pelvisHalf * 0.55), mul(s.belly[2], 2.4))));
    keyAtHip(put, belt, norm(add([0, 0, -1], mul(s.belly[0], 0.55))), norm(s.belly[1]), Math.sin(t * 2.2) * 0.6 + m.come[0] * 0.3);
  }
  return bits;
}

// THE FLAME'S MOVES. His three, his picks (“Fire fan and fire ring, plus a bigger version of the regular mob attack”): THE SIGIL, the
// fire cultist's sigil made bigger (his attack); THE FAN, three balls of fire flung across before him; THE RING, a ring of fire
// bursting out from him along the floor. Each by Movement 9: wound up big and held (the warning), the blow in a frame or two.

/** Whether he is in one of his casts now, gathering fire (his open hand's flame is the fire he gathers then). */
function castingFire(m: Moment): boolean {
  return m.move === FL_SIGIL_NAME || m.move === FL_FAN_NAME || m.move === FL_RING_NAME;
}
/**
 * THE FIRE HE GATHERS in a cast, `charge` 0 to 1 (his MobMove's): over his left hand as he traces his sigil, then between his hands
 * held high; a ball swelling in his left hand for the fan; a ball over his head between his raised hands for the ring. Laid in the
 * picture's own pixels (so after he is grown: `s` his bones grown).
 */
function heldFire(st: Stage, m: Moment, s: { handL: V3; handR: V3; shoulderL: V3; chest: readonly [V3, V3, V3] }): Bit[] {
  const bits: Bit[] = [];
  if (!castingFire(m)) return bits;
  const put = (part: string, piece: string, shape: Shape): void => {
    bits.push({ part, piece, shape });
  };
  const t = m.t;
  const c = m.charge;
  const mid = add(lerp3(s.handL, s.handR, 0.5), [0, 0, 4]);
  let at: V3;
  let r: number;
  if (m.move === FL_SIGIL_NAME) {
    at = lerp3(add(s.handL, [0, 0, 2.5]), add(mid, add(mul(s.chest[0], 4), [0, 0, 1])), rampAt(t, 0.56, 0.8));
    r = 3.0 + 4.5 * c;
    // THE RING HE TRACES IN THE AIR, burning where his hand has been, gone as he raises his hands
    const [a0, a1] = FL_SIGIL.trace;
    const done = clamp01((t - a0) / (a1 - a0));
    const fade = 1 - rampAt(t, a1, a1 + 0.25);
    if (done > 0 && fade > 0) {
      const [cf, cl, cu] = s.chest;
      const A = SIGIL_AIR;
      const ctr = add(s.shoulderL, mul(add(mul(cf, A.x), add(mul(cl, A.y), mul(cu, A.z))), KEY_K));
      const n = Math.ceil(56 * done);
      for (let i = 0; i <= n; i++) {
        const a = (i / 56) * Math.PI * 2;
        const age = done - i / 56;
        if (age > 0.6 + 0.4 * fade || (fade < 1 && (i * 7) % 10 > fade * 10)) continue;
        const p = add(ctr, mul(add(mul(cl, Math.cos(a)), mul(cu, Math.sin(a))), A.r * KEY_K));
        put('fire', 'fire', { k: 'mote', p, c: age < 0.08 ? '#fff0a0' : age < 0.25 ? FLAME[3] : age < 0.45 ? FLAME[2] : FLAME[1], size: age < 0.3 ? 2 : 1 });
      }
      put('fire', 'fire', { k: 'glow', p: ctr, c: FLAME[2], r: 30, a: 0.3 * fade * done });
    }
  } else if (m.move === FL_FAN_NAME) {
    at = add(s.handL, [0, 0, 2.6]);
    r = 2.5 + 5.5 * c;
  } else {
    at = add(mid, [0, 0, 3 + 6 * c]);
    r = 3.0 + 9 * c;
  }
  if (r < 0.8) return bits;
  const wob = 1 + 0.08 * Math.sin(t * 29) + 0.05 * Math.sin(t * 47);
  fireBall(st, put, at, r * wob, [0, 1], r * 0.9 * (0.8 + 0.2 * Math.sin(t * 17)));
  // (tongues licking up off it, and its light)
  for (let i = 0; i < 5; i++) tongue(put, 'fire', add(at, [Math.cos(i * 1.26 + t * 3) * r * 0.6, Math.sin(i * 1.26 + t * 3) * r * 0.6, r * 0.5]), r * (0.9 + 0.3 * Math.sin(t * 11 + i)), t, 80 + i);
  put('fire', 'fire', { k: 'glow', p: at, c: FLAME[3], r: 10 + r * 4, a: Math.min(0.75, 0.35 + 0.4 * c) });
  return bits;
}

/** His walk: a slow procession, his robe over his feet, eight frames at eight a second, painted for `FL_PACE` tiles a second (his size). */
export const FL_PACE = 1.4;
const FL_WALK = { frames: 8, fps: 8 } as const;
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 14 * Math.sin(Math.PI * u) * (1 - u) - 6 * Math.sin(Math.PI * u) * u];
}
function fireWalk(): Motion {
  const R = FIRE_REST;
  const n = FL_WALK.frames;
  // (in his own lengths before he is grown: he is grown KEY_K times, his steps with him)
  const d = (FL_PACE * TILE3) / KEY_K / FL_WALK.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [rx, rz, rp] = stepFoot(j, n, d, 3.0);
    const [lx, lz, lp] = stepFoot((j + n / 2) % n, n, d, 3.0);
    keys.push({
      at: i / FL_WALK.fps,
      ease: 'lin',
      pose: {
        pz: R.pz - 0.6 * Math.abs(Math.cos(a)), py: 0.8 * Math.sin(a), roll: 1.6 * Math.sin(a), yaw: R.yaw + 3 * Math.cos(a),
        bend: R.bend + 2, pitch: R.pitch + 2, faceUp: R.faceUp, faceTilt: 2 * Math.sin(a),
        rfx: R.rfx * 0.4 + rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft,
        lfx: R.lfx * 0.4 + lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft,
        lhx: R.lhx + 0.6 * Math.cos(a), lhz: R.lhz + 0.8 * Math.cos(2 * a),
        rhx: R.rhx - 1.5 * Math.cos(a), rhz: R.rhz + 0.6 * Math.cos(2 * a),
        gale: 0.35, draw: 0.2,
      },
    });
  }
  return { keys, loop: 0 };
}

export const FL_SIGIL_NAME = 'The Keybearer of the Flame casts his great sigil';
/**
 * HIS GREAT SIGIL (the fire cultist's, bigger: game, its ring under you). How long; when its ring begins under you (as his hand
 * begins to trace it in the air, SIGIL.delay before its eruption, as the cultist's does); its tracing; and the slam, when it erupts.
 */
export const FL_SIGIL = { long: 1.95, trace: [0.16, 0.56] as const, hit: 1.2 } as const;
/** The ring he traces in the air with his burning hand: its middle (from his left shoulder, along his chest: forward, left, up) and its radius, in his own lengths. */
const SIGIL_AIR = { x: 12, y: -2, z: 4, r: 7.5 } as const;
/**
 * He lifts his burning hand (0 to 0.16 s) and TRACES THE RING in the air before him (to 0.56), the same ring burning onto the floor under
 * you; raises both hands high, the fire between them swelling, his head back, his crown roaring (THE WARNING, held trembling to 1.15);
 * and in a frame FLINGS it down at the floor before him (1.2): it erupts. He holds, bent over his hands, and straightens.
 */
function fireSigil(): Motion {
  const R = FIRE_REST;
  const { long: L, hit: H } = FL_SIGIL;
  const [a0, a1] = FL_SIGIL.trace;
  const held = (t: number): number => rampAt(t, 0.85, 0.9) * (1 - rampAt(t, 1.13, 1.16));
  const round = (t: number): number => clamp01((t - a0) / (a1 - a0)) * Math.PI * 2;
  const up = (t: number): number => rampAt(t, a1, 0.8);
  const down = (t: number): number => rampAt(t, H - 0.05, H);
  const back = (t: number): number => rampAt(t, 1.45, L);
  const blend = (t: number, circle: number, high: number, low: number, rest: number): number => {
    const v = circle + (high - circle) * up(t);
    const w = v + (low - v) * down(t);
    return w + (rest - w) * back(t);
  };
  const keys = sampled(L, {
    lhx: (t) => blend(t, t < a0 ? R.lhx + (SIGIL_AIR.x - R.lhx) * rampAt(t, 0, a0) : SIGIL_AIR.x, 11, 13, R.lhx),
    lhy: (t) => blend(t, t < a0 ? R.lhy + (SIGIL_AIR.y + SIGIL_AIR.r - R.lhy) * rampAt(t, 0, a0) : SIGIL_AIR.y + SIGIL_AIR.r * Math.cos(round(t)), -5.0, -3.0, R.lhy),
    lhz: (t) => blend(t, t < a0 ? R.lhz + (SIGIL_AIR.z - R.lhz) * rampAt(t, 0, a0) : SIGIL_AIR.z + SIGIL_AIR.r * Math.sin(round(t)), 3, -13, R.lhz) + shiver(t, 0.5, 1) * held(t),
    le: (t) => blend(t, -30, -20, -10, R.le),
    rhx: (t) => blend(t, R.rhx, 11, 13, R.rhx),
    rhy: (t) => blend(t, R.rhy, 5.0, 3.0, R.rhy),
    rhz: (t) => blend(t, R.rhz, 3, -13, R.rhz) + shiver(t, 0.5, 2) * held(t),
    re: (t) => blend(t, R.re, 20, 10, R.re),
    pitch: (t) => blend(t, R.pitch + 2, -6, 22, R.pitch),
    bend: (t) => blend(t, R.bend + 4, -10, 30, R.bend) + shiver(t, 0.8, 4) * held(t),
    pz: (t) => blend(t, R.pz, R.pz + 0.8, R.pz - 3.5, R.pz),
    px: (t) => blend(t, R.px, R.px - 1, R.px + 2.5, R.px),
    faceUp: (t) => blend(t, R.faceUp + 4, 20, -6, R.faceUp),
    gale: (t) => blend(t, 0.2, 0.35, 0.9, 0.1),
  }, {});
  return { keys, hit: H };
}

export const FL_FAN_NAME = 'The Keybearer of the Flame flings a fan of fire';
/** HIS FAN OF FIRE: how long, and when the three balls leave his hand (his blow); `wide`: the fan's half-width, degrees. */
export const FL_FAN = { long: 1.4, held: [0.45, 0.72] as const, hit: 0.76, wide: 22 } as const;
/**
 * He draws his burning hand back and out to his left, turning away, the fire in it swelling to a ball, his other hand out before him
 * (0 to 0.45 s; THE WARNING, held trembling to 0.72); then in two frames SWEEPS IT ACROSS before him, and three balls of fire fly from
 * it in a fan (0.76); he follows through, and comes back.
 */
function fireFan(): Motion {
  const R = FIRE_REST;
  const { long: L, hit: H } = FL_FAN;
  const held = (t: number): number => rampAt(t, 0.45, 0.5) * (1 - rampAt(t, 0.7, 0.73));
  const keys = sampled(L, {
    lhx: tr([[0, R.lhx], [0.45, 6], [0.72, 5.5], [H - FR30, 11], [H, 14], [H + FR30, 12], [0.95, 9], [L, R.lhx]]),
    lhy: tr([[0, R.lhy], [0.45, 11], [0.72, 11.5], [H - FR30, 5], [H, -5], [H + FR30, -10], [0.95, -10], [L, R.lhy]]),
    lhz: (t) => tr([[0, R.lhz], [0.45, -5], [0.72, -4.5], [H, -1], [0.95, -4], [L, R.lhz]])(t) + shiver(t, 0.5, 1) * held(t),
    le: tr([[0, R.le], [0.45, -60], [H, -15], [L, R.le]]),
    rhx: tr([[0, R.rhx], [0.45, 8], [0.72, 8.5], [H, 3], [0.95, 2], [L, R.rhx]]),
    rhy: tr([[0, R.rhy], [0.45, -1], [H, -6], [L, R.rhy]]),
    rhz: tr([[0, R.rhz], [0.45, -5], [H, -12], [L, R.rhz]]),
    twist: (t) => tr([[0, R.twist], [0.45, 10], [0.72, 12], [H - FR30, 6], [H, -18], [H + FR30, -26], [0.95, -26], [L, R.twist]])(t) + shiver(t, 1.0, 2) * held(t),
    yaw: tr([[0, R.yaw], [0.45, 8], [H, -10], [0.95, -8], [L, R.yaw]]),
    faceTurn: tr([[0, R.faceTurn], [0.45, -26], [0.72, -28], [H, 14], [0.95, 14], [L, R.faceTurn]]),
    bend: tr([[0, R.bend], [0.45, 2], [H, 16], [0.95, 14], [L, R.bend]]),
    pitch: tr([[0, R.pitch], [0.45, -2], [H, 10], [L, R.pitch]]),
    px: tr([[0, R.px], [0.45, R.px - 1.5], [0.72, R.px - 1.7], [H, R.px + 2], [0.95, R.px + 2.2], [L, R.px]]),
    gale: tr([[0, 0.1], [H, 0.8], [0.95, 0.35], [L, 0.1]]),
  }, {});
  return { keys, hit: H };
}

export const FL_RING_NAME = 'The Keybearer of the Flame calls a ring of fire';
/** HIS RING OF FIRE: how long, and when he strikes the floor and the ring bursts out from him (its blow). */
export const FL_RING = { long: 2.1, held: [0.6, 1.2] as const, hit: 1.3 } as const;
/**
 * He raises both hands high over his head, his head thrown back (0 to 0.5 s), and a ball of fire swells between them, his crown
 * roaring (THE WARNING, held trembling to 1.2); then in two frames he DROPS to his knee and STRIKES THE FLOOR with both hands (1.3): the
 * fire bursts out from him in a ring along the floor. He stays down a moment, and rises.
 */
function fireRing(): Motion {
  const R = FIRE_REST;
  const { long: L, hit: H } = FL_RING;
  const held = (t: number): number => rampAt(t, 0.55, 0.62) * (1 - rampAt(t, 1.18, 1.22));
  const k = (pts: ReadonlyArray<readonly [number, number]>) => tr(pts);
  const keys = sampled(L, {
    lhx: k([[0, R.lhx], [0.5, 3], [1.2, 3.5], [H - FR30, 10], [H, 12], [1.7, 12], [L, R.lhx]]),
    lhy: k([[0, R.lhy], [0.5, 2.5], [1.2, 2.5], [H, 4], [1.7, 4], [L, R.lhy]]),
    lhz: (t) => k([[0, R.lhz], [0.5, 19], [1.2, 19.5], [H - FR30, 0], [H, -24], [1.7, -24], [L, R.lhz]])(t) + shiver(t, 0.6, 1) * held(t),
    le: k([[0, R.le], [0.5, -10], [H, -20], [L, R.le]]),
    rhx: k([[0, R.rhx], [0.5, 3], [1.2, 3.5], [H - FR30, 10], [H, 12], [1.7, 12], [L, R.rhx]]),
    rhy: k([[0, R.rhy], [0.5, -2.5], [1.2, -2.5], [H, -4], [1.7, -4], [L, R.rhy]]),
    rhz: (t) => k([[0, R.rhz], [0.5, 19], [1.2, 19.5], [H - FR30, 0], [H, -24], [1.7, -24], [L, R.rhz]])(t) + shiver(t, 0.6, 2) * held(t),
    re: k([[0, R.re], [0.5, 10], [H, 20], [L, R.re]]),
    pz: k([[0, R.pz], [0.5, R.pz + 1.2], [1.2, R.pz + 1.4], [H - FR30, R.pz - 6], [H, R.pz - 11], [1.7, R.pz - 11], [L, R.pz]]),
    px: k([[0, R.px], [0.5, R.px - 1], [H, R.px + 2], [1.7, R.px + 2], [L, R.px]]),
    pitch: (t) => k([[0, R.pitch], [0.5, -7], [1.2, -8], [H, 20], [1.7, 18], [L, R.pitch]])(t) + shiver(t, 0.5, 3) * held(t),
    bend: k([[0, R.bend], [0.5, -10], [1.2, -11], [H, 36], [1.7, 32], [L, R.bend]]),
    faceUp: k([[0, R.faceUp], [0.5, 24], [1.2, 26], [H, 0], [1.7, 4], [L, R.faceUp]]),
    lk: k([[0, R.lk], [1.2, R.lk], [H, 40], [1.7, 40], [L, R.lk]]),
    rk: k([[0, R.rk], [1.2, R.rk], [H, -40], [1.7, -40], [L, R.rk]]),
    gale: k([[0, 0.1], [1.2, 0.3], [H, 1], [1.7, 0.5], [L, 0.1]]),
  }, {});
  return { keys, hit: H };
}

/** STRUCK: rocked back, his cowl jerked up, his hands flung out, his robe flaring; then upright again. */
function fireReel(): Motion {
  const R = FIRE_REST;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: R.px - 3.6, pz: R.pz + 0.8, pitch: R.pitch - 13, bend: R.bend - 14, faceUp: R.faceUp + 20, twist: R.twist - 10, lhx: R.lhx - 4, lhz: R.lhz + 5, rhx: R.rhx + 3, rhy: R.rhy - 3, rhz: R.rhz + 6, gale: 1 }, ease: 'out' },
      { at: 0.16, pose: { px: R.px - 1.8, pitch: R.pitch - 4, bend: R.bend - 5, faceUp: R.faceUp + 7, twist: R.twist - 3, gale: 0.5 }, ease: 'io' },
      { at: 0.3, pose: {}, ease: 'io' },
    ],
  };
}
const FL_DIES_NAME = 'The Keybearer of the Flame falls, his fire going out';

/** The fire he gathers, `t` seconds into each cast (0 to 1): what swells in his hands, and how his crown roars. */
const sigilCharge = (t: number): number => rampAt(t, FL_SIGIL.trace[0], 1.1) * (1 - rampAt(t, FL_SIGIL.hit - 0.02, FL_SIGIL.hit + 0.04));
const fanCharge = (t: number): number => rampAt(t, 0.05, 0.5) * (1 - rampAt(t, FL_FAN.hit - 0.02, FL_FAN.hit + 0.02));
const ringCharge = (t: number): number => rampAt(t, 0.3, 1.18) * (1 - rampAt(t, FL_RING.hit - 0.04, FL_RING.hit + 0.02));

/** THE KEYBEARER OF THE FLAME: standing, walking in procession, his great sigil, his fan, his ring, struck, falling, his fire going out. */
export const KEY_FLAME: Mob = {
  ...KEY_BLADE,
  id: 'keyFlame',
  name: 'The Keybearer of the Flame',
  stand: { name: 'The Keybearer of the Flame, watching', motion: fireStand(), rest: FIRE_REST },
  idleFrames: 30,
  idleFps: 10,
  attack: { name: FL_SIGIL_NAME, motion: fireSigil(), rest: FIRE_REST, charge: sigilCharge },
  hit: FL_SIGIL.hit,
  warn: FL_SIGIL.trace[1],
  walk: { name: 'The Keybearer of the Flame walks in procession', motion: fireWalk(), rest: FIRE_REST, period: FL_WALK.frames / FL_WALK.fps, ground: (FL_PACE * TILE3) / KEY_K },
  walkFrames: FL_WALK.frames,
  walkFps: FL_WALK.fps,
  pace: FL_PACE,
  reel: { name: 'The Keybearer of the Flame is struck', motion: fireReel(), rest: FIRE_REST },
  dying: { ...DAGGER_CULTIST.dying, name: FL_DIES_NAME, rest: FIRE_REST },
  more: {
    fan: { name: FL_FAN_NAME, motion: fireFan(), rest: FIRE_REST, charge: fanCharge },
    ring: { name: FL_RING_NAME, motion: fireRing(), rest: FIRE_REST, charge: ringCharge },
  },
  bits: (st, m) => {
    const body = grownBits([...FRENZY_CULTIST.bits(st, m).filter((b) => b.part !== 'dagger' && b.part !== 'streak'), ...flameBearerBits(st, m)], KEY_K);
    const g = (p: V3): V3 => [p[0] * KEY_K, p[1] * KEY_K, p[2] * KEY_K];
    return [...body, ...heldFire(st, m, { handL: g(m.s.handL), handR: g(m.s.handR), shoulderL: g(m.s.shoulderL), chest: m.s.chest })];
  },
};

/** Where his fan of fire leaves his hand (tiles before him, to his left; game pixels up): the game sends its three balls from there. */
export function fanFrom(): [number, number, number] {
  const p = handAt(KEY_FLAME, 'fan', FL_FAN.hit, 'L');
  return [(p[0] * KEY_K) / TILE3, (p[1] * KEY_K) / TILE3, (p[2] * KEY_K + 4) / 2];
}

void sphere;
