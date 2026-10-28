// THE TINKERER'S FALL, WHEN HER LIFE RUNS OUT (the art chat, 28 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His word, 28 Oct, 00:50: “I’m going to sleep, keep working on her and the constructs.”; of the heroes, 6 Oct, 00:31:
// “Proud and daring or a roguish charm.”, and 00:32: “I want things to have weight. That's very important”; her brief, 23
// Oct: “Gleeful mad bomber (Recommended)”, “Quick and nimble (Recommended)”. His art rulebook: deaths are true to what
// died (Hits, blood and deaths 5); big and weighty (Animations 1).
//
// SO, WITH A ROGUE'S CHARM, AND NO FURTHER DOWN THAN SITTING. The last blow snaps her head round and throws her off her
// feet: she flies back, her legs flung up, the wrench torn off her shoulder; she comes down hard on her backside (the
// floor's dust bursting out from under her), catching herself on her hands behind her, the wrench clanging down flat on
// the floor by her right hand, still in it; she shakes her head, dazed, her ponytail flying; then, cocky to the last, she
// throws a little two-fingered salute off her goggles, her chin up; her hand drops to her knee, and she slumps forward
// where she sits, her head hanging. She does not lie down.

import { solve } from '../art/skeleton';
import type { Bones, Key3, Motion, Posed, V3 } from '../art/skeleton';
import type { GameView } from '../art/skin';
import { CYAN } from '../art/kit';
import type { Drawn } from './sculpt';
import { FR, TINK_B, TSTANCE, drawTinkerAt } from './tinkerer_moves';
import type { TinkMove } from './tinkerer_moves';
import { billow, through } from './brawler_fall';
import { DUST, dot, line } from './brawler_fx';

const B = TINK_B;
const S0 = TSTANCE;

/** Her fall through time, in frames (30 a second). */
export const TFALL = {
  /** The blow lands (she stands as she stands till then); her head snapped round by `snapped`: a flash, as a blow is. */
  hit: 3,
  snapped: 5,
  /** Her feet torn off the floor; she flies; she comes down on her backside. */
  off: 7,
  sits: 14,
  /** The wrench clangs down flat. */
  clang: 15,
  /** Dazed; her salute; her slump. */
  salute: 40,
  flick: 44,
  gone: 58,
  end: 74,
};

/** Where she sits (her hips, as a pose has them) and how her body leans back on her hands as she does. */
const SIT = { px: -8, pz: -26.5 };
/** Where her hands are planted on the floor behind her as she sits (her own space): her left, and her right on the wrench. */
const HAND_L: V3 = [-15, 8, 4.6];
const HAND_R: V3 = [-14, -9, 4.6];
/** The way the wrench lies on the floor from her right fist: out to her right, a little back. */
const LAY: V3 = [-0.25, -1, 0];

/** Her legs as she sits: her left knee up, her right leg out flatter, both heels on the floor and her toes up. */
const LEGS_SIT: Partial<Bones> = { lfx: 6, lfy: 2, lfz: 0, lfp: -18, lft: 22, lk: 20, lkUp: 50, rfx: 10, rfy: -2, rfz: 0, rfp: -28, rft: -18, rk: -14, rkUp: 25 };
/** Her legs as she stands (her stance's own). */
const LEGS_0: Partial<Bones> = { lfx: S0.lfx, lfy: S0.lfy, lfz: S0.lfz, lfp: S0.lfp, lft: S0.lft, lk: S0.lk, lkUp: S0.lkUp, rfx: S0.rfx, rfy: S0.rfy, rfz: S0.rfz, rfp: S0.rfp, rft: S0.rft, rk: S0.rk, rkUp: S0.rkUp };

