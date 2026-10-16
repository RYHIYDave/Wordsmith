// THE DROWNED, FLOOR 10'S SMALL MOB (the art chat for floors 6 to 10, 15 Oct 2026). A MOCK-UP: NOT IN THE GAME.
// Nothing of the game imports this file; `DROWNED_ON` is off.
//
// The planning chat's mob table (his doc, kept with his yes): the Sunken Fen's mobs are the Drowned (small), Bog
// Leeches (tiny) and Eyespawn (medium). His brief, asked as his art rulebook's questions for a new character (two
// pop-ups, 15 Oct, by 22:15):
// - who they were: “Drowned cultists in rotting robes” (not the recommended pick), offered as: the cult's own, given
//   to the Eye;
// - how big: “The knight's height, hunched (Recommended)”, offered as: a pack of 4 to 7;
// - how they move: “Rising out of the water, then shambling (Recommended)”, offered as: water pouring off them, a
//   heavy wet lurch;
// - what marks them as the Eye's: “Eyes glowing the Eye's gold (Recommended)”, offered as: burning out of their
//   drowned faces;
// - their one attack: “A drowning grab: clutch, then drag down (Recommended)”, offered as: both arms lunge, it grabs
//   and wrenches you;
// - how one dies: “Collapses into water and weed (Recommended)”, offered as: its robes slump empty in a puddle;
// - how far: “Not a cartoon zombie (Recommended)”, offered as: eerie and heavy, not goofy or gory;
// - their sound: “Gurgling moans, wet footsteps (Recommended)”, offered as: and a choked chant, the cult's.
//
// They are of the cult's flock (art/act1_cultists.ts: the robe of the cult's violet, a deep cowl with a point, the
// cult's pink stole), drowned: the robe sodden dark and rotting, torn to rags at its hem, caked with the fen's mud
// and weed; the stole's pink gone dull; weed hanging off them; their skin the grey-green of the drowned, swollen; in
// the cowl's dark a slack drowned face, and two eyes burning the Eye's gold. Water runs off them always. What glows on
// them is the enemy's (their eyes). Nothing cyan. Each wears the enemy's pink edge while it lives.
//
// THIS FIRST STEP: its look, standing (his rulebook: a sheet of it standing, front and back, beside a hero, before
// anything moves). Its other moves are its stand for now, placeholders, not for use.

