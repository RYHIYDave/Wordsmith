// THE GODOT PORT: two places in their CURRENT looks, recorded from the game's own views and painters, for the Godot loader to lay
// out: FLOOR 1 AS THE KING'S TOMB (render/tomb.ts TombView, art/tomb.ts, art/tomb_gate.ts, render/pieces.ts the floor's own pieces)
// and THE TOWN AS THE CASTLE'S HALL (render/castle.ts CastleView, art/castle_hall.ts, art/hall_owl.ts). Every picture the renderer
// (render/render.ts drawWorld) would draw of the place itself, where it would draw it, in which pass and at what depth; not the
// hero, the monsters, the town's people, the wordsmith's ring (the Godot side has its own of those), nor anything of a fight.
//
// Written to godot/assets/looks/, for P = floor1 and town:
//   P.png + P_pics.json: the pictures, two picture pixels to a game pixel; { key: [x, y, w, h, ax, ay] } in picture pixels
//     (ax, ay: where the picture's own anchor falls inside it).
//   P.json: { place, dark: {a, rgb}, vignette, items: [...], doors: [...], lights: [...], pic_lights: {...} }
//     items, each { layer, kind, x, y, d, frames, fps[, t0][, secs][, what][, door] }:
//       layer: "back" (drawn before the floor), "floor", "flat" / "flat_add" (over the floor, the second added, 'lighter'), "stand"
//         / "stand_add" (sorted by d, then by their order in the list: the renderer's own sort);
//       (x, y): the screen point, in game pixels, the picture's anchor is laid on, measured from the screen point of world (0, 0):
//         x = (wx - wy) * 16, y = (wx + wy) * 8 for a world point (wx, wy) on the flat (floor 1's raised ground lifts what stands on
//         it by its height, as the renderer's camera does: render/fx.ts wy);
//       d: the painter's depth for a stand (x + y of its world point plus the renderer's offsets), null for the rest;
//       frames: picture keys; the frame shown at time t (seconds) is frames[floor((t - t0) * fps) mod n] (t0 0 where absent); or,
//         where `secs` is given (the owl), frame i holds secs[i] seconds, the loop beginning at t0;
//       door: on a door's leaf and a gate's portcullis, which of the level's doors it is (drawn by `doors` as it opens).
//     doors: for each of the level's doors and gates, { kind, steps }: what moves of it at each step of its opening from shut to
//       open (a door's leaf at each of the renderer's turns, a gate's portcullis at GATE_STEPS + 1 heights), each step a list of
//       [picture key, x, y, d] as the items have them (recordDoors).
//     The items of the layers back, floor, flat and flat_add are in the renderer's drawing order (floor 1's raised ground and its
//     ledges are drawn after what lies on the low floor: they come in the flat layer, in their place).
//     lights: { type: "hole" | "glow", x, y, r, a, color, flicker?, of? }: a hole is the renderer's `spot` (render.ts light: the
//       pool cut out of the dark, an ellipse 2r wide and 1.24r high round (x, y), strength a); a glow its `drawGlow` (a round pool
//       of `color` 2r across, added, alpha a) drawn over the dark. flicker: the renderer adds sin(...) * flicker to r.
//     pic_lights: { key: [[dx, dy, r, a, color], ...] }: the lights a picture gives off (Sprite.lights), from its anchor in game
//       pixels, drawn added over the dark wherever an item shows that picture (render.ts propLit, drawLights).
//   P_preview.png: the items laid as above (and the dark with its lights, the hero's own pools where he starts), a picture pixel
//     to a picture pixel, cropped to the hall / to the stretch of floor 1 round its gate up to the town.
//   npx tsx tools/godot_looks.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { Game } from '../src/game/game';
import type { Level } from '../src/game/state';
import { TombView } from '../src/render/tomb';
import { CastleView, CASTLE_LAID } from '../src/render/castle';
import type { LookView, LookStand } from '../src/render/looks';
import { FloorPieces } from '../src/render/pieces';
import { FloorDress } from '../src/render/dress';
import type { Stage } from '../src/render/dress';
import type { Painter } from '../src/render/painter';
import type { Cam } from '../src/render/fx';
import { makeFilm } from '../src/art/films';
import type { MomentFilm } from '../src/art/films';
import { WALL_LOOK, makeGroundArt, edgesOf } from '../src/art/ground';
import type { GroundArt, WallPart } from '../src/art/ground';
import { DOOR_WALLS, FACE_LEFT, FACE_RIGHT, doorWallsBack, wallFaces, wallsAway, wholeFaces, WHOLE_WALLS } from '../src/render/walls';
import { floorLook, lookGround, lookPieces, lookProps, lookWays, lookStairs } from '../src/art/floors';
import type { Piece } from '../src/art/floor1';
import { makeTombGateArt } from '../src/art/tomb_gate';
import { GATE_UP, PILLAR, POST, STRIP, SWING_STEPS, makeGateArt } from '../src/art/gates';
import type { GateArt, Strip } from '../src/art/gates';
import { makeDungeonProps } from '../src/art/props';
import type { DungeonProps } from '../src/art/props';
import type { TownProps } from '../src/art/town';
import { townSprite, isTownFlat, isTownsperson } from '../src/art/townscene';
import type { TownArt } from '../src/art/townscene';
import { gradeSprite } from '../src/art/tomb';
import { CASTLE_THEME, HALL } from '../src/art/castle_hall';
import { OWL_LOOP } from '../src/art/hall_owl';
import { doorFace, doorTiles, isLeaf } from '../src/game/doors';
import { CUT_FAR, CUT_FAR_LOW, CUT_NEAR, CUT_NEAR_LOW, CUT_LEFT, CUT_LEFT_LOW, T_FLOOR, T_PIT, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';
import { STAIR_N, STAIR_W, levelAt } from '../src/game/height';
import { LEDGE_H } from '../src/engine/iso';
import { TOWN } from '../src/game/level';
import { P } from '../src/art/palette';

declare const process: { argv: string[]; exitCode?: number };
paintWithoutCanvas();
// (the game's own switches, as it starts: tools/godot_switches.ts)
gameSwitches();
const OUT = 'godot/assets/looks';
mkdirSync(OUT, { recursive: true });

// ================================================================================================================================
// PICTURES: the game's own, and the few the renderer makes on a canvas at the moment it draws (a tile clipped to its half, a
// picture stretched to another's size, the soft shadow), made here the same way in plain pixels.

/** A Sprite of a painting made here: its anchor in game pixels, `density` picture pixels to a game pixel. */
function made(p: Px, ax: number, ay: number, density: number): Sprite {
  const s = p.sprite(ax * density, ay * density, density);
  return s;
}

const clips = new WeakMap<Sprite, Map<string, Sprite>>();
/** What of `s` lies inside the rectangle (x0, y0, w, h), game pixels from its top left corner (render.ts halfFloor's clip). */
function clipped(s: Sprite, x0: number, y0: number, w: number, h: number): Sprite {
  let m = clips.get(s);
  if (!m) clips.set(s, (m = new Map()));
  const key = `${x0},${y0},${w},${h}`;
  const had = m.get(key);
  if (had) return had;
  const src = paintingOf(s);
  const dn = s.density ?? 1;
  const out = new Px(src.w, src.h);
  for (let j = 0; j < src.h; j++) {
    const gy = (j + 0.5) / dn;
    if (gy < y0 || gy >= y0 + h) continue;
    for (let i = 0; i < src.w; i++) {
      const gx = (i + 0.5) / dn;
      if (gx < x0 || gx >= x0 + w) continue;
      const o = (j * src.w + i) * 4;
      for (let c = 0; c < 4; c++) out.d[o + c] = src.d[o + c];
    }
  }
  const c = made(out, s.ax, s.ay, dn);
  if (s.lights) c.lights = s.lights;
  m.set(key, c);
  return c;
}

const fits = new WeakMap<Sprite, Map<string, Sprite>>();
/** `s` drawn stretched to w by h game pixels (drawImage with a size of another picture's: the shades laid at a floor tile's size). */
function fitted(s: Sprite, w: number, h: number): Sprite {
  if (Math.abs(w - s.w) < 1e-9 && Math.abs(h - s.h) < 1e-9) return s;
  let m = fits.get(s);
  if (!m) fits.set(s, (m = new Map()));
  const key = `${w}x${h}`;
  const had = m.get(key);
  if (had) return had;
  const src = paintingOf(s);
  const dn = s.density ?? 1;
  const W = Math.round(w * dn);
  const H = Math.round(h * dn);
  const out = new Px(W, H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const o = (Math.min(src.h - 1, Math.floor((j * src.h) / H)) * src.w + Math.min(src.w - 1, Math.floor((i * src.w) / W))) * 4;
    const d = (j * W + i) * 4;
    for (let c = 0; c < 4; c++) out.d[d + c] = src.d[o + c];
  }
  // (its anchor where the drawing puts it: the rectangle's top left is the picture's)
  const f = made(out, (s.ax * w) / s.w, (s.ay * h) / s.h, dn);
  m.set(key, f);
  stretched++;
  return f;
}
let stretched = 0;

const SHADOW = 0.7;
const shadows = new Map<number, Sprite>();
/**
 * THE SOFT SHADOW (render.ts `shadow`: one soft oval, black at its middle, 0.85 at 0.4 of the way out, nothing at its rim, stretched
 * to r * 22.6 * 1.5 either side and r * 11.3 * 1.5 up and down, drawn at 0.7), painted at two picture pixels to a game pixel,
 * anchored at its middle.
 */
function shadowPic(r: number): Sprite {
  const key = Math.round(r * 1000);
  const had = shadows.get(key);
  if (had) return had;
  const w = r * 22.6 * 1.5;
  const hh = r * 11.3 * 1.5;
  const W = Math.max(2, Math.round(w * 4));
  const H = Math.max(2, Math.round(hh * 4));
  const p = new Px(W, H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const u = ((i + 0.5) / W) * 2 - 1;
    const v = ((j + 0.5) / H) * 2 - 1;
    const q = Math.hypot(u, v);
    const g = q >= 1 ? 0 : q < 0.4 ? 1 - (0.15 * q) / 0.4 : 0.85 * ((1 - q) / 0.6);
    p.d[(j * W + i) * 4 + 3] = Math.round(255 * SHADOW * g);
  }
  const s = made(p, W / 4, H / 4, 2);
  shadows.set(key, s);
  return s;
}

// ================================================================================================================================
// THE ATLAS: each picture once (the same pixels and anchor are one picture, whatever object holds them), by a key.

class Atlas {
  private byObj = new Map<Sprite, string>();
  private byHash = new Map<string, string>();
  readonly pics = new Map<string, Sprite>();
  private counts = new Map<string, number>();
  key(s: Sprite, hint: string): string {
    const had = this.byObj.get(s);
    if (had) return had;
    const p = paintingOf(s);
    let sum = 0;
    for (let i = 0; i < p.d.length; i += 7) sum = (sum + p.d[i] * (i + 1)) | 0;
    const h = `${p.w}x${p.h}:${s.ax}:${s.ay}:${s.density ?? 1}:${crc32(p.d)}:${sum}:${s.lights ? JSON.stringify(s.lights) : ''}`;
    let k = this.byHash.get(h);
    if (!k) {
      k = this.fresh(hint);
      this.byHash.set(h, k);
      this.pics.set(k, s);
    }
    this.byObj.set(s, k);
    return k;
  }
  /** A picture under a name of its own (the town's ring pictures, under the names godot/assets/town/pics.json gives them). */
  named(name: string, s: Sprite): void {
    if (this.pics.has(name)) throw new Error(`two pictures named ${name}`);
    this.pics.set(name, s);
    this.counts.set(name, 1);
  }
  private fresh(hint: string): string {
    const n = this.counts.get(hint) ?? 0;
    this.counts.set(hint, n + 1);
    const k = n === 0 ? hint : `${hint} ${n}`;
    if (this.pics.has(k)) return this.fresh(`${hint}~`);
    return k;
  }
}

function png(w: number, h: number, rgba: Uint8ClampedArray | Uint8Array): Uint8Array {
  const raw = new Uint8Array((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1);
  const be = (n: number): number[] => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const chunk = (type: string, data: Uint8Array): Uint8Array => {
    const out = new Uint8Array(12 + data.length);
    const dv = new DataView(out.buffer);
    dv.setUint32(0, data.length);
    for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
    out.set(data, 8);
    dv.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)) >>> 0);
    return out;
  };
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', new Uint8Array([...be(w), ...be(h), 8, 6, 0, 0, 0])), chunk('IDAT', deflateSync(raw, { level: 6 })), chunk('IEND', new Uint8Array(0))];
  const all = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    all.set(p, o);
    o += p.length;
  }
  return all;
}

