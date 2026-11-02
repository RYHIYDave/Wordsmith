// FLOOR 4'S MOBS, MORE ACTION (the art chat's helper, 1 Nov 2026; docs/mockups/action_f4/README.md). A MOCK-UP: NOTHING OF THE
// GAME IMPORTS THIS FILE. The Ossuary Golem's SKELETON HURL in place of its skull lob, and its club swing made by Movement 9,
// behind GOLEM_HURL (off). (The dagger cultist's frenzy is in his own file, art/cultists.ts, behind DAGGER_FRENZY, off.)
//
// The owner's review of every enemy for more action, 31 Oct 2026, 10:41, of the Ossuary Golem: “Like, yes, there are enemies that
// throw things, but, like, look at the, like, the ossuary golems. Like, they throw a skull, and it's, like, the tiniest little
// projectile. When it lands, it does nothing. And it's so slow that you'll never, ever get hit by it. So, like, why don't they
// throw, like, a full... You know, they throw, like, a whole entire skeleton. And then when it lands, it blows apart. And you can
// get hit by the shrapnel, you know, of, like, a bone or something. You know what I mean? Like, that kind of thing.” Offered back
// to him: "Skeleton hurl: picks up a whole skeleton and hurls it, big in the air, its shadow on the floor showing where. It bursts
// apart when it lands and bones fly out all round as shrapnel." His pick: “Yes (Recommended)”. Under his Movement 9 (24 Oct:
// “Like the wind up and wind down are big but the actual punch is lightning quick”) and, for the enemies, 28 Oct (“Start from now
// on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for the extra time the player gets
// to evade”).
//
// So: it reaches down to the floor at its side and HAULS UP A WHOLE SKELETON out of the bones underfoot (the game's own skeleton's
// look: the big lavender skull with the pink in its sockets, the rib cage, the teal rag at its hips), the skeleton dangling from
// its fist, limbs flopping, skull lolling; HEAVES IT BACK OVERHEAD and HOLDS it there, trembling, its fire flaring (the warning);
// and in TWO FRAMES, smeared, hurls it overarm. The skeleton tumbles through the air, fast, on a low quick arc, its shadow on the
// floor growing and the reach of its burst marked; it lands and BURSTS: bones flung out all round as shrapnel, lying a moment,
// crumbling to dust and gone. Everything is a picture of a moment on a canvas of its own with an anchor, in picture pixels (two
// to a game pixel), every pixel whole, nothing of the friend's cyan (the skeleton's rag is the game's skeleton's teal, its darker
// two tones only).

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import type { ActorArt, Clip } from './actor_types';
import { BONE, INK, PINK, TEAL, hash, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME, SOCKET } from './mkit';
import type { Canvas } from './mkit';
import { GOLEM, OSSUARY, TILE3, eyesOf, faceAlong, mobSet, paintBits, skull, sphere } from './new_mobs3';
import type { Bit, Frame3, Mob, MobMove, Moment, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import { add, bonesAt, cross, dot, len, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, V3 } from './skeleton';
import { floorPx } from './action_f1_fx';

/** THE SWITCH, OFF. With it on, the bestiary's golem is HURL_GOLEM (the bestiary's to choose: as the walled Boneward, art/action_f3_fx.ts). */
export const GOLEM_HURL = { on: false };

type P = Partial<Bones>;
const FR = 1 / 30;
const f = (n: number): number => n / 30;
const TAU = Math.PI * 2;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (k: number): number => {
  const v = clamp01(k);
  return v * v * (3 - 2 * v);
};
const R = GOLEM.stand.rest;
const GB = GOLEM.build;
/** The club of fused skulls: its middle this far past the hand (art/new_mobs3.ts CLUB_OUT), and its far end. */
const CLUB_OUT = 7.6;
export const CLUB_TIP = CLUB_OUT + 4.6;
/** The white of the burst's flash, a touch of the enemy's gold in it. */
const WHITE = '#fff8ec';

// =============================================================================================
// THE CLUB SWING, BY MOVEMENT 9 (its basic blow, kept: its old wind-up was held a sixth of a second and its blow smeared one frame)

/**
 * THE SWING'S NUMBERS (seconds from its start):
 *   strike   two frames, smeared: from 0.8 s to its blow at 0.867 s (frame 26)
 *   wind-up  the club dragged up off the floor by 0.3 s, cocked high behind its left shoulder by 0.5 s, HELD, trembling, the fire
 *            flaring, to 0.8 s
 *   wind-down  on round past its right, held there bent a moment (to 1.32 s); dragged back to rest by 1.6 s
 *   reach    a hero within this many tiles before it, in the half of the floor before it, is struck (its old reach: 1.8)
 */
export const SWING_HIT = f(26);
export const SWING_STRIKE = [f(24), f(26)] as const;
export const SWING = { hit: SWING_HIT, strike: SWING_STRIKE, long: 1.6, reach: 2.2, arc: 180 } as const;
export const SWING_SMEARED = (t: number): boolean => t > SWING_STRIKE[0] + 1e-6 && t <= SWING_STRIKE[1] + FR + 1e-6;
const SWING_NAME = 'The Golem swings its club, wound and held';
function swingKeys(): Key3[] {
  const gather: P = { lhIn: 2, lhx: 4, lhy: 36, lhz: 46, le: 150, twist: 18, pitch: 2, bend: 6, draw: 0.7 };
  const wound: P = { lhIn: 2, lhx: -6, lhy: 38, lhz: 54, le: 140, twist: 30, pitch: -4, bend: 2, px: -1.5, rhx: 6, rhy: -8, rhz: -26, faceUp: 10, draw: 0.95 };
  const blow: P = { lhIn: 2, lhx: 44, lhy: 2, lhz: 40, le: 45, twist: -22, pitch: 10, bend: 10, px: 3, rhx: 2, rhy: -4, rhz: -30, faceUp: 0, draw: 0.8 };
  const thru: P = { ...blow, lhx: 34, lhy: -24, lhz: 36, le: 10, twist: -30, pitch: 12, bend: 12, px: 3.5 };
  const tremble = (d: number, more: P = {}): P => ({ ...wound, lhz: (wound.lhz ?? 0) + d, twist: (wound.twist ?? 0) + d * 1.2, ...more });
  return [
    { at: 0, pose: {} },
    { at: 0.3, pose: gather, ease: 'in' },
    { at: 0.5, pose: wound, ease: 'out' },
    { at: 0.6, pose: tremble(0.6), ease: 'hold' },
    { at: 0.7, pose: tremble(-0.4, { draw: 1 }), ease: 'hold' },
    { at: f(24), pose: tremble(1.2, { draw: 1 }), ease: 'io' },
    // (round it comes, out at its side and level, not through the body)
    { at: f(25), pose: { ...blow, lhx: 18, lhy: 40, lhz: 48, le: 90, twist: 6, pitch: 4, bend: 6, px: 1 }, ease: 'lin' },
    { at: f(26), pose: blow, ease: 'lin' },
    { at: f(26) + 0.24, pose: thru, ease: 'out' },
    { at: 1.32, pose: { ...thru, lhx: 30, lhy: -20, lhz: 30, twist: -24, pitch: 14, bend: 14, draw: 0.6 }, ease: 'io' },
    { at: SWING.long, pose: {}, ease: 'io' },
  ];
}

// =============================================================================================
// THE SKELETON HURL

/**
 * THE HURL'S NUMBERS (seconds from its start; tiles; picture pixels, two to a game pixel):
 *   reach    its fist down to the floor at its right by 0.36 s, closed on the skeleton's spine by 0.44 s (`grip`)
 *   haul     the skeleton hauled up out of the floor, dangling whole from its fist before its right, by 0.78 s
 *   heave    swung up and back over its right shoulder by 1.08 s; HELD there, trembling, its fire flaring, to 1.367 s
 *   strike   TWO FRAMES, smeared: over the top (1.4 s) and loosed before it at 1.433 s (frame 43: the clip's `hit`)
 *   wind-down  bent over after it, heaving, to 1.95 s; up again at 2.5 s
 *   near, far  thrown at a hero from 2.5 to 10 tiles off (the skull's were the same)
 */
export const HURL_HIT = f(43);
export const HURL_STRIKE = [f(41), f(43)] as const;
export const HURL_SMEARED = (t: number): boolean => t > HURL_STRIKE[0] + 1e-6 && t <= HURL_STRIKE[1] + FR + 1e-6;
const HURL_GRIP = 0.44;
const HURL_LONG = 2.5;
const HURL_NAME = 'The Golem hauls up a skeleton and hurls it';
const REACH: P = { px: 2, pz: -9, yaw: -24, pitch: 26, bend: 20, twist: -18, faceUp: -4, faceTurn: -10, rhIn: 2, rhx: 17, rhy: -27, rhz: 6.5, re: 20, draw: 0.6 };
const HAUL: P = { px: 0, pz: -3, yaw: -18, pitch: 6, bend: 4, twist: -16, rhIn: 1, rhx: 16, rhy: -18, rhz: -6, re: 30, faceUp: 6, faceTurn: -14, draw: 0.75 };
const HEAVE: P = { px: -3, pz: -1.5, yaw: -6, pitch: -10, bend: -8, twist: -26, rhIn: 1, rhx: -11, rhy: -31, rhz: 31, re: 20, faceUp: 18, faceTurn: -6, draw: 1 };
const OVER: P = { px: 0.5, pz: -2, yaw: -10, pitch: 2, bend: 2, twist: 0, rhIn: 1, rhx: 8, rhy: -12, rhz: 46, re: 40, faceUp: 10, faceTurn: 0, draw: 0.95 };
const LOOSED: P = { px: 4, pz: -4, yaw: -12, pitch: 14, bend: 14, twist: 20, rhIn: 1, rhx: 34, rhy: -6, rhz: 4, re: 10, faceUp: 2, faceTurn: 4, draw: 0.85 };
const AFTER: P = { px: 5, pz: -6, yaw: -12, pitch: 20, bend: 20, twist: 24, rhIn: 1, rhx: 24, rhy: 6, rhz: -26, re: 0, faceUp: -4, faceTurn: 4, draw: 0.7 };
function hurlKeys(): Key3[] {
  const tremble = (d: number, more: P = {}): P => ({ ...HEAVE, rhz: (HEAVE.rhz ?? 0) + d, pz: (HEAVE.pz ?? 0) - d * 0.4, ...more });
  return [
    { at: 0, pose: {} },
    { at: 0.36, pose: REACH, ease: 'io' },
    { at: HURL_GRIP, pose: { ...REACH, rhz: 5.5, pz: -9.6, draw: 0.7 }, ease: 'io' },
    { at: 0.78, pose: HAUL, ease: 'io' },
    { at: 1.08, pose: HEAVE, ease: 'io' },
    // (held, trembling with the weight of it, the fire flaring)
    { at: 1.15, pose: tremble(0.8), ease: 'io' },
    { at: 1.22, pose: tremble(-0.4, { draw: 0.96 }), ease: 'io' },
    { at: 1.29, pose: tremble(0.8), ease: 'io' },
    { at: f(41), pose: tremble(0.1), ease: 'io' },
    { at: f(42), pose: OVER, ease: 'lin' },
    { at: HURL_HIT, pose: LOOSED, ease: 'lin' },
    { at: HURL_HIT + 0.15, pose: AFTER, ease: 'out' },
    { at: 1.95, pose: { ...AFTER, pz: -5.4, pitch: 18, bend: 18, rhz: -28, draw: 0.6 }, ease: 'io' },
    { at: HURL_LONG, pose: {}, ease: 'io' },
  ];
}
const HURL_KEYS = hurlKeys();
const bonesOfHurl = (t: number) => solve(GB, bonesAt(HURL_KEYS, R, Math.max(0, Math.min(HURL_LONG, t))));
/** Where its fist closes on the skeleton's neck, `t` seconds into the hurl: in its fingers, on the underside of its fist (the skeleton hangs from there, clear of its forearm). */
function gripAt(t: number): V3 {
  const s = bonesOfHurl(t);
  const fore = norm(sub(s.handR, s.elbowR), [0, 0, -1]);
  const under = norm(sub([0, 0, -1], mul(fore, -fore[2])), s.chest[0]);
  return add(s.handR, add(mul(fore, 2.6), mul(under, 4.6)));
}

// --- THE SKELETON: the game's skeleton's measure (art/monster_bones3.ts SKELETON3_BODY, 46 tall) ---

/** Its lengths: spine (the root of its neck to its pelvis), its shoulders and hips from the middle, its limbs, its skull up off its neck. */
const SK = { spine: 17, drop: 1.4, shoulder: 5.6, upper: 9, fore: 8.6, hip: 3.2, thigh: 11.6, shin: 11.2, foot: 4.6, skull: 5.6 } as const;
/** Its bones' thickness (the game's skeleton's: art/monster_bones3.ts). */
const RB = { thigh: [1.0, 0.85], shin: [0.85, 0.72], upper: [0.85, 0.75], fore: [0.75, 0.66], foot: [0.95, 0.75], knee: 1.45, elbow: 1.3, shoulder: 1.45, ankle: 1.0, vertebra: 1.1, rib: 0.72, finger: 0.5 } as const;
/** Its rag: the game's skeleton's teal, its two darker tones only (its brightest is too near the friend's cyan to be on an enemy's missile). */
const RAG: Ramp = [TEAL[0], TEAL[0], TEAL[0], TEAL[2], TEAL[2]];
/** Its ribs: [down from the root of its neck, half their width, half their depth]. */
const RIBS: ReadonlyArray<readonly [number, number, number]> = [[2.2, 4.0, 2.9], [4.6, 4.8, 3.3], [7.0, 5.0, 3.4], [9.4, 4.4, 3.1]];

/** A skeleton at a moment: the root of its neck, the lines of its body (cu up its spine), where its limbs go, its skull's way, its jaw. */
interface Rag {
  neck: V3;
  cf: V3;
  cl: V3;
  cu: V3;
  /** Each limb's two ways: arms upper then fore, legs thigh then shin (L then R). */
  armL: readonly [V3, V3];
  armR: readonly [V3, V3];
  legL: readonly [V3, V3];
  legR: readonly [V3, V3];
  skullWay: V3;
  gape: number;
}
/** Its joints, from a Rag. */
function jointsOf(r: Rag): { pelvis: V3; sh: [V3, V3]; el: [V3, V3]; hand: [V3, V3]; hip: [V3, V3]; knee: [V3, V3]; ankle: [V3, V3]; toe: [V3, V3]; skull: V3; face: Frame3 } {
  const { neck, cf, cl, cu } = r;
  const pelvis = add(neck, mul(cu, -SK.spine));
  const top = add(neck, mul(cu, -SK.drop));
  const sh: [V3, V3] = [add(top, mul(cl, SK.shoulder)), add(top, mul(cl, -SK.shoulder))];
  const el: [V3, V3] = [add(sh[0], mul(r.armL[0], SK.upper)), add(sh[1], mul(r.armR[0], SK.upper))];
  const hand: [V3, V3] = [add(el[0], mul(r.armL[1], SK.fore)), add(el[1], mul(r.armR[1], SK.fore))];
  const hip: [V3, V3] = [add(pelvis, mul(cl, SK.hip)), add(pelvis, mul(cl, -SK.hip))];
  const knee: [V3, V3] = [add(hip[0], mul(r.legL[0], SK.thigh)), add(hip[1], mul(r.legR[0], SK.thigh))];
  const ankle: [V3, V3] = [add(knee[0], mul(r.legL[1], SK.shin)), add(knee[1], mul(r.legR[1], SK.shin))];
  const footWay = (shin: V3): V3 => norm(add(mul(cf, 0.85), mul(shin, 0.35)), cf);
  const toe: [V3, V3] = [add(ankle[0], mul(footWay(r.legL[1]), SK.foot)), add(ankle[1], mul(footWay(r.legR[1]), SK.foot))];
  const skullC = add(neck, mul(r.skullWay, SK.skull));
  const fwd = norm(sub(cf, mul(r.skullWay, dot(cf, r.skullWay))), cf);
  const face = faceAlong(fwd, r.skullWay);
  return { pelvis, sh, el, hand, hip, knee, ankle, toe, skull: skullC, face };
}
/** The points of it, every two lengths along each bone (for the review: what it carries must not go through it). */
function ragPoints(r: Rag): V3[] {
  const j = jointsOf(r);
  const out: V3[] = [j.skull];
  const along = (a: V3, b: V3): void => {
    const n = Math.max(1, Math.ceil(len(sub(b, a)) / 2));
    for (let i = 0; i <= n; i++) out.push(lerp3(a, b, i / n));
  };
  along(r.neck, j.pelvis);
  for (let k = 0; k < 2; k++) {
    along(j.sh[k], j.el[k]);
    along(j.el[k], j.hand[k]);
    along(j.hip[k], j.knee[k]);
    along(j.knee[k], j.ankle[k]);
  }
  return out;
}
/**
 * THE SKELETON AS SOLIDS: its skull (the game's skeleton's, big, its sockets lit pink) and its jaw hanging open; its spine, every
 * vertebra a knob; its ribs round from its spine to its breast; its pelvis and the teal rag round it; its arms and legs, a knob at
 * every joint, three finger bones to each hand, long feet. `floor`: what is below the floor is not painted (it comes up out of it).
 */
function ragBits(st: Stage, put: Put, r: Rag, lit: number, floor = false): void {
  const j = jointsOf(r);
  const { cf, cl, cu } = r;
  const low = (p: V3, rr: number): boolean => floor && p[2] < rr * 0.6;
  const rod = (part: string, a: V3, b: V3, ra: number, rb: number, ramp: Ramp = BONE): void => {
    if (floor) {
      const za = a[2] - ra - 0.3;
      const zb = b[2] - rb - 0.3;
      if (za < 0 && zb < 0) return;
      if (za < 0) a = lerp3(b, a, zb / (zb - za));
      else if (zb < 0) b = lerp3(a, b, za / (za - zb));
    }
    put(part, part, { k: 'rod', a, b, ra, rb, ramp });
  };
  const knob = (part: string, c: V3, rr: number): void => {
    if (!low(c, rr)) put(part, part, { k: 'ball', c, ax: sphere(rr), skin: BONE });
  };
  // the skull and its jaw
  if (!low(j.skull, 5)) {
    skull(st, put, 'skHead', 'skHead', j.skull, j.face, [5.3, 5.1, 4.7], BONE, eyesOf(st, j.face), lit, true, 3);
    const [ff, fl, fu] = j.face;
    const jaw = add(j.skull, add(mul(ff, 1.3 - r.gape * 0.7), mul(fu, -3.6 - r.gape * 1.6)));
    put('skJaw', 'skJaw', { k: 'ball', c: jaw, ax: [mul(ff, 2.9), mul(fl, 3.5), mul(fu, 1.35)], skin: BONE });
  }
  // the spine
  rod('skSpine', r.neck, j.pelvis, 0.8, 0.8, [BONE[0], BONE[0], BONE[1], BONE[2], BONE[2]]);
  for (let i = 0; i <= 5; i++) knob('skSpine', lerp3(r.neck, j.pelvis, i / 5.5), RB.vertebra);
  // the ribs: each side round from the spine at the back to near the breast
  RIBS.forEach(([down, W, Dp], i) => {
    const c = add(r.neck, mul(cu, -down));
    for (const sg of [1, -1] as const) {
      let last: V3 | null = null;
      for (let k = 0; k <= 6; k++) {
        const th = 0.32 + ((Math.PI - 0.32) * k) / 6;
        const p = add(add(add(c, mul(cf, Dp * Math.cos(th))), mul(cl, sg * W * Math.sin(th))), mul(cu, -1.1 * (1 + Math.cos(th)) * 0.5));
        if (last) rod('skRibs', last, p, RB.rib, RB.rib * 0.9);
        last = p;
      }
    }
    void i;
  });
  rod('skRibs', add(r.neck, add(mul(cu, -1.6), mul(cf, 2.6))), add(r.neck, add(mul(cu, -8.4), mul(cf, 3.0))), 0.6, 0.5);
  // the pelvis, and the rag round it
  if (!low(j.pelvis, 2.6)) {
    put('skPelvis', 'skPelvis', { k: 'ball', c: add(j.pelvis, mul(cu, 0.9)), ax: [mul(cf, 2.4), mul(cl, 4.4), mul(cu, 2.2)], skin: BONE });
    put('skRag', 'skRag', { k: 'band', ring: { c: add(j.pelvis, mul(cu, -0.3)), u: mul(cf, 3.3), v: mul(cl, 5.1) }, ramp: RAG, rows: 4 });
  }
  // the arms and the legs
  for (let k = 0; k < 2; k++) {
    const side = k === 0 ? 'L' : 'R';
    const arm = `skArm${side}`;
    const leg = `skLeg${side}`;
    knob(arm, j.sh[k], RB.shoulder);
    rod(arm, j.sh[k], j.el[k], RB.upper[0], RB.upper[1]);
    knob(arm, j.el[k], RB.elbow);
    rod(arm, j.el[k], j.hand[k], RB.fore[0], RB.fore[1]);
    const fore = norm(sub(j.hand[k], j.el[k]), cu);
    const across = norm(cross(fore, cf), cl);
    for (const s of [-1, 0, 1]) rod(arm, add(j.hand[k], mul(across, s * 0.7)), add(add(j.hand[k], mul(fore, 3.0)), mul(across, s * 1.1)), RB.finger, RB.finger * 0.8);
    rod(leg, j.hip[k], j.knee[k], RB.thigh[0], RB.thigh[1]);
    knob(leg, j.knee[k], RB.knee);
    rod(leg, j.knee[k], j.ankle[k], RB.shin[0], RB.shin[1]);
    knob(leg, j.ankle[k], RB.ankle);
    rod(leg, j.ankle[k], j.toe[k], RB.foot[0], RB.foot[1]);
  }
}

// --- the skeleton in its fist: hanging from it, flopping as it is hauled, swung and held ---

/** The pull of the floor on it, in its own lengths a second each second (a length is about a thirtieth of a man's height). */
const PULL = 330;
/** How far below its fist the skeleton's weight hangs (its own lengths), and how fast its swinging dies away (a second each second). */
const SWING_LEN = 14;
const SWING_DAMP = 6;
/** The table of the way it hangs, worked out once: a step of it every 240th of a second, from the moment its fist closes on it. */
const HANG_STEP = 1 / 240;
let HANG: V3[] | null = null;
/**
 * WHICH WAY IT HANGS FROM THE FIST, as a weight on a stiff line swings: pulled down by the floor's pull, flung out away from the way
 * the fist goes faster or slower (the fist's own way smoothed over a twelfth of a second, so that it trembles without kicking it),
 * swinging, the swing dying away. Worked out step by step from where its fist closes on it (hanging straight down, still).
 */
function hangTable(): V3[] {
  if (HANG) return HANG;
  const n = Math.ceil((HURL_HIT - HURL_GRIP + 0.05) / HANG_STEP) + 1;
  const W = 10;
  // (up to the last moment of its wind-up: the strike itself is too fast to swing it, it whips it: heldRag)
  const raw = Array.from({ length: n + 2 * W + 2 }, (_, i) => gripAt(Math.min(HURL_STRIKE[0], HURL_GRIP + (i - W - 1) * HANG_STEP)));
  const g = Array.from({ length: n + 2 }, (_, i) => {
    let acc: V3 = [0, 0, 0];
    for (let k = -W; k <= W; k++) acc = add(acc, raw[i + W + k]);
    return mul(acc, 1 / (2 * W + 1));
  });
  const out: V3[] = [];
  let d: V3 = [0, 0, -1];
  let w: V3 = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    // (its spine held stiff in the fist: it is swung by a fifth of what the fist does, and never more than a little over the pull down)
    let a = mul(add(sub(g[i], mul(g[i + 1], 2)), g[i + 2]), 0.2 / (HANG_STEP * HANG_STEP));
    if (len(a) > PULL * 1.2) a = mul(a, (PULL * 1.2) / len(a));
    const pull = sub([0, 0, -PULL], a);
    w = add(w, mul(sub(mul(cross(d, pull), 1 / SWING_LEN), mul(w, SWING_DAMP)), HANG_STEP));
    d = norm(add(d, mul(cross(w, d), HANG_STEP)), [0, 0, -1]);
    out.push(d);
  }
  HANG = out;
  return out;
}
/** Which way a thing hanging from its fist hangs, `lag` seconds behind the fist (from the table; straight down before it has it). */
function hangAt(t: number, lag: number): V3 {
  const T = (t - lag - HURL_GRIP) / HANG_STEP;
  if (T <= 0) return [0, 0, -1];
  const tab = hangTable();
  const i = Math.min(tab.length - 2, Math.floor(T));
  const d = norm(lerp3(tab[i], tab[i + 1], Math.min(1, T - i)), [0, 0, -1]);
  // (a body held by the neck in a fist is swung out by it, never over it: it hangs at least a little down from the fist)
  if (d[2] <= -0.35) return d;
  const level = Math.hypot(d[0], d[1]) || 1;
  const k = Math.sqrt(1 - 0.35 * 0.35) / level;
  return [d[0] * k, d[1] * k, -0.35];
}
/** The skeleton in its fist, `t` seconds into the hurl (null when it does not hold one: before it closes its fist on it, and once it has let go). */
function heldRag(t: number): Rag | null {
  if (t < HURL_GRIP - 1e-6 || t >= HURL_HIT - 1e-6) return null;
  const neck = gripAt(t);
  // (in the strike, whipped over so fast that it trails straight back from its fist along the way it has come)
  const whip = t > HURL_STRIKE[0] + 1e-6 ? norm(sub(gripAt(t - FR * 0.6), neck), [0, 0, -1]) : null;
  const hang = (lag: number): V3 => (whip ? norm(lerp3(hangAt(t, lag), whip, 0.85), whip) : hangAt(t, lag));
  const down = hang(0.03);
  const cu = mul(down, -1);
  const turn = (-70 + 22 * Math.sin(1.7 * t + 0.4)) * (Math.PI / 180);
  const cf0: V3 = [Math.cos(turn), Math.sin(turn), 0];
  const cl = norm(cross(cu, cf0), [0, 1, 0]);
  const cf = cross(cl, cu);
  const sway = (k: number, a: number): number => a * Math.sin(5.1 * t + k);
  const limb = (lag: number, out: number, k: number, fwd = 0): V3 => norm(add(add(hang(lag), mul(cl, out)), mul(cf, fwd + sway(k, 0.22))), down);
  return {
    neck,
    cf,
    cl,
    cu,
    armL: [limb(0.07, 0.42, 0), limb(0.11, 0.2, 1.3, 0.15)],
    armR: [limb(0.07, -0.42, 2.1), limb(0.11, -0.2, 3.2, 0.15)],
    legL: [limb(0.06, 0.1, 0.7, 0.1), limb(0.1, 0.05, 2.0, -0.12)],
    legR: [limb(0.06, -0.1, 2.6, 0.1), limb(0.1, -0.05, 3.9, -0.12)],
    // (its skull lolls over the fist that holds it by the neck, rolling as it swings)
    skullWay: norm(add(add(mul(cu, 0.45), mul(cf, 0.95 + 0.2 * Math.sin(3.3 * t))), mul(cl, 0.45 * Math.sin(2.3 * t + 1))), cu),
    gape: 0.55 + 0.35 * Math.sin(7 * t),
  };
}
/**
 * FOR THE REVIEW: the points of the skeleton in its fist, `t` seconds into its hurl (null when it holds none): all of it but what
 * is in its fist and against it (its neck and skull, the top of its spine and its shoulders: within `HELD_IN` of where it grips).
 */
