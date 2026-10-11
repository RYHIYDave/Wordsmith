// THE FLESHMANCER, THE CRYPT'S LAIR BOSS ON FLOOR 5, ON THE HEROES' BONES (the art chat, 11 Oct 2026).
// A MOCK-UP: NOT IN THE GAME. Nothing of the game imports this file, and `FLESHMANCER_SWITCH.on`, the
// switch a later chat would put him in by, is off. THIS IS HIS LOOK ONLY: his standing loop, for the
// owner's yes; his moves come after (docs/mockups/fleshmancer/README.md).
//
// His words, 9 Oct, 22:47, his outline of the Crypt (in the main chat): "Floor 5 will have the Lair
// boss, which will be a very powerful cultist fleshmancer.  He is the one creating the ossuary guys and
// the giant amalgamation.  This guy is tough.  Hes human sized, but He has crazy spells that fill the
// room and you have to dodge around to avoid them."
//
// His brief (his art rulebook's "A new character"), answered by 08:36 on 11 Oct, each in his words:
//   his look, "Hooded priest, hands of power" (robe and deep hood, face hidden in the dark but for
//     pink eyes; long bony fingers that glow; the magic is all in his hands);
//   the one thing he is known by, "A staff topped with a skull" (a tall staff of fused bone with a
//     burning skull at its head);
//   how he moves, "Glides, feet just off the floor (Recommended)" (unnaturally smooth, robes trailing
//     on the floor, then a sudden lurch when he casts);
//   never, "Nothing gory (Recommended)" (grim like the rest of the Crypt: bone, robe and pink fire,
//     never blood or open flesh).
//   (His death, his attacks and his big spells are his brief's too, and come after this.)
//
// WHAT HE IS, AS PAINTED HERE. A man's height (his body 50.5 tall, floating 8 off the floor: the top of
// his hood about 65 up, the knight's helm 58), in a long robe of a black so dark it is nearly plum, and
// over his shoulders a mantle of it that rises into A DEEP, ROUNDED HOOD: no point to it (the cultists'
// cowls and the Headsman's hood are pointed), its brow drawn forward over the face, the dark inside it
// deep, and in that dark two slits of pink, his eyes, and nothing else. Along the mantle's rounded edge,
// round the front of him, the small bones of the dead strung as a trim. His arms come out of wide sleeves
// as bare, pallid forearms and LONG BONY FINGERS THAT GLOW: pallid at the root, the glow coming up
// through the bone, hot pink burning to gold at their tips. In his right hand a STAFF OF FUSED BONE,
// taller than he is (two long bones grown together and twisted, knuckled along its length like a spine),
// three curved prongs of bone at its head gripping A SKULL WITH THE PINK FIRE BURNING OUT OF IT, in its
// sockets and up off its crown, pink burning to gold. His left hand is his casting hand, held out before
// him, palm up, its fingers cupped like a claw round a flame that burns in it. He floats: his bare, bony
// feet hang below his hem, toes down, a little off the floor; the front of his robe is off the floor, and
// the back of it falls to the floor and trails behind him on it.
//
// What glows on him is the enemy's (the art rulebook, Colour 3: "Hot pink burning to gold glows only on
// an enemy"): his eyes, his fingers, the flame in his hand, the skull's fire. Nothing on him is cyan. His
// robe and his mantle are a step quieter than any of that, so that on a dark floor what is seen first is
// the fire and the eyes.
//
// He is a monster of art/new_mobs3.ts's kind (a `Mob`: posed on the heroes' bones, dressed in the heroes'
// solids, lit from the upper left, the enemy's pink edge round him while he lives), on a canvas of his
// own (FM_CANVAS), seen from behind as the camera truly sees him (`trueBack`: his staff stays in his right
// hand), and he goes through every boss check (art/boss_checks.ts, `FM_SHAPE`; the art rulebook, How art
// is made 7).
//
// What the numbers of a pose mean to his painter besides the bones:
//   draw  how far the fingers of his casting hand are curled (0 spread wide, 1 clenched)
//   pt    the power in his hands flaring (0 smouldering, 1 a burst): his fingers, the flame in his
//         palm, his eyes and the skull's fire all flare with it
//   gale  his robe and sleeves blown out round him (a lurch)
//   out   the light going out of him, 0 lit to 1 dark