import type { ActorArt } from './actor_types';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { mobSet, sphere } from './new_mobs3';
import type { Bit, Mob, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const DROWNED_ON = { on: false };

const D = Math.PI / 180;
const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

// =============================================================================================
// THEIR COLOURS

/** The robe: the cult's violet gone sodden and dark, faded where it dried; the cowl darker still. */
const ROBE: Ramp = ['#17121f', '#17121f', '#3b2d4b', '#5c4b6c', '#5c4b6c'];
const COWL: Ramp = ['#110d18', '#110d18', '#2c2238', '#463a56', '#463a56'];
/** What is rotting of it: the fen's mud and slime soaked into it. */
const SLIME: Ramp = ['#181a10', '#181a10', '#323a1c', '#4e582c', '#4e582c'];
/** The cult's stole, its pink gone dull under the water. */
const STOLE: Ramp = ['#2a1020', '#2a1020', '#5a2440', '#7a3a58', '#7a3a58'];
/** Their skin: the grey-green of the drowned, swollen. */
const SKIN: Ramp = ['#36403a', '#36403a', '#71807a', '#a2aea2', '#a2aea2'];
/** The fen's weed hanging off them. */
const WEED: Ramp = ['#162414', '#162414', '#2e4626', '#4c6a38', '#4c6a38'];
/** Water running off them. */
const WATER = ['#9aaaa0', '#c0cac2', '#748a7e'];
/** The torn hem: how far up each piece of it is gone, round it (more torn than the living cult's). */
const TORN: readonly number[] = [3, 5, 1, 4, 6, 2, 0, 5, 3, 1, 4, 6, 2, 0, 5, 3];

// =============================================================================================
// THE BODY

/** Its body: one of the flock, swollen with the water in it, hunched; the knight's height were it to stand up straight (58). */
export const DROWNED_BODY: Build = buildOf(58, 1.0, { shoulders: 1.04, chest: 1.06, depth: 1.14, waist: 1.08, hips: 1.02, arms: 1.06, trunk: 1.0, limbs: 0.96 });
const DB = DROWNED_BODY;
export const DROWNED_CANVAS: MobCanvas = { w: 200, h: 190, ax: 100, ay: 144 };

/** Its rest: hunched over, its head hung forward and lifted to look at you, leaning to one side; its arms hanging slack before it, its hands low, their fingers curled. */
export const DROWNED_REST: Bones = {
  ...standing(DB),
  pz: -2.0, pitch: 16, bend: 20, roll: 4, side: 3, faceUp: 22, faceTilt: -10, faceTurn: 4,
  lfx: 1.4, lfy: 3.6, lft: 12, lk: 12, rfx: -1.8, rfy: -3.4, rft: -16, rk: -10,
  lhIn: 1, lhx: 7.0, lhy: 2.4, lhz: -21.0, le: -10,
  rhIn: 1, rhx: 5.5, rhy: -3.4, rhz: -22.5, re: 14,
};

/**
 * Its stand: 2.6 s round. It heaves, a wet breath dragged in and gurgled out (its shoulders rising and slumping);
 * it sways on its feet; its hanging arms swing; its head lolls, and once jerks up and round, as at a sound; water
 * runs off it all the while.
 */
export const DROWNED_STAND_LONG = 2.6;
function drownedStand(): Motion {
  const R = DROWNED_REST;
  const T = DROWNED_STAND_LONG;
  const keys: Key3[] = [];
  const N = 26;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    // (the jerk of its head: up and round, held, let fall)
    const jerk = t < 1.5 ? 0 : t < 1.6 ? (t - 1.5) / 0.1 : t < 1.95 ? 1 : t < 2.35 ? 1 - (t - 1.95) / 0.4 : 0;
    const breath = Math.sin(a * 2 - 0.4);
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.8 * breath,
        py: 1.1 * Math.sin(a),
        roll: R.roll + 2.4 * Math.sin(a),
        bend: R.bend - 2.6 * breath,
        pitch: R.pitch + 1.2 * Math.sin(a + 1.0),
        faceUp: R.faceUp - 6 * (1 - jerk) * (0.5 + 0.5 * Math.sin(a * 2 + 1)) + 8 * jerk,
        faceTilt: R.faceTilt + 6 * Math.sin(a + 0.6) * (1 - jerk) + 14 * jerk,
        faceTurn: R.faceTurn + 22 * jerk,
        lhx: R.lhx + 1.6 * Math.sin(a + 0.4),
        rhx: R.rhx + 1.6 * Math.sin(a + 2.2),
        lhz: R.lhz + 0.8 * breath,
        rhz: R.rhz + 0.8 * breath,
        draw: 0.5 + 0.5 * breath,
      },
    });
  }
  return { loop: 0, keys };
}

// =============================================================================================
// THE DROWNED AS SOLIDS

/** How the figure's going drags what hangs off it (its last moment's going, held to `most`). */
function lagOf(m: Moment, k: number, most: number): V3 {
  const raw = mul(m.come, -k);
  const l = len(raw);
  return l > most ? mul(raw, most / l) : raw;
}

/** THE FACE IN A COWL, pixel by pixel: the opening black (k), a slack drowned face low in it (s, its shadowed edge t), its two eyes burning the Eye's gold (h, their rings g), the opening's edge (r). */
const FACE: ReadonlyArray<string> = [
  '..rrrrrrrr..',
  '.rkkkkkkkkr.',
  'rkggkkkkggkr',
  'rghhgkkghhgr',
  'rghhgkkghhgr',
  'rkggsttsggkr',
  'rkkstsstskkr',
  '.kksttttskk.',
  '..ktssssk...',
];
const FACE_MID: readonly [number, number] = [6, 4];
const COWL_R: V3 = [5.8, 5.4, 6.0];

/**
 * ITS COWL, sodden and sagging: deep, its point hanging limp down its back, dripping; weed caught on it; the opening
 * dark, a slack drowned face in it, and its two eyes burning the Eye's gold (`glare`: how they burn, 0 out).
 */
