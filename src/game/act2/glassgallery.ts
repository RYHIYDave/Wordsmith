// ACT 2, PART TWO, THE HIGH CITY: FLOOR 18, THE GLASS GALLERY: ITS MAP-MAKER AND ITS DRESSER (game/act2_layout.ts asks it
// for the floor, game/act2_dress.ts for its pieces). Behind HIGH_CITY (game/act1.ts), off until he has played it and said yes.
// Built by the main chat (docs/high_city_build.md, "Floor 18"), as floor 17's Masque is laid (game/act2/masque.ts: rooms joined
// by straight ways, the suite turning as it goes).
//
// HIS DOC, level 18: "The queen's wing: long galleries of mirrors and a great glasshouse on the roof."; "indoors and up:
// mirrored halls and dressing rooms, a chapel of stained glass, and the glasshouse of dead orchids under a roof of panes.";
// its hazards "mirrors that crack and burst into shards when anything strikes near them; skylights to fall through to the
// floor below."; its boss "The Queen. Her floor is the Mirror Hall." The art is the art chat's (docs/mockups/glass_gallery/
// README.md, his yes, “Yes, that's the Gallery (Recommended)”): its ground art/glassgallery.ts (GG_ZONE), its 25 pieces
// art/floor18.ts, the High City's 25 art/high_city_set.ts; the Queen's hall art/queen_fx.ts (ARENA, HALL_MIRRORS).
//
// WHAT IT LAYS (the main chat's picks, where his doc and the art leave it open):
//   THE WAY THROUGH: an ANTECHAMBER where he comes in; LONG GALLERIES OF MIRRORS (a runner down each), between them THE CHAPEL
//     and THE GLASSHOUSE (on one level, as the game walks: the art's "up a stair" is its look); THE MIRROR HALL last, the
//     Queen's (her arena, 20 tiles along and 17 across, her twelve pier glasses along its long sides, her talking mirror in the
//     middle of its end away from the eye, facing along it, as the art paints it: art/queen_fx.ts), entered by that end beside
//     her mirror; THE WAY ON in a small room off its other end.
//   OFF IT: DRESSING ROOMS (three or four; one the guard's LAIR; one or two STORES, the reward's chests).
//   THE SKYLIGHTS: in the galleries, a skylight broken through here and there (two tiles of pit: the hall below seen down it,
//     the art's GlassLand.skylight), whole ones beside it and elsewhere (the floor's trap, the art's 'a skylight': it cracks
//     and gives way at the trap's beat, game/traps.ts).
//   ITS PACKS: the floor's own (game/act2_mobs.ts ACT2_OWN[18]): a few to a room by its size; the lair's its guardian's; none
//     in the antechamber, the Mirror Hall or beyond it.
//
// Everything is by the floor's own dice: the same depth and seed give the same floor, here and in the painter's worker.

import { RNG } from '../../engine/rng';
import { act2Pack } from '../act2_mobs';
import type { Act1Dress, Act1Tile } from '../act1_dress';
import { walkReach } from './housequiet';
import type { AreaRole, Blob, Laid, Land, Lane } from '../act1_layout';
import type { Level, PropInst } from '../state';
import { makeHazards } from '../traps';
import { T_FLOOR, T_PIT, T_WALL } from '../types';
import type { Floor, HazardSpot, MonsterKind, PackSpot, PropSpot, Room, RoomKind } from '../types';

/** Whether this map-maker lays the floor. */
export const BUILT = true;

/**
 * WHAT EACH WALKABLE TILE IS: the art chat's GG_ZONE (art/glassgallery.ts), its numbers here, for no file of the game's rules
 * imports the art (tests/act2_glassgallery.test.ts holds the two the same).
 */
export const GALLERY_ZONE = { Gallery: 0, MirrorHall: 1, Dressing: 2, Chapel: 3, Glasshouse: 4 } as const;

// ---------------------------------------------------------------------------------------------------
// THE WING'S MEASURES (tiles)

/** A way between rooms: three tiles wide. */
const CW = 3;
/** Rooms stand at least this far apart: the walls between them this thick. */
const ROOM_GAP = 3;
/** A way between rooms keeps this far from every room and way it does not join. */
const CLEAR = 2;
/** Wall left round the wing, to the map's edge. */
const MARGIN = 8;
/** The way through wanders across the floor no more than this far either side of where it began. */
const BAND = 34;

/** What a room of the wing is. */
export type GalleryRole = 'ante' | 'gallery' | 'chapel' | 'glasshouse' | 'hall' | 'beyond' | 'dressing' | 'lair' | 'store';

/** Each kind of room's sides, its long one and its short one (each a range, tiles of floor). */
const SIZE: Readonly<Record<GalleryRole, { long: [number, number]; short: [number, number] }>> = {
  ante: { long: [10, 12], short: [8, 9] },
  // (a long gallery of mirrors: six or seven across, so that a runner two wide goes down its middle and a skylight lies beside it)
  gallery: { long: [20, 28], short: [6, 7] },
  chapel: { long: [13, 15], short: [10, 12] },
  glasshouse: { long: [15, 18], short: [11, 13] },
  // (the Queen's: her arena 20 tiles along and 17 across, art/queen_fx.ts ARENA; a tile more each way for her pier glasses)
  hall: { long: [22, 22], short: [19, 19] },
  beyond: { long: [8, 9], short: [7, 8] },
  dressing: { long: [9, 11], short: [8, 9] },
  lair: { long: [12, 13], short: [10, 11] },
  store: { long: [8, 9], short: [7, 8] },
};
/** Each kind's floor (GG_ZONE). */
const ZONE_OF: Readonly<Record<GalleryRole, number>> = {
  ante: GALLERY_ZONE.Gallery,
  gallery: GALLERY_ZONE.Gallery,
  chapel: GALLERY_ZONE.Chapel,
  glasshouse: GALLERY_ZONE.Glasshouse,
  hall: GALLERY_ZONE.MirrorHall,
  beyond: GALLERY_ZONE.Gallery,
  dressing: GALLERY_ZONE.Dressing,
  lair: GALLERY_ZONE.Dressing,
  store: GALLERY_ZONE.Dressing,
};

/** How far into the hall from its far wall her talking mirror stands (tiles), and how far its doorways keep from it. */
const MIRROR_IN = 1.2;
const MIRROR_CLEAR = 4;

