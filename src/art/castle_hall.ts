// THE FIRST TOWN AS THE CASTLE'S HALL, RIGHT INSIDE ITS WALLS, ITS PIECES READY FOR THE GAME (the art chat, 2 Nov 2026). Behind
// the switch CASTLE_HALL, off; nothing of the game imports it until the main chat puts it in. (Its owl: art/hall_owl.ts.)
//
// His words, 2 Nov 2026, 15:37: “Unfortunately that means the first town is going to have to be redone as well.  In sort of
// the same style as the wardens.  Maybe more sun, and more plants.  An owl in the rafters.  Hastily barricaded windows”. To the
// first three looks: “Well it’s still supposed to be in the castle.  Like right inside.  The barred door in the back leads out
// of the prison to the quarry”. Which to carry over: “A's sun through boards (Recommended)”. Shown the castle hall (the
// pictures in docs/mockups/town_look: castle_hall.png, castle_phone.png, castle_sheet.png): “Yes, make it game-ready
// (Recommended)”, offered as: built the game's way, shown to you beside this picture, then handed to the main chat.
//
// WHAT IS HERE, each in the game's own measures (picture pixels, two to a game pixel; a tile a diamond 64 x 32), anchored as
// the game's own are, laid on the town as game/level.ts makes it (its floor x 6 to 21, y 6 to 19; its two back walls, the one
// at y 5 along x and the one at x 5 along y; the gate's doorway x 13 to 15 in the first; game/ways.ts):
//   floor(tx, ty)       THE HALL'S FLAGS: pale flags a tile each, a carved border, worn lighter where they walk, moss in the
//                       joints and creeping out from the walls' feet (each tile its own: the town is one place)
//   tiles               laid over them: MOSS, GRASS AND FLOWERS IN THE JOINTS
//   sun(tx, ty)         THE SUN'S SLATS on the floor: the gold light through the gaps in the boarded windows, worked out ray by
//                       ray (so each slat is its gap's own shape); a picture of LIGHT, drawn added, or null where none falls
//   face(alongX,tx,ty)  THE CASTLE'S WALL a tile at a time, as the game lays walls (along x turned to screen-left and lit, along
//                       y to screen-right in shade), as high as the town's walls (80): its thick dressed stone in deep courses,
//                       the chamfered plinth, moss low down, IVY climbing and flowering; THE TALL WINDOWS of two lights deep in
//                       the wall, HASTILY BOARDED (odd planks nailed crooked, a cart wheel wedged against one, a door off its
//                       hinges against two), the day through the gaps; the quoins of the gate's jambs beside it
//   roof                THE STONE ABOVE THE GAME'S 80 AND THE GREAT HALL'S ROOF, one picture over the dark above the back walls
//                       (never over the floor): the walls going on up to 140, the windows' round heads and their tympanums, the
//                       CORBEL TABLE along the top, the ivy hanging from it; the HIPPED TIMBER ROOF over it, its wall plate,
//                       hip rafter, principal rafters over the trusses, purlins, common rafters, boards, a chink of day
//   pieces              THE TRUSSES (a hammer-beam truss on the wall along x, a wall post and arch brace on the wall along y,
//                       each on its carved stone corbel); THE SUN IN THE AIR through each window (light, added); THE PLANTS
//                       (potted herbs, flowers, a bay tree, a fern; ivy at a wall's foot); a pillar of the hall, ivy up it
//   gate                THE BARRED GATE OUT TO THE QUARRY, the game's own portcullis fitting unchanged: its pillar (the jamb's
//                       quoins), its arch (a ring of thirteen voussoirs, a keystone, a hood mould; the wall over the doorway),
//                       and THE PASSAGE AND THE DAY BEYOND seen through it (drawn with the floor, as floor 1's stairs up are)
//   stairs(way)         THE STAIRS DOWN TO FLOOR 1 (art/town_ways.ts `townStairs`: its size, anchor and shape pixel for pixel),
//                       the hall's stone turning to floor 1's mossy stone on the way down
//   owl                 THE OWL on its hammer beam over the smithy, alive (art/hall_owl.ts): its frames and its loop
//
// NOT PAINTED IN: the dark and the light. As everywhere in the game the renderer lays its dark (the town's own, 0.45) and cuts a
// hole where each light burns (render.ts, light). What the main chat should place: CASTLE_LIGHTS here and docs/mockups/
// town_look/README.md ("Made game-ready"). The sun's slats and its light in the air are pictures of light, drawn ADDED to what
// is under them (globalCompositeOperation 'lighter'), as floor 1's daylight is.
//
// NOT CHANGED: every townsperson, the vendors' places, the ring, the Lexicon, the stash, the waypoint, the shaft's head and its
// cage, the braziers, barrels and urn are the game's own pictures, in their places, as they are.
//
// His art rulebook kept: crisp pixels; one camera; light from the upper left (a face turned to screen-left lit, one to screen-
// right in shade); a dark base, the place's own colours darker than the darkest word (the light makes it bright); daylight
// warm and honest; nothing cyan, nothing pink.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Iso } from './isokit';
import { GRAIN, hash } from './kit';
import type { Piece, PieceKind } from './floorkit';
import { ARCH, ARCH_WIDE, Flat, PILLAR, SPAN, curveOf, inWay } from './gates';
import type { Strip } from './gates';
import { VAULT } from './ground';
import type { Theme } from './ground';
import { makeStairwellOf } from './crypt_ways';
import { TOWN_STAIRS } from './town_ways';
import { Scene } from './floor4';
import type { V3 } from './floor4';
import { OWL_LOOP, OWL_LOOP_SECS, owlFrameAt, owlFrames } from './hall_owl';

/** THE SWITCH: off until the main chat puts it in, on his yes. */
export const CASTLE_HALL = { on: false };

// =================================================================================================
// MEASURES

const TW = 64;
const TH = 32;
const HALF = TW / 2;
/** How high the town's walls stand (picture pixels: the game's WALL_LOOK.tall, 40, at two to a game pixel). */
export const CH_WALL = 80;
/** How high the castle's stone stands (the roof springs from its top): the faces to CH_WALL, the rest in `roof`. */
export const CASTLE_TOP = 140;
/** The roof's pitch: picture pixels up for a tile in from a wall. How far in it is drawn (tiles). */
export const CASTLE_PITCH = 60;
export const ROOF_IN = 7;
/** The town's hall (game/level.ts TOWN: its floor x 6 to 21, y 6 to 19; here as the far edges and the near ends of its floor). */
export const HALL = { x0: 6, y0: 6, x1: 22, y1: 20 };
/** The gate's doorway in the wall along x (game/ways.ts TOWN_GATE: its first tile, its line), its middle. */
export const GATE_AT = { a: 13, line: 5 };
const GATE_MID = GATE_AT.a + 1.5;

// =================================================================================================
// THE CASTLE HALL'S COLOURS (the look he said yes to: docs/mockups/town_look, PALS.castle): a warm grey dressed stone, its
// flags; the roof's timber; the barricades' planks of two woods; moss, ivy, terracotta. Brought down under the darkest word
// (his Colour 4): the light makes it bright. Five tones a material: its seam, its shade, its body, its light, its lit edge.

export type R5 = readonly [string, string, string, string, string];
function hexOf(c: string): [number, number, number] {
  const n = parseInt(c.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex(r: number, g: number, b: number): string {
  const f = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
}
const down = (r: readonly string[], k: number): R5 => r.map((c) => {
  const [a, b, d] = hexOf(c);
  return toHex(a * k, b * k, d * k);
}) as unknown as R5;
const downOne = (c: string, k: number): string => down([c, c, c, c, c], k)[0];

export const STONE: R5 = down(['#37332d', '#58524a', '#776f63', '#938a7c', '#aea595'], 0.56);
export const FLAGS: R5 = down(['#332e27', '#524b40', '#6c6455', '#837a69', '#978e7c'], 0.65);
export const WOOD: R5 = down(['#22170e', '#3a2818', '#553c25', '#6e5032', '#866240'], 0.86);
export const PLANK: R5 = down(['#2a2018', '#46382a', '#615039', '#7a684c', '#92805e'], 0.72);
export const PLANK2: R5 = down(['#2b1d14', '#4a3222', '#664630', '#805c40', '#987250'], 0.76);
export const IRON: R5 = ['#121010', '#211d1b', '#332d29', '#463e38', '#5e544a'];
export const MOSS: R5 = down(['#1e2a12', '#2e4018', '#40561f', '#547028', '#688632'], 0.76);
export const LEAF: R5 = down(['#13240f', '#1f3a16', '#2e521d', '#3f6a26', '#548432'], 0.78);
export const POT: R5 = down(['#3a1e12', '#5c2f1a', '#7e4328', '#9a5834', '#b26c44'], 0.74);
export const BOARDS: R5 = down(['#18110b', '#271c12', '#36271a', '#463322', '#57402b'], 0.9);
/** Flowers in the ivy, the pots and the joints: a few honest colours (none pink, none cyan), a little dimmed. */
export const FLOWERS: readonly string[] = ['#f2d24a', '#f6f0dc', '#e8742c', '#8c78d8', '#d8402c'].map((c) => downOne(c, 0.62));
const SEAM = downOne('#25211b', 0.8);
const BEYOND = '#0b0a08';
/**
 * THE DAY outside, seen through the gaps in the boards, a chink in the roof, and through the gate: light, not the place's own
 * (never shaded, never graded): what the eye sees of the morning outside.
 */
export const DAY = { gap: '#fff0c4', gapDim: '#e8d6a6', road: ['#b8a47a', '#d4c094', '#e2d0a6'] as const, grass: ['#86a04a', '#9cb256'] as const, block: ['#cfc4ac', '#efe6d2'] as const };
/** What is light of itself here: never shaded. */
const LIGHTS = new Set<string>([DAY.gap, DAY.gapDim, ...DAY.road, ...DAY.grass, ...DAY.block]);

/**
 * THE SUN, A's low morning gold, as LIGHT to add (its pictures are drawn added: 'lighter'): on the floor, a slat's rim and its
 * core; in the air, three steps and its motes. Its glow (the renderer's) at a window and at the gate.
 */
export const SUN = {
  slat: ['#46341a', '#7e5e2a'] as const,
  air: ['#1a160c', '#302918', '#4a3f24'] as const,
  mote: '#6a5c3a',
  glow: '#ffdf9a',
  day: '#ffe9b8',
};

const clampK = (k: number): number => Math.max(0, Math.min(4, k));
const mod = (a: number, n: number): number => ((a % n) + n) % n;
const mixMemo = new Map<string, string>();
export function mixC(a: string, b: string, k: number): string {
  const key = `${a}${b}${Math.round(k * 1000)}`;
  const hit = mixMemo.get(key);
  if (hit) return hit;
  const [r0, g0, b0] = hexOf(a);
  const [r1, g1, b1] = hexOf(b);
  const out = toHex(r0 + (r1 - r0) * k, g0 + (g1 - g0) * k, b0 + (b1 - b0) * k);
  if (mixMemo.size < 200000) mixMemo.set(key, out);
  return out;
}
/** Plain smooth noise (the mock-up's, the same numbers). */
export function noise(x: number, y: number, k = 0): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(i, j, k) + (hash(i + 1, j, k) - hash(i, j, k)) * sx;
  const b = hash(i, j + 1, k) + (hash(i + 1, j + 1, k) - hash(i, j + 1, k)) * sx;
  return a + (b - a) * sy;
}
const fbm = (x: number, y: number, k = 0): number => 0.55 * noise(x, y, k) + 0.3 * noise(x * 2.1, y * 2.1, k + 11) + 0.15 * noise(x * 4.3, y * 4.3, k + 23);

/** The diamond's half width at a row, and where in its tile a pixel is (u to screen right-down, v to screen left-down), as art/ground.ts has them. */
const halfWidth = (y: number): number => (y < TH / 2 ? 2 * y + 1 : 2 * (TH - 1 - y) + 1);
function onTile(x: number, y: number): [number, number] {
  const px = x + 0.5 - HALF;
  const py = y + 0.5;
  return [(px / HALF + py / (TH / 2)) / 2, (py / (TH / 2) - px / HALF) / 2];
}
/** A floor tile's picture from a painter of the world (x, y in tiles; tx, ty the tile's own top corner). Anchored at its top corner. */
function tileOf(paint: (x: number, y: number, px: number, py: number) => string | null, tx: number, ty: number): Sprite {
  const p = new Px(TW, TH);
  for (let y = 0; y < TH; y++) {
    const hw = halfWidth(y);
    for (let x = HALF - hw; x < HALF + hw; x++) {
      const [u, v] = onTile(x, y);
      const c = paint(tx + u, ty + v, x, y);
      if (c) p.set(x, y, c);
    }
  }
  return p.sprite(HALF, 0, GRAIN);
}
/** No pixel left alone (a speck on its own reads as noise). */
function noLone(p: Px): void {
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    if (!p.has(x, y)) continue;
    let nb = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && p.has(x + dx, y + dy)) nb++;
    if (nb === 0) p.erase(x, y);
  }
}

