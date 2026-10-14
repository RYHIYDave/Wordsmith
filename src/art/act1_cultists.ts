// THE CULT'S TWO NEW KINDS FOR FLOORS 6 TO 10, ON THE HEROES' BONES (the art chat for floors 6 to 10, 13 Oct
// 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the game imports this file; `ACT1_CULT_ON` is off.
//
// The planning chat's mob table (his doc, kept with his yes): THE CHANTER (small), “A bolt of cursed words.
// Nearby cultists take less damage while it lives, so kill it first.”, and THE FIREPOT THROWER (small), “Lobs
// pots that leave burning ground: the siege's bombardier.”, in every area of the five. His brief, asked as
// his art rulebook's questions for a new character (13 Oct, by 18:28):
// - the Chanter, the one thing to know it by: “Hooded, a book of hymns (Recommended)”, offered as: in the
//   cult's violet robe, holding a great open book; pink rings pulse out as it chants, and the cultists it
//   shields glow faintly pink. How it dies: “Its book burns”, offered as: the book bursts into the cult's
//   fire and burns away as it falls.
// - the Firepot thrower: “A rack of pots on its back (Recommended)”, offered as: a stooped cultist with a
//   wooden frame of clay firepots on its back, one lit pot swinging from a sling. How it dies: “Its own pots
//   go off (Recommended)”, offered as: it falls; the pots on its back crack and burst in a whoosh of the
//   cult's fire that burns out on the floor.
//
// Both are of the cult's flock (the game's cultist and art/cultists.ts's dagger cultist: the robe of the
// cult's violet, a deep cowl with a point and two slashes of pink for eyes in its dark, the cult's pink about
// them). What glows on them is the enemy's: their eyes, the pages' cursed script, the fire. Nothing cyan. Each
// wears the enemy's pink edge while it lives. No letters: the script on the Chanter's pages is the cult's
// marks, not writing (his art rulebook keeps letters for where a word is at work).
//
// THIS FIRST STEP: their looks, standing (his rulebook: a sheet of each standing, front and back, beside a
// hero, before anything moves). Their other moves are their stand for now, placeholders, not for use.

import type { ActorArt } from './actor_types';
import { INK, PINK, hash, toSprite } from './kit';
import type { Ramp } from './kit';
import { ENEMY_RIM, FLAME, SOCKET } from './mkit';
import { TILE3, mobSet, paintBits, skeletonAt, sphere } from './new_mobs3';
import type { Bit, Mob, MobCanvas, MobMove, Moment, Put } from './new_mobs3';
import { stage, wornOn } from './skin';
import { feetFor, plantBy } from './act1_feet';
import type { GameView } from './skin';
import type { Sprite } from '../engine/px';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const ACT1_CULT_ON = { on: false };

const D = Math.PI / 180;
const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
/** 0 before `t0`, 1 after `t1`, smoothly between. */
const rampAt = (t: number, t0: number, t1: number): number => {
  const v = clamp01((t - t0) / (t1 - t0));
  return v * v * (3 - 2 * v);
};
/** A curve through keys (seconds, value), smooth through each (as art/fleshmancer.ts's `curve`; its own here, so that nothing of this mock-up draws on his file). */
function curve(keys: ReadonlyArray<readonly [number, number]>, t: number): number {
  const n = keys.length;
  if (t <= keys[0][0]) return keys[0][1];
  if (t >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 0;
  while (t > keys[i + 1][0]) i++;
  const [t0, v0] = keys[i];
  const [t1, v1] = keys[i + 1];
  const slope = (j: number): number => (j <= 0 || j >= n - 1 ? 0 : (keys[j + 1][1] - keys[j - 1][1]) / (keys[j + 1][0] - keys[j - 1][0]));
  const m0 = slope(i) * (t1 - t0);
  const m1 = slope(i + 1) * (t1 - t0);
  const u = (t - t0) / (t1 - t0);
  const u2 = u * u;
  const u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * m1;
}
/** Their skin: pale, bony (the fleshmancer's hands' colours). */
const HAND_BONE: Ramp = ['#4a3a44', '#4a3a44', '#a48e8c', '#d4c2b6', '#d4c2b6'];

// =============================================================================================
// THE FLOCK'S CLOTH AND THEIR COWLS (as the dagger cultist's: art/cultists.ts)

/** The robe: the cultists' violet; the cowl a step darker. */
const ROBE: Ramp = ['#1e0e38', '#1e0e38', '#40206a', '#6e4498', '#6e4498'];
const COWL: Ramp = ['#150a2a', '#150a2a', '#2e144c', '#523078', '#523078'];
/** Dark rags (shins, feet, a sling's cords). */
const RAGS: Ramp = ['#120e1c', '#120e1c', '#262036', '#3e3652', '#3e3652'];
/** The cult's pink: a stole, a cord. */
const STOLE: Ramp = PINK;
/** Their skin: pale, bony. */
const SKIN: Ramp = HAND_BONE;
/** The torn hem of a robe (how far up each piece of it is gone, round it). */
const TORN: readonly number[] = [1, 3, 0, 2, 4, 1, 0, 3, 2, 0, 1, 4, 2, 0, 3, 1];

/** THE FACE IN A COWL, pixel by pixel: the opening black (k), its edge lit a little pink from inside (r), the eyes two slanting slashes of the enemy's pink (h). */
const FACE: ReadonlyArray<string> = [
  '..rrrrr..',
  '.rkkkkkr.',
  'rkhkkkhkr',
  'rkkhkhkkr',
  'rkkkkkkkr',
  '.kkkkkkk.',
  '..kkkkk..',
];
const FACE_MID: readonly [number, number] = [4, 3];
const COWL_R: V3 = [5.6, 5.0, 5.8];

/**
 * A COWL: deep, its point drooping behind and swinging; the opening dark, the eyes two slashes of pink in it
 * (`glare`: how they burn, 0 out); `lag`: what of the figure's going drags the point back; `ph`: its round.
 */
function cowl(st: Stage, s: Skeleton, put: Put, glare: number, lag: V3, ph: number, part = 'cowl'): void {
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
  const hot = glare > 1.4;
  const faceColour = (ch: string): string | null => {
    switch (ch) {
      case 'r':
        return glare < 0.05 ? INK : hot ? FLAME[1] : '#4a0c38';
      case 'k':
        return INK;
      case 'h':
        return glare < 0.05 ? INK : hot ? FLAME[4] : glare > 0.5 ? SOCKET : FLAME[1];
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
    return COWL[tone];
  };
  put(part, part, { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: cowlSkin });
  put(part, part, { k: 'ball', c: add(add(hc, mul(ff, -2.6)), mul(fu, -3.2)), ax: [mul(ff, 3.8), mul(fl, 4.6), mul(fu, 3.6)], skin: COWL });
  // (its point: from the top of the back of the cowl, drooping back and down, tapering, swinging)
  let at = add(hc, add(mul(fu, hr[2] * 0.72), mul(ff, -hr[0] * 0.4)));
  const R0 = [2.5, 1.9, 1.3, 0.7, 0.3];
  for (let i = 0; i < 4; i++) {
    const k = (i + 1) / 4;
    const sway = Math.sin(ph * 2 + i * 0.9) * 0.4 * k;
    const next = add(at, add(add(mul(ff, -2.1), mul(fu, 1.1 - 2.0 * k)), add(mul(fl, sway), mul(lag, 0.35 * k))));
    put(part, part, { k: 'rod', a: at, b: next, ra: R0[i], rb: R0[i + 1], ramp: COWL });
    at = next;
  }
  if (glare > 0.05 && dot(od, st.eye) > 0.05) put('glow', 'glow', { k: 'glow', p: add(hc, mul(od, hr[0] * 0.9)), c: SOCKET, r: 3 + 2 * clamp01(glare - 1), a: Math.min(0.6, 0.28 * glare) });
}

/** How the figure's going drags what hangs off it (its last moment's going, held to `most`). */
function lagOf(m: Moment, k: number, most: number): V3 {
  const raw = mul(m.come, -k);
  const l = len(raw);
  return l > most ? mul(raw, most / l) : raw;
}

/** A SLEEVE to the elbow and on, wide at its mouth, hanging under the forearm; the bare forearm and hand out of it. Returns the hand's frame (along the forearm, up off it, across). */
function sleeve(s: Skeleton, put: Put, side: 'L' | 'R', cu: V3, lag: V3, wide = 2.9): [V3, V3, V3] {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  put(`sleeve${side}`, `sleeve${side}`, { k: 'rod', a: sh, b: el, ra: 2.5, rb: 2.7, ramp: ROBE, far: true });
  const e1 = norm(sub([0, 0, 1], mul(fore, dot([0, 0, 1], fore))), cu);
  const e2 = norm(cross(fore, e1));
  const mouth = add(el, mul(fore, 3.2));
  const mouthPts: V3[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const under = Math.max(0, -Math.cos(a));
    mouthPts.push(add(add(mouth, add(mul(e1, Math.cos(a) * wide), mul(e2, Math.sin(a) * wide))), add([0, 0, -under * 2.2], mul(lag, under * 0.5))));
  }
  put(`sleeve${side}`, `sleeve${side}`, { k: 'cloth', rings: [{ c: el, u: mul(e1, 2.6), v: mul(e2, 2.6) }, { c: mouth, u: mul(e1, wide), v: mul(e2, wide), pts: mouthPts }], ramp: ROBE, look: { folds: [90, -90], lift: 0.1 } });
  const wrist = add(hand, mul(fore, -0.9));
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: add(mouth, mul(fore, -0.8)), b: wrist, ra: 0.95, rb: 0.75, ramp: SKIN, far: true });
  return [fore, e1, e2];
}

