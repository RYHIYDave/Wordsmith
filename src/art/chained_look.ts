// THE CHAINED ONE'S NEW LOOK, THE GAUNT CHAIN-WRAITH (the art chat's helper, 1 Nov 2026; docs/mockups/chained_look/README.md).
// A MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE, and CHAINED_LOOK, the switch the main chat would put him in by, is off. With it
// off every frame the game shows of him is as it was (tests/chained_look.test.ts hashes them).
//
// His words, 1 Nov 2026, at 21:29: “The chained one is very much just shapes and probably needs more help with his look”. Asked which
// look, answered by 21:31: “Gaunt chain-wraith” (offered as: very tall and thin, skin drawn tight, wrapped in his own chains like
// bandages, chains dragging behind). Told him: a real body in place of the tube-and-ball figure; his moves as approved stay the same;
// a picture first. His first brief (9 Oct, art/bosses3.ts's header): “A starved giant, muzzled (Recommended)” (grey skin over bone,
// rags, an iron cage bolted over his face; chains from his wrists, an iron ball dragged behind); he grows wilder as his chains break;
// “His chains drag him down (Recommended)”. Kept: the muzzle cage, the wrist chains, the ball and the chains breaking.
//
// HOW: HIS MOVES ARE THE APPROVED ONES (art/chained_action.ts: the lash combo, the whirl, the hook, the ball; and the game's own stand,
// walk, setting off and stopping, struck, death and chains breaking, art/bosses3.ts), every key and every timing; his chains are the
// ones worked out through them. ALL OF IT IS MADE `LOOK_K` TIMES AS BIG (his bones, every length of every pose, his footwork, his
// chains), so that the same moves are a taller figure's, exactly; and on those bones he is PAINTED NEW: a sculpted, gaunt body in
// place of the tubes and balls (each limb, his trunk and his neck one skin drawn from ring to ring, art/skin.ts `cloth`, as the
// Headsman made new's coat), much thinner than the old; his own chains wound round his limbs and his body like bandages; rag strips;
// the iron cage bolted over his face, the pink burning in its dark.

