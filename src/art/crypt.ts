// THE CRYPT, LESS FINISHED THE DEEPER IT GOES: its four floors (a mock-up behind CRYPT, off).
//
// The owner's outline of the first five floors, 9 Oct 2026, 22:47 (in the main chat; on the chat
// board at 22:52): "the deeper you go, the less finished the crypt.  The top floor, while old and
// crumbling, is all stone.  As you go down, there’s more and more missing and more just dirt
// around.  By floor 4 it’s about half dirt and rocks with discarded and rusted mining equipment
// around." And to the art chat, 10 Oct 2026, 01:58: "Work on the environments after.  Apply the
// checks."
//
// What is painted here, floor by floor (the painters are art/ground.ts's and art/props.ts's; a
// floor is a THEME with `earth`: how much of its stonework is gone, and the earth and rock under it):
//   FLOOR 1, old and crumbling, all stone: the vault's flagstones and walls, more of them cracked
//     or with a corner gone (one in six, where the vault has one in fourteen), earth in the gaps.
//   FLOOR 2: here and there a flagstone gone, earth and stones where it lay; a few of the walls'
//     stones fallen out, rough rock behind them.
//   FLOOR 3: a third of the floor earth, in patches; more rock in the walls; the stone that is
//     left dirtier.
//   FLOOR 4, about half dirt and rocks: half the floor earth and half the walls rough rock, and
//     rusted mining gear lying about (a pick, a shovel, a sledgehammer, a bucket, a length of
//     track). Its pillars are a miner's timber props.
// The palette stays the vault's indigo stone, the one he knows (every dungeon is the vault's
// today); the earth is a dark plum and the rock a grey violet, so that neither is mud brown (his
// rulebook, Colour 5: "never mud-brown all over"), and both stay darker and duller than any word.
// The gear's iron is the monsters' IRON and its rust their RUST (art/mkit.ts), a step duller, as a
// place is a step quieter than the figures in it (Places 2).

import type { Sprite } from '../engine/px';
import { Px } from '../engine/px';
import { VAULT, makeGroundArt } from './ground';
import type { Earth, GroundArt, Theme } from './ground';
import { Iso } from './isokit';
import type { SideShader } from './isokit';
import { GRAIN, INK, hash, lit, mix } from './kit';
import type { Ramp } from './kit';
import { makeStairwell, makeWaypointArt } from './crypt_ways';
import type { WaypointArt } from './crypt_ways';
import { makeDungeonProps } from './props';
import type { DungeonProps } from './props';

/**
 * WHERE A PICTURE PUTS THE WAYS THROUGH (art/crypt_ways.ts): the stairwell down and the waypoint,
 * on one level, for photographs of the mock-up. Where they would stand, and what they do, is the
 * main chat's to put into the game once he has said yes; until then a playtest puts them here
 * (__dbg.cryptMarks) and the renderer draws them, as they would look, and does nothing else.
 */
export interface CryptMarks {
  /** The level they are on (none: nowhere). */
  level: unknown;
  /** The stairwell: the corner of its opening up the screen, in tiles, and which way its steps go down. */
  stair: { x: number; y: number; way: 'x' | 'y' } | null;
  /** The waypoint: its middle, in tiles; asleep, awake, or warping since `t0` (the renderer's clock, seconds). */
  way: { x: number; y: number; state: 'asleep' | 'awake' | 'warp'; t0: number } | null;
}

/** THE SWITCH. Off: every dungeon is the vault, as in the game. On: each of the Crypt's floors is its own (main.ts swaps the pictures as the hero goes down). */
export const CRYPT: { on: boolean; marks: CryptMarks } = { on: false, marks: { level: null, stair: null, way: null } };

// ---------------------------------------------------------------------------------------------
// The colours

