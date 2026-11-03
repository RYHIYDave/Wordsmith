// THE TINKERER STRUCK: HARD, AND FROM BEHIND (the art chat, 28 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His pick, 28 Oct: “Tinkerer getting hit (Recommended)” (offered as: struck hard and from behind, her own way), after the
// brawler's (dev/brawler_hits.ts: as short, 13 frames, the game showing a hit only a moment while a hero carries on). Her
// brief, 23 Oct: “Gleeful mad bomber (Recommended)”, “Quick and nimble (Recommended)”. His rulebook: a heavy blow rocks her
// (Hits 3); the strike a flash, what follows not (Movement 9); loose things follow (Movement 4); feet grip (Movement 8).
//
// STRUCK HARD: the blow snaps her head round and back, her ponytail whipping, her free fist flung off her hip; she skips
// back on her back foot, light, and sits into it; and comes up chin first, cocky, her fist back on her hip. The wrench
// stays on her shoulder, her fist on it.
// STRUCK FROM BEHIND: it lands on her vial rack (its glass rattling, a glint off it): thrown forward, her head whipped back,
// she catches herself on her lead foot, and throws a look back over her left shoulder (the wrench is on her right) at
// whatever hit her; and back to her stance.

import { solve } from '../art/skeleton';
import type { Bones, Key3, Motion, Posed, V3 } from '../art/skeleton';
import type { GameView } from '../art/skin';
import { CYAN } from '../art/kit';
import type { Drawn } from './sculpt';
import { FR, TINK_B, TSTANCE, drawTinkerAt } from './tinkerer_moves';
import type { TinkMove } from './tinkerer_moves';
import { billow, through } from './brawler_fall';
import { dot, line } from './brawler_fx';
import { handAt, hands, toChest } from './tinkerer_fall';

const B = TINK_B;
const S0 = TSTANCE;
const T = B.tall / 55;

/** Each blow through time, in frames (30 a second): it lands at `hit`; she is snapped by `snapped` (a flash); back in her stance by `end`. */
export const TSTRUCK = {
  hit: 1,
  snapped: 3,
  /** Her foot that catches her: out, and back in. */
  out: [2, 6] as [number, number],
  back: [8, 12] as [number, number],
  end: 13,
};

/** Her hands in her stance, from each shoulder along her chest: her left fist on her hip, her right on the wrench on her shoulder. */
const STANCE_W = { ...S0, ...hands(solve(B, S0 as Posed).handL, solve(B, S0 as Posed).handR, S0.le, S0.re) };
const L_HIP = toChest(STANCE_W, true);
const R_WRENCH = toChest(STANCE_W, false);

/** A pose of hers: her body (all but her legs and hands), each hand from its shoulder along her chest, and her elbows. */
interface Pose {
  body: Partial<Bones>;
  l: V3;
  r: V3;
  le: number;
  re: number;
}
const AT_REST: Pose = { body: {}, l: L_HIP, r: R_WRENCH, le: S0.le, re: S0.re };