// =================================================================================================
// THINGS THAT STAND, painted in depth: for every pixel the line of sight is followed into the thing and the first point inside it
// is what is seen (as floor 1's pieces are). World in tiles (x down the screen to the right, y down to the left), z up in picture
// pixels.

type Face = 'x' | 'y' | 'z' | 'in';
interface Solid {
  box: { x0: number; y0: number; z0: number; x1: number; y1: number; z1: number };
  inside: (x: number, y: number, z: number) => boolean;
  shade: (x: number, y: number, z: number, face: Face) => string | null;
}
class Deep {
  readonly dep: Float32Array;
  constructor(readonly p: Px, readonly ox: number, readonly oy: number) {
    this.dep = new Float32Array(p.w * p.h).fill(-1e9);
  }
  at(x: number, y: number, z = 0): [number, number] {
    return [this.ox + (x - y) * 32, this.oy + (x + y) * 16 - z];
  }
  put(x: number, y: number, d: number, c: string | null): boolean {
    x = Math.floor(x);
    y = Math.floor(y);
    if (c === null || x < 0 || y < 0 || x >= this.p.w || y >= this.p.h) return false;
    const i = y * this.p.w + x;
    if (d < this.dep[i]) return false;
    this.dep[i] = d;
    this.p.set(x, y, c);
    return true;
  }
  march(s: Solid, step = 0.01): void {
    const b = s.box;
    const corners: [number, number][] = [];
    for (const x of [b.x0, b.x1]) for (const y of [b.y0, b.y1]) for (const z of [b.z0, b.z1]) corners.push(this.at(x, y, z));
    const minX = Math.max(0, Math.floor(Math.min(...corners.map((c) => c[0]))));
    const maxX = Math.min(this.p.w - 1, Math.ceil(Math.max(...corners.map((c) => c[0]))));
    const minY = Math.max(0, Math.floor(Math.min(...corners.map((c) => c[1]))));
    const maxY = Math.min(this.p.h - 1, Math.ceil(Math.max(...corners.map((c) => c[1]))));
    for (let py = minY; py <= maxY; py++) {
      const sy = py + 0.5 - this.oy;
      for (let px = minX; px <= maxX; px++) {
        const q = (px + 0.5 - this.ox) / 32;
        let lo = Math.max(2 * b.x0 - q, 2 * b.y0 + q, (b.z0 + sy) / 16);
        const hi = Math.min(2 * b.x1 - q, 2 * b.y1 + q, (b.z1 + sy) / 16);
        if (hi <= lo) continue;
        const seen = this.dep[py * this.p.w + px];
        if (hi < seen) continue;
        lo = Math.max(lo - step, seen);
        const pt = (t: number): [number, number, number] => [(t + q) / 2, (t - q) / 2, 16 * t - sy];
        let prevT: number | null = null;
        for (let t = hi; t >= lo; t -= step) {
          let [x, y, z] = pt(t);
          if (s.inside(x, y, z)) {
            let tIn = t;
            if (prevT !== null) {
              let tOut = prevT;
              for (let k = 0; k < 6; k++) {
                const m = (tIn + tOut) / 2;
                const [mx, my, mz] = pt(m);
                if (s.inside(mx, my, mz)) tIn = m;
                else tOut = m;
              }
              [x, y, z] = pt(tIn);
            }
            let face: Face = 'in';
            if (prevT !== null) {
              const e = 0.006;
              const [ox, oy, oz] = pt(tIn + e);
              if (!s.inside(ox, y, z)) face = 'x';
              else if (!s.inside(x, oy, z)) face = 'y';
              else if (!s.inside(x, y, oz)) face = 'z';
            } else face = t >= hi - 1e-6 ? (hi === 2 * b.x1 - q ? 'x' : hi === 2 * b.y1 + q ? 'y' : 'z') : 'in';
            this.put(px, py, tIn, s.shade(x, y, z, face));
            break;
          }
          prevT = t;
        }
      }
    }
  }
}
/** A face's tone by which way it looks: up and screen-left lit, screen-right in shade. */
const faceK = (face: Face): number => (face === 'z' ? 3 : face === 'y' ? 3 : face === 'x' ? 1 : 2);
/** A thing painted into a picture with a depth (the floor's (0, 0) at (AX, AY) on it): whole game pixels, no pixel alone. */
function pic(W: number, H: number, AX: number, AY: number, paint: (D: Deep) => void): Sprite {
  const p = new Px(W, H);
  paint(new Deep(p, AX, AY));
  noLone(p);
  return p.sprite(AX, AY, GRAIN);
}

// =================================================================================================
// THE WINDOWS AND THEIR BARRICADES (the castle hall's, as he saw them): tall windows of two lights under round heads, a stone
// mullion between, set deep in the thick wall (a splayed embrasure under one round arch, a little round opening in its
// tympanum); BOARDED OVER IN A HURRY, as high as they could reach: odd planks of two woods nailed crooked, overhanging onto the
// stone, one nailed up and down over the rest; a CART WHEEL wedged against one, A DOOR off its hinges against two others. Four
// in the wall along y (the sun's side), two in the wall along x. The day shows through the gaps, and through them the sun
// comes in.

interface Plank { u: number; v: number; ang: number; len: number; w: number; wood: 0 | 1; seed: number }
interface WheelAt { u: number; v: number; r: number }
interface DoorAt { u: number; v: number; w: number; h: number; ang: number }
/** A window: its wall ('L' along y, at x = 6; 'R' along x, at y = 6), its middle along it (tiles), its lights, what is wedged against it, its planks. */
export interface Win { wall: 'L' | 'R'; c: number; half: number; sill: number; spring: number; mull: number; splay: number; brace: 'wheel' | 'door' | null; planks: Plank[]; wheel: WheelAt; door: DoorAt }
/** The castle's windows: the two lights' half width, the mullion's, the sill, where the heads spring, the embrasure's splay. */
export const CWIN = { half: 17, mull: 2.5, sill: 18, spring: 84, splay: 8 };
function makeWin(wall: 'L' | 'R', c: number, brace: 'wheel' | 'door' | null, seed: number): Win {
  const { half, sill, spring, splay } = CWIN;
  const outer = half + splay;
  const planks: Plank[] = [];
  const wheel: WheelAt = { u: 3, v: 36, r: 23 };
  const door: DoorAt = { u: -3, v: 44, w: 50, h: 76, ang: -0.12 };
  const top = spring - 4;
  const from = brace === 'door' ? door.v + door.h / 2 - 6 : brace === 'wheel' ? wheel.v + wheel.r - 4 : sill + 4;
  let v = from;
  let i = 0;
  while (v < top && i < 12) {
    const h = (k: number): number => hash(i, seed, k);
    const w = 7 + Math.floor(h(1) * 5);
    const ang = (h(2) - 0.5) * 0.5 * (h(3) < 0.25 ? 1.7 : 1);
    const len = 2 * outer + 8 + h(4) * 20;
    planks.push({ u: (h(5) - 0.5) * 12, v: v + w / 2, ang, len, w, wood: h(6) < 0.55 ? 0 : 1, seed: seed * 31 + i });
    v += w + 3 + Math.floor(h(7) * 7);
    i++;
  }
  if (hash(seed, 3, 9) > 0.35) planks.push({ u: (hash(seed, 4, 9) - 0.5) * 20, v: (sill + top) / 2 + 2, ang: Math.PI / 2 + (hash(seed, 5, 9) - 0.5) * 0.5, len: top - sill + 4, w: 8, wood: 1, seed: seed * 31 + 40 });
  return { wall, c, half, sill, spring, mull: CWIN.mull, splay, brace, planks, wheel, door };
}
/** THE WINDOWS: four in the wall along y (the sun's side), between its trusses; two in the wall along x. */
export const WINDOWS: readonly Win[] = [
  makeWin('L', 8.5, null, 11),
  makeWin('L', 11.5, 'wheel', 13),
  makeWin('L', 14.5, null, 41),
  makeWin('L', 17.5, 'door', 17),
  makeWin('R', 8.7, 'door', 23),
  makeWin('R', 18.75, null, 29),
];
/** The trusses' places: on the wall along x (hammer-beam trusses, none over the gate) and on the wall along y (between its windows). */
export const TRUSSES_X = [7.5, 10.5, 17.5, 20.5] as const;
export const TRUSSES_Y = [10, 13, 16] as const;