function cowl(st: Stage, s: Skeleton, put: Put, glare: number, lag: V3, ph: number): void {
  const face = wornOn(st, s, 12);
  const [ff, fl, fu] = face;
  const hc = add(s.head, add(ff, fu));
  const hr = COWL_R;
  const cam = Math.atan2(dot(st.eye, fl), dot(st.eye, ff)) / D;
  const toward = clamp01((110 - Math.abs(cam)) / 40);
  const midA = Math.max(-40, Math.min(40, cam * 0.8)) * toward * D;
  const od: V3 = norm(add(mul(ff, Math.cos(midA)), mul(fl, Math.sin(midA))));
  const odLevel = norm([od[0], od[1], od[2] * 0.4]);
  const [ox, oy] = st.at(add(add(hc, mul(odLevel, hr[0] * 0.9)), [0, 0, -0.6]));
  const oxi = Math.floor(ox);
  const oyi = Math.floor(oy);
  const faceColour = (ch: string): string | null => {
    switch (ch) {
      case 'r':
        return INK;
      case 'k':
        return INK;
      case 's':
        return SKIN[2];
      case 't':
        return SKIN[1];
      case 'h':
        return glare < 0.05 ? INK : glare > 1.2 ? '#fffbe0' : FLAME[4];
      case 'g':
        return glare < 0.05 ? INK : glare > 0.5 ? FLAME[3] : FLAME[2];
      default:
        return null;
    }
  };
  const seenFace = dot(od, st.eye) > 0.15;
  const cowlSkin: Skin = (u, tone) => {
    const toOpen = u[0] * Math.cos(midA) + u[1] * Math.sin(midA);
    if (seenFace && toOpen > 0.15) {
      const p = add(hc, add(add(mul(ff, u[0] * hr[0]), mul(fl, u[1] * hr[1])), mul(fu, u[2] * hr[2])));
      const [x, y] = st.at(p);
      const line = FACE[Math.floor(y) - oyi + FACE_MID[1]];
      const col = Math.floor(x) - oxi + FACE_MID[0];
      if (line && col >= 0 && col < line.length) {
        const c = faceColour(line[col]);
        if (c) return c;
      }
    }
    // (sodden: slime soaked up into it from below, darker in streaks)
    if (u[2] < -0.35 && hash(Math.floor(u[0] * 6), Math.floor(u[1] * 6), 401) > 0.5) return SLIME[tone];
    return COWL[tone];
  };
  put('cowl', 'cowl', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: cowlSkin });
  put('cowl', 'cowl', { k: 'ball', c: add(add(hc, mul(ff, -2.6)), mul(fu, -3.4)), ax: [mul(ff, 4.0), mul(fl, 4.8), mul(fu, 3.6)], skin: COWL });
  // (its point: limp, hanging down its back, swinging a little, a drip at its end)
  let at = add(hc, add(mul(fu, hr[2] * 0.6), mul(ff, -hr[0] * 0.5)));
  const R0 = [2.6, 2.0, 1.4, 0.9, 0.5];
  for (let i = 0; i < 4; i++) {
    const k = (i + 1) / 4;
    const sway = Math.sin(ph * 2 + i * 0.9) * 0.3 * k;
    const next = add(at, add(add(mul(ff, -1.4), mul(fu, -1.6 - 0.6 * k)), add(mul(fl, sway), mul(lag, 0.3 * k))));
    put('cowl', 'cowl', { k: 'rod', a: at, b: next, ra: R0[i], rb: R0[i + 1], ramp: COWL });
    at = next;
  }
  // (weed caught over its crown, hanging down its sides)
  for (const sd of [1, -1]) {
    let w = add(hc, add(mul(fu, hr[2] * 0.85), mul(fl, sd * 1.6)));
    for (let i = 0; i < 4; i++) {
      const next = add(w, add(add(mul(fl, sd * 1.5), mul(fu, -2.4)), add(mul(ff, 0.3 * Math.sin(ph * 2 + i + sd)), mul(lag, 0.25))));
      put('cowl', 'weed', { k: 'rod', a: w, b: next, ra: 0.75 - i * 0.12, rb: 0.6 - i * 0.12, ramp: WEED });
      w = next;
    }
  }
  if (glare > 0.05 && dot(od, st.eye) > 0.05) put('glow', 'glow', { k: 'glow', p: add(hc, mul(od, hr[0] * 0.9)), c: FLAME[3], r: 4 + 3 * clamp01(glare - 1), a: Math.min(0.6, 0.3 * glare) });
}

