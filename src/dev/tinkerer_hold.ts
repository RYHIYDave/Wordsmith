// THE TINKERER'S TAP AND HOLD: SHE SETS HER GOLEM ON (the art chat, 28 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His brief, 23 Oct: “Tap and hold will be “Golem”.  And this is gonna be clockwork Automaton that follows her around and
// attacks.  It will just go around and I guess punch things or whatever but tap+hold will have him do a bigger move.”; its
// bigger move, “Ground pound (Recommended)” (dev/golem_moves.ts groundPound); and 28 Oct, 00:50: “keep working on her and
// the constructs”. Her brief: “Gleeful mad bomber (Recommended)”, “Quick and nimble (Recommended)”.
//
// SO, AS SHE HOLDS: she swings the wrench off her shoulder and points it at them; two fingers in her mouth, a piercing
// whistle (its sound in the friend's cyan); her Golem rears up and she crouches, grinning, eyes on it; as its fist comes
// down she hops for joy, her fist punched up and the wrench brandished; and slings the wrench back onto her shoulder. In
// time with its ground pound: its blow lands as she springs (HOLD.blow), eight frames after she begins (HOLD.lead).

import { solve } from '../art/skeleton';
import type { Bones, Key3, Motion, Posed, V3 } from '../art/skeleton';
import type { GameView } from '../art/skin';
import { CYAN } from '../art/kit';
import type { Drawn } from './sculpt';
import { FR, TINK_B, TSTANCE, drawTinkerAt } from './tinkerer_moves';
import type { TinkMove } from './tinkerer_moves';
import { through } from './brawler_fall';
import { dot } from './brawler_fx';
import { steadied } from './brawler_punches';
import { handAt, hands } from './tinkerer_fall';
import { GP } from './golem_moves';

const B = TINK_B;
const S0 = TSTANCE;

/** Her move through time, in frames: her Golem's ground pound begins `lead` frames after she does. */
export const HOLD = {
  lead: 8,
  point: 8,
  whistle: 12,
  whistled: 21,
  crouch: 30,
  /** Its blow lands (its GP.hit), and she springs. */
  blow: 8 + GP.hit,
  apex: 37,
  landed: 41,
  shoulder: 52,
  end: 8 + GP.end,
};

/** The way the wrench points from her fist (her own space): at them; and brandished up as she cheers. */
const AT_THEM: V3 = [0.9, -0.1, 0.45];
const BRANDISH: V3 = [0.45, -0.45, 0.8];

/** Her legs as she stands (her stance's own). */
const LEGS_0: Partial<Bones> = { lfx: S0.lfx, lfy: S0.lfy, lfz: S0.lfz, lfp: S0.lfp, lft: S0.lft, lk: S0.lk, lkUp: S0.lkUp, rfx: S0.rfx, rfy: S0.rfy, rfz: S0.rfz, rfp: S0.rfp, rft: S0.rft, rk: S0.rk, rkUp: S0.rkUp };