function inOpening(W: Win, u: number, v: number): boolean {
  if (Math.abs(u) >= W.half || v < W.sill) return false;
  const au = Math.abs(u);
  if (au <= W.mull) return false;
  if (v < W.spring) return true;
  const rl = (W.half - W.mull) / 2;
  return Math.hypot(au - (W.half + W.mull) / 2, v - W.spring) < rl;
}
function inEmbrasure(W: Win, u: number, v: number): boolean {
  const o = W.half + W.splay;
  if (Math.abs(u) >= o || v < W.sill - 6) return false;
  if (v < W.spring) return true;
  return Math.hypot(u, v - W.spring) < o;
}
type Cover = { kind: 'plank'; p: Plank; a: number; b: number } | { kind: 'wheel'; part: 'rim' | 'spoke' | 'hub'; ang: number; r: number; R: number } | { kind: 'door'; a: number; b: number; w: number; h: number };
function coverAt(W: Win, u: number, v: number): Cover | null {
  if (W.brace === 'wheel') {
    const WH = W.wheel;
    const du = u - WH.u;
    const dv = v - WH.v;
    const r = Math.hypot(du, dv);
    if (r < WH.r) {
      const ang = Math.atan2(dv, du);
      if (r > WH.r - 4) return { kind: 'wheel', part: 'rim', ang, r, R: WH.r };
      if (r < 5) return { kind: 'wheel', part: 'hub', ang, r, R: WH.r };
      const sp = mod(ang + 0.2, Math.PI / 4);
      if (Math.abs(sp - Math.PI / 8) * r < 1.6) return { kind: 'wheel', part: 'spoke', ang, r, R: WH.r };
    }
  }
  if (W.brace === 'door') {
    const DR = W.door;
    const du = u - DR.u;
    const dv = v - DR.v;
    const c = Math.cos(DR.ang);
    const s = Math.sin(DR.ang);
    const a = du * c + dv * s;
    const b = -du * s + dv * c;
    if (Math.abs(a) < DR.w / 2 && Math.abs(b) < DR.h / 2) return { kind: 'door', a: a + DR.w / 2, b: b + DR.h / 2, w: DR.w, h: DR.h };
  }
  for (let i = W.planks.length - 1; i >= 0; i--) {
    const p = W.planks[i];
    const du = u - p.u;
    const dv = v - p.v;
    const c = Math.cos(p.ang);
    const s = Math.sin(p.ang);
    const a = du * c + dv * s;
    const b = -du * s + dv * c;
    if (Math.abs(a) < p.len / 2 && Math.abs(b) < p.w / 2) return { kind: 'plank', p, a: a + p.len / 2, b: b + p.w / 2 };
  }
  return null;
}
/** Is a point of a window's face a gap the day comes through? */
export function gapAt(W: Win, u: number, v: number): boolean {
  return inOpening(W, u, v) && coverAt(W, u, v) === null;
}
function winOn(wall: 'L' | 'R', along: number): Win | null {
  for (const W of WINDOWS) if (W.wall === wall && Math.abs((along - W.c) * 32) < W.half + W.splay + 14) return W;
  return null;
}
function coverColour(cv: Cover, dn: number): string {
  if (cv.kind === 'plank') {
    const R = cv.p.wood ? PLANK2 : PLANK;
    const { a, b, p } = cv;
    if (b > p.w - 1.2) return R[clampK(4 - dn)];
    if (b < 1.2) return R[0];
    if (a < 1 || a > p.len - 1) return R[1];
    const nail = [6, p.len - 6].some((na) => Math.abs(a - na) < 1.2 && (Math.abs(b - p.w * 0.3) < 1.2 || Math.abs(b - p.w * 0.72) < 1.2));
    if (nail) return Math.abs(b - p.w * 0.72) < 1.2 ? IRON[3] : IRON[1];
    const grain = Math.abs(mod(b * 1.0 + Math.sin(a * 0.11 + p.seed) * 1.6, 3.3) - 1.6);
    let k = 2;
    if (grain < 0.35) k = 1;
    if (hash(Math.floor(a / 9), p.seed, 3) > 0.8) k += 1;
    if (Math.abs(b - p.w * 0.5 - Math.sin(a * 0.07 + p.seed) * 1.5) < 0.5 && hash(p.seed, 0, 5) > 0.5 && a > p.len * 0.3 && a < p.len * 0.7) return R[0];
    return R[clampK(k - dn)];
  }
  if (cv.kind === 'wheel') {
    const W = WOOD;
    if (cv.part === 'hub') return cv.r < 2 ? IRON[2] : W[clampK(3 - dn)];
    if (cv.part === 'rim') {
      if (cv.r > cv.R - 1.4) return cv.ang < -0.4 && cv.ang > -2.6 ? IRON[1] : IRON[3];
      if (mod(cv.ang + 0.4, Math.PI / 3) < 0.06) return W[0];
      return W[clampK((cv.ang > 0.6 && cv.ang < 2.6 ? 3 : 2) - dn)];
    }
    return W[clampK(2 - dn)];
  }
  const R = PLANK2;
  const { a, b, w: DW, h: DH } = cv;
  const l1 = DH * 0.22;
  const l2 = DH * 0.77;
  if (a < 1.2 || b > DH - 1.2) return R[clampK(4 - dn)];
  if (a > DW - 1.2 || b < 1.2) return R[0];
  if (Math.abs(b - l1) < 4 || Math.abs(b - l2) < 4) return Math.abs(b - l1) > 3 || Math.abs(b - l2) > 3 ? R[clampK(3 - dn)] : R[clampK(2 - dn)];
  if (mod(a, 11.5) < 1) return R[0];
  if (Math.hypot(a - DW * 0.78, b - DH / 2) < 3.2 && Math.hypot(a - DW * 0.78, b - DH / 2) > 1.8) return IRON[3];
  return R[clampK((hash(Math.floor(a / 11.5), 3, 77) > 0.5 ? 2 : 1) + 1 - dn)];
}

// =================================================================================================
// THE SUN: a low morning sun from the upper left (a ray goes 1/12.5 of a tile toward -x and 1/40 toward -y for each picture
// pixel up), in only through the gaps in the boarded windows of the wall along y.

export const SUN_DIR: readonly [number, number] = [1 / 12.5, 1 / 40];
/** Is a point in the hall in the sun (through window `only`, or any)? */
export function sunAt(x: number, y: number, z: number, only: Win | null = null): boolean {
  const [a, b] = SUN_DIR;
  const dzL = x > HALL.x0 ? (x - HALL.x0) / a : 0;
  const dzR = y > HALL.y0 ? (y - HALL.y0) / b : 0;
  if (dzR < dzL) return false;
  const zz = z + dzL;
  if (zz >= CASTLE_TOP) return false;
  const yy = y - b * dzL;
  const W = only ?? winOn('L', yy);
  return !!W && W.wall === 'L' && gapAt(W, (yy - W.c) * 32, zz);
}

// =================================================================================================
// THE CASTLE'S WALLS: its own thick DRESSED STONE in deep courses of big blocks, each dressed with a drafted margin (its upper
// and left edges catching the light, its lower and right in shade), some tooled, some a shade apart, a putlog hole here and
// there; a chamfered plinth, moss in it and in the joints low down; THE CORBEL TABLE along the top (in `roof`); IVY climbing
// high from the foot, hanging from the corbels; the windows; the gate's jambs.

function ashlar(lit0: boolean, s: number, up: number, seed: number): string {
  const S = STONE;
  const dn = lit0 ? 0 : 1;
  const CH = 18;
  const cv = up - 14;
  const row = Math.floor(cv / CH);
  const lv = mod(cv, CH);
  const off = Math.floor(hash(row, seed, 1) * 60);
  const L = 36 + Math.floor(hash(row, seed, 2) * 22);
  const uu = s + off + 600;
  const bk = Math.floor(uu / L);
  const lu = mod(uu, L);
  if (lv === CH - 1 || lu === 0) {
    if (up < 60 && fbm(s / 20, up / 14, seed + 5) > 0.58) return MOSS[clampK(1 + (lit0 ? 1 : 0))];
    return SEAM;
  }
  let kk = 2;
  const tone = hash(bk, row * 7 + seed, 3);
  if (tone < 0.16) kk -= 1;
  else if (tone > 0.86) kk += 1;
  if (lv === CH - 2) kk += 1;
  if (lu === 1) kk += lit0 ? 1 : 0;
  if (lv === 0) kk -= 1;
  if (lu === L - 1) kk -= 1;
  if (hash(bk, row, seed + 11) > 0.62 && lv > 1 && lv < CH - 2 && lu > 1 && lu < L - 1 && mod(lu + lv * 0.6, 4) < 1) kk -= 1;
  if (hash(bk, row, seed + 13) > 0.965 && Math.abs(lu - L / 2) < 3 && Math.abs(lv - CH / 2) < 3) return Math.abs(lu - L / 2) < 2 && lv > CH / 2 - 3 ? BEYOND : S[0];
  if (hash(bk, row, seed + 9) > 0.8 && lv > CH - 6 && lu < 5) kk -= 1;
  let c = S[clampK(kk - dn)];
  if (up < 34 && fbm(s / 18, up / 10, seed + 7) > 0.6) c = MOSS[clampK(kk - dn)];
  else if (up < 24) c = mixC(c, S[0], 0.14);
  return c;
}
function corbelTable(lit0: boolean, s: number, up: number): string | null {
  const S = STONE;
  const dn = lit0 ? 0 : 1;
  const top = CASTLE_TOP;
  if (up >= top - 7) {
    if (up === top - 1) return S[clampK(4 - dn)];
    if (up === top - 7) return S[0];
    if (mod(s, 44) < 1) return SEAM;
    return S[clampK(3 - dn)];
  }
  if (up >= top - 19) {
    const cs = mod(s, 16);
    const vv = top - 8 - up;
    const w = vv < 4 ? 8 : vv < 8 ? 6 : 4;
    if (cs >= 8 - w / 2 && cs < 8 + w / 2) {
      if (cs < 8 - w / 2 + 1) return S[clampK((lit0 ? 4 : 3) - dn)];
      if (cs >= 8 + w / 2 - 1) return S[clampK(1 - dn)];
      if (vv === 3 || vv === 7) return S[clampK(1 - dn)];
      return S[clampK(2 - dn)];
    }
    return mixC(S[clampK(1 - dn)], '#000000', vv < 3 ? 0.35 : 0.15);
  }
  return null;
}
function ivyAt(s: number, up: number, seed: number, dn: number): string | null {
  const pitch = 84;
  const c0 = Math.floor(s / pitch);
  let hit = false;
  for (let c = c0 - 1; c <= c0 + 1 && !hit; c++) {
    if (hash(c, seed, 401) > 0.6) continue;
    const x0 = c * pitch + hash(c, seed, 403) * pitch;
    const reach = 40 + hash(c, seed, 405) * 80;
    const wob = Math.sin(up * 0.07 + c * 2.1) * 9;
    const wide = (16 + hash(c, seed, 407) * 16) * (1 - (up / (reach + 1)) ** 2) + 3;
    if (up < reach && Math.abs(s - x0 - wob) < wide && fbm(s / 6, up / 6, seed + c) > 0.38 + (up / reach) * 0.18) hit = true;
    if (!hit && up < reach * 1.5 && up > reach * 0.6 && Math.abs(s - x0 - Math.sin(up * 0.11 + c) * 6) < 2.5 && hash(c, seed, 409) > 0.4) hit = fbm(s / 4, up / 4, seed + c * 3) > 0.32;
  }
  if (!hit && up > CASTLE_TOP - 60) {
    const hc = Math.floor(s / 64);
    if (hash(hc, seed, 411) < 0.55) {
      const hx = hc * 64 + hash(hc, seed, 413) * 44;
      const len = 14 + hash(hc, seed, 415) * 36 + Math.sin(s * 0.3) * 3;
      if (Math.abs(s - hx - 10) < 14 - (CASTLE_TOP - up) * 0.12 && up > CASTLE_TOP - 7 - len && fbm(s / 5, up / 5, seed + 9) > 0.4) hit = true;
    }
  }
  if (!hit) return null;
  const lf = hash(s >> 1, up >> 1, seed + 417);
  if (lf > 0.982) return FLOWERS[Math.floor(hash(s >> 1, up >> 1, seed + 419) * FLOWERS.length)];
  const k = lf > 0.72 ? 4 : lf > 0.45 ? 3 : lf > 0.18 ? 2 : 1;
  return LEAF[clampK(k - dn)];
}
/** The gate's quoins up its jambs either side of the way (long and short in turn), in the wall along x: a colour, or null. */
function quoinAt(s: number, up: number): string | null {
  const S = STONE;
  const du = s / 32 - GATE_MID;
  const au = Math.abs(du * 32);
  const half = SPAN / 2;
  if (up >= ARCH.spring || au < half) return null;
  const lightSide = du < 0;
  const course = Math.floor(up / 14);
  const lv = mod(up, 14);
  const w = course % 2 ? 22 : 14;
  if (au >= half + w) return null;
  if (lv === 13) return SEAM;
  if (au > half + w - 1.2) return SEAM;
  if (lv === 12) return S[lightSide ? 4 : 3];
  return S[lightSide ? 3 : 2];
}
/**
 * THE CASTLE'S WALL at a point: `s` along it in picture pixels (a tile 32), `up` over its foot. The wall along x is lit, the
 * wall along y a tone down. A colour (the day where a window's gap is).
 */