/** A hand at a point of her chest's own space (from its shoulder: forward, to her left, up), as her own space has it, for the body `q`. */
export function handAt(q: Partial<Bones>, left: boolean, fw: number, lf: number, up: number): V3 {
  const s = solve(B, { ...S0, ...q } as Posed);
  const [cf, cl, cu] = s.chest;
  const sh = left ? s.shoulderL : s.shoulderR;
  return [0, 1, 2].map((i) => sh[i] + cf[i] * fw + cl[i] * lf + cu[i] * up) as unknown as V3;
}
/** Where a pose's hand is (it is measured from the floor under her) as its chest has it: from its shoulder, forward, to her left, up. */
function toChest(q: Partial<Bones>, left: boolean): V3 {
  const s = solve(B, { ...S0, ...q } as Posed);
  const [cf, cl, cu] = s.chest;
  const sh = left ? s.shoulderL : s.shoulderR;
  const h: V3 = left ? [q.lhx ?? 0, q.lhy ?? 0, q.lhz ?? 0] : [q.rhx ?? 0, q.rhy ?? 0, q.rhz ?? 0];
  const v: V3 = [h[0] - sh[0], h[1] - sh[1], h[2] - sh[2]];
  const d = (a: V3): number => v[0] * a[0] + v[1] * a[1] + v[2] * a[2];
  return [d(cf), d(cl), d(cu)];
}
/** Both hands, each where it is put (her own space), as a pose's numbers: each measured from the floor under her. */
export function hands(l: V3, r: V3, le: number, re: number): Partial<Bones> {
  return { lhIn: 2, lhx: l[0], lhy: l[1], lhz: l[2], le, rhIn: 2, rhx: r[0], rhy: r[1], rhz: r[2], re };
}

