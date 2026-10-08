// The mage: the owner's pick from ten designs (number 2, "Wide Brim, Long Scarf"). A traveller's
// hat wider than the shoulders with a feather in its band, a teal scarf up to the eyes with one
// end flying, a long purple coat with a glowing hem, a satchel of books, and a staff whose fork
// holds a cut crystal.
//
// Painted with the kit at twice the grain of the first builds' art. Every frame faces
// screen-right: `front` toward the camera (down-right), `back` away from it (up-right).
//
// SEEN FROM A CORNER (Version 14.5; the kit's "Turned to the grid", and the knight's header). The
// coat's shoulders and belt lean along the grid (up to the right when the chest is seen, down to
// the right when the back is); its round hem and the round brim of the hat look the same from
// every side and do not. The line the coat closes on, its buttons, the buckle, the hanging end of
// the scarf and the eyes are toward the side faced (the vent of the coat's back away from it), and
// the closing line runs out toward the hem as the skirts flare. The nearer shoulder is lower and
// the further one higher, the boots point along the grid and a step goes along it. The staff
// stands on the side faced in both views, as it did.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { TailDef, TailRoot } from '../engine/tails';
import type { ActorArt } from './actor_types';
import {
  BONE, BROWN, CYAN, GLINT, HI, INDIGO, INK, KAY, KW, KX, LO, MAIL, PINK, PLUM, ROBE, SKIN4, SPARK, TEAL, TURN,
  animSet, ball, compose, dim, dir, footOf, hash, inEllipse, joint, layer, leg, limb, lit, runPoses, shearBy, slant, stamp,
} from './kit';
import type { LegStyle, Moves, Painted, Pose, Ramp, V } from './kit';
import type { Timeline } from './clip';

// --- how the mage is built, in pixels ----------------------------------------------------------
const BODY = 46;
const HIP = 23;
const BELT = 31;
/** Half the width of the coat at the chest and at the waist. (Square-on they were 8 and 6.5: seen from a corner a body is narrower.) */
const CHEST = 7;
const WAIST = 5.5;
/** How far the nearer shoulder is below the middle of the shoulders, and the further one above it. */
const NEAR_DROP = 2;
const FAR_RISE = 3;
/** Half the width of the coat at its hem, and how far the hem is off the floor. */
const FLARE = 10.5;
const HEM = 6;
const HEAD = 6;
const UPPER = 8;
const FORE = 8;
/** The staff: from the hand up to the middle of the crystal, up to the top of the pole, and down to its foot. */
const STAFF_UP = 32;
const STAFF_NECK = 23;
const STAFF_DOWN = 37;
/** How far the mage comes down when their knees go (prop 5): from standing to kneeling. */
const KNEES = 13;

/** A face under a hat: in shadow. */
const SKIN: Ramp = [SKIN4[0], SKIN4[0], SKIN4[1], SKIN4[2], SKIN4[3]];
const WOOD = INDIGO;
const BOOTS: LegStyle = { w: 4, upper: MAIL, lower: PLUM, share: 0.95, cuff: true, knee: null, band: null };

// ---------------------------------------------------------------------------------------------
// Parts

/** A bare hand. */
function hand(p: Px, x: number, y: number, ramp: Ramp = SKIN): void {
  const x0 = Math.round(x) - 2;
  const y0 = Math.round(y) - 2;
  p.rect(x0, y0, 4, 4, ramp[3]);
  p.hline(x0, y0, 3, ramp[4]).vline(x0 + 3, y0 + 1, 3, ramp[2]).hline(x0, y0 + 3, 3, ramp[2]);
}

/**
 * The staff: a pole with a fork at its top that cradles a crystal. (hx, hy) is where it is held;
 * `deg` is the way its top points (90 = straight up). `burn` is how bright the crystal is: 1 at
 * rest, 2 gathering, 3 let go. The crystal and its rays go on `over` so that nothing seams them.
 */
function staff(p: Px, over: Px, hx: number, hy: number, deg: number, burn: number, breath: number, lights: Light[]): V {
  const [ux, uy] = dir(deg);
  // across the staff: to screen-right when it stands upright
  const vx = -uy;
  const vy = ux;
  const steep = Math.abs(uy) >= Math.abs(ux);
  const foot: V = [hx - ux * STAFF_DOWN, hy - uy * STAFF_DOWN];
  const neck: V = [hx + ux * STAFF_NECK, hy + uy * STAFF_NECK];
  const tip: V = [hx + ux * STAFF_UP, hy + uy * STAFF_UP];
  // the pole: two pixels thick, lit on its upper-left side
  p.line(foot[0] + (steep ? 1 : 0), foot[1] + (steep ? 0 : 1), neck[0] + (steep ? 1 : 0), neck[1] + (steep ? 0 : 1), WOOD[1]);
  p.line(foot[0], foot[1], neck[0], neck[1], WOOD[3]);
  // the fork: two prongs that open round the crystal
  for (const [down, out] of [[8, 1.5], [7, 2.5], [6, 3.5], [5, 3.5], [4, 3.5]] as const) {
    for (const side of [-1, 1]) {
      const x = tip[0] - ux * down + vx * out * side;
      const y = tip[1] - uy * down + vy * out * side;
      p.set(Math.round(x - 0.5), Math.round(y - 0.5), WOOD[side < 0 ? 3 : 1]);
    }
  }
  // the crystal: a tall diamond along the staff, lit on its upper-left faces; white when it flares
  for (let y = Math.floor(tip[1] - 7); y <= Math.ceil(tip[1] + 7); y++) {
    for (let x = Math.floor(tip[0] - 7); x <= Math.ceil(tip[0] + 7); x++) {
      const dx = x + 0.5 - tip[0];
      const dy = y + 0.5 - tip[1];
      const a = dx * vx + dy * vy;
      const b = dx * ux + dy * uy;
      if (Math.abs(a) / 3 + Math.abs(b) / 6 > 1) continue;
      const tone = dx < 0 ? (dy < 0 ? '#ffffff' : SPARK[3]) : dy < 0 ? SPARK[3] : SPARK[2];
      over.set(x, y, burn >= 3 ? (dx + dy < 2 ? '#ffffff' : SPARK[3]) : tone);
    }
  }
  if (burn >= 1.5) {
    // rays: four short ones while it gathers, long ones as it lets go
    const long = Math.max(1, Math.min(6, Math.round((burn - 1) * 3)));
    for (let k = 2; k <= long + 4; k++) {
      const c = k <= long ? '#ffffff' : SPARK[2];
      for (const [rx, ry] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const far = (rx !== 0 ? 3 : 6) + k;
        if (k > long + (rx !== 0 ? 2 : 0)) continue;
        over.set(Math.round(tip[0] - 0.5 + rx * far), Math.round(tip[1] - 0.5 + ry * far), c);
      }
    }
  }
  // (at rest the light breathes: `breath` goes round with the wind. Gathering, it swells: 21 at rest, 34 let go.)
  const hot = Math.max(0, Math.min(2, burn - 1));
  const pulse = hot > 0.5 ? 0 : Math.sin(breath * Math.PI * 2);
  lights.push({ x: tip[0], y: tip[1], r: 21 + hot * 6.5 + pulse * 1.5, color: SPARK[3], a: 0.38 + hot * 0.185 + pulse * 0.07 });
  return tip;
}