import type { ActorArt } from './actor_types';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME, RUST, SOCKET } from './mkit';
import { CHAINED_PACE, CO_KIT, CO_REST, coShape } from './bosses3';
import type { CoFreed, CoRope } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import { BALL_BACK, BALL_LAND, BALL_LET, BALL_REACH, HOOK_BACK, HOOK_BITE, HOOK_LET, LASH_TRAVEL, actBallPath, actHookPath, chainedActionMob, coActionShape } from './chained_action';
import { farSide, mobSet, scaled, sphere } from './new_mobs3';
import type { Bit, Mob, MobCanvas, MobMove, Moment, Put, Ropes } from './new_mobs3';
import { eyesToward, skirtOf, wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, cross, dot, len, lerp3, mul, norm, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const D = Math.PI / 180;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** THE SWITCH, OFF. With it on, the game's Chained One is `makeChainedLookArt` (his moves as CHAINED_ACTION has them, on this body). */
export const CHAINED_LOOK = { on: false };

/** HOW MUCH TALLER HE IS: every length of him and of his moves this many times the old (his head 107 of his lengths off the floor as he stands, now 128; the knight's about 50). */
export const LOOK_K = 1.2;
const K = LOOK_K;

/** His canvas: the old one (420 by 340, his floor point at 210, 236) made as much bigger as he is. */
export const LOOK_CANVAS: MobCanvas = { w: Math.round(420 * K), h: Math.round(340 * K), ax: Math.round(210 * K), ay: Math.round(236 * K) };

// =============================================================================================
// HIS MOVES, THE APPROVED ONES, MADE AS BIG AS HE IS

/** The lengths of a pose (where the hips are, where each hand is, where each foot is): all else is a turn, and stays. */
const LENGTHS = ['px', 'py', 'pz', 'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'lfx', 'lfy', 'lfz', 'rfx', 'rfy', 'rfz'] as const;
function scaledPose<T extends P>(p: T): T {
  const o: Record<string, unknown> = { ...p };
  for (const f of LENGTHS) if (typeof o[f] === 'number') o[f] = (o[f] as number) * K;
  return o as T;
}
const scaledKey = (k: Key3): Key3 => ({ ...k, pose: scaledPose(k.pose), ...(k.as ? { as: scaledPose(k.as) } : {}) });
const scaledMotion = (m: Motion): Motion => ({ ...m, keys: m.keys.map(scaledKey) });
const big = (p: V3): V3 => [p[0] * K, p[1] * K, p[2] * K];
const scaledRopes = (r: Ropes): Ropes => {
  const out: Record<string, ReadonlyArray<V3>> = {};
  for (const [k, v] of Object.entries(r)) out[k] = v.map(big);
  return out;
};
/** A move of his made as big as he is: its keys, its rest, its footwork, how fast the floor goes by under it, and its chains (each moment asked for kept: a frame is asked for them more than once). */
function scaledMove(mv: MobMove): MobMove {
  const out: MobMove = { ...mv, motion: scaledMotion(mv.motion), rest: scaledPose(mv.rest) };
  if (mv.feet) {
    const feet = mv.feet;
    out.feet = (t) => scaledPose(feet(t));
  }
  if (mv.ground !== undefined) out.ground = mv.ground * K;
  if (mv.ropes) {
    const ropes = mv.ropes;
    const kept = new Map<number, Ropes>();
    out.ropes = (t) => {
      const key = Math.round(t * 1e6) / 1e6;
      let r = kept.get(key);
      if (!r) {
        r = scaledRopes(ropes(t));
        if (kept.size > 4000) kept.clear();
        kept.set(key, r);
      }
      return r;
    };
  }
  return out;
}

const MADE: Partial<Record<CoFreed, Mob>> = {};
/** THE CHAINED ONE IN HIS NEW LOOK, as free as he is: his moves as CHAINED_ACTION has them (art/chained_action.ts), every one made `LOOK_K` times as big, painted new. Made the first time it is asked for. */
export function chainedLookMob(freed: CoFreed): Mob {
  const made = MADE[freed];
  if (made) return made;
  const base = chainedActionMob(freed);
  const more: Record<string, MobMove> = {};
  for (const [k, v] of Object.entries(base.more ?? {})) more[k] = scaledMove(v);
  const mob: Mob = {
    ...base,
    id: `${base.id}+look`,
    size: 'a boss: a gaunt giant, a head and more taller than the Warden',
    build: scaled(base.build, K),
    stand: scaledMove(base.stand),
    walk: scaledMove(base.walk),
    attack: scaledMove(base.attack),
    reel: scaledMove(base.reel),
    dying: scaledMove(base.dying),
    more,
    // (his walk painted for a stride as much longer as he is: the game shows its frames as much slower at its own pace, so that his feet still grip)
    pace: base.pace * K,
    aura: { x: LOOK_CANVAS.ax - 2, y: LOOK_CANVAS.ay - 62, r: 92, color: '#ff3a78', a: 0.15 },
    shadow: Math.round(base.shadow * 0.9),
    canvas: LOOK_CANVAS,
    trueBack: true,
    bits: (st: Stage, m: Moment) => [...lookBits(st, m, freed), ...smearBits(m)],
    fall: () => null,
  };
  MADE[freed] = mob;
  return mob;
}

/** HIM IN HIS NEW LOOK, as the game holds a monster: as free as he is. (`pace`: the game's, 1.1 tiles a second as now.) */
export function makeChainedLookArt(pace = CHAINED_PACE, freed: CoFreed = 0): ActorArt {
  const mob = chainedLookMob(freed);
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// =============================================================================================
// HIS BODY: its sizes (the figure's own lengths, as big as he now is), for the painter and for the checks alike

/** Each limb's skin from ring to ring: along the bone (0 at its root, 1 at its end), how far out it is to its front and to its side, and how far its middle is put to its front. */
type Section = readonly [number, number, number, number?];
/** THE THIGH: lean, a hollow at its inside, narrowing to a bony knee. */
const THIGH: ReadonlyArray<Section> = [[-0.04, 5.6, 5.4, 0.2], [0.18, 5.0, 4.6, 0.5], [0.5, 4.1, 3.7, 0.4], [0.8, 3.3, 3.2, 0.2], [1.0, 3.4, 3.5, 0.6]];
/** THE SHIN: the bone sharp at its front, the calf a knot of sinew behind, the ankle thin. */
const SHIN: ReadonlyArray<Section> = [[0.0, 3.4, 3.5, 0.6], [0.12, 3.0, 3.0, -0.2], [0.32, 3.4, 2.9, -1.1], [0.6, 2.5, 2.3, -0.3], [0.88, 2.0, 2.0, 0], [1.0, 2.1, 2.4, 0]];
/** THE UPPER ARM: a bony shoulder, the arm thin under it. */
const UPPER: ReadonlyArray<Section> = [[-0.1, 4.0, 4.2, 0], [0.16, 3.5, 3.6, 0.3], [0.5, 2.8, 2.9, 0.3], [0.86, 2.5, 2.6, 0], [1.0, 2.7, 2.8, -0.3]];
/** THE FOREARM: sinewy below the elbow, wasted to a thin wrist. */
const FORE: ReadonlyArray<Section> = [[0.0, 2.7, 2.8, -0.3], [0.14, 3.0, 3.1, -0.1], [0.45, 2.6, 2.7, 0], [0.78, 2.0, 2.2, 0], [0.92, 1.9, 2.1, 0]];
/** How thick his own chain wound round a limb stands off it (a link's thickness and a little). */
const WRAP_OFF = 1.15;
/** His skin and what is on him, as the checks see them (radii, his lengths): a limb, at its thickest, with the chain wound round it. */
const SOLID_R0 = { leg: 5.4, shin: 4.0, foot: 2.4, upper: 3.4 + WRAP_OFF * 0.5, fore: 3.5, neck: 3.4, head: 9.2 };

// =============================================================================================
// HIS COLOURS: skin pale grey drawn tight over bone; black iron; rags; the pink in his cage's dark

/** His skin: pale grey, five tones, so that every bone under it shows. */
export const GAUNT: Ramp = ['#2a2433', '#4a4258', '#857c95', '#b6aec4', '#d8d1e2'];
/** Black iron: his chains, his cage, his irons (lit edges, so that every link reads). */
export const BLACK_IRON: Ramp = ['#0b0a12', '#191624', '#2e2a3f', '#565170', '#8e89ae'];
/** Rags, grey-brown and filthy. */
const RAG: Ramp = ['#17121b', '#17121b', '#2f2632', '#4a3e4c', '#4a3e4c'];
const HAIR: Ramp = ['#0b0911', '#0b0911', '#1c1726', '#302a3e', '#302a3e'];
/** The dark inside his cage, and the pink burning in it. */
const CAGE_DARK = '#140a1a';
/** How much of the light is taken off his skin: so that it is the mid grey that most of him is, the light catching only his bones' edges. */
const SKIN_SHADE = 0.06;

// =============================================================================================
// THE PAINTER

/** A frame along a bone from `a` to `b`: along it, its front (toward `front`, made square to it) and its side. */
function along(a: V3, b: V3, front: V3): { d: V3; f: V3; l: V3 } {
  const d = norm(sub(b, a), [0, 0, -1]);
  const f0 = sub(front, mul(d, dot(front, d)));
  const f = norm(f0, Math.abs(d[2]) < 0.9 ? norm(cross(d, [0, 0, 1])) : [1, 0, 0]);
  return { d, f, l: norm(cross(d, f)) };
}
/** A limb's skin as rings from `a` to `b` (its front `front`): one ring for each section. */
function limbRings(a: V3, b: V3, front: V3, sections: ReadonlyArray<Section>, thin = 1): Ring[] {
  const { f, l } = along(a, b, front);
  return sections.map(([t, rf, rl, off = 0]) => ({ c: add(lerp3(a, b, t), mul(f, off)), u: mul(f, rf * thin), v: mul(l, rl * thin) }));
}
/** Where a limb's two bones bend toward: the way from the line between its ends out to its middle joint (or `or`, if it is straight). */
function bendOf(a: V3, m: V3, b: V3, or: V3): V3 {
  const ab = sub(b, a);
  const L2 = dot(ab, ab);
  const k = L2 > 1e-9 ? dot(sub(m, a), ab) / L2 : 0;
  const off = sub(m, add(a, mul(ab, k)));
  return len(off) > 1.2 ? norm(off) : or;
}

/** A link of chain: flat to the eye (its hole shows) or edge on, along `dir`; `out` the way off whatever it lies on (if it lies on something). */
function link(put: Put, part: string, c: V3, dir: V3, flat: boolean, size: number, out?: V3): void {
  const side0 = out ? norm(cross(out, dir)) : norm(cross(dir, Math.abs(dir[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
  const across = flat ? side0 : out ? norm(out) : norm(cross(dir, side0));
  const thin = norm(cross(dir, across));
  put(part, part, { k: 'ball', c, ax: [mul(dir, 1.75 * size), mul(across, (flat ? 1.25 : 0.7) * size), mul(thin, 0.62 * size)], skin: flat ? linkSkin : BLACK_IRON });
}
/** The skin of a link that lies flat to the eye: black iron round a hole. */
const linkSkin: Skin = (u, tone) => (Math.abs(u[0]) < 0.5 && Math.abs(u[1]) < 0.42 ? INK : BLACK_IRON[Math.min(4, tone + 1)]);

/** A CHAIN along a path: links, each turned a quarter round from the last, one every `2.7 * size`; `outAt`, the way off what it lies on at a point (wound round a limb). How many links it took. */
function chainAlong(put: Put, part: string, path: ReadonlyArray<V3>, size: number, outAt?: (p: V3) => V3): number {
  const step = 2.7 * size;
  let carry = 0;
  let n = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const dd = sub(path[i], a);
    const L = len(dd);
    if (L < 1e-6) continue;
    const dir = mul(dd, 1 / L);
    let at = carry;
    while (at < L) {
      const c = add(a, mul(dir, at));
      link(put, part, c, dir, n % 2 === 0, size, outAt?.(c));
      n++;
      at += step;
    }
    carry = at - L;
  }
  return n;
}
/** HIS OWN CHAIN WOUND ROUND A LIMB like a bandage, from `a` to `b` (along it, as far as `from` to `to` of it), `turns` times round, `r` out from its middle line (at each end). */
function wound(put: Put, part: string, a: V3, b: V3, front: V3, from: number, to: number, r0: number, r1: number, turns: number, phase: number, size = 1.05): void {
  const { f, l, d } = along(a, b, front);
  const pts: V3[] = [];
  const n = Math.max(8, Math.round(turns * 18));
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const ang = phase + u * turns * Math.PI * 2;
    const c = lerp3(a, b, from + (to - from) * u);
    const r = r0 + (r1 - r0) * u + WRAP_OFF;
    pts.push(add(c, add(mul(f, Math.cos(ang) * r), mul(l, Math.sin(ang) * r))));
  }
  chainAlong(put, part, pts, size, (p) => {
    const k = clamp01(dot(sub(p, a), d) / Math.max(1e-6, len(sub(b, a))));
    const c = lerp3(a, b, k);
    return norm(sub(p, c), f);
  });
}

/** The cuff on a wrist, and the ring on his collar, where his chains hang from (as the moves have them, made as big as he is). */
export const cuffOf = (s: Skeleton, side: 'L' | 'R'): V3 => {
  const hand = side === 'L' ? s.handL : s.handR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  return add(hand, mul(norm(sub(hand, el), [0, 0, -1]), -3.6 * K));
};
export const collarOf = (s: Skeleton): V3 => add(lerp3(s.neck, s.skull, 0.25), mul(s.chest[0], -4.6 * K));

/** THE CHAINED ONE, THE GAUNT CHAIN-WRAITH, AS SOLIDS. */
function lookBits(st: Stage, m: Moment, freed: CoFreed): Bit[] {
  const { s, q } = m;
  const B: Build = scaled(CO_KIT.body, K);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const [hf, hl, hu] = s.hips;
  const lit = 1 - clamp01(q.out);
  const lag: V3 = ((): V3 => {
    const v = mul(m.come, -1.5);
    const l0 = len(v);
    return l0 > 4.4 ? mul(v, 4.4 / l0) : v;
  })();
  const wave = m.wind * Math.PI * 2;
  const fl0 = norm([hf[0], hf[1], 0], [1, 0, 0]);
  const left0: V3 = [-fl0[1], fl0[0], 0];
  const skinAt = (p: V3): Ramp => farSide(st, s.pelvis, GAUNT, p);

  // --- HIS LEGS: long and lean, a bony knee, the calf a knot of sinew, a thin ankle; big bony feet, the toes splayed and gripping;
  // irons on his ankles; his own chain wound round each shin and once round each thigh ---
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    const hip = L ? s.hipL : s.hipR;
    const knee = L ? s.kneeL : s.kneeR;
    const ankle = L ? s.ankleL : s.ankleR;
    const heel = L ? s.heelL : s.heelR;
    const toe = L ? s.toeL : s.toeR;
    const kneeFwd = bendOf(hip, knee, ankle, fl0);
    // (the knee bends forward: the thigh's front is that way, the shin's is too)
    const ramp = skinAt(lerp3(hip, ankle, 0.5));
    put(`leg${side}`, `leg${side}`, { k: 'cloth', rings: limbRings(hip, knee, kneeFwd, THIGH), ramp, look: { lift: 0, shade: SKIN_SHADE } });
    put(`leg${side}`, `shin${side}`, { k: 'cloth', rings: limbRings(knee, ankle, kneeFwd, SHIN), ramp, look: { lift: 0, shade: SKIN_SHADE } });
    // (the edge of the shin bone down its front, catching the light)
    for (let i = 0; i <= 14; i++) put(`leg${side}`, `shin${side}`, { k: 'dot', p: add(lerp3(knee, ankle, 0.12 + i * 0.05), mul(kneeFwd, 3.0 - i * 0.07)), c: GAUNT[3], facing: kneeFwd });
    // the kneecap, bony, and the knobs of his ankle
    put(`leg${side}`, `leg${side}`, { k: 'ball', c: add(knee, mul(kneeFwd, 2.3)), ax: sphere(2.2), skin: ramp });
    const { l: al } = along(knee, ankle, kneeFwd);
    for (const sg of [1, -1]) put(`leg${side}`, `shin${side}`, { k: 'ball', c: add(lerp3(knee, ankle, 0.95), mul(al, sg * 1.9)), ax: sphere(1.15), skin: ramp });
    // the foot: long and bony, its arch high, its toes long and splayed, curled to grip the floor
    const fwd = norm(sub(toe, heel), [1, 0, 0]);
    const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(hu, fwd), [0, 1, 0]);
    const up3 = norm(cross(fwd, side3), [0, 0, 1]);
    const footRings: Ring[] = [
      { c: add(heel, mul(up3, 2.0)), u: mul(up3, 2.0), v: mul(side3, 2.0) },
      { c: add(lerp3(heel, ankle, 0.5), mul(up3, 1.0)), u: mul(up3, 2.6), v: mul(side3, 2.2) },
      { c: add(lerp3(heel, toe, 0.5), mul(up3, 2.5)), u: mul(up3, 2.1), v: mul(side3, 2.6) },
      { c: add(toe, mul(up3, 1.4)), u: mul(up3, 1.3), v: mul(side3, 3.4) },
    ];
    put(`leg${side}`, `foot${side}`, { k: 'cloth', rings: footRings, ramp, look: { lift: 0.2 } });
    for (let i = 0; i < 4; i++) {
      const k = (i - 1.6) / 1.6;
      const base = add(add(toe, mul(side3, k * 2.6)), mul(up3, 1.2));
      const longT = 3.6 - Math.abs(k) * 0.9 + (i === 1 ? 0.5 : 0);
      const splay = norm(add(fwd, mul(side3, k * 0.22)));
      const knuckle = add(add(base, mul(splay, longT * 0.55)), mul(up3, 0.9));
      const tip = add(base, mul(splay, longT));
      const tipDown: V3 = [tip[0], tip[1], Math.max(0.7, Math.min(tip[2], 1.0))];
      put(`leg${side}`, `foot${side}`, { k: 'rod', a: base, b: knuckle, ra: 1.05, rb: 0.95, ramp });
      put(`leg${side}`, `foot${side}`, { k: 'rod', a: knuckle, b: tipDown, ra: 0.95, rb: 0.6, ramp });
    }
    // the iron on his ankle, a broken stub of chain hanging from it
    const ironC = lerp3(ankle, knee, 0.1);
    const { f: sf, l: sl } = along(knee, ankle, kneeFwd);
    put(`irons${side}`, `irons${side}`, { k: 'band', ring: { c: ironC, u: mul(sf, 3.1), v: mul(sl, 3.3) }, ramp: BLACK_IRON, rows: 4 });
    const stub = add(ironC, mul(sl, (L ? 1 : -1) * 3.3));
    chainAlong(put, `irons${side}`, [stub, add(stub, [-1.2 + lag[0] * 0.4, 0, -2.6]), add(stub, [-3.2 + lag[0] * 0.8, L ? 1 : -1, -3.8])], 0.9);
    // HIS OWN CHAIN WOUND ROUND HIS SHIN, from the iron up toward the knee; and twice round the thigh
    wound(put, `wrapShin${side}`, knee, ankle, kneeFwd, 0.42, 0.84, 2.6, 2.3, 1.9, L ? 0.6 : 2.2);
    wound(put, `wrapThigh${side}`, hip, knee, kneeFwd, 0.5, 0.6, 4.0, 3.8, 1.0, L ? 1.4 : 4.0);
  }

  // --- RAGS AT HIS HIPS: what is left of a prisoner's breeches, a torn clout bound with a strip; rag strips hanging from it, front
  // and back, swinging after him ---
  const waistC = add(s.pelvis, mul(hu, B.waist * 0.32));
  const top: Ring = { c: waistC, u: mul(hf, B.pelvisDeep * 0.8 + 1.2), v: mul(hl, B.pelvisHalf * 0.86 + 1.2) };
  const clout = skirtOf(s, B, { top, drop: B.thigh * 0.25, wide: B.pelvisHalf * 0.74 + 2, deep: B.pelvisDeep * 0.76 + 2, lag, wind: m.wind, gale: q.gale, pad: 0.5 });
  put('rags', 'rags', { k: 'cloth', rings: clout, ramp: RAG, look: { folds: [30, -30, 100, -100, 160], lift: 0.1 }, torn: [7, 2, 9, 1, 5, 10, 2, 6, 1, 8, 3, 7, 2] });
  put('rags', 'rags', { k: 'band', ring: { c: add(waistC, mul(hu, 1.0)), u: mul(hf, B.pelvisDeep * 0.8 + 1.7), v: mul(hl, B.pelvisHalf * 0.86 + 1.7) }, ramp: RAG, rows: 3 });
  for (const [i, ang, drop, w] of [[0, 12, 30, 2.3], [1, 160, 36, 2.1], [2, -150, 28, 1.9], [3, 72, 22, 1.7], [4, -60, 18, 1.6]] as const) {
    const a = ang * D;
    const knot = add(add(waistC, mul(hu, 0.4)), add(mul(hf, Math.cos(a) * (B.pelvisDeep * 0.8 + 1.9)), mul(hl, Math.sin(a) * (B.pelvisHalf * 0.86 + 1.9))));
    const outw = norm(add(mul(hf, Math.cos(a)), mul(hl, Math.sin(a))));
    const across = norm(cross(outw, [0, 0, 1]), left0);
    const rings: Ring[] = [];
    for (let j = 0; j <= 6; j++) {
      const k = j / 6;
      const sway = Math.sin(wave + k * 2.4 + i * 1.9) * 1.3 * k;
      const p0 = add(add(knot, mul(outw, 1.2 * k)), add([0, 0, -drop * k], add(mul(lag, 2.6 * k * k), mul(across, sway))));
      rings.push({ c: [p0[0], p0[1], Math.max(p0[2], 1.3)], u: mul(outw, 0.6), v: mul(across, w * (1 - 0.35 * k)) });
    }
    put(`rag${i}`, 'rags', { k: 'cloth', rings, ramp: RAG, look: { folds: [0], lift: 0.1 }, torn: [3, 1, 4, 0, 2] });
  }

  // --- HIS TRUNK: a narrow, bony pelvis, the hip bones standing out; a waist wasted to nothing, the belly sunk in under the ribs; a
  // rib cage you can count; the shoulder blades standing out of his hunched back; collarbones like bars ---
  const be = s.belly;
  const chestTop = lerp3(s.ribs, s.neck, 0.78);
  const trunk: Ring[] = [
    { c: add(s.pelvis, mul(hu, -B.waist * 0.2)), u: mul(hf, B.pelvisDeep * 0.7), v: mul(hl, B.pelvisHalf * 0.74) },
    { c: add(s.pelvis, mul(hu, B.waist * 0.36)), u: mul(hf, B.pelvisDeep * 0.76), v: mul(hl, B.pelvisHalf * 0.84) },
    { c: add(s.waist, mul(be[0], -B.waistDeep * 0.22)), u: mul(be[0], B.waistDeep * 0.62), v: mul(be[1], B.waistHalf * 0.7) },
    { c: add(s.ribs, mul(cu, -B.ribs * 0.12)), u: mul(cf, B.ribDeep * 0.92), v: mul(cl, B.ribHalf * 0.84) },
    { c: add(s.ribs, mul(cu, B.chest * 0.38)), u: mul(cf, B.ribDeep * 1.0), v: mul(cl, B.ribHalf * 0.9) },
    { c: add(chestTop, mul(cf, -0.9)), u: mul(cf, B.ribDeep * 0.9), v: mul(cl, B.shoulderHalf * 0.52) },
    { c: add(s.neck, add(mul(cu, -1.2), mul(cf, -1.8))), u: mul(cf, B.ribDeep * 0.6), v: mul(cl, B.shoulderHalf * 0.34) },
  ];
  const trunkRamp = GAUNT;
  put('body', 'body', { k: 'cloth', rings: trunk, ramp: trunkRamp, look: { lift: 0.02, shade: SKIN_SHADE + 0.08 } });
  // HIS OWN CHAIN WOUND ROUND HIS BODY: from over his left shoulder blade, down round his ribs and his wasted waist, like a bandage
  {
    const onTrunk = (k: number, ang: number, off: number): { p: V3; out: V3 } => {
      const i = Math.min(trunk.length - 2, Math.floor(k));
      const f = k - i;
      const A = trunk[i];
      const Z = trunk[i + 1];
      const c = lerp3(A.c, Z.c, f);
      const u = lerp3(A.u, Z.u, f);
      const v = lerp3(A.v, Z.v, f);
      const lu = len(u);
      const lv = len(v);
      const out = norm(add(mul(u, Math.cos(ang) / lu), mul(v, Math.sin(ang) / lv)));
      return { p: add(c, add(mul(u, (Math.cos(ang) * (lu + off)) / lu), mul(v, (Math.sin(ang) * (lv + off)) / lv))), out };
    };
    const pts: V3[] = [];
    const outs: V3[] = [];
    const n = 60;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const { p, out } = onTrunk(4.9 - 2.5 * u, (150 - 560 * u) * D, WRAP_OFF + 0.3);
      pts.push(p);
      outs.push(out);
    }
    chainAlong(put, 'wrapBody', pts, 1.1, (p) => {
      let best = 0;
      let bd = Infinity;
      pts.forEach((q, i) => {
        const d = len(sub(q, p));
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      return outs[best];
    });
  }
  // (his shoulders: from the root of his neck out to each shoulder, the slope of sinew over the collarbone)
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const root = add(s.neck, add(mul(cu, -1.4), mul(cf, -1.0)));
    const { f: gf } = along(root, sh, cu);
    const yoke: Ring[] = [0, 0.5, 0.88, 1.04].map((t, i) => ({ c: add(lerp3(root, sh, t), mul(cf, -0.6 + 0.5 * t)), u: mul(gf, [3.6, 3.2, 3.6, 3.9][i]), v: mul(cf, [5.2, 4.6, 4.1, 3.9][i]) }));
    put('body', 'body', { k: 'cloth', rings: yoke, ramp: trunkRamp, look: { lift: 0 } });
    // a collarbone, standing out: from the notch at the root of his neck to the point of his shoulder
    const notch = add(s.neck, add(mul(cf, B.ribDeep * 0.5), mul(cu, -2.2)));
    put('body', 'body', { k: 'rod', a: notch, b: add(sh, add(mul(cf, 2.4), mul(cu, 1.0))), ra: 1.25, rb: 1.5, ramp: trunkRamp });
    // a shoulder blade, standing out of his back
    const sgn = side === 'L' ? 1 : -1;
    put('body', 'body', { k: 'ball', c: add(lerp3(s.ribs, s.neck, 0.62), add(mul(cf, -B.ribDeep * 0.82), mul(cl, sgn * B.ribHalf * 0.5))), ax: [mul(cf, 2.4), mul(cl, 4.4), mul(cu, 5.6)], skin: trunkRamp });
    // a hip bone, standing out over the rags
    put('body', 'body', { k: 'ball', c: add(s.pelvis, add(mul(hu, B.waist * 0.42), add(mul(hl, sgn * B.pelvisHalf * 0.8), mul(hf, 1.6)))), ax: sphere(2.0), skin: trunkRamp });
  }
  // (the knobs of his spine, down his bent back)
  for (let i = 0; i < 8; i++) {
    const k = 0.04 + i * 0.125;
    const cc = lerp3(s.waist, s.neck, k);
    const deep = k < 0.25 ? B.waistDeep * 0.55 : B.ribDeep * (0.84 + 0.1 * Math.sin(k * Math.PI));
    put('body', 'body', { k: 'ball', c: add(cc, mul(k < 0.25 ? be[0] : cf, -deep)), ax: sphere(1.45), skin: trunkRamp });
  }
  // HIS RIBS, grooved in his skin: five each side, sloping down from his back round to his breastbone; the hollow under them
  {
    const ribC = (h: number): V3 => add(s.ribs, mul(cu, h));
    for (let i = 0; i < 5; i++) {
      const h0 = B.chest * (0.66 - i * 0.15);
      for (const sg of [1, -1]) {
        for (let k = 0; k <= 26; k++) {
          const a = (12 + k * 4.4) * D;
          const h = h0 - 2.6 * Math.cos(a) - (i === 4 ? 0 : 0);
          const rf = B.ribDeep * (0.95 + 0.05 * Math.cos(i));
          const rl = B.ribHalf * (0.86 + 0.04 * (2 - Math.abs(i - 2)));
          const n = norm(add(mul(cf, Math.cos(a) / rf), mul(cl, (sg * Math.sin(a)) / rl)));
          const p = add(ribC(h), add(mul(cf, Math.cos(a) * rf), mul(cl, sg * Math.sin(a) * rl)));
          put('body', 'body', { k: 'dot', p, c: GAUNT[1], facing: n });
        }
        // (and round his back, from his spine: as starved as he is, the middle three show there too, fainter)
        for (let k = 0; k <= 12 && i >= 1 && i <= 3; k++) {
          const a = (118 + k * 4.6) * D;
          const h = h0 + 1.2 + 1.4 * Math.cos(a);
          const rf = B.ribDeep * 0.98;
          const rl = B.ribHalf * 0.88;
          const n = norm(add(mul(cf, Math.cos(a) / rf), mul(cl, (sg * Math.sin(a)) / rl)));
          const p = add(ribC(h), add(mul(cf, Math.cos(a) * rf), mul(cl, sg * Math.sin(a) * rl)));
          put('body', 'body', { k: 'dot', p, c: GAUNT[2], facing: n });
        }
      }
    }
    // (the groove of his spine, between the knobs)
    for (let k = 0; k <= 16; k++) {
      const cc = lerp3(s.ribs, s.neck, k / 16);
      put('body', 'body', { k: 'dot', p: add(cc, mul(cf, -B.ribDeep * 0.97)), c: GAUNT[1], facing: mul(cf, -1) });
    }
    // (his breastbone: a groove down the middle of his chest)
    for (let k = 0; k <= 10; k++) {
      const p = add(ribC(B.chest * (0.15 + k * 0.06)), mul(cf, B.ribDeep * 1.0));
      put('body', 'body', { k: 'dot', p, c: GAUNT[1], facing: cf });
    }
  }

  // --- HIS ARMS: long and thin, a bony knob of a shoulder, a sharp elbow, a sinewy forearm wasted to a thin wrist; great bony hands,
  // long knuckled fingers; an iron cuff at each wrist, and from it his chain; his own chain wound up each forearm, and round each arm ---
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    const sh = L ? s.shoulderL : s.shoulderR;
    const el = L ? s.elbowL : s.elbowR;
    const hand = L ? s.handL : s.handR;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    // (the inside of the elbow is its front: the way the hand has come round to)
    const inside = bendOf(sh, el, hand, cf);
    const ramp = skinAt(el);
    put(`arm${side}`, `upper${side}`, { k: 'cloth', rings: limbRings(sh, el, inside, UPPER), ramp, look: { lift: 0, shade: SKIN_SHADE } });
    const wrist = add(hand, mul(fore, -1.4 * K));
    put(`arm${side}`, `fore${side}`, { k: 'cloth', rings: limbRings(el, wrist, inside, FORE), ramp, look: { lift: 0, shade: SKIN_SHADE } });
    // the point of the elbow, sharp, behind
    put(`arm${side}`, `fore${side}`, { k: 'ball', c: add(el, mul(inside, -2.1)), ax: sphere(1.7), skin: ramp });
    // the iron cuff, heavy, its ring where the chain hangs
    const cuff = cuffOf(s, side);
    const { f: ff0, l: fl1 } = along(el, hand, inside);
    put(`cuff${side}`, `cuff${side}`, { k: 'cloth', rings: [{ c: add(cuff, mul(fore, -2.6)), u: mul(ff0, 3.1), v: mul(fl1, 3.2) }, { c: add(cuff, mul(fore, 2.2)), u: mul(ff0, 2.9), v: mul(fl1, 3.0) }], ramp: BLACK_IRON, look: { lift: 0 } });
    for (const k of [-2.3, 1.9]) put(`cuff${side}`, `cuff${side}`, { k: 'band', ring: { c: add(cuff, mul(fore, k)), u: mul(ff0, 3.3), v: mul(fl1, 3.4) }, ramp: BLACK_IRON, rows: 1 });
    // HIS OWN CHAIN WOUND UP HIS FOREARM from the cuff, like a bandage; and round his upper arm
    wound(put, `wrapFore${side}`, el, wrist, inside, 0.2, 0.62, 2.95, 2.4, 2.2, L ? 0.3 : 2.6);
    wound(put, `wrapUpper${side}`, sh, el, inside, 0.48, 0.6, 2.9, 2.75, 1.0, L ? 2.0 : 5.0);
    // THE HAND: a great bony palm; four long fingers, knuckled, hooked like claws; a thumb
    const palmUp = norm(sub(cf, mul(fore, dot(cf, fore))), cu);
    const across = norm(cross(fore, palmUp), cl);
    const curl = 0.5 + 0.22 * Math.sin(wave * 3 + (L ? 0 : 2)) * (1 - clamp01(q.draw));
    const palm: Ring[] = [
      { c: add(hand, mul(fore, -0.6)), u: mul(palmUp, 1.9), v: mul(across, 2.4) },
      { c: add(hand, mul(fore, 2.6)), u: mul(palmUp, 2.1), v: mul(across, 3.6) },
      { c: add(hand, mul(fore, 5.4)), u: mul(palmUp, 1.7), v: mul(across, 3.9) },
    ];
    const hr = skinAt(hand);
    put(`hand${side}`, `hand${side}`, { k: 'cloth', rings: palm, ramp: hr, look: { lift: 0 } });
    for (let i = 0; i < 4; i++) {
      const k = (i - 1.5) / 1.5;
      const base = add(add(hand, mul(fore, 5.6)), mul(across, k * 2.8));
      const longF = 1 - Math.abs(k) * 0.12;
      const d1 = norm(add(fore, mul(palmUp, -curl * 0.5)));
      const k1 = add(base, mul(d1, 4.4 * longF));
      const d2 = norm(add(mul(fore, 1 - curl), mul(palmUp, -curl * 1.3)));
      const k2 = add(k1, mul(d2, 3.6 * longF));
      const d3 = norm(add(mul(fore, 0.6 - curl), mul(palmUp, -curl * 1.6 - 0.4)));
      const tip = add(k2, mul(d3, 2.6 * longF));
      put(`hand${side}`, `hand${side}`, { k: 'rod', a: base, b: k1, ra: 1.25, rb: 1.05, ramp: hr });
      put(`hand${side}`, `hand${side}`, { k: 'ball', c: k1, ax: sphere(1.25), skin: hr });
      put(`hand${side}`, `hand${side}`, { k: 'rod', a: k1, b: k2, ra: 1.05, rb: 0.95, ramp: hr });
      put(`hand${side}`, `hand${side}`, { k: 'ball', c: k2, ax: sphere(1.05), skin: hr });
      put(`hand${side}`, `hand${side}`, { k: 'rod', a: k2, b: tip, ra: 0.9, rb: 0.5, ramp: hr });
    }
    const thumbBase = add(add(hand, mul(fore, 1.6)), mul(across, (L ? 1 : -1) * -3.0));
    const t1 = add(thumbBase, add(mul(fore, 3.4), mul(palmUp, -1.4)));
    put(`hand${side}`, `hand${side}`, { k: 'rod', a: thumbBase, b: t1, ra: 1.2, rb: 1.0, ramp: hr });
    put(`hand${side}`, `hand${side}`, { k: 'rod', a: t1, b: add(t1, add(mul(fore, 2.6), mul(palmUp, -1.6))), ra: 1.0, rb: 0.55, ramp: hr });
  }

  // --- HIS NECK, long and corded; his head, a gaunt skull of a head; lank hair; THE IRON CAGE BOLTED OVER HIS FACE, the pink burning
  // in its dark; the iron collar, its ring at the back for the ball's chain ---
  {
    const { f: nf, l: nl } = along(s.neck, s.skull, cf);
    const neckRings: Ring[] = [
      { c: add(s.neck, mul(cu, -2.5)), u: mul(nf, 4.4), v: mul(nl, 4.6) },
      { c: lerp3(s.neck, s.skull, 0.35), u: mul(nf, 3.1), v: mul(nl, 3.3) },
      { c: lerp3(s.neck, s.skull, 0.8), u: mul(nf, 3.0), v: mul(nl, 3.2) },
      { c: add(s.skull, mul(s.face[2], 1.6)), u: mul(nf, 3.4), v: mul(nl, 3.6) },
    ];
    put('neck', 'head', { k: 'cloth', rings: neckRings, ramp: GAUNT, look: { lift: 0 } });
    // (the cords of his neck, from behind his ears down to the notch between his collarbones)
    for (const sg of [1, -1]) put('neck', 'head', { k: 'rod', a: add(s.skull, add(mul(nl, sg * 2.6), mul(nf, 0.4))), b: add(s.neck, add(mul(cf, B.ribDeep * 0.45), add(mul(cl, sg * 1.4), mul(cu, -1.6)))), ra: 1.05, rb: 1.2, ramp: GAUNT });
  }
  // the collar: a heavy band of black iron round his neck, a ring at its back for the chain
  const collarC = lerp3(s.neck, s.skull, 0.25);
  const ringAt = collarOf(s);
  {
    const { f: nf, l: nl } = along(s.neck, s.skull, cf);
    put('collar', 'collar', { k: 'cloth', rings: [{ c: add(collarC, mul(cu, -2.2)), u: mul(nf, 5.2), v: mul(nl, 5.4) }, { c: add(collarC, mul(cu, 2.0)), u: mul(nf, 4.8), v: mul(nl, 5.0) }], ramp: BLACK_IRON, look: { lift: 0.1 } });
    put('collar', 'collar', { k: 'band', ring: { c: add(collarC, mul(cu, 1.6)), u: mul(nf, 5.1), v: mul(nl, 5.3) }, ramp: BLACK_IRON, rows: 1 });
    put('collar', 'collar', { k: 'ball', c: ringAt, ax: [mul(cf, 0.9), mul(cl, 2.2), mul(cu, 2.2)], skin: linkSkin });
  }
  const face = wornOn(st, s, 8);
  const [ff, fl, fu] = face;
  const hc = s.head;
  const hr: V3 = [B.headR[0] * 0.84, B.headR[1] * 0.78, B.headR[2] * 0.9];
  const at = (fw: number, lf: number, up: number): V3 => add(hc, add(mul(ff, fw), add(mul(fl, lf), mul(fu, up))));
  const roar = clamp01(q.pt);
  // his skull, the skin drawn tight over it; where his face is, the dark of the cage
  const faceDark = (u: V3): boolean => u[0] > 0.42 && u[2] < 0.42 && u[2] > -1.05 && Math.abs(u[1]) < 0.86;
  put('head', 'head', { k: 'ball', c: at(-0.8, 0, 0.4), ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: (u, tone) => (faceDark(u) ? CAGE_DARK : GAUNT[tone]) });
  // his jaw, long, under the cage; dropped open as he roars, the dark of his mouth behind the bars
  put('head', 'head', { k: 'ball', c: at(1.0, 0, -hr[2] * 0.72 - 2.6 * roar), ax: [mul(ff, hr[0] * 0.7), mul(fl, hr[1] * 0.66), mul(fu, 3.0)], skin: (u, tone) => (u[0] > 0.3 ? CAGE_DARK : GAUNT[Math.max(0, tone - 1)]) });
  // (his temples sunk, his cheekbones sharp: the light catching the bone at each side of the cage)
  for (const sg of [1, -1]) put('head', 'head', { k: 'ball', c: at(hr[0] * 0.42, sg * hr[1] * 0.74, -hr[2] * 0.18), ax: [mul(ff, 2.0), mul(fl, 1.3), mul(fu, 1.6)], skin: GAUNT });
  // the pink burning in the dark of his cage: his two eyes, and embers deeper in
  if (lit > 0.05) {
    const heat = lit * (1 + 0.7 * clamp01(m.glint));
    for (const deg of eyesToward(st, s)) {
      const a = deg * D;
      const e = at(Math.cos(a) * hr[0] * 0.98 - 0.8, Math.sin(a) * hr[1] * 0.72, hr[2] * 0.12 + 0.4);
      const n = norm(add(mul(ff, Math.cos(a)), mul(fl, Math.sin(a))));
      put('head', 'head', { k: 'dot', p: e, c: heat > 1.25 ? FLAME[4] : SOCKET, facing: n, c2: heat > 1.25 ? FLAME[3] : FLAME[2] });
      if (dot(n, st.eye) > 0.05) put('head', 'head', { k: 'glow', p: e, c: SOCKET, r: 6 + 3 * Math.max(0, heat - 1), a: Math.min(0.85, 0.5 * heat) });
    }
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + m.t * 1.4;
      const e = at(hr[0] * 0.92 - 0.8, Math.cos(a) * hr[1] * 0.45, -hr[2] * 0.42 + Math.sin(a) * 1.8 - roar * 1.5);
      if (hash(i, Math.floor(m.t * 6 + 1e-6), 53) < 0.55 * lit) put('head', 'head', { k: 'dot', p: e, c: FLAME[0], facing: ff });
    }
  }
  // his hair, lank and black, hanging from the crown behind the cage
  for (let i = 0; i < 9; i++) {
    const a = (100 + (160 * i) / 8) * D;
    const root = at(Math.cos(a) * hr[0] * 0.6 - 1.2, Math.sin(a) * hr[1] * 0.85, hr[2] * 0.78);
    const hang = 14 + 6 * hash(i, 1, 59);
    const sway = Math.sin(wave + i) * 0.9;
    const tipH = add(add(root, add(mul(ff, -2.2 + lag[0] * 0.3), mul(fl, Math.sin(a) * 2.4 + sway))), [lag[0] * 0.6, lag[1] * 0.6, -hang]);
    put('hair', 'head', { k: 'rod', a: root, b: tipH, ra: 1.3, rb: 0.5, ramp: HAIR });
  }
  // THE CAGE: a band round his brow, a band round under his jaw, a band across his mouth; bars from brow to jaw, bowed out over his
  // face like a muzzle; straps over his crown; bolts where they cross; a lock on its side
  {
    const R0 = 1.14;
    const ring = (up: number, from: number, to: number, out: number, rr: number, bulge = 0): void => {
      let last: V3 | null = null;
      for (let d = from; d <= to + 1e-6; d += 12) {
        const a = d * D;
        const k = Math.cos(a);
        const p = at(Math.cos(a) * hr[0] * out + Math.max(0, k) * bulge - 0.8, Math.sin(a) * hr[1] * out, up);
        if (last) put('cage', 'cage', { k: 'rod', a: last, b: p, ra: rr, rb: rr, ramp: BLACK_IRON });
        last = p;
      }
    };
    ring(hr[2] * 0.44, -180, 180, R0, 1.05);
    ring(-hr[2] * 1.02, -108, 108, 1.06, 1.0, 1.4);
    ring(-hr[2] * 0.36, -84, 84, 1.12, 0.8, 1.6);
    const bars = [-56, -28, 0, 28, 56];
    for (const d of bars) {
      const a = d * D;
      const k = Math.cos(a);
      const pTop = at(Math.cos(a) * hr[0] * (R0 + 0.02) - 0.8, Math.sin(a) * hr[1] * (R0 + 0.02), hr[2] * 0.44);
      const pMid = at(Math.cos(a) * hr[0] * 1.2 + k * 1.8 - 0.8, Math.sin(a) * hr[1] * 1.16, -hr[2] * 0.36);
      const pLow = at(Math.cos(a) * hr[0] * 1.08 + k * 1.4 - 0.8, Math.sin(a) * hr[1] * 1.06, -hr[2] * 1.02);
      put('cage', 'cage', { k: 'rod', a: pTop, b: pMid, ra: 0.72, rb: 0.72, ramp: BLACK_IRON });
      put('cage', 'cage', { k: 'rod', a: pMid, b: pLow, ra: 0.72, rb: 0.72, ramp: BLACK_IRON });
      for (const p of [pTop, pMid, pLow]) put('cage', 'cage', { k: 'ball', c: p, ax: sphere(0.95), skin: (u, tone) => BLACK_IRON[Math.min(4, tone + 1)] });
    }
    // the straps over his crown: front to back, and ear to ear
    for (const [from, to] of [[0, 180], [90, -90]] as const) {
      let last: V3 | null = null;
      for (let k = 0; k <= 8; k++) {
        const t = k / 8;
        const a = (from + (to - from) * t) * D;
        const arch = Math.sin(t * Math.PI);
        const p = from === 0 ? at(Math.cos(a) * hr[0] * 1.1 - 0.8, 0, hr[2] * 0.44 + arch * hr[2] * 0.66) : at(-0.8 - 0.6, Math.cos(((to - from) * t + 90) * D) * hr[1] * 1.1, hr[2] * 0.44 + arch * hr[2] * 0.62);
        if (last) put('cage', 'cage', { k: 'rod', a: last, b: p, ra: 0.85, rb: 0.85, ramp: BLACK_IRON });
        last = p;
      }
    }
    // the lock, a heavy square of iron on his left
    put('cage', 'cage', { k: 'ball', c: at(-1.4, hr[1] * 1.12, -hr[2] * 0.35), ax: [mul(ff, 2.0), mul(fl, 1.1), mul(fu, 2.4)], skin: (u, tone) => (Math.abs(u[0]) < 0.25 && u[2] < 0.2 && u[2] > -0.5 && u[1] > 0.4 ? INK : BLACK_IRON[tone]) });
  }

  // --- HIS CHAINS: from each wrist to the floor, trailing (the right one's end a hook); from his collar to the iron ball behind him;
  // as each move swings them (a chain a move has let go of, a hook flung out across the room, is the game's to draw then) ---
  const ropes = m.ropes;
  if (ropes) {
    for (const side of ['L', 'R'] as const) {
      const r = ropes[side];
      if (!r) continue;
      chainAlong(put, `chain${side}`, r, 1.2);
      if (side === 'R') hookOn(put, `chain${side}`, r);
    }
    const r = ropes.ball;
    if (r && r.length > 2) {
      const ball = r[r.length - 1];
      const R = CO_KIT.ballR * K;
      chainAlong(put, 'ballchain', [...r.slice(0, -1), add(ball, mul(norm(sub(r[r.length - 2], ball)), R - 1.6))], 1.3);
      put('ball', 'ball', { k: 'ball', c: ball, ax: sphere(R), skin: ballSkin });
    }
  }
  // what is left of a chain he has broken off: a stub hanging from the cuff, from the collar's ring
  if (freed >= 1 || ropes?.stubL) {
    const c = cuffOf(s, 'L');
    chainAlong(put, 'cuffL', [c, add(c, [0.6 + lag[0] * 0.5, 0.4, -6.6])], 1.2);
  }
  if (freed >= 2 || ropes?.stubBall) chainAlong(put, 'collar', [ringAt, add(ringAt, add(mul(cf, -1.4), [lag[0] * 0.5, 0, -7.4]))], 1.3);
  if (ropes) paintThrownOff(put, ropes);
  return bits;
}

/** His iron ball's skin: black iron, pitted, a few spots of rust. */
const ballSkin: Skin = (u, tone) => (hash(Math.round(u[0] * 4), Math.round(u[1] * 4 + u[2] * 7), 17) < 0.12 ? RUST[Math.max(1, Math.min(3, tone))] : BLACK_IRON[Math.min(4, tone)]);

/** THE HOOK at the end of his right chain: heavy black iron, its point curled back to one side; kept out of the floor. */
function hookOn(put: Put, part: string, path: ReadonlyArray<V3>): void {
  const end = path[path.length - 1];
  const dir = norm(sub(end, path[path.length - 2]), [-1, 0, 0]);
  const side3 = norm([-dir[1], dir[0], 0], [0, 1, 0]);
  const up = (p: V3): V3 => [p[0], p[1], Math.max(1.2, p[2])];
  const p1 = up(add(end, mul(dir, 6)));
  const p2 = up(add(add(p1, mul(dir, 3.6)), mul(side3, 3.6)));
  const p3 = up(add(add(p1, mul(dir, 0.6)), mul(side3, 6.6)));
  put(part, part, { k: 'rod', a: end, b: p1, ra: 1.5, rb: 1.5, ramp: BLACK_IRON });
  put(part, part, { k: 'rod', a: p1, b: p2, ra: 1.5, rb: 1.25, ramp: BLACK_IRON });
  put(part, part, { k: 'rod', a: p2, b: p3, ra: 1.25, rb: 0.45, ramp: BLACK_IRON });
}

/** WHAT HIS MOVES THROW OFF (as art/bosses3.ts paints it, made as big as he is): sparks, dust, a flash; a streak of the enemy's fire behind his whirling chains; links flying where one snaps. */
function paintThrownOff(put: Put, r: Ropes): void {
  (r.sparks ?? []).forEach((p, i) => put('sparks', 'sparks', { k: 'mote', p, c: i % 3 === 0 ? FLAME[4] : i % 3 === 1 ? FLAME[3] : '#ffe9a8', size: i % 4 === 0 ? 2 : 1 }));
  (r.dust ?? []).forEach((p, i) => put('dust', 'dust', { k: 'mote', p, c: i % 2 ? '#4a4266' : '#6a6488', size: 2 }));
  for (const p of r.flash ?? []) put('flash', 'flash', { k: 'glow', p, c: FLAME[3], r: 18, a: 0.55 });
  for (const key of ['trailL', 'trailR']) {
    const t = r[key];
    if (!t) continue;
    for (let i = 1; i < t.length; i++) {
      for (let k = 0; k < 3; k++) {
        const p = lerp3(t[i - 1], t[i], k / 3);
        const c = i < 3 ? FLAME[4] : i < 6 ? FLAME[3] : i < 9 ? FLAME[2] : FLAME[1];
        put('trail', 'trail', { k: 'mote', p, c, size: i < 5 ? 2 : 1 });
      }
    }
    put('trail', 'trail', { k: 'glow', p: t[0], c: FLAME[3], r: 12, a: 0.3 });
  }
  (r.links ?? []).forEach((c, i) => {
    const d = norm([Math.cos(i * 2.1), Math.sin(i * 2.1), 0.4 * Math.sin(i * 1.3)], [1, 0, 0]);
    link(put, 'links', c, d, true, 1.2);
  });
}

/** THE SMEAR OF A STRIKE (as art/chained_action.ts paints it): pale motes along each after-image, the oldest thinned. */
const SMEAR = ['#6a5e80', '#b4a8c8', '#f6e8f0'] as const;
function smearBits(m: Moment): Bit[] {
  const bits: Bit[] = [];
  if (!m.ropes) return bits;
  for (const [key, line] of Object.entries(m.ropes)) {
    if (!key.startsWith('smear')) continue;
    const age = Number(key.split(':')[1]) / 6;
    if (age >= 0.999) continue;
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1];
      const b = line[i];
      const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 2.4));
      for (let e = 0; e < n; e++) {
        if (age < 0.5 && (e + i) % 2) continue;
        const p = lerp3(a, b, e / n);
        bits.push({ part: 'smear', piece: 'smear', shape: { k: 'mote', p: [p[0], p[1], Math.max(0.8, p[2])], c: age > 0.7 ? SMEAR[2] : age > 0.35 ? SMEAR[1] : SMEAR[0], size: age > 0.6 ? 2 : 1 } });
      }
    }
  }
  return bits;
}

