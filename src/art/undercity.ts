// FLOOR 12, THE UNDERCITY: its ground (art/terrain.ts paints it from the level's own tiles). ACT 2, THE HUSH.
// A MOCK-UP: nothing of the game imports it.
//
// His doc "Wordsmith Act 2: The Hush (Levels 11–15)" (the planning chat's, with his yes as ideas), level 12, THE
// UNDERCITY: "Down the drains to find where the Hush comes from"; brick tunnels between cisterns, sluice gates, and
// the river's outflow under the walls, tunnels and chambers like the Prison's corridors and rooms; sluices that open
// and flood a tunnel, and slick floors; the Silent Order's tunnels leading to shelves of corked jars, whispering:
// bottled voices; its palette "Wet brown brick, green water"; its boss the Rat King, in the King's Cistern. To this
// chat, of floors 11 to 15, his word of 18 Oct, 21:24 Pacific: “Hey go without my say so.  If something is shit I’ll
// get it to it but you’re doing a great jobs. At least for 11-15”. So it is made, and sent him, without waiting.
//
// WHAT IT IS: the old city's sewers, under the Gate Ward: vaulted brick tunnels, a channel of slow green water down
// the middle of each, a walkway either side; the great cisterns, brick-paved chambers round a pool; iron grates and
// the Order's planks across the channels; the Order's own tunnels dug raw through the earth to its stores.
// - THE FLOOR: the walkways' flags, cool grey, wet, a sheen on them, slime where the wall sweats, coping stones along
//   the channel's edge; the cisterns paved in brick, basket-wise; grates and planks over the water; packed earth and
//   duckboards in the Order's tunnels. What lies on it: corks and green glass from the jars the rats broke into,
//   droppings, small bones, sodden blank paper, puddles holding the green.
// - THE WATER (where the level says a tile is water: not walkable): sunk UC_SINK below the walkway, the channel's far
//   wall showing down to it, its slime line at the water; slow, dark green, streaked along its flow, scum and glints.
// - THE FAR WALLS: wet brick in courses, warm where the light falls on it and cold in shade, the vault's springing
//   (a course of bricks on end) and the vault curving away into the dark above; slime low down, lime weeping from
//   the joints; culverts, pipes, iron rungs, patches of newer brick, holes where it has fallen out. Beside the
//   Order's tunnels, raw earth held up by timber props.
// - THE TOPS: the earth over the vault, dark, roots, the wall's top course catching the light.
//
// HIS RULES IT KEEPS (his art rulebook): light from the upper left, three tones or so a material (Pixels 4); its own
// palette (Colour 1), never mud-brown all over (Colour 5: the brick warm, the flags cool, the water green, the dark a
// cool blue-black); a step quieter than the figures (Places 2) and duller than any word's colour (Colour 4: every
// colour through art/act2_quiet.ts); its dark cool and deep (Colour 2); NOTHING GLOWS (Colour 3: the jars' pink is
// the pieces'); solid, not flat (Places 4); old and broken (Places 6); crisp pixels.
//
// FOR THE MAIN CHAT: `undercityLook(land)` makes the look for a level from what only the level knows: its floor,
// what each walkable tile is (UC_ZONE), and which tiles that are not floor are water (`land.water`). Water is a drop
// as the Ledge Road's is (art/terrain.ts `drop`), but painted, not clear: the look's `hang` paints the channel's wall
// and the water itself, so nothing need be laid behind the ground. Edges straight, as brickwork is.

import { T_FLOOR } from '../game/types';
import type { Floor } from '../game/types';
import type { RGB, TerrainLook } from './terrain';
import { fbm, vnoise, worldOf } from './terrain';
import { hash } from './kit';
import { quietTerrain } from './act2_quiet';

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mod = (a: number, m: number): number => ((a % m) + m) % m;
const cl01 = (v: number): number => Math.max(0, Math.min(1, v));

// ---------------------------------------------------------------------------------------------------
// THE PALETTE: wet brick, cool stone, green water, a blue-black dark

/** The deep, cool dark under everything. */
export const UC_DEEP: RGB = hex('#0a0d14');
/** THE WALKWAYS' FLAGS: the joints, the shade, the body (two), the lit edge, the wet sheen. */
export const UC_FLAG = ['#1f2029', '#2e2f39', '#3b3c46', '#45464f', '#5a5a62', '#727a7a'].map(hex);
/** THE COPING along the channel's edge: big pale stones; joint, shade, body, lit. */
export const UC_COPING = ['#26262e', '#45454c', '#56565b', '#6e6d70'].map(hex);
/**
 * THE BRICK, by how a face is turned to the light (to the lower left, lit; at the eye; to the lower right, in shade):
 * its lit edge, its body, its other body, its mortar (cool, so the wall is not mud all over).
 */
