// The ranger: the owner's pick from ten designs (number 1, the Feather-cap Scout). A mask across
// the eyes, a soft teal cap that sags to one side with a long glowing feather in it, a green
// jerkin with a hem cut into points, a pink neckerchief, a short teal cape, a quiver, and a bow.
//
// Painted with the kit at twice the grain of the first builds' art. Every frame faces
// screen-right: `front` toward the camera (down-right), `back` away from it (up-right).
//
// SEEN FROM A CORNER (Version 14.5; the kit's "Turned to the grid", and the knight's header). The
// scout was slim already; what is new is that the jerkin, its belt and its hem lean along the grid
// (up to the right when the chest is seen, down to the right when the back is), the buckle, the
// knot of the neckerchief and the eyes are toward the side faced, the nearer shoulder is lower and
// the further one higher, the feet point along the grid and a step goes along it, and from behind
// the cape and the quiver lean with the back they hang on. The bow is in front of the scout on the
// side faced in both views, as it was (a bow hung on the far side of someone seen from behind
// would be hidden by them): at rest its belly leans the way the scout faces.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { TailDef, TailRoot } from '../engine/tails';
import type { ActorArt } from './actor_types';
import {
  CYAN, GLINT, HI, INDIGO, INK, KAY, KX, LEAF, LO, MAIL, PINK, PLUM, SKIN4, STEEL, TEAL, TURN,
  animSet, arm, ball, compose, dim, fist, footOf, inEllipse, joint, layer, leg, limb, lit, runPoses, shear, slant, stamp,
} from './kit';
import type { Timeline } from './clip';
import type { LegStyle, Moves, Painted, Pose, Ramp, V } from './kit';
import { RANGER2_TAILS } from './reimagined';

// --- how the scout is built, in pixels ---------------------------------------------------------
const BODY = 45;
const HIP = 23;
const BELT = 31;
const CHEST = 6.5;
const WAIST = 5;
const HEAD = 6;
const ARM = 2.1;
const UPPER = 7;
const FORE = 7;
/** How far either shoulder is from the middle, and how far the nearer one is below it and the further one above. */
const SHOULDER = 6;
const NEAR_DROP = 2;
const FAR_RISE = 3;

const SKIN: Ramp = [SKIN4[0], SKIN4[1], SKIN4[2], SKIN4[3], SKIN4[3]];
const HOSE = MAIL;
const WOOD = INDIGO;
const STRING = CYAN[3];
const SHAFT = STEEL[3];
const LEGS: LegStyle = { w: 3, upper: HOSE, lower: PLUM, share: 0.42, cuff: true, knee: null, band: PLUM };

/** Half the bow's height, how deep it curves, and how far it leans from upright at rest. */
const BOW_H = 19;
const BOW_K = 5;

// ---------------------------------------------------------------------------------------------
// Parts

/**
 * A bow. (gx, gy) is the grip; `deg` turns it from upright (positive = the top leans to
 * screen-right); the belly bulges to screen-right. Returns its two tips.
 */
function bow(p: Px, gx: number, gy: number, deg: number): { top: V; bot: V } {
  const a = (deg * Math.PI) / 180;
  const ax = Math.sin(a);
  const ay = -Math.cos(a);
  const bx = Math.cos(a);
  const by = Math.sin(a);
  const upright = Math.abs(ay) >= Math.abs(ax);
  const at = (t: number): V => {
    const u = Math.abs(t);
    const off = -BOW_K * t * t + (u > 0.86 ? (u - 0.86) * 2.8 * BOW_K : 0);
    return [gx + ax * t * BOW_H + bx * off, gy + ay * t * BOW_H + by * off];
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
        if (u < 0.8) p.set(px + (upright ? 1 : 0), py + (upright ? 0 : 1), WOOD[u < 0.2 ? 1 : 2]);
      } else p.set(px, py, WOOD[u < 0.2 ? 2 : 4]);
    }
  }
  return { top: at(1), bot: at(-1) };
}

/** An arrow from its nock to its glowing head. */
function arrow(p: Px, from: V, to: V, lights: Light[]): void {
  p.line(from[0], from[1], to[0], to[1], SHAFT);
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  for (let k = 0; k < 3; k++) p.set(Math.round(to[0] - (dx / len) * k), Math.round(to[1] - (dy / len) * k), k === 0 ? '#ffffff' : CYAN[3]);
  for (let k = 0; k < 3; k++) p.set(Math.round(from[0] + (dx / len) * k), Math.round(from[1] + (dy / len) * k), CYAN[2]);
  lights.push({ x: to[0], y: to[1], r: 9, color: CYAN[3], a: 0.45 });
}

