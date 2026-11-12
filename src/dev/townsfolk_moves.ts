// THE TOWNSFOLK'S MOVES, AT THIRTY A SECOND (the townsfolk chat, 11 Nov 2026). THE GAME'S since his yes of 11 Nov 2026 (“Yes,
// hand them to main (Recommended)”): art/townsfolk3.ts, TOWNSFOLK3 on, their frames baked to files (tools/bake_townsfolk.mjs).
//
// His words, 8 Nov 2026, 06:25: “And I think the townsfolk need look update and a 30fps makeover”; and his rule to the art chat
// the same morning, “Yes, everything (Recommended)”: EVERYTHING THAT MOVES AT 30 A SECOND. They stood at ten frames a second
// and worked at twenty (art/townsfolk.ts IDLE_FPS, ACT_FPS).
//
// Each of the four has, as before, A LOOP THEY STAND IN and WHAT EACH DOES NOW AND THEN, which begins and ends as the loop
// stands (so the two meet). Each is now a pose of the bones at every thirtieth of a second (dev/sculpt_townsfolk.ts), and
// each is made by his rulebook's Movement: weight first (1), loose things follow (4), alive when still (6), a big wind-up
// and a lightning strike (9):
//   the ARMOURER   breathes from his belly, shifts his weight from foot to foot, looks to his forge and back, hefts the hammer
//                  on his shoulder; now and then heaves it up behind his head, holds, and BRINGS IT DOWN on the anvil in two
//                  frames: sparks, the blow held a tenth of a second, the hammer bouncing off the face, his beard flung up
//   the MYSTIC     sways, his free hand drifting over his wares, the crystal turning and bobbing over his palm; now and then
//                  sweeps that hand up and round it: it lifts, spins up and BLAZES, his robe and turban's end stirred by it
//   the WORDSMITH  as he has moved since 8 Oct (art/smith3.ts SMITH_MOVES, his yes then), three times as many pictures
//   the STRANGER   breathes, his eyes going from side to side; now and then a hand comes out of his folded arms and flicks
//                  a coin up: it turns over and over, he snatches it out of the air

import { SMITH_BODY, SMITH_MOVES, SMITH_STANCE } from '../art/smith3';
import { add, bonesAt, mul, solve, standing } from '../art/skeleton';
import type { Bones, Build, Posed, V3 } from '../art/skeleton';
import {
  ANVIL, ARMOURER_BUILD, MYSTIC_BUILD, STRANGER_BUILD, armourerStance, fistOnHip, handTo, mysticStance, strangerStance,
} from './sculpt_townsfolk';
import type { ArmourerPose, MysticPose, StrangerPose, WordsmithPose } from './sculpt_townsfolk';

/** Thirty pictures a second. */
export const TFPS = 30;

type Ease = 'io' | 'in' | 'out' | 'lin' | 'snap';
interface Key { f: number; q: Partial<Bones>; e?: Ease }
const easeOf = (e: Ease | undefined, u: number): number => {
  const k = Math.max(0, Math.min(1, u));
  if (e === 'lin') return k;
  if (e === 'in') return k * k;
  if (e === 'out') return 1 - (1 - k) ** 3;
  if (e === 'snap') return k * k * k;
  return k * k * (3 - 2 * k);
};
/** The pose at frame `f` of a run of keys: each key is the base with its own numbers; between two, each number eased by the later key's way. */
function keyed(base: Partial<Bones>, keys: Key[], f: number): Partial<Bones> {
  let i = 0;
  while (i < keys.length - 1 && keys[i + 1].f <= f) i++;
  const a = { ...base, ...keys[i].q } as Record<string, number>;
  if (i === keys.length - 1 || f <= keys[i].f) return a as Partial<Bones>;
  const b = { ...base, ...keys[i + 1].q } as Record<string, number>;
  const u = easeOf(keys[i + 1].e, (f - keys[i].f) / (keys[i + 1].f - keys[i].f));
  const out: Record<string, number> = {};
  for (const k of Object.keys(b)) {
    const x = a[k] ?? b[k];
    out[k] = k.endsWith('In') ? b[k] : x + (b[k] - x) * u;
  }
  return out as Partial<Bones>;
}
const TAU = Math.PI * 2;
const wave = (f: number, long: number, cycles = 1, phase = 0): number => Math.sin((f / long) * TAU * cycles + phase);
const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
const smooth = (u: number): number => {
  const k = clamp(u, 0, 1);
  return k * k * (3 - 2 * k);
};

