// THE TOWNSFOLK, SCULPTED (the townsfolk chat, 11 Nov 2026). MOCK-UPS: NOTHING OF THE GAME SHOWS THEM UNTIL HIS YES
// (art/townsfolk3.ts, behind TOWNSFOLK3, off).
//
// His words, 8 Nov 2026, 06:25: “And I think the townsfolk need look update and a 30fps makeover”. And his measure for new
// art (9 Nov): the Gate Ward (floor 11) and the Brawler; what is finer is sent back the same as what is rougher.
//
// The town's four people as they stand in the live game (art/townsfolk.ts) are of two older kinds: the armourer, the mystic
// and the stranger are flat rigs of the first kit (Version 14.4), the wordsmith a body of balls and rods on bones (art/smith3.ts,
// 8 Oct). Beside the Brawler in the same hall they read as cut-outs. So each is SCULPTED here as the Brawler is (dev/sculpt.ts,
// on the heroes' bones, art/skeleton.ts): one body, cloth laid over it, each stuff inked off from the next, at the Brawler's
// grain and no finer. WHO EACH IS DOES NOT CHANGE (the looks he has already said yes to, kept):
//   the ARMOURER    a smith: bald, a great pale beard, a teal shirt with the sleeves rolled, a leather apron, a hammer
//   the MYSTIC      a seller of charms: a long robe of the mage's purple, a sash and chains of gold, a great pale turban with
//                   a stone in it, a veil under the eyes; a crystal turning in the air over his open palm
//   the WORDSMITH   ancient and mighty, a head taller than a hero: a night-blue robe to the floor, the wordsmiths' teal mantle
//                   and its cowl, a long white beard, his eyes and the runes on him burning cyan; no staff (his yes, 8 Oct:
//                   “Yes, this is him (Recommended)”)
//   the STRANGER    leaning on his wall in the dark, arms folded under a long dark cloak, the hood down, two points of gold
// None has an edge of light (his rulebook, Pixels 5: "Townsfolk have none").
//
// Each is TRULY TURNED to the four ways along the grid (`turn`: 0 down the screen to the right, -90 down to the left, 90 up to
// the right, 180 up to the left), never its picture flipped: the hammer stays in the hand that holds it.

import type { Light } from '../engine/px';
import type { Ramp } from '../art/kit';
import { CANVAS3 } from '../art/skin';
import type { Stage } from '../art/skin';
import { add, buildOf, cross, dot, len, lerp3, mul, norm, project, solve, standing, sub, trunkOf } from '../art/skeleton';
import type { Bones, Build, Posed, Skeleton, Solid, V3 } from '../art/skeleton';
import { Sculpt, draw, onBall, onCone } from './sculpt';
import type { Cone, Ell, Hit } from './sculpt';
import type { Px } from '../engine/px';
import { GREAT_RUNE, RUNES7, SMITH_BODY, SMITH_STANCE, burning } from '../art/smith3';

// ---------------------------------------------------------------------------------------------
// What every one of them is built with

const sh = (r: Ramp, k: number): string => r[Math.max(0, Math.min(4, Math.round(k)))];
/** A plane cut: keep only what lies where dot(p, n) <= o. */
type Cut = { n: V3; o: number };
/** Keep what lies on the side of `through` that `n` points away from. */
const keepBelow = (n: V3, through: V3): Cut => ({ n, o: dot(n, through) });
/** Nothing below the floor. */
const FLOOR_CUT: Cut = { n: [0, 0, -1], o: 0 };

/** The eye of the game's camera, as a figure turned `turn` is built (before it is truly turned). */
function eyeFor(turn: number): V3 {
  const e: V3 = norm([0.612, -0.612, 0.5]);
  const a = (-turn * Math.PI) / 180;
  return [e[0] * Math.cos(a) - e[1] * Math.sin(a), e[0] * Math.sin(a) + e[1] * Math.cos(a), e[2]];
}

/** One of them being sculpted: the bones, and where things are on them. */
interface Rig {
  B: Build;
  q: Posed;
  s: Skeleton;
  sc: Sculpt;
  turn: number;
  eye: V3;
  /** The top of the back's own forward, left and up (the neck, the shoulders hang from it). */
  f: V3;
  l: V3;
  u: V3;
  ribs: Solid;
  belly: Solid;
  pel: Solid;
  /** Is a point on the far side of the body from the eye? */
  far(pt: V3): boolean;
  /** 1 for a limb on the far side (painted a tone darker, as the heroes' far arm and leg are), 0 otherwise. */
  dk(piece: string): number;
  /** A point of the head: forward, to its left and up, each a share of the head's half-lengths. */
  at(fw: number, lf: number, up: number): V3;
  onHead(pt: V3): V3;
  R: V3;
  hf: V3;
  hl: V3;
  hu: V3;
  /** Where a point of the figure is seen on the canvas (TOWN_CANVAS), in whole pixels: for marks laid by the picture's own grid. */
  pix(p: V3): [number, number];
}

function rigOf(B: Build, bones: Partial<Bones>, turn: number): Rig {
  const q = { ...standing(B), ...bones } as Posed;
  const s = solve(B, q);
  const sc = new Sculpt();
  sc.spin = turn;
  const eye = eyeFor(turn);
  const [f, l, u] = s.upper;
  const [ribs, belly, pel] = trunkOf(B, s);
  const far = (pt: V3): boolean => dot(sub(pt, s.pelvis), eye) < -2.2;
  const dk = (piece: string): number => ((piece === 'armL' ? far(s.elbowL) : piece === 'armR' ? far(s.elbowR) : piece === 'legL' ? far(s.kneeL) : piece === 'legR' ? far(s.kneeR) : false) ? 1 : 0);
  const [hf, hl, hu] = s.face;
  const R = B.headR;
  const at = (fw: number, lf: number, up: number): V3 => add(s.head, add(mul(hf, R[0] * fw), add(mul(hl, R[1] * lf), mul(hu, R[2] * up))));
  const onHead = (pt: V3): V3 => {
    const v = sub(pt, s.head);
    return [dot(v, hf) / R[0], dot(v, hl) / R[1], dot(v, hu) / R[2]];
  };
  const pix = (p: V3): [number, number] => {
    const [x, y] = project(sc.at(p), 'front');
    return [Math.round(TOWN_CANVAS.ax + x), Math.round(TOWN_CANVAS.ay + y)];
  };
  return { B, q, s, sc, turn, eye, f, l, u, ribs, belly, pel, far, dk, at, onHead, R, hf, hl, hu, pix };
}

/** The joints of an arm or a leg. */
function armOf(s: Skeleton, side: 'L' | 'R'): { sh: V3; el: V3; ha: V3 } {
  return side === 'L' ? { sh: s.shoulderL, el: s.elbowL, ha: s.handL } : { sh: s.shoulderR, el: s.elbowR, ha: s.handR };
}
function legOf(s: Skeleton, side: 'L' | 'R'): { hip: V3; knee: V3; ankle: V3; heel: V3; toe: V3 } {
  return side === 'L' ? { hip: s.hipL, knee: s.kneeL, ankle: s.ankleL, heel: s.heelL, toe: s.toeL } : { hip: s.hipR, knee: s.kneeR, ankle: s.ankleR, heel: s.heelR, toe: s.toeR };
}

/**
 * A TRUNK of one stuff, `pad` off the bones' own girth: the ribs broad at the top, the belly under them (`paunch`: how far
 * it stands out in front, a smith's), the seat, the yoke of the shoulders and the slope from the neck out to each.
 */
function trunkIn(g: Rig, mat: number, pad: number, o: { paunch?: number; yoke?: number; cuts?: Cut[]; tag?: string; seat?: boolean } = {}): void {
  const { sc, s, B, f, l, u, ribs, belly, pel } = g;
  const [rf, rl, ru] = ribs.r;
  const cuts = o.cuts;
  const tag = o.tag ?? 'trunk';
  const yoke = o.yoke ?? 1;
  sc.ell(mat, 'torso', ribs.c, [mul(rf, ribs.h[0] * 0.95 + pad), mul(rl, ribs.h[1] * 0.98 + pad), mul(ru, ribs.h[2] * 1.0 + pad)], 2.2, { tag, cuts });
  sc.ell(mat, 'torso', add(ribs.c, mul(ru, ribs.h[2] * 0.42)), [mul(rf, ribs.h[0] * 0.86 + pad), mul(rl, ribs.h[1] * 1.06 + pad), mul(ru, ribs.h[2] * 0.55 + pad)], 2.2, { tag, cuts });
  const paunch = o.paunch ?? 0;
  sc.ell(mat, 'torso', add(belly.c, mul(belly.r[0], 0.2 + paunch * 0.6)), [mul(belly.r[0], belly.h[0] * (0.96 + paunch * 0.1) + pad + paunch), mul(belly.r[1], belly.h[1] * 0.97 + pad), mul(belly.r[2], belly.h[2] * 1.1 + pad)], 2.4, { tag, cuts });
  if (o.seat !== false) sc.ell(mat, 'torso', pel.c, [mul(pel.r[0], pel.h[0] + pad), mul(pel.r[1], pel.h[1] + pad), mul(pel.r[2], pel.h[2] + pad * 0.5)], 2.0, { tag, cuts });
  sc.ell(mat, 'torso', add(s.neck, add(mul(u, -2.6 * yoke), mul(f, -0.7))), [mul(f, ribs.h[0] * 0.72 + pad), mul(l, B.shoulderHalf * 0.86 + pad), mul(u, 2.8 * yoke + pad * 0.6)], 2.2, { tag, cuts });
  for (const side of [1, -1]) {
    const shd = side > 0 ? s.shoulderL : s.shoulderR;
    sc.cone(mat, 'torso', add(s.neck, add(mul(u, 0.2), mul(f, -0.9))), add(shd, add(mul(u, 0.7), mul(f, -0.5))), 2.2 * yoke + pad * 0.7, 1.7 * yoke + pad * 0.7, 1.8, { tag, cuts });
  }
}

/** A limb's own three ways: along it, out from the body, and the third. */
function frameOf(a: V3, b: V3, out: V3, or: V3): readonly [V3, V3, V3] {
  const d = norm(sub(b, a));
  const o = norm(sub(out, mul(d, dot(out, d))), or);
  return [d, o, norm(cross(d, o))];
}

/** A hand closed in a fist (round a handle, or on a hip): the block of it and the thumb folded over. `k`: how big. */
function fistOf(g: Rig, mat: number, side: 'L' | 'R', k: number, tag = 'fist'): void {
  const { sc, s, l } = g;
  const { el, ha } = armOf(s, side);
  const d = norm(sub(ha, el));
  const across = norm(cross(d, side === 'L' ? l : mul(l, -1)), [0, 0, 1]);
  const side3 = norm(cross(across, d));
  sc.box(mat, `arm${side}`, add(ha, mul(d, 0.9 * k)), [mul(d, 1.9 * k), mul(side3, 1.75 * k), mul(across, 1.6 * k)], 1.0 * k, 0.9, { tag });
  sc.ell(mat, `arm${side}`, add(ha, add(mul(d, 1.2 * k), add(mul(across, -1.25 * k), mul(side3, -0.9 * k)))), [mul(d, 1.0 * k), mul(side3, 0.75 * k), mul(across, 0.7 * k)], 0.5, { tag: 'thumb' });
}

/** A hand held open, its palm facing `palm`: the flat of it, the fingers together beyond, the thumb out. */
function openHand(g: Rig, mat: number, side: 'L' | 'R', palm: V3, k: number): void {
  const { sc, s } = g;
  const { el, ha } = armOf(s, side);
  const d = norm(sub(ha, el));
  const n = norm(sub(palm, mul(d, dot(palm, d))), [0, 0, 1]);
  const w = norm(cross(d, n));
  sc.box(mat, `arm${side}`, add(ha, mul(d, 0.7 * k)), [mul(d, 1.5 * k), mul(w, 1.6 * k), mul(n, 0.75 * k)], 0.7 * k, 0.8, { tag: 'palm' });
  sc.box(mat, `arm${side}`, add(ha, mul(d, 2.9 * k)), [mul(d, 1.5 * k), mul(w, 1.45 * k), mul(n, 0.6 * k)], 0.6 * k, 0.7, { tag: 'fingers' });
  sc.cone(mat, `arm${side}`, add(ha, add(mul(d, 0.2 * k), mul(w, (side === 'L' ? -1 : 1) * 1.4 * k))), add(ha, add(mul(d, 1.9 * k), mul(w, (side === 'L' ? -1 : 1) * 2.4 * k))), 0.62 * k, 0.5 * k, 0.5, { tag: 'thumb' });
}

/**
 * BOOTS, set ON the floor (never in it): the foot a block from heel to toe, its sole under it, and the leg of the boot up
 * the shin to `high` of the way from ankle to knee.
 */
