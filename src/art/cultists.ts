// THE CULT'S TWO NEW FIGHTERS, ON THE HEROES' BONES (the art chat, 11 Oct 2026). A MOCK-UP: NOT IN THE
// GAME. Nothing of the game imports this file, and `CULTISTS_SWITCH.on`, the switch a later chat would put
// them in by, is off.
//
// The owner's words, in the art chat, 11 Oct, 14:57: “When you’re finished with that I’d like 2 more
// cultist enemies.  A melee cultist the runs at you with a sacrificial dagger, and a mini fleshmancer elite
// that uses cultist corpses to raise skeletons (can just use the same animation as the warden) and does a
// smaller version of the fire laser from the boss.  They start showing up in floor 4, then all over floor
// 5.” And of the fleshmancer, the same day: “I don’t need the whole mock up sheet, just show me what he
// looks like and what the attacks look like”. So: one picture of each, then a film of each attack.
//
// THE DAGGER CULTIST. One of the cult's flock (the game's cultist, art/monster_cultist.ts: a robe of the
// cult's violet, a deep cowl with a point and two burning eyes in its dark, a pink stole), made for the
// knife: lean and wiry, a little shorter than the knight, hunched; his robe girded up to his knees with a
// rope so that he can run, his shins and feet bound in dark rags; his sleeves pushed back off pale, bony
// forearms; in his right fist A SACRIFICIAL DAGGER, a long wavy blade of bone, pale, a dark iron guard, its
// grip bound in the cult's pink. His eyes in the dark of his cowl are two slanting slashes of the enemy's
// pink (the cultists' are; the fleshmancer's are points).
//
// THE MINI FLESHMANCER. The fleshmancer's lesser self (art/fleshmancer.ts, painted by his own painter in a
// look of its own, `MINI_FM_LOOK`): a floating priest of the same near-black plum, the knight's height (his
// master is a head taller), his mantle banded pink and no gold, no ribs of bone over his hood; a shorter
// staff of bone with a smaller skull on it, its fire burning in its sockets; his casting hand a claw with
// the fire held in it. So that he reads as his master's at a glance, and never as his master.
//
// What glows on them is the enemy's (the art rulebook, Colour 3): their eyes, the fire. Nothing on them is
// cyan. Each wears the enemy's pink edge while he lives.

import type { ActorArt } from './actor_types';
import { INK, PINK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME, SOCKET } from './mkit';
import { FM_BODY, FM_LOOK, FM_REST, HAND_BONE, clamp01, curve, fleshmancerBits, fmGlide, fmHalt, fmReel, fmSetOff, pk, rampAt, sampled, screenStep, shiver, stamp, tr, unit2, withFmLook } from './fleshmancer';
import type { FmLook, P2, Pix } from './fleshmancer';
import { TILE3, mobSet, paintViewOf, skeletonAt, sphere } from './new_mobs3';
import type { Bit, Mob, MobCanvas, Moment, Put } from './new_mobs3';
import { onCloth, wornOn } from './skin';
import type { GameView, Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, len, lerp3, mul, norm, project, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file; a chat that puts them in, on the owner's yes, does it behind this. */
export const CULTISTS_SWITCH = { on: false };

const D = Math.PI / 180;

// =============================================================================================
// THE MINI FLESHMANCER

/** His lengths beside his master's: the knight's height, where his master is a head over it. */
export const MINI_K = 0.86;
const K = MINI_K;
/** His body: his master's, made smaller. */
export const MINI_BODY: Build = buildOf(55 * K, 1.06, { shoulders: 1.2, chest: 0.95, depth: 0.98, waist: 0.74, hips: 0.78, arms: 1.12, trunk: 1.06, limbs: 0.84, pad: 2.0 });

/**
 * THE LESSER SKULL, ten across (his master's is fourteen): pale bone lit from the upper left, a broad low
 * cranium, a heavy brow over two deep pits slanting in, the fire deep in each at its outer side (p), the
 * notch of the nose, a broken row of teeth, the mouth open and dark (d), the jaw hanging. (H highlight, L
 * lit, M middle, S shade; k the dark of a hole.)
 */
const LESSER_SKULL: ReadonlyArray<string> = [
  '...HHLL...',
  '.HHHLLLLM.',
  'HHLLLLLLMS',
  'HLLLLLLLMS',
  'LkkLLLLkkS',
  'LpkkLLkkpS',
  'LkkkLLkkkS',
  '.LkLkkLkS.',
  '.MLkLLkLS.',
  '.LkddddkS.',
  '..MLkLkS..',
  '..MMMMSS..',
  '...MMSS...',
];
/**
 * THE MASK IN HIS HOOD, where his master has only darkness and two points of fire: A MASK OF BONE, a skull's
 * face, pale, lit from the upper left (H, L, M, S), in the dark of the hood's opening (k); its sockets dark
 * (s), his fire burning low in each (h); the notch of its nose, its teeth. Told from his master at a glance.
 */
const LESSER_FACE: ReadonlyArray<string> = [
  '...kkkkkkk...',
  '..kHHLLLLMk..',
  '.kHLLLLLLLMk.',
  '.kLLLLLLLLMk.',
  '.kLssLLLssMk.',
  '.kLshLLLhsMk.',
  '.kLLLLkLLLSk.',
  '..kLMkkkMSk..',
  '..kMLkLkLSk..',
  '...kkMMMkk...',
  '....kkkkk....',
];
/** His colours: his master's plum, darker and duller (no magenta, no pink and gold bands), the pink kept for the lining. */
const MINI_RAMPS: NonNullable<FmLook['ramps']> = {
  robe: ['#140a18', '#140a18', '#30183a', '#4e2c5c', '#4e2c5c'],
  hood: ['#0f0814', '#0f0814', '#26122e', '#40244c', '#40244c'],
  mantle: ['#180c1e', '#180c1e', '#3a1e44', '#5c3a68', '#5c3a68'],
  lining: ['#2a0a22', '#2a0a22', '#5a1844', '#82285e', '#82285e'],
};

/** HIS LOOK, for his master's painter: smaller in every length, no gold, no ribs of bone over his hood, a shorter staff and a smaller skull, a smaller claw. */
export const MINI_FM_LOOK: FmLook = {
  body: MINI_BODY,
  k: K,
  float: FM_LOOK.float * K,
  hemUp: FM_LOOK.hemUp * K,
  hemWide: FM_LOOK.hemWide * K,
  crown: false,
  gold: false,
  staff: {
    long: 44,
    grip: 20,
    joints: FM_LOOK.staff.joints.map(([at, f, l]) => [at * (44 / 60), f * 0.8, l * 0.8] as const),
    spurs: FM_LOOK.staff.spurs.filter(([i]) => i % 2 === 1).map(([i, f, l, long]) => [i, f, l, long * 0.75] as const),
    skullUp: 7,
  },
  skull: { pix: LESSER_SKULL, mid: [5, 6], mouth: 9, eyes: [[1, 5, -1], [8, 5, 1]], crown: [[4, 6.5, 2.4, 0.4], [7, 2.6, 1.4, 1.6], [1.5, 1.8, 1.2, -1.2]] },
  hood: { fwd: FM_LOOK.hood.fwd * K, up: FM_LOOK.hood.up * K, r: mul(FM_LOOK.hood.r, K), face: LESSER_FACE, mid: [6, 5], eyes: [[4, 5], [8, 5]] },
  claw: 0.8,
  tails: 0.8,
  // HIS OWN LOOK (the owner's pick, 11 Oct: “Mini fleshmancer: less like the boss”): no staff, a claw of fire in each hand; the mask; a point to his hood; a fringe of small bones round his mantle; darker robes
  bare: true,
  ramps: MINI_RAMPS,
  point: 8,
  fringe: true,
  // (his own attacks' moments: art/cultists.ts MINI_RAISE, MINI_FIRE)
  timing: { raiseShriek: 1.1, raiseHold: 1.6, fireBurst: 17 / 30, fireStop: 2.1 },
  maw: (prop, t) => miniMaw(prop, t),
  jaw: () => 0,
};

/** Of a pose's numbers, those that are lengths (made smaller for him), and not angles or amounts. */
const LENGTHS = new Set<keyof Bones>(['px', 'py', 'pz', 'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'lfx', 'lfy', 'lfz', 'rfx', 'rfy', 'rfz']);
/** His rest pose: his master's, every length made smaller. */
export const MINI_REST: Bones = (() => {
  const out = { ...FM_REST } as Record<string, number>;
  for (const k of LENGTHS) out[k] = FM_REST[k] * K;
  // (no staff: his right hand held out at his side as his left is, a claw of fire in each)
  Object.assign(out, { rhIn: 0, rhx: 4.0 * K, rhy: -14.0 * K, rhz: 3.0 * K, re: 46, yaw: -4, twist: 2 });
  return out as unknown as Bones;
})();
/** One of his master's moves, made his: every key's lengths made smaller (his master's moves, at his size). */
export function miniOf(m: Motion): Motion {
  return {
    ...m,
    keys: m.keys.map((k) => {
      const pose: Partial<Bones> = {};
      for (const [f, v] of Object.entries(k.pose) as [keyof Bones, number][]) (pose as Record<string, number>)[f] = LENGTHS.has(f) && typeof v === 'number' ? v * K : v;
      return { ...k, pose } as Key3;
    }),
  };
}

/** His canvas: room for his staff and its skull over his hood. */
export const MINI_CANVAS: MobCanvas = { w: 240, h: 240, ax: 120, ay: 182 };

/** His standing loop: 3 s round, 30 frames at ten a second. */
export const MINI_STAND_LONG = 3.0;
/**
 * STANDING, NEVER STILL: he floats, rising and sinking slowly, swaying; his hood turns as he looks about;
 * his claw kneads the fire in it, and twice round it swells, drawn down out of the skull in streaks, and
 * sinks again; the skull's fire burns.
 */
function miniStand(): Motion {
  const R = MINI_REST;
  const keys: Key3[] = [];
  const N = 30;
  for (let i = 0; i <= N; i++) {
    const t = i / 10;
    const a = (t / MINI_STAND_LONG) * Math.PI * 2;
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 2.6 * K * Math.sin(a - 1.745),
        px: 0.45 * Math.sin(a + 2.0),
        py: 0.8 * Math.sin(a + 1.2),
        roll: 1.3 * Math.sin(a + 1.2),
        pitch: R.pitch + 0.8 * Math.sin(a + 0.5),
        bend: R.bend + 1.0 * Math.sin(a),
        twist: R.twist + 2 * Math.sin(a + 0.3),
        faceTurn: R.faceTurn + 14 * Math.sin(a - 0.6),
        faceUp: R.faceUp + 2.5 * Math.sin(2 * a),
        faceTilt: 3 * Math.sin(a + 2.2),
        lhx: R.lhx + 0.8 * Math.sin(a + 1.0),
        lhy: R.lhy + 0.6 * Math.sin(2 * a + 0.4),
        lhz: R.lhz + 1.2 * Math.sin(2 * a),
        rhx: R.rhx + 0.8 * Math.sin(a + 2.6),
        rhy: R.rhy - 0.6 * Math.sin(2 * a + 1.3),
        rhz: R.rhz + 1.2 * Math.sin(2 * a + 1.9),
        draw: 0.35 + 0.3 * Math.sin(2 * a + 0.6),
        // (the fire in his claw swelling as it is drawn down out of the skull, twice round, and sinking again)
        pAz: 1 + 0.3 * Math.max(0, Math.sin(2 * a - 0.4)),
        pt: 0.12 + 0.12 * Math.sin(3 * a),
        gale: 0.1 + 0.1 * Math.sin(a * 2 + 1),
      },
    });
  }
  return { loop: 0, keys };
}

