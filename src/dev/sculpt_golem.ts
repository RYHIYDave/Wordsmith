// THE TINKERER'S GOLEM, FREED FROM THE HUMAN FRAME (the art chat, 24 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His brief, 23 Oct (Pacific), by 22:21: “Tap and hold will be “Golem”.  And this is gonna be clockwork Automaton that
// follows her around and attacks.  It will just go around and I guess punch things or whatever but tap+hold will have him do
// a bigger move.”; the Golem, “Big bruiser (Recommended)” (a head taller than the knight, huge brass fists, heavy and slow);
// its bigger move, “Ground pound (Recommended)” (both fists hammered down, a shockwave and a burst of steam). Shown it built
// on a man's bones (dev/sculpt_tinkerer.ts sculptGolem), his word, 24 Oct, by 06:57: “The Golem,Her hands are tiny too.  The
// golem is suffering from the same issue as the demon was at first.  It’s too humanoid”.
//
// SO: four Golems, none of them a man in armour, each its own figure on no hero's bones (as the demon is): a BOILER APE that
// walks on its knuckles; a TREAD TANK, a boiler on tracks with piston arms; a FURNACE BELLY, a round stove on stumpy legs,
// no head, its fire its face; a CRAB WALKER, a carapace on four legs, its fists held up. Every one of them brass, riveted
// and banded, steel at its joints, copper pipes and stacks; huge fists for the ground pound; what glows on it the friend's
// cyan (its eyes, its furnace heart). Sculpted (dev/sculpt.ts) and drawn as the heroes are.

import type { Ramp } from '../art/kit';
import { CYAN } from '../art/kit';
import { FRIEND_RIM } from '../art/hero3_knight';
import { CANVAS3 } from '../art/skin';
import type { GameView } from '../art/skin';
import { add, cross, lerp3, mul, norm, sub } from '../art/skeleton';
import type { V3 } from '../art/skeleton';
import { Sculpt, draw, onBall, onCone } from './sculpt';
import type { Box, Cone, Drawn, Ell } from './sculpt';
import { BRASS, shadeOf } from './sculpt_classes';
import { STEEL5 } from './sculpt_warlock';

const D = Math.PI / 180;
const dot3 = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const COPPER: Ramp = ['#2a0e0a', '#521c12', '#8a3a1e', '#c4642e', '#ec9a56'];
/** The dark inside of it: a grille, a furnace's mouth, the gaps of a tread. */
const DARK: Ramp = ['#0a0810', '#141020', '#201a30', '#2e2640', '#3e3454'];

/** Which Golem: its id and its name for him. */
export type GolemBuild =
  | 'ape' | 'tank' | 'belly' | 'crab'
  | 'kettle' | 'bell' | 'clock' | 'wheel' | 'strider' | 'anvil' | 'lantern' | 'cauldron' | 'ball' | 'bellows'
  | 'onearm' | 'mallets' | 'flails' | 'jack' | 'crane' | 'ram' | 'hoses' | 'pincers' | 'paddles' | 'tongs';
/** The first four (24 Oct): his “I like the furnace belly because it’s the most different.  The crab is cool but too messy.  The ape is good as well.” */
export const GOLEM_BUILDS: { id: GolemBuild; name: string }[] = [
  { id: 'ape', name: 'Boiler ape' },
  { id: 'tank', name: 'Tread tank' },
  { id: 'belly', name: 'Furnace belly' },
  { id: 'crab', name: 'Crab walker' },
];
/** THE NEXT TEN (his “Keep trying, maybe give me 10 at a time”, 24 Oct, by 07:33): each as unlike the others as can be. */
export const GOLEM_BUILDS_2: { id: GolemBuild; name: string }[] = [
  { id: 'kettle', name: 'Kettle' },
  { id: 'bell', name: 'Bell on a spring' },
  { id: 'clock', name: 'Grandfather clock' },
  { id: 'wheel', name: 'Roller' },
  { id: 'strider', name: 'Strider' },
  { id: 'anvil', name: 'Anvil' },
  { id: 'lantern', name: 'Lantern' },
  { id: 'cauldron', name: 'Cauldron' },
  { id: 'ball', name: 'Ball-roller' },
  { id: 'bellows', name: 'Bellows' },
];
/**
 * THE THIRD TEN (his word, 24 Oct, by 08:08: “Better, I like the direction, but it’s still just two big arms.  Let’s get a
 * little more creative.  10 more”): each hits in its own way, few of them with two fists.
 */
export const GOLEM_BUILDS_3: { id: GolemBuild; name: string }[] = [
  { id: 'onearm', name: 'One giant arm' },
  { id: 'mallets', name: 'Mallet arms' },
  { id: 'flails', name: 'Chain flails' },
  { id: 'jack', name: 'Jack-in-the-box punch' },
  { id: 'crane', name: 'Wrecking ball' },
  { id: 'ram', name: 'Battering ram' },
  { id: 'hoses', name: 'Steam hoses' },
  { id: 'pincers', name: 'Pincers' },
  { id: 'paddles', name: 'Paddle wheel' },
  { id: 'tongs', name: 'Scissor arms' },
];
/** Dark wood, a clock's case. */
const WOOD: Ramp = ['#140806', '#2a120c', '#4a2216', '#6e3a22', '#965834'];
/** A clock's dial, old enamel. */
const DIAL: Ramp = ['#4a4038', '#7a6e60', '#b8ac98', '#e6dcc4', '#fff8e8'];

/** A Golem, sculpted, standing ready, in one of the game's views; `turn`: truly turned (Sculpt.spin) this many degrees. */
/**
 * `charge` and `level` (its CHARGED SHOTS, dev/golem_moves.ts GCHARGE_SHELL and GCHARGE_BEAM; naught as the game draws it, and
 * then it is drawn as it always was): `charge` 0 to 1, how far its gun is charged (the cannon's hoops lit one by one in the
 * friend's cyan, from the breech to the muzzle; the coil's windings lit from its base to its tip), and cooling back down
 * through the same; `level` 0 to 1, how far its gun is brought down from its firing line to dead level at what it fires at.
 */
