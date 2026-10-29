// FLOOR 17'S MASKED DANCERS: THEIR MOVES (the art chat's helper, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind
// DANCERS_ON (art/masque_dancers.ts, off). Their look and his brief are art/masque_dancers.ts.
//
// His pick for how they move: “Gliding fast, whirling (Recommended)”. And his rules for every new enemy: his Movement 9
// (24 Oct, “Like the wind up and wind down are big but the actual punch is lightning quick”; for the enemies, 28 Oct, “Start
// from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for the extra time
// the player gets to evade”), and his words of 28 Oct, “It’s all too slow and too narrow and too small.  I could dodge
// anything you’ve put in these moves with my eyes closed”, “Everything is always so plodding when you first animate them”,
// and “like the prince with a rapier, dancing is going to need to be fast and constantly moving”. So, from this first pass:
//
// THEIR MOVES:
//   STANDING, POSED: a dancer's open pose, the arms held out low and wide, the head up; they breathe, sway, turn the head.
//   THE WALTZ (`more.waltz`): in pairs, in hold (his right hand on her back, her left on his shoulder, his left holding her
//     right high out to the side), turning round each other once a second, six steps to the turn (the Viennese waltz's own
//     tempo), the pair drifting round the room as they turn (`WALTZ_PACE`). Each dancer is a mob of their own, the pair's
//     middle their floor point; two of them, a lady and a gentleman, played together at one spot are the pair
//     (`pairPainted` paints the two as one picture).
//   THE WHIRL (their walk): gliding fast at you, whirling round and round as they come, three turns a second, a step for
//     every half turn on the balls of their feet, the skirt and the coat-tails flying out, the arms held wide; the head
//     whipped round to keep its mask on you (a dancer's spotting).
//   THE CHIME (`more.chime`): the clock strikes and they stop dead in hold; their masks snap round to look at you; held,
//     still; then the hold breaks and they turn to you, ready to whirl.
//   THE WHIRLING SPIN (their one attack): wound round the other way and crouched, the arms coiled across, the mask still on
//     you, the eyes burning (THE WARNING, held); hips first; THE STRIKE, in two frames: a leaping whirl that carries them
//     `SPIN.lunge` tiles into you, turning more than a whole turn, the skirt and the coat-tails flung out, smeared all round
//     (the area it strikes, `SPIN.area` tiles round where they land); then a big wind-down: still turning, slowing, the
//     skirt wrapping round, into a flourish, and back to their pose.
//   STRUCK: knocked back and half turned, the head thrown back, the arms flung up.
//   THEIR DEATH (the brief's: the mask drops, the Hush leaves them, they sink down in a last bow): struck; the mask falls
//     from the face; the Hush pours out of them; they sink down in a last bow, to their knees, the head bowed: alive, still.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind, the
// lightning strike as his Movement 9 asks.
//   test: tsx --test tests/masque_dancers.test.ts

import type { ActorArt } from './actor_types';
import type { BossShape, CheckLimb, CheckLump, Handover } from './boss_checks';
import { footOn, kneelHips } from './bosses3';
import type { Plant } from './bosses3';
import { hash } from './kit';
import { FLAME } from './mkit';
import { DANCER_CANVAS, GENT_BODY, LADY_BODY, ROOMS, bodyOf, dancerPainter } from './masque_dancers';
import type { DancerSay, DancerWho, Room, RoomName } from './masque_dancers';
import { TILE3, canvasOf, mobSet, momentOf, paintViewOf, partOrder, paintBits } from './new_mobs3';
import type { Bit, Mob, MobMove, Moment } from './new_mobs3';
import { ENEMY_RIM } from './mkit';
import { stage } from './skin';
import type { GameView } from './skin';
import type { Painted } from './kit';
import { add, elbowFor, lerp3, mul, norm, solve, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const FPS = 30;
const FR = 1 / FPS;
const D = Math.PI / 180;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const rot = (v: readonly [number, number], deg: number): [number, number] => [v[0] * Math.cos(deg * D) - v[1] * Math.sin(deg * D), v[0] * Math.sin(deg * D) + v[1] * Math.cos(deg * D)];
const rot3 = (v: V3, deg: number): V3 => [v[0] * Math.cos(deg * D) - v[1] * Math.sin(deg * D), v[0] * Math.sin(deg * D) + v[1] * Math.cos(deg * D), v[2]];

/** A value through keys [time, value], smooth through each (a monotone cubic: no overshoot; it stops only where it turns back or holds). */
function track(keys: ReadonlyArray<readonly [number, number]>): (t: number) => number {
  const n = keys.length;
  const ts = keys.map((k) => k[0]);
  const vs = keys.map((k) => k[1]);
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m: number[] = [];
  for (let i = 0; i < n; i++) {
    if (i === 0 || i === n - 1 || d[i - 1] * d[i] <= 0) m.push(0);
    else {
      const w1 = 2 * (ts[i + 1] - ts[i]) + (ts[i] - ts[i - 1]);
      const w2 = ts[i + 1] - ts[i] + 2 * (ts[i] - ts[i - 1]);
      m.push((w1 + w2) / (w1 / d[i - 1] + w2 / d[i]));
    }
  }
  return (t: number) => {
    if (n === 1 || t <= ts[0]) return vs[0];
    if (t >= ts[n - 1]) return vs[n - 1];
    let i = 0;
    while (i < n - 2 && t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i];
    const u = (t - ts[i]) / h;
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1;
    const h10 = u ** 3 - 2 * u ** 2 + u;
    const h01 = -2 * u ** 3 + 3 * u ** 2;
    const h11 = u ** 3 - u ** 2;
    return h00 * vs[i] + h10 * h * m[i] + h01 * vs[i + 1] + h11 * h * m[i + 1];
  };
}

// =============================================================================================
// FEET THAT GRIP (the rulebook's Movement 8): each foot down on its ball where it lands, turning on it as the body turns
// over it, its heel up; lifted, it goes over to where it lands next.

/**
 * A FOOT DOWN: from `t0` to `t1`, its ball on the spot `at` (forward and to the left of the floor point, as it is at the
 * middle of the time it is down: the game carrying the figure on at `carry` a second, the floor goes back under it), the
 * foot turned from `turn0` to `turn1` on its ball, tipped `pitch` toes-down (its heel up).
 */
interface Stance {
  side: 'L' | 'R';
  t0: number;
  t1: number;
  at: readonly [number, number];
  turn0: number;
  turn1: number;
  pitch: number;
  /** Turning on its ball with the body over it (`yawOf`), from `turn0` to `turn1` of it; or else turned evenly from the one to the other. */
  follow?: boolean;
}
/**
 * Both feet through a move from where they are down (`stances`); a move going round (`period`) round again. A foot that is up
 * goes from where it lifted to where it lands, `lift` high at the top, turning with the body (`yawOf`) as it goes; its knee
 * turned the way the foot is (`knee` more).
 */
function feetOf(B: Build, stances: ReadonlyArray<Stance>, o: { period?: number; carry?: number; lift?: number; knee?: { L: number; R: number }; flightPitch?: number; yawOf?: (t: number) => number }): (t: number) => P {
  const carry = o.carry ?? 0;
  const lift = o.lift ?? 3;
  const per = o.period;
  const yawOf = o.yawOf;
  const sides = { L: stances.filter((s) => s.side === 'L').sort((a, b) => a.t0 - b.t0), R: stances.filter((s) => s.side === 'R').sort((a, b) => a.t0 - b.t0) };
  /** Where a stance's spot is at time `t`, in the figure's own place (the floor going back under it). */
  const spot = (s: Stance, shift: number, t: number): [number, number] => {
    const mid = (s.t0 + s.t1) / 2 + shift;
    return [s.at[0] - carry * (t - mid), s.at[1]];
  };
  const y = (t: number): number => (yawOf ? yawOf(t) : 0);
  return (t) => {
    const out: P = {};
    for (const side of ['L', 'R'] as const) {
      const list = sides[side];
      if (!list.length) continue;
      // (a move going round: its stances a round before and after it too)
      const all: { s: Stance; shift: number }[] = per ? [-1, 0, 1].flatMap((k) => list.map((s) => ({ s, shift: k * per }))) : list.map((s) => ({ s, shift: 0 }));
      all.sort((a, b) => a.s.t0 + a.shift - (b.s.t0 + b.shift));
      let f: P | null = null;
      let turn = 0;
      for (let i = 0; i < all.length; i++) {
        const { s, shift } = all[i];
        const a0 = s.t0 + shift;
        const a1 = s.t1 + shift;
        if (t >= a0 - 1e-9 && t <= a1 + 1e-9) {
          // DOWN: on its spot, turning on its ball
          const k = (t - a0) / Math.max(1e-6, a1 - a0);
          turn = s.follow && yawOf ? y(t) + (s.turn0 - y(a0)) + (s.turn1 - y(a1) - (s.turn0 - y(a0))) * k : s.turn0 + (s.turn1 - s.turn0) * k;
          f = footOn(B, side, { at: spot(s, shift, t), turn, pitch: s.pitch, on: 'toe' });
          break;
        }
        const nx = all[i + 1];
        if (nx && t > a1 && t < nx.s.t0 + nx.shift) {
          // UP: from where it lifted to where it lands (on the floor's own place, which goes back under the figure meanwhile)
          const b0 = nx.s.t0 + nx.shift;
          const u = (t - a1) / (b0 - a1);
          const g = smooth(0.1, 0.9, u);
          const from = spot(s, shift, a1);
          const to = spot(nx.s, nx.shift, b0);
          const floorFrom = from[0] + carry * a1;
          const floorTo = to[0] + carry * b0;
          const px = floorFrom + (floorTo - floorFrom) * g - carry * t;
          const py = from[1] + (to[1] - from[1]) * g;
          const endA = s.follow && yawOf ? s.turn1 : s.turn1;
          const endB = nx.s.turn0;
          turn = yawOf ? y(t) + (endA - y(a1)) + (endB - y(b0) - (endA - y(a1))) * g : endA + (endB - endA) * g;
          const pitch = s.pitch + (nx.s.pitch - s.pitch) * g + ((o.flightPitch ?? s.pitch) - s.pitch) * Math.sin(Math.PI * u);
          f = footOn(B, side, { at: [px, py], turn, pitch, on: 'toe' }, lift * Math.pow(Math.sin(Math.PI * u), 0.6));
          break;
        }
      }
      if (!f) {
        // (before its first stance or after its last: where that one is)
        const first = all[0];
        const last = all[all.length - 1];
        const before = t < first.s.t0 + first.shift;
        const s = before ? first : last;
        turn = before ? s.s.turn0 : s.s.turn1;
        f = footOn(B, side, { at: spot(s.s, s.shift, before ? s.s.t0 + s.shift : s.s.t1 + s.shift), turn, pitch: s.s.pitch, on: 'toe' });
      }
      Object.assign(out, f);
      if (o.knee) {
        if (side === 'L') out.lk = turn + o.knee.L;
        else out.rk = turn + o.knee.R;
      }
    }
    return out;
  };
}

// =============================================================================================
// A MOVE AS A FUNCTION OF TIME, sampled on every frame the game shows

/** Every frame of a move, `fps` a second, from a pose at each moment (and a blow's moment). */
function sampled(long: number, fps: number, pose: (t: number) => P, more: Partial<Motion> = {}): Motion {
  const keys: Key3[] = [];
  const n = Math.round(long * fps);
  for (let i = 0; i <= n; i++) keys.push({ at: i / fps, pose: pose(i / fps), ease: 'lin' });
  return { keys, ...more };
}
/** Hands from their shoulders along the chest's own ways (`lhIn` 0): they turn with the chest as it whirls. */
const handsC = (l: V3, r: V3, le: number, re: number): P => ({ lhIn: 0, lhx: l[0], lhy: l[1], lhz: l[2], le, rhIn: 0, rhx: r[0], rhy: r[1], rhz: r[2], re });
/** Hands where they are on the floor's own place (`lhIn` 2): on a partner, still while the body moves. */
const handsF = (l: V3, r: V3): P => ({ lhIn: 2, lhx: l[0], lhy: l[1], lhz: l[2], rhIn: 2, rhx: r[0], rhy: r[1], rhz: r[2] });
/** The elbows of a pose with its hands placed, pointed the ways asked (in the figure's own place). */
function elbowsTo(B: Build, rest: Bones, pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...rest, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}
/** The mix of two poses, every number `k` of the way (where the hands are measured from: the second's). */
function mixP(a: P, b: P, k: number, rest: Bones): P {
  const out: Record<string, number> = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = ((a as Record<string, number>)[key] ?? (rest as unknown as Record<string, number>)[key]) as number;
    const y = ((b as Record<string, number>)[key] ?? (rest as unknown as Record<string, number>)[key]) as number;
    out[key] = key === 'lhIn' || key === 'rhIn' ? y : x + (y - x) * k;
  }
  return out as P;
}

