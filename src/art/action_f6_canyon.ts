// FLOOR 8'S MOBS, MORE ACTION: THE CANYON SCORPION AND THE DUST DEVIL (the art chat's helper, 1 Nov 2026;
// docs/mockups/action_f6/README.md). A MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE. The scorpion's ACID SPIT in place of its tail
// strike and its pincer snap made by Movement 9 (SCORPION_SPIT, off); the dust devil's TWISTER in place of its lash (DEVIL_TWISTER,
// off). Each on the game's own figure (art/canyon_scorpions.ts, art/dust_devils.ts), all it keeps frame for frame its own.
//
// His review of every enemy for more action, 31 Oct 2026, each offered and answered “Yes (Recommended)”:
//   THE CANYON SCORPION: “Acid spit, in place of the sting: arcs its venom high. It splashes down on where you stood into a hissing
//   acid pool that stays several seconds.” (his ask: “something that, like, takes away space”). Its snap kept, by Movement 9.
//   THE DUST DEVIL: “Twister: spins up into a sand twister that wanders the floor for a few seconds, dragging you in and scouring you
//   while you're in it.” and, his pick for LIGHTNING, “The Dust Devil, 8” (offered as: the twister crackles with static and throws
//   lightning out of it). A small mob: this one attack (his rule).
// Under his Movement 9 (24 Oct: “Like the wind up and wind down are big but the actual punch is lightning quick”; 28 Oct: “And bigger
// AOE to compensate for the extra time the player gets to evade”).
//
// THE SPIT: it crouches and cocks its tail up high, its pincers raised, the venom oozing out of its sting and dripping (the warning),
// HELD, the tail rattling; in TWO FRAMES its tail flings over its head and the venom is spat, smeared; its tail goes on down and it
// settles. The glob of acid goes up HIGH and comes down where you stood (its shadow growing there, the reach of its splash marked),
// and splashes into A POOL OF ACID 1.4 tiles round that hisses and smokes for four and a half seconds: floor taken away. Acid
// green-yellow: never the friend's cyan. THE SNAP: reared, its pincers spread wide and HELD, then shut in TWO FRAMES as it lunges,
// smeared, further than before. THE TWISTER: it spins faster and faster, squatting, sand sucked in off the floor round it, static
// crackling over it, HELD; in TWO FRAMES it bursts up into a sand twister taller than the knight, smeared; for 3.5 seconds the
// twister spins on the floor (the game carries it as it wanders), the sand swirling in round it showing how far it drags you,
// lightning crawling up it and thrown out of it onto the floor round it (each place crackling a moment first); then it collapses,
// its sand pouring out of it, back into the little dust devil.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { hash, lazyFrames, toSprite } from './kit';
import type { Painted } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView } from './skin';
import type { V3 } from './skeleton';
import { BODY_Z, HAND, SC_AURA, SC_CANVAS, SC_STAND, STAND0, TAIL_COCKED, TAIL_REST, backOut, dust, laid as scLaid, lerpV, makeScorpionArt, mixN, scorpionBits, sm, stingTip, worldOf } from './canyon_scorpions';
import type { ScPose } from './canyon_scorpions';
import { poseOf as scorpionPoseOf } from './canyon_scorpions';
import { BELL_UP, DD_AURA, DD_CANVAS, DD_HIGH, DD_STAND, DUST, GRIT, LOOK, airRing, devilBits, gritOf, laid as ddLaid, makeDevilArt, middleAt, girthAt, stood } from './dust_devils';
import type { DdPose } from './dust_devils';
import { BOLT, FR, TAU, blob, clamp01, f, layBolt, layShadow, layStrike, markRing, pen, smooth, tileAt } from './action_f6_fx';
import { bolt3 } from './action_f6_cult';

/** THE SWITCHES, OFF. With one on, the bestiary's figure is made by the maker below. */
export const SCORPION_SPIT = { on: false };
export const DEVIL_TWISTER = { on: false };

/** The acid: deep, dark green, green, green-yellow, near white-yellow (its heart and its bubbles). Never cyan. */
export const ACID = ['#1e3a08', '#3e6a0c', '#7cb414', '#b8e830', '#f0ff8a'] as const;
/** Its fumes. */
const FUME = ['#5a6a2a', '#8a9a4a', '#c0cc7a'] as const;

// =============================================================================================
// THE SCORPION: ITS SNAP BY MOVEMENT 9

/**
 * THE SNAP'S NUMBERS (seconds from its start; tiles):
 *   wind-up  reared, its pincers spread wide and back by 0.25 s; HELD, trembling, to 0.5 s
 *   strike   TWO FRAMES, smeared: lunging in (frame 16), shut (frame 17, 0.567 s: the clip's `hit`)
 *   wind-down  squeezing on to 0.75 s; back on its stand by 1.0 s, overshooting a little and settling
 *   reach    a hero in the strip `fwd` before it and `half` to either side is struck (the game's: 0.2 to 1.7, 0.55)
 */
