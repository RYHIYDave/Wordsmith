// THE BRAWLER'S FALL, WHEN HIS LIFE RUNS OUT (the art chat, 28 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His word, 28 Oct, 00:50: “And work on the brawler if you run out of stuff for the tinkerer”; of the heroes, 6 Oct, 00:31:
// “Proud and daring or a roguish charm.”, and 00:32: “I want things to have weight. That's very important”. His art
// rulebook: deaths are true to what died, and big things die heavy (Hits, blood and deaths 5); every animation as big,
// wild, kinetic and weighty as it can be (Animations 1).
//
// SO, AS A BOXER GOES DOWN, AND NO FURTHER THAN HIS KNEES. The last blow snaps his head round and back, a little blood off
// his mouth, his body thrown back; he gives ground, two staggering steps, his arms hanging; looks up at it again, and
// throws one more: a great wild haymaker, wound up from behind his shoulder, that hits nothing; it carries him round, and
// his knees go, slowly and then all at once, and he comes down hard on both of them, the floor's dust bursting out and his
// long coat slapping down round him; he sways; and he drags his fists back up into his guard, on his knees, his chin up
// (come on); then they sink, and his head drops onto his chest. He does not lie down.
//   His feet keep their hold on the floor (Movement 8): each steps back, lifted and set down; and as his knees go his toes
// stay where they are, his heels rising off the floor and his feet tipping up onto their toes under him, as a man's do
// when he drops to his knees.

import { solve } from '../art/skeleton';
import type { Bones, Key3, Motion, Posed, V3 } from '../art/skeleton';
import { BRAWLER_B, FR, GUARD } from './brawler_moves';
import type { BrawlerMove } from './brawler_moves';
import { steadied } from './brawler_punches';
import { drawBrawlerAt } from './brawler_moves';
import { DUST, dot, line, turned } from './brawler_fx';
import { CYAN } from '../art/kit';
import type { GameView } from '../art/skin';
import type { Drawn } from './sculpt';

const D = Math.PI / 180;
const B = BRAWLER_B;

/** His fall through time, in frames (30 a second). */
export const FALL = {
  /** The blow lands (he stands in his guard till then); his head is snapped round by `snapped`: a flash, as a blow is. */
  hit: 3,
  snapped: 5,
  /** His right foot back, then his left (lifted to set down). */
  stepR: [6, 12] as [number, number],
  stepL: [12, 18] as [number, number],
  /** The haymaker: wound up, and swung through to where it misses. */
  wound: 30,
  miss: 40,
  /** His knees going, from his heels lifting to his knees on the floor: slowly, and then all at once. */
  buckle: 42,
  knees: 52,
  /** His fists back up in his guard; and gone. */
  guard: 70,
  gone: 83,
  end: 95,
};

/** How high his knee is over the floor as he kneels on it (its middle: his shin, round it, just clear of the floor). */
const KNEE_Z = 3.6;
/** How far his feet tip up onto their toes as he kneels (degrees, toes down). */
const TIPPED = 70;

/** Where each foot is after he has staggered back (its ankle, on the floor's own measure), and the way it is turned. */
const R1 = { x: -11, y: -5.6, turn: -10 };
const L1 = { x: -11, y: 5.6, turn: 10 };
/** Where his ankles stand in his guard. */
const R0 = { x: GUARD.rfx, y: GUARD.rfy - B.stance, turn: GUARD.rft };
const L0 = { x: GUARD.lfx, y: GUARD.lfy + B.stance, turn: GUARD.lft };

/** A foot's toe from its ankle, tipped `p` and turned `turn` (as art/skeleton.ts legOf has it). */
function toeOff(p: number, turn: number): V3 {
  const x0 = B.ball * Math.cos(p * D) - B.ankle * Math.sin(p * D);
  const z0 = -B.ball * Math.sin(p * D) - B.ankle * Math.cos(p * D);
  return [x0 * Math.cos(turn * D), x0 * Math.sin(turn * D), z0];
}
/** Where a foot's toe is, planted flat at `a`. */
function toeOf(a: { x: number; y: number; turn: number }): V3 {
  const o = toeOff(0, a.turn);
  return [a.x + o[0], a.y + o[1], B.ankle + o[2]];
}
const TOE_R = toeOf(R1);
const TOE_L = toeOf(L1);

const ease = (u: number): number => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * (3 - 2 * c);
};

