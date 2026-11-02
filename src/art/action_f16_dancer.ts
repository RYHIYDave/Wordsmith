// FLOOR 17'S SMALL MOB, MORE ACTION: THE MASKED DANCERS (the art chat's helper, 2 Nov 2026; docs/mockups/action_f16/README.md). A
// MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE. THE PARTNER THROW (DANCER_THROW, off), in place of the whirling spin, on the game's own
// figures (art/masque_dancers.ts, art/masque_dancers_moves.ts), all they keep their own.
//
// His review of every enemy for more action, 31 Oct 2026, offered and answered “Yes (Recommended)”:
//   MASKED DANCER (floor 17, small): “Partner throw: a waltzing pair whirls round, and one flings the other spinning across the floor at
//   you like a top, down a marked lane.”
// Under his Movement 9 (24 Oct: “Like the wind up and wind down are big but the actual punch is lightning quick”; 28 Oct: “And bigger
// AOE to compensate for the extra time the player gets to evade”). Small: one attack (his rule of 9 Oct): a pair's, each with a part.
//
// THE PAIR'S PARTS (each drawn at its own spot, played together; the lady at the gentleman's right, both facing you as they begin):
//   HIS (`THROW_GENT`): he turns to her and takes both her hands, and the pair WHIRL ROUND, he turning on the spot on the balls of his
//     feet, she swung round him off her feet at the full length of their arms, faster, a whole turn, HELD at full speed (THE LANE marked
//     the while, from her place on at you); as she comes round to where she began, in TWO FRAMES he FLINGS her, his arms thrown open,
//     smeared; he turns on round after her, slowing, and stands.
//   HERS (`THROW_LADY`): turned to him, her hands in his, swung round him, leaning back, her skirt flying out; FLUNG in TWO FRAMES,
//     smeared, she comes down on the point of one foot and SPINS LIKE A TOP, her arms drawn in, her other foot drawn up to her knee,
//     her skirt flared flat, while the game carries her DOWN THE LANE at you, fast, slowing; the spin slows, she comes down off her point
//     and stands, posed, at its end.

import type { ActorArt } from './actor_types';
import { footOn } from './bosses3';
import type { Plant } from './bosses3';
import { hash } from './kit';
import { FLAME } from './mkit';
import { DANCER_CANVAS, ROOMS, bodyOf, dancerPainter } from './masque_dancers';
import type { DancerSay, DancerWho, RoomName } from './masque_dancers';
import { DANCERS, GENT_POSE, LADY_POSE } from './masque_dancers_moves';
import { TILE3, mobSet, skeletonAt } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { elbowFor, norm, solve } from './skeleton';
import type { Bones, Key3, Motion, Posed, V3 } from './skeleton';
import { FR, clamp01, f } from './action_f6_fx';

/** THE SWITCH, OFF. With it on, the bestiary's dancers are made by `makeThrowArt`. */
export const DANCER_THROW = { on: false };

type P = Partial<Bones>;
const D = Math.PI / 180;
const sm = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const rot = (v: readonly [number, number], deg: number): [number, number] => [v[0] * Math.cos(deg * D) - v[1] * Math.sin(deg * D), v[0] * Math.sin(deg * D) + v[1] * Math.cos(deg * D)];
const restFor = (who: DancerWho): Bones => (who === 'lady' ? LADY_POSE : GENT_POSE);
/** Their hands as they stand posed (their own place). */
const restHands = (who: DancerWho): [V3, V3] => {
  const s = solve(bodyOf(who), restFor(who) as Posed);
  return [s.handL, s.handR];
};

