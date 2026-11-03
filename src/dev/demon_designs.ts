// TEN DEMONS FOR THE WARLOCK'S CHANGE, TO CHOOSE FROM (the art chat, 26 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His words, 26 Oct, shown the demon's body reworked so it is not shapes: “Gimme 10 different demons.  We want menacing, but
// besides that gimme a bunch of different ones”. Before that, of the demon in his change: “The demon is looking a little
// shapey.  Can we make sure he’s not just shapes?” (his rulebook's How art is made and approved, rule 9, “Real shapes, not
// circles and squares”).
//
// SO: one carved body for a demon, built on the heroes' bones (art/skeleton.ts) to any build, its muscles grown into each
// other with a groove where each meets the next and a rough hide (as the reworked demon, dev/sculpt_demon_rig.ts); and on it
// parts to choose: a head (a brute's, a bare skull, a long goat's face, a great maw, a hound's), horns (a ram's curl, swept
// back, one great horn, antlers, a crown of them, a bull's), wings (a bat's, ragged, two pairs, bare bone, none), a tail (a
// heavy one, a whip, a spiked club, none), legs (a goat's on hooves, or clawed feet), and what else it carries (bone plates,
// spines, chains and broken shackles, its ribs showing, cracks of cyan light, a mane, the rag of his coat). Ten designs of
// them, each its own hide and stance, all facing as he faces, all menacing; what glows on them is the friend's cyan.

import type { Ramp } from '../art/kit';
import { CYAN } from '../art/kit';
import { FRIEND_RIM } from '../art/hero3_knight';
import type { GameView, PaintView } from '../art/skin';
import { add, buildOf, cross, lerp3, mul, norm, solve, standing, sub, trunkOf } from '../art/skeleton';
import type { Bones, Build, Posed, Skeleton, V3 } from '../art/skeleton';
import { Sculpt, draw, onCone } from './sculpt';
import type { Cone, Drawn, Hit, Prim } from './sculpt';
import { HULK_HIDES, drawAura } from './demon_hulk';
import { IVORY, STEEL5, DEMON_RED, handFire } from './sculpt_warlock';
import { demonHand, five, lifted, tone5 } from './sculpt_demon';
import { batWing, clawHand, noise3, onPart } from './sculpt_demon_rig';
import type { DemonWings } from './sculpt_demon_rig';

export type HeadKind = 'brute' | 'skull' | 'long' | 'maw' | 'beast' | 'hood';
/** Its body's plan: a man's on two legs; a wraith's, trailing off into rags and smoke below its waist; a serpent's from the waist down; or bare burning bone. */
export type Plan = 'biped' | 'wraith' | 'serpent' | 'skeleton';
export type HornKind = 'ram' | 'swept' | 'great' | 'antlers' | 'crown' | 'bull' | 'none';
export type WingKind = 'bat' | 'ragged' | 'four' | 'bone' | 'none';
export type TailKind = 'heavy' | 'whip' | 'club' | 'none';
export type LegKind = 'goat' | 'claw';
export type Extra = 'plates' | 'spines' | 'chains' | 'ribs' | 'cracks' | 'mane' | 'rag';

/** One demon: its bones' build and how it stands, its hide and its horn, and its parts. */
export interface DemonDesign {
  name: string;
  plan: Plan;
  /** A fan of spines and skin spread behind its head, as a cobra's hood. */
  frill?: boolean;
  /** What it is, in a few words, for the sheet. */
  says: string;
  B: Build;
  pose: Bones;
  hide: Ramp;
  horn: Ramp;
  head: HeadKind;
  horns: HornKind;
  wings: WingKind;
  /** How big its wings are against its build. */
  wingSize: number;
  wingPose: DemonWings;
  tail: TailKind;
  legs: LegKind;
  /** How thick its muscle is (1 the brute's). */
  bulk: number;
  extras: Extra[];
  /** Its left claw raised with the fire in it (the warlock's demon arm, his fire in it). */
  raised: boolean;
}

/** The scene each is drawn on: big enough for the biggest, wings and all; the floor point under it at (`ax`, `ay`). */
export const DESIGN_CANVAS = { w: 400, h: 380, ax: 200, ay: 312 };

const U: V3 = [0, 0, 1];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
/** `a` with what of it lies along `d` taken out, made a unit. */
const across = (a: V3, d: V3): V3 => norm(sub(a, mul(d, dot(a, d))));

/** A DEMON OF A DESIGN, drawn in one of the game's views (from behind as the camera truly sees it), with its smoke. */
export function sculptDesign(d: DemonDesign, view: GameView): Drawn {
  const pv: PaintView = view === 'back' ? 'rear' : view;
  const s = solve(d.B, d.pose as Posed);
  const sc = new Sculpt();
  const at = designInto(sc, s, d, pv);
  const C = DESIGN_CANVAS;
  const out = draw(sc, pv, C.ax, C.ay, C, (st) => {
    if (at.seat) handFire(st, at.seat, 4.0 * (d.B.tall / 95), 2);
    at.fires.forEach((f, i) => handFire(st, f.p, f.size, 2 + i * 0.37));
  }, FRIEND_RIM);
  drawAura(out.st, out.px, 'smoke', at.aura);
  // NO PIXEL ALONE (his rulebook's Pixels 1)
  const { w, h, d: px } = out.px;
  const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && px[(y * w + x) * 4 + 3] === 255;
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w; x++) {
      if (!solid(x, y) || solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) continue;
      const i = (y * w + x) * 4;
      const j = ((y + 1) * w + x) * 4;
      if (px[j + 3] === 0) {
        for (let c = 0; c < 4; c++) px[j + c] = px[i + c];
      } else px[i + 3] = 0;
    }
  }
  return out;
}