function bootsOn(g: Rig, mat: number, high: number, wide = 1): void {
  const { sc, s, B } = g;
  for (const side of ['L', 'R'] as const) {
    const { knee, ankle, heel, toe } = legOf(s, side);
    const [, lK, lA] = B.legR;
    const piece = `leg${side}`;
    const fd = norm(sub(toe, heel));
    const fs = norm(cross([0, 0, 1], fd), [0, 1, 0]);
    let up = norm(cross(fd, fs));
    if (up[2] < 0) up = mul(up, -1);
    const half = len(sub(toe, heel)) * 0.5;
    let c = add(lerp3(heel, toe, 0.5), mul(up, 1.0));
    const low = c[2] - Math.abs(fd[2]) * (half + 0.7) - Math.abs(fs[2]) * 1.8 * wide - Math.abs(up[2]) * 1.25;
    if (low < 0) c = add(c, [0, 0, -low]);
    sc.box(mat, piece, c, [mul(fd, half + 0.7), mul(fs, 1.7 * wide), mul(up, 1.25)], 1.0, 1.1, { tag: 'foot', cuts: [FLOOR_CUT] });
    sc.box(mat, piece, add(c, mul(up, -0.95)), [mul(fd, half + 0.9), mul(fs, 1.85 * wide), mul(up, 0.35)], 0.3, 0.3, { tag: 'sole', cuts: [FLOOR_CUT] });
    sc.cone(mat, piece, lerp3(ankle, knee, high), add(ankle, [0, 0, -0.4]), lA + (lK - lA) * high + 0.75, lA + 0.85, 1.0, { tag: 'boot' });
    sc.cone(mat, piece, lerp3(ankle, knee, high), lerp3(ankle, knee, high - 0.06), lA + (lK - lA) * high + 1.15, lA + (lK - lA) * high + 1.15, 0.3, { tag: 'cuff' });
  }
}

/** A man's head: skull, jaw, brow, cheeks, nose and ears. `o`: how heavy the jaw and the brow are, how big the nose. */
function headIn(g: Rig, skin: number, o: { jaw?: number; brow?: number; nose?: number; ears?: boolean; lean?: number } = {}): void {
  const { sc, at, hf, hl, hu, R, s, u } = g;
  const jaw = o.jaw ?? 1;
  const brow = o.brow ?? 1;
  const nose = o.nose ?? 1;
  sc.ell(skin, 'head', at(-0.12, 0, 0.06), [mul(hf, R[0] * 0.88), mul(hl, R[1] * 0.95), mul(hu, R[2] * 0.82)], 1.2, { tag: 'skull' });
  sc.box(skin, 'head', at(0.26, 0, -0.42), [mul(hf, R[0] * 0.62 * jaw), mul(hl, R[1] * 0.76 * (o.lean ?? 1)), mul(hu, R[2] * 0.42)], 1.6, 1.6, { tag: 'jaw' });
  sc.ell(skin, 'head', at(0.68, 0, 0.24), [mul(hf, R[0] * 0.32 * brow), mul(hl, R[1] * 0.84), mul(hu, R[2] * 0.19)], 0.9, { tag: 'brow' });
  for (const side of [1, -1]) sc.ell(skin, 'head', at(0.58, side * 0.5, -0.1), [mul(hf, 1.0), mul(hl, 1.15), mul(hu, 0.9)], 0.8, { tag: 'cheek' });
  sc.cone(skin, 'head', at(0.84, 0, 0.12), at(1.06, 0, -0.14), 0.7 * nose, 0.95 * nose, 0.6, { tag: 'nose' });
  if (o.ears !== false) for (const side of [1, -1]) sc.ell(skin, 'head', at(-0.1, side * 0.94, -0.03), [mul(hf, 0.8), mul(hl, 0.42), mul(hu, 1.1)], 0.4, { tag: 'ear' });
  sc.cone(skin, 'head', add(s.neck, mul(u, -1.5)), s.skull, 2.6, 2.3, 1.5, { tag: 'neck' });
}

/** What is painted with a figure, over everything (sparks, a crystal's light, a rune in the air), and its lights. */
export interface Aloft {
  paint?: (st: Stage, at: (p: V3) => [number, number]) => void;
  lights?: (at: (p: V3) => [number, number]) => Light[];
  /** Where it stands (a point of the figure's space): the figure hides it where the figure is nearer the eye than that. */
  stands?: V3;
}

/** One of them sculpted in a pose: the sculpture, its bones, and what is in the air about it. */
export interface TownFigure {
  sc: Sculpt;
  s: Skeleton;
  B: Build;
  aloft: Aloft[];
}

/** The canvas they are painted on (the heroes' own is too low for the wordsmith's great rune): its floor point at (ax, ay). */
export const TOWN_CANVAS = { w: 208, h: 216, ax: 104, ay: 168 };

/** One of them painted: the picture, and its lights (picture pixels, as the kit's Painted). */
export interface TownPainted {
  px: Px;
  lights: Light[];
  fig: TownFigure;
}

/** A sculpted townsman drawn in the game's view: no edge of light (Pixels 5: "Townsfolk have none"). */
export function paintFigure(fig: TownFigure, canvas: { w: number; h: number; ax: number; ay: number } = TOWN_CANVAS): TownPainted {
  let where: (p: V3) => [number, number] = () => [0, 0];
  let near = Infinity;
  const d = draw(fig.sc, 'front', canvas.ax, canvas.ay, canvas, (st) => {
    where = (p: V3): [number, number] => {
      const [x, y] = st.at(fig.sc.at(p));
      return [x, y];
    };
    for (const a of fig.aloft) {
      a.paint?.(st, where);
      if (a.paint && a.stands) near = Math.min(near, st.near(fig.sc.at(a.stands)) + 1.5);
    }
  }, null, () => near);
  const lights: Light[] = [];
  for (const a of fig.aloft) if (a.lights) lights.push(...a.lights(where));
  return { px: d.px, lights, fig };
}

// ---------------------------------------------------------------------------------------------
// THE ARMOURER

/** Skin: a smith's, ruddy from the forge. */
const A_SKIN: Ramp = ['#3a1a26', '#6e3638', '#aa6650', '#d49474', '#f2c6a2'];
/** His beard and what hair is left to him: pale, a little warm (never the old lavender: it read as a mask). */
const A_BEARD: Ramp = ['#4c4658', '#787288', '#aca6b6', '#dad4de', '#f8f4f6'];
/** His shirt: the town's teal, a step duller than a glow. */
const A_SHIRT: Ramp = ['#082a36', '#0e4654', '#186e7e', '#2c96a0', '#58bcbc'];
/** His apron: thick brown leather, scorched. */
const A_APRON: Ramp = ['#1c1010', '#3a2218', '#603c28', '#88583a', '#aa7c52'];
/** Trousers: dark wool. */
const A_WOOL: Ramp = ['#0e0a1a', '#1c162e', '#30294a', '#4a416a', '#665c8c'];
/** Boots and straps: dark hide. */
const A_HIDE: Ramp = ['#120a0c', '#261614', '#42281e', '#603e2c', '#7e583e'];
/** The hammer's head: iron, its face worn bright. */
const A_IRON: Ramp = ['#18181f', '#32323c', '#565662', '#848490', '#b6b6c0'];
const A_WOOD: Ramp = ['#1a0c08', '#341a10', '#5a3018', '#84502a', '#aa7440'];

/** Floor to crown. A hero is 54.5 to 58: he is of their height, and half as broad again. */
export const ARMOURER_TALL = 56;
/** HIS BODY: a barrel of a man: a great chest and a belly under it, short thick legs, arms like a smith's. */
export const ARMOURER_BUILD: Build = buildOf(ARMOURER_TALL, 1.56, { shoulders: 1.34, chest: 1.32, depth: 1.24, waist: 1.34, hips: 1.12, legs: 0.9, arms: 1.04, limbs: 1.36, trunk: 1.08, pad: 1.3 });

/** How far before him the anvil's face is, and how high (art/town.ts makeAnvil: a tile on, 29 up), in his own lengths. */
export const ANVIL = { fwd: 39.2, up: 29 };

export interface ArmourerPose {
  bones: Partial<Bones>;
  /** Sparks off the anvil: 0 none, else how far they have flown, 0..1. */
  sparks?: number;
  /** How far his beard has swung (his own left), and lifted. */
  beard?: readonly [number, number];
}

