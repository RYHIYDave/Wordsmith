// Pictures of FLOOR 19'S BOSS, THE KING, put together for the owner (the sheet, the stills, the film's frames): a stand-in
// for his Throne Hall's floor (cold stone flags in an arena about 17 by 20 tiles, the dark beyond it, the hangings at
// its far side), and whatever is laid on it, each figure at its floor point. Plain pixels (Px), so that the same picture
// is made in a browser (src/dev/preview_king.ts) and outside one (tools/king_pictures.ts). Nothing of the game
// imports it. THE FLOOR IS A STAND-IN: floor 19's own ground and pieces are another piece of work.

import { Px, rgba } from '../engine/px';
import { RIM_ALPHA, hash } from '../art/kit';
import type { Painted } from '../art/kit';
import { TILE3 } from '../art/new_mobs3';
import { GRID } from '../art/skeleton';
import type { V3 } from '../art/skeleton';

/** The arena: an ellipse this many tiles across along the floor's two ways (the King's x, his y). */
export const ARENA = { rx: 8.5, ry: 10 } as const;

/** A picture to lay down: its pixels and the picture pixel that sits on its floor point. */
export interface Laid {
  px: Px;
  ax: number;
  ay: number;
}
export const laidOf = (p: Painted | Px, ax: number, ay: number): Laid => ({ px: 'px' in p ? p.px : p, ax, ay });

/** Where a point of the floor (own lengths; the arena's middle at 0) is on a scene whose arena middle is at (cx, cy), as the game shows it from in front. */
export function onScene(p: V3, cx: number, cy: number): [number, number] {
  return [cx + GRID * (p[0] + p[1]), cy + GRID * 0.5 * (p[0] - p[1]) - p[2]];
}
/** The floor point under a scene pixel (own lengths). */
export function floorAt(X: number, Y: number, cx: number, cy: number): [number, number] {
  const a = (X - cx) / GRID;
  const b = (2 * (Y - cy)) / GRID;
  return [(a + b) / 2, (a - b) / 2];
}
/** How far out in the arena a floor point is (1 on its edge). */
export function arenaOut(x: number, y: number): number {
  return Math.hypot(x / (ARENA.rx * TILE3), y / (ARENA.ry * TILE3));
}

const STONE = ['#1a1c2a', '#22263a', '#2a2f46', '#33384f', '#3c425a', '#464c66'];
const SEAM = '#10111c';
const DARK = '#07060c';
/**
 * THE THRONE HALL'S FLOOR (a stand-in): great flags of cold blue-grey stone, two tiles to a flag laid in courses, their
 * seams dark, worn and cracked here and there, lit from the upper left; darker toward the arena's edge, black beyond it;
 * and along its far side, the hangings (royal blue, edged in old gold), where the faces of his deeds look out.
 */
