// The dungeon boss ("the Warden") and the two town characters, all drawn in code.
//
// The Warden is built from a small rig: a Pose (a handful of numbers) plus `back` (which way he
// faces) goes in, one 48x56 frame comes out. To change an animation, edit the pose tables
// (IDLE / WALK / ATTACK) rather than the drawing code.
//
// Conventions shared with the other actor art:
//   - every frame faces screen-RIGHT (the renderer mirrors frames for screen-left)
//   - light comes from the top-left; only colours from the palette `P`; 1 px ink outline last

import { Px, type Sprite } from '../engine/px';
import { P } from './palette';
import type { ActorArt, AnimSet } from './actor_types';

type Pt = readonly [number, number];

// ---------------------------------------------------------------------------------------------
// Small drawing helpers

/** Light from the top-left: repaint exposed top/left edge pixels `lit` and bottom/right ones `shade`. */
function bevel(p: Px, lit: string, shade: string): Px {
  return p.each((x, y) => {
    if (!p.has(x, y - 1)) return lit;
    if (!p.has(x, y + 1)) return shade;
    if (!p.has(x - 1, y)) return lit;
    if (!p.has(x + 1, y)) return shade;
    return undefined;
  });
}

/** Copy a body part onto the frame. Where it overlaps art that is already there it gets an ink seam, so parts stay readable. */
function stamp(dst: Px, part: Px): void {
  for (let y = 0; y < part.h; y++) {
    for (let x = 0; x < part.w; x++) {
      if (part.has(x, y) || !dst.has(x, y)) continue;
      if (part.has(x - 1, y) || part.has(x + 1, y) || part.has(x, y - 1) || part.has(x, y + 1)) dst.set(x, y, P.ink);
    }
  }
  dst.blit(part, 0, 0);
}

/** A thick rounded limb segment from a to b, `w` pixels across. */
function limb(p: Px, a: Pt, b: Pt, w: number, c: string): void {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))));
  const off = w % 2 === 1 ? 0.5 : 0;
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(a[0] + ((b[0] - a[0]) * i) / steps);
    const y = Math.round(a[1] + ((b[1] - a[1]) * i) / steps);
    p.ellipse(x + off, y + off, w / 2, w / 2, c);
  }
}

/**
 * Where the elbow / knee goes for a two-bone limb from a to b (bone lengths l1, l2).
 * `side` picks which way it bends: +1 toward screen-right, -1 toward screen-left (and a little downward).
 */
function joint(a: Pt, b: Pt, l1: number, l2: number, side: number): Pt {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const d = Math.hypot(dx, dy);
  if (d < 0.01 || d >= l1 + l2) return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; // fully stretched
  const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const off = Math.sqrt(Math.max(0, l1 * l1 - along * along));
  const mx = a[0] + (dx * along) / d;
  const my = a[1] + (dy * along) / d;
  const c1: Pt = [mx - (dy * off) / d, my + (dx * off) / d];
  const c2: Pt = [mx + (dy * off) / d, my - (dx * off) / d];
  const score = (c: Pt): number => side * c[0] + 0.6 * c[1];
  return score(c1) >= score(c2) ? c1 : c2;
}

/** Rows of pixels centred on column cx: widths[i] is the width of row y0 + i. */
function stack(p: Px, cx: number, y0: number, widths: ReadonlyArray<number>, c: string): void {
  for (let i = 0; i < widths.length; i++) p.hline(cx - Math.floor(widths[i] / 2), y0 + i, widths[i], c);
}

/** Paint a run of pixels left to right; null entries are skipped. */
function run(p: Px, x: number, y: number, cols: ReadonlyArray<string | null>): void {
  for (let i = 0; i < cols.length; i++) p.set(x + i, y, cols[i]);
}

// ---------------------------------------------------------------------------------------------
// THE WARDEN: a towering skeletal knight in cracked, ember-lit iron, with a two-handed maul.
//
// Rows of the standing figure (bob = 0): helm 7..18, chest 19..30, belt 31..32, armoured skirt
// 33..38, hips at row 35, feet on rows 50..53. The top 6 rows are head-room for the raised maul.

const W = 48;
const H = 56;
const AX = 24; // anchor: the floor point between the feet
const AY = 52;

/** Maul head size in pixels: length across the shaft, thickness along it. */
const HEAD_LEN = 14;
const HEAD_THICK = 7;

/** How the maul and both arms are placed in one frame, for one facing. */
interface Hold {
  /** Hands: x relative to the body centre line, y as a frame row when bob = 0 (they sink with the body). */
  handL: Pt;
  handR: Pt;
  /** Which way each elbow bends: -1 toward screen-left, +1 toward screen-right. */
  elbowL: number;
  elbowR: number;
  /** Length of each arm bone. Longer bones make the elbows flare out more. */
  armLen: number;
  /** Centre of the maul head. Same coordinates as the hands, or plain frame pixels when `planted`. */
  head: Pt;
  /** True: the maul stands on the floor and does not move with the body. */
  planted: boolean;
  /** Direction of the shaft, from its butt end toward the head. Any length. */
  dir: Pt;
  /** Length of shaft drawn, measured back from the centre of the head. */
  shaft: number;
  /** True: the maul is drawn over the body. False: behind it. */
  over: boolean;
  /** Ember sparks, as offsets from the centre of the maul head. Only drawn on `hot` frames. */
  sparks: ReadonlyArray<Pt>;
}