// ---------------------------------------------------------------------------------------------
// HIS ATTACKS (the owner's yes to his own look, by 17:43 on 11 Oct: “Yes, animate them (Recommended)”).

/** Raising the dead: how long, and its moments (seconds from its start): bowed low, the rise (the dead come up from it), held, done. */
export const MINI_RAISE = { long: 2.2, low: 0.4, rise: 1.1, hold: 1.6 } as const;
/** His fire: how long, and its moments: the burst out of his claws (on a frame of the game's thirty a second), the pour from to. */
export const MINI_FIRE = { long: 2.8, burst: 17 / 30, pour: 0.6, stop: 2.1 } as const;
/** Which way his fire pours, `t` seconds into it: radians on the floor from the way he faces, turning to his left; from well off to his right, sweeping across before him, to well off to his left (about a third of the way round: his master's goes all the way). */
export function miniFireTurn(t: number): number {
  const k = clamp01((t - MINI_FIRE.pour) / (MINI_FIRE.stop - MINI_FIRE.pour));
  return -1.1 + 2.2 * (k * 0.8 + 0.2 * k * k * (3 - 2 * k));
}
/** How brightly the fire blazes between his claws, `t` seconds into one of his attacks (by his master's numbering). */
function miniMaw(prop: number, t: number): number {
  if (prop === 4) return rampAt(t, 0.35, MINI_FIRE.burst) * (1 - rampAt(t, MINI_FIRE.stop, MINI_FIRE.stop + 0.25));
  if (prop === 3) return rampAt(t, MINI_RAISE.rise - 0.2, MINI_RAISE.rise) * (1 - rampAt(t, MINI_RAISE.hold, MINI_RAISE.hold + 0.3));
  return 0;
}
/** A tremble, for a pose that is held. */
const tremble = (t: number, a: number, k: number): number => a * (Math.sin(t * 37 + k) * 0.6 + Math.sin(t * 23 + 2 * k) * 0.4);

/**
 * RAISING THE DEAD, AS THE WARDEN CALLS UP HIS (the owner's word: “can just use the same animation as the
 * warden”; art/monster_warden.ts, `summon`). He sinks and bows (0 to 0.4 s), both claws low before him, palms
 * up, open, the fire in them sunk low; holds there, gathering (to 0.6); then flings them up, the fingers
 * clawing, his head thrown back, surging up, every fire in him flaring, the embers rising off the floor
 * round him (the rise, 1.1 s: the dead come up with it, crawling out of the ground where the cult's dead lie,
 * as the Warden's do); holds them up high, shaking (to 1.6); and comes down (2.2).
 */
function miniRaise(): Motion {
  const R = MINI_REST;
  const { long: L, low: LO, rise: RS, hold: HD } = MINI_RAISE;
  const held = (t: number): number => rampAt(t, RS, RS + 0.08) * (1 - rampAt(t, HD - 0.08, HD));
  const keys = sampled(L, {
    pz: (t) => tr([[0, R.pz], [LO, R.pz - 4.5], [0.6, R.pz - 5], [0.98, R.pz + 9], [RS, R.pz + 7], [HD, R.pz + 7.5], [2.0, R.pz + 1], [L, R.pz]])(t) + tremble(t, 0.7, 1) * held(t),
    pitch: tr([[0, R.pitch], [LO, R.pitch + 11], [0.6, R.pitch + 12], [0.98, R.pitch - 9], [RS, R.pitch - 7], [HD, R.pitch - 8], [2.0, R.pitch], [L, R.pitch]]),
    bend: (t) => tr([[0, R.bend], [LO, R.bend + 20], [0.6, R.bend + 21], [0.98, R.bend - 16], [RS, R.bend - 13], [HD, R.bend - 14], [2.0, R.bend + 1], [L, R.bend]])(t) + tremble(t, 1.4, 2) * held(t),
    faceUp: tr([[0, R.faceUp], [LO, R.faceUp - 18], [0.6, R.faceUp - 19], [0.98, R.faceUp + 30], [RS, R.faceUp + 27], [HD, R.faceUp + 29], [2.0, R.faceUp + 2], [L, R.faceUp]]),
    lhx: tr([[0, R.lhx], [LO, 7], [0.6, 7.4], [RS, 3], [HD, 3], [L, R.lhx]]),
    lhy: tr([[0, R.lhy], [LO, -1], [0.6, -1], [RS, 6], [HD, 6.5], [L, R.lhy]]),
    lhz: (t) => tr([[0, R.lhz], [LO, -14], [0.6, -14.5], [0.98, 20], [RS, 17], [HD, 17.5], [2.0, 4], [L, R.lhz]])(t) + tremble(t, 1.0, 3) * held(t),
    rhx: tr([[0, R.rhx], [LO, 7], [0.6, 7.4], [RS, 3], [HD, 3], [L, R.rhx]]),
    rhy: tr([[0, R.rhy], [LO, 1], [0.6, 1], [RS, -6], [HD, -6.5], [L, R.rhy]]),
    rhz: (t) => tr([[0, R.rhz], [LO, -14], [0.6, -14.5], [0.98, 20], [RS, 17], [HD, 17.5], [2.0, 4], [L, R.rhz]])(t) + tremble(t, 1.0, 4) * held(t),
    le: tr([[0, R.le], [LO, 10], [RS, 62], [HD, 64], [L, R.le]]),
    re: tr([[0, R.re], [LO, 10], [RS, 62], [HD, 64], [L, R.re]]),
    draw: tr([[0, R.draw], [LO, 0.05], [0.6, 0.05], [RS, 0.9], [HD, 0.95], [2.0, 0.4], [L, R.draw]]),
    pAz: tr([[0, 1], [LO, 0.7], [0.6, 1.2], [RS, 2], [HD, 2], [2.0, 1.1], [L, 1]]),
    pt: tr([[0, 0], [0.6, 0.3], [RS, 1], [HD, 1], [2.0, 0.2], [L, 0]]),
    gale: tr([[0, 0], [0.6, 0.1], [0.98, 1], [RS, 0.9], [HD, 0.7], [2.0, 0.2], [L, 0]]),
  }, { prop: 3, pEl: 0 });
  // (its blow: the moment the dead come up)
  return { keys, hit: RS };
}

