// FLOOR 18: WHAT YOUR REFLECTIONS STEP OUT OF, AND HOW THEY SHATTER (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE
// GAME, behind art/reflections.ts REFLECTIONS_ON, off. Nothing of the game imports it.
//
// His pick, “Glassy copy of you (Recommended)”, with the brief as offered: a copy of whichever hero you play, STEPPING
// OUT OF A MIRROR; its death, IT SHATTERS INTO SHARDS THAT FALL AND FADE; the ring of glass.
//
// STEPPING OUT OF A MIRROR (`stepOutPainted`, `STEP_OUT`): the mirror's glass stirs and rings run out across it; a dark
// shape forms in it, the copy of you, and grows bright as silvered glass, the Hush's pink kindling in its eyes; then it
// is thrown out through the glass, its front first, the glass clinging to what is still inside and a bright skin where
// it breaks the surface; the surface bursts in a spray of glass drops, its pink edge flares, and it stands on the
// gallery floor while the rings die away behind it. The glass is the cold blue of the floor's palette.
//
// IT SHATTERS (`shatterPainted`, `SHATTER`): from its own picture as it was struck. White cracks race over it from the
// blow; it bursts into angular shards (its picture cut along straight lines, each shard a piece of it, its broken
// edges catching the light) and a spray of glitter; they fly out, turning by quarter turns and flashing as they turn,
// fall, bounce and skid on the floor, the pink in them going out; and they fade away, pixel by pixel, until nothing is
// left.
//
// STRUCK (`chipsPainted`): chips of glass fly off it (his rulebook, Hits 4: what flies off a hit is the monster's).

import { Px, rgba } from '../engine/px';
import type { Light } from '../engine/px';
import type { ClassId } from '../game/types';
import type { AnimSet, Clip } from './actor_types';
import { PLANS } from './heroes3';
import { INK, hash, lazyFrames, toSprite } from './kit';
import type { Painted } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { MOVES3 } from './moves3';
import type { Move3 } from './moves3';
import { EYE, REFLECTION_POOL, SILVER, VIOLET, reflectionPainted } from './reflections';
import { CANVAS3 } from './skin';
import type { GameView } from './skin';

// =============================================================================================
// COLOURS

/** THE MIRRORS' GLASS: the floor's cold blue, darkest first (hues 216 to 230, never cyan). */
export const MIRROR_BLUE: readonly string[] = ['#0b1024', '#121a36', '#1b274c', '#283a66', '#3a5284', '#5470a2', '#7a95c2', '#aec2e4', '#e2ecfa'];
/** Its stand-in frame (the gallery's own mirrors are the floor's pieces): silver, shaded to dark violet. */
const FRAME: readonly string[] = ['#141026', '#2a2442', '#4a4566', '#7a7898', '#b2b4cc', '#e2e4f0'];

const GLASSES = [SILVER, VIOLET] as const;
const packed = (r: number, g: number, b: number): number => (r << 16) | (g << 8) | b;
/** Which glass and tone a colour of a reflection's is (art/reflections.ts SILVER, VIOLET), if it is one. */
const TONE_OF = new Map<number, { glass: 0 | 1; tone: number }>();
GLASSES.forEach((ramp, glass) =>
  ramp.forEach((c, tone) => {
    const [r, g, b] = rgba(c);
    TONE_OF.set(packed(r, g, b), { glass: glass as 0 | 1, tone });
  }),
);
const INKP = (() => {
  const [r, g, b] = rgba(INK);
  return packed(r, g, b);
})();
const EYEP = (() => {
  const [r, g, b] = rgba(EYE);
  return packed(r, g, b);
})();
const PINKS = new Set([ENEMY_RIM, EYE, FLAME[0], '#ff8ab4', '#ffc0d6', '#ff3a78'].map((c) => {
  const [r, g, b] = rgba(c);
  return packed(r, g, b);
}));

/** An ordered dither of 4 x 4 (0..15): a pixel of a fading thing is kept while its fade is below its number. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x: number, y: number): number => BAYER[((y & 3) << 2) | (x & 3)];
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const ease = (k: number): number => k * k * (3 - 2 * k);

/** Copy a pixel's colour into another painting. */
function put(p: Px, x: number, y: number, r: number, g: number, b: number, a = 255): void {
  if (x < 0 || y < 0 || x >= p.w || y >= p.h) return;
  const i = (y * p.w + x) * 4;
  p.d[i] = r;
  p.d[i + 1] = g;
  p.d[i + 2] = b;
  p.d[i + 3] = a;
}
function putC(p: Px, x: number, y: number, c: string, a = 255): void {
  const [r, g, b] = rgba(c);
  put(p, Math.round(x), Math.round(y), r, g, b, a);
}

// =============================================================================================
// THE MIRROR IT STEPS OUT OF

/**
 * A MIRROR'S GLASS, as the effect paints over it: upright against a wall that runs along the floor's y (so it faces the
 * way a reflection faces from in front, down the screen and to the right; the game shows it the other way round on the
 * other wall), `wide` across and `tall` to where its arch begins, the arch `arch` higher at its middle; in picture
 * pixels. Its foot, the middle of its lowest edge, is on the wall's line.
 */