/** A SLEEVE to the elbow and on, wide and ragged at its mouth, sodden, hanging under the forearm, weed in it; the swollen forearm and hand out of it. Returns the forearm's frame. */
function sleeve(s: Skeleton, put: Put, side: 'L' | 'R', cu: V3, lag: V3, ph: number): [V3, V3, V3] {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  put(`sleeve${side}`, `sleeve${side}`, { k: 'rod', a: sh, b: el, ra: 2.7, rb: 2.9, ramp: ROBE, far: true });
  const e1 = norm(sub([0, 0, 1], mul(fore, dot([0, 0, 1], fore))), cu);
  const e2 = norm(cross(fore, e1));
  const mouth = add(el, mul(fore, 3.4));
  const wide = 3.1;
  const mouthPts: V3[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const under = Math.max(0, -Math.cos(a));
    // (ragged: torn in tongues, hanging longest beneath)
    const tongue = 0.6 + 1.6 * hash(i, side === 'L' ? 1 : 2, 403);
    mouthPts.push(add(add(mouth, add(mul(e1, Math.cos(a) * wide), mul(e2, Math.sin(a) * wide))), add([0, 0, -under * (2.4 + tongue)], mul(lag, under * 0.5))));
  }
  put(`sleeve${side}`, `sleeve${side}`, { k: 'cloth', rings: [{ c: el, u: mul(e1, 2.8), v: mul(e2, 2.8) }, { c: mouth, u: mul(e1, wide), v: mul(e2, wide), pts: mouthPts }], ramp: ROBE, look: { folds: [90, -90], lift: 0.08 } });
  // (weed trailing from the sleeve's mouth)
  let w = add(mouth, add(mul(e1, -wide * 0.8), mul(e2, side === 'L' ? 1 : -1)));
  for (let i = 0; i < 3; i++) {
    const next = add(w, add([0, 0, -2.6], add(mul(fore, 0.4), add(mul(lag, 0.3), mul(e2, 0.4 * Math.sin(ph * 2 + i))))));
    put(`sleeve${side}`, 'weed', { k: 'rod', a: w, b: next, ra: 0.6, rb: 0.45, ramp: WEED });
    w = next;
  }
  const wrist = add(hand, mul(fore, -1.0));
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: add(mouth, mul(fore, -0.8)), b: wrist, ra: 1.25, rb: 1.05, ramp: SKIN, far: true });
  return [fore, e1, e2];
}

/** ITS HAND: swollen, its long fingers curled like hooks (`open`: how far they are spread to grab, 0 curled). */
function hand(put: Put, side: 'L' | 'R', at: V3, fore: V3, e1: V3, e2: V3, open: number): void {
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: at, ax: [mul(fore, 1.6), mul(e1, 1.3), mul(e2, 1.0)], skin: SKIN, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * (0.35 + 0.5 * open);
    const base = add(at, add(mul(fore, 1.2), mul(e2, spread * 0.9)));
    const curl = 1 - open;
    const mid = add(base, add(mul(fore, 1.6), add(mul(e1, -0.9 * curl), mul(e2, spread * 0.6))));
    const tip = add(mid, add(mul(fore, 1.2 * (1 - 0.6 * curl)), mul(e1, -1.4 * curl)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.5, rb: 0.42, ramp: SKIN, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.42, rb: 0.25, ramp: SKIN, far: true });
  }
}

