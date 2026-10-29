// THE RANGER'S SIX COMPANIONS: THEIR PICTURES (the art chat's helper, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of
// the game imports this file (tests/companions_art.test.ts proves it), and `COMPANIONS_ART_ON`, the switch the main chat
// would bring them in by, is off.
//
// HIS WORDS (the main chat's record, docs/NEXT_VERSION.md on `v23`, 28 Oct 2026, 23:09 to 23:37): 23:09, “I’d like the
// ranger to have a passive that summons a hawk companion that applies PRECISE on hit, a snake companion, that applies
// “of POISON”, and a third something I need help with”; offered a wolf (Binding), a bat (Leeching), a fox (Swift) and a
// tortoise (Guarding): “Okay maybe we have two separate passive with three each cause I love all of these.  Let’s put
// them opposite each other on the tree so if you want one companion that’s fine but if you want two it’s going to take
// some investment.  So we need 6 total”; 23:25, “Yeah keep the groups”. The main chat built their rules
// (game/companions.ts, COMPANIONS off): THE HUNTING COMPANION, a hawk (it marks its prey: his next hit on it a sure
// critical), a snake (it poisons) or a wolf (it holds); THE WILD COMPANION, a bat (it heals him), a fox (it gives him
// speed) or a tortoise (a shield; it keeps close). Each keeps by the Ranger and bites what is near him.
//
// THE ASK (the main chat to the art chat, on the board, 28 Oct 23:26, as relayed): original designs, each reading as HIS
// animal and a friend; about the size of the mage's familiars (art/spells.ts), the tortoise and the wolf a little
// bigger; each from in front and from behind, standing, moving (the hawk and the bat flying) and its attack; an icon
// each.
//
// HOW THEY ARE MADE: as the floors' animals are (art/hounds.ts, art/fog_wolves.ts), each from solids of its own (no
// heroes' bones), in the painter the heroes and monsters share (art/new_mobs3.ts paintBits, art/skin.ts): lit from the
// upper left in three tones a material, the indigo seam where one part ends in front of another, every pixel crisp.
// THE FRIEND'S EDGE ROUND EACH: cyan (his rulebook, Pillars 4: “What glows on a friend is cyan”), the heroes' own
// (FRIEND_RIM), and a small pool of the heroes' cyan light behind it. Nothing of them pink or gold. Each one's colours
// are its own animal's, natural and bold, never candy (Pillars, Never), and none of them the enemy's: the wolf is warm
// and solid, cream-masked and amber-eyed, its tail up, its legs on the floor, nothing like the Pinewood's Fog Wolves
// (art/fog_wolves.ts: grey fog, gaunt, its legs lost in fog, its eyes burning pink); the bat is a fruit bat, brown and
// gold, nothing like the cave bat (art/monster_bat.ts: indigo, magenta wings, burning eyes).
//
// REAL SHAPES (How art is made 9): each is sculpted as its animal is built (a wolf's deep chest and tucked belly, a
// fox's narrow muzzle and great brush, a hawk's hooked beak and fingered wing tips, a snake's tapering body that coils
// on itself, a bat's fingered wings, a tortoise's domed shell of plates), its parts growing into each other in one
// body; never balls stuck together.

