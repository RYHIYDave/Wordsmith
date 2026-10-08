// The cave bat, as the owner chose it from the style sheet (previews/art_styles_1_and_6.png, the
// third monster of "6 Bold and modern"; its concept painting is bat() in src/dev/styles_cast.ts):
// a small furry body and head of deep indigo with two tall pointed ears, two burning eyes, a dark
// mouth with two white fangs and tiny feet, between wings of magenta skin stretched over an arm
// and three finger bones, their trailing edges scalloped from fingertip to fingertip.
//
// It flies: nothing of it touches the floor (the game draws its shadow there). Every frame faces
// screen-right: `front` toward the camera (down-right: we see the face, and the wing nearer the
// camera is the one on screen-left), `back` away from it (up-right: the round back of the head
// with the ears standing behind it, the fur of the back, the skin between the legs, the nearer
// wing on screen-right, and the wings seen from above, their bones standing out pale).
//
// WHAT THE KIT'S NUMBERS MEAN FOR A THING WITH WINGS AND NO LEGS (kit.ts, Pose):
//   wind      the wing beat. Hovering (the standing loop: `drag` 0) the wings beat TWICE in one
//             round of `wind`; flying along (the walk: `drag` 1), once. A beat is six shapes, not
//             a hinge: raised, spreading, level, down and cupped, folding at the wrist, rising.
//             The body rides it: it climbs on the down-stroke and sinks on the up-stroke, and
//             the head, held steadier, rides half as high. Hovering, it also rocks a little
//             from one beat to the next.
//   bob       the body pushed down, as for anyone (hovering, one beat hangs a pixel under the
//             other; flying, the dip of each footfall deepens the low point of each beat).
//   lean      the body pushed forward, to screen-right (the dart of the bite).
//   drag      how hard it is flying: the body pitches head first into its flight, the ears lean
//             back and the feet trail.
//   near, far, nearLift, farLift
//             the two tiny feet, which have nothing to stand on: they paddle the air in turn.
//   swing     the roll of its flight: on one beat the nearer wing reaches a little higher, on the
//             next the further one.
//   aim       the way the body points, head first: 90 = hanging upright in the air, 0 = flat out
//             to screen-right, below 0 = stooping.
//   act       the jaws and the fire in the eyes: 0 = shut and smouldering, 1 = gaping and flared.
//   hy, hx, off
//             the wings leave their beat for a shape that is held: `hy` -1 = thrown up in a V
//             (the wind-up), `hx` -1 = swept right back (the dart), `off` 1 = spread wide to brake.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt } from './actor_types';
import type { Key, Timeline } from './clip';
import { quench } from './death';
import { BONE, INK, KAX, KAY, KX, REST, compose, dim, layer, stamp } from './kit';
import type { Painted, Pose, Ramp, Rig, V } from './kit';
import { FLAME, FUR, MENACE, SOCKET, WING, monsterArt } from './mkit';

// --- how the bat is built, in pixels -----------------------------------------------------------
/**
 * How high the middle of the body hangs over the floor. (Two more than before the bat was turned to
 * the grid: the nearer wing hangs lower now, and at the bottom of its stroke its tip must still be
 * as far off the floor as it was. tests/monsters.test.ts holds it to that: "it flies".)
 */
const HOVER = 28;
/** The body is a pear hung by its thick end: how thick it is at the chest and at the rump, and how far each is from its middle. */
const CHEST_R = 4.6;
const RUMP_R = 3.2;
const CHEST_UP = 1.6;
const RUMP_DOWN = 2;
/** From the middle of the chest to the middle of the head. */
const NECK = 2.6;
/** The wing nearer the camera: shoulder to wrist, and the three fingers from the wrist. */
const ARM = 10;
const FINGERS: readonly [number, number, number] = [12, 13, 13.5];
/** The further wing is this much smaller. */
const FAR = 0.82;
/**
 * TURNED TO THE GRID (after Version 14.5; kit.ts, "Turned to the grid"). The bat is seen from a
 * corner, as everything is: the line from wing tip to wing tip runs along the grid, not across
 * the screen. So the nearer wing hangs this many degrees lower than it would square-on and the
 * further one stands as much higher, and the nearer shoulder is lower than the further one by
 * twice SHOULDER_DROP pixels. (Swept back for the dart the wings lie along the body, and none of
 * this applies.) The face was turned already: a pixel toward the side faced, the further eye at
 * the head's edge.
 */
