// FLOOR 20'S SHADOWS OF THE FOUR ROYALS (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the game
// imports this file; `SHADOWS_ON` is off. What they leave behind and what their big moves throw: art/royal_shadows_fx.ts.
//
// His floor: THE QUIET TOWER, the Moth's lair; its palette grey fog, bone white, no colour. His pick, offered as a pop-up:
// “Each with one boss move (Recommended)”, with the brief as offered: "SHADOWS OF THE FOUR ROYALS (floor 20, medium).
// Who: grey fog echoes of the four royals you beat: the Princess, the Prince, the Queen, the King. Look: each royal's own
// shape, smaller (knight's size to a head taller), made of grey fog and bone white, no colour, the dull pink eyes. Move:
// each as its royal moved (the Prince quick and dancing, the King slow and heavy). Attacks (two): its royal's basic
// attack, and one of that royal's big moves, smaller. Death: it blows apart like smoke, leaving that royal's playing card
// for a moment. Never: not their full boss fights again; not gory. Sound: an echo of each royal's sound."
//
// HOW A SHADOW IS MADE: FROM ITS BOSS'S OWN MOVES. Its frame is its boss's frame (art/new_mobs3.ts `paintMob`, the very
// painter the boss is drawn with, on the boss's own bones and motions), and then:
//   1. FOG: every colour the boss's painter is handed (its ramps, its skins, its cloth, its specks) is laid on a ramp of
//      eleven tones from fog-black to bone white by its lightness, before it is painted; what the painter makes on its
//      own (a smear, a seam) the same, after. Each shape keeps its shading, so it reads as that royal.
//   2. THE HUSH'S DULL PINK IN ITS EYES (art/mkit.ts FLAME[1], FLAME[2] lit): the only colour on it. (The King's own eyes
//      were pale, the pink being the Hush's on his back: his shadow is the Hush's echo of him, and has it.)
//   3. SMALLER: the finished frame drawn at `k` of the boss's size, between the knight's height and a head over it. The painters' sizes are fixed lengths (the King's
//      sword, the Queen's comb), so a smaller build of bones would not hold them; drawing the finished frame smaller does.
//      (Each of its pixels the middle tone of the boss's under it, so its seams and edges stay crisp.)
//   4. FOG ON IT: its tones stir slowly upward through it, and wisps rise off its tops.
//   5. THE STYLE'S DARK SEAM round it and THE ENEMY'S PINK EDGE (art/mkit.ts ENEMY_RIM), one picture pixel.
//
// Its moves are its boss's, the very motions, timings and strikes (so the boss checks hold for them as for the boss):
// its stand, its walk, its basic attack, ONE of its big moves (art/royal_shadows_fx.ts draws it smaller), struck, and
// its death (its own: art/royal_shadows_fx.ts `deathPainted`).

import { Px, rgba } from '../engine/px';
import type { Light } from '../engine/px';
import { edge, hash } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { canvasOf, momentOf, paintMob, paintViewOf } from './new_mobs3';
import type { Bit, Mob, MobCanvas, MobMove } from './new_mobs3';
import { stage } from './skin';
import type { GameView } from './skin';
import type { Skeleton, V3 } from './skeleton';
import { PRINCESS, PR_LASH, PR_SNARE } from './princess_moves';
import { PC_MASKS, PC_THRUST, PRINCE } from './prince_moves';
import { QN_COMB, QN_REFLECT, QUEEN } from './queen_moves';
import { KG_CROWN, KG_SWEEP, KING_ALONE } from './king_moves';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const SHADOWS_ON = { on: false };

// =============================================================================================
// THE FOG