import type { Light, Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import type { CheckLimb, CheckLump, CheckThing } from './boss_checks';
import { FRIEND_RIM } from './hero3_knight';
import { INK, hash, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { paintBits } from './new_mobs3';
import type { Bit, Put, Shape } from './new_mobs3';
import { Sheet, ball, rod, stage } from './skin';
import type { GameView, Skin, Stage } from './skin';
import type { V3 } from './skeleton';
import { COMP_ATTACK, COMP_STAND, D, FOX_SPEC, KINDS, WOLF_SPEC, add, beatOf, cl01, cross, dot, fr, joint, lerpV, moveFps, moveFrames, moveLong, mul, norm, quadPose, snakePose, sub, tortPose, turn, wingPose } from './companions_art_moves';
import type { Kind, QuadPose, QuadSpec } from './companions_art_moves';
import { giftOf, smearColours } from './companions_art_fx';

/** THE SWITCH, OFF. Nothing of the game reads this file; the main chat brings them in by it, on the owner's yes. */
export const COMPANIONS_ART_ON = { on: false };

/** The canvas each is painted on (picture pixels), and the floor point under it: room for the hawk at the Ranger's shoulder and for every strike and its gift. */
export const COMP_CANVAS = { w: 150, h: 150, ax: 66, ay: 108 };
/** The pool of the friend's cyan light behind each (the heroes' own colour, AURA3, smaller: they are small), on the canvas; the fliers' up with them. */
const AURA_COLOR = '#28dcf0';
function auraOf(k: Kind): Light {
  const up = k === 'hawk' ? 34 : k === 'bat' ? 30 : k === 'snake' ? 7 : k === 'tortoise' ? 8 : 12;
  const r = k === 'wolf' || k === 'tortoise' ? 26 : 22;
  return { x: COMP_CANVAS.ax, y: COMP_CANVAS.ay - up, r, color: AURA_COLOR, a: 0.16 };
}
/** The soft shadow under each (its half-width on the floor, picture pixels: the game draws it). */
export const COMP_SHADOW: Record<Kind, number> = { hawk: 6, snake: 9, wolf: 11, bat: 5, fox: 8, tortoise: 11 };
/** How high each is carried above its floor point, standing (the fliers: the game draws its shadow under it on the floor). */
export const COMP_FLIES: Record<Kind, number> = { hawk: 0, snake: 0, wolf: 0, bat: 0, fox: 0, tortoise: 0 };

// ---------------------------------------------------------------------------------------------
// WHAT THE REVIEW READS: each moment's solids also say what the boss checks (art/boss_checks.ts) want to know

export interface Review {
  /** Its body as solids: what nothing may pass through. */
  lumps: CheckLump[];
  limbs: CheckLimb[];
  /** What of it grips the floor (its paws; none for the two that fly, nor the snake, whose body follows its own path). */
  grips: { name: string; p: V3 }[];
  /** What may not pass through the rest of it (a leg through another, a wing through the body, the snake through its own coils). */
  things: CheckThing[];
  /** The end it strikes with. */
  tip: V3 | null;
  /** The points the review follows from frame to frame and from one move to the next. */
  follow: Record<string, V3>;
  /** For the bones the review stands on its body (see companionReview): its middle, its haunches' and its chest's turning, its head's. */
  proxy: { at: V3; yaw: number; pitch: number; roll: number; twist: number; bend: number; faceTurn: number; faceUp: number };
}
/** A grain laid on the finished frame after its edge, as the hounds' breath is: where, its colour, its size (picture pixels). */
export type Grain = readonly [V3, string, number];
/** One moment of one of them: its solids, what is laid after its edge, what the review reads, and which parts its strike smears. */
export interface Look {
  bits: Bit[];
  grains: Grain[];
  review: Review;
  smear: ReadonlySet<string>;
  /** The middle of its body (a far limb is a step darker). */
  ref: V3;
}

/** A recorder: every solid put, and (for the review) every ball a lump of its body and every rod a limb. */
function recorder(): { put: Put; bits: Bit[]; lumps: CheckLump[]; limbs: CheckLimb[] } {
  const bits: Bit[] = [];
  const lumps: CheckLump[] = [];
  const limbs: CheckLimb[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
    if (shape.k === 'ball') {
      const r = shape.ax.map((v) => Math.hypot(v[0], v[1], v[2]) || 1);
      lumps.push({ name: piece, c: shape.c, rot: [mul(shape.ax[0], 1 / r[0]), mul(shape.ax[1], 1 / r[1]), mul(shape.ax[2], 1 / r[2])], h: [r[0], r[1], r[2]] });
    } else if (shape.k === 'rod') limbs.push({ name: piece, a: shape.a, b: shape.b, r: Math.max(shape.ra, shape.rb) });
  };
  return { put, bits, lumps, limbs };
}
const sphere = (r: number): [V3, V3, V3] => [[r, 0, 0], [0, r, 0], [0, 0, r]];
/** Points along a line, from `k0` to `k1` of the way. */
function along(a: V3, b: V3, k0: number, k1: number, n: number): V3[] {
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) out.push(lerpV(a, b, k0 + ((k1 - k0) * i) / n));
  return out;
}

// =============================================================================================
// THEIR COLOURS: each its own animal's; three tones a material (dark, middle, light), the light from the upper left

/** The wolf: a warm grey coat, a darker saddle down its back, cream at its throat, belly and mask, tawny legs; amber eyes. */
const WOLF_COAT: Ramp = ['#2a2430', '#2a2430', '#6c6168', '#a69990', '#a69990'];
const WOLF_SADDLE: Ramp = ['#1c1820', '#1c1820', '#463d44', '#6e6366', '#6e6366'];
const WOLF_CREAM: Ramp = ['#4a4240', '#4a4240', '#b2a492', '#e4d8c4', '#e4d8c4'];
const WOLF_TAWNY: Ramp = ['#38281e', '#38281e', '#88664a', '#b98f66', '#b98f66'];
/** The fox: red-gold, white at its chin, chest and the tip of its brush, black stockings and the backs of its ears. */
const FOX_COAT: Ramp = ['#4a1a0e', '#4a1a0e', '#b24a1a', '#e88232', '#e88232'];
const FOX_WHITE: Ramp = ['#5a4e4c', '#5a4e4c', '#cfc4bc', '#f4eee6', '#f4eee6'];
const FOX_BLACK: Ramp = ['#0e0a0e', '#0e0a0e', '#2a2024', '#46383c', '#46383c'];
const NOSE: Ramp = ['#0a080e', '#0a080e', '#1c1820', '#3a3440', '#3a3440'];
/** A tongue and the inside of a mouth: a warm red, never the enemy's pink. */
const TONGUE: Ramp = ['#4e1a1a', '#4e1a1a', '#a03a2a', '#d0603e', '#d0603e'];
const MOUTH = '#2a1214';
const TOOTH = '#ece4d4';
/** Eyes: amber, with a point of light. */
const AMBER = '#f0a828';
const GLINT = '#fff4d0';

// =============================================================================================
// THE WOLF AND THE FOX: their bodies

/** A four-legged one's body: where its legs leave it, how long they are, its trunk, its neck and head, its tail. */
interface QuadBody {
  spec: QuadSpec;
  /** Where each leg leaves the body (the shoulder, the hip). */
  legTop: readonly V3[];
  /** The fore leg's upper arm and forearm; the hind leg's thigh and shank. */
  fore: readonly [number, number];
  hind: readonly [number, number];
  /** The lower leg, rigid from the foot up: the wrist (fore) or the hock (hind). */
  wrist: V3;
  hock: V3;
  /** Thickness of the upper and lower legs (fore, hind). */
  legR: readonly [number, number, number, number];
  paw: readonly [number, number, number];
  neckRoot: V3;
  neckLong: number;
  neckRest: V3;
  skullPitch: number;
  /** The trunk: [middle, half-lengths, which half (front, rear, middle)]. */
  trunk: ReadonlyArray<readonly [string, V3, V3, 'f' | 'r' | 'm']>;
  tailRoot: V3;
  tail: readonly number[];
  tailSeg: number;
  /** The head: cranium half-lengths; muzzle from and to (head space), its radii; ears: base, length, radii. */
  cranium: V3;
  muzzle: readonly [V3, V3, number, number];
  jaw: readonly [V3, number, number, number];
  ear: readonly [V3, number, number, number];
  eye: V3;
}

const WOLF_BODY: QuadBody = {
  spec: WOLF_SPEC,
  legTop: [
    [9.6, -3.3, 15.4],
    [9.6, 3.3, 15.4],
    [-10.3, -3.5, 15.8],
    [-10.3, 3.5, 15.8],
  ],
  fore: [5.6, 6.3],
  hind: [6.8, 6.6],
  wrist: [0.5, 0, 2.7],
  hock: [-2.3, 0, 5.2],
  legR: [2.5, 1.45, 3.0, 1.55],
  paw: [1.9, 1.5, 1.05],
  neckRoot: [11.4, 0, 18.2],
  neckLong: 4.6,
  neckRest: [8, 0, 5.5],
  skullPitch: 12,
  trunk: [
    ['chest', [7.2, 0, 14.4], [5.8, 4.5, 5.6], 'f'],
    ['ruff', [11, 0, 17.2], [4.2, 4.7, 5.3], 'f'],
    ['withers', [6.2, 0, 18.4], [4.8, 3.5, 2.6], 'f'],
    ['barrel', [-1.2, 0, 15.3], [8.4, 3.9, 4.2], 'm'],
    ['haunch', [-9.4, 0, 15.6], [5.3, 4.1, 5.0], 'r'],
    ['rump', [-8.4, 0, 18.4], [4.6, 3.3, 2.2], 'r'],
  ],
  tailRoot: [-13.8, 0, 17.6],
  tail: [1.5, 2.15, 2.3, 1.85, 0.9],
  tailSeg: 3.3,
  cranium: [3.6, 3.3, 3.1],
  muzzle: [[2.0, 0, -0.9], [6.7, 0, -1.55], 1.9, 1.2],
  jaw: [[0.8, 0, -2.0], 5.9, 1.35, 0.85],
  ear: [[-0.9, 2.0, 2.3], 3.9, 1.3, 0.25],
  eye: [3.0, 1.7, 1.15],
};
const FOX_BODY: QuadBody = {
  spec: FOX_SPEC,
  legTop: [
    [7.0, -2.3, 10.8],
    [7.0, 2.3, 10.8],
    [-7.1, -2.5, 11.0],
    [-7.1, 2.5, 11.0],
  ],
  fore: [4.0, 4.6],
  hind: [4.8, 4.8],
  wrist: [0.35, 0, 2.0],
  hock: [-1.7, 0, 3.9],
  legR: [1.75, 0.95, 2.2, 1.0],
  paw: [1.35, 1.05, 0.75],
  neckRoot: [8.0, 0, 12.6],
  neckLong: 3.6,
  neckRest: [7, 0, 6],
  skullPitch: 10,
  trunk: [
    ['chest', [5.0, 0, 10.2], [4.0, 3.0, 3.6], 'f'],
    ['ruff', [7.8, 0, 12.0], [3.0, 3.1, 3.5], 'f'],
    ['withers', [4.4, 0, 12.6], [3.4, 2.4, 1.7], 'f'],
    ['barrel', [-0.8, 0, 10.8], [6.2, 2.8, 3.0], 'm'],
    ['haunch', [-6.4, 0, 11.0], [3.8, 3.0, 3.5], 'r'],
    ['rump', [-5.8, 0, 13.0], [3.3, 2.4, 1.6], 'r'],
  ],
  tailRoot: [-9.6, 0, 12.6],
  tail: [1.2, 2.2, 2.9, 2.8, 2.2, 1.0],
  tailSeg: 3.0,
  cranium: [2.7, 2.5, 2.35],
  muzzle: [[1.5, 0, -0.6], [6.0, 0, -1.25], 1.3, 0.6],
  jaw: [[0.6, 0, -1.4], 4.8, 0.85, 0.45],
  ear: [[-0.6, 1.6, 1.8], 3.9, 1.35, 0.2],
  eye: [2.2, 1.3, 0.85],
};

/** The quad's two halves: its haunches turn about its pivot with its body; its chest turns further by its bend and twist. */
function quadFrames(B: QuadBody, P: QuadPose): { rear: (p: V3) => V3; front: (p: V3) => V3; midP: (p: V3) => V3; rv: (v: V3) => V3; fv: (v: V3) => V3; mv: (v: V3) => V3 } {
  const piv = B.spec.pivot;
  const at: V3 = [P.x, P.y, P.z];
  const rv = (v: V3): V3 => turn(v, P.yaw, P.pitch, P.roll);
  const fv = (v: V3): V3 => turn(turn(v, P.twist, P.bend, 0), P.yaw, P.pitch, P.roll);
  const mv = (v: V3): V3 => turn(turn(v, P.twist / 2, P.bend / 2, 0), P.yaw, P.pitch, P.roll);
  return {
    rv,
    fv,
    mv,
    rear: (p) => add(add(at, piv), rv(sub(p, piv))),
    front: (p) => add(add(at, piv), fv(sub(p, piv))),
    midP: (p) => add(add(at, piv), mv(sub(p, piv))),
  };
}
/** The head's own frame: where it sits at the end of the neck, its forward, left and up. */
function quadHead(B: QuadBody, P: QuadPose): { root: V3; at: V3; f: V3; l: V3; u: V3; p: (v: V3) => V3 } {
  const Q = quadFrames(B, P);
  const root = Q.front(B.neckRoot);
  const n = Q.fv(turn(norm(B.neckRest), 0, P.neck, 0));
  const at = add(root, mul(n, B.neckLong));
  const [hy, hp, hr] = P.head;
  const sk = (v: V3): V3 => Q.fv(turn(turn(v, 0, B.skullPitch, 0), hy, hp, hr));
  return { root, at, f: sk([1, 0, 0]), l: sk([0, 1, 0]), u: sk([0, 0, 1]), p: (v) => add(at, sk(v)) };
}

/** A coat that is darker down the back and pale beneath: `top` over `mid` over `under`, by how far up the skin faces. */
function coatSkin(top: Ramp, midR: Ramp, under: Ramp, upAt: number, downAt: number, up: V3): Skin {
  return (u, tone) => {
    const h = u[0] * up[0] + u[1] * up[1] + u[2] * up[2];
    if (h < downAt) return under[tone];
    if (h > upAt) return top[tone];
    return midR[tone];
  };
}

/** THE WOLF OR THE FOX, AS SOLIDS. */
function quadLook(B: QuadBody, P: QuadPose, which: string, t: number): Look {
  const wolf = B.spec.kind === 'wolf';
  const { put, bits, lumps, limbs } = recorder();
  const Q = quadFrames(B, P);
  const H = quadHead(B, P);
  const COAT = wolf ? WOLF_COAT : FOX_COAT;
  const PALE = wolf ? WOLF_CREAM : FOX_WHITE;
  const TOP = wolf ? WOLF_SADDLE : FOX_COAT;
  const LEG = wolf ? WOLF_TAWNY : FOX_BLACK;
  const breathe = 1 + 0.045 * P.breath;
  const things: CheckThing[] = [];

  // ITS TRUNK: a deep chest and a tucked belly, a ruff of thick fur round the root of the neck, lean haunches. Each lump's
  // coat darker along its top (the wolf's saddle) and pale beneath (cream; the fox's white chest and belly).
  for (const [name, c, h, half] of B.trunk) {
    const P3 = half === 'f' ? Q.front : half === 'r' ? Q.rear : Q.midP;
    const V = half === 'f' ? Q.fv : half === 'r' ? Q.rv : Q.mv;
    const chesty = name === 'chest' || name === 'ruff';
    const skin = wolf
      ? coatSkin(TOP, COAT, PALE, name === 'barrel' || name === 'withers' || name === 'rump' ? 0.3 : 0.62, chesty ? 0.05 : -0.42, [0, 0, 1])
      : coatSkin(COAT, COAT, PALE, 2, chesty ? -0.15 : -0.55, [0, 0, 1]);
    const sw = name === 'chest' || name === 'barrel' ? breathe : 1;
    // (the fox's white bib runs up the front of its chest and throat: pale where the skin faces forward and down)
    const bib: Skin | null = !wolf && chesty ? (u, tone) => (u[0] > 0.25 && u[2] < 0.35 ? PALE[tone] : (skin as (u: V3, tone: number, x: number, y: number) => string | null)(u, tone, 0, 0)) : null;
    put(half === 'r' ? 'haunch' : 'body', name, { k: 'ball', c: P3(c), ax: [V([h[0], 0, 0]), V([0, h[1] * sw, 0]), V([0, 0, h[2] * sw])], skin: bib ?? skin });
  }

  // ITS NECK, and its head on it
  const nk = norm(sub(H.at, H.root));
  const nl = Q.fv([0, 1, 0]);
  const nu = norm(cross(nk, nl));
  const neckSkin = coatSkin(TOP, COAT, PALE, wolf ? 0.55 : 2, -0.2, nu);
  put('body', 'neck', { k: 'ball', c: lerpV(H.root, H.at, 0.55), ax: [mul(nk, B.neckLong * 0.75), mul(nl, B.cranium[1] * 1.05), mul(nu, B.cranium[2] * 1.15)], skin: neckSkin });

  // THE HEAD: a broad skull (the wolf's), a long fine one (the fox's); cheeks of pale fur; the muzzle tapering to a black
  // nose; the jaw under it, hinged below the ears; the eyes amber; the ears up
  const [cx, cy, cz] = B.cranium;
  const headSkin: Skin = (u, tone) => {
    // (pale at the cheeks and under the jaw; the fox's white muzzle-sides; darker over the brow)
    if (u[2] < -0.25 && u[0] > -0.2) return PALE[tone];
    if (wolf && u[2] > 0.55) return WOLF_SADDLE[tone];
    return COAT[tone];
  };
  put('head', 'cranium', { k: 'ball', c: H.p([0, 0, 0.3]), ax: [mul(H.f, cx), mul(H.l, cy), mul(H.u, cz)], skin: headSkin });
  // (the cheek ruff: the fur swept back and out behind the jaw)
  put('head', 'cheeks', { k: 'ball', c: H.p([-0.7, 0, -0.9]), ax: [mul(H.f, cx * 0.72), mul(H.l, cy * 1.12), mul(H.u, cz * 0.82)], skin: (u, tone) => (u[2] < 0.1 ? PALE[tone] : COAT[tone]) });
  const [m0, m1, mr0, mr1] = B.muzzle;
  const muzA = H.p(m0);
  const muzB = H.p(m1);
  put('head', 'muzzle', { k: 'rod', a: muzA, b: muzB, ra: mr0, rb: mr1, ramp: wolf ? WOLF_CREAM : FOX_COAT });
  // (the top of the muzzle: the bridge of the nose, the coat's colour, from the brow down)
  put('head', 'bridge', { k: 'rod', a: H.p([m0[0] - 0.6, 0, m0[2] + mr0 * 0.55]), b: H.p([m1[0] - 0.5, 0, m1[2] + mr1 * 0.5]), ra: mr0 * 0.62, rb: mr1 * 0.55, ramp: COAT });
  put('head', 'nose', { k: 'ball', c: H.p([m1[0] + mr1 * 0.25, 0, m1[2] + mr1 * 0.35]), ax: [mul(H.f, mr1 * 0.75), mul(H.l, mr1 * 0.9), mul(H.u, mr1 * 0.7)], skin: NOSE });
  // the jaw: shut, or open; the tongue lolling over its side when it pants
  const [j0, jl, jr0, jr1] = B.jaw;
  const hinge = H.p(j0);
  const ga = P.gape * (wolf ? 46 : 40);
  const jw = norm(add(mul(H.f, Math.cos((ga + 4) * D)), mul(H.u, -Math.sin((ga + 4) * D))));
  const jawTip = add(hinge, mul(jw, jl));
  put('jaw', 'jaw', { k: 'rod', a: hinge, b: jawTip, ra: jr0, rb: jr1, ramp: PALE });
  if (P.gape > 0.12) {
    // (the mouth open: dark inside; the fangs, upper and lower)
    const mouthC = lerpV(lerpV(muzA, muzB, 0.62), lerpV(hinge, jawTip, 0.62), 0.5);
    put('jaw', 'mouth', { k: 'ball', c: mouthC, ax: [mul(H.f, jl * 0.36), mul(H.l, mr0 * 0.55), mul(H.u, Math.max(0.35, len3(sub(muzB, jawTip)) * 0.32))], skin: () => MOUTH });
    for (const s of [1, -1]) {
      const up = add(muzB, add(mul(H.l, s * mr1 * 0.6), mul(H.f, -0.6)));
      put('jaw', `fang${s}`, { k: 'rod', a: up, b: add(up, mul(H.u, -1.2 - 0.6 * P.snarl)), ra: 0.42, rb: 0.2, ramp: ['#7a7064', '#7a7064', TOOTH, TOOTH, TOOTH] });
      const lo = add(jawTip, add(mul(H.l, s * jr1 * 0.6), mul(H.f, -0.5)));
      put('jaw', `lfang${s}`, { k: 'rod', a: lo, b: add(lo, mul(norm(cross(jw, H.l)), 1.0)), ra: 0.38, rb: 0.2, ramp: ['#7a7064', '#7a7064', TOOTH, TOOTH, TOOTH] });
    }
    if (P.tongue > 0.2) {
      // (lolling out over the side of the lower jaw, toward the eye's side of it)
      const t0 = lerpV(hinge, jawTip, 0.45);
      const t1 = add(add(lerpV(hinge, jawTip, 0.95), mul(H.l, -0.6)), mul(H.u, -1.2 * P.tongue));
      put('tongue', 'tongue', { k: 'rod', a: t0, b: t1, ra: jr0 * 0.75, rb: jr0 * 0.7, ramp: TONGUE });
    }
  }
  // the eyes: amber, a point of light in each; shut, a line of the coat
  for (const s of [1, -1]) {
    const e = H.p([B.eye[0], s * B.eye[1], B.eye[2]]);
    const facing = norm(add(mul(H.l, s * 0.75), H.f));
    put('head', `eye${s}`, { k: 'dot', p: e, c: P.eyes > 0.5 ? AMBER : COAT[1], c2: P.eyes > 0.5 ? (s > 0 ? undefined : undefined) : undefined, facing });
  }
  // the ears: tall triangles, pricked forward, laid back flat, or swivelled
  const [eb, el, er0, er1] = B.ear;
  for (const s of [1, -1]) {
    const base = H.p([eb[0], s * eb[1], eb[2]]);
    const fwd = P.ears;
    const way = norm(add(add(mul(H.f, 0.15 + 0.45 * fwd - (fwd < 0 ? 0.6 * -fwd : 0)), mul(H.l, s * (0.32 + (fwd < 0 ? 0.25 * -fwd : 0)))), mul(H.u, 1 + (fwd < 0 ? -0.55 * -fwd : 0))));
    const tip = add(base, mul(way, el));
    // (the ear's back, the coat's colour, and its front, a dark hollow lined with pale fur; the fox's backs black)
    put(`ear${s}`, `ear${s}`, { k: 'rod', a: base, b: tip, ra: er0, rb: er1, ramp: wolf ? COAT : FOX_BLACK });
    put(`ear${s}`, `earin${s}`, { k: 'rod', a: add(add(base, mul(way, 0.5)), mul(H.f, 0.45)), b: add(add(tip, mul(way, -1.2)), mul(H.f, 0.3)), ra: er0 * 0.55, rb: er1, ramp: wolf ? WOLF_SADDLE : ['#2a1a14', '#2a1a14', '#5a3a2a', '#7a5040', '#7a5040'] });
  }

  // ITS LEGS: the fore straight, the hind angled at the hock; stockings (the fox's black, the wolf's tawny); round paws
  const paws: V3[] = [];
  P.feet.forEach((foot, i) => {
    const front = i < 2;
    const s = i % 2 === 0 ? -1 : 1;
    const top = front ? Q.front(B.legTop[i]) : Q.rear(B.legTop[i]);
    const fold = P.fold[i];
    const lowV = turn(front ? B.wrist : B.hock, 0, fold, 0);
    const low = add(foot, lowV);
    const [l1, l2] = front ? B.fore : B.hind;
    const hint = front ? Q.fv([-1, s * 0.12, 0]) : Q.rv([1, s * 0.12, 0]);
    const mid = joint(top, low, l1, l2, hint);
    const part = `leg${i}`;
    const [ru, rl] = front ? [B.legR[0], B.legR[1]] : [B.legR[2], B.legR[3]];
    const upperRamp = COAT;
    put(part, `${part}u`, { k: 'rod', a: top, b: mid, ra: ru, rb: rl * 1.25, ramp: upperRamp, far: true });
    put(part, `${part}l`, { k: 'rod', a: mid, b: low, ra: rl * 1.15, rb: rl, ramp: wolf && front ? WOLF_CREAM : LEG, far: true });
    const pawUp = add(foot, turn([0.45, 0, B.paw[2] * 1.4], 0, fold, 0));
    put(part, `${part}p`, { k: 'rod', a: low, b: pawUp, ra: rl, rb: rl * 0.95, ramp: LEG, far: true });
    const pc = add(foot, turn([B.paw[0] * 0.55, 0, B.paw[2]], 0, fold, 0));
    put(part, `${part}paw`, { k: 'ball', c: pc, ax: [turn([B.paw[0], 0, 0], 0, fold, 0), [0, B.paw[1], 0], turn([0, 0, B.paw[2]], 0, fold, 0)], skin: LEG, far: true });
    paws.push(foot);
    // (what of a leg may not pass through the rest of it: from half way down its upper part to its paw)
    things.push({ name: part, pts: [...along(top, mid, 0.55, 1, 2), ...along(mid, low, 0, 1, 3), pc], r: rl * 0.8, may: [`${part}u`, `${part}l`, `${part}p`, `${part}paw`, ...(front ? ['chest', 'ruff', 'barrel'] : ['haunch', 'rump', 'barrel'])] });
    void s;
  });

  // ITS TAIL: the wolf's a thick brush held up and wagging; the fox's a great brush, white-tipped, as long as its body
  const tr = Q.rear(B.tailRoot);
  let tp = tr;
  const tailPts: V3[] = [tr];
  const n = B.tail.length - 1;
  for (let j = 0; j < n; j++) {
    // (its rest: out behind and down, curving; raised by `tail[0]`, wagged by `tail[1]`, the further joints more)
    const droop = (wolf ? 34 : 22) - P.tail[0] + j * (wolf ? 10 : 6);
    const wag = P.tail[1] * (0.55 + 0.25 * j);
    const td = Q.rv(turn([-1, 0, 0], -wag, -droop, 0));
    const nx = add(tp, mul(td, B.tailSeg));
    const tip = j === n - 1;
    const tailRamp: Ramp = tip ? (wolf ? WOLF_SADDLE : FOX_WHITE) : j === 0 && wolf ? WOLF_COAT : COAT;
    put('tail', `tail${j}`, { k: 'rod', a: tp, b: nx, ra: B.tail[j], rb: B.tail[j + 1], ramp: tailRamp });
    put('tail', `tailb${j}`, { k: 'ball', c: lerpV(tp, nx, 0.5), ax: sphere((B.tail[j] + B.tail[j + 1]) * 0.55), skin: tailRamp });
    tp = nx;
    tailPts.push(nx);
  }
  things.push({ name: 'tail', pts: tailPts.slice(2), r: 0.8, may: ['haunch', 'rump', ...Array.from({ length: n }, (_, j) => `tail${j}`), ...Array.from({ length: n }, (_, j) => `tailb${j}`)] });

  const grains: Grain[] = [];
  const nose = add(muzB, mul(H.f, mr1));
  const tip = lerpV(nose, jawTip, 0.5);
  const ref = Q.midP([-1, 0, 15]);
  return {
    bits,
    grains,
    smear: new Set(['head', 'jaw', 'tongue', 'ear1', 'ear-1', 'leg0', 'leg1', 'body']),
    ref: Q.midP(B.spec.pivot),
    review: {
      lumps,
      limbs,
      grips: paws.map((p, i) => ({ name: `paw${i}`, p })),
      things,
      tip,
      follow: { head: H.at, nose, chest: Q.front(B.trunk[0][1]), haunch: Q.rear(B.trunk[4][1]), paw0: paws[0], paw1: paws[1], paw2: paws[2], paw3: paws[3], tail: tp },
      proxy: { at: ref, yaw: P.yaw, pitch: P.pitch, roll: P.roll, twist: P.twist, bend: P.bend, faceTurn: P.head[0], faceUp: -P.head[1] - P.neck },
    },
  };
}
const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);

