// The heroes of the first builds (Versions 1 to 9): kept for the art sheets that compare old and new.
// The game now draws the heroes of art/heroes.ts.
//
// Placeholder art for the three playable heroes, painted in code at start-up (no image files).
//
// Every frame is a 24x32 canvas anchored at (12, 29): the floor point between the feet.
// All frames face screen-RIGHT; the renderer mirrors them for screen-left.
//   front = facing the camera (down-right): we see the face, the weapon is drawn over the body.
//   back  = facing away (up-right): we see the back, the weapon is drawn behind the body.
//
// How it is built:
//   - A Pose is a handful of numbers (bob, leg offsets, weapon hand, weapon angle ...).
//   - Each hero has one "rig" function that paints one frame from a Pose. Details that never
//     change (heads, torsos) are small character maps ("stamps"); everything that moves is placed
//     by the Pose.
//   - An animation is a short list of Poses, so all frames of a hero stay consistent.
//   - Parts are painted on separate layers. Each layer gets its own 1 px ink outline before the
//     layers are stacked, so a sword or shield held in front of the body stays readable.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { P } from './palette';
import type { ActorArt, AnimSet } from './actor_types';
import type { ClassId } from '../game/types';

const W = 24;
const H = 32;
/** Anchor: the floor point between the feet. */
const AX = 12;
const AY = 29;
/** Sole row of the foot nearer the camera. The other foot stands one row higher. */
const FLOOR = 28;
/** Top row of the legs (hidden under the tunic). */
const HIP = 22;

// ---------------------------------------------------------------------------------------------
// Pose

interface Pose {
  /** Upper body pushed down this many pixels (breathing, footfalls). The feet stay put. */
  bob: number;
  /** Upper body pushed toward screen-right (+) or left (-): leaning into or away from a blow. */
  lean: number;
  /** Stride of the foot nearer the camera: + forward, - back. */
  near: number;
  /** Stride of the foot further from the camera. */
  far: number;
  /** Pixels the near / far foot is raised off the floor (the passing leg of a walk). */
  nearLift: number;
  farLift: number;
  /** Arm swing of a walk: +1 weapon arm forward, -1 back. */
  swing: number;
  /** Weapon hand, as an offset from where it rests. */
  hx: number;
  hy: number;
  /** Direction the weapon points, in degrees: 0 = forward (screen-right), 90 = straight up. */
  aim: number;
  /**
   * Other arm: 0 hanging at the side, 1 raised (shield up, hand on the bowstring, hand on the
   * staff). The warrior also uses -1: shield swung down and back.
   */
  off: number;
  /** Class-specific. Ranger: pixels the bowstring is drawn back. Mage: orb glow, 0 dim .. 3 flare. */
  act: number;
  /** Front view only: draw the weapon behind the body (e.g. a sword raised behind the head). */
  behind: boolean;
}

const REST: Pose = {
  bob: 0,
  lean: 0,
  near: 0,
  far: 0,
  nearLift: 0,
  farLift: 0,
  swing: 0,
  hx: 0,
  hy: 0,
  aim: 90,
  off: 0,
  act: 0,
  behind: false,
};

/** A walk in four steps: contact, passing, contact on the other foot, passing. */
const GAIT: ReadonlyArray<Partial<Pose>> = [
  { bob: 1, near: 1, far: -1, swing: 1 },
  { farLift: 2 },
  { bob: 1, near: -1, far: 1, swing: -1 },
  { nearLift: 2 },
];

/** Paints one frame of a hero. */
type Rig = (q: Pose, back: boolean) => Px;

// ---------------------------------------------------------------------------------------------
// Small painting helpers

function layer(): Px {
  return new Px(W, H);
}

/** Stack layers bottom to top. Each one is outlined first so overlapping parts stay separate. */
function stack(layers: ReadonlyArray<Px>): Px {
  const out = layer();
  for (const l of layers) out.blit(l.outline(P.ink), 0, 0);
  return out;
}

