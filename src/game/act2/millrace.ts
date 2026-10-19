// ACT 2, THE HUSH: FLOOR 13, THE MILLRACE: ITS MAP-MAKER AND ITS DRESSER (game/act2_layout.ts asks it for the floor,
// game/act2_dress.ts for its pieces).
//
// HIS DOC ("Wordsmith Act 2: The Hush (Levels 11–15)", the project's claude/act2_hush.md), level 13: "Out a side gate and
// along the river, following the night carts." Its layout "open like the Pinewood: fields left overgrown through the siege,
// the river with little bridges, a water wheel, and a paper mill. Rows of sheets hang on drying lines and go see-through,
// like the mystic's tent, while someone is behind them." Its hazards "the mill race's fast water, and the turning wheel";
// its enemies "the Silent Order's carters, and the Hushed working the fields"; its story "carts bring the jars of voices
// here. The Silent Order pulps the stolen words into ink and paper, and the pages go back into the city"; its boss the
// Palimpsest, on "The Pulping Floor". And his word to the planning chat, 19 Oct 2026, 11:01 Pacific: "Get levels 11-15 into
// the game". The art is the art chat's, every part of it gone ahead on his word of 18 Oct, 21:24 Pacific ("Hey go without my
// say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15"):
// docs/mockups/act2_millrace/README.md; its ground art/millrace.ts (painted from what is laid here: Land.river, race,
// tracks, yards: render/outdoor.ts landLook); its 25 pieces art/floor13.ts and the Hush's 25 art/act2_set.ts; the art
// chat's own hand-laid stretch of it, src/dev/preview_millrace.ts, the likeness this is laid to.
//
// HOW IT IS LAID (the planning chat's, as the Pinewood's is, game/act1_layout.ts, which had his yes: "Everything looks good",
// 17 Oct): NO WALLS; open ground in shapes, its tiles whole or a half each, the rough past it at the same height.
//   THE MAIN WAY: a chain of big fields (the Pinewood's sizes and its count, as long as the descent's floors were made at his
//     word of 17 Oct, 11:37: "The levels are very short in 6-7 so far"), joined broadly or by wide paths, from THE SIDE GATE
//     where he comes in (a field gate standing open in a hedge behind him: the city's wall has no picture of its own) to THE
//     PULPING FLOOR at the far end, and the way on beyond it. The Order's cart track runs the length of it, and a branch of it
//     off to the mill (Land.tracks): "following the night carts".
//   THE MILL, off the main way half way along (a side area): the paper mill on its yard of setts (Land.yards), its water
//     wheel at its gable end, in THE MILL RACE (Land.race) cut off the river through a headgate, run past the wheel and back
//     into the river below it, a footbridge over it beside the wheel to the strip of ground between the race and the river;
//     the mill bell on its gable (THE MUFFLED BELL); the stamping mill turned from the wheel's shaft; the mould and deckle (the
//     quest); and beside the yard, the drying green, its rows of DRYING LINES.
//   THE RIVER (Land.river): a long bend across the whole floor, running straight past the mill's front, crossing the main way
//     between two fields: the cart bridge where the track crosses it, footbridges where the paths do (Land.bridges: whole
//     floor over the water, the Pinewood's bridges, five tiles over and two wide).
//   A FARMSTEAD (a side area: its chests, its hay wain and stooks) and A LAIR (the carters', the floor's guardian pack).
//   THE PULPING FLOOR, the boss's ground: open, a yard of setts, the Order's vats and press and reams round its edge, its
//     middle clear for a giant near twice the knight's height (the Palimpsest's whirl of pages reaches 2.55 tiles out of him).
//   THE BELLS (game/bells.ts's, by the contract in docs/act2_build.md): the Muffled Bell by the mill, off the main way; five
//     or six farm bells across the fields about it; the Hush's circle round it (Land.bells).
//
// WHAT COMES OUT: a Floor as the rest of the game knows one (its tiles, rooms, packs, props, where the hero starts and the boss
// waits) and its Land, by the floor's own dice: the same depth and seed give the same floor, here and in the painter's worker.

import { RNG } from '../../engine/rng';
import { act1Pack } from '../act1_mobs';
import { LEFT, MARGIN, RIGHT, along, blobDist, clear, cross, farEnd, laneDist, layTiles, nearestFloor, planChain, radiusOf, reach, segDist, tileMid, wander } from '../act1_layout';
import type { AreaRole, Blob, Bridge, Laid, Land, Plan } from '../act1_layout';
import type { Act1Dress, Act1Tile } from '../act1_dress';
import type { BellsPlan } from '../act2_types';
import type { Level, PropInst } from '../state';
import { makeHazards } from '../traps';
import { T_FLOOR, T_WALL } from '../types';
import type { Floor, HazardSpot, MonsterKind, PackSpot, PropSpot, Room, RoomKind } from '../types';

/** Whether this map-maker lays the floor yet (false: the descent's stands in). */
export const BUILT = true;

type P = [number, number];
const DEG = Math.PI / 180;

// ---------------------------------------------------------------------------------------------------
// THE SIZES (tiles; the planning chat's, the art leaving them to the game)

/**
 * THE FLOOR'S SHAPES. The main way as the Pinewood's (game/act1_layout.ts: CHAIN.pine 11 areas, its sizes, its paths
 * PINE_PATH.w 4.6 wide); the side areas' paths a little narrower; the Pulping Floor a little bigger than the Pinewood's
 * hollow (11.5 by 10.5 to its 10 by 9: the Palimpsest is near twice the knight's height); the mill's area long along x,
 * for the mill (four tiles by three), its yard, the race and the drying green beside it.
 */
export const MR_PLAN = {
  count: 11,
  path: 4.6,
  side: 3.4,
  start: { rx: 7, ry: 6, wob: 0.14 },
  field: { rx: [10, 13.5] as const, ry: [8, 10.5] as const, wob: 0.2 },
  boss: { rx: 11.5, ry: 10.5, wob: 0.08 },
  mill: { rx: 12.5, ry: 9, wob: 0.08 },
  farm: { rx: 6.5, ry: 5.5, wob: 0.12 },
  lair: { rx: 4.5, ry: 4, wob: 0.12 },
};
/**
 * THE WATER: the shape of the open ground stops `river` short of the river's middle (the Pinewood's: its water and its bank,
 * art/millrace.ts, inside it) and `race` short of the race's (its water and its kerb: the race is laid down tile middles, so
 * it is one tile wide, every tile beside it whole floor); and no tile but a bridge's is floor that has any of its ground
 * (its middle, corners or the middles of its sides) in the water itself, `water` (art/millrace.ts MR_RIVER_HALF 0.62 and
 * MR_RACE_HALF 0.34: the painter paints the water there, on whatever tile it is).
 */
export const MR_WET = { river: 0.95, race: 0.5, water: { river: 0.62, race: 0.34 } };
/** How far the mill keeps from where he comes in and from the Pulping Floor's edge (tiles): room for the Hush's circle and its bells (the Bells' contract). */
const MILL_FROM = { start: 36, boss: 30 };
/** THE BELLS (docs/act2_build.md): how far apart, how far from the start, the Hush's room to spare round them, how far it keeps from the start, and how far from the Muffled Bell a bell may be (the planning chat's: the event kept to the middle of the floor, about the mill's fields). */
export const MR_BELLS = { apart: 8, fromStart: 10, spare: 4, clearStart: 12, most: 28 };

// ---------------------------------------------------------------------------------------------------
// THE MILL'S WORKS, by where its race runs past the wheel

/** THE MILL: the race's column past the wheel (tile x), the wheel's row (tile y), and which way the race runs past it along y. */
export interface MillAt {
  cx: number;
  wy: number;
  s: 1 | -1;
}

/**
 * WHERE EACH OF THE MILL'S WORKS IS (tiles; world), from its race. The mill's ridge runs along x (the art's only way about),
 * its door in its long front toward the eye (+y); THE WATER WHEEL at its gable end toward +x, in the race running along y
 * there (the wheel's frames looking along +x, art/floor13.ts), so that it stands before the mill on the screen and is seen;
 * its axle into the gable (the mill's anchor two tiles short of the race's column). THE RACE: off the river through the
 * headgate, four tiles across to the wheel's column, ten tiles along it past the wheel, four back into the river (whose run
 * past the mill is straight along y, four tiles out from the race: riverOf). Between them a strip two tiles wide, reached by
 * the footbridge over the race just below the wheel. Also: the Muffled Bell on its gable at the mill's other end, two tiles
 * off it; the mill's yard of setts round it all, from the race's column back eight tiles (the drying green round it).
 */
export function millWorks(m: MillAt) {
  const { cx, wy, s } = m;
  const r0 = wy - 5 * s;
  const r1 = wy + 5 * s;
  return {
    /** The race's out and back rows (tile y). */
    r0,
    r1,
    race: [[cx + 4.5, r0 + 0.5], [cx + 0.5, r0 + 0.5], [cx + 0.5, r1 + 0.5], [cx + 4.5, r1 + 0.5]] as P[],
    /** The river's straight run past the mill, upstream end to downstream end. */
    run: [[cx + 4.5, r0 + 0.5 - 5 * s], [cx + 4.5, r1 + 0.5 + 5 * s]] as P[],
    /** The paper mill: its anchor (world) and its tiles (x0..x1, y0..y1, inclusive). */
    mill: { x: cx - 2, y: wy + 0.5, x0: cx - 4, y0: wy - 1, x1: cx - 1, y1: wy + 1 },
    wheel: { tx: cx, ty: wy },
    /** The footbridge over the race below the wheel (two tiles of the race made floor). */
    foot: [[cx, wy + 2 * s], [cx, wy + 3 * s]] as P[],
    /** The strip between the race and the river (tiles x0..x1, y0..y1 inclusive). */
    island: { x0: cx + 1, x1: cx + 2, y0: Math.min(r0, r1) + 1, y1: Math.max(r0, r1) - 1 },
    /** THE WHEEL'S STRIKE: the strip's tiles beside it (a spike floor's patch). */
    beside: { x: cx + 1, y: wy - 1, w: 1, h: 3 },
    /** A chest up the strip past the wheel. */
    chest: [cx + 2, wy - 3 * s] as P,
    /** The headgate across the race where it leaves the river. */
    gate: [cx + 3, r0] as P,
    /** The Muffled Bell's tile, by the mill's west gable. */
    bell: [cx - 6, wy] as P,
    /** The mill's yard of setts (x0, y0, x1, y1: x1 and y1 not in it). */
    yard: [cx - 8, wy - 3, cx, wy + 5] as [number, number, number, number],
  };
}
export type MillWorks = ReturnType<typeof millWorks>;