/** FOG AND BONE: eleven tones, fog-black to bone white. No colour in them (no channel more than 20 from another). */
export const FOG: readonly string[] = ['#0e0e10', '#18181b', '#232326', '#303034', '#404044', '#535357', '#6a6a6d', '#858483', '#a4a19d', '#c6c1b8', '#e6e0d3'];
const FOG_RGB = FOG.map((c) => rgba(c));
/** The Hush's dull pink, in its eyes: dark and lit (the Hushed's, the guard's, the royals' own). */
export const EYE = FLAME[1];
export const EYE_LIT = FLAME[2];
const EYE_RGB = rgba(EYE);
const EYE_LIT_RGB = rgba(EYE_LIT);

const luma = (r: number, g: number, b: number): number => 0.299 * r + 0.587 * g + 0.114 * b;
/** Which tone of fog a lightness (0..255) goes to: lifted a little, so the boss's darks read as fog and not as a hole. */
export const toneOf = (y: number): number => Math.max(0, Math.min(FOG.length - 1, Math.round((FOG.length - 1) * Math.pow(Math.max(0, y) / 255, 0.55))));
/** A colour of the boss's, as fog (its alpha kept). */
export function fogOf(c: string): string {
  if (c.charAt(0) !== '#') return c;
  const [r, g, b, a] = rgba(c);
  const t = FOG[toneOf(luma(r, g, b))];
  return a < 255 ? t + a.toString(16).padStart(2, '0') : t;
}
type Fn = (...a: unknown[]) => unknown;
/** Everything a painter is handed, its colours turned to fog: strings that are colours, through arrays, plain objects and the functions that give colours (a skin). */
function fogged(v: unknown): unknown {
  if (typeof v === 'string') return v.charAt(0) === '#' ? fogOf(v) : v;
  if (typeof v === 'function') return (...a: unknown[]) => fogged((v as Fn)(...a));
  if (Array.isArray(v)) return v.length && typeof v[0] === 'number' ? v : v.map(fogged);
  if (v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
    const o: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) o[k] = fogged(x);
    return o;
  }
  return v;
}
/** A bit of the boss's, as the shadow's: its eyes the dull pink, everything else fog. */
function foggedBit(b: Bit): Bit {
  if (b.piece === 'eyes' && b.shape.k === 'dot') return { ...b, shape: { ...b.shape, c: EYE, c2: EYE_LIT } };
  return { ...b, shape: fogged(b.shape) as Bit['shape'] };
}

/** THE SHADOW OF A BOSS, AS A MONSTER: its boss's bones, moves and painter, its colours fog (what `drop` names left out). */
export function shadowMobOf(boss: Mob, id: string, name: string, drop: (b: Bit) => boolean = () => false): Mob {
  return {
    ...boss,
    id,
    name,
    bits: (st, m) => boss.bits(st, m).filter((b) => !drop(b)).map(foggedBit),
    grains: boss.grains ? (st, m) => boss.grains!(st, m).map(([p, c, n]) => [p, fogOf(c), n] as const) : undefined,
    aura: { ...boss.aura, color: EYE } as Mob['aura'],
  };
}

// =============================================================================================
// THE QUEEN'S BLINK (Looking Glass, done small: no wall mirrors). Into her hand mirror where she is; out of it where the
// game puts her (behind you, as her Looking Glass does).

/**
 * INTO THE MIRROR (`into`, 1.0 s): her left hand lifted (her Reflections' lift, its ring of glass left out), a hand mirror
 * gathering in it (0.15 to 0.3 s); its glass flashing (0.35 to 0.6 s: the warning); in two frames (0.6 to 0.667) she folds
 * into it; it hangs, shrinks and puffs away (to 1.0 s). OUT OF IT (`out`, 0.9 s): the mirror gathers in the air at her
 * hand's height (0 to 0.25 s), her pink eyes in its glass (from 0.12 s: the warning); in two frames (0.3 to 0.367) she
 * unfolds out of it, standing; the mirror fades from her hand (to 0.9 s). Its strike, as the boss's Looking Glass out of
 * the glass: as she comes out.
 */