export const SNAP_HIT = f(17);
export const SNAP_STRIKE = [f(15), f(17)] as const;
export const SNAP_SMEARED = (t: number): boolean => t > SNAP_STRIKE[0] + 1e-6 && t <= SNAP_STRIKE[1] + FR + 1e-6;
export const SNAP9 = { hit: SNAP_HIT, strike: SNAP_STRIKE, long: 1.0, fwd: [0.2, 2.0] as const, half: 0.8 } as const;
const WIDE: V3 = [6, 26, 13];
const SHUT: V3 = [42, 5, 2];
const ON: V3 = [49, 3, 2.5];
const pair = (v: V3): [V3, V3] => [[v[0], v[1], v[2]], [v[0], -v[1], v[2]]];
/** The snap's own pose at `t`, before its smear and dust. */
function snapBody(t: number): ScPose {
  const P: ScPose = { ...STAND0, feet: STAND0.feet, hands: [STAND0.hands[0], STAND0.hands[1]], pinch: [STAND0.pinch[0], STAND0.pinch[1]], chips: [], flares: [] };
  const tremble = (k: number): number => 0.7 * Math.sin(t * 170 + k);
  const [s0, s1] = SNAP_STRIKE;
  const reared = (k: number): void => {
    P.z = BODY_Z + 5 * k;
    P.x = -4 * k;
    P.pitch = -15 * k;
    P.tail = mixN(STAND0.tail, TAIL_REST.map((d) => d + 8), k);
  };
  if (t < 0.25) {
    const k = sm(t / 0.25);
    const w = k;
    P.hands = pair(lerpV(HAND, WIDE, w));
    P.pinch = [STAND0.pinch[0] + (1 - STAND0.pinch[0]) * w, STAND0.pinch[1] + (1 - STAND0.pinch[1]) * w];
    reared(k);
    P.sting = 1 + 0.4 * k;
  } else if (t < s0 + 1e-6) {
    const h = pair(WIDE);
    P.hands = [[h[0][0], h[0][1] + tremble(1), h[0][2] + tremble(2)], [h[1][0], h[1][1] - tremble(3), h[1][2] + tremble(4)]];
    P.pinch = [1, 1];
    reared(1);
    P.sting = 1.4;
  } else if (t < s1 + 1e-6) {
    // (the strike: it lunges, its pincers swung in and shut)
    const k = (t - s0) / (s1 - s0);
    P.hands = pair(lerpV(WIDE, SHUT, k));
    P.pinch = [1 - k, 1 - k];
    P.x = -4 + 16 * k;
    P.z = BODY_Z + 5 - 6.5 * k;
    P.pitch = -15 + 21 * k;
    P.tail = mixN(TAIL_REST.map((d) => d + 8), TAIL_REST.map((d, i) => d - 4 * i), k);
    P.sting = 1.4;
  } else if (t < 0.75) {
    const k = sm((t - s1) / (0.75 - s1));
    P.hands = pair(lerpV(SHUT, ON, k));
    P.pinch = [0, 0];
    P.x = 12 + 3 * k;
    P.z = BODY_Z - 1.5 - 0.5 * k;
    P.pitch = 6 + 1 * k;
    P.tail = TAIL_REST.map((d, i) => d - 4 * i - 2 * k * i);
    P.sting = 1.2;
  } else {
    const u = (t - 0.75) / (SNAP9.long - 0.75);
    const k = sm(u);
    const o = k;
    const h = pair(lerpV(ON, HAND, o));
    const lift = 4 * Math.sin(Math.PI * k);
    P.hands = [[h[0][0], h[0][1], h[0][2] + lift], [h[1][0], h[1][1], h[1][2] + lift]];
    P.pinch = [STAND0.pinch[0] * k, STAND0.pinch[1] * k];
    P.x = 15 * (1 - o);
    P.z = BODY_Z - 2 + 2 * o + (STAND0.z - BODY_Z) * k;
    P.pitch = 7 * (1 - o);
    P.tail = mixN(TAIL_REST.map((d, i) => d - 6 * i), STAND0.tail, o);
    P.sting = 1.2 - 0.2 * k + (STAND0.sting - 1) * k;
  }
  return P;
}
/** Where a pincer's tip is, its own pose at `t`: its fingers' end (the floor's own grid). */
function pincerTip(P: ScPose, k: 0 | 1): V3 {
  const h = P.hands[k];
  return worldOf(P, [h[0] + 9, h[1] * 0.85, h[2]]);
}
/** THE SNAP: its pose, the dust it kicks up, the click where its fingers meet, and its smear. */
export function snap9Pose(t: number): ScPose {
  const P = snapBody(t);
  P.chips = [...dust([16, 0, 0], SNAP_STRIKE[0], t, 16, 61, 26)];
  if (t >= SNAP_HIT && t < SNAP_HIT + 0.07) {
    const at = worldOf(P, [SHUT[0] + 8, 0, SHUT[2] + 1]);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU;
      const r = 3 + 8 * ((t - SNAP_HIT) / 0.07);
      P.chips.push([[at[0] + Math.cos(a) * r * 0.6, at[1] + Math.sin(a) * r, Math.max(0.6, at[2] + Math.cos(a) * r * 0.5)], i % 2 ? '#fff0d8' : '#ffd0a0', 2]);
    }
  }
  if (SNAP_SMEARED(t)) {
    const thin = Math.abs(t - SNAP_HIT - FR) < 1e-6;
    for (const k of [0, 1] as const) {
      for (let i = 8; i >= 1; i--) {
        const age = i / 8;
        if (thin && age > 0.45) continue;
        const u = Math.min(t, SNAP_HIT) - (FR * 1.2 * i) / 8;
        const a = pincerTip(snapBody(u), k);
        const b = pincerTip(snapBody(u + (FR * 1.2) / 8), k);
        for (let j = 0; j < 4; j++) {
          if (age > 0.55 && j % 2) continue;
          P.chips.push([lerpV(a, b, j / 4), age > 0.75 ? '#682a26' : age > 0.45 ? '#c04818' : age > 0.2 ? '#f07a2a' : '#fff0d8', !thin && age < 0.35 ? 2 : 1]);
        }
      }
    }
  }
  return P;
}

// =============================================================================================
// THE SCORPION: ITS ACID SPIT

/**
 * THE SPIT'S NUMBERS (seconds from its start):
 *   wind-up  crouched, its tail cocked up high and its pincers raised by 0.3 s; HELD, the tail rattling, the venom oozing out of its
 *            sting and dripping, to 0.8 s (0.5 s)
 *   strike   TWO FRAMES, smeared: its tail flung over its head (frame 25), the venom spat (frame 26, 0.867 s: the clip's `hit`)
 *   wind-down  its tail on down before it, its body pitched after it, to 1.15 s; back on its stand by 1.6 s
 */