/** Where each picture is in the sheet, picture pixels: x, y, w, h, ax, ay. */
type At = [number, number, number, number, number, number];
/** Pack the atlas's pictures (shelves, tallest first), each at two picture pixels to a game pixel, and write P.png and P_pics.json. */
function writeSheet(A: Atlas, name: string, width: number): { at: Map<string, At>; px: Uint8ClampedArray; W: number; H: number } {
  const list = [...A.pics.entries()].map(([k, s]) => {
    const p = paintingOf(s);
    const kk = 2 / (s.density ?? 1);
    return { k, s, p, kk, w: Math.round(p.w * kk), h: Math.round(p.h * kk) };
  });
  const W = Math.max(width, ...list.map((q) => q.w));
  list.sort((a, b) => b.h - a.h || b.w - a.w);
  const at = new Map<string, At>();
  let cx = 0;
  let cy = 0;
  let rowH = 0;
  for (const q of list) {
    if (cx + q.w > W) {
      cx = 0;
      cy += rowH + 1;
      rowH = 0;
    }
    at.set(q.k, [cx, cy, q.w, q.h, Math.round(q.s.ax * 2), Math.round(q.s.ay * 2)]);
    cx += q.w + 1;
    rowH = Math.max(rowH, q.h);
  }
  const H = cy + rowH;
  const px = new Uint8ClampedArray(W * H * 4);
  for (const q of list) {
    const [x0, y0, w, h] = at.get(q.k)!;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const o = (Math.min(q.p.h - 1, Math.floor(j / q.kk)) * q.p.w + Math.min(q.p.w - 1, Math.floor(i / q.kk))) * 4;
      const d = ((y0 + j) * W + x0 + i) * 4;
      for (let c = 0; c < 4; c++) px[d + c] = q.p.d[o + c];
    }
  }
  writeFileSync(`${OUT}/${name}.png`, png(W, H, px));
  const keys = [...at.keys()].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  const out: Record<string, At> = {};
  for (const k of keys) out[k] = at.get(k)!;
  writeFileSync(`${OUT}/${name}_pics.json`, JSON.stringify(out));
  return { at, px, W, H };
}

// ================================================================================================================================
// THE RECORDING: a place drawn as render.ts drawWorld draws it, at one moment `t`, into lists in place of a canvas.

type Layer = 'back' | 'floor' | 'flat' | 'flat_add' | 'stand' | 'stand_add';
type Kind = 'roof' | 'floor' | 'shade' | 'edge' | 'wall' | 'wallpiece' | 'prop' | 'strip' | 'light' | 'air' | 'stairs' | 'other';
interface Raw {
  layer: Layer;
  kind: Kind;
  x: number;
  y: number;
  d: number | null;
  s: Sprite;
  hint: string;
  what?: string;
  /** (the owl: its loop as it is, frame by frame and how long each holds, not sampled) */
  fixed?: { frames: Sprite[]; secs: number[]; t0: number };
  /** (a door's leaf, a gate's portcullis: which of the level's doors it is, drawn on the Godot side by `doors` as it opens) */
  door?: number;
}
interface LightOut {
  type: 'hole' | 'glow';
  x: number;
  y: number;
  r: number;
  a: number;
  color: string | null;
  flicker?: number;
  of?: string;
}

interface Relief {
  top: Int16Array;
}

/** All a place's recording needs: the game's Level and the pictures the game has in force there (main.ts placeFrame). */
interface Place {
  name: 'floor1' | 'town';
  game: Game;
  L: Level;
  look: LookView;
  tomb: TombView | null;
  castle: CastleView | null;
  /** art.ground, art.props, art.gates, art.town as main.ts sets them for the place. */
  ground: GroundArt;
  props: DungeonProps;
  gates: GateArt;
  town: TownProps | null;
  ways: ReturnType<typeof lookWays>;
  /** The look's own colours put on one of the game's pictures (render.ts lookGrade: TombView.graded, here without a page). */
  grade: (s: Sprite) => Sprite;
  relief: Relief | null;
  whole: boolean;
  lowGrid: Uint8Array;
  doorBack: Uint8Array | null;
  dressed: boolean;
  pieces: FloorPieces;
  dress: FloorDress;
  cam: Cam;
  vignette: number | null;
  /** The kinds of the look's own stands, by their pictures. */
  standKinds: Map<Sprite, [Kind, string]>;
  owlFrames: Sprite[] | null;
  /** The floor's own pieces' pictures, by name (art/floors.ts lookPieces). */
  pieceNames: Map<Sprite, string>;
}

function cutPart(c: number): WallPart {
  return c === CUT_FAR || c === CUT_FAR_LOW ? 'far' : c === CUT_NEAR || c === CUT_NEAR_LOW ? 'near' : c === CUT_LEFT || c === CUT_LEFT_LOW ? 'left' : 'right';
}
const wx = (c: Cam, x: number, y: number): number => c.ox + (x - y) * 16;
const wy = (c: Cam, x: number, y: number): number => c.oy + (x + y) * 8 - (c.lift ? c.lift(x, y) : 0);

class Recorder {
  readonly back: Raw[] = [];
  readonly floor: Raw[] = [];
  /** flat and flat_add, in drawing order (and floor 1's raised ground, drawn among them) */
  readonly flat: Raw[] = [];
  readonly stand: Raw[] = [];
  constructor(readonly P: Place, readonly t: number) {}
  addBack(kind: Kind, s: Sprite, x: number, y: number, hint: string, what?: string): void {
    this.back.push({ layer: 'back', kind, x, y, d: null, s, hint, what });
  }
  addFloor(kind: Kind, s: Sprite, x: number, y: number, hint: string, what?: string): void {
    this.floor.push({ layer: 'floor', kind, x, y, d: null, s, hint, what });
  }
  addFlat(kind: Kind, s: Sprite, x: number, y: number, add: boolean, hint: string, what?: string): void {
    this.flat.push({ layer: add ? 'flat_add' : 'flat', kind, x, y, d: null, s, hint, what });
  }
  addStand(kind: Kind, d: number, s: Sprite, x: number, y: number, add: boolean, hint: string, what?: string): Raw {
    const r: Raw = { layer: add ? 'stand_add' : 'stand', kind, x: Math.round(x), y: Math.round(y), d, s, hint, what };
    this.stand.push(r);
    return r;
  }
  /** g.drawImage(s.img, X, Y, w, h) on the floor's layer `to`: the picture (stretched if w, h are not its own) with its anchor where that puts it. */
  rect(to: 'floor' | 'flat', kind: Kind, s: Sprite, X: number, Y: number, w: number, h: number, hint: string, what?: string): void {
    const f = fitted(s, w, h);
    if (to === 'floor') this.addFloor(kind, f, X + f.ax, Y + f.ay, hint, what);
    else this.addFlat(kind, f, X + f.ax, Y + f.ay, false, hint, what);
  }
  /** The same, clipped to (cx, cy, cw, ch), game pixels from the screen point (px, py). */
  rectClipped(to: 'floor' | 'flat', kind: Kind, s: Sprite, X: number, Y: number, w: number, h: number, px: number, py: number, clip: [number, number, number, number], hint: string, what?: string): void {
    const f = fitted(s, w, h);
    const c = clipped(f, px + clip[0] - X, py + clip[1] - Y, clip[2], clip[3]);
    if (to === 'floor') this.addFloor(kind, c, X + c.ax, Y + c.ay, hint, what);
    else this.addFlat(kind, c, X + c.ax, Y + c.ay, false, hint, what);
  }
}