export function hallFloor(w: number, h: number, cx: number, cy: number, hangings = true): Px {
  const px = new Px(w, h);
  const T = TILE3;
  const seamC = rgba(SEAM);
  for (let Y = 0; Y < h; Y++) {
    for (let X = 0; X < w; X++) {
      const [x, y] = floorAt(X + 0.5, Y + 0.5, cx, cy);
      const out = arenaOut(x, y);
      if (out > 1.18) {
        px.set(X, Y, DARK);
        continue;
      }
      // (flags two tiles long and one wide, each course along x set over by half a flag)
      const row = Math.floor(y / T);
      const shift = (row % 2) * T;
      const col = Math.floor((x + shift) / (2 * T));
      const fx = (x + shift) / (2 * T) - col;
      const fy = y / T - row;
      const seam = fx < 0.025 || fx > 0.975 || fy < 0.045 || fy > 0.955;
      const own = hash(col, row, 7801);
      let tone = 2 + Math.floor(own * 2.4);
      // (lit from the upper left: the far, left of the hall a step lighter)
      if ((col * 2 - (row % 2)) * T + (row + 0.5) * T < -6 * T) tone++;
      // (worn: pale patches; cracks across some flags)
      if (hash(Math.floor(fx * 9), Math.floor(fy * 5) + col * 31, 7802 + row) < 0.05) tone = Math.max(0, tone - 1);
      const crack = own > 0.9 && fx > 0.2 + 0.3 * own && fx < 0.75 && Math.abs(fy - 0.3 - 0.4 * fx - 0.08 * Math.sin(fx * 31 + own * 20)) < 0.025;
      tone = Math.max(0, Math.min(5, tone - Math.floor(Math.max(0, out - 0.72) * 9)));
      if (out > 1.0) tone = Math.max(0, tone - 2);
      if (seam || crack) {
        const k = out > 1.0 ? 0.4 : 1;
        px.d.set([Math.round(seamC[0] * k), Math.round(seamC[1] * k), Math.round(seamC[2] * k), 255], (Y * w + X) * 4);
      } else px.set(X, Y, STONE[tone]);
    }
  }
  if (hangings) {
    for (const [hx, hy] of hangingsAt(cx, cy)) hanging(px, hx, hy);
  }
  return px;
}
/** Where the hangings hang along the far side of the hall: floor points on its edge (own lengths), and where on a scene. */
export function hangingsAt(cx: number, cy: number): [number, number, number, number][] {
  const out: [number, number, number, number][] = [];
  for (let i = 0; i < 9; i++) {
    const a = (-0.5 + (i / 8) * 1.0) * Math.PI;
    const fx0 = Math.cos(a + Math.PI * 0.75) * ARENA.rx * TILE3 * 1.06;
    const fy0 = Math.sin(a + Math.PI * 0.75) * ARENA.ry * TILE3 * 1.06;
    const [bx, by] = onScene([fx0, fy0, 0], cx, cy);
    if (by > cy - 10) continue;
    out.push([bx, by, fx0, fy0]);
  }
  return out;
}
/** A hanging: a tall royal blue cloth hung in folds, edged in old gold, tattered at its foot, its foot at (bx, by). */
function hanging(px: Px, bx: number, by: number): void {
  const w = px.w;
  const h = px.h;
  const i = Math.round(bx * 7 + by);
  {
    // THE HANGINGS along the far side of the hall, each a tall royal blue cloth hung in folds, edged in old gold, tattered at its foot
    const BLUE = ['#0e1234', '#161c4c', '#1e2862', '#283478'];
    const GOLDH = ['#4a3a18', '#76602c'];
    {
      const hw = 15;
      const tall = 96;
      for (let yy = -tall; yy <= -18; yy++) {
        const k = (yy + tall) / (tall - 18);
        for (let xx = -hw; xx <= hw; xx++) {
          const X = Math.round(bx + xx);
          const Y = Math.round(by + yy);
          if (X < 0 || Y < 0 || X >= w || Y >= h) continue;
          // (its foot tattered)
          if (k > 0.9 && hash(xx + 40, i, 7803) < (k - 0.9) * 8) continue;
          const fold = Math.cos(((xx + hw) / (2 * hw)) * Math.PI * 4);
          let c = BLUE[Math.max(0, Math.min(3, Math.round(1.5 + fold * 1.4)))];
          if (Math.abs(xx) >= hw - 1 || yy < -tall + 3) c = GOLDH[xx < 0 ? 1 : 0];
          if (Math.abs(xx) < 4 && yy > -tall + 18 && yy < -tall + 34 && (Math.abs(xx) + Math.abs(yy + tall - 26)) < 7) c = GOLDH[1];
          px.set(X, Y, c);
        }
      }
    }
  }
}