const GRID_TILT = 13;
const SHOULDER_DROP = 1.2;
/** How far the body rises and sinks with a beat. */
const LIFT = 2;

const rad = (deg: number): number => (deg * Math.PI) / 180;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const frac = (v: number): number => v - Math.floor(v);

// ---------------------------------------------------------------------------------------------
// The wings
//
// A wing is an arm from the shoulder to the wrist and three fingers that fan from the wrist: the
// first is the leading edge and ends in the wing's tip. Skin is stretched from finger to finger
// and from the last finger to the hip. Its shape is three angles, in degrees, measured from
// straight out to the side (0) toward straight up (90): the arm's, the first finger's, and how
// wide the other fingers are fanned from the first toward the hip (below the first finger when
// the bat hangs upright; a wing swept back along the body fans the other way, and says so with a
// fan of less than nothing). A fourth number says how far the two inner fingers are drawn in
// (0..1): with those short the skin runs straight from the wing's tip to the tail, and the wing
// is the long narrow blade of a thing that is going somewhere fast. A fifth says how much of the
// wing's length shows: a wing that points away from us or toward us is seen short.

type Shape = readonly [arm: number, hand: number, fan: number, tuck: number, reach: number];

/** One beat, start to end: six shapes. */
const BEAT: readonly Shape[] = [
  // raised: the wrists at the top of the stroke, the tips still hanging out to the side (the concept's own pose)
  [44, -16, 72, 0, 1],
  // spreading: the hand flicks up and out, the whole wing at full reach
  [34, 16, 78, 0, 1],
  // level: the middle of the down-stroke, tip to tip at its widest
  [8, -8, 78, 0, 1],
  // down and cupped: the tips under the body, curling in
  [-24, -56, 64, 0, 1],
  // folding: the wrist starts up, the hand folds under it half shut
  [12, -116, 36, 0, 1],
  // rising: the wrist high, the tip trailing below it
  [42, -62, 54, 0, 1],
];

/** A shape the wings are held in, for each of the two. */
interface Held {
  near: Shape;
  far: Shape;
}
/** Thrown up in a V: the warning. */
const VEE: Held = { near: [62, 68, 58, 0, 1], far: [66, 74, 52, 0, 1] };
/**
 * Swept right back and drawn in, either side of the body's line, like the barbs of an arrow whose
 * head is the bat's own. Facing the camera the dart comes down the screen; facing away it climbs.
 */
const SWEPT_FRONT: Held = { near: [-3, -3, -60, 1, 0.85], far: [140, 140, -60, 1, 0.92] };
const SWEPT_BACK: Held = { near: [-128, -128, 60, 1, 0.7], far: [2, 2, 60, 1, 0.85] };
/** Spread as wide as they go, to brake. */
const BRAKE: Held = { near: [26, 12, 88, 0, 1], far: [30, 16, 82, 0, 1] };

function beatShape(phase: number): Shape {
  const f = frac(phase) * BEAT.length;
  const i = Math.floor(f) % BEAT.length;
  const a = BEAT[i];
  const b = BEAT[(i + 1) % BEAT.length];
  const k = f - Math.floor(f);
  const at = (n: 0 | 1 | 2 | 3 | 4): number => a[n] + (b[n] - a[n]) * k;
  return [at(0), at(1), at(2), at(3), at(4)];
}

/** Where a wing's joints are. */
interface Wing {
  shoulder: V;
  wrist: V;
  tips: readonly [V, V, V];
  hip: V;
  /** How wide its fingers are spread, in degrees, and how far it is drawn in (0..1). */
  fan: number;
  tuck: number;
}