/** A painter that has every film made, as the game's has once its workers are done (render/painter.ts): art/films.ts makeFilm, at once. */
function fakePainter(): Painter {
  const films = new Map<string, unknown>();
  return {
    filmOf<T>(key: string): T | null {
      if (!films.has(key)) {
        try {
          films.set(key, makeFilm(key));
        } catch (e) {
          console.warn(`film ${key}: ${(e as Error).message}`);
          films.set(key, null);
        }
      }
      return films.get(key) as T | null;
    },
  } as unknown as Painter;
}

// --- the floor's loop (render.ts drawWorld: "floor, and collect walls"), with floorTile, cutTile, halfFloor and lowEdges ---

function recordScene(P: Place, t: number): Recorder {
  const R = new Recorder(P, t);
  const { L, look, game } = P;
  const f = L.floor;
  const cam = P.cam;
  const G = lookGroundOf(P);
  const relief = P.relief;
  const lowGrid = P.lowGrid;
  // (the stage the floor's own pieces and its ways stand things on: render.ts `stage`)
  let stageKind: Kind = 'other';
  let stageHint = 'piece';
  let stageWhat: string | undefined;
  const stage: Stage = {
    cam,
    stand: (d, s, x, y) => {
      // (the floor's own pieces by their names, where the picture is one of theirs)
      const name = P.pieceNames.get(s);
      R.addStand(stageKind, d, s, x, y, false, name ?? stageHint, name ?? stageWhat);
    },
    veil: () => 1,
    lit: () => {},
    shadow: (_g, x, y, r) => {
      const s = shadowPic(r);
      R.addFlat('other', s, Math.round(x * 100) / 100, Math.round(y * 100) / 100, false, 'soft shadow', 'soft shadow');
    },
  };
  const noCanvas = { drawImage: () => { throw new Error('something drew straight onto the canvas: not recorded'); } } as unknown as CanvasRenderingContext2D;

  // BEHIND EVERYTHING (the castle's roof)
  if (look.back) for (const q of look.back(L, t)) R.addBack('roof', q.s, Math.round(wx(cam, q.x, q.y)), Math.round(wy(cam, q.x, q.y)), 'roof');

  const raised: [number, number, number][] = [];
  for (let s = 0; s <= f.w + f.h - 2; s++) {
    for (let df = -(f.h - 1); df <= f.w - 1; df++) {
      if ((s + df) & 1) continue;
      const tx = (s + df) >> 1;
      const ty = (s - df) >> 1;
      if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) continue;
      const idx = ty * f.w + tx;
      const kind = f.tiles[idx];
      const px = df * 16;
      const py = s * 8;
      // (TRIANGLES: a tile cut corner to corner)
      if (f.cut && f.cut[idx] !== 0 && (kind === T_FLOOR || kind === T_WALL)) {
        const up = !relief ? 0 : kind === T_FLOOR ? Math.max(0, relief.top[idx]) : 0;
        if (kind === T_FLOOR && up > 0) raised.push([idx, px, py]);
        cutTile(R, G, idx, tx, ty, px, py, s, f.cut[idx], kind === T_FLOOR, up);
        continue;
      }
      if (kind === T_FLOOR) {
        if (relief && relief.top[idx] > 0) {
          raised.push([idx, px, py]);
          continue;
        }
        floorTile(R, G, idx, tx, ty, px, py, t);
        if (relief) lowEdges(R, G, idx, tx, ty, px, py);
      } else if (kind === T_PIT) {
        throw new Error('a pit: not brought over');
      } else if (kind === T_WALL) {
        if (WALL_LOOK.faces && !lowGrid[idx]) {
          const faces0 = P.whole ? wholeFaces(f, idx) : wallFaces(f, idx);
          const which = look.unfaced(L, idx, faces0);
          const again = P.doorBack !== null && P.doorBack[idx] === 1;
          if (which & FACE_LEFT) R.addStand('wall', s + 1, look.face(L, true, tx, ty, t), px, py, false, 'face left', again ? 'beside a door' : undefined);
          if (which & FACE_RIGHT) R.addStand('wall', s + 1, look.face(L, false, tx, ty, t), px, py, false, 'face right', again ? 'beside a door' : undefined);
          if (which && P.dressed && !again) {
            stageKind = 'wallpiece';
            stageHint = 'wall piece';
            stageWhat = undefined;
            P.pieces.wall(game, idx, which, s, px, py, t, stage);
          }
          if (which && look.walls && !again) throw new Error('a look with pieces in its walls: not brought over');
        } else if (!(lowGrid[idx] && WALL_LOOK.front === 'none')) {
          throw new Error('a wall of the old look: not brought over');
        }
      }
    }
  }

  // WHAT LIES ON THE FLOOR (render.ts flat; on a level with ledges: the low floor's, the raised floor, the raised floor's)
  if (!relief) flat(R, G, -1, stage, () => { stageKind = 'other'; stageHint = 'piece'; stageWhat = undefined; }, noCanvas);
  else {
    flat(R, G, 0, stage, () => { stageKind = 'other'; stageHint = 'piece'; stageWhat = undefined; }, noCanvas);
    drawRelief(R, G, raised);
    flat(R, G, 1, stage, () => { stageKind = 'other'; stageHint = 'piece'; stageWhat = undefined; }, noCanvas);
  }

  // EVERYTHING THAT STANDS UP (render.ts drawWorld: the props, the doors, the ways, the look's own, the floor's moments)
  for (const p of L.props) {
    const sx = wx(cam, p.x, p.y);
    const sy = wy(cam, p.x, p.y);
    const own = P.dressed ? P.pieces.standing(game, p, t) : undefined;
    const lookOwn = own === undefined && look.own ? look.own(L, p, t) : undefined;
    let sp: Sprite | null = null;
    let hint: string = p.kind;
    let what: string = p.kind;
    if (own !== undefined) {
      sp = own;
      const name = P.pieces.nameOf(p);
      hint = name ?? p.kind;
      what = name ?? p.kind;
    } else if (lookOwn !== undefined) sp = lookOwn;
    else switch (p.kind) {
      case 'brazier': sp = P.props.brazier[(Math.floor(t * 8) + p.variant) % 4]; break;
      case 'chest': sp = p.state === 1 ? P.props.chestOpen : P.props.chest; break;
      case 'barrel': sp = p.state === 0 ? P.props.barrel : null; break;
      case 'urn': sp = p.state === 0 ? P.props.urn : null; break;
      case 'pillar': sp = P.props.pillar; break;
      case 'lever': sp = P.gates.lever(p.state === 1); break;
      case 'portal': sp = p.state === 1 ? P.props.portal[Math.floor(t * 7) % 4] : P.props.portalOff; break;
      default:
        // (the town's people, and the wordsmith's ring and its stones: the Godot side's own)
        if (L.town && (isTownsperson(p.kind) || p.kind === 'runeSlab' || p.kind === 'runeStone')) sp = null;
        else sp = L.town && !isTownFlat(p.kind) && P.town ? townSprite({ town: P.town, folk: null } as unknown as TownArt, p.kind, p.variant, t) : null;
        break;
    }
    if (sp) R.addStand('prop', p.x + p.y, sp, sx, sy, false, hint, what);
  }
  if (L.hazards.length) throw new Error('traps: not brought over');
  standDoors(R);
  // (THE WAYS: the motes over an awake waypoint)
  for (const w of [L.ways?.way]) {
    if (!w || !w.awake) continue;
    const WAY_FRAMES = P.ways.way.motes.length;
    const sp = P.ways.way.motes[Math.floor(t * 10) % WAY_FRAMES];
    R.addStand('other', w.x + w.y, sp, wx(cam, w.x, w.y), wy(cam, w.x, w.y), false, 'waypoint motes', 'waypoint motes');
  }
  if (L.ways) {
    stageKind = 'prop';
    stageHint = 'shaft';
    stageWhat = 'the shaft';
    P.dress.standing(game, stage);
  }
  // (THE LOOK'S OWN: render.ts "what each stands of its own")
  for (const q of look.stands(L, t)) {
    const sx = Math.round(wx(cam, q.x, q.y));
    const sy = Math.round(wy(cam, q.x, q.y));
    const d = q.d ?? q.x + q.y;
    const [kind, name] = standKindOf(P, q);
    const r = R.addStand(kind, d, q.s, sx, sy, !!q.add, name, name);
    if (P.owlFrames && P.owlFrames.includes(q.s)) r.fixed = { frames: OWL_LOOP.map(([fr]) => P.owlFrames![fr]), secs: OWL_LOOP.map(([, s]) => s), t0: 3.1 };
  }
  if (P.dressed) {
    stageKind = 'prop';
    stageHint = 'moment';
    stageWhat = 'a moment';
    P.pieces.standMoments(game, stage);
  }
  return R;
}

function standKindOf(P: Place, q: LookStand): [Kind, string] {
  const k = P.standKinds.get(q.s);
  if (k) return k;
  if (q.add) return ['air', 'air'];
  // (floor 1's archways: strips stood as a gate's are)
  if (P.tomb && q.d !== undefined && Math.abs(q.d - (q.x + q.y + STRIP / 64)) < 1e-9) return ['strip', 'archway'];
  return ['prop', 'look piece'];
}