// ---------------------------------------------------------------------------------------------------
// THE PLAN: rooms and the ways between them, as rectangles, checked against each other before anything is laid

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface PlanRoom extends Rect {
  role: GalleryRole;
  /** Its place along the way through (0 the antechamber), or -1 off it. */
  path: number;
  /** The room it hangs from (-1 for the antechamber). */
  parent: number;
}
interface Join extends Rect {
  a: number;
  b: number;
  alongX: boolean;
}
interface Plan {
  rooms: PlanRoom[];
  joins: Join[];
}

const near = (a: Rect, b: Rect, gap: number): boolean => a.x - gap < b.x + b.w && b.x - gap < a.x + a.w && a.y - gap < b.y + b.h && b.y - gap < a.y + a.h;
/** Which way a step goes: 0 toward +x, 1 toward -x, 2 toward +y, 3 toward -y. */
type Side = 0 | 1 | 2 | 3;
const alongXOf = (s: Side): boolean => s < 2;

/** A NEW ROOM `w` by `h` set off `host` on its side `side`, a way `len` long between them (as floor 17's: masque.ts attach). */
function attach(rng: RNG, plan: Plan, host: number, side: Side, w: number, h: number, len: number): { room: Rect; join: Rect } | null {
  const H = plan.rooms[host];
  const ax = alongXOf(side);
  const hostLo = ax ? H.y + 1 : H.x + 1;
  const hostHi = ax ? H.y + H.h - CW - 1 : H.x + H.w - CW - 1;
  if (hostHi < hostLo) return null;
  const c = rng.int(hostLo, hostHi);
  const span = ax ? h : w;
  const lo = c + CW + 1 - span;
  const hi = c - 1;
  if (hi < lo) return null;
  const off = rng.int(lo, hi);
  let room: Rect;
  let join: Rect;
  if (side === 0) {
    room = { x: H.x + H.w + len, y: off, w, h };
    join = { x: H.x + H.w, y: c, w: len, h: CW };
  } else if (side === 1) {
    room = { x: H.x - len - w, y: off, w, h };
    join = { x: H.x - len, y: c, w: len, h: CW };
  } else if (side === 2) {
    room = { x: off, y: H.y + H.h + len, w, h };
    join = { x: c, y: H.y + H.h, w: CW, h: len };
  } else {
    room = { x: off, y: H.y - len - h, w, h };
    join = { x: c, y: H.y - len, w: CW, h: len };
  }
  for (let j = 0; j < plan.rooms.length; j++) {
    if (near(room, plan.rooms[j], ROOM_GAP)) return null;
    if (j !== host && near(join, plan.rooms[j], CLEAR)) return null;
  }
  for (const J of plan.joins) if (near(room, J, CLEAR) || near(join, J, CLEAR)) return null;
  return { room, join };
}

/** A room's two sides for a step: its long side along the way it is entered (`alongWay`) or across it. */
function sidesOf(rng: RNG, role: GalleryRole, side: Side, alongWay: boolean): { w: number; h: number } {
  const s = SIZE[role];
  const a = rng.int(s.long[0], s.long[1]);
  const b = rng.int(s.short[0], s.short[1]);
  const longAlongX = alongXOf(side) === alongWay;
  return longAlongX ? { w: a, h: b } : { w: b, h: a };
}

/** THE WAY THROUGH, in order: the antechamber; galleries, the chapel and the glasshouse between them; the Mirror Hall; beyond it. */
function mainRoles(rng: RNG): GalleryRole[] {
  const two: GalleryRole[] = rng.chance(0.5) ? ['chapel', 'glasshouse'] : ['glasshouse', 'chapel'];
  const out: GalleryRole[] = ['ante', 'gallery'];
  if (rng.chance(0.5)) out.push('gallery');
  out.push(two[0], 'gallery', two[1], 'gallery', 'hall', 'beyond');
  return out;
}

/**
 * Lay the way through: each room off the last, turning now and then, mostly on along the floor's way (`A`), kept within the
 * band; the Mirror Hall straight on, its long side along the way (entered at its near end, her mirror at its far one); the way
 * on off its far end, clear of her mirror.
 */
function planMain(rng: RNG, A: 'x' | 'y'): Plan | null {
  const on: Side = A === 'x' ? 0 : 2;
  const across: [Side, Side] = A === 'x' ? [2, 3] : [0, 1];
  const roles = mainRoles(rng);
  const plan: Plan = { rooms: [], joins: [] };
  const e = sidesOf(rng, 'ante', on, rng.chance(0.5));
  plan.rooms.push({ x: 0, y: 0, w: e.w, h: e.h, role: 'ante', path: 0, parent: -1 });
  const mid = (r: Rect): number => (A === 'x' ? r.y + r.h / 2 : r.x + r.w / 2);
  const mid0 = mid(plan.rooms[0]);
  let last: Side = on;
  for (let i = 1; i < roles.length; i++) {
    const role = roles[i];
    let done = false;
    for (let tries = 0; tries < 60 && !done; tries++) {
      const host = plan.rooms.length - 1;
      let side: Side = on;
      if (role !== 'hall' && role !== 'beyond' && (last === on ? rng.chance(0.6) : rng.chance(0.3))) {
        const off = mid(plan.rooms[host]) - mid0;
        side = off > BAND * 0.55 ? across[1] : off < -BAND * 0.55 ? across[0] : last !== on ? last : rng.pick(across);
      }
      // (a gallery along the way it is walked; the hall its long side along it)
      const sz = sidesOf(rng, role, side, role === 'gallery' || role === 'hall' || rng.chance(0.5));
      const len = role === 'gallery' || roles[i - 1] === 'gallery' ? rng.int(3, 5) : ROOM_GAP;
      const got = attach(rng, plan, host, side, sz.w, sz.h, len);
      if (!got) continue;
      // (the hall entered at its end away from the eye, where her mirror hangs in the middle: its doorway clear of it)
      if (role === 'hall') {
        const jm = alongXOf(side) ? got.join.y + CW / 2 : got.join.x + CW / 2;
        const hm = alongXOf(side) ? got.room.y + got.room.h / 2 : got.room.x + got.room.w / 2;
        if (Math.abs(jm - hm) < MIRROR_CLEAR) continue;
      }
      if (Math.abs(mid(got.room) - mid0) > BAND) continue;
      plan.rooms.push({ ...got.room, role, path: i, parent: host });
      plan.joins.push({ ...got.join, a: host, b: plan.rooms.length - 1, alongX: alongXOf(side) });
      last = side;
      done = true;
    }
    if (!done) return null;
  }
  return plan;
}