/** `side`: -1 = the wing on screen-left, +1 = the one on screen-right. `k`: its size (the further wing is smaller). */
function wingAt(shoulder: V, hip: V, side: number, k: number, s: Shape): Wing {
  const len = k * s[4];
  const from = (o: V, deg: number, l: number): V => [o[0] + side * Math.cos(rad(deg)) * l * len, o[1] - Math.sin(rad(deg)) * l * len];
  const wrist = from(shoulder, s[0], ARM);
  const tips: [V, V, V] = [from(wrist, s[1], FINGERS[0]), from(wrist, s[1] - s[2] / 2, FINGERS[1] * (1 - 0.35 * s[3])), from(wrist, s[1] - s[2], FINGERS[2] * (1 - 0.5 * s[3]))];
  return { shoulder, wrist, tips, hip, fan: Math.abs(s[2]), tuck: s[3] };
}

/**
 * The edge of the skin between two points is scalloped: it is cut in toward `pull`, to a notch
 * `depth` of the way there from the middle of the two. (A notch with straight sides, as on the
 * concept painting: a curve would leave the fingers' ends sticking out of the skin like bristles.)
 */
function notch(a: V, b: V, pull: V, depth: number): V {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  return [mx + (pull[0] - mx) * depth, my + (pull[1] - my) * depth];
}

/** A bone: a line one pixel thick between two points given in pixel-edge coordinates. */
function bone(p: Px, a: V, b: V, c: string): void {
  p.line(a[0] - 0.5, a[1] - 0.5, b[0] - 0.5, b[1] - 0.5, c);
}

/** The point `k` of the way from a to b. */
function toward(a: V, b: V, k: number): V {
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
}

/**
 * One wing. Its skin is three panels, each one flat tone (`tones`: the panel behind the leading
 * edge, the middle one, the one between the last finger and the body), so that the wing is lit
 * the same way in every frame of a beat; the trailing edge of each is notched between the points
 * that hold it. The arm and the first finger are the wing's leading edge; the other fingers are
 * struts in the skin, clear of the wrist and short of the skin's points.
 */
function wing(p: Px, g: Wing, tones: readonly [string, string, string], bones: string, struts: string): void {
  const [a, b, c] = g.tips;
  const mid = toward(g.shoulder, g.wrist, 0.5);
  // (drawn in, the skin is pulled tight and its edge is nearly straight)
  const slack = 1 - 0.65 * g.tuck;
  // (a wing shut like a fan is hardly wider than its bones, and the points of the skin are a
  // pixel wide: each finger is laid down in its panel's tone too, a little short of its end, so
  // that a point of skin is a point and not a bristle)
  p.poly([g.shoulder, g.wrist, c, notch(c, g.hip, mid, 0.26 * slack), g.hip], tones[2]);
  bone(p, g.shoulder, g.wrist, tones[2]);
  bone(p, g.wrist, toward(g.wrist, c, 0.88), tones[2]);
  p.poly([g.wrist, b, notch(b, c, g.wrist, 0.26 * slack), c], tones[1]);
  bone(p, g.wrist, toward(g.wrist, b, 0.88), tones[1]);
  p.poly([g.wrist, a, notch(a, b, g.wrist, 0.18 * slack), b], tones[0]);
  bone(p, g.wrist, toward(g.wrist, a, 0.94), tones[0]);
  bone(p, g.shoulder, g.wrist, bones);
  bone(p, g.wrist, toward(g.wrist, a, 0.86), bones);
  // (drawn in, the wing is a blade: nothing shows of it but its leading edge)
  if (g.tuck > 0.5) return;
  if (g.fan >= 46) bone(p, toward(g.wrist, b, 0.2), toward(g.wrist, b, 0.74), struts);
  bone(p, toward(g.wrist, c, 0.2), toward(g.wrist, c, 0.74), struts);
  // the thumb: a hook at the wrist
  p.set(Math.floor(g.wrist[0]), Math.floor(g.wrist[1]) - 1, bones);
}

