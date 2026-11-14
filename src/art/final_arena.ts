// THE BOTTOM OF THE SHAFT: THE WARPED WORDSMITH'S ARENA (endless mode's final boss; the queue's build-endless-tablet-and-final-boss,
// stage 2). The place the landing at the Shaft's Rim opens down into once the four shards are set in the bench: his words, 7 Nov
// 2026, a portal “to a final boss”; the art chat's README (docs/mockups/endless_tablet/README.md) has him “past the portal at the
// bottom of the shaft”, and its films fight him on a plain stone floor walled at the back.
//
// READ AS (the Queue chat's, behind ENDLESS_KEY, off; FOR HIS YES IN THE PICTURES FROM THE GAME): the shaft's foot, round as the
// shaft is: a floor of the shaft's own stone, worn flags in rings about its middle, a great round seal of dressed slabs in the
// middle cut in four as the tablet is, its seams burning faintly with his pink (his place); rough rock at its edge; the shaft's
// wall rising all round the back into the dark. He comes down in the portal's light (the friend's cyan, from above) at its near
// side; the boss waits at its far side. Painted as the Rim's ground is (art/shaft_rim.ts), with its own stone and its light.

import { cliffAt, lit, NIGHT, ROCK, rockAt } from './shaft_rim';
import { QUARRY, bay, hx, mixc, rnd } from './endless_splash';
import type { C } from './endless_splash';

/** The place, in tiles: its size, its middle, the floor's reach (walkable), the rubble's, the wall's foot; his seal in the middle. */
export const FINAL_PLACE = { w: 24, h: 24, cx: 12, cy: 12, floor: 8.0, rubble: 8.7, wall: 9.2, seal: 2.3 } as const;
/** Where he comes down (in the portal's light) and the way he faces; where the boss waits, facing him. */
export const FINAL_ARRIVE = { x: FINAL_PLACE.cx + 3.0, y: FINAL_PLACE.cy + 3.0, fx: -Math.SQRT1_2, fy: -Math.SQRT1_2 } as const;
export const FINAL_BOSS_AT = { x: FINAL_PLACE.cx - 3.4, y: FINAL_PLACE.cy - 3.4, fx: Math.SQRT1_2, fy: Math.SQRT1_2 } as const;

/** The ground's picture, in game pixels from tile (0, 0): its corner and size (two picture pixels to a game pixel). */
export const FINAL_GROUND = { gx: -360, gy: (FINAL_PLACE.cx + FINAL_PLACE.cy) * 8 - 112 - 170, w: 720, h: 112 * 2 + 170 + 20 };
const MID_Y = (FINAL_PLACE.cx + FINAL_PLACE.cy) * 8;
const TAU = Math.PI * 2;
/** Its stone: the quarry's, the deepest storey the splash shows, darker still down here. */
const FLAGS = QUARRY.flag;
const STONE = QUARRY.stone;
/** His pink in the seal's seams (the enemy's, never cyan). */
const PINK = hx('#e0287a');
const PINK_HOT = hx('#ff6aa0');

/** THE FLOOR's worn flags in rings about the middle, past the seal: each its own length, some cracked, some sunk. */
function flagAt(x: number, y: number, px: number, py: number): C {
  const P = FINAL_PLACE;
  const dx = x - P.cx;
  const dy = y - P.cy;
  const r = Math.hypot(dx, dy);
  const a = Math.atan2(dy, dx);
  const rr = r - P.seal + (rnd(Math.floor(a * 9 + 50), 3, 511) - 0.5) * 0.08;
  const ring = Math.floor(rr / 0.9);
  const fr = rr / 0.9 - ring;
  const n = 16 + ring * 5;
  const pos = (a / TAU + 1) * n + rnd(ring, 1, 512) * n;
  const col = Math.floor(pos);
  const fa = pos - col;
  const h = rnd(col, ring, 514);
  if (fr < 0.06 || fa < Math.min(0.12, 0.6 / Math.max(1, ((TAU * r) / n) * 8))) return lit(mixc(FLAGS[0], NIGHT, 0.5), 0.85, px, py);
  let tone = h < 0.28 ? 0 : h > 0.8 ? 2 : 1;
  if (fr > 0.9) tone = Math.min(2, tone + 1);
  let c: C = FLAGS[tone];
  if (h > 0.93) c = mixc(c, NIGHT, fr < 0.25 ? 0.5 : 0.25);
  if (rnd(col, ring, 515) > 0.8) {
    const cr = Math.abs(fr - 0.5 - Math.sin(fa * 9 + h * 20) * 0.18);
    if (cr < 0.05) c = mixc(FLAGS[0], NIGHT, 0.55);
  }
  const sp = rnd(px, py, 516);
  if (sp > 0.986) c = mixc(c, hx('#9a8ea4'), 0.45);
  else if (sp < 0.014) c = mixc(c, NIGHT, 0.4);
  if ((rnd(Math.floor(x * 1.3), Math.floor(y * 1.3), 517) > 0.84 ? 1 : 0) * (bay(px >> 1, py >> 1) < 0.5 ? 1 : 0)) c = mixc(c, NIGHT, 0.25);
  // (darker toward the wall: the light comes down the shaft onto the middle)
  return lit(c, 0.95 - 0.6 * Math.max(0, (r - P.seal) / (P.floor - P.seal)) ** 1.3, px, py);
}