// =============================================================================================
// THE CHANTER

/** Its body: one of the flock, slight, a little shorter than the knight (58). */
export const CHANTER_BODY: Build = buildOf(54, 1.0, { shoulders: 0.98, chest: 0.94, depth: 0.95, waist: 0.88, hips: 1.0, arms: 1.0, trunk: 1.0, limbs: 0.9 });
const CB = CHANTER_BODY;
export const CHANTER_CANVAS: MobCanvas = { w: 200, h: 180, ax: 100, ay: 136 };

/** THE BOOK OF HYMNS: its pages, old and yellowed; its cover, dark leather, iron at its corners. */
const PAGE: Ramp = ['#6e5a48', '#6e5a48', '#bfa98a', '#e4d4b4', '#e4d4b4'];
const LEATHER: Ramp = ['#1a0c14', '#1a0c14', '#3e1c2c', '#5e2c40', '#5e2c40'];
/** What fire leaves: char and ash. */
const CHAR: Ramp = ['#140e14', '#140e14', '#2c2228', '#4a3e44', '#4a3e44'];
/** The book's size: each page's half across it and half along its spine (figure's lengths). */
export const BOOK = { across: 4.2, along: 5.4, thick: 0.9 } as const;

/** Its rest: upright, its head bowed over the book it holds open before it in both hands, low, its pages to the sky. */
export const CHANTER_REST: Bones = {
  ...standing(CB),
  pz: -0.6, pitch: 5, bend: 6, faceUp: -16, faceTurn: 0,
  lfx: 1.2, lfy: 3.2, lft: 10, rfx: -1.0, rfy: -3.2, rft: -10, lk: 6, rk: -6,
  lhIn: 0, lhx: 9.5, lhy: -1.2, lhz: -12.5, le: -40,
  rhIn: 0, rhx: 9.5, rhy: 1.2, rhz: -12.5, re: 40,
};

/** Its stand: 2.4 s round, chanting: it sways, the book rising and falling with its voice, the script on its pages pulsing, rings of the cult's power going out from it over the floor. */
export const CHANTER_STAND_LONG = 2.4;
function chanterStand(): Motion {
  const R = CHANTER_REST;
  const keys: Key3[] = [];
  const N = 24;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * CHANTER_STAND_LONG;
    const a = (t / CHANTER_STAND_LONG) * Math.PI * 2;
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.9 * Math.sin(2 * a),
        py: 0.9 * Math.sin(a),
        roll: 2.4 * Math.sin(a),
        bend: R.bend + 1.5 * Math.sin(2 * a + 0.6),
        faceUp: R.faceUp + 3 * Math.sin(2 * a + 1.2),
        faceTilt: 4 * Math.sin(a + 0.5),
        lhz: R.lhz + 1.2 * Math.sin(2 * a + 0.4),
        rhz: R.rhz + 1.2 * Math.sin(2 * a + 0.4),
        draw: 0.5 + 0.5 * Math.sin(2 * a),
      },
    });
  }
  return { loop: 0, keys };
}

/** Where its book lies (its middle, its spine's way, its pages' up), from its hands. */
export function bookOf(s: Skeleton, tilt = 0): { c: V3; along: V3; across: V3; up: V3 } {
  const mid = lerp3(s.handL, s.handR, 0.5);
  const across = norm(sub(s.handL, s.handR), [0, 1, 0]);
  const fwd = norm([s.chest[0][0], s.chest[0][1], 0], [1, 0, 0]);
  const flatAlong = norm(sub(fwd, mul(across, dot(fwd, across))), fwd);
  const flatUp = norm(cross(flatAlong, across), [0, 0, 1]);
  // (`tilt`: its pages turned from the sky toward what is before it, as it thrusts them out: 0 to 1, a quarter turn)
  const a = clamp01(tilt) * 80 * D;
  const up = norm(add(mul(flatUp, Math.cos(a)), mul(flatAlong, Math.sin(a))));
  const along = norm(add(mul(flatAlong, Math.cos(a)), mul(flatUp, -Math.sin(a))));
  return { c: add(add(mid, mul(along, 1.2)), mul(up, 0.6)), along, across, up };
}

