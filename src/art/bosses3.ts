// THE BOSSES OF DUNGEONS 2 TO 4, ON THE HEROES' BONES (the art chat, 9 Oct 2026). A MOCK-UP: NOT IN
// THE GAME. Nothing of the game imports this file, and `BOSSES.on`, the switch a later chat would put
// them in by, is off.
//
// His words, 9 Oct, in the art chat: at 16:29, "K I need 3 bosses"; at 16:30, "One I know I want is a
// bigger nastier ossuary amalgamation". Asked whether these were the first land's three, he answered
// by 16:37: "No I need three more Warden level bosses for dungeon 2-4.  Then we’ll do the lair boss
// for dungeon 5". Of the others offered, his two: "The Chained One (Recommended)" and "The
// Headsman". At 16:48: "I’d like the same principals for animations used for characters on the
// bosses" (so: built on the heroes' bones, weight in every blow, feet that grip, what is loose
// follows, alive when still, heavy blows that land with a freeze, effects as big and wild as the Wave).
//
// Their briefs (the art rulebook's "A new character"), each asked as a pop-up:
//   THE HEADSMAN, by 16:46: "a giant hooded executioner with a great axe. Slow, terrible chops";
//     "Headless, his hood empty" (a hood over nothing, the pink burning in its dark); his basic attack
//     a chop, and "The sentence (Recommended)", "Wide sweep (Recommended)", "Whirling throw
//     (Recommended)"; "His hood falls empty" (he crumples, and his hood slips off: there was nothing
//     inside); for the Sound chat, "A tolling bell (Recommended)".
//   THE CHAINED ONE, by 16:44: "A starved giant, muzzled (Recommended)" (grey skin over bone, rags, an
//     iron cage bolted over his face; chains from his wrists, an iron ball dragged behind); he grows
//     wilder as his chains break; his basic attack a lash of a chain, and "Hook and drag
//     (Recommended)", "Chain whirl (Recommended)", "Ball throw (Recommended)"; "His chains drag him
//     down (Recommended)"; for the Sound chat, "Chains and a muffled roar (Recommended)".
//   THE OSSUARY AMALGAMATION, by 16:37 and 16:40: "A head over the Warden"; "Skulls and arms all over
//     (Recommended)", "It eats the dead", "It bursts apart"; "Hauls itself on its arms
//     (Recommended)"; its basic attack a swipe of its nearest arms, and "Arms from the floor
//     (Recommended)", "Skull swarm (Recommended)", "Devour (Recommended)"; bursting "As it's hurt
//     (Recommended)" (bone beasts break off it as it takes damage; any left alive, it eats back); for
//     the Sound chat, "A hundred jaws grinding (Recommended)".
//
// They are monsters of art/new_mobs3.ts's kind (a `Mob`: posed on the heroes' bones, dressed in the
// heroes' solids, lit from the upper left, the enemy's pink edge round each living one), each on a
// canvas of its own (BOSS_CANVAS): they are the Warden's size, twice a skeleton's.

import type { ActorArt } from './actor_types';
import { INK, STEEL, dim, hash, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import type { Sprite } from '../engine/px';
import { ENEMY_RIM, FLAME, IRON, RUST, SOCKET } from './mkit';
import { TILE3, bandOn, bundle, canvasOf, eyesOf, faceAlong, mobSet, packed, paintBits, paintViewOf, posedOfMob, skeletonAt, skull, sphere } from './new_mobs3';
import type { Bit, Frame3, Mob, MobCanvas, MobMove, Moment, PanelSkin, Put, Ropes } from './new_mobs3';
import { Chain, SIM_KEEP, SIM_STEP, alongPath, chainAt, closeLoop, outOfLimb, outOfLump, stepChain } from './boss_chains';
import type { ChainHold, ChainSpec, ChainTrack, Limb, Lump } from './boss_chains';
import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import { eyesToward, mid, skirtOf, stage, wornOn } from './skin';
import type { GameView, PaintView, Ring, Skin, Stage } from './skin';
import { about, add, bonesAt, buildOf, cross, dot, elbowFor, heading, len, lerp3, mul, norm, solve, standing, sub } from './skeleton';
import type { Bones, Build, HandIn, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file; a chat that puts these bosses in, on the owner's yes, does it behind this. */
export const BOSSES = { on: false };

/** Their canvas: the Warden's height and more above the floor point, room for an axe raised over a head and swung all round. */
export const BOSS_CANVAS: MobCanvas = { w: 320, h: 256, ax: 150, ay: 214 };
/** The Chained One's floor point on his canvas: room for his chains flung out all round him, and a ball held high over his head. */
const CO_CANVAS_AX = 210;
const CO_CANVAS_AY = 236;

const D = Math.PI / 180;
const FR = 1 / 30;
type P = Partial<Bones>;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
/**
 * A BODY TURNED ROUND, LEANING THE WAY IT FACES. The bones tip a body about the figure's own axes
 * (`pitch` toward where the figure faced at first, `roll` to its right), not the way it has turned
 * (skeleton.ts, `orient`); so a body turned round that leans forward must lean so on those axes. For
 * hips turned `yaw` degrees that lean `fwd` forward and `aside` to their right, and a chest turned
 * `twist` further that leans `more` forward again: the bones' pitch, roll, bend and side.
 */
function leaning(yaw: number, fwd: number, more: number, twist = 0, aside = 0): P {
  const tip = (F: number, A: number, th: number): [number, number] => {
    // (the way up it is tipped to: `F` toward its facing `th`, `A` to its right; as pitch and roll on the figure's axes)
    const f = F * D;
    const a = A * D;
    const t = th * D;
    const up: V3 = norm([Math.sin(f) * Math.cos(t) + Math.sin(a) * Math.sin(t), Math.sin(f) * Math.sin(t) - Math.sin(a) * Math.cos(t), Math.cos(f) * Math.cos(a)]);
    const roll = -Math.asin(Math.max(-1, Math.min(1, up[1]))) / D;
    const pitch = Math.atan2(up[0], up[2]) / D;
    return [pitch, roll];
  };
  const [p1, r1] = tip(fwd, aside, yaw);
  const [p2, r2] = tip(fwd + more, aside, yaw + twist);
  return { pitch: p1, roll: r1, bend: p2 - p1, side: r2 - r1 };
}
/** A length that is the figure's own, kept to at most `most`. */
function capped(v: V3, most: number): V3 {
  const l = len(v);
  return l > most ? mul(v, most / l) : v;
}

// --- FEET THAT GRIP THE FLOOR (the art rulebook, Movement 8: "Feet grip the floor"; and How art is
// made 7, every boss through every check: art/boss_checks.ts). A boss's footwork is laid over his
// keys: each foot is DOWN where it lands and stays there, its toe (or heel) on the same spot, while
// the body moves over it; it may turn on its ball, its heel coming up, or rock back onto its heel;
// it moves only LIFTED, in a step. ---

const rotY = (v: V3, a: number): V3 => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
const rotZ = (v: V3, a: number): V3 => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), v[2]];
/** From a foot's ankle to its toe (or heel), the foot turned `turn` degrees to the left and tipped `pitch` toes-down, as the bones put it. */
function footOff(B: Build, on: 'toe' | 'heel', turn: number, pitch: number): V3 {
  return rotZ(rotY(on === 'toe' ? [B.ball, 0, -B.ankle] : [-B.heel, 0, -B.ankle], pitch * D), turn * D);
}
/** A FOOT PUT DOWN (`Plant`): its toe (or its heel, `on`) on this spot of the floor (forward, to the figure's left), the foot turned `turn` degrees to the left, tipped `pitch` toes-down (its heel up; less than nothing, its toes up, rocked back on its heel). */
export interface Plant {
  at: readonly [number, number];
  turn: number;
  pitch?: number;
  on?: 'toe' | 'heel';
}
/** The bones' fields for a foot put down so (`lift`: that far above the floor). */
function footOn(B: Build, side: 'L' | 'R', p: Plant, lift = 0): P {
  const pitch = p.pitch ?? 0;
  const o = footOff(B, p.on ?? 'toe', p.turn, pitch);
  const fx = p.at[0] - o[0];
  const fy = p.at[1] - o[1] - (side === 'L' ? 1 : -1) * B.stance;
  const fz = lift - o[2] - B.ankle;
  return side === 'L' ? { lfx: fx, lfy: fy, lfz: fz, lfp: pitch, lft: p.turn } : { rfx: fx, rfy: fy, rfz: fz, rfp: pitch, rft: p.turn };
}
/** Where a foot stands in a pose (what the pose does not say, as `rest` has it): its toe's spot (or its heel's), turned and tipped as it is. */
function plantOf(B: Build, side: 'L' | 'R', pose: P, rest: Bones, on: 'toe' | 'heel' = 'toe'): Plant {
  const q = { ...rest, ...pose } as Bones;
  const L = side === 'L';
  const turn = L ? q.lft : q.rft;
  const pitch = L ? q.lfp : q.rfp;
  const o = footOff(B, on, turn, pitch);
  return { at: [(L ? q.lfx : q.rfx) + o[0], (L ? q.lfy : q.rfy) + (L ? 1 : -1) * B.stance + o[1]], turn, pitch, on };
}
/** The same foot, the same spot under it, held on its other end (its heel's spot for its toe's, as it lies). */
function heldBy(B: Build, side: 'L' | 'R', p: Plant, on: 'toe' | 'heel'): Plant {
  if ((p.on ?? 'toe') === on) return p;
  const pose = footOn(B, side, p);
  return plantOf(B, side, pose, {} as Bones, on);
}
/** A plant moved along the floor (`dx` forward, `dy` to the left) and turned further (`dt` degrees): where a foot steps to. */
function plantBy(p: Plant, dx: number, dy: number, dt = 0, more: Partial<Plant> = {}): Plant {
  return { ...p, at: [p.at[0] + dx, p.at[1] + dy], turn: p.turn + dt, ...more };
}
/** One thing a foot does: from `t0` to `t1` it steps (lifted `lift` high at the top: a step) or turns where it stands (`lift` 0: on its ball or heel, the spot under it staying), and is then down `to`. */
export interface FootMove {
  t0: number;
  t1: number;
  to: Plant;
  lift?: number;
  /** A step that goes round this spot of the floor (a turn on the spot: both feet round under him), not straight across; the spot moving to `aboutTo` as it goes (a turn that carries him somewhere). */
  about?: readonly [number, number];
  aboutTo?: readonly [number, number];
  /** And this much wider of it half way round (to go round something on the floor). */
  wide?: number;
}
/** A FOOT'S WAY THROUGH A MOVE: down where it starts, then what it does, in order. */
export interface FootTrack {
  start: Plant;
  moves: ReadonlyArray<FootMove>;
  /** If said: the knee pointed the way the foot is turned, this many degrees more (a body that turns round over its feet: its knees go with them). */
  knee?: number;
}
/**
 * A BODY ON ITS KNEES, OR GOING OVER FROM THEM (a boss dying): its feet up on their toes where they
 * stand (`feet`, `tuck` degrees); its knees on the floor (`kneeZ` up: as big as they are) a shin's length
 * before them, a little in toward its middle; its hips over them, leaning `lean` degrees forward of
 * upright (0, kneeling up; near 90, lying on its face). The bones' fields for its hips and its legs.
 */
function kneelHips(B: Build, rest: Bones, feet: Record<'L' | 'R', Plant>, tuck: number, kneeZ: number, lean: number): P {
  const f: V3 = [Math.cos(rest.yaw * D), Math.sin(rest.yaw * D), 0];
  const l: V3 = [-f[1], f[0], 0];
  const side = (sd: 'L' | 'R'): { k: V3; a: V3; h: V3 } => {
    const toe = feet[sd];
    const o = footOff(B, 'toe', toe.turn, tuck);
    const a: V3 = [toe.at[0] - o[0], toe.at[1] - o[1], -o[2]];
    const across = (sd === 'L' ? 1 : -1) * (B.hipHalf + 4) - dot(a, l);
    const reach = Math.sqrt(Math.max(1, B.shank * B.shank - (a[2] - kneeZ) * (a[2] - kneeZ) - across * across));
    const k: V3 = add(add(add(a, mul(f, reach)), mul(l, across)), [0, 0, kneeZ - a[2]]);
    const h: V3 = add(k, add(mul(f, B.thigh * Math.sin(lean * D)), [0, 0, B.thigh * Math.cos(lean * D)]));
    return { k, a, h };
  };
  const L = side('L');
  const R = side('R');
  const hip = lerp3(L.h, R.h, 0.5);
  // (each knee pointed at where it comes down, from between its hip and its ankle)
  const pole = (x: { k: V3; a: V3; h: V3 }): [number, number] => {
    const d = sub(x.k, lerp3(x.h, x.a, 0.5));
    return [Math.atan2(d[1], d[0]) / D, Math.atan2(d[2], Math.hypot(d[0], d[1])) / D];
  };
  const [lk, lkUp] = pole(L);
  const [rk, rkUp] = pole(R);
  return { px: hip[0], py: hip[1], pz: hip[2] - (B.ankle + B.shank + B.thigh), lk, lkUp, rk, rkUp };
}
/** A pose on its knees let down (or held up) until its lower knee rests on the floor, its feet up on their toes where they stand. */
function kneelSettle(B: Build, rest: Bones, pose: P, feet: Record<'L' | 'R', Plant>, tuck: number, kneeZ: number): P {
  const ft: P = { ...footOn(B, 'L', { ...feet.L, pitch: tuck }), ...footOn(B, 'R', { ...feet.R, pitch: tuck }) };
  const lowKnee = (pz: number): number => {
    const s = solve(B, { ...rest, ...pose, ...ft, pz } as Posed);
    return Math.min(s.kneeL[2], s.kneeR[2]);
  };
  let lo = (pose.pz as number) - 25;
  let hi = (pose.pz as number) + 25;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (lowKnee(mid) > kneeZ) hi = mid;
    else lo = mid;
  }
  return { ...pose, pz: (lo + hi) / 2 };
}
const smooth01 = (u: number): number => {
  const k = clamp01(u);
  return k * k * (3 - 2 * k);
};
/**
 * HIS FEET THROUGH A MOVE: each foot where its track has it at each moment (laid over the move's keys:
 * `MobMove.feet`). A step lifts the foot straight up off its spot before it goes, and sets it straight
 * down onto the next (it goes forward on a slow start and a slow end while it is up: so a foot never
 * moves along the floor while it touches it); a turn where it stands keeps the spot under it.
 */
function footwork(B: Build, tracks: Partial<Record<'L' | 'R', FootTrack>>, carry = 0): (t: number) => P {
  // (`carry`: the game carrying him on along his forward at this pace while the move plays: a foot's spots are on the floor, which goes back under him)
  const back = (p: Plant, t: number): Plant => (carry ? { ...p, at: [p.at[0] - carry * t, p.at[1]] } : p);
  const footOnAt = (side: 'L' | 'R', p: Plant, t: number, lift = 0): P => footOn(B, side, back(p, t), lift);
  return (t) => {
    const out: P = {};
    for (const side of ['L', 'R'] as const) {
      const tr = tracks[side];
      if (!tr) continue;
      let at: Plant = tr.start;
      let pose: P | null = null;
      for (const mv of tr.moves) {
        if (t >= mv.t1) {
          at = mv.to;
          continue;
        }
        if (t <= mv.t0) break;
        const u = (t - mv.t0) / (mv.t1 - mv.t0);
        const lift = mv.lift ?? 0;
        if (lift > 0) {
          // (up off its spot, over, and down onto the next: its height rises fast and falls fast; it goes along only while it is up)
          const a = heldBy(B, side, at, 'toe');
          const b = heldBy(B, side, mv.to, 'toe');
          const g = smooth01((u - 0.12) / 0.76);
          const h = lift * Math.pow(Math.sin(Math.PI * clamp01(u)), 0.6);
          const pitch = (a.pitch ?? 0) * (1 - g) + (b.pitch ?? 0) * g;
          let at2: [number, number] = [a.at[0] + (b.at[0] - a.at[0]) * g, a.at[1] + (b.at[1] - a.at[1]) * g];
          if (mv.about) {
            // (round the spot it turns about, the way the foot itself turns, and as far as takes it to where it goes)
            const o0 = mv.about;
            const o1 = mv.aboutTo ?? mv.about;
            const ra = Math.hypot(a.at[0] - o0[0], a.at[1] - o0[1]);
            const rb = Math.hypot(b.at[0] - o1[0], b.at[1] - o1[1]);
            const angA = Math.atan2(a.at[1] - o0[1], a.at[0] - o0[0]);
            let dAng = Math.atan2(b.at[1] - o1[1], b.at[0] - o1[0]) - angA;
            const want = (b.turn - a.turn) * D;
            dAng += 2 * Math.PI * Math.round((want - dAng) / (2 * Math.PI));
            const ang = angA + dAng * g;
            const rr = ra + (rb - ra) * g + (mv.wide ?? 0) * Math.sin(Math.PI * g);
            const o: [number, number] = [o0[0] + (o1[0] - o0[0]) * g, o0[1] + (o1[1] - o0[1]) * g];
            at2 = [o[0] + rr * Math.cos(ang), o[1] + rr * Math.sin(ang)];
          }
          pose = footOnAt(side, { at: at2, turn: a.turn + (b.turn - a.turn) * g, pitch, on: 'toe' }, t, h);
        } else {
          // (turned where it stands: the spot under its ball, or its heel, stays where it is)
          const on = mv.to.on ?? 'toe';
          const a = heldBy(B, side, at, on);
          const g = smooth01(u);
          pose = footOnAt(side, { at: a.at, turn: a.turn + (mv.to.turn - a.turn) * g, pitch: (a.pitch ?? 0) + ((mv.to.pitch ?? 0) - (a.pitch ?? 0)) * g, on }, t);
        }
        break;
      }
      const f = pose ?? footOnAt(side, at, t);
      Object.assign(out, f);
      if (tr.knee !== undefined) {
        if (side === 'L') out.lk = (f.lft as number) + tr.knee;
        else out.rk = (f.rft as number) + tr.knee;
      }
    }
    return out;
  };
}

// =============================================================================================
// 1. THE HEADSMAN
//
// A giant executioner, the Warden's height: AN EMPTY HOOD on a body of leather and iron. His hood is
// the old executioner's, tall and pointed, of a red so dark it is nearly black, a short cape of it
// over his shoulders cut into points at its hem; and inside it there is nobody: its opening is dark
// all the way in, and the pink burns in that dark. A long coat of dark leather to below his knees, a
// broad belt, a heavy apron hanging before him; sleeves to gauntlets of iron, fists like mallets;
// boots. His GREAT AXE: a long haft of dark wood bound in iron, and a broad crescent of black steel,
// its edge bright. Standing, its head rests on the floor at his right foot; his hood turns slowly
// from side to side, looking for the condemned.

/** His body: a giant's, broad and heavy, thick in every limb (the knight is 58 tall). */
const HS_BODY: Build = buildOf(112, 1, { shoulders: 1.36, chest: 1.38, depth: 1.25, waist: 1.3, hips: 1.22, legs: 0.92, arms: 1.18, trunk: 1.0, limbs: 1.62, pad: 2.6 });
const HB = HS_BODY;

/** His colours: the hood and its cape, a red so dark it is nearly black; the coat and the boots, dark leather; the apron, a darker red leather; his gauntlets and the axe's bands, iron; the blade, black steel with a bright edge. */
export const HOOD: Ramp = ['#14040c', '#14040c', '#36091d', '#5c1532', '#5c1532'];
export const COAT: Ramp = ['#0f0b18', '#0f0b18', '#221a33', '#3b3052', '#3b3052'];
const APRON: Ramp = ['#2a0e14', '#2a0e14', '#521c28', '#7c3040', '#7c3040'];
const BOOT: Ramp = ['#0c0914', '#0c0914', '#1c162a', '#332a48', '#332a48'];
const HAFT: Ramp = dim(['#2a2466', '#2a2466', '#4640a0', '#6e68cc', '#6e68cc']);
/** The blade: black steel (the kit's steel, a step darker), its edge the kit's bright steel. */
const BLACK_STEEL: Ramp = ['#1a1640', '#1a1640', '#36306e', '#5c56a0', '#5c56a0'];

/**
 * HIS AXE: the haft from its butt to the eye of the head (and a little past it); where his right hand
 * holds it, `draw` of the way from near the butt (0: to chop) up to near the head (1: to carry it,
 * or stand it on the floor); the blade's reach out from the haft and its height along it.
 */
const AXE_LEN = 82;
const AXE_HOLD = (draw: number): number => 8 + 46 * clamp01(draw);
const BLADE_OUT = 30;
const BLADE_TALL = 46;

/** How he stands: feet set wide, knees bent under the weight, leaning a little forward over them; his hood a little down, looking toward you. */
const HS_HANG = -(HB.upperArm + HB.foreArm) * 0.9;
const HS_BASE: Bones = {
  ...standing(HB),
  pz: -2.4, px: 0, yaw: -10, pitch: 5, roll: 0, twist: -6, bend: 9, side: 0,
  faceTurn: 8, faceUp: -6, faceTilt: 0,
  lfx: 5, lfy: 7, lft: 16, lk: 12, rfx: -5, rfy: -7, rft: -20, rk: -12,
  lhIn: 0, lhx: 3, lhy: 5, lhz: HS_HANG, le: -10,
  rhIn: 0, rhx: 4, rhy: -5, rhz: HS_HANG, re: 10,
  wAz: 0, wEl: -80, wRoll: 0, draw: 0, pt: 0, out: 0, prop: 0, gale: 0,
};

/**
 * HOW THE AXE LIES IN A KEY: the way its haft runs (`wAz`, `wEl`: as `heading` has it; `over`, if the
 * way it is to go on from there is over the top, says it as up past straight up and back, so that it
 * goes over and not round) and the way its blade faces (`pAz`, `pEl`, as a way: `resolveAxe` makes the
 * pose's roll of it from that, about the haft from his chest's left).
 */
function axeWay(pt: V3, edge: V3, over = false): P {
  const p = norm(pt);
  const e = norm(sub(edge, mul(p, dot(edge, p))), [0, 0, -1]);
  const az = Math.atan2(p[1], p[0]) / D;
  const el = Math.asin(Math.max(-1, Math.min(1, p[2]))) / D;
  return { wAz: over ? az + 180 : az, wEl: over ? 180 - el : el, wRoll: 0, pAz: Math.atan2(e[1], e[0]) / D, pEl: Math.asin(Math.max(-1, Math.min(1, e[2]))) / D };
}
/** The axe from a point its eye is to be at, his right hand where it is (`HandIn` 2: from his place on the floor). */
function axeTo(grip: V3, eye: V3, bladeWay: V3): P {
  return { rhIn: 2, rhx: grip[0], rhy: grip[1], rhz: grip[2], ...axeWay(sub(eye, grip), bladeWay) };
}
/** What the blade's roll is measured from: his chest's left, square to the haft (a haft swung over his head goes through straight up, and a roll measured from straight up would throw the blade over there). */
function rollFrom(s: Skeleton): V3 {
  const p = s.point;
  const l = s.chest[1];
  const r = sub(l, mul(p, dot(l, p)));
  return len(r) > 1e-3 ? norm(r) : norm(cross(p, [0, 0, 1]), [0, 1, 0]);
}
/** THE WAY HIS BLADE FACES, on his bones: the pose's roll (as the bones give it, from straight up) laid off from his chest's left instead. */
export function axeEdgeOf(s: Skeleton): V3 {
  const p = s.point;
  let flat = sub([0, 0, 1], mul(p, p[2]));
  if (len(flat) < 1e-3) flat = [-1, 0, 0];
  flat = norm(flat);
  const ac = norm(sub(s.across, mul(p, dot(s.across, p))), flat);
  const roll = Math.atan2(dot(cross(flat, ac), p), dot(flat, ac)) / D;
  return about(rollFrom(s), p, roll);
}
/** Each key's roll of the blade, made from the way it is to face (its `pAz`, `pEl`), on the body as that key has it; each within half a turn of the last, so that it never spins round the long way. */
function resolveAxe(keys: ReadonlyArray<Key3>, rest: Bones): Key3[] {
  let last: number | undefined;
  return keys.map((k) => {
    const w = { ...rest, ...k.pose };
    const s = solve(HB, w as Posed);
    const p = s.point;
    const want = heading(w.pAz, w.pEl);
    const e = norm(sub(want, mul(p, dot(want, p))), rollFrom(s));
    const R = rollFrom(s);
    let roll = Math.atan2(dot(cross(R, e), p), dot(R, e)) / D;
    if (last !== undefined) roll -= 360 * Math.round((roll - last) / 360);
    last = roll;
    return { ...k, pose: { ...k.pose, wRoll: roll } };
  });
}
/** A pose standing alone (a rest), its blade's roll made as `resolveAxe` makes a key's. */
function resolvedRest(b: Bones): Bones {
  return { ...b, wRoll: (resolveAxe([{ at: 0, pose: {} }], b)[0].pose.wRoll as number) };
}
/**
 * STANDING STILL, AS HE WAS FIRST PAINTED (the owner's word by 18:23: "I like the ax head down between
 * his feet when he standing still"; and by 19:32, of a stand that had been changed: "You had standing
 * still right the first time.  How did it change to something worse?"): the axe upright on its head
 * by his right foot, the blade's flat toward whoever looks; his right hand on the haft at his hip, low
 * down it, near the head (`HandIn` 2: his hand stays where the axe stands as he breathes); his left arm
 * hanging at his side.
 */
const HS_GRIP_AT: V3 = [8.3, -28.3, 54.9];
const HS_HEAD_AT: V3 = [11, -31, 27.2];
export const HS_REST: Bones = resolvedRest({ ...HS_BASE, ...axeTo(HS_GRIP_AT, HS_HEAD_AT, norm([1, 1, 0])), re: 12, draw: 1 });

/**
 * THE BLADE, flat, as a panel: `a` out from the haft (0 at the haft, BLADE_OUT at the edge), `b`
 * along it (toward the haft's end): a crescent, narrow where it is set on the haft and broad at its
 * edge, the edge bowed out; black steel lit as one plane, a bright edge and a dark groove inside
 * it, spots of rust.
 */
const bladeSkin: PanelSkin = (a0, b, front, tone) => {
  const x = a0 + BLADE_OUT / 2;
  const half = BLADE_TALL / 2;
  const yy = b / half;
  // (its edge bows out; its top and foot sweep up and down from the neck to the edge's two horns)
  const edge = BLADE_OUT - 4.5 * yy * yy;
  if (x > edge) return null;
  const neck = 5.5;
  const k = Math.max(0, (x - 3) / (BLADE_OUT - 3));
  const reach = neck + (half - neck) * Math.pow(k, 1.7);
  if (Math.abs(b) > reach) return null;
  const t = front ? tone : Math.max(0, tone - 1);
  if (x > edge - 2.4) return STEEL[Math.min(4, t + 1)];
  if (x > edge - 3.6) return BLACK_STEEL[Math.max(0, t - 1)];
  if (x < 4.2 && Math.abs(b) < neck - 0.4) return IRON[Math.min(3, t)];
  if (hash(Math.round(x * 0.8), Math.round(b * 0.8), front ? 3 : 4) < 0.08) return RUST[Math.max(1, Math.min(3, t))];
  return BLACK_STEEL[t];
};

/** HIS AXE AS SOLIDS, from its butt along `pt`, its blade out along `out`: the haft bound in iron, the iron eye, the crescent of black steel, the poll. */
function axeSolids(put: Put, butt: V3, pt: V3, out: V3): void {
  const eye = add(butt, mul(pt, AXE_LEN));
  const end = add(eye, mul(pt, 8.5));
  put('haft', 'axe', { k: 'rod', a: butt, b: end, ra: 1.75, rb: 1.6, ramp: HAFT });
  put('haft', 'axe', { k: 'ball', c: butt, ax: sphere(2.5), skin: IRON });
  for (const k of [0.06, 0.5, 0.9]) bandOn(put, 'haft', 'axe', butt, eye, k, 2.05, 1);
  put('haft', 'axe', { k: 'ball', c: end, ax: sphere(2.1), skin: IRON });
  // the eye: an iron collar where the head is set on the haft
  put('head', 'axe', { k: 'rod', a: add(eye, mul(pt, -5)), b: add(eye, mul(pt, 6)), ra: 3.0, rb: 3.0, ramp: IRON });
  const c = add(eye, add(mul(out, BLADE_OUT / 2 + 1.5), mul(pt, 1.5)));
  put('blade', 'axe', { k: 'panel', c, u: mul(out, BLADE_OUT / 2), v: mul(pt, BLADE_TALL / 2), skin: bladeSkin });
  // (the back of the head: a short square poll)
  put('head', 'axe', { k: 'ball', c: add(eye, mul(out, -3.6)), ax: [mul(out, 2.4), mul(norm(cross(pt, out), [0, 0, 1]), 2.6), mul(pt, 4.2)], skin: IRON });
}

/**
 * A SKIRT KEPT CLOSE: no ring of it deeper or wider than `deep` and `wide`, nor further out from under
 * the waist than `off`, its hem's points with it. (A long skirt that goes round a leg wherever it is
 * makes a bell of a lunge: kept close, the knee comes out of it, as out of a coat's split.)
 */
function hugged(rings: Ring[], top: V3, deep: number, wide: number, off: number): Ring[] {
  return rings.map((r, i) => {
    if (i === 0) return r;
    const du = len(r.u);
    const dv = len(r.v);
    const ku = du > deep ? deep / du : 1;
    const kv = dv > wide ? wide / dv : 1;
    const fu = mul(r.u, 1 / Math.max(1e-6, du));
    const fv = mul(r.v, 1 / Math.max(1e-6, dv));
    const away: V3 = [r.c[0] - top[0], r.c[1] - top[1], 0];
    const far = len(away);
    const c: V3 = far > off ? [top[0] + (away[0] * off) / far, top[1] + (away[1] * off) / far, r.c[2]] : r.c;
    const pts = r.pts?.map((p) => {
      const d = sub(p, r.c);
      return add(c, add(add(mul(fu, dot(d, fu) * ku), mul(fv, dot(d, fv) * kv)), [0, 0, d[2]]));
    });
    return { c, u: mul(r.u, ku), v: mul(r.v, kv), pts };
  });
}

