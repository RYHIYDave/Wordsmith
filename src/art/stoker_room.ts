// FLOOR 3'S SIDE AREA, THE FURNACE ROOM (the art chat, 4 Nov 2026). A MOCK-UP: NOT IN THE GAME, behind STOKER_ON (art/stoker.ts,
// off); nothing of the game imports it. The pieces of his quest, in floor 3's own look (the black iron prison, look B, his pick:
// art/prison.ts): torchlit dark, black iron, ember orange, soot and rust; fire an honest orange.
//
//   THE FURNACE (`furnace`): a great prison furnace set in a wall, four tiles of it along the wall: a surround of the prison's dark
//     stone strapped in riveted iron, an arched iron mouth with two doors of grates, a hood and a flue up into the dark, the damper's
//     rod out of its side to the crank. LIT (roaring: the grates blazing, the stone round its mouth lit from within, the ash-pit
//     glowing, sparks and smoke up the flue), OUT (cold, dark, a thread of smoke), and GOING OUT (a short clip).
//   THE FORGE CRANK (`crank`): beside it, on a stone foot, an iron gearbox; on its side a great iron wheel to turn; on its front a
//     train of gears, THE MIDDLE ONE MISSING (its bare axle, a plain gap in the train); WITH THE GEAR SET IN (the wheel's handle
//     glowing the cyan of what is the player's to use, as floor 3's levers do); and TURNED (a short clip: the wheel round, the gears
//     turning, the rod to the furnace's damper turning).
//   THE GEAR (`gearDropped`, `gearIcon`): the crank's missing gear lying on the floor where he dropped it, glinting; and as an
//     item, 32 by 32 in the new items' style A (art/items_a.ts), A QUEST ITEM: a plain white rim (the Normal rarity's, the game's
//     own RARITY_COLOR[0]), no rarity of its own.
//   THE FIRE IN THE WAY (`fireWall`): a wall of fire filling the Chained One's gateway (his gate's own way, art/prison_gate.ts,
//     its portcullis drawn up), burning while the furnace burns (eight frames, going round), and GOING OUT (a short clip).
// Each is anchored as floor 3's own are: the furnace and the fire as a gate's strips (art/gates.ts `Strip`, u along the wall from
// its start); the crank and the dropped gear as a standing piece (its floor point the anchor).

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { Flat, ARCH_WIDE, PILLAR, SPAN } from './gates';
import type { Strip } from './gates';
import { GRAIN, INK, hash } from './kit';
import { CYAN } from './kit';
import { EMBER } from './props';
import { paintBits } from './new_mobs3';
import type { Bit, PanelSkin, Put } from './new_mobs3';
import { stage } from './skin';
import type { Skin } from './skin';
import { add, cross, mul, norm } from './skeleton';
import type { V3 } from './skeleton';
// (floor 3's own colours and its gateway's way, art/prison.ts and art/prison_gate.ts, said again here: nothing but the game's own
// floor files imports those; tests/stoker.test.ts holds these to theirs)
/** The prison's dark stone, its black iron, its rust (art/prison.ts STONE, IRON, RUST). */
export const ROOM_STONE = ['#101018', '#1b1b25', '#272733', '#343341', '#4b4656'] as const;
export const ROOM_IRON = ['#09090c', '#16161b', '#222128', '#323039', '#55505e'] as const;
export const ROOM_RUST = ['#2e160e', '#4a2412', '#683417'] as const;
const STONE = ROOM_STONE;
const IRON = ROOM_IRON;
const RUST = ROOM_RUST;
/** Where his gate's arch springs (art/prison_gate.ts PG_SPRING), and whether a point of its plane is in its way (`prisonInWay`). */
export const ROOM_SPRING = 64;
const PG_SPRING = ROOM_SPRING;
function prisonInWay(u: number, v: number): boolean {
  return v < PG_SPRING || Math.hypot(u + 0.5 - ARCH_WIDE / 2, v + 0.5 - PG_SPRING) < SPAN / 2;
}
import { GEAR, GEAR_IRON, ST_CRUST, ST_DEEP, ST_SMOKE, gearSkin, noise2 } from './stoker';
import { RARITY_COLOR } from './palette';

const TAU = Math.PI * 2;
const D = Math.PI / 180;
const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const k5 = (v: number): number => Math.max(0, Math.min(4, Math.round(v)));

// =============================================================================================
// THE FURNACE

