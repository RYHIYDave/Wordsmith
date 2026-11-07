// THE RANGER BROUGHT UP: HIS MOVES (the art chat's helper, 6-7 Nov 2026; docs/mockups/ranger_up/README.md). Behind
// art/ranger_up.ts RANGER_UP, off; nothing of the game imports it.
//
// HIS OWN MOVES (art/moves3.ts: his crouch, his run, his shot and volley from it, his roll, struck, his fall, the squirrel and the
// sighting, unslinging his bow on his card), made over as the Brawler's benchmark and his rulebook ask (docs/mockups/
// warrior_up/README.md is the model):
//   - HIS LEGS TRUE from all eight sides (the owner, of his still: “Can you make sure his leg ratio is correct cause it seems like
//     all these guys have long upper legs and short legs below the knee”): his guard and his town stance re-posed where his feet
//     and knees go, every move that starts or ends in them following them;
//   - HIS RUN A HUNTER'S, LIGHT AND QUICK, NEVER A HIGH-STEP (the owner, 7 Nov, of the Warrior's: “all that time and you screwed
//     up his run.  why is he high stepping with his knees up?”): low over his feet, leaning in, each foot passing low, the push-off
//     leg straightening behind him; its swinging thigh never past 45 degrees from hanging straight down;
//   - HIS SHOT AND VOLLEY BY MOVEMENT 9: a big, held, readable draw, the string to his cheek, the bow arm braced, the body
//     leaning into it; the release in one frame, the string snapping, the bow arm kicking; a big follow-through (their after-image:
//     art/ranger_up.ts);
//   - every list at 30 pictures a second (his gripping runs at 60, a picture for each of the game's steps).

import { GRIP_SPEED, MOVES3, RANGER_BODY, UNITS_PER_TILE, startOf } from './moves3';
import type { Move3 } from './moves3';
import { bonesAt, solve } from './skeleton';
import type { Bones, Key3, Motion, Posed } from './skeleton';
import { wuSettle } from './warrior_up_moves';

const FR = 1 / 30;
const B = RANGER_BODY;

/** The game's own (art/moves3.ts), as the owner last saw him in the game: kept for the pictures and the checks that compare. */
export const RU_GAME = MOVES3;

/** The leg fields of a pose: where his feet and knees go, and his hips over them. */
const LEGS = ['lfx', 'lfy', 'lfz', 'lfp', 'lft', 'rfx', 'rfy', 'rfz', 'rfp', 'rft', 'lk', 'rk'] as const;
function only(p: Partial<Bones>, fields: readonly (keyof Bones)[]): Partial<Bones> {
  const o: Partial<Bones> = {};
  for (const f of fields) if (f in p) (o as Record<string, unknown>)[f] = p[f];
  return o;
}
function clean(p: Posed | Partial<Bones>): Partial<Bones> {
  const o: Partial<Bones> = { ...p };
  for (const k of ['from', 'to', 'mixK', 'lh2', 'rh2']) delete (o as Record<string, unknown>)[k];
  return o;
}

// ---------------------------------------------------------------------------------------------
// HIS GUARD, HIS LEGS TRUE FROM ALL EIGHT SIDES
//
// WHY THEY READ SHORT (tools/legs_measure.ts): the bones are a real person's (art/skeleton.ts buildOf: the knee at 0.285 of his
// height, the hip at 0.53); standing straight his lower leg reads 1.14 times his thigh on the screen from every side. But the
// game's camera looks down on him, and in his crouch (moves3.ts CROUCH) each knee was bent toward one of his sides: from there
// that shin was seen end-on and the thigh over it at its whole length. From in front his near leg read 0.65; from toward the
// camera 0.43.
//
// THE MEND: a longer, wider archer's guard, as low (his hips where they were), his body, arms and bow as they were: his front
// foot forward 14.1 and out to his left 8.4, its knee bent out over it (37.7 degrees to his left); his back foot back 19.7, its
// knee a little in (-10.8), the foot turned out (-36.7). From every one of his eight sides each leg now reads at least 1.06 from
// knee to floor to hip to knee, through every frame of his breathing (the test holds 1.05).