export const UC_BRICK = [
  ['#9c6550', '#83523f', '#704535', '#3a3040'],
  ['#7a4f40', '#674336', '#57392f', '#2c2634'],
  ['#4f3833', '#41302e', '#37282a', '#1c1a26'],
].map((r) => r.map(hex));
/** THE CISTERNS' PAVING, brick laid flat: joint, shade, body, body, lit. */
export const UC_PAVE = ['#211a20', '#3c2a27', '#4b332b', '#563b30', '#6e4c3a'].map(hex);
/** SLIME where the wall sweats and the water laps: dark, body, lit. */
export const UC_SLIME = ['#1e271c', '#2f3b24', '#45522f'].map(hex);
/** LIME weeping from the joints: pale, paler. */
export const UC_LIME = ['#7c7b72', '#99978a'].map(hex);
/** THE WATER: the deep, its body (two), a streak along its flow, its scum, a glint, foam. */
export const UC_WATER = ['#0d1513', '#14221c', '#1a2c22', '#25392b', '#363c26', '#55715a', '#5f6b5c'].map(hex);
/** IRON (grates, rungs, pipes): its dark, body, lit; and its rust. */
export const UC_IRON = ['#16171d', '#2a2b33', '#45454d'].map(hex);
export const UC_RUST = ['#3e2620', '#5c3624'].map(hex);
/** THE ORDER'S TIMBER (planks, props, duckboards): its gaps, shade, body, lit. */
export const UC_TIMBER = ['#130f10', '#2b211d', '#3d2e25', '#4f3c2e'].map(hex);
/** RAW EARTH where the Order dug: dark, body, lit, a stone in it. */
export const UC_EARTH = ['#17130f', '#271f1a', '#352a22', '#4a4038'].map(hex);
/** What lies about: a cork (lit, shade), a shard of the jars' green glass (body, its glint), bone, sodden paper. */
export const UC_CORK = ['#7a6448', '#55442f'].map(hex);
export const UC_GLASS = ['#2f4a35', '#6e8a6c'].map(hex);
export const UC_BONE = ['#a49c8a', '#6f685c'].map(hex);
export const UC_PAPER = ['#8c887c', '#6a675f'].map(hex);

// ---------------------------------------------------------------------------------------------------
// THE PICTURE'S OWN GRID: along the world's x and y, 64 to a tile

const alongX = (px: number, py: number): number => px + 2 * py + 1.5;
const alongY = (px: number, py: number): number => 2 * py - px + 0.5;

// ---------------------------------------------------------------------------------------------------
// WHAT ONLY THE LEVEL KNOWS

/** What a walkable tile is. */
export const UC_ZONE = {
  /** A walkway beside a channel, or any tunnel's floor: flags. */
  Walk: 0,
  /** A cistern's floor: brick paving. */
  Cistern: 1,
  /** An iron grate laid over the water: walkable. */
  Grate: 2,
  /** The Order's planks laid over the water: walkable. */
  Planks: 3,
  /** The Order's own tunnel, dug raw: packed earth, duckboards. */
  Dug: 4,
} as const;

export interface UndercityLand {
  /** The level's tiles, as the game walks them (a grate or planks over the water are floor). */
  floor: Floor;
  /** What a walkable tile is (UC_ZONE); a walkway where not said. */
  zone?: (tx: number, ty: number) => number;
  /** Which tiles that are not floor are water (the channels, the cisterns' pools, the outflow): not walkable. */
  water: (tx: number, ty: number) => boolean;
}

/** How far the water lies below the walkways (picture pixels): the channel's wall shows this tall above it. */
export const UC_SINK = 22;
/** How tall the tunnels' walls stand over the floor (picture pixels): the vault springs at UC_SPRING. */
export const UC_RISE = 112;
export const UC_SPRING = 76;

/** How far each place is from the nearest tile that `is` (tiles), held as a grid, 4 cells to a tile. */
function distanceTo(w: number, h: number, is: (tx: number, ty: number) => boolean): (x: number, y: number) => number {
  const K = 4;
  const W = w * K;
  const H = h * K;
  const d = new Float32Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) d[j * W + i] = is(Math.floor(i / K), Math.floor(j / K)) ? 0 : 1e9;
  const D2 = Math.SQRT2;
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const c = j * W + i;
      let v = d[c];
      if (i > 0) v = Math.min(v, d[c - 1] + 1);
      if (j > 0) {
        v = Math.min(v, d[c - W] + 1);
        if (i > 0) v = Math.min(v, d[c - W - 1] + D2);
        if (i + 1 < W) v = Math.min(v, d[c - W + 1] + D2);
      }
      d[c] = v;
    }
  }
  for (let j = H - 1; j >= 0; j--) {
    for (let i = W - 1; i >= 0; i--) {
      const c = j * W + i;
      let v = d[c];
      if (i + 1 < W) v = Math.min(v, d[c + 1] + 1);
      if (j + 1 < H) {
        v = Math.min(v, d[c + W] + 1);
        if (i + 1 < W) v = Math.min(v, d[c + W + 1] + D2);
        if (i > 0) v = Math.min(v, d[c + W - 1] + D2);
      }
      d[c] = v;
    }
  }
  return (x, y) => {
    const i = Math.max(0, Math.min(W - 1, Math.floor(x * K)));
    const j = Math.max(0, Math.min(H - 1, Math.floor(y * K)));
    return (d[j * W + i] - 0.5) / K;
  };
}

// ---------------------------------------------------------------------------------------------------
// THE FLOOR