/** A side room of `role` off one of `hosts` (the first the likeliest), on any of its sides, its way `len` long. Its index, or -1. */
function growSide(rng: RNG, plan: Plan, role: GalleryRole, hosts: number[], tries = 80, len: [number, number] = [3, 6]): number {
  if (!hosts.length) return -1;
  for (let t = 0; t < tries; t++) {
    const host = hosts[Math.min(hosts.length - 1, Math.floor(Math.pow(rng.next(), 1.6) * hosts.length))];
    const side = rng.int(0, 3) as Side;
    const sz = sidesOf(rng, role, side, rng.chance(0.5));
    const got = attach(rng, plan, host, side, sz.w, sz.h, rng.int(len[0], len[1]));
    if (!got) continue;
    plan.rooms.push({ ...got.room, role, path: -1, parent: host });
    plan.joins.push({ ...got.join, a: host, b: plan.rooms.length - 1, alongX: alongXOf(side) });
    return plan.rooms.length - 1;
  }
  return -1;
}

// ---------------------------------------------------------------------------------------------------
// LAY FLOOR 18

/** What only floor 18 knows of itself (Land.gallery), for its look, its dresser and its rules. */
export interface GalleryPlan {
  /** Each room: its rectangle (x0, y0, x1, y1; x1, y1 not in it), what it is, its place along the way (-1 off it), its room id. */
  rooms: { r: [number, number, number, number]; role: GalleryRole; path: number; room: number }[];
  /** The ways between rooms (x0, y0, x1, y1), whether each runs along x, and the two rooms it joins (indices in `rooms`, from `a` to `b`). */
  ways: { r: [number, number, number, number]; alongX: boolean; a: number; b: number }[];
  /** The runners down the galleries and along the Mirror Hall (tiles: x, y, w, h). */
  runners: { x: number; y: number; w: number; h: number }[];
  /** 1 on a skylight broken through (a pit: the hall below seen down it), by tile; the floor's width. */
  holes: Uint8Array;
  w: number;
  /**
   * THE MIRROR HALL: its middle (world), whether its long side runs along x, and her talking mirror (world: a little in from the
   * middle of its end away from the eye, its least x or y), `into` the way it faces, into the hall (+x or +y).
   */
  hall: { x: number; y: number; alongX: boolean; mirror: { x: number; y: number }; into: { x: number; y: number } };
}