/** The mill as its land has it (from Land.race), or null. */
export function millOf(land: Land): MillAt | null {
  const r = land.race;
  if (!r || r.length < 4) return null;
  const s = r[2][1] > r[1][1] ? 1 : -1;
  return { cx: Math.floor(r[1][0]), wy: Math.floor((r[1][1] + r[2][1]) / 2), s };
}

// ---------------------------------------------------------------------------------------------------
// LAY THE FLOOR

/** The fields' sizes by role (half-widths, tiles). */
function sizeOf(rng: RNG, role: AreaRole): { rx: number; ry: number; wob: number } {
  if (role === 'boss') return { ...MR_PLAN.boss };
  if (role === 'start') return { ...MR_PLAN.start };
  const F = MR_PLAN.field;
  return { rx: rng.range(F.rx[0], F.rx[1]), ry: rng.range(F.ry[0], F.ry[1]), wob: F.wob };
}

/** Lay floor 13, or null (not laid this time: the dice are rolled again, game/act2_layout.ts). */
export function generate(depth: number, seed: number): Laid | null {
  const rng = new RNG((seed ^ 0x13a7c0de) >>> 0);
  // THE MAIN WAY: the fields, as the Pinewood's (across the screen one way or the other)
  const across = rng.chance(0.5) ? LEFT : RIGHT;
  const plan = planChain(rng, { count: MR_PLAN.count, heading: across + rng.range(-0.3, 0.3), spread: 0.9, turn: 0.6, size: sizeOf, broad: 0.55, laneW: MR_PLAN.path, laneLong: [3, 7], gap: 4 });
  if (!plan) return null;
  // THE MILL, off the main way half way along; THE RIVER past its front and across the way
  const site = siteMill(rng, plan);
  if (!site) return null;
  const river = riverOf(rng, plan, site.host, site.at);
  if (!river) return null;
  // THE FARMSTEAD AND THE LAIR, off the main way, clear of the water
  const race0 = millWorks(site.at).race;
  const dry = (x: number, y: number, r: number): boolean => laneDist({ pts: river, w: 0 }, x, y) > r + 3 && laneDist({ pts: race0, w: 0 }, x, y) > r + 3;
  if (growAway(rng, plan, 'side', MR_PLAN.farm, MR_PLAN.side, 3, dry) < 0) return null;
  if (growAway(rng, plan, 'lair', MR_PLAN.lair, MR_PLAN.side, 3, dry) < 0) return null;

  // THE BOUNDS: everything moved so the open ground starts MARGIN tiles in (by whole tiles, so the mill's works stay on theirs)
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  const grow = (x: number, y: number, r: number): void => {
    x0 = Math.min(x0, x - r);
    y0 = Math.min(y0, y - r);
    x1 = Math.max(x1, x + r);
    y1 = Math.max(y1, y + r);
  };
  for (const a of plan.areas) grow(a.blob.x, a.blob.y, a.r + 1);
  for (const l of plan.lanes) for (const [x, y] of l.pts) grow(x, y, l.w);
  const dx = MARGIN - Math.floor(x0);
  const dy = MARGIN - Math.floor(y0);
  for (const a of plan.areas) {
    a.blob.x += dx;
    a.blob.y += dy;
  }
  const move = (pts: P[]): void => {
    for (const p of pts) {
      p[0] += dx;
      p[1] += dy;
    }
  };
  for (const l of plan.lanes) move(l.pts);
  move(plan.way);
  move(river);
  const at: MillAt = { cx: site.at.cx + dx, wy: site.at.wy + dy, s: site.at.s };
  const works = millWorks(at);
  const W = Math.ceil(x1 - x0) + 2 * MARGIN;
  const H = Math.ceil(y1 - y0) + 2 * MARGIN;
  // (the river kept to the floor and a little past it: the painter asks of its every piece, render/outdoor.ts)
  const riverPts = trimTo(river, W, H, 6);

  // THE CART TRACKS: the Order's, the length of the main way, and the branch off it to the mill's yard
  const bossA = plan.areas.find((a) => a.role === 'boss')!.blob;
  const startA = plan.areas[0].blob;
  const millA = plan.areas[site.area].blob;
  const hostA = plan.areas[site.host].blob;
  const main = trackOf(rng, plan.way);
  const millLane = plan.lanes[site.lane];
  const front = millLane.pts[millLane.pts.length - 1][1] > works.mill.y ? 1 : -1;
  const branch = trackOf(rng, [[hostA.x, hostA.y], ...millLane.pts.slice(1).map((p) => [p[0], p[1]] as P), [works.mill.x - 0.5, works.mill.y + 2.6 * front]]);

  // THE BRIDGES: over the river, where the tracks cross it (the cart bridge) and the paths (footbridges); over the race,
  // beside the wheel, and wherever a path crosses it
  const bridges: Bridge[] = [];
  const bridgeTiles = new Set<number>();
  const addBridge = (b: Bridge): void => {
    bridges.push(b);
    for (const i of b.tiles) bridgeTiles.add(i);
  };
  const routes: P[][] = [main, branch, ...plan.lanes.map((l) => l.pts)];
  for (const c of crossingsOf(routes, riverPts)) {
    const tiles: number[] = [];
    const tx = Math.floor(c.x);
    const ty = Math.floor(c.y);
    for (let k = -2; k <= 2; k++) for (let s = 0; s <= 1; s++) tiles.push(c.alongX ? (ty + s) * W + tx + k : (ty + k) * W + tx + s);
    addBridge({ tiles, alongX: c.alongX });
  }
  addBridge({ tiles: works.foot.map(([x, y]) => y * W + x), alongX: true });
  for (const c of crossingsOf(plan.lanes.map((l) => l.pts), works.race)) {
    // (the race is laid down tile middles: a footbridge over it is two of its tiles, side by side along it)
    if (c.alongX) {
      const ty = Math.floor(c.y);
      if (Math.abs(ty - at.wy) <= 2) continue;
      addBridge({ tiles: [ty * W + at.cx, (ty + 1) * W + at.cx], alongX: true });
    } else {
      const tx = Math.floor(c.x);
      const ty = Math.floor(c.y);
      addBridge({ tiles: [ty * W + tx, ty * W + tx + 1], alongX: false });
    }
  }

  // THE SHAPE OF THE OPEN GROUND, and the water out of it
  const reachOf = plan.areas.map((a) => radiusOf(a.blob));
  const boxOf = plan.lanes.map((l) => {
    let bx0 = Infinity;
    let by0 = Infinity;
    let bx1 = -Infinity;
    let by1 = -Infinity;
    for (const [px, py] of l.pts) {
      bx0 = Math.min(bx0, px);
      by0 = Math.min(by0, py);
      bx1 = Math.max(bx1, px);
      by1 = Math.max(by1, py);
    }
    const r = l.w / 2;
    return [bx0 - r, by0 - r, bx1 + r, by1 + r] as const;
  });
  const inside = (x: number, y: number): boolean => {
    for (let i = 0; i < plan.areas.length; i++) {
      const b = plan.areas[i].blob;
      const ex = x - b.x;
      const ey = y - b.y;
      if (ex * ex + ey * ey >= reachOf[i] * reachOf[i]) continue;
      if (blobDist(b, x, y) < 1) return true;
    }
    for (let i = 0; i < plan.lanes.length; i++) {
      const bx = boxOf[i];
      if (x < bx[0] || y < bx[1] || x > bx[2] || y > bx[3]) continue;
      if (laneDist(plan.lanes[i], x, y) < plan.lanes[i].w / 2) return true;
    }
    return false;
  };
  const riverD = nearLine(riverPts, MR_WET.river + 1);
  const raceD = nearLine(works.race, MR_WET.race + 1);
  const wet = (x: number, y: number): boolean => riverD(x, y) < MR_WET.river || raceD(x, y) < MR_WET.race;
  const shape = (x: number, y: number): boolean => inside(x, y) && !wet(x, y);
  const whole = (tx: number, ty: number): boolean => bridgeTiles.has(ty * W + tx);
  // (a tile of the descent's laying is whole where it is least wrong so, a little of it outside the shape: here none of it in the water)
  const EDGE: P[] = [[0.5, 0.5], [0, 0], [1, 0], [0, 1], [1, 1], [0.5, 0], [0, 0.5], [1, 0.5], [0.5, 1]];
  const never = (tx: number, ty: number): boolean => !bridgeTiles.has(ty * W + tx) && EDGE.some(([u, v]) => riverD(tx + u, ty + v) < MR_WET.water.river || raceD(tx + u, ty + v) < MR_WET.water.race);
  const maybe = new Uint8Array(W * H);
  const stamp = (x: number, y: number, r: number): void => {
    for (let ty = Math.max(0, Math.floor(y - r)); ty <= Math.min(H - 1, Math.ceil(y + r)); ty++) for (let tx = Math.max(0, Math.floor(x - r)); tx <= Math.min(W - 1, Math.ceil(x + r)); tx++) maybe[ty * W + tx] = 1;
  };
  for (const a of plan.areas) stamp(a.blob.x, a.blob.y, a.r + 2);
  for (const l of plan.lanes) {
    for (let i = 0; i + 1 < l.pts.length; i++) {
      const [ax, ay] = l.pts[i];
      const [bx, by] = l.pts[i + 1];
      const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 1.5));
      for (let k = 0; k <= n; k++) stamp(ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n, l.w / 2 + 2);
    }
  }

  // WHAT THE MILL KEEPS FOR ITS OWN (nothing of the packs' or the game's things on it): its tiles and a ring round them,
  // its works, the strip past the wheel, the Muffled Bell's ring, its bridges
  const reserved = new Uint8Array(W * H);
  const reserve = (x: number, y: number): void => {
    if (x >= 0 && y >= 0 && x < W && y < H) reserved[y * W + x] = 1;
  };
  const [mbx, mby] = works.bell;
  for (let y = works.mill.y0 - 1; y <= works.mill.y1 + 1; y++) for (let x = works.mill.x0 - 1; x <= works.mill.x1 + 1; x++) reserve(x, y);
  for (let y = works.island.y0; y <= works.island.y1; y++) for (let x = works.island.x0; x <= works.island.x1; x++) reserve(x, y);
  for (let y = mby - 1; y <= mby + 1; y++) for (let x = mbx - 1; x <= mbx + 1; x++) reserve(x, y);
  for (const i of bridgeTiles) reserved[i] = 1;
  // (the bells' room asked first of the shape itself, by dice of its own: a floor without it is let go of before its tiles are laid, the dear part)
  const roughly = new Int8Array(W * H).fill(-1);
  const wholeShape = (i: number): boolean => {
    if (roughly[i] < 0) {
      const x = i % W;
      const y = (i - x) / W;
      roughly[i] = !never(x, y) && EDGE.every(([u, v]) => shape(x + Math.min(0.95, Math.max(0.05, u)), y + Math.min(0.95, Math.max(0.05, v)))) ? 1 : 0;
    }
    return roughly[i] === 1;
  };
  if (!bellsOf(new RNG((seed ^ 0x5bd1e995) >>> 0), W, H, { x: startA.x, y: startA.y }, wholeShape, plan, works, reserved, millA, bossA)) return null;

  const { tiles, cut } = layTiles(W, H, shape, whole, never, maybe);

  // THE START AND THE BOSS; KEEP ONLY WHAT IS REACHED from the start (by whole tiles; a cut tile beside them stays: it is edge)
  const start = nearestFloor(W, H, tiles, cut, startA.x, startA.y);
  if (start < 0) return null;
  const got = reach(W, H, tiles, cut, start, false);
  for (let i = 0; i < W * H; i++) {
    if (tiles[i] !== T_FLOOR || got[i]) continue;
    const x = i % W;
    const y = (i - x) / W;
    if (cut[i] !== 0 && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => { const j = (y + b) * W + x + a; return j >= 0 && j < W * H && got[j] === 1; })) continue;
    tiles[i] = T_WALL;
    cut[i] = 0;
  }
  const bossTile = nearestFloor(W, H, tiles, cut, bossA.x, bossA.y);
  if (bossTile < 0 || !got[bossTile]) return null;
  // (every area's middle reached, or the plan is rolled again: an area cut off by the water or a half-tile neck)
  for (const a of plan.areas) {
    const t = nearestFloor(W, H, tiles, cut, a.blob.x, a.blob.y);
    if (t < 0 || !got[t]) return null;
  }
  // (the mill's own: the Muffled Bell's ring, the yard before the mill, the strip past the wheel by its footbridge)
  const gotAt = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && got[y * W + x] === 1;
  for (let y = mby - 1; y <= mby + 1; y++) for (let x = mbx - 1; x <= mbx + 1; x++) if (!gotAt(x, y)) return null;
  for (const [x, y] of works.foot) if (!gotAt(x, y)) return null;
  if (!gotAt(works.beside.x, at.wy) || !gotAt(works.chest[0], works.chest[1])) return null;
  for (let y = works.mill.y0 - 1; y <= works.mill.y1 + 1; y++) if (!gotAt(works.mill.x0 - 1, y)) return null;

  // ROOMS: each area its bounding box (an elite field or two on the main way: a yellow pack's)
  const rooms: Room[] = [];
  const areaRoom: number[] = [];
  const roleKind = (r: AreaRole): RoomKind => (r === 'start' ? 'start' : r === 'boss' ? 'boss' : r === 'side' ? 'treasure' : r === 'lair' ? 'guardian' : 'normal');
  plan.areas.forEach((a, i) => {
    const R = Math.ceil(Math.max(a.blob.rx, a.blob.ry) * (1 + a.blob.wob));
    const room: Room = { id: rooms.length, x: Math.max(0, Math.floor(a.blob.x - R)), y: Math.max(0, Math.floor(a.blob.y - R)), w: 2 * R + 1, h: 2 * R + 1, kind: roleKind(a.role), path: a.path };
    rooms.push(room);
    areaRoom[i] = room.id;
  });
  const pathRooms = rooms.filter((r) => r.kind === 'normal' && r.path > 0);
  rng.shuffle(pathRooms);
  for (let k = 0; k < Math.min(2, Math.floor(pathRooms.length / 3)); k++) pathRooms[k].kind = 'elite';

  const floor: Floor = {
    depth,
    seed,
    w: W,
    h: H,
    tiles,
    cut,
    variant: new Uint8Array(W * H),
    rooms,
    start: tileMid(W, start),
    boss: tileMid(W, bossTile),
    packs: [],
    props: [],
  };
  const vr = new RNG(seed ^ 0x1b873593);
  for (let i = 0; i < W * H; i++) floor.variant[i] = vr.int(0, 255);

  // THE BELLS
  const bells = bellsOf(rng, W, H, floor.start, (i) => tiles[i] === T_FLOOR && cut[i] === 0 && got[i] === 1, plan, works, reserved, millA, bossA);
  if (!bells) return null;
  for (const b of bells.bells) for (let y = Math.floor(b.y) - 1; y <= Math.floor(b.y) + 1; y++) for (let x = Math.floor(b.x) - 1; x <= Math.floor(b.x) + 1; x++) reserve(x, y);

  // THE PACKS, THE GAME'S THINGS
  floor.packs = packsOf(rng, floor, plan, areaRoom, depth, reserved, bells);
  floor.props = propsOf(rng, floor, plan, works, reserved, millA);

  // THE YARDS: the mill's, and the Pulping Floor's in the middle of the boss's ground
  const pulp: [number, number, number, number] = [Math.round(bossA.x - 7), Math.round(bossA.y - 6), Math.round(bossA.x + 7), Math.round(bossA.y + 6)];

  const land: Land = {
    kind: 'millrace',
    depth,
    seed,
    river: riverPts,
    bridges,
    way: plan.way,
    areas: plan.areas.map((a, i) => ({ blob: a.blob, room: areaRoom[i], role: a.role })),
    lanes: plan.lanes,
    holds: [],
    exit: farEnd(plan, tiles, cut, W, H, bossA),
    arrive: { ...floor.start },
    race: works.race,
    tracks: [main, branch],
    yards: [works.yard, pulp],
    bells,
  };
  return { floor, land };
}