export function castleFace(alongX: boolean, s: number, up: number): string {
  const wall: 'L' | 'R' = alongX ? 'R' : 'L';
  const lit0 = alongX;
  const dn = lit0 ? 0 : 1;
  const seed = alongX ? 19 : 17;
  const S = STONE;
  const ct = corbelTable(lit0, s, up);
  if (ct) {
    const iv = up < CASTLE_TOP - 7 ? ivyAt(s, up, seed, dn) : null;
    return iv ?? ct;
  }
  const along = s / 32;
  const W = winOn(wall, along);
  if (W) {
    const u = (along - W.c) * 32;
    const cv = coverAt(W, u, up);
    const emb = inEmbrasure(W, u, up);
    const o = W.half + W.splay;
    if (cv && (emb || Math.abs(u) < o + 12)) return coverColour(cv, dn);
    if (inOpening(W, u, up)) return up > W.spring ? DAY.gapDim : DAY.gap;
    if (emb) {
      const au = Math.abs(u);
      if (au <= W.mull && up < W.spring + 9) return u < 0 === (wall === 'L') ? S[clampK(3 - dn)] : S[clampK(2 - dn)];
      if (up < W.sill) return S[clampK((up > W.sill - 2 ? 4 : 3) - dn)];
      if (up >= W.spring && au < W.half) {
        const oc = Math.hypot(u, up - W.spring - 13);
        if (oc < 4) return oc < 2.5 ? PLANK[1] : S[0];
        return mod(up, 9) < 1 ? SEAM : S[clampK(1 - dn)];
      }
      if (up >= W.spring && Math.hypot(u, up - W.spring) > o - W.splay) {
        const ang = Math.atan2(up - W.spring, u);
        return ang > 0.55 && ang < Math.PI - 0.55 ? S[0] : (u > 0) === (wall === 'L') ? S[clampK(1 - dn)] : S[clampK(3 - dn)];
      }
      const toLight = (u > 0) !== (wall === 'L');
      const deep = (au - W.half) / W.splay;
      if (deep < 0.2) return S[0];
      return toLight ? S[clampK((deep > 0.75 ? 4 : 3) - dn)] : S[clampK(1 - dn)];
    }
    const ring = Math.abs(u) < o + 3 && up >= W.sill - 9 && (up < W.spring || Math.hypot(u, up - W.spring) < o + 3);
    if (ring) {
      if (up < W.sill - 6) return S[clampK((up === W.sill - 7 ? 4 : 2) - dn)];
      return S[clampK((((u > 0) === (wall === 'L')) || up > W.spring + 14 ? 4 : 1) - dn)];
    }
    if (coverAt(W, u - 1, up + 2) && Math.abs(u) < o + 13) return mixC(ashlar(lit0, s, up, seed), '#000000', 0.4);
  }
  if (alongX) {
    const q = quoinAt(s, up);
    if (q) return q;
  }
  const iv = ivyAt(s, up, seed, dn);
  if (iv) return iv;
  if (up < 14) {
    if (fbm(s / 16, up / 6, seed + 3) > 0.56) return MOSS[clampK((up > 9 ? 3 : 2) - dn)];
    if (up === 13 || up === 12) return S[clampK(4 - dn)];
    if (up === 11) return S[clampK(3 - dn)];
    if (up === 10) return SEAM;
    if (mod(s + 17, 52) < 1) return SEAM;
    if (up < 2) return S[clampK(1 - dn)];
    return S[clampK(2 - dn)];
  }
  return ashlar(lit0, s, up, seed);
}

/**
 * A TILE OF THE CASTLE'S WALL: its one face, as the game's walls are laid (art/ground.ts, a face alone): along x its face turned
 * to screen-left, along y to screen-right, standing on the tile's near edge, CH_WALL high, `along` the tile's place along its
 * wall (tx along x, ty along y). Whole to its top (the castle's stone goes on up in `roof`, so it does not fade), its joint
 * filled (the stone is laid on along the wall, its windows across two tiles). Anchored at the floor point of the tile's top corner.
 */
function wallTile(alongX: boolean, along: number): Sprite {
  const H = CH_WALL;
  const p = new Px(TW, TH + H);
  const iso = new Iso(p, HALF, H);
  const shade = (_u: number, v: number, _w: number, h: number, px: number): string | null => {
    const up = h - 1 - v;
    const J = alongX ? px : TW - 1 - px;
    return castleFace(alongX, along * 32 + J, up);
  };
  if (alongX) iso.left(0, 1, 1, 0, H, shade);
  else iso.right(1, 0, 1, 0, H, shade);
  return p.sprite(HALF, H, GRAIN);
}

// =================================================================================================
// THE FLOOR: pale flags a tile each with a carved border (as floor 1's), worn lighter where they walk; moss in the joints, and
// creeping out from the walls' feet

function flagT(x: number, y: number, seed: number): number {
  const fu = x - Math.floor(x);
  const fv = y - Math.floor(y);
  const e = Math.min(fu, fv, 1 - fu, 1 - fv);
  if (e < 0.025) return -1;
  if (e < 0.06) return fu < 0.06 || 1 - fv < 0.06 ? 4 : 1;
  const tone = hash(Math.floor(x), Math.floor(y), seed);
  let k = tone < 0.22 ? 1 : tone > 0.88 ? 3 : 2;
  const n = fbm(x * 5, y * 5, seed + 2);
  if (n > 0.66) k += 1;
  if (n < 0.3) k -= 1;
  if (hash(Math.floor(x), Math.floor(y), seed + 4) > 0.78 && Math.abs(fv - 0.5 - (fu - 0.5) * 0.7 + Math.sin(fu * 13) * 0.04) < 0.014) return -1;
  return clampK(k);
}
/** The hall's floor at a point of the world, before anything is laid over it. */
export function hallFloorAt(x: number, y: number): string {
  const F = FLAGS;
  const f = flagT(x, y, 911);
  let c = f < 0 ? SEAM : F[f];
  if (f >= 0 && fbm(x * 1.1, y * 1.1, 913) > 0.6) c = F[clampK(f + 1)];
  if (f < 0) {
    const g = fbm(x * 4, y * 4, 915);
    if (g > 0.56) c = MOSS[g > 0.62 ? 3 : 2];
  }
  const nf = Math.min(x - HALL.x0, y - HALL.y0);
  if (nf >= 0 && nf < 0.5 && fbm(x * 6, y * 6, 917) > 0.5 + nf * 0.3) c = MOSS[2];
  if (nf >= 0 && nf < 0.12) c = mixC(c, BEYOND, 0.3);
  return c;
}

function mossTile(seed: number): Sprite {
  return tileOf((x, y) => {
    const u = x - Math.floor(x) - 0.5;
    const v = y - Math.floor(y) - 0.5;
    const r = Math.hypot(u, v) + (fbm(x * 7, y * 7, seed) - 0.5) * 0.5;
    if (r > 0.36) return null;
    const n = fbm(x * 14, y * 14, seed + 3);
    const k = r > 0.3 ? 1 : n > 0.62 ? 4 : n > 0.45 ? 3 : 2;
    return MOSS[k];
  }, 0, 0);
}
/** GRASS AND LITTLE FLOWERS up through the joints of a tile's near edges: tufts a few pixels high, in whole game pixels. */
function grassTile(seed: number): Sprite {
  const p = new Px(TW, TH);
  for (let i = 0; i < 7; i++) {
    const along = 0.12 + hash(i, seed, 1) * 0.76;
    const edgeX = hash(i, seed, 2) < 0.5;
    const [u, v] = edgeX ? [along, 0.97] : [0.97, along];
    const X = Math.round((HALF + (u - v) * 32) / 2) * 2;
    const Y = Math.round(((u + v) * 16) / 2) * 2;
    const blades = 2 + Math.floor(hash(i, seed, 3) * 3);
    for (let b = 0; b < blades; b++) {
      const bx = X + (b - Math.floor(blades / 2)) * 2;
      const h = 1 + Math.floor(hash(i, b, seed + 5) * 3);
      for (let j = 0; j < h; j++) {
        const c = LEAF[j === h - 1 ? 4 : j > 0 ? 3 : 2];
        for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
          const yy = Y - 2 - j * 2 + dy;
          if (yy >= 0 && yy < TH && bx + dx >= 0 && bx + dx < TW) p.set(bx + dx, yy, c);
        }
      }
    }
    if (hash(i, seed, 7) > 0.6) {
      const c = FLOWERS[Math.floor(hash(i, seed, 8) * FLOWERS.length)];
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) if (Y - 8 + dy >= 0) p.set(X + dx, Y - 8 + dy, c);
    }
  }
  return p.sprite(HALF, 0, GRAIN);
}

// =================================================================================================
// THE SUN ON THE FLOOR AND IN THE AIR: LIGHT, drawn added

/** How much of a floor tile is in the sun (0 to 1), counted at its whole game pixels. */
const sunFrac = new Map<string, number>();
const sunTiles = new Map<string, Sprite | null>();
/** THE SLATS OF SUN on floor tile (tx, ty): a picture of light (its rim and its core, in whole game pixels), or null. */
function sunTile(tx: number, ty: number): Sprite | null {
  const key = `${tx},${ty}`;
  if (sunTiles.has(key)) return sunTiles.get(key)!;
  const lit = new Map<number, boolean>();
  const blockLit = (bx: number, by: number): boolean => {
    const k = by * 64 + bx;
    let v = lit.get(k);
    if (v === undefined) {
      const [u, w] = onTile(bx * 2 + 0.5, by * 2 + 0.5);
      v = sunAt(tx + u, ty + w, 0);
      lit.set(k, v);
    }
    return v;
  };
  const p = new Px(TW, TH);
  let n = 0;
  let all = 0;
  for (let y = 0; y < TH; y += 2) {
    const hw = Math.min(halfWidth(y), halfWidth(y + 1));
    for (let x = HALF - hw + 1; x < HALF + hw - 1; x += 2) {
      const bx = x >> 1;
      const by = y >> 1;
      all++;
      if (!blockLit(bx, by)) continue;
      n++;
      const rim = !blockLit(bx - 1, by) || !blockLit(bx + 1, by) || !blockLit(bx, by - 1) || !blockLit(bx, by + 1);
      const c = rim ? SUN.slat[0] : SUN.slat[1];
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const yy = y + dy;
        const h2 = halfWidth(yy);
        if (yy < TH && x + dx >= HALF - h2 && x + dx < HALF + h2) p.set(x + dx, yy, c);
      }
    }
  }
  sunFrac.set(key, n / Math.max(1, all));
  const s = n > 0 ? p.sprite(HALF, 0, GRAIN) : null;
  sunTiles.set(key, s);
  return s;
}

