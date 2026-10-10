// THE SHAPE OF A DUNGEON, IN PLAIN LINES. The owner, 9 Oct 2026, 17:50: "When we made wire frames for
// the skeletons something was said about wire frames for the dungeons.  Is that something we can do?";
// and, asked "Should I make that picture of a dungeon's shape once 19.9 is live?", by 18:28: "Yes, after
// 19.9 (Recommended)". A dev page, a picture only: NOTHING OF THE GAME CHANGES.
//
// One real dungeon of the game, laid as the game lays it (game/dungeon.ts generateFloor), seen from the
// game's camera but drawn in plain lines: the floor; raised and sunken floor, and the sides of each step
// up; stairs; the walls the game paints (render/walls.ts: a wall is its faces alone, `wallFaces`, and a
// wall that would hide floor is left out, `wallsAway`), the solid part of each face outlined and the part
// at its top that fades into the dark dashed; the flat wall across a corner cut away; doors and gates;
// what stands there today. And THE SPOTS WHERE A DECORATION FITS, found by rules written here:
//   - GREEN, a stretch of wall two faces wide or more whose solid part is whole: the floor before it is a
//     whole tile, not raised and not a stair, and no doorway, lever or trap is within a tile of it: a
//     banner, a tapestry, a row of shields;
//   - VIOLET, a single such face: a torch, a small gargoyle head high on the wall;
//   - BLUE, floor along a back wall, a whole tile, not a stair, no doorway, lever or trap within a tile,
//     nothing standing on it today: bones, rubble, a statue, a pillar.
//
//   node tools/preview.mjs src/dev/preview_frame.ts shots/frame.png 1600 1200 "3:7:20:10:44:34:2"
//   hash: depth:seed:x0:y0:x1:y1:zoom (the window of tiles shown, both ends in; zoom: screen pixels per
//   game pixel); "3:7:all:1" the whole level. The page prints what it counted as [log] lines.
//   "3:23:cam:31.5:98.5:500:320:2": THE GAME'S OWN VIEW, the screen W by H game pixels with the hero
//   standing at (hx, hy) on low floor, placed as render.ts places it (cam.ox, cam.oy): the picture alone,
//   W*zoom by H*zoom, to lay beside a photo of the game taken with the hero there
//   (tools/scenarios/frame_photo.mjs; the playtest's --size W*zoom x H*zoom at dpr 1 gives that view).
import { WALL_LOOK } from '../art/ground';
import { LEDGE_H, LOW_WALL_H, PIT_DEPTH } from '../engine/iso';
import { generateFloor } from '../game/dungeon';
import { doorTiles, isLeaf } from '../game/doors';
import { STAIR_N, STAIR_W } from '../game/height';
import { CUT_FAR, CUT_FAR_LOW, CUT_LEFT, CUT_LEFT_LOW, CUT_NEAR, CUT_NEAR_LOW, CUT_RIGHT, CUT_RIGHT_LOW, T_FLOOR, T_PIT, T_WALL } from '../game/types';
import type { Floor, PropKind } from '../game/types';
import { FACE_LEFT, FACE_RIGHT, wallFaces, wallsAway } from '../render/walls';

/** The colours: a dark ground, plain light lines; the three kinds of spot in colours that are none of the game's glows (no cyan, no pink or gold). */
const C = {
  bg: '#11132a',
  floor: '#1a1e3d',
  floorLine: '#4e5688',
  raised: '#242a55',
  raisedLine: '#9aa3d8',
  sunken: '#151830',
  side: '#181c3a',
  sideLine: '#8b93c9',
  wall: '#20244a',
  wallLine: '#d6dbf7',
  fadeLine: '#6d75a8',
  stair: '#c3c9ee',
  door: '#ffffff',
  prop: '#9ea4bd',
  hazard: '#6b6f8a',
  green: '#78df8a',
  violet: '#b98cff',
  blue: '#7db1ff',
  text: '#e9ecff',
  muted: '#a3abd8',
};

type Pt = readonly [number, number];

/** The game's own view: the hero at (hx, hy), the screen vw by vh game pixels. */
type View = { hx: number; hy: number; vw: number; vh: number };

