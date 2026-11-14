// The brute and the guardian: one rig, two figures.
//
// THE BRUTE is the ogre of the style sheet (previews/art_styles_1_and_6.png; `brute` in
// dev/styles_cast.ts, in the look `neon`), made to move and given a back: a barrel of a body in
// slate blue, a tiny head sunk between boulder shoulders (a heavy brow, two burning eyes, a slit of
// a mouth and two tusks), short thick legs planted wide on flat feet, a ragged hide round the
// hips, a strap across the chest, one arm hanging with its fist near the knee and the other
// holding a great studded club high.
//
// THE GUARDIAN is the powerful beast at the end of a side path: the same rig a third bigger (its
// head stays small), flushed red, with a great spiked plate on one shoulder, iron on its forearms,
// a club bound in iron whose edges burn, a broken tusk and a scar across the chest.
//
// Neither fits the kit's canvas (a club raised over the head, or trailing on the floor behind; a
// guardian a third bigger), so they are painted on a bigger one of their own, BRUTE_CANVAS. Every
// frame faces screen-right: `front` toward the camera (down-right), `back` away from it
// (up-right). The rig's "club arm" is the one on screen-right in both views (as the heroes'
// weapon arms are): the far one when the beast faces us, the near one when it faces away. The
// strap, and the guardian's shoulder plate, are on the other shoulder in both views.
//
// THE CLUB TRAILS (the owner, 5 Oct 2026, 20:24: "I feel like guardians and brutes should be
// dragging their clubs behind them. Or at least carrying them by their side"). Standing and
// walking, he does not hold it up. It hangs from the fist of his NEARER arm (the arm on
// screen-left when he faces us, on screen-right when he faces away: so it is always the arm we
// see whole, and the club is never hidden behind him) and its thick end is on the floor behind
// him (`drag`), or hangs just clear of the floor beside his leg (`side`). It comes up only to
// strike: as his other hand goes to the handle (the pose's `off`), the club leaves the floor for
// wherever the pose puts it, and after the blow it is let down again. See CARRY.
//
// A frame costs about what the knight's does to paint, big canvas or not: each is painted on
// sheets cut down to the box that holds it (see boxOf) and laid on the canvas at the end.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt } from './actor_types';
import { poseAt } from './clip';
import type { Key, Timeline } from './clip';
import { fallen, quench } from './death';
import type { Piece } from './death';
import { BONE, INDIGO, INK, MAIL, PLUM, REST, STEEL, ball, compose, dim, dir, hash, joint, limb, lit, shearBy, stamp } from './kit';
import type { Painted, Pose, Ramp, Rig, V } from './kit';
import { BLOOD, FLAME, FLESH, GORE, IRON, SOCKET, monsterArt } from './mkit';
import type { Canvas, MonsterMoves } from './mkit';

/** The canvas both are painted on, and the floor point under them on it. (There is room under the floor point for a club that trails toward us.) */
export const BRUTE_CANVAS: Canvas = { w: 176, h: 176, ax: 76, ay: 146 };
const AX = BRUTE_CANVAS.ax;
const AY = BRUTE_CANVAS.ay;

// --- how the brute is built, in pixels (the guardian is all of it times GUARDIAN) -------------
const GUARDIAN = 1.3;
/** THE TROLL CHIEFTAIN (a mock-up: see the end of this file) is bigger than either of his trolls. */
const CHIEF = 1.45;
/** ... and his canvas: taller than the trolls' (his club reared over his head, his banner), with room either side. */
export const CHIEF_CANVAS: Canvas = { w: 208, h: 212, ax: 92, ay: 180 };
/** Heights above the floor: the top of the head, the middle of the shoulders, the top of the barrel seen from the front and from behind, its underside, the hips. */
const H_HEAD = 54;
const H_SHO = 47;
const H_TOP = 52.5;
const H_BACK = 48;
const H_BOT = 16;
const H_HIP = 20;
/** ... and of the barrel's widest row, seen from the front (it sags) and from behind. */
const H_WIDE = 31;
const H_WIDE_BACK = 36;
/** Half the barrel's width; from the centre line to the middle of a leg, and of a shoulder. */
const HALF = 17.5;
const LEG = 9.5;
const SPREAD = 13;
/** Bones of an arm. */
const UPPER = 13;
const FORE = 14.5;
/** The club: how much handle there is below the hand, and how far the middle of its thick end is above it. */
const GRIP = 4;
const CLUB = 27;
/**
 * TURNED TO THE GRID (after Version 14.5; kit.ts, "Turned to the grid"). He is seen from a corner,
 * as everything is: the line of his shoulders runs along the grid, the nearer one this much lower
 * than it would be square-on and the further one as much higher, and the top of the barrel leans
 * with them (its belly, which is as round from one side as from another, does not). His feet stand
 * along the grid too, the nearer FOOT_TILT lower and the further as much higher, and point along
 * it. What is on the middle line of the chest (the meeting of the folds under it, the navel), and
 * of the back (the spine), is TURN_MID toward the side he faces; and the face is seen from one side.
 */
const SHOULDER_TILT = 4.5;
const FOOT_TILT = 3;
const TURN_MID = 6;

/**
 * How he carries his club when he is not striking with it (THE CLUB TRAILS, above):
 *   drag   its thick end on the floor behind him, hauled along by the handle
 *   side   hanging from his fist beside his leg, clear of the floor
 *   high   held up beside his head, as it was until 5 Oct 2026
 */
export type Carry = 'drag' | 'side' | 'high';
/**
 * ... in the game. The owner was shown `drag` and `side` moving (5 Oct 2026, 20:57) and chose at
 * 23:08: "Clubs at the side for now". (`drag` is kept: "for now".)
 */
let CARRY: Carry = 'side';
/** For the pictures he is shown: figures made after this carry their clubs so. */
export function setClubCarry(how: Carry): void {
  CARRY = how;
}

// the kit's light (kit.ts keeps the numbers to itself): from the upper left, a little toward the camera
const LX = -0.52;
const LY = -0.62;
const LZ = 0.59;

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * To the nearest whole pixel, a half going up, and a hair's breadth short of a half going up with
 * it. (A frame is painted on a sheet cut down to it, wherever on the canvas that is: sums that come
 * to a half on paper, 12.35 + 7.15, must round the same way whatever was added to them first.)
 */
const snap = (v: number): number => Math.floor(v + 0.5 + 1e-6);

/** A box on the canvas. */
interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * The box that holds a set of discs (each a middle and a radius), with a few pixels to spare for
 * the seam. The canvas is big and a figure fills a small part of it, so a frame is painted on
 * sheets cut down to this box and laid on the canvas at the end: far fewer pixels to stack and to
 * seam. The box is grown to whole blocks of 32 pixels, so that the kit keeps only a few sizes of
 * scratch layer for it, and it is kept on the canvas.
 */
function boxOf(discs: ReadonlyArray<readonly [V, number]>, can: Canvas = BRUTE_CANVAS): Box {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [[x, y], r] of discs) {
    x0 = Math.min(x0, x - r);
    y0 = Math.min(y0, y - r);
    x1 = Math.max(x1, x + r);
    y1 = Math.max(y1, y + r);
  }
  const fit = (lo: number, hi: number, max: number): [number, number] => {
    const a = Math.max(0, Math.floor(lo) - 3);
    const size = Math.min(max, Math.ceil((Math.min(max, Math.ceil(hi) + 3) - a) / 32) * 32);
    return [Math.min(a, max - size), size];
  };
  const [x, w] = fit(x0, x1, can.w);
  const [y, h] = fit(y0, y1, can.h);
  return { x, y, w, h };
}

function pick(a: V, b: V, score: (v: V) => number): V {
  return score(a) >= score(b) ? a : b;
}

// ---------------------------------------------------------------------------------------------
// Parts

/**
 * A rounded mass, lit as the kit's `ball` is. (cx, cy) is the middle of its widest row: it reaches
 * `up` above that and `down` below it, so it can sag like a sack. `pow` = 2 is a ball; more than
 * that squares it off toward a slab (a back), whose middle then lies flat to the camera and takes
 * the middle tone.
 */
function mass(p: Px, cx: number, cy: number, rx: number, up: number, down: number, pow: number, ramp: Ramp): void {
  for (let y = Math.floor(cy - up); y <= Math.ceil(cy + down); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const nx = (x + 0.5 - cx) / rx;
      const ny = (y + 0.5 - cy) / (y + 0.5 < cy ? up : down);
      const ax = Math.abs(nx);
      const ay = Math.abs(ny);
      const d = ax ** pow + ay ** pow;
      if (d > 1) continue;
      // the surface |x|^p + |y|^p + z^p = 1, and which way it faces
      const gx = Math.sign(nx) * ax ** (pow - 1);
      const gy = Math.sign(ny) * ay ** (pow - 1);
      const gz = (1 - d) ** ((pow - 1) / pow);
      const i = (gx * LX + gy * LY + gz * LZ) / (Math.hypot(gx, gy, gz) || 1);
      p.set(x, y, ramp[i > 0.62 ? 3 : i > 0.22 ? 2 : 1]);
    }
  }
}

/** A crease in the hide: one tone darker where the pixel is one of the ramp's own, or (`deep`) the ramp's darkest. */
function crease(p: Px, x: number, y: number, ramp: Ramp, deep = false): void {
  const c = p.get(x, y);
  if (c === ramp[3]) p.set(x, y, ramp[deep ? 1 : 2]);
  else if (c === ramp[2]) p.set(x, y, ramp[1]);
}

/**
 * A short thick leg and its flat foot, which points along the grid: toe down the screen and to the
 * right, a row lower for every four across (seen from behind: the heel, and less of the foot, its
 * toe up the screen and to the right). `hip` is the middle of its top; `sole` the row the heel
 * stands on. `heel` lifts the heel off the floor (up on his toes).
 */
function stump(p: Px, hip: V, ankleX: number, sole: number, heel: number, S: number, ramp: Ramp, back: boolean): void {
  const tall = snap(6 * S);
  const w = snap((back ? 12 : 14) * S);
  const x0 = snap(ankleX) - snap((back ? 6 : 5.5) * S);
  /** How far column `i` of the foot is slid along the grid. */
  const slid = (i: number): number => (back ? -1 : 1) * Math.floor(i / 4);
  limb(p, hip[0], hip[1], ankleX, sole - tall - heel * 0.7 + 1, 5.6 * S, 5 * S, ramp);
  for (let i = 0; i < w; i++) {
    const k = 1 - i / (w - 1);
    const up = snap(heel * k * k * 1.6) - slid(i);
    // (the top of the foot slopes down to the toes)
    const top = sole - tall + 1 - up + (i >= w - 1 ? 2 : i >= w - snap(4 * S) ? 1 : 0) + (i === 0 ? 1 : 0);
    for (let y = top; y <= sole - up; y++) p.set(x0 + i, y, y === top || (i === 0 && y < sole - up) ? ramp[3] : y === sole - up ? ramp[1] : ramp[2]);
  }
  if (back) return;
  // three toes
  for (const t of [3, 6]) {
    const i = w - 1 - snap(t * S);
    for (let j = 1; j <= snap(2 * S); j++) p.set(x0 + i, sole + slid(i) - j, ramp[1]);
  }
}

/** How far each tatter of the hide hangs below its hem, from one side to the other. */
const TATTERS = [2, 5, 1, 4, 0, 5, 3, 1, 4, 2];

/**
 * The ragged hide round the hips: it widens from `half` at `top` to `half + flare` at the hem,
 * and below the hem it is torn into strips, each cut on a slant. `drift` carries the hem sideways
 * (a stride, his own movement); the wind lifts and drops the strips one after another (`blow`
 * pixels). `band` = it is seen from behind, with the roll of hide it is tied by along its top.
 */
function hide(p: Px, cx: number, top: number, hem: number, half: number, flare: number, drift: number, wind: number, blow: number, S: number, ramp: Ramp, band: boolean): void {
  const tw = 4.4 * S;
  const y0 = snap(top);
  const wide = half + flare;
  lit(p, ramp, [0, 2], [1, 3], (l) => {
    for (let y = y0; y <= hem + 8 * S; y++) {
      const t = Math.min(1.5, (y - y0) / Math.max(1, hem - y0));
      const h = half + flare * Math.min(1, t);
      const mid = cx + drift * t * t;
      for (let x = snap(mid - h); x < snap(mid + h); x++) {
        const k = (x - cx - drift + wide) / tw;
        const i = Math.floor(k);
        const f = k - i;
        const len = TATTERS[((i % TATTERS.length) + TATTERS.length) % TATTERS.length] + Math.sin((wind + i * 0.27) * Math.PI * 2) * blow;
        if (y > hem + (len - (i % 2 === 0 ? f : 1 - f) * 2.4) * S) continue;
        l.set(x, y, INK);
      }
    }
  });
  // two folds run down it
  for (const f of [-0.4, 0.34]) {
    for (let y = y0 + snap(3 * S); y < hem + 2 * S; y++) {
      const t = (y - y0) / Math.max(1, hem - y0);
      const x = snap(cx + drift * t * t + f * (half + flare * Math.min(1, t)) + Math.sin((wind + f - t * 0.5) * Math.PI * 2) * blow * 0.7 * t);
      if (p.get(x, y) === ramp[2]) p.set(x, y, ramp[1]);
    }
  }
  if (!band) return;
  for (let x = snap(cx - half); x < snap(cx + half); x++) {
    if (p.has(x, y0)) p.set(x, y0, ramp[3]).set(x, y0 + 1, ramp[2]).set(x, y0 + 2, ramp[1]);
  }
}

/**
 * The club: a handle with a knob at its foot, swelling to a thick round end. `hand` is where it
 * is held and `deg` the way its thick end points (0 = screen-right, 90 = up). The brute's is
 * studded with steel; the guardian's is bound with iron bands whose edges burn (`glow`, -1..1, is
 * where their light has got to as it rises and falls), and spiked.
 */
function club(p: Px, hand: V, deg: number, S: number, bound: boolean, glow: number, lights: Light[], long = 1): void {
  const [dx, dy] = dir(deg);
  const x0 = hand[0] - dx * GRIP * S;
  const y0 = hand[1] - dy * GRIP * S;
  // (`long`: how much of its length shows. Trailing away from us or toward us it is seen partly end on.)
  const L = (GRIP + CLUB * long * (NINE ? 1.12 : 1)) * S;
  const neck = (GRIP + 4) * S;
  const fat = (NINE ? 8.2 : 7) * S;
  const rad = (a: number): number => (a < 2 * S ? 2.7 * S : a < neck ? 2.3 * S : 2.3 * S + (fat - 2.3 * S) * ((a - neck) / (L - neck)) ** 1.05);
  // (two iron bands, each this wide either side of its middle; the outer one is spiked)
  const bands = [(GRIP + (14 - GRIP) * long) * S, (GRIP + (24.5 - GRIP) * long) * S];
  const bw = 2.9 * S;
  const pad = fat + 5 * S;
  for (let y = Math.floor(Math.min(y0, y0 + dy * L) - pad); y <= Math.ceil(Math.max(y0, y0 + dy * L) + pad); y++) {
    for (let x = Math.floor(Math.min(x0, x0 + dx * L) - pad); x <= Math.ceil(Math.max(x0, x0 + dx * L) + pad); x++) {
      const px = x + 0.5 - x0;
      const py = y + 0.5 - y0;
      const along = px * dx + py * dy;
      const a = Math.max(0, Math.min(L, along));
      const r = rad(a);
      const ox = px - dx * a;
      const oy = py - dy * a;
      const d2 = ox * ox + oy * oy;
      const s = (ox * LX + oy * LY) / (r * 0.81);
      const tone = s > 0.5 ? 3 : s < -0.45 ? 1 : 2;
      if (d2 <= r * r) {
        let c = INDIGO[tone];
        if (NINE) {
          // (a tree's trunk: its bark ridged along it, knots in it, two bands of iron round it)
          const ridge = hash(Math.floor(along / (1.6 * S)), Math.floor((Math.atan2(oy, ox) + 4) * 3), 77);
          c = BARK[Math.max(0, Math.min(4, tone + (ridge < 0.22 ? -1 : ridge > 0.85 ? 1 : 0)))];
          for (const b of bands) if (Math.abs(along - b) <= bw * 0.8) c = IRON[Math.max(0, tone - 1)];
          if (along < GRIP * S + 2 * S) c = BARK[Math.max(0, tone - 1)];
        } else if (bound) {
          for (const b of bands) {
            const off = Math.abs(along - b);
            // (hot at its edges, where it bites the wood)
            if (off <= bw) c = off > bw - 1.25 ? FLAME[tone + 1] : IRON[tone - 1];
          }
        }
        p.set(x, y, c);
      } else if (bound && along > 0 && along < L) {
        // two spikes stand out of the outer band, one each side
        const out = Math.sqrt(d2) - r;
        if (out <= 4 * S && Math.abs(along - bands[1]) <= (1 - out / (4 * S)) * 1.9 * S) p.set(x, y, IRON[s > 0 ? 3 : 2]);
      }
    }
  }
  if (NINE) {
    // (knots in its bark, and the stumps of two branches near its head)
    for (const [a0, v] of [[11, 1.5], [17, -2.5], [21, 2.8]] as const) {
      const a = (GRIP + (a0 - GRIP) * long) * S;
      const kx = snap(x0 + dx * a - dy * v * S);
      const ky = snap(y0 + dy * a + dx * v * S);
      if (p.has(kx, ky)) p.set(kx, ky, BARK[0]).set(kx + 1, ky, BARK[1]);
    }
    for (const [a0, side] of [[26, 1], [29, -1]] as const) {
      const a = (GRIP + (a0 - GRIP) * long) * S;
      const bx = x0 + dx * a;
      const by = y0 + dy * a;
      limb(p, bx, by, bx - dy * side * fat * 1.25 + dx * 2 * S, by + dx * side * fat * 1.25 + dy * 2 * S, 1.3 * S, 0.8 * S, BARK);
    }
    return;
  }
  if (bound) {
    for (const b of bands) lights.push({ x: x0 + dx * b, y: y0 + dy * b, r: 8.5 * S, color: FLAME[2], a: 0.3 + glow * 0.08 });
    return;
  }
  // steel studs, in the thick end
  for (const [a0, v] of [[15.5, 0.6], [19, -2], [21.5, 2.2], [24, -0.8], [26.5, 3.8], [27.5, -4.4], [30, 0.4]] as const) {
    const a = GRIP + (a0 - GRIP) * long;
    const sx = snap(x0 + dx * a * S - dy * v * S - 1);
    const sy = snap(y0 + dy * a * S + dx * v * S - 1);
    if (!p.has(sx, sy) || !p.has(sx + 1, sy + 1)) continue;
    p.rect(sx, sy, 2, 2, STEEL[4]).set(sx + 1, sy + 1, STEEL[2]);
    for (const [ex, ey] of [[2, 1], [1, 2], [2, 2]] as const) if (p.has(sx + ex, sy + ey)) p.set(sx + ex, sy + ey, INDIGO[1]);
  }
}