/**
 * HIS FIRE, a smaller version of his master's sweeping fire (the owner's words: “does a smaller version of
 * the fire laser from the boss”). WIND-UP (0 to 0.45 s): he draws both claws back to his right, cocked, the
 * fire in them swelling, rising and leaning back, turned away; THE BURST (0.57): he thrusts both claws out
 * before him together and the stream bursts out from between them; THE POUR (0.6 to 2.1): it pours down onto
 * the floor before him and he sweeps it across from his right to his left (`miniFireTurn`), his body heaving
 * after it, his robes thrashing (art/fm_spells.ts drawFireStream, MINI_FIRE_SIZE); then he pulls back (2.8).
 */
function miniFire(): Motion {
  const R = MINI_REST;
  const { long: L, burst: B, pour: P, stop: S } = MINI_FIRE;
  const pouring = (t: number): number => rampAt(t, P - 0.04, P + 0.15) * (1 - rampAt(t, S - 0.15, S + 0.05));
  const turnDeg = (t: number): number => (miniFireTurn(t) * 180) / Math.PI;
  const keys = sampled(L, {
    pz: (t) => tr([[0, R.pz], [0.4, R.pz + 2], [0.5, R.pz + 2.4], [B, R.pz - 1], [0.7, R.pz + 1], [S, R.pz + 1], [2.4, R.pz], [L, R.pz]])(t) + 0.7 * Math.sin(t * 9) * pouring(t),
    px: (t) => tr([[0, 0], [0.4, -1.5], [0.5, -1.8], [B, 2.6], [0.68, 0.4], [0.8, 0.9], [S, 0.9], [L, 0]])(t) + 0.35 * Math.sin(t * 29) * pouring(t),
    yaw: (t) => tr([[0, R.yaw], [0.4, R.yaw - 16], [0.5, R.yaw - 17], [B, R.yaw], [L, R.yaw]])(t) + turnDeg(t) * 0.35 * pouring(t),
    twist: (t) => tr([[0, R.twist], [0.4, R.twist - 22], [0.5, R.twist - 23], [B, R.twist + 4], [S, R.twist + 4], [L, R.twist]])(t) + turnDeg(t) * 0.4 * pouring(t),
    pitch: tr([[0, R.pitch], [0.4, R.pitch - 5], [0.5, R.pitch - 6], [B, R.pitch + 8], [0.7, R.pitch + 6], [S, R.pitch + 6], [L, R.pitch]]),
    bend: tr([[0, R.bend], [0.4, R.bend - 8], [0.5, R.bend - 9], [B, R.bend + 12], [0.7, R.bend + 9], [S, R.bend + 9], [L, R.bend]]),
    faceUp: tr([[0, R.faceUp], [0.4, R.faceUp + 6], [B, R.faceUp - 6], [S, R.faceUp - 4], [L, R.faceUp]]),
    faceTurn: (t) => R.faceTurn + turnDeg(t) * 0.3 * pouring(t),
    rhx: tr([[0, R.rhx], [0.4, -3], [0.5, -3.4], [B, 13], [S, 13], [2.4, 6], [L, R.rhx]]),
    rhy: (t) => tr([[0, R.rhy], [0.4, -9], [0.5, -9], [B, 5], [S, 5], [L, R.rhy]])(t) + 2 * Math.sin(miniFireTurn(t)) * pouring(t),
    rhz: (t) => tr([[0, R.rhz], [0.4, 3], [0.5, 3.5], [B, -3], [S, -3], [L, R.rhz]])(t) + tremble(t, 1.0, 5) * pouring(t),
    lhx: tr([[0, R.lhx], [0.4, 0], [0.5, -0.4], [B, 13], [S, 13], [2.4, 6], [L, R.lhx]]),
    lhy: (t) => tr([[0, R.lhy], [0.4, -10], [0.5, -10.5], [B, -5], [S, -5], [L, R.lhy]])(t) + 2 * Math.sin(miniFireTurn(t)) * pouring(t),
    lhz: (t) => tr([[0, R.lhz], [0.4, 5], [0.5, 5.5], [B, -2], [S, -2], [L, R.lhz]])(t) + tremble(t, 1.0, 6) * pouring(t),
    le: tr([[0, R.le], [0.4, 40], [B, 20], [S, 20], [L, R.le]]),
    re: tr([[0, R.re], [0.4, 40], [B, 20], [S, 20], [L, R.re]]),
    draw: tr([[0, R.draw], [0.4, 0.8], [0.5, 0.85], [B, 0.2], [S, 0.2], [L, R.draw]]),
    pAz: tr([[0, 1], [0.4, 1.9], [0.5, 2], [B, 1.4], [S, 1.4], [2.4, 1], [L, 1]]),
    pt: tr([[0, 0], [0.4, 0.6], [B, 1], [S, 1], [2.4, 0.2], [L, 0]]),
    gale: (t) => tr([[0, 0], [0.4, 0.2], [B, 1], [0.75, 0.7], [S, 0.7], [2.4, 0.1], [L, 0]])(t) + 0.2 * Math.sin(t * 17) * pouring(t),
  }, { prop: 4, pEl: 0 });
  return { keys, hit: B };
}
/** How big his fire's stream is beside his master's (art/fm_spells.ts FireSize): it comes down closer before him, reaches about half as far, is thinner, and arcs down from his claws in a shorter curve. */
export const MINI_FIRE_SIZE = { land: 0.6, reach: 2.6, thick: 0.7, bulge: 1.0 } as const;

export const MINI_PACE = 1.0;
export const MINI_FM: Mob = {
  id: 'miniFleshmancer',
  name: 'The Mini Fleshmancer',
  size: 'an elite: the knight’s height, floating',
  build: MINI_BODY,
  stand: { name: 'The mini fleshmancer floats, kneading his fire', motion: miniStand(), rest: MINI_REST },
  attack: { name: 'The mini fleshmancer sweeps fire across the floor', motion: miniFire(), rest: MINI_REST },
  idleFrames: 30,
  idleFps: 10,
  walk: { name: 'The mini fleshmancer glides', motion: miniOf(fmGlide()), rest: MINI_REST, period: 1, ground: MINI_PACE * TILE3 },
  walkFrames: 8,
  walkFps: 8,
  pace: MINI_PACE,
  reel: { name: 'The mini fleshmancer is struck', motion: miniOf(fmReel()), rest: MINI_REST },
  reelTime: 0.5,
  hit: MINI_FIRE.burst,
  warn: 0.4,
  dieTime: 1.6,
  dying: { name: 'The mini fleshmancer falls', motion: miniOf(fmReel()), rest: MINI_REST },
  aura: { x: MINI_CANVAS.ax - 2, y: MINI_CANVAS.ay - 38, r: 62, color: '#ff3a78', a: 0.16 },
  shadow: 7,
  canvas: MINI_CANVAS,
  trueBack: true,
  bits: (st, m) => withFmLook(MINI_FM_LOOK, () => fleshmancerBits(st, m)),
  more: {
    raise: { name: 'The mini fleshmancer calls up the dead', motion: miniRaise(), rest: MINI_REST },
    setOff: { name: 'The mini fleshmancer sets off', motion: miniOf(fmSetOff()), rest: MINI_REST, period: 1, ground: MINI_PACE * TILE3 },
    halt: { name: 'The mini fleshmancer stops', motion: miniOf(fmHalt()), rest: MINI_REST, period: 1, ground: MINI_PACE * TILE3 },
  },
};
void FM_BODY;