/** THE CHANTER AS SOLIDS: its robe to the floor, its stole, its sleeves and its hands on the book, the book of hymns open with the cult's script burning on its pages, the cowl, the rings of its chant. */
function chanterBits(st: Stage, m: Moment): Bit[] {
  const { s, q } = m;
  const B = CB;
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
  const chant = clamp01(q.draw);

  // --- its feet, bare and bony, under the hem ---
  for (const side of ['L', 'R'] as const) {
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    put(`foot${side}`, `foot${side}`, { k: 'rod', a: add(heel, [0, 0, 0.9]), b: add(toe, [0, 0, 0.6]), ra: 1.1, rb: 0.75, ramp: SKIN, far: true });
  }
  // --- ITS ROBE, to the floor: from the neck over the chest, a little wider at the hem, dragging behind as it goes ---
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const be = s.belly;
  const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
  const footMid = lerp3(lerp3(s.heelL, s.toeL, 0.5), lerp3(s.heelR, s.toeR, 0.5), 0.5);
  const spanF = Math.abs(dot(sub(s.ankleL, s.ankleR), f));
  const spanL = Math.abs(dot(sub(s.ankleL, s.ankleR), l));
  const hemC: V3 = [footMid[0] + lag[0] * 1.2, footMid[1] + lag[1] * 1.2, 1.4];
  const hemDeep = Math.max(B.pelvisDeep + 3.6, spanF / 2 + 3.0);
  const hemWide = Math.max(B.pelvisHalf + 4.2, spanL / 2 + 2.8);
  const hemPts: V3[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const rear = Math.max(0, -Math.cos(a));
    const p = add(hemC, add(mul(f, Math.cos(a) * hemDeep), mul(l, Math.sin(a) * hemWide)));
    hemPts.push(add(p, add([0, 0, Math.sin(ph * 2 + a * 3) * 0.4 + rear * 0.3], mul(lag, rear * 0.6))));
  }
  const rings: Ring[] = [
    { c: add(s.neck, mul(cu, 0.8)), u: mul(cf, 3.6), v: mul(cl, 4.4) },
    { c: lerp3(s.ribs, s.neck, 0.7), u: mul(cf, B.ribDeep + 2.2), v: mul(cl, B.shoulderHalf + 1.0) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 2.0), v: mul(cl, B.ribHalf + 2.2) },
    { c: waistC, u: mul(be[0], B.waistDeep + 1.8), v: mul(be[1], B.waistHalf + 1.8) },
    { c: [s.pelvis[0], s.pelvis[1], s.pelvis[2] - 1.2], u: mul(f, B.pelvisDeep + 2.6), v: mul(l, B.pelvisHalf + 2.8) },
    { c: [kneeMid[0] * 0.6 + hemC[0] * 0.4, kneeMid[1] * 0.6 + hemC[1] * 0.4, kneeMid[2]], u: mul(f, (B.pelvisDeep + 2.6 + hemDeep) / 2), v: mul(l, (B.pelvisHalf + 2.8 + hemWide) / 2) },
    { c: hemC, u: mul(f, hemDeep), v: mul(l, hemWide), pts: hemPts },
  ];
  put('robe', 'robe', { k: 'cloth', rings, ramp: ROBE, look: { folds: [25, -25, 70, -70, 120, -120, 165, -165], lift: 0.06 }, torn: TORN });
  // --- the cult's pink STOLE: over its neck and down its front to its knees, two long bands, swinging ---
  for (const sd of [1, -1]) {
    const top = add(add(s.neck, mul(cl, sd * 2.6)), mul(cf, 2.0));
    const chest = add(add(s.ribs, mul(cl, sd * 2.4)), mul(cf, B.ribDeep + 2.3));
    const belly = add(add(waistC, mul(be[1], sd * 2.2)), mul(be[0], B.waistDeep + 2.0));
    const end = add(add(add(lerp3(s.pelvis, kneeMid, 0.85), mul(l, sd * 2.0)), mul(f, B.pelvisDeep + 2.8)), add([0, 0, 0], mul(lag, 0.8)));
    put('stole', 'stole', { k: 'rod', a: top, b: chest, ra: 0.9, rb: 0.95, ramp: STOLE });
    put('stole', 'stole', { k: 'rod', a: chest, b: belly, ra: 0.95, rb: 1.0, ramp: STOLE });
    put('stole', 'stole', { k: 'rod', a: belly, b: end, ra: 1.0, rb: 1.05, ramp: STOLE });
  }
  // --- its sleeves; its hands holding the book by its outer edges ---
  for (const side of ['L', 'R'] as const) {
    const [fore, e1, e2] = sleeve(s, put, side, cu, lag);
    const hand = side === 'L' ? s.handL : s.handR;
    put(`hand${side}`, `hand${side}`, { k: 'ball', c: hand, ax: [mul(fore, 1.3), mul(e1, 1.1), mul(e2, 0.8)], skin: SKIN, far: true });
  }
  // --- THE BOOK OF HYMNS, open: two pages in a shallow V, the cult's script burning on them in rows; its cover beneath ---
  const bk = bookOf(s, q.pt);
  const glow = lit * (0.45 + 0.55 * chant) * (1 + clamp01(m.glint));
  // (as it dies: the book catches the cult's fire and burns away; `burn` 0 whole to 1 gone)
  const burn = m.dying ? clamp01((m.t - CH_DIES.burst) / (CH_DIES.ash - CH_DIES.burst)) : 0;
  const size = 1 - 0.92 * rampAt(burn, 0.35, 1);
  if (burn < 0.98) for (const sd of [1, -1]) {
    const tiltUp: V3 = norm(add(bk.up, mul(bk.across, -sd * 0.22)));
    const out = norm(sub(mul(bk.across, sd), mul(tiltUp, dot(mul(bk.across, sd), tiltUp))), mul(bk.across, sd));
    const c = add(add(bk.c, mul(out, BOOK.across * size)), mul(tiltUp, 0.2));
    // (the cover under the page, a little bigger, its edge showing)
    const W = BOOK.across * size;
    const L = BOOK.along * size;
    put('book', `cover${sd}`, { k: 'panel', c: add(c, mul(tiltUp, -BOOK.thick)), u: mul(out, W + 0.5), v: mul(bk.along, L + 0.5), skin: (_a, _b, front, tone) => (front ? null : LEATHER[tone]) });
    put('book', `block${sd}`, { k: 'rod', a: add(add(c, mul(out, W + 0.1)), add(mul(bk.along, -L), mul(tiltUp, -BOOK.thick * 0.5))), b: add(add(c, mul(out, W + 0.1)), add(mul(bk.along, L), mul(tiltUp, -BOOK.thick * 0.5))), ra: BOOK.thick * 0.6, rb: BOOK.thick * 0.6, ramp: burn > 0.2 ? CHAR : LEATHER });
    put('book', `page${sd}`, {
      k: 'panel',
      c,
      u: mul(out, W),
      v: mul(bk.along, L),
      skin: (a0, b0, front, tone) => {
        if (!front) return LEATHER[tone];
        const a = a0 / size;
        const b = b0 / size;
        // (burning: charred in from its edges, glowing at the char's edge)
        if (burn > 0) {
          const edge = Math.min(BOOK.across - Math.abs(a), BOOK.along - Math.abs(b)) / BOOK.across + 0.25 * hash(Math.floor(a * 2), Math.floor(b * 2), 94);
          if (edge < burn * 1.1) return CHAR[Math.min(2, tone)];
          if (edge < burn * 1.1 + 0.18) return FLAME[hash(Math.floor(a * 3), Math.floor(b * 3) + Math.floor(m.t * 12), 95) > 0.5 ? 3 : 2];
        }
        // (rows of the cult's script: marks of uneven length, not letters; burning brighter as it chants)
        const row = Math.floor((b + BOOK.along) / 1.15);
        const inRow = fr((b + BOOK.along) / 1.15) < 0.42 && Math.abs(a) < BOOK.across - 0.7 && Math.abs(b) < BOOK.along - 0.6;
        if (inRow) {
          const cell = Math.floor((a + BOOK.across) / 0.9);
          const mark = hash(cell, row * 7 + sd, 91);
          if (mark > 0.32) return glow > 1.2 ? FLAME[3] : glow > 0.7 ? FLAME[2] : glow > 0.15 ? FLAME[1] : '#5a4040';
        }
        return PAGE[Math.min(4, tone + (Math.abs(a) > BOOK.across - 0.4 ? -1 : 0))];
      },
    });
  }
  if (glow > 0.15 && burn === 0) put('glow', 'glow', { k: 'glow', p: add(bk.c, mul(bk.up, 2)), c: FLAME[2], r: 10 + 8 * chant, a: 0.22 * glow });
  // THE BOOK BURNING: tongues of the cult's fire up off it, its light, sparks and ash rising
  if (burn > 0 && burn < 1) {
    const fierce = Math.sin(Math.PI * Math.min(1, burn * 1.15));
    for (let i = 0; i < 7; i++) {
      const k = fr(m.t * 3.2 + i / 7);
      const a = hash(i, 1, 96) * Math.PI * 2;
      const r0 = (1 - k) * 3.2 * size + 0.5;
      const p0 = add(bk.c, add(add(mul(bk.across, Math.cos(a) * r0), mul(bk.along, Math.sin(a) * r0)), [0, 0, 1 + k * (7 + 5 * fierce)]));
      put('fire', 'fire', { k: 'ball', c: p0, ax: sphere((1.6 - 1.2 * k) * (0.6 + 0.6 * fierce)), skin: () => (k < 0.3 ? FLAME[4] : k < 0.6 ? FLAME[3] : FLAME[2]) });
    }
    put('glow', 'glow', { k: 'glow', p: add(bk.c, [0, 0, 4]), c: FLAME[2], r: 14 + 12 * fierce, a: 0.5 * fierce });
    for (let i = 0; i < 4; i++) {
      const k = fr(m.t * 1.6 + i / 4);
      put('ash', 'ash', { k: 'mote', p: add(bk.c, [(hash(i, Math.floor(m.t * 1.6 + i / 4), 97) - 0.5) * 6, (hash(i, 2, 97) - 0.5) * 6, 3 + 14 * k]), c: k < 0.4 ? FLAME[3] : '#5a4a50', size: 1 });
    }
  }
  // (what is left of it: a little heap of ash and a scorch)
  if (burn >= 0.98) {
    put('ash', 'ashHeap', { k: 'ball', c: [bk.c[0], bk.c[1], 0.6], ax: [[3.2, 0, 0], [0, 2.8, 0], [0, 0, 0.7]], skin: CHAR });
  }
  // --- ITS CHANT: rings of the cult's power going out from it over the floor, one after another ---
  if (lit > 0.1 && !m.dying) {
    for (const off of [0, 0.5]) {
      const k = fr(m.wind * 2 + off);
      const r = 11 + 22 * k;
      const n = Math.round(14 + 22 * k);
      for (let i = 0; i < n; i++) {
        if (hash(i, Math.floor(m.wind * 24), 92) < k * 0.75) continue;
        const a = (i / n) * Math.PI * 2;
        // (the far side of a small ring would be drawn over its robe: left out until the ring has spread past it)
        if (r < 19 && dot([Math.cos(a), Math.sin(a), 0], [st.eye[0], st.eye[1], 0]) < 0.1) continue;
        put('ring', 'ring', { k: 'mote', p: [s.pelvis[0] + Math.cos(a) * r, s.pelvis[1] + Math.sin(a) * r * 0.9, 0.3], c: k < 0.4 ? FLAME[2] : FLAME[1], size: 2 });
      }
    }
  }
  streaks(st, m, put, PAGE[3], PAGE[2]);
  // --- its cowl ---
  cowl(st, s, put, glare, lag, ph);
  return bits;
}

/** A thing's way through the air as it is flung, streaked (the move's `trail`, on its blurred frames). */
function streaks(st: Stage, m: Moment, put: Put, head: string, tail: string): void {
  if (!m.blur || !m.trails) return;
  for (const tr0 of m.trails) {
    for (let i = 1; i < tr0.length; i++) {
      const a = tr0[i - 1];
      const b = tr0[i];
      const n = Math.max(1, Math.ceil(Math.hypot(st.at(b)[0] - st.at(a)[0], st.at(b)[1] - st.at(a)[1])));
      for (let j = 0; j < n; j++) put('streak', 'streak', { k: 'mote', p: lerp3(a, b, j / n), c: i < tr0.length / 2 ? head : tail, size: 1 });
    }
  }
}