/** His crouch as the game has it (moves3.ts BATTLE): the owner's “I want him to stay crouched when he stops in battle”. */
export const RU_BATTLE_SEEN: Bones = MOVES3.rstand.rest;
export const RU_BATTLE_LEGS = { lfx: 14.1, lfy: 12, lk: 45, lft: 2.2, rfx: -19.7, rfy: -0.4, rk: -10.8, rft: -36.7 } as const;
/** His guard: his crouch, its legs true. */
export const RU_BATTLE: Bones = { ...RU_BATTLE_SEEN, ...RU_BATTLE_LEGS };
/** In town, upright (moves3.ts RANGER_TOWN): his front foot a step forward (13.1, it was 4.8), the other drawn in under him. */
export const RU_TOWN_SEEN: Bones = MOVES3.rtown.rest;
export const RU_TOWN: Bones = { ...RU_TOWN_SEEN, lfx: 13.1, lfy: 2.6, lk: 22.5, lft: 22.4, rfy: 5.5, rk: -7, rft: -16.3 };

/**
 * A STANCE THAT IS ALIVE (as moves3.ts `alive`, and more, as the Brawler's is: never still): two breaths, his weight going over
 * onto his front foot and back between them; and once a round a habit of his, a hunter's: his head comes round to his left and
 * back, looking along the way he is not facing, then settles on his mark again. 2.4 s round, as the game's.
 */
function alive(from: Bones, shift: Partial<Bones>, look: number): Motion {
  const breath = (k: number): Partial<Bones> => ({ pz: from.pz - 1.3 * k, bend: from.bend + 3.2 * k });
  const over: Partial<Bones> = {};
  const half: Partial<Bones> = {};
  for (const [key, v] of Object.entries(shift)) {
    (over as Record<string, number>)[key] = (from as unknown as Record<string, number>)[key] + (v as number);
    (half as Record<string, number>)[key] = (from as unknown as Record<string, number>)[key] + (v as number) / 2;
  }
  const glance = (k: number): Partial<Bones> => ({ faceTurn: from.faceTurn + look * k, faceUp: from.faceUp + 2 * k });
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.6, pose: { ...half, ...breath(1) }, ease: 'io' },
      { at: 1.2, pose: { ...over, ...glance(1) }, ease: 'io' },
      { at: 1.5, pose: { ...over, ...glance(1) }, ease: 'io' },
      { at: 1.9, pose: { ...half, ...breath(1), ...glance(0.15) }, ease: 'io' },
      { at: 2.4, pose: {}, ease: 'io' },
    ],
    loop: 0,
  };
}

export const RU_STAND3: Move3 = { ...MOVES3.rstand, name: 'The ranger, standing (brought up)', rest: RU_BATTLE, motion: alive(RU_BATTLE, { px: 1.4, py: 0.9, roll: -2.5, side: 2.5 }, 26) };
export const RU_TOWN3: Move3 = { ...MOVES3.rtown, name: 'The ranger in town (brought up)', rest: RU_TOWN, motion: alive(RU_TOWN, { px: 0.6, py: -0.9, roll: -2, side: 2 }, -22) };

// ---------------------------------------------------------------------------------------------
// HIS RUN, A HUNTER'S: light and quick, low and leaning in, never a high-step. Each foot comes down a little before him and
// goes back under him exactly as fast as the game carries him (it grips), leaves the floor off its toes with the leg straightened
// behind him, its heel flicked up a little, and comes through LOW, the foot passing close to the floor, its knee lifting only a
// little, and reaches forward to be set down. A turn of it in 25 sixtieths of a second (1.92 tiles), as the game's. His body,
// arms and bow as the game's run has them (sampled from it, moment for moment), his hips a little less low.

/** How a foot goes in his run. */
export interface RuFeet {
  /** How much of a turn each foot is on the floor; how far before his hips it comes down; when it is flat (from, to); how far
   * its heel is up as it leaves; how quickly the heel rises (the power of the time since); how high its heel flicks up behind him
   * and when; when it is level again; how high it passes; its toes up as it lands (degrees, below 0); when in the stance he is
   * lowest. */
  stance: number;
  reach: number;
  flat: readonly [number, number];
  off: number;
  rise: number;
  tuck: number;
  tuckAt: number;
  level: number;
  clear: number;
  land: number;
  lowAt: number;
  /** How low he sits, and how far he rises and falls. */
  sink: number;
  bob: number;
  /** Which way each knee points as it bends (degrees out from the way he runs: the left knee to his left, the right to his right). */
  knee: number;
}
export const RU_RUN_FEET: RuFeet = { stance: 0.36, reach: 9.2, flat: [0.04, 0.12], off: 46, rise: 0.6, tuck: 4.2, tuckAt: 0.2, level: 0.46, clear: 1.3, land: -3, lowAt: 0.45, sink: 1.2, bob: 0.9, knee: 2 };
const RUN_PERIOD = 25 / 60;

