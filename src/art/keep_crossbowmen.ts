// FLOOR 19'S CROSSBOWMEN ON THE WALLS (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the game
// imports this file; `CROSSBOW_ON` is off. Their moves are art/keep_crossbowmen_moves.ts; their aim line and their bolt,
// art/keep_crossbowmen_fx.ts.
//
// His doc's floor 19, THE KEEP: “the old castle at the hill's crown, where the king lies dying”, its palette cold stone,
// royal blue, old gold; its book Andersen's "The Nightingale" (1843), drawn only from the book. Its plan, his yes:
// “Enemies: the king's knights, still loyal and silent in their armour, crossbowmen on the walls, and the Silent Order's
// last.” His brief for the crossbowmen (offered as a pop-up: "THE CROSSBOWMEN on the walls (small, one attack). How
// should they move?"), HIS PICK, not the one recommended: “Stand and shoot” (offered as: "Same brief, but they plant and
// hold their spot."). The brief as offered: the keep's crossbowmen in padded jacks and kettle helms, royal blue tabards, a
// heavy crossbow and a tall painted shield (a pavise) planted in front; Hushed, grey breath; knight's size, in groups along
// the walls; they plant and hold their spot; their mark, the planted tall shield and the crossbow; one attack, a long aimed
// shot: a red aim line, held, then the bolt in a flash, far and straight; their death, the crossbow drops, the Hush leaves
// them, they slump behind the shield (made new on his pick of 30 Oct: thrown back over, the last bolt up into the air, the
// pavise falling flat, the Hush leaving them, alive: art/keep_crossbowmen_moves.ts); never elves or rangers, never undead;
// their sound, the crank, the thunk, the bolt's hiss.
//
// WHO THEY ARE: the old king's own crossbowmen, their words stolen like the city's: grown men, the knight's height, stocky
// soldiers, nothing of a ranger about them (no hood, no cloak, no longbow, no lightness). A PADDED JACK of undyed linen,
// quilted in long channels, its sleeves quilted fat; over it A TABARD of the royal blue, front and back, edged old gold, the
// royal swan on its breast; dark hose, short boots, a belt with a BOLT CASE at the right hip; leather gloves; A KETTLE HELM
// of cold steel, its round crown combed, its brim broad and turned down all round, a strap under the chin. Their faces
// drained grey under the brim, the dull pink in their eyes, the Hush leaking from their mouths. THE HEAVY CROSSBOW: a
// walnut stock, a steel prod, a hemp string, a long trigger lever, an iron stirrup at its nose and a CRANEQUIN at its butt,
// a geared drum whose crank spans it. THE PAVISE: tall as his chest, of planks under painted canvas, royal blue with a
// border of old gold and THE ROYAL SWAN in old gold on it (his pick for the royal mark, “Keep the royal swan”), a raised spine down its
// middle, iron feet; its back bare planks, a carrying strap, a prop. Nothing cyan.

