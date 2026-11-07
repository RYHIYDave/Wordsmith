// THE RANGER BROUGHT UP: HIS MOVES (the art chat's helper, 6-7 Nov 2026; docs/mockups/ranger_up/README.md). Behind
// art/ranger_up.ts RANGER_UP, off; nothing of the game imports it.
//
// HIS OWN MOVES (art/moves3.ts: his crouch, his run, his shot and volley from it, his roll, struck, his fall, the squirrel and the
// sighting, unslinging his bow on his card), made over as the Brawler's benchmark and his rulebook ask (docs/mockups/
// warrior_up/README.md is the model):
//   - HIS LEGS' LENGTHS (the owner, of his still: “Can you make sure his leg ratio is correct cause it seems like all these guys
//     have long upper legs and short legs below the knee”): A SMALL CHANGE TO HIS BONES (RU_BODY below: the knee joint raised a
//     little, the shin longer and the thigh shorter by as much, the hip where it was), so that it shows in every pose at once;
//     NEVER A RE-POSE (the owner, 7 Nov: “Cmon.  He’s not a gunfighter why is he so bow legged.  Just please do it right, I don’t
//     want to have to correct every single one of these because we made a minuscule change to the leg length”): his stances'
//     legs are the game's own, the same feet, the same knee directions, the same depth of crouch;
//   - HIS RUN A HUNTER'S, LIGHT AND QUICK, NEVER A HIGH-STEP (the owner, 7 Nov, of the Warrior's: “all that time and you screwed
//     up his run.  why is he high stepping with his knees up?”): low over his feet, leaning in, each foot passing low, the push-off
//     leg straightening behind him; its swinging thigh never past 33 degrees from hanging straight down in his runs, 49 in his
//     stops and setting off (the Warrior's check fails past 50);
//   - HIS SHOT AND VOLLEY BY MOVEMENT 9: a big, held, readable draw, the string to his cheek, the bow arm braced, the body
//     leaning into it; the release in one frame, the string snapping, the bow arm kicking; a big follow-through (their after-image:
//     art/ranger_up.ts);
//   - every list at 30 pictures a second (his gripping runs at 60, a picture for each of the game's steps).

import { GRIP_SPEED, MOVES3, RANGER_BODY, UNITS_PER_TILE, runWaysOf, startOf } from './moves3';
import type { Move3 } from './moves3';
import { add, aimFor, along, bonesAt, chestOf, elbowFor, norm, solve } from './skeleton';
import type { Bones, Build, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

const FR = 1 / 30;

// ---------------------------------------------------------------------------------------------
// HIS BONES: THE KNEE JOINT RAISED A LITTLE
//
// The game's Ranger (moves3.ts RANGER_BODY, art/skeleton.ts buildOf) stands with his knee to the floor (the shin, and the ankle
// under it) 1.16 times his hip to his knee (the thigh). His knee joint is raised a little, the hip where it was: the thigh
// shorter and the shin longer by the same amount (0.90 of a unit of his 57: under half a game pixel), so that standing
// straight his shin is 1.3 times his thigh. His hips and his feet are where they were in every pose; only where the knee bends
// moves. Every list of his is on these bones, his run too: he is one body throughout.
export const RU_SHIN_RATIO = 1.3;
/** How far his knee joint is raised (units). */
export const RU_KNEE_UP = RANGER_BODY.thigh - (RANGER_BODY.ankle + RANGER_BODY.shank + RANGER_BODY.thigh) / (1 + RU_SHIN_RATIO);
/** His body, brought up: the game's Ranger's, his knee joint raised by RU_KNEE_UP. */
export const RU_BODY: Build = { ...RANGER_BODY, thigh: RANGER_BODY.thigh - RU_KNEE_UP, shank: RANGER_BODY.shank + RU_KNEE_UP };
const B = RU_BODY;

/** The game's own (art/moves3.ts), as the owner last saw him in the game: kept for the pictures and the checks that compare. */
export const RU_GAME = MOVES3;

/** The leg fields of a pose: where his feet and knees go, and his hips over them. */
const LEGS = ['lfx', 'lfy', 'lfz', 'lfp', 'lft', 'rfx', 'rfy', 'rfz', 'rfp', 'rft', 'lk', 'rk'] as const;
/** The fields of his arms and what he holds. */
const ARMS = ['lhIn', 'lhx', 'lhy', 'lhz', 'le', 'rhIn', 'rhx', 'rhy', 'rhz', 're', 'wAz', 'wEl', 'wRoll', 'draw'] as const;
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
// HIS GUARD AND HIS TOWN STANCE: THE GAME'S OWN LEGS
//
// The owner, 7 Nov, having seen this morning's guard (his feet at the game's width, but his back foot turned right out and its
// knee over it): “Cmon.  He’s not a gunfighter why is he so bow legged.  Just please do it right, I don’t want to have to correct
// every single one of these because we made a minuscule change to the leg length”. So his stances' legs are exactly the game's
// (moves3.ts CROUCH, RANGER_TOWN): the same feet, the same knee directions, the same depth of crouch; every re-posing done for the
// leg measure (last night's wide guard, this morning's turned-out back leg, his town stance's, the Volley's stepped-in kneel)
// taken out. What he asked for on the legs is in his bones (RU_BODY, above), so it shows in every pose at once.
//
// THE GAME'S OWN GUARD BOWS A LITTLE (ranger_up_review.ts ruBowLegs; README "His legs"): his front knee, his left, is turned out
// over its foot (12 degrees to the left of where he faces, his hips turned 28 to the right), and lies outside the line from his
// hip to his foot, by up to 2.9 game pixels as his eight sides show it. His legs are the game's, so it is no worse (the test holds
// every list he stands in to the game's own, or RU_BOW_LEGS_MOST, 1 game pixel).

/** His crouch as the game has it (moves3.ts BATTLE): the owner's “I want him to stay crouched when he stops in battle”. */
export const RU_BATTLE_SEEN: Bones = MOVES3.rstand.rest;
/** His guard: the game's crouch, its legs and hips exactly the game's. */
/** (and his bow canted further over in his hand, 70 degrees where it was 18, as a hunter's is: so that from straight behind him
 * one limb of it stands out past his side, where held nearly upright before him his body hid it) */
export const RU_BOW_CANT = 70;
export const RU_BATTLE: Bones = { ...RU_BATTLE_SEEN, wRoll: RU_BOW_CANT };
/** In town, upright: the game's town stance (moves3.ts RANGER_TOWN), exactly. */
export const RU_TOWN_SEEN: Bones = MOVES3.rtown.rest;
export const RU_TOWN: Bones = RU_TOWN_SEEN;

/**
 * A STANCE THAT IS ALIVE (as moves3.ts `alive`, and more, as the Brawler's is: never still): two breaths, his weight going over
 * onto his front foot and back between them; and once a round a habit of his, a hunter's: his head comes round to his left and
 * back, looking along the way he is not facing, then settles on his mark again. 2.4 s round, as the game's.
 */
export function alive(from: Bones, shift: Partial<Bones>, look: number, deep: { pz: number; bend: number; up?: number; upBend?: number } = { pz: 0.45, bend: 3.6 }): Motion {
  const breath = (k: number): Partial<Bones> => (k >= 0 ? { pz: from.pz - deep.pz * k, bend: from.bend + deep.bend * k } : { pz: from.pz - (deep.up ?? 0) * k, bend: from.bend + (deep.upBend ?? 0) * k });
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
      { at: 1.2, pose: { ...over, ...glance(1), ...(deep.up ? breath(-1) : {}) }, ease: 'io' },
      { at: 1.5, pose: { ...over, ...glance(1), ...(deep.up ? breath(-1) : {}) }, ease: 'io' },
      { at: 1.9, pose: { ...half, ...breath(1), ...glance(0.15) }, ease: 'io' },
      { at: 2.4, pose: {}, ease: 'io' },
    ],
    loop: 0,
  };
}