/** render.ts lookGround: the game's own ground in the look's colours, its floor the look's flags. */
const groundsMade = new Map<Place, GroundArt>();
function lookGroundOf(P: Place): GroundArt {
  const had = groundsMade.get(P);
  if (had) return had;
  const G = P.ground;
  const k = P.grade;
  const ks = (list: Sprite[]): Sprite[] => list.map(k);
  const look = P.look;
  const g: GroundArt = {
    ...G,
    floor: (tx: number, ty: number) => look.flags(tx, ty),
    ledgeLeft: ks(G.ledgeLeft),
    ledgeRight: ks(G.ledgeRight),
    lipLeft: k(G.lipLeft),
    lipRight: k(G.lipRight),
    rimLeft: k(G.rimLeft),
    rimRight: k(G.rimRight),
    stairsN: k(G.stairsN),
    stairsNSide: k(G.stairsNSide),
    stairsW: k(G.stairsW),
    stairsWSide: k(G.stairsWSide),
    pit: k(G.pit),
    pitLeft: ks(G.pitLeft),
    pitRight: ks(G.pitRight),
  };
  groundsMade.set(P, g);
  return g;
}

/** render.ts floorTile: a tile of floor, the shade of the walls at its far sides, the lit edge where a wall toward the eye is left out. */
function floorTile(R: Recorder, _G: GroundArt, idx: number, tx: number, ty: number, px: number, py: number, t: number): void {
  const P = R.P;
  const { L, look } = P;
  const f = L.floor;
  const ground = P.ground;
  let sp: Sprite;
  if (P.castle) {
    // (THE CASTLE'S HALL: its laid tiles are the flags and the tile over them as one picture, made on a page's canvas
    // (render/castle.ts laid): here the two, the tile laid over the flags at the same anchor, as that picture is made)
    sp = look.flags(tx, ty);
    R.addFloor('floor', sp, px, py, 'hall flags');
    const n = laidAt.get(ty * 1000 + tx);
    const over = n ? P.castle.A().tiles.find((q) => q.name === n)?.frames?.[0] : undefined;
    if (over) {
      // (laid with its anchor on the flags' anchor, inside the flags' picture: what of it falls outside is not in the one picture)
      const inside = Math.abs(over.ax - sp.ax) < 1e-9 && Math.abs(over.ay - sp.ay) < 1e-9 && Math.abs(over.w - sp.w) < 1e-9 && Math.abs(over.h - sp.h) < 1e-9;
      const o = inside ? over : clipped(over, over.ax - sp.ax, over.ay - sp.ay, sp.w, sp.h);
      R.addFloor('floor', o, px, py, `hall ${n}`, n);
    }
  } else {
    const laid = look.laid(L, tx, ty, t);
    const own = !laid && P.dressed ? P.pieces.tile(idx) : null;
    sp = laid || own || look.flags(tx, ty);
    R.addFloor('floor', sp, px, py, laid ? 'tomb tile' : own ? 'floor piece' : 'tomb flags');
  }
  const gone = WALL_LOOK.away && WALL_LOOK.front === 'none';
  const lowGrid = P.lowGrid;
  const wl = tx > 0 && f.tiles[idx - 1] === T_WALL && !(gone && lowGrid[idx - 1]);
  const wr = ty > 0 && f.tiles[idx - f.w] === T_WALL && !(gone && lowGrid[idx - f.w]);
  const X = px - sp.ax;
  const Y = py - sp.ay;
  if (wl) R.rect('floor', 'shade', ground.shadeLeft, X, Y, sp.w, sp.h, 'shade left');
  if (wr) R.rect('floor', 'shade', ground.shadeRight, X, Y, sp.w, sp.h, 'shade right');
  if (!wl && !wr && tx > 0 && ty > 0 && f.tiles[idx - f.w - 1] === T_WALL) R.rect('floor', 'shade', ground.shadeCorner, X, Y, sp.w, sp.h, 'shade corner');
  if (WALL_LOOK.front === 'none') {
    if (tx + 1 < f.w && f.tiles[idx + 1] === T_WALL && lowGrid[idx + 1]) R.rect('floor', 'edge', ground.edgeRight, X, Y, sp.w, sp.h, 'edge right');
    if (ty + 1 < f.h && f.tiles[idx + f.w] === T_WALL && lowGrid[idx + f.w]) R.rect('floor', 'edge', ground.edgeLeft, X, Y, sp.w, sp.h, 'edge left');
  }
}
const laidAt = new Map<number, string>();
for (const [n, list] of CASTLE_LAID) for (const [x, y] of list) laidAt.set(y * 1000 + x, n);

/** render.ts lowEdges: on a level with ledges, the shade higher ground throws on a tile of the low floor. */
function lowEdges(R: Recorder, G: GroundArt, idx: number, tx: number, ty: number, px: number, py: number): void {
  const f = R.P.L.floor;
  const top = R.P.relief!.top;
  const e = G.shadeLeft;
  const X = px - e.ax;
  const Y = py - e.ay;
  const st = f.stair;
  const own = top[idx];
  if (tx > 0 && top[idx - 1] > own && !(st && st[idx - 1] === STAIR_W)) R.rect('floor', 'shade', G.shadeLeft, X, Y, e.w, e.h, 'shade left');
  if (ty > 0 && top[idx - f.w] > own && !(st && st[idx - f.w] === STAIR_N)) R.rect('floor', 'shade', G.shadeRight, X, Y, e.w, e.h, 'shade right');
  if ((tx > 0 && f.tiles[idx - 1] === T_PIT) || (ty > 0 && f.tiles[idx - f.w] === T_PIT) || (tx < f.w - 1 && f.tiles[idx + 1] === T_PIT) || (ty < f.h - 1 && f.tiles[idx + f.w] === T_PIT)) throw new Error('a pit: not brought over');
}

/** render.ts halfFloor: the half of a cut tile that is floor, clipped along the cut, with the shadows over it. */
function halfFloor(R: Recorder, G: GroundArt, to: 'floor' | 'flat', idx: number, tx: number, ty: number, px: number, py: number, part: WallPart): void {
  const P = R.P;
  const f = P.L.floor;
  const sp = P.look.flags(tx, ty);
  const clip: [number, number, number, number] = part === 'far' ? [-16, 8, 32, 9] : part === 'near' ? [-16, -1, 32, 9] : part === 'left' ? [0, -1, 17, 18] : [-17, -1, 17, 18];
  const X = px - sp.ax;
  const Y = py - sp.ay;
  R.rectClipped(to, 'floor', sp, X, Y, sp.w, sp.h, px, py, clip, 'half flags', 'half a tile');
  const gone = WALL_LOOK.away && WALL_LOOK.front === 'none' && P.lowGrid[idx] === 1;
  if (part === 'far' && !gone) R.rectClipped(to, 'shade', G.shadeAcross, X, Y, sp.w, sp.h, px, py, clip, 'half shade across');
  const wl = tx > 0 && f.tiles[idx - 1] === T_WALL && !(f.cut && f.cut[idx - 1] !== 0);
  const wr = ty > 0 && f.tiles[idx - f.w] === T_WALL && !(f.cut && f.cut[idx - f.w] !== 0);
  if (wl) R.rectClipped(to, 'shade', G.shadeLeft, X, Y, sp.w, sp.h, px, py, clip, 'half shade left');
  if (wr) R.rectClipped(to, 'shade', G.shadeRight, X, Y, sp.w, sp.h, px, py, clip, 'half shade right');
}

/** render.ts cutTile (THE WALLS' LOOK with faces; WHOLE_WALLS where it is on): a tile cut corner to corner. */
function cutTile(R: Recorder, G: GroundArt, idx: number, tx: number, ty: number, px: number, py: number, s: number, c: number, floor: boolean, up: number): void {
  const P = R.P;
  const part = cutPart(c);
  if (floor && up <= 0) halfFloor(R, G, 'floor', idx, tx, ty, px, py, part);
  if (!WALL_LOOK.faces) throw new Error('the old walls: not brought over');
  if (!floor) return;
  if (P.whole && (part === 'far' || part === 'near')) {
    const sp = P.grade(G.part[part].tall);
    const depth = s + (part === 'far' ? 0.66 : 1.34);
    if (part === 'near' && up <= 0) {
      const fl = G.floor(tx, ty);
      R.rect('floor', 'edge', G.edgeAcross, px - fl.ax, py - fl.ay, fl.w, fl.h, 'edge across');
    }
    R.addStand('wall', depth, sp, px, py - Math.max(0, up), false, `slanting wall ${part}`, 'slanting wall');
    return;
  }
  if (part !== 'far') {
    if (up <= 0) {
      const fl = G.floor(tx, ty);
      const e = part === 'near' ? G.edgeAcross : part === 'left' ? G.edgeUpRight : G.edgeUpLeft;
      R.rect('floor', 'edge', e, px - fl.ax, py - fl.ay, fl.w, fl.h, part === 'near' ? 'edge across' : part === 'left' ? 'edge up right' : 'edge up left');
    }
    return;
  }
  throw new Error('a slanting wall of the old look: not brought over');
}

/** render.ts drops: does the ground drop away from a raised tile toward (dx, dy)? */
function drops(f: Floor, idx: number, tx: number, ty: number, dx: number, dy: number): boolean {
  const nx = tx + dx;
  const ny = ty + dy;
  if (nx < 0 || ny < 0 || nx >= f.w || ny >= f.h) return false;
  const j = ny * f.w + nx;
  if (f.tiles[j] === T_PIT) return true;
  if (f.tiles[j] !== T_FLOOR) return false;
  const mine = f.height ? f.height[idx] : 0;
  const its = f.height ? f.height[j] : 0;
  const sn = f.stair ? f.stair[j] : 0;
  if ((sn === STAIR_N && dx === 0 && dy === 1) || (sn === STAIR_W && dx === 1 && dy === 0)) return its + 1 < mine;
  return its < mine;
}