/** What lies on a walkway or a cistern's floor: corks and green glass, droppings, small bones, sodden paper; puddles. Null where nothing. */
function litter(x: number, y: number, px: number, py: number, wall: number, k: number): RGB | null {
  // a puddle in the hollows: dark water lying on the stone, the dark of the vault in it, a glint at its far edge
  const pf = fbm(x * 0.8 + 21, y * 0.8, 3131 + k);
  if (pf > 0.77) {
    if (pf < 0.776) return UC_FLAG[1];
    if (pf < 0.79 && mod(alongX(px, py) + Math.floor(vnoise(x * 3, y * 3, 3132) * 40), 11) < 2) return UC_FLAG[5];
    return mixc(UC_FLAG[1], UC_DEEP, pf > 0.81 ? 0.38 : 0.22);
  }
  // a cork: a little round of pale bark, its shaded side
  const cx = Math.floor(px / 11);
  const cy = Math.floor(py / 7);
  // (the corks and the glass lie where the rats broke into a crate of jars: in drifts, not all over)
  const drift = vnoise(x * 0.35 + 5, y * 0.35, 3140) > 0.62 ? 1 : 0.15;
  if (hash(cx, cy, 3141 + k) < (0.016 + (wall < 0.7 ? 0.01 : 0)) * drift) {
    const ax = cx * 11 + 3 + Math.floor(hash(cx, cy, 3142) * 4);
    const ay = cy * 7 + 2 + Math.floor(hash(cx, cy, 3143) * 2);
    const dx = px - ax;
    const dy = py - ay;
    if (dx >= 0 && dx < 3 && dy >= 0 && dy < 2) return dy === 0 && dx < 2 ? UC_CORK[0] : UC_CORK[1];
  }
  // a shard of green glass: a short slant, a glint at its end
  const gx = Math.floor(px / 9);
  const gy = Math.floor(py / 6);
  if (hash(gx, gy, 3151 + k) < 0.02 * drift) {
    const ax = gx * 9 + 2 + Math.floor(hash(gx, gy, 3152) * 4);
    const ay = gy * 6 + 2;
    const dx = px - ax;
    const flip = hash(gx, gy, 3153) < 0.5;
    if (dx >= 0 && dx < 3 && py - ay === (flip ? dx >> 1 : -(dx >> 1))) return dx === 2 ? UC_GLASS[1] : UC_GLASS[0];
  }
  // droppings by the walls: a few dark grains
  if (wall < 0.5 && hash(px >> 1, py, 3161 + k) < 0.012 && hash(Math.floor(px / 12), Math.floor(py / 8), 3162) < 0.35) return UC_FLAG[0];
  // a small bone: three pale pixels and a knob
  const bx = Math.floor(px / 23);
  const by = Math.floor(py / 13);
  if (hash(bx, by, 3171 + k) < 0.012) {
    const ax = bx * 23 + 4 + Math.floor(hash(bx, by, 3172) * 10);
    const ay = by * 13 + 4 + Math.floor(hash(bx, by, 3173) * 4);
    const dx = px - ax;
    if (py === ay && dx >= 0 && dx < 4) return dx === 0 || dx === 3 ? UC_BONE[0] : UC_BONE[1];
  }
  // a sodden scrap of blank paper, lying along the grid
  const sx = Math.floor(px / 17);
  const sy = Math.floor(py / 11);
  if (hash(sx, sy, 3181 + k) < 0.012) {
    const ax = sx * 17 + 3 + Math.floor(hash(sx, sy, 3182) * 6);
    const ay = sy * 11 + 3 + Math.floor(hash(sx, sy, 3183) * 4);
    const dx = px - ax;
    const dy = py - ay;
    const slope = Math.floor(dx / 2);
    if (dx >= 0 && dx < 7 && dy - slope >= 0 && dy - slope < 3) return dy - slope === 2 ? UC_PAPER[1] : UC_PAPER[0];
  }
  return null;
}

/** THE WALKWAYS' FLAGS: slabs in rows along x, wet: darker by the walls, a sheen on them, slime where the wall sweats. */
function flags(x: number, y: number, px: number, py: number, wall: number): RGB {
  const U = alongX(px, py);
  const V = alongY(px, py);
  const SV = 30;
  const j = Math.floor(V / SV);
  const len = 40 + Math.floor(hash(j, 0, 3201) * 3) * 6;
  const off = Math.floor(hash(j, 1, 3201) * len);
  const i = Math.floor((U + off) / len);
  const u = mod(U + off, len);
  const v = mod(V, SV);
  const h0 = hash(i, j, 3202);
  const t = h0 > 0.7 ? 3 : h0 < 0.25 ? 1 : 2;
  let c = UC_FLAG[t];
  if (u < 2 || v < 2) c = UC_FLAG[0];
  else if (u < 3 || v < 3) c = UC_FLAG[Math.min(4, t + 1)];
  else if (u >= len - 2 || v >= SV - 2) c = UC_FLAG[1];
  else {
    // the wet sheen: a pale streak across a slab now and then, catching the light
    const sh = mod(U - 2 * V + Math.floor(h0 * 60), 53);
    if (h0 > 0.45 && sh < 1.2 && vnoise(x * 2.5, y * 2.5, 3203) > 0.45) c = UC_FLAG[5];
    // a slab cracked across
    if (h0 > 0.9 && mod(U + V + Math.floor(h0 * 70), 43) < 1) c = UC_FLAG[0];
  }
  // wet and dark by the walls, the slime where the wall sweats onto the floor
  const damp = wall < 0.3 + 0.25 * vnoise(x * 2.2, y * 2.2, 3204);
  if (damp) c = mixc(c, UC_DEEP, 0.3);
  if (wall < 0.16 + 0.14 * vnoise(x * 3.1, y * 3.1, 3205)) c = hash(px, py, 3206) < 0.6 ? UC_SLIME[1] : UC_SLIME[0];
  return c;
}

/** THE COPING along the channel's edge: long pale stones laid along it, their edge over the water catching the light. */
function coping(x: number, y: number, px: number, py: number, water: number): RGB {
  const U = alongX(px, py);
  const V = alongY(px, py);
  const S = 36;
  const k = Math.floor((U + V) / S);
  const h0 = hash(k, Math.floor(x * 0.25 + y * 0.25), 3211);
  let c = h0 > 0.6 ? UC_COPING[3] : UC_COPING[2];
  if (mod(U + V, S) < 2) c = UC_COPING[0];
  if (water < 0.05) c = UC_COPING[3];
  else if (water > 0.15) c = UC_COPING[1];
  // a wet lip of slime where the water splashes it
  if (water < 0.1 && vnoise(x * 4, y * 4, 3212) > 0.6) c = UC_SLIME[2];
  return c;
}