// =============================================================================================
// ALL SIX: one moment of one of them

/** One moment of one of them: `which` is 'stand', 'walk' (its moving) or 'attack', `t` seconds in. */
export function companionLook(k: Kind, which: string, t: number): Look {
  switch (k) {
    case 'wolf':
      return quadLook(WOLF_BODY, quadPose(WOLF_SPEC, which, t), which, t);
    case 'fox':
      return quadLook(FOX_BODY, quadPose(FOX_SPEC, which, t), which, t);
    case 'tortoise':
      return tortLook(tortPose(which, t));
    case 'snake':
      return snakeLook(snakePose(which, t));
    case 'hawk': {
      const P = wingPose('hawk', which, t);
      return scaleLook(hawkLook(P), FLIER_SCALE.hawk, P.at);
    }
    case 'bat': {
      const P = wingPose('bat', which, t);
      return scaleLook(batLook(P), FLIER_SCALE.bat, P.at);
    }
  }
}

/** The two that fly, drawn a little bigger about their middles than their bones are made (their wings are thin things, and must read on a phone). */
export const FLIER_SCALE = { hawk: 1.2, bat: 1.4 } as const;
/** A moment of one of them made `f` times bigger about `c`: its solids and all the review reads. */
function scaleLook(L: Look, f: number, c: V3): Look {
  const P = (p: V3): V3 => add(c, mul(sub(p, c), f));
  const shape = (sh: Shape): Shape => {
    switch (sh.k) {
      case 'rod':
        return { ...sh, a: P(sh.a), b: P(sh.b), ra: sh.ra * f, rb: sh.rb * f };
      case 'ball':
        return { ...sh, c: P(sh.c), ax: [mul(sh.ax[0], f), mul(sh.ax[1], f), mul(sh.ax[2], f)] };
      case 'panel': {
        const sk = sh.skin;
        return { ...sh, c: P(sh.c), u: mul(sh.u, f), v: mul(sh.v, f), skin: (a: number, b: number, fr2: boolean, tone: number) => sk(a / f, b / f, fr2, tone) };
      }
      case 'dot':
        return { ...sh, p: P(sh.p) };
      default:
        return sh;
    }
  };
  const R = L.review;
  return {
    ...L,
    bits: L.bits.map((b) => ({ ...b, shape: shape(b.shape) })),
    grains: L.grains.map(([p, col, size]) => [P(p), col, size] as const),
    ref: P(L.ref),
    review: {
      lumps: R.lumps.map((o) => ({ ...o, c: P(o.c), h: mul(o.h, f) })),
      limbs: R.limbs.map((l) => ({ ...l, a: P(l.a), b: P(l.b), r: l.r * f })),
      grips: R.grips.map((g) => ({ ...g, p: P(g.p) })),
      things: R.things.map((x) => ({ ...x, pts: x.pts.map(P), r: x.r * f })),
      tip: R.tip ? P(R.tip) : null,
      follow: Object.fromEntries(Object.entries(R.follow).map(([n, p]) => [n, P(p)])),
      proxy: R.proxy,
    },
  };
}