// ---------------------------------------------------------------------------------------------
// The body

/**
 * The body: a pear hung by its thick end, from the rump (radius r0) to the chest (radius r1),
 * rounded and lit from the upper left as the kit's balls are.
 */
function pear(p: Px, x0: number, y0: number, x1: number, y1: number, r0: number, r1: number): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len2 = dx * dx + dy * dy || 1;
  const rMax = Math.max(r0, r1) + 1;
  for (let y = Math.floor(Math.min(y0, y1) - rMax); y <= Math.ceil(Math.max(y0, y1) + rMax); y++) {
    for (let x = Math.floor(Math.min(x0, x1) - rMax); x <= Math.ceil(Math.max(x0, x1) + rMax); x++) {
      const t = Math.max(0, Math.min(1, ((x + 0.5 - x0) * dx + (y + 0.5 - y0) * dy) / len2));
      const r = r0 + (r1 - r0) * t;
      const nx = (x + 0.5 - (x0 + dx * t)) / r;
      const ny = (y + 0.5 - (y0 + dy * t)) / r;
      const d2 = nx * nx + ny * ny;
      if (d2 > 1) continue;
      const i = nx * -0.52 + ny * -0.62 + Math.sqrt(1 - d2) * 0.59;
      p.set(x, y, FUR[i > 0.7 ? 3 : i > 0.2 ? 2 : 1]);
    }
  }
}

/**
 * The head: a ball eight pixels across, lit from the upper left. It is drawn by hand: at this size
 * every pixel of it is looked at. l, m, d = the fur's light, middle and dark.
 */
const HEAD: readonly string[] = [
  '..lllm..',
  '.llllmm.',
  'llllmmmd',
  'lllmmmmd',
  'llmmmmdd',
  'lmmmmmdd',
  '.mmmmdd.',
  '..mmdd..',
];

function head(p: Px, hx: number, hy: number): void {
  stamp(p, hx - 4, hy - 4, HEAD, { l: FUR[3], m: FUR[2], d: FUR[1] });
}

/**
 * An ear: a tall triangle standing on `a`..`b`, with its point at `tip`. Across it there are
 * three tones (`tones`): a lit edge (on the left, or on top if the ear lies back), the hollow
 * (or, from behind, plain fur), and a shaded edge.
 */
function ear(p: Px, a: V, b: V, tip: V, tones: readonly [string, string, string]): void {
  const root = toward(a, b, 0.5);
  // (it is filled line by line across the way it points: rows if it stands, columns if it lies)
  const flat = Math.abs(tip[0] - root[0]) > Math.abs(tip[1] - root[1]);
  const u = (v: V): number => (flat ? v[0] : v[1]);
  const w = (v: V): number => (flat ? v[1] : v[0]);
  const edges: readonly (readonly [V, V])[] = [[a, tip], [b, tip], [a, b]];
  const from = Math.floor(Math.min(u(a), u(b), u(tip)));
  const to = Math.ceil(Math.max(u(a), u(b), u(tip)));
  for (let i = from; i < to; i++) {
    const c = i + 0.5;
    let lo = Infinity;
    let hi = -Infinity;
    for (const [s, e] of edges) {
      if ((u(s) <= c && u(e) > c) || (u(e) <= c && u(s) > c)) {
        const x = w(s) + ((c - u(s)) / (u(e) - u(s))) * (w(e) - w(s));
        lo = Math.min(lo, x);
        hi = Math.max(hi, x);
      }
    }
    if (hi < lo) continue;
    const first = Math.round(lo);
    const n = Math.max(1, Math.round(hi) - first);
    for (let k = 0; k < n; k++) {
      const tone = k === 0 ? tones[0] : k === n - 1 ? tones[2] : tones[1];
      if (flat) p.set(i, first + k, tone);
      else p.set(first + k, i, tone);
    }
  }
}