/** Lay a picture on another, `k` times as big (whole pixels), its floor point at (x, y) of the scene; its edge of light laid as the game lays it (a thin wash), not as a solid; `clip`: only where this says. */
export function lay(dst: Px, src: Laid, x: number, y: number, k = 1, clip?: (X: number, Y: number) => boolean, flip = false): void {
  const { px, ax, ay } = src;
  const x0 = Math.round(flip ? x - (px.w - ax) * k : x - ax * k);
  const y0 = Math.round(y - ay * k);
  const d = dst.d;
  const s = px.d;
  for (let j = 0; j < px.h; j++) {
    for (let i = 0; i < px.w; i++) {
      const si = (j * px.w + (flip ? px.w - 1 - i : i)) * 4;
      const a = s[si + 3];
      if (!a) continue;
      for (let dy = 0; dy < k; dy++) {
        const Y = y0 + j * k + dy;
        if (Y < 0 || Y >= dst.h) continue;
        for (let dx = 0; dx < k; dx++) {
          const X = x0 + i * k + dx;
          if (X < 0 || X >= dst.w) continue;
          if (clip && !clip(X, Y)) continue;
          const di = (Y * dst.w + X) * 4;
          if (a >= 255) {
            d[di] = s[si];
            d[di + 1] = s[si + 1];
            d[di + 2] = s[si + 2];
            d[di + 3] = 255;
          } else {
            const f = a / 255;
            d[di] = Math.round(d[di] * (1 - f) + s[si] * f);
            d[di + 1] = Math.round(d[di + 1] * (1 - f) + s[si + 1] * f);
            d[di + 2] = Math.round(d[di + 2] * (1 - f) + s[si + 2] * f);
            d[di + 3] = Math.max(d[di + 3], a);
          }
        }
      }
    }
  }
}
/** A soft dark oval under a figure (the rulebook's shadow), `r` across. */
export function shadow(dst: Px, x: number, y: number, r: number, k = 1): void {
  for (let j = -r * k; j <= r * k; j++) {
    for (let i = -2 * r * k; i <= 2 * r * k; i++) {
      const q = (i / (2 * r * k)) ** 2 + (j / (r * k)) ** 2;
      if (q > 1) continue;
      const X = Math.round(x + i);
      const Y = Math.round(y + j * 0.5);
      if (X < 0 || Y < 0 || X >= dst.w || Y >= dst.h) continue;
      const di = (Y * dst.w + X) * 4;
      const f = 0.55 * (1 - q);
      dst.d[di] = Math.round(dst.d[di] * (1 - f));
      dst.d[di + 1] = Math.round(dst.d[di + 1] * (1 - f));
      dst.d[di + 2] = Math.round(dst.d[di + 2] * (1 - f));
    }
  }
}
/** A picture made `k` times as big (whole pixels). */
export function scaled(src: Px, k: number): Px {
  const out = new Px(src.w * k, src.h * k);
  for (let y = 0; y < out.h; y++) {
    for (let x = 0; x < out.w; x++) {
      const si = (Math.floor(y / k) * src.w + Math.floor(x / k)) * 4;
      out.d.set(src.d.subarray(si, si + 4), (y * out.w + x) * 4);
    }
  }
  return out;
}
/** A piece of a picture. */
export function cut(src: Px, x: number, y: number, w: number, h: number): Px {
  const out = new Px(w, h);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const X = x + i;
      const Y = y + j;
      if (X < 0 || Y < 0 || X >= src.w || Y >= src.h) continue;
      const si = (Y * src.w + X) * 4;
      out.d.set(src.d.subarray(si, si + 4), (j * w + i) * 4);
    }
  }
  return out;
}
void RIM_ALPHA;

// =============================================================================================
// THE PICTURES (the same in a browser and outside one)

import { makeHeroArt3 } from '../art/heroes3';
import type { Sprite } from '../engine/px';
import { canvasOf, deathOfMob, paintMob } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { HUSH, HUSH_BESIDE, KING, KING_ALONE } from '../art/king_moves';
import { BIRD_CANVAS, FX_CANVAS, birdPainted } from '../art/king_fx';
import type { BirdState } from '../art/king_fx';
import type { GameView } from '../art/skin';

/** A sprite's picture, as plain pixels (in a browser its canvas read back; outside one, the picture itself). */
export function spriteLaid(s: Sprite): Laid {
  const d = s.density ?? 1;
  const img = s.img as unknown as { d?: Uint8ClampedArray; w?: number; h?: number; getContext?: (k: string) => CanvasRenderingContext2D };
  let px: Px;
  if (img.d && img.w !== undefined && img.h !== undefined) px = img as unknown as Px;
  else {
    const cv = s.img;
    const g = cv.getContext('2d') as CanvasRenderingContext2D;
    const data = g.getImageData(0, 0, cv.width, cv.height);
    px = new Px(cv.width, cv.height);
    px.d.set(data.data);
  }
  return { px, ax: s.ax * d, ay: s.ay * d };
}
let KNIGHT: ReturnType<ReturnType<typeof makeHeroArt3>['of']> | null = null;
/** The knight standing (the heroes' own: for size), from in front or behind. */
export function knight(view: GameView, i = 0): Laid {
  KNIGHT ??= makeHeroArt3().of('warrior', { twoHanded: false });
  return spriteLaid((view === 'front' ? KNIGHT.front : KNIGHT.back).idle[i % 4]);
}
/** A frame of a figure's move, as a picture with its floor point. */
export function frameOf(mob: Mob, move: string, t: number, view: GameView): Laid {
  const can = canvasOf(mob);
  const p = move === 'dying' ? deathOfMob(mob, t / mob.dieTime, view) : paintMob(mob, move, t, view);
  return laidOf(p, can.ax, can.ay);
}
/** A floor of `w` by `h` scene pixels, `k` times as big, its arena's middle at (cx, cy) of the scene. */
function floorK(w: number, h: number, k: number, cx: number, cy: number, hangings: boolean): Px {
  const f = hallFloor(Math.ceil(w / k), Math.ceil(h / k), Math.round(cx / k), Math.round(cy / k), hangings);
  return k === 1 ? f : cut(scaled(f, k), 0, 0, w, h);
}