/** STRUCK HARD: her poses, frame and pose. */
const HARD: [number, Pose][] = [
  // the blow: her head snapped round and back, her body thrown back, her free fist flung off her hip and out
  [TSTRUCK.snapped, { body: { px: S0.px - 3.2, pz: S0.pz - 0.8, pitch: S0.pitch - 9, bend: S0.bend - 16, twist: S0.twist + 10, roll: S0.roll + 3, faceTurn: S0.faceTurn + 38, faceUp: 22, faceTilt: 14 }, l: [3, 9, -3], r: R_WRENCH, le: 30, re: S0.re }],
  // skipped back onto her back foot, sitting into it, her head coming forward after her body
  [6, { body: { px: S0.px - 4.6, pz: S0.pz - 1.8, pitch: S0.pitch - 3, bend: S0.bend - 5, twist: S0.twist + 4, roll: S0.roll + 1, faceTurn: S0.faceTurn + 14, faceUp: -6, faceTilt: 4 }, l: [1, 7.5, -6], r: R_WRENCH, le: 15, re: S0.re }],
  // up chin first, cocky, her fist back on her hip
  [9, { body: { px: S0.px - 2.4, pz: S0.pz - 0.6, pitch: S0.pitch - 1, bend: S0.bend - 1, twist: S0.twist, roll: S0.roll, faceTurn: S0.faceTurn - 4, faceUp: S0.faceUp + 8, faceTilt: S0.faceTilt - 4 }, l: L_HIP, r: R_WRENCH, le: S0.le, re: S0.re }],
  [TSTRUCK.end, AT_REST],
];
/** STRUCK FROM BEHIND: her poses, frame and pose. */
const BEHIND: [number, Pose][] = [
  // the blow on her rack: thrown forward, her head whipped back, her free fist flung forward and out
  [TSTRUCK.snapped, { body: { px: S0.px + 3.6, pz: S0.pz - 1.0, pitch: S0.pitch + 10, bend: S0.bend + 16, twist: S0.twist - 4, roll: S0.roll - 2, faceTurn: S0.faceTurn + 6, faceUp: 18, faceTilt: S0.faceTilt + 4 }, l: [6, 8, -5], r: R_WRENCH, le: 25, re: S0.re }],
  // caught on her lead foot, her head nodding down, her look going round
  [6, { body: { px: S0.px + 4.8, pz: S0.pz - 2.0, pitch: S0.pitch + 5, bend: S0.bend + 7, twist: S0.twist + 8, roll: S0.roll, faceTurn: S0.faceTurn + 60, faceUp: -6, faceTilt: S0.faceTilt + 2 }, l: [3, 8.5, -6], r: R_WRENCH, le: 20, re: S0.re }],
  // A LOOK BACK over her left shoulder, her fist on her hip again
  [9, { body: { px: S0.px + 2.6, pz: S0.pz - 0.8, pitch: S0.pitch + 1, bend: S0.bend + 2, twist: S0.twist + 16, roll: S0.roll, faceTurn: S0.faceTurn + 96, faceUp: 4, faceTilt: S0.faceTilt }, l: L_HIP, r: R_WRENCH, le: S0.le, re: S0.re }],
  [TSTRUCK.end, AT_REST],
];

const BODY = ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'faceTurn', 'faceUp', 'faceTilt'] as const;
type Field = (typeof BODY)[number];
/** A pose's numbers, all of them, each as the stance has it where the pose does not say. */
function numbersOf(p: Pose): number[] {
  const b = p.body as Record<string, number>;
  const s = S0 as unknown as Record<string, number>;
  return [...BODY.map((k) => b[k] ?? s[k] ?? 0), ...p.l, ...p.r, p.le, p.re];
}

/** How far the foot that catches her goes: back (her right) for a blow from in front, forward (her left) for one from behind. */
const CATCH = 3.2 * T;
const ease = (u: number): number => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * (3 - 2 * c);
};
/** A foot stepped from 0 to 1 of the way over frames `span`: lifted off the floor before it goes, set down before it stops. */
function step(span: [number, number], f: number): { go: number; up: number } {
  const u = Math.max(0, Math.min(1, (f - span[0]) / (span[1] - span[0])));
  const e = ease(u);
  return { go: ease((u - 0.12) / 0.76), up: 4 * e * (1 - e) };
}

/** Her at frame `f` of a blow: her body in a flash (landing at its fastest and slowing), then smoothly through her poses; her hands as her chest has them; her feet. */
function poseAt(behind: boolean, f: number): Partial<Bones> {
  const keys = behind ? BEHIND : HARD;
  const rest = numbersOf(AT_REST);
  let v: number[];
  if (f <= TSTRUCK.snapped) {
    const s = numbersOf(keys[0][1]);
    const u = Math.max(0, (f - TSTRUCK.hit) / (TSTRUCK.snapped - TSTRUCK.hit));
    const k = 1 - (1 - u) * (1 - u);
    v = rest.map((a, i) => a + (s[i] - a) * k);
  } else {
    const xs = keys.map(([at]) => at);
    const all = keys.map(([, p]) => numbersOf(p));
    v = rest.map((_, i) => through(xs, all.map((n) => n[i]), f));
  }
  const out: Record<string, number> = {};
  BODY.forEach((k, i) => (out[k] = v[i]));
  const n = BODY.length;
  const body = out as Partial<Bones>;
  // (her feet: the one that catches her lifted out and set down, then lifted back in; the other planted)
  const a = step(TSTRUCK.out, f);
  const b = step(TSTRUCK.back, f);
  const go = f < TSTRUCK.back[0] ? a.go : 1 - b.go;
  const up = f < TSTRUCK.back[0] ? a.up * 1.6 * T : b.up * 1.2 * T;
  const legs: Partial<Bones> = behind ? { lfx: S0.lfx + CATCH * go, lfz: (S0.lfz ?? 0) + up } : { rfx: S0.rfx - CATCH * go, rfz: (S0.rfz ?? 0) + up };
  const q = { ...body, ...legs };
  return { ...q, ...hands(handAt(q, true, v[n], v[n + 1], v[n + 2]), handAt(q, false, v[n + 3], v[n + 4], v[n + 5]), v[n + 6], v[n + 7]) };
}