export interface MirrorShape {
  wide: number;
  tall: number;
  arch: number;
}
/** The mirrors of the gallery, as the effect has them (the floor's own mirror pieces would be made to match). */
export const GALLERY_MIRROR: MirrorShape = { wide: 58, tall: 84, arch: 22 };
/** A point on a mirror's face (u along the wall, + up it to the right; v up from its foot) on the picture, its foot at (mx, my). */
export const onMirror = (mx: number, my: number, u: number, v: number): [number, number] => [mx + u, my - 0.5 * u - v];
/** A pixel of the picture on a mirror's face. */
export const ofMirror = (mx: number, my: number, x: number, y: number): [number, number] => {
  const u = x + 0.5 - mx;
  return [u, my - 0.5 * u - (y + 0.5)];
};
/** Whether a point of a mirror's face is its glass. */
export function inGlass(m: MirrorShape, u: number, v: number): boolean {
  const half = m.wide / 2;
  if (Math.abs(u) > half || v < 2) return false;
  return v <= m.tall + m.arch * Math.sqrt(Math.max(0, 1 - (u / half) * (u / half)));
}
/** The glass's own look where nothing stirs it: darker at its foot, a long slanting streak of light and a thin one. */
function stillGlass(m: MirrorShape, u: number, v: number): number {
  const top = m.tall + m.arch;
  let t = 2 + Math.round((v / top) * 2.2);
  const s = u + v * 0.55;
  if (Math.abs(s - 10) < 3.2) t += 2;
  else if (Math.abs(s - 24) < 0.8) t += 2;
  else if (Math.abs(s + 18) < 1.5) t += 1;
  return Math.min(6, t);
}

/**
 * THE STAND-IN MIRROR (the floor's own are the gallery's pieces; this one is for the pictures): its glass still, in a
 * carved silver frame, its foot at (mx, my) on a picture `w` x `h`. The frame: a moulding round the glass, lit from the
 * upper left, a crest at the top of its arch, scrolled feet.
 */
export function mirrorPainted(w: number, h: number, mx: number, my: number, m: MirrorShape = GALLERY_MIRROR): Px {
  const p = new Px(w, h);
  const half = m.wide / 2;
  const B = 7;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [u, v] = ofMirror(mx, my, x, y);
      if (inGlass(m, u, v)) {
        putC(p, x, y, MIRROR_BLUE[stillGlass(m, u, v)]);
        continue;
      }
      // the frame: inside the glass made bigger by its width
      const outer = { wide: m.wide + B * 2, tall: m.tall, arch: m.arch + B * 1.3 };
      const ou = Math.abs(u);
      if (ou > half + B || v < -3) continue;
      if (!inGlass(outer, u, v + 5) && v > m.tall) continue;
      if (v > m.tall + m.arch + B + 2) continue;
      // (how far into the moulding: 0 at the glass, 1 at its outer edge; lit from the upper left)
      const across = ou > half ? (ou - half) / B : v < 2 ? (2 - v) / 5 : clamp01((v - m.tall - m.arch * Math.sqrt(Math.max(0, 1 - (u / half) ** 2))) / (B * 1.3));
      const leftish = u < 0 || v > m.tall;
      let t = across < 0.25 ? 1 : across < 0.55 ? (leftish ? 4 : 3) : across < 0.8 ? (leftish ? 3 : 2) : 1;
      // (carving: beads along the moulding)
      if (across > 0.3 && across < 0.6 && Math.round(v + u * 0.5) % 6 === 0) t = Math.max(0, t - 2);
      putC(p, x, y, FRAME[t]);
    }
  }
  // the crest: a small pointed shield of silver over the arch, a dark violet stone in it
  const top = m.tall + m.arch + B;
  for (let j = 0; j < 9; j++) {
    for (let i = -4; i <= 4; i++) {
      if (Math.abs(i) > 4 - j * 0.45) continue;
      const [x, y] = onMirror(mx, my, i, top + 6 - j);
      const c = Math.abs(i) <= 1 && j > 2 && j < 6 ? '#3e2d53' : i < 0 ? FRAME[4] : FRAME[3];
      putC(p, Math.round(x), Math.round(y), c);
    }
  }
  // scrolled feet
  for (const side of [-1, 1]) {
    for (let a = 0; a < 14; a++) {
      const ang = (a / 13) * Math.PI * 1.4;
      const r = 3.2 - a * 0.12;
      const [x, y] = onMirror(mx, my, side * (half + 2) + side * Math.cos(ang) * r, -2 + Math.sin(ang) * r);
      putC(p, Math.round(x), Math.round(y), a < 5 ? FRAME[4] : FRAME[2]);
    }
  }
  // the seam of the style round it all
  const out = p.clone();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (p.has(x, y)) continue;
      if (p.has(x - 1, y) || p.has(x + 1, y) || p.has(x, y - 1) || p.has(x, y + 1)) putC(out, x, y, INK);
    }
  }
  return out;
}

// =============================================================================================
// STEPPING OUT OF A MIRROR