/** THE DEMON'S SCULPTURE, its parts as its design has them, on its bones; where the fire in its raised claw is, and where its smoke pours from. */
export function designInto(sc: Sculpt, s: Skeleton, d: DemonDesign, pv: PaintView): { seat: V3 | null; fires: { p: V3; size: number }[]; aura: { from: V3[]; horns: V3[]; jaw: V3; claws: V3[]; feet: V3[]; behind: boolean } } {
  const B = d.B;
  const k = d.bulk;
  const G = B.tall / 95;
  const has = (e: Extra): boolean => d.extras.includes(e);
  const [F, L, Up] = s.upper;
  const [ribs, belly, pelv] = trunkOf(B, s);
  const nearOf = (p: V3): number => (pv === 'front' ? 0.612 * (p[0] - p[1]) + 0.5 * p[2] : pv === 'rear' ? 0.612 * (-p[0] - p[1]) + 0.5 * p[2] : 0.612 * (p[1] - p[0]) + 0.5 * p[2]);
  const farL = nearOf(add(s.pelvis, mul(s.hips[1], 20))) < nearOf(s.pelvis);
  const far = (piece: string): boolean => (piece.endsWith('L') ? farL : piece.endsWith('R') ? !farL : false);

  // ---- ITS STUFFS: its hide (rough, wrinkled, scarred, the light on the crest of each muscle; cracks of cyan light if it
  // has them), its horn and bone, its hair, iron, the rag of his coat, its mouth, its wings' leather
  // (CLEAN: big planes of light and shade, the light on the crest of each form, as the heroes he has passed are; not a
  // scatter of texture, which reads as crude at this size: his word of the first ten, “They look crude”)
  const hide5 = d.hide;
  const rough = (h: Hit): number => (h.tone === 3 && h.nl > 0.84 ? 1 : 0);
  const cracked = has('cracks');
  const hide = sc.mat({
    ramp: hide5,
    crease: 0.8,
    paint: (h) => {
      const p = h.prim;
      if (cracked && p.k !== 'tri') {
        // (cracks of the pact's light running over it, branching, as on his arm)
        const [a, b, c] = onPart(p, h.p);
        // (a few long cracks, not a scatter: where a slow noise crosses its middle, and only in some stretches of it)
        const n = noise3(a * 0.11 + 3, b * 0.11 + 7, c * 0.11 + 11);
        if (Math.abs(n - 0.5) < 0.04 && noise3(a * 0.05 + 50, b * 0.05, c * 0.05) > 0.42) return h.tone >= 2 ? CYAN[3] : CYAN[2];
      }
      const r = rough(h) + (far(p.piece) ? -1 : 0);
      // (a serpent's belly, banded lighter beneath)
      if (p.tag === 'coil' && h.n[2] < -0.25 && p.k === 'cone') {
        const { t } = onCone(p, h.p, U);
        return tone5(hide5, Math.min(4, h.tone + 1 + (Math.floor(t * 4) % 2 ? 0 : -1)));
      }
      return r ? tone5(hide5, h.tone + r) : null;
    },
  });
  const cloth = sc.mat({ ramp: ['#07060c', '#12101c', '#1e1a2e', '#2e2944', '#443c62'], paint: (h) => (far(h.prim.piece) ? tone5(['#07060c', '#12101c', '#1e1a2e', '#2e2944', '#443c62'], h.tone - 1) : null) });
  const fires: { p: V3; size: number }[] = [];
  const horn = sc.mat({
    ramp: d.horn,
    paint: (h) => {
      if (h.prim.k !== 'cone') return null;
      const { t } = onCone(h.prim as Cone, h.p, U);
      return h.prim.tag === 'ringed' && Math.floor(t * 3.4) % 2 === 0 ? tone5(d.horn, h.tone - 1) : null;
    },
  });
  const bone = sc.mat({ ramp: d.horn });
  const steel = sc.mat({ ramp: STEEL5 });
  const mouth = sc.mat({ ramp: ['#120206', '#2a0610', '#3e0a16', '#5a1220', '#7a1c2a'] });
  const shag = sc.mat({ ramp: hide5, paint: (h) => ((h.x * 2 + (h.y >> 1)) % 5 === 0 ? tone5(hide5, h.tone - 2) : (h.x + h.y * 3) % 7 === 0 ? tone5(hide5, h.tone - 1) : null) });
  const leather = sc.mat({ ramp: ['#0a0306', '#1c0810', '#2e0e18', '#4a1a24', '#6a2a30'], paint: (h) => (h.prim.tag === 'vein' ? tone5(['#0a0306', '#14060b', '#220a12', '#36121b', '#4e1e24'], h.tone) : null) });

  // ---- BARE BONE (a skeleton): its backbone, its ribs round the hellfire burning in its chest, its collarbones and shoulder
  // blades, its hips
  const skel = d.plan === 'skeleton';
  const bknob = (piece: string, p: V3, r: number): void => {
    sc.ell(bone, piece, p, [mul(F, r), mul(L, r), mul(U, r)], 0.5 * G, { tag: 'knob' });
  };
  if (skel) {
    const [rf, rl, ru] = ribs.r;
    const spine = [s.pelvis, s.waist, s.ribs, s.back, s.neck];
    for (let i = 0; i + 1 < spine.length; i++) {
      sc.cone(bone, 'torso', spine[i], spine[i + 1], 1.6 * G, 1.4 * G, 0.5 * G, { tag: 'spine' });
      for (let j = 0; j < 3; j++) {
        const p = lerp3(spine[i], spine[i + 1], j / 3);
        bknob('torso', p, 1.9 * G);
        sc.cone(bone, 'torso', p, add(p, add(mul(F, -3.2 * G), mul(Up, -1.2 * G))), 1.0 * G, 0.3 * G, 0.3 * G, { tag: 'process' });
      }
    }
    for (let i = 0; i < 5; i++) {
      const z = ribs.h[2] * (0.55 - i * 0.27);
      const w = 1 - i * 0.05;
      for (const side of [1, -1]) {
        const P = (f: number, l: number, dz: number): V3 => add(ribs.c, add(mul(rf, ribs.h[0] * f), add(mul(rl, side * ribs.h[1] * l * w), mul(ru, z - dz * G))));
        const pts = [P(-0.72, 0.12, 0), P(-0.35, 0.86, 1), P(0.35, 0.92, 2.5), P(0.8, 0.26, 3.5)];
        for (let j = 0; j + 1 < pts.length; j++) sc.cone(bone, 'torso', pts[j], pts[j + 1], 1.0 * G, 0.9 * G, 0.4 * G, { tag: 'rib' });
      }
    }
    sc.cone(bone, 'torso', add(ribs.c, add(mul(rf, ribs.h[0] * 0.82), mul(ru, ribs.h[2] * 0.62))), add(ribs.c, add(mul(rf, ribs.h[0] * 0.78), mul(ru, -ribs.h[2] * 0.4))), 1.5 * G, 1.0 * G, 0.5 * G, { tag: 'sternum' });
    for (const side of [1, -1]) {
      const sh = side > 0 ? s.shoulderL : s.shoulderR;
      sc.cone(bone, 'torso', add(s.neck, add(mul(F, ribs.h[0] * 0.55), mul(L, side * 1.5 * G))), sh, 1.2 * G, 1.0 * G, 0.4 * G, { tag: 'clavicle' });
      // (a shoulder blade, a flat plate on its back)
      sc.ell(bone, 'torso', add(ribs.c, add(mul(rf, -ribs.h[0] * 0.85), add(mul(rl, side * ribs.h[1] * 0.45), mul(ru, ribs.h[2] * 0.35)))), [mul(rf, 1.0 * G), mul(rl, ribs.h[1] * 0.32), mul(ru, ribs.h[2] * 0.42)], 0.6 * G, { tag: 'scapula' });
      // (its hip bone, a flared plate each side)
      sc.ell(bone, 'hips', add(pelv.c, add(mul(pelv.r[1], side * pelv.h[1] * 0.55), mul(pelv.r[2], pelv.h[2] * 0.3))), [mul(pelv.r[0], pelv.h[0] * 0.7), mul(pelv.r[1], pelv.h[1] * 0.25), mul(pelv.r[2], pelv.h[2] * 0.7)], 0.8 * G, { tag: 'ilium' });
    }
    sc.cone(bone, 'head', s.neck, s.skull, 1.5 * G, 1.3 * G, 0.4 * G, { tag: 'neck' });
    for (let j = 0; j < 3; j++) bknob('head', lerp3(s.neck, s.skull, j / 3), 1.8 * G);
    // (THE HELLFIRE in its chest, seen through its ribs; and licking up its backbone)
    fires.push({ p: ribs.c, size: 4.6 * G }, { p: add(s.back, mul(F, -2 * G)), size: 2.6 * G }, { p: lerp3(s.waist, s.ribs, 0.5), size: 2.2 * G });
  }
  if (!skel) {
    // ---- THE TRUNK: one body, its muscles grown into each other with a groove where each meets the next
    const [rf, rl, ru] = ribs.r;
    const [bf, bl, bu] = belly.r;
    const gaunt = has('ribs');
    sc.ell(hide, 'torso', ribs.c, [mul(rf, ribs.h[0] * 0.95), mul(rl, ribs.h[1] * 0.95), mul(ru, ribs.h[2])], 2.2 * G, { tag: 'chest' });
    sc.ell(hide, 'torso', add(belly.c, mul(bf, gaunt ? -0.2 * belly.h[0] : 0)), [mul(bf, belly.h[0] * (gaunt ? 0.72 : 1)), mul(bl, belly.h[1] * (gaunt ? 0.8 : 1)), mul(bu, belly.h[2])], 2.0 * G, { tag: 'belly' });
    sc.ell(hide, 'hips', pelv.c, [mul(pelv.r[0], pelv.h[0] * 0.95), mul(pelv.r[1], pelv.h[1] * 0.95), mul(pelv.r[2], pelv.h[2])], 2.0 * G, { tag: 'pelvis' });
    // (the hump of its back over its shoulders, and the trapezius from its neck out to each)
    sc.ell(hide, 'torso', add(s.neck, add(mul(F, -ribs.h[0] * 0.5), mul(Up, -B.chest * 0.16))), [mul(F, ribs.h[0] * 0.62 * k), mul(L, ribs.h[1] * 0.78), mul(Up, B.chest * 0.34 * k)], 2.0 * G, { tag: 'hump' });
    for (const side of [1, -1]) {
      const sh = side > 0 ? s.shoulderL : s.shoulderR;
      sc.cone(hide, 'torso', add(s.neck, mul(F, -1.5 * G)), add(sh, mul(Up, 2 * G)), ribs.h[1] * 0.3 * k, ribs.h[1] * 0.22 * k, 1.4 * G, { tag: 'trap' });
      // its breast, slabs over the ribs, a groove between; their outer edge rolling up into the armpit
      sc.ell(hide, 'torso', add(ribs.c, add(mul(rf, ribs.h[0] * 0.62), add(mul(rl, side * ribs.h[1] * 0.42), mul(ru, ribs.h[2] * 0.32)))), [mul(rf, ribs.h[0] * 0.34 * k), mul(rl, ribs.h[1] * 0.5), mul(ru, ribs.h[2] * 0.36 * k)], 0.9 * G, { tag: 'chest' });
      // the collarbone
      sc.cone(hide, 'torso', add(s.neck, add(mul(F, ribs.h[0] * 0.5), mul(L, side * 2 * G))), add(sh, mul(F, 2 * G)), 1.6 * G, 1.3 * G, 0.8 * G, { tag: 'clavicle' });
      // fingers of muscle down its flanks, its flanks' slabs, the lats flaring under its arms
      for (let i = 0; i < 3; i++) sc.ell(hide, 'torso', add(ribs.c, add(mul(rf, ribs.h[0] * (0.5 - i * 0.06)), add(mul(rl, side * ribs.h[1] * (0.86 - i * 0.03)), mul(ru, ribs.h[2] * (-0.05 - i * 0.22))))), [mul(rf, 2.4 * G), mul(rl, 2.0 * G), mul(ru, 1.6 * G)], 0.5 * G, { tag: 'serratus' });
      sc.ell(hide, 'torso', add(belly.c, add(mul(bf, belly.h[0] * 0.3), mul(bl, side * belly.h[1] * 0.9))), [mul(bf, belly.h[0] * 0.5), mul(bl, belly.h[1] * 0.32 * k), mul(bu, belly.h[2] * 0.7)], 1.2 * G, { tag: 'oblique' });
      sc.ell(hide, 'torso', add(ribs.c, add(mul(rf, -ribs.h[0] * 0.4), mul(rl, side * ribs.h[1] * 0.85))), [mul(rf, ribs.h[0] * 0.45), mul(rl, ribs.h[1] * 0.26 * k), mul(ru, ribs.h[2] * 0.8)], 1.4 * G, { tag: 'lat' });
      // ITS RIBS SHOWING (a gaunt one): each a bar of bone under the hide, round its side
      if (gaunt) {
        for (let i = 0; i < 4; i++) {
          const up = ribs.h[2] * (0.1 - i * 0.24);
          const a0 = add(ribs.c, add(mul(rf, ribs.h[0] * 0.82), add(mul(rl, side * ribs.h[1] * 0.25), mul(ru, up))));
          const a1 = add(ribs.c, add(mul(rf, ribs.h[0] * 0.35), add(mul(rl, side * ribs.h[1] * 0.92), mul(ru, up - 2 * G))));
          const a2 = add(ribs.c, add(mul(rf, -ribs.h[0] * 0.3), add(mul(rl, side * ribs.h[1] * 0.9), mul(ru, up - 3.5 * G))));
          sc.cone(hide, 'torso', a0, a1, 1.3 * G, 1.2 * G, 0.6 * G, { tag: 'rib' });
          sc.cone(hide, 'torso', a1, a2, 1.2 * G, 1.0 * G, 0.6 * G, { tag: 'rib' });
        }
      }
    }
    // its belly, three rows of muscle (sunk in on a gaunt one)
    if (!gaunt) for (const row of [0.62, 0.05, -0.52]) for (const side of [1, -1]) sc.ell(hide, 'torso', add(belly.c, add(mul(bf, belly.h[0] * 0.86), add(mul(bl, side * belly.h[1] * 0.3), mul(bu, belly.h[2] * row)))), [mul(bf, belly.h[0] * 0.24), mul(bl, belly.h[1] * 0.3), mul(bu, belly.h[2] * 0.26)], 0.6 * G, { tag: 'abs' });
    // the knuckles of its backbone down the hump
    for (let i = 0; i < 5; i++) sc.ell(hide, 'torso', add(s.neck, add(mul(F, -ribs.h[0] * (0.95 + i * 0.04)), mul(Up, -B.chest * (0.05 + i * 0.2)))), [mul(F, 2.2 * G), mul(L, 2.5 * G), mul(Up, 2 * G)], 0.6 * G, { tag: 'backbone' });
    // the neck, thick, its cords from behind its jaw down to its throat
    sc.cone(hide, 'head', add(s.neck, mul(Up, -2 * G)), s.skull, B.headR[1] * 0.62 * k, B.headR[1] * 0.5, 2.0 * G, { tag: 'neck' });
  }

  // ---- THE HEAD (its face's own ways: forward, its left, up)
  const [hf, hl, hu] = s.face;
  const R = B.headR;
  const H = (fw: number, lf: number, up: number): V3 => add(s.head, add(mul(hf, R[0] * fw), add(mul(hl, R[1] * lf), mul(hu, R[2] * up))));
  const HX = (a: number, b: number, c: number): readonly [V3, V3, V3] => [mul(hf, R[0] * a), mul(hl, R[1] * b), mul(hu, R[2] * c)];
  const eyes = (fw: number, lf: number, up: number, n = 2): void => {
    const rows = n === 4 ? [[lf, up + 0.12], [lf * 0.7, up - 0.1]] : [[lf, up]];
    for (const [l0, u0] of rows) for (const side of [1, -1]) {
      sc.mark(H(fw, side * l0, u0), '#ffffff', 3, 1, side > 0 ? 0 : -2, 0, 3);
      sc.mark(H(fw, side * l0, u0), CYAN[3], 3, 1, side > 0 ? 1 : -3, 1, 3);
      sc.mark(H(fw, side * l0, u0), CYAN[2], 1, 1, side > 0 ? 3 : -3, -1, 3);
    }
  };
  const fangs = (fw: number, lf: number, up: number, down: boolean, n: number, size: number): void => {
    for (let i = 0; i < n; i++) {
      const l0 = (i / Math.max(1, n - 1) - 0.5) * 2 * lf;
      const root = H(fw - Math.abs(l0) * 0.25, l0, up);
      sc.cone(bone, 'jaw', root, add(root, mul(hu, (down ? -1 : 1) * R[2] * size * (i % 2 ? 0.7 : 1))), 0.8 * G, 0.05, 0.1, { tag: 'fang' });
    }
  };
  let jaw = H(0.8, 0, -0.5);
  if (d.head === 'brute') {
    // a brute's: a skull low under a heavy brow, a blunt snout, a heavy jaw hanging open, fangs, cheekbones
    sc.ell(hide, 'head', H(-0.15, 0, 0.1), HX(0.85, 0.9, 0.8), 1.4 * G, { tag: 'skull' });
    // (its brow drawn down hard in a V over its eyes: menace, his “Not scary enough”)
    for (const side of [1, -1]) sc.cone(hide, 'head', H(0.78, side * 0.08, 0.1), H(0.55, side * 0.85, 0.48), R[2] * 0.2, R[2] * 0.16, 0.5 * G, { tag: 'brow' });
    for (const side of [1, -1]) sc.ell(hide, 'head', H(0.45, side * 0.62, -0.08), HX(0.34, 0.3, 0.34), 0.7 * G, { tag: 'cheek' });
    // (the bridge of its snout wrinkled in a snarl)
    for (let i = 0; i < 2; i++) sc.ell(hide, 'head', H(0.98 - i * 0.12, 0, 0.12 - i * 0.1), HX(0.12, 0.3, 0.06), 0.3 * G, { tag: 'snarl' });
    sc.box(hide, 'head', H(0.78, 0, -0.12), HX(0.42, 0.52, 0.32), 0.25 * R[0], 0.8 * G, { tag: 'snout' });
    sc.box(hide, 'jaw', H(0.6, 0, -0.68), HX(0.55, 0.66, 0.24), 0.2 * R[0], 0.8 * G, { tag: 'jaw' });
    sc.ell(mouth, 'jaw', H(0.82, 0, -0.42), HX(0.4, 0.5, 0.2), 0.4 * G, { tag: 'maw' });
    fangs(1.05, 0.38, -0.36, true, 4, 0.32);
    fangs(1.0, 0.36, -0.52, false, 4, 0.26);
    for (const side of [1, -1]) sc.cone(hide, 'head', H(-0.1, side * 0.7, 0.35), H(-0.55, side * 1.25, 0.6), 0.22 * R[1], 0.02, 0.6 * G, { tag: 'ear' });
    eyes(0.86, 0.34, 0.12);
    jaw = H(0.85, 0, -0.6);
  } else if (d.head === 'skull') {
    // a bare skull: bone, deep sockets with the light far back in them, cheekbones, the hole of its nose, its teeth bared, its
    // jaw hanging
    sc.ell(bone, 'head', H(-0.1, 0, 0.18), HX(0.9, 0.82, 0.82), 1.0 * G, { tag: 'skull' });
    sc.ell(bone, 'head', H(0.55, 0, 0.3), HX(0.28, 0.8, 0.2), 0.5 * G, { tag: 'brow' });
    sc.box(bone, 'head', H(0.62, 0, -0.18), HX(0.4, 0.55, 0.3), 0.2 * R[0], 0.6 * G, { tag: 'face' });
    for (const side of [1, -1]) {
      sc.ell(bone, 'head', H(0.82, side * 0.36, 0.08), HX(0.3, 0.24, 0.2), 0.3 * G, { tag: 'socket', carve: true });
      sc.ell(bone, 'head', H(0.5, side * 0.62, -0.12), HX(0.3, 0.2, 0.18), 0.4 * G, { tag: 'cheek' });
    }
    sc.ell(bone, 'head', H(0.98, 0, -0.14), HX(0.14, 0.1, 0.12), 0.2 * G, { tag: 'nose', carve: true });
    sc.box(bone, 'jaw', H(0.55, 0, -0.78), HX(0.48, 0.52, 0.16), 0.15 * R[0], 0.5 * G, { tag: 'jaw' });
    sc.ell(mouth, 'jaw', H(0.7, 0, -0.5), HX(0.32, 0.42, 0.16), 0.3 * G, { tag: 'maw' });
    fangs(0.95, 0.4, -0.42, true, 6, 0.2);
    fangs(0.9, 0.38, -0.66, false, 6, 0.18);
    eyes(0.72, 0.36, 0.08);
    jaw = H(0.75, 0, -0.7);
  } else if (d.head === 'long') {
    // a long goat's face: a narrow skull, a long muzzle drawn down, slit nostrils, a beard of bone spines at its chin
    sc.ell(hide, 'head', H(-0.25, 0, 0.2), HX(0.72, 0.78, 0.7), 1.2 * G, { tag: 'skull' });
    sc.ell(hide, 'head', H(0.35, 0, 0.32), HX(0.3, 0.8, 0.2), 0.6 * G, { tag: 'brow' });
    sc.cone(hide, 'head', H(0.3, 0, -0.05), H(1.45, 0, -0.55), R[1] * 0.5, R[1] * 0.26, 1.0 * G, { tag: 'snout' });
    sc.cone(hide, 'jaw', H(0.2, 0, -0.45), H(1.25, 0, -0.8), R[1] * 0.38, R[1] * 0.2, 0.8 * G, { tag: 'jaw' });
    sc.ell(mouth, 'jaw', H(1.0, 0, -0.66), HX(0.3, 0.2, 0.12), 0.3 * G, { tag: 'maw' });
    fangs(1.3, 0.14, -0.62, true, 2, 0.24);
    for (let i = 0; i < 4; i++) {
      const r0 = H(0.9 - i * 0.18, (i - 1.5) * 0.12, -0.92);
      sc.cone(bone, 'jaw', r0, add(r0, add(mul(hu, -R[2] * (0.5 + (i % 2) * 0.2)), mul(hf, -R[0] * 0.15))), 0.7 * G, 0.05, 0.2, { tag: 'beard' });
    }
    eyes(0.42, 0.44, 0.12);
    jaw = H(1.2, 0, -0.75);
  } else if (d.head === 'maw') {
    // A GREAT MAW: a head that is mostly mouth, its jaws gaping, rows of teeth, four small eyes over it
    sc.ell(hide, 'head', H(-0.3, 0, 0.25), HX(0.75, 0.9, 0.6), 1.2 * G, { tag: 'skull' });
    sc.box(hide, 'head', H(0.55, 0, 0.12), HX(0.6, 0.95, 0.3), 0.25 * R[0], 1.0 * G, { tag: 'upperjaw' });
    sc.box(hide, 'jaw', H(0.5, 0, -1.0), HX(0.6, 0.9, 0.24), 0.22 * R[0], 0.8 * G, { tag: 'jaw' });
    sc.ell(mouth, 'jaw', H(0.62, 0, -0.45), HX(0.5, 0.8, 0.42), 0.5 * G, { tag: 'maw' });
    fangs(1.1, 0.8, -0.16, true, 7, 0.36);
    fangs(1.05, 0.76, -0.78, false, 7, 0.32);
    for (const side of [1, -1]) sc.ell(hide, 'head', H(0.1, side * 0.95, -0.4), HX(0.4, 0.2, 0.5), 0.8 * G, { tag: 'hinge' });
    eyes(0.75, 0.3, 0.46, 4);
    jaw = H(0.9, 0, -0.5);
  } else if (d.head === 'hood') {
    // A DEEP HOOD over a face of bone: the hood round and over its head, peaked behind, open before; in its dark, only the
    // bone of its brow and jaw caught, its teeth, and its eyes burning (the warlock's own hood, grown over the thing he became)
    sc.ell(cloth, 'head', H(-0.25, 0, 0.18), HX(1.4, 1.32, 1.38), 1.0 * G, { tag: 'hood' });
    sc.cone(cloth, 'head', H(-0.7, 0, 0.75), H(-1.7, 0, 1.25), R[1] * 0.6, R[1] * 0.08, 0.8 * G, { tag: 'hood' });
    sc.ell(cloth, 'head', H(1.05, 0, -0.1), HX(0.95, 0.78, 0.95), 0.5 * G, { tag: 'hood', carve: true });
    sc.ell(bone, 'head', H(0.15, 0, 0.05), HX(0.72, 0.7, 0.74), 0.8 * G, { tag: 'skull' });
    for (const side of [1, -1]) sc.cone(bone, 'head', H(0.66, side * 0.08, 0.16), H(0.5, side * 0.7, 0.4), R[2] * 0.16, R[2] * 0.12, 0.4 * G, { tag: 'brow' });
    sc.box(bone, 'jaw', H(0.45, 0, -0.62), HX(0.42, 0.5, 0.16), 0.15 * R[0], 0.5 * G, { tag: 'jaw' });
    sc.ell(mouth, 'jaw', H(0.6, 0, -0.38), HX(0.3, 0.42, 0.18), 0.3 * G, { tag: 'maw' });
    fangs(0.82, 0.38, -0.28, true, 6, 0.22);
    fangs(0.78, 0.36, -0.52, false, 6, 0.2);
    eyes(0.7, 0.32, 0.12);
    jaw = H(0.7, 0, -0.55);
  } else {
    // A HOUND'S HEAD: a long muzzle, its lips drawn back off its fangs, its ears laid back
    sc.ell(hide, 'head', H(-0.15, 0, 0.12), HX(0.8, 0.85, 0.72), 1.2 * G, { tag: 'skull' });
    sc.ell(hide, 'head', H(0.45, 0, 0.3), HX(0.3, 0.8, 0.2), 0.6 * G, { tag: 'brow' });
    sc.cone(hide, 'head', H(0.35, 0, -0.05), H(1.35, 0, -0.22), R[1] * 0.52, R[1] * 0.3, 1.0 * G, { tag: 'snout' });
    sc.ell(mouth, 'head', H(1.42, 0, -0.18), HX(0.12, 0.16, 0.1), 0.2 * G, { tag: 'nose' });
    sc.cone(hide, 'jaw', H(0.3, 0, -0.55), H(1.2, 0, -0.62), R[1] * 0.36, R[1] * 0.2, 0.8 * G, { tag: 'jaw' });
    sc.ell(mouth, 'jaw', H(0.85, 0, -0.42), HX(0.42, 0.24, 0.12), 0.3 * G, { tag: 'maw' });
    fangs(1.2, 0.18, -0.36, true, 2, 0.34);
    fangs(1.1, 0.16, -0.54, false, 2, 0.26);
    for (const side of [1, -1]) sc.cone(hide, 'head', H(-0.05, side * 0.6, 0.45), H(-0.85, side * 0.85, 0.75), 0.28 * R[1], 0.03, 0.6 * G, { tag: 'ear' });
    eyes(0.62, 0.4, 0.14);
    jaw = H(1.1, 0, -0.5);
  }

  // (A FRILL behind its head, as a cobra's hood: long spines fanned out round it, skin between)
  if (d.frill) {
    const fr: V3[] = [];
    const o = H(-0.55, 0, -0.1);
    for (let i = 0; i < 7; i++) {
      const a = ((i - 3) / 3) * 1.25;
      const way = norm(add(mul(hl, Math.sin(a) * 1.0), add(mul(hu, Math.cos(a) * 0.75 + 0.1), mul(hf, -0.45))));
      const tip = add(o, mul(way, R[2] * (2.0 - Math.abs(i - 3) * 0.15)));
      sc.cone(bone, 'frill', o, tip, R[1] * 0.12, 0.15, 0.3 * G, { tag: 'spine' });
      fr.push(tip);
    }
    for (let i = 0; i + 1 < fr.length; i++) {
      const m = add(lerp3(fr[i], fr[i + 1], 0.5), mul(sub(o, lerp3(fr[i], fr[i + 1], 0.5)), 0.3));
      sc.tri(leather, 'frill', o, fr[i], m, 0.6 * G, 0.4 * G, { tag: 'membrane' });
      sc.tri(leather, 'frill', o, m, fr[i + 1], 0.6 * G, 0.4 * G, { tag: 'membrane' });
    }
  }

  // ---- ITS HORNS
  const hornTips: V3[] = [];
  const hornChain = (pts: V3[], r0: number, ringed = true): void => {
    let r = r0;
    const step = r0 / (pts.length - 0.5);
    for (let i = 0; i + 1 < pts.length; i++) {
      sc.cone(horn, 'horns', pts[i], pts[i + 1], r, Math.max(0.25, r - step), 0.6 * G, { tag: ringed && i % 2 ? 'ringed' : 'horn' });
      r = Math.max(0.25, r - step);
    }
    hornTips.push(pts[pts.length - 1]);
  };
  const hr = R[0] * 0.36;
  for (const side of [1, -1]) {
    const S = (fw: number, lf: number, up: number): V3 => H(fw, side * lf, up);
    if (d.horns === 'ram') hornChain([S(0.0, 0.55, 0.62), S(-0.05, 1.1, 0.95), S(0.35, 1.6, 1.15), S(0.95, 1.7, 1.0), S(1.3, 1.45, 0.6)], hr);
    else if (d.horns === 'swept') hornChain([S(0.25, 0.5, 0.62), S(-0.3, 0.72, 1.2), S(-1.0, 0.85, 1.6), S(-1.8, 0.82, 1.78), S(-2.5, 0.7, 1.62)], hr * 0.9);
    else if (d.horns === 'bull') hornChain([S(0.05, 0.8, 0.45), S(0.0, 1.5, 0.62), S(0.45, 2.0, 0.95), S(1.1, 2.0, 1.3), S(1.55, 1.75, 1.55)], hr * 1.05);
    else if (d.horns === 'antlers') {
      const beam = [S(0.0, 0.48, 0.72), S(-0.15, 1.0, 1.5), S(-0.45, 1.45, 2.3), S(-0.75, 1.55, 3.05)];
      hornChain(beam, hr * 0.55, false);
      hornChain([beam[1], S(0.4, 1.15, 2.1), S(0.65, 1.2, 2.6)], hr * 0.35, false);
      hornChain([beam[2], S(-0.1, 1.9, 2.8), S(-0.05, 2.25, 3.3)], hr * 0.3, false);
      hornChain([beam[2], S(-0.9, 1.4, 2.9)], hr * 0.28, false);
    } else if (d.horns === 'great' && side > 0) {
      hornChain([H(0.85, 0, 0.22), H(1.25, 0, 0.8), H(1.4, 0, 1.45), H(1.15, 0, 2.05)], hr * 1.5);
    } else if (d.horns === 'great') {
      for (const sd2 of [1, -1]) hornChain([H(0.35, sd2 * 0.5, 0.55), H(0.3, sd2 * 0.75, 0.95)], hr * 0.55, false);
    } else if (d.horns === 'crown' && side > 0) {
      for (let i = 0; i < 7; i++) {
        const a = ((i - 3) / 3) * 2.4;
        const base = H(-0.1 + Math.cos(a) * 0.45, Math.sin(a) * 0.65, 0.68);
        const way = norm(add(mul(hu, 1), add(mul(hf, Math.cos(a) * 0.35 - 0.25), mul(hl, Math.sin(a) * 0.5))));
        const l0 = R[2] * (i === 3 ? 1.5 : 1.05 - Math.abs(i - 3) * 0.12);
        hornChain([base, add(base, mul(way, l0 * 0.55)), add(base, add(mul(way, l0), mul(hf, -R[0] * 0.15)))], hr * 0.5, false);
      }
    }
  }

  // ---- THE ARMS: a boulder of a shoulder, biceps and triceps, a point of bone at the elbow, forearms twisting to the wrist;
  // hands like shovels, long hooked claws
  const [aS, aE, aW] = B.armR;
  let seat: V3 | null = null;
  const claws: V3[] = [];
  for (const side of [1, -1] as const) {
    const piece = side > 0 ? 'armL' : 'armR';
    const sh = side > 0 ? s.shoulderL : s.shoulderR;
    const el = side > 0 ? s.elbowL : s.elbowR;
    const ha = side > 0 ? s.handL : s.handR;
    const outA = mul(L, side);
    const ad = norm(sub(el, sh));
    const f1 = across(F, ad);
    const o1 = dot(cross(ad, f1), outA) < 0 ? mul(cross(ad, f1), -1) : cross(ad, f1);
    const fd = norm(sub(ha, el));
    const f2 = across(F, fd);
    const o2 = dot(cross(fd, f2), outA) < 0 ? mul(cross(fd, f2), -1) : cross(fd, f2);
    const ua = len(sub(el, sh));
    const fa = len(sub(ha, el));
    if (skel) {
      // (bare bone: the bone of the upper arm, two of the forearm side by side, a knob at each joint; fire licking along it)
      sc.cone(bone, piece, sh, el, 1.7 * G, 1.3 * G, 0.5 * G, { tag: 'humerus' });
      bknob(piece, sh, 2.6 * G);
      bknob(piece, el, 2.0 * G);
      const sd2 = mul(o2, 0.9 * G);
      sc.cone(bone, piece, add(el, sd2), add(ha, sd2), 1.1 * G, 0.9 * G, 0.4 * G, { tag: 'radius' });
      sc.cone(bone, piece, sub(el, sd2), sub(ha, sd2), 1.0 * G, 0.8 * G, 0.4 * G, { tag: 'ulna' });
      fires.push({ p: lerp3(sh, el, 0.45), size: 1.7 * G });
    } else {
    sc.ell(hide, piece, sh, [mul(F, aS * 1.05 * k), mul(L, aS * 1.05 * k), mul(Up, aS * k)], 1.6 * G, { tag: 'delt' });
    sc.ell(hide, piece, add(sh, add(mul(ad, ua * 0.15), mul(o1, aS * 0.45))), [mul(ad, ua * 0.22), mul(o1, aS * 0.62 * k), mul(f1, aS * 0.85 * k)], 1.0 * G, { tag: 'delt' });
    sc.cone(hide, piece, sh, lerp3(sh, el, 0.5), aS * 0.82, aS * 0.85, 1.4 * G, { tag: 'upper' });
    sc.cone(hide, piece, lerp3(sh, el, 0.5), el, aS * 0.85, aE * 0.8, 1.4 * G, { tag: 'upper' });
    sc.ell(hide, piece, add(lerp3(sh, el, 0.55), mul(f1, aS * 0.46)), [mul(ad, ua * 0.26), mul(o1, aS * 0.62 * k), mul(f1, aS * 0.56 * k)], 0.8 * G, { tag: 'bicep' });
    sc.ell(hide, piece, add(lerp3(sh, el, 0.42), mul(f1, -aS * 0.48)), [mul(ad, ua * 0.29), mul(o1, aS * 0.64 * k), mul(f1, aS * 0.6 * k)], 0.8 * G, { tag: 'tricep' });
    sc.cone(hide, piece, add(el, mul(f1, -aE * 0.45)), add(el, add(mul(f1, -aE * 1.15), mul(ad, aE * 0.2))), aE * 0.45, aE * 0.12, 0.8 * G, { tag: 'elbowpoint' });
    sc.cone(hide, piece, el, lerp3(el, ha, 0.35), aE * 0.88, aE * 1.0 * k, 1.4 * G, { tag: 'fore' });
    sc.cone(hide, piece, lerp3(el, ha, 0.35), ha, aE * 1.0 * k, aW * 0.92, 1.4 * G, { tag: 'fore' });
    sc.ell(hide, piece, add(lerp3(el, ha, 0.28), add(mul(o2, aE * 0.48), mul(f2, aE * 0.3))), [mul(fd, fa * 0.23), mul(o2, aE * 0.62 * k), mul(f2, aE * 0.62 * k)], 0.8 * G, { tag: 'foreBulge' });
    sc.ell(hide, piece, add(lerp3(el, ha, 0.32), add(mul(o2, -aE * 0.45), mul(f2, -aE * 0.24))), [mul(fd, fa * 0.21), mul(o2, aE * 0.54 * k), mul(f2, aE * 0.56 * k)], 0.8 * G, { tag: 'foreBulge' });
    }
    // (bone plates over the shoulder, a spike off the biggest; down the forearm)
    if (has('plates')) {
      for (const [i, r] of [[0, 1.0], [1, 0.8], [2, 0.62]] as const) {
        const c = add(sh, add(mul(Up, aS * (1.0 - i * 0.38)), add(mul(F, aS * (-0.3 + i * 0.35)), mul(outA, aS * (0.35 - i * 0.12)))));
        sc.ell(bone, piece, c, [mul(F, aS * 0.85 * r), mul(L, aS * 0.95 * r), mul(Up, aS * 0.45 * r)], 0.4 * G, { tag: 'plate' });
      }
      const s0 = add(sh, add(mul(Up, aS * 1.4), mul(outA, aS * 0.3)));
      sc.cone(bone, piece, s0, add(s0, add(mul(Up, aS * 1.2), add(mul(outA, aS * 0.7), mul(F, -aS * 0.3)))), aS * 0.4, 0.2, 0.4 * G, { tag: 'spike' });
      for (let i = 1; i <= 3; i++) sc.ell(bone, piece, add(lerp3(el, ha, 0.2 + i * 0.2), mul(o2, aE * 0.92)), [mul(fd, fa * 0.1), mul(o2, aE * 0.3), mul(f2, aE * 0.45)], 0.5 * G, { tag: 'plate' });
    }
    if (has('spines')) for (let i = 1; i <= 3; i++) {
      const p = lerp3(el, ha, 0.12 + i * 0.2);
      sc.cone(bone, piece, add(p, mul(f2, -aE * 0.7)), add(p, add(mul(f2, -aE * (1.9 - i * 0.25)), mul(fd, -aE * 0.3))), aE * 0.3, 0.15, 0.5 * G, { tag: 'spine' });
    }
    // (broken shackles: cuffs of iron riveted round, a hinge, the latch snapped open, a length of chain)
    if (has('chains')) {
      const cuff = lerp3(ha, el, 0.2);
      const r1 = norm(cross(fd, Math.abs(fd[2]) < 0.9 ? U : F));
      const r2 = cross(fd, r1);
      const cr = aW * 1.3;
      sc.cone(steel, piece, add(cuff, mul(fd, -aW * 0.4)), add(cuff, mul(fd, aW * 0.4)), cr * 0.95, cr * 1.05, 0.4 * G, { tag: 'shackle' });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.5;
        const dd = add(mul(r1, Math.cos(a)), mul(r2, Math.sin(a)));
        sc.ell(steel, piece, add(cuff, mul(dd, cr * 1.02)), [mul(dd, 0.8 * G), mul(fd, 0.9 * G), mul(cross(fd, dd), 0.9 * G)], 0.2 * G, { tag: 'rivet' });
      }
      sc.cone(steel, piece, add(cuff, add(mul(r1, -cr), mul(fd, 0))), add(cuff, add(mul(r1, -cr * 1.45), mul(fd, aW * 0.3))), 1.4 * G, 0.6 * G, 0.3 * G, { tag: 'latch' });
      for (let i = 0; i < 4; i++) {
        const p = add(cuff, add(mul(U, -(i * 4.2 + 3) * G), mul(F, (2 + i * 0.6) * G)));
        sc.ell(steel, piece, p, [mul(F, 1.5 * G), mul(L, (i % 2 ? 0.8 : 2.0) * G), mul(U, 2.4 * G)], 0, { tag: 'link' });
      }
    }
    if (d.plan === 'wraith') {
      // (a loose sleeve of rags over its upper arm, flaring past its elbow, torn)
      for (const off of [-1, 1]) {
        const rootS = add(el, add(mul(fd, aE * 0.6), mul(o2, off * aE * 1.2)));
        sc.cone(cloth, piece, rootS, add(rootS, add(mul(U, -aE * 3.2), mul(fd, aE * 0.8))), aE * 0.8, 0.3 * G, 0.5 * G, { tag: 'sleeve' });
      }
    }
    const raised = side > 0 && d.raised;
    if (raised) {
      const fire = demonHand(sc, skel ? bone : hide, bone, piece, ha, el, true, G * (aW / 5.0) * (skel ? 0.75 : 0.95));
      if (fire) seat = fire;
    } else clawHand(sc, skel ? bone : hide, bone, piece, ha, el, F, G * (aW / 5.0) * (skel ? 1.0 : 1.35));
    claws.push(ha);
  }

  // ---- THE LEGS: a goat's, its hock high, coarse hair down its shank, a cloven hoof; or a beast's, clawed feet
  const [lH, lK, lA] = B.legR;
  const feet: V3[] = [];
  if (d.plan === 'biped' || skel) for (const side of [1, -1] as const) {
    const piece = side > 0 ? 'legL' : 'legR';
    const hip = side > 0 ? s.hipL : s.hipR;
    const knee = side > 0 ? s.kneeL : s.kneeR;
    const ankle = side > 0 ? s.ankleL : s.ankleR;
    const toe = side > 0 ? s.toeL : s.toeR;
    const heel = side > 0 ? s.heelL : s.heelR;
    const td = norm(sub(knee, hip));
    const f3 = across(s.hips[0], td);
    const o3 = cross(td, f3);
    const tl = len(sub(knee, hip));
    if (skel) {
      // (bare bone: thigh bone, shin bone, the long bone of its goat's foot, a hoof; knobs at the joints)
      sc.cone(bone, piece, hip, knee, 1.9 * G, 1.5 * G, 0.5 * G, { tag: 'femur' });
      sc.cone(bone, piece, knee, ankle, 1.5 * G, 1.1 * G, 0.5 * G, { tag: 'tibia' });
      bknob(piece, hip, 2.4 * G);
      bknob(piece, knee, 2.2 * G);
      bknob(piece, ankle, 1.7 * G);
      const hoofB: V3 = [toe[0], toe[1], toe[2] + 3.0 * G];
      const ffB = norm([toe[0] - heel[0], toe[1] - heel[1], 0], s.hips[0]);
      sc.cone(bone, piece, ankle, hoofB, 1.1 * G, 0.9 * G, 0.4 * G, { tag: 'metatarsal' });
      sc.box(horn, piece, add(hoofB, add(mul(ffB, 1.6 * G), [0, 0, 0.3])), [mul(ffB, 4.4 * G), mul(norm(cross(U, ffB)), 3.2 * G), mul(U, 2.4 * G)], 1.2 * G, 0.5 * G, { tag: 'hoof' });
      feet.push(hoofB);
      continue;
    }
    sc.cone(hide, piece, hip, knee, lH * 0.95, lK * 0.95, 1.6 * G, { tag: 'thigh' });
    sc.ell(hide, piece, add(lerp3(hip, knee, 0.48), mul(f3, lH * 0.4)), [mul(td, tl * 0.48), mul(o3, lH * 0.62 * k), mul(f3, lH * 0.58 * k)], 0.9 * G, { tag: 'quad' });
    sc.ell(hide, piece, add(lerp3(hip, knee, 0.4), mul(f3, -lH * 0.42)), [mul(td, tl * 0.44), mul(o3, lH * 0.58 * k), mul(f3, lH * 0.55 * k)], 0.9 * G, { tag: 'ham' });
    sc.ell(hide, piece, add(hip, add(mul(f3, -lH * 0.62), mul(td, -lH * 0.1))), [mul(td, lH * 0.8), mul(o3, lH * 0.7), mul(f3, lH * 0.75 * k)], 1.4 * G, { tag: 'glute' });
    const ff = norm([toe[0] - heel[0], toe[1] - heel[1], 0], s.hips[0]);
    if (d.legs === 'goat') {
      const hoof: V3 = [toe[0], toe[1], toe[2] + 3.4 * G];
      sc.cone(shag, piece, knee, ankle, lK * 1.02, lA * 1.0, 1.4 * G, { tag: 'shank' });
      sc.cone(shag, piece, ankle, hoof, lA * 0.95, lA * 0.74, 1.2 * G, { tag: 'pastern' });
      sc.box(horn, piece, add(hoof, add(mul(ff, 2.0 * G), [0, 0, 0.3])), [mul(ff, 5.2 * G), mul(norm(cross(U, ff)), 3.8 * G), mul(U, 2.7 * G)], 1.4 * G, 0.6 * G, { tag: 'hoof' });
      sc.cone(bone, piece, add(ankle, mul(ff, -2 * G)), add(ankle, add(mul(ff, -9 * G), mul(U, 2 * G))), 2.0 * G, 0.2, 0.4 * G, { tag: 'spur' });
      feet.push(hoof);
    } else {
      // a beast's foot: a calf of muscle, the foot long and its claws gripping the floor
      sc.cone(hide, piece, knee, ankle, lK * 1.0, lA * 0.95, 1.4 * G, { tag: 'shin' });
      const sd = norm(sub(ankle, knee));
      sc.ell(hide, piece, add(lerp3(knee, ankle, 0.3), mul(across(s.hips[0], sd), -lK * 0.5)), [mul(sd, len(sub(ankle, knee)) * 0.3), mul(o3, lK * 0.7 * k), mul(across(s.hips[0], sd), lK * 0.65 * k)], 1.0 * G, { tag: 'calf' });
      const ball = lerp3(heel, toe, 0.75);
      sc.cone(hide, piece, ankle, [ball[0], ball[1], ball[2] + lA * 0.5], lA * 0.9, lA * 0.7, 1.2 * G, { tag: 'foot' });
      const side3 = norm(cross(U, ff));
      for (const a of [-0.45, 0, 0.45]) {
        const way = norm(add(ff, mul(side3, a)));
        const k0: V3 = add([ball[0], ball[1], ball[2] + lA * 0.45], mul(way, lA * 0.6));
        const k1: V3 = add(k0, add(mul(way, lA * 1.1), [0, 0, 0.6 * G]));
        sc.cone(hide, piece, k0, k1, lA * 0.38, lA * 0.3, 0.6 * G, { tag: 'toe' });
        sc.cone(bone, piece, k1, add(k1, add(mul(way, lA * 0.9), [0, 0, -lA * 0.75])), lA * 0.28, 0.08, 0.15, { tag: 'claw' });
      }
      sc.cone(bone, piece, add(heel, [0, 0, lA * 0.4]), add(heel, add(mul(ff, -lA * 1.2), [0, 0, lA * 0.2])), lA * 0.3, 0.1, 0.2, { tag: 'spur' });
      feet.push(toe);
    }
  }

  // ---- A SERPENT FROM THE WAIST DOWN: its body pouring down from its hips to the floor and round in a great coil about it,
  // its belly banded beneath, its tail's end lifted, a spike on it
  if (d.plan === 'serpent') {
    const [pf, pl] = s.hips;
    const r0 = pelv.h[1] * 1.05;
    const T = (f: number, l: number, z: number): V3 => [s.pelvis[0] + pf[0] * f + pl[0] * l, s.pelvis[1] + pf[1] * f + pl[1] * l, z];
    const pts: V3[] = [s.pelvis, T(-4 * G, 1 * G, s.pelvis[2] * 0.7), T(4 * G, -2 * G, s.pelvis[2] * 0.36), T(13 * G, -5 * G, r0 * 0.95)];
    const c0 = T(-4 * G, -2 * G, 0);
    const N = 22;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const th = -0.35 - u * Math.PI * 2.15;
      const rr = (24 - 10 * u) * G;
      const rad = r0 * (0.95 - 0.7 * u);
      pts.push([c0[0] + (pf[0] * Math.cos(th) + pl[0] * Math.sin(th)) * rr, c0[1] + (pf[1] * Math.cos(th) + pl[1] * Math.sin(th)) * rr, rad + (u > 0.85 ? (u - 0.85) * 60 * G : 0)]);
    }
    const n = pts.length;
    for (let i = 0; i + 1 < n; i++) {
      const u0 = Math.max(0, (i - 2) / (n - 3));
      const u1 = Math.max(0, (i - 1) / (n - 3));
      sc.cone(hide, 'coil', pts[i], pts[i + 1], r0 * (1 - 0.72 * u0), r0 * (1 - 0.72 * u1), 1.6 * G, { tag: 'coil' });
    }
    const tip = pts[n - 1];
    const tw = norm(sub(tip, pts[n - 2]));
    sc.cone(horn, 'coil', tip, add(tip, mul(tw, 9 * G)), r0 * 0.3, 0.2, 0.3 * G, { tag: 'tailspike' });
    feet.push(tip);
  }
  // ---- A WRAITH BELOW THE WAIST: no legs, its body trailing off into a long robe of rags that drifts back off it, its hem
  // torn into tongues over the floor, smoke pouring from it
  if (d.plan === 'wraith') {
    const [pf, pl, pu] = s.hips;
    const r0 = pelv.h[1] * 1.15;
    const at = (f: number, l: number, z: number): V3 => [s.pelvis[0] + pf[0] * f + pl[0] * l, s.pelvis[1] + pf[1] * f + pl[1] * l, z];
    // (its robe: a bell of rags from its waist, flaring wide and drifting back off it, low over the floor)
    const midR = at(-12 * G, 0, s.pelvis[2] * 0.42);
    const hem = at(-30 * G, -4 * G, 7 * G);
    sc.cone(cloth, 'robe', belly.c, s.pelvis, r0 * 0.75, r0 * 0.9, 1.4 * G, { tag: 'robe' });
    sc.cone(cloth, 'robe', s.pelvis, midR, r0 * 0.9, r0 * 1.25, 1.4 * G, { tag: 'robe' });
    sc.cone(cloth, 'robe', midR, hem, r0 * 1.25, r0 * 0.7, 1.2 * G, { tag: 'robe' });
    // (its hem torn into long tongues, streaming back over the floor)
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2 + 0.2;
      const rim = add(lerp3(midR, hem, 0.35 + (i % 3) * 0.25), add(mul(pf, Math.cos(a) * r0 * 0.9), mul(pl, Math.sin(a) * r0 * 1.1)));
      const lng = (10 + ((i * 7) % 9)) * G;
      const tipT = add(rim, add(mul(pf, -lng * 0.85), add(mul(pl, Math.sin(a) * lng * 0.25), [0, 0, -lng * 0.25])));
      sc.cone(cloth, 'robe', rim, [tipT[0], tipT[1], Math.max(1.2 * G, tipT[2])], 3.2 * G, 0.4 * G, 0.6 * G, { tag: 'tongue' });

      if (i % 4 === 0) feet.push(rim);
    }
    // (a cape of rags from under its hood down its back into the robe)
    sc.cone(cloth, 'robe', add(s.neck, mul(F, -ribs.h[0] * 0.6)), midR, ribs.h[1] * 0.85, r0 * 1.4, 1.6 * G, { tag: 'cape' });
  }
  // ---- ITS SPINES down its back, a mane round its neck, the rag of his coat round its loins
  if (has('spines')) for (let i = 0; i < 7; i++) {
    const p = add(s.neck, add(mul(F, -ribs.h[0] * (1.05 + i * 0.03)), mul(Up, -B.chest * (0.0 + i * 0.17))));
    const lnk = (1.2 - Math.abs(i - 2) * 0.12) * aS * 1.4;
    sc.cone(bone, 'spines', p, add(p, add(mul(F, -lnk * 0.8), mul(Up, lnk * 0.6))), aS * 0.45, 0.15, 0.5 * G, { tag: 'spine' });
  }
  if (has('mane')) for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const root = add(s.neck, add(mul(F, Math.cos(a) * ribs.h[0] * 0.55), add(mul(L, Math.sin(a) * ribs.h[1] * 0.55), mul(Up, -B.chest * 0.05))));
    const out = norm(add(mul(F, Math.cos(a) * 0.6 - 0.5), add(mul(L, Math.sin(a) * 0.8), mul(Up, 0.55))));
    sc.cone(shag, 'mane', root, add(root, mul(out, aS * (1.4 + (i % 3) * 0.35))), aS * 0.42, 0.2, 0.8 * G, { tag: 'mane' });
  }
  if (has('rag')) {
    const rag = sc.mat({ ramp: ['#0a0816', '#161226', '#262040', '#3c345a', '#58507c'], paint: (h) => (dot(sub(h.p, s.pelvis), s.hips[2]) < -pelv.h[2] * 1.3 ? ['#22040c', '#420a16', '#6e1420', '#a02a2c', '#c84a3e'][Math.max(0, Math.min(4, h.tone))] : null) });
    const top = add(pelv.c, mul(pelv.r[2], pelv.h[2] * 0.4));
    const bot = add(pelv.c, mul(pelv.r[2], -pelv.h[2] * 1.9));
    sc.cone(rag, 'hips', top, bot, pelv.h[1] * 1.12, pelv.h[1] * 1.45, 1.6 * G, { tag: 'rag', cuts: [{ n: mul(pelv.r[2], -1) as V3, o: -dot(pelv.r[2], bot) }] });
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const deep = (3 + ((i * 7) % 5)) * G;
      sc.ell(rag, 'hips', add(bot, add(mul(pelv.r[0], Math.cos(a) * pelv.h[1] * 1.45), mul(pelv.r[1], Math.sin(a) * pelv.h[1] * 1.45))), [mul(pelv.r[0], 2.2 * G), mul(pelv.r[1], 2.2 * G), mul(pelv.r[2], deep)], 0.3 * G, { carve: true });
    }
  }
  if (has('chains')) {
    // a chain round its waist, hanging in a loop at one hip
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const sag = Math.max(0, Math.cos(a - 0.8)) * 5 * G;
      const [bf, bl, bu] = belly.r;
      const p = add(belly.c, add(mul(bf, Math.cos(a) * belly.h[0] * 1.08), add(mul(bl, Math.sin(a) * belly.h[1] * 1.08), mul(bu, -belly.h[2] * 0.75 - sag))));
      sc.ell(steel, 'hips', p, [mul(bf, 1.6 * G), mul(bl, 1.6 * G), mul(bu, (i % 2 ? 0.8 : 1.6) * G)], 0, { tag: 'link' });
    }
  }

  // ---- THE TAIL: from the small of its back down to the floor and away
  if (d.tail !== 'none' && (d.plan === 'biped' || skel)) {
    const tailMat = skel ? bone : hide;
    const [pf, pl, pu] = s.hips;
    const T = (f: number, l: number, u: number): V3 => add(s.pelvis, add(mul(pf, f * G), add(mul(pl, l * G), mul(pu, u * G))));
    if (d.tail === 'heavy' || d.tail === 'club') {
      const pts = [T(-12, 0, 2), T(-24, -6, -10), T(-28, -18, -26), T(-20, -32, -32), T(-10, -40, -28)];
      for (let i = 0; i + 1 < pts.length; i++) sc.cone(tailMat, 'tail', pts[i], pts[i + 1], (4.6 - i * 0.9) * G * k, (3.7 - i * 0.85) * G * k, 1.4 * G, { tag: 'tail' });
      if (d.tail === 'heavy') sc.cone(horn, 'tail', pts[4], T(-2, -44, -24), 2.4 * G, 0.2, 0.4 * G, { tag: 'tailspike' });
      else {
        // (a club of bone at its end, knobbed and spiked: not a ball)
        const c = T(-4, -46, -26);
        sc.ell(bone, 'tail', c, [mul(pf, 5 * G), mul(pl, 6.5 * G), mul(pu, 4.4 * G)], 1.2 * G, { tag: 'club' });
        sc.ell(bone, 'tail', add(c, mul(pl, -3 * G)), [mul(pf, 3.6 * G), mul(pl, 3.5 * G), mul(pu, 3.4 * G)], 1.0 * G, { tag: 'club' });
        for (const [a, b] of [[1, 0.3], [-1, 0.3], [0.2, 1], [0.3, -1], [0.6, 0.7], [-0.7, 0.5]] as const) {
          const w = norm(add(mul(pf, a), add(mul(pu, b), mul(pl, -0.4))));
          sc.cone(horn, 'tail', add(c, mul(w, 4 * G)), add(c, mul(w, 9 * G)), 1.6 * G, 0.15, 0.3 * G, { tag: 'clubspike' });
        }
      }
    } else {
      // a whip, long and thin, a barbed blade at its end
      const pts = [T(-12, 0, 2), T(-22, -4, -12), T(-26, -14, -26), T(-20, -28, -32), T(-6, -36, -31), T(8, -40, -28), T(18, -48, -24)];
      for (let i = 0; i + 1 < pts.length; i++) sc.cone(tailMat, 'tail', pts[i], pts[i + 1], (3.4 - i * 0.42) * G, (3.0 - i * 0.42) * G, 1.0 * G, { tag: 'tail' });
      const end = pts[pts.length - 1];
      const w = norm(sub(end, pts[pts.length - 2]));
      sc.tri(horn, 'tail', add(end, mul(w, -1 * G)), add(end, add(mul(w, 7 * G), mul(pu, 1.5 * G))), add(end, add(mul(w, 2 * G), mul(pu, 4.5 * G))), 0.7 * G, 0.4 * G, { tag: 'barb' });
      sc.tri(horn, 'tail', add(end, mul(w, -1 * G)), add(end, add(mul(w, 7 * G), mul(pu, 1.5 * G))), add(end, add(mul(w, 2 * G), mul(pu, -2.5 * G))), 0.7 * G, 0.4 * G, { tag: 'barb' });
    }
  }

  // ---- ITS WINGS (carried by the top of its back): real bat's wings (batWing), ragged, two pairs, or bare bone
  if (d.wings !== 'none') for (const side of [1, -1] as const) {
    const root = add(s.neck, add(mul(F, -ribs.h[0] * 0.7), add(mul(L, side * ribs.h[1] * 0.55), mul(Up, -B.chest * 0.22))));
    hornTips.push(batWing(sc, { hide, horn, bone, leather }, root, s.hips, side, d.wingSize * G, d.wingPose, d.wings === 'four' ? 'bat' : d.wings, G));
    if (d.wings === 'four') {
      const low = add(s.neck, add(mul(F, -ribs.h[0] * 0.75), add(mul(L, side * ribs.h[1] * 0.5), mul(Up, -B.chest * 0.62))));
      batWing(sc, { hide, horn, bone, leather }, low, s.hips, side, d.wingSize * G * 0.62, { ...d.wingPose, beat: d.wingPose.beat - 0.55, sweep: d.wingPose.sweep + 0.25 }, 'bat', G);
    }
  }

  // (where its smoke pours from)
  return {
    seat,
    fires,
    aura: {
      from: [add(s.neck, mul(F, -ribs.h[0] * 0.8)), s.shoulderL, s.shoulderR, lerp3(s.elbowR, s.handR, 0.4), lerp3(s.elbowL, s.handL, 0.6), add(ribs.c, mul(F, -ribs.h[0]))],
      horns: hornTips.slice(0, 4),
      jaw,
      claws,
      feet: d.plan === 'serpent' ? [] : feet,
      // (its smoke all behind it, none of it blotting its body or face)
      behind: true,
    },
  };
}

