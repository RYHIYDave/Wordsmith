// THE WARLOCK MOVING (the art chat, 25 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His brief, 23 Oct (Pacific), by 22:10: “Pact-bound scholar (Recommended)” (a deal with a demon for power, slowly taking
// him over, the arm where it started); as a man, “Hunched and pained” (always fighting the thing inside him); his magic
// as a man, “Heavy cyan hellfire (Recommended)”. Asked what next, 25 Oct, by 07:40: “Animate the warlock”; where to
// start, “The man first (Recommended)”; and at 07:53: “Remember the rules for animations”. So, his art rulebook's
// Movement: weight first; each character its own way (his: hunched and pained); every attack winds up and follows
// through; loose things follow (his coat's skirts); slick; alive when still; heavy blows freeze; feet grip the floor;
// big wind-up, lightning strike. Animations: as big and wild as can be; power you can see (the arm barely holding its
// fire), each hero wild his own way (his: cyan hellfire and smoke, not the mage's crackle).
//
// His moves are keys of the heroes' own bones (art/skeleton.ts Key3, bonesAt), as the brawler's are, drawn by his sculpt
// (dev/sculpt_warlock.ts sculptWarlock) a frame at a time.

import { GRIP_SPEED, UNITS_PER_TILE } from '../art/moves3';
import { add, bonesAt, lerp3, mul, solve, sub } from '../art/skeleton';
import type { Bones, Key3, Motion, Posed, V3 } from '../art/skeleton';
import type { GameView } from '../art/skin';
import type { Drawn } from './sculpt';
import { limbFrame } from './sculpt_classes';
import { ARM_FIRE, SKIRT_OPEN, SKIRT_SWING, WARLOCK_SCULPT_BODY, sculptWarlock, warlockStance } from './sculpt_warlock';
import type { BrawlerMove } from './brawler_moves';

/** A frame, at thirty a second. */
export const FR = 1 / 30;
export const WARLOCK_B = WARLOCK_SCULPT_BODY;
/** His stance, hunched and pained (dev/sculpt_warlock.ts): what every key of his starts from. */
export const STANCE: Bones = warlockStance(WARLOCK_B);
export const T = WARLOCK_B.tall / 58;

/** A move of his: as the brawler's are, with the fire in his claws as it grows and dies (seconds, size). */
export interface WarlockMove extends BrawlerMove {
  fire?: [number, number][];
  /** How far the demon's claws are flung open (seconds, 0 curled round the fire to 1 wide): curled unless a move opens them. */
  open?: [number, number][];
}

/**
 * HIS RIGHT HAND HOLDING THE DEMON ARM BACK, wherever the arm goes: carried as the arm's near end (a third of the way from
 * its elbow to its claws) is carried from where it is in his stance, so that his hand goes with the arm as it twitches,
 * wrenches and is hauled back.
 */
const NEAR = 0.3;
const HOLD = (() => {
  const s = solve(WARLOCK_B, STANCE as Posed);
  return { hand: s.handR, near: lerp3(s.elbowL, s.handL, NEAR) };
})();
export function clamp(q: Partial<Bones>): Partial<Bones> {
  const s = solve(WARLOCK_B, { ...STANCE, ...q } as Posed);
  const want = add(HOLD.hand, sub(lerp3(s.elbowL, s.handL, NEAR), HOLD.near));
  const [cf, cl, cu] = s.chest;
  const v = sub(want, s.shoulderR);
  const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  return { rhIn: 0, rhx: dot(v, cf), rhy: dot(v, cl), rhz: dot(v, cu), re: STANCE.re };
}

/** How hunched he is at rest: the top of his back curled over (art/skeleton.ts Bones.hunch), his shoulders rolled forward. */
const H0 = STANCE.hunch ?? 0;
const SH0 = STANCE.shrug ?? 0;
/**
 * HIM CURLED OVER further by `x` degrees (or uncurled, if negative), HIGH IN THE BACK more than low (his word, 25 Oct: "The
 * bend needs to be higher up in the back. Shoulders hunched forward"): of each degree, two fifths are bent below the ribs,
 * and half as many again curled into the top of the back.
 */
