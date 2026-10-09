// The bones: the skeleton and the bone archer. One frame of bones carries either a notched,
// rusted sword (the skeleton: the most common enemy in the game) or a tall bow (the archer, who
// wears a ragged red hood and mantle so that the two are told apart at a glance).
//
// The design is the sheet's (previews/art_styles_1_and_6.png, "6 Bold and modern", painted by
// skeleton() in src/dev/styles.ts): a skull of pale lavender bone with two square sockets and a
// point of hot pink deep in each, a rib cage painted as ribs, thin bones with a knob at every
// joint, three finger bones on the hanging hand, long feet, a scrap of teal cloth at the hips.
// Here it is turned to face screen-right, given a back, and made to move.
//
// TURNED TO THE GRID (after Version 14.5; kit.ts, "Turned to the grid"): both are seen from a
// corner, as the heroes are. The skull is turned toward the side it faces (the nearer socket
// whole, the further one narrow at the skull's edge), the breast bone is toward that side and the
// spine, from behind, away from it; the collar bone, the ribs and the pelvis are painted level
// and then slid by columns so that they run along the grid; the nearer shoulder is lower and the
// further one higher; the feet point along the grid and a step goes along it.
//
// Painted with the kit (art/kit.ts, art/mkit.ts) as the heroes are. Every frame faces
// screen-right: `front` toward the camera (down-right), `back` away from it (up-right). As with
// the heroes the weapon arm is on screen-right in both views: facing us it is the far arm and
// goes behind the ribs, facing away it is the near one and crosses in front of them.
//
// What the numbers of a Pose mean to these two (besides what the kit says of them):
//   hx, hy, aim  the weapon hand, from where it rests, and the way the weapon points: the sword's
//                blade, or the flight of the arrow on the bow (0 = screen-right, 90 = straight up)
//   off          the skeleton's free arm: 0 hangs, 1 flung out and up, -1 trailing behind.
//                The archer's string hand: -1 hangs at the side, 0 holds the string, 1 has let it
//                go, 2 is at the quiver.
//   ohx, ohy     the free hand (the string hand) moved from wherever the rest puts it
//   act          the skeleton: the jaw forced open (0..1). The archer: how far the bow is drawn (0..1).
//                Either way the light in the sockets burns up with it.
//   pt           the skeleton: the skull tipped, in pixels: + dipped forward, - thrown back.
//                The archer: the loosed string thrown forward of straight, in pixels.
//   prop         the archer: 1 = a fresh arrow in the string hand, on its way from the quiver
//   behind       the skeleton, facing us: the sword passes behind the skull
//   drag         1 is a walk: the rag trails, and the archer carries the bow across its body. More than
//                1 (the instant of the skeleton's blow): the blade leaves a blur in the air.
// The standing loop is read from `wind` alone (it goes once round in twelve frames): on certain
// frames the jaw clacks, the fingers twitch, the skull settles a frame after the ribs.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt } from './actor_types';
import type { Key, Timeline } from './clip';
import { fallen, quench } from './death';
import type { Piece } from './death';
import { BONE, INDIGO, INK, KAY, KH, KW, KX, PINK, PLUM, REST, TEAL, WALK_FRAMES, compose, dim, dir, footOf, joint, layer, limb, lit, shear, shearBy, slant, stamp } from './kit';
import type { Painted, Pose, Ramp, Rig, V } from './kit';
import { BLOOD, FLAME, IRON, RUST, SOCKET, monsterArt, strike } from './mkit';

// --- how the bones are built, in pixels ---------------------------------------------------------
/** Floor to the crown of the skull, to the collar bone, to the top of the pelvis. */
const CROWN = 52;
const COLLAR = 39;
const PELVIS = 23;
/** Half the width across the shoulder joints, and across the hip joints. */
const SHOULDER = 7;
const HIPS = 3;
/** Seen from a corner: the nearer shoulder is this much lower, the further one this much higher. */
const NEAR_DROP = 2;
const FAR_RISE = 3;
/** How far each foot stands from the centre line. */
const STANCE = 5;
/** Bones of an arm. */
const UPPER = 8;
const FORE = 7.5;
const REACH = UPPER + FORE - 0.4;
/** The sword: blade length and half width, and how far the grip runs back from the hand. */
const BLADE = 20;
const BLADE_W = 2;
const GRIP = 2;
/** The bow: half its height, how deep it curves, how far it is drawn, and the length of an arrow. */
const BOW_H = 21;
const BOW_K = 7;
const DRAW = 21;
const ARROW = 27;

const WOOD = INDIGO;
const STRING = BONE[2];
const SHAFT = PLUM[3];

/**
 * While a wound-up pose is held the wind moves on by a fifth of its loop (mkit's strike): this
 * many flickers to the loop puts one to each frame of the skeleton's hold.
 */
const SHAKE = 21.6;
/** ... and this many, one to each frame of the archer's (see shot). */
const SPIT = 39.75;

/** What is carried. */
/** What it carries: a sword; a bow (the archer); or a sword and a tall shield (the SHIELDBEARER: a new monster, painted on 6 Oct 2026 for the owner to see; it is in no dungeon and the rules know nothing of it). */
type Carry = 'sword' | 'bow' | 'shield';

// ---------------------------------------------------------------------------------------------
// Pixel maps. L M D = bone light, mid, dark; K = the dark inside; S = the light in a socket;
// R r d = red cloth light, mid, dark; T t e = teal cloth light, mid, dark.

function tones(r: Ramp): Readonly<Record<string, string>> {
  return { L: r[3], M: r[2], D: r[0], K: INK, S: SOCKET, R: BLOOD[3], r: BLOOD[2], d: BLOOD[0], T: TEAL[3], t: TEAL[2], e: TEAL[0] };
}

/**
 * The skull, seen from a corner: turned to screen-right, the nearer socket whole and the further
 * one narrow at the skull's edge, the hole of the nose under the bridge between them. Its last
 * row is the upper teeth.
 */
const SKULL: readonly string[] = [
  '...LLLLLL...',
  '.LLLLLLLLM..',
  'LLLLLLLLLMM.',
  'LLLLLLLLLMMD',
  'LLLLLKKKMKKD',
  'LLLLMKSKMKSD',
  'LLMMMKKKMKKD',
  '.MMMMMMMKKD.',
  '..MMMMMMMMD.',
  '...MLKLKLKL.',
];
/** The jaw: lower teeth that meet the upper ones, and the chin. */
const JAW: readonly string[] = [
  '...MLKLKLKL.',
  '...MMMMMMDD.',
  '....MMMMDD..',
];
/**
 * From behind: a round cranium with a crack in it, and the notch where the spine goes in. The
 * crack and the notch are on the skull's middle line, which from behind is away from the side faced.
 */
const SKULL_BACK: readonly string[] = [
  '...LDLLLL...',
  '.LLDLLLLLMM.',
  'LLLLDLLLLMMD',
  'LLLDLLLLMMMD',
  'LLLLDLMMMMMD',
  'LLLLMMMMMMDD',
  'LLMMMMMMMMDD',
  '.MMMMMMMMDD.',
  '..MKKMMMDD..',
  '...KKMDDD...',
];
/** From behind the jaw shows under the skull on the side the face is turned to. */
const JAW_BACK: readonly string[] = [
  '......MMMD..',
  '.......MD...',
];

/**
 * The rib cage from in front: the collar bone, then ribs hung on the breast bone, dark between
 * them. Painted level (the rig slides it onto the grid); the breast bone is toward the side faced.
 */
const RIBS: readonly string[] = [
  'LLLLLLLLLLMMMD',
  '.........ML...',
  '.LLLLLLLLLMMD.',
  '.........ML...',
  '.LLLLLLLLLMMD.',
  '.........ML...',
  '.LLLLLLLLLMMD.',
  '.........ML...',
  '..LLLLLLLMMD..',
  '.........ML...',
  '...LLLLLMMD...',
  '.........MD...',
];
/** From behind: the shoulder blades, and the spine running down between the ribs, away from the side faced. */
const RIBS_BACK: readonly string[] = [
  'LLLLLLLLLLMMMD',
  '.LL.LM.LLLLLM.',
  '..L.MD.LLLLM..',
  '.L..LM.LLLM.D.',
  '....MD.LL.....',
  '.L..LM.....MD.',
  '....MD........',
  '.LLLLLLMMMMMD.',
  '....MD........',
  '..LLLLLMMMMD..',
  '....MD........',
  '...LLLLMMMD...',
];

const PELVIS_MAP: readonly string[] = [
  '.LLLLLMMMMD.',
  'LLLMMMMMMMDD',
  '.LMKKMMKKDD.',
  '..MMM..MDD..',
];
const PELVIS_BACK: readonly string[] = [
  '.LLMLLLMMMD.',
  'LMMLMMMMMMDD',
  '.LMMMMMMMDD.',
  '..MMM..MDD..',
];

