// FLOOR 17'S FOOTMEN: WHAT THEIR BLOWS DO ONCE THEY LEAVE THEM (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME,
// behind FOOTMEN_ON (art/masque_footmen.ts, off). Their moves are art/masque_footmen_moves.ts; each of these begins as his
// blow lands (its `hit`), where the game puts it: at his place on the floor, turned the way he faces.
//
// His rule of 28 Oct for every enemy from the Princess on: “And bigger AOE to compensate for the extra time the player gets
// to evade”. So both reach far:
//   THE TRAY IN FLIGHT: flung backhand, it flies flat and spinning, out TRAY_FX's reach (six tiles) along the left of a long
//     loop, swings round at its far end and comes back along the right of it into his hand: a loop six tiles long and two
//     and more across, gone out and back in under a second. Painted spinning (its rosette and its lobes going round), tipped
//     into its turn and wobbling, the enemy's edge round it; its after-images smeared behind it.
//   THE FIRE FAN: as the candelabrum comes down, its flames are flung out across the floor before him: in two frames a wave
//     of fire runs out over a wedge FIRE_FX's size (three tiles out, a third of a turn across), smeared; tongues of honest
//     orange flame stand up all over it, burning; they sink to embers and a breath of smoke, and are gone.
// Every flame an honest orange (his rulebook, Colour 3: as floor 16's lantern); never the enemy's pink.

import type { Painted } from './kit';
import { hash } from './kit';
import { ENEMY_RIM } from './mkit';
import { CANDLE, CANDLE_LIGHT, SMEAR, TRAY, trayBits } from './masque_footmen';
import { TILE3, paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import { stage } from './skin';
import type { GameView } from './skin';
import { add, cross, lerp3, mul, norm, project } from './skeleton';
import type { V3 } from './skeleton';

const TAU = Math.PI * 2;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const lay = (px: Px, x: number, y: number, c: string, size = 1): void => {
  const xi = Math.round(x - size / 2);
  const yi = Math.round(y - size / 2);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, c);
};

// =============================================================================================
// THE TRAY IN FLIGHT

/** How far out it flies (his own lengths: six tiles), how far to either side its loop swings (a little over a tile), how low it dips at its far end (about the waist of whoever stands there), and how fast it spins (turns a second). */
export const TRAY_FX = { reach: 6 * TILE3, wide: 1.15 * TILE3, low: 21, spin: 4.5 } as const;
/**
 * WHERE THE TRAY IS `t` seconds into a flight of `T` seconds from `a` (where it left his hand) to `b` (where he catches
 * it): out along the left of its loop to its far end, round, and back along the right; its middle, how far it has spun
 * (turns), its face's way (tipped into its turn, wobbling) and a way across it.
 */
export function trayLoop(a: V3, b: V3, t: number, T: number): { c: V3; spin: number; n: V3; u: V3 } {
  const u = clamp01(t / T);
  const base = lerp3(a, b, u);
  const s1 = Math.sin(Math.PI * u);
  const x = base[0] + (TRAY_FX.reach - base[0]) * s1;
  const y = base[1] + TRAY_FX.wide * Math.sin(TAU * u);
  const z = base[2] - (base[2] - TRAY_FX.low) * s1;
  // (banked into the turn, a little wobble as it spins)
  const bank = -0.22 * Math.cos(Math.PI * u);
  const n = norm([0.06 * Math.sin(TAU * 3 * u), bank, 1]);
  return { c: [x, y, z], spin: t * TRAY_FX.spin, n, u: norm(cross([0, 1, 0], n), [1, 0, 0]) };
}
/** Its picture: a canvas anchored at HIS place on the floor (the game puts it where he stands, turned his way), big enough for the whole loop either way round. */
export const TRAY_SHOT_CANVAS = { w: 340, h: 340, ax: 64, ay: 196 } as const;
/**
 * THE TRAY IN FLIGHT AS IT IS SEEN, from in front or from behind: the tray at its place in its loop (`at` its flight), spun,
 * tipped, the enemy's edge round it; and its after-images smeared behind it along the way it has come (`was`: where it was
 * a moment before, oldest first).
 */