export const HELD_IN = 7;
export function heldBones(mob: Mob, t: number): V3[] | null {
  if (mob !== HURL_GOLEM) return null;
  const r = heldRag(t);
  return r ? ragPoints(r).filter((p) => len(sub(p, r.neck)) > HELD_IN) : null;
}

/** The dust and chips of bone thrown up where its fist goes into the floor and the skeleton comes up out of it. */
function hauledDust(put: Put, t: number): void {
  const k = (t - 0.33) / 0.7;
  if (k < 0 || k > 1) return;
  const at = gripAt(HURL_GRIP);
  const c: V3 = [at[0], at[1], 0];
  for (let i = 0; i < 22; i++) {
    if (hash(i, 7, 811) < k * 0.95) continue;
    const a = (i / 22) * TAU + hash(i, 1, 811);
    const r = 4 + (6 + 8 * hash(i, 2, 811)) * Math.sqrt(k);
    const z = 0.6 + (2 + 7 * hash(i, 3, 811)) * Math.sin(Math.PI * Math.min(1, k * 1.2));
    put('dust', 'dust', { k: 'mote', p: [c[0] + Math.cos(a) * r * 1.2, c[1] + Math.sin(a) * r, z], c: i % 3 ? OSSUARY[2] : BONE[1], size: 2 });
  }
  // (chips of bone flung up and falling)
  for (let i = 0; i < 10; i++) {
    const life = 0.35 + 0.2 * hash(i, 4, 811);
    const u = (t - 0.36) / life;
    if (u < 0 || u > 1) continue;
    const a = hash(i, 5, 811) * TAU;
    const out = (5 + 9 * hash(i, 6, 811)) * u;
    put('dust', 'dust', { k: 'mote', p: [c[0] + Math.cos(a) * out, c[1] + Math.sin(a) * out, 1 + (14 + 10 * hash(i, 8, 811)) * 4 * u * (1 - u)], c: i % 2 ? BONE[3] : BONE[2], size: 1 });
  }
}

