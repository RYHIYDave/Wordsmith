// THE WARLOCK CHANGING INTO THE DEMON, SEEN HAPPENING (the art chat, 26 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His words of the first change, 26 Oct: “Well let’s see.  I’d like a little bit of an actual transition from one to the
// other.  Not just a smoke cloud obscuring the change.  Also he’s facing one way and the demon is facing the other.  That
// might just be because that’s the only drawing of the demon you have”; told the plan (the demon on bones of its own as
// his, then the change as a real transformation), and shown the demon on its bones: “Yes, now the real change
// (Recommended)”.
//
// SO: tapped, he jolts and the pain doubles him over (dev/warlock_spells.ts theChange, to its eighteenth frame); then HE
// BECOMES IT, in front of you, with no cloud over him: his bones grow into the demon's (art/skeleton.ts, one build into the
// other, one pose into the other: he swells and rises, heaving, his back humping up, his legs bending back into a goat's,
// his arms lengthening); the demon's black hide spreads out over him from his demon arm, a ragged edge of cyan light running
// before it; and on the same bones, in one sculpture, his coat, hood and boots tear away a piece at a time, each in a puff
// of smoke (dev/warlock_fx.ts morphLight), while the demon's body, head, claws, horns, tail and wings grow out of him
// (dev/sculpt_demon_rig.ts demonInto, grown as they are), its horns through his hood, its wings out of his back; the fire
// in his claws dies as the demon's flares up under its claws as they come down on the floor, on all fours; and it ROARS, a
// shockwave over the floor. Facing as he faced.

import { CYAN } from '../art/kit';
import { NECK_UP, solve } from '../art/skeleton';
import type { Bones, Build, Posed, V3 } from '../art/skeleton';
import type { GameView, PaintView } from '../art/skin';
import type { Drawn, Hit } from './sculpt';
import { ARM_FIRE, WARLOCK_SCULPT_BODY, drawWarlockSculpt, handFire, noise2, warlockSculpt } from './sculpt_warlock';
import { DEMON_B, DEMON_FOURS, demonAura, demonInto, fireBehind } from './sculpt_demon_rig';
import type { DemonBuilt, DemonGrowth, DemonWings } from './sculpt_demon_rig';
import { five, lifted } from './sculpt_demon';
import { HULK_HIDES } from './demon_hulk';
import { FR, warlockPose, withWarlockAt } from './warlock_moves';
import type { WarlockMove } from './warlock_moves';
import { warlockSpells } from './warlock_spells';
import { CHANGE_SCENE } from './warlock_fx';
import type { TornAt } from './warlock_fx';

/** When he begins to become it (seconds from his being tapped), how long it takes, when it roars, and how long it all is. */
export const MORPH_AT = 18 * FR;
export const MORPH_LONG = 1.5;
export const ROAR_AT = MORPH_AT + MORPH_LONG;
export const CHANGE_ALL = ROAR_AT + 1.4;

/**
 * The demon as it stands once it has come: ON ALL FOURS, its gorilla's arms straight down under its shoulders, both claws
 * flat on the floor burning (dev/sculpt_demon_rig.ts DEMON_FOURS; his word, 27 Oct: “Give me an all fours stance, gorilla
 * like arms, claws flat on the floor burning with cyan flame and black smoke”): facing as he faces.
 */
export const DEMON_STAND: Bones = DEMON_FOURS;
/** Its roar: its claws kept on the floor, its shoulders heaved up, its back straightening, its head flung up. */
const ROAR = { bend: -8, hunch: -12, faceUp: 22, shrug: 0.3 };

const ease = (u: number): number => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * c * (c * (c * 6 - 15) + 10);
};
/** 0 before `a`, 1 after `b`, eased between. */
const span = (k: number, a: number, b: number): number => ease((k - a) / (b - a));
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;