/** His body (all but his legs) at the moment he lands on his knees, but for how high: his hips over his knees. */
const KNEELING: Partial<Bones> = { px: 0, yaw: 0, pitch: 5, roll: 0, twist: 4, bend: 9, side: 0, faceTurn: -10, faceUp: -18, faceTilt: 0 };

/**
 * A leg kneeling: its toe at `toe`, the foot tipped `p`, its knee at KNEE_Z, its hip at `hip`: the way the foot turns (its
 * shin lies along it) that puts the knee a thigh's length from the hip, and the knee's way (the pole the bones bend to).
 * Of the two ways that does it, the one nearer straight ahead.
 */
function kneelLeg(hip: V3, toe: V3, p: number): { turn: number; ankle: V3; knee: V3 } | null {
  const tz = toeOff(p, 0)[2];
  const az = toe[2] - tz;
  const run = Math.sqrt(Math.max(0, B.shank ** 2 - (az - KNEE_Z) ** 2));
  const at = (turn: number): { ankle: V3; knee: V3 } => {
    const o = toeOff(p, turn);
    const ankle: V3 = [toe[0] - o[0], toe[1] - o[1], az];
    return { ankle, knee: [ankle[0] + run * Math.cos(turn * D), ankle[1] + run * Math.sin(turn * D), KNEE_Z] };
  };
  const miss = (turn: number): number => {
    const k = at(turn).knee;
    return Math.hypot(k[0] - hip[0], k[1] - hip[1], k[2] - hip[2]) - B.thigh;
  };
  let best: number | null = null;
  for (let g = -60; g < 60; g += 1) {
    if (miss(g) * miss(g + 1) > 0) continue;
    let lo = g;
    let hi = g + 1;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (miss(lo) * miss(mid) <= 0) hi = mid;
      else lo = mid;
    }
    const r = (lo + hi) / 2;
    if (best === null || Math.abs(r) < Math.abs(best)) best = r;
  }
  if (best === null) return null;
  return { turn: best, ...at(best) };
}
/** The way a knee is to bend (as art/skeleton.ts heading has it): from the line of hip and ankle, toward where the knee is. */
function poleOf(hip: V3, ankle: V3, knee: V3): { az: number; el: number } {
  const d: V3 = [ankle[0] - hip[0], ankle[1] - hip[1], ankle[2] - hip[2]];
  const n = Math.hypot(...d);
  const u: V3 = [d[0] / n, d[1] / n, d[2] / n];
  const k: V3 = [knee[0] - hip[0], knee[1] - hip[1], knee[2] - hip[2]];
  const a = k[0] * u[0] + k[1] * u[1] + k[2] * u[2];
  const o: V3 = [k[0] - a * u[0], k[1] - a * u[1], k[2] - a * u[2]];
  return { az: Math.atan2(o[1], o[0]) / D, el: Math.atan2(o[2], Math.hypot(o[0], o[1])) / D };
}

/**
 * HOW HE KNEELS: how low his hips come (so that, his toes where they stood and his feet tipped up onto them, his shins lie
 * along the way his feet point and his knees are on the floor), each foot's turn, and each knee's way.
 */
export const KNEEL = (() => {
  let best: { pz: number; r: NonNullable<ReturnType<typeof kneelLeg>>; l: NonNullable<ReturnType<typeof kneelLeg>>; hipR: V3; hipL: V3 } | null = null;
  let bestErr = Infinity;
  for (let pz = -26; pz <= -10; pz += 0.05) {
    const s = solve(B, { ...GUARD, ...KNEELING, pz } as Posed);
    const r = kneelLeg(s.hipR, TOE_R, TIPPED);
    const l = kneelLeg(s.hipL, TOE_L, TIPPED);
    if (!r || !l) continue;
    // (his knees a little turned out, as a big man kneels: his feet turned the same, each out a few degrees)
    const err = (r.turn + 4) ** 2 + (l.turn - 4) ** 2;
    if (err < bestErr) {
      bestErr = err;
      best = { pz, r, l, hipR: s.hipR, hipL: s.hipL };
    }
  }
  if (!best) throw new Error('he cannot kneel there');
  return {
    pz: best.pz,
    r: { ...best.r, pole: poleOf(best.hipR, best.r.ankle, best.r.knee) },
    l: { ...best.l, pole: poleOf(best.hipL, best.l.ankle, best.l.knee) },
  };
})();