// =============================================================================================
// STANDING, POSED: the arms open low and wide, as they hold them to whirl

/** Where their hands are held, posed and whirling: out low and wide to the sides, a little forward (from the shoulder, along the chest), the arms rounded, the elbows lifted out and back. */
const OPEN0 = {
  // (hers: her hands at her sides holding her skirt out a little, as she will hold it whirling)
  lady: { l: [3.0, 4.6, -18.0] as V3, r: [3.0, -4.6, -18.0] as V3, el: [-0.25, 1, -0.35] as V3, er: [-0.25, -1, -0.35] as V3 },
  // (his: the left hand behind his back, at his waist; the right held out low before him, as if to offer it)
  gent: { l: [-7.8, -3.2, -17.0] as V3, r: [7.5, -8.5, -12.5] as V3, el: [-0.7, 1, -0.1] as V3, er: [-0.05, -1, -0.6] as V3 },
};
function openOf(who: DancerWho): { l: V3; r: V3; le: number; re: number } {
  const B = bodyOf(who);
  const o = OPEN0[who];
  const e = elbowsTo(B, standing(B), handsC(o.l, o.r, 0, 0), o.el, o.er);
  return { l: o.l, r: o.r, le: e.le as number, re: e.re as number };
}
export const OPEN = { lady: openOf('lady'), gent: openOf('gent') };
/** Their rest, posed: upright, the chin up, the arms open; weight on the right foot, the left at its side. */
function restOf(who: DancerWho): Bones {
  const B = bodyOf(who);
  const o = OPEN[who];
  return {
    ...standing(B),
    pz: -0.6, pitch: -2, bend: -3, roll: 0, side: 0, faceUp: 6, faceTilt: who === 'lady' ? 6 : -4, faceTurn: 0,
    ...handsC(o.l, o.r, o.le, o.re),
    ...footOn(B, 'R', { at: [B.ball * 0.95, -2.4], turn: -4, pitch: 22 }),
    ...footOn(B, 'L', { at: [B.ball * 0.95 + 1.2, 2.6], turn: 6, pitch: 22 }),
    lk: 6, rk: -6,
    out: 0,
  } as Bones;
}
export const LADY_POSE = restOf('lady');
export const GENT_POSE = restOf('gent');
const restFor = (who: DancerWho): Bones => (who === 'lady' ? LADY_POSE : GENT_POSE);

export const DN_STAND = { frames: 24, fps: 10 } as const;
const STAND_LONG = DN_STAND.frames / DN_STAND.fps;
function standPose(who: DancerWho): (t: number) => P {
  const R = restFor(who);
  return (t) => {
    const a = (t / STAND_LONG) * Math.PI * 2;
    return {
      pz: R.pz + 0.8 * Math.sin(a),
      py: 1.3 * Math.sin(a + 0.6),
      roll: R.roll + 1.8 * Math.sin(a + 0.6),
      side: R.side + 1.2 * Math.sin(a + 0.6),
      bend: R.bend - 1.6 * Math.sin(a),
      faceTurn: R.faceTurn + 12 * Math.sin(a + 0.4),
      faceTilt: R.faceTilt + 3 * Math.sin(a * 2),
      faceUp: R.faceUp + 2 * Math.sin(a * 2 + 1),
      lhz: R.lhz + 0.8 * Math.sin(a + 0.8), lhx: R.lhx + 0.6 * Math.sin(a + 1.4),
      rhz: R.rhz + 0.8 * Math.sin(a + 0.3), rhx: R.rhx + 0.6 * Math.sin(a + 2.0),
    };
  };
}

// =============================================================================================
// THE WHIRL (their walk): gliding fast at you, whirling, three turns a second