/**
 * A fist. `held` = it is round a handle (the fingers' creases run across it); otherwise it hangs,
 * knuckles down, and `open` (0..1) lets the fingers out of it.
 */
function fist(p: Px, at: V, S: number, ramp: Ramp, held: boolean, open: number): void {
  const x = snap(at[0]);
  const y = snap(at[1]);
  if (!held && open > 0.3) {
    // the fingers, uncurled: a block below the palm, slit into three
    const w = snap(8 * S);
    const x0 = snap(at[0] - 4.4 * S);
    const long = snap((open > 0.7 ? 8 : 6.4) * S);
    for (let i = 0; i < w; i++) {
      const slit = i === snap(w / 3) || i === snap((w * 2) / 3);
      const end = long - (i < snap(w / 3) || i >= w - 1 ? 1 : 0);
      for (let j = snap(2 * S); j < end; j++) p.set(x0 + i, y + j, slit || j === end - 1 ? ramp[1] : i === 0 ? ramp[3] : ramp[2]);
    }
  }
  ball(p, at[0], at[1], 5.3 * S, 5 * S, ramp);
  if (held) {
    for (const row of [-1.6, 1.4]) for (let i = 0; i < snap(5 * S); i++) crease(p, x - snap(1.5 * S) + i, snap(at[1] + row * S), ramp);
  } else if (open <= 0.3) {
    for (const col of [-1.8, 1.4]) for (let j = 0; j < snap(3 * S); j++) crease(p, snap(at[0] + col * S), y + snap(1 * S) + j, ramp);
  }
}

/** A spike: a thin cone from the middle of its base, lit on its upper-left side. */
function spike(p: Px, base: V, deg: number, long: number, half: number, ramp: Ramp): void {
  const [dx, dy] = dir(deg);
  for (let y = Math.floor(base[1] - long - half); y <= Math.ceil(base[1] + long + half); y++) {
    for (let x = Math.floor(base[0] - long - half); x <= Math.ceil(base[0] + long + half); x++) {
      const px = x + 0.5 - base[0];
      const py = y + 0.5 - base[1];
      const along = px * dx + py * dy;
      const across = -px * dy + py * dx;
      if (along < -1 || along > long || Math.abs(across) > half * (1 - along / long)) continue;
      p.set(x, y, ramp[across * (dx * LY - dy * LX) > 0 ? 2 : 3]);
    }
  }
}

/** The guardian's great shoulder plate: a dome of iron over the boulder of the shoulder, with a lip along its lower edge and three spikes. */
function pauldron(p: Px, sh: V, S: number, iron: Ramp): void {
  const cx = sh[0] - 1.5 * S;
  const cy = sh[1] - 1 * S;
  // (the spikes stand on the dome, pointing out from its middle)
  for (const deg of [148, 96, 46]) {
    const [dx, dy] = dir(deg);
    spike(p, [cx + dx * 9 * S, cy + dy * 6.4 * S], deg, 7.5 * S, 2.9 * S, iron);
  }
  mass(p, cx, cy, 10.5 * S, 7.6 * S, 4.6 * S, 2.3, iron);
  // the lip: the plate's lowest pixels, light then dark
  for (let x = Math.floor(cx - 11 * S); x <= Math.ceil(cx + 11 * S); x++) {
    for (let y = Math.ceil(cy + 5 * S); y > cy; y--) {
      if (!iron.includes(p.get(x, y) ?? '')) continue;
      p.set(x, y, iron[1]).set(x, y - 1, iron[3]);
      break;
    }
  }
}

/** An arm of two thick bones, with a boulder of a shoulder at its top. */
function armOf(p: Px, sh: V, el: V, hand: V, S: number, ramp: Ramp, boulder: number): void {
  limb(p, sh[0], sh[1], el[0], el[1], 5.6 * S, 5 * S, ramp);
  limb(p, el[0], el[1], hand[0], hand[1], 5 * S, 5.2 * S, ramp);
  ball(p, sh[0], sh[1] - 0.5 * S, boulder * S, boulder * 0.86 * S, ramp);
}

// The head, as pixel maps (15 across, with its ears): a narrow skull over a jaw wider than it is.
// L M D = the hide, light to dark; e = an ear in shade; K = the dark of a socket or of the open
// mouth; E = an eye; T t = a tusk.
//
// It is seen from one side (TURNED TO THE GRID, above): the face is two pixels toward the side he
// faces, the nearer eye and tusk whole and the further ones cut short by the edge of the head; on
// the near side there is the temple, the cheek and the whole of an ear, and the further ear is
// hidden. From behind it is the other way about: the fold of the neck is toward the far side, and
// on the near side there is the ear, seen from behind.
const FACE = [
  '.....LLLLLM....',
  '...LLLLLLLMMM..',
  'LL.LLLLLLMMMM..',
  'LeLLLDDDDDDDDD.',
  '.LLLLKEKDDDKED.',
  '..LLLKEEKMKEED.',
  '.LLLTLMMDMDMTD.',
  '.LLLTTLMMMMMTD.',
  '.LLLTTKKKKKKTD.',
  '.LLLLtLLMMMMtD.',
  '.LLLLMMMMMMMDD.',
  '..LLMMMMMMMDD..',
  '...MMMMMMDDD...',
];
const FACE_ROAR = [
  '.....LLLLLM....',
  '...LLLLLLLMMM..',
  'LL.LLLLLLMMMM..',
  'LeLLLDDDDDDDDD.',
  '.LLLLKEKDDDKED.',
  '..LLLKEEKMKEED.',
  '.LLLLLMMDMDMDD.',
  '.LLLLLKKKKKKDD.',
  '.LLLTKKKKKKKTD.',
  '.LLLTTKKKKKKTD.',
  '.LLLTTKKKKKKTD.',
  '.LLLLtLLMMMMtD.',
  '.LLLLMMMMMMMDD.',
  '..LLMMMMMMMDD..',
  '...MMMMMMDDD...',
];
// (BRUTE_RAMPAGE, the bull rush: his head thrust down before his chest, brow first: more of his crown, his heavy brow over
// eyes that are slits under it, his tusks jutting forward under them, his mouth out of sight)
const FACE_DOWN = [
  '....LLLLLLM....',
  '..LLLLLLLLMMM..',
  '.LLLLLLLLLMMMM.',
  'LeLLLLLLLMMMMM.',
  '.LLLLLLLMMMMMD.',
  '.LLLLDDDDDDDDD.',
  '.LLLKEKKDKKEKD.',
  '.LLLTDDDDDDDTD.',
  '..LTTMMMMMMTTD.',
  '...tMMMMMMDDt..',
  '....MMMMMDDD...',
];
const NAPE = [
  '.....LLLLLM....',
  '...LLLLLLLMMM..',
  '..LLLLLLLMMMM.e',
  '.LLLLLLLMMMMMee',
  '.MLLLLLMMMMMDee',
  '..LLLLMMMMMMD..',
  '..LLLMMMMMMDD..',
  '.LLLMMMMMMDDD..',
  '.LDDDDDDDDMDD..',
  '.LLLMMMMMMMDD..',
  '..LLMMMMMMDD...',
];

/** The head: tiny. (cx, top) is the middle of its top edge. Returns where its eyes are (to light them), if they show. */
function head(p: Px, cx: number, top: number, ramp: Ramp, back: boolean, roar: boolean, broken: boolean, low = false): V | null {
  const x0 = snap(cx - 7.5);
  const y0 = snap(top);
  const shade = dim(ramp);
  stamp(p, x0, y0, back ? NAPE : low ? FACE_DOWN : roar ? FACE_ROAR : FACE, { L: ramp[3], M: ramp[2], D: ramp[1], e: shade[3], K: INK, E: SOCKET, T: BONE[3], t: BONE[2] });
  if (back) return null;
  if (low) return [x0 + 8.5, y0 + 6];
  if (broken) {
    // the nearer tusk is snapped off short
    const ty = y0 + (roar ? 9 : 7);
    p.set(x0 + 4, ty - 1, roar ? INK : ramp[3]).set(x0 + 4, ty, ramp[3]).set(x0 + 5, ty, roar ? INK : ramp[3]).set(x0 + 4, ty + 1, ramp[3]).set(x0 + 5, ty + 1, BONE[2]);
    // ... and his eyes burn hotter: there is gold at the heart of each (he looks the way he faces)
    p.set(x0 + 7, y0 + 5, FLAME[4]).set(x0 + 12, y0 + 5, FLAME[4]);
  }
  return [x0 + 9.5, y0 + 5];
}

// ---------------------------------------------------------------------------------------------
// THE TROLLS' NEW MOVES (the art chat, 9 Oct 2026). The owner's yes in the main chat, 9 Oct, by 08:15
// (as that chat posted it at 08:30): the green troll (the brute) a club swing and its slam; the red
// troll (the guardian) a club swing, a slam, and a charge along a marked line; and always a basic
// single-target attack to use while the big ones cool down. And to the art chat, 09:17: "It’s not
// the big red circles I have a problem with, it’s that every attack is a big slam on the ground." So
// the slam stays as it was, and beside it:
//   THE SWING (`swing`, prop 1): the club in both fists at his belly, swung round him LEVEL, from
//     wound back on his club side, round through straight ahead (the blow), and on round to his
//     other side, its head leaving a streak in the air behind it (Pose.sweep).
//   THE CHARGE (`chargeWind`, `charge`, `chargeStop`, prop 2): his head goes down, he roars and
//     scrapes a foot back twice, kicking dust (the warning, while the line it will run along is
//     marked on the floor: art/charge_lane.ts); then he runs at it head down, the club hauled at
//     his side (a loop, for as long as the rules have him charge); and he skids to a stop.
// Behind a switch that is off: while it is, the trolls are exactly as they were.

/** The switch: their new moves (AnimSet.clips.moves) are made only while it is on. */
export const TROLL_MOVES = { on: false };

/** A smear of air (the brute's club is plain wood: its streak gives off no light). */
const AIR: Ramp = ['#3a3058', '#5c5480', '#9a92c0', '#d8d2f0', '#f4f0ff'];

/**
 * THE LEVEL SWING: for the club swung round him level at the height of his belly, `deg` degrees
 * round from straight ahead toward his club side (+) or his other side (-): where his fists are on
 * it, the way it points on the screen, how much of its length shows, and whether it is behind him.
 * Seen from the corner, the circle it goes round is an oval: the club is seen end on (shortest) as
 * it points at the eye, at full length as it points across, and is behind him while it points away.
 * (Straight ahead is down the screen and to the right when he faces us, up it and to the right when
 * he faces away; his club side is on the right of the picture either way.)
 */
function levelSwing(deg: number, waist: V, back: boolean, S: number): { at: V; aim: number; long: number; behind: boolean } {
  const fwd = back ? -1 : 1;
  const a = (deg * Math.PI) / 180;
  // (ahead and his club side as the screen shows them, a tile's 16 pixels across to one: (1, fwd / 2) and (1, -fwd / 2))
  const vx = Math.cos(a) + Math.sin(a);
  const vy = 0.5 * fwd * (Math.cos(a) - Math.sin(a));
  // Wound back round on his club side, he LIFTS it, as one winds up to swing a bat: his fists come up
  // to his shoulder and the club stands up behind it. Swung level, its head hangs a little lower than
  // its handle. Through to his other side, it rises a little again as his arms come round.
  // (cocked back slantwise, not stood upright: his slam's warning is the club straight up over his head, and the two must not be mistaken)
  const lift = clamp01((deg - 60) / 40);
  const after = clamp01((-deg - 70) / 40);
  const elev = ((-8 + lift * 38 + after * 30) * Math.PI) / 180;
  const R = 13 * S * (1 - 0.2 * lift);
  // (facing away, his club side is the nearer: wound back toward us, his fists are lower on the screen for it, and are raised the more)
  const at: V = [waist[0] + vx * R + lift * 3 * S, waist[1] + vy * R - (lift * (back ? 14 : 10) + after * 5) * S];
  // (up the screen, a length of it standing upright shows a little longer than one lying across: 1.225 to 1.414)
  const dx = Math.cos(elev) * vx;
  const dy = Math.cos(elev) * vy - Math.sin(elev) * 1.225;
  return { at, aim: (Math.atan2(-dy, dx) * 180) / Math.PI, long: Math.min(1, Math.max(0.42, Math.hypot(dx, dy) / Math.SQRT2)), behind: vy < -0.12 };
}

/**
 * THE STREAK the club's head leaves as it is swung round level (Pose.sweep: how many degrees of the
 * swing it has just come through, + when it came round from his club side). It lies along the oval
 * the head goes round: widest just behind the club, thinning and breaking up toward its oldest end.
 * What of it is behind him goes on `behind`, the rest on `front`. The brute's is a smear of air; the
 * guardian's, of the light of its club's burning bands (and it gives off a little of that light).
 */
function swingStreak(front: Px, behind: Px, deg: number, sweep: number, waist: V, back: boolean, S: number, G: boolean, lights: Light[]): V[] {
  const ramp = G ? FLAME : AIR;
  const n = Math.max(8, Math.round(Math.abs(sweep) / 3));
  const path: V[] = [];
  for (let j = n; j >= 0; j--) {
    const u = j / n;
    const s = levelSwing(deg + sweep * u, waist, back, S);
    const [cx, cy] = dir(s.aim);
    const L = (GRIP + CLUB * s.long - 5) * S;
    const x = s.at[0] + cx * L;
    const y = s.at[1] + cy * L;
    path.push([x, y]);
    const r = S * (1 + 5.5 * Math.pow(1 - u, 0.8));
    const p = s.behind ? behind : front;
    for (let yy = Math.floor(y - r); yy <= Math.ceil(y + r); yy++) {
      for (let xx = Math.floor(x - r); xx <= Math.ceil(x + r); xx++) {
        const d = Math.hypot(xx + 0.5 - x, yy + 0.5 - y);
        if (d > r || !p.inside(xx, yy)) continue;
        // (the oldest part of it is breaking up)
        if (u > 0.5 && hash(xx, yy, 13) < (u - 0.5) * 2.2) continue;
        const edge = d > r - 1.2;
        p.set(xx, yy, edge ? ramp[u < 0.5 ? 2 : 1] : u < 0.18 ? ramp[4] : u < 0.45 ? ramp[3] : u < 0.75 ? ramp[2] : ramp[1]);
      }
    }
  }
  if (G) {
    const strong = Math.min(1, Math.abs(sweep) / 90);
    for (const k of [0.1, 0.4]) {
      const at = path[Math.round((1 - k) * (path.length - 1))];
      lights.push({ x: at[0], y: at[1], r: 12 * S, color: FLAME[2], a: 0.3 * strong });
    }
  }
  return path;
}