/** The earth: its dark (in pits, under what lies on it), its usual tone, a lighter tone in patches, the lit top of a clod. A dark plum. */
export const DIRT = ['#0e0a18', '#1b1426', '#241a30', '#32253e'] as const;
/** Rock, in the earth and in the walls: its shaded side, its body, an odd one, its lit edge. A grey violet, greyer than the dressed stone. */
export const ROCK = ['#1a1830', '#2b2944', '#34304e', '#4a4668'] as const;
/** Rock as a ramp for lit() (three tones: [0] = [1], [3] = [4]). */
const ROCK_RAMP: Ramp = [ROCK[0], ROCK[0], ROCK[1], ROCK[3], ROCK[3]];
/** Old timber: the dungeon's wood (the plum of the barrels and chests), darker and duller with age. */
export const TIMBER: Ramp = ['#22182a', '#22182a', '#46323f', '#6c5060', '#6c5060'];
/** Iron left in the damp, and the rust on it: the monsters' IRON and RUST (art/mkit.ts), darker and duller. */
export const OLD_IRON: Ramp = ['#16142c', '#16142c', '#34305e', '#5e5a92', '#5e5a92'];
export const OLD_RUST: Ramp = ['#2a1430', '#2a1430', '#55284e', '#7e4466', '#7e4466'];

// ---------------------------------------------------------------------------------------------
// The four floors

/** How a floor is made: what is gone of its stonework (art/ground.ts, Earth), and how much dirtier the stone that is left is (0: the vault's own). */
interface FloorSpec {
  gone: number;
  raw: number;
  broken: number;
  grime: number;
}
const SPECS: readonly FloorSpec[] = [
  { gone: 0, raw: 0, broken: 0.16, grime: 0 },
  { gone: 0.12, raw: 0.12, broken: 0.18, grime: 0.06 },
  { gone: 0.27, raw: 0.28, broken: 0.2, grime: 0.12 },
  { gone: 0.45, raw: 0.5, broken: 0.22, grime: 0.18 },
];

function dirty<T extends readonly string[]>(tones: T, grime: number): T {
  return tones.map((c) => (grime > 0 ? mix(c, DIRT[1], grime) : c)) as unknown as T;
}

function floorTheme(k: number): Theme {
  const s = SPECS[k];
  const earth: Earth = { gone: s.gone, raw: s.raw, broken: s.broken, dirt: DIRT, rock: ROCK };
  return {
    ...VAULT,
    id: `crypt${k + 1}`,
    slab: dirty(VAULT.slab, s.grime),
    lit: dirty(VAULT.lit, s.grime * 0.6),
    shade: dirty(VAULT.shade, s.grime * 0.6),
    earth,
  };
}

/** The Crypt's floors, 1 to 4, as themes of the ground's painters. */
export const CRYPT_FLOORS: readonly Theme[] = [0, 1, 2, 3].map(floorTheme);

/** Which of the Crypt's floors a dungeon is: 1 to 4 (deeper than the fourth, as the fourth), or 0 for none (the town). */
export function cryptFloor(depth: number): number {
  return depth <= 0 ? 0 : Math.min(4, Math.floor(depth));
}

// ---------------------------------------------------------------------------------------------
// What lies on the floor. No seam; anchored at the middle, as the vault's bones and rubble are.

const FW = 36;
const FH = 20;

/** A rough rock: a lump with corners, lit along its upper-left edge, its shadow under it. */
function rock(p: Px, shadow: string, x: number, y: number, w: number, h: number, k: number): void {
  const a = 1 + Math.round(hash(k, 1, 61) * (w / 3));
  const b = 1 + Math.round(hash(k, 2, 61) * (w / 3));
  const c = Math.round(hash(k, 3, 61) * (h / 2));
  const d = Math.round(hash(k, 4, 61) * (h / 3));
  p.ellipse(x + w / 2 + 1.5, y + h - 0.5, w / 2 + 1, 1.8, shadow);
  lit(p, ROCK_RAMP, [1, 2], [0, 2], (l) =>
    l.poly(
      [
        [x, y + 1 + c],
        [x + a, y + d * 0.3],
        [x + w - b, y],
        [x + w, y + 2 + d],
        [x + w - 1, y + h],
        [x + 2, y + h],
      ],
      INK,
    ),
  );
  // (a crack or a facet across the bigger ones)
  if (w >= 8) for (let i = 0; i < w / 3; i++) if (p.get(x + a + i, y + 2 + Math.round(i * 0.4)) === ROCK[1]) p.set(x + a + i, y + 2 + Math.round(i * 0.4), ROCK[0]);
}