/** The knot of the rag, seen from behind: it sits on the crest of the pelvis, where the spine comes down. */
const KNOT: readonly string[] = [
  '.TT.',
  'TTtt',
  'Ttte',
];

/**
 * The archer's hood from in front, laid over the skull (which shows through the dots): it covers
 * the crown and the back of the head, its rim throws a shadow across the brow, and there is a
 * tear in its crown.
 */
const HOOD: readonly string[] = [
  '....rRRRRr....',
  '..rRdRRRRRRr..',
  '.rRRRdRRRRRRr.',
  'rRRRRRRRRRRRrd',
  'RRRRrdddddddrd',
  'RRRrd........d',
  'RRRrd........d',
  'RRRrd........d',
  'RRRrd........d',
  'RRRRd.......rd',
  '.RRRd.......rd',
  '.RRRrd......rd',
  '.rRRRd......d.',
  '..rRRd.....rd.',
];
/** From behind the hood is all there is to see of the head: a seam runs down the back of it, and it is torn. */
const HOOD_BACK: readonly string[] = [
  '....rRRRRr....',
  '..RRRRRRRRRr..',
  '.RRRRRdRRRRrr.',
  'RRRRRRdrrrrrrd',
  'RRRRRdrrrrrrrd',
  'RRdRRdrrrrrrrd',
  'RRddRdrrrrrrdd',
  'RRRdRdrrrrrrdd',
  'RRRRRrdrrrrrdd',
  'RRRRrrdrrrrrdd',
  '.RRrrrdrrrrddd',
  '.rrrrrrdrrrdd.',
  '.rrrrrrdrdddd.',
  '..rrrrrrrddd..',
];

// ---------------------------------------------------------------------------------------------
// Parts

function pick(a: V, b: V, score: (v: V) => number): V {
  return score(a) >= score(b) ? a : b;
}

function whole(v: V): V {
  return [Math.round(v[0]), Math.round(v[1])];
}

function mixv(a: V, b: V, k: number): V {
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
}

/** A hand that cannot be further from its shoulder than the arm is long. */
function within(s: V, h: V, reach: number): V {
  const d = Math.hypot(h[0] - s[0], h[1] - s[1]);
  return d <= reach ? h : [s[0] + ((h[0] - s[0]) * reach) / d, s[1] + ((h[1] - s[1]) * reach) / d];
}

/** The shape of a knob on the end of a bone (use inside lit). */
function knob(l: Px, at: V): void {
  l.ellipse(at[0], at[1], 1.6, 1.6, INK);
}

/** The shape of a bone's shaft, two pixels thick (use inside lit). */
function shaft(l: Px, a: V, b: V): void {
  limb(l, a[0], a[1], b[0], b[1], 1, 1, BONE);
}

/**
 * Bones are too thin for the kit's usual depth of light: the edge that faces the light is the
 * light tone and the rest the middle one. `paint` lays down the shape.
 */
function bone(p: Px, ramp: Ramp, paint: (l: Px) => void): void {
  lit(p, ramp, [0, 1], [0, 0], paint);
}

/** The shade under a knob: its lower right corner. */
function shade(p: Px, ramp: Ramp, at: V): void {
  p.set(at[0], at[1] + 1, ramp[1]).set(at[0] + 1, at[1], ramp[1]).set(at[0], at[1], ramp[1]);
}

/**
 * One leg: thigh, knee, shin and a long foot whose toes point to screen-right (from behind the
 * heel shows and the toes are short). `sole` is the row the foot stands on.
 */
function legBones(p: Px, ramp: Ramp, hip: V, knee: V, ankleX: number, sole: number, back: boolean, hangs: boolean): void {
  const ankle: V = [ankleX, sole - 2];
  bone(p, ramp, (l) => {
    shaft(l, hip, knee);
    shaft(l, knee, ankle);
    knob(l, knee);
    if (hangs && !back) {
      // off the floor the foot hangs from the ankle, toes down
      l.rect(ankleX - 2, sole - 1, 4, 1, INK);
      l.rect(ankleX - 1, sole, 5, 1, INK);
      l.rect(ankleX + 2, sole + 1, 3, 1, INK);
    } else if (back) {
      // seen from behind the foot points up the screen and to the right: the heel, and the toes beyond it a row higher
      l.rect(ankleX - 2, sole, 4, 1, INK);
      l.rect(ankleX - 1, sole - 1, 6, 1, INK);
    } else {
      // the foot points down the screen and to the right, along the grid: the heel under the ankle, the toes a row lower
      l.rect(ankleX - 2, sole - 1, 4, 1, INK);
      l.rect(ankleX - 2, sole, 6, 1, INK);
      l.rect(ankleX + 1, sole + 1, 5, 1, INK);
    }
  });
  shade(p, ramp, knee);
  if (hangs && !back) p.hline(ankleX + 3, sole + 1, 2, ramp[1]).set(ankleX + 3, sole, ramp[1]);
  else if (back) p.hline(ankleX - 1, sole, 3, ramp[1]);
  else p.hline(ankleX + 2, sole + 1, 4, ramp[1]).set(ankleX - 1, sole, ramp[1]);
}

/** One bone of an arm, with a knob at its upper end. */
function armBone(p: Px, ramp: Ramp, a: V, b: V): void {
  bone(p, ramp, (l) => {
    shaft(l, a, b);
    knob(l, a);
  });
  shade(p, ramp, a);
}

/**
 * An open hand: a row of wrist bones and three finger bones, which point the way the forearm does
 * (`fx`, `fy`: from the elbow to the wrist), up, down or to a side. `trail` carries the finger
 * tips sideways.
 */
function fingers(p: Px, ramp: Ramp, w: V, fx: number, fy: number, trail: number): void {
  const upright = Math.abs(fy) >= Math.abs(fx) * 0.8;
  const s = upright ? (fy >= 0 ? 1 : -1) : fx >= 0 ? 1 : -1;
  // (ax, ay): one step along the fingers; (bx, by): one step along the wrist
  const [ax, ay, bx, by] = upright ? [0, s, 1, 0] : [s, 0, 0, 1];
  const x = w[0] - (upright ? 0 : s > 0 ? 0 : 1);
  const y = w[1] - (upright ? (s > 0 ? 0 : 1) : 0);
  for (let i = -3; i <= 1; i++) p.set(x + bx * i, y + by * i, ramp[3]);
  for (const [at, len] of [[-3, 2], [-1, 3], [1, 2]] as const) {
    for (let k = 1; k <= len; k++) p.set(x + bx * at + ax * k + (k >= 2 ? trail * bx : 0), y + by * at + ay * k, k === len ? ramp[2] : ramp[3]);
  }
}

/** A hand closed on something: a knob. */
function fistOn(p: Px, at: V): void {
  bone(p, BONE, (l) => l.ellipse(at[0], at[1], 2, 2, INK));
  shade(p, BONE, at);
}

/**
 * The rusted sword. (hx, hy) is the hand; `deg` the way the blade points. Its edges are notched
 * and it is pitted: a few specks of bare metal on the side in shade, a few of rust on the lit one.
 */
function sword(p: Px, hx: number, hy: number, deg: number): void {
  const [dx, dy] = dir(deg);
  const litSide = 0.65 * dy - 0.75 * dx > 0 ? 1 : -1;
  const tip = 4 + BLADE;
  const reach = BLADE + GRIP + 8;
  /** Notches: [how far along the blade, which edge]. */
  const notches: ReadonlyArray<readonly [number, number]> = [[9.5, 1], [16, -1]];
  for (let y = Math.floor(hy - reach); y <= Math.ceil(hy + reach); y++) {
    for (let x = Math.floor(hx - reach); x <= Math.ceil(hx + reach); x++) {
      const rx = x + 0.5 - hx;
      const ry = y + 0.5 - hy;
      const u = rx * dx + ry * dy;
      const v = (-rx * dy + ry * dx) * litSide;
      let c: string | null = null;
      if (u >= 4 && u <= tip) {
        const half = u > tip - 4 ? (tip - u) * (BLADE_W / 4) : BLADE_W;
        if (Math.abs(v) <= half) c = v > 0 ? RUST[3] : RUST[2];
        for (const [at, side] of notches) if (Math.abs(u - at) < 0.75 && v * side > BLADE_W - 0.95) c = null;
      } else if (u >= 2.2 && u < 4 && Math.abs(v) <= BLADE_W + 2.6) {
        c = v > 1 ? RUST[3] : v < -2.6 ? RUST[0] : RUST[2];
      } else if (u >= 2 - GRIP && u < 2.2 && Math.abs(v) <= 1.1) {
        c = RUST[0];
      } else if (u >= -GRIP - 0.2 && u < 2 - GRIP && Math.abs(v) <= 1.7) {
        c = v > 0.3 ? RUST[3] : RUST[2];
      }
      if (c) p.set(x, y, c);
    }
  }
  // the specks: each stays where it is on the blade, however the blade is held
  const speck = (u: number, v: number, c: string): void => {
    const x = Math.floor(hx + dx * u - dy * v * litSide);
    const y = Math.floor(hy + dy * u + dx * v * litSide);
    if (p.has(x, y)) p.set(x, y, c);
  };
  for (const [u, v] of [[7, -1.2], [12.5, -0.7], [18, -1.2]] as const) speck(u, v, RUST[3]);
  for (const [u, v] of [[11, 1.2], [16.5, 0.7]] as const) speck(u, v, RUST[2]);
}