export function sculptGolemBuild(view: GameView, build: GolemBuild, turn = 0, yaw0 = -14, giant = false, gun: GolemGun = GOLEM_GUN.gun, aim = 0, kick = 0, charge = 0, level = 0): Drawn {
  const sc = new Sculpt();
  GOLEM_VENTS.pts = [];
  GOLEM_VENTS.ways = [];
  // (a few are best seen from the side: the ram charging)
  const yaw = yaw0 + (YAW_OF[build] ?? 0);
  sc.spin = turn;
  // (built facing as it stands, toward the eye's lower right turned by `yaw`; its left the picture's upper right)
  const F0 = norm([1, -1, 0]);
  const L0 = norm([1, 1, 0]);
  const a = yaw * D;
  const F = add(mul(F0, Math.cos(a)), mul(L0, Math.sin(a)));
  const L = add(mul(F0, -Math.sin(a)), mul(L0, Math.cos(a)));
  const U: V3 = [0, 0, 1];
  const P = (f: number, l: number, u: number): V3 => add(add(mul(F, f), mul(L, l)), mul(U, u));
  const X = (rf: number, rl: number, ru: number): readonly [V3, V3, V3] => [mul(F, rf), mul(L, rl), mul(U, ru)];
  /** Its far side from the eye: a step darker, as the heroes' far limbs are. */
  const tr = (p: V3): V3 => {
    const c = Math.cos(turn * D);
    const s = Math.sin(turn * D);
    return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
  };
  const nearOf = (p: V3): number => {
    const q = tr(p);
    return view === 'front' ? 0.612 * (q[0] - q[1]) + 0.5 * q[2] : 0.612 * (q[1] - q[0]) + 0.5 * q[2];
  };
  const farL = nearOf(P(0, 20, 40)) < nearOf(P(0, 0, 40));
  const far = (piece: string): number => (piece.endsWith('L') ? (farL ? 1 : 0) : piece.endsWith('R') ? (farL ? 0 : 1) : 0);

  // ITS BRASS: banded and riveted; a band's seam dark, a row of rivets lit above it
  const brass = sc.mat({
    ramp: BRASS,
    paint: (h) => {
      const k = far(h.prim.piece);
      const tg = h.prim.tag ?? '';
      if (tg === 'drum' || tg === 'hull' || tg === 'shell') {
        const band = ((h.p[2] % 7) + 7) % 7;
        if (band < 0.7) return shadeOf(BRASS, h.tone - 2 - k);
        if (band < 1.5 && h.x % 3 === 0) return shadeOf(BRASS, h.tone + 1 - k);
      }
      if (tg === 'gauntlet' || tg === 'greave') {
        const t = onCone(h.prim as Cone, h.p, U).t;
        if (Math.floor(t * 4) % 2 === 1 && (t * 4) % 1 < 0.22) return shadeOf(BRASS, h.tone - 2 - k);
      }
      if (tg === 'plate') {
        const b = onBall(h.prim as Ell, h.p);
        if (b[2] < -0.55) return shadeOf(BRASS, h.tone - 1 - k);
        if (b[2] < -0.3 && h.x % 3 === 0) return shadeOf(BRASS, h.tone + 1 - k);
      }
      if (tg === 'fist') {
        // its fingers: the knuckles' face ridged across, a finger to each ridge
        const b = onBall(h.prim as Box, h.p);
        if (b[0] > 0.3 && Math.floor((b[2] + 1) * 2) % 2 === 0) return shadeOf(BRASS, h.tone - 1 - k);
      }
      return k ? shadeOf(BRASS, h.tone - 1) : null;
    },
  });
  const steel = sc.mat({ ramp: STEEL5, paint: (h) => (far(h.prim.piece) ? shadeOf(STEEL5, h.tone - 1) : null) });
  const copper = sc.mat({
    ramp: COPPER,
    paint: (h) => {
      if (h.prim.tag === 'stack' && h.prim.k === 'cone' && Math.floor(onCone(h.prim, h.p, U).t * 5) % 2 === 0) return shadeOf(COPPER, h.tone - 1);
      return far(h.prim.piece) ? shadeOf(COPPER, h.tone - 1) : null;
    },
  });
  const dark = sc.mat({ ramp: DARK, paint: (h) => (h.prim.tag === 'grille' && h.x % 2 === 0 ? STEEL5[2] : null) });
  // (ITS LIGHT GOING OUT, GOLEM_POSE.dim: none as it stands; a step down, two, and dark glass, as it winds down)
  const dimK = GOLEM_POSE.dim;
  const glow = sc.mat({ ramp: CYAN, paint: (h) => (dimK > 0 ? dimmed(h.tone >= 2 ? 1 : 0, dimK) : h.tone >= 2 ? '#e8ffff' : CYAN[2]) });
  // (a coil's copper wound tight: a dark line between each turn)
  const coil = sc.mat({
    ramp: COPPER,
    paint: (h) => {
      if (h.prim.k !== 'cone') return null;
      const t = onCone(h.prim, h.p, U).t;
      const gap = Math.floor(t * 9) % 2 === 0;
      // (CHARGING, `charge`: the light between its windings lit from its base up, cyan, white-hot at its full)
      if (charge > 0 && gap) {
        const lit = litOf(charge, (Math.floor(t * 9) + 0.5) / 9);
        if (lit > 0) return LIT[Math.min(3, lit + (h.tone >= 3 ? 1 : 0))];
      }
      return gap ? shadeOf(COPPER, h.tone - 2) : shadeOf(COPPER, h.tone + (far(h.prim.piece) ? -1 : 0));
    },
  });
  // (a hoop of its cannon lit as it charges: the friend's cyan, shaded as brass is, white-hot at its full)
  const hot = sc.mat({ ramp: CYAN, paint: (h) => LIT[Math.max(1, Math.min(3, h.tone - 1))] });
  const warm = sc.mat({ ramp: CYAN, paint: (h) => LIT[h.tone >= 3 ? 1 : 0] });
  const white = sc.mat({ ramp: CYAN, paint: (h) => LIT[Math.max(2, Math.min(3, h.tone))] });
  // ITS HEART: a round furnace window, the friend's cyan behind it, the spokes of a gear turning in the light
  const heart = sc.mat({
    ramp: CYAN,
    paint: (h) => {
      const b = onBall(h.prim as Ell, h.p);
      const ang = Math.atan2(b[1], b[2]);
      const r = Math.hypot(b[1], b[2]);
      if (r > 0.42 && r < 0.74 && Math.floor(((ang + Math.PI) * 10) / Math.PI) % 2 === 0) return BRASS[1];
      if (r < 0.2) return BRASS[1];
      if (dimK > 0) return dimmed(r < 0.42 ? 1 : 0, dimK);
      return r < 0.42 ? '#e8ffff' : CYAN[3];
    },
  });

  /** A round window with its heart behind it, on a surface facing `n` at `c`, `r` across. */
  const heartAt = (piece: string, c: V3, n: V3, r: number): void => {
    const s1 = norm(cross(U, n));
    const s2 = norm(cross(n, s1));
    sc.ell(copper, piece, c, [mul(n, 1.6), mul(s1, r + 1.1), mul(s2, r + 1.1)], 0.3, { tag: 'bezel' });
    sc.ell(heart, piece, add(c, mul(n, 0.8)), [mul(n, 1.1), mul(s1, r), mul(s2, r)], 0.1, { tag: 'window' });
  };
  /** A stack on its back: copper, banded, a brass cap. */
  const stackAt = (piece: string, base: V3, top: V3, r: number): void => {
    sc.cone(copper, piece, base, top, r, r * 1.12, 0.4, { tag: 'stack' });
    sc.cone(brass, piece, add(top, mul(U, -0.4)), add(top, mul(U, 0.6)), r * 1.5, r * 1.5, 0.2, { tag: 'cap' });
    sc.cone(dark, piece, add(top, mul(U, 0.5)), add(top, mul(U, 0.9)), r * 0.85, r * 0.85, 0, { tag: 'mouth' });
  };
  /** A HUGE FIST: its knuckles out along `d`, its thumb toward `th`; `R` its half-size (bigger than a hero's head). */
  // (GIANT: his “I like the one big arm.  Can I get the one big arm on a bunch of golems”, 24 Oct, by 08:55: its own arms
  // left off, where each was rooted kept, and one giant arm put on its right, a little tool arm on its left)
  const roots: Record<string, V3> = {};
  const fistAt = (piece: string, c: V3, d: V3, th: V3, R: number): void => {
    if (giant && !piece.startsWith('giant')) return;
    const s1 = norm(sub(th, mul(d, th[0] * d[0] + th[1] * d[1] + th[2] * d[2])));
    const s2 = norm(cross(d, s1));
    sc.box(brass, piece, c, [mul(d, R * 0.95), mul(s1, R * 0.92), mul(s2, R)], R * 0.42, 0.6, { tag: 'fist' });
    sc.ell(brass, piece, add(c, add(mul(s1, R * 0.95), mul(d, R * 0.1))), [mul(d, R * 0.55), mul(s1, R * 0.4), mul(s2, R * 0.42)], 0.5, { tag: 'thumb' });
    sc.box(steel, piece, add(c, mul(d, -R * 0.95)), [mul(d, R * 0.24), mul(s1, R * 0.98), mul(s2, R * 1.04)], R * 0.18, 0.2, { tag: 'cuff' });
  };
  /** AN ARM of pistons: a steel ball at its root, a steel rod with a copper piston along it, a steel elbow, a flaring brass gauntlet. */
  const armOf = (piece: string, root: V3, el: V3, wrist: V3, r: number, side?: V3): void => {
    if (giant && !piece.startsWith('giant')) {
      roots[piece] ??= root;
      return;
    }
    sc.ell(steel, piece, root, X(r * 1.45, r * 1.45, r * 1.45), 0.5, { tag: 'ball' });
    sc.cone(steel, piece, root, el, r, r * 0.85, 0.5, { tag: 'upper' });
    const d = norm(sub(el, root));
    // (its piston along the outer side of its upper arm: or along `side`, the side it is fixed to as the arm swings)
    const o = side ?? norm(cross(d, F));
    sc.cone(copper, piece, add(lerp3(root, el, 0.2), mul(o, r * 0.95)), add(lerp3(root, el, 0.92), mul(o, r * 0.95)), r * 0.3, r * 0.3, 0.2, { tag: 'piston' });
    sc.ell(steel, piece, el, X(r * 1.1, r * 1.1, r * 1.1), 0.4, { tag: 'joint' });
    sc.cone(brass, piece, el, wrist, r * 1.05, r * 1.5, 0.4, { tag: 'gauntlet' });
  };
  /** A LEG: a steel thigh, a brass knee, a greave flaring to a great flat steel foot on the floor. */
  const legOf = (piece: string, hip: V3, knee: V3, ankle0: V3, r: number, footLen: number, lift = 0): void => {
    // (the ankle kept high enough that its greave stands on the foot, not through the floor; the foot lifted with it as it steps)
    const ankle: V3 = [ankle0[0], ankle0[1], Math.max(ankle0[2], r * 1.2 + 0.3 + lift)];
    sc.cone(steel, piece, hip, knee, r, r * 0.85, 0.5, { tag: 'thigh' });
    sc.ell(brass, piece, knee, X(r * 0.95, r * 0.95, r * 0.95), 0.3, { tag: 'kneecap' });
    sc.cone(brass, piece, knee, ankle, r * 0.95, r * 1.2, 0.4, { tag: 'greave' });
    const foot: V3 = [ankle[0], ankle[1], lift];
    const fd = norm([F[0], F[1], 0]);
    const fs = norm(cross(U, fd));
    sc.box(steel, piece, add(add(foot, mul(fd, footLen * 0.35)), [0, 0, r * 0.5]), [mul(fd, footLen), mul(fs, r * 1.25), mul(U, r * 0.5)], r * 0.35, 0.5, { tag: 'foot' });
  };
  /** An eye: a lens of the friend's cyan in a steel ring. */
  const eyeAt = (piece: string, c: V3, n: V3, r: number): void => {
    const s1 = norm(cross(U, n));
    const s2 = norm(cross(n, s1));
    sc.ell(steel, piece, c, [mul(n, r * 0.6), mul(s1, r * 1.35), mul(s2, r * 1.35)], 0.2, { tag: 'ring' });
    sc.ell(glow, piece, add(c, mul(n, r * 0.4)), [mul(n, r * 0.5), mul(s1, r), mul(s2, r)], 0.05, { tag: 'lens' });
  };

  /** A ring (a hoop, a rim, a tire): `n` short rods round a circle of radius `R` in the plane of `a1` and `a2`. */
  const ringOf = (mat: number, piece: string, c: V3, a1: V3, a2: V3, R: number, r: number, n: number, tag: string): void => {
    let prev: V3 | null = null;
    for (let i = 0; i <= n; i++) {
      const th = (i / n) * Math.PI * 2;
      const p = add(c, add(mul(a1, Math.cos(th) * R), mul(a2, Math.sin(th) * R)));
      if (prev) sc.cone(mat, piece, prev, p, r, r, 0.5, { tag });
      prev = p;
    }
  };
  if (build === 'ape') {
    // THE BOILER APE: a great boiler for a body, leaning forward over its fists; it walks on its knuckles, its fists on the
    // floor before it; short stumpy legs behind; no head but a turret sunk between its shoulders, one eye; two stacks
    sc.cone(brass, 'torso', P(-10, 0, 32), P(6, 0, 50), 12, 15, 2.0, { tag: 'drum' });
    sc.ell(brass, 'torso', P(4, 0, 58), X(11, 20, 8), 2.6, { tag: 'chest' });
    for (const side of [1, -1]) sc.ell(brass, 'torso', P(4, side * 18, 59), X(8, 6, 7), 0.6, { tag: 'plate' });
    sc.ell(steel, 'hips', P(-7, 0, 28), X(10, 12, 7), 1.6, { tag: 'pelvis' });
    heartAt('torso', P(17, 0, 42), norm(add(F, mul(U, -0.25))), 5.2);
    // the turret: a squat dome sunk between its shoulders, a grille under its one eye
    sc.ell(brass, 'head', P(14, 0, 64), X(6.5, 7, 5.5), 1.4, { tag: 'shell' });
    sc.box(dark, 'head', P(19.6, 0, 61.6), X(0.8, 4.4, 1.4), 0.4, 0.1, { tag: 'grille' });
    eyeAt('head', P(19.2, 0, 66.2), F, 2.4);
    // the arms: long, from great shoulder balls, down to the fists set on the floor before it
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'armL' : 'armR';
      armOf(piece, P(6, side * 21, 56), P(16, side * 28, 36), P(24, side * 25, 15), 3.6);
      fistAt(piece, P(25, side * 24.5, 7.4), mul(U, -1), mul(L, -side), 7.4);
    }
    for (const side of [1, -1]) {
      // (its feet where they stand; or, as it walks, each set forward or back and lifted (GOLEM_POSE.feet), its knee bent
      // forward between its hip and its ankle as a knee bends)
      const [df, dz] = side > 0 ? [GOLEM_POSE.feet[0], GOLEM_POSE.feet[1]] : [GOLEM_POSE.feet[2], GOLEM_POSE.feet[3]];
      if (GOLEM_POSE.crumple > 0) {
        // (ITS LEGS GIVING OUT under it, GOLEM_POSE.crumple, 0 to 1: each hip going where its leaning, sinking body takes
        // it, its foot where it stands, its knee buckled forward between them; from its legs as they stand)
        const c = Math.min(1, GOLEM_POSE.crumple);
        const la = (GOLEM_POSE.lean * Math.PI) / 180;
        const hf = -12 + (-7 - 5 * Math.cos(la) + 12) * c;
        const hu = 28 + (5 * Math.sin(la) + GOLEM_POSE.bob) * c;
        const [kf0, ku0] = kneeFor([hf, hu], [-13, 5], 13.9, 11.2);
        const kf = -8 + (kf0 + 8) * c;
        const ku = 15 + (ku0 - 15) * c;
        legOf(side > 0 ? 'legL' : 'legR', P(hf, side * 9, hu), P(kf, side * 12, ku), P(-13, side * 12, 5), 4.4, 6.5);
        continue;
      }
      if (!df && !dz) {
        legOf(side > 0 ? 'legL' : 'legR', P(-12, side * 9, 28), P(-8, side * 12, 15), P(-13, side * 12, 5), 4.4, 6.5);
        continue;
      }
      const [kf, ku] = kneeFor([-12, 28], [-13 + df, 5 + dz], 13.9, 11.2);
      legOf(side > 0 ? 'legL' : 'legR', P(-12, side * 9, 28), P(kf, side * 12, ku), P(-13 + df, side * 12, 5 + dz), 4.4, 6.5, dz);
    }
    for (const side of [1, -1]) stackAt('stacks', P(-6, side * 7, 60), P(-9, side * 8, 80), 2.4);
  } else if (build === 'tank') {
    // THE TREAD TANK: no legs, a pair of tracks under a deck; on it a boiler drum standing up, a dome over it with one great
    // eye; piston arms out of its sides, huge fists; a stack behind
    const treads = sc.mat({
      ramp: ['#100c18', '#1e1a2c', '#2e2a44', '#48446a', '#6a6690'],
      paint: (h) => {
        // the links of the track, across it
        const b = onBall(h.prim as Box, h.p);
        if (Math.abs(b[2]) > 0.55 && Math.floor((b[0] + 1) * 9) % 2 === 0) return STEEL5[Math.max(0, Math.min(4, h.tone))];
        return null;
      },
    });
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'treadL' : 'treadR';
      sc.box(treads, piece, P(0, side * 12, 7), X(17, 5.2, 7), 6.4, 0.2, { tag: 'track' });
      for (const fw of [-10, 0, 10]) sc.ell(brass, piece, P(fw, side * 17.4, 7), X(3.8, 0.9, 3.8), 0.2, { tag: 'wheel' });
    }
    sc.box(brass, 'hull', P(0, 0, 14), X(13, 13, 3.4), 1.6, 0.6, { tag: 'hull' });
    sc.cone(brass, 'torso', P(0, 0, 17), P(1, 0, 46), 13, 12, 1.4, { tag: 'drum' });
    sc.ell(brass, 'torso', P(1, 0, 46), X(12, 12, 11), 1.2, { tag: 'chest' });
    heartAt('torso', P(13, 0, 30), F, 5.6);
    // the dome, its eye
    sc.ell(steel, 'head', P(2, 0, 55), X(7, 7.5, 6), 1.2, { tag: 'shell' });
    eyeAt('head', P(8.6, 0, 56), F, 3.3);
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'armL' : 'armR';
      sc.ell(brass, piece, P(1, side * 13.5, 46), X(6.5, 3.5, 6), 0.4, { tag: 'plate' });
      armOf(piece, P(1, side * 15, 41), P(4, side * 26, 32), P(13, side * 23, 34), 3.2);
      fistAt(piece, P(19, side * 21, 35), F, U, 6.4);
    }
    stackAt('stacks', P(-10, 0, 44), P(-12, 0, 76), 2.6);
  } else if (build === 'belly') {
    // THE FURNACE BELLY: a round stove of brass on two short bowed legs; no head: its furnace is its face, a grate of a
    // grin with the cyan fire behind, two lamps for eyes over it; short arms out of its sides, huge fists hanging; a
    // stovepipe out of its top
    sc.ell(brass, 'torso', P(0, 0, 42), X(16, 18, 19), 2.0, { tag: 'drum' });
    sc.ell(brass, 'torso', P(0, 0, 42), X(17.2, 19.2, 3.0), 0.6, { tag: 'chest' });
    sc.ell(steel, 'hips', P(-2, 0, 26), X(10, 12, 6), 1.6, { tag: 'pelvis' });
    // the mouth: a grate across its front, the fire behind
    const mouthC = P(15.2, 0, 36);
    sc.box(dark, 'torso', mouthC, X(2.2, 9.4, 3.6), 1.4, 0.2, { tag: 'grille' });
    sc.box(glow, 'torso', add(mouthC, P(-0.6, 0, 0)), X(1.8, 8.4, 2.6), 1.0, 0, { tag: 'fire' });
    for (let i = -3; i <= 3; i++) sc.cone(steel, 'torso', P(16.2, i * 2.4, 32.4), P(16.2, i * 2.4, 39.6), 0.45, 0.45, 0.1, { tag: 'bar' });
    for (const side of [1, -1]) eyeAt('torso', P(13.4, side * 6.2, 50), norm(add(F, mul(L, side * 0.25))), 2.3);
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'armL' : 'armR';
      armOf(piece, P(0, side * 18, 44), P(5, side * 25, 31), P(9, side * 25, 20), 3.2);
      fistAt(piece, P(11, side * 25, 13.6), norm(add(mul(U, -1), mul(F, 0.3))), mul(L, -side), 6.8);
    }
    for (const side of [1, -1]) legOf(side > 0 ? 'legL' : 'legR', P(-2, side * 8, 26), P(3, side * 12, 14), P(0, side * 12, 5), 4.4, 6);
    stackAt('stacks', P(-4, 0, 58), P(-6, 0, 82), 2.6);
  } else if (build === 'crab') {
    // THE CRAB WALKER: a broad carapace of brass on four jointed legs, its two fists held up before it like a crab's claws;
    // a row of eyes along its front; a stack on its back
    sc.ell(brass, 'torso', P(0, 0, 36), X(17, 19, 10), 2.0, { tag: 'shell' });
    sc.ell(brass, 'torso', P(-2, 0, 44), X(12, 14, 6.5), 1.6, { tag: 'chest' });
    sc.ell(steel, 'hips', P(0, 0, 29), X(11, 12, 4), 1.2, { tag: 'pelvis' });
    heartAt('torso', P(-2, 0, 49.5), U, 5);
    for (const side of [-1, 0, 1]) eyeAt('torso', P(14.2, side * 5, 37.5), norm(add(F, mul(L, side * 0.4))), 1.8);
    // four legs: up and out from under the shell, a knee high, down to a pointed foot on the floor
    for (const [fw, sd] of [[8, 1], [8, -1], [-9, 1], [-9, -1]] as const) {
      const piece = `leg${fw > 0 ? 'F' : 'B'}${sd > 0 ? 'l' : 'r'}`;
      const hip = P(fw * 0.9, sd * 14, 32);
      const knee = P(fw * 1.6, sd * 25, 40);
      const foot = P(fw * 1.9, sd * 30, 0.9);
      sc.ell(steel, piece, hip, X(3.4, 3.4, 3.4), 0.3, { tag: 'ball' });
      sc.cone(steel, piece, hip, knee, 3.4, 3.0, 0.4, { tag: 'thigh' });
      sc.ell(brass, piece, knee, X(3.6, 3.6, 3.6), 0.2, { tag: 'kneecap' });
      sc.cone(brass, piece, knee, foot, 3.2, 1.4, 0.4, { tag: 'greave' });
    }
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'armL' : 'armR';
      armOf(piece, P(12, side * 11, 40), P(18, side * 18, 52), P(23, side * 15, 62), 3.0);
      fistAt(piece, P(25, side * 14.5, 68), norm(add(U, mul(F, 0.5))), mul(L, -side), 6.4);
    }
    stackAt('stacks', P(-10, 0, 44), P(-13, 0, 64), 2.4);
  } else if (build === 'kettle') {
    // THE KETTLE: a great squat kettle of copper and brass on three stove legs; its spout its snout, steam at its tip; its
    // lid a dome, its handle an arch over its back; two lamps for eyes; fists out of its sides
    sc.ell(copper, 'torso', P(0, 0, 38), X(16, 16, 13), 2.0, { tag: 'drum' });
    sc.ell(brass, 'torso', P(0, 0, 38), X(16.8, 16.8, 1.6), 0.4, { tag: 'chest' });
    sc.ell(brass, 'torso', P(0, 0, 49), X(10, 10, 4), 1.0, { tag: 'shell' });
    sc.ell(brass, 'torso', P(0, 0, 54.5), X(2.6, 2.6, 2.6), 0.4, { tag: 'knob' });
    sc.cone(copper, 'snout', P(12, 0, 38), P(27, 0, 50), 4.0, 1.9, 1.2, { tag: 'spout' });
    sc.cone(brass, 'snout', P(26.5, 0, 49.5), P(28, 0, 51), 2.3, 2.3, 0.2, { tag: 'tip' });
    const handle = [P(-8, 0, 48), P(-14, 0, 58), P(-22, 0, 52), P(-22, 0, 38), P(-15, 0, 30)];
    for (let i = 0; i + 1 < handle.length; i++) sc.cone(steel, 'handle', handle[i], handle[i + 1], 1.4, 1.4, 0.6, { tag: 'handle' });
    for (const side of [1, -1]) eyeAt('torso', P(13.6, side * 5.4, 44), norm(add(F, mul(L, side * 0.3))), 2.0);
    for (let i = 0; i < 3; i++) {
      const ang = (i / 3) * Math.PI * 2 + Math.PI / 3;
      const dir = add(mul(F, Math.cos(ang)), mul(L, Math.sin(ang)));
      const piece = ['legA', 'legB', 'legC'][i];
      const hip = add(P(0, 0, 28), mul(dir, 9));
      const foot = add(P(0, 0, 0), mul(dir, 16));
      sc.cone(steel, piece, hip, add(foot, mul(U, 1.6)), 2.6, 1.8, 0.4, { tag: 'shin' });
      sc.ell(brass, piece, add(foot, mul(U, 1.6)), X(3.2, 3.2, 1.6), 0.3, { tag: 'foot' });
    }
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'armL' : 'armR';
      armOf(piece, P(0, side * 16, 40), P(4, side * 24, 30), P(10, side * 23, 22), 3.0);
      fistAt(piece, P(14, side * 21, 18), norm(add(F, mul(U, -0.6))), mul(L, -side), 6.0);
    }
  } else if (build === 'bell') {
    // THE BELL ON A SPRING: a great brass bell for a body, hopping on one coiled spring; a slit of cyan light across its
    // front for its eye; its clapper hanging under it; long arms from its shoulders, fists swinging
    sc.cone(brass, 'torso', P(0, 0, 70), P(0, 0, 40), 7.5, 15.5, 2.6, { tag: 'drum', cuts: [{ n: mul(U, -1), o: -39 }] });
    sc.ell(brass, 'torso', P(0, 0, 70), X(7.5, 7.5, 4.5), 1.6, { tag: 'shell' });
    sc.cone(brass, 'torso', P(0, 0, 76), P(0, 0, 79.5), 2.6, 2.0, 0.6, { tag: 'crown' });
    sc.ell(brass, 'torso', P(0, 0, 38.5), X(17.5, 17.5, 2.2), 0.6, { tag: 'chest' });
    sc.box(dark, 'torso', P(12.6, 0, 56), X(1.2, 7.4, 1.6), 0.6, 0.1, { tag: 'slit' });
    sc.box(glow, 'torso', P(12.9, 0, 56), X(0.9, 6.6, 1.0), 0.4, 0, { tag: 'lens' });
    sc.ell(steel, 'clapper', P(0, 0, 33), X(4.2, 4.2, 4.2), 0.4, { tag: 'clapper' });
    // the spring: a helix of steel down to a foot plate on the floor
    const turns = 5;
    let prev: V3 | null = null;
    for (let i = 0; i <= turns * 12; i++) {
      const th = (i / 12) * Math.PI * 2;
      const p = add(P(0, 0, 4 + (i / (turns * 12)) * 26), add(mul(F, Math.cos(th) * 5.5), mul(L, Math.sin(th) * 5.5)));
      if (prev) sc.cone(steel, 'spring', prev, p, 1.15, 1.15, 0.3, { tag: 'coil' });
      prev = p;
    }
    sc.box(brass, 'spring', P(0, 0, 1.4), X(8, 8, 1.4), 0.8, 0.4, { tag: 'foot' });
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'armL' : 'armR';
      armOf(piece, P(0, side * 10, 66), P(2, side * 22, 54), P(6, side * 25, 34), 2.8);
      fistAt(piece, P(9, side * 24.5, 27), mul(U, -1), mul(L, -side), 6.2);
    }
  } else if (build === 'clock') {
    // THE GRANDFATHER CLOCK: a tall case of dark wood bound in brass, its dial its face, its pendulum swinging behind a
    // window of cyan glass; it walks on four bun feet; long arms out of its sides
    const wood = sc.mat({ ramp: WOOD, paint: (h) => ((h.x + Math.floor(h.y / 3)) % 7 === 0 ? shadeOf(WOOD, h.tone - 1) : null) });
    sc.box(wood, 'torso', P(0, 0, 44), X(7.5, 9.5, 26), 1.2, 0.4, { tag: 'drum' });
    sc.box(wood, 'torso', P(0, 0, 72.5), X(9, 11, 3), 1.0, 0.4, { tag: 'chest' });
    sc.ell(wood, 'torso', P(0, 0, 75), X(6, 9.5, 5), 0.6, { tag: 'shell' });
    sc.box(brass, 'torso', P(0, 0, 18.5), X(8.5, 10.5, 1.4), 0.6, 0.2, { tag: 'trim' });
    sc.box(brass, 'torso', P(0, 0, 69.2), X(8.3, 10.3, 0.8), 0.4, 0.2, { tag: 'trim' });
    const dial = sc.mat({
      ramp: DIAL,
      paint: (h) => {
        const b = onBall(h.prim as Ell, h.p);
        const r = Math.hypot(b[1], b[2]);
        const ang = Math.atan2(b[2], b[1]);
        // its hours round its edge, its two hands, the cyan at its heart
        if (r > 0.78 && Math.floor(((ang + Math.PI) * 6) / Math.PI) % 2 === 0) return DARK[1];
        if (r < 0.22) return h.tone >= 2 ? '#e8ffff' : CYAN[3];
        if ((Math.abs(b[1]) < 0.09 && b[2] > 0 && b[2] < 0.62) || (Math.abs(b[2] + b[1] * 0.4) < 0.09 && b[1] > 0 && b[1] < 0.5)) return DARK[0];
        return null;
      },
    });
    sc.ell(brass, 'torso', P(7.2, 0, 60), X(1.4, 7.6, 7.6), 0.2, { tag: 'bezel' });
    sc.ell(dial, 'torso', P(7.9, 0, 60), X(1.0, 6.6, 6.6), 0.1, { tag: 'dial' });
    sc.box(brass, 'torso', P(7.2, 0, 36), X(0.8, 6, 12), 0.4, 0.1, { tag: 'trim' });
    sc.box(heart, 'torso', P(7.6, 0, 36), X(0.6, 5, 11), 0.3, 0, { tag: 'window' });
    sc.cone(brass, 'torso', P(8.4, 0, 46), P(8.4, 0, 31), 0.4, 0.4, 0.1, { tag: 'rod' });
    sc.ell(brass, 'torso', P(8.6, 0, 30), X(0.6, 3.0, 3.0), 0.1, { tag: 'bob' });
    for (const [fw, sd] of [[5, 7], [5, -7], [-5, 7], [-5, -7]] as const) sc.ell(brass, `foot${fw > 0 ? 'F' : 'B'}${sd > 0 ? 'l' : 'r'}`, P(fw, sd, 9), X(4, 4, 9), 0.4, { tag: 'bun' });
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'armL' : 'armR';
      armOf(piece, P(0, side * 11, 62), P(4, side * 20, 46), P(8, side * 20, 26), 2.6);
      fistAt(piece, P(10, side * 19.5, 18), norm(add(mul(U, -1), mul(F, 0.2))), mul(L, -side), 6.0);
    }
  } else if (build === 'wheel') {
    // THE ROLLER: a great iron roller for its feet, a boiler drum riding on it between two brass forks; a dome on top with
    // one eye, a stack behind; its arms thrown out, huge fists
    const iron = sc.mat({ ramp: DARK, paint: (h) => (Math.floor(h.p[2] * 0.9) % 2 === 0 && h.tone >= 2 ? DARK[Math.min(4, h.tone + 1)] : null) });
    sc.cone(iron, 'roller', P(0, -10, 12), P(0, 10, 12), 11.6, 11.6, 0.4, { tag: 'roller', cuts: [{ n: L, o: 10 }, { n: mul(L, -1), o: 10 }] });
    for (const side of [1, -1]) {
      ringOf(brass, 'roller', P(0, side * 10, 12), F, U, 11, 1.2, 20, 'rim');
      sc.ell(brass, 'roller', P(0, side * 10.4, 12), X(3.2, 1.2, 3.2), 0.3, { tag: 'hub' });
      sc.cone(steel, 'fork', P(0, side * 11.6, 12), P(0, side * 10, 36), 1.6, 1.6, 0.4, { tag: 'fork' });
    }
    sc.cone(brass, 'torso', P(0, 0, 34), P(0, 0, 56), 11, 11.5, 1.2, { tag: 'drum' });
    sc.ell(brass, 'torso', P(0, 0, 34), X(11.5, 11.5, 3.6), 1.0, { tag: 'chest' });
    sc.ell(steel, 'head', P(0, 0, 57), X(9, 9, 6.5), 1.0, { tag: 'shell' });
    eyeAt('head', P(7.4, 0, 59), F, 2.8);
    heartAt('torso', P(11.2, 0, 44), F, 4.2);
    stackAt('stacks', P(-9, 0, 50), P(-11, 0, 72), 2.2);
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'armL' : 'armR';
      armOf(piece, P(0, side * 12, 51), P(4, side * 22, 44), P(10, side * 24, 36), 2.8);
      fistAt(piece, P(13, side * 23.5, 32), norm(add(F, mul(U, -0.4))), U, 6.0);
    }
  } else if (build === 'strider') {
    // THE STRIDER: a long boiler carried level on two long legs that bend backward like a bird's; a lamp of an eye at its
    // front end, a stack at its back; short arms under its front, big fists
    sc.cone(brass, 'torso', P(-13, 0, 54), P(11, 0, 57), 9.5, 10.5, 1.4, { tag: 'drum' });
    sc.ell(brass, 'torso', P(12, 0, 57), X(4.5, 10.5, 10.5), 1.2, { tag: 'chest' });
    sc.ell(steel, 'hips', P(-2, 0, 46), X(8, 9, 5), 1.2, { tag: 'pelvis' });
    eyeAt('torso', P(16, 0, 59), F, 3.4);
    sc.box(dark, 'torso', P(16, 0, 52.4), X(1.4, 6, 1.6), 0.5, 0.2, { tag: 'grille' });
    stackAt('stacks', P(-12, 0, 62), P(-16, 0, 80), 2.4);
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'legL' : 'legR';
      const hip = P(-2, side * 8, 46);
      const knee = P(6, side * 10, 32);
      const hock = P(-6, side * 10, 15);
      const foot = P(2, side * 10, 0);
      sc.ell(steel, piece, hip, X(3.6, 3.6, 3.6), 0.3, { tag: 'ball' });
      sc.cone(steel, piece, hip, knee, 3.3, 2.7, 0.5, { tag: 'thigh' });
      sc.ell(brass, piece, knee, X(3.2, 3.2, 3.2), 0.3, { tag: 'kneecap' });
      sc.cone(brass, piece, knee, hock, 2.7, 2.2, 0.4, { tag: 'shin' });
      sc.ell(steel, piece, hock, X(2.4, 2.4, 2.4), 0.3, { tag: 'joint' });
      sc.cone(steel, piece, hock, add(foot, mul(U, 1.4)), 2.0, 1.6, 0.4, { tag: 'shank' });
      for (const toe of [-0.5, 0, 0.5]) sc.cone(brass, piece, add(foot, mul(U, 1.4)), add(foot, add(mul(F, 6 * Math.cos(toe)), add(mul(L, 6 * Math.sin(toe)), mul(U, 0.9)))), 1.4, 0.7, 0.3, { tag: 'toe' });
      sc.cone(brass, piece, add(foot, mul(U, 1.4)), add(foot, add(mul(F, -4), mul(U, 0.9))), 1.2, 0.7, 0.3, { tag: 'toe' });
    }
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'armL' : 'armR';
      armOf(piece, P(8, side * 9, 50), P(13, side * 13, 41), P(19, side * 12, 37), 2.4);
      fistAt(piece, P(23, side * 11.5, 36), F, U, 5.4);
    }
  } else if (build === 'anvil') {
    // THE ANVIL: an iron anvil for a body, top-heavy, its horn thrust forward; a slit of cyan in its waist; short thick legs;
    // great hammer fists hanging from under its face
    const iron = sc.mat({ ramp: STEEL5, paint: (h) => ((h.x * 3 + h.y) % 11 === 0 ? shadeOf(STEEL5, h.tone - 1) : far(h.prim.piece) ? shadeOf(STEEL5, h.tone - 1) : null) });
    // (its long way across it, the horn out to its right where it is seen)
    sc.box(iron, 'torso', P(0, 0, 58), X(9.5, 15, 5.5), 1.6, 0.4, { tag: 'chest' });
    sc.cone(iron, 'torso', P(0, -14, 59), P(0, -30, 61.5), 6, 0.9, 1.0, { tag: 'horn' });
    sc.box(iron, 'torso', P(-1, 0, 46), X(6, 8, 7.5), 2.0, 2.0, { tag: 'drum' });
    sc.box(iron, 'hips', P(-1, 0, 35), X(10, 13, 4), 1.4, 1.6, { tag: 'pelvis' });
    sc.box(brass, 'torso', P(0, 0, 63.6), X(9, 14.4, 0.5), 0.3, 0.1, { tag: 'face' });
    sc.box(dark, 'torso', P(5.3, 0, 47), X(0.8, 5, 1.5), 0.5, 0.1, { tag: 'slit' });
    sc.box(glow, 'torso', P(5.7, 0, 47), X(0.6, 4.2, 0.9), 0.3, 0, { tag: 'lens' });
    for (const side of [1, -1]) legOf(side > 0 ? 'legL' : 'legR', P(-1, side * 7, 32), P(2, side * 10, 17), P(-1, side * 10, 5), 5.0, 6.5);
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'armL' : 'armR';
      armOf(piece, P(4, side * 10, 53), P(9, side * 18, 40), P(11, side * 19, 24), 3.4);
      fistAt(piece, P(12, side * 19, 15), mul(U, -1), mul(L, -side), 7.6);
    }
  } else if (build === 'lantern') {
    // THE LANTERN: a cage of brass bars round a great cyan flame, a cap and a ring on top, on three thin legs; jointed
    // arms from its cage, fists
    sc.ell(glow, 'torso', P(0, 0, 46), X(8, 8, 11), 0.6, { tag: 'flame' });
    for (let i = 0; i < 6; i++) {
      const th = (i / 6) * Math.PI * 2 + 0.3;
      const dir = add(mul(F, Math.cos(th)), mul(L, Math.sin(th)));
      sc.cone(brass, 'bars', add(P(0, 0, 33), mul(dir, 10.6)), add(P(0, 0, 60), mul(dir, 10)), 0.8, 0.8, 0.2, { tag: 'bar' });
    }
    sc.ell(brass, 'torso', P(0, 0, 32), X(12, 12, 2.4), 0.6, { tag: 'chest' });
    sc.ell(copper, 'torso', P(0, 0, 62), X(11.4, 11.4, 3.2), 0.6, { tag: 'cap' });
    sc.cone(copper, 'torso', P(0, 0, 63), P(0, 0, 67), 5, 2.6, 0.8, { tag: 'cap' });
    sc.ell(steel, 'torso', P(0, 0, 71), X(4.4, 1.2, 4.4), 0.2, { tag: 'ring' });
    sc.ell(dark, 'torso', P(0, 0, 71), X(3, 2, 3), 0, { tag: 'hole', carve: true });
    for (let i = 0; i < 3; i++) {
      const ang = (i / 3) * Math.PI * 2 + Math.PI / 3;
      const dir = add(mul(F, Math.cos(ang)), mul(L, Math.sin(ang)));
      const piece = ['legA', 'legB', 'legC'][i];
      const hip = add(P(0, 0, 30), mul(dir, 8));
      const knee = add(P(0, 0, 22), mul(dir, 16));
      const foot = add(P(0, 0, 1.2), mul(dir, 19));
      sc.cone(steel, piece, hip, knee, 1.8, 1.5, 0.3, { tag: 'thigh' });
      sc.ell(brass, piece, knee, X(2.2, 2.2, 2.2), 0.2, { tag: 'joint' });
      sc.cone(steel, piece, knee, foot, 1.5, 1.0, 0.3, { tag: 'shin' });
      sc.ell(brass, piece, foot, X(2.6, 2.6, 1.2), 0.2, { tag: 'foot' });
    }
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'armL' : 'armR';
      armOf(piece, P(0, side * 10.8, 50), P(4, side * 22, 46), P(10, side * 23, 32), 2.6);
      fistAt(piece, P(12, side * 22.5, 25), norm(add(mul(U, -1), mul(F, 0.3))), mul(L, -side), 5.8);
    }
  } else if (build === 'cauldron') {
    // THE CAULDRON: a great iron pot on three stubby feet, its brew the friend's cyan bubbling at its brim; two lamps for
    // eyes on its belly; fists from its rim
    const iron = sc.mat({ ramp: DARK, paint: (h) => (far(h.prim.piece) ? shadeOf(DARK, h.tone - 1) : null) });
    sc.ell(iron, 'torso', P(0, 0, 42), X(16, 16, 15), 2.0, { tag: 'drum', cuts: [{ n: U, o: 51 }] });
    ringOf(steel, 'torso', P(0, 0, 51.5), F, L, 14, 1.8, 24, 'rim');
    const brew = sc.mat({ ramp: CYAN, paint: (h) => ((h.x * 3 + h.y * 5) % 13 < 2 ? '#e8ffff' : h.tone >= 3 ? CYAN[3] : CYAN[2]) });
    sc.ell(brew, 'torso', P(0, 0, 50.4), X(13.4, 13.4, 1.4), 0.3, { tag: 'brew' });
    for (const [bf, bl, r] of [[3, -4, 1.8], [-5, 3, 1.4], [6, 5, 1.1]] as const) sc.ell(brew, 'torso', P(bf, bl, 51.6), X(r, r, r), 0.2, { tag: 'bubble' });
    sc.ell(brass, 'torso', P(0, 0, 40), X(16.6, 16.6, 1.4), 0.3, { tag: 'band' });
    for (const side of [1, -1]) eyeAt('torso', P(13.4, side * 5.6, 45.5), norm(add(F, mul(L, side * 0.3))), 2.0);
    for (let i = 0; i < 3; i++) {
      const ang = (i / 3) * Math.PI * 2 + Math.PI / 3;
      const dir = add(mul(F, Math.cos(ang)), mul(L, Math.sin(ang)));
      const piece = ['legA', 'legB', 'legC'][i];
      sc.cone(iron, piece, add(P(0, 0, 30), mul(dir, 10)), add(P(0, 0, 2.2), mul(dir, 14)), 3.4, 2.4, 0.8, { tag: 'shin' });
      sc.ell(steel, piece, add(P(0, 0, 2.2), mul(dir, 14.5)), X(3.2, 3.2, 2.0), 0.3, { tag: 'foot' });
    }
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'armL' : 'armR';
      armOf(piece, P(0, side * 15.5, 50), P(5, side * 23, 42), P(10, side * 21, 32), 3.0);
      fistAt(piece, P(13, side * 20.5, 26), norm(add(mul(U, -1), mul(F, 0.4))), mul(L, -side), 6.4);
    }
  } else if (build === 'ball') {
    // THE BALL-ROLLER: a body of brass balanced on one great steel ball it rolls about on; a single great eye in its
    // body; a stack; arms out and fists up
    const ballM = sc.mat({ ramp: STEEL5, paint: (h) => (Math.floor((Math.atan2(h.p[1], h.p[0]) + Math.PI) * 3) % 2 === 0 && Math.abs(h.p[2] - 11) < 2.0 ? shadeOf(BRASS, h.tone) : null) });
    sc.ell(ballM, 'ball', P(0, 0, 11.5), X(11.5, 11.5, 11.5), 0.4, { tag: 'ball' });
    sc.cone(steel, 'torso', P(0, 0, 21), P(0, 0, 25), 8.5, 9.5, 0.6, { tag: 'collar' });
    sc.cone(brass, 'torso', P(0, 0, 26), P(0, 0, 54), 10, 14.5, 1.6, { tag: 'drum' });
    sc.ell(brass, 'torso', P(0, 0, 54), X(14.5, 14.5, 7), 1.6, { tag: 'shell' });
    eyeAt('torso', P(13, 0, 48), F, 4.4);
    stackAt('stacks', P(-10, 0, 56), P(-12, 0, 76), 2.4);
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'armL' : 'armR';
      armOf(piece, P(0, side * 14, 50), P(6, side * 24, 42), P(14, side * 22, 46), 2.9);
      fistAt(piece, P(19, side * 20.5, 48), F, U, 6.2);
    }
  } else if (build === 'bellows') {
    // THE BELLOWS: a body of pleated leather between plates of brass, breathing; a nozzle for a snout; two lamps for eyes
    // on its top plate; short stumpy legs; fists from its top plate
    const leather = sc.mat({ ramp: ['#1e1008', '#3a2014', '#5e3820', '#8a5a34', '#b07c4c'], paint: (h) => (far(h.prim.piece) ? shadeOf(['#1e1008', '#3a2014', '#5e3820', '#8a5a34', '#b07c4c'], h.tone - 1) : null) });
    for (let i = 0; i < 5; i++) {
      const z = 31 + i * 5.4;
      sc.ell(leather, 'torso', P(0, 0, z), X(14 + (i % 2) * 2.2, 15 + (i % 2) * 2.2, 3.4), i ? 0.8 : 0.8, { tag: 'drum' });
    }
    sc.box(brass, 'torso', P(0, 0, 58), X(16, 17, 2.2), 1.6, 0.4, { tag: 'chest' });
    sc.box(brass, 'hips', P(0, 0, 27.5), X(15, 16, 2.0), 1.4, 0.4, { tag: 'pelvis' });
    sc.cone(steel, 'snout', P(14, 0, 40), P(22, 0, 35), 3.6, 1.8, 1.2, { tag: 'nozzle' });
    sc.cone(brass, 'snout', P(21.4, 0, 35.4), P(23, 0, 34.4), 2.4, 2.4, 0.2, { tag: 'tip' });
    for (const side of [1, -1]) eyeAt('torso', P(12, side * 6, 61.4), norm(add(F, mul(U, 0.7))), 2.4);
    heartAt('torso', P(-2, 0, 60.6), U, 4.2);
    for (const side of [1, -1]) legOf(side > 0 ? 'legL' : 'legR', P(-1, side * 8, 26), P(3, side * 11, 15), P(0, side * 11, 5), 4.4, 6);
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'armL' : 'armR';
      armOf(piece, P(0, side * 17, 58), P(5, side * 26, 46), P(11, side * 25, 32), 3.1);
      fistAt(piece, P(14, side * 24, 25), norm(add(mul(U, -1), mul(F, 0.3))), mul(L, -side), 6.8);
    }
  }
  // ---- THE THIRD TEN ----
  /** A chain of links from `a` to `b`, each link `r` big, turned a quarter to the last. */
  const chainOf = (piece: string, a: V3, b: V3, r: number): void => {
    const len = Math.hypot(...sub(b, a));
    const n = Math.max(2, Math.round(len / (r * 1.7)));
    const d = norm(sub(b, a));
    const s1 = norm(cross(d, U[2] > 0 && Math.abs(d[2]) > 0.9 ? F : U));
    const s2 = norm(cross(d, s1));
    for (let i = 0; i < n; i++) {
      const c = lerp3(a, b, (i + 0.5) / n);
      sc.ell(steel, piece, c, [mul(d, r * 1.05), mul(i % 2 ? s1 : s2, r * 0.7), mul(i % 2 ? s2 : s1, r * 0.3)], 0, { tag: 'link' });
    }
  };
  /** A bellows-pleated tube from `a` to `b` (a hose, a spring's sleeve): rings of `r` and a little less. */
  const pleated = (mat: number, piece: string, a: V3, b: V3, r: number, n: number, tag: string): void => {
    const d = norm(sub(b, a));
    const s1 = norm(cross(d, Math.abs(d[2]) > 0.9 ? F : U));
    const s2 = norm(cross(d, s1));
    const step = Math.hypot(...sub(b, a)) / n;
    for (let i = 0; i <= n; i++) sc.ell(mat, piece, lerp3(a, b, i / n), [mul(d, step * 0.62), mul(s1, i % 2 ? r * 0.82 : r), mul(s2, i % 2 ? r * 0.82 : r)], 0.4, { tag });
  };
  if (build === 'onearm') {
    // ONE GIANT ARM: a hunched boiler on two short legs, its right arm a monstrous piston arm with a fist bigger than its
    // body; its left a little tool arm with a pincer; one eye on a stalk
    sc.cone(brass, 'torso', P(-6, 0, 28), P(2, 0, 46), 11, 12.5, 1.6, { tag: 'drum' });
    sc.ell(brass, 'torso', P(1, 0, 48), X(10, 12, 6), 1.6, { tag: 'chest' });
    heartAt('torso', P(10.6, 2, 38), F, 4.0);
    sc.cone(steel, 'head', P(4, 4, 52), P(8, 6, 62), 1.0, 0.8, 0.3, { tag: 'stalk' });
    eyeAt('head', P(9, 6.4, 63.6), F, 2.6);
    for (const side of [1, -1]) legOf(side > 0 ? 'legL' : 'legR', P(-6, side * 7, 24), P(-2, side * 9, 13), P(-6, side * 9, 5), 4.0, 6);
    // the giant arm: a great shoulder of plates, a piston rod and its sleeve, a gauntlet like a boiler, the fist on the floor
    sc.ell(brass, 'armR', P(0, -14, 50), X(9, 7, 8), 0.6, { tag: 'plate' });
    armOf('armR', P(0, -14, 46), P(10, -24, 36), P(18, -24, 20), 4.8);
    fistAt('armR', P(21, -24, 12.8), norm(add(mul(U, -1), mul(F, 0.25))), mul(L, 1), 10.5);
    // the tool arm: thin, a pincer
    armOf('armL', P(2, 12, 44), P(8, 16, 38), P(14, 15, 40), 1.6);
    for (const sd of [1, -1]) sc.cone(steel, 'armL', P(15, 15, 40), add(P(19, 15, 40), mul(U, sd * 1.6)), 0.8, 0.4, 0.2, { tag: 'jaw' });
    stackAt('stacks', P(-8, 4, 46), P(-11, 6, 64), 2.0);
  } else if (build === 'mallets') {
    // MALLET ARMS: a tall drum of brass on two legs, its arms ending not in fists but in great mallets, banded in brass
    sc.cone(brass, 'torso', P(0, 0, 26), P(0, 0, 62), 10, 11, 1.4, { tag: 'drum' });
    sc.ell(copper, 'torso', P(0, 0, 63), X(11, 11, 4), 1.0, { tag: 'shell' });
    sc.box(dark, 'torso', P(10.4, 0, 54), X(1.0, 6, 1.4), 0.5, 0.1, { tag: 'grille' });
    for (const side of [1, -1]) eyeAt('torso', P(10.6, side * 3.4, 58), F, 1.7);
    heartAt('torso', P(10.8, 0, 40), F, 4.2);
    for (const side of [1, -1]) legOf(side > 0 ? 'legL' : 'legR', P(-1, side * 6, 26), P(3, side * 9, 14), P(0, side * 9, 5), 3.8, 6);
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'armL' : 'armR';
      armOf(piece, P(0, side * 11, 54), P(4, side * 20, 42), P(9, side * 21, 30), 2.8);
      // the mallet: its handle the forearm's end, its head a short fat drum across it
      const head = P(11, side * 21, 24);
      const ax = norm(add(L, mul(F, -side * 0.25)));
      sc.cone(steel, piece, P(9, side * 21, 30), head, 1.4, 1.4, 0.3, { tag: 'haft' });
      sc.cone(brass, piece, add(head, mul(ax, -6.5)), add(head, mul(ax, 6.5)), 5.6, 5.6, 0.3, { tag: 'mallet', cuts: [{ n: ax, o: dot3(ax, head) + 6.5 }, { n: mul(ax, -1), o: -dot3(ax, head) + 6.5 }] });
      for (const e of [-1, 1]) sc.cone(steel, piece, add(head, mul(ax, e * 5.6)), add(head, mul(ax, e * 6.6)), 6.0, 6.0, 0.1, { tag: 'band', cuts: [{ n: ax, o: dot3(ax, head) + 6.6 }, { n: mul(ax, -1), o: -dot3(ax, head) + 6.6 }] });
    }
  } else if (build === 'flails') {
    // CHAIN FLAILS: a round furnace on three short legs; its arms short stumps that swing chains, a spiked iron ball on each
    sc.ell(brass, 'torso', P(0, 0, 40), X(15, 16, 15), 2.0, { tag: 'drum' });
    sc.ell(brass, 'torso', P(0, 0, 40), X(16, 17, 2.4), 0.6, { tag: 'chest' });
    const mouthC = P(14, 0, 35);
    sc.box(dark, 'torso', mouthC, X(2, 7, 3), 1.2, 0.2, { tag: 'grille' });
    sc.box(glow, 'torso', add(mouthC, P(-0.5, 0, 0)), X(1.6, 6.2, 2.2), 0.9, 0, { tag: 'fire' });
    for (const side of [1, -1]) eyeAt('torso', P(12.6, side * 6, 46), norm(add(F, mul(L, side * 0.3))), 2.2);
    stackAt('stacks', P(-3, 0, 53), P(-5, 0, 72), 2.4);
    for (let i = 0; i < 3; i++) {
      const ang = (i / 3) * Math.PI * 2 + Math.PI / 3;
      const dir = add(mul(F, Math.cos(ang)), mul(L, Math.sin(ang)));
      const piece = ['legA', 'legB', 'legC'][i];
      sc.cone(steel, piece, add(P(0, 0, 28), mul(dir, 8)), add(P(0, 0, 2.4), mul(dir, 13)), 3.0, 2.2, 0.5, { tag: 'shin' });
      sc.ell(brass, piece, add(P(0, 0, 2.4), mul(dir, 13.4)), X(3.2, 3.2, 1.8), 0.3, { tag: 'foot' });
    }
    const spiked = sc.mat({ ramp: DARK });
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'armL' : 'armR';
      sc.ell(steel, piece, P(0, side * 15.5, 44), X(4.4, 4.4, 4.4), 0.4, { tag: 'ball' });
      sc.cone(brass, piece, P(0, side * 17, 44), P(3, side * 22, 46), 3.2, 2.6, 0.4, { tag: 'upper' });
      const ballC = P(10, side * 27, 12);
      chainOf(piece, P(3, side * 23, 45), add(ballC, mul(U, 5.4)), 1.5);
      sc.ell(spiked, piece, ballC, X(5.4, 5.4, 5.4), 0.3, { tag: 'mace' });
      for (const [a1, a2] of [[0, 0], [90, 0], [180, 0], [270, 0], [0, 70], [0, -70], [120, 40], [240, 40], [60, -40], [300, -40]] as const) {
        const az = (a1 * Math.PI) / 180;
        const el = (a2 * Math.PI) / 180;
        const dir = add(mul(add(mul(F, Math.cos(az)), mul(L, Math.sin(az))), Math.cos(el)), mul(U, Math.sin(el)));
        sc.cone(steel, piece, add(ballC, mul(dir, 4.8)), add(ballC, mul(dir, 8.0)), 1.3, 0.15, 0.2, { tag: 'spike' });
      }
    }
  } else if (build === 'jack') {
    // JACK-IN-THE-BOX: a riveted box of brass on four stubby legs, a crank on its side; its punch a boxing glove of
    // leather on a coiled spring flung out of a hatch in its front; two little arms to turn its crank
    sc.box(brass, 'torso', P(0, 0, 36), X(12, 12, 13), 1.6, 0.4, { tag: 'drum' });
    sc.box(copper, 'torso', P(0, 0, 49.6), X(12.6, 12.6, 1.4), 0.8, 0.2, { tag: 'lid' });
    sc.box(dark, 'torso', P(11.6, 0, 38), X(1.0, 6.4, 6.4), 0.8, 0.1, { tag: 'hatch' });
    sc.box(copper, 'torso', P(13.4, -7.6, 38), X(0.8, 1.6, 6.8), 0.4, 0.1, { tag: 'door' });
    for (const side of [1, -1]) eyeAt('torso', P(12.4, side * 6, 46.4), F, 2.0);
    // the spring and the glove
    const turns = 4;
    let prev: V3 | null = null;
    for (let i = 0; i <= turns * 12; i++) {
      const th = (i / 12) * Math.PI * 2;
      const p = add(P(12 + (i / (turns * 12)) * 13, 0, 38), add(mul(L, Math.cos(th) * 3.6), mul(U, Math.sin(th) * 3.6)));
      if (prev) sc.cone(steel, 'spring', prev, p, 0.8, 0.8, 0.2, { tag: 'coil' });
      prev = p;
    }
    const glove = sc.mat({ ramp: ['#2a0610', '#5a0e1c', '#9a1c26', '#d23a34', '#f46a4a'] });
    sc.ell(glove, 'spring', P(30, 0, 39), X(6, 6.4, 6.2), 1.0, { tag: 'glove' });
    sc.ell(glove, 'spring', P(28, -5.6, 41), X(2.8, 2.2, 2.6), 0.6, { tag: 'thumb' });
    sc.cone(sc.mat({ ramp: ['#4a4038', '#7a6e60', '#b8ac98', '#e6dcc4', '#fff8e8'] }), 'spring', P(24.4, 0, 39), P(25.6, 0, 39), 4.4, 4.4, 0.2, { tag: 'cuff' });
    for (const [fw, sd] of [[7, 7], [7, -7], [-7, 7], [-7, -7]] as const) {
      const piece = `foot${fw > 0 ? 'F' : 'B'}${sd > 0 ? 'l' : 'r'}`;
      sc.cone(steel, piece, P(fw, sd, 23), P(fw * 1.1, sd * 1.1, 3), 2.4, 2.0, 0.3, { tag: 'shin' });
      sc.ell(brass, piece, P(fw * 1.1, sd * 1.1, 2.2), X(3.2, 3.2, 2.0), 0.2, { tag: 'foot' });
    }
    // the crank, and the little arm that winds it
    sc.cone(steel, 'crank', P(0, 12.4, 38), P(0, 16, 38), 1.0, 1.0, 0.2, { tag: 'shaft' });
    sc.cone(steel, 'crank', P(0, 16, 38), P(0, 16, 44), 0.9, 0.9, 0.2, { tag: 'handle' });
    sc.ell(copper, 'crank', P(0, 16, 45), X(1.4, 1.4, 1.4), 0.2, { tag: 'knob' });
    armOf('armL', P(-6, 12, 46), P(-4, 18, 50), P(-1, 17, 46), 1.4);
    stackAt('stacks', P(-8, -5, 50), P(-9, -6, 66), 1.8);
  } else if (build === 'crane') {
    // THE WRECKING BALL: a cab of brass on tracks, a crane's jib rising off its back and over its head, a great iron ball
    // swinging from it on a chain; one eye in its cab
    const treads = sc.mat({ ramp: ['#100c18', '#1e1a2c', '#2e2a44', '#48446a', '#6a6690'], paint: (h) => (Math.abs(onBall(h.prim as Box, h.p)[2]) > 0.55 && Math.floor((onBall(h.prim as Box, h.p)[0] + 1) * 9) % 2 === 0 ? STEEL5[Math.max(0, Math.min(4, h.tone))] : null) });
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'treadL' : 'treadR';
      sc.box(treads, piece, P(-2, side * 10, 6), X(14, 4.4, 6), 5.4, 0.2, { tag: 'track' });
      for (const fw of [-11, -2, 7]) sc.ell(brass, piece, P(fw, side * 14.6, 6), X(3.4, 0.9, 3.4), 0.2, { tag: 'wheel' });
    }
    sc.box(brass, 'torso', P(-2, 0, 22), X(12, 11, 9), 2.0, 0.6, { tag: 'drum' });
    sc.ell(copper, 'torso', P(-2, 0, 31), X(12, 11, 3), 0.8, { tag: 'shell' });
    sc.box(dark, 'torso', P(9.8, 0, 25), X(0.8, 7, 3), 0.8, 0.1, { tag: 'grille' });
    eyeAt('torso', P(10.4, 0, 25), F, 2.4);
    stackAt('stacks', P(-10, -6, 30), P(-12, -7, 46), 1.8);
    // the jib: a lattice of two rails from its back up and forward, the pulley at its head
    const foot = P(-6, -2, 32);
    const top = P(12, -20, 68);
    for (const sd of [1.6, -1.6]) sc.cone(steel, 'crane', add(foot, mul(L, sd)), add(top, mul(L, sd * 0.6)), 1.2, 1.0, 0.2, { tag: 'rail' });
    for (let i = 1; i < 6; i++) sc.cone(steel, 'crane', lerp3(foot, top, i / 6), lerp3(foot, top, (i + 0.6) / 6), 0.6, 0.6, 0.2, { tag: 'strut' });
    sc.ell(brass, 'crane', top, X(2.6, 2.4, 2.6), 0.2, { tag: 'pulley' });
    const ballC = P(13, -21, 15);
    chainOf('crane', add(top, mul(U, -2)), add(ballC, mul(U, 9)), 1.4);
    const iron = sc.mat({ ramp: DARK, paint: (h) => (h.tone >= 3 ? STEEL5[3] : null) });
    sc.ell(iron, 'ball', ballC, X(9, 9, 9), 0.2, { tag: 'wrecking' });
    sc.cone(steel, 'ball', add(ballC, mul(U, 8.4)), add(ballC, mul(U, 10)), 1.8, 1.8, 0.2, { tag: 'eye' });
  } else if (build === 'ram') {
    // THE BATTERING RAM: no arms; a long boiler carried level on four short legs like a bull's, its front a great iron ram
    // with a ring of plates; two lamps for eyes over the ram; a stack on its back. It charges.
    sc.cone(brass, 'torso', P(-16, 0, 30), P(10, 0, 32), 11, 12, 1.4, { tag: 'drum' });
    sc.ell(brass, 'torso', P(-3, 0, 36), X(12, 12, 9), 1.6, { tag: 'chest' });
    const iron = sc.mat({ ramp: STEEL5, paint: (h) => (far(h.prim.piece) ? shadeOf(STEEL5, h.tone - 1) : null) });
    sc.cone(iron, 'ram', P(10, 0, 32), P(22, 0, 31), 10, 9, 0.6, { tag: 'neck' });
    sc.box(iron, 'ram', P(24, 0, 31), X(3, 10, 10), 2.4, 0.4, { tag: 'ram' });
    for (const sd of [1, -1]) sc.cone(iron, 'ram', P(24, sd * 8, 38), P(28, sd * 13, 44), 2.6, 0.6, 0.4, { tag: 'horn' });
    for (let i = 0; i < 2; i++) ringOf(copper, 'ram', P(13 + i * 5, 0, 31.6), L, U, 10.2 - i * 0.4, 1.1, 20, 'hoop');
    for (const side of [1, -1]) eyeAt('torso', P(12, side * 6.4, 44), F, 2.0);
    for (const [fw, sd] of [[4, 8], [4, -8], [-12, 8], [-12, -8]] as const) {
      const piece = `leg${fw > 0 ? 'F' : 'B'}${sd > 0 ? 'l' : 'r'}`;
      sc.cone(steel, piece, P(fw, sd, 24), P(fw + 2, sd * 1.05, 10), 3.6, 3.0, 0.4, { tag: 'thigh' });
      sc.cone(brass, piece, P(fw + 2, sd * 1.05, 10), P(fw + 1, sd * 1.05, 4.4), 3.4, 3.8, 0.4, { tag: 'greave' });
      sc.ell(steel, piece, P(fw + 1.5, sd * 1.05, 2.0), X(4.4, 4, 2.0), 0.3, { tag: 'foot' });
    }
    stackAt('stacks', P(-10, 0, 42), P(-12, 0, 58), 2.2);
    stackAt('stacks', P(-16, 0, 40), P(-19, 0, 54), 1.8);
  } else if (build === 'hoses') {
    // STEAM HOSES: a squat tank on two short legs; its arms two long pleated hoses of copper, curling, each ending in a
    // brass nozzle that blasts steam; gauges on its front
    sc.cone(brass, 'torso', P(0, 0, 24), P(0, 0, 50), 14, 14, 1.2, { tag: 'drum' });
    sc.ell(brass, 'torso', P(0, 0, 50), X(14, 14, 6), 1.2, { tag: 'shell' });
    sc.ell(steel, 'hips', P(0, 0, 24), X(13, 13, 4), 1.0, { tag: 'pelvis' });
    const gauge = sc.mat({ ramp: DIAL, paint: (h) => (Math.abs(onBall(h.prim as Ell, h.p)[1] - onBall(h.prim as Ell, h.p)[2] * 0.6) < 0.12 ? DARK[0] : null) });
    for (const [sd, up] of [[-5, 44], [5, 44]] as const) {
      sc.ell(brass, 'torso', P(13.4, sd, up), X(1.2, 3.0, 3.0), 0.2, { tag: 'bezel' });
      sc.ell(gauge, 'torso', P(14.2, sd, up), X(0.8, 2.3, 2.3), 0.1, { tag: 'gauge' });
    }
    eyeAt('torso', P(13.6, 0, 52), norm(add(F, mul(U, 0.3))), 2.6);
    for (const side of [1, -1]) legOf(side > 0 ? 'legL' : 'legR', P(0, side * 8, 24), P(4, side * 11, 13), P(1, side * 11, 5), 4.2, 6);
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'hoseL' : 'hoseR';
      const pts = [P(0, side * 14, 44), P(4, side * 22, 50), P(10, side * 28, 44), P(16, side * 27, 34), P(20, side * 22, 30)];
      for (let i = 0; i + 1 < pts.length; i++) pleated(copper, piece, pts[i], pts[i + 1], 2.8, 4, 'hose');
      sc.cone(brass, piece, P(20, side * 22, 30), P(25, side * 19, 28), 2.6, 1.6, 0.4, { tag: 'nozzle' });
      sc.cone(dark, piece, P(25, side * 19, 28), P(25.6, side * 18.6, 27.8), 1.2, 1.2, 0, { tag: 'mouth' });
    }
    stackAt('stacks', P(-9, 0, 52), P(-11, 0, 70), 2.4);
  } else if (build === 'pincers') {
    // PINCERS: a dome like a bell jar on a stout steel body, the cyan heart showing through its glass; two short legs; its
    // arms ending in great hooked pincers
    sc.cone(brass, 'torso', P(0, 0, 26), P(0, 0, 42), 12, 13, 1.2, { tag: 'drum' });
    sc.ell(brass, 'torso', P(0, 0, 42), X(13.6, 13.6, 2.4), 0.6, { tag: 'chest' });
    const jar = sc.mat({ ramp: ['#0a2a3a', '#124a5c', '#1e7488', '#4aa8b4', '#a6e2e2'], paint: (h) => (h.tone >= 4 ? '#e8ffff' : null) });
    sc.ell(jar, 'head', P(0, 0, 46), X(10, 10, 14), 0.4, { tag: 'shell', cuts: [{ n: mul(U, -1), o: -43 }] });
    sc.ell(heart, 'head', P(0, 0, 51), X(5, 5, 5), 0.2, { tag: 'core' });
    sc.ell(brass, 'head', P(0, 0, 60), X(3, 3, 2), 0.4, { tag: 'cap' });
    for (const side of [1, -1]) legOf(side > 0 ? 'legL' : 'legR', P(0, side * 7, 26), P(4, side * 10, 14), P(1, side * 10, 5), 4.0, 6);
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'armL' : 'armR';
      armOf(piece, P(0, side * 13, 38), P(6, side * 23, 34), P(14, side * 24, 30), 2.8);
      // the pincer: two great hooked jaws, open
      const base = P(15, side * 24, 30);
      sc.ell(brass, piece, base, X(4, 4, 4), 0.4, { tag: 'pincerBase' });
      for (const j of [1, -1]) {
        const out = norm(add(F, mul(L, side * 0.8)));
        const m = add(base, add(mul(out, 6), mul(U, j * 5)));
        const tip = add(base, add(mul(out, 11), mul(U, j * 1.2)));
        sc.cone(brass, piece, add(base, mul(U, j * 1.6)), m, 2.6, 1.8, 0.4, { tag: 'jaw' });
        sc.cone(brass, piece, m, tip, 1.8, 0.3, 0.3, { tag: 'jaw' });
      }
    }
    stackAt('stacks', P(-10, 0, 36), P(-12, 0, 56), 2.0);
  } else if (build === 'paddles') {
    // THE PADDLE WHEEL: a tall box on two legs, a great wheel of four paddles turning on its front that beats whatever is
    // before it; one eye over the wheel; a stack
    sc.box(brass, 'torso', P(0, 0, 40), X(8, 11, 17), 1.6, 0.4, { tag: 'drum' });
    sc.ell(copper, 'torso', P(0, 0, 57.5), X(8.4, 11.4, 2.4), 0.6, { tag: 'shell' });
    eyeAt('torso', P(8.2, 0, 51), F, 2.6);
    for (const side of [1, -1]) legOf(side > 0 ? 'legL' : 'legR', P(0, side * 6, 24), P(4, side * 9, 13), P(1, side * 9, 5), 3.8, 6);
    const hub = P(11, 0, 38);
    sc.cone(steel, 'wheel', P(7, 0, 38), hub, 2.0, 2.0, 0.2, { tag: 'axle' });
    sc.ell(brass, 'wheel', hub, X(1.6, 3, 3), 0.2, { tag: 'hub' });
    const wood = sc.mat({ ramp: WOOD, paint: (h) => (Math.abs(onBall(h.prim as Box, h.p)[1]) > 0.8 ? shadeOf(WOOD, h.tone - 1) : null) });
    for (let i = 0; i < 4; i++) {
      const th = (i / 4) * Math.PI * 2 + Math.PI / 8;
      const out = add(mul(L, Math.cos(th)), mul(U, Math.sin(th)));
      sc.cone(steel, 'wheel', hub, add(hub, mul(out, 11)), 0.9, 0.7, 0.2, { tag: 'spoke' });
      sc.box(wood, 'wheel', add(hub, add(mul(out, 13), mul(F, 0.5))), [mul(out, 5), mul(norm(cross(F, out)), 4.5), mul(F, 1.0)], 0.6, 0.2, { tag: 'paddle' });
    }
    stackAt('stacks', P(-6, 5, 58), P(-8, 6, 74), 2.0);
  } else if (build === 'tongs') {
    // SCISSOR ARMS: a round brass body on two legs, its arms lazy-tongs of steel that shoot out in a zigzag, a fist at
    // each end; a ring of portholes for eyes
    sc.ell(brass, 'torso', P(0, 0, 42), X(13, 14, 14), 1.8, { tag: 'drum' });
    sc.ell(steel, 'hips', P(0, 0, 28), X(10, 11, 4), 1.0, { tag: 'pelvis' });
    for (const sd of [-6, 0, 6]) eyeAt('torso', P(12, sd, 47), norm(add(F, mul(L, sd * 0.05))), 1.8);
    heartAt('torso', P(12.8, 0, 37), F, 3.4);
    for (const side of [1, -1]) legOf(side > 0 ? 'legL' : 'legR', P(0, side * 7, 28), P(4, side * 10, 15), P(1, side * 10, 5), 4.0, 6);
    for (const side of [1, -1]) {
      const piece = side > 0 ? 'armL' : 'armR';
      const root = P(2, side * 13, 44);
      sc.ell(steel, piece, root, X(3.6, 3.6, 3.6), 0.3, { tag: 'ball' });
      // the tongs: four crossed pairs, zigzagging out along the reach
      const reach = norm(add(F, mul(L, side * 0.55)));
      const up = U;
      const n = 4;
      const seg = 6.4;
      for (let i = 0; i < n; i++) {
        const a0 = add(root, mul(reach, i * seg));
        const a1 = add(root, mul(reach, (i + 1) * seg));
        sc.cone(steel, piece, add(a0, mul(up, 2.6)), add(a1, mul(up, -2.6)), 0.75, 0.75, 0.1, { tag: 'tong' });
        sc.cone(steel, piece, add(a0, mul(up, -2.6)), add(a1, mul(up, 2.6)), 0.75, 0.75, 0.1, { tag: 'tong' });
        sc.ell(brass, piece, lerp3(a0, a1, 0.5), X(0.9, 0.9, 0.9), 0.05, { tag: 'pin' });
      }
      const end = add(root, mul(reach, n * seg + 3));
      fistAt(piece, end, reach, U, 5.6);
    }
    stackAt('stacks', P(-8, 0, 52), P(-10, 0, 72), 2.2);
  }

  if (giant) {
    // THE ONE GIANT ARM: out of its right side, a great shoulder of plates, a piston arm as thick as a leg, a gauntlet like a
    // boiler, and a fist bigger than its head resting knuckles-down on the floor before it
    const at = (p: V3): [number, number, number] => [dot3(p, F), dot3(p, L), p[2]];
    const r0 = roots.armR ?? P(0, -14, 46);
    const [rf, rl, ru] = at(r0);
    const reach = Math.max(rf, 0);
    sc.ell(brass, 'giantR', P(rf, rl - 1, ru + 3.5), X(9, 7, 7.5), 0.6, { tag: 'plate' });
    // (swung up and back about its shoulder as it moves, GOLEM_POSE.swing degrees; its elbow bent in as it is raised, `fold`)
    const sh = P(rf, rl, ru);
    const sw = (GOLEM_POSE.swing * Math.PI) / 180;
    const fold = (GOLEM_POSE.fold * Math.PI) / 180;
    const elbow0 = P(reach + 10, rl - 10, ru * 0.62 + 6);
    const turnS = (p: V3): V3 => add(sh, aboutAxis(sub(p, sh), L, -sw));
    // (the forearm folded about the elbow first, then the whole arm swung about the shoulder)
    const turnE = (p: V3): V3 => turnS(add(elbow0, aboutAxis(sub(p, elbow0), L, -fold)));
    const dirE = (v: V3): V3 => aboutAxis(aboutAxis(v, L, -fold), L, -sw);
    // (its piston fixed to the outer side of its upper arm, swung with it: never round through its body as the arm goes up)
    const pistonSide = aboutAxis(norm(cross(norm(sub(elbow0, sh)), F)), L, -sw);
    armOf('giantR', sh, turnS(elbow0), turnE(P(reach + 18, rl - 10, 21)), 4.8, pistonSide);
    const fistC = turnE(P(reach + 21, rl - 10, 12.8));
    // (its fist turned with its arm; or, as it walks on it, kept knuckles down on the floor however its arm and body turn:
    // GOLEM_POSE.level)
    const knuckles0 = norm(add(mul(U, -1), mul(F, 0.25)));
    const lv = GOLEM_POSE.level;
    const flat = (v: V3): V3 => aboutAxis(v, L, -(GOLEM_POSE.lean * Math.PI) / 180);
    const fistDir = lv ? norm(lerp3(dirE(knuckles0), flat(knuckles0), lv)) : dirE(knuckles0);
    fistAt('giantR', fistC, fistDir, lv ? mul(L, 1) : dirE(mul(L, 1)), 10.5);
    GOLEM_FIST.c = fistC;
    const l0 = roots.armL ?? P(0, 14, 44);
    const [lf, ll, lu] = at(l0);
    if (gun === 'pincer') {
      // the tool arm: thin, a pincer, held up
      armOf('giantL', P(lf, ll, lu), P(lf + 6, ll + 4, lu - 6), P(lf + 12, ll + 3, lu - 4), 1.6);
      for (const sd of [1, -1]) sc.cone(steel, 'giantL', P(lf + 13, ll + 3, lu - 4), add(P(lf + 17, ll + 3, lu - 4), mul(U, sd * 1.6)), 0.8, 0.4, 0.2, { tag: 'jaw' });
    } else {
      // ITS GUN ARM, ITS RANGED ATTACK (his word, 28 Oct, by 00:50: “I’d like the big construct to have a ranged attack as
      // well.  Maybe put a cannon or a tesla coil on his other arm or whatever.”): in place of the little tool arm, an arm
      // of its own size: a shoulder plate, a steel upper arm out from its side with its piston, its elbow bent, and its
      // forearm the gun: AT REST held up at its side, its muzzle to the sky, clear of its body from in front and from
      // behind (`aim` 0); brought down level to fire (`aim` 1)
      // (as big as its giant arm's fist is: a gun to be seen at the game's size, not a toy)
      const g = GUN_SIZE;
      const root = P(lf, ll, lu);
      const el = lerp3(P(lf + 2, ll + 13, lu - 16), P(lf + 5, ll + 12, lu - 10), aim);
      const wayOf = (rest: V3, fire: V3): V3 => norm(lerp3(norm(rest), norm(fire), aim));
      sc.ell(brass, 'gunL', P(lf - 0.5, ll + 2.5, lu + 3.5), X(8.8, 7.2, 7.2), 0.6, { tag: 'plate' });
      sc.ell(steel, 'gunL', root, X(5.0, 5.0, 5.0), 0.5, { tag: 'ball' });
      sc.cone(steel, 'gunL', root, el, 3.9, 3.4, 0.5, { tag: 'upper' });
      const ud = norm(sub(el, root));
      const uo = norm(cross(ud, F));
      sc.cone(copper, 'gunL', add(lerp3(root, el, 0.2), mul(uo, 3.8)), add(lerp3(root, el, 0.9), mul(uo, 3.8)), 1.15, 1.15, 0.2, { tag: 'piston' });
      sc.ell(steel, 'gunL', el, X(4.3, 4.3, 4.3), 0.4, { tag: 'joint' });
      if (gun === 'cannon') {
        // A CANNON: a short fat barrel of copper, hooped in brass, out along its forearm from a brass breech at its elbow,
        // its muzzle flared and black; a drum of shot on the breech feeding it; a lamp of the friend's cyan lit on the
        // breech while it is loaded. It kicks back along itself as it fires (`kick`).
        const way = levelled(wayOf(add(mul(U, 0.92), add(mul(L, 0.3), mul(F, -0.08))), add(mul(F, 0.85), add(mul(L, 0.45), mul(U, 0.08)))), level);
        const s1 = norm(cross(way, U));
        const s2 = norm(cross(s1, way));
        const e = add(el, mul(way, -2.6 * g * kick));
        const along = (k: number): V3 => add(e, mul(way, k * g));
        sc.ell(brass, 'gunL', along(1.4), [mul(way, 5.0 * g), mul(s1, 4.9 * g), mul(s2, 4.9 * g)], 0.8, { tag: 'breech' });
        sc.ell(steel, 'gunL', along(-4.0), [mul(way, 1.7 * g), mul(s1, 1.7 * g), mul(s2, 1.7 * g)], 0.3, { tag: 'knob' });
        sc.cone(copper, 'gunL', along(2.4), along(18.5), 4.1 * g, 3.4 * g, 0.5, { tag: 'barrel' });
        // (its hoops and its muzzle's band lit one by one as it charges, `charge`: the breech's first, the muzzle's last)
        const hoopMat = (i: number): number => {
          const lit = charge > 0 ? litOf(charge, (i + 0.5) / 3) : 0;
          return lit >= 3 ? white : lit === 2 ? hot : lit === 1 ? warm : brass;
        };
        ([[5.2, 4.7], [11.6, 4.2]] as const).forEach(([k, r], i) => sc.box(hoopMat(i), 'gunL', along(k), [mul(way, 0.7 * g), mul(s1, r * g), mul(s2, r * g)], r * 0.85 * g, 0.2, { tag: 'hoop' }));
        sc.box(hoopMat(2), 'gunL', along(19.2), [mul(way, 1.0 * g), mul(s1, 4.8 * g), mul(s2, 4.8 * g)], 4.0 * g, 0.2, { tag: 'muzzle' });
        sc.box(dark, 'gunL', along(19.75), [mul(way, 0.6 * g), mul(s1, 2.9 * g), mul(s2, 2.9 * g)], 2.5 * g, 0, { tag: 'bore' });
        // (the drum of shot: a brass drum lying across the breech, its end caps steel; a pipe from it down into the breech)
        const drum = add(along(4.0), mul(s2, 6.2 * g));
        sc.cone(brass, 'gunL', add(drum, mul(s1, -2.5 * g)), add(drum, mul(s1, 2.5 * g)), 3.2 * g, 3.2 * g, 0.4, { tag: 'drum' });
        for (const sd of [1, -1]) sc.cone(steel, 'gunL', add(drum, mul(s1, sd * 2.6 * g)), add(drum, mul(s1, sd * 3.2 * g)), 2.5 * g, 2.5 * g, 0.2, { tag: 'cap' });
        sc.cone(steel, 'gunL', add(drum, mul(s2, -2.0 * g)), add(along(3.6), mul(s2, 3.4 * g)), 1.1 * g, 1.1 * g, 0.2, { tag: 'feed' });
        sc.ell(glow, 'gunL', add(along(0.6), add(mul(s2, 4.4 * g), mul(s1, -2.8 * g))), [mul(way, 1.1 * g), mul(s1, 1.1 * g), mul(s2, 1.1 * g)], 0.1, { tag: 'lamp' });
        GOLEM_MUZZLE.p = along(20.4);
        GOLEM_MUZZLE.way = way;
        // (its vents, for its steam as it charges: either side of its breech, and on top of it)
        GOLEM_VENTS.pts = [add(along(1.4), mul(s1, 5.2 * g)), add(along(1.4), mul(s1, -5.2 * g)), add(along(8.4), mul(s2, 4.6 * g))];
        GOLEM_VENTS.ways = [s1, mul(s1, -1), s2];
      } else {
        // A TESLA COIL: a brass housing along its forearm from its elbow, held up beside it like a torch; out of it a coil
        // of copper wound tight, collared in steel; at its tip a steel ring round a ball of the friend's cyan, crackling.
        const way = levelled(wayOf(add(mul(U, 0.94), add(mul(L, 0.26), mul(F, -0.06))), add(mul(F, 0.75), add(mul(L, 0.4), mul(U, 0.5)))), level);
        const s1 = norm(cross(way, U));
        const s2 = norm(cross(s1, way));
        const e = add(el, mul(way, -1.6 * g * kick));
        const along = (k: number): V3 => add(e, mul(way, k * g));
        sc.cone(brass, 'gunL', along(0.5), along(8.0), 3.6 * g, 4.2 * g, 0.5, { tag: 'housing' });
        sc.box(steel, 'gunL', along(8.5), [mul(way, 0.6 * g), mul(s1, 4.7 * g), mul(s2, 4.7 * g)], 4.1 * g, 0.2, { tag: 'collar' });
        sc.cone(coil, 'gunL', along(8.8), along(18.4), 2.9 * g, 2.3 * g, 0.3, { tag: 'coil' });
        for (const k of [12.0, 15.2]) sc.box(steel, 'gunL', along(k), [mul(way, 0.35 * g), mul(s1, 3.3 * g), mul(s2, 3.3 * g)], 2.9 * g, 0.1, { tag: 'collar' });
        ringOf(steel, 'gunL', along(19.8), s1, s2, 4.2 * g, 1.15 * g, 16, 'torus');
        sc.cone(steel, 'gunL', along(18.2), along(19.6), 1.3 * g, 1.1 * g, 0.2, { tag: 'post' });
        sc.ell(glow, 'gunL', along(20.0), [mul(way, 2.4 * g), mul(s1, 2.4 * g), mul(s2, 2.4 * g)], 0.1, { tag: 'terminal' });
        GOLEM_MUZZLE.p = along(20.0);
        GOLEM_MUZZLE.way = way;
        // (its vents: either side of its housing; and its coil's foot and tip, for the arcs crawling up it)
        GOLEM_VENTS.pts = [add(along(4.0), mul(s1, 4.4 * g)), add(along(4.0), mul(s1, -4.4 * g)), along(8.8), along(18.4)];
        GOLEM_VENTS.ways = [s1, mul(s1, -1), s2, s2];
      }
    }
  }
  // (built at a size easy to think in, then made the size it stands at: a head over the knight, as his brief asked)
  // (ITS BODY LEANING AND BOBBING as it moves, GOLEM_POSE.lean degrees forward about its hips and `bob` up: all of it but
  // its legs, which stand where they stand)
  if (giant && (GOLEM_POSE.lean || GOLEM_POSE.bob)) {
    const pivot = P(-7, 0, 28);
    const a = (GOLEM_POSE.lean * Math.PI) / 180;
    const mv = (q: V3): V3 => add(add(pivot, aboutAxis(sub(q, pivot), L, a)), [0, 0, GOLEM_POSE.bob]);
    const tv = (v: V3): V3 => aboutAxis(v, L, a);
    for (let i = 0; i < sc.prims.length; i++) {
      const pr = sc.prims[i];
      if (pr.piece === 'legL' || pr.piece === 'legR') continue;
      const cuts = pr.cuts?.map((c) => {
        const n = tv(c.n);
        // (a cut keeps where n.p <= o; moved by a turn about the pivot and a lift, its offset moves with it)
        const o = c.o - dot3(c.n, pivot) + dot3(n, pivot) + n[2] * GOLEM_POSE.bob;
        return { n, o };
      });
      if (pr.k === 'cone') sc.prims[i] = { ...pr, a: mv(pr.a), b: mv(pr.b), cuts };
      else if (pr.k === 'tri') sc.prims[i] = { ...pr, a: mv(pr.a), b: mv(pr.b), c: mv(pr.c), cuts };
      else sc.prims[i] = { ...pr, c: mv(pr.c), axes: [tv(pr.axes[0]), tv(pr.axes[1]), tv(pr.axes[2])], cuts } as typeof pr;
    }
    GOLEM_FIST.c = mv(GOLEM_FIST.c);
    GOLEM_MUZZLE.p = mv(GOLEM_MUZZLE.p);
    GOLEM_MUZZLE.way = tv(GOLEM_MUZZLE.way);
    GOLEM_VENTS.pts = GOLEM_VENTS.pts.map(mv);
    GOLEM_VENTS.ways = GOLEM_VENTS.ways.map(tv);
  }
  const k = GOLEM_SIZE[build] ?? GOLEM_TOP / topOf(sc);
  scaleBy(sc, k);
  GOLEM_MUZZLE.p = mul(GOLEM_MUZZLE.p, k);
  GOLEM_VENTS.pts = GOLEM_VENTS.pts.map((p) => mul(p, k));
  GOLEM_FIST.c = mul(GOLEM_FIST.c, k);
  return draw(sc, view, CANVAS3.ax, CANVAS3.ay, CANVAS3, undefined, FRIEND_RIM);
}