/** Where the fire between his claws is, `t` seconds into his fire (picture pixels from his floor point, as he is painted `view`): his stream pours from there (art/fm_spells.ts drawFireStream, MINI_FIRE_SIZE). */
export function miniFireAt(t: number, view: GameView = 'front'): [number, number] {
  const s = skeletonAt(MINI_FM, 'attack', t);
  const p = project(add(lerp3(s.handL, s.handR, 0.5), [0, 0, 1]), paintViewOf(MINI_FM, view));
  return [Math.round(p[0]), Math.round(p[1])];
}

/** THE MINI FLESHMANCER, as the game holds a monster (art/new_mobs3.ts makeShadeArt3). */
export function makeMiniFleshmancerArt3(pace = MINI_FM.pace): ActorArt {
  return { front: mobSet(MINI_FM, 'front', pace), back: mobSet(MINI_FM, 'back', pace) };
}

// =============================================================================================
// THE DAGGER CULTIST

/** His body: lean and wiry, a little shorter than the knight (58), narrow in the shoulder, thin in the limb. */
export const KNIFE_BODY: Build = buildOf(55, 1.0, { shoulders: 1.04, chest: 0.95, depth: 0.95, waist: 0.86, hips: 0.92, arms: 1.04, trunk: 1.0, limbs: 0.9 });
const KB = KNIFE_BODY;
/** His canvas: room for his leap, and his blade over his head. */
export const KNIFE_CANVAS: MobCanvas = { w: 200, h: 190, ax: 96, ay: 140 };

/** His robe: the cultists' violet (art/mkit.ts GLOOM), and his cowl a step darker. */
const ROBE: Ramp = ['#1e0e38', '#1e0e38', '#40206a', '#6e4498', '#6e4498'];
const COWL: Ramp = ['#150a2a', '#150a2a', '#2e144c', '#523078', '#523078'];
/** The dark rags his shins and feet are bound in, and the lighter bands of them. */
const RAGS: Ramp = ['#120e1c', '#120e1c', '#262036', '#3e3652', '#3e3652'];
const RAG_BAND: Ramp = ['#221c30', '#221c30', '#3a3250', '#584e72', '#584e72'];
/** The cord his robe is girded up with: the cult's pink (the flock's stole, knotted round him for the knife). */
const ROPE: Ramp = PINK;
/** His skin: pale, bony. */
const SKIN: Ramp = HAND_BONE;
/** The blade: bone, pale (highlight, lit, middle, shade); the guard's dark iron; the grip's binding, the cult's pink. */
const BLADE = { H: '#f6eedc', L: '#dccfb6', M: '#ab9a80', S: '#6e5e58' } as const;
const GUARD = { L: '#5a5480', M: '#3a3660', S: '#221e40' } as const;
/** The torn hem of his robe (how far up each piece of it is gone, round it). */
const TORN: readonly number[] = [1, 3, 0, 2, 4, 1, 0, 3, 2, 0, 1, 4, 2, 0, 3, 1];

/**
 * THE FACE IN HIS COWL, painted pixel by pixel where it faces the way he looks: the opening pitch black (k),
 * its edge lit a little pink from inside (r); his eyes TWO SLANTING SLASHES of the enemy's pink (h), down and
 * in toward his nose: a scowl (the cultists' eyes are slashes).
 */
const KNIFE_FACE: ReadonlyArray<string> = [
  '..rrrrr..',
  '.rkkkkkr.',
  'rkhkkkhkr',
  'rkkhkhkkr',
  'rkkkkkkkr',
  '.kkkkkkk.',
  '..kkkkk..',
];
const KNIFE_FACE_MID: P2 = [4, 3];

/** HIS COWL: its middle before his head and above it, and its half-lengths (front to back, across, up). */
const COWL_FWD = 1.0;
const COWL_UP = 1.0;
export const COWL_R: V3 = [5.6, 5.0, 5.8];
/** The top of his cowl above the floor, its point aside (for the sheet and the tests). */
export function knifeCowlTop(s: { head: V3; face: readonly [V3, V3, V3] }): number {
  const [ff, fl, fu] = s.face;
  const c = s.head[2] + ff[2] * COWL_FWD + fu[2] * COWL_UP;
  return c + Math.hypot(ff[2] * COWL_R[0], fl[2] * COWL_R[1], fu[2] * COWL_R[2]);
}

/** THE DAGGER: its blade from the fist, its guard, its grip and pommel (the figure's own lengths, along it from the middle of his fist). */
export const BLADE_LONG = 13;
const BLADE_FROM = 2.0;
/** Where its point is, on his bones. */
export function knifeTipOf(s: { handR: V3; point: V3 }): V3 {
  return add(s.handR, mul(s.point, BLADE_FROM + BLADE_LONG));
}

/**
 * THE DAGGER, AS A LITTLE PICTURE laid along the way it points as the eye sees it (as the champion's great
 * sword is): from the fist (`gx`, `gy`), at `deg` across the picture, `seen` of its length seen. A long WAVY
 * BLADE of bone, pale, its edge on the side the light comes from bright, a dark line down its middle, waving
 * twice along its length and drawn out to a point; a dark iron guard across it at the fist; a pommel of bone
 * past the fist on its other side. `glint`: the light caught on the blade (the warning), a star of it.
 */
function daggerPix(gx: number, gy: number, deg: number, seen: number, glint: number): Pix {
  const pix: Pix = new Map();
  const dx = Math.cos(deg * D);
  const dy = -Math.sin(deg * D);
  // (the side of the blade the light falls on, as the eye sees it)
  const litSide = 0.65 * dy - 0.75 * dx > 0 ? 1 : -1;
  const len0 = Math.max(4, BLADE_LONG * seen);
  const from = BLADE_FROM * Math.max(0.4, seen);
  const tip = from + len0;
  const reach = tip + 6;
  const set = (x: number, y: number, c: string): void => {
    pix.set(pk(x, y), c);
  };
  for (let y = Math.floor(gy - reach); y <= Math.ceil(gy + reach); y++) {
    for (let x = Math.floor(gx - reach); x <= Math.ceil(gx + reach); x++) {
      const rx = x + 0.5 - gx;
      const ry = y + 0.5 - gy;
      const u = rx * dx + ry * dy;
      const v = (-rx * dy + ry * dx) * litSide;
      if (u >= from && u <= tip) {
        const k = (u - from) / Math.max(1, len0);
        // (waving twice along it, drawn out to a point over its last third)
        const wave = 0.42 * Math.sin(k * Math.PI * 4);
        const half = (1.3 + 0.25 * (1 - k)) * (k > 0.66 ? (1 - k) / 0.34 : 1);
        if (Math.abs(v - wave) <= half + 0.05) {
          const vv = v - wave;
          set(x, y, vv > half - 0.9 ? BLADE.H : vv < -half + 0.9 ? BLADE.S : k < 0.62 && Math.abs(vv) < 0.5 ? BLADE.M : BLADE.L);
        }
      } else if (u >= from - 1.4 && u < from && Math.abs(v) <= 2.7) {
        set(x, y, v > 0.9 ? GUARD.L : v < -0.9 ? GUARD.S : GUARD.M);
      } else if (u >= -3.4 && u < -1.6 && Math.abs(v) <= 1.25 - Math.abs(u + 2.5) * 0.3) {
        set(x, y, v > 0.2 ? BLADE.L : BLADE.M);
      }
    }
  }
  // THE GLINT: a star of light on the blade, two thirds of the way along it
  if (glint > 0.15) {
    const k = 0.62;
    const cx = Math.floor(gx + dx * (from + len0 * k));
    const cy = Math.floor(gy + dy * (from + len0 * k));
    set(cx, cy, '#fffbe8');
    if (glint > 0.4) for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) set(cx + ox, cy + oy, glint > 0.75 ? FLAME[4] : BLADE.H);
    if (glint > 0.75) for (const [ox, oy] of [[2, 0], [-2, 0], [0, 2], [0, -2]] as const) set(cx + ox, cy + oy, FLAME[3]);
  }
  return pix;
}