interface Pose {
  /** Pixels the hips, chest and head sink (the knees bend to take it up). */
  bob: number;
  /** Pixels the upper body shifts toward the facing side. */
  lean: number;
  /** Feet as [stride toward the facing side, lift off the floor]: screen-left leg, then screen-right leg. */
  footL: Pt;
  footR: Pt;
  /** Pixels the cape hem swings toward the facing side (negative = trailing behind). */
  cape: number;
  /** The embers flare: brighter cracks and eyes, white-hot maul. Used for the attack warning. */
  hot: boolean;
  front: Hold;
  back: Hold;
}

/** Ember colours for cracks: dim normally, one step brighter when the Warden winds up. */
function ember(hot: boolean): { lo: string; hi: string } {
  return hot ? { lo: P.fr4, hi: P.fr5 } : { lo: P.fr3, hi: P.fr4 };
}

// Ragged cape hem and fold shading, indexed by column across the cape (-15..15 -> 0..30).
const TATTER = [-3, -1, -2, 0, -1, 1, 0, -3, -1, 0, 1, -1, -4, -1, 0, 1, 0, -2, 0, 1, -1, -5, -2, 0, 1, 0, -3, -1, 0, -2, -4];
const FOLD = [2, 3, 2, 3, 3, 2, 1, 2, 3, 3, 2, 1, 2, 2, 3, 3, 2, 1, 2, 2, 3, 2, 1, 2, 2, 3, 2, 1, 2, 3, 2];
/** The tattered crimson cape. From the front it frames the legs; from behind it is the main shape. */
function capeLayer(ox: number, top: number, sway: number, back: boolean): Px {
  const l = new Px(W, H);
  const hem = back ? 45 : 47; // a little shorter from behind so the greaves show when he walks
  for (let y = top; y <= hem + 1; y++) {
    const t = (y - top) / (hem - top);
    const cx = ox + Math.round(sway * t * t); // the hem lags behind the shoulders
    const hw = back ? Math.round(8 + 4 * t) : Math.round(9 + 5 * t); // flares toward the hem
    for (let u = -hw; u <= hw; u++) {
      const i = u + 15;
      if (y > hem + TATTER[i]) continue;
      // From behind, the cape hangs from the shoulders in a deep V, leaving the top of the back plate bare.
      const neck = back ? Math.max(0, 7 - Math.abs(u)) : 0;
      if (y < top + neck) continue;
      const rim = back && y === top + neck; // rolled top edge catches the light
      const f = rim ? 3 : y < top + 3 && FOLD[i] === 1 ? 2 : FOLD[i];
      l.set(cx + u, y, f === 3 ? P.bl3 : f === 2 ? P.bl2 : P.bl1);
    }
  }
  // a couple of rips
  const rip = ox + Math.round(sway * 0.6);
  l.erase(rip - 6, hem - 7).erase(rip - 6, hem - 6).erase(rip + 5, hem - 10).erase(rip + 6, hem - 9);
  return l;
}

/** One armoured leg: thigh, knee cop, greave and a pointed sabaton (toe toward the facing side). */
function legLayer(hip: Pt, footX: number, footBottom: number): Px {
  const l = new Px(W, H);
  const ankle: Pt = [footX, footBottom - 3];
  const knee = joint(hip, ankle, 8, 8, 1); // knees bend toward the facing side
  limb(l, hip, knee, 5, P.sl2);
  limb(l, knee, ankle, 5, P.sl2);
  l.hline(footX - 2, footBottom - 2, 5, P.sl2);
  l.hline(footX - 2, footBottom - 1, 6, P.sl2);
  l.hline(footX - 2, footBottom, 7, P.sl2);
  bevel(l, P.sl3, P.sl1);
  const kx = Math.round(knee[0]);
  const ky = Math.round(knee[1]);
  l.rect(kx - 2, ky - 1, 5, 3, P.sl3);
  l.hline(kx - 2, ky - 1, 3, P.sl4);
  l.hline(kx - 1, ky + 1, 4, P.sl1);
  return l;
}

/** Breastplate (or back plate), belt and the armoured skirt over the hips. */
function torsoLayer(ox: number, oy: number, back: boolean, hot: boolean): Px {
  const l = new Px(W, H);
  const e = ember(hot);
  const y = (row: number): number => row + oy;
  stack(l, ox, y(19), [13, 17, 17, 17, 17, 17, 15, 15, 15, 13, 13, 13, 15, 15, 17, 17], P.sl2);
  // two hanging hip plates with a gap between them
  l.rect(ox - 8, y(35), 7, 3, P.sl2).rect(ox + 2, y(35), 7, 3, P.sl2);
  l.hline(ox - 7, y(38), 5, P.sl2).hline(ox + 3, y(38), 5, P.sl2);
  bevel(l, P.sl3, P.sl1);

  // belt with an ember set in the buckle
  l.rect(ox - 7, y(31), 15, 2, P.sl1);
  run(l, ox - 1, y(31), [P.sl4, e.hi, P.sl3]);
  run(l, ox - 1, y(32), [P.sl3, e.lo, P.sl2]);
  l.hline(ox - 7, y(33), 15, P.sl3); // top lip of the skirt catches the light
  l.hline(ox - 7, y(35), 5, P.sl1).hline(ox + 3, y(35), 5, P.sl1); // seam above the hip plates

  const paint = (pts: ReadonlyArray<Pt>, c: string): void => {
    for (const q of pts) l.set(ox + q[0], y(q[1]), c);
  };
  if (!back) {
    // plate seams and a lit upper-left chest
    l.hline(ox - 6, y(25), 13, P.sl1);
    l.hline(ox - 5, y(28), 11, P.sl1);
    l.hline(ox - 6, y(21), 4, P.sl3).hline(ox - 6, y(22), 3, P.sl3);
    l.set(ox - 6, y(21), P.sl4).set(ox - 5, y(21), P.sl4);
    // the great glowing crack: shoulder to hip, with one short fork
    paint([[-4, 21], [-3, 22], [-2, 24], [-1, 25], [0, 27], [1, 28], [2, 29], [3, 30], [2, 25], [3, 24]], e.lo);
    paint([[-2, 23], [0, 26], [1, 26], [2, 30]], e.hi);
  } else {
    // spine ridge and cracks over the shoulder blades (the cape hides the rest)
    l.vline(ox, y(20), 11, P.sl1);
    l.vline(ox - 1, y(20), 11, P.sl3);
    paint([[-5, 21], [-4, 22], [-3, 24], [3, 21], [4, 22], [3, 24]], e.lo);
    paint([[-3, 23], [4, 23]], e.hi);
  }
  return l;
}