import { BREATH_PALE, SKIN, hushLeaves, lagOf } from './hushed';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { tippedFrom, wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, heading, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const CROSSBOW_ON = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const D = Math.PI / 180;
const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
void BREATH_PALE;

// =============================================================================================
// THEIR COLOURS: the keep's cold stone light on royal blue and old gold

/** The padded jack: undyed linen gone grey in the cold. */
const JACK: Ramp = ['#2a2824', '#36332d', '#76705e', '#9c9480', '#b0a890'];
/** The royal blue of the king's tabards and pavises, faded but deep. */
export const ROYAL_BLUE: Ramp = ['#0e1638', '#16204e', '#243a8a', '#3454b0', '#4468c8'];
/** Old gold: the king's trim and his bird, dull, never shining. */
export const OLD_GOLD: Ramp = ['#2e220c', '#463412', '#8a6c2a', '#b28e3e', '#ccaa54'];
/** Cold steel: the kettle helm, the prod, the iron. */
const COLD_STEEL: Ramp = ['#1a1c22', '#262a32', '#5c6370', '#868e9c', '#aab2be'];
const HOSE: Ramp = ['#12141a', '#161922', '#2e3442', '#404858', '#4a5262'];
const BOOT: Ramp = ['#0e0c0c', '#121010', '#2a2420', '#3c342e', '#463c34'];
const LEATHER: Ramp = ['#1a120c', '#20160e', '#4a3422', '#634630', '#6e4e36'];
const GLOVE: Ramp = ['#1c140e', '#22180f', '#4e3826', '#664a32', '#6e5038'];
/** The crossbow's walnut stock. */
const WALNUT: Ramp = ['#1a100a', '#22150c', '#4c3220', '#664430', '#744e36'];
/** The bolt's shaft: ash, pale. */
const ASH: Ramp = ['#2a2216', '#33291b', '#6a583c', '#8a7452', '#98805c'];
/** The pavise's bare planks, behind. */
const PLANK: Ramp = ['#1c1610', '#231b13', '#4a3c2c', '#62503a', '#6c5940'];
const HEMP = '#9a9078';
const FLETCH = '#8a8478';

// =============================================================================================
// THE BODY

/** A soldier the knight's height (58), stocky, padded. */
export const CB_BODY: Build = buildOf(58, 1.22, { shoulders: 1.04, chest: 1.04, depth: 1.06, waist: 1.04, hips: 1.04, arms: 1.0, trunk: 1.0, limbs: 1.0, pad: 1.8 });
const B = CB_BODY;
/** Their picture: room for the crossbow levelled over the pavise and its kick, the pavise swung round, the crossbow falling. */
export const CB_CANVAS: MobCanvas = { w: 300, h: 240, ax: 132, ay: 168 };

// =============================================================================================
// THE HEAVY CROSSBOW

/**
 * Its lengths, from where the right hand holds the stock behind its trigger: the butt behind it, the nose before it,
 * where the prod is lashed, where the spanned string sits (the nut); the prod's half-span and how far its arms sweep
 * back slack and spanned; the bolt's length.
 */
export const CB = { butt: 9, nose: 20, prod: 17.5, nut: 2.5, span: 12.5, sweep: [2.2, 5.6] as const, bolt: 15 } as const;
/** Where the crossbow is at a moment: where its grip is (behind its trigger, where the right hand holds it), the way it points (butt to nose), and its left (the prod's line across, the stock upright). */
export interface BowPose {
  grip: V3;
  way: V3;
  across: V3;
}
/** The crossbow as it is at a moment: from its grip, the way it points, its left, the stock's top. */
export interface Crossbow {
  grip: V3;
  way: V3;
  across: V3;
  top: V3;
  at: (k: number, up?: number, side?: number) => V3;
  butt: V3;
  nose: V3;
  /** The prod's middle and its two tips; where the string meets the stock (`draw` 0 slack at the prod, 1 at the nut). */
  prodC: V3;
  tips: [V3, V3];
  string: V3;
  /** The bolt in the groove: its nock and its head. */
  nock: V3;
  head: V3;
  /** The cranequin's drum on the stock's right side, the crank's axle and its knob (turned `crank` degrees), where a hand turns it. */
  drum: V3;
  axle: V3;
  knob: V3;
  handle: V3;
  draw: number;
}
export function crossbowAt(p: BowPose, draw: number, crank: number): Crossbow {
  const way = norm(p.way, [1, 0, 0]);
  const across = norm(sub(p.across, mul(way, dot(p.across, way))), [0, 1, 0]);
  const top = norm(cross(way, across), [0, 0, 1]);
  const grip = p.grip;
  const at = (k: number, up = 0, side = 0): V3 => add(grip, add(mul(way, k), add(mul(top, up), mul(across, side))));
  const d = clamp01(draw);
  const sweep = CB.sweep[0] + (CB.sweep[1] - CB.sweep[0]) * d;
  const prodC = at(CB.prod, 0.4);
  const tips: [V3, V3] = [add(prodC, add(mul(across, CB.span), mul(way, -sweep))), add(prodC, add(mul(across, -CB.span), mul(way, -sweep)))];
  const string = at(CB.prod - 1.2 - (CB.prod - 1.2 - CB.nut) * d, 1.1);
  const nock = at(CB.nut + 0.2, 1.5);
  const head = at(CB.nut + 0.2 + CB.bolt, 1.5);
  // (the cranequin on the stock's right side near the butt, its crank turning about the line across)
  const drum = at(-4.6, 0.2, -2.0);
  const axle = at(-4.6, 0.2, -3.6);
  const c = crank * D;
  const knob = add(axle, add(mul(way, 3.6 * Math.cos(c)), mul(top, 3.6 * Math.sin(c))));
  const handle = add(knob, mul(across, -1.9));
  return { grip, way, across, top, at, butt: at(-CB.butt), nose: at(CB.nose), prodC, tips, string, nock, head, drum, axle, knob, handle, draw: d };
}
/** The prod's arm from its middle to a tip, bending back: a few points along it. */
function prodArm(cb: Crossbow, k: 1 | -1): V3[] {
  const sweep = CB.sweep[0] + (CB.sweep[1] - CB.sweep[0]) * cb.draw;
  const pts: V3[] = [];
  for (let i = 0; i <= 4; i++) {
    const u = i / 4;
    pts.push(add(cb.prodC, add(mul(cb.across, k * CB.span * u), mul(cb.way, -sweep * u * u))));
  }
  return pts;
}
/**
 * THE HEAVY CROSSBOW: the walnut stock, thick at the butt; the steel prod lashed at its nose, its arms bending back as it
 * is spanned; the hemp string to the nut; the iron stirrup at the nose; the long trigger lever under it; the cranequin's
 * drum at the butt and its crank; the bolt in the groove (`bolt`: loaded), its steel head and its fletching.
 */
function crossbow(put: Put, cb: Crossbow, bolt: boolean, far: boolean): void {
  const P = 'xbow';
  // the stock: the butt, swelling to the grip, then the fore-stock to the nose
  put(P, 'xbow', { k: 'rod', a: cb.at(-CB.butt, -0.4), b: cb.at(-2, 0), ra: 1.9, rb: 1.35, ramp: WALNUT, far });
  put(P, 'xbow', { k: 'rod', a: cb.at(-2, 0), b: cb.at(CB.nose - 0.5, 0.2), ra: 1.35, rb: 1.15, ramp: WALNUT, far });
  // the butt plate
  put(P, 'xbow', { k: 'rod', a: cb.at(-CB.butt - 0.6, -0.5), b: cb.at(-CB.butt + 0.4, -0.4), ra: 2.0, rb: 2.0, ramp: LEATHER, far });
  // the iron stirrup at the nose, a loop out before it
  for (const k of [-1, 1] as const) put(P, 'xbow', { k: 'rod', a: cb.at(CB.nose - 0.8, 0, k * 1.2), b: cb.at(CB.nose + 3.4, 0, k * 2.4), ra: 0.5, rb: 0.45, ramp: COLD_STEEL, far });
  put(P, 'xbow', { k: 'rod', a: cb.at(CB.nose + 3.4, 0, -2.4), b: cb.at(CB.nose + 3.4, 0, 2.4), ra: 0.5, rb: 0.5, ramp: COLD_STEEL, far });
  // the prod: steel, lashed across the nose, its arms bent back
  put(P, 'xbow', { k: 'rod', a: cb.at(CB.prod - 0.9, 0.4), b: cb.at(CB.prod + 0.9, 0.4), ra: 1.6, rb: 1.6, ramp: HEMP_RAMP, far });
  for (const k of [1, -1] as const) {
    const arm = prodArm(cb, k);
    for (let i = 1; i < arm.length; i++) put(P, 'xbow', { k: 'rod', a: arm[i - 1], b: arm[i], ra: 1.15 - 0.15 * i, rb: 1.0 - 0.15 * i, ramp: COLD_STEEL, far });
  }
  // the string, from each tip to the nut (or slack across)
  for (const tip of cb.tips) put('string', 'xbow', { k: 'thread', a: tip, b: cb.string, c: HEMP, lift: 0.4 });
  // the trigger lever under the stock
  put(P, 'xbow', { k: 'rod', a: cb.at(1.2, -1.0), b: cb.at(-6.5, -2.6), ra: 0.42, rb: 0.36, ramp: COLD_STEEL, far });
  // the cranequin: its drum on the stock's right side, its rack along the top to the nut, its crank and knob
  put(P, 'xbow', { k: 'ball', c: cb.drum, ax: [mul(cb.way, 2.2), mul(cb.top, 2.2), mul(cb.across, 1.4)], skin: COLD_STEEL, far });
  put(P, 'xbow', { k: 'rod', a: cb.at(-5.2, 1.3), b: cb.at(CB.nut - 0.4, 1.3), ra: 0.45, rb: 0.45, ramp: COLD_STEEL, far });
  put(P, 'xbow', { k: 'rod', a: add(cb.drum, mul(cb.across, -1.2)), b: cb.axle, ra: 0.45, rb: 0.45, ramp: COLD_STEEL, far });
  put(P, 'xbow', { k: 'rod', a: cb.axle, b: cb.knob, ra: 0.5, rb: 0.45, ramp: COLD_STEEL, far });
  put(P, 'xbow', { k: 'rod', a: cb.knob, b: cb.handle, ra: 0.75, rb: 0.75, ramp: WALNUT, far });
  if (bolt) boltShape(put, P, 'xbow', cb.nock, cb.head, cb.top, far);
}
const HEMP_RAMP: Ramp = ['#2a261c', '#332e22', '#6a6248', '#8a8064', '#9a9078'];
/** A bolt from its nock to its head: an ash shaft, a short square steel head, two vanes of grey feather. */
function boltShape(put: Put, part: string, piece: string, nock: V3, head: V3, up: V3, far = false): void {
  const way = norm(sub(head, nock), [1, 0, 0]);
  const side = norm(cross(way, up), [0, 1, 0]);
  const neck = add(head, mul(way, -2.6));
  put(part, piece, { k: 'rod', a: nock, b: neck, ra: 0.42, rb: 0.42, ramp: ASH, far });
  put(part, piece, { k: 'rod', a: neck, b: head, ra: 0.75, rb: 0.15, ramp: COLD_STEEL, far });
  for (const k of [-1, 1]) put(part, piece, { k: 'thread', a: add(nock, mul(way, 0.6)), b: add(add(nock, mul(way, 3.4)), mul(add(mul(up, 0.4), mul(side, k)), 0.9)), c: FLETCH, lift: 0.2 });
}

// =============================================================================================
// THE PAVISE

/** Its half-width and half-height; its thickness; the chamfer of its top corners; how far behind its face its back is. */
export const PAVISE = { w: 11, h: 21, thick: 1.3, chamfer: 3 } as const;
/** The pavise as it is at a moment: its middle, the way its painted face looks, its up and its across (to the face's right as you look at it: `cross(up, n)`). */
export interface Pavise {
  c: V3;
  n: V3;
  up: V3;
  across: V3;
}
/** Planted before them: its foot on the floor before their toes, its face to the way they face, leaning back a little onto its prop. */
export const PLANTED_AT = { x: 24, lean: 6 } as const;
export function planted(): Pavise {
  const n = heading(0, -PLANTED_AT.lean);
  const up = norm([-Math.sin(PLANTED_AT.lean * D), 0, Math.cos(PLANTED_AT.lean * D)]);
  const foot: V3 = [PLANTED_AT.x, 0, 0.9];
  return { c: add(foot, mul(up, PAVISE.h)), n, up, across: norm(cross(up, n)) };
}
/** On their back: slung by its strap, its painted face out behind them, leaning out from their calves. */
export function onBack(s: Skeleton, lag: V3 = [0, 0, 0]): Pavise {
  const [cf, cl, cu] = s.chest;
  const back = mul(cf, -1);
  // (its top behind their shoulders, a little to their left, the strap over the left shoulder; it hangs leaning out)
  const top = add(add(s.neck, add(mul(back, B.ribDeep + 6.4), add(mul(cl, 1.5), mul(cu, 0.6)))), mul(lag, 0.3));
  const flatBack = norm([back[0], back[1], 0], [-1, 0, 0]);
  const hang = norm(add(add(mul(cu, -0.45), [0, 0, -0.55]), add(mul(flatBack, 0.17), mul(lag, 0.02))));
  const up = mul(hang, -1);
  const n = norm(sub(flatBack, mul(up, dot(flatBack, up))), [-1, 0, 0]);
  return { c: add(top, mul(hang, PAVISE.h)), n, up, across: norm(cross(up, n)) };
}
/** Inside the pavise's outline (`a` across, `b` up, from its middle): its straight sides, its top corners cut off. */
export function paviseInside(a: number, b: number): boolean {
  const x = Math.abs(a);
  if (x > PAVISE.w || Math.abs(b) > PAVISE.h) return false;
  const over = b - (PAVISE.h - PAVISE.chamfer);
  return !(over > 0 && x > PAVISE.w - PAVISE.chamfer + over);
}
/** Its outline and middle as points (for the checks: what it would go through), each `step` apart. */
export function paviseOutline(p: Pavise, step = 3): V3[] {
  const out: V3[] = [];
  const pt = (a: number, b: number): V3 => add(p.c, add(mul(p.across, a), mul(p.up, b)));
  const W = PAVISE.w - 0.6;
  const H = PAVISE.h - 0.6;
  for (let b = -H; b <= H - PAVISE.chamfer + 1e-6; b += step) out.push(pt(-W, b), pt(W, b), pt(0, b), pt(-W / 2, b), pt(W / 2, b));
  out.push(pt(-W + PAVISE.chamfer, H), pt(W - PAVISE.chamfer, H), pt(0, H));
  return out;
}
/**
 * THE ROYAL SWAN (his pick for the royal mark, “Keep the royal swan”: floor 16's royal crest, art/palace_guard.ts `swanCrest`,
 * here in old gold on the royal blue): a swan, its wings raised, its neck in its S, its head turned to its left; `x` across
 * and `y` up its field, each from -1 to 1. Inside it: 1, else 0.
 */
export function royalSwan(x: number, y: number): number {
  const e = (cx: number, cy: number, rx: number, ry: number): boolean => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
  if (e(0.12, -0.5, 0.62, 0.26)) return 1;
  if (e(0.68, -0.32, 0.16, 0.12)) return 1;
  if (y > -0.5 && e(0.28, -0.12, 0.42, 0.42)) {
    const notch = y > 0.12 && Math.abs((((x - 0.28) * 4 + 8) % 1) - 0.5) < 0.12;
    if (!notch) return 1;
  }
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const cx = -0.36 - 0.16 * Math.sin(Math.PI * 1.6 * t) + 0.06 * t;
    const cy = -0.38 + 0.98 * t;
    if (Math.hypot(x - cx, y - cy) < 0.11 - 0.02 * t) return 1;
  }
  if (e(-0.28, 0.62, 0.15, 0.12)) return 1;
  if (y < 0.66 && y > 0.52 && x < -0.38 && x > -0.64 + (0.66 - y) * 0.6) return 1;
  return 0;
}
/**
 * THE PAVISE: its painted face (the royal blue, an old gold border, the royal swan, the paint chipped to the planks here
 * and there), a raised spine down its middle, its back of bare planks, iron feet at its foot, its carrying strap and its
 * prop behind (the prop down to the floor once planted, folded up against it while carried).
 */