/**
 * ITS TIMES, in seconds: `forms` the dark shape begins in the glass; `lit` it is bright, its eyes kindled; from `from`
 * to `until` it is thrown out through the glass (the hero's own stumble forward, `lurch`, played slower), carried `back`
 * tiles from behind the glass to `out` tiles in front of it; at `until` the surface bursts. `time` the whole of it.
 */
export const STEP_OUT = { time: 1.6, fps: 30, forms: 0.18, lit: 0.55, from: 0.72, until: 1.08, back: 0.25, out: 0.85, slow: 1.6 };
/** Its picture: room for the mirror behind it and the spray; its feet, where it ends, at (ax, ay). */
export const STEP_CANVAS = { w: 300, h: 240, ax: 176, ay: 196 };
/** A tile along the floor's x, on the picture (down and to the right). */
const TILE_X: readonly [number, number] = [32, 16];
/** Where the mirror's foot is on the step's picture. */
export const STEP_MIRROR: readonly [number, number] = [STEP_CANVAS.ax - TILE_X[0] * STEP_OUT.out, STEP_CANVAS.ay - TILE_X[1] * STEP_OUT.out];

/** The tone a reflection's pixel has, if it is glass. */
function toneAt(d: Uint8ClampedArray, i: number): { glass: 0 | 1; tone: number } | undefined {
  return TONE_OF.get(packed(d[i], d[i + 1], d[i + 2]));
}

/** What a class stands in and stumbles forward in, in a dungeon (art/heroes3.ts PLANS). */
function movesOfClass(cls: ClassId): { stand: Move3; lurch: Move3 } {
  const plan = PLANS[cls].dungeon;
  return { stand: MOVES3[plan.idle], lurch: MOVES3[plan.lurch ?? plan.reel ?? plan.idle] };
}

/** Where a reflection is in its stepping out, and what it is doing: its feet on the step's picture, the move and the moment of it, how far through the glass (0 all behind it, 1 all out). */
export function steppingAt(cls: ClassId, t: number): { x: number; y: number; move: Move3; at: number; through: number } {
  const { stand, lurch } = movesOfClass(cls);
  const S = STEP_OUT;
  const k = ease(clamp01((t - S.from) / (S.until - S.from)));
  const tiles = -S.back + (S.back + S.out) * k;
  const x = STEP_MIRROR[0] + TILE_X[0] * tiles;
  const y = STEP_MIRROR[1] + TILE_X[1] * tiles;
  const lurchLong = lurch.motion.keys[lurch.motion.keys.length - 1].at;
  if (t < S.from) return { x, y, move: stand, at: t, through: 0 };
  if (t < S.from + lurchLong * S.slow) return { x, y, move: lurch, at: (t - S.from) / S.slow, through: k };
  return { x, y, move: stand, at: t - S.from - lurchLong * S.slow, through: k };
}

/** Rings running out across the glass from where it stirs: how many tones lighter (+) or darker (-) a point of it is. */
function ripple(u: number, v: number, u0: number, v0: number, since: number, strength: number): number {
  if (since <= 0 || strength <= 0) return 0;
  const r = Math.hypot(u - u0, (v - v0) * 0.9);
  const front = since * 70;
  if (r > front + 2) return 0;
  const amp = strength * Math.exp(-r / 40) * Math.exp(-since * 1.6);
  const wave = Math.sin(((r - front) / 7) * Math.PI * 2);
  if (amp < 0.25) return 0;
  return wave > 0.72 ? Math.min(3, Math.round(amp * 3)) : wave < -0.72 ? -Math.min(2, Math.round(amp * 2)) : 0;
}

/** The glass drops that burst from the surface: where each is at a moment after the burst, and its colour (or null when gone). */
function drops(n: number, seed: number, cx: number, cy: number, since: number, floorY: number, out: Px): void {
  const COL = ['#e2ecfa', '#aec2e4', '#f5f7ff', '#7a95c2', '#c9cbd9'];
  for (let i = 0; i < n; i++) {
    const a = (hash(i, seed, 1) - 0.5) * Math.PI * 1.5 - Math.PI * 0.15;
    const sp = 70 + 120 * hash(i, seed, 2);
    const vx = Math.cos(a) * sp * 0.9 + 30;
    const vy = Math.sin(a) * sp * 0.55 - 90 * hash(i, seed, 3) - 20;
    const x0 = cx + (hash(i, seed, 4) - 0.5) * 18;
    const y0 = cy + (hash(i, seed, 5) - 0.5) * 34;
    const land = floorY + (hash(i, seed, 6) - 0.4) * 22;
    const t = since;
    let x = x0 + vx * t;
    let y = y0 + vy * t + 0.5 * 520 * t * t;
    let gone = false;
    if (y > land) {
      // (it lands, skids a little, and is gone)
      const tl = (-vy + Math.sqrt(Math.max(0, vy * vy + 2 * 520 * (land - y0)))) / 520;
      const after = t - tl;
      x = x0 + vx * tl + vx * 0.25 * Math.min(after, 0.12);
      y = land;
      if (after > 0.12 + 0.2 * hash(i, seed, 7)) gone = true;
    }
    if (gone) continue;
    const c = COL[i % COL.length];
    putC(out, x, y, c);
    // (some are drops, some flakes of the surface: two or three pixels, a lit one and a shaded one)
    if (i % 3 === 0) putC(out, x + 1, y, c);
    if (i % 4 === 1) putC(out, x, y - 1, COL[(i + 1) % COL.length]);
    if (i % 5 === 2) {
      putC(out, x + 1, y, MIRROR_BLUE[7]);
      putC(out, x + 1, y + 1, MIRROR_BLUE[4]);
      putC(out, x, y + 1, MIRROR_BLUE[5]);
    }
  }
}

