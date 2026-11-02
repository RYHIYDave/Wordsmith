// FLOOR 10'S SMALL MOB, MORE ACTION: THE DROWNED (the art chat's helper, 1 Nov 2026; docs/mockups/action_f9/README.md). A MOCK-UP:
// NOTHING OF THE GAME IMPORTS THIS FILE. The Drowned's BOG RETCH and its FROST GRAB (DROWNED_RETCH, off), on the game's own figure
// (art/drowned.ts), all it keeps frame for frame its own.
//
// His review of every enemy for more action, 31 Oct 2026, each offered and answered “Yes (Recommended)”:
//   THE DROWNED: “Bog retch: rises and retches a gush of black bog water in a cone. It lies as a slick that slows and stings.” (his
//   ask: “something that, like, takes away space”); and his pick for FROST: “The Drowned, 10” (offered as: the Drowned's grab
//   freezes you in place a moment). Two attacks on a small kind, his picks (as the bone archer's two).
// Under his Movement 9 (24 Oct: “Like the wind up and wind down are big but the actual punch is lightning quick”; 28 Oct: “And bigger
// AOE to compensate for the extra time the player gets to evade”).
//
// THE FROST GRAB: its arms flung up and wide, its hands spread, frost creeping white over its hands and its breath smoking cold, HELD
// trembling; in TWO FRAMES it lunges, both hands clutching, smeared; ice bursts from its grip, and rime spreads over the floor where it
// has you, ice shooting up round your feet: frozen in place a moment; it wrenches down, lets go, and hunches again.
// THE BOG RETCH: it rises up out of its hunch, rearing back, its chest swelling, its head thrown back, heaving, black water dribbling
// from its mouth (the cone it will cover marked on the floor before it), HELD; in TWO FRAMES it lurches forward and down and retches, a
// gush of black bog water thrown out of it in a cone, smeared; it lies there as A SLICK: black, oily, weed in it, bubbling, the enemy's
// pink at its edge, slowing and stinging whoever wades in it, for five seconds. Floor taken away.
//
// THE FROST IS NOT THE FRIEND'S CYAN: every colour of it is a grey-white with only a little blue in it (its hue 215 to 225 degrees,
// bluer than cyan's 180 to 190; its saturation under a fifth, where the friend's cyan is over three quarters); the brightest of it
// near white; its edge the enemy's pink, and flecks of the enemy's pink in it.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt } from './actor_types';
import { hash } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, mobSet, skeletonAt } from './new_mobs3';
import type { Bit, Mob, MobMove, Moment, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import { add, lerp3, mul } from './skeleton';
import type { Bones, Key3, Skeleton, V3 } from './skeleton';
import { DROWNED, DROWNED_CANVAS, DROWNED_REST, makeDrownedArt3 } from './drowned';
import { FR, TAU, blob, clamp01, f, markRing, pen, smearAlong, smooth } from './action_f6_fx';

/** THE SWITCH, OFF. With it on, the bestiary's Drowned is made by `makeFrostDrownedArt`. */
export const DROWNED_RETCH = { on: false };

type P = Partial<Bones>;
const R = DROWNED_REST;

/** THE FROST: grey-white, a little blue in it (never the friend's cyan): its dark, its shade, its body, its light, near white. */
export const RIME = ['#40444e', '#686e7c', '#9ca6b8', '#cdd4de', '#eef2f6'] as const;
/** The bog water: near black, peat-brown, its dull sheen, and the fen's weed in it. */
export const BOG = ['#0c0a08', '#18140e', '#262016', '#3a3220', '#585034'] as const;
const WEEDY = ['#28331c', '#344224', '#42532c'] as const;
const PINK = ['#e0287a', '#ff7aa8', '#7a1058'] as const;

/** The mouth: before its face, a little under its middle (the end it retches with). */
export const mouthOf = (s: Skeleton): V3 => add(s.head, add(mul(s.face[0], 5.2), mul(s.face[2], -1.6)));
const handsOf = (s: Skeleton): V3 => lerp3(s.handL, s.handR, 0.5);

// =============================================================================================
// THE FROST GRAB, BY MOVEMENT 9

/**
 * THE GRAB'S NUMBERS (seconds from its start; tiles):
 *   wind-up  its arms flung up and wide, its head thrown back, by 0.3 s; HELD, trembling, frost creeping over its hands, to 0.667 s
 *            (0.37 s)
 *   strike   TWO FRAMES, smeared: lunging (frame 21), both hands clutching shut on you (frame 22, 0.733 s: the clip's `hit`)
 *   wind-down  gripping, the frost spreading, to 1.0 s; wrenched down by 1.3 s; let go, hunched again by 1.9 s
 *   reach    a hero in the strip `fwd` before it and `half` to either side is grabbed (the game's: to 1.06, 0.55)
 *   FROST    as its hands close, a hero within `r` of `at` before it is struck and FROZEN IN PLACE for `hold` seconds; the rime on
 *            the floor there is seen `seen` seconds; the ice round his feet shatters as he is let go
 */
export const GRAB_HIT = f(22);
export const GRAB_STRIKE = [f(20), f(22)] as const;
export const GRAB_SMEARED = (t: number): boolean => t > GRAB_STRIKE[0] + 1e-6 && t <= GRAB_STRIKE[1] + FR + 1e-6;
export const GRAB9 = { hit: GRAB_HIT, strike: GRAB_STRIKE, up: 0.3, long: 1.9, fwd: [0.2, 1.7] as const, half: 0.8 } as const;
export const FROST = { at: 1.15, r: 1.0, hold: 0.8, seen: 1.6 } as const;
const GRAB_NAME = 'The drowned flings its frosted hands up, held, and clutches: frozen';
function grabKeys(): Key3[] {
  const up: P = { px: -3.2, pz: R.pz + 1.8, pitch: -8, bend: -6, faceUp: 36, lhx: 0.6, lhy: 14.6, lhz: 14, rhx: 0.6, rhy: -14.6, rhz: 14, le: -64, re: 64, pt: 1 };
  const shake = (d: number): P => ({ ...up, lhz: 14 + d, rhz: 14 - d * 0.6, lhy: 14.6 + d * 0.4, rhy: -14.6 - d * 0.4, faceUp: 36 + d });
  const clutch: P = { px: 9.5, pz: R.pz - 1.4, pitch: 28, bend: 24, faceUp: 18, lhx: 23, lhy: 2.6, lhz: 1, rhx: 23, rhy: -2.6, rhz: 1, le: -20, re: 20, pt: 0, lk: 18, rk: -6, rfx: -3 };
  return [
    { at: 0, pose: {} },
    { at: GRAB9.up, pose: up, ease: 'io' },
    { at: 0.42, pose: shake(0.6), ease: 'io' },
    { at: 0.54, pose: shake(-0.5), ease: 'io' },
    { at: GRAB_STRIKE[0], pose: shake(0), ease: 'io' },
    // (in at you: its hips and chest first, its hands after)
    { at: f(21), pose: { px: 5.5, pz: R.pz + 0.2, pitch: 12, bend: 9, faceUp: 26, lhx: 13, lhy: 9.5, lhz: 9, rhx: 13, rhy: -9.5, rhz: 9, le: -42, re: 42, pt: 0.4, lk: 10, rk: -3, rfx: -1.5 }, ease: 'lin' },
    { at: GRAB_HIT, pose: clutch, ease: 'lin' },
    { at: GRAB_HIT + 0.1, pose: { ...clutch, px: 10.2, pitch: 30, bend: 26, lhx: 23.5, rhx: 23.5, lhz: -0.5, rhz: -0.5 }, ease: 'out' },
    { at: 1.0, pose: { ...clutch, px: 9.8, pitch: 31, bend: 27, lhx: 22.5, rhx: 22.5, lhz: -1.5, rhz: -1.5 }, ease: 'io' },
    { at: 1.3, pose: { px: 4, pz: R.pz - 5, pitch: 40, bend: 34, faceUp: 30, lhx: 10, lhy: 2.4, lhz: -20, rhx: 10, rhy: -2.4, rhz: -20, le: -14, re: 14, pt: 0, lk: 22, rk: -16, rfx: -3 }, ease: 'io' },
    { at: 1.5, pose: { px: 3, pz: R.pz - 4, pitch: 36, bend: 32, faceUp: 28, lhx: 9, lhz: -21, rhx: 9, rhz: -22, pt: 0.3, lk: 20, rk: -14, rfx: -2 }, ease: 'io' },
    { at: GRAB9.long, pose: {}, ease: 'io' },
  ];
}
/** Its eyes flaring as it rears to grab (the warning): up as it rears, brightest as it lunges, dying back after. */
const grabGlint = (t: number): number => (t < 0.1 || t > GRAB_HIT + 0.3 ? 0 : t < 0.3 ? (t - 0.1) / 0.2 : t <= GRAB_HIT ? 1 : 1 - (t - GRAB_HIT) / 0.3);
/** How thick the frost on its hands is, `t` seconds in. */
const rimeOf = (t: number): number => (t < 0.15 ? 0 : t < 0.5 ? (t - 0.15) / 0.35 : t < 1.1 ? 1 : Math.max(0, 1 - (t - 1.1) / 0.4));

// =============================================================================================
// THE BOG RETCH

/**
 * THE RETCH'S NUMBERS (seconds from its start; tiles):
 *   wind-up  risen up out of its hunch and rearing back, its chest swelling, its head thrown back, by 0.35 s; HELD, heaving, black water
 *            dribbling from its mouth, to 0.767 s (0.42 s); the cone marked before it from `mark`
 *   strike   TWO FRAMES, smeared: lurching forward (frame 24), retching (frame 25, 0.833 s: the clip's `hit`)
 *   wind-down  retching on, bent double, the gush pouring out of it, to 1.3 s; heaving still to 1.6 s; hunched again by 2.2 s
 *   THE GUSH  black bog water thrown out of it over the cone: a hero in the cone (from `from` to `long` tiles before it, within `ang`
 *            degrees either side of straight before it) as it lands (`lands` after the hit) is struck
 *   THE SLICK  it lies there over the cone for `stays` seconds, shrinking over its last `fade`: whoever wades in it is slowed to `slow`
 *            of his pace and stung (the rules': the firepot's burning floor's way, tick by tick)
 *   near, far  retched at a hero from 1 to 3 tiles off
 */
export const RETCH_HIT = f(25);
export const RETCH_STRIKE = [f(23), f(25)] as const;
export const RETCH_SMEARED = (t: number): boolean => t > RETCH_STRIKE[0] + 1e-6 && t <= RETCH_STRIKE[1] + FR + 1e-6;
export const RETCH = { hit: RETCH_HIT, strike: RETCH_STRIKE, rise: 0.35, mark: 0.3, long: 2.2, pour: 1.3 } as const;
export const SLICK = { from: 0.3, long: 3.2, ang: 32, lands: 0.12, spread: 0.3, stays: 5, fade: 0.8, slow: 0.5, near: 1, far: 3 } as const;
const RETCH_NAME = 'The drowned rises, heaving, and retches black bog water';
function retchKeys(): Key3[] {
  const rise: P = { px: -3.4, pz: R.pz + 2.6, pitch: -11, bend: -11, faceUp: 42, faceTilt: -2, lhx: -2.4, lhy: 9.5, lhz: -15, rhx: -2.4, rhy: -9.5, rhz: -15, le: -30, re: 30, draw: 1 };
  const heave = (d: number): P => ({ ...rise, bend: -11 + d, pz: (rise.pz as number) - d * 0.12, faceUp: 42 - d * 0.4, draw: 1 - d * 0.05 });
  const thrown: P = { px: 6.5, pz: R.pz - 1.4, pitch: 30, bend: 27, faceUp: 4, faceTilt: -6, lhx: 6, lhy: 7.5, lhz: -16, rhx: 6, rhy: -7.5, rhz: -16, le: -20, re: 20, draw: 0, lk: 14, rk: -8 };
  return [
    { at: 0, pose: {} },
    { at: RETCH.rise, pose: rise, ease: 'io' },
    { at: 0.47, pose: heave(1.6), ease: 'io' },
    { at: 0.6, pose: heave(-0.4), ease: 'io' },
    { at: 0.7, pose: heave(1.2), ease: 'io' },
    { at: RETCH_STRIKE[0], pose: heave(0), ease: 'io' },
    // (forward and down: its hips and chest first, its head after)
    { at: f(24), pose: { px: 3, pz: R.pz + 0.8, pitch: 10, bend: 6, faceUp: 32, lhx: 2, lhy: 8.5, lhz: -15.5, rhx: 2, rhy: -8.5, rhz: -15.5, le: -26, re: 26, draw: 0.6, lk: 6, rk: -3 }, ease: 'lin' },
    { at: RETCH_HIT, pose: thrown, ease: 'lin' },
    { at: RETCH_HIT + 0.15, pose: { ...thrown, px: 7, pitch: 33, bend: 29, faceUp: 2 }, ease: 'out' },
    { at: RETCH.pour, pose: { ...thrown, px: 6.6, pitch: 32, bend: 28, faceUp: 5 }, ease: 'io' },
    { at: 1.6, pose: { px: 3, pz: R.pz - 1, pitch: 24, bend: 24, faceUp: 14, lhx: 6, rhx: 5, lhz: -19, rhz: -20, lk: 6, rk: -4 }, ease: 'io' },
    { at: RETCH.long, pose: {}, ease: 'io' },
  ];
}
/** Its eyes flaring as it heaves. */
const retchGlint = (t: number): number => (t < 0.1 || t > RETCH_HIT + 0.3 ? 0 : t < 0.35 ? (t - 0.1) / 0.25 : t <= RETCH_HIT ? 1 : 1 - (t - RETCH_HIT) / 0.3);
/** How hard the gush pours out of its mouth, `t` seconds in (0 to 1). */
export const pourOf = (t: number): number => (t < RETCH_HIT - 1e-6 ? 0 : t < RETCH_HIT + 0.2 ? 1 : Math.max(0, 1 - (t - RETCH_HIT - 0.2) / (RETCH.pour - RETCH_HIT - 0.2)));

// =============================================================================================
// WHAT IS PAINTED ON IT FOR THESE TWO

function moreBits(st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const { s } = m;
  const t = m.t;
  const fl = Math.floor(t * 30 + 1e-6);
  const mote = (p: V3, c: string, size = 1): void => put('fx', 'fx', { k: 'mote', p, c, size });
  if (m.move === GRAB_NAME) {
    // frost creeping over its hands and its forearms, crystals standing off them; its breath smoking cold
    const k = rimeOf(t);
    if (k > 0) {
      for (const [h, e, sd] of [[s.handL, s.elbowL, 3], [s.handR, s.elbowR, 7]] as const) {
        for (let i = 0; i < 18; i++) {
          if (hash(i, sd, 1801) > k) continue;
          const u = hash(i, sd + 1, 1801) * 0.75;
          const a = hash(i, sd + 2, 1801) * TAU;
          const r = 1.2 + 1.3 * hash(i, sd + 3, 1801);
          const p = add(lerp3(h, e, u), [Math.cos(a) * r, Math.sin(a) * r, Math.sin(a * 2) * r * 0.6]);
          mote(p, i % 7 === 0 ? PINK[1] : i % 3 === 0 ? RIME[4] : i % 3 === 1 ? RIME[3] : RIME[2], i % 4 === 0 ? 2 : 1);
        }
        // (crystals standing off its fingers)
        for (let i = 0; i < 4; i++) {
          if (hash(i, sd, 1803) > k) continue;
          const a = hash(i, sd + 4, 1803) * TAU;
          for (let j = 0; j < 3; j++) mote(add(h, [Math.cos(a) * (1.8 + j), Math.sin(a) * (1.8 + j), 1 + j * 0.8]), j === 2 ? RIME[4] : RIME[3]);
        }
      }
      if (t < GRAB_HIT + 0.4) {
        const mouth = mouthOf(s);
        for (let i = 0; i < 7; i++) {
          const u = ((t * 1.6 + i / 7) % 1);
          if (hash(i, Math.floor(t * 1.6 + i / 7), 1805) < 0.3) continue;
          mote(add(mouth, [3 + 7 * u, (hash(i, 2, 1805) - 0.5) * 5 * u, 2 + 6 * u]), u < 0.5 ? RIME[3] : RIME[2], u < 0.4 ? 2 : 1);
        }
      }
      if (k > 0.3) put('fx', 'cold', { k: 'glow', p: handsOf(s), c: RIME[3], r: 16 + 8 * k, a: 0.18 * k });
    }
    // as its hands close: ice bursting from its grip
    const since = t - GRAB_HIT;
    if (since >= 0 && since < 0.3) {
      const c = handsOf(skeletonAt(FROST_DROWNED, 'attack', GRAB_HIT));
      for (let i = 0; i < 26; i++) {
        const a = hash(i, 1, 1807) * TAU;
        const el = (hash(i, 2, 1807) - 0.3) * 1.6;
        const sp = 18 + 22 * hash(i, 3, 1807);
        const d = sp * since * (1 - since);
        if (hash(i, 4, 1807) < since / 0.3) continue;
        const p = add(c, [Math.cos(a) * Math.cos(el) * d + 3, Math.sin(a) * Math.cos(el) * d, Math.max(0.6, Math.sin(el) * d + 2 - 60 * since * since)]);
        mote(p, i % 5 === 0 ? PINK[1] : i % 2 ? RIME[4] : RIME[3], since < 0.12 ? 2 : 1);
      }
      if (since < 0.07) for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        const r = 3 + 9 * (since / 0.07);
        mote(add(c, [Math.cos(a) * r * 0.6 + 2, Math.sin(a) * r, Math.cos(a) * r * 0.5 + 1]), i % 2 ? RIME[4] : '#ffffff', 2);
      }
    }
    if (GRAB_SMEARED(t)) {
      const thin = Math.abs(t - GRAB_HIT - FR) < 1e-6;
      const lines: V3[][] = [[], [], [], []];
      for (let i = 0; i <= 8; i++) {
        const u = Math.min(t, GRAB_HIT) - (FR * 1.3 * i) / 8;
        const ss = skeletonAt(FROST_DROWNED, 'attack', u);
        lines[0].push(ss.handL);
        lines[1].push(ss.handR);
        lines[2].push(lerp3(ss.handL, ss.elbowL, 0.4));
        lines[3].push(lerp3(ss.handR, ss.elbowR, 0.4));
      }
      smearAlong(st, put, lines, thin, [RIME[1], RIME[2], RIME[3], RIME[4]], PINK[1]);
    }
  } else if (m.move === RETCH_NAME) {
    const mouth = mouthOf(s);
    // black water dribbling from its mouth as it heaves, drops falling to the floor
    if (t > 0.25 && t < RETCH_HIT) {
      mote(mouth, BOG[2], 2);
      for (let i = 0; i < 5; i++) {
        const life = 0.26;
        const u = ((t - 0.25) / life + i / 5) % 1;
        const z = mouth[2] - (mouth[2] - 0.6) * u * u;
        mote([mouth[0] + 0.6 * (hash(i, Math.floor((t - 0.25) / life + i / 5), 1811) - 0.5) * 3, mouth[1] + (i % 2 ? 1 : -1) * 0.6, Math.max(0.6, z)], u < 0.5 ? BOG[3] : BOG[1], 2);
      }
      // (its belly heaving: a gurgle, bubbles of the bog at its lips)
      for (let i = 0; i < 3; i++) if (hash(i, fl, 1813) < 0.5) mote(add(mouth, [1 + hash(i, fl, 1815) * 2, (hash(i, fl, 1817) - 0.5) * 3, 0.5 + hash(i, fl, 1819)]), BOG[4], 1);
    }
    // the gush out of its mouth, thick and black, widening (its first stretch: the rest is laid on the floor's picture)
    const k = pourOf(t);
    if (k > 0) {
      const dir: V3 = [Math.cos(0.5) * 1, 0, -Math.sin(0.5)];
      const n = Math.round(110 * k);
      for (let i = 0; i < n; i++) {
        const u = ((t * 3.2 + hash(i, 1, 1821)) % 1) * (0.4 + 0.6 * k);
        const along = 2 + 30 * u;
        const w = (0.6 + 6 * u) * Math.sqrt(hash(i, 3, 1821));
        const a = hash(i, 2, 1821) * TAU;
        const p = add(add(mouth, mul(dir, along)), [0, Math.cos(a) * w, Math.sin(a) * w * 0.6 - 12 * u * u]);
        if (p[2] < 0.6) continue;
        mote(p, i % 9 === 0 ? WEEDY[2] : i % 5 === 0 ? '#7a6a40' : i % 3 === 0 ? BOG[4] : i % 2 ? BOG[1] : BOG[3], u < 0.6 ? 2 : 1);
      }
    }
    if (RETCH_SMEARED(t)) {
      const thin = Math.abs(t - RETCH_HIT - FR) < 1e-6;
      const lines: V3[][] = [[], [], []];
      for (let i = 0; i <= 8; i++) {
        const u = Math.min(t, RETCH_HIT) - (FR * 1.3 * i) / 8;
        const ss = skeletonAt(FROST_DROWNED, 'retch', u);
        lines[0].push(mouthOf(ss));
        lines[1].push(add(ss.head, mul(ss.face[2], 5)));
        lines[2].push(add(ss.head, mul(ss.face[0], -4)));
      }
      smearAlong(st, put, lines, thin, [BOG[2], BOG[4], '#8a8058', '#d8d0b0'], FLAME[2]);
    }
  }
  return bits;
}