/** Her poses through her fall (frame, pose): her body, her hands where they are in her own space, her legs. */
function keysOf(): [number, Partial<Bones>][] {
  const s0 = solve(B, S0 as Posed);
  const stance = { ...hands(s0.handL, s0.handR, S0.le, S0.re), ...LEGS_0 };
  // THE BLOW: her head snapped round, her body thrown back, her left fist flung off her hip, the wrench arm flung up
  const snapQ: Partial<Bones> = { px: -2, pz: S0.pz - 1, yaw: S0.yaw + 6, pitch: -12, bend: S0.bend - 18, twist: S0.twist + 14, side: S0.side - 4, faceTurn: S0.faceTurn + 46, faceUp: 24, faceTilt: 18 };
  // (the wrench still on her shoulder, her fist on it)
  const snap = { ...snapQ, ...hands(handAt(snapQ, true, 4, 9, -2), handAt(snapQ, false, S0.rhx, S0.rhy, S0.rhz), 20, S0.re), ...LEGS_0 };
  // ... rocked back onto her heels, her knees giving
  const rockQ: Partial<Bones> = { px: -4, pz: S0.pz - 3.5, yaw: S0.yaw + 4, pitch: -16, bend: S0.bend - 14, twist: S0.twist + 8, side: S0.side - 2, faceTurn: S0.faceTurn + 30, faceUp: 18, faceTilt: 12 };
  const rock = { ...rockQ, ...hands(handAt(rockQ, true, 7, 8, -3), handAt(rockQ, false, S0.rhx, S0.rhy - 1, S0.rhz), 25, S0.re), ...LEGS_0 };
  // THROWN OFF HER FEET: flying back, her legs flung up before her, her arms flung out
  const flyQ: Partial<Bones> = { px: -6, pz: S0.pz - 9, yaw: S0.yaw + 2, pitch: -32, bend: S0.bend - 4, twist: S0.twist + 4, side: 0, faceTurn: S0.faceTurn + 20, faceUp: 6, faceTilt: 8 };
  const fly = { ...flyQ, ...hands(handAt(flyQ, true, 1, 11, -7), handAt(flyQ, false, 5, -11, -3), 30, 40), lfx: 4, lfy: 3, lfz: 9, lfp: -14, lft: 22, lk: 20, lkUp: 35, rfx: 3, rfy: -3, rfz: 6, rfp: -10, rft: -18, rk: -14, rkUp: 25 };
  const liftQ: Partial<Bones> = { ...rockQ, pz: S0.pz - 4.5, pitch: -21, bend: S0.bend - 11, faceTurn: S0.faceTurn + 26, faceUp: 14 };
  // DOWN ON HER BACKSIDE, caught on her hands behind her
  const sitQ: Partial<Bones> = { ...SIT, yaw: -8, pitch: -24, bend: 14, twist: -4, side: 0, roll: 0, faceTurn: -4, faceUp: -10, faceTilt: 6 };
  const sit = { ...sitQ, ...hands(HAND_L, HAND_R, 0, 0), ...LEGS_SIT };
  const at = (q: Partial<Bones>, more: Partial<Bones>): Partial<Bones> => ({ ...q, ...more });
  // HER SALUTE: two fingers off her goggles, her chin up
  const salQ: Partial<Bones> = { ...sitQ, pitch: -20, bend: 8, faceTurn: -18, faceUp: 8, faceTilt: -8 };
  const brow = handAt(salQ, true, 3, -2, 9);
  const flickQ: Partial<Bones> = { ...sitQ, pitch: -20, bend: 9, faceTurn: -22, faceUp: 6, faceTilt: -10 };
  const flicked = handAt(flickQ, true, 11, 7, 8);
  // ... AND GONE: her hand dropped to her knee, slumped forward where she sits, her head hanging
  const goneQ: Partial<Bones> = { ...sitQ, pitch: -6, bend: 32, twist: -6, faceTurn: -10, faceUp: -40, faceTilt: 10 };
  return [
    [0, stance],
    [TFALL.hit, stance],
    [TFALL.snapped, snap],
    [TFALL.off, rock],
    // (her feet up off the floor before they go anywhere)
    [8.5, at(rock, { ...liftQ, ...hands(handAt(liftQ, true, 8, 9, -2), handAt(liftQ, false, 3, -5, -1), 28, 55), lfz: 1.6, rfz: 1.8, lfp: 0, rfp: 6 })],
    [11, fly],
    // (her hands flung back and down to catch her)
    [12.5, at(fly, { ...hands(handAt(flyQ, true, -5, 5, -11), handAt(flyQ, false, -1, -6, -11), 15, 20) })],
    [TFALL.sits, at(sit, { lfz: 2.2, rfz: 1.6, bend: 8, faceUp: 2, ...hands(HAND_L, HAND_R, 0, 0) })],
    // (the weight of her landing: down and forward a moment, her head bobbing down)
    [17, at(sit, { bend: 20, pitch: -20, faceUp: -18 })],
    [20, at(sit, { faceTurn: 16, faceTilt: 14, faceUp: -6 })],
    // DAZED: she shakes her head
    [24, at(sit, { faceTurn: -26, faceTilt: -10, faceUp: -2 })],
    [28, at(sit, { faceTurn: 14, faceTilt: 10, faceUp: -4 })],
    [32, at(sit, { faceTurn: -10, faceTilt: 0, faceUp: 0 })],
    [36, at(sit, { ...salQ, ...hands([-6, 10, 14], HAND_R, 30, 0) })],
    [TFALL.salute, at(sit, { ...salQ, ...hands(brow, HAND_R, 75, 0) })],
    [TFALL.flick, at(sit, { ...flickQ, ...hands(flicked, HAND_R, 55, 0) })],
    [50, at(sit, { ...goneQ, bend: 18, pitch: -12, faceUp: -14, ...hands([2, 7, 17.5], HAND_R, 20, 0) })],
    [TFALL.gone, at(sit, { ...goneQ, ...hands([3, 5, 11], HAND_R, 15, 0) })],
    [66, at(sit, { ...goneQ, bend: 34, faceUp: -44, ...hands([3, 5, 10.5], HAND_R, 15, 0) })],
    [TFALL.end, at(sit, { ...goneQ, bend: 34, faceUp: -44, ...hands([3, 5, 10.5], HAND_R, 15, 0) })],
  ];
}

/** The numbers of her pose that go smoothly from key to key. */
const FIELDS = ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'faceTurn', 'faceUp', 'faceTilt', 'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'le', 're', 'lfx', 'lfy', 'lfz', 'lfp', 'lft', 'lk', 'lkUp', 'rfx', 'rfy', 'rfz', 'rfp', 'rft', 'rk', 'rkUp'] as const;