/** A ragged strip of crimson cloth hanging from the belt (front view only). */
function tabardLayer(ox: number, oy: number, sway: number): Px {
  const l = new Px(W, H);
  const len = [9, 11, 10, 8, 10];
  const col = [P.bl3, P.bl3, P.bl2, P.bl2, P.bl1];
  for (let i = 0; i < 5; i++) {
    for (let k = 0; k < len[i]; k++) l.set(ox - 2 + i + Math.round((sway * k) / 10), 33 + oy + k, col[i]);
  }
  return l;
}

/** Curved iron horns on both sides of the helm. (hx, t) = helm centre column and top row. */
function horns(l: Px, hx: number, t: number): void {
  const shape: ReadonlyArray<readonly [number, number, string, string]> = [
    // dx, dy, colour on the lit (left) horn, colour on the right horn
    [7, 3, P.sl2, P.sl1],
    [7, 2, P.sl3, P.sl2],
    [8, 2, P.sl3, P.sl2],
    [8, 1, P.sl3, P.sl2],
    [9, 1, P.sl4, P.sl3],
    [8, 0, P.sl3, P.sl2],
    [9, 0, P.sl4, P.sl3],
    [9, -1, P.sl4, P.sl3],
    [8, -2, P.sl5, P.sl4],
  ];
  for (const s of shape) {
    l.set(hx - s[0], t + s[1], s[2]);
    l.set(hx + s[0], t + s[1], s[3]);
  }
}

/** Open-faced helm with the skull inside, turned slightly toward the facing side. */
function helmFront(hx: number, t: number, hot: boolean): Px {
  const l = new Px(W, H);
  stack(l, hx, t, [7, 9, 11, 13, 13, 13, 13, 13, 13, 13, 13], P.sl2);
  bevel(l, P.sl3, P.sl1);
  l.hline(hx - 6, t + 3, 13, P.sl3); // brow band
  l.hline(hx + 4, t + 3, 3, P.sl2);
  run(l, hx - 5, t + 3, [P.sl4, P.sl4, P.sl4]);
  l.set(hx - 3, t, P.sl4).set(hx - 2, t, P.sl4).set(hx - 4, t + 1, P.sl4).set(hx - 5, t + 2, P.sl4);
  l.vline(hx - 4, t + 4, 7, P.sl1); // shadow inside the left cheek guard

  // the skull: ember eyes burning in dark sockets, looking toward the facing side
  const b1 = P.bn1;
  const b2 = P.bn2;
  const b3 = P.bn3;
  const b4 = P.bn4;
  const k = P.ink;
  const e1 = P.fr5;
  const e2 = hot ? P.fr6 : P.fr5; // the eyes flare with the embers
  const e3 = hot ? P.fr5 : P.fr4;
  run(l, hx - 3, t + 4, [b3, b4, b4, b4, b4, b3, b3, b3, b2]);
  run(l, hx - 3, t + 5, [b3, k, k, k, b3, k, k, k, b2]);
  run(l, hx - 3, t + 6, [b3, k, e1, e2, b3, k, e1, e2, b2]);
  run(l, hx - 3, t + 7, [b3, k, e3, e1, b2, k, e3, e1, b2]);
  run(l, hx - 3, t + 8, [b3, b3, b3, b3, k, b3, b3, b2, b2]);
  run(l, hx - 3, t + 9, [b2, b4, b1, b4, b1, b4, b1, b4, b2]);
  run(l, hx - 3, t + 10, [P.sl1, b2, b3, b3, b3, b3, b2, b2, P.sl1]);
  run(l, hx - 1, t + 11, [b2, b2, b2, b2, b1]);
  horns(l, hx, t);
  return l;
}

/** The helm from behind: a full dome with a neck guard, and a sliver of ember light at the facing-side edge. */
function helmBack(hx: number, t: number, hot: boolean): Px {
  const l = new Px(W, H);
  stack(l, hx, t, [7, 9, 11, 13, 13, 13, 13, 13, 13, 13, 13, 11], P.sl2);
  bevel(l, P.sl3, P.sl1);
  l.set(hx - 3, t, P.sl4).set(hx - 2, t, P.sl4).set(hx - 4, t + 1, P.sl4).set(hx - 5, t + 2, P.sl4);
  l.vline(hx - 1, t + 1, 8, P.sl3); // crest ridge
  l.vline(hx, t + 1, 8, P.sl1);
  l.hline(hx - 5, t + 9, 11, P.sl1); // seam above the flared neck guard
  l.hline(hx - 5, t + 10, 8, P.sl3);
  // he is looking away to the right: a glint of the eye and the edge of the jaw
  l.set(hx + 6, t + 6, hot ? P.fr6 : P.fr5).set(hx + 6, t + 7, hot ? P.fr4 : P.fr3);
  l.set(hx + 6, t + 8, P.bn2).set(hx + 6, t + 9, P.bn1);
  horns(l, hx, t);
  return l;
}