const DR_CANVAS2 = { w: 220, h: 200, ax: 104, ay: 150 } as const;
/** THE DROWNED WITH ITS BOG RETCH AND ITS FROST GRAB (DROWNED_RETCH): the game's own in all but these two. */
export const FROST_DROWNED: Mob = {
  ...DROWNED,
  id: 'drownedRetch',
  attack: { name: GRAB_NAME, motion: { keys: grabKeys(), hit: GRAB_HIT }, rest: DROWNED_REST, glint: grabGlint } as MobMove,
  hit: GRAB_HIT,
  warn: GRAB9.up,
  more: { ...(DROWNED.more ?? {}), retch: { name: RETCH_NAME, motion: { keys: retchKeys(), hit: RETCH_HIT }, rest: DROWNED_REST, glint: retchGlint } as MobMove },
  canvas: DR_CANVAS2,
  aura: { ...DROWNED.aura, x: DROWNED.aura.x - DROWNED_CANVAS.ax + DR_CANVAS2.ax, y: DROWNED.aura.y - DROWNED_CANVAS.ay + DR_CANVAS2.ay },
  bits: (st, m) => [...DROWNED.bits(st, m), ...moreBits(st, m)],
};
/** As the game holds a monster: the game's own Drowned (rising, its stand, its shamble, struck, its death: its own pictures), its grab by Movement 9 with the frost as its `attack`, the bog retch as `moves.retch`. */
export function makeFrostDrownedArt(pace = DROWNED.pace): ActorArt {
  const art = makeDrownedArt3(pace);
  for (const [set, view] of [[art.front, 'front'], [art.back, 'back']] as const) {
    const own = mobSet(FROST_DROWNED, view, pace);
    set.attack = own.attack;
    if (set.clips && own.clips) {
      set.clips.attack = own.clips.attack;
      set.clips.moves = { ...(set.clips.moves ?? {}), retch: (own.clips.moves ?? {}).retch };
    }
  }
  return art;
}