export const BLINK = { into: 1.0, out: 0.9, lift: 0.85, form: [0.15, 0.3] as const, warnIn: [0.35, 0.6] as const, strikeIn: [0.6, 0.6667] as const, gone: [0.7, 1.0] as const, formOut: [0, 0.25] as const, eyesOut: 0.12, strikeOut: [0.3, 0.3667] as const, fadeOut: [0.6, 0.9] as const } as const;

// =============================================================================================
// THE FOUR

export type RoyalId = 'princess' | 'prince' | 'queen' | 'king';
export interface Royal {
  id: RoyalId;
  name: string;
  /** Its boss, and its shadow on the boss's bones (for the boss checks and the painter). */
  boss: Mob;
  mob: Mob;
  /** How big it is drawn, of its boss: the knight's height (58) to a head over it. */
  k: number;
  /** Its walk's pace (tiles a second): its boss's, at its size, so its feet still grip. */
  pace: number;
  /** Its two attacks: its boss's basic one, and the one big move (its name in its boss's moves; the Queen's is her own). */
  basic: string;
  big: string;
  bigName: string;
  /** Each strike (seconds): from the last frame of its wind-up to the frame it lands on. */
  strikes: Readonly<Record<string, readonly [number, number]>>;
}
const royal = (id: RoyalId, name: string, boss: Mob, k: number, big: string, bigName: string, strikes: Royal['strikes'], drop?: (b: Bit) => boolean): Royal => ({
  id, name, boss, mob: shadowMobOf(boss, `shadow_${id}`, name, drop), k, pace: Math.round(boss.pace * k * 100) / 100, basic: 'attack', big, bigName, strikes,
});
/** The Queen's ring of glass round her lifted hand (her Reflections') is not her shadow's: its hand mirror is. */
const QUEEN_GLASS = (b: Bit): boolean => /glass|shard|ring|whirl/i.test(b.part) || /glass|shard|whirl/i.test(b.piece);

export const ROYALS: Readonly<Record<RoyalId, Royal>> = {
  princess: royal('princess', 'Shadow of the Princess', PRINCESS, 0.8, 'snare', 'The vine snare, a small cage', { attack: PR_LASH.strike, snare: PR_SNARE.strike }),
  prince: royal('prince', 'Shadow of the Prince', PRINCE, 0.76, 'masks', 'Masks, three and short', { attack: PC_THRUST.strike, masks: PC_MASKS.strike }),
  queen: royal('queen', 'Shadow of the Queen', QUEEN, 0.72, 'blink', 'Looking Glass: a blink through her hand mirror', { attack: QN_COMB.strike, blinkIn: BLINK.strikeIn, blinkOut: BLINK.strikeOut }, QUEEN_GLASS),
  king: royal('king', 'Shadow of the King', KING_ALONE, 0.64, 'crown', 'The Crown, leap and slam, short', { attack: KG_SWEEP.strike, crown: KG_CROWN.strike }),
};
export const ROYAL_IDS: readonly RoyalId[] = ['princess', 'prince', 'queen', 'king'];

// =============================================================================================
// A FRAME

/** A finished frame, and the floor point under the figure on it (picture pixels). */
export interface Frame {
  px: Px;
  ax: number;
  ay: number;
  lights: Light[];
}
const TONE = new Map<number, number>(FOG_RGB.map((c, i) => [(c[0] << 16) | (c[1] << 8) | c[2], i]));
const same = (d: Uint8ClampedArray, i: number, c: readonly number[]): boolean => d[i] === c[0] && d[i + 1] === c[1] && d[i + 2] === c[2];

/** The boss's frame, as fog (what its painter made on its own turned too), at the boss's size, with no edge yet. */
function foggedFrame(r: Royal, move: string, t: number, view: GameView): { px: Px; lights: Light[] } {
  const p = paintMob(r.mob, move, t, view, null);
  const d = p.px.d;
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3] || same(d, i, EYE_RGB) || same(d, i, EYE_LIT_RGB)) continue;
    const c = FOG_RGB[toneOf(luma(d[i], d[i + 1], d[i + 2]))];
    d[i] = c[0];
    d[i + 1] = c[1];
    d[i + 2] = c[2];
  }
  return { px: p.px, lights: p.lights.map((l) => ({ ...l, color: l.color.charAt(0) === '#' ? fogOf(l.color) : l.color })) };
}