// =============================================================================================
// THE PAINTER

/**
 * ONE FRAME of one of them, from in front or from behind: its solids painted, its friend's cyan edge round it; in the
 * two frames of a strike, the smear of what strikes left on the air behind it (its after-images under it and speed
 * lines over it: art/companions_art_fx.ts); after its blow, its gift where it bit.
 */
export function companionPainted(k: Kind, which: string, t: number, view: GameView = 'front'): Painted {
  const L = companionLook(k, which, t);
  const st = stage(view, COMP_CANVAS.ax, COMP_CANVAS.ay, COMP_CANVAS);
  const after: Grain[] = [...L.grains];
  if (which === 'attack') {
    const beat = beatOf(t);
    // (the strike's two frames, and the one after: what struck smeared behind it)
    if (beat === 'strike' && t > COMP_ATTACK.strike + 1e-6) smearUnder(k, t, view, st, L, after);
    after.push(...giftOf(k, t, (tt) => companionLook(k, 'attack', tt).review.tip));
  }
  const lights = paintBits(st, L.bits, L.ref);
  const px = st.whole(FRIEND_RIM);
  for (const [p, c, size] of after) {
    const [x, y] = st.at(p);
    const xi = Math.round(x - size / 2);
    const yi = Math.round(y - size / 2);
    for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 1 && yi + dy >= 1 && xi + dx < px.w - 1 && yi + dy < px.h - 1) px.set(xi + dx, yi + dy, c);
  }
  return { px, lights };
}

/**
 * THE SMEAR (Movement 9: “smeared with after-images and speed lines”): the parts that strike, painted at four moments
 * of the last frame and a half in one pale tone each, older ones sparser, under the figure (so the figure itself is
 * whole on top and its cyan edge goes round the smear too); and speed lines from where the striking end has been.
 */
function smearUnder(k: Kind, t: number, view: GameView, st: Stage, L: Look, after: Grain[]): void {
  const FR = 1 / COMP_ATTACK.fps;
  const ghost = new Sheet(COMP_CANVAS.w, COMP_CANVAS.h);
  const [pale, mid, faint] = smearColours();
  for (let i = 4; i >= 1; i--) {
    const tt = t - (FR * 1.5 * i) / 4;
    const G = companionLook(k, 'attack', tt);
    ghost.wipe();
    for (const b of G.bits) {
      if (!L.smear.has(b.part)) continue;
      const sh = b.shape;
      if (sh.k === 'ball') ball(ghost, st, sh.c, sh.ax, [pale, pale, pale, pale, pale]);
      else if (sh.k === 'rod') rod(ghost, st, sh.a, sh.b, sh.ra, sh.rb, [pale, pale, pale, pale, pale]);
    }
    const col = i <= 1 ? pale : i === 2 ? mid : faint;
    for (let y = 0; y < ghost.h; y++) {
      for (let x = 0; x < ghost.w; x++) {
        if (!ghost.has(x, y)) continue;
        // (older ones sparser: every pixel, every other, one in four)
        if (i >= 3 && (x + y) % 2 !== 0) continue;
        if (i === 4 && (x % 2 !== 0 || y % 2 !== 0)) continue;
        st.under.set(x, y, col);
      }
    }
  }
  // the speed lines: from the striking end, and from two points either side of it, back along where they have been
  const tips: V3[] = [];
  for (let i = 0; i <= 8; i++) {
    const p = companionLook(k, 'attack', t - (FR * 1.6 * i) / 8).review.tip;
    if (p) tips.push(p);
  }
  if (tips.length < 2) return;
  const way = norm(sub(tips[0], tips[tips.length - 1]));
  const side = norm(cross(way, [0, 0, 1]), [0, 1, 0]);
  const up = norm(cross(side, way));
  for (const [o, n0] of [[[0, 0, 0] as V3, 0], [add(mul(side, 2.2), mul(up, 1.2)), 2], [add(mul(side, -2.2), mul(up, -0.8)), 3]] as const) {
    for (let i = n0; i < tips.length; i++) {
      // (a line, broken: every point along it but a gap now and then)
      const a = add(tips[i], o);
      const b = add(tips[Math.min(tips.length - 1, i + 1)], o);
      for (let s = 0; s <= 3; s++) if ((i + s) % 4 !== 3) after.push([lerpV(a, b, s / 4), i < 3 ? mid : faint, 1]);
    }
  }
  void view;
  void dot;
}

// =============================================================================================
// AS THE GAME HOLDS THEM

/** A frame as the game holds a figure: cut down to it, its pool of cyan light behind it. */
export function companionFrame(k: Kind, which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(companionPainted(k, which, t, view), auraOf(k), COMP_CANVAS.ax, COMP_CANVAS.ay);
}

/** ONE OF THEM AS THE GAME HOLDS A FIGURE: its stand (idle), its moving (walk, its feet gripping: walkStride) and its attack (a clip, its blow at COMP_ATTACK.hit). */
export function makeCompanionArt(k: Kind): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => companionFrame(k, which, t, view);
    const sFps = moveFps(k, 'stand');
    const nStand = Math.round(COMP_STAND.period * sFps);
    const nMove = moveFrames(k);
    const attack: Clip = { frames: lazyFrames(Math.round(COMP_ATTACK.long * COMP_ATTACK.fps) + 1, (i) => frame('attack', i / COMP_ATTACK.fps)), fps: COMP_ATTACK.fps, hit: COMP_ATTACK.hit };
    return {
      idle: lazyFrames(nStand, (i) => frame('stand', i / sFps)),
      walk: lazyFrames(nMove, (i) => frame('walk', i / moveFps(k, 'walk'))),
      attack: lazyFrames(3, (i) => attack.frames[[6, 12, 18][i]]),
      idleFps: sFps,
      walkFps: moveFps(k, 'walk'),
      clips: { attack },
    };
  };
  return { front: set('front'), back: set('back') };
}

// (for the dev page and the tests)
export { KINDS, moveLong, moveFps };
export type { Kind };
void hash;
void INK;
void cl01;
void fr;
void lazyFrames;

// =============================================================================================
// THE TORTOISE: its body

const SHELL: Ramp = ['#1c1a10', '#1c1a10', '#5a4a24', '#86703a', '#86703a'];
/** The middle of each plate of its shell: its growth rings, gold. */
const SHELL_GOLD: Ramp = ['#2a2010', '#2a2010', '#8c6c2a', '#c49c46', '#c49c46'];
const TSKIN: Ramp = ['#1e1c18', '#1e1c18', '#5a5446', '#8a8270', '#8a8270'];
const TPALE: Ramp = ['#3a3020', '#3a3020', '#a08c56', '#d0bc7c', '#d0bc7c'];
const BEAK: Ramp = ['#2a2418', '#2a2418', '#8a7a52', '#c0ae78', '#c0ae78'];
const TORT_PIVOT: V3 = [0, 0, 7];
const TORT_LEGTOP: readonly V3[] = [
  [7.6, -6.4, 5.4],
  [7.6, 6.4, 5.4],
  [-7.6, -6.2, 5.4],
  [-7.6, 6.2, 5.4],
];

