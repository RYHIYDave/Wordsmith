// FLOOR 18'S MIRROR ENEMIES, YOUR REFLECTIONS (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the
// game imports this file; `REFLECTIONS_ON` is off. What it steps out of and how it shatters: art/reflections_fx.ts.
//
// His doc's plan for floor 18, THE GLASS GALLERY (the queen's wing, long galleries of mirrors; silver, cold blue glass,
// dark violet; from the Grimms' "Snow White", 1812): “Enemies: ladies-in-waiting, the queen's guard, and your own
// reflections, which step out of the mirrors and fight with your class's moves.” The Queen's move “Reflections, copies
// of you stepping out of the mirrors” uses them too. Asked “YOUR REFLECTIONS: copies of your own class stepping out of
// the mirrors and fighting with your moves. Is this the look?”, his pick: “Glassy copy of you (Recommended)”, with the
// brief as offered:
//   WHO: a copy of whichever hero you play, stepping out of a mirror. LOOK: your own hero, turned to silvered glass:
//   grey-violet, a sheen across it, fine cracks, the enemy's pink in the eyes and the pink rim. MOVE: your class's own
//   moves and speed. ATTACKS: your class's own attacks. DEATH: it shatters into shards that fall and fade. NEVER: never
//   cyan (the friend's colour), so you always know which one is you. SOUND: the ring of glass.
//
// HOW IT IS MADE: FROM THE HERO'S OWN FINISHED FRAMES. A reflection's frame is the hero's frame (art/heroes3.ts,
// `paintMove3`, the very function the game's heroes are painted with), painted without its cyan edge, and then:
//   1. SILVERED: every pixel's lightness laid on a ramp of nine tones of glass, so each shape keeps its shading and
//      the figure still reads as that hero. Two ramps: what was warm (a red tabard, a violet robe, leather, skin) goes
//      to a GREY-VIOLET glass, what was cool (steel, mail, the ranger's greens and teal) to a SILVER one; the seams
//      between parts stay the style's deep indigo.
//   2. NOTHING CYAN LEFT: every friend's glow (the blade, the crystal and its sparks, the belt's gem, a bowstring, an
//      arrow's glint, a blade's streak) turned to the enemy's hot pink, tone for tone; the lights it gives off the same;
//      its pool of light the enemy's pink one; the crackle the game draws from the mage's crystal not handed on.
//   3. THE HUSH'S DULL PINK IN ITS EYES (the cult's, as the Hushed and the palace guard have it: art/mkit.ts FLAME[1]),
//      where the hero's eyes are, worked out from the same bones as the hero's own.
//   4. FINE CRACKS fixed to the figure: on its chest, its back, its belly and its brow, carried on the bones, so they
//      go where the body goes; hidden where an arm or what it holds passes in front of them.
//   5. A SHEEN: a broad band of light and a thin one behind it, sweeping across it on the slant, as light runs over
//      glass. In a move that goes round, a whole number of times in one turn of it, so it never jumps.
//   6. THE ENEMY'S PINK EDGE (art/mkit.ts ENEMY_RIM), one picture pixel, where the friend's cyan was.
// The silhouette is the hero's, pixel for pixel: it is his shape.
//
// WHAT FLIES FROM IT (a scarf's ends, a feather, a braid: engine/tails.ts) is glass too: `GLASS_TAILS`, under the
// hero's tails' names with `glass:` before them.
//
// HOW THE GAME WOULD USE IT (the main chat's): a reflection takes the player's class and its moves; `makeReflectionArt`
// gives the same pictures, in the same shape, as the hero's (`makeHeroArt3`), with `clips.die` its shattering and
// `clips.moves.stepOut` its stepping out of a mirror (art/reflections_fx.ts); the game's AI drives it, as it drives
// any enemy, with the hero's moves and speed.