/** His breathing in his guard: out, his hips sinking 0.6 and his back bending over 5 degrees; in, as his weight goes over onto
 * his front foot, his hips rising 0.55 and his back straightening 8 (his chest rises and falls 0.61 of a game pixel, where the
 * bosses' check for a stance that is alive asks 0.6). His feet and knees stay where the game's are through it. */
export const RU_BREATH = { pz: 0.6, bend: 5, up: 0.55, upBend: 8 } as const;
export const RU_STAND3: Move3 = { ...MOVES3.rstand, name: 'The ranger, standing (brought up)', build: B, rest: RU_BATTLE, motion: alive(RU_BATTLE, { px: 0.8, py: 0.9, roll: -2, side: 2 }, 26, RU_BREATH) };
export const RU_TOWN3: Move3 = { ...MOVES3.rtown, name: 'The ranger in town (brought up)', build: B, rest: RU_TOWN, motion: alive(RU_TOWN, { py: -0.9, roll: -2, side: 2 }, -22) };

// ---------------------------------------------------------------------------------------------
// HIS BOW SLUNG ON HIS BACK (in town): as the game slings it (carried.ts backPlace, between his shoulder blades, outside his
// cloak and quiver), but lying further over, its upper limb toward his left shoulder 58 degrees from plumb where the game's
// leans 30: so that its two ends stand out past him on either side and are seen from in front of him too.
export const RU_SLUNG_LEAN = 80;
export function ruSlung(): { at: V3; point: V3; across: V3 } {
  const L = (RU_SLUNG_LEAN * Math.PI) / 180;
  return { at: [-(B.ribDeep + 6.6), -1.7, -B.chest * 0.53], point: [0, -Math.cos(L), Math.sin(L)], across: [0, Math.sin(L), Math.cos(L)] };
}
/** That place on a posed figure: the grip, the way the bow points and the line across it. */
export function ruOnBack(s: Skeleton): { grip: V3; point: V3; across: V3 } {
  const p = ruSlung();
  return { grip: add(s.neck, along(s.chest, p.at)), point: norm(along(s.chest, p.point)), across: norm(along(s.chest, p.across)) };
}
/** His left hand on the bow where it lies on his back, the bow lying in it just so (as carried.ts holdOnBack). */
function ruHoldOnBack(body: Pick<Bones, 'yaw' | 'pitch' | 'roll' | 'twist' | 'bend' | 'side'>): Partial<Bones> {
  const p = ruSlung();
  const chest = chestOf(body);
  return { lhIn: 0, lhx: p.at[0], lhy: p.at[1] - B.shoulderHalf, lhz: p.at[2] + B.shoulderDrop, ...aimFor(along(chest, p.point), along(chest, p.across)) };
}

// ---------------------------------------------------------------------------------------------
// DOWN ON HIS BACK KNEE (the Volley, his fall): his back foot pitched up onto its toes, his hips let down until that knee is all
// but on the floor. Nothing slides: the toes the back foot turns on stay where they are (art/boss_checks.ts, SLIDE).

/** THE GAME'S OWN KNEEL (moves3.ts KNEEL, as its Volley holds it at full draw): where his feet are, which way his knees point,
 * where his hips are and how low. The Volley kneels exactly there (only stepping where the game slid). */
export const RU_GAME_KNEEL: Bones = clean(bonesAt(MOVES3.volley.motion.keys, MOVES3.volley.rest, 5 * FR)) as Bones;
const KNEEL_SK = solve(B, RU_GAME_KNEEL);
/** WHERE HIS FALL'S STEP BACK LANDS, as it was placed (a7e24935, on the back foot of a guard since taken out): the fall is kept
 * exactly as it was. (A foot's toes are where its foot is put, whatever the bones above it.) */
const FALL_FROM = { lfx: 14.1, lfy: 12, lk: 45, lft: 2.2, rfx: -19.7, rfy: -0.4, rk: -10.8, rft: -36.7 } as const;
const FALL_SK = solve(B, { ...RU_BATTLE_SEEN, ...FALL_FROM });
/** His back foot pitched `p` degrees up onto its toes, the toes kept at `toe` (where the game's kneel has them, unless given). */
export function ruOnToes(p: number, toe: V3 = KNEEL_SK.toeR, turn: number = RU_GAME_KNEEL.rft): Partial<Bones> {
  const D = Math.PI / 180;
  const c = Math.cos(p * D);
  const sn = Math.sin(p * D);
  const v: V3 = [B.ball * c - B.ankle * sn, 0, -B.ball * sn - B.ankle * c];
  const ct = Math.cos(turn * D);
  const st = Math.sin(turn * D);
  const off: V3 = [v[0] * ct - v[1] * st, v[0] * st + v[1] * ct, v[2]];
  return { rfx: toe[0] - off[0], rfy: toe[1] - off[1] + B.stance, rfz: toe[2] - off[2] - B.ankle, rfp: p, rft: turn };
}

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
export const RU_RUN_FEET: RuFeet = { stance: 0.36, reach: 9.2, flat: [0.04, 0.12], off: 46, rise: 0.6, tuck: 3.2, tuckAt: 0.2, level: 0.46, clear: 1.3, land: -3, lowAt: 0.45, sink: 1.2, bob: 0.9, knee: 2 };
const RUN_PERIOD = 25 / 60;
/** How far (degrees) the bow he runs with is tipped up off level along his way. */
export const RU_RUN_BOW_TIP = 0;
/** ... and how far further out from his side it is carried. */
export const RU_RUN_BOW_OUT = 6;

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
    // (the bow where he carries it, as the owner liked it, but its upper limb tipped forward and up off level: so that from
    // before and behind him, where a level bow is end-on, a good length of it shows)
    if ((U.stow ?? 0) < 0.5 && U.lhIn === 0) {
      U.wRoll = (U.wRoll ?? 0) - RU_RUN_BOW_TIP;
      U.lhy = (U.lhy ?? 0) + RU_RUN_BOW_OUT;
    }
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
export const RU_RUN3: Move3 = { ...MOVES3.rrun, name: 'The ranger runs (brought up)', build: B, rest: RU_BATTLE, motion: ruRun(MOVES3.rrun, RU_BATTLE), stride: STRIDE };
export const RU_TOWN_RUN3: Move3 = { ...MOVES3.rtownrun, name: 'The ranger runs in town (brought up)', build: B, rest: RU_TOWN, motion: ruRun(MOVES3.rtownrun, RU_TOWN), stride: STRIDE };