/**
 * The face: two eyes under a dark brow, a dark mouth and two white fangs. It is turned to
 * screen-right: (cx, cy) is its middle, a pixel to the right of the head's, and the further eye
 * and fang are at the head's edge. `gape` opens the jaws (0..1); `flare` opens the eyes wide and
 * burns them from pink to gold.
 */
function face(p: Px, over: Px, cx: number, cy: number, gape: number, flare: number, lights: Light[]): void {
  const ey = cy - 1;
  for (const ex of [cx - 2, cx + 1]) {
    if (flare > 0.5) {
      over.rect(ex, ey - 1, 2, 2, SOCKET);
      over.set(ex, ey, FLAME[3]).set(ex + 1, ey, FLAME[4]);
    } else {
      p.rect(ex, ey - 1, 2, 1, INK);
      over.rect(ex, ey, 2, 1, SOCKET);
    }
    lights.push({ x: ex + 1, y: ey + 0.5, r: 4.2 + flare * 1.8, color: SOCKET, a: 0.38 + flare * 0.06 });
  }
  if (gape > 0.5) {
    // gaping: the fangs hang in a dark mouth with a hot tongue at the back of it
    p.rect(cx - 2, ey + 2, 5, 2, INK).rect(cx - 1, ey + 4, 3, 1, INK);
    p.rect(cx - 2, ey + 2, 1, 2, BONE[4]).rect(cx + 2, ey + 2, 1, 2, BONE[4]);
    p.set(cx, ey + 4, FLAME[1]);
  } else {
    p.rect(cx - 2, ey + 2, 4, 1, INK);
    p.set(cx - 2, ey + 3, BONE[4]).set(cx + 1, ey + 3, BONE[4]);
  }
}

// ---------------------------------------------------------------------------------------------
// The rig