/**
 * The blur a fast blade leaves in the air behind it: a pale crescent along the way its point
 * came (down from above, so back is toward straight up), fattest in the middle. `k` (0..1) is
 * how long it is.
 */
function smear(p: Px, hx: number, hy: number, deg: number, k: number): void {
  const sweep = 85 * k;
  const far = 4 + BLADE;
  for (let a = 0; a <= sweep; a += 1) {
    const t = a / sweep;
    const [dx, dy] = dir(deg + 9 + a);
    const thick = 1 + 3.2 * Math.sin(Math.PI * t) * k;
    for (let j = 0; j < thick; j += 0.5) p.set(Math.floor(hx + dx * (far - j)), Math.floor(hy + dy * (far - j)), j < thick * 0.45 ? BONE[3] : BONE[2]);
  }
}

/**
 * The bow. (gx, gy) is the grip; `deg` the way its arrow flies; `bent` (0..1) how far it is
 * drawn, which pulls its tips back. Returns its two tips.
 */
function bow(p: Px, gx: number, gy: number, deg: number, bent: number): { top: V; bot: V } {
  const [fx, fy] = dir(deg);
  // the stave stands across the arrow's flight; its belly bulges the way the arrow flies
  const ax = fy;
  const ay = -fx;
  const steep = Math.abs(ay) >= Math.abs(ax);
  const at = (t: number): V => {
    const u = Math.abs(t);
    const off = -(BOW_K + bent * 2) * t * t + (u > 0.86 ? (u - 0.86) * 2.8 * BOW_K : 0);
    return [gx + ax * t * BOW_H + fx * off, gy + ay * t * BOW_H + fy * off];
  };
  const n = Math.ceil(BOW_H * 3);
  for (let pass = 0; pass < 2; pass++) {
    for (let i = -n; i <= n; i++) {
      const t = i / n;
      const u = Math.abs(t);
      const [x, y] = at(t);
      const px = Math.round(x);
      const py = Math.round(y);
      if (pass === 0) {
        if (u < 0.8) p.set(px + (steep ? 1 : 0), py + (steep ? 0 : 1), WOOD[u < 0.2 ? 1 : 2]);
      } else p.set(px, py, WOOD[u < 0.2 ? 2 : 4]);
    }
  }
  return { top: at(1), bot: at(-1) };
}

/**
 * The string and the arrow are a pixel thin, so they are laid over the finished figure with no
 * seam round them. This says where something of the figure is in front of them.
 */
type Hidden = (x: number, y: number) => boolean;

/**
 * An arrow from its nock, flying the way of `deg`: pink fletching, a rusted head. `hot` (0..1)
 * turns the head into a spark, with a light of its own, and `flare` makes the spark spit.
 */
function arrow(p: Px, nock: V, deg: number, hot: number, flare: boolean, lights: Light[], hidden: Hidden | null): void {
  const [fx, fy] = dir(deg);
  const n = Math.round(ARROW);
  for (let k = 0; k <= n; k++) {
    const x = Math.round(nock[0] + fx * k);
    const y = Math.round(nock[1] + fy * k);
    if (hidden && hidden(x, y)) continue;
    const c = k >= 1 && k <= 3 ? PINK[k === 2 ? 3 : 2] : k < n - 2 ? SHAFT : hot > 0.2 ? (k === n ? FLAME[4] : k === n - 1 ? FLAME[flare ? 4 : 3] : SOCKET) : k === n ? RUST[3] : RUST[2];
    p.set(x, y, c);
  }
  if (hot > 0.2) lights.push({ x: nock[0] + fx * n, y: nock[1] + fy * n, r: 4 + hot * 5 + (flare ? 1.5 : 0), color: SOCKET, a: 0.25 + hot * 0.3 + (flare ? 0.1 : 0) });
}

/**
 * Where the arrow sits on a string at rest: a little above its middle, so that the shaft lies on
 * top of the hand that holds the bow. `fling` throws the point forward of the straight string.
 */
function nockOf(tips: { top: V; bot: V }, deg: number, fling: number): V {
  const [fx, fy] = dir(deg);
  return [(tips.top[0] + tips.bot[0]) / 2 + fy * 2 + fx * fling, (tips.top[1] + tips.bot[1]) / 2 - fx * 2 + fy * fling];
}

/** A bowstring from `a` to `b`. */
function thread(p: Px, a: V, b: V, hidden: Hidden | null): void {
  const n = Math.max(1, Math.round(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))));
  for (let i = 0; i <= n; i++) {
    const x = Math.round(a[0] + ((b[0] - a[0]) * i) / n);
    const y = Math.round(a[1] + ((b[1] - a[1]) * i) / n);
    if (!hidden || !hidden(x, y)) p.set(x, y, STRING);
  }
}

/** A quiver: a leather tube, and three arrows fletched in pink standing out of its mouth. `lean` slants it. */
function quiver(p: Px, qx: number, qy: number, h: number, lean: number, stir: number): void {
  lit(p, WOOD, [0, 1], [0, 1], (l) => {
    for (let i = 0; i < h; i++) l.rect(qx + Math.round(i * lean), qy + i, 4, 1, INK);
  });
  p.hline(qx, qy, 4, PLUM[3]).hline(qx, qy + 1, 4, PLUM[2]);
  for (let k = 0; k < 3; k++) {
    const ax = qx + k + (k === 2 ? 1 : 0) - Math.round(lean * 3) + (k === 1 ? stir : 0);
    const ay = qy - 3 - (k === 1 ? 1 : 0);
    p.set(ax, ay, PINK[3]).set(ax, ay + 1, PINK[3]).set(ax, ay + 2, PINK[2]);
  }
}

/**
 * A scrap of cloth hanging from a line of `torn.length` columns that starts at (x0, top): each
 * column is `long` rows less what is torn off it. `drift` carries the hem sideways; the wind sends
 * a wave down it (`wind` is where the wave has got to, `blow` how big it is at the hem), so its
 * tongues rise and fall one after another. `round` cuts the corners of its top; `dark` is how
 * deep the shade reaches in from its lower right edge.
 */
function cloth(p: Px, ramp: Ramp, x0: number, top: number, long: number, torn: ReadonlyArray<number>, drift: number, wind: number, blow: number, round: ReadonlyArray<number>, dark: number): void {
  const n = torn.length;
  const sway = (t: number): number => drift * t + Math.sin((wind - t * 0.6) * Math.PI * 2) * blow * 0.6 * t;
  const lift = (c: number): number => Math.round(Math.sin((wind + c / n) * Math.PI * 2) * blow * 0.7);
  lit(p, ramp, [0, 2], [0, dark], (l) => {
    for (let c = 0; c < n; c++) {
      const len = long - torn[c] + lift(c);
      for (let k = round[Math.min(c, n - 1 - c)] ?? 0; k <= len; k++) l.set(Math.round(x0 + c + sway(k / long)), top + k, INK);
    }
  });
}

/** Which twelfth of its loop the wind is in: the standing loop has twelve frames, one to each. */
function beatOf(wind: number): number {
  return Math.floor((((wind % 1) + 1) % 1) * 12 + 1e-6);
}

/** The jaw at rest: it hangs a pixel open, and now and then it clacks shut twice. */
function clack(wind: number): number {
  const beat = beatOf(wind);
  return beat === 4 || beat === 6 ? 0 : beat === 5 ? 2 : 1;
}

// ---------------------------------------------------------------------------------------------
// The rig

/** The skeleton's layers as it stands, for its death (`bones` hands them over before it stacks them), and two heights on them. */
interface BoneParts {
  far: Px;
  nearLeg: Px;
  trunk: Px;
  knot: Px | null;
  skull: Px;
  upperNear: Px;
  foreNear: Px;
  weapon: Px;
  fist: Px;
  mantle: Px | null;
  pack: Px | null;
  /** The bowstring, and the arrow on it. */
  line: Px;
  /** The row of the top of the pelvis: what is above it on `far` is an arm and what is below a leg; on `trunk`, the rib cage above and the hips below. */
  hipY: number;
  /**
   * The trunk again, in its parts, each on a layer of its own: the rib cage (its top row is `ribY`,
   * its middle column `midX`), the spine below it, and the pelvis with its rag. (What is left of
   * `trunk` above `ribY` is the neck, which shows only from behind.)
   */
  ribs: Px;
  spine: Px;
  hips: Px;
  ribY: number;
  midX: number;
  lights: Light[];
}