/** One arm in plate: shoulder -> elbow -> hand. `bend` is the way the elbow points (-1 screen-left, +1 screen-right). */
function armLayer(shoulder: Pt, hand: Pt, bend: number, bone: number): Px {
  const l = new Px(W, H);
  const elbow = joint(shoulder, hand, bone, bone, bend);
  limb(l, shoulder, elbow, 4, P.sl2);
  limb(l, elbow, hand, 4, P.sl2);
  bevel(l, P.sl3, P.sl1);
  const ex = Math.round(elbow[0]);
  const ey = Math.round(elbow[1]);
  l.rect(ex - 1, ey - 1, 2, 2, P.sl3); // elbow cop
  l.set(ex - 1, ey - 1, P.sl4);
  return l;
}

/** A gauntleted fist: brighter than the rest of the armour so the hands always read. */
function fistLayer(hand: Pt): Px {
  const l = new Px(W, H);
  const x = Math.round(hand[0]);
  const y = Math.round(hand[1]);
  l.rect(x - 2, y - 2, 4, 4, P.sl3);
  bevel(l, P.sl4, P.sl2);
  return l;
}

/** A spiked shoulder plate centred on the shoulder joint. The one nearer the camera is bigger. */
function pauldronLayer(s: Pt, big: boolean, out: number, hot: boolean): Px {
  const l = new Px(W, H);
  const e = ember(hot);
  const sx = Math.round(s[0]);
  const sy = Math.round(s[1]);
  if (big) {
    stack(l, sx, sy - 4, [6, 8, 10, 10, 10, 10, 8], P.sl2);
  } else {
    stack(l, sx, sy - 3, [4, 6, 8, 8, 8, 6], P.sl2);
  }
  const top = big ? sy - 4 : sy - 3;
  const k = out > 0 ? sx : sx - 2; // spike leans outward
  const tip = out > 0 ? k + 1 : k;
  l.hline(k, top - 1, 2, P.sl2).set(tip, top - 2, P.sl2);
  bevel(l, P.sl3, P.sl1);
  // edge highlights on the upper-left curve, a raised rim near the bottom
  if (big) {
    l.hline(sx - 3, sy - 4, 3, P.sl4).set(sx - 4, sy - 3, P.sl4).set(sx - 5, sy - 2, P.sl4);
    l.hline(sx - 4, sy + 1, 7, P.sl3);
    l.set(sx, sy - 2, e.lo).set(sx + 1, sy - 1, e.hi).set(sx + 1, sy, e.lo); // a small crack
  } else {
    l.hline(sx - 2, sy - 3, 2, P.sl4).set(sx - 3, sy - 2, P.sl4);
    l.hline(sx - 3, sy + 1, 5, P.sl3);
  }
  l.set(tip, top - 2, P.sl4);
  return l;
}

/** Shortest distance from (u, v) to a zig-zag line through `pts`. */
function distToPath(u: number, v: number, pts: ReadonlyArray<Pt>): number {
  let best = Infinity;
  for (let i = 0; i + 1 < pts.length; i++) {
    const ax = pts[i][0];
    const ay = pts[i][1];
    const dx = pts[i + 1][0] - ax;
    const dy = pts[i + 1][1] - ay;
    const t = Math.max(0, Math.min(1, ((u - ax) * dx + (v - ay) * dy) / (dx * dx + dy * dy)));
    best = Math.min(best, Math.hypot(u - ax - t * dx, v - ay - t * dy));
  }
  return best;
}

/** The crack across the maul head, in the head's own coordinates (u along its length, v along the shaft). */
const MAUL_CRACK: ReadonlyArray<Pt> = [[-3.4, -1.6], [-1.3, 0.7], [0.7, -0.9], [3.3, 1.5]];

/** Unit shaft direction and snapped head centre. Upright or level shafts are snapped so the head is a clean block. */
function maulGeometry(head: Pt, dir: Pt): { c: Pt; dx: number; dy: number } {
  const len = Math.hypot(dir[0], dir[1]);
  const dx = dir[0] / len;
  const dy = dir[1] / len;
  let cx = head[0];
  let cy = head[1];
  if (Math.abs(dx) < 0.01) {
    cx = Math.round(cx); // 14 columns centred on the 2 px shaft
    cy = Math.floor(cy) + 0.5; // 7 rows
  } else if (Math.abs(dy) < 0.01) {
    cx = Math.floor(cx) + 0.5;
    cy = Math.round(cy);
  }
  return { c: [cx, cy], dx, dy };
}