/** The smear's colours, the oldest to the newest: dull bone, bone, pale, near white; and the enemy's pink at its leading edge. */
const SMEAR: readonly string[] = [OSSUARY[1], BONE[2], BONE[3], WHITE];
/** After-images along lines of points (each given `n` moments from a frame and a fifth back to now, oldest last): the newest near white, the oldest dull and broken. */
function smearAlong(st: Stage, put: Put, lines: V3[][], thin: boolean): void {
  for (let j = 0; j < lines.length; j++) {
    const line = lines[j];
    for (let i = line.length - 1; i >= 1; i--) {
      const age = i / (line.length - 1);
      if (thin && age > 0.45) continue;
      const a = line[i];
      const b = line[i - 1];
      const n = Math.max(1, Math.ceil(Math.hypot(st.at(b)[0] - st.at(a)[0], st.at(b)[1] - st.at(a)[1])));
      const c = age > 0.75 ? SMEAR[0] : age > 0.45 ? SMEAR[1] : age > 0.2 ? SMEAR[2] : SMEAR[3];
      for (let k = 0; k < n; k++) {
        if (age > 0.55 && (k + j) % 2 === 1) continue;
        put('smear', 'smear', { k: 'mote', p: lerp3(a, b, k / n), c: j === 0 && age < 0.5 && !thin ? FLAME[2] : c, size: !thin && age < 0.35 && j % 2 === 1 ? 2 : 1 });
      }
    }
  }
}
const SWING_KEYS = swingKeys();
/** The swing's smear: the club's head, round it, from where it was a frame and a fifth back. */
function swingSmear(st: Stage, put: Put, t: number): void {
  const thin = Math.abs(t - SWING_STRIKE[1] - FR) < 1e-6;
  const lines: V3[][] = [[], [], [], []];
  for (let i = 0; i <= 8; i++) {
    const s = solve(GB, bonesAt(SWING_KEYS, R, t - (FR * 1.2 * i) / 8));
    const fore = norm(sub(s.handL, s.elbowL), [0, 0, -1]);
    const cc = add(s.handL, mul(fore, CLUB_OUT));
    const e1 = norm(cross(fore, [0, 0, 1]), [0, 1, 0]);
    lines[0].push(add(cc, mul(fore, 4.2)));
    lines[1].push(add(cc, [0, 0, 5]));
    lines[2].push(add(cc, mul(e1, 5)));
    lines[3].push(add(cc, [0, 0, -4]));
  }
  smearAlong(st, put, lines, thin);
}
/** The hurl's smear: its fist, and the skeleton swung over in it (its skull, its pelvis, its feet), from a frame and a fifth back to now (to where it let go). */
function hurlSmear(st: Stage, put: Put, t: number): void {
  const thin = Math.abs(t - HURL_HIT - FR) < 1e-6;
  const lines: V3[][] = [[], [], [], [], []];
  for (let i = 0; i <= 8; i++) {
    const u = Math.min(t, HURL_HIT - 0.002) - (FR * 1.2 * i) / 8;
    const r = heldRag(u);
    if (!r) continue;
    const j = jointsOf(r);
    lines[0].push(j.skull);
    lines[1].push(r.neck);
    lines[2].push(j.pelvis);
    lines[3].push(j.ankle[0]);
    lines[4].push(j.ankle[1]);
  }
  smearAlong(st, put, lines.filter((l) => l.length > 1), thin);
}