/**
 * THE GOLEM MOVING (its giant arm and its body; dev/golem_moves.ts): its giant arm swung up and back about its shoulder
 * (degrees), its forearm folded in at the elbow (degrees), its body leaning forward about its hips (degrees) and bobbed up.
 * All naught as it stands, as he picked it.
 */
export const GOLEM_POSE = { swing: 0, fold: 0, lean: 0, bob: 0, feet: [0, 0, 0, 0] as [number, number, number, number], level: 0, dim: 0, crumple: 0 };
/**
 * Its eye and its heart as its light goes out (`dim` 0 lit, as it stands, to 1 out): a step down the friend's cyan, two,
 * and dark glass; `hot` 1 for the brightest of it (the heart of its eye, its furnace), 0 for the rest.
 */
const DIMMED = [['#22d0e0', '#b8fff8'], ['#0c6a80', '#22d0e0'], ['#0c3a48', '#0c6a80'], ['#141a24', '#26303e']];
function dimmed(hot: number, dim: number): string {
  const step = dim >= 1 ? 3 : dim > 0.66 ? 2 : dim > 0.33 ? 1 : 0;
  return DIMMED[step][hot];
}
/** A knee between a hip and an ankle (each forward and up, in its own measure), `a` and `b` its thigh and shin: bent forward. */
export function kneeFor(hip: [number, number], ankle: [number, number], a: number, b: number): [number, number] {
  const dx = ankle[0] - hip[0];
  const dy = ankle[1] - hip[1];
  const d = Math.min(a + b - 0.01, Math.max(Math.abs(a - b) + 0.01, Math.hypot(dx, dy)));
  const al = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  const th = Math.atan2(dy, dx) + al;
  return [hip[0] + a * Math.cos(th), hip[1] + a * Math.sin(th)];
}
/** Where the last drawn Golem's giant fist is (its middle, as it was built, before it is turned). */
export const GOLEM_FIST: { c: V3 } = { c: [0, 0, 0] };
/** `v` turned about the unit `k` by `a` (radians). */
function aboutAxis(v: V3, k: V3, a: number): V3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const d = k[0] * v[0] + k[1] * v[1] + k[2] * v[2];
  const x = cross(k, v);
  return [v[0] * c + x[0] * s + k[0] * d * (1 - c), v[1] * c + x[1] * s + k[1] * d * (1 - c), v[2] * c + x[2] * s + k[2] * d * (1 - c)];
}