/** The shieldbearer's shield, in pixels: as wide as its rib cage and from its collar to its knees. */
const SHIELD_W = 17;
const SHIELD_H = 37;
/**
 * A tall kite shield of iron: flat across the top, straight sides, and from a little over half
 * way down drawn in to a point. Painted level with its top left corner at (x0, y0); the rig turns
 * it to the grid. Facing us we see its face: a bright rim, a ridge down the middle, rivets, and a
 * blood-red chevron, dented and scored. Facing away we see the inside of it: dark, with its strap.
 */
function kiteShield(p: Px, x0: number, y0: number, inside: boolean): void {
  const mid = x0 + (SHIELD_W - 1) / 2;
  for (let r = 0; r < SHIELD_H; r++) {
    const t = r / (SHIELD_H - 1);
    let half = SHIELD_W / 2;
    if (r === 0) half -= 2;
    else if (r === 1) half -= 1;
    if (t > 0.55) half *= 1 - ((t - 0.55) / 0.45) ** 1.5 * 0.94;
    const xa = Math.round(mid + 0.5 - half);
    const xb = Math.max(xa + 1, Math.round(mid + 0.5 + half));
    for (let x = xa; x < xb; x++) {
      const rim = x === xa || x === xb - 1 || r === 0;
      const u = (x - xa) / Math.max(1, xb - xa - 1);
      if (inside) p.set(x, y0 + r, rim ? IRON[2] : IRON[0]);
      // (the light is from the upper left: the half this side of the ridge is the lighter)
      else p.set(x, y0 + r, rim ? (u < 0.5 ? BONE[2] : IRON[3]) : u < 0.5 ? IRON[3] : IRON[2]);
    }
  }
  if (inside) {
    // the strap its arm goes through
    p.rect(Math.round(mid) - 4, y0 + 10, 9, 2, RUST[2]).rect(Math.round(mid) - 4, y0 + 17, 9, 2, RUST[2]);
    return;
  }
  const m = Math.round(mid);
  // the ridge, and the rivets at its corners
  p.vline(m, y0 + 2, SHIELD_H - 6, IRON[0]);
  p.vline(m - 1, y0 + 2, SHIELD_H - 8, BONE[2]);
  for (const [dx, dy] of [[-6, 3], [5, 3], [-6, 17], [5, 17]] as const) p.set(m + dx, y0 + dy, BONE[3]).set(m + dx, y0 + dy + 1, IRON[0]);
  // a chevron in the colour of blood, point down
  for (let k = 0; k <= 5; k++) {
    for (const side of [-1, 1]) {
      const x = m + side * (6 - k) + (side < 0 ? -1 : 0);
      p.set(x, y0 + 7 + k, BLOOD[3]).set(x, y0 + 8 + k, BLOOD[2]).set(x, y0 + 9 + k, BLOOD[0]);
    }
  }
  // it has been hit a great many times: scores, and a notch out of its edge
  p.set(m + 3, y0 + 21, IRON[0]).set(m + 4, y0 + 22, IRON[0]).set(m + 5, y0 + 23, IRON[0]);
  p.set(m - 5, y0 + 24, IRON[0]).set(m - 4, y0 + 25, IRON[0]);
  p.erase(m + 7, y0 + 12).erase(m + 8, y0 + 12).erase(m + 8, y0 + 13);
}