export function curl(x: number): Partial<Bones> {
  return { bend: STANCE.bend + 0.4 * x, hunch: H0 + 0.5 * x };
}
/** His breath: in (1) his chest lifting and his shoulders with it; out (-1) sagging, the stoop deeper. */
function breath(k: number): Partial<Bones> {
  return { pz: STANCE.pz + 0.35 * T * k, ...curl(-2.6 * k), shrug: SH0 + 0.12 * k, faceUp: STANCE.faceUp + 2 * k };
}

/**
 * STANDING (a 6.6 s round), HUNCHED AND PAINED, ALIVE WHEN STILL (Movement 6), AS WILD AS IT WILL GO (his word of the first
 * film, 25 Oct: “Not wild enough (Recommended)”): he breathes hard and slow, his shoulders heaving; the demon arm will not lie
 * still, its claws twitching; then THE SPASM: it coils back, trembling, and WRENCHES forward and up, the fire in its claws
 * roaring up, his head thrown back; it nearly tears him off his feet, and he stumbles a step after it; it thrashes, his
 * whole body convulsing; he hauls it back down with his right hand and the pain folds him right over it, heaving; he steps
 * back, straightens, and glares down at the arm as the fire licks back up. A foot down stays where it is (Movement 8).
 */
export const STAND_LONG = 6.6;
export function warlockStand(): Motion {
  const keys: Key3[] = [];
  const k = (at: number, pose: Partial<Bones>, ease: Key3['ease'] = 'io'): void => {
    keys.push({ at, ease, pose: { ...pose, ...clamp(pose) } });
  };
  const arm = (dx: number, dy: number, dz: number, e = STANCE.le): Partial<Bones> => ({ lhIn: 0, lhx: STANCE.lhx + dx * T, lhy: STANCE.lhy + dy * T, lhz: STANCE.lhz + dz * T, le: e });
  /** his lead foot (the left) stepped `dx` forward and lifted `up` off the floor */
  const lead = (dx: number, up: number): Partial<Bones> => ({ lfx: STANCE.lfx + dx * T, lfz: STANCE.lfz + up * T, lfp: up > 0.2 ? -14 : 0 });
  // (breathing, the arm restless)
  k(0, { ...breath(-1), ...arm(0, 0, 0), ...lead(0, 0) });
  k(0.8, { ...breath(1), ...arm(0.3, 0.2, 0.6) });
  k(1.5, { ...breath(-1), ...arm(0.5, -0.2, 0.1) });
  // (a twitch: the arm jerks up, his head flinches from it)
  k(1.7, { ...breath(-0.6), ...arm(0.3, 0.6, 1.6), faceTurn: STANCE.faceTurn - 10 }, 'out');
  k(1.95, { ...breath(-0.2), ...arm(0.1, 0.1, 0.2) }, 'io');
  // (THE SPASM COMING: a breath held, his head turned to it, braced, the arm coiled back and down, trembling)
  k(2.25, { ...breath(0.6), pz: STANCE.pz - 0.5 * T, ...curl(5), ...arm(-1.8, -0.6, -1.2, 28), faceTurn: STANCE.faceTurn - 16, twist: STANCE.twist - 6 }, 'io');
  k(2.4, { ...breath(0.7), pz: STANCE.pz - 0.6 * T, ...curl(6), ...arm(-2.2, -0.7, -1.5, 26), faceTurn: STANCE.faceTurn - 17, twist: STANCE.twist - 7 }, 'io');
  k(2.47, { ...breath(0.7), pz: STANCE.pz - 0.6 * T, ...curl(6), ...arm(-1.9, -0.5, -1.2, 27), faceTurn: STANCE.faceTurn - 17, twist: STANCE.twist - 6 }, 'lin');
  k(2.53, { ...breath(0.7), pz: STANCE.pz - 0.6 * T, ...curl(6), ...arm(-2.2, -0.7, -1.5, 26), faceTurn: STANCE.faceTurn - 17, twist: STANCE.twist - 7 }, 'lin');
  // (THE WRENCH: forward and up, his head thrown back, his lead foot torn off the floor)
  const wrench = { pz: STANCE.pz + 0.4 * T, bend: STANCE.bend + 2, hunch: H0 - 16, shrug: Math.min(1, SH0 + 0.1), side: STANCE.side + 4, twist: STANCE.twist + 20, yaw: STANCE.yaw + 8, faceUp: STANCE.faceUp + 16, faceTurn: STANCE.faceTurn - 4 };
  k(2.66, { ...wrench, px: 2.2 * T, ...arm(9.0, 2.4, 2.4, 82), ...lead(0.2, 1.8) }, 'out');
  k(2.8, { ...wrench, px: 2.8 * T, twist: STANCE.twist + 22, ...arm(9.6, 2.6, 2.8, 86), ...lead(2.4, 2.2) }, 'io');
  // (he stumbles: the foot comes down a long step on, he sinks on it)
  k(2.92, { ...wrench, px: 3.4 * T, pz: STANCE.pz - 0.6 * T, ...curl(10), ...arm(9.2, 2.4, 2.6, 84), ...lead(3.4, 1.2) }, 'io');
  k(3.0, { ...wrench, px: 3.6 * T, pz: STANCE.pz - 1.0 * T, ...curl(12), ...arm(8.8, 2.2, 2.2, 80), ...lead(3.4, 0) }, 'out');
  // (it thrashes; his whole body convulses with it)
  k(3.1, { ...wrench, px: 3.6 * T, pz: STANCE.pz - 1.0 * T, ...curl(14), twist: STANCE.twist + 14, side: STANCE.side - 3, ...arm(7.4, 1.2, 1.4, 70), ...lead(3.4, 0) }, 'io');
  k(3.2, { ...wrench, px: 3.6 * T, pz: STANCE.pz - 1.1 * T, ...curl(12), twist: STANCE.twist + 22, side: STANCE.side + 4, ...arm(8.6, 2.4, 2.0, 80), ...lead(3.4, 0) }, 'io');
  k(3.3, { ...wrench, px: 3.5 * T, pz: STANCE.pz - 1.2 * T, ...curl(16), twist: STANCE.twist + 12, side: STANCE.side - 2, faceUp: STANCE.faceUp + 6, ...arm(6.8, 1.0, 1.0, 66), ...lead(3.4, 0) }, 'io');
  // (HAULED BACK DOWN, and the pain folds him right over it)
  const fold = { px: 2.6 * T, twist: STANCE.twist + 2, yaw: STANCE.yaw, side: STANCE.side, faceTurn: STANCE.faceTurn, ...lead(3.4, 0) };
  k(3.55, { ...fold, pz: STANCE.pz - 2.0 * T, ...curl(38), pitch: -2, faceUp: STANCE.faceUp - 16, ...arm(-0.6, -0.8, -3.0, 34) }, 'io');
  k(3.9, { ...fold, pz: STANCE.pz - 2.4 * T, ...curl(44), pitch: -1, faceUp: STANCE.faceUp - 18, ...arm(-0.8, -0.8, -3.4, 32) }, 'io');
  // (heaving)
  k(4.3, { ...fold, pz: STANCE.pz - 2.0 * T, ...curl(36), pitch: -3, faceUp: STANCE.faceUp - 14, ...arm(-0.6, -0.7, -2.8, 34) }, 'io');
  k(4.7, { ...fold, pz: STANCE.pz - 2.3 * T, ...curl(42), pitch: -1, faceUp: STANCE.faceUp - 17, ...arm(-0.7, -0.8, -3.2, 33) }, 'io');
  // (his weight back off it, the foot lifted, stepped back home, set down)
  k(5.0, { ...breath(0), px: 1.2 * T, pz: STANCE.pz - 0.8 * T, ...curl(20), pitch: -2, faceUp: STANCE.faceUp - 8, ...arm(-0.5, -0.4, -1.4, 38), ...lead(3.4, 0) }, 'io');
  k(5.12, { ...breath(0.1), px: 0.8 * T, pz: STANCE.pz - 0.5 * T, ...curl(14), pitch: -1, faceUp: STANCE.faceUp - 6, ...arm(-0.5, -0.3, -1.0, 40), ...lead(3.3, 1.8) }, 'io');
  k(5.3, { ...breath(0.2), px: 0.3 * T, pz: STANCE.pz - 0.2 * T, ...curl(8), pitch: 0, faceUp: STANCE.faceUp - 6, ...arm(-0.5, -0.1, -0.2, 44), ...lead(0.1, 1.6) }, 'io');
  k(5.42, { ...breath(0.2), px: 0, pz: STANCE.pz - 0.3 * T, ...curl(6), pitch: 0, faceUp: STANCE.faceUp - 6, ...arm(-0.5, 0, 0.4, 48), ...lead(0, 0) }, 'in');
  // (and he glares down at the arm, the fire licking back up)
  k(5.75, { ...breath(0.4), faceTurn: STANCE.faceTurn - 20, faceUp: STANCE.faceUp - 8, faceTilt: STANCE.faceTilt - 8, ...arm(-0.6, 0.2, 1.6, 54), ...lead(0, 0) }, 'io');
  k(6.2, { ...breath(-0.3), faceTurn: STANCE.faceTurn - 21, faceUp: STANCE.faceUp - 9, faceTilt: STANCE.faceTilt - 9, ...arm(-0.3, 0.3, 1.8, 58) }, 'io');
  k(STAND_LONG, { ...breath(-1), ...arm(0, 0, 0), ...lead(0, 0) }, 'io');
  return { keys, loop: 0 };
}
/** The fire in his claws as he stands: steady; flaring with the twitch; ROARING UP in the spasm, out ahead of him (and down again before it hides him for more than a blink: Animations 4); guttering as the pain folds him; licking back up as he glares at it. */
export const STAND_FIRE: [number, number][] = [[0, 4.0], [1.6, 4.1], [1.72, 5.2], [2.0, 4.0], [2.4, 3.2], [2.6, 8.0], [2.76, 9.0], [2.98, 6.4], [3.3, 5.4], [3.55, 4.4], [3.95, 2.6], [4.7, 2.8], [5.7, 5.4], [6.2, 5.0], [STAND_LONG, 4.0]];