// ---------------------------------------------------------------------------------------------------
// THE MILL'S SITE

/**
 * THE MILL, off a field of the middle of the main way, to one side of it along y (so that the river, run past its front
 * along y, goes on across the main way: riverOf), clear of every other area and path, and far enough from where he comes in
 * and from the Pulping Floor for the Hush's circle round its bell (MILL_FROM). Its area is pushed onto the plan, and the
 * path to it.
 */
function siteMill(rng: RNG, plan: Plan): { area: number; host: number; lane: number; at: MillAt } | null {
  const n = plan.areas.length;
  const S = plan.areas[0].blob;
  const B = plan.areas[n - 1].blob;
  const hosts: number[] = [];
  for (let i = Math.floor(n * 0.3); i <= Math.ceil(n * 0.7); i++) if (plan.areas[i] && plan.areas[i].role === 'path') hosts.push(i);
  if (!hosts.length) return null;
  const M = MR_PLAN.mill;
  for (let tries = 0; tries < 120; tries++) {
    const k = rng.pick(hosts);
    const a = plan.areas[k].blob;
    const ang = (rng.chance(0.5) ? 90 : 270) * DEG + rng.range(-0.6, 0.6);
    const rA = Math.max(a.rx, a.ry);
    const rB = Math.max(M.rx, M.ry);
    const [x, y] = along(a.x, a.y, ang, rA + rB + rng.range(1, 5));
    if (Math.hypot(x - S.x, y - S.y) < MILL_FROM.start || Math.hypot(x - B.x, y - B.y) < MILL_FROM.boss + radiusOf(B)) continue;
    const b: Blob = { x, y, rx: M.rx, ry: M.ry, rot: 0, wob: M.wob, seed: rng.int(0, 9999) };
    const lane = wander(rng, ...along(a.x, a.y, ang, rA * 0.6), ...along(x, y, ang + Math.PI, rB * 0.4), MR_PLAN.side, 0.8);
    if (!clear(plan.areas, b, 3, [k], lane)) continue;
    if (plan.lanes.some((l) => laneDist(l, x, y) < radiusOf(b) + l.w / 2 + 3)) continue;
    plan.areas.push({ blob: b, role: 'side', path: -1, parent: k, r: radiusOf(b) });
    plan.lanes.push(lane);
    // (the race runs the river's way past the wheel: toward the main way, where the river goes on to)
    const s: 1 | -1 = Math.sin(ang) > 0 ? -1 : 1;
    return { area: plan.areas.length - 1, host: k, lane: plan.lanes.length - 1, at: { cx: Math.round(x + MR_PLAN.mill.rx - 5), wy: Math.floor(y), s } };
  }
  return null;
}

/**
 * THE RIVER: from far beyond the mill, straight along y past its front (four tiles out from the race's column, where the race
 * leaves it and comes back), then across the main way between the mill's field and the next one on (the cart bridge), and
 * on out the far side; in a smooth bend (a curve through its turning points, a point every six tiles or so). Null where it
 * would turn back on itself, or pass through an area's middle, or come near where he comes in or the Pulping Floor.
 */