// =============================================================================================
// HIM AS THE CHECKS SEE HIM (art/boss_checks.ts): his new body, his chains, his moves' blows and where they hand over

/**
 * HIS OUTSIDE AS SOLIDS, by name (as the old's: legL, shinL, footL, upperL, foreL, neck, head; chest, belly, hips), as he is now
 * painted: thinner than the old, his own chain wound round his limbs counted in. `k`: on bones of his new size (1), or of the old size
 * the moves were approved at (1 / LOOK_K: the same body made as much smaller).
 */
export function lookSolids(s: Skeleton, k = 1): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const B = scaled(CO_KIT.body, K * k);
  const SOLID_R = Object.fromEntries(Object.entries(SOLID_R0).map(([n, r]) => [n, r * k])) as typeof SOLID_R0;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: SOLID_R.leg },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: SOLID_R.shin },
      { name: `foot${side}`, a: L ? s.heelL : s.heelR, b: L ? s.toeL : s.toeR, r: SOLID_R.foot },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: SOLID_R.upper },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: SOLID_R.fore },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: s.skull, r: SOLID_R.neck }, { name: 'head', a: s.head, b: s.head, r: SOLID_R.head });
  const [cf, , cu] = s.chest;
  const lumps: CheckLump[] = [
    { name: 'chest', c: add(s.ribs, mul(cu, B.chest * 0.38)), rot: s.chest, h: [B.ribDeep * 1.0, B.ribHalf * 0.9, B.chest * 0.6] },
    { name: 'belly', c: add(s.waist, mul(s.belly[0], -B.waistDeep * 0.22)), rot: s.belly, h: [B.waistDeep * 0.62, B.waistHalf * 0.7, B.waist * 0.7] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.1)), rot: s.hips, h: [B.pelvisDeep * 0.8 + 1.5, B.pelvisHalf * 0.86 + 1.5, B.waist * 0.75] },
  ];
  void cf;
  return { limbs, lumps };
}