function bat(q: Pose, back: boolean): Painted {
  const lights: Light[] = [];

  // --- the beat, and how far the wings have left it for a held shape ---
  const phase = frac(q.wind * (q.drag >= 0.5 ? 1 : 2));
  const up = clamp01(-q.hy);
  const swept = clamp01(-q.hx);
  const brake = clamp01(q.off);
  const held = Math.min(1, up + swept + brake);
  const beating = 1 - held;

  // --- where the body is, and the way it points ---
  // (it is lowest as the wings reach the top of their stroke, and is lifted by the stroke down)
  const rise = Math.cos(phase * Math.PI * 2) * LIFT * beating;
  const bx = KX + Math.round(q.lean);
  const by = KAY - HOVER + Math.round(q.bob + rise);
  const tilt = 90 - q.aim + q.drag * (back ? 20 : 28);
  const ux = Math.sin(rad(tilt));
  const uy = -Math.cos(rad(tilt));
  // (flat out, it is drawn out long and thin)
  const flat = Math.abs(ux);
  const chestR = CHEST_R - 0.6 * flat;
  const rumpR = RUMP_R - 0.6 * flat;
  const chest: V = [bx + ux * CHEST_UP, by + uy * CHEST_UP];
  const rump: V = [bx - ux * (RUMP_DOWN + 1.6 * flat), by - uy * (RUMP_DOWN + 1.6 * flat)];
  const tail: V = [rump[0] - ux * rumpR, rump[1] - uy * rumpR];
  // (the head is held steadier than the body: it rides a beat half as high, so the neck is
  // stretched as the body sinks and the head is hunched into the shoulders as the wings shove
  // the body up)
  const hx = Math.round(chest[0] + ux * (NECK + 1.4 * flat));
  const hy = Math.round(chest[1] + uy * (NECK + 1.4 * flat) - rise * 0.5);
  /** How far the ears lean back: a little in flight, as far as they go for the dart. */
  const lay = Math.max(clamp01(tilt / 100), swept);

  // --- the wings ---
  // Which wing is nearer the camera? Facing us it is the one on screen-left; facing away, the right.
  const nearSide = back ? 1 : -1;
  const sweptAs = back ? SWEPT_BACK : SWEPT_FRONT;
  const b = beatShape(phase);
  const shapeOf = (which: 'near' | 'far'): Shape => {
    const all: readonly (readonly [Shape, number])[] = [[b, beating], [VEE[which], up], [sweptAs[which], swept], [BRAKE[which], brake]];
    const sum = beating + up + swept + brake;
    const at = (i: 0 | 1 | 3 | 4): number => all.reduce((v, [s, w]) => v + s[i] * w, 0) / sum;
    // (a fan does not shut on its way from open one way to open the other: its width is carried
    // across, and it faces the way of whichever shape the wing is nearer)
    const wide = all.reduce((v, [s, w]) => v + Math.abs(s[2]) * w, 0) / sum;
    const lead = all.reduce((best, cur) => (cur[1] > best[1] ? cur : best));
    // (it rolls as it flies, one wing reaching higher and then the other; hovering it rocks a
    // little the same way, once in its two beats, so that the second is not the first again)
    const rock = Math.sin(q.wind * Math.PI * 2) * 3 * (1 - clamp01(q.drag));
    const roll = (which === 'near' ? 1 : -1) * (q.swing * 4 + rock) * beating;
    // (held up for the warning, the wings shake)
    const shake = Math.sin(q.wind * Math.PI * 10) * 4 * up;
    // (and, seen from a corner, the nearer wing hangs lower and the further one stands higher)
    const grid = (which === 'near' ? -1 : 1) * GRID_TILT * (1 - swept);
    return [at(0) + roll + grid, at(1) + roll + shake + grid, lead[0][2] < 0 ? -wide : wide, at(3), at(4)];
  };
  // (the shoulders and hips are either side of the body's line: seen from behind they turn with
  // it; seen from in front the nearer side only swings a little down as the bat pitches toward us)
  const across = rad(back ? tilt : 180 - tilt * 0.35);
  const lx = Math.cos(across);
  const ly = Math.sin(across);
  const nearShape = shapeOf('near');
  const farShape = shapeOf('far');
  // (the skin of a wing ends at the hip; drawn in, it trails all the way to the tail)
  const root = (side: number, tuck: number): V => {
    const k = clamp01(tuck);
    return [rump[0] + side * lx * 2.4 + (tail[0] - side * lx * 1.4 - rump[0]) * k, rump[1] + side * ly * 2.4 + (tail[1] - side * ly * 1.4 - rump[1]) * k];
  };
  const drop = SHOULDER_DROP * (1 - swept);
  const nearWing = wingAt([chest[0] + lx * 3.2, chest[1] + ly * 3.2 - 0.5 + drop], root(1, nearShape[3]), nearSide, 1, nearShape);
  const farWing = wingAt([chest[0] - lx * 2.8, chest[1] - ly * 2.8 - 1 - drop], root(-1, farShape[3]), -nearSide, FAR, farShape);
  const far = layer();
  const near = layer();
  // Each wing is brightest behind its leading edge and darkest where it is in the body's shadow;
  // the further wing is a tone darker all through. (Thrown up or swept back, a wing is clear of
  // that shadow.)
  const tonesOf = (r: Ramp, tuck: number): [string, string, string] => (tuck > 0.5 ? [r[3], r[3], r[2]] : up > 0.5 ? [r[3], r[2], r[2]] : [r[3], r[2], r[1]]);
  // The bones are the fur's light tone, the further wing's struts a tone down so that it stays
  // behind. Seen from above, the bat facing away, they stand out: pale on the nearer wing, and
  // every one of them light on the further.
  wing(far, farWing, tonesOf(dim(WING), farShape[3]), FUR[3], back ? FUR[3] : FUR[2]);
  wing(near, nearWing, tonesOf(WING, nearShape[3]), back ? BONE[2] : FUR[4], back ? BONE[2] : FUR[4]);

  // --- the body ---
  const body = layer();
  const over = layer();
  // the feet: two claws under the tail
  for (const s of [-1, 1]) {
    const isNear = s === nearSide;
    const stride = isNear ? q.near : q.far;
    const lift = isNear ? q.nearLift : q.farLift;
    const fx = tail[0] - ux * (0.6 - lift) + (s < 0 ? -1.5 : 1.5) + stride * 0.8;
    const fy = tail[1] - uy * (0.6 - lift);
    body.set(Math.floor(fx), Math.floor(fy), FUR[isNear ? 3 : 2]);
    body.set(Math.floor(fx - ux), Math.floor(fy - uy), FUR[2]);
  }
  // The head and its ears. Facing us they are one with the body, and the face says where the
  // head is. From behind there is no face, so there the head is a part of its own, a ball with
  // the style's dark seam round it, and the ears are another, standing behind it.
  const top = back ? layer() : body;
  const ears = back ? layer() : body;
  // the ears: tall, pointed, their roots meeting over the brow. The nearer one is the bigger and
  // the brighter. From in front both are hollow; from behind they are plain fur. (They are
  // painted before the body, so that an ear leaning back along it is hidden by it.)
  const earOn = (s: number): void => {
    const isNear = s === nearSide;
    // (leaning back, the ears swing round the head toward the tail, and are seen a little short)
    const a = rad(-32 * lay);
    const k = 1 - 0.1 * lay;
    const at = (x: number, y: number): V => [hx + x * Math.cos(a) - y * Math.sin(a), hy + x * Math.sin(a) + y * Math.cos(a)];
    const tones: [string, string, string] = isNear ? [FUR[3], back ? FUR[2] : WING[2], back ? FUR[1] : FUR[2]] : [FUR[2], back ? FUR[2] : WING[1], FUR[1]];
    ear(ears, at(s * 4, -2), at(-s * 1.5, -3.4), at(s * (isNear ? 5 : 4.8) * k, -(isNear ? 10 : 9) * k), tones);
  };
  earOn(-nearSide);
  earOn(nearSide);
  pear(body, rump[0], rump[1], chest[0], chest[1], rumpR, chestR);
  if (back) {
    // from behind: the skin between the legs, and the back of the head
    const sk = dim(WING);
    body.rect(Math.round(tail[0]) - 1, Math.round(tail[1]) - 1, 2, 3, sk[2]).set(Math.round(tail[0]) - 1, Math.round(tail[1]) + 2, sk[2]);
    head(top, hx, hy);
    // (its eyes are on the other side: when they flare, their light spills round the head)
    if (q.act > 0.5) lights.push({ x: hx + 4, y: hy - 2, r: 9, color: SOCKET, a: 0.35 });
  } else {
    head(top, hx, hy);
    // the face (stooping, it looks down the way it is going)
    face(top, over, hx + 1, hy + Math.round(Math.max(0, uy) * 2.2), q.act, q.act, lights);
  }

  // (the wings are behind the body, but for the nearer one when it is swept back along a body
  // that is going away from us: that one is this side of it. From behind, the ears and then the
  // head come last)
  const parts = back && nearShape[3] > 0.5 ? [far, body, near] : [far, near, body];
  if (back) parts.push(ears, top);
  return { px: compose(null, parts, over), lights };
}