/** THE ARMOURER, sculpted in a pose; `turn`: truly turned, degrees to his left. */
export function sculptArmourer(p: ArmourerPose, turn = 0): TownFigure {
  const B = ARMOURER_BUILD;
  const g = rigOf(B, p.bones, turn);
  const { sc, s, f, l, u, ribs, belly, pel, at, onHead, hf, hl, hu, R, dk } = g;
  const [rf, rl, ru] = ribs.r;

  // ---- SKIN ----
  const skin = sc.mat({
    ramp: A_SKIN,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const d = dk(h.prim.piece);
      if (h.prim.piece === 'head') {
        const [fw, lf, up] = onHead(h.p);
        if (tg === 'nose' && h.tone >= 2) return sh(A_SKIN, h.tone + 1);
        // (his face must read: lifted a tone, as the heroes' faces are; his cheeks ruddy)
        if (tg === 'cheek' && fw > 0.4) return sh(A_SKIN, Math.max(2, h.tone));
        if (tg !== 'neck' && fw > 0.36 && up < 0.34 && up > -0.8) return sh(A_SKIN, Math.max(2, h.tone + 1) - (Math.abs(lf) > 0.66 ? 1 : 0));
        if (tg === 'ear' && Math.abs(up + 0.05) < 0.2) return sh(A_SKIN, 1);
        // (the crown of his bald head: one pixel of shine where the light falls)
        return null;
      }
      // the hair on his forearms: a darker fleck here and there
      if ((tg === 'fore' || tg === 'foreBulge') && (h.x * 3 + h.y * 5) % 7 === 0) return sh(A_SKIN, h.tone - 1 - d);
      return d ? sh(A_SKIN, h.tone - 1) : null;
    },
  });
  headIn(g, skin, { jaw: 1.08, brow: 1.1, nose: 1.25 });
  // (bare forearms, thick as a smith's: bare from the rolled sleeve down)
  for (const side of ['L', 'R'] as const) {
    const { el, ha } = armOf(s, side);
    const piece = `arm${side}`;
    const out = mul(l, side === 'L' ? 1 : -1);
    const wrist = lerp3(el, ha, 0.82);
    sc.cone(skin, piece, el, wrist, 2.9, 2.0, 1.2, { tag: 'fore' });
    const [fd, fo, fw] = frameOf(el, ha, out, f);
    sc.ell(skin, piece, add(lerp3(el, ha, 0.26), mul(fo, 0.6)), [mul(fd, 3.3), mul(fo, 2.8), mul(fw, 2.6)], 1.0, { tag: 'foreBulge' });
    fistOf(g, skin, side, 1.22);
  }

  // ---- THE SHIRT: teal, over his trunk and shoulders, the sleeves rolled above the elbow ----
  const shirt = sc.mat({
    ramp: A_SHIRT,
    paint: (h) => {
      const d = dk(h.prim.piece);
      const tg = h.prim.tag ?? '';
      // the roll of each sleeve: a tone lighter, a dark line under it
      if (tg === 'roll') return sh(A_SHIRT, h.tone + 1 - d);
      // creases where the cloth is pulled over him
      if (tg === 'sleeve' && (h.x + h.y * 2) % 6 === 0) return sh(A_SHIRT, h.tone - 1 - d);
      return d ? sh(A_SHIRT, h.tone - 1) : null;
    },
  });
  trunkIn(g, shirt, 0.9, { paunch: 2.2, yoke: 1.15, tag: 'shirt' });
  for (const side of ['L', 'R'] as const) {
    const { sh: shd, el } = armOf(s, side);
    const piece = `arm${side}`;
    const out = mul(l, side === 'L' ? 1 : -1);
    const [ud, uo] = frameOf(shd, el, out, f);
    // (the shoulder's own three ways, square to each other)
    const dOut = norm(sub(uo, mul(f, dot(uo, f))), out);
    let dUp = norm(cross(f, dOut), u);
    if (dot(dUp, u) < 0) dUp = mul(dUp, -1);
    sc.ell(shirt, piece, add(shd, add(mul(u, -0.2), mul(uo, 1.0))), [mul(f, 3.9), mul(dOut, 3.6), mul(dUp, 3.6)], 1.4, { tag: 'sleeve' });
    sc.cone(shirt, piece, shd, lerp3(shd, el, 0.78), 3.6, 3.2, 1.4, { tag: 'sleeve' });
    sc.cone(shirt, piece, lerp3(shd, el, 0.66), lerp3(shd, el, 0.84), 3.75, 3.75, 0.5, { tag: 'roll' });
    void ud;
  }

  // ---- TROUSERS AND BOOTS ----
  const wool = sc.mat({ ramp: A_WOOL, paint: (h) => (dk(h.prim.piece) ? sh(A_WOOL, h.tone - 1) : null) });
  for (const side of ['L', 'R'] as const) {
    const { hip, knee, ankle } = legOf(s, side);
    const [lH, lK, lA] = B.legR;
    const piece = `leg${side}`;
    sc.cone(wool, piece, add(hip, mul(s.hips[2], 0.8)), knee, lH * 1.08 + 0.5, lK * 1.05 + 0.5, 1.5, { tag: 'thigh' });
    sc.cone(wool, piece, knee, lerp3(knee, ankle, 0.7), lK * 1.02 + 0.5, lA + 0.9, 1.2, { tag: 'shin' });
  }
  const hide = sc.mat({
    ramp: A_HIDE,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      if (tg === 'sole') return sh(A_HIDE, h.tone - 2);
      if (tg === 'cuff') return sh(A_HIDE, h.tone + 1);
      return dk(h.prim.piece) ? sh(A_HIDE, h.tone - 1) : null;
    },
  });
  bootsOn(g, hide, 0.42, 1.08);

  // ---- THE APRON: thick leather. A bib on his chest, a skirt round his front to the knee, a strap round his neck, strings
  // round his waist tied in a bow behind ----
  const waistC = add(belly.c, mul(belly.r[2], -belly.h[2] * 0.25));
  const kneeZ = Math.max(s.kneeL[2], s.kneeR[2]) - 1.2;
  const apron = sc.mat({
    ramp: A_APRON,
    crease: 0.2,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      if (tg === 'bib' || tg === 'skirt') {
        // its stitched edge, a tone lighter; scorch marks, darker, where the sparks have caught it; a pocket
        const v = sub(h.p, waistC);
        const across = dot(v, belly.r[1]);
        const up = dot(v, belly.r[2]);
        if (tg === 'bib') {
          const b = onBall(h.prim as Ell, h.p);
          if (Math.abs(b[1]) > 0.8 || b[2] > 0.82) return sh(A_APRON, h.tone + 1);
        }
        if (tg === 'skirt') {
          if (h.p[2] < kneeZ + 1.3) return sh(A_APRON, h.tone + 1);
          // (the pocket: its outline)
          const inPocket = Math.abs(across - 0.5) < 3.4 && up < -3.2 && up > -8.6;
          const edge = inPocket && (Math.abs(Math.abs(across - 0.5) - 3.4) < 0.7 || Math.abs(up + 3.2) < 0.6 || Math.abs(up + 8.6) < 0.6);
          if (edge) return sh(A_APRON, h.tone - 1);
        }
        const k = (Math.floor(h.p[2] * 1.3) * 7 + Math.floor(across * 1.1) * 13) % 23;
        if (k === 0 || k === 9) return sh(A_APRON, h.tone - 1);
      }
      if (tg === 'bow') return sh(A_APRON, h.tone + 1);
      return null;
    },
  });
  {
    // the bib: a pad of leather on the front of his chest and belly, its top under his beard
    const front = keepBelow(mul(rf, -1), add(ribs.c, mul(rf, ribs.h[0] * 0.22)));
    const bibC = add(lerp3(ribs.c, belly.c, 0.42), mul(rf, 0.5));
    sc.ell(apron, 'apron', bibC, [mul(rf, ribs.h[0] * 0.98 + 2.6), mul(rl, ribs.h[1] * 0.6), mul(ru, ribs.h[2] * 1.02)], 0.6, { tag: 'bib', cuts: [front] });
    // the skirt: round his front and sides from the waist to the knee, open behind
    const frontOnly = keepBelow(mul(pel.r[0], -1), add(pel.c, mul(pel.r[0], -pel.h[0] * 0.55)));
    const top = keepBelow([0, 0, 1], add(waistC, [0, 0, 1.2]));
    const bot: Cut = { n: [0, 0, -1], o: -kneeZ };
    const mid = lerp3(waistC, lerp3(s.kneeL, s.kneeR, 0.5), 0.5);
    sc.ell(apron, 'apron', add(mid, mul(pel.r[0], 1.0)), [mul(pel.r[0], pel.h[0] + 4.6), mul(pel.r[1], pel.h[1] + 3.8), [0, 0, (waistC[2] - kneeZ) * 0.95]], 0.8, { tag: 'skirt', cuts: [frontOnly, top, bot] });
    // the strings round his waist
    sc.ell(apron, 'apron', waistC, [mul(belly.r[0], belly.h[0] + 3.5), mul(belly.r[1], belly.h[1] + 1.9), mul(belly.r[2], 0.85)], 0.3, { tag: 'string' });
    // ... tied in a bow at the small of his back: two loops and two ends
    const knot = add(waistC, mul(belly.r[0], -(belly.h[0] + 3.2)));
    for (const side of [1, -1]) {
      sc.ell(apron, 'apron', add(knot, add(mul(belly.r[1], side * 1.9), mul(belly.r[2], 0.5))), [mul(belly.r[0], 0.7), mul(belly.r[1], 1.7), mul(belly.r[2], 1.1)], 0.3, { tag: 'bow' });
      sc.cone(apron, 'apron', knot, add(knot, add(mul(belly.r[1], side * 1.2), add(mul(belly.r[2], -4.4), mul(belly.r[0], -0.4)))), 0.6, 0.45, 0.2, { tag: 'bow' });
    }
    // the strap from the bib's corners up round the back of his neck
    for (const side of [1, -1]) {
      const a = add(bibC, add(mul(rl, side * ribs.h[1] * 0.5), add(mul(ru, ribs.h[2] * 0.8), mul(rf, ribs.h[0] * 0.75 + 1.9))));
      const b = add(s.neck, add(mul(l, side * 3.1), add(mul(u, 0.5), mul(f, 0.6))));
      const c = add(s.neck, add(mul(l, side * 1.6), add(mul(u, 0.4), mul(f, -3.0))));
      sc.cone(apron, 'apron', a, b, 0.75, 0.75, 0.3, { tag: 'strap' });
      sc.cone(apron, 'apron', b, c, 0.75, 0.75, 0.3, { tag: 'strap' });
    }
  }

  // ---- HIS BEARD: great and pale, from his cheeks down over his chest; a moustache over it; heavy brows; the hair left to
  // him low round the back of his head from ear to ear ----
  const [bx, bz] = p.beard ?? [0, 0];
  const hair = sc.mat({
    ramp: A_BEARD,
    meld: true,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const lit = Math.max(2, h.tone + 1);
      // (its strands: hair falls down the picture, a darker run every few pixels, broken)
      if (tg === 'beard' || tg === 'tash') return (h.x + Math.floor(h.y / 3)) % 3 === 0 ? sh(A_BEARD, lit - 1) : sh(A_BEARD, lit);
      if (tg === 'brow') return sh(A_BEARD, Math.min(3, lit));
      if (tg === 'fringe') return (h.x * 2 + h.y) % 5 === 0 ? sh(A_BEARD, h.tone - 1) : null;
      return null;
    },
  });
  {
    const swing = add(mul(hl, bx), mul(hu, bz));
    // the mass of it on his jaw and under his chin
    sc.ell(hair, 'head', at(0.42, 0, -0.78), [mul(hf, R[0] * 0.62), mul(hl, R[1] * 0.92), mul(hu, R[2] * 0.5)], 0.9, { tag: 'beard' });
    for (const side of [1, -1]) sc.cone(hair, 'head', at(-0.02, side * 0.86, -0.3), at(0.4, side * 0.66, -0.9), 1.5, 2.3, 0.8, { tag: 'beard' });
    // down over his chest to a blunt end, stirring
    const a = at(0.58, 0, -1.25);
    const b = add(at(0.66, 0, -2.2), mul(swing, 0.5));
    const c = add(at(0.6, 0, -3.05), swing);
    sc.cone(hair, 'head', a, b, R[1] * 0.86, R[1] * 0.68, 1.0, { tag: 'beard' });
    sc.cone(hair, 'head', b, c, R[1] * 0.68, R[1] * 0.34, 0.9, { tag: 'beard' });
    // the moustache, heavy, hanging past the corners of his mouth
    sc.ell(hair, 'head', at(1.0, 0, -0.4), [mul(hf, 0.8), mul(hl, R[1] * 0.4), mul(hu, 0.8)], 0.4, { tag: 'tash' });
    for (const side of [1, -1]) sc.cone(hair, 'head', at(0.98, side * 0.28, -0.44), at(0.86, side * 0.56, -1.0), 0.9, 0.6, 0.3, { tag: 'tash' });
    // the brows
    for (const side of [1, -1]) sc.cone(hair, 'head', at(0.92, side * 0.12, 0.3), at(0.78, side * 0.72, 0.24), 0.66, 0.5, 0.3, { tag: 'brow' });
    // the fringe: a band low round the back of his skull
    const back = keepBelow(hf, at(0.02, 0, 0));
    const lowOnly = keepBelow(hu, at(0, 0, 0.16));
    sc.ell(hair, 'head', at(-0.12, 0, 0.06), [mul(hf, R[0] * 0.88 + 0.55), mul(hl, R[1] * 0.95 + 0.6), mul(hu, R[2] * 0.82 + 0.3)], 0.5, { tag: 'fringe', cuts: [back, lowOnly] });
  }
  // his eyes: dark, deep under the brows (never lit: his word of the opening's armourer, 25 Oct: “The armorer’s eyes glow for
  // some reason”)
  for (const side of [1, -1]) {
    sc.mark(at(0.82, side * 0.38, 0.08), sh(A_SKIN, 1), 2, 1, side > 0 ? 0 : -1);
    sc.mark(at(0.86, side * 0.36, 0.04), '#140a18');
  }

  // ---- THE HAMMER, in his right hand: a long handle of ash, a block of iron for a head, its face worn bright ----
  const iron = sc.mat({
    ramp: A_IRON,
    paint: (h) => {
      if (h.prim.tag !== 'head') return null;
      const b = onBall(h.prim as Ell, h.p);
      // its two faces, bright with use; a band where the handle goes through
      if (Math.abs(b[0]) > 0.8) return sh(A_IRON, h.tone + 1);
      if (Math.abs(b[0]) < 0.16) return sh(A_IRON, h.tone - 1);
      return null;
    },
  });
  const wood = sc.mat({ ramp: A_WOOD });
  {
    const d = s.point;
    const ac = s.across;
    const third = norm(cross(d, ac));
    const ha = s.handR;
    sc.cone(wood, 'hammer', add(ha, mul(d, -3.4)), add(ha, mul(d, 12.5)), 0.75, 0.7, 0.2, { tag: 'handle' });
    sc.box(iron, 'hammer', add(ha, mul(d, 13.2)), [mul(ac, 4.6), mul(d, 2.3), mul(third, 2.3)], 0.5, 0.3, { tag: 'head' });
  }

  // ---- SPARKS, where the head comes down on the anvil ----
  const aloft: Aloft[] = [];
  const fly = p.sparks ?? 0;
  if (fly > 0) {
    const from: V3 = [ANVIL.fwd, 0, ANVIL.up + 0.5];
    aloft.push({
      paint: (st, where) => {
        const [x0, y0] = where(from);
        const tone = fly < 0.25 ? '#ffffff' : fly < 0.5 ? '#fff3b0' : fly < 0.75 ? '#ffc860' : '#ff8a2a';
        // (a burst of them, up and out in a fan, each on its own arc, falling as it goes; fewer as they die)
        const n = 26;
        for (let j = 0; j < n; j++) {
          const seed = (j * 37) % 17;
          if (fly > 0.55 && seed % 3 === 0) continue;
          if (fly > 0.8 && seed % 2 === 0) continue;
          const a = Math.PI * (0.06 + (0.88 * ((j * 7) % n)) / n);
          const speed = 9 + (seed % 7) * 3.4;
          const dist = speed * (1 - Math.pow(1 - fly, 2.2));
          const x = x0 + Math.cos(a) * dist * 1.25;
          const y = y0 - Math.sin(a) * dist + fly * fly * (16 + (seed % 5) * 3);
          st.over.set(Math.round(x), Math.round(y), tone);
          // (the fastest leave a streak behind them while they are hot)
          if (fly < 0.5 && seed % 2 === 0) st.over.set(Math.round(x - Math.cos(a) * 1.6), Math.round(y + Math.sin(a) * 1.4), fly < 0.25 ? '#fff3b0' : '#ffc860');
        }
        // (the flash on the anvil's face as the blow lands)
        if (fly < 0.3) {
          const r = fly < 0.12 ? 4 : 3;
          for (let dy = -r; dy <= r; dy++) for (let dx = -r * 2; dx <= r * 2; dx++) if ((dx * dx) / (4 * r * r) + (dy * dy) / (r * r) <= 1) st.over.set(Math.round(x0) + dx, Math.round(y0) + dy, Math.abs(dx) + Math.abs(dy) * 2 < r ? '#ffffff' : '#fff3b0');
        }
      },
      lights: (where) => {
        const [x, y] = where(from);
        return [{ x, y, r: 10 + 26 * (1 - fly), color: '#ff8a2a', a: 0.7 * (1 - fly) }];
      },
    });
  }

  void hu;
  void onCone;
  return { sc, s, B, aloft };
}

