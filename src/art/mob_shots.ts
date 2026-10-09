// WHAT THE NEW MONSTERS THROW, ON THE FLOOR (the art chat, 9 Oct 2026). A MOCK-UP: NOT IN THE GAME.
//
// His picks of 9 Oct: the Golem "Hurl skulls (Recommended)" (by 09:30): it pulls a skull off its
// shoulders and throws it, and it bursts into flying bone; where it will land is shown by the
// skull's own shadow on the floor, growing and darkening as it comes down (not a circle of warning:
// "It’s not the big red circles I have a problem with, it’s that every attack is a big slam on the
// ground."). And the Boneward "Spear throw" (by 09:33): it hurls its spear, and the spear lies where
// it fell until the Boneward picks it up.
// Drawn in the game's own pixels, as the floor's effects are: given where a point of the floor is on
// the screen. The skull itself is a picture (art/new_mobs3.ts makeSkullShotArt); these are its
// shadow, its burst, and the spear, flying and lying. Nothing of the game draws them yet.

import { hash } from './kit';
import { FLAME, IRON } from './mkit';
import { P } from './palette';

/** Where a point of the floor (tiles) is on the screen, in the game's pixels. */
export type FloorAt = (x: number, y: number) => readonly [number, number];

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
/** The Golem's bones (art/new_mobs3.ts OSSUARY), for the bone the skull bursts into. */
const BONE_BITS: readonly string[] = ['#463e70', '#948bbf', '#d3cbec'];
/** The spear's shaft, as it is painted in the Boneward's hand (art/new_mobs3.ts SHAFT: kit.ts INDIGO, dimmed), dark to light; its head is IRON. */
const WOOD: readonly string[] = ['#2a2466', '#4640a0', '#6e68cc'];

