// THE CULT'S TWO, MORE ACTION (floors 6 to 10; the art chat's helper, 1 Nov 2026; docs/mockups/action_f6/README.md). A MOCK-UP:
// NOTHING OF THE GAME IMPORTS THIS FILE. The Firepot Thrower's lob made big (FIREPOT_BLAZE, off) and the Chanter's bolt made chain
// lightning (CHANTER_LIGHTNING, off), each on the game's own figure (art/act1_cultists.ts), all it keeps frame for frame its own.
//
// His review of every enemy for more action, 31 Oct 2026, each offered and answered “Yes (Recommended)”:
//   THE FIREPOT THROWER: “Keep it; make the burst and the fire bigger, as your area rule asks.”
//   THE CHANTER, his pick for LIGHTNING: “The Chanter, 6–10 (Recommended)” (offered as: the Chanter's cursed bolt becomes chain
//   lightning that jumps from you to anyone near you). Its ward is kept.
// Under his rulebook's Monsters 9, ACTION, LIKE A MOVIE, and his Movement 9 (24 Oct: “Like the wind up and wind down are big but the
// actual punch is lightning quick”; for the enemies, 28 Oct: “Start from now on, but every enemy is going to need that change
// eventually.  And bigger AOE to compensate for the extra time the player gets to evade”).
//
// So: THE LOB: the sling hauled up over its head and the lit pot whirled round it, faster and faster, its body wound back and HELD
// as it whirls (the fuse flaring: the warning); in TWO FRAMES its arm whips over the top and the pot is slung, smeared; it is
// thrown on over after it and stays bent, then reaches back to its rack for another. The pot goes up HIGH, its shadow on the floor
// growing where it will come down; it bursts in a great whoosh of the cult's fire 1.6 tiles round, and the floor burns 1.4 tiles
// round for five seconds. THE CHAIN LIGHTNING: the book heaved up high over its head in both hands, and HELD, crackling, lightning
// crawling over it and its arms, the script blazing; a ring crackling on the floor where you stood (the warning: get out of it);
// in TWO FRAMES it brings the book down at you, smeared, and the lightning leaps from its pages to the ring; whoever it strikes, it
// jumps from to the nearest within 2.5 tiles, and on from that one to another. White at its heart, the cult's violet and its pink:
// never the friend's cyan.
//
// 2 Nov 2026 (art/action-fixes), his words. Asked whom it may jump to: “I don’t really want the rangers animals to have HP bars so it
// doesn’t really matter to jump to them”; asked whether it should jump on to monsters near you and hurt them, his pick: “No jumps”
// (offered as: it just strikes you, one bolt with a crackle round you); then, 07:56: “If we have multiplayer, the lightningwould jump
// to other players”. So THE JUMPS ARE TO OTHER HEROES (players) ONLY, never to companions or monsters: with one hero, one bolt down
// onto him (its ring marked first, as before) and A CRACKLE OF STATIC round him a moment (`staticPainted`, `CHAIN.crackle`).

