// THE TINKERER, HER CONTRAPTION AND HER GOLEM, SCULPTED (the art chat, 23 Oct 2026). MOCK-UPS; NOTHING OF THE GAME IMPORTS IT.
//
// His words, 23 Oct (Pacific): by 21:55, “She’s a new character so she’ll have her own.  I’m going change her to
// Tinkerer.”; her brief by 22:21: “Gleeful mad bomber (Recommended)”, “Quick and nimble (Recommended)”, and her fighting:
// “K this is where the tinkering is changing the character.  She’s going to have minions.  I think she’ll set turrets on the
// ground that fire something.  Not an arrow or a bolt.  That’s the tap.  We’ll call those “Contraption”.  Tap and hold will
// be “Golem”.  And this is gonna be clockwork Automaton that follows her around and attacks.  It will just go around and I
// guess punch things or whatever but tap+hold will have him do a bigger move.”; “Gadgets in her kit and the helper”;
// “Lobbed vials (Recommended)”; “Big bruiser (Recommended)”; “Ground pound (Recommended)”.
//
// SO: HER, the woman with the high red ponytail and the goggles he picked, in the bomber's leather, a bandolier and a belt
// of vials, now with her tools on her (a brass bracer of gears, a wrench, a gauge); crouched light on her toes, a vial
// up by her ear, grinning. THE CONTRAPTION: a little brass mortar on three legs that lobs her vials. THE GOLEM: a clockwork
// bruiser of brass, a head taller than the knight, huge fists. What glows on all three is the friend's cyan.

import type { Ramp } from '../art/kit';
import { CYAN, TEAL } from '../art/kit';
import { FRIEND_RIM } from '../art/hero3_knight';
import { HEAD_B } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import type { GameView } from '../art/skin';
import { add, buildOf, cross, elbowFor, lerp3, mul, norm, solve, standing, sub, trunkOf } from '../art/skeleton';
import type { Bones, Build, Posed, V3 } from '../art/skeleton';
import { Sculpt, draw, graft, onBall, onCone, primDist } from './sculpt';
import type { Cone, Drawn, Ell } from './sculpt';
import { BRASS, HIDE, farSide, limbFrame, onHead, shadeOf, tailorFor } from './sculpt_classes';
import type { Who } from './sculpt_classes';
import { STEEL5 } from './sculpt_warlock';

/** Her skin: fair, warm. */
export const SKIN_F: Ramp = ['#42203a', '#7a4658', '#bc7c7c', '#e8b09c', '#ffdcc4'];
/** Her red hair. */
export const RED_HAIR: Ramp = ['#3a0810', '#6c1418', '#aa2a22', '#dc5232', '#f8885a'];
/** Her jerkin's leather, a warm brown. */
const JERKIN: Ramp = ['#1e0e10', '#3e2018', '#68381e', '#9a5a2c', '#c4843e'];
/** Dark blue cloth: her shirt and trousers. */
const NAVY: Ramp = ['#0a0c1e', '#141a36', '#22305a', '#364a84', '#5070aa'];
/** Copper, a gauge's case, the golem's pipes. */
const COPPER: Ramp = ['#2a0e0a', '#521c12', '#8a3a1e', '#c4642e', '#ec9a56'];
/** Glass: the goggles' lenses, the vials (none of it glows but the cyan). */
const GLASS: Ramp = ['#0a2a3a', '#124a5c', '#1e7488', '#4aa8b4', '#a6e2e2'];
const VIOLET_G: Ramp = ['#1e0a3a', '#3a1466', '#5e2a9c', '#8c56cc', '#c09cf0'];
const AMBER_G: Ramp = ['#2a1406', '#5a2e0c', '#9a5a14', '#d89a2c', '#f8d070'];

// ---------------------------------------------------------------------------------------------
// HER BODY

/** HER BODY: the mage's build, a little longer in the leg: quick and nimble. */
export const TINKERER_BODY: Build = buildOf(55, HEAD_B * 1.16, { shoulders: 0.92, chest: 0.94, waist: 0.82, hips: 1.08, legs: 1.04, limbs: 0.9 });

/** A woman's body of flesh, sculpted on the bones: slight, a narrow waist, wider hips, a modest bust, long limbs. */
export function womanBody(sc: Sculpt, w: Who, skin: number): void {
  const { s, B } = w;
  const [f, l, u] = s.chest;
  const [ribs, belly, pel] = trunkOf(B, s);
  sc.ell(skin, 'torso', ribs.c, [mul(ribs.r[0], ribs.h[0] * 0.9), mul(ribs.r[1], ribs.h[1] * 0.92), mul(ribs.r[2], ribs.h[2] * 1.0)], 2.0, { tag: 'ribs' });
  sc.ell(skin, 'torso', add(s.neck, add(mul(u, -2.8), mul(f, -0.4))), [mul(f, ribs.h[0] * 0.7), mul(l, B.shoulderHalf * 0.8), mul(u, 2.2)], 2.0, { tag: 'yoke' });
  sc.ell(skin, 'torso', belly.c, [mul(belly.r[0], belly.h[0] * 0.92), mul(belly.r[1], belly.h[1] * 0.88), mul(belly.r[2], belly.h[2] * 1.05)], 2.2, { tag: 'belly' });
  sc.ell(skin, 'hips', pel.c, [mul(pel.r[0], pel.h[0] * 1.0), mul(pel.r[1], pel.h[1] * 1.04), mul(pel.r[2], pel.h[2] * 1.0)], 2.2, { tag: 'pelvis' });
  for (const side of [1, -1]) {
    const bc = add(ribs.c, add(mul(f, ribs.h[0] * 0.6), add(mul(l, side * ribs.h[1] * 0.42), mul(u, ribs.h[2] * 0.15))));
    sc.ell(skin, 'torso', bc, [mul(f, 1.9), mul(l, 2.1), mul(u, 2.0)], 1.4, { tag: 'bust' });
  }
  sc.cone(skin, 'head', add(s.neck, mul(u, -1.2)), s.skull, 1.55, 1.4, 1.2, { tag: 'neck' });
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const ha = side === 'L' ? s.handL : s.handR;
    const piece = `arm${side}`;
    const out = mul(l, side === 'L' ? 1 : -1);
    const [, o0] = limbFrame(sh, el, out);
    sc.ell(skin, piece, add(sh, add(mul(u, -0.4), mul(o0, 0.5))), [mul(f, 2.0), mul(o0, 1.8), mul(u, 1.9)], 1.5, { tag: 'delt' });
    sc.cone(skin, piece, sh, el, 1.75, 1.35, 1.2, { tag: 'upper' });
    sc.cone(skin, piece, el, lerp3(el, ha, 0.8), 1.45, 1.05, 1.1, { tag: 'fore' });
  }
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const piece = `leg${side}`;
    const [lH, lK, lA] = B.legR;
    sc.cone(skin, piece, hip, knee, lH * 1.0, lK * 0.98, 1.6, { tag: 'thigh' });
    sc.cone(skin, piece, knee, ankle, lK * 0.95, lA * 0.9, 1.2, { tag: 'shin' });
    const [sd, so] = limbFrame(knee, ankle, f);
    sc.ell(skin, piece, add(lerp3(knee, ankle, 0.3), mul(so, -0.7)), [mul(sd, 2.8), mul(so, 1.5), mul(norm(cross(sd, so)), 1.6)], 1.2, { tag: 'calf' });
  }
}

/** A woman's head: a rounder skull, a small chin, a small nose. */
export function womanHead(sc: Sculpt, w: Who, skin: number): void {
  const { s, B } = w;
  const [hf, hl, hu] = s.face;
  const R = B.headR;
  const at = (fw: number, lf: number, up: number): V3 => add(s.head, add(mul(hf, R[0] * fw), add(mul(hl, R[1] * lf), mul(hu, R[2] * up))));
  sc.ell(skin, 'head', at(-0.08, 0, 0.04), [mul(hf, R[0] * 0.88), mul(hl, R[1] * 0.9), mul(hu, R[2] * 0.82)], 1.2, { tag: 'skull' });
  sc.ell(skin, 'head', at(0.32, 0, -0.4), [mul(hf, R[0] * 0.6), mul(hl, R[1] * 0.7), mul(hu, R[2] * 0.48)], 1.4, { tag: 'jaw' });
  sc.cone(skin, 'head', at(0.84, 0, 0.06), at(0.98, 0, -0.16), 0.45, 0.55, 0.6, { tag: 'nose' });
  for (const side of [1, -1]) sc.ell(skin, 'head', at(-0.1, side * 0.86, -0.06), [mul(hf, 0.55), mul(hl, 0.3), mul(hu, 0.85)], 0.4, { tag: 'ear' });
}

// ---------------------------------------------------------------------------------------------
// THE TINKERER


/**
 * WHAT SHE HOLDS, AND HOW SHE STANDS WITH IT (his word, 24 Oct, by 07:33: “The brawlers is good but the tinkerers are weird.
 * She doesn’t need that vial in her hand at the moment since her archetype has changed”): no vial; her tools, in fingerless
 * gloves. Four to pick from.
 */
