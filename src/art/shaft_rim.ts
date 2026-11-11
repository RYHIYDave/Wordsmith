// THE ENDLESS TOWN, THE SHAFT'S RIM: ITS GROUND (the art chat, 11 Nov 2026). Behind ENDLESS_TOWN, OFF: nothing of the game
// imports this file yet (tests/shaft_rim.test.ts holds that).
//
// His queue item, 11 Nov 2026, 10:31, “Draw a new “Endless” town for endgame purposes”; his pick of ten sketches, “1 The Shaft's
// Rim (Recommended)”; his yes to its closer mock-up, by 11:50, “Yes, lock it in and draw it (Recommended)” (offered as: this
// layout and mood get drawn to the game's standard, the pit first). The words and the layout: docs/mockups/endless_town/README.md.
//
// WHAT IS HERE: the town's GROUND, painted once into one picture at the game's fine grain (two picture pixels to a game
// pixel): the round paved rim, worn flags laid in rings round the shaft's mouth; the kerb at the brink; the rough rock past the
// rim and the round cliff at the back fading up into the dark; THE SHAFT, seen in the game's slant from the rim: its far wall
// going down storey under storey in each floor's own stone (the splash's, art/endless_stair.ts, so the town and the splash are
// one place), a doorway and a torch at each storey, THE STAIR winding down round the inside from where it leaves the rim,
// the depth lost in the dark; the portal's tongue and landing out over the drop (its stone only). And what moves, in a few small
// pictures: the torches' flames down the shaft (12 frames, at 30 a second), and the far fire, the enemy's pink burning to gold,
// one small picture the game lays over the ground with its strength breathing slowly (`pitGlowAt(t)`): far down only, inside the
// shaft only. The kerb's posts and the landing's posts are pieces that stand (`posts`), laid in depth with everything else.
//
// HOW THE GAME TAKES IT (as the camp gives its place, art/hub2_camp.ts Place): `rimPlace()` gives the tiles (RIM_W x RIM_H):
// `walk` (0 rock or cliff, 1 floor, 2 the pit: not walkable), where each of the town's own things stands (`town`, the game's
// kinds), where the new things stand (`more`: drawn in the next step), the hero's start; `paintRimGround()` the picture and
// where tile (0, 0) lies in it. The rest, the stations' pictures, are the game's own.
//
// Painted as the splash is: every pixel a line of sight, what it meets first found by its numbers; stone in flat tones, a seam
// of one pixel, light in bands, a dither only where two bands meet.

import {
  CANYON, FEN, FIRE, HIGH, IRON, MOSS, PRISON, QUARRY, TOWN, band, bay, hx, mixc, rnd,
} from './endless_splash';
import type { C, Theme } from './endless_splash';

/** THE SWITCH: off until the main chat lays the Shaft's Rim as a town, on his yes to its pictures. */
export const ENDLESS_TOWN = { on: false };

// ---------------------------------------------------------------------------------------------------------------------------
// THE PLACE, in tiles (a tile 32 x 16 game pixels, as the game's).

export const RIM_W = 24;
export const RIM_H = 24;
/** The shaft's middle; its mouth's radius; the kerb's breadth; the paved rim's edge; the cliff. */
export const RIM = { cx: 12, cy: 12, pit: 3.8, kerb: 0.32, town: 8, cliff: 9.6 } as const;
/** Where the stair leaves the brink (degrees round the shaft: 0 along +x, -90 along -y). */
export const STAIR_AT = -86;
/** The portal's tongue: the angle it goes out at, its landing's middle out from the shaft's middle, the landing's radius, the tongue's half-breadth. */
export const TONGUE = { at: 172, out: 1.75, r: 1.0, half: 0.45 } as const;
const D2R = Math.PI / 180;
const polar = (a: number, r: number): [number, number] => [RIM.cx + Math.cos(a * D2R) * r, RIM.cy + Math.sin(a * D2R) * r];
const tileOf = (a: number, r: number): [number, number] => polar(a, r).map((v) => Math.floor(v)) as [number, number];
export const LANDING = polar(TONGUE.at, TONGUE.out);

/** THE LAYOUT HE LOCKED IN (the mock-up's tiles, unchanged). */
export const RIM_LAYOUT = {
  gate: tileOf(-133, 6.9),
  record: tileOf(-158, 6.6),
  trophies: tileOf(-103, 6.9),
  way: tileOf(-80, 4.3),
  forge: tileOf(-28, 7.3),
  tentBack: tileOf(8, 6.3),
  wordsmith: tileOf(106, 5.5),
  lexicon: tileOf(142, 5.6),
  stash: tileOf(160, 6.6),
  stranger: tileOf(-178, 7.4),
  braziers: [tileOf(-122, 7.7), tileOf(-145, 7.7), tileOf(-62, 7.5), tileOf(40, 7.4), tileOf(72, 7.4), tileOf(128, 7.6)],
  torches: [[6.6, 15.2], [7.3, 15.6], [16.7, 9.0], [6.6, 10.4]] as [number, number][],
};