// ---------------------------------------------------------------------------------------------
// THE TEN

/** Its hides: five tones each, from its shadow to the light full on it, wide enough apart that its forms read (his word of the first ten: “They look crude”). */
const HIDES = {
  ash: ['#0c0b10', '#1d1a24', '#332e3e', '#524a60', '#7a7090'] as Ramp,
  blood: ['#120608', '#2a0e14', '#481a22', '#6e2a32', '#9a4448'] as Ramp,
  corpse: ['#121014', '#2a2630', '#463f4e', '#6a6274', '#948aa0'] as Ramp,
  ember: ['#140804', '#30140a', '#552610', '#82401a', '#b0642a'] as Ramp,
  ice: ['#060a14', '#121e32', '#22344e', '#38506e', '#587498'] as Ramp,
  storm: ['#0c0c10', '#1e1e24', '#34343c', '#525260', '#7a7a8a'] as Ramp,
  bile: ['#080c06', '#16220e', '#283a1a', '#40582a', '#627c42'] as Ramp,
  hellred: ['#16040a', '#3a0816', '#661424', '#9a2c32', '#cc5644'] as Ramp,
  bruise: ['#0c0614', '#20123a', '#36205a', '#54347e', '#7a54a6'] as Ramp,
  obsidian: ['#06060c', '#12121f', '#222238', '#3a3a5a', '#5a5a84'] as Ramp,
};
/** Its horn and bone: ivory, or black horn, or old yellowed bone. */
const HORNS = {
  ivory: IVORY,
  black: ['#08060c', '#18141e', '#2e2836', '#4a4254', '#6e6478'] as Ramp,
  yellow: ['#1c140a', '#3a2c16', '#6a5430', '#a48c5a', '#d8c79a'] as Ramp,
};