export type TinkerKit = 'shoulder' | 'key' | 'remote' | 'tools';
export const TINKER_KITS: { id: TinkerKit; name: string }[] = [
  { id: 'shoulder', name: 'Wrench on her shoulder' },
  { id: 'key', name: "The Golem's winding key" },
  { id: 'remote', name: 'A control box' },
  { id: 'tools', name: 'Hammer and wrench' },
];
/** As she was first drawn: the vial by her ear (his “She doesn’t need that vial”); kept to draw her as before. */
export const TINKER_KIT: TinkerKit | 'vial' = 'shoulder';

/**
 * How her face is held (his “Polish faces up close”, 24 Oct): `turn`, her head turned to us (it was 14 the other way, her face
 * side-on); `up`, her chin; her goggles pushed up onto her hair (`gog` up, `gogF` forward: they were on her brow, and read as
 * a second pair of eyes).
 */
export const HER_FACE = { turn: -24, up: 4, gog: 0.84, gogF: 0.55, glint: 4 };

/**
 * WHAT OF HER SWINGS AND WHAT SHE HOLDS AS SHE MOVES (dev/tinkerer_moves.ts sets these for each picture of her moving; as
 * she stands still they are nothing, and she is drawn as she was): `pony`, how far her ponytail is swung (her own measure,
 * at its tip: loose things follow, Movement 4); `wrench`, how far the wrench is brought off her shoulder to hold out before
 * her (0 over her shoulder, 1 held out, its head down before her).
 */
export const TINK_SWAY = { pony: [0, 0, 0] as V3, wrench: 0, twirl: false, spin: 0, vial: 0, held: null as Sculpt | null, tall: 0 };
/** (and: `twirl`, the wrench brought off her shoulder to stand straight up in her fist, not held out before her; `spin`, how
 * far it is spun round in her fist (radians, about her left-to-right: a baton's twirl at her side); `vial`, a vial out of
 * her belt in her left fist) */

/**
 * HER BACKPACK (his word, 28 Oct, 00:08: “Maybe we give her a backpack now?”, after “And a unique chest armor that gives
 * her a backpack with one of her turrets in it”): three to pick from, none of them with a turret in it (that is for the
 * unique armour): `boiler`, a little brass boiler with a gauge and a copper chimney over her left shoulder and a pipe down to her hip;
 * `satchel`, a leather rucksack with a rolled blueprint across its top and a hammer's haft out of its side; `rack`, a
 * frame of her vials in rows, a brass cap and a crank. `none` as she was.
 */
export type TinkPack = 'none' | 'boiler' | 'satchel' | 'rack';
export const TINK_PACKS: { id: TinkPack; name: string }[] = [
  { id: 'boiler', name: 'Brass boiler' },
  { id: 'satchel', name: 'Tool rucksack' },
  { id: 'rack', name: 'Rack of vials' },
];
/** The one she wears: none until he picks. */
export const TINK_PACK: TinkPack = 'none';

/** Where over her shoulder the wrench rests: how far out (her left is +), out past her ponytail so it swings clear of it; how far forward. */
export const WRENCH_REST = { out: -4.0, fwd: -1.0 };
/** How far her ponytail may swing toward the head of the wrench on her shoulder, and how softly it is eased to a stop there. */
const PONY_TO_JAW = 0.5;
const PONY_SOFT = 0.8;
let OFF_STEEL = 0;
/** (how often her ponytail has had to be pushed off her wrench: a check that the easing keeps it clear on its own) */
export const offSteelCount = (): number => OFF_STEEL;
/** How far out past the middle of her fist the middle of what she grips sits (a Contraption, shut, held by its bell). */
export const HELD_OUT = 3.4;
/** Where the last thing she held was laid (its middle), and by how much it was moved from where it was built. */
export const TINK_HELD: { at: V3; by: V3 } = { at: [0, 0, 0], by: [0, 0, 0] };
/** How much bigger her hands are than at first: a fist over half her head across (his “check her hands for scale”, 27 Oct). */
export const HAND_K = 1.45;

/** QUICK AND NIMBLE: crouched light on her toes, turned a little, her head up, grinning; her hands as her kit has them. */
export function tinkererStance(B: Build, kit: TinkerKit | 'vial' = TINKER_KIT): Bones {
  const t = B.tall / 55;
  const legs = {
    pz: -2.6 * t, yaw: -16, bend: 10, twist: -10, side: 4, faceTurn: HER_FACE.turn, faceUp: HER_FACE.up, faceTilt: 6,
    lfx: 3.2 * t, lfy: 2.6 * t, lft: 24, lk: 22, lfp: 12,
    rfx: -2.8 * t, rfy: -2.4 * t, rft: -20, rk: -18, rfp: 24, rfz: 0.4 * t,
  };
  const hands =
    kit === 'shoulder'
      ? // (the wrench over her right shoulder, her left fist on her hip, its elbow out to her side: cocky; his word, 27 Oct, of
        // the first, which stuck out from her side, “let’s fix her bent weird arm”)
        { lhIn: 2 as const, lhx: 2.0 * t, lhy: 7.6 * t, lhz: 30.5 * t, le: 0, rhIn: 0 as const, rhx: 3.4 * t, rhy: -0.6 * t, rhz: -2.6 * t, re: 70 }
      : kit === 'key'
        ? // (the Golem's great key held out before her in her left; the wrench low in her right)
          { lhIn: 0 as const, lhx: 10.0 * t, lhy: 2.4 * t, lhz: -6.0 * t, le: 26, rhIn: 0 as const, rhx: 4.0 * t, rhy: -4.6 * t, rhz: -11.5 * t, re: 26 }
        : kit === 'remote'
          ? // (pointing her minions on with her left; the control box at her chest in her right)
            { lhIn: 0 as const, lhx: 5.0 * t, lhy: 11.5 * t, lhz: 1.5 * t, le: 20, rhIn: 0 as const, rhx: 7.5 * t, rhy: -3.0 * t, rhz: -4.0 * t, re: 50 }
          : kit === 'tools'
            ? // (a tool in each hand, both out low and ready)
              { lhIn: 0 as const, lhx: 8.5 * t, lhy: 4.5 * t, lhz: -10.0 * t, le: 30, rhIn: 0 as const, rhx: 7.0 * t, rhy: -5.0 * t, rhz: -9.0 * t, re: 34 }
            : { lhIn: 0 as const, lhx: 8.5 * t, lhy: 4.5 * t, lhz: -10.0 * t, le: 30, rhIn: 0 as const, rhx: -3.4 * t, rhy: -6.0 * t, rhz: 4.0 * t, re: 60 };
  const q: Bones = { ...standing(B), ...legs, ...hands };
  // (her left elbow out to her side and a little back, as a hand on a hip has it)
  if (kit === 'shoulder') q.le = elbowFor(B, q as Posed, true, ARMS_AKIMBO);
  return q;
}
/** Which way her elbow points with her fist on her hip: out to her side, a little back and up. */
export const ARMS_AKIMBO: V3 = [-2, 12, 1];