/**
 * THE RAMPAGE'S SWING (BRUTE_RAMPAGE, props 3 and 5): the level swing (`deg` round from straight ahead, as above), and the
 * club also RAISED OVER THE TOP by `E` degrees: 0 level, 90 more straight up, more than that tipped back over his head, less
 * than 0 brought down before him to the floor. His fists go up with it on an arc before him (over his head when it is
 * upright, down by his knees when it is brought down), and the club points the way it is swung and raised. Seen from the
 * corner, as the level swing is: it is behind him while it points away from the eye.
 */
function rampSwing(deg: number, E: number, waist: V, back: boolean, S: number): { at: V; aim: number; long: number; behind: boolean } {
  const base = levelSwing(deg, waist, back, S);
  if (Math.abs(E) < 1e-6) return base;
  const fwd = back ? -1 : 1;
  const a = (deg * Math.PI) / 180;
  const vx = Math.cos(a) + Math.sin(a);
  const vy = 0.5 * fwd * (Math.cos(a) - Math.sin(a));
  const lift = clamp01((deg - 60) / 40);
  const after = clamp01((-deg - 70) / 40);
  const elev = ((-8 + lift * 38 + after * 30 + E) * Math.PI) / 180;
  // (the fists on their arc: out before him and up over his head, or down before his knees; never further than his arms reach)
  // (going up they first come in before his belly, between his shoulders, and then rise: never past a shoulder, so that an arm
  // is never folded flat)
  const into = clamp01(E / 18);
  const inward = 14 * S * into * into * (3 - 2 * into);
  const e = ((E > 0 ? Math.min(125, Math.max(0, E - 10)) : Math.max(-50, E)) * Math.PI) / 180;
  const R = 13 * S;
  const rise = (e > 0 ? 33 : 24) * S;
  const at: V = [base.at[0] + vx * R * (Math.cos(e) - 1) * 0.35 - inward, base.at[1] + vy * R * (Math.cos(e) - 1) * 0.35 - rise * Math.sin(e)];
  const dx = Math.cos(elev) * vx;
  const dy = Math.cos(elev) * vy - Math.sin(elev) * 1.225;
  return { at, aim: (Math.atan2(-dy, dx) * 180) / Math.PI, long: Math.min(1, Math.max(0.42, Math.hypot(dx, dy) / Math.SQRT2)), behind: Math.cos(elev) * vy < -0.12 };
}

/**
 * THE RAMPAGE'S STREAK (as swingStreak's, a smear of air: the brute's club gives off no light): behind the club's head along
 * the way it has just come, round (`over` false: `sweep` degrees of the level swing) or over the top (`over`: `sweep` degrees of
 * its raising, the slam brought down).
 */
function rampStreak(front: Px, behind: Px, deg: number, E: number, over: boolean, sweep: number, waist: V, back: boolean, S: number): void {
  const n = Math.max(8, Math.round(Math.abs(sweep) / 3));
  for (let j = n; j >= 0; j--) {
    const u = j / n;
    const s = rampSwing(over ? deg : deg + sweep * u, over ? E + sweep * u : E, waist, back, S);
    const [cx, cy] = dir(s.aim);
    const L = (GRIP + CLUB * s.long - 5) * S;
    const x = s.at[0] + cx * L;
    const y = s.at[1] + cy * L;
    const r = S * (1 + 5.5 * Math.pow(1 - u, 0.8));
    const p = s.behind ? behind : front;
    for (let yy = Math.floor(y - r); yy <= Math.ceil(y + r); yy++) {
      for (let xx = Math.floor(x - r); xx <= Math.ceil(x + r); xx++) {
        const d = Math.hypot(xx + 0.5 - x, yy + 0.5 - y);
        if (d > r || !p.inside(xx, yy)) continue;
        if (u > 0.5 && hash(xx, yy, 13) < (u - 0.5) * 2.2) continue;
        const edge = d > r - 1.2;
        p.set(xx, yy, edge ? AIR[u < 0.5 ? 2 : 1] : u < 0.18 ? AIR[4] : u < 0.45 ? AIR[3] : u < 0.75 ? AIR[2] : AIR[1]);
      }
    }
  }
}

/**
 * Dust KICKED BACK by a foot that scrapes the floor (the charge's warning) or digs in (its stop):
 * puffs thrown from (x, y) away from the way he faces and up, `t` (0..1) of the way through their
 * short life, thinning as they go. The dull violet of the floor's own dust; it gives off no light.
 */