import type { ActorArt } from './actor_types';
import { INK, dim, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME, SOCKET } from './mkit';
import { OSSUARY, PALLOR, TILE3, eyesOf, faceAlong, mobSet, sphere, skull } from './new_mobs3';
import type { Bit, Mob, MobCanvas, Moment, Put } from './new_mobs3';
import type { BossShape, CheckLimb, CheckLump, CheckThing } from './boss_checks';
import { skirtOf, wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file; a chat that puts him in, on the owner's yes, does it behind this. */
export const FLESHMANCER_SWITCH = { on: false };

const D = Math.PI / 180;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

// ---------------------------------------------------------------------------------------------
// His body, his canvas, his colours

/** His body: a man's (the knight is 58 tall), long in the arm, narrow under the robe. */
export const FM_BODY: Build = buildOf(50.5, 1.12, { shoulders: 1.08, chest: 0.92, depth: 0.98, waist: 0.82, hips: 0.9, arms: 1.16, trunk: 1.06, limbs: 0.84, pad: 2.0 });
const FB = FM_BODY;
/** How far he floats: his pelvis (and his ankles) this far above where a body's would be, standing. His toes hang about 5.5 above the floor (under 3 of the game's pixels). */
export const FM_FLOAT = 8;
/** How high the front of his robe's hem is off the floor, at rest (his feet hang below it; it ripples a little above and below this). */
export const FM_HEM_UP = 12.5;
/** His canvas: room for his staff and its fire high over his hood, raised higher still when he casts, and his robe trailing behind him. */
export const FM_CANVAS: MobCanvas = { w: 300, h: 300, ax: 150, ay: 228 };

/** His robe and his hood: a black so dark it is nearly plum (the cultists' violet is brighter, the Headsman's coat bluer, his hood red). */
export const FM_ROBE: Ramp = ['#110b19', '#110b19', '#2c1f37', '#4a3757', '#4a3757'];
/** The inside of his sleeves and of his robe's far side, seen into: darker again. */
const FM_LINING: Ramp = dim(dim(FM_ROBE));
/** His staff: bone, old and grey (the ossuary's), its shaft a step darker than the knuckles fused along it; the skull at its head the bone of the dead, a step lighter. */
const STAFF_BONE: Ramp = OSSUARY;
const SHAFT_BONE: Ramp = ['#2c2650', '#2c2650', '#5e5688', '#958cc0', '#958cc0'];
/** The little bones along his mantle's edge: the staff's bone, a step quieter still. */
const TRIM_BONE: Ramp = dim(OSSUARY);
/** The skull at his staff's head: the dead's bone, a step darker than the heroes' bone, so that its fire is brighter than it. */
const SKULL_BONE: Ramp = ['#463e70', '#463e70', '#9a90c8', '#d8d0f0', '#d8d0f0'];
/** His fingers, lit from inside: hot pink at the knuckle, burning to gold at the tips (the enemy's fire, `FLAME`); and dimmer, smouldering. */
const GLOW_HOT: Ramp = [FLAME[1], FLAME[1], FLAME[2], FLAME[3], FLAME[3]];
const GLOW_LOW: Ramp = [FLAME[0], FLAME[0], FLAME[1], FLAME[2], FLAME[2]];

/** HIS HOOD: its middle this far before his head and above it, and its half-lengths (front to back, across, up): bigger than a head by a hand all round, its brow drawn forward. */
export const FM_HOOD_FWD = 1.0;
export const FM_HOOD_UP = 0.9;
export const FM_HOOD_R: V3 = [7.8, 6.9, 7.9];
/** The top of his hood above the floor (the figure's own lengths), on his bones: for the sheet and the tests. */
export function fmHoodTop(s: Skeleton): number {
  const [ff, fl, fu] = s.face;
  const c = s.head[2] + ff[2] * FM_HOOD_FWD + fu[2] * FM_HOOD_UP;
  return c + Math.hypot(ff[2] * FM_HOOD_R[0], fl[2] * FM_HOOD_R[1], fu[2] * FM_HOOD_R[2]);
}

// ---------------------------------------------------------------------------------------------
// His staff

/** HIS STAFF: from its foot to the top of its shaft; where his right hand holds it, from its foot; the skull above the shaft's top. */
export const STAFF_LEN = 74;
const STAFF_GRIP = 36.5;
const SKULL_UP = 5.2;
const SKULL_R: V3 = [4.5, 4.0, 4.3];

/** WHERE HIS STAFF IS, on his bones: its foot, its top, the middle of the skull at its head, the way it points. */
export function staffOf(s: Skeleton): { foot: V3; top: V3; skull: V3; way: V3 } {
  const way = s.point;
  const foot = add(s.handR, mul(way, -STAFF_GRIP));
  const top = add(foot, mul(way, STAFF_LEN));
  return { foot, top, skull: add(top, mul(way, SKULL_UP)), way };
}

// ---------------------------------------------------------------------------------------------
// Fire, painted in the picture's own pixels

/** A point of the figure that is seen `dx`, `dy` picture pixels across and down the picture from `c`, as near the eye as it. */
function screenStep(st: Stage, c: V3, dx: number, dy: number): V3 {
  const b = st.back;
  return add(c, [b[0][0] * dx + b[0][1] * dy, b[1][0] * dx + b[1][1] * dy, b[2][0] * dx + b[2][1] * dy]);
}
/** How wide a tongue of flame is from its foot (0) to its tip (1): round underneath, widest a third of the way up, drawn out to a point. */
function tearAt(t: number): number {
  const waist = 0.34;
  if (t < waist) {
    const k = 1 - t / waist;
    return Math.sqrt(1 - k * k * 0.9);
  }
  return (1 - ((t - waist) / (1 - waist)) ** 1.6) ** 1.4;
}
/**
 * A FIRE OF THE ENEMY'S, hot pink burning to gold, standing up off `base`: `tall` and `wide` picture
 * pixels, its tongues rising, falling and leaning each to its own beat (`ph`, round once a loop), and
 * sparks going up off it; `hot` from 0 (embers) to 1 and over (roaring: a white-gold heart). Laid in the
 * picture's own pixels, on the layer over everything; `hidden` says a pixel of it is behind him.
 */
function fireAt(st: Stage, put: Put, base: V3, tall: number, wide: number, ph: number, hot: number, seed: number, hidden?: (p: V3) => boolean): void {
  if (tall < 1.5) return;
  const [bx, by] = st.at(base);
  const lit = new Map<number, string>();
  const shells: [number, string][] = [[1, FLAME[1]], [0.82, FLAME[2]], [0.58, FLAME[3]]];
  if (hot > 0.75) shells.push([0.3, FLAME[4]]);
  // (each tongue: across the fire where its foot stands and where its tip goes, in widths of it; how far up the fire its foot is; how tall and wide it is beside the middle one; its beat, its sway, where in that it starts)
  const tongues: ReadonlyArray<readonly [number, number, number, number, number, number, number, number]> = [
    [0, 0, 0, 1, 1, 2, 1, 0],
    [-0.6, -0.9, 0.16, 0.55, 0.42, 3, 2, 2.1 + seed],
    [0.62, 0.95, 0.22, 0.48, 0.38, 1, 3, 4.4 + seed],
  ];
  const body = tall * (1 + 0.12 * Math.sin(ph * 2 + seed) + 0.07 * Math.sin(ph * 3 + 1.1 + seed));
  for (const [s, colour] of shells) {
    for (const [at, tip, up0, tl, wd, beat, sway, phase] of tongues) {
      const full = at === 0 ? body : body * tl * (1 + 0.24 * Math.sin(ph * beat + phase));
      const lean = Math.sin(ph * sway + phase * 1.7) * 0.8;
      const rows = Math.max(1, Math.round(full * s));
      const up = Math.round(up0 * body) + (s < 1 ? Math.max(1, Math.round((1 - s) * full * 0.16)) : 0);
      for (let i = 0; i < rows; i++) {
        const k = rows > 1 ? i / (rows - 1) : 0;
        const hw = Math.max(0.5, wd * wide * s * tearAt(k));
        const h = Math.min(1.2, (i + up) / Math.max(1, body));
        const mid = bx + at * wide + (tip - at) * 0.6 * wide * k ** 1.3 + lean * h * h * (1 + tall * 0.1);
        const x0 = Math.round(mid - hw);
        const x1 = Math.max(x0 + 1, Math.round(mid + hw));
        const y = Math.round(by) - up - i;
        for (let x = x0; x < x1; x++) lit.set(y * 4096 + x, colour);
      }
    }
  }
  // (sparks: thrown off, they rise, wander and go out)
  const n = 2 + Math.round(2 * Math.min(1.5, hot));
  for (let j = 0; j < n; j++) {
    const life = (ph / (Math.PI * 2) * (2 + (j % 2)) + j * 0.37 + seed * 0.13) % 1;
    if (life > 0.7) continue;
    const x = Math.round(bx + (((j * 0.618 + seed * 0.37) % 1) - 0.5) * wide * 2.2 + Math.sin(life * 6 + j) * 1.5);
    const y = Math.round(by - tall * (0.75 + life * 0.9));
    lit.set(y * 4096 + x, life < 0.35 ? FLAME[3] : FLAME[2]);
  }
  for (const [key, colour] of lit) {
    const y = Math.floor((key + 2048) / 4096);
    const x = key - y * 4096;
    const p = screenStep(st, base, x + 0.5 - bx, y + 0.5 - by);
    if (hidden?.(p)) continue;
    put('fire', 'fire', { k: 'mote', p, c: colour, size: 1 });
  }
}

// ---------------------------------------------------------------------------------------------
// His hands

/** A unit square to `a` (and as near `want` as can be). */
function squareTo(a: V3, want: V3, or: V3): V3 {
  return norm(sub(want, mul(a, dot(want, a))), or);
}
/** `v` turned toward `to` (both square to each other, units) by `deg`. */
function bent(v: V3, to: V3, deg: number): V3 {
  return norm(add(mul(v, Math.cos(deg * D)), mul(to, Math.sin(deg * D))));
}

/**
 * HIS CASTING HAND (his left), palm up, held out before him, cupped round the flame in it as a claw: a
 * palm of pallid skin, and four long bony fingers and a thumb, each of three joints, standing out round
 * the palm's rim and curling up over it, by `curl` (0 spread wide and flat, 1 clenched over it); pallid at
 * the root, the glow coming up through the bone toward the tips (`heat`). Its fingertips, for the fire that
 * licks off them; and the middle of the palm.
 */
function castingHand(put: Put, s: Skeleton, curl: number, heat: number): { tips: V3[]; palm: V3; up: V3 } {
  const el = s.elbowL;
  const hand = s.handL;
  const fore = norm(sub(hand, el), [1, 0, 0]);
  const up = squareTo(fore, [0, 0, 1], s.chest[2]);
  // (across the palm, toward the thumb: his left hand's thumb is to his right, toward his middle)
  const across = norm(cross(up, fore), s.chest[1]);
  const palm = add(hand, mul(fore, 1.1));
  put('handL', 'handL', { k: 'ball', c: palm, ax: [mul(fore, 2.1), mul(across, 1.75), mul(up, 0.8)], skin: PALLOR, far: true });
  const ramp = heat > 0.55 ? GLOW_HOT : GLOW_LOW;
  const tips: V3[] = [];
  const c = clamp01(curl);
  // (round the rim of the palm, from its outer edge to its inner: each finger stands out from the middle and curls up and in)
  const fingers: ReadonlyArray<readonly [number, number, readonly [number, number, number]]> = [
    [-62, 0.92, [3.0, 2.5, 1.9]],
    [-22, 1.0, [3.5, 2.9, 2.2]],
    [16, 1.0, [3.6, 3.0, 2.2]],
    [52, 0.95, [3.2, 2.6, 2.0]],
    [112, 0.8, [2.5, 2.0, 0]],
  ];
  for (const [deg, r, lens] of fingers) {
    const radial = norm(add(mul(fore, Math.cos(deg * D)), mul(across, Math.sin(deg * D))));
    let at = add(palm, mul(radial, 1.7 * r));
    let way = bent(radial, up, 18 + 22 * c - 8 * (1 - c));
    for (let j = 0; j < 3; j++) {
      if (lens[j] <= 0) break;
      const next = add(at, mul(way, lens[j]));
      put('fingersL', 'handL', { k: 'rod', a: at, b: next, ra: j === 0 ? 0.66 : 0.58, rb: j === 2 || lens[j + 1] === 0 ? 0.36 : 0.55, ramp: j === 0 ? PALLOR : j === 1 ? ramp : GLOW_HOT, far: true });
      at = next;
      // (each joint bends further up and in, over the palm: the more clenched, the more)
      const inward = squareTo(way, add(up, mul(radial, -0.9)), up);
      way = bent(way, inward, 22 + 34 * c);
    }
    tips.push(at);
  }
  return { tips, palm, up };
}

/**
 * HIS STAFF HAND (his right), round the shaft: a pallid fist, and his long fingers wrapped round the
 * bone, their knuckles smouldering pink.
 */
function staffHand(put: Put, s: Skeleton, heat: number): void {
  const hand = s.handR;
  const way = s.point;
  const fore = norm(sub(hand, s.elbowR), [1, 0, 0]);
  // (the side of the shaft his fingers come round: toward the way his forearm comes, and round the front)
  const toward = squareTo(way, mul(fore, -1), [0, 1, 0]);
  const round1 = norm(cross(way, toward));
  put('handR', 'handR', { k: 'ball', c: add(hand, mul(toward, 1.6)), ax: [mul(toward, 1.5), mul(round1, 1.6), mul(way, 2.3)], skin: PALLOR, far: true });
  const ramp = heat > 0.85 ? GLOW_HOT : GLOW_LOW;
  for (let i = 0; i < 4; i++) {
    const h = (1.5 - i) * 1.05;
    const at = add(add(hand, mul(way, h)), mul(toward, 1.2));
    // (each finger round the front of the shaft and on round its far side)
    const a1 = add(add(at, mul(round1, 1.9)), mul(toward, -1.1));
    const a2 = add(add(at, mul(round1, 0.9)), mul(toward, -2.9));
    put('fingersR', 'handR', { k: 'rod', a: at, b: a1, ra: 0.55, rb: 0.5, ramp, far: true });
    put('fingersR', 'handR', { k: 'rod', a: a1, b: a2, ra: 0.5, rb: 0.36, ramp, far: true });
  }
}

// ---------------------------------------------------------------------------------------------
// Him, as solids

/** The phase of his loop at a moment (round once in his stand), for what ripples and flickers. */
const FM_STAND_LONG = 3.0;
const phaseOf = (t: number): number => (t / FM_STAND_LONG) * Math.PI * 2;

/** THE FLESHMANCER AS SOLIDS: his feet, his robe and its train, his sleeves, his hands, the mantle and its trim of bone, the hood, his eyes, the staff, the skull and its fire. */
function fleshmancerBits(st: Stage, m: Moment): Bit[] {
  const { s, q } = m;
  const B = FB;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const flare = clamp01(q.pt);
  const gale = clamp01(q.gale);
  const ph = phaseOf(m.t);
  const lagRaw = mul(m.come, -1.4);
  const lag = len(lagRaw) > 3 ? mul(lagRaw, 3 / len(lagRaw)) : lagRaw;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  /** Behind him, as the eye sees it: further from the eye than his chest, and within his shape across the picture (for what is laid over everything: the fire in a hand he holds out before him, seen from behind). */
  const behindHim = (p: V3): boolean => {
    if (st.near(p) > st.near(s.ribs) - 1.5) return false;
    const [x, y] = st.at(p);
    const [nx, ny] = st.at(s.neck);
    const [hx] = st.at([s.pelvis[0], s.pelvis[1], 0]);
    if (y < ny - 12 || y > st.at([s.pelvis[0], s.pelvis[1], 0])[1]) return false;
    const k = clamp01((y - ny) / Math.max(1, st.at([s.pelvis[0], s.pelvis[1], 0])[1] - ny));
    const mx = nx + (hx - nx) * k;
    return Math.abs(x - mx) < 9 + 6 * k;
  };

  // --- his feet: bare and bony, hanging toes down below his hem, off the floor ---
  for (const side of ['L', 'R'] as const) {
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const ball = lerp3(heel, toe, 0.6);
    put(`foot${side}`, `foot${side}`, { k: 'ball', c: ankle, ax: sphere(1.25), skin: PALLOR, far: true });
    put(`foot${side}`, `foot${side}`, { k: 'rod', a: lerp3(ankle, heel, 0.4), b: ball, ra: 1.25, rb: 1.05, ramp: PALLOR, far: true });
    put(`foot${side}`, `foot${side}`, { k: 'rod', a: ball, b: toe, ra: 1.0, rb: 0.6, ramp: PALLOR, far: true });
    put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(heel, mul(norm(sub(toe, heel)), 0.7)), ax: sphere(0.95), skin: PALLOR, far: true });
  }

  // --- his robe: from his neck to his hem, a barrel over the chest and then flaring down round his
  // legs; the front of its hem off the floor, the back of it sweeping down to the floor and trailing
  // behind him on it, rippling ---
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const be = s.belly;
  const torso: Ring[] = [
    { c: add(s.neck, mul(cu, 1.0)), u: mul(cf, 4.6), v: mul(cl, 5.6) },
    { c: lerp3(s.ribs, s.neck, 0.7), u: mul(cf, B.ribDeep + 2.6), v: mul(cl, B.shoulderHalf + 0.8) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 2.4), v: mul(cl, B.ribHalf + 2.6) },
    { c: waistC, u: mul(be[0], B.waistDeep + 2.6), v: mul(be[1], B.waistHalf + 2.8) },
  ];
  const top: Ring = torso[torso.length - 1];
  const drop = Math.max(4, s.pelvis[2] - FM_HEM_UP);
  const skirt = skirtOf(s, B, { top, drop, wide: B.pelvisHalf + 9 + 2.5 * gale, deep: B.pelvisDeep + 8 + 2 * gale, lag, wind: m.wind, gale: gale * 0.5, pad: 1.4 });
  const hem = skirt[skirt.length - 1];
  {
    // THE HEM: the front off the floor and rippling; round the sides, lower; the back swept down onto the floor and out behind him in a train
    const pts: V3[] = [];
    const n = 24;
    const TRAIN = 11;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const cfa = Math.cos(a);
      const sla = Math.sin(a);
      const rear = Math.max(0, -cfa);
      // (it hangs nearly straight down before him, so that his feet are seen below it; it flares to the sides and behind)
      const fore = Math.max(0, cfa);
      const at = add(hem.c, add(mul(hem.u, cfa * (1 - 0.38 * fore)), mul(hem.v, sla * (1 - 0.12 * fore))));
      const ripple = Math.sin(ph * 2 + a * 3) * 1.0 + Math.sin(ph + a * 5 + 1.3) * 0.5;
      // (round the front and the sides it hangs level, off the floor; only the back of it, from his sides round behind him, falls to the floor and trails)
      const back = clamp01((rear - 0.62) / 0.38);
      const fall = back * back * (3 - 2 * back);
      const zFront = hem.c[2] + ripple + gale * 2.2 * (1 - rear);
      const z = zFront + (0.45 + Math.max(0, ripple) * 0.2 - zFront) * fall;
      // (the train stirs as he floats: it creeps out and draws back, and its end sways from side to side)
      const out = add(mul(f, -TRAIN * Math.pow(back, 1.4) * (1 + 0.16 * Math.sin(ph + a * 2))), mul(l, sla * fall * 1.6 + Math.sin(ph * 2 + 0.8) * 1.6 * fall));
      pts.push([at[0] + out[0] + lag[0] * (0.4 + rear), at[1] + out[1] + lag[1] * (0.4 + rear), Math.max(0.45, z)]);
    }
    skirt[skirt.length - 1] = { ...hem, pts };
  }
  put('robe', 'robe', { k: 'cloth', rings: [...torso, ...skirt.slice(1)], ramp: FM_ROBE, look: { folds: [24, -24, 64, -64, 112, -112, 160, -160], lift: 0.06 } });

  // --- his sleeves: wide, from under the mantle, the mouth of each hanging open below his forearm; out of each a bare pallid forearm ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    put(`sleeve${side}`, `sleeve${side}`, { k: 'rod', a: sh, b: el, ra: 2.7, rb: 3.0, ramp: FM_ROBE, far: true });
    const e1 = squareTo(fore, [0, 0, 1], cu);
    const e2 = norm(cross(fore, e1));
    const mouth = add(el, mul(fore, len(sub(hand, el)) * 0.5));
    const sway = Math.sin(ph * 2 + (side === 'L' ? 0 : 1.7)) * 1.0;
    const droop = 3.6 + 1.6 * gale;
    const mouthPts: V3[] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const r = 3.9 + 0.8 * gale;
      const p = add(mouth, add(mul(e1, Math.cos(a) * r), mul(e2, Math.sin(a) * r)));
      // (the underside of its mouth hangs down, and is left behind as he moves)
      const under = Math.max(0, -Math.cos(a));
      mouthPts.push(add(p, add([0, 0, -under * droop + sway * under], mul(lag, under * 0.6))));
    }
    const rings: Ring[] = [
      { c: lerp3(sh, el, 0.55), u: mul(e1, 2.7), v: mul(e2, 2.7) },
      { c: el, u: mul(e1, 3.0), v: mul(e2, 3.0) },
      { c: mouth, u: mul(e1, 3.9), v: mul(e2, 3.9), pts: mouthPts },
    ];
    put(`sleeve${side}`, `sleeve${side}`, { k: 'cloth', rings, ramp: FM_ROBE, look: { folds: [90, -90, 180], lift: 0.1, lining: 0.5 } });
    // (the dark inside its mouth, round the forearm)
    put(`sleeve${side}`, `sleeve${side}`, { k: 'ball', c: add(mouth, mul(fore, -0.3)), ax: [mul(fore, 0.4), mul(e1, 3.1), mul(e2, 3.1)], skin: FM_LINING, far: true });
    const wrist = add(hand, mul(fore, -0.6));
    put(`arm${side}`, `arm${side}`, { k: 'rod', a: add(mouth, mul(fore, -1)), b: wrist, ra: 0.95, rb: 0.75, ramp: PALLOR, far: true });
    put(`arm${side}`, `arm${side}`, { k: 'ball', c: wrist, ax: sphere(0.95), skin: PALLOR, far: true });
  }

  // --- HIS HANDS, where the magic is: the staff hand's knuckles smouldering, the casting hand's fingers burning, and fire in its palm ---
  const pulse = 0.5 + 0.5 * Math.sin(ph * 3 + 0.4);
  const heatL = lit * (0.55 + 0.3 * pulse + 0.7 * flare);
  const heatR = lit * (0.35 + 0.25 * pulse + 0.5 * flare);
  staffHand(put, s, heatR);
  const { tips, palm, up: palmWay } = castingHand(put, s, clamp01(q.draw), heatL);
  if (lit > 0.05) {
    const palmUp = add(palm, mul(palmWay, 2.3));
    // (a light in a hand held out before him is behind him, seen from behind: what of it is seen spills round him, fainter)
    const handHid = behindHim(palmUp);
    // THE FLAME IN HIS PALM: low and smouldering, it swells as his fingers close over it and bursts up when they spread
    const palmFire = (4.5 + 2.4 * pulse) * (1 + 0.5 * clamp01((q.draw - 0.4) / 0.5)) + 10 * flare;
    fireAt(st, put, palmUp, palmFire * lit, 1.9 + 1.8 * flare, ph * 2, 0.6 + flare, 1.3, behindHim);
    // (a lick of it off each fingertip, and the light of all of it)
    tips.forEach((tp, i) => {
      const h = (1.4 + 1.2 * Math.max(0, Math.sin(ph * 3 + i * 1.7))) * (0.6 + 0.9 * flare) * lit;
      if (h > 1.2) fireAt(st, put, add(tp, [0, 0, 0.4]), h, 0.6, ph * 3 + i, 0.3, i * 0.9, behindHim);
    });
    // (big enough that the game lets it light the floor round him through the dark: render.ts, MONSTER_LIGHT_MIN)
    put('glow', 'glow', { k: 'glow', p: palmUp, c: FLAME[2], r: (17 + 4 * pulse + 16 * flare) * (handHid ? 1.3 : 1), a: Math.min(0.85, (0.45 + 0.12 * pulse + 0.3 * flare) * lit) * (handHid ? 0.22 : 1) });
    put('glow', 'glow', { k: 'glow', p: add(s.handR, mul(s.point, 1)), c: FLAME[1], r: 7 + 2 * pulse + 4 * flare, a: Math.min(0.6, (0.28 + 0.1 * pulse + 0.2 * flare) * lit) });
  }

  // --- the mantle: the hood's own cloth, spread over his shoulders down to his upper arms, its edge rounded and rippling ---
  const face = wornOn(st, s, 12);
  const [ff, fl, fu] = face;
  {
    const capeC = add(add(s.neck, mul(cu, -8.2)), mul(lag, 0.5));
    const capeU = mul(cf, B.ribDeep + 4.0 + gale);
    const capeV = mul(cl, B.shoulderHalf + 5.0 + gale);
    const hemPts: V3[] = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const rear = Math.max(0, -Math.cos(a));
      const p = add(capeC, add(mul(capeU, Math.cos(a)), mul(capeV, Math.sin(a))));
      // (lower behind than before, as a cowl falls; the edge stirring)
      hemPts.push(add(p, [0, 0, -rear * 3.4 + Math.sin(ph * 2 + a * 3) * 0.75 - gale * rear * 2]));
    }
    const mantle: Ring[] = [
      { c: add(s.neck, mul(cu, 3.2)), u: mul(cf, 5.0), v: mul(cl, 5.8) },
      { c: add(s.neck, mul(cu, -1.2)), u: mul(cf, B.ribDeep + 3.0), v: mul(cl, B.shoulderHalf + 3.4) },
      { c: capeC, u: capeU, v: capeV, pts: hemPts },
    ];
    put('mantle', 'mantle', { k: 'cloth', rings: mantle, ramp: FM_ROBE, look: { folds: [30, -30, 75, -75, 125, -125, 180], lift: 0.22 } });
    // ITS HEM TRIMMED WITH BONE: the small bones of the dead strung along its edge, round the front of him from shoulder to shoulder
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      if (Math.cos(a) < -0.15) continue;
      const p = hemPts[i];
      const outward = norm(sub([p[0], p[1], capeC[2]], capeC), cf);
      const at = add(add(p, mul(outward, 0.5)), [0, 0, 0.7]);
      const along = norm(cross([0, 0, 1], outward), cl);
      put('trim', 'mantle', { k: 'ball', c: at, ax: [mul(along, 1.05), mul(outward, 0.7), [0, 0, 0.85]], skin: TRIM_BONE });
    }
  }

  // --- THE HOOD: deep and rounded, its brow drawn forward; the dark inside it; and in the dark, his two pink eyes ---
  {
    const hc = add(s.head, add(mul(ff, FM_HOOD_FWD), mul(fu, FM_HOOD_UP)));
    const hr = FM_HOOD_R;
    // (its opening drawn turned two thirds of the way toward whoever looks, as a face's eyes are: skin.ts, eyesToward)
    const cam = Math.atan2(dot(st.eye, fl), dot(st.eye, ff)) / D;
    const toward = clamp01((110 - Math.abs(cam)) / 40);
    const midA = Math.max(-40, Math.min(40, cam * 0.67)) * toward * D;
    const od: V3 = norm(add(mul(ff, Math.cos(midA)), mul(fl, Math.sin(midA))));
    const os: V3 = norm(sub(fl, mul(od, dot(fl, od))));
    const hoodSkin: Skin = (u, tone) => {
      const flat = Math.hypot(u[0], u[1]);
      const toOpen = flat > 1e-6 ? (u[0] * Math.cos(midA) + u[1] * Math.sin(midA)) / flat : 0;
      // (the opening: tall and rounded at its top, from below the brow down to the chin)
      const edge = 0.52 + 0.2 * Math.max(0, u[2] - 0.05);
      if (flat > 0.25 && toOpen > edge && u[2] < 0.44 && u[2] > -0.97) return null;
      // (round it, the cloth turning in: the light catches its lip, a step lighter than the hood)
      if (flat > 0.2 && toOpen > edge - 0.2 && u[2] < 0.62 && u[2] > -1) return FM_ROBE[Math.min(4, Math.max(2, tone) + 1)];
      return FM_ROBE[tone];
    };
    put('hood', 'hood', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: hoodSkin });
    // the dark inside it, deep
    const ic = add(hc, mul(od, -2.2));
    const ir: V3 = [hr[0] - 1.8, hr[1] - 1.3, hr[2] - 1.3];
    put('hood', 'hood', { k: 'ball', c: ic, ax: [mul(od, ir[0]), mul(os, ir[1]), mul(fu, ir[2])], skin: (u) => (u[0] < -0.1 ? null : INK) });
    // (the back of the hood falls in a soft fold to the mantle)
    put('hood', 'hood', { k: 'ball', c: add(add(hc, mul(ff, -3.4)), mul(fu, -4.2)), ax: [mul(ff, 4.6), mul(fl, 5.4), mul(fu, 4.4)], skin: FM_ROBE });
    // HIS EYES: two slits of the pink set deep in the dark, slanting down toward each other, and their light
    if (lit > 0.05) {
      const burn = lit * (1 + 0.8 * flare) * (0.92 + 0.08 * Math.sin(ph * 5));
      for (const k of [-1, 1]) {
        const e = add(ic, add(mul(od, ir[0] * 0.8), add(mul(os, k * 2.3), mul(fu, -0.4))));
        // (each two pixels of the picture: the outer one a row higher than the inner)
        const [ex] = st.at(e);
        const [cx] = st.at(ic);
        const outer = ex < cx ? -1 : 1;
        const hot = burn > 1.4 ? FLAME[4] : SOCKET;
        put('hood', 'hood', { k: 'dot', p: e, c: hot, facing: od });
        put('hood', 'hood', { k: 'dot', p: screenStep(st, e, outer, -1), c: burn > 1.4 ? FLAME[3] : FLAME[2], facing: od });
        if (dot(od, st.eye) > 0.05) put('glow', 'glow', { k: 'glow', p: e, c: SOCKET, r: 5 + 4 * flare, a: Math.min(0.85, 0.55 * burn) });
      }
    }
  }

  // --- HIS STAFF: two long bones grown together, knuckled as a spine is along its length; at its head three curved prongs of bone gripping a skull ---
  {
    const { foot, top, skull: sc, way } = staffOf(s);
    const side1 = squareTo(way, [0, 0, 1], [1, 0, 0]);
    const side2 = norm(cross(way, side1));
    // (the shaft: two long bones grown together and twisted about each other)
    for (const k of [0, 1]) {
      const pts: V3[] = [];
      for (let i = 0; i <= 8; i++) {
        const u = i / 8;
        const tw = u * Math.PI * 1.6 + k * Math.PI;
        pts.push(add(lerp3(foot, top, u), add(mul(side1, Math.cos(tw) * 0.55), mul(side2, Math.sin(tw) * 0.55))));
      }
      for (let i = 0; i < 8; i++) put('staff', 'staff', { k: 'rod', a: pts[i], b: pts[i + 1], ra: 0.95, rb: 0.95, ramp: SHAFT_BONE, far: true });
    }
    // its knuckles: where the bones were fused, a knob of bone, flattened, every few lengths, each its own size and turned its own way
    const KN = 11;
    for (let i = 0; i <= KN; i++) {
      const k = i / KN;
      const c = lerp3(foot, top, 0.04 + 0.92 * k + (hash(i, 3, 151) - 0.5) * 0.03);
      const big = i === KN ? 2.3 : 1.55 + 0.6 * hash(i, 1, 151);
      const tw = i * 1.3 + hash(i, 2, 151);
      const a1 = add(mul(side1, Math.cos(tw)), mul(side2, Math.sin(tw)));
      const a2 = norm(cross(way, a1));
      put('staff', 'staff', { k: 'ball', c, ax: [mul(a1, big), mul(a2, big * 0.78), mul(way, 0.8 + 0.3 * hash(i, 4, 151))], skin: STAFF_BONE, far: true });
    }
    // (its foot: a knob of bone)
    put('staff', 'staff', { k: 'ball', c: foot, ax: sphere(1.6), skin: STAFF_BONE, far: true });
    // the prongs: up out of the shaft's top, out round the skull (at its sides and behind it, so that its face is seen), and curling in over its crown
    const faceWay = squareTo(way, [f[0], f[1], 0], side1);
    const faceSide = norm(cross(way, faceWay));
    for (let i = 0; i < 3; i++) {
      const a = [100, 180, 260][i] * D;
      const out = add(mul(faceWay, Math.cos(a)), mul(faceSide, Math.sin(a)));
      const p0 = add(top, mul(way, -1.2));
      const p1 = add(add(top, mul(way, 1.8)), mul(out, SKULL_R[1] + 1.0));
      const p2 = add(add(sc, mul(way, 2.6)), mul(out, SKULL_R[1] + 0.3));
      const p3 = add(add(sc, mul(way, 4.4)), mul(out, SKULL_R[1] * 0.45));
      put('prongs', 'staff', { k: 'rod', a: p0, b: p1, ra: 0.9, rb: 0.8, ramp: STAFF_BONE, far: true });
      put('prongs', 'staff', { k: 'rod', a: p1, b: p2, ra: 0.8, rb: 0.65, ramp: STAFF_BONE, far: true });
      put('prongs', 'staff', { k: 'rod', a: p2, b: p3, ra: 0.65, rb: 0.35, ramp: STAFF_BONE, far: true });
    }
    // THE SKULL: looking where he looks, the pink burning in its sockets
    const look = faceAlong([f[0] * 0.95 + l[0] * 0.1, f[1] * 0.95 + l[1] * 0.1, -0.12]);
    skull(st, put, 'skull', 'skull', sc, look, SKULL_R, SKULL_BONE, eyesOf(st, look), lit, true, 3.5 + 2 * flare);
    // AND ITS FIRE, up off its crown: pink burning to gold, roaring up as the power in his hands flares
    if (lit > 0.05) {
      const crown = add(sc, mul(way, SKULL_R[2] * 0.75));
      const roar = (1 + 0.15 * Math.sin(ph * 4 + 0.7) + 0.9 * flare) * lit;
      fireAt(st, put, crown, 17 * roar, 4.4 + 1.8 * flare, ph * 3, 0.8 + 0.6 * flare, 0.2);
      put('glow', 'glow', { k: 'glow', p: add(crown, [0, 0, 10]), c: FLAME[3], r: 24 + 4 * Math.sin(ph * 4 + 0.7) + 16 * flare, a: Math.min(0.85, (0.5 + 0.25 * flare) * lit) });
    }
  }
  return bits;
}