/**
 * A REFLECTION STEPPING OUT OF A MIRROR, `t` seconds into it (STEP_OUT), as the effect paints it over the mirror's
 * glass: the glass stirring with the figure in it, and the figure as it comes out, on the step's picture (STEP_CANVAS),
 * the mirror's foot at STEP_MIRROR. From in front (the game shows it the other way round on the other wall). The
 * mirror's frame is not in it: that is the floor's piece (`mirrorPainted` is a stand-in for the pictures).
 */
export function stepOutPainted(cls: ClassId, t: number, m: MirrorShape = GALLERY_MIRROR): Painted {
  const S = STEP_OUT;
  const W = STEP_CANVAS.w;
  const H = STEP_CANVAS.h;
  const out = new Px(W, H);
  const [mx, my] = STEP_MIRROR;
  const at = steppingAt(cls, t);
  const fig = reflectionPainted(at.move, at.at, 'front');
  const fd = fig.px.d;
  // (the figure's picture laid on the step's: its feet at at.x, at.y)
  const ox = Math.round(at.x) - CANVAS3.ax;
  const oy = Math.round(at.y) - CANVAS3.ay;
  // how bright the figure in the glass is (0 none of it, 1 its whole glass), whether its eyes are kindled
  const formed = clamp01((t - S.forms) / (S.lit - S.forms));
  const kindled = t >= S.lit;
  // where the membrane is, along the way it faces: what is past it is out of the glass
  const through = at.through;
  const faceX = 2 / Math.sqrt(5);
  const faceY = 1 / Math.sqrt(5);
  const membrane = t < S.from ? Infinity : t >= S.until ? -Infinity : 46 - 92 * through;
  /** Each pixel of the step's picture: 0 nothing of the figure, 1 the figure in the glass, 2 the figure out of it. */
  const where = new Uint8Array(W * H);
  for (let y = 0; y < CANVAS3.h; y++) {
    for (let x = 0; x < CANVAS3.w; x++) {
      const i = (y * CANVAS3.w + x) * 4;
      if (fd[i + 3] === 0) continue;
      const X = x + ox;
      const Y = y + oy;
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const along = (x - CANVAS3.ax) * faceX + (y - CANVAS3.ay) * faceY;
      const isOut = along > membrane;
      if (isOut) where[Y * W + X] = 2;
      else {
        // (inside, it is only seen through the glass; and its edge of light is not lit in there)
        const [u, v] = ofMirror(mx, my, X, Y);
        if (fd[i + 3] !== 255 || !inGlass(m, u, v)) continue;
        where[Y * W + X] = 1;
      }
    }
  }
  // THE GLASS: still, stirred by rings from the figure's breast as it forms, and again as it bursts out
  const [u0, v0] = [at.x - mx - 4, 34];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const [u, v] = ofMirror(mx, my, x, y);
      if (!inGlass(m, u, v)) continue;
      let tone = stillGlass(m, u, v);
      tone += ripple(u, v, u0, v0, t - 0.02, 1.1) + ripple(u, v, u0, v0 - 6, t - S.from, 1.6) + ripple(u, v, u0, v0, t - S.until, 1.3);
      putC(out, x, y, MIRROR_BLUE[Math.max(0, Math.min(MIRROR_BLUE.length - 1, tone))]);
    }
  }
  // THE FIGURE IN THE GLASS: tinted the glass's blue, shimmering row by row, forming out of the dark
  const shimmer = (Y: number): number => Math.round(1.4 * Math.sin(Y * 0.55 + t * 13) * (1 - 0.6 * formed));
  for (let Y = 0; Y < H; Y++) {
    const sh = shimmer(Y);
    for (let X = 0; X < W; X++) {
      if (where[Y * W + X] !== 1) continue;
      const sx = X - ox - sh;
      const sy = Y - oy;
      if (sx < 0 || sx >= CANVAS3.w) continue;
      const i = (sy * CANVAS3.w + sx) * 4;
      if (fd[i + 3] !== 255) continue;
      // (it forms out of the dark: a pixel at a time, as a dither)
      if (bayer(X, Y) >= formed * 22) continue;
      const pk = packed(fd[i], fd[i + 1], fd[i + 2]);
      let c: string;
      if (pk === INKP) c = MIRROR_BLUE[0];
      else if (PINKS.has(pk)) c = kindled ? (pk === EYEP ? EYE : ENEMY_RIM) : MIRROR_BLUE[5];
      else {
        const g = toneAt(fd, i);
        const tone = g ? g.tone : 4;
        c = MIRROR_BLUE[Math.max(1, Math.min(8, Math.round(1 + (tone - 1) * (0.35 + 0.65 * formed))))];
      }
      putC(out, X, Y, c);
    }
  }
  // THE FIGURE OUT OF IT: itself, the glass's bright skin where it breaks the surface
  for (let Y = 0; Y < H; Y++) {
    for (let X = 0; X < W; X++) {
      if (where[Y * W + X] !== 2) continue;
      const i = ((Y - oy) * CANVAS3.w + (X - ox)) * 4;
      put(out, X, Y, fd[i], fd[i + 1], fd[i + 2], fd[i + 3]);
    }
  }
  if (t >= S.from && t < S.until) {
    for (let Y = 1; Y < H - 1; Y++) {
      for (let X = 1; X < W - 1; X++) {
        if (where[Y * W + X] !== 2 || out.d[(Y * W + X) * 4 + 3] !== 255) continue;
        const k = Y * W + X;
        if (where[k - 1] === 1 || where[k + 1] === 1 || where[k - W] === 1 || where[k + W] === 1) putC(out, X, Y, (X + Y) % 3 === 0 ? '#f5f7ff' : MIRROR_BLUE[7]);
      }
    }
  }
  // THE BURST: drops of glass flung from it, and its pink edge flaring
  const lights: Light[] = [];
  if (t >= S.until) {
    const since = t - S.until;
    drops(64, 18, at.x - 8, at.y - 32, since, STEP_CANVAS.ay, out);
    if (since < 2.5 / S.fps) {
      // (a second edge of pink, outside the first)
      const was = out.clone();
      const [pr, pg, pb] = rgba(ENEMY_RIM);
      for (let Y = 1; Y < H - 1; Y++) {
        for (let X = 1; X < W - 1; X++) {
          const i = (Y * W + X) * 4;
          if (was.d[i + 3] !== 0) continue;
          const near = [i - 4, i + 4, i - W * 4, i + W * 4].some((j) => was.d[j + 3] > 0 && was.d[j + 3] < 255);
          if (near) put(out, X, Y, pr, pg, pb, 110);
        }
      }
    }
    if (since < 0.25) lights.push({ x: at.x - 6, y: at.y - 32, r: 34, color: '#aec2e4', a: 0.5 * (1 - since / 0.25) });
  }
  if (kindled && t < S.until) lights.push({ x: at.x, y: at.y - 52, r: 10, color: '#ff3a78', a: 0.35 });
  if (t >= S.until) for (const l of fig.lights) lights.push({ ...l, x: l.x + ox, y: l.y + oy });
  return { px: out, lights };
}