/** The plates of its shell, from where on the dome a pixel is (`u`, a unit: forward, left, up): a row down its spine, a row each side, and the small plates round its rim; each plate darker at its seams and gold at its heart. */
function scuteSkin(u: V3, tone: number): string | null {
  if (u[2] < -0.02) return null;
  const seam = SHELL[Math.max(0, tone - 2)];
  const el = Math.asin(Math.min(1, u[2]));
  const az = Math.atan2(u[1], u[0]);
  let fa: number;
  let fb: number;
  if (Math.abs(u[1]) < 0.34 && u[2] > 0.62) {
    // (down its spine: five plates)
    const q = ((u[0] + 0.85) / 1.7) * 5;
    fa = q - Math.floor(q);
    fb = (u[1] + 0.34) / 0.68;
    if (q < 0 || q > 5) return seam;
  } else if (el > 0.42) {
    // (either side: four plates, a seam along the spine row and the rim row)
    const q = ((az + Math.PI) / (2 * Math.PI)) * 8;
    fa = q - Math.floor(q);
    fb = (el - 0.42) / 0.55;
    if (Math.abs(u[1]) < 0.38 && u[2] > 0.58) return seam;
  } else {
    // (the rim: small plates)
    const q = ((az + Math.PI) / (2 * Math.PI)) * 22;
    fa = q - Math.floor(q);
    fb = el / 0.42;
  }
  if (fa < 0.12 || fa > 0.92 || fb < 0.08 || fb > 0.94) return seam;
  if (fa > 0.32 && fa < 0.68 && fb > 0.32 && fb < 0.7) return SHELL_GOLD[tone];
  return SHELL[tone];
}

/** THE TORTOISE, AS SOLIDS: a high dome of plates over a pale under-shell, a flared rim; four stout scaly legs; a beaked head on a wrinkled neck that draws back into the shell. */
function tortLook(P: import('./companions_art_moves').TortPose): Look {
  const { put, bits, lumps, limbs } = recorder();
  const at: V3 = [P.x, P.y, P.z];
  const V = (v: V3): V3 => turn(v, P.yaw, P.pitch, P.roll);
  const W = (p: V3): V3 => add(add(at, TORT_PIVOT), V(sub(p, TORT_PIVOT)));
  // THE SHELL
  put('shell', 'dome', { k: 'ball', c: W([0, 0, 5.6]), ax: [V([12.2, 0, 0]), V([0, 9.6, 0]), V([0, 0, 8.6])], skin: scuteSkin });
  put('shell', 'rim', { k: 'ball', c: W([0, 0, 5.3]), ax: [V([12.9, 0, 0]), V([0, 10.2, 0]), V([0, 0, 1.6])], skin: (u, tone) => (Math.abs(Math.sin(Math.atan2(u[1], u[0]) * 11)) < 0.18 ? SHELL[Math.max(0, tone - 2)] : SHELL[tone]) });
  put('under', 'plastron', { k: 'ball', c: W([0, 0, 4.2]), ax: [V([11.2, 0, 0]), V([0, 8.4, 0]), V([0, 0, 1.5])], skin: TPALE });
  // ITS HEAD on its neck, out of the front of its shell (drawn in: only its beak at the shell's lip)
  const root = W([9.6, 0, 6.2]);
  const nd = V(turn(norm([1, 0, 0.32]), P.head[0] * 0.5, 0, 0));
  const out = 1.0 + 4.2 * P.neck;
  const hc = add(root, mul(nd, out));
  const hf = V(turn([1, 0, 0], P.head[0], P.head[1] - 6, P.head[2]));
  const hl = norm(cross([0, 0, 1], hf), [0, 1, 0]);
  const hu = norm(cross(hf, hl));
  const Hp = (v: V3): V3 => add(hc, add(add(mul(hf, v[0]), mul(hl, v[1])), mul(hu, v[2])));
  put('neck', 'neck', { k: 'rod', a: sub(root, mul(nd, 2.5)), b: hc, ra: 1.8, rb: 1.6, ramp: TSKIN });
  put('head', 'skull', { k: 'ball', c: hc, ax: [mul(hf, 2.9), mul(hl, 2.15), mul(hu, 2.05)], skin: (u, tone) => (u[2] < -0.35 ? TPALE[tone] : TSKIN[tone]) });
  const ga = P.gape * 34;
  put('head', 'beak', { k: 'rod', a: Hp([1.6, 0, 0.1]), b: Hp([3.3, 0, -0.5]), ra: 1.15, rb: 0.5, ramp: BEAK });
  const jw = norm(add(mul(hf, Math.cos(ga * D)), mul(hu, -Math.sin(ga * D))));
  const hinge = Hp([0.4, 0, -1.1]);
  put('head', 'jaw', { k: 'rod', a: hinge, b: add(hinge, mul(jw, 2.8)), ra: 0.95, rb: 0.45, ramp: BEAK });
  for (const s of [1, -1]) put('head', `eye${s}`, { k: 'dot', p: Hp([1.25, s * 1.45, 0.55]), c: P.eyes > 0.5 ? '#100c08' : TSKIN[2], c2: P.eyes > 0.5 ? '#e8d8a0' : undefined, facing: norm(add(mul(hl, s), mul(hf, 0.6))) });
  // ITS LEGS: stout and scaly, bent at the knee, each on a round foot with its claws
  const things: CheckThing[] = [];
  const paws: V3[] = [];
  P.feet.forEach((foot, i) => {
    const front = i < 2;
    const s = i % 2 === 0 ? -1 : 1;
    const top = W(TORT_LEGTOP[i]);
    const ankle = add(foot, [0, 0, 1.6 + P.fold[i] * 0.02]);
    const knee = joint(top, ankle, 4.0, 4.3, V([front ? -0.25 : 0.25, s * 1, 0.7]));
    const part = `leg${i}`;
    put(part, `${part}u`, { k: 'rod', a: top, b: knee, ra: 2.3, rb: 2.0, ramp: TSKIN, far: true });
    put(part, `${part}l`, { k: 'rod', a: knee, b: ankle, ra: 2.0, rb: 2.1, ramp: TSKIN, far: true });
    const fc = add(foot, [front ? 0.4 : -0.2, 0, 1.0]);
    put(part, `${part}foot`, { k: 'ball', c: fc, ax: [[2.2, 0, 0], [0, 2.0, 0], [0, 0, 1.0]], skin: TSKIN, far: true });
    for (const c of [-0.9, 0, 0.9]) put(part, `${part}claw`, { k: 'dot', p: add(foot, [front ? 2.3 : 1.6, c, 0.7]), c: BEAK[3], facing: [1, 0, 0.4] });
    paws.push(foot);
    things.push({ name: part, pts: [knee, ...along(knee, ankle, 0.3, 1, 2)], r: 1.2, may: [`${part}u`, `${part}l`, `${part}foot`, 'rim', 'plastron', 'dome'] });
  });
  put('shell', 'tail', { k: 'rod', a: W([-11.4, 0, 4.8]), b: W([-13.6, 0, 3.4]), ra: 1.0, rb: 0.3, ramp: TSKIN });
  const tip = Hp([3.4, 0, -0.6]);
  const mid = W([0, 0, 7]);
  // (for the review: the dome is painted only above its rim, so it is the shell from its rim up, not the whole ball)
  const dome = lumps.find((o) => o.name === 'dome');
  if (dome) Object.assign(dome, { c: W([0, 0, 8.4]), h: [12.2, 9.6, 5.6] });
  return {
    bits,
    grains: [],
    smear: new Set(['shell', 'head', 'neck', 'under', 'leg0', 'leg1']),
    ref: mid,
    review: {
      lumps,
      limbs,
      grips: paws.map((p, i) => ({ name: `foot${i}`, p })),
      things,
      tip,
      follow: { head: hc, beak: tip, top: W([0, 0, 14]), front: W([12, 0, 5]), back: W([-12, 0, 5]), foot0: paws[0], foot1: paws[1], foot2: paws[2], foot3: paws[3] },
      proxy: { at: mid, yaw: P.yaw, pitch: P.pitch, roll: P.roll, twist: 0, bend: 0, faceTurn: P.head[0], faceUp: -P.head[1] },
    },
  };
}

// =============================================================================================
// THE SNAKE: its body

const SCALE: Ramp = ['#14200e', '#14200e', '#3e6a22', '#6e9a36', '#6e9a36'];
const BAND: Ramp = ['#0a1008', '#0a1008', '#22341a', '#3a5226', '#3a5226'];
const BELLY: Ramp = ['#3a3418', '#3a3418', '#b0a050', '#e0d084', '#e0d084'];
const SNAKE_MOUTH: Ramp = ['#5a4a40', '#5a4a40', '#c8b4a0', '#ecdcc8', '#ecdcc8'];
const SNAKE_TONGUE = '#d0442a';