/**
 * HE RUNS (a hero's speed in the game, art/moves3.ts GRIP_SPEED), LURCHING AND PAINED, A RUN OF HIS OWN, MADE FOR HIM (his
 * pick, “Lurching, pained (Recommended)”, offered as: back curled, shoulders up, head low; uneven, heavy strides, the demon
 * arm swinging and yanking him forward a little each step, his right hand clutching at it; and his words of the runs
 * before: “That isn’t hunched, that’s crouched and just a reused animation from the ranger”, then “Scrap whatever premade
 * animation you’re using and make a new one specifically for each new character.  Hunched is in the shoulders and back, not
 * bent straight at the hips.”).
 *   HUNCHED IN THE BACK AND SHOULDERS: his hips tucked under him and upright (tipped back, not forward), his back curled
 * over above them, high, between his shoulder blades (the spine's new joint), his shoulders rolled forward round his chest and his head hung low before them, his eyes up.
 *   A LIMP, THE DEMON SIDE HEAVY: his left (the demon's side) comes down a long heavy step and stays down, his knee giving
 * deep under the weight, the foot then dragged low through the next, its toes near scraping; his right a quick short hop of
 * a step, kicked up behind, off the floor again at once: a long-short, long-short hitch. He lurches over onto his left at
 * each heavy step, and the demon arm, hanging heavy before him, swings after his body and yanks him on as it comes
 * through; his right hand clutches at it. His feet grip the floor (Movement 8): a foot down goes back under him as fast as
 * the game carries him, lifted before it goes on.
 */