import type { Light } from '../engine/px';
import { Px } from '../engine/px';
import type { ActorArt, Clip } from './actor_types';
import { CHANTER, CHANTER_REST, CLAY, FIREPOT_THROWER, POTS_REST, SLING_LONG, bookOf, firepotFlying, makeChanterArt3, makeFirepotThrowerArt3 } from './act1_cultists';
import { hash, lazyFrames } from './kit';
import { FLAME } from './mkit';
import { mobSet, paintBits, skeletonAt } from './new_mobs3';
import type { Bit, Mob, MobMove, Moment, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import { add, lerp3, mul, norm, sub } from './skeleton';
import type { Bones, Key3, V3 } from './skeleton';
import { BOLT, FR, TAU, blob, clamp01, f, layBolt, layShadow, layStrike, markRing, pen, smearAlong, smooth, tileAt } from './action_f6_fx';

/** THE SWITCHES, OFF. With one on, the bestiary's figure is the one below (the bestiary's to choose, as floor 4's golem). */
export const FIREPOT_BLAZE = { on: false };
export const CHANTER_LIGHTNING = { on: false };

type P = Partial<Bones>;

// =============================================================================================
// THE FIREPOT THROWER: THE BIG LOB

/**
 * THE LOB'S NUMBERS (seconds from its start):
 *   whirl    the sling up over its head by 0.2 s; the pot whirled round it, faster and faster, to the strike (`blazeWhirl`)
 *   wind-up  wound back, leaning away, by 0.55 s; HELD, whirling, trembling, the fuse flaring, to 0.933 s (0.38 s)
 *   strike   TWO FRAMES, smeared: over the top (frame 29), slung (frame 30, 1.0 s: the clip's `hit`)
 *   wind-down  thrown on over after it, bent, to 1.45 s; reaching back to its rack, another pot in the sling by 1.9 s; at rest 2.2 s
 */
export const LOB_HIT = f(30);
export const LOB_STRIKE = [f(28), f(30)] as const;
export const LOB_SMEARED = (t: number): boolean => t > LOB_STRIKE[0] + 1e-6 && t <= LOB_STRIKE[1] + FR + 1e-6;
export const LOB = { hit: LOB_HIT, strike: LOB_STRIKE, whirl: 0.2, wound: 0.55, long: 2.2, reload: 1.9 } as const;
const LOB_NAME = 'The firepot thrower whirls its pot, held, and slings it high';
function lobKeys(): Key3[] {
  const R = POTS_REST;
  const wound: P = { pz: R.pz + 1.8, pitch: R.pitch - 15, bend: R.bend - 13, faceUp: R.faceUp + 12, twist: 16, rhx: -5, rhy: -3, rhz: 17, re: 22, lhx: 12, lhy: 5, lhz: -5, le: -30 };
  const tremble = (d: number): P => ({ ...wound, rhz: (wound.rhz ?? 0) + d * 0.6, twist: (wound.twist ?? 0) + d, pz: (wound.pz ?? 0) + d * 0.15 });
  const hit: P = { px: 2.4, pz: R.pz - 1.4, pitch: R.pitch + 9, bend: R.bend + 8, faceUp: R.faceUp - 2, twist: -12, rhx: 16, rhy: -3, rhz: 3, re: 34, lhx: 3, lhy: 3, lhz: -15, le: -14 };
  return [
    { at: 0, pose: {} },
    { at: LOB.whirl, pose: { pz: R.pz + 1.2, pitch: R.pitch - 6, bend: R.bend - 6, faceUp: R.faceUp + 6, rhx: 1, rhy: -2, rhz: 16, re: 20, lhx: 9, lhz: -10 }, ease: 'io' },
    { at: LOB.wound, pose: wound, ease: 'io' },
    { at: 0.67, pose: tremble(0.9), ease: 'io' },
    { at: 0.8, pose: tremble(-0.6), ease: 'io' },
    { at: LOB_STRIKE[0], pose: tremble(0.3), ease: 'io' },
    // (over the top: its hips and chest come round first, its arm whipped after them)
    { at: f(29), pose: { px: 1.0, pz: R.pz + 0.6, pitch: R.pitch - 3, bend: R.bend - 2, faceUp: R.faceUp + 6, twist: 2, rhx: 6, rhy: -3, rhz: 19, re: 26, lhx: 8, lhy: 4, lhz: -10, le: -20 }, ease: 'lin' },
    { at: LOB_HIT, pose: hit, ease: 'lin' },
    { at: LOB_HIT + 0.22, pose: { ...hit, px: 2.9, pz: R.pz - 2.3, pitch: R.pitch + 14, bend: R.bend + 11, twist: -15, rhx: 13, rhz: -6, re: 40 }, ease: 'out' },
    { at: 1.45, pose: { ...hit, px: 2.6, pz: R.pz - 2.0, pitch: R.pitch + 13, bend: R.bend + 10, twist: -13, rhx: 12, rhz: -7, re: 40 }, ease: 'io' },
    { at: LOB.reload - 0.14, pose: { px: 0.6, pz: R.pz, pitch: R.pitch + 4, bend: R.bend + 2, faceUp: R.faceUp, faceTurn: -30, twist: 10, rhx: -3, rhy: -1, rhz: 12, re: 60, lhx: 7, lhz: -13 }, ease: 'io' },
    { at: LOB.reload, pose: { pz: R.pz, faceTurn: -20, twist: 6, rhx: -2, rhy: -2, rhz: 10, re: 60 }, ease: 'io' },
    { at: LOB.long, pose: {}, ease: 'io' },
  ];
}
const LOB_KEYS = lobKeys();
/** How many times round it has whirled the pot, `t` seconds into its lob (0: not whirling): faster and faster, to five times a second as it holds. */
export function blazeWhirl(t: number): number {
  if (t < LOB.whirl || t >= LOB_HIT - 1e-6) return 0;
  const u = clamp01((t - LOB.whirl) / (LOB.wound - LOB.whirl));
  const up = (LOB.wound - LOB.whirl) * 2.5 * u * u;
  return up + (t > LOB.wound ? (t - LOB.wound) * 5 : 0) + 0.001;
}
/** The fuse flaring as it whirls (the warning). */
const lobGlint = (t: number): number => (t < 0.3 || t > LOB_HIT ? 0 : t < 0.55 ? (t - 0.3) / 0.25 : 1);
/** Where the lit pot is, whirling, `t` seconds in (as art/act1_cultists.ts slungPot has it). */
function potAt(t: number): V3 {
  const s = skeletonAt(BLAZE_THROWER, 'attack', t);
  const a = (blazeWhirl(t) - 0.001) * TAU;
  return add(s.handR, [Math.cos(a) * SLING_LONG * 0.95, Math.sin(a) * SLING_LONG * 0.95, -1.5 + Math.sin(a) * 1.2]);
}
/** Where the pot leaves the sling: its figure's lengths, on its floor, as it is slung (the frame before the loosing). */
export const lobFrom = (): V3 => potAt(LOB_HIT - FR);
/** The smear of the slinging: the fist and the pot whirled over in it, from a frame and a fifth back to now. */
function lobSmear(st: Stage, put: Put, t: number): void {
  const thin = Math.abs(t - LOB_HIT - FR) < 1e-6;
  const lines: V3[][] = [[], [], []];
  for (let i = 0; i <= 8; i++) {
    const u = Math.min(t, LOB_HIT - 0.002) - (FR * 1.2 * i) / 8;
    const s = skeletonAt(BLAZE_THROWER, 'attack', u);
    lines[0].push(potAt(u));
    lines[1].push(s.handR);
    lines[2].push(lerp3(s.handR, potAt(u), 0.5));
  }
  smearAlong(st, put, lines, thin, [CLAY[2], FLAME[1], FLAME[3], FLAME[4]]);
}
const POTS_CANVAS2 = { w: 240, h: 216, ax: 120, ay: 160 } as const;
const potsOld = FIREPOT_THROWER;
/** THE FIREPOT THROWER WITH ITS BIG LOB (FIREPOT_BLAZE): the game's own in all but its lob. */
export const BLAZE_THROWER: Mob = {
  ...potsOld,
  id: 'firepotBlaze',
  attack: { name: LOB_NAME, motion: { keys: LOB_KEYS, hit: LOB_HIT }, rest: POTS_REST, glint: lobGlint, charge: blazeWhirl, bare: (t) => t >= LOB_HIT - 1e-6 && t < LOB.reload } as MobMove,
  hit: LOB_HIT,
  warn: 0.55,
  canvas: POTS_CANVAS2,
  aura: { ...potsOld.aura, x: potsOld.aura.x - potsOld.canvas!.ax + POTS_CANVAS2.ax, y: potsOld.aura.y - potsOld.canvas!.ay + POTS_CANVAS2.ay },
  bits: (st, m) => {
    const bits = potsOld.bits(st, m);
    if (m.move === LOB_NAME && LOB_SMEARED(m.t)) lobSmear(st, (part, piece, shape) => bits.push({ part, piece, shape }), m.t);
    return bits;
  },
};
/** As the game holds a monster: the game's own thrower's pictures but its attack, the big lob. */
export function makeBlazeThrowerArt(pace = FIREPOT_THROWER.pace): ActorArt {
  const art = makeFirepotThrowerArt3(pace);
  for (const [set, view] of [[art.front, 'front'], [art.back, 'back']] as const) {
    const own = mobSet(BLAZE_THROWER, view, pace);
    set.attack = own.attack;
    if (set.clips && own.clips) set.clips.attack = own.clips.attack;
  }
  return art;
}

/**
 * ITS POT IN FLIGHT AND ITS FIRE (seconds; tiles; game pixels):
 *   fly(d)    0.55 + 0.06 d seconds to a hero `d` tiles off (0.85 s at 5 tiles; the old lob's 0.85 too, but low)
 *   arc(d)    HIGH: it rises 46 + 5 d game pixels over the straight way (71 at 5 tiles: the knight is about 30; the old lob's 25)
 *   aim       where the hero stands as it is slung; its shadow on the floor there, growing, all the way
 *   burst     a hero within 1.6 tiles of where it comes down is struck (the old: 0.65); the whoosh is seen 0.6 s
 *   fire      THE FLOOR BURNS 1.4 tiles round (the old: 0.42) for 5 s after (the old: 4), dying down over its last 0.8 s
 *   near, far slung from 2 to 8 tiles (the old: up to 7.5)
 */
export const BLAZE = { hit: LOB_HIT, near: 2, far: 8, r: 1.6, burstLong: 0.6, fire: 1.4, burn: 5, fade: 0.8, spin: 1.6 } as const;
export const blazeFly = (d: number): number => 0.55 + 0.06 * d;
export const blazeArc = (d: number): number => 46 + 5 * d;
/** Where the pot is `u` (0 to 1) of its flight to a hero `d` tiles off: tiles along the way, and game pixels up (from the sling's height to the floor). */
export function blazeAt(u: number, d: number): [number, number] {
  const k = clamp01(u);
  const z0 = lobFrom()[2] / 2;
  return [d * k, z0 * (1 - k) + 1.5 * k + 4 * blazeArc(d) * k * (1 - k)];
}
/** Whether a hero `x`, `y` tiles from where it comes down is struck by its burst; and burned by its fire. */
export const blazeStrikes = (x: number, y: number, r: number = BLAZE.r): boolean => Math.hypot(x, y) <= r;
export const blazeBurns = (x: number, y: number, r: number = BLAZE.fire): boolean => Math.hypot(x, y) <= r;
/** The pot in flight, as the game holds a picture: the game's own (art/act1_cultists.ts firepotFlying), eight frames once round. */
export function makeFlyingPotArt(view: GameView = 'front'): Clip {
  return { frames: lazyFrames(8, (i) => firepotFlying(i / 8, view)), fps: 8 * BLAZE.spin, loop: 0 };
}
/** The fire's canvas: 1.6 tiles round where it comes down and its whoosh up over it. Its anchor where it comes down. */
export const FIRE_CANVAS = { w: 260, h: 230, ax: 130, ay: 160 } as const;
/** The pot's shadow as it comes down (`k` 0 to 1 of its flight), on a canvas of its own: 60 by 30, anchored at its middle. */
export function potShadowPainted(k: number): { px: Px; lights: Light[] } {
  const px = new Px(60, 30);
  layShadow(px, 30, 15, k, 18);
  return { px, lights: [] };
}
/** A tongue of the cult's fire standing up off the floor at (x, y) on a picture, `h` tall, licking (`ph` its round). */
function tongue(dot2: (x: number, y: number, c: string) => void, x: number, y: number, h: number, ph: number, hot: number): void {
  const n = Math.max(2, Math.round(h));
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const w = Math.max(0, Math.round((1 - u) * (1.6 + h * 0.12) * (0.7 + 0.3 * Math.sin(ph * 2 + u * 5))));
    const sway = Math.sin(ph + u * 3.2) * u * 1.6;
    for (let j = -w; j <= w; j++) dot2(x + j + sway, y - i, u < 0.25 * hot ? FLAME[4] : u < 0.55 ? FLAME[3] : u < 0.8 ? FLAME[2] : FLAME[1]);
  }
}
/**
 * WHERE IT COMES DOWN, `t` seconds after it lands (the anchor). Before (`t` < 0, from the sling to the floor): nothing but its shadow
 * (the game's own, `potShadowPainted`). As it lands and after:
 *   floor   the fire racing out over the floor to its edge in 0.15 s; THE FLOOR BURNING, scorched black, a carpet of the cult's fire
 *           licking up off it, its edge a ring of taller flames, embers; for `BLAZE.burn` seconds, dying down over its last `fade`
 *   air     the flash; THE WHOOSH: a great ball of the cult's fire bursting up and out to the burst's edge, rolling up and darkening,
 *           shards of its clay flung out; smoke; all gone by 0.6 s. By halves (`side`): 'behind' before a figure there, 'before' after.
 */
