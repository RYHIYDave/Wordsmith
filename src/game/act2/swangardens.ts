// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16, THE SWAN GARDENS: ITS MAP-MAKER AND ITS DRESSER (game/act2_layout.ts asks it for the
// floor, game/act2_dress.ts for its pieces). Its nettle beds' rules, its nettles stirring and her vine drawing back into the
// yew, are game/act2/garden_rules.ts.
//
// HIS DOC ("Wordsmith Act 2, Part Two: The High City (Levels 16–20)"), level 16: "Through the shut gates and up the hill through
// the palace's terraced gardens." Its layout "open, like the Millrace: terraces stepping up the hill joined by stairs, clipped
// hedges and a hedge maze, rose arbours, still fountains, and a long lake with a pavilion on an island"; its hazards "nettle
// beds that sting and slow whoever walks through them; the lake's deep water"; its enemies "the Hushed gardeners and grooms,
// the palace guard, and the swans"; its boss "The Princess. Her floor is the Swan Pavilion."; its palette "Dawn rose, swan
// white, deep hedge green". His word to the main chat, 29 Oct 2026, 18:09: “Levels are ready to add”, and his pick, the floors
// built “One floor at a time”. The art is the art chat's, every part with his yes (docs/mockups/swan_gardens/README.md): its
// ground art/swangardens.ts (painted from what is laid here: Land.lake and Land.garden, render/outdoor.ts landLook), its 25
// pieces and her vines art/floor16.ts, the High City's 25 art/high_city_set.ts; the art chat's own corner of the gardens laid
// by hand, src/dev/swan_level.ts and swan_lay.ts, the likeness this is laid to.
//
// HOW IT IS LAID (the main chat's; the terraces as the art's README builds them: "a terrace's wall is a row of tiles that are
// floor, `a terrace wall` on each, its face on the tile's near edge filling the row ... The stair is built true"):
//   THE TERRACES, five, stepping up the hill toward -y (up the screen to the right: the art's climb), each a broad lawn along x
//     between clipped yew (the floor's walls, HEDGE_H high), a terrace wall's row between each two with its stair; the main way
//     the length of each and up its stair at the far end, so back and forth up the hill (open, and as long as the Millrace):
//     THE FORECOURT, where he comes in through the shut gates (the art's `a garden gate`, shut behind him: game/ways.ts START,
//       art/films.ts): the drive up from them; what the court left out on the hill (the High City's: sentry boxes by the
//       gate, the state coach abandoned, the fountain of the four royals, a king's statue, gilt lamps, railings, the heralds'
//       trumpets); off it, THE TREASURE GARDEN, its chests;
//     THE PARTERRE: the still fountain in its middle, four beds of roses edged in box about it, one gone over to nettles; off it,
//       THE GARDENERS' CORNER, where the Hushed gardeners are, her vines grown through it and the parterre's end (his ask, 28
//       Oct, 23:22: “Can you put some of these vines into the map as well?  Around where the hushed gardeners are at.  So
//       you’re like “huh those vines are weird” then the boss has the big vine”);
//     THE HEDGE MAZE: its terrace all maze between two lawns, gone into and out of by open gates, chests in its dead ends;
//     THE ROSE TERRACE: the second still fountain, rose arbours over its walk, beds of roses and beds of nettles, the court's
//       garden party left out on its lawn; off it, THE LAIR, the palace guard's court (game/act2_mobs.ts ACT2_GUARD[16]);
//     THE LAKE at the top of the hill: the long lake across it (deep water, not walked: the ground's drop, art/swangardens.ts),
//       the Swan Pavilion on its island; the lake walk along it to THE BOSS'S GROUND, the Princess's, the open lawn by the
//       water before the pavilion (SG_PLAN.arena: her moves are arena-sized, the art's README); beyond the lake's end the
//       gate on up the hill (game/ways.ts ONWARD[16]), shut until she falls.
//
// WHAT COMES OUT: a Floor as the rest of the game knows one (its tiles, rooms, packs, props, where the hero starts and the boss
// waits) and its Land, by the floor's own dice: the same depth and seed give the same floor, here and in the painter's worker.

import { RNG } from '../../engine/rng';
import { act1Pack } from '../act1_mobs';
import { act2Ready } from '../act2_mobs';
import { MARGIN, blobDist } from '../act1_layout';
import type { AreaRole, Blob, Laid, Land } from '../act1_layout';
import type { Act1Dress } from '../act1_dress';
import type { GardenPlan, Rect } from '../act2_types';
import { PACK_BY_SIZE, sizeOf } from '../defs';
import type { Level, PropInst } from '../state';
import { T_FLOOR, T_WALL } from '../types';
import type { Floor, MonsterKind, PackSpot, PropSpot, Room, RoomKind } from '../types';

/** Whether this floor's own map-maker is built (until it is, the descent's stands in: game/act2_layout.ts). */
export const BUILT = true;

type P = [number, number];

// ---------------------------------------------------------------------------------------------------
// THE SIZES (tiles; the main chat's, where the art leaves them to the game)

/**
 * THE GARDENS' SIZES. The terraces about as long as the Millrace's fields are wide, two or three of them long (`width`, the top
 * one, the lake's, `top`), a few tiles off each other (`shift`); their depths up the hill (`depth`). THE MAZE: its cells across
 * (`nx`) and deep (`ny`), a corridor three tiles wide and a hedge one (`pitch` 4: the art's corner has them two wide; three
 * holds a fight), a lawn at each end (`lawn`: the stairs are there). THE LAKE: its rows of water (`deep`), the lawn on its far
 * bank (`bank`), its lawn at the near end (`west`) and the walk beyond its far end up to the gate (`east`); the pavilion's
 * middle so far into it from its far side (`island`: its island 2.6 round, the art's, and the lake two tiles past it toward
 * the eye for its likeness in the water). THE BOSS'S GROUND: about 20 by 17 tiles, its long way along the lake (the art's
 * README: her lash a quarter turn 7.5 tiles long, eleven swans the arena's length on lines 1.5 tiles apart, her steed's fifteen
 * leaps of 4.5 tiles round it), so that the pavilion is seen from it across the water; the lake terrace's rows under the lake
 * (`below`); its middle so far in from the lake terrace's far end (`from`). A side garden's floor
 * (`sides`, across and deep). One pack to so many tiles walked (`packEvery`: the Millrace's density).
 */
export const SG_PLAN = {
  width: [44, 52] as const,
  top: [58, 64] as const,
  shift: 3,
  depth: { forecourt: [15, 18] as const, parterre: [17, 20] as const, roses: [16, 19] as const },
  maze: { nx: [7, 8] as const, ny: 4, pitch: 4, lawnIn: [11, 12] as const, lawnOut: [10, 11] as const },
  lake: { deep: 10, bank: 2, island: 3.5, west: 3, east: 5 },
  arena: { rx: 10, ry: 8.5, wob: 0.03, below: 18, from: 12 },
  /** How far in from a terrace's end its stair stands (the stair's column). */
  stair: { up: 6, down: 4 },
  sides: { gardeners: [12, 10] as const, lair: [10, 9] as const, treasure: [10, 8] as const },
  packEvery: 90,
  /** The parterre's beds: each so many tiles across and deep. */
  bed: { w: 5, h: 3 },
};

/** ITS PIECES BY NAME (art/floor16.ts, art/high_city_set.ts): what the dresser lays. */
export const SG_PIECE = {
  wall: 'a terrace wall',
  pier: "a stair's pier",
  stair: 'the terrace stair',
  cone: 'a yew cone',
  box: 'box edging',
  rose: 'a rose bush',
  bay: 'a bay tree in its tub',
  topiary: 'a topiary swan',
  fountain: 'the still fountain',
  stoneSwan: 'a stone swan on its plinth',
  sundial: 'a sundial',
  bench: 'a stone bench',
  urn: 'an urn of roses',
  arbour: 'a rose arbour',
  pavilion: 'the Swan Pavilion on its island',
  nettles: 'nettles',
  trodden: 'trodden nettles, for their flax',
  shirt: 'a nettle shirt, half woven',
  gate: 'a garden gate',
  lantern: 'a lantern on a post',
  boat: 'a boat at the landing',
  nest: "a swan's nest",
  barrow: "a gardener's barrow",
  clippings: 'clippings and shears',
  feathers: 'swan feathers',
  // her vines in the gardens (art/floor16.ts herVinesPieces)
  wallVine: 'a terrace wall, her vine over it',
  boxVine: 'box edging, her vine through it',
  lanternVine: 'a lantern on a post, her vine up it',
  walkVine: 'her vine across the walk',
  coneVine: 'a yew cone, her vine reaching out of it',
  // the High City's (art/high_city_set.ts)
  lamp: 'a gilt lamp post',
  railings: 'palace railings',
  sentry: 'a sentry box',
  statue: 'a marble statue of a royal',
  royals: 'the fountain of the four royals',
  coach: 'a royal coach, abandoned',
  rope: 'a velvet rope barrier',
  chair: 'a gilt chair',
  table: 'a royal card table',
  tea: 'a silver tea service, left out',
  vase: 'a grand vase',
  hats: 'a hat stand, cloaks left on it',
  trumpets: "the heralds' trumpets, stopped",
  candles: 'a standing candelabrum',
  cage: "a songbird's cage, silent",
  carpet: 'a royal carpet',
  invitations: 'a heap of invitations',
  fan: 'a dropped fan and a rose',
} as const;