/** THE CISTERN'S BRICK, laid flat, basket-wise (two bricks one way, two the other): in a band round the pool and along the walls. */
function brickPaving(px: number, py: number): RGB {
  const U = alongX(px, py);
  const V = alongY(px, py);
  const C = 32;
  const i = Math.floor(U / C);
  const j = Math.floor(V / C);
  const u = mod(U, C);
  const v = mod(V, C);
  const across = (i + j) & 1;
  const a = across ? u : v;
  const b = across ? v : u;
  const half = a < C / 2 ? 0 : 1;
  const ha = mod(a, C / 2);
  const h0 = hash(i * 2 + half, j, 3221 + across);
  let c = UC_PAVE[h0 > 0.66 ? 3 : h0 < 0.2 ? 1 : 2];
  if (ha < 1 || b < 1) c = UC_PAVE[0];
  else if (ha < 2 || b < 2) c = UC_PAVE[4];
  else if (ha >= C / 2 - 1 || b >= C - 1) c = UC_PAVE[1];
  return c;
}

/** THE CISTERN'S FLOOR: great square flags, cool, wet, a sheen in their hollows; a band of brick round the pool and along the walls. */
function cistern(x: number, y: number, px: number, py: number, wall: number, water: number): RGB {
  let c: RGB;
  if (water < 1.05 || wall < 0.62) c = brickPaving(px, py);
  else {
    const U = alongX(px, py);
    const V = alongY(px, py);
    const SZ = 64;
    const i = Math.floor(U / SZ);
    const j = Math.floor(V / SZ);
    const u = mod(U, SZ);
    const v = mod(V, SZ);
    const h0 = hash(i, j, 3227);
    const t = h0 > 0.86 ? 3 : h0 < 0.12 ? 1 : 2;
    c = UC_FLAG[t];
    if (u < 2 || v < 2) c = UC_FLAG[0];
    else if (u < 3 || v < 3) c = UC_FLAG[Math.min(4, t + 1)];
    else if (u >= SZ - 2 || v >= SZ - 2) c = UC_FLAG[1];
    else if (h0 > 0.4 && mod(U - 2 * V + Math.floor(h0 * 70), 61) < 1.2 && vnoise(x * 2, y * 2, 3228) > 0.45) c = UC_FLAG[5];
    if (h0 > 0.88 && mod(U * 0.5 + V + Math.floor(h0 * 90), 47) < 1) c = UC_FLAG[0];
  }
  // the brick band's edge where it meets the flags: a line of shade
  if (water >= 1.05 && wall >= 0.62 && (water < 1.1 || wall < 0.67)) c = UC_PAVE[0];
  // wet and dark by the walls; slime where they sweat
  if (wall < 0.35 + 0.2 * vnoise(x * 2, y * 2, 3222)) c = mixc(c, UC_DEEP, 0.3);
  if (wall < 0.14 + 0.12 * vnoise(x * 3, y * 3, 3225)) c = UC_SLIME[hash(px, py, 3226) < 0.5 ? 1 : 0];
  return c;
}

/** The water's own colour at world (x, y) on its surface, `under` picture pixels below the far wall's foot. */
function waterAt(x: number, y: number, px: number, py: number, under: number, along: 'x' | 'y' | 'still', edge: number): RGB {
  const deep = fbm(x * 0.45 + 7, y * 0.45, 3301);
  let c = deep > 0.55 ? UC_WATER[2] : UC_WATER[1];
  if (along !== 'still') {
    // streaks along its flow, slow
    const s = along === 'x' ? vnoise(x * 0.6, y * 6.5, 3302) : vnoise(x * 6.5, y * 0.6, 3302);
    if (s > 0.74) c = UC_WATER[3];
    else if (s < 0.18) c = UC_WATER[0];
    // scum floating in slow rafts, drawn out along the flow
    const sc = along === 'x' ? fbm(x * 0.7 + 3, y * 2.2, 3305) : fbm(x * 2.2 + 3, y * 0.7, 3305);
    if (sc > 0.76) c = hash(px >> 1, py, 3306) < 0.7 ? UC_WATER[4] : UC_SLIME[1];
  } else {
    // still water: broad slow swells, darker toward its middle
    c = deep > 0.6 ? UC_WATER[2] : deep < 0.4 ? UC_WATER[0] : UC_WATER[1];
    if (edge > 1.2) c = mixc(c, UC_DEEP, 0.25);
    // a few small rafts of scum
    const sc = fbm(x * 1.3 + 3, y * 1.3, 3305);
    if (sc > 0.79) c = hash(px >> 1, py, 3306) < 0.75 ? UC_WATER[4] : UC_SLIME[1];
    // rings spreading where a drip has fallen from the vault
    const cx = Math.floor(x / 2.3);
    const cy = Math.floor(y / 2.3);
    if (hash(cx, cy, 3309) < 0.4) {
      const dx = x - (cx + 0.3 + 0.4 * hash(cx, cy, 3310)) * 2.3;
      const dy = y - (cy + 0.3 + 0.4 * hash(cx, cy, 3311)) * 2.3;
      const d = Math.hypot(dx, dy);
      const r0 = 0.25 + 0.5 * hash(cx, cy, 3312);
      for (const r of [r0, r0 + 0.22, r0 + 0.4]) if (Math.abs(d - r) < 0.025 && r < 1.1) c = mixc(c, UC_WATER[3], 1 - r);
    }
  }
  // the far wall's reflection, dark, broken by the ripples
  if (under < 10 + 3 * vnoise(px * 0.2, 0, 3304)) c = mixc(c, UC_DEEP, 0.55);
  // foam where it laps at the walls
  if (edge < 0.1 && hash(px, py, 3307) < 0.35) c = UC_WATER[6];
  // a glint here and there
  if (hash(px >> 1, py, 3308) < 0.006 + (c === UC_WATER[3] ? 0.02 : 0)) c = UC_WATER[5];
  return c;
}