function kicked(p: Px, x: number, y: number, t: number, back: boolean, S: number, spread = 1): void {
  if (t <= 0 || t >= 1) return;
  const fwd = back ? -1 : 1;
  const out = 1 - (1 - t) * (1 - t);
  for (const [far, up, big, side] of [[9, 5, 3.4, 0], [15, 3, 2.6, 2.5], [6, 9, 2.4, -2], [19, 7, 1.8, 1]] as const) {
    // (behind the foot: up the screen and to the left when he faces us, down it and to the left when he faces away)
    const cx = x - (far * out + 2) * S * spread;
    const cy = y - fwd * (far * 0.5 * out) * S * spread - up * out * S + side * S;
    const r = big * S * (1 - 0.3 * t);
    for (let yy = Math.floor(cy - r); yy <= Math.ceil(cy + r); yy++) {
      for (let xx = Math.floor(cx - r); xx <= Math.ceil(cx + r); xx++) {
        if ((xx + 0.5 - cx) ** 2 + (yy + 0.5 - cy) ** 2 > r * r || !p.inside(xx, yy)) continue;
        if (t > 0.35 && (((xx + yy) % 2) + 2) % 2 !== 0) continue;
        if (t > 0.7 && (((xx - yy) % 4) + 4) % 4 !== 0) continue;
        p.set(xx, yy, yy + 0.5 < cy - r * 0.2 ? MAIL[3] : MAIL[2]);
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------
// The rig
//
// What it reads from a Pose:
//   bob            the chest sinks (and the belly swells); a big one folds him over, a negative one stretches him up
//   lean           the shoulders go the way he faces (+) or back (-); far forward, he turns side-on and folds
//   near, far, nearLift, farLift   the feet; a lifted foot throws his weight over the other one (the waddle)
//   swing          a stride: the hanging fist swings against it
//   hx, hy, aim    the club hand, from where it rests beside the head, and the way the club points
//   off            the other hand: 0 hanging by the knee, 1 on the club's handle below the first
//   ohx, ohy       ... moved from there, in pixels
//   act            reared up on his toes, 0..1 (he roars as he rears)
//   pt             roaring, 0..1, whether reared up or not (through the blow, and until he has his breath back)
//   wind, drag     the tatters of the hide; standing still (drag 0) the wind also times his breath,
//                  the turn of his head, the shifting of the club and the opening of his fist
//   behind         facing us: the club is behind him (raised over his head)
//   prop 1         (TROLL_MOVES) THE LEVEL SWING: the club in both fists swung round him level; `aim` is
//                  then how far round from straight ahead (+ his club side), and `sweep` its streak
//   prop 2         (TROLL_MOVES) THE CHARGE: `sweep` is then the life of the dust a scraping foot kicks
//   prop 3, 5      (BRUTE_RAMPAGE) THE RAMPAGE: the club in both fists, swung as in prop 1 (`aim` how far
//                  round from straight ahead) and also raised over the top (`gale`: degrees it is lifted
//                  above that, 90 straight up, more tipped back over his head, less than 0 brought down
//                  before him); `sweep` its streak, round (prop 3) or over the top (prop 5); `step` how
//                  far all of him, feet and all, is off the floor (his leap: picture pixels; below 0,
//                  crouched: all of him above his feet lowered on his bent legs)
//   prop 4         (BRUTE_RAMPAGE) THE BULL RUSH: `gale` how far his head is thrust down before his
//                  chest, brow first (pixels); `ohx`, `ohy` the free fist moved (to the floor, his
//                  knuckles down); `sweep` the life of the dust a scraping or digging foot kicks
// (in props 3 to 5 a step goes along the grid exactly, two pixels across for one down: art/action_f3_fx.ts
// follows his feet on the floor, tile by tile, as the game carries him)
// and `how`: how he carries the club while his other hand is not on it (Carry).

/** (the rampage) An elbow whose fist goes from below its shoulder to above it: see the rig. `out` is the side it is out to (-1 screen-left). */
function rampElbow(sh: V, hand: V, out: number, S: number): V {
  const a = joint(sh, hand, UPPER * S, FORE * S, 1);
  const b = joint(sh, hand, UPPER * S, FORE * S, -1);
  // (low, as the rig chooses it otherwise: down, and out)
  const low = 0.3 * a[1] + out * a[0] >= 0.3 * b[1] + out * b[0] ? a : b;
  const high = out * a[0] - 0.8 * a[1] >= out * b[0] - 0.8 * b[1] ? a : b;
  const k = clamp01((sh[1] - hand[1] + 6) / 12);
  const w = k * k * (3 - 2 * k);
  return [low[0] + (high[0] - low[0]) * w, low[1] + (high[1] - low[1]) * w];
}

/** From one angle to another, the short way round, in degrees. */
function turnTo(a: number, b: number, t: number): number {
  return a + ((((b - a) % 360) + 540) % 360 - 180) * t;
}

function ogre(q: Pose, back: boolean, G: boolean, how: Carry, cut: Box | null = null, chief = false): Painted {
  // (the floor point: on the canvas, or on sheets cut down to the box that holds this frame. See below.)
  // (the troll chieftain is the brute's rig, bigger (CHIEF), on a bigger canvas of his own)
  const can = chief ? CHIEF_CANVAS : BRUTE_CANVAS;
  const ax = cut ? can.ax - cut.x : can.ax;
  const floorY = cut ? can.ay - cut.y : can.ay;
  const S = chief ? CHIEF : G ? GUARDIAN : 1;
  const u = (n: number): number => n * S;
  // (BRUTE_RAMPAGE: the rampage, props 3 and 5; the bull rush, prop 4)
  const RAMP = q.prop === 3 || q.prop === 5;
  const RUSH = q.prop === 4;
  /** (the rampage) How far all of him is off the floor, feet and all: his leap; below 0, crouched on bent legs. */
  const air = RAMP ? q.step : 0;
  /** (props 3 to 5) How far down the screen a step goes for each of its pixels across: along the grid exactly. */
  const SY = RAMP || RUSH ? 1.8 : 1.6;
  // Everything of him above his feet is measured up from `ay`: the floor, while his legs hold him.
  // Dying, his knees let him down (DOWN): all of it comes that much nearer the floor, and his legs,
  // whose feet stay where they stood, are that much shorter under him.
  const ay = floorY + (DOWN ? u(DOWN.sink) : 0) - air;
  const flesh = G ? GORE : FLESH;
  const shade = dim(flesh);
  const lights: Light[] = [];
  const fwd = back ? -1 : 1;
  /** The side further from the camera: screen-right when he faces us, screen-left when he faces away. */
  const farSide = back ? -1 : 1;

  // --- what the pose says ---
  // (+ = the near foot is in the air and the far one carries him; the kit's walk puts some of this in `lean`)
  const roll = q.nearLift - q.farLift;
  const lean = q.lean - Math.round(roll * 0.8);
  const walk = Math.min(1, Math.abs(q.swing) + Math.abs(roll));
  const calm = 1 - Math.min(1, Math.max(q.drag, walk));
  const ph = q.wind * Math.PI * 2;
  const rear = clamp01(q.act);
  const roar = Math.max(rear, clamp01(q.pt));
  const fold = clamp01(lean / 9);
  // (a footfall drops him further than a hero: he is heavy)
  const dipOf = (bob: number, r: number): number => (bob + walk * (1 - Math.abs(r))) * S;
  const Y = dipOf(q.bob, roll);
  const up = rear * u(2.5);

  // --- where things are ---
  const X = ax + u(lean) + roll * farSide * u(2.8);
  // (reared up, he shrugs his shoulders to his ears)
  const shY = ay - u(H_SHO) + Y - up - rear * u(1.5);
  // the shoulder over the planted foot drops; and the line of the shoulders runs along the grid, the
  // nearer one lower on the screen than the further one (folded over his club he is side-on, and it does not)
  const tilt = (roll * 1.5 - SHOULDER_TILT * (1 - fold)) * farSide * S;
  const clubSh: V = [X + u(SPREAD) * (1 - 0.5 * fold), shY + tilt + fold * u(1)];
  const offSh: V = [X - u(SPREAD) * (1 - 0.8 * fold), shY - tilt];

  // WHERE THE POSE HOLDS THE CLUB: up beside the head at rest. Walking, it rides a beat behind the body.
  const lagBob = roll * roll - q.swing * q.swing + 2 * q.swing * roll > 0 ? 1 : 0;
  const handDip = walk > 0.5 ? dipOf(lagBob, (roll - q.swing) / Math.SQRT2) : Y;
  const shift = calm * Math.sin(ph);
  const k = clamp01(q.off);
  // WHERE IT TRAILS (THE CLUB TRAILS, at the top): all the way there until his other hand goes to the handle.
  const trail = how === 'high' ? 0 : 1 - k;
  // THE LEVEL SWING (prop 1, TROLL_MOVES): both fists on it at his belly, `aim` degrees round from straight ahead
  const waist: V = [X + u(1.5), ay - u(27) - up + Y * 0.6];
  const level = q.prop === 1 ? levelSwing(q.aim, waist, back, S) : RAMP ? rampSwing(q.aim, q.gale, waist, back, S) : null;
  const heldAim = level ? level.aim : q.aim + (shift * 2.5 + walk * 3 * (roll * roll - q.swing * q.swing)) * (1 - trail);
  const held: V = level ? [level.at[0] + u(q.hx), level.at[1] + u(q.hy)] : [X + u(SPREAD + 11.5 + q.hx) + shift * 0.6 * (1 - trail), ay - u(H_SHO + 13.5) - up + handDip + u(q.hy)];
  // each fist where it hangs when it has nothing to do: by the knee, swinging against the stride
  const hang: V = [offSh[0] - u(2.5) - q.swing * u(3.4), offSh[1] + u(25.5) - Math.abs(q.swing) * u(1.4) - q.swing * u(1.4) * fwd];
  // (the bull rush: facing us, it is this fist that is free, and goes to the floor: Pose.ohx, ohy)
  const idle: V = [clubSh[0] + u(2.5) + q.swing * u(3.4) + (RUSH && !back ? u(q.ohx) : 0), clubSh[1] + u(25.5) - Math.abs(q.swing) * u(1.4) + q.swing * u(1.4) * fwd + (RUSH && !back ? u(q.ohy) : 0)];
  // the fist that trails it is his nearer one: it does not swing, it hauls
  const haul = back ? 1 : -1;
  const carrySh = back ? clubSh : offSh;
  /** Where the fist that carries it is; the way the club then points; how much of its length shows; how far up the handle from its foot it is held. */
  let low: V;
  let trailAim: number;
  let trailLong = 1;
  let choke = 0;
  if (how === 'side') {
    // Carried at his side: gripped where the handle begins to swell, his arm hanging and a little
    // bent, the club level and pointing the way he goes (along the grid: down the screen when he
    // faces us, up it when he faces away). It nods with each step.
    low = [carrySh[0] + haul * u(4.5), carrySh[1] + u(21.5) + (handDip - Y) * 0.5];
    trailAim = (back ? 24 : -24) - walk * 3.5 * Math.abs(q.swing) + calm * Math.sin(ph) * 1.5;
    choke = 9;
  } else {
    // Dragged: its thick end on the floor behind him and a little out to his near side (up the
    // screen and to the left of his feet when he faces us; down it, toward us, when he faces
    // away). It does not go with the sway of his walk: it lies where it is and is hauled after
    // him, catching and coming on at every step.
    low = [carrySh[0] + haul * u(3.2) - u(1.2), carrySh[1] + u(24.5) + (handDip - Y) * 0.5];
    const jerk = walk * q.swing * u(1.5);
    const end: V = back ? [ax - u(1) - jerk, ay + u(4.5) + jerk * 0.5] : [ax - u(38.5) - jerk, ay - u(8) - jerk * 0.5];
    trailAim = (Math.atan2(low[1] - end[1], end[0] - low[0]) * 180) / Math.PI;
    trailLong = Math.hypot(end[0] - low[0], end[1] - low[1]) / u(CLUB);
  }
  // where the club is: the point of its handle that is held, the way it points, how much of its length shows
  const at: V = [held[0] + (low[0] - held[0]) * trail, held[1] + (low[1] - held[1]) * trail];
  const aim = trail > 0 ? turnTo(heldAim, trailAim, trail) : heldAim;
  const holdLong = level ? level.long : 1;
  const long = holdLong + (trailLong - holdLong) * trail;
  /** The club is behind him (front view: `behind`; swung level: while it points away from the eye, once both fists are on it). */
  const clubBehind = level ? level.behind && k > 0.5 : q.behind;
  /** Where the streak of a level swing runs (to keep room for it on the sheets). */
  const streakAt: V[] = [];
  if (level && Math.abs(q.sweep) >= 6) {
    for (const f of [0, 0.25, 0.5, 0.75, 1]) {
      const s2 = RAMP ? rampSwing(q.aim + (q.prop === 3 ? q.sweep * f : 0), q.gale + (q.prop === 5 ? q.sweep * f : 0), waist, back, S) : levelSwing(q.aim + q.sweep * f, waist, back, S);
      const [ddx, ddy] = dir(s2.aim);
      const L = u(GRIP + CLUB * s2.long - 5);
      streakAt.push([s2.at[0] + ddx * L, s2.at[1] + ddy * L]);
    }
  }
  /**
   * Where a foot scrapes (prop 2, the charge: Pose.sweep is how far through its life the dust it kicks
   * is): his nearer foot when he faces us, his further one when he faces away, so that the dust it
   * kicks back flies out beside him where it is seen, not behind his bulk.
   */
  /** THE CHIEFTAIN'S BANNER, on his back: where its pole stands and its cloth hangs. */
  const flag = chief ? bannerOf(X, shY, back, S, q.wind, Math.min(1.6, q.drag)) : null;
  const scrapeS = back ? q.far : q.near;
  const scrape: V = [ax + (back ? farSide : -farSide) * u(LEG) + snap(scrapeS * u(3.6)) - u(2), floorY - 2 + (back ? -1 : 1) * snap(u(FOOT_TILT)) + snap(scrapeS * u(SY) * fwd)];
  const [cdx, cdy] = dir(aim);
  const grip: V = [at[0] - cdx * u(6.5), at[1] - cdy * u(6.5)];

  // THE CLUB ARM'S FIST (screen-right). Facing away it is the one that trails the club, and is on
  // it always. Facing us it hangs idle while the club trails from the other, and comes across to
  // the handle as the club comes up.
  // (DOWN: his arms are limp. A fist that would hang lower than the floor lies on it, and has slid outward along it.)
  const laid = (v: V, side: number): V => {
    const rest = floorY - u(3.4);
    return DOWN && v[1] > rest ? [v[0] + side * (v[1] - rest) * 0.55, rest] : v;
  };
  const hand: V = laid(back || trail === 0 ? at : [at[0] + (idle[0] - at[0]) * trail, at[1] + (idle[1] - at[1]) * trail], 1);
  // THE OTHER FIST. Hanging by the knee, or on the handle below the first: on its way up to the
  // handle as he rears, it swings out and round at arm's length, so that the elbow never has to
  // turn inside out; letting go after the blow, it comes straight back down in front of him. But
  // facing us, when the club trails, it is this one that trails it: it is on the handle always,
  // and gives up the top of it to the first as that comes across.
  const high = clamp01((offSh[1] - grip[1]) / u(10)) * clamp01(rear / Math.max(k, 0.01));
  const mid: V = [(hang[0] + grip[0]) / 2, (hang[1] + grip[1]) / 2];
  const via: V = [mid[0] + (offSh[0] - u(26) - mid[0]) * high, mid[1] + (offSh[1] - u(3) - mid[1]) * high];
  const offHand: V = laid(!back && how !== 'high'
    ? [grip[0] + (at[0] - grip[0]) * trail + (RUSH ? 0 : u(q.ohx)), grip[1] + (at[1] - grip[1]) * trail + (RUSH ? 0 : u(q.ohy))]
    : [
      (1 - k) * (1 - k) * hang[0] + 2 * k * (1 - k) * (2 * via[0] - mid[0]) + k * k * grip[0] + u(q.ohx),
      (1 - k) * (1 - k) * hang[1] + 2 * k * (1 - k) * (2 * via[1] - mid[1]) + k * k * grip[1] + u(q.ohy),
    ], -1);

  // (the club arm's elbow is always on the same side of the arm: out and down at rest, out and up when the club is overhead)
  const clubEl = joint(clubSh, hand, u(UPPER), u(FORE), 1);
  // (the rampage, his fists going up before him from his belly to over his head: the elbow, down under the arm while the fist is
  // low, swings out and up as it rises, passing over the arm as it comes level with the shoulder, as an elbow seen from the corner
  // does; never flipped from one side to the other in a frame)
  const offEl = RAMP ? rampElbow(offSh, offHand, -1, S) : pick(joint(offSh, offHand, u(UPPER), u(FORE), 1), joint(offSh, offHand, u(UPPER), u(FORE), -1), (v) => 0.3 * v[1] - v[0]);

  // --- the body: where the hips, the barrel, the hide and the head are ---
  const hipY = ay - u(H_HIP) - up;
  const hipX = ax + (X - ax) * 0.4;
  // the barrel: its top goes with the shoulders, its underside stays over the hips
  const swell = calm * (0.5 - 0.5 * Math.cos(ph - (2.5 / 12) * Math.PI * 2)) + (1 - calm) * clamp01(q.bob) * 0.5;
  const topY = ay - u(back ? H_BACK : H_TOP) + Y - up;
  // (the underside sags as he breathes out, and on the march it wobbles a beat behind his footfalls)
  const botY = ay - u(back ? 21 : H_BOT) - up * 0.6 + Y * 0.12 + swell * u(0.8) + walk * (handDip - Y) * 0.5;
  const bx = ax + (X - ax) * 0.6 + rear * u(3) + (back ? 0 : u(0.5));
  const by = ay - u(back ? H_WIDE_BACK : H_WIDE) + Y * 0.45 - up * 0.8;
  // (it swells as he breathes out, and a footfall or a fold squashes it wider)
  const rx = u(HALF + (back ? 0.5 : 0)) + swell * u(1.4) + Math.max(0, Y) * 0.2 + walk * (1 - Math.abs(roll)) * u(0.6);
  const hideTop = ay - u(back ? 26 : 24) - up + Y * 0.12;
  // (DOWN on his knees, it does not hang through the floor: its hem stops short of it, by the length of its longest tatter)
  // (and crouched for his leap, or off the floor in it: it stops short of the floor as on his knees)
  const hem = snap(DOWN || RAMP ? Math.min(ay - u(11) - up + Y * 0.12, floorY - Math.max(0, air) - u(5.5)) : ay - u(11) - up + Y * 0.12);
  const drift = -q.swing * u(1.2) - Math.min(1.5, q.drag) * u(0.7);
  // (standing, his head turns a little now and then; reared up it is thrown back; folded over it hangs)
  const turn = calm > 0.5 && Math.sin(ph - 3.39) > 0.637 ? 1 : 0;
  // (the bull rush: his head thrust down before his chest, brow first, as a bull's; and, stopped, shaken: `hx`)
  const hx = X + u(back ? 2.5 : 3.5) + fold * u(5) - rear * u(1) + turn + (RUSH ? u(q.gale * 0.45 + q.hx) : 0);
  const hy = ay - u(H_HEAD) - (back ? 2.5 : 0) + Y - up - rear * u(1.5) + fold * u(7) + (RUSH ? u(q.gale) : 0);

  // (BRUTE_SEEN: where each foot stands, as the legs below are painted: the middle of its sole)
  const soleAt = (near: boolean): V => {
    const side = near ? -farSide : farSide;
    const s = near ? q.near : q.far;
    const lf = near ? q.nearLift : q.farLift;
    return [ax + side * u(LEG) + snap(s * u(3.6)) + u(1.5), floorY - 2 + snap((near ? 1 : -1) * u(FOOT_TILT)) + snap(s * u(SY) * fwd - lf * u(3.2)) - snap(Math.max(0, air))];
  };

  // --- that is where everything is. Now paint it: on sheets cut down to the box that holds it ---
  if (!cut) {
    if (BRUTE_SEEN.see) {
      const cl = u(CLUB * long - choke * trail);
      BRUTE_SEEN.see({ head: [hx, hy + 7], hips: [hipX, hipY], hand, offHand, clubEl, offEl, soles: [soleAt(true), soleAt(false)], lifts: [q.nearLift, q.farLift], air, tip: [at[0] + cdx * cl, at[1] + cdy * cl] });
    }
    return ogre(q, back, G, how, boxOf([
      // (props 3 to 5: the feet, far out in a long stride)
      ...(RAMP || RUSH ? [[soleAt(true), u(10)] as const, [soleAt(false), u(10)] as const] : []),
      // the legs and the feet, wherever they have stepped; the hide; the barrel
      [[ax + u(1.5), ay - u(10)], u(21) + 2],
      [[hipX + drift, hem - u(7)], u(20) + 2],
      [[bx, (topY + botY) / 2], Math.max(rx, (botY - topY) / 2) + 2],
      // the shoulders (and the guardian's spiked plate), the elbows, the hands (and the fingers of an open one)
      [clubSh, u(8)],
      [offSh, u(G ? 20 : 8)],
      [clubEl, u(6)],
      [offEl, u(6)],
      [hand, u(7.5)],
      [offHand, u(9)],
      // the club: where it is held, its thick end (and its spikes); the head
      [at, u(7.5)],
      [[at[0] - cdx * u(choke * trail + GRIP), at[1] - cdy * u(choke * trail + GRIP)], u(4)],
      [[at[0] + cdx * u(CLUB * long - choke * trail), at[1] + cdy * u(CLUB * long - choke * trail)], u(12)],
      [[hx, hy + 7], 11],
      ...streakAt.map((v) => [v, u(8)] as const),
      ...((q.prop === 2 || RUSH) && q.sweep > 0 && q.sweep < 1 ? [[[scrape[0] - u(14), scrape[1] - u(8)], u(16)] as const] : []),
      // (the chieftain's crown of antlers over his head, and his banner: its pole and its cloth)
      ...(flag ? [[[hx, hy - 9], 14] as const, [flag.foot, u(4)] as const, [flag.top, u(5)] as const, [[(flag.bar[0][0] + flag.bar[1][0]) / 2 + flag.sway / 2, flag.bar[0][1] + flag.long / 2], flag.long / 2 + u(8)] as const] : []),
    ], can), chief);
  }
  const sheet = (): Px => new Px(cut.w, cut.h);

  // --- the legs, the hide, the barrel ---
  const body = sheet();
  // (the feet stand along the grid, the nearer lower on the screen than the further, and a step goes along it:
  // two pixels across for each one down or up the screen)
  const leg = (near: boolean): void => {
    const side = near ? -farSide : farSide;
    const s = near ? q.near : q.far;
    const lf = near ? q.nearLift : q.farLift;
    const sole = floorY - 2 + snap((near ? 1 : -1) * u(FOOT_TILT)) + snap(s * u(SY) * fwd - lf * u(3.2)) - snap(Math.max(0, air));
    stump(body, [hipX + side * u(LEG - 2.5), hipY + (near ? 1 : -1) * u(1.5)], ax + side * u(LEG) + snap(s * u(3.6)), sole, up, S, near ? flesh : shade, back);
  };
  leg(false);
  leg(true);

  const wear = (): void => hide(body, hipX, hideTop, hem, u(back ? 15.5 : 13.5), u(back ? 0.5 : 1), drift, q.wind, 0.7 + Math.min(1.5, q.drag) * 0.5, S, PLUM, back);
  if (!back) wear();
  // The barrel is painted square-on, on a sheet of its own, and then made to lean with the shoulders:
  // every column of it is slid up or down, by as much as the shoulders are at the top of it and not
  // at all from its widest row down (TURNED TO THE GRID, above).
  const trunk = sheet();
  // (a barrel from the front; a slab from behind, less square when he is bent over)
  mass(trunk, bx, by, rx, by - topY, botY - by, back ? 2.7 - fold * 0.4 : 2.4, flesh);
  if (back) {
    // the groove of the spine (he is seen from a corner: it is not in the middle), and the shoulder blades
    const sx = snap(bx - u(TURN_MID));
    for (let y = snap(topY + u(2)); y < snap(hideTop); y++) crease(trunk, sx, y, flesh, true);
    const n = snap(u(8));
    for (const side of [-1, 1]) {
      for (let j = 0; j <= n; j++) crease(trunk, snap(sx + side * (u(5) + Math.sin((j / n) * Math.PI) * u(2.4)) + (side > 0 ? u(1.5) : 0)), snap(topY + u(4)) + j, flesh);
    }
    // ... and the roll of fat above the hide
    for (let x = snap(bx - rx * 0.82); x <= snap(bx + rx * 0.8); x++) {
      const t = (x - bx) / rx;
      if (x !== sx) crease(trunk, x, snap(hideTop - u(4.5) + u(2.2) * (1 - t * t)), flesh);
    }
  } else {
    // the line under the chest: two sagging folds, the nearer the wider, each hooking up toward its armpit; and a navel
    const mx = bx + u(TURN_MID);
    const ly = topY + (by - topY) * 0.78;
    for (const [inner, outer] of [[mx - u(1.5), mx - u(16.5)], [mx + u(1.5), mx + u(8.5)]] as const) {
      const n = snap(Math.abs(outer - inner));
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const rise = u(3.4) * Math.max(0, (t - 0.68) / 0.32) ** 1.6 + u(1.2) * Math.max(0, 1 - t / 0.16);
        crease(trunk, snap(inner + (outer - inner) * t), snap(ly - rise), flesh, true);
      }
    }
    const ny = snap(by + (botY - by) * 0.25);
    for (const [ox, oy] of [[0, 0], [1, 0], [0, 1], [1, 1]] as const) crease(trunk, snap(mx) + ox, ny + oy, flesh, true);
  }
  // the strap: from the shoulder of the arm that hangs, across to the other hip
  const strapW = snap(u(3));
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    const x = snap(bx - rx * 0.76 + t * rx * 1.74);
    const y = snap(topY + u(back ? 1 : 3) + t * (botY - topY - u(back ? 2 : 10)) + Math.sin(t * Math.PI) * u(1.5));
    for (let j = 0; j < strapW; j++) {
      const c = trunk.get(x, y + j);
      if (c !== null && flesh.includes(c)) trunk.set(x, y + j, PLUM[j === 0 ? 3 : j === strapW - 1 ? 1 : 2]);
    }
  }
  if (G) {
    // an old wound: a gash across the chest (and, on his back, the marks of something's claws)
    const gash = (x0: number, y0: number, n: number, ticks: boolean): void => {
      for (let i = 0; i <= n; i++) {
        const x = snap(x0 - i * 0.75);
        const y = snap(y0 + i * 0.85);
        for (const [ox, c] of [[-1, BLOOD[3]], [0, BLOOD[1]], [1, BLOOD[1]]] as const) if (flesh.includes(trunk.get(x + ox, y) ?? '')) trunk.set(x + ox, y, c);
        // (and the stitches that closed it: short strokes across it)
        if (ticks && i % 5 === 2) for (const o of [-3, -2, 2, 3]) if (flesh.includes(trunk.get(x + o, y + Math.sign(o) * (Math.abs(o) - 1)) ?? '')) trunk.set(x + o, y + Math.sign(o) * (Math.abs(o) - 1), BLOOD[1]);
      }
    };
    if (back) for (const o of [0, 4, 8]) gash(bx + u(8 + o), topY + u(5 + o * 0.3), snap(u(7)), false);
    else gash(bx + u(13.5), topY + (by - topY) * 0.32, snap(u(13)), true);
  }
  // (the lean: `tilt` is how far the shoulder on screen-right is lowered, a shoulder being SPREAD from the middle)
  const slope = tilt / u(SPREAD);
  shearBy(trunk, (x, y) => (x + 0.5 - bx) * slope * clamp01((by - y) / Math.max(1, by - topY)), body);
  if (back) wear();

  // --- the arms ---
  const clubArm = sheet();
  const offArm = sheet();
  // (the club arm is the far one when he faces us; the hanging arm when he faces away)
  armOf(clubArm, clubSh, clubEl, hand, S, back ? flesh : shade, back ? 7.2 : 6.8);
  armOf(offArm, offSh, offEl, offHand, S, back ? shade : flesh, back ? 6.8 : 7.2);
  if (G) {
    // two bands of iron on each forearm
    for (const [el, hd] of [[clubEl, hand], [offEl, offHand]] as const) {
      const layer = el === clubEl ? clubArm : offArm;
      const iron = (el === clubEl) === back ? IRON : dim(IRON);
      for (const [a, b] of [[0.26, 0.42], [0.56, 0.72]] as const) limb(layer, el[0] + (hd[0] - el[0]) * a, el[1] + (hd[1] - el[1]) * a, el[0] + (hd[0] - el[0]) * b, el[1] + (hd[1] - el[1]) * b, u(5.5), u(5.6), iron);
    }
    // a great spiked plate on the shoulder of the arm that hangs
    pauldron(offArm, offSh, S, back ? dim(IRON) : IRON);
  }

  // --- the club, the hands, the head ---
  const weapon = sheet();
  // (a level swing's streak: what of it is behind him on a sheet of its own, under everything)
  const behindAll = sheet();
  if (level && Math.abs(q.sweep) >= 6) {
    if (RAMP) rampStreak(weapon, behindAll, q.aim, q.gale, q.prop === 5, q.sweep, waist, back, S);
    else swingStreak(weapon, behindAll, q.aim, q.sweep, waist, back, S, G, lights);
  }
  // (the charge: the dust a scraping or digging foot kicks back)
  if (q.prop === 2 || RUSH) kicked(behindAll, scrape[0], scrape[1], q.sweep, back, S);
  // (held part way up its handle, more of the handle is behind the fist)
  club(weapon, [at[0] - cdx * u(choke * trail), at[1] - cdy * u(choke * trail)], aim, S, G, Math.sin(ph * 2) + roar, lights, long);
  const hands = sheet();
  // (standing, the hanging fist opens and closes: half open, open for a while, half open, shut)
  const open = k > 0 || DOWN ? 0 : calm * clamp01(Math.sin(ph - 0.785) * 2.2 + 0.1);
  // (the nearer fist is painted over the further one; facing us with the club trailing, it is the nearer that is on it and the further that hangs)
  const swapped = !back && how !== 'high';
  // (DOWN: the club has gone out of his hand, and neither fist is round anything)
  const grips = !DOWN;
  if (back) fist(hands, offHand, S, shade, grips && k > 0.6, open);
  fist(hands, hand, S, back ? flesh : shade, grips && (!swapped || k > 0.6), swapped ? open : 0);
  if (!back) fist(hands, offHand, S, flesh, grips && (swapped || k > 0.6), swapped ? 0 : open);

  const skull = sheet();
  const eyes = head(skull, hx, hy, flesh, back, roar > 0.45, G, RUSH && q.gale > 2.5);
  const crownSheet = sheet();
  const banner = sheet();
  if (chief) crown(crownSheet, hx, hy);
  if (NINE && !back) warPaint(skull, body, hx, hy, [X - farSide * u(1), shY + u(9)], S);
  if (flag) paintBanner(banner, flag, back, S, q.wind);
  // (the light in his eyes: it flares as he roars)
  if (eyes) lights.push({ x: eyes[0], y: eyes[1], r: (G ? 5.5 : 4.5) + roar * 2.5, color: SOCKET, a: (G ? 0.42 : 0.32) + roar * 0.18 });

  // --- stack it, and lay it on the canvas ---
  let layers: Px[];
  // (swung level and pointing away from us when he faces away: the club, his fists and his arms are all beyond him)
  if (back && level && clubBehind) layers = [behindAll, weapon, hands, clubArm, offArm, skull, body];
  else if (back) layers = [behindAll, offArm, skull, body, weapon, clubArm, hands];
  else if (clubBehind) layers = [behindAll, weapon, clubArm, body, offArm, skull, hands];
  else layers = [behindAll, clubArm, body, weapon, offArm, skull, hands];
  // (the chieftain's crown is on his head; his banner on his back: behind all of him facing us, over his back facing away)
  if (chief) {
    const withCrown = layers.flatMap((l) => (l === skull ? [skull, crownSheet] : [l]));
    layers = back ? withCrown.flatMap((l) => (l === body ? [body, banner] : [l])) : [banner, ...withCrown];
  }
  const done = compose(null, layers);
  /** A sheet of this frame laid on the whole canvas, where it belongs. */
  const placed = (src: Px): Px => {
    const out = new Px(can.w, can.h);
    for (let y = 0; y < cut.h; y++) out.d.set(src.d.subarray(y * cut.w * 4, (y + 1) * cut.w * 4), ((cut.y + y) * out.w + cut.x) * 4);
    return out;
  };
  // (his death takes him apart: the club by itself, and all of him but the club)
  if (TAKE) {
    // (and the chieftain's banner and crown by themselves, for when they leave him: see chiefDeath)
    const own = (l: Px): boolean => l === weapon || (chief && (l === banner || l === crownSheet) && TAKE_OFF !== null && TAKE_OFF.includes(l === banner ? 'banner' : 'crown'));
    TAKE({ club: placed(compose(null, [weapon])), rest: placed(compose(null, layers.filter((l) => !own(l)))), banner: chief ? placed(compose(null, [banner])) : undefined, crown: chief ? placed(compose(null, [crownSheet])) : undefined });
  }
  return { px: placed(done), lights: lights.map((l) => ({ ...l, x: l.x + cut.x, y: l.y + cut.y })) };
}

/** Set while a frame is painted for his death: it is handed the club by itself, and the rest of him. */
let TAKE: ((parts: { club: Px; rest: Px; banner?: Px; crown?: Px }) => void) | null = null;
/** While a frame of the chieftain's death is painted: which of his banner and crown have left him (they are not in the `rest` TAKE is handed). */
let TAKE_OFF: ReadonlyArray<'banner' | 'crown'> | null = null;
/**
 * Set while a frame of his death is painted, once he has been struck: `sink` is how far his knees
 * have let him down, in his own pixels (see the rig: all of him above his feet is that much nearer
 * the floor, on legs folded that much shorter). And his arms are limp: his fists hold nothing, and
 * one that would hang lower than the floor lies on it.
 */
let DOWN: { sink: number } | null = null;
/**
 * FLOOR 9'S TROLL CHIEFTAIN (art/troll_chief9.ts, the side boss: his pick “Huge, crowned in bones (Recommended)”): while he is painted,
 * his club is a tree's trunk bound with iron, skulls sit in his crown, and war paint is on his face and his chest.
 */
let NINE = false;
/** Paint with floor 9's chieftain's own things, or not. */
export function withNine<T>(f: () => T): T {
  const was = NINE;
  NINE = true;
  try {
    return f();
  } finally {
    NINE = was;
  }
}
/** His tree-trunk club's bark, dark to light; his war paint, bone white and old blood. */
const BARK: Ramp = ['#1e140e', '#3a281a', '#5a3e26', '#7a5636', '#9a7048'];
const PAINT_WHITE = '#e8e0cc';
const PAINT_RED = '#a8302a';

/** The brute, and the guardian (the brute's rig, a third bigger, in red and iron), carrying their clubs as the game has them (CARRY). */
export const paintBrute: Rig = (q, back) => ogre(q, back, false, CARRY);
export const paintGuardian: Rig = (q, back) => ogre(q, back, true, CARRY);

// ---------------------------------------------------------------------------------------------
// Animations
//
// Standing and walking are the kit's (see what the rig reads, above). The attack is an overhead
// smash that lands on the floor in front of him: it needs more keys than mkit's `strike` has (the
// club must go over the top, not through him), so its timeline is built here, by strike's rules:
// from rest, wound up by half way to the blow and HELD there (the player's warning), the blow at
// `hit`, and back at rest 0.3 seconds after it.

/** The moment the club lands: the brute's `windup` in game/defs.ts. */
const HIT = 0.85;

function smash(back: boolean): Timeline {
  // reared right up on his toes, the club in both hands straight up and back over the head, roaring
  const up: Partial<Pose> = { lean: -5, bob: -4, far: -0.4, act: 1, pt: 1, hx: -23.5, hy: -7, aim: 100, off: 1, behind: true, drag: 1, wind: 0.15 };
  // over the top: the hands high and forward
  const over: Partial<Pose> = { lean: 3, bob: -1, act: 0.4, pt: 1, hx: 3, hy: -8, aim: 52, off: 1, drag: 1.6, wind: 0.42 };
  // the head of the club on the floor in front of his feet (further up the screen when he faces
  // away), the whole body folded over it, arms straight
  const reach = back ? 24 : 31;
  const down: Partial<Pose> = { lean: 9, bob: 9, near: 0.7, far: -0.3, pt: 1, hx: 4, hy: reach, aim: back ? -20 : -30, off: 1, drag: 2, wind: 0.5 };
  const keys: Key[] = [
    { at: 0, pose: {} },
    { at: HIT * 0.5, pose: up, ease: 'out' },
    // (held: he rises a little more, and the club tips further back)
    { at: HIT * 0.86, pose: { ...up, bob: -5, aim: 106, wind: 0.35 }, ease: 'lin' },
    { at: HIT - 0.05, pose: over, ease: 'in' },
    { at: HIT, pose: down, ease: 'lin' },
    // stuck there, shoulders heaving: they sink onto the club and come up again, and the club does
    // not move (the hand is measured from the shoulders, so it is moved against them)
    { at: HIT + 0.05, pose: { ...down, bob: 11, hy: reach - 2, wind: 0.6 }, ease: 'out' },
    { at: HIT + 0.13, pose: { ...down, bob: 7, hy: reach + 2, pt: 0.6, wind: 0.7 }, ease: 'io' },
    // ... and he hauls it back up
    { at: HIT + 0.3, pose: { wind: 1 }, ease: 'io' },
  ];
  return { keys, hit: HIT };
}

// ---------------------------------------------------------------------------------------------
// The trolls' new moves (TROLL_MOVES, above): their timelines

/** The moment the swing's blow lands: quicker than the slam (it is the basic blow, used while the slam cools down). The rules' wind-up for it may differ: the frames are fitted to it. */
export const SWING_HIT = 0.6;
/** The moment the red troll sets off on his charge: his warning, while the line he will run along is marked on the floor. */
export const CHARGE_GO = 0.9;
/** A quarter of one stride of his charge (seconds): it goes round in four. */
const CHARGE_STEP = 0.13;

/** THE SWING: both fists on the club, round and back on his club side and held there (the warning), then round in front of him level, through the blow, and on round to his other side. */
function swingMove(): Timeline {
  const L: Partial<Pose> = { prop: 1, off: 1 };
  // gathered: both fists on the handle, the club coming round to his club side
  const gather: Partial<Pose> = { ...L, aim: 70, lean: -1, act: 0.3, wind: 0.1 };
  // wound: round and back, leaning away from the blow to come, roaring, his weight on his back foot
  const wound: Partial<Pose> = { ...L, aim: 100, lean: -3, bob: 1, act: 1, near: 0.4, far: -0.5, wind: 0.25 };
  // the blow: straight ahead, all his weight going into it, the streak behind the club's head
  const blow: Partial<Pose> = { ...L, aim: -8, lean: 4, bob: 2, act: 0.6, near: -0.3, far: 0.6, sweep: 110, wind: 0.5, drag: 0.8 };
  // through: on round to his other side
  const thru: Partial<Pose> = { ...L, aim: -100, lean: 5, bob: 3, act: 0.3, near: -0.3, far: 0.6, sweep: 92, wind: 0.65, drag: 1 };
  const keys: Key[] = [
    { at: 0, pose: {} },
    { at: 0.16, pose: gather, ease: 'out' },
    { at: 0.34, pose: wound, ease: 'out' },
    // (held: he coils a little tighter)
    { at: SWING_HIT - 0.05, pose: { ...wound, aim: 106, bob: 2, wind: 0.32 }, ease: 'lin' },
    { at: SWING_HIT - 0.02, pose: { ...wound, aim: 70, sweep: 54, lean: 0 }, ease: 'in' },
    { at: SWING_HIT, pose: blow, ease: 'lin' },
    { at: SWING_HIT + 0.06, pose: thru, ease: 'out' },
    { at: SWING_HIT + 0.16, pose: { ...thru, aim: -112, sweep: 18, bob: 2 }, ease: 'out' },
    { at: SWING_HIT + 0.42, pose: { ...L, aim: -60, lean: 1, sweep: 0, wind: 0.85 }, ease: 'io' },
    { at: SWING_HIT + 0.62, pose: { wind: 1 }, ease: 'io' },
  ];
  return { keys, hit: SWING_HIT };
}

/** THE CHARGE'S WARNING: a roar; his head goes down; he scrapes a foot back twice, kicking dust; and he is off (`hit`). (The foot that scrapes: his nearer one facing us, his further one facing away: see `scrape` in the rig.) */
function chargeWindMove(back: boolean): Timeline {
  const C: Partial<Pose> = { prop: 2 };
  const low: Partial<Pose> = { ...C, lean: 10, bob: 3, act: 0.2, drag: 0.4 };
  /** The scraping foot at `s` in its stride, lifted `l`. */
  const foot = (s: number, l: number): Partial<Pose> => (back ? { far: s, farLift: l } : { near: s, nearLift: l });
  const keys: Key[] = [
    { at: 0, pose: {} },
    { at: 0.14, pose: { ...C, lean: 3, bob: -2, act: 1, pt: 1 }, ease: 'out' },
    { at: 0.3, pose: low, ease: 'in' },
    { at: 0.4, pose: { ...low, ...foot(0.4, 0.5), sweep: 0 }, ease: 'out' },
    { at: 0.5, pose: { ...low, ...foot(-1.4, 0), sweep: 0.08 }, ease: 'in' },
    { at: 0.62, pose: { ...low, ...foot(0.4, 0.5), sweep: 0.7 }, ease: 'out' },
    { at: 0.72, pose: { ...low, ...foot(-1.4, 0), sweep: 0.08 }, ease: 'in' },
    { at: 0.84, pose: { ...low, ...foot(-0.6, 0), bob: 4, lean: 11, sweep: 0.75 }, ease: 'out' },
    { at: CHARGE_GO, pose: { ...low, lean: 12, bob: 2, ...(back ? { near: 0.8, far: -1, farLift: 0.3 } : { far: 0.8, near: -1, nearLift: 0.3 }), sweep: 0.92 }, ease: 'in' },
  ];
  return { keys, hit: CHARGE_GO };
}

/** THE CHARGE: head down, running, the club hauled at his side. Round and round, for as long as the rules have him charge. */
function chargeMove(): Timeline {
  const C: Partial<Pose> = { prop: 2, lean: 12, drag: 1.6, act: 0.5 };
  const T = CHARGE_STEP;
  const keys: Key[] = [
    { at: 0, pose: { ...C, near: 2, far: -2, bob: 4, swing: -1, wind: 0 } },
    { at: T, pose: { ...C, near: 0.3, far: -0.3, farLift: 1.2, bob: -3, swing: 0, wind: 0.25 }, ease: 'out' },
    { at: 2 * T, pose: { ...C, near: -2, far: 2, bob: 4, swing: 1, wind: 0.5 }, ease: 'in' },
    { at: 3 * T, pose: { ...C, near: -0.3, far: 0.3, nearLift: 1.2, bob: -3, swing: 0, wind: 0.75 }, ease: 'out' },
    { at: 4 * T, pose: { ...C, near: 2, far: -2, bob: 4, swing: -1, wind: 1 }, ease: 'in' },
  ];
  return { keys, loop: 0 };
}

/** THE CHARGE'S END: he digs a foot in and rears back, skidding, dust kicked up; and stands. */
function chargeStopMove(): Timeline {
  const C: Partial<Pose> = { prop: 2 };
  const keys: Key[] = [
    { at: 0, pose: { ...C, lean: 12, near: 2, far: -2, bob: 4, drag: 1.6, act: 0.5 } },
    { at: 0.1, pose: { ...C, lean: -2, bob: 4, near: -0.6, far: 1.8, drag: 1, act: 0.8, sweep: 0.08 }, ease: 'out' },
    { at: 0.32, pose: { ...C, lean: -4, bob: 1, near: -0.4, far: 1.2, drag: 0.4, act: 1, pt: 1, sweep: 0.7 }, ease: 'out' },
    { at: 0.6, pose: { wind: 1 }, ease: 'io' },
  ];
  return { keys };
}

/** The new moves of each, by name (AnimSet.clips.moves): the green troll's swing; the red troll's swing and charge. */
export function trollMoves(red: boolean, back: boolean): Record<string, Timeline> {
  const more: Record<string, Timeline> = { swing: swingMove() };
  if (red) {
    more.chargeWind = chargeWindMove(back);
    more.charge = chargeMove();
    more.chargeStop = chargeStopMove();
  }
  return more;
}

// ---------------------------------------------------------------------------------------------
// Their death: their knees go
//
// The owner, 5 Oct 2026: "I think we want death animations and corpses for enemies." The first
// death painted for these two had them rear back and go over backward all in one piece, club and
// all, like a cut-out pushed over; he saw it filmed and said: "the brutes and the cloak guys arent
// very good". And the next day: "I want enemies to look natural", "I want things to have weight.
// That's very important".
//
// So this one (6 Oct 2026) is the death of something heavy, and it is the RIG that dies: every
// frame of it is the figure painted in a pose, as every frame of his walk is, not his standing
// picture pushed about. Struck, he rocks back on his heels with a roar. The club goes out of his
// hand and falls by itself. His knees go (DOWN, in the rig), and all of him above them comes down
// on them with a thud that squashes him. He hangs there on his knees for a moment, the light gone
// out of his eyes, sagging. Then the weight of his back takes him forward and down: his shoulders
// go over his knees, his head hangs, his fists come to rest on the floor, and he settles into a
// heap, low and wide, with the club lying beside him. He is never turned on his side: nothing
// that broad lies flat by being turned over.

/** The first and last columns painted of a painting, or null if nothing is. */
function across(px: Px): [number, number] | null {
  let a = px.w;
  let b = -1;
  for (let y = 0; y < px.h; y++) {
    for (let x = 0; x < px.w; x++) {
      if (px.d[(y * px.w + x) * 4 + 3] === 0) continue;
      if (x < a) a = x;
      if (x > b) b = x;
    }
  }
  return b < 0 ? null : [a, b];
}

/** When he has rocked back, when he is down on his knees, when he starts to go forward, and when he lies: 0..1 of his death. */
const STRUCK = 0.15;
const KNEES = 0.38;
const GOES = 0.54;
const LIES = 0.84;

/**
 * Dust thrown up from under something heavy as it lands: puffs along the floor either side of
 * `cx`, from under his edges (`half` out from it), `t` (0..1) of the way through their short
 * life. They roll outward, slowing, lift a little, and thin as they go (every other pixel of
 * them, then one in four). They are in front of him, low: dust comes up round what lands. (It is
 * the dull violet of the floor's own dust, and gives off no light.)
 */
function dust(p: Px, cx: number, half: number, t: number, S: number, ay = AY): void {
  if (t <= 0 || t >= 1) return;
  const out = 1 - (1 - t) * (1 - t);
  for (const side of [-1, 1]) {
    for (const [from, far, big, up] of [[0.75, 5, 4.4, 1], [0.95, 11, 3.6, 4], [1.05, 17, 2.6, 2], [0.85, 8, 2.2, 7]] as const) {
      const x = cx + side * (half * from + far * out * S);
      const r = big * S * (1 - 0.35 * t);
      const y = ay + 2 - r * 0.8 - up * out * S;
      for (let yy = Math.floor(y - r); yy <= Math.ceil(y + r); yy++) {
        for (let xx = Math.floor(x - r); xx <= Math.ceil(x + r); xx++) {
          if ((xx + 0.5 - x) ** 2 + (yy + 0.5 - y) ** 2 > r * r) continue;
          if (t > 0.3 && (((xx + yy) % 2) + 2) % 2 !== 0) continue;
          if (t > 0.65 && (((xx - yy) % 4) + 4) % 4 !== 0) continue;
          p.set(xx, yy, yy + 0.5 < y - r * 0.2 ? MAIL[3] : MAIL[2]);
        }
      }
    }
  }
}

/** How he is posed `k` of the way through his death, and how far his knees have let him down by then. */
function dying(k: number, back: boolean): { pose: Partial<Pose>; sink: number } {
  const part = (a: number, b: number): number => clamp01((k - a) / (b - a));
  // rocked back: fast, and slowing
  const u0 = part(0, STRUCK);
  const rock = u0 * (2 - u0);
  // the knees go: slowly, and then all at once
  const u1 = part(STRUCK, KNEES);
  const fall = u1 * u1;
  // on his knees: he sags
  const u2 = part(KNEES, GOES);
  const sag = u2 * u2 * (3 - 2 * u2);
  // forward and down: slowly, and then all at once
  const u3 = part(GOES, LIES);
  const pitch = u3 * u3;
  // ... and what has landed settles
  const u4 = part(LIES, 1);
  const settle = 1 - (1 - u4) * (1 - u4);
  // (the thud of his weight coming down on his knees: it presses him, and he comes up out of it)
  const thud = Math.max(0, 1 - Math.abs(k - (KNEES + 0.02)) / 0.09);
  return {
    pose: {
      lean: -5 * rock + 4 * fall + 4 * sag + 15 * pitch,
      // (seen from behind there is less of him to fold: his back is a slab, and it must not be pressed to a plank)
      bob: -2 * rock + 3 * fall + 5 * thud + 3 * sag + (back ? 11 : 17) * pitch - 2 * settle,
      // (he rears as he is struck, and roars; his mouth hangs open after)
      act: 0.7 * Math.sin(Math.min(1, k / 0.34) * Math.PI),
      pt: 1,
      wind: 0.1 + 0.2 * u0,
    },
    sink: 11 * fall + 1 * pitch,
  };
}

/** The club as it leaves his hand, for each figure, view and way of carrying it (see ogreDeath). */
const DROPPED = new Map<string, Px>();

function ogreDeath(k: number, back: boolean, G: boolean, how: Carry): Painted {
  const S = G ? GUARDIAN : 1;
  const W = BRUTE_CANVAS.w;
  const H = BRUTE_CANVAS.h;
  /** The figure as it is at this moment of its death: the club by itself, and the rest of him. */
  const painted = (at: number): { whole: Painted; club: Px; rest: Px } => {
    const d = dying(at, back);
    let parts: { club: Px; rest: Px } | null = null;
    TAKE = (got) => (parts = got);
    DOWN = at >= STRUCK ? { sink: d.sink } : null;
    const whole = ogre({ ...REST, aim: 80, ...d.pose }, back, G, how);
    TAKE = null;
    DOWN = null;
    const got = parts as { club: Px; rest: Px } | null;
    return { whole, club: got ? got.club : new Px(W, H), rest: got ? got.rest : whole.px };
  };
  const now = painted(k);
  if (k < STRUCK) return now.whole;
  // the light goes out of his eyes as his knees go (and out of the hot bands of a guardian's club)
  const dark = [SOCKET, FLAME[3], FLAME[4]];
  quench(now.rest, dark, INK);
  // THE CLUB left his hand as he was struck: it is the club of that moment, wherever he has got to
  // since. It comes down flat on the floor, on the side it hung. (It is not turned over: he
  // carries it slantwise, and a slanting thing turned a quarter still slants, and would stand
  // propped in the air. It comes down as it is and is pressed flat to the floor.)
  // (it is the same club in every frame of the death: painted once for each figure and view, and kept)
  const which = `${G ? 'guardian' : 'brute'}:${back ? 'back' : 'front'}:${how}`;
  let club = DROPPED.get(which);
  if (!club) {
    club = quench(painted(STRUCK).club, dark, INK);
    DROPPED.set(which, club);
  }
  const lay = across(club);
  const to: [number, number] = [lay ? (lay[0] + lay[1] + 1) / 2 + (back ? 17 : -10) * S : AX, AY + 3];
  // (he is laid down first, as he is; and the club over him, as it was when he held it, with the dark seam where it lies on him)
  const px = fallen(
    [
      { px: now.rest, to: [AX, AY], from: 2, until: 3 },
      { px: club, to, from: STRUCK, until: STRUCK + 0.19, hop: 2 * S, bounce: 2.5 * S },
    ],
    k, W, H, INK,
  );
  // the dust of his two landings: on his knees, and then all of him on the floor
  dust(px, AX + 2 * S, 14 * S, (k - KNEES) / 0.15, S);
  dust(px, AX + 12 * S, 22 * S, (k - LIES) / (1 - LIES), S);
  return { px, lights: [] };
}

/** The pool of light behind each, on their own canvas (mkit's MENACE, placed and sized for them). */
const BRUTE_AURA: Light = { x: AX - 2, y: AY - 30, r: 48, color: '#ff3a78', a: 0.13 };
const GUARDIAN_AURA: Light = { x: AX - 2, y: AY - 38, r: 62, color: '#ff3a78', a: 0.16 };

/**
 * (Their death was switched off from 5 Oct 2026, 23:14, when the owner said of the first one "the
 * brutes and the cloak guys arent very good", until it was painted again the next night: see
 * ogreDeath.)
 */
const DEATH_PAINTED = true;

/** What one of them does, seen one way round: the slam, its death, and (TROLL_MOVES) its new moves. */
function ogreMoves(back: boolean, G: boolean, how: Carry): MonsterMoves {
  const m: MonsterMoves = DEATH_PAINTED ? { attack: smash(back), die: (k) => ogreDeath(k, back, G, how) } : { attack: smash(back) };
  if (TROLL_MOVES.on) m.more = trollMoves(G, back);
  // (FLOOR 3, MORE ACTION, BRUTE_RAMPAGE: the green troll's two attacks are his rampage, as his attack, and his bull rush, as the
  // red troll's charge is played: its wind-up, its run and its stop. His swing and his slam are kept, out of his set.)
  if (BRUTE_RAMPAGE.on && !G) {
    m.attack = rampageTimeline(back);
    m.more = { chargeWind: rushWindTimeline(back), charge: rushTimeline(back), chargeStop: rushStopTimeline(back) };
  }
  return m;
}

// =============================================================================================
// FLOOR 3, MORE ACTION: THE GREEN TROLL'S RAMPAGE AND HIS BULL RUSH (the art chat's helper, 31 Oct 2026;
// docs/mockups/action_f3/README.md). The owner's review of every enemy for more action; for the brute, offered "Rampage: two
// stepping club swings, then a leaping two-fisted slam with a shockwave ring. Bull rush as its second: lowers its head and
// charges down a marked lane."; his pick: “Yes (Recommended)”. Under his rules: Movement 9 (“Like the wind up and wind down are
// big but the actual punch is lightning quick”), and for the enemies, 28 Oct (“Start from now on, but every enemy is going to
// need that change eventually.  And bigger AOE to compensate for the extra time the player gets to evade”). So:
//   THE RAMPAGE (his attack): both fists on the club, wound back on his club side and HELD; a level swing round in front of him
//     in ONE frame, smeared; on round and a step in; wound back the other way and HELD; the backhand, in one frame; on round and
//     a step in; then the club raised up over his head as he crouches, HELD, the biggest of his warnings; a LEAP, the club tipped
//     right back over his head in the air; and as he lands, in ONE frame, the club brought down on the floor before him with
//     both fists, the shockwave ring going out from it (art/action_f3_fx.ts); stuck there, heaving; then he hauls it up.
//   THE BULL RUSH (as the red troll's charge is played: `chargeWind`, `charge`, `chargeStop`): his head goes down before his
//     chest, brow first, his free fist down on the floor, knuckles to it; HELD so, pawing the floor twice with a foot, dust
//     kicked back (the warning, while the lane is marked: art/charge_lane.ts); then off down it head first, fast, bounding; and
//     past where you stood he plants a foot, stumbles a step and another, rocks back off balance and shakes his head.
// The game carries him over the floor through both (`rampageTravel`, `rushStopTravel`, and the run's pace): his feet are where
// they are on the floor, tile by tile, as he is carried. Behind a switch that is off: while it is, he is exactly as he was.

/** The switch: the rampage and the bull rush are the green troll's attacks only while it is on. */
export const BRUTE_RAMPAGE = { on: false };

/**
 * WHERE HIS JOINTS ARE IN A FRAME (for the review, art/action_f1_checks.ts checkKit): picture pixels on his canvas. Nothing of the
 * game sets `see`; while it is null nothing is reported and nothing about a frame changes.
 */
export interface BruteSeen {
  head: V;
  hips: V;
  /** The club arm's fist and the other, and their elbows. */
  hand: V;
  offHand: V;
  clubEl: V;
  offEl: V;
  /** His two feet (the nearer first): the middle of each sole, and how far each is lifted; and how far all of him is off the floor. */
  soles: [V, V];
  lifts: [number, number];
  air: number;
  /** The middle of the club's thick end. */
  tip: V;
}
export const BRUTE_SEEN: { see: ((j: BruteSeen) => void) | null } = { see: null };

/** How many of a stride's units (Pose.near and far: 3.6 picture pixels across) a tile along the grid is (32 across, 16 down). */
export const STRIDE_PER_TILE = 32 / 3.6;
const F30 = 1 / 30;

/** A stretch of the floor he is carried along: from `t0` to `t1` seconds, from `a` to `b` tiles, eased ('io' slow at both ends, 'lin' even). */
type Carried = readonly [number, number, number, number, 'io' | 'lin'];
function carriedAt(spans: ReadonlyArray<Carried>, t: number): number {
  let at = 0;
  for (const [t0, t1, a, b, ease] of spans) {
    if (t <= t0) return at;
    const k = clamp01((t - t0) / (t1 - t0));
    at = a + (b - a) * (ease === 'lin' ? k : k * k * (3 - 2 * k));
    if (t < t1) return at;
  }
  return at;
}
/**
 * A FOOT ON THE FLOOR, by its keys: [seconds, where it is (tiles along the way he faces, on the floor), and how high it was lifted
 * on its way there from the key before]. Between two keys it is carried evenly-eased from the one place to the other, lifted on an
 * arc that far at its highest (0: it is down, and has not moved). Where it is on the floor and how high, at a moment.
 */
type FootKey = readonly [number, number, number];
function footAt(keys: ReadonlyArray<FootKey>, t: number): { w: number; lift: number } {
  if (t <= keys[0][0]) return { w: keys[0][1], lift: 0 };
  for (let i = 1; i < keys.length; i++) {
    const [t0, w0] = keys[i - 1];
    const [t1, w1, peak] = keys[i];
    if (t > t1) continue;
    const k = clamp01((t - t0) / (t1 - t0));
    const e = k * k * (3 - 2 * k);
    return { w: w0 + (w1 - w0) * e, lift: peak * Math.sin(Math.PI * k) };
  }
  return { w: keys[keys.length - 1][1], lift: 0 };
}
/**
 * A MOVE MADE FRAME BY FRAME: its body and club from `keys` (as any timeline), its feet from where they are on the floor (`near`
 * and `far`, FootKeys) less how far the game has carried him (`carried`, tiles); one key for every frame the game shows.
 */
function onTheFloor(keys: ReadonlyArray<Key>, near: ReadonlyArray<FootKey>, far: ReadonlyArray<FootKey>, carried: (t: number) => number, hit?: number, loop?: number): Timeline {
  const end = keys[keys.length - 1].at;
  const n = Math.round(end * 30);
  const base: Pose = { ...REST, aim: 80 };
  const out: Key[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i * F30;
    const q = poseAt(keys, base, t);
    const T = carried(t);
    const a = footAt(near, t);
    const b = footAt(far, t);
    out.push({ at: t, ease: 'lin', pose: { ...q, near: (a.w - T) * STRIDE_PER_TILE, nearLift: a.lift, far: (b.w - T) * STRIDE_PER_TILE, farLift: b.lift } });
  }
  const tl: Timeline = { keys: out };
  if (hit !== undefined) tl.hit = hit;
  if (loop !== undefined) tl.loop = loop;
  return tl;
}

// --- THE RAMPAGE ---

/** Its three blows (seconds; frames 18, 35 and 71): the swing, the backhand, the slam. The slam is the clip's `hit`. */
export const RAMPAGE_HITS: readonly number[] = [18 * F30, 35 * F30, 71 * F30];
/** Each blow's strike: from the last frame of its wind-up to the frame it lands on (two frames, each smeared). */
export const RAMPAGE_STRIKES: ReadonlyArray<readonly [number, number]> = RAMPAGE_HITS.map((h) => [h - 2 * F30, h] as const);
/** How long it is, start to finish (seconds), and when the club is raised over his head (the slam's warning: the ring may be marked from here). */
export const RAMPAGE_LONG = 93 * F30;
export const RAMPAGE_RAISE = 42 * F30;
/** How far the game carries him (tiles along the way he faces): a step in after each swing, then the leap. */
const RAMPAGE_CARRIED: ReadonlyArray<Carried> = [
  [0.7, 0.92, 0, 0.45, 'io'],
  [1.27, 1.49, 0.45, 0.9, 'io'],
  [62 * F30, 71 * F30, 0.9, 2.0, 'lin'],
];
export const rampageTravel = (t: number): number => carriedAt(RAMPAGE_CARRIED, t);
/** In the leap: when his feet leave the floor and when they come down (with the slam). */
export const RAMPAGE_LEAP: readonly [number, number] = [62 * F30, 71 * F30];

/** THE RAMPAGE, seen from in front or from behind: two stepping swings, the leap and the slam. */
export function rampageTimeline(back: boolean): Timeline {
  const [h1, h2, h3] = RAMPAGE_HITS;
  /** (how far the club is brought down, from level, for its head to lie on the floor before him: seen from the corner, the two views differ) */
  const down = back ? -10 : -21;
  const R: Partial<Pose> = { prop: 3, off: 1, drag: 1 };
  const wound1: Partial<Pose> = { ...R, aim: 100, lean: -3, bob: 1, act: 1, pt: 1, wind: 0.25 };
  const wound2: Partial<Pose> = { ...R, aim: -118, lean: -2, bob: 1, act: 1, pt: 1, wind: 0.8 };
  const raised: Partial<Pose> = { ...R, aim: 0, gale: 108, lean: -3, bob: 3, act: 0, pt: 1, step: -6, wind: 0.2 };
  const keys: Key[] = [
    { at: 0, pose: {} },
    // the first: gathered, wound round on his club side, HELD, coiling; his body goes first; the swing in one frame
    { at: 0.2, pose: { ...R, aim: 70, lean: -1, act: 0.3, wind: 0.1 }, ease: 'io' },
    { at: 0.38, pose: wound1, ease: 'out' },
    { at: 0.5, pose: { ...wound1, aim: 106, bob: 2, wind: 0.32 }, ease: 'lin' },
    { at: 15 * F30, pose: { ...wound1, aim: 107, lean: -2.5, bob: 2, wind: 0.34 }, ease: 'lin' },
    { at: h1 - 2 * F30, pose: { ...wound1, aim: 106, lean: -1, bob: 1.5, act: 0.9, wind: 0.36 }, ease: 'in' },
    { at: h1 - F30, pose: { ...R, aim: 48, sweep: 58, lean: 2, bob: 2, act: 0.75, pt: 1, wind: 0.43 }, ease: 'lin' },
    { at: h1, pose: { ...R, aim: -12, sweep: 60, lean: 4, bob: 2, act: 0.6, pt: 1, wind: 0.5 }, ease: 'lin' },
    // on round, and the step in
    { at: h1 + F30, pose: { ...R, aim: -40, sweep: 26, lean: 5, bob: 3, act: 0.4, pt: 1, wind: 0.52 }, ease: 'lin' },
    { at: h1 + 3 * F30, pose: { ...R, aim: -66, sweep: 8, lean: 4.5, bob: 2.8, act: 0.32, pt: 0.8, wind: 0.58 }, ease: 'lin' },
    { at: 0.8, pose: { ...R, aim: -98, lean: 1, bob: 1, act: 0.5, pt: 0.6, wind: 0.7 }, ease: 'lin' },
    // the second: wound round the other way, HELD; the backhand in one frame
    { at: 0.92, pose: wound2, ease: 'out' },
    { at: 1.07, pose: { ...wound2, aim: -123, bob: 2, wind: 0.9 }, ease: 'lin' },
    { at: 32 * F30, pose: { ...wound2, aim: -124, lean: -2.5, bob: 2, wind: 0.92 }, ease: 'lin' },
    { at: h2 - 2 * F30, pose: { ...wound2, aim: -122, lean: -1, bob: 1.5, act: 0.9, wind: 0.94 }, ease: 'in' },
    { at: h2 - F30, pose: { ...R, aim: -58, sweep: -64, lean: 2, bob: 2, act: 0.75, pt: 1, wind: 0.97 }, ease: 'lin' },
    { at: h2, pose: { ...R, aim: 8, sweep: -66, lean: 4, bob: 2, act: 0.6, pt: 1, wind: 1.0 }, ease: 'lin' },
    { at: h2 + F30, pose: { ...R, aim: 34, sweep: -26, lean: 5, bob: 3, act: 0.4, pt: 1, wind: 1.02 }, ease: 'lin' },
    { at: h2 + 3 * F30, pose: { ...R, aim: 54, sweep: -8, lean: 4.5, bob: 2.8, act: 0.32, pt: 0.8, wind: 1.06 }, ease: 'lin' },
    { at: 1.27, pose: { ...R, aim: 64, lean: 4, bob: 2.5, act: 0.3, pt: 0.6, wind: 1.1 }, ease: 'out' },
    // the step in, and the club brought round before him and up over his head as he crouches: HELD, the biggest of his warnings
    { at: 1.42, pose: { ...R, aim: 22, gale: 12, lean: 1, bob: 1, act: 0.4, pt: 0.6, step: -1, wind: 1.15 }, ease: 'lin' },
    { at: 1.58, pose: { ...R, aim: 4, gale: 72, lean: -1, bob: 2, act: 0.2, pt: 1, step: -4, wind: 1.2 }, ease: 'io' },
    { at: 1.75, pose: raised, ease: 'out' },
    { at: 1.97, pose: { ...raised, gale: 113, lean: -3.5, bob: 3.5, step: -6.5, wind: 0.35 }, ease: 'lin' },
    { at: 60 * F30, pose: { ...raised, gale: 114, lean: -3, step: -6, wind: 0.37 }, ease: 'lin' },
    // the leap: up off his bent legs, the club tipped right back over his head in the air
    { at: RAMPAGE_LEAP[0], pose: { ...raised, gale: 117, lean: -2, bob: -1, act: 1, step: 1, wind: 0.42 }, ease: 'in' },
    { at: 2.2, pose: { ...raised, gale: 124, lean: -4, bob: -3, act: 1, step: 15, wind: 0.55 }, ease: 'out' },
    { at: h3 - 2 * F30, pose: { ...raised, gale: 125, lean: -3, bob: -2, act: 1, step: 5, wind: 0.62 }, ease: 'in' },
    // the slam, as he lands, in two frames: the club brought down before him, all of him folded over it; and on the floor
    { at: h3 - F30, pose: { prop: 5, off: 1, drag: 1, aim: 0, gale: 42, sweep: 83, lean: 3, bob: 3, act: 0.5, pt: 1, step: 2, wind: 0.64 }, ease: 'lin' },
    { at: h3, pose: { prop: 5, off: 1, drag: 1, aim: 0, gale: down + 8, sweep: 34 - down, lean: 8, bob: 8, act: 0, pt: 1, step: 0, wind: 0.66 }, ease: 'lin' },
    { at: h3 + F30, pose: { prop: 5, off: 1, drag: 1, aim: 0, gale: down - 1, sweep: 9, lean: 10, bob: 11, pt: 1, wind: 0.68 }, ease: 'out' },
    { at: 2.5, pose: { prop: 5, off: 1, drag: 1, aim: 0, gale: down, lean: 9, bob: 7, pt: 0.6, wind: 0.74 }, ease: 'io' },
    { at: 2.62, pose: { prop: 5, off: 1, drag: 1, aim: 0, gale: down + 0.5, lean: 8.5, bob: 8.5, pt: 0.5, wind: 0.8 }, ease: 'io' },
    // hauled up, and let down to his side
    { at: 2.85, pose: { ...R, aim: 30, gale: 0, lean: 2, bob: 2, act: 0.2, pt: 0.3, wind: 0.9 }, ease: 'io' },
    { at: RAMPAGE_LONG, pose: { wind: 1 }, ease: 'io' },
  ];
  // his feet on the floor: a little set step for the first swing; a step in after each swing; off the floor in the leap and down
  // as he slams, a little apart; and a shuffle back under him at the end
  const near: FootKey[] = [[0, 0, 0], [0.7, 0, 0], [0.9, 0.62, 0.9], [RAMPAGE_LEAP[0], 0.62, 0], [h3, 2.0 - 0.8 / STRIDE_PER_TILE, 1.4], [2.8, 2.0 - 0.8 / STRIDE_PER_TILE, 0], [2.95, 2.0, 0.6], [RAMPAGE_LONG, 2.0, 0]];
  const far: FootKey[] = [[0, 0, 0], [0.04, 0, 0], [0.2, 0.14, 0.6], [1.27, 0.14, 0], [1.47, 1.05, 0.9], [RAMPAGE_LEAP[0], 1.05, 0], [h3, 2.0 + 0.9 / STRIDE_PER_TILE, 1.4], [2.85, 2.0 + 0.9 / STRIDE_PER_TILE, 0], [3.0, 2.0, 0.6], [RAMPAGE_LONG, 2.0, 0]];
  return onTheFloor(keys, near, far, rampageTravel, h3);
}

// --- THE BULL RUSH ---

/** The moment he sets off (seconds: the wind-up's `hit`), how fast he runs (tiles a second), and one round of his run (6 frames). */
export const RUSH_GO = 30 * F30;
export const RUSH_PACE = 11;
const RUSH_ROUND = 6;
/** His stop: how far the game carries him as he stumbles to a stop (tiles), and over how long (seconds). */
export const RUSH_STOP = { far: 1.2, long: 0.4, all: 1.0 } as const;
/** How far the game carries him `t` seconds into his stop: fast at first (his run's pace), then less and less. */
export function rushStopTravel(t: number): number {
  const k = clamp01(t / RUSH_STOP.long);
  const n = (RUSH_PACE * RUSH_STOP.long) / RUSH_STOP.far;
  return RUSH_STOP.far * (1 - (1 - k) ** n);
}
/** (his feet by what they do: the one that paws the floor is the one we see the dust of: the nearer facing us, the further facing away) */
function byRole(back: boolean, paw: ReadonlyArray<FootKey>, other: ReadonlyArray<FootKey>): [ReadonlyArray<FootKey>, ReadonlyArray<FootKey>] {
  return back ? [other, paw] : [paw, other];
}
const RU: Partial<Pose> = { prop: 4 };
/** Dust kicked back by a paw, by when each came down: its life at `t`. */
const dustOf = (t: number, downs: readonly number[], long = 0.3): number => {
  let k = 0;
  for (const d of downs) if (t >= d) k = (t - d) / long;
  return k > 0 && k < 1 ? k : 0;
};
/** The run's pose (all but his feet) at frame `i` of a round (0 to 5): head down, leaning hard into it, the free fist pumping (at the round's start, back as far as it goes). */
function runPose(i: number, back: boolean): Partial<Pose> {
  const k = (((i % RUSH_ROUND) + RUSH_ROUND) % RUSH_ROUND) / RUSH_ROUND;
  const a = k * Math.PI * 2;
  return { ...RU, lean: 14, bob: 2 + 1.3 * Math.cos(2 * a), gale: 5, swing: (back ? 0.45 : -0.55) * Math.cos(a), drag: 1.6, act: 0.3, wind: k };
}

/** THE BULL RUSH'S WARNING: head down, a fist on the floor, HELD, pawing twice; and he is off (`hit`). */
export function rushWindTimeline(back: boolean): Timeline {
  const low: Partial<Pose> = { ...RU, lean: 12, bob: 4, gale: 5, ohx: 7, ohy: 11, drag: 0.4 };
  const paws = [0.46, 0.76];
  const keys: Key[] = [
    { at: 0, pose: {} },
    { at: 0.14, pose: { ...RU, lean: 5, bob: 1, gale: 2, pt: 0.5, act: 0.2, drag: 0.2 }, ease: 'out' },
    { at: 0.3, pose: low, ease: 'in' },
    { at: 0.4, pose: { ...low, lean: 11, bob: 3.5 }, ease: 'io' },
    { at: 0.5, pose: { ...low, lean: 13, bob: 4.5, gale: 5.5 }, ease: 'io' },
    { at: 0.68, pose: { ...low, lean: 11.5, bob: 3.5 }, ease: 'io' },
    { at: 0.8, pose: { ...low, lean: 13, bob: 5, gale: 6 }, ease: 'io' },
    { at: 0.86, pose: { ...low, lean: 13.5, bob: 5.5, gale: 6, ohx: 7.5 }, ease: 'io' },
    { at: RUSH_GO, pose: runPose(0, back), ease: 'io' },
  ];
  // the paw: up and stamped down behind, twice; at the last the other foot up for the first stride
  const paw: FootKey[] = [[0, 0, 0], [0.34, 0, 0], [paws[0], -0.2, 0.7], [0.56, -0.2, 0], [0.64, 0.0, 0.8], [paws[1], -0.2, 0.6], [RUSH_GO, -0.2, 0]];
  const other: FootKey[] = [[0, 0, 0], [0.9, 0, 0], [1.1, 0.11, 0.67]];
  const [near, far] = byRole(back, paw, other);
  const tl = onTheFloor(keys, near, far, () => 0, RUSH_GO);
  for (const k of tl.keys) (k.pose as Pose).sweep = dustOf(k.at, paws);
  return tl;
}

/**
 * THE RUN: head down, bounding; six frames round, at RUSH_PACE (the game carries him on as they go round). Each foot is down two
 * frames of the six, where it came down on the floor (it goes back under him as fast as he goes on), and between the two
 * footfalls he is off the floor.
 */
export function rushTimeline(back: boolean): Timeline {
  const T = RUSH_PACE * F30 * STRIDE_PER_TILE;
  const half = T / 2;
  // (a foot by the frame of the round, from its first footfall: down, down, then up and forward again over four)
  const foot = (j: number): { s: number; lift: number } => {
    const f = ((j % RUSH_ROUND) + RUSH_ROUND) % RUSH_ROUND;
    if (f === 0) return { s: half, lift: 0 };
    if (f === 1) return { s: -half, lift: 0 };
    const k = (f - 1) / (RUSH_ROUND - 1);
    return { s: -half + 2 * half * (k * k * (3 - 2 * k)), lift: 0.7 * Math.sin(Math.PI * k) };
  };
  const keys: Key[] = [];
  for (let i = 0; i < RUSH_ROUND; i++) {
    // (the paw foot comes down second-to-last of the round: it is down at the round's first frame, pushing off)
    const p = foot(i + 1);
    const o = foot(i - 2);
    const [n, f] = back ? [o, p] : [p, o];
    keys.push({ at: i * F30, ease: 'lin', pose: { ...REST, aim: 80, ...runPose(i, back), near: n.s, nearLift: n.lift, far: f.s, farLift: f.lift } });
  }
  return { keys, loop: 0 };
}

/** THE STOP: a foot dug in, a stumble and another, rocked back off balance, his head shaken; and he stands. */
export function rushStopTimeline(back: boolean): Timeline {
  const L = RUSH_STOP.all;
  const keys: Key[] = [
    { at: 0, pose: runPose(0, back) },
    { at: 2 * F30, pose: { ...RU, lean: 10, bob: 5, gale: 5, swing: 0.6, drag: 1.4, act: 0.2 }, ease: 'out' },
    { at: 0.2, pose: { ...RU, lean: 4, bob: 4, gale: 3, swing: 0.3, drag: 1, act: 0.3, pt: 0.4 }, ease: 'io' },
    { at: 0.36, pose: { ...RU, lean: -5, bob: 1, gale: 1, swing: -0.3, drag: 0.6, act: 0.6, pt: 1 }, ease: 'out' },
    { at: 0.5, pose: { ...RU, lean: -3, bob: 2, gale: 2, hx: 2, drag: 0.4, act: 0.3, pt: 0.6 }, ease: 'io' },
    { at: 0.6, pose: { ...RU, lean: -2, bob: 2, gale: 2.5, hx: -2, drag: 0.3, pt: 0.3 }, ease: 'io' },
    { at: 0.7, pose: { ...RU, lean: -1.5, bob: 2, gale: 2, hx: 1.5, drag: 0.2, pt: 0.2 }, ease: 'io' },
    { at: 0.8, pose: { ...RU, lean: -1, bob: 1.5, gale: 1, hx: -0.5, drag: 0.1 }, ease: 'io' },
    { at: L, pose: { wind: 1 }, ease: 'io' },
  ];
  // (where his feet were at the run's last frame, on the floor as it was then; then dug in, stumbling, and back under him)
  const pawW = (RUSH_PACE * F30 * STRIDE_PER_TILE) / 2 / STRIDE_PER_TILE;
  const D = (t: number): number => rushStopTravel(t);
  const paw: FootKey[] = [[0, -pawW, 0], [4 * F30, D(4 * F30) + 2.0 / STRIDE_PER_TILE, 1.2], [0.42, D(4 * F30) + 2.0 / STRIDE_PER_TILE, 0], [0.56, D(0.6) - 0.9 / STRIDE_PER_TILE, 0.7], [0.82, D(0.6) - 0.9 / STRIDE_PER_TILE, 0], [0.94, RUSH_STOP.far, 0.6], [L, RUSH_STOP.far, 0]];
  // (the other in the air at the run's last frame, half way to its next footfall: so it is drawn from before the stop began)
  const plant = D(2 * F30) + 2.4 / STRIDE_PER_TILE;
  const other: FootKey[] = [[-2 * F30, 0.11 - plant, 0], [2 * F30, plant, 0.67], [0.22, plant, 0], [0.34, RUSH_STOP.far + 0.2 / STRIDE_PER_TILE, 0.8], [0.9, RUSH_STOP.far + 0.2 / STRIDE_PER_TILE, 0], [0.98, RUSH_STOP.far, 0.4], [L, RUSH_STOP.far, 0]];
  const [near, far] = byRole(back, paw, other);
  const tl = onTheFloor(keys, near, far, D);
  for (const k of tl.keys) (k.pose as Pose).sweep = dustOf(k.at, [2 * F30, 4 * F30], 0.35);
  return tl;
}

export function makeBruteArt(): ActorArt {
  const how = CARRY;
  return monsterArt((q, back) => ogre(q, back, false, how), ogreMoves(false, false, how), ogreMoves(true, false, how), { canvas: BRUTE_CANVAS, rest: { aim: 80 }, aura: BRUTE_AURA, idleFps: 8, walkFps: 11, dieTime: 1.05 });
}

export function makeGuardianArt(): ActorArt {
  const how = CARRY;
  return monsterArt((q, back) => ogre(q, back, true, how), ogreMoves(false, true, how), ogreMoves(true, true, how), { canvas: BRUTE_CANVAS, rest: { aim: 80 }, aura: GUARDIAN_AURA, idleFps: 8, walkFps: 9, dieTime: 1.2 });
}

// =============================================================================================
// THE TROLL CHIEFTAIN: A YELLOW PACK'S LEADER OF TROLLS (the art chat, 9 Oct 2026). A MOCK-UP: NOT IN
// THE GAME: nothing of the game makes him (`makeChieftainArt`).
//
// Asked in the art chat who should lead each kind of yellow pack, his pick for the trolls: "A troll
// chieftain (Recommended)". His brief (the art rulebook's "A new character"), asked as a pop-up and
// answered by 14:41: "Bigger than his trolls (Recommended)" (offered as "A head over them and
// broader, with his crown of antlers and bone and the banner on his back."); his attacks, in his
// own words: "I don’t want the bellow if the Skelton leader has the same thing" (so: his trolls'
// swing and slam, heavier and slower, and no bellow); "To his knees, then face-first
// (Recommended)" (offered as "He drops to his knees, then topples forward, and his banner falls
// over him."); and for the Sound chat, "A huge rumbling bellow (Recommended)".
//
// So he is the brute's rig (the green troll's: his slate-blue hide, his hide skirt, his strap, his
// studded club carried at his side), bigger than the red troll (CHIEF), with two things to know him
// by: A CROWN OF ANTLERS AND BONE, a circlet of bone and teeth round his little head and two great
// antlers branching up and out of it; and HIS BANNER, on a pole of dark wood on his back, its top a
// small skull, its cloth a ragged hide of old red, painted with a pale sign, flying behind his head
// and stirring as he moves.
//   standing, walking  his trolls', slower: he is heavier (and his banner flies)
//   attack     his trolls' slam (`smash`), slower
//   moves.swing  his trolls' swing (TROLL_MOVES), slower
//   death      TO HIS KNEES, THEN FACE-FIRST: his trolls' (ogreDeath), but over further, all the way
//              down on his face; his banner topples forward and falls over him; and as he lands his
//              crown comes off and rolls away.

/** His banner's cloth: an old red hide. Its pole: dark wood. */
export const BANNER: Ramp =['#3a0a1c', '#3a0a1c', '#7a1430', '#b0304c', '#b0304c'];
const POLE: Ramp = dim(INDIGO);
/** How much slower his blows are than his trolls' (he is bigger and heavier). */
const CHIEF_SLOW = 1.2;

/**
 * WHERE HIS BANNER IS: the foot of its pole on his back (facing us, his back is up the screen and to
 * the left of him; facing away, toward us), its top over his head, leaning back a little; the
 * crossbar at its top, the cloth hanging from it (`long`), its foot blown back (`sway`) by the air
 * and by his going.
 */
function bannerOf(X: number, shY: number, back: boolean, S: number, wind: number, drag: number): { foot: V; top: V; bar: [V, V]; long: number; sway: number } {
  const foot: V = back ? [X - 3 * S, shY + 7 * S] : [X - 6 * S, shY + 3 * S];
  const top: V = back ? [X - 9 * S, shY - 31 * S] : [X - 12 * S, shY - 33 * S];
  const bar: [V, V] = [[top[0] - 7 * S, top[1] + 3 * S], [top[0] + 4 * S, top[1] + 2.5 * S]];
  const ph = wind * Math.PI * 2;
  return { foot, top, bar, long: 15 * S, sway: -(1.2 + 2.8 * drag) * S + Math.sin(ph) * 1.5 * S };
}

/** HIS BANNER, painted: the pole, a small skull at its top, the crossbar, and the cloth hanging from it, ragged at its foot, a pale sign on it. */
function paintBanner(p: Px, f: { foot: V; top: V; bar: [V, V]; long: number; sway: number }, back: boolean, S: number, wind: number): void {
  const ph = wind * Math.PI * 2;
  const pole = back ? POLE : dim(POLE);
  limb(p, f.foot[0], f.foot[1], f.top[0], f.top[1], 1.15 * S, 1.0 * S, pole);
  limb(p, f.bar[0][0], f.bar[0][1], f.bar[1][0], f.bar[1][1], 0.8 * S, 0.8 * S, pole);
  // the cloth: from the crossbar down, its foot blown back and stirring, its hem torn into tatters
  const [a, b] = f.bar;
  const y0 = Math.round(Math.min(a[1], b[1]) + 1);
  const rows = Math.round(f.long);
  for (let i = 0; i <= rows; i++) {
    const t = i / rows;
    const off = f.sway * t ** 1.5 + Math.sin(ph * 2 + t * 4) * 0.8 * S * t;
    const x0 = Math.round(a[0] + 1 + off);
    const x1 = Math.round(b[0] - 1 + off - t * 1.5 * S);
    for (let x = x0; x <= x1; x++) {
      // (tatters at its foot: some columns end short)
      if (t > 0.78 && hash(x - x0, 3, 59) < (t - 0.78) * 4) continue;
      const edge = x === x0 ? 3 : x === x1 ? 1 : 2;
      p.set(x, y0 + i, BANNER[edge]);
    }
  }
  // the sign painted on it, pale: a pair of antlers over a dot (his own)
  const mx = Math.round((a[0] + b[0]) / 2 + f.sway * 0.3);
  const my = Math.round(y0 + f.long * 0.42);
  const sign = BONE[2];
  for (const [dx, dy] of [[-3, -3], [-2, -2], [-2, -4], [-1, -1], [1, -1], [2, -2], [2, -4], [3, -3], [0, 0], [0, 1], [-1, 1], [1, 1]] as const) {
    if (p.has(mx + dx, my + dy)) p.set(mx + dx, my + dy, sign);
  }
  // a small skull at the top of the pole, its sockets dark
  const sx = Math.round(f.top[0]);
  const sy = Math.round(f.top[1]);
  stamp(p, sx - 2, sy - 4, ['.WWW.', 'WWWWW', 'WKWKW', '.WWW.', '.W.W.'], { W: BONE[3], K: INK });
}

/** HIS CROWN OF ANTLERS AND BONE, on his little head ((cx, top) as `head` takes them): a circlet of bone with teeth standing up out of it, and two great antlers branching up and out. */
function crown(p: Px, cx: number, top: number): void {
  const x0 = snap(cx - 7.5);
  const y0 = snap(top);
  // the antlers: a beam each side, up and out from the circlet, three tines off it
  for (const side of [-1, 1] as const) {
    const bx = side < 0 ? x0 + 2.5 : x0 + 12.5;
    const pts: V[] = [[bx, y0 + 1], [bx + side * 2, y0 - 3.5], [bx + side * 4.5, y0 - 7.5], [bx + side * 5.8, y0 - 12], [bx + side * 5.2, y0 - 16.5]];
    for (let i = 1; i < pts.length; i++) limb(p, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], 1.35 - i * 0.18, 1.2 - i * 0.18, BONE);
    for (const [from, dx, dy] of [[1, -0.5, -4.5], [2, 4.2, -2.6], [3, -2.2, -4.2]] as const) {
      const o = pts[from];
      limb(p, o[0], o[1], o[0] + side * dx, o[1] + dy, 0.85, 0.5, BONE);
    }
  }
  // the circlet: a band of bone round the top of his head, teeth standing up out of it
  for (let x = x0 + 1; x <= x0 + 13; x++) {
    p.set(x, y0, (x - x0) % 2 ? BONE[3] : BONE[2]);
    p.set(x, y0 + 1, BONE[1]);
    if ((x - x0) % 3 === 1) p.set(x, y0 - 1, BONE[3]);
  }
  // (floor 9's chieftain: three little skulls set in it, the middle one highest)
  if (NINE) {
    for (const [sx, sy] of [[x0 + 2, y0 - 3], [x0 + 6, y0 - 4], [x0 + 10, y0 - 3]] as const) {
      const SK = ['.BBB.', 'BBBBB', 'BKBKB', '.BBB.', '.B.B.'];
      SK.forEach((row, j) => [...row].forEach((ch, i) => {
        if (ch === 'B') p.set(sx + i, sy + j, j < 2 ? BONE[4] : BONE[3]);
        else if (ch === 'K') p.set(sx + i, sy + j, INK);
      }));
    }
  }
}

/** FLOOR 9'S CHIEFTAIN'S WAR PAINT on his face (the head's stamp at (cx, top), facing us) and on his chest: bone white and old blood. */
function warPaint(face: Px, body: Px, cx: number, top: number, chest: V, S: number): void {
  const x0 = snap(cx - 7.5);
  const y0 = snap(top);
  // (a band of old blood across his brow; two white streaks down from under each eye)
  for (let x = x0 + 5; x <= x0 + 12; x++) if (face.has(x, y0 + 3)) face.set(x, y0 + 3, PAINT_RED);
  for (const ex of [x0 + 6, x0 + 11]) for (let y = y0 + 6; y <= y0 + 8; y++) if (face.has(ex, y)) face.set(ex, y, PAINT_WHITE);
  // (on his chest, a jagged stripe of white across it, and a red handprint)
  const n = 7;
  for (let i = 0; i < n; i++) {
    const ax = chest[0] - 9 * S + (18 * S * i) / (n - 1);
    const ay = chest[1] + (i % 2 ? 2.4 : -1.2) * S;
    const bx = chest[0] - 9 * S + (18 * S * (i + 1)) / (n - 1);
    const by = chest[1] + ((i + 1) % 2 ? 2.4 : -1.2) * S;
    if (i < n - 1) {
      const steps = Math.ceil(Math.hypot(bx - ax, by - ay));
      for (let k = 0; k <= steps; k++) {
        const x = snap(ax + ((bx - ax) * k) / steps);
        const y = snap(ay + ((by - ay) * k) / steps);
        for (const [dx, dy] of [[0, 0], [0, 1]] as const) if (body.has(x + dx, y + dy)) body.set(x + dx, y + dy, PAINT_WHITE);
      }
    }
  }
  const hx = snap(chest[0] + 4 * S);
  const hy = snap(chest[1] + 6 * S);
  const HAND = ['.R.R.R', '.R.R.R', 'RRRRRR', 'RRRRR.', '.RRR..'];
  HAND.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch === 'R' && body.has(hx + i, hy + j)) body.set(hx + i, hy + j, PAINT_RED);
  }));
}