/** THE SUN IN THE AIR through window `W`: its picture's anchor (the floor point at the window's middle, at the wall's foot). */
function airOf(W: Win, f: number): Sprite {
  const ZTOP = 96;
  const reachX = ZTOP * SUN_DIR[0] + 0.3;
  const reachY = ZTOP * SUN_DIR[1] + 0.8;
  const x0 = HALL.x0;
  const x1 = HALL.x0 + reachX;
  const y0 = W.c - 0.7;
  const y1 = W.c + reachY;
  // (the picture: the floor point (6, c) at (AX, AY))
  const AX = Math.ceil(((y1 - W.c) * 32 + 8) / 2) * 2;
  const AY = Math.ceil((ZTOP + 8 + (W.c - y0) * 16) / 2) * 2;
  const Wd = AX + Math.ceil(((x1 - x0) * 32 + (W.c - y0) * 32 + 8) / 2) * 2;
  const Hd = AY + Math.ceil(((x1 - x0) * 16 + (y1 - W.c) * 16 + 8) / 2) * 2;
  const p = new Px(Wd, Hd);
  for (let py = 0; py < Hd; py += 2) {
    for (let px = 0; px < Wd; px += 2) {
      // (the pixel's line of sight: x - y = q (tiles, from the anchor's), z = 16 (x + y) - sy)
      const q = (px + 1 - AX) / 32;
      const sy = py + 1 - AY;
      const tLo = Math.max(2 * 0 - q, 2 * (y0 - W.c) + q, sy / 16);
      const tHi = Math.min(2 * (x1 - x0) - q, 2 * (y1 - W.c) + q, (ZTOP + sy) / 16);
      if (tHi <= tLo) continue;
      let litN = 0;
      for (let t = tLo + 0.03; t < tHi; t += 0.09) {
        const dx = (t + q) / 2;
        const dy = (t - q) / 2;
        const z = 16 * t - sy;
        if (z < 0) continue;
        if (sunAt(x0 + dx, W.c + dy, z, W)) litN++;
      }
      if (litN === 0) continue;
      const chk = ((px >> 1) + (py >> 1)) & 1;
      const amt = litN * 0.09 + (chk ? 0.04 : 0);
      const step = amt > 0.9 ? 3 : amt > 0.45 ? 2 : amt > 0.14 ? 1 : 0;
      if (step === 0) continue;
      // (the motes of dust, two-pixel squares turning in it: a little higher each frame)
      const my = (py >> 1) + Math.floor(f * 1.5);
      const c = hash(px >> 1, my, 137 + Math.round(W.c * 10)) > (step >= 2 ? 0.982 : 0.99) ? SUN.mote : SUN.air[step - 1];
      for (const [ddx, ddy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) p.set(px + ddx, py + ddy, c);
    }
  }
  return p.sprite(AX, AY, GRAIN);
}

// =================================================================================================
// THE STONE ABOVE THE GAME'S 80 AND THE GREAT HALL'S ROOF: one picture over the dark above the back walls, its anchor the floor
// point of the hall's back corner (6, 6). For every pixel its line of sight is followed and the nearest of the two walls (from
// 80 to 140) and the roof's two slopes is painted.

/**
 * THE ROOF seen from under it, HIPPED (it slopes up from the tops of both back walls, so there is no gable end): its wall plate on
 * the corbel table; the HIP RAFTER over the back corner; the principal rafters over the trusses; purlins; common rafters; the
 * boards, a chink of day here and there. The slope over the wall along x (turned to screen-left) a shade lighter.
 */
function roofAt(x: number, y: number, z: number, plane: 'X' | 'Y'): string {
  const W = WOOD;
  const B = BOARDS;
  const along = plane === 'Y' ? x : y;
  const up = z - CASTLE_TOP;
  const d = plane === 'Y' ? 0 : 1;
  if (up < 10) {
    if (up < 1) return W[0];
    if (up < 3) return W[clampK(4 - d)];
    if (mod(along * 32, 40) < 1.2 && up > 4 && up < 7) return W[0];
    return W[clampK(3 - d)];
  }
  const hip = x - y;
  if (Math.abs(hip) < 0.17) return Math.abs(hip) < 0.03 ? W[0] : hip > 0 ? W[3] : W[2];
  if (Math.abs(hip) < 0.21) return W[0];
  for (const a of plane === 'Y' ? TRUSSES_X : TRUSSES_Y) {
    const da = along - a;
    if (Math.abs(da) < 0.14) return Math.abs(da) > 0.1 ? (da < 0 ? W[clampK(4 - d)] : W[0]) : W[clampK(3 - d)];
  }
  const purl = Math.abs(mod(up + 35, 70) - 35);
  if (purl < 5) return purl < 1 ? W[clampK(4 - d)] : purl > 3.6 ? W[0] : W[clampK(2 - d)];
  const raft = Math.abs(mod(along + 0.25, 0.5) - 0.25);
  if (raft < 0.045) return raft < 0.015 ? W[clampK(3 - d)] : W[clampK(1 - d)];
  const bd = mod(up, 9);
  if (bd < 1) {
    if (hash(Math.floor(up / 9), Math.floor(along * 1.5), 67 + d) > 0.985) return DAY.gapDim;
    return B[0];
  }
  return B[clampK((hash(Math.floor(up / 9), Math.floor(along * 1.5), 69 + d) > 0.7 ? 4 : 3) - d)];
}
/** The roof's picture: its size and where the hall's back corner's floor point is on it. */
export const ROOF_PIC = { w: 1000, h: 536, ax: 476, ay: 352 };
function roofPicture(): Sprite {
  const { w: W, h: H, ax: AX, ay: AY } = ROOF_PIC;
  const p = new Px(W, H);
  const TOP = CASTLE_TOP;
  const PI = CASTLE_PITCH;
  for (let py = 0; py < H; py++) {
    // (sy as the world's: z = 16 (x + y) - sy, the hall's back corner (6, 6) at the anchor)
    const sy = py + 0.5 - AY + 12 * 16;
    for (let px = 0; px < W; px++) {
      const q = (px + 0.5 - AX) / 32;
      let best = -1e9;
      let col: string | null = null;
      // THE WALL ALONG Y (x = 6), from 80 up
      {
        const t = 2 * HALL.x0 - q;
        const y = HALL.x0 - q;
        const z = 16 * t - sy;
        if (y >= HALL.y0 && y < HALL.y1 && z >= CH_WALL && z < TOP) {
          best = t;
          col = castleFace(false, y * 32, Math.floor(z));
        }
      }
      // THE WALL ALONG X (y = 6), from 80 up
      {
        const t = 2 * HALL.y0 + q;
        const x = HALL.y0 + q;
        const z = 16 * t - sy;
        if (t > best && x >= HALL.x0 && x < HALL.x1 && z >= CH_WALL && z < TOP) {
          best = t;
          col = castleFace(true, x * 32, Math.floor(z));
        }
      }
      // THE ROOF'S TWO SLOPES
      const cands: [number, 'X' | 'Y'][] = [
        [(TOP - 6 * PI - (PI * q) / 2 + sy) / (16 - PI / 2), 'Y'],
        [(TOP - 6 * PI + (PI * q) / 2 + sy) / (16 - PI / 2), 'X'],
      ];
      for (const [tr, plane] of cands) {
        const x = (tr + q) / 2;
        const y = (tr - q) / 2;
        const z = 16 * tr - sy;
        const dx = x - HALL.x0;
        const dy = y - HALL.y0;
        const ok = plane === 'Y' ? dy >= 0 && dy <= dx : dx >= 0 && dx <= dy;
        if (tr > best && ok && x < HALL.x1 && y < HALL.y1 && Math.min(dx, dy) <= ROOF_IN && z >= TOP) {
          best = tr;
          col = roofAt(x, y, z, plane);
        }
      }
      if (col !== null) p.set(px, py, col);
    }
  }
  return p.sprite(AX, AY, GRAIN);
}

// =================================================================================================
// THE TRUSSES, each springing from A CARVED STONE CORBEL set into the wall (three steps): its wall post stands on the corbel up
// the wall to the plate, an ARCH BRACE curves out and up from it. On the wall along x a HAMMER BEAM juts out at the brace's head,
// a hammer post on it up to the roof's principal rafter (THE OWL sits on one); on the wall along y, between the windows, the
// post and its brace only. Each a picture anchored at the floor point at the wall's foot under it.

export const CTRUSS = { hw: 0.13, corbel: [40, 56] as const, beamOut: 1.1, hpost: [0.62, 0.84] as const, braceFoot: 64, lBrace: 0.5 };
export const HAMMER = { z0: 92, z1: 102 };
/** Where the owl perches: on the end of the hammer beam over the rack and the forge, before its hammer post (x, y, and its beam's top). */
export const CASTLE_OWL_AT: readonly [number, number, number] = [17.5, 6.98, 102];
export const TRUSS_PIC = { w: 64, h: 216, axX: 50, axY: 14, ay: 212 };
function trussPicture(hammer: boolean): Sprite {
  const T = CTRUSS;
  const W = WOOD;
  const S = STONE;
  const roofAtOut = (out: number): number => CASTLE_TOP + CASTLE_PITCH * out;
  const [c0, c1] = T.corbel;
  const bOut = hammer ? T.hpost[1] : T.lBrace;
  const bTop = hammer ? HAMMER.z0 : CASTLE_TOP - 6;
  const part = (al: number, out: number, z: number): 'beam' | 'post' | 'brace' | 'hpost' | 'corbel' | null => {
    const a = Math.abs(al);
    if (out < 0) return null;
    if (z >= c0 && z < c1) {
      const step = z < c0 + 5 ? 0.12 : z < c0 + 10 ? 0.22 : 0.32;
      return out < step && a < T.hw + 0.05 ? 'corbel' : null;
    }
    if (a > T.hw) return null;
    if (out < 0.22 && z >= c1 && z < CASTLE_TOP) return 'post';
    if (hammer && z >= HAMMER.z0 && z < HAMMER.z1 && out < T.beamOut) return 'beam';
    if (hammer && out > T.hpost[0] && out < T.hpost[1] && z >= HAMMER.z1 && z < roofAtOut(out) + 2) return 'hpost';
    if (out >= 0.18 && out < bOut && z >= T.braceFoot && z < bTop) {
      const e = Math.hypot((out - bOut) / (bOut - 0.2), (z - T.braceFoot) / (bTop - T.braceFoot));
      if (e > 0.78 && e < 1) return 'brace';
    }
    return null;
  };
  // (painted in the frame of the wall along x: x along it, y out from it; along y the same truss turned, x out and y along)
  const local = (x: number, y: number): [number, number] => (hammer ? [x, y] : [y, x]);
  const reach = hammer ? T.beamOut : T.lBrace;
  const box = hammer ? { x0: -T.hw - 0.06, y0: 0, x1: T.hw + 0.06, y1: reach + 0.02 } : { x0: 0, y0: -T.hw - 0.06, x1: reach + 0.02, y1: T.hw + 0.06 };
  const { w, h, axX, axY, ay } = TRUSS_PIC;
  const AX = hammer ? axX : axY;
  return pic(w, h, AX, ay, (D) => D.march({
    box: { ...box, z0: c0 - 1, z1: (hammer ? roofAtOut(T.hpost[1]) : CASTLE_TOP) + 3 },
    inside: (x, y, z) => {
      const [al, out] = local(x, y);
      return part(al, out, z) !== null;
    },
    shade: (x, y, z, face) => {
      const [al, out] = local(x, y);
      const m = part(al, out, z)!;
      const k = faceK(face);
      if (m === 'corbel') {
        if (face === 'z') return S[4];
        const lip = mod(z - c0, 5);
        return S[clampK(lip > 3.6 ? k + 1 : lip < 1 ? k - 1 : k)];
      }
      let c = W[clampK(k)];
      const along = m === 'post' || m === 'hpost' ? z : out * 32;
      if (face !== 'z' && hash(Math.floor(along / 4), Math.floor(al * 40), 91) > 0.86) c = W[clampK(k - 1)];
      if (m === 'beam' && face !== 'z' && Math.abs(z - (HAMMER.z0 + HAMMER.z1) / 2) < 0.8) c = W[clampK(k - 1)];
      if ((m === 'post' && Math.abs(z - HAMMER.z0 - 4) < 1.2) || (m === 'hpost' && Math.abs(z - HAMMER.z1 - 6) < 1.2)) c = W[0];
      return c;
    },
  }));
}

// =================================================================================================
// THE PLANTS: terracotta pots (round-bellied, a rim, moss at the foot) with herbs, flowers on stems, a little clipped bay tree or
// a fern; ivy in a mound at a wall's foot; a pillar of the hall with ivy winding up it. Each anchored at its floor point.

export type PotKind = 'herb' | 'flower' | 'bay' | 'fern';
interface PotSpec { r: number; h: number; kind: PotKind; seed: number }
export const POT_PIC = { w: 64, h: 96, ax: 32, ay: 80 };
function potPicture(P: PotSpec): Sprite {
  const T = POT;
  const potR = (z: number): number => {
    const u = z / P.h;
    if (u > 0.86) return P.r * 1.04;
    return P.r * (0.72 + 0.3 * Math.sin(Math.PI * (0.25 + u * 0.75)));
  };
  const fol = (x: number, y: number, z: number): boolean => {
    const top = P.h;
    if (P.kind === 'bay') {
      if (z > top && z < top + 16 && Math.hypot(x, y) < 0.035) return true;
      const r = Math.hypot(x / 0.32, y / 0.32, (z - top - 24) / 15);
      return r < 1 - 0.25 * noise(x * 30, z / 3, P.seed);
    }
    if (P.kind === 'fern') {
      const r = Math.hypot(x / 0.42, y / 0.42, (z - top - 4) / 12);
      return z > top - 2 && r < 1 && fbm(Math.atan2(y, x) * 2.5, r * 3, P.seed) > 0.4;
    }
    const r = Math.hypot(x / (P.r * 1.4), y / (P.r * 1.4), (z - top - 3) / (P.kind === 'flower' ? 12 : 9));
    return z > top - 2 && r < 1 - 0.3 * noise(x * 40, z / 2, P.seed);
  };
  const reach = P.kind === 'fern' ? 0.45 : P.kind === 'bay' ? 0.36 : P.r * 1.5;
  const { w, h, ax, ay } = POT_PIC;
  return pic(w, h, ax, ay, (D) => D.march({
    box: { x0: -reach, y0: -reach, z0: 0, x1: reach, y1: reach, z1: P.h + 42 },
    inside: (x, y, z) => (z >= 0 && z < P.h && Math.hypot(x, y) < potR(z)) || fol(x, y, z),
    shade: (x, y, z) => {
      if (z < P.h && Math.hypot(x, y) < potR(z) + 0.001 && !fol(x, y, z)) {
        const a = Math.atan2(y, x);
        const l = Math.cos(a - 2.4);
        let k = l > 0.5 ? 4 : l > 0 ? 3 : l > -0.5 ? 2 : 1;
        if (z > P.h - 3) k = Math.min(4, k + 1);
        if (Math.abs(z - P.h + 3.5) < 0.6) k = 1;
        if (z < 5 && fbm(a * 3, z, P.seed) > 0.55) return MOSS[clampK(k)];
        return T[clampK(k)];
      }
      const lf = hash(Math.floor(x * 64), Math.floor(z / 2) + Math.floor(y * 64) * 7, P.seed);
      const up = (z - P.h) / 20;
      if (P.kind === 'flower' && lf > 0.8 && up > 0.15) return FLOWERS[(P.seed + Math.floor(lf * 7)) % FLOWERS.length];
      if (P.kind === 'herb' && lf > 0.93) return FLOWERS[(P.seed * 3) % FLOWERS.length];
      const k = lf > 0.66 ? 4 : lf > 0.33 ? 3 : 2;
      return LEAF[clampK(k + (x < 0 && y > 0 ? 0 : -1))];
    },
  }, 0.008));
}
/** IVY AT A WALL'S FOOT: a mound of it on the floor against the wall (along x: the wall at y = 0 behind it; along y: at x = 0), climbing a little way up it. Anchored at the floor point at the middle of the wall's foot. */
export const IVY_PIC = { w: 72, h: 64, ax: 36, ay: 46 };
function ivyMound(alongX: boolean, seed: number): Sprite {
  const { w, h, ax, ay } = IVY_PIC;
  const inside = (x: number, y: number, z: number): boolean => {
    const [al, out] = alongX ? [x, y] : [y, x];
    if (out < 0 || z < 0) return false;
    const r = Math.hypot(al / 0.55, out / 0.34, z / 26) + (fbm(al * 9 + seed, z / 6 + out * 5, seed) - 0.5) * 0.6;
    return r < 1 && fbm(al * 14, z / 3 + out * 9, seed + 3) > 0.3;
  };
  return pic(w, h, ax, ay, (D) => D.march({
    box: alongX ? { x0: -0.6, y0: 0, z0: 0, x1: 0.6, y1: 0.4, z1: 30 } : { x0: 0, y0: -0.6, z0: 0, x1: 0.4, y1: 0.6, z1: 30 },
    inside,
    shade: (x, y, z, face) => {
      const lf = hash(Math.floor(x * 64), Math.floor(z / 2) + Math.floor(y * 64) * 5, seed);
      if (lf > 0.975) return FLOWERS[Math.floor(lf * 1000) % FLOWERS.length];
      const k = (lf > 0.6 ? 3 : lf > 0.3 ? 2 : 1) + (face === 'z' || face === 'y' ? 1 : 0);
      return LEAF[clampK(k)];
    },
  }, 0.008));
}
/** A PILLAR OF THE HALL: a round column of the castle's stone on a square base, a carved capital, ivy winding up it, moss at its foot. The game's pillar's size and anchor (art/props.ts makeDungeonProps: 40 x 100, its tile's middle at (20, 84)). */
export const PILLAR_PIC = { w: 40, h: 100, ax: 20, ay: 84 };
function pillarPicture(): Sprite {
  const S = STONE;
  const H = 70;
  const rAt = (z: number): number => (z < 7 ? 0.27 : z < 10 ? 0.23 : z > H - 5 ? 0.28 : z > H - 12 ? 0.235 + (z - (H - 12)) * 0.006 : 0.19);
  const inside = (x: number, y: number, z: number): boolean => {
    if (z < 0 || z > H) return false;
    const r = rAt(z);
    if (z < 7 || z > H - 5) return Math.abs(x) < r && Math.abs(y) < r;
    return Math.hypot(x, y) < r;
  };
  const { w, h, ax, ay } = PILLAR_PIC;
  return pic(w, h, ax, ay, (D) => D.march({
    box: { x0: -0.3, y0: -0.3, z0: 0, x1: 0.3, y1: 0.3, z1: H + 1 },
    inside,
    shade: (x, y, z, face) => {
      const a = Math.atan2(y, x);
      const l = Math.cos(a - 2.4);
      let k = face === 'z' ? 4 : l > 0.55 ? 4 : l > 0.1 ? 3 : l > -0.45 ? 2 : 1;
      if (z < 7 || z > H - 5) k = face === 'z' ? 4 : face === 'y' ? 3 : 1;
      if (z > H - 12 && z <= H - 5 && mod(a * 6 + z, 4) < 2) k -= 1;
      const wind = mod(a / (Math.PI * 2) + z / 70, 1);
      if (z > 6 && z < H - 4 && (wind < 0.22 || fbm(a * 3, z / 8, 97) > 0.68) && fbm(a * 5, z / 5, 99) > 0.36) {
        const lf = hash(Math.floor(a * 20), Math.floor(z / 2), 101);
        return LEAF[clampK((lf > 0.6 ? 3 : 2) + (l > 0.2 ? 1 : l < -0.3 ? -1 : 0))];
      }
      if (z < 24 && fbm(a * 4, z / 6, 103) > 0.56) return MOSS[clampK(k)];
      return S[clampK(k)];
    },
  }));
}

// =================================================================================================
// THE BARRED GATE OUT TO THE QUARRY: the town's gate as it works today (game/ways.ts townGate, a 'waygate' in the wall along x,
// render.ts standDoors: a pillar at each end of the doorway, the arch's strips, the game's own portcullis at the back of the
// arch, the town's bars over it while it is barred: art/town_ways.ts), with the castle's stone round the game's own way (ARCH:
// the way the portcullis and the bars are made for, unchanged): its PILLARS the jambs' quoins, its ARCH a ring of thirteen
// voussoirs with a keystone and a HOOD MOULD, the wall over the doorway; and THROUGH IT the passage through the thick wall,
// lit from its far end, and the bright day beyond: the road out to the Quarry, its ruts, grass, a quarried block.

/**
 * The castle's arch over the game's way: the same way and ring (ARCH: so the portcullis, the town's bars, their chains and the
 * rings they hang from sit as they do today), a hood mould over its upper part, stopping on a carved stop each side above the
 * bars' rings.
 */
export const CGATE = { ring: ARCH.ring, hood: 3, hoodFrom: 78 };
const CURVE = curveOf(ARCH);
const reachC = (u: number, v: number): number => Math.hypot(u + 0.5 - CURVE.mid, v + 0.5 - CURVE.vc);
const inRingC = (u: number, v: number, ring: number): boolean => {
  if (v < ARCH.spring) return false;
  const d = reachC(u, v);
  return d >= CURVE.rho && d < CURVE.rho + ring;
};
/** THE PILLAR: a jamb's quoins, long and short in turn, square on the game's pillar's footprint (art/gates.ts makePillar: its size and anchor). */
function gatePillar(): Sprite {
  const HW = PILLAR;
  const high = ARCH.spring;
  const p = new Px(HW * 2 + 8, high + 26);
  const cx = HW + 4;
  const base = high + 16;
  const S = STONE;
  for (let dx = -HW; dx < HW; dx++) {
    const left = dx < 0;
    const u = left ? dx + HW : HW - 1 - dx;
    const drop = -HW / 2 + Math.floor((u - 1) / 2);
    const dn = left ? 0 : 1;
    for (let v = 0; v < high; v++) {
      const course = Math.floor(v / 14);
      const lv = mod(v, 14);
      // (the long quoins run on round the corner into the wall: a joint across where a short one ends)
      let c = course % 2 ? S[clampK(3 - dn)] : S[clampK(2 - dn)];
      if (lv === 13) c = SEAM;
      else if (lv === 12) c = S[clampK(4 - dn)];
      else if (dx === -HW) c = S[clampK(4 - dn)];
      else if (dx === -1) c = S[clampK(1 - dn)];
      else if (dx === 0) c = S[clampK(4 - dn)];
      if (v < 6 && fbm(dx / 3, v / 3, 211) > 0.55) c = MOSS[clampK(2 - dn)];
      p.set(cx + dx, base + drop - v, c);
    }
  }
  return p.sprite(cx, base, GRAIN);
}
/** THE ARCH: strips from the outer edge of one pillar to the outer edge of the other and on (u 0 to ARCH_WIDE + 16), as the game's. */
function gateArch(alongX: boolean): Strip[] {
  const R = CGATE.ring;
  const HOOD = CGATE.hood;
  const F = new Flat(0, ARCH_WIDE + 16, CH_WALL + 24);
  const lit = alongX;
  const dn = lit ? 0 : 1;
  const S = STONE;
  const a0 = Math.atan2(ARCH.spring - CURVE.vc, ARCH_WIDE / 2);
  const sweep = Math.PI - 2 * a0;
  const n = 13;
  for (let v = 0; v < F.high; v++) {
    for (let u = 0; u < F.u1; u++) {
      if (inWay(ARCH, CURVE, u, v)) {
        // what is seen of the arch's thickness: its underside where it turns toward the eye (set back by up to a pillar's breadth)
        let hit = 0;
        for (let s = 1; s <= PILLAR; s++) if (inRingC(u - s, v - s, R)) {
          hit = s;
          break;
        }
        if (hit) F.set(u, v, hit <= 1 ? S[0] : mixC(S[clampK(1 - dn)], S[0], 0.35));
        continue;
      }
      const du = u + 0.5 - CURVE.mid;
      const d = reachC(u, v);
      if (inRingC(u, v, R)) {
        const ang = Math.atan2(v + 0.5 - CURVE.vc, du);
        const k = ((Math.PI - a0 - ang) / sweep) * n;
        const stone = Math.max(0, Math.min(n - 1, Math.floor(k)));
        const into = k - Math.floor(k);
        const key = stone === (n - 1) / 2;
        let c: string;
        if ((into < 0.07 || into > 0.97) && Math.round(k) > 0 && Math.round(k) < n) c = SEAM;
        else if (d < CURVE.rho + 1.5) c = du < 6 ? S[clampK(4 - dn)] : S[clampK(1 - dn)];
        else if (d > CURVE.rho + R - 1.2) c = key ? S[clampK(3 - dn)] : S[clampK(1 - dn)];
        else if (key) c = into < 0.25 ? S[clampK(4 - dn)] : S[clampK(3 - dn)];
        else c = S[clampK((stone % 2 ? 3 : 2) - dn)];
        F.set(u, v, c);
        continue;
      }
      // THE HOOD MOULD over the ring: a projecting label, its top lit, its foot in shadow, stopping on a carved stop each side
      if (v >= CGATE.hoodFrom - 4 && d >= CURVE.rho + R && d < CURVE.rho + R + HOOD + 1) {
        if (v < CGATE.hoodFrom) {
          // (its stop: a little carved block under the label's end)
          F.set(u, v, v === CGATE.hoodFrom - 4 ? S[0] : S[clampK((du < 0 ? 3 : 2) - dn)]);
          continue;
        }
        if (d >= CURVE.rho + R + HOOD) continue;
        F.set(u, v, d > CURVE.rho + R + HOOD - 1 ? S[clampK(4 - dn)] : d < CURVE.rho + R + 1 ? S[0] : S[clampK(3 - dn)]);
        continue;
      }
      // THE WALL OVER THE DOORWAY (where no tile of wall stands: the doorway's three tiles), up to the faces' top
      if (u >= PILLAR && u < PILLAR + SPAN && v < CH_WALL) {
        const s = (GATE_AT.a - PILLAR / 32) * 32 + u;
        const c = castleFace(true, s, v);
        F.set(u, v, alongX ? c : mixC(c, '#06051a', 0.32));
      }
    }
  }
  return F.strips(alongX);
}
/**
 * THROUGH THE GATE: the passage through the thick wall (a tile deep: its floor of worn flags, its sides and its vault the arch's
 * shape, in shade, lit from its far end) and the day beyond it (the road out to the Quarry, its ruts, grass either side, a
 * quarried block by it). Seen through the game's way (ARCH), drawn with the floor; as art/town_ways.ts floorStairsUp is: its
 * size, its anchor (4 or ARCH_WIDE + 4, 112: where the arch's first strip begins, at the wall's face).
 */
function gateBeyond(alongX: boolean): Sprite {
  const W = ARCH_WIDE + 8;
  const H = 112 + ARCH_WIDE / 2 + 12;
  const ax = alongX ? 4 : ARCH_WIDE + 4;
  const ay = 112;
  const p = new Px(W, H);
  const S = new Scene(new Px(W, H), ax, ay);
  // (in the scene's measure: 40 to a tile; the way's middle along the face; the wall a tile thick)
  const mid = ARCH_WIDE / 2 / 0.8;
  const THICK = 40;
  const toFace = (q: V3): V3 => (alongX ? [q[0] - mid, q[1], q[2]] : [q[1] - mid, q[0], q[2]]);
  const eye: V3 = [1, 1, 0.8];
  const inArch = (a: number, z: number): boolean => inWay(ARCH, CURVE, Math.floor((a + mid) * 0.8), Math.floor(z));
  const halfW = SPAN / 2 / 0.8;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const r0 = toFace(S.ray(x, y));
      const t0 = -r0[1];
      const a0 = r0[0] + eye[0] * t0;
      const z0 = eye[2] * t0;
      if (z0 < 0 || !inArch(a0, z0)) continue;
      let c: string | null = null;
      for (let t = t0; t > t0 - 400; t -= 0.4) {
        const a = r0[0] + eye[0] * t;
        const b = r0[1] + t;
        const z = eye[2] * t;
        const depth = -b;
        if (depth < THICK) {
          // IN THE PASSAGE: its floor, its sides, its vault
          if (z <= 0) {
            const gx = a / 40 + 1.5;
            const gy = depth / 40;
            const fu = gx - Math.floor(gx);
            const fv = gy - Math.floor(gy * 2) / 2;
            let k = hash(Math.floor(gx), Math.floor(gy * 2), 917) < 0.3 ? 3 : 2;
            if (fu < 0.03 || fv < 0.03) k = 0;
            const base = FLAGS[k];
            // (the day spilling in from the far end, the floor brighter toward it)
            c = mixC(base, DAY.gapDim, Math.max(0, Math.min(0.55, (depth / THICK) * 0.6 - 0.05)));
            break;
          }
          if (Math.abs(a) >= halfW || !inArch(a, z)) {
            const side = Math.abs(a) >= halfW;
            const course = mod(z, 14) < 1 || mod(depth + (Math.floor(z / 14) % 2) * 14, 28) < 1;
            const lit0 = side && a < 0;
            let col = course ? SEAM : side ? (lit0 ? STONE[2] : STONE[1]) : STONE[0];
            col = mixC(col, DAY.gapDim, Math.max(0, Math.min(0.4, (depth / THICK) * 0.45 - 0.05)));
            c = col;
            break;
          }
          continue;
        }
        // OUTSIDE, in the sun
        if (z <= 0) {
          const gx = a / 40;
          const gy = (depth - THICK) / 40;
          const n = fbm(gx * 3, gy * 3, 71);
          const roadD = Math.abs(gx - gy * 0.25);
          let col: string;
          if (roadD < 1.15) {
            col = n > 0.6 ? DAY.road[2] : DAY.road[1];
            if (Math.abs(roadD - 0.55) < 0.07) col = DAY.road[0];
          } else col = n > 0.55 ? DAY.grass[1] : DAY.grass[0];
          if (Math.abs(gx - 1.7) < 0.32 && Math.abs(gy - 0.9) < 0.22) col = gy < 0.8 ? DAY.block[1] : DAY.block[0];
          c = col;
          break;
        }
      }
      p.set(x, y, c ?? DAY.gapDim);
    }
  }
  return p.sprite(ax, ay, GRAIN);
}