export const SPIT_HIT = f(26);
export const SPIT_STRIKE = [f(24), f(26)] as const;
export const SPIT_SMEARED = (t: number): boolean => t > SPIT_STRIKE[0] + 1e-6 && t <= SPIT_STRIKE[1] + FR + 1e-6;
const SPIT_LONG = 1.6;
const TAIL_FLICK = [100, 74, 44, 12, -22];
const TAIL_ON = [84, 54, 20, -14, -50];
const RAISED: V3 = [20, 15, 10];
function spitBody(t: number): ScPose {
  const P: ScPose = { ...STAND0, feet: STAND0.feet, chips: [], flares: [] };
  const [s0, s1] = SPIT_STRIKE;
  const rattle = (i: number): number => (t > 0.3 && t < s0 ? 2.6 * Math.sin(t * 240 + i * 1.3) * (i / 4) : 0);
  if (t < 0.3) {
    const k = sm(t / 0.3);
    P.tail = mixN(STAND0.tail, TAIL_COCKED, k);
    P.tailYaw = STAND0.tailYaw * (1 - k);
    P.z = BODY_Z - 1.5 * k;
    P.x = -5 * k;
    P.pitch = -6 * k;
    P.hands = pair(lerpV(HAND, RAISED, k));
    P.pinch = [STAND0.pinch[0] + (1 - STAND0.pinch[0]) * k, STAND0.pinch[1] + (1 - STAND0.pinch[1]) * k];
    P.sting = 1 + 0.6 * k;
  } else if (t < s0 + 1e-6) {
    P.tail = TAIL_COCKED.map((d, i) => d + rattle(i));
    P.tailYaw = 0;
    P.z = BODY_Z - 1.5;
    P.x = -5;
    P.pitch = -6;
    P.hands = pair(RAISED);
    P.pinch = [1, 1];
    P.sting = 1.6 + 0.2 * Math.sin(t * 90);
  } else if (t < s1 + 1e-6) {
    // (the fling: the tail whipped over its head as its body pitches in under it)
    const k = (t - s0) / (s1 - s0);
    P.tail = mixN(TAIL_COCKED, TAIL_FLICK, k);
    P.tailYaw = 0;
    P.z = BODY_Z - 1.5 - 1.0 * k;
    P.x = -5 + 9 * k;
    P.pitch = -6 + 9 * k;
    P.hands = pair(lerpV(RAISED, [23, 15, 4], k));
    P.pinch = [1, 1];
    P.sting = 1.8;
  } else if (t < 1.15) {
    const k = sm((t - s1) / (1.15 - s1));
    P.tail = mixN(TAIL_FLICK, TAIL_ON, k);
    P.tailYaw = 0;
    P.z = BODY_Z - 2.5 - 0.5 * k;
    P.x = 4 + 4 * k;
    P.pitch = 3 + 3 * k;
    P.hands = pair([23, 15, 4]);
    P.pinch = [1, 1];
    P.sting = 1.8 - 0.4 * k;
  } else {
    const u = (t - 1.15) / (SPIT_LONG - 1.15);
    const o = backOut(u);
    const k = sm(u);
    P.tail = mixN(TAIL_ON, STAND0.tail, o);
    P.tailYaw = STAND0.tailYaw * k;
    P.z = BODY_Z - 3 + (STAND0.z - BODY_Z + 3) * o;
    P.x = 8 * (1 - o);
    P.pitch = 6 * (1 - o);
    P.hands = [lerpV([23, 15, 4], STAND0.hands[0], k), lerpV([23, -15, 4], STAND0.hands[1], k)];
    P.pinch = [1 + (STAND0.pinch[0] - 1) * k, 1 + (STAND0.pinch[1] - 1) * k];
    P.sting = 1.4 + (STAND0.sting - 1.4) * k;
  }
  return P;
}
/** THE SPIT: its pose; the acid oozing and dripping off its sting as it holds; the glob as it is spat; its smear. */
export function spitPose(t: number): ScPose {
  const P = spitBody(t);
  const tip = stingTip(P);
  const [s0] = SPIT_STRIKE;
  // (the venom welling out of its sting, a bead of it growing at the barb, drops falling from it to the rock)
  if (t > 0.2 && t < SPIT_HIT) {
    const k = clamp01((t - 0.2) / 0.4);
    P.chips.push([tip, ACID[4], 2]);
    P.chips.push([[tip[0], tip[1] + 1, tip[2] - 1], ACID[3], 2]);
    if (k > 0.5) P.chips.push([[tip[0] + 1, tip[1] - 1, tip[2] - 2], ACID[2], 2]);
    for (let i = 0; i < 4; i++) {
      const life = 0.22;
      const u = ((t - 0.3) / life + i / 4) % 1;
      if (t < 0.3 || t > s0) continue;
      const z = tip[2] - 2 - (tip[2] - 1) * u * u;
      P.chips.push([[tip[0] + (hash(i, Math.floor((t - 0.3) / life + i / 4), 1401) - 0.5) * 2, tip[1], Math.max(0.6, z)], u < 0.5 ? ACID[3] : ACID[2], 2]);
    }
    P.flares.push([tip, 12, 0.25 * k]);
  }
  // (the glob leaving its sting, a frame after the spit)
  if (t >= SPIT_HIT - 1e-6 && t < SPIT_HIT + FR + 1e-6) {
    const c: V3 = [tip[0] + 8, tip[1], tip[2] + 6];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU;
      P.chips.push([[c[0] + Math.cos(a) * 3, c[1] + Math.sin(a) * 3, c[2] + Math.sin(a * 2) * 2], i % 3 ? ACID[3] : ACID[4], 2]);
    }
  }
  if (SPIT_SMEARED(t)) {
    const thin = Math.abs(t - SPIT_HIT - FR) < 1e-6;
    for (let i = 8; i >= 1; i--) {
      const age = i / 8;
      if (thin && age > 0.45) continue;
      const u = Math.min(t, SPIT_HIT) - (FR * 1.2 * i) / 8;
      const a = stingTip(spitBody(u));
      const b = stingTip(spitBody(u + (FR * 1.2) / 8));
      for (let j = 0; j < 5; j++) {
        if (age > 0.55 && j % 2) continue;
        P.chips.push([lerpV(a, b, j / 5), age > 0.75 ? ACID[1] : age > 0.45 ? ACID[2] : age > 0.2 ? ACID[3] : ACID[4], !thin && age < 0.35 ? 2 : 1]);
      }
    }
  }
  return P;
}
/** Its pose for any move: its own but the snap (by Movement 9) and the spit. */
function scPose(which: string, t: number, own: (w: string, t: number) => ScPose): ScPose {
  if (which === 'attack') return snap9Pose(t);
  if (which === 'spit') return spitPose(t);
  return own(which, t);
}
/** One frame of the spitting scorpion: `attack` (the snap by Movement 9), `spit`; any other its own. */
export function spitScorpionPainted(which: string, t: number, view: GameView = 'front'): Painted {
  const st = stage(view, SC_CANVAS.ax, SC_CANVAS.ay, SC_CANVAS);
  const P = scPose(which, t, ownPose);
  const bits: Bit[] = [];
  scorpionBits(P, (part, piece, shape) => {
    bits.push({ part, piece, shape });
  });
  const lights = paintBits(st, bits, [P.x, P.y, P.z]);
  for (const [p, r, a] of P.flares) {
    const [x, y] = st.at(p);
    lights.push({ x, y, r, color: FLAME[2], a });
  }
  const px = st.whole(P.alive ? ENEMY_RIM : null);
  for (const [pt, col, size] of P.chips) scLaid(px, st, pt, col, size);
  return { px, lights };
}
const ownPose = (w: string, t: number): ScPose => scorpionPoseOf(w, t);
/** The spitting scorpion's pose at a moment (for the review). */
export function spitScorpionPose(which: string, t: number): ScPose {
  return scPose(which, t, ownPose);
}
const scFrame = (which: string, t: number, view: GameView): Sprite => toSprite(spitScorpionPainted(which, t, view), SC_AURA, SC_CANVAS.ax, SC_CANVAS.ay);
/** As the game holds a monster: the game's own scorpion (stand, scuttle, flinch, death: its own pictures), its snap by Movement 9 as its `attack`, the spit as `moves.spit` (in place of `sting`), the glob in flight as `moves.glob`. */
export function makeSpitScorpionArt(): ActorArt {
  const art = makeScorpionArt();
  for (const [set, view] of [[art.front, 'front'], [art.back, 'back']] as const) {
    const clip = (which: string, long: number, hit: number): Clip => ({ frames: lazyFrames(Math.round(long * 30) + 1, (i) => scFrame(which, i / 30, view)), fps: 30, hit });
    const attack = clip('attack', SNAP9.long, SNAP_HIT);
    set.attack = lazyFrames(3, (i) => attack.frames[[8, 16, 20][i]]);
    if (set.clips) {
      set.clips.attack = attack;
      set.clips.moves = { spit: clip('spit', SPIT_LONG, SPIT_HIT), glob: makeGlobArt(view) };
    }
  }
  return art;
}