// ---------------------------------------------------------------------------------------------
// How he stands

/**
 * HOW HE FLOATS, AT REST: upright and still over nothing, a little bent forward at the chest, his hood a
 * little down, looking toward you from under it; his legs hanging, his feet toes down; his staff upright
 * in his right hand at his side, its foot a little out from his robe and off the floor, its top leaning
 * in over his shoulder; his left hand held out before him at his waist, palm up, fingers curled over the
 * flame in it.
 */
const FM_HANG = -(FB.upperArm + FB.foreArm) * 0.9;
export const FM_REST: Bones = {
  ...standing(FB),
  pz: FM_FLOAT, px: 0, py: 0, yaw: -8, pitch: 3, roll: 0, twist: 4, bend: 8, side: 0,
  faceTurn: 6, faceUp: -7, faceTilt: 0,
  lfx: 2.2, lfy: 1.4, lfz: FM_FLOAT + 0.3, lfp: 38, lft: 14, lk: 10,
  rfx: 0.8, rfy: -1.4, rfz: FM_FLOAT + 1.0, rfp: 46, rft: -12, rk: -6,
  rhIn: 0, rhx: 3.0, rhy: -8.5, rhz: FM_HANG * 0.5, re: 16,
  lhIn: 0, lhx: 11.5, lhy: -2.0, lhz: FM_HANG * 0.62, le: -26,
  wAz: 60, wEl: 82, wRoll: 0,
  draw: 0.3, out: 0, gale: 0, prop: 0, pt: 0, pAz: 0, pEl: 0, stow: 0,
};