/**
 * AT HIS WORK, STANDING: square to his anvil, his feet planted wide, his belly out; his left fist on his hip, the elbow
 * out; the hammer in his right hand, its head up over his shoulder, as a man carries one he is about to use.
 */
export function armourerStance(): Partial<Bones> {
  const base: Partial<Bones> = {
    pz: -0.6, bend: 3, hunch: 6, faceUp: -8, faceTurn: 4,
    lfx: 1.2, lfy: 2.6, lft: 22, lk: 16,
    rfx: -1.4, rfy: -2.6, rft: -24, rk: -18,
    le: 78,
    // (the hammer hand up before his right shoulder, the forearm upright, the handle slanting back over the shoulder)
    rhIn: 0, rhx: 5.0, rhy: -1.6, rhz: -3.0, re: 10,
    wAz: -128, wEl: 30, wRoll: 0,
  };
  return fistOnHip(ARMOURER_BUILD, base, 'L');
}

/** A pose with one hand put where `to` says (a point of the figure's own space, found from the bones as they stand in it). */
export function handTo(B: Build, bones: Partial<Bones>, side: 'L' | 'R', to: (s: Skeleton) => V3): Partial<Bones> {
  const s = solve(B, { ...standing(B), ...bones } as Posed);
  const v = sub(to(s), side === 'L' ? s.shoulderL : s.shoulderR);
  const [cf, cl, cu] = s.chest;
  const x = dot(v, cf);
  const y = dot(v, cl);
  const z = dot(v, cu);
  return side === 'L' ? { ...bones, lhIn: 0, lhx: x, lhy: y, lhz: z } : { ...bones, rhIn: 0, rhx: x, rhy: y, rhz: z };
}

/** ... with a fist on the hip of that side: on the top of the hip bone, the knuckles against the waist. */
export function fistOnHip(B: Build, bones: Partial<Bones>, side: 'L' | 'R'): Partial<Bones> {
  const k = side === 'L' ? 1 : -1;
  return handTo(B, bones, side, (s) => add(s.waist, add(mul(s.hips[1], k * (B.waistHalf + B.pad + 2.6)), add(mul(s.hips[0], 0.6), mul(s.hips[2], -1.2)))));
}

// ---------------------------------------------------------------------------------------------
// THE MYSTIC

/** Skin: brown, warm. */
const M_SKIN: Ramp = ['#2a1420', '#52282c', '#84503c', '#b07a54', '#d8a878'];
/** His robe: the mage's purple. */
const M_ROBE: Ramp = ['#1c0c44', '#341874', '#5a2cb8', '#8658e4', '#b490ff'];
/** Its lining and the under-robe at his throat and cuffs: a deep wine. */
const M_WINE: Ramp = ['#1e0618', '#3c0e2a', '#641a3e', '#8e3052', '#b45068'];
/** Gold: the sash, the chains, the bangles, the hem. */
const M_GOLD: Ramp = ['#4a2e0c', '#7a5210', '#c08c1e', '#f0c84e', '#fff0a8'];
/** The turban: pale linen. */
const M_LINEN: Ramp = ['#544a66', '#8a809e', '#c6bed2', '#eee8f4', '#ffffff'];
/** The veil: the town's teal. */
const M_VEIL: Ramp = ['#06262e', '#0c4250', '#166a78', '#2a929a', '#56b8b6'];
/** The stone in his turban and on his chain: an honest red (nothing pink in the town). */
const M_STONE = ['#5a0c14', '#b8202a', '#ff6a4a'];
/** The crystal: friendly magic, the friend's cyan (his rulebook, Colour 3). */
/** His eyes: two points of the crystal's light. */
const M_EYE = '#7af8f0';
const M_CRYSTAL: Ramp = ['#0c6a80', '#18a0b4', '#22d0e0', '#b8fff8', '#ffffff'];

export const MYSTIC_TALL = 57;
/** HIS BODY: slight and straight-backed under the robe; long hands. */
export const MYSTIC_BUILD: Build = buildOf(MYSTIC_TALL, 1.7, { shoulders: 1.0, chest: 0.98, depth: 1.0, waist: 1.0, hips: 1.02, arms: 1.04, limbs: 0.96, pad: 1.4 });

/** How far before him his table's top is, and how high (art/town.ts: the table of wares, a tile on), in his own lengths. */
export const TABLE = { fwd: 26, up: 24 };

export interface MysticPose {
  bones: Partial<Bones>;
  /** The crystal: how far round it has turned (0..1), how far it has lifted off his palm, how bright it blazes (0..1). */
  spin?: number;
  rise?: number;
  flare?: number;
  /** How far the skirts of his robe and the end of his turban have swung (his own forward, left). */
  sway?: readonly [number, number];
  /** Which palm the crystal is over. */
  hand?: 'L' | 'R';
}

/** Where the crystal's middle is: over the open palm. */
export function crystalAt(s: Skeleton, p: MysticPose): V3 {
  const ha = (p.hand ?? 'R') === 'R' ? s.handR : s.handL;
  return add(ha, [0, 0, 7.5 + (p.rise ?? 0)]);
}