/** A quiver: a leather tube and three glowing fletchings above its mouth. `lean` slants it. */
function quiver(p: Px, qx: number, qy: number, h: number, lean: number): void {
  lit(p, PLUM, [1, 2], [1, 2], (l) => {
    for (let i = 0; i < h; i++) l.rect(qx + Math.round(i * lean), qy + i, 4, 1, INK);
  });
  for (let k = 0; k < 3; k++) {
    const ax = qx + k + (k === 2 ? 1 : 0) - Math.round(lean * 3);
    const ay = qy - 3 - (k === 1 ? 1 : 0);
    p.set(ax, ay, CYAN[4]).set(ax, ay + 1, CYAN[3]).set(ax, ay + 2, CYAN[2]);
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

/** The jerkin: chest to belt, then a skirt whose hem is cut into points. */
function jerkin(p: Px, X: number, sy: number, beltY: number, hipY: number, sway: number): void {
  lit(p, LEAF, HI, LO, (l) => {
    for (let y = beltY + 3; y <= hipY + 5; y++) {
      const drift = Math.round((sway * (y - beltY - 3)) / 8);
      for (let x = X - WAIST - 2; x < X + WAIST + 2; x++) {
        const tooth = (x - (X - WAIST - 2)) % 4;
        if (y > hipY + (tooth === 1 || tooth === 2 ? 5 : 2)) continue;
        l.set(x + drift, y, INK);
      }
    }
  });
  lit(p, LEAF, HI, [LO[0], LO[1] + 1], (l) => {
    for (let y = sy; y <= beltY - 1; y++) {
      const h = CHEST + (WAIST - CHEST) * ((y - sy) / Math.max(1, beltY - 1 - sy));
      l.rect(Math.round(X - h), y, Math.round(X + h) - Math.round(X - h), 1, INK);
    }
  });
}

/**
 * The feather in the cap. It is not painted in the frames: each frame says where its quill is
 * stuck in the cap, and it is moved and drawn every frame of the game (engine/tails.ts). It sweeps
 * up and back, springs when the scout moves, and glows.
 */
export const RANGER_TAILS: Record<string, TailDef> = {
  'r-feather': {
    n: 8, seg: 1.95, w0: 2.2, w1: 1.4, belly: 2.2, dark: CYAN[1], mid: CYAN[2], light: CYAN[3],
    rest: [[0.25, -1], [0.2, -1], [0, -1], [-0.45, -0.9], [-0.8, -0.6], [-1, -0.2], [-1, 0.3], [-0.8, 0.65]],
    stiff: 1, gravity: 40, wind: 90, flutter: 70, rate: 1.9, drag: 9,
    glow: { color: CYAN[3], r: 6, a: 0.4, at: 0.55 },
  },
  // (and what flies from the ranger reimagined, the Wind-runner: named by no frame while his switch,
  // REIMAGINED.ranger in art/reimagined.ts, is off, as it is)
  ...RANGER2_TAILS,
};

/**
 * The squirrel that lives under the scout's cloak: a red squirrel, the one warm thing in a
 * picture of cool colours, so it is seen at once. Each picture faces screen-right; '.' is empty.
 * T = tail, t = tail in shade, w = the pale tip of the tail, b = back, c = the pale chest and
 * paws, h = head, e = ear, o = eye, n = nose, f = foot.
 */
export const SQ: Readonly<Record<string, string>> = { T: '#e8743a', t: '#a8401e', w: '#ffd9a8', b: '#d05a26', c: '#ffe2bc', h: '#e8743a', e: '#7a2a14', o: '#0e0c24', n: '#3a1c40', f: '#7a2a14' };
export const SQ_SIT: readonly string[] = [
  '.wT......',
  'wTTT...e.',
  'TTtT..hhe',
  'Tt.t.hhoh',
  '.Tt.bhhhn',
  '.Ttbbbc..',
  '..tbbccf.',
  '..bbbbc..',
  '..ff.ff..',
];
/** The same, the tail flicked up and over. */
export const SQ_FLICK: readonly string[] = [
  '..wTT....',
  '.wTTT..e.',
  '.TTt..hhe',
  '.Tt..hhoh',
  '.Tt.bhhhn',
  '.Ttbbbc..',
  '..tbbccf.',
  '..bbbbc..',
  '..ff.ff..',
];
/** Running, stretched out. */
export const SQ_RUN: readonly string[] = [
  'wTT......e.',
  'TTTTtbbbhh.',
  '.TTtbbbbhon',
  '....b...c..',
  '...f.....f.',
];
/** Running, gathered up. */
export const SQ_BUNCH: readonly string[] = [
  '.wTT....e.',
  'TTTt.bbhh.',
  'TTtbbbbhon',
  '...bbbc...',
  '....ff....',
];

/** The squirrel, with its feet at (x, y). `face` is +1 for looking to screen-right, -1 for left. */
export function squirrel(p: Px, x: number, y: number, face: number, rows: readonly string[]): void {
  const w = rows[0].length;
  const h = rows.length;
  // (its feet are in the middle of the bottom row)
  const x0 = Math.round(x) - Math.floor(w / 2);
  const y0 = Math.round(y) - h + 1;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const c = SQ[rows[j].charAt(i)];
      if (c) p.set(face > 0 ? x0 + i : x0 + w - 1 - i, y0 + j, c);
    }
  }
}

/** The soft cap, sagging to screen-right. From behind it covers the whole head. */
function cap(p: Px, cx: number, cy: number, back: boolean): void {
  lit(p, TEAL, HI, LO, (l) => {
    l.ellipse(cx + 0.5, cy - HEAD + 1, HEAD + 2.2, 3.6, INK);
    l.ellipse(cx + 4, cy - HEAD + 2, HEAD - 1.5, 4.2, INK);
    if (back) l.ellipse(cx, cy - 1, HEAD + 0.6, HEAD - 0.5, INK);
  });
}

// ---------------------------------------------------------------------------------------------
// The rig

/** Where the squirrel is on its run round the shoulders, for a `pt` of 0..1. (dx, dy) are its feet, from the middle of the shoulders. */
interface SquirrelAt {
  dx: number;
  dy: number;
  face: number;
  rows: readonly string[];
  /** In front of the scout, or behind (where the body hides it). */
  front: boolean;
}
function squirrelAt(pt: number): SquirrelAt | null {
  // up from under the cloak behind one shoulder, a look round from on top of it, round behind the
  // neck to the other shoulder, a sit there with its tail going, back across the chest, a last
  // look, and down under the cloak again
  const legs: [number, number, number, number, number, number, number, 'sit' | 'run', boolean][] = [
    // from, to, x0, y0, x1, y1, face, what it is doing, in front
    // (it begins and ends wholly behind the scout, who is narrower seen from a corner than square-on)
    [0.0, 0.08, -1, 9, -11, -1, 1, 'sit', false],
    [0.08, 0.2, -10, -2, -10, -2, 1, 'sit', true],
    [0.2, 0.34, -9, -3, 9, -3, 1, 'run', false],
    [0.34, 0.56, 10, -2, 10, -2, -1, 'sit', true],
    [0.56, 0.74, 9, -1, -9, -1, -1, 'run', true],
    [0.74, 0.88, -10, -2, -10, -2, 1, 'sit', true],
    [0.88, 1.0, -11, -1, -1, 9, 1, 'sit', false],
  ];
  for (const [t0, t1, x0, y0, x1, y1, face, what, front] of legs) {
    if (pt < t0 || pt > t1) continue;
    const k = (pt - t0) / (t1 - t0);
    // across the chest it dips with the collar; at a run its legs gather and fling out by turns
    const dip = what === 'run' && front ? Math.sin(k * Math.PI) * 5 : 0;
    const stride = Math.floor(k * (t1 - t0) * 60) % 2 === 0;
    const rows = what === 'run' ? (stride ? SQ_RUN : SQ_BUNCH) : Math.floor(k * 5) % 2 === 1 && t1 - t0 > 0.1 ? SQ_FLICK : SQ_SIT;
    const hop = what === 'run' && !stride ? -1 : 0;
    return { dx: x0 + (x1 - x0) * k, dy: y0 + (y1 - y0) * k + dip + hop, face, rows, front };
  }
  return null;
}

/** How much lower the scout is on one knee than standing, in pixels. */
const KNEEL = 10;