export type RimKind = 'forge' | 'anvil' | 'rack' | 'trough' | 'tentBack' | 'tentTable' | 'rug' | 'runeRing' | 'runeSlab' | 'runeStone' | 'lexicon' | 'stash' | 'brazier' | 'waypoint' | 'armourer' | 'mystic' | 'wordsmith' | 'stranger';
export interface RimLaid { kind: RimKind; x: number; y: number; v?: number }
export interface RimPlace {
  name: string;
  w: number;
  h: number;
  /** A tile's ground: 0 rock or cliff (not walkable), 1 floor, 2 the pit (not walkable). */
  walk: Uint8Array;
  /** The town's own things (the game's pictures), each on its tile; `kind` as the game names them. */
  town: RimLaid[];
  /** The new things that stand on the rim (drawn in the next step): the gate, the record stone, the trophies wall, the torches on posts; the tablet's socket is in the bench. */
  more: { kind: 'gate' | 'record' | 'trophies' | 'torch'; x: number; y: number }[];
  /** Where the hero stands when he comes into the town. */
  hero: [number, number];
}

const RUNE_STONES: readonly (readonly [number, number])[] = [[-2, -1], [-1, -2], [1, -2], [-2, 1], [2, -1], [-1, 2]];

/** Is the point (x, y) (tiles) on the portal's tongue or landing? */
export function onTongue(x: number, y: number): boolean {
  const [lx, ly] = LANDING;
  if (Math.hypot(x - lx, y - ly) <= TONGUE.r) return true;
  const ax = Math.cos(TONGUE.at * D2R);
  const ay = Math.sin(TONGUE.at * D2R);
  const ox = x - RIM.cx;
  const oy = y - RIM.cy;
  const along = ox * ax + oy * ay;
  const across = Math.abs(-ox * ay + oy * ax);
  return along >= TONGUE.out && along <= RIM.pit + RIM.kerb && across <= TONGUE.half;
}