/** The golem's bits for these moves: the skeleton in its fist, the dust where it hauls it up, the smears. */
function hurlBits(st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  if (m.move === HURL_NAME) {
    const r = heldRag(m.t);
    if (r) ragBits(st, put, r, 1, true);
    hauledDust(put, m.t);
    if (HURL_SMEARED(m.t)) hurlSmear(st, put, m.t);
  } else if (m.move === SWING_NAME && SWING_SMEARED(m.t)) swingSmear(st, put, m.t);
  return bits;
}

/** Its canvas for its new moves: the skeleton held out at its right and swung overhead (the golem's own, CANVAS3, made bigger all round). */
const HURL_CANVAS = { w: 300, h: 236, ax: 150, ay: 186 } as const;
const old = GOLEM.more ?? {};
/**
 * THE OSSUARY GOLEM WITH ITS SKELETON HURL (GOLEM_HURL): the game's golem in all but its club swing (made by Movement 9) and its
 * throw (the skeleton hurl, in place of the skull lob). Its slam is kept as it was. Its old swing and its old skull lob are kept
 * in art/new_mobs3.ts (GOLEM), out of this one's set.
 */
export const HURL_GOLEM: Mob = {
  ...GOLEM,
  attack: { name: SWING_NAME, motion: { keys: SWING_KEYS, hit: SWING_HIT }, rest: R, sweep: true },
  hit: SWING_HIT,
  warn: 0.5,
  more: {
    throw: { name: HURL_NAME, motion: { keys: HURL_KEYS, hit: HURL_HIT }, rest: R } as MobMove,
    slam: old.slam as MobMove,
  },
  canvas: HURL_CANVAS,
  aura: { ...GOLEM.aura, x: GOLEM.aura.x - 84 + HURL_CANVAS.ax, y: GOLEM.aura.y - 132 + HURL_CANVAS.ay },
  bits: (st, m) => [...GOLEM.bits(st, m), ...hurlBits(st, m)],
};