function pavise(put: Put, p: Pavise, held: boolean, standingOn: boolean, propEnd: V3 | null = null): void {
  const { c, n, up, across } = p;
  const W = PAVISE.w;
  const H = PAVISE.h;
  put('pavise', 'pavise', {
    k: 'panel',
    c,
    u: mul(across, W),
    v: mul(up, H),
    skin: (a, b, front, tone0) => {
      if (!paviseInside(a, b)) return null;
      if (!front) return PLANK[Math.max(0, tone0 - 1)];
      const tone = Math.max(1, Math.min(4, tone0));
      const x = Math.abs(a);
      // (its edge: old gold; the border inside it, a step darker blue; the chipped paint showing the planks)
      const edge = Math.min(W - x, H - Math.abs(b), b > H - PAVISE.chamfer - 1 ? (W - PAVISE.chamfer + (b - (H - PAVISE.chamfer))) - x : 99);
      if (edge < 1.1) return OLD_GOLD[Math.min(4, tone)];
      if (edge < 2.0) return ROYAL_BLUE[Math.max(0, tone - 1)];
      if (hash(Math.floor(a * 1.6 + 40), Math.floor(b * 1.2 + 40), 9311) > 0.965) return PLANK[Math.min(3, tone)];
      // the royal swan, in the field's upper middle
      if (royalSwan(-a / (W - 2.4), (b - 3.0) / (W - 1.0))) return OLD_GOLD[Math.min(4, tone + 1)];
      return ROYAL_BLUE[tone];
    },
  });
  // its back, the planks' thickness behind the face
  put('pavise', 'pavise', { k: 'panel', c: add(c, mul(n, -PAVISE.thick)), u: mul(across, W), v: mul(up, H), skin: (a, b, _front, tone) => (paviseInside(a, b) ? PLANK[Math.max(0, Math.min(3, tone - (Math.abs(((a + 20) % 4.8) - 2.4) < 0.3 ? 1 : 0)))] : null) });
  // its spine, a raised rib down the middle of its face
  put('pavise', 'pavise', { k: 'rod', a: add(c, add(mul(up, -H + 1.2), mul(n, 0.35))), b: add(c, add(mul(up, H - 1.0), mul(n, 0.35))), ra: 0.95, rb: 0.95, ramp: ROYAL_BLUE });
  // its iron feet at the corners of its foot
  for (const k of [-1, 1]) put('pavise', 'pavise', { k: 'rod', a: add(c, add(mul(across, k * (W - 1.2)), mul(up, -H + 1.6))), b: add(c, add(mul(across, k * (W - 1.0)), mul(up, -H - 0.2))), ra: 0.8, rb: 0.6, ramp: COLD_STEEL });
  // behind: the strap (two buckled ends down its back), and the prop
  const back = mul(n, -PAVISE.thick - 0.45);
  for (const k of [-1, 1]) put('pavise', 'strap', { k: 'rod', a: add(c, add(back, add(mul(across, k * 3.2), mul(up, H * 0.55)))), b: add(c, add(back, add(mul(across, k * 3.2), mul(up, -H * 0.15)))), ra: 0.5, rb: 0.5, ramp: LEATHER });
  const hinge = add(c, add(back, mul(up, H * 0.35)));
  if (propEnd) {
    // (the prop kicked from under it and folding up against its back as it falls: where its foot is now, as the moves say)
    put('pavise', 'prop', { k: 'rod', a: hinge, b: propEnd, ra: 0.6, rb: 0.55, ramp: PLANK });
  } else if (standingOn) {
    // (the prop down to the floor behind it: its foot well back so it leans onto it)
    const foot: V3 = [hinge[0] - 13, hinge[1] + 1.5, 0.6];
    put('pavise', 'prop', { k: 'rod', a: hinge, b: foot, ra: 0.6, rb: 0.55, ramp: PLANK });
  } else {
    put('pavise', 'prop', { k: 'rod', a: hinge, b: add(hinge, mul(up, -H * 1.1)), ra: 0.55, rb: 0.55, ramp: PLANK });
  }
  void held;
}