/** Its measures (picture pixels): along the wall, up; its mouth's middle along it, its width and the spring and crown of its arch. */
export const FURNACE = { wide: 128, high: 176, mouth: 64, mouthHalf: 36, spring: 40, crown: 66, hood: [118, 150] as const, flue: 22 } as const;
/** How long it takes to go out (seconds), and the frames it is painted in: roaring (going round), going out. */
export const FURNACE_OUT = { long: 1.6, frames: 16 } as const;
export const FURNACE_ROAR = { frames: 6, fps: 10 } as const;
/** The light it gives while it burns (for the main chat to place: a hole in the dark round its mouth, and a glow; game pixels up from its foot). */
export const FURNACE_LIGHT = { up: 24, r: 120, strength: 1.0, glow: { r: 96, color: EMBER[2], a: 0.46 } } as const;

/** A tone of the stone (look B's charcoal), lit by the fire in front of it as `glow` says (0 none to 1). */
function stoneAt(alongX: boolean, u: number, v: number, glow: number, seed: number): string {
  const row = Math.floor(v / 8);
  const off = row % 2 ? 8 : 0;
  const col = Math.floor((u + off) / 16);
  const seam = v % 8 === 0 || (u + off) % 16 === 0;
  const h = hash(col, row, seed);
  const base = alongX ? 2 : 1;
  let k = seam ? base - 1 : base + (h > 0.7 ? 1 : h < 0.2 ? -1 : 0);
  if (!seam && (v % 8 === 7)) k += 1;
  if (glow > 0.15) {
    const g = glow * (0.75 + 0.5 * hash(u >> 1, v >> 1, seed + 1));
    if (g > 0.85) return seam ? EMBER[0] : EMBER[1];
    if (g > 0.5) return seam ? '#3a140c' : RUST[2];
    if (g > 0.25) return seam ? STONE[1] : RUST[1];
  }
  return STONE[k5(k)];
}
/** Black iron (the prison's), lit toward the light; glowing a dull red with the fire (`heat`). */
function ironAt(alongX: boolean, k: number, heat: number): string {
  if (heat > 0.6) return k >= 3 ? EMBER[1] : '#5a1e0e';
  if (heat > 0.3) return k >= 3 ? '#6a2410' : IRON[k5(k)];
  return IRON[k5(k + (alongX ? 0 : -1))];
}
/** THE FURNACE as it stands in its wall: `lit` 0 (out, cold) to 1 (roaring); `t` seconds (its flicker). */
export function furnaceFlat(alongX: boolean, lit: number, t: number): Flat {
  const F = new Flat(0, FURNACE.wide, FURNACE.high);
  const W = FURNACE.wide;
  const M = FURNACE.mouth;
  const mh = FURNACE.mouthHalf;
  const inMouth = (u: number, v: number): boolean => Math.abs(u + 0.5 - M) < mh && (v < FURNACE.spring || Math.hypot((u + 0.5 - M) / mh, (v - FURNACE.spring) / (FURNACE.crown - FURNACE.spring)) < 1);
  for (let v = 0; v < FURNACE.high; v++) {
    for (let u = 0; u < W; u++) {
      const [h0, h1] = FURNACE.hood;
      // THE FLUE, up into the dark
      if (v >= h1) {
        const half = FURNACE.flue - (v - h1) * 0.0;
        if (Math.abs(u + 0.5 - M) > half) continue;
        const band = (v - h1) % 12 < 2;
        const edge = Math.abs(u + 0.5 - M) > half - 2;
        F.set(u, v, ironAt(alongX, band ? 3 : edge ? 1 : 2 + (Math.abs(u - M) < 6 ? 1 : 0), 0));
        continue;
      }
      // THE HOOD, narrowing up to the flue, riveted; its foot glowing with the heat
      if (v >= h0) {
        const k = (v - h0) / (h1 - h0);
        const half = 58 - (58 - FURNACE.flue) * k;
        if (Math.abs(u + 0.5 - M) > half) continue;
        const rivet = (v - h0) % 8 === 4 && Math.abs(Math.abs(u + 0.5 - M) - (half - 3)) < 1;
        const seam = Math.abs(u + 0.5 - M) > half - 1.2 || (v - h0) % 16 === 0;
        F.set(u, v, rivet ? IRON[4] : ironAt(alongX, seam ? 0 : 2 + (u < M ? 1 : 0), lit * clamp01(1 - (v - h0) / 10) * 0.9));
        continue;
      }
      // THE SURROUND: stone, strapped in iron at its sides and over its mouth
      const strap = u < 8 || u >= W - 8 || (v >= h0 - 6 && v < h0);
      if (strap) {
        const rivet = (u < 8 ? u === 3 : u === W - 5) && v % 10 === 5;
        F.set(u, v, rivet ? IRON[4] : ironAt(alongX, u === 0 || u === W - 1 ? 0 : u < 8 ? 2 : 3, 0));
        continue;
      }
      // the arch of iron round its mouth
      const r = Math.hypot((u + 0.5 - M) / (mh + 7), (v - FURNACE.spring) / (FURNACE.crown - FURNACE.spring + 7));
      const inRing = !inMouth(u, v) && (v >= FURNACE.spring ? r < 1 : Math.abs(u + 0.5 - M) < mh + 7);
      const fire = lit * (0.6 + 0.4 * noise2(u * 0.3, v * 0.3 + t * 3, 301));
      if (inRing) {
        const vo = Math.atan2(v - FURNACE.spring, u + 0.5 - M);
        const joint = v >= FURNACE.spring && fr((vo / Math.PI) * 9) < 0.08;
        F.set(u, v, joint ? IRON[0] : ironAt(alongX, 2 + (u < M ? 1 : 0), lit * 0.7));
        continue;
      }
      // THE MOUTH: two doors of grates; through them, the fire
      if (inMouth(u, v)) {
        if (v < 7) {
          // (the ash-pit under the doors)
          F.set(u, v, lit > 0.05 ? (noise2(u * 0.5, t * 4, 303) * lit > 0.4 ? EMBER[2] : EMBER[1]) : v < 2 ? ST_DEEP : '#120e10');
          continue;
        }
        const du = u + 0.5 - M;
        const frame = Math.abs(du) < 1.5 || Math.abs(Math.abs(du) - mh) < 2.5 || v < 9 || (v > FURNACE.crown - 6);
        const bar = Math.abs(fr((du + mh) / 6) - 0.5) > 0.3 || (v - 9) % 18 < 2;
        if (frame || bar) {
          const hinge = Math.abs(Math.abs(du) - mh + 4) < 2 && (v % 22 < 5);
          F.set(u, v, hinge ? IRON[4] : ironAt(alongX, frame ? 2 : 3, lit * 0.45));
          continue;
        }
        if (lit < 0.05) F.set(u, v, (u + v) % 3 === 0 ? '#0e0a0c' : ST_DEEP);
        else {
          const n = noise2(u * 0.4 + t * 2, v * 0.25 - t * 6, 305);
          const hot = lit * (0.55 + 0.6 * n) - (v / FURNACE.crown) * 0.35;
          F.set(u, v, hot > 0.75 ? EMBER[4] : hot > 0.55 ? EMBER[3] : hot > 0.35 ? EMBER[2] : hot > 0.15 ? EMBER[1] : ST_CRUST[2]);
        }
        continue;
      }
      // the stone, lit round the mouth by the fire
      const dm = Math.hypot((u + 0.5 - M) / (mh + 18), Math.max(0, v - FURNACE.crown) / 30 + (v < FURNACE.crown ? 0 : 0));
      F.set(u, v, stoneAt(alongX, u, v, fire * clamp01(1.25 - dm) * (v < FURNACE.crown + 14 ? 1 : 0.4), 307));
    }
  }
  // THE DAMPER'S ROD out of its side, toward the crank
  for (let u = W - 8; u < W; u++) for (let v = 126; v < 131; v++) F.set(u, v, ironAt(alongX, v === 126 ? 4 : v === 130 ? 0 : 2, 0));
  // SMOKE AND SPARKS up out of the flue (smoke thin when it is out)
  const n = Math.round(4 + 10 * lit);
  for (let i = 0; i < n; i++) {
    const life = fr(t * 0.6 + i / n + hash(i, 1, 309));
    const uu = Math.round(M + (hash(i, 2, 309) - 0.5) * 20 + 6 * Math.sin(life * 5 + i));
    const vv = Math.round(FURNACE.high - 14 + 26 * life);
    if (vv < FURNACE.high) F.set(uu, vv, lit > 0.3 && i % 3 === 0 ? (life < 0.5 ? EMBER[3] : EMBER[2]) : ST_SMOKE[Math.min(3, Math.floor(life * 4))]);
  }
  return F;
}
/** THE FURNACE's strips: roaring (frame `f` of FURNACE_ROAR), or out, or going out (frame `f` of FURNACE_OUT). */
export function furnaceStrips(alongX: boolean, state: 'lit' | 'out' | 'going', f = 0): Strip[] {
  if (state === 'lit') return furnaceFlat(alongX, 1, f / FURNACE_ROAR.fps).strips(alongX);
  if (state === 'out') return furnaceFlat(alongX, 0, 0).strips(alongX);
  const k = f / (FURNACE_OUT.frames - 1);
  return furnaceFlat(alongX, 1 - k * k * (3 - 2 * k), (f / FURNACE_OUT.frames) * FURNACE_OUT.long).strips(alongX);
}