/** AN IRON GRATE over the water: bars across the way over, a frame where it sits on the channel's walls, the water dark between. `walkX`: one walks over it along x. */
function grate(x: number, y: number, px: number, py: number, walkX: boolean): RGB {
  const A = walkX ? alongY(px, py) : alongX(px, py);
  const B = walkX ? alongX(px, py) : alongY(px, py);
  const a = mod(A, 10);
  const b = mod(B, 40);
  // the frame along its two sides over the walls
  const side = walkX ? y - Math.floor(y) : x - Math.floor(x);
  if (side < 0.08 || side > 0.92) return side < 0.04 || side > 0.96 ? UC_IRON[0] : UC_IRON[2];
  // the bars, along the way over, and a cross-bar now and then
  if (a < 3) return a === 0 ? UC_IRON[2] : mod(B, 7) === 0 ? UC_RUST[0] : UC_IRON[1];
  if (b < 3) return b === 0 ? UC_IRON[2] : UC_IRON[1];
  // between: the water dark below, a glint
  return hash(px, py, 3311) < 0.04 ? UC_WATER[3] : hash(px, py, 3312) < 0.5 ? UC_WATER[0] : UC_DEEP;
}

/** THE ORDER'S PLANKS over the water: boards along the way over, gaps between, nails, wet. */
function planks(x: number, y: number, px: number, py: number, walkX: boolean): RGB {
  const A = walkX ? alongY(px, py) : alongX(px, py);
  const B = walkX ? alongX(px, py) : alongY(px, py);
  const W = 11;
  const k = Math.floor(A / W);
  const a = mod(A, W);
  const h0 = hash(k, Math.floor(B / 160), 3321);
  if (a < 1) return hash(px, py, 3322) < 0.3 ? UC_WATER[1] : UC_TIMBER[0];
  let c = h0 > 0.6 ? UC_TIMBER[3] : UC_TIMBER[2];
  if (a < 2) c = UC_TIMBER[3];
  else if (a >= W - 1) c = UC_TIMBER[1];
  // the grain; nails where it crosses the walls
  if (mod(B + Math.floor(h0 * 40), 29) < 1 && a > 2 && a < W - 2) c = UC_TIMBER[1];
  const side = walkX ? y - Math.floor(y) : x - Math.floor(x);
  if ((side < 0.12 || side > 0.88) && a === Math.floor(W / 2) && mod(B, 6) < 1) c = UC_IRON[2];
  // wet and dark at the ends, where they rest on the coping
  if (side < 0.06 || side > 0.94) c = mixc(c, UC_DEEP, 0.4);
  return c;
}

/** THE ORDER'S TUNNEL: packed earth in slow patches, trodden darker down the middle, stones in it, a duckboard of planks along the way. */
function dug(x: number, y: number, px: number, py: number, wall: number, walkX: boolean, narrow: boolean): RGB {
  const f0 = fbm(x * 0.9, y * 0.9, 3332);
  let c = f0 > 0.58 ? UC_EARTH[1] : f0 < 0.38 ? UC_EARTH[3] : UC_EARTH[2];
  if (hash(px >> 1, py >> 1, 3331) < 0.05) c = UC_EARTH[0];
  // a stone set in it, lit on its upper left
  const sx = Math.floor(px / 9);
  const sy = Math.floor(py / 6);
  if (hash(sx, sy, 3334) < 0.05) {
    const dx = px - sx * 9 - 4;
    const dy = py - sy * 6 - 3;
    if (dx * dx + 2 * dy * dy < 7) c = dx + dy < 0 ? UC_FLAG[4] : UC_FLAG[2];
  }
  // the duckboards: short planks laid across the way, end to end, down its middle (gaps between some)
  if (narrow && wall > 0.5) {
    const A = walkX ? alongX(px, py) : alongY(px, py);
    const k = Math.floor(A / 13);
    if (hash(k, Math.floor((walkX ? y : x) * 2), 3333) < 0.8) {
      const a = mod(A, 13);
      c = a < 2 ? UC_TIMBER[0] : a < 3 ? UC_TIMBER[3] : hash(k, 1, 3335) < 0.5 ? UC_TIMBER[2] : UC_TIMBER[1];
    }
  }
  if (wall < 0.25) c = mixc(c, UC_DEEP, 0.35);
  return c;
}

// ---------------------------------------------------------------------------------------------------
// THE WALLS

/** A face's row of colours by how it is turned to the light: 0 lit, 1 at the eye, 2 in shade. */
const rowOf = (shade: number): number => (shade > 0.35 ? 0 : shade < -0.35 ? 2 : 1);

/** A feature along a wall, one to every 96 picture pixels or so, steady from run to run. */
interface Bay {
  key: number;
  /** Where along it (0 at its left edge) and how wide. */
  u: number;
  w: number;
  /** 0 bare, 1 a culvert, 2 a pipe, 3 iron rungs, 4 a patch of newer brick, 5 a hole where the brick has fallen. */
  kind: number;
}
function bayAt(px: number): Bay {
  const SPAN = 96;
  const k = Math.floor(px / SPAN);
  const h = hash(k, 0, 3401);
  const kind = h < 0.2 ? 1 : h < 0.36 ? 2 : h < 0.48 ? 3 : h < 0.62 ? 4 : h < 0.72 ? 5 : 0;
  return { key: k, u: px - k * SPAN, w: SPAN, kind };
}

/**
 * A BRICK WALL `v` picture pixels over its foot (negative: below it, down to the water), its row of colours `row`:
 * courses of stretchers, each brick its own, the joints recessed (a brick's top edge catching the light).
 */
function brick(v: number, px: number, row: number): RGB {
  const B = UC_BRICK[row];
  const CH = 6;
  const course = Math.floor(v / CH);
  const cv = mod(v, CH);
  const L = 14;
  const off = (course & 1) * 7;
  const bu = mod(px + off, L);
  const bi = Math.floor((px + off) / L);
  const h0 = hash(bi, course, 3411);
  let c = B[h0 > 0.62 ? 2 : 1];
  // a brick replaced, paler; one burnt dark
  if (h0 > 0.95) c = mixc(B[0], UC_LIME[0], 0.25);
  else if (h0 < 0.04) c = mixc(B[2], UC_DEEP, 0.35);
  if (cv === CH - 1 || bu === L - 1) return B[3];
  if (cv === CH - 2 && row < 2) return mixc(c, B[0], 0.6);
  if (bu === 0 && row === 0) return mixc(c, B[0], 0.5);
  return c;
}