/** A stance for a build: crouched `crouch` and bowed `hunch` over, turned as the warlock is; its arms out and forward, the left claw raised with the fire in it (or both low), or hanging long, or both planted on the floor before it. */
function stanceOf(B: Build, o: { crouch: number; bend: number; hunch: number; arms: 'raised' | 'low' | 'hang' | 'planted' | 'wide' | 'reach'; faceUp?: number; stance?: number }): Bones {
  const q = { ...standing(B) } as Bones & Record<string, number>;
  const arm = B.upperArm + B.foreArm;
  q.yaw = -18;
  q.pz = -o.crouch;
  q.px = -o.crouch * 0.15;
  q.bend = o.bend;
  q.hunch = o.hunch;
  q.shrug = 0.6;
  // (its face lifted against the bow of its back, to look at you)
  q.faceUp = o.hunch * 0.6 + (o.faceUp ?? 0);
  const st = o.stance ?? 1;
  q.lfx = -5 * st;
  q.rfx = 4 * st;
  q.lfy = 2 * st;
  q.rfy = -2 * st;
  q.lk = 10;
  q.rk = -10;
  // (its right planted down and out before it, its claws open; its left, the warlock's demon arm, as its stance has it:
  // raised with the fire in it, as his is (his word, 26 Oct: “Also I think we want the plant are to be the right arm.  That
  // keeps the flame in the left for both transformations”))
  Object.assign(q, { rhIn: 0, rhx: arm * 0.38, rhy: -arm * 0.34, rhz: -arm * 0.68 });
  if (o.arms === 'raised') Object.assign(q, { lhIn: 0, lhx: arm * 0.5, lhy: arm * 0.3, lhz: arm * 0.02 });
  else if (o.arms === 'low') Object.assign(q, { lhIn: 0, lhx: arm * 0.38, lhy: arm * 0.34, lhz: -arm * 0.68 });
  else if (o.arms === 'wide') Object.assign(q, { lhIn: 0, lhx: arm * 0.3, lhy: arm * 0.62, lhz: -arm * 0.42, rhIn: 0, rhx: arm * 0.3, rhy: -arm * 0.62, rhz: -arm * 0.42 });
  else if (o.arms === 'reach') Object.assign(q, { lhIn: 0, lhx: arm * 0.72, lhy: arm * 0.3, lhz: -arm * 0.5, rhIn: 0, rhx: arm * 0.78, rhy: -arm * 0.28, rhz: -arm * 0.46 });
  else if (o.arms === 'hang') Object.assign(q, { lhIn: 0, lhx: arm * 0.3, lhy: arm * 0.2, lhz: -arm * 0.92, rhIn: 0, rhx: arm * 0.34, rhy: -arm * 0.2, rhz: -arm * 0.9 });
  else Object.assign(q, { lhIn: 2, lhx: arm * 0.75, lhy: B.shoulderHalf * 0.9, lhz: 3, rhIn: 2, rhx: arm * 0.85, rhy: -B.shoulderHalf * 0.9, rhz: 3 });
  return q as Bones;
}
/** A goat-legged build: the hock high (the rig's ankle), the hoof the rig's toe. */
const goat = (b: Build, k = 1): Build => ({ ...b, ankle: 0.137 * b.tall * k, heel: 0.02 * b.tall, ball: 0.095 * b.tall, shank: b.shank * 0.92, thigh: b.thigh * 0.86 });
const WINGS_SET: DemonWings = { spread: 1, beat: 0, sweep: 0, tip: 0, flex: 0, wind: 0, phase: 0 };