export function blazePainted(t: number, layer: 'floor' | 'air', side: 'behind' | 'before' | 'all' = 'all', r: number = BLAZE.r, fire: number = BLAZE.fire): { px: Px; lights: Light[] } {
  const C = FIRE_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  const end = BLAZE.burstLong + BLAZE.burn;
  if (t < 0 || t > end) return { px, lights };
  const at = (x: number, y: number): [number, number] => tileAt(C.ax, C.ay, x, y);
  const fr = Math.floor(t * 30 + 1e-6);
  if (layer === 'floor') {
    const dot2 = pen(px);
    const under = pen(px, true);
    // (how far out it has run, how fierce it burns: up at once, on, dying down at its end)
    const out = fire * (1 - (1 - clamp01(t / 0.15)) ** 2);
    const fierce = t < 0.15 ? 1 : 1 - smooth((t - (end - BLAZE.fade)) / BLAZE.fade) * 0.95;
    const R = out * (0.75 + 0.25 * fierce);
    // the tongues: a carpet of them, the floor's grid of spots each with its own flame, tall at the edge
    const flames: [number, number, number, number][] = [];
    for (let i = 0; i < 170; i++) {
      const a = hash(i, 1, 1201) * TAU;
      const d = Math.sqrt(hash(i, 2, 1201)) * R;
      const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
      const edge = d / Math.max(0.01, R);
      const ph = t * (7 + 4 * hash(i, 3, 1201)) + hash(i, 4, 1201) * TAU;
      const h = (4 + 9 * hash(i, 5, 1201) + (edge > 0.75 ? 7 : 0)) * fierce * (0.6 + 0.4 * Math.sin(ph * 0.7 + i));
      if (h > 1.2 && hash(i, 6, 1201) < 0.4 + 0.6 * fierce) flames.push([x, y, h, ph]);
    }
    flames.sort((p, q) => p[1] - q[1]);
    for (const [x, y, h, ph] of flames) tongue(dot2, x, y, h, ph, fierce);
    // the floor under it scorched: dark, glowing red where the fire is thickest; embers on it
    for (let i = 0; i < Math.round(R * 260); i++) {
      const a = hash(i, 7, 1201) * TAU;
      const d = Math.sqrt(hash(i, 8, 1201)) * R * 1.02;
      const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
      const glow = hash(i, 9 + Math.floor(t * 8), 1201) < 0.45 * fierce;
      under(x, y, glow ? FLAME[1] : hash(i, 10, 1201) < 0.5 ? '#1a0c14' : '#2c1420');
      under(x + 1, y, glow ? FLAME[0] : '#1a0c14');
      under(x, y + 1, glow ? FLAME[0] : '#140a10');
    }
    // its edge: the enemy's pink, dotted, so that where it burns is seen
    if (fierce > 0.2) markRing(px, C.ax, C.ay, R * 1.03, 1, [FLAME[2], FLAME[3], FLAME[0]], t * 0.6);
    // embers rising off it
    for (let i = 0; i < 16; i++) {
      const life = 0.7 + 0.5 * hash(i, 11, 1201);
      const u = (t / life + hash(i, 12, 1201)) % 1;
      const a = hash(i, 13, 1201 + Math.floor(t / life + hash(i, 12, 1201))) * TAU;
      const d = Math.sqrt(hash(i, 14, 1201)) * R;
      const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
      if (fierce > 0.15) dot2(x + Math.sin(u * 7 + i) * 2, y - 4 - u * 26, u < 0.5 ? FLAME[3] : FLAME[2]);
    }
    if (fierce > 0.1) lights.push({ x: C.ax, y: C.ay - 6, r: 50 + 30 * R, color: FLAME[2], a: 0.3 * fierce });
    return { px, lights };
  }
  // --- the air: the whoosh ---
  if (t > BLAZE.burstLong) return { px, lights };
  const dot2 = pen(px);
  const under = pen(px, true);
  const k = t / BLAZE.burstLong;
  const onSide = (y: number): boolean => side === 'all' || (y > C.ay) === (side === 'before');
  // the flash
  if (t < 0.08 && side !== 'behind') {
    blob(dot2, C.ax, C.ay - 10, 8 + 10 * (1 - t / 0.08), '#fff8ec');
    lights.push({ x: C.ax, y: C.ay - 14, r: 120, color: FLAME[3], a: 0.6 });
  }
  // the ball of fire bursting out and rolling up: balls of flame, hot at the heart, out to the burst's edge, rising and darkening
  const balls: [number, number, number, string][] = [];
  for (let i = 0; i < 46; i++) {
    const a = hash(i, 1, 1203) * TAU;
    const far = r * (0.25 + 0.75 * Math.sqrt(hash(i, 2, 1203)));
    const go = 1 - (1 - clamp01(k * 2.2)) ** 3;
    const d = far * go;
    const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
    if (!onSide(y)) continue;
    const up = (8 + 70 * hash(i, 3, 1203) * (1 - d / (r * 1.1))) * Math.sqrt(k) + 6;
    const size = (5 + 9 * hash(i, 4, 1203)) * (1 - k * 0.6) * (k < 0.08 ? k / 0.08 : 1);
    const col = k < 0.3 ? (i % 3 ? FLAME[3] : FLAME[4]) : k < 0.5 ? (i % 3 ? FLAME[3] : FLAME[2]) : k < 0.62 ? (i % 2 ? FLAME[2] : '#4a3038') : i % 2 ? '#3a2c34' : '#2c2430';
    balls.push([x, y - up, size, col]);
  }
  balls.sort((p, q) => q[2] - p[2]);
  for (const [x, y, s, c] of balls) blob(under, x, y, s, c, k > 0.7 ? 0.5 : 0.1, 1205);
  // its hot heart, over the rest
  if (k < 0.5 && side !== 'behind') blob(dot2, C.ax, C.ay - 16 - 30 * k, 10 * (1 - k * 2), FLAME[4], 0.2, 1207);
  // shards of its clay flung out, falling
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + hash(i, 1, 1209);
    const d = r * (0.5 + 0.6 * hash(i, 2, 1209)) * Math.min(1, k * 2);
    const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
    if (!onSide(y)) continue;
    const up = 50 * Math.sin(Math.PI * Math.min(1, k * 1.6)) * hash(i, 3, 1209);
    dot2(x, y - up, CLAY[3]);
    dot2(x + 1, y - up, CLAY[2]);
  }
  if (side !== 'behind') lights.push({ x: C.ax, y: C.ay - 30, r: 90 + 50 * k, color: FLAME[2], a: 0.5 * (1 - k) });
  void fr;
  return { px, lights };
}