/** HIS SEAL in the middle: two rings of great dressed slabs about a round stone, cut in four as the tablet is (along the grid's two
 * axes), its seams burning faintly with his pink. */
function sealAt(x: number, y: number, px: number, py: number): C {
  const P = FINAL_PLACE;
  const dx = x - P.cx;
  const dy = y - P.cy;
  const r = Math.hypot(dx, dy);
  const a = Math.atan2(dy, dx);
  // (its rim: a ring of kerb)
  if (r > P.seal - 0.2) return lit(r > P.seal - 0.06 ? mixc(STONE[0], NIGHT, 0.4) : STONE[2], 0.95, px, py);
  // (the four seams of the quarters, along the axes, and the rings' seams: his pink burning in them, faint, hotter in the middle)
  const axis = Math.min(Math.abs(dx), Math.abs(dy));
  const ringSeam = Math.abs(r - 0.85) < 0.04 || Math.abs(r - 1.55) < 0.04;
  if (axis < 0.05 || ringSeam) {
    const hot = r < 0.85 ? 0.75 : 0.5;
    return mixc(mixc(STONE[0], NIGHT, 0.3), r < 0.5 ? PINK_HOT : PINK, hot * (0.55 + 0.45 * (bay(px, py) < 0.5 ? 1 : 0.6)));
  }
  // (the slabs: the inner stone whole, the two rings in segments)
  const ring = r < 0.85 ? 0 : r < 1.55 ? 1 : 2;
  const n = ring === 0 ? 4 : ring === 1 ? 8 : 12;
  const seg = Math.floor((a / TAU + 1) * n);
  const fa = (a / TAU + 1) * n - seg;
  if (ring > 0 && fa < 0.035) return lit(mixc(FLAGS[0], NIGHT, 0.45), 0.95, px, py);
  const h = rnd(seg, ring, 521);
  let c: C = STONE[ring === 0 ? 2 : h > 0.6 ? 2 : 1];
  if (rnd(px, py, 522) < 0.012) c = mixc(c, NIGHT, 0.35);
  return lit(c, 0.98, px, py);
}

/** The colour of the ground at picture pixel (px, py) of its picture. */
export function finalGroundAt(px: number, py: number): C {
  const P = FINAL_PLACE;
  const gx = FINAL_GROUND.gx + (px + 0.5) / 2;
  const gy = FINAL_GROUND.gy + (py + 0.5) / 2;
  const U = gx / 16;
  const S0 = (gy - MID_Y) / 8;
  const x = P.cx + (S0 + U) / 2;
  const y = P.cy + (S0 - U) / 2;
  const r = Math.hypot(x - P.cx, y - P.cy);
  // THE SHAFT'S WALL round the back, rising into the dark
  const sb = -Math.sqrt(Math.max(0, 2 * P.wall * P.wall - U * U));
  if (Math.abs(U) < P.wall * Math.SQRT2 && S0 < sb) {
    const z = 8 * (sb - S0);
    return z < 170 ? cliffAt(Math.atan2((sb - U) / 2, (sb + U) / 2) * P.wall, z, px, py) : NIGHT;
  }
  if (r > P.wall) return lit(ROCK[1], 0.3, px, py);
  if (r > P.rubble) return lit(rockAt(x, y, px, py), 0.7, px, py);
  if (r > P.floor) return rockAt(x, y, px, py);
  if (r < P.seal) return sealAt(x, y, px, py);
  return flagAt(x, y, px, py);
}

/** Paint the ground once (some 0.3 s). */
export function paintFinalGround(): { canvas: HTMLCanvasElement; gx: number; gy: number; ms: number } {
  const t0 = performance.now();
  const W = FINAL_GROUND.w * 2;
  const H = FINAL_GROUND.h * 2;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d') as CanvasRenderingContext2D;
  const im = g.createImageData(W, H);
  for (let py = 0; py < H; py++)
    for (let px = 0; px < W; px++) {
      const c = finalGroundAt(px, py);
      const o = (py * W + px) * 4;
      im.data[o] = (c >> 16) & 255;
      im.data[o + 1] = (c >> 8) & 255;
      im.data[o + 2] = c & 255;
      im.data[o + 3] = 255;
    }
  g.putImageData(im, 0, 0);
  return { canvas, gx: FINAL_GROUND.gx, gy: FINAL_GROUND.gy, ms: performance.now() - t0 };
}