/** The maul: a long wooden shaft and a huge banded iron head split by a glowing crack. */
function maulLayer(headAt: Pt, dir: Pt, shaft: number, hot: boolean): Px {
  const l = new Px(W, H);
  const { c, dx, dy } = maulGeometry(headAt, dir);
  // shaft: two parallel lines straddling the centre line, the upper/left one lit
  const bx = c[0] - dx * shaft;
  const by = c[1] - dy * shaft;
  const seg = (ox: number, oy: number, col: string): void => {
    l.line(Math.floor(bx + ox), Math.floor(by + oy), Math.floor(c[0] + ox), Math.floor(c[1] + oy), col);
  };
  if (Math.abs(dy) >= Math.abs(dx)) {
    seg(-0.5, 0, P.wd5);
    seg(0.5, 0, P.wd3);
  } else {
    seg(0, -0.5, P.wd5);
    seg(0, 0.5, P.wd3);
  }
  // iron pommel on the butt end
  l.rect(Math.floor(bx) - 1, Math.floor(by) - 1, 3, 3, P.sl3);
  l.set(Math.floor(bx) - 1, Math.floor(by) - 1, P.sl4).set(Math.floor(bx) + 1, Math.floor(by) + 1, P.sl1);

  // head: a block turned to match the shaft, painted in its own (u, v) coordinates
  const head = new Px(W, H);
  const local = (x: number, y: number): Pt => {
    const rx = x + 0.5 - c[0];
    const ry = y + 0.5 - c[1];
    return [-rx * dy + ry * dx, rx * dx + ry * dy];
  };
  const x0 = Math.floor(c[0] - 10);
  const y0 = Math.floor(c[1] - 10);
  for (let y = y0; y <= y0 + 20; y++) {
    for (let x = x0; x <= x0 + 20; x++) {
      const [u, v] = local(x, y);
      if (Math.abs(u) >= HEAD_LEN / 2 || Math.abs(v) >= HEAD_THICK / 2) continue;
      const au = Math.abs(u);
      head.set(x, y, au >= 4 && au < 5.5 ? P.sl3 : P.sl2); // iron bands near both striking faces
    }
  }
  bevel(head, P.sl4, P.sl1);
  for (let y = y0; y <= y0 + 20; y++) {
    for (let x = x0; x <= x0 + 20; x++) {
      if (!head.has(x, y)) continue;
      const [u, v] = local(x, y);
      const d = distToPath(u, v, MAUL_CRACK);
      if (hot) {
        // white-hot: the crack blazes and the iron around it glows
        if (d < 0.75) head.set(x, y, P.fr6);
        else if (d < 1.5) head.set(x, y, P.fr4);
        else if (d < 2.1 && Math.abs(v) < 2.5) head.set(x, y, P.fr2);
      } else if (d < 0.62) {
        head.set(x, y, Math.abs(u) < 1.6 ? P.fr4 : P.fr3);
      }
    }
  }
  stamp(l, head);
  return l;
}

/** Draw one frame of the Warden. */
function wardenFrame(pose: Pose, back: boolean): Sprite {
  const p = new Px(W, H);
  const hold = back ? pose.back : pose.front;
  const ox = AX + pose.lean;
  const oy = pose.bob;
  const hot = pose.hot;

  // Which screen side is nearer the camera: his left side when he faces us, his right side from behind.
  // The nearer shoulder and foot sit 1 px lower on screen.
  const nearIsLeft = !back;
  const shL: Pt = [ox - 9, (nearIsLeft ? 21 : 20) + oy];
  const shR: Pt = [ox + 9, (nearIsLeft ? 20 : 21) + oy];
  const place = (q: Pt): Pt => [ox + q[0], q[1] + oy];
  const handL = place(hold.handL);
  const handR = place(hold.handR);
  const maulAt = hold.planted ? hold.head : place(hold.head);
  const hx = ox + (back ? 0 : 1) + Math.round(pose.lean * 0.4); // the head leads the lean
  const ht = 7 + oy + (pose.lean >= 3 ? 1 : 0);

  const leg = (side: -1 | 1, f: Pt): Px => {
    const near = (side === -1) === nearIsLeft;
    // A step toward the facing side goes down the screen when he faces us, up the screen from behind.
    const rise = Math.round(f[0] / 3) * (back ? -1 : 1);
    return legLayer([ox + side * 4, 35 + oy], AX + side * 5 + f[0], (near ? 53 : 52) + rise - f[1]);
  };
  const legs = (): void => {
    stamp(p, nearIsLeft ? leg(1, pose.footR) : leg(-1, pose.footL)); // far leg first
    stamp(p, nearIsLeft ? leg(-1, pose.footL) : leg(1, pose.footR));
  };
  const maul = (): void => {
    stamp(p, maulLayer(maulAt, hold.dir, hold.shaft, hot));
    if (!hot) return;
    const c = maulGeometry(maulAt, hold.dir).c;
    hold.sparks.forEach((s, i) => p.set(c[0] + s[0], c[1] + s[1], i % 2 === 0 ? P.fr5 : P.fr4));
  };
  const arms = (): void => {
    const l = armLayer(shL, handL, hold.elbowL, hold.armLen);
    const r = armLayer(shR, handR, hold.elbowR, hold.armLen);
    stamp(p, nearIsLeft ? r : l); // far arm first
    stamp(p, nearIsLeft ? l : r);
  };
  const fists = (): void => {
    stamp(p, fistLayer(nearIsLeft ? handR : handL));
    stamp(p, fistLayer(nearIsLeft ? handL : handR));
  };
  const pauldrons = (): void => {
    const l = pauldronLayer(shL, nearIsLeft, -1, hot);
    const r = pauldronLayer(shR, !nearIsLeft, 1, hot);
    stamp(p, nearIsLeft ? r : l);
    stamp(p, nearIsLeft ? l : r);
  };

  if (!back) {
    // facing the camera: cape behind everything, arms and maul in front of the body
    stamp(p, capeLayer(ox, 20 + oy, pose.cape, false));
    if (!hold.over) maul();
    legs();
    stamp(p, torsoLayer(ox, oy, false, hot));
    stamp(p, tabardLayer(ox, oy, pose.cape));
    stamp(p, helmFront(hx, ht, hot));
    arms();
    if (hold.over) maul();
    fists();
    pauldrons();
  } else {
    // facing away: arms and maul are beyond the body, the cape hangs over the back
    if (!hold.over) maul();
    arms();
    if (!hold.over) fists();
    legs();
    stamp(p, torsoLayer(ox, oy, true, hot));
    stamp(p, capeLayer(ox, 20 + oy, pose.cape, true));
    stamp(p, helmBack(hx, ht, hot));
    pauldrons();
    if (hold.over) {
      maul();
      fists();
    }
  }

  p.outline(P.ink);
  return p.sprite(AX, AY);
}