// --- THE CHANTER'S MOVES ---

/** Its walk: a slow procession, eight frames at eight a second, painted for one tile a second; its feet under its hem, each down where it came down until it lifts. */
export const CH_PACE = 1.0;
const CH_WALK = { frames: 8, fps: 8 } as const;
/** A foot of a walk of `n` frames, `k` frames into its round (0 to n): down from the first frame to the middle one, carried back under the figure as it goes on; then lifted and swung through. Forward, lift, how its sole is tipped. */
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 14 * Math.sin(Math.PI * u) * (1 - u) - 6 * Math.sin(Math.PI * u) * u];
}
function chanterWalk(): Motion {
  const R = CHANTER_REST;
  const n = CH_WALK.frames;
  const d = (CH_PACE * TILE3) / CH_WALK.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [rx, rz, rp] = stepFoot(j, n, d, 3.2);
    const [lx, lz, lp] = stepFoot((j + n / 2) % n, n, d, 3.2);
    keys.push({
      at: i / CH_WALK.fps,
      ease: 'lin',
      pose: {
        pz: R.pz - 0.7 * Math.abs(Math.cos(a)), py: 0.9 * Math.sin(a), roll: 2 * Math.sin(a), yaw: 3 * Math.cos(a),
        bend: R.bend, pitch: R.pitch + 1, faceUp: R.faceUp, faceTilt: 3 * Math.sin(a),
        rfx: rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft,
        lfx: lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft,
        lhz: R.lhz + 0.8 * Math.cos(2 * a), rhz: R.rhz + 0.8 * Math.cos(2 * a),
        draw: 0.5 + 0.5 * Math.sin(2 * a),
      },
    });
  }
  return { keys, loop: 0 };
}

/** ITS BOLT OF CURSED WORDS: how long, when it is let go (on a frame of the game's thirty a second), when it warns. */
export const CH_BOLT = { long: 1.2, hit: 19 / 30, warn: 0.25 } as const;
/**
 * It heaves the book up high before it in both hands, its head thrown back, the script on its pages blazing
 * (THE WARNING, held trembling); then thrusts the book out at you, its pages turned to you, and the bolt of
 * cursed words leaves them (at `CH_BOLT.hit`; from `chanterBookAt`); it rocks back, and lowers the book.
 */
function chanterBolt(): Motion {
  const R = CHANTER_REST;
  const H = CH_BOLT.hit;
  const hand = (x: number, z: number): Partial<Bones> => ({ lhx: x, rhx: x, lhz: z, rhz: z });
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: 0.3, pose: { pz: R.pz + 0.8, pitch: -4, bend: -6, faceUp: 4, ...hand(11, 7), le: -50, re: 50, pt: 0.2, draw: 1 }, ease: 'io' },
      { at: 0.38, pose: { pz: R.pz + 1.1, pitch: -5, bend: -7, faceUp: 6, ...hand(11, 8.4), le: -52, re: 52, pt: 0.22, draw: 1 }, ease: 'io' },
      { at: 0.45, pose: { pz: R.pz + 0.9, pitch: -5, bend: -7, faceUp: 6, ...hand(10.6, 8), le: -52, re: 52, pt: 0.25, draw: 1 }, ease: 'io' },
      { at: 0.53, pose: { pz: R.pz + 0.8, pitch: -4, bend: -6, faceUp: 5, ...hand(10, 7.4), le: -50, re: 50, pt: 0.3, draw: 1 }, ease: 'io' },
      { at: H, pose: { px: 2.5, pz: R.pz - 0.6, pitch: 12, bend: 12, faceUp: -2, ...hand(15, -1), le: -20, re: 20, pt: 1, draw: 1 }, ease: 'in' },
      { at: H + 0.1, pose: { px: 3.2, pz: R.pz - 0.9, pitch: 15, bend: 14, faceUp: -4, ...hand(16, -4), le: -18, re: 18, pt: 1, draw: 0.9 }, ease: 'out' },
      { at: H + 0.26, pose: { px: 1.8, pz: R.pz - 0.5, pitch: 10, bend: 10, faceUp: -1, ...hand(14, -5), le: -22, re: 22, pt: 0.8, draw: 0.8 }, ease: 'io' },
      { at: CH_BOLT.long, pose: { draw: 0.5 }, ease: 'io' },
    ],
  };
}
/** The script blazing as it raises the book (the warning): up as it rises, brightest as it thrusts, gone after. */
function chanterGlint(t: number): number {
  const H = CH_BOLT.hit;
  if (t < 0.12 || t > H + 0.15) return 0;
  return t < 0.36 ? (t - 0.12) / 0.24 : t <= H ? 1 : 1 - (t - H) / 0.15;
}
/** Where the bolt leaves it: the middle of its book's pages, `t` seconds into its blow (its figure's lengths, on its floor). */
export function chanterBookAt(t: number = CH_BOLT.hit): V3 {
  const s = skeletonAt(CHANTER, 'attack', t);
  return bookOf(s, 1).c;
}
/** ITS FEET AS IT FALLS: where it stood; tipped up onto its toes as it drops to its knees, its soles to the sky as it goes down on its face, its toes never leaving their spot. */
function fallingFeet(B: Build, rest: Bones, knees: number, down: number): (t: number) => Partial<Bones> {
  const { plantOf, footwork } = feetFor(B);
  const track = (side: 'L' | 'R') => {
    const p0 = plantOf(side, {}, rest);
    return { start: p0, moves: [{ t0: 0.12, t1: knees, to: plantBy(p0, 0, 0, 0, { pitch: 58 }) }, { t0: knees + 0.08, t1: down, to: plantBy(p0, 0, 0, 0, { pitch: 84 }) }] };
  };
  return footwork({ L: track('L'), R: track('R') });
}

/** STRUCK: jolted back, the book clutched to it, its cowl knocked back. */
function chanterReel(): Motion {
  const R = CHANTER_REST;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -3, pz: R.pz + 0.8, pitch: -8, bend: -8, faceUp: R.faceUp + 24, lhx: 6, rhx: 6, lhz: -8, rhz: -8, out: 0.1 }, ease: 'out' },
      { at: 0.16, pose: { px: -1.5, pitch: 0, bend: 0, faceUp: R.faceUp + 8 }, ease: 'io' },
      { at: 0.3, pose: {}, ease: 'io' },
    ],
  };
}
/** ITS DEATH, "Its book burns": when the book catches, when it is on its knees, on its face, when the book is ash. */
export const CH_DIES = { long: 1.6, burst: 0.14, knees: 0.5, down: 0.9, ash: 1.35 } as const;
function chanterDying(): Motion {
  const R = CHANTER_REST;
  const kneel: Partial<Bones> = {
    px: 7.5, pz: -13.0, pitch: 12, bend: 20, faceUp: -10, lk: 0, rk: 0,
    lhIn: 2, rhIn: 2, lhx: 19, rhx: 19, lhy: 4.6, rhy: -4.6, lhz: 16, rhz: 16, le: -30, re: 30,
  };
  const down: Partial<Bones> = {
    px: 21, pz: -22.6, pitch: 82, bend: 6, faceUp: -10, faceTurn: 60, faceTilt: 20, lk: 0, rk: 0,
    lhIn: 2, rhIn: 2, lhx: 36, rhx: 36, lhy: 5.5, rhy: -5.5, lhz: 1.6, rhz: 1.6, le: -30, re: 30,
  };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.5, pitch: -8, bend: -9, faceUp: R.faceUp + 20, lhz: R.lhz + 3, rhz: R.rhz + 3, out: 0.1 }, ease: 'out' },
      { at: CH_DIES.burst + 0.1, pose: { px: -2, pitch: -4, bend: -4, faceUp: R.faceUp + 12, lhx: 12, rhx: 12, lhz: -10, rhz: -10, out: 0.3 }, ease: 'io' },
      { at: CH_DIES.knees, pose: { ...kneel, out: 0.6 }, ease: 'in' },
      { at: CH_DIES.knees + 0.08, pose: { ...kneel, pz: -14.2, out: 0.7 }, ease: 'out' },
      { at: CH_DIES.down, pose: { ...down, out: 0.95 }, ease: 'in' },
      { at: CH_DIES.down + 0.08, pose: { ...down, pz: -22.4, out: 1 }, ease: 'out' },
      { at: CH_DIES.down + 0.18, pose: { ...down, out: 1 }, ease: 'io' },
      { at: CH_DIES.long, pose: { ...down, out: 1 }, ease: 'io' },
    ],
  };
}