function smooth01(k: number): number {
  const c = Math.max(0, Math.min(1, k));
  return c * c * (3 - 2 * c);
}

/** His run: its feet by `f`, its body, arms and bow from the game's run `upper` at the same moment of its turn. */
export function ruRun(upper: Move3, rest: Bones, f: RuFeet = RU_RUN_FEET): Motion {
  const period = RUN_PERIOD;
  const n = Math.round(period * 60);
  const travel = GRIP_SPEED * UNITS_PER_TILE * f.stance * period;
  const S = f.stance;
  const shape = new Map<number, { dx: number; dz: number }>();
  const lifted = (deg: number): { dx: number; dz: number } => {
    const key = Math.round(deg * 100) / 100;
    let r = shape.get(key);
    if (!r) {
      const at = { ...rest, lfx: 0, lfz: 0, lfp: 0 } as Posed;
      const flat = solve(B, at);
      const tip = solve(B, { ...at, lfp: key } as Posed);
      const a = key < 0 ? flat.heelL : flat.toeL;
      const b = key < 0 ? tip.heelL : tip.toeL;
      shape.set(key, (r = { dx: a[0] - b[0], dz: a[2] - b[2] }));
    }
    return r;
  };
  const [f0, f1] = f.flat;
  const foot = (phase: number): { x: number; z: number; pitch: number } => {
    const ph = ((phase % 1) + 1) % 1;
    if (ph < S) {
      const u = ph / S;
      const pitch = u < f0 ? f.land * (1 - smooth01(u / f0)) : u <= f1 ? 0 : f.off * ((u - f1) / (1 - f1)) ** f.rise;
      const k = lifted(pitch);
      return { x: f.reach - travel * u + k.dx, z: k.dz, pitch };
    }
    const v = (ph - S) / (1 - S);
    const pitch = v < f.tuckAt ? f.off + (70 - f.off) * smooth01(v / f.tuckAt) : v < f.level ? 70 * (1 - smooth01((v - f.tuckAt) / (f.level - f.tuckAt))) : f.land * smooth01((v - f.level) / (1 - f.level));
    const leave = lifted(f.off);
    const land = lifted(f.land);
    const from = f.reach - travel + leave.dx;
    const to = f.reach + land.dx;
    const x = from + (to - from) * smooth01(v);
    const tuck = f.tuck * Math.sin(Math.PI * Math.min(1, v / (2 * f.tuckAt))) ** 2;
    const low = f.clear * Math.min(1, v / 0.012, (1 - v) / 0.012);
    const h = Math.max(v < 2 * f.tuckAt ? tuck : 0, low);
    return { x, z: h + lifted(pitch).dz, pitch };
  };
  const uk = upper.motion.keys;
  const uLoop = upper.motion.loop ?? 0;
  const uSpan = uk[uk.length - 1].at - uLoop;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const ph = i / n;
    const U = clean(bonesAt(uk, upper.rest, uLoop + uSpan * (ph % 1)));
    for (const k of LEGS) delete (U as Record<string, unknown>)[k];
    const l = foot(ph);
    const r = foot(ph + 0.5);
    keys.push({
      at: ph * period,
      ease: 'lin',
      pose: {
        ...U,
        pz: -f.sink - f.bob * Math.cos((2 * ph - 2 * S * f.lowAt) * Math.PI * 2),
        lfx: l.x, lfy: -1.2, lfz: l.z, lfp: l.pitch, lft: 2, lk: f.knee,
        rfx: r.x, rfy: 1.2, rfz: r.z, rfp: r.pitch, rft: -2, rk: -f.knee,
      },
    });
  }
  return { keys, loop: 0 };
}
const STRIDE = GRIP_SPEED * RUN_PERIOD;
export const RU_RUN3: Move3 = { ...MOVES3.rrun, name: 'The ranger runs (brought up)', rest: RU_BATTLE, motion: ruRun(MOVES3.rrun, RU_BATTLE), stride: STRIDE };
export const RU_TOWN_RUN3: Move3 = { ...MOVES3.rtownrun, name: 'The ranger runs in town (brought up)', rest: RU_TOWN, motion: ruRun(MOVES3.rtownrun, RU_TOWN), stride: STRIDE };