/** How one of them moves: the loop and the act, each a pose at every frame. */
export interface TownMoves<P> {
  /** The loop: so many frames round. */
  idleLong: number;
  idle(f: number): P;
  /** What they do now and then: frames 0 to `actLong` (the first and the last are the loop's frame 0). */
  actLong: number;
  act(f: number): P;
  /** How many times the loop goes round between one act and the next. */
  loops: number;
  /** For the sound chat and the main chat: the moments of the act that are heard (frames). */
  beats: Record<string, number>;
}

// ---------------------------------------------------------------------------------------------
// THE ARMOURER

const A_B = ARMOURER_BUILD;
const A_STANCE = armourerStance();
const A_IDLE = 120;
/** How high the crown of his head stands in a pose (for what hangs from it: the beard is flung up as it drops). */
const headZ = (B: Build, q: Partial<Bones>): number => solve(B, { ...standing(B), ...q } as Posed).head[2];

function armourerIdleBones(f: number): Partial<Bones> {
  // (the breath from his belly, twice round; his weight from one foot to the other and back, once; a look to the forge
  // on his right and back; the hammer hefted once on his shoulder)
  const breath = wave(f, A_IDLE, 2);
  const shift = wave(f, A_IDLE, 1, -0.6);
  const look = smooth((f - 34) / 16) * (1 - smooth((f - 78) / 16));
  const heft = Math.max(0, Math.sin(clamp((f - 92) / 14, 0, 1) * Math.PI));
  const q: Partial<Bones> = {
    ...A_STANCE,
    pz: (A_STANCE.pz ?? 0) - 0.35 - 0.35 * breath - 0.5 * heft,
    py: 0.7 * shift,
    roll: 1.6 * shift,
    side: -1.2 * shift,
    bend: (A_STANCE.bend ?? 0) + 0.8 * breath,
    hunch: (A_STANCE.hunch ?? 0) + 1.0 * breath,
    faceTurn: (A_STANCE.faceTurn ?? 0) - 26 * look,
    faceUp: (A_STANCE.faceUp ?? 0) + 5 * look,
    rhz: (A_STANCE.rhz ?? 0) + 0.3 * breath + 1.3 * heft,
    wEl: (A_STANCE.wEl ?? 0) + 1.2 * breath - 5 * heft,
  };
  return fistOnHip(A_B, q, 'L');
}

/** The loop's first frame: where the blow begins and ends. */
const A_HOME = armourerIdleBones(0);