/**
 * The streak the crystal leaves when the staff is swung (Pose.sweep: the degrees of arc it has
 * just come through): a band of its light along the path it took, widest behind it and thinning
 * to nothing at the end that is oldest.
 */
function crystalStreak(p: Px, hx: number, hy: number, deg: number, sweep: number, lights: Light[]): void {
  const tip = STAFF_UP + 3;
  const way = sweep > 0 ? 1 : -1;
  const span = Math.min(200, Math.abs(sweep));
  for (let y = Math.floor(hy - tip - 1); y <= Math.ceil(hy + tip + 1); y++) {
    for (let x = Math.floor(hx - tip - 1); x <= Math.ceil(hx + tip + 1); x++) {
      const rx = x + 0.5 - hx;
      const ry = y + 0.5 - hy;
      const r = Math.hypot(rx, ry);
      if (r > tip + 0.5) continue;
      const da = (((((Math.atan2(-ry, rx) * 180) / Math.PI - deg) * way) % 360) + 360) % 360;
      if (da > span) continue;
      const u = da / span;
      const thick = 1.5 + 10 * Math.pow(1 - u, 0.8);
      const v = (r - (tip - thick)) / thick;
      if (v < 0) continue;
      if (u > 0.55 && hash(x, y, 9) < (u - 0.55) * 2.2) continue;
      p.set(x, y, v > 0.7 ? (u < 0.4 ? '#ffffff' : SPARK[3]) : u < 0.25 ? SPARK[3] : u < 0.6 ? SPARK[2] : SPARK[1]);
    }
  }
  const strong = Math.min(1, span / 90);
  for (const k of [0.15, 0.45]) {
    const [dx, dy] = dir(deg + way * span * k);
    lights.push({ x: hx + dx * tip * 0.85, y: hy + dy * tip * 0.85, r: 14, color: SPARK[3], a: 0.34 * strong });
  }
}

/**
 * The staff brought down on the floor: where its foot strikes, a ring of light runs out along the
 * floor (so it is twice as wide as it is tall). `k`: 1 in the frame it strikes, 0 when the ring has gone.
 */
function staffStrike(over: Px, fx: number, fy: number, k: number, lights: Light[]): void {
  const r = 4 + (1 - k) * 13;
  const n = 26;
  for (let i = 0; i < n; i++) {
    // (it breaks up as it goes)
    if (k < 0.6 && i % 2 === 0) continue;
    const a = (i / n) * Math.PI * 2;
    const x = Math.round(fx + Math.cos(a) * r);
    const y = Math.round(fy + Math.sin(a) * r * 0.5);
    over.set(x, y, k > 0.5 ? '#ffffff' : SPARK[3]);
    if (k > 0.75) over.set(x, y - 1, SPARK[3]);
  }
  // chips of light thrown up from the blow
  if (k > 0.4) for (const [dx, dy] of [[-5, -4], [4, -6], [-2, -8], [7, -3]] as const) over.set(Math.round(fx + dx * (1.6 - k)), Math.round(fy + dy * (1.6 - k)), '#ffffff');
  lights.push({ x: fx, y: fy, r: 12 + (1 - k) * 8, color: SPARK[3], a: 0.55 * k });
}

/**
 * The long coat: in from the shoulders to the waist, out to the hem. `sway` carries the hem
 * sideways. The wind is always in it (`wind` is where its wave has got to, 0..1 round its loop,
 * and `blow` how big the wave is at the hem, in pixels): the skirts snake from side to side and
 * the hem rises and falls along its length. The hem itself glows.
 */
function coat(p: Px, X: number, top: number, waistY: number, hem: number, sway: number, open: number, wind: number, blow: number, gale = 0, fly = 1): void {
  const down = (y: number): number => (y <= waistY ? 0 : Math.min(1, (y - waistY) / Math.max(1, hem - waistY)));
  // (in a gale the wave in the skirts comes twice as fast)
  const wave = (y: number): number => Math.sin((wind * (gale > 0 ? 2 : 1) - down(y) * 0.55) * Math.PI * 2) * blow;
  const flare = (y: number): number => (FLARE + open - WAIST) * down(y);
  const upper = (y: number): number => CHEST + (WAIST - CHEST) * ((y - top) / Math.max(1, waistY - top));
  // In a gale (Pose.gale: the mage's own beam, held) the skirts stream back from it, to screen-left:
  // the edge that leads hangs straight from the waist, pressed to the legs, and the skirt that
  // trails flies out behind like a flag, most of the way out by the knee. Its hem goes with it:
  // up the screen when the mage faces us (the blast goes away from us with the cloth), down it
  // when they face away (`fly`: how far up for each pixel out, or down if less than nothing).
  // (facing us the flag stands out from the waist; facing away it sweeps out low, along the floor toward us)
  const out = (d: number): number => (fly >= 0 ? 1 - (1 - d) ** 3 : d ** 2.4);
  const left = (y: number): number => (y <= waistY ? X - upper(y) : X + (sway + wave(y)) * down(y) - WAIST - flare(y) - gale * 22 * out(down(y)));
  const right = (y: number): number => (y <= waistY ? X + upper(y) : X + (sway + wave(y)) * down(y) * Math.max(0, 1 - gale * 0.8) + WAIST + flare(y) * Math.max(0, 1 - gale * 0.9));
  const mid = (y: number): number => (left(y) + right(y)) / 2;
  const half = (y: number): number => (right(y) - left(y)) / 2;
  const lift = (x: number): number => Math.round(Math.sin((wind * (gale > 0 ? 2 : 1) + (x - X) / 20) * Math.PI * 2) * blow * 0.75 - gale * fly * Math.max(0, X - 2 - x) * 0.6);
  // (a hem that sweeps out toward us is lower on the screen than the one that hangs)
  const low = hem + 2 + (fly < 0 ? Math.round(gale * 7) : 0);
  lit(p, ROBE, HI, [LO[0], LO[1] + 1], (l) => {
    for (let y = top; y <= low; y++) {
      for (let x = Math.round(left(y)); x < Math.round(right(y)); x++) if (y <= hem + lift(x)) l.set(x, y, INK);
    }
  });
  for (let y = waistY + 4; y <= hem + 2; y++) {
    for (const f of [-0.6, 0.45]) {
      const x = Math.round(mid(y) + f * half(y));
      if (p.has(x, y) && hash(x, y, 31) > 0.2) p.set(x, y, ROBE[1]);
    }
  }
  // the glowing hem: the lowest but one pixel of every column of the skirts
  const high = hem - 4 - Math.round(gale * 20);
  for (let x = 0; x < KW; x++) {
    for (let y = low; y > high; y--) {
      const c = p.get(x, y);
      if (c === null || !ROBE.includes(c)) continue;
      if (p.has(x, y - 1)) p.set(x, y - 1, CYAN[x < X ? 3 : 2]);
      break;
    }
  }
}