/** Lay floor 18, or null (this throw of the dice could not lay the wing: game/act2_layout.ts rolls again). */
export function generate(depth: number, seed: number): Laid | null {
  const rng = new RNG((seed ^ 0x510e527f) >>> 0);
  const A: 'x' | 'y' = rng.chance(0.5) ? 'x' : 'y';
  const plan = planMain(rng, A);
  if (!plan) return null;
  const hallI = plan.rooms.findIndex((r) => r.role === 'hall');

  // SIDE ROOMS: dressing rooms off the galleries (one the guard's lair, a store or two)
  const galleries = plan.rooms.map((_, i) => i).filter((i) => plan.rooms[i].role === 'gallery' && i < hallI);
  const anyHost = plan.rooms.map((_, i) => i).filter((i) => i > 0 && i < hallI);
  if (growSide(rng, plan, 'lair', rng.shuffle([...galleries]).filter((i) => plan.rooms[i].path >= 3)) < 0) return null;
  const dressing = rng.int(2, 3);
  for (let n = 0; n < dressing; n++) growSide(rng, plan, 'dressing', rng.shuffle([...galleries]));
  const stores = rng.int(1, 2);
  for (let n = 0; n < stores; n++) growSide(rng, plan, 'store', rng.shuffle([...anyHost]));

  // THE BOUNDS: everything moved MARGIN in from the map's edge
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const r of [...plan.rooms, ...plan.joins]) {
    x0 = Math.min(x0, r.x);
    y0 = Math.min(y0, r.y);
    x1 = Math.max(x1, r.x + r.w);
    y1 = Math.max(y1, r.y + r.h);
  }
  const dx = MARGIN - x0;
  const dy = MARGIN - y0;
  for (const r of [...plan.rooms, ...plan.joins]) {
    r.x += dx;
    r.y += dy;
  }
  const W = x1 - x0 + 2 * MARGIN;
  const H = y1 - y0 + 2 * MARGIN;

  // THE TILES, AND WHAT EACH IS: a way the floor of the room it opens into (a gallery's where it joins one)
  const tiles = new Uint8Array(W * H).fill(T_WALL);
  const zones = new Uint8Array(W * H);
  for (const J of plan.joins) {
    const a = plan.rooms[J.a].role;
    const b = plan.rooms[J.b].role;
    const z = a === 'gallery' || b === 'gallery' || a === 'ante' ? GALLERY_ZONE.Gallery : ZONE_OF[b];
    for (let ty = J.y; ty < J.y + J.h; ty++) for (let tx = J.x; tx < J.x + J.w; tx++) {
      tiles[ty * W + tx] = T_FLOOR;
      zones[ty * W + tx] = z;
    }
  }
  for (const r of plan.rooms) {
    for (let ty = r.y; ty < r.y + r.h; ty++) for (let tx = r.x; tx < r.x + r.w; tx++) {
      tiles[ty * W + tx] = T_FLOOR;
      zones[ty * W + tx] = ZONE_OF[r.role];
    }
  }
  const isWay = (tx: number, ty: number, pad = 0): boolean => plan.joins.some((J) => tx >= J.x - pad && tx < J.x + J.w + pad && ty >= J.y - pad && ty < J.y + J.h + pad);

  // THE RUNNERS: down each gallery's middle, two tiles wide; along the Mirror Hall's middle, three
  const runners: GalleryPlan['runners'] = [];
  for (const r of plan.rooms) {
    if (r.role !== 'gallery' && r.role !== 'hall') continue;
    const wide = r.role === 'hall' ? 3 : 2;
    const alongX = r.w >= r.h;
    runners.push(alongX ? { x: r.x + 0.5, y: r.y + r.h / 2 - wide / 2, w: r.w - 1, h: wide } : { x: r.x + r.w / 2 - wide / 2, y: r.y + 0.5, w: wide, h: r.h - 1 });
  }

  // THE SKYLIGHTS BROKEN THROUGH: in a gallery (not the first), now and then, two tiles of pit along it a tile in from its near
  // wall (toward the eye), clear of the runner and of every doorway
  const holes = new Uint8Array(W * H);
  const sky = new RNG((seed ^ 0x9b05688c) >>> 0);
  plan.rooms.forEach((r) => {
    if (r.role !== 'gallery' || r.path <= 1 || !sky.chance(0.7)) return;
    const alongX = r.w >= r.h;
    const len = alongX ? r.w : r.h;
    const n = len >= 24 && sky.chance(0.5) ? 2 : 1;
    const used: number[] = [];
    for (let k = 0; k < n; k++) {
      for (let tries = 0; tries < 20; tries++) {
        const a = sky.int(3, len - 5);
        if (used.some((u) => Math.abs(u - a) < 6)) continue;
        const cells: [number, number][] = alongX ? [[r.x + a, r.y + r.h - 2], [r.x + a + 1, r.y + r.h - 2]] : [[r.x + r.w - 2, r.y + a], [r.x + r.w - 2, r.y + a + 1]];
        if (cells.some(([tx, ty]) => isWay(tx, ty, 2))) continue;
        for (const [tx, ty] of cells) {
          tiles[ty * W + tx] = T_PIT;
          holes[ty * W + tx] = 1;
        }
        used.push(a);
        break;
      }
    }
  });

  // ROOMS (the way through first, in walking order, then the side rooms), AND THE LAND'S AREAS
  const order = plan.rooms.map((_, i) => i).sort((a, b) => {
    const pa = plan.rooms[a].path;
    const pb = plan.rooms[b].path;
    return (pa < 0 ? 1e3 + a : pa) - (pb < 0 ? 1e3 + b : pb);
  });
  const idOf: number[] = [];
  order.forEach((pi, id) => (idOf[pi] = id));
  const kindOf = (r: PlanRoom): RoomKind => (r.role === 'ante' ? 'start' : r.role === 'hall' ? 'boss' : r.role === 'lair' ? 'guardian' : r.role === 'store' ? 'treasure' : 'normal');
  const rooms: Room[] = order.map((pi, id) => {
    const r = plan.rooms[pi];
    return { id, x: r.x, y: r.y, w: r.w, h: r.h, kind: kindOf(r), path: r.path };
  });
  // (two of the galleries, the chapel and the glasshouse hold a yellow pack)
  const eliteable = rooms.filter((r, id) => r.kind === 'normal' && ['gallery', 'chapel', 'glasshouse'].includes(plan.rooms[order[id]].role) && plan.rooms[order[id]].path > 1);
  for (const r of rng.shuffle([...eliteable]).slice(0, 2)) r.kind = 'elite';
  const roleOf = (r: PlanRoom): AreaRole => (r.role === 'ante' ? 'start' : r.role === 'hall' ? 'boss' : r.role === 'lair' ? 'lair' : r.path < 0 ? 'side' : 'path');
  const areas = order.map((pi) => {
    const r = plan.rooms[pi];
    const blob: Blob = { x: r.x + r.w / 2, y: r.y + r.h / 2, rx: r.w / 2, ry: r.h / 2, rot: 0, wob: 0, seed: 0 };
    return { blob, room: idOf[pi], role: roleOf(r) };
  });
  const lanes: Lane[] = plan.joins.map((J) => (J.alongX ? { pts: [[J.x, J.y + CW / 2], [J.x + J.w, J.y + CW / 2]] as [number, number][], w: CW } : { pts: [[J.x + CW / 2, J.y], [J.x + CW / 2, J.y + J.h]] as [number, number][], w: CW }));
  const way: [number, number][] = plan.rooms.filter((r) => r.path >= 0).sort((a, b) => a.path - b.path).map((r) => [r.x + r.w / 2, r.y + r.h / 2]);

  // THE START, THE HALL AND HER MIRROR, THE WAY ON
  const ent = plan.rooms[0];
  const start = { x: ent.x + Math.floor(ent.w / 2) + 0.5, y: ent.y + Math.floor(ent.h / 2) + 0.5 };
  const Hr = plan.rooms[hallI];
  const hallAlongX = Hr.w >= Hr.h;
  const hx = Hr.x + Hr.w / 2;
  const hy = Hr.y + Hr.h / 2;
  // (her mirror in the middle of the hall's end away from the eye (its least x or y), facing along the hall toward the eye, as
  // the art paints it: the end he comes in by, his doorway to one side of it; the way on off the other end)
  const mirror = hallAlongX ? { x: Hr.x + MIRROR_IN, y: hy } : { x: hx, y: Hr.y + MIRROR_IN };
  const into = hallAlongX ? { x: 1, y: 0 } : { x: 0, y: 1 };
  // (the Queen waits in the middle of her hall)
  const boss = { x: Math.floor(hx) + 0.5, y: Math.floor(hy) + 0.5 };
  const beyond = plan.rooms[plan.rooms.findIndex((r) => r.role === 'beyond')];
  const exit = { x: beyond.x + Math.floor(beyond.w / 2) + 0.5, y: beyond.y + Math.floor(beyond.h / 2) + 0.5 };

  const floor: Floor = {
    depth,
    seed,
    w: W,
    h: H,
    tiles,
    cut: new Uint8Array(W * H),
    variant: new Uint8Array(W * H),
    rooms,
    start,
    boss,
    packs: [],
    props: [],
  };
  const vr = new RNG((seed ^ 0x1f83d9ab) >>> 0);
  for (let i = 0; i < W * H; i++) floor.variant[i] = vr.int(0, 255);
  floor.packs = packsOf(new RNG((seed ^ 0x5be0cd19) >>> 0), floor, plan, idOf, depth);
  floor.props = storesOf(new RNG((seed ^ 0x6a09e667) >>> 0), floor, plan);

  const gallery: GalleryPlan = {
    rooms: plan.rooms.map((r, pi) => ({ r: [r.x, r.y, r.x + r.w, r.y + r.h], role: r.role, path: r.path, room: idOf[pi] })),
    ways: plan.joins.map((J) => ({ r: [J.x, J.y, J.x + J.w, J.y + J.h], alongX: J.alongX, a: J.a, b: J.b })),
    runners,
    holes,
    w: W,
    hall: { x: hx, y: hy, alongX: hallAlongX, mirror, into },
  };
  const land: Land = {
    kind: 'glassgallery',
    depth,
    seed,
    way,
    areas,
    lanes,
    holds: [],
    exit,
    arrive: { ...start },
    zones,
    gallery,
  };
  return { floor, land };
}