// =============================================================================================
// THE FORGE CRANK, AND THE GEAR: standing pieces, painted as the figures are (on the stage: z-buffered, seams, lit from the upper left)

/** The crank's picture, its floor point at (ax, ay). */
export const CRANK_CANVAS = { w: 180, h: 220, ax: 88, ay: 170 } as const;
/** Its measures (its own lengths): the wheel's middle and its radius, the gears' places on its front (the missing one's the middle). */
export const CRANK = { wheel: [22, 0, 40] as V3, wheelR: 17, gears: [[-5, 53, 9.5], [5, 37, 8.5], [-4, 21, 9.5]] as const, face: -15.2 } as const;
/** The turning (seconds), and the frames it is painted in. */
export const CRANK_TURN = { long: 1.2, frames: 18, turns: 1.25 } as const;
/** Stone of the crank's foot (the prison's), and its iron. */
const box = (put: Put, part: string, c: V3, h: V3, skin: PanelSkin): void => {
  const [hx, hy, hz] = h;
  put(part, part, { k: 'panel', c: add(c, [hx, 0, 0]), u: [0, hy, 0], v: [0, 0, hz], skin });
  put(part, part, { k: 'panel', c: add(c, [-hx, 0, 0]), u: [0, -hy, 0], v: [0, 0, hz], skin });
  put(part, part, { k: 'panel', c: add(c, [0, hy, 0]), u: [-hx, 0, 0], v: [0, 0, hz], skin });
  put(part, part, { k: 'panel', c: add(c, [0, -hy, 0]), u: [hx, 0, 0], v: [0, 0, hz], skin });
  put(part, part, { k: 'panel', c: add(c, [0, 0, hz]), u: [hx, 0, 0], v: [0, hy, 0], skin });
};
const stoneSkin = (seed: number): PanelSkin => (a, b, front, tone) => {
  const row = Math.floor((b + 40) / 6);
  const col = Math.floor((a + 40 + (row % 2) * 5) / 10);
  const seam = fr((b + 40) / 6) < 0.15 || fr((a + 40 + (row % 2) * 5) / 10) < 0.1;
  const h = hash(col, row, seed);
  return STONE[k5(tone - 0.5 + (seam ? -1 : h > 0.7 ? 1 : 0) - (front ? 0 : 1))];
};
const ironSkin = (seed: number): PanelSkin => (a, b, front, tone) => {
  const rivet = Math.abs(fr((a + 30) / 7) - 0.5) < 0.1 && Math.abs(fr((b + 30) / 7) - 0.5) < 0.1;
  const rust = noise2(a * 0.3 + seed, b * 0.3, 311) > 0.78;
  if (rivet) return IRON[k5(tone + 1.5)];
  if (rust) return RUST[Math.max(0, Math.min(2, tone - 1))];
  return IRON[k5(tone + 0.5 - (front ? 0 : 1))];
};
/** A toothed gear on the crank's front, facing out of it (to −y), turned `spin` degrees. */
function frontGear(put: Put, at: V3, r: number, spin: number, seed: number): void {
  const skin: PanelSkin = (a, b, front, tone) => {
    const rr = Math.hypot(a, b);
    const ang = Math.atan2(b, a) - spin * D;
    const teeth = Math.round(r * 1.5);
    const tooth = fr((ang / TAU) * teeth) < 0.5;
    if (rr > r || (rr > r - 2 && !tooth)) return null;
    if (rr < 1.4) return GEAR_IRON[0];
    if (rr < r * 0.62 && rr > 2.4 && Math.abs(fr((ang / TAU) * 5) - 0.5) < 0.3) return null;
    if (rr > r - 2.6 && rr < r - 2.0) return GEAR_IRON[1];
    return GEAR_IRON[k5(tone + (rr > r - 2 ? 1.5 : 0.5) + (front ? 0 : -1))];
  };
  put(`gear${seed}`, 'gear', { k: 'panel', c: add(at, [0, -1.2, 0]), u: [r, 0, 0], v: [0, 0, r], skin });
  put(`gear${seed}`, 'gear', { k: 'rod', a: add(at, [0, -1.2, 0]), b: add(at, [0, -3.4, 0]), ra: 1.6, rb: 1.6, ramp: [IRON[1], IRON[2], IRON[3], IRON[4], IRON[4]] });
}
/** THE FORGE CRANK: `gear` whether the gear is set in; `turn` how far the wheel has gone round (turns); `ready` its handle glowing (the player's to use). */
export function paintCrank(gear: boolean, turn: number, ready: boolean): { px: Px; lights: Light[] } {
  const C = CRANK_CANVAS;
  const st = stage('front', C.ax, C.ay, C);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  // the stone foot, the iron gearbox on it
  box(put, 'foot', [0, 0, 6], [17, 17, 6], stoneSkin(321));
  box(put, 'box', [0, 0, 36], [12, 14, 24], ironSkin(323));
  put('box', 'cap', { k: 'panel', c: [0, 0, 60.6], u: [13.5, 0, 0], v: [0, 15.5, 0], skin: ironSkin(325) });
  // the rod up out of its top, to the furnace's damper on the wall behind (turning as the wheel turns)
  put('rod', 'rod', { k: 'rod', a: [-3, 7, 60], b: [-3, 7, 140], ra: 2.2, rb: 2.2, ramp: [IRON[0], IRON[1], IRON[2], IRON[3], IRON[4]] });
  for (let z = 72; z < 140; z += 22) put('rod', 'rodband', { k: 'band', ring: { c: [-3, 7, z + ((turn * 22) % 22)], u: [2.9, 0, 0], v: [0, 2.9, 0] }, ramp: [IRON[0], IRON[1], IRON[2], IRON[3], IRON[4]], rows: 2 });
  // THE WHEEL on its side: an axle, a hub, six spokes, its rim; a handle off its rim
  const [wx, wy, wz] = CRANK.wheel;
  const a0 = -turn * 360;
  put('wheel', 'axle', { k: 'rod', a: [12, wy, wz], b: [wx + 3, wy, wz], ra: 2.4, rb: 2.4, ramp: [IRON[0], IRON[1], IRON[2], IRON[3], IRON[4]] });
  put('wheel', 'hub', { k: 'ball', c: [wx, wy, wz], ax: [[3, 0, 0], [0, 3.6, 0], [0, 0, 3.6]], skin: [IRON[0], IRON[1], IRON[2], IRON[3], IRON[4]] });
  const rimAt = (deg: number, r = CRANK.wheelR): V3 => [wx, wy + r * Math.cos(deg * D), wz + r * Math.sin(deg * D)];
  for (let i = 0; i < 6; i++) put('wheel', 'spoke', { k: 'rod', a: [wx, wy, wz], b: rimAt(a0 + i * 60), ra: 1.3, rb: 1.1, ramp: [IRON[0], IRON[1], IRON[2], IRON[3], IRON[4]] });
  for (let i = 0; i < 16; i++) put('wheel', 'rim', { k: 'rod', a: rimAt(a0 + i * 22.5), b: rimAt(a0 + (i + 1) * 22.5), ra: 1.9, rb: 1.9, ramp: [IRON[0], IRON[1], IRON[2], IRON[3], IRON[4]] });
  const hAt = rimAt(a0 + 30);
  put('handle', 'handle', { k: 'rod', a: hAt, b: add(hAt, [8, 0, 0]), ra: 1.7, rb: 1.9, ramp: ready ? CYAN : [IRON[1], IRON[2], IRON[3], IRON[4], IRON[4]] });
  // THE GEARS on its front: the drive gear on the wheel's shaft; THE MIDDLE ONE MISSING, its axle bare; the last, on the rod's
  const [g0, g1, g2] = CRANK.gears;
  const y = CRANK.face;
  const spin = gear ? turn * 360 : 0;
  frontGear(put, [g0[0], y, g0[1]], g0[2], spin, 1);
  if (gear) frontGear(put, [g1[0], y, g1[1]], g1[2], -spin * (g0[2] / g1[2]) + 12, 2);
  else {
    // (its bare axle, and the bright ring worn on the face where the gear turned)
    put('stub', 'stub', { k: 'rod', a: [g1[0], y + 1, g1[1]], b: [g1[0], y - 4, g1[1]], ra: 1.6, rb: 1.6, ramp: GEAR_IRON });
    const ring: PanelSkin = (a, b) => (Math.abs(Math.hypot(a, b) - g1[2] * 0.8) < 0.7 ? GEAR_IRON[3] : null);
    put('box', 'worn', { k: 'panel', c: [g1[0], y + 0.9, g1[1]], u: [g1[2], 0, 0], v: [0, 0, g1[2]], skin: ring });
  }
  frontGear(put, [g2[0], y, g2[1]], g2[2], spin * (g0[2] / g2[2]), 3);
  const lights = paintBits(st, bits, [0, 0, 30]);
  const px = st.whole(null);
  if (ready) lights.push({ x: st.at(hAt)[0], y: st.at(hAt)[1], r: 18, color: CYAN[2], a: 0.3 });
  return { px, lights };
}
/** The crank's frames: without its gear; with it set in (ready to turn); turning (frame `f` of CRANK_TURN); turned. */
export function crankSprite(state: 'missing' | 'set' | 'turning' | 'turned', f = 0): Sprite {
  const k = f / (CRANK_TURN.frames - 1);
  const p = state === 'missing' ? paintCrank(false, 0, false) : state === 'set' ? paintCrank(true, 0, true) : state === 'turned' ? paintCrank(true, CRANK_TURN.turns, false) : paintCrank(true, CRANK_TURN.turns * (k * k * (3 - 2 * k)), false);
  const s = p.px.sprite(CRANK_CANVAS.ax, CRANK_CANVAS.ay, GRAIN);
  s.lights = p.lights.map((l) => ({ ...l, x: l.x / GRAIN, y: l.y / GRAIN }));
  return s;
}