/** Turn one row of the coat into glowing trim. */
function trim(p: Px, y: number, X: number): void {
  for (let x = 0; x < KW; x++) {
    const c = p.get(x, y);
    if (c !== null && ROBE.includes(c)) p.set(x, y, CYAN[x < X ? 3 : 2]);
  }
}

/** The belt. `buckle`: the column of the chest's middle line, where the buckle is, or null for the back. */
function belt(p: Px, X: number, y: number, buckle: number | null): void {
  const strap = dim(PLUM);
  const x0 = Math.round(X - WAIST);
  const w = Math.round(WAIST * 2);
  p.rect(x0, y, w, 3, strap[2]);
  p.hline(x0, y, w, strap[3]).hline(x0, y + 2, w, strap[1]);
  if (buckle !== null) stamp(p, buckle - 1, y, ['GYy', 'YVz', 'yzZ'], { G: CYAN[4], Y: CYAN[3], y: CYAN[2], z: CYAN[1], Z: CYAN[0], V: strap[0] });
}

/**
 * The two things that fly from the mage: the loose end of the scarf, and the feather in the
 * hat's band. Neither is painted in the frames: each frame says where they are fixed, and they
 * are moved and drawn every frame of the game (engine/tails.ts).
 */
export const MAGE_TAILS: Record<string, TailDef> = {
  'm-scarf': { n: 7, seg: 1.6, w0: 4.8, w1: 3.2, dark: TEAL[1], mid: TEAL[2], light: TEAL[3], tip: CYAN[2], gravity: 150, wind: 290, flutter: 120, rate: 1.2, drag: 5 },
  'm-feather': {
    n: 5, seg: 1.45, w0: 3, w1: 1.6, dark: CYAN[1], mid: CYAN[2], light: CYAN[3],
    rest: [[0.8, -1], [1, -0.7], [1, -0.3], [1, 0.1], [0.8, 0.5]],
    stiff: 1, gravity: 30, wind: 110, flutter: 60, rate: 2.1, drag: 9,
  },
  // THE MAGE PAINTED OVER THE BONES (art/hero3_mage.ts) has neither of those: she has LONG HAIR
  // BROUGHT FORWARD OVER EACH SHOULDER, and the length of it that hangs down her front is what
  // moves: 'a' the one toward the eye, 'b' the other. Hair is heavy: it hangs plumb in still air,
  // the wind hardly stirs it, and it comes to rest soon.
  // (each has a shape it keeps a little of, as a quill has: straight down. The one on the far side of her is a tone darker all through.)
  'm-tress-a': { n: 5, seg: 1.1, w0: 3.2, w1: 1.5, dark: BROWN[0], mid: BROWN[2], light: BROWN[3], rest: [[0, 1], [0, 1], [0, 1], [0, 1], [0, 1]], stiff: 0.1, gravity: 300, wind: 14, flutter: 10, rate: 0.9, drag: 8 },
  'm-tress-b': { n: 5, seg: 1.1, w0: 3.2, w1: 1.5, dark: '#35200f', mid: BROWN[0], light: BROWN[2], rest: [[0, 1], [0, 1], [0, 1], [0, 1], [0, 1]], stiff: 0.1, gravity: 300, wind: 14, flutter: 10, rate: 0.9, drag: 8 },
  // THE BATTLE MAGE (the other look of the same painter) has two BRAIDS: shorter than loose hair, as thick at their ends as at their tops, each tied at its end with a thread of light.
  'm-braid-a': { n: 4, seg: 1.05, w0: 3.2, w1: 2.6, dark: PINK[0], mid: PINK[2], light: PINK[3], tip: CYAN[2], rest: [[0, 1], [0, 1], [0, 1], [0, 1]], stiff: 0.14, gravity: 300, wind: 14, flutter: 10, rate: 0.9, drag: 8 },
  'm-braid-b': { n: 4, seg: 1.05, w0: 3.2, w1: 2.6, dark: '#520a3c', mid: PINK[0], light: PINK[2], tip: CYAN[2], rest: [[0, 1], [0, 1], [0, 1], [0, 1]], stiff: 0.14, gravity: 300, wind: 14, flutter: 10, rate: 0.9, drag: 8 },
};

/** A small book, open: two pale pages on a dark cover. (x, y) is the middle of its spine's foot. `turn` (0..1) lifts a page across. */
export function book(p: Px, over: Px, x: number, y: number, turn: number, lights: Light[]): void {
  const X0 = Math.round(x);
  const Y0 = Math.round(y);
  // the cover shows as a rim under and beside the pages
  p.rect(X0 - 6, Y0 - 5, 12, 6, PINK[1]);
  p.hline(X0 - 6, Y0, 12, PINK[0]);
  // the pages, the right-hand one in the light of the crystal
  p.rect(X0 - 5, Y0 - 5, 5, 5, BONE[3]);
  p.rect(X0, Y0 - 5, 5, 5, BONE[4]);
  p.vline(X0, Y0 - 5, 5, BONE[1]);
  // lines of writing
  for (const dy of [-4, -2]) p.hline(X0 - 4, Y0 + dy, 3, BONE[2]).hline(X0 + 1, Y0 + dy, 3, BONE[2]);
  if (turn > 0 && turn < 1) {
    // a page on its way over: it stands up from the right, crosses the spine, lies down on the left
    const px = Math.round(X0 + 4 - turn * 8);
    const tall = Math.round(2 + Math.sin(turn * Math.PI) * 4);
    over.vline(px, Y0 - 4 - tall, tall + 4, '#ffffff');
    over.vline(px + (turn < 0.5 ? 1 : -1), Y0 - 3 - tall, tall + 2, BONE[3]);
  }
  // the words glow a little
  lights.push({ x: X0, y: Y0 - 3, r: 8, color: CYAN[3], a: 0.22 });
}

/** A book, shut: seen from its side as it is lifted out or put away. */
export function bookShut(p: Px, x: number, y: number): void {
  const X0 = Math.round(x);
  const Y0 = Math.round(y);
  p.rect(X0 - 3, Y0 - 5, 6, 6, PINK[2]);
  p.vline(X0 - 3, Y0 - 5, 6, PINK[1]);
  p.hline(X0 - 2, Y0 - 5, 4, PINK[3]);
  p.vline(X0 + 2, Y0 - 4, 4, BONE[3]);
}

/**
 * The mage light: a point of light conjured over the free hand with a snap of the fingers, and
 * put out with another. `pt` is where the little show has got to: 0..0.1 the first snap, then the
 * light pops into being, hangs there bobbing, and from 0.82 the second snap puts it out.
 */