/**
 * THE THROW'S NUMBERS (seconds from its start; tiles; the pair's own place: forward the way they face as they begin, toward you):
 *   taking    turned to each other, her hands in his, by 0.3 s
 *   THE WHIRL  round him at `r` (her middle from his), turning faster to `turns` a second by 0.6 s, HELD at full speed to 1.133 s, a whole
 *             turn, her back where she began: THE LANE marked from 0.3 s, from her place on along their forward, `lane` long, `half` to
 *             either side
 *   THE FLING  TWO FRAMES, smeared (frames 34 to 36, 1.2 s: the clip's `hit`): his arms thrown open; she is off
 *   HER SPIN   like a top on the point of her foot, `spin` turns a second as she goes, slowing to a stop by 2.51 s; she stands at 2.9 s
 *   HER RUN   the game carries her down the lane from the fling: `pace` tiles a second at once, slowing to a stop at `stop` s (`topGone`):
 *             `lane` tiles; a hero within `r2` of her as she comes by is struck and knocked `knock`
 *   HIS END   turned on round after her, slowing, facing you again by 1.93 s; he stands at 2.3 s
 *   near, far  begun at a hero from 2 to 8.5 tiles off
 */
export const THROW_HIT = f(36);
export const THROW_STRIKE = [f(34), f(36)] as const;
export const THROW_SMEARED = (t: number): boolean => t > THROW_STRIKE[0] + 1e-6 && t <= THROW_STRIKE[1] + FR + 1e-6;
export const THROW = { take: 0.3, fast: 0.6, r: 26 / TILE3, pace: 14, stop: 1.3, half: 0.85, r2: 0.85, knock: 0.7, spin: 4, gent: 2.3, lady: 2.9, near: 2, far: 8.5 } as const;
/** How far down the lane she is, `u` seconds after the fling (tiles): off at its pace, slowing to a stop. */
export const topGone = (u: number): number => {
  const k = Math.min(Math.max(0, u), THROW.stop);
  return THROW.pace * k - (THROW.pace / (2 * THROW.stop)) * k * k;
};
export const LANE_LONG = topGone(THROW.stop);
const R_U = THROW.r * TILE3;
const REL = THROW_STRIKE[0];
/** The pair's turn (his facing, degrees to the left; she is that way from him): from facing you to her, then whirled round a whole turn. */
const OMEGA = 360 / (0.15 + (REL - THROW.fast));
/** How long he turns on round after her, to face you again. */
const TURN_ON = 0.8;
export function pairTurn(t: number): number {
  if (t <= THROW.take) return -90 * sm(0, 0.22, t);
  if (t <= THROW.fast) return -90 + (OMEGA * (t - THROW.take) ** 2) / (2 * (THROW.fast - THROW.take));
  if (t <= REL) return -90 + OMEGA * 0.15 + OMEGA * (t - THROW.fast);
  // (his: on round after her, slowing, to face you)
  // (his whirl stopped dead as he flings her; then turned on round, slowly, to face you)
  return 270 + 90 * sm(REL + 0.12, REL + 0.12 + TURN_ON, t);
}
/** Her own turn: facing him as she is swung; flung, spinning like a top, slowing to face you. */
const SPIN_T = (2 * 990) / (THROW.spin * 360);
export function ladyTurn(t: number): number {
  if (t <= REL) return pairTurn(t) + 180 * sm(0, THROW.take, t) + (t <= THROW.take ? 0 : 0);
  const u = Math.min(SPIN_T, t - REL);
  return 450 + THROW.spin * 360 * u - ((THROW.spin * 360) / (2 * SPIN_T)) * u * u;
}
/** Where her middle is in her own picture (her own lengths, from where she began): round him on the circle, and back where she began as she is flung. */
function ladyAt(t: number): [number, number] {
  if (t <= THROW.take || t >= REL) return [0, 0];
  const a = pairTurn(t);
  const [x, y] = rot([R_U, 0], a);
  return [x, y + R_U];
}
/** Where their joined hands are (his picture), and so in hers. */
function joined(t: number): V3 {
  const a = pairTurn(Math.min(t, REL));
  const k = sm(0.05, THROW.take, t);
  const [x, y] = rot([12.5 * k + 7 * (1 - k), 0], a);
  return [x, y - (1 - k) * 4, 41 + 1.5 * k];
}

// ---------------------------------------------------------------------------------------------
// HIS PART