/** One build grown into another, `k` of the way. */
export function buildBetween(a: Build, b: Build, k: number): Build {
  const out: Record<string, unknown> = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof Build>) {
    const x = a[key];
    const y = b[key];
    if (typeof x === 'number' && typeof y === 'number') out[key] = lerp(x, y, k);
    else if (Array.isArray(x) && Array.isArray(y)) out[key] = x.map((v: number, i: number) => lerp(v, y[i] as number, k));
    // (a neck as far as it lets the face look up: a man's, if the build does not say, growing into the beast's)
    else if (key === 'neckUp') out[key] = lerp(typeof x === 'number' ? x : NECK_UP, typeof y === 'number' ? y : NECK_UP, k);
    else out[key] = k < 0.5 ? x : y;
  }
  return out as unknown as Build;
}

/** A pose with its hands measured from its place on the floor (HandIn 2), whatever they were measured from: so that two poses can be mixed number by number. */
function handsFromShoulders(B: Build, q: Bones): Bones {
  const s = solve(B, q as Posed);
  // (measured where they are, from his place on the floor (HandIn 2): the demon's own claws are, planted on the floor; so
  // that the change ends exactly on its own pose)
  const out: Record<string, unknown> = { ...q, lhIn: 2, lhx: s.handL[0], lhy: s.handL[1], lhz: s.handL[2], rhIn: 2, rhx: s.handR[0], rhy: s.handR[1], rhz: s.handR[2] };
  // (no longer between two ways of measuring them)
  delete out.lh2;
  delete out.rh2;
  delete out.mixK;
  // (nor between two keys of his move: the solver would take his elbows from those)
  delete out.from;
  delete out.to;
  return out as unknown as Bones;
}
/** One pose into another, `k` of the way, number by number (a number one names and the other does not counts as nothing in the other). */
function poseBetween(a: Bones, b: Bones, k: number): Bones {
  const out: Record<string, unknown> = { ...a, ...b };
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    const x = (a as unknown as Record<string, unknown>)[key];
    const y = (b as unknown as Record<string, unknown>)[key];
    if (key === 'lhIn' || key === 'rhIn') continue;
    if (typeof x === 'number' || typeof y === 'number') out[key] = lerp(typeof x === 'number' ? x : 0, typeof y === 'number' ? y : 0, k);
  }
  return out as unknown as Bones;
}

/** HOW FAR HE HAS BECOME IT at a moment (0 him, 1 it). */
export function becoming(t: number): number {
  // (eased in and out gently, so the middle of it, where the most happens, is not rushed)
  const u = Math.max(0, Math.min(1, (t - MORPH_AT) / MORPH_LONG));
  return u * u * (3 - 2 * u);
}
/**
 * HOW FAR GROWN each part of the demon is, `k` of the way through the change: its claws first, out of his; its body
 * swelling out of his; its horns through his hood, and its head as the hood tears; its plates and spines; its tail; and last
 * its wings tearing out of his back.
 */
export function growthAt(k: number): DemonGrowth {
  return {
    body: k < 0.04 ? 0 : lerp(0.45, 1, span(k, 0.04, 0.7)),
    head: k < 0.4 ? 0 : lerp(0.75, 1, span(k, 0.4, 0.75)),
    horns: k < 0.16 ? 0 : lerp(0.2, 1, span(k, 0.16, 0.7)),
    // (its wings torn out of his back folded, already a third grown, and growing as they unfold: wingsAt)
    wings: k < 0.45 ? 0 : lerp(0.3, 1, span(k, 0.45, 0.85)),
    tail: span(k, 0.4, 0.85),
    // (its spines and shackles come late and already half grown: grown from nothing they would speckle it with points of white)
    spines: k < 0.6 ? 0 : lerp(0.5, 1, span(k, 0.6, 0.9)),
    plates: span(k, 0.35, 0.8),
    shackles: k < 0.6 ? 0 : lerp(0.5, 1, span(k, 0.6, 0.85)),
    hands: k < 0.06 ? 0 : lerp(0.6, 1, span(k, 0.06, 0.5)),
    rag: span(k, 0.42, 0.75),
  };
}