/**
 * The legs of a scout who is going down on one knee, or is down (`k`: 0 standing, 1 down). The
 * owner, 6 Oct 2026: "The rogue drops to a knee when he fires Volley". The knee on the side of the
 * hand that draws goes to the floor and its shin lies back along it, toes down; the other foot is
 * planted a step ahead with its knee up in front. Ahead is down the screen and to the right when
 * the scout faces us, up it and to the right when not. (The kit's `leg` cannot fold: these two are
 * painted as limbs, joint to joint.)
 */
function kneelLegs(p: Px, k: number, back: boolean, nearX: number, farX: number): void {
  const fwd = back ? -1 : 1;
  const mix = (a: V, b: V): V => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  const nx = nearX + 1.5;
  const fx = farX + 1.5;
  // (hip, knee, foot: standing, and down)
  const near: [V, V, V] = [
    mix([nx, KAY - 24], [nx, KAY - 24 + KNEEL]),
    mix([nx, KAY - 11], [nx + 1, KAY - 2]),
    mix([nx, KAY - 1], [nx - 8, KAY - 2 - 3 * fwd]),
  ];
  const far: [V, V, V] = [
    mix([fx, KAY - 24], [fx, KAY - 24 + KNEEL]),
    mix([fx, KAY - 13], [fx + 7, back ? KAY - 15 : KAY - 11]),
    mix([fx, KAY - 3], [fx + 7, KAY - 3 + 3 * fwd]),
  ];
  const one = (j: [V, V, V], dark: boolean, planted: boolean): void => {
    const hose = dark ? dim(HOSE) : HOSE;
    const boot = dark ? dim(PLUM) : PLUM;
    limb(p, j[0][0], j[0][1], j[1][0], j[1][1], 2, 1.8, hose);
    limb(p, j[1][0], j[1][1], j[2][0], j[2][1], 1.8, 1.6, boot);
    // the foot: flat on the floor and pointing ahead, or (the leg that kneels) on its toes behind
    const x = Math.round(j[2][0]);
    const y = Math.round(j[2][1]);
    if (planted) p.rect(x - 1, y - 1, 5, 2, boot[2]).hline(x - 1, y, 5, boot[0]);
    else p.rect(x - 2, y - 1, 3, 3, boot[2]).hline(x - 2, y + 1, 3, boot[0]);
  };
  one(far, true, true);
  one(near, false, k < 0.5);
}

/**
 * The scout tucked into a roll (prop 4: `pt` is how far round, 0 to 1 for one whole turn, going
 * over forward). From Version 15.1: up to then a rolling scout was the walk played fast and drawn
 * every other frame, to read as a blur. It is a ball of scout and cape close to the floor, turning:
 * the cap and the boots go round opposite each other, the bow is a spoke through it, and it
 * trails two lines of its own speed. The feather is fixed to the cap, and goes round with it.
 */
function tumbled(q: Pose, back: boolean): Painted {
  const lights: Light[] = [];
  const p = layer();
  const turn = q.pt;
  // (it comes up off the floor a little in the middle of the roll)
  const cx = KX + Math.round(q.lean);
  const cy = KAY - 11 + Math.round(q.bob);
  const R = 9;
  // over forward: the top of the ball goes to screen-right
  const a0 = Math.PI / 2 - turn * Math.PI * 2;
  const ux = Math.cos(a0);
  const uy = -Math.sin(a0);
  // the two lines of its speed, behind it
  for (const [dy, len] of [[-4, 9], [3, 12]] as const) {
    const x1 = cx - R - 3;
    p.hline(x1 - len, cy + dy, len, CYAN[2]).hline(x1 - 3, cy + dy, 3, CYAN[3]);
  }
  // the bow: a spoke through the ball, sticking out both ways
  p.line(cx - uy * (R + 6), cy + ux * (R + 6), cx + uy * (R + 6), cy - ux * (R + 6), WOOD[3]);
  // the ball: jerkin on the side the head is, cape on the other
  lit(p, LEAF, HI, LO, (l) => l.ellipse(cx, cy, R, R - 1, INK));
  const capeSide = layer();
  lit(capeSide, TEAL, HI, LO, (l) => l.ellipse(cx, cy, R, R - 1, INK));
  capeSide.each((x, y, c) => {
    // (the half away from the head, and a little more when seen from behind, where the cape is most of the scout)
    if ((x + 0.5 - cx) * ux + (y + 0.5 - cy) * uy < (back ? 2.5 : -0.5)) p.set(x, y, c);
    return undefined;
  });
  // the boots, tucked: opposite the head
  for (const side of [-0.45, 0.45]) {
    const a = a0 + Math.PI + side;
    lit(p, PLUM, HI, LO, (l) => l.ellipse(cx + Math.cos(a) * (R - 1.5), cy - Math.sin(a) * (R - 1.5), 2.8, 2.8, INK));
  }
  // the head in its cap, at the top of the turn
  const hx = cx + ux * (R - 3);
  const hy = cy + uy * (R - 3);
  lit(p, TEAL, HI, LO, (l) => l.ellipse(hx, hy, 4.6, 4, INK));
  if (!back) p.set(Math.round(hx + ux * 1.5 - uy * 1.5), Math.round(hy + uy * 1.5 + ux * 1.5), GLINT);
  const tails: TailRoot[] = [{ id: 'r-feather', x: hx + ux * 3, y: hy + uy * 3, over: true }];
  return { px: compose(null, [p], null), lights, tails };
}

