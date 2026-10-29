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
import { COMP_ATTACK, COMP_STAND, D, FOX_SPEC, KINDS, WOLF_SPEC, add, beatOf, cl01, cross, dot, fr, joint, lerpV, moveFps, moveFrames, moveLong, mul, norm, quadPose, sub, turn } from './companions_art_moves';
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
    default:
      return quadLook(WOLF_BODY, quadPose(WOLF_SPEC, which, t), which, t);
  }
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