// =============================================================================================
// THE CHANTER: CHAIN LIGHTNING

/**
 * THE CAST'S NUMBERS (seconds from its start):
 *   wind-up  the book heaved up high over its head in both hands by 0.35 s; HELD there, trembling, crackling, the script blazing,
 *            its head thrown back, to 0.9 s (0.55 s)
 *   aim      where the hero stands at 0.4 s: a ring crackles on the floor there, `CHAIN.r` round, from then (0.57 s before it strikes)
 *   strike   TWO FRAMES, smeared: the book brought down (frame 28), thrust out at you (frame 29, 0.967 s: the clip's `hit`): the
 *            lightning leaps from its pages to the ring
 *   wind-down  rocked over after it, the book smoking, to 1.35 s; at rest 1.8 s
 */
export const CAST_HIT = f(29);
export const CAST_STRIKE = [f(27), f(29)] as const;
export const CAST_SMEARED = (t: number): boolean => t > CAST_STRIKE[0] + 1e-6 && t <= CAST_STRIKE[1] + FR + 1e-6;
/**
 * THE LIGHTNING (seconds; tiles):
 *   r       a hero within this many tiles of the ring's middle as it strikes is struck (the bolt's old reach: 0.4, flying)
 *   jump    (2 Nov, his word) from the hero it strikes it jumps to the nearest OTHER HERO (another player) within this many tiles,
 *           `jumps` times, `every` seconds apart (each one jumped to is struck, by `share` of the blow): NEVER to a companion (the
 *           ranger's animals) or a monster. With one hero there is no jump: one bolt.
 *   crackle the static crackling round each hero it strikes, this long, dying away (`staticPainted`)
 *   seen    each bolt crackles this long, fading
 *   near, far  cast at a hero from 2 to 7 tiles off (the bolt's: up to 7)
 */