import type { Light, Sprite } from '../engine/px';
import { rgba } from '../engine/px';
import type { TailDef } from '../engine/tails';
import type { ClassId } from '../game/types';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { PLANS, THRUST, heroOf, paintMove3, windAt } from './heroes3';
import type { Plan } from './heroes3';
import { HERO_TAILS } from './heroes';
import { BLADE, CYAN, GLINT, INK, RIM_ALPHA, SPARK, edge, lazyFrames, toSprite } from './kit';
import type { Painted } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { BOW_HALF, GREAT_BLADE, MOVES3, STAFF_DOWN, STAFF_UP, holdStartOf, runWaysOf, settlesOf, startsOf, walkingOf } from './moves3';
import type { Move3 } from './moves3';
import { CANVAS3, eyesToward, faces, stage } from './skin';
import type { GameView, Stage } from './skin';
import { add, bonesAt, dot, lerp3, mul, norm, solve, trunkOf } from './skeleton';
import type { Build, Posed, Skeleton, Solid, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const REFLECTIONS_ON = { on: false };

// =============================================================================================
// THE GLASS

/**
 * THE TWO GLASSES, darkest first (nine tones: the last only for the sheen and the cracks' light). SILVER for what was
 * cool on the hero (steel, mail, green, teal); GREY-VIOLET for what was warm (red, violet, leather, skin). Both on the
 * floor's own palette (silver, dark violet), well clear of cyan: their hues 235 to 275, their light never saturated.
 */
export const SILVER: readonly string[] = ['#0f0f22', '#1a1c34', '#272a46', '#383d5c', '#525877', '#737a98', '#9ea4bf', '#cdd2e6', '#f5f7ff'];
export const VIOLET: readonly string[] = ['#140d24', '#211735', '#30244a', '#443662', '#5d4e7d', '#7d6e9c', '#a597bf', '#d0c6e3', '#f7f2ff'];
const GLASSES = [SILVER, VIOLET] as const;
/** The tone the sheen and the cracks' light may reach. */
const TOP = 8;

/** Where each tone of glass begins, by the lightness of the hero's own colour (0..255): the hero's three tones of a material land on three of these. */
const TONE_AT = [0, 30, 52, 78, 108, 142, 180, 214];
const toneOfLight = (y: number): number => {
  let t = 1;
  for (let i = 1; i < TONE_AT.length; i++) if (y >= TONE_AT[i]) t = i;
  return t;
};
const luma = (r: number, g: number, b: number): number => 0.299 * r + 0.587 * g + 0.114 * b;
/** The warm glass (cloth, leather, skin) a little closer in its tones than the silver: the cloth's own marks stay quiet, the cracks and the sheen read on it. */
const WARM_TONE = [0, 1, 2, 3, 3, 4, 5, 6];

/** A colour's hue (0..360) and saturation (0..1), as the checks measure them. */
export function hueOf(r: number, g: number, b: number): { h: number; s: number } {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  if (mx === 0 || mx === mn) return { h: 0, s: 0 };
  let h: number;
  if (mx === r) h = ((g - b) / (mx - mn)) * 60;
  else if (mx === g) h = (2 + (b - r) / (mx - mn)) * 60;
  else h = (4 + (r - g) / (mx - mn)) * 60;
  return { h: (h + 360) % 360, s: (mx - mn) / mx };
}
/** CYAN, as his rule and the checks have it: a hue from 160 to 205 at a saturation over 0.2. */
export function isCyan(r: number, g: number, b: number): boolean {
  const { h, s } = hueOf(r, g, b);
  return s > 0.2 && h >= 160 && h <= 205;
}
/** Which glass a colour of the hero's goes to: 1 (grey-violet) for the warm ones, 0 (silver) for the cool and the grey. */
function glassOf(r: number, g: number, b: number): 0 | 1 {
  const { h, s } = hueOf(r, g, b);
  return s > 0.28 && (h >= 252 || h < 75) ? 1 : 0;
}

/** The hero's colour as glass: which glass, and which tone of it. */
export function glassTone(c: string): { glass: 0 | 1; tone: number } {
  const [r, g, b] = rgba(c);
  return { glass: glassOf(r, g, b), tone: toneOfLight(luma(r, g, b)) };
}
/** The hero's colour as glass, as a colour. */
export function glassColour(c: string): string {
  const { glass, tone } = glassTone(c);
  return GLASSES[glass][tone];
}

/** THE HUSH'S DULL PINK, in its eyes (the Hushed's, the guard's: art/hushed.ts, art/palace_guard.ts). */
export const EYE = FLAME[1];
/**
 * THE FRIEND'S GLOWS AND THE ENEMY'S, TONE FOR TONE: the hero's cyan (art/kit.ts CYAN, BLADE, SPARK, his pool of light)
 * and what it becomes on his reflection, the enemy's pink burning to white (art/mkit.ts FLAME, PINK). The knight's
 * eyes, a point of light in each slot of his helm (GLINT), take the Hush's dull pink.
 */
const FRIEND_TO_ENEMY: ReadonlyArray<readonly [string, string]> = [
  [CYAN[0], FLAME[0]],
  [CYAN[2], ENEMY_RIM],
  [CYAN[3], '#ffc0d6'],
  [BLADE[3], '#ff8ab4'],
  [SPARK[3], '#ffc0d6'],
  ['#28dcf0', '#ff3a78'],
  [GLINT, EYE],
];
const packed = (c: string): number => {
  const [r, g, b] = rgba(c);
  return (r << 16) | (g << 8) | b;
};
const ENEMY_OF = new Map<number, string>(FRIEND_TO_ENEMY.map(([f, e]) => [packed(f), e]));
/** A friend's glow as the enemy's, or null if the colour is none of the friend's glows. */
export function enemyGlow(c: string): string | null {
  return ENEMY_OF.get(packed(c)) ?? null;
}
/**
 * ANY COLOUR OF THE HERO'S (what the game draws for him besides his frames: a spell, an arrow's trail, a crackle) AS HIS
 * REFLECTION'S: a friend's glow its pink; anything else cyan, a pink as bright; anything else as it was.
 */
export function asEnemy(c: string): string {
  const g = enemyGlow(c);
  if (g) return g;
  const [r, gg, b] = rgba(c);
  if (!isCyan(r, gg, b)) return c;
  const y = luma(r, gg, b);
  return y < 70 ? FLAME[0] : y < 140 ? FLAME[1] : y < 200 ? ENEMY_RIM : y < 235 ? '#ff8ab4' : '#ffc0d6';
}

/** Its pool of light: the enemy's pink one (art/mkit.ts MENACE), where the hero's is, on the heroes' canvas. */
export const REFLECTION_POOL: Light = { x: CANVAS3.ax - 4, y: CANVAS3.ay - 30, r: 40, color: '#ff3a78', a: 0.13 };

// =============================================================================================
// WHERE ITS BODY IS, AT A MOMENT OF A MOVE (as art/heroes3.ts paintMove3 has it)

/** A move's end, and where its loop begins. */
function spanOf(move: Move3): { end: number; from: number | undefined } {
  const keys = move.motion.keys;
  return { end: keys.length ? keys[keys.length - 1].at : 0, from: move.motion.loop };
}
/** The moment `t` of a move as its painter takes it (folded into its loop), its pose and its bones. */
export function bodyAt(move: Move3, t: number): { now: number; q: Posed; s: Skeleton; B: Build } {
  const { end, from } = spanOf(move);
  const long = from !== undefined ? end - from : 0;
  const now = from !== undefined && long > 1e-6 && Math.max(0, t) >= end ? from + ((Math.max(0, t) - from) % long) : Math.max(0, t);
  const q = bonesAt(move.motion.keys, move.rest, Math.max(0, now));
  return { now, q, s: solve(move.build, q), B: move.build };
}

// =============================================================================================
// THE EYES

/** Where the hero's eyes are painted (art/hero3_ranger.ts, art/hero3_mage.ts: two pixels, one over the other), from his bones. */
function eyesAt(st: Stage, s: Skeleton, B: Build): [number, number][] {
  const [hf, hl, hu] = s.face;
  const R = B.headR;
  const out: [number, number][] = [];
  for (const turn of eyesToward(st, s)) {
    if (!faces(st, s, turn)) continue;
    const a = (turn * Math.PI) / 180;
    const eye = add(s.head, add(add(mul(hf, Math.cos(a) * R[0] * 0.97), mul(hl, Math.sin(a) * R[1] * 0.97)), mul(hu, 0.14 * R[2])));
    const [x, y] = st.at(eye);
    out.push([Math.round(x - 0.5), Math.round(y - 0.5)]);
  }
  return out;
}

// =============================================================================================
// THE CRACKS

/**
 * A FINE CRACK, FIXED TO THE BODY: on one of the trunk's three solids (0 the ribs, 1 the waist, 2 the pelvis; art/
 * skeleton.ts trunkOf) or the head (3), a line of points on its skin, each a way out from its middle in its own
 * space (forward, to its left, up), and a branch off it from its `fork`th point.
 */
interface Crack {
  on: 0 | 1 | 2 | 3;
  line: readonly V3[];
  fork?: { at: number; to: readonly V3[] };
}
/** Five, laid so that two or three are seen from any side: across the chest, down the belly, across the back, low on the back, and over the brow. */
const CRACKS: readonly Crack[] = [
  // the chest, from in front, a little to its left: a jagged line down and across, a branch off it
  { on: 0, line: [[0.86, 0.45, 0.55], [0.95, 0.24, 0.32], [0.93, 0.32, 0.06], [0.97, 0.06, -0.18], [0.9, 0.18, -0.48]], fork: { at: 2, to: [[0.85, 0.55, -0.08], [0.72, 0.7, -0.22]] } },
  // the belly, from in front, to its right
  { on: 1, line: [[0.78, -0.62, 0.62], [0.9, -0.4, 0.28], [0.85, -0.52, -0.08], [0.92, -0.32, -0.42]] },
  // across the back, from behind
  { on: 0, line: [[-0.84, -0.5, 0.62], [-0.95, -0.22, 0.4], [-0.93, -0.3, 0.12], [-0.98, 0.04, 0.0], [-0.92, 0.28, -0.22], [-0.86, 0.46, -0.5]], fork: { at: 3, to: [[-0.9, 0.1, 0.4], [-0.82, 0.22, 0.7]] } },
  // low on the back, from behind
  { on: 2, line: [[-0.8, 0.55, 0.65], [-0.92, 0.3, 0.3], [-0.88, 0.44, -0.05]] },
  // over the brow, from its left: across the head toward the crown
  { on: 3, line: [[0.6, 0.62, 0.55], [0.42, 0.82, 0.42], [0.2, 0.92, 0.48], [0.0, 0.88, 0.62]] },
];
interface Occluder {
  a: V3;
  b: V3;
  r: number;
}
/** What may pass in front of a crack: the arms, the legs, and what the hands hold. */
function occluders(move: Move3, s: Skeleton, B: Build): Occluder[] {
  const ar = B.armR[1] + 1.2;
  const lr = B.legR[1] + 1;
  const out: Occluder[] = [
    { a: s.shoulderL, b: s.elbowL, r: ar },
    { a: s.elbowL, b: s.handL, r: ar },
    { a: s.shoulderR, b: s.elbowR, r: ar },
    { a: s.elbowR, b: s.handR, r: ar },
    { a: s.hipL, b: s.kneeL, r: lr },
    { a: s.hipR, b: s.kneeR, r: lr },
  ];
  const hero = heroOf(move);
  if (hero === 'knight') out.push({ a: s.handR, b: add(s.handR, mul(s.point, 1.3 + GREAT_BLADE)), r: 3 });
  else if (hero === 'mage') out.push({ a: add(s.handR, mul(s.point, -STAFF_DOWN)), b: add(s.handR, mul(s.point, STAFF_UP)), r: 2.5 });
  else out.push({ a: add(s.handL, mul(s.across, BOW_HALF)), b: add(s.handL, mul(s.across, -BOW_HALF)), r: 2.5 });
  return out;
}
/** Whether a point of the body is hidden from the eye, at its place on the picture, by one of these. */
function hiddenBy(st: Stage, p: V3, xy: readonly [number, number], occ: ReadonlyArray<Occluder>): boolean {
  const z = st.near(p);
  for (const o of occ) {
    const [ax, ay] = st.at(o.a);
    const [bx, by] = st.at(o.b);
    const dx = bx - ax;
    const dy = by - ay;
    const l2 = dx * dx + dy * dy;
    const u = l2 > 1e-6 ? Math.max(0, Math.min(1, ((xy[0] - ax) * dx + (xy[1] - ay) * dy) / l2)) : 0;
    const d = Math.hypot(xy[0] - (ax + dx * u), xy[1] - (ay + dy * u));
    if (d <= o.r * 1.15 && st.near(lerp3(o.a, o.b, u)) > z + 0.5) return true;
  }
  return false;
}
/** The solid a crack lies on. */
function solidOf(c: Crack, s: Skeleton, B: Build): Solid {
  if (c.on === 3) return { c: s.head, r: s.face, h: B.headR };
  return trunkOf(B, s)[c.on];
}

// =============================================================================================
// ONE FRAME OF A REFLECTION

/** How a frame was turned to glass (what the checks ask of it). */
export interface Silvered extends Painted {
  /** Where its eyes were laid, on the picture. */
  eyes: [number, number][];
}

/** The sheen at a moment: where the middle of its broad band is, along the slant (x + y from the feet), or null while it is off the figure. */
export function sheenAt(phase: number): number | null {
  const SWEEP = 0.6;
  if (phase > SWEEP) return null;
  return -128 + (phase / SWEEP) * 196;
}

/**
 * ONE FRAME OF A REFLECTION: the hero `move` at its moment `t`, from in front or behind, as his glass copy (this file's
 * head says how). On the heroes' own canvas (art/skin.ts CANVAS3), its feet where his are.
 */
export function reflectionPainted(move: Move3, t: number, view: GameView): Silvered {
  const f = paintMove3(move, t, view, { rim: null });
  const { now, s, B } = bodyAt(move, t);
  return silver(f, move, s, B, view, windAt(move, now));
}

/** A painting of the hero's turned to glass: the hero's move and bones it was painted from, and where the sheen has got to (0..1). */
export function silver(f: Painted, move: Move3, s: Skeleton, B: Build, view: GameView, sheen: number): Silvered {
  const px = f.px;
  const W = px.w;
  const H = px.h;
  const d = px.d;
  const ink = rgba(INK);
  /** Each pixel's glass (-1: not glass: empty, a seam, or a glow already turned pink) and its tone. */
  const glass = new Int8Array(W * H).fill(-1);
  const tone = new Int8Array(W * H);
  for (let k = 0, i = 0; k < W * H; k++, i += 4) {
    if (d[i + 3] === 0) continue;
    // (an edge of light left on the painting is the friend's: it goes, and the enemy's is laid in its place)
    if (d[i + 3] !== 255) {
      d[i + 3] = 0;
      continue;
    }
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    if (r === ink[0] && g === ink[1] && b === ink[2]) continue;
    const pink = ENEMY_OF.get((r << 16) | (g << 8) | b);
    if (pink) {
      const [pr, pg, pb] = rgba(pink);
      d[i] = pr;
      d[i + 1] = pg;
      d[i + 2] = pb;
      continue;
    }
    glass[k] = glassOf(r, g, b);
    tone[k] = glass[k] === 1 ? WARM_TONE[toneOfLight(luma(r, g, b))] : toneOfLight(luma(r, g, b));
  }
  // GLASS IS BRIGHT AT ITS EDGES: where a part of it ends (at the figure's edge or at a seam), a tone or two lighter, the
  // more on the side the light comes from (the upper left)
  {
    const was = tone.slice();
    const not = (x: number, y: number): boolean => x < 0 || y < 0 || x >= W || y >= H || glass[y * W + x] < 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const k = y * W + x;
        if (glass[k] < 0) continue;
        if (not(x - 1, y) || not(x, y - 1)) tone[k] = Math.min(TOP - 1, was[k] + 2);
        else if (not(x + 1, y) || not(x, y + 1)) tone[k] = Math.min(TOP - 1, was[k] + 1);
        else if (not(x - 2, y) || not(x, y - 2) || not(x - 1, y - 1)) tone[k] = Math.min(TOP - 1, was[k] + 1);
      }
    }
  }
  const st = stage(view);
  // THE CRACKS: a light line, a tone darker where the glass is already light (each pixel once: a crack crossed twice is still one)
  const occ = occluders(move, s, B);
  const cracked = new Set<number>();
  for (const c of CRACKS) {
    const o = solidOf(c, s, B);
    const onSkin = (u: V3): V3 => {
      const n = norm(u);
      return add(o.c, add(add(mul(o.r[0], n[0] * o.h[0]), mul(o.r[1], n[1] * o.h[1])), mul(o.r[2], n[2] * o.h[2])));
    };
    /** Whether the skin there faces the eye. */
    const facing = (u: V3): boolean => {
      const n = norm(u);
      const out = norm(add(add(mul(o.r[0], n[0] / o.h[0]), mul(o.r[1], n[1] / o.h[1])), mul(o.r[2], n[2] / o.h[2])));
      return dot(out, st.eye) > 0.18;
    };
    const run = (line: readonly V3[]): void => {
      for (let j = 0; j + 1 < line.length; j++) {
        const a = onSkin(line[j]);
        const b = onSkin(line[j + 1]);
        const [ax, ay] = st.at(a);
        const [bx, by] = st.at(b);
        const n = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 1.5));
        for (let i = 0; i <= n; i++) {
          const k = i / n;
          if (!facing(lerp3(line[j], line[j + 1], k))) continue;
          const xy: [number, number] = [ax + (bx - ax) * k, ay + (by - ay) * k];
          if (hiddenBy(st, lerp3(a, b, k), xy, occ)) continue;
          const x = Math.round(xy[0] - 0.5);
          const y = Math.round(xy[1] - 0.5);
          if (x < 0 || y < 0 || x >= W || y >= H || glass[y * W + x] < 0) continue;
          cracked.add(y * W + x);
        }
      }
    };
    run(c.line);
    if (c.fork) run([c.line[c.fork.at], ...c.fork.to]);
  }
  // (each crack a line of the glass's own white, its shadow a pixel of dark glass below and to the right of it)
  for (const k of cracked) {
    const x = k % W;
    const y = (k - x) / W;
    for (const j of [k + 1, k + W]) {
      if ((j === k + 1 && x + 1 >= W) || (j === k + W && y + 1 >= H)) continue;
      if (glass[j] >= 0 && !cracked.has(j)) tone[j] = Math.min(tone[j], 1);
    }
  }
  for (const k of cracked) tone[k] = TOP;
  // THE SHEEN: a broad band two tones up, a thin one three up behind it, on the slant (x + y, from its feet)
  const at = sheenAt(sheen);
  if (at !== null) {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const k = y * W + x;
        if (glass[k] < 0) continue;
        const u = x - CANVAS3.ax + (y - CANVAS3.ay);
        if (Math.abs(u - at) <= 3) tone[k] = Math.min(TOP, tone[k] + 2);
        else if (Math.abs(u - (at - 9)) <= 0.5) tone[k] = Math.min(TOP, tone[k] + 3);
      }
    }
  }
  // the glass, as colours
  for (let k = 0, i = 0; k < W * H; k++, i += 4) {
    if (glass[k] < 0) continue;
    const [r, g, b] = rgba(GLASSES[glass[k]][tone[k]]);
    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
  }
  // THE EYES: the Hush's dull pink where the hero's dark eyes are (the knight's points of light have taken it already)
  const eyes: [number, number][] = [];
  if (heroOf(move) !== 'knight') {
    for (const [x, y] of eyesAt(st, s, B)) {
      for (const yy of [y, y + 1]) {
        if (x < 0 || yy < 0 || x >= W || yy >= H) continue;
        const i = (yy * W + x) * 4;
        // (only where the hero's eye is seen: his cap or her hat may be over it)
        if (d[i + 3] !== 255 || d[i] !== ink[0] || d[i + 1] !== ink[1] || d[i + 2] !== ink[2]) continue;
        px.set(x, yy, EYE);
        eyes.push([x, yy]);
      }
    }
  } else {
    const [er, eg, eb] = rgba(EYE);
    for (let k = 0, i = 0; k < W * H; k++, i += 4) if (d[i + 3] === 255 && d[i] === er && d[i + 1] === eg && d[i + 2] === eb) eyes.push([k % W, Math.floor(k / W)]);
  }
  // THE ENEMY'S EDGE
  edge(px, ENEMY_RIM, RIM_ALPHA);
  const lights = f.lights.map((l) => ({ ...l, color: asEnemy(l.color) }));
  const out: Silvered = { px, lights, eyes };
  if (f.tails) out.tails = f.tails.map((r) => ({ ...r, id: GLASS_TAIL + r.id }));
  return out;
}