// ---------------------------------------------------------------------------------------------------
// LAY THE FLOOR

/** Lay floor 16, or null (not laid this time: the dice are rolled again, game/act2_layout.ts). */
export function generate(depth: number, seed: number): Laid | null {
  const rng = new RNG((seed ^ 0x16a5e9d1) >>> 0);
  const S = SG_PLAN;
  const ri = (r: readonly [number, number]): number => rng.int(r[0], r[1]);

  // THE TERRACES' SIZES: 0 the forecourt, 1 the parterre, 2 the maze, 3 the roses, 4 the lake
  const nx = ri(S.maze.nx);
  const ny = S.maze.ny;
  const pitch = S.maze.pitch;
  const lawnIn = ri(S.maze.lawnIn);
  const lawnOut = ri(S.maze.lawnOut);
  const w = [ri(S.width), ri(S.width), lawnIn + nx * pitch + 1 + lawnOut, ri(S.width), ri(S.top)];
  const d = [ri(S.depth.forecourt), ri(S.depth.parterre), ny * pitch - 1, ri(S.depth.roses), S.lake.bank + S.lake.deep + S.arena.below];
  // (along x: the maze's terrace about the middle; the parterre's way up to it at their near ends, the rose terrace's at their
  // far ends, so each pair shares the end its stair is at, and the maze's lawns hold the stairs)
  const xa: number[] = new Array(5);
  const xb: number[] = new Array(5);
  xa[2] = -Math.floor(w[2] / 2);
  xb[2] = xa[2] + w[2];
  xa[1] = xa[2] + rng.int(0, S.shift);
  xb[1] = xa[1] + w[1];
  xb[3] = xb[2] + rng.int(0, S.shift);
  xa[3] = xb[3] - w[3];
  xa[0] = xa[1] + rng.int(-S.shift, S.shift);
  xb[0] = xa[0] + w[0];
  xa[4] = xa[3] + rng.int(-S.shift, 1);
  xb[4] = xa[4] + w[4];
  // (along y, from the top of the hill down: the lake's terrace from row 1, under the hedge with the gate on in it; a wall's
  // row between each two)
  const ya: number[] = new Array(5);
  const yb: number[] = new Array(5);
  let y = 1;
  for (let k = 4; k >= 0; k--) {
    ya[k] = y;
    yb[k] = y + d[k];
    y = yb[k] + 1;
  }
  // THE WALLS' ROWS AND THEIR STAIRS: between T(k) and T(k + 1), row yb[k + 1]; the stair at the far end of T(k) (+x for the
  // forecourt and the maze, -x for the parterre and the roses)
  const walls: GardenPlan['walls'] = [];
  for (let k = 0; k < 4; k++) {
    const x0 = Math.max(xa[k], xa[k + 1]);
    const x1 = Math.min(xb[k], xb[k + 1]);
    const tx = k % 2 === 0 ? x1 - S.stair.up : x0 + S.stair.down;
    if (tx - 2 < x0 || tx + 2 >= x1 || x1 - x0 < 16) return null;
    walls.push({ y: yb[k + 1], x0, x1, tx });
  }
  // THE MAZE: its hedge's corner and far column; its way in at the middle of its last row's cell on its near side, out at the
  // middle of its first row's on its far side (toward the stairs: in from the parterre's, out to the roses')
  const mx0 = xa[2] + lawnIn;
  const mx1 = mx0 + nx * pitch;
  const my0 = ya[2] - 1;
  if (walls[1].tx + 3 > mx0 || walls[2].tx - 3 < mx1) return null;
  // THE LAKE'S TERRACE: the lake, the pavilion, the boss's ground, the gate on
  const Ly0 = ya[4] + S.lake.bank;
  const Ly1 = Ly0 + S.lake.deep;
  const arena = { x: xb[4] - S.arena.from + 0.5, y: Ly1 + S.arena.ry + 0.5 };
  const lake: Rect = [xa[4] + S.lake.west, Ly0, xb[4] - S.lake.east, Ly1];
  const pavilion = { x: arena.x - 2, y: Ly0 + S.lake.island };
  const gateOn = { x: xb[4] - 3, y: ya[4] - 1 };
  if (walls[3].tx + 3 > arena.x - S.arena.rx - 2) return null;
  // THE FORECOURT: the drive from the gate he came in by, in its near end's hedge, along its middle
  const gy = ya[0] + Math.floor(d[0] / 2);
  const gateIn = { x: xa[0] - 1, y: gy };
  // THE SIDE GARDENS, each off a terrace's far end (+x), within its rows, a gap of three tiles in the hedge between
  const side = (k: number, size: readonly [number, number]): { r: Rect; gap: P } => {
    const [sw, sh] = size;
    const ry0 = ya[k] + rng.int(1, Math.max(1, d[k] - sh - 1));
    const r: Rect = [xb[k] + 1, ry0, xb[k] + 1 + sw, ry0 + sh];
    return { r, gap: [xb[k], ry0 + Math.floor(sh / 2) - 1] };
  };
  const treasure = side(0, S.sides.treasure);
  const gardeners = side(1, S.sides.gardeners);
  const lair = side(3, S.sides.lair);

  // THE BOUNDS: everything moved so the floor starts MARGIN tiles in
  let minX = gateIn.x;
  let maxX = Math.max(treasure.r[2], gardeners.r[2], lair.r[2]);
  for (let k = 0; k < 5; k++) {
    minX = Math.min(minX, xa[k]);
    maxX = Math.max(maxX, xb[k]);
  }
  const dx = MARGIN - minX;
  const dy = MARGIN - (gateOn.y);
  const W = maxX - minX + 2 * MARGIN;
  const H = yb[0] - gateOn.y + 2 * MARGIN;
  const X = (x: number): number => x + dx;
  const Y = (v: number): number => v + dy;
  const R = (r: Rect): Rect => [X(r[0]), Y(r[1]), X(r[2]), Y(r[3])];
  const tr: Rect[] = [0, 1, 2, 3, 4].map((k) => R([xa[k], ya[k], xb[k], yb[k]]));
  const wallRows = walls.map((q) => ({ y: Y(q.y), x0: X(q.x0), x1: X(q.x1), tx: X(q.tx) }));
  const lakeR = R(lake);
  const A = { x: X(arena.x), y: Y(arena.y) };
  const Pv = { x: X(pavilion.x), y: Y(pavilion.y) };
  const gOn = { x: X(gateOn.x), y: Y(gateOn.y) };
  const gIn = { x: X(gateIn.x), y: Y(gateIn.y) };
  const maze = { x0: X(mx0), x1: X(mx1), y0: Y(my0) };
  const sides = [
    { ...treasure, role: 'treasure' as const, host: 0 },
    { ...gardeners, role: 'gardeners' as const, host: 1 },
    { ...lair, role: 'lair' as const, host: 3 },
  ].map((s) => ({ r: R(s.r), gap: [X(s.gap[0]), Y(s.gap[1])] as P, role: s.role, host: s.host }));

  // THE TILES: every terrace's floor (the lake's less the lake), its walls' rows, the side gardens and their gaps, the gates'
  // gateways; the maze's hedges taken out of its terrace again
  const tiles = new Uint8Array(W * H).fill(T_WALL);
  const lakeT = new Uint8Array(W * H);
  const fill = (r: Rect): void => {
    for (let ty = r[1]; ty < r[3]; ty++) for (let tx = r[0]; tx < r[2]; tx++) tiles[ty * W + tx] = T_FLOOR;
  };
  for (const r of tr) fill(r);
  for (const q of wallRows) fill([q.x0, q.y, q.x1, q.y + 1]);
  for (const s of sides) {
    fill(s.r);
    fill([s.gap[0], s.gap[1], s.gap[0] + 1, s.gap[1] + 3]);
  }
  fill([gIn.x, gIn.y, gIn.x + 1, gIn.y + 1]);
  fill([gOn.x, gOn.y, gOn.x + 1, gOn.y + 1]);
  for (let ty = lakeR[1]; ty < lakeR[3]; ty++) {
    for (let tx = lakeR[0]; tx < lakeR[2]; tx++) {
      tiles[ty * W + tx] = T_WALL;
      lakeT[ty * W + tx] = 1;
    }
  }
  const mz = mazeOf(rng, nx, ny, pitch);
  const mazeIn: P = [maze.x0, maze.y0 + pitch * (ny - 1) + 2];
  const mazeOut: P = [maze.x1, maze.y0 + 2];
  for (let ty = tr[2][1]; ty < tr[2][3]; ty++) {
    for (let tx = maze.x0; tx <= maze.x1; tx++) {
      if (mz.hedge(tx - maze.x0, ty - maze.y0) && !(tx === mazeIn[0] && ty === mazeIn[1]) && !(tx === mazeOut[0] && ty === mazeOut[1])) tiles[ty * W + tx] = T_WALL;
    }
  }
  const ends: P[] = mz.ends.map(([i, j]) => [maze.x0 + i * pitch + 2.5, maze.y0 + j * pitch + 2.5] as P).filter(([x, yy]) => Math.hypot(x - mazeIn[0], yy - mazeIn[1]) > 4 && Math.hypot(x - mazeOut[0], yy - mazeOut[1]) > 4);

  // THE GARDENS IN THE TERRACES: the drive, the parterre, the roses, the lake walk; the beds; the fountains' paving
  const walks: Rect[] = [];
  const paved: Rect[] = [];
  const rounds: [number, number, number][] = [];
  const beds: Rect[] = [];
  const roses: Rect[] = [];
  const nettles: Rect[] = [];
  const fountains: { x: number; y: number }[] = [];
  const clip = (r: Rect, to: Rect): Rect => [Math.max(r[0], to[0]), Math.max(r[1], to[1]), Math.min(r[2], to[2]), Math.min(r[3], to[3])];
  // (the walls' rows paved, under their pieces; and the walk up to and off each stair)
  for (const q of wallRows) paved.push([q.x0, q.y, q.x1, q.y + 1]);
  // THE FORECOURT'S DRIVE: from the gate along its middle to the stair's foot, and up to it
  const st0 = wallRows[0];
  walks.push(clip([tr[0][0], gIn.y - 1, st0.tx + 2, gIn.y + 2], tr[0]));
  walks.push(clip([st0.tx - 1, st0.y + 1, st0.tx + 2, gIn.y + 2], tr[0]));
  // THE PARTERRE: its still fountain in its middle, the cross walk the length of the terrace through it and a walk across it,
  // its four beds about it, edged in box (one gone over to nettles), the gravel round them
  const B = S.bed;
  const parterre = (k: number, overgrown: number[]): { x: number; y: number } => {
    const t = tr[k];
    const cx = Math.floor((t[0] + t[2]) / 2) + rng.int(-2, 2);
    const cy = Math.floor((t[1] + t[3]) / 2);
    fountains.push({ x: cx + 0.5, y: cy + 0.5 });
    rounds.push([cx + 0.5, cy + 0.5, 2.3]);
    walks.push(clip([t[0], cy - 1, t[2], cy + 2], t));
    walks.push(clip([cx - B.w - 6, cy - B.h - 4, cx + B.w + 7, cy + B.h + 5], t));
    const quads: Rect[] = [
      [cx - 3 - B.w, cy - 2 - B.h, cx - 3, cy - 2],
      [cx + 4, cy - 2 - B.h, cx + 4 + B.w, cy - 2],
      [cx - 3 - B.w, cy + 3, cx - 3, cy + 3 + B.h],
      [cx + 4, cy + 3, cx + 4 + B.w, cy + 3 + B.h],
    ];
    quads.forEach((q, i) => {
      if (overgrown.includes(i)) nettles.push(q);
      else {
        roses.push(q);
        beds.push(q);
      }
    });
    return { x: cx, y: cy };
  };
  const parts = [rng.int(0, 3)];
  const pt1 = parterre(1, parts);
  // THE ROSE TERRACE, the same about its own still fountain, two of its beds gone over to nettles
  const two = rng.shuffle([0, 1, 2, 3]).slice(0, 2);
  const pt3 = parterre(3, two);
  // (the walks up to and off each stair, from the terrace's cross walk)
  const cross = [gIn.y, pt1.y, -1, pt3.y, -1];
  wallRows.forEach((q, k) => {
    // its foot, on T(k): up from that terrace's own walk; its head, on T(k + 1): down to that one's
    const lo = cross[k];
    const hi = cross[k + 1];
    if (lo >= 0) walks.push(clip([q.tx - 1, q.y + 1, q.tx + 2, lo + 2], tr[k]));
    if (hi >= 0) walks.push(clip([q.tx - 1, hi - 1, q.tx + 1, q.y], tr[k + 1]));
  });
  // THE MAZE'S LAWNS: a walk from the stair's foot to its way in, and from its way out to the stair up
  walks.push(clip([wallRows[1].tx - 1, mazeIn[1] - 1, mazeIn[0], wallRows[1].y], tr[2]));
  walks.push(clip([mazeOut[0] + 1, mazeOut[1] - 1, wallRows[2].tx + 2, mazeOut[1] + 2], tr[2]));
  walks.push(clip([wallRows[2].tx - 1, wallRows[2].y + 1, wallRows[2].tx + 2, mazeOut[1] + 2], tr[2]));
  // THE LAKE WALK, along its near shore the length of the terrace; up from the stair to it; and up past the lake's end to the gate on
  walks.push([tr[4][0], lakeR[3], tr[4][2], lakeR[3] + 2]);
  walks.push([wallRows[3].tx - 1, lakeR[3], wallRows[3].tx + 1, wallRows[3].y]);
  walks.push([gOn.x - 1, tr[4][1], gOn.x + 2, lakeR[3]]);
  // A BED OF NETTLES on the forecourt's lawn, one on the lake terrace's, one in the gardeners' corner (their beds gone wild)
  const lawnBed = (t: Rect, w0: number, h0: number, avoid: (x: number, y: number) => boolean): void => {
    for (let n = 0; n < 40; n++) {
      const bx = rng.int(t[0] + 2, t[2] - w0 - 2);
      const by = rng.int(t[1] + 2, t[3] - h0 - 2);
      const r: Rect = [bx, by, bx + w0, by + h0];
      let bad = false;
      for (let ty = by - 2; ty < by + h0 + 2 && !bad; ty++) for (let tx = bx - 2; tx < bx + w0 + 2 && !bad; tx++) if (avoid(tx + 0.5, ty + 0.5)) bad = true;
      if (bad) continue;
      nettles.push(r);
      return;
    }
  };
  const onWalk = (x: number, yy: number): boolean => walks.some((r) => x >= r[0] && yy >= r[1] && x < r[2] && yy < r[3]);
  // (where he comes in: two tiles in from the gate's gateway, game/ways.ts START[16])
  const startAt = { x: gIn.x + 2.5, y: gIn.y + 0.5 };
  // THE FOUNTAIN OF THE FOUR ROYALS in the forecourt's lawn below the drive, half way along it (two tiles across, about a tile's corner)
  let royals: { x: number; y: number } | null = null;
  {
    const t = tr[0];
    const fx = Math.round((t[0] + wallRows[0].tx) / 2) + rng.int(-2, 2);
    const fy = gIn.y + 4;
    if (fy + 3 <= t[3]) {
      royals = { x: fx, y: fy };
      rounds.push([fx, fy, 1.9]);
    }
  }
  const nearRoyals = (x: number, yy: number): boolean => !!royals && Math.hypot(x - royals.x, yy - royals.y) < 4;
  lawnBed(tr[0], rng.int(4, 5), 3, (x, yy) => onWalk(x, yy) || nearRoyals(x, yy) || Math.hypot(x - startAt.x, yy - startAt.y) < 8 || x > wallRows[0].tx - 4);
  lawnBed([tr[4][0], lakeR[3] + 3, Math.floor(A.x - S.arena.rx - 6), tr[4][3]], rng.int(4, 6), 3, (x, yy) => onWalk(x, yy) || Math.abs(x - wallRows[3].tx) < 5);
  const gr = sides[1].r;
  nettles.push([gr[2] - 4, gr[1] + 1, gr[2] - 1, gr[1] + 3]);
  // THE GARDEN PARTY, left out on the rose terrace's lawn, beyond its parterre toward its near end (its card table's tile)
  // (on the lawn beside its parterre toward the terrace's near end, below its cross walk: its things three tiles round the table)
  const t3 = tr[3];
  const pLo = t3[0] + 4;
  const pHi = pt3.x - B.w - 10;
  const party = pHi >= pLo && pt3.y + 8 <= t3[3] ? { x: rng.int(pLo, pHi), y: pt3.y + 4 } : null;

  // THE ROOMS: each terrace its rectangle, the boss's ground its own, the side gardens theirs (a terrace or two of the middle
  // elite: a yellow pack's)
  const rooms: Room[] = [];
  const roomOf = (r: Rect, kind: RoomKind, path: number): number => {
    rooms.push({ id: rooms.length, x: r[0], y: r[1], w: r[2] - r[0], h: r[3] - r[1], kind, path });
    return rooms.length - 1;
  };
  const roles: GardenPlan['terraces'][number]['role'][] = ['forecourt', 'parterre', 'maze', 'roses', 'lake'];
  const terraces: GardenPlan['terraces'] = tr.map((r, k) => ({ r, role: roles[k], room: roomOf(r, k === 0 ? 'start' : 'normal', k) }));
  const elite = rng.shuffle([1, 2, 3, 4]).slice(0, 2);
  for (const k of elite) rooms[terraces[k].room].kind = 'elite';
  const arenaBlob: Blob = { x: A.x, y: A.y, rx: S.arena.rx, ry: S.arena.ry, rot: 0, wob: S.arena.wob, seed: rng.int(0, 9999) };
  const bossRoom = roomOf([Math.floor(A.x - S.arena.rx - 1), Math.floor(A.y - S.arena.ry - 1), Math.ceil(A.x + S.arena.rx + 1), Math.ceil(A.y + S.arena.ry + 1)], 'boss', 5);
  const sideRooms = sides.map((s) => ({ ...s, room: roomOf(s.r, s.role === 'treasure' ? 'treasure' : s.role === 'lair' ? 'guardian' : 'normal', -1) }));

  // WHAT THE GARDENS KEEP FOR THEIR OWN (nothing of the packs' or the game's things on it): the walls' rows and round their
  // stairs, the fountains and their paving, the beds and their box, the nettles, the gates, the maze's way in and out, the
  // party, the boss's ground
  const reserved = new Uint8Array(W * H);
  const reserve = (r: Rect, by = 0): void => {
    for (let ty = r[1] - by; ty < r[3] + by; ty++) for (let tx = r[0] - by; tx < r[2] + by; tx++) if (tx >= 0 && ty >= 0 && tx < W && ty < H) reserved[ty * W + tx] = 1;
  };
  for (const q of wallRows) {
    reserve([q.x0, q.y, q.x1, q.y + 1]);
    reserve([q.tx - 2, q.y - 2, q.tx + 3, q.y + 3]);
  }
  for (const fo of fountains) reserve([Math.floor(fo.x) - 2, Math.floor(fo.y) - 2, Math.floor(fo.x) + 3, Math.floor(fo.y) + 3]);
  for (const b of [...roses, ...nettles]) reserve(b, 1);
  reserve([gIn.x, gIn.y - 2, gIn.x + 4, gIn.y + 3]);
  reserve([gOn.x - 2, gOn.y, gOn.x + 3, gOn.y + 4]);
  reserve([mazeIn[0] - 1, mazeIn[1] - 1, mazeIn[0] + 2, mazeIn[1] + 2]);
  reserve([mazeOut[0] - 1, mazeOut[1] - 1, mazeOut[0] + 2, mazeOut[1] + 2]);
  for (const s of sideRooms) reserve([s.gap[0] - 1, s.gap[1], s.gap[0] + 2, s.gap[1] + 3]);
  if (party) reserve([party.x - 3, party.y - 3, party.x + 4, party.y + 4]);
  if (royals) reserve([royals.x - 3, royals.y - 3, royals.x + 3, royals.y + 3]);
  for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) if (blobDist(arenaBlob, tx + 0.5, ty + 0.5) < 1.25) reserved[ty * W + tx] = 1;

  // THE START AND THE BOSS; EVERYTHING THAT MATTERS REACHED FROM THE START (the walls' rows walked only at their stairs; the
  // fountains, the beds and their box, the gateways, in the way)
  const walkable = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) walkable[i] = tiles[i] === T_FLOOR ? 1 : 0;
  for (const q of wallRows) for (let tx = q.x0; tx < q.x1; tx++) if (tx < q.tx - 1 || tx > q.tx + 1) walkable[q.y * W + tx] = 0;
  for (const fo of fountains) for (let ty = Math.floor(fo.y) - 1; ty <= Math.floor(fo.y) + 1; ty++) for (let tx = Math.floor(fo.x) - 1; tx <= Math.floor(fo.x) + 1; tx++) walkable[ty * W + tx] = 0;
  for (const b of roses) for (let ty = b[1] - 1; ty <= b[3]; ty++) for (let tx = b[0] - 1; tx <= b[2]; tx++) walkable[ty * W + tx] = 0;
  walkable[gIn.y * W + gIn.x] = 0;
  if (royals) for (let ty = royals.y - 1; ty <= royals.y; ty++) for (let tx = royals.x - 1; tx <= royals.x; tx++) walkable[ty * W + tx] = 0;
  const floor: Floor = {
    depth,
    seed,
    w: W,
    h: H,
    tiles,
    cut: new Uint8Array(W * H),
    variant: new Uint8Array(W * H),
    rooms,
    start: { ...startAt },
    boss: { x: A.x, y: A.y },
    packs: [],
    props: [],
  };
  const vr = new RNG(seed ^ 0x1b873593);
  for (let i = 0; i < W * H; i++) floor.variant[i] = vr.int(0, 255);
  const got = reachFrom(W, H, walkable, Math.floor(floor.start.y) * W + Math.floor(floor.start.x));
  const must: P[] = [
    [A.x, A.y],
    [gOn.x + 0.5, gOn.y + 1.5],
    [mazeIn[0] + 0.5, mazeIn[1] + 0.5],
    [mazeOut[0] + 0.5, mazeOut[1] + 0.5],
    ...wallRows.map((q) => [q.tx + 0.5, q.y + 0.5] as P),
    ...sideRooms.map((s) => [(s.r[0] + s.r[2]) / 2, (s.r[1] + s.r[3]) / 2] as P),
    ...ends,
  ];
  for (const [mxp, myp] of must) if (!got[Math.floor(myp) * W + Math.floor(mxp)]) return null;
  // (the boss's ground open: its middle and the whole of it whole floor, nothing of the walls' or the lake's)
  for (let ty = Math.floor(A.y - S.arena.ry - 1); ty <= A.y + S.arena.ry + 1; ty++) {
    for (let tx = Math.floor(A.x - S.arena.rx - 1); tx <= A.x + S.arena.rx + 1; tx++) {
      if (blobDist(arenaBlob, tx + 0.5, ty + 0.5) < 1 && !got[ty * W + tx]) return null;
    }
  }

  // THE PACKS, THE GAME'S THINGS
  const regions: { r: Rect; room: number; role: 'terrace' | 'gardeners' | 'lair' | 'treasure' }[] = [
    ...terraces.map((t) => ({ r: t.r, room: t.room, role: 'terrace' as const })),
    ...sideRooms.map((s) => ({ r: s.r, room: s.room, role: s.role })),
  ];
  floor.packs = packsOf(rng, floor, regions, depth, reserved, got, arenaBlob);
  floor.props = propsOf(rng, floor, regions, ends, reserved, got, sideRooms.find((s) => s.role === 'treasure')!.r);

  const garden: GardenPlan = {
    terraces,
    walls: wallRows,
    maze: { x0: maze.x0, y0: maze.y0, nx, ny, pitch, gin: mazeIn, gout: mazeOut, ends },
    lake: lakeR,
    pavilion: Pv,
    fountains,
    royals,
    roses,
    nettles,
    sides: sideRooms.map((s) => ({ r: s.r, role: s.role, room: s.room, gap: s.gap })),
    gates: { start: { x: gIn.x, y: gIn.y, dir: 'x-' }, on: { x: gOn.x, y: gOn.y, dir: 'y-' } },
    walks,
    paved,
    rounds,
    beds,
    party,
  };
  const way: P[] = [[floor.start.x, floor.start.y], ...wallRows.map((q, k) => (k === 2 ? [[mazeIn[0] + 0.5, mazeIn[1] + 0.5], [mazeOut[0] + 0.5, mazeOut[1] + 0.5], [q.tx + 0.5, q.y + 0.5]] : [[q.tx + 0.5, q.y + 0.5]]) as P[]).flat(), [A.x, A.y]];
  const areas: Land['areas'] = [
    ...terraces.map((t, k) => ({ blob: rectBlob(t.r), room: t.room, role: (k === 0 ? 'start' : 'path') as AreaRole })),
    { blob: arenaBlob, room: bossRoom, role: 'boss' },
    ...sideRooms.map((s) => ({ blob: rectBlob(s.r), room: s.room, role: (s.role === 'lair' ? 'lair' : 'side') as AreaRole })),
  ];
  const land: Land = {
    kind: 'swangardens',
    depth,
    seed,
    way,
    areas,
    lanes: [],
    holds: [],
    exit: { x: gOn.x + 0.5, y: gOn.y + 0.5 },
    arrive: { ...floor.start },
    lake: lakeT,
    garden,
    wayDirs: { on: 'y-', back: 'x-' },
  };
  return { floor, land };
}