// =============================================================================================
// IT SHATTERS

/** ITS SHATTERING: `time` seconds; the cracks race over it for the first `breaks` of it; its shards fade between `fades` and the end. */
export const SHATTER = { time: 1.4, fps: 30, breaks: 0.08, fades: 0.48, gravity: 760 };
/** Its picture: room for the shards to fly; its feet where they stood at (ax, ay). */
export const SHATTER_CANVAS = { w: 360, h: 272, ax: 180, ay: 206 };

interface Shard {
  /** Its pixels, cut out of the figure (a box of them). */
  px: Px;
  /** Its box's corner on the figure's picture, and its middle. */
  x0: number;
  y0: number;
  cx: number;
  cy: number;
  /** How it flies: across, toward the eye (down the picture), up; how it turns (quarter turns a second); when it fades. */
  vx: number;
  vd: number;
  vh: number;
  spin: number;
  fade: number;
}
interface Broken {
  shards: Shard[];
  /** Which shard each pixel of the figure went to (-1 none), on the figure's picture. */
  cell: Int16Array;
  w: number;
  h: number;
  ix: number;
  iy: number;
}
const broken = new WeakMap<Px, Broken>();

/**
 * THE FIGURE BROKEN INTO SHARDS: its picture cut along straight lines (the cells round points scattered over it), each
 * shard what was painted in its cell, its broken edges catching the light (lit on the upper left, dark on the lower
 * right). (`ix`, `iy`: where the blow fell; the shards nearest it fly fastest.)
 */