export function rimPlace(): RimPlace {
  const walk = new Uint8Array(RIM_W * RIM_H);
  for (let y = 0; y < RIM_H; y++)
    for (let x = 0; x < RIM_W; x++) {
      const r = Math.hypot(x + 0.5 - RIM.cx, y + 0.5 - RIM.cy);
      walk[y * RIM_W + x] = onTongue(x + 0.5, y + 0.5) ? 1 : r < RIM.pit + 0.2 ? 2 : r <= RIM.town - 0.3 ? 1 : 0;
    }
  const L = RIM_LAYOUT;
  const at = (k: RimKind, p: readonly [number, number], v?: number): RimLaid => ({ kind: k, x: p[0], y: p[1], ...(v === undefined ? {} : { v }) });
  const [fx, fy] = L.forge;
  const [bx, by] = L.tentBack;
  const [wx, wy] = L.wordsmith;
  const town: RimLaid[] = [
    at('forge', [fx, fy]), at('rack', [fx - 3, fy]), at('trough', [fx + 1, fy]), at('anvil', [fx - 1, fy + 2]), at('armourer', [fx - 1, fy + 1]),
    at('tentBack', [bx, by]), at('mystic', [bx, by + 1]), at('tentTable', [bx, by + 2]), at('rug', [bx, by + 1]),
    at('wordsmith', [wx, wy]), at('runeSlab', [wx, wy + 1]), at('runeRing', [wx, wy]),
    ...RUNE_STONES.map(([dx, dy], i) => at('runeStone', [wx + dx, wy + dy], i)),
    at('lexicon', L.lexicon), at('stash', L.stash), at('stranger', L.stranger), at('waypoint', L.way),
    ...L.braziers.map((b) => at('brazier', b)),
  ];
  const more: RimPlace['more'] = [
    { kind: 'gate', x: L.gate[0], y: L.gate[1] }, { kind: 'record', x: L.record[0], y: L.record[1] }, { kind: 'trophies', x: L.trophies[0], y: L.trophies[1] },
    ...L.torches.map(([x, y]) => ({ kind: 'torch' as const, x, y })),
  ];
  return { name: "The Shaft's Rim", w: RIM_W, h: RIM_H, walk, town, more, hero: [L.way[0] + 1.5, L.way[1] + 2.5] };
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE GROUND PICTURE. Game pixels: tile (x, y) at ((x - y) * 16, (x + y) * 8 - z). The picture covers the cliff and the rim
// round the middle, two picture pixels to a game pixel.

/** The picture's top left in game pixels (tile (0, 0) at game pixel (0, 0)), and its size in game pixels. */
export const GROUND = { gx: -280, gy: (RIM.cx + RIM.cy) * 8 - 112 - 150, w: 560, h: 112 * 2 + 150 + 14 };
const MID_Y = (RIM.cx + RIM.cy) * 8;

/** Each floor's own stone, storey under storey down the shaft, as the splash has them. */
const ORDER: readonly Theme[] = [TOWN, PRISON, CANYON, FEN, HIGH, QUARRY, PRISON, FEN];
/** A storey's height and the stair (game pixels and tiles): how far it stands out of the wall, how thick, how many steps a turn, how far a turn goes down. */
export const STOREY = 28;
const WS = 0.78;
const TS = 5;
const STEPS = 28;
const PITCH = STOREY * 2;
const RISE = PITCH / STEPS;
/** How deep the dark has it all (game pixels below the brink). */
const DEEP = 92;
const TAU = Math.PI * 2;
const SA = STAIR_AT * D2R;
const runOf = (th: number): number => (((SA - th) % TAU) + TAU) % TAU;
const angd = (a: number, b: number): number => Math.atan2(Math.sin(a - b), Math.cos(a - b));
/** Each storey's doorway (k >= 1): where round the shaft it opens. */
// (set where the eye can see them down the shaft: about the far wall's middle, one to the left of it and one to the right in turn)
const doorAt = (k: number): number => (-135 + (k % 2 ? -24 : 22)) * D2R;
/** Each storey's torch: a little round from its doorway, 9 pixels over its sill (the top storey's by the stair's head). */
const torchAt = (k: number): readonly [number, number] => (k === 0 ? [SA - 0.55, -11] : [doorAt(k) + (k % 2 ? 0.42 : -0.42), -((k + 1) * STOREY - 14)]);

const NIGHT = hx('#07060f');
const ROCK = ['#141118', '#1d1820', '#272029', '#332a33'].map(hx);
const FLAGS = TOWN.flag;
const STONE = TOWN.stone;

/** Light by bands, the dither only where two bands meet. */
function lit(c: C, k: number, x: number, y: number, floor = 0.18): C {
  const v = Math.max(0, k) * 4;
  const i = Math.floor(v);
  const f = v - i;
  const t = (i + (bay(x, y) < f ? 1 : 0)) / 4;
  return t >= 1 ? c : mixc(NIGHT, c, floor + (1 - floor) * t);
}
/** Down the shaft the dark is whole: no light, no stone seen. */
const deepLit = (c: C, k: number, x: number, y: number): C => lit(c, k, x, y, 0);

/** THE PAVING of the rim at tile (x, y): worn flags in rings round the mouth, each its own length, some cracked, some sunk. */
function flagAt(x: number, y: number, px: number, py: number): C {
  const dx = x - RIM.cx;
  const dy = y - RIM.cy;
  const r = Math.hypot(dx, dy);
  const a = Math.atan2(dy, dx);
  // (the rings: their joints wander a little, never ruled)
  const rr = r - RIM.pit - RIM.kerb + (rnd(Math.floor(a * 9 + 50), 3, 11) - 0.5) * 0.08;
  const ring = Math.floor(rr / 0.82);
  const fr = rr / 0.82 - ring;
  const n = 14 + ring * 5;
  const pos = (a / TAU + 1) * n + rnd(ring, 1, 12) * n;
  // (each flag its own length: the joint between two moved a little from even)
  let col = Math.floor(pos);
  let fa = pos - col;
  const j = (rnd(col, ring, 13) - 0.5) * 0.5;
  if (fa < j + 0.5 && j > 0 && fa > 0.5) {
    col--;
  }
  fa = (fa - (j > 0 ? 0 : j) + 1) % 1;
  const h = rnd(col, ring, 14);
  const g = 1 / (2 * 16 * Math.max(0.5, r) / n * 0.5);
  // (seams: one picture pixel, on the far edges of a flag)
  const seamR = fr < 0.06;
  const seamA = fa < Math.min(0.12, 0.6 / Math.max(1, (TAU * r) / n * 16 / 2));
  if (seamR || seamA) return mixc(FLAGS[0], NIGHT, 0.45);
  let tone = h < 0.28 ? 0 : h > 0.8 ? 2 : 1;
  // (the near edge of a flag catches the light)
  if (fr > 0.9) tone = Math.min(2, tone + 1);
  let c: C = FLAGS[tone];
  // (a sunk flag: darker, its far lip in shadow)
  if (h > 0.93) c = mixc(c, NIGHT, fr < 0.25 ? 0.5 : 0.25);
  // (a crack across one now and then)
  if (rnd(col, ring, 15) > 0.82) {
    const cr = Math.abs(fr - 0.5 - Math.sin(fa * 9 + h * 20) * 0.18);
    if (cr < 0.05) c = mixc(FLAGS[0], NIGHT, 0.5);
  }
  // (grit and soot, as the Gate Ward's streets have)
  const sp = rnd(px, py, 16);
  if (sp > 0.985) c = mixc(c, hx('#a89a88'), 0.5);
  else if (sp < 0.012) c = mixc(c, NIGHT, 0.4);
  const stain = (rnd(Math.floor(x * 1.3), Math.floor(y * 1.3), 17) > 0.86 ? 1 : 0) * (bay(px >> 1, py >> 1) < 0.5 ? 1 : 0);
  if (stain) c = mixc(c, NIGHT, 0.22);
  void g;
  // (the further from the middle, the less light: the edge is dark)
  return lit(c, 1 - 0.65 * Math.max(0, (r - RIM.pit) / (RIM.town - RIM.pit)) ** 1.4, px, py);
}

/** THE KERB at the brink: dressed stones, a seam between each, the inner lip lit. */
function kerbAt(x: number, y: number, px: number, py: number): C {
  const a = Math.atan2(y - RIM.cy, x - RIM.cx);
  const r = Math.hypot(x - RIM.cx, y - RIM.cy);
  const seg = Math.floor((a / TAU + 1) * 44);
  const fa = (a / TAU + 1) * 44 - seg;
  const fr = (r - RIM.pit) / RIM.kerb;
  if (fa < 0.07 || fr > 0.9) return mixc(STONE[0], NIGHT, 0.4);
  const tone = fr < 0.22 ? 3 : rnd(seg, 2, 21) > 0.6 ? 2 : 1;
  return lit(STONE[tone], 0.92, px, py);
}

/** THE ROUGH ROCK past the rim. */
function rockAt(x: number, y: number, px: number, py: number): C {
  const k = rnd(Math.floor(x * 2.2 + Math.sin(y * 3) * 0.6), Math.floor(y * 2.2 + Math.sin(x * 2.7) * 0.6), 31);
  const seam = rnd(Math.floor(x * 2.2 + 0.2 + Math.sin(y * 3) * 0.6), Math.floor(y * 2.2 + 0.1 + Math.sin(x * 2.7) * 0.6), 31) !== k;
  const c = seam ? ROCK[0] : ROCK[k < 0.3 ? 1 : k > 0.8 ? 3 : 2];
  return lit(c, 0.55, px, py);
}

/** THE CLIFF round the back: courses of rough stone, darker as it rises, lost in the dark. `z` up from its foot, `u` along it (tiles). */
function cliffAt(u: number, z: number, px: number, py: number): C {
  const row = Math.floor(z / 7 + rnd(Math.floor(u * 1.4), 0, 33) * 0.4);
  const col = Math.floor(u * 1.4 + (row & 1 ? 0.5 : 0) + rnd(row, 1, 34) * 0.3);
  const fz = z / 7 + rnd(Math.floor(u * 1.4), 0, 33) * 0.4 - row;
  const fu = u * 1.4 + (row & 1 ? 0.5 : 0) + rnd(row, 1, 34) * 0.3 - col;
  const h = rnd(col, row, 35);
  let c: C = fz < 0.13 || fu < 0.06 ? ROCK[0] : ROCK[h < 0.3 ? 1 : h > 0.75 ? 3 : 2];
  if (fz > 0.8 && c !== ROCK[0]) c = mixc(c, hx('#4a3e48'), 0.35);
  return lit(c, 0.6 * Math.max(0, 1 - z / 150) ** 1.3, px, py);
}

/** THE SHAFT'S WALL at angle th, `d` game pixels down from the brink. */
function wallAt(th: number, d: number, px: number, py: number): C {
  const k = Math.max(0, Math.floor(d / STOREY));
  const t = ORDER[k % ORDER.length];
  const v = d - k * STOREY;
  const u = (th + Math.PI) * RIM.pit;
  // THE TORCH's iron cup and bracket (its flame is a piece that moves)
  const [ta, tz] = torchAt(k);
  const tu = angd(th, ta) * RIM.pit * 16;
  const tv = -d - tz;
  if (Math.abs(tu) < 2.6 && tv > -4 && tv < 1.5) {
    if (tv > -1.5) return Math.abs(tu) < 2.2 ? (tu < 0 ? IRON[2] : IRON[1]) : rubble(t, px, py);
    if (Math.abs(tu) < 0.8) return IRON[1];
  }
  const light = wallLight(th, d, k);
  // THE DOORWAY of this storey's floor: a dark way in, its stones round it, the prison's barred
  const dd = angd(th, doorAt(k)) * RIM.pit * 16;
  const sill = STOREY - 3;
  if (k > 0 && Math.abs(dd) < 7 && v < sill && v > sill - 17) {
    if (Math.abs(dd) > 5.5 || v < sill - 15.5) return deepLit(t.stone[3], light, px, py);
    const deep = mixc(t.stone[0], 0, 0.75);
    if (t.teeth && Math.abs((((dd + 20) % 2) + 2) % 2 - 1) < 0.5 && v < sill - 3) return deepLit(IRON[2], light * 0.8, px, py);
    return v > sill - 1.5 ? deepLit(t.flag[1], light, px, py) : deep;
  }
  // (the ledge at the head of each storey: its floor's edge, lit; under it a seam of shadow)
  if (v < 2) return deepLit(t.stone[3], light, px, py);
  if (v < 3) return deepLit(mixc(t.stone[0], 0, 0.4), light, px, py);
  const hc = Math.max(3.5, t.hc * 12);
  const bl = t.bl * 0.45;
  const row = Math.floor(v / hc);
  const shift = (row & 1 ? bl / 2 : 0) + (rnd(row, k, 5) - 0.5) * bl * 0.3;
  const col = Math.floor((u + shift) / bl);
  const hsh = rnd(col, row, k * 13 + 3);
  let tone = hsh < 0.26 ? 0 : hsh > 0.8 ? 2 : 1;
  const fv = v / hc - row;
  const fu = (u + shift) / bl - col;
  if (fv < 1 / hc || fu < 0.5 / (bl * 16)) return deepLit(mixc(t.stone[0], 0, 0.5), light, px, py);
  if (fv > 1 - 1 / hc) tone++;
  // (lit from the upper left: the wall across from it catches more)
  const facing = Math.cos(th + 0.8);
  tone += facing > 0.45 ? 1 : facing < -0.4 ? -1 : 0;
  let base: C = t.stone[Math.max(0, Math.min(3, tone))];
  if (t.moss && rnd(col, row, 41) > 0.7 && fv < 0.35) base = MOSS[1];
  if (t.inlay !== undefined && row === 1) base = t.inlay;
  // (the stair's shadow on the wall under it)
  const zs = stairTop(th, -d);
  if (zs !== null && -d < zs - TS && -d > zs - TS - 9) return deepLit(base, light * 0.4, px, py);
  return deepLit(base, light, px, py);
}
const rubble = (t: Theme, px: number, py: number): C => deepLit(t.stone[1], 0.5, px, py);

/** How much light a point of the shaft has: the rim's (less with every storey) and its storey's torch. */
function wallLight(th: number, d: number, k: number): number {
  const sky = 0.95 / (1 + d / 26);
  let tl = 0;
  for (let j = Math.max(0, k - 1); j <= k + 1; j++) {
    const [ta, tz] = torchAt(j);
    const du = angd(th, ta) * RIM.pit * 16;
    const dz = -d - tz;
    tl += 0.6 / (1 + (du * du + dz * dz * 2) / 90);
  }
  const fade = Math.max(0, 1 - d / DEEP);
  return Math.min(1, (sky + tl) * fade * fade + 0.0);
}

/** The top of the stair over angle th nearest above height z (z negative, down the shaft): null if none there. */
function stairTop(th: number, z: number): number | null {
  const run = runOf(th);
  const i0 = Math.floor((run * STEPS) / TAU);
  for (let n = 0; n < 6; n++) {
    const zs = -(i0 + n * STEPS) * RISE;
    if (zs >= z - 0.001) {
      if (zs - TS - 9 <= z) return zs;
      continue;
    }
    return null;
  }
  return null;
}

/** A tread of the stair, step `idx`, `f` of the way along it, `rho` tiles out from the middle. */
function treadAt(idx: number, f: number, rho: number, zs: number, th: number, px: number, py: number): C {
  const d = -zs;
  const k = Math.max(0, Math.floor(d / STOREY));
  const t = ORDER[k % ORDER.length];
  let tone: number;
  // (the step above throws its shadow on the back of each tread; its nosing catches the light)
  if (f < 0.24) tone = 0;
  else if (f > 0.8) tone = 3;
  else tone = 2 - (rnd(idx, 3, 51) > 0.7 ? 1 : 0);
  if (rho < RIM.pit - WS + 0.1) tone = 3;
  // (what faces up has the night's light on it all the way down, less with depth: the stair stands off the wall by it)
  return deepLit(t.stone[tone], Math.min(1, Math.max(wallLight(th, d, k) * 1.3 + 0.08, 0.75 * (1 - d / (DEEP * 1.05)))), px, py);
}

/** What the shaft shows at game pixel (gx, gy) (inside its mouth): the stair, its edge or a riser, or the wall. */
function shaftAt(U: number, S0: number, px: number, py: number): C {
  const R = RIM.pit;
  const Sfar = -Math.sqrt(Math.max(0, 2 * R * R - U * U));
  let prevIn = false;
  let prevIdx = -1;
  for (let S = S0; S > Sfar; S -= 0.015) {
    const z = 8 * (S - S0);
    const dx = (S + U) / 2;
    const dy = (S - U) / 2;
    const rho = Math.sqrt(dx * dx + dy * dy);
    const th = Math.atan2(dy, dx);
    // (the portal's tongue and landing: their edge, a slab's thickness under their top)
    if (z > -9 && onTongue(RIM.cx + dx, RIM.cy + dy)) return deepLit(mixc(STONE[0], NIGHT, 0.2), 0.5 + z / 30, px, py);
    const ins = rho >= R - WS;
    const run = runOf(th);
    const i0 = Math.floor((run * STEPS) / TAU);
    if (ins) {
      for (let n = 0; n < 6; n++) {
        const idx = i0 + n * STEPS;
        const zs = -idx * RISE;
        if (zs < z - TS) continue;
        if (zs < -DEEP * 1.4) break;
        if (z <= zs && z >= zs - TS) {
          if (!prevIn) return deepLit(mixc(ORDER[Math.floor(-zs / STOREY) % ORDER.length].stone[idx & 1 ? 1 : 0], 0, 0.3), wallLight(th, -zs, Math.floor(-zs / STOREY)) * 0.7, px, py);
          if (prevIdx !== -1 && prevIdx !== idx) return deepLit(ORDER[Math.floor(-zs / STOREY) % ORDER.length].stone[1], wallLight(th, -zs, Math.floor(-zs / STOREY)) * 0.8, px, py);
          return treadAt(idx, (run * STEPS) / TAU - i0, rho, zs, th, px, py);
        }
        break;
      }
    }
    prevIn = ins;
    prevIdx = ins ? i0 : -1;
  }
  const d = 8 * (S0 - Sfar);
  const thw = Math.atan2((Sfar - U) / 2, (Sfar + U) / 2);
  return wallAt(thw, d, px, py);
}

export interface RimGround {
  /** The picture: (GROUND.w x GROUND.h) game pixels, two picture pixels to each. */
  canvas: HTMLCanvasElement;
  /** Its top left in game pixels, tile (0, 0) at (0, 0). */
  gx: number;
  gy: number;
  /** How long it took to paint, in ms. */
  ms: number;
}

/** The colour of the ground at picture pixel (px, py) of the picture (numbers only: also for the tests). */
export function groundAt(px: number, py: number): C {
  const gx = GROUND.gx + (px + 0.5) / 2;
  const gy = GROUND.gy + (py + 0.5) / 2;
  const U = gx / 16;
  const S0 = (gy - MID_Y) / 8;
  const x = RIM.cx + (S0 + U) / 2;
  const y = RIM.cy + (S0 - U) / 2;
  const r = Math.hypot(x - RIM.cx, y - RIM.cy);
  // THE CLIFF at the back: its face above its foot
  const sb = -Math.sqrt(Math.max(0, 2 * RIM.cliff * RIM.cliff - U * U));
  if (Math.abs(U) < RIM.cliff * Math.SQRT2 && S0 < sb) {
    const z = 8 * (sb - S0);
    return z < 150 ? cliffAt(Math.atan2((sb - U) / 2, (sb + U) / 2) * RIM.cliff, z, px, py) : NIGHT;
  }
  if (r > RIM.cliff) return lit(ROCK[1], 0.4, px, py);
  if (onTongue(x, y)) return tongueAt(x, y, px, py);
  if (r < RIM.pit) return shaftAt(U, S0, px, py);
  if (r < RIM.pit + RIM.kerb) return kerbAt(x, y, px, py);
  // (the edge of the paving: broken, not ruled)
  const edge = RIM.town + (rnd(Math.floor(Math.atan2(y - RIM.cy, x - RIM.cx) * 14 + 50), 1, 61) - 0.5) * 0.7;
  if (r > edge) return rockAt(x, y, px, py);
  return flagAt(x, y, px, py);
}

/** The portal's tongue and landing: big dressed slabs, a ring of kerb round the landing, kept clear. */
function tongueAt(x: number, y: number, px: number, py: number): C {
  const [lx, ly] = LANDING;
  const d = Math.hypot(x - lx, y - ly);
  if (d <= TONGUE.r) {
    if (d > TONGUE.r - 0.16) return lit(d > TONGUE.r - 0.04 ? mixc(STONE[0], NIGHT, 0.3) : STONE[3], 0.9, px, py);
    const a = Math.atan2(y - ly, x - lx);
    const ring = d < 0.36 ? 0 : 1;
    const seg = ring === 0 ? 0 : Math.floor((a / TAU + 1) * 8);
    const fa = (a / TAU + 1) * 8 - seg;
    if ((ring === 1 && (fa < 0.04 || Math.abs(d - 0.36) < 0.03)) || (ring === 0 && Math.abs(d - 0.36) < 0.03)) return lit(mixc(FLAGS[0], NIGHT, 0.4), 0.9, px, py);
    return lit(FLAGS[ring === 0 ? 2 : 1 + (rnd(seg, 5, 71) > 0.6 ? 1 : 0)], 0.85, px, py);
  }
  const ax = Math.cos(TONGUE.at * D2R);
  const ay = Math.sin(TONGUE.at * D2R);
  const along = (x - RIM.cx) * ax + (y - RIM.cy) * ay;
  const across = -(x - RIM.cx) * ay + (y - RIM.cy) * ax;
  if (Math.abs(across) > TONGUE.half - 0.07) return lit(Math.abs(across) > TONGUE.half - 0.025 ? mixc(STONE[0], NIGHT, 0.3) : STONE[3], 0.85, px, py);
  const slab = Math.floor(along / 0.62);
  if (along / 0.62 - slab < 0.06) return lit(mixc(FLAGS[0], NIGHT, 0.4), 0.85, px, py);
  return lit(FLAGS[1 + (slab & 1)], 0.85, px, py);
}

/** Paint the ground once. */
export function paintRimGround(): RimGround {
  const t0 = performance.now();
  const W = GROUND.w * 2;
  const H = GROUND.h * 2;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d') as CanvasRenderingContext2D;
  const im = g.createImageData(W, H);
  for (let py = 0; py < H; py++)
    for (let px = 0; px < W; px++) {
      const c = groundAt(px, py);
      const o = (py * W + px) * 4;
      im.data[o] = (c >> 16) & 255;
      im.data[o + 1] = (c >> 8) & 255;
      im.data[o + 2] = c & 255;
      im.data[o + 3] = 255;
    }
  g.putImageData(im, 0, 0);
  return { canvas, gx: GROUND.gx, gy: GROUND.gy, ms: performance.now() - t0 };
}

// ---------------------------------------------------------------------------------------------------------------------------
// WHAT MOVES, in small pictures.

/** The torches down the shaft, in game pixels (tile (0, 0) at (0, 0)), those the eye can see: each with its phase. */
export function shaftTorches(): { gx: number; gy: number; k: number }[] {
  const out: { gx: number; gy: number; k: number }[] = [];
  const R = RIM.pit;
  for (let k = 0; k < 5; k++) {
    const [ta, tz] = torchAt(k);
    // (on the far wall only)
    const U = Math.SQRT2 * R * (Math.cos(ta) - Math.sin(ta)) / Math.SQRT2;
    const S = R * (Math.cos(ta) + Math.sin(ta));
    if (S > -0.4) continue;
    const gx = U * 16;
    const gy = MID_Y + S * 8 - tz;
    const sDepth = -tz;
    if (sDepth > DEEP * 0.95) continue;
    // (seen only if the brink does not hide it: its point inside the mouth)
    const S0 = (gy - MID_Y) / 8;
    if (Math.hypot(U, S0) / Math.SQRT2 > R) continue;
    out.push({ gx, gy: gy - 1.5, k });
  }
  return out;
}

/** A torch's flame, 12 frames at 30 a second: picture pixels (two to a game pixel), 8 x 16, its foot at (4, 15). */
export const FLAME_FRAMES = 12;
export function paintFlame(f: number, dark = 0): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = 8;
  cv.height = 16;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  const ph = (f / FLAME_FRAMES) * TAU;
  const tall = 11 + 2 * Math.sin(ph) + (f % 3 === 0 ? 1 : 0);
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 8; x++) {
      const fy = 15 - y;
      if (fy > tall) continue;
      const w = 3.1 * Math.sin(Math.min(1, (fy + 1) / (tall + 1)) * Math.PI) ** 0.8 * (1 - fy / (tall * 1.6)) + 0.3;
      const fx = Math.abs(x + 0.5 - 4 - Math.sin(fy * 0.7 - ph * 1.3) * fy * 0.08);
      if (fx > w) continue;
      const c = fx < w * 0.36 && fy < tall * 0.5 ? FIRE[0] : fx < w * 0.7 ? hx('#ffc24a') : hx('#ff8a2a');
      g.fillStyle = '#' + mixc(c, NIGHT, dark).toString(16).padStart(6, '0');
      g.fillRect(x, y, 1, 1);
    }
  return cv;
}