/** A track of numbers at moments (seconds), eased from each to the next. */
function track(keys: readonly (readonly [number, number])[], t: number): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], span(t, keys[i - 1][0], keys[i][0]));
  }
  return keys[keys.length - 1][1];
}
/**
 * ITS WINGS ALIVE (his word of the change seen happening, 26 Oct: “I like everything but the wings, they seem too stiff”;
 * shown them folding, opening and beating up and down: “Still too stiff”, read as flat boards swung in their own plane):
 * torn out of his back folded up like a cloak; shaken out with quick strokes as they unfold; at its roar thrown back and up,
 * then beaten forward and down hard, back, and forward again, settling half open; and never still after, working slowly as
 * it breathes. Every stroke swings them back and forward out of their own plane, raised as they go back and lowered as they
 * come forward; their hands trail behind every stroke, bent at the elbow and the wrist; their skin sags between the fingers,
 * billows back as they come forward, and ripples along its torn edge (dev/sculpt_demon_rig.ts DemonWings).
 */
export function wingsAt(t: number): DemonWings {
  const k = becoming(t);
  const R = ROAR_AT;
  const strokeOf = (u: number): { beat: number; sweep: number; open: number } => {
    // (shaken out as they unfold: quick strokes, swelling and dying away)
    const ku = becoming(u);
    const shaken = ku > 0.55 && ku < 1 ? Math.sin((Math.PI * (ku - 0.55)) / 0.45) : 0;
    const sp = (u - MORPH_AT) * Math.PI * 2 * 2.2;
    let sweep = 0.4 * shaken * Math.sin(sp);
    let beat = 0.18 * shaken * Math.sin(sp + 1.2);
    let open = 0;
    // (at its roar: thrown back and up; beaten forward and down hard, back, forward again; settling)
    sweep += track([[R - 0.05, 0], [R + 0.2, 0.55], [R + 0.38, -0.6], [R + 0.58, 0.4], [R + 0.76, -0.35], [R + 0.98, 0.12], [R + 1.15, 0]], u);
    beat += track([[R - 0.05, 0], [R + 0.2, 0.5], [R + 0.38, -0.35], [R + 0.58, 0.25], [R + 0.76, -0.15], [R + 1.15, 0]], u);
    // (never still after: slow strokes as it breathes)
    const idle = span(u, R + 0.9, R + 1.2);
    const ip = (u - R - 0.9) * Math.PI * 2 * 0.85;
    sweep += idle * (0.22 * Math.sin(ip) + 0.05 * Math.sin(ip * 2.3 + 1));
    beat += idle * 0.1 * Math.sin(ip + 1.1);
    open += idle * 0.06 * Math.sin(ip - 0.6);
    return { beat, sweep, open };
  };
  const now = strokeOf(t);
  const was = strokeOf(t - 0.09);
  const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
  const spread = span(k, 0.6, 0.97) * (track([[R - 0.05, 1], [R + 0.2, 1.35], [R + 0.38, 1.2], [R + 0.76, 1.12], [R + 1.15, 1.05]], t) + now.open);
  return {
    spread,
    beat: now.beat,
    sweep: now.sweep,
    // (the hand trailing the stroke)
    tip: clamp((was.sweep - now.sweep) * 2.0, -0.8, 0.8),
    flex: k > 0.45 ? 1 : 0,
    // (the skin billowing back as the wing comes forward, and forward as it goes back)
    wind: clamp((was.sweep - now.sweep) * 1.6, -0.35, 0.45),
    phase: t,
  };
}

/**
 * WHEN EACH PIECE OF HIM TEARS AWAY, as a share of the change, and whether it goes in a puff of smoke (what is seen of him:
 * his clothes, his hood and horns; not the man inside them, gone inside the demon): his book and its chain first, his belt,
 * the plate on his shoulder and his right sleeve, his collar, his coat piece by piece, his hood and horns and the face in it
 * (as the demon's horns come through), the skirts of his coat, his breeches and boots (as the hooves come), and the man and
 * his old demon arm inside it. By the stuff it is made of (his sculpture's own: dev/sculpt_warlock.ts) and what it is.
 */