/** THE MYSTIC, sculpted in a pose; `turn`: truly turned, degrees to his left. */
export function sculptMystic(p: MysticPose, turn = 0): TownFigure {
  const B = MYSTIC_BUILD;
  const g = rigOf(B, p.bones, turn);
  const { sc, s, f, l, u, ribs, belly, pel, at, onHead, hf, hl, hu, R, dk, pix } = g;
  const [rf, rl, ru] = ribs.r;
  const [swx, swy] = p.sway ?? [0, 0];
  const hand = p.hand ?? 'R';

  // ---- SKIN: his brow and eyes between the turban and the veil, his throat, his hands ----
  const skin = sc.mat({
    ramp: M_SKIN,
    paint: (h) => {
      const d = dk(h.prim.piece);
      if (h.prim.piece === 'head') {
        const [fw, lf, up] = onHead(h.p);
        // (the band of his face that is seen: his eyes in the turban's shadow, the bridge of his nose and his cheeks under
        // them lifted a tone so that they read)
        if (h.prim.tag !== 'neck' && fw > 0.3 && up > -0.02) return sh(M_SKIN, 1);
        if (h.prim.tag !== 'neck' && fw > 0.36 && up < 0.4) return sh(M_SKIN, Math.max(2, h.tone + 1) - (Math.abs(lf) > 0.7 ? 1 : 0));
        return null;
      }
      return d ? sh(M_SKIN, h.tone - 1) : null;
    },
  });
  headIn(g, skin, { jaw: 0.92, brow: 0.9, nose: 0.9, lean: 0.9 });

  // ---- THE ROBE: over his trunk and shoulders, its skirts to the floor, wide sleeves ----
  const waistC = add(belly.c, mul(belly.r[2], -belly.h[2] * 0.35));
  const onChest = (pt: V3): V3 => {
    const v = sub(pt, ribs.c);
    return [dot(v, rl), dot(v, ru), dot(v, rf)];
  };
  const robe = sc.mat({
    ramp: M_ROBE,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const d = dk(h.prim.piece);
      if (tg === 'skirt') {
        // a border of gold round the hem, a row of points over it; long folds down the skirts
        if (h.p[2] < 2.4) return sh(M_GOLD, h.tone + (Math.floor(h.x / 2) % 2 === 0 ? 1 : 0));
        if (h.p[2] > 3.6 && h.p[2] < 4.8 && h.x % 4 === 0) return sh(M_GOLD, 3);
        const { around } = onCone(h.prim as Cone, h.p, s.hips[0]);
        if (Math.floor((around + Math.PI) * 2.9) % 3 === 0) return sh(M_ROBE, h.tone - 1);
        return null;
      }
      if (tg === 'robe') {
        // THE CHAINS round his neck: two loops of gold on his chest, hanging lower in the middle
        const [a, b, c] = onChest(h.p);
        if (c > 0) {
          const w1 = ribs.h[1] * 0.62;
          const w2 = ribs.h[1] * 0.8;
          const top = ribs.h[2] * 0.86;
          if (Math.abs(a) < w1 && Math.abs(b - (top - 3.2 * Math.sqrt(Math.max(0, 1 - (a / w1) ** 2)))) < 0.5) return sh(M_GOLD, 3);
          if (Math.abs(a) < w2 && Math.abs(b - (top - 6.6 * Math.sqrt(Math.max(0, 1 - (a / w2) ** 2)))) < 0.55) return sh(M_GOLD, h.tone >= 2 ? 3 : 2);
        }
        // (the opening of the robe at his throat: the under-robe's wine, a V)
        if (c > 0 && b > ribs.h[2] * 0.52 && Math.abs(a) < (b - ribs.h[2] * 0.52) * 0.8) return sh(M_WINE, h.tone);
      }
      // (the mouth of each sleeve edged in gold)
      if (tg === 'bell') {
        const along = onCone(h.prim as Cone, h.p, u).t;
        if (along >= 0.995) return sh(M_WINE, h.tone - 1);
        if (along > 0.88) return sh(M_GOLD, h.tone + 1 - d);
      }
      if ((tg === 'sleeve' || tg === 'bell') && (h.x * 2 + h.y) % 7 === 0) return sh(M_ROBE, h.tone - 1 - d);
      return d ? sh(M_ROBE, h.tone - 1) : null;
    },
  });
  trunkIn(g, robe, 1.0, { yoke: 0.95, tag: 'robe' });
  {
    // the skirts: from his hips flaring to the floor, swung a little by how he moves
    const mid = lerp3(s.ankleL, s.ankleR, 0.5);
    const top = add(pel.c, mul(s.hips[2], 1.6));
    const foot: V3 = [mid[0] + s.hips[0][0] * swx + s.hips[1][0] * swy, mid[1] + s.hips[0][1] * swx + s.hips[1][1] * swy, 0.4];
    sc.cone(robe, 'skirt', top, foot, B.pelvisHalf + 0.6, B.stance + 6.2, 1.6, { tag: 'skirt', cuts: [{ n: [0, 0, -1], o: -0.5 }, keepBelow([0, 0, 1], add(waistC, [0, 0, -1.2]))] });
  }
  for (const side of ['L', 'R'] as const) {
    const { sh: shd, el, ha } = armOf(s, side);
    const piece = `arm${side}`;
    const out = mul(l, side === 'L' ? 1 : -1);
    const [, uo] = frameOf(shd, el, out, f);
    sc.ell(robe, piece, add(shd, add(mul(u, -0.3), mul(uo, 0.5))), [mul(f, 3.0), mul(uo, 2.7), mul(u, 2.8)], 1.6, { tag: 'sleeve' });
    sc.cone(robe, piece, shd, el, 2.7, 2.6, 1.4, { tag: 'sleeve' });
    // (the sleeve widens from the elbow to a great open cuff, which hangs below the wrist)
    const wrist = lerp3(el, ha, 0.86);
    sc.cone(robe, piece, el, wrist, 2.6, 3.1, 1.2, { tag: 'bell' });
    const hang = add(wrist, [0, 0, -2.6]);
    sc.ell(robe, piece, lerp3(wrist, hang, 0.5), [mul(norm(sub(ha, el)), 1.2), mul(norm(cross(norm(sub(ha, el)), [0, 0, 1]), l), 1.9), [0, 0, 3.0]], 1.0, { tag: 'drape' });
    // his wrist and a bangle on it
    sc.cone(skin, piece, lerp3(el, ha, 0.74), ha, 1.35, 1.25, 0.6, { tag: 'wrist' });
  }
  // his hands: the one with the crystal over it open, palm up; the other open, palm down over his wares
  openHand(g, skin, hand, [0, 0, 1], 1.0);
  openHand(g, skin, hand === 'R' ? 'L' : 'R', [0, 0, -1], 1.0);

  // ---- GOLD: the sash round his waist, knotted in front, its two ends hanging; bangles ----
  const gold = sc.mat({
    ramp: M_GOLD,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      if (tg === 'sash') return (h.x + h.y) % 3 === 0 ? sh(M_GOLD, h.tone - 1) : sh(M_GOLD, h.tone);
      if (tg === 'end') return h.p[2] < waistC[2] - 9.5 ? sh(M_GOLD, h.tone + 1) : null;
      return null;
    },
  });
  sc.ell(gold, 'sash', waistC, [mul(belly.r[0], belly.h[0] + 3.3), mul(belly.r[1], belly.h[1] + 2.9), mul(belly.r[2], 1.7)], 0.4, { tag: 'sash' });
  {
    const knot = add(waistC, add(mul(belly.r[0], belly.h[0] + 3.4), mul(belly.r[1], 2.2)));
    sc.ell(gold, 'sash', knot, [mul(belly.r[0], 1.0), mul(belly.r[1], 1.3), mul(belly.r[2], 1.3)], 0.3, { tag: 'knot' });
    for (const [dy, long] of [[-0.9, 10.5], [0.9, 8.0]] as const) {
      const a = add(knot, mul(belly.r[1], dy));
      const b: V3 = [a[0] + s.hips[0][0] * (1.2 + swx * 0.5) + s.hips[1][0] * swy * 0.5, a[1] + s.hips[0][1] * (1.2 + swx * 0.5) + s.hips[1][1] * swy * 0.5, a[2] - long];
      sc.cone(gold, 'sash', a, b, 0.8, 0.95, 0.3, { tag: 'end' });
    }
  }
  for (const side of ['L', 'R'] as const) {
    const { el, ha } = armOf(s, side);
    sc.cone(gold, `arm${side}`, lerp3(el, ha, 0.93), lerp3(el, ha, 0.99), 1.75, 1.75, 0.2, { tag: 'bangle' });
  }

  // ---- THE VEIL: teal, from under his eyes down over his nose and mouth to his collar ----
  const veil = sc.mat({
    ramp: M_VEIL,
    paint: (h) => {
      const [, , up] = onHead(h.p);
      // a row of small gold coins along its top edge
      if (up > -0.42 && h.x % 2 === 0) return sh(M_GOLD, 3);
      return (h.x + h.y) % 5 === 0 ? sh(M_VEIL, h.tone - 1) : null;
    },
  });
  {
    const below = keepBelow(hu, at(0, 0, -0.3));
    const front = keepBelow(mul(hf, -1), at(0.1, 0, 0));
    sc.ell(veil, 'veil', at(0.22, 0, -0.36), [mul(hf, R[0] * 0.92), mul(hl, R[1] * 0.98), mul(hu, R[2] * 0.72)], 0.6, { tag: 'veil', cuts: [below, front] });
    // (it hangs to a point on his chest)
    sc.cone(veil, 'veil', at(0.66, 0, -0.9), at(0.72, 0, -1.6), R[1] * 0.62, 0.9, 0.8, { tag: 'veil', cuts: [front] });
  }

  // ---- THE TURBAN: great and pale, wound across and across, the stone at its front, an end hanging behind his shoulder ----
  const [tx, ty] = pix(at(-0.2, 0, 0.9));
  const linen = sc.mat({
    ramp: M_LINEN,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      if (tg === 'wrap' || tg === 'crown') {
        // the windings: slanting lines a pixel wide laid by the picture's own grid (so each is whole), one way on the great
        // roll and the other on the round above it
        const dx = h.x - tx;
        const dy = h.y - ty;
        const v = tg === 'crown' ? dy * 2 - dx : dy * 2 + dx;
        if ((((v >> 1) % 4) + 4) % 4 === 0) return h.tone >= 3 ? M_LINEN[2] : M_LINEN[1];
        return sh(M_LINEN, Math.max(2, h.tone));
      }
      if (tg === 'tail' && (h.x + h.y) % 4 === 0) return sh(M_LINEN, h.tone - 1);
      return null;
    },
  });
  {
    // (a great roll of it round his brow, wider than his head; a smaller round on top; the cloth's end tucked up into it)
    const above = keepBelow(norm(sub(mul(hu, -1), mul(hf, 0.4))), at(0.9, 0, 0.8));
    sc.ell(linen, 'turban', at(-0.28, 0, 0.9), [mul(hf, R[0] * 1.12), mul(hl, R[1] * 1.6), mul(hu, R[2] * 0.72)], 0.6, { tag: 'wrap', cuts: [above] });
    sc.ell(linen, 'turban', at(-0.3, 0, 1.46), [mul(hf, R[0] * 0.84), mul(hl, R[1] * 1.0), mul(hu, R[2] * 0.52)], 1.2, { tag: 'crown' });
    // the end of it, hanging down behind his left shoulder, stirring
    const a = at(-0.9, 0.7, 0.5);
    const b = add(at(-1.15, 0.9, -0.9), mul(hl, swy * 0.3));
    const c = add(at(-1.1, 0.95, -2.2), add(mul(hl, swy * 0.7), mul(hf, -swx * 0.5)));
    sc.cone(linen, 'turban', a, b, 1.5, 1.35, 0.8, { tag: 'tail' });
    sc.cone(linen, 'turban', b, c, 1.35, 1.0, 0.6, { tag: 'tail' });
  }
  // the stone at the turban's front, in a setting of gold; and the one on his lower chain
  {
    const stone = at(0.86, 0, 1.06);
    sc.ell(gold, 'jewel', stone, [mul(hf, 0.6), mul(hl, 1.3), mul(hu, 1.4)], 0.2, { tag: 'setting' });
    sc.mark(add(stone, mul(hf, 0.7)), M_STONE[1], 2, 2, -1, -1, 2.4);
    sc.mark(add(stone, mul(hf, 0.7)), M_STONE[2], 1, 1, -1, -1, 2.4);
    const drop = add(ribs.c, add(mul(rf, ribs.h[0] + 1.3), mul(ru, ribs.h[2] * 0.86 - 7.0)));
    sc.mark(drop, M_STONE[1], 2, 2, -1, 0, 2.4);
    sc.mark(drop, M_STONE[2], 1, 1, -1, 0, 2.4);
  }
  // his eyes: dark, long, lined; a brow over each
  // (two points of light in that shadow: his eyes, as the town has always known them)
  for (const side of [1, -1]) sc.mark(at(0.9, side * 0.4, 0.1), M_EYE, 1, 1, 0, 0, 2.4);

  // ---- slippers under the hem ----
  const shoe = sc.mat({ ramp: M_WINE });
  for (const side of ['L', 'R'] as const) {
    const { heel, toe } = legOf(s, side);
    const fd = norm(sub(toe, heel));
    const fs = norm(cross([0, 0, 1], fd), [0, 1, 0]);
    sc.box(shoe, `leg${side}`, add(lerp3(heel, toe, 0.62), [0, 0, 1.0]), [mul(fd, len(sub(toe, heel)) * 0.42), mul(fs, 1.5), [0, 0, 1.0]], 0.9, 0.8, { tag: 'shoe', cuts: [FLOOR_CUT] });
  }

  // ---- THE CRYSTAL over his open palm: two points and a waist, turning; its light, its motes, its rays when it blazes ----
  const flare = p.flare ?? 0;
  const turnC = (p.spin ?? 0) * Math.PI * 2;
  const cc = crystalAt(s, p);
  const big = 1 + flare * 0.45;
  const crystal = sc.mat({
    ramp: M_CRYSTAL,
    crease: 0,
    paint: (h) => {
      // its six sides, each its own tone, going round as it turns: the one toward the light white
      const { around } = onCone(h.prim as Cone, h.p, [1, 0, 0]);
      const k = (((Math.floor(((around + turnC) / (Math.PI * 2)) * 6) % 6) + 6) % 6);
      const tone = [4, 3, 2, 1, 2, 3][k] + (flare > 0.5 ? 1 : 0) + (h.prim.tag === 'up' ? 0 : -1);
      return sh(M_CRYSTAL, Math.max(1, tone));
    },
  });
  sc.cone(crystal, 'crystal', cc, add(cc, [0, 0, 4.6 * big]), 2.5 * big, 0.15, 0.1, { tag: 'up' });
  sc.cone(crystal, 'crystal', cc, add(cc, [0, 0, -3.4 * big]), 2.5 * big, 0.15, 0.1, { tag: 'down' });
  const aloft: Aloft[] = [{
    stands: cc,
    paint: (st, where) => {
      const [x0, y0] = where(cc);
      // motes going round it (more of them, further out and faster, when it blazes)
      const n = flare > 0.2 ? 7 : 4;
      for (let j = 0; j < n; j++) {
        const a = turnC * (1 + (j % 2)) + (j * Math.PI * 2) / n;
        const far = 7 + flare * 6 + (j % 3);
        const x = Math.round(x0 + Math.cos(a) * far * 1.15);
        const y = Math.round(y0 + Math.sin(a) * far * 0.6 - (j % 2));
        st.over.set(x, y, j % 2 === 0 ? M_CRYSTAL[3] : M_CRYSTAL[2]);
      }
      // rays, as it blazes: four long, four short
      if (flare > 0.35) {
        const k = (flare - 0.35) / 0.65;
        for (let r = 0; r < 8; r++) {
          const a = (r / 8) * Math.PI * 2 + turnC * 0.25;
          const from = 5 + 2 * k;
          const to = from + (r % 2 === 0 ? 11 : 5) * k;
          for (let dd = from; dd <= to; dd++) st.over.set(Math.round(x0 + Math.cos(a) * dd * 1.1), Math.round(y0 + Math.sin(a) * dd * 0.9), dd > to - 2 ? M_CRYSTAL[2] : dd > to - 5 ? M_CRYSTAL[3] : '#ffffff');
        }
      }
    },
    lights: (where) => {
      const [x, y] = where(cc);
      return [{ x, y, r: 15 + flare * 16, color: M_CRYSTAL[2], a: 0.38 + flare * 0.34 }];
    },
  }];

  void hu;
  return { sc, s, B, aloft };
}

/**
 * AT HIS WARES, STANDING: straight-backed behind his table, his head a little bowed to whoever looks them over; his right
 * hand held up and out at his side, the palm open, the crystal turning over it; his left hand out over the table.
 */
export function mysticStance(): Partial<Bones> {
  return {
    pz: -0.3, bend: 2, faceUp: -4, faceTurn: 30, twist: 12,
    lfx: 0.6, lfy: 1.0, lft: 12, rfx: -0.6, rfy: -1.0, rft: -14,
    // (the crystal's hand: out to his right and a little forward, the forearm up, the palm level at the height of his chest)
    rhIn: 0, rhx: 4.6, rhy: -6.4, rhz: -7.4, re: 12,
    // (the other: forward over the wares, the palm down)
    lhIn: 0, lhx: 9.4, lhy: -1.4, lhz: -14.6, le: 22,
  };
}

// ---------------------------------------------------------------------------------------------
// THE WORDSMITH
//
// HIS LOOK IS THE ONE HE SAID YES TO on 8 Oct 2026 (art/smith3.ts: “Yes, this is him (Recommended)”; his brief: “Ancient and
// mighty (Recommended)”, “Runes burning on him (Recommended)”, “A head taller (Recommended)”): the same man, the same body
// (SMITH_BODY), the same stance and work (SMITH_STANCE, SMITH_MOVES), sculpted. Nothing of him is new but how he is made.

/** His skin: an old man's, pale. */
const W_SKIN: Ramp = ['#32243c', '#5e4660', '#967a80', '#c8aca0', '#ecdccc'];
/** His robe: a blue nearly black. */
const W_ROBE: Ramp = ['#0e0c2c', '#1a1642', '#2c2870', '#4844a2', '#625ec0'];
/** His mantle and its cowl, his sash and cuffs: the wordsmiths' teal, a step darker than the town's so the runes on it stand out. */
const W_MANTLE: Ramp = ['#051c28', '#08283a', '#11566a', '#1d8a92', '#3cb2ae'];
/** His beard, his brows: white. */
const W_HAIR: Ramp = ['#4a4864', '#7a7896', '#b2b0ca', '#e0deee', '#ffffff'];
const W_BOOT: Ramp = ['#1a0c20', '#3a1c40', '#5a2e52', '#7e4868', '#a8607a'];

export interface WordsmithPose {
  bones: Partial<Bones>;
  /** How hot the runes on him burn, 0 a slow throb as he stands to 1 a blaze as he works. */
  heat?: number;
  /** Where the slow throb and the wind have got to, 0..1 round. */
  wind?: number;
  /** HIS RING IS DARK (art/quest3.ts): the runes on him cut and cold, his eyes dim, no rune over his hand. */
  dark?: boolean;
  /** What is in the air: 2 the small rune turning over his open hand, 1 the great rune he writes; `pt` how far along it is. */
  prop?: number;
  pt?: number;
  /** How far his skirts, his beard and his mantle hang back from how he moves (his own forward, left). */
  sway?: readonly [number, number];
}