/** The Tinkerer sculpted, standing as she stands, in one of the game's views. */
export function sculptTinkerer(view: GameView, pose?: Bones, turn = 0, kit: TinkerKit | 'vial' = TINKER_KIT, pack: TinkPack = TINK_PACK): Drawn {
  const B = TINKERER_BODY;
  const q = (pose ?? tinkererStance(B, kit)) as Posed;
  const s = solve(B, q);
  const w: Who = { s, B, view, spin: turn };
  const sc = new Sculpt();
  sc.spin = turn;
  const [f, l, u] = s.chest;
  const farArm = (piece: string): boolean => piece.endsWith('L') ? farSide(w, s.elbowL) : piece.endsWith('R') ? farSide(w, s.elbowR) : false;
  const skin = sc.mat({
    ramp: SKIN_F,
    paint: (h) => {
      if (h.prim.piece === 'head' && h.prim.tag !== 'neck') {
        const [a] = onHead(w, h.p);
        if (a > 0.25) return shadeOf(SKIN_F, h.tone + 1);
      }
      return farArm(h.prim.piece) ? shadeOf(SKIN_F, h.tone - 1) : null;
    },
  });
  womanBody(sc, w, skin);
  womanHead(sc, w, skin);
  const [hf, hl, hu] = s.face;
  const R = B.headR;
  const hat = (fw: number, lf: number, up: number): V3 => add(s.head, add(mul(hf, R[0] * fw), add(mul(hl, R[1] * lf), mul(hu, R[2] * up))));
  // HER FACE (his “Polish faces up close”, 24 Oct): the eyes dark, a lash flicked out at the corner of each; her brows red
  // and arched up, gleeful; freckles of a darker tone; a wide grin, its teeth showing
  for (const side of [1, -1]) {
    const out = side > 0 ? 0 : -1;
    sc.mark(hat(0.86, side * 0.36, 0.06), '#1a0c1a');
    sc.mark(hat(0.86, side * 0.36, 0.06), '#1a0c1a', 1, 1, side > 0 ? 1 : -1, -1);
    sc.mark(hat(0.9, side * 0.4, 0.3), RED_HAIR[1], 2, 1, out, 0);
    sc.mark(hat(0.84, side * 0.46, -0.16), SKIN_F[2]);
  }
  sc.mark(hat(0.94, 0, -0.42), '#4a1020', 3, 1, -1);
  sc.mark(hat(0.94, 0, -0.42), '#fff4ec', 2, 1, -1, 0);
  const t = tailorFor(sc, w, 0.9);
  // HER CLOTHES: a dark blue shirt, its sleeves rolled to the elbow; the leather jerkin laced over it; trousers tucked into
  // tall boots; a teal cloth knotted at her throat
  const shirt = sc.mat({ ramp: NAVY, paint: (h) => (farArm(h.prim.piece) ? shadeOf(NAVY, h.tone - 1) : null) });
  t.overTrunk(shirt, 0.35, [], 'shirt', true);
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    sc.cone(shirt, `arm${side}`, sh, el, 2.15, 1.85, 1.2);
    sc.cone(shirt, `arm${side}`, add(el, mul(norm(sub(el, sh)), -0.4)), add(el, mul(norm(sub(el, sh)), 0.9)), 2.2, 2.0, 0.4, { tag: 'roll' });
  }
  const jerkin = sc.mat({
    ramp: JERKIN,
    paint: (h) => {
      // laced up the front: a dark seam, crossed
      const v = sub(h.p, t.ribs.c);
      const across = v[0] * l[0] + v[1] * l[1] + v[2] * l[2];
      const fwd = v[0] * f[0] + v[1] * f[1] + v[2] * f[2];
      if (fwd > 1 && Math.abs(across) < 0.6) return shadeOf(JERKIN, h.tone - 2);
      if (fwd > 1 && Math.abs(across) < 1.3 && (h.y % 3 === 0)) return shadeOf(NAVY, h.tone);
      return null;
    },
  });
  t.overTrunk(jerkin, 0.85, [{ n: u, o: u[0] * s.neck[0] + u[1] * s.neck[1] + u[2] * s.neck[2] - 2.6 }], 'jerkin');
  // over her hips, cut level at the top of her thighs
  sc.ell(jerkin, 'hips', t.pel.c, [mul(t.pel.r[0], t.pel.h[0] + 1.0), mul(t.pel.r[1], t.pel.h[1] + 0.9), mul(t.pel.r[2], t.pel.h[2] + 0.6)], 1.6, { tag: 'hips', cuts: [{ n: mul(s.hips[2], -1) as V3, o: -(s.hips[2][0] * t.pel.c[0] + s.hips[2][1] * t.pel.c[1] + s.hips[2][2] * t.pel.c[2]) + t.pel.h[2] * 0.55 }] });
  const scarf = sc.mat({ ramp: TEAL });
  sc.cone(scarf, 'torso', add(s.neck, add(mul(u, -0.6), mul(f, 0.4))), add(s.neck, add(mul(u, 0.6), mul(f, -0.2))), 2.3, 2.0, 0.6, { tag: 'scarf' });
  sc.ell(scarf, 'torso', add(s.neck, add(mul(f, 2.0), add(mul(u, -1.4), mul(l, -0.6)))), [mul(f, 0.9), mul(l, 1.2), mul(u, 1.0)], 0.4, { tag: 'knot' });
  sc.cone(scarf, 'torso', add(s.neck, add(mul(f, 2.0), add(mul(u, -1.4), mul(l, -0.6)))), add(s.neck, add(mul(f, 2.6), add(mul(u, -4.4), mul(l, -1.4)))), 0.75, 0.55, 0.3, { tag: 'tail' });
  const trousers = sc.mat({ ramp: NAVY });
  t.legsIn(trousers, 1.5, 0.6);
  t.boots(t.bootMat(HIDE, null), true, null);
  // THE BANDOLIER across her from her right shoulder to her left hip, a vial in each loop; and her belt of vials
  const strap = sc.mat({ ramp: HIDE });
  const glassC = sc.mat({ ramp: CYAN });
  const glassV = sc.mat({ ramp: VIOLET_G });
  const glassA = sc.mat({ ramp: AMBER_G });
  const glassG = sc.mat({ ramp: GLASS });
  const vialMats = [glassC, glassV, glassA, glassG];
  const fromSh = t.shoulderTop(-1, 0.6);
  const toHip = t.hipFront(1);
  t.strapOver(strap, fromSh, toHip, 0.75, 0.9);
  for (let i = 0; i < 4; i++) {
    const p0 = lerp3(fromSh, toHip, 0.3 + i * 0.15);
    const out = norm(sub(p0, lerp3(s.waist, s.neck, 0.5)));
    const c = add(p0, mul(out, 2.6));
    sc.cone(vialMats[i % 4], 'torso', add(c, mul(u, -1.1)), add(c, mul(u, 1.0)), 0.85, 0.75, 0.3, { tag: 'vial' });
    sc.ell(t.bootMat(BRASS, null), 'torso', add(c, mul(u, 1.25)), [mul(f, 0.5), mul(l, 0.5), mul(u, 0.35)], 0.1, { tag: 'cork' });
  }
  const belt = sc.mat({ ramp: HIDE });
  const bc = t.waistBand(belt, 0.85, 1.3, 0.55);
  for (let i = 0; i < 5; i++) {
    const ang = -1.2 + i * 0.6;
    const dir = norm(add(mul(f, Math.cos(ang)), mul(l, Math.sin(ang))));
    const c = add(bc, add(mul(dir, t.belly.h[0] * 0.5 + t.belly.h[1] * 0.5 + 1.9), mul(u, -0.9)));
    sc.cone(vialMats[(i + 1) % 4], 'hips', add(c, mul(u, -1.0)), add(c, mul(u, 0.7)), 0.75, 0.65, 0.3, { tag: 'vial' });
  }
  // HER HANDS: in fingerless gloves of dark leather, her fingers bare, a fist round what she holds; a size to read beside
  // her (his “Her hands are tiny too”, 24 Oct)
  const glove = sc.mat({
    ramp: HIDE,
    paint: (h) => {
      const k = farArm(h.prim.piece) ? 1 : 0;
      if (h.prim.tag === 'fist' || h.prim.tag === 'palm') {
        const b = onBall(h.prim as Ell, h.p);
        // (her fingers out of the glove: the front of the fist bare)
        if (b[0] > 0.3) return shadeOf(SKIN_F, h.tone - k);
      }
      if (h.prim.tag === 'finger' || h.prim.tag === 'thumb') return shadeOf(SKIN_F, h.tone - k);
      if (h.prim.tag === 'cuff') return shadeOf(HIDE, h.tone - 1 - k);
      return k ? shadeOf(HIDE, h.tone - 1) : null;
    },
  });
  const steel = sc.mat({ ramp: STEEL5 });
  const brassT = sc.mat({ ramp: BRASS, paint: (h) => (h.prim.tag === 'bit' || h.prim.tag === 'trim' ? shadeOf(BRASS, h.tone - 1) : null) });
  const woodT = sc.mat({ ramp: ['#1a0c08', '#341a10', '#5a3018', '#84502a', '#aa7440'] });
  interface Hand {
    /** The middle of the fist, the way out along the arm, and the way across the palm (what it holds runs along this). */
    c: V3;
    d: V3;
    g: V3;
  }
  /** A hand: `open` a flat hand pointing, else a fist; returns where it is and which ways it lies. */
  const handOf = (side: 'L' | 'R', open = false): Hand => {
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const ha = side === 'L' ? s.handL : s.handR;
    const piece = `arm${side}`;
    const [d, o] = limbFrame(el, ha, side === 'L' ? l : mul(l, -1));
    const x = norm(cross(d, o));
    // (her hands as big as the other heroes' read at this size, a fist over half her head across: his word, 27 Oct, “check
    // her hands for scale”)
    const H = HAND_K;
    sc.cone(glove, piece, lerp3(el, ha, 0.84), add(ha, mul(d, 0.2)), 1.3 * Math.sqrt(H), 1.6 * Math.sqrt(H), 0.3, { tag: 'cuff' });
    if (open) {
      sc.box(glove, piece, add(ha, mul(d, 1.0 * H)), [mul(d, 1.2 * H), mul(o, 0.6 * H), mul(x, 1.25 * H)], 0.5 * H, 0.5, { tag: 'palm' });
      sc.cone(glove, piece, add(ha, add(mul(d, 1.9 * H), mul(x, 0.5 * H))), add(ha, add(mul(d, 4.2 * H), mul(x, 0.6 * H))), 0.5 * H, 0.42 * H, 0.3, { tag: 'finger' });
      sc.ell(glove, piece, add(ha, add(mul(d, 1.2 * H), mul(x, -1.3 * H))), [mul(d, 0.9 * H), mul(o, 0.5 * H), mul(x, 0.5 * H)], 0.3, { tag: 'thumb' });
      return { c: add(ha, mul(d, 1.0 * H)), d, g: x };
    }
    const c = add(ha, mul(d, 1.3 * H));
    sc.box(glove, piece, c, [mul(d, 1.45 * H), mul(o, 1.2 * H), mul(x, 1.55 * H)], 0.8 * H, 0.5, { tag: 'fist' });
    sc.ell(glove, piece, add(c, add(mul(x, -1.4 * H), mul(o, 0.7 * H))), [mul(d, 0.9 * H), mul(o, 0.55 * H), mul(x, 0.55 * H)], 0.3, { tag: 'thumb' });
    return { c, d, g: x };
  };
  /** A wrench in a fist, running `way` from it (a unit: which way its head is). */
  // (her tools BIG, as a gleeful tinkerer's are: a wrench as long as her leg)
  const wrenchIn = (hd: Hand, way: V3, len = 9, k = 1): void => {
    const w1 = add(hd.c, mul(way, len));
    sc.cone(steel, 'wrench', add(hd.c, mul(way, -1.8 * k)), w1, 0.75 * k, 0.85 * k, 0.2, { tag: 'shaft' });
    const side = norm(cross(way, hd.d));
    sc.box(steel, 'wrench', add(w1, mul(way, 1.0 * k)), [mul(way, 1.35 * k), mul(side, 2.0 * k), mul(norm(cross(way, side)), 0.7 * k)], 0.4, 0.3, { tag: 'jaw' });
    sc.box(steel, 'wrench', add(w1, mul(way, 1.9 * k)), [mul(way, 0.9 * k), mul(side, 0.7 * k), mul(norm(cross(way, side)), 1.0 * k)], 0.1, 0, { tag: 'gap', carve: true });
  };
  /** A hammer: a wooden haft, a steel head across its end, a claw behind. */
  const hammerIn = (hd: Hand, way: V3): void => {
    const h1 = add(hd.c, mul(way, 8));
    sc.cone(woodT, 'hammer', add(hd.c, mul(way, -1.6)), h1, 0.7, 0.8, 0.2, { tag: 'haft' });
    const across = norm(cross(way, hd.d));
    sc.box(steel, 'hammer', add(h1, mul(across, 0.9)), [mul(across, 2.3), mul(way, 1.25), mul(hd.d, 1.25)], 0.35, 0.2, { tag: 'head' });
    sc.cone(steel, 'hammer', add(h1, mul(across, -1.2)), add(h1, add(mul(across, -3.8), mul(way, -1.3))), 0.85, 0.25, 0.2, { tag: 'claw' });
  };
  // a brass bracer of gears on her left forearm (her own work); a copper gauge on her belt
  {
    const el = s.elbowL;
    const ha = s.handL;
    const [d, o] = limbFrame(el, ha, l);
    const brassM = sc.mat({
      ramp: BRASS,
      paint: (h) => {
        if (h.prim.tag === 'gear') {
          const b = onBall(h.prim as Ell, h.p);
          const ang = Math.atan2(b[1], b[0]);
          const r = Math.hypot(b[0], b[1]);
          if (r > 0.7 && Math.floor((ang + Math.PI) * 8 / Math.PI) % 2 === 0) return null;
          if (r < 0.3) return shadeOf(BRASS, h.tone - 2);
        }
        if (h.prim.tag === 'bracer') {
          const { t: along } = onCone(h.prim as Cone, h.p, u);
          if (Math.floor(along * 5) % 2 === 0) return shadeOf(BRASS, h.tone - 1);
        }
        return null;
      },
    });
    sc.cone(brassM, 'armL', lerp3(el, ha, 0.25), lerp3(el, ha, 0.75), 1.75, 1.45, 0.4, { tag: 'bracer' });
    const gc = add(lerp3(el, ha, 0.45), mul(o, 1.6));
    sc.ell(brassM, 'armL', gc, [mul(d, 1.5), mul(norm(cross(d, o)), 1.5), mul(o, 0.4)], 0.1, { tag: 'gear' });
    const gauge = sc.mat({ ramp: COPPER, paint: (h) => (onBall(h.prim as Ell, h.p)[0] > 0.55 ? (h.tone >= 2 ? '#f4f0e0' : '#a8a090') : null) });
    sc.ell(gauge, 'hips', add(bc, add(mul(l, -(t.belly.h[1] + 1.6)), add(mul(f, 1.6), mul(u, -2.0)))), [mul(f, 0.9), mul(l, 1.4), mul(u, 1.4)], 0.2, { tag: 'gauge' });
  }
  /** Of two ways across a fist, the one nearer `want`. */
  const toward = (g: V3, want: V3): V3 => (g[0] * want[0] + g[1] * want[1] + g[2] * want[2] >= 0 ? g : mul(g, -1));
  if (kit === 'shoulder') {
    // the wrench over her right shoulder, its head behind her; her left fist on her hip
    const r = handOf('R');
    // (its shaft resting ON her shoulder, clear of it, its head behind her: his word, 27 Oct, “the wrench is clipping”)
    const rest = add(t.shoulderTop(-1, WRENCH_REST.fwd), add(mul(u, 2.2), mul(l, WRENCH_REST.out)));
    const over = norm(sub(rest, r.c));
    // (or brought off it and held out before her, its head down: as she taps it in her palm)
    const k = TINK_SWAY.wrench;
    const out = TINK_SWAY.twirl ? u : norm(add(toward(r.g, f), mul(u, -0.6)));
    let way = k <= 0 ? over : norm(lerp3(over, out, Math.min(1, k)));
    if (TINK_SWAY.spin) {
      // (spun round in her fist at her side: turned about her left-to-right)
      const a = TINK_SWAY.spin;
      const kv = cross(l, way);
      const kd = l[0] * way[0] + l[1] * way[1] + l[2] * way[2];
      way = norm(add(add(mul(way, Math.cos(a)), mul(kv, Math.sin(a))), mul(l, kd * (1 - Math.cos(a)))));
    }
    // (bigger: his word, 27 Oct, “let’s make the wrench bigger”)
    wrenchIn(r, way, 15, 1.55);
    const lh = handOf('L');
    if (TINK_SWAY.held) {
      // (a Contraption, shut, gripped in her left by its bell as she throws it: the very one she throws (dev/contraption_fx.ts),
      // laid into her picture so that her fingers and it hide each other truly)
      const held = TINK_SWAY.held;
      let lo: V3 = [Infinity, Infinity, Infinity];
      let hi: V3 = [-Infinity, -Infinity, -Infinity];
      for (const pr of held.prims) {
        const c = pr.k === 'cone' ? lerp3(pr.a, pr.b, 0.5) : pr.c;
        lo = [Math.min(lo[0], c[0]), Math.min(lo[1], c[1]), Math.min(lo[2], c[2])];
        hi = [Math.max(hi[0], c[0]), Math.max(hi[1], c[1]), Math.max(hi[2], c[2])];
      }
      const mid = lerp3(lo, hi, 0.5);
      const at = add(lh.c, mul(lh.d, HELD_OUT));
      graft(sc, held, (v) => v, sub(at, mid));
      TINK_HELD.at = at;
      TINK_HELD.by = sub(at, mid);
    }
    if (TINK_SWAY.vial > 0) {
      // (a vial out of her belt in her left fist, its cyan fizzing)
      const g = toward(lh.g, u);
      // (as big as her fist is now, so it is seen at the game's size: its cyan standing up out of her fist)
      sc.cone(vialMats[0], 'armL', add(lh.c, mul(g, -1.4)), add(lh.c, mul(g, 4.6)), 1.6, 1.35, 0.3, { tag: 'vial' });
      sc.ell(t.bootMat(BRASS, null), 'armL', add(lh.c, mul(g, 5.0)), [mul(f, 1.0), mul(l, 1.0), mul(u, 0.65)], 0.1, { tag: 'cork' });
    }
  } else if (kit === 'key') {
    // THE GOLEM'S KEY, held out before her by its bow: a great brass bow either side of her fist, its shaft out, its bit
    const k = handOf('L');
    const way = norm(add(k.d, mul(u, 0.15)));
    for (const sd of [1, -1]) sc.ell(brassT, 'key', add(k.c, mul(k.g, sd * 2.9)), [mul(k.g, 2.2), mul(u, 2.5), mul(norm(cross(k.g, u)), 0.7)], 0.3, { tag: 'bow' });
    sc.cone(brassT, 'key', add(k.c, mul(way, 1.4)), add(k.c, mul(way, 10.0)), 0.85, 0.85, 0.2, { tag: 'shaft' });
    sc.box(brassT, 'key', add(k.c, add(mul(way, 8.6), mul(u, -1.5))), [mul(way, 1.3), mul(norm(cross(way, u)), 0.55), mul(u, 1.5)], 0.2, 0.2, { tag: 'bit' });
    const r = handOf('R');
    wrenchIn(r, toward(r.g, mul(u, -1)), 5.4);
  } else if (kit === 'remote') {
    // pointing her minions on with her left; in her right a brass control box, a lever on it and a lamp of cyan
    handOf('L', true);
    const r = handOf('R');
    const bx = add(r.c, add(mul(u, 1.8), mul(f, 0.6)));
    sc.box(brassT, 'remote', bx, [mul(f, 1.7), mul(l, 2.4), mul(u, 1.5)], 0.5, 0.3, { tag: 'box' });
    sc.box(brassT, 'remote', add(bx, mul(f, 1.6)), [mul(f, 0.2), mul(l, 2.1), mul(u, 1.25)], 0.1, 0, { tag: 'trim' });
    sc.cone(steel, 'remote', add(bx, add(mul(u, 1.4), mul(l, 1.1))), add(bx, add(mul(u, 4.6), add(mul(l, 0.9), mul(f, 1.3)))), 0.42, 0.42, 0.1, { tag: 'lever' });
    sc.ell(sc.mat({ ramp: RED_HAIR }), 'remote', add(bx, add(mul(u, 4.9), add(mul(l, 0.9), mul(f, 1.4)))), [mul(f, 0.8), mul(l, 0.8), mul(u, 0.8)], 0.1, { tag: 'knob' });
    sc.ell(sc.mat({ ramp: CYAN, paint: (h) => (h.tone >= 2 ? '#e8ffff' : CYAN[2]) }), 'remote', add(bx, add(mul(u, 1.4), mul(l, -1.1))), [mul(f, 0.85), mul(l, 0.85), mul(u, 0.7)], 0.1, { tag: 'lamp' });
  } else if (kit === 'tools') {
    // a hammer in her right, the wrench in her left, both out low and ready, their heads up
    const r = handOf('R');
    hammerIn(r, toward(r.g, u));
    const k = handOf('L');
    wrenchIn(k, toward(k.g, u), 5.6);
  } else {
    // (as she was first drawn: the wrench low in her left, a flask of cyan up by her ear in her right)
    const k = handOf('L');
    wrenchIn(k, toward(k.g, u), 5.2);
    const r = handOf('R');
    const c = add(r.c, add(mul(r.d, 0.5), mul(u, 2.4)));
    sc.ell(glassC, 'flask', c, [mul(f, 1.4), mul(l, 1.4), mul(u, 1.5)], 0.5, { tag: 'flask' });
    sc.cone(glassC, 'flask', add(c, mul(u, 1.0)), add(c, mul(u, 2.6)), 0.55, 0.5, 0.4, { tag: 'neck' });
    sc.ell(t.bootMat(BRASS, null), 'flask', add(c, mul(u, 2.8)), [mul(f, 0.6), mul(l, 0.6), mul(u, 0.4)], 0.1, { tag: 'cork' });
  }
  // HER BACKPACK, strapped on over her shoulders, sitting high on her back
  if (pack !== 'none') {
    const ribs = t.ribs;
    // (big, as her tools are, and high on her back: its top over her shoulders, so it is seen from in front too)
    const K = 1.4;
    const back = add(ribs.c, add(mul(f, -(ribs.h[0] + 1.1)), mul(u, 2.6)));
    const deep = (pack === 'satchel' ? 2.0 : pack === 'boiler' ? 2.5 : 1.8) * K;
    const C = add(back, mul(f, -deep));
    // (a point of the pack, from its middle: back (from her), to her left, up; scaled with it)
    const P = (b2: number, lf: number, up: number): V3 => add(C, add(mul(f, -b2 * K), add(mul(l, lf * K), mul(u, up * K))));
    // (its straps: over each shoulder from the front of her chest to the top of the pack)
    for (const side of [1, -1]) {
      t.strapOver(strap, t.shoulderTop(side, 0.8), add(ribs.c, add(mul(f, ribs.h[0] + 0.6), add(mul(l, side * ribs.h[1] * 0.5), mul(u, -ribs.h[2] * 0.7)))), 0.6, 0.3, 'packstrap');
      sc.cone(strap, 'torso', t.shoulderTop(side, 0.8), t.shoulderTop(side, -2.2), 0.6, 0.6, 0.3, { tag: 'packstrap' });
      sc.cone(strap, 'torso', t.shoulderTop(side, -2.2), P(-0.6, side * 2.0, 2.2), 0.6, 0.6, 0.3, { tag: 'packstrap' });
    }
    const brassP = sc.mat({ ramp: BRASS, paint: (h) => (h.prim.tag === 'band' || h.prim.tag === 'rivet' ? shadeOf(COPPER, h.tone) : null) });
    if (pack === 'boiler') {
      // a little brass boiler, banded in copper; its gauge on its side; its chimney up over her right shoulder; a pipe down to her hip
      sc.cone(brassP, 'torso', P(0, 0, -3.6), P(0, 0, 2.8), 2.5 * K, 2.3 * K, 0.8, { tag: 'tank' });
      sc.ell(brassP, 'torso', P(0, 0, 2.8), [mul(f, 2.3 * K), mul(l, 2.3 * K), mul(u, 1.5 * K)], 0.6, { tag: 'dome' });
      for (const z of [-2.2, 1.2]) sc.cone(brassP, 'torso', P(0, 0, z - 0.35), P(0, 0, z + 0.35), 2.75 * K, 2.65 * K, 0.2, { tag: 'band' });
      const gauge = sc.mat({ ramp: COPPER, paint: (h) => (onBall(h.prim as Ell, h.p)[0] > 0.5 ? (h.tone >= 2 ? '#f4f0e0' : '#a8a090') : null) });
      const gp = P(0.2, 2.6, -0.4);
      sc.ell(gauge, 'torso', gp, [mul(l, 0.8 * K), mul(f, 1.2 * K), mul(u, 1.2 * K)], 0.2, { tag: 'gauge' });
      // (its chimney, copper, up past her head over her left shoulder (clear of the wrench over her right), a cap on it)
      const top = P(0, 2.0, 3.0);
      const tip = add(top, add(mul(u, 12), add(mul(f, -0.8), mul(l, 2.6))));
      const flue = sc.mat({ ramp: COPPER });
      sc.cone(flue, 'torso', top, tip, 0.8 * K, 0.7 * K, 0.3, { tag: 'chimney' });
      sc.ell(sc.mat({ ramp: STEEL5 }), 'torso', add(tip, mul(u, 0.4)), [mul(f, 1.2 * K), mul(l, 1.2 * K), mul(u, 0.5 * K)], 0.2, { tag: 'cap' });
      const p1 = P(0, 1.8, -3.2);
      const p2 = add(t.belly.c, add(mul(f, -t.belly.h[0] - 0.6), mul(l, t.belly.h[1] + 0.9)));
      sc.cone(sc.mat({ ramp: COPPER }), 'torso', p1, p2, 0.5, 0.5, 0.3, { tag: 'pipe' });
    } else if (pack === 'satchel') {
      // a leather rucksack, its flap buckled down; a rolled blueprint strapped across its top; a hammer's haft out of its side
      const hide = sc.mat({ ramp: HIDE, paint: (h) => (h.prim.tag === 'flap' ? shadeOf(HIDE, h.tone - 1) : null) });
      sc.box(hide, 'torso', C, [mul(f, deep), mul(l, 3.0 * K), mul(u, 3.4 * K)], 1.2, 0.6, { tag: 'bag' });
      sc.box(hide, 'torso', add(C, add(mul(f, -deep * 0.55), mul(u, 1.6 * K))), [mul(f, 0.5 * K), mul(l, 3.1 * K), mul(u, 2.0 * K)], 0.4, 0.4, { tag: 'flap' });
      for (const side of [1, -1]) sc.box(brassT, 'torso', add(C, add(mul(f, -deep - 0.4), add(mul(l, side * 1.5 * K), mul(u, -0.2 * K)))), [mul(f, 0.3 * K), mul(l, 0.5 * K), mul(u, 0.4 * K)], 0.1, 0.1, { tag: 'buckle' });
      const paper = sc.mat({ ramp: ['#3a3026', '#6a5a42', '#a8946c', '#d4c49c', '#f0e4c4'] });
      sc.cone(paper, 'torso', P(0, 3.8, 3.9), P(0, -3.8, 3.9), 1.0 * K, 1.0 * K, 0.3, { tag: 'roll' });
      // (a hammer's haft up out of its side, past her shoulder)
      // (on her left, clear of the wrench over her right)
      sc.cone(woodT, 'torso', P(0, 2.8, -1.0), P(0.3, 5.0, 7.6), 0.55 * K, 0.5 * K, 0.2, { tag: 'haft' });
      sc.box(steel, 'torso', P(0.3, 5.1, 8.0), [mul(f, 1.5 * K), mul(l, 0.7 * K), mul(u, 0.7 * K)], 0.2, 0.2, { tag: 'head' });
    } else {
      // a frame of her vials in two rows, a brass cap over them, a crank on its side
      sc.box(woodT, 'torso', add(C, mul(f, deep * 0.4)), [mul(f, 0.5 * K), mul(l, 3.0 * K), mul(u, 3.6 * K)], 0.4, 0.3, { tag: 'board' });
      for (const z of [-3.4, 0, 3.4]) sc.box(woodT, 'torso', P(0, 0, z), [mul(f, deep), mul(l, 3.1 * K), mul(u, 0.35 * K)], 0.2, 0.2, { tag: 'shelf' });
      for (let row = 0; row < 2; row++) {
        for (let i = 0; i < 3; i++) {
          // (out at the back of the rack, where they are seen)
          const c = P(0.8, (i - 1) * 1.9, -1.7 + row * 3.4);
          sc.cone(vialMats[(i + row * 2) % 4], 'torso', add(c, mul(u, -1.3 * K)), add(c, mul(u, 1.1 * K)), 0.8 * K, 0.7 * K, 0.3, { tag: 'vial' });
          sc.ell(t.bootMat(BRASS, null), 'torso', add(c, mul(u, 1.3 * K)), [mul(f, 0.5 * K), mul(l, 0.5 * K), mul(u, 0.3 * K)], 0.1, { tag: 'cork' });
        }
      }
      sc.ell(brassP, 'torso', P(0, 0, 4.0), [mul(f, deep + 0.3), mul(l, 3.2 * K), mul(u, 1.1 * K)], 0.4, { tag: 'cap' });
      const ax = P(0, -3.4, 0.6);
      sc.cone(steel, 'torso', ax, add(ax, mul(l, -1.4 * K)), 0.35 * K, 0.35 * K, 0.1, { tag: 'crank' });
      sc.cone(steel, 'torso', add(ax, mul(l, -1.4 * K)), add(ax, add(mul(l, -1.4 * K), mul(u, -1.6 * K))), 0.3 * K, 0.3 * K, 0.1, { tag: 'crank' });
      sc.ell(woodT, 'torso', add(ax, add(mul(l, -1.9 * K), mul(u, -1.6 * K))), [mul(f, 0.4 * K), mul(l, 0.7 * K), mul(u, 0.4 * K)], 0.1, { tag: 'knob' });
    }
  }
  // HER HAIR: red, pulled up into a high ponytail that springs up off her crown and falls back; a fringe at her brow
  const hair = sc.mat({
    ramp: RED_HAIR,
    paint: (h) => ((h.x * 2 + Math.floor(h.y / 2)) % 5 === 0 ? shadeOf(RED_HAIR, h.tone - 1) : null),
  });
  sc.ell(hair, 'head', hat(-0.14, 0, 0.16), [mul(hf, R[0] * 0.94), mul(hl, R[1] * 0.96), mul(hu, R[2] * 0.86)], 0.6, { tag: 'cap', cuts: [{ n: norm(add(mul(hf, 1), mul(hu, -0.55))), o: (() => { const n = norm(add(mul(hf, 1), mul(hu, -0.55))); const p = hat(0.42, 0, 0.3); return n[0] * p[0] + n[1] * p[1] + n[2] * p[2]; })() }] });
  sc.ell(hair, 'head', hat(0.62, 0.15, 0.58), [mul(hf, R[0] * 0.35), mul(hl, R[1] * 0.62), mul(hu, R[2] * 0.22)], 0.6, { tag: 'fringe' });
  // the tie, and the tail: up off the crown, arching back and down
  let a = hat(-0.42, 0, 0.78);
  sc.ell(sc.mat({ ramp: TEAL }), 'head', a, [mul(hf, 0.9), mul(hl, 0.9), mul(hu, 0.7)], 0.2, { tag: 'tie' });
  let r = 1.6;
  const path: V3[] = [
    add(mul(hu, 1.0), mul(hf, -0.3)),
    add(mul(hu, 0.6), mul(hf, -0.8)),
    add(mul(hu, -0.2), mul(hf, -1.0)),
    add(mul(hu, -0.8), mul(hf, -0.6)),
    add(mul(hu, -1.0), mul(hf, -0.2)),
  ];
  // (swung as she moves, more toward its tip: TINK_SWAY; and swung round her wrench, not through it, as hair would be)
  const ofWrench = sc.prims.filter((p) => p.piece === 'wrench' && !p.carve);
  const offSteel = (p: V3, rad: number): V3 => {
    for (let go = 0; go < 4; go++) {
      let worst: { w: (typeof ofWrench)[number]; d: number } | null = null;
      for (const w of ofWrench) {
        const d = primDist(w, p) - rad;
        if (d < 0 && (!worst || d < worst.d)) worst = { w, d };
      }
      if (!worst) return p;
      OFF_STEEL++;
      const w = worst.w;
      const e = 0.05;
      const at = (dx: number, dy: number, dz: number): number => primDist(w, [p[0] + dx, p[1] + dy, p[2] + dz]);
      const g: V3 = [at(e, 0, 0) - at(-e, 0, 0), at(0, e, 0) - at(0, -e, 0), at(0, 0, e) - at(0, 0, -e)];
      p = add(p, mul(norm(g), -worst.d + 0.05));
    }
    return p;
  };
  // (swung less far toward the wrench's head when it is up by her: eased off as it nears it, so it swings up to it and
  // round it rather than into it)
  const jaw = ofWrench.find((p) => p.tag === 'jaw');
  let pony = TINK_SWAY.pony;
  if (jaw && jaw.k === 'box') {
    const toJaw = norm(sub(jaw.c, a));
    const c = pony[0] * toJaw[0] + pony[1] * toJaw[1] + pony[2] * toJaw[2];
    if (c > PONY_TO_JAW) pony = add(pony, mul(toJaw, PONY_TO_JAW + PONY_SOFT * Math.tanh((c - PONY_TO_JAW) / PONY_SOFT) - c));
  }
  for (let i = 0; i < path.length; i++) {
    const dir = add(path[i], mul(pony, ((i + 1) / path.length) * 0.35));
    const b = offSteel(add(a, mul(norm(dir), 2.8)), r * 0.86 + 0.5);
    sc.cone(hair, 'pony', a, b, r, r * 0.86, 0.9, { tag: 'tail' });
    a = b;
    r *= 0.84;
  }
  // HER GOGGLES: pushed up on her brow, brass rims, teal lenses
  const rim = sc.mat({ ramp: BRASS });
  const lens = sc.mat({ ramp: GLASS, paint: (h) => (h.tone >= HER_FACE.glint ? '#e8ffff' : null) });
  sc.cone(sc.mat({ ramp: HIDE }), 'head', hat(0.2, -1.0, 0.42), hat(0.2, 1.0, 0.42), 0.5, 0.5, 0.2, { tag: 'band' });
  for (const side of [1, -1]) {
    const c = hat(HER_FACE.gogF, side * 0.4, HER_FACE.gog);
    sc.ell(rim, 'goggles', c, [mul(hf, 0.8), mul(hl, 1.35), mul(hu, 1.2)], 0.2, { tag: 'rim' });
    sc.ell(lens, 'goggles', add(c, mul(hf, 0.5)), [mul(hf, 0.45), mul(hl, 1.0), mul(hu, 0.9)], 0.1, { tag: 'lens' });
  }
  void TEAL;
  // (a picture taller than a hero's, its floor point as far down it, when she is thrown that high: TINK_SWAY.tall)
  const tall = TINK_SWAY.tall;
  return draw(sc, view, CANVAS3.ax, CANVAS3.ay + tall, { w: CANVAS3.w, h: CANVAS3.h + tall }, undefined, FRIEND_RIM);
}