/** A rectangle as an area's blob (for what asks of the areas: game.ts, the bosses' rules). */
function rectBlob(r: Rect): Blob {
  return { x: (r[0] + r[2]) / 2, y: (r[1] + r[3]) / 2, rx: (r[2] - r[0]) / 2, ry: (r[3] - r[1]) / 2, rot: 0, wob: 0, seed: 0 };
}

/** Tiles reached from tile `from` by side steps over `walk`. */
function reachFrom(W: number, H: number, walk: Uint8Array, from: number): Uint8Array {
  const seen = new Uint8Array(W * H);
  if (!walk[from]) return seen;
  const q = [from];
  seen[from] = 1;
  while (q.length) {
    const i = q.pop()!;
    const x = i % W;
    const y = (i - x) / W;
    for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + ax;
      const ny = y + ay;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx;
      if (seen[j] || !walk[j]) continue;
      seen[j] = 1;
      q.push(j);
    }
  }
  return seen;
}

/**
 * THE HEDGE MAZE (the art's corner lays one so: src/dev/swan_level.ts): `nx` cells across and `ny` deep, `pitch` tiles apart (a
 * corridor pitch - 1 wide, a hedge one), dug by the dice from its way in (its last row's first cell) so that every cell is
 * reached by one way only. `hedge(u, v)`: whether the tile (u, v) from its corner is hedge (its first and last columns are its
 * own hedge; its first and last rows are the walls' rows over and under it, not its: v from 1 to ny * pitch - 1); `ends`: its
 * dead ends' cells (i, j).
 */