/** THE TUNNELS' FAR WALLS: wet brick up to the vault's springing, the vault curving away into the dark, and what is on it. */
function wallFace(shade: number, v: number, px: number, x: number, y: number): RGB {
  const row = rowOf(shade + (hash(Math.floor(px / 96), 9, 3402) - 0.5) * 0.1);
  const bay = bayAt(px);
  const u = bay.u;
  // --- the vault: above the springing, its courses curving away, sinking into the dark
  if (v >= UC_SPRING + 5) {
    const k = (v - UC_SPRING - 5) / (UC_RISE - UC_SPRING - 5);
    const c = brick(v, px, Math.min(2, row + 1));
    // (a drip of lime and a root hanging down out of the vault's joints here and there)
    if (mod(px, 41) === 7 && hash(Math.floor(px / 41), 0, 3412) < 0.4 && k < 0.7) return UC_TIMBER[1];
    return mixc(c, UC_DEEP, 0.38 + 0.58 * k);
  }
  // --- the springing: a course of bricks on end
  if (v >= UC_SPRING) {
    const B = UC_BRICK[row];
    if (v === UC_SPRING + 4 || v === UC_SPRING) return B[3];
    return mod(px, 5) === 4 ? B[3] : v === UC_SPRING + 3 ? mixc(B[0], UC_LIME[0], 0.3) : B[0];
  }
  let c = brick(v, px, row);
  // --- what is on the wall, bay by bay
  if (bay.kind === 1) {
    // A CULVERT low in the wall: an arched mouth, dark inside, a grille of iron across it, a trickle of green out of
    // it and down the wall; its ring of bricks on end round the arch
    const cx = 24 + Math.floor(hash(bay.key, 1, 3403) * 30);
    const r = 13;
    const du = u - cx;
    const top = 16 + Math.sqrt(Math.max(0, r * r - du * du)) * 0.9;
    if (Math.abs(du) < r && v < top) {
      if (mod(du + 40, 6) === 0 && v > 2) return mod(v, 9) === 0 ? UC_RUST[1] : UC_IRON[1];
      if (v < 3) return hash(px, v, 3404) < 0.5 ? UC_WATER[3] : UC_SLIME[2];
      return mixc(UC_DEEP, UC_SLIME[0], 0.2 * (1 - v / top));
    }
    if (Math.abs(du) < r + 4 && v < top + 4 && v >= 0) {
      // its ring of bricks on end round the arch (straight jambs below its springing), radial joints between
      const B = UC_BRICK[row];
      if (v < 16) return mod(v, 6) === 5 ? B[3] : du < 0 ? B[0] : B[1];
      const a = Math.atan2(v - 16, du);
      return mod(a * 5.5, 1) < 0.16 ? B[3] : a > Math.PI / 2 ? B[0] : B[1];
    }
    // the stain of what has run out of it, down the wall below and spreading at the foot
    if (Math.abs(du) < r + 8 - v * 0.2 && v < 14) c = mixc(c, UC_SLIME[1], 0.6);
  } else if (bay.kind === 2) {
    // A PIPE along the wall: iron, rusted at its joints, on brackets
    const pv = 54 + Math.floor(hash(bay.key, 2, 3403) * 8);
    if (v >= pv && v < pv + 4) {
      if (mod(px, 32) < 2) return UC_RUST[1];
      return v === pv + 3 ? UC_IRON[2] : v === pv ? UC_IRON[0] : UC_IRON[1];
    }
    if (v >= pv - 2 && v < pv + 6 && mod(px, 32) === 16) return UC_IRON[0];
    // a drip from its joint, a streak of rust below
    if (mod(px, 32) === 1 && v < pv && v > pv - 24 * hash(Math.floor(px / 32), 3, 3403)) c = mixc(c, UC_RUST[0], 0.6);
  } else if (bay.kind === 3) {
    // IRON RUNGS up the wall to a shaft above
    const lx = 30 + Math.floor(hash(bay.key, 4, 3403) * 30);
    const du = u - lx;
    if (du >= 0 && du < 11 && v > 4 && mod(v - 4, 9) < 2) return v % 9 === 5 ? UC_IRON[2] : du === 0 || du === 10 ? UC_RUST[1] : UC_IRON[1];
    if ((du === 0 || du === 10) && v > 4 && mod(v - 4, 9) === 2) return UC_RUST[0];
  } else if (bay.kind === 4) {
    // A PATCH OF NEWER BRICK, paler, its own courses
    const pu = u - 20;
    const ph = 26 + Math.floor(hash(bay.key, 5, 3403) * 30);
    if (pu >= 0 && pu < 44 && v >= 8 && v < 8 + ph) {
      const cc = brick(v + 3, px + 5, row);
      c = mixc(cc, UC_LIME[0], 0.22);
    }
  } else if (bay.kind === 5) {
    // A HOLE where the brick has fallen out: the earth behind it, a root through it, loose bricks at its edge
    const hx = 30 + Math.floor(hash(bay.key, 6, 3403) * 30);
    const hy = 30 + Math.floor(hash(bay.key, 7, 3403) * 20);
    const d = Math.hypot((u - hx) / 1.4, v - hy) + 4 * (vnoise(px * 0.3, v * 0.3, 3405) - 0.5);
    if (d < 9) {
      const e = hash(px >> 1, v, 3406);
      if (mod(px - Math.floor(v / 2), 17) === 0) return UC_TIMBER[1];
      return e < 0.6 ? UC_EARTH[0] : UC_EARTH[1];
    }
    // its broken edge: the bricks' snapped ends, lit where they face up into the light, dark where they hang over it
    if (d < 11) return v - hy < -2 ? UC_BRICK[row][0] : mixc(UC_BRICK[row][2], UC_DEEP, 0.3);
  }
  // lime weeping from the joints, in pale streaks down the wall
  const sk = Math.floor(px / 3);
  if (hash(sk, 0, 3407) < 0.03) {
    const from = 30 + hash(sk, 1, 3407) * 40;
    const len = 8 + hash(sk, 2, 3407) * 30;
    if (v < from && v > from - len && mod(px, 3) === 1) c = mixc(c, UC_LIME[v > from - 3 ? 1 : 0], 0.55);
  }
  // damp low down, the slime where the floor's wet meets it
  if (v < 22) c = mixc(c, UC_DEEP, 0.18 * (1 - v / 22));
  const slime = 5 + 6 * vnoise(px * 0.08, 0.5, 3408) + 3 * vnoise(px * 0.4, 1.5, 3409);
  if (v < slime) c = v < slime - 2 ? UC_SLIME[hash(px, v, 3410) < 0.5 ? 1 : 0] : UC_SLIME[2];
  void x;
  void y;
  return c;
}

