// FLOOR 13'S BOSS, THE PALIMPSEST (the art chat for floors 11 to 15, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME.
// Nothing of the game imports this file; `PALIMPSEST_ON`, the switch the main chat would put it in by, is off. Its
// moves are art/palimpsest_moves.ts; what it throws across the floor, art/palimpsest_shots.ts.
//
// His doc "Wordsmith Act 2: The Hush" (the planning chat's, with his yes as ideas), level 13, THE MILLRACE: “Boss: The
// Palimpsest. Its floor is The Pulping Floor. A giant of wet, layered pages, written and scraped and written over.
// Every hit peels pages off and shows older writing underneath.” Its moves there: “a pulp-fist slam (its basic attack);
// Paper Cuts, a whirl of slicing pages around it; Loose Leaves, pages that flap off as paper birds and dive at you;
// Rewrite, where it soaks fallen pages back up to heal unless they're burned. Fire words shine here.” And the story:
// “The Silent Order pulps the stolen words into ink and paper, and the pages go back into the city.”
//
// Made on his word to this chat of 18 Oct, 21:24 Pacific: “Hey go without my say so.  If something is shit I’ll get it
// to it but you’re doing a great jobs. At least for 11-15”. So its brief is this chat's, the picks it would have
// marked recommended, sent him as it is made:
// - SIZE AND BEARING: a giant, near twice the knight's height, hunched like a great ape, its arms so long its fists
//   hang by its knees; slow and heavy, then a crash. (The Crier, his "smaller, quick moving, no frills fight", was
//   floor 11's; this is the other kind.)
// - WHAT IT IS MADE OF: sheet on sheet of wet paper plastered over each other like papier-mâché, every one written
//   over in the Order's black ink; where one has peeled, OLDER WRITING beneath it, brown on yellowed vellum, scraped
//   and written again; and deep down in the oldest of it, the stolen words, letters burning the enemy's pink. A
//   crest of loose leaves stands up off its back, stirring (they are the paper birds of its Loose Leaves).
// - ITS FISTS: two great balled lumps of grey pulp, bigger than its head, dripping slurry.
// - ITS HEAD: small, sunk low between the shoulders; a single page plastered over its face like a mask, two holes
//   torn in it with the pink burning through, and the Order's black bar of ink struck across where a mouth would be.
// - WEAR: "every hit peels pages off": painted at any wear from 0 (whole) to 1 (half its pages gone, the old writing
//   and the burning words showing all over), so the game may show it more torn as its life runs down.
// - FIRE WORDS SHINE: its pages burn (the shots' fallen pages: art/palimpsest_shots.ts).
// And his words of 18 Oct on the act's enemies: Act 2's own, nothing of Act 1's (no cult robe, no bone, no violet).
//
// ON THE HEROES' BONES (art/skeleton.ts), as the Crier is: a monster of art/new_mobs3.ts's kind, on a canvas of its own.