/** [x, y, width, height] of each rock. */
type Lumps = ReadonlyArray<readonly [number, number, number, number]>;
const ROCKS: ReadonlyArray<Lumps> = [
  [[6, 4, 13, 10], [21, 8, 8, 6], [25, 3, 5, 4], [16, 14, 4, 3]],
  [[13, 5, 10, 8], [4, 9, 7, 6], [24, 10, 8, 5], [9, 3, 4, 3], [28, 5, 4, 3]],
  [[9, 6, 17, 10], [27, 11, 5, 4], [4, 12, 5, 4]],
];

function makeRocks(theme: Theme, variant: number): Sprite {
  const p = new Px(FW, FH);
  ROCKS[variant % ROCKS.length].forEach(([x, y, w, h], k) => rock(p, theme.mortar, x, y, w, h, k + variant * 11));
  // (and grit about them)
  for (let i = 0; i < 7; i++) {
    const x = 2 + Math.floor(hash(i, variant, 62) * (FW - 4));
    const y = 2 + Math.floor(hash(i, variant, 63) * (FH - 4));
    if (!p.has(x, y)) p.set(x, y, i % 2 ? ROCK[3] : ROCK[1]);
  }
  return p.sprite(FW / 2, FH / 2, GRAIN);
}

// ---------------------------------------------------------------------------------------------
// The rusted mining gear, lying on the floor ALONG THE GRID (the owner, 5 Oct 2026: "any sprite or
// doodad or whatever should always be seen at an angle"): built of boxes on the grid, as the chest
// and the pillar's foot are (art/isokit.ts), with the shadow of each under it to the lower right.
// Anchored at the middle of the floor it lies on. 56 x 30.

const GW = 56;
const GH = 30;
const GOX = 28;
const GOY = 13;

/** A side of something lying down: lit or shaded as its ramp is, a lit line along its top edge. */
function side(r: Ramp, litSide: boolean): SideShader {
  return (_u, v) => (v === 0 ? r[litSide ? 3 : 2] : litSide ? r[2] : r[0]);
}
/** Paint a box of one material: its top the lightest, its side to the screen-left lit, its side to the screen-right in shade. */
function block(iso: Iso, r: Ramp, x0: number, y0: number, x1: number, y1: number, z0: number, z1: number): void {
  iso.box(x0, y0, x1, y1, z0, z1, { top: () => r[3], left: side(r, true), right: side(r, false) });
}
/** Rust here and there on iron that has lain in the damp: blotches, the same on every copy. */
function rusty(p: Px, seed: number, share = 0.4): void {
  const map = new Map<string, string>([
    [OLD_IRON[0], OLD_RUST[0]],
    [OLD_IRON[2], OLD_RUST[2]],
    [OLD_IRON[3], OLD_RUST[3]],
  ]);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (!c) continue;
      const to = map.get(c);
      if (to && hash(Math.floor(x / 3), Math.floor(y / 2), seed) < share) p.set(x, y, to);
    }
  }
}
/** The shadow of what lies in `layers`, a little to the lower right of it (light from the upper left), under it. */
function withShadow(theme: Theme, layers: readonly Px[], dx = 1, dy = 2): Px {
  const out = new Px(GW, GH);
  for (const l of layers) for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if (l.has(x, y)) out.set(x + dx, y + dy, theme.mortar);
  for (const l of layers) out.blit(l, 0, 0);
  return out;
}

/** A pick: a haft lying along x, its iron head across the far end of it, the two arms curving back toward the haft's foot. */
function makePick(theme: Theme): Sprite {
  const haft = new Px(GW, GH);
  const head = new Px(GW, GH);
  block(new Iso(haft, GOX, GOY), TIMBER, -0.4, -0.032, 0.2, 0.032, 0, 3);
  const iso = new Iso(head, GOX, GOY);
  // the eye round the haft
  block(iso, OLD_IRON, 0.18, -0.07, 0.29, 0.07, 0, 6);
  // the point, toward -y, and the chisel end toward +y: each in pieces that step back and thin
  const arm: ReadonlyArray<readonly [number, number, number, number, number]> = [
    [0.2, 0.275, -0.2, -0.07, 5],
    [0.18, 0.255, -0.3, -0.2, 4],
    [0.15, 0.225, -0.38, -0.3, 3],
    [0.12, 0.18, -0.44, -0.38, 2],
    [0.2, 0.275, 0.07, 0.2, 5],
    [0.18, 0.255, 0.2, 0.29, 4],
    [0.16, 0.235, 0.29, 0.36, 3],
  ];
  for (const [x0, x1, y0, y1, z] of arm) block(iso, OLD_IRON, x0, y0, x1, y1, 0, z);
  rusty(head, 71, 0.45);
  return withShadow(theme, [haft, head]).sprite(GOX, GOY, GRAIN);
}