// =============================================================================================
// THEM AS SOLIDS

/** An arm: a padded sleeve of the jack, quilted fat in rolls; a leather glove, its fingers closed round what it holds (`curl` 1) or slack. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', cu: V3, curl: number): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = B.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  const upper = norm(sub(el, sh), [0, 0, -1]);
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(r0 * 1.32), skin: JACK, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.3, rb: r1 * 1.3, ramp: JACK, far: true });
  // (the quilting: rolls round the sleeve, each a step darker at its seam)
  for (const k of [0.35, 0.68]) {
    const p = lerp3(sh, el, k);
    put(`arm${side}`, `quilt${side}`, { k: 'rod', a: add(p, mul(upper, -0.25)), b: add(p, mul(upper, 0.25)), ra: r0 * 1.36 - 0.25 * k, rb: r0 * 1.36 - 0.25 * k, ramp: JACK_SEAM, far: true });
  }
  put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.3), skin: JACK, far: true });
  const wrist = add(hand, mul(fore, -1.3));
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: lerp3(el, wrist, 0.78), ra: r1 * 1.28, rb: r2 * 1.32, ramp: JACK, far: true });
  {
    const p = lerp3(el, wrist, 0.42);
    put(`fore${side}`, `quilt${side}`, { k: 'rod', a: add(p, mul(fore, -0.25)), b: add(p, mul(fore, 0.25)), ra: r1 * 1.33, rb: r1 * 1.33, ramp: JACK_SEAM, far: true });
  }
  put(`fore${side}`, `cuff${side}`, { k: 'rod', a: lerp3(el, wrist, 0.72), b: wrist, ra: r2 * 1.42, rb: r2 * 1.2, ramp: GLOVE, far: true });
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.4)), ax: [mul(fore, 1.8), mul(e2, 1.6), mul(e1, 1.0)], skin: GLOVE, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * 0.33;
    const base = add(hand, add(mul(fore, 1.45), mul(e2, spread * 0.9)));
    const mid = add(base, add(mul(fore, 1.35 * (1 - 0.45 * curl)), mul(e1, -1.0 * curl)));
    const tip = add(mid, add(mul(fore, 1.0 * (1 - 0.8 * curl)), mul(e1, -1.3 * curl)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.55, rb: 0.46, ramp: GLOVE, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.46, rb: 0.34, ramp: GLOVE, far: true });
  }
}
const JACK_SEAM: Ramp = ['#1e1c18', '#26231e', '#55503f', '#716a56', '#7e7660'];
/** A leg: dark hose; a short boot to the mid calf, its top turned down. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R'): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const [rH, rK, rA] = B.legR;
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.08, rb: rK * 1.06, ramp: HOSE, far: true });
  put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.08), skin: HOSE, far: true });
  put(`shin${side}`, `shin${side}`, { k: 'rod', a: knee, b: lerp3(knee, ankle, 0.4), ra: rK * 1.04, rb: rA * 1.2, ramp: HOSE, far: true });
  put(`shin${side}`, `boot${side}`, { k: 'rod', a: lerp3(knee, ankle, 0.36), b: ankle, ra: rK * 1.16, rb: rA * 1.26, ramp: BOOT, far: true });
  put(`shin${side}`, `bootTop${side}`, { k: 'rod', a: lerp3(knee, ankle, 0.33), b: lerp3(knee, ankle, 0.46), ra: rK * 1.3, rb: rK * 1.26, ramp: LEATHER, far: true });
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.5), mul(up3, 1.7)), ax: [mul(fwd, 4.9), mul(side3, 2.15), mul(up3, 1.75)], skin: BOOT, far: true });
}

/** The jack: from the throat to the hips, quilted, padded out; its skirt to the top of the thighs. */
function jackRings(s: Skeleton, lag: V3): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  return [
    { c: add(add(s.pelvis, mul(s.hips[2], -2.6)), mul(lag, 0.4)), u: mul(s.hips[0], B.pelvisDeep + 2.6), v: mul(s.hips[1], B.pelvisHalf + 2.7) },
    { c: waistC, u: mul(be[0], B.waistDeep + 2.0), v: mul(be[1], B.waistHalf + 2.0) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 2.2), v: mul(cl, B.ribHalf + 2.2) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, B.ribDeep + 1.5), v: mul(cl, B.shoulderHalf + 0.9) },
    { c: add(s.neck, mul(cu, -0.6)), u: mul(cf, 3.6), v: mul(cl, 4.2) },
  ];
}
/** A ring round both thighs `down` of the way from the hips to the knees, hanging back as they go (the tabard's hem). */
function thighRing(s: Skeleton, down: number, pad: number, lag: V3): Ring {
  // (lying on his back as he dies, the hips' forward to the sky: the hem goes round the thighs as they lie, falling flat on them)
  const h0 = s.hips[0];
  const lie = clamp01((Math.abs(h0[2]) - 0.45) / 0.3);
  const f0 = norm([h0[0], h0[1], 0], [1, 0, 0]);
  const f = lie > 0 ? norm(lerp3(f0, h0, lie), h0) : f0;
  const l: V3 = lie > 0 ? norm(lerp3([-f0[1], f0[0], 0], s.hips[1], lie), s.hips[1]) : [-f[1], f[0], 0];
  const a = lerp3(s.hipL, s.kneeL, down);
  const b = lerp3(s.hipR, s.kneeR, down);
  const c = lerp3(a, b, 0.5);
  const spanF = Math.abs(dot(sub(a, b), f));
  const spanL = Math.abs(dot(sub(a, b), l));
  const rT = B.legR[0] * 1.1;
  const deep = Math.max(B.pelvisDeep + 3.0, spanF / 2 + rT + 1.6);
  return { c: add(c, mul(lag, 0.8)), u: mul(f, (lie > 0 ? deep + (spanF / 2 + rT + 0.8 - deep) * lie : deep) + pad), v: mul(l, Math.max(B.pelvisHalf + 2.6, spanL / 2 + rT + 1.2) + pad) };
}
/** THE TABARD: front and back, from the shoulders to the thighs, over the jack. */
function tabardRings(s: Skeleton, lag: V3): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.5));
  return [
    thighRing(s, 0.4, 1.0, lag),
    { c: add(add(s.pelvis, mul(s.hips[2], -1.4)), mul(lag, 0.4)), u: mul(s.hips[0], B.pelvisDeep + 3.4), v: mul(s.hips[1], B.pelvisHalf + 3.2) },
    { c: waistC, u: mul(be[0], B.waistDeep + 2.8), v: mul(be[1], B.waistHalf + 2.8) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 2.9), v: mul(cl, B.ribHalf + 2.9) },
    { c: lerp3(s.ribs, s.neck, 0.7), u: mul(cf, B.ribDeep + 2.2), v: mul(cl, B.shoulderHalf + 1.2) },
    { c: add(s.neck, mul(cu, -0.5)), u: mul(cf, 4.4), v: mul(cl, 5.0) },
  ];
}
/** The royal swan on the tabard's breast and back, on a thin shell just proud of it. */
function breastBird(put: Put, s: Skeleton): void {
  const [cf, cl, cu] = s.chest;
  for (const k of [1, -1]) {
    const c = add(lerp3(s.ribs, s.neck, 0.22), mul(cf, k * (B.ribDeep + 3.2)));
    put('tabard', 'crest', { k: 'ball', c, ax: [mul(cf, k * 1.2), mul(cl, -k * 5.4), mul(cu, 5.6)], skin: (u, tone) => (u[0] > 0.2 && royalSwan(u[1], u[2]) ? OLD_GOLD[tone >= 2 ? 4 : 3] : null) });
  }
}