/** Where his hammer hand must be for the head's face to lie on the anvil's, the handle slanting down to it by `el` degrees. */
function strikeHand(el: number): V3 {
  const D = Math.PI / 180;
  const d: V3 = [Math.cos(el * D), 0, Math.sin(el * D)];
  // (the head's long way is square to the handle, in the plane of the swing: its lower face is 4.6 from its middle)
  const up: V3 = [-Math.sin(el * D), 0, Math.cos(el * D)];
  const face: V3 = [ANVIL.fwd, 0, ANVIL.up + 0.4];
  const headC = add(face, mul(up, 4.6));
  return add(headC, mul(d, -13.2));
}
/** The frames of his blow: the wind-up held to here, the head on the anvil here, off it again here; all of it over here. */
export const A_BLOW = { top: 18, held: 24, lands: 26, off: 29, long: 72 };
const A_STRIKE_EL = -28;
const A_KEYS: Key[] = (() => {
  const S = A_STANCE;
  // THE WIND-UP, BIG: his weight back on his heels, his chest turned away and laid back, the hammer heaved up off his
  // shoulder to behind his head, his left hand off his hip and out before him
  const up: Partial<Bones> = {
    px: -2.0, pz: -1.2, pitch: -4, bend: -9, twist: -22, hunch: 2, faceUp: 2, faceTurn: 10,
    rhIn: 0, rhx: 0.6, rhy: -2.6, rhz: 10.5, re: 64, wAz: 176, wEl: 48, wRoll: 0,
    lhIn: 0, lhx: 10.5, lhy: -1.0, lhz: -8.5, le: 26,
  };
  const upHeld: Partial<Bones> = { ...up, px: -2.3, pz: -1.1, bend: -11, twist: -25, rhz: 11.2, wEl: 42 };
  // THE BLOW: thrown forward and down over his planted feet, his knees giving, his back curled into it, the arm straight
  const downBody: Partial<Bones> = {
    px: 4.2, pz: -5.2, pitch: 6, bend: 30, twist: 9, hunch: 12, faceUp: -24, faceTurn: 0,
    re: 12, wAz: 0, wEl: A_STRIKE_EL, wRoll: 0,
    lhIn: 0, lhx: 3.5, lhy: 3.2, lhz: -15.5, le: 40,
    lk: 22, rk: -24,
  };
  const down = handTo(A_B, { ...A_HOME, ...downBody }, 'R', () => strikeHand(A_STRIKE_EL));
  const downQ: Partial<Bones> = { ...downBody, rhIn: 0, rhx: down.rhx, rhy: down.rhy, rhz: down.rhz };
  // (held on the anvil a tenth of a second, the whole of him shaken by it)
  const heldQ: Partial<Bones> = { ...downQ, pz: -4.8, bend: 29 };
  // THE HAMMER BOUNCES off the face and he lets it, his arm giving
  const bounceBody: Partial<Bones> = { ...downBody, px: 3.4, pz: -4.0, bend: 25, hunch: 9, faceUp: -18, wEl: -8 };
  const bounce = handTo(A_B, { ...A_HOME, ...bounceBody }, 'R', () => add(strikeHand(-8), [-2.5, 0, 5.5]));
  const bounceQ: Partial<Bones> = { ...bounceBody, rhIn: 0, rhx: bounce.rhx, rhy: bounce.rhy, rhz: bounce.rhz };
  // THE WIND-DOWN, BIG: he straightens slowly from it, the hammer swung back up onto his shoulder, his fist back to his hip
  const rise: Partial<Bones> = { px: 1.2, pz: -1.6, bend: 10, twist: 2, hunch: 8, faceUp: -12, rhIn: 0, rhx: 9, rhy: -1.5, rhz: -8, re: 14, wAz: -40, wEl: 20, wRoll: 0, lhIn: 0, lhx: 3.0, lhy: 1.0, lhz: -16.5, le: 60 };
  // (every key is the loop's first frame with its own numbers: the blow begins and ends as the loop begins)
  return [
    { f: 0, q: {} },
    { f: 6, q: { pz: (S.pz ?? 0) - 1.6, bend: 6 }, e: 'io' },
    { f: A_BLOW.top, q: up, e: 'io' },
    { f: A_BLOW.held, q: upHeld, e: 'out' },
    { f: A_BLOW.lands, q: downQ, e: 'snap' },
    { f: A_BLOW.off, q: heldQ, e: 'lin' },
    { f: 35, q: bounceQ, e: 'out' },
    { f: 52, q: rise, e: 'io' },
    { f: 66, q: { pz: (S.pz ?? 0) - 0.9, bend: 1 }, e: 'io' },
    { f: A_BLOW.long, q: {}, e: 'io' },
  ];
})();

function armourerPose(bonesOf: (f: number) => Partial<Bones>, f: number, sparks: number): ArmourerPose {
  const bones = bonesOf(f);
  // (his beard follows: flung up as his head drops, left behind as it rises, and stirred by his breath)
  const drop = headZ(A_B, bonesOf(f - 2)) - headZ(A_B, bones);
  return { bones, sparks, beard: [0.5 * wave(f, A_IDLE, 2, 1.1), clamp(drop * 0.45, -0.5, 1.8)] };
}

export const ARMOURER_MOVES: TownMoves<ArmourerPose> = {
  idleLong: A_IDLE,
  idle: (f) => armourerPose((g) => armourerIdleBones(((g % A_IDLE) + A_IDLE) % A_IDLE), f, 0),
  actLong: A_BLOW.long,
  act: (f) => {
    // (the hammer's head turned to lie along his shoulder as he stands, edge-on to the anvil as he strikes: turned in the
    // first frames of the heave and the last of the wind-down, where it is behind him)
    const bones = (g: number): Partial<Bones> => keyed(A_HOME, A_KEYS, clamp(g, 0, A_BLOW.long));
    const fly = f >= A_BLOW.lands && f <= A_BLOW.lands + 16 ? Math.max(0.02, (f - A_BLOW.lands) / 16) : 0;
    return armourerPose(bones, f, fly);
  },
  loops: 3,
  beats: { heave: 6, top: A_BLOW.top, lands: A_BLOW.lands, bounce: 35, shouldered: 60 },
};