// =============================================================================================
// THE SKELETON IN FLIGHT, ITS SHADOW, AND ITS BURST

/** Where it leaves its fist: tiles before the golem, tiles to its left, and how high (picture pixels). */
export const HURL_FROM: readonly [number, number, number] = (() => {
  const g = gripAt(HURL_HIT - 0.002);
  return [g[0] / TILE3, g[1] / TILE3, g[2]];
})();
/**
 * ITS FLIGHT AND ITS BURST (seconds; tiles; picture pixels, two to a game pixel):
 *   aim        it takes its aim where the hero stands as it has the skeleton up and back and begins to hold it (1.08 s), and the
 *              reach of its burst is marked on the floor from then (`burstPainted` before it lands): 0.35 s of its hold, and its flight
 *   fly(d)     its flight to a hero `d` tiles off: 0.34 + 0.045 d seconds (0.45 s at 2.5 tiles, 0.57 at 5, 0.79 at 10; the skull's
 *              was 1.1 s whatever the way). So the mark is down 0.8 s before it bursts at 2.5 tiles, 0.92 s at 5, 1.14 s at 10 (the
 *              knight runs 4.6 tiles a second: out of it in half a second)
 *   arc(d)     how high its arc rises over the straight way from its fist down to where it bursts: 10 + 3.2 d picture pixels (26
 *              at 5 tiles: a low, fast throw; the skull went up 200)
 *   land       its middle this high as it bursts (picture pixels: its bones about the floor)
 *   spin       it tumbles head over heels this many times a second
 *   r          THE BURST: a hero within this many tiles of where it lands, as it lands, is struck by the bones (drawn and tested
 *              from 2.0 to 2.5: the main chat may set it; the skull's: 1.1)
 *   wave       its dust goes out to its edge in this long; the bones flung out land within it from 0.3 to 0.55 s
 *   lie, long  the bones lie from where they land until they crumble, from 1.0 s to 1.6 s; nothing left by `long`
 */