function scout(q: Pose, back: boolean): Painted {
  if (q.prop === 4) return tumbled(q, back);
  // (the way the scout faces is down the screen facing us and up it facing away: `fwd`)
  const fwd = back ? -1 : 1;
  const X = KX + Math.round(q.lean);
  // on one knee (prop 3: `pt` is how far down), all of the scout above the legs is that much lower
  const kneel = q.prop === 3 ? Math.max(0, Math.min(1, q.pt)) : 0;
  // (leaning the way they face carries them a little down the screen, or up it)
  const Y = Math.round(q.bob + q.lean * 0.4 * fwd + kneel * KNEEL);
  const sy = KAY - (BODY - 2) + Y;
  const beltY = KAY - BELT + Y;
  const hipY = KAY - HIP + Y;
  const chinY = KAY - BODY + Y;
  const cx = X - 0.5;
  const cy = chinY - HEAD + 1;
  const lights: Light[] = [];
  const sway = q.swing;

  // --- seen from a corner (the kit's "Turned to the grid") ---
  // what runs across the scout is lowest at the corner of the body nearest us, and rises both ways
  const turn = slant(back ? X + 3 : X - 4, 2);
  // the middle line: toward the side faced when the chest is seen, away from it when the back is
  const mid = X + TURN * fwd;

  // --- the bow hand: on screen-right in both views (the side the scout faces) ---
  // at rest the bow hangs at the side, leaning the way the scout faces; aiming, the arm is out straight
  const gx = X + 15 + q.hx + sway * 1.6;
  const gy = beltY - 2 + q.hy + sway * 0.8 * fwd;
  const bowLayer = layer();
  const tips = bow(bowLayer, gx, gy, q.aim);
  const under = layer();

  // --- the other hand. `off` names where it is: 0 hanging at the side, 1 on the string (drawn back
  // by `act`), 2 reaching back over the shoulder for an arrow, 3 just after loosing (still at the
  // cheek, the string gone), 6 holding an arrow up before the eye. (4 and 5 were the hand that
  // tossed the trap, until Version 12.2 gave the trap to the roll.) Between two keys of a timeline
  // it is on its way from `off` to `off2`, `offK` of the way there. ---
  // (its shoulder is the nearer one facing us, and the lower; facing away the further, and the higher)
  const oShoulder: V = [X - SHOULDER, sy + 3 + (back ? -FAR_RISE : NEAR_DROP)];
  // where the string is held when it is drawn: straight back from the middle of the string, along
  // the line the arrow will fly (the bow leans the way it is aimed)
  const midString: V = [(tips.top[0] + tips.bot[0]) / 2, (tips.top[1] + tips.bot[1]) / 2];
  const lean = (q.aim * Math.PI) / 180;
  const flight: V = [Math.cos(lean), Math.sin(lean)];
  const place = (state: number): V => {
    if (state === 1 || state === 3) return [midString[0] - flight[0] * q.act, midString[1] - flight[1] * q.act];
    if (state === 2) return [X - CHEST - 4.5, sy - 7];
    if (state === 6) return [X + 1, cy + 4];
    return [oShoulder[0] - 2 - sway * 1.6, oShoulder[1] + 12 - sway * 0.8 * fwd];
  };
  const from = place(q.off);
  const to = place(q.off2);
  const oHand: V = [from[0] + (to[0] - from[0]) * q.offK + q.ohx, from[1] + (to[1] - from[1]) * q.offK + q.ohy];
  /** The place the hand is nearer to: it decides how the arm bends and what the hand looks like. */
  const state = q.offK < 0.5 ? q.off : q.off2;
  const bend = (v: V): number => (state === 1 || state === 3 ? -v[0] - v[1] * 0.2 : state === 2 || state === 6 ? -v[0] + v[1] * 0.4 : -v[0]);
  const oElbow = pick(joint(oShoulder, oHand, UPPER, FORE, 1), joint(oShoulder, oHand, UPPER, FORE, -1), bend);
  // the string: straight, or back to the hand that draws it (it is let go the moment the hand opens)
  const onString = q.off === 1 && (q.off2 === 1 || q.offK <= 0);
  if (onString && q.act > 0) {
    under.line(tips.top[0], tips.top[1], oHand[0], oHand[1], STRING);
    under.line(oHand[0], oHand[1], tips.bot[0], tips.bot[1], STRING);
    arrow(under, [oHand[0], oHand[1]], [gx + flight[0] * 7, gy + flight[1] * 7], lights);
  } else {
    under.line(tips.top[0], tips.top[1], tips.bot[0], tips.bot[1], STRING);
    // an arrow on its way from the quiver to the string, nocked but not yet drawn
    if ((q.off === 2 && q.off2 === 1 && q.offK > 0.3) || (q.off === 1 && q.off2 === 1 && q.act <= 0)) arrow(under, [oHand[0], oHand[1]], [oHand[0] + (gx + flight[0] * 7 - oHand[0]) * 0.9, oHand[1] + (gy + flight[1] * 7 - oHand[1]) * 0.9], lights);
  }

  // A volley loosed (on the knee, the hand just off the string): the arrows are seen leaving the
  // bow, a fan of bright lines up the way they fly.
  if (kneel > 0 && q.off === 3 && q.act > 10) {
    // (how long ago they left: 0 in the frame they go, 1 when they are out of the picture)
    const gone = Math.max(0, Math.min(1, (11.2 - q.act) / 1.2));
    for (const turn of [-0.2, 0, 0.2]) {
      const dx = Math.cos(lean + turn);
      const dy = Math.sin(lean + turn);
      const a: V = [gx + dx * (8 + gone * 30), gy + dy * (8 + gone * 30)];
      const b: V = [gx + dx * (20 + gone * 40), gy + dy * (20 + gone * 40)];
      under.line(a[0], a[1], b[0], b[1], turn === 0 ? '#ffffff' : CYAN[3]);
    }
    lights.push({ x: gx + flight[0] * 12, y: gy + flight[1] * 12, r: 15, color: CYAN[3], a: 0.5 * (1 - gone) });
  }

  // A shot loosed (Pose.sweep: 1 in the frame it goes, less as it gets away): the arrow is seen
  // leaving the bow, a bright line the way it flies.
  if (kneel <= 0 && q.sweep > 0.05) {
    const gone = 1 - Math.min(1, q.sweep);
    const a: V = [gx + flight[0] * (9 + gone * 34), gy + flight[1] * (9 + gone * 34)];
    const b: V = [gx + flight[0] * (24 + gone * 50), gy + flight[1] * (24 + gone * 50)];
    under.line(a[0] - flight[0] * 5, a[1] - flight[1] * 5, a[0], a[1], CYAN[3]);
    under.line(a[0], a[1], b[0], b[1], '#ffffff');
    lights.push({ x: gx + flight[0] * 10, y: gy + flight[1] * 10, r: 13, color: CYAN[3], a: 0.5 * Math.min(1, q.sweep) });
  }

  // (the bow arm's shoulder: the further one facing us, up beside the jaw; the nearer one facing away)
  const bShoulder: V = [X + SHOULDER, sy + 3 + (back ? NEAR_DROP : -FAR_RISE)];
  const bElbow = pick(joint(bShoulder, [gx, gy], UPPER, FORE + 1, 1), joint(bShoulder, [gx, gy], UPPER, FORE + 1, -1), (v) => v[1]);

  // --- the cape: short, hanging off the shoulders toward screen-left. The wind is always in it:
  // its corner lifts and falls, a wave runs along its hem, and moving throws it out behind. ---
  const cape = layer();
  const ph = q.wind * Math.PI * 2;
  const lift = Math.sin(ph) * 2.2 + q.drag * 3;
  const w1 = Math.sin(ph + 1.9) * 1.6;
  const w2 = Math.sin(ph + 3.5) * 1.5;
  if (!back) {
    // (it hangs down the scout's back, which is turned from us: what shows is what the wind carries out past the nearer side)
    lit(cape, TEAL, HI, LO, (l) =>
      l.poly([
        [X - 7, sy], [X + 5, sy - 3], [X + 6, beltY], [X - 2, hipY + 4],
        [X - 9 - lift * 0.5, hipY + 3 + w1 - lift * 0.4],
        [X - 17 - lift, hipY + 1 - lift * 0.8],
        [X - 15 - lift * 0.8 + w2, (sy + 8 + hipY + 1) / 2 - lift * 0.3],
        [X - 12 - lift * 0.5, sy + 8],
      ], INK),
    );
    for (let y = sy + 6; y <= hipY + 2; y++) for (const dx of [-9, -5]) {
      const x = X + dx - Math.round((y - sy) * (0.2 + lift * 0.02));
      if (cape.has(x, y)) cape.set(x, y, TEAL[0]);
    }
    quiver(cape, X - 13, sy - 10, 11, 0);
  } else {
    // from behind the cape is what we see most of: shoulders to hips, its hem flying to screen-left.
    // It lies on the back, so it leans as the back does: it is painted level and set on the grid below.
    lit(cape, TEAL, HI, [LO[0], LO[1] + 1], (l) =>
      l.poly([
        [X - 7, sy - 1], [X + 7, sy - 1], [X + 8, beltY + 4],
        [X + 4, hipY + 5 + w2 * 0.6],
        [X - 6 - lift * 0.5, hipY + 6 + w1 - lift * 0.3],
        [X - 15 - lift, hipY + 2 - lift * 0.8],
        [X - 13 - lift * 0.7 + w2, (sy + 9 + hipY + 2) / 2 - lift * 0.3],
        [X - 11 - lift * 0.4, sy + 9],
      ], INK),
    );
    for (let y = sy + 5; y <= hipY + 3; y++) for (const dx of [-6, -1, 4]) {
      const x = X + dx - Math.round((y - sy) * (0.15 + lift * 0.02));
      if (cape.has(x, y) && y % 5 !== 0) cape.set(x, y, TEAL[0]);
    }
  }

  // --- the squirrel (what the scout does when left standing, 1): `pt` is how far round it has run ---
  const hidden = layer();
  const shown = layer();
  const sq = q.prop === 1 && !back ? squirrelAt(q.pt) : null;
  if (sq) squirrel(sq.front ? shown : hidden, X + sq.dx, sy + sq.dy, sq.face, sq.rows);

  const body = layer();
  // The nearer foot stands lower on the screen and the further one higher: they are on the grid.
  // (the legs do not lean with the body: the feet are what the anchor is measured from)
  const nearX = back ? KX + 1 : KX - LEGS.w - 1;
  const farX = back ? KX - LEGS.w - 1 : KX + 1;
  const toe = back ? 1 : 3;
  const foot: 1 | -1 = back ? -1 : 1;
  if (!back) arm(body, bShoulder, bElbow, [gx, gy], ARM, dim(LEAF), dim(PLUM));
  // (facing away, the other arm hangs under the cape: it only shows when it comes up to the string)
  const raised = q.off !== 0 || q.off2 !== 0;
  if (back && raised) arm(body, oShoulder, oElbow, oHand, ARM, dim(LEAF), dim(LEAF));
  if (kneel > 0) kneelLegs(body, kneel, back, nearX, farX);
  else {
    leg(body, farX, KAY - 24, KAY - 3, true, LEGS, footOf(q, false, back, true), toe, foot);
    leg(body, nearX, KAY - 24, KAY - 1, false, LEGS, footOf(q, true, back, true), toe, foot);
  }
  // the jerkin, its belt and what is on the chest: painted level, then set on the grid
  const trunk = layer();
  jerkin(trunk, X, sy, beltY, hipY, -sway * 1.5 - q.drag + Math.sin(ph + 0.8) * 0.9);
  if (!back) {
    // the strap of the quiver, across the chest: from the nearer shoulder down to the further hip
    for (let y = sy; y < beltY; y++) {
      const t = (y - sy) / Math.max(1, beltY - sy - 1);
      const x = Math.round(X - CHEST + 2 + (WAIST - 1 + CHEST - 2) * t);
      trunk.set(x, y, PLUM[1]).set(x + 1, y, PLUM[2]);
    }
  }
  belt(trunk, X, beltY, back ? null : mid);
  if (!back) {
    // a pink neckerchief: its knot hangs on the scout's middle line
    lit(trunk, PINK, HI, LO, (l) => l.poly([[X - 5, sy - 1], [X + 5, sy - 1], [mid - 1, sy + 5]], INK));
  }
  shear(trunk, turn, body);
  // the head: a mask across the eyes, which are toward the side faced. From behind, dark hair under the cap.
  ball(body, cx, cy, HEAD, HEAD, back ? dim(PLUM) : SKIN);
  const fx = Math.round(cx) + TURN;
  const ey = Math.round(cy);
  if (!back) {
    for (const [x, y] of inEllipse(cx, cy, HEAD, HEAD)) if (y >= ey - 1 && y <= ey + 1) body.set(x, y, INK);
    body.set(fx - 2, ey, GLINT).set(fx + 1, ey, GLINT);
  }
  cap(body, cx, cy, back);
  if (!back) {
    for (let x = Math.round(cx - HEAD); x <= Math.round(cx + HEAD); x++) if (body.has(x, ey - 2)) body.set(x, ey - 2, TEAL[0]);
  }
  // the feather: where its quill is stuck in the cap (it is drawn by the game, not here)
  const tails: TailRoot[] = [{ id: 'r-feather', x: cx + 1, y: cy - HEAD - 1, over: true }];

  // --- over the body: the cape and quiver when seen from behind, and the arm nearer the camera ---
  const top = layer();
  if (back) {
    const onBack = layer();
    onBack.blit(cape, 0, 0);
    // the neckerchief shows as a pink band under the cap
    lit(onBack, PINK, HI, LO, (l) => l.rect(X - 5, sy - 2, 10, 2, INK));
    // the quiver, slung across the back, its arrows over the further shoulder
    quiver(onBack, X - 6, sy - 6, 15, 0.35);
    for (let y = sy; y < beltY; y++) {
      const t = (y - sy) / Math.max(1, beltY - sy - 1);
      const x = Math.round(X - CHEST + 1 + (CHEST * 2 - 3) * t);
      if (y > sy + 9) onBack.set(x, y, PLUM[1]).set(x + 1, y, PLUM[2]);
    }
    shear(onBack, turn, top);
    arm(top, bShoulder, bElbow, [gx, gy], ARM, LEAF, PLUM);
  }
  const reach = layer();
  if (!back) {
    arm(reach, oShoulder, oElbow, oHand, ARM, LEAF, state === 0 ? PLUM : LEAF);
    fist(reach, oHand[0], oHand[1] - (state === 2 ? 1.5 : 0));
  } else if (raised) {
    fist(body, oHand[0], oHand[1]);
  }
  // an arrow in the free hand (what the scout does when left standing, 2): drawn from the quiver,
  // held up level before the eye and sighted along, then put back. `pt` runs a glint down the shaft.
  const over = layer();
  if (q.prop === 2 && !back) {
    // upright as it leaves the quiver, level before the eye
    const level = state === 6 ? 1 : q.off2 === 6 ? q.offK : q.off === 6 ? 1 - q.offK : 0;
    const ang = ((-82 + 86 * level) * Math.PI) / 180;
    const ax = Math.cos(ang);
    const ay = Math.sin(ang);
    const tail: V = [oHand[0] - ax * 4, oHand[1] - ay * 4];
    const head: V = [oHand[0] + ax * 13, oHand[1] + ay * 13];
    arrow(reach, tail, head, lights);
    if (level >= 1 && q.pt > 0 && q.pt < 1) {
      const gxx = Math.round(tail[0] + (head[0] - tail[0]) * q.pt);
      const gyy = Math.round(tail[1] + (head[1] - tail[1]) * q.pt);
      over.set(gxx, gyy, '#ffffff').set(gxx + 1, gyy, '#ffffff').set(gxx, gyy - 1, CYAN[4]).set(gxx, gyy + 1, CYAN[4]);
      lights.push({ x: gxx, y: gyy, r: 6, color: CYAN[3], a: 0.5 });
    }
  }
  const hand = layer();
  fist(hand, gx, gy);

  const layers = back ? [body, top, bowLayer, hand] : [cape, hidden, body, shown, reach, bowLayer, hand];
  return { px: compose(under, layers, over), lights, tails };
}