/** THE BOLT CASE at the right hip: a leather case hanging from the belt, the bolts' fletching out of its top. Returns its mouth. */
function boltCase(put: Put, s: Skeleton, lag: V3): V3 {
  const [hf, hl, hu] = s.hips;
  const top = add(s.pelvis, add(mul(hl, -(B.pelvisHalf + 3.9)), add(mul(hf, -0.6), mul(hu, B.waist * 0.25))));
  const low = add(add(top, add(mul(hu, -11), mul(hf, 2.2))), mul(lag, 0.8));
  put('case', 'case', { k: 'rod', a: top, b: low, ra: 1.9, rb: 1.7, ramp: LEATHER });
  put('case', 'case', { k: 'rod', a: add(top, mul(hu, 0.2)), b: add(top, mul(hu, -0.8)), ra: 2.1, rb: 2.1, ramp: OLD_GOLD });
  const way = norm(sub(top, low), [0, 0, 1]);
  for (let i = 0; i < 4; i++) {
    const off = add(mul(hf, (i % 2 ? 0.7 : -0.7)), mul(hl, i < 2 ? 0.6 : -0.6));
    put('case', 'fletch', { k: 'thread', a: add(top, off), b: add(add(top, off), mul(way, 2.6)), c: FLETCH, lift: 0.3 });
  }
  return top;
}