function bones(q: Pose, back: boolean, carry: Carry, take?: (parts: BoneParts) => void): Painted {
  const lights: Light[] = [];
  const bowman = carry === 'bow';
  const fwd = back ? -1 : 1;
  const sway = q.swing;
  // How much of this is a walk (or a lunge): only then do the hips sink with the body, so that
  // the knees give. Standing, `bob` is breath: the rib cage rises and falls and the hips stay.
  const walking = Math.min(1, q.drag);
  const moving = Math.min(1, q.drag + Math.abs(q.near) + Math.abs(q.far));
  const still = 1 - walking;
  const Y = Math.round(q.bob);
  const crouch = Math.round(q.bob * moving);
  // The whole frame leans: the skull most, the collar, the last rib, the hips least.
  const topX = KX + Math.round(q.lean);
  const lowX = KX + Math.round(q.lean * 0.6);
  const hipX = KX + Math.round(q.lean * 0.3);
  const sy = KAY - COLLAR + Y;
  const py = KAY - PELVIS + crouch;
  const rowX = (i: number): number => Math.round(topX + ((lowX - topX) * i) / 11);
  const ph = q.wind * Math.PI * 2;
  // Seen from a corner: what runs across the bones (the collar bone, the ribs, the pelvis) is
  // lowest at the corner of the body nearest us and rises both ways from it.
  const turn = slant(back ? topX + 3 : topX - 4, 2);
  const turnHips = slant(back ? hipX + 3 : hipX - 4, 1);

  // --- the skull: it sits loose on the spine, and follows the body's rise and fall a beat late:
  // when it walks (the walk's body is down for the first half of each step, the skull for the
  // second and third quarters), and when it stands and breathes ---
  const stepping = q.nearLift > 0 || q.farLift > 0 || (Math.abs(q.near) > 0.9 && Math.abs(q.far) > 0.9) ? walking : 0;
  const resting = moving === 0 && q.lean === 0 && q.hx === 0 && q.hy === 0;
  const beat = beatOf(q.wind);
  const nod = Math.round((1 - 2 * q.near * q.near) * stepping) + (resting ? (beat === 0 ? 1 : beat === 6 ? -1 : 0) : 0);
  const tip = bowman ? 0 : q.pt;
  const headX = KX + 1 + Math.round(q.lean * 1.25 + tip * 0.6);
  const headY = KAY - CROWN + Y + nod + Math.round(tip);
  const gape = Math.max(clack(q.wind), bowman ? 0 : Math.round(q.act * 3));

  // --- the legs. Which side is nearer the camera? Facing us the screen-left one; facing away, the right. ---
  const nearSide = back ? 1 : -1;
  const legOf = (near: boolean): { hip: V; knee: V; ax: number; sole: number; hangs: boolean } => {
    const side = near ? nearSide : -nearSide;
    const f = footOf(q, near, back, true);
    const lift = near ? q.nearLift : q.farLift;
    const hip: V = [hipX + side * HIPS, py + 2 - (near ? 0 : 1)];
    const ax = KX + side * STANCE + f.dx;
    const sole = KAY - (near ? 1 : 3) + f.dy;
    // the knee: half way, bowed outward a little when it stands, and pushed well forward when
    // the foot is lifted or the hips sink (the bones are loose: it bends a little too far)
    const give = Math.min(1, lift + crouch * 0.5);
    const knee: V = [(hip[0] + ax) / 2 + side * 0.8 * (1 - give) + lift * 3.2 + crouch * 1.2, (hip[1] + sole - 2) / 2 - lift * 0.8];
    return { hip, knee: whole(knee), ax, sole, hangs: lift > 0.5 };
  };
  const nearLeg = legOf(true);
  const farLeg = legOf(false);

  // --- the arms: shoulders, and where the two hands are ---
  // (the joints are loose: walking, each shoulder rides up as its arm goes back)
  const shrug = Math.round(sway * 0.8 * walking);
  // (the nearer shoulder is the lower: facing us that is the one on screen-left, facing away the one on screen-right)
  const sR: V = [topX + SHOULDER, sy + 1 + shrug + (back ? NEAR_DROP : -FAR_RISE)];
  const sL: V = [topX - SHOULDER, sy + 1 - shrug + (back ? -FAR_RISE : NEAR_DROP)];
  let hand: V;
  let elbowR: V;
  let free: V;
  let elbowL: V;
  let aim = q.aim;
  // the hand on screen-left when it has nothing to do: it hangs, and swings against the stride
  const hang: V = [sL[0] - sway * 4, sL[1] + 15 - Math.abs(sway) * 2 - sway * fwd];
  // what the archer holds: where the tips of the bow are, and whether the string is in the hand
  let tips: { top: V; bot: V } | null = null;
  const holds = Math.abs(q.off) < 0.05 && walking < 0.5;
  // (an arrow sits on the string whether or not the hand is on it, standing or on the march)
  const nocked = q.off < 0.05;
  let nockAt: V = [0, 0];
  const weapon = layer();
  if (bowman) {
    // The bow hand: low in front at rest, an arrow on the string pointing down at the floor, the
    // other arm hanging. Walking, the bow rocks with the stride, and the other arm swings.
    aim = q.aim + sway * 4 * walking;
    // (standing, it is held well out from the body, so that the whole of it shows; on the march,
    // facing us, it is carried close across the ribs)
    const rest: V = [topX + 12 - (back ? 0 : walking * 8) + sway * 1.5 + Math.round(Math.cos(ph) * 0.8 * still), sy + 11 + walking * 2 - Y + Math.abs(sway) * 1 + Math.round(Math.sin(ph) * 1.2 * still)];
    hand = whole(within(sR, [rest[0] + q.hx, rest[1] + q.hy], REACH));
    elbowR = whole(pick(joint(sR, hand, UPPER, FORE, 1), joint(sR, hand, UPPER, FORE, -1), (v) => v[0] + v[1] * 0.5));
    const draw = Math.max(0, q.act);
    tips = bow(weapon, hand[0], hand[1], aim, Math.min(1, draw));
    const [fx, fy] = dir(aim);
    nockAt = nockOf(tips, aim, 0);
    // the string hand: hanging at the side; on the string, drawn back along the arrow's flight;
    // or gone back over the shoulder to the quiver for the next arrow
    const away = Math.max(walking, Math.max(0, Math.min(1, -q.off)));
    const fetch = Math.max(0, Math.min(1, q.off - 1));
    const onString: V = [nockAt[0] - fx * DRAW * draw + q.ohx, nockAt[1] - fy * DRAW * draw + q.ohy];
    free = whole(within(sL, mixv(mixv(onString, hang, away), [topX - 10, sy - 5], fetch), REACH));
    // the drawing arm: as the string comes back the elbow goes out behind the hand and below it
    // (the upper arm points at us: it is seen short)
    const loose = pick(joint(sL, free, UPPER, FORE, 1), joint(sL, free, UPPER, FORE, -1), (v) => -v[0] + v[1] * (0.6 - away * 0.3));
    const taut: V = [free[0] - 7, free[1] + 3];
    elbowL = whole(mixv(loose, taut, Math.min(1, draw) * (1 - fetch)));
  } else {
    // the sword hand: raised beside the skull at rest. Standing, it drifts; walking, it rocks with the stride.
    const driftX = Math.round(Math.cos(ph) * 0.8 * still);
    const driftY = Math.round(Math.sin(ph) * 1.4 * still);
    // (wound up, jaw wide, it trembles: a pixel to and fro with every frame of the hold)
    const tremble = q.act > 0.95 ? Math.floor(q.wind * SHAKE + 1e-6) % 2 : 0;
    hand = whole(within(sR, [topX + 14 + q.hx + driftX + tremble + sway * 1, sy - 3 - Y + q.hy + driftY + sway * 1.2 * fwd], REACH));
    aim = q.aim + sway * 5;
    elbowR = whole(pick(joint(sR, hand, UPPER, FORE, 1), joint(sR, hand, UPPER, FORE, -1), (v) => v[1] + v[0] * 0.4));
    // the free hand: hanging; flung out and up (off 1) or trailing behind (off -1). The elbow
    // is led from where it hangs to where it is in those two poses (worked out afresh for each
    // frame, it would jump from one side of the arm to the other as the hand passes the shoulder).
    const k = Math.min(1, Math.abs(q.off));
    const flung: V = q.off >= 0 ? [sL[0] - 9, sL[1] - 4] : [sL[0] - 9, sL[1] + 8];
    const bent: V = q.off >= 0 ? [sL[0] - 7, sL[1] + 3.5] : [sL[0] - 7.5, sL[1] + 2];
    const hung = pick(joint(sL, hang, UPPER, FORE, 1), joint(sL, hang, UPPER, FORE, -1), (v) => -v[0] + v[1] * 0.3);
    free = whole(within(sL, [hang[0] + (flung[0] - hang[0]) * k + q.ohx, hang[1] + (flung[1] - hang[1]) * k + q.ohy], REACH));
    elbowL = whole(mixv(hung, bent, k));
  }

  // --- paint: the far side first ---
  const FAR = dim(BONE);
  const farLayer = layer();
  const nearLegLayer = layer();
  legBones(farLayer, FAR, farLeg.hip, farLeg.knee, farLeg.ax, farLeg.sole, back, farLeg.hangs);
  legBones(nearLegLayer, BONE, nearLeg.hip, nearLeg.knee, nearLeg.ax, nearLeg.sole, back, nearLeg.hangs);

  // The arm on screen-right carries the weapon; the one on screen-left hangs (or holds the
  // string). The far one of the two is in shade down to its elbow. The near one's forearm is on
  // a layer of its own, over whatever cloth hangs from the shoulders.
  const upperNear = layer();
  const foreNear = layer();
  if (back) {
    armBone(farLayer, FAR, sL, elbowL);
    armBone(farLayer, FAR, elbowL, free);
    armBone(upperNear, BONE, sR, elbowR);
    armBone(foreNear, BONE, elbowR, hand);
  } else {
    armBone(farLayer, FAR, sR, elbowR);
    armBone(farLayer, BONE, elbowR, hand);
    // (the archer's drawing arm comes out from under the mantle as it is raised)
    armBone(bowman && q.act > 0.35 ? foreNear : upperNear, BONE, sL, elbowL);
    armBone(foreNear, BONE, elbowL, free);
  }
  // the hand on screen-left: three finger bones hanging; the archer's is on the string, or open
  const handLayer = back ? farLayer : foreNear;
  const handRamp = back ? FAR : BONE;
  // (standing, the fingers twitch now and then)
  if (!bowman || walking >= 0.5 || q.off < -0.5) fingers(handLayer, handRamp, [free[0], free[1] + (free[1] >= elbowL[1] ? 1 : 0)], free[0] - elbowL[0], free[1] - elbowL[1], resting && (beat === 9 || beat === 10) ? 1 : Math.round(-sway * walking));
  else if (holds || q.prop === 1) bone(handLayer, handRamp, (l) => knob(l, free));
  // (let go, the hand springs open)
  else fingers(handLayer, handRamp, free, 0, 1, 0);

  // --- the trunk: spine, pelvis, rib cage, and the rag ---
  const trunk = layer();
  // (from behind, the knot of the rag is a part of its own: it stands off the cloth)
  const knot = back && !bowman ? layer() : null;
  const key = tones(BONE);
  if (back && !bowman) stamp(trunk, headX - 6, headY + 10 + gape, JAW_BACK, tones(FAR));
  // the spine, from the last rib down to the pelvis (and, from behind, the neck up into the skull)
  // (on a layer of its own, for its death, in which the trunk comes apart)
  const spine = layer();
  for (let y = sy + 12; y < py; y++) {
    const t = (y - sy - 12) / Math.max(1, py - sy - 12);
    const x = Math.round(lowX + (hipX - lowX) * t) - (back ? 3 : 0);
    const kk = (y - sy) % 2 === 0;
    spine.set(x, y, kk ? BONE[3] : BONE[2]).set(x + 1, y, kk ? BONE[2] : BONE[0]);
  }
  trunk.blit(spine, 0, 0);
  if (back) {
    for (let y = headY + 9; y < sy; y++) {
      const x = Math.round(headX - 3 + ((topX - headX) * (y - headY - 9)) / Math.max(1, sy - headY - 9));
      trunk.set(x, y, (y - sy) % 2 === 0 ? BONE[3] : BONE[2]).set(x + 1, y, (y - sy) % 2 === 0 ? BONE[2] : BONE[0]);
    }
  }
  // (the pelvis and the rag are painted level on a layer of their own, and slid onto the grid)
  const hips = layer();
  stamp(hips, hipX - 6, py, back ? PELVIS_BACK : PELVIS_MAP, key);
  if (!bowman) {
    // the scrap of cloth at the hips: torn into three tongues, short at the sides so that the knees show
    const drift = -sway * 1.2 - Math.min(1.5, q.drag) * 1.6;
    const blow = 1 + Math.min(1.2, q.drag) * 0.8;
    cloth(hips, TEAL, hipX - 6, py + 2, 10, [6, 5, 2, 2, 4, 0, 0, 3, 1, 1, 5, 7], drift, q.wind, blow, [2], 1);
    if (knot) {
      // from behind it is knotted: the knot, and its two short ends lying on the cloth (the wind
      // stirs their tips). It sits where the spine comes down: away from the side faced.
      stamp(knot, hipX - 4, py + turnHips(hipX - 3), KNOT, key);
      const end = Math.round(Math.sin(ph + 2) * blow * 0.6 - walking);
      const lay = (x: number, y: number): void => {
        const c = hips.get(x, y);
        if (c !== null && TEAL.indexOf(c) >= 0) hips.set(x, y, TEAL[3]);
      };
      for (let k = 0; k < 4; k++) lay(hipX - 4 - (k > 0 ? 1 : 0) + (k === 3 ? end : 0), py + 4 + k);
      for (let k = 0; k < 3; k++) lay(hipX - 1 + (k > 0 ? 1 : 0) + (k === 2 ? end : 0), py + 4 + k);
    } else {
      // a fold: a darker line that follows the cloth down
      for (let k = 2; k <= 8; k++) {
        const x = Math.round(hipX + 2 + drift * (k / 10));
        const c = hips.get(x, py + 2 + k);
        if (c !== null && TEAL.indexOf(c) >= 2 && k % 4 !== 1) hips.set(x, py + 2 + k, TEAL[0]);
      }
    }
  }
  shear(hips, turnHips, trunk);
  // (the rib cage likewise: its collar bone and its ribs run along the grid)
  const cage = layer();
  const ribs = back ? RIBS_BACK : RIBS;
  for (let i = 0; i < ribs.length; i++) stamp(cage, rowX(i) - 7, sy + i, [ribs[i]], key);
  shear(cage, turn, trunk);

  // --- the skull (and the archer's hood over it) ---
  const skull = layer();
  if (back) {
    if (bowman) stamp(skull, headX - 7, headY - 1, HOOD_BACK, key);
    else stamp(skull, headX - 6, headY, SKULL_BACK, key);
  } else {
    stamp(skull, headX - 6, headY, SKULL, key);
    // the mouth: dark between the teeth when the jaw hangs
    if (gape > 0) skull.rect(headX - 2, headY + 10, 7, gape, INK);
    stamp(skull, headX - 6, headY + 10 + gape, JAW, key);
    if (bowman) stamp(skull, headX - 7, headY - 1, HOOD, key);
    // the light in the sockets: it breathes, and it burns up as the blow is wound up or the bow drawn
    const burn = Math.max(0, Math.min(1, q.act));
    // (the nearer socket, and the further one at the skull's edge)
    for (const ex of [headX, headX + 4]) lights.push({ x: ex + 0.5, y: headY + 5.5, r: 4 + burn * 1.5, color: SOCKET, a: 0.4 + Math.sin(ph) * 0.05 + burn * 0.22 });
  }

  // --- the archer's mantle and quiver ---
  const mantle = bowman ? layer() : null;
  const pack = bowman ? layer() : null;
  if (mantle && pack) {
    const blow = 1 + walking * 0.8;
    // (the mantle lies on the shoulders: painted level, and slid onto the grid with them)
    const flat = layer();
    cloth(flat, BLOOD, topX - 10, sy - 1, 8, back ? [4, 2, 3, 1, 2, 2, 0, 1, 0, 1, 0, 0, 1, 0, 2, 1, 3, 2, 3, 4] : [3, 2, 3, 2, 2, 1, 2, 1, 0, 1, 0, 0, 1, 2, 1, 2, 3, 2, 3, 4], -walking * 1.5, q.wind, blow, [3, 2, 1, 1], 1);
    shear(flat, turn, mantle);
    if (back) {
      // the quiver, slung across the back, its arrows over the left shoulder
      quiver(pack, topX - 10, sy - 2, 15, 0.55, Math.round(Math.sin(ph) * 0.6 + sway * walking));
    } else {
      // from in front only the ends of the arrows show, over the shoulder
      const stir = Math.round(Math.sin(ph) * 0.6 + sway * walking);
      for (let k = 0; k < 3; k++) {
        const ax = topX - 12 + k * 2 + (k === 1 ? stir : 0);
        const ay = sy - 7 + (k === 1 ? -1 : k === 2 ? 1 : 0);
        pack.set(ax, ay, PINK[3]).set(ax, ay + 1, PINK[3]).set(ax, ay + 2, PINK[2]).vline(ax, ay + 3, 4, SHAFT);
      }
    }
  }

  // --- the weapon, and what goes with it ---
  const fist = layer();
  const line = layer();
  if (!bowman) {
    sword(weapon, hand[0], hand[1], aim);
    // (in the instant of the blow the body is thrown harder than any walk throws it: the blade blurs)
    if (q.drag > 1.05) smear(line, hand[0], hand[1], aim, Math.min(1, (q.drag - 1) / 0.6));
  } else if (tips) {
    // The string: straight, or back to the hand that holds it. Facing us it is in front of the
    // body, but passes behind the head so that the eyes are not crossed out; facing away, the
    // whole body is in front of it (but not the bow hand, on which the arrow lies).
    const body = [farLayer, nearLegLayer, trunk, upperNear, skull];
    if (mantle) body.push(mantle);
    if (pack) body.push(pack);
    const behindBody: Hidden = (x, y) => body.some((l) => l.has(x, y));
    const behindHead: Hidden = (x, y) => skull.has(x, y);
    const upper = back ? behindBody : behindHead;
    const lower = back ? behindBody : null;
    if (holds) {
      thread(line, tips.top, free, upper);
      thread(line, free, tips.bot, lower);
      // (held at full draw, the spark on the arrowhead spits: brighter every other frame)
      arrow(line, free, aim, Math.max(0, q.act), q.act >= 1 && Math.floor(q.wind * SPIT + 1e-6) % 2 === 1, lights, lower);
    } else if (nocked) {
      // the hand is not on it: the string is straight, and the arrow sits on it. (Facing us, the
      // arm that hangs is in front of both.)
      const behindArm: Hidden = (x, y) => (back ? behindBody(x, y) : skull.has(x, y) || foreNear.has(x, y));
      thread(line, tips.top, tips.bot, behindArm);
      arrow(line, nockAt, aim, 0, false, lights, behindArm);
    } else {
      // let go: straight, but for the instant after the arrow has left, when it is flung forward
      const mid = nockOf(tips, aim, Math.round(q.pt));
      thread(line, tips.top, mid, upper);
      thread(line, mid, tips.bot, lower);
      // a fresh arrow on its way from the quiver: it swings down toward the bow as the hand comes back
      if (q.prop === 1 && q.off < 1.7) arrow(line, free, (Math.atan2(-(hand[1] - free[1]), hand[0] - free[0]) * 180) / Math.PI, 0, false, lights, upper);
    }
  }
  fistOn(fist, hand);
  if (take) {
    const ribsOnly = layer();
    shear(cage, turn, ribsOnly);
    const hipsOnly = layer();
    shear(hips, turnHips, hipsOnly);
    take({ far: farLayer, nearLeg: nearLegLayer, trunk, knot, skull, upperNear, foreNear, weapon, fist, mantle, pack, line, hipY: py, lights, ribs: ribsOnly, spine, hips: hipsOnly, ribY: sy, midX: topX });
  }

  // --- the shieldbearer's shield: before it when it faces us, beyond it when it faces away ---
  // (It faces the way the bearer does, so its face runs along the grid: seen from in front, the
  // edge nearer us is the lower; from behind, the edge nearer us is the lower again, on the other side.)
  let shield: Px | null = null;
  if (carry === 'shield') {
    const flat = layer();
    const sx0 = topX + (back ? 2 : -3);
    const sy0 = sy - 3;
    kiteShield(flat, sx0, sy0, back);
    shield = layer();
    const cxS = sx0 + SHIELD_W / 2;
    shearBy(flat, (x) => (back ? 1 : -1) * Math.round((x - cxS) / 2), shield);
  }

  // --- stack it ---
  let layers: Px[];
  // (facing away, the bow and the hand on it are beyond the body: they show through its waist)
  // (facing us, the arm nearer us is in front of the bow, whether it hangs or draws)
  if (mantle && pack) layers = back ? [weapon, foreNear, fist, farLayer, nearLegLayer, trunk, upperNear, mantle, skull, pack] : [pack, farLayer, nearLegLayer, trunk, upperNear, mantle, skull, weapon, foreNear, fist];
  else if (knot) layers = [farLayer, nearLegLayer, trunk, knot, skull, upperNear, foreNear, weapon, fist];
  else if (q.behind) layers = [weapon, fist, farLayer, nearLegLayer, trunk, skull, upperNear, foreNear];
  else layers = [farLayer, nearLegLayer, trunk, skull, upperNear, foreNear, weapon, fist];
  if (shield) layers = back ? [shield, ...layers] : [...layers, shield];
  return { px: compose(null, layers, line), lights };
}