export function trayShotPainted(at: { c: V3; spin: number; n: V3; u: V3 }, view: GameView = 'front', was: ReadonlyArray<V3> = []): Painted {
  const can = TRAY_SHOT_CANVAS;
  const st = stage(view === 'back' ? 'rear' : view, can.ax, can.ay, can);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  // the after-images: its rim as it was, pale, the oldest thinned to every other point; and a tail along the way it came
  const v0 = norm(cross(at.n, at.u), [0, 1, 0]);
  was.forEach((c, j) => {
    const k = j / Math.max(1, was.length - 1);
    if (k < 0.6) return;
    for (let i = 0; i < 20; i++) {
      if (k < 0.8 && i % 2) continue;
      const a = (i / 20) * TAU;
      const p = add(c, add(mul(at.u, Math.cos(a) * TRAY.r), mul(v0, Math.sin(a) * TRAY.r)));
      put('smear', 'smear', { k: 'mote', p, c: k > 0.85 ? SMEAR[2] : SMEAR[1], size: 1 });
    }
  });
  const trail = [...was, at.c];
  for (let j = 1; j < trail.length; j++) {
    const k = j / (trail.length - 1);
    const a = trail[j - 1];
    const b = trail[j];
    const d = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const n = Math.max(1, Math.ceil(d / 1.2));
    // (its edges' streaks either side, and its middle's)
    for (const side of [-0.8, 0, 0.8]) {
      for (let e = 0; e < n; e++) {
        if (k < 0.5 && (e + j) % 2) continue;
        const p = add(lerp3(a, b, e / n), mul(v0, side * TRAY.r));
        put('smear', 'smear', { k: 'mote', p, c: side === 0 ? (k > 0.6 ? SMEAR[2] : SMEAR[1]) : k > 0.5 ? SMEAR[1] : SMEAR[0], size: 1 });
      }
    }
  }
  // its spin: two whooshes round its rim, going round with it
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i <= 10; i++) {
      const a = at.spin * TAU + j * Math.PI + (i / 10) * 1.3;
      const r = TRAY.r * (1.22 + 0.04 * i);
      const p = add(at.c, add(mul(at.u, Math.cos(a) * r), mul(v0, Math.sin(a) * r)));
      put('smear', 'smear', { k: 'mote', p, c: i > 6 ? SMEAR[0] : SMEAR[1], size: 1 });
    }
  }
  trayBits(put, 'shot', at.c, at.n, at.u, at.spin);
  const lights = paintBits(st, bits, at.c);
  return { px: st.whole(ENEMY_RIM), lights };
}

// =============================================================================================
// THE FIRE FAN

/**
 * Its size (his own lengths, from his place on the floor: three tiles out, a third of a turn across, before him) and its
 * times (seconds from the blow landing): the wave running out (two frames); burning; sinking to embers; gone.
 */