/** A leg's numbers of a pose (art/skeleton.ts Bones) for its ankle at `a`, tipped `p` and turned `turn`, its knee bending the way (az, el). */
function legBones(right: boolean, a: V3, p: number, turn: number, az: number, el: number): Partial<Bones> {
  return right
    ? { rfx: a[0], rfy: a[1] + B.stance, rfz: a[2] - B.ankle, rfp: p, rft: turn, rk: az, rkUp: el }
    : { lfx: a[0], lfy: a[1] - B.stance, lfz: a[2] - B.ankle, lfp: p, lft: turn, lk: az, lkUp: el };
}
/**
 * A STEP BACK: the foot from `a` to `b` over frames `span`, lifted `high` at its height: up off the floor before it goes,
 * and set down where it goes before it stops (Movement 8: a foot on the floor stays where it is).
 */
function stepped(a: { x: number; y: number; turn: number }, b: { x: number; y: number; turn: number }, span: [number, number], high: number, f: number): { at: V3; turn: number } {
  const u = Math.max(0, Math.min(1, (f - span[0]) / (span[1] - span[0])));
  const e = ease(u);
  const g = ease((u - 0.12) / 0.76);
  return { at: [a.x + (b.x - a.x) * g, a.y + (b.y - a.y) * g, B.ankle + high * 4 * e * (1 - e)], turn: a.turn + (b.turn - a.turn) * g };
}
/**
 * HIS FEET AND KNEES at frame `f`: stepping back, one and the other; then planted flat; then, as his knees go, his toes kept
 * where they are and his feet tipped up onto them, his knees coming down to the floor; and kneeling.
 */
function legsAt(f: number): Partial<Bones> {
  const out: Partial<Bones> = {};
  for (const right of [true, false]) {
    const g0 = right ? R0 : L0;
    const g1 = right ? R1 : L1;
    const span = right ? FALL.stepR : FALL.stepL;
    const k = right ? KNEEL.r : KNEEL.l;
    const pole0 = right ? { az: GUARD.rk, el: 0 } : { az: GUARD.lk, el: 0 };
    if (f <= FALL.buckle) {
      const s = stepped(g0, g1, span, right ? 3.0 : 3.6, f);
      Object.assign(out, legBones(right, s.at, 0, s.turn, pole0.az, pole0.el));
      continue;
    }
    // (his heels rising and his feet tipping onto their toes: slowly, and then all at once, as his knees go)
    const u = Math.min(1, (f - FALL.buckle) / (FALL.knees - FALL.buckle));
    const g = u * u;
    const p = TIPPED * g;
    const turn = g1.turn + (k.turn - g1.turn) * g;
    const toe = right ? TOE_R : TOE_L;
    const o = toeOff(p, turn);
    const a: V3 = [toe[0] - o[0], toe[1] - o[1], toe[2] - o[2]];
    Object.assign(out, legBones(right, a, p, turn, pole0.az + (k.pole.az - pole0.az) * ease(u), pole0.el + (k.pole.el - pole0.el) * ease(u)));
  }
  return out;
}

/** His fists hanging at his sides (from each shoulder, along his chest), and up in his guard. */
const HANG_L: Partial<Bones> = { lhIn: 0, lhx: 1, lhy: 3, lhz: -18.5, le: 8 };
const HANG_R: Partial<Bones> = { rhIn: 0, rhx: 1, rhy: -3, rhz: -18.5, re: 8 };
const UP: Partial<Bones> = { lhIn: 0, lhx: GUARD.lhx, lhy: GUARD.lhy, lhz: GUARD.lhz, le: GUARD.le, rhIn: 0, rhx: GUARD.rhx, rhy: GUARD.rhy, rhz: GUARD.rhz, re: GUARD.re };
const G = GUARD.pz;
/** The blow's own pose: his head snapped round and back, his body thrown back, his fists flung loose. */
const SNAPPED: Partial<Bones> = { px: -4, pz: G - 1.2, pitch: -13, bend: -19, twist: -20, roll: 5, faceTurn: -70, faceUp: 28, faceTilt: -22, lhx: 7, lhy: 4, lhz: -8, le: -45, rhx: 4, rhy: -6, rhz: -10, re: -50 };