// ---------------------------------------------------------------------------------------------
// Its death: it falls apart
//
// The owner, 5 Oct 2026: "I think we want death animations and corpses for enemies." What he was
// told of this one: the skeleton falls apart into bones; the archer too, its red hood on the heap.
//
// Whatever held it together lets go. Its legs fold under it and lie crossed; the hips drop where
// they stood and the rib cage comes down onto them; the arms fall away to either side; what it
// carried (the sword; the bow, and the quiver from its back) drops and lies flat; and the skull,
// with the archer's hood still on it, stays up a moment longer than the rest, tips off toward
// the side nearer us, bounces once and lies on its side with the light gone out of its sockets.
// Every piece is the figure's own (art/death.ts): what lies there is what was standing there.

function bonesDeath(k: number, back: boolean, carry: Carry, stood: Partial<Pose> = SWORD_LOW): Painted {
  let got: BoneParts | null = null;
  // (as it stands in its loop: the poses its art is made with, below)
  // (a swordsman dies from the pose it stands in: `stood`, where its sword is when nothing is going on)
  const rest: Pose = { ...REST, ...(carry === 'bow' ? { aim: -45, off: -1 } : stood) };
  bones(rest, back, carry, (parts) => (got = parts));
  const parts = got as BoneParts | null;
  if (!parts) return { px: layer(), lights: [] };
  const hip = parts.hipY;
  const rib = parts.ribY;
  const mid = parts.midX + 1;
  // (the side nearer us, where the skull rolls to: screen-left when it faces us, screen-right when it faces away)
  const s = back ? 1 : -1;
  const X = KX;
  const F = KAY;
  const all = (px: Px, to: readonly [number, number], turns: number, from: number, until: number, more: Partial<Piece> = {}): Piece => ({ px, to, turns, from, until, ...more });
  const pieces: Piece[] = [
    // the legs fold and lie crossed, the further one under
    { px: parts.far, box: [0, hip + 2, KW, KH], to: [X - s * 5, F - 4], turns: s, from: 0.1, until: 0.5 },
    all(parts.nearLeg, [X + s * 6, F - 1], -s, 0.06, 0.46),
    // the arm on the far side falls away behind
    { px: parts.far, box: [0, 0, KW, hip + 2], to: [X - s * 13, F - 6], turns: -s, from: 0.16, until: 0.6 },
    // the hips drop where they stood, and the spine goes over beside them
    { px: parts.hips, to: [X, F - 1], turns: 0, from: 0.1, until: 0.48 },
    { px: parts.spine, to: [X + s * 2, F - 4], turns: s, from: 0.1, until: 0.52 },
    // THE RIB CAGE COMES APART (the owner, 5 Oct 2026, 23:16: "can the ribcage body sections fall
    // apart as well on the skeletons? they just kind of stick straight up": it came down on the
    // hips in one piece and stood there). Four handfuls of ribs, each turned onto its side, about the heap.
    { px: parts.ribs, box: [0, 0, mid, rib + 6], to: [X - s * 10, F - 3], turns: -1, from: 0.14, until: 0.58 },
    { px: parts.ribs, box: [mid, 0, KW, rib + 6], to: [X + s * 9, F - 6], turns: 1, from: 0.17, until: 0.64, hop: 2 },
    { px: parts.ribs, box: [0, rib + 6, mid, KH], to: [X - s * 3, F + 2], turns: 1, from: 0.12, until: 0.55, bounce: 1 },
    { px: parts.ribs, box: [mid, rib + 6, KW, KH], to: [X + s * 5, F - 1], turns: -1, from: 0.13, until: 0.6 },
  ];
  // (from behind, the neck: what there is of the trunk above the ribs. It goes with the skull.)
  if (back) pieces.push({ px: parts.trunk, box: [0, 0, KW, rib], to: [X + s * 9, F - 2], turns: s, from: 0.2, until: 0.72 });
  if (parts.knot) pieces.push(all(parts.knot, [X - 3, F - 2], 0, 0.1, 0.48));
  // what it carried on its back, and the cloth from its shoulders
  if (parts.pack) pieces.push(all(parts.pack, [X - s * 11, F + 1], s, 0.12, 0.62, { bounce: 1 }));
  // (the cloth from its shoulders has nothing to lie on now but the bones on the floor: it comes down onto them, and lies flat)
  if (parts.mantle) pieces.push(all(parts.mantle, [X - s * 2, F - 2], 0, 0.2, 0.78, { flat: 0.6 }));
  // the nearer arm, in its two bones
  pieces.push(all(parts.upperNear, [X + s * 12, F - 3], s, 0.14, 0.56));
  pieces.push(all(parts.foreNear, [X + s * 3, F + 2], s, 0.12, 0.6));
  // what was in its hand: it drops first, and lies flat before the rest is down
  // (the bow's string and the arrow on it are one with the bow: they are cut out of the same box, and go where it goes)
  const held = new Px(KW, KH);
  held.blit(parts.weapon, 0, 0).blit(parts.line, 0, 0);
  // (a bow is long and slanted however it is turned: lying, it is pressed flat as the floor is seen, or it would stand up out of the heap)
  pieces.push(all(held, [X - s * 9, F + 3], carry === 'bow' ? 1 : -s, 0.02, 0.5, carry === 'bow' ? { bounce: 2, flat: 0.45 } : { bounce: 2 }));
  pieces.push(all(parts.fist, [X - s * 4, F + 2], 0, 0.02, 0.5));
  // the skull: last, off toward us, one bounce, and on its side
  pieces.push(all(parts.skull, [X + s * 14, F + 1], s, 0.24, 0.84, { hop: 3, bounce: 3 }));
  const px = fallen(pieces, k, KW, KH);
  // the light goes out of its sockets as the skull tips
  const glow = Math.max(0, 1 - k / 0.45);
  if (glow <= 0) quench(px, [SOCKET], INK);
  return { px, lights: k < 0.24 ? parts.lights.map((l) => ({ ...l, a: (l.a ?? 1) * glow })) : [] };
}