/** Their speed whirling at you, tiles a second (the knight goes 4.6; the Princess glides at 4, the wolves run at 3). */
export const DN_PACE = 3.4;
/** The whirl: a loop of a second, 24 frames; three whole turns in it, a step every half turn. */
export const DN_WHIRL = { frames: 24, fps: 24, turns: 3 } as const;
const WHIRL_LONG = DN_WHIRL.frames / DN_WHIRL.fps;
/** The moments the whirl comes round to face you again, as it set off (a turn's start): where the game may stop it, or begin the spin. */
export const WHIRL_ROUND = Array.from({ length: DN_WHIRL.turns }, (_, k) => (k * WHIRL_LONG) / DN_WHIRL.turns);
/** The way they turn, whirling and spinning: to their right (seen from above, the way of a clock's hands). */
const TURN = -1;
/** How far round the whirl has turned them `t` seconds in (degrees, to their left). */
const whirlYaw = (t: number): number => TURN * 360 * DN_WHIRL.turns * (t / WHIRL_LONG);
/** THE SPOT: the head held to look at you while the body turns away, whipped round as it must (a dancer's spotting); `chest` is how the chest is turned. */
function spotted(chest: number, look = 0): number {
  // (the face kept on `look` as long as the neck allows it, then whipped round in a single frame to the other side)
  let rel = look - chest;
  rel -= 360 * Math.round(rel / 360);
  const lim = 80;
  const r = Math.max(-lim, Math.min(lim, rel));
  return chest + r;
}
function whirlPose(who: DancerWho): (t: number) => P {
  const R = restFor(who);
  const o = OPEN[who];
  return (t) => {
    const yaw = whirlYaw(t);
    const step = (t / WHIRL_LONG) * DN_WHIRL.turns * 2 * Math.PI * 2;
    const twist = -12;
    return {
      px: 0, py: 0, pz: R.pz - 1.6 + 1.0 * Math.cos(step), yaw, twist, pitch: 9, roll: 0, bend: 3, side: 0,
      faceTurn: spotted(yaw + twist), faceUp: 4, faceTilt: 0,
      ...handsC(o.l, o.r, o.le, o.re),
    };
  };
}
/** Their feet whirling: six steps in the loop, each on the ball of the foot, turning half round on it as the body goes over it. */
function whirlFeet(who: DancerWho): (t: number) => P {
  const B = bodyOf(who);
  const T = WHIRL_LONG;
  const n = DN_WHIRL.turns * 2;
  const stances: Stance[] = [];
  for (let k = 0; k < n; k++) {
    const mid = (k / n) * T;
    const side = k % 2 === 0 ? 'R' : 'L';
    const half = 0.1;
    const yaw0 = whirlYaw(mid - half);
    const yaw1 = whirlYaw(mid + half);
    // (each foot lands a little to its own side of the line they come along)
    stances.push({ side, t0: mid - half, t1: mid + half, at: [B.ball * 0.6, side === 'R' ? -2.4 : 2.4], turn0: yaw0 + (side === 'R' ? -6 : 6), turn1: yaw1 + (side === 'R' ? -6 : 6), pitch: 26, follow: true });
  }
  return feetOf(B, stances, { period: T, carry: DN_PACE * TILE3, lift: 4.5, knee: { L: 8, R: -8 }, flightPitch: 34, yawOf: whirlYaw });
}

// =============================================================================================
// THE WALTZ: in pairs, in hold, turning round each other once a second, six steps to the turn, drifting round the room

/** How fast a waltzing pair drifts round the room (tiles a second), carried on by the game as they turn. */
export const WALTZ_PACE = 1.2;
/** The waltz: a loop of a second (the whirl's own frames: 24 at 24 a second), one whole turn of the pair, six steps. */
const WALTZ_LONG = WHIRL_LONG;
/** The pair at the waltz's first frame: the way he faces (degrees to the left of the way they drift; she faces him). */
export const WALTZ_FROM = 100;
/** Each of them from the pair's middle: half the way between them, along his facing; and each to their own left. */
const HOLD = { apart: 6.6, aside: 2.4 } as const;
/** The pair's turn `t` seconds in (degrees: the way he faces). */
const pairTurn = (t: number): number => WALTZ_FROM + TURN * 360 * (t / WALTZ_LONG);
/** Where one of the pair is, on the floor about the pair's middle, `turn` the pair's turn; and the way they face. */
function inPair(who: DancerWho, turn: number): { at: [number, number]; yaw: number } {
  const me: [number, number] = who === 'gent' ? [-HOLD.apart, HOLD.aside] : [HOLD.apart, -HOLD.aside];
  return { at: rot(me, turn), yaw: who === 'gent' ? turn : turn + 180 };
}
/**
 * THE HOLD, in the pair's own place (forward: the way he faces; left: his left): his left hand and her right joined high
 * out to his left; his right hand on her back below her left shoulder blade; her left hand on his right shoulder (these two
 * laid on the other's own body as it is at the moment: `holdAt`). And which way each elbow points.
 */
const JOINED: V3 = [0.4, HOLD.aside + 15.4, 45.4];
const HOLD_EL = { gent: { l: [0.2, 0.7, -0.6] as V3, r: [0.05, -1, 0.1] as V3 }, lady: { l: [0.3, -0.9, 0.2] as V3, r: [0.1, 0.8, -0.6] as V3 } };
/** One of the pair, all but the hands, at the pair's turn `turn`, the pair's middle at `mid` on the floor (the figure's own place). */
function waltzSpine(who: DancerWho, turn: number, mid: readonly [number, number], beat: number): P {
  const R = restFor(who);
  const me = inPair(who, turn);
  // (the rise and fall of the waltz: down on the first beat of each bar, up on the second and third)
  const rise = -1.2 + 1.4 * smooth(0, 0.5, beat) * (1 - smooth(0.85, 1, beat));
  return {
    px: me.at[0] + mid[0], py: me.at[1] + mid[1], pz: R.pz + rise - 0.6,
    yaw: me.yaw, twist: who === 'lady' ? 6 : -4, pitch: who === 'lady' ? -3 : 1, bend: who === 'lady' ? -7 : -2, roll: 0, side: who === 'lady' ? -3 : 0,
    // (she looks away over her left shoulder, her head back; he looks over her right shoulder)
    faceTurn: me.yaw + (who === 'lady' ? 38 : 16), faceUp: who === 'lady' ? 10 : 4, faceTilt: who === 'lady' ? -8 : 2,
  };
}
const other = (who: DancerWho): DancerWho => (who === 'lady' ? 'gent' : 'lady');
/** Their hands in hold on their partner as the partner is (`them`, the partner's bones), the pair turned `turn`, its middle at `mid`. */
function holdAt(who: DancerWho, spine: P, them: Skeleton, turn: number, mid: readonly [number, number]): P {
  const B = bodyOf(who);
  const R = restFor(who);
  const r = rot([JOINED[0], JOINED[1]], turn);
  const joined: V3 = [r[0] + mid[0], r[1] + mid[1], JOINED[2]];
  let onThem: V3;
  if (who === 'gent') {
    // (his right hand on her back, below her left shoulder blade: on the skin of her, a glove's thickness out)
    const T = bodyOf('lady');
    const c = lerp3(them.ribs, them.neck, 0.22);
    const [cf, cl, cu] = them.chest;
    const d: V3 = [-0.45, 0.9, -0.1];
    const h: V3 = [T.ribDeep + 1.4, T.ribHalf + 1.4, 6];
    const k = 1 / Math.hypot(d[0] / h[0], d[1] / h[1], d[2] / h[2]);
    const dirW = norm(add(add(mul(cf, d[0]), mul(cl, d[1])), mul(cu, d[2])));
    onThem = add(c, mul(dirW, k * Math.hypot(d[0], d[1], d[2]) + 1.4));
  } else {
    // (her left hand on the top of his right shoulder)
    const T = bodyOf('gent');
    onThem = add(add(them.shoulderR, mul(them.chest[2], T.armR[0] * 1.25 + 1.3)), mul(them.chest[0], 0.4));
  }
  const pose: P = { ...spine, ...handsF(who === 'gent' ? joined : onThem, who === 'gent' ? onThem : joined) };
  const el = HOLD_EL[who];
  return elbowsTo(B, R, pose, rot3(el.l, turn), rot3(el.r, turn));
}
/** One of the pair at the pair's turn `turn`, the pair's middle at `mid`, a beat into its bar: in hold on the other. */
function waltzBody(who: DancerWho, turn: number, mid: readonly [number, number], beat: number): P {
  const o = other(who);
  const them = solve(bodyOf(o), { ...restFor(o), ...waltzSpine(o, turn, mid, beat) } as Posed);
  return holdAt(who, waltzSpine(who, turn, mid, beat), them, turn, mid);
}
/** Their steps waltzing: six in the turn, each on the ball of the foot, turning on it as the pair turns, the feet landing about where they will be as the body comes over them. */
function waltzStances(who: DancerWho, from: number, to: number): Stance[] {
  const n = 6;
  const T = WALTZ_LONG;
  const out: Stance[] = [];
  for (let k = Math.floor((from / T) * n) - 1; k <= Math.ceil((to / T) * n) + 1; k++) {
    const mid = (k / n) * T + T / (2 * n);
    const half = 0.12;
    // (he leads off on his right foot; she on her left)
    const side: 'L' | 'R' = (k % 2 === 0) === (who === 'gent') ? 'R' : 'L';
    const me = inPair(who, pairTurn(mid));
    const yawMid = me.yaw;
    // (the third step of each bar closes the feet together; the others are a stride's width)
    const wide = k % 3 === 2 ? 1.6 : 3.2;
    const off = rot([1.2, side === 'L' ? wide : -wide], yawMid);
    // (where the body will be at the middle of the step, on the floor as it is then: the pair carried on meanwhile)
    const at: [number, number] = [me.at[0] + off[0], me.at[1] + off[1]];
    out.push({ side, t0: mid - half, t1: mid + half, at, turn0: inPair(who, pairTurn(mid - half)).yaw + (side === 'L' ? 8 : -8), turn1: inPair(who, pairTurn(mid + half)).yaw + (side === 'L' ? 8 : -8), pitch: 20, follow: true });
  }
  return out;
}
function waltzPose(who: DancerWho): (t: number) => P {
  return (t) => {
    const beat = ((t / WALTZ_LONG) * 2) % 1;
    return waltzBody(who, pairTurn(t), [0, 0], beat);
  };
}
function waltzFeet(who: DancerWho): (t: number) => P {
  const B = bodyOf(who);
  const carry = WALTZ_PACE * TILE3;
  // (the stances given on the floor as it is at their middles: told as spots that go back with the floor)
  const st = waltzStances(who, 0, WALTZ_LONG).filter((s) => (s.t0 + s.t1) / 2 >= 0 && (s.t0 + s.t1) / 2 < WALTZ_LONG);
  return feetOf(B, st, { period: WALTZ_LONG, carry, lift: 2.6, knee: { L: 6, R: -6 }, flightPitch: 26, yawOf: (t) => inPair(who, pairTurn(t)).yaw });
}