/** render.ts drawRelief: the raised floor and the stairs (no pits on these floors), after what lies on the low floor. */
function drawRelief(R: Recorder, G: GroundArt, raised: [number, number, number][]): void {
  const P = R.P;
  const f = P.L.floor;
  const top = P.relief!.top;
  for (const [idx, px, py] of raised) {
    const tx = idx % f.w;
    const ty = (idx - tx) / f.w;
    const base = (f.height ? f.height[idx] : 0) * LEDGE_H;
    const c = f.cut ? f.cut[idx] : 0;
    if (c !== 0) {
      // (raisedHalf)
      const part = cutPart(c);
      halfFloor(R, G, 'flat', idx, tx, ty, px, py - base, part);
      const sp = G.floor(tx, ty);
      const X = px - sp.ax;
      const Y = py - base - sp.ay;
      const v = f.variant[idx];
      if ((part === 'far' || part === 'right') && drops(f, idx, tx, ty, 0, 1)) {
        const e = G.ledgeLeft[v % G.ledgeLeft.length];
        R.rect('flat', 'edge', e, px - e.ax, py - base - e.ay, e.w, e.h, 'ledge left', 'ledge');
        R.rect('flat', 'edge', G.lipLeft, X, Y, sp.w, sp.h, 'lip left', 'ledge');
      }
      if ((part === 'far' || part === 'left') && drops(f, idx, tx, ty, 1, 0)) {
        const e = G.ledgeRight[v % G.ledgeRight.length];
        R.rect('flat', 'edge', e, px - e.ax, py - base - e.ay, e.w, e.h, 'ledge right', 'ledge');
        R.rect('flat', 'edge', G.lipRight, X, Y, sp.w, sp.h, 'lip right', 'ledge');
      }
      continue;
    }
    const st = f.stair ? f.stair[idx] : 0;
    if (st !== 0) {
      const j = st === STAIR_N ? idx + 1 : idx + f.w;
      const beside = f.tiles[j];
      const sameFlight = beside === T_FLOOR && f.stair !== undefined && f.stair[j] === st && (f.height ? f.height[j] : 0) * LEDGE_H === base;
      const open = beside === T_PIT || (beside === T_FLOOR && !sameFlight && top[j] <= base);
      const sp = st === STAIR_N ? (open ? G.stairsNSide : G.stairsN) : open ? G.stairsWSide : G.stairsW;
      R.rect('flat', 'floor', sp, px - sp.ax, py - base - sp.ay, sp.w, sp.h, 'steps', 'steps');
      continue;
    }
    const sp = G.floor(tx, ty);
    const X = px - sp.ax;
    const Y = py - base - sp.ay;
    R.rect('flat', 'floor', sp, X, Y, sp.w, sp.h, 'tomb flags', 'raised');
    const wl = tx > 0 && f.tiles[idx - 1] === T_WALL;
    const wr = ty > 0 && f.tiles[idx - f.w] === T_WALL;
    if (wl) R.rect('flat', 'shade', G.shadeLeft, X, Y, sp.w, sp.h, 'shade left');
    if (wr) R.rect('flat', 'shade', G.shadeRight, X, Y, sp.w, sp.h, 'shade right');
    if (!wl && !wr && tx > 0 && ty > 0 && f.tiles[idx - f.w - 1] === T_WALL) R.rect('flat', 'shade', G.shadeCorner, X, Y, sp.w, sp.h, 'shade corner');
    const v = f.variant[idx];
    if (drops(f, idx, tx, ty, 0, 1)) {
      const e = G.ledgeLeft[v % G.ledgeLeft.length];
      R.rect('flat', 'edge', e, px - e.ax, py - base - e.ay, e.w, e.h, 'ledge left', 'ledge');
      R.rect('flat', 'edge', G.lipLeft, X, Y, sp.w, sp.h, 'lip left', 'ledge');
    }
    if (drops(f, idx, tx, ty, 1, 0)) {
      const e = G.ledgeRight[v % G.ledgeRight.length];
      R.rect('flat', 'edge', e, px - e.ax, py - base - e.ay, e.w, e.h, 'ledge right', 'ledge');
      R.rect('flat', 'edge', G.lipRight, X, Y, sp.w, sp.h, 'lip right', 'ledge');
    }
    if ((tx > 0 && f.tiles[idx - 1] === T_PIT) || (ty > 0 && f.tiles[idx - f.w] === T_PIT)) throw new Error('a pit: not brought over');
  }
}

/** render.ts flat: what lies on the floor, for one pass (-1: a level all of one height; 0 the room's own floor; 1 the raised floor). */
function flat(R: Recorder, _G: GroundArt, pass: number, stage: Stage, plain: () => void, noCanvas: CanvasRenderingContext2D): void {
  const P = R.P;
  const { L, game, look } = P;
  const f = L.floor;
  const cam = P.cam;
  const top = P.relief ? P.relief.top : null;
  const here = (x: number, y: number): boolean => {
    if (pass < 0 || !top) return true;
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) return pass === 0;
    const i = ty * f.w + tx;
    const hs = f.height;
    return (hs && hs[i] < 0 ? 2 : top[i] > 0 ? 1 : 0) === pass;
  };
  // (THE WAYS: the stairwell once open, floor 1's stairs up in its gate, the hall's way out through its gate, the waypoint)
  if (L.ways && pass <= 0) flatWays(R);
  plain();
  if (L.ways && pass <= 0) P.dress.flat(noCanvas, game, stage);
  if (P.dressed) P.pieces.shadows(noCanvas, game, stage, here);
  for (const p of L.props) {
    if (!here(p.x, p.y)) continue;
    const sx = Math.round(wx(cam, p.x, p.y));
    const sy = Math.round(wy(cam, p.x, p.y));
    const own = P.dressed ? P.pieces.flat(p) : undefined;
    if (own !== undefined) {
      if (own) R.addFlat('other', own, sx, sy, false, P.pieces.nameOf(p) ?? p.kind, P.pieces.nameOf(p) ?? p.kind);
    } else if (p.kind === 'bones' || p.kind === 'rubble' || ((p.kind === 'barrel' || p.kind === 'urn') && p.state === 1)) {
      const list = p.kind === 'bones' ? P.props.bones : p.kind === 'barrel' ? P.props.staves : p.kind === 'urn' ? P.props.shards : P.props.rubble;
      R.addFlat('other', list[p.variant % list.length], sx, sy, false, p.kind, p.kind);
    } else if (isTownFlat(p.kind)) {
      // (the wordsmith's ring is the Godot side's own; the rug)
      if (p.kind === 'runeRing' || !P.town) continue;
      const sp = townSprite({ town: P.town, folk: null } as unknown as TownArt, p.kind, p.variant, R.t);
      if (sp) R.addFlat('prop', sp, sx, sy, false, p.kind, p.kind);
    } else if (p.kind === 'body') {
      R.addFlat('other', p.state === 1 ? P.props.fallenSearched : P.props.fallen, sx, sy, false, 'fallen wordsmith', 'the fallen wordsmith');
    }
  }
  // (the look's own laid flat, added where it is light: floor 1's pools of daylight, the hall's slats of sun)
  if (look.flats && pass <= 0) {
    for (const q of look.flats(L, R.t)) {
      const sx = Math.round(wx(cam, q.x, q.y));
      const sy = Math.round(wy(cam, q.x, q.y));
      if (q.alpha !== undefined) throw new Error('a flat drawn faint: not brought over');
      R.addFlat('light', q.s, sx, sy, !!q.add, P.tomb ? 'daylight pool' : 'sun slats', P.tomb ? 'daylight on the floor' : 'the sun on the floor');
    }
  }
}

/** render.ts flatWays. */
function flatWays(R: Recorder): void {
  const P = R.P;
  const { L, game } = P;
  const W = L.ways!;
  const cam = P.cam;
  const st = W.stair;
  if (st && st.open && !P.dress.stairPlaying(game)) {
    const sp = (L.town ? (P.castle ? P.castle.A().stairs(st.way) : P.dress.townWays(game)?.stairs) : null) ?? P.ways.stair[st.way];
    R.addFlat('stairs', sp, Math.round(wx(cam, st.x, st.y)), Math.round(wy(cam, st.x, st.y)), false, 'stairs down', 'the stairs down');
  }
  const hall = P.castle ? P.castle.A().gate : null;
  for (const d of L.doors) {
    const s = d.spot;
    const sp = s.kind === 'waygate' ? (hall && L.doors[W.gate] === d ? hall.beyond(s.alongX) : P.dress.stairsUp(game, s)) : null;
    if (!sp) continue;
    const face = doorFace(s);
    const wide = PILLAR / 32;
    const [x, y] = s.alongX ? [s.a - wide, face] : [face, s.a - wide];
    const hallWay = !!hall && L.doors[W.gate] === d;
    R.addFlat(hallWay ? 'other' : 'stairs', sp, Math.round(wx(cam, x, y)), Math.round(wy(cam, x, y)), false, hallWay ? 'gate beyond' : 'stairs up', hallWay ? 'the way out through the gate' : 'the stairs up to the town');
  }
  if (W.onward) throw new Error('a way on: not brought over');
  const w = W.way;
  if (w) {
    const WAY_FRAMES = P.ways.way.awake.length;
    const sp = w.awake ? P.ways.way.awake[Math.floor(R.t * 10) % WAY_FRAMES] : P.ways.way.asleep;
    R.addFlat('other', sp, Math.round(wx(cam, w.x, w.y)), Math.round(wy(cam, w.x, w.y)), false, 'waypoint', 'the waypoint');
  }
}