/** His feet: turning on the spot on the balls of his feet, a foot down while the other steps round, each pivoting as he turns over it. */
function gentFeet(): (t: number) => P {
  const B = bodyOf('gent');
  const R = GENT_POSE;
  const home: Record<'L' | 'R', Plant> = { R: { at: [B.ball * 0.95, -2.4], turn: -4, pitch: 22 }, L: { at: [B.ball * 0.95 + 1.2, 2.6], turn: 6, pitch: 22 } };
  void R;
  // (a step every 60 degrees of his turn, the feet in turn; each down from a little before to a little after)
  const t0 = 0.05;
  const t1 = 1.93;
  const n = 12;
  const half = (0.62 * (t1 - t0)) / n;
  const mids: { side: 'L' | 'R'; t: number; at: [number, number]; yaw: number; from: number; to: number }[] = [];
  for (let k = 0; k < n; k++) {
    const t = t0 + ((k + 0.5) * (t1 - t0)) / n;
    const side = k % 2 === 0 ? 'R' : 'L';
    const y = pairTurn(t);
    // (the first, his right foot where it stands, from the start; the last, his left, held till the right is home)
    mids.push({ side, t, at: k === 0 ? [home.R.at[0], home.R.at[1]] : rot(home[side].at, y), yaw: y, from: k === 0 ? 0 : t - half, to: k === n - 1 ? 2.06 : t + half });
  }
  const homeAt = { R: 2.05, L: 2.25 };
  return (t) => {
    const out: P = {};
    for (const side of ['L', 'R'] as const) {
      const list = mids.filter((m) => m.side === side);
      const h = home[side];
      const plant = (at: readonly [number, number], turn: number, lift = 0): P => footOn(B, side, { at, turn, pitch: 22 }, lift);
      let pose: P | null = null;
      for (const m of list) if (t >= m.from && t <= m.to) pose = plant(m.at, h.turn + pairTurn(t));
      if (!pose && t >= homeAt[side]) pose = plant(h.at, h.turn + 360);
      if (!pose) {
        // (up: from the spot it left to the next, lifted; after the last, home again, a whole turn round)
        const prev = [...list].reverse().find((m) => m.to < t);
        const next = list.find((m) => m.from > t);
        const a = prev ? { at: prev.at, turn: h.turn + pairTurn(prev.to), t: prev.to } : { at: h.at, turn: h.turn, t: 0 };
        const b = next ? { at: next.at, turn: h.turn + pairTurn(next.from), t: next.from } : { at: h.at, turn: h.turn + 360, t: homeAt[side] };
        if (!pose) {
          const u = clamp01((t - a.t) / Math.max(1e-6, b.t - a.t));
          const g = u * u * (3 - 2 * u);
          pose = plant([a.at[0] + (b.at[0] - a.at[0]) * g, a.at[1] + (b.at[1] - a.at[1]) * g], a.turn + (b.turn - a.turn) * g, 2.6 * Math.pow(Math.sin(Math.PI * u), 0.7));
        }
      }
      Object.assign(out, pose);
      if (side === 'L') out.lk = (out.lft as number) + 8;
      else out.rk = (out.rft as number) - 8;
    }
    return out;
  };
}
function gentPose(t: number): P {
  const B = bodyOf('gent');
  const R = GENT_POSE;
  const y = pairTurn(t);
  const lean = sm(0.2, 0.5, t) * (1 - sm(REL, REL + 0.3, t));
  const body: P = { px: 0, py: 0, pz: R.pz - 0.6 - 1.2 * lean, yaw: y, twist: 0, pitch: -6 * lean + 3 * sm(REL, REL + 0.08, t) * (1 - sm(REL + 0.2, 1.8, t)), bend: -4 * lean, roll: 0, side: 0, faceTurn: y, faceUp: 6, faceTilt: -2 };
  let hands: P;
  if (t <= REL) {
    const j = joined(t);
    const k = sm(0.15, 0.3, t);
    const kr = sm(0.02, 0.24, t);
    const [hl, hr] = restHands('gent');
    const l: V3 = [j[0], j[1] + 2.2, j[2]];
    const r: V3 = [j[0], j[1] - 2.2, j[2]];
    // (his left hand from behind his back out round his side, then to hers)
    const k1 = sm(0, 0.13, t);
    const side = rot([-1, 15], pairTurn(t));
    const sd: V3 = [hl[0] + (side[0] - hl[0]) * k1, hl[1] + (side[1] - hl[1]) * k1, hl[2] + (31 - hl[2]) * k1];
    hands = { lhIn: 2, lhx: sd[0] + (l[0] - sd[0]) * k, lhy: sd[1] + (l[1] - sd[1]) * k, lhz: sd[2] + (l[2] - sd[2]) * k, rhIn: 2, rhx: hr[0] + (r[0] - hr[0]) * kr, rhy: hr[1] + (r[1] - hr[1]) * kr, rhz: hr[2] + (r[2] - hr[2]) * kr };
    // (her hands taken with his: the left joining as it comes)
    const out = { ...body, ...hands };
    return elbowsTo(B, R, out, rot3([0.2, 1, -0.4], y), rot3([0.2, -1, -0.4], y));
  }
  // THE FLING: his arms thrown open, out and up; held open; lowered
  const k = sm(REL, THROW_HIT, t) * 0.999 + (t > THROW_HIT ? 0.001 : 0);
  // (flung open in the two frames, and on a little further after, carried through)
  const open = t <= THROW_HIT ? (t - REL) / (THROW_HIT - REL) : 1 ;
  const back = sm(1.75, 2.25, t);
  const j = joined(REL);
  const outL = rot([3 - 1 * back, 15 - 6 * back, 0], y);
  const outR = rot([4 - 2 * back, -16 + 7 * back, 0], y);
  // (carried on up after the fling)
  const up = 14 * sm(THROW_HIT - 0.02, THROW_HIT + 0.14, t) * (1 - sm(THROW_HIT + 0.35, 1.2, t));
  const zL = 60 + up - 30 * back;
  const zR = 61 + up - 31 * back;
  const L: V3 = [j[0] + (outL[0] - j[0]) * open, j[1] + 2.2 + (outL[1] - j[1] - 2.2) * open, j[2] + (zL - j[2]) * open];
  const Rr: V3 = [j[0] + (outR[0] - j[0]) * open, j[1] - 2.2 + (outR[1] - j[1] + 2.2) * open, j[2] + (zR - j[2]) * open];
  void k;
  return elbowsTo(B, R, { ...body, lhIn: 2, lhx: L[0], lhy: L[1], lhz: L[2], rhIn: 2, rhx: Rr[0], rhy: Rr[1], rhz: Rr[2] }, rot3([0, 1, -0.6], y), rot3([0, -1, -0.6], y));
}
const rot3 = (v: V3, deg: number): V3 => {
  const [x, y] = rot([v[0], v[1]], deg);
  return [x, y, v[2]];
};
function elbowsTo(B: ReturnType<typeof bodyOf>, rest: Bones, pose: P, wl: V3 | null, wr: V3 | null): P {
  const q = { ...rest, ...pose } as Posed;
  const le = wl ? elbowFor(B, q, true, norm(wl)) : q.le;
  const re = wr ? elbowFor(B, { ...q, le } as Posed, false, norm(wr)) : q.re;
  return { ...pose, le, re };
}

