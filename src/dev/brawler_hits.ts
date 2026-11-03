// THE BRAWLER STRUCK: HARD, AND FROM BEHIND (the art chat, 28 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His pick, 28 Oct: “Getting hit (Recommended)” (offered as: struck hard, a boxer rocked, his guard back up; struck from
// behind, jolted, fists up), told that the game shows a hit for only a moment while the hero carries on, so each is short:
// the game's heroes each have both (art/moves3.ts reel, lurch; render/figure.ts shows `clips.reel` while a hero stands or
// walks, `clips.lurch` for a blow from behind). His rulebook: a heavy blow rocks him (Hits 3); the strike a flash, what
// follows not (Movement 9); feet grip the floor (Movement 8).
//
// STRUCK HARD: the blow snaps his head back and round, his fists flung loose; his back foot steps back to catch him and he
// sits into it, his chin tucked; his fists come straight back up by his cheeks, and he steps back in to his guard.
// STRUCK FROM BEHIND: the blow throws him forward over his lead foot, his head whipped back; he catches himself on it, his
// fists coming up, and snaps a look back over his right shoulder at whatever hit him; and steps back in to his guard.

import type { Bones, Key3, Motion, V3 } from '../art/skeleton';
import { solve } from '../art/skeleton';
import type { Posed } from '../art/skeleton';
import { BRAWLER_B, FR, GUARD, T, drawBrawlerAt } from './brawler_moves';
import type { BrawlerMove } from './brawler_moves';
import { steadied } from './brawler_punches';
import { L0, R0, billow, legBones, stepped, through } from './brawler_fall';
import { line, turned } from './brawler_fx';
import { CYAN } from '../art/kit';
import type { GameView } from '../art/skin';
import type { Drawn } from './sculpt';

const G = GUARD.pz;
const B = BRAWLER_B;

/** Each blow through time, in frames (30 a second): it lands at `hit`; he is snapped by `snapped` (a flash); back in his guard by `end`. */
export const STRUCK = {
  hit: 1,
  snapped: 3,
  /** His foot that catches him: out, and back in. */
  out: [2, 6] as [number, number],
  back: [8, 12] as [number, number],
  end: 13,
};

/** His fists up by his cheeks, his elbows tucked (as in his standing: “brings his hands up closer to his head”). */
const TIGHT: Partial<Bones> = { lhx: 7.4 * T, lhy: 0.9 * T, lhz: 4.4 * T, le: 100, rhx: 5.0 * T, rhy: -0.8 * T, rhz: 4.8 * T, re: 100 };

/** STRUCK HARD, from in front: his body's poses (all but his legs), frame and pose. */
const HARD: [number, Partial<Bones>][] = [
  // the blow: his head snapped back and round, his body thrown back, his fists flung loose
  [STRUCK.snapped, { px: GUARD.px - 4.2, pz: G - 1.2, pitch: -10, bend: -20, twist: -14, roll: 4, faceTurn: -38, faceUp: 32, faceTilt: -16, lhx: 6.5, lhy: 3.5, lhz: -5, le: -35, rhx: 4.5, rhy: -5, rhz: -7, re: -40 }],
  // he sits back into his back foot, his chin tucked, his head coming forward after his body, his fists coming up
  [6, { px: GUARD.px - 5.6, pz: G - 2.4, pitch: -3, bend: -4, twist: -4, roll: 1, faceTurn: -12, faceUp: -6, faceTilt: -3, lhx: 7, lhy: 2, lhz: -1, le: 20, rhx: 5, rhy: -2, rhz: -2, re: 20 }],
  // fists up tight by his cheeks
  [9, { px: GUARD.px - 2.6, pz: G - 1.1, pitch: 0, bend: 4, twist: 2, roll: 0, faceTurn: -4, faceUp: -2, faceTilt: 0, ...TIGHT }],
  // and back in his guard
  [STRUCK.end, {}],
];
/** STRUCK FROM BEHIND: his body's poses, frame and pose. */
const BEHIND: [number, Partial<Bones>][] = [
  // the blow: thrown forward, his head whipped back, his fists flung forward and down
  [STRUCK.snapped, { px: GUARD.px + 4.6, pz: G - 1.3, pitch: 11, bend: 21, twist: 6, roll: -2, faceTurn: 6, faceUp: 18, faceTilt: 4, lhx: 11, lhy: 2, lhz: -9, le: -20, rhx: 9, rhy: -2, rhz: -10, re: -20 }],
  // caught on his lead foot, his head nodding down, his fists coming up, his look going round
  [6, { px: GUARD.px + 6.0, pz: G - 2.6, pitch: 4, bend: 8, twist: -8, roll: 0, faceTurn: -40, faceUp: -8, faceTilt: -6, lhx: 7, lhy: 1, lhz: 0, le: 20, rhx: 5, rhy: -1, rhz: -1, re: 20 }],
  // A LOOK BACK over his right shoulder at whatever hit him, fists up tight
  [9, { px: GUARD.px + 3.0, pz: G - 1.2, pitch: 1, bend: 4, twist: -16, roll: 0, faceTurn: -75, faceUp: 2, faceTilt: -4, ...TIGHT }],
  [STRUCK.end, {}],
];