/** HIS RUN THE OTHER THREE WAYS (backing away from his mark, going across it: moves3.ts runWaysOf), on his run with its heel
 * kept low as it recovers (backing away, the heel tucked up behind him would be in front of him, and his knee with it). */
export const RU_RUN_WAYS: Move3 = { ...RU_RUN3, name: 'The ranger runs (brought up)', motion: ruRun(MOVES3.rrun, RU_BATTLE, { ...RU_RUN_FEET, tuck: 0.5, clear: 0.8, reach: 6.5 }) };
/**
 * HIS RUN THE OTHER THREE WAYS, as the game asks for them (to his left, backing away, to his right: moves3.ts WALKS): going
 * across, moves3.ts runWaysOf on his run with its heel kept low; BACKING AWAY, his run played backward (each foot reaching back
 * and set down behind him, toe first, its heel lifting behind him as it comes off the floor before him), his body upright as
 * runWaysOf has it. (runWaysOf turns the run's feet round, which put the heel he tucks up behind him in front of him, and his
 * knee up with it.)
 */
export function ruRunWays(): Move3[] {
  const [left, back, right] = runWaysOf(RU_RUN_WAYS);
  const keys = RU_RUN3.motion.keys;
  const upright = runWaysOf(RU_RUN3)[1].motion.keys;
  const n = keys.length;
  const backing: Move3 = {
    ...back,
    motion: {
      loop: 0,
      keys: keys.map((k, i) => {
        const legs = only(keys[(n - 1 - i) % n].pose, [...LEGS, 'pz']);
        // (a foot pitched heel-up as it leaves the floor behind him, run backward, leaves it toe-up before him: turned over)
        const flip = (v: number | undefined): number | undefined => (v === undefined ? v : v > 0 ? -v * 0.3 : -v);
        return { at: k.at, ease: 'lin', pose: { ...upright[i].pose, ...legs, lfp: flip(legs.lfp) ?? 0, rfp: flip(legs.rfp) ?? 0 } };
      }),
    },
  };
  return [left, backing, right];
}



/**
 * Coming to a stand out of a run, from a moment of its turn (the Warrior's way: each foot carried LOW to its place). The way is
 * the Warrior's as art/warrior_up_moves.ts had it at 9057f94b (its wuSettle), kept here for him: the Warrior moves as the game
 * did again (7b95f7b6, his words of 7 Nov) and has it no more.
 */
export function ruSettle(runMove: Move3, phase: number, to: Bones): Motion {
  return settleOutOfRun(runMove, phase, to, 0.24, 0.8);
}
function settleOutOfRun(runMove: Move3, phase: number, to: Bones, long = 0.24, lift = RU_STEP_LIFT): Motion {
  const { keys, loop } = runMove.motion;
  const span = keys[keys.length - 1].at - (loop ?? 0);
  const p = bonesAt(keys, runMove.rest, (loop ?? 0) + span * (((phase % 1) + 1) % 1)) as Posed;
  const from: Partial<Bones> = { ...p };
  for (const k of ['from', 'to', 'mixK', 'lh2', 'rh2']) delete (from as Record<string, unknown>)[k];
  const leftFirst = p.lfz > p.rfz;
  const half = (a: number, b: number): number => (a + b) / 2;
  const foot = (left: boolean, where: 'run' | 'up' | 'stance'): Partial<Bones> => {
    if (where === 'run') return left ? { lfx: p.lfx, lfy: p.lfy, lfz: p.lfz, lfp: p.lfp, lft: p.lft } : { rfx: p.rfx, rfy: p.rfy, rfz: p.rfz, rfp: p.rfp, rft: p.rft };
    if (where === 'stance') return left ? { lfx: to.lfx, lfy: to.lfy, lfz: to.lfz, lfp: to.lfp, lft: to.lft } : { rfx: to.rfx, rfy: to.rfy, rfz: to.rfz, rfp: to.rfp, rft: to.rft };
    // (carried low, half way from where it was in the run to where it goes, its toe a little down)
    return left
      ? { lfx: half(p.lfx, to.lfx), lfy: half(p.lfy, to.lfy), lfz: lift, lfp: 6, lft: half(p.lft, to.lft) }
      : { rfx: half(p.rfx, to.rfx), rfy: half(p.rfy, to.rfy), rfz: lift, rfp: 6, rft: half(p.rft, to.rft) };
  };
  const second = !leftFirst;
  const far = Math.hypot((second ? p.lfx : p.rfx) - (second ? to.lfx : to.rfx), (second ? p.lfy : p.rfy) - (second ? to.lfy : to.rfy)) > 1.5;
  const mid: Partial<Bones> = {};
  for (const f of ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'faceTurn', 'faceUp', 'faceTilt'] as const) mid[f] = (p[f] + to[f]) / 2;
  // (as the first foot comes through, he draws himself up a little over it: his weight checked, his leg not folded under him)
  const up = { pz: Math.max(p.pz, to.pz) + RU_STEP_RISE };
  const steps: Key3[] = [
    { at: 0, pose: from },
    { at: long * 0.22, pose: { ...from, ...up, ...foot(leftFirst, 'up'), ...foot(second, 'run') }, ease: 'out' },
    { at: long * 0.45, pose: { ...mid, ...foot(leftFirst, 'stance'), ...foot(second, 'run') }, ease: 'io' },
  ];
  if (far) steps.push({ at: long * 0.7, pose: { pz: to.pz + RU_STEP_RISE, ...foot(leftFirst, 'stance'), ...foot(second, 'up') }, ease: 'io' });
  steps.push({ at: long, pose: {}, ease: 'io' });
  return { keys: steps };
}
/** How high a foot is carried as he steps into a stance out of his run, and how far he draws himself up over it. */
const RU_STEP_LIFT = 1.4;
const RU_STEP_RISE = 1.5;
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
  build: B,
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
//   0-7     down onto his back knee where the game's kneel has him (moves3.ts KNEEL: his front foot stepped out before him,
//           lifted clear, then his back foot stepped back, lifted clear, and turning up onto its toes there: the game slid them),
//           drawing up at the sky as he goes: leaning right back over his knee;
//   7-11    the string to his cheek, HELD at full draw (his string hand drawn a little out from his face, clear of it);
//   11-12   THE RELEASE, ONE FRAME: the arrows gone (the game's own fan of them), the string snapped, his string hand flung
//           straight down past his ear to his chest (a fall seen as far from every one of his sides);
//   12-22   THE FOLLOW-THROUGH, held: his hand on down a little, watching them go up, the bow still raised;
//   22-32   his arms back into his guard, the string hand round his side; forward off the lean and up off his knee, his front
//           his back foot stepped in, lifted clear, then his front foot.
export const RU_VOLLEY_HIT = 12 * FR;
export const RU_VOLLEY_HELD: readonly [number, number] = [9, 11];
export const RU_VOLLEY_LONG = 32 * FR;
/** His string hand drawn a little out from his face (back, to his right), so that its forearm clears his head. */
const VOLLEY_CLEAR = [-1, -2, 0] as const;
/** ... and as the string goes, flung down past his ear to his chest in one frame (straight down: a fall seen as far from
 * every side, where a hand flying back along the arrow is end-on from some), and on down a little after. */