function struck(behind: boolean): TinkMove {
  const long = TSTRUCK.end * FR;
  const n = Math.round(long * 60);
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = Math.min(long, i / 60);
    keys.push({ at: t, pose: poseAt(behind, t * 30), ease: 'lin' });
  }
  const motion: Motion = { keys };
  return {
    name: behind ? 'Struck from behind' : 'Struck hard',
    motion,
    long,
    loops: false,
    hold: () => ({ wrench: 0, twirl: false, spin: 0, vial: 0 }),
    // (the blow itself a flash, not judged frame by frame)
    strike: [[(TSTRUCK.hit - 1) * FR, (TSTRUCK.snapped + 1) * FR]],
  };
}
/** STRUCK HARD: snapped round, a skip back, up chin first. */
export function tinkerReel(): TinkMove {
  return struck(false);
}
/** STRUCK FROM BEHIND: thrown forward onto her lead foot, a look back over her shoulder. */
export function tinkerLurch(): TinkMove {
  return struck(true);
}

// ---------------------------------------------------------------------------------------------
// WHERE THE BLOW LANDS, ON THE PICTURE (for a film: in the game, what flies off a hit is the blow's own): a flash at her jaw,
// or on her rack with a glint off its glass; and a puff of dust as the foot that caught her is set down.

/** Her at a moment of a blow, with its flash (her turned `turn`). */
export function drawTinkerStruckAt(view: GameView, m: TinkMove, t: number, turn = 0): Drawn {
  const d = drawTinkerAt(view, m, t, turn);
  const behind = m.name === 'Struck from behind';
  const f = t / FR;
  const rot = (p: V3): V3 => {
    const a = (turn * Math.PI) / 180;
    return [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
  };
  const at = (p: V3): readonly [number, number] => d.st.at(rot(p));
  const s = f - TSTRUCK.hit;
  if (s >= 0 && s < 2.5) {
    const k = solve(B, { ...S0, ...poseAt(behind, TSTRUCK.hit + 1) } as Posed);
    const R = B.headR;
    const [cf, , cu] = k.chest;
    const spot: V3 = behind
      ? ([0, 1, 2].map((i) => (k.shoulderL[i] + k.shoulderR[i]) / 2 - cf[i] * 6.0 - cu[i] * 2.0) as unknown as V3)
      : ([0, 1, 2].map((i) => k.head[i] + k.face[0][i] * R[0] * 0.9 - k.face[2][i] * R[2] * 0.45) as unknown as V3);
    const [x, y] = at(spot);
    const long = 6 - 2 * s;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      const l = long * (i % 2 ? 0.55 : 1);
      line(d, x + Math.cos(a) * 2, y + Math.sin(a) * 2, x + Math.cos(a) * (2 + l), y + Math.sin(a) * (2 + l), i % 2 ? CYAN[3] : '#ffffff', true);
    }
    // (her rack's glass rattling: a glint or two off it)
    if (behind) for (const [gx, gy] of [[-3, -4], [4, -2], [-1, 3]] as const) dot(d, x + gx * (1 + s * 0.4), y + gy * (1 + s * 0.4), s < 1 ? '#e8ffff' : CYAN[2]);
  }
  billow(d, [behind ? S0.lfx + CATCH + 2 : S0.rfx - CATCH + 2, behind ? S0.lfy + B.stance : S0.rfy - B.stance, 0], f - TSTRUCK.out[1] + 1, 4, 9, 4, behind ? 71 : 77, turn);
  return d;
}