/** THE HEADSMAN AS SOLIDS: boots, coat, apron, belt, sleeves and gauntlets, the hood and its cape (empty), the axe. */
function headsmanBits(st: Stage, m: Moment): Bit[] {
  const { s, q } = m;
  const B = HB;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const lag = capped(mul(m.come, -1.4), 3.2);
  const wave = m.wind * Math.PI * 2;
  const flare = clamp01(q.gale);
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];

  // --- the legs: trousers to the knee, then boots, heavy, a cuff turned down at the top ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const [rH, rK, rA] = B.legR;
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH, rb: rK, ramp: BOOT, far: true });
    put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.05), skin: BOOT, far: true });
    const top = lerp3(knee, ankle, 0.22);
    put(`boot${side}`, `boot${side}`, { k: 'rod', a: top, b: ankle, ra: rK * 1.22, rb: rA * 1.3, ramp: COAT, far: true });
    const fwd = norm(sub(toe, heel), [1, 0, 0]);
    const side3 = norm([-fwd[1], fwd[0], 0], [0, 1, 0]);
    put(`boot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.46), [0, 0, 2.6]), ax: [mul(fwd, 9.0), mul(side3, 4.6), [0, 0, 3.0]], skin: COAT, far: true });
    put(`boot${side}`, `boot${side}`, { k: 'band', ring: { c: top, u: mul(f, rK * 1.35), v: mul(l, rK * 1.35) }, ramp: COAT, rows: 3 });
  }

  // --- his coat, to below his knees: its skirts SPLIT before and behind, one round each leg, so that
  // a stride or a lunge or a knee on the floor parts them (one skirt round both legs made a bell) ---
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.55));
  const skirts = (['L', 'R'] as const).map((side) => {
    const sgn = side === 'L' ? 1 : -1;
    const one: Skeleton = side === 'L' ? { ...s, hipR: s.hipL, kneeR: s.kneeL, ankleR: s.ankleL, heelR: s.heelL, toeR: s.toeL } : { ...s, hipL: s.hipR, kneeL: s.kneeR, ankleL: s.ankleR, heelL: s.heelR, toeL: s.toeR };
    const top: Ring = { c: add(waistC, mul(s.hips[1], sgn * B.waistHalf * 0.42)), u: mul(s.hips[0], B.waistDeep + 4.5), v: mul(s.hips[1], B.waistHalf * 0.66 + 4.5) };
    const rings = hugged(skirtOf(one, B, { top, drop: B.thigh * 1.32, wide: B.pelvisHalf * 0.6 + 6, deep: B.pelvisDeep + 8, lag, wind: m.wind, gale: q.gale, pad: 1.6 }), top.c, B.pelvisDeep + 9, B.pelvisHalf * 0.6 + 8, 9);
    put(`coat${side}`, 'coat', { k: 'cloth', rings, ramp: COAT, look: { folds: [30, -30, 90, -90, 150, -150], lift: 0.1 } });
    return rings;
  });

  // --- the body of the coat, up from the belt to his shoulders: a barrel of leather ---
  const be = s.belly;
  const torso: Ring[] = [
    { c: waistC, u: mul(be[0], B.waistDeep + 4.2), v: mul(be[1], B.waistHalf + 4.2) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 4.6), v: mul(cl, B.ribHalf + 5.2) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, B.ribDeep + 4.2), v: mul(cl, B.shoulderHalf + 1.5) },
    { c: add(s.neck, mul(cu, 1.2)), u: mul(cf, 6.5), v: mul(cl, 8.5) },
  ];
  put('body', 'body', { k: 'cloth', rings: torso, ramp: COAT, look: { folds: [0, 60, -60], lift: 0.05 } });
  // the belt, its buckle
  put('belt', 'belt', { k: 'band', ring: { c: add(waistC, mul(s.hips[2], 0.6)), u: mul(be[0], B.waistDeep + 4.8), v: mul(be[1], B.waistHalf + 4.8) }, ramp: BOOT, rows: 4 });
  const buckle = add(add(waistC, mul(s.hips[2], 0.6)), mul(be[0], B.waistDeep + 5.2));
  put('belt', 'belt', { k: 'ball', c: buckle, ax: [mul(be[0], 1.2), mul(be[1], 3.0), mul(s.hips[2], 2.4)], skin: IRON });

  // --- the apron: heavy leather hung from his belt before him, down past his knees ---
  {
    // (just outside the coat's front, at its top and at its hem: the coat goes round the legs, so the apron does too)
    const front = (r: Ring): number => dot(sub(r.c, waistC), f) + Math.abs(dot(r.u, f)) + Math.abs(dot(r.v, f));
    const hemOf = (sk: Ring[]): Ring => sk[Math.max(1, sk.length - 2)];
    const topF = Math.max(front(skirts[0][0]), front(skirts[1][0]));
    const hemF = Math.max(front(hemOf(skirts[0])), front(hemOf(skirts[1])));
    const hemZ = Math.max(4, Math.min(hemOf(skirts[0]).c[2], hemOf(skirts[1]).c[2]) + 3);
    const topA = add(add(waistC, mul(f, topF + 1.2)), [0, 0, -1]);
    const drop = topA[2] - hemZ;
    const swayA = Math.sin(wave + 0.4) * 0.8 + lag[0] * 0.3;
    const bot = add(add(waistC, mul(f, hemF + 1.6 + swayA)), [0, 0, hemZ - waistC[2]]);
    const c = mid(topA, bot);
    const halfW = B.pelvisHalf + 2;
    const v = mul(sub(bot, topA), 0.5);
    const apron: PanelSkin = (a, b2, front, tone) => {
      // (narrower at the belt, a seam down each side, its hem worn into a few notches)
      const k = (b2 / len(v) + 1) / 2;
      const w = halfW * (0.72 + 0.28 * k);
      if (Math.abs(a) > w) return null;
      if (k > 0.94 && hash(Math.round(a), 7, 11) < 0.35) return null;
      const t = front ? tone : Math.max(0, tone - 1);
      if (Math.abs(a) > w - 1.1) return APRON[Math.max(0, t - 1)];
      if (k > 0.9) return APRON[Math.max(0, t - 1)];
      return APRON[t];
    };
    put('apron', 'apron', { k: 'panel', c, u: mul(l, halfW), v, skin: apron });
  }

  // --- the arms: sleeves of the coat, gauntlets of iron to the elbow, fists like mallets ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    const [r0, r1, r2] = B.armR;
    put(`arm${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(r0 * 1.08), skin: COAT, far: true });
    put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.12, rb: r1 * 1.08, ramp: COAT, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.1), skin: COAT, far: true });
    const cuff = lerp3(el, hand, 0.26);
    put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: cuff, ra: r1 * 1.02, rb: r1 * 1.02, ramp: COAT, far: true });
    // (a gauntlet of black leather to the elbow, flaring at its cuff, bound with iron)
    put(`fore${side}`, `fore${side}`, { k: 'rod', a: cuff, b: add(hand, mul(fore, -1.4)), ra: r1 * 1.18, rb: r2 * 1.1, ramp: BOOT, far: true });
    for (const k of [0.08, 0.45, 0.8]) bandOn(put, `fore${side}`, `fore${side}`, cuff, hand, k, r1 * 1.22 - k * 1.6, 1);
    const fist = add(hand, mul(fore, 1.8));
    const flat = norm(sub(cf, mul(fore, dot(cf, fore))), cu);
    const across = norm(sub(cl, mul(fore, dot(cl, fore))), cl);
    put(`fore${side}`, `fist${side}`, { k: 'ball', c: fist, ax: [mul(fore, 3.9), mul(across, 3.5), mul(flat, 3.1)], skin: BOOT, far: true });
    // (iron over his knuckles)
    put(`fore${side}`, `fist${side}`, { k: 'rod', a: add(add(fist, mul(fore, 2.6)), mul(across, 2.4)), b: add(add(fist, mul(fore, 2.6)), mul(across, -2.4)), ra: 1.3, rb: 1.3, ramp: IRON, far: true });
  }

  // --- his hood and its cape: a short cape of it over the shoulders, cut into points at its hem;
  // the hood tall and pointed on top; and nobody in it: its opening dark all the way in, the pink burning there ---
  const face = wornOn(st, s, 10);
  const [ff, fl, fu] = face;
  const hc = add(s.head, add(mul(fu, -0.6), mul(ff, -0.6)));
  const hemPts: V3[] = [];
  const capeC = add(add(s.neck, mul(cu, -7.0)), mul(lag, 0.5));
  const capeU = mul(cf, B.ribDeep + 3.6);
  const capeV = mul(cl, B.shoulderHalf + 3.8);
  for (let i = 0; i < 24; i++) {
    const ang = (i / 24) * Math.PI * 2;
    const point = i % 2 === 0;
    const rear = Math.max(0, -Math.cos(ang));
    const p = add(capeC, add(mul(capeU, Math.cos(ang) * (1 + 0.04 * Math.sin(wave + ang))), mul(capeV, Math.sin(ang))));
    pts(p, point, rear);
  }
  function pts(p: V3, point: boolean, rear: number): void {
    hemPts.push(add(p, [0, 0, (point ? -3.0 : 0.6) - rear * flare * 4 + Math.sin(wave * 2 + p[0]) * 0.4]));
  }
  const cape: Ring[] = [
    { c: add(s.neck, mul(cu, 3.5)), u: mul(cf, 6.6), v: mul(cl, 7.4) },
    { c: add(s.neck, mul(cu, -1.6)), u: mul(cf, B.ribDeep + 2.6), v: mul(cl, B.shoulderHalf + 2.2) },
    { c: capeC, u: capeU, v: capeV, pts: hemPts },
  ];
  put('cape', 'cape', { k: 'cloth', rings: cape, ramp: HOOD, look: { folds: [20, -20, 70, -70, 120, -120, 180], lift: 0.25 } });
  // (the dark inside his collar, where a neck would come up: seen only when his hood is gone)
  const collar = add(s.neck, mul(cu, 3.2));
  put('cape', 'cape', { k: 'ball', c: collar, ax: [mul(cf, 6.0), mul(cl, 6.8), mul(cu, 1.4)], skin: (u) => (u[2] < -0.2 ? null : INK) });
  if (m.dying && m.t > HS_HOOD_GOES) {
    // the last of the pink, rising out of it and fading
    const k = (m.t - HS_HOOD_GOES) / 0.9;
    for (let i = 0; i < 12; i++) {
      const life = (k * 1.4 + hash(i, 1, 71)) % 1;
      if (k + hash(i, 2, 71) * 0.5 > 1.3) continue;
      const a = hash(i, 3, 71) * Math.PI * 2;
      const p = add(collar, [Math.cos(a) * 3 * (1 - life), Math.sin(a) * 3 * (1 - life), 1 + life * 16]);
      put('wisp', 'wisp', { k: 'mote', p, c: life < 0.4 ? FLAME[2] : FLAME[1], size: 1 });
    }
    if (k < 1) put('wisp', 'wisp', { k: 'glow', p: add(collar, [0, 0, 4]), c: SOCKET, r: 10, a: 0.4 * (1 - k) });
  }
  // the hood: round where a head would be, open in front, the dark inside it. (Its opening is drawn
  // turned two thirds of the way toward whoever looks, as a face's eyes are (skin.ts, eyesToward):
  // seen from the side it would be a sliver, and the dark in it is all there is of him.)
  const hr: V3 = [9.4, 8.8, 10.2];
  const cam = Math.atan2(dot(st.eye, fl), dot(st.eye, ff)) / D;
  const toward = clamp01((110 - Math.abs(cam)) / 40);
  const midA = Math.max(-40, Math.min(40, cam * 0.67)) * toward * D;
  const od: V3 = norm(add(mul(ff, Math.cos(midA)), mul(fl, Math.sin(midA))));
  const os: V3 = norm(sub(fl, mul(od, dot(fl, od))));
  const hoodSkin: Skin = (u, tone) => {
    const flat = Math.hypot(u[0], u[1]);
    const toOpen = flat > 1e-6 ? (u[0] * Math.cos(midA) + u[1] * Math.sin(midA)) / flat : 0;
    if (flat > 0.3 && toOpen > 0.74 && u[2] < 0.52 && u[2] > -0.94) return null;
    // (a rim round the opening, where the cloth turns in: the light catches it)
    if (flat > 0.22 && toOpen > 0.6 && u[2] < 0.66 && u[2] > -1) return HOOD[Math.min(4, tone + 1)];
    return HOOD[tone];
  };
  put('hood', 'hood', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: hoodSkin });
  const ic = add(hc, mul(od, -1.8));
  put('hood', 'hood', { k: 'ball', c: ic, ax: [mul(od, hr[0] - 1.6), mul(os, hr[1] - 1.2), mul(fu, hr[2] - 1.4)], skin: (u) => (u[0] < -0.1 ? null : INK) });
  // its point: tall, leaning back a little, nodding with his steps
  const tip = add(add(hc, mul(fu, hr[2] + 15)), add(mul(ff, -4.2), mul(lag, 0.9)));
  put('hood', 'hood', { k: 'rod', a: add(hc, mul(fu, hr[2] * 0.35)), b: add(hc, mul(fu, hr[2] + 4)), ra: hr[1] * 0.98, rb: hr[1] * 0.66, ramp: HOOD });
  put('hood', 'hood', { k: 'rod', a: add(hc, mul(fu, hr[2] + 3.5)), b: tip, ra: hr[1] * 0.68, rb: 1.0, ramp: HOOD });
  // the pink, burning in the dark where a face would be: two points of it, and its light
  if (lit > 0.05) {
    const heat = lit * (1 + 0.7 * clamp01(m.glint));
    for (const k of [-1, 1]) {
      const e = add(ic, add(mul(od, (hr[0] - 1.6) * 0.7), add(mul(os, k * 2.9), mul(fu, -0.6))));
      put('hood', 'hood', { k: 'dot', p: e, c: heat > 1.25 ? FLAME[4] : heat > 0.5 ? SOCKET : FLAME[1], facing: od, c2: heat > 0.5 ? (heat > 1.25 ? FLAME[3] : FLAME[2]) : undefined });
      if (dot(od, st.eye) > 0.05) put('hood', 'hood', { k: 'glow', p: e, c: SOCKET, r: 6 + 4 * Math.max(0, heat - 1), a: Math.min(0.85, 0.5 * heat) });
    }
    // (a haze of the pink in the dark round them, stirring: there is nothing else in there)
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + m.t * 1.3;
      const e = add(ic, add(mul(od, (hr[0] - 1.6) * 0.62), add(mul(os, Math.cos(a) * 4.2), mul(fu, -1.4 + Math.sin(a) * 3.0))));
      if (hash(i, Math.floor(m.t * 6 + 1e-6), 41) < 0.5 * lit) put('hood', 'hood', { k: 'dot', p: e, c: FLAME[0], facing: od });
    }
  }

  // --- HIS GREAT AXE: the haft through his right fist, the crescent of black steel at its head (not while it is thrown) ---
  if (!m.bare) {
    const pt = s.point;
    const out = axeEdgeOf(s);
    axeSolids(put, add(s.handR, mul(pt, -AXE_HOLD(q.draw))), pt, out);
    const ax = axeOf(s, q.draw);
    // THE GLINT on its edge as he holds a blow (the warning): the light runs along it, and burns at its middle
    if (m.glint > 0.05 && lit > 0.1) {
      const g = m.glint;
      for (let i = 0; i <= 10; i++) {
        const k = i / 10;
        const p = k < 0.5 ? lerp3(ax.horns[1], ax.edge, k * 2) : lerp3(ax.edge, ax.horns[0], k * 2 - 1);
        if (Math.abs(k - 0.5) < 0.2 + 0.3 * g) put('glint', 'glint', { k: 'mote', p, c: g > 0.8 && Math.abs(k - 0.5) < 0.15 ? FLAME[4] : FLAME[3], size: 1 });
      }
      put('glint', 'glint', { k: 'glow', p: ax.edge, c: FLAME[3], r: 5 + 9 * g, a: Math.min(0.8, 0.6 * g) });
    }
    // DRAGGED (his walk): sparks where its edge scrapes the floor, thrown back off it
    if (q.prop === 1 && lit > 0.1) {
      const low = [ax.edge, ax.horns[0], ax.horns[1]].reduce((a, b) => (b[2] < a[2] ? b : a));
      const at0: V3 = [low[0], low[1], 0.6];
      for (let i = 0; i < 7; i++) {
        const life = (m.t * 2.4 + hash(i, 1, 73)) % 1;
        const a = (hash(i, 2, 73) - 0.5) * 1.6;
        const back: V3 = norm([-Math.cos(a), Math.sin(a), 0]);
        const p = add(at0, add(mul(back, 2 + life * (5 + 6 * hash(i, 3, 73))), [0, 0, 4 * life * (1 - life) * (2 + 3 * hash(i, 4, 73))]));
        if (life < 0.75) put('sparks', 'sparks', { k: 'mote', p, c: life < 0.25 ? FLAME[4] : life < 0.5 ? FLAME[3] : FLAME[2], size: 1 });
      }
      put('sparks', 'sparks', { k: 'glow', p: at0, c: FLAME[3], r: 5, a: 0.3 + 0.15 * Math.sin(m.t * 21) });
    }
  }

  // --- THE WEIGHT OF HIS BLOWS: the way his blade went through the air, a band of fire along its edge's path, widest and hottest just behind the blade ---
  if (m.trails && m.trails.length >= 4 && lit > 0.1) {
    const edgeT = smoothed(m.trails[1]);
    const eyeT = smoothed(m.trails[3]);
    const n = edgeT.length - 1;
    for (let i = 1; i <= n; i++) {
      const age0 = (i - 1) / n;
      const age1 = i / n;
      const a0 = edgeT[i - 1];
      const a1 = edgeT[i];
      const b0 = eyeT[i - 1];
      const b1 = eyeT[i];
      const long = Math.max(1, Math.ceil(Math.hypot(...(st.at(a1).map((v, k) => v - st.at(a0)[k]) as [number, number])) / 1.2));
      for (let j = 0; j < long; j++) {
        const f = j / long;
        const age = age0 + (age1 - age0) * f;
        const e = lerp3(a0, a1, f);
        const y = lerp3(b0, b1, f);
        // (from the edge in toward the haft: the band is the blade's outer half when new, a thread when old)
        const w = 0.95 * (1 - age) + 0.08;
        const across = Math.max(1, Math.ceil(Math.hypot(...(st.at(lerp3(e, y, w)).map((v, k) => v - st.at(e)[k]) as [number, number])) / 1.2));
        for (let k = 0; k <= across; k++) {
          const u = (k / across) * w;
          if (age > 0.45 && hash(i * 97 + j, k, 79) < (age - 0.45) * 1.6) continue;
          const c = u < 0.05 ? (age < 0.3 ? FLAME[4] : FLAME[3]) : age < 0.22 ? FLAME[3] : age < 0.5 ? FLAME[2] : FLAME[1];
          put('streak', 'streak', { k: 'mote', p: lerp3(e, y, u), c, size: 1 });
        }
      }
    }
    put('streak', 'streak', { k: 'glow', p: edgeT[Math.min(2, n)], c: FLAME[3], r: 18, a: 0.32 });
  }

  // --- WHERE HIS BLADE BITES THE FLOOR: stone chips thrown up and out, and dust (the floor's crack and its fire are the game's: art/boss_shots.ts) ---
  if (m.since !== undefined && m.since >= 0 && m.since < HS_CHIPS_FOR && !m.bare) {
    const ax = axeOf(s, q.draw);
    const low = [ax.edge, ax.horns[0], ax.horns[1]].reduce((a, b) => (b[2] < a[2] ? b : a));
    if (low[2] < 4) {
      const k = m.since / HS_CHIPS_FOR;
      for (let i = 0; i < 18; i++) {
        const a = hash(i, 1, 83) * Math.PI * 2;
        const sp = 10 + 22 * hash(i, 2, 83);
        const vz = 30 + 40 * hash(i, 3, 83);
        const tt = m.since;
        const z = Math.max(0, vz * tt - 0.5 * 260 * tt * tt);
        const p: V3 = [low[0] + Math.cos(a) * sp * tt * 1.4, low[1] + Math.sin(a) * sp * tt * 1.4, z + 0.5];
        put('chips', 'chips', { k: 'mote', p, c: i % 3 === 0 ? STEEL[2] : i % 3 === 1 ? '#6a6488' : '#3b3052', size: i % 4 === 0 ? 2 : 1 });
      }
      for (let i = 0; i < 12; i++) {
        if (hash(i, 7, 83) < k * 0.9) continue;
        const a = (i / 12) * Math.PI * 2 + hash(i, 4, 83);
        const r = 3 + (8 + 8 * hash(i, 5, 83)) * Math.sqrt(k);
        const z = 0.6 + (2 + 4 * hash(i, 6, 83)) * Math.sin(Math.PI * Math.min(1, k * 1.2));
        put('dust', 'dust', { k: 'mote', p: [low[0] + Math.cos(a) * r * 1.3, low[1] + Math.sin(a) * r, z], c: i % 2 ? '#4a4266' : '#6a6488', size: 2 });
      }
      if (m.since < 0.08) put('chips', 'chips', { k: 'glow', p: [low[0], low[1], 2], c: FLAME[3], r: 16, a: 0.6 });
    }
  }
  return bits;
}
/** A way through the air smoothed: three points on the curve (Catmull-Rom) between each two it was at. */
function smoothed(pts: V3[]): V3[] {
  if (pts.length < 3) return pts;
  const out: V3[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < 3; k++) {
      const t = k / 3;
      const t2 = t * t;
      const t3 = t2 * t;
      const w0 = -0.5 * t3 + t2 - 0.5 * t;
      const w1 = 1.5 * t3 - 2.5 * t2 + 1;
      const w2 = -1.5 * t3 + 2 * t2 + 0.5 * t;
      const w3 = 0.5 * t3 - 0.5 * t2;
      out.push([0, 1, 2].map((j) => p0[j] * w0 + p1[j] * w1 + p2[j] * w2 + p3[j] * w3) as unknown as V3);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
/** How long the stone chips his blade throws up hang (seconds from the blow). */
const HS_CHIPS_FOR = 0.4;

/** STANDING, ALIVE: he breathes, his shoulders rising and falling; his hood turns slowly from side to side, looking for the condemned; and now and then he lifts his axe a little and lets its head fall back to the floor. Two and a half seconds round. */
function hsStand(): Motion {
  const R = HS_REST;
  const lifted = axeTo([HS_GRIP_AT[0] + 1, HS_GRIP_AT[1], HS_GRIP_AT[2] + 6], [HS_HEAD_AT[0] + 1, HS_HEAD_AT[1], HS_HEAD_AT[2] + 6], norm([1, 1, 0]));
  return {
    loop: 0,
    keys: [
      // (his weight going over onto his left foot as he breathes in and looks round, and back onto his right, where the axe stands: `py`, his hips over his feet)
      { at: 0, pose: {} },
      { at: 0.6, pose: { pz: R.pz + 0.8, bend: R.bend - 2, faceTurn: R.faceTurn - 26, faceUp: R.faceUp + 2, py: 1.3, roll: -0.8 }, ease: 'io' },
      { at: 1.0, pose: { pz: R.pz + 0.6, bend: R.bend - 1.5, faceTurn: R.faceTurn - 28, faceUp: R.faceUp + 2, py: 1.4, roll: -0.9 }, ease: 'lin' },
      { at: 1.5, pose: { pz: R.pz, faceTurn: R.faceTurn + 10, faceUp: R.faceUp - 2, ...lifted, py: -0.2, roll: 0.2 }, ease: 'io' },
      { at: 1.62, pose: { pz: R.pz - 0.5, faceTurn: R.faceTurn + 12, faceUp: R.faceUp - 3, py: -0.5, roll: 0.4 }, ease: 'in' },
      { at: 2.1, pose: { py: -0.4, roll: 0.3 }, ease: 'io' },
      { at: 2.5, pose: {}, ease: 'io' },
    ],
  };
}

/** A key held still: for the moves not yet made (a placeholder until they are). */
function stillOf(len0: number): Motion {
  return { keys: [{ at: 0, pose: {} }, { at: len0, pose: {} }] };
}
/** A walk not yet made: it stands (a placeholder until it is). */
function standingWalk(): Motion {
  const keys: Key3[] = [];
  for (let i = 0; i <= 8; i++) keys.push({ at: i / 8, pose: {}, ease: 'lin' });
  return { keys, loop: 0 };
}

// ---------------------------------------------------------------------------------------------
// THE HEADSMAN'S MOVES. By the art rulebook, as the heroes': built on the bones; weight in every
// blow (a wind-up held: the warning; a follow-through); his feet grip the floor; his cape, apron and
// coat follow; alive when still; his heavy blows land with the game's freeze; their effects big and
// wild. "Slow, terrible chops" (his brief).
//
// HOW HE HOLDS THE AXE, AS A WOODSMAN DOES (his words, 19:01: "Look at his arms they’re all twisted
// weirdly and the axe is clipping through his shoulder. It looks so bad. When I say he should hold it
// naturally, what does that mean to you?"; 19:05: "Like look up how to chop a log and you’ll see what
// an overhead swing should look like"). As the woodsmen's guides have it: his LEFT HAND AT THE VERY
// END OF THE HAFT, always; his right hand up it, near the head, as he carries it and lifts it, and
// sliding down to meet the left as he swings, so that at the blow both are together at the end, his
// arms out straight, his knees dropping and his hips pushed back. His elbows bend as elbows do
// (`elbowsTo`), and the axe is always outside him. Four holds were drawn for him (`more.holds`:
// standing still, carrying it, raised to chop, the chop landed), and his yes to them came by 19:42:
// "Yes, animate them (Recommended)". Standing still he is as he was first painted (HS_REST); moving,
// he carries the axe across him (HS_READY); every move starts from that and ends in it. The game
// plays `raise` as he starts to move and `lower` as he stops.

/** His canvas: room for his axe raised high over his hood, swung round him low, thrown. */
export const HS_CANVAS: MobCanvas = { w: 380, h: 340, ax: 190, ay: 262 };

/** WHERE HIS AXE IS, on his bones and in his grip (`draw`): its butt, the eye of its head, the middle of its edge and the edge's two horns, the way the edge faces. (For the streak, the floor's drawings and the tests.) */
export function axeOf(s: Skeleton, draw: number): { butt: V3; eye: V3; edge: V3; horns: readonly [V3, V3]; out: V3 } {
  const pt = s.point;
  const out = axeEdgeOf(s);
  const back = AXE_HOLD(draw);
  const butt = add(s.handR, mul(pt, -back));
  const eye = add(s.handR, mul(pt, AXE_LEN - back));
  const edge = add(eye, add(mul(out, BLADE_OUT + 1), mul(pt, 1.5)));
  const at = (k: number): V3 => add(add(eye, mul(out, BLADE_OUT - 3.5)), mul(pt, 1.5 + k * (BLADE_TALL / 2 - 1)));
  return { butt, eye, edge, horns: [at(1), at(-1)], out };
}

/**
 * THE AXE IN HIS HANDS, from where its butt is (his left hand round it), the way it runs from there to
 * its head, how far up it his right hand is (`draw`), and the way its blade faces. (His right hand is
 * where the bones hold a weapon from, measured from his place on the floor; his left is put on the
 * haft at its very end.)
 */
function woodsman(butt: V3, pt: V3, draw: number, edge: V3, over = false): P {
  const p = norm(pt);
  const hold = AXE_HOLD(draw);
  const rh = add(butt, mul(p, hold));
  return { rhIn: 2, rhx: rh[0], rhy: rh[1], rhz: rh[2], lhIn: 3, lhx: -(hold - 3), lhy: 0, lhz: 0, ...axeWay(p, edge, over), draw };
}
/** His elbows pointed as nearly toward these ways as his arms let them (the left's, the right's: the figure's own axes). */
function elbowsTo(pose: P, wantL: V3, wantR: V3, rest: Bones = HS_BASE): P {
  const q = { ...rest, ...pose } as Posed;
  const le = elbowFor(HB, q, true, norm(wantL));
  const re = elbowFor(HB, { ...q, le } as Posed, false, norm(wantR));
  return { ...pose, le, re };
}
/** A key: his body as `body` has it (what it does not name, as he stands: HS_BASE), the axe in his hands as a woodsman holds it (`woodsman`), his elbows as near these ways as his arms let them. */
function held(body: P, butt: V3, pt: V3, draw: number, edge: V3, wantL: V3, wantR: V3, over = false): P {
  return elbowsTo({ ...body, ...woodsman(butt, pt, draw, edge, over) }, wantL, wantR, { ...HS_BASE, ...body } as Bones);
}
/** The same key with his right hand measured from his shoulder along his chest (`HandIn` 0), where the key puts it: so that the axe goes wherever his chest goes (carried as he walks, or as he is struck). */
function onChest(pose: P): P {
  const s = solve(HB, { ...HS_BASE, ...pose } as Posed);
  const d = sub(s.handR, s.shoulderR);
  return { ...pose, rhIn: 0, rhx: dot(d, s.chest[0]), rhy: dot(d, s.chest[1]), rhz: dot(d, s.chest[2]) };
}

/** CARRIED ACROSS HIM: his left hand at the haft's end before his left hip, his right up it before his right breast, the head out beside his right shoulder, the blade up; his elbows down by his sides. */
const HOLD_CARRY: P = held({}, [22, 14, 54], sub([16, -56, 98], [22, 14, 54]), 0.75, [0.35, 0, 0.94], [-0.25, 0.45, -0.85], [-0.1, -0.3, -0.95]);
/** His body raised to chop: square to what he will strike, leaning back a little, his hood up (his feet where they are). */
const TOP_BODY: P = { px: -2, pz: -3, yaw: -4, pitch: -6, roll: 0, twist: -2, bend: -8, side: 0, faceTurn: 0, faceUp: 8, faceTilt: 0, lk: 12, rk: -12 };
/** The way the haft runs at the top of his chop: back over his right shoulder and up. */
const TOP_WAY = heading(-170, 45);
/** RAISED TO CHOP (the top of his swing): his left hand at the haft's end above his brow (a little to the right of it, so that the fire in his hood shows), his right up the haft over his head, the axe raised high back over his right shoulder, its edge to the sky. */
const HOLD_TOP: P = held(TOP_BODY, [16, -6, 110], TOP_WAY, 0.35, [0, 0, 1], [0.3, 0.9, 0], [0.4, -0.85, 0.1]);
/** His body as the blow lands: his knees dropped and his hips pushed back, bent over the axe, looking at it (his feet where they are). */
const BITE_BODY: P = { px: -3, pz: -12, yaw: 0, pitch: 24, roll: 0, twist: 0, bend: 18, side: 0, faceTurn: 0, faceUp: -26, faceTilt: 0, lk: 26, rk: -26 };
/** THE BLOW LANDED: both hands together at the haft's end, his arms out straight before him and down, the blade bitten into the floor. */
const HOLD_BITE: P = held(BITE_BODY, [46, -3, 52], heading(0, -18), 0.05, heading(180, -72), [-0.1, 0.35, -0.93], [-0.1, -0.35, -0.93]);

/** HIS AXE CARRIED ACROSS HIM (HOLD_CARRY), his right hand measured from his shoulder along his chest, so that it goes where his chest goes. Whence every move begins. */
export const HS_READY: Bones = resolvedRest({ ...HS_BASE, ...onChest(HOLD_CARRY) });
/** The four holds, one a second (for the pictures: `more.holds`). */
function hsHolds(): Motion {
  return { keys: [HS_REST, HOLD_CARRY, HOLD_TOP, HOLD_BITE].map((pose, i) => ({ at: i, pose, ease: 'hold' as const })) };
}

/** His bones in a pose (what it does not name, as he carries his axe). */
const hsSolved = (pose: P): Skeleton => solve(HB, { ...HS_READY, ...pose } as Posed);
/** The lowest point of the blade in a pose. */
function bladeLow(pose: P): number {
  const k = resolveAxe([{ at: 0, pose }], HS_READY)[0].pose;
  const a = axeOf(hsSolved(k), (k.draw as number | undefined) ?? HS_READY.draw);
  return Math.min(a.edge[2], a.horns[0][2], a.horns[1][2], a.eye[2] - 3);
}
/** The same pose with the axe's elevation found (between `lo` and `hi`) so that the blade just touches the floor (`at`: how far into it). */
function onFloor(pose: P, lo: number, hi: number, at = 0.4): P {
  const tip = (el: number): P => ({ ...pose, wEl: el });
  let a = lo;
  let b = hi;
  for (let i = 0; i < 26; i++) {
    const m = (a + b) / 2;
    // (the further down it points, the lower the blade)
    if (bladeLow(tip(m)) < at) a = m;
    else b = m;
  }
  return tip((a + b) / 2);
}

/**
 * THE AXE TAKEN UP (as he starts to move): his right hand lifts it off the floor and swings its head
 * up and out to his right, his left hand takes its end as it comes across before him, and up it comes
 * into his carry. And set down again (as he stops), the other way about, his left hand letting go.
 */
export const HS_RAISE = 0.6;
/** Lifted off the floor in his right hand and out before him a little, still upright, its top leaning out, so that its end comes down before his chest and not past his shoulder or his hood; his left hand coming to take it. */
const HS_LIFT: P = {
  pz: -2.6, pitch: 7, bend: 8, rhIn: 2, rhx: 20, rhy: -29, rhz: 62, ...axeWay([-4, 7, -54], [1, 1, 0]), draw: 1, lhIn: 2, lhx: 16, lhy: 16, lhz: 50, le: -10,
  // (the same way, said as just past straight down from his right: so that from here its head swings out to his right, and not round before him)
  wAz: -60, wEl: -97,
};
/** Swinging: its head going up and out to his right, its end coming down before his chest to his left hand, which reaches for it. */
const HS_SWING: P = { pz: -3, pitch: 8, bend: 9, rhIn: 2, rhx: 31, rhy: -28, rhz: 62, ...axeWay(heading(-82, -24), [0.8, 0, 0.6]), draw: 0.95, lhIn: 2, lhx: 24, lhy: 9, lhz: 58, le: -10 };
/** Half way: out flat to his right, his right hand on it near the head, his left on its end before his belly. */
const HS_HALF: P = held({ pz: -3.6, pitch: 9, bend: 10 }, [26, 6, 62], [-4, -68, -2], 0.85, [0.7, 0, 0.7], [-0.25, 0.5, -0.8], [-0.1, -0.5, -0.85]);
function hsRaise(): Motion {
  return {
    keys: [
      { at: 0, pose: HS_REST },
      { at: 0.12, pose: HS_LIFT, ease: 'io' },
      { at: 0.24, pose: HS_SWING, ease: 'in' },
      { at: 0.34, pose: HS_HALF, ease: 'lin' },
      { at: HS_RAISE, pose: {}, ease: 'out' },
    ],
  };
}
function hsLower(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.26, pose: HS_HALF, ease: 'in' },
      { at: 0.36, pose: HS_SWING, ease: 'lin' },
      { at: 0.48, pose: HS_LIFT, ease: 'out' },
      { at: HS_RAISE, pose: HS_REST, ease: 'io' },
    ],
  };
}

/**
 * HIS WALK: slow and heavy, ten frames at eight a second, painted for 0.8 tiles a second, his axe
 * carried across him. Each foot comes down heavily and stays down six frames of the ten (both are
 * down a moment at every step); his whole bulk sinks onto it and rolls over it; his hood nods; the
 * axe goes with his chest and rocks with his steps. A foot that is down stays where it is on the floor.
 */
const HS_WALK_FRAMES = 10;
const HS_WALK_FPS = 8;
export const HEADSMAN_PACE = 0.8;
/** How far the floor goes by under him in a frame of his walk, and how fast the game carries him walking (the figure's own lengths). */
const HS_STRIDE = (HEADSMAN_PACE * TILE3) / HS_WALK_FPS;
const HS_GROUND = HEADSMAN_PACE * TILE3;
/** His walk at its frame `j` (0 to 9: his right foot just down before him at 0, his left at 5). */
function hsWalkPose(j: number): P {
  const R = HS_READY;
  const n = HS_WALK_FRAMES;
  const d = HS_STRIDE;
  const SW = [0.16, 0.42, 0.7, 0.93];
  // (the foot that swings goes up off its toes, through, and comes down heel first: high enough that its toes clear the floor)
  const SZ = [4.5, 6.5, 5.5, 3.2];
  const SP = [14, 6, -2, -8];
  const foot = (k: number): [number, number, number] => (k <= 5 ? [3 * d - d * k, 0, 0] : [-2 * d + 5 * d * SW[k - 6], SZ[k - 6], SP[k - 6]]);
  const a = (j / n) * Math.PI * 2;
  const [rx, rz, rp] = foot(j);
  const [lx, lz, lp] = foot((j + 5) % n);
  return {
    px: 0.5, py: -2.0 * Math.sin(a), pz: R.pz - 1.4 - 1.6 * Math.cos(2 * a),
    yaw: R.yaw + 5 * Math.cos(a), twist: R.twist - 4 * Math.cos(a), pitch: R.pitch + 2 + 1.2 * Math.cos(2 * a), bend: R.bend + 1.5 * Math.cos(2 * a),
    roll: 3.5 * Math.sin(a), side: 1.5 * Math.sin(a),
    faceUp: R.faceUp - 1 - 2.5 * Math.cos(2 * a), faceTurn: R.faceTurn - 3 * Math.cos(a), faceTilt: -2 * Math.sin(a),
    rfx: rx, rfz: rz, rfy: R.rfy, rft: R.rft, rk: -12, rfp: rp,
    lfx: lx, lfz: lz, lfy: R.lfy, lft: R.lft, lk: 12, lfp: lp,
    // (the axe rocks with his steps: its head nods a little as he comes down on each foot)
    rhz: R.rhz + 1.2 * Math.cos(2 * a), wEl: R.wEl + 2.5 * Math.cos(2 * a),
  };
}
function hsWalk(): Motion {
  const keys: Key3[] = [];
  for (let i = 0; i <= HS_WALK_FRAMES; i++) keys.push({ at: i / HS_WALK_FPS, ease: 'lin', pose: hsWalkPose(i % HS_WALK_FRAMES) });
  return { keys, loop: 0 };
}
/**
 * SETTING OFF AND STOPPING, his axe across him (as the Chained One's, and the heroes' steps into and
 * out of their runs: nothing jumps where one move hands over to the next). Setting off, the game carries
 * him on at his pace from its first moment: his right foot is lifted and set down a stride ahead, his
 * left stays where it stood until he has gone over it, and he is in the first frame of his walk.
 * Stopping, from the first frame of his walk (the game lets his walk come round to it), still carried:
 * his left foot comes through and is set down beside his right, and he stands with the axe across him,
 * where the game stops him (and he sets it down: `lower`; or strikes).
 */
const HS_SET_OFF = (plantOf(HB, 'L', {}, HS_READY).at[0] - plantOf(HB, 'L', hsWalkPose(0), HS_READY).at[0]) / HS_GROUND;
const HS_HALT = (plantOf(HB, 'R', hsWalkPose(0), HS_READY).at[0] - plantOf(HB, 'R', {}, HS_READY).at[0]) / HS_GROUND;
function hsSetOff(): Motion {
  const w0 = hsWalkPose(0);
  const T = HS_SET_OFF;
  return { keys: [{ at: 0, pose: {} }, { at: T * 0.5, pose: { ...between(HS_READY, w0, 0.5, HS_READY), pz: (HS_READY.pz + (w0.pz as number)) / 2 - 1.2 }, ease: 'io' }, { at: T, pose: w0, ease: 'io' }] };
}
function hsSetOffFeet(): (t: number) => P {
  const T = HS_SET_OFF;
  const R1 = plantOf(HB, 'R', hsWalkPose(0), HS_READY);
  return footwork(HB, {
    L: { start: plantOf(HB, 'L', {}, HS_READY), moves: [] },
    R: { start: plantOf(HB, 'R', {}, HS_READY), moves: [{ t0: 0.03, t1: T - 0.02, to: plantBy(R1, HS_GROUND * T, 0), lift: 6 }] },
  }, HS_GROUND);
}
function hsHalt(): Motion {
  const w0 = hsWalkPose(0);
  const T = HS_HALT;
  return { keys: [{ at: 0, pose: w0 }, { at: T * 0.55, pose: { ...between(w0, HS_READY, 0.55, HS_READY), pz: (HS_READY.pz + (w0.pz as number)) / 2 - 1 }, ease: 'io' }, { at: T, pose: {}, ease: 'io' }] };
}
function hsHaltFeet(): (t: number) => P {
  const T = HS_HALT;
  const L0 = plantOf(HB, 'L', {}, HS_READY);
  return footwork(HB, {
    L: { start: plantOf(HB, 'L', hsWalkPose(0), HS_READY), moves: [{ t0: 0.03, t1: T - 0.03, to: plantBy(L0, HS_GROUND * T, 0), lift: 6 }] },
    R: { start: plantOf(HB, 'R', hsWalkPose(0), HS_READY), moves: [] },
  }, HS_GROUND);
}

/**
 * HIS CHOP, his basic blow, as a woodsman chops: slow and terrible. From his carry the axe goes up and
 * back over his right shoulder, his hands above his hood, and he holds it there, trembling, the edge
 * glinting and the fire in his hood flaring (the warning; the bell tolls, the Sound chat's); then it
 * comes over the top and down before him, his right hand sliding down the haft to meet his left, his
 * knees dropping and his hips going back, and bites into the floor with his arms out straight (the
 * game's freeze). He wrenches it out and brings it back across him.
 */