import { hash } from './kit';
import type { Ramp } from './kit';
import { FLAME, SOCKET } from './mkit';
import { packed, sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, PanelSkin, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Skin, Stage } from './skin';
import { add, buildOf, cross, dot, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file; the main chat puts it in by it, on the owner's yes. */
export const PALIMPSEST_ON = { on: false };
/** For looking at it piece by piece (the dev page): what to leave off. */
export const PA_OFF: Record<string, boolean> = {};

const fr = (t: number): number => t - Math.floor(t);
export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

// =============================================================================================
// ITS COLOURS (each from its shade to its light: two darks, a middle, two lights)

/** The newest pages: wet paper, a cool grey-cream, darker where it is soaked. */
export const PAPER: Ramp = ['#26231f', '#4a453c', '#827b6b', '#b2aa95', '#d2c9b0'];
/** The pages' backs, as they peel: a step duller. */
const BACK: Ramp = ['#211e1a', '#3e3a32', '#6c6658', '#948c79', '#aea58f'];
/** The Order's black ink, the newest writing. */
const INK_NEW = '#1a1720';
/** The scraped writing under it, half gone. */
const INK_SCRAPED = '#6e6352';
/** The older layers: vellum gone yellow-brown, written in brown ink. */
export const OLD: Ramp = ['#251a10', '#4a3720', '#7c6440', '#a48a5c', '#bea472'];
const INK_OLD = '#3e2616';
/** The pulp of its fists and feet: grey slurry, wet. */
export const PULP: Ramp = ['#1e1d1b', '#383631', '#5e5a51', '#857f72', '#a39c8c'];
/** The burning words deep in it: the enemy's pink to gold (FLAME). */
const WORD = FLAME;

// =============================================================================================
// THE BODY

/** Near twice the knight's height (58): 110 tall standing straight, a giant's build: shoulders, chest and arms huge, short thick legs, a small head. */
export const PA_BODY: Build = buildOf(110, 1.0, { shoulders: 1.36, chest: 1.36, depth: 1.28, waist: 1.2, hips: 1.1, legs: 0.92, arms: 1.18, trunk: 1.0, limbs: 1.42, pad: 2.6 });
const B = PA_BODY;
/** Its picture: room for its fists raised over its head, and for the whirl of its Paper Cuts round it (PA_WHIRL). */
export const PA_CANVAS: MobCanvas = { w: 520, h: 470, ax: 250, ay: 350 };
/** The whirl of its Paper Cuts: the pages fly round it between these distances from its middle (figure lengths; a tile is TILE3). */
export const PA_WHIRL = { inner: 44, outer: 100 } as const;

const REST0: Bones = {
  ...standing(B),
  pz: -4.5, pitch: 10, bend: 16, roll: 0, side: 0, yaw: 0, twist: 0, faceUp: 22, faceTilt: -3, faceTurn: 0,
  lfx: 1.6, lfy: 3.4, lft: 16, lk: 18, rfx: -1.4, rfy: -3.4, rft: -14, rk: -18,
  // (the arms hanging at its sides and a little before them, out from its bulk, the fists by its knees)
  lhIn: 0, lhx: 5, lhy: 9, lhz: -41, le: -22,
  rhIn: 0, rhx: 4, rhy: -9, rhz: -41, re: 22,
  pt: 0, out: 0,
} as Bones;
/** Its rest: hunched forward, heavy, its knees bent; its arms hanging before it, the great fists by its knees; its sunk head lifted to look ahead. */
export const PA_REST: Bones = REST0;

// =============================================================================================
// ITS SKIN: SHEETS OF PAPER, AND THE OLD WRITING UNDER THEM

/**
 * A PAGE (a flat panel's skin): wet paper, torn at its edges; its writing in rows across it in the Order's black ink;
 * under that, half scraped away, an older hand at a slant; its lower edge curled out and catching the light, a dark
 * line under it. `seed`: which page; `scorch` (0 none, 1 all): its edges blackened.
 */
export function pageSkin(seed: number, lu: number, lv: number, shade = 0, blade = 0): PanelSkin {
  return (a, b, front, tone0) => {
    // (paper is pale even in the shade: its tones drawn up toward the light)
    const tone = [1, 2, 3, 3, 4][Math.max(0, Math.min(4, tone0 - shade))];
    // (torn edges: a ragged line in from each edge)
    const ja = 0.4 + 1.0 * hash(Math.floor((b + lv) / 1.6), seed, 7101);
    const jb = 0.3 + 1.0 * hash(Math.floor((a + lu) / 1.6), seed, 7102);
    if (Math.abs(a) > lu - ja || Math.abs(b) > lv - jb) return null;
    // (a page flung out to cut: its edges glinting the enemy's pink)
    if (blade > 0.05 && (Math.abs(a) > lu - ja - 0.9 || Math.abs(b) > lv - jb - 0.9)) return blade > 0.6 ? WORD[3] : WORD[2];
    if (!front) return BACK[tone];
    // (its lower edge, curled out: the dark under it, and a lit lip above that)
    if (b > lv - jb - 1.0) return INK_NEW;
    if (b > lv - jb - 2.0) return PAPER[Math.min(4, tone + 1)];
    // (its sides a step darker, where it lies on the page beside it)
    const side = Math.abs(a) > lu - ja - 0.9;
    // (soaked, here and there: a step darker, in big soft patches)
    const damp = hash(Math.floor((a + 30) / 5.5), Math.floor((b + 30) / 4.5) + seed * 7, 7103) < 0.22;
    const base = PAPER[Math.max(0, tone - (damp || side ? 1 : 0))];
    // the writing: lines of it three lengths apart, inside a margin; words with gaps between, the lines ragged at their ends
    const rowH = 2.9;
    const rb = b + lv - 2.6;
    const row = Math.floor(rb / rowH);
    const end = lu - ja - 1.3 - 2.2 * hash(row, seed, 7107);
    if (rb - row * rowH < 0.95 && rb > 0 && b < lv - jb - 2.6 && a > -lu + ja + 1.3 && a < end) {
      const off = hash(row, seed, 7104) * 4;
      const word = Math.floor((a + lu + off) / 4.6);
      if (fr((a + lu + off) / 4.6) < 0.76 && hash(word, row + seed * 13, 7105) < 0.9) return tone >= 3 ? INK_SCRAPED : INK_NEW;
    }
    return base;
  };
}

/** THE OLD LAYERS: yellowed vellum written in brown, row on row; and in it, here and there, a stolen word burning (more of them as it wears). `scale`: the solid's size, so the rows are the same size on every part. */
function oldSkin(seed: number, scale: V3, burn: number, melt = 0): Skin {
  return (u, tone0) => {
    const tone = [1, 1, 2, 3, 4][tone0];
    // (melting to grey pulp as it sinks: more of it the further it has gone, in lumps)
    if (melt > 0 && hash(Math.floor(u[0] * 4 + 9), Math.floor(u[1] * 4 + 9) + Math.floor(u[2] * 4 + 9) * 13, seed + 7117) < melt) return pulpSkin(u, tone0, 0, 0);
    const z = u[2] * scale[2];
    const around = Math.atan2(u[1] * scale[1], u[0] * scale[0]) * ((scale[0] + scale[1]) / 2);
    const row = Math.floor(z / 2.7);
    const inRow = z - row * 2.7 < 0.9;
    if (inRow) {
      const w = Math.floor((around + hash(row, seed, 7111) * 4) / 3.6);
      const lit = hash(w, row + seed * 11, 7112);
      // (a stolen word, burning in the oldest writing)
      if (lit < 0.05 + 0.1 * burn) return lit < 0.02 + 0.04 * burn ? WORD[3] : WORD[2];
      if (lit < 0.78) return INK_OLD;
    }
    // (a crease between the layers, dark)
    if (hash(Math.floor(around / 5), Math.floor(z / 5.4), seed + 7113) < 0.06) return OLD[Math.max(0, tone - 2)];
    return OLD[tone];
  };
}

/** Paper wrapped round a joint: the new pages' grey-cream, lines of black writing round it. */
function paperSkin(seed: number, scale: V3): Skin {
  return (u, tone0) => {
    const tone = [1, 2, 3, 3, 4][tone0];
    const z = u[2] * scale[2];
    const around = Math.atan2(u[1] * scale[1], u[0] * scale[0]) * ((scale[0] + scale[1]) / 2);
    const row = Math.floor(z / 2.9);
    if (z - row * 2.9 < 0.95 && fr((around + hash(row, seed, 7115) * 4) / 4.6) < 0.74) return INK_NEW;
    return PAPER[Math.max(0, tone - 1)];
  };
}

/** Its fists and feet: grey pulp, lumpy, wet; a scrap of page caught in it here and there. */
const pulpSkin = ((): ((u: V3, tone: number, x: number, y: number) => string | null) => {
  const lumps = packed(PULP, 2.4, 7121);
  return (u, tone, x, y) => {
    if (hash(Math.floor(u[0] * 5 + 9), Math.floor(u[1] * 5 + 9) + Math.floor(u[2] * 5 + 9) * 17, 7122) < 0.07) return PAPER[Math.min(4, tone + 1)];
    return typeof lumps === 'function' ? lumps(u, tone, x, y) : PULP[tone];
  };
})();

// =============================================================================================
// WHERE ITS PAGES LIE: on the solids of its body, in rows, each overlapping the one under it

/** A solid of it, at a moment: its middle, its forward, left and along (its long way: up the trunk, down a limb), and its half-lengths along each. */
export interface Solid3 {
  c: V3;
  f: V3;
  l: V3;
  u: V3;
  r: V3;
}
/** A page on a solid: round it (radians from its forward toward its left), along it (-1 to 1), its half-width and half-height, turned a little, which page. */
export interface PageAt {
  on: string;
  th: number;
  h: number;
  w: number;
  ht: number;
  turn: number;
  seed: number;
  /** Peeled away first as it wears (0) or last (1). */
  keep: number;
}

export const SOLIDS = ['hump', 'chest', 'belly', 'hips', 'upperL', 'upperR', 'foreL', 'foreR', 'thighL', 'thighR', 'shinL', 'shinR', 'head'] as const;
export type SolidName = (typeof SOLIDS)[number];

/** The pages, laid once: rows round each solid, so many that they overlap. */
export const PAGES: PageAt[] = (() => {
  const out: PageAt[] = [];
  let seed = 1;
  const lay = (on: SolidName, rows: number[], per: number, w: number, ht: number, from = 0, to = Math.PI * 2): void => {
    rows.forEach((h, k) => {
      for (let i = 0; i < per; i++) {
        const j = seed;
        out.push({ on, th: from + ((i + (k % 2) * 0.5 + (hash(j, 1, 7131) - 0.5) * 0.3) / per) * (to - from), h, w: w * (0.85 + 0.3 * hash(j, 2, 7131)), ht: ht * (0.85 + 0.3 * hash(j, 3, 7131)), turn: (hash(j, 4, 7131) - 0.5) * 0.5, seed: j, keep: hash(j, 5, 7131) });
        seed++;
      }
    });
  };
  lay('hump', [0.6, 0.22, -0.18], 9, 7.6, 8.0);
  lay('chest', [0.3, -0.3], 8, 7.0, 7.6);
  lay('belly', [0.4, -0.25], 8, 7.0, 7.2);
  lay('hips', [0.3, -0.35], 8, 6.8, 6.4);
  for (const s of ['L', 'R'] as const) {
    lay(`upper${s}`, [-0.45, 0.35], 5, 5.6, 7.0);
    lay(`fore${s}`, [-0.45, 0.35], 5, 5.4, 7.0);
    lay(`thigh${s}`, [-0.35, 0.35], 5, 5.8, 7.2);
    lay(`shin${s}`, [-0.3, 0.4], 5, 5.2, 6.4);
  }
  lay('head', [0.45, -0.05], 4, 4.6, 5.0, 1.25, Math.PI * 2 - 1.25);
  return out;
})();
export const PAGE_COUNT = PAGES.length;

/** Its solids at a moment, as its pages lie on them. */
export function solidsOf(s: Skeleton): Record<SolidName, Solid3> {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const hp = s.hips;
  const waistC = add(s.pelvis, mul(hp[2], B.waist * 0.6));
  const limb = (a: V3, b: V3, r: number, hint: V3): Solid3 => {
    const u = norm(sub(b, a), [0, 0, -1]);
    const f = norm(sub(hint, mul(u, dot(hint, u))), Math.abs(u[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]);
    const l = cross(u, f);
    return { c: lerp3(a, b, 0.5), f, l, u, r: [r, r, len(sub(b, a)) / 2 + r * 0.35] };
  };
  const [rA0, rA1, rA2] = B.armR;
  const [rL0, rL1, rL2] = B.legR;
  return {
    // (the great hump of its shoulders and upper back, the head sunk into its front)
    hump: { c: add(add(lerp3(s.ribs, s.neck, 0.5), mul(cf, -3.6)), mul(cu, -0.5)), f: cf, l: cl, u: cu, r: [B.ribDeep + 4.6, B.shoulderHalf + 1.0, 10.5] },
    chest: { c: add(lerp3(s.ribs, s.neck, 0.2), mul(cf, 1.2)), f: cf, l: cl, u: cu, r: [B.ribDeep + 3.6, B.ribHalf + 3.4, 10.5] },
    belly: { c: add(lerp3(waistC, s.ribs, 0.4), mul(be[0], 1.0)), f: be[0], l: be[1], u: be[2], r: [B.waistDeep + 3.6, B.waistHalf + 3.2, 9.5] },
    hips: { c: add(s.pelvis, mul(hp[2], 1.5)), f: hp[0], l: hp[1], u: hp[2], r: [B.pelvisDeep + 2.8, B.pelvisHalf + 3.0, 7.5] },
    upperL: limb(s.shoulderL, s.elbowL, rA0 * 1.35, cf),
    upperR: limb(s.shoulderR, s.elbowR, rA0 * 1.35, cf),
    foreL: limb(s.elbowL, s.handL, (rA1 + rA2) * 0.72, cf),
    foreR: limb(s.elbowR, s.handR, (rA1 + rA2) * 0.72, cf),
    thighL: limb(s.hipL, s.kneeL, rL0 * 1.25, hp[0]),
    thighR: limb(s.hipR, s.kneeR, rL0 * 1.25, hp[0]),
    shinL: limb(s.kneeL, s.ankleL, (rL1 + rL2) * 0.68, hp[0]),
    shinR: limb(s.kneeR, s.ankleR, (rL1 + rL2) * 0.68, hp[0]),
    head: { c: s.head, f: s.face[0], l: s.face[1], u: s.face[2], r: [B.headR[0] * 1.25, B.headR[1] * 1.35, B.headR[2] * 1.1] },
  };
}

/** Where on a solid a page lies: its middle on the skin, the way the skin faces there, round it and down it. */
export function onSolid(S: Solid3, th: number, h: number): { p: V3; n: V3; round: V3; down: V3 } {
  const k = Math.sqrt(Math.max(0.02, 1 - h * h));
  const cth = Math.cos(th);
  const sth = Math.sin(th);
  const p = add(S.c, add(add(mul(S.f, S.r[0] * cth * k), mul(S.l, S.r[1] * sth * k)), mul(S.u, S.r[2] * h)));
  const n = norm(add(add(mul(S.f, (cth * k) / S.r[0]), mul(S.l, (sth * k) / S.r[1])), mul(S.u, h / S.r[2])), S.f);
  const round = norm(cross(S.u, n), S.l);
  // (down the solid: for the trunk, toward the floor; for a limb, toward its far end)
  const down = norm(cross(n, round), mul(S.u, -1));
  return { p, n, round, down: dot(down, S.u) > 0 ? mul(down, -1) : down };
}

/** What a moment says of its pages: how worn it is; which are lifting off (each 0 lying flat to 1 torn away), and where those torn away are. */
export interface PageSay {
  /** 0 whole to 1 worn: how many of its pages are gone, the old writing and the burning words showing. */
  wear: number;
  /** A page lifting off it (0 lying, up to 1 standing out from it, its top edge still on), by which page it is; null: lying as it does. */
  lift?: (i: number, p: PageAt) => number;
  /** A page torn off it and gone flying: its middle, its across and its down (half-lengths), or null if it is still on. */
  flown?: (i: number, p: PageAt, at: { c: V3; u: V3; v: V3 }) => { c: V3; u: V3; v: V3 } | null;
  /** A page's edges glinting pink, as it is flung out to cut (0 none, 1 bright), by which page. */
  blade?: (i: number, p: PageAt) => number;
  /** The stolen words in its old writing burning brighter (0 as ever, 1 blazing): as it soaks its pages back up. */
  glow?: number;
  /** As it dies: how far it has sunk into a heap (0 not at all, 1 a low mound of wet pulp), and how far its old writing has gone to grey pulp. */
  heap?: number;
}

/** Lay its pages: each on its solid, lifted a little off it and overlapping the row below, its lower edge standing out (or lifting, or flown). */
function pages(put: Put, s: Skeleton, say: PageSay, solids: Record<SolidName, Solid3>): void {
  PAGES.forEach((pg, i) => {
    if (pg.keep < say.wear * 0.55) return;
    if (PA_OFF[pg.on] || PA_OFF.pages) return;
    const S = solids[pg.on as SolidName];
    const { p, n, round, down } = onSolid(S, pg.th, pg.h);
    const ct = Math.cos(pg.turn);
    const st = Math.sin(pg.turn);
    // (its face outward: across, then down, turning about the way out of the skin)
    const rnd = dot(cross(round, down), n) < 0 ? mul(round, -1) : round;
    const across = add(mul(rnd, ct), mul(down, st));
    const dn = add(mul(down, ct), mul(rnd, -st));
    // (lifting: turned out about its top edge)
    const lift = say.lift ? clamp01(say.lift(i, pg)) : 0;
    const out = 0.32 + 1.9 * lift;
    const v = norm(add(dn, mul(n, out)));
    const top = add(add(p, mul(n, 0.9)), mul(dn, -pg.ht));
    const c = add(top, mul(v, pg.ht));
    let at = { c, u: mul(across, pg.w), v: mul(v, pg.ht) };
    if (say.flown) {
      const f = say.flown(i, pg, at);
      if (f === null) {
        // still on it
      } else at = f;
    }
    // (never into the floor: a page low on a shin as the foot goes down rides up over it)
    const low = at.c[2] - Math.abs(at.u[2]) - Math.abs(at.v[2]);
    if (low < 0.3) at = { ...at, c: [at.c[0], at.c[1], at.c[2] + 0.3 - low] };
    const part = pg.on === 'head' ? 'head' : pg.on.startsWith('upper') || pg.on.startsWith('fore') ? `arm${pg.on.slice(-1)}` : pg.on.startsWith('thigh') || pg.on.startsWith('shin') ? `leg${pg.on.slice(-1)}` : 'body';
    put(part, 'page', { k: 'panel', c: at.c, u: at.u, v: at.v, skin: pageSkin(pg.seed, pg.w, pg.ht, 0, say.blade ? say.blade(i, pg) : 0) });
  });
}

// =============================================================================================
// IT AS SOLIDS

/** How the figure's going drags what hangs off it. */
export function lagOf(m: Moment, k: number, most: number): V3 {
  const raw = mul(m.come, -k);
  const l = len(raw);
  return l > most ? mul(raw, most / l) : raw;
}

/** Where its fist is, and how big: a great ball of pulp on the end of its forearm. */
export function fistOf(s: Skeleton, side: 'L' | 'R'): { c: V3; r: V3; f: V3; l: V3; u: V3 } {
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const u = norm(sub(hand, el), [0, 0, -1]);
  const f = norm(sub(s.chest[0], mul(u, dot(s.chest[0], u))), Math.abs(u[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]);
  return { c: add(hand, mul(u, 5.5)), r: [9.6, 10.4, 10.8], f, l: cross(u, f), u };
}
/** How far below its fist's middle it reaches (for the floor). */
export const FIST_LOW = 10.8;

/** THE PALIMPSEST AS SOLIDS. */
function palimpsestBits(st: Stage, m: Moment, say: PageSay, extra?: (put: Put, solids: Record<SolidName, Solid3>) => void): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const lit = 1 - clamp01(q.out);
  const solids = solidsOf(s);
  const burn = clamp01(clamp01(say.wear) + (say.glow ?? 0)) * lit;
  // THE OLD LAYERS: every solid of it, yellowed vellum and brown writing, the burning words in it
  for (const name of SOLIDS) {
    if (name === 'head' || PA_OFF[name] || PA_OFF.old) continue;
    const S = solids[name];
    const part = name.startsWith('upper') || name.startsWith('fore') ? `arm${name.slice(-1)}` : name.startsWith('thigh') || name.startsWith('shin') ? `leg${name.slice(-1)}` : 'body';
    const ax: [V3, V3, V3] = [mul(S.f, S.r[0]), mul(S.l, S.r[1]), mul(S.u, S.r[2])];
    put(part, name, { k: 'ball', c: S.c, ax, skin: oldSkin(SOLIDS.indexOf(name) + 1, S.r, burn * 0.5 + 0.2 * lit, say.heap ?? 0) });
  }
  // (the joints, filled: knees and elbows, the shoulders)
  for (const side of PA_OFF.joints ? [] : (['L', 'R'] as const)) {
    const L = side === 'L';
    put(`arm${side}`, 'joint', { k: 'ball', c: L ? s.elbowL : s.elbowR, ax: sphere(B.armR[1] * 1.22), skin: paperSkin(31, [5, 5, 5]) });
    put(`leg${side}`, 'joint', { k: 'ball', c: L ? s.kneeL : s.kneeR, ax: sphere(B.legR[1] * 1.18), skin: paperSkin(32, [6, 6, 6]) });
    put('body', 'joint', { k: 'ball', c: L ? s.shoulderL : s.shoulderR, ax: sphere(B.armR[0] * 1.3), skin: paperSkin(33, [7, 7, 7]) });
  }
  // THE PAGES over them
  pages(put, s, say, solids);
  // ITS FEET: flat slabs of pulp
  for (const side of ['L', 'R'] as const) {
    if (PA_OFF.feet) break;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    const fwd = norm(sub(toe, heel), [1, 0, 0]);
    const sd = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
    const up = norm(cross(fwd, sd), [0, 0, 1]);
    put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.55), mul(up, 3.4)), ax: [mul(fwd, 9.5), mul(sd, 5.4), mul(up, 3.6)], skin: pulpSkin });
  }
  // ITS FISTS: great balls of pulp
  for (const side of ['L', 'R'] as const) {
    if (PA_OFF.fists) break;
    const F = fistOf(s, side);
    put(`fist${side}`, `fist${side}`, { k: 'ball', c: F.c, ax: [mul(F.f, F.r[0]), mul(F.l, F.r[1]), mul(F.u, F.r[2])], skin: pulpSkin });
    // (the forearm's end sunk into it: a collar of torn pages round the wrist)
    const wrist = add(F.c, mul(F.u, -F.r[2] * 0.75));
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + (side === 'L' ? 0.3 : 0);
      const out = add(mul(F.f, Math.cos(a)), mul(F.l, Math.sin(a)));
      const c = add(add(wrist, mul(out, 6.4)), mul(F.u, -1.0));
      const cv = norm(add(F.u, mul(out, 0.5)));
      const cu0 = cross(F.u, out);
      const cu = dot(cross(cu0, cv), out) < 0 ? mul(cu0, -1) : cu0;
      put(`fist${side}`, 'cuff', { k: 'panel', c, u: mul(cu, 3.2), v: mul(cv, 3.4), skin: pageSkin(900 + k + (side === 'L' ? 0 : 10), 3.2, 3.4) });
    }
  }
  // ITS HEAD: sunk between the shoulders; a page over its face for a mask, two holes torn in it, the pink burning through; the Order's bar of black ink across its mouth
  if (!PA_OFF.head) {
    const [ff, fl, fu] = wornOn(st, s, 6);
    const hr: V3 = [B.headR[0] * 1.2, B.headR[1] * 1.3, B.headR[2] * 1.05];
    const hc = s.head;
    put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: oldSkin(41, hr, burn, say.heap ?? 0) });
    const mc = add(hc, mul(ff, hr[0] * 1.02));
    const W = hr[1] * 0.92;
    const Hh = hr[2] * 1.0;
    const face: PanelSkin = (a, b, front, tone) => {
      const ja = 0.4 + 0.6 * hash(Math.floor((b + Hh) * 1.3), 7, 7141);
      if (Math.abs(a) > W - ja || b < -Hh + 0.3 || b > Hh - 0.2) return null;
      if (!front) return BACK[tone];
      // (its eyes: two holes torn in the page, ragged)
      for (const e of [-1, 1]) {
        const dx = a - e * W * 0.38;
        const dy = b + Hh * 0.18;
        if ((dx * dx) / 3.2 + (dy * dy) / 2.0 < 1 + 0.3 * hash(Math.floor(a * 2), Math.floor(b * 2), 7142)) return null;
      }
      // (the Order's black bar struck across where a mouth would be)
      if (b > Hh * 0.28 && b < Hh * 0.56 && Math.abs(a) < W * 0.86) return INK_NEW;
      // (its writing, fine)
      const rb = b + Hh;
      if (fr(rb / 1.5) < 0.36 && hash(Math.floor((a + W) / 1.8), Math.floor(rb / 1.5), 7143) < 0.6) return INK_SCRAPED;
      return PAPER[Math.min(4, tone + 2)];
    };
    put('mask', 'mask', { k: 'panel', c: mc, u: mul(fl, -W), v: mul(norm(add(mul(fu, -1), mul(ff, -0.12))), Hh), skin: face });
    // the eyes behind the holes, burning
    for (const e of [-1, 1]) {
      const p = add(add(mc, mul(fl, e * W * 0.38)), add(mul(fu, Hh * 0.18), mul(ff, -0.6)));
      put('head', 'eye', { k: 'ball', c: p, ax: [mul(ff, 0.8), mul(fl, 1.2), mul(fu, 0.9)], skin: (u, tone) => (lit < 0.3 ? '#14101a' : tone >= 3 ? WORD[4] : WORD[2]) });
      if (lit > 0.05) put('head', 'eyeglow', { k: 'glow', p: add(p, mul(ff, 1.5)), c: SOCKET, r: 6, a: 0.45 * lit });
    }
  }
  // THE CREST OF LOOSE LEAVES standing up off its back, stirring (the birds of its Loose Leaves)
  if (!PA_OFF.crest) crest(put, s, m, solids, say);
  if (extra) extra(put, solids);
  // SINKING INTO A HEAP as it dies: every solid of it squashed down toward the floor (what is on the floor stays on it)
  const heap = clamp01(say.heap ?? 0);
  if (heap > 0) {
    const k = 1 - 0.58 * heap;
    // (and, sinking, it is one mass: no seams between what were its limbs)
    if (heap > 0.25) for (const b of bits) if (b.part !== 'crest') b.part = 'body';
    const sq = (p: V3): V3 => [p[0], p[1], p[2] * k];
    for (const b of bits) {
      const sh = b.shape;
      if (sh.k === 'ball') b.shape = { ...sh, c: sq(sh.c), ax: [sq(sh.ax[0]), sq(sh.ax[1]), sq(sh.ax[2])] };
      else if (sh.k === 'panel') b.shape = { ...sh, c: sq(sh.c), u: sq(sh.u), v: sq(sh.v) };
      else if (sh.k === 'rod') b.shape = { ...sh, a: sq(sh.a), b: sq(sh.b) };
      else if (sh.k === 'glow' || sh.k === 'dot' || sh.k === 'mote') b.shape = { ...sh, p: sq(sh.p) };
    }
  }
  return bits;
}