// =============================================================================================
// THE CHIME: from the waltz's first frame they stop dead; their masks snap round to you; held; then the hold breaks and
// they turn to you, ready to whirl

/** The chime's times: stopped dead by `stop`; the heads round by `look`; held until `go`; turned to you, ready, by `long`. */
export const DN_CHIME = { long: 1.9, stop: 0.06, look: 0.26, go: 1.3 } as const;
/** Where each of the pair stands as the chime ends, from the pair's middle (forward and to the left): the game sets each off from there. */
export function chimeSplit(who: DancerWho): [number, number] {
  return inPair(who, WALTZ_FROM).at;
}
function chimePose(who: DancerWho): (t: number) => P {
  const B = bodyOf(who);
  const R = restFor(who);
  // (stopped dead: the waltz carried a little on as it stops, `ease`; where the pair was going is the game's, no more)
  const tau = (t: number): number => (t < DN_CHIME.stop ? t - (t * t) / (2 * DN_CHIME.stop) : DN_CHIME.stop / 2);
  const ready = whirlPose(who)(0);
  const at = chimeSplit(who);
  const readyS = solve(B, { ...R, ...ready, px: at[0], py: at[1] } as Posed);
  /** Stopped dead, all but the hands: the masks snapped round to you, the body still; she, turned away, twists to look over her shoulder. */
  const stillSpine = (w: DancerWho, t: number): P => {
    const k = tau(t);
    const held = waltzSpine(w, pairTurn(k), [0, 0], ((k / WALTZ_LONG) * 2) % 1);
    const look = smooth(DN_CHIME.stop, DN_CHIME.look, t);
    const me = inPair(w, pairTurn(k));
    let rel = 0 - me.yaw;
    rel -= 360 * Math.round(rel / 360);
    const twist = Math.max(-12, Math.min(12, rel * 0.3));
    const breath = 0.5 * Math.sin(((t - DN_CHIME.look) / 1.0) * Math.PI * 2) * smooth(DN_CHIME.look, DN_CHIME.look + 0.2, t);
    return {
      ...held,
      twist: (held.twist as number) + twist * look,
      faceTurn: (held.faceTurn as number) + (me.yaw + rel - (held.faceTurn as number)) * look,
      faceUp: (held.faceUp as number) * (1 - look) + 2 * look,
      faceTilt: (held.faceTilt as number) * (1 - look),
      pz: (held.pz as number) + breath * 0.6,
      bend: (held.bend as number) - breath,
    };
  };
  const o = other(who);
  return (t) => {
    const k = tau(Math.min(t, DN_CHIME.go));
    const tt = Math.min(t, DN_CHIME.go);
    const them = solve(bodyOf(o), { ...restFor(o), ...stillSpine(o, tt) } as Posed);
    const still = holdAt(who, stillSpine(who, tt), them, pairTurn(k), [0, 0]);
    if (t <= DN_CHIME.go) return still;
    // THE HOLD BREAKS: they let go and turn to you, gathering to whirl: hands to where the whirl holds them, the body round to you
    // (the hands lead: let go and carried out round them, clear of the head, to where the whirl holds them; the body after)
    const uh = smooth(DN_CHIME.go, DN_CHIME.go + 0.42, t);
    const u = smooth(DN_CHIME.go + 0.05, DN_CHIME.long, t);
    const yaw0 = still.yaw as number;
    let dy = 0 - yaw0;
    dy -= 360 * Math.round(dy / 360);
    const yaw = yaw0 + dy * u;
    const outL = rot3([0.5, 0.8, 0.35], yaw);
    const outR = rot3([0.5, -0.8, 0.2], yaw);
    const hl = add(lerp3([still.lhx as number, still.lhy as number, still.lhz as number], readyS.handL, uh), mul(outL, 8 * Math.sin(Math.PI * uh)));
    const hr = add(lerp3([still.rhx as number, still.rhy as number, still.rhz as number], readyS.handR, uh), mul(outR, 4 * Math.sin(Math.PI * uh)));
    const body = mixP(still, { ...ready, px: at[0], py: at[1], yaw: yaw0 + dy, faceTurn: yaw0 + dy }, u, R);
    // (the mask kept on you all the while)
    const p: P = { ...body, yaw, twist: (still.twist as number) * (1 - u) + (ready.twist as number) * u, faceTurn: still.faceTurn as number, faceUp: (still.faceUp as number) * (1 - u) + (ready.faceUp as number) * u, ...handsF(hl, hr) };
    // (the elbows from where the hold had them to where the whirl does, turned with them)
    const h = HOLD_EL[who];
    const k0 = pairTurn(DN_CHIME.stop / 2);
    const op = OPEN0[who];
    const wantL = norm(lerp3(rot3(h.l, k0), rot3(op.el, yaw), uh));
    const wantR = norm(lerp3(rot3(h.r, k0), rot3(op.er, yaw), uh));
    return elbowsTo(B, R, p, wantL, wantR);
  };
}
function chimeFeet(who: DancerWho): (t: number) => P {
  const B = bodyOf(who);
  // (the waltz's own steps, the floor stopped under them where the chime caught them: each foot down where it was)
  const carry = WALTZ_PACE * TILE3;
  const st = waltzStances(who, -0.4, 0.4).map((s): Stance => ({ ...s, at: [s.at[0] + carry * ((s.t0 + s.t1) / 2), s.at[1]] }));
  const stopped = feetOf(B, st, { lift: 2.6, knee: { L: 6, R: -6 }, flightPitch: 26, yawOf: (t) => inPair(who, pairTurn(t)).yaw });
  const frozen = stopped(DN_CHIME.stop / 2);
  // (where they are to be as it ends: the whirl's first frame, where each stands)
  const at = chimeSplit(who);
  const w = whirlFeet(who)(0);
  const ready: P = { ...w, lfx: (w.lfx as number) + at[0], lfy: (w.lfy as number) + at[1], rfx: (w.rfx as number) + at[0], rfy: (w.rfy as number) + at[1] };
  const tau = (t: number): number => (t < DN_CHIME.stop ? t - (t * t) / (2 * DN_CHIME.stop) : DN_CHIME.stop / 2);
  return (t) => {
    if (t <= DN_CHIME.go) return stopped(tau(t));
    // TURNING TO YOU: the right foot lifted round and set down where the whirl begins; then the left lifted round beside it
    const out: P = { ...frozen };
    for (const side of ['R', 'L'] as const) {
      const L = side === 'L';
      const t0 = L ? DN_CHIME.go + 0.22 : DN_CHIME.go;
      const t1 = L ? DN_CHIME.long : DN_CHIME.long - 0.22;
      const u = clamp01((t - t0) / (t1 - t0));
      const g = smooth(0.1, 0.9, u);
      const k = (f: string): [number, number] => [frozen[f as keyof Bones] as number, ready[f as keyof Bones] as number];
      const pre = L ? 'lf' : 'rf';
      const [x0, x1] = k(`${pre}x`);
      const [y0, y1] = k(`${pre}y`);
      const [z0, z1] = k(`${pre}z`);
      const [p0, p1] = k(`${pre}p`);
      const [a0, a1raw] = k(`${pre}t`);
      let a1 = a1raw;
      a1 += 360 * Math.round((a0 - a1) / 360);
      // (up off the floor at once, along only while it is up; the left ends up, as the whirl has it)
      const h = L ? 3.2 * Math.pow(Math.sin((Math.PI / 2) * Math.min(1, u * 2)), 0.6) * (1 - g) : 3.2 * Math.pow(Math.sin(Math.PI * u), 0.6);
      const turn = a0 + (a1 - a0) * g;
      Object.assign(out, L ? { lfx: x0 + (x1 - x0) * g, lfy: y0 + (y1 - y0) * g, lfz: z0 + (z1 - z0) * g + h, lfp: p0 + (p1 - p0) * g, lft: turn, lk: turn + 6 } : { rfx: x0 + (x1 - x0) * g, rfy: y0 + (y1 - y0) * g, rfz: z0 + (z1 - z0) * g + h, rfp: p0 + (p1 - p0) * g, rft: turn, rk: turn - 6 });
    }
    return out;
  };
}

