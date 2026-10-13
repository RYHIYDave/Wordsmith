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
import { HAND_BONE, clamp01, curve } from './fleshmancer';
import { INK, PINK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME, SOCKET } from './mkit';
import { mobSet, sphere } from './new_mobs3';
import type { Bit, Mob, MobCanvas, MobMove, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const ACT1_CULT_ON = { on: false };

const D = Math.PI / 180;
const fr = (t: number): number => t - Math.floor(t);

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
        pz: R.pz + 0.4 * Math.sin(2 * a),
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
export function bookOf(s: Skeleton): { c: V3; along: V3; across: V3; up: V3 } {
  const mid = lerp3(s.handL, s.handR, 0.5);
  const across = norm(sub(s.handL, s.handR), [0, 1, 0]);
  const fwd = norm([s.chest[0][0], s.chest[0][1], 0], [1, 0, 0]);
  const along = norm(sub(fwd, mul(across, dot(fwd, across))), fwd);
  const up = norm(cross(along, across), [0, 0, 1]);
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
  const bk = bookOf(s);
  const glow = lit * (0.45 + 0.55 * chant) * (1 + clamp01(m.glint));
  for (const sd of [1, -1]) {
    const tiltUp: V3 = norm(add(bk.up, mul(bk.across, -sd * 0.22)));
    const out = norm(sub(mul(bk.across, sd), mul(tiltUp, dot(mul(bk.across, sd), tiltUp))), mul(bk.across, sd));
    const c = add(add(bk.c, mul(out, BOOK.across)), mul(tiltUp, 0.2));
    // (the cover under the page, a little bigger, its edge showing)
    put('book', `cover${sd}`, { k: 'panel', c: add(c, mul(tiltUp, -BOOK.thick)), u: mul(out, BOOK.across + 0.5), v: mul(bk.along, BOOK.along + 0.5), skin: (_a, _b, front, tone) => (front ? null : LEATHER[tone]) });
    put('book', `block${sd}`, { k: 'rod', a: add(add(c, mul(out, BOOK.across + 0.1)), add(mul(bk.along, -BOOK.along), mul(tiltUp, -BOOK.thick * 0.5))), b: add(add(c, mul(out, BOOK.across + 0.1)), add(mul(bk.along, BOOK.along), mul(tiltUp, -BOOK.thick * 0.5))), ra: BOOK.thick * 0.6, rb: BOOK.thick * 0.6, ramp: LEATHER });
    put('book', `page${sd}`, {
      k: 'panel',
      c,
      u: mul(out, BOOK.across),
      v: mul(bk.along, BOOK.along),
      skin: (a, b, front, tone) => {
        if (!front) return LEATHER[tone];
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
  if (glow > 0.15) put('glow', 'glow', { k: 'glow', p: add(bk.c, mul(bk.up, 2)), c: FLAME[2], r: 10 + 8 * chant, a: 0.22 * glow });
  // --- ITS CHANT: rings of the cult's power going out from it over the floor, one after another ---
  if (lit > 0.1) {
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
  // --- its cowl ---
  cowl(st, s, put, glare, lag, ph);
  return bits;
}

/** A move that is its stand, held: a placeholder for a move not yet made (not for use). */
function placeholder(name: string, stand: Motion, rest: Bones): MobMove {
  return { name: `${name} (not made yet: its stand)`, motion: stand, rest };
}

export const CHANTER: Mob = (() => {
  const stand = chanterStand();
  return {
    id: 'chanter',
    name: 'The Chanter',
    size: 'small: a little shorter than the knight',
    build: CB,
    stand: { name: 'The chanter chants over its book', motion: stand, rest: CHANTER_REST },
    attack: placeholder('Its bolt of cursed words', stand, CHANTER_REST),
    idleFrames: 24,
    idleFps: 10,
    walk: placeholder('Its slow walk', stand, CHANTER_REST),
    walkFrames: 8,
    walkFps: 8,
    pace: 1.2,
    reel: placeholder('Struck', stand, CHANTER_REST),
    reelTime: 0.3,
    hit: 0.6,
    warn: 0.3,
    dieTime: 1.5,
    dying: placeholder('Its book burns', stand, CHANTER_REST),
    aura: { x: CHANTER_CANVAS.ax, y: CHANTER_CANVAS.ay - 26, r: 40, color: '#ff3a78', a: 0.12 },
    shadow: 11,
    canvas: CHANTER_CANVAS,
    trueBack: true,
    bits: (st, m) => chanterBits(st, m),
  };
})();

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
        pz: R.pz - 0.6 * Math.max(0, Math.sin(2 * a)),
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
      firepot(put, 'pots', add(c, [0, 0, jig]), rackUp, 0, m.t, 11 + row * 3 + col);
    }
  }
  // --- THE SLING in its right fist: two cords down to the lit pot, swinging ---
  {
    const pot = slungPot(s, m);
    const up = norm(sub(s.handR, pot), [0, 0, 1]);
    const flat = norm(cross(up, [0, 0, 1]), [1, 0, 0]);
    for (const sd of [1, -1]) put('sling', 'sling', { k: 'rod', a: s.handR, b: add(add(pot, mul(flat, sd * POT_R * 0.8)), mul(up, POT_R * 0.3)), ra: 0.35, rb: 0.35, ramp: RAGS });
    firepot(put, 'slungPot', pot, up, lit, m.t, 7);
  }
  // --- its cowl ---
  cowl(st, s, put, glare, lag, ph);
  return bits;
}

export const FIREPOT_THROWER: Mob = (() => {
  const stand = potsStand();
  return {
    id: 'firepotThrower',
    name: 'The Firepot Thrower',
    size: 'small: a little shorter than the knight',
    build: PB,
    stand: { name: 'The firepot thrower, stooped under its pots', motion: stand, rest: POTS_REST },
    attack: placeholder('Its lobbed firepot', stand, POTS_REST),
    idleFrames: 20,
    idleFps: 10,
    walk: placeholder('Its trudge', stand, POTS_REST),
    walkFrames: 8,
    walkFps: 8,
    pace: 1.4,
    reel: placeholder('Struck', stand, POTS_REST),
    reelTime: 0.3,
    hit: 0.9,
    warn: 0.4,
    dieTime: 1.6,
    dying: placeholder('Its own pots go off', stand, POTS_REST),
    aura: { x: POTS_CANVAS.ax, y: POTS_CANVAS.ay - 28, r: 44, color: '#ff3a78', a: 0.12 },
    shadow: 12,
    canvas: POTS_CANVAS,
    trueBack: true,
    bits: (st, m) => potsBits(st, m),
  };
})();

/** As the game holds a monster's pictures. */
export function makeChanterArt3(pace = CHANTER.pace): ActorArt {
  return { front: mobSet(CHANTER, 'front', pace), back: mobSet(CHANTER, 'back', pace) };
}
export function makeFirepotThrowerArt3(pace = FIREPOT_THROWER.pace): ActorArt {
  return { front: mobSet(FIREPOT_THROWER, 'front', pace), back: mobSet(FIREPOT_THROWER, 'back', pace) };
}