export const RUN_ROUND = 13 / 30;
export const RUN_CARRY = GRIP_SPEED * UNITS_PER_TILE;
/** HIS RIGHT HAND CLUTCHING AT THE DEMON ARM as he runs: on its upper arm, a little before it, wherever the arm swings. */
export function clutch(q: Partial<Bones>): Partial<Bones> {
  const s = solve(WARLOCK_B, { ...STANCE, ...q } as Posed);
  const [cf, cl, cu] = s.chest;
  const want = add(lerp3(s.shoulderL, s.elbowL, 0.62), add(mul(cf, 2.4), mul(cl, -1.6)));
  const v = sub(want, s.shoulderR);
  const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  return { rhIn: 0, rhx: dot(v, cf), rhy: dot(v, cl), rhz: dot(v, cu), re: 30 };
}
/** Eased both ways, 0 to 1. */
const ease = (u: number): number => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * c * (c * (c * 6 - 15) + 10);
};
/** A soft bump, 0 to 1 and back, over `long` of a round from `at` (wrapping round). */
const bump = (ph: number, at: number, long: number): number => {
  const d = (((ph - at) % 1) + 1) % 1;
  return d < long ? 0.5 - 0.5 * Math.cos((d / long) * Math.PI * 2) : 0;
};
/**
 * One of his feet through his round: down at `land` for `on` of the round, going back under him at the game's speed; then
 * lifted, carried on and set down again. `lift` how high it goes (picture units), `heel` how far it is kicked up behind,
 * `ahead` how far before his hips it lands.
 */