/** Letters used by the stamps below. */
const KEY: Readonly<Record<string, string>> = {
  // steel
  A: P.sl5,
  B: P.sl4,
  C: P.sl3,
  D: P.sl2,
  // crimson
  R: P.bl4,
  r: P.bl3,
  q: P.bl2,
  // green
  H: P.gn4,
  G: P.gn3,
  g: P.gn2,
  d: P.gn1,
  // purple
  V: P.pu5,
  U: P.pu4,
  u: P.pu3,
  v: P.pu2,
  // wood and leather
  M: P.wd5,
  L: P.wd4,
  l: P.wd3,
  w: P.wd2,
  // gold
  Y: P.gd4,
  y: P.gd3,
  z: P.gd2,
  // skin
  K: P.sk4,
  k: P.sk3,
  j: P.sk2,
  // pale hair, feathers
  N: P.bn4,
  n: P.bn3,
  i: P.bn2,
  // eyes
  e: P.ink,
};

/** Paint a small hand-drawn pixel map with its top-left corner at (x, y). '.' leaves a pixel alone. */
function stamp(p: Px, x: number, y: number, rows: ReadonlyArray<string>): void {
  for (let j = 0; j < rows.length; j++) {
    const row = rows[j];
    for (let i = 0; i < row.length; i++) {
      const c = KEY[row.charAt(i)];
      if (c) p.set(x + i, y + j, c);
    }
  }
}

/** Unit step for an angle in degrees: 0 = screen-right, 90 = up. */
function dir(deg: number): [number, number] {
  const r = (deg * Math.PI) / 180;
  return [Math.cos(r), -Math.sin(r)];
}

/** True when a direction is closer to vertical than horizontal. */
function isSteep(deg: number): boolean {
  const [dx, dy] = dir(deg);
  return Math.abs(dy) > Math.abs(dx);
}

/** A 2-pixel-thick arm: lit colour on the upper/left side, shade on the lower/right side. */
function limb(p: Px, x0: number, y0: number, x1: number, y1: number, lit: string, shade: string): void {
  if (Math.abs(y1 - y0) >= Math.abs(x1 - x0)) {
    p.line(x0 + 1, y0, x1 + 1, y1, shade);
  } else {
    p.line(x0, y0 + 1, x1, y1 + 1, shade);
  }
  p.line(x0, y0, x1, y1, lit);
}

/** A 2x2 hand with its top-left pixel at (x, y). */
function fist(p: Px, x: number, y: number): void {
  p.rect(x, y, 2, 2, P.sk3);
  p.set(x, y, P.sk4);
}

/** A hand closed around a weapon whose shaft passes through (hx, hy) pointing along `deg`. */
function grip(p: Px, hx: number, hy: number, deg: number): void {
  if (isSteep(deg)) fist(p, hx - 1, hy);
  else fist(p, hx, hy - 1);
}

interface LegStyle {
  /** Leg width in pixels. */
  w: number;
  cloth: string;
  shade: string;
  boot: string;
  bootLit: string;
}

/** One leg: a column from the hip to a boot whose toe points screen-right. `stride` slides the foot. */
function leg(p: Px, hipX: number, soleY: number, stride: number, s: LegStyle): void {
  const rows = soleY - HIP;
  for (let y = HIP; y <= soleY; y++) {
    const x = hipX + Math.round((stride * (y - HIP)) / rows);
    const boot = y >= soleY - 1;
    for (let i = 0; i < s.w; i++) p.set(x + i, y, boot ? s.boot : i === s.w - 1 ? s.shade : s.cloth);
    if (y === soleY - 1) p.set(x, y, s.bootLit);
    if (y === soleY) p.set(x + s.w, y, s.boot); // toe
  }
}