/** THE DROWNED AS SOLIDS: its swollen bare feet, its sodden robe to the floor torn to rags and slimed at its hem, its dull stole, weed hanging off it, its sleeves and its hooked hands, the cowl with its drowned face and burning eyes, water running off it. */
function drownedBits(st: Stage, m: Moment): Bit[] {
  const { s, q } = m;
  const B = DB;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const glare = lit * (1 + 0.9 * clamp01(m.glint));
  const ph = m.wind * Math.PI * 2;
  const lag = lagOf(m, 1.6, 3.2);
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];

  // --- its feet, bare, swollen, under the rags of its hem ---
  for (const side of ['L', 'R'] as const) {
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    put(`foot${side}`, `foot${side}`, { k: 'rod', a: add(heel, [0, 0, 1.0]), b: add(toe, [0, 0, 0.7]), ra: 1.3, rb: 0.9, ramp: SKIN, far: true });
  }
  // --- ITS ROBE, to the floor, sodden: clinging, heavy, dragging behind it, torn to rags at its hem ---
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const be = s.belly;
  const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
  const footMid = lerp3(lerp3(s.heelL, s.toeL, 0.5), lerp3(s.heelR, s.toeR, 0.5), 0.5);
  const spanF = Math.abs(dot(sub(s.ankleL, s.ankleR), f));
  const spanL = Math.abs(dot(sub(s.ankleL, s.ankleR), l));
  const hemC: V3 = [footMid[0] + lag[0] * 1.3, footMid[1] + lag[1] * 1.3, 1.2];
  const hemDeep = Math.max(B.pelvisDeep + 3.0, spanF / 2 + 2.6);
  const hemWide = Math.max(B.pelvisHalf + 3.4, spanL / 2 + 2.4);
  const hemPts: V3[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const rear = Math.max(0, -Math.cos(a));
    const p = add(hemC, add(mul(f, Math.cos(a) * hemDeep), mul(l, Math.sin(a) * hemWide)));
    hemPts.push(add(p, add([0, 0, Math.sin(ph * 2 + a * 3) * 0.3 + rear * 0.2], mul(lag, rear * 0.7))));
  }
  const rings: Ring[] = [
    { c: add(s.neck, mul(cu, 0.8)), u: mul(cf, 3.8), v: mul(cl, 4.6) },
    { c: lerp3(s.ribs, s.neck, 0.7), u: mul(cf, B.ribDeep + 2.0), v: mul(cl, B.shoulderHalf + 1.0) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 1.8), v: mul(cl, B.ribHalf + 2.0) },
    { c: waistC, u: mul(be[0], B.waistDeep + 1.6), v: mul(be[1], B.waistHalf + 1.6) },
    { c: [s.pelvis[0], s.pelvis[1], s.pelvis[2] - 1.2], u: mul(f, B.pelvisDeep + 2.2), v: mul(l, B.pelvisHalf + 2.4) },
    { c: [kneeMid[0] * 0.6 + hemC[0] * 0.4, kneeMid[1] * 0.6 + hemC[1] * 0.4, kneeMid[2]], u: mul(f, (B.pelvisDeep + 2.2 + hemDeep) / 2), v: mul(l, (B.pelvisHalf + 2.4 + hemWide) / 2) },
    { c: hemC, u: mul(f, hemDeep), v: mul(l, hemWide), pts: hemPts },
  ];
  put('robe', 'robe', { k: 'cloth', rings, ramp: ROBE, look: { folds: [20, -20, 55, -55, 100, -100, 150, -150], lift: 0.04 }, torn: TORN });
  // the fen's slime soaked up its skirts: a band of it round the robe above its hem, patchy
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.2;
    const k = 0.72 + 0.12 * hash(i, 1, 405);
    const c0 = lerp3([s.pelvis[0], s.pelvis[1], s.pelvis[2] - 1.2], hemC, k);
    const dp = (B.pelvisDeep + 2.2) * (1 - k) + hemDeep * k;
    const wd = (B.pelvisHalf + 2.4) * (1 - k) + hemWide * k;
    const p = add(c0, add(mul(f, Math.cos(a) * (dp + 0.25)), mul(l, Math.sin(a) * (wd + 0.25))));
    put('robe', 'slime', { k: 'ball', c: p, ax: [mul(f, 1.6 + hash(i, 2, 405)), mul(l, 1.6 + hash(i, 3, 405)), [0, 0, 1.1 + hash(i, 4, 405)]], skin: SLIME });
  }
  // --- its stole, the cult's pink gone dull, hanging limp and heavy down its front ---
  for (const sd of [1, -1]) {
    const top = add(add(s.neck, mul(cl, sd * 2.7)), mul(cf, 2.0));
    const chest = add(add(s.ribs, mul(cl, sd * 2.4)), mul(cf, B.ribDeep + 2.1));
    const belly = add(add(waistC, mul(be[1], sd * 2.0)), mul(be[0], B.waistDeep + 1.8));
    const end = add(add(lerp3(s.pelvis, kneeMid, 0.7), mul(l, sd * 1.8)), add(mul(f, B.pelvisDeep + 2.4), mul(lag, 0.6)));
    put('stole', 'stole', { k: 'rod', a: top, b: chest, ra: 0.9, rb: 0.95, ramp: STOLE });
    put('stole', 'stole', { k: 'rod', a: chest, b: belly, ra: 0.95, rb: 1.0, ramp: STOLE });
    put('stole', 'stole', { k: 'rod', a: belly, b: end, ra: 1.0, rb: 0.8, ramp: STOLE });
  }
  // --- weed hanging off its shoulders and caught round it, swaying ---
  // (draped over its shoulders, outside its robe, hanging down its front and back in long strands)
  const drape: [number, number, number][] = [[1, 1, 0], [-1, 1, 1], [1, -1, 2], [-1, -1, 3], [1, 0.3, 4], [-1, 0.2, 5]];
  for (const [sd, fb, j] of drape) {
    const sh = sd > 0 ? s.shoulderL : s.shoulderR;
    let w = add(add(sh, mul(cu, 1.6)), add(mul(cl, sd * 0.6), mul(cf, fb * (B.ribDeep * 0.6 + 1.4))));
    const long = 6 + (j % 3);
    for (let i = 0; i < long; i++) {
      const out = i < 2 ? mul(cf, fb * 1.1) : [0, 0, 0] as V3;
      const next = add(add(w, out), add([0, 0, -2.3], add(mul(cl, 0.35 * Math.sin(ph * 2 + i * 0.7 + j)), mul(lag, 0.3))));
      put('weed', 'weed', { k: 'rod', a: w, b: next, ra: 0.75 - i * 0.06, rb: 0.65 - i * 0.06, ramp: WEED });
      w = next;
    }
  }
  // --- its sleeves; its swollen hooked hands ---
  const open = clamp01(q.pt);
  for (const side of ['L', 'R'] as const) {
    const [fore, e1, e2] = sleeve(s, put, side, cu, lag, ph);
    hand(put, side, side === 'L' ? s.handL : s.handR, fore, e1, e2, open);
  }
  // --- water running off it: drips off its sleeves, its hem and its cowl's point, falling ---
  const drips: V3[] = [s.handL, s.handR, add(s.elbowL, [0, 0, -3]), add(s.elbowR, [0, 0, -3]), add(s.head, mul(cf, -6)), ...hemPts.filter((_p, i) => i % 3 === 0)];
  drips.forEach((p, i) => {
    const k = fr(m.t * (1.4 + 0.3 * (i % 3)) + hash(i, 1, 407));
    const z = p[2] - (p[2] + 0.5) * k * k;
    if (z > 0.3) put('drip', 'drip', { k: 'mote', p: [p[0], p[1], z], c: WATER[i % WATER.length], size: i < 4 ? 2 : 1 });
  });
  // (and the wet it leaves round its feet: a ring of drops splashing where they land)
  for (let i = 0; i < 8; i++) {
    const k = fr(m.t * 1.1 + i / 8);
    const a = hash(i, Math.floor(m.t * 1.1 + i / 8), 409) * Math.PI * 2;
    const r = hemWide * (0.8 + 0.4 * hash(i, 2, 409)) + 2 * k;
    if (k < 0.5) put('drip', 'splash', { k: 'mote', p: [hemC[0] + Math.cos(a) * r, hemC[1] + Math.sin(a) * r, 0.3 + 1.5 * k * (1 - k)], c: WATER[1], size: 1 });
  }
  // --- its cowl, its drowned face and burning eyes ---
  cowl(st, s, put, glare, lag, ph);
  return bits;
}