export const CHANTER: Mob = {
  id: 'chanter',
  name: 'The Chanter',
  size: 'small: a little shorter than the knight',
  build: CB,
  stand: { name: 'The chanter chants over its book', motion: chanterStand(), rest: CHANTER_REST },
  attack: { name: 'The chanter hurls a bolt of cursed words', motion: chanterBolt(), rest: CHANTER_REST, glint: chanterGlint, trail: (s, q) => [bookOf(s, q.pt).c], trailOver: (t) => t > CH_BOLT.hit - 0.1 && t <= CH_BOLT.hit + 0.02, trailSpan: 2.5 },
  idleFrames: 24,
  idleFps: 10,
  walk: { name: 'The chanter walks in procession', motion: chanterWalk(), rest: CHANTER_REST, period: CH_WALK.frames / CH_WALK.fps, ground: CH_PACE * TILE3 },
  walkFrames: CH_WALK.frames,
  walkFps: CH_WALK.fps,
  pace: CH_PACE,
  reel: { name: 'The chanter is struck', motion: chanterReel(), rest: CHANTER_REST },
  reelTime: 0.3,
  hit: CH_BOLT.hit,
  warn: CH_BOLT.warn,
  dieTime: CH_DIES.long,
  dying: { name: 'The chanter falls, its book burning', motion: chanterDying(), rest: CHANTER_REST, feet: fallingFeet(CB, CHANTER_REST, CH_DIES.knees, CH_DIES.down) },
  aura: { x: CHANTER_CANVAS.ax, y: CHANTER_CANVAS.ay - 26, r: 40, color: '#ff3a78', a: 0.12 },
  shadow: 11,
  canvas: CHANTER_CANVAS,
  trueBack: true,
  bits: (st, m) => chanterBits(st, m),
};

/**
 * THE BOLT OF CURSED WORDS in flight (`frame` 0 to 3, a quarter turn each): a knot of the cult's script, its
 * marks whirling round a burning heart, sparks of it shed. Its middle on the anchor; the game flies it from
 * `chanterBookAt()`. No edge (it is light); its own light.
 */
export const BOLT_FRAMES = 4;
export function curseBolt(frame: number): Sprite {
  const st = stage('front', 24, 24, { w: 48, h: 48 });
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const turn = (frame / BOLT_FRAMES) * Math.PI * 0.5;
  put('heart', 'heart', { k: 'ball', c: [0, 0, 0], ax: sphere(2.2), skin: (_u, tone) => (tone >= 3 ? FLAME[4] : FLAME[3]) });
  for (let i = 0; i < 6; i++) {
    const a = turn + (i / 6) * Math.PI * 2;
    const r = 4.2 + (i % 2) * 1.2;
    const c: V3 = [Math.cos(a) * r, Math.sin(a) * r * 0.8, Math.sin(a * 2 + i) * 1.6];
    const tan: V3 = norm([-Math.sin(a), Math.cos(a), 0.3 * (i % 3 - 1)]);
    // (a mark of the cult's script: a short stroke and a tick, never a letter)
    put('marks', `mark${i}`, { k: 'rod', a: add(c, mul(tan, -1.3)), b: add(c, mul(tan, 1.3)), ra: 0.55, rb: 0.45, ramp: [FLAME[1], FLAME[1], FLAME[2], FLAME[3], FLAME[3]] });
    put('marks', `mark${i}`, { k: 'rod', a: add(c, mul(tan, 0.6)), b: add(add(c, mul(tan, 0.9)), [0, 0, 1.3]), ra: 0.4, rb: 0.35, ramp: [FLAME[1], FLAME[1], FLAME[2], FLAME[3], FLAME[3]] });
  }
  put('glow', 'glow', { k: 'glow', p: [0, 0, 0], c: FLAME[2], r: 12, a: 0.45 });
  const lights = paintBits(st, bits, [0, 0, 0]);
  return toSprite({ px: st.whole(null), lights }, null, 24, 24);
}
/**
 * ITS WARD on one of the cult it shields (his pick's "the cultists it shields glow faintly pink"): a faint ring
 * of the cult's pink at that one's feet, its marks turning (`frame` 0 to 3, at 8 a second). A floor piece, its
 * middle at that one's feet: 64 x 40 at (32, 20). No light.
 */
export function chantWard(frame: number): Sprite {
  const st = stage('front', 32, 20, { w: 64, h: 40 });
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const n = 16;
  for (let i = 0; i < n; i++) {
    if ((i + frame) % 4 === 0) continue;
    const a = (i / n) * Math.PI * 2 + frame * 0.1;
    put('ward', 'ward', { k: 'mote', p: [Math.cos(a) * 11, Math.sin(a) * 11, 0.2], c: i % 2 ? FLAME[1] : FLAME[2], size: 2 });
  }
  paintBits(st, bits, [0, 0, 0]);
  return toSprite({ px: st.whole(null), lights: [] }, null, 32, 20);
}

// =============================================================================================
// THE FIREPOT THROWER

/** Its body: one of the flock, broader in the back from what it carries, stooped under it; a little shorter than the knight. */
export const POTS_BODY: Build = buildOf(54, 1.0, { shoulders: 1.1, chest: 1.04, depth: 1.05, waist: 0.96, hips: 1.0, arms: 1.06, trunk: 1.0, limbs: 0.98 });
const PB = POTS_BODY;
export const POTS_CANVAS: MobCanvas = { w: 220, h: 200, ax: 108, ay: 150 };

/** The clay of its firepots, fired red-brown; the wood of its rack; the rags its rack is lashed with. */
const CLAY: Ramp = ['#3a1e20', '#3a1e20', '#7e4a3a', '#b0745a', '#b0745a'];
const WOOD: Ramp = ['#24181a', '#24181a', '#5a4032', '#86664c', '#86664c'];
/** A firepot's half-size (its belly) and its neck; the sling's cords' length. */
export const POT_R = 3.1;
const SLING_LONG = 9;

/** Its rest: stooped under its rack, its knees bent; the sling's cords in its right fist at its side, the lit pot hanging below, swinging; its left hand out before it. */
export const POTS_REST: Bones = {
  ...standing(PB),
  pz: -2.4, pitch: 14, bend: 14, faceUp: 18, faceTurn: -4,
  lfx: -1.6, lfy: 3.8, lft: 14, lk: 12, rfx: 2.2, rfy: -3.8, rft: -14, rk: -12,
  rhIn: 0, rhx: 7.0, rhy: -5.0, rhz: -8.0, re: 50,
  lhIn: 0, lhx: 8.0, lhy: 3.0, lhz: -14.0, le: -14,
};

/** Its stand: 2.0 s round: hunched and shifting under its load, the pots on its back clinking, the lit pot swinging from the sling, its fuse spitting. */
export const POTS_STAND_LONG = 2.0;
function potsStand(): Motion {
  const R = POTS_REST;
  const keys: Key3[] = [];
  const N = 20;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * POTS_STAND_LONG;
    const a = (t / POTS_STAND_LONG) * Math.PI * 2;
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.9 * Math.sin(2 * a),
        py: 1.0 * Math.sin(a),
        roll: 2.6 * Math.sin(a),
        bend: R.bend + 1.6 * Math.sin(2 * a + 0.5),
        twist: 3 * Math.sin(a + 1.0),
        faceTurn: R.faceTurn + curve([[0, 0], [0.5, 0], [0.6, 12], [1.1, 12], [1.2, -6], [1.7, -6], [1.8, 0], [2.0, 0]], t),
        rhx: R.rhx + 1.2 * Math.sin(a),
        lhx: R.lhx + 1.0 * Math.sin(a + 2),
        lhz: R.lhz + 1.0 * Math.sin(2 * a + 1),
      },
    });
  }
  return { loop: 0, keys };
}

/** Where the lit pot hangs in the sling, `m` its moment: below its right fist on the sling's cords, swinging as it shifts. */
export function slungPot(s: Skeleton, m: Moment): V3 {
  if (m.charge > 0) {
    // (whirled round over its head: `charge` is how many times round, and a little)
    const a = (m.charge - 0.001) * Math.PI * 2;
    return add(s.handR, [Math.cos(a) * SLING_LONG * 0.95, Math.sin(a) * SLING_LONG * 0.95, -1.5 + Math.sin(a) * 1.2]);
  }
  const swing = Math.sin(m.wind * Math.PI * 4) * 2.2;
  const lag = lagOf(m, 2.2, 4);
  return add(s.handR, [lag[0] + swing * 0.4, lag[1] + swing, -SLING_LONG]);
}