const VOLLEY_SNAP = [1.6, 0.9, -12.5] as const;
const VOLLEY_ON = [1.6, 0.9, -18.5] as const;
/** How far his front foot has stepped out from his guard to where the game's kneel has it at each key, and how high it is lifted. */
const VOLLEY_STEP: Readonly<Record<number, readonly [number, number]>> = { 1: [0.2, 1.8], 2: [0.7, 2.6], 3: [1, 0], 4: [1, 0], 5: [1, 0], 6: [1, 0], 7: [1, 0], 8: [1, 0], 9: [1, 0], 11: [1, 0], 12: [1, 0], 15: [1, 0], 22: [1, 0], 23: [1, 0], 24: [1, 0], 25: [1, 0], 26: [1, 0], 27: [0.7, 2.2], 28: [0.25, 2.2], 29: [0, 0], 30: [0, 0], 31: [0, 0] };
/** ... and his back foot: how far it has stepped back from his guard to where the game's kneel turns on it, and how high it is
 * lifted. */
const VOLLEY_BACK: Readonly<Record<number, readonly [number, number]>> = { 1: [0, 0], 2: [0, 0], 3: [0.33, 1.8], 4: [0.67, 2.6], 5: [1, 0], 6: [1, 0], 7: [1, 0], 8: [1, 0], 9: [1, 0], 11: [1, 0], 12: [1, 0], 15: [1, 0], 22: [1, 0], 23: [1, 0], 24: [1, 0], 25: [1, 0], 26: [1, 0], 27: [1, 0], 28: [1, 0], 29: [0.75, 2.2], 30: [0.3, 2.2], 31: [0, 0] };
/** As he rises, how far his front knee is still turned as the game's kneel has it (1) and not yet as his guard has it (0): it
 * comes round over its foot as his weight comes up onto it, after the foot is set down (as the game's knee comes round with his
 * rise), never turned out over a deep bend. (Going down it turns as the foot steps out.) */
const VOLLEY_KNEE_RISE: Readonly<Record<number, number>> = { 27: 0.95, 28: 0.78, 29: 0.5, 30: 0.28, 31: 0.11 };
/** How far down onto his knee he is at each of the Volley's keys (frames). */
const VOLLEY_DOWN: Readonly<Record<number, number>> = { 1: 0, 2: 0.08, 3: 0.3, 4: 0.5, 5: 0.75, 6: 0.9, 7: 1, 8: 1, 9: 1, 11: 1, 12: 1, 15: 1, 22: 1, 23: 0.95, 24: 0.84, 25: 0.7, 26: 0.6, 27: 0.47, 28: 0.33, 29: 0.2, 30: 0.13, 31: 0.07 };
export const RU_VOLLEY3: Move3 = {
  ...MOVES3.volley,
  name: 'Volley (Movement 9)',
  build: B,
  rest: RU_BATTLE,
  motion: {
    hit: RU_VOLLEY_HIT,
    keys: remade(MOVES3.volley, RU_BATTLE, [
      { at: 0, from: 'rest' },
      { at: 9, from: 5, ease: 'io', nudge: VOLLEY_CLEAR },
      { at: 11, from: 5.6, ease: 'io', nudge: VOLLEY_CLEAR },
      { at: 12, from: 6, ease: 'lin', nudge: VOLLEY_SNAP },
      { at: 15, from: 8, ease: 'out', nudge: VOLLEY_ON },
      { at: 22, from: 8, ease: 'io', nudge: VOLLEY_ON },
      // (his arms back in his guard as he rises, the bow down from the sky to before him and his hand on the string, before his
      // body is: the string hand out round his side on the way, clear of his chest)
      { at: 26, from: 12, ease: 'io', more: { rhIn: 1, rhx: 12, rhy: -7, rhz: -4, re: -30 } },
      { at: 29, from: 14.5, ease: 'io', more: only(RU_BATTLE, ARMS) },
      { at: 32, from: 'rest', ease: 'io' },
    ], RU_BATTLE_SEEN, true).keys,
  },
};
// (down on his back knee where the game's kneel has him: each foot stepped there, lifted clear, as he goes down, and back as he
// rises; the game's kneel slid his feet)
{
  const keys = RU_VOLLEY3.motion.keys;
  const at = (f: number): Partial<Bones> => sampledPose(keys, RU_VOLLEY3.rest, f * FR);
  // (a key at every frame where his feet step, each the very pose the Volley passes through then: so that only his legs change)
  const have = new Set(keys.map((k) => Math.round(k.at / FR)));
  const frames = [1, 2, 3, 4, 5, 6, 7, 8, 9, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];
  const more = frames.filter((f) => !have.has(f)).map((f) => ({ at: f * FR, pose: at(f), ease: 'lin' as const }));
  const all = [...keys, ...more].sort((a, b) => a.at - b.at).map((k) => (frames.includes(Math.round(k.at / FR)) ? { ...k, ease: 'lin' as const } : k));
  RU_VOLLEY3.motion.keys = all.map((k) => {
    const f = Math.round(k.at / FR);
    const legs = volleyLegs(f);
    return legs ? { ...k, pose: { ...k.pose, ...legs } } : k;
  });
  // (his string hand eased through the moment its way round his side begins, measured from its shoulder throughout)
  const ks = RU_VOLLEY3.motion.keys as Key3[];
  const i0 = ks.findIndex((k) => Math.round(k.at / FR) === 25);
  smoothKeys(ks, i0 + 1, i0 + 3, ['rhx', 'rhy', 'rhz'], 1);
}
/** The pose a motion passes through at `t`, as a key of its own: a hand that is going from one way of being measured to another
 * there (bonesAt's lh2, rh2) put where it is, measured from its shoulder (`lhIn` 1). */