/** Her pose at frame `f` of her fall. */
function poseAt(f: number): Partial<Bones> {
  const keys = keysOf();
  const full = (q: Partial<Bones>): Record<string, number> => {
    const o: Record<string, number> = {};
    for (const k of FIELDS) o[k] = ((q as Record<string, number>)[k] ?? (S0 as unknown as Record<string, number>)[k] ?? 0) as number;
    return o;
  };
  const out: Record<string, number> = { lhIn: 2, rhIn: 2 };
  const whole = keys.map(([, q]) => full(q));
  // (the blow: in a flash, at its fastest as it lands and slowing)
  if (f > TFALL.hit && f < TFALL.snapped) {
    const a = whole[1];
    const b = whole[2];
    const u = (f - TFALL.hit) / (TFALL.snapped - TFALL.hit);
    const k = 1 - (1 - u) * (1 - u);
    for (const fd of FIELDS) out[fd] = a[fd] + (b[fd] - a[fd]) * k;
    return out as Partial<Bones>;
  }
  const xs = keys.map(([at]) => at);
  for (const fd of FIELDS) out[fd] = through(xs, whole.map((q) => q[fd]), f);
  // HER FLIGHT: her hips thrown up and back off her feet, falling faster and faster till she hits the floor; her hands
  // going with her body as it falls (as her chest has them, from key to key), till they slap down on the floor
  if (f > TFALL.off && f < TFALL.sits) {
    const a = whole[3];
    const u = (f - TFALL.off) / (TFALL.sits - TFALL.off);
    const up = 3.5;
    out.pz = a.pz + (SIT.pz - a.pz) * u * u + up * 4 * u * (1 - u) * (1 - u);
    out.px = a.px + (SIT.px - a.px) * (1 - (1 - u) * (1 - u));
    const span = keys.map(([k], i) => i).filter((i) => xs[i] >= TFALL.off && xs[i] <= TFALL.sits);
    const sx = span.map((i) => xs[i]);
    for (const left of [true, false]) {
      const rel = span.map((i) => toChest(keys[i][1], left));
      const now: [number, number, number] = [0, 1, 2].map((c) => through(sx, rel.map((r) => r[c]), f)) as [number, number, number];
      const w = handAt(out as Partial<Bones>, left, now[0], now[1], now[2]);
      if (left) [out.lhx, out.lhy, out.lhz] = w;
      else [out.rhx, out.rhy, out.rhz] = w;
    }
  }
  return out as Partial<Bones>;
}

/** What she holds through her fall: the wrench torn off her shoulder, held out, and let down to lie flat on the floor, still in her fist. */
function holdAt(t: number): { wrench: number; twirl: boolean; spin: number; vial: number; lay: number; layWay: V3; droop: V3 } {
  const f = t / FR;
  const e = (a: number, b: number): number => {
    const u = Math.max(0, Math.min(1, (f - a) / (b - a)));
    return u * u * (3 - 2 * u);
  };
  // (her ponytail falling forward over her shoulder as her head drops)
  const k = e(TFALL.flick + 2, TFALL.gone + 4);
  return { wrench: 0, twirl: false, spin: 0, vial: 0, lay: e(TFALL.off - 1, TFALL.clang), layWay: LAY, droop: [3 * k, 2.5 * k, -12 * k] };
}

/** Her fall as a move: a key for every sixtieth of a second. */
export function tinkerFall(): TinkMove {
  const long = TFALL.end * FR;
  const n = Math.round(long * 60);
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = Math.min(long, i / 60);
    keys.push({ at: t, pose: poseAt(t * 30), ease: 'lin' });
  }
  const motion: Motion = { keys };
  return {
    name: 'Her fall: down on her backside, a last salute',
    motion,
    long,
    loops: false,
    hold: holdAt,
    // (off her feet, flying, till she comes down on her backside)
    air: [[(TFALL.off + 0.5) * FR, TFALL.sits * FR]],
    // (the blow that lands on her, and the jolt of her landing: each a flash)
    strike: [[(TFALL.hit - 1) * FR, (TFALL.snapped + 1) * FR], [(TFALL.sits - 1) * FR, (TFALL.sits + 1) * FR]],
  };
}

// ---------------------------------------------------------------------------------------------
// WHAT FLIES OFF HER AS SHE GOES DOWN: the blow's flash at her jaw and a little blood; the floor's dust bursting out from
// under her as she comes down; and the wrench's clang, a few sparks off it as it hits the floor.

