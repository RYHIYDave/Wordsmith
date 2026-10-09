// The town's people, at the heroes' grain (Version 14.4): the armourer, the mystic, the wordsmith
// and the stranger. Each is a rig built with the heroes' kit (art/kit.ts), like the monsters.
//
// The owner, 5 Oct 2026: "Let's get some idle animations for the vendors." And: "Maybe the
// martial vendor has an anvil and forge, the magic guy has some jewelry and potions laid out, and
// the wordsmith I'm not sure about but I want him to be very runic. The shady guy being the
// exception, he's just leaned up against a wall in the shadows."
//
// They only ever stand, facing the camera, so each has two runs of frames:
//   idle   a loop, in which they breathe and whatever is theirs goes on (the beard stirs, the
//          crystal turns, the rune stones go round, the eyes go from side to side);
//   act    what each does now and then (the armourer brings the hammer down on the anvil, the
//          mystic passes a hand over the crystal and it flares, the wordsmith writes a rune on
//          the air, the stranger tosses a coin). It begins and ends as the loop stands.
//
// What marks them as friends: where a monster's eyes are an enemy's pink, theirs are the two cyan
// points of light the heroes have. The stranger's are gold.
//
// How a Pose is read (all four):
//   bob     the body above the legs sinks this many pixels (breathing)
//   wind    0..1 round the loop
//   act     0 = standing; otherwise how far through the act, 0..1