function riverOf(rng: RNG, plan: Plan, host: number, at: MillAt): P[] | null {
  const w = millWorks(at);
  const [run0, run1] = w.run;
  const s = at.s;
  // (where it crosses the main way: half way from the mill's field to the next one on or back, whichever it turns less to reach,
  // and not more than sixty degrees off its run)
  const A = plan.areas[host].blob;
  let T: P | null = null;
  let g: P = [0, s];
  let best = 0.5;
  for (const nb of [host + 1, host - 1]) {
    const N = plan.areas[nb]?.blob;
    if (!N || plan.areas[nb].role === 'boss') continue;
    const t: P = [(A.x + N.x) / 2, (A.y + N.y) / 2];
    const gl = Math.hypot(t[0] - run1[0], t[1] - run1[1]) || 1;
    const along = ((t[1] - run1[1]) * s) / gl;
    if (along < best) continue;
    best = along;
    T = t;
    g = [(t[0] - run1[0]) / gl, (t[1] - run1[1]) / gl];
  }
  if (!T) return null;
  // upstream: the run's way back, turned toward the side of the floor the river comes from
  let ux = -g[0] * 0.6;
  let uy = -s;
  const ul = Math.hypot(ux, uy);
  ux /= ul;
  uy /= ul;
  const wob = (): number => rng.range(-6, 6);
  // (out of the run it turns toward the main way in a long bend, not an elbow: half way round, seven tiles on, or nearer
  // where the main way is near)
  const D1: P = [run1[0], run1[1] + s * 3];
  let hx = g[0];
  let hy = g[1] + s;
  const hl = Math.hypot(hx, hy) || 1;
  hx /= hl;
  hy /= hl;
  const on = Math.min(7, 0.45 * Math.hypot(T[0] - D1[0], T[1] - D1[1]));
  const bend: P[] = [[D1[0] + hx * on, D1[1] + hy * on]];
  const ctrl: P[] = [
    [run0[0] + ux * 80 + uy * wob(), run0[1] + uy * 80 - ux * wob()],
    [run0[0] + ux * 34 + uy * wob(), run0[1] + uy * 34 - ux * wob()],
    [run0[0], run0[1] - s * 5],
    run0,
    run1,
    D1,
    ...bend,
    T,
    [T[0] + g[0] * 34 - g[1] * wob(), T[1] + g[1] * 34 + g[0] * wob()],
    [T[0] + g[0] * 84, T[1] + g[1] * 84],
  ];
  const pts = curve(ctrl, 6);
  // (clear of every area's middle; well clear of where he comes in and of the Pulping Floor)
  const d = (x: number, y: number): number => laneDist({ pts, w: 0 }, x, y);
  for (const a of plan.areas) {
    const need = a.role === 'start' || a.role === 'boss' ? radiusOf(a.blob) + 3 : a.role === 'side' && a.blob.rx === MR_PLAN.mill.rx ? 8.5 : 3;
    if (d(a.blob.x, a.blob.y) < need) return null;
  }
  return pts;
}

/** A smooth curve through points (Catmull-Rom), a point every `step` tiles or so: straight where three of them are in a line. */
function curve(c: readonly P[], step: number): P[] {
  const out: P[] = [];
  for (let i = 0; i + 1 < c.length; i++) {
    const p0 = c[Math.max(0, i - 1)];
    const p1 = c[i];
    const p2 = c[i + 1];
    const p3 = c[Math.min(c.length - 1, i + 2)];
    const n = Math.max(1, Math.round(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, cc: number, dd: number): number => 0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - dd) * t2 + (-a + 3 * b - 3 * cc + dd) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push([c[c.length - 1][0], c[c.length - 1][1]]);
  return out;
}

/** A line kept to the floor (and `pad` tiles past its edge): its points outside dropped, but one either side of what is kept. */
function trimTo(pts: readonly P[], W: number, H: number, pad: number): P[] {
  const inn = (p: P): boolean => p[0] > -pad && p[1] > -pad && p[0] < W + pad && p[1] < H + pad;
  let a = pts.findIndex(inn);
  let b = pts.length - 1;
  while (b > 0 && !inn(pts[b])) b--;
  if (a < 0) return pts.map((p) => [p[0], p[1]] as P);
  a = Math.max(0, a - 1);
  b = Math.min(pts.length - 1, b + 1);
  return pts.slice(a, b + 1).map((p) => [p[0], p[1]] as P);
}

/** How far from a line world (x, y) is, quickly: only its pieces near (x, y) are asked (Infinity past `far`). */
function nearLine(pts: readonly P[], far: number): (x: number, y: number) => number {
  const CELL = 8;
  const cells = new Map<number, number[]>();
  const key = (cx: number, cy: number): number => (cx + 512) * 4096 + (cy + 512);
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    for (let cy = Math.floor((Math.min(ay, by) - far) / CELL); cy <= Math.floor((Math.max(ay, by) + far) / CELL); cy++) {
      for (let cx = Math.floor((Math.min(ax, bx) - far) / CELL); cx <= Math.floor((Math.max(ax, bx) + far) / CELL); cx++) {
        const k = key(cx, cy);
        const list = cells.get(k);
        if (list) list.push(i);
        else cells.set(k, [i]);
      }
    }
  }
  return (x, y) => {
    const list = cells.get(key(Math.floor(x / CELL), Math.floor(y / CELL)));
    if (!list) return Infinity;
    let d = Infinity;
    for (const i of list) d = Math.min(d, segDist(x, y, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]));
    return d;
  };
}

/** THE ORDER'S CART TRACK along a line of points: in pieces of five tiles or so, each turned a little off the straight. */
function trackOf(rng: RNG, line: readonly P[]): P[] {
  const out: P[] = [[line[0][0], line[0][1]]];
  for (let i = 0; i + 1 < line.length; i++) {
    const [ax, ay] = line[i];
    const [bx, by] = line[i + 1];
    const len = Math.hypot(bx - ax, by - ay);
    const n = Math.max(1, Math.round(len / 5));
    const nx = -(by - ay) / (len || 1);
    const ny = (bx - ax) / (len || 1);
    for (let k = 1; k < n; k++) {
      const t = k / n;
      const off = rng.range(-0.7, 0.7);
      out.push([ax + (bx - ax) * t + nx * off, ay + (by - ay) * t + ny * off]);
    }
    out.push([bx, by]);
  }
  return out;
}

/** Where routes cross a line of water (one crossing in six tiles), and which way a bridge goes over it there (along x where the water runs more along y). */
function crossingsOf(routes: readonly (readonly P[])[], water: readonly P[]): { x: number; y: number; alongX: boolean }[] {
  const out: { x: number; y: number; alongX: boolean }[] = [];
  for (const route of routes) {
    for (let i = 0; i + 1 < route.length; i++) {
      for (let j = 0; j + 1 < water.length; j++) {
        const p = cross(route[i] as P, route[i + 1] as P, water[j] as P, water[j + 1] as P);
        if (!p) continue;
        if (out.some((c) => Math.hypot(c.x - p[0], c.y - p[1]) < 6)) continue;
        const rh = Math.atan2(water[j + 1][1] - water[j][1], water[j + 1][0] - water[j][0]);
        out.push({ x: p[0], y: p[1], alongX: Math.abs(Math.sin(rh)) > Math.abs(Math.cos(rh)) });
      }
    }
  }
  return out;
}

/** A side area off one of the main way's fields (not the boss's), as the descent's (game/act1_layout.ts growSide), kept `dry` (clear of the river and the race). */
function growAway(rng: RNG, plan: Plan, role: AreaRole, size: { rx: number; ry: number; wob: number }, laneW: number, gap: number, dry: (x: number, y: number, r: number) => boolean): number {
  const hosts = plan.areas.map((_a, i) => i).filter((i) => plan.areas[i].role === 'path' || plan.areas[i].role === 'start');
  for (let tries = 0; tries < 80; tries++) {
    const host = rng.pick(hosts);
    const a = plan.areas[host].blob;
    const ang = rng.range(0, Math.PI * 2);
    const rA = Math.max(a.rx, a.ry);
    const rB = Math.max(size.rx, size.ry);
    const [x, y] = along(a.x, a.y, ang, rA + rB + rng.range(3, 7));
    const b: Blob = { x, y, rx: size.rx, ry: size.ry, rot: rng.range(0, Math.PI), wob: size.wob, seed: rng.int(0, 9999) };
    if (!dry(x, y, radiusOf(b))) continue;
    const lane = wander(rng, ...along(a.x, a.y, ang, rA * 0.6), ...along(x, y, ang + Math.PI, rB * 0.5), laneW, 0.8);
    if (!clear(plan.areas, b, gap, [host], lane)) continue;
    if (plan.lanes.some((l) => laneDist(l, x, y) < rB + l.w / 2 + gap)) continue;
    plan.areas.push({ blob: b, role, path: -1, parent: host, r: radiusOf(b) });
    plan.lanes.push(lane);
    return plan.areas.length - 1;
  }
  return -1;
}

// ---------------------------------------------------------------------------------------------------
// THE BELLS (the contract: docs/act2_build.md)

/**
 * THE BELLS: the Muffled Bell on its gable by the mill (off the main way: the mill's area is a side area); five or six farm
 * bells about it across the fields and the farmstead (his doc, as art/floor13.ts has it: "Farm bells on posts across the
 * fields"), within MR_BELLS.most of it, each on whole floor reached from the start with the eight tiles round it the same
 * (nothing the mill keeps, no bridge), in a field and not out on a path between them, no two within eight tiles (nor within
 * eight of the Muffled Bell), none within ten of the start nor in the Pulping Floor, none in the mill's area; spread (of two
 * dozen tries, each taking the places in a shuffled order, a field's edge before its middle, as long as they keep eight
 * apart, the one whose bells stand furthest apart); and the Hush's circle round the Muffled Bell holding them all with four
 * tiles to spare, twelve clear of the start and clear of the Pulping Floor.
 */