function limpFoot(ph: number, land: number, on: number, ahead: number, lift: number, heel: number, S: number): { x: number; z: number; p: number } {
  const q = (((ph - land) % 1) + 1) % 1;
  const back = S * on;
  if (q < on) return { x: ahead - S * q, z: 0, p: 0 };
  const v = (q - on) / (1 - on);
  // (lifted first, where it is, then carried on, then set down where it lands: no slide)
  const go = ease((v - 0.12) / 0.76);
  const z = lift * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, v))), 0.75);
  const p = heel * Math.sin(Math.PI * Math.min(1, v * 1.4)) * (v < 0.7 ? 1 : 0) - 6 * bump(v, 0.7, 0.3);
  return { x: ahead - back + back * go, z, p };
}
export function warlockRun(): Motion {
  const P = RUN_ROUND;
  const S = RUN_CARRY * P;
  const L = WARLOCK_B.upperArm + WARLOCK_B.foreArm;
  // (the left, heavy: lands at 0, down for 0.44 of the round, dragged low; the right, quick: lands at 0.58, down for 0.24, kicked up)
  const LEFT = { land: 0, on: 0.44, ahead: S * 0.24, lift: 2.6 * T, heel: 12 };
  const RIGHT = { land: 0.58, on: 0.24, ahead: S * 0.1, lift: 6.0 * T, heel: 48 };
  const keys: Key3[] = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const ph = i / n;
    const l = limpFoot(ph, LEFT.land, LEFT.on, LEFT.ahead, LEFT.lift, LEFT.heel, S);
    const r = limpFoot(ph, RIGHT.land, RIGHT.on, RIGHT.ahead, RIGHT.lift, RIGHT.heel, S);
    // (the heavy step: he sinks deep onto the left, lurches over onto it; the quick step: a little hop up off the right)
    const sink = bump(ph, LEFT.land - 0.04, 0.36);
    const hop = bump(ph, RIGHT.land + 0.06, 0.3);
    // (the demon arm swings after his body, a fifth of a round late, forward as he comes off the right; it yanks him on as it comes through)
    const sw = 0.5 - 0.5 * Math.cos((ph - RIGHT.land - 0.2) * Math.PI * 2);
    const yank = bump(ph, RIGHT.land + 0.12, 0.32);
    const pose: Partial<Bones> = {
      px: 1.2 * T * sink + 0.9 * T * yank, py: 0.9 * T * sink - 0.3 * T * hop,
      pz: -1.6 * T - 2.0 * T * sink + 0.9 * T * hop,
      // HUNCHED HIGH IN THE BACK (his words, 25 Oct: "The bend needs to be higher up in the back. Shoulders hunched
      // forward"): the hips upright, tucked a little under; a little bend below the ribs; the top of the back curled right
      // over on the spine's new joint (art/skeleton.ts Bones.hunch), deeper as he lands heavy, and the shoulders rolled
      // forward and up round his chest (shrug); his head hung low before them, his eyes up
      yaw: -5 + 9 * sink - 6 * hop, pitch: -4 + 2 * sink, roll: -4 * sink + 2 * hop,
      twist: STANCE.twist + 8 * yank - 6 * sink, bend: 12 + 3 * sink + 2 * yank, side: -6 - 5 * sink + 2 * hop,
      hunch: 64 + 8 * sink + 4 * yank - 3 * hop, shrug: 0.9 + 0.1 * sink,
      faceTurn: -6, faceUp: 8 - 4 * sink + 3 * hop, faceTilt: -8 + 4 * sink,
      lfx: l.x, lfy: 1.4 * T, lfz: l.z, lfp: l.p, lft: 10, lk: 8,
      rfx: r.x, rfy: -1.0 * T, rfz: r.z, rfp: r.p, rft: -4, rk: -4,
      lhIn: 1, lhx: L * (0.12 + 0.5 * sw), lhy: 3.0 * T, lhz: L * (-0.92 + 0.2 * sw), le: 34,
    };
    keys.push({ at: ph * P, ease: 'lin', pose: { ...pose, ...clutch(pose) } });
  }
  return { keys, loop: 0 };
}
export const RUN_FIRE: [number, number][] = [[0, 4.4], [RUN_ROUND, 4.4]];