export const HURL = { hit: HURL_HIT, strike: HURL_STRIKE, aim: 1.08, near: 2.5, far: 10, land: 16, spin: 1.6, r: 2.25, wave: 0.2, lie: [1.0, 1.6] as const, long: 1.8, from: HURL_FROM } as const;
export const hurlFly = (d: number): number => 0.34 + 0.045 * d;
export const hurlArc = (d: number): number => 10 + 3.2 * d;
/** Where its middle is `u` (0 to 1) of the way through its flight to a hero `d` tiles before the golem: tiles before it, tiles to its left, picture pixels up. */
export function hurlAt(u: number, d: number): [number, number, number] {
  const k = clamp01(u);
  const [x0, y0, z0] = HURL_FROM;
  return [x0 + (d - x0) * k, y0 * (1 - k), z0 + (HURL.land - z0) * k + 4 * hurlArc(d) * k * (1 - k)];
}
/** Whether a hero `x`, `y` tiles from where it lands is struck by its burst. */
export const burstStrikes = (x: number, y: number, radius: number = HURL.r): boolean => Math.hypot(x, y) <= radius;

/** The skeleton in flight, on a canvas of its own: its middle on the anchor. */
export const HURLED_CANVAS: Canvas = { w: 112, h: 112, ax: 56, ay: 56 };
/**
 * It in flight, `turn` (0 to 1) of the way round its tumble, seen along `eye`: CARTWHEELING, its front to the eye (so that it is seen
 * whole, a whole skeleton, and not edge on), its arms flung wide and its legs splayed, flailing.
 */
function flyingRag(turn: number, eye: V3): Rag {
  const th = turn * TAU;
  const cf = norm(add(eye, [0, 0, -0.25]), eye);
  const up0 = norm(sub([0, 0, 1], mul(cf, cf[2])), [0, 0, 1]);
  const side0 = cross(up0, cf);
  const cu = norm(add(mul(up0, Math.cos(th)), mul(side0, Math.sin(th))), up0);
  const cl = norm(cross(cu, cf), side0);
  const neck = mul(cu, SK.spine * 0.5);
  const w = (k: number): number => Math.sin(2 * th + k);
  const way = (a: V3, b: V3, c: V3): V3 => norm(add(add(a, b), c), cu);
  return {
    neck,
    cf,
    cu,
    cl,
    armL: [way(mul(cl, 0.85), mul(cu, 0.35 + 0.3 * w(0)), mul(cf, 0.3 * w(1))), way(mul(cl, 0.6), mul(cu, 0.6 * w(0.8)), mul(cf, 0.4))],
    armR: [way(mul(cl, -0.85), mul(cu, 0.35 + 0.3 * w(2)), mul(cf, 0.3 * w(3))), way(mul(cl, -0.6), mul(cu, 0.6 * w(2.8)), mul(cf, 0.4))],
    legL: [way(mul(cu, -1), mul(cl, 0.5), mul(cf, 0.45 * w(0.5))), way(mul(cu, -1), mul(cl, 0.2), mul(cf, -0.6 + 0.4 * w(1.5)))],
    legR: [way(mul(cu, -1), mul(cl, -0.5), mul(cf, -0.45 * w(0.5))), way(mul(cu, -1), mul(cl, -0.2), mul(cf, -0.6 - 0.4 * w(1.5)))],
    skullWay: norm(add(cu, mul(cf, 0.5 * Math.sin(th * 2 + 0.6))), cu),
    gape: 0.7 + 0.3 * Math.sin(th * 3),
  };
}
/** THE SKELETON IN FLIGHT, `turn` (0 to 1) of the way round its tumble, seen from in front or behind, with the enemy's pink edge. */
export function paintHurled(turn: number, view: GameView = 'front'): Painted {
  const C = HURLED_CANVAS;
  const st = stage(view, C.ax, C.ay, C);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  // (its middle on the anchor: its root of the neck half its spine up from it)
  ragBits(st, put, flyingRag(turn, st.eye), 1);
  const lights = paintBits(st, bits, [0, 0, 0]);
  return { px: st.whole(ENEMY_RIM), lights };
}
/** Its tumble, once round, as the game holds a picture (each frame cut down, its anchor at its middle): `HURL.spin` times round a second. */
export const HURLED_FRAMES = 12;
export function makeHurledArt(view: GameView = 'front'): Sprite[] {
  return lazyFrames(HURLED_FRAMES, (i) => toSprite(paintHurled(i / HURLED_FRAMES, view), null, HURLED_CANVAS.ax, HURLED_CANVAS.ay));
}
/** The golem with its hurl as the game holds a monster (as art/new_mobs3.ts makeGolemArt3; the skeleton in flight as its moves' `hurled`, as the skull's are `skull`). */
export function makeHurlGolemArt(pace = GOLEM.pace): ActorArt {
  // (all that it keeps is the game's golem's own pictures, frame for frame: its stand, its walk, struck, its death, its slam; its
  // swing and its hurl are painted on a canvas of their own, bigger, and trimmed to the figure as every picture is)
  const art = { front: mobSet(GOLEM, 'front', pace), back: mobSet(GOLEM, 'back', pace) };
  for (const [set, view] of [[art.front, 'front'], [art.back, 'back']] as const) {
    const own = mobSet(HURL_GOLEM, view, pace);
    const hurled: Clip = { frames: makeHurledArt(view), fps: HURLED_FRAMES * HURL.spin, loop: 0 };
    set.attack = own.attack;
    if (set.clips && own.clips) {
      set.clips.attack = own.clips.attack;
      set.clips.moves = { throw: (own.clips.moves ?? {}).throw, slam: (set.clips.moves ?? {}).slam, hurled };
    }
  }
  return art;
}

/** Its shadow on the floor under it (its own canvas, anchored at the floor point under its middle). */
export const SHADOW_CANVAS: Canvas = { w: 84, h: 44, ax: 42, ay: 22 };
/** An ordered pattern for laying a shadow in whole pixels, thin to thick (4 by 4). */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/**
 * ITS SHADOW, `k` (0 to 1) of the way through its flight: small and thin as it leaves the golem's fist, growing and darkening as
 * it comes down, so that where it will land is seen before it lands; the floor's own dark, in whole pixels.
 */
export function hurlShadowPainted(k: number): Painted {
  const C = SHADOW_CANVAS;
  const px = new Px(C.w, C.h);
  const near = clamp01(k);
  const rx = 9 + 26 * near;
  const ry = rx * 0.45;
  const thick = 0.3 + 0.62 * near;
  for (let y = -Math.ceil(ry); y <= Math.ceil(ry); y++) {
    for (let x = -Math.ceil(rx); x <= Math.ceil(rx); x++) {
      const e = (x / rx) ** 2 + (y / ry) ** 2;
      if (e > 1) continue;
      const d = thick * (e > 0.7 ? 0.6 : 1);
      const X = C.ax + x;
      const Y = C.ay + y;
      if (BAYER[(Y & 3) * 4 + (X & 3)] / 16 < d) px.set(X, Y, INK);
    }
  }
  return { px, lights: [] };
}

/** The burst's canvas: up to 2.5 tiles round where it lands, and the bones flung up over it. Its anchor is where it lands. */
export const BURST_CANVAS: Canvas = { w: 260, h: 220, ax: 130, ay: 150 };
/** Which part of what stands up off the floor: what is behind a figure where it lands, what is before it, or all. */
export type Side = 'behind' | 'before' | 'all';