// ---------------------------------------------------------------------------------------------
// Animations

/**
 * The bite, built as mkit's strike() builds an attack (from rest, the wound-up pose reached and
 * held, the blow at `hit`, back at rest 0.3 seconds after it), with one key more: the jaws shut
 * and hang on for a moment before the wings open to brake.
 */
function bite(hit: number, wound: Partial<Pose>, blow: Partial<Pose>, grip: Partial<Pose>, after: Partial<Pose>): Timeline {
  const keys: Key[] = [
    { at: 0, pose: {} },
    { at: hit * 0.5, pose: wound, ease: 'out' },
    { at: hit * 0.86, pose: { ...wound, wind: (wound.wind ?? 0) + 0.2 }, ease: 'lin' },
    { at: hit, pose: blow, ease: 'in' },
    { at: hit + 0.05, pose: grip, ease: 'out' },
    { at: hit + 0.14, pose: after, ease: 'out' },
    { at: hit + 0.3, pose: { wind: 1 }, ease: 'io' },
  ];
  return { keys, hit };
}

// ---------------------------------------------------------------------------------------------
// Its death: it drops with its wings spread
//
// The owner, 5 Oct 2026: "I think we want death animations and corpses for enemies." What he was
// told of this one: the bat drops with its wings spread.
//
// It is the rig's own bat all the way down (no piece of it comes off): struck in the air, its
// wings are thrown up and its eyes flare; it drops like a stone, turning over as it goes, the
// wings trailing above it; it hits the floor, bounces once, and lies along the grid the way it
// was flying (head down the screen if it faced us, up it if it faced away) with its wings spread
// wide to either side and the light gone out of its eyes.