export const CHAIN = { hit: CAST_HIT, strike: CAST_STRIKE, aim: 0.4, r: 1.0, jump: 2.5, jumps: 2, every: 0.1, share: 0.6, crackle: 0.8, seen: 0.22, near: 2, far: 7, long: 1.8 } as const;
const CAST_NAME = 'The chanter heaves its book up, crackling, and casts chain lightning';
const CR = CHANTER_REST;
function castKeys(): Key3[] {
  const hands = (x: number, z: number, y = 0): P => ({ lhx: x, rhx: x, lhz: z, rhz: z, lhy: CR.lhy + y, rhy: CR.rhy - y });
  const up: P = { pz: CR.pz + 1.2, pitch: -7, bend: -9, faceUp: 22, ...hands(4, 21, 1.2), le: -60, re: 60, pt: 0.55, draw: 1 };
  const shake = (d: number): P => ({ ...up, lhz: 21 + d, rhz: 21 + d, bend: -9 - d * 0.6, pz: CR.pz + 1.2 + d * 0.2 });
  const thrust: P = { px: 3.0, pz: CR.pz - 0.8, pitch: 14, bend: 13, faceUp: -2, ...hands(16, -2), le: -20, re: 20, pt: 1, draw: 1 };
  return [
    { at: 0, pose: {} },
    { at: 0.35, pose: up, ease: 'io' },
    { at: 0.48, pose: shake(0.7), ease: 'io' },
    { at: 0.62, pose: shake(-0.5), ease: 'io' },
    { at: 0.76, pose: shake(0.6), ease: 'io' },
    { at: CAST_STRIKE[0], pose: shake(0), ease: 'io' },
    // (down at you: its hips and chest first, the book after)
    { at: f(28), pose: { px: 1.4, pz: CR.pz + 0.4, pitch: 4, bend: 2, faceUp: 8, ...hands(13, 10), le: -40, re: 40, pt: 0.85, draw: 1 }, ease: 'lin' },
    { at: CAST_HIT, pose: thrust, ease: 'lin' },
    { at: CAST_HIT + 0.2, pose: { ...thrust, px: 3.6, pitch: 17, bend: 15, ...hands(16.5, -5) }, ease: 'out' },
    { at: 1.35, pose: { ...thrust, px: 3.0, pitch: 15, bend: 14, ...hands(15.5, -5.5), draw: 0.8 }, ease: 'io' },
    { at: CHAIN.long, pose: { draw: 0.5 }, ease: 'io' },
  ];
}
const CAST_KEYS = castKeys();
/** The script blazing as it holds the book up (the warning). */
const castGlint = (t: number): number => (t < 0.15 || t > CAST_HIT + 0.2 ? 0 : t < 0.4 ? (t - 0.15) / 0.25 : t <= CAST_HIT ? 1 : 1 - (t - CAST_HIT) / 0.2);
/** How hard it crackles, `t` seconds in: up as it heaves the book up, fiercest held, a burst at the strike, gone after (smoking). */
export const crackleOf = (t: number): number => (t < 0.2 ? 0 : t < 0.4 ? (t - 0.2) / 0.2 : t <= CAST_HIT + FR ? 1 : Math.max(0, 1 - (t - CAST_HIT) / 0.25));
/** A BOLT IN SPACE, as motes: a jagged way from `a` to `b` (the figure's lengths), new each frame (`flick`); white at its heart, violet beside. */
export function bolt3(put: Put, a: V3, b: V3, seed: number, flick: number, k = 1): void {
  const d = sub(b, a);
  const L = Math.hypot(d[0], d[1], d[2]);
  const n = Math.max(3, Math.round(L / 2.2));
  const side1 = norm([-d[1], d[0], 0], [0, 1, 0]);
  const side2: V3 = [0, 0, 1];
  let last = a;
  for (let i = 1; i <= n; i++) {
    const u = i / n;
    const w = i === n ? 0 : Math.sin(Math.PI * u) * Math.min(4, L * 0.25);
    const p = add(add(lerp3(a, b, u), mul(side1, (hash(i, flick * 3 + seed, 941) - 0.5) * 2 * w)), mul(side2, (hash(i, flick * 3 + seed, 943) - 0.5) * 2 * w));
    const m = Math.max(1, Math.ceil(len3(sub(p, last)) / 0.9));
    for (let j = 0; j < m; j++) {
      const q = lerp3(last, p, j / m);
      if (k < 0.95 && hash(i, j + flick, 945) > k + 0.1) continue;
      put('bolt', 'bolt', { k: 'mote', p: q, c: (i + j) % 5 === 0 ? BOLT.pale : BOLT.white, size: 1 });
    }
    if (hash(i, flick + seed, 947) < 0.35 * k) put('bolt', 'bolt', { k: 'mote', p: add(p, mul(side1, 1.6)), c: i % 2 ? BOLT.violet : BOLT.pink, size: 1 });
    last = p;
  }
}
const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
/** Its bits for the cast: lightning crawling over the book and down its arms as it holds it, a burst of it as it strikes, smoke after; the smear. */
function castBits(st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  if (m.move !== CAST_NAME) return bits;
  const { s, q } = m;
  const k = crackleOf(m.t);
  const flick = Math.floor(m.t * 30 + 1e-6);
  const bk = bookOf(s, q.pt);
  if (k > 0.05) {
    // (from corner to corner of the book, and between its hands; up off its pages; down its arms to its elbows)
    const c = bk.c;
    const corner = (i: number): V3 => add(c, add(mul(bk.across, (i & 1 ? 1 : -1) * 7.5), mul(bk.along, (i & 2 ? 1 : -1) * 4.5)));
    const n = m.t > CAST_HIT - 1e-6 ? 1 : 2;
    for (let j = 0; j < n; j++) {
      const i0 = Math.floor(hash(j, flick, 951) * 4);
      const i1 = (i0 + 1 + Math.floor(hash(j, flick, 953) * 3)) % 4;
      bolt3(put, corner(i0), corner(i1), 11 + j, flick, k);
    }
    bolt3(put, s.handL, s.handR, 17, flick, k);
    if (hash(1, flick, 955) < 0.7) bolt3(put, add(c, mul(bk.up, 1)), add(add(c, mul(bk.up, 8 + 4 * hash(2, flick, 955))), mul(bk.across, (hash(3, flick, 955) - 0.5) * 10)), 19, flick, k);
    if (m.t < CAST_HIT) for (const [h, e, sd] of [[s.handL, s.elbowL, 23], [s.handR, s.elbowR, 29]] as const) if (hash(sd, flick, 957) < 0.55) bolt3(put, h, lerp3(h, e, 0.9), sd, flick, k * 0.8);
    // (sparks spat off it)
    for (let i = 0; i < 8; i++) {
      const a = hash(i, flick, 959) * TAU;
      const r = 6 + 6 * hash(i, flick, 961);
      put('bolt', 'spark', { k: 'mote', p: add(c, [Math.cos(a) * r, Math.sin(a) * r, 2 + 6 * hash(i, flick, 963)]), c: i % 2 ? BOLT.pink : BOLT.pale, size: 1 });
    }
    put('glow', 'glow', { k: 'glow', p: add(c, mul(bk.up, 3)), c: '#c060ff', r: 18 + 12 * k, a: 0.35 * k });
  }
  // (smoke curling off the book after)
  if (m.t > CAST_HIT + 0.1 && m.t < CHAIN.long) {
    const u = (m.t - CAST_HIT - 0.1) / (CHAIN.long - CAST_HIT - 0.1);
    for (let i = 0; i < 6; i++) {
      const v = (u * 2 + i / 6) % 1;
      put('smoke', 'smoke', { k: 'mote', p: add(bk.c, [Math.sin(v * 6 + i) * 2, Math.cos(v * 5 + i) * 2, 2 + v * 16]), c: v < 0.5 ? '#5a4a66' : '#3a3044', size: 2 });
    }
  }
  if (CAST_SMEARED(m.t)) {
    const thin = Math.abs(m.t - CAST_HIT - FR) < 1e-6;
    const lines: V3[][] = [[], [], [], []];
    for (let i = 0; i <= 8; i++) {
      const u = Math.min(m.t, CAST_HIT) - (FR * 1.2 * i) / 8;
      const ss = skeletonAt(LIGHTNING_CHANTER, 'attack', u);
      const b = bookOf(ss, 0.85);
      lines[0].push(add(b.c, mul(b.up, 2)));
      lines[1].push(add(b.c, mul(b.across, 7)));
      lines[2].push(add(b.c, mul(b.across, -7)));
      lines[3].push(add(b.c, mul(b.along, 5)));
    }
    smearAlong(st, put, lines, thin, [BOLT.deep, BOLT.violet, BOLT.pale, BOLT.white], BOLT.pink);
  }
  return bits;
}
const CH_CANVAS2 = { w: 220, h: 216, ax: 110, ay: 166 } as const;
/** THE CHANTER WITH CHAIN LIGHTNING (CHANTER_LIGHTNING): the game's own in all but its cast (its ward kept: the rules'). */
export const LIGHTNING_CHANTER: Mob = {
  ...CHANTER,
  id: 'chanterLightning',
  attack: { name: CAST_NAME, motion: { keys: CAST_KEYS, hit: CAST_HIT }, rest: CHANTER_REST, glint: castGlint } as MobMove,
  hit: CAST_HIT,
  warn: 0.4,
  canvas: CH_CANVAS2,
  aura: { ...CHANTER.aura, x: CHANTER.aura.x - CHANTER.canvas!.ax + CH_CANVAS2.ax, y: CHANTER.aura.y - CHANTER.canvas!.ay + CH_CANVAS2.ay },
  bits: (st, m) => [...CHANTER.bits(st, m), ...castBits(st, m)],
};
/** As the game holds a monster: the game's own Chanter's pictures but its attack, the cast. */
export function makeLightningChanterArt(pace = CHANTER.pace): ActorArt {
  const art = makeChanterArt3(pace);
  for (const [set, view] of [[art.front, 'front'], [art.back, 'back']] as const) {
    const own = mobSet(LIGHTNING_CHANTER, view, pace);
    set.attack = own.attack;
    if (set.clips && own.clips) set.clips.attack = own.clips.attack;
  }
  return art;
}
/** Where the lightning leaves it: the middle of its book's pages as it strikes (its figure's lengths, on its floor). */
export const castFrom = (): V3 => {
  const s = skeletonAt(LIGHTNING_CHANTER, 'attack', CAST_HIT);
  return add(bookOf(s, 1).c, mul(bookOf(s, 1).up, 2));
};
/** The ring's canvas (its anchor the ring's middle). */
export const RING_CANVAS = { w: 170, h: 100, ax: 85, ay: 50 } as const;
/**
 * THE RING WHERE IT WILL STRIKE, `t` seconds before it strikes (from the aim, 0.57 s, to 0) and after (to 0.3 s): a ring of the
 * cult's violet and pink, crackling, `CHAIN.r` round, sparks crawling round it, closing in; as it strikes, scorched.
 */