/** THE FAR FIRE: the enemy's pink burning to gold, far down only, inside the shaft only. One picture of its light, laid over the ground with `pitGlowAt(t)` of its strength (added, as the game adds a light). */
export interface PitGlow { canvas: HTMLCanvasElement; gx: number; gy: number }
export function paintPitGlow(): PitGlow {
  const R = RIM.pit;
  const w = Math.ceil(R * 16 * Math.SQRT2 * 2);
  const hh = 40;
  const gx = -w / 2;
  const gy = MID_Y + Math.round(R * 8 * Math.SQRT2) - hh;
  const cv = document.createElement('canvas');
  cv.width = w * 2;
  cv.height = hh * 2;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  const im = g.createImageData(w * 2, hh * 2);
  for (let py = 0; py < hh * 2; py++)
    for (let px = 0; px < w * 2; px++) {
      const X = gx + (px + 0.5) / 2;
      const Y = gy + (py + 0.5) / 2;
      const U = X / 16;
      const S0 = (Y - MID_Y) / 8;
      if (Math.hypot(U, S0) / Math.SQRT2 > R - 0.12) continue;
      const Sfar = -Math.sqrt(Math.max(0, 2 * R * R - U * U));
      const d = 8 * (S0 - Sfar);
      const a0 = Math.max(0, (d - DEEP * 0.8) / (DEEP * 0.25)) * Math.max(0, 1 - Math.abs(U) / (R * 0.6));
      const a = band(Math.min(1, a0), 4);
      if (a <= 0) continue;
      const c = a > 0.7 ? FIRE[1] : a > 0.45 ? FIRE[2] : FIRE[3];
      const o = (py * w * 2 + px) * 4;
      im.data[o] = (c >> 16) & 255;
      im.data[o + 1] = (c >> 8) & 255;
      im.data[o + 2] = c & 255;
      im.data[o + 3] = Math.round(255 * (0.18 + 0.4 * a) * (bay(px, py) < 0.75 ? 1 : 0.6));
    }
  g.putImageData(im, 0, 0);
  return { canvas: cv, gx, gy };
}
/** How strong the far fire is at time t (seconds): a slow breath, a 2.6 s round. */
export const pitGlowAt = (t: number): number => 0.62 + 0.3 * Math.sin((t / 2.6) * TAU) ** 2;