function sampledPose(keys: readonly Key3[], rest: Bones, t: number): Partial<Bones> {
  const q = bonesAt(keys, rest, t);
  const p = clean(q);
  const sk = solve(B, q);
  if (q.lh2) Object.assign(p, { lhIn: 1, lhx: sk.handL[0] - sk.shoulderL[0], lhy: sk.handL[1] - sk.shoulderL[1], lhz: sk.handL[2] - sk.shoulderL[2] });
  if (q.rh2) Object.assign(p, { rhIn: 1, rhx: sk.handR[0] - sk.shoulderR[0], rhy: sk.handR[1] - sk.shoulderR[1], rhz: sk.handR[2] - sk.shoulderR[2] });
  // (and each elbow swung to where the motion has it then: between two keys an elbow goes its own way, not by the swing)
  const own = { ...rest, ...p } as unknown as Posed;
  p.le = elbowFor(B, own, true, [sk.elbowL[0] - sk.shoulderL[0], sk.elbowL[1] - sk.shoulderL[1], sk.elbowL[2] - sk.shoulderL[2]], q.le);
  p.re = elbowFor(B, own, false, [sk.elbowR[0] - sk.shoulderR[0], sk.elbowR[1] - sk.shoulderR[1], sk.elbowR[2] - sk.shoulderR[2]], q.re);
  return p;
}
/** His legs at a key of the Volley (frames), or nothing (his guard's, at its first and last). */
function volleyLegs(f: number): Partial<Bones> | null {
  const down = VOLLEY_DOWN[f];
  const step = VOLLEY_STEP[f];
  const back = VOLLEY_BACK[f];
  if (down === undefined || step === undefined || back === undefined) return null;
  const G = RU_BATTLE;
  const K = RU_GAME_KNEEL;
  const mix = (a: number, b: number, k: number): number => a + (b - a) * k;
  // (his back foot: from where his guard has it, lifted, to where the game's kneel turns on its toes)
  const kneel = ruOnToes(K.rfp * down);
  const flat = ruOnToes(0);
  const backFoot: Partial<Bones> = back[0] >= 1
    ? kneel
    : { rfx: mix(G.rfx, flat.rfx as number, back[0]), rfy: mix(G.rfy, flat.rfy as number, back[0]), rft: mix(G.rft, flat.rft as number, back[0]), rfz: back[1] + (back[1] > 0 ? (kneel.rfz as number) * back[0] : 0), rfp: back[1] > 0 ? (kneel.rfp as number) * back[0] : 0 };
  return {
    ...backFoot,
    rk: mix(G.rk, K.rk, back[0]),
    rkUp: 0,
    // (his hips let down to where the game's kneel has them, and as low)
    px: mix(G.px, K.px, down),
    pz: mix(G.pz, K.pz, down),
    // (his front foot stepped out to where the game's kneel has it, its knee turned as the game's)
    lfx: mix(G.lfx, K.lfx, step[0]),
    lfy: mix(G.lfy, K.lfy, step[0]),
    lft: mix(G.lft, K.lft, step[0]),
    lk: mix(G.lk, K.lk, VOLLEY_KNEE_RISE[f] ?? step[0]),
    lkUp: 0,
    lfz: step[1],
    lfp: 0,
  };
}


// ---- HIS ROLL ----
//   0-3     off both feet at once, a dive (the game carries him from the first frame: his feet are off the floor by then);
//   3-11    over in a ball, the game's own ball (moves3.ts roll), his bow held out at his side by its grip, its limbs along the way
//           he rolls, clear of him, his other hand on his shins; his feet tucked clear of the floor;
//   12      down on his feet, low, the moment the game stops carrying him (`tumble`, 0.4 s): his feet set down under him;
//   12-18   out into his guard as he rises: his front foot lifted and set down where his guard has it, then his back foot;
//   18-20   settling into his guard.
/** The game carries him `tumble` seconds of the picture (moves3.ts ROLL_LONG), 3.4 tiles (game/defs.ts trap's range). */
export const RU_ROLL_CARRY = 3.4 * UNITS_PER_TILE;
/** The game's ball (moves3.ts roll): him folded at the hips, thighs to his chest and heels to his seat, turned `theta` degrees
 * forward about its middle, `R` above the floor; his right hand on his shins. */
function ruBall(theta: number, R: number): Partial<Bones> {
  const hipH = B.ankle + B.shank + B.thigh;
  const a = (theta * Math.PI) / 180;
  const at = (f: number, u: number): [number, number] => [Math.cos(a) * f + Math.sin(a) * u, -Math.sin(a) * f + Math.cos(a) * u];
  const [hx, hz] = at(-4.5, -7.5);
  const [fx, fz] = at(5, -7);
  const [kx, kz] = at(11.5, 2.5);
  const pelvisZ = R + hz;
  return {
    px: hx, pz: pelvisZ - hipH, pitch: theta, yaw: 0, twist: 0, bend: 78, faceTurn: 0, faceUp: -theta - 108,
    lfx: hx + fx, lfy: -1, lfz: pelvisZ + fz - B.ankle, lfp: theta + 30, lk: 0, lkUp: 55 - theta,
    rfx: hx + fx, rfy: 1, rfz: pelvisZ + fz - B.ankle, rfp: theta + 30, rk: 0, rkUp: 55 - theta,
    rhIn: 2, rhx: hx + kx, rhy: -4, rhz: pelvisZ + kz,
  };
}
/** How far (on his chest: forward, out to his left, up) his bow is lifted on its way out to the ball and back before him, over his
 * knees and his front foot (his guard's feet, under him, are in its way); and over how many frames his arms come back. */