function breakUp(src: Px, ix: number, iy: number, seed: number): Broken {
  const had = broken.get(src);
  if (had) return had;
  const W = src.w;
  const H = src.h;
  const d = src.d;
  const box = src.bounds() ?? { x: 0, y: 0, w: 1, h: 1 };
  // the points: a grid, jittered, finer near the blow
  const pts: [number, number][] = [];
  const STEP = 9;
  for (let y = box.y - STEP; y < box.y + box.h + STEP; y += STEP) {
    for (let x = box.x - STEP; x < box.x + box.w + STEP; x += STEP) {
      const jx = x + (hash(x, y, seed) - 0.5) * STEP * 0.9;
      const jy = y + (hash(y, x, seed + 1) - 0.5) * STEP * 0.9;
      pts.push([jx, jy]);
      if (Math.hypot(jx - ix, jy - iy) < 18 && hash(x, y, seed + 2) > 0.25) pts.push([jx + STEP * 0.45, jy + STEP * 0.35]);
    }
  }
  const cell = new Int16Array(W * H).fill(-1);
  for (let y = box.y; y < box.y + box.h; y++) {
    for (let x = box.x; x < box.x + box.w; x++) {
      const i = (y * W + x) * 4;
      // (its edge of light does not break off with it: a dying enemy's edge goes out)
      if (d[i + 3] !== 255) continue;
      let best = 0;
      let bd = Infinity;
      for (let n = 0; n < pts.length; n++) {
        const dd = (pts[n][0] - x) ** 2 + (pts[n][1] - y) ** 2;
        if (dd < bd) {
          bd = dd;
          best = n;
        }
      }
      cell[y * W + x] = best;
    }
  }
  // each cell's pixels, as a shard
  const boxes = new Map<number, [number, number, number, number, number, number, number]>();
  for (let y = box.y; y < box.y + box.h; y++) {
    for (let x = box.x; x < box.x + box.w; x++) {
      const c = cell[y * W + x];
      if (c < 0) continue;
      const b = boxes.get(c) ?? [x, y, x, y, 0, 0, 0];
      b[0] = Math.min(b[0], x);
      b[1] = Math.min(b[1], y);
      b[2] = Math.max(b[2], x);
      b[3] = Math.max(b[3], y);
      b[4] += x;
      b[5] += y;
      b[6]++;
      boxes.set(c, b);
    }
  }
  const shards: Shard[] = [];
  const index = new Map<number, number>();
  for (const [c, b] of boxes) {
    const w = b[2] - b[0] + 1;
    const h = b[3] - b[1] + 1;
    const p = new Px(w, h);
    for (let y = b[1]; y <= b[3]; y++) {
      for (let x = b[0]; x <= b[2]; x++) {
        if (cell[y * W + x] !== c) continue;
        const i = (y * W + x) * 4;
        let r = d[i];
        let g = d[i + 1];
        let bb = d[i + 2];
        // (its broken edges: lit where they face the upper left, in shade where they face the lower right)
        const g0 = TONE_OF.get(packed(r, g, bb));
        if (g0) {
          const up = cell[(y - 1) * W + x] !== c || cell[y * W + x - 1] !== c;
          const down = cell[(y + 1) * W + x] !== c || cell[y * W + x + 1] !== c;
          const tone = up ? Math.min(8, g0.tone + 3) : down ? Math.max(1, g0.tone - 2) : g0.tone;
          [r, g, bb] = rgba(GLASSES[g0.glass][tone]);
        }
        put(p, x - b[0], y - b[1], r, g, bb);
      }
    }
    const cx = b[4] / b[6];
    const cy = b[5] / b[6];
    const k = shards.length;
    const dx = cx - ix;
    const dy = cy - iy;
    const dist = Math.hypot(dx, dy) || 1;
    const sp = (60 + 130 * hash(k, seed, 11)) * (1.25 - Math.min(0.6, dist / 80));
    shards.push({
      px: p,
      x0: b[0],
      y0: b[1],
      cx,
      cy,
      vx: (dx / dist) * sp + (hash(k, seed, 12) - 0.5) * 40,
      vd: (hash(k, seed, 13) - 0.42) * 90,
      vh: (-dy / dist) * sp * 0.6 + 70 + 90 * hash(k, seed, 14),
      spin: (3 + 9 * hash(k, seed, 15)) * (hash(k, seed, 16) > 0.5 ? 1 : -1),
      fade: SHATTER.fades + (0.97 - 0.2 - SHATTER.fades) * hash(k, seed, 17),
    });
    index.set(c, k);
  }
  for (let i = 0; i < cell.length; i++) if (cell[i] >= 0) cell[i] = index.get(cell[i]) as number;
  const out: Broken = { shards, cell, w: W, h: H, ix, iy };
  broken.set(src, out);
  return out;
}

/** Where a shard is `t` seconds after it broke off: across, toward the eye, its middle's height; its quarter turns; whether it is lying. */
function flight(s: Shard, t: number): { x: number; d: number; h: number; turns: number; lying: boolean } {
  const G = SHATTER.gravity;
  const DT = 1 / 120;
  let x = s.cx - CANVAS3.ax;
  let dd = 0;
  let h = CANVAS3.ay - s.cy;
  let vx = s.vx;
  let vd = s.vd;
  let vh = s.vh;
  let spun = 0;
  let lying = false;
  let bounced = 0;
  const half = Math.max(s.px.w, s.px.h) / 2;
  for (let k = 0; k * DT < t; k++) {
    if (!lying) {
      vh -= G * DT;
      x += vx * DT;
      dd += vd * DT;
      h += vh * DT;
      spun += s.spin * DT;
      if (h <= half * 0.6) {
        h = half * 0.6;
        bounced++;
        if (bounced >= 2 || Math.abs(vh) < 90) {
          lying = true;
          vh = 0;
        } else vh = -vh * 0.32;
        vx *= 0.5;
        vd *= 0.5;
      }
    } else {
      // (skidding to a stop on the polished floor)
      x += vx * DT;
      dd += vd * DT;
      vx *= 1 - 7 * DT;
      vd *= 1 - 7 * DT;
    }
  }
  return { x, d: dd, h, turns: Math.trunc(spun), lying };
}