export function mageLight(over: Px, hx: number, hy: number, pt: number, lights: Light[]): void {
  const X0 = Math.round(hx);
  const Y0 = Math.round(hy);
  const snap = (k: number): void => {
    // a snap of the fingers: a few sparks off the hand
    const far = 2 + Math.round(k * 3);
    for (const [dx, dy] of [[-1, -1], [1, -1], [0, -1.4], [-1.4, 0], [1.4, 0]] as const) over.set(X0 + Math.round(dx * far), Y0 - 1 + Math.round(dy * far), k < 0.6 ? '#ffffff' : SPARK[2]);
  };
  if (pt > 0 && pt < 0.1) snap(pt / 0.1);
  if (pt > 0.8 && pt < 0.9) snap((pt - 0.8) / 0.1);
  if (pt < 0.07 || pt > 0.97) return;
  // the light itself: it grows from a point, hangs there bobbing, and bursts into a ring as it goes
  const grow = Math.min(1, (pt - 0.07) / 0.08);
  const going = pt > 0.86 ? (pt - 0.86) / 0.11 : 0;
  const lx = X0 + 1;
  const ly = Y0 - 9 - Math.round(grow * 2) + Math.round(Math.sin(pt * 26) * 1.2);
  if (going > 0) {
    const r = 2 + going * 6;
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      if (going > 0.5 && k % 2 === 0) continue;
      over.set(Math.round(lx + Math.cos(a) * r), Math.round(ly + Math.sin(a) * r * 0.8), going < 0.4 ? '#ffffff' : SPARK[2]);
    }
    lights.push({ x: lx, y: ly, r: 16 - going * 8, color: SPARK[3], a: 0.6 * (1 - going) });
    return;
  }
  const r = grow < 1 ? 0.6 + grow * 2 : 2.6;
  for (let y = Math.floor(ly - r - 1); y <= Math.ceil(ly + r + 1); y++) {
    for (let x = Math.floor(lx - r - 1); x <= Math.ceil(lx + r + 1); x++) {
      const d = Math.hypot(x + 0.5 - lx, y + 0.5 - ly);
      if (d <= r * 0.55) over.set(x, y, '#ffffff');
      else if (d <= r) over.set(x, y, SPARK[3]);
    }
  }
  // four short rays that turn with it
  if (grow >= 1) {
    const spin = Math.floor(pt * 40) % 2;
    for (const [dx, dy] of spin ? ([[1, 1], [-1, 1], [1, -1], [-1, -1]] as const) : ([[1, 0], [-1, 0], [0, 1], [0, -1]] as const)) over.set(Math.round(lx - 0.5 + dx * 4.5), Math.round(ly - 0.5 + dy * 4.5), SPARK[2]);
  } else {
    // (the pop: a flash wider than the light will be)
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) over.set(Math.round(lx - 0.5 + dx * (3 + grow * 3)), Math.round(ly - 0.5 + dy * (3 + grow * 3)), '#ffffff');
  }
  lights.push({ x: lx, y: ly, r: 8 + grow * 10, color: SPARK[3], a: 0.3 + grow * 0.35 });
}

/** The hat: a low flat crown with a glowing band, and a brim wider than the shoulders. (The feather in its band is a tail.) */
function hat(p: Px, cx: number, cy: number, X: number, back: boolean): void {
  lit(p, ROBE, HI, LO, (l) => l.poly([[cx - 6, cy - 5], [cx - 5.5, cy - 11], [cx - 3, cy - 12.5], [cx + 4, cy - 11.5], [cx + 6, cy - 10], [cx + 6, cy - 5]], INK));
  trim(p, cy - 7, X);
  trim(p, cy - 8, X);
  // seen from behind the brim dips over the neck; from in front it shades the eyes
  lit(p, ROBE, HI, LO, (l) => l.ellipse(cx, cy - 4 + (back ? 1 : 0), 18, back ? 3.6 : 3, INK));
}

// ---------------------------------------------------------------------------------------------
// The rig