/** His body's poses through his fall, from the blow on (all but his legs, which are his feet's own: legsAt): frame, pose. */
function bodyKeys(): [number, Partial<Bones>][] {
  const K = { ...KNEELING, pz: KNEEL.pz };
  return [
    [FALL.snapped, SNAPPED],
    // HE GIVES GROUND: two staggering steps back, his arms hanging, his head lolling
    [9, { px: -6, pz: G - 1.6, pitch: -5, bend: -8, twist: -10, roll: -2, faceTurn: -45, faceUp: 10, faceTilt: -6, lhx: 2, lhy: 3, lhz: -16, le: 5, rhx: 1, rhy: -3.5, rhz: -17, re: 5 }],
    [13, { px: -8.5, pz: G - 1.2, pitch: -1, bend: -1, twist: 2, roll: -4, faceTurn: -22, faceUp: -8, faceTilt: 12, ...HANG_L, ...HANG_R }],
    [18, { px: -10, pz: G - 1.8, pitch: 3, bend: 5, twist: -2, roll: 3, faceTurn: -12, faceUp: -12, faceTilt: -8, ...HANG_L, ...HANG_R }],
    // ... and looks up at it again
    [23, { px: -10, pz: G - 1.2, pitch: 1, bend: 2, twist: -6, roll: 0, faceTurn: -26, faceUp: 2, faceTilt: 0, ...HANG_L, ...HANG_R }],
    // ONE MORE: a great wild haymaker, wound up from behind his shoulder ...
    [FALL.wound, { px: -11, pz: G - 1.6, yaw: -12, twist: -30, pitch: -3, bend: -4, roll: -2, faceTurn: -16, faceUp: 4, faceTilt: 0, lhx: 8, lhy: 2, lhz: -6, le: -10, rhx: -7, rhy: -9, rhz: 1, re: 70 }],
    [35, { px: -9.5, pz: G - 2, yaw: -2, twist: 0, pitch: 3, bend: 4, roll: 0, faceTurn: -10, faceUp: 2, lhx: 5, lhy: 3, lhz: -10, le: -5, rhx: 13, rhy: -11, rhz: 2, re: 75 }],
    // ... that hits nothing, and carries him round
    [FALL.miss, { px: -7, pz: G - 3, yaw: 12, twist: 34, pitch: 9, bend: 14, roll: 3, faceTurn: 10, faceUp: -4, lhx: 0, lhy: 5, lhz: -15, le: 5, rhx: 11, rhy: 11, rhz: -2, re: 40 }],
    // HIS KNEES GO: slowly, and then all at once (his hips' fall is its own: hipsAt)
    [47, { px: -4, pz: G - 7, yaw: 5, twist: 14, pitch: 7, bend: 7, roll: 1, faceTurn: -4, faceUp: -14, lhx: 1.5, lhy: 4, lhz: -16, le: 8, rhx: 5, rhy: 2, rhz: -14, re: 20 }],
    [FALL.knees, { ...K, bend: 11, faceUp: -22, lhx: 3, lhy: 4, lhz: -13, le: 15, rhx: 3, rhy: -4, rhz: -13, re: 15 }],
    // ... down hard on them: the weight of him pressing him lower, his head bobbing down, his arms dropping
    [55, { ...K, bend: 17, pitch: 8, hunch: 10, faceUp: -34, lhx: 1.5, lhy: 3.5, lhz: -18.5, le: 10, rhx: 1.5, rhy: -3.5, rhz: -18.5, re: 10 }],
    [59, { ...K, bend: 11, pitch: 5, hunch: 6, faceUp: -20, roll: -2, ...HANG_L, ...HANG_R }],
    // HE DRAGS HIS FISTS BACK UP into his guard, on his knees, his chin up
    [65, { ...K, bend: 6, pitch: 2, hunch: 0, faceUp: -6, faceTurn: -18, roll: 2, lhx: 6, lhy: 1, lhz: -10, le: -10, rhx: 5, rhy: -1, rhz: -11, re: -10 }],
    [FALL.guard, { ...K, bend: 1, pitch: 0, hunch: 0, roll: -1, faceUp: 7, faceTurn: -24, ...UP }],
    [76, { ...K, bend: 3, pitch: 1, hunch: 0, roll: 2, faceUp: 4, faceTurn: -22, ...UP, lhz: GUARD.lhz - 1.5, rhz: GUARD.rhz - 1.5 }],
    // ... AND THEY SINK, and his head drops onto his chest
    [FALL.gone, { ...K, bend: 15, pitch: 6, hunch: 18, shrug: 0.4, roll: 0, faceUp: -40, faceTurn: -14, faceTilt: 10, ...HANG_L, ...HANG_R }],
    [87, { ...K, bend: 16, pitch: 6, hunch: 19, shrug: 0.4, roll: 0, faceUp: -46, faceTurn: -14, faceTilt: 11, ...HANG_L, ...HANG_R }],
    [FALL.end, { ...K, bend: 16, pitch: 6, hunch: 19, shrug: 0.4, roll: 0, faceUp: -46, faceTurn: -14, faceTilt: 11, ...HANG_L, ...HANG_R }],
  ];
}