function bellsOf(rng: RNG, W: number, H: number, start: { x: number; y: number }, floorAt: (i: number) => boolean, plan: Plan, w: MillWorks, reserved: Uint8Array, mill: Blob, boss: Blob): BellsPlan | null {
  const B = MR_BELLS;
  /** (a tile and the eight round it whole floor reached from the start: `floorAt` says of each) */
  const ok = (tx: number, ty: number): boolean => {
    for (let y = ty - 1; y <= ty + 1; y++) {
      for (let x = tx - 1; x <= tx + 1; x++) {
        if (x < 0 || y < 0 || x >= W || y >= H || !floorAt(y * W + x)) return false;
      }
    }
    return true;
  };
  const [mx, my] = w.bell;
  if (!ok(mx, my)) return null;
  const c = { x: mx + 0.5, y: my + 0.5 };
  const toStart = Math.hypot(c.x - start.x, c.y - start.y);
  const toBoss = Math.hypot(c.x - boss.x, c.y - boss.y) - radiusOf(boss) - 0.5;
  if (toStart < 12) return null;
  const room = Math.min(B.most, toStart - B.clearStart - B.spare, toBoss - B.spare);
  if (room < 12) return null;
  const want = rng.int(5, 6);
  const cands: { x: number; y: number; edge: number }[] = [];
  for (let ty = Math.floor(c.y - room); ty <= Math.ceil(c.y + room); ty++) {
    for (let tx = Math.floor(c.x - room); tx <= Math.ceil(c.x + room); tx++) {
      const x = tx + 0.5;
      const y = ty + 0.5;
      const d = Math.hypot(x - c.x, y - c.y);
      if (d > room || d < B.apart) continue;
      if (!ok(tx, ty)) continue;
      let mine = false;
      for (let yy = ty - 1; yy <= ty + 1 && !mine; yy++) for (let xx = tx - 1; xx <= tx + 1; xx++) if (reserved[yy * W + xx]) mine = true;
      if (mine) continue;
      if (Math.hypot(x - start.x, y - start.y) < B.fromStart) continue;
      if (blobDist(boss, x, y) < 1.15 || blobDist(mill, x, y) < 1.05) continue;
      // (in a field, not out on a path between them: the main way's narrows kept clear)
      let edge = -1;
      for (const a of plan.areas) {
        if (a.role === 'boss' || a.blob === mill) continue;
        const bd = blobDist(a.blob, x, y);
        if (bd < 0.85) edge = Math.max(edge, bd);
      }
      if (edge < 0) continue;
      cands.push({ x, y, edge });
    }
  }
  // (spread: of a few tries, each taking the places in a shuffled order, a field's edge first, as far as they go, the one
  // whose bells stand furthest apart)
  let chosen: { x: number; y: number }[] | null = null;
  let spread = -Infinity;
  for (let t = 0; t < 24; t++) {
    const order = rng.shuffle(cands.map((q) => ({ q, k: q.edge * 0.6 + rng.next() }))).sort((a, b) => b.k - a.k);
    const set: { x: number; y: number }[] = [];
    for (const { q } of order) {
      if (set.length >= want) break;
      if (set.every((o) => Math.hypot(o.x - q.x, o.y - q.y) >= B.apart)) set.push({ x: q.x, y: q.y });
    }
    if (set.length < want) continue;
    let m = 0;
    for (const a of set) m += Math.min(...set.filter((b) => b !== a).map((b) => Math.hypot(a.x - b.x, a.y - b.y)));
    if (m > spread) {
      spread = m;
      chosen = set;
    }
  }
  if (!chosen) return null;
  const far = Math.max(...chosen.map((q) => Math.hypot(q.x - c.x, q.y - c.y)));
  const r = Math.ceil((far + B.spare + 0.5) * 2) / 2;
  if (toStart - r < B.clearStart || Math.hypot(c.x - boss.x, c.y - boss.y) - r < radiusOf(boss)) return null;
  return { muffled: c, bells: chosen, hush: { x: c.x, y: c.y, r } };
}

// ---------------------------------------------------------------------------------------------------
// THE PACKS AND THE GAME'S THINGS

/** The packs, by area, as the descent's (game/act1_layout.ts placePacks; the Hush's own kinds, game/act2_mobs.ts): never on what the mill keeps, nor within three tiles of a bell. */
function packsOf(rng: RNG, f: Floor, plan: Plan, areaRoom: readonly number[], depth: number, reserved: Uint8Array, bells: BellsPlan): PackSpot[] {
  const out: PackSpot[] = [];
  const W = f.w;
  const used: P[] = [];
  const free = (x: number, y: number, r: number): boolean => {
    for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) {
      for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) {
        if (tx < 0 || ty < 0 || tx >= W || ty >= f.h) return false;
        const i = ty * W + tx;
        if (f.tiles[i] !== T_FLOOR || reserved[i]) return false;
      }
    }
    return [bells.muffled, ...bells.bells].every((b) => Math.hypot(b.x - x, b.y - y) >= 3);
  };
  const put = (x: number, y: number, room: number, tier: PackSpot['tier'], kind: MonsterKind, size: number): void => {
    out.push({ x: Math.floor(x) + 0.5, y: Math.floor(y) + 0.5, roomId: room, size, tier, kind });
    used.push([x, y]);
  };
  plan.areas.forEach((a, i) => {
    const room = f.rooms[areaRoom[i]];
    if (a.role === 'start' || a.role === 'boss') return;
    const b = a.blob;
    const n = a.role === 'lair' ? 1 : Math.max(1, Math.round((Math.PI * b.rx * b.ry) / 70));
    for (let k = 0; k < n; k++) {
      for (let tries = 0; tries < 30; tries++) {
        const ang = rng.range(0, Math.PI * 2);
        const d = Math.sqrt(rng.next()) * 0.62;
        const x = b.x + Math.cos(ang) * b.rx * d;
        const y = b.y + Math.sin(ang) * b.ry * d;
        if (!free(x, y, 1)) continue;
        if (Math.hypot(x - f.start.x, y - f.start.y) < 10) continue;
        if (used.some(([ux, uy]) => Math.hypot(ux - x, uy - y) < 5)) continue;
        const tier: PackSpot['tier'] = a.role === 'lair' ? 'champion' : room.kind === 'elite' && k === 0 ? 'elite' : 'normal';
        const p = act1Pack(depth, rng, tier);
        put(x, y, room.id, tier, p.kind, p.size);
        break;
      }
    }
  });
  // (along the paths, a small pack here and there)
  for (const l of plan.lanes) {
    const len = l.pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - l.pts[i - 1][0], p[1] - l.pts[i - 1][1]) : 0), 0);
    if (len < 12 || rng.chance(0.5)) continue;
    const mid = l.pts[Math.floor(l.pts.length / 2)];
    if (!free(mid[0], mid[1], 0.5) || used.some(([ux, uy]) => Math.hypot(ux - mid[0], uy - mid[1]) < 6) || Math.hypot(mid[0] - f.start.x, mid[1] - f.start.y) < 10) continue;
    const p = act1Pack(depth, rng, 'normal');
    put(mid[0], mid[1], -1, 'normal', p.kind, Math.max(2, Math.ceil(p.size * 0.6)));
  }
  return out;
}

/**
 * The game's own things: the farmstead's chests (two or three) and one up the strip past the wheel; its barrels, drawn as
 * stooks of corn (the floor's breakables: game/act1_dress.ts ACT1_SETS[13]), about the fields and the farmstead; its urns,
 * drawn as bales of rags, by the mill.
 */