/** The beat's shape with the wings level, tip to tip at their widest: where `wind` puts them so. */
const LEVEL = 1 / 6;

function batDeath(k: number, back: boolean): Painted {
  /**
   * How far the body comes down: from where it hangs to lying on the floor. It lies along the
   * grid, one wing toward us and one away, and the wing toward us reaches some sixteen pixels
   * lower than its body: so the body comes to rest ten above the floor point, and the whole of
   * it, wing tip to wing tip, lies about that point (and is clear of the foot of the canvas).
   */
  const down = HOVER - 10;
  /** The way it points as it lies: along the grid, the way it was flying. */
  const lies = back ? 27 : -27;
  let q: Partial<Pose>;
  if (k < 0.14) {
    // struck: thrown back and up, the wings flung up
    const u = k / 0.14;
    q = { bob: -3 * u, lean: -3 * u, hy: -u, act: 1, wind: 0.1 };
  } else if (k < 0.6) {
    // it drops (slowly, then fast), turning over as it goes; the wings trail above it
    const u = (k - 0.14) / 0.46;
    q = { bob: -3 + (down + 3) * u * u, lean: -3, hy: -1, act: 1 - u, wind: 0.1, aim: 90 + (lies - 90) * u * u };
  } else if (k < 0.8) {
    // it hits the floor: the wings come down flat, and it bounces once
    const u = (k - 0.6) / 0.2;
    q = { bob: down - Math.sin(u * Math.PI) * 3, lean: -3, hy: -(1 - Math.min(1, u * 2.5)), wind: LEVEL, aim: lies };
  } else q = { bob: down, lean: -3, wind: LEVEL, aim: lies };
  const f = bat({ ...REST, ...q }, back);
  // the light goes out of its eyes on the way down
  if (k < 0.45) return f;
  quench(f.px, [SOCKET, FLAME[3], FLAME[4]], INK);
  return { px: f.px, lights: [] };
}

/** The cave bat. */
export function makeBatArt(): ActorArt {
  const front = {
    attack: bite(
      0.22,
      { lean: -3, bob: -4, aim: 114, hy: -1, act: 1, wind: 0.1 },
      { lean: 10, bob: 5, aim: -27, hx: -1, act: 1, wind: 0.4 },
      { lean: 11, bob: 6, aim: -27, hx: -1, act: 1, wind: 0.45 },
      { lean: 4, bob: -1, aim: 100, off: 1, act: 0.4, wind: 0.6 },
    ),
  };
  const back = {
    attack: bite(
      0.22,
      { lean: -3, bob: -4, aim: 112, hy: -1, act: 1, wind: 0.1 },
      { lean: 9, bob: -5, aim: 29, hx: -1, act: 1, wind: 0.4 },
      { lean: 10, bob: -6, aim: 29, hx: -1, act: 1, wind: 0.45 },
      { lean: 4, bob: -1, aim: 98, off: 1, act: 0.4, wind: 0.6 },
    ),
  };
  return monsterArt(bat, { ...front, die: (k) => batDeath(k, false) }, { ...back, die: (k) => batDeath(k, true) }, { idleFps: 20, aura: { x: KAX, y: KAY - HOVER, r: 26, color: MENACE.color, a: MENACE.a } });
}

/** For the art sheets: one frame, as a painting. */
export const paintBat: Rig = (q, back) => bat(q, back);