export const HS_CHOP_HIT = 0.9;
/** The axe coming over the top as it falls, straight up over him (its way said as going past straight up, so that it comes over and not round): his hands going up and forward, his right sliding down. */
const HS_OVER: P = held({ px: 0, pz: -5, yaw: -2, pitch: 2, roll: 0, twist: 0, bend: 0, side: 0, faceTurn: 0, faceUp: 0, faceTilt: 0, lk: 16, rk: -16 }, [22, -5, 100], heading(-170, 86), 0.22, [1, 0, 0], [0.4, 0.9, -0.1], [0.4, -0.9, -0.1], true);
/** And on down before him, the haft up before him and the blade leading down. */
const HS_DOWN: P = held({ px: -1, pz: -9, yaw: -1, pitch: 12, roll: 0, twist: 0, bend: 9, side: 0, faceTurn: 0, faceUp: -14, faceTilt: 0, lk: 22, rk: -22 }, [36, -3, 82], heading(0, 35), 0.12, heading(0, -55), [-0.1, 0.6, -0.8], [-0.1, -0.6, -0.8]);
/** Up out of the floor, the haft out to his right before him, the blade turned forward, on the way back to his carry. */
const HS_OUT: P = held({ px: 1, pz: -7, yaw: -6, pitch: 10, roll: 0, twist: -4, bend: 9, side: 0, faceTurn: 2, faceUp: -10, faceTilt: 0, lk: 16, rk: -16 }, [32, 6, 60], heading(-80, 12), 0.45, [1, 0, 0], [-0.2, 0.5, -0.8], [-0.1, -0.5, -0.85]);
/** A held pose trembling: its right hand (and the axe with it) up or down a little, and whatever else is said. */
const trembling = (pose: P, dz: number, more: P = {}): P => ({ ...pose, rhz: (pose.rhz as number) + dz, ...more });
/** The way the haft runs, said as going on over the top (for the key the fall starts from). */
const overOf = (way: V3): P => {
  const o = axeWay(way, [0, 0, 1], true);
  return { wAz: o.wAz, wEl: o.wEl };
};
function hsChop(): Motion {
  const H = HS_CHOP_HIT;
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: 0.38, pose: HOLD_TOP, ease: 'io' },
      { at: 0.52, pose: trembling(HOLD_TOP, 0.5), ease: 'hold' },
      { at: 0.66, pose: trembling(HOLD_TOP, -0.4, { twist: -3 }), ease: 'hold' },
      { at: H - 0.1, pose: trembling(HOLD_TOP, 0.6, { px: -2.5, twist: -4 }), ease: 'hold', as: overOf(TOP_WAY) },
      // (over the top and down, his right hand sliding down the haft)
      { at: H - 0.06, pose: HS_OVER, ease: 'in' },
      { at: H - 0.03, pose: HS_DOWN, ease: 'lin' },
      { at: H, pose: HOLD_BITE, ease: 'lin' },
      { at: H + 0.3, pose: { ...HOLD_BITE, pz: -13, pitch: 26, faceUp: -22 }, ease: 'out' },
      // (wrenched out of the floor, and back across him)
      { at: H + 0.5, pose: HS_OUT, ease: 'in' },
      { at: H + 0.95, pose: {}, ease: 'out' },
    ],
  };
}
/** The glint on his edge and the flare in his hood as he holds a blow (0 none to 1): up as it is held, full just before it falls. */
function heldGlint(from: number, full: number, hit: number): (t: number) => number {
  return (t) => (t < from ? 0 : t < full ? (t - from) / (full - from) : t < hit ? 1 : t < hit + 0.12 ? 1 - (t - hit) / 0.12 : 0);
}

/**
 * THE SENTENCE (his pick by 16:46, "The sentence (Recommended)"): from his carry the axe goes up high
 * over his hood, steep, held high and long, while the floor before him cracks along the line it will
 * fall on (the warning: the game's, art/boss_shots.ts); then it comes over and down with all his weight
 * as his front foot stamps a stride forward into a deep lunge, and the floor splits open along that
 * line, fire bursting up out of it. The axe stays in the floor a moment; he wrenches it out, steps
 * back, and rises.
 */
export const HS_SENTENCE_HIT = 1.35;
/** The way the haft runs held high: back over his right shoulder, steep. */
const HIGH_WAY = heading(-172, 62);
/** THE AXE HELD HIGH: his left hand at its end above his brow, the haft steep up and back over his right shoulder, the head high over him; leaning back, his hood tipped up to it. */
const HS_HIGH: P = held({ px: -2, pz: 0, yaw: -6, pitch: -8, roll: 0, twist: -4, bend: -10, side: 0, faceTurn: 4, faceUp: 22, faceTilt: 0, lk: 12, rk: -12 }, [16, -7, 106], HIGH_WAY, 0.3, [0, 0, 1], [0.3, 0.9, 0.1], [0.4, -0.85, 0.2]);
/** Over the top, his front foot lifting to stamp forward. */
const HS_OVER2: P = held({ px: 4, pz: -6, yaw: -2, pitch: 4, roll: 0, twist: 0, bend: 0, side: 0, faceTurn: 0, faceUp: 0, faceTilt: 0, lk: 16, rk: -10, lfx: 16, lfz: 6 }, [26, -5, 100], heading(-172, 86), 0.22, [1, 0, 0], [0.4, 0.9, -0.1], [0.4, -0.9, -0.1], true);
/** Down before him, his front foot coming down a stride ahead. */
const HS_DOWN2: P = held({ px: 8, pz: -12, yaw: 0, pitch: 12, roll: 0, twist: 2, bend: 8, side: 0, faceTurn: 0, faceUp: -14, faceTilt: 0, lk: 20, rk: -6, lfx: 23, lfz: 1, rfp: 16 }, [46, -3, 80], heading(0, 35), 0.12, heading(0, -55), [-0.1, 0.6, -0.8], [-0.1, -0.6, -0.8]);
/** THE SENTENCE LANDS: a deep lunge, his front foot a stride ahead and his back leg long behind him (its foot where it was, its heel up); both hands at the haft's end, arms out straight; the blade bitten deep into the floor. */
const HS_LUNGE: P = held({ px: 10, pz: -16, yaw: 2, pitch: 18, roll: 0, twist: 4, bend: 14, side: 0, faceTurn: 0, faceUp: -24, faceTilt: 0, lk: 22, rk: -4, lfx: 24, rfp: 30 }, [58, -3, 48], heading(0, -18), 0.05, heading(180, -72), [-0.1, 0.35, -0.93], [-0.1, -0.35, -0.93]);
function hsSentence(): Motion {
  const H = HS_SENTENCE_HIT;
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: 0.5, pose: HS_HIGH, ease: 'io' },
      { at: 0.7, pose: trembling(HS_HIGH, 0.6, { faceUp: 24 }), ease: 'hold' },
      { at: 0.9, pose: trembling(HS_HIGH, -0.4), ease: 'hold' },
      { at: 1.1, pose: trembling(HS_HIGH, 0.7, { faceUp: 25 }), ease: 'hold' },
      { at: H - 0.1, pose: trembling(HS_HIGH, -0.3, { pz: 1, bend: -12 }), ease: 'io', as: overOf(HIGH_WAY) },
      // (over the top and down, his front foot stamping forward)
      { at: H - 0.06, pose: HS_OVER2, ease: 'in' },
      { at: H - 0.03, pose: HS_DOWN2, ease: 'lin' },
      { at: H, pose: HS_LUNGE, ease: 'lin' },
      { at: H + 0.4, pose: { ...HS_LUNGE, pz: -17, pitch: 19, faceUp: -20 }, ease: 'out' },
      { at: H + 0.62, pose: { ...HS_LUNGE, pz: -16, pitch: 16, bend: 12, faceUp: -8, rhx: (HS_LUNGE.rhx as number) - 4, rhz: (HS_LUNGE.rhz as number) + 2 }, ease: 'io' },
      // (wrenched out, and on up across him, his front foot stepping back beside the other: his feet's own, `hsSentenceFeet`)
      { at: H + 0.85, pose: HS_OUT, ease: 'in' },
      { at: H + 1.3, pose: {}, ease: 'out' },
    ],
  };
}

/** HIS FEET THROUGH THE SENTENCE: his front foot lifted as the axe comes over and stamped down a long stride ahead as it lands, his back heel coming up off the floor into the lunge; his back heel down again as he wrenches it out, and his front foot stepped back beside the other. */
function hsSentenceFeet(): (t: number) => P {
  const H = HS_SENTENCE_HIT;
  const L0 = plantOf(HB, 'L', {}, HS_READY);
  const R0 = plantOf(HB, 'R', {}, HS_READY);
  return footwork(HB, {
    L: { start: L0, moves: [{ t0: H - 0.13, t1: H - 0.02, to: plantBy(L0, 19, 0), lift: 7 }, { t0: H + 0.8, t1: H + 1.1, to: L0, lift: 5 }] },
    R: { start: R0, moves: [{ t0: H - 0.08, t1: H, to: { ...R0, pitch: 28 } }, { t0: H + 0.6, t1: H + 0.85, to: R0 }] },
  });
}

/**
 * THE WIDE SWEEP (his pick by 16:46, "Wide sweep (Recommended)"): all the way round him, low. His
 * right hand slides down to his left at the haft's end, for all the reach of it, and he hauls the axe
 * back to his right, turning away with it, low, his weight on his back foot, and holds it (the warning:
 * a ring on the floor as far as it reaches, the game's); then spins round to his left, once all the way
 * round, the axe out at the end of his arms at the height of a man's knee, the blade leaving a streak of
 * fire round him; it carries him on past where he began, the blade drops and skids on the floor, and
 * he hauls it back across him. His feet step round under him.
 */
export const HS_SWEEP_FROM = 0.78;
export const HS_SWEEP_TO = 1.32;
/** The moment the blade is straight ahead of him, half way round (the rules' own moment of the blow). */
export const HS_SWEEP_HIT = (HS_SWEEP_FROM + HS_SWEEP_TO) / 2;
/** His grip on the sweep: his right hand down near his left at the haft's end. */
const SW_DRAW = 0.12;
/** How far round to his right his hips are wound before the sweep (his chest goes further). */
const SW_W0 = -44;
/** The sweep as it goes round: `turn` degrees of it (0 wound back to his right, 360 round again). His hips lead; his chest comes round after them, and the axe after his chest. (His feet are his footwork's: `hsSweepFeet`.) */
function sweepAt(turn: number, low = 0): P {
  const yaw = SW_W0 + turn;
  const twist = -46 + 61 * smooth01((turn - 30) / 150);
  const chest = yaw + twist;
  // the axe trailing behind his chest as he winds back, then out before it and to its left, down at a man's knee; its edge leading, round to the left
  const az = chest - 55 + 85 * smooth01((turn - 50) / 110);
  const el = -34 + 18 * (1 - clamp01(turn / 60)) - low;
  const pt = heading(az, el);
  const lead = heading(az + 90, 0);
  return {
    px: 0, py: 0, pz: -8, yaw, twist, ...leaning(yaw, 10, 10, twist),
    faceTurn: chest + 10, faceUp: -10, faceTilt: 0,
    // (both hands at the haft's end, out before his belly: his right measured along his chest, so that it goes round with him)
    rhIn: 0, rhx: 32, rhy: 12, rhz: -24, lhIn: 3, lhx: -(AXE_HOLD(SW_DRAW) - 3), lhy: 0, lhz: 0, draw: SW_DRAW,
    ...axeWay(pt, lead),
    // (the haft's way is the figure's, not the chest's: unwound, so that it goes round and not back)
    wAz: az,
    le: 10, re: 10,
  };
}
/** How far round the sweep has gone, `k` of the way through its spin: from still, gathering speed through its first part (his hips first), then on round at speed. */
const sweepTurn = (k: number): number => (360 * (k < 0.3 ? (k * k) / 0.6 : k - 0.15)) / 0.85;
function hsSweep(): Motion {
  const R = HS_READY;
  const A = HS_SWEEP_FROM;
  const B = HS_SWEEP_TO;
  const wound = sweepAt(0);
  const keys: Key3[] = [
    { at: 0, pose: {} },
    { at: 0.4, pose: wound, ease: 'io' },
    { at: 0.55, pose: { ...wound, pz: -8.4, twist: -47, ...leaning(SW_W0, 10, 10, -47) }, ease: 'hold' },
    { at: 0.68, pose: { ...wound, pz: -7.8, twist: -48, ...leaning(SW_W0, 10, 10, -48) }, ease: 'hold' },
    { at: A, pose: { ...wound, twist: -48, ...leaning(SW_W0, 10, 10, -48) }, ease: 'io' },
  ];
  // round he goes, gathering speed: his hips first
  const STEPS = 18;
  for (let i = 1; i <= STEPS; i++) {
    const k = i / STEPS;
    keys.push({ at: A + (B - A) * k, pose: sweepAt(sweepTurn(k)), ease: 'lin' });
  }
  // carried on past, the blade dropping to the floor and skidding; then hauled back up across him, round again where he began
  const over = onFloor({ ...sweepAt(400, 14), pz: -10, ...leaning(SW_W0 + 400, 16, 14, (sweepAt(400, 14).twist as number)) }, -70, 0, 0.3);
  keys.push({ at: B + 0.2, pose: over, ease: 'out' });
  keys.push({ at: B + 0.38, pose: { ...over, pz: -9 }, ease: 'io' });
  // (up out of the skid before him, as out of the floor after a chop: round once, where he began)
  const round = (pose: P): P => ({ ...pose, yaw: (pose.yaw ?? R.yaw) + 360, faceTurn: (pose.faceTurn ?? R.faceTurn) + 360, wAz: (pose.wAz ?? R.wAz) + 360, pAz: (pose.pAz ?? R.pAz) + 360 });
  keys.push({ at: B + 0.6, pose: round(HS_OUT), ease: 'io' });
  keys.push({ at: B + 0.95, pose: round({}), ease: 'io' });
  return { hit: HS_SWEEP_HIT, keys };
}
/** HIS FEET THROUGH THE SWEEP: down where he stands while he winds back over them; then, spinning, he steps round on them, one foot down while the other goes round, a third of a turn at a time (his right first, half as far); his right comes round last as he is carried on past, and he stands as he began, once round. */
function hsSweepFeet(motion: Motion): (t: number) => P {
  const A = HS_SWEEP_FROM;
  const B = HS_SWEEP_TO;
  const R = HS_READY;
  const th = (t: number): number => bonesAt(motion.keys, R, t).yaw - SW_W0;
  const when = (deg: number): number => {
    let lo = A;
    let hi = B + 0.2;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (th(mid) < deg) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };
  const L0 = plantOf(HB, 'L', {}, R);
  const R0 = plantOf(HB, 'R', {}, R);
  const round = (p: Plant, deg: number): Plant => {
    const a = deg * D;
    return { ...p, at: [p.at[0] * Math.cos(a) - p.at[1] * Math.sin(a), p.at[0] * Math.sin(a) + p.at[1] * Math.cos(a)], turn: p.turn + deg };
  };
  const lag = R.yaw - SW_W0;
  const lMoves: FootMove[] = [];
  for (let k = 0; k < 3; k++) lMoves.push({ t0: when(120 * k + lag + 35), t1: when(120 * (k + 1) + lag - 35), to: round(L0, 120 * (k + 1)), lift: 5 });
  const rMoves: FootMove[] = [{ t0: when(1), t1: when(60 + lag - 35), to: round(R0, 60), lift: 5 }];
  for (let k = 0; k < 2; k++) rMoves.push({ t0: when(60 + 120 * k + lag + 35), t1: when(60 + 120 * (k + 1) + lag - 35), to: round(R0, 60 + 120 * (k + 1)), lift: 5 });
  rMoves.push({ t0: B + 0.03, t1: B + 0.22, to: round(R0, 360), lift: 5 });
  return footwork(HB, { L: { start: L0, moves: lMoves, knee: R.lk - R.lft }, R: { start: R0, moves: rMoves, knee: R.rk - R.rft } });
}

/**
 * THE WHIRLING THROW (his pick by 16:46, "Whirling throw (Recommended)"): from his carry his right hand
 * slides down to his left at the haft's end, and he swings the axe back to his right at the height of
 * his shoulder, flat, turning away with it, and holds it (the warning: its way out and back drawn on
 * the floor, the game's); then whips round and slings it: it goes whirling out flat across the room and
 * round, and back (its flight, its shadow and its streak are the game's: art/boss_shots.ts, and
 * makeAxeShotArt below). He waits for it, his hand out, his hood following it; it comes back into his
 * right hand with a jolt that turns him, his left hand takes its end, and he brings it back across him.
 */
export const HS_THROW_HIT = 0.8;
export const HS_CATCH = 2.3;
/** His grip to throw: both hands at the haft's end. */
const TH_DRAW = 0.12;
function hsThrow(): Motion {
  const H = HS_THROW_HIT;
  const C = HS_CATCH;
  // (first his right hand slides down to his left, the axe out before him, flat; then back it goes)
  const gather: P = held({ pz: -4, pitch: 8, bend: 9, yaw: -14, twist: -10 }, [30, 2, 66], heading(-10, 6), TH_DRAW, heading(80, 0), [-0.2, 0.6, -0.75], [-0.1, -0.6, -0.75]);
  const aside: P = held({ pz: -5, pitch: 6, bend: 7, yaw: -26, twist: -26, roll: -1, side: -1 }, [28, -16, 74], heading(-95, 4), TH_DRAW, heading(-5, 0), [-0.2, 0.6, -0.75], [-0.1, -0.7, -0.6]);
  const back: P = {
    px: -2, pz: -6, yaw: -30, pitch: 4, roll: -3, twist: -32, bend: 4, side: -3,
    faceTurn: 4, faceUp: -4,
    lk: 18, rk: -18,
    rhIn: 1, rhx: -2, rhy: -28, rhz: -2, lhIn: 3, lhx: -(AXE_HOLD(TH_DRAW) - 3), lhy: 0, lhz: 0, draw: TH_DRAW,
    // (out to his right and behind his chest: not straight back, where from behind he would be holding it toward whoever looks)
    ...axeWay(heading(-102, 0), heading(-12, 0)),
    le: 30, re: 30,
  };
  const loose: P = {
    px: 3, pz: -7, yaw: 18, pitch: 10, roll: 2, twist: 26, bend: 10, side: 2,
    faceTurn: 6, faceUp: -6,
    lk: 20, rk: -14,
    lhIn: 1, lhx: 10, lhy: 6, lhz: -30, le: -20,
    rhIn: 1, rhx: 30, rhy: 20, rhz: -4, draw: TH_DRAW, ...axeWay(heading(40, -4), heading(130, 0)),
    re: 0,
  };
  const wait: P = {
    px: 0, pz: -4, yaw: -4, pitch: 6, twist: 0, bend: 8,
    faceTurn: 30, faceUp: -2,
    lk: 14, rk: -14,
    lhIn: 0, lhx: 6, lhy: 11, lhz: HS_HANG + 4, le: -12,
    rhIn: 1, rhx: 18, rhy: -16, rhz: -18, re: 10,
  };
  const ready: P = { ...wait, faceTurn: -10, rhIn: 1, rhx: 26, rhy: -20, rhz: 2, re: 20 };
  // (his left hand lets go where the haft's end was as he slung it, and swings back down to his side)
  const whip: P = { ...back, px: 1, yaw: 10, twist: -4, roll: 0, side: 0, rhIn: 1, rhx: 24, rhy: -18, rhz: -4, ...axeWay(heading(-40, -2), heading(50, 0)), le: 10, re: 10 };
  // (where the haft's end is as he lets go, said along his chest from his left shoulder: his left hand opens there, and goes on round with his chest)
  const buttOnChest = ((): V3 => {
    const k = resolveAxe([{ at: 0, pose: whip }], HS_READY)[0].pose;
    const sk = solve(HB, { ...HS_READY, ...k } as Posed);
    const b = axeOf(sk, (k.draw as number | undefined) ?? TH_DRAW).butt;
    const d = sub(b, sk.shoulderL);
    return [dot(d, sk.chest[0]) + 2, dot(d, sk.chest[1]) + 3, dot(d, sk.chest[2]) - 4];
  })();
  const opened = (k: number, more: P): P => ({ ...more, lhIn: 0, lhx: buttOnChest[0] + (6 - buttOnChest[0]) * k, lhy: buttOnChest[1] + (11 - buttOnChest[1]) * k, lhz: buttOnChest[2] + (HS_HANG + 6 - buttOnChest[2]) * k });
  // (caught in his right hand alone, a little way up the haft, its head forward; the head swinging on round to his right with the jolt)
  const catchIt = (rh: V3, way: V3, edge: V3): P => ({ rhIn: 1, rhx: rh[0], rhy: rh[1], rhz: rh[2], draw: 0.3, ...axeWay(way, edge) });
  const caught: P = { ...ready, px: -2.5, pz: -6, yaw: -16, twist: -18, roll: -2, ...catchIt([18, -26, -2], heading(-70, -4), heading(20, 0)), re: 20 };
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: 0.18, pose: gather, ease: 'io' },
      { at: 0.32, pose: aside, ease: 'in' },
      { at: 0.46, pose: back, ease: 'out' },
      { at: 0.56, pose: { ...back, twist: -33, rhz: 0.6 }, ease: 'hold' },
      { at: H - 0.16, pose: { ...back, twist: -35, rhz: -0.4 }, ease: 'hold' },
      // (whipped round before him at the length of his arms, his hips first, so that its end swings clear of his shoulder; and let go out before him to his right)
      { at: H - 0.08, pose: { ...back, px: -1, yaw: -6, twist: -40, rhz: -1.5 }, ease: 'in' },
      { at: H, pose: whip, ease: 'lin' },
      // (his arm carried on round after it, his left hand opening and swinging down to his side, going round with his chest)
      { at: H + 0.1, pose: opened(0.12, loose), ease: 'lin' },
      { at: H + 0.24, pose: opened(1, { ...loose, yaw: 24, twist: 34, faceTurn: 2, rhx: 26, rhy: 26, rhz: -12, ...axeWay(heading(60, -10), heading(150, 0)) }), ease: 'out' },
      { at: H + 0.6, pose: wait, ease: 'io' },
      { at: C - 0.5, pose: { ...wait, faceTurn: -30, faceUp: 0 }, ease: 'io' },
      { at: C - 0.12, pose: ready, ease: 'io' },
      { at: C, pose: { ...ready, ...catchIt([25, -22, 1], heading(30, 2), heading(120, 0)), re: 20 }, ease: 'lin' },
      { at: C + 0.12, pose: caught, ease: 'out' },
      // (his left hand takes its end, and it comes back across him)
      { at: C + 0.45, pose: HS_OUT, ease: 'io' },
      { at: C + 0.8, pose: {}, ease: 'io' },
    ],
  };
}

/** STRUCK: he barely gives: rocked back a little on his heels, his hood knocked back, his cape flaring, the fire in it flaring; then he settles. His axe goes with his chest. */
function hsStruck(): Motion {
  const R = HS_READY;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.4, pz: R.pz - 0.8, pitch: R.pitch - 6, bend: R.bend - 6, faceUp: R.faceUp + 12, faceTilt: -5, gale: 0.7 }, ease: 'out' },
      { at: 0.16, pose: { px: -1.2, pz: R.pz - 0.6, pitch: R.pitch - 2, bend: R.bend - 2, faceUp: R.faceUp + 5, gale: 0.3 }, ease: 'io' },
      { at: 0.3, pose: {}, ease: 'io' },
    ],
  };
}
/** The flare in his hood as he is struck. */
const struckGlint = (t: number): number => (t < 0.05 ? t / 0.05 : Math.max(0, 1 - (t - 0.05) / 0.2));

/**
 * HIS HOOD FALLS EMPTY (his pick by 16:46): rocked back, the fire in his hood flaring; the axe slips
 * from his hands and falls; his knees give and he sinks onto them, swaying, the fire in his hood
 * guttering out; he topples forward onto the floor; and his hood slides off his shoulders and falls
 * by itself, empty, the last of the pink rising out of his collar and fading. There was nobody in it.
 */
export const HS_DIE_TIME = 2.6;
const HS_AXE_GOES = 0.3;
export const HS_HOOD_GOES = 1.32;
/** Where his feet stand as he dies: his right where it stood, his left stepped back level with it as he is rocked back; how far they come up onto their toes as his knees go down; how high a knee is on the floor (as big as it is, in its boot). */
const HS_DIE_FEET = ((): Record<'L' | 'R', Plant> => {
  const L0 = plantOf(HB, 'L', {}, HS_REST);
  const R0 = plantOf(HB, 'R', {}, HS_REST);
  return { L: plantBy(L0, R0.at[0] - L0.at[0], 0), R: R0 };
})();
const HS_TUCK = 58;
const HS_KNEE_DOWN = HB.legR[1] * 1.05;
/** Him on his knees, leaning `lean` forward of upright from them (his body as `body` has it), let down until his knees rest on the floor. */
const hsKneeling = (lean: number, body: P): P => kneelSettle(HB, HS_READY, { ...kneelHips(HB, HS_READY, HS_DIE_FEET, HS_TUCK, HS_KNEE_DOWN, lean), ...body }, HS_DIE_FEET, HS_TUCK, HS_KNEE_DOWN);
/** His arms hanging at his sides, clear of his coat. */
const HS_HANGING: P = { lhIn: 0, lhx: 6, lhy: 11, lhz: HS_HANG + 4, le: -8, rhIn: 0, rhx: 7, rhy: -11, rhz: HS_HANG + 4, re: 8 };
/**
 * HIS ARMS LIMP, laid where his body puts them as it goes down (his word of the old fall, by 21:28:
 * "The elbows stick straight up.  No one falls over like that"; of this one, by 21:33: "Yes, keep it
 * (Recommended)"): each hand on the floor `back` behind its shoulder and `out` to its side, the elbow
 * out and down, never up.
 */
function limp(body: P, back: number, out: number): P {
  const s = solve(HB, { ...HS_BASE, ...body, lhIn: 0, rhIn: 0 } as Posed);
  const at = (sh: V3, side: number): V3 => [sh[0] - back, sh[1] + side * out, 3];
  const L = at(s.shoulderL, 1);
  const R = at(s.shoulderR, -1);
  return elbowsTo({ ...body, lhIn: 2, lhx: L[0], lhy: L[1], lhz: L[2], rhIn: 2, rhx: R[0], rhy: R[1], rhz: R[2] }, [0, 1, -0.4], [0, -1, -0.4], { ...HS_BASE, ...body } as Bones);
}
/** ON HIS KNEES, swaying, his arms hanging, the fire in his hood guttering. */
const HS_ON_KNEES: P = hsKneeling(8, { yaw: -6, pitch: 8, roll: 2, twist: 0, bend: 12, side: 2, faceTurn: 0, faceUp: -14, faceTilt: 6, ...HS_HANGING });
/** FOLDING FORWARD over his knees, his back curling, his hood dropping; his arms hanging limp, his hands brushing the floor. */
const HS_FOLD: P = hsKneeling(12, { yaw: -6, pitch: 32, roll: 2, twist: 0, bend: 28, side: 1, faceTurn: 0, faceUp: -48, faceTilt: 4, lhIn: 1, lhx: 4, lhy: 2, lhz: -40, le: -10, rhIn: 1, rhx: 4, rhy: -2, rhz: -40, re: 10 });
/** SLUMPED: his chest down on the floor before his knees, his hips still up over them, his arms fallen limp beside him. */
const HS_SLUMP: P = limp(hsKneeling(24, { yaw: -6, pitch: 70, roll: 0, twist: 0, bend: 34, side: 0, faceTurn: 10, faceUp: -70, faceTilt: 10 }), 12, 12);
/** And over on to his face from his knees, flat, his arms limp at his sides. */
const HS_GOING: P = limp(hsKneeling(52, { yaw: -6, pitch: 80, roll: 0, twist: 0, bend: 18, side: 0, faceTurn: 12, faceUp: -56, faceTilt: 12 }), 26, 11);
const HS_PRONE: P = { ...limp(hsKneeling(76, { yaw: -6, pitch: 86, roll: 0, twist: 0, bend: 6, side: 0, faceTurn: 12, faceUp: -40, faceTilt: 14 }), 40, 10), out: 1 };
function hsDying(): Motion {
  const R = HS_REST;
  return {
    keys: [
      // (from where he stands, his axe planted by his foot, his hand on it)
      { at: 0, pose: {} },
      // (rocked back, his hand still on the axe; it slips from his hand and topples, and his arms drop, his left out before him and down)
      { at: 0.12, pose: { px: -3, pz: R.pz - 1, pitch: -1, bend: 1, faceUp: 8, gale: 0.6, lhIn: 0, lhx: 5, lhy: 8, lhz: HS_HANG + 2, le: -8 }, ease: 'out' },
      { at: HS_AXE_GOES, pose: { px: -2, pz: R.pz - 3, pitch: 1, bend: 4, faceUp: 4, gale: 0.4, lhIn: 0, lhx: 7, lhy: 11, lhz: HS_HANG + 5, le: -8 }, ease: 'io' },
      { at: 0.38, pose: { px: -1.5, pz: R.pz - 5, pitch: 3, bend: 5, faceUp: 4, gale: 0.3, lhIn: 0, lhx: 7, lhy: 12, lhz: HS_HANG + 6, le: -8, rhIn: 0, rhx: 9, rhy: -12, rhz: HS_HANG + 8, re: 8 }, ease: 'io' },
      { at: 0.48, pose: { px: -1, pz: -10, pitch: 4, bend: 6, faceUp: 4, lk: 30, rk: -30, gale: 0.2, ...HS_HANGING }, ease: 'io' },
      // (his knees give: down onto them, swaying)
      { at: 0.8, pose: { ...HS_ON_KNEES, out: 0.3 }, ease: 'in' },
      { at: 0.95, pose: { ...HS_ON_KNEES, pz: (HS_ON_KNEES.pz as number) + 1, pitch: 4, side: -2, roll: -2, out: 0.5 }, ease: 'out' },
      { at: 1.2, pose: { ...HS_ON_KNEES, pitch: 14, roll: 3, out: 1 }, ease: 'io' },
      // (he folds forward over his knees, and slumps onto his chest, limp)
      { at: 1.42, pose: { ...HS_FOLD, out: 1 }, ease: 'in' },
      { at: 1.56, pose: { ...HS_SLUMP, out: 1 }, ease: 'in' },
      { at: 1.64, pose: { ...HS_SLUMP, pz: (HS_SLUMP.pz as number) + 1, out: 1 }, ease: 'out' },
      // (and his hips go over after it, and he lies flat on his face)
      { at: 1.9, pose: { ...HS_GOING, out: 1 }, ease: 'in' },
      { at: 2.1, pose: HS_PRONE, ease: 'out' },
      { at: HS_DIE_TIME, pose: HS_PRONE, ease: 'io' },
    ],
  };
}
/** HIS FEET AS HE DIES: his left stepped back level with his right as he is rocked back; both up onto their toes as his knees go down before them, and there they stay. */
function hsDyingFeet(): (t: number) => P {
  const L0 = plantOf(HB, 'L', {}, HS_REST);
  const F = HS_DIE_FEET;
  return footwork(HB, {
    L: { start: L0, moves: [{ t0: 0.06, t1: 0.3, to: F.L, lift: 5 }, { t0: 0.5, t1: 0.78, to: { ...F.L, pitch: HS_TUCK } }] },
    R: { start: F.R, moves: [{ t0: 0.5, t1: 0.78, to: { ...F.R, pitch: HS_TUCK } }] },
  });
}

/** A move of his with each key's blade roll made (`resolveAxe`). */
const axed = (m: Motion, rest: Bones): Motion => ({ ...m, keys: resolveAxe(m.keys, rest) });

const HS_SWEEP_MOTION: Motion = axed(hsSweep(), HS_READY);
export const HEADSMAN: Mob = {
  id: 'headsman',
  name: 'The Headsman',
  size: 'a boss: the Warden’s height',
  build: HB,
  stand: { name: 'The Headsman waits, his axe planted', motion: axed(hsStand(), HS_REST), rest: HS_REST },
  attack: { name: 'The Headsman chops', motion: axed(hsChop(), HS_READY), rest: HS_READY, glint: heldGlint(0.35, 0.75, HS_CHOP_HIT), trail: (s, q) => trailOf(s, q), trailSpan: 3, trailOver: (t) => t > HS_CHOP_HIT - 0.04 && t < HS_CHOP_HIT + 0.07 },
  idleFrames: 25,
  idleFps: 10,
  walk: { name: 'The Headsman walks, his axe across him', motion: axed(hsWalk(), HS_READY), rest: HS_READY, period: HS_WALK_FRAMES / HS_WALK_FPS, ground: HEADSMAN_PACE * TILE3 },
  walkFrames: HS_WALK_FRAMES,
  walkFps: HS_WALK_FPS,
  pace: HEADSMAN_PACE,
  more: {
    raise: { name: 'The Headsman takes up his axe', motion: axed(hsRaise(), HS_READY), rest: HS_READY },
    setOff: { name: 'The Headsman sets off', motion: axed(hsSetOff(), HS_READY), rest: HS_READY, ground: HS_GROUND, feet: hsSetOffFeet() },
    halt: { name: 'The Headsman stops', motion: axed(hsHalt(), HS_READY), rest: HS_READY, ground: HS_GROUND, feet: hsHaltFeet() },
    lower: { name: 'The Headsman sets his axe down', motion: axed(hsLower(), HS_READY), rest: HS_READY },
    sentence: { name: 'The sentence', motion: axed(hsSentence(), HS_READY), rest: HS_READY, feet: hsSentenceFeet(), glint: heldGlint(0.5, 1.05, HS_SENTENCE_HIT), blurAt: HS_SENTENCE_HIT, trail: (s, q) => trailOf(s, q), trailSpan: 3, trailOver: (t) => t > HS_SENTENCE_HIT - 0.04 && t < HS_SENTENCE_HIT + 0.07 },
    sweep: { name: 'The wide sweep', motion: HS_SWEEP_MOTION, rest: HS_READY, feet: hsSweepFeet(HS_SWEEP_MOTION), glint: heldGlint(0.4, 0.7, HS_SWEEP_FROM), trail: (s, q) => trailOf(s, q), trailSpan: 7, trailOver: (t) => t > HS_SWEEP_FROM + 0.02 && t < HS_SWEEP_TO + 0.12 },
    holds: { name: 'How he holds his axe (pictures)', motion: axed(hsHolds(), HS_BASE), rest: HS_BASE },
    throw: { name: 'The whirling throw', motion: axed(hsThrow(), HS_READY), rest: HS_READY, glint: heldGlint(0.4, 0.7, HS_THROW_HIT), bare: (t) => t >= HS_THROW_HIT && t < HS_CATCH },
  },
  reel: { name: 'The Headsman is struck', motion: axed(hsStruck(), HS_READY), rest: HS_READY, glint: struckGlint },
  reelTime: 0.3,
  hit: HS_CHOP_HIT,
  warn: 0.4,
  dieTime: HS_DIE_TIME,
  dying: { name: 'The Headsman’s hood falls empty', motion: axed(hsDying(), HS_REST), rest: HS_REST, feet: hsDyingFeet() },
  aura: { x: HS_CANVAS.ax - 2, y: HS_CANVAS.ay - 56, r: 84, color: '#ff3a78', a: 0.15 },
  shadow: 30,
  canvas: HS_CANVAS,
  trueBack: true,
  bits: (st, m) => headsmanBits(st, m),
  fall(piece) {
    if (piece === 'axe') return { from: HS_AXE_GOES, to: [4, -8], spin: -24, lay: 'flat', hop: 1.4 };
    if (piece === 'hood') return { from: HS_HOOD_GOES, to: [12, -36], spin: -60, lay: 'axis', hop: 2.2 };
    return null;
  },
};
/** The points of his blade whose way through the air is streaked: its edge's two horns and its middle, and the eye. */
function trailOf(s: Skeleton, q: Posed): V3[] {
  const a = axeOf(s, q.draw);
  return [a.horns[0], a.edge, a.horns[1], a.eye];
}

/**
 * THE HEADSMAN AS THE CHECKS SEE HIM (art/boss_checks.ts): his outside as painted, by name (his legs in
 * their boots, his sleeves, the hood where a head would be; his trunk in the barrel of his coat), and
 * his axe while it is his: its haft from butt to cap, the iron collar of its head, its blade. His fists
 * are round the haft, so it may lie in his forearms; nothing else of him.
 */