/** A picture drawn `k` of its size about its floor point: each pixel the middle tone of what of the boss's lies under it (3 by 3 looks), there if more than half is; an eye wherever any of one is. */
export function smaller(src: Px, ax: number, ay: number, k: number): { px: Px; ax: number; ay: number; tone: Int8Array } {
  const dax = Math.round(ax * k) + 2;
  const day = Math.round(ay * k) + 2;
  const w = Math.ceil(src.w * k) + 4;
  const h = Math.ceil(src.h * k) + 4;
  const px = new Px(w, h);
  const tone = new Int8Array(w * h).fill(-1);
  const s = src.d;
  const tones = new Int8Array(9);
  for (let Y = 0; Y < h; Y++) {
    for (let X = 0; X < w; X++) {
      let n = 0;
      let eye = 0;
      tones.fill(99);
      for (let j = 0; j < 3; j++) {
        const sy = Math.floor(ay + (Y + (j + 0.5) / 3 - day) / k);
        if (sy < 0 || sy >= src.h) continue;
        for (let i = 0; i < 3; i++) {
          const sx = Math.floor(ax + (X + (i + 0.5) / 3 - dax) / k);
          if (sx < 0 || sx >= src.w) continue;
          const si = (sy * src.w + sx) * 4;
          if (s[si + 3] < 128) continue;
          n++;
          if (same(s, si, EYE_LIT_RGB)) eye = 2;
          else if (same(s, si, EYE_RGB)) eye = Math.max(eye, 1);
          else tones[n - 1] = TONE.get((s[si] << 16) | (s[si + 1] << 8) | s[si + 2]) ?? toneOf(luma(s[si], s[si + 1], s[si + 2]));
        }
      }
      if (n < 5 && !(eye && n >= 3)) continue;
      const di = (Y * w + X) * 4;
      if (eye) {
        px.d.set(eye === 2 ? EYE_LIT_RGB : EYE_RGB, di);
        px.d[di + 3] = 255;
        continue;
      }
      // (the middle one of what lies under it: its edges and seams kept crisp, as an average would not)
      tones.sort();
      const lit = tones.findIndex((v) => v === 99);
      const t = tones[Math.floor((lit < 0 ? 9 : lit) / 2)];
      tone[Y * w + X] = t;
      px.d.set(FOG_RGB[t], di);
      px.d[di + 3] = 255;
    }
  }
  return { px, ax: dax, ay: day, tone };
}