/** Both legs. They do not lean or bob: the feet are what the anchor is measured from. */
function legs(p: Px, q: Pose, back: boolean, s: LegStyle): void {
  const left = AX - 1 - s.w;
  const right = AX + 1;
  // The foot nearer the camera stands one row lower on screen. Facing the camera that is the
  // screen-left foot; facing away it is the screen-right one.
  const nearX = back ? right : left;
  const farX = back ? left : right;
  // A step forward goes down the screen when facing the camera and up the screen when facing away.
  const slope = back ? -1 : 1;
  leg(p, farX, FLOOR - 1 + slope * Math.sign(q.far) - q.farLift, q.far, s);
  leg(p, nearX, FLOOR + slope * Math.sign(q.near) - q.nearLift, q.near, s);
}

// ---------------------------------------------------------------------------------------------
// Warrior: stocky, steel helm and shoulders, crimson tabard, sword and round shield.

const WARRIOR_HEAD_FRONT = [
  '..RRr...',
  '.RBBCC..',
  'rBABCCC.',
  'BBBCCCCD',
  'BBCCCCCD',
  'CCDDDDDD',
  'CDkeCekD',
  '.CKKkkjD',
  '..jkkj..',
];

const WARRIOR_HEAD_BACK = [
  '..RRr...',
  '.RBBCC..',
  'rBABCCC.',
  'rBBCCCCD',
  'BBCCCCCD',
  'BCCCCCCD',
  'CCCCCCDD',
  'CDDDDDDD',
  '.CCCDDD.',
];

// Shoulder plates over a tabard. 12 wide, rows 13..22.
const WARRIOR_TORSO = [
  '.BBCDDDDCCD.',
  'BABCRRrrCCCD',
  'BBCDRrrrDCDD',
  '.CDRRrrrrqD.',
  '..DRRrrrrq..',
  '..DRrrrrrq..',
  '..wwwwwwww..',
  '..Rrrrrrrq..',
  '..Rrrrrrrq..',
  '..Rrrqqrrq..',
];

const WARRIOR_LEGS: LegStyle = { w: 3, cloth: P.sl3, shade: P.sl2, boot: P.wd4, bootLit: P.wd5 };

/** A short broad sword held at (hx, hy), pointing along `deg`. Paints the hand too. */
function sword(p: Px, hx: number, hy: number, deg: number): void {
  const [dx, dy] = dir(deg);
  const at = (t: number): [number, number] => [Math.round(hx + dx * t), Math.round(hy + dy * t)];
  // The blade is two pixels wide: a shaded line through the hand and a lit line up-left of it.
  const steep = isSteep(deg);
  const ox = steep ? -1 : 0;
  const oy = steep ? 0 : -1;
  const [x0, y0] = at(2);
  const [x1, y1] = at(8);
  const [x2, y2] = at(7);
  p.line(x0, y0, x1, y1, P.sl4);
  p.line(x0 + ox, y0 + oy, x2 + ox, y2 + oy, P.sl5); // one pixel shorter: a pointed tip
  // cross-guard, at right angles to the blade
  const gx = hx + dx * 1.2 + ox / 2;
  const gy = hy + dy * 1.2 + oy / 2;
  p.line(Math.round(gx + dy * 1.6), Math.round(gy - dx * 1.6), Math.round(gx - dy * 1.6), Math.round(gy + dx * 1.6), P.gd3);
  // pommel
  const [px, py] = at(-1);
  p.set(px, py, P.gd2);
  p.set(px + ox, py + oy, P.gd3);
  grip(p, hx, hy, deg);
}