/** THE NEW LOOK AS THE CHECKS SEE HIM, as free as `mob` is (one of `chainedLookMob`'s): his new body; his chains, each from its fourth link on, the hook and the ball, as big as he is; each blow of each move as CHAINED_ACTION reviews them; where his moves hand over (the lash ending a step and more on, made as big as he is). */
export function lookShape(mob: Mob): BossShape {
  const freed: CoFreed = mob.id.startsWith('chained2') ? 2 : mob.id.startsWith('chained1') ? 1 : 0;
  const base = chainedActionMob(freed);
  const own = coActionShape(base);
  const game = coShape(base);
  void game;
  const ropes = (move: string, t: number): Ropes => {
    const mv = move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? mob[move] : move === 'dying' ? mob.dying : mob.more?.[move];
    return mv?.ropes?.(t) ?? {};
  };
  const lookOf = (m: Mob | undefined): Mob | undefined => {
    if (!m) return undefined;
    const f: CoFreed = m.id.startsWith('chained2') ? 2 : m.id.startsWith('chained1') ? 1 : 0;
    return chainedLookMob(f);
  };
  const handovers: Handover[] = (own.handovers ?? []).map((h) => ({ ...h, ...(h.shift ? { shift: [h.shift[0] * K, h.shift[1] * K] as const } : {}), ...(h.mob ? { mob: lookOf(h.mob) } : {}) }));
  const low = own.low ?? {};
  return {
    ...own,
    body: (s) => lookSolids(s),
    // (as low as each of these went in the old, made as big as he is: a knee on the floor is as much bigger as he is)
    low: Object.fromEntries(Object.entries(low).map(([k, v]) => [k, (v as number) * K - 0.1])) as BossShape['low'],
    thingsOf: (other) => lookShape(other).things,
    handovers,
    things: (move, t) => {
      const r = ropes(move, t);
      const out: CheckThing[] = [];
      for (const name of CO_KIT.ropes as ReadonlyArray<CoRope>) {
        const ch = r[name];
        if (!ch || ch.length < 5) continue;
        const spec = CO_KIT.spec[name];
        const last = name === 'ball' ? ch.length - 1 : ch.length;
        const pts: V3[] = [];
        for (let i = 3; i < last; i++) {
          pts.push(ch[i]);
          if (i + 1 < last) pts.push(lerp3(ch[i], ch[i + 1], 0.5));
        }
        const may = name === 'L' ? ['upperL', 'foreL', ...(move === 'breakL' ? ['footL'] : [])] : name === 'R' ? ['upperR', 'foreR'] : move === 'ball' ? ['foreL', 'foreR'] : [];
        out.push({ name: name === 'ball' ? 'ball chain' : `${name} chain`, pts, r: spec.r * K, may });
        if (name === 'R') {
          const end = ch[ch.length - 1];
          out.push({ name: 'hook', pts: [end, add(end, mul(norm(sub(end, ch[ch.length - 2]), [-1, 0, 0]), 5 * K))], r: (spec.endR ?? spec.r) * K, may });
        }
        if (name === 'ball') out.push({ name: 'ball', pts: [ch[ch.length - 1]], r: (spec.endR ?? spec.r) * K, may: move === 'ball' ? ['foreL', 'foreR'] : [] });
      }
      return out;
    },
  };
}