const ROLL_ARC = [0, 5, 6] as const;
const ROLL_RISE_ARMS = 6;
const ROLL_RISE_ARC = [0, 0, 6] as const;
function ruRollKeys(): Key3[] {
  const game = MOVES3.roll.motion.keys;
  const END = game[game.length - 1].at / FR;
  /** The ball a little higher than the game's, so that his head never goes into the floor as he goes over. */
  const R = 16;
  const LAND = 12;
  const lift = (p: Partial<Bones>, min: number): Partial<Bones> => {
    // (each foot raised until its heel and toes are `min` above the floor)
    const q: Partial<Bones> = { ...p };
    for (let i = 0; i < 4; i++) {
      const sk = solve(B, { ...RU_BATTLE, ...q } as Bones);
      const l = min - Math.min(sk.toeL[2], sk.heelL[2]);
      const r = min - Math.min(sk.toeR[2], sk.heelR[2]);
      if (l <= 0.01 && r <= 0.01) break;
      if (l > 0.01) q.lfz = (q.lfz ?? 0) + l;
      if (r > 0.01) q.rfz = (q.rfz ?? 0) + r;
    }
    return q;
  };
  const S = (k: number): number => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
  const mix = (a: number, b: number, k: number): number => a + (b - a) * k;
  const G = RU_BATTLE as unknown as Record<string, number>;
  const guard = solve(B, RU_BATTLE);
  const BOW_BALL = { wAz: -90, wEl: 0, wRoll: 90 };
  const out: Key3[] = [];
  const BODY = ['px', 'pz', 'yaw', 'twist', 'bend', 'faceTurn', 'lfx', 'lfy', 'lfz', 'lk', 'lkUp', 'rfx', 'rfy', 'rfz', 'rk', 'rkUp'] as const;
  // THE DIVE AND THE BALL: one turn, slow off the mark, fastest over the top, slowing as he comes up onto his feet
  // HIS ARMS ON HIS CHEST (as `lhIn` 0 measures them: from each shoulder, along his chest's forward, left and up)
  const onChest = (r: readonly V3[], v: V3): V3 => [r[0][0] * v[0] + r[0][1] * v[1] + r[0][2] * v[2], r[1][0] * v[0] + r[1][1] * v[1] + r[1][2] * v[2], r[2][0] * v[0] + r[2][1] * v[1] + r[2][2] * v[2]];
  const fromChest = (r: readonly V3[], v: V3): V3 => [r[0][0] * v[0] + r[1][0] * v[1] + r[2][0] * v[2], r[0][1] * v[0] + r[1][1] * v[1] + r[2][1] * v[2], r[0][2] * v[0] + r[1][2] * v[1] + r[2][2] * v[2]];
  const less = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mixV = (a: V3, b: V3, k: number): V3 => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
  const HL0 = onChest(guard.chest, less(guard.handL, guard.shoulderL));
  const HR0 = onChest(guard.chest, less(guard.handR, guard.shoulderR));
  const EL0 = onChest(guard.chest, less(guard.elbowL, guard.shoulderL));
  const ER0 = onChest(guard.chest, less(guard.elbowR, guard.shoulderR));
  /** In the ball (measured on him tucked): the bow hand out at his left side by his knees; the other hand on his right knee,
   * a little outside it; each elbow pointing from his chest as his guard has it. (His right hand where it went before his knee
   * joint was raised, measured on RANGER_BODY's knee: on his shin a little lower, as his arm swung there.) */
  const tuck = solve(B, { ...RU_BATTLE, ...ruBall(390, R) } as Bones);
  const tuckWas = solve(RANGER_BODY, { ...RU_BATTLE, ...ruBall(390, R) } as Bones);
  const HL_BALL = onChest(tuck.chest, less([tuck.kneeL[0] - 2, tuck.kneeL[1] + 9, tuck.kneeL[2] + 1], tuck.shoulderL));
  const HR_BALL = onChest(tuckWas.chest, less([tuckWas.kneeR[0] + 1, tuckWas.kneeR[1] - 3.5, tuckWas.kneeR[2] - 5], tuckWas.shoulderR));
  const EL_BALL: V3 = EL0;
  const ER_BALL: V3 = [0, -1, 0.6];
  // (the swing of each elbow in the tuck that points it so: the left as his guard has it, the right out and up)
  const tucked = { ...RU_BATTLE, ...ruBall(390, R), lhIn: 0, rhIn: 0, lhx: HL_BALL[0], lhy: HL_BALL[1], lhz: HL_BALL[2], rhx: HR_BALL[0], rhy: HR_BALL[1], rhz: HR_BALL[2] } as unknown as Posed;
  const tuckSk = solve(B, tucked);
  const LE_BALL = elbowFor(B, tucked, true, fromChest(tuckSk.chest, EL_BALL), G.le);
  const RE_BALL = elbowFor(B, tucked, false, fromChest(tuckSk.chest, ER_BALL), G.re);
  // (his first frame is already the push off his feet, as the game's roll is: the game cuts to it from whatever he was doing)
  for (let f0 = 0; f0 <= LAND; f0++) {
    const f = f0;
    const theta = mix(RU_BATTLE.pitch, 390, S(f / LAND));
    // (tucked by the seventh frame, his legs drawn up sooner than his back curls)
    const w = S(f / 6.5);
    const wl = S(f / 4);
    const ball = ruBall(theta, R) as Record<string, number>;
    const pose: Record<string, number> = {};
    for (const k of BODY) pose[k] = mix(G[k], ball[k], k[0] === 'l' || k[0] === 'r' ? wl : w);
    pose.pitch = mix(RU_BATTLE.pitch, theta, w);
    // (his feet come level and his face up from his chest as he comes upright: 360 degrees round is level again)
    const up = S((f - 8) / 4);
    pose.lfp = mix(mix(G.lfp, ball.lfp, wl), 360, up);
    pose.rfp = mix(mix(G.rfp, ball.rfp, wl), 360, up);
    pose.faceUp = mix(mix(G.faceUp, ball.faceUp, w), -370, up);
    // (his arms carried with his chest, as a man tucked into a ball holds them: from where his guard has them to his bow held
    // out at his side and his other hand on his shins, measured on his chest; each elbow kept pointing the same way from it)
    const rk = S(f0 / 6);
    const turn = S((f0 - 1) / 5);
    pose.lhIn = 0;
    pose.rhIn = 0;
    [pose.lhx, pose.lhy, pose.lhz] = mixV(HL0, HL_BALL, rk);
    // (the bow lifted on its way out to his side, over his drawn-up knees)
    pose.lhy += ROLL_ARC[1] * Math.sin(Math.PI * rk);
    pose.lhz += ROLL_ARC[2] * Math.sin(Math.PI * rk);
    // (the right hand out before his chest on its way down to his shin)
    [pose.rhx, pose.rhy, pose.rhz] = mixV(HR0, HR_BALL, rk);
    pose.rhx += 4 * Math.sin(Math.PI * rk);
    pose.wAz = mix(G.wAz, BOW_BALL.wAz, turn);
    pose.wEl = mix(G.wEl, BOW_BALL.wEl, turn);
    pose.wRoll = mix(G.wRoll, BOW_BALL.wRoll, turn);
    pose.draw = mix(G.draw, 0, S(f0 / 2));
    // (each elbow's swing turned evenly from his guard's to the tuck's)
    pose.le = mix(G.le, LE_BALL, rk);
    pose.re = mix(G.re, RE_BALL, rk);
    // (off the floor from the first frame, the game carrying him; down on his feet as it stops)
    const p = pose as Partial<Bones>;
    out.push({ at: f0 * FR, pose: f0 < LAND ? lift(p, 1.2) : { ...p, lfz: 0, rfz: 0 }, ease: 'lin' });
  }
  smoothKeys(out, 1, LAND - 1);
  // (the same pose, his turn counted from 0 again)
  const landed = out[out.length - 1].pose as Record<string, number>;
  const L: Record<string, number> = { ...G, ...landed, pitch: landed.pitch - 360, lfp: landed.lfp - 360, rfp: landed.rfp - 360, faceUp: landed.faceUp + 360, lkUp: landed.lkUp + 360, rkUp: landed.rkUp + 360 };
  out.push({ at: LAND * FR + 1e-4, pose: L as Partial<Bones>, ease: 'hold' });
  // UP INTO HIS GUARD: his body rising, his arms bringing the bow round before him, his front foot stepped out, then his back
  const RISE = ['px', 'pz', 'pitch', 'yaw', 'twist', 'bend', 'faceTurn', 'faceUp', 'lkUp', 'rkUp'] as const;
  for (let f = LAND + 1; f < END; f++) {
    const g = S((f - LAND) / (END - LAND));
    const h = S((f - LAND) / ROLL_RISE_ARMS);
    const pose: Record<string, number> = { ...L };
    for (const k of RISE) pose[k] = mix(L[k], G[k], g);
    pose.lhIn = 0;
    pose.rhIn = 0;
    [pose.lhx, pose.lhy, pose.lhz] = mixV(HL_BALL, HL0, h);
    // (the bow lifted as it comes round before him, over his front foot stepping out)
    pose.lhy += ROLL_RISE_ARC[1] * Math.sin(Math.PI * h);
    pose.lhz += ROLL_RISE_ARC[2] * Math.sin(Math.PI * h);
    [pose.rhx, pose.rhy, pose.rhz] = mixV(HR_BALL, HR0, h);
    for (const k of ['wAz', 'wEl', 'wRoll', 'draw'] as const) pose[k] = mix(L[k] ?? G[k], G[k], h);
    pose.le = mix(LE_BALL, G.le, h);
    pose.re = mix(RE_BALL, G.re, h);
    // (each foot lifted and set down where his guard has it: the front one, then the back)
    const step = (from: number, side: 'l' | 'r'): void => {
      const k = S((f - from) / 4);
      for (const a of ['fx', 'fy', 'ft'] as const) pose[side + a] = mix(L[side + a], G[side + a], k);
      pose[side + 'k'] = mix(L[side + 'k'], G[side + 'k'], k);
      pose[side + 'fz'] = 2.6 * Math.sin(Math.PI * k);
      pose[side + 'fp'] = 0;
    };
    step(LAND, 'l');
    step(LAND + 3.5, 'r');
    out.push({ at: f * FR, pose: pose as Partial<Bones>, ease: 'lin' });
  }
  out.push({ at: END * FR, pose: {}, ease: 'lin' });
  smoothKeys(out, out.length - 8, out.length - 3, ARMS);
  return out;
}
/** Keys `from` to `to` (indices) of a run of keys a frame apart eased into each other: each number a little toward its two
 * neighbours', twice over (the hands' places and what they are measured from left as they are). */