function pick(a: V, b: V, score: (v: V) => number): V {
  return score(a) >= score(b) ? a : b;
}

// ---------------------------------------------------------------------------------------------
// Animations

/**
 * The scout. A shot: the bow comes up, the string is drawn to the cheek with an arrow on it, it is
 * loosed, and the hand goes back over the shoulder for the next arrow. A volley: the same, with the
 * bow tipped up at the sky, held there a moment after the arrows have gone. Left standing: a squirrel
 * runs out from under the cloak, round the shoulders and back under; or an arrow is drawn, sighted
 * along, and put back.
 */
const FR = 1 / 30;

/**
 * VOLLEY, as it is from Version 15.1 (the owner, 6 Oct 2026: "The rogue drops to a knee when he
 * fires Volley"; "I want things to have weight"). Before, the scout stood and tipped the bow up.
 * Now: down onto a knee as the bow comes up (the cape flies up behind as the body drops out from
 * under it), braced there with the bow tipped at the sky and the string at the cheek, the arrows
 * gone in a fan of light with the bow kicking in the hand, a moment still on the knee watching
 * them go, and up. The arrows leave on the seventh frame, as the rules loose theirs (`hit`).
 * `up` is how far the bow hand is raised and `tip` how far the bow is tipped, which differ for the
 * two views.
 */