/** His rest pose: crouched and coiled, his weight forward on the balls of his feet; the dagger brandished high in his right fist beside his cowl, its point up; his left hand out before him, clawing; his cowl down, his eyes up out of it. */
export const KNIFE_REST: Bones = {
  ...standing(KB),
  pz: -3.4, px: 0.8, py: 0, yaw: 2, pitch: 9, roll: 0, twist: 2, bend: 12, side: 0,
  faceTurn: -4, faceUp: 8, faceTilt: 0,
  lfx: -3.0, lfy: 3.4, lft: 18, lk: 14, rfx: 3.4, rfy: -3.6, rft: -14, rk: -18,
  rhIn: 0, rhx: 3.0, rhy: -8.5, rhz: 9.0, re: 70,
  lhIn: 0, lhx: 9.0, lhy: 4.0, lhz: -12.0, le: -8,
  wAz: -20, wEl: 74, wRoll: 0,
  draw: 0.4, out: 0, gale: 0, prop: 0, pt: 0, pAz: 0, pEl: 0, stow: 0,
};

/** His standing loop: 2.4 s round, 24 frames at ten a second. */
export const KNIFE_STAND_LONG = 2.4;
/**
 * STANDING, NEVER STILL, AND NEVER EASY: coiled, his shoulders heaving with his breath, his weight rocking
 * from foot to foot; his cowl jerking from side to side as he watches you, snapping round; the dagger high
 * in his fist, its blade turning over and back, and once round thrust up higher, ready; the fingers of his
 * other hand curling and uncurling.
 */
function knifeStand(): Motion {
  const R = KNIFE_REST;
  const keys: Key3[] = [];
  const N = 24;
  // (his cowl's jerks: held, then snapped round to the next)
  const look: ReadonlyArray<readonly [number, number]> = [[0, 0], [0.3, 0], [0.38, 16], [0.9, 16], [0.98, -10], [1.5, -10], [1.56, 4], [2.0, 4], [2.1, 0], [2.4, 0]];
  for (let i = 0; i <= N; i++) {
    const t = i / 10;
    const a = (t / KNIFE_STAND_LONG) * Math.PI * 2;
    const lift = rampAt(t, 1.3, 1.55) * (1 - rampAt(t, 1.9, 2.3));
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz - 0.6 * Math.max(0, Math.sin(4 * a)) + 0.5 * lift,
        px: R.px + 0.6 * Math.sin(a),
        py: 0.9 * Math.sin(a + 0.6),
        roll: 2.5 * Math.sin(a + 0.6),
        bend: R.bend + 2.0 * Math.sin(4 * a) - 3 * lift,
        pitch: R.pitch + 0.8 * Math.sin(4 * a + 0.4),
        twist: R.twist + 3 * Math.sin(a + 1.4) - 4 * lift,
        faceTurn: R.faceTurn + curve(look, t),
        faceUp: R.faceUp + 2 * Math.sin(2 * a) + 4 * lift,
        faceTilt: 4 * Math.sin(a + 0.4),
        rhx: R.rhx + 0.8 * Math.sin(2 * a) + 1.5 * lift,
        rhz: R.rhz + 0.8 * Math.sin(2 * a + 1) + 3 * lift,
        wAz: R.wAz + 18 * Math.sin(2 * a) + 12 * lift,
        wEl: R.wEl - 8 + 8 * Math.sin(2 * a + 0.8) + 6 * lift,
        wRoll: 30 * Math.sin(2 * a),
        lhx: R.lhx + 1.0 * Math.sin(a + 2.0),
        lhz: R.lhz + 1.2 * Math.sin(2 * a + 2.2),
        draw: 0.45 + 0.35 * Math.sin(3 * a),
        gale: 0.15 + 0.1 * Math.sin(a),
      },
    });
  }
  return { loop: 0, keys };
}