function smoothKeys(keys: Key3[], from: number, to: number, fields?: readonly string[], passes = 2): void {
  for (let pass = 0; pass < passes; pass++) {
    const was = keys.map((k) => ({ ...k.pose }) as Record<string, number>);
    for (let i = Math.max(1, from); i <= Math.min(keys.length - 2, to); i++) {
      const a = was[i - 1];
      const b = was[i];
      const c = was[i + 1];
      const p = keys[i].pose as Record<string, number>;
      for (const f of Object.keys(b)) {
        if (f === 'lhIn' || f === 'rhIn' || typeof b[f] !== 'number' || (fields && !fields.includes(f))) continue;
        if (a[f] === undefined || c[f] === undefined) continue;
        p[f] = 0.25 * a[f] + 0.5 * b[f] + 0.25 * c[f];
      }
    }
  }
}
export const RU_ROLL3: Move3 = { ...MOVES3.roll, name: "The ranger's roll (brought up)", build: B, rest: RU_BATTLE, motion: { keys: ruRollKeys() } };

// ---- STRUCK, HIS FALL: the game's, from his guard ----
/** STRUCK (7 frames, as the game's): rocked back, his back foot lifted clear and set down a step behind him to catch him, and
 * lifted again back into his guard; or, struck from behind, thrown forward over a step of his front foot. His other foot never
 * moves, his hips within its reach. */
function ruStruck(forward: boolean): Key3[] {
  const G = RU_BATTLE;
  const f = forward ? 'l' : 'r';
  const way = forward ? 1 : -1;
  const foot = (dx: number, z: number): Partial<Bones> => ({ [`${f}fx`]: (G as unknown as Record<string, number>)[`${f}fx`] + way * dx, [`${f}fz`]: z, [`${f}fp`]: z > 0 ? -5 : 0 }) as Partial<Bones>;
  const body = (k: number): Partial<Bones> => ({
    px: G.px + way * 4.2 * k,
    pz: G.pz - 1.6 * k,
    pitch: G.pitch + (forward ? 9 : -7) * k,
    bend: G.bend + (forward ? 14 : -10) * k,
    faceUp: G.faceUp + (forward ? -8 : 8) * k,
  });
  if (!forward) {
    return [
      { at: 0, pose: {} },
      { at: 2 * FR, pose: withinReach({ ...body(0.85), ...foot(1.5, 2.6) }), ease: 'out' },
      { at: 4 * FR, pose: withinReach({ ...body(1), ...foot(3, 0) }), ease: 'io' },
      { at: 5.5 * FR, pose: withinReach({ ...body(0.5), ...foot(1.2, 2.4) }), ease: 'io' },
      { at: 7 * FR, pose: {}, ease: 'io' },
    ];
  }
  // (struck from behind: his first frame a little way, then thrown on over his front foot, which steps and comes back by the
  // sixth frame, so that he settles into his guard rather than stopping dead)
  return [
    { at: 0, pose: {} },
    { at: 1 * FR, pose: withinReach({ ...body(0.3), ...foot(0, 0) }), ease: 'in' },
    { at: 2.5 * FR, pose: withinReach({ ...body(0.85), ...foot(1.8, 2.6) }), ease: 'lin' },
    { at: 4 * FR, pose: withinReach({ ...body(1), ...foot(3, 0) }), ease: 'out' },
    { at: 5 * FR, pose: withinReach({ ...body(0.6), ...foot(1.5, 2.4) }), ease: 'io' },
    { at: 6 * FR, pose: withinReach({ ...body(0.25), ...foot(0, 0) }), ease: 'io' },
    { at: 7 * FR, pose: {}, ease: 'out' },
  ];
}
export const RU_REEL3: Move3 = { ...MOVES3.rreel, name: 'The ranger is struck hard (brought up)', build: B, rest: RU_BATTLE, motion: { ...MOVES3.rreel.motion, keys: ruStruck(false) } };
export const RU_LURCH3: Move3 = { ...MOVES3.rlurch, name: 'The ranger is struck from behind (brought up)', build: B, rest: RU_BATTLE, motion: { ...MOVES3.rlurch.motion, keys: ruStruck(true) } };
/**
 * HIS FALL (not to his knees and then forward, his rule): thrown back by the blow, his back foot lifted and set down a step
 * further back to keep his feet; then, his strength going, down onto that knee on his own feet (as the Volley's kneel), his bow
 * arm letting the bow down beside him till its lower limb rests on the floor, his head bowing as the light goes out of him.
 * His front foot never moves; his hips are kept within its reach.
 */