/**
 * STANDING, NEVER STILL (the art rulebook, Movement 6, "Alive when still"; and Animations 1, "as big and
 * wild and kinetic and weighty as possible"): three seconds round, thirty frames at ten a second. HE
 * FLOATS, rising and sinking slowly on nothing, swaying a little from side to side, unnaturally smooth;
 * his robe ripples round him and trails on the floor behind; his hood turns slowly as he looks about the
 * hall. The skull's fire burns and flickers, and the flame in his palm with it, his fingers kneading the
 * air over it. Once round, HIS HABIT: his fingers close slowly over the flame, and it swells between
 * them; then they spring open, the fire bursts up out of his palm and off his fingertips, and the skull's
 * fire roars up in answer and his eyes flare, his body jolting up a little with it, his robe and sleeves
 * blown out; and it all dies down again.
 */
function fmStand(): Motion {
  const R = FM_REST;
  const keys: Key3[] = [];
  const N = 30;
  /** Smoothly from 0 to 1 between two moments. */
  const ramp = (t: number, t0: number, t1: number): number => {
    const k = clamp01((t - t0) / (t1 - t0));
    return k * k * (3 - 2 * k);
  };
  for (let i = 0; i <= N; i++) {
    const t = i / 10;
    const a = phaseOf(t);
    // HIS HABIT. Gathering (0.8 to 1.55 s): his casting hand drawn in and up to his chest, his fingers
    // closing over the flame, his body hunching over it. The thrust (1.6 to 1.8 s): the hand flung out
    // and down before him, the fingers springing open. The burst (from 1.7 s, gone by 2.75 s): the fire
    // bursting up out of his palm, the skull's fire roaring, his eyes flaring, his body jolted up and
    // back, his robe and sleeves blown out. Then he settles back as he was.
    const gather = ramp(t, 0.8, 1.55) * (1 - ramp(t, 1.6, 1.8));
    const thrust = ramp(t, 1.6, 1.8) * (1 - ramp(t, 2.0, 2.75));
    const burst = ramp(t, 1.68, 1.8) * (1 - ramp(t, 1.85, 2.75));
    const jolt = ramp(t, 1.68, 1.9) * (1 - ramp(t, 1.95, 2.6));
    const knead = Math.sin(3 * a) * (1 - gather) * (1 - thrust);
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 1.8 * Math.sin(a) + 0.3 * Math.sin(2 * a + 1) - 1.0 * gather + 2.2 * jolt,
        py: 1.0 * Math.sin(a + 1.2),
        px: 0.5 * Math.sin(a + 2.0) - 0.8 * jolt,
        roll: 1.6 * Math.sin(a + 1.2),
        pitch: R.pitch + 1.0 * Math.sin(a + 0.5) + 2 * gather - 4 * jolt,
        bend: R.bend + 1.4 * Math.sin(a) + 6 * gather - 6 * jolt,
        twist: R.twist + 2.5 * Math.sin(a + 0.3) + 5 * gather - 3 * thrust,
        faceTurn: R.faceTurn + 20 * Math.sin(a - 0.6) * (1 - gather) * (1 - thrust) + 16 * gather + 4 * thrust,
        faceUp: R.faceUp + 2.5 * Math.sin(2 * a) * (1 - gather) - 7 * gather + 9 * jolt,
        faceTilt: 3 * Math.sin(a + 2.2) * (1 - gather),
        rhz: R.rhz + 0.6 * Math.sin(a + 0.8) + 2.2 * jolt,
        rhx: R.rhx + 0.5 * Math.sin(a + 1.6) + 1.2 * jolt,
        lhx: R.lhx + 0.8 * Math.sin(a + 1.0) - 4.5 * gather + 3.0 * thrust,
        lhy: R.lhy + 0.5 * Math.sin(2 * a + 0.4) - 2.0 * gather + 0.8 * thrust,
        lhz: R.lhz + 0.9 * Math.sin(2 * a) + 7.0 * gather - 1.5 * thrust,
        draw: 0.3 + 0.18 * knead + 0.68 * gather - 0.3 * thrust,
        pt: burst,
        gale: 0.75 * burst,
      },
    });
  }
  return { loop: 0, keys };
}