/** One of the bones it bursts into: what it is, which way and how far it flies, how high, for how long, how it turns, when it crumbles. */
interface Shard {
  kind: 'skull' | 'jaw' | 'pelvis' | 'rib' | 'bone';
  long: number;
  r: number;
  way: number;
  far: number;
  high: number;
  fly: number;
  spin: number;
  lay: number;
  gone: number;
}
/** THE BONES IT BURSTS INTO: its skull and jaw, its pelvis, four ribs, its long bones (two of each), two lengths of spine, its hands and feet. */
function shardsOf(radius: number): Shard[] {
  const kinds: Array<[Shard['kind'], number, number]> = [
    ['skull', 0, 5], ['jaw', 0, 2.4], ['pelvis', 0, 3],
    ['rib', 9, 0.72], ['rib', 9, 0.72], ['rib', 8, 0.72], ['rib', 8, 0.72],
    ['bone', SK.thigh, 1.0], ['bone', SK.thigh, 1.0], ['bone', SK.shin, 0.85], ['bone', SK.shin, 0.85],
    ['bone', SK.upper, 0.85], ['bone', SK.upper, 0.85], ['bone', SK.fore, 0.75], ['bone', SK.fore, 0.75],
    ['bone', 8.5, 1.1], ['bone', 8.5, 1.1], ['bone', SK.foot, 0.9], ['bone', SK.foot, 0.9], ['bone', 3.4, 0.6], ['bone', 3.4, 0.6],
  ];
  const n = kinds.length;
  return kinds.map(([kind, long, r], i) => ({
    kind,
    long,
    r,
    way: (i / n) * TAU + (hash(i, 1, 907) - 0.5) * 0.5,
    // (the heavy ones not so far: the skull rolls out a tile and more; the rest to within the burst's edge)
    far: radius * TILE3 * (kind === 'skull' || kind === 'pelvis' ? 0.45 + 0.15 * hash(i, 2, 907) : 0.5 + 0.48 * hash(i, 2, 907)),
    high: 12 + 22 * hash(i, 3, 907),
    fly: 0.24 + 0.22 * hash(i, 4, 907),
    spin: (2 + 3 * hash(i, 5, 907)) * (hash(i, 6, 907) > 0.5 ? 1 : -1),
    lay: hash(i, 7, 907) * TAU,
    gone: HURL.lie[0] + (HURL.lie[1] - HURL.lie[0]) * hash(i, 8, 907),
  }));
}
/** How long a bone takes to crumble to dust. */
const CRUMBLE = 0.16;
/** Where a shard is `t` seconds after the burst (its middle, the figure's own lengths from where it landed), its way along it, and whether it is down. */
function shardAt(s: Shard, t: number): { c: V3; axis: V3; up: V3; down: boolean } {
  const u = Math.min(1, t / s.fly);
  const flat: V3 = [Math.cos(s.lay), Math.sin(s.lay), 0];
  const out: V3 = [Math.cos(s.way), Math.sin(s.way), 0];
  const slid = t > s.fly ? 0.06 * smooth((t - s.fly) / 0.12) : 0;
  // (flung out fast, slowing as it goes)
  const d = s.far * (1 - (1 - u) * (1 - u) * 0.75 - 0.25 * (1 - u) + slid);
  const z = 10 * (1 - u) + 4 * s.high * u * (1 - u) + s.r * u;
  // (turning over and over as it flies, about a level line across its way; lying flat as it lands)
  const ang = s.spin * TAU * Math.max(0, s.fly - t);
  const perp: V3 = [-out[1], out[0], 0];
  const rot = (v: V3): V3 => add(add(mul(v, Math.cos(ang)), mul(cross(perp, v), Math.sin(ang))), mul(perp, dot(perp, v) * (1 - Math.cos(ang))));
  return { c: [out[0] * d, out[1] * d, z], axis: norm(rot(flat), flat), up: norm(rot([0, 0, 1]), [0, 0, 1]), down: t >= s.fly };
}
/** A shard as solids. */
function shardBits(st: Stage, put: Put, s: Shard, i: number, at: { c: V3; axis: V3; up: V3 }): void {
  const part = `shard${i}`;
  const { c, axis, up } = at;
  const side = norm(cross(up, axis), [0, 1, 0]);
  if (s.kind === 'skull') {
    const face = faceAlong(axis, up);
    skull(st, put, part, part, c, face, [5.0, 4.8, 4.5], BONE, eyesOf(st, face), 0, true, 3);
  } else if (s.kind === 'jaw') put(part, part, { k: 'ball', c, ax: [mul(axis, 2.9), mul(side, 3.5), mul(up, 1.35)], skin: BONE });
  else if (s.kind === 'pelvis') put(part, part, { k: 'ball', c, ax: [mul(axis, 2.4), mul(side, 4.4), mul(up, 2.2)], skin: BONE });
  else if (s.kind === 'rib') {
    // (a rib: a curve of bone)
    let last: V3 | null = null;
    for (let k = 0; k <= 4; k++) {
      const a = -0.9 + (1.8 * k) / 4;
      const p = add(c, add(mul(axis, Math.sin(a) * s.long * 0.5), mul(side, (Math.cos(a) - 0.8) * s.long * 0.35)));
      if (last) put(part, part, { k: 'rod', a: last, b: p, ra: s.r, rb: s.r * 0.9, ramp: BONE });
      last = p;
    }
  } else {
    const a = add(c, mul(axis, -s.long / 2));
    const b = add(c, mul(axis, s.long / 2));
    put(part, part, { k: 'rod', a, b, ra: s.r, rb: s.r * 0.85, ramp: BONE });
    put(part, part, { k: 'ball', c: a, ax: sphere(s.r * 1.45), skin: BONE });
    put(part, part, { k: 'ball', c: b, ax: sphere(s.r * 1.3), skin: BONE });
  }
}

/** A set of whole pixels: each laid once (only where nothing is, if `under`), the last colour said for it winning. */
function pen(px: Px, under = false): (x: number, y: number, c: string) => void {
  return (x, y, c) => {
    const X = Math.round(x);
    const Y = Math.round(y);
    if (X < 1 || Y < 1 || X >= px.w - 1 || Y >= px.h - 1) return;
    if (under && px.d[(Y * px.w + X) * 4 + 3] !== 0) return;
    px.set(X, Y, c);
  };
}
/** A round speck `r` across (whole pixels), thinned by `thin`. */
function blob(dot2: (x: number, y: number, c: string) => void, x: number, y: number, r: number, c: string, thin = 0, seed = 0): void {
  for (let j = -Math.ceil(r); j <= Math.ceil(r); j++) {
    for (let i = -Math.ceil(r); i <= Math.ceil(r); i++) {
      if (i * i + j * j > r * r + 0.3) continue;
      if (thin > 0 && hash(Math.round(x) + i, Math.round(y) + j, seed) < thin) continue;
      dot2(x + i, y + j, c);
    }
  }
}

/**
 * THE BURST WHERE IT LANDS, `t` seconds after it lands (the anchor). Before it lands (`t` from -`marked` to 0, on the floor): THE
 * MARK, the reach of the burst marked round where it will land, a ring of the enemy's pink dots coming up as it comes down. As it
 * lands and after:
 *   floor   a band of bone dust going out over the floor to the burst's edge in a fifth of a second, the enemy's pink at its
 *           leading edge (the reach of the bones); the scuff where it struck; and the bones, once down, lying where they fell, each
 *           crumbling to dust in its turn, from 1.0 s, and gone by 1.8 s
 *   air     the flash (white, the enemy's gold and pink, a moment); its bones flung out all round, high and turning over and over,
 *           falling within the burst's edge; chips of bone; a cloud of bone dust over it, settling; pink embers rising out of it
 *           (the golem's fire)
 * The air by halves (`side`): 'behind' before a figure where it lands, 'before' after it.
 */