export const FIRE_FX = { r: 3 * TILE3, near: 0.55 * TILE3, spread: 120, burst: [0, 2 / 30] as const, burn: [2 / 30, 0.62] as const, embers: [0.62, 1.15] as const, long: 1.3 } as const;
export const FIRE_CANVAS = { w: 250, h: 210, ax: 72, ay: 108 } as const;
/** The fan's tongues of flame: where each stands on the floor, how tall it burns, its own flicker. */
const TONGUES: { at: V3; tall: number; seed: number; k: number }[] = (() => {
  const out: { at: V3; tall: number; seed: number; k: number }[] = [];
  const n = 150;
  for (let i = 0; i < n; i++) {
    const a = ((hash(i, 1, 7811) - 0.5) * FIRE_FX.spread * Math.PI) / 180;
    // (thicker toward its middle and out at its wave's edge)
    const k = Math.sqrt(hash(i, 2, 7811));
    const r = FIRE_FX.near + (FIRE_FX.r - FIRE_FX.near) * k;
    out.push({ at: [Math.cos(a) * r, Math.sin(a) * r, 0], tall: 9 + 15 * hash(i, 3, 7811) * (1 - 0.4 * Math.abs(a) / ((FIRE_FX.spread * Math.PI) / 360)) * (0.7 + 0.5 * k), seed: i, k });
  }
  return out;
})();
/** A tongue of flame `tall` high at `p` on the floor, flickering, laid on `px` as the stage sees it: red at its root, orange, yellow, a white heart low in it. */
function tongue(px: Px, at: (p: V3) => readonly [number, number], p: V3, tall: number, t: number, seed: number): void {
  if (tall < 1) return;
  const flick = 0.8 + 0.2 * Math.sin(t * 19 + seed * 1.7);
  const h = tall * flick;
  const lean = 1.6 * Math.sin(t * 7 + seed);
  const [x0, y0] = at(p);
  const n = Math.max(2, Math.round(h));
  for (let j = 0; j < n; j++) {
    const k = j / n;
    const w = Math.max(1, Math.round((1 - k) * (2 + h * 0.18)));
    const x = x0 + lean * k * k;
    const y = y0 - j;
    const c = k < 0.12 ? CANDLE[1] : k < 0.3 ? CANDLE[4] : k < 0.55 ? CANDLE[3] : k < 0.8 ? CANDLE[2] : CANDLE[1];
    for (let dx = -Math.floor(w / 2); dx < Math.ceil(w / 2); dx++) lay(px, x + dx, y, dx === -Math.floor(w / 2) && w > 2 ? CANDLE[1] : c);
  }
}
/** THE FIRE FAN `t` seconds after his blow lands, seen from in front or from behind (its picture anchored at his place on the floor, turned his way). */
export function firePainted(t: number, view: GameView = 'front'): Painted {
  const can = FIRE_CANVAS;
  const pv = view === 'back' ? 'rear' : view;
  const px = new Px(can.w, can.h);
  const at = (p: V3): readonly [number, number] => {
    const r = project(p, pv);
    return [can.ax + r[0], can.ay + r[1]];
  };
  const depth = (p: V3): number => project(p, pv)[2];
  const lights: Light[] = [];
  if (t < 0 || t > FIRE_FX.long) return { px, lights };
  const [b0, b1] = FIRE_FX.burst;
  const half = (FIRE_FX.spread * Math.PI) / 360;
  // THE WAVE: running out over the wedge in two frames, its edge a band of fire, its after-images behind it
  const reach = t <= b0 ? 0 : t < b1 ? (t - b0) / (b1 - b0) : 1;
  const out = FIRE_FX.near + (FIRE_FX.r - FIRE_FX.near) * reach;
  if (t <= b1 + 1 / 30) {
    for (let j = 0; j <= 4; j++) {
      const r = FIRE_FX.near + (out - FIRE_FX.near) * (j / 4);
      const steps = Math.ceil((r * half * 2) / 1.5);
      for (let i = 0; i <= steps; i++) {
        if (j < 2 && i % 2) continue;
        const a = -half + (2 * half * i) / steps;
        const p: V3 = [Math.cos(a) * r, Math.sin(a) * r, 0];
        const [x, y] = at(p);
        lay(px, x, y, j === 4 ? CANDLE[4] : j >= 2 ? CANDLE[3] : SMEAR[1], j === 4 ? 2 : 1);
        if (j === 4) lay(px, x, y - 2, CANDLE[2], 1);
      }
    }
  }
  const [, burnEnd] = FIRE_FX.burn;
  const [e0, e1] = FIRE_FX.embers;
  // THE BURNING WAX splashed over the floor where the wave has been: pools of it, burning, going dark
  if (t > b0) {
    const pool = 1 - smooth(e0 - 0.1, e1, t);
    for (let i = 0; i < 260; i++) {
      const k = Math.sqrt(hash(i, 21, 7815));
      const r = FIRE_FX.near + (FIRE_FX.r - FIRE_FX.near) * k;
      if (r > out) continue;
      const a = (hash(i, 22, 7815) - 0.5) * 2 * half;
      const p: V3 = [Math.cos(a) * r, Math.sin(a) * r, 0];
      const [x, y] = at(p);
      const flick = hash(i, Math.floor(t * 15), 7816);
      if (flick > pool) continue;
      lay(px, x, y, flick < 0.25 * pool ? CANDLE[3] : flick < 0.6 * pool ? CANDLE[2] : CANDLE[1], hash(i, 23, 7815) < 0.3 ? 2 : 1);
    }
  }
  // THE TONGUES: standing up where the wave has been, burning, then sinking
  const list = TONGUES.filter((g) => FIRE_FX.near + (FIRE_FX.r - FIRE_FX.near) * g.k <= out + 1).sort((a, b) => depth(a.at) - depth(b.at));
  for (const g of list) {
    // (each catches a little after the wave passes it, flares, burns, and sinks)
    const lit = smooth(b1 * g.k, b1 * g.k + 0.08, t);
    const sink = 1 - smooth(burnEnd - 0.2 + 0.25 * hash(g.seed, 4, 7811), e0 + 0.15, t);
    const flare = 1 + 0.5 * (1 - smooth(b1, b1 + 0.2, t));
    const tall = g.tall * lit * sink * flare;
    if (tall >= 1) tongue(px, at, g.at, tall, t, g.seed);
    // (its embers, glowing on the floor where it burned, going out)
    if (t > burnEnd - 0.1 && t < e1) {
      const fade = 1 - smooth(e0, e1, t);
      if (hash(g.seed, Math.floor(t * 12), 7812) < fade) {
        const [x, y] = at(g.at);
        lay(px, x, y, fade > 0.5 ? CANDLE[1] : CANDLE[0], 2);
        if (fade > 0.6) lay(px, x + 1, y - 1, CANDLE[2], 1);
      }
    }
    // (and sparks flying up off it while it burns)
    if (tall > 4) {
      for (let s = 0; s < 2; s++) {
        const life = (t * 1.8 + hash(g.seed, s + 7, 7813)) % 1;
        const p = add(g.at, [Math.sin(g.seed + s * 2 + t * 5) * 3 * life, Math.cos(g.seed * 1.3 + s) * 3 * life, 4 + 26 * life]);
        const [x, y] = at(p);
        lay(px, x, y, life < 0.4 ? CANDLE[4] : life < 0.7 ? CANDLE[3] : CANDLE[2], 1);
      }
    }
  }
  // (smoke as it dies: grey wisps rising from where it burned)
  if (t > e0 - 0.1) {
    for (let i = 0; i < TONGUES.length; i += 3) {
      const g = TONGUES[i];
      const life = (t - e0 + 0.1) * 1.4 - hash(i, 9, 7814) * 0.3;
      if (life < 0 || life > 1) continue;
      const p = add(g.at, [Math.sin(i + t * 3) * 2 * life, Math.cos(i * 1.7) * 2 * life, 3 + 22 * life]);
      const [x, y] = at(p);
      lay(px, x, y, life < 0.5 ? '#6a6474' : '#4a4654', life < 0.4 ? 2 : 1);
    }
  }
  // THE LIGHT it throws, while it burns
  const glow = t < burnEnd ? 1 : 1 - smooth(burnEnd, e1, t);
  if (glow > 0.05) {
    for (const a of [-0.6, 0, 0.6]) {
      const r = FIRE_FX.near + (out - FIRE_FX.near) * 0.6;
      const [x, y] = at([Math.cos(a * half) * r, Math.sin(a * half) * r, 6]);
      lights.push({ x, y, r: 40, color: CANDLE_LIGHT, a: 0.28 * glow });
    }
  }
  return { px, lights };
}