/** A FIREPOT: a round clay belly, a short neck, a rag stopper and its fuse (`lit`: burning, 0 cold). */
function firepot(put: Put, part: string, c: V3, up: V3, lit: number, t: number, seed: number): void {
  const flat = norm(cross(up, [0, 0, 1]), [1, 0, 0]);
  const side = norm(cross(up, flat));
  put(part, part, { k: 'ball', c, ax: [mul(flat, POT_R), mul(side, POT_R), mul(up, POT_R * 0.92)], skin: (u, tone) => (hash(Math.floor((u[0] + 1) * 3), Math.floor((u[2] + 1) * 3), seed) > 0.86 ? CLAY[Math.max(0, tone - 1)] : CLAY[tone]) });
  const neck = add(c, mul(up, POT_R * 1.05));
  put(part, part, { k: 'rod', a: add(c, mul(up, POT_R * 0.6)), b: neck, ra: 1.1, rb: 0.95, ramp: CLAY });
  put(part, part, { k: 'ball', c: add(neck, mul(up, 0.4)), ax: sphere(0.9), skin: RAGS });
  const fuse = add(neck, mul(up, 1.6));
  if (lit > 0.05) {
    const flick = hash(Math.floor(t * 16), seed, 93);
    put(part, part, { k: 'ball', c: fuse, ax: sphere(0.9 + 0.5 * lit), skin: (_u, tone) => (tone >= 3 || flick > 0.6 ? FLAME[4] : FLAME[3]) });
    put('glow', 'glow', { k: 'glow', p: fuse, c: FLAME[2], r: 9 + 4 * flick, a: 0.45 * lit });
    // (sparks spat off the fuse)
    for (let i = 0; i < 3; i++) {
      const k = fr(t * 2.6 + i / 3 + seed * 0.1);
      const a = hash(i, Math.floor(t * 2.6 + i / 3), seed) * Math.PI * 2;
      put('sparks', 'sparks', { k: 'mote', p: add(fuse, [Math.cos(a) * 3 * k, Math.sin(a) * 3 * k, 2.5 * k - 3 * k * k]), c: k < 0.5 ? FLAME[3] : FLAME[2], size: 1 });
    }
  } else put(part, part, { k: 'rod', a: neck, b: fuse, ra: 0.3, rb: 0.25, ramp: RAGS });
}