// ---------------------------------------------------------------------------------------------
// THE MYSTIC

const M_B = MYSTIC_BUILD;
const M_STANCE = mysticStance();
const M_IDLE = 120;
/** The frames of his flourish: the crystal begins to lift, blazes whole from here to here, is back on its place here. */
export const M_FLARE = { lifts: 12, blaze: 34, dies: 50, long: 78 };

function mysticIdle(f: number): MysticPose {
  const breath = wave(f, M_IDLE, 2);
  const sway = wave(f, M_IDLE, 1);
  const drift = wave(f, M_IDLE, 1, 1.4);
  const bones: Partial<Bones> = {
    ...M_STANCE,
    pz: (M_STANCE.pz ?? 0) - 0.3 - 0.3 * breath,
    py: 0.6 * sway,
    side: -1.4 * sway,
    twist: (M_STANCE.twist ?? 0) + 2.5 * sway,
    faceTurn: (M_STANCE.faceTurn ?? 0) + 7 * drift,
    faceTilt: 3 * sway,
    // (his free hand drifting over his wares, as if choosing among them)
    lhx: (M_STANCE.lhx ?? 0) + 1.6 * drift,
    lhy: (M_STANCE.lhy ?? 0) + 1.8 * wave(f, M_IDLE, 1, 0.2),
    lhz: (M_STANCE.lhz ?? 0) + 0.5 * wave(f, M_IDLE, 2, 0.7),
    rhz: (M_STANCE.rhz ?? 0) + 0.4 * breath,
  };
  return { bones, spin: (f / M_IDLE) * 2, rise: 0.9 * wave(f, M_IDLE, 3, 0.5), flare: 0, sway: [0.5 * wave(f, M_IDLE, 1, -0.9), 0.8 * wave(f, M_IDLE, 1, -0.5)] };
}

const M_KEYS: Key[] = (() => {
  const S = M_STANCE;
  // his free hand sweeps up from the wares, over the crystal and round it; his head goes back from its light
  const reach: Partial<Bones> = { twist: -10, bend: -2, faceTurn: -18, faceUp: 4, lhIn: 0, lhx: 9.5, lhy: -12.5, lhz: -5.5, le: 30, rhz: (S.rhz ?? 0) + 1.2 };
  const over: Partial<Bones> = { twist: -16, bend: -5, pz: 0.5, faceTurn: -24, faceUp: 10, lhIn: 0, lhx: 6.5, lhy: -15.5, lhz: 3.5, le: 44, rhz: (S.rhz ?? 0) + 2.4, rhy: (S.rhy ?? 0) - 1.2 };
  const open: Partial<Bones> = { twist: -6, bend: -7, pz: 0.8, faceTurn: -14, faceUp: 16, lhIn: 0, lhx: 5.5, lhy: 3.5, lhz: 1.5, le: 62, rhz: (S.rhz ?? 0) + 3.4, rhy: (S.rhy ?? 0) - 2.2, re: 30 };
  const settle: Partial<Bones> = { twist: 2, bend: 1, faceTurn: 2, faceUp: -2, lhIn: 0, lhx: 8.5, lhy: -0.5, lhz: -11.5, le: 30, rhz: (S.rhz ?? 0) + 0.8 };
  return [
    { f: 0, q: {} },
    { f: 12, q: reach, e: 'io' },
    { f: 24, q: over, e: 'io' },
    { f: 36, q: open, e: 'out' },
    { f: 50, q: { ...open, faceUp: 13, pz: 0.6 }, e: 'io' },
    { f: 66, q: settle, e: 'io' },
    { f: M_FLARE.long, q: {}, e: 'io' },
  ];
})();