function tearsAt(mat: number, piece: string, tag: string | undefined, i: number): [number, boolean] {
  if (mat === 5 || mat === 6) return [0.1, true];
  if (mat === 4) return [0.16, true];
  if (mat === 9) return [0.22, true];
  if (mat === 1) {
    if (piece === 'armR' || tag === 'torn') return [0.26, true];
    if (tag === 'collar') return [0.32, true];
    if (tag === 'coat') return [0.34 + (i % 10) * 0.014, true];
    return [0.55, true];
  }
  if (mat === 10 || mat === 11) return [0.42, true];
  if (mat === 2) return [0.62, true];
  if (mat === 3) return [0.68, true];
  if (mat === 0 && piece === 'head') return [0.42, false];
  if (mat === 0 && (piece === 'torso' || piece === 'armR')) return [0.6, false];
  if (mat === 7 || mat === 8) return [0.56, false];
  return [0.72, false];
}

/** The demon's own hide (dev/sculpt_demon_rig.ts: its first, ash black), as it spreads over him. */
const DEMON_HIDE = lifted(five(HULK_HIDES[0].hide));

/** HIS BONES AT A MOMENT OF THE CHANGE (seconds from his being tapped): the build and the pose, and how far he has become it. */
export function changeRig(change: WarlockMove, t: number): { B: Build; q: Posed; k: number } {
  const k = becoming(t);
  const WB = WARLOCK_SCULPT_BODY;
  const manQ = warlockPose(change.motion, Math.min(t, MORPH_AT));
  if (k <= 0) return { B: WB, q: manQ, k };
  // (ITS ROAR, once it has come: rearing up off its claws, which stay where they are on the floor, and settling a little)
  const r = span(t, ROAR_AT, ROAR_AT + 0.22) * (1 - 0.65 * span(t, ROAR_AT + 0.55, ROAR_AT + 1.0));
  if (k >= 1) {
    const it = { ...DEMON_STAND } as unknown as Record<string, number>;
    for (const [key, v] of Object.entries(ROAR)) it[key] = (it[key] ?? 0) + v * r;
    return { B: DEMON_B, q: it as unknown as Posed, k };
  }
  const mid = poseBetween(handsFromShoulders(WB, manQ), handsFromShoulders(DEMON_B, DEMON_STAND), k) as unknown as Record<string, number>;
  // (his face turned to the demon's way early in the change, while it is still low: turned later, past where his neck can
  // lift it, it would swing from one side to the other in a blink)
  {
    const a = (manQ as unknown as Record<string, number>).faceTurn ?? 0;
    const b = (DEMON_STAND as unknown as Record<string, number>).faceTurn ?? 0;
    mid.faceTurn = lerp(a, b, span(k, 0, 0.25));
  }
  // (HEAVING as he changes: his back bowing and his shoulders jerking up, strongest half way)
  const heave = Math.sin(Math.PI * k);
  const ph = (t - MORPH_AT) * Math.PI * 2 * 3.2;
  mid.bend += 5 * heave * Math.sin(ph);
  mid.shrug = (mid.shrug ?? 0) + 0.25 * heave * Math.max(0, Math.sin(ph + 1.2));
  return { B: buildBetween(WB, DEMON_B, k), q: mid as unknown as Posed, k };
}