// =============================================================================================
// THE CONE, THE GUSH AND THE SLICK; THE RIME (laid on the floor's picture, from in front or behind: its anchor the Drowned's floor point)

/** The canvas the cone is laid on (its anchor where the Drowned stands, the cone before it). */
export const SLICK_CANVAS = { w: 300, h: 240, ax: 90, ay: 120 } as const;
/** Whether a point `x` tiles before the Drowned and `y` aside is in its cone. */
export const inCone = (x: number, y: number, long: number = SLICK.long): boolean => {
  const d = Math.hypot(x, y);
  return x > 0 && d >= SLICK.from && d <= long && Math.abs(Math.atan2(y, x)) <= (SLICK.ang * Math.PI) / 180;
};
/** The slick's ragged edge, how far out along a way `a` (radians from straight before it) it reaches (tiles). */
const edgeOf = (a: number, t: number): number => SLICK.long * (1 + 0.07 * Math.sin(a * 9 + 1.1) + 0.05 * Math.sin(a * 17 + 0.3) + 0.02 * Math.sin(a * 23 + t));
/**
 * THE CONE ON THE FLOOR, `t` seconds after it retches (`t` < 0: before): from `-mark` its edges marked in the enemy's pink, filling as
 * it heaves; as the gush comes down (`lands`), the slick spreading out over it in `spread`; then lying, black and oily, the fen's weed in
 * it, bubbles rising and popping, a dull sheen drifting on it, its edge dotted with the enemy's pink; shrinking over its last `fade`;
 * gone at `stays`.
 */