/** Fog on a finished shadow: its tones stirring upward through it (moving with it), its dark seam round it, its pink edge, and wisps rising off its tops. */
export function fogOn(f: { px: Px; ax: number; ay: number; tone: Int8Array }, t: number, seed: number, wisps = true): Px {
  const { px, ax, ay, tone } = f;
  const w = px.w;
  const h = px.h;
  const d = px.d;
  const rise = t * 9;
  // (soft noise on a grid of five, drifting upward)
  const noise = (x: number, y: number): number => {
    const gx = x / 5;
    const gy = (y + rise) / 5;
    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const fx = gx - x0;
    const fy = gy - y0;
    const v = (i: number, j: number): number => hash(x0 + i, y0 + j, seed);
    return (v(0, 0) * (1 - fx) + v(1, 0) * fx) * (1 - fy) + (v(0, 1) * (1 - fx) + v(1, 1) * fx) * fy;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = y * w + x;
      if (tone[k] < 0) continue;
      const n = noise(x - ax, y - ay);
      const tt = Math.min(FOG.length - 1, tone[k] + (n > 0.74 && tone[k] > 1 ? 1 : 0));
      tone[k] = tt;
      d.set(FOG_RGB[tt], k * 4);
    }
  }
  // the dark seam round it
  const at: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = y * w + x;
      if (!d[k * 4 + 3] || tone[k] < 0) continue;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1 || !d[(k - 1) * 4 + 3] || !d[(k + 1) * 4 + 3] || !d[(k - w) * 4 + 3] || !d[(k + w) * 4 + 3]) at.push(k);
    }
  }
  for (const k of at) d.set(FOG_RGB[1], k * 4);
  edge(px, ENEMY_RIM);
  if (wisps) {
    // wisps off its tops: from a pixel of it with nothing over it, a thread of fog rising and leaning, thinning
    for (let y = 1; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const k = y * w + x;
        if (tone[k] < 0 || d[(k - w) * 4 + 3] === 255) continue;
        if (hash(x - ax, 0, seed + 5) > 0.16) continue;
        const ph = (t * 0.9 + hash(x - ax, 1, seed + 6)) % 1;
        const long = 4 + Math.floor(hash(x - ax, 2, seed + 7) * 6);
        for (let s = 0; s < long; s++) {
          const yy = y - 2 - s - Math.floor(ph * 6);
          const xx = x + Math.round(Math.sin(ph * 6.3 + s * 0.6 + x) * 1.2);
          if (yy < 0 || xx < 0 || xx >= w) continue;
          const di = (yy * w + xx) * 4;
          if (d[di + 3]) continue;
          d.set(FOG_RGB[7 - Math.min(3, s >> 1)], di);
          d[di + 3] = Math.round(150 * (1 - s / long) * (1 - ph * 0.7));
        }
      }
    }
  }
  return px;
}

/** Where a point of the boss's bones is on the shadow's frame (picture pixels), at its size. */
export function pointOn(r: Royal, view: GameView, p: V3, f: { ax: number; ay: number }): [number, number] {
  const can = canvasOf(r.mob);
  const [x, y] = stage(paintViewOf(r.mob, view), can.ax, can.ay, can).at(p);
  return [f.ax + (x - can.ax) * r.k, f.ay + (y - can.ay) * r.k];
}
/** The boss's bones at a moment of a move. */
export function bonesAt(r: Royal, move: string, t: number): Skeleton {
  const mv = (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? r.mob[move] : r.mob.more?.[move]) as MobMove;
  return momentOf(r.mob, mv, t).s;
}

const SEED: Readonly<Record<RoyalId, number>> = { princess: 2011, prince: 2012, queen: 2013, king: 2014 };
/** ONE FRAME OF A SHADOW: its boss's frame at that moment of the move, as fog, smaller, with its edge and its wisps. (Its big move's effect and its death: art/royal_shadows_fx.ts.) */
export function shadowFrame(r: Royal, move: string, t: number, view: GameView, wisps = true): Frame {
  const can: MobCanvas = canvasOf(r.mob);
  const f = foggedFrame(r, move, t, view);
  const s = smaller(f.px, can.ax, can.ay, r.k);
  const px = fogOn(s, t, SEED[r.id], wisps);
  return { px, ax: s.ax, ay: s.ay, lights: f.lights.map((l) => ({ ...l, x: s.ax + (l.x - can.ax) * r.k, y: s.ay + (l.y - can.ay) * r.k, r: l.r * r.k })) };
}
/** Its moves' lengths (seconds): its boss's. */
export function longOf(r: Royal, move: string): number {
  const mv = (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? r.mob[move] : r.mob.more?.[move]) as MobMove | undefined;
  if (!mv) throw new Error(`${r.id} has no move ${move}`);
  const keys = mv.motion.keys;
  return keys[keys.length - 1].at;
}
/** Its loops' lengths, for the film: its stand, its walk (frames over a second's frames). */
export function loopOf(r: Royal, move: 'stand' | 'walk'): number {
  return move === 'walk' ? r.mob.walkFrames / r.mob.walkFps : r.mob.idleFrames / r.mob.idleFps;
}