function volleyOf(up: number, tip: number): Timeline {
  const down: Partial<Pose> = { prop: 3, pt: 1 };
  return {
    hit: 6 * FR,
    keys: [
      { at: 0, pose: {} },
      { at: 2 * FR, pose: { prop: 3, pt: 0.75, lean: -1, hx: 1, hy: up * 0.6, aim: tip * 0.6, off: 1, wind: 0.1, drag: 1.8 }, ease: 'in' },
      { at: 3 * FR, pose: { ...down, bob: 1, lean: -2, hx: 1, hy: up, aim: tip, off: 1, act: 6, wind: 0.15, drag: 1.2 }, ease: 'out' },
      { at: 5 * FR, pose: { ...down, lean: -2, hx: 1, hy: up, aim: tip, off: 1, act: 12, wind: 0.22, drag: -0.4 }, ease: 'out' },
      { at: 6 * FR, pose: { ...down, lean: -2, hx: 1, hy: up, aim: tip, off: 1, act: 12.5, wind: 0.25 }, ease: 'lin' },
      { at: 7 * FR, pose: { ...down, bob: 1, lean: -3, hx: 3, hy: up - 2, aim: tip + 6, off: 3, act: 11.2, wind: 0.4, drag: 0.9 }, ease: 'lin' },
      { at: 9 * FR, pose: { ...down, lean: -2, hx: 2, hy: up - 1, aim: tip + 3, off: 3, act: 10, wind: 0.5, drag: 0.3 }, ease: 'out' },
      { at: 13 * FR, pose: { ...down, lean: -1, hx: 2, hy: up + 3, aim: tip + 14, wind: 0.75 } },
      { at: 17 * FR, pose: { prop: 3, wind: 1 }, ease: 'io' },
    ],
  };
}

/**
 * SHOT, as it is from Version 15.1 (the owner named it on his page of notes among the animations
 * to better, and on 6 Oct 2026: "I want things to have weight"). Before, the scout stood bolt
 * upright and only the arms moved. Now it is an archer's shot: a foot goes forward and the body
 * sinks and leans back against the draw; at the loose the bow kicks forward in the hand and tips,
 * the hand that drew flies back past the ear, the body comes forward off the tension, cape and
 * feather jump, and the arrow is seen leaving as a line of light; a beat held like that, and the
 * hand is already going over the shoulder for the next arrow. The arrow leaves on the sixth
 * frame, as the rules loose theirs (`hit`).
 * `up`: how far the bow hand is raised; `tip`: how the bow is turned to aim, for the view;
 * `reach`: the scout faces us (and the hand is seen going back for the next arrow).
 */