/** A shovel: a long haft along y, and a broad pointed blade at its end, rusted through in one place. */
function makeShovel(theme: Theme): Sprite {
  const haft = new Px(GW, GH);
  const blade = new Px(GW, GH);
  block(new Iso(haft, GOX, GOY), TIMBER, -0.028, -0.5, 0.028, 0.06, 0, 3);
  const b = new Iso(blade, GOX, GOY);
  // the socket the haft goes into
  block(b, OLD_IRON, -0.045, 0.04, 0.045, 0.12, 0, 4);
  // the blade, lying flat: square at the socket, pointed at the tip; its lit edges toward the upper left
  const Y0 = 0.1;
  const Y1 = 0.46;
  const HW = 0.15;
  b.top(-HW, Y0, HW, Y1, 2, (u, v) => {
    const x = (u - 0.5) * 2 * HW;
    const half = v < 0.55 ? HW : HW * (1 - ((v - 0.55) / 0.45) * 0.85);
    if (Math.abs(x) > half) return null;
    if (v < 0.06 || x < -half + 0.025) return OLD_IRON[3];
    if (x > half - 0.03 || v > 0.94) return OLD_IRON[0];
    return OLD_IRON[2];
  });
  rusty(blade, 72, 0.5);
  // (a hole rusted through the blade: the floor shows through it)
  const [hx, hy] = b.at(0.03, 0.28, 2);
  for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [-1, 1], [1, 1], [0, 2]] as const) blade.erase(Math.round(hx) + dx, Math.round(hy) + dy);
  return withShadow(theme, [haft, blade]).sprite(GOX, GOY, GRAIN);
}

/**
 * A bucket on its side, lying along y on the grid (the owner, 5 Oct 2026: "any sprite or doodad or
 * whatever should always be seen at an angle"): a round body narrowing to its foot, two hoops round
 * it, its mouth toward the lower left of the screen and dark inside, its bail sprung loose on the
 * floor. Painted as the eye sees it: every point of it set down on the screen where it falls, the
 * nearer over the farther, lit by which way it faces (up lightest, toward the screen's right darkest).
 */
function makeBucket(theme: Theme): Sprite {
  const body = new Px(GW, GH);
  const bail = new Px(GW, GH);
  /** Its length along y, its radius at the mouth and at the foot (tiles), and how high a tile is in picture pixels. */
  const LEN = 0.3;
  const RM = 0.12;
  const RF = 0.095;
  const ZT = 45;
  const near = new Float32Array(GW * GH).fill(-1e9);
  const put = (x: number, y: number, z: number, c: string, p: Px = body): void => {
    const px = Math.round(GOX + (x - y) * 32 - 0.5);
    const py = Math.round(GOY + (x + y) * 16 - z - 0.5);
    if (px < 0 || py < 0 || px >= GW || py >= GH) return;
    const key = x + y + z / ZT / 2;
    const i = py * GW + px;
    if (key < near[i]) return;
    near[i] = key;
    p.set(px, py, c);
  };
  // the body
  for (let t = 0; t <= 1; t += 1 / 64) {
    const y = -LEN / 2 + t * LEN;
    const r = RF + (RM - RF) * t;
    const hoop = Math.abs(t - 0.3) < 0.04 || Math.abs(t - 0.72) < 0.04;
    for (let a = 0; a < 2 * Math.PI; a += 1 / 48) {
      const x = r * Math.cos(a);
      const z = (RM + r * Math.sin(a)) * ZT;
      const light = 0.8 * Math.sin(a) - 0.6 * Math.cos(a);
      put(x, y, z, hoop ? (light > 0.3 ? OLD_IRON[3] : OLD_IRON[0]) : light > 0.45 ? OLD_IRON[3] : light > -0.25 ? OLD_IRON[2] : OLD_IRON[0]);
    }
  }
  // the mouth: its rim, and the dark inside it (a disc facing +y, the lower left of the screen)
  for (let rr = 0; rr <= RM; rr += 1 / 160) {
    for (let a = 0; a < 2 * Math.PI; a += 1 / 64) {
      const x = rr * Math.cos(a);
      const z = (RM + rr * Math.sin(a)) * ZT;
      put(x, LEN / 2 + 0.001, z, rr > RM - 0.018 ? (Math.sin(a) - Math.cos(a) > 0 ? OLD_IRON[3] : OLD_IRON[2]) : rr > RM - 0.04 ? DIRT[0] : INK);
    }
  }
  rusty(body, 73, 0.4);
  // the bail: a loop of wire lying on the floor beside the mouth
  const bx = 0.16;
  const by = LEN / 2 - 0.02;
  for (let a = 0; a <= Math.PI; a += 1 / 40) put(bx + Math.cos(a) * 0.13, by + Math.sin(a) * 0.13, 0.5, a < 1.3 ? OLD_IRON[3] : OLD_RUST[2], bail);
  return withShadow(theme, [bail, body], 2, 1).sprite(GOX, GOY, GRAIN);
}