/** THE GEAR lying on the floor where it fell (flat), glinting now and then: `f` its frame of GEAR_GLINT. */
export const GEAR_CANVAS = { w: 48, h: 32, ax: 24, ay: 18 } as const;
export const GEAR_GLINT = { frames: 8, fps: 8 } as const;
export function paintGearDropped(f: number): Px {
  const C = GEAR_CANVAS;
  const st = stage('front', C.ax, C.ay, C);
  const bits: Bit[] = [];
  const glint = f === 2 || f === 3;
  bits.push({ part: 'gear', piece: 'gear', shape: { k: 'panel', c: [0, 0, GEAR.thick], u: [GEAR.r, 0, 0], v: [0, GEAR.r, 0], skin: gearSkin(0, 18, glint) } });
  paintBits(st, bits, [0, 0, 1]);
  const px = st.whole(null);
  // (a glint running round its teeth)
  if (glint) {
    const [x, y] = st.at([GEAR.r * 0.7, -GEAR.r * 0.7, GEAR.thick]);
    px.set(Math.round(x), Math.round(y) - 1, '#fff6e0');
    px.set(Math.round(x) - 1, Math.round(y) - 1, '#f2e2c8');
  }
  return px;
}
export function gearDroppedSprite(f: number): Sprite {
  return paintGearDropped(f % GEAR_GLINT.frames).sprite(GEAR_CANVAS.ax, GEAR_CANVAS.ay, GRAIN);
}