function shotOf(up: number, tip: number, reach: boolean): Timeline {
  // (the foot on the bow's side goes forward: the further one when the scout faces us, the nearer when not)
  const feet = (ahead: number, behind: number, lift = 0): Partial<Pose> => (reach ? { far: ahead, near: behind, farLift: lift } : { near: ahead, far: behind, nearLift: lift });
  return {
    hit: 5 * FR,
    keys: [
      { at: 0, pose: {} },
      { at: 2 * FR, pose: { lean: -1, bob: 1, ...feet(0.8, -0.3, 0.4), hx: 3, hy: up, aim: tip, off: 1, act: 5, wind: 0.1 }, ease: 'out' },
      { at: 4 * FR, pose: { lean: -3, bob: 2, ...feet(1.3, -0.6), hx: 4, hy: up, aim: tip, off: 1, act: 12.5, wind: 0.2, drag: -0.6 }, ease: 'out' },
      { at: 5 * FR, pose: { lean: -3, bob: 2, ...feet(1.3, -0.6), hx: 4, hy: up, aim: tip, off: 1, act: 13, wind: 0.25, drag: -0.6 }, ease: 'lin' },
      { at: 6 * FR, pose: { lean: 0, bob: 1, ...feet(1.3, -0.6), hx: 8, hy: up, aim: tip + 12, off: 3, act: 11.2, ohx: -3, sweep: 1, wind: 0.4, drag: 2 }, ease: 'lin' },
      { at: 8 * FR, pose: { lean: 1, bob: 1, ...feet(1.1, -0.5), hx: 7, hy: up + 1, aim: tip + 7, off: 3, act: 10, ohx: -4, wind: 0.55, drag: 0.5 }, ease: 'out' },
      { at: 11 * FR, pose: { hx: 3, hy: up + 1, aim: tip - 4, off: reach ? 2 : 0, wind: 0.75 } },
      { at: 15 * FR, pose: { wind: 1 } },
    ],
  };
}

/**
 * THE ROLL (the ranger's evasive move, which leaves the trap), from Version 15.1: down and forward
 * onto a knee, over in a ball for one whole turn, and up off the knee. Its keys run from 0 to 1
 * over the roll, as a leap's do over a leap. (The roll takes a quarter of a second: it is quick.)
 */
const TUMBLE: Timeline = {
  keys: [
    { at: 0, pose: { prop: 3, pt: 0.35, lean: 3, drag: 1.6 } },
    { at: 0.16, pose: { prop: 3, pt: 1, lean: 6, bob: 3, drag: 2 }, ease: 'in' },
    { at: 0.18, pose: { prop: 4, pt: 0, bob: 1, lean: 4 }, ease: 'hold' },
    { at: 0.5, pose: { prop: 4, pt: 0.55, bob: -3, lean: 4 }, ease: 'lin' },
    { at: 0.8, pose: { prop: 4, pt: 1.05, bob: 1, lean: 4 }, ease: 'lin' },
    { at: 0.82, pose: { prop: 3, pt: 1, lean: 5, bob: 2, drag: 1.2 }, ease: 'hold' },
    { at: 1, pose: { prop: 3, pt: 0.3, lean: 2, drag: 0.6 }, ease: 'out' },
  ],
};

/**
 * How the scout runs (from Version 15.1): low and light, well forward over the feet, a long quick
 * stride that hardly touches the floor, the cape straight out behind.
 */
const SCOUT_RUN = runPoses({ lean: 3, dip: 1, stride: 1.25, drag: 1.7 });

/**
 * THE SCOUT'S FALL, when his life runs out (6 Oct 2026: see the knight's, hero_warrior.ts). The
 * blow throws him back; a step back to keep his feet, the bow drooping; a knee gives, and he is
 * down on it (the kneel he looses a Volley from); the bow goes out of his hand to the floor
 * before him, his head goes down over it, and the light goes out of him (Pose.out). He is left
 * on one knee with his bow lying in front of him.
 */
const SCOUT_FALL: Timeline = {
  keys: [
    { at: 0, pose: {} },
    { at: 2 * FR, pose: { lean: -5, bob: 1, near: 0.5, far: -0.7, drag: -2.5, wind: 0.08 }, ease: 'out' },
    { at: 8 * FR, pose: { lean: -3, bob: 2, near: -0.4, far: 0.4, hy: 3, aim: 0, drag: -0.8, wind: 0.25 }, ease: 'io' },
    { at: 14 * FR, pose: { prop: 3, pt: 0.45, lean: -1, hy: 6, aim: -30, wind: 0.4 }, ease: 'io' },
    // (down on the knee: slowly, and then all at once; and the weight of him landing)
    { at: 20 * FR, pose: { prop: 3, pt: 1, lean: 1, bob: 1, hy: 8, aim: -55, wind: 0.55, drag: 1.6, out: 0.2 }, ease: 'in' },
    { at: 22 * FR, pose: { prop: 3, pt: 1, lean: 2, bob: 3, hy: 9, aim: -62, wind: 0.6, drag: -1, out: 0.3 }, ease: 'lin' },
    { at: 26 * FR, pose: { prop: 3, pt: 1, lean: 2, bob: 2, hy: 10, aim: -70, wind: 0.68, out: 0.45 }, ease: 'out' },
    { at: 46 * FR, pose: { prop: 3, pt: 1, lean: 6, bob: 6, hx: -2, hy: 14, aim: -100, wind: 1, out: 1 }, ease: 'io' },
  ],
};

/** A heavy blow rocks him back on his heels, and he is upright again (see the knight's, hero_warrior.ts). */
const SCOUT_REEL: Timeline = {
  keys: [
    { at: 0, pose: {} },
    { at: 2 * FR, pose: { lean: -5, bob: 1, near: 0.5, far: -0.7, drag: -2.5, wind: 0.08 }, ease: 'out' },
    { at: 4 * FR, pose: { lean: -3, bob: 1, near: 0.3, far: -0.5, drag: 1.2, wind: 0.14 }, ease: 'io' },
    { at: 7 * FR, pose: {}, ease: 'io' },
  ],
};
/** ... and one from behind throws them forward a step: pitched over, a foot out to catch them, and upright again. */
const SCOUT_LURCH: Timeline = {
  keys: [
    { at: 0, pose: {} },
    { at: 2 * FR, pose: { lean: 5, bob: 2, near: -0.6, far: 0.6, drag: 2.5, wind: 0.08 }, ease: 'out' },
    { at: 4 * FR, pose: { lean: 3, bob: 2, near: 0.5, far: -0.3, drag: -1, wind: 0.14 }, ease: 'io' },
    { at: 7 * FR, pose: {}, ease: 'io' },
  ],
};