// =============================================================================================
// WHAT FLIES FROM IT

/** What its tails are called: the hero's tails' names, this before them. */
export const GLASS_TAIL = 'glass:';
/** Its tails (engine/tails.ts): the hero's, turned to glass, a glow on one the enemy's pink. */
export const GLASS_TAILS: Readonly<Record<string, TailDef>> = Object.fromEntries(
  Object.entries(HERO_TAILS).map(([id, def]) => {
    const t: TailDef = { ...def, dark: glassColour(def.dark), mid: glassColour(def.mid), light: glassColour(def.light) };
    if (def.glow) t.glow = { ...def.glow, color: asEnemy(def.glow.color), a: def.glow.a * 0.8 };
    if (def.tip) t.tip = enemyGlow(def.tip) ?? glassColour(def.tip);
    return [GLASS_TAIL + id, t];
  }),
);

// =============================================================================================
// ITS PICTURES, AS THE GAME HOLDS A HERO'S

/** A frame of a reflection as the game holds it: cut down to the figure, its lights, the enemy's pool of light and its tails. */
export function reflectionSprite(move: Move3, t: number, view: GameView): Sprite {
  return toSprite(reflectionPainted(move, t, view), REFLECTION_POOL, CANVAS3.ax, CANVAS3.ay);
}