export function ringPainted(t: number, r: number = CHAIN.r): { px: Px; lights: Light[] } {
  const C = RING_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  const lead = CAST_HIT - CHAIN.aim;
  if (t < -lead - 1e-6 || t > 0.6) return { px, lights };
  const flick = Math.floor((t + 10) * 30 + 1e-6);
  if (t < 0) {
    const k = clamp01(1 + t / lead);
    markRing(px, C.ax, C.ay, r, k, [BOLT.violet, BOLT.pale, BOLT.deep], flick * 0.02);
    markRing(px, C.ax, C.ay - 1, r * 0.985, k, [BOLT.pale, BOLT.white, BOLT.violet], flick * 0.02 + 0.05);
    // (sparks running round it, more as it comes)
    const dot2 = pen(px);
    for (let i = 0; i < 4 + Math.round(8 * k); i++) {
      const a = hash(i, flick, 971) * TAU;
      const [x, y] = tileAt(C.ax, C.ay, Math.cos(a) * r, Math.sin(a) * r);
      dot2(x, y - 1, BOLT.white);
      dot2(x + 1, y - 2, i % 2 ? BOLT.pink : BOLT.pale);
      if (k > 0.5 && i % 3 === 0) {
        const [x2, y2] = tileAt(C.ax, C.ay, Math.cos(a + 0.12) * r, Math.sin(a + 0.12) * r);
        layBolt(px, x, y, x2, y2 - 3, 3, flick + i, 0.8, 1, 0);
      }
    }
    lights.push({ x: C.ax, y: C.ay, r: 30 + 20 * k, color: '#c060ff', a: 0.12 + 0.12 * k });
    return { px, lights };
  }
  // (struck: a scorch, smoking a moment)
  const under = pen(px, true);
  const u = clamp01(t / 0.6);
  for (let i = 0; i < 60; i++) {
    const a = hash(i, 1, 973) * TAU;
    const d = Math.sqrt(hash(i, 2, 973)) * 0.45;
    const [x, y] = tileAt(C.ax, C.ay, Math.cos(a) * d, Math.sin(a) * d);
    if (hash(i, 3, 973) < u) continue;
    under(x, y, '#1a1024');
  }
  return { px, lights };
}
/**
 * A BOLT OF IT between two points (the chain's every link): from (x0, y0) to (x1, y1) on a picture, `t` seconds after it struck
 * (it crackles, a new way each frame, and fades by `CHAIN.seen`), where it strikes a flash and sparks. Laid on the picture given.
 */