/**
 * THE HEAD UNDER ITS KETTLE HELM: a drained face in the brim's shade, the dull pink in the eyes, the mouth hanging open
 * and working; the helm's round crown with its comb; its broad brim turned down all round; a strap under the chin.
 * Returns the mouth and the face's ways.
 */
function head(put: Put, st: Stage, s: Skeleton, jaw: number, lit: number, loose: LooseHelm | null = null): { mouth: V3; ff: V3; fl: V3; fu: V3 } {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [B.headR[0] * 1.02, B.headR[1] * 1.08, B.headR[2]];
  const hc = add(s.head, mul(fu, -0.3));
  const skin: Skin = (u, tone0) => {
    // (in the brim's shade: a step darker, the brow darker still)
    const tone = Math.max(1, tone0);
    const fwd = u[0];
    const side = Math.abs(u[1]);
    const open = 0.08 + 0.2 * jaw;
    if (fwd > 0.7 && side < 0.24 && u[2] < -0.32 && u[2] > -0.32 - open * 1.5) return u[2] > -0.38 ? '#22161a' : INK;
    if (fwd > 0.45 && fwd < 0.75 && side > 0.42 && side < 0.7 && u[2] < -0.1 && u[2] > -0.5) return SKIN[Math.max(0, tone - 1)];
    if (fwd > 0.88 && side < 0.14 && u[2] > -0.24 && u[2] < 0.1) return SKIN[Math.min(4, tone + 1)];
    // (a few days' grey stubble on the jaw)
    if (fwd > 0.1 && u[2] < -0.3 && hash(Math.floor(u[1] * 14), Math.floor(u[2] * 14), 9341) < 0.35) return SKIN[Math.max(0, tone - 1)];
    return SKIN[tone];
  };
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin });
  for (const k of [-1, 1]) {
    const e = add(hc, add(mul(ff, hr[0] * 0.92), add(mul(fl, k * hr[1] * 0.34), mul(fu, hr[2] * 0.1))));
    put('head', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#3a2a30', facing: ff });
  }
  // the chin strap: from the brim at each side, under the jaw (snapped, once the helm is knocked off)
  for (const k of loose ? [] : [-1, 1]) {
    const a = add(hc, add(mul(fl, k * hr[1] * 0.98), mul(fu, hr[2] * 0.25)));
    const b = add(hc, add(mul(ff, hr[0] * 0.45), add(mul(fl, k * hr[1] * 0.5), mul(fu, -hr[2] * 0.95))));
    put('head', 'strap', { k: 'rod', a, b, ra: 0.4, rb: 0.4, ramp: LEATHER });
  }
  // THE KETTLE HELM: its round crown, a comb over it front to back, a band where the brim joins, the brim turned down,
  // worn pushed back a little so that the brim clears the eyes in front (or knocked off him as he dies: where it has gone)
  if (loose) {
    const [hf, hl, hu] = looseFrame(st, loose);
    kettleHelm(put, loose.c, hf, hl, hu);
  } else kettleHelm(put, hc, ff, fl, fu);
  const mouth = add(hc, add(mul(ff, hr[0] * 1.02), mul(fu, -hr[2] * 0.4)));
  return { mouth, ff, fl, fu };
}
const COLD_STEEL_DARK: Ramp = ['#121418', '#16181e', '#363c46', '#4c5360', '#58606c'];
/** The head's half-lengths as the helm sits on it. */
const HELM_HR: V3 = [B.headR[0] * 1.02, B.headR[1] * 1.08, B.headR[2]];
/** The helm's crown's middle, on a head whose middle is `hc`. */
const helmBase = (hc: V3, fu: V3): V3 => add(hc, mul(fu, HELM_HR[2] * 0.64));
/** A ring of the brim (`k` its size, `drop` how far below the crown's middle). */
function helmRim(base: V3, ff: V3, fl: V3, fu: V3, k: number, drop: number): Ring {
  const hr = HELM_HR;
  return { c: add(add(base, mul(fu, -drop)), mul(ff, -(k - 1.1) * 0.9)), u: add(mul(ff, hr[0] * (1.1 + (k - 1.1) * 0.62)), mul(fu, (k - 1.1) * 1.6)), v: mul(fl, hr[1] * k * 1.04) };
}
/** THE KETTLE HELM on a head whose middle is `hc`, its own forward, left and up `ff`, `fl`, `fu`. */
function kettleHelm(put: Put, hc: V3, ff: V3, fl: V3, fu: V3): void {
  const hr = HELM_HR;
  const base = helmBase(hc, fu);
  put('helm', 'helm', { k: 'ball', c: base, ax: [mul(ff, hr[0] * 1.12), mul(fl, hr[1] * 1.12), mul(fu, hr[2] * 1.0)], skin: (u, tone) => (u[2] < -0.04 ? null : COLD_STEEL[Math.abs(u[1]) < 0.12 && u[2] > 0.2 ? Math.min(4, tone + 1) : tone]) });
  const crown = add(base, mul(fu, hr[2] * 1.0));
  put('helm', 'comb', { k: 'rod', a: add(base, add(mul(ff, hr[0] * 0.95), mul(fu, hr[2] * 0.5))), b: add(crown, mul(fu, 0.5)), ra: 0.65, rb: 0.8, ramp: COLD_STEEL });
  put('helm', 'comb', { k: 'rod', a: add(crown, mul(fu, 0.5)), b: add(base, add(mul(ff, -hr[0] * 0.95), mul(fu, hr[2] * 0.5))), ra: 0.8, rb: 0.65, ramp: COLD_STEEL });
  const rim = (k: number, drop: number): Ring => helmRim(base, ff, fl, fu, k, drop);
  put('helm', 'brim', { k: 'cloth', rings: [rim(2.0, 1.7), rim(1.55, 0.8), rim(1.12, 0.02)], ramp: COLD_STEEL, look: { lift: 0.3, folds: [] }, rigid: true });
  put('helm', 'band', { k: 'band', ring: rim(1.13, 0.02), ramp: COLD_STEEL_DARK, rows: 1 });
}
/**
 * A HELM KNOCKED OFF (as he dies): the middle of the head it sat on, as it was when it left it, carried with it; its own
 * forward, left and up; `tip`: how far it is still painted tipped from the eye as on a head (art/skin.ts TIPPED's cheat,
 * eight degrees on him, gone as it leaves the head).
 */