/** What adds more to a side of a reflection's pictures (art/reflections_fx.ts reflectionEffects: its stepping out of a mirror, its shattering). */
export type Extra = (set: AnimSet, view: GameView, cls: ClassId) => void;

/** Frames a second, as the hero's (art/heroes3.ts). */
const IDLE_FPS3 = 10;
const RUN_FPS3 = 30;
const GRIP_FPS3 = 60;
const CLIP_FPS3 = 30;
const GESTURE_FPS3 = 20;
const LEAP_FRAMES3 = 16;
const ROLL_FRAMES3 = 14;

/**
 * A REFLECTION'S PICTURES, ONE SIDE OF IT: what art/heroes3.ts's `animSet3` makes of the hero's moves in a dungeon, the
 * same lists of the same moments of the same moves, each frame his glass copy (the checks hold the two side by side:
 * every list as long, every frame the same shape). Only what a reflection never does is left out: his fall (it
 * shatters: `clips.die`, art/reflections_fx.ts) and making ready on a class card.
 */
export function reflectionSet(cls: ClassId, view: GameView, extra: Extra = () => {}): AnimSet {
  const plan: Plan = PLANS[cls].dungeon;
  const of = (key: string): Move3 => {
    const m = MOVES3[key];
    if (!m) throw new Error(`reflections: no move called ${key}`);
    return m;
  };
  const at = (m: Move3, t: number): Sprite => reflectionSprite(m, t, view);
  const round = (m: Move3, fps: number): Sprite[] => {
    const { end, from } = spanOf(m);
    const t0 = from ?? 0;
    const n = Math.max(1, Math.round((end - t0) * fps));
    return lazyFrames(n, (i) => at(m, t0 + i / fps));
  };
  const clip = (m: Move3, fps: number, t0 = 0, t1 = spanOf(m).end): Clip => {
    const n = Math.max(1, Math.ceil((t1 - t0) * fps - 1e-6) + 1);
    const c: Clip = { frames: lazyFrames(n, (i) => at(m, Math.min(t1, t0 + i / fps))), fps };
    if (m.motion.hit !== undefined && m.motion.hit >= t0 && m.motion.hit <= t1) c.hit = m.motion.hit - t0;
    if (m.motion.loop !== undefined) c.loop = m.motion.loop - t0;
    if (m.tail) c.tail = true;
    if (m.poise !== undefined && m.poise >= t0 && m.poise <= t1) c.poise = m.poise - t0;
    return c;
  };
  const spread = (m: Move3, n: number, t0: number, t1: number): Clip => ({ frames: lazyFrames(n, (i) => at(m, t0 + ((t1 - t0) * i) / (n - 1))), fps: n / Math.max(1e-6, t1 - t0) });
  const three = (c: Clip): Sprite[] => {
    const n = c.frames.length;
    const pick = (seconds: number): number => Math.max(0, Math.min(n - 1, Math.round(seconds * c.fps)));
    const hit = c.hit ?? (n - 1) / c.fps / 2;
    const picks = [pick(hit * 0.7), pick(hit + 0.035), pick(((n - 1) / c.fps + hit) / 2)];
    return lazyFrames(3, (i) => c.frames[picks[i]]);
  };
  const attack = clip(of(plan.attack), CLIP_FPS3);
  const attack2 = plan.attack2 ? clip(of(plan.attack2), CLIP_FPS3) : undefined;
  const heavy = clip(of(plan.heavy), CLIP_FPS3);
  const walkStride = of(plan.walk).stride;
  const walkFps = walkStride !== undefined ? GRIP_FPS3 : RUN_FPS3;
  const set: AnimSet = { idle: round(of(plan.idle), IDLE_FPS3), walk: round(of(plan.walk), walkFps), attack: three(attack), heavy: three(heavy), idleFps: IDLE_FPS3, walkFps, clips: { attack, heavy } };
  if (walkStride !== undefined) set.walkStride = walkStride;
  const stops = settlesOf(of(plan.walk), of(plan.idle));
  if (stops.length) set.stops = stops.map((m) => clip(m, CLIP_FPS3));
  const ways = runWaysOf(of(plan.walk));
  if (ways.length) set.walkWays = ways.map((m) => round(m, walkFps));
  const clips = set.clips as NonNullable<AnimSet['clips']>;
  const attackWalk = walkingOf(of(plan.attack), of(plan.walk));
  if (attackWalk.length) clips.attackWalk = attackWalk.map((m) => clip(m, CLIP_FPS3));
  const heavyWalk = walkingOf(of(plan.heavy), of(plan.walk));
  if (heavyWalk.length) clips.heavyWalk = heavyWalk.map((m) => clip(m, CLIP_FPS3));
  const start = startsOf(of(plan.walk), of(plan.idle));
  if (start) {
    set.start = clip(start.move, GRIP_FPS3);
    set.startAt = start.phase;
  }
  if (attack2) clips.attack2 = attack2;
  if (plan.leap) {
    const m = of(cls === 'warrior' && THRUST.on ? 'kthrust' : plan.leap);
    const until = m.arc ? m.arc.until : spanOf(m).end;
    clips.leap = spread(m, LEAP_FRAMES3, 0, until);
    const leap = clips.leap;
    set.leap = lazyFrames(3, (i) => leap.frames[Math.round([0.05, 0.45, 0.9][i] * (LEAP_FRAMES3 - 1))]);
    if (spanOf(m).end > until + 1e-6) clips.land = clip(m, CLIP_FPS3, until);
  }
  if (plan.roll) {
    const m = of(plan.roll);
    const until = m.tumble ?? spanOf(m).end;
    clips.roll = spread(m, ROLL_FRAMES3, 0, until);
    if (m.tumble !== undefined && spanOf(m).end > until + 1e-6) clips.land = clip(m, CLIP_FPS3, until);
  }
  if (plan.hold) {
    clips.hold = clip(of(plan.hold), CLIP_FPS3);
    const begun = holdStartOf(of(plan.hold));
    if (begun) clips.holdStart = clip(begun, CLIP_FPS3);
  }
  if (plan.release) clips.release = clip(of(plan.release), CLIP_FPS3);
  if (plan.whirl) clips.whirl = { ...clip(of(plan.whirl), CLIP_FPS3), turns: true };
  if (plan.reel) clips.reel = clip(of(plan.reel), CLIP_FPS3);
  if (plan.lurch) clips.lurch = clip(of(plan.lurch), CLIP_FPS3);
  if (plan.reel) {
    const w = walkingOf(of(plan.reel), of(plan.walk), false);
    if (w.length) clips.reelWalk = w.map((m) => clip(m, CLIP_FPS3));
  }
  if (plan.lurch) {
    const w = walkingOf(of(plan.lurch), of(plan.walk), false);
    if (w.length) clips.lurchWalk = w.map((m) => clip(m, CLIP_FPS3));
  }
  if (view === 'front') {
    if (plan.idleA) clips.idleA = clip(of(plan.idleA), GESTURE_FPS3);
    if (plan.idleB) clips.idleB = clip(of(plan.idleB), GESTURE_FPS3);
  }
  extra(set, view, cls);
  return set;
}