function propsOf(rng: RNG, f: Floor, plan: Plan, w: MillWorks, reserved: Uint8Array, mill: Blob): PropSpot[] {
  const out: PropSpot[] = [];
  const W = f.w;
  const taken = new Set<number>();
  const ok = (tx: number, ty: number): boolean => {
    for (let y = ty - 1; y <= ty + 1; y++) {
      for (let x = tx - 1; x <= tx + 1; x++) {
        const i = y * W + x;
        if (x < 0 || y < 0 || x >= W || y >= f.h || f.tiles[i] !== T_FLOOR || f.cut![i] !== 0 || reserved[i]) return false;
      }
    }
    return !taken.has(ty * W + tx) && Math.hypot(tx + 0.5 - f.start.x, ty + 0.5 - f.start.y) > 4;
  };
  const put = (k: PropSpot['kind'], tx: number, ty: number): void => {
    out.push({ kind: k, x: tx, y: ty });
    taken.add(ty * W + tx);
  };
  // (the chest past the wheel: the strip is two tiles wide, so it is laid as it is)
  put('chest', w.chest[0], w.chest[1]);
  for (const a of plan.areas) {
    const b = a.blob;
    if (a.role === 'boss' || a.role === 'start' || a.role === 'lair') continue;
    const isMill = b === mill;
    if (a.role === 'side' && !isMill) {
      const n = rng.int(2, 3);
      for (let k = 0, t = 0; k < n && t < 40; t++) {
        const tx = Math.floor(b.x + rng.range(-2, 2));
        const ty = Math.floor(b.y + rng.range(-1.5, 1.5));
        if (!ok(tx, ty)) continue;
        put('chest', tx, ty);
        k++;
      }
    }
    const n = isMill ? 2 : rng.int(1, 4);
    for (let k = 0, t = 0; k < n && t < 30; t++) {
      const ang = rng.range(0, Math.PI * 2);
      const tx = Math.floor(b.x + Math.cos(ang) * b.rx * rng.range(0.55, 0.85));
      const ty = Math.floor(b.y + Math.sin(ang) * b.ry * rng.range(0.55, 0.85));
      if (!ok(tx, ty)) continue;
      put(isMill ? 'urn' : 'barrel', tx, ty);
      k++;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------
// THE DRESSER

/** ITS PIECES BY NAME (art/floor13.ts, art/act2_set.ts): what the dresser lays. */
export const MR_PIECE = {
  mill: 'the paper mill',
  wheel: 'the water wheel',
  headgate: "the race's headgate",
  lines: 'drying lines',
  vat: 'a vat of pulp',
  stamper: 'the stamping mill',
  press: 'the screw press',
  reams: 'reams bound for the city',
  ink: "barrels of the Order's ink",
  pulp: 'spilled pulp',
  jars: 'emptied jars',
  foot: 'a footbridge over the race',
  cart: 'the cart bridge',
  muffled: 'the mill bell on its gable (the Muffled Bell)',
  bell: 'a farm bell on its post',
  scarecrow: 'a scarecrow, gagged',
  wain: 'a hay wain, abandoned',
  willow: 'a pollard willow',
  hedge: 'a hedge',
  gate: 'a field gate',
  sheets: 'sheets blown into the corn',
  quest: 'the mould and deckle, a page half made',
  millstone: 'a cracked millstone',
  lantern: "the Order's hooded lantern",
  carters: "the carters' cart, the Order's",
  rack: "the Order's rack of jars",
  voices: 'a crate of stolen voices',
  paper: 'bundles of blank paper',
  rubble: 'rubble of the siege',
} as const;

/**
 * DRESS THE MILLRACE with its own pieces, by dice of its own (as game/act1_dress.ts dresses the descent's: what the rules know
 * of a piece is its name and whether it stands in the way; its picture is the art's, render/act1_pieces.ts). It lays:
 *   ITS BRIDGES (floor tiles): the cart bridge where a track crosses the river, footbridges where a path does and over the race.
 *   THE MILL: the paper mill (its four tiles by three in the way); the water wheel turning in the race at its gable end; the
 *     headgate standing open where the race leaves the river; the Muffled Bell on its gable; the stamping mill before it
 *     (its trap); a vat of pulp, reams bound for the city, emptied jars, a cracked millstone, the Order's cart at the track's
 *     end and its hooded lantern, about the yard; the mould and deckle (the quest) by the mill's door.
 *   THE DRYING GREEN beside the yard: its drying lines in rows (each three tiles along x in the way), seen through while
 *     someone is behind them (render/act1_pieces.ts seenOf: the art's own picture of them half there).
 *   THE FARM BELLS where Land.bells has them (kind 'piece', solid, state 0, variant 0; the eight tiles round each kept clear).
 *   THE PULPING FLOOR: the Order's vats, press, reams, ink, jars, carts, rack and lanterns round its edge, spilled pulp about
 *     it; its middle clear.
 *   THE FARMSTEAD: the hay wain, a scarecrow, a willow; THE LAIR, the carters': their carts, a lantern, crates of voices.
 *   THE FIELDS: scarecrows, sheets blown into the corn, the siege's rubble nearest the city, a cart left on the track;
 *     hedges along their edges and out in the rough, willows by the river.
 *   THE SIDE GATE behind where he comes in: a field gate standing open in a hedge.
 *   ITS TRAPS, as the descent's are laid (game/traps.ts, the spike floor's beat): THE WATER WHEEL, its paddles striking the
 *     strip beside it; THE STAMPING MILL, its hammers on what is under them (in the yard, and two more on the main way's last
 *     fields, where the track goes into the works). Their pictures stand, their frames by the beat (render/act1_pieces.ts).
 * Null where the floor is not the Millrace's (the descent's dresser then lays it).
 */
export function dress(L: Level, depth: number, seed: number): Act1Dress | null {
  const land = L.land;
  if (!BUILT || !land || land.kind !== 'millrace' || !land.race) return null;
  const at = millOf(land);
  if (!at) return null;
  const w = millWorks(at);
  const f = L.floor;
  const W = f.w;
  const H = f.h;
  const rng = new RNG((seed ^ 0x2f13a9e5) >>> 0);
  const out: Act1Dress = { floor: 13, tiles: [] };
  const tileAt = new Map<number, Act1Tile>();
  const layTile = (i: number, name: string, frame: number): void => {
    const t = { i, name, frame };
    tileAt.set(i, t);
    out.tiles.push(t);
  };

  // WHAT IS KEPT CLEAR: where he comes in, the waypoint, the way on, every pack's middle, the paths' middles, the bells' rings
  const keep = new Uint8Array(W * H);
  const clearRound = (x: number, y: number, r: number): void => {
    for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) {
      if (tx < 0 || ty < 0 || tx >= W || ty >= H) continue;
      if (Math.hypot(tx + 0.5 - x, ty + 0.5 - y) <= r) keep[ty * W + tx] = 1;
    }
  };
  clearRound(f.start.x, f.start.y, 3.2);
  if (L.ways?.way) clearRound(L.ways.way.x, L.ways.way.y, 2);
  clearRound(land.exit.x, land.exit.y, 3);
  for (const p of f.packs) clearRound(p.x, p.y, 1.5);
  for (const l of land.lanes) for (let k = 0; k < l.pts.length; k++) {
    const [x, y] = l.pts[k];
    clearRound(x, y, Math.max(1.2, l.w / 2 - 0.5));
    if (k + 1 < l.pts.length) {
      const [bx, by] = l.pts[k + 1];
      const steps = Math.ceil(Math.hypot(bx - x, by - y) / 0.7);
      for (let s = 1; s < steps; s++) clearRound(x + ((bx - x) * s) / steps, y + ((by - y) * s) / steps, Math.max(1.2, l.w / 2 - 0.5));
    }
  }
  const bells = land.bells;
  const bellSpots = bells ? [bells.muffled, ...bells.bells] : [];
  for (const b of bellSpots) for (let y = Math.floor(b.y) - 1; y <= Math.floor(b.y) + 1; y++) for (let x = Math.floor(b.x) - 1; x <= Math.floor(b.x) + 1; x++) if (x >= 0 && y >= 0 && x < W && y < H) keep[y * W + x] = 1;
  const bridgeSet = new Set<number>();
  for (const b of land.bridges ?? []) for (const i of b.tiles) bridgeSet.add(i);
  // (a bridge's ends kept clear: the way onto it open)
  for (const b of land.bridges ?? []) for (const i of b.tiles) clearRound((i % W) + 0.5, Math.floor(i / W) + 0.5, 1.6);

  const taken = new Uint8Array(W * H);
  for (const p of L.props) taken[p.ty * W + p.tx] = 1;
  const inFloor = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H;
  const whole = (x: number, y: number): boolean => inFloor(x, y) && f.tiles[y * W + x] === T_FLOOR && !(f.cut && f.cut[y * W + x] !== 0);
  /** A free tile: whole floor, nothing there, not kept clear, not a bridge, walked; `ring`: its eight neighbours whole floor and walked. */
  const free = (x: number, y: number, ring: boolean): boolean => {
    if (!whole(x, y)) return false;
    const i = y * W + x;
    if (keep[i] || taken[i] || bridgeSet.has(i) || L.walk[i] !== 1) return false;
    if (!ring) return true;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      if (!whole(x + dx, y + dy) || L.walk[(y + dy) * W + x + dx] !== 1) return false;
    }
    return true;
  };
  /** A run of `n` free tiles along x (or y) from (x, y), each with its ring. */
  const freeRun = (x: number, y: number, n: number, alongX: boolean): boolean => {
    for (let k = 0; k < n; k++) if (!free(alongX ? x + k : x, alongX ? y : y + k, true)) return false;
    return true;
  };
  const props: PropInst[] = [];
  const put = (name: string, x: number, y: number, solid: boolean, variant = 0, anchor?: { x: number; y: number }): PropInst => {
    const p: PropInst = { kind: 'piece', name, tx: x, ty: y, x: anchor ? anchor.x : x + 0.5, y: anchor ? anchor.y : y + 0.5, solid, state: 0, variant };
    props.push(p);
    if (inFloor(x, y)) {
      taken[y * W + x] = 1;
      if (solid) L.walk[y * W + x] = 0;
    }
    return p;
  };
  /** The tiles a big piece stands over: in the way (if `solid`) and nothing else laid there. */
  const over = (x0: number, y0: number, x1: number, y1: number, solid: boolean): void => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (!inFloor(x, y)) continue;
      taken[y * W + x] = 1;
      if (solid) L.walk[y * W + x] = 0;
    }
  };
  const room = (x0: number, y0: number, x1: number, y1: number): void => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inFloor(x, y)) keep[y * W + x] = 1;
  };
  const tilesOf = (blob: Blob, inside: (x: number, y: number) => boolean): P[] => {
    const list: P[] = [];
    const R = Math.ceil(Math.max(blob.rx, blob.ry) * (1 + blob.wob)) + 1;
    for (let ty = Math.floor(blob.y - R); ty <= Math.floor(blob.y + R); ty++) for (let tx = Math.floor(blob.x - R); tx <= Math.floor(blob.x + R); tx++) if (inside(tx + 0.5, ty + 0.5)) list.push([tx, ty]);
    return rng.shuffle(list);
  };
  const hazards: HazardSpot[] = [];
  const trackD = (x: number, y: number): number => (land.tracks ?? []).reduce((d, t) => Math.min(d, laneDist({ pts: t, w: 0 }, x, y)), Infinity);

  // ---- THE BRIDGES: over the race, footbridges; over the river, the cart bridge where a track crosses it, else footbridges
  for (const b of land.bridges ?? []) {
    const overRace = b.tiles.some((i) => segNear(w.race, (i % W) + 0.5, Math.floor(i / W) + 0.5, 0.45));
    const mid = b.tiles[Math.floor(b.tiles.length / 2)];
    const cartWay = !overRace && trackD((mid % W) + 0.5, Math.floor(mid / W) + 0.5) < 2.5;
    for (const i of b.tiles) {
      if (f.tiles[i] !== T_FLOOR) continue;
      layTile(i, cartWay ? MR_PIECE.cart : MR_PIECE.foot, b.alongX ? 0 : 1);
      taken[i] = 1;
    }
  }

  // ---- THE MILL
  const millBlob = land.areas.find((a) => a.role === 'side' && blobDist(a.blob, w.mill.x, w.mill.y) < 1)?.blob ?? null;
  {
    const m = w.mill;
    put(MR_PIECE.mill, m.x0 + 2, m.y0 + 1, true, 0, { x: m.x, y: m.y });
    over(m.x0, m.y0, m.x1, m.y1, true);
    room(m.x0 - 1, m.y0 - 1, m.x1 + 1, m.y1 + 1);
    // the water wheel in the race at its gable end (its frames looking along +x: 4 to 7; turning the race's way: render/act1_pieces.ts)
    put(MR_PIECE.wheel, w.wheel.tx, w.wheel.ty, true, 4 + (at.s < 0 ? 8 : 0));
    hazards.push({ kind: 'spikes', x: w.beside.x, y: w.beside.y, w: w.beside.w, h: w.beside.h, phase: rng.range(0, 2.5) });
    for (let y = w.beside.y; y < w.beside.y + w.beside.h; y++) if (inFloor(w.beside.x, y)) taken[y * W + w.beside.x] = 1;
    // the headgate standing open where the race leaves the river (across the race along x: its frames 2 and 3, open 3)
    put(MR_PIECE.headgate, w.gate[0], w.gate[1], true, 3);
    // the Muffled Bell on its gable
    if (bells) put(MR_PIECE.muffled, Math.floor(bells.muffled.x), Math.floor(bells.muffled.y), true, 0, { x: bells.muffled.x, y: bells.muffled.y });
    // the mould and deckle, a page half made, by the mill's door (its front toward +y)
    // (else the yard's nearest free tile to the door)
    const door: P = [m.x0 + 1, m.y1 + 2];
    const near: P[] = [];
    for (let y = w.yard[1]; y < w.yard[3]; y++) for (let x = w.yard[0]; x < w.yard[2]; x++) near.push([x, y]);
    near.sort((p, q) => Math.hypot(p[0] - door[0], p[1] - door[1]) - Math.hypot(q[0] - door[0], q[1] - door[1]));
    for (const [x, y] of [[m.x0, m.y1 + 2], [m.x0 + 1, m.y1 + 2], [m.x0 - 1, m.y1 + 2], [m.x0, m.y1 + 3], ...near] as P[]) {
      if (free(x, y, false)) {
        put(MR_PIECE.quest, x, y, true);
        break;
      }
    }
    // the stamping mill, turned from the wheel's shaft: before the mill toward its wheel end (two tiles along x: its hammers' trough)
    let stamped = false;
    for (const [x, y] of [[m.x1 - 1, m.y1 + 3], [m.x1 - 2, m.y1 + 3], [m.x1 - 1, m.y0 - 3], [m.x1 - 2, m.y0 - 3], [m.x0, m.y1 + 4], [m.x0, m.y0 - 4]] as P[]) {
      if (stamped || !freeRun(x, y, 2, true)) continue;
      put(MR_PIECE.stamper, x, y, false, 0, { x: x + 1, y: y + 0.5 });
      over(x, y, x + 1, y, false);
      hazards.push({ kind: 'spikes', x, y, w: 2, h: 1, phase: rng.range(0, 2.5) });
      room(x - 1, y - 1, x + 2, y + 1);
      stamped = true;
    }
    // about the yard: a vat, reams, emptied jars, a millstone, the rag bales (the game's urns), the Order's cart and its lantern
    const [yx0, yy0, yx1, yy1] = w.yard;
    const inYard = (x: number, y: number): boolean => x >= yx0 && y >= yy0 && x < yx1 && y < yy1;
    const yardTiles: P[] = [];
    for (let y = yy0; y < yy1; y++) for (let x = yx0; x < yx1; x++) yardTiles.push([x, y]);
    rng.shuffle(yardTiles);
    const yardThings = [MR_PIECE.vat, MR_PIECE.reams, MR_PIECE.jars, MR_PIECE.millstone, MR_PIECE.lantern, MR_PIECE.ink];
    let laid = 0;
    for (const [x, y] of yardTiles) {
      if (laid >= yardThings.length) break;
      if (!free(x, y, true)) continue;
      put(yardThings[laid], x, y, true, lookOf(rng, yardThings[laid]));
      room(x - 1, y - 1, x + 1, y + 1);
      laid++;
    }
    for (const [x, y] of yardTiles) {
      if (!free(x, y, false)) continue;
      put(MR_PIECE.pulp, x, y, false);
      break;
    }
    // (the branch track's end, in the yard: the cart the jars came in)
    const branch = land.tracks?.[1];
    if (branch) {
      const [ex, ey] = branch[branch.length - 1];
      for (let r = 1; r <= 3; r++) {
        let done = false;
        for (let dy = -r; dy <= r && !done; dy++) for (let dx = -r; dx <= r && !done; dx++) {
          const x = Math.floor(ex) + dx;
          const y = Math.floor(ey) + dy;
          if (!inYard(x, y) || !free(x, y, true)) continue;
          put(MR_PIECE.carters, x, y, true, lookOf(rng, MR_PIECE.carters));
          room(x - 1, y - 1, x + 1, y + 1);
          done = true;
        }
        if (done) break;
      }
    }
    // ---- THE DRYING GREEN round the yard: rows of drying lines (three tiles along x each, in the way), a row in three
    if (millBlob) {
      const lines: P[] = [];
      const green = (x: number, y: number): boolean => blobDist(millBlob, x + 0.5, y + 0.5) < 0.88 && !inYard(x, y) && !inYard(x - 1, y) && !inYard(x + 1, y) && !inYard(x, y - 1) && !inYard(x, y + 1);
      const R = Math.ceil(millBlob.rx);
      for (let gy = Math.floor(millBlob.y) - 7; gy <= Math.floor(millBlob.y) + 7; gy += 3) {
        for (let gx = Math.floor(millBlob.x) - R; gx <= Math.floor(millBlob.x) + R - 2; gx++) {
          if (lines.length >= 6) break;
          if (!green(gx, gy) || !green(gx + 1, gy) || !green(gx + 2, gy) || !freeRun(gx, gy, 3, true)) continue;
          put(MR_PIECE.lines, gx + 1, gy, true, 0);
          over(gx, gy, gx + 2, gy, true);
          room(gx - 1, gy, gx + 3, gy);
          lines.push([gx, gy]);
        }
      }
      // (the wind has had a few of their sheets off into the corn)
      let blown = 0;
      for (const [x, y] of tilesOf(millBlob, (x, y) => blobDist(millBlob, x, y) < 0.9)) {
        if (blown >= 3) break;
        if (inYard(x, y) || !free(x, y, false)) continue;
        put(MR_PIECE.sheets, x, y, false, 0);
        blown++;
      }
    }
  }

  // ---- THE FARM BELLS
  if (bells) for (const b of bells.bells) put(MR_PIECE.bell, Math.floor(b.x), Math.floor(b.y), true, 0, { x: b.x, y: b.y });

  // ---- THE AREAS
  const bossArea = land.areas.find((a) => a.role === 'boss') ?? null;
  const paths = land.areas.filter((a) => a.role === 'path');
  const farthest = paths.map((a) => Math.hypot(a.blob.x - f.start.x, a.blob.y - f.start.y));
  const lastTwo = paths.map((a, i) => ({ a, d: farthest[i] })).sort((p, q) => q.d - p.d).slice(0, 2).map((q) => q.a);
  let wain = 0;
  for (const a of rng.shuffle([...land.areas])) {
    const b = a.blob;
    if (a.role === 'start' || b === millBlob) continue;
    if (a === bossArea) {
      // THE PULPING FLOOR: the Order's works round its edge, its middle clear for the giant
      const ring = tilesOf(b, (x, y) => {
        const d = blobDist(b, x, y);
        return d > 0.62 && d < 0.88;
      });
      const works = [MR_PIECE.vat, MR_PIECE.vat, MR_PIECE.vat, MR_PIECE.press, MR_PIECE.reams, MR_PIECE.reams, MR_PIECE.ink, MR_PIECE.ink, MR_PIECE.jars, MR_PIECE.jars, MR_PIECE.rack, MR_PIECE.voices, MR_PIECE.paper, MR_PIECE.carters, MR_PIECE.lantern, MR_PIECE.lantern, MR_PIECE.lantern];
      let k = 0;
      for (const [x, y] of ring) {
        if (k >= works.length) break;
        if (!free(x, y, true)) continue;
        const name = works[k];
        put(name, x, y, true, lookOf(rng, name));
        room(x - 1, y - 1, x + 1, y + 1);
        k++;
      }
      let spills = 0;
      for (const [x, y] of tilesOf(b, (x, y) => blobDist(b, x, y) < 0.8)) {
        if (spills >= 5) break;
        if (!free(x, y, false)) continue;
        put(MR_PIECE.pulp, x, y, false);
        room(x - 1, y - 1, x + 1, y + 1);
        spills++;
      }
      continue;
    }
    if (a.role === 'lair') {
      // THE CARTERS' LAIR: their carts drawn up, a lantern, crates of the voices they carry
      const things = [MR_PIECE.carters, MR_PIECE.carters, MR_PIECE.lantern, MR_PIECE.voices, MR_PIECE.voices];
      let k = 0;
      for (const [x, y] of tilesOf(b, (x, y) => { const d = blobDist(b, x, y); return d > 0.45 && d < 0.85; })) {
        if (k >= things.length) break;
        if (!free(x, y, true)) continue;
        put(things[k], x, y, true, lookOf(rng, things[k]));
        room(x - 1, y - 1, x + 1, y + 1);
        k++;
      }
      continue;
    }
    // A FIELD (or THE FARMSTEAD): toward its edges (his rule for the descent's, 17 Oct: "a little thinner in density and spread towards the edges")
    const farm = a.role === 'side';
    const band = tilesOf(b, (x, y) => { const d = blobDist(b, x, y); return d > 0.5 && d < 0.86; });
    if (farm || (wain === 0 && band.length > 60)) {
      for (const [x, y] of band) {
        if (!freeRun(x - 1, y, 3, true)) continue;
        put(MR_PIECE.wain, x, y, true);
        over(x - 1, y, x + 1, y, true);
        room(x - 2, y - 1, x + 2, y + 1);
        wain++;
        break;
      }
    }
    const nearCity = Math.hypot(b.x - f.start.x, b.y - f.start.y) < 40;
    const things: string[] = [MR_PIECE.scarecrow, ...(farm ? [MR_PIECE.willow, MR_PIECE.scarecrow] : nearCity ? [MR_PIECE.rubble] : []), ...(rng.chance(0.5) ? [MR_PIECE.scarecrow] : [])];
    let k = 0;
    for (const [x, y] of band) {
      if (k >= things.length) break;
      if (!free(x, y, true)) continue;
      put(things[k], x, y, true, 0);
      room(x - 1, y - 1, x + 1, y + 1);
      k++;
    }
    let lying = 0;
    const lie = Math.round(band.length / 60);
    for (const [x, y] of band) {
      if (lying >= lie) break;
      if (!free(x, y, false)) continue;
      put(MR_PIECE.sheets, x, y, false, 0);
      lying++;
    }
    // (where the works begin, along the track into them: a stamping mill or two, the trap)
    if (lastTwo.includes(a)) {
      for (const [x, y] of band.concat(tilesOf(b, (x, y) => blobDist(b, x, y) < 0.5))) {
        if (trackD(x + 1, y + 0.5) > 2.5 || trackD(x + 1, y + 0.5) < 1.2 || !freeRun(x, y, 2, true)) continue;
        if (hazards.some((h) => Math.hypot(h.x - x, h.y - y) < 6)) continue;
        // (never in the boss's ground, where a field runs into it)
        if (bossArea && (blobDist(bossArea.blob, x + 0.5, y + 0.5) < 1.2 || blobDist(bossArea.blob, x + 1.5, y + 0.5) < 1.2)) continue;
        put(MR_PIECE.stamper, x, y, false, 0, { x: x + 1, y: y + 0.5 });
        over(x, y, x + 1, y, false);
        hazards.push({ kind: 'spikes', x, y, w: 2, h: 1, phase: rng.range(0, 2.5) });
        room(x - 1, y - 1, x + 2, y + 1);
        break;
      }
    }
  }
  // (a cart of the Order's left standing on the track, half way along)
  const main = land.tracks?.[0];
  if (main) {
    const mid = main[Math.floor(main.length * rng.range(0.25, 0.4))];
    for (let r = 0; r <= 3; r++) {
      let done = false;
      for (let dy = -r; dy <= r && !done; dy++) for (let dx = -r; dx <= r && !done; dx++) {
        const x = Math.floor(mid[0]) + dx;
        const y = Math.floor(mid[1]) + dy;
        if (!free(x, y, true)) continue;
        put(MR_PIECE.carters, x, y, true, lookOf(rng, MR_PIECE.carters));
        room(x - 1, y - 1, x + 1, y + 1);
        done = true;
      }
      if (done) break;
    }
  }

  // ---- BY THE RIVER: pollard willows on its banks
  const riverPts = land.river ?? [];
  if (riverPts.length) {
    const bank: P[] = [];
    for (let ty = 1; ty < H - 1; ty++) for (let tx = 1; tx < W - 1; tx++) {
      const d = laneDist({ pts: riverPts, w: 0 }, tx + 0.5, ty + 0.5);
      if (d < 1.1 || d > 2.1 || !free(tx, ty, true)) continue;
      bank.push([tx, ty]);
    }
    rng.shuffle(bank);
    const used: P[] = [];
    for (const [tx, ty] of bank) {
      if (used.length >= Math.ceil(bank.length / 14)) break;
      if (used.some(([x, y]) => Math.hypot(x - tx, y - ty) < 6)) continue;
      put(MR_PIECE.willow, tx, ty, true, 0);
      room(tx - 1, ty - 1, tx + 1, ty + 1);
      used.push([tx, ty]);
    }
  }

  // ---- AT THE FIELDS' EDGES AND OUT IN THE ROUGH: hedges (along x or y as the edge runs), now and then a willow
  {
    const edge: { x: number; y: number; k: number }[] = [];
    for (let ty = 2; ty < H - 2; ty++) for (let tx = 2; tx < W - 2; tx++) {
      if (!free(tx, ty, false)) continue;
      // (the edge runs along x where the rough is beyond it toward lesser or greater y)
      const ry = !whole(tx, ty - 1) && !whole(tx - 1, ty - 1) && !whole(tx + 1, ty - 1);
      const rx = !whole(tx - 1, ty) && !whole(tx - 1, ty - 1) && !whole(tx - 1, ty + 1);
      if (!ry && !rx) continue;
      if (riverPts.length && laneDist({ pts: riverPts, w: 0 }, tx + 0.5, ty + 0.5) < 3) continue;
      if (segNear(w.race, tx + 0.5, ty + 0.5, 2)) continue;
      if (bossArea && blobDist(bossArea.blob, tx + 0.5, ty + 0.5) < 1.1) continue;
      edge.push({ x: tx, y: ty, k: ry ? 0 : 1 });
    }
    rng.shuffle(edge);
    const used: P[] = [];
    for (const e of edge) {
      if (used.length >= Math.ceil(edge.length / 16)) break;
      if (used.some(([x, y]) => Math.hypot(x - e.x, y - e.y) < 7)) continue;
      const alongX = e.k === 0;
      const ax = alongX ? e.x - 1 : e.x;
      const ay = alongX ? e.y : e.y - 1;
      let ok = true;
      for (let s = 0; s < 3 && ok; s++) ok = free(alongX ? ax + s : ax, alongX ? ay : ay + s, false);
      if (!ok) continue;
      put(MR_PIECE.hedge, e.x, e.y, true, e.k);
      over(ax, ay, alongX ? ax + 2 : ax, alongX ? ay : ay + 2, true);
      used.push([e.x, e.y]);
    }
    // (out in the rough, off the floor, a hedge or a willow here and there: past the fields the ground goes on, wild)
    const rough: P[] = [];
    for (let ty = 2; ty < H - 2; ty += 3) for (let tx = 2; tx < W - 2; tx += 3) {
      const x = tx + rng.int(0, 2);
      const y = ty + rng.int(0, 2);
      if (whole(x, y) || f.tiles[y * W + x] === T_FLOOR) continue;
      let near = false;
      let tooNear = false;
      for (let dy = -4; dy <= 4 && !tooNear; dy++) for (let dx = -4; dx <= 4; dx++) {
        if (!inFloor(x + dx, y + dy) || f.tiles[(y + dy) * W + x + dx] !== T_FLOOR) continue;
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        if (d <= 1) tooNear = true;
        else near = true;
      }
      if (!near || tooNear) continue;
      if (riverPts.length && laneDist({ pts: riverPts, w: 0 }, x + 0.5, y + 0.5) < 2) continue;
      if (segNear(w.race, x + 0.5, y + 0.5, 1.5)) continue;
      rough.push([x, y]);
    }
    rng.shuffle(rough);
    const usedR: P[] = [];
    for (const [x, y] of rough) {
      if (usedR.length >= Math.ceil(rough.length / 5)) break;
      if (usedR.some(([a, b]) => Math.hypot(a - x, b - y) < 5)) continue;
      const roll = rng.next();
      put(roll < 0.6 ? MR_PIECE.hedge : MR_PIECE.willow, x, y, true, roll < 0.6 ? rng.int(0, 1) : 0);
      usedR.push([x, y]);
    }
  }

  // ---- THE SIDE GATE: behind where he comes in, a field gate standing open in a hedge
  if (land.way.length >= 2) {
    const [ax, ay] = land.way[0];
    const [bx, by] = land.way[1];
    const l = Math.hypot(bx - ax, by - ay) || 1;
    const back: P = [-(bx - ax) / l, -(by - ay) / l];
    // (across y, its hedges along y, where the way back is more along x; across x where it is more along y)
    const acrossY = Math.abs(back[0]) > Math.abs(back[1]);
    for (const d of [5.5, 4.5, 6.5]) {
      const gx = Math.floor(f.start.x + back[0] * d);
      const gy = Math.floor(f.start.y + back[1] * d);
      if (!whole(gx, gy) || keep[gy * W + gx] || taken[gy * W + gx]) continue;
      // the gate's frames: shut and open across x (0, 1), across y (2, 3)
      put(MR_PIECE.gate, gx, gy, false, acrossY ? 3 : 1);
      for (const s of [-2, 2]) {
        const hx = acrossY ? gx : gx + s;
        const hy = acrossY ? gy + s : gy;
        if (whole(hx, hy) && !keep[hy * W + hx] && !taken[hy * W + hx]) {
          put(MR_PIECE.hedge, hx, hy, true, acrossY ? 1 : 0);
        }
      }
      break;
    }
  }

  // THE GAME'S OWN THINGS AS THE FLOOR'S, and its traps
  L.props.push(...props);
  if (hazards.length) {
    f.hazards = [...(f.hazards ?? []), ...hazards];
    L.hazards = makeHazards(f);
  }
  void depth;
  void tileAt;
  return out;
}

/**
 * Which of a piece's frames it is laid with: the Order's carts either way about (their shafts toward +y or +x) and with
 * either of their two pictures; its lanterns, its rack and its crates of voices either of theirs; every other its first
 * (what the art drew broken, its second, is not shown: a piece laid here stands whole, the game breaking only its barrels
 * and urns).
 */
function lookOf(rng: RNG, name: string): number {
  if (name === MR_PIECE.carters) return rng.int(0, 3);
  if (name === MR_PIECE.lantern || name === MR_PIECE.rack || name === MR_PIECE.voices) return rng.int(0, 1);
  return 0;
}

/** Is world (x, y) within `r` of the line? */
function segNear(pts: readonly P[], x: number, y: number, r: number): boolean {
  for (let i = 0; i + 1 < pts.length; i++) if (segDist(x, y, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]) < r) return true;
  return false;
}