export interface CastleGate {
  /** A pillar of the gate (two stand, as render.ts standDoors stands a gate's): the jamb's quoins, the game's pillar's footprint. */
  pillar: Sprite;
  /** The arch over the way, along x or y: strips, from the outer edge of one pillar (u 0) to ARCH_WIDE + 16. */
  arch(alongX: boolean): Strip[];
  /** Through it: the passage and the day beyond, drawn with the floor, anchored as the arch's first strip (as floor 1's stairs up). */
  beyond(alongX: boolean): Sprite;
}

// =================================================================================================
// THE STAIRS DOWN TO FLOOR 1 (art/town_ways.ts townStairs: art/crypt_ways.ts makeStairwellOf with TOWN_STAIRS, its size, anchor and
// shape pixel for pixel): the hall's stone, and down the flight floor 1's mossy stone (look B's, his yes: art/tomb.ts), the one
// turning into the other the deeper it goes; moss on the deep treads

const asTheme = (S: R5, F: R5, seam: string): Theme => ({
  ...VAULT,
  id: 'castlehall',
  mortar: seam,
  slab: [F[1], F[2], F[3], F[4]],
  cap: [S[1], S[2], S[3], S[3], S[4]],
  capLow: [S[0], S[1], S[2], S[2], S[3]],
  lit: [seam, S[1], S[2], S[3], S[4]],
  shade: [seam, S[0], S[1], S[1], S[2]],
});
/** The hall's stone as a theme of the game's ground painters. */
export const CASTLE_THEME: Theme = asTheme(STONE, FLAGS, SEAM);
/** Floor 1's stone, look B (art/tomb.ts: its STONE, FLAGS and SEAM, the same numbers), as a theme. */
const F1_STONE = down(['#1d1f19', '#353a2e', '#4c5040', '#626552', '#767a63'], 0.76);
const F1_FLAGS = down(['#1b1d17', '#31342a', '#46493a', '#5a5d4a', '#6c6f5a'], 0.8);
const F1_MOSS = down(['#10190a', '#1c2c10', '#2a4016', '#3a561e', '#4c6c28'], 0.92);
export const FLOOR1_THEME: Theme = asTheme(F1_STONE, F1_FLAGS, '#0e0f0b');
const PROBE = '#808080';
const PROBE_THEME: Theme = { ...VAULT, id: 'probe', mortar: PROBE, slab: [PROBE, PROBE, PROBE, PROBE], cap: [PROBE, PROBE, PROBE, PROBE, PROBE], capLow: [PROBE, PROBE, PROBE, PROBE, PROBE], lit: [PROBE, PROBE, PROBE, PROBE, PROBE], shade: [PROBE, PROBE, PROBE, PROBE, PROBE] };
/** The stairs' own: the hall's stone, its treads a step down (so the parapet's lit lip stays under the darkest word). */
export const STAIRS_THEME: Theme = { ...CASTLE_THEME, id: 'castlehallstairs', slab: [FLAGS[0], FLAGS[1], FLAGS[2], FLAGS[2]] };
function stairsDown(way: 'x' | 'y'): Sprite {
  const hall = makeStairwellOf(STAIRS_THEME, way, TOWN_STAIRS);
  const f1 = makeStairwellOf(FLOOR1_THEME, way, TOWN_STAIRS);
  // (the same flight painted in one grey: how dark the game's painter makes each pixel says how deep down it is)
  const probe = makeStairwellOf(PROBE_THEME, way, TOWN_STAIRS);
  const ph = pixelsOf(hall);
  const pf = pixelsOf(f1);
  const pp = pixelsOf(probe);
  const out = new Px(ph.w, ph.h);
  for (let y = 0; y < ph.h; y++) for (let x = 0; x < ph.w; x++) {
    const c = ph.get(x, y);
    if (!c) continue;
    const g = pp.d[(y * pp.w + x) * 4 + 1];
    // (the probe's grey: 128 at the floor's level and over it; darker the deeper: 0.12 of the way to the pit's dark under 7, 0.34 under 15 ...)
    const w = g >= 120 ? 0 : g >= 100 ? 0.3 : g >= 70 ? 0.7 : 1;
    let col = w > 0 ? mixC(c, pf.get(x, y) ?? c, w) : c;
    if (w >= 0.7 && fbm(x / 5, y / 4, 233) > 0.6) col = mixC(col, F1_MOSS[3], 0.55 * w);
    out.set(x, y, col);
  }
  const d = hall.density ?? 1;
  return out.sprite(hall.ax * d, hall.ay * d, d);
}
/** A sprite's pixels, whether it was painted under the game's canvas or the tests'. */
function pixelsOf(s: Sprite): Px {
  const img = s.img as unknown;
  if (img instanceof Px) return img;
  const c = s.img;
  const q = c.getContext('2d') as CanvasRenderingContext2D;
  const d = q.getImageData(0, 0, c.width, c.height).data;
  const p = new Px(c.width, c.height);
  p.d.set(d);
  return p;
}