/** A length of the miners' track: two rails along x on five sleepers that stick out past them, the end of one rail torn up off its sleeper. */
function makeRail(theme: Theme): Sprite {
  const wood = new Px(GW, GH);
  const iron = new Px(GW, GH);
  const w = new Iso(wood, GOX, GOY);
  for (const x of [-0.5, -0.27, -0.04, 0.19, 0.42]) block(w, TIMBER, x, -0.27, x + 0.08, 0.27, 0, 2);
  const i = new Iso(iron, GOX, GOY);
  // the rails: thin, dark, a bright line along the top where the wheels wore them
  for (const y of [-0.16, 0.12]) i.box(-0.56, y, 0.5, y + 0.035, 2, 5, { top: () => OLD_IRON[3], left: side(OLD_IRON, true), right: side(OLD_IRON, false) });
  // (the far end of the near rail torn up: a short piece of it lifted off the last sleeper)
  i.box(0.5, 0.12, 0.6, 0.155, 5, 8, { top: () => OLD_IRON[3], left: side(OLD_IRON, true), right: side(OLD_IRON, false) });
  rusty(iron, 77, 0.2);
  // the spikes that hold them, a dark head beside each rail on each sleeper
  for (const x of [-0.46, -0.23, 0, 0.23]) {
    for (const y of [-0.2, 0.18]) {
      const [sx, sy] = i.at(x, y, 2);
      iron.set(Math.round(sx), Math.round(sy) - 1, OLD_IRON[3]).set(Math.round(sx), Math.round(sy), OLD_IRON[0]);
    }
  }
  return withShadow(theme, [wood, iron]).sprite(GOX, GOY, GRAIN);
}

/** A sledgehammer: a haft lying along y, a heavy square iron head across its end. */
function makeSledge(theme: Theme): Sprite {
  const haft = new Px(GW, GH);
  const head = new Px(GW, GH);
  block(new Iso(haft, GOX, GOY), TIMBER, -0.03, -0.46, 0.03, 0.18, 0, 3);
  const iso = new Iso(head, GOX, GOY);
  block(iso, OLD_IRON, -0.2, 0.16, 0.2, 0.3, 0, 9);
  // (its two faces battered: a lighter rim round each end)
  for (const x of [-0.2, 0.2]) {
    const [hx, hy] = iso.at(x, 0.23, 4.5);
    head.set(Math.round(hx), Math.round(hy), OLD_IRON[3]);
  }
  rusty(head, 78, 0.35);
  return withShadow(theme, [haft, head]).sprite(GOX, GOY, GRAIN);
}

/** All the gear, in the order the lists take it. */
export const GEAR_NAMES = ['pick', 'shovel', 'bucket', 'rail', 'sledge'] as const;
export type GearName = (typeof GEAR_NAMES)[number];
export function makeGear(theme: Theme): Record<GearName, Sprite> {
  return { pick: makePick(theme), shovel: makeShovel(theme), bucket: makeBucket(theme), rail: makeRail(theme), sledge: makeSledge(theme) };
}