/** Its other arm: the little pincer arm it was picked with, or a gun (his “Maybe put a cannon or a tesla coil on his other arm”, 28 Oct). */
export type GolemGun = 'pincer' | 'cannon' | 'tesla';
/** HIS PICK, 28 Oct, shown both firing: “Cannon” (the pincer arm, as first picked, kept for its pictures). */
export const GOLEM_GUN: { gun: GolemGun } = { gun: 'cannon' };
/** The guns he is shown. */
export const GOLEM_GUNS: { id: GolemGun; name: string }[] = [
  { id: 'cannon', name: 'Cannon arm' },
  { id: 'tesla', name: 'Tesla coil arm' },
];
/** How big its gun is, against the size it was first drawn. */
const GUN_SIZE = 1.5;
/** Where the last drawn Golem's gun fires from (its muzzle, or its coil's ball), as it was built (before it is turned), and which way. */
export const GOLEM_MUZZLE: { p: V3; way: V3 } = { p: [0, 0, 0], way: [1, 0, 0] };
/** Where the last drawn Golem's gun vents its steam as it charges (and, for the coil, its foot and tip), as it was built, and which way each blows. */
export const GOLEM_VENTS: { pts: V3[]; ways: V3[] } = { pts: [], ways: [] };
/** What glows on its gun as it charges: the friend's cyan, darkest to white-hot. */
const LIT = ['#0c6a80', '#22d0e0', '#b8fff8', '#e8ffff'];
/** How lit a part of its gun is (0 dark, 1 warming, 2 lit, 3 white-hot), `at` of the way along it (0 its breech, 1 its muzzle), the gun charged `charge`: each part lit as the charge passes it, white-hot at its full. */
function litOf(charge: number, at: number): number {
  if (charge >= 0.999) return 3;
  const u = (charge - at * 0.9) / 0.12;
  return u >= 1 ? 2 : u > 0 ? 1 : 0;
}
/** Its gun's way `w` brought down `level` of the way from its firing line to dead level (a touch below, at their chests). */
function levelled(w: V3, level: number): V3 {
  if (level <= 0) return w;
  const h = Math.hypot(w[0], w[1]) || 1;
  const flat: V3 = norm([w[0] / h, w[1] / h, -0.07]);
  return norm(lerp3(w, flat, Math.min(1, level)));
}