function mysticAct(f: number): MysticPose {
  const g = clamp(f, 0, M_FLARE.long);
  const home = mysticIdle(0);
  const bones = keyed(home.bones, M_KEYS, g);
  // (the crystal: lifts off his palm as the hand passes over it, spins up, blazes whole, and comes down as it dies; it is
  // back at frame 0's place and turn at the end: three whole turns more than the loop makes in the time)
  const up = smooth((g - M_FLARE.lifts) / 18) * (1 - smooth((g - M_FLARE.dies) / 20));
  const flare = smooth((g - 22) / (M_FLARE.blaze - 22)) * (1 - smooth((g - M_FLARE.dies) / 14));
  const u = g / M_FLARE.long;
  const spin = 3 * (u * u * (3 - 2 * u));
  // (his robe and the end of his turban blown out from it as it blazes)
  const [sx, sy] = home.sway ?? [0, 0];
  return { bones, spin, rise: 8.5 * up + (home.rise ?? 0) * (1 - up), flare, sway: [sx - 2.2 * flare, sy + 2.8 * flare] };
}

export const MYSTIC_MOVES: TownMoves<MysticPose> = {
  idleLong: M_IDLE,
  idle: (f) => mysticIdle(((f % M_IDLE) + M_IDLE) % M_IDLE),
  actLong: M_FLARE.long,
  act: mysticAct,
  loops: 3,
  beats: { lifts: M_FLARE.lifts, blaze: M_FLARE.blaze, dies: M_FLARE.dies },
};

// ---------------------------------------------------------------------------------------------
// THE WORDSMITH: as he has moved since 8 Oct (art/smith3.ts), at thirty a second

const W_IDLE = Math.round(3.6 * TFPS);
const W_ACT = Math.round(3 * TFPS);

function wordsmithAt(keys: typeof SMITH_MOVES.idle, f: number, wind: number): WordsmithPose {
  const t = f / TFPS;
  const q = bonesAt(keys, SMITH_STANCE, t);
  // (his skirts, his beard and his mantle hang back from how he has moved in the last tenth of a second)
  const before = solve(SMITH_BODY, bonesAt(keys, SMITH_STANCE, Math.max(0, t - 0.1)));
  const now = solve(SMITH_BODY, q);
  const dx = (before.neck[0] - now.neck[0]) * 0.8;
  const dy = (before.neck[1] - now.neck[1]) * 0.8;
  return { bones: q, heat: q.draw, wind, prop: q.prop, pt: q.pt, sway: [clamp(dx, -3, 3), clamp(dy, -3, 3)] };
}

export const WORDSMITH_MOVES: TownMoves<WordsmithPose> = {
  idleLong: W_IDLE,
  idle: (f) => wordsmithAt(SMITH_MOVES.idle, ((f % W_IDLE) + W_IDLE) % W_IDLE, (((f % W_IDLE) + W_IDLE) % W_IDLE) / W_IDLE),
  actLong: W_ACT,
  act: (f) => wordsmithAt(SMITH_MOVES.act, clamp(f, 0, W_ACT), (clamp(f, 0, W_ACT) / W_ACT) % 1),
  loops: 3,
  // (as art/ring3.ts and the sound chat's runes have them: his hands up, the first stroke, gathered, driven into the slab)
  beats: { up: 12, writes: 19, gathered: 58, lands: 64 },
};

// ---------------------------------------------------------------------------------------------
// THE STRANGER

const S_B = STRANGER_BUILD;
const S_STANCE = strangerStance();
const S_IDLE = 150;
/** The frames of his toss: the thumb flicks here, the coin is caught here; all of it over here. */
export const S_TOSS = { out: 12, flick: 16, caught: 46, long: 66 };

function strangerIdle(f: number, to: number | null = null): StrangerPose {
  const breath = wave(f, S_IDLE, 2);
  // (his eyes: to one side, wait, back, to the other, wait, back; his head goes a little with them)
  const u = f / S_IDLE;
  const look = to !== null ? to : u < 0.1 ? 0 : u < 0.4 ? -1 : u < 0.5 ? 0 : u < 0.8 ? 1 : 0;
  const head = to !== null ? to : -smooth((u - 0.08) / 0.06) * (1 - smooth((u - 0.38) / 0.06)) + smooth((u - 0.48) / 0.06) * (1 - smooth((u - 0.78) / 0.06));
  const bones: Partial<Bones> = {
    ...S_STANCE,
    pz: (S_STANCE.pz ?? 0) - 0.25 - 0.25 * breath,
    hunch: (S_STANCE.hunch ?? 0) + 1.2 * breath,
    faceTurn: (S_STANCE.faceTurn ?? 0) + 9 * head,
    // (a finger tapping on his arm: the upper hand lifts a hair, four times)
    lhz: (S_STANCE.lhz ?? 0) + 0.25 * Math.max(0, wave(f, S_IDLE, 4)),
  };
  return { bones, look, coin: null, sway: 0.5 * wave(f, S_IDLE, 1, 0.8) };
}