// ---------------------------------------------------------------------------------------------
// The fourth floor's pillar: A MINER'S PIT PROP. A squared post on a flat stone, a cap-block
// across its head (what it holds up is in the dark over the floor, as the walls' tops are), a strut
// set slanting against it from the floor, an iron band round its foot, and an old lantern on a
// nail, long out. 48 x 108; its tile's middle at (24, 92). (The vault's pillar is 40 x 100 at
// (20, 84): the game draws either by its anchor.)

function makeProp(theme: Theme): Sprite {
  const W = 48;
  const H = 108;
  const cx = 24;
  const oy = 92;
  const wood = new Px(W, H);
  const strut = new Px(W, H);
  const iron = new Px(W, H);
  const iso = new Iso(wood, cx, oy);
  const P = 0.12;
  const TOP = 64;
  /** Grain down a side: a darker line here and there, and a split. */
  const grain = (litSide: boolean): SideShader => (u, v, w, h) => {
    if (v >= h - 1) return TIMBER[0];
    const line = u === Math.round(w * 0.35) || (u === Math.round(w * 0.7) && hash(Math.floor(v / 9), u, 81) < 0.6);
    if (line) return TIMBER[0];
    return litSide ? (u === 0 ? TIMBER[3] : TIMBER[2]) : mix(TIMBER[0], TIMBER[2], 0.35);
  };
  // the flat stone it stands on
  iso.box(-0.2, -0.2, 0.2, 0.2, 0, 4, { top: (u, v) => (u < 0.08 || v < 0.08 ? ROCK[3] : ROCK[2]), left: () => ROCK[1], right: () => ROCK[0] });
  // the post
  iso.box(-P, -P, P, P, 4, TOP, { top: () => TIMBER[3], left: grain(true), right: grain(false) });
  // the cap-block across its head, a little wider than it, the end grain of the timber on its sides
  iso.box(-0.17, -0.2, 0.17, 0.2, TOP, TOP + 9, {
    top: (u, v) => (u < 0.06 || v < 0.06 ? TIMBER[3] : mix(TIMBER[2], TIMBER[3], 0.5)),
    left: (u, v, w, h) => (v === 0 ? TIMBER[3] : v >= h - 1 ? TIMBER[0] : u === Math.round(w / 2) ? TIMBER[0] : TIMBER[2]),
    right: (_u, v, _w, h) => (v === 0 ? TIMBER[2] : v >= h - 1 ? TIMBER[0] : mix(TIMBER[0], TIMBER[2], 0.35)),
  });
  // the strut, set slanting against the post from the floor on its shaded side: a beam lit along its upper-left edge
  const s = new Iso(strut, cx, oy);
  const Y = 0.03;
  const [fx, fy] = s.at(0.46, Y, 0);
  const [tx, ty] = s.at(P, Y, 46);
  lit(strut, TIMBER, [1, 2], [1, 2], (l) =>
    l.poly(
      [
        [tx - 2, ty - 3],
        [tx + 3, ty + 1],
        [fx + 3, fy],
        [fx - 3, fy - 1],
      ],
      INK,
    ),
  );
  // a wedge under its foot
  s.box(0.38, -0.05, 0.52, 0.06, 0, 3, { top: () => TIMBER[2], left: () => TIMBER[2], right: () => TIMBER[0] });
  // the iron band round the post's foot
  const band = new Iso(iron, cx, oy);
  band.box(-P - 0.01, -P - 0.01, P + 0.01, P + 0.01, 10, 15, { top: () => null, left: side(OLD_IRON, true), right: side(OLD_IRON, false) });
  // a nail high on the lit side, and the old lantern hanging from it by its ring
  const [nx, ny] = iso.at(-0.02, P, 50);
  iron.set(Math.round(nx), Math.round(ny), OLD_IRON[3]).set(Math.round(nx) + 1, Math.round(ny), OLD_IRON[0]);
  const lx = Math.round(nx) - 2;
  const ly = Math.round(ny) + 2;
  for (const [dx, dy] of [[1, 0], [0, 1], [2, 1], [1, 2]] as const) iron.set(lx + dx, ly + dy, OLD_RUST[2]);
  lit(iron, OLD_IRON, [1, 2], [0, 2], (l) => {
    l.rect(lx - 1, ly + 3, 5, 2, INK);
    l.rect(lx, ly + 5, 3, 5, INK);
    l.rect(lx - 1, ly + 10, 5, 2, INK);
  });
  // (its glass, dark and dull: it has not burned in a long time)
  iron.rect(lx, ly + 5, 3, 5, '#26243e').set(lx, ly + 5, '#3c3a5c');
  rusty(iron, 82, 0.45);
  const out = new Px(W, H);
  out.blit(wood, 0, 0);
  out.blit(iron, 0, 0);
  out.blit(strut, 0, 0);
  return out.sprite(cx, oy, GRAIN);
}