/** THE SNAKE, AS SOLIDS: a body tapering to its tail, moss-green banded with black, its belly yellow; an arrow-shaped head, broad at the jaws; amber eyes with a slit; a forked tongue that flickers. */
function snakeLook(P: import('./companions_art_moves').SnakePose): Look {
  const { put, bits, lumps, limbs } = recorder();
  const sp = P.spine;
  const N = sp.length;
  const UP: V3 = [0, 0, 1];
  const things: CheckThing[] = [];
  for (let i = 2; i < N; i++) {
    const s = i / (N - 1);
    const r = snakeR(s);
    const tan = norm(sub(sp[i - 1], sp[Math.min(N - 1, i + 1)]), [1, 0, 0]);
    const side = norm(cross(UP, tan), [0, 1, 0]);
    const up = norm(cross(tan, side));
    const banded = (i - 3) % 5 < 2;
    const ramp = banded ? BAND : SCALE;
    put(i < 12 ? 'fore' : 'rear', `seg${i}`, { k: 'ball', c: sp[i], ax: [mul(tan, SNAKE_DS * 0.95), mul(side, r), mul(up, r * 0.92)], skin: (u, tone) => (u[2] < -0.45 ? BELLY[tone] : ramp[tone]) });
    if (i % 2 === 0) things.push({ name: `seg${i}`, pts: [sp[i]], r: r * 0.5, may: Array.from({ length: 11 }, (_, j) => `seg${i - 5 + j}`) });
  }
  // THE HEAD: its jaws open as it strikes, the head tipped up and the lower jaw down, its fangs swung forward
  const f = P.look;
  const l = norm(cross(UP, f), [0, 1, 0]);
  const u = norm(cross(f, l));
  const hc = sp[0];
  const up = P.gape * 30;
  const hf = norm(add(mul(f, Math.cos(up * D)), mul(u, Math.sin(up * D))));
  const hu = norm(cross(hf, l));
  const Hp = (v: V3): V3 => add(hc, add(add(mul(hf, v[0]), mul(l, v[1])), mul(hu, v[2])));
  const headSkin: Skin = (q, tone) => (q[2] < -0.35 ? BELLY[tone] : Math.abs(q[2]) < 0.28 && q[0] < 0.2 ? BAND[tone] : SCALE[tone]);
  put('head', 'skull', { k: 'ball', c: Hp([0.5, 0, 0]), ax: [mul(hf, 2.7), mul(l, 1.75), mul(hu, 1.3)], skin: headSkin });
  put('head', 'jowls', { k: 'ball', c: Hp([-0.9, 0, -0.1]), ax: [mul(hf, 1.6), mul(l, 2.15), mul(hu, 1.4)], skin: headSkin });
  put('head', 'neck', { k: 'ball', c: lerpV(hc, sp[2], 0.5), ax: [mul(f, 1.4), mul(l, snakeR(0.05)), mul(u, snakeR(0.05) * 0.9)], skin: (q, tone) => (q[2] < -0.4 ? BELLY[tone] : SCALE[tone]) });
  const jw = norm(add(mul(f, Math.cos(up * D)), mul(u, -Math.sin(up * D))));
  const hinge = Hp([-1.2, 0, -0.7]);
  const jawTip = add(hinge, mul(jw, 4.0));
  if (P.gape > 0.08) {
    put('jaw', 'jaw', { k: 'rod', a: hinge, b: jawTip, ra: 0.9, rb: 0.55, ramp: BELLY });
    put('jaw', 'mouth', { k: 'ball', c: lerpV(Hp([1.2, 0, -1.0]), lerpV(hinge, jawTip, 0.6), 0.5), ax: [mul(hf, 1.6), mul(l, 1.0), mul(hu, 0.6 + P.gape)], skin: SNAKE_MOUTH });
    for (const s of [1, -1]) {
      const fb = Hp([2.6, s * 0.6, -0.9]);
      put('jaw', `fang${s}`, { k: 'rod', a: fb, b: add(fb, mul(norm(add(mul(hu, -1), mul(hf, 0.35 * P.gape))), 1.5)), ra: 0.35, rb: 0.15, ramp: ['#7a7064', '#7a7064', TOOTH, TOOTH, TOOTH] });
    }
  }
  for (const s of [1, -1]) put('head', `eye${s}`, { k: 'dot', p: Hp([1.2, s * 1.3, 0.45]), c: '#e8b030', c2: '#140c06', facing: norm(add(mul(l, s), mul(hf, 0.5))) });
  const snout = Hp([3.1, 0, -0.3]);
  // its tongue: out, forked, in
  const grains: Grain[] = [];
  if (P.tongue > 0.15 && P.gape < 0.1) {
    const n = Math.round(1 + 3 * P.tongue);
    for (let i = 1; i <= n; i++) grains.push([add(snout, mul(f, 0.9 * i)), SNAKE_TONGUE, 1]);
    const end = add(snout, mul(f, 0.9 * n));
    for (const s of [1, -1]) grains.push([add(add(end, mul(f, 0.8)), add(mul(l, s * 0.7), mul(u, -0.3 * s))), SNAKE_TONGUE, 1]);
  }
  const tip = P.gape > 0.08 ? lerpV(snout, jawTip, 0.5) : snout;
  return {
    bits,
    grains,
    smear: new Set(['head', 'jaw', 'fore']),
    ref: sp[Math.floor(N / 2)],
    review: {
      lumps,
      limbs,
      grips: [],
      things,
      tip,
      follow: { head: hc, neck: sp[6], body: sp[14], hind: sp[24], tail: sp[N - 4] },
      proxy: { at: lerpV(hc, sp[6], 0.5), yaw: 0, pitch: 0, roll: 0, twist: 0, bend: 0, faceTurn: P.hy, faceUp: P.hp },
    },
  };
}
import { snakeR, SNAKE_DS } from './companions_art_moves';

// =============================================================================================
// THE HAWK AND THE BAT: their bodies and wings

const HAWK_BACK: Ramp = ['#1a120c', '#1a120c', '#553a24', '#86603e', '#86603e'];
const HAWK_FLIGHT: Ramp = ['#140e0a', '#140e0a', '#3e2a1c', '#664630', '#664630'];
const HAWK_CREAM: Ramp = ['#4a3c2e', '#4a3c2e', '#c4ac88', '#eedcbc', '#eedcbc'];
const HAWK_STREAK: Ramp = ['#2a1a10', '#2a1a10', '#6e4a2c', '#8e6440', '#8e6440'];
const HAWK_RUFOUS: Ramp = ['#3a1408', '#3a1408', '#a2461c', '#d8743a', '#d8743a'];
const HAWK_YELLOW: Ramp = ['#5a4010', '#5a4010', '#d4a020', '#f6cc4c', '#f6cc4c'];
const HAWK_HOOK: Ramp = ['#14141c', '#14141c', '#3a3a4a', '#646478', '#646478'];
/** His falconer's jesses on its legs: the leather of his own gear, a dark teal. */
const JESS: Ramp = ['#0c2a34', '#0c2a34', '#16525e', '#2a7a84', '#2a7a84'];
const BAT_FUR: Ramp = ['#1c1210', '#1c1210', '#4e3024', '#7a4e36', '#7a4e36'];
const BAT_MANTLE: Ramp = ['#3a2410', '#3a2410', '#a06a2a', '#d09a48', '#d09a48'];
/** Its face: a lighter fur than its body, the fruit bat's fox-like face. */
const BAT_HEAD: Ramp = ['#2a1a10', '#2a1a10', '#7a4e2a', '#a8743e', '#a8743e'];
const MEMBRANE: Ramp = ['#120c10', '#120c10', '#3c2a2e', '#5c4446', '#5c4446'];
const WING_BONE: Ramp = ['#2a1e1e', '#2a1e1e', '#6a5048', '#8e7262', '#8e7262'];

type WP = import('./companions_art_moves').WingPose;
/** Out from the body along its left (s 1) or right (s -1), raised `lift` and swept back `sweep` (degrees), in the body's own frame. */
function outWay(s: number, lift: number, sweep: number): V3 {
  const r: V3 = [0, s * Math.cos(lift * D), Math.sin(lift * D)];
  const ph = s * sweep * D;
  return [r[0] * Math.cos(ph) - r[1] * Math.sin(ph), r[0] * Math.sin(ph) + r[1] * Math.cos(ph), r[2]];
}
/** A flat panel through three corners (a wing's skin between its bones), shaped by `inside` (from `al` along a to b and `be` along a to c, each 0 to 1); its upper face known by `up`. */
function sheetPanel(put: Put, part: string, piece: string, a: V3, b: V3, c: V3, up: V3, inside: (al: number, be: number) => boolean, look: (al: number, be: number, top: boolean, tone: number) => string): void {
  const u = mul(sub(b, a), 0.5);
  const v = mul(sub(c, a), 0.5);
  const lu = len3(u) || 1;
  const lv = len3(v) || 1;
  const flip = dot(cross(u, v), up) < 0;
  put(part, piece, {
    k: 'panel',
    c: add(add(a, u), v),
    u,
    v,
    skin: (pa, pb, front, tone) => {
      const al = (pa / lu + 1) / 2;
      const be = (pb / lv + 1) / 2;
      if (!inside(al, be)) return null;
      return look(al, be, front !== flip, tone);
    },
  });
}