/** THE WORDSMITH, sculpted in a pose; `turn`: truly turned, degrees to his left. */
export function sculptWordsmith(p: WordsmithPose, turn = 0): TownFigure {
  const B = SMITH_BODY;
  const g = rigOf(B, p.bones, turn);
  const { sc, s, f, l, u, ribs, belly, pel, at, onHead, hf, hl, hu, R, dk, pix } = g;
  const [swx, swy] = p.sway ?? [0, 0];
  const dark = p.dark === true;
  const heat = dark ? 0 : Math.max(0, Math.min(1, p.heat ?? 0));
  const wind = p.wind ?? 0;
  const throb = 0.5 + 0.5 * Math.sin(wind * Math.PI * 4);
  /** How hot the rune at `k` along a band burns (a pulse runs down each band, round and round). */
  const hotAt = (k: number): number => (dark ? 0 : Math.min(1, 0.32 + 0.16 * throb + 0.62 * heat + 0.22 * Math.max(0, Math.cos((k - wind) * Math.PI * 4)) * (1 - heat * 0.5)));
  const lag = add(mul(s.hips[0], swx), mul(s.hips[1], swy));

  // ---- SKIN: his face in the cowl's shadow, his bare forearms and his big hands ----
  const skin = sc.mat({
    ramp: W_SKIN,
    paint: (h) => {
      const d = dk(h.prim.piece);
      if (h.prim.piece === 'head') {
        const [fw, lf, up] = onHead(h.p);
        const tg = h.prim.tag ?? '';
        // (in the cowl's shadow: only his nose, his cheekbones and his brow's ridge catch the light of his own runes)
        if (tg === 'nose') return sh(W_SKIN, 4);
        if (tg === 'cheek' && fw > 0.4) return sh(W_SKIN, 3);
        if (fw > 0.3 && up > -0.05 && up < 0.2 && Math.abs(lf) < 0.75) return sh(W_SKIN, 1);
        return sh(W_SKIN, Math.max(2, Math.min(3, h.tone + 1)));
      }
      return d ? sh(W_SKIN, h.tone - 1) : null;
    },
  });
  headIn(g, skin, { jaw: 1.0, brow: 1.2, nose: 1.15, ears: false });

  // ---- THE ROBE: over his deep chest and broad shoulders, its skirts wide and heavy to the floor ----
  const waistC = add(belly.c, mul(belly.r[2], -belly.h[2] * 0.3));
  const robe = sc.mat({
    ramp: W_ROBE,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const d = dk(h.prim.piece);
      if (tg === 'skirt') {
        const { around } = onCone(h.prim as Cone, h.p, s.hips[0]);
        if (Math.floor((around + Math.PI) * 2.3 + 0.5) % 3 === 0) return sh(W_ROBE, h.tone - 1);
        return null;
      }
      if (tg === 'bell') {
        // (the cuff of each wide sleeve turned back: the mantle's teal; its mouth dark)
        const along = onCone(h.prim as Cone, h.p, u).t;
        if (along >= 0.995) return sh(W_ROBE, 0);
        if (along > 0.8) return sh(W_MANTLE, h.tone + 1 - d);
      }
      return d ? sh(W_ROBE, h.tone - 1) : null;
    },
  });
  trunkIn(g, robe, 1.3, { yoke: 1.1, tag: 'robe' });
  const skirtTop = add(pel.c, mul(s.hips[2], 2.0));
  const mid = lerp3(s.ankleL, s.ankleR, 0.5);
  const skirtFoot: V3 = [mid[0] + lag[0], mid[1] + lag[1], 0.4];
  const skirtR0 = B.pelvisHalf + 1.0;
  const skirtR1 = B.stance + 10.5;
  sc.cone(robe, 'skirt', skirtTop, skirtFoot, skirtR0, skirtR1, 1.8, { tag: 'skirt', cuts: [{ n: [0, 0, -1], o: -0.5 }, keepBelow([0, 0, 1], add(waistC, [0, 0, -1.4]))] });
  for (const side of ['L', 'R'] as const) {
    const { sh: shd, el, ha } = armOf(s, side);
    const piece = `arm${side}`;
    const out = mul(l, side === 'L' ? 1 : -1);
    const [, uo] = frameOf(shd, el, out, f);
    sc.ell(robe, piece, add(shd, add(mul(u, -0.3), mul(uo, 0.6))), [mul(f, 3.9), mul(uo, 3.5), mul(u, 3.5)], 1.6, { tag: 'sleeve' });
    sc.cone(robe, piece, shd, el, 3.5, 3.4, 1.4, { tag: 'sleeve' });
    const cuff = lerp3(el, ha, 0.36);
    sc.cone(robe, piece, el, cuff, 3.5, 4.5, 1.0, { tag: 'bell' });
    // his bare forearm, corded, and his hand
    const wrist = lerp3(el, ha, 0.86);
    sc.cone(skin, piece, lerp3(el, ha, 0.2), wrist, 2.6, 2.0, 1.0, { tag: 'fore' });
  }
  // (his right hand open before him, the palm up, where the small rune turns; his left open at his side, the palm down)
  openHand(g, skin, 'R', [0, 0, 1], 1.36);
  openHand(g, skin, 'L', [0, 0, -1], 1.36);

  // ---- boots under the hem ----
  const boot = sc.mat({ ramp: W_BOOT });
  for (const side of ['L', 'R'] as const) {
    const { heel, toe } = legOf(s, side);
    const fd = norm(sub(toe, heel));
    const fs = norm(cross([0, 0, 1], fd), [0, 1, 0]);
    sc.box(boot, `leg${side}`, add(lerp3(heel, toe, 0.6), [0, 0, 1.3]), [mul(fd, len(sub(toe, heel)) * 0.46), mul(fs, 2.0), [0, 0, 1.3]], 1.0, 0.8, { tag: 'boot', cuts: [FLOOR_CUT] });
  }

  // ---- THE SASH, and THE MANTLE over his shoulders with its cowl up over his head ----
  const mantleEdge = add(s.neck, mul(u, -9.5));
  const mantle = sc.mat({
    ramp: W_MANTLE,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const d = dk(h.prim.piece);
      if (tg === 'cape') {
        // its ragged hem: a tooth cut out of it every few pixels; long folds from the shoulders
        const below = dot(sub(h.p, mantleEdge), u);
        // (its edge: a point of light every few pixels, and the hem a tone lighter between them)
        if (below < 1.5) return h.x % 3 === 0 ? burning(hotAt(h.x * 0.05) * 0.85) : sh(W_MANTLE, h.tone + 1);
        if ((h.x * 3 + h.y) % 8 === 0) return sh(W_MANTLE, h.tone - 1);
      }
      if (tg === 'cowl') {
        // (inside its opening: the dark)
        const [fw, , up] = onHead(h.p);
        if (fw > 0.62 && up < 0.6) return W_MANTLE[0];
      }
      if (tg === 'sash') return (h.x + h.y) % 4 === 0 ? sh(W_MANTLE, h.tone - 1) : null;
      return d ? sh(W_MANTLE, h.tone - 1) : null;
    },
  });
  sc.ell(mantle, 'sash', waistC, [mul(belly.r[0], belly.h[0] + 3.4), mul(belly.r[1], belly.h[1] + 3.0), mul(belly.r[2], 2.0)], 0.4, { tag: 'sash' });
  {
    // the mantle: over the yoke of his shoulders, down to his chest in front and his shoulder blades behind
    const hemCut = keepBelow(mul(u, -1), add(mantleEdge, add(mul(f, swx * 0.3), mul(l, swy * 0.3))));
    const [aS] = B.armR;
    // (a dome that flares from his neck to its hem, widest there: the upper half of a great round, flat front to back)
    sc.ell(mantle, 'mantle', add(mantleEdge, mul(f, -0.3)), [mul(f, ribs.h[0] + 3.6), mul(l, B.shoulderHalf + aS + 4.0), mul(u, 13.2)], 1.6, { tag: 'cape', cuts: [hemCut] });
    for (const side of [1, -1]) {
      const shd = side > 0 ? s.shoulderL : s.shoulderR;
      sc.ell(mantle, 'mantle', add(shd, mul(u, 0.2)), [mul(f, 4.6), mul(l, 4.5), mul(u, 4.0)], 2.4, { tag: 'cape', cuts: [hemCut] });
    }
    // the cowl: a deep hood over his head, its opening a hollow round his face, its peak drawn back; a fold of it on his back
    sc.ell(mantle, 'head', at(-0.16, 0, 0.14), [mul(hf, R[0] * 1.3), mul(hl, R[1] * 1.34), mul(hu, R[2] * 1.24)], 1.0, { tag: 'cowl' });
    sc.cone(mantle, 'head', at(-0.5, 0, 0.9), at(-1.5, 0, 1.3), R[1] * 0.7, 0.5, 1.4, { tag: 'cowl' });
    sc.cone(mantle, 'head', at(-0.4, 0, -0.5), add(s.neck, add(mul(f, -2.4), mul(u, -1.6))), 4.2, 4.8, 1.8, { tag: 'cowl' });
    sc.ell(mantle, 'head', at(1.1, 0, -0.16), [mul(hf, R[0] * 0.8), mul(hl, R[1] * 0.96), mul(hu, R[2] * 0.96)], 0.5, { carve: true });
  }

  // ---- HIS BEARD: long and white, from his jaw down over his chest to his belt; a moustache over it; heavy white brows ----
  const hair = sc.mat({
    ramp: W_HAIR,
    meld: true,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const lit = Math.max(2, h.tone + 1);
      if (tg === 'beard' || tg === 'tash') return (h.x + Math.floor(h.y / 3)) % 3 === 0 ? sh(W_HAIR, lit - 1) : sh(W_HAIR, lit);
      return sh(W_HAIR, Math.min(4, lit));
    },
  });
  {
    const swing = add(mul(lag, 0.5), mul(hl, Math.sin(wind * Math.PI * 2 + 1.3) * 0.5));
    sc.ell(hair, 'beard', at(0.5, 0, -0.74), [mul(hf, R[0] * 0.56), mul(hl, R[1] * 0.92), mul(hu, R[2] * 0.46)], 0.9, { tag: 'beard' });
    const chestF = add(ribs.c, mul(ribs.r[0], ribs.h[0] + 2.6));
    const a = at(0.62, 0, -1.2);
    const b = add(lerp3(a, add(chestF, mul(ribs.r[2], ribs.h[2] * 0.1)), 0.9), mul(swing, 0.3));
    const c = add(add(chestF, mul(ribs.r[2], -ribs.h[2] * 1.0)), mul(swing, 0.7));
    const e = add(add(waistC, add(mul(belly.r[0], belly.h[0] + 3.6), mul(belly.r[2], 1.0))), swing);
    sc.cone(hair, 'beard', a, b, R[1] * 0.92, R[1] * 1.0, 1.0, { tag: 'beard' });
    sc.cone(hair, 'beard', b, c, R[1] * 1.0, R[1] * 0.72, 0.9, { tag: 'beard' });
    sc.cone(hair, 'beard', c, e, R[1] * 0.72, 0.5, 0.8, { tag: 'beard' });
    sc.ell(hair, 'beard', at(1.0, 0, -0.34), [mul(hf, 0.9), mul(hl, R[1] * 0.56), mul(hu, 0.9)], 0.4, { tag: 'tash' });
    for (const side of [1, -1]) sc.cone(hair, 'beard', at(0.94, side * 0.1, 0.3), at(0.8, side * 0.72, 0.2), 0.8, 0.6, 0.3, { tag: 'brow' });
  }

  // ---- HIS EYES, burning; and THE RUNES ON HIM, each laid by the picture's own grid where it is seen ----
  for (const side of [1, -1]) {
    sc.mark(at(0.9, side * 0.38, 0.06), dark ? W_MANTLE[2] : heat > 0.5 ? '#ffffff' : CYAN_HOT, 1, 1, 0, 0, 3.2);
    sc.mark(at(0.9, side * 0.38, 0.06), dark ? W_MANTLE[1] : CYAN_MID, 1, 1, 0, 1, 3.2);
  }
  /** One of his big runes (art/smith3.ts RUNES7, five by seven), its middle at a point of him, cut into the stuff `on`. */
  const runeAt = (k: number, c: V3, color: string, on: number, through = 3): void => {
    const rows = RUNES7[((k % RUNES7.length) + RUNES7.length) % RUNES7.length];
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[0].length; i++) if (rows[j][i] === '#') sc.mark(c, color, 1, 1, i - 2, j - 3, through, on);
  };
  {
    // DOWN THE FRONT OF HIS SKIRTS, from his sash to the hem, between two lines of the mantle's teal
    const n = 4;
    const fwd = norm([s.hips[0][0], s.hips[0][1], 0]);
    for (let i = 0; i < n; i++) {
      const k = (i + 0.7) / (n + 0.2);
      const c = lerp3(skirtTop, skirtFoot, k);
      const r = skirtR0 + (skirtR1 - skirtR0) * k;
      const onFront = add(c, mul(fwd, r));
      runeAt(i + 3, onFront, burning(hotAt(k)), robe);
      sc.mark(onFront, W_MANTLE[2], 1, 12, -5, -6, 3, robe);
      sc.mark(onFront, W_MANTLE[2], 1, 12, 5, -6, 3, robe);
    }
    // ROUND THE HEM, on the side toward the eye
    const m = 10;
    for (let i = 0; i < m; i++) {
      const a = (i / m) * Math.PI * 2 + 0.31;
      if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.35) continue;
      const out = add(mul(fwd, Math.cos(a)), mul(norm(cross([0, 0, 1], fwd)), Math.sin(a)));
      const c = add(lerp3(skirtTop, skirtFoot, 0.9), mul(out, skirtR0 + (skirtR1 - skirtR0) * 0.9));
      runeAt(i, c, burning(hotAt(i / m) * 0.9), robe, 2.5);
    }
    // ROUND THE COWL'S OPENING: points of light, every other one
    for (let i = 0; i < 14; i += 2) {
      const a = -Math.PI * 0.95 + (i / 13) * Math.PI * 1.9;
      sc.mark(at(0.78, Math.sin(a) * 1.02, 0.12 + Math.cos(a) * 0.86), burning(hotAt(i / 14) * 0.8), 1, 1, 0, 0, 2.6, mantle);
    }
    // IN THE SKIN OF HIS FOREARMS AND ON THE BACKS OF HIS HANDS
    for (const side of ['L', 'R'] as const) {
      const { el, ha } = armOf(s, side);
      const [x0, y0] = pix(lerp3(el, ha, 0.46));
      const [x1, y1] = pix(lerp3(el, ha, 0.86));
      const nn = Math.max(1, Math.floor(Math.hypot(x1 - x0, y1 - y0) / 3));
      for (let i = 0; i <= nn; i++) {
        const q2 = lerp3(lerp3(el, ha, 0.46), lerp3(el, ha, 0.86), i / nn);
        const c = burning(hotAt(0.3 + i * 0.07) + 0.08);
        sc.mark(q2, c, 1, 1, 0, 0, 3.4, skin);
        sc.mark(q2, c, 1, 1, i % 2 === 0 ? 0 : 1, i % 2 === 0 ? -1 : 0, 3.4, skin);
      }
      sc.mark(add(ha, mul(norm(sub(ha, el)), 1.6)), burning(hotAt(0.5) + 0.15), 1, 1, 0, 0, 3.4, skin);
    }
  }

  // ---- WHAT IS IN THE AIR: the small rune turning over his open hand, or the great rune he writes ----
  const aloft: Aloft[] = [];
  const prop = p.prop ?? 2;
  const pt = p.pt ?? 0;
  if (prop === 2 && !dark) {
    const over = add(s.handR, [0, 0, 8.5 + Math.sin(pt * Math.PI * 4) * 1.2]);
    aloft.push({
      stands: over,
      paint: (st, where) => {
        const [x, y] = where(over);
        const rows = SMALL_GLYPHS[Math.floor(pt * 4) % 4];
        const c = burning(0.7 + 0.2 * throb);
        for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (rows[j][i] === '#') st.over.set(Math.round(x - 1.5) + i, Math.round(y - 2.5) + j, c);
      },
      lights: (where) => {
        const [x, y] = where(over);
        return [{ x, y, r: 12, color: CYAN_MID, a: 0.3 }];
      },
    });
  } else if (prop === 1) {
    aloft.push(greatRuneAloft(s, pt));
  }
  aloft.push({
    lights: (where) => {
      if (dark) return [];
      const out: Light[] = [];
      const [x, y] = where(lerp3(skirtTop, skirtFoot, 0.4));
      out.push({ x, y, r: 16 + heat * 10, color: CYAN_MID, a: 0.14 + heat * 0.18 });
      for (const ha of [s.handL, s.handR]) {
        const [hx, hy] = where(ha);
        out.push({ x: hx, y: hy, r: 8 + heat * 5, color: CYAN_MID, a: 0.18 + heat * 0.14 });
      }
      const [ex, ey] = where(at(0.9, 0, 0.06));
      out.push({ x: ex, y: ey, r: 6 + heat * 3, color: CYAN_MID, a: 0.25 + heat * 0.2 });
      return out;
    },
  });

  void hu;
  return { sc, s, B, aloft };
}