/**
 * THE GLOB AND ITS POOL (seconds; tiles; game pixels):
 *   aim      where the hero stands as it spits: it comes down there (its shadow growing, the splash's reach marked in the enemy's pink)
 *   fly(d)   0.45 + 0.07 d seconds to a hero `d` tiles off (0.66 s at 3 tiles, 0.8 at 5)
 *   arc(d)   HIGH: it rises 40 + 6 d game pixels over the straight way (58 at 3 tiles; the knight is about 30)
 *   splash   a hero within `splash` tiles of where it comes down is struck as it splashes
 *   pool     THE POOL: `pool` tiles round, hissing, for `stays` seconds, shrinking over its last `fade`; a hero in it is burned by the
 *            acid, tick by tick (the rules')
 *   near, far  spat at a hero from 1.5 to 6 tiles off (the tail strike's: 1.3 to 2.6)
 */
export const SPIT = { hit: SPIT_HIT, strike: SPIT_STRIKE, long: SPIT_LONG, near: 1.5, far: 6, splash: 1.2, pool: 1.4, stays: 4.5, fade: 0.8 } as const;
export const spitFly = (d: number): number => 0.45 + 0.07 * d;
export const spitArc = (d: number): number => 40 + 6 * d;
/** Where the glob leaves its sting (its own lengths, on its floor). */
export const spitFrom = (): V3 => {
  const t = stingTip(spitBody(SPIT_HIT));
  return [t[0] + 8, t[1], t[2] + 6];
};
/** Where the glob is `u` (0 to 1) of its flight to a hero `d` tiles off: tiles along, game pixels up. */
export function globAt(u: number, d: number): [number, number] {
  const k = clamp01(u);
  const [x0, , z0] = spitFrom();
  const a0 = x0 / TILE3;
  return [a0 + (d - a0) * k, (z0 / 2) * (1 - k) + 2 * k + 4 * spitArc(d) * k * (1 - k)];
}
export const poolStrikes = (x: number, y: number, r: number = SPIT.pool): boolean => Math.hypot(x, y) <= r;
/** The glob in flight: a quivering ball of the acid, its heart near white, drops trailing, the enemy's edge round it (six frames). */
export const GLOB_CANVAS = { w: 40, h: 40, ax: 20, ay: 20 } as const;
export function paintGlob(frame: number): { px: Px; lights: Light[] } {
  const C = GLOB_CANVAS;
  const px = new Px(C.w, C.h);
  const dot2 = pen(px);
  const a = (frame / 6) * TAU;
  const rx = 6 + 1.2 * Math.sin(a);
  const ry = 6 - 1.2 * Math.sin(a);
  for (let j = -8; j <= 8; j++) {
    for (let i = -8; i <= 8; i++) {
      const e = (i / rx) ** 2 + (j / ry) ** 2;
      if (e > 1) continue;
      const lit = -(i + j) / 10;
      dot2(C.ax + i, C.ay + j, e > 0.75 ? ACID[1] : lit > 0.35 ? ACID[4] : lit > 0 ? ACID[3] : ACID[2]);
    }
  }
  // (drops trailing it, and the enemy's pink edge round it)
  for (let k = 0; k < 3; k++) dot2(C.ax - 9 - k * 3, C.ay + 2 + k + Math.round(Math.sin(a + k)), k ? ACID[2] : ACID[3]);
  const solid = Array.from({ length: C.w * C.h }, (_, i) => px.d[i * 4 + 3] === 255);
  for (let j = 2; j < C.h - 2; j++) for (let i = 2; i < C.w - 2; i++) {
    if (solid[j * C.w + i]) continue;
    if (solid[j * C.w + i + 1] || solid[j * C.w + i - 1] || solid[(j + 1) * C.w + i] || solid[(j - 1) * C.w + i]) px.set(i, j, ENEMY_RIM);
  }
  return { px, lights: [] };
}
export function makeGlobArt(view: GameView = 'front'): Clip {
  void view;
  return { frames: lazyFrames(6, (i) => toSprite(paintGlob(i), null, GLOB_CANVAS.ax, GLOB_CANVAS.ay)), fps: 18, loop: 0 };
}
/** The pool's canvas (its anchor where the glob comes down). */
export const POOL_CANVAS = { w: 240, h: 150, ax: 120, ay: 80 } as const;
/**
 * WHERE THE GLOB COMES DOWN, `t` seconds after it does: before (`t` < 0, from the spit): the splash's reach marked in the enemy's pink,
 * filling as it comes, and its shadow growing (`globShadow`). As it lands: THE SPLASH (a crown of acid thrown up and out, drops
 * flung to the splash's edge), and THE POOL spreading out to its edge in 0.15 s; then the pool lying, its edge eating at the rock,
 * hissing: bubbles rising and popping, fumes curling up off it; shrinking over its last `fade`; gone at `stays`. 'floor' the pool,
 * 'air' the splash and the fumes (by halves, `side`).
 */