export interface LooseHelm {
  c: V3;
  ff: V3;
  fl: V3;
  fu: V3;
  tip: number;
}
function looseFrame(st: Stage, h: LooseHelm): [V3, V3, V3] {
  if (h.tip <= 0) return [h.ff, h.fl, h.fu];
  const up = tippedFrom(st, h.fu, h.tip);
  const fwd = norm(sub(h.ff, mul(up, dot(h.ff, up))), h.ff);
  return [fwd, cross(up, fwd), up];
}
/** THE LOWEST OF A HELM so (its middle `hc`, its own forward, left and up): of its brim's rings and its band, its comb, and its crown, a half shell above the band (the floor under it, for the moves). */
export function helmLow(hc: V3, ff: V3, fl: V3, fu: V3): number {
  const hr = HELM_HR;
  const base = helmBase(hc, fu);
  let low = Infinity;
  for (const [k, drop] of [[2.0, 1.7], [1.55, 0.8], [1.12, 0.02], [1.13, 0.02]] as const) {
    const r = helmRim(base, ff, fl, fu, k, drop);
    low = Math.min(low, r.c[2] - Math.hypot(r.u[2], r.v[2]));
  }
  const crown = add(base, mul(fu, hr[2]));
  for (const [p, r] of [[add(base, add(mul(ff, hr[0] * 0.95), mul(fu, hr[2] * 0.5))), 0.65], [add(crown, mul(fu, 0.5)), 0.8], [add(base, add(mul(ff, -hr[0] * 0.95), mul(fu, hr[2] * 0.5))), 0.65]] as const) low = Math.min(low, p[2] - r);
  low = Math.min(low, crownLow(base, ff, fl, fu));
  return low;
}
/** The lowest of the crown's shell (the half of its ball above the band: its skin's own cut, `u[2]` from -0.04). */
export function crownLow(base: V3, ff: V3, fl: V3, fu: V3): number {
  const hr = HELM_HR;
  const ax = [mul(ff, hr[0] * 1.12), mul(fl, hr[1] * 1.12), mul(fu, hr[2] * 1.0)];
  let low = Infinity;
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    for (let j = 0; j <= 8; j++) {
      const e = -0.04 + (j / 8) * (Math.PI / 2 + 0.04);
      const z = base[2] + ax[0][2] * Math.cos(e) * Math.cos(a) + ax[1][2] * Math.cos(e) * Math.sin(a) + ax[2][2] * Math.sin(e);
      low = Math.min(low, z);
    }
  }
  return low;
}