// ---------------------------------------------------------------------------------------------
// Animations

/** One frame of the skeleton, as a painting. */
export const paintSkeleton: Rig = (q, back) => bones(q, back, 'sword');

/** One frame of the bone archer, as a painting. */
export const paintArcher: Rig = (q, back) => bones(q, back, 'bow');

/**
 * The skeleton. Standing, it is never quite still: the jaw hangs and clacks, the ribs rise and
 * fall, the rag stirs, the sword hand drifts. It walks in a loose shamble. Its attack is a chop:
 * the sword goes up above and behind the skull with the whole frame leaning back and the jaw wide
 * open (held: that is the player's warning), comes down in front, and ends low.
 */
/**
 * THE SHIELDBEARER (a new monster; art only so far): the skeleton, its sword, and a tall shield.
 * It stands, walks and strikes as the skeleton does. It has no death yet (it would burst), no
 * rules (the idea: blows from in front are stopped until its guard is broken), and it is in no
 * dungeon: `src/dev/preview_m_shieldbearer.ts` is the only thing that makes it.
 */
/**
 * Where the sword is when nothing is going on. `SWORD_UP` is how it has been since the skeleton
 * was repainted: raised beside the skull. The owner, 6 Oct 2026, 00:23, of the Shieldbearer's
 * first picture: "Why are their weapons always straight up in the air?" `SWORD_LOW` is the answer
 * being shown to him: the hand down beside the hip and the point toward the floor, as he chose
 * for the brutes' clubs; it comes up only to strike. He saw both and chose at 00:31: "Skeleton looks
 * better down." So `SWORD_LOW` is what the skeleton and the Shieldbearer stand and walk with (the
 * makers' `low` is true unless a picture asks for the old pose).
 */
const SWORD_UP: Partial<Pose> = { aim: 72 };
const SWORD_LOW: Partial<Pose> = { aim: -68, hx: -3, hy: 17 };

/**
 * THE SKELETON'S WALK (the owner, 6 Oct 2026: "I want enemies to look natural. An undead skeleton
 * is plodding and brittle"). Until then it had the kit's even walk, which is a living thing's. This
 * one LURCHES. One leg steps, long, and the whole frame falls onto it: the body drops and tips
 * forward, the skull lolls over a beat after it, the jaw is jolted open, the loose arm is left
 * behind. Then the other leg is dragged up after it, stiff, hardly leaving the floor, and the
 * frame is hauled upright over it for the next step. So there is ONE heavy footfall to a cycle
 * where the kit's walk has two light ones: the same eight frames at the same pace, covering the
 * same ground (its speed is a rule, and is not touched), at half the beat.
 */
function shamble(bowman = false): Partial<Pose>[] {
  //         the frame:  0     1     2     3     4     5     6     7
  // (the long step is in the air in frames 1 to 3 and comes down in 4; the dragged one moves in 5 to 7)
  // The swordsman falls hard onto its step. The archer is lighter on its feet, and carries a
  // bow it must not jolt: the same lurch, less of it (and to it `pt`, `act` and `off` are the
  // string, the draw and the string hand, so its skull, jaw and arm are left as they are).
  const BOB = bowman ? [1, 0, 0, 0, 1, 2, 2, 1] : [1, 0, 0, 0, 2, 3, 3, 2];
  const LEAN = bowman ? [1, 0, 0, 0, 1, 2, 2, 1] : [1, 0, -1, 0, 2, 4, 4, 2];
  const TIP = [1, 0, -1, -1, 0, 2, 3, 2];
  const JAW = [0, 0, 0, 0, 0.34, 0.34, 0, 0];
  const ARM = [-0.2, 0, 0, 0, -0.3, -0.6, -0.6, -0.4];
  const out: Partial<Pose>[] = [];
  for (let i = 0; i < WALK_FRAMES; i++) {
    const a = (i / WALK_FRAMES) * Math.PI * 2;
    const pose: Partial<Pose> = {
      near: -Math.cos(a) * 1.15,
      nearLift: Math.max(0, Math.sin(a)),
      far: Math.cos(a) * 0.6,
      farLift: Math.max(0, -Math.sin(a)) * 0.35,
      bob: BOB[i],
      lean: LEAN[i],
      swing: Math.cos(a),
      wind: ((i / WALK_FRAMES) * 2) % 1,
      drag: 1,
    };
    out.push(bowman ? pose : { ...pose, pt: TIP[i], act: JAW[i], off: ARM[i] });
  }
  return out;
}