// ---------------------------------------------------------------------------------------------
// HER BOMB (her swipe, the blast jump: dev/tinkerer_moves.ts, dev/blast_fx.ts): a ball of black iron banded in brass, a
// copper cap, a short fuse with a cyan spark at its end. Built as she holds it (its middle at its floor point's height).

/** Her bomb, built: its solids, to be held (graft) or drawn on the floor (drawBomb). */
export function bombSculpt(): Sculpt {
  const sc = new Sculpt();
  const iron = sc.mat({ ramp: ['#08070c', '#16141e', '#28263a', '#46445e', '#6e6c8c'] });
  const brass = sc.mat({ ramp: BRASS });
  const copper = sc.mat({ ramp: COPPER });
  const spark = sc.mat({ ramp: CYAN, paint: (h) => (h.tone >= 2 ? '#e8ffff' : CYAN[2]) });
  const R = BOMB_R;
  const c: V3 = [0, 0, R + 0.35];
  sc.ell(iron, 'bomb', c, [[R, 0, 0], [0, R, 0], [0, 0, R]], 0.2, { tag: 'iron' });
  sc.ell(brass, 'bomb', c, [[R * 1.06, 0, 0], [0, R * 1.06, 0], [0, 0, R * 0.22]], 0.1, { tag: 'band' });
  sc.cone(copper, 'bomb', [0, 0, c[2] + R * 0.8], [0, 0, c[2] + R * 1.15], R * 0.42, R * 0.38, 0.2, { tag: 'cap' });
  sc.cone(sc.mat({ ramp: HIDE }), 'bomb', [0, 0, c[2] + R * 1.1], [R * 0.25, 0, c[2] + R * 1.55], 0.32, 0.28, 0.1, { tag: 'fuse' });
  sc.ell(spark, 'bomb', [R * 0.32, 0, c[2] + R * 1.66], [[0.5, 0, 0], [0, 0.5, 0], [0, 0, 0.5]], 0.05, { tag: 'spark' });
  return sc;
}
/** How big her bomb is (its half across). */
export const BOMB_R = 2.3;
/** Her bomb set down on the floor, in one of the game's views. */
export function drawBomb(view: GameView, turn = 0): Drawn {
  const sc = bombSculpt();
  sc.spin = turn;
  return draw(sc, view, CANVAS3.ax, CANVAS3.ay, CANVAS3, undefined, FRIEND_RIM);
}