/** Where the toes of his back foot are set down, a step back from his guard. */
const FALL_TOE: V3 = [FALL_SK.toeR[0] - 4, FALL_SK.toeR[1], FALL_SK.toeR[2]];
/** A pose with his hips let down until both his feet are within his legs' reach (so that neither is dragged). */
function withinReach(p: Partial<Bones>): Partial<Bones> {
  const q: Partial<Bones> = { ...p };
  for (let i = 0; i < 30; i++) {
    const sk = solve(B, { ...RU_BATTLE, ...q } as Bones);
    const want = (fx: number, fy: number, fz: number, side: 1 | -1): V3 => [fx, side * B.stance + fy, B.ankle + fz];
    const all = { ...RU_BATTLE, ...q } as Bones;
    const wl = want(all.lfx, all.lfy, all.lfz, 1);
    const wr = want(all.rfx, all.rfy, all.rfz, -1);
    const miss = Math.max(Math.hypot(sk.ankleL[0] - wl[0], sk.ankleL[1] - wl[1], sk.ankleL[2] - wl[2]), Math.hypot(sk.ankleR[0] - wr[0], sk.ankleR[1] - wr[1], sk.ankleR[2] - wr[2]));
    if (miss < 0.03) break;
    q.pz = (q.pz ?? RU_BATTLE.pz) - 0.15;
  }
  return q;
}
function ruFallKeys(): Key3[] {
  const G = RU_BATTLE;
  const back = ruOnToes(0, FALL_TOE, FALL_FROM.rft);
  const knee = (p: number): Partial<Bones> => ruOnToes(p, FALL_TOE, FALL_FROM.rft);
  // (his arms flung by the blow; his bow out at his left side, upright, outside his leg however it goes, and let down till its
  // lower limb rests on the floor)
  const arms: Partial<Bones> = { rhIn: 0, rhx: 2, rhy: -4, rhz: -17, re: -10, wAz: 0, wEl: 0, wRoll: 0, draw: 0, lhIn: 2, le: 0 };
  const bowAt = (x: number, z: number): Partial<Bones> => ({ ...arms, lhx: x, lhy: RESTED_HAND[1], lhz: z });
  const keys: Key3[] = [
    { at: 0, pose: {} },
    { at: 2 * FR, pose: withinReach({ ...bowAt(9, 27), px: -3, pz: G.pz - 1, pitch: G.pitch - 9, bend: G.bend - 12, faceUp: 14, rfx: G.rfx - 1, rfz: 2.6, rfp: -6, rk: G.rk }), ease: 'out' },
    { at: 6 * FR, pose: withinReach({ ...bowAt(6, 25), px: -4.5, pz: G.pz - 1.5, pitch: G.pitch - 8, bend: G.bend - 8, faceUp: 8, ...back, rk: G.rk }), ease: 'io' },
    { at: 12 * FR, pose: withinReach({ ...bowAt(5, 23), px: -4.8, pz: G.pz - 3, pitch: G.pitch - 4, bend: G.bend, faceUp: 0, ...back, rk: G.rk }), ease: 'io' },
    { at: 16 * FR, pose: withinReach({ ...bowAt(6, 20.5), px: -4.6, pz: -12.5, pitch: G.pitch - 2, bend: G.bend + 3, faceUp: -4, ...knee(20), rk: -4, out: 0.08 }), ease: 'io' },
    { at: 20 * FR, pose: withinReach({ ...bowAt(RESTED_HAND[0], RESTED_HAND[2]), px: -4.4, pz: -16, pitch: G.pitch, bend: G.bend + 6, faceUp: -8, ...knee(40), rk: 0, out: 0.2 }), ease: 'in' },
    { at: 22 * FR, pose: withinReach({ ...bowAt(RESTED_HAND[0], RESTED_HAND[2]), px: -4.4, pz: -16.4, pitch: G.pitch, bend: G.bend + 10, faceUp: -12, ...knee(40), rk: 0, out: 0.3 }), ease: 'lin' },
    { at: 26 * FR, pose: withinReach({ ...bowAt(RESTED_HAND[0], RESTED_HAND[2]), px: -4.4, pz: -16.2, pitch: G.pitch + 1, bend: G.bend + 12, faceUp: -18, ...knee(40), rk: 0, out: 0.5 }), ease: 'out' },
    { at: 46 * FR, pose: withinReach({ ...bowAt(RESTED_HAND[0], RESTED_HAND[2]), px: -4.4, pz: -16.2, pitch: G.pitch + 3, bend: G.bend + 18, faceUp: -28, ...knee(40), rk: 0, out: 1 }), ease: 'io' },
  ];
  return keys;
}
/** Where his bow hand rests at the end of his fall, the bow upright at his left side outside his front foot, its lower tip on
 * the floor. */
const RESTED_HAND: V3 = [8, 20, 18];
export const RU_FALL3: Move3 = { ...MOVES3.rfall, name: "The ranger's fall (brought up)", build: B, rest: RU_BATTLE, motion: { ...MOVES3.rfall.motion, keys: ruFallKeys() } };

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
export const RU_SQUIRREL3: Move3 = { ...MOVES3.squirrel, name: 'The ranger and his squirrel (brought up)', build: B, rest: RU_BATTLE };
export const RU_SIGHTING3: Move3 = { ...MOVES3.sighting, name: 'The ranger sights along an arrow (brought up)', build: B, rest: RU_BATTLE };
export const RU_TSQUIRREL3: Move3 = { ...MOVES3.tsquirrel, name: 'The ranger and his squirrel, in town (brought up)', build: B, rest: RU_TOWN };
export const RU_TSIGHTING3: Move3 = { ...MOVES3.tsighting, name: 'The ranger sights along an arrow, in town (brought up)', build: B, rest: RU_TOWN };
/** His card's ready: the bow off his back (from his town stance), an arrow on the string, and down into his guard. */
export const RU_DRAW3: Move3 = {
  ...MOVES3.rdraw,
  name: 'The ranger unslings his bow (brought up)',
  build: B,
  rest: RU_TOWN,
  motion: { keys: drawKeys() },
};

/** The game's unslinging, his feet going from his town stance to his guard as the game's do (the game's own town stance and
 * guard), but each foot lifted clear and set down where the game slid it, one at a time: his front foot as the game moves it
 * (frames 14 to 19, as he turns side-on and the bow comes up), then his back foot (19 to 24). */
function drawKeys(): Key3[] {
  const m = MOVES3.rdraw;
  const g = (t: number): Partial<Bones> => clean(bonesAt(m.motion.keys, m.rest, t * FR));
  const town = only(RU_TOWN, LEGS);
  // (his guard's legs, and the bow canted in his hand as his guard holds it)
  const guard = only(RU_BATTLE, [...LEGS, 'wRoll']);
  const front = only(RU_BATTLE, ['lfx', 'lfy', 'lfz', 'lfp', 'lft', 'lk']);
  const out: Key3[] = [];
  for (const k of m.motion.keys) {
    const f = k.at / FR;
    if (f > 14 + 1e-6) break;
    // (his hand takes the bow where it lies on his back, as he slings it)
    if (Math.abs(f - 10) < 1e-6) {
      const body = g(10) as Bones;
      out.push({ ...k, pose: { ...k.pose, ...town, ...ruHoldOnBack(body) } });
      continue;
    }
    // (the bow, just off his back, brought round outside his left side, not through him)
    if (Math.abs(f - 14) < 1e-6) out.push({ at: 12 * FR, pose: { ...g(12), ...town, lhIn: 0, lhx: -1, lhy: 11, lhz: 8, wAz: -70, wEl: 26, wRoll: 0 }, ease: 'io' });
    out.push({ ...k, pose: { ...k.pose, ...town } });
  }
  const half = (a: number, b: number): number => (a + b) / 2;
  // (his front foot out to where his guard has it, lifted low, as the game moves it; then his back foot)
  out.push({ at: 16.5 * FR, pose: { ...g(16.5), ...town, lfx: half(town.lfx as number, guard.lfx as number), lfy: half(town.lfy as number, guard.lfy as number), lft: half(town.lft as number, guard.lft as number), lk: guard.lk as number, lfz: 2.6, lfp: -4 }, ease: 'io' });
  const up = m.motion.keys.find((k) => Math.abs(k.at / FR - 19) < 1e-6) as Key3;
  out.push({ ...up, pose: { ...up.pose, ...town, ...front } });
  out.push({ at: 21.5 * FR, pose: { ...g(21.5), ...town, ...front, rfx: half(town.rfx as number, guard.rfx as number), rfy: half(town.rfy as number, guard.rfy as number), rft: half(town.rft as number, guard.rft as number), rk: half(town.rk as number, guard.rk as number), rfz: 2.6, rfp: -4 }, ease: 'io' });
  out.push({ at: 24 * FR, pose: { ...g(24), ...guard }, ease: 'io' });
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