const CYAN_MID = '#22d0e0';
const CYAN_HOT = '#b8fff8';
/** The small runes that turn over his hand (art/smith3.ts GLYPHS: his own, none a letter of any alphabet). */
const SMALL_GLYPHS: ReadonlyArray<ReadonlyArray<string>> = [
  ['#.#', '.#.', '.#.', '#.#', '#..'],
  ['##.', '#..', '###', '..#', '.##'],
  ['.#.', '#.#', '.#.', '.#.', '#.#'],
  ['#..', '#.#', '###', '#.#', '..#'],
];

/**
 * THE GREAT RUNE (art/smith3.ts greatRune, as he saw it on 8 Oct): written stroke by stroke before his chest (`pt` 0 to 0.6),
 * blazing (to 0.75), gathered up over his head with his hands, and driven down and out before him, smaller as it goes, into
 * the slab (to 1).
 */
function greatRuneAloft(s: Skeleton, pt: number): Aloft {
  const fwd: V3 = norm([s.hips[0][0], s.hips[0][1], 0]);
  const before = add(add(s.neck, mul(fwd, 15)), [0, 0, -7]);
  const above = add(add(s.neck, mul(fwd, 9)), [0, 0, 14]);
  const slab = add(mul(fwd, 34), [0, 0, 22]);
  let c: V3;
  let size = 7;
  if (pt <= 0.75) c = before;
  else if (pt <= 0.8) c = lerp3(before, above, (pt - 0.75) / 0.05);
  else if (pt <= 0.95) {
    const k = (pt - 0.8) / 0.15;
    c = lerp3(above, slab, k * k);
    size = 7 - 3 * k;
  } else c = slab;
  return {
    stands: c,
    paint: (st, where) => {
      if (pt >= 0.99) return;
      const [cx, cy] = where(c);
      const done = Math.min(1, pt / 0.6) * GREAT_RUNE.length;
      const hot = pt > 0.6 ? 1 : 0.75;
      for (let i = 0; i < GREAT_RUNE.length; i++) {
        const part = Math.max(0, Math.min(1, done - i));
        if (part <= 0) break;
        const [ax, ay, bx, by] = GREAT_RUNE[i];
        const x0 = cx + ax * size;
        const y0 = cy - ay * size;
        const x1 = cx + (ax + (bx - ax) * part) * size;
        const y1 = cy - (ay + (by - ay) * part) * size;
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.5));
        for (let j = 0; j <= n; j++) {
          const x = Math.round(x0 + ((x1 - x0) * j) / n - 0.5);
          const y = Math.round(y0 + ((y1 - y0) * j) / n - 0.5);
          st.over.set(x, y, hot >= 1 ? '#ffffff' : CYAN_HOT);
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) if (!st.over.has(x + dx, y + dy)) st.over.set(x + dx, y + dy, CYAN_MID);
        }
        if (part < 1) {
          st.over.set(Math.round(x1 - 0.5), Math.round(y1 - 0.5), '#ffffff');
          for (const [dx, dy] of [[2, 0], [-2, 0], [0, 2], [0, -2]] as const) st.over.set(Math.round(x1 - 0.5) + dx, Math.round(y1 - 0.5) + dy, CYAN_HOT);
        }
      }
      if (pt > 0.6) {
        const k = Math.min(1, (pt - 0.6) / 0.15);
        for (let r = 0; r < 8; r++) {
          const a = (r / 8) * Math.PI * 2 + 0.3;
          for (let j = Math.round(size + 2); j < size + 2 + 4 * k; j++) st.over.set(Math.round(cx + Math.cos(a) * j - 0.5), Math.round(cy + Math.sin(a) * j * 0.8 - 0.5), j % 2 === 0 ? '#ffffff' : CYAN_HOT);
        }
      }
    },
    lights: (where) => {
      if (pt >= 0.99) return [];
      const [cx, cy] = where(c);
      return [{ x: cx, y: cy, r: 22 + (pt > 0.6 ? 14 : 0), color: CYAN_MID, a: 0.35 + (pt > 0.6 ? 0.2 : 0) }];
    },
  };
}

/** AT HIS WORK, STANDING: as he has stood since 8 Oct (art/smith3.ts SMITH_STANCE). */
export function wordsmithStance(): Partial<Bones> {
  return { ...SMITH_STANCE };
}

// ---------------------------------------------------------------------------------------------
// THE STRANGER

/** His cloak and hood: a dark aubergine, nearly black (he keeps to the dark). */
const S_CLOAK: Ramp = ['#0c0810', '#1a1220', '#30223a', '#4a3854', '#665270'];
/** His jerkin, bracers, belt and boots: dark hide. */
const S_HIDE: Ramp = ['#120a0c', '#261614', '#42281e', '#603e2c', '#7e583e'];
/** His sleeves, his breeches and the scarf over his mouth: a grey-blue wool. */
const S_WOOL: Ramp = ['#10101c', '#202234', '#363a54', '#525876', '#747a98'];
/** What is seen of his skin: his hands. */
const S_SKIN: Ramp = ['#2a1a26', '#523036', '#845848', '#b08464', '#d8b08c'];
/** Gold: his eyes in the hood, the clasp at his throat, the coin. */
const S_GOLD: Ramp = ['#4a2e0c', '#7a5210', '#d09a20', '#ffd866', '#fff3b0'];

export const STRANGER_TALL = 58;
/** HIS BODY: lean and long-legged. */
export const STRANGER_BUILD: Build = buildOf(STRANGER_TALL, 1.44, { shoulders: 1.08, chest: 1.0, depth: 1.0, waist: 0.94, hips: 0.96, legs: 1.05, arms: 1.0, limbs: 1.02, pad: 1.2 });

/** How far behind the middle of his tile the wall he leans on stands (game/level.ts TOWN.stranger: half a tile), in his lengths. */
export const WALL = 19.2;

export interface StrangerPose {
  bones: Partial<Bones>;
  /** Where his eyes look: -1 to his right, 0 ahead, 1 to his left. */
  look?: number;
  /** THE COIN: null when it is in his fist; else where it is (a point of his own space), and how far round it has turned (0..1). */
  coin?: { at: V3; turn: number } | null;
  /** How far the hem of his cloak has stirred (his own left). */
  sway?: number;
}