// ---------------------------------------------------------------------------------------------
// THE CONTRAPTION: her turret, a little brass mortar on three legs that lobs her vials

/** The Contraption sculpted, set down on the floor, in one of the game's views; `fire`: its last loosed vial's flash. */
export function sculptContraption(view: GameView, turn = 0): Drawn {
  const sc = new Sculpt();
  sc.spin = turn;
  const K = 1.35;
  const P = (x: number, y: number, z: number): V3 => [x * K, y * K, z * K];
  const brass = sc.mat({
    ramp: BRASS,
    paint: (h) => {
      // rivets round its bands
      if (h.prim.tag === 'band' && (h.x + h.y) % 3 === 0) return shadeOf(BRASS, h.tone + 1);
      return null;
    },
  });
  const steel = sc.mat({ ramp: STEEL5 });
  const copper = sc.mat({
    ramp: COPPER,
    paint: (h) => {
      // the barrel's hoops
      if (h.prim.tag === 'barrel') {
        const { t: along } = onCone(h.prim as Cone, h.p, [0, 0, 1]);
        if (Math.floor(along * 6) % 3 === 0) return shadeOf(COPPER, h.tone - 1);
      }
      return null;
    },
  });
  const dark = sc.mat({ ramp: ['#0a0610', '#140c18', '#1e1422', '#2a1c2c', '#3a2838'] });
  const hub = P(0, 0, 7);
  // three splayed legs, feet on the floor
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.6;
    const foot: V3 = [Math.cos(a) * 7 * K, Math.sin(a) * 7 * K, 0.6];
    const knee: V3 = [Math.cos(a) * 4.6 * K, Math.sin(a) * 4.6 * K, 4.6 * K];
    sc.cone(steel, 'legs', add(hub, [0, 0, -1]), knee, 0.9 * K, 0.75 * K, 0.4, { tag: 'leg' });
    sc.cone(steel, 'legs', knee, foot, 0.75 * K, 0.55 * K, 0.4, { tag: 'leg' });
    sc.ell(brass, 'legs', foot, [[1.2 * K, 0, 0], [0, 1.2 * K, 0], [0, 0, 0.5]], 0.2, { tag: 'foot' });
    sc.ell(brass, 'legs', knee, [[0.8 * K, 0, 0], [0, 0.8 * K, 0], [0, 0, 0.8 * K]], 0.2, { tag: 'joint' });
  }
  // its body: a round brass pot, banded and riveted
  const pot = add(hub, P(0, 0, 2.2));
  sc.ell(brass, 'body', pot, [P(3.8, 0, 0), P(0, 3.8, 0), P(0, 0, 2.8)], 0.6, { tag: 'pot' });
  sc.ell(brass, 'body', add(pot, P(0, 0, -0.4)), [P(4.1, 0, 0), P(0, 4.1, 0), P(0, 0, 0.6)], 0.2, { tag: 'band' });
  // THE MORTAR: a short fat barrel of copper, hooped, cocked up toward its aim, its mouth flared and black
  const aim = norm([0.35, 1, 1.05]);
  const b0 = add(pot, P(0.4, 0, 1.6));
  const b1 = add(b0, mul(aim, 7.6 * K));
  sc.cone(copper, 'barrel', b0, b1, 1.9 * K, 2.1 * K, 0.6, { tag: 'barrel' });
  // (its muzzle: a ring of brass, flat-faced: a box turned round its aim, not a ball)
  const side = norm(cross(aim, [0, 0, 1]));
  const third = norm(cross(side, aim));
  sc.box(brass, 'barrel', b1, [mul(aim, 0.35 * K), mul(side, 2.45 * K), mul(third, 2.45 * K)], 1.2 * K, 0.1, { tag: 'band' });
  sc.box(dark, 'barrel', add(b1, mul(aim, 0.1 * K)), [mul(aim, 0.3 * K), mul(side, 1.6 * K), mul(third, 1.6 * K)], 0.9 * K, 0, { tag: 'bore' });
  // trunnions: the pins it pivots on
  for (const side of [1, -1]) sc.cone(steel, 'barrel', add(b0, P(side * 2.0, 0.3, 0.6)), add(b0, P(side * 3.0, 0.3, 0.6)), 0.8 * K, 0.8 * K, 0.2, { tag: 'pin' });
  // a hopper of vials on its back, their corks in a row
  const hop = add(pot, P(0, -3.0, 3.0));
  sc.box(brass, 'hopper', hop, [P(2.6, 0, 0), P(0, 1.6, 0), P(0, 0, 1.6)], 0.4 * K, 0.4, { tag: 'band' });
  const vials = [sc.mat({ ramp: CYAN }), sc.mat({ ramp: VIOLET_G }), sc.mat({ ramp: AMBER_G })];
  for (let i = 0; i < 3; i++) {
    const c = add(hop, P((i - 1) * 1.5, 0, 1.6));
    sc.cone(vials[i], 'hopper', c, add(c, P(0, 0, 1.7)), 0.6 * K, 0.52 * K, 0.2, { tag: 'vial' });
  }
  // a gear and its crank on its side
  const gear = add(pot, P(4.0, -0.6, 0.2));
  const brassG = sc.mat({
    ramp: BRASS,
    paint: (h) => {
      const b = onBall(h.prim as Ell, h.p);
      const ang = Math.atan2(b[2], b[1]);
      const r = Math.hypot(b[1], b[2]);
      if (r > 0.72 && Math.floor((ang + Math.PI) * 8 / Math.PI) % 2 === 0) return null;
      if (r < 0.3) return shadeOf(BRASS, h.tone - 2);
      return null;
    },
  });
  sc.ell(brassG, 'gear', gear, [P(0.5, 0, 0), P(0, 2.0, 0), P(0, 0, 2.0)], 0.1, { tag: 'gear' });
  sc.cone(steel, 'gear', add(gear, P(0.4, 0, 0)), add(gear, P(1.6, -0.4, 1.6)), 0.4 * K, 0.4 * K, 0.2, { tag: 'crank' });
  // its eye: a lamp of the friend's cyan, lit while it is wound
  const lamp = sc.mat({ ramp: CYAN, paint: (h) => (h.tone >= 2 ? '#e8ffff' : CYAN[2]) });
  sc.ell(lamp, 'body', add(pot, P(3.0, 2.0, 1.0)), [P(0.7, 0, 0), P(0, 0.7, 0), P(0, 0, 0.7)], 0.1, { tag: 'lamp' });
  return draw(sc, view, CANVAS3.ax, CANVAS3.ay, CANVAS3, undefined, FRIEND_RIM);
}