/**
 * THE NEW BODY ON THE BONES AT THE SIZE HIS MOVES WERE APPROVED AT: the moves of art/chained_action.ts as they are (`mob`, one of
 * `chainedActionMob`'s), reviewed with this body's solids made 1 / LOOK_K as big. The review's lines are in the game's pixels, the same
 * for a figure of any size; so this is the review of the new look with its lines as much bigger as he now is.
 */
export function lookShapeApproved(mob: Mob): BossShape {
  return { ...coActionShape(mob), body: (s) => lookSolids(s, 1 / K), thingsOf: (other) => lookShapeApproved(other).things };
}

// =============================================================================================
// FOR THE GAME: where what he flings is, from his hands as big as he now is

/** For the game (the main chat's to bring in): the lash carries him `LOOK_TRAVEL` (his lengths: 1.22 tiles) in place of LASH_TRAVEL (1.02). */
export const LOOK_TRAVEL = LASH_TRAVEL * K;
/** HIS HOOK OUT ACROSS THE ROOM (as `actHookPath`, art/chained_action.ts): from his cuff, as big as he is, out to `reach` tiles. */
export function lookHookPath(t: number, reach = 4.5): { at: [number, number, number]; flying: boolean } | null {
  const old = actHookPath(t, reach);
  if (!old) return null;
  const from0 = actHookPath(HOOK_LET, reach)!.at;
  const back0 = actHookPath(HOOK_BACK - 1e-6, reach)!.at;
  if (old.flying) {
    // (along the same way, from where his hand now lets it go)
    const k = clamp01((t - HOOK_LET) / (HOOK_BITE - HOOK_LET));
    const from: [number, number, number] = [from0[0] * K, from0[1] * K, from0[2] * K];
    const to: [number, number, number] = [reach, from[1] * 0.3, 1];
    return { at: [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k, from[2] + (to[2] - from[2]) * k + 6 * Math.sin(Math.PI * k)], flying: true };
  }
  // (hauled back as before, to his feet where they now are)
  const span = reach - back0[0];
  const k = span > 1e-6 ? clamp01((reach - old.at[0]) / span) : 1;
  const back: [number, number, number] = [back0[0] * K, back0[1] * K, 1];
  return { at: [reach + (back[0] - reach) * k, old.at[1] + (back[1] - back0[1]) * k, 1], flying: false };
}
/** HIS BALL OUT ACROSS THE ROOM (as `actBallPath`, art/chained_action.ts): whipped down from his hands, as high as he now holds it, to land `reach` tiles off; hauled back to before his feet. */
export function lookBallPath(t: number, reach = BALL_REACH): { at: [number, number, number]; flying: boolean } | null {
  const old = actBallPath(t, reach);
  if (!old) return null;
  const R = (CO_KIT.ballR * K) / 2;
  if (old.flying) {
    const from0 = actBallPath(BALL_LET, reach)!.at;
    const from: [number, number, number] = [from0[0] * K, from0[1] * K, from0[2] * K];
    const to: [number, number, number] = [reach, 0, R];
    const k = clamp01((t - BALL_LET) / (BALL_LAND - BALL_LET));
    return { at: [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k, from[2] + (to[2] - from[2]) * (0.4 * k + 0.6 * k * k) + 8 * Math.sin(Math.PI * k)], flying: true };
  }
  const back0 = actBallPath(BALL_BACK - 1e-6, reach)!.at;
  const span = reach - back0[0];
  const k = span > 1e-6 ? clamp01((reach - old.at[0]) / span) : 1;
  return { at: [reach + (back0[0] * K - reach) * k, old.at[1] * (1 + (K - 1) * k), R], flying: false };
}
void CO_REST;