/** The Hush leaking out of them at each moment, laid after their edge (Mob.grains); and the other grains of a move (the kick's smear, the slam's dust). */
const BREATH = new WeakMap<Moment, [V3, string, number][]>();
const GRAINS = new WeakMap<Moment, [V3, string, number][]>();
/** The Hush coming out of them at a moment (once its bits are made): for the checks. */
export function breathOf(m: Moment): ReadonlyArray<readonly [V3, string, number]> {
  return BREATH.get(m) ?? [];
}
/** What a moment of a move says over and above the bones (their moves, art/keep_crossbowmen_moves.ts). */
export interface CrossbowSay {
  /** Where the pavise is (planted, on their back, or swung between). */
  pavise: (m: Moment) => Pavise;
  /** The crossbow as it is (where it is, how far it is spanned, how far its crank has turned). */
  bow: (m: Moment) => Crossbow;
  /** Whether the crossbow has fallen from their hands; whether a bolt lies in its groove; a bolt in the right hand (taken from the case). */
  dropped: (m: Moment) => boolean;
  loaded: (m: Moment) => boolean;
  inHand: (m: Moment) => { nock: V3; head: V3 } | null;
  /** How hard the Hush comes out of them (1 as they breathe; held in, less; bursting out after the shot, more). */
  puff: (m: Moment) => number;
  /** Grains of a move of theirs laid after their edge (the smear of the kick, the dust of the pavise's slam). */
  more?: (m: Moment) => [V3, string, number][];
  /** Whether the pavise stands on its prop (planted) or hangs (carried, swung). */
  standing: (m: Moment) => boolean;
  /** Whether the left hand holds the pavise's carrying strap at the chest (it runs up over the left shoulder to the pavise). */
  strap: (m: Moment) => boolean;
  /** As he dies: his helm, once knocked off him (null while it is on his head); where the pavise's prop's foot is as it folds; when the Hush leaves him (seconds). */
  helm?: (m: Moment) => LooseHelm | null;
  propEnd?: (m: Moment) => V3 | null;
  exhale?: readonly [number, number];
}
function crossbowBits(st: Stage, m: Moment, say: CrossbowSay): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const breath: [V3, string, number][] = [];
  BREATH.set(m, breath);
  const put: Put = (part, piece, shape) => {
    if (shape.k === 'mote' && part === 'hush') {
      breath.push([shape.p, shape.c, shape.size]);
      return;
    }
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const lag = lagOf(m, 1.5, 3.0);
  const jaw = clamp01(m.jaw ?? 0.4);
  const held = !say.dropped(m);
  for (const side of ['L', 'R'] as const) leg(put, s, side);
  // THE PADDED JACK, quilted in long channels
  put('body', 'jack', { k: 'cloth', rings: jackRings(s, lag), ramp: JACK, look: { folds: [0, 20, -20, 40, -40, 60, -60, 80, -80, 100, -100, 120, -120, 140, -140, 160, -160, 180], lift: 0.04 } });
  // THE TABARD of the royal blue, front and back, edged old gold; the royal swan on its breast and its back
  const tab = tabardRings(s, lag);
  for (const [a0, a1] of [[316, 404], [136, 224]] as const) {
    put('tabard', 'tabard', { k: 'cloth', rings: tab, ramp: ROYAL_BLUE, look: { folds: [0, 180], lift: 0.05, arc: [a0, a1] } });
    const at = (r: Ring, deg: number, out: number): V3 => {
      const t = deg * D;
      return add(r.c, add(mul(r.u, Math.cos(t) * (1 + out / len3(r.u))), mul(r.v, Math.sin(t) * (1 + out / len3(r.v)))));
    };
    for (const deg of [a0 + 1.5, a1 - 1.5]) for (let i = 0; i + 1 < tab.length - 1; i++) put('tabard', 'trim', { k: 'rod', a: at(tab[i], deg, 0.35), b: at(tab[i + 1], deg, 0.35), ra: 0.65, rb: 0.65, ramp: OLD_GOLD });
    for (let d = a0 + 1.5; d < a1 - 1.5; d += 10) put('tabard', 'trim', { k: 'rod', a: at(tab[0], d, 0.35), b: at(tab[0], Math.min(a1 - 1.5, d + 10), 0.35), ra: 0.7, rb: 0.7, ramp: OLD_GOLD });
  }
  breastBird(put, s);
  // the belt, its buckle; the bolt case at the right hip
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.42));
  put('body', 'belt', { k: 'band', ring: { c: waistC, u: mul(s.belly[0], B.waistDeep + 3.0), v: mul(s.belly[1], B.waistHalf + 3.0) }, ramp: LEATHER, rows: 2 });
  boltCase(put, s, lag);
  // the arms: the right fist round the stock; the left round the fore-stock, the pavise, or slack
  arm(put, s, 'L', cu, q.lhIn === 3 || q.lhIn === 2 ? 1 : 0.5);
  arm(put, s, 'R', cu, held ? 1 : 0.45);
  put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.5)), b: lerp3(s.neck, s.head, 0.5), ra: 2.3, rb: 2.1, ramp: SKIN });
  const hd = head(put, st, s, jaw, lit, say.helm?.(m) ?? null);
  // (painted even once dropped: as they die it falls from them as a piece of its own, Mob.fall)
  crossbow(put, say.bow(m), say.loaded(m), false);
  const bolt = say.inHand(m);
  if (bolt) boltShape(put, 'boltHand', 'boltHand', bolt.nock, bolt.head, cu);
  const pv = say.pavise(m);
  pavise(put, pv, false, say.standing(m), say.propEnd?.(m) ?? null);
  if (say.strap(m)) {
    // the carrying strap: from the pavise's top, over the left shoulder, down to the left fist at the chest
    const over = add(s.shoulderL, mul(cu, B.armR[0] * 1.32 + 0.7));
    const top = add(pv.c, add(mul(pv.up, PAVISE.h - 2), add(mul(pv.across, pv.across[1] > 0 ? 3.2 : -3.2), mul(pv.n, -PAVISE.thick - 0.5))));
    put('strap', 'strap', { k: 'rod', a: top, b: over, ra: 0.6, rb: 0.6, ramp: LEATHER });
    put('strap', 'strap', { k: 'rod', a: over, b: s.handL, ra: 0.6, rb: 0.6, ramp: LEATHER });
  }
  const puff = say.puff(m);
  coldBreath(put, hd.mouth, hd.ff, hd.fl, m.t, puff, 31);
  const [e0, e1] = say.exhale ?? CB_EXHALE;
  if (m.dying) hushLeaves(put, hd.mouth, hd.ff, hd.fl, m.t, 31, e0, e1);
  GRAINS.set(m, say.more?.(m) ?? []);
  void cf;
  void cl;
  return bits;
}
/** The Hush's greys (the crier's, art/crier.ts HUSH), as the breath leaves the mouth and thins. */
const HUSH_GREY = ['#9890b4', '#7c7598', '#625a7a', '#4a445e'] as const;
/**
 * THE HUSH IN THE KEEP'S COLD: each breath out of the open mouth clouds grey in the cold air before the face, rolls forward
 * and up past the brim, swells and thins away (`puff`: how hard, 1 as they breathe; less held in; more bursting out).
 */
function coldBreath(put: Put, mouth: V3, ff: V3, fl: V3, t: number, puff: number, seed: number): void {
  if (puff <= 0.02) return;
  const P = 0.8 / Math.max(0.6, Math.min(1.6, puff));
  for (let b = 0; b < 2; b++) {
    const age0 = (((t / P - b) % 2) + 2) % 2;
    const age = age0 * P;
    if (age > 1.15) continue;
    const n = Math.round(10 + 8 * Math.min(2, puff));
    for (let i = 0; i < n; i++) {
      const h1 = hash(i, seed + b, 9351);
      const h2 = hash(i, seed + b, 9352);
      const life = age / 1.15 - 0.25 * h1;
      if (life <= 0 || life >= 1) continue;
      const go = Math.sqrt(life);
      const out = (1.2 + 7.5 * go) * (0.6 + 0.3 * Math.min(2, puff));
      const side = (h2 - 0.5) * (2 + 7 * go);
      const up = 0.6 + 7 * life * life + 2.2 * go * h1;
      const p = add(mouth, add(mul(ff, out), add(mul(fl, side), [0, 0, up])));
      const c = life < 0.2 ? BREATH_PALE : life < 0.45 ? HUSH_GREY[0] : life < 0.72 ? HUSH_GREY[1] : HUSH_GREY[2];
      if (life > 0.75 && hash(i, Math.floor(t * 30), 9353) < (life - 0.75) * 3) continue;
      put('hush', 'hush', { k: 'mote', p, c, size: life < 0.55 ? 2 : 1 });
      if (life < 0.5 && h2 > 0.4) put('hush', 'hush', { k: 'mote', p: add(p, add(mul(fl, 1.2), [0, 0, 0.6])), c: HUSH_GREY[1], size: 1 });
    }
  }
}
/** When the Hush pours out of them as they die (seconds). */
export const CB_EXHALE: readonly [number, number] = [0.14, 1.6];

/** THEM AS THE PAINTER TAKES THEM. */
export function crossbowPainter(say: CrossbowSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => crossbowBits(st, m, say), grains: (_st, m) => [...(BREATH.get(m) ?? []), ...(GRAINS.get(m) ?? [])] };
}

/** Their rest, planted behind the pavise: braced, feet apart, a soldier's slouch; the head up, watching. */
export const CB_REST0: Bones = {
  ...standing(B),
  pz: -0.9, pitch: 4, bend: 7, roll: 1, side: 0, faceUp: 2, faceTilt: -4, faceTurn: 4,
  lfx: 2.2, lfy: 2.0, lft: 14, lk: 10, rfx: -2.6, rfy: -2.2, rft: -18, rk: -10,
  draw: 1, pt: 1, pAz: 0,
};