// =============================================================================================
// THE GEAR AS AN ITEM: 32 by 32, in the new items' style A (art/items_a.ts): five tones to a material, a dark seam where one part
// lies over another, a shadow cast down and to the right, a bold ink outline, and its rim (a quest item: the plain white of Normal)

const N = 32;
const IT_IRON = ['#16142a', '#2a2848', '#46446e', '#6e6c9a', '#b0aed8'] as const;
const IT_BRASS = ['#3a2410', '#6a4620', '#a07436', '#d0a656', '#f2d892'] as const;
/** THE GEAR'S ICON: a cog of blackened iron, fourteen teeth, four spokes, a brass hub; lit from the upper left. */
export function paintGearIcon(): Px {
  const out = new Px(N, N);
  const c: [number, number] = [16, 16];
  const R = 13.2;
  const r0 = 10.3;
  const teeth = 12;
  const L = [-0.5, -0.66, 0.58];
  const ln = Math.hypot(L[0], L[1], L[2]);
  const owner = new Int8Array(N * N).fill(-1);
  const tone = new Int8Array(N * N).fill(-1);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const dx = x + 0.5 - c[0];
      const dy = y + 0.5 - c[1];
      const r = Math.hypot(dx, dy);
      const a = Math.atan2(dy, dx) + 0.13;
      const tooth = fr((a / TAU) * teeth) < 0.46;
      let part = -1;
      if (r < 3.2) part = 2;
      else if (r < 5.0) part = 1;
      else if (r < r0 - 2.2) part = Math.abs(fr((a / TAU) * 4) - 0.5) > 0.33 ? 1 : -1;
      else if (r < r0) part = 0;
      else if (r < R && tooth) part = 0;
      if (part < 0) continue;
      owner[y * N + x] = part;
      // (its light: a dome over the hub; the rim and the teeth bevelled round their edges)
      let n: [number, number, number];
      if (part === 2) {
        const l = Math.min(0.95, r / 3.2);
        n = [(dx / Math.max(0.01, r)) * l, (dy / Math.max(0.01, r)) * l, Math.sqrt(1 - l * l)];
      } else {
        const edge = part === 0 ? Math.min(r - (r0 - 2.2), (tooth ? R : r0) - r) : Math.min(r - 3.2, 2);
        const t = clamp01(1 - edge / 1.6) * 0.75;
        const out = r > (part === 0 ? r0 - 1.1 : 0) ? 1 : -1;
        n = [(dx / r) * t * out, (dy / r) * t * out, 1 - t * 0.5];
      }
      const nl = Math.hypot(n[0], n[1], n[2]);
      const v = (n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / (nl * ln);
      tone[y * N + x] = v > 0.93 ? 4 : v > 0.72 ? 3 : v > 0.42 ? 2 : v > 0.08 ? 1 : 0;
    }
  }
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const i = owner[y * N + x];
      if (i < 0) continue;
      const at = (xx: number, yy: number): number => (xx < 0 || yy < 0 || xx >= N || yy >= N ? -1 : owner[yy * N + xx]);
      const seam = [at(x + 1, y), at(x - 1, y), at(x, y + 1), at(x, y - 1)].some((j) => j > i);
      const shadow = [at(x - 1, y - 1), at(x - 2, y - 1)].some((j) => j > i);
      const t = Math.max(0, tone[y * N + x] - (shadow ? 1 : 0));
      const ramp = i === 2 ? IT_BRASS : IT_IRON;
      out.set(x, y, seam ? INK : ramp[i === 0 && t > 3 ? 3 : t]);
    }
  }
  // (a nick of wear on one tooth, and the brass hub's hole)
  out.set(16, 16, INK);
  out.set(15, 16, IT_BRASS[0]);
  out.outline(INK);
  out.outline(RARITY_COLOR[0]);
  return out;
}
export function gearIconSprite(): Sprite {
  return paintGearIcon().sprite(16, 16, GRAIN);
}