export function slickPainted(t: number, view: GameView = 'front', mark: number = RETCH_HIT - RETCH.mark): { px: Px; lights: Light[] } {
  const C = SLICK_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < -mark || t > SLICK.stays + SLICK.lands) return { px, lights };
  const st = stage(view, C.ax, C.ay, C);
  const at = (x: number, y: number): readonly [number, number] => st.at([x * TILE3, y * TILE3, 0]);
  const dot2 = pen(px);
  const under = pen(px, true);
  const A = (SLICK.ang * Math.PI) / 180;
  if (t < SLICK.lands) {
    // (the cone marked: its two sides and its far edge, dashed, laid out as it heaves)
    const k = clamp01((t + mark) / Math.min(0.35, mark));
    for (const sd of [-1, 1]) for (let r = SLICK.from; r <= SLICK.from + (SLICK.long - SLICK.from) * k; r += 0.05) {
      if (Math.round(r / 0.05) % 5 >= 3) continue;
      const [x, y] = at(Math.cos(A * sd) * r, Math.sin(A * sd) * r);
      under(x, y, PINK[1]);
      under(x + 1, y, PINK[0]);
      under(x, y + 1, PINK[2]);
    }
    for (let a = -A; a <= A; a += 0.025) {
      if (Math.round(a / 0.025) % 5 >= 3 || k < 0.98) continue;
      const [x, y] = at(Math.cos(a) * SLICK.long, Math.sin(a) * SLICK.long);
      under(x, y, PINK[1]);
      under(x + 1, y, PINK[0]);
      under(x, y + 1, PINK[2]);
    }
    return { px, lights };
  }
  const s = t - SLICK.lands;
  const grow = 1 - (1 - clamp01(s / SLICK.spread)) ** 2;
  const shrink = 1 - smooth((s - (SLICK.stays - SLICK.fade)) / SLICK.fade);
  const reach = (a: number): number => SLICK.from * 0.6 + (edgeOf(a, s) - SLICK.from * 0.6) * grow * (0.2 + 0.8 * shrink);
  const side = A * (1.05 + 0.04 * Math.sin(s));
  for (let Y = 0; Y < C.h; Y++) {
    for (let X = 0; X < C.w; X++) {
      // (the floor point under this pixel, in the Drowned's own way: tiles before it and to its left)
      const dx = X + 0.5 - C.ax;
      const dy = Y + 0.5 - C.ay;
      const fx = (dx / 32 + dy / 16) / 2;
      const fy = (dy / 16 - dx / 32) / 2;
      const x = view === 'front' ? fx : -fy;
      const y = view === 'front' ? -fy : fx;
      const d = Math.hypot(x, y);
      const a = Math.atan2(y, x);
      const wob = 1 + 0.06 * Math.sin(d * 7 + 0.7) + 0.04 * Math.sin(d * 13);
      if (x <= 0 || d < SLICK.from * 0.6 || Math.abs(a) > side * wob || d > reach(a)) continue;
      const e = Math.max(d / reach(a), Math.abs(a) / (side * wob));
      const clot = hash(Math.floor((x + s * 0.04) * 7), Math.floor(y * 7), 1831);
      const sheen = e < 0.8 && hash(Math.floor(x * 2.2 + 0.4 * Math.sin(y * 3 + s * 0.5)), Math.floor(y * 2.6 + 0.3 * Math.sin(x * 2)), 1835) > 0.86 && hash(X, Y, 1837) > 0.35;
      const weed = clot > 0.9 && e < 0.85;
      dot2(X, Y, e > 0.93 ? BOG[0] : sheen ? (hash(X, Y, 1839) > 0.7 ? BOG[4] : BOG[3]) : weed ? WEEDY[(X + Y) % 3] : clot > 0.7 ? BOG[2] : clot < 0.25 ? BOG[0] : BOG[1]);
    }
  }
  // its edge dotted with the enemy's pink, so that where it lies is seen
  if (shrink > 0.3 && grow > 0.9) {
    for (let a = -side; a <= side; a += 0.02) {
      if (Math.round(a / 0.02) % 4 >= 2) continue;
      const r = reach(a) * 1.02;
      const [x, y] = at(Math.cos(a) * r, Math.sin(a) * r);
      under(x, y, PINK[0]);
      under(x, y + 1, PINK[2]);
    }
    for (const sd of [-1, 1]) for (let r = SLICK.from; r <= reach(side * sd); r += 0.05) {
      if (Math.round(r / 0.05) % 4 >= 2) continue;
      const [x, y] = at(Math.cos(side * 1.03 * sd) * r, Math.sin(side * 1.03 * sd) * r);
      under(x, y, PINK[0]);
      under(x, y + 1, PINK[2]);
    }
  }
  // bubbles rising in it and popping
  for (let i = 0; i < 30; i++) {
    const life = 0.5 + 0.4 * hash(i, 1, 1833);
    const cyc = s / life + hash(i, 2, 1833);
    const u = cyc % 1;
    const n = Math.floor(cyc);
    const a = (hash(i, 3, 1833 + n) - 0.5) * 2 * A * 0.9;
    const d = SLICK.from + (reach(a) - SLICK.from) * Math.sqrt(hash(i, 4, 1833 + n)) * 0.9;
    const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
    if (u < 0.75) blob(dot2, x, y, 0.6 + 1.4 * u, u < 0.5 ? BOG[3] : BOG[4]);
    else for (const [ox, oy] of [[-2, 0], [2, 0], [0, -1]] as const) dot2(x + ox, y + oy, BOG[4]);
  }
  return { px, lights };
}
/** THE GUSH IN THE AIR, `t` seconds after it retches (gone by `lands` + 0.35): black bog water flung out of its mouth in arcs over the cone, and splashing down on it; from in front or behind ('behind' the half beyond its floor point, 'before' the near half). */
export function gushPainted(t: number, view: GameView = 'front', side: 'behind' | 'before' | 'all' = 'all'): { px: Px; lights: Light[] } {
  const C = SLICK_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < 0 || t > SLICK.lands + 0.4) return { px, lights };
  const st = stage(view, C.ax, C.ay, C);
  const dot2 = pen(px);
  const A = (SLICK.ang * Math.PI) / 180;
  const s0 = skeletonAt(FROST_DROWNED, 'retch', RETCH_HIT);
  const m = mouthOf(s0);
  for (let i = 0; i < 220; i++) {
    const a = (hash(i, 1, 1841) - 0.5) * 2 * A * 0.95;
    const far = (SLICK.from + (SLICK.long - SLICK.from) * (0.15 + 0.85 * hash(i, 2, 1841))) * TILE3;
    const go = 0.08 + 0.18 * hash(i, 3, 1841);
    const u = (t - hash(i, 4, 1841) * 0.08) / go;
    if (u < 0) continue;
    const end: V3 = [Math.cos(a) * far, Math.sin(a) * far, 0];
    if (u < 1) {
      // (in flight: an arc from its mouth to where it comes down)
      const p = lerp3(m, end, u);
      const z = m[2] * (1 - u) + 24 * Math.sin(Math.PI * u) * hash(i, 5, 1841);
      const [x, y] = st.at([p[0], p[1], z]);
      const [, fy] = st.at([p[0], p[1], 0]);
      if (side !== 'all' && (fy > C.ay) !== (side === 'before')) continue;
      const big = i % 3 === 0 ? 3 : 2;
      for (let q = 0; q < big * big; q++) dot2(x + (q % big), y + Math.floor(q / big), q === 0 ? (i % 7 === 0 ? WEEDY[2] : '#7a6a40') : i % 4 === 0 ? BOG[3] : q % 2 ? BOG[1] : BOG[2]);
    } else if (u < 1 + 0.15 / go) {
      // (splashing where it comes down)
      const k = (u - 1) * go / 0.15;
      const [x, y] = st.at(end);
      if (side !== 'all' && (y > C.ay) !== (side === 'before')) continue;
      for (const sd of [-1, 1]) dot2(x + sd * (1 + 4 * k), y - 3 * Math.sin(Math.PI * k), k < 0.5 ? BOG[4] : BOG[2]);
    }
  }
  return { px, lights };
}
/** The rime's canvas (its anchor where it grips: `FROST.at` before the Drowned). */
export const RIME_CANVAS = { w: 160, h: 120, ax: 80, ay: 72 } as const;
/**
 * THE RIME, `t` seconds after its hands close (where they close): frost racing out over the floor to `FROST.r` in 0.12 s, in feathered
 * crystals, grey-white, its edge the enemy's pink; ice shooting up round his feet ('air': a ring of jagged shards, pale, their edge
 * pink), standing while he is held (`FROST.hold`), then shattering, its shards flung; the rime on the floor fading by `FROST.seen`.
 */