/** Where the crest's leaves stand: along its back, round from behind the left shoulder to behind the right, each leaning out and up. */
export const CREST = [-0.95, -0.62, -0.3, 0.0, 0.3, 0.62, 0.95].map((k, i) => ({ k, seed: 300 + i }));
/** A leaf of the crest at a moment: where it is rooted on its back, the way it stands out, its half-width; `stir` 0 still to 1 shaking. */
export function crestLeaf(s: Skeleton, i: number, t: number, stir: number): { root: V3; up: V3; across: V3; w: number; ht: number } {
  const [cf, cl, cu] = s.chest;
  const { k } = CREST[i];
  const hump = add(add(lerp3(s.ribs, s.neck, 0.5), mul(cf, -3.6)), mul(cu, -0.5));
  const back = norm(add(add(mul(cf, -0.9), mul(cl, k * 0.75)), mul(cu, 0.55 - 0.15 * Math.abs(k))));
  const root = add(hump, add(mul(back, B.ribDeep + 2.0), mul(cl, k * 9)));
  const flap = (0.18 + 0.5 * stir) * Math.sin(t * (5 + 9 * stir) + i * 1.7);
  const up = norm(add(add(mul(cu, 1.0), mul(back, 0.7 + flap)), mul(cl, k * 0.3)));
  const across = norm(cross(up, back), cl);
  return { root, up, across, w: 5.0 + (i % 2) * 0.8, ht: 10.5 - Math.abs(k) * 2.4 };
}
function crest(put: Put, s: Skeleton, m: Moment, _solids: Record<SolidName, Solid3>, say: PageSay & { crest?: (i: number) => number; stir?: number }): void {
  CREST.forEach((c, i) => {
    // (gone: torn off and flown (1), or growing back (a leaf unfurling, smaller the more is gone))
    const gone = say.crest ? clamp01(say.crest(i)) : 0;
    if (gone >= 0.98) return;
    const L0 = crestLeaf(s, i, m.t, say.stir ?? 0);
    const L = { ...L0, w: L0.w * (1 - 0.5 * gone), ht: L0.ht * (1 - gone) };
    const ctr = add(L.root, mul(L.up, L.ht * 0.9));
    // (its written face toward its back, away from it)
    const out = norm(cross(L.up, L.across));
    const flip = dot(cross(L.across, mul(L.up, -1)), sub(L.root, s.ribs)) < 0 ? -1 : 1;
    void out;
    put('crest', 'leaf', { k: 'panel', c: ctr, u: mul(L.across, L.w * flip), v: mul(L.up, -L.ht), skin: pageSkin(c.seed, L.w, L.ht, 0, say.blade ? say.blade(-1 - i, PAGES[0]) : 0) });
  });
}