// =============================================================================================
// THE FIRE IN THE WAY: a wall of fire filling the Chained One's gateway

/** Its frames: burning (going round, `fps`), going out (`out`, over `long` seconds). Its top: the gateway's crown. */
export const FIRE_WALL = { frames: 8, fps: 12, out: 18, long: 1.5, top: PG_SPRING + SPAN / 2 + 2 } as const;
/** The light it gives while it burns (game pixels up from the floor, at the way's middle). */
export const FIRE_WALL_LIGHT = { up: 30, r: 110, strength: 1.0, glow: { r: 90, color: EMBER[2], a: 0.5 } } as const;
/** THE FIRE IN THE WAY: `k` 1 a wall of fire filling the gateway, less as it dies down to embers and smoke; `t` seconds (its flicker). */
export function fireWallFlat(k: number, t: number): Flat {
  const top = FIRE_WALL.top;
  const F = new Flat(0, ARCH_WIDE, top + 30);
  const put = (u: number, v: number, c: string): void => {
    if (prisonInWay(u, v)) F.set(u, v, c);
  };
  for (let u = PILLAR; u < PILLAR + SPAN; u++) {
    // the height of the flames over each column: tongues, leaping and falling; low as it dies down
    const n1 = noise2(u * 0.11, t * 2.3, 331);
    const n2 = noise2(u * 0.29 + 7, t * 4.1, 333);
    const tall = (top + 10) * k * (0.55 + 0.35 * n1 + 0.25 * n2);
    for (let v = 0; v < Math.min(top + 30, tall + 2); v++) {
      const u2 = v / Math.max(1, tall);
      // (their hearts bright at the foot, going to deep orange and to dark tips; gaps of dark between tongues high up)
      const lick = noise2(u * 0.22 + 3, v * 0.07 - t * 5.5, 335);
      if (u2 > 0.45 && lick < 0.35 + 0.4 * (u2 - 0.45)) continue;
      const hot = (1 - u2) * (0.6 + 0.6 * lick) * (0.5 + 0.5 * k);
      put(u, v, hot > 0.78 ? EMBER[4] : hot > 0.55 ? EMBER[3] : hot > 0.32 ? EMBER[2] : hot > 0.14 ? EMBER[1] : EMBER[0]);
    }
    // a bed of coals along the way's foot, glowing; when it is out, dark coal and ash
    for (let v = 0; v < 4; v++) {
      const n = noise2(u * 0.5, v + t * 3, 337);
      put(u, v, k > 0.15 ? (n > 0.6 ? EMBER[2] : EMBER[1]) : k > 0.02 ? (n > 0.7 ? EMBER[1] : ST_CRUST[2]) : n > 0.5 ? '#2a2426' : '#1a1618');
    }
  }
  // sparks and smoke going up out of it (smoke the most as it dies)
  for (let i = 0; i < 26; i++) {
    const life = fr(t * 0.7 + i / 26 + hash(i, 1, 339));
    const u = Math.round(PILLAR + 4 + hash(i, 2, 339) * (SPAN - 8) + 5 * Math.sin(life * 6 + i));
    const v = Math.round(top * 0.4 * k + 20 + (top - 10) * life);
    if (life > 0.8) continue;
    const smoke = i % 3 === 0 || k < 0.4;
    if (smoke && (k > 0.02 || life < 0.5)) put(u, v, ST_SMOKE[Math.min(3, Math.floor(life * 4))]);
    else if (!smoke && k > 0.1) put(u, v, life < 0.4 ? EMBER[4] : EMBER[3]);
  }
  return F;
}
/** The fire's strips: burning (frame `f` of FIRE_WALL.frames), or going out (frame `f` of FIRE_WALL.out), or gone (only its ash). */
export function fireWallStrips(alongX: boolean, state: 'burning' | 'going' | 'gone', f = 0): Strip[] {
  if (state === 'burning') return fireWallFlat(1, f / FIRE_WALL.fps).strips(alongX);
  if (state === 'gone') return fireWallFlat(0, 0).strips(alongX);
  const u = f / (FIRE_WALL.out - 1);
  return fireWallFlat(1 - u * u * (3 - 2 * u) * 1.0, (f / FIRE_WALL.out) * FIRE_WALL.long + 0.3).strips(alongX);
}