// ---------------------------------------------------------------------------------------------
// Each floor's pictures, made the first time it is needed and kept.

/**
 * What lies on each floor besides the bones (the game picks one of a list for each thing that
 * lies there, by its own number: render.ts), by name: the vault's dressed rubble fading out as you
 * go down, rocks coming in, and the gear on the fourth (and a pick and a bucket already on the third).
 */
export function cryptLitter(k: number): string[] {
  if (k <= 1) return ['rubble0', 'rubble1', 'rubble2'];
  if (k === 2) return ['rubble0', 'rubble1', 'rubble2', 'rock0', 'rock1'];
  if (k === 3) return ['rubble0', 'rubble1', 'rock0', 'rock1', 'rock2', 'pick', 'bucket'];
  return ['rubble0', 'rock0', 'rock1', 'rock2', 'pick', 'shovel', 'bucket', 'rail', 'sledge'];
}

function litterOf(k: number, props: DungeonProps, theme: Theme): Sprite[] {
  const rocks = [0, 1, 2].map((v) => makeRocks(theme, v));
  const gear = makeGear(theme) as Record<string, Sprite>;
  return cryptLitter(k).map((name) => (name.startsWith('rubble') ? props.rubble[Number(name.slice(6))] : name.startsWith('rock') ? rocks[Number(name.slice(4))] : gear[name]));
}

const GROUNDS = new Map<number, GroundArt>();
const PROPS = new Map<number, DungeonProps>();

/** The floor and walls of the Crypt's floor `k` (1 to 4). */
export function cryptGround(k: number): GroundArt {
  let g = GROUNDS.get(k);
  if (!g) GROUNDS.set(k, (g = makeGroundArt(CRYPT_FLOORS[k - 1])));
  return g;
}
/** What stands and lies on the Crypt's floor `k` (1 to 4). */
export function cryptProps(k: number): DungeonProps {
  let p = PROPS.get(k);
  if (!p) {
    const theme = CRYPT_FLOORS[k - 1];
    const base = makeDungeonProps(theme);
    p = { ...base, rubble: litterOf(k, base, theme), pillar: k === 4 ? makeProp(theme) : base.pillar };
    PROPS.set(k, p);
  }
  return p;
}
const WAYS = new Map<number, { stair: Record<'x' | 'y', Sprite>; way: WaypointArt }>();
/** The stairwell (each way down) and the waypoint, in the stone of the Crypt's floor `k` (1 to 4). */
export function cryptWays(k: number): { stair: Record<'x' | 'y', Sprite>; way: WaypointArt } {
  let w = WAYS.get(k);
  if (!w) {
    const theme = CRYPT_FLOORS[k - 1];
    WAYS.set(k, (w = { stair: { x: makeStairwell(theme, 'x'), y: makeStairwell(theme, 'y') }, way: makeWaypointArt(theme) }));
  }
  return w;
}

/** Forget the pictures made (the walls' look has changed: art/ground.ts, setWallLook). */
export function forgetCrypt(): void {
  GROUNDS.clear();
  PROPS.clear();
}

/** (for the sheets) The rocks and the timber prop of a floor, by themselves. */
export function cryptPieces(k: number): { rocks: Sprite[]; gear: Record<GearName, Sprite>; prop: Sprite } {
  const theme = CRYPT_FLOORS[k - 1];
  return { rocks: [0, 1, 2].map((v) => makeRocks(theme, v)), gear: makeGear(theme), prop: makeProp(theme) };
}