export function layChainBolt(px: Px, x0: number, y0: number, x1: number, y1: number, t: number, seed: number): Light[] {
  if (t < 0 || t > CHAIN.seen + 0.3) return [];
  const flick = Math.floor(t * 30 + 1e-6) + seed * 13;
  const k = 1 - clamp01(t / CHAIN.seen);
  if (t <= CHAIN.seen) layBolt(px, x0, y0, x1, y1, seed, flick, Math.max(0.35, k), 2, 3);
  layStrike(px, x1, y1, t, 977 + seed);
  return t <= CHAIN.seen ? [{ x: (x0 + x1) / 2, y: (y0 + y1) / 2, r: 60, color: '#c060ff', a: 0.3 * k }] : [];
}
/** For the game: the same as a picture of its own, from a point to one `dx`, `dy` tiles on (each `z` game pixels up), anchored at the first. */
export function chainBoltPainted(dx: number, dy: number, z0: number, z1: number, t: number, seed: number): { px: Px; lights: Light[]; ax: number; ay: number } {
  const [X, Y] = tileAt(0, 0, dx, dy);
  const x0 = 0;
  const y0 = -z0 * 2;
  const x1 = X;
  const y1 = Y - z1 * 2;
  const pad = 60;
  const minX = Math.min(x0, x1) - pad;
  const minY = Math.min(y0, y1) - pad;
  const px = new Px(Math.ceil(Math.abs(x1 - x0) + 2 * pad), Math.ceil(Math.abs(y1 - y0) + 2 * pad));
  const lights = layChainBolt(px, x0 - minX, y0 - minY, x1 - minX, y1 - minY, t, seed);
  return { px, lights, ax: -minX, ay: -minY };
}
/**
 * Who the chain jumps to (2 Nov: OTHER HEROES ONLY): `heroes` are where the heroes (the players) stand, tiles, and nothing else (no
 * companion, no monster: the rules pass only the heroes); from the one struck (`first`), the nearest hero not yet struck within
 * `CHAIN.jump`, `CHAIN.jumps` times. With one hero: `[first]`, no jump.
 */
