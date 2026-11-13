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

import { COWL_R, FRENZY_CULTIST, KNIFE_BODY, KNIFE_CANVAS, KNIFE_REST, knifeCowlTop } from './cultists';
import { curve } from './fleshmancer';
import { FLAME } from './mkit';
import type { Ramp } from './kit';
import { sphere } from './new_mobs3';
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
  // THE KEY, on a chain at his right hip
  const belt = add(s.pelvis, add(mul(s.belly[0], B.pelvisDeep + 1.6), add(mul(s.belly[1], B.pelvisHalf * 0.55), mul(s.belly[2], 2.4))));
  keyAtHip(put, belt, norm(add([0, 0, -1], mul(s.belly[0], 0.45))), norm(s.belly[1]), Math.sin(m.wind * Math.PI * 4) + m.come[0] * 0.3);
  return bits;
}

/** THE KEYBEARER OF THE KNIFE, standing, running, his leap and plunge, struck, falling: the dagger cultist's, grown, with his own. */
export const KEY_BLADE: Mob = {
  ...FRENZY_CULTIST,
  id: 'keyBlade',
  name: 'The Keybearer of the Knife',
  size: 'a head taller than his cultists, and broader',
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
    tongue(put, 'hemfire', add(hemPts[i], [0, 0, 0.6]), (i % 2 ? 3.6 : 5.6) + 1.6 * Math.sin(i * 1.3 + t * 3), t, i);
  }
  // (embers going up off it)
  for (let i = 0; i < 6; i++) {
    const ph = (t * 0.9 + i * 0.17) % 1;
    const at = hemPts[(i * 7) % 20];
    put('hemfire', 'hemfire', { k: 'mote', p: add(at, [Math.sin(i * 3 + t * 4) * 1.2, Math.cos(i * 2 + t * 3) * 1.2, 3 + ph * 16]), c: ph < 0.5 ? FLAME[3] : FLAME[2], size: 1 });
  }
  for (const i of [0, 5, 10, 15]) put('hemfire', 'hemfire', { k: 'glow', p: hemPts[i], c: FLAME[2], r: 9, a: 0.28 });
  // THE CROWN OF FLAME over his cowl: five tongues standing up in a ring round its point
  const top = knifeCowlTop(s);
  const crownC: V3 = [s.head[0], s.head[1], top - 1.4];
  const [ff, fl] = s.face;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const at = add(crownC, add(mul(ff, Math.cos(a) * 3.6), mul(fl, Math.sin(a) * 3.6)));
    tongue(put, 'crown', at, 7.5 + 2.5 * Math.cos(a * 2 + 0.6), t, i + 30, mul(add(mul(ff, Math.cos(a)), mul(fl, Math.sin(a))), 1.2));
  }
  tongue(put, 'crown', add(crownC, [0, 0, 1]), 10, t, 41);
  put('crown', 'crown', { k: 'glow', p: add(crownC, [0, 0, 4]), c: FLAME[3], r: 18, a: 0.45 });
  // THE FLAME over his open hand
  const flameAt = add(s.handL, [0, 0, 1.6]);
  for (let i = 0; i < 5; i++) tongue(put, 'handfire', add(flameAt, [Math.cos(i * 1.3) * 1.2, Math.sin(i * 1.3) * 1.2, 0]), 8 - i, t, 60 + i);
  put('handfire', 'handfire', { k: 'glow', p: add(flameAt, [0, 0, 3]), c: FLAME[3], r: 16, a: 0.5 });
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
  // THE KEY, on a chain at his right hip
  const belt = add(s.pelvis, add(mul(s.belly[0], B.pelvisDeep + 2.2), add(mul(s.belly[1], B.pelvisHalf * 0.55), mul(s.belly[2], 2.4))));
  keyAtHip(put, belt, norm(add([0, 0, -1], mul(s.belly[0], 0.55))), norm(s.belly[1]), Math.sin(t * 2.2) * 0.6 + m.come[0] * 0.3);
  return bits;
}

/** THE KEYBEARER OF THE FLAME: standing (for now: his other moves to come). */
export const KEY_FLAME: Mob = {
  ...KEY_BLADE,
  id: 'keyFlame',
  name: 'The Keybearer of the Flame',
  stand: { name: 'The Keybearer of the Flame, watching', motion: fireStand(), rest: FIRE_REST },
  idleFrames: 30,
  idleFps: 10,
  bits: (st, m) => grownBits([...FRENZY_CULTIST.bits(st, m).filter((b) => b.part !== 'dagger' && b.part !== 'streak'), ...flameBearerBits(st, m)], KEY_K),
};

void sphere;