export function makeRangerArt(was = false): ActorArt {
  const eye: Partial<Pose> = { off: 6, prop: 2, bob: 1 };
  const front: Moves = {
    attack: !was ? shotOf(-6, 20, true) : {
      hit: 0.16,
      keys: [
        { at: 0, pose: {} },
        { at: 0.05, pose: { hx: 3, hy: -6, aim: 20, off: 1, wind: 0.1 }, ease: 'out' },
        { at: 0.14, pose: { lean: -1, hx: 3, hy: -6, aim: 20, off: 1, act: 12, wind: 0.2 }, ease: 'out' },
        { at: 0.16, pose: { lean: -1, hx: 3, hy: -6, aim: 20, off: 1, act: 12.5, wind: 0.25 }, ease: 'lin' },
        { at: 0.19, pose: { hx: 4, hy: -6, aim: 18, off: 3, act: 11, wind: 0.45, drag: 0.6 }, ease: 'out' },
        { at: 0.32, pose: { hx: 3, hy: -5, aim: 14, off: 2, wind: 0.7 } },
        { at: 0.48, pose: { wind: 1 } },
      ],
    },
    ...(was ? {} : { roll: TUMBLE, walk: SCOUT_RUN, fall: SCOUT_FALL, reel: SCOUT_REEL, lurch: SCOUT_LURCH }),
    heavy: !was ? volleyOf(-12, -56) : {
      hit: 0.2,
      keys: [
        { at: 0, pose: {} },
        { at: 0.07, pose: { lean: -1, hx: 1, hy: -12, aim: -52, off: 1, wind: 0.1 }, ease: 'out' },
        { at: 0.18, pose: { lean: -2, bob: 1, hx: 1, hy: -12, aim: -52, off: 1, act: 12, wind: 0.2 }, ease: 'out' },
        { at: 0.2, pose: { lean: -2, bob: 1, hx: 1, hy: -12, aim: -52, off: 1, act: 12.5, wind: 0.25 }, ease: 'lin' },
        { at: 0.23, pose: { lean: -1, hx: 2, hy: -13, aim: -50, off: 3, act: 11, wind: 0.45, drag: 0.6 }, ease: 'out' },
        { at: 0.38, pose: { hx: 2, hy: -11, aim: -40, off: 2, wind: 0.7 } },
        { at: 0.56, pose: { wind: 1 } },
      ],
    },
    idleA: {
      keys: [
        { at: 0, pose: { prop: 1 } },
        { at: 1.3, pose: { prop: 1, pt: 0.37 }, ease: 'lin' },
        { at: 1.55, pose: { prop: 1, pt: 0.42, lean: 1 }, ease: 'lin' },
        { at: 2.15, pose: { prop: 1, pt: 0.55, lean: 1 }, ease: 'lin' },
        { at: 3.5, pose: { prop: 1, pt: 1 }, ease: 'lin' },
        // (it is under the cloak: `pt` stays where it ended, or the squirrel would be seen running its round backwards in a frame)
        { at: 3.6, pose: { pt: 1 } },
      ],
    },
    idleB: {
      keys: [
        { at: 0, pose: {} },
        { at: 0.4, pose: { off: 2 } },
        { at: 0.55, pose: { off: 2, prop: 2 }, ease: 'hold' },
        { at: 1.05, pose: { ...eye } },
        { at: 2.25, pose: { ...eye, pt: 1, lean: 1 }, ease: 'lin' },
        { at: 2.5, pose: { ...eye, pt: 1 } },
        { at: 2.95, pose: { off: 2, prop: 2, pt: 1 } },
        { at: 3.1, pose: { off: 2 }, ease: 'hold' },
        { at: 3.6, pose: {} },
      ],
    },
  };
  const backMoves: Moves = {
    attack: !was ? shotOf(-14, -16, false) : {
      hit: 0.16,
      keys: [
        { at: 0, pose: {} },
        { at: 0.05, pose: { hx: 1, hy: -14, aim: -16, off: 1, wind: 0.1 }, ease: 'out' },
        { at: 0.14, pose: { lean: -1, hx: 1, hy: -14, aim: -16, off: 1, act: 12, wind: 0.2 }, ease: 'out' },
        { at: 0.16, pose: { lean: -1, hx: 1, hy: -14, aim: -16, off: 1, act: 12.5, wind: 0.25 }, ease: 'lin' },
        { at: 0.19, pose: { hx: 2, hy: -14, aim: -14, off: 3, act: 11, wind: 0.45, drag: 0.6 }, ease: 'out' },
        { at: 0.32, pose: { hx: 2, hy: -8, aim: 2, wind: 0.7 } },
        { at: 0.48, pose: { wind: 1 } },
      ],
    },
    ...(was ? {} : { roll: TUMBLE, walk: SCOUT_RUN, fall: SCOUT_FALL, reel: SCOUT_REEL, lurch: SCOUT_LURCH }),
    heavy: !was ? volleyOf(-19, -64) : {
      hit: 0.2,
      keys: [
        { at: 0, pose: {} },
        { at: 0.07, pose: { lean: -1, hx: 0, hy: -19, aim: -62, off: 1, wind: 0.1 }, ease: 'out' },
        { at: 0.18, pose: { lean: -2, bob: 1, hx: 0, hy: -19, aim: -62, off: 1, act: 12, wind: 0.2 }, ease: 'out' },
        { at: 0.2, pose: { lean: -2, bob: 1, hx: 0, hy: -19, aim: -62, off: 1, act: 12.5, wind: 0.25 }, ease: 'lin' },
        { at: 0.23, pose: { lean: -1, hx: 1, hy: -20, aim: -60, off: 3, act: 11, wind: 0.45, drag: 0.6 }, ease: 'out' },
        { at: 0.38, pose: { hx: 1, hy: -13, aim: -30, wind: 0.7 } },
        { at: 0.56, pose: { wind: 1 } },
      ],
    },
  };
  // (at rest the bow leans the way the scout faces: its belly down the screen facing us, up it facing away)
  return { front: animSet(scout, false, { aim: 20 }, front, { stepped: true }), back: animSet(scout, true, { aim: -8 }, backMoves, { stepped: true }) };
}

/** For the art sheets: one frame, as a painting. */
export function paintRanger(q: Pose, back: boolean): Painted {
  return scout(q, back);
}