// =============================================================================================
// THE WHIRLING SPIN (their attack): wound up, held; a leaping whirl into you in two frames; a big wind-down

/** How far the spin carries them into you, and the area it strikes round where they land (tiles: its radius). */
export const SPIN = { lunge: 1.25, area: 1.5 } as const;
/** Its times: the wind-up held from `warn[0]` to `warn[1]`; the strike from the last frame of the wind-up to the frame it lands on (two of the game's frames); back to their pose by `long`. */
export const DN_SPIN = { long: 1.8, warn: [0.36, 0.7] as const, strike: [22 / FPS, 24 / FPS] as const, hit: 24 / FPS };
/** How far round they are wound before it (degrees, to their left: away from the way they spin). */
const WOUND = 75;
/** How far round they have turned by the time they land (degrees: the way they spin), and by the time they stop. */
const STRUCK_TURN = WOUND - 360;
const DONE_TURN = -720;
const LUNGE = SPIN.lunge * TILE3;
/** Where they stand once the spin is done: carried on a little past where they landed (the game moves them so far). */
export const SPIN_END = LUNGE + 6.5;
function spinPlan(who: DancerWho): { pose: (t: number) => P; feet: (t: number) => P; yaw: (t: number) => number } {
  const B = bodyOf(who);
  const R = restFor(who);
  const o = OPEN[who];
  const [w0, w1] = DN_SPIN.warn;
  const [s0, s1] = DN_SPIN.strike;
  // THE BODY'S TURN through the spin
  const yawKeys: [number, number][] = [[0, 0], [0.16, WOUND * 0.55], [w0, WOUND], [w1, WOUND + 3], [s0 - 0.001, WOUND - 8]];
  const yawA = track(yawKeys);
  const yawB = track([[s1, STRUCK_TURN], [s1 + 0.15, STRUCK_TURN - 125], [s1 + 0.36, STRUCK_TURN - 270], [1.28, DONE_TURN + 8], [1.46, DONE_TURN], [DN_SPIN.long, DONE_TURN]]);
  const yaw = (t: number): number => (t <= s0 ? yawA(Math.min(t, s0 - 0.001)) : t >= s1 ? yawB(t) : WOUND - 8 + (STRUCK_TURN - (WOUND - 8)) * ((t - s0) / (s1 - s0)));
  // WHERE THE BODY IS: back a little as it winds; carried LUNGE into you in the strike
  const pxA = track([[0, 0], [0.2, -2.0], [w0, -3.2], [w1, -3.4], [s0, -2.6]]);
  const pxB = track([[s1, LUNGE], [s1 + 0.25, LUNGE + 5.5], [0.62 + s1, LUNGE + 6.5], [DN_SPIN.long, LUNGE + 6.5]]);
  const px = (t: number): number => (t <= s0 ? pxA(t) : t >= s1 ? pxB(t) : -2.6 + (LUNGE + 2.6) * ((t - s0) / (s1 - s0)));
  // HOW LOW: crouched in the wind-up; up off the floor in the strike; down into the flourish; back up
  const pzA = track([[0, R.pz], [0.2, R.pz - 5.0], [w0, R.pz - 8.5], [w1, R.pz - 8.8], [s0, R.pz - 8.0]]);
  const pzB = track([[s1, R.pz - 1.0], [s1 + 0.1, R.pz - 2.4], [s1 + 0.3, R.pz - 1.2], [1.25, R.pz - 2.0], [1.4, R.pz - 6.5], [1.55, R.pz - 6.0], [DN_SPIN.long, R.pz]]);
  const pz = (t: number): number => (t <= s0 ? pzA(t) : t >= s1 ? pzB(t) : R.pz - 8.0 + 8 * Math.sin(Math.PI * ((t - s0) / (s1 - s0))) + 7 * ((t - s0) / (s1 - s0)));
  // THE CHEST over the hips: wound further round still in the wind-up (the coil), leading out of it
  // (at the last frame of the wind-up the hips have begun to come round and the chest has not: it is held where it was)
  const twA = track([[0, 0], [0.18, 18], [w0, 34], [w1, 35], [s0 - 0.001, 46]]);
  const twB = track([[s1, -18], [s1 + 0.15, -12], [1.2, -4], [DN_SPIN.long, 0]]);
  const tw = (t: number): number => (t < s0 ? twA(t) : t === s0 ? 46 : t >= s1 ? twB(t) : 46 - 64 * ((t - s0) / (s1 - s0)));
  // THE ARMS: coiled across the body in the wind-up (the left high over the head, the right low across the waist); flung wide in the strike; wide as it slows; a flourish
  const coilE = elbowsTo(B, R, { yaw: WOUND, twist: 34, ...handsC([-3.5, 9.5, 12.5], [9, 8.5, -11], 0, 0) }, rot3([-0.3, 0.8, 0.5], WOUND + 34), rot3([0.1, -0.9, -0.3], WOUND + 34));
  const armsCoil = handsC([-3.5, 9.5, 12.5], [9, 8.5, -11], coilE.le as number, coilE.re as number);
  const armsWide = handsC([0.5, 16.5, -2.5], [0.5, -16.5, -2.5], -16, 16);
  const armsFlourish = handsC([4.5, 13.5, -4.5], [5.5, -9.5, -14], -24, 30);
  const armsOpen = handsC(o.l, o.r, o.le, o.re);
  const armsAt = (t: number): P => {
    if (t <= 0.25) return mixP(armsOpen, armsCoil, smooth(0, 0.25, t), R);
    if (t <= s0) {
      // (held, trembling with what is wound in them)
      const k = Math.sin(t * 70) * 0.35 * smooth(w0 - 0.05, w0 + 0.05, t);
      return { ...armsCoil, lhz: (armsCoil.lhz as number) + k, rhx: (armsCoil.rhx as number) - k };
    }
    if (t < s1) return mixP(armsCoil, armsWide, (t - s0) / (s1 - s0), R);
    if (t <= 1.15) return mixP(armsWide, armsFlourish, smooth(s1 + 0.1, 1.15, t), R);
    if (t <= 1.5) return armsFlourish;
    return mixP(armsFlourish, armsOpen, smooth(1.5, DN_SPIN.long, t), R);
  };
  const pose = (t: number): P => {
    const y = yaw(t);
    const twist = tw(t);
    // (the mask kept on you: through the wind-up it looks back at you over the shoulder; whirling, it spots)
    const face = t < s1 ? Math.max(y + twist - 88, Math.min(y + twist + 88, 0)) : spotted(y + twist, 0);
    const bow = smooth(1.2, 1.4, t) * (1 - smooth(1.55, DN_SPIN.long, t));
    return {
      px: px(t), py: 0, pz: pz(t), yaw: y, twist,
      pitch: t <= s0 ? 9 * smooth(0, 0.3, t) : t < s1 ? 5 : 6 * (1 - smooth(s1, 1.2, t)) + 10 * bow,
      bend: t <= s0 ? 14 * smooth(0, w0, t) : t < s1 ? 3 : 4 * (1 - smooth(s1, 1.2, t)) + 12 * bow - 3 * (1 - bow) * smooth(1.2, 1.3, t),
      roll: t <= s0 ? -4 * smooth(0, w0, t) : 0, side: t <= s0 ? -12 * smooth(0, w0, t) : 0,
      faceTurn: face, faceUp: t < s1 ? 2 : 4 - 18 * bow, faceTilt: t < s1 ? -4 : 6 * bow,
      ...armsAt(t),
    };
  };
  // THE FEET: the right steps back and they crouch on it; springing off both, through the air, landing on the left; turning
  // on its ball as they slow, the right set down behind; the flourish; back together
  const L0 = footOn(B, 'L', { at: [B.ball * 0.95 + 1.2, 2.6], turn: 6, pitch: 22 });
  const R0f = footOn(B, 'R', { at: [B.ball * 0.95, -2.4], turn: -4, pitch: 22 });
  void L0;
  void R0f;
  const stances: Stance[] = [
    // the left: where it stands, turning on its ball as they wind round
    { side: 'L', t0: -1, t1: 0.0, at: [B.ball * 0.95 + 1.2, 2.6], turn0: 6, turn1: 6, pitch: 22 },
    { side: 'L', t0: 0.0, t1: s0, at: [B.ball * 0.95 + 1.2, 2.6], turn0: 6, turn1: WOUND * 0.7, pitch: 22, follow: true },
    // (landing on it, its ball, LUNGE on; turning on it as they slow)
    { side: 'L', t0: s1, t1: 1.14, at: [LUNGE + 3.0, 1.0], turn0: STRUCK_TURN + 10, turn1: DONE_TURN + 8, pitch: 26, follow: true },
    { side: 'L', t0: 1.62, t1: 9, at: [SPIN_END + B.ball * 0.95 + 1.2, 2.6], turn0: DONE_TURN + 6, turn1: DONE_TURN + 6, pitch: 22 },
    // the right: back and out as they wind, down on it through the warning
    { side: 'R', t0: -1, t1: 0.04, at: [B.ball * 0.95, -2.4], turn0: -4, turn1: -4, pitch: 22 },
    { side: 'R', t0: 0.2, t1: s0, at: [-6.5, -6.0], turn0: 40, turn1: WOUND * 0.8, pitch: 16, follow: true },
    // (set down behind as they slow, into the flourish)
    { side: 'R', t0: 1.2, t1: 1.5, at: [SPIN_END - 6.5, -3.8], turn0: DONE_TURN - 30, turn1: DONE_TURN - 30, pitch: 30 },
    { side: 'R', t0: 1.66, t1: 9, at: [SPIN_END + B.ball * 0.95, -2.4], turn0: DONE_TURN - 4, turn1: DONE_TURN - 4, pitch: 22 },
  ];
  const feet = feetOf(B, stances, { lift: 4, knee: { L: 8, R: -8 }, flightPitch: 30, yawOf: yaw });
  return { pose, feet, yaw };
}