/** THE SHEET: the King standing, from in front and from behind, beside the knight for size, three times as big (1200 wide). */
export function sheetPicture(t = 0): Px {
  const K = 3;
  const W = 1200;
  const H = 600;
  const px = floorK(W, H, K, 600, 330, false);
  const y = 540;
  const put = (l: Laid, x: number, sh: number): void => {
    shadow(px, x, y, sh, K);
    lay(px, l, x, y, K);
  };
  put(knight('front'), 120, 9);
  put(frameOf(KING, 'stand', t, 'front'), 440, 22);
  put(frameOf(KING, 'stand', t, 'back'), 800, 22);
  put(knight('back'), 1100, 9);
  return px;
}
/** AT THE GAME'S SIZE: in his hall (a stand-in floor), the knight before him, both as the game shows them (1200 by 620). */
export function gameSizePicture(t = 0): Px {
  const W = 1200;
  const H = 620;
  const cx = 600;
  const cy = 330;
  const px = floorK(W, H, 1, cx, cy, true);
  const at = (x: number, y: number): [number, number] => onScene([x * TILE3, y * TILE3, 0], cx, cy);
  const [kx, ky] = at(-2.5, -1.5);
  shadow(px, kx, ky, 22);
  lay(px, frameOf(KING, 'stand', t, 'front'), kx, ky);
  const [nx, ny] = at(3.5, 2.5);
  shadow(px, nx, ny, 9);
  lay(px, knight('back'), nx, ny, 1, undefined, true);
  // (and, at the right, the King from behind with the Hush at his side: his last phase)
  const [bx, by] = at(4.5, -4.5);
  shadow(px, bx, by, 22);
  lay(px, frameOf(KING_ALONE, 'stand', t, 'back'), bx, by);
  // (the Hush at his left, as its own figure: from behind, his left is up and to the left of him on the picture)
  const hx = bx + 0.8165 * (HUSH_BESIDE[0] - HUSH_BESIDE[1]);
  const hy = by + 0.408 * (-HUSH_BESIDE[0] - HUSH_BESIDE[1]);
  shadow(px, hx, hy, 10);
  lay(px, frameOf(HUSH, 'stand', t, 'back'), hx, hy);
  // (and so the King, nearer, over it)
  lay(px, frameOf(KING_ALONE, 'stand', t, 'back'), bx, by);
  return px;
}
/** HIS LAST PHASE: the Hush climbed off him, standing at his left, from in front and behind, the knight for size, three times as big. */
export function hushPicture(t = 0): Px {
  const K = 3;
  const W = 1200;
  const H = 640;
  const px = floorK(W, H, K, 600, 340, false);
  const y = 560;
  const pair = (x: number, view: GameView): void => {
    // (the Hush stands at his left and a little behind him: where that is on the picture from in front, and from behind)
    const [dx, dy] = HUSH_BESIDE;
    const hx = x + (view === 'front' ? 0.8165 * (dx + dy) : 0.8165 * (dx - dy)) * K;
    const hy = y + (view === 'front' ? 0.408 * (dx - dy) : 0.408 * (-dx - dy)) * K;
    const hush = frameOf(HUSH, 'stand', t, view);
    const king = frameOf(KING_ALONE, 'stand', t, view);
    const draw = (who: 'king' | 'hush'): void => {
      if (who === 'king') {
        shadow(px, x, y, 22, K);
        lay(px, king, x, y, K);
      } else {
        shadow(px, hx, hy, 10, K);
        lay(px, hush, hx, hy, K);
      }
    };
    // (the further one first)
    if (hy < y) {
      draw('hush');
      draw('king');
    } else {
      draw('king');
      draw('hush');
    }
  };
  shadow(px, 90, y, 9, K);
  lay(px, knight('front'), 90, y, K);
  pair(330, 'front');
  pair(900, 'back');
  return px;
}
/** THE CLOCKWORK SONGBIRD: broken; winding itself up; singing; from in front and behind, six times as big. */
export function birdPicture(): Px {
  const states: [BirdState, number][] = [['broken', 0], ['winding', 1.1], ['singing', 0.45]];
  const K = 4;
  const cw = BIRD_CANVAS.w * K;
  const W = cw * states.length;
  const H = BIRD_CANVAS.h * K * 2;
  const px = floorK(W, H, K, W / 2, H / 2, false);
  for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
    states.forEach(([s, t], i) => {
      lay(px, laidOf(birdPainted(s, t, view), BIRD_CANVAS.ax, BIRD_CANVAS.ay), cw * i + cw / 2, BIRD_CANVAS.h * K * row + BIRD_CANVAS.ay * K, K);
    });
  }
  return px;
}
void FX_CANVAS;