function line(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string): void {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  g.fillStyle = color;
  for (let n = 0; n < 200; n++) {
    g.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

/**
 * THE SKULL'S SHADOW on the floor under it as it flies: small and faint while it is high, bigger and
 * darker as it comes down, so that where it will land is seen before it lands. `z` is its height over
 * the floor and `top` the highest it gets (in the same units).
 */
export function drawSkullShadow(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, z: number, top: number): void {
  const [sx, sy] = at(x, y);
  const near = 1 - clamp01(z / Math.max(1e-6, top));
  const rx = 3 + 5 * near;
  const was = g.globalAlpha;
  g.globalAlpha = 0.25 + 0.5 * near;
  g.fillStyle = P.black;
  g.beginPath();
  g.ellipse(Math.round(sx), Math.round(sy), rx, rx / 2, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = was;
}

/** How long the skull's burst lasts (seconds). */
export const SKULL_BURST = 0.7;

/**
 * THE SKULL BURSTING where it lands, `t` seconds after: a flash, bone thrown out and up that falls and
 * lies a moment, a puff of bone dust, and pink embers rising out of it (the golem's fire).
 */
export function drawSkullBurst(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number): void {
  if (t < 0 || t >= SKULL_BURST) return;
  const [cx, cy] = at(x, y);
  const was = g.globalAlpha;
  const fade = t < SKULL_BURST * 0.6 ? 1 : 1 - (t - SKULL_BURST * 0.6) / (SKULL_BURST * 0.4);
  // the flash
  if (t < 0.08) {
    g.fillStyle = FLAME[4];
    g.fillRect(Math.round(cx) - 2, Math.round(cy) - 3, 5, 3);
    g.fillStyle = FLAME[3];
    g.fillRect(Math.round(cx) - 3, Math.round(cy) - 2, 7, 1);
  }
  // the bone dust
  g.globalAlpha = 0.45 * (1 - t / SKULL_BURST);
  g.fillStyle = BONE_BITS[1];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + hash(i, 1, 31);
    const r = 2 + 9 * Math.min(1, t / 0.35);
    const px = Math.round(cx + Math.cos(a) * r * 1.6);
    const py = Math.round(cy + Math.sin(a) * r * 0.8 - t * 8);
    g.fillRect(px - 1, py, 3, 1);
    g.fillRect(px, py - 1, 1, 3);
  }
  // bone thrown out and up, falling, lying a moment
  g.globalAlpha = was * fade;
  for (let i = 0; i < 12; i++) {
    const a = hash(i, 2, 31) * Math.PI * 2;
    const sp = 18 + 26 * hash(i, 3, 31);
    const vz = 30 + 50 * hash(i, 4, 31);
    const G = 260;
    const flight = (2 * vz) / G;
    const s = Math.min(t, flight);
    const z = Math.max(0, vz * s - 0.5 * G * s * s);
    const px = Math.round(cx + Math.cos(a) * sp * s * 1.6);
    const py = Math.round(cy + Math.sin(a) * sp * s * 0.8);
    if (z > 0.5) {
      g.fillStyle = P.ink;
      g.fillRect(px, py, 1, 1);
    }
    const big = hash(i, 5, 31) < 0.4;
    g.fillStyle = BONE_BITS[2];
    g.fillRect(px, Math.round(py - z), big ? 2 : 1, 1);
    g.fillStyle = BONE_BITS[1];
    if (big) g.fillRect(px, Math.round(py - z) + 1, 2, 1);
  }
  // pink embers rising out of it
  for (let i = 0; i < 8; i++) {
    const life = 0.35 + 0.3 * hash(i, 6, 31);
    if (t > life) continue;
    const k = t / life;
    const px = Math.round(cx + (hash(i, 7, 31) - 0.5) * 14);
    const py = Math.round(cy - 2 - k * (10 + 12 * hash(i, 8, 31)));
    g.globalAlpha = was * (1 - k);
    g.fillStyle = k < 0.5 ? FLAME[3] : FLAME[2];
    g.fillRect(px, py, 1, 1);
  }
  g.globalAlpha = was;
}

/** The spear's length, in tiles (art/new_mobs3.ts SPEAR, 34 of the figure's lengths). */
export const SPEAR_TILES = 0.87;
/** Where along the spear the Boneward's hand holds it, from its butt (a part of its length: SPEAR_BACK of SPEAR). */
export const SPEAR_GRIP = 11 / 34;

/** The spear's shaft and head, from its butt to its tip on the screen, `lit` its head's glint (0..1): two pixels thick, its upper side in the light. */
function spear(g: CanvasRenderingContext2D, bx: number, by: number, tx: number, ty: number, lit: number): void {
  line(g, bx, by + 1, tx, ty + 1, WOOD[0]);
  line(g, bx, by, tx, ty, WOOD[2]);
  // the head: the last part of it, iron, its point bright
  const hx = bx + (tx - bx) * 0.78;
  const hy = by + (ty - by) * 0.78;
  line(g, hx, hy + 1, tx, ty + 1, IRON[1]);
  line(g, hx, hy, tx, ty, IRON[3]);
  g.fillStyle = lit > 0.3 ? FLAME[lit > 0.7 ? 4 : 3] : IRON[3];
  g.fillRect(Math.round(tx), Math.round(ty), 1, 1);
}

/**
 * THE BONEWARD'S SPEAR IN FLIGHT: its middle at (x, y) on the floor and `z` (the game's pixels) over
 * it, flying the way (fx, fy) (a unit vector on the floor); its shadow on the floor under it.
 */
export function drawSpearShot(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, z: number, fx: number, fy: number): void {
  const h = SPEAR_TILES / 2;
  const [bx, by] = at(x - fx * h, y - fy * h);
  const [tx, ty] = at(x + fx * h, y + fy * h);
  const was = g.globalAlpha;
  // its shadow on the floor under it
  g.globalAlpha = was * 0.4;
  line(g, bx, by, tx, ty, P.black);
  // a faint streak of air behind it, as it flies
  const [sx, sy] = at(x - fx * h * 2.2, y - fy * h * 2.2);
  g.globalAlpha = was * 0.35;
  line(g, sx, sy - z, bx, by - z, WOOD[2]);
  g.globalAlpha = was;
  spear(g, bx, by - z, tx, ty - z, 1);
}

/** THE BONEWARD'S SPEAR LYING ON THE FLOOR where it fell, pointing the way (fx, fy), until the Boneward picks it up. */
export function drawSpearLying(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, fx: number, fy: number): void {
  const h = SPEAR_TILES / 2;
  const [bx, by] = at(x - fx * h, y - fy * h);
  const [tx, ty] = at(x + fx * h, y + fy * h);
  const was = g.globalAlpha;
  g.globalAlpha = was * 0.5;
  line(g, bx, by + 2, tx, ty + 2, P.black);
  g.globalAlpha = was;
  spear(g, bx, by, tx, ty, 0);
}