export function demonDesigns(): DemonDesign[] {
  // (its head set forward of its chest, however deep its chest is, so its face is seen and not sunk in its breast)
  const base = (tall: number, head: number, shape: Parameters<typeof buildOf>[2], over: Partial<Build> = {}): Build => {
    const b = { ...buildOf(tall, head, shape), ...over };
    return { ...b, headFwd: Math.max(b.headFwd, b.ribDeep * 0.95 + b.headR[0] * 0.2), headUp: Math.min(b.headUp, -1) };
  };
  const brute = goat(base(95, 1, { shoulders: 1.62, chest: 1.55, waist: 1.15, hips: 1.2, arms: 1.25, limbs: 1.75, depth: 1.25, legs: 0.9 }, { neck: 7, headUp: -5, headFwd: 15, headR: [10.6, 11.2, 11.2] }));
  const wraith = base(108, 1, { shoulders: 1.35, chest: 1.05, waist: 0.75, hips: 0.9, arms: 1.5, limbs: 1.1, legs: 1.0 }, { headR: [10, 10, 10.5] });
  const serpent = base(100, 1, { shoulders: 1.45, chest: 1.3, waist: 0.95, hips: 1.25, arms: 1.25, limbs: 1.4, depth: 1.15 }, { headR: [9.4, 9, 9.6] });
  const bones = goat(base(102, 1, { shoulders: 1.35, chest: 1.2, waist: 0.8, hips: 1.0, arms: 1.3, limbs: 1.0 }, { headR: [9.6, 9.2, 10] }));
  const lunge = (B: Build, o: Parameters<typeof stanceOf>[1]): Bones => stanceOf(B, o);
  return [
    {
      name: '1. The Brute', says: 'a hulk on goat legs, lunging, its wings raised', plan: 'biped',
      B: brute, pose: lunge(brute, { crouch: 15, bend: 18, hunch: 40, arms: 'raised', faceUp: -4 }),
      hide: HIDES.ash, horn: HORNS.ivory, head: 'brute', horns: 'ram', wings: 'bat', wingSize: 1, wingPose: { ...WINGS_SET, spread: 0.85, beat: 0.35, sweep: 0.35 },
      tail: 'heavy', legs: 'goat', bulk: 1, extras: ['plates', 'spines', 'chains', 'rag'], raised: true,
    },
    {
      name: '2. The Wraith', says: 'no legs: a hooded horror trailing rags and smoke, reaching', plan: 'wraith',
      B: wraith, pose: lunge(wraith, { crouch: -8, bend: 30, hunch: 36, arms: 'raised', faceUp: -10 }),
      hide: HIDES.corpse, horn: HORNS.black, head: 'hood', horns: 'swept', wings: 'none', wingSize: 0, wingPose: WINGS_SET,
      tail: 'none', legs: 'claw', bulk: 0.8, extras: ['ribs'], raised: false,
    },
    {
      name: '3. The Serpent', says: 'a serpent from the waist down, coiled, its hood spread', plan: 'serpent', frill: true,
      B: serpent, pose: lunge(serpent, { crouch: -4, bend: 8, hunch: 22, arms: 'raised', faceUp: 0 }),
      hide: HIDES.bile, horn: HORNS.yellow, head: 'beast', horns: 'none', wings: 'none', wingSize: 0, wingPose: WINGS_SET,
      tail: 'none', legs: 'claw', bulk: 1, extras: ['plates'], raised: true,
    },
    {
      name: '4. The Burning Bones', says: 'bare bone, hellfire burning in its ribs, bone wings', plan: 'skeleton',
      B: bones, pose: lunge(bones, { crouch: 10, bend: 12, hunch: 30, arms: 'wide', faceUp: 0 }),
      hide: HIDES.ash, horn: HORNS.ivory, head: 'skull', horns: 'great', wings: 'bone', wingSize: 0.95, wingPose: { ...WINGS_SET, spread: 0.9, beat: 0.3, sweep: 0.3 },
      tail: 'whip', legs: 'goat', bulk: 1, extras: [], raised: false,
    },
  ];
}