/** Coming to a stand out of a run, from a moment of its turn (the Warrior's way: each foot carried LOW to its place). */
export function ruSettle(runMove: Move3, phase: number, to: Bones): Motion {
  return wuSettle(runMove, phase, to, 0.24, 1.2);
}
/** Setting off from a stance into a run (moves3.ts startOf, on his runs). */
export function ruStart(runMove: Move3, stance: Bones): { motion: Motion; phase: number } {
  return startOf(runMove, stance);
}

// ---------------------------------------------------------------------------------------------
// HIS MOVES MADE OVER FROM THE GAME'S: their keys at new moments (a held draw where it was a flash of one), his legs moved from
// where the game's crouch had them to where his guard has them now.

/** A key of the game's move at a new moment: its pose as the game keys it, or the game's pose `at` that moment of it. */
interface Re {
  at: number;
  from: number | 'rest';
  ease?: Key3['ease'];
  more?: Partial<Bones>;
  /** How much further back along the arrow's line his string hand flies than the game's (the release, the follow-through). */
  back?: number;
  /** His string hand moved (on his own forward, left, up), from where the game has it. */
  nudge?: readonly [number, number, number];
}
/** The game's move `m`'s keys laid at new moments (frames); each leg field it keys moved by how far his rest moved it. */
function remade(m: Move3, rest: Bones, plan: readonly Re[], legsFrom: Bones = m.rest, keepLegs = false): Motion {
  const keys: Key3[] = plan.map((p) => {
    if (p.from === 'rest') return { at: p.at * FR, pose: { ...(p.more ?? {}) }, ...(p.ease ? { ease: p.ease } : {}) };
    // (the game's pose at that moment, whole: so that a key between two of its own is the very pose it passes through)
    const g = clean(bonesAt(m.motion.keys, m.rest, p.from * FR));
    if (!keepLegs) for (const f of LEGS) (g as Record<string, number>)[f] = (g as Record<string, number>)[f] - legsFrom[f] + rest[f];
    if (p.nudge && g.rhIn === 1) {
      (g as Record<string, number>).rhx += p.nudge[0];
      (g as Record<string, number>).rhy += p.nudge[1];
      (g as Record<string, number>).rhz += p.nudge[2];
    }
    if (p.back && g.rhIn === 1) {
      const a = ((g.wAz ?? 0) * Math.PI) / 180;
      const e = ((g.wEl ?? 0) * Math.PI) / 180;
      (g as Record<string, number>).rhx -= p.back * Math.cos(e) * Math.cos(a);
      (g as Record<string, number>).rhy -= p.back * Math.cos(e) * Math.sin(a);
      (g as Record<string, number>).rhz -= p.back * Math.sin(e) * 0.3;
    }
    return { at: p.at * FR, pose: { ...g, ...(p.more ?? {}) }, ...(p.ease ? { ease: p.ease } : {}) };
  });
  return { keys };
}

// ---- THE SHOT, BY MOVEMENT 9 ----
//   frames 0-7    THE DRAW: the bow up from low to level as his body turns side-on to the mark over his front foot, the string
//                 drawn back to his cheek, his bow arm out straight and braced, his chest leaning into it (the game's own pose);
//   7-9           HELD at full draw, the glint running to the arrow's point (his aim settling: a little turn further into it);
//   9-10          THE RELEASE, ONE FRAME: the arrow gone, the string snapped straight, his string hand flown back past his ear,
//                 the bow kicked on at the mark and rocking in his hand; the string and the bow where they were the frame before
//                 left as after-images (art/ranger_up.ts);
//   10-18         THE FOLLOW-THROUGH, held: the bow still on the mark, the string hand open behind his ear, watching the arrow in;
//   18-26         down into his guard, the next arrow on the string.
/** The shot's release: the arrow goes (the game's `hit`; the rules' `shot.windup` with the switch on). */
export const RU_SHOT_HIT = 10 * FR;
export const RU_SHOT_HELD: readonly [number, number] = [7, 9];
export const RU_SHOT_LONG = 26 * FR;
export const RU_SHOT3: Move3 = {
  ...MOVES3.shot,
  name: 'Shot (Movement 9)',
  rest: RU_BATTLE,
  motion: {
    hit: RU_SHOT_HIT,
    keys: remade(MOVES3.shot, RU_BATTLE, [
      { at: 0, from: 'rest' },
      { at: 3, from: 2, ease: 'io', nudge: [0, -0.8, 0] },
      { at: 7, from: 4, ease: 'io', nudge: [0, -1.8, 0] },
      { at: 9, from: 4.7, ease: 'io', nudge: [0, -1.8, 0] },
      { at: 10, from: 5, ease: 'lin', back: 6.4, nudge: [0, -6.4, 2.0] },
      { at: 14, from: 7, ease: 'io', back: 8.8, nudge: [0, -6.4, 2.0] },
      { at: 18, from: 10, ease: 'io', back: 8.2, nudge: [0, -5.6, 1.6] },
      { at: 26, from: 'rest', ease: 'io' },
    ], RU_BATTLE_SEEN).keys,
  },
};