const hash = (i: number): number => {
  const x = Math.sin(i * 57.3 + 9.1) * 43758.5453;
  return x - Math.floor(x);
};
const BLOOD = ['#4a0c24', '#8a1020', '#b8202c'];
const SPARK = ['#fff4c0', '#ffd860', '#e8a020'];

/** Her at a moment of her fall, with what flies off her (her turned `turn`). */
export function drawTinkerFallAt(view: GameView, m: TinkMove, t: number, turn = 0): Drawn {
  const d = drawTinkerAt(view, m, t, turn);
  const f = t / FR;
  const rot = (p: V3): V3 => {
    const a = (turn * Math.PI) / 180;
    return [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
  };
  const at = (p: V3): readonly [number, number] => d.st.at(rot(p));
  // THE BLOW: a flash at her jaw; a little blood off her mouth, flung away to her left and falling, drying where it lands
  const s = f - TFALL.hit;
  if (s >= 0) {
    const k = solve(B, { ...S0, ...poseAt(TFALL.hit + 1) } as Posed);
    const R = B.headR;
    const mouth: V3 = [0, 1, 2].map((i) => k.head[i] + k.face[0][i] * R[0] * 0.9 - k.face[2][i] * R[2] * 0.45) as unknown as V3;
    if (s < 2.5) {
      const [x, y] = at(mouth);
      const long = 6 - 2 * s;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 0.2;
        const l = long * (i % 2 ? 0.55 : 1);
        line(d, x + Math.cos(a) * 2, y + Math.sin(a) * 2, x + Math.cos(a) * (2 + l), y + Math.sin(a) * (2 + l), i % 2 ? CYAN[3] : '#ffffff', true);
      }
    }
    for (let i = 0; i < 4; i++) {
      const v: V3 = [-0.4 - 0.8 * hash(i + 1), 0.8 + 1.0 * hash(i + 11), 0.9 + 1.2 * hash(i + 21)];
      const land = (v[2] + Math.sqrt(v[2] * v[2] + 2 * 0.9 * mouth[2])) / 0.9;
      const u = Math.min(s, land);
      const p: V3 = [mouth[0] + v[0] * u, mouth[1] + v[1] * u, Math.max(0, mouth[2] + v[2] * u - (0.9 * u * u) / 2)];
      const [x, y] = at(p);
      if (s < land) {
        dot(d, x, y, BLOOD[2]);
        if (i % 2 === 0) dot(d, x, y - 1, BLOOD[1]);
      } else if (s - land < 22) {
        dot(d, x - 1, y, BLOOD[0]);
        if (s - land < 10) dot(d, x + 1, y, BLOOD[0]);
      }
    }
  }
  // DOWN ON HER BACKSIDE: the floor's dust bursting out from under her
  const hips = solve(B, { ...S0, ...poseAt(TFALL.sits) } as Posed).pelvis;
  billow(d, [hips[0], hips[1] + 4, 0], f - TFALL.sits, 13, 20, 8, 21, turn);
  billow(d, [hips[0], hips[1] - 4, 0], f - TFALL.sits, 13, 20, 8, 27, turn);
  // THE WRENCH'S CLANG: sparks off its head as it hits the floor, and grit
  const c = f - TFALL.clang;
  if (c >= 0 && c < 7) {
    const head: V3 = [HAND_R[0] + LAY[0] * 16.5 / Math.hypot(...LAY), HAND_R[1] + LAY[1] * 16.5 / Math.hypot(...LAY), 0.8];
    for (let i = 0; i < 9; i++) {
      const a = hash(i + 40) * Math.PI * 2;
      const sp = 1.2 + 1.6 * hash(i + 50);
      const p: V3 = [head[0] + Math.cos(a) * sp * c, head[1] + Math.sin(a) * sp * c, head[2] + (1.6 + 1.4 * hash(i + 60)) * c - 0.35 * c * c];
      if (p[2] < 0 || hash(i + 70) < c / 8) continue;
      const [x, y] = at(p);
      dot(d, x, y, SPARK[Math.min(2, Math.floor(c / 2.5))]);
    }
    billow(d, head, c, 5, 7, 4, 33, turn);
  }
  void DUST;
  return d;
}