/** render.ts standDoors: doors and gates, their strips stood one by one along the doorway. */
function standDoors(R: Recorder): void {
  const P = R.P;
  const { L, game } = P;
  const A = P.gates;
  const cam = P.cam;
  let door: number | undefined;
  const put = (depth: number, sp: Sprite, x: number, y: number, hint: string, what: string): void => {
    const r = R.addStand('strip', depth, sp, wx(cam, x, y), wy(cam, x, y), false, hint, what);
    if (door !== undefined) r.door = door;
  };
  for (const [di, d] of L.doors.entries()) {
    const s = d.spot;
    door = undefined;
    const face = doorFace(s);
    const at = (t: number, back = 0): [number, number] => (s.alongX ? [s.a + t, face - back] : [face - back, s.a + t]);
    const strips = (list: Strip[], t0: number, back: number, hint: string, what: string): void => {
      for (const q of list) {
        const [x, y] = at(t0 + q.t, back);
        put(x + y + STRIP / 64, q.s, x, y, hint, what);
      }
    };
    if (s.kind === 'templedoor') throw new Error('the temple door: not brought over');
    if (!isLeaf(s.kind)) {
      const boss = s.kind === 'bossgate';
      const wide = PILLAR / 32;
      const hallGate = P.castle && L.ways && L.doors[L.ways.gate] === d ? P.castle.A().gate : null;
      const pillar = hallGate ? hallGate.pillar : A.pillar(boss);
      const name = boss ? 'boss gate' : s.kind === 'waygate' ? (L.town ? 'town gate' : 'gate up') : 'gate';
      for (const [x, y] of [at(0), at(3 + wide)]) put(x + y - wide, pillar, x, y, `${name} pillar`, `${name}: pillar`);
      if (d.want === 0 && d.fell !== undefined) throw new Error('a gate falling: not brought over');
      door = di;
      if (!P.dress.stairsUp(game, s)) strips(A.portcullis(s.alongX, boss, d.open * GATE_UP), -wide, wide, `${name} portcullis`, `${name}: portcullis`);
      door = undefined;
      if (L.furnace) throw new Error("the Stoker's furnace: not brought over");
      strips(hallGate ? hallGate.arch(s.alongX) : A.arch(s.alongX, boss, false), -wide, 0, `${name} arch`, `${name}: arch`);
      const tw = L.town && L.ways && L.doors[L.ways.gate] === d ? P.dress.townWays(game) : null;
      if (tw && L.ways) {
        const u = L.ways.unbar;
        if (u !== undefined && u !== null && u >= 0) throw new Error('the gate being unbarred: not brought over');
        const bars = L.ways.barred ? tw.bars : tw.left;
        strips(bars, -wide, wide - 0.03, `${name} bars`, L.ways.barred ? `${name}: bars` : `${name}: what is left of the bars`);
      }
      continue;
    }
    const wide = POST / 32;
    for (const [x, y] of [at(1), at(2 + wide)]) put(x + y - wide, A.post, x, y, 'door post', 'door: post');
    strips(A.lintel(s.alongX), 1, 0, 'door lintel', 'door: lintel');
    const turn = ((Math.round(d.open * SWING_STEPS) / SWING_STEPS) * Math.PI) / 2;
    const along = Math.cos(turn);
    const back = Math.sin(turn);
    const dx = s.alongX ? along : -back;
    const dy = s.alongX ? -back : along;
    const [hx, hy] = at(1);
    const ex = Math.round(32 * (dx - dy));
    const ey = Math.round(16 * (dx + dy));
    door = di;
    put(hx + hy + 0.5 * along - 0.2 * back, s.kind === 'worddoor' && s.word ? A.seal(ex, ey, s.word, d.want === 0) : A.leaf(ex, ey), hx, hy, 'door leaf', 'door: leaf');
    door = undefined;
  }
}

/**
 * THE DOORS AS THEY OPEN, for the Godot side (godot/scripts/doors.gd): for each of the level's doors and gates, what standDoors
 * draws of its moving part at each step of its opening, from shut (0) to open (1): a door's leaf at each of the renderer's
 * SWING_STEPS + 1 turns (its depth turning with it), a gate's portcullis strips at GATE_STEPS + 1 heights (none for a way's
 * gate, whose doorway is its stairs). Each step: [picture key, x, y, depth] for each of its pictures, as the items are.
 */
const GATE_STEPS = 20;
interface DoorOut { kind: string; steps: [string, number, number, number][][] }
function recordDoors(P: Place, atlas: Atlas): DoorOut[] {
  const { L, game } = P;
  const A = P.gates;
  const cam = P.cam;
  const r2 = (n: number): number => Math.round(n * 1000) / 1000;
  return L.doors.map((d) => {
    const s = d.spot;
    const face = doorFace(s);
    const at = (t: number, back = 0): [number, number] => (s.alongX ? [s.a + t, face - back] : [face - back, s.a + t]);
    const pic = (depth: number, sp: Sprite, x: number, y: number, hint: string): [string, number, number, number] =>
      [atlas.key(sp, hint), Math.round(wx(cam, x, y)), Math.round(wy(cam, x, y)), r2(depth)];
    const steps: [string, number, number, number][][] = [];
    if (isLeaf(s.kind)) {
      if (s.kind !== 'door') throw new Error('a sealed door: not brought over');
      const [hx, hy] = at(1);
      for (let k = 0; k <= SWING_STEPS; k++) {
        const turn = ((k / SWING_STEPS) * Math.PI) / 2;
        const along = Math.cos(turn);
        const back = Math.sin(turn);
        const dx = s.alongX ? along : -back;
        const dy = s.alongX ? -back : along;
        const ex = Math.round(32 * (dx - dy));
        const ey = Math.round(16 * (dx + dy));
        steps.push([pic(hx + hy + 0.5 * along - 0.2 * back, A.leaf(ex, ey), hx, hy, 'door leaf')]);
      }
    } else if (s.kind !== 'waygate' && !P.dress.stairsUp(game, s)) {
      const boss = s.kind === 'bossgate';
      const wide = PILLAR / 32;
      const name = boss ? 'boss gate' : 'gate';
      for (let k = 0; k <= GATE_STEPS; k++) {
        const step: [string, number, number, number][] = [];
        for (const q of A.portcullis(s.alongX, boss, (k / GATE_STEPS) * GATE_UP)) {
          const [x, y] = at(-wide + q.t, wide);
          step.push(pic(x + y + STRIP / 64, q.s, x, y, `${name} portcullis`));
        }
        steps.push(step);
      }
    }
    return { kind: s.kind, steps };
  });
}

// --- the lights (render.ts light: the dark's holes; the glows over it) ---

function recordLights(P: Place): LightOut[] {
  const { L, look } = P;
  const cam = P.cam;
  const out: LightOut[] = [];
  const r2 = (n: number): number => Math.round(n * 100) / 100;
  for (const q of look.lights(L)) {
    const x = wx(cam, q.x, q.y) + (q.dx ?? 0);
    const y = wy(cam, q.x, q.y) - q.up;
    if (q.strength > 0 && q.r > 0) out.push({ type: 'hole', x: r2(x), y: r2(y), r: q.r, a: q.strength, color: null, ...(q.still ? {} : { flicker: 2 }), of: 'look' });
    if (q.glow) out.push({ type: 'glow', x: r2(x), y: r2(y), r: q.glow.r, a: q.glow.a, color: q.glow.color, ...(q.still ? {} : { flicker: 1.5 }), of: 'look' });
  }
  // (the town's gate lights the floor before it)
  if (L.town && !L.rim) out.push({ type: 'hole', x: r2(wx(cam, TOWN.gate.x, TOWN.gate.y)), y: r2(wy(cam, TOWN.gate.x, TOWN.gate.y) - 14), r: 84, a: 0.9, color: null, flicker: 3, of: 'gate' });
  for (const p of L.props) {
    const x = wx(cam, p.x, p.y);
    const y = wy(cam, p.x, p.y);
    if (p.kind === 'brazier') out.push({ type: 'hole', x: r2(x), y: r2(y - 14), r: 62, a: 0.9, color: null, flicker: 3, of: 'brazier' });
    else if (p.kind === 'portal' && p.state === 1) out.push({ type: 'hole', x: r2(x), y: r2(y - 16), r: 70, a: 0.9, color: null, of: 'portal' });
    else if (p.kind === 'lexicon') out.push({ type: 'hole', x: r2(x), y: r2(y - 14), r: 46, a: 0.8, color: null, flicker: 3, of: 'lexicon' });
    else if (p.kind === 'forge') out.push({ type: 'hole', x: r2(x), y: r2(y - 6), r: 60, a: 0.9, color: null, flicker: 3, of: 'forge' });
    else if (p.kind === 'tentTable') out.push({ type: 'hole', x: r2(x), y: r2(y - 18), r: 56, a: 0.8, color: null, of: 'tentTable' });
    else if (p.kind === 'runeSlab') out.push({ type: 'hole', x: r2(x + 8), y: r2(y - 12), r: 64, a: 0.75, color: null, flicker: 3, of: 'runeSlab (the ring: the Godot side may leave it to its own)' });
  }
  const body = L.body;
  if (body && body.state === 0) out.push({ type: 'hole', x: r2(wx(cam, body.x, body.y)), y: r2(wy(cam, body.x, body.y) - 6), r: 44, a: 0.85, color: null, flicker: 3, of: 'the fallen wordsmith' });
  return out;
}

// ================================================================================================================================
// THE TWO PLACES, as the game has them

/** Every picture of a floor's own pieces, by the piece's name. */
function namesOf(pieces: Map<string, Piece>): Map<Sprite, string> {
  const out = new Map<Sprite, string>();
  for (const [n, pc] of pieces) for (const s of [...(pc.frames ?? []), ...(pc.left ?? []), ...(pc.right ?? []), ...(pc.spots ?? []).flatMap((q) => [...q.left, ...q.right])]) if (!out.has(s)) out.set(s, n);
  return out;
}

/** And the pictures of the floor's moments' films (render/pieces.ts: what is there before each plays), by the moment's name. */
function momentNames(out: Map<Sprite, string>, films: MomentFilm[]): Map<Sprite, string> {
  for (const m of films) for (const s of [...m.frames, ...(m.before ?? []), ...(m.after ?? []), ...(m.right ? [...m.right.frames, ...(m.right.before ?? []), ...(m.right.after ?? [])] : [])]) if (!out.has(s)) out.set(s, `moment: ${m.name}`);
  return out;
}