export function warlockMoves(): WarlockMove[] {
  return [
    { name: 'Standing: hunched and pained', motion: warlockStand(), long: STAND_LONG, loops: true, fire: STAND_FIRE },
    { name: 'Running', motion: warlockRun(), long: RUN_ROUND, loops: true, travel: GRIP_SPEED, carry: RUN_CARRY, fire: RUN_FIRE },
  ];
}

/** His pose at a moment of a move. */
export function warlockPose(m: Motion, t: number): Posed {
  return bonesAt(m.keys, STANCE, t);
}

/** The size of the fire in his claws at a moment of a move. */
export function fireAt(m: WarlockMove, t: number): number {
  return trackAt(m.fire ?? [[0, 3.8]], t);
}
/** How far his claws are open at a moment of a move. */
export function openAt(m: WarlockMove, t: number): number {
  return trackAt(m.open ?? [[0, 0]], t);
}
/** A number through a move, eased between the moments it is given at. */
function trackAt(f: [number, number][], t: number): number {
  if (t <= f[0][0]) return f[0][1];
  for (let i = 1; i < f.length; i++) {
    if (t <= f[i][0]) {
      const u = (t - f[i - 1][0]) / (f[i][0] - f[i - 1][0]);
      const s = u * u * (3 - 2 * u);
      return f[i - 1][1] + (f[i][1] - f[i - 1][1]) * s;
    }
  }
  return f[f.length - 1][1];
}

/**
 * Draw him at a moment of a move: his coat's skirts trailing where his legs and hips have been (Movement 4, “Loose things
 * follow”: they hang to where his feet were `LAG` seconds ago, and the wind of his going blows them back), the fire in his
 * claws as big as the move has it, flickering.
 */
const LAG = 0.14;
export function drawWarlockAt(view: GameView, m: WarlockMove, t: number, turn = 0): Drawn {
  const pose = warlockPose(m.motion, t);
  const before = warlockPose(m.motion, m.loops ? (((t - LAG) % m.long) + m.long) % m.long : Math.max(0, t - LAG));
  const a = solve(WARLOCK_B, pose);
  const b = solve(WARLOCK_B, before);
  const now = lerp3(a.ankleL, a.ankleR, 0.5);
  const was = lerp3(b.ankleL, b.ankleR, 0.5);
  const blown = (m.travel ?? 0) * 1.1;
  const v: V3 = [(was[0] - now[0]) * 1.2 + (b.pelvis[0] - a.pelvis[0]) * 0.8 - blown * 2.2, (was[1] - now[1]) * 1.2, blown * 0.9];
  const cap = m.carry ? 12 : 5;
  const n = Math.hypot(v[0], v[1], v[2]);
  SKIRT_SWING.v = n > cap ? [(v[0] * cap) / n, (v[1] * cap) / n, (v[2] * cap) / n] : v;
  ARM_FIRE.size = fireAt(m, t);
  ARM_FIRE.open = openAt(m, t);
  ARM_FIRE.seed = 1 + t * 9;
  ARM_FIRE.t = t;
  // (the fire leans back off the way his claws go, and off the way he runs)
  {
    const dt = 1 / 30;
    const h0 = solve(WARLOCK_B, warlockPose(m.motion, m.loops ? (((t - dt) % m.long) + m.long) % m.long : Math.max(0, t - dt))).handL;
    const h1 = a.handL;
    const dx = h1[0] - h0[0] + (m.carry ?? 0) * dt;
    const dy = h1[1] - h0[1];
    const c = Math.cos((turn * Math.PI) / 180);
    const sn = Math.sin((turn * Math.PI) / 180);
    // (as the picture sees it, across: the game's view puts a step along x or y both across the screen)
    const go = (dx * c - dy * sn) + (dx * sn + dy * c);
    ARM_FIRE.lean = Math.max(-0.45, Math.min(0.45, -go * 0.05));
  }
  SKIRT_OPEN.on = !!m.carry;
  try {
    return sculptWarlock(view, pose as unknown as Bones, turn);
  } finally {
    SKIRT_SWING.v = [0, 0, 0];
    ARM_FIRE.size = 4.0;
    ARM_FIRE.seed = 1;
    ARM_FIRE.t = 0;
    ARM_FIRE.lean = 0;
    ARM_FIRE.open = 0;
    SKIRT_OPEN.on = false;
  }
}