/**
 * THE PACKS, by room: one for every 70 tiles of a room or so, at most three; the lair's its guardian's, in its middle; a
 * store's one; none in the antechamber, the Mirror Hall or beyond it. None within 10 tiles of the start, none within 5 of another.
 */
function packsOf(rng: RNG, f: Floor, plan: Plan, idOf: readonly number[], depth: number): PackSpot[] {
  const out: PackSpot[] = [];
  const W = f.w;
  const free = (x: number, y: number): boolean => {
    for (let ty = y - 1; ty <= y + 1; ty++) for (let tx = x - 1; tx <= x + 1; tx++) if (tx < 0 || ty < 0 || tx >= W || ty >= f.h || f.tiles[ty * W + tx] !== T_FLOOR) return false;
    return true;
  };
  const used: { x: number; y: number }[] = [];
  const put = (x: number, y: number, room: number, tier: PackSpot['tier'], p: { kind: MonsterKind; size: number }): void => {
    out.push({ x: x + 0.5, y: y + 0.5, roomId: room, size: p.size, tier, kind: p.kind });
    used.push({ x: x + 0.5, y: y + 0.5 });
  };
  plan.rooms.forEach((r, pi) => {
    if (r.role === 'ante' || r.role === 'hall' || r.role === 'beyond') return;
    const id = idOf[pi];
    const room = f.rooms[id];
    if (r.role === 'lair') {
      put(r.x + Math.floor(r.w / 2), r.y + Math.floor(r.h / 2), id, 'champion', act2Pack(depth, rng, 'champion'));
      return;
    }
    const n = r.role === 'store' ? 1 : Math.max(1, Math.min(3, Math.round((r.w * r.h) / 70)));
    for (let k = 0; k < n; k++) {
      for (let tries = 0; tries < 40; tries++) {
        const x = rng.int(r.x + 1, r.x + r.w - 2);
        const y = rng.int(r.y + 1, r.y + r.h - 2);
        if (!free(x, y)) continue;
        if (Math.hypot(x + 0.5 - f.start.x, y + 0.5 - f.start.y) < 10) continue;
        if (used.some((u) => Math.hypot(u.x - x - 0.5, u.y - y - 0.5) < 5)) continue;
        const tier: PackSpot['tier'] = room.kind === 'elite' && k === 0 ? 'elite' : 'normal';
        put(x, y, id, tier, act2Pack(depth, rng, tier));
        break;
      }
    }
  });
  return out;
}