function wanderer(q: Pose, back: boolean): Painted {
  // (the way the mage faces is down the screen facing us and up it facing away: `fwd`)
  const fwd = back ? -1 : 1;
  // (Pose.step: all of the mage carried along the grid the way they face; a recoil is the other way)
  const BX = KX + Math.round(q.step * 0.9);
  const F = KAY + Math.round(q.step * 0.45) * fwd;
  const X = BX + Math.round(q.lean);
  // a blast of air in the face (the mage's own beam, held): coat, hat, scarf and satchel go back from it
  const gale = Math.max(0, Math.min(1.25, q.gale));
  // GOING DOWN (prop 5, `pt` of the way to their knees: the mage's fall, when their life runs
  // out): all of them above the hem comes down that far; the hem comes to rest on the floor and
  // the skirts spread on it; both hands are on the staff, which stays planted where it stood, and
  // slide down it; the head sinks toward the hands.
  const down = q.prop === 5 ? Math.max(0, Math.min(1, q.pt)) : 0;
  const sink = Math.round(down * KNEES);
  // (leaning the way they face carries them a little down the screen, or up it)
  const Y = Math.round(q.bob + q.lean * 0.4 * fwd) + sink;
  const sy = F - (BODY - 2) + Y;
  const beltY = F - BELT + Y;
  const chinY = F - BODY + Y + Math.round(down * 2);
  const hem = F - HEM + Y - sink + Math.min(sink, HEM - 1);
  const cx = X - 0.5;
  const cy = chinY - HEAD + 1;
  const fx = Math.round(cx) + TURN;
  const lights: Light[] = [];
  const sway = q.swing;
  const ph = q.wind * Math.PI * 2;

  // --- seen from a corner (the kit's "Turned to the grid") ---
  // what runs across the mage is lowest at the corner of the body nearest us, and rises both ways:
  // all of that at the shoulders and the belt, less and less of it down the skirts, none at the hem
  const lean = slant(back ? X + 3 : X - 4, 2);
  const turn = (x: number, y: number): number => lean(x) * (y <= beltY + 3 ? 1 : Math.max(0, 1 - (y - beltY - 3) / Math.max(1, hem - beltY - 6)));
  // the middle line: toward the side faced when the chest is seen, away from it when the back is
  const mid = X + TURN * fwd;
  /** ... which runs out from the body as the skirts flare. */
  const midAt = (y: number): number => mid + Math.round(3 * fwd * Math.max(0, Math.min(1, (y - beltY) / Math.max(1, hem - beltY))));

  // --- the staff hand: on screen-right in both views. A step lifts the staff and sets it down again. ---
  // (Going down, prop 5, the staff does not go with the body: as the second hand takes hold of
  // it, `off`, it is stood upright where the mage stood with it, and stays there; the hands are
  // on it wherever it is, and slide down it as the mage sinks.)
  const plant = q.prop === 5 ? Math.max(0, Math.min(1, q.off)) : 0;
  const hx = X + 16.5 + q.hx + sway * 0.8 + (BX - X - q.hx) * plant;
  const hy = beltY - 8 + q.hy - Math.max(0, sway) * 1.5 * (q.drag > 0 ? 1 : 0);
  const staffY = hy - sink + (F - BELT - 8 - (hy - sink)) * plant;
  const staffAim = q.aim + (90 - q.aim) * plant;
  const staffLayer = layer();
  const over = layer();
  // (a swing of the staff leaves the crystal's streak under it)
  if (Math.abs(q.sweep) >= 6) crystalStreak(staffLayer, hx, hy, q.aim, q.sweep, lights);
  staff(staffLayer, over, hx, staffY, staffAim, q.act, q.wind, lights);
  // both hands on the staff (prop 3): raised to be brought down on the floor, and brought down (`pt`: the blow, 1 as it lands)
  // (and prop 5: holding on to it, going down)
  const twoHands = q.prop === 3 || q.prop === 5;
  if (q.prop === 3 && q.pt > 0.02) {
    const [fux, fuy] = dir(q.aim);
    staffStrike(over, hx - fux * STAFF_DOWN, hy - fuy * STAFF_DOWN, Math.min(1, q.pt), lights);
  }

  const body = layer();
  // The nearer boot stands lower on the screen and the further one higher: they are on the grid.
  // (the legs do not lean with the body: the feet are what the anchor is measured from)
  const nearX = back ? BX + 1 : BX - 5;
  const farX = back ? BX - 5 : BX + 1;
  const toe = back ? 1 : 3;
  const foot: 1 | -1 = back ? -1 : 1;
  leg(body, farX, F - 11, F - 3, true, BOOTS, footOf(q, false, back, true), toe, foot);
  leg(body, nearX, F - 10, F - 1, false, BOOTS, footOf(q, true, back, true), toe, foot);

  // the staff arm: a wide sleeve. Its shoulder is the further one facing us (up beside the scarf), the nearer facing away.
  const sShoulder: V = [X + 6, sy + 3 + (back ? NEAR_DROP : -FAR_RISE)];
  const sElbow = pick(joint(sShoulder, [hx - 1, hy + 1], UPPER, FORE, 1), joint(sShoulder, [hx - 1, hy + 1], UPPER, FORE, -1), (v) => v[1]);
  const staffArm = (p: Px, ramp: Ramp): void => {
    limb(p, sShoulder[0], sShoulder[1], sElbow[0], sElbow[1], 2.6, 2.9, ramp);
    limb(p, sElbow[0], sElbow[1], hx - 1, hy + 1, 2.9, 3.3, ramp);
  };
  if (!back) staffArm(body, dim(ROBE));

  // the long coat, its belt and what is on it: painted level, then set on the grid
  // (a stride opens the coat a little; a blast of its own magic opens it wide; the wind is always in its skirts)
  const trunk = layer();
  coat(trunk, X, sy, beltY, hem, -sway * 1.2 - Math.min(1, q.drag) * 0.6, Math.abs(sway) * 0.8 + Math.max(0, q.drag - 1.4) * 2.2 + down * 4, q.wind, 1.2 + Math.min(1.5, q.drag) * 0.8 + gale * 1.2, gale, back ? -0.45 : 1);
  if (!back) {
    // the line it closes on, and its buttons
    for (let y = sy + 6; y <= hem - 2; y++) if (trunk.has(midAt(y) + 1, y)) trunk.set(midAt(y) + 1, y, ROBE[1]);
    for (let k = 0; k < 4; k++) trunk.set(midAt(beltY + 6 + k * 5) - 1, beltY + 6 + k * 5, CYAN[3]);
  } else {
    // the back of the coat: a vent up from the hem
    for (let y = beltY + 12; y <= hem - 2; y++) if (trunk.has(midAt(y), y)) trunk.set(midAt(y), y, ROBE[1]);
  }
  belt(trunk, X, beltY, back ? null : mid);
  // the satchel's strap, across the body
  for (let k = 0; k <= 22; k++) {
    const t = k / 22;
    const x = Math.round(X + 5 - 12 * t);
    const y = Math.round(sy + 1 + (beltY + 5 - sy) * t);
    if (trunk.has(x, y)) trunk.set(x, y, PLUM[1]).set(x, y + 1, PLUM[2]);
  }
  shearBy(trunk, turn, body);
  // the satchel of books, on the hip; it swings a little against the stride
  const bagX = X - 13 + Math.round(sway * 0.8 - gale * 2.5);
  const bagY = beltY + 6 + (back ? -1 : 2) + (Math.abs(sway) > 0.7 ? 1 : 0) - Math.round(gale * 1.5);
  lit(body, PLUM, HI, LO, (l) => l.rect(bagX, bagY, 9, 8, INK));
  body.hline(bagX, bagY + 3, 9, PLUM[1]);
  body.set(bagX + 4, bagY + 4, CYAN[3]).set(bagX + 4, bagY + 5, CYAN[2]);

  // the other arm. Casting, `off` flings it out toward the target (0 resting on the satchel, 1 out).
  // Left standing (`prop` 1: the mage light, 2: the book), `off` raises it before the chest instead.
  // (its shoulder is the nearer one facing us, and the lower; facing away the further, and the higher)
  const oShoulder: V = [X - 7, sy + 3 + (back ? -FAR_RISE : NEAR_DROP)];
  const resting: V = [bagX + 4, bagY - 2];
  const gesture = (q.prop === 1 || q.prop === 2) && !back;
  // (the light is held out to the side, clear of the hat's brim; the book is read before the chest)
  // (holding a beam, it takes the staff too, a hand's breadth behind the other: both hands to keep it level)
  const [sux, suy] = dir(q.aim);
  const flung: V = gesture ? (q.prop === 1 ? [X - 14 + q.ohx, sy + 12 + q.ohy] : [X - 6 + q.ohx, sy + 11 + q.ohy]) : gale > 0 || twoHands ? [hx - sux * 11, hy - suy * 11] : [X - 1 + 9, sy + 9 - 4 * fwd];
  const reach = Math.max(0, Math.min(1, q.off));
  // (it leaves the satchel and comes back to it: it does not jump to the chest and start from there)
  const oHand: V = reach > 0 ? [resting[0] + (flung[0] - resting[0]) * reach, resting[1] + (flung[1] - resting[1]) * reach] : resting;
  const oElbow = reach > 0 ? pick(joint(oShoulder, oHand, UPPER, FORE, 1), joint(oShoulder, oHand, UPPER, FORE, -1), (v) => (gesture ? v[1] - v[0] * 0.6 : v[1])) : ([oShoulder[0] - 2, oShoulder[1] + 9] as V);
  const otherArm = (p: Px, ramp: Ramp): void => {
    if (reach > 0) {
      limb(p, oShoulder[0], oShoulder[1], oElbow[0], oElbow[1], 2.6, 2.9, ramp);
      limb(p, oElbow[0], oElbow[1], oHand[0], oHand[1], 2.9, 3.2, ramp);
      hand(p, oHand[0] + 1, oHand[1]);
    } else {
      limb(p, oShoulder[0], oShoulder[1], oElbow[0], oElbow[1], 2.6, 2.9, ramp);
      hand(p, oHand[0], oHand[1] + 1, PLUM);
    }
  };
  if (back) otherArm(body, dim(ROBE));
  else if (reach <= 0) otherArm(body, ROBE);

  // the head: all that shows is a strip of shadow between brim and scarf, and the eyes in it, toward the side faced
  if (!back) {
    ball(body, cx, cy, HEAD, HEAD, SKIN, 0.1);
    for (const [x, y] of inEllipse(cx, cy, HEAD, HEAD)) if (y >= cy - 2 && y < cy + 3) body.set(x, y, INK);
    body.set(fx - 2, cy, GLINT).set(fx + 1, cy, GLINT);
  } else {
    // from behind: dark hair down to the scarf
    ball(body, cx, cy, HEAD, HEAD, dim(PLUM));
  }
  // the scarf: round the neck and over the chin, one end hanging down the mage's middle. (The other flies: it is a tail, fixed here.)
  const hangX = mid - (back ? 0 : 2);
  const swing = Math.round(Math.sin(ph * (gale > 0 ? 2 : 1)) * (0.9 + q.drag * 0.6) - gale * 4);
  lit(body, TEAL, HI, LO, (l) => {
    l.ellipse(cx + 0.5, chinY + 0.5, 7, 3.7, INK);
    for (let i = 0; i < 15; i++) l.rect(hangX + Math.round((swing * i) / 14), chinY + 2 + i + lean(hangX), 4, 1, INK);
  });
  for (let x = hangX; x <= hangX + 3; x += 2) body.set(x + swing, chinY + 17 + lean(hangX), CYAN[2]).set(x + swing, chinY + 18 + lean(hangX), CYAN[2]);
  // (in a gale the hat is pushed back on the head and its brim shivers)
  const hatX = cx - Math.round(gale * 1.6);
  const hatY = cy - (gale > 0 && Math.sin(ph * 3) > 0.3 ? 1 : 0);
  hat(body, hatX, hatY, X - Math.round(gale * 1.6), back);
  const blast = gale * 1.5;
  const tails: TailRoot[] = [
    { id: 'm-feather', x: hatX + 4, y: hatY - 8, over: false, ...(blast > 0 ? { blast } : {}) },
    { id: 'm-scarf', x: X - 5, y: chinY + 1, over: true, ...(blast > 0 ? { blast } : {}) },
  ];

  // --- what is nearer the camera than the body ---
  const front = layer();
  if (back) staffArm(front, ROBE);
  else if (reach > 0) otherArm(front, ROBE);
  if (gesture && q.prop === 2 && reach > 0) {
    // the book: shut while it is on its way, open before the chest (`pt` 0.12..0.88), a page turned on the way
    const open = reach >= 1 && q.pt > 0.1 && q.pt < 0.9;
    if (open) book(front, over, oHand[0] + 1, oHand[1] - 2, (q.pt - 0.42) / 0.16, lights);
    else bookShut(front, oHand[0] + 1, oHand[1] - 2);
  }
  if (gesture && q.prop === 1 && reach >= 1) mageLight(over, oHand[0] + 1, oHand[1] - 2, q.pt, lights);
  const hands = layer();
  hand(hands, hx, hy);

  // facing us the staff stands behind the body (its far hand holds it); facing away it is in front
  const layers = back ? [body, staffLayer, front, hands] : [staffLayer, body, front, hands];
  return { px: compose(null, layers, over), lights, tails };
}