/** A round wooden shield, 8 px across, centred on the pixel corner (cx, cy). */
function roundShield(p: Px, cx: number, cy: number): void {
  p.ellipse(cx, cy, 4, 4, P.sl3);
  p.ellipse(cx, cy, 3, 3, P.wd4);
  for (let y = cy - 4; y < cy + 4; y++) {
    for (let x = cx - 4; x < cx + 4; x++) {
      const c = p.get(x, y);
      if (c === null) continue;
      const d = x - cx + (y - cy) + 1; // negative toward the light (top-left), positive away from it
      if (c === P.sl3) {
        if (d <= -3) p.set(x, y, P.sl4);
        else if (d >= 3) p.set(x, y, P.sl2);
      } else if (d >= 2) {
        p.set(x, y, P.wd3);
      }
    }
  }
  // boss
  p.rect(cx - 1, cy - 1, 2, 2, P.sl4);
  p.set(cx - 1, cy - 1, P.sl5);
  p.set(cx, cy, P.sl3);
}

function warrior(q: Pose, back: boolean): Px {
  const X = AX + q.lean; // body centre line (between two pixel columns)
  const Y = q.bob;
  const fwd = back ? -q.swing : q.swing;

  // Sword hand, just outside the shoulder plate.
  const hx = X + 6 + q.hx + fwd;
  const hy = 19 + Y + q.hy;
  const aim = q.aim + fwd * 4; // the blade rocks a little with the stride

  const weapon = layer();
  sword(weapon, hx, hy, aim);

  const body = layer();
  // facing the camera, the sword arm is the far one: it goes behind the chest
  if (!back) limb(body, X + 4, 16 + Y, hx, hy, P.sl3, P.sl2);
  legs(body, q, back, WARRIOR_LEGS);
  body.rect(X - 6, 16 + Y, 2, 4, P.sl3); // shield arm
  stamp(body, X - 6, 13 + Y, WARRIOR_TORSO);
  if (back) {
    // facing away, the sword arm is the near one: over the chest, but a raised hand goes behind the helm
    limb(body, X + 4, 16 + Y, hx, hy, P.sl3, P.sl2);
    grip(body, hx, hy, aim);
  } else {
    body.rect(X - 1, 19 + Y, 2, 1, P.gd3); // belt buckle
  }
  stamp(body, X - 4, 4 + Y, back ? WARRIOR_HEAD_BACK : WARRIOR_HEAD_FRONT);

  // Facing the camera the shield is on the near arm; facing away it is slung across the back.
  const shield = layer();
  if (back) roundShield(shield, X - 2, 19 + Y);
  else roundShield(shield, X - 5 - fwd + q.off, 19 + Y - q.off * 2);

  return stack(back || q.behind ? [weapon, body, shield] : [body, weapon, shield]);
}

// ---------------------------------------------------------------------------------------------
// Ranger: slim, green hood and cloak, leather tunic, longbow held forward, quiver on the back.

const RANGER_HEAD_FRONT = [
  '..GG....',
  '.HGGGG..',
  'HHGGGGG.',
  'HGGGGGGg',
  'GGgddddg',
  'GgjkKKkg',
  'GgkeKekg',
  '.gGkkkg.',
  '..GGGGg.',
];

const RANGER_HEAD_BACK = [
  '..GG....',
  '.HGGGG..',
  'HHGGGGG.',
  'HGGGGGGg',
  'HGGGGGgg',
  'GGGGGGgg',
  'GGGgGGgg',
  '.GGgGgg.',
  '..GGgg..',
];

// Green mantle over the shoulders, leather tunic with the quiver strap. 8 wide, rows 13..21.
const RANGER_TORSO = [
  'HGGGyGGg',
  'GGgGGggg',
  '.LwLLll.',
  '.LLwLll.',
  '.LLLwll.',
  '.LLLlwl.',
  '.wwywww.',
  '.LLLlll.',
  '.LLllll.',
];

// Arrow feathers poking out of the quiver. 2 wide.
const QUIVER_TOP = ['N.', 'NR', 'MR', 'lL', 'lL'];

const RANGER_LEGS: LegStyle = { w: 2, cloth: P.er5, shade: P.er4, boot: P.wd3, bootLit: P.wd4 };