export function poolPainted(t: number, layer: 'floor' | 'air', side: 'behind' | 'before' | 'all' = 'all', r: number = SPIT.pool, marked = 0.8): { px: Px; lights: Light[] } {
  const C = POOL_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < -marked || t > SPIT.stays) return { px, lights };
  const at = (x: number, y: number): [number, number] => tileAt(C.ax, C.ay, x, y);
  const dot2 = pen(px);
  const under = pen(px, true);
  const onSide = (y: number): boolean => side === 'all' || (y > C.ay) === (side === 'before');
  if (t < 0) {
    if (layer === 'floor') markRing(px, C.ax, C.ay, r, clamp01(1 + t / marked));
    return { px, lights };
  }
  const grow = 1 - (1 - clamp01(t / 0.15)) ** 2;
  const shrink = 1 - smooth((t - (SPIT.stays - SPIT.fade)) / SPIT.fade);
  const R = r * grow * (0.15 + 0.85 * shrink);
  const fr = Math.floor(t * 30 + 1e-6);
  if (layer === 'floor') {
    // the pool: an uneven edge (lobes, eating at the rock), dark at its rim, lit green toward its middle, a sheen across it
    const lobe = (a: number): number => 1 + 0.08 * Math.sin(a * 5 + 1.3) + 0.06 * Math.sin(a * 9 + 0.4) + 0.04 * Math.sin(a * 13 + t * 2);
    for (let Y = 0; Y < C.h; Y++) {
      for (let X = 0; X < C.w; X++) {
        const dx = X - C.ax;
        const dy = Y - C.ay;
        // (the floor point under it: tiles)
        const fx = (dx / 32 + dy / 16) / 2;
        const fy = (dy / 16 - dx / 32) / 2;
        const d = Math.hypot(fx, fy);
        const a = Math.atan2(fy, fx);
        const e = d / Math.max(0.01, R * lobe(a));
        if (e > 1) continue;
        // (mottled: darker clots in it, lighter where it is deep and lit, a glint of sheen drifting over it)
        const clot = hash(Math.floor((fx + t * 0.05) * 6), Math.floor(fy * 6), 1411);
        const sheen = e < 0.7 && Math.hypot(fx - 0.25 * R + 0.1 * Math.sin(t), fy + 0.2 * R) < 0.12 * R;
        dot2(X, Y, e > 0.9 ? ACID[0] : e > 0.75 ? ACID[1] : sheen ? ACID[4] : clot > 0.78 ? ACID[1] : clot < 0.22 && e < 0.6 ? ACID[3] : ACID[2]);
      }
    }
    // its rim smoking where it eats the rock: the enemy's pink dotted round it, so that where it lies is seen
    if (shrink > 0.3) markRing(px, C.ax, C.ay, R * 1.04, 1, ['#e0287a', '#ff7aa8', '#7a1058'], t * 0.3);
    // bubbles rising in it and popping
    for (let i = 0; i < 22; i++) {
      const life = 0.35 + 0.3 * hash(i, 1, 1413);
      const cyc = t / life + hash(i, 2, 1413);
      const u = cyc % 1;
      const n = Math.floor(cyc);
      const a = hash(i, 3, 1413 + n) * TAU;
      const d = Math.sqrt(hash(i, 4, 1413 + n)) * R * 0.85;
      const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
      if (u < 0.75) blob(dot2, x, y, 0.6 + 1.6 * u, u < 0.5 ? ACID[3] : ACID[4]);
      else for (const [ox, oy] of [[-2, 0], [2, 0], [0, -1], [0, 1]] as const) dot2(x + ox * 1.5, y + oy, ACID[4]);
    }
    lights.push({ x: C.ax, y: C.ay, r: 40 + 40 * R, color: FLAME[2], a: 0.08 * shrink });
    return { px, lights };
  }
  // --- the air: the splash, the fumes ---
  if (t < 0.4) {
    const k = t / 0.4;
    // (the crown thrown up round where it struck, and drops flung out to the splash's edge)
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * TAU + hash(i, 1, 1415) * 0.3;
      const d = SPIT.splash * (0.25 + 0.75 * hash(i, 2, 1415)) * (1 - (1 - k) * (1 - k));
      const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
      if (!onSide(y)) continue;
      const up = (10 + 26 * hash(i, 3, 1415)) * 4 * k * (1 - k);
      dot2(x, y - up, i % 3 ? ACID[3] : ACID[4]);
      if (i % 2) dot2(x + 1, y - up, ACID[2]);
    }
    if (t < 0.08 && side !== 'behind') blob(dot2, C.ax, C.ay - 4, 6 * (1 - t / 0.08) + 2, ACID[4]);
  }
  // (fumes curling up off it, pale green, thinning)
  for (let i = 0; i < 14; i++) {
    const life = 0.9 + 0.6 * hash(i, 1, 1417);
    const cyc = t / life + hash(i, 2, 1417);
    const u = cyc % 1;
    const n = Math.floor(cyc);
    const a = hash(i, 3, 1417 + n) * TAU;
    const d = Math.sqrt(hash(i, 4, 1417 + n)) * R * 0.8;
    const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
    if (!onSide(y) || shrink < 0.2) continue;
    if (hash(i, fr, 1419) < u * 0.7) continue;
    dot2(x + Math.sin(u * 6 + i) * 3, y - 3 - u * 22, u < 0.4 ? FUME[2] : u < 0.7 ? FUME[1] : FUME[0]);
  }
  return { px, lights };
}
/** The glob's shadow on the floor, `k` (0 to 1) of its flight: 50 by 26, anchored at its middle. */
export function globShadowPainted(k: number): { px: Px; lights: Light[] } {
  const px = new Px(50, 26);
  layShadow(px, 25, 13, k, 14);
  return { px, lights: [] };
}