import type { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import {
  BONE, GLINT, HI, IDLE_FPS, IDLE_FRAMES, INDIGO, INK, KAY, KW, KX, LO, MAIL, PINK, PLUM, ROBE, SKIN4, SPARK, STAND, STEEL, TEAL, TURN,
  along, ball, blend, compose, dim, hash, inEllipse, joint, layer, leg, limb, lit, posed, shear, shearBy, slant, stroke,
} from './kit';
import type { LegStyle, Painted, Pose, Ramp, V } from './kit';
import { IRON } from './mkit';
import { EMBER, GOLD } from './props';
import { SMITH3, makeSmith3 } from './smith3';

const SKIN: Ramp = [SKIN4[0], SKIN4[0], SKIN4[1], SKIN4[2], SKIN4[3]];

/** A bare hand: a small ball of skin. */
function hand(p: Px, x: number, y: number): void {
  ball(p, x, y, 2.2, 2.1, SKIN);
}

/** Which of an arm's two possible elbows is the lower one on the screen (an arm hangs: its elbow is down). */
function elbowLow(s: V, h: V, upper: number, lower: number): V {
  const a = joint(s, h, upper, lower, 1);
  const b = joint(s, h, upper, lower, -1);
  return a[1] >= b[1] ? a : b;
}

/** ... and the one that is further out to one side (-1 screen-left, +1 screen-right). */
function elbowOut(s: V, h: V, upper: number, lower: number, out: -1 | 1): V {
  const a = joint(s, h, upper, lower, 1);
  const b = joint(s, h, upper, lower, -1);
  return (a[0] - b[0]) * out >= 0 ? a : b;
}

/** Paint a pixel only where the layer already has one (a mark ON a thing, never beside it). */
function mark(p: Px, x: number, y: number, color: string): void {
  if (p.has(x, y)) p.set(x, y, color);
}

const ease = (t: number): number => t * t * (3 - 2 * t);
const mixN = (a: number, b: number, t: number): number => a + (b - a) * t;
const clamp01 = (t: number): number => Math.max(0, Math.min(1, t));

/**
 * THE WAYS ONE OF THEM CAN FACE (the owner, 5 Oct 2026, 21:20: "Let's have them face their tables
 * or anvils, but turn to face you when you get very close"). The four ways along the grid, named
 * by where on the screen each looks: 'se' down and to the right, 'sw' down and to the left, 'ne'
 * up and to the right, 'nw' up and to the left. Each of them has a way they face to work
 * (Townsman.work), in which they stand in their loop and now and then do what they do; turned
 * any other way they only stand in the loop.
 *
 * The kit paints a figure facing right: toward us ('se') or away from us ('ne'). Each rig below
 * paints those two (its comments are written facing right), and the other two are those turned
 * about (`facingLeft`), as a hero is who faces left.
 */
export type Facing = 'se' | 'sw' | 'ne' | 'nw';
export const FACINGS: readonly Facing[] = ['se', 'sw', 'ne', 'nw'];
/** Seen from behind: facing up the screen. */
const awayOf = (to: Facing): boolean => to === 'ne' || to === 'nw';

/**
 * A figure painted facing right, turned to face LEFT: mirrored about the line it stands on, its
 * lights with it.
 */
function facingLeft(px: Px, lights: Light[]): Painted {
  return { px: layer().blit(px, 2 * KX - KW, 0, true), lights: lights.map((l) => ({ ...l, x: 2 * KX - l.x })) };
}

/** A figure painted facing right, as it is to be seen facing `to`. */
function faced(to: Facing, px: Px, lights: Light[]): Painted {
  return to === 'sw' || to === 'nw' ? facingLeft(px, lights) : { px, lights };
}

// ---------------------------------------------------------------------------------------------
// The armourer: a smith. Bald, with a great pale beard; a teal shirt with the sleeves rolled, a
// leather apron; one fist on his hip, and in the other hand a hammer, held upright. Now and then
// he brings it down on the anvil that stands before him, and sparks fly.
//
// He is SEEN FROM A CORNER (kit.ts, "Turned to the grid"), as everything in the game is, and HE
// FACES HIS ANVIL, which stands a tile nearer than he does and to screen-left: so he faces down
// the screen and to the left. He is painted as the kit paints, facing right, with the anvil to
// his right (everything below is said that way round), and turned at the end (`facingLeft`). The
// fist on his hip is his nearer arm's; the hammer is in the further hand, which is the one toward
// the anvil.

const A_LEGS: LegStyle = { w: 5, upper: INDIGO, lower: PLUM, share: 0.48, cuff: true, knee: null, band: null };

interface Swing { hx: number; hy: number; ang: number }

/**
 * Where the hammer is in a strike: the hand, from its place at rest, and the way the handle
 * points (degrees: 90 straight up, 0 to screen-right, -90 down). `hit` is 0 except while the
 * head is on the anvil, when it runs 0..1.
 */
function strike(a: number): Swing & { hit: number } {
  const rest: Swing = { hx: 0, hy: 0, ang: 90 };
  // (raised beside his head and a little behind it, clear of his face)
  const up: Swing = { hx: -1, hy: -17, ang: 102 };
  // (The anvil's face is 32 picture pixels to the right of his feet and 13 above them, and the
  // anvil is drawn over him. The head comes down ON that face: its lower edge at the face, so
  // that all of it is seen.)
  const down: Swing = { hx: 4, hy: 0, ang: -25 };
  const go = (p: Swing, q: Swing, t: number): Swing => ({ hx: mixN(p.hx, q.hx, t), hy: mixN(p.hy, q.hy, t), ang: mixN(p.ang, q.ang, t) });
  if (a <= 0 || a >= 1) return { ...rest, hit: 0 };
  if (a < 0.34) return { ...go(rest, up, ease(a / 0.34)), hit: 0 };
  if (a < 0.48) {
    const t = (a - 0.34) / 0.14;
    return { ...go(up, down, t * t), hit: 0 };
  }
  if (a < 0.66) return { ...down, hy: down.hy - (a < 0.54 ? 1 : 0), hit: (a - 0.48) / 0.18 };
  // (it comes up off the anvil quickly and settles slowly)
  return { ...go(down, rest, 1 - (1 - (a - 0.66) / 0.34) ** 2.4), hit: 0 };
}

function armourer(q: Pose, to: Facing = 'sw'): Painted {
  if (awayOf(to)) return armourerAway(q, to);
  const lights: Light[] = [];
  const Y = Math.round(q.bob);
  const X = KX;
  const ph = q.wind * Math.PI * 2;
  const sw = strike(q.act);
  const striking = sw.ang < 30;
  // (he puts his back into it: the shoulders go with the hammer)
  const turn = Math.round(sw.hx * 0.4);
  /** Floor to the top of the shoulders. */
  const sy = KAY - 40 + Y + (striking ? 1 : 0);
  const hip = KAY - 17;
  // seen from a corner: the corner of his body nearest us is toward his nearer side, and what
  // runs across him is lowest there; his middle line and his face are toward the side he faces
  const lean = slant(X - 5, 2);
  const mid = X + TURN + turn;
  const back = layer();
  const legs = layer();
  const body = layer();
  const head = layer();
  const near = layer();
  const over = layer();

  // --- legs: planted, a little apart, the nearer foot lower on the screen, both pointing along the grid ---
  leg(legs, X + 2, hip - 1, KAY - 3, true, A_LEGS, STAND, 3, 1);
  leg(legs, X - 7, hip, KAY - 1, false, A_LEGS, STAND, 3, 1);

  // --- the shirt (broad shoulders, a round belly) and the apron over it: a bib on two straps, tied at the waist, a skirt to the knees ---
  const waist = sy + 14;
  {
    const t = layer();
    lit(t, TEAL, HI, LO, (l) => l.poly([[X - 10 + turn, sy + 1], [X - 7 + turn, sy - 1], [X + 7 + turn, sy - 1], [X + 10 + turn, sy + 1], [X + 9, hip + 2], [X - 9, hip + 2]], INK));
    lit(t, PLUM, HI, LO, (l) => {
      l.rect(mid - 5, sy + 5, 10, waist - sy - 5, INK);
      l.poly([[X - 8, waist], [X + 8, waist], [X + 9, KAY - 11], [X - 9, KAY - 11]], INK);
    });
    for (const x of [mid - 5, mid + 4]) t.vline(x, sy, 5, PLUM[1]);
    t.hline(X - 8, waist, 16, PLUM[0]);
    t.hline(X - 9, KAY - 12, 18, PLUM[0]);
    // (a pocket with a punch in it, and the scorch marks of the trade)
    t.rect(mid - 1, waist + 4, 6, 1, PLUM[0]).vline(mid - 1, waist + 4, 5, PLUM[0]).vline(mid + 4, waist + 4, 5, PLUM[0]);
    t.vline(mid + 1, waist + 1, 4, STEEL[3]).vline(mid + 2, waist + 2, 3, STEEL[2]);
    for (const [dx, dy] of [[-8, 7], [-7, 9], [-9, 10]] as const) mark(t, mid + dx, waist + dy, PLUM[0]);
    shear(t, lean, body);
  }

  // --- the head: bald, a tuft over the ear we see, heavy brows, and the eyes in their shadow ---
  const cx = X + turn;
  const cy = sy - 7;
  const fx = cx + TURN;
  ball(head, cx, cy, 6.2, 6.4, SKIN);
  const ey = Math.round(cy) + 1;
  for (const [x, y] of inEllipse(cx, cy, 6.2, 6.4)) if (y >= ey - 1 && y <= ey && x >= fx - 6) head.set(x, y, INK);
  head.set(fx - 3, ey, GLINT).set(fx + 2, ey, GLINT);
  for (let i = 0; i < 4; i++) mark(head, fx - 5 + i, ey - 2, BONE[3]);
  for (let i = 0; i < 3; i++) mark(head, fx + 1 + i, ey - 2, BONE[3]);
  // (his ear, on the side of his head that is toward us, and the tuft of hair over and behind it)
  head.rect(cx - 5, cy - 1, 2, 3, SKIN[1]);
  head.rect(cx - 7, cy - 2, 2, 5, BONE[3]).set(cx - 5, cy - 2, BONE[3]).set(cx - 4, cy - 2, BONE[2]);
  head.rect(fx - 1, ey + 1, 2, 2, SKIN[3]);
  // --- the beard: from the cheeks to the middle of the chest, its end stirring (the chin it hangs from is toward the side he faces) ---
  const sway = Math.sin(ph) * 1.2 - sw.hx * 0.3;
  const m = cx + 2;
  lit(head, BONE, HI, LO, (l) =>
    l.poly([[m - 8, ey + 1], [m - 2, ey + 3], [m + 2, ey + 3], [m + 5.5, ey + 1], [m + 5, ey + 9], [m + 2 + sway * 0.5, ey + 15], [m + sway, ey + 18], [m - 3 + sway * 0.5, ey + 14], [m - 7, ey + 9]], INK),
  );
  // (the mouth, lost in it; and the locks of it)
  head.hline(fx - 1, ey + 5, 3, BONE[1]);
  for (const [dx, y0, n] of [[-3, 7, 6], [2, 8, 5], [0, 11, 5]] as const) for (let i = 0; i < n; i++) mark(head, m + dx + Math.round((sway * i) / 8), ey + y0 + i, BONE[2]);

  // --- the nearer arm, on screen-left and the lower: the fist on the hip, the elbow out ---
  const nShoulder: V = [X - 9 + turn, sy + 6];
  const nHand: V = [X - 8, sy + 18];
  const nElbow = elbowOut(nShoulder, nHand, 7.5, 7.5, -1);
  limb(near, nShoulder[0], nShoulder[1], nElbow[0], nElbow[1], 3.2, 3, TEAL);
  limb(near, nElbow[0], nElbow[1], nHand[0], nHand[1], 2.6, 2.3, SKIN);
  hand(near, nHand[0], nHand[1]);

  // --- the hammer arm, the further one, on screen-right and the higher: the sleeve rolled above the elbow ---
  const hShoulder: V = [X + 9 + turn, sy + 2];
  const hHand: V = [X + 16 + sw.hx, sy + 15 + sw.hy];
  const hElbow = striking ? elbowOut(hShoulder, hHand, 7.5, 7.5, 1) : elbowLow(hShoulder, hHand, 7.5, 7.5);
  // the hammer: a long handle and an iron head, worn bright on its face
  const rad = (sw.ang * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = -Math.sin(rad);
  const bx = hHand[0] - dx * 3;
  const by = hHand[1] - dy * 3;
  const tx = hHand[0] + dx * 13;
  const ty = hHand[1] + dy * 13;
  // (it and the arm that holds it are behind him, except as it comes down before him onto the anvil)
  const arms = striking ? near : back;
  limb(arms, bx, by, tx, ty, 1.2, 1.2, PLUM);
  const hcx = hHand[0] + dx * 15;
  const hcy = hHand[1] + dy * 15;
  // (the head lies across the handle: six each way along it, four each way through it)
  const nx = -dy;
  const ny = dx;
  const corner = (u: number, v: number): [number, number] => [Math.round(hcx + nx * u + dx * v), Math.round(hcy + ny * u + dy * v)];
  lit(arms, IRON, HI, LO, (l) => l.poly([corner(-6, -4), corner(6, -4), corner(6, 4), corner(-6, 4)], INK));
  for (let k = -5; k <= 5; k++) {
    const [x, y] = corner(k, 4);
    mark(arms, x, y, STEEL[2]);
  }
  limb(arms, hShoulder[0], hShoulder[1], hElbow[0], hElbow[1], 3.2, 3, dim(TEAL));
  limb(arms, hElbow[0], hElbow[1], hHand[0], hHand[1], 2.6, 2.3, SKIN);
  hand(arms, hHand[0], hHand[1]);

  // --- sparks, where the head comes down ---
  if (sw.hit > 0) {
    const fly = sw.hit;
    const sx = hcx + dx * 4;
    const sy2 = hcy + dy * 4;
    const tone = fly < 0.3 ? EMBER[4] : fly < 0.65 ? EMBER[3] : EMBER[2];
    for (let j = 0; j < 7; j++) {
      const a = Math.PI * (0.12 + (j * 0.76) / 6);
      const far2 = 3 + fly * (8 + (j % 3) * 3);
      over.set(Math.round(sx + Math.cos(a) * far2), Math.round(sy2 - Math.sin(a) * far2 + fly * fly * 5), tone);
    }
    if (fly < 0.35) over.rect(Math.round(sx) - 1, Math.round(sy2) - 1, 3, 3, EMBER[4]);
    lights.push({ x: sx, y: sy2, r: 6 + 12 * (1 - fly), color: EMBER[2], a: 0.55 * (1 - fly) });
  }

  return faced(to, compose(null, [back, legs, body, head, near], over), lights);
}

/**
 * The armourer from behind (he has turned to someone who came up on his far side): painted
 * facing up the screen and to the right. The back of his shirt, the strap of his apron round
 * his neck and its strings tied in a bow at the small of his back, its two edges coming round
 * his hips; the back of his bald head, with the hair that is left to him round it. The hammer is
 * in the same hand of his as ever, which from here is the one on screen-left and the further;
 * the fist on his hip is the nearer.
 */
function armourerAway(q: Pose, to: Facing): Painted {
  const Y = Math.round(q.bob);
  const X = KX;
  const sy = KAY - 40 + Y;
  const hip = KAY - 17;
  const waist = sy + 14;
  // (seen from behind, the corner of his body nearest us is toward screen-right, and his spine is away from the side he faces)
  const lean = slant(X + 5, 2);
  const mid = X - TURN;
  const back = layer();
  const legs = layer();
  const body = layer();
  const head = layer();
  const near = layer();

  // --- legs: the heels toward us, the nearer foot (on screen-right) the lower ---
  leg(legs, X - 7, hip - 1, KAY - 3, true, A_LEGS, STAND, 0, -1);
  leg(legs, X + 2, hip, KAY - 1, false, A_LEGS, STAND, 0, -1);

  // --- the shirt's back, and what is seen of the apron from behind ---
  {
    const t = layer();
    lit(t, TEAL, HI, LO, (l) => l.poly([[X - 10, sy + 1], [X - 7, sy - 1], [X + 7, sy - 1], [X + 10, sy + 1], [X + 9, hip + 2], [X - 9, hip + 2]], INK));
    // (the crease down his back, and his shoulder blades)
    for (let y = sy + 3; y < waist - 1; y++) mark(t, mid, y, TEAL[1]);
    for (const dx of [-5, 4]) for (let i = 0; i < 4; i++) mark(t, mid + dx + (dx < 0 ? -1 : 1) * (i > 1 ? 1 : 0), sy + 4 + i, TEAL[1]);
    // the strap round his neck; the strings round his waist, tied in a bow; the apron's edges at his hips
    for (let x = mid - 3; x <= mid + 3; x++) mark(t, x, sy, PLUM[2]);
    for (let x = X - 9; x <= X + 9; x++) {
      mark(t, x, waist, PLUM[2]);
      mark(t, x, waist + 1, PLUM[0]);
    }
    for (const [dx, dy] of [[-2, -1], [-3, 0], [-2, 1], [2, -1], [3, 0], [2, 1], [0, 0], [-1, 2], [-2, 4], [1, 2], [2, 5]] as const) mark(t, mid + dx, waist + dy, PLUM[3]);
    for (let y = waist + 2; y <= hip + 2; y++) {
      mark(t, X - 9, y, PLUM[2]);
      mark(t, X - 8, y, PLUM[1]);
      mark(t, X + 8, y, PLUM[2]);
      mark(t, X + 7, y, PLUM[1]);
    }
    shear(t, lean, body);
  }

  // --- the back of his head: bald, the hair that is left to him low round it from ear to ear ---
  const cx = X;
  const cy = sy - 7;
  ball(head, cx, cy, 6.2, 6.4, SKIN);
  for (const [x, y] of inEllipse(cx, cy, 6.2, 6.4)) if (y >= cy + 1 && y <= cy + 4) head.set(x, y, y === Math.round(cy) + 1 || (x + y) % 3 === 0 ? BONE[2] : BONE[3]);
  head.rect(cx - 8, cy - 1, 2, 4, BONE[3]).rect(cx + 6, cy - 1, 2, 4, BONE[2]);
  // (the end of his beard shows past his jaw, on the side he is turned to)
  head.rect(cx + 4, cy + 5, 3, 3, BONE[2]).set(cx + 5, cy + 8, BONE[1]);

  // --- the hammer arm, the further one, on screen-left and the higher: the hammer upright at his side ---
  const hShoulder: V = [X - 9, sy + 2];
  const hHand: V = [X - 16, sy + 15];
  const hElbow = elbowLow(hShoulder, hHand, 7.5, 7.5);
  limb(back, hHand[0], hHand[1] + 3, hHand[0], hHand[1] - 13, 1.2, 1.2, PLUM);
  lit(back, IRON, HI, LO, (l) => l.rect(hHand[0] - 6, hHand[1] - 19, 12, 8, INK));
  for (let k = -5; k <= 5; k++) mark(back, hHand[0] + k, hHand[1] - 19, STEEL[2]);
  limb(back, hShoulder[0], hShoulder[1], hElbow[0], hElbow[1], 3.2, 3, dim(TEAL));
  limb(back, hElbow[0], hElbow[1], hHand[0], hHand[1], 2.6, 2.3, SKIN);
  hand(back, hHand[0], hHand[1]);

  // --- the nearer arm, on screen-right and the lower: the fist on the hip, the elbow out ---
  const nShoulder: V = [X + 9, sy + 6];
  const nHand: V = [X + 8, sy + 18];
  const nElbow = elbowOut(nShoulder, nHand, 7.5, 7.5, 1);
  limb(near, nShoulder[0], nShoulder[1], nElbow[0], nElbow[1], 3.2, 3, TEAL);
  limb(near, nElbow[0], nElbow[1], nHand[0], nHand[1], 2.6, 2.3, SKIN);
  hand(near, nHand[0], nHand[1]);

  return faced(to, compose(null, [back, legs, body, head, near]), []);
}

// ---------------------------------------------------------------------------------------------
// The mystic: a seller of charms. A long robe of the mage's purple with a sash of gold, chains of
// gold round the neck; a great pale turban with a stone in it, and a veil under the eyes. Over
// the open palm of one hand a crystal hangs in the air and turns; now and then the other hand
// passes over it, and it flares.

/**
 * The mystic's flourish: the crystal lifts off the palm, swells and blazes, and settles again,
 * while the other hand opens out at his side (never across his face). `rise` is how far the
 * crystal has lifted, `flare` how bright it is (0..1), and (x, y) where the free hand has got
 * to from its place at rest.
 */
function pass(a: number): { x: number; y: number; flare: number; rise: number } {
  if (a <= 0 || a >= 1) return { x: 0, y: 0, flare: 0, rise: 0 };
  const open = ease(clamp01(a / 0.25)) * (1 - ease(clamp01((a - 0.75) / 0.25)));
  const flare = Math.sin(Math.PI * clamp01((a - 0.15) / 0.7));
  return { x: 6 * open, y: -11 * open, flare, rise: flare * 8 };
}

function mystic(q: Pose, to: Facing = 'sw'): Painted {
  const away = awayOf(to);
  const lights: Light[] = [];
  const Y = Math.round(q.bob);
  const X = KX;
  const ph = q.wind * Math.PI * 2;
  const ps = pass(q.act);
  const sy = KAY - 40 + Y;
  const hem = KAY - 1;
  const waist = sy + 16;
  // SEEN FROM A CORNER (kit.ts, "Turned to the grid"), AND FACING HIS TABLE, which stands before
  // him to screen-left: so he faces down the screen and to the left. He is painted as the kit
  // paints, facing right (everything below is said that way round), and turned at the end
  // (`facingLeft`). The crystal is over his further hand, the one toward the table's end; the
  // hand that lies on his wares is his nearer one.
  //
  // FROM BEHIND (`away`: he has turned to someone on his far side) he is painted facing up the
  // screen and to the right: the back of the robe, the sash without its knot, the end of the
  // turban hanging down his back, the veil's band tied behind his head. The crystal is over the
  // same hand of his, which from here is on screen-left; the corner of his body nearest us is
  // toward screen-right.
  const side = away ? -1 : 1;
  const lean = slant(X - 4 * side, 2);
  const mid = X + TURN * side;
  const back = layer();
  const body = layer();
  const head = layer();
  const wrap = layer();
  const sleeves = layer();
  const over = layer();

  // --- the robe: narrow at the shoulders, wide at the floor. Its shoulders, its chains and its sash run along the grid; its hem, which is round, does not ---
  if (away) {
    const t = layer();
    lit(t, ROBE, HI, LO, (l) => l.poly([[X - 8, sy + 1], [X - 5, sy - 1], [X + 5, sy - 1], [X + 8, sy + 1], [X + 12, hem], [X - 12, hem]], INK));
    for (const [dx, from] of [[-8, 22], [-4, 19], [2, 25], [7, 21]] as const) for (let y = sy + from; y < hem - 1; y++) mark(t, X + dx, y, ROBE[1]);
    for (let y = sy + 3; y < waist - 1; y++) mark(t, mid, y, ROBE[1]);
    for (let x = X - 12; x <= X + 12; x++) mark(t, x, hem - 1, x % 2 === 0 ? GOLD[3] : GOLD[2]);
    for (let x = X - 12; x <= X + 12; x += 4) mark(t, x, hem - 3, GOLD[2]);
    for (let x = X - 10; x <= X + 10; x++) {
      mark(t, x, waist, GOLD[3]);
      mark(t, x, waist + 1, GOLD[2]);
      mark(t, x, waist + 2, GOLD[0]);
    }
    // (the chains go round the back of his neck: one line of gold at the collar)
    for (let x = mid - 4; x <= mid + 4; x++) mark(t, x, sy + (Math.abs(x - mid) > 2 ? 0 : 1), GOLD[3]);
    shearBy(t, (x, y) => Math.round(lean(x) * clamp01((hem - 3 - y) / (hem - 3 - (waist + 4)))), body);
  } else {
    const t = layer();
    lit(t, ROBE, HI, LO, (l) => l.poly([[X - 8, sy + 1], [X - 5, sy - 1], [X + 5, sy - 1], [X + 8, sy + 1], [X + 12, hem], [X - 12, hem]], INK));
    // its folds, and a border of gold along the hem
    for (const [dx, from] of [[-7, 20], [-3, 24], [5, 22], [9, 26]] as const) for (let y = sy + from; y < hem - 1; y++) mark(t, X + dx, y, ROBE[1]);
    for (let x = X - 12; x <= X + 12; x++) mark(t, x, hem - 1, x % 2 === 0 ? GOLD[3] : GOLD[2]);
    for (let x = X - 12; x <= X + 12; x += 4) mark(t, x, hem - 3, GOLD[2]);
    // the sash: gold, knotted toward the side he faces, its ends hanging
    for (let x = X - 10; x <= X + 10; x++) {
      mark(t, x, waist, GOLD[3]);
      mark(t, x, waist + 1, GOLD[2]);
      mark(t, x, waist + 2, GOLD[0]);
    }
    t.rect(mid + 1, waist + 3, 2, 9, GOLD[2]).vline(mid + 1, waist + 3, 9, GOLD[3]);
    t.rect(mid + 4, waist + 3, 2, 6, GOLD[2]).vline(mid + 4, waist + 3, 6, GOLD[3]);
    // chains round the neck: two loops of gold, a stone on the lower
    for (let i = 0; i <= 12; i++) {
      const u = i / 12;
      mark(t, Math.round(mid - 5 + 10 * u), Math.round(sy + 2 + 4 * Math.sin(u * Math.PI)), GOLD[3]);
      mark(t, Math.round(mid - 6 + 12 * u), Math.round(sy + 3 + 8 * Math.sin(u * Math.PI)), GOLD[2]);
    }
    t.rect(mid - 1, sy + 10, 2, 3, PINK[2]);
    t.set(mid - 1, sy + 10, PINK[4]);
    // (all of the lean at his shoulders and down to the sash, and none of it by the hem)
    shearBy(t, (x, y) => Math.round(lean(x) * clamp01((hem - 3 - y) / (hem - 3 - (waist + 4)))), body);
  }

  // --- the head: the eyes in the shadow of the turban, a veil under them; all of his face toward the side he faces ---
  const cx = X;
  const cy = sy - 7;
  const fx = cx + TURN - 1;
  const ey = Math.round(cy) + 1;
  if (away) {
    // (the back of it: the dark of his hair under the turban, and the veil's band tied behind, its two ends hanging)
    ball(head, cx, cy, 5.6, 6, SKIN);
    for (const [x, y] of inEllipse(cx, cy, 5.6, 6)) if (y <= ey + 1) head.set(x, y, INK);
    for (const [x, y] of inEllipse(cx, cy, 5.6, 6)) if (y >= ey + 1 && y <= ey + 2) head.set(x, y, y === ey + 1 ? TEAL[3] : TEAL[2]);
    head.rect(cx - 2, ey + 1, 3, 3, TEAL[3]).vline(cx - 3, ey + 3, 4, TEAL[2]).vline(cx + 1, ey + 3, 5, TEAL[2]);
  } else {
    ball(head, cx, cy, 5.6, 6, SKIN);
    // (two rows of the face are seen, between the turban and the veil, and they are in the turban's shadow)
    for (const [x, y] of inEllipse(cx, cy, 5.6, 6)) if (y <= ey) head.set(x, y, INK);
    head.set(fx - 3, ey - 1, GLINT).set(fx + 2, ey - 1, GLINT);
    lit(head, TEAL, HI, LO, (l) => l.poly([[cx - 6, ey + 1], [cx + 6, ey + 1], [cx + 6, ey + 7], [fx + 1, ey + 11], [cx - 4, ey + 8]], INK));
    for (let x = cx - 5; x <= cx + 5; x += 2) mark(head, x, ey + 1, GOLD[3]);
    for (let x = cx - 4; x <= cx + 4; x += 2) mark(head, x, ey + 3, GOLD[2]);
  }
  // --- the turban: wider than the head, wound across and across, a stone at its front, an end hanging behind his nearer shoulder (down the middle of his back, from behind) ---
  lit(wrap, BONE, HI, LO, (l) => {
    l.ellipse(cx, cy - 8, 9, 5.6, INK);
    l.ellipse(cx, cy - 12, 5.5, 3.4, INK);
  });
  for (let i = -8; i <= 8; i += 4) for (let k = 0; k < 9; k++) mark(wrap, cx + i + Math.round(k * 0.6) * side, cy - 4 - k, BONE[1]);
  if (away) lit(wrap, BONE, HI, LO, (l) => l.poly([[mid - 1, cy - 5], [mid + 3, cy - 5], [mid + 4 + Math.sin(ph) * 0.8, cy + 12], [mid, cy + 11]], INK));
  else {
    lit(wrap, BONE, HI, LO, (l) => l.poly([[cx - 6, cy - 6], [cx - 9, cy - 6], [cx - 10, cy + 5 + Math.sin(ph) * 0.8], [cx - 7, cy + 4]], INK));
    wrap.rect(fx - 1, cy - 9, 3, 3, PINK[2]);
    wrap.set(fx - 1, cy - 9, PINK[4]).set(fx + 1, cy - 7, PINK[0]);
    wrap.hline(fx - 2, cy - 6, 5, GOLD[3]);
  }

  // --- the further arm (on screen-right and the higher when he faces us; on screen-left when he faces away): bent up, the palm open; and the crystal over it ---
  const cShoulder: V = [X + 8 * side, sy + 2];
  const cHand: V = [X + 16 * side, sy + 5];
  const cElbow = elbowLow(cShoulder, cHand, 7, 7);
  limb(back, cShoulder[0], cShoulder[1], cElbow[0], cElbow[1], 3, 3.6, dim(ROBE));
  limb(back, cElbow[0], cElbow[1], cHand[0] - side, cHand[1], 3.6, 4.2, dim(ROBE));
  back.rect(Math.round(cHand[0]) - 3, Math.round(cHand[1]) - 1, 6, 2, SKIN[3]).hline(Math.round(cHand[0]) - 2, Math.round(cHand[1]) + 1, 5, SKIN[1]);
  // (a bangle at the wrist)
  back.vline(Math.round(cHand[0]) - 4 * side, Math.round(cHand[1]) - 2, 5, GOLD[3]);
  const lift = Math.round(Math.sin(ph) * 1.6 + ps.rise);
  const ox = Math.round(cHand[0]) - side;
  const oy = Math.round(cHand[1]) - 12 - lift;
  const big = 4 + ps.flare * 2.2;
  ball(over, ox + 0.5, oy, big, big, SPARK);
  // (it turns: a facet of light goes across it)
  const facet = Math.round(Math.cos(ph) * (big - 1.5));
  over.vline(ox + facet, oy - 2, 4, '#ffffff');
  over.set(ox + 2, oy - 2, '#ffffff');
  // (motes round it; more of them, further out and going round, when it blazes; and then rays)
  const motes = ps.flare > 0.2 ? 6 : 3;
  for (let j = 0; j < motes; j++) {
    // (in the flourish they go twice more round, and are back where they began when it ends:
    // exactly, which two whole turns reckoned in floating point are not)
    const a = ph + (q.act > 0 && q.act < 1 ? q.act * Math.PI * 4 : 0) + (j * Math.PI * 2) / motes;
    const far = big + 3 + ps.flare * 4;
    over.set(Math.round(ox + Math.cos(a) * far), Math.round(oy + Math.sin(a) * far * 0.8), j % 2 === 0 ? SPARK[3] : SPARK[4]);
  }
  if (ps.flare > 0.6) {
    for (const [rx, ry] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
      const from = big + 2;
      const to = big + 2 + (ps.flare - 0.6) * 14;
      for (let d = from; d <= to; d++) over.set(Math.round(ox + rx * d), Math.round(oy + ry * d), d > to - 1.5 ? SPARK[2] : SPARK[3]);
    }
  }
  lights.push({ x: ox + 0.5, y: oy, r: 13 + ps.flare * 9 + Math.sin(ph) * 1.2, color: SPARK[2], a: 0.4 + ps.flare * 0.25 });

  // --- the nearer arm, the lower (on screen-left when he faces us; on screen-right when he faces away): at rest the hand lies before him, on his wares; in the flourish it opens out at his side ---
  const pShoulder: V = [X - 8 * side, sy + 6];
  const pHand: V = [X - (11 + ps.x) * side, sy + 17 + ps.y];
  const pElbow = elbowLow(pShoulder, pHand, 7, 7);
  limb(sleeves, pShoulder[0], pShoulder[1], pElbow[0], pElbow[1], 3, 3.6, ROBE);
  limb(sleeves, pElbow[0], pElbow[1], pHand[0], pHand[1], 3.6, 4.2, ROBE);
  if (ps.y < -5) {
    // (the palm, turned up)
    sleeves.rect(Math.round(pHand[0]) - (side > 0 ? 4 : 2), Math.round(pHand[1]) - 2, 6, 2, SKIN[3]).hline(Math.round(pHand[0]) - (side > 0 ? 3 : 2), Math.round(pHand[1]), 5, SKIN[1]);
  } else hand(sleeves, pHand[0] - side, pHand[1] + 2);
  sleeves.vline(Math.round(pHand[0]) + 2 * side, Math.round(pHand[1]) - 2, 5, GOLD[3]);

  return faced(to, compose(null, [back, body, head, wrap, sleeves], over), lights);
}

// ---------------------------------------------------------------------------------------------
// The wordsmith: THE OLD SKALD. The owner: "I want him to be very runic." And of the first one (a
// hooded figure in a pale robe), on 5 Oct 2026: "I'm not happy with the wordsmith's look. Can I get
// 10 options and I'll choose." He was given ten, then ten more ("more like 5, 2, and 7"), and
// picked number 12 of the twenty: "12 for sure". This is that figure (dev/options_wordsmith2.ts is
// the sheet he chose it from), given a loop and an act. He is also the start screen's picture.
//
// White hair to his shoulders under a band of steel with a stone in it; a white beard to his belt;
// a brown pelt across his shoulders over a teal cloak; a tunic the blue of mail, belted, a horn at
// the belt; boots. In his nearer hand a stave taller than he is, runes cut down it, a ring at its
// head with a rune alight in it. He is SEEN FROM A CORNER (kit.ts, "Turned to the grid"), as
// everything in the game is: he faces down the screen and to the LEFT, toward his slab (he is
// painted facing right and turned at the end: see the last lines of `wordsmith`).
//
// His loop: he breathes; the runes down his stave light one after another, and the one in its
// ring burns up and dies down; three rune stones go slowly round him in the air; and he is saying
// the words over under his breath: a small rune leaves his mouth, rises and thins away, and then
// another. Now and then (the act) he lifts his open hand and writes a great rune on the air, the
// ring of the stave blazes, and the rune rises and is gone.
//
// His loop is three times as long as the others' (the stones go once round in it).

export const WORDSMITH_FRAMES = IDLE_FRAMES * 3;

/** The runes of the stave, the stones and his song: a few strokes on a 3 x 5 grid. */
const SMALL_RUNES: ReadonlyArray<ReadonlyArray<string>> = [
  ['#.#', '#.#', '.#.', '.#.', '.#.'],
  ['#..', '##.', '#.#', '##.', '#..'],
  ['.#.', '###', '.#.', '#.#', '#.#'],
  ['##.', '..#', '.#.', '#..', '.##'],
  ['#.#', '.#.', '#.#', '.#.', '.#.'],
  ['.#.', '#.#', '#.#', '.#.', '###'],
];

function smallRune(p: Px, k: number, x: number, y: number, color: string): void {
  const rows = SMALL_RUNES[((k % SMALL_RUNES.length) + SMALL_RUNES.length) % SMALL_RUNES.length];
  for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (rows[j][i] === '#') p.set(x + i, y + j, color);
}

/** The great rune he writes on the air: its strokes in the order he makes them, on a 9 x 13 grid. */
const GREAT_RUNE: ReadonlyArray<readonly [number, number, number, number]> = [
  [4, 0, 4, 12],
  [0, 3, 4, 0],
  [8, 3, 4, 0],
  [1, 9, 7, 5],
  [1, 5, 7, 9],
];

/** His hair and his beard: white. His pelt: brown, so that hair, beard and fur do not run together. */
const SKALD_HAIR: Ramp = BONE;
const SKALD_PELT: Ramp = blend(PLUM, BONE, 0.3);
const SKALD_BOOTS: LegStyle = { w: 5, upper: INDIGO, lower: PLUM, share: 0.5, cuff: true, knee: null, band: BONE };

function wordsmith(q: Pose, to: Facing = 'sw'): Painted {
  if (awayOf(to)) return wordsmithAway(q, to);
  const lights: Light[] = [];
  const Y = Math.round(q.bob);
  const X = KX;
  const round = q.wind * Math.PI * 2;
  const a = q.act;
  const acting = a > 0 && a < 1;
  // --- how he is built: his shoulders 42 above the floor, his belt 25; a chest 8 either side; a head of 6 ---
  const top = KAY - 42; // (where his shoulders are when he has breathed out: his stave is measured from here, and does not rise and fall with him)
  const sy = top + Y;
  const beltY = KAY - 25 + Y;
  const r = 6;
  const cx = X - 0.5;
  const cy = sy - 2 - r + 1;
  // seen from a corner: the corner of his body nearest us is toward his nearer side, everything
  // across him is lowest there; his middle line and his face are toward the side he faces
  const lean = slant(X - 4, 2);
  const mid = X + TURN;
  const fx = Math.round(cx) + TURN;
  const nearS: V = [X - 7, sy + 5];
  const farS: V = [X + 7, sy];
  const turned = (onto: Px, paint: (t: Px) => void): void => {
    const t = layer();
    paint(t);
    shear(t, lean, onto);
  };
  const armTo = (p: Px, sh: V, h: V, upper: Ramp, lower: Ramp, out: -1 | 1): V => {
    const e = elbowOut(sh, h, 7.5, 7.5, out);
    limb(p, sh[0], sh[1], e[0], e[1], 3, 2.8, upper);
    limb(p, e[0], e[1], h[0], h[1], 2.8, 2.5, lower);
    return e;
  };

  const back = layer();
  const body = layer();
  const front = layer();
  const mantle = layer();
  const head = layer();
  const hands = layer();
  const ring = layer();
  const over = layer();

  // --- the cloak down his back to the calf (it hangs behind him: its hem runs the way his shoulders do, and stirs) ---
  {
    const end = KAY - 7;
    const t = layer();
    lit(t, TEAL, HI, LO, (l) => {
      for (let y = sy + 2; y <= end; y++) {
        const half = 10 + ((y - sy) * 5) / (end - sy);
        for (let x = Math.round(X - half); x < Math.round(X + half); x++) {
          if (y <= end - 1 - Math.floor(hash(x, 3) * 3) + Math.round(Math.sin(round * 2 + x * 0.7) * 0.6)) l.set(x, y, INK);
        }
      }
    });
    for (const dx of [-11, 10]) for (let y = sy + 12; y < end - 3; y++) mark(t, X + dx + Math.round(((y - sy) * dx) / 90), y, TEAL[1]);
    shear(t, along(X, -1), back);
  }

  // --- his legs: boots, the nearer foot lower on the screen, both pointing down the screen and to the right ---
  leg(body, KX + 1, KAY - 18 + Y, KAY - 3, true, SKALD_BOOTS, STAND, 3, 1);
  leg(body, KX - 1 - SKALD_BOOTS.w, KAY - 17 + Y, KAY - 1, false, SKALD_BOOTS, STAND, 3, 1);

  // --- the further arm: at rest the hand is open before him, as a man's is who is telling a thing; in the act it writes ---
  const write = acting ? ease(clamp01(a / 0.15)) * (1 - ease(clamp01((a - 0.85) / 0.15))) : 0;
  const strokes = GREAT_RUNE.length;
  const gx0 = X + 15;
  const gy0 = top - 17;
  const open: V = [X + 13, sy + 11];
  let pen: V = open;
  const made = clamp01((a - 0.15) / 0.5) * strokes; // how many strokes are made, with the fraction of the one in hand
  if (write > 0) {
    const k = Math.min(strokes - 1, Math.floor(made));
    const f = Math.min(1, made - k);
    const [x0, y0, x1, y1] = GREAT_RUNE[k];
    const at: V = a < 0.65 ? [gx0 + mixN(x0, x1, f), gy0 + mixN(y0, y1, f)] : [gx0 + 4, gy0 + 14];
    pen = [mixN(open[0], at[0] - 1, write), mixN(open[1], at[1] + 2, write)];
  }
  armTo(body, farS, pen, dim(MAIL), dim(PLUM), 1);

  // --- the trunk: a tunic to the knee with a woven border, a belt, a horn hung from it ---
  turned(body, (t) => {
    lit(t, MAIL, HI, LO, (l) => l.poly([[X - 8, sy + 1], [X - 6, sy - 1], [X + 6, sy - 1], [X + 8, sy + 1], [X + 8, KAY - 15 + Y], [X - 8, KAY - 15 + Y]], INK));
    for (let x = X - 8; x < X + 8; x++) {
      mark(t, x, KAY - 16 + Y, (x - X + 40) % 4 < 2 ? TEAL[3] : BONE[2]);
      mark(t, x, KAY - 17 + Y, (x - X + 40) % 4 < 2 ? BONE[2] : TEAL[3]);
    }
    t.rect(X - 8, beltY, 16, 3, PLUM[1]);
    t.hline(X - 8, beltY, 16, PLUM[2]);
    t.rect(mid - 1, beltY, 3, 3, STEEL[3]);
    t.set(mid, beltY + 1, SPARK[2]);
  });
  lit(body, BONE, HI, LO, (l) => stroke(l, [[X + 3, beltY + 4], [X + 8, beltY + 5], [X + 9, beltY + 10], [X + 6, beltY + 14]], (t) => 2.5 - 1.9 * t));
  body.set(X + 3, beltY + 3, STEEL[3]).set(X + 2, beltY + 4, STEEL[3]);

  // --- the pelt across both shoulders, ragged below ---
  turned(mantle, (t) => {
    lit(t, SKALD_PELT, HI, LO, (l) => {
      for (let x = X - 13; x <= X + 13; x++) {
        const e = Math.abs(x + 0.5 - X) / 13.5;
        const y0 = sy - 2 + Math.round(e * e * 4);
        const y1 = sy + 5 + Math.round(e * 7) - (hash(x, 9) < 0.4 ? 2 : 0) + (hash(x, 11) < 0.3 ? 1 : 0);
        for (let y = y0; y <= y1; y++) l.set(x, y, INK);
      }
    });
    for (let x = X - 12; x <= X + 12; x += 2) mark(t, x, sy + 2 + Math.floor(hash(x, 13) * 4), SKALD_PELT[1]);
    for (let x = X - 12; x <= X + 12; x += 3) mark(t, x, sy + 6 + Math.floor(hash(x, 17) * 4), SKALD_PELT[1]);
  });

  // --- his head: hair to the shoulders, the face, the beard, the band of steel with its stone ---
  for (const [x0, y0, n] of [[cx - r - 1.5, cy - 1, 11], [cx + r - 1.5, cy + 1, 8]] as const) lit(head, dim(SKALD_HAIR), HI, LO, (l) => l.rect(Math.round(x0), Math.round(y0), 3, n, INK));
  ball(head, cx, cy, r, r + 0.3, SKIN);
  const ey = Math.round(cy) + 1;
  for (const ex of [fx - 3, fx + 2]) {
    head.rect(ex - 1, ey - 1, 3, 2, INK);
    head.set(ex, ey, GLINT);
  }
  head.rect(fx - 1, ey + 1, 2, 2, SKIN[3]);
  {
    // (the beard: from his cheeks to a point at his belt; the chin it hangs from is toward the side he faces. It stirs a little as he breathes.)
    const m = cx + 1.5;
    const len = 22;
    const sway = Math.round(Math.sin(round) * 0.6);
    lit(head, SKALD_HAIR, HI, LO, (l) =>
      l.poly([[m - r - 0.5, ey + 1], [m - 2, ey + 3], [m + 2, ey + 3], [m + r - 0.5, ey + 1], [m + r, ey + 8], [m + 1.5 + sway, ey + len - 2], [m + 0.5 + sway, ey + len], [m - 1.5 + sway, ey + len - 2], [m - r - 1, ey + 8]], INK),
    );
    for (const [dx, y0, n] of [[-2, 7, 9], [2, 8, 8], [0, 12, 8]] as const) for (let i = 0; i < n; i++) mark(head, cx + 1.5 + dx, ey + y0 + i, SKALD_HAIR[2]);
  }
  lit(head, SKALD_HAIR, HI, LO, (l) => {
    for (const [x, y] of inEllipse(cx, cy - 0.3, r + 0.8, r + 1.1)) if (y < Math.round(cy) - 2 + (x < cx - 2 ? 4 : 0)) l.set(x, y, INK);
  });
  {
    const by = Math.round(cy) - 3;
    for (const [x, y] of inEllipse(cx, cy, r + 0.8, r + 0.8)) if (y === by) head.set(x, y, STEEL[x < cx ? 3 : 2]);
    head.set(fx, by, SPARK[2]);
    over.set(fx, by, SPARK[3]);
  }

  // --- the stave: taller than he is, a ring at its head with a rune alight in it, runes cut all down it and lit in turn ---
  // (its ring stands 3 over the top of his head: he and it together are no taller than a person may be beside a hero)
  const stx = X - 15;
  const ringY = top - 24;
  limb(front, stx, KAY - 1, stx, ringY + 5, 1.35, 1.35, PLUM);
  lit(front, STEEL, HI, LO, (l) => {
    for (const [x, y] of inEllipse(stx, ringY, 5, 5)) if (Math.hypot(x + 0.5 - stx, y + 0.5 - ringY) > 2.6) l.set(x, y, INK);
  });
  {
    // (the rune in the ring: it burns up and dies down, and blazes while he writes)
    const burn = acting ? 1 : 0.5 + 0.5 * Math.sin(round * 3);
    smallRune(over, 4, stx - 1, ringY - 3, acting ? '#ffffff' : burn > 0.6 ? SPARK[4] : burn > 0.25 ? SPARK[3] : SPARK[2]);
    lights.push({ x: stx, y: ringY, r: acting ? 16 : 10 + burn * 3, color: SPARK[2], a: acting ? 0.5 : 0.22 + burn * 0.14 });
    const which = Math.floor(q.wind * 18) % 9;
    for (let k = 0; k < 9; k++) {
      const y = ringY + 11 + k * 6;
      if (y > KAY - 4) break;
      const on = acting || k === which;
      front.set(stx - 1, y, on ? SPARK[3] : TEAL[2]).set(stx, y + 1, on ? SPARK[3] : TEAL[2]);
      if (on && !acting) lights.push({ x: stx, y: y + 0.5, r: 5, color: SPARK[2], a: 0.3 });
    }
  }
  // --- the nearer arm, its hand on the stave ---
  const nHand: V = [X - 14, sy + 14];
  armTo(front, nearS, nHand, MAIL, PLUM, -1);
  hand(front, nHand[0], nHand[1]);
  hand(hands, pen[0] + (write > 0.3 ? 1 : 0), pen[1] + (write > 0.3 ? -1 : 0));

  // --- his song: he says the words over, and each leaves his mouth a small rune, rises and thins away ---
  if (!acting) {
    for (let k = 0; k < 3; k++) {
      const u = q.wind * 3 + k / 3;
      const f = u - Math.floor(u);
      if (f > 0.86) continue;
      const x = Math.round(fx + 6 + f * 7 + Math.sin(f * 7 + k) * 1.2);
      const y = Math.round(ey - f * 22);
      smallRune(over, Math.floor(u) * 3 + k, x, y, f < 0.3 ? SPARK[4] : f < 0.6 ? SPARK[3] : SPARK[2]);
      if (f < 0.6) lights.push({ x: x + 1.5, y: y + 2.5, r: 6, color: SPARK[2], a: 0.34 * (1 - f) });
    }
  }

  // --- the rune written on the air: made stroke by stroke, then it rises and thins away ---
  if (a > 0.15 && a < 1) {
    const rise = a < 0.65 ? 0 : Math.round(((a - 0.65) / 0.35) * 12);
    const tone = a < 0.65 ? SPARK[4] : a < 0.8 ? SPARK[3] : a < 0.92 ? SPARK[2] : SPARK[0];
    const whole = Math.floor(made);
    for (let k = 0; k < strokes; k++) {
      const [x0, y0, x1, y1] = GREAT_RUNE[k];
      const f = k < whole ? 1 : k === whole ? made - whole : 0;
      if (f <= 0) continue;
      over.line(gx0 + x0, gy0 + y0 - rise, Math.round(gx0 + mixN(x0, x1, f)), Math.round(gy0 + mixN(y0, y1, f)) - rise, tone);
    }
    if (a < 0.65) over.set(Math.round(pen[0]), Math.round(pen[1]) - 3, '#ffffff');
    lights.push({ x: gx0 + 4, y: gy0 + 6 - rise, r: 13, color: SPARK[2], a: a < 0.8 ? 0.42 : 0.2 });
  }

  // --- the three rune stones that go round him: behind him on the far half of their round ---
  for (let k = 0; k < 3; k++) {
    const ang = round + (k * Math.PI * 2) / 3;
    const depth = Math.sin(ang); // +1 nearest the camera
    const px = Math.round(X + Math.cos(ang) * 27);
    const py = Math.round(top + 9 + depth * 6 + Math.sin(round * 2 + k * 2) * 1.2);
    const to = depth >= 0 ? ring : back;
    // (dark stone, of the walls' own colour)
    const ramp = depth >= 0 ? IRON : dim(IRON);
    lit(to, ramp, HI, LO, (l) => l.poly([[px - 3, py - 5], [px + 2, py - 6], [px + 4, py - 2], [px + 3, py + 5], [px - 2, py + 6], [px - 4, py + 1]], INK));
    const rc = depth >= 0 ? SPARK[3] : SPARK[2];
    smallRune(to, k + 2, px - 1, py - 2, rc);
    if (depth >= 0) {
      smallRune(over, k + 2, px - 1, py - 2, SPARK[4]);
      lights.push({ x: px + 0.5, y: py + 0.5, r: 7, color: SPARK[2], a: 0.34 });
    }
  }

  // AT HIS WORK HE FACES HIS SLAB, which is down the screen and to the LEFT of him (TOWN.runeSlab
  // in game/level.ts). He is painted as the kit paints, facing down the screen and to the right,
  // and then turned about the line he stands on (as a hero is who faces left): his stave is on
  // our right, and the rune he writes on the air stands over the slab.
  return faced(to, compose(null, [back, body, front, mantle, head, hands, ring], over), lights);
}

/**
 * The wordsmith from behind (he has turned to someone who came up on his far side): painted
 * facing up the screen and to the right. His cloak is all of his back, from the pelt on his
 * shoulders to his calves; his white hair lies on the pelt; the band of steel goes round the
 * back of his head. The stave is in the same hand of his as ever, which from here is the one on
 * screen-right and the nearer. The stones go round him still, and he is still saying the words
 * over: the runes rise from beyond his head.
 */
function wordsmithAway(q: Pose, to: Facing): Painted {
  const lights: Light[] = [];
  const Y = Math.round(q.bob);
  const X = KX;
  const round = q.wind * Math.PI * 2;
  const top = KAY - 42;
  const sy = top + Y;
  const r = 6;
  const cx = X - 0.5;
  const cy = sy - 2 - r + 1;
  // (seen from behind, the corner of his body nearest us is toward screen-right)
  const lean = slant(X + 4, 2);
  const back = layer();
  const body = layer();
  const cloak = layer();
  const mantle = layer();
  const head = layer();
  const front = layer();
  const ring = layer();
  const over = layer();

  // --- his legs: boots, the heels toward us, the nearer foot (on screen-right) the lower ---
  leg(body, KX - 1 - SKALD_BOOTS.w, KAY - 18 + Y, KAY - 3, true, SKALD_BOOTS, STAND, 0, -1);
  leg(body, KX + 1, KAY - 17 + Y, KAY - 1, false, SKALD_BOOTS, STAND, 0, -1);

  // --- the cloak down his back to the calf: its hem runs the way his shoulders do, and stirs ---
  {
    const end = KAY - 7;
    const t = layer();
    lit(t, TEAL, HI, LO, (l) => {
      for (let y = sy + 1; y <= end; y++) {
        const half = 9 + ((y - sy) * 5) / (end - sy);
        for (let x = Math.round(X - half); x < Math.round(X + half); x++) {
          if (y <= end - 1 - Math.floor(hash(x, 3) * 3) + Math.round(Math.sin(round * 2 + x * 0.7) * 0.6)) l.set(x, y, INK);
        }
      }
    });
    // (its folds: long ones, from under the pelt to the hem)
    for (const dx of [-7, -2, 4, 9]) for (let y = sy + 12 + ((dx + 9) % 4); y < end - 3; y++) mark(t, X + dx + Math.round(((y - sy) * dx) / 80), y, TEAL[1]);
    shear(t, lean, cloak);
  }

  // --- the pelt across both shoulders, ragged below ---
  {
    const t = layer();
    lit(t, SKALD_PELT, HI, LO, (l) => {
      for (let x = X - 13; x <= X + 13; x++) {
        const e = Math.abs(x + 0.5 - X) / 13.5;
        const y0 = sy - 2 + Math.round(e * e * 4);
        const y1 = sy + 6 + Math.round(e * 6) - (hash(x, 19) < 0.4 ? 2 : 0) + (hash(x, 23) < 0.3 ? 1 : 0);
        for (let y = y0; y <= y1; y++) l.set(x, y, INK);
      }
    });
    for (let x = X - 12; x <= X + 12; x += 2) mark(t, x, sy + 2 + Math.floor(hash(x, 13) * 4), SKALD_PELT[1]);
    for (let x = X - 12; x <= X + 12; x += 3) mark(t, x, sy + 6 + Math.floor(hash(x, 17) * 4), SKALD_PELT[1]);
    // (it leans with his shoulders, and no further where it hangs out past them: or its far end would stand up beside his head)
    shear(t, (x) => lean(Math.max(X - 8, Math.min(X + 9, x))), mantle);
  }

  // --- the back of his head: white hair from the crown to his shoulders, the band of steel round it ---
  lit(head, SKALD_HAIR, HI, LO, (l) => {
    for (const [x, y] of inEllipse(cx, cy - 0.3, r + 0.8, r + 1.1)) l.set(x, y, INK);
    l.poly([[cx - r - 1, cy], [cx + r + 1, cy], [cx + r + 1.5, sy + 4], [cx + 2, sy + 6], [cx - 3, sy + 5], [cx - r - 1.5, sy + 3]], INK);
  });
  for (const [dx, y0, n] of [[-4, 2, 9], [-1, 3, 10], [3, 2, 9]] as const) for (let i = 0; i < n; i++) mark(head, Math.round(cx) + dx, Math.round(cy) + y0 + i, SKALD_HAIR[2]);
  {
    const by = Math.round(cy) - 3;
    for (const [x, y] of inEllipse(cx, cy, r + 0.8, r + 0.8)) if (y === by) head.set(x, y, STEEL[x < cx ? 2 : 3]);
  }

  // --- the stave, in his nearer hand (on screen-right from here): its ring, its rune, the runes cut down it and lit in turn ---
  const stx = X + 15;
  const ringY = top - 24;
  limb(front, stx, KAY - 1, stx, ringY + 5, 1.35, 1.35, PLUM);
  lit(front, STEEL, HI, LO, (l) => {
    for (const [x, y] of inEllipse(stx, ringY, 5, 5)) if (Math.hypot(x + 0.5 - stx, y + 0.5 - ringY) > 2.6) l.set(x, y, INK);
  });
  {
    const burn = 0.5 + 0.5 * Math.sin(round * 3);
    smallRune(over, 4, stx - 1, ringY - 3, burn > 0.6 ? SPARK[4] : burn > 0.25 ? SPARK[3] : SPARK[2]);
    lights.push({ x: stx, y: ringY, r: 10 + burn * 3, color: SPARK[2], a: 0.22 + burn * 0.14 });
    const which = Math.floor(q.wind * 18) % 9;
    for (let k = 0; k < 9; k++) {
      const y = ringY + 11 + k * 6;
      if (y > KAY - 4) break;
      const on = k === which;
      front.set(stx - 1, y, on ? SPARK[3] : TEAL[2]).set(stx, y + 1, on ? SPARK[3] : TEAL[2]);
      if (on) lights.push({ x: stx, y: y + 0.5, r: 5, color: SPARK[2], a: 0.3 });
    }
  }
  {
    const sh: V = [X + 7, sy + 5];
    const h: V = [X + 14, sy + 14];
    const e = elbowOut(sh, h, 7.5, 7.5, 1);
    limb(front, sh[0], sh[1], e[0], e[1], 3, 2.8, MAIL);
    limb(front, e[0], e[1], h[0], h[1], 2.8, 2.5, PLUM);
    hand(front, h[0], h[1]);
  }

  // --- his song: the runes rise from beyond his head ---
  for (let k = 0; k < 3; k++) {
    const u = q.wind * 3 + k / 3;
    const f = u - Math.floor(u);
    if (f > 0.86) continue;
    const x = Math.round(cx + 5 + f * 7 + Math.sin(f * 7 + k) * 1.2);
    const y = Math.round(cy - 4 - f * 20);
    smallRune(over, Math.floor(u) * 3 + k, x, y, f < 0.3 ? SPARK[4] : f < 0.6 ? SPARK[3] : SPARK[2]);
    if (f < 0.6) lights.push({ x: x + 1.5, y: y + 2.5, r: 6, color: SPARK[2], a: 0.34 * (1 - f) });
  }

  // --- the three rune stones that go round him: behind him on the far half of their round ---
  for (let k = 0; k < 3; k++) {
    const ang = round + (k * Math.PI * 2) / 3;
    const depth = Math.sin(ang); // +1 nearest the camera
    const px = Math.round(X + Math.cos(ang) * 27);
    const py = Math.round(top + 9 + depth * 6 + Math.sin(round * 2 + k * 2) * 1.2);
    const onto = depth >= 0 ? ring : back;
    const ramp = depth >= 0 ? IRON : dim(IRON);
    lit(onto, ramp, HI, LO, (l) => l.poly([[px - 3, py - 5], [px + 2, py - 6], [px + 4, py - 2], [px + 3, py + 5], [px - 2, py + 6], [px - 4, py + 1]], INK));
    smallRune(onto, k + 2, px - 1, py - 2, depth >= 0 ? SPARK[3] : SPARK[2]);
    if (depth >= 0) {
      smallRune(over, k + 2, px - 1, py - 2, SPARK[4]);
      lights.push({ x: px + 0.5, y: py + 0.5, r: 7, color: SPARK[2], a: 0.34 });
    }
  }

  return faced(to, compose(null, [back, body, cloak, mantle, head, front, ring], over), lights);
}

// ---------------------------------------------------------------------------------------------
// The stranger. The owner: "he's just leaned up against a wall in the shadows."
//
// He leans back on the wall behind him (to screen-left), one boot flat against it, his arms
// folded under a long dark cloak, the hood down over his face: two points of gold are all that
// is seen of it, and they go from side to side. Now and then a hand comes out from under the
// cloak and tosses a coin.
//
// He is SEEN FROM A CORNER (kit.ts, "Turned to the grid"), as everything in the game is: the wall
// at his back faces down the screen and to the right, and so does he. His shoulders and his
// folded arms run along the grid, the nearer shoulder the lower; the mouth of his hood is toward
// the side he faces and its point hangs back toward the wall; the foot he stands on points along
// the grid.

const S_LEGS: LegStyle = { w: 5, upper: MAIL, lower: INDIGO, share: 0.52, cuff: true, knee: null, band: PLUM };

/** How high the coin is over the hand that tossed it, and which way up. */
function toss(a: number): { out: number; up: number; face: number } {
  if (a <= 0 || a >= 1) return { out: 0, up: 0, face: 0 };
  const out = ease(clamp01(a / 0.18)) * (1 - ease(clamp01((a - 0.84) / 0.16)));
  const t = clamp01((a - 0.2) / 0.56);
  const up = a < 0.2 || a > 0.76 ? 0 : Math.sin(t * Math.PI) * 22;
  return { out, up, face: Math.floor(t * 9) % 3 };
}

/**
 * `to`: someone has come up to him on that side. He does not stir from his wall (he faces down
 * the screen and to the right, as ever), but his eyes stop going from side to side and stay on
 * them: to the right for whoever is at 'se' or 'ne', to the left for 'sw' or 'nw'.
 */
function stranger(q: Pose, to: Facing | null = null): Painted {
  const lights: Light[] = [];
  const Y = Math.round(q.bob);
  const X = KX;
  const ph = q.wind * Math.PI * 2;
  const co = toss(q.act);
  // (he leans: his shoulders are further back, to screen-left, than his feet)
  const LEAN = -4;
  const sy = KAY - 39 + Y;
  const hip = KAY - 17;
  const hem = KAY - 13;
  const legs = layer();
  const cloak = layer();
  const arms = layer();
  const hood = layer();
  const coin = layer();
  const over = layer();

  // --- the legs: one planted well out in front of him (down the screen and to the right), the other bent, its boot flat on the wall behind ---
  leg(legs, X - 9, hip - 1, KAY - 9, true, S_LEGS, { dx: -4, dy: 0, bend: 6 }, 2);
  leg(legs, X - 1, hip, KAY - 1, false, S_LEGS, { dx: 5, dy: 1, bend: 0 }, 3, 1);

  // --- the cloak: from the shoulders to the shins, hanging straight down from a leaning back; and
  // the arms, folded: two forearms across the chest, one over the other. His shoulders and his
  // arms run along the grid; the ragged hem does not. ---
  const dark = dim(PLUM);
  const chest = sy + 10;
  const lean = slant(X - 5 + LEAN, 2);
  {
    const t = layer();
    lit(t, dark, HI, LO, (l) =>
      l.poly([[X - 9 + LEAN, sy + 1], [X - 6 + LEAN, sy - 1], [X + 6 + LEAN, sy - 1], [X + 9 + LEAN, sy + 1], [X + 9, hem - 2], [X + 6, hem], [X - 10, hem], [X - 12 + LEAN / 2, sy + 18]], INK),
    );
    for (const [dx, from] of [[-7, 12], [-2, 20], [5, 16]] as const) for (let y = sy + from; y < hem - 1; y++) mark(t, X + dx + Math.round((LEAN * (hem - y)) / 40), y, PLUM[0]);
    // (its ragged hem)
    for (let x = X - 10; x <= X + 8; x++) if ((x * 7) % 5 < 2) t.set(x, hem, dark[1]);
    shearBy(t, (x, y) => Math.round(lean(x) * clamp01((hem - 2 - y) / (hem - 2 - (chest + 8)))), cloak);
  }
  {
    const t = layer();
    if (co.out < 0.5) limb(t, X + 7 + LEAN, chest - 2, X - 5 + LEAN, chest + 2, 2.8, 2.6, dark);
    limb(t, X - 8 + LEAN, chest - 1, X + 5 + LEAN, chest + 3, 2.8, 2.6, dark);
    t.rect(X + 4 + LEAN, chest + 2, 3, 3, MAIL[2]).hline(X + 4 + LEAN, chest + 2, 3, MAIL[3]);
    shear(t, lean, arms);
  }

  // --- the hood: down over the face; its mouth toward the side he faces, its point hanging back ---
  const cx = X + LEAN;
  const cy = sy - 6;
  lit(hood, dark, HI, LO, (l) => {
    l.ellipse(cx, cy, 7.4, 7.6, INK);
    l.poly([[cx - 7, cy + 3], [cx + 7, cy + 3], [cx + 9, sy + 2], [cx - 9, sy + 5]], INK);
    l.poly([[cx - 2, cy - 7], [cx - 7, cy - 8], [cx - 6, cy - 3]], INK);
  });
  const open = inEllipse(cx + 2, cy + 2, 4.6, 4.6);
  for (const [x, y] of open) hood.set(x, y, INK);
  // (the eyes: they go to one side, wait, and come back)
  const look = to === null ? Math.round(Math.sin(ph) * 1.4) : to === 'se' || to === 'ne' ? 1 : -1;
  const eyeY = Math.round(cy) + 2;
  hood.set(cx + look, eyeY, GOLD[3]).set(cx + 4 + look, eyeY, GOLD[3]);
  // (a scarf over the mouth, and a clasp at the throat)
  for (const [x, y] of open) if (y >= eyeY + 2) hood.set(x, y, MAIL[1]);
  hood.rect(cx + 2, sy + 2, 2, 2, GOLD[2]);

  // --- the hand that tosses: out from under the cloak on screen-right, and the coin over it ---
  if (co.out > 0) {
    const hx = X + 7 + LEAN + co.out * 9;
    const hy = chest + 2 - co.out * 2;
    limb(coin, X + 6 + LEAN, chest, hx, hy, 2.6, 2.3, dark);
    ball(coin, hx + 1, hy, 2.2, 2.1, MAIL);
    const ccx = Math.round(hx) + 1;
    const ccy = Math.round(hy) - 4 - Math.round(co.up);
    // (it turns as it flies: full, edge-on, full)
    if (co.face === 1) over.rect(ccx, ccy - 2, 1, 5, GOLD[3]);
    else {
      over.rect(ccx - 1, ccy - 2, 3, 5, GOLD[2]).rect(ccx - 2, ccy - 1, 5, 3, GOLD[2]);
      over.set(ccx - 1, ccy - 1, GOLD[4]).set(ccx, ccy - 2, GOLD[3]).set(ccx + 1, ccy + 1, GOLD[0]);
    }
    if (co.up > 2) lights.push({ x: ccx + 0.5, y: ccy, r: 6, color: GOLD[3], a: 0.35 });
  }

  return { px: compose(null, [legs, cloak, arms, hood, coin], over), lights };
}

// ---------------------------------------------------------------------------------------------

/** One of the town's people: the loop they stand in, and what they do now and then. */
export interface Townsman {
  /** The standing loop, at IDLE_FPS: facing their work. */
  idle: Sprite[];
  /** The act, at ACT_FPS: it begins and ends as the loop stands. */
  act: Sprite[];
  /** How many times the loop goes round between one act and the next. */
  loops: number;
  /** The way they face at their work. */
  work: Facing;
  /**
   * Turned to someone who has come right up to them: the loop again, for each way that someone
   * may be. For the way of their work it is `idle` itself (they go on with what they were doing).
   * The stranger's are all his own: he never leaves his wall, and only his eyes turn.
   */
  turned: Record<Facing, Sprite[]>;
}

export const ACT_FPS = 20;

/**
 * The frame one of the town's people is in at time `t`: so many rounds of the loop, then the
 * act, and round again. (The loop always starts from its first frame after an act, and an act
 * always follows a whole number of rounds: the two meet where both are the figure standing.)
 * `phase` sets one person's clock apart from another's, so that the town does not move in step.
 */
export function townFrame(m: Townsman, t: number, phase = 0, to: Facing | null = null): Sprite {
  // (`to`: someone has come right up to them on that side. Unless that is the way of their work,
  // they turn to that someone and only stand: what they do now and then waits.)
  if (to !== null && m.turned[to] !== m.idle) {
    const loop = m.turned[to];
    const at = Math.floor((t + phase) * IDLE_FPS);
    return loop[((at % loop.length) + loop.length) % loop.length];
  }
  const loopT = m.idle.length / IDLE_FPS;
  const rest = m.loops * loopT;
  const every = rest + m.act.length / ACT_FPS;
  const u = (((t + phase) % every) + every) % every;
  if (u < rest) return m.idle[Math.floor(u * IDLE_FPS) % m.idle.length];
  return m.act[Math.min(m.act.length - 1, Math.floor((u - rest) * ACT_FPS))];
}

/**
 * Where one of the town's people is in what they do now and then at time `t` (with their clock set
 * `phase` apart, as townFrame has it): seconds into it, or -1 while they stand in their loop.
 */
export function actAt(m: Townsman, t: number, phase = 0): number {
  const loopT = m.idle.length / IDLE_FPS;
  const rest = m.loops * loopT;
  const every = rest + m.act.length / ACT_FPS;
  const u = (((t + phase) % every) + every) % every;
  return u < rest ? -1 : u - rest;
}

/** The town's people, by the names the game knows them by. */
export interface Townsfolk {
  armourer: Townsman;
  mystic: Townsman;
  wordsmith: Townsman;
  stranger: Townsman;
}

/** The poses of a loop of `n` frames: the wind goes once round, the chest sinks and rises every twelve frames. */
function loop(n: number): Partial<Pose>[] {
  const out: Partial<Pose>[] = [];
  for (let i = 0; i < n; i++) out.push({ wind: i / n, bob: i % IDLE_FRAMES >= IDLE_FRAMES / 2 ? 1 : 0 });
  return out;
}

/**
 * The poses of an act of `n` frames. The first and the last are the figure standing, as the loop
 * begins. The wind goes once round in it, so that what goes round in the loop (the wordsmith's
 * stones) does not stand still while the figure acts.
 */
function acting(n: number): Partial<Pose>[] {
  const out: Partial<Pose>[] = [];
  for (let i = 0; i < n; i++) out.push({ act: i / (n - 1), wind: (i / (n - 1)) % 1, bob: 0 });
  return out;
}

/** One frame of each, as a painting (for the dev sheets and the tests): at their work, or turned to someone on the side `to`. */
export const PAINT: Record<keyof Townsfolk, (q: Pose, to?: Facing) => Painted> = { armourer, mystic, wordsmith, stranger };
/** The way each faces at their work: the anvil, the table and the slab are to their left; the stranger's wall is behind him. */
export const TOWN_WORK: Record<keyof Townsfolk, Facing> = { armourer: 'sw', mystic: 'sw', wordsmith: 'sw', stranger: 'se' };

/**
 * The poses of each one's loop and of what each does now and then, and how many times the loop
 * goes round between one act and the next. (The stranger has no pool of light behind him: he
 * keeps to the dark.)
 */
export const TOWN_POSES: Record<keyof Townsfolk, { idle: Partial<Pose>[]; act: Partial<Pose>[]; loops: number }> = {
  armourer: { idle: loop(IDLE_FRAMES), act: acting(26), loops: 4 },
  mystic: { idle: loop(IDLE_FRAMES), act: acting(34), loops: 6 },
  wordsmith: { idle: loop(WORDSMITH_FRAMES), act: acting(56), loops: 3 },
  stranger: { idle: loop(IDLE_FRAMES * 2), act: acting(30), loops: 3 },
};

export function makeTownsfolk(): Townsfolk {
  const one = (who: keyof Townsfolk): Townsman => {
    const p = TOWN_POSES[who];
    const opts = who === 'stranger' ? { aura: null } : {};
    const idle = posed(PAINT[who], p.idle, {}, opts);
    const turned = {} as Record<Facing, Sprite[]>;
    for (const to of FACINGS) turned[to] = who !== 'stranger' && to === TOWN_WORK[who] ? idle : posed((q) => PAINT[who](q, to), p.idle, {}, opts);
    return { idle, act: posed(PAINT[who], p.act, {}, opts), loops: p.loops, work: TOWN_WORK[who], turned };
  };
  // (THE WORDSMITH ON BONES, art/smith3.ts: a mock-up behind a switch that is off)
  return { armourer: one('armourer'), mystic: one('mystic'), wordsmith: SMITH3.on ? makeSmith3() : one('wordsmith'), stranger: one('stranger') };
}