export function hsSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const B = HB;
  const [rH, rK] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: rK * 1.1 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 2.6]), b: add(L ? s.toeL : s.toeR, [0, 0, 2.6]), r: 3.0 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.1 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.1 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: s.skull, r: 6.0 });
  const [cf, cl] = s.chest;
  void cl;
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.55));
  const lumps: CheckLump[] = [
    { name: 'hood', c: s.head, rot: s.face, h: [9.4, 8.8, 10.2] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 4.4, B.ribHalf + 4.6, len(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.5), rot: s.belly, h: [B.waistDeep + 4.2, B.waistHalf + 4.2, Math.max(4, len(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 4, B.pelvisHalf + 4, B.waist * 0.75] },
  ];
  void cf;
  return { limbs, lumps };
}
export const HS_SHAPE: BossShape = {
  body: hsSolids,
  pictures: ['holds'],
  // (the end he strikes with: his axe's edge; throwing it, his right hand, which flings it and catches it)
  tip: (move, t, s) => (move === 'throw' ? s.handR : move === 'dying' && t >= HS_AXE_GOES ? null : axeOf(s, posedOfMob(HEADSMAN, move, t).draw).edge),
  // (his axe planted when he stands: he takes it up to move or to strike, and sets it down when he stops; his blows begin and end with it across him, as his walk does)
  handovers: [
    { from: 'stand', at: 0, to: 'raise', toAt: 0 },
    { from: 'raise', at: 'end', to: 'setOff', toAt: 0 },
    { from: 'setOff', at: 'end', to: 'walk', toAt: 0 },
    { from: 'walk', at: 0, to: 'halt', toAt: 0 },
    { from: 'halt', at: 'end', to: 'lower', toAt: 0 },
    { from: 'lower', at: 'end', to: 'stand', toAt: 0 },
    { from: 'stand', at: 0, to: 'dying', toAt: 0 },
    ...(['attack', 'sentence', 'sweep', 'throw', 'reel'] as const).flatMap((m): Handover[] => [
      { from: 'raise', at: 'end', to: m, toAt: 0 },
      { from: 'halt', at: 'end', to: m, toAt: 0 },
      { from: m, at: 'end', to: 'lower', toAt: 0 },
      { from: m, at: 'end', to: 'setOff', toAt: 0 },
    ]),
  ],
  things: (move, t, s) => {
    const mv = move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? HEADSMAN[move] : move === 'dying' ? HEADSMAN.dying : HEADSMAN.more?.[move];
    if (!mv || mv.bare?.(t) || (move === 'dying' && t >= HS_AXE_GOES)) return [];
    const q = posedOfMob(HEADSMAN, move, t);
    const a = axeOf(s, q.draw);
    const pt = norm(sub(a.eye, a.butt));
    const cap = add(a.eye, mul(pt, 8.5));
    const haft: V3[] = [];
    const n = Math.ceil(len(sub(cap, a.butt)) / 3);
    for (let i = 0; i <= n; i++) haft.push(lerp3(a.butt, cap, i / n));
    // (the blade, a plate: points over it, from the collar out to the edge and between its horns)
    const blade: V3[] = [];
    for (const u of [0.2, 0.55, 0.9]) for (const v of [-0.8, 0, 0.8]) blade.push(add(add(a.eye, mul(a.out, (BLADE_OUT + 1) * u)), mul(pt, 1.5 + v * (BLADE_TALL / 2 - 1) * Math.min(1, u * 1.3))));
    // (a fist round the haft, or closing on it: its forearm may lie against it)
    const onHaft = (h: V3): boolean => {
      const ab = sub(cap, a.butt);
      const k = Math.max(0, Math.min(1, dot(sub(h, a.butt), ab) / Math.max(1e-6, dot(ab, ab))));
      return len(sub(h, add(a.butt, mul(ab, k)))) < HB.armR[2] * 1.1 + 3;
    };
    const may = [...(q.lhIn === 3 || onHaft(s.handL) ? ['foreL'] : []), ...(onHaft(s.handR) || q.rhIn !== 3 ? ['foreR'] : [])];
    return [
      { name: 'haft', pts: haft, r: 1.75, may },
      { name: 'collar', pts: [add(a.eye, mul(pt, -5)), a.eye, add(a.eye, mul(pt, 6))], r: 3.0, may },
      { name: 'blade', pts: blade, r: 1.0, may },
    ];
  },
};

/**
 * HIS AXE IN FLIGHT (the whirling throw): flat, whirling round about its head's weight, its edge
 * leading (`turn`, 0..1 once round, to its left), and the streak its edge leaves round it, the
 * enemy's edge round it. Its middle (where it turns about) is on the anchor; it is the Headsman's
 * own size.
 */
export const AXE_SHOT_CANVAS: MobCanvas = { w: 200, h: 140, ax: 100, ay: 76 };
export function paintAxeShot(turn: number, view: PaintView = 'front'): Painted {
  const can = AXE_SHOT_CANVAS;
  const st = stage(view, can.ax, can.ay, can);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const a = turn * Math.PI * 2;
  // (tipped a little, so that the blade is seen: it is thrown flat, not dead level)
  const pt: V3 = norm([Math.cos(a), Math.sin(a), -0.12]);
  const out: V3 = norm([-Math.sin(a), Math.cos(a), 0.05]);
  // (it turns about a point most of the way up its haft: the head is the weight of it)
  const pivot = AXE_LEN - 14;
  axeSolids(put, mul(pt, -pivot), pt, out);
  // the streak its edge leaves as it whirls: an arc of steel and pink fire behind the edge
  const R = 14 + BLADE_OUT;
  for (let i = 1; i <= 40; i++) {
    const b = a - (i / 40) * 2.4;
    const p: V3 = [Math.cos(b) * (R - 2), Math.sin(b) * (R - 2), -0.12 * R];
    const q: V3 = [Math.cos(b + 0.35) * R * 0.9, Math.sin(b + 0.35) * R * 0.9, -0.12 * R];
    const k = i / 40;
    put('whirl', 'whirl', { k: 'mote', p: lerp3(p, q, 0.5), c: k < 0.2 ? STEEL[3] : k < 0.5 ? FLAME[3] : FLAME[2], size: k < 0.35 ? 2 : 1 });
    if (k < 0.7) put('whirl', 'whirl', { k: 'mote', p: lerp3(p, q, 0.15), c: k < 0.3 ? FLAME[3] : FLAME[1], size: 1 });
  }
  put('whirl', 'whirl', { k: 'glow', p: [Math.cos(a + 0.35) * R * 0.9, Math.sin(a + 0.35) * R * 0.9, 0], c: FLAME[3], r: 14, a: 0.35 });
  const lights = paintBits(st, bits, [0, 0, 0]);
  return { px: st.whole(ENEMY_RIM), lights };
}
/** The frames of the axe in flight, once round (as the game holds a picture: cut down, its anchor at its middle). */
export const AXE_SHOT_FRAMES = 12;
export function makeAxeShotArt(view: GameView = 'front'): Sprite[] {
  // (from behind as he is painted: as the camera truly sees it, `trueBack`)
  return lazyFrames(AXE_SHOT_FRAMES, (i) => toSprite(paintAxeShot(i / AXE_SHOT_FRAMES, paintViewOf(HEADSMAN, view)), null, AXE_SHOT_CANVAS.ax, AXE_SHOT_CANVAS.ay));
}

/** Where his chop's blade bites the floor, and the sentence's: the middle of its edge as the blow lands (the figure's own lengths; for the floor's drawings and the tests). */
export function hsBite(which: 'attack' | 'sentence'): V3 {
  const t = which === 'attack' ? HS_CHOP_HIT : HS_SENTENCE_HIT;
  return axeOf(skeletonAt(HEADSMAN, which, t), posedOfMob(HEADSMAN, which, t).draw).edge;
}
/** How far round him his sweep's blade reaches (the figure's own lengths, on the floor). */
export function hsSweepReach(): number {
  let most = 0;
  for (let t = HS_SWEEP_FROM; t <= HS_SWEEP_TO; t += 1 / 60) {
    const a = axeOf(skeletonAt(HEADSMAN, 'sweep', t), posedOfMob(HEADSMAN, 'sweep', t).draw);
    for (const p of [a.edge, ...a.horns]) most = Math.max(most, Math.hypot(p[0], p[1]));
  }
  return most;
}

/** THE HEADSMAN, as the game holds a monster (see art/new_mobs3.ts makeShadeArt3). */
export function makeHeadsmanArt3(pace = HEADSMAN.pace): ActorArt {
  return { front: mobSet(HEADSMAN, 'front', pace), back: mobSet(HEADSMAN, 'back', pace) };
}

// =============================================================================================
// Chains (the Chained One's, and whatever else is chained)

/** The skin of a link that lies flat to the eye: iron round a hole. */
function linkSkin(ramp: Ramp): Skin {
  return (u, tone) => (Math.abs(u[0]) < 0.48 && Math.abs(u[1]) < 0.4 ? INK : ramp[Math.min(4, tone)]);
}

/**
 * A CHAIN along a path (points of the figure's own space): links of iron, each turned a quarter
 * round from the last, as a chain's are, one every `2.6 * size`; one piece, so that a length of it
 * falls whole. Returns how many links it took.
 */
function chainAlong(put: Put, part: string, piece: string, path: ReadonlyArray<V3>, size = 1, ramp: Ramp = IRON): number {
  const step = 2.6 * size;
  let carry = 0;
  let n = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const d = sub(path[i], a);
    const L = len(d);
    if (L < 1e-6) continue;
    const dir = mul(d, 1 / L);
    const side0 = norm(cross(dir, Math.abs(dir[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
    let at = carry;
    while (at < L) {
      const c = add(a, mul(dir, at));
      const flat = n % 2 === 0;
      const across = flat ? side0 : norm(cross(dir, side0));
      const thin = norm(cross(dir, across));
      put(part, piece, { k: 'ball', c, ax: [mul(dir, 1.75 * size), mul(across, (flat ? 1.2 : 0.62) * size), mul(thin, 0.55 * size)], skin: flat ? linkSkin(ramp) : ramp });
      n++;
      at += step;
    }
    carry = at - L;
  }
  return n;
}

/**
 * THE WAY A CHAIN HANGS from `from` and lies on the floor: down from it, bowed by `sway`, to where it
 * meets the floor (`meet`, on the floor), and on along the floor toward `away` (a flat direction)
 * for the rest of its `length`, lying in easy curves. Points along it.
 */
function hangingChain(from: V3, meet: V3, length: number, away: V3, sway: V3 = [0, 0, 0], seed = 0): V3[] {
  const pts: V3[] = [];
  const m: V3 = [meet[0], meet[1], 1.1];
  const fall = len(sub(from, m));
  const N = Math.max(4, Math.round(fall / 3));
  for (let i = 0; i <= N; i++) {
    const k = i / N;
    const p = lerp3(from, m, k);
    // (it falls nearly straight from the hand and curves out to where it meets the floor)
    const bow = Math.sin(k * Math.PI);
    const drop = from[2] + (m[2] - from[2]) * (1 - (1 - k) * (1 - k));
    pts.push([p[0] + sway[0] * bow, p[1] + sway[1] * bow, Math.max(1.1, drop + sway[2] * bow)]);
  }
  const rest = Math.max(0, length - fall);
  const a = norm([away[0], away[1], 0], [-1, 0, 0]);
  const side: V3 = [-a[1], a[0], 0];
  const M = Math.max(1, Math.round(rest / 3));
  for (let i = 1; i <= M; i++) {
    const k = i / M;
    const wig = Math.sin(k * 5.2 + seed) * 2.2 * k;
    pts.push([m[0] + a[0] * rest * k + side[0] * wig, m[1] + a[1] * rest * k + side[1] * wig, 1.1]);
  }
  return pts;
}

// =============================================================================================
// 2. THE CHAINED ONE
//
// The prisoner of the deepest cell: a giant starved down to his bones, the Warden's height if he
// stood up straight, which he never does. Grey skin stretched over a rib cage you can count, long
// bony arms, knobbed knees, bare feet; rags at his hips, lank hair; AN IRON CAGE BOLTED OVER HIS
// FACE, his eyes burning pink through its bars. Iron at his wrists, and from each a chain to the
// floor (from the right one hangs a hook); a collar of iron, and from it a chain to an iron ball he
// drags behind him; irons on his ankles. Standing, he is never still: he breathes hard through the
// iron, his head jerks round at every sound, his fingers twitch, his chains stir.

/** His body: tall and long-limbed, starved thin: narrow at the waist, his arms long enough to drag his knuckles when he stoops. */
const CO_BODY: Build = buildOf(132, 0.92, { shoulders: 1.16, chest: 0.9, depth: 0.86, waist: 0.66, hips: 0.82, legs: 1.0, arms: 1.3, trunk: 1.04, limbs: 1.05, pad: 1.4 });
const CB2 = CO_BODY;

/** His colours: skin grey over bone; rags; lank dark hair; the iron of his cage, his irons and his chains. */
export const STARVED: Ramp = ['#352c3e', '#352c3e', '#6a5e76', '#a698b0', '#a698b0'];
const RAGS: Ramp = ['#141019', '#141019', '#2a2232', '#43384e', '#43384e'];
const HAIR: Ramp = ['#0e0b16', '#0e0b16', '#211b30', '#382f4c', '#382f4c'];
/** His iron, old and pitted: the kit's iron, a little rusted. */
const OLD_IRON: Ramp = IRON;

/** How his chains are, in the figure's own lengths: from each wrist, from his collar to the ball; the ball's size. */
const WRIST_CHAIN = 52;
const COLLAR_CHAIN = 44;
const BALL_R = 7.6;

const CO_HANG = -(CB2.upperArm + CB2.foreArm) * 0.94;
/** How he stands: stooped, his knees bent, his long arms hanging, his head pushed forward and up to see. */
const CO_BASE: Bones = {
  ...standing(CB2),
  pz: -9, px: -1.5, yaw: -8, pitch: 18, roll: 0, twist: -4, bend: 30, side: 0,
  faceTurn: 6, faceUp: 22, faceTilt: -4,
  lfx: 6, lfy: 6.5, lft: 16, lk: 22, rfx: -6, rfy: -6.5, rft: -20, rk: -22,
  lhIn: 0, lhx: 15, lhy: 6, lhz: CO_HANG * 0.9, le: -26,
  rhIn: 0, rhx: 14, rhy: -6, rhz: CO_HANG * 0.9, re: 26,
  wAz: 0, wEl: 0, wRoll: 0, draw: 0, pt: 0, out: 0, prop: 0, gale: 0,
};
export const CO_REST: Bones = CO_BASE;
/** How fast he shambles, in tiles a second (his walk is painted for it). */
export const CHAINED_PACE = 1.1;

/** Where his iron ball lies when he stands, and where his chains meet the floor (from his place on the floor). */
const BALL_AT: V3 = [-34, 18, BALL_R];

// --- HIS CHAINS SWING (art/boss_chains.ts): each worked out through each of his moves ---

/** Where a chain hangs from his wrist: the ring on the iron cuff, a little back from his hand along his forearm. */
export function cuffAt(s: Skeleton, side: 'L' | 'R'): V3 {
  const hand = side === 'L' ? s.handL : s.handR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  return add(hand, mul(norm(sub(hand, el), [0, 0, -1]), -3.6));
}
/** Where the ball's chain hangs from his collar: the ring at its back. */
export function collarRingAt(s: Skeleton): V3 {
  return add(lerp3(s.neck, s.skull, 0.25), mul(s.chest[0], -4.6));
}
/** His chains by name: from his left wrist, from his right (its end a hook), from his collar to the ball. */
export type CoRope = 'L' | 'R' | 'ball';
const CO_ROPES: ReadonlyArray<CoRope> = ['L', 'R', 'ball'];
/**
 * HOW FREE HE IS: he grows wilder as his chains break, one at a time (his pick by 23:08, "One at a time
 * (Recommended)"): 0, all his chains on him; 1, the chain on his left wrist ripped off (a stub of it
 * left on the cuff); 2, the ball's chain torn from his collar too (the ball left lying where it was,
 * a stub on the collar's ring). When each breaks, and how much quicker he is after, are the rules'.
 */
export type CoFreed = 0 | 1 | 2;
/** The chains he still has, as free as he is. */
const ropesOf = (freed: CoFreed): ReadonlyArray<CoRope> => (freed === 0 ? CO_ROPES : freed === 1 ? ['R', 'ball'] : ['R']);
/** The way the ball's chain lies as he was first painted: from his collar down his back, to the floor, and along it to the ball. */
function restBallPath(s: Skeleton): V3[] {
  const B = CB2;
  const ring = collarRingAt(s);
  // (down his back, clear of it: over his shoulder blades, behind his belly, behind his hips in their rags, to the floor behind him)
  const [cf, , cu] = s.chest;
  const chestC = add(s.ribs, add(mul(cu, B.chest * 0.42), mul(cf, 0.4)));
  const q1: V3 = add(chestC, mul(cf, -(B.ribDeep + 1.5 + 4.5)));
  const q2: V3 = add(lerp3(s.waist, s.ribs, 0.35), mul(s.belly[0], -(B.waistDeep + 6)));
  const q3: V3 = add(add(s.pelvis, mul(s.hips[0], -(B.pelvisDeep + 8))), [0, 3, -6]);
  const meet: V3 = [BALL_AT[0] + 6, BALL_AT[1] + 2, 1.1];
  return [ring, q1, q2, q3, ...hangingChain(q3, meet, len(sub(q3, meet)) + 1, [-1, 0, 0], [0, 0, 0]).slice(1), BALL_AT];
}
/** How long the ball's chain is: as long as the way it lay when he was first painted (taut down his back to the ball: so it lies there, and does not slide off him), and a little more. */
const BALL_CHAIN = ((): number => {
  const p = restBallPath(solve(CB2, CO_REST as Posed));
  let l = 0;
  for (let i = 1; i < p.length; i++) l += len(sub(p[i], p[i - 1]));
  return l + 4;
})();
/** Each chain: its length, its pieces, how heavy its end is (the hook a little; the ball a great deal), how thick, how big its end. */
const CO_SPEC: Record<CoRope, ChainSpec> = {
  L: { long: WRIST_CHAIN, n: 20, endMass: 1.5, r: 1.2, endR: 1.3 },
  R: { long: WRIST_CHAIN, n: 20, endMass: 5, r: 1.2, endR: 2.2, endPad: 5.5 },
  ball: { long: BALL_CHAIN, n: 34, endMass: 40, r: 1.4, endR: BALL_R, air: 0.997, endOnFloor: true },
};
/** Each chain as he was first painted: from his wrists to the floor and trailing back along it; from his collar to the ball. */
function restChains(s: Skeleton): Record<CoRope, V3[]> {
  const out = {} as Record<CoRope, V3[]>;
  for (const side of ['L', 'R'] as const) {
    const from = cuffAt(s, side);
    const sgn = side === 'L' ? 1 : -1;
    out[side] = hangingChain(from, [from[0] - 4, from[1] + sgn * 3, 1.1], WRIST_CHAIN, [-1, sgn * 0.5, 0], [0, 0, 0], side === 'L' ? 0 : 2);
  }
  out.ball = restBallPath(s);
  return out;
}
/**
 * HIS OUTSIDE AS SOLIDS, by name: his legs, his feet, his arms, his neck and head (the cage), and his
 * trunk (his ribs, his belly, his hips in their rags). What he keeps his chains out of, and what the
 * checks keep everything else out of (art/boss_checks.ts).
 */
export function coSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const B = CB2;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: B.legR[0] * 0.72 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: B.legR[1] * 0.6 },
      { name: `foot${side}`, a: L ? s.heelL : s.heelR, b: L ? s.toeL : s.toeR, r: 2.2 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: B.armR[0] * 0.74 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: B.armR[1] * 0.62 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: s.skull, r: 4.4 }, { name: 'head', a: s.head, b: s.head, r: Math.max(...B.headR) * 1.22 });
  const [cf, , cu] = s.chest;
  const lumps: CheckLump[] = [
    { name: 'chest', c: add(s.ribs, add(mul(cu, B.chest * 0.42), mul(cf, 0.4))), rot: s.chest, h: [B.ribDeep + 1.5, B.ribHalf + 1.8, B.chest * 0.62] },
    { name: 'belly', c: lerp3(s.waist, s.ribs, 0.35), rot: s.belly, h: [B.waistDeep + 1.0, B.waistHalf + 1.2, 6.5] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 3.5, B.pelvisHalf + 4, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
/**
 * What he keeps his chains out of (his solids, in the order they are kept out of: it makes no picture
 * of it differ). A chain is not kept off the arm it hangs from (`own`): it hangs from the cuff at his
 * wrist, and a forearm lifted under it would scoop it up and carry it.
 */
export function coBody(s: Skeleton, own?: 'L' | 'R'): { limbs: Limb[]; lumps: Lump[] } {
  const { limbs, lumps } = coSolids(s);
  return { limbs: limbs.filter((l) => !own || (l.name !== `upper${own}` && l.name !== `fore${own}`)), lumps };
}
/** What usually holds each chain: its cuff, his collar; and the ball, too heavy to move unless he moves it, where it lies behind him (dragged, as he walks: the floor goes by under it). */
function usualHold(name: CoRope, s: Skeleton): ChainHold {
  return name === 'ball' ? { from: collarRingAt(s), held: [[CO_SPEC.ball.n, BALL_AT]] } : { from: cuffAt(s, name), held: [] };
}
/**
 * WHAT A MOVE DOES WITH HIS CHAINS, over and above hanging from his cuffs and his collar: holds a
 * chain otherwise (a link in his hand, the ball in his hands; `undefined`: as usual), or lets it go
 * out of his hands for the game to draw ('out': a hook flung across the room); and how one lies when
 * it comes back to him (`back`). The floor going by under him (a walk), the figure's own lengths a
 * second.
 */
interface CoChainPlan {
  hold?: (name: CoRope, s: Skeleton, t: number) => ChainHold | 'out' | undefined;
  back?: (name: CoRope, s: Skeleton, t: number) => ReadonlyArray<V3>;
  ground?: number;
  /** How much of its swing each chain keeps each small step through this move (its own, if not said: a move with no whip in it lets its chains hang heavier). */
  air?: number;
  /** What else the move throws off at a moment, by name, from where its chains are (`look`, at any moment of it): sparks and dust where a chain slams the floor, a trail behind chains whirling, links flying where one snaps (`chainedBits` paints them). */
  extra?: (t: number, look: (name: CoRope, t: number) => ReadonlyArray<V3> | null) => Record<string, ReadonlyArray<V3>>;
  /** How much of its swing each chain keeps at a moment of the move (as `air`; heavier while he settles at its end, so that his chains hang still when the next move takes them up). */
  airAt?: (t: number) => number | undefined;
  /** HIS CHAINS WHERE ONE MOVE HANDS OVER TO ANOTHER (the art rulebook, Movement 5: nothing jumps): as they are at the start of the move that comes before it (his stand's, as a rule), and as they must be at its end for the move that comes after it; its last moments ease them there. */
  start?: () => Ropes;
  end?: () => Ropes;
  /** Parts of him a chain is not kept out of at a moment (a foot standing on it: lifted off it, it lets it be, and does not fling it). */
  bare?: (name: CoRope, t: number) => ReadonlyArray<string>;
}
/** How many rounds a looped move is worked through before the one that is kept (so its chains swing as they do round and round, not as they first start). */
const CO_ROUNDS = 4;
/** His chains as they hang when he has stood still a while: worked out once from how he was first painted. */
let coSettled: Record<CoRope, ReadonlyArray<V3>> | null = null;
function settledChains(): Record<CoRope, ReadonlyArray<V3>> {
  if (coSettled) return coSettled;
  const s = solve(CB2, CO_REST as Posed);
  const start = restChains(s);
  const out = {} as Record<CoRope, ReadonlyArray<V3>>;
  for (const name of CO_ROPES) {
    const body = coBody(s, name === 'ball' ? undefined : name);
    const c = new Chain(CO_SPEC[name], start[name]);
    const h = usualHold(name, s);
    // (let fall and swing, then stilled: as they hang after he has stood a while)
    for (let i = 0; i < Math.round(2.0 / SIM_STEP); i++) stepChain(c, h, body.limbs, body.lumps, 0, SIM_STEP);
    for (let i = 0; i < Math.round(1.0 / SIM_STEP); i++) stepChain(c, h, body.limbs, body.lumps, 0, SIM_STEP, 0.99);
    out[name] = c.now();
  }
  return (coSettled = out);
}
/**
 * HIS CHAINS THROUGH A MOVE: worked out (once, when first asked for) from his chains as they hang at
 * rest, moment by moment as the move's bones move what holds them; and where each is `t` seconds in
 * (a chain not his to paint then is left out). A move that goes round is worked through several
 * rounds first, and the round kept is closed on itself.
 */
function coChains(motion: Motion, rest: Bones, plan: CoChainPlan = {}, names: ReadonlyArray<CoRope> = CO_ROPES, feet?: (t: number) => P): (t: number) => Ropes {
  let made: ((t: number) => Ropes) | null = null;
  return (t) => (made ??= makeCoChains(motion, rest, plan, names, feet))(t);
}
function makeCoChains(motion: Motion, rest: Bones, plan: CoChainPlan, names: ReadonlyArray<CoRope>, feet?: (t: number) => P): (t: number) => Ropes {
  const keys = motion.keys;
  const end = keys.length ? keys[keys.length - 1].at : 0;
  const loop = motion.loop;
  const round = loop !== undefined ? end - loop : 0;
  const fold = (t: number): number => (loop === undefined || round <= 1e-6 ? Math.max(0, Math.min(end, t)) : t <= end ? t : loop + ((((t - loop) % round) + round) % round));
  // (his feet as his footwork has them: the chains keep out of them where they are)
  const bonesThen = (t: number): Skeleton => solve(CB2, feet ? ({ ...bonesAt(keys, rest, fold(t)), ...feet(fold(t)) } as Posed) : bonesAt(keys, rest, fold(t)));
  const settled = settledChains();
  const first = plan.start?.();
  // (how the next move takes them up, and over how long before the end they are drawn on toward it)
  const goal = plan.end && loop === undefined ? plan.end() : undefined;
  const endFor = Math.min(0.5, end / 2);
  const far = {} as Record<CoRope, boolean | undefined>;
  const behind: V3 = [-Math.cos(rest.yaw * D), -Math.sin(rest.yaw * D), 0];
  const chains = {} as Record<CoRope, Chain>;
  for (const name of names) chains[name] = new Chain(CO_SPEC[name], first?.[name] ?? settled[name]);
  const floorV = -(plan.ground ?? 0);
  const holdOf = (name: CoRope, s: Skeleton, t: number): ChainHold | 'out' => plan.hold?.(name, s, t) ?? usualHold(name, s);
  // (worked through to the end of the move, or through its rounds and the one kept)
  const T = loop !== undefined ? loop + round * (CO_ROUNDS + 1) : end;
  const keepFrom = loop !== undefined ? loop + round * CO_ROUNDS : 0;
  const kept = {} as Record<CoRope, (V3[] | null)[]>;
  for (const name of names) kept[name] = [];
  const out = {} as Record<CoRope, boolean>;
  let t0 = 0;
  let s0 = bonesThen(0);
  const keep = (t: number): void => {
    if (t < keepFrom - 1e-9) return;
    for (const name of names) kept[name].push(out[name] ? null : chains[name].now());
  };
  for (const name of names) out[name] = holdOf(name, s0, 0) === 'out';
  keep(0);
  const SUB = Math.round(SIM_KEEP / SIM_STEP);
  for (let k = 1; t0 < T - 1e-9; k++) {
    const t1 = k * SIM_KEEP;
    const s1 = bonesThen(t1);
    const bodies = { L: coBody(s1, 'L'), R: coBody(s1, 'R'), ball: coBody(s1) };
    for (const name of names) {
      const off = plan.bare?.(name, t1) ?? [];
      const body = off.length ? { limbs: bodies[name].limbs.filter((l) => !off.includes((l as CheckLimb).name)), lumps: bodies[name].lumps } : bodies[name];
      const h1 = holdOf(name, s1, t1);
      if (h1 === 'out') {
        out[name] = true;
        continue;
      }
      if (out[name]) {
        // (back to be his: laid as it comes back, still)
        chains[name].lay(plan.back ? plan.back(name, s1, t1) : restChains(s1)[name]);
        out[name] = false;
      }
      const ha = holdOf(name, s0, t0);
      const h0 = ha === 'out' ? h1 : ha;
      for (let j = 1; j <= SUB; j++) {
        const f = j / SUB;
        const from = h0.from && h1.from ? lerp3(h0.from, h1.from, f) : h1.from;
        const held = h1.held.map(([i, q]) => {
          const was = h0.held.find((e) => e[0] === i);
          return [i, was ? lerp3(was[1], q, f) : q] as const;
        });
        // (its last moments: drawn on toward how the next move takes it up, still kept out of him as it goes;
        // one that has come to lie far from it, round the other side of him, drawn out behind him first and
        // round, not into him)
        const tk = t0 + f * SIM_KEEP;
        if (goal?.[name] && tk > end - endFor) {
          const w = smooth01((tk - (end - endFor)) / endFor);
          const pull = 0.06 * w;
          const c = chains[name];
          const to = goal[name];
          if (to.length === c.x.length) {
            if (far[name] === undefined) far[name] = c.x.reduce((a, q, i) => a + len(sub(q as unknown as V3, to[i])), 0) / c.x.length > 15;
            const round = far[name] ? 1 - smooth01((tk - (end - endFor * 0.5)) / (endFor * 0.4)) : 0;
            for (let i = 0; i < c.x.length; i++) {
              const k = i / (c.x.length - 1);
              for (let d = 0; d < 3; d++) {
                const via = d < 2 ? behind[d] * 26 * round * Math.sin(Math.PI * Math.min(1, k * 1.6)) : 0;
                const dv = (to[i][d] + via - c.x[i][d]) * pull;
                c.x[i][d] += dv;
                c.p[i][d] += dv;
              }
            }
          }
        }
        stepChain(chains[name], { from, held }, body.limbs, body.lumps, floorV, SIM_STEP, plan.airAt?.(t1) ?? plan.air ?? CO_SPEC[name].air);
      }
    }
    keep(t1);
    t0 = t1;
    s0 = s1;
  }
  const tracks = {} as Record<CoRope, ChainTrack>;
  for (const name of names) {
    let frames: ReadonlyArray<ReadonlyArray<V3> | null> = kept[name];
    if (loop !== undefined && frames.every((f) => f !== null)) {
      // (a loop closed on itself: and what that closing moved into him, put back out of him, moment by moment)
      const closed = closeLoop(frames as ReadonlyArray<ReadonlyArray<V3>>);
      frames = closed.map((f, k) => {
        const body = coBody(bonesThen(keepFrom + k * SIM_KEEP), name === 'ball' ? undefined : name);
        const spec = CO_SPEC[name];
        return f.map((q, i) => {
          if (i < 3) return q;
          const p: [number, number, number] = [q[0], q[1], q[2]];
          const pad = i === f.length - 1 ? spec.endR : spec.r;
          for (let pass = 0; pass < 2; pass++) {
            for (const l of body.limbs) outOfLimb(p, l, pad);
            for (const o of body.lumps) outOfLump(p, o, pad);
          }
          p[2] = Math.max(p[2], pad);
          return p as V3;
        });
      });
    }
    if (goal && loop === undefined) {
      // (and what is left of the way, closed in its very last moments)
      const to = goal[name];
      const B = Math.min(0.05, end / 4);
      if (to && to.length === frames[0]?.length) {
        frames = frames.map((f, k) => {
          const tk = k * SIM_KEEP;
          if (!f || tk < end - B) return f;
          const w = smooth01((tk - (end - B)) / B);
          return f.map((q, i) => lerp3(q, to[i], w));
        });
      }
    }
    tracks[name] = { t0: loop !== undefined ? loop : 0, frames };
  }
  const look = (name: CoRope, t: number): ReadonlyArray<V3> | null => (tracks[name] ? chainAt(tracks[name], fold(t)) : null);
  return (t: number): Ropes => {
    const r: Record<string, ReadonlyArray<V3>> = {};
    const tt = fold(t);
    for (const name of names) {
      const at = chainAt(tracks[name], tt);
      if (at) r[name] = at;
    }
    if (plan.extra) Object.assign(r, plan.extra(tt, look));
    return r;
  };
}

/** THE CHAINED ONE AS SOLIDS. `broken`: how many of his chains are broken (0 none; the rules say when). */
function chainedBits(st: Stage, m: Moment, freed: CoFreed = 0): Bit[] {
  const { s, q } = m;
  const B = CB2;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const lag = capped(mul(m.come, -1.4), 3.2);
  const wave = m.wind * Math.PI * 2;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];

  // --- the legs: bone under grey skin, knobbed knees, bare long feet; irons on his ankles ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const [rH, rK, rA] = B.legR;
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 0.72, rb: rK * 0.56, ramp: STARVED, far: true });
    put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 0.82), skin: STARVED, far: true });
    put(`leg${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: rK * 0.56, rb: rA * 0.58, ramp: STARVED, far: true });
    put(`leg${side}`, `shin${side}`, { k: 'ball', c: ankle, ax: sphere(rA * 0.8), skin: STARVED, far: true });
    const fwd = norm(sub(toe, heel), [1, 0, 0]);
    const across: V3 = norm([-fwd[1], fwd[0], 0], [0, 1, 0]);
    put(`leg${side}`, `foot${side}`, { k: 'rod', a: add(heel, [0, 0, 1.6]), b: add(toe, [0, 0, 1.2]), ra: 2.1, rb: 1.7, ramp: STARVED, far: true });
    for (const k of [-1, 0, 1]) put(`leg${side}`, `foot${side}`, { k: 'ball', c: add(add(toe, mul(across, k * 1.4)), [0, 0, 1.0]), ax: sphere(0.9), skin: STARVED, far: true });
    // the iron on his ankle, a broken stub of chain hanging from it
    put(`irons${side}`, `irons${side}`, { k: 'band', ring: { c: lerp3(ankle, knee, 0.12), u: mul(f, rA * 1.5), v: mul(l, rA * 1.5) }, ramp: OLD_IRON, rows: 3 });
    const stub = add(lerp3(ankle, knee, 0.1), mul(side === 'L' ? l : mul(l, -1), rA * 1.4));
    chainAlong(put, `irons${side}`, `irons${side}`, [stub, add(stub, [-1.5, 0, -2.5]), add(stub, [-3.5, side === 'L' ? 1 : -1, -3.6])], 0.8, OLD_IRON);
  }

  // --- rags at his hips: what is left of a prisoner's breeches, torn short ---
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.4));
  const top: Ring = { c: waistC, u: mul(s.hips[0], B.waistDeep + 2.2), v: mul(s.hips[1], B.waistHalf + 2.4) };
  const rags = skirtOf(s, B, { top, drop: B.thigh * 0.5, wide: B.pelvisHalf + 4, deep: B.pelvisDeep + 3.5, lag, wind: m.wind, gale: q.gale, pad: 1.0 });
  put('rags', 'rags', { k: 'cloth', rings: rags, ramp: RAGS, look: { folds: [20, -40, 90, -110, 160], lift: 0.1 }, torn: [5, 1, 7, 0, 3, 8, 2, 4, 0, 6, 3, 1] });
  put('rags', 'rags', { k: 'band', ring: { c: add(waistC, mul(s.hips[2], 1.2)), u: mul(s.hips[0], B.waistDeep + 2.6), v: mul(s.hips[1], B.waistHalf + 2.8) }, ramp: RAGS, rows: 2 });

  // --- his body: a starved belly, a rib cage under grey skin that you can count, the knobs of his spine down his back ---
  const be = s.belly;
  put('belly', 'body', { k: 'ball', c: lerp3(s.waist, s.ribs, 0.35), ax: [mul(be[0], B.waistDeep + 1.0), mul(be[1], B.waistHalf + 1.2), mul(be[2], 6.5)], skin: STARVED });
  const chestC = add(s.ribs, add(mul(cu, B.chest * 0.42), mul(cf, 0.4)));
  const ribSkin: Skin = (u, tone) => {
    // (grooves between the ribs on his front and sides: darker bands round the cage, five of them)
    if (u[0] > -0.35 && u[2] < 0.55 && u[2] > -0.85) {
      const band = (u[2] + 0.85) * 3.6;
      if (band - Math.floor(band) < 0.34) return STARVED[Math.max(0, tone - 2)];
    }
    // (the hollow under the rib cage, in front)
    if (u[0] > 0.5 && u[2] < -0.8) return STARVED[Math.max(0, tone - 1)];
    return STARVED[tone];
  };
  const CR: V3 = [B.ribDeep + 1.5, B.ribHalf + 1.8, B.chest * 0.62];
  put('chest', 'body', { k: 'ball', c: chestC, ax: [mul(cf, CR[0]), mul(cl, CR[1]), mul(cu, CR[2])], skin: ribSkin });
  // (his ribs standing out under the skin: arcs from his breastbone round his sides, sloping down to the front)
  for (let i = 0; i < 5; i++) {
    const v = 0.42 - i * 0.26;
    for (const sg of [1, -1]) {
      let last: V3 | null = null;
      for (let k = 0; k <= 5; k++) {
        const a = (14 + k * 20) * D;
        const vv = v - 0.16 * Math.cos(a);
        const kk = Math.sqrt(Math.max(0, 1 - vv * vv));
        const p = add(chestC, add(add(mul(cf, Math.cos(a) * kk * CR[0] * 1.04), mul(cl, sg * Math.sin(a) * kk * CR[1] * 1.04)), mul(cu, vv * CR[2])));
        if (last) put('ribs', 'body', { k: 'rod', a: last, b: p, ra: 0.9, rb: 0.9, ramp: STARVED });
        last = p;
      }
    }
  }
  put('ribs', 'body', { k: 'rod', a: add(chestC, add(mul(cf, CR[0] * 1.02), mul(cu, CR[2] * 0.5))), b: add(chestC, add(mul(cf, CR[0] * 1.02), mul(cu, -CR[2] * 0.55))), ra: 1.1, rb: 0.9, ramp: STARVED });
  // (his spine, a ridge of knobs down his bent back)
  for (let i = 0; i < 6; i++) {
    const p = add(lerp3(s.waist, s.neck, 0.08 + i * 0.16), mul(cf, -(B.ribDeep + 1.1) * (0.7 + 0.3 * Math.sin((i / 5) * Math.PI))));
    put('spine', 'body', { k: 'ball', c: p, ax: sphere(1.7), skin: STARVED });
  }
  // his shoulders: bony knobs; his collarbones
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    put(`shoulder${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(B.armR[0] * 1.15), skin: STARVED, far: true });
    put('collarbones', 'body', { k: 'rod', a: add(s.neck, mul(cf, 2.2)), b: add(sh, mul(cf, 1.6)), ra: 1.3, rb: 1.5, ramp: STARVED });
  }

  // --- the arms: long and thin, knobbed elbows, great bony hands; iron at each wrist, and from it a chain ---
  const handsAt: Record<'L' | 'R', { wrist: V3; fore: V3 }> = { L: { wrist: s.handL, fore: [0, 0, -1] }, R: { wrist: s.handR, fore: [0, 0, -1] } };
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    const [r0, r1, r2] = B.armR;
    put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 0.74, rb: r1 * 0.56, ramp: STARVED, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 0.74), skin: STARVED, far: true });
    const wrist = add(hand, mul(fore, -1.6));
    put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: wrist, ra: r1 * 0.62, rb: r2 * 0.6, ramp: STARVED, far: true });
    // the iron at his wrist: a thick cuff with a ring on it
    put(`cuff${side}`, `cuff${side}`, { k: 'rod', a: add(wrist, mul(fore, -5.2)), b: add(wrist, mul(fore, -1.6)), ra: r2 * 1.12, rb: r2 * 1.12, ramp: OLD_IRON, far: true });
    // the hand: a great bony palm, long fingers hooked, a thumb
    const palmUp = norm(sub(cf, mul(fore, dot(cf, fore))), cu);
    const across = norm(cross(fore, palmUp), cl);
    const palm = add(hand, mul(fore, 2.6));
    put(`hand${side}`, `hand${side}`, { k: 'ball', c: palm, ax: [mul(fore, 4.4), mul(across, 3.8), mul(palmUp, 2.2)], skin: STARVED, far: true });
    const curl = 0.55 + 0.25 * Math.sin(wave * 3 + (side === 'L' ? 0 : 2)) * (1 - clamp01(q.draw));
    for (let i = 0; i < 4; i++) {
      const k = (i - 1.5) / 1.5;
      const base = add(add(palm, mul(fore, 3.4)), mul(across, k * 2.6));
      const mid0 = add(base, mul(norm(add(fore, mul(palmUp, -curl * 0.6))), 4.6));
      const tip = add(mid0, mul(norm(add(mul(fore, 1 - curl), mul(palmUp, -curl * 1.4))), 3.8));
      put(`hand${side}`, `hand${side}`, { k: 'rod', a: base, b: mid0, ra: 1.3, rb: 1.15, ramp: STARVED, far: true });
      put(`hand${side}`, `hand${side}`, { k: 'ball', c: mid0, ax: sphere(1.25), skin: STARVED, far: true });
      put(`hand${side}`, `hand${side}`, { k: 'rod', a: mid0, b: tip, ra: 1.15, rb: 0.6, ramp: STARVED, far: true });
    }
    const thumbBase = add(add(palm, mul(across, (side === 'L' ? -1 : 1) * -2.6)), mul(fore, -0.6));
    put(`hand${side}`, `hand${side}`, { k: 'rod', a: thumbBase, b: add(add(thumbBase, mul(fore, 3.2)), mul(palmUp, -1.8)), ra: 1.0, rb: 0.7, ramp: STARVED, far: true });
    handsAt[side] = { wrist, fore };
  }

  // --- his neck, his head, his lank hair, the iron collar ---
  put('neck', 'head', { k: 'rod', a: s.neck, b: s.skull, ra: 3.0, rb: 2.7, ramp: STARVED });
  const face = wornOn(st, s, 8);
  const [ff, fl, fu] = face;
  const hc = s.head;
  const hr: V3 = [B.headR[0] * 1.0, B.headR[1] * 0.92, B.headR[2] * 1.05];
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: (u, tone) => (u[0] > 0.55 && u[2] > -0.1 && u[2] < 0.35 && Math.abs(u[1]) > 0.18 && Math.abs(u[1]) < 0.62 ? INK : STARVED[tone]) });
  // his jaw, long, under the cage; dropped open as he roars (`pt`), his mouth dark behind the bars
  const roar = clamp01(q.pt);
  put('head', 'head', { k: 'ball', c: at3o(hc, face, 1.2, 0, -hr[2] * 0.72 - 2.8 * roar), ax: [mul(ff, hr[0] * 0.66), mul(fl, hr[1] * 0.72), mul(fu, 2.6)], skin: STARVED });
  if (roar > 0.2) put('head', 'head', { k: 'ball', c: at3o(hc, face, hr[0] * 0.55, 0, -hr[2] * 0.5 - 1.4 * roar), ax: [mul(ff, 1.2), mul(fl, hr[1] * 0.42), mul(fu, 1.2 + 1.6 * roar)], skin: () => INK });
  // his eyes, burning pink behind the bars
  if (lit > 0.05) {
    const heat = lit * (1 + 0.7 * clamp01(m.glint));
    const eyes = eyesToward(st, s);
    for (const deg of eyes) {
      const a = deg * D;
      const e = add(hc, add(add(mul(ff, Math.cos(a) * hr[0] * 0.92), mul(fl, Math.sin(a) * hr[1] * 0.92)), mul(fu, hr[2] * 0.12)));
      const n = norm(add(mul(ff, Math.cos(a)), mul(fl, Math.sin(a))));
      put('head', 'head', { k: 'dot', p: e, c: heat > 1.25 ? FLAME[4] : SOCKET, facing: n, c2: heat > 1.25 ? FLAME[3] : FLAME[2] });
      if (dot(n, st.eye) > 0.05) put('head', 'head', { k: 'glow', p: e, c: SOCKET, r: 5.5 + 3 * Math.max(0, heat - 1), a: Math.min(0.85, 0.5 * heat) });
    }
  }
  // his hair, lank, hanging from the crown down past his ears and his nape
  for (let i = 0; i < 11; i++) {
    const a = (-160 + (320 * i) / 10) * D;
    const back = Math.abs(a) > 1.2;
    const root = add(hc, add(add(mul(ff, Math.cos(a) * hr[0] * 0.5), mul(fl, Math.sin(a) * hr[1] * 0.9)), mul(fu, hr[2] * 0.8)));
    const hang = back ? 17 : 11;
    const sway = Math.sin(wave + i) * 0.8;
    const tipH = add(add(root, add(mul(ff, -Math.abs(Math.cos(a)) * 2.4 - 1.5 + lag[0] * 0.4), mul(fl, Math.sin(a) * 2.8 + sway))), [0, 0, -hang]);
    put('hair', 'head', { k: 'rod', a: root, b: tipH, ra: 1.5, rb: 0.5, ramp: HAIR });
  }
  // THE IRON CAGE bolted over his face: a band round his brow, a band under his chin, bars across his face between them, a strap over his crown
  {
    const R = 1.22;
    const at = (deg: number, up: number, out = R): V3 => {
      const a = deg * D;
      return add(hc, add(add(mul(ff, Math.cos(a) * hr[0] * out), mul(fl, Math.sin(a) * hr[1] * out)), mul(fu, up)));
    };
    const ring = (up: number, from: number, to: number, out: number, rr: number): void => {
      let last = at(from, up, out);
      for (let d = from + 15; d <= to; d += 15) {
        const p = at(d, up, out);
        put('cage', 'cage', { k: 'rod', a: last, b: p, ra: rr, rb: rr, ramp: OLD_IRON });
        last = p;
      }
    };
    ring(hr[2] * 0.42, -180, 180, 1.12, 0.95);
    ring(-hr[2] * 0.95, -110, 110, 1.05, 0.9);
    for (const d of [-60, -30, 0, 30, 60]) {
      const a = at(d, hr[2] * 0.42, 1.14);
      const b = at(d, -hr[2] * 0.95, 1.08);
      const bow = at(d, -hr[2] * 0.25, 1.3);
      put('cage', 'cage', { k: 'rod', a, b: bow, ra: 0.62, rb: 0.62, ramp: OLD_IRON });
      put('cage', 'cage', { k: 'rod', a: bow, b, ra: 0.62, rb: 0.62, ramp: OLD_IRON });
    }
    // the strap over his crown
    let last = at(0, hr[2] * 0.42, 1.12);
    for (let k = 1; k <= 6; k++) {
      const a = (k / 6) * 180;
      const p = add(hc, add(mul(ff, Math.cos(a * D) * hr[0] * 1.08), mul(fu, hr[2] * 0.42 + Math.sin(a * D) * hr[2] * 0.75)));
      put('cage', 'cage', { k: 'rod', a: last, b: p, ra: 0.85, rb: 0.85, ramp: OLD_IRON });
      last = p;
    }
    // a lock on its side
    put('cage', 'cage', { k: 'ball', c: at(-95, -hr[2] * 0.3, 1.18), ax: sphere(1.6), skin: OLD_IRON });
  }
  // the collar: a heavy band of iron round his neck, a ring at its back for the chain
  const collarC = lerp3(s.neck, s.skull, 0.25);
  put('collar', 'collar', { k: 'rod', a: add(collarC, mul(cu, -1.6)), b: add(collarC, mul(cu, 1.6)), ra: 4.4, rb: 4.2, ramp: OLD_IRON });
  const ringAt = add(collarC, mul(cf, -4.6));
  put('collar', 'collar', { k: 'ball', c: ringAt, ax: [mul(cf, 0.7), mul(cl, 1.8), mul(cu, 1.8)], skin: linkSkin(OLD_IRON) });

  // --- HIS CHAINS: from each wrist to the floor, trailing (the right one's end a hook); from his collar to the iron ball behind him ---
  // (as each move swings them, `m.ropes`; a chain a move has let go of, a hook flung out across the room, is the game's to draw then)
  const ropes = m.ropes;
  for (const side of ['L', 'R'] as const) {
    let path: ReadonlyArray<V3>;
    if (ropes) {
      const r = ropes[side];
      if (!r) continue;
      path = r;
    } else {
      const { wrist, fore } = handsAt[side];
      const from = add(wrist, mul(fore, -2.0));
      const sgn = side === 'L' ? 1 : -1;
      const meet: V3 = [from[0] - 4 + lag[0] * 2, from[1] + sgn * 3, 1.1];
      const sway: V3 = [Math.sin(wave + (side === 'L' ? 0 : 1.7)) * 1.4 + lag[0], Math.cos(wave * 0.7) * 1.2 * sgn, 0];
      path = hangingChain(from, meet, WRIST_CHAIN, [-1, sgn * 0.5, 0], sway, side === 'L' ? 0 : 2);
    }
    chainAlong(put, `chain${side}`, `chain${side}`, path, 1, OLD_IRON);
    if (side === 'R') hookOn(put, `chain${side}`, path);
  }
  {
    let path: V3[];
    let ball: V3 | null;
    if (ropes) {
      const r = ropes.ball;
      ball = r ? r[r.length - 1] : null;
      path = r && ball ? [...r.slice(0, -1), add(ball, mul(norm(sub(r[r.length - 2], ball)), BALL_R - 1.6))] : [];
    } else {
      ball = add(BALL_AT, [lag[0] * 2, lag[1] * 2, 0]);
      const down: V3 = add(ringAt, add(mul(cf, -3), [0, 0, -10]));
      const meet: V3 = [ball[0] + 6, ball[1] + 2, 1.1];
      path = [ringAt, down, ...hangingChain(down, meet, len(sub(down, meet)) + 1, [-1, 0, 0], [0, 0, 0]).slice(1), add(ball, [3, 1, -BALL_R + 3])];
    }
    if (ball) {
      chainAlong(put, 'ballchain', 'ballchain', path, 1.15, OLD_IRON);
      put('ball', 'ball', { k: 'ball', c: ball, ax: sphere(BALL_R), skin: ballSkin });
    }
  }
  // what is left of a chain he has broken off: a stub of two links hanging from the cuff, from the collar's ring
  if (freed >= 1 || ropes?.stubL) chainAlong(put, 'cuffL', 'cuffL', [cuffAt(s, 'L'), add(cuffAt(s, 'L'), [0.6, 0.4, -5.6])], 1, OLD_IRON);
  if (freed >= 2 || ropes?.stubBall) chainAlong(put, 'collar', 'collar', [ringAt, add(ringAt, add(mul(cf, -1.2), [0, 0, -6.2]))], 1.15, OLD_IRON);
  if (ropes) paintThrownOff(put, ropes);
  return bits;
}