// =============================================================================================
// KEPT, AND LET GO (the main chat's rule: what a floor makes is let go when another floor is come into)

let made: { furnace: Map<string, Strip[]>; fire: Map<string, Strip[]>; crank: Map<string, Sprite>; gear: Sprite[]; icon: Sprite | null } | null = null;
function keep(): NonNullable<typeof made> {
  return (made ??= { furnace: new Map(), fire: new Map(), crank: new Map(), gear: [], icon: null });
}
/** THE FURNACE ROOM'S PIECES, made the first time they are asked for and kept (until `forgetMade`). */
export const STOKER_ROOM = {
  furnace(alongX: boolean, state: 'lit' | 'out' | 'going', f = 0): Strip[] {
    const key = `${alongX ? 1 : 0}${state}${f}`;
    const m = keep().furnace;
    let s = m.get(key);
    if (!s) m.set(key, (s = furnaceStrips(alongX, state, f)));
    return s;
  },
  crank(state: 'missing' | 'set' | 'turning' | 'turned', f = 0): Sprite {
    const key = `${state}${f}`;
    const m = keep().crank;
    let s = m.get(key);
    if (!s) m.set(key, (s = crankSprite(state, f)));
    return s;
  },
  gearDropped(f: number): Sprite {
    const g = keep().gear;
    const i = f % GEAR_GLINT.frames;
    return g[i] ?? (g[i] = gearDroppedSprite(i));
  },
  gearIcon(): Sprite {
    const k = keep();
    return k.icon ?? (k.icon = gearIconSprite());
  },
  fireWall(alongX: boolean, state: 'burning' | 'going' | 'gone', f = 0): Strip[] {
    const key = `${alongX ? 1 : 0}${state}${f}`;
    const m = keep().fire;
    let s = m.get(key);
    if (!s) m.set(key, (s = fireWallStrips(alongX, state, f)));
    return s;
  },
};
/** Its pictures let go (its floor left), made again if wanted. */
export function forgetMade(): void {
  made = null;
}
void cross;
void norm;
void mul;
void (null as unknown as Skin);