/** HIM BECOMING IT at a moment (seconds from his being tapped), drawn on the change's scene (dev/warlock_fx.ts CHANGE_SCENE): the picture, the pieces of him torn away so far in puffs of smoke and when, where his heart is, and how far he has become it. */
export function changeFrame(view: GameView, t: number, turn = 0): { d: Drawn; torn: TornAt[]; heart: V3; k: number } {
  const change = warlockSpells().find((m) => m.name.startsWith('Tapped'));
  if (!change) throw new Error('no change');
  // (his skirts and his fire as the move has them as the change begins: dev/warlock_moves.ts)
  return withWarlockAt(change, Math.min(t, MORPH_AT), turn, () => becomingAt(change, view, t, turn));
}
function becomingAt(change: WarlockMove, view: GameView, t: number, turn: number): { d: Drawn; torn: TornAt[]; heart: V3; k: number } {
  const { B, q, k } = changeRig(change, t);
  const WB = WARLOCK_SCULPT_BODY;
  const m = warlockSculpt(view, undefined, turn, { B, q });
  const s = m.s;
  // THE DEMON'S HIDE SPREADING OVER HIM from his demon arm, a ragged edge of cyan light running before it (his skin, and the
  // red hide of his arm, gone the demon's ash black where it has reached; the cracks of light in his arm kept)
  if (k > 0) {
    const reach = 66 * span(k, 0, 0.55);
    const ab: V3 = [s.handL[0] - s.shoulderL[0], s.handL[1] - s.shoulderL[1], s.handL[2] - s.shoulderL[2]];
    const ab2 = ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2];
    const fromArm = (p: V3): number => {
      const ap: V3 = [p[0] - s.shoulderL[0], p[1] - s.shoulderL[1], p[2] - s.shoulderL[2]];
      const u = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / ab2));
      return Math.hypot(ap[0] - ab[0] * u, ap[1] - ab[1] * u, ap[2] - ab[2] * u);
    };
    const lit = new Set<string>([...CYAN, '#ffffff']);
    for (const mi of [0, 7]) {
      const mat = m.sc.mats[mi];
      const was = mat.paint;
      mat.paint = (h: Hit): string | null => {
        const own = was ? was(h) : null;
        if (own && lit.has(own)) return own;
        const edge = reach - 3 + (noise2(h.p[0] * 0.35 + h.p[2] * 0.2 + 5, h.p[1] * 0.35 + h.p[2] * 0.15) - 0.5) * 7;
        const d = fromArm(h.p);
        const tone = Math.max(0, Math.min(4, h.tone));
        if (d < edge) return DEMON_HIDE[tone];
        if (d < edge + 1.6 && reach < 60) return tone >= 2 ? CYAN[3] : CYAN[2];
        return own;
      };
    }
  }
  // (the pieces of him torn away by now: those that go in a puff of smoke, where they were and when they went)
  const torn: TornAt[] = [];
  const counts = new Map<number, number>();
  const kept = m.sc.prims.filter((p) => {
    const n = counts.get(p.mat) ?? 0;
    counts.set(p.mat, n + 1);
    const [at, puff] = tearsAt(p.mat, p.piece, p.tag, n);
    if (k < at) return true;
    if (puff && !p.carve) torn.push({ at: m.sc.at(p.k === 'cone' ? p.a : p.c), t: MORPH_AT + MORPH_LONG * untilK(at) });
    return false;
  });
  m.sc.prims.splice(0, m.sc.prims.length, ...kept);
  // (the demon grown out of him, on the same bones: its parts as big against its own build as his bones have grown)
  let built: DemonBuilt | null = null;
  if (k > 0) built = demonInto(m.sc, s, m.pv as PaintView, turn, {}, lerp(WB.tall / DEMON_B.tall, 1, k), growthAt(k), wingsAt(t));
  // (the fire in his claws dying as he changes, and the blaze on his arm; the demon's flaring up in its raised claw)
  ARM_FIRE.size *= 1 - span(k, 0, 0.3);
  ARM_FIRE.blaze *= 1 - span(k, 0, 0.25);
  ARM_FIRE.t = t;
  ARM_FIRE.seed = 1 + t * 9;
  // (its hellfire under its palms, licking out between its fingers, flaring up as its claws come down on the floor; or in
  // its claw while that is off the floor)
  const flare = span(k, 0.45, 0.9);
  const d = drawWarlockSculpt(m, (st) => {
    if (built && !built.fires.length && flare * 4 > 0.6) handFire(st, m.sc.at(built.seat), 4 * flare, t);
  }, CHANGE_SCENE);
  if (built && flare > 0.15) built.fires.forEach((p, i) => fireBehind(d, p, (3.7 - (i % 2) * 0.7) * flare, t + i * 0.41, 12));
  // (its smoke pouring off it once it has come)
  if (built && k >= 1) demonAura(d, built, 'smoke');
  const heart = m.sc.at([(s.pelvis[0] + s.neck[0]) / 2, (s.pelvis[1] + s.neck[1]) / 2, (s.pelvis[2] + s.neck[2]) / 2]);
  return { d, torn, heart, k };
}

/** The share of the change's time at which it is `k` of the way (the change eases in and out). */
function untilK(k: number): number {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (mid * mid * (3 - 2 * mid) < k) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