// =============================================================================================
// THE MOB (its look only, for now: its other moves are its stand, placeholders)

export const DROWNED: Mob = {
  id: 'drowned',
  name: 'The Drowned',
  size: 'small: the knight\'s height, hunched',
  build: DB,
  stand: { name: 'The drowned stands heaving, dripping', motion: drownedStand(), rest: DROWNED_REST },
  attack: { name: '(not yet: its stand)', motion: drownedStand(), rest: DROWNED_REST },
  idleFrames: 26,
  idleFps: 10,
  walk: { name: '(not yet: its stand)', motion: drownedStand(), rest: DROWNED_REST, period: DROWNED_STAND_LONG, ground: 0 },
  walkFrames: 26,
  walkFps: 10,
  pace: 0.9,
  reel: { name: '(not yet: its stand)', motion: drownedStand(), rest: DROWNED_REST },
  reelTime: 0.4,
  hit: 0.5,
  warn: 0.2,
  dieTime: 1.6,
  dying: { name: '(not yet: its stand)', motion: drownedStand(), rest: DROWNED_REST },
  aura: { x: DROWNED_CANVAS.ax, y: DROWNED_CANVAS.ay - 28, r: 40, color: '#ffb070', a: 0.1 },
  shadow: 12,
  canvas: DROWNED_CANVAS,
  trueBack: true,
  bits: (st, m) => drownedBits(st, m),
};
void sphere;

export function makeDrownedArt3(pace = DROWNED.pace): ActorArt {
  return { front: mobSet(DROWNED, 'front', pace), back: mobSet(DROWNED, 'back', pace) };
}