// =================================================================================================
// THE LIGHTS, for the main chat to place (the renderer's own: a hole cut in the dark, render.ts `spot`, and a glow drawn over it,
// `drawGlow`). In game pixels, from where each thing is anchored; the slats' holes worked out from the windows.

export interface SlatLight { x: number; y: number; r: number; strength: number }
export const CASTLE_LIGHTS = {
  /** THE TOWN'S OWN DARK, as it is (render.ts: rgba(8, 5, 14, 0.45)), its vignette (VIGNETTE_TOWN 0.4), the hero's pool (170 at 1): unchanged. */
  dark: { a: 0.45, rgb: [8, 5, 14] as const },
  vignette: 0.4,
  hero: { r: 170, strength: 1 },
  /** EACH WINDOW in the wall along y (the day through its gaps): a hole at its middle, `up` over the wall's foot, so its gaps read as daylight, and its warm glow; and the room's daylight before it, a wide soft hole on the floor `out` tiles in from the wall (0.3 of that along it), a faint warm glow over it. */
  window: { up: 26, r: 40, strength: 0.7, glow: { r: 26, color: SUN.glow, a: 0.16 }, floor: { out: 2.6, r: 100, strength: 0.55, glow: { r: 64, color: SUN.glow, a: 0.1 } } },
  /** THE SLATS OF SUN on the floor: a hole at each lit tile's middle, by how much of it is in the sun (`slatLights()`: the list). */
  slat: { r0: 24, r1: 48, s0: 0.4, s1: 0.85 },
  /** EVERY TILE OF WALL THAT STANDS (as floor 1's): a low hole at the foot of its face under its middle, so the castle's stone reads in the hall's daylight. */
  wall: { up: 26, r: 36, strength: 0.4 },
  /** THE GATE: the floor before it lit as now (render.ts: 84 at 0.9, 14 up from TOWN.gate), and the day's glow in its way. */
  gate: { up: 14, r: 84, strength: 0.9, glow: { up: 30, r: 46, color: SUN.day, a: 0.2 } },
  /** The braziers, the forge, the Lexicon, the table of wares, the wordsmith's slab: as now (render.ts light). */
} as const;