export function chainOf(heroes: ReadonlyArray<readonly [number, number]>, first: number): number[] {
  const out = [first];
  for (let j = 0; j < CHAIN.jumps; j++) {
    const [x, y] = heroes[out[out.length - 1]];
    let best = -1;
    let bd = Infinity;
    heroes.forEach(([a, b], i) => {
      if (out.includes(i)) return;
      const d = Math.hypot(a - x, b - y);
      if (d <= CHAIN.jump && d < bd) {
        bd = d;
        best = i;
      }
    });
    if (best < 0) break;
    out.push(best);
  }
  return out;
}
/** The static's canvas (its anchor the struck hero's floor point: his feet). */
export const STATIC_CANVAS = { w: 96, h: 112, ax: 48, ay: 94 } as const;
/**
 * THE CRACKLE OF STATIC round a hero it strikes, `t` seconds after the bolt reaches him (to `CHAIN.crackle`): little jagged arcs
 * crawling over him, a new place each frame (white at their heart, the cult's violet beside, flecks of its pink), sparks running
 * round his feet on the floor and spitting off him, fewer and fewer as it dies. Laid OVER him (his own body's height: the knight's).
 */
export function staticPainted(t: number, seed = 0): { px: Px; lights: Light[] } {
  const C = STATIC_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  if (t < 0 || t > CHAIN.crackle) return { px, lights };
  // (strong at first, dying away at the end)
  const k = 1 - clamp01(t / CHAIN.crackle) ** 2;
  const flick = Math.floor(t * 30 + 1e-6) * 7 + seed * 131;
  const dot2 = pen(px);
  // (his body: an upright oval over his feet; arcs crawl over it, and jump off it into the air round him)
  const [mx, my, hx, hy] = [C.ax, C.ay - 30, 12, 26];
  const arcs = Math.max(2, Math.round(2 + 5 * k));
  for (let i = 0; i < arcs; i++) {
    const a = hash(i, flick, 991) * TAU;
    const d = 0.3 + 0.6 * Math.sqrt(hash(i, flick, 993));
    const x0 = mx + Math.cos(a) * hx * d;
    const y0 = my + Math.sin(a) * hy * d;
    const off = i % 2 === 0;
    const b = off ? a + (hash(i, flick, 995) - 0.5) * 0.8 : a + (hash(i, flick, 995) - 0.5) * 2.4;
    const long = (off ? 14 : 9) + 10 * hash(i, flick, 997) * (0.5 + 0.5 * k);
    const x1 = Math.max(5, Math.min(C.w - 6, x0 + Math.cos(b) * long));
    const y1 = Math.max(5, Math.min(C.h - 6, y0 + Math.sin(b) * long * 1.2));
    layBolt(px, x0, y0, x1, y1, 41 + i, flick + i, Math.max(0.5, k), k > 0.45 ? 2 : 1, off ? 1 : 0);
  }
  // (sparks running round his feet, and spitting off him)
  const n = Math.round(8 + 16 * k);
  for (let i = 0; i < n; i++) {
    const a = hash(i, flick, 999) * TAU;
    const [x, y] = tileAt(C.ax, C.ay, Math.cos(a) * 0.6, Math.sin(a) * 0.6);
    dot2(x, y, i % 3 ? BOLT.pale : BOLT.pink);
    if (i % 2 === 0) dot2(x + 1, y, BOLT.violet);
  }
  for (let i = 0; i < Math.round(10 * k); i++) {
    const a = hash(i, flick, 1001) * TAU;
    const r = 18 + 14 * hash(i, flick, 1003);
    dot2(mx + Math.cos(a) * r, my + Math.sin(a) * r * 1.3, i % 2 ? BOLT.pink : BOLT.white);
  }
  lights.push({ x: mx, y: my, r: 40 + 20 * k, color: '#c060ff', a: 0.45 * k });
  return { px, lights };
}
/** For the film: the other heroes (players) near the one struck that the chain jumps to (none in a game alone). */
export const CHAIN_STAND_INS = 1;
void paintBits;
void stage;