/** Her poses through the move (frame, pose): her body; her hands where they are in her own space; her legs her stance's. */
function keysOf(): [number, Partial<Bones>][] {
  const s0 = solve(B, S0 as Posed);
  const stance = { ...hands(s0.handL, s0.handR, S0.le, S0.re) };
  const R0 = (q: Partial<Bones>): V3 => handAt(q, false, S0.rhx, S0.rhy, S0.rhz);
  // (a dip as she gathers herself)
  const dipQ: Partial<Bones> = { pz: S0.pz - 1.2, bend: S0.bend + 4, faceUp: S0.faceUp - 2 };
  // POINTING THE WRENCH AT THEM, leaning into it
  const pointQ: Partial<Bones> = { pz: S0.pz - 0.6, yaw: S0.yaw + 10, twist: S0.twist + 18, bend: S0.bend + 4, pitch: 4, side: S0.side - 2, faceTurn: -6, faceUp: 4, faceTilt: 0 };
  const pointR = (q: Partial<Bones>): V3 => handAt(q, false, 13, -2, 2);
  // TWO FINGERS IN HER MOUTH: a piercing whistle
  const whistleQ: Partial<Bones> = { ...pointQ, faceUp: 6, faceTurn: -4, faceTilt: -4 };
  const mouthL = (q: Partial<Bones>): V3 => handAt(q, true, 5, -6, 9);
  // CROUCHED, GRINNING, her eyes on it as it rears
  const crouchQ: Partial<Bones> = { pz: S0.pz - 3.2, yaw: S0.yaw + 6, twist: S0.twist + 10, bend: S0.bend + 12, pitch: 6, side: S0.side, faceTurn: -10, faceUp: 10, faceTilt: 6 };
  // SHE SPRINGS FOR JOY: her fist punched up, the wrench brandished
  const upQ: Partial<Bones> = { pz: S0.pz + 3.4, yaw: S0.yaw, twist: S0.twist - 6, bend: S0.bend - 8, pitch: -6, side: S0.side, faceTurn: -10, faceUp: 14, faceTilt: -8 };
  const landQ: Partial<Bones> = { ...upQ, pz: S0.pz - 1.6, bend: S0.bend + 2, pitch: 0, faceUp: 8 };
  return [
    [0, { ...stance }],
    [4, { ...dipQ, ...hands(handAt(dipQ, true, 1, 9, -6), handAt(dipQ, false, 6, -3, 4), 30, 50) }],
    [HOLD.point, { ...pointQ, ...hands(handAt(pointQ, true, 6, 3, -3), pointR(pointQ), 40, 30) }],
    [HOLD.whistle, { ...whistleQ, ...hands(mouthL(whistleQ), pointR(whistleQ), 80, 30) }],
    [HOLD.whistled, { ...whistleQ, pz: S0.pz - 1.0, side: S0.side, faceTilt: 2, ...hands(mouthL({ ...whistleQ, pz: S0.pz - 1.0, side: S0.side, faceTilt: 2 }), pointR(whistleQ), 80, 30) }],
    [HOLD.crouch, { ...crouchQ, ...hands(handAt(crouchQ, true, 7, 8, -8), handAt(crouchQ, false, 9, -6, 3), 25, 35) }],
    [HOLD.blow, { ...crouchQ, pz: S0.pz - 3.6, ...hands(handAt({ ...crouchQ, pz: S0.pz - 3.6 }, true, 6, 8, -8), handAt({ ...crouchQ, pz: S0.pz - 3.6 }, false, 8, -6, 2), 25, 35) }],
    [HOLD.apex, { ...upQ, ...hands(handAt(upQ, true, 3, 4, 14), handAt(upQ, false, 4, -9, 6), 40, 40) }],
    [HOLD.landed, { ...landQ, ...hands(handAt(landQ, true, 4, 5, 11), handAt(landQ, false, 4, -9, 5), 40, 40) }],
    [46, { pz: S0.pz - 0.4, faceUp: S0.faceUp + 4, ...hands(handAt({ pz: S0.pz - 0.4 }, true, 3, 9, -4), handAt({ pz: S0.pz - 0.4 }, false, 5, -4, 6), 20, 55) }],
    [HOLD.shoulder, { ...stance, pz: S0.pz + 0.3, ...hands(s0.handL, R0({ pz: S0.pz + 0.3 }), S0.le, S0.re) }],
    [HOLD.end, { ...stance }],
  ];
}

const FIELDS = ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'faceTurn', 'faceUp', 'faceTilt', 'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'le', 're'] as const;

/** Her feet up off the floor as she springs: from and to (frames). */
const HOP: [number, number] = [HOLD.blow + 1.5, HOLD.landed - 1];

/** Her pose at frame `f`. */
function poseAt(f: number): Partial<Bones> {
  const keys = keysOf();
  const xs = keys.map(([at]) => at);
  const full = keys.map(([, q]) => {
    const o: Record<string, number> = {};
    for (const k of FIELDS) o[k] = ((q as Record<string, number>)[k] ?? (S0 as unknown as Record<string, number>)[k] ?? 0) as number;
    return o;
  });
  const out: Record<string, number> = { lhIn: 2, rhIn: 2, ...(LEGS_0 as Record<string, number>) };
  for (const fd of FIELDS) out[fd] = through(xs, full.map((q) => q[fd]), f);
  // (her feet lifted off the floor, where they stood, as she springs; set down where they were)
  if (f > HOP[0] && f < HOP[1]) {
    const u = (f - HOP[0]) / (HOP[1] - HOP[0]);
    const up = 2.6 * Math.sin(Math.PI * u);
    out.lfz = S0.lfz + up;
    out.rfz = S0.rfz + up;
  }
  return out as Partial<Bones>;
}