// =============================================================================================
// STRUCK, AND THEIR DEATH

export const DN_REEL = 0.4;
function reelPose(who: DancerWho): (t: number) => P {
  const R = restFor(who);
  const o = OPEN[who];
  const jolt: P = { px: -3.2, pz: R.pz + 0.6, yaw: 26, twist: 10, pitch: -8, bend: -10, faceUp: R.faceUp + 26, faceTilt: R.faceTilt + 12, faceTurn: 30, ...handsC([-1, 15, 6], [1, -16, 3], -40, 40) };
  const back = track([[0, 0], [0.06, 1], [0.16, 0.55], [DN_REEL, 0]]);
  return (t) => mixP(handsC(o.l, o.r, o.le, o.re), jolt, back(t), R);
}

/** Their death's times: the jolt; the mask drops (`mask`); the Hush pours out (`leaves`); sinking in a bow to the knees (`knees`); still by `still`. */
export const DN_DIES = { long: 2.6, mask: 0.3, leaves: [0.32, 1.5] as const, knees: 1.7, still: 2.25 } as const;
function diesPlan(who: DancerWho): { pose: (t: number) => P; feet: (t: number) => P } {
  const B = bodyOf(who);
  const R = restFor(who);
  const o = OPEN[who];
  const TUCK = 52;
  const KNEE_Z = B.legR[1] * 1.3;
  // (on their knees at the end: her right foot drawn back behind the left as in a curtsey; his the same, one knee then both)
  const kneelFeet: Record<'L' | 'R', Plant> = { L: { at: [-9.5, 3.4], turn: 4, pitch: TUCK }, R: { at: [-11.5, -3.6], turn: -6, pitch: TUCK } };
  const kneel = (lean: number, body: P): P => ({ ...kneelHips(B, R, kneelFeet, TUCK, KNEE_Z, lean), ...body });
  // THE BOW: hers a curtsey sinking right down, her arms out low; his a courtly bow, his right hand on his heart, his left swept out
  const bowArms = who === 'lady' ? handsC([5, 13, -14], [5, -13, -14], -20, 20) : handsC([1, 14, -12], [9.5, 6.5, -3.5], -24, -50);
  const lapArms = handsC([10, -2.5, -16], [10, 2.5, -16], -14, 14);
  const open = handsC(o.l, o.r, o.le, o.re);
  const jolt: P = { px: -2.8, pz: R.pz + 0.4, yaw: 18, twist: 8, pitch: -8, bend: -9, faceUp: R.faceUp + 34, faceTurn: 16, faceTilt: 8, ...handsC([-1, 15, 4], [1, -15, 2], -40, 40) };
  const up = (t: number, a: number, b: number): number => smooth(a, b, t);
  const K0 = kneel(6, { pitch: 4, bend: 16, faceUp: -26, faceTurn: 0, faceTilt: 6, yaw: 0, twist: 0, ...bowArms });
  const K1 = kneel(-30, { pitch: 2, bend: 18, faceUp: -34, faceTurn: 4, faceTilt: 10, yaw: 0, twist: 0, ...lapArms });
  const pose = (t: number): P => {
    if (t <= 0.1) return mixP(open, jolt, smooth(0, 0.1, t), R);
    if (t <= 0.5) {
      // (the head thrown back as the mask comes away; then the Hush leaving: a gasp, the chest lifting)
      const k = up(t, 0.1, 0.5);
      return mixP(jolt, { px: -2.0, pz: R.pz + 0.8, yaw: 6, twist: 2, pitch: -6, bend: -12, faceUp: 30, faceTurn: 4, faceTilt: 4, ...handsC([2, 13, -6], [2, -13, -6], -30, 30) }, k, R);
    }
    if (t <= 1.0) {
      // (into the bow, still standing: bent forward from the hips, the arms out low)
      const k = up(t, 0.5, 1.0);
      return mixP({ px: -2.0, pz: R.pz + 0.8, yaw: 6, twist: 2, pitch: -6, bend: -12, faceUp: 30, faceTurn: 4, faceTilt: 4, ...handsC([2, 13, -6], [2, -13, -6], -30, 30) }, { px: -1.0, pz: R.pz - 4, yaw: 0, twist: 0, pitch: 8, bend: 18, faceUp: -20, faceTurn: 0, faceTilt: 4, ...bowArms }, k, R);
    }
    if (t <= DN_DIES.knees) {
      // (sinking down, the bow held, to the knees)
      const k = up(t, 1.0, DN_DIES.knees);
      return mixP({ px: -1.0, pz: R.pz - 4, yaw: 0, twist: 0, pitch: 8, bend: 18, faceUp: -20, faceTurn: 0, faceTilt: 4, ...bowArms }, K0, k, R);
    }
    // (and settling back onto the heels, the head bowed, the hands in the lap: still)
    return mixP(K0, K1, up(t, DN_DIES.knees, DN_DIES.still), R);
  };
  const stances: Stance[] = [
    { side: 'L', t0: -1, t1: 0.95, at: [B.ball * 0.95 + 1.2, 2.6], turn0: 6, turn1: 6, pitch: 22 },
    { side: 'L', t0: 1.45, t1: 9, at: [kneelFeet.L.at[0], kneelFeet.L.at[1]], turn0: kneelFeet.L.turn, turn1: kneelFeet.L.turn, pitch: TUCK },
    { side: 'R', t0: -1, t1: 0.55, at: [B.ball * 0.95, -2.4], turn0: -4, turn1: -4, pitch: 22 },
    { side: 'R', t0: 0.85, t1: 9, at: [kneelFeet.R.at[0], kneelFeet.R.at[1]], turn0: kneelFeet.R.turn, turn1: kneelFeet.R.turn, pitch: TUCK },
  ];
  const feetRaw = feetOf(B, stances, { lift: 3 });
  // (on the knees, the knees as the kneeling has them)
  const feet = (t: number): P => {
    const f = feetRaw(t);
    if (t >= DN_DIES.knees) return { ...f, ...pick(kneel(0, {}), ['lk', 'lkUp', 'rk', 'rkUp']) };
    return f;
  };
  return { pose, feet };
}
/** The Hush's own greys (art/crier.ts HUSH, its lighter two). */
const HUSH_GREY = ['#625a7a', '#9890b4'] as const;
const pick = (p: P, keys: ReadonlyArray<keyof Bones>): P => Object.fromEntries(keys.filter((k) => p[k] !== undefined).map((k) => [k, p[k]])) as P;