function parse(): { depth: number; seed: number; win: [number, number, number, number] | null; view: View | null; zoom: number } {
  const p = decodeURIComponent(location.hash.replace(/^#/, '') || '3:7:all:1').split(':');
  const depth = Number(p[0]) || 3;
  const seed = Number(p[1]) || 7;
  if (p[2] === 'all') return { depth, seed, win: null, view: null, zoom: Number(p[3]) || 1 };
  if (p[2] === 'cam') return { depth, seed, win: null, view: { hx: Number(p[3]), hy: Number(p[4]), vw: Number(p[5]), vh: Number(p[6]) }, zoom: Number(p[7]) || 2 };
  return { depth, seed, win: [Number(p[2]), Number(p[3]), Number(p[4]), Number(p[5])], view: null, zoom: Number(p[6]) || 2 };
}

/** The half of a cut tile that is wall, as one of the four (a low cut as its whole kind), and whether the wall there is a low one. */
function cutKind(c: number): { k: number; low: boolean } {
  if (c === CUT_FAR_LOW) return { k: CUT_FAR, low: true };
  if (c === CUT_NEAR_LOW) return { k: CUT_NEAR, low: true };
  if (c === CUT_LEFT_LOW) return { k: CUT_LEFT, low: true };
  if (c === CUT_RIGHT_LOW) return { k: CUT_RIGHT, low: true };
  return { k: c, low: false };
}

function main(): void {
  const { depth, seed, win, view, zoom: Z } = parse();
  const f: Floor = generateFloor(depth, seed);
  const W = f.w;
  const at = (x: number, y: number): number => y * W + x;
  const inMap = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < f.h;
  const [x0, y0, x1, y1] = win ?? [0, 0, W - 1, f.h - 1];
  const tall = WALL_LOOK.tall;
  // (the game's own view: where render.ts puts the world when the hero stands at (hx, hy) on low floor
  // and nothing covers the screen: the hero's feet 12 game pixels below its middle)
  const camOx = view ? Math.round(view.vw / 2 - (view.hx - view.hy) * 16) : 0;
  const camOy = view ? Math.round(view.vh / 2 + 12 - (view.hx + view.hy) * 8) : 0;
  const inView = (x: number, y: number): boolean => {
    if (!view) return true;
    const l = camOx + (x - y - 1) * 16; const r = camOx + (x - y + 1) * 16;
    const t = camOy + (x + y) * 8 - tall - 2 * LEDGE_H; const b = camOy + (x + y + 2) * 8 + PIT_DEPTH;
    return r > 0 && l < view.vw && b > 0 && t < view.vh;
  };
  const inWin = (x: number, y: number): boolean => x >= x0 && y >= y0 && x <= x1 && y <= y1 && inView(x, y);
  const away = wallsAway(f, WALL_LOOK);
  const solidTop = WALL_LOOK.tall - WALL_LOOK.fade;
  const level = (x: number, y: number): number => (inMap(x, y) && f.height ? f.height[at(x, y)] : 0);
  const stair = (x: number, y: number): number => (inMap(x, y) && f.stair ? f.stair[at(x, y)] : 0);
  const cut = (x: number, y: number): number => (inMap(x, y) && f.cut ? f.cut[at(x, y)] : 0);
  const tile = (x: number, y: number): number => (inMap(x, y) ? f.tiles[at(x, y)] : 0);
  const isFloor = (x: number, y: number): boolean => tile(x, y) === T_FLOOR;

  // ---- what is near a doorway, a lever or a trap (kept clear) ----------------------------------------
  const busy = new Uint8Array(W * f.h);
  const doorTile = new Uint8Array(W * f.h);
  const mark = (x: number, y: number, r: number): void => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (inMap(x + dx, y + dy)) busy[at(x + dx, y + dy)] = 1;
  };
  for (const d of f.doors ?? []) {
    for (const i of doorTiles(f, d)) {
      doorTile[i] = d.kind === 'door' ? 1 : 2;
      mark(i % W, Math.floor(i / W), 1);
    }
  }
  for (const l of f.levers ?? []) mark(Math.floor(l.x), Math.floor(l.y), 1);
  const hazardTile = new Uint8Array(W * f.h);
  for (const h of f.hazards ?? []) {
    for (let y = h.y; y < h.y + h.h; y++) for (let x = h.x; x < h.x + h.w; x++) if (inMap(x, y)) { hazardTile[at(x, y)] = 1; mark(x, y, 1); }
  }
  const propAt = new Map<number, PropKind>();
  for (const p of f.props) propAt.set(at(p.x, p.y), p.kind);

  // ---- the spots ------------------------------------------------------------------------------------
  /** A face of a standing wall at (x, y), turned to `face`, that a decoration fits on (its floor before it as above). */
  const faceFits = (x: number, y: number, face: number): boolean => {
    if (tile(x, y) !== T_WALL || away[at(x, y)] || !(wallFaces(f, at(x, y)) & face)) return false;
    const fx = face === FACE_LEFT ? x : x + 1;
    const fy = face === FACE_LEFT ? y + 1 : y;
    if (!isFloor(fx, fy) || cut(fx, fy) !== 0 || stair(fx, fy) !== 0 || level(fx, fy) > 0) return false;
    if (busy[at(fx, fy)] || busy[at(x, y)]) return false;
    return true;
  };
  type Run = { face: number; tiles: [number, number][] }; // face: FACE_LEFT, FACE_RIGHT, or FLAT (below)
  const runs: Run[] = [];
  const seenL = new Uint8Array(W * f.h);
  const seenR = new Uint8Array(W * f.h);
  for (let y = 0; y < f.h; y++) {
    for (let x = 0; x < W; x++) {
      if (!seenL[at(x, y)] && faceFits(x, y, FACE_LEFT)) {
        const run: Run = { face: FACE_LEFT, tiles: [] };
        for (let k = x; k < W && faceFits(k, y, FACE_LEFT); k++) { seenL[at(k, y)] = 1; run.tiles.push([k, y]); }
        runs.push(run);
      }
      if (!seenR[at(x, y)] && faceFits(x, y, FACE_RIGHT)) {
        const run: Run = { face: FACE_RIGHT, tiles: [] };
        for (let k = y; k < f.h && faceFits(x, k, FACE_RIGHT); k++) { seenR[at(x, k)] = 1; run.tiles.push([x, k]); }
        runs.push(run);
      }
    }
  }
  /** THE FLAT WALL ACROSS A CORNER CUT AWAY (a floor tile whose far half is wall) that a decoration fits on: it faces the eye. */
  const FLAT = 3;
  const flatFits = (x: number, y: number): boolean => {
    if (!isFloor(x, y) || away[at(x, y)]) return false;
    const c = cutKind(cut(x, y));
    if (c.k !== CUT_FAR || c.low || stair(x, y) !== 0 || level(x, y) > 0 || busy[at(x, y)]) return false;
    return true;
  };
  const seenF = new Uint8Array(W * f.h);
  for (let y = 0; y < f.h; y++) {
    for (let x = 0; x < W; x++) {
      if (seenF[at(x, y)] || !flatFits(x, y)) continue;
      // (a run of them goes on to the upper right: the next one's left corner is this one's right)
      let sx0 = x; let sy0 = y;
      while (inMap(sx0 - 1, sy0 + 1) && flatFits(sx0 - 1, sy0 + 1)) { sx0--; sy0++; }
      const run: Run = { face: FLAT, tiles: [] };
      for (let k = 0; inMap(sx0 + k, sy0 - k) && flatFits(sx0 + k, sy0 - k); k++) { seenF[at(sx0 + k, sy0 - k)] = 1; run.tiles.push([sx0 + k, sy0 - k]); }
      runs.push(run);
    }
  }
  /** Floor along a back wall that a decoration fits on. */
  const floorFits = (x: number, y: number): boolean => {
    if (!isFloor(x, y) || cut(x, y) !== 0 || stair(x, y) !== 0 || busy[at(x, y)] || propAt.has(at(x, y))) return false;
    const backL = tile(x, y - 1) === T_WALL && !away[at(x, y - 1)] && (wallFaces(f, at(x, y - 1)) & FACE_LEFT) !== 0;
    const backR = tile(x - 1, y) === T_WALL && !away[at(x - 1, y)] && (wallFaces(f, at(x - 1, y)) & FACE_RIGHT) !== 0;
    return backL || backR;
  };
  const floorSpots: [number, number][] = [];
  for (let y = 0; y < f.h; y++) for (let x = 0; x < W; x++) if (floorFits(x, y)) floorSpots.push([x, y]);
  // (what is counted as shown: in the window; and in the game's view, the middle of the spot on the
  // screen, so that the counts are of what can be seen)
  const liftOf = (x: number, y: number): number => (tile(x, y) === T_PIT ? -PIT_DEPTH : level(x, y) * LEDGE_H);
  const onScreen = (wx0: number, wy0: number, h: number): boolean => {
    if (!view) return true;
    const sx = camOx + (wx0 - wy0) * 16; const sy = camOy + (wx0 + wy0) * 8 - h;
    return sx >= 0 && sx <= view.vw && sy >= 0 && sy <= view.vh;
  };
  const faceSeen = (x: number, y: number, face: number): boolean => {
    if (!inWin(x, y)) return false;
    const [a, b]: [Pt, Pt] = face === FACE_LEFT ? [[x, y + 1], [x + 1, y + 1]] : face === FACE_RIGHT ? [[x + 1, y], [x + 1, y + 1]] : [[x, y + 1], [x + 1, y]];
    const lo = face === FLAT ? Math.max(0, liftOf(x, y)) : Math.max(0, liftOf(face === FACE_LEFT ? x : x + 1, face === FACE_LEFT ? y + 1 : y));
    return onScreen((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (lo + WALL_LOOK.tall - WALL_LOOK.fade) / 2);
  };
  const shownRuns = runs.filter((r) => r.tiles.some(([x, y]) => faceSeen(x, y, r.face)));
  const wide = shownRuns.filter((r) => r.tiles.length >= 2);
  const single = shownRuns.filter((r) => r.tiles.length === 1);
  const shownFloor = floorSpots.filter(([x, y]) => inWin(x, y) && onScreen(x + 0.5, y + 0.5, liftOf(x, y)));
  console.log(`dungeon ${depth}, seed ${seed}, ${W} by ${f.h} tiles; ${view ? `the game's view, the hero at ${view.hx},${view.hy}, ${view.vw} by ${view.vh} game pixels (cam ${camOx},${camOy})` : `window ${x0},${y0} to ${x1},${y1}`}`);
  console.log(`whole level: ${runs.filter((r) => r.tiles.length >= 2).length} wide stretches of wall (${runs.filter((r) => r.tiles.length >= 2).reduce((n, r) => n + r.tiles.length, 0)} faces), ${runs.filter((r) => r.tiles.length === 1).length} single faces, ${floorSpots.length} floor spots, ${f.props.length} things standing today`);
  /** How many of a stretch's faces are in the picture. */
  const facesShown = (rs: Run[]): number => rs.reduce((n, r) => n + r.tiles.filter(([x, y]) => faceSeen(x, y, r.face)).length, 0);
  console.log(`shown: ${wide.length} wide stretches (${facesShown(wide)} faces), ${single.length} single faces, ${shownFloor.length} floor spots`);

  // ---- the canvas -----------------------------------------------------------------------------------
  const HEAD = win ? 206 : 40;
  let minX = Infinity; let maxX = -Infinity; let minY = Infinity; let maxY = -Infinity;
  for (const [cx, cy] of [[x0, y0], [x1 + 1, y0], [x0, y1 + 1], [x1 + 1, y1 + 1]] as const) {
    const px = (cx - cy) * 16;
    const py = (cx + cy) * 8;
    minX = Math.min(minX, px); maxX = Math.max(maxX, px);
    minY = Math.min(minY, py - tall - LEDGE_H); maxY = Math.max(maxY, py + PIT_DEPTH);
  }
  const M = 24;
  // (drawn first on a canvas of the whole window; then what was drawn is cut out, under the title. The
  // game's view is drawn on a canvas of the screen itself, and that is the picture.)
  const cv = document.createElement('canvas');
  cv.width = view ? view.vw * Z : Math.ceil((maxX - minX) * Z + 2 * M);
  cv.height = view ? view.vh * Z : Math.ceil((maxY - minY) * Z + 2 * M);
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = C.bg;
  g.fillRect(0, 0, cv.width, cv.height);
  const ox = view ? camOx * Z : M - minX * Z;
  const oy = view ? camOy * Z : M - minY * Z;
  let bx0 = Infinity; let by0 = Infinity; let bx1 = -Infinity; let by1 = -Infinity;
  /** A place on the floor (world x, y) at `h` game pixels up. */
  const P = (x: number, y: number, h: number): Pt => [ox + (x - y) * 16 * Z, oy + (x + y) * 8 * Z - h * Z];
  const poly = (pts: readonly Pt[], fill: string | null, line: string | null, width = 1, dash: number[] = []): void => {
    for (const [px, py] of pts) { bx0 = Math.min(bx0, px); by0 = Math.min(by0, py); bx1 = Math.max(bx1, px); by1 = Math.max(by1, py); }
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let k = 1; k < pts.length; k++) g.lineTo(pts[k][0], pts[k][1]);
    g.closePath();
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (line) { g.setLineDash(dash.map((d) => d * Z)); g.strokeStyle = line; g.lineWidth = width * Z * 0.5; g.stroke(); g.setLineDash([]); }
  };
  const lift = (x: number, y: number): number => (tile(x, y) === T_PIT ? -PIT_DEPTH : level(x, y) * LEDGE_H);
  /** The height of a floor tile's corner (stairs slope: their head one level up). */
  const cornerH = (x: number, y: number, cx: number, cy: number): number => {
    const base = level(x, y) * LEDGE_H;
    const s = stair(x, y);
    if (s === STAIR_N) return cy === y ? base + LEDGE_H : base;
    if (s === STAIR_W) return cx === x ? base + LEDGE_H : base;
    return base;
  };
  /** A wall face (vertical) along the edge from corner a to corner b, from `lo` to `hi` game pixels; the fading part dashed. */
  const wallFace = (a: Pt, b: Pt, lo: number, hi: number, fadeFrom: number): void => {
    const [ax, ay] = a; const [bx, by] = b;
    const s = Math.min(hi, fadeFrom);
    poly([P(ax, ay, lo), P(bx, by, lo), P(bx, by, s), P(ax, ay, s)], C.wall, C.wallLine, 1.6);
    if (hi > s) {
      poly([P(ax, ay, s), P(bx, by, s), P(bx, by, hi), P(ax, ay, hi)], null, C.fadeLine, 1, [2, 2]);
    }
  };

  // ---- drawn from the back to the front, as the game draws -------------------------------------------
  const order: [number, number][] = [];
  for (let y = y0 - 1; y <= y1 + 1; y++) for (let x = x0 - 1; x <= x1 + 1; x++) if (inMap(x, y)) order.push([x, y]);
  order.sort((p, q) => p[0] + p[1] - (q[0] + q[1]) || p[0] - q[0]);
  for (const [x, y] of order) {
    const t = tile(x, y);
    const i = at(x, y);
    const shown = inWin(x, y);
    if (t === T_WALL) {
      if (away[i] || !shown) continue;
      const faces = wallFaces(f, i);
      if (faces & FACE_LEFT) wallFace([x, y + 1], [x + 1, y + 1], Math.max(0, lift(x, y + 1)), tall, solidTop);
      if (faces & FACE_RIGHT) wallFace([x + 1, y], [x + 1, y + 1], Math.max(0, lift(x + 1, y)), tall, solidTop);
      continue;
    }
    if (!shown || (t !== T_FLOOR && t !== T_PIT)) continue;
    // the sides of a step up, standing on this tile's far edges (the higher tile behind it)
    const me = lift(x, y);
    const behind: [number, number, Pt, Pt][] = [[x - 1, y, [x, y + 1], [x, y]], [x, y - 1, [x, y], [x + 1, y]]];
    for (const [bx, by, a, b] of behind) {
      if (!(tile(bx, by) === T_FLOOR || tile(bx, by) === T_PIT)) continue;
      if (stair(bx, by) || stair(x, y)) continue;
      const them = lift(bx, by);
      if (them > me) poly([P(a[0], a[1], me), P(b[0], b[1], me), P(b[0], b[1], them), P(a[0], a[1], them)], C.side, C.sideLine, 1);
    }
    if (t === T_PIT) {
      poly([P(x, y, -PIT_DEPTH), P(x + 1, y, -PIT_DEPTH), P(x + 1, y + 1, -PIT_DEPTH), P(x, y + 1, -PIT_DEPTH)], '#07080f', C.floorLine, 1);
      continue;
    }
    const lv = level(x, y);
    const fill = lv > 0 ? C.raised : lv < 0 ? C.sunken : C.floor;
    const line = lv !== 0 || stair(x, y) ? C.raisedLine : C.floorLine;
    const corners: Pt[] = [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]];
    const pts = corners.map(([cx, cy]) => P(cx, cy, cornerH(x, y, cx, cy)));
    const c = cutKind(cut(x, y));
    if (c.k === 0) poly(pts, fill, line, 1);
    else {
      // the floor half of a corner cut away; the far half's flat wall faces the eye
      const half = c.k === CUT_FAR ? [pts[1], pts[2], pts[3]] : c.k === CUT_NEAR ? [pts[0], pts[1], pts[3]] : c.k === CUT_LEFT ? [pts[0], pts[1], pts[2]] : [pts[0], pts[2], pts[3]];
      poly(half, fill, line, 1);
      if (c.k === CUT_FAR && !away[i]) wallFace([x, y + 1], [x + 1, y], Math.max(0, me), c.low ? LOW_WALL_H : tall, c.low ? LOW_WALL_H : solidTop);
    }
    // stairs: three step lines across the flight
    const s = stair(x, y);
    if (s) {
      for (const k of [0.25, 0.5, 0.75]) {
        const a: Pt = s === STAIR_N ? [x, y + k] : [x + k, y];
        const b: Pt = s === STAIR_N ? [x + 1, y + k] : [x + k, y + 1];
        const h = lv * LEDGE_H + (1 - k) * LEDGE_H;
        const [p, q] = [P(a[0], a[1], h), P(b[0], b[1], h)];
        g.strokeStyle = C.stair; g.lineWidth = Z * 0.6;
        g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke();
      }
    }
    if (hazardTile[i]) {
      // a trap: hatched
      g.save();
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) g.lineTo(q[0], q[1]); g.closePath(); g.clip();
      g.strokeStyle = C.hazard; g.lineWidth = Z * 0.5;
      for (let k = -40; k <= 40; k += 5) { const [p0x, p0y] = P(x, y, me); g.beginPath(); g.moveTo(p0x + k * Z - 20 * Z, p0y - 20 * Z); g.lineTo(p0x + k * Z + 20 * Z, p0y + 20 * Z); g.stroke(); }
      g.restore();
    }
  }

  // ---- doorways and gates, and what stands there today ---------------------------------------------------
  for (const d of f.doors ?? []) {
    const ts = doorTiles(f, d);
    const way = isLeaf(d.kind) ? [ts[1]] : ts;
    for (const i of way) {
      const x = i % W; const y = Math.floor(i / W);
      if (!inWin(x, y)) continue;
      const h = Math.max(0, lift(x, y));
      poly([P(x, y, h), P(x + 1, y, h), P(x + 1, y + 1, h), P(x, y + 1, h)], null, C.door, 1.4);
      // its two posts, on the line the doorway stands on
      const [a, b]: [Pt, Pt] = d.alongX ? [[x, d.plane], [x + 1, d.plane]] : [[d.plane, y], [d.plane, y + 1]];
      for (const p of [a, b]) {
        const lo = P(p[0], p[1], h); const hi = P(p[0], p[1], h + 30);
        g.strokeStyle = C.door; g.lineWidth = Z * 0.8;
        g.beginPath(); g.moveTo(lo[0], lo[1]); g.lineTo(hi[0], hi[1]); g.stroke();
      }
    }
  }
  for (const p of f.props) {
    if (!inWin(p.x, p.y)) continue;
    const h = Math.max(0, lift(p.x, p.y));
    const [cx, cy] = P(p.x + 0.5, p.y + 0.5, h);
    const flat = p.kind === 'bones' || p.kind === 'rubble';
    g.strokeStyle = C.prop; g.fillStyle = C.prop; g.lineWidth = Z * 0.6;
    if (flat) {
      g.beginPath(); g.moveTo(cx - 3 * Z, cy - 1.5 * Z); g.lineTo(cx + 3 * Z, cy + 1.5 * Z); g.moveTo(cx + 3 * Z, cy - 1.5 * Z); g.lineTo(cx - 3 * Z, cy + 1.5 * Z); g.stroke();
    } else {
      const tallP = p.kind === 'pillar' ? 34 : p.kind === 'brazier' ? 14 : 10;
      g.strokeRect(cx - 3 * Z, cy - tallP * Z, 6 * Z, tallP * Z);
    }
  }

  // ---- the spots, over everything --------------------------------------------------------------------
  const faceSpot = (x: number, y: number, face: number, colour: string): void => {
    const [a, b]: [Pt, Pt] = face === FACE_LEFT ? [[x, y + 1], [x + 1, y + 1]] : face === FACE_RIGHT ? [[x + 1, y], [x + 1, y + 1]] : [[x, y + 1], [x + 1, y]];
    const lo = face === FLAT ? Math.max(0, lift(x, y)) : Math.max(0, lift(face === FACE_LEFT ? x : x + 1, face === FACE_LEFT ? y + 1 : y));
    const inset = 0.12;
    const ia: Pt = [a[0] + (b[0] - a[0]) * inset, a[1] + (b[1] - a[1]) * inset];
    const ib: Pt = [b[0] - (b[0] - a[0]) * inset, b[1] - (b[1] - a[1]) * inset];
    g.globalAlpha = 0.55;
    poly([P(ia[0], ia[1], lo + 3), P(ib[0], ib[1], lo + 3), P(ib[0], ib[1], solidTop - 3), P(ia[0], ia[1], solidTop - 3)], colour, null);
    g.globalAlpha = 1;
    poly([P(ia[0], ia[1], lo + 3), P(ib[0], ib[1], lo + 3), P(ib[0], ib[1], solidTop - 3), P(ia[0], ia[1], solidTop - 3)], null, colour, 1.4);
  };
  // (drawn: every spot in the window, those at the screen's edge cut by it; counted: those seen, above)
  for (const r of runs) for (const [x, y] of r.tiles) if (inWin(x, y)) faceSpot(x, y, r.face, r.tiles.length >= 2 ? C.green : C.violet);
  for (const [x, y] of floorSpots.filter(([x, y]) => inWin(x, y))) {
    const h = lift(x, y);
    const k = 0.28;
    const pts: Pt[] = [P(x + k, y + k, h), P(x + 1 - k, y + k, h), P(x + 1 - k, y + 1 - k, h), P(x + k, y + 1 - k, h)];
    g.globalAlpha = 0.6; poly(pts, C.blue, null); g.globalAlpha = 1; poly(pts, null, C.blue, 1.2);
  }

  // ---- what was drawn, under the title and the key ---------------------------------------------------
  const cw = view ? cv.width : Math.ceil(bx1 - bx0) + 2 * M;
  const ch = view ? cv.height : Math.ceil(by1 - by0) + 2 * M;
  const out = document.createElement('canvas');
  out.width = view ? cw : Math.max(cw, win ? 1180 : 0);
  out.height = view ? ch : ch + HEAD;
  out.style.position = 'static';
  document.body.style.overflow = 'auto';
  document.documentElement.style.overflow = 'auto';
  document.body.style.height = 'auto';
  document.body.style.background = C.bg;
  document.body.appendChild(out);
  const o = out.getContext('2d') as CanvasRenderingContext2D;
  o.fillStyle = C.bg;
  o.fillRect(0, 0, out.width, out.height);
  if (view) o.drawImage(cv, 0, 0);
  else o.drawImage(cv, Math.floor(bx0 - M), Math.floor(by0 - M), cw, ch, Math.floor((out.width - cw) / 2), HEAD, cw, ch);
  console.log(`picture ${out.width} by ${out.height}`);
  if (win) {
    const g = o;
    g.textBaseline = 'top';
    g.fillStyle = C.text;
    g.font = 'bold 26px sans-serif';
    g.fillText(`The shape of a dungeon: dungeon ${depth}, as the game lays it`, M, 16);
    g.font = '17px sans-serif';
    g.fillStyle = C.muted;
    g.fillText('Plain lines: the floor (lighter where it is raised), stairs (lines across), the walls the game paints, their tops', M, 52);
    g.fillText('that fade into the dark dashed, doorways in white. Coloured: where a decoration fits.', M, 74);
    const key: [string, string][] = [
      [C.green, `${wide.length} stretches of wall two faces wide or more (${facesShown(wide)} faces): a banner, a tapestry, shields`],
      [C.violet, `${single.length} single faces: a torch, a small gargoyle head high up`],
      [C.blue, `${shownFloor.length} spots of floor along a back wall, out of the way: bones, rubble, a statue, a pillar`],
      [C.prop, `grey: what stands there today (boxes: barrels, urns, braziers, pillars; crosses: bones, rubble)`],
    ];
    let ky = 106;
    for (const [col, text] of key) {
      g.fillStyle = col;
      g.globalAlpha = col === C.prop ? 1 : 0.8;
      g.fillRect(M, ky + 2, 16, 14);
      g.globalAlpha = 1;
      g.fillStyle = C.text;
      g.fillText(text, M + 24, ky);
      ky += 22;
    }
  }
  (window as unknown as { __ready: boolean }).__ready = true;
}

main();