/** His iron ball's skin: old iron, a few spots of rust. */
const ballSkin: Skin = (u, tone) => (hash(Math.round(u[0] * 4), Math.round(u[1] * 4 + u[2] * 7), 17) < 0.12 ? RUST[Math.max(1, Math.min(3, tone))] : OLD_IRON[tone]);

/**
 * WHAT HIS MOVES THROW OFF, BIG AND WILD (the art rulebook: as the Wave): sparks off the iron where a
 * chain slams the stone, and dust; a flash where it strikes; a streak of the enemy's fire behind his
 * chains as they whirl; links flying where a chain snaps (`CoChainPlan.extra`).
 */
function paintThrownOff(put: Put, r: Ropes): void {
  (r.sparks ?? []).forEach((p, i) => put('sparks', 'sparks', { k: 'mote', p, c: i % 3 === 0 ? FLAME[4] : i % 3 === 1 ? FLAME[3] : '#ffe9a8', size: i % 4 === 0 ? 2 : 1 }));
  (r.dust ?? []).forEach((p, i) => put('dust', 'dust', { k: 'mote', p, c: i % 2 ? '#4a4266' : '#6a6488', size: 2 }));
  for (const p of r.flash ?? []) put('flash', 'flash', { k: 'glow', p, c: FLAME[3], r: 16, a: 0.55 });
  for (const key of ['trailL', 'trailR']) {
    const t = r[key];
    if (!t) continue;
    // (newest first: bright at the chain's end, fading to the enemy's pink and out)
    for (let i = 1; i < t.length; i++) {
      for (let k = 0; k < 3; k++) {
        const p = lerp3(t[i - 1], t[i], k / 3);
        const c = i < 3 ? FLAME[4] : i < 6 ? FLAME[3] : i < 9 ? FLAME[2] : FLAME[1];
        put('trail', 'trail', { k: 'mote', p, c, size: i < 5 ? 2 : 1 });
      }
    }
    put('trail', 'trail', { k: 'glow', p: t[0], c: FLAME[3], r: 10, a: 0.3 });
  }
  (r.links ?? []).forEach((c, i) => {
    const d = norm([Math.cos(i * 2.1), Math.sin(i * 2.1), 0.4 * Math.sin(i * 1.3)], [1, 0, 0]);
    const across = norm(cross(d, [0, 0, 1]), [0, 1, 0]);
    const thin = norm(cross(d, across), [0, 0, 1]);
    put('links', 'links', { k: 'ball', c, ax: [mul(d, 1.75), mul(across, 1.2), mul(thin, 0.55)], skin: linkSkin(OLD_IRON) });
  });
}

/**
 * SPARKS AND DUST WHERE IRON SLAMS THE STONE, `since` seconds after (the points of a chain lying where it
 * struck): sparks flung up and out from along it, falling and going out; a ring of dust kicked up; a
 * flash the first moment.
 */
function slamBurst(at: ReadonlyArray<V3>, since: number, seed: number, strong = 1): Record<string, V3[]> {
  if (since < 0 || since > 0.6 || at.length === 0) return {};
  const sparks: V3[] = [];
  const dust: V3[] = [];
  const step = Math.max(1, Math.floor(at.length / 6));
  const pick = at.filter((_, i) => i % step === 0).slice(0, 7);
  pick.forEach((p, j) => {
    for (let i = 0; i < 5; i++) {
      const life = (0.22 + 0.25 * hash(i, j, seed)) * strong;
      if (since > life) continue;
      const a = hash(i, j + 3, seed) * Math.PI * 2;
      const sp = (40 + 80 * hash(i, j + 5, seed)) * strong;
      const vz = (70 + 120 * hash(i, j + 7, seed)) * strong;
      const z = Math.max(0.6, p[2] + vz * since - 0.5 * 700 * since * since);
      sparks.push([p[0] + Math.cos(a) * sp * since, p[1] + Math.sin(a) * sp * since, z]);
    }
    for (let i = 0; i < 3; i++) {
      const k = since / 0.6;
      if (hash(i, j + 9, seed) < k * 0.9) continue;
      const a = hash(i, j + 11, seed) * Math.PI * 2;
      const r = 2 + (6 + 8 * hash(i, j + 13, seed)) * Math.sqrt(k);
      dust.push([p[0] + Math.cos(a) * r * 1.3, p[1] + Math.sin(a) * r, 0.6 + (2 + 4 * hash(i, j + 15, seed)) * Math.sin(Math.PI * Math.min(1, k * 1.2))]);
    }
  });
  return { sparks, dust, flash: since < 0.08 ? [pick[Math.floor(pick.length / 2)]] : [] };
}

/** A CHAIN SNAPPING at `at`, `since` seconds after: sparks bursting out every way and falling, a flash, and three links flung off, falling and coming to lie on the floor. */
function snapBurst(at: V3, since: number, seed: number): Record<string, V3[]> {
  if (since < 0) return {};
  const sparks: V3[] = [];
  for (let i = 0; i < 22; i++) {
    const life = 0.3 + 0.35 * hash(i, 1, seed);
    if (since > life) continue;
    const a = hash(i, 2, seed) * Math.PI * 2;
    const up = -0.3 + 1.3 * hash(i, 3, seed);
    const sp = 90 + 160 * hash(i, 4, seed);
    const v: V3 = [Math.cos(a) * Math.cos(up) * sp, Math.sin(a) * Math.cos(up) * sp, Math.sin(up) * sp];
    sparks.push([at[0] + v[0] * since, at[1] + v[1] * since, Math.max(0.6, at[2] + v[2] * since - 0.5 * 700 * since * since)]);
  }
  const out: Record<string, V3[]> = { sparks, flash: since < 0.1 ? [at, at] : [] };
  const links: V3[] = [];
  for (let i = 0; i < 3; i++) {
    const a = hash(i, 1, seed) * Math.PI * 2;
    const sp = 40 + 50 * hash(i, 2, seed);
    const vz = 60 + 60 * hash(i, 3, seed);
    // (falling until it strikes the floor, then lying there)
    const down = (vz + Math.sqrt(vz * vz + 2 * 400 * Math.max(0, at[2] - 1.2))) / 400;
    const tt = Math.min(since, down);
    links.push([at[0] + Math.cos(a) * sp * tt, at[1] + Math.sin(a) * sp * tt, Math.max(1.2, at[2] + vz * tt - 200 * tt * tt)]);
  }
  out.links = links;
  return out;
}

/** THE HOOK at the end of his right chain: a heavy iron hook going on from the chain's last link, its point curled back to one side; kept out of the floor. */
function hookOn(put: Put, part: string, path: ReadonlyArray<V3>): void {
  const end = path[path.length - 1];
  const dir = norm(sub(end, path[path.length - 2]), [-1, 0, 0]);
  const side3 = norm([-dir[1], dir[0], 0], [0, 1, 0]);
  const up = (p: V3): V3 => [p[0], p[1], Math.max(1.0, p[2])];
  const p1 = up(add(end, mul(dir, 5)));
  const p2 = up(add(add(p1, mul(dir, 3)), mul(side3, 3)));
  const p3 = up(add(add(p1, mul(dir, 0.5)), mul(side3, 5.5)));
  put(part, part, { k: 'rod', a: end, b: p1, ra: 1.2, rb: 1.2, ramp: OLD_IRON });
  put(part, part, { k: 'rod', a: p1, b: p2, ra: 1.2, rb: 1.0, ramp: OLD_IRON });
  put(part, part, { k: 'rod', a: p2, b: p3, ra: 1.0, rb: 0.35, ramp: OLD_IRON });
}

/** A point given from another along a frame's forward, left and up. */
function at3o(c: V3, r: readonly [V3, V3, V3], fw: number, lf: number, up: number): V3 {
  return add(c, add(mul(r[0], fw), add(mul(r[1], lf), mul(r[2], up))));
}

/** STANDING, NEVER STILL: he breathes hard, his chest heaving; his head jerks round, looks, jerks back; his hands twitch. Two and a half seconds round. */
function coStand(): Motion {
  const R = CO_REST;
  return {
    loop: 0,
    keys: [
      // (his weight going over onto his left foot and back onto his right as he breathes: `py`, his hips over his feet)
      { at: 0, pose: {} },
      { at: 0.4, pose: { pz: R.pz + 1.0, bend: R.bend - 3, pitch: R.pitch - 1, faceUp: R.faceUp + 2, py: 0.9, roll: -0.8 }, ease: 'io' },
      { at: 0.8, pose: { pz: R.pz - 0.4, bend: R.bend + 1, faceTurn: R.faceTurn + 2, py: 1.5, roll: -1.2 }, ease: 'io' },
      // (a sound: his head jerks round to it)
      { at: 0.9, pose: { pz: R.pz - 0.2, faceTurn: R.faceTurn + 34, faceUp: R.faceUp + 6, faceTilt: R.faceTilt + 8, lhz: R.lhz + 2, draw: 0.6, py: 1.5, roll: -1.2 }, ease: 'out' },
      { at: 1.5, pose: { pz: R.pz + 0.8, bend: R.bend - 2, faceTurn: R.faceTurn + 30, faceUp: R.faceUp + 4, faceTilt: R.faceTilt + 6, draw: 0.4, py: 0.2, roll: -0.2 }, ease: 'lin' },
      { at: 1.62, pose: { pz: R.pz + 0.4, faceTurn: R.faceTurn - 12, faceUp: R.faceUp, faceTilt: R.faceTilt - 4, rhz: R.rhz + 2, py: -0.4, roll: 0.3 }, ease: 'out' },
      { at: 2.1, pose: { pz: R.pz - 0.3, bend: R.bend + 1, faceTurn: R.faceTurn - 8, py: -1.4, roll: 1.1 }, ease: 'io' },
      { at: 2.5, pose: {}, ease: 'io' },
    ],
  };
}

/** A move of his, with his chains worked out through it (`plan`: what it does with them). */
function coMove(name: string, motion: Motion, plan: CoChainPlan = {}, more: Partial<MobMove> = {}, names: ReadonlyArray<CoRope> = CO_ROPES): MobMove {
  return { name, motion, rest: CO_REST, ropes: coChains(motion, CO_REST, plan, names, more.feet), ...more };
}

// ---------------------------------------------------------------------------------------------
// THE CHAINED ONE'S MOVES. By the art rulebook, as the heroes' and the Headsman's: built on the
// bones; weight in every blow; every attack winds up and is held a moment (the warning, his eyes
// flaring in the cage) and follows through; a foot that is down stays where it is; and HIS CHAINS
// SWING AS CHAINS DO, worked out through every move (art/boss_chains.ts): they whip, fly out, drag
// on the floor, and settle. He is starved and wild, never still: he moves in lurches, jerks and
// lunges, and his blows come with all his long reach behind them.

/** His elbows, aimed: each put toward a way (from its shoulder), from wherever the pose puts the hands. */
function coElbows(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...CO_BASE, ...pose } as Posed;
  const le = wantL ? elbowFor(CB2, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(CB2, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}
/** A pose with a hand moved a little (a held pose trembling). */
const coShake = (pose: P, dz: number, more: P = {}): P => ({ ...pose, rhz: (pose.rhz as number) + dz, ...more });

/**
 * HIS LASH, his basic blow: he rears up and back, his right arm raised high behind him, the chain
 * lifted off the floor and hanging from his fist, and holds it there, his eyes flaring (the warning);
 * then he steps in, his hips driving round, and his arm comes over the top and snaps down, elbow
 * first, as a whip is cracked: the chain rolls over after it and slams down on the floor before him at
 * the end of his reach (the game's freeze); he follows through low over his front foot, and drags the
 * chain back to him as he rises.
 */
export const CO_LASH_HIT = 0.86;
/** His fist brought up before his chest, lifting the chain off the floor, on its way up and back over his shoulder. */
const LASH_LIFT: P = coElbows({ pz: -8, px: -1, yaw: -16, pitch: 14, roll: 0, twist: -10, bend: 22, side: -2, faceTurn: 2, faceUp: 16, faceTilt: 0, lfx: 8, lk: 20, rfx: -8, rk: -26, rhIn: 1, rhx: 22, rhy: 4, rhz: -12, lhIn: 1, lhx: 18, lhy: 6, lhz: -50 }, [-0.5, 0.5, -0.6], [-0.2, -0.8, -0.4]);
/** COCKED: his fist up behind his head, his elbow high, the chain hanging from it down his back; turned away to his right and leaning back on his back foot, his eyes on his mark. */
const LASH_UP: P = coElbows({ pz: -6, px: -4, yaw: -30, pitch: 6, roll: 0, twist: -22, bend: 8, side: -8, faceTurn: 0, faceUp: 12, faceTilt: 0, lfx: 10, lk: 18, rfx: -8, rk: -30, rhIn: 1, rhx: -18, rhy: 0, rhz: 24, lhIn: 1, lhx: 24, lhy: 4, lhz: -40 }, [-0.5, 0.5, -0.6], [0.3, -0.7, 0.6]);
const LASH_COCK: P = coElbows({ ...LASH_UP, yaw: -34, twist: -26, side: -10, rhx: -22, rhz: 20 }, [-0.5, 0.5, -0.6], [0.3, -0.7, 0.6]);
/** Over the top: his front foot stepping in, his hips driving round, his elbow leading his fist up over his shoulder. */
const LASH_OVER: P = coElbows({ pz: -7, px: 3, yaw: -8, pitch: 12, roll: 0, twist: -8, bend: 16, side: 0, faceTurn: 0, faceUp: 4, faceTilt: 0, lfx: 22, lfz: 3, lk: 24, rfx: -8, rk: -24, rhIn: 1, rhx: 6, rhy: -4, rhz: 40, lhIn: 1, lhx: 16, lhy: 6, lhz: -46 }, [-0.6, 0.4, -0.6], [0.5, -0.5, 0.6]);
/** SNAPPED: his arm thrown out before him and stopped, at the height of his shoulder, as a whip is cracked; his foot down a stride ahead. */
const LASH_SNAP: P = coElbows({ pz: -13, px: 10, yaw: 10, pitch: 22, roll: 0, twist: 12, bend: 34, side: 0, faceTurn: 0, faceUp: -6, faceTilt: 0, lfx: 24, lfz: 0, lk: 30, rfx: -8, rk: -18, rfp: 16, rhIn: 1, rhx: 42, rhy: -2, rhz: -4, lhIn: 1, lhx: 14, lhy: 4, lhz: -56 }, [-0.8, 0.2, -0.3], [-0.2, -0.8, -0.5]);
/** Following through: low over his front foot, his fist come on down before his left knee. */
const LASH_THROUGH: P = coElbows({ ...LASH_SNAP, pz: -24, px: 14, pitch: 36, bend: 50, yaw: 12, twist: 12, rhx: 44, rhy: -2, rhz: -56 }, [-0.8, 0.2, -0.3], [-0.3, -0.8, -0.4]);
/** Dragging it back: his fist pulled back past his right hip, his elbow bent behind him; his front foot drawn back. */
const LASH_HAUL: P = coElbows({ pz: -11, px: 2, yaw: -10, pitch: 20, roll: 0, twist: -8, bend: 30, side: 0, faceTurn: 4, faceUp: 14, faceTilt: 0, lfx: 12, lk: 22, rfx: -7, rk: -22, rfp: 0, rhIn: 1, rhx: -8, rhy: -8, rhz: -56, lhIn: 1, lhx: 12, lhy: 4, lhz: -54 }, [-0.4, 0.5, -0.7], [-0.8, -0.5, -0.2]);
function coLash(): Motion {
  const H = CO_LASH_HIT;
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      // (his fist brought up before him, lifting the chain off the floor, and on up and back over his shoulder: the chain swings over after it and hangs down his back)
      { at: 0.22, pose: LASH_LIFT, ease: 'io' },
      { at: 0.46, pose: LASH_UP, ease: 'io' },
      { at: 0.56, pose: coShake(LASH_UP, 1.0), ease: 'io' },
      { at: H - 0.2, pose: LASH_COCK, ease: 'io' },
      // (in, over the top and down: the arm snaps, and the chain rolls over after it)
      { at: H - 0.12, pose: LASH_OVER, ease: 'in' },
      { at: H - 0.06, pose: LASH_SNAP, ease: 'lin' },
      { at: H + 0.04, pose: LASH_THROUGH, ease: 'out' },
      { at: H + 0.28, pose: { ...LASH_THROUGH, pz: -25, faceUp: 0 }, ease: 'io' },
      // (and dragged back to him)
      { at: H + 0.58, pose: LASH_HAUL, ease: 'io' },
      { at: H + 0.88, pose: {}, ease: 'io' },
    ],
  };
}
/** HIS FEET THROUGH THE LASH: his left foot strides in as his arm comes over, lifted off the floor and set down before the blow lands, and back after it; his right heel comes up as he drives off that foot, and down again. */
function coLashFeet(): (t: number) => P {
  const H = CO_LASH_HIT;
  const L0 = plantOf(CB2, 'L', {}, CO_REST);
  const R0 = plantOf(CB2, 'R', {}, CO_REST);
  return footwork(CB2, {
    L: { start: L0, moves: [{ t0: H - 0.2, t1: H - 0.06, to: plantBy(L0, 16, 0), lift: 7 }, { t0: H + 0.3, t1: H + 0.62, to: L0, lift: 6 }] },
    R: { start: R0, moves: [{ t0: H - 0.14, t1: H - 0.04, to: { ...R0, pitch: 16 } }, { t0: H + 0.32, t1: H + 0.56, to: R0 }] },
  });
}
/** The glint of his eyes as he holds a blow, and as it comes (0 none to 1). */
function coGlint(from: number, full: number, hit: number): (t: number) => number {
  return (t) => (t < from ? 0 : t < full ? (t - from) / (full - from) : t < hit ? 1 : t < hit + 0.15 ? 1 - (t - hit) / 0.15 : 0);
}

/**
 * HOOK AND DRAG (his pick by 16:44, "Hook and drag (Recommended)"): he straightens, his right fist
 * up over his head, his left arm pointing at whoever he wants; the hook whirls round over his head
 * on its chain, faster and faster (the warning); then his arm whips forward and the hook flies out
 * across the room on its chain (from here until it is hauled back, the hook and its chain are the
 * game's to draw: `coHookOut`); he waits, leaning after it; then he takes the chain in both hands,
 * leans back and hauls it in hand over hand, dragging whatever it caught to him (the rules'); and
 * lets it fall at his feet.
 */