// ---- THE VOLLEY, BY MOVEMENT 9, BIGGER ----
//   0-5     down onto his back knee from his crouch, his eyes going up;
//   5-9     THE DRAW, up at the sky: leaning right back over his knee, the string to his cheek;
//   9-11    HELD at full draw;
//   11-12   THE RELEASE, ONE FRAME: the arrows gone (the game's own fan of them), the string snapped, the bow kicked up;
//   12-20   THE FOLLOW-THROUGH, held: watching them go up, the bow still raised;
//   20-32   forward off the lean and up off his knee into his guard.
export const RU_VOLLEY_HIT = 12 * FR;
export const RU_VOLLEY_HELD: readonly [number, number] = [9, 11];
export const RU_VOLLEY_LONG = 32 * FR;
export const RU_VOLLEY3: Move3 = {
  ...MOVES3.volley,
  name: 'Volley (Movement 9)',
  rest: RU_BATTLE,
  motion: {
    hit: RU_VOLLEY_HIT,
    keys: remade(MOVES3.volley, RU_BATTLE, [
      { at: 0, from: 'rest' },
      { at: 3, from: 2, ease: 'in' },
      { at: 5, from: 3, ease: 'out' },
      { at: 9, from: 5, ease: 'out' },
      { at: 11, from: 5.6, ease: 'io' },
      { at: 12, from: 6, ease: 'lin', back: 1.8 },
      { at: 15, from: 8, ease: 'out', back: 4.6 },
      { at: 20, from: 8, ease: 'io', back: 4.2 },
      { at: 25, from: 12, ease: 'io' },
      { at: 29, from: 14.5, ease: 'io' },
      { at: 32, from: 'rest', ease: 'io' },
    ], RU_BATTLE_SEEN, true).keys,
  },
};

// ---- HIS ROLL, STRUCK, HIS FALL: the game's, from his guard ----
export const RU_ROLL3: Move3 = { ...MOVES3.roll, name: "The ranger's roll (brought up)", rest: RU_BATTLE, motion: remadeAll(MOVES3.roll, RU_BATTLE, RU_BATTLE_SEEN, (at) => at * 30 >= 13) };
export const RU_REEL3: Move3 = { ...MOVES3.rreel, name: 'The ranger is struck hard (brought up)', rest: RU_BATTLE, motion: remadeAll(MOVES3.rreel, RU_BATTLE, RU_BATTLE_SEEN) };
export const RU_LURCH3: Move3 = { ...MOVES3.rlurch, name: 'The ranger is struck from behind (brought up)', rest: RU_BATTLE, motion: remadeAll(MOVES3.rlurch, RU_BATTLE, RU_BATTLE_SEEN) };
/** His fall: thrown back, a step to keep his feet, down on one knee with his bow laid down, his head bowing as the light goes out
 * of him (not to his knees and then forward). Its steps back from his guard, its kneel where it was. */
export const RU_FALL3: Move3 = { ...MOVES3.rfall, name: "The ranger's fall (brought up)", rest: RU_BATTLE, motion: remadeAll(MOVES3.rfall, RU_BATTLE, RU_BATTLE_SEEN, (at) => at * 30 < 19) };

/** Every key of a game's move, its legs moved from the game's rest to his (only the keys `which` says, if it is given). */
function remadeAll(m: Move3, rest: Bones, legsFrom: Bones, which: (at: number) => boolean = () => true): Motion {
  return {
    ...m.motion,
    keys: m.motion.keys.map((k) => {
      if (!which(k.at)) return k;
      const p: Partial<Bones> = { ...k.pose };
      for (const f of LEGS) if (f in p) (p as Record<string, number>)[f] = (p as Record<string, number>)[f] - legsFrom[f] + rest[f];
      return { ...k, pose: p };
    }),
  };
}