/** The cloak: a sheet from the shoulders to the calves. `sway` swings the lower half. */
function cloak(p: Px, X: number, Y: number, sway: number, back: boolean): void {
  for (let y = 13; y <= 24; y++) {
    const sh = y >= 20 ? sway : 0;
    // facing the camera we see it past the trailing (left) side of the body only
    const flare = back ? (y >= 19 ? 1 : 0) : Math.min(2, y - 13);
    const x0 = X - 4 - flare + sh;
    const x1 = X + 3 + (back && y >= 19 ? 1 : 0) + sh;
    for (let x = x0; x <= x1; x++) {
      if (y === 24 && (x - x0) % 3 === 1) continue; // ragged hem
      let c: string = P.gn3;
      if (back) {
        if (x === x0 && y < 19) c = P.gn4;
        if (x >= x1 - 1) c = P.gn2;
        if (y >= 15 && (x === X - 1 + sh || x === X + 1 + sh)) c = P.gn2; // folds
      } else if (x > x0 + 1) {
        c = P.gn2; // the inside of the cloak, in shadow
      }
      p.set(x, y + Y, c);
    }
  }
}

/** The bow's wooden limbs, held upright by the grip at (gx, gy), belly toward screen-right. */
function bow(p: Px, gx: number, gy: number, bend: number): void {
  for (let t = -7; t <= 7; t++) {
    const x = gx - Math.round((bend * t * t) / 49);
    p.set(x, gy + t, t <= 0 ? P.wd5 : P.wd4);
  }
}

function ranger(q: Pose, back: boolean): Px {
  const X = AX + q.lean;
  const Y = q.bob;
  const fwd = back ? -q.swing : q.swing;

  // Bow hand. Facing away the bow is held in front of the body, so it sits closer in.
  const gx = X + (back ? 7 : 8) + q.hx + fwd;
  const gy = 17 + Y + q.hy;
  const pull = q.act;
  const bend = pull > 0 ? 4 : 3; // a drawn bow curves more
  const nx = gx - bend - pull; // the nock: where the string hand holds the arrow

  const weapon = layer();
  bow(weapon, gx, gy, bend);
  if (pull > 0) {
    const tip = Math.min(W - 2, gx + 2);
    weapon.hline(nx, gy, tip - nx + 1, P.wd5);
    weapon.hline(tip - 1, gy, 2, P.sl5);
    weapon.set(nx, gy, P.bn4);
  }
  fist(weapon, gx - 1, gy);

  // The string is a single pixel wide and has no outline, or it would turn the bow into a blob.
  const strings = layer();
  strings.line(gx - bend, gy - 7, nx, gy, P.bn2);
  strings.line(nx, gy, gx - bend, gy + 7, P.bn2);

  const body = layer();
  const raised = q.off > 0;
  // where the string hand is: on the nock while drawing, by the cheek just after the release
  const sx = pull > 0 ? nx : X + 1;
  const sy = pull > 0 ? gy : 13 + Y;

  if (back) {
    // both arms reach forward, away from us: the cloak covers all but the bow hand and an elbow
    if (raised) limb(body, X - 4, 15 + Y, X - 7, 14 + Y, P.wd4, P.wd3);
    limb(body, X + 3, 15 + Y, gx - 1, gy, P.gn3, P.gn2);
    fist(body, gx - 1, gy);
    legs(body, q, back, RANGER_LEGS);
    cloak(body, X, Y, -fwd, true);
    stamp(body, X - 4, 4 + Y, RANGER_HEAD_BACK);
    // quiver slung across the back
    limb(body, X - 4, 12 + Y, X, 20 + Y, P.wd4, P.wd3);
    stamp(body, X - 6, 8 + Y, QUIVER_TOP);
  } else {
    cloak(body, X, Y, -fwd, false);
    stamp(body, X - 6, 8 + Y, QUIVER_TOP);
    limb(body, X + 3, 15 + Y, gx - 1, gy, P.gn3, P.gn2); // bow arm, behind the chest
    legs(body, q, back, RANGER_LEGS);
    stamp(body, X - 4, 13 + Y, RANGER_TORSO);
    stamp(body, X - 4, 4 + Y, RANGER_HEAD_FRONT);
    if (raised) {
      // string arm: elbow out behind, leather bracer across the chest, hand at the string
      limb(body, X - 6, 14 + Y, sx - 2, sy, P.wd4, P.wd3);
      fist(body, sx - 1, sy - 1);
    } else {
      const ax = X - 5 - fwd;
      limb(body, X - 5, 15 + Y, ax, 19 + Y, P.gn3, P.gn2);
      body.rect(ax, 18 + Y, 2, 2, P.wd3);
      body.vline(ax, 18 + Y, 2, P.wd4);
      body.rect(ax, 20 + Y, 2, 1, P.sk3);
    }
  }

  // Facing away, the bow and its string are in front of the hero, so the body covers them.
  if (back) return stack([weapon]).blit(strings, 0, 0).blit(stack([body]), 0, 0);
  return stack([body, weapon]).blit(strings, 0, 0);
}