// ---------------------------------------------------------------------------------------------
// HER PART

function ladyPose(t: number): P {
  const B = bodyOf('lady');
  const R = LADY_POSE;
  const y = ladyTurn(t);
  const [px, py] = ladyAt(t);
  const swung = sm(THROW.take, THROW.take + 0.15, t) * (1 - sm(REL, REL + 0.07, t));
  const top = sm(REL, REL + 0.1, t) * (1 - sm(2.4, 2.7, t));
  const body: P = {
    px, py, pz: R.pz + 3.0 * swung + 2.6 * top - 0.4,
    yaw: y, twist: 0, pitch: -14 * swung + 2 * top, bend: -8 * swung - 2 * top, roll: 0, side: 0,
    faceTurn: y, faceUp: 8 + 6 * swung, faceTilt: 4,
  };
  if (t <= REL) {
    // her hands in his (his picture's place, from where she began)
    const j = joined(t);
    const k = sm(0.05, 0.25, t);
    const pt = (dy: number): V3 => [j[0], j[1] + dy + R_U, j[2]];
    const L = pt(-2.2);
    const Rr = pt(2.2);
    const [hl, hr] = restHands('lady');
    const mixed = (a: V3, b: V3): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
    const Lh = mixed(hl, L);
    const Rh = mixed(hr, Rr);
    return elbowsTo(B, R, { ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2] }, rot3([0.2, 1, -0.5], y), rot3([0.2, -1, -0.5], y));
  }
  // flung: her arms drawn in, crossed before her breast (spinning); then opened into her pose as she stops
  const inK = t <= THROW_HIT ? (t - REL) / (THROW_HIT - REL) : 1;
  const openK = sm(2.45, 2.85, t);
  const j = joined(REL);
  const L0: V3 = [j[0], j[1] - 2.2 + R_U, j[2]];
  const R0: V3 = [j[0], j[1] + 2.2 + R_U, j[2]];
  const tuck = (dy: number): V3 => {
    const [x, yy] = rot([6.5, dy], y);
    return [x, yy, 38];
  };
  const pose = (dy: number, side: 'L' | 'R'): V3 => {
    const [x, yy] = rot([3.0, side === 'L' ? 9 : -9], y);
    return [x, yy, 25];
  };
  const mix3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const Lh = mix3(mix3(L0, tuck(2.2), inK), pose(0, 'L'), openK);
  const Rh = mix3(mix3(R0, tuck(-2.2), inK), pose(0, 'R'), openK);
  return elbowsTo(B, R, { ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2] }, rot3([-0.2, 1, -0.3], y), rot3([-0.2, -1, -0.3], y));
}
function ladyFeet(): (t: number) => P {
  const B = bodyOf('lady');
  const homeR: Plant = { at: [B.ball * 0.95, -2.4], turn: -4, pitch: 22 };
  const homeL: Plant = { at: [B.ball * 0.95 + 1.2, 2.6], turn: 6, pitch: 22 };
  // (turned to him on the ball of her right foot, the left stepping round; swung off her feet; down on the point of her right foot,
  // spinning on it, her left foot drawn up to her right knee; down onto both again as she stops, a step to her pose)
  const pivot: [number, number] = [homeR.at[0], homeR.at[1]];
  const leftTo = (yy: number): [number, number] => {
    const [x, y] = rot([homeL.at[0] - pivot[0], homeL.at[1] - pivot[1]], yy);
    return [pivot[0] + x, pivot[1] + y];
  };
  const pointAt: [number, number] = rot([B.ball * 0.3, -1.2], 90);
  const endR = ((): number => ladyTurn(2.6))();
  void endR;
  return (t) => {
    const y = ladyTurn(t);
    if (t <= THROW.take) {
      // (the right foot turning on its ball; the left stepping round it)
      const u = clamp01((t - 0.04) / (THROW.take - 0.06));
      return { ...footOn(B, 'R', { ...homeR, turn: homeR.turn + y }), ...footOn(B, 'L', { at: leftTo(90 * u * u * (3 - 2 * u)), turn: homeL.turn + y, pitch: 22 }, 2.4 * Math.sin(Math.PI * u)), lk: y + 6, rk: y - 6 };
    }
    if (t < REL) {
      // (swung round off her feet: both feet up, trailing out behind her as she goes round)
      const lift = 3.5 * sm(THROW.take, THROW.take + 0.1, t) + 0.5;
      const a = pairTurn(t);
      const trail = sm(THROW.take, 0.6, t) * 4;
      const [cx, cy] = ladyAt(t);
      const off = (p: readonly [number, number]): [number, number] => {
        const q = rot([p[0] - 1.5, p[1]], y);
        const back = rot([0, -trail], a);
        return [cx + q[0] + back[0], cy + q[1] + back[1]];
      };
      const l0 = leftTo(90);
      const r0 = homeR.at;
      const k = sm(THROW.take, THROW.take + 0.12, t);
      const lAt: [number, number] = [l0[0] + (off(homeL.at)[0] - l0[0]) * k, l0[1] + (off(homeL.at)[1] - l0[1]) * k];
      const rAt: [number, number] = [r0[0] + (off(homeR.at)[0] - r0[0]) * k, r0[1] + (off(homeR.at)[1] - r0[1]) * k];
      return { ...footOn(B, 'R', { at: rAt, turn: homeR.turn + y, pitch: 34 }, lift), ...footOn(B, 'L', { at: lAt, turn: homeL.turn + y, pitch: 34 }, lift + 1), lk: y + 10, rk: y - 10 };
    }
    // (on the point: her right foot's ball where she came down, turning with her; her left drawn up to her right knee)
    const down = sm(REL, THROW_HIT, t);
    const stop = sm(2.5, 2.78, t);
    const lPos = rot([1.6, 2.2], y);
    const rot0 = ((): [number, number] => {
      const [x, yy] = rot([homeL.at[0] - pointAt[0], homeL.at[1] - pointAt[1]], 0);
      return [x, yy];
    })();
    void rot0;
    const lAtTop: [number, number] = [pointAt[0] + lPos[0] * 0.3, pointAt[1] + lPos[1] * 0.3];
    const lHome = homeL.at;
    const lAt: [number, number] = [lAtTop[0] + (lHome[0] - lAtTop[0]) * stop, lAtTop[1] + (lHome[1] - lAtTop[1]) * stop];
    const rTurn = homeR.turn + y;
    const rFoot = stop < 1 ? footOn(B, 'R', { at: pointAt, turn: rTurn, pitch: 22 + 30 * down * (1 - stop) }, 0.2 * (1 - down) * 3) : footOn(B, 'R', { at: pointAt, turn: rTurn, pitch: 22 });
    // (at the very end: a step of the right foot home, into her pose)
    const home = sm(2.78, 2.9, t);
    const rF = home > 0 ? footOn(B, 'R', { at: [pointAt[0] + (homeR.at[0] - pointAt[0]) * home, pointAt[1] + (homeR.at[1] - pointAt[1]) * home], turn: rTurn, pitch: 22 }, 2.2 * Math.sin(Math.PI * home)) : rFoot;
    return { ...rF, ...footOn(B, 'L', { at: lAt, turn: homeL.turn + y, pitch: 30 * (1 - stop) + 22 * stop }, (15 * down) * (1 - stop)), lk: y + 30 * (1 - stop) + 6 * stop, rk: y - 6 };
  };
}