function mazeOf(rng: RNG, nx: number, ny: number, pitch: number): { hedge: (u: number, v: number) => boolean; ends: P[] } {
  const openE = new Uint8Array(nx * ny);
  const openS = new Uint8Array(nx * ny);
  const seen = new Uint8Array(nx * ny);
  const start = (ny - 1) * nx;
  const stack = [start];
  seen[start] = 1;
  while (stack.length) {
    const c = stack[stack.length - 1];
    const i = c % nx;
    const j = (c - i) / nx;
    const nb: [number, number][] = [];
    if (i > 0 && !seen[c - 1]) nb.push([c - 1, 0]);
    if (i < nx - 1 && !seen[c + 1]) nb.push([c + 1, 1]);
    if (j > 0 && !seen[c - nx]) nb.push([c - nx, 2]);
    if (j < ny - 1 && !seen[c + nx]) nb.push([c + nx, 3]);
    if (!nb.length) {
      stack.pop();
      continue;
    }
    const [to, dir] = rng.pick(nb);
    if (dir === 0) openE[to] = 1;
    else if (dir === 1) openE[c] = 1;
    else if (dir === 2) openS[to] = 1;
    else openS[c] = 1;
    seen[to] = 1;
    stack.push(to);
  }
  const ends: P[] = [];
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const c = j * nx + i;
      let n = 0;
      if (i > 0 && openE[c - 1]) n++;
      if (i < nx - 1 && openE[c]) n++;
      if (j > 0 && openS[c - nx]) n++;
      if (j < ny - 1 && openS[c]) n++;
      // (its way in and way out are ways too)
      if ((i === 0 && j === ny - 1) || (i === nx - 1 && j === 0)) n++;
      if (n === 1) ends.push([i, j]);
    }
  }
  const hedge = (u: number, v: number): boolean => {
    if (u < 0 || v < 1 || u > nx * pitch || v > ny * pitch - 1) return false;
    const onX = u % pitch === 0;
    const onY = v % pitch === 0;
    if (onX && onY) return true;
    const i = Math.floor(u / pitch);
    const j = Math.floor(v / pitch);
    if (onX) {
      if (i === 0 || i === nx) return true;
      return !openE[j * nx + i - 1];
    }
    if (onY) return !openS[(j - 1) * nx + i];
    return false;
  };
  return { hedge, ends };
}