const S_KEYS: Key[] = (() => {
  const S = S_STANCE;
  // his upper hand, the left, comes out from his folded arms: well out before him and to his left, which is across the
  // picture from him, so that the toss is seen clear of him
  const out = handTo(S_B, { ...S, faceUp: -20, faceTurn: 14 }, 'L', (s) => add(s.ribs, add(mul(s.chest[0], S_B.ribDeep + 10.5), add(mul(s.chest[1], 9.5), mul(s.chest[2], S_B.chest * 0.2)))));
  const outQ: Partial<Bones> = { faceUp: -20, faceTurn: 14, lhIn: 0, lhx: out.lhx, lhy: out.lhy, lhz: out.lhz, le: 14 };
  const dip: Partial<Bones> = { ...outQ, lhz: (out.lhz ?? 0) - 2.6, faceUp: -24 };
  const flick: Partial<Bones> = { ...outQ, lhz: (out.lhz ?? 0) + 3.2, faceUp: -4 };
  const watch: Partial<Bones> = { ...outQ, lhz: (out.lhz ?? 0) + 0.6, faceUp: 16, hunch: 3, bend: 6 };
  const snatch: Partial<Bones> = { ...outQ, lhz: (out.lhz ?? 0) + 5.6, lhx: (out.lhx ?? 0) + 1.0, faceUp: 0, le: 30 };
  const closed: Partial<Bones> = { ...outQ, lhz: (out.lhz ?? 0) - 1.4, faceUp: -18 };
  return [
    { f: 0, q: {} },
    { f: S_TOSS.out - 2, q: outQ, e: 'io' },
    { f: S_TOSS.out + 2, q: dip, e: 'io' },
    { f: S_TOSS.flick, q: flick, e: 'snap' },
    { f: 30, q: watch, e: 'out' },
    { f: S_TOSS.caught - 2, q: watch, e: 'lin' },
    { f: S_TOSS.caught, q: snatch, e: 'snap' },
    { f: S_TOSS.caught + 5, q: closed, e: 'out' },
    { f: S_TOSS.long, q: {}, e: 'io' },
  ];
})();

function strangerAct(f: number): StrangerPose {
  const g = clamp(f, 0, S_TOSS.long);
  const home = strangerIdle(0);
  const tossAt = (k: number): Partial<Bones> => keyed(home.bones, S_KEYS, k);
  const bones = tossAt(g);
  let coin: StrangerPose['coin'] = null;
  if (g > S_TOSS.flick && g < S_TOSS.caught) {
    // (it leaves his thumb, goes up as high as his hood and a little over, turning over five times, and comes down into
    // his hand: where his fist is at the flick, and where it is at the catch)
    const u = (g - S_TOSS.flick) / (S_TOSS.caught - S_TOSS.flick);
    const a = solve(S_B, { ...standing(S_B), ...tossAt(S_TOSS.flick) } as Posed).handL;
    const b = solve(S_B, { ...standing(S_B), ...tossAt(S_TOSS.caught) } as Posed).handL;
    coin = { at: [a[0] + (b[0] - a[0]) * u + 0.6, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u + 2.4 + 34 * 4 * u * (1 - u)], turn: u * 6 };
  }
  return { bones, look: 0, coin, sway: home.sway };
}

export const STRANGER_MOVES: TownMoves<StrangerPose> = {
  idleLong: S_IDLE,
  idle: (f) => strangerIdle(((f % S_IDLE) + S_IDLE) % S_IDLE),
  actLong: S_TOSS.long,
  act: strangerAct,
  loops: 2,
  beats: { flick: S_TOSS.flick, caught: S_TOSS.caught },
};

/** The stranger's loop with his eyes held on whoever has come up to him: -1 to his right, 1 to his left. */
export const strangerWatching = (f: number, to: -1 | 1): StrangerPose => strangerIdle(((f % S_IDLE) + S_IDLE) % S_IDLE, to);