/** THE DAGGER CULTIST AS SOLIDS: his bound legs, his robe girded up with its rope and its torn hem, his stole, his sleeves and bare forearms, his hands, the cowl and its point and the face in it, the dagger. */
function knifeBits(st: Stage, m: Moment): Bit[] {
  const { s, q } = m;
  const B = KB;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const gale = clamp01(q.gale);
  const glare = lit * (1 + 0.9 * clamp01(m.glint));
  const ph = m.wind * Math.PI * 2;
  const lagRaw = mul(m.come, -1.6);
  const lagL = len(lagRaw);
  const lag = lagL > 3.2 ? mul(lagRaw, 3.2 / lagL) : lagRaw;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];

  // --- HIS LEGS, bound in dark rags from the knee down, bands of them lighter; his feet bound too ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: 1.8, rb: 1.45, ramp: RAGS, far: true });
    put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(1.5), skin: RAGS, far: true });
    put(`leg${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: 1.35, rb: 1.05, ramp: RAGS, far: true });
    const way = norm(sub(ankle, knee), [0, 0, -1]);
    const e1 = norm(cross(way, [0, 0, 1]), [0, 1, 0]);
    const e2 = norm(cross(e1, way));
    for (const k of [0.3, 0.62]) put(`leg${side}`, `shin${side}`, { k: 'band', ring: { c: lerp3(knee, ankle, k), u: mul(e1, 1.45 - 0.3 * k), v: mul(e2, 1.45 - 0.3 * k) }, ramp: RAG_BAND, rows: 1 });
    put(`leg${side}`, `foot${side}`, { k: 'rod', a: add(heel, [0, 0, 1.0]), b: add(toe, [0, 0, 0.75]), ra: 1.15, rb: 0.85, ramp: RAGS, far: true });
    put(`leg${side}`, `foot${side}`, { k: 'ball', c: ankle, ax: sphere(1.1), skin: RAGS, far: true });
  }

  // --- HIS ROBE: from his neck down over his chest, girded up at his waist, down over his thighs to a torn hem at his knees, left behind as he runs ---
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const be = s.belly;
  const torso: Ring[] = [
    { c: add(s.neck, mul(cu, 0.8)), u: mul(cf, 3.6), v: mul(cl, 4.4) },
    { c: lerp3(s.ribs, s.neck, 0.7), u: mul(cf, B.ribDeep + 2.2), v: mul(cl, B.shoulderHalf + 1.0) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 2.0), v: mul(cl, B.ribHalf + 2.2) },
    { c: waistC, u: mul(be[0], B.waistDeep + 1.6), v: mul(be[1], B.waistHalf + 1.6) },
  ];
  const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
  const spanF = Math.abs(dot(sub(s.kneeL, s.kneeR), f));
  const hemZ = Math.min(s.kneeL[2], s.kneeR[2]) + 1.2 + 1.2 * gale;
  const hipC: V3 = [s.pelvis[0], s.pelvis[1], s.pelvis[2] - 1.2];
  const hemC: V3 = [s.pelvis[0] + (kneeMid[0] - s.pelvis[0]) * 0.55 + lag[0] * 1.3, s.pelvis[1] + (kneeMid[1] - s.pelvis[1]) * 0.55 + lag[1] * 1.3, hemZ];
  const hemDeep = Math.max(B.pelvisDeep + 3.2, spanF / 2 + 2.6) + 1.2 * gale;
  const hemWide = B.pelvisHalf + 3.2 + 1.2 * gale;
  const hemPts: V3[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const rear = Math.max(0, -Math.cos(a));
    const p = add(hemC, add(mul(f, Math.cos(a) * hemDeep), mul(l, Math.sin(a) * hemWide)));
    hemPts.push(add(p, add([0, 0, Math.sin(ph * 2 + a * 3) * 0.6 + rear * (0.6 + 1.6 * gale)], mul(lag, rear * 0.7))));
  }
  const skirt: Ring[] = [
    { c: hipC, u: mul(f, B.pelvisDeep + 2.0), v: mul(l, B.pelvisHalf + 2.2) },
    { c: lerp3(hipC, hemC, 0.5), u: mul(f, (B.pelvisDeep + 2.0 + hemDeep) / 2), v: mul(l, (B.pelvisHalf + 2.2 + hemWide) / 2) },
    { c: hemC, u: mul(f, hemDeep), v: mul(l, hemWide), pts: hemPts },
  ];
  const robeRings = [...torso, ...skirt];
  put('robe', 'robe', { k: 'cloth', rings: robeRings, ramp: ROBE, look: { folds: [25, -25, 70, -70, 120, -120, 165, -165], lift: 0.08 }, torn: TORN });

  // --- THE CULT'S PINK CORD ROUND HIS WAIST, girding his robe up, its knot at his side and its two ends hanging, swinging ---
  {
    const ring: Ring = { c: add(waistC, mul(cu, -0.4)), u: mul(be[0], B.waistDeep + 1.6), v: mul(be[1], B.waistHalf + 1.6) };
    put('rope', 'rope', { k: 'band', ring, ramp: ROPE, rows: 2 });
    const knot = add(add(ring.c, mul(norm(be[0]), (B.waistDeep + 1.6) * 0.75)), mul(norm(be[1]), (B.waistHalf + 1.6) * 0.62));
    put('rope', 'rope', { k: 'ball', c: knot, ax: sphere(1.0), skin: ROPE });
    for (const [j, long] of [[0, 6.5], [1, 5.0]] as const) {
      const sway = Math.sin(ph * 2 + j * 1.9) * 0.8;
      const end = add(knot, add([0, 0, -long], add(mul(l, (j ? 0.8 : -0.3) + sway * 0.4), mul(lag, 1.1))));
      put('rope', 'rope', { k: 'rod', a: knot, b: end, ra: 0.75, rb: 0.6, ramp: ROPE });
    }
  }

  // --- HIS SLEEVES, pushed back off his forearms; bare, bony forearms; his hands ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    put(`sleeve${side}`, `sleeve${side}`, { k: 'rod', a: sh, b: el, ra: 2.5, rb: 2.6, ramp: ROBE, far: true });
    const e1 = norm(sub([0, 0, 1], mul(fore, dot([0, 0, 1], fore))), cu);
    const e2 = norm(cross(fore, e1));
    const mouth = add(el, mul(fore, 1.8));
    const mouthPts: V3[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const under = Math.max(0, -Math.cos(a));
      mouthPts.push(add(add(mouth, add(mul(e1, Math.cos(a) * 2.7), mul(e2, Math.sin(a) * 2.7))), add([0, 0, -under * (1.6 + gale)], mul(lag, under * 0.5))));
    }
    put(`sleeve${side}`, `sleeve${side}`, { k: 'cloth', rings: [{ c: el, u: mul(e1, 2.4), v: mul(e2, 2.4) }, { c: mouth, u: mul(e1, 2.7), v: mul(e2, 2.7), pts: mouthPts }], ramp: ROBE, look: { folds: [90, -90], lift: 0.1 } });
    const wrist = add(hand, mul(fore, -0.9));
    put(`arm${side}`, `arm${side}`, { k: 'rod', a: add(mouth, mul(fore, -0.6)), b: wrist, ra: 0.95, rb: 0.75, ramp: SKIN, far: true });
    if (side === 'R') {
      // (his fist, closed on the dagger's grip)
      put('handR', 'handR', { k: 'ball', c: hand, ax: [mul(fore, 1.4), mul(e1, 1.25), mul(e2, 1.25)], skin: SKIN, far: true });
    } else {
      // (his left hand open, clawing: a narrow palm and four bony fingers hooked in, curling as he breathes)
      const curl = clamp01(q.draw);
      put('handL', 'handL', { k: 'ball', c: hand, ax: [mul(fore, 1.1), mul(e1, 1.1), mul(e2, 0.7)], skin: SKIN, far: true });
      for (let j = 0; j < 4; j++) {
        const t = (j - 1.5) / 1.5;
        const base = add(add(hand, mul(fore, 0.9)), mul(e2, t * 1.1));
        const d0 = norm(add(fore, mul(e2, t * 0.45)));
        const mid0 = add(base, mul(d0, 1.8));
        const hook = norm(add(mul(d0, 1 - curl), mul(e1, -0.9 * curl - 0.2)));
        put('handL', 'handL', { k: 'rod', a: base, b: mid0, ra: 0.45, rb: 0.4, ramp: SKIN, far: true });
        put('handL', 'handL', { k: 'rod', a: mid0, b: add(mid0, mul(hook, 1.6)), ra: 0.4, rb: 0.3, ramp: SKIN, far: true });
      }
    }
  }

  // --- THE DAGGER, in his right fist: laid along the way it points as the eye sees it, just behind his fist ---
  {
    const [gx, gy] = st.at(s.handR);
    const [px, py] = st.seen(s.point);
    const deg = (Math.atan2(-py, px) * 180) / Math.PI;
    const pix = daggerPix(Math.floor(gx) + 0.5, Math.floor(gy) + 0.5, deg, Math.hypot(px, py), clamp01(m.glint));
    stamp(st, put, 'dagger', 'dagger', pix, add(s.handR, mul(st.eye, -0.6)));
  }
  // (its way through the air as he plunges it, streaked)
  if (m.blur && m.trails) {
    for (const tr0 of m.trails) {
      for (let i = 1; i < tr0.length; i++) {
        const a = tr0[i - 1];
        const b = tr0[i];
        const n = Math.max(1, Math.ceil(Math.hypot(st.at(b)[0] - st.at(a)[0], st.at(b)[1] - st.at(a)[1])));
        for (let j = 0; j < n; j++) put('streak', 'streak', { k: 'mote', p: lerp3(a, b, j / n), c: i < tr0.length / 2 ? BLADE.H : BLADE.M, size: 1 });
      }
    }
  }

  // --- THE STAB LANDING: a burst at the dagger's point as it strikes, splinters of light flung out from it, gone in a moment ---
  if (m.dust && m.since !== undefined && m.since >= -0.01 && m.since < 0.16 && lit > 0.05) {
    const k = clamp01(m.since / 0.16);
    const tip = knifeTipOf(s);
    put('glow', 'glow', { k: 'glow', p: tip, c: FLAME[3], r: 16 - 8 * k, a: 0.6 * (1 - k) });
    for (let i = 0; i < 8; i++) {
      if (k > 0.55 + 0.4 * hash(i, 3, 617)) continue;
      const a = (i / 8) * Math.PI * 2 + hash(i, 1, 617) * 0.6;
      const r = 2 + (6 + 6 * hash(i, 2, 617)) * Math.sqrt(k);
      const p0: V3 = [tip[0] + Math.cos(a) * r, tip[1] + Math.sin(a) * r, Math.max(0.5, tip[2] + 1 + (3 + 5 * hash(i, 4, 617)) * Math.sin(Math.PI * k))];
      // (each splinter two pixels long on the picture, drawn back toward where it came from, whichever way it flies)
      const [sx, sy] = st.at(p0);
      const [tx, ty] = st.at(tip);
      const back = Math.hypot(sx - tx, sy - ty) > 0.5 ? unit2([tx - sx, ty - sy]) : ([0, 1] as P2);
      const p1 = screenStep(st, p0, back[0] * 2, back[1] * 2);
      const n = 2;
      for (let j = 0; j <= n; j++) put('fire', 'fire', { k: 'mote', p: lerp3(p1, p0, j / n), c: j === n ? (k < 0.3 ? '#fffbe8' : BLADE.H) : k < 0.4 ? FLAME[3] : FLAME[2], size: 1 });
    }
  }

  // --- HIS COWL: deep, its point drooping behind; the opening dark, his eyes two slashes of pink in it ---
  const face = wornOn(st, s, 12);
  const [ff, fl, fu] = face;
  {
    const hc = add(s.head, add(mul(ff, COWL_FWD), mul(fu, COWL_UP)));
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
          return lit < 0.05 ? INK : hot ? FLAME[1] : '#4a0c38';
        case 'k':
          return INK;
        case 'h':
          return lit < 0.05 ? INK : hot ? FLAME[4] : glare > 0.5 ? SOCKET : FLAME[1];
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
        const line = KNIFE_FACE[Math.floor(y) - oyi + KNIFE_FACE_MID[1]];
        const col = Math.floor(x) - oxi + KNIFE_FACE_MID[0];
        if (line && col >= 0 && col < line.length) {
          const c = faceColour(line[col]);
          if (c) return c;
        }
      }
      return COWL[tone];
    };
    put('cowl', 'cowl', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: cowlSkin });
    // (the back of the cowl falls to his shoulders)
    put('cowl', 'cowl', { k: 'ball', c: add(add(hc, mul(ff, -2.6)), mul(fu, -3.2)), ax: [mul(ff, 3.8), mul(fl, 4.6), mul(fu, 3.6)], skin: COWL });
    // ITS POINT: from the top of the back of the cowl, drooping back and down, tapering, swinging as he moves
    {
      let at = add(hc, add(mul(fu, hr[2] * 0.72), mul(ff, -hr[0] * 0.4)));
      const R0 = [2.5, 1.9, 1.3, 0.7, 0.3];
      for (let i = 0; i < 4; i++) {
        const k = (i + 1) / 4;
        const sway = Math.sin(ph * 2 + i * 0.9) * 0.4 * k;
        const next = add(at, add(add(mul(ff, -2.1), mul(fu, 1.1 - 2.0 * k)), add(mul(fl, sway), mul(lag, 0.35 * k))));
        put('cowl', 'cowl', { k: 'rod', a: at, b: next, ra: R0[i], rb: R0[i + 1], ramp: COWL });
        at = next;
      }
    }
    // (the light of his eyes, in the dark of the cowl)
    if (lit > 0.05 && dot(od, st.eye) > 0.05) put('glow', 'glow', { k: 'glow', p: add(hc, mul(od, hr[0] * 0.9)), c: SOCKET, r: 3 + 3 * clamp01(m.glint), a: Math.min(0.6, 0.28 * glare) });
  }

  // --- THE DUST he kicks up as he lands on his blow: clots of it, none a lone speck ---
  if (m.dust && m.since !== undefined && m.since >= 0 && m.since < DUST_FOR) {
    const k = m.since / DUST_FOR;
    const foot = lerp3(lerp3(s.heelL, s.toeL, 0.6), lerp3(s.heelR, s.toeR, 0.6), 0.5);
    for (let i = 0; i < 18; i++) {
      if (hash(i, 7, 613) < k * 0.9) continue;
      const a = (i / 18) * Math.PI * 2 + hash(i, 1, 613);
      const r = 3 + (7 + 7 * hash(i, 2, 613)) * Math.sqrt(k);
      const z = 0.4 + (1.5 + 3.5 * hash(i, 3, 613)) * Math.sin(Math.PI * Math.min(1, k * 1.3));
      put('dust', 'dust', { k: 'mote', p: [foot[0] + Math.cos(a) * r * 1.2, foot[1] + Math.sin(a) * r, z], c: i % 3 ? DUST[1] : DUST[0], size: 2 });
    }
  }
  return bits;
}
/** How long the dust he kicks up as he lands lasts; its colours. */
const DUST_FOR = 0.4;
const DUST = ['#463e64', '#6a6088'] as const;

// ---------------------------------------------------------------------------------------------
// HIS MOVES (the owner's yes to his look, by 17:43 on 11 Oct: “Yes, animate them (Recommended)”):
// his run at you, his leap and plunge of the dagger, struck, and his death, which leaves him lying (the
// mini fleshmancer raises the dead out of the cult's own).

/** His run: eight frames at thirteen a second, painted for 2.6 tiles a second (the game's cultists' pace). */
export const KNIFE_PACE = 2.6;
const RUN_FRAMES = 8;
const RUN_FPS = 13;
/**
 * HIS RUN AT YOU: a sprint, bent low and driving forward, both feet off the floor between strides; the
 * dagger brandished high in his fist beside his cowl, its point up, as he stands; his other hand
 * clawing the air before him, pumping; his robe and the point of his cowl streaming back. A foot that is
 * down stays on its spot of the floor (each foot is down three frames of the eight, and off it five).
 */
function knifeRun(): Motion {
  const R = KNIFE_REST;
  const d = (KNIFE_PACE * TILE3) / RUN_FPS;
  // (a foot: down three frames, moving back under him as he goes on over it; then off the floor, swung through and reached out ahead)
  const FOOT: ReadonlyArray<readonly [number, number, number]> = [
    [1.0, 0, -8], [0, 0, 0], [-1.0, 0, 22], [-1.6, 2.6, 42], [-0.5, 6.0, 26], [0.8, 6.6, 0], [1.6, 4.2, -12], [1.5, 1.4, -10],
  ];
  const keys: Key3[] = [];
  for (let i = 0; i <= RUN_FRAMES; i++) {
    const j = i % RUN_FRAMES;
    const a = (j / RUN_FRAMES) * Math.PI * 2;
    const [rx, rz, rp] = FOOT[j];
    const [lx, lz, lp] = FOOT[(j + 4) % RUN_FRAMES];
    keys.push({
      at: i / RUN_FPS,
      ease: 'lin',
      pose: {
        px: 1.5, py: -0.6 * Math.sin(a), pz: -2.4 - 1.5 * Math.sin(2 * a),
        yaw: 7 * Math.cos(a), pitch: 17 + 2 * Math.sin(2 * a), roll: 2.5 * Math.sin(a), twist: -9 * Math.cos(a), bend: 12 + 1.5 * Math.sin(2 * a), side: 0,
        faceTurn: -3 * Math.cos(a), faceUp: 16, faceTilt: 2 * Math.sin(a),
        rfx: rx * d, rfz: rz, rfp: rp, rfy: -3.0, rft: -10, rk: -12,
        lfx: lx * d, lfz: lz, lfp: lp, lfy: 3.0, lft: 10, lk: 12,
        rhIn: 0, rhx: 1.5 + 1.6 * Math.cos(a), rhy: -8.5, rhz: 8 + 1.4 * Math.sin(2 * a), re: 70,
        wAz: -20, wEl: 62 + 5 * Math.sin(2 * a), wRoll: 0,
        lhIn: 0, lhx: 3 - 6 * Math.cos(a), lhy: 3.5, lhz: -9 + 3 * Math.max(0, Math.cos(a)), le: -12,
        draw: 0.55 + 0.25 * Math.sin(a), gale: 0.55,
      },
    });
  }
  return { keys, loop: 0 };
}

/** His blow: how long it is, when it lands (on a frame of the game's thirty a second), when he warns, and when he leaps. */
export const KNIFE_BLOW = { long: 1.15, hit: 19 / 30, rise: 0.3, leap: 0.52 } as const;
/**
 * THE LEAP AND PLUNGE. He plants himself and sinks (0 to 0.14 s); rears up and back onto his toes, both
 * hands hauling the dagger high over his head, its point turned down, his cowl thrown back, his eyes
 * flaring and the light catching the blade (THE WARNING, held trembling from 0.3 to 0.52); then he LEAPS
 * at you (0.52), both feet off the floor, and PLUNGES the dagger down with both hands as he lands (0.63),
 * bent double over it, more than half a tile on from where he stood, his robe flung forward, the floor's dust
 * kicked up round his feet; he wrenches it free and springs back (1.15).
 */
function knifeBlow(): Motion {
  const R = KNIFE_REST;
  const { long: L, hit: H } = KNIFE_BLOW;
  const held = (t: number): number => rampAt(t, 0.28, 0.32) * (1 - rampAt(t, 0.48, 0.52));
  const keys = sampled(L, {
    pz: (t) => tr([[0, R.pz], [0.14, R.pz - 2.5], [0.3, R.pz + 1.5], [0.44, R.pz + 1.8], [0.5, R.pz - 2], [0.57, R.pz + 8], [H, R.pz - 9], [0.7, R.pz - 10], [0.85, R.pz - 7], [L, R.pz]])(t) + shiver(t, 0.25, 1) * held(t),
    px: tr([[0, R.px], [0.14, 0], [0.44, -1.5], [0.5, -1.2], [0.57, 12], [H, 24], [0.75, 24.5], [0.9, 17], [L, R.px]]),
    pitch: tr([[0, R.pitch], [0.14, 4], [0.3, -6], [0.44, -8], [0.52, -4], [0.57, 14], [H, 32], [0.75, 30], [0.9, 20], [L, R.pitch]]),
    bend: (t) => tr([[0, R.bend], [0.14, 6], [0.3, -10], [0.44, -12], [0.52, -6], [0.57, 12], [H, 26], [0.75, 24], [0.9, 16], [L, R.bend]])(t) + shiver(t, 0.6, 2) * held(t),
    twist: tr([[0, R.twist], [0.3, -6], [0.44, -8], [H, 6], [L, R.twist]]),
    yaw: tr([[0, R.yaw], [0.3, 0], [H, -4], [L, R.yaw]]),
    faceUp: tr([[0, R.faceUp], [0.3, 22], [0.44, 24], [H, -4], [0.8, 0], [L, R.faceUp]]),
    faceTurn: tr([[0, R.faceTurn], [0.3, 0], [L, R.faceTurn]]),
    rhx: tr([[0, R.rhx], [0.14, 2], [0.3, 2.5], [0.44, 1.5], [0.52, 0.5], [H, 14], [0.75, 14], [0.9, 9], [L, R.rhx]]),
    rhy: tr([[0, R.rhy], [0.3, 5], [0.52, 5], [H, 5], [0.9, 0], [L, R.rhy]]),
    rhz: (t) => tr([[0, R.rhz], [0.14, 14], [0.3, 20], [0.44, 21], [0.52, 22], [H, -20], [0.75, -21], [0.9, -9], [L, R.rhz]])(t) + shiver(t, 0.35, 3) * held(t),
    re: tr([[0, R.re], [0.3, 40], [H, 15], [L, R.re]]),
    wAz: tr([[0, R.wAz], [0.3, 10], [H, 5], [0.9, 0], [L, R.wAz]]),
    wEl: tr([[0, R.wEl], [0.14, 20], [0.3, -55], [0.52, -60], [H, -84], [0.75, -84], [0.9, -40], [L, R.wEl]]),
    lhx: tr([[0, R.lhx], [0.14, 4], [0.3, 3], [0.52, 1.5], [H, 13.5], [0.75, 13.5], [0.9, 9], [L, R.lhx]]),
    lhy: tr([[0, R.lhy], [0.14, -2], [0.3, -5], [H, -5], [0.9, -1], [L, R.lhy]]),
    lhz: (t) => tr([[0, R.lhz], [0.14, 10], [0.3, 19], [0.44, 20], [0.52, 21], [H, -18], [0.75, -19], [0.9, -9], [L, R.lhz]])(t) + shiver(t, 0.35, 4) * held(t),
    le: tr([[0, R.le], [0.3, -30], [H, -10], [L, R.le]]),
    rfx: tr([[0, R.rfx], [0.51, R.rfx], [0.57, 18], [H, 31], [0.85, 31], [1.0, 18], [L, R.rfx]]),
    rfz: tr([[0, 0], [0.51, 0], [0.55, 5], [0.58, 7], [H - 0.01, 0.5], [H, 0], [0.9, 0], [0.96, 3], [1.02, 0], [L, 0]]),
    rfp: tr([[0, 0], [0.5, 20], [0.56, -10], [H, 0], [L, 0]]),
    lfx: tr([[0, R.lfx], [0.52, R.lfx], [0.58, 8], [H, 18], [0.9, 18], [1.06, 6], [L, R.lfx]]),
    lfz: tr([[0, 0], [0.52, 0], [0.56, 6], [0.6, 3], [H, 0], [0.98, 0], [1.04, 3], [1.1, 0], [L, 0]]),
    lfp: tr([[0, 0], [0.5, 30], [0.56, 10], [H, 0], [L, 0]]),
    draw: tr([[0, R.draw], [0.2, 1], [0.85, 1], [L, R.draw]]),
    gale: tr([[0, 0.1], [0.5, 0.2], [0.57, 0.8], [H, 1], [0.8, 0.5], [L, 0.15]]),
  }, { prop: 0, pAz: 0, pEl: 0 });
  return { keys, hit: H };
}
/** The light catching his blade as he raises it (the warning): up as it goes up, brightest just before he leaps, gone as it strikes. */
function knifeGlint(t: number): number {
  const { hit: H } = KNIFE_BLOW;
  if (t < 0.18 || t > H) return 0;
  return t < 0.42 ? (t - 0.18) / 0.24 : t < 0.52 ? 1 : 1 - (t - 0.52) / (H - 0.52);
}
/** STRUCK: knocked back on his heels, his cowl jerked back, his arms flung out, his robe flaring; then coiled again. */
function knifeReel(): Motion {
  const R = KNIFE_REST;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: R.px - 2.6, pitch: R.pitch - 10, bend: R.bend - 12, faceUp: R.faceUp + 14, twist: R.twist - 8, rhz: R.rhz + 3, rhy: R.rhy - 2, lhx: R.lhx - 5, lhz: R.lhz + 4, gale: 0.9 }, ease: 'out' },
      { at: 0.16, pose: { px: R.px - 1.3, pitch: R.pitch - 3, bend: R.bend - 4, faceUp: R.faceUp + 5, gale: 0.45 }, ease: 'io' },
      { at: 0.3, pose: {}, ease: 'io' },
    ],
  };
}
/** How long his death takes. */
export const KNIFE_DIES = { long: 1.3, buckle: 0.38, down: 0.72 } as const;
/**
 * HIS DEATH: struck, thrown back (0.06 s); his knees give and he drops to them, his arms falling, the light
 * going out of his eyes (0.38); he pitches forward onto his face (0.72), bounces a little and lies still, the
 * dagger still in his fist by his head, his robe spread over him: A CORPSE, left lying (for the mini
 * fleshmancer to raise the dead out of).
 */
function knifeDying(): Motion {
  const R = KNIFE_REST;
  const kneel: Partial<Bones> = {
    px: 1.5, pz: -14.5, pitch: 14, bend: 22, twist: 0, yaw: 0, faceUp: -14, faceTurn: 0,
    lfx: -7.0, rfx: -5.5, lfy: 3.4, rfy: -3.4, lfp: 60, rfp: 60, lk: 0, rk: 0, lfz: 0, rfz: 0,
    rhIn: 0, rhx: 4, rhy: -4, rhz: -18, re: 10, lhIn: 0, lhx: 4, lhy: 4, lhz: -18, le: -10, wAz: 0, wEl: -60, draw: 0.3,
  };
  const down: Partial<Bones> = {
    px: 8, pz: -24.5, pitch: 84, bend: 6, twist: 0, yaw: 10, faceUp: -10, faceTurn: 70, faceTilt: 20,
    lfx: -16, rfx: -15, lfy: 4.5, rfy: -2.5, lfz: 1.2, rfz: 1.2, lfp: 85, rfp: 85, lk: 0, rk: 0,
    rhIn: 0, rhx: 9, rhy: -6, rhz: 2, re: 40, lhIn: 0, lhx: 5, lhy: 8, lhz: -4, le: -30, wAz: -40, wEl: -10, draw: 0.6,
  };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: R.px - 2.2, pitch: R.pitch - 9, bend: R.bend - 12, faceUp: R.faceUp + 18, rhz: R.rhz + 4, lhx: R.lhx - 4, gale: 0.9, out: 0.1 }, ease: 'out' },
      { at: KNIFE_DIES.buckle, pose: { ...kneel, gale: 0.4, out: 0.5 }, ease: 'in' },
      { at: KNIFE_DIES.buckle + 0.08, pose: { ...kneel, pz: -15.2, gale: 0.3, out: 0.6 }, ease: 'out' },
      { at: KNIFE_DIES.down, pose: { ...down, gale: 0.8, out: 0.9 }, ease: 'in' },
      { at: KNIFE_DIES.down + 0.08, pose: { ...down, pz: -23.3, gale: 0.5, out: 1 }, ease: 'out' },
      { at: KNIFE_DIES.down + 0.18, pose: { ...down, gale: 0.2, out: 1 }, ease: 'io' },
      { at: KNIFE_DIES.long, pose: { ...down, gale: 0, out: 1 }, ease: 'io' },
    ],
  };
}

export const DAGGER_CULTIST: Mob = {
  id: 'daggerCultist',
  name: 'The Dagger Cultist',
  size: 'small: a little shorter than the knight',
  build: KB,
  stand: { name: 'The dagger cultist, coiled', motion: knifeStand(), rest: KNIFE_REST },
  attack: { name: 'The dagger cultist leaps and plunges his dagger', motion: knifeBlow(), rest: KNIFE_REST, glint: knifeGlint, trail: (s) => [knifeTipOf(s)], trailOver: (t) => t > KNIFE_BLOW.hit - 0.08 && t <= KNIFE_BLOW.hit + 0.01, trailSpan: 3, dust: true },
  idleFrames: 24,
  idleFps: 10,
  walk: { name: 'The dagger cultist runs at you', motion: knifeRun(), rest: KNIFE_REST, period: RUN_FRAMES / RUN_FPS, ground: KNIFE_PACE * TILE3 },
  walkFrames: RUN_FRAMES,
  walkFps: RUN_FPS,
  pace: KNIFE_PACE,
  reel: { name: 'The dagger cultist is struck', motion: knifeReel(), rest: KNIFE_REST },
  reelTime: 0.3,
  hit: KNIFE_BLOW.hit,
  warn: KNIFE_BLOW.rise,
  dieTime: KNIFE_DIES.long,
  dying: { name: 'The dagger cultist falls on his face', motion: knifeDying(), rest: KNIFE_REST },
  aura: { x: KNIFE_CANVAS.ax - 2, y: KNIFE_CANVAS.ay - 30, r: 42, color: '#ff3a78', a: 0.13 },
  shadow: 11,
  canvas: KNIFE_CANVAS,
  trueBack: true,
  bits: (st, m) => knifeBits(st, m),
};

/** THE DAGGER CULTIST, as the game holds a monster. */
export function makeDaggerCultistArt3(pace = DAGGER_CULTIST.pace): ActorArt {
  return { front: mobSet(DAGGER_CULTIST, 'front', pace), back: mobSet(DAGGER_CULTIST, 'back', pace) };
}