// =============================================================================================
// THE DUST DEVIL: ITS TWISTER

/**
 * THE TWISTER'S NUMBERS (seconds from its start; tiles):
 *   wind-up  spinning up, faster and faster, squatting, sand sucked in off the floor round it, by 0.5 s; HELD, trembling, static
 *            crackling over it, to 0.8 s (0.3 s)
 *   strike   TWO FRAMES, smeared: bursting up (frame 25), the twister (frame 26, 0.867 s: the clip's `hit`)
 *   twister  from 0.867 s to 4.4 s (3.5 s): `TW.high` tall (the knight is 58; the dust devil 32), spinning, lightning crawling up it;
 *            the game carries it over the floor as it wanders (`TW.pace`)
 *   wind-down  collapsing, its sand pouring out of it, 4.4 s to 5.0 s; reeling a moment; on its stand by 5.2 s
 *   pull     a hero within `pull` tiles of its foot is dragged in toward it, `drag` tiles a second (he runs 4.6)
 *   r        a hero within `r` of its foot is scoured, every `tick` seconds
 *   bolts    lightning thrown out of it onto the floor round it, every `every` seconds through the twister, each at a place
 *            `out` tiles from its foot (a range), crackling there `warn` seconds first; a hero within `bolt` of it as it strikes is struck
 */