/** THE PULP DRIPPING OFF ITS FISTS: drops falling now and then from under each fist, gone at the floor. Grains, laid after its edge. */
function drips(out: [V3, string, number][], s: Skeleton, t: number, rate = 1): void {
  for (const side of ['L', 'R'] as const) {
    const F = fistOf(s, side);
    const low = add(F.c, [0, 0, -F.r[2] * 0.82]);
    for (let k = 0; k < 3; k++) {
      const life = fr(t * 0.9 * rate + k / 3 + (side === 'L' ? 0.17 : 0.61));
      const fall = life * life * 26;
      const p = add(low, [Math.sin(k * 2.3) * 3, Math.cos(k * 1.7) * 3, -fall]);
      if (p[2] < 0.5) continue;
      out.push([p, life < 0.2 ? PULP[3] : PULP[2], life < 0.15 ? 2 : 1]);
    }
  }
}

/** What its painter is told by each move, over and above its pages. */
export interface PaSay extends PageSay {
  /** A crest leaf gone (0 on its back, 1 flown) by which leaf. */
  crest?: (i: number) => number;
  /** How hard the crest stirs (0 to 1). */
  stir?: number;
  /** More it paints at a moment (a move's own: the whirl, pages crawling home). */
  extra?: (put: Put, m: Moment) => void;
  /** More grains (the slam's splash, the stolen words going free). */
  grains?: (out: [V3, string, number][], m: Moment) => void;
}