export const CO_HOOK_LET = 1.2;
export const CO_HOOK_BACK = 2.6;
/** His fist raised up over his head, the hook hanging from it on its chain; his left arm out, pointing at whoever he wants. */
const HOOK_UP: P = coElbows({ pz: -5, px: -1, yaw: -10, pitch: 6, roll: 0, twist: -8, bend: 10, side: 0, faceTurn: 0, faceUp: 10, faceTilt: 0, lk: 18, rk: -18, rhIn: 1, rhx: 2, rhy: 6, rhz: 40, lhIn: 1, lhx: 40, lhy: 6, lhz: -8 }, [-0.3, 0.8, -0.5], [0, -0.8, 0.5]);
/** The hook whirled round over his head: his fist going round a wide ring above it, `turn` degrees (0 before him, 90 to his left), `r` its size; the chain flying out round after it. */
function hookWhirl(turn: number, r: number): P {
  const a = turn * D;
  const k = r / 26;
  return coElbows({ ...HOOK_UP, yaw: -10 + 4 * Math.sin(a) * k, side: -3 * Math.sin(a) * k, rhx: 2 + r * Math.cos(a), rhy: 6 + r * Math.sin(a), rhz: 40 }, [-0.3, 0.8, -0.5], [0.2 * Math.cos(a), -0.8, 0.5]);
}
const HOOK_THROW: P = coElbows({ pz: -10, px: 8, yaw: 2, pitch: 20, roll: 0, twist: 4, bend: 26, side: 0, faceTurn: 0, faceUp: 4, faceTilt: 0, lfx: 18, lk: 26, rfx: -8, rk: -20, rfp: 12, rhIn: 1, rhx: 40, rhy: -6, rhz: 14, lhIn: 1, lhx: -20, lhy: 8, lhz: -52 }, [-0.3, 0.3, -0.9], [-0.3, -0.7, -0.6]);
/** Hauling: his hands on the chain before him (`r`, `l`: how far forward of his belly each is, along the chain's way), leaning back (`back`) on braced legs; his elbows back, close to his sides. */
function hookHaul(r: number, l: number, back: number): P {
  return coElbows({ pz: -14, px: 2 - back, yaw: -6, pitch: 10 - back, roll: 0, twist: -6, bend: 16 - back, side: 0, faceTurn: 0, faceUp: 6, faceTilt: 0, lfx: 20, lk: 32, rfx: -8, rk: -26, rfp: 0, rhIn: 1, rhx: 12 + r, rhy: 4, rhz: -45 + r * 0.6, lhIn: 1, lhx: 14 + l, lhy: -4, lhz: -45 + l * 0.6 }, [-0.45, 0.2, -0.87], [-0.45, -0.2, -0.87]);
}
function coHook(): Motion {
  const keys: Key3[] = [
    { at: 0, pose: {} },
    { at: 0.3, pose: HOOK_UP, ease: 'io' },
  ];
  // (round and round over his head, his fist going round a ring that opens from where it was raised, quicker as it goes: let go of as the hook comes round at his right, going forward)
  const STEPS = 28;
  const from = 0.3;
  const to = CO_HOOK_LET - 0.1;
  const W0 = 1.6 * 360;
  const W1 = 2.4 * 360;
  const span = to - from;
  const start = 290 - ((W0 + W1) / 2) * span;
  for (let i = 1; i <= STEPS; i++) {
    const u = (span * i) / STEPS;
    const turned = W0 * u + ((W1 - W0) * u * u) / (2 * span);
    keys.push({ at: from + u, pose: hookWhirl(start + turned, 26 * smooth01(u / 0.22)), ease: 'lin' });
  }
  keys.push(
    // (and flung: his arm whips forward and up, his weight going after it)
    { at: CO_HOOK_LET, pose: HOOK_THROW, ease: 'lin' },
    { at: CO_HOOK_LET + 0.24, pose: { ...HOOK_THROW, rhz: 6, faceUp: -2 }, ease: 'out' },
    // (it bites: his left hand comes forward to the chain beside his right, and he hauls it in, hand over hand)
    { at: 1.62, pose: hookHaul(30, 22, 0), ease: 'in' },
    { at: 1.8, pose: hookHaul(0, 34, 10), ease: 'out' },
    { at: 1.98, pose: hookHaul(32, 4, 5), ease: 'io' },
    { at: 2.16, pose: hookHaul(0, 34, 9), ease: 'io' },
    { at: 2.34, pose: hookHaul(30, 2, 5), ease: 'io' },
    { at: CO_HOOK_BACK - 0.02, pose: hookHaul(0, 6, 10), ease: 'io' },
    // (it falls at his feet; he lets go of it with his left hand, and straightens)
    { at: CO_HOOK_BACK + 0.25, pose: coElbows({ pz: -10, px: 0, pitch: 16, bend: 26, lfx: 12, lk: 24, rhIn: 1, rhx: 12, rhy: -6, rhz: -54, lhIn: 1, lhx: 12, lhy: 6, lhz: -54 }, [-0.5, 0.3, -0.8], [-0.5, -0.3, -0.8]), ease: 'io' },
    { at: CO_HOOK_BACK + 0.55, pose: {}, ease: 'io' },
  );
  return { hit: CO_HOOK_LET, keys };
}
/** HIS FEET THROUGH THE HOOK: his left foot strides in as he flings it, his right heel coming up behind; his right heel down again as he braces to haul; and his left foot back when it is in. */
function coHookFeet(): (t: number) => P {
  const L0 = plantOf(CB2, 'L', {}, CO_REST);
  const R0 = plantOf(CB2, 'R', {}, CO_REST);
  const T = CO_HOOK_LET;
  const K = CO_HOOK_BACK;
  return footwork(CB2, {
    L: { start: L0, moves: [{ t0: T - 0.15, t1: T, to: plantBy(L0, 12, 0), lift: 7 }, { t0: K + 0.06, t1: K + 0.3, to: L0, lift: 6 }] },
    R: { start: R0, moves: [{ t0: T - 0.1, t1: T, to: { ...R0, pitch: 12 } }, { t0: T + 0.25, t1: T + 0.4, to: R0 }] },
  });
}
/** Whether his hook is out across the room `t` seconds into his hook and drag (the game's to draw, with its chain from his right cuff). */
export const coHookOut = (t: number): boolean => t >= CO_HOOK_LET && t < CO_HOOK_BACK;
/** How the hooked chain lies as it comes back to him: down from his cuff to the floor before him, and along the floor ahead, the hook at its end. */
function hookBack(s: Skeleton): V3[] {
  const from = cuffAt(s, 'R');
  const down: V3 = [from[0] + 6, from[1] - 1, 1.1];
  const fall = len(sub(from, down));
  const ahead = Math.max(2, WRIST_CHAIN - fall);
  return [from, down, [down[0] + ahead, down[1] + 1, 1.1]];
}

/**
 * THE CHAIN WHIRL (his pick by 16:44, "Chain whirl (Recommended)"): he crouches, his arms going out
 * to his sides, and winds round to his right, his chains swinging up off the floor, and holds there
 * (the warning: a ring on the floor as far as they reach, the game's); then he spins round to his
 * left three times, his arms out, his chains flying out flat round him at the height of a man's
 * knee and his waist, his feet stepping round under him; he staggers out of it, the chains dropping
 * and slapping the floor round him, and comes back to his stoop.
 */
export const CO_WHIRL_FROM = 0.8;
export const CO_WHIRL_TO = 1.85;
/** How far round to his right he is wound before he spins (the way his hips face; his chest goes further), from straight ahead. */
const WHIRL_W0 = -34;
/** The whirl `turn` degrees round (0: wound to his right), his arms out to his sides. (His feet are his footwork's: `coWhirlFeet`.) */
function whirlAt(turn: number, droop = 0): P {
  const yaw = WHIRL_W0 + turn;
  return {
    px: 0, py: 0, pz: -14, yaw, twist: -8, ...leaning(yaw, 6 + droop, 10 + droop, -8),
    faceTurn: yaw + 14, faceUp: 4 - droop * 0.5, faceTilt: 0,
    lhIn: 0, lhx: 4, lhy: 40, lhz: -12 - droop, le: -30, rhIn: 0, rhx: 4, rhy: -40, rhz: -12 - droop, re: 30,
  };
}
function coWhirl(): Motion {
  const R = CO_REST;
  const A = CO_WHIRL_FROM;
  const B = CO_WHIRL_TO;
  const crouch: P = coElbows({ pz: -14, px: -2, yaw: -20, pitch: 12, twist: -10, bend: 20, faceTurn: 0, faceUp: 12, lk: 26, rk: -26, lhIn: 1, lhx: 6, lhy: 30, lhz: -42, rhIn: 1, rhx: 6, rhy: -30, rhz: -42 }, [0, 0.6, -0.6], [0, -0.6, -0.6]);
  const wound = { ...whirlAt(0), twist: -26, ...leaning(WHIRL_W0, 6, 10, -26) };
  const keys: Key3[] = [
    { at: 0, pose: {} },
    { at: 0.3, pose: crouch, ease: 'io' },
    { at: 0.55, pose: wound, ease: 'io' },
    { at: A - 0.08, pose: { ...wound, pz: -15, twist: -30, ...leaning(WHIRL_W0, 6, 10, -30) }, ease: 'io' },
  ];
  // round he goes, three times, quick from the first quarter
  const STEPS = 24;
  for (let i = 1; i <= STEPS; i++) {
    const k = i / STEPS;
    const turn = 1080 * (k < 0.12 ? (k * k) / 0.24 : k - 0.06);
    keys.push({ at: A + (B - A) * k, pose: whirlAt(Math.min(1080, turn)), ease: 'lin' });
  }
  // (he staggers on round out of it, his arms dropping; and comes back to his stoop, three times round from where he began)
  const round = (pose: P, n: number): P => ({ ...pose, yaw: (pose.yaw ?? R.yaw) + 360 * n, faceTurn: (pose.faceTurn ?? R.faceTurn) + 360 * n });
  keys.push({ at: B + 0.25, pose: { ...whirlAt(1080 + 50, 14), pz: -16, ...leaning(WHIRL_W0 + 1130, 20, 24, -8, 6) }, ease: 'out' });
  keys.push({ at: B + 0.45, pose: round({ pz: -13, px: 2, yaw: R.yaw + 4, pitch: 24, bend: 36, roll: -3, side: -4, faceTurn: R.faceTurn + 16, faceTilt: -10 }, 3), ease: 'io' });
  keys.push({ at: B + 0.75, pose: round({}, 3), ease: 'io' });
  return { hit: (A + B) / 2, keys };
}
/**
 * HIS FEET THROUGH THE WHIRL: down at rest while he crouches and winds up (his hips turned away
 * over them); then, spinning, he steps round on them, one foot down while the other goes round:
 * each foot set down a third of a turn on from where it was, and stood on while he turns two thirds
 * of that over it, then lifted and set down again further round (the right foot first, half as far).
 * Out of it, his right foot comes round last, and he stands as he began, three times round.
 */
function coWhirlFeet(motion: Motion): (t: number) => P {
  const A = CO_WHIRL_FROM;
  const B = CO_WHIRL_TO;
  const R = CO_REST;
  const keys = motion.keys;
  // (how far round he has turned from his wind-up, at a moment; and when he has turned so far)
  const th = (t: number): number => bonesAt(keys, R, t).yaw - WHIRL_W0;
  const when = (deg: number): number => {
    let lo = A;
    let hi = B + 0.25;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (th(mid) < deg) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };
  // (a spot a foot stands on, `deg` round from where it stood at rest: the floor round under him)
  const L0 = plantOf(CB2, 'L', {}, R);
  const R0 = plantOf(CB2, 'R', {}, R);
  const round = (p: Plant, deg: number): Plant => {
    const a = deg * D;
    return { ...p, at: [p.at[0] * Math.cos(a) - p.at[1] * Math.sin(a), p.at[0] * Math.sin(a) + p.at[1] * Math.cos(a)], turn: p.turn + deg };
  };
  // (each spot stood on while he turns over it: centred where his hips face it as they faced it at rest)
  const lag = R.yaw - WHIRL_W0;
  const lMoves: FootMove[] = [];
  for (let k = 0; k < 9; k++) lMoves.push({ t0: when(120 * k + lag + 35), t1: when(120 * (k + 1) + lag - 35), to: round(L0, 120 * (k + 1)), lift: 6 });
  const rMoves: FootMove[] = [{ t0: when(1), t1: when(60 + lag - 35), to: round(R0, 60), lift: 6 }];
  for (let k = 0; k < 8; k++) rMoves.push({ t0: when(60 + 120 * k + lag + 35), t1: when(60 + 120 * (k + 1) + lag - 35), to: round(R0, 60 + 120 * (k + 1)), lift: 6 });
  rMoves.push({ t0: B + 0.02, t1: B + 0.22, to: round(R0, 1080), lift: 6 });
  return footwork(CB2, { L: { start: L0, moves: lMoves, knee: R.lk - R.lft }, R: { start: R0, moves: rMoves, knee: R.rk - R.rft } });
}

/**
 * THE BALL THROW (his pick by 16:44, "Ball throw (Recommended)"): he turns to the iron ball behind
 * him, squats and takes it up in both hands, heaves it up to his chest, turning back, and presses it
 * up over his head, his back arched under it, and holds it there, trembling (the warning: its shadow
 * on the floor where it will fall, the game's); then hurls it forward with both arms, his weight going
 * after it: it flies out across the room on its chain and crashes down (from his hands until it is
 * back at his feet, the ball and its chain are the game's to draw: `coBallOut`). He takes the chain in
 * both hands and hauls the ball back hand over hand, then drags it round behind him, and lets go.
 */
export const CO_BALL_LET = 1.78;
export const CO_BALL_BACK = 3.26;
/** When the ball comes down (the rules' moment of the blow), and when his hauls on its chain begin. */
export const CO_BALL_LAND = 2.22;
const BALL_HAUL = 2.26;
/** Where the ball is in his hands overhead (the figure's own space). */
const BALL_UP: V3 = [-4, 0, 150];
/** The ball's way as he drags it back round behind him: from before him on his left, round his left side wide of his legs, to where it lies. */
const BALL_DRAG: ReadonlyArray<V3> = [[36, 30, BALL_R], [24, 44, BALL_R], [0, 48, BALL_R], [-24, 36, BALL_R], BALL_AT];
/**
 * BOTH HANDS ON THE BALL at `c`, one each side of it along his chest's left, his elbows out and down;
 * `inChest`: held so from his shoulders along his chest, so that it goes where his chest goes (carried
 * as he turns), or else where it is on the floor's own axes.
 */
function onBall(body: P, c: V3, inChest = false, down = 0.6, spread = BALL_R + 1.6): P {
  const s = solve(CB2, { ...CO_REST, ...body } as Posed);
  const [cf, cl, cu] = s.chest;
  const hl = add(c, mul(cl, spread));
  const hr = add(c, mul(cl, -spread));
  // (his elbows out to his sides, and down when it is before his chest; reaching down for it, out and a little up)
  const wantL = add(mul(cl, 0.8), [0, 0, -down]);
  const wantR = add(mul(cl, -0.8), [0, 0, -down]);
  if (!inChest) return coElbows({ ...body, lhIn: 2, lhx: hl[0], lhy: hl[1], lhz: hl[2], rhIn: 2, rhx: hr[0], rhy: hr[1], rhz: hr[2] }, wantL, wantR);
  const rel = (h: V3, sh: V3): V3 => {
    const d = sub(h, sh);
    return [dot(d, cf), dot(d, cl), dot(d, cu)];
  };
  const l = rel(hl, s.shoulderL);
  const r = rel(hr, s.shoulderR);
  return coElbows({ ...body, lhIn: 0, lhx: l[0], lhy: l[1], lhz: l[2], rhIn: 0, rhx: r[0], rhy: r[1], rhz: r[2] }, wantL, wantR);
}
/** Where the ball is held before his chest in a pose: out from his breastbone the way his chest faces, clear of it, `up` higher. */
function ballBefore(body: P, up = 0): V3 {
  const s = solve(CB2, { ...CO_REST, ...body } as Posed);
  const [cf, , cu] = s.chest;
  return add(add(s.ribs, mul(cf, CB2.ribDeep + 1.5 + BALL_R + 4)), mul(cu, CB2.chest * 0.42 + up));
}
/** And before his face, high: clear of the iron on it. */
function ballBeforeFace(body: P): V3 {
  const s = solve(CB2, { ...CO_REST, ...body } as Posed);
  return add(add(s.head, mul(s.face[0], Math.max(...CB2.headR) * 1.22 + BALL_R + 5)), [0, 0, 8]);
}
/** How far round he turns to the ball behind him (degrees, to his left), the spot he turns about (under his hips), and where it lands him: a lurch back over the ball, so that it is between his feet as he squats to it. */
const BALL_TURN = 148;
const BALL_PIVOT: readonly [number, number] = [CO_REST.px, 0];
const BALL_NEAR: readonly [number, number] = ((): [number, number] => {
  const dx = BALL_AT[0] - BALL_PIVOT[0];
  const dy = BALL_AT[1] - BALL_PIVOT[1];
  const k = 24 / Math.hypot(dx, dy);
  return [BALL_PIVOT[0] + dx * k, BALL_PIVOT[1] + dy * k];
})();
/** His body turned so (his hips, his look), and over the spot his turn has brought him to. */
const turnedTo = (pose: P, by: number, at: readonly [number, number] = by >= BALL_TURN ? BALL_NEAR : BALL_PIVOT): P => {
  const yaw = (pose.yaw ?? CO_REST.yaw) + by;
  // (his lean the way he now faces: `pitch` and `bend` as he leans forward, `roll` and `side` to his right)
  return { ...pose, px: at[0], py: at[1], yaw, faceTurn: (pose.faceTurn ?? CO_REST.faceTurn) + by, ...leaning(yaw, pose.pitch ?? CO_REST.pitch, pose.bend ?? CO_REST.bend, pose.twist ?? CO_REST.twist, pose.roll ?? 0) };
};
const halfway: readonly [number, number] = [(BALL_PIVOT[0] + BALL_NEAR[0]) / 2, (BALL_PIVOT[1] + BALL_NEAR[1]) / 2];
const BALL_STOOP_BODY: P = turnedTo({ pz: -42, pitch: 20, bend: 56, twist: 0, roll: 0, side: 0, faceTurn: CO_REST.faceTurn + 6, faceUp: -24, faceTilt: 0 }, BALL_TURN);
/** Coming up with it: the ball before his knees, clear of them, as his hips rise. */
const BALL_RISE_BODY: P = turnedTo({ pz: -30, pitch: 24, bend: 40, twist: 2, roll: 0, side: 0, faceTurn: CO_REST.faceTurn + 4, faceUp: -12, faceTilt: 0 }, BALL_TURN);
function ballLow(body: P): V3 {
  const s = solve(CB2, { ...CO_REST, ...body } as Posed);
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  return [s.pelvis[0] + f[0] * 32, s.pelvis[1] + f[1] * 32, 30];
}
const BALL_STOOP: P = onBall(BALL_STOOP_BODY, BALL_AT, false, 0.35);
const BALL_CHEST_BODY: P = turnedTo({ pz: -16, pitch: 18, bend: 22, twist: 4, roll: 0, side: 0, faceTurn: CO_REST.faceTurn, faceUp: 0, faceTilt: 0 }, BALL_TURN);
const BALL_HOP_BODY: P = turnedTo({ pz: -8, pitch: 12, bend: 16, twist: 2, roll: 0, side: 0, faceTurn: CO_REST.faceTurn - 20, faceUp: 4, faceTilt: 0 }, BALL_TURN / 2, halfway);
const BALL_BACK_BODY: P = { pz: -14, px: CO_REST.px, yaw: -6, pitch: 10, bend: 10, twist: 0, roll: 0, side: 0, faceTurn: 0, faceUp: 6, faceTilt: 0 };
const BALL_FACE_BODY: P = { pz: -10, px: -3, yaw: -4, pitch: 2, bend: -2, twist: 0, roll: 0, side: 0, faceTurn: 0, faceUp: 22, faceTilt: 0 };
const BALL_OVER: P = onBall({ pz: -8, px: -3, yaw: -4, pitch: -6, roll: 0, twist: -2, bend: -12, side: 0, faceTurn: 0, faceUp: 26, faceTilt: 0, lk: 22, rk: -22 }, BALL_UP);
const BALL_HURL: P = onBall({ pz: -14, px: 12, yaw: 4, pitch: 26, roll: 0, twist: 4, bend: 36, side: 0, faceTurn: 0, faceUp: 0, faceTilt: 0, lk: 30, rk: -20 }, [44, 0, 104]);
/** Hauling the ball's chain in: his hands on it before him, as with the hook. */
function ballHaul(r: number, l: number, back: number): P {
  return { ...hookHaul(r, l, back), rhy: 4, lhy: -4 };
}
function coBall(): Motion {
  const L = CO_BALL_LET;
  const K = CO_BALL_BACK;
  const R = CO_REST;
  const held = (body: P, up = 0): P => onBall(body, ballBefore(body, up), true);
  return {
    hit: L,
    keys: [
      { at: 0, pose: {} },
      // (he looks round over his shoulder at it, and crouches)
      { at: 0.12, pose: { pz: -12, pitch: 20, bend: 30, yaw: R.yaw + 6, twist: 10, faceTurn: R.faceTurn + 70, faceUp: 10 }, ease: 'io' },
      // (and wheels round to it with a lurch, both feet off the floor a moment; lands, sinking; stoops and takes it in both hands)
      { at: 0.21, pose: turnedTo({ pz: -5, pitch: 16, bend: 24, twist: 6, faceTurn: R.faceTurn + 40, faceUp: 4 }, BALL_TURN / 2, halfway), ease: 'in' },
      { at: 0.29, pose: turnedTo({ pz: -18, pitch: 22, bend: 36, twist: 4, faceTurn: R.faceTurn + 8, faceUp: -10 }, BALL_TURN), ease: 'lin' },
      { at: 0.5, pose: BALL_STOOP, ease: 'out' },
      { at: 0.6, pose: { ...BALL_STOOP, pz: -43 }, ease: 'io' },
      // (heaved up before his knees and his chest; and he wheels back round with it, and lands)
      { at: 0.73, pose: onBall(BALL_RISE_BODY, ballLow(BALL_RISE_BODY), false, 0.45), ease: 'in' },
      { at: 0.86, pose: held(BALL_CHEST_BODY), ease: 'out' },
      { at: 1.0, pose: held(BALL_HOP_BODY), ease: 'in' },
      { at: 1.08, pose: held(BALL_BACK_BODY), ease: 'out' },
      { at: 1.16, pose: held({ ...BALL_BACK_BODY, pz: -17, pitch: 12 }), ease: 'out' },
      // (pressed up before his face and on up over his head in one heave, his back arched under it)
      { at: 1.3, pose: onBall(BALL_FACE_BODY, ballBeforeFace(BALL_FACE_BODY)), ease: 'in' },
      { at: 1.44, pose: BALL_OVER, ease: 'out' },
      { at: 1.54, pose: coShake(BALL_OVER, -0.8, { lhz: (BALL_OVER.lhz as number) - 0.8 }), ease: 'io' },
      { at: L - 0.12, pose: { ...BALL_OVER, pz: -9, pitch: -9, bend: -16, rhx: (BALL_OVER.rhx as number) - 4, lhx: (BALL_OVER.lhx as number) - 4 }, ease: 'io' },
      // (hurled: his hips go first, then his chest, then his arms bring it over the top)
      { at: L - 0.06, pose: onBall({ pz: -11, px: 4, yaw: -2, pitch: 8, roll: 0, twist: -1, bend: -14, side: 0, faceTurn: 0, faceUp: 18, faceTilt: 0, lk: 26, rk: -21 }, [6, 0, 158]), ease: 'in' },
      { at: L, pose: BALL_HURL, ease: 'in' },
      { at: L + 0.3, pose: coElbows({ ...BALL_HURL, rhIn: 1, rhx: 30, rhy: 4, rhz: -40, lhIn: 1, lhx: 30, lhy: -4, lhz: -40, faceUp: 4 }, [-0.5, 0.4, -0.75], [-0.5, -0.4, -0.75]), ease: 'out' },
      // (it lands; he takes the chain in both hands and hauls it in)
      { at: BALL_HAUL, pose: ballHaul(30, 22, 0), ease: 'in' },
      { at: BALL_HAUL + 0.18, pose: ballHaul(0, 34, 10), ease: 'out' },
      { at: BALL_HAUL + 0.38, pose: ballHaul(32, 4, 5), ease: 'io' },
      { at: BALL_HAUL + 0.56, pose: ballHaul(0, 34, 9), ease: 'io' },
      { at: BALL_HAUL + 0.76, pose: ballHaul(30, 2, 5), ease: 'io' },
      { at: K - 0.02, pose: ballHaul(0, 6, 10), ease: 'io' },
      // (and drags it round behind him, his hands on the chain going round past his left hip, wide of it; he lets go)
      { at: K + 0.3, pose: coElbows({ pz: -12, px: -4, yaw: 30, pitch: 14, twist: 30, bend: 20, faceTurn: 50, faceUp: 4, lk: 26, rk: -26, rhIn: 1, rhx: -6, rhy: 30, rhz: -36, lhIn: 1, lhx: -12, lhy: 14, lhz: -40 }, [-0.5, 0.6, -0.6], [-0.4, -0.3, -0.85]), ease: 'io' },
      { at: K + 0.55, pose: coElbows({ pz: -10, px: -2, yaw: 6, pitch: 18, twist: 4, bend: 28, lk: 22, rk: -22, lhIn: 1, lhx: 10, lhy: 6, lhz: -54, rhIn: 1, rhx: 10, rhy: -6, rhz: -54 }, [-0.5, 0.3, -0.8], [-0.5, -0.3, -0.8]), ease: 'io' },
      { at: K + 0.85, pose: {}, ease: 'io' },
    ],
  };
}
/** HIS FEET THROUGH THE BALL THROW: both off the floor as he wheels round to it, and round under him; both again as he wheels back with it; his left foot striding in as he hurls it, his right heel coming up behind and down again; his left foot back when he has dragged it round. */
function coBallFeet(): (t: number) => P {
  const L = CO_BALL_LET;
  const K = CO_BALL_BACK;
  const L0 = plantOf(CB2, 'L', {}, CO_REST);
  const R0 = plantOf(CB2, 'R', {}, CO_REST);
  // (each foot round the spot under his hips and on with it to where the turn lands him; and back)
  const round = (p: Plant, deg: number): Plant => {
    const a = deg * D;
    const o = BALL_PIVOT;
    const x = p.at[0] - o[0];
    const y = p.at[1] - o[1];
    return { ...p, at: [BALL_NEAR[0] + x * Math.cos(a) - y * Math.sin(a), BALL_NEAR[1] + x * Math.sin(a) + y * Math.cos(a)], turn: p.turn + deg };
  };
  const hop = (p: Plant, high: number): FootMove[] => [
    { t0: 0.13, t1: 0.29, to: round(p, BALL_TURN), lift: high, about: BALL_PIVOT, aboutTo: BALL_NEAR, wide: high > 8 ? 9 : 0 },
    { t0: 0.88, t1: 1.08, to: p, lift: 5, about: BALL_NEAR, aboutTo: BALL_PIVOT },
  ];
  return footwork(CB2, {
    L: { start: L0, moves: [...hop(L0, 12), { t0: L - 0.13, t1: L, to: plantBy(L0, 14, 0), lift: 7 }, { t0: K + 0.5, t1: K + 0.78, to: L0, lift: 6 }], knee: CO_REST.lk - CO_REST.lft },
    R: { start: R0, moves: [...hop(R0, 6), { t0: L - 0.08, t1: L, to: { ...R0, pitch: 14 } }, { t0: L + 0.24, t1: L + 0.4, to: R0 }], knee: CO_REST.rk - CO_REST.rft },
  });
}
/** Whether his ball is out across the room `t` seconds into the ball throw (the game's to draw, with its chain from his collar). */
export const coBallOut = (t: number): boolean => t >= CO_BALL_LET && t < CO_BALL_BACK;
/** Where the ball is `t` seconds into the ball throw while it is his (null: in the game's hands, out across the room; on the floor where it lies, or between his hands, or dragged round behind him). */
function ballAt(s: Skeleton, t: number): V3 | null {
  const L = CO_BALL_LET;
  const K = CO_BALL_BACK;
  if (t < 0.5) return BALL_AT;
  if (t < L) return lerp3(s.handL, s.handR, 0.5);
  if (t < K) return null;
  const k = clamp01((t - K) / 0.55);
  const e = k * k * (3 - 2 * k);
  // (along its way round behind him)
  const f = e * (BALL_DRAG.length - 1);
  const i = Math.min(BALL_DRAG.length - 2, Math.floor(f));
  return lerp3(BALL_DRAG[i], BALL_DRAG[i + 1], f - i);
}

/** HIS WALK: a starved giant's lurching shamble, eight frames at eight a second, painted for 1.1 tiles a second (`CHAINED_PACE`). Each foot comes down flat and heavy and stays where it lands; he lurches onto it, his head nodding and pushed forward; his long arms swing low against his steps; his chains drag and swing, and the ball scrapes along behind him on its chain. */
const CO_WALK_FRAMES = 8;
const CO_WALK_FPS = 8;
/** How far the floor goes by under him in a frame of his walk (the figure's own lengths). */
const CO_STRIDE = (CHAINED_PACE * TILE3) / CO_WALK_FPS;
/** His walk at its frame `j` (0 to 7: his right foot just down before him at 0, his left at 4). */
function coWalkPose(j: number): P {
  const R = CO_REST;
  const n = CO_WALK_FRAMES;
  const d = CO_STRIDE;
  const SW = [0.22, 0.6, 0.9];
  // (the foot that swings goes up off its toes, through, and comes down heel first: high enough that its toes clear the floor)
  const SZ = [5, 6, 3.5];
  const SP = [14, 4, -8];
  const foot = (k: number): [number, number, number] => (k <= 4 ? [2 * d - d * k, 0, 0] : [-2 * d + 4 * d * SW[k - 5], SZ[k - 5], SP[k - 5]]);
  const a = (j / n) * Math.PI * 2;
  const [rx, rz, rp] = foot(j);
  const [lx, lz, lp] = foot((j + n / 2) % n);
  return {
    px: R.px + 1, py: -2.2 * Math.sin(a), pz: R.pz - 1.0 - 1.8 * Math.cos(2 * a),
    yaw: R.yaw + 6 * Math.cos(a), twist: R.twist - 9 * Math.cos(a), pitch: R.pitch + 2 + 2.4 * Math.cos(2 * a), bend: R.bend + 2 * Math.cos(2 * a),
    roll: 4 * Math.sin(a), side: 2 * Math.sin(a),
    faceUp: R.faceUp - 4 * Math.cos(2 * a), faceTurn: R.faceTurn - 4 * Math.cos(a), faceTilt: R.faceTilt - 3 * Math.sin(a),
    rfx: rx, rfz: rz, rfy: R.rfy, rft: R.rft, rk: -20, rfp: rp,
    lfx: lx, lfz: lz, lfy: R.lfy, lft: R.lft, lk: 20, lfp: lp,
    // (his long arms swing low against his steps)
    lhx: R.lhx + 11 * Math.cos(a), lhz: R.lhz + 2 * Math.abs(Math.cos(a)), rhx: R.rhx - 11 * Math.cos(a), rhz: R.rhz + 2 * Math.abs(Math.cos(a)),
  };
}
function coWalk(): Motion {
  const keys: Key3[] = [];
  for (let i = 0; i <= CO_WALK_FRAMES; i++) keys.push({ at: i / CO_WALK_FPS, ease: 'lin', pose: coWalkPose(i % CO_WALK_FRAMES) });
  return { keys, loop: 0 };
}
/** How fast the game carries him walking (the figure's own lengths a second). */
const CO_GROUND = CHAINED_PACE * TILE3;
/**
 * SETTING OFF AND STOPPING (the art rulebook, Movement 5: nothing jumps where one move hands over to
 * the next; as the heroes' steps into and out of their runs). Setting off, the game carries him on at
 * his pace from its first moment: his right foot is lifted and set down a stride ahead, his left stays
 * where it stood until he has gone over it, and he is in the first frame of his walk. Stopping, from the
 * first frame of his walk (the game lets his walk come round to it), still carried: his left foot comes
 * through and is set down beside his right, and he is back in his stoop where the game stops him.
 */
const CO_SET_OFF = (plantOf(CB2, 'L', {}, CO_REST).at[0] - plantOf(CB2, 'L', coWalkPose(0), CO_REST).at[0]) / CO_GROUND;
const CO_HALT = (plantOf(CB2, 'R', coWalkPose(0), CO_REST).at[0] - plantOf(CB2, 'R', {}, CO_REST).at[0]) / CO_GROUND;
function coSetOff(): Motion {
  const w0 = coWalkPose(0);
  const T = CO_SET_OFF;
  return { keys: [{ at: 0, pose: {} }, { at: T * 0.5, pose: { ...between(CO_REST, w0, 0.5), pitch: (CO_REST.pitch + (w0.pitch as number)) / 2 + 4, pz: (CO_REST.pz + (w0.pz as number)) / 2 - 1.5 }, ease: 'io' }, { at: T, pose: w0, ease: 'io' }] };
}
function coSetOffFeet(): (t: number) => P {
  const T = CO_SET_OFF;
  const R1 = plantOf(CB2, 'R', coWalkPose(0), CO_REST);
  return footwork(CB2, {
    L: { start: plantOf(CB2, 'L', {}, CO_REST), moves: [] },
    R: { start: plantOf(CB2, 'R', {}, CO_REST), moves: [{ t0: 0.03, t1: T - 0.02, to: plantBy(R1, CO_GROUND * T, 0), lift: 6 }] },
  }, CO_GROUND);
}
function coHalt(): Motion {
  const w0 = coWalkPose(0);
  const T = CO_HALT;
  return { keys: [{ at: 0, pose: w0 }, { at: T * 0.55, pose: { ...between(w0, CO_REST, 0.55), pz: (CO_REST.pz + (w0.pz as number)) / 2 - 1.2 }, ease: 'io' }, { at: T, pose: {}, ease: 'io' }] };
}
function coHaltFeet(): (t: number) => P {
  const T = CO_HALT;
  const L0 = plantOf(CB2, 'L', {}, CO_REST);
  return footwork(CB2, {
    L: { start: plantOf(CB2, 'L', coWalkPose(0), CO_REST), moves: [{ t0: 0.03, t1: T - 0.03, to: plantBy(L0, CO_GROUND * T, 0), lift: 6 }] },
    R: { start: plantOf(CB2, 'R', coWalkPose(0), CO_REST), moves: [] },
  }, CO_GROUND);
}
/** A pose part way from one to another (every number mixed; which hand holds what, the nearer's). */
function between(a: P, b: P, k: number, rest: Bones = CO_REST): P {
  const out: Record<string, unknown> = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const va = (a as Record<string, unknown>)[key] ?? (rest as unknown as Record<string, unknown>)[key];
    const vb = (b as Record<string, unknown>)[key] ?? (rest as unknown as Record<string, unknown>)[key];
    out[key] = typeof va === 'number' && typeof vb === 'number' && !key.endsWith('In') ? va + (vb - va) * k : k < 0.5 ? va : vb;
  }
  return out as P;
}

/** STRUCK: he jerks back from it, his head snapping up in the cage, his arms flung, his chains rattling; and hunches again. */
function coStruck(): Motion {
  const R = CO_REST;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: R.px - 3, pz: R.pz + 1.5, pitch: R.pitch - 8, bend: R.bend - 10, faceUp: R.faceUp + 16, faceTilt: R.faceTilt + 8, lhx: R.lhx - 6, lhz: R.lhz + 6, rhx: R.rhx - 6, rhz: R.rhz + 6 }, ease: 'out' },
      { at: 0.16, pose: { px: R.px - 1.5, pz: R.pz + 0.6, pitch: R.pitch - 3, bend: R.bend - 4, faceUp: R.faceUp + 6, lhx: R.lhx - 2, rhx: R.rhx - 2 }, ease: 'io' },
      { at: 0.3, pose: {}, ease: 'io' },
    ],
  };
}

/**
 * HIS CHAINS DRAG HIM DOWN (his pick by 16:44, "His chains drag him down (Recommended)"): struck, he
 * rears back and roars through the iron; but his chains have grown too heavy to lift, and they hold:
 * where their ends lie on the floor by his feet they stay, and they drag his arms down after them,
 * and him after his arms: bent double, onto his knees, his arms dragged down behind him so that he
 * cannot catch himself; and he falls on his face, and the fire in his cage goes out.
 */
export const CO_DIE_TIME = 2.6;
/** Where the ends of his wrist chains lie when he has stood a while: where they hold as he dies. */
function chainEnds(): Record<'L' | 'R', V3> {
  const st = settledChains();
  return { L: st.L[st.L.length - 1], R: st.R[st.R.length - 1] };
}
/** His hands on the floor by the ends of their chains (a little toward him, `fwd`), elbows bent down and back. */
function draggedHands(body: P, fwd: number, up: number): P {
  const e = chainEnds();
  return coElbows({ ...body, lhIn: 2, lhx: e.L[0] + fwd, lhy: e.L[1] - 1, lhz: up, rhIn: 2, rhx: e.R[0] + fwd, rhy: e.R[1] + 1, rhz: up }, [-0.4, 0.5, 0.75], [-0.4, -0.5, 0.75]);
}
/** When the ends of his chains let go of the floor, his knees down (dragged after him from then). */
const CO_ENDS_GO = 1.14;
/** Where his feet stand as he dies: his right where it stood, his left stepped back level with it as he rears from the blow. */
const CO_DIE_FEET = ((): Record<'L' | 'R', Plant> => {
  const L0 = plantOf(CB2, 'L', {}, CO_REST);
  const R0 = plantOf(CB2, 'R', {}, CO_REST);
  return { L: plantBy(L0, R0.at[0] - L0.at[0], 0), R: R0 };
})();
/** How far his feet come up onto their toes as he goes down on his knees (degrees), and how high a knee is on the floor (its own size). */
const CO_TUCK = 58;
const CO_KNEE_DOWN = CB2.legR[1] * 0.82;
/**
 * HIM ON HIS KNEES, OR GOING OVER FROM THEM: his feet up on their toes where they stood; his knees on the
 * floor a shin's length before them; his hips over his knees, leaning `lean` degrees forward of upright
 * (0, kneeling up; near 90, lying on his face). The bones' fields for his hips and his legs.
 */