/** THE FIREPOT THROWER AS SOLIDS: its bound legs, its robe girded up, its sleeves and hands, the rack of pots on its back, the sling and its lit pot, the cowl. */
function potsBits(st: Stage, m: Moment): Bit[] {
  const { s, q } = m;
  const B = PB;
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

  // --- its legs, bound in rags from the knee down ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: 2.0, rb: 1.6, ramp: RAGS, far: true });
    put(`leg${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: 1.5, rb: 1.15, ramp: RAGS, far: true });
    put(`leg${side}`, `foot${side}`, { k: 'rod', a: add(heel, [0, 0, 1.0]), b: add(toe, [0, 0, 0.75]), ra: 1.2, rb: 0.9, ramp: RAGS, far: true });
  }
  // --- its robe, girded up to its knees with the cult's pink cord, the hem torn ---
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const be = s.belly;
  const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
  const spanF = Math.abs(dot(sub(s.kneeL, s.kneeR), f));
  const hemZ = Math.min(s.kneeL[2], s.kneeR[2]) + 0.6;
  const hipC: V3 = [s.pelvis[0], s.pelvis[1], s.pelvis[2] - 1.2];
  const hemC: V3 = [s.pelvis[0] + (kneeMid[0] - s.pelvis[0]) * 0.55 + lag[0] * 1.3, s.pelvis[1] + (kneeMid[1] - s.pelvis[1]) * 0.55 + lag[1] * 1.3, hemZ];
  const hemDeep = Math.max(B.pelvisDeep + 3.2, spanF / 2 + 2.6);
  const hemWide = B.pelvisHalf + 3.4;
  const hemPts: V3[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const rear = Math.max(0, -Math.cos(a));
    hemPts.push(add(add(hemC, add(mul(f, Math.cos(a) * hemDeep), mul(l, Math.sin(a) * hemWide))), add([0, 0, Math.sin(ph * 2 + a * 3) * 0.5 + rear * 0.6], mul(lag, rear * 0.7))));
  }
  const rings: Ring[] = [
    { c: add(s.neck, mul(cu, 0.8)), u: mul(cf, 3.8), v: mul(cl, 4.6) },
    { c: lerp3(s.ribs, s.neck, 0.7), u: mul(cf, B.ribDeep + 2.3), v: mul(cl, B.shoulderHalf + 1.0) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 2.1), v: mul(cl, B.ribHalf + 2.3) },
    { c: waistC, u: mul(be[0], B.waistDeep + 1.7), v: mul(be[1], B.waistHalf + 1.7) },
    { c: hipC, u: mul(f, B.pelvisDeep + 2.1), v: mul(l, B.pelvisHalf + 2.3) },
    { c: lerp3(hipC, hemC, 0.5), u: mul(f, (B.pelvisDeep + 2.1 + hemDeep) / 2), v: mul(l, (B.pelvisHalf + 2.3 + hemWide) / 2) },
    { c: hemC, u: mul(f, hemDeep), v: mul(l, hemWide), pts: hemPts },
  ];
  put('robe', 'robe', { k: 'cloth', rings, ramp: ROBE, look: { folds: [25, -25, 70, -70, 120, -120, 165, -165], lift: 0.08 }, torn: TORN });
  {
    const ring: Ring = { c: add(waistC, mul(cu, -0.4)), u: mul(be[0], B.waistDeep + 1.7), v: mul(be[1], B.waistHalf + 1.7) };
    put('cord', 'cord', { k: 'band', ring, ramp: STOLE, rows: 2 });
  }
  // --- its sleeves and hands: the right fist closed on the sling's cords, the left hand open ---
  for (const side of ['L', 'R'] as const) {
    const [fore, e1, e2] = sleeve(s, put, side, cu, lag, 2.7);
    const hand = side === 'L' ? s.handL : s.handR;
    put(`hand${side}`, `hand${side}`, { k: 'ball', c: hand, ax: [mul(fore, 1.35), mul(e1, 1.2), mul(e2, 1.1)], skin: SKIN, far: true });
  }
  // --- THE RACK ON ITS BACK: two poles from its hips to over its head, three crossbars, lashed to it; six firepots hung in it, two rows of three ---
  const back = norm(mul(cf, -1), [-1, 0, 0]);
  const base = add(add(s.pelvis, mul(back, B.pelvisDeep + 1.6)), [0, 0, -1]);
  const topC = add(add(s.neck, mul(back, B.ribDeep + 6.0)), mul(cu, 14));
  const wideL = mul(cl, 6.0);
  const poles: [V3, V3][] = [[add(base, wideL), add(topC, wideL)], [sub(base, wideL), sub(topC, wideL)]];
  for (const [a, b] of poles) put('rack', 'rack', { k: 'rod', a, b, ra: 0.8, rb: 0.75, ramp: WOOD });
  const rackUp = norm(sub(topC, base), [0, 0, 1]);
  for (const k of [0.18, 0.55, 0.92]) put('rack', 'rack', { k: 'rod', a: lerp3(poles[0][0], poles[0][1], k), b: lerp3(poles[1][0], poles[1][1], k), ra: 0.6, rb: 0.6, ramp: WOOD });
  // (the straps over its shoulders)
  for (const sd of [1, -1]) put('strap', 'strap', { k: 'rod', a: add(lerp3(poles[sd > 0 ? 0 : 1][0], poles[sd > 0 ? 0 : 1][1], 0.62), mul(back, -0.5)), b: add(add(sd > 0 ? s.shoulderL : s.shoulderR, mul(cu, 1.6)), mul(cf, 1.2)), ra: 0.7, rb: 0.7, ramp: RAGS });
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const k = 0.4 + row * 0.36;
      const across = (col - 1) * 3.9;
      const c = add(add(lerp3(base, topC, k), mul(cl, across)), mul(back, 2.8));
      const jig = Math.sin(ph * 2 + col + row * 2) * 0.25;
      if (!(m.dying && m.t >= POTS_DIES.burst)) firepot(put, 'pots', add(c, [0, 0, jig]), rackUp, 0, m.t, 11 + row * 3 + col);
    }
  }
  // --- THE SLING in its right fist: two cords down to the lit pot, swinging (empty once it is thrown, till it has another) ---
  if (m.bare) {
    for (const sd of [1, -1]) put('sling', 'sling', { k: 'rod', a: s.handR, b: add(s.handR, [sd * 0.8, 0, -SLING_LONG * 0.8]), ra: 0.35, rb: 0.35, ramp: RAGS });
  } else if (!(m.dying && m.t >= POTS_DIES.burst)) {
    // (as it falls, the slung pot comes down on the floor by its hand, still on its cords)
    const fallen = m.dying && m.t > POTS_DIES.knees;
    const pot = fallen ? ([s.handR[0] + 2.5, s.handR[1] - 3, POT_R * 0.95] as V3) : slungPot(s, m);
    const up = norm(sub(s.handR, pot), [0, 0, 1]);
    const flat = norm(cross(up, [0, 0, 1]), [1, 0, 0]);
    for (const sd of [1, -1]) put('sling', 'sling', { k: 'rod', a: s.handR, b: add(add(pot, mul(flat, sd * POT_R * 0.8)), mul(up, POT_R * 0.3)), ra: 0.35, rb: 0.35, ramp: RAGS });
    firepot(put, 'slungPot', pot, up, Math.max(lit, m.dying ? 0 : 1) * (1 + 0.6 * clamp01(m.glint)), m.t, 7);
  }
  // ITS POTS GOING OFF, as it dies: each cracks, and the cult's fire whooshes up out of it, roars, and sinks to embers
  if (m.dying && m.t >= POTS_DIES.burst) {
    const k = m.t - POTS_DIES.burst;
    const fierce = k < 0.12 ? k / 0.12 : Math.max(0, 1 - (k - 0.12) / (POTS_DIES.out - POTS_DIES.burst - 0.12));
    const middle = lerp3(base, topC, 0.55);
    for (let i = 0; i < 18; i++) {
      const u = fr(m.t * 2.8 + i / 18);
      const a = hash(i, 1, 98) * Math.PI * 2;
      const r0 = 3 + 9 * hash(i, 2, 98);
      const p0 = add(middle, [Math.cos(a) * r0 * (1 - 0.5 * u), Math.sin(a) * r0 * (1 - 0.5 * u), u * (14 + 26 * fierce)]);
      if (fierce * (1 - u) < 0.05) continue;
      put('fire', 'fire', { k: 'ball', c: p0, ax: sphere((3.4 - 2.6 * u) * (0.5 + 0.9 * fierce)), skin: () => (u < 0.25 ? FLAME[4] : u < 0.55 ? FLAME[3] : FLAME[2]) });
    }
    if (fierce > 0.05) put('glow', 'glow', { k: 'glow', p: add(middle, [0, 0, 10]), c: FLAME[2], r: 24 + 34 * fierce, a: 0.6 * fierce });
    // (shards of the pots flung out, and lying)
    for (let i = 0; i < 9; i++) {
      const a = hash(i, 3, 98) * Math.PI * 2;
      const kk = Math.min(1, k / 0.35);
      const p0: V3 = [middle[0] + Math.cos(a) * (3 + 9 * hash(i, 4, 98)) * kk, middle[1] + Math.sin(a) * (3 + 9 * hash(i, 4, 98)) * kk, Math.max(0.6, middle[2] + 8 * Math.sin(Math.PI * kk) - middle[2] * kk)];
      put('shards', 'shards', { k: 'ball', c: p0, ax: [[1.2, 0, 0], [0, 0.9, 0], [0, 0, 0.5]], skin: CLAY });
    }
  }
  streaks(st, m, put, FLAME[3], CLAY[3]);
  // --- its cowl ---
  cowl(st, s, put, glare, lag, ph);
  return bits;
}

// --- THE FIREPOT THROWER'S MOVES ---

/** Its walk: a hunched trudge under its load, eight frames at eight a second, painted for 1.1 tiles a second; each foot down where it came down until it lifts. */
export const POTS_PACE = 1.1;
const POTS_WALK = { frames: 8, fps: 8 } as const;
function potsWalk(): Motion {
  const R = POTS_REST;
  const n = POTS_WALK.frames;
  const d = (POTS_PACE * TILE3) / POTS_WALK.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [rx, rz, rp] = stepFoot(j, n, d, 4);
    const [lx, lz, lp] = stepFoot((j + n / 2) % n, n, d, 4);
    keys.push({
      at: i / POTS_WALK.fps,
      ease: 'lin',
      pose: {
        pz: R.pz - 1.0 * Math.abs(Math.cos(a)), py: 1.1 * Math.sin(a), roll: 3 * Math.sin(a), yaw: 4 * Math.cos(a), twist: -3 * Math.cos(a),
        pitch: R.pitch + 2, bend: R.bend + 1 * Math.abs(Math.cos(a)), faceUp: R.faceUp,
        rfx: rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft, rk: R.rk,
        lfx: lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft, lk: R.lk,
        lhx: R.lhx - 3 * Math.cos(a), rhx: R.rhx + 2 * Math.cos(a),
      },
    });
  }
  return { keys, loop: 0 };
}

/** ITS LOB: how long, when the pot is let go (on a frame of the game's thirty a second), when it warns; when it whirls it, and when it has another pot in the sling. */
export const POTS_LOB = { long: 1.7, hit: 27 / 30, warn: 0.4, whirl: 0.2, reload: 1.36 } as const;
/**
 * It hauls the sling up over its head and whirls the lit pot round, faster and faster, the fuse flaring (THE
 * WARNING, from 0.4); heaves forward and lets it fly (`POTS_LOB.hit`; from `handAt(FIREPOT_THROWER, 'attack',
 * POTS_LOB.hit)`, the pot then at `potsPotAt`); its sling empty, it reaches back over its shoulder to its
 * rack, draws another pot, and hangs it in the sling, lit.
 */
function potsLob(): Motion {
  const R = POTS_REST;
  const H = POTS_LOB.hit;
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: POTS_LOB.whirl, pose: { pz: R.pz + 1.2, pitch: R.pitch - 6, bend: R.bend - 6, faceUp: R.faceUp + 6, rhx: 1, rhy: -2, rhz: 16, re: 20, lhx: 9, lhz: -10 }, ease: 'io' },
      { at: 0.6, pose: { pz: R.pz + 1.6, pitch: R.pitch - 10, bend: R.bend - 9, faceUp: R.faceUp + 8, twist: 8, rhx: -1, rhy: -2, rhz: 17, re: 20, lhx: 10, lhz: -8 }, ease: 'io' },
      { at: H - 0.2, pose: { pz: R.pz + 1.4, pitch: R.pitch - 12, bend: R.bend - 10, faceUp: R.faceUp + 8, twist: 12, rhx: -4, rhy: -3, rhz: 16, re: 22, lhx: 10, lhz: -8 }, ease: 'io' },
      { at: H, pose: { px: 1.4, pz: R.pz - 0.6, pitch: R.pitch + 4, bend: R.bend + 3, faceUp: R.faceUp, twist: -6, rhx: 12, rhy: -3, rhz: 8, re: 30, lhx: 5, lhz: -13 }, ease: 'in' },
      { at: H + 0.1, pose: { px: 2.2, pz: R.pz - 1.4, pitch: R.pitch + 9, bend: R.bend + 7, faceUp: R.faceUp - 3, twist: -10, rhx: 13, rhy: -3, rhz: 0, re: 34, lhx: 4, lhz: -14 }, ease: 'out' },
      { at: H + 0.24, pose: { px: 2.5, pz: R.pz - 2, pitch: R.pitch + 12, bend: R.bend + 9, faceUp: R.faceUp - 5, twist: -12, rhx: 10, rhy: -2, rhz: -6, re: 40, lhx: 4, lhz: -15 }, ease: 'io' },
      { at: POTS_LOB.reload - 0.12, pose: { px: 0.5, pz: R.pz, pitch: R.pitch + 4, bend: R.bend + 2, faceUp: R.faceUp, faceTurn: -30, twist: 10, rhx: -3, rhy: -1, rhz: 12, re: 60, lhx: 7, lhz: -13 }, ease: 'io' },
      { at: POTS_LOB.reload, pose: { pz: R.pz, faceTurn: -20, twist: 6, rhx: -2, rhy: -2, rhz: 10, re: 60 }, ease: 'io' },
      { at: POTS_LOB.long, pose: {}, ease: 'io' },
    ],
  };
}
/** The fuse flaring as it whirls the pot (the warning). */
function potsGlint(t: number): number {
  const H = POTS_LOB.hit;
  if (t < 0.3 || t > H) return 0;
  return t < 0.6 ? (t - 0.3) / 0.3 : 1;
}
/** How many times round it has whirled the pot, `t` seconds into its lob (0: not whirling). */
function potsWhirl(t: number): number {
  const { whirl: W, hit: H } = POTS_LOB;
  if (t < W || t >= H) return 0;
  const u = (t - W) / (H - W);
  return 2.25 * u * u + 0.75 * u + 0.001;
}
/** Where the lit pot is as it is let go: its figure's lengths, on its floor (the game flies it from here). */
export function potsPotAt(t: number = POTS_LOB.hit - 1 / 30): V3 {
  const s = skeletonAt(FIREPOT_THROWER, 'attack', t);
  const a = (potsWhirl(t) - 0.001) * Math.PI * 2;
  return add(s.handR, [Math.cos(a) * SLING_LONG * 0.95, Math.sin(a) * SLING_LONG * 0.95, -1.5 + Math.sin(a) * 1.2]);
}
/** STRUCK: knocked back under its load, the pots rattling, the slung pot swinging wild. */
function potsReel(): Motion {
  const R = POTS_REST;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -3, pz: R.pz + 1, pitch: R.pitch - 12, bend: R.bend - 12, faceUp: R.faceUp + 18, twist: -8, lhx: R.lhx - 5, lhz: R.lhz + 5, rhx: R.rhx - 3, out: 0.1 }, ease: 'out' },
      { at: 0.16, pose: { px: -1.5, pitch: R.pitch - 4, bend: R.bend - 4, faceUp: R.faceUp + 6 }, ease: 'io' },
      { at: 0.3, pose: {}, ease: 'io' },
    ],
  };
}
/** ITS DEATH, "Its own pots go off": struck, on its knees, on its face; its pots burst; their fire out. */
export const POTS_DIES = { long: 1.9, knees: 0.36, down: 0.68, burst: 0.74, out: 1.75 } as const;
function potsDying(): Motion {
  const R = POTS_REST;
  const kneel: Partial<Bones> = {
    px: 8, pz: -14.0, pitch: 22, bend: 24, faceUp: -8, lk: 0, rk: 0,
    rhIn: 2, lhIn: 2, rhx: 18, rhy: -10, rhz: 11, lhx: 18, lhy: 10, lhz: 11,
  };
  const down: Partial<Bones> = {
    px: 23, pz: -23.2, pitch: 84, bend: 6, faceUp: -10, faceTurn: 70, faceTilt: 20, lk: 0, rk: 0,
    rhIn: 2, lhIn: 2, rhx: 36, rhy: -9, rhz: 1.6, lhx: 33, lhy: 9, lhz: 1.6,
  };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.5, pitch: R.pitch - 9, bend: R.bend - 10, faceUp: R.faceUp + 16, out: 0.1 }, ease: 'out' },
      { at: POTS_DIES.knees, pose: { ...kneel, out: 0.5 }, ease: 'in' },
      { at: POTS_DIES.knees + 0.08, pose: { ...kneel, pz: -15.2, out: 0.6 }, ease: 'out' },
      { at: POTS_DIES.down, pose: { ...down, out: 0.9 }, ease: 'in' },
      { at: POTS_DIES.down + 0.08, pose: { ...down, pz: -22.8, out: 1 }, ease: 'out' },
      { at: POTS_DIES.down + 0.18, pose: { ...down, out: 1 }, ease: 'io' },
      { at: POTS_DIES.long, pose: { ...down, out: 1 }, ease: 'io' },
    ],
  };
}

export const FIREPOT_THROWER: Mob = {
  id: 'firepotThrower',
  name: 'The Firepot Thrower',
  size: 'small: a little shorter than the knight',
  build: PB,
  stand: { name: 'The firepot thrower, stooped under its pots', motion: potsStand(), rest: POTS_REST },
  attack: { name: 'The firepot thrower whirls and lobs a firepot', motion: potsLob(), rest: POTS_REST, glint: potsGlint, charge: potsWhirl, bare: (t) => t >= POTS_LOB.hit && t < POTS_LOB.reload, trail: (s) => [s.handR], trailOver: (t) => t > POTS_LOB.hit - 0.12 && t <= POTS_LOB.hit + 0.04, trailSpan: 2.5 },
  idleFrames: 20,
  idleFps: 10,
  walk: { name: 'The firepot thrower trudges', motion: potsWalk(), rest: POTS_REST, period: POTS_WALK.frames / POTS_WALK.fps, ground: POTS_PACE * TILE3 },
  walkFrames: POTS_WALK.frames,
  walkFps: POTS_WALK.fps,
  pace: POTS_PACE,
  reel: { name: 'The firepot thrower is struck', motion: potsReel(), rest: POTS_REST },
  reelTime: 0.3,
  hit: POTS_LOB.hit,
  warn: POTS_LOB.warn,
  dieTime: POTS_DIES.long,
  dying: { name: 'The firepot thrower falls, and its pots go off', motion: potsDying(), rest: POTS_REST, feet: fallingFeet(PB, POTS_REST, POTS_DIES.knees, POTS_DIES.down) },
  aura: { x: POTS_CANVAS.ax, y: POTS_CANVAS.ay - 28, r: 44, color: '#ff3a78', a: 0.12 },
  shadow: 12,
  canvas: POTS_CANVAS,
  trueBack: true,
  bits: (st, m) => potsBits(st, m),
};

/** THE FIREPOT IN FLIGHT, lit, tumbling end over end (`turn` 0..1 once round), sparks off its fuse; the enemy's edge round it. Its middle on the anchor. */
export const FIREPOT_FRAMES = 8;
export function firepotFlying(turn: number, view: GameView = 'front'): Sprite {
  const st = stage(view, 24, 28, { w: 48, h: 48 });
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const a = turn * Math.PI * 2;
  firepot(put, 'pot', [0, 0, -1.4], norm([Math.sin(a), 0, Math.cos(a)]), 1, turn * 2, 7);
  const lights = paintBits(st, bits, [0, 0, 0]);
  return toSprite({ px: st.whole(ENEMY_RIM), lights }, null, 24, 28);
}
/**
 * THE FIREPOT BURSTING where it comes down, and the cult's fire it leaves on the floor (`frame` 0 to 3 the
 * burst: the clay shattering, a whoosh of fire up and out; 4 to 7, the fire burning on the floor, round and
 * round, as long as the game keeps it). A floor piece, its middle where the pot came down: 112 x 96 at (56, 70).
 * Its light, the cult's fire. No edge.
 */
export const FIREPOT_BURST_FRAMES = 4;
export function firepotFire(frame: number): Sprite {
  const st = stage('front', 56, 70, { w: 112, h: 96 });
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const burst = frame < FIREPOT_BURST_FRAMES;
  const k = burst ? (frame + 1) / FIREPOT_BURST_FRAMES : 1;
  const R = 14;
  // (the ground burning: a pool of the cult's fire, flickering, tongues of it licking up)
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + hash(i, 1, 99);
    const r = R * Math.sqrt(hash(i, 2, 99)) * Math.min(1, k * 1.3);
    const u = fr(frame * 0.25 + hash(i, 3, 99));
    const h = burst ? 4 + 14 * Math.sin(Math.PI * k) * hash(i, 4, 99) : 2 + 6 * u * hash(i, 4, 99);
    put('fire', 'fire', { k: 'ball', c: [Math.cos(a) * r, Math.sin(a) * r * 0.9, 1 + h * (burst ? 1 : u)], ax: sphere(burst ? 2.4 - k : 1.8 - 1.2 * u), skin: () => (u < 0.3 ? FLAME[3] : u < 0.7 ? FLAME[2] : FLAME[1]) });
  }
  put('floor', 'floor', { k: 'ball', c: [0, 0, 0.3], ax: [[R * Math.min(1, k * 1.3), 0, 0], [0, R * 0.9 * Math.min(1, k * 1.3), 0], [0, 0, 0.4]], skin: (u, tone) => (hash(Math.floor((u[0] + 1) * 6), Math.floor((u[1] + 1) * 6) + frame, 100) > 0.6 ? FLAME[1] : CHAR[Math.min(2, tone)]) });
  if (burst) for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    put('shards', 'shards', { k: 'ball', c: [Math.cos(a) * (4 + 14 * k), Math.sin(a) * (4 + 14 * k), Math.max(0.6, 10 * Math.sin(Math.PI * k))], ax: [[1.2, 0, 0], [0, 0.9, 0], [0, 0, 0.5]], skin: CLAY });
  }
  put('glow', 'glow', { k: 'glow', p: [0, 0, 6], c: FLAME[2], r: burst ? 30 + 20 * Math.sin(Math.PI * k) : 26 + 4 * Math.sin(frame * 1.7), a: burst ? 0.6 : 0.4 });
  const lights = paintBits(st, bits, [0, 0, 2]);
  return toSprite({ px: st.whole(null), lights }, null, 56, 70);
}

/** As the game holds a monster's pictures. */
export function makeChanterArt3(pace = CHANTER.pace): ActorArt {
  return { front: mobSet(CHANTER, 'front', pace), back: mobSet(CHANTER, 'back', pace) };
}
export function makeFirepotThrowerArt3(pace = FIREPOT_THROWER.pace): ActorArt {
  return { front: mobSet(FIREPOT_THROWER, 'front', pace), back: mobSet(FIREPOT_THROWER, 'back', pace) };
}