/** The game's own things on the floor: a store's chests (two or three, the reward), near its middle, none on a pack's. */
function storesOf(rng: RNG, f: Floor, plan: Plan): PropSpot[] {
  const out: PropSpot[] = [];
  for (const r of plan.rooms) {
    if (r.role !== 'store') continue;
    const n = rng.int(2, 3);
    const cx = r.x + Math.floor(r.w / 2);
    const cy = r.y + Math.floor(r.h / 2);
    const spots: [number, number][] = rng.shuffle([[cx - 1, cy - 1], [cx + 1, cy - 1], [cx, cy + 1], [cx - 2, cy + 1], [cx + 2, cy + 1], [cx - 2, cy - 2], [cx + 2, cy - 2]]);
    let laid = 0;
    for (const [x, y] of spots) {
      if (laid >= n || f.tiles[y * f.w + x] !== T_FLOOR || f.packs.some((p) => Math.abs(p.x - 0.5 - x) <= 1 && Math.abs(p.y - 0.5 - y) <= 1)) continue;
      out.push({ kind: 'chest', x, y });
      laid++;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------
// THE DRESSING

/** The art's names of floor 18's pieces (art/floor18.ts glassGalleryPieces; tests/act2_glassgallery.test.ts holds them to the art's list). */
export const GG_PIECE = {
  mirror: 'a tall mirror',
  shards: "a mirror's shards",
  cheval: 'a cheval mirror',
  dressingTable: 'a dressing table',
  screen: 'a dressing screen',
  wardrobe: 'a wardrobe of gowns',
  banquette: 'a velvet banquette',
  console: 'a console table',
  candelabrum: 'a silver candelabrum',
  sconce: 'a sconce of candles',
  bust: 'a bust on a plinth',
  tapestry: 'a tapestry in rags',
  window: 'a stained-glass window',
  pew: 'a chapel pew',
  coffin: 'a glass coffin',
  colours: 'the colours of the stained glass',
  bench: 'a bench of dead orchids',
  pot: 'an orchid in its pot, dead',
  pane: 'a pane fallen from the roof',
  skylight: 'a skylight',
  jewels: 'a jewel box, spilled',
  handMirror: 'a hand mirror, dropped',
  apple: 'the apple on a silver dish',
  // (the High City's own, art/high_city_set.ts)
  banner: "a royal's banner",
  portrait: 'a court portrait, faces painted out',
  orderMask: "the Order's mask over the crest",
  statue: 'a marble statue of a royal',
  vase: 'a grand vase',
  fan: 'a dropped fan and a rose',
} as const;

/** A tall mirror's stages (its frame on the wall: `variant` >> 1): whole, cracked, burst. */
export const MIRROR_STAGE = { whole: 0, cracked: 1, burst: 2 } as const;

/** How often the floor lays its whole skylights (the trap) and how far apart (tiles). */
const SKY = { apart: 4, fromStart: 8, fromPack: 2.5 };

/**
 * DRESS FLOOR 18, room by room, as the art chat laid its corner (src/dev/glass_lay.ts): THE GALLERIES their tall mirrors down
 * their far walls (the hazard), sconces between, candelabra and banquettes by the walls, busts, the court's portraits and
 * banners, a tapestry in rags; the skylights, whole (the trap) beside those broken through and here and there; THE DRESSING
 * ROOMS a dressing table, a wardrobe, a screen, a cheval glass, her jewel box spilled, a hand mirror dropped; THE CHAPEL its
 * windows, the colours they throw on its floor, its pews, the glass coffin; THE GLASSHOUSE benches of dead orchids, pots, panes
 * fallen from the roof; THE MIRROR HALL kept clear for her (her pier glasses and her mirror are hers: art/queen_fx.ts),
 * candelabra at its corners; the apple on its dish (the quest) by the hall's doorway.
 */
export function dress(L: Level, depth: number, seed: number): Act1Dress | null {
  const land = L.land;
  const G = land?.gallery;
  if (!land || land.kind !== 'glassgallery' || !G) return null;
  const f = L.floor;
  const W = f.w;
  const H = f.h;
  const rng = new RNG((seed ^ 0x3c6ef372) >>> 0);
  const out: Act1Dress = { floor: depth, tiles: [] };
  const inMap = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H;
  const floorAt = (x: number, y: number): boolean => inMap(x, y) && f.tiles[y * W + x] === T_FLOOR;
  /** Not floor and not a skylight's hole: a wall. */
  const wallAt = (x: number, y: number): boolean => !floorAt(x, y) && !(inMap(x, y) && G.holes[y * W + x] === 1);
  const inRect = (r: readonly number[], x: number, y: number): boolean => x >= r[0] && y >= r[1] && x < r[2] && y < r[3];
  const isWay = (x: number, y: number): boolean => G.ways.some((w) => inRect(w.r, x, y));
  const onRunner = (x: number, y: number): boolean => G.runners.some((r) => x + 1 > r.x && x < r.x + r.w && y + 1 > r.y && y < r.y + r.h);

  // WHAT IS KEPT CLEAR (of anything solid): where he comes in, the waypoint, the way on, every pack's middle, every doorway (a
  // way's tiles and two tiles round them), the runners, round every hole, the Mirror Hall's floor but its corners
  const keep = new Uint8Array(W * H);
  const clearRound = (x: number, y: number, r: number): void => {
    for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) if (inMap(tx, ty) && Math.hypot(tx + 0.5 - x, ty + 0.5 - y) <= r) keep[ty * W + tx] = 1;
  };
  clearRound(f.start.x, f.start.y, 3.2);
  if (L.ways?.way) clearRound(L.ways.way.x, L.ways.way.y, 2);
  clearRound(land.exit.x, land.exit.y, 3.2);
  for (const p of f.packs) clearRound(p.x, p.y, 1.5);
  for (const w of G.ways) for (let y = w.r[1] - 2; y < w.r[3] + 2; y++) for (let x = w.r[0] - 2; x < w.r[2] + 2; x++) if (inMap(x, y)) keep[y * W + x] = 1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (onRunner(x, y)) keep[y * W + x] = 1;
  for (let i = 0; i < W * H; i++) if (G.holes[i]) clearRound((i % W) + 0.5, Math.floor(i / W) + 0.5, 1.5);

  const before = L.walk.slice();
  const taken = new Uint8Array(W * H);
  for (const p of L.props) taken[p.ty * W + p.tx] = 1;
  const props: PropInst[] = [];
  const foot = new Map<PropInst, number[]>();
  const whole = (x: number, y: number): boolean => floorAt(x, y) && L.walk[y * W + x] === 1;
  const free = (x: number, y: number, ring = false): boolean => {
    if (!whole(x, y)) return false;
    const i = y * W + x;
    if (keep[i] || taken[i]) return false;
    if (!ring) return true;
    for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) if ((a || b) && floorAt(x + a, y + b) && L.walk[(y + b) * W + x + a] !== 1) return false;
    return true;
  };
  const put = (name: string, x: number, y: number, solid: boolean, variant = 0, at?: { x: number; y: number }): PropInst => {
    const p: PropInst = { kind: 'piece', name, tx: x, ty: y, x: at ? at.x : x + 0.5, y: at ? at.y : y + 0.5, solid, state: 0, variant };
    props.push(p);
    const i = y * W + x;
    taken[i] = 1;
    if (solid) {
      L.walk[i] = 0;
      foot.set(p, [i]);
    }
    return p;
  };
  /** One of the game's breakables (a 'barrel' is the floor's console table, an 'urn' its orchid in its pot: ACT1_SETS[18]). */
  const breakable = (kind: 'barrel' | 'urn', x: number, y: number): void => {
    const p: PropInst = { kind, tx: x, ty: y, x: x + 0.5, y: y + 0.5, solid: true, state: 0, variant: 0 };
    props.push(p);
    taken[y * W + x] = 1;
    L.walk[y * W + x] = 0;
    foot.set(p, [y * W + x]);
  };
  const wallTaken = new Set<number>();
  /** A piece on a far wall over floor tile (x, y): face 0 the wall along x behind it (at y - 1), face 1 along y (at x - 1). */
  const onWall = (name: string, x: number, y: number, face: 0 | 1, frame = 0, wide = 1): PropInst | null => {
    const back = face === 0 ? [x, y - 1] : [x - 1, y];
    if (!floorAt(x, y) || !wallAt(back[0], back[1])) return null;
    for (let k = -wide; k <= wide; k++) if (face === 0 ? !wallAt(x + k, y - 1) || !floorAt(x + k, y) : !wallAt(x - 1, y + k) || !floorAt(x, y + k)) return null;
    for (let k = -wide; k <= wide; k++) if (wallTaken.has(((face === 0 ? y : y + k) * W + (face === 0 ? x + k : x)) * 2 + face)) return null;
    wallTaken.add((y * W + x) * 2 + face);
    const p: PropInst = { kind: 'piece', name, tx: x, ty: y, x: face === 0 ? x + 0.5 : x, y: face === 0 ? y : y + 0.5, solid: false, state: 0, variant: face | (frame << 1) };
    props.push(p);
    return p;
  };
  /** A room's far-wall tiles in order along it (its row along x at its least y, face 0; its column along y at its least x, face 1). */
  const farWall = (r: readonly number[]): [number, number, 0 | 1][] => [
    ...Array.from({ length: r[2] - r[0] - 2 }, (_, k) => [r[0] + 1 + k, r[1], 0] as [number, number, 0 | 1]),
    ...Array.from({ length: r[3] - r[1] - 2 }, (_, k) => [r[0], r[1] + 1 + k, 1] as [number, number, 0 | 1]),
  ];
  const hang = (name: string, r: readonly number[], n: number, frames = 1): void => {
    let laid = 0;
    for (const [x, y, face] of rng.shuffle(farWall(r))) {
      if (laid >= n) break;
      if (onWall(name, x, y, face, rng.int(0, frames - 1))) laid++;
    }
  };
  const tilesIn = (r: readonly number[], inset = 1): [number, number][] => {
    const list: [number, number][] = [];
    for (let ty = r[1] + inset; ty < r[3] - inset; ty++) for (let tx = r[0] + inset; tx < r[2] - inset; tx++) list.push([tx, ty]);
    return rng.shuffle(list);
  };
  const scatter = (name: string, r: readonly number[], n: number, solid: boolean, ring: boolean, variant: () => number = () => 0, inset = 1): void => {
    let laid = 0;
    for (const [x, y] of tilesIn(r, inset)) {
      if (laid >= n) break;
      if (!free(x, y, ring)) continue;
      put(name, x, y, solid, variant());
      laid++;
    }
  };
  /** Lay `name` against the room's walls (on its edge tiles), `n` of it; `alongOf`: its variant for the wall it stands along. */
  const byWall = (name: string, r: readonly number[], n: number, solid: boolean, alongOf: (alongX: boolean) => number = () => 0): void => {
    const edge: [number, number, boolean][] = [];
    for (let x = r[0] + 1; x < r[2] - 1; x++) edge.push([x, r[1], true], [x, r[3] - 1, true]);
    for (let y = r[1] + 1; y < r[3] - 1; y++) edge.push([r[0], y, false], [r[2] - 1, y, false]);
    let laid = 0;
    for (const [x, y, ax] of rng.shuffle(edge)) {
      if (laid >= n) break;
      if (!free(x, y, false) || isWay(x, y)) continue;
      put(name, x, y, solid, alongOf(ax));
      laid++;
    }
  };
  const roomsOf = (role: GalleryRole): GalleryPlan['rooms'] => G.rooms.filter((q) => q.role === role);

  // THE SKYLIGHTS, WHOLE (the floor's trap: game/traps.ts, the spike floor's beat; its pictures the art's 'a skylight': whole,
  // cracking, broken through): beside each broken through, along the gallery, and one or two more in a gallery's floor
  const traps: HazardSpot[] = [];
  const skylight = (x: number, y: number): boolean => {
    if (!free(x, y, true) || onRunner(x, y)) return false;
    if (Math.hypot(x + 0.5 - f.start.x, y + 0.5 - f.start.y) < SKY.fromStart) return false;
    if (f.packs.some((p) => Math.hypot(p.x - x - 0.5, p.y - y - 0.5) < SKY.fromPack)) return false;
    traps.push({ kind: 'spikes', x, y, w: 1, h: 1, phase: rng.range(0, 2.5) });
    taken[y * W + x] = 1;
    return true;
  };
  for (let i = 0; i < W * H; i++) {
    if (!G.holes[i]) continue;
    const x = i % W;
    const y = Math.floor(i / W);
    // (the hole's two tiles lie along the gallery: a whole skylight at either end of it, where there is floor)
    for (const [a, b] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]] as [number, number][]) {
      if (!floorAt(a, b) || G.holes[b * W + a] || traps.some((t) => t.x === a && t.y === b)) continue;
      const alongHole = G.holes[y * W + x - 1] || G.holes[y * W + x + 1] ? b === y : a === x;
      if (alongHole && rng.chance(0.7)) {
        traps.push({ kind: 'spikes', x: a, y: b, w: 1, h: 1, phase: rng.range(0, 2.5) });
        taken[b * W + a] = 1;
      }
    }
  }

  // THE GALLERIES (and the antechamber): tall mirrors down the far walls, a sconce between them; candelabra and banquettes by the
  // walls; busts; the court's portraits and banners; shards under a mirror or two; a skylight or two in the floor
  for (const q of G.rooms) {
    if (q.role !== 'gallery' && q.role !== 'ante') continue;
    const r = q.r;
    const alongX = r[2] - r[0] >= r[3] - r[1];
    // (down the far wall along the gallery's length: a mirror every three tiles, a sconce between every other pair)
    const wall = farWall(r).filter(([, , face]) => (alongX ? face === 0 : face === 1));
    wall.forEach(([x, y, face], k) => {
      if (k % 3 !== 1) return;
      onWall(Math.floor(k / 3) % 3 === 2 ? GG_PIECE.sconce : GG_PIECE.mirror, x, y, face, 0);
    });
    hang(rng.pick([GG_PIECE.portrait, GG_PIECE.banner, GG_PIECE.tapestry]), r, 1);
    if (rng.chance(0.3)) hang(GG_PIECE.orderMask, r, 1);
    byWall(GG_PIECE.candelabrum, r, Math.max(2, Math.floor((r[2] - r[0] + r[3] - r[1]) / 9)), true);
    byWall(GG_PIECE.banquette, r, rng.int(1, 2), true, (ax) => (ax ? 0 : 1));
    if (rng.chance(0.6)) byWall(rng.pick([GG_PIECE.bust, GG_PIECE.statue, GG_PIECE.vase]), r, 1, true);
    if (rng.chance(0.5)) {
      const [x, y] = tilesIn(r, 1).find(([a, b]) => free(a, b, true)) ?? [-1, -1];
      if (x >= 0) breakable('barrel', x, y);
    }
    // (shards on the floor under a mirror or two: the mirrors here have burst before)
    for (const p of props) {
      if (p.name !== GG_PIECE.mirror || !inRect(r, p.tx, p.ty) || !rng.chance(0.25)) continue;
      if (free(p.tx, p.ty)) put(GG_PIECE.shards, p.tx, p.ty, false);
    }
    if (q.role === 'gallery' && q.path > 1) for (let n = rng.int(1, 2), tries = 0; n > 0 && tries < 40; tries++) {
      const [x, y] = tilesIn(r, 1)[0];
      if (traps.some((t) => Math.hypot(t.x - x, t.y - y) < SKY.apart)) continue;
      if (skylight(x, y)) n--;
    }
    if (rng.chance(0.3)) scatter(GG_PIECE.fan, r, 1, false, false);
  }

  // THE DRESSING ROOMS, THE LAIR, THE STORES: a dressing table and a wardrobe by the walls, a screen, a cheval glass, a
  // banquette; her jewel box spilled, a hand mirror dropped; a sconce; the lair the guard's, two orchids in their pots
  for (const q of G.rooms) {
    if (q.role !== 'dressing' && q.role !== 'lair' && q.role !== 'store') continue;
    const r = q.r;
    hang(GG_PIECE.sconce, r, 2);
    if (rng.chance(0.6)) hang(GG_PIECE.mirror, r, 1);
    byWall(GG_PIECE.dressingTable, r, 1, true, (ax) => (ax ? 0 : 1));
    if (q.role !== 'store') {
      byWall(GG_PIECE.wardrobe, r, 1, true, (ax) => (ax ? 0 : 1));
      scatter(GG_PIECE.screen, r, 1, true, true);
      scatter(GG_PIECE.cheval, r, 1, true, true);
    }
    byWall(GG_PIECE.banquette, r, rng.int(0, 1), true, (ax) => (ax ? 0 : 1));
    scatter(GG_PIECE.jewels, r, 1, false, false);
    if (rng.chance(0.6)) scatter(GG_PIECE.handMirror, r, 1, false, false);
    byWall(GG_PIECE.candelabrum, r, 1, true);
    if (q.role === 'lair') for (let n = 2; n > 0; n--) {
      const [x, y] = tilesIn(r, 2).find(([a, b]) => free(a, b, true)) ?? [-1, -1];
      if (x >= 0) breakable('urn', x, y);
    }
  }

  // THE CHAPEL: stained-glass windows down its far walls, the day's colours lying on the floor before each; its pews in rows;
  // the glass coffin on its bier at its far end; candelabra
  for (const q of roomsOf('chapel')) {
    const r = q.r;
    const lit: [number, number][] = [];
    for (const [x, y, face] of farWall(r)) {
      if ((face === 0 ? x - r[0] : y - r[1]) % 3 !== 1) continue;
      if (onWall(GG_PIECE.window, x, y, face, 0)) lit.push(face === 0 ? [x, y + 1] : [x + 1, y]);
    }
    for (const [x, y] of lit) if (floorAt(x, y) && !keep[y * W + x]) out.tiles.push({ i: y * W + x, name: GG_PIECE.colours, frame: 0, mid: 1 } satisfies Act1Tile);
    const alongX = r[2] - r[0] >= r[3] - r[1];
    // (the pews across the chapel's length, in two banks either side of its middle aisle)
    const cx = Math.floor((r[0] + r[2]) / 2);
    const cy = Math.floor((r[1] + r[3]) / 2);
    for (let a = 3; a < (alongX ? r[2] - r[0] : r[3] - r[1]) - 4; a += 2) {
      for (const off of [-3, -2, 2, 3]) {
        const [x, y] = alongX ? [r[0] + a, cy + off] : [cx + off, r[1] + a];
        if (free(x, y)) put(GG_PIECE.pew, x, y, true, alongX ? 1 : 0);
      }
    }
    const [ex, ey] = alongX ? [r[2] - 2, cy] : [cx, r[3] - 2];
    if (free(ex, ey)) put(GG_PIECE.coffin, ex, ey, true);
    byWall(GG_PIECE.candelabrum, r, 2, true);
  }

  // THE GLASSHOUSE: benches of dead orchids in rows, pots, panes fallen from the roof
  for (const q of roomsOf('glasshouse')) {
    const r = q.r;
    const alongX = r[2] - r[0] >= r[3] - r[1];
    const cx = Math.floor((r[0] + r[2]) / 2);
    const cy = Math.floor((r[1] + r[3]) / 2);
    for (let a = 2; a < (alongX ? r[2] - r[0] : r[3] - r[1]) - 2; a += 3) {
      for (const off of [-3, 3]) {
        const [x, y] = alongX ? [r[0] + a, cy + off] : [cx + off, r[1] + a];
        if (free(x, y, true)) put(GG_PIECE.bench, x, y, true, alongX ? 0 : 1);
      }
    }
    for (let n = rng.int(2, 3); n > 0; n--) {
      const [x, y] = tilesIn(r, 2).find(([a, b]) => free(a, b, true)) ?? [-1, -1];
      if (x >= 0) breakable('urn', x, y);
    }
    scatter(GG_PIECE.pane, r, rng.int(2, 3), false, false);
  }

  // THE MIRROR HALL: kept clear for her; a candelabrum in each corner
  const hall = roomsOf('hall')[0];
  if (hall) {
    const r = hall.r;
    for (let ty = r[1] + 2; ty < r[3] - 2; ty++) for (let tx = r[0] + 2; tx < r[2] - 2; tx++) keep[ty * W + tx] = 1;
    for (const [x, y] of [[r[0] + 1, r[1] + 1], [r[2] - 2, r[1] + 1], [r[0] + 1, r[3] - 2], [r[2] - 2, r[3] - 2]] as [number, number][]) if (free(x, y)) put(GG_PIECE.candelabrum, x, y, true);
  }

  // THE QUEST: the apple on its silver dish, in the room before the hall, beside its doorway into it
  const hallI = G.rooms.findIndex((q) => q.role === 'hall');
  const inWay = G.ways.find((w) => w.b === hallI);
  const pre = inWay ? G.rooms[inWay.a] : undefined;
  if (pre && inWay) {
    const wc = { x: (inWay.r[0] + inWay.r[2]) / 2, y: (inWay.r[1] + inWay.r[3]) / 2 };
    const spots = tilesIn(pre.r, 1).sort((a, b) => Math.hypot(a[0] - wc.x, a[1] - wc.y) - Math.hypot(b[0] - wc.x, b[1] - wc.y));
    for (const [x, y] of spots) {
      if (!whole(x, y) || taken[y * W + x] || isWay(x, y) || onRunner(x, y)) continue;
      let onDoor = false;
      for (let b = -1; b <= 1 && !onDoor; b++) for (let a = -1; a <= 1; a++) if (isWay(x + a, y + b)) onDoor = true;
      if (onDoor) continue;
      put(GG_PIECE.apple, x, y, true);
      break;
    }
  }

  L.props.push(...props);
  // THE SKYLIGHTS' BEAT, as the descent's traps (game/traps.ts: a spike floor's)
  if (traps.length) {
    f.hazards = [...(f.hazards ?? []), ...traps];
    L.hazards = makeHazards(f);
  }

  // NOTHING WALLED OFF: every tile that could be walked before it was dressed, and is not under a piece, still reached from
  // where he comes in; where one is not, the piece nearest it is taken away again
  for (let guard = 0; guard < 40; guard++) {
    const seen = walkReach(L.walk, W, H, Math.floor(f.start.y) * W + Math.floor(f.start.x));
    let lost = -1;
    for (let i = 0; i < W * H && lost < 0; i++) if (before[i] === 1 && L.walk[i] === 1 && !seen[i]) lost = i;
    if (lost < 0) break;
    const lx = lost % W;
    const ly = Math.floor(lost / W);
    let best: PropInst | null = null;
    let bd = Infinity;
    for (const [p, list] of foot) {
      for (const i of list) {
        const d = Math.hypot((i % W) - lx, Math.floor(i / W) - ly);
        if (d < bd) {
          bd = d;
          best = p;
        }
      }
    }
    if (!best) break;
    for (const i of foot.get(best)!) L.walk[i] = before[i];
    foot.delete(best);
    L.props.splice(L.props.indexOf(best), 1);
  }
  return out;
}