export function makeShieldbearerArt(low = true): ActorArt {
  const rig: Rig = (q, back) => bones(q, back, 'shield');
  const blow = (aimA: number, hyB: number, aimB: number, hyC: number, aimC: number, behind: boolean): ReturnType<typeof strike> =>
    strike(
      0.4,
      { lean: -4, bob: -2, hx: -8, hy: -14, aim: aimA, off: 1, act: 1, pt: -2, ...(behind ? { behind: true } : {}), wind: 0.15 },
      { lean: 6, bob: 3, near: 1, far: -0.6, hx: 4, hy: hyB, aim: aimB, off: -1, pt: 2, wind: 0.52, drag: 1.6 },
      { lean: 5, bob: 3, near: 0.9, far: -0.5, hx: 0, hy: hyC, aim: aimC, off: -0.6, pt: 3, wind: 0.75, drag: 0.6 },
    );
  return monsterArt(rig, { attack: blow(130, 7, -12, 13, -52, true) }, { attack: blow(126, 1, 24, 7, -22, false) }, { rest: low ? SWORD_LOW : SWORD_UP, walkFps: 12 });
}

/** `was`: with the kit's walk, as it was up to Version 15.0 (for pictures of before and after). */
export function makeSkeletonArt(low = true, was = false): ActorArt {
  const front = {
    attack: strike(
      0.4,
      { lean: -4, bob: -2, hx: -8, hy: -14, aim: 130, off: 1, act: 1, pt: -2, behind: true, wind: 0.15 },
      { lean: 6, bob: 3, near: 1, far: -0.6, hx: 4, hy: 7, aim: -12, off: -1, pt: 2, wind: 0.52, drag: 1.6 },
      { lean: 5, bob: 3, near: 0.9, far: -0.5, hx: 0, hy: 13, aim: -52, off: -0.6, pt: 3, wind: 0.75, drag: 0.6 },
    ),
  };
  const back = {
    attack: strike(
      0.4,
      { lean: -4, bob: -2, hx: -8, hy: -14, aim: 126, off: 1, act: 1, pt: -2, wind: 0.15 },
      { lean: 6, bob: 3, near: 1, far: -0.6, hx: 4, hy: 1, aim: 24, off: -1, pt: 2, wind: 0.52, drag: 1.6 },
      { lean: 5, bob: 3, near: 0.9, far: -0.5, hx: 1, hy: 7, aim: -22, off: -0.6, pt: 3, wind: 0.75, drag: 0.6 },
    ),
  };
  const held = low ? SWORD_LOW : SWORD_UP;
  return monsterArt(paintSkeleton, { ...front, die: (k) => bonesDeath(k, false, 'sword', held), crawl: CRAWL }, { ...back, die: (k) => bonesDeath(k, true, 'sword', held), crawl: CRAWL }, was ? { rest: held } : { rest: held, walk: shamble() });
}

/**
 * CRAWLING OUT OF THE GROUND, called up by the Warden (mkit.ts, crawlOut; behind CRAWL_OUT, off):
 * its free hand up out of the pit first, clawing, then its skull, thrown back, its jaw open, the
 * sword low in its other hand; then its hands come down onto the rim and it heaves, head down; then
 * a foot steps up onto the floor, and it stands.
 */
const CRAWL = {
  tall: 70,
  pose: (k: number): Partial<Pose> => {
    // (its free hand is the highest of it, clawing: the first of it out; the sword low in the other, its blade down, so that it comes up after)
    const reach: Partial<Pose> = { off: 1, ohx: -2, ohy: -16, hx: 4, hy: -6, aim: -70, act: 0.5, pt: -2, lean: 0, bob: 0 };
    const haul: Partial<Pose> = { off: 1, ohx: 5, ohy: 12, hx: 7, hy: -2, aim: 10, act: 0.8, pt: 2, lean: 4, bob: 2 };
    const step: Partial<Pose> = { off: 0.3, ohx: 0, ohy: 0, hx: 2, hy: -6, aim: 60, act: 0.3, pt: 0, lean: 3, bob: 1, near: 1, nearLift: 0.8 };
    const mixed = (a: Partial<Pose>, b: Partial<Pose>, t: number): Partial<Pose> => {
      const u = t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
      const o: Record<string, number> = {};
      for (const f of new Set([...Object.keys(a), ...Object.keys(b)])) {
        const av = (a as Record<string, number>)[f] ?? 0;
        const bv = (b as Record<string, number>)[f] ?? 0;
        o[f] = av + (bv - av) * u;
      }
      return o as Partial<Pose>;
    };
    const wind = { wind: (k * 1.4) % 1 };
    if (k < 0.42) return { ...reach, ...wind, ohy: -16 + Math.sin(k * 40) * 2 };
    if (k < 0.62) return { ...mixed(reach, haul, (k - 0.42) / 0.2), ...wind };
    // (from here it settles into its standing pose: crawlOut does that)
    return { ...mixed(haul, step, (k - 0.62) / 0.22), ...wind };
  },
};

/**
 * An archer's shot. The hanging hand comes to the string; the bow comes up as the string comes
 * back (the draw is built by half way through the wind-up) and is held drawn full, the spark on
 * the arrowhead spitting; at the moment of the hit the pose jumps: the string is straight and the
 * arrow gone. Then the bow arm stays out a moment, the string hand open by the jaw, before the
 * hand goes back over the shoulder for a fresh arrow, lays it on the string and drops.
 *
 * (Built by hand, not by mkit's strike, for the sake of that jump: with strike the frames between
 * the held pose and the blow would show the string being let down gently with the arrow still on
 * it. It keeps strike's rules: it starts from rest, the pose is held until `hit`, and it is back
 * at rest, the wind once round, 0.3 s after.)
 */
function shot(hit: number, nock: Partial<Pose>, drawn: Partial<Pose>, loosed: Partial<Pose>, after: Partial<Pose>, fetch: Partial<Pose>): Timeline {
  const keys: Key[] = [
    { at: 0, pose: {} },
    { at: hit * 0.18, pose: nock, ease: 'out' },
    { at: hit * 0.5, pose: drawn, ease: 'out' },
    // (held, the wind still moving in the mantle, the string creeping back a hair further)
    { at: hit - 0.01, pose: { ...drawn, act: 1.05, wind: (drawn.wind ?? 0) + 0.2 }, ease: 'lin' },
    { at: hit, pose: loosed, ease: 'hold' },
    { at: hit + 0.1, pose: after, ease: 'out' },
    { at: hit + 0.17, pose: fetch, ease: 'io' },
    { at: hit + 0.18, pose: { ...fetch, prop: 1 }, ease: 'lin' },
    { at: hit + 0.3, pose: { wind: 1 }, ease: 'io' },
  ];
  return { keys, hit };
}

/** The bone archer. (`was`: with the kit's walk, as it was up to Version 15.0.) */
export function makeArcherArt(was = false): ActorArt {
  const front = {
    attack: shot(
      0.55,
      { hx: -7, hy: -1, aim: -46, off: 0, wind: 0.05 },
      { lean: -1, bob: 1, near: -0.3, far: 0.3, hx: 9, hy: -7, aim: -8, off: 0, act: 1, wind: 0.15 },
      { lean: -1, near: -0.3, far: 0.3, hx: 10, hy: -7, aim: -9, act: 1, off: 1, ohx: -1, pt: 2, wind: 0.4 },
      { near: -0.2, far: 0.2, hx: 9, hy: -6, aim: -14, act: 1, off: 1, ohx: -1, ohy: -1, wind: 0.6 },
      { hx: 4, hy: -4, aim: -32, act: 0.6, off: 2, wind: 0.75 },
    ),
  };
  const back = {
    attack: shot(
      0.55,
      { hx: -7, hy: -2, aim: -42, off: 0, wind: 0.05 },
      { lean: -1, bob: 1, near: -0.3, far: 0.3, hx: 9, hy: -12, aim: 10, off: 0, act: 1, wind: 0.15 },
      { lean: -1, near: -0.3, far: 0.3, hx: 10, hy: -12, aim: 9, act: 1, off: 1, ohx: -1, pt: 2, wind: 0.4 },
      { near: -0.2, far: 0.2, hx: 9, hy: -11, aim: 4, act: 1, off: 1, ohx: -1, ohy: -1, wind: 0.6 },
      { hx: 4, hy: -7, aim: -20, act: 0.6, off: 2, wind: 0.75 },
    ),
  };
  return monsterArt(paintArcher, { ...front, die: (k) => bonesDeath(k, false, 'bow') }, { ...back, die: (k) => bonesDeath(k, true, 'bow') }, was ? { rest: { aim: -45, off: -1 } } : { rest: { aim: -45, off: -1 }, walk: shamble(true) });
}