// =============================================================================================
// THEM, AS THE GAME HOLDS A MONSTER

export const DN_NAMES = {
  stand: 'The dancer poses',
  walk: 'The whirl',
  attack: 'The whirling spin',
  reel: 'The dancer is struck',
  dying: 'The mask drops',
  waltz: 'The waltz',
  chime: 'The chime',
} as const;
const byName: Record<string, string> = Object.fromEntries(Object.entries(DN_NAMES).map(([k, v]) => [v, k]));

/** Each of their moves as a pose and feet through time, by who they are. */
interface Plans {
  pose: Record<string, (t: number) => P>;
  feet: Record<string, ((t: number) => P) | undefined>;
  yaw: Record<string, (t: number) => number>;
}
const PLANS: Record<DancerWho, Plans> = { lady: plansOf('lady'), gent: plansOf('gent') };
function plansOf(who: DancerWho): Plans {
  const spin = spinPlan(who);
  const dies = diesPlan(who);
  const pose: Record<string, (t: number) => P> = {
    stand: standPose(who),
    walk: whirlPose(who),
    waltz: waltzPose(who),
    chime: chimePose(who),
    attack: spin.pose,
    reel: reelPose(who),
    dying: dies.pose,
  };
  const feet: Record<string, ((t: number) => P) | undefined> = { walk: whirlFeet(who), waltz: waltzFeet(who), chime: chimeFeet(who), attack: spin.feet, dying: dies.feet };
  const yaw: Record<string, (t: number) => number> = {};
  for (const k of Object.keys(pose)) yaw[k] = (t) => ((pose[k](t).yaw as number | undefined) ?? 0) + ((pose[k](t).twist as number | undefined) ?? 0) * 0.5;
  yaw.attack = spin.yaw;
  return { pose, feet, yaw };
}
/** How fast one is turning about themselves at a moment of a move (turns a second, to the left). */
export function spinOf(who: DancerWho, move: string, t: number): number {
  const y = PLANS[who].yaw[move];
  if (!y) return 0;
  const [s0, s1] = DN_SPIN.strike;
  // (through the strike: as fast as it turns in it)
  if (move === 'attack' && t > s0 - 1e-6 && t <= s1 + FR + 1e-6) return (STRUCK_TURN - WOUND) / 360 / (s1 - s0);
  const h = 1 / 60;
  return (y(t + h) - y(t - h)) / (2 * h) / 360;
}

/** The strike, by move: from the last frame of the wind-up to the frame it lands on. */
export const DN_STRIKES: Readonly<Record<string, readonly [number, number]>> = { attack: DN_SPIN.strike };
/** Whether a frame of a move shows its strike's smear: from the frame after its wind-up ends to the frame after it lands (thinning then). */
export function smearedAt(move: string, t: number): boolean {
  const s = DN_STRIKES[move];
  return !!s && t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6;
}

const bonesOf = (who: DancerWho, move: string, t: number): Skeleton => {
  const f = PLANS[who].feet[move];
  return solve(bodyOf(who), { ...restFor(who), ...PLANS[who].pose[move](t), ...(f ? f(t) : {}) } as Posed);
};
/**
 * THE SMEAR of the whirling spin: after-images of the arms flung round and of the hem of the skirt (or the coat's) along
 * the way they came in the strike; and the whirl of their going round the area it strikes, the wind of it all round.
 */
function smearOf(who: DancerWho, t: number): V3[][] | null {
  if (!smearedAt('attack', t)) return null;
  const [s0, s1] = DN_SPIN.strike;
  const to = Math.min(t, s1);
  const out: V3[][] = [];
  // (the whirl of their going: streaks spiralling out round the way they came, as far as they have turned, the outermost
  // reaching the edge of what it strikes, `SPIN.area` tiles round where they land)
  const k1 = (to - s0) / (s1 - s0);
  const R = SPIN.area * TILE3;
  for (let j = 0; j < 7; j++) {
    const arc: V3[] = [];
    const start = WOUND + 180 + j * 51;
    const span = (STRUCK_TURN - WOUND) * k1 * (0.45 + 0.07 * j);
    const steps = Math.max(3, Math.ceil(Math.abs(span) / 7));
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const a = (start + span * u) * D;
      const r = R * (0.32 + 0.1 * j) * (0.55 + 0.45 * u) + 2;
      const cx = -2.6 + (LUNGE + 2.6) * k1 * (0.5 + 0.5 * u);
      arc.push([cx + Math.cos(a) * Math.min(R, r), Math.sin(a) * Math.min(R, r), 2 + (j % 3) * 7 + 4 * u]);
    }
    out.push(arc);
  }
  const n = 6;
  for (let i = 0; i <= n; i++) {
    const u = s0 - FR * 0.5 + ((to - (s0 - FR * 0.5)) * i) / n;
    const s = bonesOf(who, 'attack', u);
    out.push([s.elbowR, s.handR], [s.elbowL, s.handL]);
    // (the hem flung out, round them)
    const hem: V3[] = [];
    const yaw = PLANS[who].yaw.attack(u);
    const r = who === 'lady' ? 26 : 20;
    for (let j = 0; j <= 8; j++) {
      const a = (yaw + 140 + j * 10) * D;
      hem.push([s.pelvis[0] + Math.cos(a) * r, s.pelvis[1] + Math.sin(a) * r, who === 'lady' ? 12 : 20]);
    }
    out.push(hem);
  }
  return t > s1 + 1e-6 ? out.slice(Math.floor(out.length / 2)) : out;
}
/** WHAT IS LAID AFTER THEIR EDGE in their moves: the eyes' pink glints at the fingertips through the warning; the grey breath whipped round them in the strike. */
function moreOf(who: DancerWho, move: string, m: Moment): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const t = m.t;
  if (move === 'attack') {
    const [w0, w1] = DN_SPIN.warn;
    if (t >= w0 - 0.08 && t <= w1 + 0.03) {
      const tick = Math.floor(t * 15);
      for (const [i, p] of [m.s.handL, m.s.handR].entries()) if ((i + tick) % 2 === 0) out.push([add(p, [0, 0, 1.2]), tick % 2 ? FLAME[3] : FLAME[2], 1]);
    }
    const [s0, s1] = DN_SPIN.strike;
    if (t > s0 && t < s1 + 0.3) {
      // THE HUSH WHIPPED ROUND: their grey breath flung out in a spiral round where they land, thinning
      const k = clamp01((t - s0) / (s1 + 0.3 - s0));
      for (let i = 0; i < 36; i++) {
        const own = hash(i, 3, 7711);
        if (own < k * 0.9) continue;
        const a = (i / 36) * Math.PI * 2 + k * 4;
        const r = (10 + 40 * k) * (0.7 + 0.5 * hash(i, 4, 7711));
        out.push([[LUNGE + Math.cos(a) * r, Math.sin(a) * r, 6 + 22 * hash(i, 5, 7711) * (1 - k * 0.5)], own > 0.6 ? HUSH_GREY[1] : HUSH_GREY[0], k < 0.5 ? 2 : 1]);
      }
    }
  }
  void who;
  return out;
}