// ---- LEFT STANDING: the squirrel and the sighting, in a fight and in town; his card's unslinging ----
export const RU_SQUIRREL3: Move3 = { ...MOVES3.squirrel, name: 'The ranger and his squirrel (brought up)', rest: RU_BATTLE };
export const RU_SIGHTING3: Move3 = {
  ...MOVES3.sighting,
  name: 'The ranger sights along an arrow (brought up)',
  rest: RU_BATTLE,
  // (he rises a little less as he sights, so that his long back leg is never stretched off the floor)
  motion: {
    ...MOVES3.sighting.motion,
    keys: MOVES3.sighting.motion.keys.map((k) => {
      const p: Partial<Bones> = { ...k.pose };
      if ('pz' in p) p.pz = RU_BATTLE.pz + 0.25;
      // (the bow let down low by his side held out a little and less steeply, clear of his front leg, which his guard puts
      // further out than the game's crouch did)
      if (p.lhIn === 0 && p.lhz !== undefined && p.lhz < -10) Object.assign(p, { lhy: (p.lhy ?? 0) - 3, lhx: (p.lhx ?? 0) + 3, wEl: -12 });
      return { ...k, pose: p };
    }),
  },
};
export const RU_TSQUIRREL3: Move3 = { ...MOVES3.tsquirrel, name: 'The ranger and his squirrel, in town (brought up)', rest: RU_TOWN };
export const RU_TSIGHTING3: Move3 = { ...MOVES3.tsighting, name: 'The ranger sights along an arrow, in town (brought up)', rest: RU_TOWN };
/** His card's ready: the bow off his back (from his town stance), an arrow on the string, and down into his guard. */
export const RU_DRAW3: Move3 = {
  ...MOVES3.rdraw,
  name: 'The ranger unslings his bow (brought up)',
  rest: RU_TOWN,
  motion: { keys: drawKeys() },
};

/** The game's unslinging, his feet where his town stance has them until the bow is up; then into his guard in two steps, each
 * foot lifted and set down where the guard has it (the game slid them there). */
function drawKeys(): Key3[] {
  const m = MOVES3.rdraw;
  const g = (t: number): Partial<Bones> => clean(bonesAt(m.motion.keys, m.rest, t * FR));
  const town = only(RU_TOWN, LEGS);
  const guard = only(RU_BATTLE, LEGS);
  const out: Key3[] = [];
  for (const k of m.motion.keys) {
    const f = k.at / FR;
    if (f > 19 + 1e-6) break;
    out.push({ ...k, pose: { ...k.pose, ...town } });
  }
  const half = (a: number, b: number): number => (a + b) / 2;
  // (his front foot out to where his guard has it, lifted low; then his back foot back)
  out.push({ at: 21.5 * FR, pose: { ...g(21.5), ...town, lfx: half(town.lfx as number, guard.lfx as number), lfy: half(town.lfy as number, guard.lfy as number), lfz: 1.4, lfp: 6, lk: guard.lk }, ease: 'io' });
  out.push({ at: 23 * FR, pose: { ...g(23), ...town, ...only(RU_BATTLE, ['lfx', 'lfy', 'lfz', 'lfp', 'lft', 'lk']) }, ease: 'io' });
  out.push({ at: 24.5 * FR, pose: { ...g(24.5), ...guard, rfx: half(town.rfx as number, guard.rfx as number), rfy: half(town.rfy as number, guard.rfy as number), rfz: 1.4, rfp: 6 }, ease: 'io' });
  const last = m.motion.keys[m.motion.keys.length - 2];
  out.push({ ...last, pose: { ...last.pose, ...guard } });
  const end = m.motion.keys[m.motion.keys.length - 1];
  out.push({ ...end, pose: { ...end.pose, ...guard } });
  return out;
}

/** His moves brought up, by the game's short names. */
export const RU_MOVES: Record<string, Move3> = {
  rstand: RU_STAND3, rtown: RU_TOWN3, rrun: RU_RUN3, rtownrun: RU_TOWN_RUN3,
  shot: RU_SHOT3, volley: RU_VOLLEY3, roll: RU_ROLL3, rreel: RU_REEL3, rlurch: RU_LURCH3, rfall: RU_FALL3,
  squirrel: RU_SQUIRREL3, sighting: RU_SIGHTING3, tsquirrel: RU_TSQUIRREL3, tsighting: RU_TSIGHTING3, rdraw: RU_DRAW3,
};