// =================================================================================================
// ALL OF IT

export interface CastleHallArt {
  /** The floor of tile (tx, ty) (each tile its own). Anchored at its top corner, as the game's. */
  floor(tx: number, ty: number): Sprite;
  /** Floor tiles laid over it: moss, grass and flowers in the joints. */
  tiles: Piece[];
  /** THE SUN'S SLATS on floor tile (tx, ty): light, drawn added after the floor tiles; null where none falls. */
  sun(tx: number, ty: number): Sprite | null;
  /** The face of wall tile (tx, ty): along x (the wall at y 5, turned to screen-left, lit), or along y (the wall at x 5, in shade). Anchored as the game's walls are. */
  face(alongX: boolean, tx: number, ty: number): Sprite;
  /** THE STONE ABOVE THE GAME'S 80 AND THE ROOF: one picture, anchored at the floor point of the hall's back corner (6, 6), drawn before the floor (behind everything, as the game's dark is). */
  roof: Sprite;
  /** THE GATE: its pillar and arch (stood as render.ts stands a gate's), the passage and the day through it (drawn with the floor). The portcullis and the bars are the game's own. */
  gate: CastleGate;
  /** THE STAIRS DOWN TO FLOOR 1: in place of art/town_ways.ts townStairs(way), its size, anchor and shape. */
  stairs(way: 'x' | 'y'): Sprite;
  /** THE OWL: its frames (art/hall_owl.ts OWL_POSES), which to show at a time (its loop), where it perches. */
  owl: { frames: Sprite[]; at: readonly [number, number, number]; frameAt(t: number, from?: number): number; loop: typeof OWL_LOOP; loopSecs: number };
  /** The place's own pieces: the trusses, the sun in the air, the plants, a pillar of the hall. */
  pieces: Piece[];
  /** The holes to cut in the dark for the slats of sun on the floor (game pixels for r; x, y the floor's point, in tiles). */
  slatLights(): SlatLight[];
}

/** The place's own pieces' names. */
export const CASTLE_OWN = [
  'a hammer-beam truss', 'a wall post and brace', 'the sun in the air, window 1', 'the sun in the air, window 2', 'the sun in the air, window 3',
  'the sun in the air, window 4', 'potted herbs', 'potted flowers', 'a bay tree in a pot', 'a fern in a pot', 'ivy at the foot of a wall, along x',
  'ivy at the foot of a wall, along y', 'a pillar of the hall',
] as const;
/** The pieces that are light, drawn added to what is under them ('lighter'). */
export const CASTLE_ADDED = new Set<string>(CASTLE_OWN.filter((n) => n.startsWith('the sun')));
/** The windows the sun comes in through (in the wall along y), in the order of their pieces; where each piece of its air stands: the floor point (6, c). */
export const SUN_WINDOWS = WINDOWS.filter((W) => W.wall === 'L');
/** How much further in than its anchor the sun in the air stands (x + y + this): after the wall's faces it lies over, before most of what stands in the hall. */
export const AIR_DEPTH = 2.5;
/** How much further in than the wall's foot a truss stands (x + y of its anchor + this): after the faces it lies over. */
export const TRUSS_DEPTH = 0.05;

const four = [0, 1, 2, 3];
let made: CastleHallArt | null = null;
/** The hall's pictures, made the first time they are asked for and kept (the heavy ones when first asked for). */
export function makeCastleHallArt(): CastleHallArt {
  if (made) return made;
  const floors = new Map<string, Sprite>();
  const faces = new Map<string, Sprite>();
  const tile = (name: string, frames: Sprite[]): Piece => ({ name, kind: 'floor tile' as PieceKind, frames });
  let roof: Sprite | null = null;
  const arches = new Map<boolean, Strip[]>();
  const beyonds = new Map<boolean, Sprite>();
  const stairs = new Map<string, Sprite>();
  const pillar = gatePillar();
  made = {
    floor(tx, ty) {
      const key = `${tx},${ty}`;
      let s = floors.get(key);
      if (!s) floors.set(key, (s = tileOf((x, y) => hallFloorAt(x, y), tx, ty)));
      return s;
    },
    tiles: [tile('moss', [mossTile(521)]), tile('moss, a little', [mossTile(523)]), tile('grass and flowers in the joints', [grassTile(531)]), tile('grass in the joints', [grassTile(537)])],
    sun: sunTile,
    face(alongX, tx, ty) {
      const along = alongX ? tx : ty;
      const key = `${alongX ? 'x' : 'y'}${along}`;
      let s = faces.get(key);
      if (!s) faces.set(key, (s = wallTile(alongX, along)));
      return s;
    },
    get roof() {
      return (roof ??= roofPicture());
    },
    gate: {
      pillar,
      arch(alongX) {
        let s = arches.get(alongX);
        if (!s) arches.set(alongX, (s = gateArch(alongX)));
        return s;
      },
      beyond(alongX) {
        let s = beyonds.get(alongX);
        if (!s) beyonds.set(alongX, (s = gateBeyond(alongX)));
        return s;
      },
    },
    stairs(way) {
      let s = stairs.get(way);
      if (!s) stairs.set(way, (s = stairsDown(way)));
      return s;
    },
    owl: { frames: owlFrames(), at: CASTLE_OWL_AT, frameAt: owlFrameAt, loop: OWL_LOOP, loopSecs: OWL_LOOP_SECS },
    pieces: [
      { name: 'a hammer-beam truss', kind: 'on the wall', frames: [trussPicture(true)] },
      { name: 'a wall post and brace', kind: 'on the wall', frames: [trussPicture(false)] },
      ...SUN_WINDOWS.map((W, i) => ({ name: `the sun in the air, window ${i + 1}`, kind: 'on the floor' as PieceKind, frames: four.map((f) => airOf(W, f)) })),
      { name: 'potted herbs', kind: 'on the floor', frames: [potPicture({ r: 0.2, h: 15, kind: 'herb', seed: 3 })], shadow: 0.25 },
      { name: 'potted flowers', kind: 'on the floor', frames: [potPicture({ r: 0.2, h: 16, kind: 'flower', seed: 1 })], shadow: 0.25 },
      { name: 'a bay tree in a pot', kind: 'on the floor', frames: [potPicture({ r: 0.22, h: 19, kind: 'bay', seed: 2 })], shadow: 0.28 },
      { name: 'a fern in a pot', kind: 'on the floor', frames: [potPicture({ r: 0.22, h: 17, kind: 'fern', seed: 8 })], shadow: 0.28 },
      { name: 'ivy at the foot of a wall, along x', kind: 'on the floor', frames: [ivyMound(true, 541)] },
      { name: 'ivy at the foot of a wall, along y', kind: 'on the floor', frames: [ivyMound(false, 547)] },
      { name: 'a pillar of the hall', kind: 'obstacle', frames: [pillarPicture()], shadow: 0.4 },
    ],
    slatLights() {
      const L = CASTLE_LIGHTS.slat;
      const out: SlatLight[] = [];
      for (let tx = HALL.x0; tx < HALL.x1; tx++) for (let ty = HALL.y0; ty < HALL.y1; ty++) {
        if (!sunTile(tx, ty)) continue;
        const f = sunFrac.get(`${tx},${ty}`) ?? 0;
        if (f < 0.12) continue;
        out.push({ x: tx + 0.5, y: ty + 0.5, r: Math.round(L.r0 + (L.r1 - L.r0) * Math.min(1, f * 1.6)), strength: +(L.s0 + (L.s1 - L.s0) * Math.min(1, f * 1.6)).toFixed(2) });
      }
      return out;
    },
  };
  return made;
}
/** Let the hall's pictures go (they are made again if they are wanted). */
export function forgetCastleHall(): void {
  made = null;
}
/** The day's colours (light, never the place's own). */
export function isDaylight(c: string): boolean {
  return LIGHTS.has(c.toLowerCase());
}