export function burstPainted(t: number, layer: 'floor' | 'air', radius: number = HURL.r, side: Side = 'all', view: GameView = 'front', marked = HURL.hit - HURL.aim + hurlFly(5)): Painted {
  const fly = marked;
  const C = BURST_CANVAS;
  const lights: Light[] = [];
  if (t < -fly - 1e-6 || t > HURL.long + 1e-6) return { px: new Px(C.w, C.h), lights };
  const st = stage(view, C.ax, C.ay, C);
  const shards = shardsOf(radius);
  /** Whether a point of the figure's space is on the side asked (before: lower on the picture than the anchor). */
  const onSide = (p: V3): boolean => side === 'all' || (st.at([p[0], p[1], 0])[1] > C.ay) === (side === 'before');
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  if (t >= 0) {
    shards.forEach((s, i) => {
      if (t > s.gone) return;
      const at = shardAt(s, t);
      if ((layer === 'floor') !== at.down) return;
      if (layer === 'air' && !onSide(at.c)) return;
      shardBits(st, put, s, i, at);
    });
  }
  paintBits(st, bits, [0, 0, 0]);
  const px = st.whole(null);
  const at = (x: number, y: number): [number, number] => {
    const [X, Y] = floorPx(x, y);
    return [C.ax + X, C.ay + Y];
  };
  const R = radius;
  const fr = Math.floor(t * 30 + 1e-6);
  if (layer === 'floor') {
    const dot2 = pen(px, true);
    if (t < 0) {
      // THE MARK: the reach of the burst, a ring of the enemy's pink dots, more of them as it comes down
      const k = clamp01(1 + t / fly);
      // (dashes round it, filling in as it comes down; and a second, fainter ring inside it)
      const n = Math.round(R * 120);
      for (let i = 0; i < n; i++) {
        const dash = i % 6;
        if (dash >= 2 + Math.round(3 * k)) continue;
        const a = (i / n) * TAU + k * 0.4;
        const [x, y] = at(Math.cos(a) * R, Math.sin(a) * R);
        dot2(x, y, k > 0.6 && dash === 1 ? PINK[3] : PINK[2]);
        dot2(x, y + 1, PINK[0]);
        if (i % 3 === 0 && k > 0.3) {
          const [x2, y2] = at(Math.cos(a) * R * 0.94, Math.sin(a) * R * 0.94);
          dot2(x2, y2, PINK[0]);
        }
      }
      return { px, lights };
    }
    // the bones crumbling to dust, each in its turn
    shards.forEach((s, i) => {
      const u = (t - s.gone) / CRUMBLE;
      if (u < 0 || u > 1) return;
      const c = shardAt(s, s.gone).c;
      const [x, y] = st.at([c[0], c[1], 0]);
      for (let k = 0; k < 6; k++) {
        if (hash(i, k, 917) < u) continue;
        dot2(x + (hash(i, k + 7, 917) - 0.5) * (6 + 6 * u), y - 1 - 3 * u * hash(i, k + 13, 917), k % 2 ? OSSUARY[2] : OSSUARY[1]);
      }
    });
    // the scuff where it struck
    const scuff = 1 - clamp01((t - 0.8) / 0.6);
    if (scuff > 0) for (let j = -5; j <= 5; j++) for (let i = -11; i <= 11; i++) if ((i / 11) ** 2 + (j / 5) ** 2 < 0.6 && hash(i, j, 919) < scuff * 0.7) dot2(C.ax + i, C.ay + j, '#0b0a11');
    // the band of bone dust going out to the burst's edge, the enemy's pink at its leading edge
    const reach = R * (1 - (1 - clamp01(t / HURL.wave)) ** 3);
    const left = 1 - clamp01((t - HURL.wave) / 0.3);
    if (left > 0) {
      const n = Math.round(R * 64);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU;
        if (t <= HURL.wave + 0.08 && k % 2 === 0) {
          const [x, y] = at(Math.cos(a) * reach, Math.sin(a) * reach);
          dot2(x, y, PINK[3]);
        }
        for (let b = 0; b < 3; b++) {
          const r = reach - 0.3 * R * (b / 3) * (0.6 + 0.4 * hash(k, b, 921));
          if (r < 0.2) continue;
          if (hash(k, b + fr * 7, 923) > left * (1 - b * 0.22)) continue;
          const [x, y] = at(Math.cos(a) * r, Math.sin(a) * r);
          dot2(x, y, b === 0 ? BONE[1] : OSSUARY[1]);
        }
      }
    }
    return { px, lights };
  }
  // --- the air ---
  const dot2 = pen(px, false);
  const under2 = pen(px, true);
  if (t < 0) return { px, lights };
  // the flash
  if (t < 0.1 && side !== 'behind') {
    const k = 1 - t / 0.1;
    const L = 12 + 18 * k;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0.5, -1], [-0.5, -1], [0.85, -0.5], [-0.85, -0.5], [0, -1]] as const) {
      for (let s = 0; s < L * (dy < 0 ? 1.15 : 1); s++) dot2(C.ax + dx * s, C.ay - 8 + dy * s * 0.9, s < L * 0.35 ? WHITE : s < L * 0.7 ? FLAME[4] : PINK[3]);
    }
    blob(dot2, C.ax, C.ay - 8, 3 + 3 * k, WHITE);
    lights.push({ x: C.ax, y: C.ay - 10, r: 70 + 40 * k, color: SOCKET, a: 0.35 * k });
  }
  // chips of bone flung out with the bones, falling
  for (let k = 0; k < 26; k++) {
    const life = 0.3 + 0.25 * hash(k, 1, 925);
    if (t > life) continue;
    const a = (k / 26) * TAU + hash(k, 2, 925);
    const out = R * (0.3 + 0.7 * hash(k, 3, 925)) * (t / life);
    const fx = Math.cos(a) * out;
    const fy = Math.sin(a) * out;
    const [x, y] = at(fx, fy);
    if (side !== 'all' && (y > C.ay) !== (side === 'before')) continue;
    const up = (18 + 26 * hash(k, 4, 925)) * 4 * (t / life) * (1 - t / life) + 4 * (1 - t / life);
    dot2(x, y - up, k % 3 ? BONE[2] : BONE[3]);
    if (k % 2 === 0) dot2(x + 1, y - up, BONE[1]);
  }
  // the cloud of bone dust, settling (laid behind the bones)
  const settle = 1 - clamp01((t - 0.1) / 0.9);
  if (settle > 0) {
    for (let k = 0; k < 30; k++) {
      const a = hash(k, 1, 927) * TAU;
      const r = (0.15 + 0.6 * hash(k, 2, 927)) * R * Math.min(1, 0.4 + t / 0.25);
      const [x, y] = at(Math.cos(a) * r, Math.sin(a) * r);
      if (side !== 'all' && (y > C.ay) !== (side === 'before')) continue;
      blob(under2, x, y - 4 - 10 * hash(k, 3, 927) * (1 - settle * 0.4), 1.5 + 2 * hash(k, 4, 927), k % 3 ? OSSUARY[2] : BONE[1], 0.55 + 0.4 * (1 - settle), k);
    }
  }
  // pink embers rising out of it (the golem's fire)
  for (let k = 0; k < 12; k++) {
    const life = 0.4 + 0.35 * hash(k, 1, 929);
    if (t > life || side === 'behind') continue;
    const u = t / life;
    dot2(C.ax + (hash(k, 2, 929) - 0.5) * 30, C.ay - 6 - u * (14 + 18 * hash(k, 3, 929)), u < 0.5 ? FLAME[3] : FLAME[2]);
  }
  return { px, lights };
}
/** How long after it lands anything of the burst is left (seconds). */
export const BURST_LONG = HURL.long;