// ---------------------------------------------------------------------------------------------
// THEM

function sampledMotion(long: number, pose: (t: number) => P, hit: number): Motion {
  const keys: Key3[] = [];
  const n = Math.round(long * 30);
  for (let i = 0; i <= n; i++) keys.push({ at: i / 30, pose: pose(i / 30), ease: 'lin' });
  return { keys, hit };
}
const THROW_NAME = { gent: 'The partner throw (his part)', lady: 'The partner throw (her part)' } as const;
/** The smear of the fling: after-images of the hands (his flung open; hers drawn in), and of her skirt's hem as she spins. */
function smearOf(who: DancerWho, mob: Mob, m: Moment): V3[][] | null {
  if (!THROW_SMEARED(m.t)) return null;
  const out: V3[][] = [];
  const to = Math.min(m.t, THROW_HIT);
  for (let i = 0; i <= 8; i++) {
    const u = REL - FR * 0.5 + ((to - (REL - FR * 0.5)) * i) / 8;
    const s = skeletonAt(mob, 'attack', u);
    out.push([s.handL, s.elbowL, s.handR, s.elbowR]);
  }
  void who;
  return m.t > THROW_HIT + 1e-6 ? out.slice(4) : out;
}
function throwMob(who: DancerWho, room: RoomName): Mob {
  const base = DANCERS[who][room];
  const name = THROW_NAME[who];
  const mob: Mob = { ...base } as Mob;
  const yawOf = who === 'gent' ? pairTurn : ladyTurn;
  const say: DancerSay = {
    room: ROOMS[room],
    spin: (m) => (m.move === name ? (yawOf(m.t + 1 / 60) - yawOf(m.t - 1 / 60)) * 30 / 360 * (who === 'gent' ? 0.5 : 1) : 0),
    smear: (m) => (m.move === name ? smearOf(who, mob, m) : null),
    more: (m) => {
      const out: [V3, string, number][] = [];
      if (m.move !== name) return out;
      // (the warning: pink glints at their joined hands through the whirl)
      if (m.t > THROW.take && m.t < REL) {
        const tick = Math.floor(m.t * 15);
        for (const [i, p] of [m.s.handL, m.s.handR].entries()) if ((i + tick) % 2 === 0) out.push([[p[0], p[1], p[2] + 1.2], tick % 2 ? FLAME[3] : FLAME[2], 1]);
      }
      // (her spin: the grey breath whipped round her)
      if (who === 'lady' && m.t > REL && m.t < 2.4) {
        for (let i = 0; i < 18; i++) {
          const a = ((i / 18) * 360 + ladyTurn(m.t) * 0.8) * D;
          const r = 12 + 8 * hash(i, 1, 2011);
          if (hash(i, 2, 2011) < (m.t - REL) / 1.4) continue;
          out.push([[m.s.pelvis[0] + Math.cos(a) * r, m.s.pelvis[1] + Math.sin(a) * r, 8 + 20 * hash(i, 3, 2011)], i % 3 ? '#9890b4' : '#625a7a', 1]);
        }
      }
      return out;
    },
    burn: (m) => (m.move === name ? sm(THROW.take - 0.1, THROW.take + 0.1, m.t) * (1 - sm(THROW_HIT, THROW_HIT + 0.2, m.t)) : 0),
    freed: (m) => false && !!m,
    puff: (m) => (m.move === name ? 1.4 : 0.8),
  };
  const paint = dancerPainter(who, say);
  const attack: MobMove = { name, motion: sampledMotion(who === 'gent' ? THROW.gent : THROW.lady, who === 'gent' ? gentPose : ladyPose, THROW_HIT), rest: restFor(who), feet: who === 'gent' ? gentFeet() : ladyFeet() };
  Object.assign(mob, {
    id: `${base.id}-throw`,
    attack,
    hit: THROW_HIT,
    warn: REL - THROW.fast,
    canvas: DANCER_CANVAS,
    // (their own painter for all else: but this move's say is its own)
    bits: (st: Parameters<Mob['bits']>[0], m: Moment) => (m.move === name ? paint.bits(st, m) : base.bits(st, m)),
    grains: (st: Parameters<Mob['bits']>[0], m: Moment) => (m.move === name ? paint.grains(st, m) : base.grains?.(st, m) ?? []),
  });
  return mob;
}
/** Every dancer with the partner throw (DANCER_THROW): the game's own in all but it. */
export const THROW_DANCERS: Readonly<Record<DancerWho, Readonly<Record<RoomName, Mob>>>> = {
  lady: Object.fromEntries((Object.keys(ROOMS) as RoomName[]).map((r) => [r, throwMob('lady', r)])) as Record<RoomName, Mob>,
  gent: Object.fromEntries((Object.keys(ROOMS) as RoomName[]).map((r) => [r, throwMob('gent', r)])) as Record<RoomName, Mob>,
};
export const THROW_LADY = THROW_DANCERS.lady.violet;
export const THROW_GENT = THROW_DANCERS.gent.blue;
/** As the game holds a monster: the game's own dancer, the throw (his part or hers) as its `attack`. */
export function makeThrowArt(mob: Mob = THROW_LADY, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}
/** Whether she, `u` seconds after the fling, strikes a hero `x` tiles before where she was flung from (down the lane) and `y` across it. */
export const topStrikes = (u: number, x: number, y: number): boolean => u >= 0 && u <= THROW.stop + 0.1 && Math.hypot(x - topGone(u), y) <= THROW.r2;