/** A timeline played slower by `k` (its blow too). */
function slower(t: Timeline, k: number): Timeline {
  const out: Timeline = { ...t, keys: t.keys.map((key) => ({ ...key, at: key.at * k })) };
  if (t.hit !== undefined) out.hit = t.hit * k;
  return out;
}

/** How long his death takes (seconds). */
export const CHIEF_DIE_TIME = 1.6;

/** How he is posed `k` of the way through his death: his trolls' (`dying`), but on over further, all the way down onto his face. */
function chiefDying(k: number, back: boolean): { pose: Partial<Pose>; sink: number } {
  const d = dying(k, back);
  const u3 = clamp01((k - GOES) / (LIES - GOES));
  const pitch = u3 * u3;
  return { pose: { ...d.pose, lean: (d.pose.lean ?? 0) + 7 * pitch, bob: (d.pose.bob ?? 0) + (back ? 4 : 7) * pitch }, sink: d.sink + 2 * pitch };
}

/** The pieces that leave him as he dies (his club, his banner, his crown), as they were when they left him, for each view: painted once and kept. */
const CHIEF_PIECES = new Map<string, Px>();

/**
 * HIS DEATH, TO HIS KNEES, THEN FACE-FIRST (his pick by 14:41): as his trolls' (ogreDeath): rocked
 * back with a roar, his club out of his hand, his knees giving, sagging on them; then over, all the
 * way down onto his face. His banner leaves him as he goes over, topples forward and falls across
 * him; and as he lands his crown comes off and rolls away.
 */