export const TW_HIT = f(26);
export const TW_STRIKE = [f(24), f(26)] as const;
export const TW_SMEARED = (t: number): boolean => t > TW_STRIKE[0] + 1e-6 && t <= TW_STRIKE[1] + FR + 1e-6;
export const TW = { hit: TW_HIT, strike: TW_STRIKE, spun: 0.5, until: 4.4, down: 5.0, long: 5.2, high: 108, girth: 3.0, pace: 1.4, pull: 2.6, drag: 1.6, r: 0.8, tick: 0.3, every: 0.45, out: [1.2, 2.2] as const, warn: 0.3, bolt: 0.6 } as const;
/** How grown it is, `t` seconds in (0 the dust devil, 1 the twister). */
function grownAt(t: number): number {
  const [s0, s1] = TW_STRIKE;
  if (t <= s0 + 1e-6) return 0;
  if (t < s1 + 1e-6) return 0.12 + 0.88 * ((t - s0) / (s1 - s0)) ** 0.8;
  if (t < TW.until) return 1;
  return 1 - smooth((t - TW.until) / (TW.down - TW.until));
}
/** How far round it has spun: a stand's round to begin with, faster and faster, then very fast as the twister; slowing at its end, landing on its stand's first moment. */
function spunAt(t: number): number {
  const P0 = DD_STAND.period;
  // (in stand moments: the stand's own clock, so that it hands over to and from its stand without a jump)
  if (t < TW.spun) return 2.2 * t * t / TW.spun;
  if (t < TW.until) return 2.2 * TW.spun + 4.4 * (t - TW.spun);
  const end = 2.2 * TW.spun + 4.4 * (TW.until - TW.spun);
  const u = clamp01((t - TW.until) / (TW.long - TW.until));
  // (on round to the next whole round of its stand, slowing)
  const goal = Math.ceil((end + 1.2) / P0) * P0;
  return end + (goal - end) * (1 - (1 - u) ** 2);
}
/** Where the bolts it throws out strike (seconds into the move; the way, radians from its forward; tiles out): the film's, and the game's pattern to turn toward the hero. */
export const TW_BOLTS: ReadonlyArray<{ t: number; a: number; d: number }> = (() => {
  const out: { t: number; a: number; d: number }[] = [];
  for (let t = TW_HIT + 0.25, i = 0; t < TW.until - 0.2; t += TW.every, i++) out.push({ t, a: hash(i, 1, 1501) * TAU, d: TW.out[0] + (TW.out[1] - TW.out[0]) * hash(i, 2, 1501) });
  return out;
})();
/** THE TWISTER'S POSE at `t`: the dust devil's own, grown, spun, crackling. */
export function twisterPose(t: number): DdPose {
  const g = grownAt(t);
  const P = stood(spunAt(t));
  const [s0] = TW_STRIKE;
  const gather = t < s0 ? smooth(t / TW.spun) : t < TW.until ? 0 : 0;
  const shake = t >= TW.spun && t < s0 ? Math.sin(t * 190) * 0.9 : 0;
  // (squatting and fattening as it spins up; then grown)
  P.high = P.high * (1 - 0.22 * gather) * (1 - g) + TW.high * (1 + 0.03 * Math.sin(t * 7)) * g;
  P.girth = P.girth * (1 + 0.3 * gather) * (1 - g) + TW.girth * (1 + 0.05 * Math.sin(t * 5)) * g;
  P.top = [P.top[0] * (1 - g) + g * 9 * Math.sin(t * 2.3), P.top[1] * (1 - g) + g * 11 * Math.sin(t * 1.7 + 1) + shake];
  P.snake = P.snake * (1 - g) + 4.5 * g;
  P.y += shake * 0.5;
  P.burn = t < TW.until ? 1 + 0.8 * Math.max(gather, g) : 1 + 0.8 * g;
  // (its bell, up in its heart, tumbling)
  P.bellOff = [P.bellOff[0] * (1 + 2 * g), P.bellOff[1] * (1 + 2 * g), P.bellOff[2]];
  // sand sucked in off the floor round it as it spins up, in a ring closing on its foot; as the twister, swirling up it
  const foot = middleAt(P, 0);
  if (t < TW.until) {
    for (let j = 0; j < 22; j++) {
      const k = (j / 22 + t * 1.8) % 1;
      const th = P.spin * 1.3 + j * 2.4;
      const r = (14 + 30 * g) * (1 - k) + 3;
      if (hash(j, 1, 63) > gather + g) continue;
      P.chips.push([[foot[0] + Math.cos(th) * r, foot[1] + Math.sin(th) * r, 0.8 + (4 + 30 * g) * k * k], j % 2 ? DUST[3] : GRIT[2], 2]);
    }
  }
  // the collapse: its sand pouring down out of it
  if (t > TW.until && t < TW.down + 0.1) {
    const k = (t - TW.until) / (TW.down - TW.until);
    for (let j = 0; j < 40; j++) {
      const h = hash(j, 1, 69) * (1 - 0.5 * k);
      const th = hash(j, 2, 69) * TAU;
      const fall = (k * 2 + hash(j, 3, 69)) % 1;
      const m = middleAt(P, h);
      const r = girthAt(P, h) * (1 + 1.5 * fall);
      P.chips.push([[m[0] + Math.cos(th) * r, m[1] + Math.sin(th) * r, Math.max(0.8, (TW.high * h + 10) * (1 - fall) * (1 - k * 0.5))], j % 3 ? DUST[3] : GRIT[2], 2]);
    }
  }
  // the burst up: streaks of sand, up the way it went
  if (TW_SMEARED(t)) {
    const thin = Math.abs(t - TW_HIT - FR) < 1e-6;
    for (let j = 0; j < 18; j++) {
      const th = (j / 18) * TAU + P.spin;
      const r = girthAt(P, 0.5) * 0.9;
      for (let i = 0; i < 16; i++) {
        const z = (i / 16) * P.high * 0.95;
        if (thin && i < 9) continue;
        if (i % 2 && j % 2) continue;
        P.chips.push([[foot[0] + Math.cos(th) * r * (0.3 + 0.7 * i / 16), foot[1] + Math.sin(th) * r * (0.3 + 0.7 * i / 16), z], i > 12 ? '#fff0d8' : i > 8 ? DUST[4] : DUST[3], 1]);
      }
    }
  }
  return P;
}
/** How hard the static crackles over it, `t` seconds in. */
const staticOf = (t: number): number => (t < 0.35 ? 0 : t < TW.spun ? (t - 0.35) / (TW.spun - 0.35) * 0.6 : t < TW.until ? (t < TW_STRIKE[0] ? 0.6 : 1) : Math.max(0, 1 - (t - TW.until) / 0.3));
/** The canvas it is painted on as it grows (the dust devil's, made bigger: the twister is 108 tall). */
export const TW_CANVAS = { w: 260, h: 230, ax: 130, ay: 190 } as const;
/** One frame of the twister move, from in front or behind (the dust devil's own painting, its sand wound thicker and in more rings as it grows). */
export function twisterPainted(t: number, view: GameView = 'front'): Painted {
  const C = TW_CANVAS;
  const st = stage(view, C.ax, C.ay, C);
  const P = twisterPose(t);
  const g = grownAt(t);
  const keep = { rings: LOOK.rings, streaks: LOOK.streaks, thick: [...LOOK.thick] };
  LOOK.rings = Math.round(8 + 8 * g);
  LOOK.streaks = g > 0.5 ? 3 : 2;
  LOOK.thick = [1.3 * (1 + 1.5 * g), 0.4 * (1 + 1.5 * g)];
  const bits: Bit[] = [];
  try {
    devilBits(P, (part, piece, shape) => {
      bits.push({ part, piece, shape });
    }, st.eye);
  } finally {
    LOOK.rings = keep.rings;
    LOOK.streaks = keep.streaks;
    LOOK.thick = keep.thick;
  }
  // the static: bolts crawling up it and round it, white and the cult's violet
  const k = staticOf(t);
  const flick = Math.floor(t * 30 + 1e-6);
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  if (k > 0.05) {
    const n = g > 0.5 ? 4 : 2;
    for (let j = 0; j < n; j++) {
      const h0 = hash(j, flick, 1503) * (0.2 + 0.6 * g);
      const h1 = Math.min(1, h0 + 0.15 + 0.3 * hash(j, flick, 1505));
      const a0 = hash(j, flick, 1507) * TAU;
      const a1 = a0 + (hash(j, flick, 1509) - 0.5) * 2.4;
      const p0 = middleAt(P, h0);
      const p1 = middleAt(P, h1);
      const r0 = girthAt(P, h0) + 1;
      const r1 = girthAt(P, h1) + 1;
      bolt3(put, [p0[0] + Math.cos(a0) * r0, p0[1] + Math.sin(a0) * r0, p0[2]], [p1[0] + Math.cos(a1) * r1, p1[1] + Math.sin(a1) * r1, p1[2]], 7 + j, flick, k);
    }
  }
  const lights = paintBits(st, bits, [P.x, P.y, 12 + 30 * g]);
  for (const [p, r, a] of P.flares) {
    const [x, y] = st.at(p);
    lights.push({ x, y, r, color: FLAME[2], a });
  }
  if (k > 0.05) lights.push({ x: C.ax, y: C.ay - 20 - 40 * g, r: 40 + 40 * g, color: '#c060ff', a: 0.2 * k });
  const px = st.whole(P.alive ? ENEMY_RIM : null);
  const mid = middleAt(P, 0.5);
  const flat: V3 = [st.eye[0], st.eye[1], 0];
  const fl = Math.hypot(flat[0], flat[1]) || 1;
  const keep2 = { rings: LOOK.rings };
  for (const [pt, col, size] of gritOf(P)) {
    const before = ((pt[0] - mid[0]) * flat[0] + (pt[1] - mid[1]) * flat[1]) / fl > 0;
    ddLaid(px, st, pt, col, size, !before);
  }
  void keep2;
  for (const [pt, col, size] of P.chips) ddLaid(px, st, pt, col, size, false);
  for (const [c, tau, life] of P.rings) airRing(px, st, c, tau, life);
  return { px, lights };
}
/**
 * WHAT IT DOES TO THE FLOOR ROUND IT, `t` seconds into the move (its anchor its foot): the sand swirling in over the floor toward its
 * foot out to `TW.pull` as it spins up and as the twister (how far it drags you), and where each bolt it throws out will strike,
 * crackling first (`TW.warn`), then struck. 'floor' only. The bolts themselves, from it to there, are laid by `layTwisterBolts`.
 */