// ---------------------------------------------------------------------------------------------
// Mage: robe with gold trim, pointed hat, staff topped by a glowing orb.

// Pointed hat (tip bent backwards), gold band, wide brim. 10 wide, rows 3..8.
const MAGE_HAT = [
  '...U......',
  '...UU.....',
  '...UUuu...',
  '..UUUuuv..',
  '..yYyyyz..',
  'UVUUuuuuvv',
];

// Under the brim, rows 9..12.
const MAGE_FACE = [
  '..njkKkjn.',
  '..nkeKeki.',
  '..nkkkki..',
  '...yyyy...',
];

// From behind: a cowl under the hat and a pale ponytail with a gold tie, rows 9..17. Painted
// over the robe. (A wider patch of pale hair here reads as a face or a beard.)
const MAGE_HEAD_BACK = [
  '..UUnNuuv.',
  '..UunNuuv.',
  '...unnuv..',
  '...uniuv..',
  '....ni....',
  '....yz....',
  '....ni....',
  '....ni....',
  '....n.....',
];

const MAGE_LEGS: LegStyle = { w: 3, cloth: P.pu2, shade: P.pu2, boot: P.wd4, bootLit: P.wd5 };

/** Last row of the robe: the hem hangs two pixels above the floor so the feet show. */
const ROBE_END = 26;

/** The robe: a bell from the shoulders to the hem, gold sash and hem band. `sway` swings the hem. */
function robe(p: Px, X: number, Y: number, sway: number, back: boolean): void {
  const top = 13 + Y;
  for (let y = top; y <= ROBE_END; y++) {
    let half = y <= 18 ? 4 : y <= 22 ? 5 : 6;
    if (y === ROBE_END) half = 5; // rounded hem corners
    // the shoulders follow the lean; the hem stays over the feet and swings with the stride
    const cx = y <= 20 ? X : AX + (y >= 24 ? sway : 0);
    for (let x = cx - half; x < cx + half; x++) {
      const rel = x - cx; // -half .. half - 1
      let c: string = rel < -1 ? P.pu4 : P.pu3;
      if (rel === half - 1) c = P.pu2; // shadow side
      if (y >= 20 && rel === -3) c = P.pu3; // folds in the skirt
      if (y >= 20 && rel === 2) c = P.pu2;
      if (!back && y > top + 5 && rel === 0) c = P.gd3; // trim down the front
      if (y === top + 5 || y === ROBE_END - 1) c = rel >= half - 2 ? P.gd2 : P.gd3; // sash, hem band
      p.set(x, y, c);
    }
  }
}