/** THE HAWK, AS SOLIDS: a lean, deep-chested body; a fierce head under a heavy brow, a hooked beak on a yellow cere; broad wings, brown above with pale-barred coverts, cream barred beneath, their tips fingered; a rufous tail that fans; yellow legs and black talons; his jesses on them. */
function hawkLook(P: WP): Look {
  const { put, bits, lumps, limbs } = recorder();
  const B = (v: V3): V3 => turn(v, P.yaw, P.pitch, P.roll);
  const W = (p: V3): V3 => add(P.at, B(p));
  const UPB = B([0, 0, 1]);
  const things: CheckThing[] = [];
  const bodySkin: Skin = (u, tone) => {
    if (u[2] > 0.2) return HAWK_BACK[tone];
    // (its breast cream, streaked down with brown)
    return Math.abs(Math.sin(u[1] * 9 + u[0] * 2)) < 0.28 && u[0] > -0.6 ? HAWK_STREAK[tone] : HAWK_CREAM[tone];
  };
  put('body', 'torso', { k: 'ball', c: W([0, 0, 0]), ax: [B([4.3, 0, 0]), B([0, 2.7, 0]), B([0, 0, 2.6])], skin: bodySkin });
  put('body', 'breast', { k: 'ball', c: W([2.0, 0, -0.5]), ax: [B([2.8, 0, 0]), B([0, 2.6, 0]), B([0, 0, 2.6])], skin: bodySkin });
  // THE HEAD
  const hc = W([4.5, 0, 1.6]);
  const hf = B(turn([1, 0, 0], P.hy, P.hp + (P.pitch < 0 ? 0 : 0), 0));
  const hl = norm(cross(UPB, hf), B([0, 1, 0]));
  const hu = norm(cross(hf, hl));
  const Hp = (v: V3): V3 => add(hc, add(add(mul(hf, v[0]), mul(hl, v[1])), mul(hu, v[2])));
  put('head', 'skull', { k: 'ball', c: hc, ax: [mul(hf, 2.3), mul(hl, 1.95), mul(hu, 2.0)], skin: (u, tone) => (u[2] < -0.3 ? HAWK_CREAM[tone] : u[2] > 0.25 ? HAWK_BACK[tone] : Math.abs(u[1]) > 0.55 && u[2] < 0.1 ? HAWK_STREAK[tone] : HAWK_CREAM[tone]) });
  put('head', 'brow', { k: 'ball', c: Hp([1.0, 0, 1.0]), ax: [mul(hf, 1.3), mul(hl, 1.75), mul(hu, 0.6)], skin: HAWK_BACK });
  put('head', 'cere', { k: 'rod', a: Hp([1.6, 0, 0.25]), b: Hp([2.3, 0, 0.05]), ra: 0.85, rb: 0.75, ramp: HAWK_YELLOW });
  put('beak', 'hook', { k: 'rod', a: Hp([2.2, 0, 0.05]), b: Hp([3.3, 0, -0.45]), ra: 0.75, rb: 0.4, ramp: HAWK_HOOK });
  put('beak', 'hooktip', { k: 'rod', a: Hp([3.2, 0, -0.4]), b: Hp([3.3, 0, -1.1]), ra: 0.38, rb: 0.15, ramp: HAWK_HOOK });
  if (P.gape > 0.1) put('beak', 'lower', { k: 'rod', a: Hp([1.9, 0, -0.5]), b: add(Hp([1.9, 0, -0.5]), mul(norm(add(mul(hf, 1), mul(hu, -0.6 * P.gape))), 1.3)), ra: 0.45, rb: 0.25, ramp: HAWK_YELLOW });
  for (const s of [1, -1]) put('head', `eye${s}`, { k: 'dot', p: Hp([1.25, s * 1.3, 0.55]), c: '#140c06', c2: '#f0c040', facing: norm(add(mul(hl, s), mul(hf, 0.5))) });
  // THE WINGS
  const wingBones: [string, V3, V3, V3][] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? 'L' : 'R';
    const S = W([1.3, s * 2.2, 1.2]);
    const lift = P.lift[s > 0 ? 0 : 1];
    const arm = B(outWay(s, lift, P.sweep));
    const Wr = add(S, mul(arm, 7));
    const hand = B(outWay(s, lift - P.droop, P.sweep + 15 + 75 * P.fold));
    const T = add(Wr, mul(hand, 10 * (1 - 0.25 * P.fold)));
    const back1 = norm(sub(B([-1, 0, 0]), mul(arm, dot(B([-1, 0, 0]), arm))), B([-1, 0, 0]));
    const back2 = norm(sub(B([-1, 0, 0]), mul(hand, dot(B([-1, 0, 0]), hand))), B([-1, 0, 0]));
    const look = (al: number, be: number, top: boolean, tone: number, outer: boolean): string => {
      if (top) {
        if (be < 0.42 && !outer) return Math.abs(be - 0.36) < 0.05 ? HAWK_CREAM[Math.min(tone, 2)] : HAWK_BACK[tone];
        return (al * 7 + be * 2) % 1 < 0.18 ? HAWK_BACK[tone] : HAWK_FLIGHT[tone];
      }
      if (outer && al > 0.78) return HAWK_FLIGHT[tone];
      return be > 0.45 && (al * (outer ? 8 : 6) + be * 1.5) % 1 < 0.25 ? HAWK_STREAK[tone] : HAWK_CREAM[Math.max(1, tone - 1)];
    };
    // (the inner wing, from the body to the wrist, broad; the hand, tapering to its fingered tip)
    sheetPanel(put, `wing${side}`, `inner${side}`, S, Wr, add(S, mul(back1, 7.6)), UPB, (al, be) => be <= 1 - 0.3 * al * al, (al, be, top, tone) => look(al, be, top, tone, false));
    sheetPanel(put, `wing${side}`, `outer${side}`, Wr, T, add(Wr, mul(back2, 6.4)), UPB, (al, be) => {
      if (be > 1 - 0.78 * Math.pow(al, 1.4) || be < 0.3 * al * al) return false;
      return !(al > 0.62 && (be * 5) % 1 > 0.72);
    }, (al, be, top, tone) => look(al, be, top, tone, true));
    wingBones.push([side, S, Wr, T]);
    limbs.push({ name: `arm${side}`, a: S, b: Wr, r: 0.8 }, { name: `hand${side}`, a: Wr, b: T, r: 0.6 });
  }
  for (const [side, S, Wr, T] of wingBones) things.push({ name: `wing${side}`, pts: [...along(S, Wr, 0.45, 1, 3), ...along(Wr, T, 0.25, 1, 4)], r: 0.6, may: [`arm${side}`, `hand${side}`, 'torso', 'breast'] });
  // THE TAIL: a fan, rufous, a dark band near its pale tip
  const tr = W([-4.0, 0, 0.3]);
  const td = B(turn([-1, 0, 0], 0, -P.tailDown, 0));
  const tw = 1.7 + 2.4 * P.fan;
  const tl = B([0, 1, 0]);
  sheetPanel(put, 'tail', 'tail', add(tr, mul(tl, -tw)), add(tr, mul(tl, tw)), add(add(tr, mul(tl, -tw)), mul(td, 9)), UPB, (al, be) => {
    const half = 0.18 + 0.32 * be;
    return Math.abs(al - 0.5) <= half && !(be > 0.88 && Math.abs(al - 0.5) > half * 0.75);
  }, (_al, be, _top, tone) => (be > 0.9 ? HAWK_CREAM[tone] : be > 0.74 ? HAWK_FLIGHT[tone] : HAWK_RUFOUS[tone]));
  // ITS LEGS: feathered thighs, yellow legs, black talons; tucked under its tail in flight, flung forward to strike
  const feet: V3[] = [];
  for (const s of [1, -1]) {
    const thigh = W([0.4, s * 1.3, -1.8]);
    put('legs', `thigh${s}`, { k: 'ball', c: thigh, ax: [B([1.3, 0, 0]), B([0, 1.0, 0]), B([0, 0, 1.5])], skin: HAWK_CREAM });
    const foot = W([mix3(-2.6, 5.2, P.legs), s * 1.2, mix3(-3.0, -5.6, P.legs)]);
    put('legs', `leg${s}`, { k: 'rod', a: thigh, b: foot, ra: 0.6, rb: 0.5, ramp: HAWK_YELLOW });
    for (const [dx, dy] of [[1, 0], [0.7, 0.7], [0.7, -0.7], [-1, 0]] as const) {
      const spread = 0.6 + 0.9 * P.open;
      const way = add(B([dx * 0.8, dy * spread * 0.9, -0.6]), mul(B([1, 0, 0]), 0.3 * P.legs));
      put('legs', `talon${s}`, { k: 'rod', a: foot, b: add(foot, mul(norm(way), 1.3)), ra: 0.35, rb: 0.15, ramp: HAWK_HOOK });
    }
    // (his jesses: two straps of leather off the leg, streaming behind)
    const j0 = lerpV(thigh, foot, 0.75);
    put('jess', `jess${s}`, { k: 'rod', a: j0, b: add(j0, B([-2.6, s * 0.3, -1.6])), ra: 0.3, rb: 0.3, ramp: JESS });
    feet.push(foot);
  }
  const tip = lerpV(feet[0], feet[1], 0.5);
  return {
    bits,
    grains: [],
    smear: new Set(['body', 'head', 'beak', 'wingL', 'wingR', 'tail', 'legs', 'jess']),
    ref: P.at,
    review: {
      lumps,
      limbs,
      grips: [],
      things,
      tip,
      follow: { head: hc, body: P.at, tail: add(tr, mul(td, 8)), wristL: wingBones[0][2], wristR: wingBones[1][2], tipL: wingBones[0][3], tipR: wingBones[1][3], feet: tip },
      proxy: { at: P.at, yaw: P.yaw, pitch: P.pitch, roll: P.roll, twist: 0, bend: 0, faceTurn: P.hy, faceUp: -P.hp },
    },
  };
}
const mix3 = (a: number, b: number, k: number): number => a + (b - a) * k;

/** THE BAT, AS SOLIDS: a fruit bat: a furred brown body under a golden mantle, a fox-like snout, amber eyes, pointed ears; wings of dark skin stretched over its arm and three long fingers, scalloped between their tips; small hooked feet. */
function batLook(P: WP): Look {
  const { put, bits, lumps, limbs } = recorder();
  const B = (v: V3): V3 => turn(v, P.yaw, P.pitch, P.roll);
  const W = (p: V3): V3 => add(P.at, B(p));
  const UPB = B([0, 0, 1]);
  const things: CheckThing[] = [];
  put('body', 'torso', { k: 'ball', c: W([0, 0, 0]), ax: [B([2.6, 0, 0]), B([0, 1.9, 0]), B([0, 0, 2.0])], skin: BAT_FUR });
  put('body', 'mantle', { k: 'ball', c: W([1.5, 0, 0.5]), ax: [B([1.6, 0, 0]), B([0, 2.05, 0]), B([0, 0, 1.9])], skin: BAT_MANTLE });
  const hc = W([3.3, 0, 1.0]);
  const hf = B(turn([1, 0, 0], P.hy, P.hp, 0));
  const hl = norm(cross(UPB, hf), B([0, 1, 0]));
  const hu = norm(cross(hf, hl));
  const Hp = (v: V3): V3 => add(hc, add(add(mul(hf, v[0]), mul(hl, v[1])), mul(hu, v[2])));
  put('head', 'skull', { k: 'ball', c: hc, ax: [mul(hf, 1.75), mul(hl, 1.55), mul(hu, 1.55)], skin: BAT_HEAD });
  put('head', 'snout', { k: 'rod', a: Hp([0.9, 0, -0.2]), b: Hp([2.5, 0, -0.7]), ra: 0.95, rb: 0.55, ramp: BAT_HEAD });
  put('head', 'nose', { k: 'ball', c: Hp([2.6, 0, -0.55]), ax: [mul(hf, 0.45), mul(hl, 0.55), mul(hu, 0.45)], skin: NOSE });
  const ga = P.gape * 40;
  const hinge = Hp([0.6, 0, -0.9]);
  const jaw = add(hinge, mul(norm(add(mul(hf, Math.cos(ga * D)), mul(hu, -Math.sin(ga * D)))), 1.9));
  put('jaw', 'jaw', { k: 'rod', a: hinge, b: jaw, ra: 0.6, rb: 0.4, ramp: BAT_FUR });
  if (P.gape > 0.3) for (const s of [1, -1]) put('jaw', `fang${s}`, { k: 'rod', a: Hp([2.1, s * 0.35, -0.85]), b: Hp([2.1, s * 0.35, -1.7]), ra: 0.3, rb: 0.12, ramp: ['#7a7064', '#7a7064', TOOTH, TOOTH, TOOTH] });
  for (const s of [1, -1]) {
    put('head', `eye${s}`, { k: 'dot', p: Hp([1.05, s * 0.9, 0.45]), c: AMBER, facing: norm(add(mul(hl, s), mul(hf, 0.6))) });
    const eb = Hp([-0.3, s * 0.95, 1.0]);
    put(`ear${s}`, `ear${s}`, { k: 'rod', a: eb, b: add(eb, mul(norm(add(add(mul(hu, 1), mul(hl, s * 0.45)), mul(hf, -0.2 - 0.6 * P.ears))), 2.3)), ra: 0.65, rb: 0.12, ramp: NOSE });
  }
  // THE WINGS: arm, forearm, three fingers; the skin between them
  const wing: [string, V3, V3, V3, V3[]][] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? 'L' : 'R';
    const S = W([0.8, s * 1.4, 0.7]);
    const lift = P.lift[s > 0 ? 0 : 1];
    const arm = B(outWay(s, lift, P.sweep - 25));
    const E = add(S, mul(arm, 3.0));
    const fore = B(outWay(s, lift - P.droop * 0.5, P.sweep + 18 + 40 * P.fold));
    const Wr = add(E, mul(fore, 5.0));
    const plane = norm(cross(fore, B([-1, 0, 0])));
    const n = dot(plane, UPB) < 0 ? mul(plane, -1) : plane;
    const spread = 1 - 0.7 * P.fold;
    const tips = [[4, 8.2], [50, 7.2], [100, 6.2]].map(([ang, L]) => add(Wr, mul(norm(rotIn(fore, n, s * ang * spread)), L * (1 - 0.25 * P.fold))));
    const hip = W([-2.0, s * 1.1, -0.6]);
    const scallop = (al: number, be: number): boolean => {
      const sum = al + be;
      if (sum > 1) return false;
      const g = sum > 1e-6 ? be / sum : 0;
      return sum <= 1 - 0.22 * 4 * g * (1 - g);
    };
    const skin = (_al: number, _be: number, top: boolean, tone: number): string => MEMBRANE[top ? tone : Math.max(0, tone - 1)];
    const part = `wing${side}`;
    sheetPanel(put, part, `m1${side}`, Wr, tips[0], tips[1], UPB, scallop, skin);
    sheetPanel(put, part, `m2${side}`, Wr, tips[1], tips[2], UPB, scallop, skin);
    sheetPanel(put, part, `m3${side}`, Wr, tips[2], hip, UPB, scallop, skin);
    sheetPanel(put, part, `m4${side}`, E, Wr, hip, UPB, (al, be) => al + be <= 1, skin);
    sheetPanel(put, part, `m5${side}`, S, E, hip, UPB, (al, be) => al + be <= 1, skin);
    put(part, `armb${side}`, { k: 'rod', a: S, b: E, ra: 0.6, rb: 0.45, ramp: WING_BONE });
    put(part, `foreb${side}`, { k: 'rod', a: E, b: Wr, ra: 0.45, rb: 0.38, ramp: WING_BONE });
    for (const [i, tp] of tips.entries()) put(part, `finger${i}${side}`, { k: 'rod', a: Wr, b: tp, ra: 0.3, rb: 0.18, ramp: WING_BONE });
    put(part, `thumb${side}`, { k: 'rod', a: Wr, b: add(Wr, mul(norm(add(fore, mul(B([1, 0, 0]), 1.2))), 1.0)), ra: 0.32, rb: 0.15, ramp: WING_BONE });
    wing.push([side, S, E, Wr, tips]);
  }
  for (const [side, , E, Wr, tips] of wing) things.push({ name: `wing${side}`, pts: [E, Wr, ...tips], r: 0.4, may: [`armb${side}`, `foreb${side}`, `finger0${side}`, `finger1${side}`, `finger2${side}`, `thumb${side}`, 'torso', 'mantle'] });
  // its feet: small, hooked, drawn up under it; reaching as it clings
  const feet: V3[] = [];
  for (const s of [1, -1]) {
    const hip = W([-2.0, s * 0.9, -0.8]);
    const ft = W([mix3(-3.4, 1.8, P.legs), s * 1.0, mix3(-1.6, -3.0, P.legs)]);
    put('feet', `foot${s}`, { k: 'rod', a: hip, b: ft, ra: 0.4, rb: 0.3, ramp: BAT_FUR });
    feet.push(ft);
  }
  const tip = lerpV(Hp([2.6, 0, -0.6]), jaw, 0.5);
  return {
    bits,
    grains: [],
    smear: new Set(['body', 'head', 'jaw', 'wingL', 'wingR', 'ear1', 'ear-1', 'feet']),
    ref: P.at,
    review: {
      lumps,
      limbs,
      grips: [],
      things,
      tip,
      follow: { head: hc, body: P.at, wristL: wing[0][3], wristR: wing[1][3], tipL: wing[0][4][0], tipR: wing[1][4][0], feet: lerpV(feet[0], feet[1], 0.5) },
      proxy: { at: P.at, yaw: P.yaw, pitch: P.pitch, roll: P.roll, twist: 0, bend: 0, faceTurn: P.hy, faceUp: -P.hp },
    },
  };
}
/** A direction turned about an axis (a unit) by `deg`. */
function rotIn(v: V3, axis: V3, deg: number): V3 {
  const c = Math.cos(deg * D);
  const s = Math.sin(deg * D);
  return add(add(mul(v, c), mul(cross(axis, v), s)), mul(axis, dot(axis, v) * (1 - c)));
}