/** HIS BLOWS ACROSS THE HALL: the sweep's wave, the Decree's knights, the Crown's ring, the faces from the curtains, each at a moment, him where it begins, the knight before him (1000 wide). */
export function blowsPicture(): Px {
  const W = FX_CANVAS.w;
  const H = 470;
  const top = 70;
  const panels: [string, number, string][] = [['attack', 0.3, 'sweep'], ['decree', 3.2, 'decree'], ['crown', 0.4, 'crown'], ['curtains', 0.32, 'curtains']];
  const px = new Px(W, H * panels.length);
  panels.forEach(([move, since, fx], i) => {
    const cx = FX_CANVAS.ax;
    const cy = FX_CANVAS.ay - top;
    // (the hall's middle a little before him, so that the most of what his blow covers is in the picture)
    const floor = hallFloor(W, H, cx + 70, cy + 40, true);
    lay(px, laidOf(floor, 0, 0), 0, H * i);
    const clip = (X: number, Y: number): boolean => {
      const [x, y] = floorAt(X + 0.5, Y - H * i + 0.5, cx + 70, cy + 40);
      return arenaOut(x, y) <= 1.0;
    };
    const hit = move === 'attack' ? KING.hit : (KING.more?.[move]?.motion.hit ?? 0);
    const [nx, ny] = [cx + 230, cy + H * i + 115];
    // (the faces come out of the hall's hangings, aimed at the knight: both as his own, in tiles from him)
    const [kx0, ky0] = floorAt(cx, cy, cx + 70, cy + 40);
    const [tx, ty] = floorAt(nx, ny - H * i, cx + 70, cy + 40);
    const hangs = hangingsAt(cx + 70, cy + 40).map(([, , hx, hy]) => [(hx - kx0) / TILE3, (hy - ky0) / TILE3] as [number, number]);
    const from = [hangs[0], hangs[Math.floor(hangs.length / 2)], hangs[hangs.length - 1]];
    const f = fx === 'sweep' ? sweepPainted(since) : fx === 'crown' ? crownPainted(since) : fx === 'decree' ? decreePainted(since, 'front', { from: -6, to: 12, half: 11 }) : curtainsPainted(since, 'front', [(tx - kx0) / TILE3, (ty - ky0) / TILE3], from);
    if (fx !== 'decree' && fx !== 'curtains') lay(px, laidOf(f.px, FX_CANVAS.ax, FX_CANVAS.ay), cx, cy + H * i, 1, clip);
    shadow(px, cx, cy + H * i, 24);
    lay(px, frameOf(KING, move, Math.min(hit + since, move === 'decree' ? KING.more?.decree?.motion.keys.at(-1)?.at ?? 0 : 9), 'front'), cx, cy + H * i);
    shadow(px, nx, ny, 9);
    lay(px, knight('back'), nx, ny, 1, undefined, true);
    if (fx === 'decree' || fx === 'curtains') lay(px, laidOf(f.px, FX_CANVAS.ax, FX_CANVAS.ay), cx, cy + H * i, 1, fx === 'decree' ? clip : undefined);
  });
  return px;
}
import { crownPainted, curtainsPainted, decreePainted, sweepPainted } from '../art/king_fx';