/** The orb on the staff, 3x3 around (cx, cy). glow: 0 dim, 1 glint, 2 charged, 3 flare. */
function orb(p: Px, cx: number, cy: number, glow: number): void {
  if (glow >= 3) {
    p.rect(cx - 1, cy - 1, 3, 3, P.white);
    p.set(cx - 2, cy, P.tl5);
    p.set(cx + 2, cy, P.tl5);
    p.set(cx, cy - 2, P.tl5);
    p.set(cx, cy + 2, P.tl5);
  } else if (glow >= 2) {
    p.rect(cx - 1, cy - 1, 3, 3, P.tl5);
    p.set(cx, cy, P.white);
    p.set(cx - 1, cy - 1, P.white);
  } else {
    p.rect(cx - 1, cy - 1, 3, 3, P.tl4);
    p.set(cx - 1, cy - 1, glow >= 1 ? P.white : P.tl5);
    p.set(cx, cy - 1, P.tl5);
    p.set(cx - 1, cy, P.tl5);
    p.set(cx + 1, cy + 1, P.tl3);
  }
}

/** Loose sparks around a glowing orb. Painted after the outlines so they stay single pixels. */
function sparks(p: Px, cx: number, cy: number, glow: number): void {
  if (glow >= 3) {
    p.set(cx - 2, cy - 2, P.tl4);
    p.set(cx + 2, cy - 2, P.tl5);
    p.set(cx - 2, cy + 2, P.tl5);
    p.set(cx + 2, cy + 2, P.tl4);
    p.set(cx + 3, cy, P.white);
    p.set(cx, cy - 3, P.white);
    p.set(cx, cy + 3, P.tl5);
  } else if (glow >= 2) {
    p.set(cx - 3, cy, P.tl5);
    p.set(cx + 3, cy + 1, P.tl5);
  }
}

/**
 * The staff, held at (hx, hy) and pointing along `deg`. A staff held level with the floor points
 * partly toward or away from the camera, so it is drawn shorter. Returns the orb's centre pixel.
 */
function staff(p: Px, hx: number, hy: number, deg: number, glow: number): [number, number] {
  const [dx, dy] = dir(deg);
  const level = Math.abs(dx);
  const up = Math.round(10 - 5 * level);
  const down = Math.round(10 - 3 * level);
  const at = (t: number): [number, number] => [Math.round(hx + dx * t), Math.round(hy + dy * t)];
  const [bx, by] = at(-down);
  const [tx, ty] = at(up);
  p.line(bx, by, tx, ty, P.wd4);
  p.set(bx, by, P.wd3);
  p.set(tx, ty, P.gd3); // gold collar under the orb
  const [cx, cy] = at(up + 2);
  orb(p, cx, cy, glow);
  return [cx, cy];
}

function mage(q: Pose, back: boolean): Px {
  const X = AX + q.lean;
  const Y = q.bob;
  const fwd = back ? -q.swing : q.swing;

  // Staff hand. The staff is carried like a walking stick, so it does not swing with the stride.
  const hx = X + (back ? 5 : 6) + q.hx;
  const hy = 17 + Y + q.hy;
  const [dx, dy] = dir(q.aim);
  // second hand, further down the staff, when both hands are on it
  const rx = Math.round(hx - dx * 5);
  const ry = Math.round(hy - dy * 5);
  const twoHanded = q.off > 0;

  const weapon = layer();
  const [ox, oy] = staff(weapon, hx, hy, q.aim, q.act);
  grip(weapon, hx, hy, q.aim);
  if (twoHanded) grip(weapon, rx, ry, q.aim);

  const body = layer();
  const sleeveX = X - 6 - fwd; // cuff of the hanging arm (screen-left)
  const hangingArm = (): void => {
    limb(body, X - 6, 14 + Y, sleeveX, 19 + Y, P.pu4, P.pu3);
    body.hline(sleeveX - 1, 20 + Y, 3, P.gd3);
    body.rect(sleeveX, 21 + Y, 2, 1, P.sk3);
  };
  const staffArm = (lit: string, shade: string): void => {
    limb(body, X + 3, 14 + Y, hx, hy, lit, shade);
  };

  if (back) {
    // both arms are in front of the body, away from us: the robe covers most of them
    if (!twoHanded) hangingArm();
    staffArm(P.pu3, P.pu2);
    grip(body, hx, hy, q.aim);
    legs(body, q, back, MAGE_LEGS);
    robe(body, X, Y, -fwd, true);
    stamp(body, X - 5, 9 + Y, MAGE_HEAD_BACK);
    stamp(body, X - 5, 3 + Y, MAGE_HAT);
  } else {
    staffArm(P.pu3, P.pu2); // far arm, behind the chest
    legs(body, q, back, MAGE_LEGS);
    robe(body, X, Y, -fwd, false);
    stamp(body, X - 5, 9 + Y, MAGE_FACE);
    stamp(body, X - 5, 3 + Y, MAGE_HAT);
    if (twoHanded) {
      limb(body, X - 5, 14 + Y, rx - 1, ry - 1, P.pu4, P.pu2);
    } else {
      hangingArm();
      body.vline(X - 4, 15 + Y, 5, P.pu2); // shadow the arm casts on the robe
    }
  }

  const out = stack(back ? [weapon, body] : [body, weapon]);
  sparks(out, ox, oy, q.act);
  return out;
}