/** A move not yet made: he floats at rest, held (a placeholder until it is: his moves come after his look). */
function heldOf(len0: number): Motion {
  return { keys: [{ at: 0, pose: {} }, { at: len0, pose: {} }] };
}
/** His glide not yet made: he floats at rest (a placeholder until it is). */
function heldGlide(): Motion {
  const keys: Key3[] = [];
  for (let i = 0; i <= 8; i++) keys.push({ at: i / 8, pose: {}, ease: 'lin' });
  return { keys, loop: 0 };
}

/** How fast he glides, in tiles a second (the rules' own: a placeholder until his glide is made). */
export const FLESHMANCER_PACE = 1.0;
export const FLESHMANCER: Mob = {
  id: 'fleshmancer',
  name: 'The Fleshmancer',
  size: 'a boss: a man’s height, floating',
  build: FB,
  stand: { name: 'The Fleshmancer floats, his staff burning', motion: fmStand(), rest: FM_REST },
  attack: { name: 'The Fleshmancer (his blow: not made yet)', motion: heldOf(1.0), rest: FM_REST },
  idleFrames: 30,
  idleFps: 10,
  walk: { name: 'The Fleshmancer glides (not made yet)', motion: heldGlide(), rest: FM_REST, period: 1, ground: FLESHMANCER_PACE * TILE3 },
  walkFrames: 8,
  walkFps: 8,
  pace: FLESHMANCER_PACE,
  reel: { name: 'The Fleshmancer is struck (not made yet)', motion: heldOf(0.3), rest: FM_REST },
  reelTime: 0.3,
  hit: 0.5,
  warn: 0.3,
  dieTime: 1.0,
  dying: { name: 'His own dead drag him down (not made yet)', motion: heldOf(1.0), rest: FM_REST },
  aura: { x: FM_CANVAS.ax - 2, y: FM_CANVAS.ay - 44, r: 78, color: '#ff3a78', a: 0.17 },
  shadow: 17,
  canvas: FM_CANVAS,
  trueBack: true,
  bits: (st, m) => fleshmancerBits(st, m),
};