function onKnees(lean: number): P {
  return kneelHips(CB2, CO_REST, CO_DIE_FEET, CO_TUCK, CO_KNEE_DOWN, lean);
}
/** His hands along his sides as he goes over onto his face, dragged back by his chains: beside his hips, a little off the floor, his elbows out to his sides. */
function handsBack(body: P, up: number): P {
  const s = solve(CB2, { ...CO_REST, ...body } as Posed);
  const l = norm([s.hips[1][0], s.hips[1][1], 0], [0, 1, 0]);
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const at = (sgn: number): V3 => add(add(s.pelvis, add(mul(l, sgn * (CB2.hipHalf + 14)), mul(f, -4))), [0, 0, up - s.pelvis[2]]);
  const hl = at(1);
  const hr = at(-1);
  return coElbows({ ...body, lhIn: 2, lhx: hl[0], lhy: hl[1], lhz: hl[2], rhIn: 2, rhx: hr[0], rhy: hr[1], rhz: hr[2] }, add(l, [0, 0, 0.2]), add(mul(l, -1), [0, 0, 0.2]));
}
/** A pose on its knees let down (or held up) until its lower knee rests on the floor, its feet as they are then (up on their toes). */
function kneeling(pose: P): P {
  return kneelSettle(CB2, CO_REST, pose, CO_DIE_FEET, CO_TUCK, CO_KNEE_DOWN);
}
function coDying(): Motion {
  const R = CO_REST;
  const reared: P = coElbows({ px: R.px - 4, pz: R.pz + 2, pitch: 4, bend: 10, faceUp: 44, faceTilt: 10, lhIn: 1, lhx: -4, lhy: 10, lhz: -50, rhIn: 1, rhx: -4, rhy: -10, rhz: -50 }, [-0.6, 0.6, -0.5], [-0.6, -0.6, -0.5]);
  const dragged: P = draggedHands({ pz: -24, px: 2, pitch: 36, bend: 44, faceUp: 6, faceTilt: 4, lk: 34, rk: -34 }, 8, 14);
  const knees: P = draggedHands(kneeling({ ...onKnees(8), pitch: 42, bend: 34, faceUp: 0, faceTilt: 6 }), 6, 9);
  const tipping: P = handsBack(kneeling({ ...onKnees(46), pitch: 66, bend: 22, faceUp: -12, faceTilt: 10 }), 16);
  const proneBody: P = kneeling({ ...onKnees(78), yaw: CO_REST.yaw, pitch: 86, roll: 0, twist: 4, bend: 6, side: 0, faceTurn: 14, faceUp: -40, faceTilt: 16 });
  const prone: P = { ...handsBack(proneBody, 5), out: 1 };
  const going: P = handsBack(kneeling({ ...onKnees(26), pitch: 54, bend: 28, faceUp: -6, faceTilt: 8 }), 20);
  const falling: P = handsBack(kneeling({ ...onKnees(62), yaw: CO_REST.yaw, pitch: 76, roll: 0, twist: 2, bend: 14, side: 0, faceTurn: 10, faceUp: -26, faceTilt: 12 }), 10);
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.14, pose: reared, ease: 'out' },
      { at: 0.3, pose: { ...reared, faceUp: 40 }, ease: 'io' },
      // (his arms dragged down by his chains, and he after them, bent double, onto his knees)
      { at: 0.62, pose: dragged, ease: 'in' },
      { at: 0.76, pose: { ...dragged, pz: -26 }, ease: 'out' },
      { at: 1.1, pose: knees, ease: 'in' },
      { at: 1.22, pose: { ...knees, pz: (knees.pz as number) + 1.2, out: 0.2 }, ease: 'out' },
      // (and over onto his face from his knees, his arms dragged back along his sides so that he cannot catch himself)
      { at: 1.48, pose: { ...going, out: 0.36 }, ease: 'in' },
      { at: 1.62, pose: { ...tipping, out: 0.45 }, ease: 'lin' },
      { at: 1.69, pose: { ...falling, out: 0.52 }, ease: 'lin' },
      { at: 1.76, pose: { ...prone, out: 0.6 }, ease: 'lin' },
      { at: 1.88, pose: { ...prone, pz: (prone.pz as number) + 1.5, pitch: 84, out: 0.65 }, ease: 'out' },
      { at: CO_DIE_TIME, pose: prone, ease: 'io' },
    ],
  };
}
/** HIS FEET AS HE DIES: his left stepped back level with his right as he rears from the blow; both coming up onto their toes as his knees go down to the floor before them. */
function coDyingFeet(): (t: number) => P {
  const L0 = plantOf(CB2, 'L', {}, CO_REST);
  const F = CO_DIE_FEET;
  return footwork(CB2, {
    L: { start: L0, moves: [{ t0: 0.06, t1: 0.3, to: F.L, lift: 6 }, { t0: 0.78, t1: 1.08, to: { ...F.L, pitch: CO_TUCK } }] },
    R: { start: F.R, moves: [{ t0: 0.78, t1: 1.08, to: { ...F.R, pitch: CO_TUCK } }] },
  });
}

/**
 * HIS CHAINS BREAK, ONE AT A TIME (his pick by 23:08, "One at a time (Recommended)", offered as: "First
 * he stamps on his left chain and rips his arm free; later he tears the ball's chain off his collar.
 * Each time a roar, sparks and links flying, and he's quicker after.").
 *
 * THE FIRST (`breakL`): he looks down at the chain on his left wrist, lifts his foot and stamps on it,
 * and wrenches his arm up against it, straining, roaring through the iron; it snaps at the cuff, sparks
 * bursting and links flying; his arm flies up free and he roars, arms wide; and hunches again, wilder.
 * The broken chain lies where it fell (the game's to leave there: `makeLeftBehindArt`).
 */
export const CO_SNAP_L = 0.8;
export const CO_BREAK_TIME = 2.3;
const BL_LOOK: P = coElbows({ pz: -11, px: 2, yaw: 8, pitch: 24, twist: 6, bend: 36, faceTurn: 24, faceUp: -18, lhIn: 1, lhx: 16, lhy: 10, lhz: -56 }, [-0.4, 0.6, -0.7], null);
const BL_STAMP: P = { ...BL_LOOK, pz: -14, pitch: 28 };
/** STRAINING: his left arm wrenched up against the chain under his foot (`up`), leaning back from it (`lean`), roaring (`roar`); his right arm hanging heavy, its fist clenched. */
function strainL(up: number, lean: number, roar: number): P {
  return coElbows({ pz: -12, px: -2, yaw: 10, pitch: 18 - lean, roll: 0, twist: 14, bend: 28 - lean * 1.6, side: 4, faceTurn: 10, faceUp: 10 + roar * 26, faceTilt: 6, pt: roar, lk: 32, rk: -28, lhIn: 1, lhx: 6 - up * 0.3, lhy: 12, lhz: -46 + up, rhIn: 1, rhx: 16, rhy: -10, rhz: -52 }, [-0.6, 0.6, -0.4], [-0.6, -0.25, -0.75]);
}
/** HIS ROAR, FREED: his head thrown back, his chest out; his freed fist raised high (`freedUp`: his left arm, or neither) and his other arms out low and wide, fists clenched, their chains hanging. */
function coRoar(leftUp: boolean): P {
  return coElbows({ pz: -6, px: -2, yaw: 0, pitch: -4, roll: 0, twist: 0, bend: -8, side: 0, faceTurn: 0, faceUp: 44, faceTilt: 0, pt: 1, lk: 20, rk: -20,
    lhIn: 1, lhx: leftUp ? 8 : 12, lhy: leftUp ? 14 : 20, lhz: leftUp ? 36 : -48,
    rhIn: 1, rhx: 12, rhy: -20, rhz: -48 }, leftUp ? [0, 0.8, -0.5] : [-0.3, 0.8, -0.5], [-0.3, -0.8, -0.5]);
}
function coBreakL(): Motion {
  const S = CO_SNAP_L;
  const T = CO_BREAK_TIME;
  const roar = coRoar(true);
  return {
    hit: S,
    keys: [
      { at: 0, pose: {} },
      { at: 0.28, pose: BL_LOOK, ease: 'io' },
      // (his foot up, and stamped down on the chain)
      { at: 0.38, pose: { ...BL_LOOK, pz: -9 }, ease: 'out' },
      { at: 0.44, pose: BL_STAMP, ease: 'in' },
      // (his arm wrenched up against it, straining, roaring)
      { at: 0.6, pose: strainL(16, 6, 0.4), ease: 'io' },
      { at: 0.68, pose: strainL(21, 9, 0.6), ease: 'io' },
      { at: S - 0.02, pose: strainL(24, 11, 0.8), ease: 'io' },
      // (it snaps: his arm flies up free, and he rears up roaring, his fist high)
      { at: S + 0.1, pose: coElbows({ ...strainL(24, 14, 1), lhx: 8, lhy: 16, lhz: 34, faceUp: 40 }, [0, 0.8, -0.5], null), ease: 'out' },
      { at: 1.2, pose: roar, ease: 'io' },
      { at: 1.5, pose: { ...roar, lhz: 32, faceUp: 40, pz: -7 }, ease: 'io' },
      // (and hunches again, slowly, his foot coming off the chain)
      { at: 1.82, pose: coElbows({ pz: -10, pitch: 22, bend: 34, pt: 0.3, faceUp: 20, rhIn: 1, rhx: 14, rhy: -12, rhz: -52 }, null, [-0.5, -0.4, -0.75]), ease: 'io' },
      { at: T, pose: {}, ease: 'io' },
    ],
  };
}
/** Where his left foot holds the chain down: under the ball of his foot, on the floor. */
const underFootL = (s: Skeleton): V3 => {
  const p = lerp3(s.heelL, s.toeL, 0.62);
  return [p[0], p[1], 1.2];
};
/** When his foot comes off the broken chain, and when it is back where he stood. */
const BL_FOOT_UP = 1.66;
/** HIS FEET AS HIS LEFT CHAIN BREAKS: his left foot lifted and stamped down a stride on, on the chain, and held there till it has broken and he has roared; then stepped back where it stood. His right stays where it is. */
function coBreakLFeet(): (t: number) => P {
  const L0 = plantOf(CB2, 'L', {}, CO_REST);
  return footwork(CB2, { L: { start: L0, moves: [{ t0: 0.3, t1: 0.44, to: plantBy(L0, 10, 0), lift: 8 }, { t0: BL_FOOT_UP, t1: 1.92, to: L0, lift: 6 }] } });
}

/**
 * THE SECOND (`breakBall`): he looks back over his shoulder at the ball, snarling, takes hold of his
 * collar in both fists, and strides away from it, his front foot driving him on, until the chain stands
 * taut from his collar to the ball, straining, roaring; it tears from the ring at the back of his
 * collar, sparks bursting, and he lurches forward over his front foot, free; he roars, arms wide and
 * low, and draws his foot back. The ball and its chain lie where they were (the game's to leave there).
 */
export const CO_SNAP_BALL = 0.8;
function coBreakBall(): Motion {
  const S = CO_SNAP_BALL;
  const T = CO_BREAK_TIME;
  const look: P = coElbows({ pz: -10, px: -1, yaw: 10, pitch: 18, twist: 20, bend: 28, faceTurn: 110, faceUp: 4, faceTilt: 10, pt: 0.3 }, null, null);
  const grip: P = coElbows({ pz: -13, px: 0, yaw: -4, pitch: 24, twist: -2, bend: 34, faceTurn: 6, faceUp: 6, lhIn: 0, lhx: 8, lhy: -12, lhz: 8, rhIn: 0, rhx: 8, rhy: 12, rhz: 8, lk: 24 }, [-0.2, 0.9, -0.4], [-0.2, -0.9, -0.4]);
  const lunge = (k: number, roar: number): P => coElbows({ ...grip, pz: -14 - 3 * k, px: 4 + 14 * k, pitch: 26 + 10 * k, bend: 36 + 4 * k, faceUp: 6 + 20 * roar, pt: roar, lk: 30, rk: -24 }, [-0.2, 0.9, -0.4], [-0.2, -0.9, -0.4]);
  const roar = { ...coRoar(false), px: 10 };
  return {
    hit: S,
    keys: [
      { at: 0, pose: {} },
      { at: 0.28, pose: look, ease: 'io' },
      { at: 0.46, pose: grip, ease: 'io' },
      // (striding away from it until the chain stands taut, straining, roaring)
      { at: 0.6, pose: lunge(0.6, 0.5), ease: 'io' },
      { at: 0.7, pose: lunge(0.85, 0.7), ease: 'io' },
      { at: S - 0.02, pose: lunge(1, 0.9), ease: 'io' },
      // (it tears from his collar: he lurches forward over his front foot, free)
      { at: S + 0.14, pose: coElbows({ ...lunge(1, 1), px: 22, pz: -18, pitch: 40, lhIn: 1, lhx: 26, lhy: 14, lhz: -40, rhIn: 1, rhx: 26, rhy: -14, rhz: -40 }, [-0.4, 0.6, -0.7], [-0.4, -0.6, -0.7]), ease: 'out' },
      { at: 1.2, pose: roar, ease: 'io' },
      { at: 1.5, pose: { ...roar, faceUp: 40, pz: -7 }, ease: 'io' },
      { at: 1.82, pose: coElbows({ pz: -10, px: 6, pitch: 22, bend: 34, pt: 0.3, faceUp: 20, rhIn: 1, rhx: 14, rhy: -12, rhz: -52 }, null, [-0.5, -0.4, -0.75]), ease: 'io' },
      { at: T, pose: {}, ease: 'io' },
    ],
  };
}
/** HIS FEET AS THE BALL'S CHAIN BREAKS: his left foot striding away from the ball, his right heel coming up as he drives off it; down again as he lurches free; his left foot drawn back where it stood. */
function coBreakBallFeet(): (t: number) => P {
  const L0 = plantOf(CB2, 'L', {}, CO_REST);
  const R0 = plantOf(CB2, 'R', {}, CO_REST);
  return footwork(CB2, {
    L: { start: L0, moves: [{ t0: 0.47, t1: 0.6, to: plantBy(L0, 16, 0), lift: 7 }, { t0: 1.62, t1: 1.9, to: L0, lift: 6 }] },
    R: { start: R0, moves: [{ t0: 0.6, t1: 0.76, to: { ...R0, pitch: 16 } }, { t0: 0.9, t1: 1.08, to: R0 }] },
  });
}

/** The chain whirl's bones (the ball's way round after him is worked out from them). */
const CO_WHIRL: Motion = coWhirl();

/** THE CHAINED ONE, as free as he is (`CoFreed`): his moves, with the chains he still has worked out through each. */
function chainedMob(freed: CoFreed): Mob {
  const names = ropesOf(freed);
  // (every move takes his chains up as his stand leaves them, and leaves them so for it: so nothing leaps between moves)
  const standAt0 = (): Ropes => stand.ropes!(0);
  const walkAt0 = (): Ropes => walk.ropes!(0);
  const mvIn = (name: string, motion: Motion, plan: CoChainPlan = {}, more: Partial<MobMove> = {}): MobMove => coMove(name, motion, plan, more, names);
  const mv = (name: string, motion: Motion, plan: CoChainPlan = {}, more: Partial<MobMove> = {}): MobMove => mvIn(name, motion, { start: standAt0, end: standAt0, ...plan }, more);
  const stand = mvIn('The Chained One breathes', coStand());
  const walk = mvIn('The Chained One shambles', coWalk(), { ground: CHAINED_PACE * TILE3 }, { period: CO_WALK_FRAMES / CO_WALK_FPS, ground: CHAINED_PACE * TILE3 });
  const more: Record<string, MobMove> = {
    setOff: mv('The Chained One sets off', coSetOff(), { ground: CO_GROUND, end: walkAt0 }, { ground: CO_GROUND, feet: coSetOffFeet() }),
    halt: mv('The Chained One stops', coHalt(), { ground: CO_GROUND, start: walkAt0 }, { ground: CO_GROUND, feet: coHaltFeet() }),
    hook: mv('Hook and drag', coHook(), { hold: (name, _s, t) => (name === 'R' && coHookOut(t) ? 'out' : undefined), back: (name, s1) => (name === 'R' ? hookBack(s1) : restChains(s1)[name]) }, { glint: coGlint(0.3, CO_HOOK_LET - 0.2, CO_HOOK_LET), feet: coHookFeet() }),
    whirl: mv('The chain whirl', CO_WHIRL, {
      hold: (name, s, t) => {
        if (name !== 'ball') return undefined;
        // (the ball dragged round after him on the floor as he spins, a little behind his turning)
        const turned = bonesAt(CO_WHIRL.keys, CO_REST, Math.max(0, t - 0.18)).yaw - CO_REST.yaw;
        return { from: collarRingAt(s), held: [[CO_SPEC.ball.n, [...about([BALL_AT[0], BALL_AT[1], 0], [0, 0, 1], turned).slice(0, 2), BALL_R] as unknown as V3]] };
      },
      // (a streak of fire behind the ends of his chains as they whirl round)
      extra: (t, look) => {
        if (t < CO_WHIRL_FROM + 0.05 || t > CO_WHIRL_TO + 0.12) return {};
        const out: Record<string, V3[]> = {};
        for (const side of ['L', 'R'] as const) {
          const pts: V3[] = [];
          for (let k = 0; k < 12; k++) {
            const r = look(side, t - k * 0.012);
            if (r) pts.push(r[r.length - 1]);
          }
          if (pts.length > 1) out[`trail${side}`] = pts;
        }
        return out;
      },
    }, { glint: coGlint(0.3, 0.7, CO_WHIRL_FROM), feet: coWhirlFeet(CO_WHIRL) }),
  };
  if (freed < 2) {
    more.ball = mv('The ball throw', coBall(), { hold: (name, s, t) => {
      if (name !== 'ball') return undefined;
      if (coBallOut(t)) return 'out';
      const b = ballAt(s, t);
      // (while he hauls it in and drags it round, his hands are on its chain)
      const haul = t >= CO_BALL_BACK - 0.02 && t < CO_BALL_BACK + 0.32;
      const held: (readonly [number, V3])[] = [[CO_SPEC.ball.n, b ?? BALL_AT]];
      if (haul) held.push([14, lerp3(s.handL, s.handR, 0.5)]);
      return { from: collarRingAt(s), held };
    }, back: (name, s1) => (name === 'ball' ? [collarRingAt(s1), lerp3(s1.handL, s1.handR, 0.5), BALL_DRAG[0]] : restChains(s1)[name]), air: 0.997 }, { glint: coGlint(1.0, 1.4, CO_BALL_LET), feet: coBallFeet() });
  }
  if (freed === 0) {
    more.breakL = mv('His left chain ripped off', coBreakL(), {
      hold: (name, s, t) => {
        if (name !== 'L' || t < 0.44) return undefined;
        // (his foot on it; it snaps at the cuff; it lies where it fell, under his foot till he lifts it)
        if (t < CO_SNAP_L) return { from: cuffAt(s, 'L'), held: [[18, underFootL(s)]] };
        if (t < BL_FOOT_UP) return { from: null, held: [[18, underFootL(s)]] };
        return { from: null, held: [] };
      },
      // (the foot that stands on it lets it be: lifted off it, it does not fling it)
      bare: (name, t) => (name === 'L' && t >= 0.4 ? ['footL', 'shinL'] : []),
      airAt: (t) => (t > 1.85 ? 0.993 : undefined),
      end: () => CHAINED_FREED[1].stand.ropes!(0),
      extra: (t, look) => {
        if (t < CO_SNAP_L) return {};
        const r = look('L', CO_SNAP_L - SIM_KEEP);
        return { ...(r ? snapBurst(r[0], t - CO_SNAP_L, 71) : {}), stubL: [] };
      },
    }, { glint: coGlint(0.5, 0.75, 1.2), feet: coBreakLFeet() });
  }
  if (freed === 1) {
    more.breakBall = mv('The ball’s chain torn from his collar', coBreakBall(), {
      hold: (name, s, t) => {
        // (the ball holds where it lies; the chain from his collar stands taut to it; it tears from the ring, and lies where it falls)
        if (name !== 'ball' || t < CO_SNAP_BALL) return undefined;
        return { from: null, held: [[CO_SPEC.ball.n, BALL_AT]] };
      },
      airAt: (t) => (t > 1.85 ? 0.993 : undefined),
      end: () => CHAINED_FREED[2].stand.ropes!(0),
      extra: (t, look) => {
        if (t < CO_SNAP_BALL) return {};
        const r = look('ball', CO_SNAP_BALL - SIM_KEEP);
        return { ...(r ? snapBurst(r[0], t - CO_SNAP_BALL, 73) : {}), stubBall: [] };
      },
    }, { glint: coGlint(0.5, 0.75, 1.2), feet: coBreakBallFeet() });
  }
  return {
    id: freed === 0 ? 'chained' : `chained${freed}`,
    name: freed === 0 ? 'The Chained One' : freed === 1 ? 'The Chained One, his left chain off' : 'The Chained One, free of the ball',
    size: 'a boss: the Warden’s height, if he stood up straight',
    build: CB2,
    stand,
    attack: mv('The Chained One lashes', coLash(), {
      // (sparks and dust where the chain slams the floor)
      extra: (t, look) => {
        const since = t - CO_LASH_HIT;
        if (since < 0 || since > 0.6) return {};
        const at = look('R', CO_LASH_HIT);
        return slamBurst((at ?? []).filter((q, i) => i > 3 && q[2] < 3.5), since, 61);
      },
    }, { glint: coGlint(0.35, 0.62, CO_LASH_HIT), feet: coLashFeet() }),
    idleFrames: 25,
    idleFps: 10,
    walk,
    walkFrames: CO_WALK_FRAMES,
    walkFps: CO_WALK_FPS,
    pace: CHAINED_PACE,
    more,
    reel: mv('The Chained One is struck', coStruck()),
    reelTime: 0.3,
    hit: CO_LASH_HIT,
    warn: 0.5,
    dieTime: CO_DIE_TIME,
    dying: mv('His chains drag him down', coDying(), { end: undefined, hold: (name, s, t) => {
      if (name === 'ball') return undefined;
      // (the ends of his wrist chains hold where they lie: the chains drag his arms down to them; his knees down, they are dragged after him)
      if (t >= CO_ENDS_GO) return undefined;
      return { from: cuffAt(s, name), held: [[CO_SPEC[name].n, chainEnds()[name]]] };
    } }, { feet: coDyingFeet() }),
    aura: { x: CO_CANVAS_AX - 2, y: CO_CANVAS_AY - 50, r: 80, color: '#ff3a78', a: 0.15 },
    shadow: 30,
    canvas: { w: 420, h: 340, ax: CO_CANVAS_AX, ay: CO_CANVAS_AY },
    trueBack: true,
    bits: (st, m) => chainedBits(st, m, freed),
    fall: () => null,
  };
}
export const CHAINED: Mob = chainedMob(0);
/** HIM AS HIS CHAINS BREAK: his left chain ripped off (1); free of the ball too (2). */
export const CHAINED_FREED: Readonly<Record<1 | 2, Mob>> = { 1: chainedMob(1), 2: chainedMob(2) };

/**
 * THE CHAINED ONE AS THE CHECKS SEE HIM (art/boss_checks.ts), as free as `mob` is: his solids, and his
 * chains through each move, each from its fourth link on (the first hang against what holds them), the
 * hook at the end of his right one and the ball at the end of the collar's. A wrist chain may lie along
 * its own arm; the ball's chain may lie in his hands while he hauls it in.
 */
export function coShape(mob: Mob): BossShape {
  const ropes = (move: string, t: number): Ropes => {
    const mv = move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? mob[move] : move === 'dying' ? mob.dying : mob.more?.[move];
    return mv?.ropes?.(t) ?? {};
  };
  return {
    body: coSolids,
    thingsOf: (other) => coShape(other).things,
    low: { knee: CO_KNEE_DOWN - 0.4, elbow: CB2.armR[1] * 0.6, hand: 1.5 },
    // (the end he strikes with: his lash's, the end of its chain; the hook and the ball, the hand that flings them)
    tip: (move, t, s) => {
      if (move === 'attack' || move === 'hook') return s.handR;
      if (move === 'ball') return lerp3(s.handL, s.handR, 0.5);
      return null;
    },
    // (into his walk and out of it by his steps; every other move from his stoop and back to it, a chain broken, to his stoop as he is then)
    handovers: [
      { from: 'stand', at: 0, to: 'setOff', toAt: 0 },
      { from: 'setOff', at: 'end', to: 'walk', toAt: 0 },
      { from: 'walk', at: 0, to: 'halt', toAt: 0 },
      { from: 'halt', at: 'end', to: 'stand', toAt: 0 },
      { from: 'stand', at: 0, to: 'dying', toAt: 0 },
      ...['attack', 'reel', ...Object.keys(mob.more ?? {}).filter((m) => m !== 'setOff' && m !== 'halt')].flatMap((m): Handover[] => [
        { from: 'stand', at: 0, to: m, toAt: 0 },
        { from: m, at: 'end', to: 'stand', toAt: 0, mob: m === 'breakL' ? CHAINED_FREED[1] : m === 'breakBall' ? CHAINED_FREED[2] : undefined },
      ]),
    ],
    things: (move, t) => {
      const r = ropes(move, t);
      const out: CheckThing[] = [];
      for (const name of CO_ROPES) {
        const ch = r[name];
        if (!ch || ch.length < 5) continue;
        const spec = CO_SPEC[name];
        const last = name === 'ball' ? ch.length - 1 : ch.length;
        const pts: V3[] = [];
        for (let i = 3; i < last; i++) {
          pts.push(ch[i]);
          if (i + 1 < last) pts.push(lerp3(ch[i], ch[i + 1], 0.5));
        }
        const may = name === 'L' ? ['upperL', 'foreL', ...(move === 'breakL' ? ['footL'] : [])] : name === 'R' ? ['upperR', 'foreR'] : move === 'ball' ? ['foreL', 'foreR'] : [];
        out.push({ name: name === 'ball' ? 'ball chain' : `${name} chain`, pts, r: spec.r, may });
        if (name === 'R') {
          const end = ch[ch.length - 1];
          out.push({ name: 'hook', pts: [end, add(end, mul(norm(sub(end, ch[ch.length - 2]), [-1, 0, 0]), 5))], r: spec.endR, may });
        }
        if (name === 'ball') out.push({ name: 'ball', pts: [ch[ch.length - 1]], r: spec.endR, may: move === 'ball' ? ['foreL', 'foreR'] : [] });
      }
      return out;
    },
  };
}

/**
 * WHAT HE LEAVES ON THE FLOOR WHEN A CHAIN BREAKS: the chain as it lies at the end of the move that broke
 * it (and the ball with its own), painted from his floor point where he stood: the game leaves it there.
 */
export function paintLeftBehind(which: 'L' | 'ball', view: GameView): Painted {
  const mob = which === 'L' ? CHAINED : CHAINED_FREED[1];
  const move = mob.more![which === 'L' ? 'breakL' : 'breakBall'];
  const can = canvasOf(mob);
  const st = stage(paintViewOf(mob, view), can.ax, can.ay, can);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const r = move.ropes!(CO_BREAK_TIME)[which];
  if (r) {
    if (which === 'L') chainAlong(put, 'chainL', 'chainL', r, 1, OLD_IRON);
    else {
      const ball = r[r.length - 1];
      chainAlong(put, 'ballchain', 'ballchain', [...r.slice(0, -1), add(ball, mul(norm(sub(r[r.length - 2], ball)), BALL_R - 1.6))], 1.15, OLD_IRON);
      put('ball', 'ball', { k: 'ball', c: ball, ax: sphere(BALL_R), skin: ballSkin });
    }
  }
  const lights = paintBits(st, bits, [0, 0, 0]);
  return { px: st.whole(null), lights };
}
export function makeLeftBehindArt(which: 'L' | 'ball', view: GameView = 'front'): Sprite {
  const can = canvasOf(CHAINED);
  return toSprite(paintLeftBehind(which, view), null, can.ax, can.ay);
}

// --- WHAT HE FLINGS OUT ACROSS THE ROOM: the game's to draw (art/boss_shots.ts), from these ---

/** Where his right cuff is, and the ring on his collar, `t` seconds into one of his moves (the figure's own lengths: where the game's chain out across the room starts). */
export function coCuffAt(which: string, t: number): V3 {
  return cuffAt(skeletonAt(CHAINED, which, t), 'R');
}
export function coCollarAt(which: string, t: number): V3 {
  return collarRingAt(skeletonAt(CHAINED, which, t));
}
/** A point of the figure's own space as the floor's drawings take it: tiles before him, tiles to his left, and its height in the game's pixels. */
const tilesOf = (p: V3): [number, number, number] => [p[0] / TILE3, p[1] / TILE3, p[2] / 2];
/** How far his hook flies in the pictures, and his ball (tiles before him): the rules' own, when they are made. When the hook bites; when the ball comes down. */
export const CO_HOOK_REACH = 4.5;
export const CO_HOOK_BITE = 1.52;
export const CO_BALL_REACH = 4.0;
/** How far along its way back to him a thing he hauls in is, `t` seconds in: a jerk with each pull of his hands (`pulls`, the times each begins and ends), still between them. */
function hauled(t: number, pulls: ReadonlyArray<readonly [number, number]>): number {
  let done = 0;
  for (const [a, b] of pulls) {
    if (t >= b) done += 1;
    else if (t > a) {
      const k = (t - a) / (b - a);
      done += k * k * (3 - 2 * k);
    }
  }
  return done / pulls.length;
}
const HOOK_PULLS: ReadonlyArray<readonly [number, number]> = [[1.6, 1.78], [1.96, 2.14], [2.14, 2.32], [2.32, CO_HOOK_BACK - 0.02]];
const BALL_PULLS: ReadonlyArray<readonly [number, number]> = [[BALL_HAUL, BALL_HAUL + 0.18], [BALL_HAUL + 0.38, BALL_HAUL + 0.56], [BALL_HAUL + 0.56, BALL_HAUL + 0.76], [BALL_HAUL + 0.76, CO_BALL_BACK - 0.02]];
/**
 * HIS HOOK OUT ACROSS THE ROOM, `t` seconds into his hook and drag (while `coHookOut`): where it is
 * (tiles before him, tiles to his left, height in the game's pixels), and whether it is flying (or
 * dragged along the floor). From where it left his hand it flies out low, to bite the floor at
 * CO_HOOK_REACH (what it catches there is the rules'); then it is hauled back, a jerk with each pull
 * of his, along the floor to where it falls at his feet.
 */
export function coHookPath(t: number): { at: [number, number, number]; flying: boolean } | null {
  if (!coHookOut(t)) return null;
  const mv = CHAINED.more!.hook;
  const r = mv.ropes!(CO_HOOK_LET - SIM_KEEP).R;
  const from = tilesOf(r ? r[r.length - 1] : coCuffAt('hook', CO_HOOK_LET));
  const to: [number, number, number] = [CO_HOOK_REACH, from[1] * 0.3, 1];
  if (t < CO_HOOK_BITE) {
    const k = (t - CO_HOOK_LET) / (CO_HOOK_BITE - CO_HOOK_LET);
    return { at: [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k, from[2] + (to[2] - from[2]) * k + 14 * Math.sin(Math.PI * k)], flying: true };
  }
  const back = tilesOf(hookBack(skeletonAt(CHAINED, 'hook', CO_HOOK_BACK)).slice(-1)[0]);
  const k = hauled(t, HOOK_PULLS);
  return { at: [to[0] + (back[0] - to[0]) * k, to[1] + (back[1] - to[1]) * k, 1], flying: false };
}
/**
 * HIS BALL OUT ACROSS THE ROOM, `t` seconds into the ball throw (while `coBallOut`): where it is
 * (tiles before him, to his left, height in the game's pixels). From his hands it flies out high, to
 * come down at CO_BALL_REACH at CO_BALL_LAND (what it crushes there is the rules'); it lies there;
 * then it is hauled back, a jerk with each pull of his, along the floor to before him.
 */
export function coBallPath(t: number): { at: [number, number, number]; flying: boolean } | null {
  if (!coBallOut(t)) return null;
  const s = skeletonAt(CHAINED, 'ball', CO_BALL_LET);
  const from = tilesOf(lerp3(s.handL, s.handR, 0.5));
  const to: [number, number, number] = [CO_BALL_REACH, 0, BALL_R / 2];
  if (t < CO_BALL_LAND) {
    const k = (t - CO_BALL_LET) / (CO_BALL_LAND - CO_BALL_LET);
    return { at: [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k, from[2] + (to[2] - from[2]) * k + 40 * Math.sin(Math.PI * k)], flying: true };
  }
  const back = tilesOf(BALL_DRAG[0]);
  const k = hauled(t, BALL_PULLS);
  return { at: [to[0] + (back[0] - to[0]) * k, to[1] + (back[1] - to[1]) * k, BALL_R / 2], flying: false };
}

/** How far his chains reach round him as they whirl (the figure's own lengths from his floor point, along the floor): the furthest any link of them goes while he spins. */
export function coWhirlReach(): number {
  const mv = CHAINED.more!.whirl;
  let far = 0;
  for (let t = CO_WHIRL_FROM; t <= CO_WHIRL_TO; t += 1 / 60) {
    const r = mv.ropes!(t);
    for (const side of ['L', 'R'] as const) for (const q of r[side] ?? []) far = Math.max(far, Math.hypot(q[0], q[1]));
  }
  return far;
}
/** THE HOOK IN FLIGHT, on its own canvas: the hook and a few links of its chain behind it, `turn` of the way round as it tumbles (0..1); lying on the floor when it is dragged (`lying`). */
export const HOOK_SHOT_CANVAS: MobCanvas = { w: 72, h: 72, ax: 36, ay: 40 };
export function paintHookShot(turn: number, view: PaintView = 'front', lying = false): Painted {
  const can = HOOK_SHOT_CANVAS;
  const st = stage(view, can.ax, can.ay, can);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const a = turn * Math.PI * 2;
  // (flying, point first and tumbling a little; lying, flat on the floor, its point toward him)
  const dir: V3 = lying ? [-1, 0, 0] : norm([Math.cos(a) * 0.4 + 1, 0, Math.sin(a) * 0.5]);
  const z = lying ? 1.2 : 0;
  const tail: V3[] = [];
  for (let i = 0; i <= 4; i++) tail.push([-dir[0] * (6 - 2.6 * i) - 6, -dir[1] * (6 - 2.6 * i), z - dir[2] * (6 - 2.6 * i) + (lying ? 0 : Math.sin(a + i) * 0.6)]);
  const links = lying ? tail.map((q) => [q[0] + 12, q[1], q[2]] as V3).reverse() : tail;
  chainAlong(put, 'hook', 'hook', links, 1, OLD_IRON);
  hookOn(put, 'hook', links);
  const lights = paintBits(st, bits, [0, 0, 0]);
  return { px: st.whole(ENEMY_RIM), lights };
}
export const HOOK_SHOT_FRAMES = 8;
export function makeHookShotArt(view: GameView = 'front'): Sprite[] {
  return lazyFrames(HOOK_SHOT_FRAMES + 1, (i) => toSprite(paintHookShot(i / HOOK_SHOT_FRAMES, paintViewOf(CHAINED, view), i === HOOK_SHOT_FRAMES), null, HOOK_SHOT_CANVAS.ax, HOOK_SHOT_CANVAS.ay));
}
/** THE BALL IN FLIGHT, on its own canvas: his iron ball, a few links of its chain on it, `turn` of the way round as it turns over (0..1). Its middle is on the anchor. */
export const BALL_SHOT_CANVAS: MobCanvas = { w: 60, h: 60, ax: 30, ay: 30 };
export function paintBallShot(turn: number, view: PaintView = 'front'): Painted {
  const can = BALL_SHOT_CANVAS;
  const st = stage(view, can.ax, can.ay, can);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const a = turn * Math.PI * 2;
  const ax: Frame3 = [[Math.cos(a) * BALL_R, 0, Math.sin(a) * BALL_R], [0, BALL_R, 0], [-Math.sin(a) * BALL_R, 0, Math.cos(a) * BALL_R]];
  put('ball', 'ball', { k: 'ball', c: [0, 0, 0], ax, skin: (u, tone) => (hash(Math.round(u[0] * 4), Math.round(u[1] * 4 + u[2] * 7), 17) < 0.12 ? RUST[Math.max(1, Math.min(3, tone))] : OLD_IRON[tone]) });
  chainAlong(put, 'ball', 'ball', [[-BALL_R + 1, 0, 0], [-BALL_R - 5, 0, 1.5], [-BALL_R - 10, 0, 2]], 1.15, OLD_IRON);
  const lights = paintBits(st, bits, [0, 0, 0]);
  return { px: st.whole(ENEMY_RIM), lights };
}
export const BALL_SHOT_FRAMES = 8;
export function makeBallShotArt(view: GameView = 'front'): Sprite[] {
  return lazyFrames(BALL_SHOT_FRAMES, (i) => toSprite(paintBallShot(i / BALL_SHOT_FRAMES, paintViewOf(CHAINED, view)), null, BALL_SHOT_CANVAS.ax, BALL_SHOT_CANVAS.ay));
}