// ----- Warden poses ---------------------------------------------------------------------------

/**
 * Carrying pose (idle and walk): the maul stands head-down on the floor at his screen-left side
 * like a huge walking staff, gripped in one fist; the other fist swings free.
 * `swing` moves the free hand, `lift` raises the maul off the floor between steps.
 */
function carry(bob: number, lean: number, footL: Pt, footR: Pt, swing: number, cape: number, lift: number): Pose {
  const hold = (floorRow: number): Hold => ({
    handL: [-14 - lean, 34], // stays on the shaft even when the body leans
    handR: [10 + swing, 34],
    elbowL: 1, // tucked in, so the forearm reaches out to the shaft
    elbowR: 1,
    armLen: 8,
    head: [10, floorRow - 3 - lift],
    planted: true,
    dir: [0, 1],
    shaft: 26,
    over: true,
    sparks: [],
  });
  // The maul stands on his screen-left: the near side (lower on screen) from the front, the far side from behind.
  return { bob, lean, footL, footR, cape, hot: false, front: hold(53), back: hold(52) };
}

const IDLE: ReadonlyArray<Pose> = [
  carry(0, 0, [0, 0], [0, 0], 0, 0, 0),
  carry(1, 0, [0, 0], [0, 0], 0, 0, 0), // slow heave
];

const WALK: ReadonlyArray<Pose> = [
  carry(1, 1, [4, 0], [-4, 1], 2, -1, 0), // left foot lands, weight drops, maul thumps down
  carry(0, 1, [0, 0], [0, 2], 0, -2, 2), // right foot swings through
  carry(1, 1, [-4, 1], [4, 0], -2, -1, 0), // right foot lands
  carry(0, 1, [0, 2], [0, 0], 0, 0, 2), // left foot swings through
];

/** Attack frame 1: braced, maul hoisted straight up over the helm, embers flaring. This is the player's warning. */
const WINDUP: Pose = (() => {
  const hold = (over: boolean): Hold => ({
    handL: [-2, 7],
    handR: [2, 8],
    elbowL: -1,
    elbowR: 1,
    armLen: 9, // elbows flare wide so the raised arms frame the helm
    head: [0, 0.5],
    planted: false,
    dir: [0, -1],
    shaft: 8,
    over,
    sparks: [[-10, 1], [-9, -2], [9, -2], [10, 1]],
  });
  // Raised overhead the maul tips away from wherever he is facing: behind the helm from the front, over it from behind.
  return { bob: 4, lean: -1, footL: [-3, 0], footR: [3, 0], cape: 1, hot: true, front: hold(false), back: hold(true) };
})();

/**
 * Attack frame 2: the maul slammed into the floor in front of him, still blazing.
 * From the front it lands low on the right with the shaft slanting up to his hands. From behind,
 * "in front" is further up the screen, so it stands almost upright beyond his right side.
 */
const STRIKE: Pose = {
  bob: 3,
  lean: 3,
  footL: [-3, 0],
  footR: [4, 0],
  cape: -3,
  hot: true,
  front: {
    handL: [3, 27.4],
    handR: [4.7, 31],
    elbowL: -1,
    elbowR: 1,
    armLen: 8,
    head: [11, 43.5],
    planted: false,
    dir: [1, 2],
    shaft: 20,
    over: true,
    sparks: [[-10, 3], [7, -9], [-9, -7], [8, -5]],
  },
  back: {
    handL: [12, 30],
    handR: [12, 27],
    elbowL: -1,
    elbowR: 1,
    armLen: 5.5,
    head: [12, 38.5],
    planted: false,
    dir: [0, 1],
    shaft: 14,
    over: false,
    sparks: [[6, -6], [7, -2], [4, -9], [-8, -5]],
  },
};

/** Attack frame 3: hauling the maul back up off the floor. */
const RECOVER: Pose = {
  bob: 2,
  lean: 1,
  footL: [-2, 0],
  footR: [3, 0],
  cape: -2,
  hot: false,
  front: {
    handL: [2, 26.5],
    handR: [5, 30],
    elbowL: -1,
    elbowR: 1,
    armLen: 8,
    head: [12.5, 37],
    planted: false,
    dir: [1, 1],
    shaft: 17,
    over: true,
    sparks: [],
  },
  back: {
    handL: [14, 28],
    handR: [14, 25],
    elbowL: -1,
    elbowR: 1,
    armLen: 5.5,
    head: [14, 34.5],
    planted: false,
    dir: [0, 1],
    shaft: 13,
    over: false,
    sparks: [],
  },
};

const ATTACK: ReadonlyArray<Pose> = [WINDUP, STRIKE, RECOVER];