function chiefDeath(k: number, back: boolean, how: Carry): Painted {
  const S = CHIEF;
  const W = CHIEF_CANVAS.w;
  const H = CHIEF_CANVAS.h;
  const AX = CHIEF_CANVAS.ax;
  const AY = CHIEF_CANVAS.ay;
  const painted = (at: number, off: ReadonlyArray<'banner' | 'crown'>): { whole: Painted; club: Px; rest: Px; banner: Px; crown: Px } => {
    const d = chiefDying(at, back);
    let parts: { club: Px; rest: Px; banner?: Px; crown?: Px } | null = null;
    TAKE = (got) => (parts = got);
    TAKE_OFF = off;
    DOWN = at >= STRUCK ? { sink: d.sink } : null;
    const whole = ogre({ ...REST, aim: 80, ...d.pose }, back, false, how, null, true);
    TAKE = null;
    TAKE_OFF = null;
    DOWN = null;
    const got = parts as { club: Px; rest: Px; banner?: Px; crown?: Px } | null;
    const none = new Px(W, H);
    return { whole, club: got ? got.club : none, rest: got ? got.rest : whole.px, banner: got?.banner ?? none, crown: got?.crown ?? none };
  };
  const off: ('banner' | 'crown')[] = [];
  if (k >= GOES) off.push('banner');
  if (k >= LIES) off.push('crown');
  const now = painted(k, off);
  if (k < STRUCK) return now.whole;
  const dark = [SOCKET, FLAME[3], FLAME[4]];
  quench(now.rest, dark, INK);
  const kept = (what: 'club' | 'banner' | 'crown', at: number): Px => {
    const key = `${what}:${back ? 'back' : 'front'}:${how}`;
    let px = CHIEF_PIECES.get(key);
    if (!px) {
      px = quench(painted(at, [])[what], dark, INK);
      CHIEF_PIECES.set(key, px);
    }
    return px;
  };
  const club = kept('club', STRUCK);
  const lay = across(club);
  const clubTo: [number, number] = [lay ? (lay[0] + lay[1] + 1) / 2 + (back ? 17 : -10) * S : AX, AY + 3];
  const pieces: Piece[] = [
    { px: now.rest, to: [AX, AY], from: 2, until: 3 },
    { px: club, to: clubTo, from: STRUCK, until: STRUCK + 0.19, hop: 2 * S, bounce: 2.5 * S },
  ];
  // (his banner: it goes over with him, and on over him, and lies across his back)
  // (forward, the way he went: down the screen and to the right facing us, up it and to the right facing away)
  if (k >= GOES) pieces.push({ px: kept('banner', GOES), to: [AX + 12 * S, AY - (back ? 14 : 10) * S], turns: 1, topple: true, from: GOES, until: LIES + 0.04, bounce: 1.5 * S });
  // (his crown: knocked off as he lands, it rolls away from him)
  if (k >= LIES) pieces.push({ px: kept('crown', LIES), to: [AX + 50 * S, AY + (back ? -8 : 2)], turns: 2, from: LIES, until: 0.99, hop: 3 * S, bounce: 2 * S });
  const px = fallen(pieces, k, W, H, INK);
  dust(px, AX + 2 * S, 14 * S, (k - KNEES) / 0.15, S, AY);
  dust(px, AX + 14 * S, 24 * S, (k - LIES) / (1 - LIES), S, AY);
  return { px, lights: [] };
}