/** The grains of it at each moment, laid after its edge (Mob.grains). */
const GRAINS = new WeakMap<Moment, [V3, string, number][]>();

/** THE PALIMPSEST AS THE PAINTER TAKES IT, a move's say as the move is (by its name; `wear`: how torn it is painted). */
export function palimpsestPainter(sayOf: (m: Moment) => PaSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return {
    bits: (st, m) => {
      const say = sayOf(m);
      const g: [V3, string, number][] = [];
      GRAINS.set(m, g);
      if (!m.dying) drips(g, m.s, m.t);
      if (say.grains) say.grains(g, m);
      return palimpsestBits(st, m, say, say.extra ? (put) => say.extra?.(put, m) : undefined);
    },
    grains: (_st, m) => GRAINS.get(m) ?? [],
  };
}

// =============================================================================================
// ITS STAND

/** Its stand: a 3.2 s round. Hunched, heaving as it breathes, its weight rolling from foot to foot; its fists swaying by its knees, dripping; its head turning slowly, the crest on its back stirring. */
export const PA_STAND_LONG = 3.2;
export function paStand(): Motion {
  const R = PA_REST;
  const T = PA_STAND_LONG;
  const keys: Key3[] = [];
  const N = 32;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    const breath = Math.sin(a * 2 - 0.4);
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 1.2 * breath,
        py: 1.2 * Math.sin(a),
        roll: R.roll + 2.4 * Math.sin(a),
        side: 1.6 * Math.sin(a),
        bend: R.bend - 3 * breath,
        pitch: R.pitch + 1.0 * Math.sin(a + 1.2),
        faceUp: R.faceUp + 3 * breath,
        faceTurn: 14 * Math.sin(a + 0.6),
        faceTilt: R.faceTilt + 5 * Math.sin(a + 2.0),
        lhx: R.lhx + 1.4 * Math.sin(a + 0.4),
        lhz: R.lhz + 1.0 * breath,
        rhx: R.rhx + 1.4 * Math.sin(a + 0.4 + Math.PI),
        rhz: R.rhz + 1.0 * breath,
      },
    });
  }
  return { loop: 0, keys };
}
export { sm, fr };
void sub;