// ---------------------------------------------------------------------------------------------
// Animations

/** Build idle / walk / attack for one facing. Every pose starts from `rest`. */
function animSet(rig: Rig, back: boolean, rest: Partial<Pose>, attack: ReadonlyArray<Partial<Pose>>): AnimSet {
  const frame = (o: Partial<Pose>): Sprite => rig({ ...REST, ...rest, ...o }, back).sprite(AX, AY);
  return {
    idle: [frame({}), frame({ bob: 1 })],
    walk: GAIT.map(frame),
    attack: attack.map(frame),
  };
}

export function makeHeroArtV1(): Record<ClassId, ActorArt> {
  return {
    // A big forward slash: sword raised behind the head, swung fully forward, then low.
    warrior: {
      front: animSet(warrior, false, { aim: 70 }, [
        { lean: -1, hx: -1, hy: -10, aim: 108, off: 1, behind: true },
        { bob: 1, near: 1, hx: -2, hy: -5, aim: -38, off: -1 },
        { bob: 1, near: 1, hy: 0, aim: -65 },
      ]),
      back: animSet(warrior, true, { aim: 72 }, [
        { lean: -1, hx: -1, hy: -10, aim: 108 },
        { bob: 1, near: 1, hx: -2, hy: -5, aim: 42 },
        { bob: 1, near: 1, hx: -2, hy: 0, aim: -55 },
      ]),
    },
    // Draw (string arm pulled back), release (bow straight, arm forward), recover.
    ranger: {
      front: animSet(ranger, false, {}, [
        { hy: -4, off: 1, act: 4 },
        { hx: 1, hy: -4, off: 1 },
        { hy: -2 },
      ]),
      back: animSet(ranger, true, {}, [
        { hx: 1, hy: -4, off: 1, act: 4 },
        { hx: 2, hy: -4, off: 1 },
        { hx: 1, hy: -2 },
      ]),
    },
    // Staff raised and charged, thrust forward with the tip flaring white, recover.
    mage: {
      front: animSet(mage, false, { act: 1 }, [
        { lean: -1, hx: -1, hy: -3, aim: 96, act: 2 },
        { lean: 1, hx: -7, hy: -1, aim: -12, off: 1, act: 3 },
        { hx: -1, aim: 75, act: 1 },
      ]),
      back: animSet(mage, true, { act: 1 }, [
        { lean: -1, hx: -1, hy: -3, aim: 96, act: 2 },
        { lean: 1, hx: -6, hy: -3, aim: 20, off: 1, act: 3 },
        { hx: -1, aim: 75, act: 1 },
      ]),
    },
  };
}