function tombPlace(): Place {
  const game = new Game('warrior', 1);
  game.depth = 1;
  (game as unknown as { enterDungeon(by?: string): void }).enterDungeon('gate');
  const L = game.level;
  const f = L.floor;
  const tomb = new TombView();
  if (!tomb.on(L)) throw new Error('floor 1 is not the tomb');
  tomb.warm();
  const painter = fakePainter();
  const pieces = new FloorPieces(() => painter);
  const dress = new FloorDress(() => painter);
  const dressed = pieces.begin(game);
  // (render.ts reliefOf)
  let relief: Relief | null = null;
  if (L.step) {
    const top = new Int16Array(f.w * f.h);
    for (let i = 0; i < top.length; i++) {
      if (f.tiles[i] !== T_FLOOR) continue;
      const base = f.height ? f.height[i] : 0;
      top[i] = (base + (f.stair && f.stair[i] !== 0 ? 1 : 0)) * LEDGE_H;
      if (base < 0) throw new Error('sunken floor: not brought over');
    }
    relief = { top };
  }
  const whole = WHOLE_WALLS.on && WALL_LOOK.faces && floorLook(f.depth) >= 1 && floorLook(f.depth) <= 5;
  if (!whole) throw new Error('floor 1 without its walls whole');
  const A = tomb as unknown as { A(): import('../src/art/tomb').TombArt };
  const art = A.A();
  const kinds = new Map<Sprite, [Kind, string]>();
  for (const pc of art.pieces) {
    const k: Kind | null = pc.name === 'water dripping' ? 'air' : pc.name.startsWith('a shaft of daylight') ? 'air' : null;
    if (k) for (const s of pc.frames ?? []) kinds.set(s, [k, pc.name]);
  }
  return {
    name: 'floor1', game, L, look: tomb, tomb, castle: null,
    ground: lookGround(1), props: lookProps(1), gates: makeTombGateArt(), town: null, ways: lookWays(1),
    grade: (s) => gradeSprite(s),
    relief, whole, lowGrid: new Uint8Array(f.w * f.h), doorBack: null, dressed, pieces, dress,
    cam: { ox: 0, oy: 0, lift: relief ? (x: number, y: number) => levelAt(f, x, y) * LEDGE_H : null },
    vignette: 0.62,
    standKinds: kinds, owlFrames: null, pieceNames: momentNames(namesOf(lookPieces(1)), painter.filmOf<MomentFilm[]>('moments:1') ?? []),
  };
}

function hallPlace(): Place {
  const game = new Game('warrior', 1);
  const L = game.level;
  const f = L.floor;
  const castle = new CastleView();
  if (!castle.on(L)) throw new Error('the town is not the hall');
  castle.warm();
  const A = castle.A();
  const painter = fakePainter();
  const pieces = new FloorPieces(() => painter);
  const dress = new FloorDress(() => painter);
  const dressed = pieces.begin(game);
  if (dressed) throw new Error('the town dressed');
  // (render.ts lowWalls: the walls toward the eye left out, those beside a door in a back wall standing again)
  const lowGrid = wallsAway(f, WALL_LOOK);
  let doorBack: Uint8Array | null = null;
  if (DOOR_WALLS.on && WALL_LOOK.faces) {
    const back = doorWallsBack(f, lowGrid);
    for (let i = 0; i < back.length; i++) if (back[i]) lowGrid[i] = 0;
    doorBack = back;
  }
  // (main.ts placeFrame, the hall: its things, its edges in its stone, its braziers, barrels, urn and pillars)
  const vault = { ground: makeGroundArt(), props: makeDungeonProps() };
  const pillar = A.pieces.find((p) => p.name === 'a pillar of the hall')?.frames?.[0] ?? vault.props.pillar;
  const props: DungeonProps = { ...vault.props, brazier: A.props.brazier, barrel: A.props.barrel, urn: A.props.urn, pillar };
  const kinds = new Map<Sprite, [Kind, string]>();
  for (const pc of A.pieces) {
    const k: Kind = pc.name.startsWith('the sun') ? 'air' : pc.name === 'a hammer-beam truss' || pc.name === 'a wall post and brace' ? 'wallpiece' : 'prop';
    for (const s of pc.frames ?? []) kinds.set(s, [k, pc.name]);
  }
  for (const s of A.owl.frames) kinds.set(s, ['prop', 'the owl']);
  return {
    name: 'town', game, L, look: castle, tomb: null, castle,
    ground: { ...vault.ground, ...edgesOf(CASTLE_THEME) }, props, gates: makeGateArt(), town: A.town,
    ways: { stair: lookStairs(1), way: A.way },
    grade: (s) => s,
    relief: null, whole: false, lowGrid, doorBack, dressed, pieces, dress,
    cam: { ox: 0, oy: 0, lift: null },
    vignette: castle.vignette,
    standKinds: kinds, owlFrames: A.owl.frames, pieceNames: new Map(),
  };
}

// ================================================================================================================================
// SAMPLING: the place recorded at t = k / 30, and each item's pictures over time made its frames

interface Anim {
  frames: string[];
  fps: number | null;
  t0?: number;
  secs?: number[];
}
const SAMPLES = 120;
function animOf(seq: string[], label: string): Anim {
  const K = seq.length;
  let per = 0;
  for (let p = 1; p <= K / 2 && !per; p++) {
    let ok = true;
    for (let k = 0; k + p < K && ok; k++) if (seq[k] !== seq[k + p]) ok = false;
    if (ok) per = p;
  }
  if (!per) {
    console.warn(`${label}: no loop within ${K / 30} s: its ${K} frames kept as they are`);
    per = K;
  }
  const S = seq.slice(0, per);
  if (per === 1) return { frames: [S[0]], fps: 30 };
  // (the slowest whole rate that gives these frames at every thirtieth of a second, as frames[floor(t * fps + phase) mod n] does:
  // how the game itself picks them, render.ts and the views; the phase found to within a 120th of a frame)
  const rates = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8, 10, 12, 15];
  for (const R of rates) {
    const nn = (per * R) / 30;
    const n = Math.round(nn);
    if (Math.abs(nn - n) > 1e-9 || n < 2) continue;
    for (let step = -1; step < 120; step++) {
      // (no phase first: most of the game's own run from the clock's 0)
      const ph = step < 0 ? 0 : (step + 0.5) / 120;
      const frames: (string | undefined)[] = new Array(n).fill(undefined);
      let ok = true;
      for (let k = 0; k < per && ok; k++) {
        const j = (((Math.floor((k * R) / 30 + ph) % n) + n) % n);
        if (frames[j] === undefined) frames[j] = S[k];
        else if (frames[j] !== S[k]) ok = false;
      }
      if (ok && frames.every((f) => f !== undefined)) {
        const loop = n / R;
        const t0 = (((-ph / R) % loop) + loop) % loop;
        return { frames: frames as string[], fps: R, ...(t0 > 1e-9 ? { t0: Math.round(t0 * 1e6) / 1e6 } : {}) };
      }
    }
  }
  return { frames: S, fps: 30 };
}

interface ItemOut {
  layer: Layer;
  kind: Kind;
  x: number;
  y: number;
  d: number | null;
  frames: string[];
  fps: number | null;
  t0?: number;
  secs?: number[];
  what?: string;
  door?: number;
}

function recordPlace(P: Place, atlas: Atlas): { items: ItemOut[]; lights: LightOut[] } {
  const runs: Raw[][] = [];
  for (let k = 0; k < SAMPLES; k++) {
    const R = recordScene(P, k / 30);
    runs.push([...R.back, ...R.floor, ...R.flat, ...R.stand]);
  }
  const first = runs[0];
  for (const run of runs) {
    if (run.length !== first.length) throw new Error(`${P.name}: ${run.length} things drawn at one moment and ${first.length} at another`);
    for (let i = 0; i < run.length; i++) {
      const a = run[i];
      const b = first[i];
      if (a.layer !== b.layer || a.x !== b.x || a.y !== b.y || a.d !== b.d || a.kind !== b.kind) throw new Error(`${P.name}: thing ${i} (${b.hint}) moves between moments`);
    }
  }
  const items: ItemOut[] = first.map((a, i) => {
    const r2 = (n: number): number => Math.round(n * 1000) / 1000;
    const base = { layer: a.layer, kind: a.kind, x: r2(a.x), y: r2(a.y), d: a.d === null ? null : r2(a.d), ...(a.door !== undefined ? { door: a.door } : {}) };
    if (a.fixed) {
      const frames = a.fixed.frames.map((s) => atlas.key(s, a.hint));
      return { ...base, frames, fps: null, t0: a.fixed.t0, secs: a.fixed.secs, ...(a.what ? { what: a.what } : {}) };
    }
    const seq = runs.map((run) => atlas.key(run[i].s, a.hint));
    const an = animOf(seq, `${P.name} ${a.hint}`);
    return { ...base, ...an, ...(a.what ? { what: a.what } : {}) };
  });
  return { items, lights: recordLights(P) };
}

// ================================================================================================================================
// THE PREVIEW: the items laid as the renderer lays them, then the dark with its holes and the glows over it