/** THE CHAINED ONE, as the game holds a monster: as free as he is (`freed`: his chains breaking, one at a time). */
export function makeChainedArt3(pace = CHAINED.pace, freed: CoFreed = 0): ActorArt {
  const mob = freed === 0 ? CHAINED : CHAINED_FREED[freed];
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// =============================================================================================
// 3. THE OSSUARY AMALGAMATION
//
// The Ossuary Golem's kind (art/new_mobs3.ts: the bones of an ossuary), bigger and nastier. His words
// on its first look: "Too round, like a ball", "Not nasty enough", "The face is too cute", "I thought
// I’d be more like a blob and the arms pulled it along the ground"; and, of the shapes offered, "A heap
// that crawls low". So: A HEAP OF THE DEAD, low and wide, slumped on the floor: a dark mass with all
// an ossuary held sunk in it, bones every which way, rib cages, skulls all over it with the pink in
// their sockets, broken bones jutting from its hump, the dead's own arms reaching up out of it, the
// fire showing in its cracks. It has no face. Low in its front is A MAW, a ragged split full of fangs
// with the fire inside it, and over it a crowd of skulls, all staring. Behind, it trails off into the
// floor it has dragged itself over. And it is dragged: GREAT ARMS OF BONE come out of its front and
// sides and reach out along the ground before it, elbows out, hands spread on the floor, gripping.
// His yes to this look, by 17:44: "Yes, this is it (Recommended)".

/** Its frame: a figure's bones only for where it is and which way it faces (its arms and its lumps are its own). */
const AM_BODY: Build = buildOf(110, 1, { legs: 0.82, trunk: 1.0, shoulders: 1.2 });
const AB = AM_BODY;
/** Its bones: the Golem's (packed grey bone). */
export const OSS: Ramp = ['#463e70', '#463e70', '#948bbf', '#d3cbec', '#d3cbec'];
/** Its bones deep in it, near the floor: in its own shadow. */
const DEEP_OSS: Ramp = dim(OSS);
/** The mass they are sunk in: dark, the fire showing in its cracks. */
const MASS: Ramp = ['#120d20', '#120d20', '#251c38', '#3b2f55', '#3b2f55'];

/** Its canvas: room before it, where its arms reach, and behind it, where it trails off. */
export const AM_CANVAS: MobCanvas = { w: 320, h: 256, ax: 156, ay: 190 };

/** THE LUMPS IT IS MADE OF, slumped on the floor (forward, to its left, how high its middle is; and their half-sizes). */
const AM_LUMPS: ReadonlyArray<{ at: V3; r: V3; seed: number }> = [
  { at: [-6, 0, 8], r: [38, 35, 9], seed: 201 }, // 0: its foot, spread on the floor
  { at: [-10, 2, 21], r: [26, 25, 18], seed: 202 }, // 1: its hump
  { at: [15, 0, 13], r: [18, 29, 12], seed: 203 }, // 2: its brow, the maw low in it
  { at: [-17, -4, 35], r: [16, 16, 12], seed: 204 }, // 3: the top of its hump
  { at: [-2, -26, 12], r: [20, 14, 11], seed: 205 }, // 4: its right flank
  { at: [0, 26, 11], r: [20, 14, 10], seed: 206 }, // 5: its left flank
  { at: [-40, 7, 9], r: [20, 17, 9], seed: 207 }, // 6: what it drags behind it
  { at: [-59, 13, 4], r: [14, 11, 5], seed: 208 }, // 7: the end of that, trailing off into the floor
];
/** Which lumps the bones and skulls on its skin are spread over (the more often a lump is named, the more it has). */
const AM_SPREAD = [1, 1, 1, 3, 3, 2, 2, 4, 4, 5, 5, 6, 6, 0, 0, 7];

/** ITS GREAT ARMS, out of its front and sides: where (degrees round from its front, toward its left; how high), how long each bone, how thick. */
interface AmArm {
  name: string;
  deg: number;
  up: number;
  a: number;
  b: number;
  r: number;
}
const AM_ARMS: ReadonlyArray<AmArm> = [
  { name: 'R3', deg: -112, up: 7, a: 17, b: 19, r: 3.4 },
  { name: 'R2', deg: -84, up: 7.5, a: 20, b: 22, r: 4.0 },
  { name: 'R1', deg: -56, up: 8, a: 23, b: 25, r: 4.6 },
  { name: 'L1', deg: 44, up: 8, a: 23, b: 25, r: 4.6 },
  { name: 'L2', deg: 72, up: 7.5, a: 20, b: 22, r: 4.0 },
  { name: 'L3', deg: 102, up: 7, a: 17, b: 19, r: 3.4 },
];
/** Where its hands are on the floor when it rests (forward, to its left): out before it, along the floor, the near ones not toward you (they would stand like legs). */
const AM_PLANT: Record<string, V3> = {
  R3: [-4, -66, 0], R2: [38, -50, 0], R1: [62, -26, 0], L1: [62, 26, 0], L2: [40, 56, 0], L3: [0, 66, 0],
};
/** THE DEAD'S OWN ARMS, reaching up out of it here and there: on which lump, round it, how far up it; and whether it hangs limp. */
const AM_DEAD: ReadonlyArray<{ li: number; deg: number; v: number; limp: boolean }> = [
  { li: 3, deg: 70, v: 0.55, limp: false },
  { li: 3, deg: -100, v: 0.5, limp: false },
  { li: 1, deg: 150, v: 0.6, limp: false },
  { li: 1, deg: -55, v: 0.45, limp: true },
  { li: 5, deg: 75, v: 0.35, limp: true },
  { li: 6, deg: -70, v: 0.55, limp: false },
  { li: 4, deg: -125, v: 0.5, limp: true },
];

/** Two bones from a shoulder to a hand: where the elbow is, the hand put within reach. */
function twoBone(sh: V3, target: V3, a: number, b: number, hint: V3): { el: V3; hand: V3 } {
  let d = sub(target, sh);
  let L = len(d);
  const most = (a + b) * 0.995;
  const least = Math.abs(a - b) + 0.5;
  let hand = target;
  if (L > most) {
    hand = add(sh, mul(d, most / L));
    d = sub(hand, sh);
    L = most;
  } else if (L < least) {
    const dir0 = L > 1e-6 ? mul(d, 1 / L) : ([0, 0, -1] as V3);
    hand = add(sh, mul(dir0, least));
    d = sub(hand, sh);
    L = least;
  }
  const dir = mul(d, 1 / L);
  const x = (a * a - b * b + L * L) / (2 * L);
  const h = Math.sqrt(Math.max(0, a * a - x * x));
  const e = norm(sub(hint, mul(dir, dot(hint, dir))), norm(cross(dir, [0, 0, 1]), [1, 0, 0]));
  return { el: add(add(sh, mul(dir, x)), mul(e, h)), hand };
}

/** AN ARM OF BONE: a long upper bone, a knobbed elbow, the two bones of the forearm, a hand: flat on the floor with its fingers spread and dug in if it is down, hooked like claws if it is not (`open`, 0 curled to 1 spread). */
function boneArm(put: Put, part: string, sh: V3, el: V3, hand: V3, r: number, open: number, ramp: Ramp, great = false): void {
  if (great) {
    // (a great arm: its bones are many, grown together, as the Golem's limbs are)
    bundle(put, part, part + 'u', sh, el, r * 1.25, 5, 3 + part.length, ramp);
    bundle(put, part, part + 'f', el, hand, r * 1.0, 4, 7 + part.length, ramp);
    put(part, part, { k: 'ball', c: el, ax: sphere(r * 0.95), skin: ramp, far: true });
    r *= 0.72;
  } else {
    put(part, part, { k: 'ball', c: sh, ax: sphere(r * 1.25), skin: ramp, far: true });
    put(part, part, { k: 'rod', a: sh, b: el, ra: r, rb: r * 0.82, ramp, far: true });
  }
  // (the knob of the bone's head at the elbow, and a spur of bone off it: these arms are grown, not made)
  if (!great) put(part, part, { k: 'ball', c: el, ax: sphere(r * 1.1), skin: ramp, far: true });
  const spur = add(el, mul(norm(add(sub(el, sh), sub(el, hand))), r * 2.2));
  put(part, part, { k: 'rod', a: el, b: spur, ra: r * 0.5, rb: r * 0.15, ramp, far: true });
  const fd = norm(sub(hand, el), [0, 0, -1]);
  const side = norm(cross(fd, [0, 0, 1]), [0, 1, 0]);
  if (!great) for (const k of [-1, 1]) put(part, part, { k: 'rod', a: add(el, mul(side, k * r * 0.4)), b: add(hand, mul(side, k * r * 0.3)), ra: r * 0.48, rb: r * 0.42, ramp, far: true });
  if (hand[2] < 4.5) {
    // flat on the floor, fingers spread before it and dug in
    const fwd = norm([fd[0], fd[1], 0], [1, 0, 0]);
    const lft: V3 = [-fwd[1], fwd[0], 0];
    const palm: V3 = [hand[0] + fwd[0] * r * 0.7, hand[1] + fwd[1] * r * 0.7, Math.max(1.6, hand[2] + r * 0.45)];
    put(part, part, { k: 'ball', c: palm, ax: [mul(fwd, r * 1.3), mul(lft, r * 1.25), [0, 0, r * 0.55]], skin: ramp, far: true });
    for (let i = 0; i < 4; i++) {
      const ang = (-36 + 24 * i) * D;
      const dir: V3 = [fwd[0] * Math.cos(ang) + lft[0] * Math.sin(ang), fwd[1] * Math.cos(ang) + lft[1] * Math.sin(ang), 0];
      const base: V3 = add(palm, mul(dir, r * 1.1));
      const knuckle: V3 = add(add(base, mul(dir, r * 1.3)), [0, 0, r * 0.55]);
      const tip: V3 = add(knuckle, add(mul(dir, r * 1.4), [0, 0, -r * 0.9]));
      put(part, part, { k: 'rod', a: base, b: knuckle, ra: r * 0.36, rb: r * 0.32, ramp, far: true });
      put(part, part, { k: 'rod', a: knuckle, b: [tip[0], tip[1], Math.max(0.6, tip[2])], ra: r * 0.32, rb: r * 0.16, ramp, far: true });
    }
    // and the thumb, round to the side
    const tb: V3 = add(palm, mul(lft, (part.includes('L') ? -1 : 1) * r * 1.1));
    put(part, part, { k: 'rod', a: tb, b: add(add(tb, mul(fwd, r * 0.9)), mul(lft, (part.includes('L') ? -1 : 1) * r * 0.9)), ra: r * 0.34, rb: r * 0.18, ramp, far: true });
  } else {
    // hooked like claws
    const up = norm(cross(side, fd), [0, 0, 1]);
    const palm = add(hand, mul(fd, r * 0.9));
    put(part, part, { k: 'ball', c: palm, ax: [mul(fd, r * 1.2), mul(side, r * 1.1), mul(up, r * 0.6)], skin: ramp, far: true });
    for (let i = 0; i < 4; i++) {
      const k = (i - 1.5) / 1.5;
      const base = add(add(palm, mul(fd, r * 1.0)), mul(side, k * r * 0.9));
      const spread = norm(add(fd, mul(side, k * (0.15 + 0.45 * open))));
      const knuckle = add(base, mul(spread, r * 1.3));
      const tip = add(knuckle, mul(norm(add(mul(spread, open), mul(up, -(1.2 - open)))), r * 1.3));
      put(part, part, { k: 'rod', a: base, b: knuckle, ra: r * 0.34, rb: r * 0.3, ramp, far: true });
      put(part, part, { k: 'rod', a: knuckle, b: tip, ra: r * 0.3, rb: r * 0.16, ramp, far: true });
    }
  }
}

/**
 * THE SKIN OF ITS MASS: packed bone in the dark (as art/new_mobs3.ts `packed`), and in some of the
 * cracks between the bones the fire, glowing (`hot`, 0 none: it goes out as it dies).
 */
function massSkin(cells: number, seed: number, hot: number): Skin {
  return (u, tone) => {
    const px = u[0] * cells;
    const py = u[1] * cells;
    const pz = u[2] * cells;
    const ix = Math.floor(px);
    const iy = Math.floor(py);
    const iz = Math.floor(pz);
    let d1 = 9;
    let d2 = 9;
    let id1 = 0;
    let id2 = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const cx = ix + dx;
          const cy = iy + dy;
          const cz = iz + dz;
          const jx = cx + hash(cx + 37 * cz, cy, seed);
          const jy = cy + hash(cx + 37 * cz, cy, seed + 1);
          const jz = cz + hash(cx + 37 * cz, cy, seed + 2);
          const d = (px - jx) ** 2 + (py - jy) ** 2 + (pz - jz) ** 2;
          const id = cx * 7919 + cy * 104729 + cz * 31;
          if (d < d1) {
            d2 = d1;
            id2 = id1;
            d1 = d;
            id1 = id;
          } else if (d < d2) {
            d2 = d;
            id2 = id;
          }
        }
      }
    }
    const edge = Math.sqrt(d2) - Math.sqrt(d1);
    if (edge < 0.17) {
      // a crack between two bones: in some of them the fire
      const a = Math.min(id1, id2);
      const b = Math.max(id1, id2);
      if (hot > 0.1 && hash(a, b, seed + 7) < 0.22 && tone >= 1) return hot > 0.6 && tone >= 3 ? FLAME[1] : FLAME[0];
      return MASS[0];
    }
    if (Math.sqrt(d1) < 0.22 && tone >= 2) return MASS[Math.min(4, tone + 1)];
    return MASS[tone];
  };
}

/** THE AMALGAMATION AS SOLIDS. */
function amalgamBits(st: Stage, m: Moment): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  // (its frame: flat on the floor, the way it faces; it heaves up and down by `pz`, and leans by its pitch)
  const f = norm([s.chest[0][0], s.chest[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const up: V3 = [0, 0, 1];
  const O: V3 = [s.pelvis[0], s.pelvis[1], 0];
  const heave = 1 + (q.pz - AM_REST.pz) * 0.03;
  const lean = (q.pitch - AM_REST.pitch) * 0.25;
  const at = (fw: number, lf: number, z: number): V3 => add(O, add(add(mul(f, fw), mul(l, lf)), [0, 0, z]));
  const lit = 1 - clamp01(q.out);
  const t = m.t;
  /** How wide its maw is open (0 shut, 1 wide): `draw`; how wild the arms on its top are: `pt`. */
  const jaw = clamp01(q.draw);
  const agit = clamp01(q.pt);
  const lumps = AM_LUMPS.map((L) => ({ c: at(L.at[0] + lean * (L.at[2] / 20), L.at[1], L.at[2] * heave), r: [L.r[0], L.r[1], L.r[2] * heave] as V3, seed: L.seed }));
  /** A point on a lump's skin: `deg` round it from its front, `v` up it (-1 to 1). */
  const onLump = (i: number, deg: number, v: number, out = 1): V3 => {
    const L = lumps[i];
    const a = deg * D;
    const k = Math.sqrt(Math.max(0, 1 - v * v));
    return add(L.c, add(add(mul(f, Math.cos(a) * k * L.r[0] * out), mul(l, Math.sin(a) * k * L.r[1] * out)), [0, 0, v * L.r[2] * out]));
  };
  /** Which way its skin faces there (out of the lump). */
  const normalOn = (i: number, p: V3): V3 => {
    const L = lumps[i];
    const d = sub(p, L.c);
    return norm(add(add(mul(f, dot(d, f) / (L.r[0] * L.r[0])), mul(l, dot(d, l) / (L.r[1] * L.r[1]))), [0, 0, d[2] / (L.r[2] * L.r[2])]), up);
  };
  /** Whether a point is inside the heap. */
  const inHeap = (p: V3): boolean =>
    lumps.some((L) => {
      const d = sub(p, L.c);
      return (dot(d, f) / L.r[0]) ** 2 + (dot(d, l) / L.r[1]) ** 2 + (d[2] / L.r[2]) ** 2 <= 1;
    });
  /** How far out the heap reaches, `deg` round from its front, at a height `z`. */
  const rimOf = (deg: number, z: number): number => {
    const a = deg * D;
    const dir = add(mul(f, Math.cos(a)), mul(l, Math.sin(a)));
    let last = 0;
    for (let r = 0; r <= 90; r += 1) if (inHeap(add(O, add(mul(dir, r), [0, 0, z])))) last = r;
    return last;
  };

  // --- the heap: lumps of dark packed bone slumped on the floor, the fire in their cracks ---
  lumps.forEach((L, i) => {
    put('heap', 'heap', { k: 'ball', c: L.c, ax: [mul(f, L.r[0]), mul(l, L.r[1]), [0, 0, L.r[2]]], skin: massSkin(Math.max(L.r[0], L.r[1]) / 3.4, L.seed, lit) });
  });

  // --- bones sunk in it every which way, their knobbed ends standing out ---
  for (let i = 0; i < 72; i++) {
    const li = AM_SPREAD[i % AM_SPREAD.length];
    const deg = -180 + hash(i, 1, 41) * 360;
    const v = li === 0 ? 0.15 + hash(i, 2, 41) * 0.5 : -0.15 + hash(i, 2, 41) * 1.0;
    const p0 = onLump(li, deg, v, 0.99);
    if (p0[2] < 2.5) continue;
    const out = normalOn(li, p0);
    const tang = norm(cross(out, norm([hash(i, 3, 41) - 0.5, hash(i, 4, 41) - 0.5, hash(i, 5, 41) - 0.5], [0, 0, 1])), up);
    const L = 9 + hash(i, 6, 41) * 8;
    const r = 1.2 + hash(i, 8, 41) * 0.45;
    const a = add(p0, mul(tang, -L / 2));
    const b = add(add(p0, mul(tang, L / 2)), mul(out, 0.6 + hash(i, 7, 41) * 2.4));
    // (deep in the heap, near the floor, in its shadow: darker)
    const ramp = p0[2] < 9 ? DEEP_OSS : OSS;
    put('bones', 'heap', { k: 'rod', a, b, ra: r, rb: r * 0.88, ramp });
    put('bones', 'heap', { k: 'ball', c: a, ax: sphere(r * 1.55), skin: ramp });
    put('bones', 'heap', { k: 'ball', c: b, ax: sphere(r * 1.45), skin: ramp });
  }
  // --- rib cages half sunk in it ---
  for (const [li, deg, v, seed] of [[3, 30, 0.35, 1], [1, 125, 0.45, 2], [4, -110, 0.4, 3], [6, -60, 0.55, 4], [1, -150, 0.5, 5]] as const) {
    const c = onLump(li, deg, v, 0.97);
    const out = normalOn(li, c);
    const along = norm(cross(out, up), f);
    const side = norm(cross(along, out));
    for (let k = 0; k < 4; k++) {
      const x = (k - 1.5) * 3.6;
      let last: V3 | null = null;
      for (let j = 0; j <= 6; j++) {
        const a = (j / 6) * Math.PI;
        const p = add(c, add(add(mul(along, x), mul(side, Math.cos(a) * 7)), mul(out, Math.sin(a) * 5.5 - 1.2)));
        if (last) put(`cage${seed}`, `cage${seed}`, { k: 'rod', a: last, b: p, ra: 1.05, rb: 1.05, ramp: OSS });
        last = p;
      }
    }
    put(`cage${seed}`, `cage${seed}`, { k: 'rod', a: add(c, add(mul(along, -7.5), mul(out, 4.2))), b: add(c, add(mul(along, 7.5), mul(out, 4.2))), ra: 1.3, rb: 1.15, ramp: OSS });
  }
  // --- broken bones jutting from its hump, jagged ---
  for (let i = 0; i < 12; i++) {
    const li = i % 3 === 0 ? 3 : i % 3 === 1 ? 1 : i % 2 ? 6 : 2;
    const p0 = onLump(li, -170 + hash(i, 1, 43) * 340, 0.5 + hash(i, 2, 43) * 0.45, 0.95);
    const out = norm(add(normalOn(li, p0), mul(up, 0.8)));
    const L = 8 + hash(i, 3, 43) * 11;
    const tip = add(add(p0, mul(out, L)), mul(f, (hash(i, 4, 43) - 0.65) * 6));
    put(`jut${i}`, `jut${i}`, { k: 'rod', a: p0, b: tip, ra: 2.0, rb: 0.4, ramp: OSS });
    if (i % 4 === 1) put(`jut${i}`, `jut${i}`, { k: 'rod', a: lerp3(p0, tip, 0.45), b: add(lerp3(p0, tip, 0.45), mul(norm(cross(out, up), f), 4)), ra: 0.9, rb: 0.3, ramp: OSS });
  }
  // --- skulls all over it, sunk to their brows and turned every way; the pink burning in many ---
  for (let i = 0; i < 40; i++) {
    const li = AM_SPREAD[(i * 7 + 3) % AM_SPREAD.length];
    const deg = -175 + hash(i, 1, 47) * 350;
    const v = li === 0 ? 0.25 + hash(i, 2, 47) * 0.45 : -0.05 + hash(i, 2, 47) * 0.9;
    const p = onLump(li, deg, v, 0.94);
    if (p[2] < 3.5) continue;
    const out = normalOn(li, p);
    const twist = (hash(i, 3, 47) - 0.5) * 2.4;
    const look = faceAlong(norm(add(out, mul(cross(up, out), twist * 0.6))), norm(add(up, mul(out, -0.4 + hash(i, 4, 47) * 0.8))));
    const r = i % 9 === 4 ? 5.8 : 3.8 + hash(i, 5, 47) * 1.3;
    const glow = hash(i, 6, 47) < 0.5 ? lit * (0.6 + 0.4 * Math.sin(t * 2 + i)) : 0;
    skull(st, put, `sk${i}`, `sk${i}`, add(p, mul(out, r * 0.25)), look, [r, r * 0.9, r * 0.92], p[2] < 9 ? DEEP_OSS : OSS, eyesOf(st, look), glow, i % 2 === 0, 3);
  }

  // --- its maw, low in its brow: a ragged split full of fangs, the fire inside. (Turned some way toward the eye, as a face is: art/skin.ts `eyesToward`; from behind it is not seen.) ---
  const brow = lumps[2];
  const cam = Math.atan2(dot(st.eye, l), dot(st.eye, f)) / D;
  const mawA = Math.max(-40, Math.min(40, cam * 0.5)) * clamp01((110 - Math.abs(cam)) / 40) * D;
  const fa: V3 = norm(add(mul(f, Math.cos(mawA)), mul(l, Math.sin(mawA))));
  const la: V3 = [-fa[1], fa[0], 0];
  const browOut = 1 / Math.hypot(Math.cos(mawA) / brow.r[0], Math.sin(mawA) / brow.r[1]);
  const mc = add(brow.c, add(mul(fa, browOut * 0.84), [0, 0, -brow.r[2] * 0.05]));
  const wide = 22;
  const gape = 3.4 + 7 * jaw;
  // (its lips' way up, tipped back a little: it opens forward and up, at you)
  const ua: V3 = norm(add([0, 0, 1], mul(fa, -0.35)));
  const fo: V3 = norm(cross(la, ua));
  put('maw', 'maw', {
    k: 'ball',
    c: mc,
    ax: [mul(fo, 5), mul(la, wide), mul(ua, gape)],
    skin: (u) => {
      if (u[0] < -0.3) return null;
      // (its lips ragged)
      if (Math.abs(u[2]) > 0.74 + 0.26 * Math.sin(u[1] * 17 + 1.1)) return null;
      return jaw > 0.2 && Math.abs(u[1]) < 0.6 && Math.abs(u[2]) < 0.5 ? FLAME[jaw > 0.65 ? 3 : 2] : INK;
    },
  });
  for (const sgn of [1, -1]) {
    for (let i = 0; i <= 13; i++) {
      const k = (i / 13) * 2 - 1;
      if (hash(i, sgn > 0 ? 3 : 4, 53) < 0.16) continue; // (a tooth gone)
      const round = Math.sqrt(Math.max(0, 1 - k * k));
      const lip = gape * round * 0.8;
      const base = add(mc, add(add(mul(la, k * wide * 0.9), mul(fo, 4.2 * round + 0.5)), mul(ua, sgn * (lip + 0.7))));
      const fang = hash(i, sgn > 0 ? 1 : 2, 53);
      const long = 2.4 + fang * 2.4 + (fang > 0.78 ? 3.6 : 0);
      const tip = add(base, add(mul(ua, -sgn * long), mul(fo, 0.6 + hash(i, 5, 53))));
      put('teeth', 'maw', { k: 'rod', a: base, b: tip, ra: fang > 0.78 ? 1.35 : 1.05, rb: 0.25, ramp: OSS });
    }
  }
  if (lit > 0.1) {
    put('maw', 'maw', { k: 'glow', p: add(mc, mul(fo, 5)), c: '#ff3a78', r: 14 + 18 * jaw, a: (0.24 + 0.4 * jaw) * lit });
    if (jaw > 0.3) put('maw', 'maw', { k: 'glow', p: add(mc, mul(fo, 5)), c: '#ffb070', r: 6 + 8 * jaw, a: (0.2 + 0.3 * jaw) * lit });
  }
  // a crowd of skulls packed over it, all staring out
  for (let i = 0; i < 6; i++) {
    const k = (i / 5) * 2 - 1;
    const p = add(brow.c, add(add(mul(fa, browOut * (0.36 + 0.2 * (1 - Math.abs(k)))), mul(la, k * 20 + (hash(i, 1, 61) - 0.5) * 4)), [0, 0, brow.r[2] * (0.78 + 0.3 * hash(i, 2, 61))]));
    const look = faceAlong(norm(add(add(fa, mul(la, k * 0.35 + (hash(i, 3, 61) - 0.5) * 0.5)), [0, 0, (hash(i, 4, 61) - 0.3) * 0.5])), norm(add(up, mul(la, (hash(i, 5, 61) - 0.5) * 0.9))));
    const r = 4.3 + hash(i, 6, 61) * 1.2;
    skull(st, put, `crowd${i}`, `crowd${i}`, p, look, [r, r * 0.9, r * 0.92], OSS, eyesOf(st, look), lit * (0.75 + 0.25 * Math.sin(t * 3 + i * 1.7)), i % 2 === 1, 3);
  }

  // --- its great arms, out of its front and sides, reaching out along the ground and dragging it ---
  const target = (name: string): V3 => {
    switch (name) {
      case 'R1':
        return [q.rhx, q.rhy, q.rhz];
      case 'L1':
        return [q.lhx, q.lhy, q.lhz];
      case 'R2':
        return [q.rfx, q.rfy, q.rfz];
      case 'L2':
        return [q.lfx, q.lfy, q.lfz];
      default:
        return AM_PLANT[name];
    }
  };
  for (const arm of AM_ARMS) {
    const z = arm.up * heave;
    const r0 = rimOf(arm.deg, z) * 0.88;
    const a = arm.deg * D;
    const sh = at(Math.cos(a) * r0, Math.sin(a) * r0, z);
    const out: V3 = norm(add(mul(f, Math.cos(a)), mul(l, Math.sin(a))));
    // (elbows out to the side and back, a little up, as anyone's are who drags himself along the floor)
    const hint = norm(add(add(mul(out, 0.6), mul(f, -0.5)), [0, 0, 0.3]));
    // (its hands are where the floor is, not where its heap is: a hand that is down stays put as the heap heaves and slides)
    const { el, hand } = twoBone(sh, target(arm.name), arm.a, arm.b, hint);
    boneArm(put, `arm${arm.name}`, sh, el, hand, arm.r, 0.5, OSS, true);
  }
  // --- the dead's own arms, reaching up out of it; and two of its own at its top, grabbing at the air ---
  AM_DEAD.forEach((d, i) => {
    const sh = onLump(d.li, d.deg, d.v, 0.96);
    const out = normalOn(d.li, sh);
    const sway = Math.sin(t * (1.9 + 0.3 * i) + i * 2.3) * (d.limp ? 0.08 : 0.3 + 0.4 * agit);
    const dir = d.limp ? norm(add(mul(out, 0.9), [0, 0, -0.55])) : norm(add(add(out, mul(up, 0.8)), mul(cross(up, out), sway)));
    const reach = d.limp ? 16 : 15 + 3 * Math.sin(t * 2.6 + i);
    const hint = d.limp ? norm(add(out, up)) : norm(add(mul(out, -0.5), up));
    const { el, hand } = twoBone(sh, add(sh, mul(dir, reach)), 9.5, 9.5, hint);
    boneArm(put, `dead${i}`, sh, el, hand, 1.35, d.limp ? 0.05 : 0.45 + 0.45 * Math.sin(t * 3.4 + i * 1.9), OSS);
  });
  for (let i = 0; i < 2; i++) {
    const sh = onLump(3, i === 0 ? 30 : -40, 0.6, 0.92);
    const out = normalOn(3, sh);
    const sway = Math.sin(t * (1.7 + 0.4 * i) + i * 2.1) * (0.4 + 0.5 * agit);
    const dir = norm(add(add(out, mul(up, 1.1)), mul(cross(up, out), sway)));
    const reach = 22 * (1 + 0.15 * Math.sin(t * 2.3 + i));
    const { el, hand } = twoBone(sh, add(sh, mul(dir, reach)), 13, 13, norm(add(mul(out, -0.6), up)));
    boneArm(put, `top${i}`, sh, el, hand, 2.3, 0.5 + 0.5 * Math.sin(t * 3 + i * 1.3), OSS);
  }
  // --- what it drags behind it: a dead man's leg, trailing on the floor ---
  {
    const hip = onLump(7, -150, 0.1, 0.9);
    const knee = at(-74, 4, 2.6);
    const heel = at(-88, 9, 1.6);
    put('drag', 'drag', { k: 'rod', a: hip, b: knee, ra: 1.5, rb: 1.3, ramp: OSS });
    put('drag', 'drag', { k: 'ball', c: knee, ax: sphere(1.8), skin: OSS });
    put('drag', 'drag', { k: 'rod', a: knee, b: heel, ra: 1.25, rb: 1.05, ramp: OSS });
    put('drag', 'drag', { k: 'rod', a: heel, b: add(heel, add(mul(l, 1.5), mul(f, -1.5))), ra: 1.3, rb: 1.0, ramp: OSS });
    put('drag', 'drag', { k: 'rod', a: heel, b: at(-92, 14, 1.4), ra: 1.1, rb: 0.7, ramp: OSS });
  }

  // --- the fire in it, glowing through its cracks; embers rising off it ---
  if (lit > 0.1) {
    for (let i = 0; i < 6; i++) put('fire', 'fire', { k: 'glow', p: onLump([1, 3, 2, 4, 5, 6][i], -140 + i * 60, 0.5, 1.0), c: '#ff3a78', r: 10, a: 0.16 * lit });
    for (let i = 0; i < 14; i++) {
      const life = (t * 0.55 + hash(i, 1, 59)) % 1;
      const p0 = onLump([1, 3, 2, 6][i % 4], -170 + hash(i, 2, 59) * 340, 0.4 + 0.5 * hash(i, 3, 59), 1.0);
      put('embers', 'embers', { k: 'mote', p: add(p0, [0, 0, life * 18]), c: life < 0.35 ? FLAME[3] : FLAME[2], size: 1 });
    }
  }
  return bits;
}

/** STANDING, ALIVE: it heaves as if it breathed, its lumps swelling and settling; its maw works open and shut; the arms on its top grab at the air; its front hands shift their grip on the floor. Three seconds round. */
function amStand(): Motion {
  const R = AM_REST;
  return {
    loop: 0,
    keys: [
      { at: 0, pose: {} },
      { at: 0.8, pose: { pz: R.pz + 3, pitch: R.pitch - 2, draw: 0.4, pt: 0.4 }, ease: 'io' },
      { at: 1.3, pose: { pz: R.pz + 2.4, draw: 0.85, pt: 0.9 }, ease: 'out' },
      { at: 1.5, pose: { pz: R.pz + 1.6, draw: 0.1, pt: 0.6 }, ease: 'in' },
      { at: 2.0, pose: { pz: R.pz - 1.2, pitch: R.pitch + 2, draw: 0.2, pt: 0.3, rhx: R.rhx + 4, rhz: R.rhz + 4 }, ease: 'io' },
      { at: 2.25, pose: { pz: R.pz - 1.4, rhx: R.rhx + 5 }, ease: 'io' },
      { at: 3.0, pose: {}, ease: 'io' },
    ],
  };
}

/** How it rests: its hands where AM_PLANT has them (its own `pz`: how it heaves, 0 at rest). */
export const AM_REST: Bones = {
  ...standing(AB),
  pz: 0, px: 0, yaw: 0, pitch: 0, roll: 0, twist: 0, bend: 0, side: 0, faceTurn: 0, faceUp: 0, faceTilt: 0,
  lhIn: 2, lhx: AM_PLANT.L1[0], lhy: AM_PLANT.L1[1], lhz: AM_PLANT.L1[2],
  rhIn: 2, rhx: AM_PLANT.R1[0], rhy: AM_PLANT.R1[1], rhz: AM_PLANT.R1[2],
  lfx: AM_PLANT.L2[0], lfy: AM_PLANT.L2[1], lfz: AM_PLANT.L2[2],
  rfx: AM_PLANT.R2[0], rfy: AM_PLANT.R2[1], rfz: AM_PLANT.R2[2],
  draw: 0.3, pt: 0.3, out: 0, prop: 0, gale: 0,
};

export const AMALGAM_PACE = 0.8;
export const AMALGAM: Mob = {
  id: 'amalgam',
  name: 'The Ossuary Amalgamation',
  size: 'a boss: a heap of the dead, low and wide, its arms reaching out before it',
  build: AB,
  stand: { name: 'The amalgamation heaves', motion: amStand(), rest: AM_REST },
  attack: { name: 'The amalgamation swipes', motion: { ...stillOf(1.2), hit: 0.7 }, rest: AM_REST },
  idleFrames: 30,
  idleFps: 10,
  walk: { name: 'The amalgamation hauls itself along', motion: standingWalk(), rest: AM_REST, period: 1, ground: AMALGAM_PACE * TILE3 },
  walkFrames: 8,
  walkFps: 8,
  pace: AMALGAM_PACE,
  reel: { name: 'The amalgamation is struck', motion: stillOf(0.3), rest: AM_REST },
  reelTime: 0.3,
  hit: 0.7,
  warn: 0.5,
  dieTime: 2.4,
  dying: { name: 'The amalgamation falls apart', motion: stillOf(2.4), rest: AM_REST },
  aura: { x: AM_CANVAS.ax - 4, y: AM_CANVAS.ay - 34, r: 84, color: '#ff3a78', a: 0.16 },
  shadow: 46,
  canvas: AM_CANVAS,
  bits: (st, m) => amalgamBits(st, m),
  fall: () => null,
};

/** THE OSSUARY AMALGAMATION, as the game holds a monster. */
export function makeAmalgamArt3(pace = AMALGAM.pace): ActorArt {
  return { front: mobSet(AMALGAM, 'front', pace), back: mobSet(AMALGAM, 'back', pace) };
}

/** FOR CHECKS: the Chained One's chains' own workings. */