/** BESIDE THE ORDER'S TUNNEL, the earth it was dug through: raw, in layers, stones in it, roots; timber props and a lintel holding it up. */
function earthFace(shade: number, v: number, px: number): RGB {
  const row = rowOf(shade);
  const T = row === 0 ? UC_TIMBER[3] : row === 1 ? UC_TIMBER[2] : UC_TIMBER[1];
  // the props, every 44 picture pixels, a lintel across them
  const pu = mod(px, 44);
  if (v < 64 && pu < 4) return pu === 0 ? UC_TIMBER[0] : pu === 1 && row < 2 ? UC_TIMBER[3] : pu === 3 ? UC_TIMBER[1] : T;
  if (v >= 60 && v < 65) return v === 64 ? UC_TIMBER[3] : v === 60 ? UC_TIMBER[0] : T;
  // the earth in layers, wavering, darker and lighter bands
  const band = Math.floor((v + 6 * vnoise(px * 0.05, 0.5, 3422)) / 9);
  let c = UC_EARTH[[1, 2, 1, 0, 2][mod(band, 5)]];
  if (row === 2) c = mixc(c, UC_DEEP, 0.35);
  else if (row === 0 && mod(band, 5) === 1) c = UC_EARTH[3];
  // a stone in it, lit on its top
  const sx = Math.floor(px / 13);
  const sv = Math.floor(v / 9);
  if (hash(sx, sv, 3423) < 0.12) {
    const dx = px - sx * 13 - 6;
    const dv = v - sv * 9 - 4;
    if (dx * dx + 3 * dv * dv < 14) c = dv > 1 ? UC_FLAG[4] : UC_FLAG[2];
  }
  // a root hanging out of it
  if (mod(px + Math.floor(v / 3), 31) === 0 && hash(Math.floor(px / 31), 0, 3424) < 0.5 && v > 30) c = UC_TIMBER[1];
  if (v > 64) c = mixc(c, UC_DEEP, 0.3 + 0.5 * cl01((v - 64) / 40));
  if (v < 3) c = mixc(c, UC_DEEP, 0.4);
  return c;
}

/** THE TOP: the earth over the vault, dark, roots in it; the wall's top course catching the light at its edge. */
function topAt(x: number, y: number, px: number, py: number, back: number): RGB {
  if (back < 0.06) return mod(px + (Math.floor(py / 3) & 1) * 5, 10) === 0 ? UC_BRICK[1][3] : UC_BRICK[1][1];
  if (back < 0.1) return UC_BRICK[2][2];
  const r = hash(px >> 1, py, 3431);
  let c = r < 0.6 ? UC_EARTH[0] : r < 0.9 ? mixc(UC_EARTH[0], UC_EARTH[1], 0.5) : UC_EARTH[1];
  // roots, wandering
  const root = Math.abs(vnoise(x * 1.7, y * 1.7, 3432) - 0.5);
  if (root < 0.018) c = UC_TIMBER[1];
  return mixc(c, UC_DEEP, 0.25 + 0.5 * cl01(back));
}

/** A near wall's face, in shadow, cut down (his rule for near cliffs): brick, dark. */
function nearFace(v: number, px: number): RGB {
  const c = brick(v, px, 2);
  if (v >= 36) return mixc(UC_BRICK[2][0], UC_DEEP, 0.3);
  return mixc(c, UC_DEEP, 0.5);
}

/** UNDER AN EDGE OVER THE WATER, `v` below it: the channel's wall, slimed, down to the water; then the water. */
function underEdge(v: number, px: number, py: number, shade: number, alongOf: (x: number, y: number) => 'x' | 'y' | 'still', edgeOf: (x: number, y: number) => number): RGB {
  if (v < UC_SINK) {
    const row = rowOf(shade);
    let c = brick(-v - 1, px, Math.min(2, row + 1));
    c = mixc(c, UC_SLIME[0], 0.25 + 0.5 * (v / UC_SINK));
    const line = UC_SINK - 3 - Math.floor(2 * vnoise(px * 0.15, 0, 3441));
    if (v >= line) return v === UC_SINK - 1 ? UC_SLIME[0] : UC_SLIME[2];
    return c;
  }
  const [x, y] = worldOf(px, py - UC_SINK);
  return waterAt(x, y, px, py, v - UC_SINK, alongOf(x, y), edgeOf(x, y));
}

// ---------------------------------------------------------------------------------------------------
// THE LOOK