/** The kerb's posts round the brink (but where the stair leaves it and where the tongue goes out), and the landing's: tiles. */
export function rimPosts(): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (let k = 0; k < 24; k++) {
    const a = k * 15 + 7.5;
    const off = (b: number): number => Math.abs(((a - b + 540) % 360) - 180);
    if (off(STAIR_AT) < 12 || off(TONGUE.at) < 14) continue;
    out.push({ x: polar(a, RIM.pit + 0.16)[0], y: polar(a, RIM.pit + 0.16)[1] });
  }
  const [lx, ly] = LANDING;
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * TAU + 0.2;
    if (Math.abs(angd(a, (TONGUE.at * D2R) + Math.PI)) < 0.5) continue;
    out.push({ x: lx + Math.cos(a) * (TONGUE.r - 0.1), y: ly + Math.sin(a) * (TONGUE.r - 0.1) });
  }
  return out;
}
/** A post: dressed stone, 4 x 9 game pixels, picture pixels 8 x 18, its foot's middle at (4, 17). */
export function paintPost(): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = 8;
  cv.height = 18;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  const put = (x: number, y: number, c: C): void => {
    g.fillStyle = '#' + c.toString(16).padStart(6, '0');
    g.fillRect(x, y, 1, 1);
  };
  for (let y = 0; y < 18; y++)
    for (let x = 0; x < 8; x++) {
      if (y < 2 && (x < 1 || x > 6)) continue;
      const top = y < 3;
      const c = top ? (y === 0 ? STONE[3] : STONE[2]) : x < 3 ? STONE[2] : x < 6 ? STONE[1] : STONE[0];
      put(x, y, y === 17 ? mixc(STONE[0], NIGHT, 0.5) : x === 7 ? mixc(STONE[0], NIGHT, 0.3) : lit(c, 0.92, x, y));
    }
  return cv;
}