/** THE STRANGER, sculpted in a pose; `turn`: truly turned (he never leaves his wall: 0, as the game shows him). */
export function sculptStranger(p: StrangerPose, turn = 0): TownFigure {
  const B = STRANGER_BUILD;
  const g = rigOf(B, p.bones, turn);
  const { sc, s, f, l, u, ribs, belly, pel, at, onHead, hf, hl, hu, R, dk } = g;
  const [rf, rl, ru] = ribs.r;
  const wall: Cut = { n: [-1, 0, 0], o: WALL };

  // ---- HIS HANDS (all of his skin that is seen) ----
  const skin = sc.mat({ ramp: S_SKIN, paint: (h) => (dk(h.prim.piece) ? sh(S_SKIN, h.tone - 1) : null) });

  // ---- WOOL: the sleeves of his arms, folded on his chest; his breeches ----
  const wool = sc.mat({
    ramp: S_WOOL,
    paint: (h) => {
      const d = dk(h.prim.piece);
      if (h.prim.tag === 'sleeve' && (h.x + h.y * 2) % 6 === 0) return sh(S_WOOL, h.tone - 1 - d);
      // (his breeches a tone darker than his sleeves, so that his legs are not one mass with his arms)
      if (h.prim.tag === 'thigh' || h.prim.tag === 'shin') return sh(S_WOOL, Math.max(1, h.tone - 1));
      return d ? sh(S_WOOL, h.tone - 1) : null;
    },
  });
  // ---- HIDE: a jerkin over his trunk, bracers on his forearms, a belt, tall boots ----
  const hide = sc.mat({
    ramp: S_HIDE,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      const d = dk(h.prim.piece);
      if (tg === 'sole') return sh(S_HIDE, h.tone - 2);
      if (tg === 'cuff') return sh(S_HIDE, h.tone + 1);
      // (the bracers: laced, a lighter stitch every other pixel along them)
      if (tg === 'bracer') {
        const { t: along } = onCone(h.prim as Cone, h.p, u);
        if (along < 0.12 || along > 0.88) return sh(S_HIDE, h.tone + 1 - d);
        if (Math.floor(along * 8) % 2 === 0 && (h.x + h.y) % 2 === 0) return sh(S_HIDE, h.tone + 1 - d);
      }
      // (the jerkin: stitched down its front)
      if (tg === 'jerkin') {
        const v = sub(h.p, ribs.c);
        if (dot(v, rf) > 0 && Math.abs(dot(v, rl)) < 0.5) return sh(S_HIDE, h.tone - 1);
      }
      if (tg === 'belt') return sh(S_HIDE, h.tone + 1);
      return d ? sh(S_HIDE, h.tone - 1) : null;
    },
  });
  trunkIn(g, hide, 0.8, { tag: 'jerkin', cuts: [wall] });
  // (its skirt, to the top of his thighs, slit at each side)
  sc.ell(hide, 'torso', add(pel.c, mul(pel.r[2], -1.6)), [mul(pel.r[0], pel.h[0] + 1.7), mul(pel.r[1], pel.h[1] + 1.6), mul(pel.r[2], pel.h[2] + 2.6)], 1.2, { tag: 'jerkin', cuts: [wall] });
  sc.ell(hide, 'belt', add(belly.c, mul(belly.r[2], -belly.h[2] * 0.5)), [mul(belly.r[0], belly.h[0] + 1.9), mul(belly.r[1], belly.h[1] + 1.7), mul(belly.r[2], 1.0)], 0.3, { tag: 'belt', cuts: [wall] });
  for (const side of ['L', 'R'] as const) {
    const { sh: shd, el, ha } = armOf(s, side);
    const piece = `arm${side}`;
    const out = mul(l, side === 'L' ? 1 : -1);
    const [, uo] = frameOf(shd, el, out, f);
    sc.ell(wool, piece, add(shd, add(mul(u, -0.3), mul(uo, 0.5))), [mul(f, 2.9), mul(uo, 2.7), mul(u, 2.7)], 1.6, { tag: 'sleeve', cuts: [wall] });
    sc.cone(wool, piece, shd, el, 2.6, 2.3, 1.4, { tag: 'sleeve', cuts: [wall] });
    sc.cone(wool, piece, el, lerp3(el, ha, 0.4), 2.3, 2.1, 1.2, { tag: 'sleeve' });
    sc.cone(hide, piece, lerp3(el, ha, 0.34), lerp3(el, ha, 0.88), 2.35, 1.95, 0.5, { tag: 'bracer' });
    fistOf(g, skin, side, 0.98);
  }
  for (const side of ['L', 'R'] as const) {
    const { hip, knee, ankle } = legOf(s, side);
    const [lH, lK, lA] = B.legR;
    const piece = `leg${side}`;
    sc.cone(wool, piece, add(hip, mul(s.hips[2], 0.8)), knee, lH * 1.05 + 0.4, lK * 1.04 + 0.4, 1.5, { tag: 'thigh', cuts: [wall] });
    sc.cone(wool, piece, knee, lerp3(knee, ankle, 0.6), lK * 1.02 + 0.4, lA + 0.9, 1.2, { tag: 'shin', cuts: [wall] });
  }
  bootsOnWall(g, hide, 0.62);

  // ---- THE CLOAK: from his shoulders down his back and round his sides to his shins, open in front; flat against the wall
  // behind him; its hem ragged. And THE HOOD, down over his face: its opening a dark hollow ----
  const hemZ = 9.5;
  const cloak = sc.mat({
    ramp: S_CLOAK,
    crease: 0.24,
    paint: (h) => {
      const tg = h.prim.tag ?? '';
      if (tg === 'cloak') {
        // its ragged hem, and long folds down it
        if (h.p[2] < hemZ + 2.2 && (h.x * 7) % 5 < 2) return sh(S_CLOAK, h.tone - 1);
        if ((h.x + Math.floor(h.y / 5)) % 4 === 0) return sh(S_CLOAK, h.tone - 1);
      }
      if (tg === 'hood') {
        const [fw, , up] = onHead(h.p);
        // (inside its opening: the dark)
        if (fw > 0.6 && up < 0.5) return S_CLOAK[0];
      }
      return null;
    },
  });
  {
    const sway = p.sway ?? 0;
    const top = add(s.neck, add(mul(u, -1.6), mul(f, -1.0)));
    const foot: V3 = [s.pelvis[0] - 1.0 + s.hips[1][0] * sway, s.pelvis[1] + s.hips[1][1] * sway, hemZ];
    // (open in front: only what lies behind the front of his chest; and nothing of it in the wall)
    const open = keepBelow([1, 0, 0], add(s.pelvis, [-1.5, 0, 0]));
    const hem: Cut = { n: [0, 0, -1], o: -hemZ };
    sc.cone(cloak, 'cloak', top, foot, B.shoulderHalf + 2.2, B.pelvisHalf + 5.0, 1.6, { tag: 'cloak', cuts: [open, wall, hem] });
    // its two front edges, hanging from his collar bones down past his hips
    for (const side of [1, -1]) {
      const a = add(s.neck, add(mul(l, side * (B.shoulderHalf * 0.72)), add(mul(u, -1.4), mul(f, 1.6))));
      const b: V3 = [s.pelvis[0] - 3.0 + s.hips[1][0] * (side * (B.pelvisHalf + 3.6) + sway), s.pelvis[1] + s.hips[1][1] * (side * (B.pelvisHalf + 3.6) + sway), s.pelvis[2] - 2.0];
      sc.cone(cloak, 'cloak', a, b, 2.0, 2.4, 1.2, { tag: 'cloak', cuts: [wall, hem] });
    }
    // the hood
    sc.ell(cloak, 'head', at(-0.14, 0, 0.12), [mul(hf, R[0] * 1.34), mul(hl, R[1] * 1.3), mul(hu, R[2] * 1.22)], 1.0, { tag: 'hood', cuts: [wall] });
    sc.cone(cloak, 'head', at(-0.5, 0, 0.8), at(-1.25, 0, 0.5), R[1] * 0.74, 1.0, 1.2, { tag: 'hood', cuts: [wall] });
    sc.cone(cloak, 'head', at(-0.4, 0, -0.5), add(s.neck, add(mul(f, -1.6), mul(u, -1.4))), 3.6, 4.4, 1.6, { tag: 'hood', cuts: [wall] });
    sc.ell(cloak, 'head', at(1.16, 0, -0.16), [mul(hf, R[0] * 0.74), mul(hl, R[1] * 0.82), mul(hu, R[2] * 0.86)], 0.5, { carve: true });
  }
  // the scarf over his mouth, in the hood's hollow
  {
    const below = keepBelow(hu, at(0, 0, -0.26));
    sc.ell(wool, 'head', at(0.2, 0, -0.44), [mul(hf, R[0] * 0.78), mul(hl, R[1] * 0.8), mul(hu, R[2] * 0.56)], 0.5, { tag: 'scarf', cuts: [below] });
  }
  // HIS EYES: two points of gold in the dark; they go from side to side, or stay on whoever has come up to him
  const gold = sc.mat({ ramp: S_GOLD });
  {
    const look = Math.round(p.look ?? 0);
    for (const side of [1, -1]) sc.mark(at(0.74, side * 0.36, 0.08), S_GOLD[3], 1, 1, look, 0, 5.5);
    // the clasp at his throat
    sc.ell(gold, 'clasp', add(s.neck, add(mul(f, ribs.h[0] * 0.78 + 1.4), mul(u, -2.6))), [mul(f, 0.6), mul(l, 1.2), mul(u, 1.2)], 0.2, { tag: 'clasp' });
  }
  // THE COIN, when it is in the air
  if (p.coin) {
    const c = p.coin.at;
    const a = p.coin.turn * Math.PI * 2;
    // (it turns end over end about a line across him: seen full, edge-on, full)
    const face: V3 = [Math.cos(a), 0, Math.sin(a)];
    const edge: V3 = [-Math.sin(a), 0, Math.cos(a)];
    sc.ell(gold, 'coin', c, [mul(face, 0.5), [0, 2.5, 0], mul(edge, 2.5)], 0.1, { tag: 'coin' });
  }
  const aloft: Aloft[] = [];
  if (p.coin) {
    const c = p.coin.at;
    aloft.push({
      stands: c,
      // (a glint off it each time its face comes round to the light)
      paint: (st, where) => {
        if (Math.abs(Math.sin(p.coin!.turn * Math.PI * 2)) > 0.5) return;
        const [x, y] = where(c);
        for (const [dx, dy] of [[0, 0], [3, 0], [-3, 0], [0, 3], [0, -3], [4, 0], [-4, 0]] as const) st.over.set(Math.round(x) + dx, Math.round(y) + dy, dx === 0 && dy === 0 ? '#ffffff' : S_GOLD[4]);
      },
      lights: (where) => {
        const [x, y] = where(c);
        return [{ x, y, r: 8, color: S_GOLD[3], a: 0.4 }];
      },
    });
  }

  void hu;
  void pel;
  void ru;
  return { sc, s, B, aloft };
}

/**
 * HIS BOOTS: tall, to under the knee. A foot that is flat on the wall behind him (its toes down) is set against the wall;
 * one on the floor is set on the floor.
 */
function bootsOnWall(g: Rig, mat: number, high: number): void {
  const { sc, s, B } = g;
  for (const side of ['L', 'R'] as const) {
    const { knee, ankle, heel, toe } = legOf(s, side);
    const [, lK, lA] = B.legR;
    const piece = `leg${side}`;
    const fd = norm(sub(toe, heel));
    const upright = Math.abs(fd[2]) > 0.7;
    const fs = upright ? norm(cross(fd, [1, 0, 0]), [0, 1, 0]) : norm(cross([0, 0, 1], fd), [0, 1, 0]);
    let up = norm(cross(fd, fs));
    // (the top of the foot is away from what it stands on: the floor, or the wall)
    if (upright ? up[0] < 0 : up[2] < 0) up = mul(up, -1);
    const half = len(sub(toe, heel)) * 0.5;
    let c = add(lerp3(heel, toe, 0.5), mul(up, 1.0));
    if (!upright) {
      const low = c[2] - Math.abs(fd[2]) * (half + 0.7) - Math.abs(fs[2]) * 1.7 - Math.abs(up[2]) * 1.25;
      if (low < 0) c = add(c, [0, 0, -low]);
    }
    const cuts: Cut[] = upright ? [{ n: [-1, 0, 0], o: WALL }] : [FLOOR_CUT];
    sc.box(mat, piece, c, [mul(fd, half + 0.7), mul(fs, 1.7), mul(up, 1.25)], 1.0, 1.1, { tag: 'foot', cuts });
    sc.box(mat, piece, add(c, mul(up, -0.95)), [mul(fd, half + 0.9), mul(fs, 1.85), mul(up, 0.35)], 0.3, 0.3, { tag: 'sole', cuts });
    sc.cone(mat, piece, lerp3(ankle, knee, high), ankle, lA + (lK - lA) * high + 0.8, lA + 0.85, 1.0, { tag: 'boot' });
    sc.cone(mat, piece, lerp3(ankle, knee, high), lerp3(ankle, knee, high - 0.07), lA + (lK - lA) * high + 1.2, lA + (lK - lA) * high + 1.2, 0.3, { tag: 'cuff' });
  }
}

/**
 * AGAINST HIS WALL: his back and the seat of him on it, his left leg planted well out before him, his right bent, its boot
 * flat on the wall behind; his arms folded on his chest; his head down in the hood.
 */
export function strangerStance(): Partial<Bones> {
  const B = STRANGER_BUILD;
  const base: Partial<Bones> = {
    px: -WALL + B.pelvisDeep + 3.6, pz: -2.0, pitch: -12, bend: 10, hunch: 8, faceUp: -14, faceTurn: -10,
    // (the planted leg: its foot well out before him, turned out a little)
    lfx: -WALL + B.pelvisDeep + 15.5, lfy: 0.6, lft: 10, lk: 8,
    // (the bent one: its ankle up by the wall, the sole flat on it, the knee out before him)
    rfx: -WALL + B.ankle + 1.6, rfy: -2.6, rfz: 10.5, rfp: 90, rft: 0, rk: -62, rkUp: 4,
    le: 34, re: 30,
  };
  // (the arms folded: each hand tucked in by the other arm's elbow, the left over the right: it is the left that tosses)
  const a = handTo(B, base, 'L', (s) => add(s.ribs, add(mul(s.chest[0], B.ribDeep + 3.6), add(mul(s.chest[1], -4.8), mul(s.chest[2], B.chest * 0.34)))));
  return handTo(B, a, 'R', (s) => add(s.ribs, add(mul(s.chest[0], B.ribDeep + 2.2), add(mul(s.chest[1], 4.6), mul(s.chest[2], B.chest * 0.2)))));
}

void CANVAS3;
void sh;
export type { Hit, Cone };