// ---------------------------------------------------------------------------------------------
// THE GOLEM: a clockwork bruiser of brass, a head taller than the knight

/** Its build: tall, a great chest, short thick legs, long arms, a head carried low and forward. */
export const GOLEM_BODY: Build = buildOf(80, 1.4, { shoulders: 1.45, chest: 1.5, waist: 1.05, hips: 1.1, legs: 0.84, arms: 1.12, depth: 1.3, limbs: 1.4 });

/** STANDING READY: hunched forward, its head low before its shoulders, its fists hanging by its knees. */
export function golemStance(B: Build): Bones {
  const t = B.tall / 70;
  return {
    ...standing(B),
    pz: -1.6 * t, yaw: -12, bend: 10, faceUp: 14,
    lfx: 1.4 * t, lfy: 2.6 * t, lft: 12, lk: 14,
    rfx: -1.4 * t, rfy: -2.6 * t, rft: -12, rk: -14,
    lhIn: 0, lhx: 7.0 * t, lhy: 5.5 * t, lhz: -(B.upperArm + B.foreArm) * 0.84, le: 24,
    rhIn: 0, rhx: 5.5 * t, rhy: -5.5 * t, rhz: -(B.upperArm + B.foreArm) * 0.84, re: 24,
  };
}

/** The Golem sculpted, standing ready, in one of the game's views. */
export function sculptGolem(view: GameView, pose?: Bones, turn = 0): Drawn {
  const B = GOLEM_BODY;
  const q = (pose ?? golemStance(B)) as Posed;
  const s = solve(B, q);
  const w: Who = { s, B, view, spin: turn };
  const sc = new Sculpt();
  sc.spin = turn;
  const [f, l, u] = s.chest;
  const [ribs, belly, pel] = trunkOf(B, s);
  const far = (piece: string): boolean => piece.endsWith('L') ? farSide(w, s.elbowL) : piece.endsWith('R') ? farSide(w, s.elbowR) : false;
  // ITS PLATES OF BRASS: banded, riveted along their bands; a plate's edge darker
  const brass = sc.mat({
    ramp: BRASS,
    paint: (h) => {
      const k = far(h.prim.piece) ? 1 : 0;
      const tg = h.prim.tag;
      if (tg === 'chest' || tg === 'plate' || tg === 'helm' || tg === 'greave' || tg === 'gauntlet') {
        // bands running round it, every so far, with rivets along them
        const along = tg === 'chest' || tg === 'helm' ? h.p[2] : h.prim.k === 'cone' ? onCone(h.prim as Cone, h.p, u).t * 10 : onBall(h.prim as Ell, h.p)[2] * 5;
        const band = ((along % 4.2) + 4.2) % 4.2;
        // (a dark seam where two plates meet, rivets along the plate above it)
        if (band < 0.45) return shadeOf(BRASS, h.tone - 2 - k);
        if (band < 1.0 && (h.x % 3 === 0)) return shadeOf(BRASS, h.tone + 1 - k);
      }
      if (tg === 'fist') {
        // its fingers: the fist ridged across, each finger a band
        const b = onBall(h.prim as Ell, h.p);
        if (b[0] > 0.2 && Math.floor((b[2] + 1) * 2.2) % 2 === 0) return shadeOf(BRASS, h.tone - 1 - k);
      }
      return k ? shadeOf(BRASS, h.tone - 1) : null;
    },
  });
  const steel = sc.mat({ ramp: STEEL5, paint: (h) => (far(h.prim.piece) ? shadeOf(STEEL5, h.tone - 1) : null) });
  const copper = sc.mat({ ramp: COPPER, paint: (h) => (far(h.prim.piece) ? shadeOf(COPPER, h.tone - 1) : null) });
  // THE TRUNK: a boiler of a chest, riveted bands round it, a steel waist, a brass skirt of plates over its hips
  sc.ell(brass, 'torso', add(ribs.c, add(mul(u, 1.2), mul(f, 0.6))), [mul(ribs.r[0], ribs.h[0] * 1.15), mul(ribs.r[1], ribs.h[1] * 1.0), mul(ribs.r[2], ribs.h[2] * 1.2)], 1.2, { tag: 'chest' });
  sc.ell(brass, 'torso', add(s.neck, add(mul(u, -2.8), mul(f, -1.6))), [mul(f, ribs.h[0] * 0.95), mul(l, B.shoulderHalf * 0.8), mul(u, 3.4)], 2.4, { tag: 'chest' });
  sc.cone(steel, 'torso', belly.c, pel.c, belly.h[1] * 0.75, pel.h[1] * 0.85, 0.8, { tag: 'waist' });
  sc.ell(brass, 'hips', add(pel.c, mul(s.hips[2], -0.6)), [mul(s.hips[0], pel.h[0] + 0.8), mul(s.hips[1], pel.h[1] + 1.0), mul(s.hips[2], pel.h[2] * 0.9)], 0.6, { tag: 'hipplate' });
  // ITS HEART: a round window in its chest, a furnace of the friend's cyan behind it, a gear turning in the light
  const heart = sc.mat({
    ramp: CYAN,
    paint: (h) => {
      const b = onBall(h.prim as Ell, h.p);
      const ang = Math.atan2(b[1], b[2]);
      const r = Math.hypot(b[1], b[2]);
      if (r > 0.42 && r < 0.74 && Math.floor((ang + Math.PI) * 10 / Math.PI) % 2 === 0) return BRASS[1];
      if (r < 0.2) return BRASS[1];
      return r < 0.42 ? '#e8ffff' : CYAN[3];
    },
  });
  const win = add(ribs.c, add(mul(f, ribs.h[0] * 1.15 + 0.2), mul(u, 0.6)));
  sc.ell(copper, 'torso', win, [mul(f, 1.6), mul(l, 4.6), mul(u, 4.6)], 0.3, { tag: 'bezel' });
  sc.ell(heart, 'torso', add(win, mul(f, 0.8)), [mul(f, 1.1), mul(l, 3.6), mul(u, 3.6)], 0.1, { tag: 'window' });
  // two smoke stacks on its back, copper pipes from them to its shoulders, and the great key that winds it
  for (const side of [1, -1]) {
    const base = add(s.neck, add(mul(f, -ribs.h[0] * 0.95), add(mul(l, side * 3.4), mul(u, -1.6))));
    const top = add(base, add(mul(u, 7.2), mul(f, -1.8)));
    sc.cone(copper, 'stacks', base, top, 1.3, 1.5, 0.4, { tag: 'stack' });
    sc.cone(brass, 'stacks', add(top, mul(u, -0.4)), add(top, mul(u, 0.5)), 1.9, 1.9, 0.2, { tag: 'cap' });
    const sh = side > 0 ? s.shoulderL : s.shoulderR;
    sc.cone(copper, 'stacks', add(base, mul(u, 1.0)), add(sh, add(mul(f, -2.6), mul(u, 2.4))), 0.6, 0.6, 0.3, { tag: 'pipe' });
  }
  const keyAt = add(ribs.c, mul(f, -ribs.h[0] * 1.15));
  sc.cone(steel, 'key', keyAt, add(keyAt, mul(f, -3.2)), 0.8, 0.8, 0.3, { tag: 'shaft' });
  for (const side of [1, -1]) sc.ell(brass, 'key', add(keyAt, add(mul(f, -3.6), mul(l, side * 2.2))), [mul(f, 0.5), mul(l, 2.2), mul(u, 2.8)], 0.4, { tag: 'bow' });
  // ITS HEAD: a riveted helm carried low and forward, a grille for a face, the friend's cyan burning through its slit
  const [hf, hl, hu] = s.face;
  const R = B.headR;
  const hat = (fw: number, lf: number, up: number): V3 => add(s.head, add(mul(hf, R[0] * fw), add(mul(hl, R[1] * lf), mul(hu, R[2] * up))));
  sc.ell(brass, 'head', hat(0, 0, 0.05), [mul(hf, R[0] * 1.05), mul(hl, R[1] * 1.15), mul(hu, R[2] * 0.85)], 1.0, { tag: 'helm' });
  sc.box(brass, 'head', hat(0.3, 0, -0.55), [mul(hf, R[0] * 0.75), mul(hl, R[1] * 1.0), mul(hu, R[2] * 0.4)], 0.8, 1.0, { tag: 'jaw' });
  const grille = sc.mat({ ramp: ['#0a0810', '#141020', '#201a30', '#2e2640', '#3e3454'], paint: (h) => ((h.x % 2 === 0) ? STEEL5[2] : null) });
  sc.box(grille, 'head', hat(1.0, 0, -0.45), [mul(hf, 0.6), mul(hl, R[1] * 0.75), mul(hu, R[2] * 0.3)], 0.3, 0.1, { tag: 'grille' });
  const visor = sc.mat({ ramp: CYAN, paint: (h) => (h.tone >= 2 ? '#e8ffff' : CYAN[2]) });
  sc.box(visor, 'head', hat(1.0, 0, 0.12), [mul(hf, 0.5), mul(hl, R[1] * 0.8), mul(hu, 0.5)], 0.2, 0.1, { tag: 'slit' });
  // ITS ARMS: a great shoulder plate over a steel ball joint, a steel upper arm with a copper piston along it, a gauntlet
  // of brass flaring to the wrist, and a huge fist
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const ha = side === 'L' ? s.handL : s.handR;
    const piece = `arm${side}`;
    const sign = side === 'L' ? 1 : -1;
    const out = mul(l, sign);
    const [, uo] = limbFrame(sh, el, out);
    sc.ell(steel, piece, sh, [mul(f, 3.0), mul(l, 3.0), mul(u, 3.0)], 0.6, { tag: 'ball' });
    // (the plate: broad, flat, sloping down and out over the joint; a second under it)
    const tilt = norm(add(u, mul(out, 0.55)));
    sc.ell(brass, piece, add(sh, add(mul(u, 2.0), mul(out, 1.2))), [mul(f, 5.2), mul(norm(cross(f, tilt)), 4.8), mul(tilt, 1.5)], 0.6, { tag: 'plate' });
    sc.ell(brass, piece, add(sh, add(mul(u, 0.2), mul(out, 3.0))), [mul(f, 4.4), mul(norm(cross(f, tilt)), 3.4), mul(tilt, 1.2)], 0.4, { tag: 'plate' });
    sc.cone(steel, piece, sh, el, 2.4, 2.1, 0.6, { tag: 'upper' });
    sc.cone(copper, piece, add(lerp3(sh, el, 0.2), mul(uo, 2.1)), add(lerp3(sh, el, 0.95), mul(uo, 2.1)), 0.65, 0.65, 0.2, { tag: 'piston' });
    sc.ell(steel, piece, el, [mul(f, 2.5), mul(l, 2.5), mul(u, 2.5)], 0.4, { tag: 'joint' });
    const [fd, fo] = limbFrame(el, ha, out);
    sc.cone(brass, piece, el, lerp3(el, ha, 0.72), 2.8, 3.7, 0.4, { tag: 'gauntlet' });
    // THE FIST: bigger than its head
    const fist = add(ha, mul(fd, 1.6));
    const fw = norm(cross(fd, fo));
    sc.box(brass, piece, fist, [mul(fd, 3.6), mul(fo, 3.4), mul(fw, 3.6)], 1.7, 0.6, { tag: 'fist' });
    sc.box(steel, piece, add(fist, mul(fd, -2.6)), [mul(fd, 0.8), mul(fo, 3.6), mul(fw, 3.8)], 0.6, 0.2, { tag: 'cuff' });
  }
  // ITS LEGS: short and thick, a steel thigh, a brass knee, a greave flaring down to a great flat foot
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const piece = `leg${side}`;
    sc.cone(steel, piece, hip, knee, 3.3, 2.7, 0.6, { tag: 'thigh' });
    sc.ell(brass, piece, add(knee, mul(f, 1.2)), [mul(f, 2.0), mul(l, 3.0), mul(u, 2.6)], 0.3, { tag: 'kneecap' });
    sc.cone(brass, piece, knee, lerp3(knee, ankle, 0.82), 3.2, 3.8, 0.4, { tag: 'greave' });
    const fd = norm(sub(toe, heel));
    const fs = norm(cross([0, 0, 1], fd));
    const fc = add(lerp3(heel, toe, 0.55), [0, 0, 1.6]);
    const fhalf = Math.hypot(...sub(toe, heel)) * 0.5 + 2.6;
    const lift = Math.max(0, -(fc[2] - Math.abs(fd[2]) * fhalf - 1.6));
    sc.box(steel, piece, add(fc, [0, 0, lift]), [mul(fd, fhalf), mul(fs, 3.3), [0, 0, 1.6]], 0.9, 0.6, { tag: 'foot' });
  }
  return draw(sc, view, CANVAS3.ax, CANVAS3.ay, CANVAS3, undefined, FRIEND_RIM);
}