function pick(a: V, b: V, score: (v: V) => number): V {
  return score(a) >= score(b) ? a : b;
}

// ---------------------------------------------------------------------------------------------
// Animations

/**
 * The mage. A cast (the orb): the staff is lifted and the crystal gathers light; the staff is
 * thrust at the target, the crystal flares white and the free hand is flung out after it; the
 * staff comes back. A nova: the staff goes straight up, gathering, and is brought down hard on the
 * floor as the crystal lets go; the coat and the scarf are blown outward. Left standing: a snap of
 * the fingers and a mage light pops on, and off again; or a small book comes out of the satchel
 * and a page is read.
 */
const FR = 1 / 30;

/**
 * A BEAM, held (from Version 15.1). The owner, 6 Oct 2026: "Like the mage fires his beam and it
 * blows his cloak back. I want things to have weight. That's very important". Up to 15.0 a mage
 * who held a beam showed ONE frozen frame of the cast for as long as it burned, and the beam came
 * out of the air at the mage's waist while the staff pointed over it.
 *
 * Now: as the beam lights, the blast of it arrives. It drives the mage a step back, and the staff
 * is levelled along the grid, both hands on it, so that the beam runs out along it and leaves by
 * the crystal. Then the mage stands braced against it for as long as it is held (the loop, 0.4
 * seconds round): feet apart, leaning in, the skirts of the coat streaming out behind with their
 * hem flying, the hat pushed back, the scarf and the feather flat out in the wind, the satchel
 * swung back, the crystal white and shaking in the hands.
 * `level`: where the staff hand is and how the staff points when it is levelled, for the view.
 */
function beamHeld(thrust: Partial<Pose>, level: Partial<Pose>): Timeline {
  const hy = level.hy ?? 0;
  const braced: Partial<Pose> = { ...level, lean: 2, bob: 2, near: -0.6, far: 0.9, off: 1, act: 3, gale: 1, drag: 1.2 };
  return {
    loop: 4 * FR,
    keys: [
      { at: 0, pose: { ...thrust, act: 3.4, gale: 0.3 } },
      { at: 2 * FR, pose: { ...braced, lean: 0, bob: 1, step: -3, gale: 1.25, wind: 0.6 }, ease: 'out' },
      { at: 4 * FR, pose: { ...braced, wind: 0 }, ease: 'io' },
      { at: 7 * FR, pose: { ...braced, lean: 3, hy: hy - 1, act: 3.4, gale: 1.15, wind: 0.25 }, ease: 'lin' },
      { at: 10 * FR, pose: { ...braced, act: 2.7, wind: 0.5 }, ease: 'lin' },
      { at: 13 * FR, pose: { ...braced, bob: 3, hy: hy + 1, act: 3.4, gale: 0.9, wind: 0.75 }, ease: 'lin' },
      { at: 16 * FR, pose: { ...braced, wind: 1 }, ease: 'lin' },
    ],
  };
}
/** ... and let go: the blast stops, the coat falls and swings on past the mage, and the staff comes back upright. */
function beamLetGo(level: Partial<Pose>, back: Partial<Pose>): Timeline {
  return {
    keys: [
      { at: 0, pose: { ...level, lean: 2, bob: 2, near: -0.6, far: 0.9, off: 1, act: 3, gale: 1, drag: 1.2 } },
      { at: 2 * FR, pose: { ...level, lean: 3, bob: 2, near: -0.4, far: 0.6, off: 0.8, act: 2.2, gale: 0.15, drag: -1.5, wind: 0.3 }, ease: 'out' },
      { at: 4 * FR, pose: { ...back, drag: -0.8, wind: 0.6 }, ease: 'io' },
      { at: 7 * FR, pose: { wind: 1 }, ease: 'io' },
    ],
  };
}