/** HIS PICK, 24 Oct, by 09:30: “Boiler ape”, with one giant arm. */
export const GOLEM_PICK = { build: 'ape' as GolemBuild, giant: true };
/** The bodies he is shown with one giant arm (his “I like the one big arm.  Can I get the one big arm on a bunch of golems”). */
export const GIANT_BODIES: { id: GolemBuild; name: string }[] = [
  { id: 'belly', name: 'Furnace belly' },
  { id: 'ape', name: 'Boiler ape' },
  { id: 'bell', name: 'Bell on a spring' },
  { id: 'kettle', name: 'Kettle' },
  { id: 'cauldron', name: 'Cauldron' },
  { id: 'clock', name: 'Grandfather clock' },
  { id: 'anvil', name: 'Anvil' },
  { id: 'ball', name: 'Ball-roller' },
  { id: 'bellows', name: 'Bellows' },
  { id: 'tank', name: 'Tread tank' },
];
/** Turned this much more than the others, to be seen as they are best seen. */
const YAW_OF: Partial<Record<GolemBuild, number>> = { ram: 50 };
/** How much each is scaled from the size it was built at (the rest: made GOLEM_TOP high). */
export const GOLEM_SIZE: Partial<Record<GolemBuild, number>> = { ape: 0.82, tank: 0.9, belly: 0.88, crab: 0.98, crane: 1.12 };
/** How high the top of a Golem stands (a head and more over the knight, as the first four). */
export const GOLEM_TOP = 77;