export function undercityLook(land: UndercityLand): TerrainLook {
  const f = land.floor;
  const inMap = (tx: number, ty: number): boolean => tx >= 0 && ty >= 0 && tx < f.w && ty < f.h;
  const isFloor = (tx: number, ty: number): boolean => inMap(tx, ty) && f.tiles[ty * f.w + tx] === T_FLOOR;
  const isWater = (tx: number, ty: number): boolean => !isFloor(tx, ty) && land.water(tx, ty);
  const zoneAt = (tx: number, ty: number): number => (land.zone ? land.zone(tx, ty) : UC_ZONE.Walk);
  // how far each place is from a wall (not floor, not water), and from the water
  const wall = distanceTo(f.w, f.h, (tx, ty) => !isFloor(tx, ty) && !land.water(tx, ty));
  const water = distanceTo(f.w, f.h, (tx, ty) => isWater(tx, ty));
  // within the water, how far from its edge
  const edge = distanceTo(f.w, f.h, (tx, ty) => !land.water(tx, ty) || isFloor(tx, ty));
  // which way the water runs at each tile: along the longer run of water through it; still in a wide pool
  const runOf = (tx: number, ty: number, dx: number, dy: number): number => {
    let n = 0;
    for (let s = 1; s <= 4; s++) if (land.water(tx + dx * s, ty + dy * s) || isFloor(tx + dx * s, ty + dy * s) && (zoneAt(tx + dx * s, ty + dy * s) === UC_ZONE.Grate || zoneAt(tx + dx * s, ty + dy * s) === UC_ZONE.Planks)) n++;
    else break;
    return n;
  };
  const alongCache = new Map<number, 'x' | 'y' | 'still'>();
  const alongOf = (x: number, y: number): 'x' | 'y' | 'still' => {
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    const key = ty * 4096 + tx;
    let a = alongCache.get(key);
    if (!a) {
      const ax = runOf(tx, ty, 1, 0) + runOf(tx, ty, -1, 0);
      const ay = runOf(tx, ty, 0, 1) + runOf(tx, ty, 0, -1);
      a = ax >= 5 && ay >= 5 ? 'still' : ax >= ay ? 'x' : 'y';
      alongCache.set(key, a);
    }
    return a;
  };
  /** The Order's tunnel: does it run along x (more of it either side along x than along y)? */
  const dugAlongX = (tx: number, ty: number): boolean => {
    let ax = 0;
    let ay = 0;
    for (let s2 = 1; s2 <= 3; s2++) {
      if (isFloor(tx + s2, ty) && zoneAt(tx + s2, ty) === UC_ZONE.Dug) ax++;
      if (isFloor(tx - s2, ty) && zoneAt(tx - s2, ty) === UC_ZONE.Dug) ax++;
      if (isFloor(tx, ty + s2) && zoneAt(tx, ty + s2) === UC_ZONE.Dug) ay++;
      if (isFloor(tx, ty - s2) && zoneAt(tx, ty - s2) === UC_ZONE.Dug) ay++;
    }
    return ax >= ay;
  };
  /** The Order's tunnel: is it narrow here (three tiles across or fewer), a way through rather than a room? */
  const dugNarrow = (tx: number, ty: number): boolean => {
    const ax = dugAlongX(tx, ty);
    let n = 1;
    for (const d of [1, -1]) for (let s2 = 1; s2 <= 3; s2++) {
      const ux = ax ? tx : tx + d * s2;
      const uy = ax ? ty + d * s2 : ty;
      if (isFloor(ux, uy) && zoneAt(ux, uy) === UC_ZONE.Dug) n++;
      else break;
    }
    return n <= 3;
  };
  /** A grate or planks: is the way over it along x (the water either side of it along y)? */
  const walksX = (tx: number, ty: number): boolean => land.water(tx, ty - 1) || land.water(tx, ty + 1) || !(land.water(tx - 1, ty) || land.water(tx + 1, ty));
  return quietTerrain({
    rise: UC_RISE,
    near: 40,
    // the edges straight, as brickwork is
    round: 0.12,
    rag: 0,
    fine: 0,
    seed: 121,
    floor: (x, y, px, py) => {
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      const z = isFloor(tx, ty) ? zoneAt(tx, ty) : UC_ZONE.Walk;
      const wd = wall(x, y);
      if (z === UC_ZONE.Grate) return grate(x, y, px, py, !walksX(tx, ty));
      if (z === UC_ZONE.Planks) return planks(x, y, px, py, !walksX(tx, ty));
      if (z === UC_ZONE.Dug) return dug(x, y, px, py, wd, dugAlongX(tx, ty), dugNarrow(tx, ty));
      const wa = water(x, y);
      if (wa < 0.22) return coping(x, y, px, py, wa);
      const left = litter(x, y, px, py, wd, z);
      if (left) return left;
      return z === UC_ZONE.Cistern ? cistern(x, y, px, py, wd, wa) : flags(x, y, px, py, wd);
    },
    face: (shade, v, px, py, x, y) => {
      // beside the Order's tunnel: the earth it was dug through
      const fx = shade < 0 ? x + 0.3 : x;
      const fy = shade < 0 ? y : y + 0.3;
      const tx = Math.floor(fx);
      const ty = Math.floor(fy);
      if (isFloor(tx, ty) && zoneAt(tx, ty) === UC_ZONE.Dug) return earthFace(shade, v, px);
      return wallFace(shade, v, px, x, y);
    },
    top: (x, y, px, py, back) => topAt(x, y, px, py, back),
    nearFace: (v, px) => nearFace(v, px),
    brow: (c) => mixc(c, [150, 140, 150], 0.22),
    foot: [0.42, 0.24],
    turnOver: 0.2,
    nearShadow: { reach: 1.0, dark: [0.32, 0.2] },
    drop: (tx, ty) => isWater(tx, ty),
    lip: (c) => mixc(c, UC_COPING[3], 0.5),
    hang: { tall: 520, at: (v, px, py, shade) => underEdge(v, px, py, shade, alongOf, edge) },
  });
}