/**
 * WAVE, the staff's quick attack and what a mage starts with (and the cast of anything else the
 * mage does quickly), from Version 15.1. The rules call it a swing ("Swing the staff: a wide wave
 * of force"); up to 15.0 the staff was lifted a little and poked forward. Now it IS swung: drawn
 * back over the shoulder as the mage coils and the crystal gathers light, then brought over and
 * down through the air in front with the whole body turning into it, the crystal leaving a streak
 * of its light, the coat thrown out behind; held low a moment while the coat swings on past; and
 * back upright. The wave leaves on the sixth frame, as the rules send theirs (`hit`).
 * `back`, `over`, `low`: where the staff hand is and how the staff points drawn back, as the
 * swing lands, and held low, for the view.
 */
function swing(back: Partial<Pose>, over: Partial<Pose>, low: Partial<Pose>): Timeline {
  return {
    hit: 5 * FR,
    keys: [
      { at: 0, pose: {} },
      { at: 2 * FR, pose: { lean: -2, bob: 1, ...back, act: 2.2, wind: 0.1, drag: -0.6 }, ease: 'out' },
      { at: 4 * FR, pose: { lean: -3, bob: 2, near: -0.3, far: 0.5, ...back, aim: (back.aim ?? 90) + 12, act: 2.8, wind: 0.2, drag: -0.8 }, ease: 'out' },
      { at: 5 * FR, pose: { lean: 3, bob: 2, near: -0.5, far: 1, ...over, act: 3.2, sweep: 125, off: 1, wind: 0.4, drag: 2.3 }, ease: 'in' },
      { at: 6 * FR, pose: { lean: 4, bob: 3, near: -0.5, far: 1, ...low, act: 3, sweep: 55, off: 1, wind: 0.45, drag: 1.5 }, ease: 'lin' },
      { at: 9 * FR, pose: { lean: 3, bob: 2, near: -0.4, far: 0.8, ...low, aim: (low.aim ?? 0) + 4, act: 2.2, off: 0.6, wind: 0.65, drag: -1.3 }, ease: 'out' },
      { at: 15 * FR, pose: { wind: 1 }, ease: 'io' },
    ],
  };
}

/**
 * ORB, the staff's slow attack (the owner: "Slam the staff down on the ground and a little pulse
 * aura goes out around the character then the orb appears where you tapped"), from Version 15.1.
 * Up to 15.0 the staff rose and came down a little way with the mage standing. Now: both hands
 * take it, it goes up overhead as the mage rises onto the toes and the crystal gathers; a beat
 * held at the top; then it is driven down onto the floor with all the mage's weight (the body
 * drops into a crouch round it, the coat is thrown open, a ring of light runs out from its foot
 * along the floor); the crouch is held while the coat settles; and up. It lands on the ninth
 * frame, as the rules set theirs (`hit`).
 */
const SLAM_DOWN: Timeline = {
  hit: 8 * FR,
  keys: [
    { at: 0, pose: {} },
    { at: 3 * FR, pose: { prop: 3, off: 1, bob: -1, hx: -2, hy: -7, aim: 92, act: 2, wind: 0.1 }, ease: 'out' },
    { at: 6 * FR, pose: { prop: 3, off: 1, bob: -2, lean: -1, hx: -2, hy: -13, aim: 94, act: 2.8, wind: 0.18, drag: -0.6 }, ease: 'out' },
    { at: 7 * FR, pose: { prop: 3, off: 1, bob: -2, lean: -1, hx: -2, hy: -14, aim: 94, act: 3, wind: 0.2, drag: -0.6 }, ease: 'lin' },
    { at: 8 * FR, pose: { prop: 3, off: 1, pt: 1, bob: 5, lean: 1, near: -0.5, far: 0.6, hx: -1, hy: -4, aim: 90, act: 3.4, wind: 0.4, drag: 3 }, ease: 'in' },
    { at: 10 * FR, pose: { prop: 3, off: 1, pt: 0.35, bob: 4, lean: 1, near: -0.5, far: 0.6, hx: -1, hy: -3, aim: 90, act: 3, wind: 0.5, drag: 2 }, ease: 'out' },
    { at: 13 * FR, pose: { prop: 3, off: 1, bob: 3, lean: 1, near: -0.4, far: 0.5, hx: -1, hy: -2, aim: 90, act: 2.2, wind: 0.65, drag: -0.8 }, ease: 'out' },
    { at: 20 * FR, pose: { prop: 3, wind: 1 }, ease: 'io' },
  ],
};

/**
 * How the mage runs (from Version 15.1): hardly a run at all. Short quick steps under the coat,
 * upright, almost a glide, and the skirts of the coat streaming out behind as they do (a little)
 * in the blast of a beam.
 */
const MAGE_RUN = runPoses({ lean: 1, dip: 1, stride: 0.85, drag: 1.2, each: () => ({ gale: 0.32 }) });

/**
 * THE MAGE'S FALL, when their life runs out (6 Oct 2026: see the knight's, hero_warrior.ts). The
 * blow throws them back; a step back to keep their feet; the other hand goes to the staff, which
 * is stood upright where they stand and is all that holds them up; and they slide down it to
 * their knees (prop 5), the coat settling round them on the floor; the head goes down against the
 * staff, and the light goes out of the crystal, the hem, the eyes (Pose.out). They are left on
 * their knees, holding on to a dead staff.
 */
const MAGE_FALL: Timeline = {
  keys: [
    { at: 0, pose: {} },
    { at: 2 * FR, pose: { lean: -5, bob: 1, step: -3, near: 0.4, far: -0.6, drag: -2.5, wind: 0.08 }, ease: 'out' },
    { at: 8 * FR, pose: { lean: -3, bob: 2, step: -5, near: -0.4, far: 0.4, drag: -0.8, wind: 0.25 }, ease: 'io' },
    { at: 14 * FR, pose: { prop: 5, off: 1, lean: -1, bob: 1, step: -5, hy: -2, wind: 0.4 }, ease: 'io' },
    { at: 21 * FR, pose: { prop: 5, pt: 0.12, off: 1, lean: 0, bob: 1, step: -5, hy: -1, wind: 0.55, out: 0.2 }, ease: 'io' },
    // (down the staff to their knees: slowly, and then all at once; and the coat settles after them)
    { at: 28 * FR, pose: { prop: 5, pt: 1, off: 1, lean: 1, bob: 2, step: -5, hy: 2, wind: 0.7, drag: 1.6, out: 0.45 }, ease: 'in' },
    { at: 32 * FR, pose: { prop: 5, pt: 1, off: 1, lean: 2, bob: 0, step: -5, hy: 3, wind: 0.8, drag: -1, out: 0.6 }, ease: 'out' },
    { at: 46 * FR, pose: { prop: 5, pt: 1, off: 1, lean: 4, bob: 1, step: -5, hy: 5, wind: 1, out: 1 }, ease: 'io' },
  ],
};