/** Art for the dungeon boss, "the Warden". Every frame is 48x56 with the anchor at (24, 52). */
export function makeBossArt(): ActorArt {
  const set = (back: boolean): AnimSet => ({
    idle: IDLE.map((q) => wardenFrame(q, back)),
    walk: WALK.map((q) => wardenFrame(q, back)),
    attack: ATTACK.map((q) => wardenFrame(q, back)),
  });
  return { front: set(false), back: set(true) };
}

// ---------------------------------------------------------------------------------------------
// TOWN CHARACTERS: they stand still in the hub and face the camera. 24x32, anchor (12, 29).

export interface NpcArt {
  /** 2 idle frames. */
  merchant: Sprite[];
  /** 2 idle frames. */
  wordsmith: Sprite[];
}

const NW = 24;
const NH = 32;
const NAX = 12;
const NAY = 29;

/** Two planted boots. The body is drawn over their tops. */
function boots(p: Px): void {
  for (const x of [7, 13]) {
    p.rect(x, 27, 4, 3, P.wd2);
    p.hline(x, 27, 2, P.wd3);
    p.hline(x, 29, 4, P.wd1);
  }
}

/** The merchant: a hooded travelling trader under a huge pack and bedroll, holding out a lantern. `b` = bob in pixels. */
function merchantFrame(b: number): Sprite {
  const p = new Px(NW, NH);
  boots(p);
  const u = new Px(NW, NH); // everything above the boots, drawn at rest and then shifted by the bob

  // backpack, wider than his shoulders
  u.rect(4, 8, 16, 11, P.er3);
  u.rect(4, 8, 2, 11, P.er4);
  u.rect(18, 8, 2, 11, P.er2);
  u.hline(4, 18, 16, P.er2);
  u.hline(4, 13, 2, P.er2); // side pocket flap
  // a tin cup hanging off the pack
  u.rect(20, 11, 2, 3, P.sl3).set(20, 11, P.sl4).set(21, 13, P.sl2);

  // bedroll strapped on top
  u.hline(4, 3, 16, P.bn3);
  u.rect(3, 4, 18, 3, P.bn2);
  u.hline(3, 4, 18, P.bn3);
  u.hline(4, 3, 7, P.bn4);
  u.hline(4, 7, 16, P.bn1);
  u.vline(20, 4, 3, P.bn1);
  u.vline(7, 3, 5, P.wd2).vline(16, 3, 5, P.wd2);

  // cloak: shoulders, then a wider drape to the shins
  u.rect(6, 16, 12, 3, P.wd3);
  u.rect(5, 19, 14, 8, P.wd3);
  u.vline(6, 16, 3, P.wd4).vline(5, 19, 8, P.wd4).hline(6, 16, 5, P.wd4);
  u.vline(17, 16, 3, P.wd2).vline(18, 19, 8, P.wd2);
  u.vline(8, 20, 6, P.wd4); // a lit fold
  u.vline(15, 19, 7, P.wd2); // a shadowed fold
  u.vline(8, 16, 3, P.er2).vline(15, 16, 3, P.er2); // pack straps over the shoulders
  // the cloak hangs open over a dark tunic and a belt with a fat coin pouch
  u.rect(10, 17, 4, 10, P.er2);
  u.hline(10, 21, 4, P.wd1);
  u.hline(11, 21, 2, P.gd3);
  u.rect(13, 22, 3, 3, P.wd5).set(13, 22, P.gd3).set(14, 22, P.gd4).set(15, 24, P.wd4);
  // gold-stitched hem
  for (let x = 5; x <= 18; x++) if (x < 10 || x > 13) u.set(x, 26, x % 2 === 0 ? P.gd3 : P.gd2);

  // hood
  u.hline(9, 8, 6, P.wd4);
  u.hline(8, 9, 8, P.wd4);
  u.rect(7, 10, 10, 5, P.wd4);
  u.hline(8, 15, 8, P.wd3);
  u.hline(9, 8, 3, P.wd5).hline(8, 9, 2, P.wd5).vline(7, 10, 3, P.wd5);
  u.vline(16, 10, 5, P.wd3).set(15, 9, P.wd3).set(14, 8, P.wd3);
  // friendly face in the hood's shadow
  u.hline(9, 10, 6, P.wd2);
  run(u, 9, 11, [P.sk3, P.sk4, P.sk4, P.sk3, P.sk3, P.sk2]);
  run(u, 9, 12, [P.sk3, P.ink, P.sk4, P.sk3, P.ink, P.sk2]);
  run(u, 9, 13, [P.sk3, P.sk4, P.sk3, P.sk3, P.sk3, P.sk2]);
  run(u, 9, 14, [P.sk2, P.sk3, P.sk1, P.sk1, P.sk3, P.sk2]);
  u.hline(11, 15, 2, P.gd3).set(11, 15, P.gd4); // cloak clasp

  // arm held out with a lit lantern
  u.rect(17, 17, 3, 2, P.wd4).hline(17, 18, 3, P.wd3);
  u.rect(20, 17, 2, 2, P.sk3).set(21, 18, P.sk2);
  u.hline(20, 19, 2, P.gd2);
  u.hline(19, 20, 4, P.gd3).set(19, 20, P.gd4);
  run(u, 19, 21, [P.gd2, P.fr6, P.fr5, P.gd1]);
  run(u, 19, 22, [P.gd2, P.fr5, P.fr4, P.gd1]);
  run(u, 19, 23, [P.gd2, P.fr5, P.fr4, P.gd1]);
  u.hline(19, 24, 4, P.gd2).set(22, 24, P.gd1);

  p.blit(u, 0, b);
  p.outline(P.ink);
  return p.sprite(NAX, NAY);
}