export function rimePainted(t: number, layer: 'floor' | 'air', side: 'behind' | 'before' | 'all' = 'all'): { px: Px; lights: Light[] } {
  const C = RIME_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < 0 || t > FROST.seen) return { px, lights };
  const dot2 = pen(px);
  const under = pen(px, true);
  const at = (x: number, y: number): [number, number] => [C.ax + 32 * (x - y), C.ay + 16 * (x + y)];
  if (layer === 'floor') {
    const grow = 1 - (1 - clamp01(t / 0.12)) ** 2;
    const fade = 1 - smooth((t - (FROST.seen - 0.5)) / 0.5);
    const r = FROST.r * grow;
    // (crystals feathering out from the middle: branching lines)
    for (let b = 0; b < 16; b++) {
      const a0 = (b / 16) * TAU + hash(b, 1, 1851) * 0.3;
      const L = r * (0.75 + 0.25 * hash(b, 2, 1851));
      for (let q = 0; q < 40; q++) {
        const u = q / 40;
        if (u * FROST.r > L) break;
        if (hash(b, q, 1853) > fade) continue;
        const a = a0 + 0.12 * Math.sin(u * 9 + b);
        const [x, y] = at(Math.cos(a) * u * FROST.r, Math.sin(a) * u * FROST.r);
        dot2(x, y, u < 0.3 ? RIME[4] : u < 0.7 ? RIME[3] : RIME[2]);
        if (q % 6 === 3) for (const sd of [-1, 1]) for (let j = 1; j < 5; j++) {
          const [x2, y2] = at(Math.cos(a + sd * 0.5) * (u * FROST.r + j * 0.02) - Math.cos(a) * 0, Math.sin(a + sd * 0.5) * (u * FROST.r + j * 0.02));
          under(x2, y2, RIME[2]);
        }
      }
    }
    // (a crust of it under him, and its edge in the enemy's pink)
    for (let i = 0; i < 140; i++) {
      if (hash(i, 3, 1855) > fade) continue;
      const a = hash(i, 1, 1855) * TAU;
      const d = Math.sqrt(hash(i, 2, 1855)) * r * 0.55;
      const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
      under(x, y, i % 3 ? RIME[3] : RIME[1]);
    }
    if (grow > 0.9 && fade > 0.5) markRing(px, C.ax, C.ay, FROST.r * 1.02, 1, PINK, 0.2);
    return { px, lights };
  }
  // the ice round his feet: jagged shards shot up, standing, shattering
  const up = t < 0.08 ? 1 - (1 - t / 0.08) ** 2 : 1;
  const broke = t - FROST.hold;
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU + 0.3 * hash(i, 1, 1861);
    const d = 0.18 + 0.12 * hash(i, 2, 1861);
    const [bx, by] = at(Math.cos(a) * d, Math.sin(a) * d);
    if (side !== 'all' && (by > C.ay) !== (side === 'before')) continue;
    const tall = (10 + 9 * hash(i, 3, 1861)) * up;
    const lean = Math.cos(a) * 3;
    if (broke < 0) {
      // (a shard: a narrow wedge leaning out, its lit face and its shade, its edge pink)
      const w = 3 + Math.round(2 * hash(i, 4, 1861));
      for (let h = 0; h < tall; h++) {
        const ww = Math.max(0, Math.round(w * (1 - h / tall)));
        const cx = bx + (lean * h) / Math.max(1, tall);
        for (let x = -ww; x <= ww; x++) dot2(cx + x, by - h, x < 0 ? RIME[3] : x === 0 ? RIME[4] : RIME[2]);
        dot2(cx - ww - 1, by - h, PINK[0]);
        dot2(cx + ww + 1, by - h, PINK[2]);
      }
      dot2(bx + lean, by - tall - 1, '#ffffff');
    } else if (broke < 0.3) {
      // (shattering: its pieces flung out and falling)
      for (let j = 0; j < 5; j++) {
        const aa = a + (hash(i, j, 1863) - 0.5) * 1.6;
        const sp = 30 + 30 * hash(i, j + 5, 1863);
        const x = bx + Math.cos(aa) * sp * broke;
        const y = by - tall * (j / 5) + Math.sin(aa) * sp * broke * 0.5 - 50 * broke + 160 * broke * broke;
        if (hash(i, j + 9, 1863) < broke / 0.3) continue;
        dot2(x, y, j % 2 ? RIME[4] : RIME[3]);
        dot2(x + 1, y, j % 3 ? RIME[2] : PINK[1]);
      }
    }
  }
  if (broke < 0) lights.push({ x: C.ax, y: C.ay - 8, r: 34, color: RIME[3], a: 0.15 });
  return { px, lights };
}
/** Where its hands close (tiles before it, on its floor). */
export const gripFrom = (): number => handsOf(skeletonAt(FROST_DROWNED, 'attack', GRAB_HIT))[0] / TILE3;