/** A painting turned by quarter turns (+ clockwise). */
function quarter(src: Px, turns: number): Px {
  const n = ((turns % 4) + 4) % 4;
  if (n === 0) return src;
  const w = n === 2 ? src.w : src.h;
  const h = n === 2 ? src.h : src.w;
  const out = new Px(w, h);
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const i = (y * src.w + x) * 4;
      if (src.d[i + 3] === 0) continue;
      const tx = n === 1 ? src.h - 1 - y : n === 2 ? src.w - 1 - x : y;
      const ty = n === 1 ? x : n === 2 ? src.h - 1 - y : src.w - 1 - x;
      out.d.set(src.d.subarray(i, i + 4), (ty * w + tx) * 4);
    }
  }
  return out;
}

/** A pink of the enemy's going out as it dies: hot, then dull, then glass. */
function quench(r: number, g: number, b: number, since: number): [number, number, number] {
  if (!PINKS.has(packed(r, g, b))) return [r, g, b];
  if (since < 0.12) return [r, g, b];
  const c = since < 0.3 ? FLAME[0] : VIOLET[3];
  const [rr, gg, bb] = rgba(c);
  return [rr, gg, bb];
}

/**
 * A REFLECTION SHATTERING, `k` of the way through (0..1; SHATTER), from `from`, its own picture on the heroes' canvas as
 * it was when the blow fell (art/reflections.ts reflectionPainted); (`ix`, `iy`) where the blow fell on that picture
 * (the middle of its breast if not given). On the shattering's own picture (SHATTER_CANVAS), its feet where they were.
 * At the end there is nothing left.
 */
export function shatterPainted(from: Painted, k: number, impact?: readonly [number, number], seed = 7): Painted {
  const SC = SHATTER_CANVAS;
  const out = new Px(SC.w, SC.h);
  const ox = SC.ax - CANVAS3.ax;
  const oy = SC.ay - CANVAS3.ay;
  const box = from.px.bounds() ?? { x: CANVAS3.ax, y: CANVAS3.ay - 40, w: 1, h: 1 };
  const [ix, iy] = impact ?? [box.x + box.w * 0.5, box.y + box.h * 0.42];
  const br = breakUp(from.px, ix, iy, seed);
  const lights: Light[] = [];
  const T = k * SHATTER.time;
  const tBreak = SHATTER.breaks * SHATTER.time;
  if (T < tBreak) {
    // THE CRACKS RACE OVER IT: the shards' edges, out from the blow, white; it flashes a tone lighter
    const reach = 6 + (T / tBreak) * 70;
    const d = from.px.d;
    for (let y = 0; y < br.h; y++) {
      for (let x = 0; x < br.w; x++) {
        const i = (y * br.w + x) * 4;
        if (d[i + 3] === 0) continue;
        const c = br.cell[y * br.w + x];
        let r = d[i];
        let g = d[i + 1];
        let b = d[i + 2];
        const g0 = TONE_OF.get(packed(r, g, b));
        if (g0) [r, g, b] = rgba(GLASSES[g0.glass][Math.min(8, g0.tone + 1)]);
        if (c >= 0 && Math.hypot(x - ix, y - iy) < reach) {
          const edgeHere = (x + 1 < br.w && br.cell[y * br.w + x + 1] !== c && br.cell[y * br.w + x + 1] >= 0) || (y + 1 < br.h && br.cell[(y + 1) * br.w + x] !== c && br.cell[(y + 1) * br.w + x] >= 0);
          if (edgeHere) [r, g, b] = rgba('#f5f7ff');
        }
        // (a dying enemy's edge goes out at once)
        if (d[i + 3] !== 255) continue;
        put(out, x + ox, y + oy, r, g, b);
      }
    }
    lights.push({ x: ix + ox, y: iy + oy, r: 14 + 20 * (T / tBreak), color: '#ffc0d6', a: 0.5 });
    return { px: out, lights };
  }
  const since = T - tBreak;
  // THE SHARDS, the far ones first
  const placed = br.shards.map((s, n) => ({ s, n, f: flight(s, since) })).sort((a, b) => a.f.d - b.f.d);
  for (const { s, n, f } of placed) {
    // (fading: a pixel at a time, by the dither, once its time has come)
    const fadeK = clamp01((k - s.fade) / 0.2);
    if (fadeK >= 1) continue;
    const img = quarter(s.px, f.turns);
    // (a flash as it turns: the frame it turns in, it catches the light)
    const flash = !f.lying && flight(s, Math.max(0, since - 1 / SHATTER.fps)).turns !== f.turns;
    const left = Math.round(SC.ax + f.x - img.w / 2);
    const top = Math.round(SC.ay + f.d * 0.5 - f.h - img.h / 2);
    for (let y = 0; y < img.h; y++) {
      for (let x = 0; x < img.w; x++) {
        const i = (y * img.w + x) * 4;
        if (img.d[i + 3] === 0) continue;
        if (bayer(x + n, y) < fadeK * 16) continue;
        let [r, g, b] = quench(img.d[i], img.d[i + 1], img.d[i + 2], since);
        if (flash) {
          const g0 = TONE_OF.get(packed(r, g, b));
          if (g0) [r, g, b] = rgba(GLASSES[g0.glass][Math.min(8, g0.tone + 2)]);
          else if (packed(r, g, b) === INKP) [r, g, b] = rgba(SILVER[3]);
        }
        put(out, left + x, top + y, r, g, b);
      }
    }
  }
  // GLITTER: a spray of specks, white and pink, faster than the shards, gone before they are
  for (let n = 0; n < 40; n++) {
    const life = 0.35 + 0.35 * hash(n, seed, 21);
    if (since > life) continue;
    const a = hash(n, seed, 22) * Math.PI * 2;
    const sp = 120 + 160 * hash(n, seed, 23);
    const x = ix + ox + Math.cos(a) * sp * since;
    const y = iy + oy + Math.sin(a) * sp * 0.7 * since - 60 * since + 0.5 * SHATTER.gravity * since * since;
    if (y > SC.ay + 20) continue;
    const twinkle = Math.floor(since * 30 + n) % 3;
    putC(out, x, y, twinkle === 0 ? '#ffffff' : n % 3 === 0 ? '#ff8ab4' : '#c9cbd9');
  }
  // (the burst of light as it breaks)
  if (since < 0.18) lights.push({ x: ix + ox, y: iy + oy, r: 40, color: '#ffc0d6', a: 0.55 * (1 - since / 0.18) });
  return { px: out, lights };
}