/** The glowing power-word glyph (5x6) that floats over the wordsmith's open hand. */
function glyph(p: Px, x: number, y: number): void {
  const t = P.tl5;
  const s = P.tl4;
  run(p, x, y, [s, null, t, null, s]);
  run(p, x, y + 1, [t, null, t, null, t]);
  run(p, x, y + 2, [null, t, t, t, null]);
  run(p, x, y + 3, [null, null, t, null, null]);
  run(p, x, y + 4, [null, null, t, null, null]);
  run(p, x, y + 5, [null, null, s, null, null]);
}

/** The wordsmith: an old bearded scribe-smith in a leather apron, with a rune-hammer and a floating glyph. `b` = bob in pixels. */
function wordsmithFrame(b: number): Sprite {
  const p = new Px(NW, NH);
  // legs and boots stay planted
  for (const x of [8, 13]) p.rect(x, 24, 3, 3, P.er3).vline(x, 24, 3, P.er4);
  boots(p);
  const u = new Px(NW, NH);

  // shirt
  u.rect(6, 13, 12, 5, P.tl2);
  u.rect(7, 18, 10, 6, P.tl2);
  u.hline(6, 13, 6, P.tl3);
  u.vline(17, 13, 5, P.tl1);
  // leather apron: bib, straps, waist tie, skirt with a tool pocket
  u.rect(9, 15, 6, 3, P.wd3);
  u.vline(9, 13, 2, P.wd2).vline(14, 13, 2, P.wd2);
  u.hline(7, 18, 10, P.wd2);
  u.rect(7, 19, 10, 7, P.wd3);
  u.rect(7, 19, 2, 7, P.wd4);
  u.vline(16, 19, 7, P.wd2);
  u.hline(7, 25, 10, P.wd2);
  u.hline(11, 21, 4, P.wd2).vline(11, 22, 2, P.wd2).vline(14, 22, 2, P.wd2);
  u.vline(13, 19, 2, P.sl4).set(13, 20, P.sl3); // chisel in the pocket
  u.set(9, 23, P.wd1).set(10, 24, P.wd1); // scorch marks

  // bald head
  u.hline(10, 5, 4, P.sk4);
  u.hline(9, 6, 6, P.sk3).hline(9, 6, 3, P.sk4);
  u.rect(8, 7, 8, 4, P.sk3);
  u.vline(15, 7, 4, P.sk2);
  u.vline(7, 7, 3, P.bn4).vline(16, 7, 3, P.bn3); // tufts of hair over the ears
  u.hline(9, 8, 2, P.bn4).hline(13, 8, 2, P.bn4); // bushy brows
  u.set(10, 9, P.ink).set(13, 9, P.ink);
  u.set(11, 10, P.sk4).set(12, 10, P.sk2); // nose
  // big white beard
  u.hline(8, 10, 3, P.bn4).hline(13, 10, 3, P.bn4);
  u.rect(8, 11, 8, 3, P.bn4);
  u.rect(9, 14, 6, 2, P.bn4);
  u.hline(10, 16, 4, P.bn4);
  u.hline(11, 17, 2, P.bn3);
  u.hline(11, 11, 2, P.bn2); // mouth, lost in the moustache
  u.vline(15, 10, 4, P.bn3).vline(14, 14, 2, P.bn3).set(13, 16, P.bn3);
  u.set(9, 13, P.bn3).set(12, 14, P.bn3).set(10, 15, P.bn3).set(12, 12, P.bn3);

  // hammer arm (screen-left): sleeve, rolled cuff, fist around the handle
  u.rect(5, 14, 2, 3, P.tl2).vline(5, 14, 3, P.tl3);
  u.hline(4, 17, 3, P.tl3);
  u.vline(3, 13, 10, P.wd4).vline(4, 13, 10, P.wd2); // hammer handle
  u.rect(2, 18, 4, 2, P.sk3).set(2, 18, P.sk4).hline(3, 19, 3, P.sk2);
  // hammer head with a glowing rune cut into its face
  u.rect(1, 8, 7, 5, P.sl3);
  u.hline(1, 8, 4, P.sl4).vline(1, 8, 2, P.sl4);
  u.vline(7, 9, 4, P.sl1).hline(2, 12, 6, P.sl1).set(1, 12, P.sl2);
  u.rect(2, 9, 5, 3, P.tl1);
  run(u, 2, 9, [P.tl5, null, P.tl5, null, P.tl5]);
  run(u, 2, 10, [null, P.tl4, P.tl5, P.tl4, null]);
  run(u, 2, 11, [null, null, P.tl5, null, null]);

  // open hand (screen-right) raised under the floating glyph
  u.rect(17, 14, 2, 3, P.tl2).vline(18, 14, 3, P.tl1);
  u.hline(18, 13, 2, P.tl3);
  u.rect(19, 11, 2, 2, P.sk3).set(19, 11, P.sk4).set(21, 11, P.sk3).set(20, 12, P.sk2);

  p.blit(u, 0, b);
  glyph(p, 17, 4 - b); // the glyph drifts up as he breathes out
  p.outline(P.ink);
  return p.sprite(NAX, NAY);
}

/** Art for the two characters in the safe hub. */
export function makeNpcArt(): NpcArt {
  return {
    merchant: [merchantFrame(0), merchantFrame(1)],
    wordsmith: [wordsmithFrame(0), wordsmithFrame(1)],
  };
}