/** What she holds: the wrench off her shoulder, pointed at them, brandished, and slung back. */
function holdAt(t: number): { wrench: number; twirl: boolean; spin: number; vial: number; lay: number; layWay: V3 } {
  const f = t / FR;
  const e = (a: number, b: number): number => {
    const u = Math.max(0, Math.min(1, (f - a) / (b - a)));
    return u * u * (3 - 2 * u);
  };
  const lay = f < HOLD.landed + 3 ? e(2, HOLD.point) : 1 - e(HOLD.landed + 3, HOLD.shoulder);
  const k = e(HOLD.blow, HOLD.apex);
  const way: V3 = [AT_THEM[0] + (BRANDISH[0] - AT_THEM[0]) * k, AT_THEM[1] + (BRANDISH[1] - AT_THEM[1]) * k, AT_THEM[2] + (BRANDISH[2] - AT_THEM[2]) * k];
  return { wrench: 0, twirl: false, spin: 0, vial: 0, lay, layWay: way };
}

/** Her tap and hold as a move: a key for every sixtieth of a second. */
export function tinkerHold(): TinkMove {
  const long = HOLD.end * FR;
  const n = Math.round(long * 60);
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = Math.min(long, i / 60);
    keys.push({ at: t, pose: poseAt(t * 30), ease: 'lin' });
  }
  // (her elbows steadied: where a hand comes up past its shoulder, each goes on from where it was)
  const motion: Motion = { keys: steadied(keys, 60, [], { b: TINK_B, rest: TSTANCE }) };
  return {
    name: 'Tap and hold: she sets her Golem on',
    motion,
    long,
    loops: false,
    hold: holdAt,
    air: [[HOP[0] * FR, HOP[1] * FR]],
  };
}

// ---------------------------------------------------------------------------------------------
// HER WHISTLE: its sound, in the friend's cyan, rings of it going out from her mouth while she whistles.

/** Her at a moment of the move, with her whistle (her turned `turn`). */
export function drawTinkerHoldAt(view: GameView, m: TinkMove, t: number, turn = 0): Drawn {
  const d = drawTinkerAt(view, m, t, turn);
  const f = t / FR;
  if (f < HOLD.whistle + 1 || f > HOLD.whistled + 4) return d;
  const s = solve(B, { ...S0, ...poseAt(f) } as Posed);
  const R = B.headR;
  const mouth: V3 = [0, 1, 2].map((i) => s.head[i] + s.face[0][i] * R[0] * 1.2 - s.face[2][i] * R[2] * 0.3) as unknown as V3;
  const a = (turn * Math.PI) / 180;
  const rot = (p: V3): V3 => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
  const [mx, my] = d.st.at(rot(mouth));
  // (which way her face looks, on the picture)
  const ahead: V3 = [mouth[0] + s.face[0][0] * 4, mouth[1] + s.face[0][1] * 4, mouth[2] + s.face[0][2] * 4];
  const [ax, ay] = d.st.at(rot(ahead));
  const dir = Math.atan2(ay - my, ax - mx);
  // (three arcs going out, each born a few frames after the last, the newest whitest; gone as she stops)
  for (let k = 0; k < 3; k++) {
    const age = f - HOLD.whistle - 1 - k * 2.5;
    if (age < 0 || f > HOLD.whistled + 2 + k) continue;
    const r = 4 + ((age * 2.2) % 13);
    const col = r < 8 ? '#ffffff' : r < 12 ? CYAN[3] : CYAN[2];
    for (let j = -3; j <= 3; j++) {
      const th = dir + j * 0.17;
      dot(d, mx + Math.cos(th) * r, my + Math.sin(th) * r, col);
    }
  }
  return d;
}