// ---------------------------------------------------------------------------------------------------
// THE PACKS AND THE GAME'S THINGS

type Region = { r: Rect; room: number; role: 'terrace' | 'gardeners' | 'lair' | 'treasure' };

/**
 * THE PACKS, by the floor's own kinds (game/act2_mobs.ts ACT2_OWN[16]; until a kind is built the Hush's stand in): in each
 * terrace one for every SG_PLAN.packEvery tiles of it walked, spread, never on what the gardens keep, ten tiles and more from
 * where he comes in, none in the boss's ground; in the gardeners' corner its Hushed gardeners (once they are built: his ask,
 * “Around where the hushed gardeners are at”); in the lair the palace guard (its guardian's, ACT2_GUARD[16]); in the treasure
 * garden one.
 */
function packsOf(rng: RNG, f: Floor, regions: readonly Region[], depth: number, reserved: Uint8Array, got: Uint8Array, arena: Blob): PackSpot[] {
  const out: PackSpot[] = [];
  const W = f.w;
  const used: P[] = [];
  const free = (x: number, y: number): boolean => {
    for (let ty = y - 1; ty <= y + 1; ty++) {
      for (let tx = x - 1; tx <= x + 1; tx++) {
        const i = ty * W + tx;
        if (tx < 0 || ty < 0 || tx >= W || ty >= f.h || f.tiles[i] !== T_FLOOR || reserved[i] || !got[i]) return false;
      }
    }
    return true;
  };
  for (const g of regions) {
    const cands: P[] = [];
    let n = 0;
    for (let ty = g.r[1]; ty < g.r[3]; ty++) {
      for (let tx = g.r[0]; tx < g.r[2]; tx++) {
        if (got[ty * W + tx]) n++;
        if (!free(tx, ty)) continue;
        if (Math.hypot(tx + 0.5 - f.start.x, ty + 0.5 - f.start.y) < 10) continue;
        if (blobDist(arena, tx + 0.5, ty + 0.5) < 1.4) continue;
        cands.push([tx, ty]);
      }
    }
    rng.shuffle(cands);
    const room = f.rooms[g.room];
    const want = g.role === 'terrace' ? Math.max(1, Math.round(n / SG_PLAN.packEvery)) : 1;
    // (the side gardens' one in their middle)
    if (g.role !== 'terrace') cands.sort((p, q) => Math.hypot(p[0] + 0.5 - (g.r[0] + g.r[2]) / 2, p[1] + 0.5 - (g.r[1] + g.r[3]) / 2) - Math.hypot(q[0] + 0.5 - (g.r[0] + g.r[2]) / 2, q[1] + 0.5 - (g.r[1] + g.r[3]) / 2));
    let k = 0;
    for (const [tx, ty] of cands) {
      if (k >= want) break;
      if (used.some(([ux, uy]) => Math.hypot(ux - tx, uy - ty) < 6)) continue;
      const tier: PackSpot['tier'] = g.role === 'lair' ? 'champion' : room.kind === 'elite' && k === 0 ? 'elite' : 'normal';
      const p = act1Pack(depth, rng, tier);
      let kind: MonsterKind = p.kind;
      let size = p.size;
      // (the gardeners' corner: its own, once they are built; the dice rolled the same either way)
      const [lo, hi] = PACK_BY_SIZE[sizeOf('gardener')];
      const n2 = rng.int(lo, hi);
      if (g.role === 'gardeners' && act2Ready('gardener')) {
        kind = 'gardener';
        size = n2;
      }
      out.push({ x: tx + 0.5, y: ty + 0.5, roomId: room.id, size, tier, kind });
      used.push([tx, ty]);
      k++;
    }
  }
  return out;
}

/**
 * THE GAME'S OWN THINGS: the treasure garden's chests (two or three) and one in each of two of the maze's dead ends; its barrels
 * and urns, drawn as the gardens' own two breakables (game/act1_dress.ts ACT1_SETS[16]: a gardener's barrow, an urn of roses),
 * two or three to a terrace toward its edges.
 */