/** The pool of light behind him, on his canvas. */
const CHIEF_AURA: Light = { x: CHIEF_CANVAS.ax - 2, y: CHIEF_CANVAS.ay - 44, r: 70, color: '#ff3a78', a: 0.16 };

/** THE TROLL CHIEFTAIN, as the game holds a monster: his stand and walk (slower than his trolls'), his slam (`attack`), his swing (`clips.moves.swing`), his death. */
export function makeChieftainArt(): ActorArt {
  const how = CARRY;
  const moves = (back: boolean): MonsterMoves => ({ attack: slower(smash(back), CHIEF_SLOW), more: { swing: slower(swingMove(), CHIEF_SLOW) }, die: (k) => chiefDeath(k, back, how) });
  return monsterArt((q, back) => ogre(q, back, false, how, null, true), moves(false), moves(true), { canvas: CHIEF_CANVAS, rest: { aim: 80 }, aura: CHIEF_AURA, idleFps: 7, walkFps: 8, dieTime: CHIEF_DIE_TIME });
}

/** One frame of the troll chieftain, as a painting (for pictures). */
export const paintChieftain: Rig = (q, back) => ogre(q, back, false, CARRY, null, true);

/**
 * FLOOR 9'S TROLL CHIEFTAIN, THE SIDE BOSS (art/troll_chief9.ts; docs/mockups/f9_side_bosses/README.md), as the game holds a monster:
 * the troll chieftain with floor 9's own things (NINE): his tree-trunk club bound with iron, skulls in his crown, his war paint. His
 * moves to come; for now the chieftain's.
 */
export function makeChief9Art(): ActorArt {
  const how = CARRY;
  const moves = (back: boolean): MonsterMoves => ({ attack: slower(smash(back), CHIEF_SLOW), more: { swing: slower(swingMove(), CHIEF_SLOW) }, die: (k) => withNine(() => chiefDeath(k, back, how)) });
  return monsterArt((q, back) => withNine(() => ogre(q, back, false, how, null, true)), moves(false), moves(true), { canvas: CHIEF_CANVAS, rest: { aim: 80 }, aura: CHIEF_AURA, idleFps: 7, walkFps: 8, dieTime: CHIEF_DIE_TIME });
}