// =============================================================================================
// FOR THE BOSS CHECKS (art/boss_checks.ts, checkBoss: his rulebook's How art is made 7)
//
// The review was made for figures on the heroes' bones. These six are not on them, so the review is handed what it
// asks of each from its own body (BossShape: its outside as solids, what grips the floor, what may not pass through
// what, the end it strikes with, the points it follows from frame to frame and from move to move), and stands a set of
// the heroes' bones in for it only where it reads the bones themselves: its middle, rising and swaying (ALIVE), its
// haunches and its chest getting going in a blow (HIPS), and its body held in the warning (BLOW). Those bones are moved
// as its own body is (its middle where its middle is, turned as its haunches and its chest are), a key every sixtieth
// of a second, each key carrying the move and the moment (`prop`, `pt`) so that its outside is asked at that moment.

import { buildOf, standing } from './skeleton';
import type { Bones, Key3 } from './skeleton';
import type { Mob, MobMove } from './new_mobs3';
import type { BossShape } from './boss_checks';
import { groundOf, COMP_GAIT } from './companions_art_moves';

const MOVE_IDS = ['stand', 'walk', 'attack'] as const;
/** EACH OF THEM AS THE BOSS CHECKS TAKE A FIGURE: the bones that stand in for it, and its shape. Its moves: its stand, its moving ('walk') and its attack. */
export function companionReview(k: Kind): { mob: Mob; shape: BossShape; moves: string[] } {
  const build = buildOf(57);
  const rest = standing(build);
  const memo = new Map<string, Review>();
  const rev = (which: string, t: number): Review => {
    const key = `${which}@${Math.round(t * 600)}`;
    let r = memo.get(key);
    if (!r) memo.set(key, (r = companionLook(k, which, t).review));
    return r;
  };
  const at0 = rev('stand', 0).proxy.at;
  const moveOf = (which: (typeof MOVE_IDS)[number]): MobMove => {
    const long = moveLong(k, which);
    const n = Math.round(long * 60);
    const keys: Key3[] = [];
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * long;
      const p = rev(which, t).proxy;
      const pose: Partial<Bones> = { px: p.at[0] - at0[0], py: p.at[1] - at0[1], pz: p.at[2] - at0[2], yaw: p.yaw, pitch: p.pitch, roll: p.roll, twist: p.twist, bend: p.bend, faceTurn: p.faceTurn, faceUp: p.faceUp, pt: t, prop: MOVE_IDS.indexOf(which) };
      keys.push({ at: t, pose });
    }
    const mv: MobMove = { name: which, motion: { keys, ...(which === 'attack' ? { hit: COMP_ATTACK.hit } : { loop: 0 }) }, rest };
    if (which === 'walk') {
      mv.ground = groundOf(k);
      mv.period = COMP_GAIT[k].period;
    }
    return mv;
  };
  const stand = moveOf('stand');
  const walk = moveOf('walk');
  const attack = moveOf('attack');
  const sFps = moveFps(k, 'stand');
  const mob = {
    id: `companion_${k}`,
    name: k,
    size: 'small',
    build,
    stand,
    attack,
    walk,
    idleFrames: Math.round(COMP_STAND.period * sFps),
    idleFps: sFps,
    walkFrames: moveFrames(k),
    walkFps: moveFps(k, 'walk'),
    pace: COMP_GAIT[k].pace,
    reel: stand,
    reelTime: 0.1,
    hit: COMP_ATTACK.hit,
    warn: COMP_ATTACK.coiled,
    dieTime: 0.1,
    dying: stand,
    aura: auraOf(k),
    shadow: COMP_SHADOW[k],
    bits: () => [],
  } as unknown as Mob;
  const whenOf = (q: { pt: number; prop: number }): [string, number] => [MOVE_IDS[q.prop] ?? 'stand', q.pt];
  const shape: BossShape = {
    body: (_s, q) => {
      const [which, t] = whenOf(q as unknown as { pt: number; prop: number });
      const r = rev(which, t);
      return { limbs: r.limbs, lumps: r.lumps };
    },
    things: (which, t) => rev(which, t).things,
    tip: (which, t) => (which === 'attack' ? rev(which, t).tip : null),
    grips: (which, t) => rev(which, t).grips,
    arms: () => [],
    follow: (which, t) => rev(which, t).follow,
    pictures: ['reel', 'dying'],
  };
  return { mob, shape, moves: ['stand', 'walk', 'attack'] };
}

// =============================================================================================
// THEIR ICONS (as the attack buttons' are, art/ability_icons.ts: 32 picture pixels square, flat tones, the seam round
// each part, the light from the upper left): each animal itself, in the painter its figures are painted in, drawn up big
// in the pose it is best known by, with the friend's cyan edge round it.

import { Px } from '../engine/px';
/** The pose each is drawn in for its icon, how much bigger than in the game, and where its floor point sits on the icon. */
const ICON_POSE: Record<Kind, { which: string; t: number; k: number; x: number; y: number; view?: GameView }> = {
  hawk: { which: 'stand', t: 0.3, k: 0.92, x: 16, y: 44, view: 'back' },
  snake: { which: 'stand', t: 0.3, k: 1.5, x: 11, y: 29 },
  wolf: { which: 'stand', t: 0.9, k: 0.95, x: 11, y: 29 },
  bat: { which: 'stand', t: 0.3, k: 0.8, x: 16, y: 38, view: 'front' },
  fox: { which: 'stand', t: 0.6, k: 1.25, x: 14, y: 29 },
  tortoise: { which: 'stand', t: 0, k: 1.05, x: 15, y: 27 },
};
/** A solid made `f` times bigger about the floor point. */
function bigger(sh: Shape, f: number): Shape {
  const P = (p: V3): V3 => mul(p, f);
  switch (sh.k) {
    case 'rod':
      return { ...sh, a: P(sh.a), b: P(sh.b), ra: sh.ra * f, rb: sh.rb * f };
    case 'ball':
      return { ...sh, c: P(sh.c), ax: [P(sh.ax[0]), P(sh.ax[1]), P(sh.ax[2])] };
    case 'panel': {
      const sk = sh.skin;
      return { ...sh, c: P(sh.c), u: P(sh.u), v: P(sh.v), skin: (a: number, b: number, fr2: boolean, tone: number) => sk(a / f, b / f, fr2, tone) };
    }
    case 'dot':
      return { ...sh, p: P(sh.p) };
    default:
      return sh;
  }
}
/** Its icon: 32 picture pixels square. */
export function companionIcon(k: Kind): Px {
  const I = ICON_POSE[k];
  const L = companionLook(k, I.which, I.t);
  const st = stage(I.view ?? 'front', I.x, I.y, { w: 32, h: 32 });
  paintBits(st, L.bits.map((b) => ({ ...b, shape: bigger(b.shape, I.k) })), mul(L.ref, I.k));
  return st.whole(FRIEND_RIM);
}