function propsOf(rng: RNG, f: Floor, regions: readonly Region[], ends: readonly P[], reserved: Uint8Array, got: Uint8Array, treasure: Rect): PropSpot[] {
  const out: PropSpot[] = [];
  const W = f.w;
  const taken = new Set<number>();
  const ok = (tx: number, ty: number): boolean => {
    for (let y = ty - 1; y <= ty + 1; y++) {
      for (let x = tx - 1; x <= tx + 1; x++) {
        const i = y * W + x;
        if (x < 0 || y < 0 || x >= W || y >= f.h || f.tiles[i] !== T_FLOOR || reserved[i] || !got[i]) return false;
      }
    }
    if (f.packs.some((p) => Math.hypot(p.x - tx - 0.5, p.y - ty - 0.5) < 2)) return false;
    return !taken.has(ty * W + tx) && Math.hypot(tx + 0.5 - f.start.x, ty + 0.5 - f.start.y) > 4;
  };
  const put = (k: PropSpot['kind'], tx: number, ty: number): void => {
    out.push({ kind: k, x: tx, y: ty });
    taken.add(ty * W + tx);
  };
  // the treasure garden's chests, near its middle
  const cx = (treasure[0] + treasure[2]) / 2;
  const cy = (treasure[1] + treasure[3]) / 2;
  const n = rng.int(2, 3);
  for (let k = 0, t = 0; k < n && t < 60; t++) {
    const tx = Math.floor(cx + rng.range(-2.5, 2.5));
    const ty = Math.floor(cy + rng.range(-2, 2));
    if (!ok(tx, ty) || [...taken].some((i) => Math.hypot((i % W) - tx, Math.floor(i / W) - ty) < 2)) continue;
    put('chest', tx, ty);
    k++;
  }
  // a chest in each of two of the maze's dead ends (a reward for the wrong turn)
  // (never where a pack stands)
  let inMaze = 0;
  for (const [ex, ey] of rng.shuffle([...ends])) {
    if (inMaze >= 2) break;
    const tx = Math.floor(ex);
    const ty = Math.floor(ey);
    if (f.packs.some((p) => Math.hypot(p.x - ex, p.y - ey) < 2.5)) continue;
    if (f.tiles[ty * W + tx] !== T_FLOOR || !got[ty * W + tx] || taken.has(ty * W + tx)) continue;
    put('chest', tx, ty);
    inMaze++;
  }
  // the breakables, toward each terrace's edges
  for (const g of regions) {
    if (g.role !== 'terrace') continue;
    const r = g.r;
    const want = rng.int(2, 3);
    for (let k = 0, t = 0; k < want && t < 60; t++) {
      const tx = rng.int(r[0] + 1, r[2] - 2);
      const ty = rng.int(r[1] + 1, r[3] - 2);
      const edge = Math.min(tx - r[0], r[2] - 1 - tx, ty - r[1], r[3] - 1 - ty);
      if (edge > 3 || !ok(tx, ty)) continue;
      put(rng.chance(0.5) ? 'barrel' : 'urn', tx, ty);
      k++;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------
// THE DRESSER

/**
 * DRESS THE SWAN GARDENS with their own pieces and the High City's, by dice of their own (as game/act1_dress.ts dresses the
 * descent's: what the rules know of a piece is its name and whether it stands in the way; its picture is the art's,
 * render/act1_pieces.ts). It lays:
 *   THE LAKE: the Swan Pavilion on its island in it (its deep water the map-maker's: never walked, nothing goes into it).
 *   THE TERRACES' WALLS as the art's README builds them: `a terrace wall` on every tile of a wall's row but its stair's three,
 *     `a stair's pier` either side of those, `the terrace stair` (lying) on its two feet; yew cones and bay trees at its foot.
 *   THE STILL FOUNTAINS (three tiles across, in the way); THE PARTERRES' BEDS, a rose bush on each tile and box edging round,
 *     their beds gone over to nettles `nettles` on every tile (the trap's still picture, stirred as someone goes through:
 *     game/act2/garden_rules.ts); topiary swans, a sundial, stone swans, benches, urns about their gravel.
 *   THE FORECOURT: the High City's sentry boxes by the gate he came in by, the heralds' trumpets, gilt lamps along the drive, the
 *     state coach abandoned, a king's statue, the fountain of the four royals, runs of palace railings; a rose arbour over the
 *     drive.
 *   THE GARDENERS' CORNER and the parterre's end by it: HER VINES (art/floor16.ts herVinesPieces): over the terrace wall by the
 *     stair, through a bed's box, up a lantern, across the walk either side of the gardeners' barrow, and out of a yew cone
 *     (its four frames played once as he comes near: garden_rules.ts); clippings and shears, a bed of nettles.
 *   THE MAZE'S GATES standing open at its way in and out.
 *   THE ROSE TERRACE: rose arbours over its walk; the garden party left out on its lawn (the card table, gilt chairs, the tea,
 *     a candelabrum, the songbird's cage, the cloaks, ropes, the carpet out to it, invitations, a fan).
 *   THE LAIR: the palace guard's court: sentry boxes, railings, trumpets, a lamp. THE TREASURE GARDEN: roses, bays, urns.
 *   THE LAKE WALK: lanterns along the water, benches, the boat at the landing, a swan's nest, feathers; by the boss's ground
 *     her quest (the nettle shirt half woven on a bench, the trodden nettles by it); lanterns and urns round the boss's ground,
 *     its middle clear.
 * Null where the floor is not the Swan Gardens' (the descent's dresser then lays it).
 */
export function dress(L: Level, depth: number, seed: number): Act1Dress | null {
  const land = L.land;
  const G = land?.garden;
  if (!BUILT || !land || land.kind !== 'swangardens' || !G) return null;
  const f = L.floor;
  const W = f.w;
  const H = f.h;
  const rng = new RNG((seed ^ 0x2c16d00d) >>> 0);
  const out: Act1Dress = { floor: 16, tiles: [] };
  const inFloor = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H;
  const whole = (x: number, y: number): boolean => inFloor(x, y) && f.tiles[y * W + x] === T_FLOOR;

  // THE LAKE: deep water (his doc's hazard), its tiles not floor: never walked, and nothing goes into it, no body, no shot, nothing
  // thrown nor dropped (as the Ledge Road's drop; not the rivers' flat water, LEAP_WATER, seen and leapt across)

  // WHAT IS KEPT CLEAR: where he comes in, the waypoint, the gates, every pack's middle, the walks' middles, the stairs' ways
  const keep = new Uint8Array(W * H);
  const clearRound = (x: number, y: number, r: number): void => {
    for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) {
      for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) {
        if (inFloor(tx, ty) && Math.hypot(tx + 0.5 - x, ty + 0.5 - y) <= r) keep[ty * W + tx] = 1;
      }
    }
  };
  const clearRect = (r: readonly number[]): void => {
    for (let ty = r[1]; ty < r[3]; ty++) for (let tx = r[0]; tx < r[2]; tx++) if (inFloor(tx, ty)) keep[ty * W + tx] = 1;
  };
  clearRound(f.start.x, f.start.y, 3.2);
  if (L.ways?.way) clearRound(L.ways.way.x, L.ways.way.y, 2);
  clearRound(land.exit.x, land.exit.y + 1, 2.5);
  for (const p of f.packs) clearRound(p.x, p.y, 1.5);
  const g0 = G.gates.start;
  clearRect([g0.x, g0.y - 1, g0.x + 2, g0.y + 2]);
  for (const q of G.walls) clearRect([q.tx - 1, q.y - 2, q.tx + 2, q.y + 3]);
  clearRect([G.maze.gin[0] - 2, G.maze.gin[1] - 1, G.maze.gin[0] + 3, G.maze.gin[1] + 2]);
  clearRect([G.maze.gout[0] - 2, G.maze.gout[1] - 1, G.maze.gout[0] + 3, G.maze.gout[1] + 2]);
  for (const s of G.sides) clearRect([s.gap[0] - 2, s.gap[1], s.gap[0] + 3, s.gap[1] + 3]);
  const arena = land.areas.find((a) => a.role === 'boss')!.blob;
  const onWalk = (x: number, y: number): boolean => G.walks.some((r) => x >= r[0] && y >= r[1] && x < r[2] && y < r[3]);
  const inRect = (r: Rect, x: number, y: number): boolean => x >= r[0] && y >= r[1] && x < r[2] && y < r[3];
  const nettleAt = (x: number, y: number): boolean => G.nettles.some((r) => inRect(r, x, y));

  const taken = new Uint8Array(W * H);
  for (const p of L.props) taken[p.ty * W + p.tx] = 1;
  /** A free tile: floor, nothing there, not kept clear, walked; `ring`: its eight neighbours floor and walked too; `lawn`: off the walks and the nettles. */
  const free = (x: number, y: number, ring: boolean, lawn = true): boolean => {
    if (!whole(x, y)) return false;
    const i = y * W + x;
    if (keep[i] || taken[i] || L.walk[i] !== 1) return false;
    if (lawn && (onWalk(x + 0.5, y + 0.5) || nettleAt(x + 0.5, y + 0.5))) return false;
    if (blobDist(arena, x + 0.5, y + 0.5) < 1.08) return false;
    if (!ring) return true;
    for (let ay = -1; ay <= 1; ay++) {
      for (let ax = -1; ax <= 1; ax++) {
        if (!ax && !ay) continue;
        if (!whole(x + ax, y + ay) || L.walk[(y + ay) * W + x + ax] !== 1) return false;
      }
    }
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
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (!inFloor(x, y)) continue;
        taken[y * W + x] = 1;
        if (solid) L.walk[y * W + x] = 0;
      }
    }
  };
  const room = (x0: number, y0: number, x1: number, y1: number): void => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inFloor(x, y)) keep[y * W + x] = 1;
  };
  /** Put a piece on the first free tile (with its ring) of `spots`, the eight round it kept clear after. */
  const putFirst = (name: string, spots: readonly P[], solid = true, variant = 0, lawn = true): P | null => {
    for (const [x, y] of spots) {
      if (!free(x, y, true, lawn)) continue;
      put(name, x, y, solid, variant);
      room(x - 1, y - 1, x + 1, y + 1);
      return [x, y];
    }
    return null;
  };
  /** Put a piece against a side garden's hedge: on the first free tile of `spots` (its ring the hedge, so not asked), the tiles round it kept clear after. */
  const putEdge = (name: string, spots: readonly P[], variant = 0): P | null => {
    for (const [x, y] of spots) {
      if (!free(x, y, false, false)) continue;
      put(name, x, y, true, variant);
      room(x - 1, y - 1, x + 1, y + 1);
      return [x, y];
    }
    return null;
  };
  const tilesIn = (r: Rect): P[] => {
    const list: P[] = [];
    for (let ty = r[1]; ty < r[3]; ty++) for (let tx = r[0]; tx < r[2]; tx++) list.push([tx, ty]);
    return list;
  };
  const gardeners = G.sides.find((s) => s.role === 'gardeners')!;
  const T = G.terraces.map((t) => t.r);

  // ---- THE SWAN PAVILION on its island, standing in the lake (its tiles the lake's)
  put(SG_PIECE.pavilion, Math.floor(G.pavilion.x), Math.floor(G.pavilion.y), true, 0, G.pavilion);

  // ---- THE TERRACES' WALLS: a wall on each tile of the row, the row open at its stair from tx - 1 to tx + 1, a pier either side,
  // the stair's two feet laid on the floor; her vine over the parterre's wall nearest the gardeners' corner
  const vinedWall = (() => {
    const q = G.walls[0];
    // (the forecourt's wall up to the parterre, by its stair: the gardeners' corner is off the parterre's far end, by it)
    const xs = [q.tx + 4, q.tx + 5, q.tx - 4, q.tx - 5].filter((x) => x >= q.x0 && x < q.x1);
    return xs.length ? { x: xs[rng.int(0, xs.length - 1)], y: q.y } : null;
  })();
  for (const q of G.walls) {
    for (let x = q.x0; x < q.x1; x++) {
      if (x >= q.tx - 1 && x <= q.tx + 1) continue;
      const name = x === q.tx - 2 || x === q.tx + 2 ? SG_PIECE.pier : vinedWall && vinedWall.x === x && vinedWall.y === q.y ? SG_PIECE.wallVine : SG_PIECE.wall;
      put(name, x, q.y, true, 0);
    }
    put(SG_PIECE.stair, q.tx, q.y + 1, false, 0);
    put(SG_PIECE.stair, q.tx + 1, q.y + 1, false, 0);
  }
  // (at each stair's foot, a lantern either side; at its head, bay trees in their tubs)
  for (const q of G.walls) {
    for (const x of [q.tx - 2, q.tx + 3]) {
      if (free(x, q.y + 1, false, false)) put(SG_PIECE.lantern, x, q.y + 1, true);
    }
    for (const x of [q.tx - 3, q.tx + 2]) {
      if (free(x, q.y - 1, false, false)) put(SG_PIECE.bay, x, q.y - 1, true);
    }
  }

  // ---- THE STILL FOUNTAINS, three tiles across
  for (const fo of G.fountains) {
    const cx = Math.floor(fo.x);
    const cy = Math.floor(fo.y);
    put(SG_PIECE.fountain, cx, cy, true, 0, fo);
    over(cx - 1, cy - 1, cx + 1, cy + 1, true);
  }
  // ---- THE FOUNTAIN OF THE FOUR ROYALS (two tiles across, about a tile's corner), seen from before
  if (G.royals) {
    const { x, y } = G.royals;
    put(SG_PIECE.royals, x - 1, y - 1, true, 0, { x, y });
    over(x - 1, y - 1, x, y, true);
    room(x - 2, y - 2, x + 1, y + 1);
  }

  // ---- THE PARTERRES' BEDS: a rose bush on every tile, box edging round (her vine through the box of the parterre's bed nearest
  // the gardeners' corner); the beds gone over to nettles, nettles on every tile
  const nearCorner = G.roses.filter((b) => b[1] >= T[1][1] && b[3] <= T[1][3]).sort((a, b) => b[2] - a[2])[0];
  for (const b of G.roses) {
    for (const [x, y] of tilesIn(b)) put(SG_PIECE.rose, x, y, true, 0);
    const vineAt = b === nearCorner ? b[2] : -999;
    for (let x = b[0] - 1; x <= b[2]; x++) {
      put(x === vineAt ? SG_PIECE.boxVine : SG_PIECE.box, x, b[1] - 1, true, 0);
      put(SG_PIECE.box, x, b[3], true, 0);
    }
    for (let y = b[1]; y < b[3]; y++) {
      put(SG_PIECE.box, b[0] - 1, y, true, 1);
      put(SG_PIECE.box, b[2], y, true, 1);
    }
  }
  for (const b of G.nettles) for (const [x, y] of tilesIn(b)) if (whole(x, y) && !taken[y * W + x]) put(SG_PIECE.nettles, x, y, false, 0);

  // ---- THE MAZE'S GATES, standing open in its way in and out (across y: frames 2 shut, 3 open)
  put(SG_PIECE.gate, G.maze.gin[0], G.maze.gin[1], false, 3);
  put(SG_PIECE.gate, G.maze.gout[0], G.maze.gout[1], false, 3);

  // ---- ABOUT THE PARTERRES: bay trees at their corners, urns of roses, topiary swans, a sundial, a stone swan, benches by the
  // cross walk (on the gravel, off its middle)
  for (const k of [1, 3]) {
    const fo = G.fountains[k === 1 ? 0 : 1];
    if (!fo) continue;
    const cx = Math.floor(fo.x);
    const cy = Math.floor(fo.y);
    const t = T[k];
    const B = SG_PLAN.bed;
    for (const [x, y] of [[cx - B.w - 5, cy - B.h - 3], [cx + B.w + 5, cy - B.h - 3], [cx - B.w - 5, cy + B.h + 4], [cx + B.w + 5, cy + B.h + 4]] as P[]) {
      if (inRect(t, x, y)) putFirst(SG_PIECE.bay, [[x, y]], true, 0, false);
    }
    for (const [x, y] of [[cx - 2, cy - 3], [cx + 2, cy + 3]] as P[]) putFirst(SG_PIECE.bench, [[x, y]], true, 0, false);
    const lawns = rng.shuffle(tilesIn([t[0] + 2, t[1] + 2, t[2] - 2, t[3] - 2]));
    const things = k === 1 ? [SG_PIECE.topiary, SG_PIECE.sundial, SG_PIECE.stoneSwan, SG_PIECE.topiary, SG_PIECE.cone, SG_PIECE.cone] : [SG_PIECE.topiary, SG_PIECE.stoneSwan, SG_PIECE.cone, SG_PIECE.cone, SG_PIECE.bench];
    let n = 0;
    for (const [x, y] of lawns) {
      if (n >= things.length) break;
      if (Math.abs(x + 0.5 - fo.x) < SG_PLAN.bed.w + 7 && Math.abs(y + 0.5 - fo.y) < SG_PLAN.bed.h + 5) continue;
      if (G.party && Math.abs(x - G.party.x) <= 4 && Math.abs(y - G.party.y) <= 4) continue;
      if (putFirst(things[n], [[x, y]], true, things[n] === SG_PIECE.bench ? rng.int(0, 1) : 0)) n++;
    }
  }

  // ---- YEW CONES along the foot of each terrace's wall up (every six or seven tiles), and a few against the hedges
  for (let k = 0; k < 4; k++) {
    const q = G.walls[k];
    for (let x = q.x0 + 2 + rng.int(0, 3); x < q.x1 - 1; x += rng.int(6, 8)) {
      if (Math.abs(x - q.tx) < 5) continue;
      putFirst(SG_PIECE.cone, [[x, q.y + 1], [x + 1, q.y + 1]], true, 0, true);
    }
  }

  // ---- THE FORECOURT: by the gate he came in by, a sentry box either side (their openings to +x) and the heralds' trumpets;
  // gilt lamps along the drive; the state coach left by it; a king's statue; runs of palace railings along the lawns by the
  // drive (the Order's mask on one); a rose arbour over the drive
  {
    const t = T[0];
    const gy = G.gates.start.y;
    const x0 = t[0];
    for (const [x, y] of [[x0, gy - 4], [x0, gy + 4], [x0, gy - 5], [x0, gy + 5]] as P[]) {
      if (props.filter((p) => p.name === SG_PIECE.sentry).length >= 2) break;
      if (free(x, y, false)) {
        put(SG_PIECE.sentry, x, y, true, 1);
        room(x, y - 1, x + 1, y + 1);
      }
    }
    putFirst(SG_PIECE.trumpets, [[x0 + 2, gy + 3], [x0 + 3, gy + 3], [x0 + 2, gy - 3]]);
    const drive = G.walks[0];
    for (let x = drive[0] + 6; x < drive[2] - 3; x += rng.int(7, 9)) {
      const side = (Math.floor(x / 7) % 2 === 0 ? -1 : 1);
      const yy = side < 0 ? drive[1] - 1 : drive[3];
      if (free(x, yy, false)) put(SG_PIECE.lamp, x, yy, true, 0);
    }
    // the coach, its pole to +x along the drive, on the lawn above it (three tiles along, two across)
    for (let tries = 0; tries < 30; tries++) {
      const cx = rng.int(drive[0] + 8, Math.max(drive[0] + 9, drive[2] - 10));
      const cy = drive[1] - 3;
      let ok = true;
      for (let y = cy - 1; y <= cy + 1 && ok; y++) for (let x = cx - 2; x <= cx + 2 && ok; x++) ok = free(x, y, false) && y < drive[1] - 1;
      if (!ok) continue;
      put(SG_PIECE.coach, cx, cy, true, 1, { x: cx + 0.5, y: cy });
      over(cx - 1, cy - 1, cx + 1, cy, true);
      room(cx - 2, cy - 2, cx + 2, cy + 1);
      break;
    }
    const lawn = rng.shuffle(tilesIn([t[0] + 4, t[1] + 1, t[2] - 3, t[3] - 1]));
    putFirst(SG_PIECE.statue, lawn);
    // (railings: a run of four along x by the drive's lower side, one bearing the Order's mask)
    for (let tries = 0; tries < 40; tries++) {
      const rx = rng.int(drive[0] + 5, drive[2] - 8);
      const ry = drive[3] + 1;
      let ok = true;
      for (let x = rx - 1; x <= rx + 4 && ok; x++) ok = free(x, ry, false) && free(x, ry + 1, false, false) && free(x, ry - 1, false, false);
      if (!ok) continue;
      const mask = rng.int(0, 3);
      for (let k = 0; k < 4; k++) put(SG_PIECE.railings, rx + k, ry, true, k === mask ? 2 : 0);
      room(rx - 1, ry - 1, rx + 4, ry + 1);
      break;
    }
    const near = drive[0] + rng.int(9, 14);
    if (whole(near, G.gates.start.y)) put(SG_PIECE.arbour, near, G.gates.start.y, false, 0);
  }

  // ---- THE GARDENERS' CORNER: their barrow on the walk across its middle, her vine across the walk either side of it, the
  // clippings and shears by it; a yew cone with her vine reaching out of it by its gap (played as he comes near:
  // garden_rules.ts), a lantern with her vine up it; yew cones and box about its edges
  {
    const r = gardeners.r;
    const my = Math.floor((r[1] + r[3]) / 2);
    const mx = Math.floor((r[0] + r[2]) / 2);
    const bw = putFirst(SG_PIECE.barrow, [[mx, my - 2], [mx + 1, my - 2], [mx - 1, my - 2], [mx, my + 2], [mx + 1, my + 2]], true, 0, false) ?? [mx, my - 2];
    // (the clippings and shears by it, on the nearest tile free)
    const near = tilesIn(r).sort((p, q) => Math.hypot(p[0] - bw[0] + 2, p[1] - bw[1]) - Math.hypot(q[0] - bw[0] + 2, q[1] - bw[1]));
    for (const [x, y] of near) {
      if (!free(x, y, false, false)) continue;
      put(SG_PIECE.clippings, x, y, false, 0);
      break;
    }
    for (const x of [mx - 4, mx + 3]) if (free(x, my, false, false)) put(SG_PIECE.walkVine, x, my, false, 0);
    putEdge(SG_PIECE.coneVine, [[r[0], gardeners.gap[1] - 2], [r[0], gardeners.gap[1] + 4], [r[0] + 1, r[1]]]);
    putEdge(SG_PIECE.lanternVine, [[r[0] + 1, r[3] - 1], [r[0] + 2, r[3] - 1], [r[2] - 2, r[3] - 1]]);
    putEdge(SG_PIECE.cone, [[r[2] - 1, r[1]], [r[2] - 1, r[1] + 1]]);
    putFirst(SG_PIECE.cone, [[mx, r[3] - 2], [mx + 1, r[3] - 2]], true, 0, false);
    // (her vine across the parterre's walk too, on the way to the corner's gap)
    const t1 = T[1];
    const gx = gardeners.gap[0] - 3;
    if (inRect(t1, gx, gardeners.gap[1] + 1) && free(gx, gardeners.gap[1] + 1, false, false)) put(SG_PIECE.walkVine, gx, gardeners.gap[1] + 1, false, 1);
  }

  // ---- THE ROSE TERRACE: rose arbours over its cross walk, either side of its fountain (non-solid: walked under, the art's
  // half picture while someone is under it: render/act1_pieces.ts seenOf)
  {
    const fo = G.fountains[1];
    const t = T[3];
    if (fo) {
      const cy = Math.floor(fo.y);
      for (const ax of [Math.floor(fo.x) - SG_PLAN.bed.w - 10, Math.floor(fo.x) + SG_PLAN.bed.w + 10, Math.floor(fo.x) - 4, Math.floor(fo.x) + 4]) {
        if (inRect(t, ax, cy) && whole(ax, cy) && !taken[cy * W + ax]) put(SG_PIECE.arbour, ax, cy, false, 0);
      }
    }
    // THE GARDEN PARTY: the card table, gilt chairs round it, the tea, a candelabrum, the songbird's cage, the cloaks on their
    // stand, a velvet rope along its far side, the carpet out to it from the walk, invitations and a fan dropped
    const pa = G.party;
    if (pa) {
      const { x, y } = pa;
      // (the carpet along y from the cross walk down to the table: tiles of a runner, laid by their middles)
      for (let cy = y - 2; cy < y; cy++) {
        if (!whole(x, cy)) continue;
        out.tiles.push({ i: cy * W + x, name: SG_PIECE.carpet, frame: 1, mid: 1 });
        keep[cy * W + x] = 1;
      }
      put(SG_PIECE.table, x, y, true, 0);
      for (const [cx, cy] of [[x - 1, y], [x + 1, y], [x, y + 1]] as P[]) if (free(cx, cy, false)) put(SG_PIECE.chair, cx, cy, true, 0);
      for (const [cx, cy, name] of [[x - 3, y - 1, SG_PIECE.candles], [x + 3, y - 1, SG_PIECE.cage], [x - 3, y + 2, SG_PIECE.hats], [x + 3, y + 2, SG_PIECE.tea]] as [number, number, string][]) {
        if (free(cx, cy, false)) put(name, cx, cy, true, 0);
      }
      for (let k = -1; k <= 1; k++) if (free(x + k, y + 3, false)) put(SG_PIECE.rope, x + k, y + 3, true, 0);
      // (a grand vase on its pedestal either side of the carpet's end, by the walk)
      for (const vx of [x - 1, x + 1]) if (free(vx, y - 2, false)) put(SG_PIECE.vase, vx, y - 2, true, 0);
      if (free(x + 1, y + 2, false)) put(SG_PIECE.invitations, x + 1, y + 2, false, 0);
      if (free(x - 2, y + 1, false)) put(SG_PIECE.fan, x - 2, y + 1, false, 0);
    }
  }

  // ---- THE LAIR, the palace guard's court: a sentry box in its far corners, railings along its back, the heralds' trumpets, a lamp
  {
    const s = G.sides.find((q) => q.role === 'lair')!;
    const r = s.r;
    putEdge(SG_PIECE.sentry, [[r[2] - 1, r[1]], [r[2] - 2, r[1]]], 0);
    putEdge(SG_PIECE.sentry, [[r[2] - 1, r[3] - 1], [r[2] - 2, r[3] - 1]], 1);
    for (let x = r[0] + 2; x < r[2] - 3; x++) if (free(x, r[1], false, false)) put(SG_PIECE.railings, x, r[1], true, x === r[0] + 4 ? 2 : 0);
    putEdge(SG_PIECE.trumpets, [[r[2] - 1, r[1] + 3], [r[2] - 1, r[1] + 4]]);
    putEdge(SG_PIECE.lamp, [[r[0] + 1, r[3] - 1], [r[0] + 2, r[3] - 1]]);
  }
  // ---- THE TREASURE GARDEN: bay trees in its corners, a rose bush or two, an urn of roses, a stone bench
  {
    const r = G.sides.find((q) => q.role === 'treasure')!.r;
    for (const [x, y] of [[r[0] + 1, r[1]], [r[2] - 1, r[1]], [r[2] - 1, r[3] - 1]] as P[]) putEdge(SG_PIECE.bay, [[x, y]]);
    putEdge(SG_PIECE.urn, [[r[0] + 1, r[3] - 1], [r[0] + 2, r[3] - 1]]);
    putFirst(SG_PIECE.topiary, [[r[2] - 2, Math.floor((r[1] + r[3]) / 2)]], true, 0, false);
  }

  // ---- THE LAKE WALK: lanterns along the water every eight tiles or so; benches facing it; the boat at the landing, a swan's
  // nest by the water, feathers on the walk; by the boss's ground her quest, the nettle shirt half woven and the trodden
  // nettles by a bench
  {
    const lk = G.lake;
    const yW = lk[3];
    const west = T[4][0];
    const east = Math.floor(arena.x - arena.rx) - 1;
    for (let x = west + 4; x < east - 2; x += rng.int(7, 9)) if (free(x, yW, false, false)) put(SG_PIECE.lantern, x, yW, true, 0);
    // (on the kerb's row, the water behind them)
    const shore = rng.shuffle(tilesIn([lk[0] + 2, yW, east - 3, yW + 1])).filter(([x]) => !props.some((p) => p.ty === yW && Math.abs(p.tx - x) < 2));
    putEdge(SG_PIECE.boat, shore);
    putEdge(SG_PIECE.nest, shore);
    let feathers = 0;
    for (const [x, y] of rng.shuffle(tilesIn([west + 2, yW, east - 2, yW + 2]))) {
      if (feathers >= 3) break;
      if (!free(x, y, false, false)) continue;
      put(SG_PIECE.feathers, x, y, false, 0);
      feathers++;
    }
    for (let x = west + 8; x < east - 4; x += rng.int(10, 13)) putFirst(SG_PIECE.bench, [[x, yW + 2], [x + 1, yW + 2]], true, 0, true);
    // (her quest, by the water at the boss's ground's edge: the bench, the shirt on the walk by it, the trodden nettles)
    // (the shirt and the trodden nettles first, on the walk; then the bench by them, on the lawn)
    const qx = east - 2;
    const lieFirst = (name: string, spots: readonly P[]): boolean => {
      for (const [x, y] of spots) {
        if (!free(x, y, false, false)) continue;
        put(name, x, y, false, 0);
        return true;
      }
      return false;
    };
    lieFirst(SG_PIECE.shirt, [[qx, yW + 1], [qx - 1, yW + 1], [qx + 1, yW + 1], [qx, yW]]);
    lieFirst(SG_PIECE.trodden, [[qx - 3, yW + 1], [qx - 4, yW + 1], [qx - 3, yW], [qx - 5, yW + 1]]);
    putFirst(SG_PIECE.bench, [[qx - 1, yW + 2], [qx - 2, yW + 2], [qx, yW + 2], [qx - 3, yW + 2]], true, 0, false);
    // the lake terrace's lawns below the walk: topiary swans, a stone swan, yew cones
    const lawn = rng.shuffle(tilesIn([west + 2, yW + 4, east - 3, T[4][3] - 2]));
    for (const name of [SG_PIECE.topiary, SG_PIECE.stoneSwan, SG_PIECE.topiary, SG_PIECE.cone, SG_PIECE.cone, SG_PIECE.sundial]) putFirst(name, lawn);
    // a rose arbour over the lake walk
    const ax = west + rng.int(10, 16);
    if (ax < east - 4 && whole(ax, yW) && !taken[yW * W + ax] && !taken[(yW + 1) * W + ax]) put(SG_PIECE.arbour, ax, yW + 1, false, 0, { x: ax + 0.5, y: yW + 1 });
  }
  // ---- ROUND THE BOSS'S GROUND: lanterns and urns of roses at its edge, its middle clear (her moves are arena-sized)
  {
    const ring: P[] = [];
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      const x = Math.floor(arena.x + Math.cos(a) * arena.rx * 1.12);
      const y = Math.floor(arena.y + Math.sin(a) * arena.ry * 1.12);
      ring.push([x, y]);
    }
    ring.forEach(([x, y], k) => {
      if (!whole(x, y) || keep[y * W + x] || taken[y * W + x] || L.walk[y * W + x] !== 1) return;
      if (G.lake && y <= G.lake[3] + 1) return;
      if (blobDist(arena, x + 0.5, y + 0.5) < 1.05) return;
      put(k % 2 === 0 ? SG_PIECE.lantern : SG_PIECE.urn, x, y, true, 0);
    });
  }

  // THE GAME'S OWN THINGS AS THE FLOOR'S: its barrels and urns drawn as its own two breakables, the barrow and the urn of roses
  // (render/act1_pieces.ts: a breakable's variant past 100 is the descent's camp's)
  for (const p of L.props) if (p.kind === 'barrel' || p.kind === 'urn') p.variant = 0;
  L.props.push(...props);
  void depth;
  return out;
}

/** (for the tests and the look) The floor's lake tile at (x, y)? */
export function lakeAt(land: Land, W: number, x: number, y: number): boolean {
  return !!land.lake && land.lake[Math.floor(y) * W + Math.floor(x)] === 1;
}