interface Sheet { at: Map<string, At>; px: Uint8ClampedArray; W: number; H: number }
function preview(file: string, items: ItemOut[], lights: LightOut[], picLights: Map<string, [number, number, number, number, string][]>, sheet: Sheet, crop: { x: number; y: number; w: number; h: number }, dark: { a: number; rgb: readonly number[] }, heroPools: { x: number; y: number; r: number; a: number }[]): void {
  const W = Math.round(crop.w * 2);
  const H = Math.round(crop.h * 2);
  const buf = new Float32Array(W * H * 3);
  // (the screen's own black, art/palette.ts P.black)
  const bg = [1, 3, 5].map((k) => parseInt(P.black.slice(k, k + 2), 16) / 255);
  for (let i = 0; i < W * H; i++) for (let c = 0; c < 3; c++) buf[i * 3 + c] = bg[c];
  const frameOf = (it: ItemOut): string => it.frames[0];
  const lay = (key: string, sx: number, sy: number, add: boolean): void => {
    const at = sheet.at.get(key)!;
    const [ax0, ay0, w, h, ax, ay] = at;
    const X = Math.round((sx - crop.x) * 2) - ax;
    const Y = Math.round((sy - crop.y) * 2) - ay;
    if (X >= W || Y >= H || X + w <= 0 || Y + h <= 0) return;
    for (let j = Math.max(0, -Y); j < h && Y + j < H; j++) {
      for (let i = Math.max(0, -X); i < w && X + i < W; i++) {
        const o = ((ay0 + j) * sheet.W + ax0 + i) * 4;
        const a = sheet.px[o + 3] / 255;
        if (a === 0) continue;
        const d = ((Y + j) * W + X + i) * 3;
        for (let c = 0; c < 3; c++) {
          const s = sheet.px[o + c] / 255;
          buf[d + c] = add ? Math.min(1, buf[d + c] + s * a) : s * a + buf[d + c] * (1 - a);
        }
      }
    }
  };
  const order = ['back', 'floor', 'flat'];
  for (const L of order) for (const it of items) if (it.layer === L || (L === 'flat' && it.layer === 'flat_add')) lay(frameOf(it), it.x, it.y, it.layer === 'flat_add');
  const stands = items.map((it, q) => ({ it, q })).filter((o) => o.it.layer === 'stand' || o.it.layer === 'stand_add');
  stands.sort((a, b) => a.it.d! - b.it.d! || a.q - b.q);
  for (const { it } of stands) lay(frameOf(it), it.x, it.y, it.layer === 'stand_add');
  // THE DARK, its holes cut (render.ts light: the pool, 1 at its middle, 0.7 half way out, none at its rim, 2r by 1.24r)
  const D = new Float32Array(W * H).fill(dark.a);
  const holes = [...lights.filter((l) => l.type === 'hole'), ...heroPools.map((p) => ({ ...p, type: 'hole' as const, color: null }))];
  for (const l of holes) {
    const cx = (l.x - crop.x) * 2;
    const cy = (l.y - crop.y) * 2;
    const rx = l.r * 2;
    const ry = l.r * 0.62 * 2;
    for (let j = Math.max(0, Math.floor(cy - ry)); j < Math.min(H, Math.ceil(cy + ry)); j++) {
      for (let i = Math.max(0, Math.floor(cx - rx)); i < Math.min(W, Math.ceil(cx + rx)); i++) {
        const q = Math.hypot((i + 0.5 - cx) / rx, (j + 0.5 - cy) / ry);
        if (q >= 1) continue;
        const g = q < 0.5 ? 1 - 0.6 * q : 1.4 * (1 - q);
        D[j * W + i] *= 1 - Math.min(1, l.a) * g;
      }
    }
  }
  const tint = dark.rgb.map((c) => c / 255);
  for (let i = 0; i < W * H; i++) for (let c = 0; c < 3; c++) buf[i * 3 + c] = tint[c] * D[i] + buf[i * 3 + c] * (1 - D[i]);
  // THE GLOWS over it (drawGlow: 1 at the middle, 0.45 at 0.45 of the way, none at the rim; added), the look's and the pictures' own
  const glow = (x: number, y: number, r: number, a: number, color: string): void => {
    const cx = (x - crop.x) * 2;
    const cy = (y - crop.y) * 2;
    const R2 = r * 2;
    const rgb = [1, 3, 5].map((k) => parseInt(color.slice(k, k + 2), 16) / 255);
    for (let j = Math.max(0, Math.floor(cy - R2)); j < Math.min(H, Math.ceil(cy + R2)); j++) {
      for (let i = Math.max(0, Math.floor(cx - R2)); i < Math.min(W, Math.ceil(cx + R2)); i++) {
        const q = Math.hypot(i + 0.5 - cx, j + 0.5 - cy) / R2;
        if (q >= 1) continue;
        const g = (q < 0.45 ? 1 - (0.55 / 0.45) * q : 0.45 * ((1 - q) / 0.55)) * Math.min(1, a);
        const d = (j * W + i) * 3;
        for (let c = 0; c < 3; c++) buf[d + c] = Math.min(1, buf[d + c] + rgb[c] * g);
      }
    }
  };
  for (const l of lights) if (l.type === 'glow' && l.color) glow(l.x, l.y, l.r, l.a, l.color);
  for (const it of items) {
    const pl = picLights.get(frameOf(it));
    if (!pl) continue;
    for (const [dx, dy, r, a, color] of pl) glow(it.x + dx, it.y + dy, r, a, color);
  }
  const out = new Uint8ClampedArray(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    for (let c = 0; c < 3; c++) out[i * 4 + c] = Math.round(buf[i * 3 + c] * 255);
    out[i * 4 + 3] = 255;
  }
  writeFileSync(file, png(W, H, out));
}

// ================================================================================================================================
// EACH PLACE: recorded, its pictures packed, written, and previewed

function writePlace(P: Place, sheetWidth: number, crop: { x: number; y: number; w: number; h: number }, more?: (A: Atlas) => void): void {
  const t0 = Date.now();
  const atlas = new Atlas();
  const { items, lights } = recordPlace(P, atlas);
  const doors = recordDoors(P, atlas);
  more?.(atlas);
  const sheet = writeSheet(atlas, P.name, sheetWidth);
  const picLights = new Map<string, [number, number, number, number, string][]>();
  for (const [k, s] of atlas.pics) if (s.lights && s.lights.length) picLights.set(k, s.lights.map((l) => [Math.round((l.x - s.ax) * 100) / 100, Math.round((l.y - s.ay) * 100) / 100, l.r, l.a ?? 0.5, l.color]));
  const look = P.look;
  const dark = { a: look.dark, rgb: [...(look.tint ?? [6, 4, 14])] };
  writeFileSync(`${OUT}/${P.name}.json`, JSON.stringify({
    place: P.name,
    dark,
    vignette: P.vignette,
    hero: { x: Math.round(wx(P.cam, P.game.hero.x, P.game.hero.y) * 100) / 100, y: Math.round(wy(P.cam, P.game.hero.x, P.game.hero.y) * 100) / 100, wx: P.game.hero.x, wy: P.game.hero.y },
    items,
    doors,
    lights,
    pic_lights: Object.fromEntries(picLights),
  }));
  const h = P.game.hero;
  const hx = wx(P.cam, h.x, h.y);
  const hy = wy(P.cam, h.x, h.y) - 8;
  // (the hero's own pools, render.ts light: on a dungeon's floor a wide gentle one under the bright one; in town the bright one alone)
  const pools = P.L.town ? [{ x: hx, y: hy, r: 170, a: 1 }] : [{ x: hx, y: hy, r: 380, a: 0.36 }, { x: hx, y: hy, r: 165, a: 1 }];
  preview(`${OUT}/${P.name}_preview.png`, items, lights, picLights, sheet, crop, dark, pools);
  // (a look at another place of it: --at wx,wy [--to dir], a 640 by 400 stretch round that world point)
  const atArg = process.argv.indexOf('--at');
  if (atArg > 0) {
    const [ax, ay] = process.argv[atArg + 1].split(',').map(Number);
    const toArg = process.argv.indexOf('--to');
    const dir = toArg > 0 ? process.argv[toArg + 1] : OUT;
    const cx = wx(P.cam, ax, ay);
    const cy = wy(P.cam, ax, ay);
    preview(`${dir}/${P.name}_at_${ax}_${ay}.png`, items, lights, picLights, sheet, { x: Math.round(cx - 320), y: Math.round(cy - 220), w: 640, h: 400 }, dark, pools);
  }
  const tally: Record<string, number> = {};
  for (const it of items) tally[`${it.layer}/${it.kind}`] = (tally[`${it.layer}/${it.kind}`] ?? 0) + 1;
  const moving = items.filter((it) => it.frames.length > 1).length;
  console.log(`${P.name}: ${items.length} things (${moving} moving), ${lights.length} lights, ${atlas.pics.size} pictures in a ${sheet.W}x${sheet.H} sheet; ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  console.log(`  ${Object.entries(tally).map(([k, n]) => `${k} ${n}`).join(', ')}`);
}

const only = process.argv[2]?.startsWith('--') ? undefined : process.argv[2];
if (!only || only === 'town') {
  const P = hallPlace();
  // (the hall and its roof: from the roof's top to the floor's near corner)
  const x0 = (HALL.x0 - HALL.y1) * 16 - 60;
  const x1 = (HALL.x1 - HALL.y0) * 16 + 60;
  const y0 = (HALL.x0 + HALL.y0) * 8 - 190;
  const y1 = (HALL.x1 + HALL.y1) * 8 + 40;
  writePlace(P, 2048, { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, (A) => {
    // THE WORDSMITH'S RING in the hall's stone, under the names the town's own sheet gives them (godot/assets/town/pics.json)
    const R = P.town!.ring3!;
    R.floor.forEach((s, i) => A.named(`ring ${i}`, s));
    A.named('ring dark', R.floorDark);
    R.fuse.forEach((s, i) => A.named(`fuse ${i}`, s));
    A.named('slab empty', R.slabEmpty);
    R.slabSet.forEach((s, i) => A.named(`slab set ${i}`, s));
    R.slabRunes.forEach((s, i) => A.named(`slab runes ${i}`, s));
    R.slab.forEach((s, i) => A.named(`slab ${i}`, s));
    R.stones.forEach((ways, v) => ways.forEach((frames, b) => frames.forEach((s, f) => A.named(`stone ${v} ${b} ${f}`, s))));
  });
}
if (!only || only === 'floor1') {
  const P = tombPlace();
  const h = P.game.hero;
  const cx = wx(P.cam, h.x, h.y);
  const cy = wy(P.cam, h.x, h.y);
  writePlace(P, 4096, { x: Math.round(cx - 640), y: Math.round(cy - 440), w: 1280, h: 800 });
}
if (stretched) console.log(`(${stretched} pictures drawn stretched to another's size, as the renderer draws them)`);