export const SWIRL_CANVAS = { w: 300, h: 180, ax: 150, ay: 90 } as const;
export function swirlPainted(t: number): { px: Px; lights: Light[] } {
  const C = SWIRL_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  const g = t < TW_STRIKE[0] ? smooth(t / 0.8) * 0.5 : grownAt(t);
  if (t < 0.15 || t > TW.down) return { px, lights };
  const dot2 = pen(px, true);
  const R = TW.pull * Math.max(0.4, g);
  // (streaks of sand curling in toward its foot: each a short arc, spiralling)
  for (let i = 0; i < 70; i++) {
    const u = (t * 0.9 + hash(i, 1, 1511)) % 1;
    const r0 = R * (1 - u);
    const a0 = hash(i, 2, 1511) * TAU + u * 3.2 + t * 1.5;
    for (let s = 0; s < 6; s++) {
      const r = r0 * (1 - s * 0.03);
      const a = a0 - s * 0.09;
      const [x, y] = tileAt(C.ax, C.ay, Math.cos(a) * r, Math.sin(a) * r);
      if (r < 0.15) continue;
      dot2(x, y, s < 2 ? DUST[3] : u > 0.7 ? DUST[2] : GRIT[2]);
    }
  }
  // (its reach: a faint ring of the enemy's pink, dotted)
  if (g > 0.3) markRing(px, C.ax, C.ay, TW.pull, 0.4, ['#7a1058', '#e0287a', '#3a0820'], t * 0.8);
  // where each bolt will strike: crackling a moment first, then the strike's scorch
  for (const b of TW_BOLTS) {
    const dt = t - b.t;
    if (dt < -TW.warn || dt > 0.3) continue;
    const [x, y] = tileAt(C.ax, C.ay, Math.cos(b.a) * b.d, Math.sin(b.a) * b.d);
    if (dt < 0) {
      const k = 1 + dt / TW.warn;
      const dd = pen(px);
      for (let i = 0; i < 8; i++) {
        const a = hash(i, Math.floor(t * 30), 1513) * TAU;
        const rr = (5 + 6 * k) * hash(i, 2, 1513);
        dd(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.5, i % 2 ? BOLT.violet : BOLT.white);
      }
      markRing(px, x, y, TW.bolt * 0.7, k, [BOLT.violet, BOLT.pale, BOLT.deep]);
    }
  }
  return { px, lights };
}
/** The bolts it throws out, laid on a scene: from the twister (its foot at (x, y) on the scene, `k` scene pixels to a picture pixel) to each place. */
export function layTwisterBolts(px: Px, x: number, y: number, t: number, k = 1, turn = 0): Light[] {
  const lights: Light[] = [];
  for (const [i, b] of TW_BOLTS.entries()) {
    const dt = t - b.t;
    if (dt < 0 || dt > 0.3) continue;
    const [X, Y] = tileAt(0, 0, Math.cos(b.a + turn) * b.d, Math.sin(b.a + turn) * b.d);
    const from = (0.35 + 0.35 * hash(i, 3, 1515)) * TW.high;
    if (dt < 0.16) layBolt(px, x, y - from * k, x + X * k, y + Y * k, 50 + i, Math.floor(dt * 30) + i * 5, 1 - dt / 0.2, 2, 2);
    layStrike(px, x + X * k, y + Y * k, dt, 1517 + i, k);
    if (dt < 0.16) lights.push({ x: x + X * k, y: y + Y * k, r: 50, color: '#c060ff', a: 0.3 });
  }
  return lights;
}
/** As the game holds a monster: the game's own dust devil (stand, weave, flinch, death: its own pictures) but its attack, the twister (one clip, 5.2 s, its blow the burst up). */
export function makeTwisterDevilArt(): ActorArt {
  const art = makeDevilArt();
  for (const [set, view] of [[art.front, 'front'], [art.back, 'back']] as const) {
    const frames = lazyFrames(Math.round(TW.long * 30) + 1, (i) => toSprite(twisterPainted(i / 30, view), { ...DD_AURA, x: DD_AURA.x - DD_CANVAS.ax + TW_CANVAS.ax, y: DD_AURA.y - DD_CANVAS.ay + TW_CANVAS.ay }, TW_CANVAS.ax, TW_CANVAS.ay));
    const attack: Clip = { frames, fps: 30, hit: TW_HIT };
    set.attack = lazyFrames(3, (i) => frames[[15, 26, 60][i]]);
    if (set.clips) set.clips.attack = attack;
  }
  return art;
}
void BELL_UP;
void DD_HIGH;
void SC_STAND;
void ddLaid;
export type { AnimSet };