/** The moves a reflection of a class makes, by their names in moves3.ts MOVES3 (his plan in a dungeon, his fall left out). */
export function reflectionMoves(cls: ClassId): string[] {
  const plan = PLANS[cls].dungeon as unknown as Record<string, string | undefined>;
  const names = Object.entries(plan)
    .filter(([k, v]) => v && k !== 'fall' && k !== 'ready')
    .map(([, v]) => v as string);
  if (cls === 'warrior' && THRUST.on) names.push('kthrust');
  return [...new Set(names)];
}

/**
 * YOUR REFLECTIONS' PICTURES, in the shape the game holds its heroes' (art/heroes3.ts makeHeroArt3): `of(cls)` the glass
 * copy of that class, from in front and from behind. `extra` adds what art/reflections_fx.ts makes (its stepping out
 * of a mirror and its shattering) to each side.
 */
export function makeReflectionArt(extra?: Extra): { of(cls: ClassId): ActorArt } {
  const made = new Map<ClassId, ActorArt>();
  return {
    of(cls: ClassId): ActorArt {
      let art = made.get(cls);
      if (!art) {
        art = { front: reflectionSet(cls, 'front', extra), back: reflectionSet(cls, 'back', extra) };
        made.set(cls, art);
      }
      return art;
    },
  };
}

/** The lists of a side of a reflection, as art/heroes3.ts heroLists has a hero's (the checks walk every frame of them). */
export { heroLists as reflectionLists } from './heroes3';

/** (For the checks: the colours its glass is made of.) */
export const GLASS_COLOURS: readonly string[] = [...SILVER, ...VIOLET];