/** The numbers of his body that go smoothly from pose to pose. */
const BODY = ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'hunch', 'shrug', 'faceTurn', 'faceUp', 'faceTilt', 'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'le', 're'] as const;
type Field = (typeof BODY)[number];
const full = (q: Partial<Bones>): Record<Field, number> => {
  const o = {} as Record<Field, number>;
  for (const k of BODY) o[k] = ((q as Record<string, number>)[k] ?? (GUARD as unknown as Record<string, number>)[k] ?? 0) as number;
  return o;
};

/** His body at frame `f` of a blow: in a flash, snapped (landing at its fastest and slowing); then smoothly through its poses. */
function bodyAt(keys: [number, Partial<Bones>][], f: number): Partial<Bones> {
  const out: Partial<Bones> = { lhIn: 0, rhIn: 0 };
  const put = (k: Field, v: number): void => {
    (out as Record<string, number>)[k] = v;
  };
  if (f <= STRUCK.snapped) {
    const g = full({});
    const s = full(keys[0][1]);
    const u = Math.max(0, (f - STRUCK.hit) / (STRUCK.snapped - STRUCK.hit));
    const k = 1 - (1 - u) * (1 - u);
    for (const fd of BODY) put(fd, g[fd] + (s[fd] - g[fd]) * k);
    return out;
  }
  const xs = keys.map(([at]) => at);
  const whole = keys.map(([, q]) => full(q));
  for (const fd of BODY) put(fd, through(xs, whole.map((q) => q[fd]), f));
  return out;
}

/** How far the foot that catches him goes: back (his right) for a blow from in front, forward (his left) for one from behind. */
const CATCH = 4.0 * T;

/** His feet at frame `f`: the one that catches him lifted out and set down, then lifted back in to his guard; the other planted. */
function legsAt(behind: boolean, f: number): Partial<Bones> {
  const out: Partial<Bones> = {};
  for (const right of [true, false]) {
    const g0 = right ? R0 : L0;
    const pole = right ? GUARD.rk : GUARD.lk;
    const moves = behind ? !right : right;
    if (!moves) {
      Object.assign(out, legBones(right, [g0.x, g0.y, B.ankle], 0, g0.turn, pole, 0));
      continue;
    }
    const g1 = { ...g0, x: g0.x + (behind ? CATCH : -CATCH) };
    const s = f < STRUCK.back[0] ? stepped(g0, g1, STRUCK.out, 1.8 * T, f) : stepped(g1, g0, STRUCK.back, 1.4 * T, f);
    Object.assign(out, legBones(right, s.at, 0, s.turn, pole, 0));
  }
  return out;
}

function struck(behind: boolean): BrawlerMove {
  const long = STRUCK.end * FR;
  const n = Math.round(long * 60);
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = Math.min(long, i / 60);
    keys.push({ at: t, pose: { ...bodyAt(behind ? BEHIND : HARD, t * 30), ...legsAt(behind, t * 30) }, ease: 'lin' });
  }
  // (the blow itself a flash, not judged frame by frame: Movement 9)
  const jolt: [number, number] = [(STRUCK.hit - 1) * FR, (STRUCK.snapped + 1) * FR];
  const motion: Motion = { keys: steadied(keys, 60, [jolt]) };
  return { name: behind ? 'Struck from behind' : 'Struck hard', motion, long, loops: false, jolt };
}
/** STRUCK HARD: rocked back a step, his guard straight back up. */
export function brawlerReel(): BrawlerMove {
  return struck(false);
}
/** STRUCK FROM BEHIND: thrown forward, a look back over his shoulder, his guard up. */
export function brawlerLurch(): BrawlerMove {
  return struck(true);
}

// ---------------------------------------------------------------------------------------------
// WHERE THE BLOW LANDS, ON THE PICTURE (for a film: in the game, what flies off a hit is the blow's own): a flash, a frame or
// two, at his jaw, or between his shoulder blades; and a scuff of dust as the foot that caught him is set down.

/** Him at a moment of a blow, with its flash (him turned `turn`). */
export function drawStruckAt(view: GameView, m: BrawlerMove, t: number, turn = 0): Drawn {
  const d = drawBrawlerAt(view, m, t, turn);
  const behind = m.name === 'Struck from behind';
  const f = t * 30;
  const at = (p: V3): readonly [number, number] => d.st.at(turned(p, turn));
  const s = f - STRUCK.hit;
  if (s >= 0 && s < 2.5) {
    const k = solve(B, { ...GUARD, ...m.motion.keys[Math.min(m.motion.keys.length - 1, (STRUCK.hit + 1) * 2)].pose } as Posed);
    const R = B.headR;
    const [cf, , cu] = k.chest;
    const spot: V3 = behind
      ? [0, 1, 2].map((i) => (k.shoulderL[i] + k.shoulderR[i]) / 2 - cf[i] * 3.2 - cu[i] * 2.5) as unknown as V3
      : [0, 1, 2].map((i) => k.head[i] + k.face[0][i] * R[0] * 0.9 - k.face[2][i] * R[2] * 0.45) as unknown as V3;
    const [x, y] = at(spot);
    const long = 7 - 2 * s;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.4;
      const l = long * (i % 2 ? 0.55 : 1);
      line(d, x + Math.cos(a) * 2, y + Math.sin(a) * 2, x + Math.cos(a) * (2 + l), y + Math.sin(a) * (2 + l), i % 2 ? CYAN[3] : '#ffffff', true);
    }
  }
  const g = behind ? L0 : R0;
  billow(d, [g.x + (behind ? CATCH : -CATCH) + 3, g.y, 0], f - STRUCK.out[1] + 1, 5, 9, 4, behind ? 61 : 67, turn);
  return d;
}