/** The numbers of his body that go smoothly from pose to pose. */
const BODY = ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'hunch', 'shrug', 'faceTurn', 'faceUp', 'faceTilt', 'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'le', 're'] as const;
type Field = (typeof BODY)[number];
/**
 * THROUGH THE POSES SMOOTHLY (a monotone cubic through them, Fritsch and Carlson): each number goes on through a pose at the
 * pace it has there, slowing to a stop only where it turns back (so that nothing of him stops dead and goes on); and never
 * beyond where the poses either side have it.
 */
export function through(xs: number[], ys: number[], x: number): number {
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  const d = xs.slice(1).map((_, i) => (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  const m = xs.map((_, i) => {
    if (i === 0 || i === n - 1) return 0;
    if (d[i - 1] * d[i] <= 0) return 0;
    const w1 = 2 * (xs[i + 1] - xs[i]) + (xs[i] - xs[i - 1]);
    const w2 = (xs[i + 1] - xs[i]) + 2 * (xs[i] - xs[i - 1]);
    return (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
  });
  let i = 0;
  while (x > xs[i + 1]) i++;
  const h = xs[i + 1] - xs[i];
  const t = (x - xs[i]) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
}

/** His body at frame `f` (all but his legs). */
function bodyAt(f: number): Partial<Bones> {
  const keys = bodyKeys();
  const full = (q: Partial<Bones>): Record<Field, number> => {
    const o = {} as Record<Field, number>;
    for (const k of BODY) o[k] = ((q as Record<string, number>)[k] ?? (GUARD as unknown as Record<string, number>)[k] ?? 0) as number;
    return o;
  };
  const out: Partial<Bones> = { lhIn: 0, rhIn: 0 };
  const put = (k: Field, v: number): void => {
    (out as Record<string, number>)[k] = v;
  };
  // (in his guard till the blow lands; then, in a flash, snapped round: it lands at its fastest and slows)
  if (f <= FALL.snapped) {
    const g = full({});
    const s = full(SNAPPED);
    const u = Math.max(0, (f - FALL.hit) / (FALL.snapped - FALL.hit));
    const k = 1 - (1 - u) * (1 - u);
    for (const fd of BODY) put(fd, g[fd] + (s[fd] - g[fd]) * k);
    return out;
  }
  const xs = keys.map(([at]) => at);
  const whole = keys.map(([, q]) => full(q));
  for (const fd of BODY) put(fd, through(xs, whole.map((q) => q[fd]), f));
  // HIS HIPS GO DOWN ONTO HIS KNEES all at once: gathering speed till his knees hit the floor, where they stop dead
  if (f > FALL.miss && f < FALL.knees) {
    const a = full(keys.find(([at]) => at === FALL.miss)![1]);
    const u = (f - FALL.miss) / (FALL.knees - FALL.miss);
    const g = Math.pow(u, 2.4);
    put('pz', a.pz + (KNEEL.pz - a.pz) * g);
    put('px', a.px + ((KNEELING.px ?? 0) - a.px) * (u * u));
  }
  return out;
}

/** His fall as a move: a key for every sixtieth of a second, his body from its poses and his legs from where his feet are. */
export function brawlerFall(): BrawlerMove {
  const long = FALL.end * FR;
  const n = Math.round(long * 60);
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = Math.min(long, i / 60);
    const pose = { ...bodyAt(t * 30), ...legsAt(t * 30) };
    keys.push({ at: t, pose, ease: 'lin' });
  }
  // (his elbows steadied: where a hand comes up past its shoulder, or in to his body, each goes on from where it was)
  const jolt: [number, number] = [(FALL.hit - 1) * FR, (FALL.snapped + 1) * FR];
  const motion: Motion = { keys: steadied(keys, 60, [jolt]) };
  return {
    name: 'His fall: down on his knees',
    motion,
    long,
    loops: false,
    jolt,
    kneels: [FALL.miss * FR, long],
  };
}

// ---------------------------------------------------------------------------------------------
// WHAT FLIES OFF HIM AS HE GOES DOWN (his rulebook's Hits, blood and deaths: a little blood, a splash and then gone; what
// flies off a hit is the one hit's own; Animations 1, big and weighty): the blow's flash at his jaw and a little blood off
// his mouth, falling and drying away on the floor; a scuff of dust as each foot is set down; the streak of his haymaker,
// his own cyan, the way it went; and as his knees hit the floor, its dust bursting out round him and grit flung up.

const hash = (i: number): number => {
  const x = Math.sin(i * 91.7 + 17.3) * 43758.5453;
  return x - Math.floor(x);
};
/** How fast what is flung falls (his own measure, a frame, a frame). */
const DROP = 0.9;
/** His blood: darker than the game's, clear of the enemy's pink (as the cultists' is, dev/demon_fx.ts STUFF). */
const BLOOD = ['#4a0c24', '#8a1020', '#b8202c'];
/** A drop flung from `p` at `v` (a frame), `s` frames on: where it is, and whether it has come down on the floor (and how long ago). */
function flight(p: V3, v: V3, s: number): { at: V3; down: number } {
  const land = (v[2] + Math.sqrt(v[2] * v[2] + 2 * DROP * p[2])) / DROP;
  const u = Math.min(s, land);
  return { at: [p[0] + v[0] * u, p[1] + v[1] * u, Math.max(0, p[2] + v[2] * u - (DROP * u * u) / 2)], down: s - land };
}
/**
 * DUST BILLOWING OFF THE FLOOR round `c`, `s` frames since it was knocked up: puffs, each a round little cloud lit on top,
 * rolling out along the floor `wide` and rising a little, growing, then shrinking away to nothing in `life` frames; laid
 * round him, never over him.
 */
export function billow(d: Drawn, c: V3, s: number, wide: number, life: number, n: number, seed: number, turn: number): void {
  if (s < 0 || s > life) return;
  const u = s / life;
  const go = 1 - (1 - u) * (1 - u);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + hash(seed + i) * 0.8;
    const r = (0.55 + 0.45 * hash(seed * 7 + i)) * wide * go;
    const z = 0.4 + (1.5 + 4 * hash(seed + i * 5)) * go;
    const [x, y] = d.st.at(turned([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, z], turn));
    // (each grows as it rolls out, and goes as it thins: the later ones first)
    const rad = (1.8 + 3.4 * go * (0.7 + 0.6 * hash(seed * 3 + i))) * (1 - Math.pow(u, 2.5)) * (hash(seed * 11 + i) < 1.15 - u ? 1 : 0);
    if (rad < 1) continue;
    for (let yy = Math.floor(y - rad); yy <= Math.ceil(y + rad); yy++) {
      for (let xx = Math.floor(x - rad * 1.3); xx <= Math.ceil(x + rad * 1.3); xx++) {
        const e = Math.hypot((xx - x) / 1.3, yy - y) / rad;
        if (e > 1) continue;
        if (!d.px.inside(xx, yy) || xx < 2 || yy < 2 || xx > d.px.w - 3 || yy > d.px.h - 3) continue;
        if (d.stuff[yy * d.px.w + xx] >= 0) continue;
        const lit = yy - y < -rad * 0.35 ? 1 : yy - y > rad * 0.45 ? 2 : 0;
        d.px.set(xx, yy, DUST[lit]);
      }
    }
  }
}

/** Him at a moment of his fall, with what flies off him (him turned `turn`). */
export function drawFallAt(view: GameView, m: BrawlerMove, t: number, turn = 0): Drawn {
  const d = drawBrawlerAt(view, m, t, turn);
  drawFallBits(d, m, t, turn);
  return d;
}
/** What flies off him at a moment of his fall, drawn on `d`. */
export function drawFallBits(d: Drawn, m: BrawlerMove, t: number, turn = 0): void {
  const f = t * 30;
  const at = (p: V3): readonly [number, number] => d.st.at(turned(p, turn));
  const sk = (ft: number) => solve(B, { ...GUARD, ...bonesOf(m, ft) } as Posed);
  // THE BLOW: a flash at his jaw, a frame or two; and a little blood off his mouth
  const s = f - FALL.hit;
  if (s >= 0) {
    const k = sk(FALL.hit + 1);
    const R = B.headR;
    const mouth: V3 = [0, 1, 2].map((i) => k.head[i] + k.face[0][i] * R[0] * 0.9 - k.face[2][i] * R[2] * 0.45) as unknown as V3;
    if (s < 2.5) {
      const [x, y] = at(mouth);
      const long = 7 - 2 * s;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 0.4;
        const l = long * (i % 2 ? 0.55 : 1);
        line(d, x + Math.cos(a) * 2, y + Math.sin(a) * 2, x + Math.cos(a) * (2 + l), y + Math.sin(a) * (2 + l), i % 2 ? CYAN[3] : '#ffffff', true);
      }
    }
    // (flung back and away to his right, the way the blow turned his head; falling, and drying away where each lands)
    for (let i = 0; i < 5; i++) {
      const v: V3 = [-0.5 - 0.9 * hash(i + 1), -0.9 - 1.1 * hash(i + 11), 0.9 + 1.4 * hash(i + 21)];
      const fl = flight(mouth, v, s);
      const [x, y] = at(fl.at);
      if (fl.down < 0) {
        dot(d, x, y, BLOOD[2]);
        if (i % 2 === 0) dot(d, x, y - 1, BLOOD[1]);
      } else {
        const w = fl.down < 12 ? 2 : fl.down < 24 ? 1 : 0;
        for (let j = 0; j < w; j++) dot(d, x + j * 2 - 1, y, BLOOD[0]);
      }
    }
  }
  // A SCUFF OF DUST as each foot is set down, staggering back
  for (const [right, span] of [[true, FALL.stepR], [false, FALL.stepL]] as const) {
    const a = right ? R1 : L1;
    billow(d, [a.x + 3, a.y, 0], f - span[1] + 1, 6, 11, 5, right ? 31 : 47, turn);
  }
  // THE HAYMAKER'S STREAK: the way his fist has come over the last frames, his own cyan, behind him
  if (f > FALL.wound + 2 && f < FALL.miss + 1.5) {
    const path: V3[] = [];
    for (let j = 4; j >= 0; j--) path.push(turned(sk(Math.max(FALL.wound, Math.min(FALL.miss, f - j))).handR, turn));
    for (let i = 1; i < path.length; i++) {
      const [x0, y0] = d.st.at(path[i - 1]);
      const [x1, y1] = d.st.at(path[i]);
      if (Math.hypot(x1 - x0, y1 - y0) < 2.5) continue;
      line(d, x0, y0, x1, y1, i >= path.length - 2 ? '#ffffff' : CYAN[3], true);
      line(d, x0, y0 + 1, x1, y1 + 1, CYAN[2], true);
    }
  }
  // HIS KNEES HIT THE FLOOR: its dust bursting out round him, low along it, and grit flung up
  const k = f - FALL.knees;
  if (k >= 0 && k < 22) {
    const kr = KNEEL.r.knee;
    const kl = KNEEL.l.knee;
    billow(d, [kr[0], kr[1] - 2, 0], k, 15, 22, 9, 3, turn);
    billow(d, [kl[0], kl[1] + 2, 0], k, 15, 22, 9, 9, turn);
    billow(d, [-6, 0, 0], k - 1, 13, 21, 8, 15, turn);
    const u = k / 14;
    const mid: V3 = [(kr[0] + kl[0]) / 2 - 3, 0, 0];
    for (let i = 0; i < 14; i++) {
      if (u > 0.8) continue;
      const a = hash(i + 80) * Math.PI * 2;
      const out = (0.4 + 0.9 * hash(i + 90)) * (6 + 12 * u);
      const up = (1 - (2 * u - 1) ** 2) * (2 + 6 * hash(i + 100));
      const [x, y] = at([mid[0] + Math.cos(a) * out, mid[1] + Math.sin(a) * out, up]);
      dot(d, x, y, DUST[i % 3]);
    }
  }
}
/** The pose of a move at frame `f` (30 a second). */
function bonesOf(m: BrawlerMove, f: number): Partial<Bones> {
  const keys = m.motion.keys;
  const t = Math.max(0, Math.min(m.long, f * FR));
  const i = Math.min(keys.length - 1, Math.round(t * 60));
  return keys[i].pose;
}