/** HIS STAND, the only move of his made so far: the one the checks review (his other moves are held placeholders until they are made). */
export const FM_MADE: ReadonlyArray<string> = ['stand'];

/** THE FLESHMANCER, as the game holds a monster (see art/new_mobs3.ts makeShadeArt3). */
export function makeFleshmancerArt3(pace = FLESHMANCER.pace): ActorArt {
  return { front: mobSet(FLESHMANCER, 'front', pace), back: mobSet(FLESHMANCER, 'back', pace) };
}

// ---------------------------------------------------------------------------------------------
// As the checks see him (art/boss_checks.ts)

/** His robe below his hips, as painted: an egg round his thighs, down to his knees, and a wider one from there to his hem, as wide as the hem flares (its front, which hangs nearly straight, a little less deep). */
function skirtLumps(s: Skeleton): CheckLump[] {
  const B = FB;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const rot: readonly [V3, V3, V3] = [f, l, [0, 0, 1]];
  const topZ = s.pelvis[2] - B.thigh * 0.25;
  const kneeZ = (s.kneeL[2] + s.kneeR[2]) / 2;
  const lowZ = FM_HEM_UP;
  return [
    { name: 'skirt', c: [s.pelvis[0], s.pelvis[1], (topZ + kneeZ) / 2], rot, h: [B.pelvisDeep + 4.5, B.pelvisHalf + 5, (topZ - kneeZ) / 2 + 1] },
    { name: 'hem', c: [s.pelvis[0], s.pelvis[1], (kneeZ + lowZ) / 2], rot, h: [B.pelvisDeep + 6.5, B.pelvisHalf + 8.5, (kneeZ - lowZ) / 2 + 1] },
  ];
}
/**
 * THE FLESHMANCER AS THE CHECKS SEE HIM: his outside as painted, by name (his legs inside his robe, his
 * sleeves, his hood as painted round his head; his trunk in the barrel of his robe, its skirt and hem), and what he
 * carries: his staff from its foot to the top of its shaft, and the skull at its head. His right fist is
 * round the shaft, so it may lie in his right forearm; nothing else of him.
 */