function sayOf(who: DancerWho, room: Room): DancerSay {
  const name = (m: Moment): string => byName[m.move ?? ''] ?? '';
  return {
    room,
    spin: (m) => spinOf(who, name(m), m.t),
    smear: (m) => (name(m) === 'attack' ? smearOf(who, m.t) : null),
    more: (m) => moreOf(who, name(m), m),
    burn: (m) => (name(m) === 'attack' ? smooth(DN_SPIN.warn[0] - 0.12, DN_SPIN.warn[0], m.t) * (1 - smooth(DN_SPIN.hit, DN_SPIN.hit + 0.15, m.t)) : 0),
    freed: (m) => !!m.dying && m.t >= DN_DIES.mask,
    puff: (m) => (name(m) === 'attack' && m.t < DN_SPIN.hit + 0.1 ? 0.8 + 1.0 * smooth(0.1, DN_SPIN.warn[0], m.t) : name(m) === 'walk' ? 1.1 : 0.8),
    leaving: DN_DIES.leaves,
  };
}

function dancerMob(who: DancerWho, roomName: RoomName): Mob {
  const room = ROOMS[roomName];
  const paint = dancerPainter(who, sayOf(who, room));
  const R = restFor(who);
  const plans = PLANS[who];
  const mv = (key: keyof typeof DN_NAMES, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name: DN_NAMES[key], motion, rest: R, ...(plans.feet[key] ? { feet: plans.feet[key] } : {}), ...more });
  return {
    id: `dancer-${who}-${roomName}`,
    name: who === 'lady' ? `A masked lady (${roomName})` : `A masked gentleman (${roomName})`,
    size: "small: the knight's height",
    build: bodyOf(who),
    stand: mv('stand', { ...sampled(STAND_LONG, DN_STAND.fps * 2, plans.pose.stand), loop: 0 }),
    attack: mv('attack', sampled(DN_SPIN.long, FPS, plans.pose.attack, { hit: DN_SPIN.hit })),
    idleFrames: DN_STAND.frames,
    idleFps: DN_STAND.fps,
    walk: mv('walk', { ...sampled(WHIRL_LONG, DN_WHIRL.fps * 2, plans.pose.walk), loop: 0 }, { period: WHIRL_LONG / DN_WHIRL.turns, ground: DN_PACE * TILE3 }),
    walkFrames: DN_WHIRL.frames,
    walkFps: DN_WHIRL.fps,
    pace: DN_PACE,
    reel: mv('reel', sampled(DN_REEL, FPS, plans.pose.reel)),
    reelTime: DN_REEL,
    hit: DN_SPIN.hit,
    warn: DN_SPIN.warn[1] - DN_SPIN.warn[0],
    dieTime: DN_DIES.long,
    dying: mv('dying', sampled(DN_DIES.long, FPS, plans.pose.dying)),
    more: {
      waltz: mv('waltz', { ...sampled(WALTZ_LONG, DN_WHIRL.fps * 2, plans.pose.waltz), loop: 0 }, { period: WALTZ_LONG / 2, ground: WALTZ_PACE * TILE3 }),
      chime: mv('chime', sampled(DN_CHIME.long, FPS, plans.pose.chime)),
    },
    aura: { x: DANCER_CANVAS.ax, y: DANCER_CANVAS.ay - 40, r: 34, color: '#9890b4', a: 0.06 },
    shadow: 11,
    canvas: DANCER_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    // (the mask, and the ribbon that tied it, drop from the face as they die and fall to the floor before them, face up)
    fall(piece) {
      if (piece !== 'mask') return null;
      const s = bonesOf(who, 'dying', DN_DIES.mask);
      return { from: DN_DIES.mask, to: [30, -44], spin: 30, lay: 'flat', up: s.face[0], hop: 1.2 };
    },
  };
}
/** Every dancer: a lady and a gentleman in each room's colours. */
export const DANCERS: Readonly<Record<DancerWho, Readonly<Record<RoomName, Mob>>>> = {
  lady: Object.fromEntries((Object.keys(ROOMS) as RoomName[]).map((r) => [r, dancerMob('lady', r)])) as Record<RoomName, Mob>,
  gent: Object.fromEntries((Object.keys(ROOMS) as RoomName[]).map((r) => [r, dancerMob('gent', r)])) as Record<RoomName, Mob>,
};
/** The two the checks run on (their bones are the same in every room's colours). */
export const DANCER_LADY = DANCERS.lady.violet;
export const DANCER_GENT = DANCERS.gent.blue;
export function makeDancerArt3(mob: Mob = DANCER_LADY, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// =============================================================================================
// A PAIR AS ONE PICTURE: a lady and a gentleman at one spot, the same move at the same moment (the waltz, the chime), painted
// together so that each is in front of the other where they truly are

export function pairPainted(lady: Mob, gent: Mob, move: 'waltz' | 'chime', t: number, view: GameView): Painted {
  const can = canvasOf(gent);
  const st = stage(paintViewOf(gent, view), can.ax, can.ay, can);
  const bits: Bit[] = [];
  const grains: (readonly [V3, string, number])[] = [];
  for (const [mob, tag] of [[lady, 'L'], [gent, 'G']] as const) {
    const mvv = mob.more?.[move] as MobMove;
    const m = momentOf(mob, mvv, t);
    for (const b of mob.bits(st, m)) bits.push({ ...b, part: `${tag}_${b.part}` });
    grains.push(...(mob.grains?.(st, m) ?? []));
  }
  void partOrder;
  const lights = paintBits(st, bits, [0, 0, 30]);
  const px = st.whole(ENEMY_RIM);
  for (const [p, c, size] of grains) {
    const [x, y] = st.at(p);
    const xi = Math.round(x - size / 2);
    const yi = Math.round(y - size / 2);
    for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, c);
  }
  return { px, lights };
}

// =============================================================================================
// THEM AS THE CHECKS SEE THEM (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function dancerSolids(who: DancerWho): (s: Skeleton) => { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const B = bodyOf(who);
  return (s) => {
    const [rH, rK, rA] = B.legR;
    const [r0, r1] = B.armR;
    const limbs: CheckLimb[] = [];
    for (const side of ['L', 'R'] as const) {
      const L = side === 'L';
      limbs.push(
        { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.1 },
        { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.12 },
        { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.2]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.2]), r: 1.5 },
        { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.15 },
        { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.1 },
      );
    }
    limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 2.0 });
    const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.62));
    const lumps: CheckLump[] = [
      { name: 'head', c: add(s.head, mul(s.face[2], -0.2)), rot: s.face, h: [B.headR[0] * 1.05, B.headR[1] * 1.08, B.headR[2] * 1.02] },
      { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 1.4, B.ribHalf + 1.4, len3(sub(s.neck, s.ribs)) * 0.55] },
      { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 1.4, B.waistHalf + 1.4, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
      { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.2, B.pelvisHalf + 2.0, B.waist * 0.75] },
    ];
    return { limbs, lumps };
  };
}
const ALL_MOVES = ['stand', 'walk', 'attack', 'reel', 'dying', 'waltz', 'chime'];
/** The middle of the whirl: over where they stand, at the height of the skirt and the coat-tails as they fly. */
export const whirlMiddle = (s: Skeleton): V3 => [s.pelvis[0], s.pelvis[1], s.pelvis[2] - 12];
export function dancerShape(who: DancerWho): BossShape {
  return {
    body: dancerSolids(who),
    // (what strikes: the whirl itself, carried into you: its middle, at the height of the skirt as it flies)
    tip: (move, _t, s) => (move === 'attack' ? whirlMiddle(s) : null),
    strikes: DN_STRIKES,
    smeared: smearedAt,
    handovers: [
      ...['attack', 'reel', 'dying'].flatMap((m): Handover[] => (m === 'dying' ? [{ from: 'stand', at: 0, to: m, toAt: 0 }] : [{ from: 'stand', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'stand', toAt: 0, shift: m === 'attack' ? [SPIN_END, 0] : undefined }])),
      // (into the whirl from their pose; and out of it as it comes round to face you, each turn)
      { from: 'stand', at: 0, to: 'walk', toAt: 0 },
      ...WHIRL_ROUND.map((t): Handover => ({ from: 'walk', at: t, to: 'stand', toAt: 0 })),
      ...WHIRL_ROUND.map((t): Handover => ({ from: 'walk', at: t, to: 'attack', toAt: 0 })),
      // (the waltz into the chime as it strikes; into its going, as they notice you; and out of the chime into the whirl, from where each stands)
      { from: 'waltz', at: 'end', to: 'chime', toAt: 0 },
      { from: 'waltz', at: 'end', to: 'chime', toAt: DN_CHIME.go },
      { from: 'chime', at: 'end', to: 'walk', toAt: 0, shift: chimeSplit(who) },
    ],
  };
}
export const DN_SHAPE_LADY = dancerShape('lady');
export const DN_SHAPE_GENT = dancerShape('gent');
void ALL_MOVES;
void LADY_BODY;
void GENT_BODY;
void add;