/** A heavy blow rocks them back on their heels, and they are upright again (see the knight's, hero_warrior.ts). */
const MAGE_REEL: Timeline = {
  keys: [
    { at: 0, pose: {} },
    { at: 2 * FR, pose: { lean: -5, bob: 1, step: -3, near: 0.4, far: -0.6, drag: -2.5, wind: 0.08 }, ease: 'out' },
    { at: 4 * FR, pose: { lean: -3, bob: 1, step: -3, near: 0.3, far: -0.4, drag: 1.2, wind: 0.14 }, ease: 'io' },
    { at: 7 * FR, pose: {}, ease: 'io' },
  ],
};
/** ... and one from behind throws them forward a step: pitched over, a foot out to catch them, and upright again. */
const MAGE_LURCH: Timeline = {
  keys: [
    { at: 0, pose: {} },
    { at: 2 * FR, pose: { lean: 5, bob: 2, step: 3, near: -0.6, far: 0.6, drag: 2.5, wind: 0.08 }, ease: 'out' },
    { at: 4 * FR, pose: { lean: 3, bob: 2, step: 3, near: 0.5, far: -0.3, drag: -1, wind: 0.14 }, ease: 'io' },
    { at: 7 * FR, pose: {}, ease: 'io' },
  ],
};

export function makeMageArt(was = false): ActorArt {
  const nova: Moves['heavy'] = {
    hit: 0.26,
    keys: [
      { at: 0, pose: {} },
      { at: 0.16, pose: { bob: -1, hx: -2, hy: -9, aim: 90, act: 2, wind: 0.15 }, ease: 'out' },
      { at: 0.22, pose: { bob: -1, hx: -2, hy: -10, aim: 90, act: 2.7, wind: 0.2 }, ease: 'lin' },
      { at: 0.28, pose: { bob: 2, hx: -1, hy: 2, aim: 90, act: 3, wind: 0.45, drag: 2.6 }, ease: 'in' },
      { at: 0.42, pose: { bob: 1, hx: -1, hy: 1, aim: 90, act: 2, wind: 0.75, drag: 1.2 }, ease: 'out' },
      { at: 0.64, pose: { wind: 1 } },
    ],
  };
  const cast = (thrust: Partial<Pose>, back: Partial<Pose>): Moves['attack'] => ({
    hit: 0.16,
    keys: [
      { at: 0, pose: {} },
      { at: 0.1, pose: { lean: -1, hx: -1, hy: -6, aim: 96, act: 2.5, wind: 0.2 }, ease: 'out' },
      { at: 0.19, pose: thrust, ease: 'in' },
      { at: 0.3, pose: back, ease: 'out' },
      { at: 0.48, pose: { wind: 1 } },
    ],
  });
  const lit: Partial<Pose> = { prop: 1, off: 1 };
  const read: Partial<Pose> = { prop: 2, off: 1 };
  const front: Moves = {
    attack: !was ? swing({ hx: -4, hy: -8, aim: 128 }, { hx: 3, hy: 1, aim: 8 }, { hx: 3, hy: 5, aim: -20 }) : cast(
      { lean: 2, bob: 1, near: 0.6, far: -0.3, hx: 2, hy: 0, aim: 30, act: 3, off: 1, wind: 0.45, drag: 1.4 },
      { lean: 1, hx: 2, hy: -1, aim: 66, act: 2, off: 0.4, wind: 0.75, drag: 0.5 },
    ),
    heavy: !was ? SLAM_DOWN : nova,
    ...(was ? {} : {
      walk: MAGE_RUN,
      fall: MAGE_FALL,
      reel: MAGE_REEL,
      lurch: MAGE_LURCH,
      hold: beamHeld({ lean: 3, bob: 2, near: -0.5, far: 1, hx: 3, hy: 3, aim: -8, off: 1, drag: 1.8 }, { hx: -8, hy: 16, aim: -27 }),
      release: beamLetGo({ hx: -8, hy: 16, aim: -27 }, { lean: 1, hx: 2, hy: -1, aim: 66, act: 2, off: 0.4 }),
    }),
    // a snap of the fingers, and a mage light pops on over the hand; another, and it is gone
    idleA: {
      keys: [
        { at: 0, pose: {} },
        { at: 0.4, pose: { ...lit } },
        { at: 3.1, pose: { ...lit, pt: 1 }, ease: 'lin' },
        { at: 3.6, pose: {} },
      ],
    },
    // a small book out of the satchel: a page read, a page turned, and it is put away
    idleB: {
      keys: [
        { at: 0, pose: {} },
        { at: 0.2, pose: { prop: 2 }, ease: 'hold' },
        { at: 0.65, pose: { ...read } },
        { at: 0.8, pose: { ...read, pt: 0.12, bob: 1 } },
        { at: 2.75, pose: { ...read, pt: 0.88, bob: 1 }, ease: 'lin' },
        { at: 2.9, pose: { ...read, pt: 1 } },
        { at: 3.4, pose: { prop: 2, pt: 1 } },
        { at: 3.6, pose: {}, ease: 'hold' },
      ],
    },
  };
  const backMoves: Moves = {
    attack: !was ? swing({ hx: -4, hy: -9, aim: 132 }, { hx: 3, hy: -5, aim: 44 }, { hx: 3, hy: -1, aim: 18 }) : cast(
      { lean: 2, bob: 1, near: 0.6, far: -0.3, hx: 3, hy: -8, aim: 58, act: 3, off: 1, wind: 0.45, drag: 1.4 },
      { lean: 1, hx: 1, hy: -3, aim: 78, act: 2, off: 0.4, wind: 0.75, drag: 0.5 },
    ),
    heavy: !was ? SLAM_DOWN : nova,
    ...(was ? {} : {
      walk: MAGE_RUN,
      fall: MAGE_FALL,
      reel: MAGE_REEL,
      lurch: MAGE_LURCH,
      hold: beamHeld({ lean: 3, bob: 2, near: -0.5, far: 1, hx: 3, hy: -3, aim: 30, off: 1, drag: 1.8 }, { hx: -10, hy: 10, aim: 27 }),
      release: beamLetGo({ hx: -10, hy: 10, aim: 27 }, { lean: 1, hx: 1, hy: -3, aim: 78, act: 2, off: 0.4 }),
    }),
  };
  return { front: animSet(wanderer, false, { aim: 90, act: 1 }, front), back: animSet(wanderer, true, { aim: 90, act: 1 }, backMoves) };
}

/** For the art sheets: one frame, as a painting. */
export function paintMage(q: Pose, back: boolean): Painted {
  return wanderer(q, back);
}