/** How high a figure's highest solid reaches. */
function topOf(sc: Sculpt): number {
  let top = 0;
  for (const p of sc.prims) {
    if (p.carve) continue;
    let z: number;
    if (p.k === 'cone') z = Math.max(p.a[2] + p.ra, p.b[2] + p.rb);
    else if (p.k === 'tri') z = Math.max(p.a[2], p.b[2], p.c[2]) + p.thick;
    else z = p.c[2] + Math.hypot(p.axes[0][2], p.axes[1][2], p.axes[2][2]) + (p.k === 'box' ? Math.abs(p.axes[0][2]) + Math.abs(p.axes[1][2]) + Math.abs(p.axes[2][2]) - Math.hypot(p.axes[0][2], p.axes[1][2], p.axes[2][2]) : 0);
    top = Math.max(top, z);
  }
  return top;
}

/** Every solid of a figure made `k` times its size about the floor point under it (its cuts and marks with it). */
function scaleBy(sc: Sculpt, k: number): void {
  const m = (p: V3): V3 => [p[0] * k, p[1] * k, p[2] * k];
  for (let i = 0; i < sc.prims.length; i++) {
    const p = sc.prims[i];
    const cuts = p.cuts?.map((c) => ({ n: c.n, o: c.o * k }));
    const blend = p.blend * k;
    if (p.k === 'cone') sc.prims[i] = { ...p, a: m(p.a), b: m(p.b), ra: p.ra * k, rb: p.rb * k, blend, cuts };
    else if (p.k === 'tri') sc.prims[i] = { ...p, a: m(p.a), b: m(p.b), c: m(p.c), thick: p.thick * k, blend, cuts };
    else if (p.k === 'box') sc.prims[i] = { ...p, c: m(p.c), axes: [m(p.axes[0]), m(p.axes[1]), m(p.axes[2])], round: p.round * k, blend, cuts };
    else sc.prims[i] = { ...p, c: m(p.c), axes: [m(p.axes[0]), m(p.axes[1]), m(p.axes[2])], blend, cuts };
  }
  for (const mk of sc.marks) mk.p = m(mk.p);
}
