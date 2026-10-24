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
const COPPER: Ramp = ['#2a0e0a', '#521c12', '#8a3a1e', '#c4642e', '#ec9a56'];
/** The dark inside of it: a grille, a furnace's mouth, the gaps of a tread. */
const DARK: Ramp = ['#0a0810', '#141020', '#201a30', '#2e2640', '#3e3454'];

/** Which Golem: its id and its name for him. */
export type GolemBuild = 'ape' | 'tank' | 'belly' | 'crab';
export const GOLEM_BUILDS: { id: GolemBuild; name: string }[] = [
  { id: 'ape', name: 'Boiler ape' },
  { id: 'tank', name: 'Tread tank' },
  { id: 'belly', name: 'Furnace belly' },
  { id: 'crab', name: 'Crab walker' },
];

/** A Golem, sculpted, standing ready, in one of the game's views; `turn`: truly turned (Sculpt.spin) this many degrees. */
export function sculptGolemBuild(view: GameView, build: GolemBuild, turn = 0, yaw = -14): Drawn {
  const sc = new Sculpt();
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
  const glow = sc.mat({ ramp: CYAN, paint: (h) => (h.tone >= 2 ? '#e8ffff' : CYAN[2]) });
  // ITS HEART: a round furnace window, the friend's cyan behind it, the spokes of a gear turning in the light
  const heart = sc.mat({
    ramp: CYAN,
    paint: (h) => {
      const b = onBall(h.prim as Ell, h.p);
      const ang = Math.atan2(b[1], b[2]);
      const r = Math.hypot(b[1], b[2]);
      if (r > 0.42 && r < 0.74 && Math.floor(((ang + Math.PI) * 10) / Math.PI) % 2 === 0) return BRASS[1];
      if (r < 0.2) return BRASS[1];
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
  const fistAt = (piece: string, c: V3, d: V3, th: V3, R: number): void => {
    const s1 = norm(sub(th, mul(d, th[0] * d[0] + th[1] * d[1] + th[2] * d[2])));
    const s2 = norm(cross(d, s1));
    sc.box(brass, piece, c, [mul(d, R * 0.95), mul(s1, R * 0.92), mul(s2, R)], R * 0.42, 0.6, { tag: 'fist' });
    sc.ell(brass, piece, add(c, add(mul(s1, R * 0.95), mul(d, R * 0.1))), [mul(d, R * 0.55), mul(s1, R * 0.4), mul(s2, R * 0.42)], 0.5, { tag: 'thumb' });
    sc.box(steel, piece, add(c, mul(d, -R * 0.95)), [mul(d, R * 0.24), mul(s1, R * 0.98), mul(s2, R * 1.04)], R * 0.18, 0.2, { tag: 'cuff' });
  };
  /** AN ARM of pistons: a steel ball at its root, a steel rod with a copper piston along it, a steel elbow, a flaring brass gauntlet. */
  const armOf = (piece: string, root: V3, el: V3, wrist: V3, r: number): void => {
    sc.ell(steel, piece, root, X(r * 1.45, r * 1.45, r * 1.45), 0.5, { tag: 'ball' });
    sc.cone(steel, piece, root, el, r, r * 0.85, 0.5, { tag: 'upper' });
    const d = norm(sub(el, root));
    const o = norm(cross(d, F));
    sc.cone(copper, piece, add(lerp3(root, el, 0.2), mul(o, r * 0.95)), add(lerp3(root, el, 0.92), mul(o, r * 0.95)), r * 0.3, r * 0.3, 0.2, { tag: 'piston' });
    sc.ell(steel, piece, el, X(r * 1.1, r * 1.1, r * 1.1), 0.4, { tag: 'joint' });
    sc.cone(brass, piece, el, wrist, r * 1.05, r * 1.5, 0.4, { tag: 'gauntlet' });
  };
  /** A LEG: a steel thigh, a brass knee, a greave flaring to a great flat steel foot on the floor. */
  const legOf = (piece: string, hip: V3, knee: V3, ankle: V3, r: number, footLen: number): void => {
    sc.cone(steel, piece, hip, knee, r, r * 0.85, 0.5, { tag: 'thigh' });
    sc.ell(brass, piece, knee, X(r * 0.95, r * 0.95, r * 0.95), 0.3, { tag: 'kneecap' });
    sc.cone(brass, piece, knee, ankle, r * 0.95, r * 1.2, 0.4, { tag: 'greave' });
    const foot: V3 = [ankle[0], ankle[1], 0];
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
    for (const side of [1, -1]) legOf(side > 0 ? 'legL' : 'legR', P(-12, side * 9, 28), P(-8, side * 12, 15), P(-13, side * 12, 5), 4.4, 6.5);
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
  } else {
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
  }
  // (built at a size easy to think in, then made the size it stands at: a head over the knight, as his brief asked)
  scaleBy(sc, GOLEM_SIZE[build]);
  return draw(sc, view, CANVAS3.ax, CANVAS3.ay, CANVAS3, undefined, FRIEND_RIM);
}

/** How much each is scaled from the size it was built at. */
export const GOLEM_SIZE: Record<GolemBuild, number> = { ape: 0.82, tank: 0.9, belly: 0.88, crab: 0.98 };

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