// =============================================================================================
// STRUCK: CHIPS OF GLASS

/** STRUCK: chips of glass flung off it, `t` seconds after the blow (gone by 0.4 s), from (x, y) on a picture, the way the blow went (`way` +1 to the right). */
export function chipsPainted(p: Px, x: number, y: number, t: number, way: 1 | -1, seed = 3): void {
  const COL = ['#f5f7ff', '#cdd2e6', '#9ea4bf', '#ff8ab4'];
  for (let n = 0; n < 9; n++) {
    const life = 0.22 + 0.18 * hash(n, seed, 1);
    if (t > life) continue;
    const a = (hash(n, seed, 2) - 0.5) * 1.6;
    const sp = 90 + 110 * hash(n, seed, 3);
    const cx = x + way * Math.cos(a) * sp * t;
    const cy = y + Math.sin(a) * sp * t - 40 * t + 0.5 * 700 * t * t;
    const c = COL[n % COL.length];
    putC(p, cx, cy, c);
    if (n % 2 === 0) putC(p, cx + way, cy, c);
    if (n % 3 === 0) putC(p, cx, cy + 1, COL[(n + 1) % COL.length]);
  }
}

// =============================================================================================
// IN ITS PICTURES, AS THE GAME HOLDS THEM

/** Where the blow falls on a reflection's picture as it shatters: the middle of its breast, as it reels. */
export function shatterFrom(cls: ClassId, view: GameView): Painted {
  const plan = PLANS[cls].dungeon;
  return reflectionPainted(MOVES3[plan.reel ?? plan.idle], 0.1, view);
}

/**
 * WHAT art/reflections.ts `makeReflectionArt` TAKES TO ADD THESE TO A REFLECTION'S PICTURES (`makeReflectionArt(
 * reflectionEffects)`): its shattering as its death (`clips.die`: from its reel, the last frame empty), and, from in
 * front, its stepping out of a mirror (`clips.moves.stepOut`, its feet where it ends; the game shows it, standing
 * there, before it moves).
 */
export function reflectionEffects(set: AnimSet, view: GameView, cls: ClassId): void {
  const clips = (set.clips ?? (set.clips = {})) as NonNullable<AnimSet['clips']>;
  const n = Math.round(SHATTER.time * SHATTER.fps) + 1;
  let from: Painted | null = null;
  const source = (): Painted => (from ??= shatterFrom(cls, view));
  clips.die = { frames: lazyFrames(n, (i) => toSprite(shatterPainted(source(), i / (n - 1)), null, SHATTER_CANVAS.ax, SHATTER_CANVAS.ay)), fps: SHATTER.fps };
  if (view === 'front') {
    const m = Math.round(STEP_OUT.time * STEP_OUT.fps) + 1;
    const step: Clip = { frames: lazyFrames(m, (i) => toSprite(stepOutPainted(cls, i / STEP_OUT.fps), i / STEP_OUT.fps >= STEP_OUT.until ? POOL_STEP : null, STEP_CANVAS.ax, STEP_CANVAS.ay)), fps: STEP_OUT.fps };
    clips.moves = { ...(clips.moves ?? {}), stepOut: step };
  }
}
/** Its pool of light once it is out, on the step's picture. */
const POOL_STEP: Light = { ...REFLECTION_POOL, x: REFLECTION_POOL.x + STEP_CANVAS.ax - CANVAS3.ax, y: REFLECTION_POOL.y + STEP_CANVAS.ay - CANVAS3.ay };