export function fmSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const B = FB;
  const [rH, rK] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: rK * 1.1 },
      { name: `foot${side}`, a: L ? s.heelL : s.heelR, b: L ? s.toeL : s.toeR, r: 1.0 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: Math.max(r0 * 1.1, 2.7) },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.1 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: s.skull, r: 4.6 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const lumps: CheckLump[] = [
    { name: 'hood', c: add(s.head, add(mul(s.face[0], FM_HOOD_FWD), mul(s.face[2], FM_HOOD_UP))), rot: s.face, h: FM_HOOD_R },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.4, B.ribHalf + 2.4, len(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.5), rot: s.belly, h: [B.waistDeep + 2.6, B.waistHalf + 2.6, Math.max(4, len(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 3, B.pelvisHalf + 3, B.waist * 0.75] },
    ...skirtLumps(s),
  ];
  return { limbs, lumps };
}
/** THE MANTLE over his shoulders, down to its rounded edge at his upper arms: worn over his arms (so not one of the solids his arms keep out of, as the Headsman's cape is not), but his staff passes outside it (tests/fleshmancer.test.ts). */
export function fmMantle(s: Skeleton): CheckLump {
  return { name: 'mantle', c: add(s.neck, mul(s.chest[2], -4.6)), rot: s.chest, h: [FB.ribDeep + 3.6, FB.shoulderHalf + 4.4, 4.6] };
}
export const FM_SHAPE: BossShape = {
  body: fmSolids,
  // (the end he strikes with: the skull at his staff's head, which spits his bone shards)
  tip: (_move, _t, s) => staffOf(s).skull,
  things: (_move, _t, s) => {
    const { foot, top, skull: sc } = staffOf(s);
    const shaft: V3[] = [];
    const n = Math.ceil(len(sub(top, foot)) / 3);
    for (let i = 0; i <= n; i++) shaft.push(lerp3(foot, top, i / n));
    const may = ['foreR'];
    const out: CheckThing[] = [
      { name: 'staff', pts: shaft, r: 1.6, may },
      { name: 'skull', pts: [sc], r: Math.min(...SKULL_R), may: [] },
    ];
    return out;
  },
};
