// Dev page: FLOOR 11, THE GATE WARD, its ground painted by the game-ready painter (art/terrain.ts, the look
// art/gateward.ts) from a level's own tiles, for the owner to look at. Nothing of the game imports it.
//
// The tiles are laid here by hand, as the game's map-maker might lay a stretch of the Gate Ward (how the real
// floor is laid is the main chat's): a lane coming in from the left, opening into a market square; a lane down
// out of it toward the eye, an alley up out of it, a street off to the right; two houses that can be walked
// into (a shop off the lane, a tavern off the square), whole from the street, their shells fading away once
// the hero is inside (his word, 18 Oct).
//
//   node tools/preview.mjs src/dev/preview_gateward.ts shots/gw_shot.png 1014 468 shot
//     one phone screen (the game's 507 x 234 game pixels at 2 picture pixels each), the knight and the cult's
//     stragglers standing in it, with the dusk's light as the game would lay it
//   node tools/preview.mjs src/dev/preview_gateward.ts shots/gw_inside.png 1014 468 inside
//     the same, the hero inside the tavern, its shell faded away
//   node tools/page_gif.mjs src/dev/preview_gateward.ts film previews/gw_walk_in.gif
//     a film: the hero runs from the square into the tavern, its front and roof fading away as he goes in
//   node tools/preview.mjs src/dev/preview_gateward.ts shots/gw_dressed.png 1014 468 dressed
//     the street view dressed with floor 11's pieces and the set's (art/floor11.ts, art/act2_set.ts), their lights
//   node tools/preview.mjs src/dev/preview_gateward.ts shots/gw_whole.png 2000 1150 whole
//     the same, the whole square at once
//   node tools/preview.mjs src/dev/preview_gateward.ts shots/gw_gate.png 1014 468 gate
//     the lane in from the city gate, broken
//   node tools/preview.mjs src/dev/preview_gateward.ts shots/gw_tiles.png 1014 468 tiles
//     the same with the tiles the game walks by drawn over it
//   node tools/preview.mjs src/dev/preview_gateward.ts shots/gw_close.png 1014 664 close
//     close-ups at three times
//   node tools/preview.mjs src/dev/preview_gateward.ts shots/gw_cost.png 600 200 cost
//     what painting it costs, a piece of 256 x 256 picture pixels at a time
//   node tools/page_gif.mjs src/dev/preview_gateward.ts pigeons previews/gw_pigeons.gif
//     a film of floor 11's moment (art/floor11_moments.ts): the hero walks along the square's back edge, and the
//     pigeons on the roof above burst off it and wheel away over the rooftops

import { makeDaggerCultistArt3 } from '../art/cultists';
import { hushSetPieces } from '../art/act2_set';
import { gateWardPieces } from '../art/floor11';
import type { Piece } from '../art/floorkit';
import { GW_RISE, GW_ZONE, gateWardLook, gateWardPaintFloor, gateWardRidge, houseShell } from '../art/gateward';
import { gateWardMoments } from '../art/floor11_moments';
import type { GWHouse, HouseShell } from '../art/gateward';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { HHP, HWP, paintTerrain, pictureOf, terrainOf } from '../art/terrain';
import type { Terrain } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'shot';
const PW = HASH === 'cost' ? 600 : HASH === 'whole' ? 2000 : 1014;
const PH = HASH === 'close' ? 664 : HASH === 'cost' ? 200 : HASH === 'whole' ? 1150 : 468;

// ---------------------------------------------------------------------------------------------------
// THE STRETCH OF THE GATE WARD, in tiles

const W = 70;
const H = 70;
type Rect = [number, number, number, number]; // x0, y0, x1, y1 (x1, y1 not in it)
const STREETS: Rect[] = [
  [3, 22, 18, 25], // the lane in from the left (along x)
  [32, 37, 35, 62], // the lane down out of the square, toward the eye (along y)
  [38, 2, 40, 10], // the alley up out of it
  [48, 19, 67, 22], // the street off to the right
];
/**
 * The square: 30 tiles by 27. His words of 18 Oct: to the first, 10 by 10, “The open squares should be like at
 * least 2x that size”; to the second, 20 by 18, asked whether it was right, “Bigger still”.
 */
const SQUARE: Rect = [18, 10, 48, 37];
const SQUARES = [{ x: 33, y: 23.5, r: 2.8 }];
/** Houses that can be walked into: a shop off the lane, a tavern off the square. */
const HOUSES: GWHouse[] = [
  { room: [9, 17, 15, 21], front: { along: 'x', at: 21, door: [11, 13] } },
  { room: [21, 5, 26, 9], front: { along: 'x', at: 9, door: [23, 25] } },
];

const inR = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];

// the tiles as the game walks them: streets, the square, each house's room and doorway
const tiles = new Uint8Array(W * H).fill(T_WALL);
const zone = new Uint8Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (STREETS.some((r) => inR(r, x, y))) tiles[i] = T_FLOOR;
    if (inR(SQUARE, x, y)) {
      tiles[i] = T_FLOOR;
      zone[i] = GW_ZONE.Square;
    }
    for (const h of HOUSES) {
      if (inR(h.room as Rect, x, y) || (y === h.front.at && x >= h.front.door[0] && x < h.front.door[1])) {
        tiles[i] = T_FLOOR;
        zone[i] = GW_ZONE.Room;
      }
    }
  }
}
const FLOOR = { depth: 11, seed: 11, w: W, h: H, tiles, cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const LAND = { floor: FLOOR, zone: (tx: number, ty: number) => zone[ty * W + tx], squares: SQUARES, houses: HOUSES };
const LOOK = gateWardLook(LAND, 'open');
const T: Terrain = terrainOf(gateWardPaintFloor(LAND, 'open'), LOOK);
const TC: Terrain = terrainOf(gateWardPaintFloor(LAND, 'closed'), gateWardLook(LAND, 'closed'));
const SHELLS: HouseShell[] = HOUSES.map((h) => houseShell(T, TC, h, paintTerrain));
/** Is the hero in this house (its room or its doorway)? */
const insideOf = (h: GWHouse, x: number, y: number): boolean =>
  (x >= h.room[0] && x < h.room[2] && y >= h.room[1] && y < h.room[3]) || (Math.floor(y) === h.front.at && x >= h.front.door[0] && x < h.front.door[1]);

// the camera: whoever it follows in the middle of the screen
const HERO: [number, number] = [31.0, 26.0];
let VX = 0;
let VY = 0;
function camOn(x: number, y: number): void {
  const [cx, cy] = pictureOf(x, y);
  VX = Math.round(cx - PW / 2);
  VY = Math.round(cy - (PH * 250) / 468);
}
camOn(HERO[0], HERO[1]);

/** Paint the world's picture under the panel, in pieces of `piece` pixels (so that the seams are checked too). */
function paintPanel(g: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number, piece = 256): void {
  for (let py = 0; py < h; py += piece) {
    for (let px = 0; px < w; px += piece) {
      const pw = Math.min(piece, w - px);
      const ph = Math.min(piece, h - py);
      const p = paintTerrain(T, x0 + px, y0 + py, pw, ph);
      g.putImageData(new ImageData(p.rgba, pw, ph), px, py);
    }
  }
}

// ---------------------------------------------------------------------------------------------------
// The figures, as the game draws them, each with its soft shadow

const knight = spriteOf3(MOVES3.rear, 0, 'front');
const cultist = makeDaggerCultistArt3();
function drawAt(g: CanvasRenderingContext2D, sp: Sprite, sx: number, sy: number): void {
  g.drawImage(sp.img, Math.round(sx - sp.ax * 2), Math.round(sy - sp.ay * 2), sp.w * 2, sp.h * 2);
}
function standAt(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, r: number): void {
  const [sx0, sy0] = pictureOf(x, y);
  const sx = sx0 - VX;
  const sy = sy0 - VY;
  g.fillStyle = 'rgba(14, 10, 24, 0.4)';
  g.beginPath();
  g.ellipse(sx, sy, r * 2, r * 0.9, 0, 0, Math.PI * 2);
  g.fill();
  drawAt(g, sp, sx, sy);
}

/** The dusk as the game would lay it over an outdoor floor (render.ts `light`, game/act1.ts's numbers): a thin tint, the hero's pool, the vignette. */
function dusk(g: CanvasRenderingContext2D): void {
  const DARK = 0.14;
  const TINT = [26, 16, 40];
  const VIG = 0.3;
  const c = document.createElement('canvas');
  c.width = PW;
  c.height = PH;
  const d = c.getContext('2d') as CanvasRenderingContext2D;
  d.fillStyle = `rgba(${TINT[0]},${TINT[1]},${TINT[2]},${DARK})`;
  d.fillRect(0, 0, PW, PH);
  g.drawImage(c, 0, 0);
  // the vignette: as render.ts draws it, from half way out to the corners
  const grd = g.createRadialGradient(PW / 2, PH / 2, 0.5 * Math.hypot(PW, PH) / 2 / Math.SQRT2, PW / 2, PH / 2, Math.hypot(PW, PH) / 2);
  grd.addColorStop(0, 'rgba(6,4,14,0)');
  grd.addColorStop(1, `rgba(6,4,14,${VIG})`);
  g.fillStyle = grd;
  g.fillRect(0, 0, PW, PH);
}

function nameAndMap(g: CanvasRenderingContext2D, hero: [number, number] = HERO): void {
  g.save();
  g.scale(2, 2);
  drawText(g, 'The Gate Ward', 4, 3, THEME.text, { shadow: P.ink });
  g.restore();
  const [mx, my, mw, mh] = [PW - 137, 4 * 2 + 3, 66 * 2 - 6, 46 * 2 - 6];
  g.fillStyle = '#100e22';
  g.fillRect(mx, my, mw, mh);
  const k = 0.11;
  for (let yy = 0; yy < mh; yy += 2) {
    for (let xx = 0; xx < mw; xx += 2) {
      const a = (xx - mw / 2) / (HWP * k);
      const b = (yy - mh / 2) / (HHP * k);
      const x = hero[0] + (a + b) / 2;
      const y = hero[1] + (b - a) / 2;
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      if (tx >= 0 && ty >= 0 && tx < W && ty < H && tiles[ty * W + tx] === T_FLOOR) {
        g.fillStyle = '#5b55c7';
        g.fillRect(mx + xx, my + yy, 2, 2);
      }
    }
  }
  g.fillStyle = '#28dcf0';
  g.fillRect(mx + mw / 2 - 2, my + mh / 2 - 2, 4, 4);
}

function show(cvs: HTMLCanvasElement): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

const cvs = document.createElement('canvas');
cvs.width = PW;
cvs.height = PH;
cvs.style.display = 'block';
const g = cvs.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

const FOES: [number, number][] = [
  [28.6, 25.2],
  [36.9, 21.0],
  [33.0, 28.9],
];


// ---------------------------------------------------------------------------------------------------
// A SCENE AS THE GAME WOULD DRAW IT: the ground; whoever stands inside a house; each house's shell over them,
// faded as far as it has faded; whoever stands outside; the dusk.

/** Each shell as a picture, once. */
const SHELL_PICS = SHELLS.map((sh) => {
  const c = document.createElement('canvas');
  c.width = sh.w;
  c.height = sh.h;
  (c.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(sh.rgba, sh.w, sh.h), 0, 0);
  return c;
});

interface Scene {
  hero: [number, number];
  heroSprite: Sprite;
  cam: [number, number];
  /** How far each house's shell shows (1 whole, 0 gone). */
  shown: number[];
  tiles?: boolean;
}

function drawScene(g: CanvasRenderingContext2D, sc: Scene): void {
  camOn(sc.cam[0], sc.cam[1]);
  paintPanel(g, VX, VY, PW, PH);
  if (sc.tiles) drawTiles(g);
  const figs: [Sprite, number, number, number][] = [...FOES.map(([x, y]) => [cultist.front.idle[0], x, y, 8] as [Sprite, number, number, number]), [sc.heroSprite, sc.hero[0], sc.hero[1], 9]];
  figs.sort((a, b) => a[1] + a[2] - (b[1] + b[2]));
  const inAny = (x: number, y: number): boolean => HOUSES.some((h) => insideOf(h, x, y));
  for (const [sp, x, y, r] of figs) if (inAny(x, y)) standAt(g, sp, x, y, r);
  SHELLS.forEach((sh, i) => {
    const a = sc.shown[i];
    if (a <= 0.01) return;
    g.globalAlpha = a;
    g.drawImage(SHELL_PICS[i], sh.x0 - VX, sh.y0 - VY);
    g.globalAlpha = 1;
  });
  for (const [sp, x, y, r] of figs) if (!inAny(x, y)) standAt(g, sp, x, y, r);
  if (!sc.tiles) dusk(g);
  nameAndMap(g, sc.hero);
}

function drawTiles(g: CanvasRenderingContext2D): void {
  g.lineWidth = 1;
  for (let ty = 0; ty < H; ty++) {
    for (let tx = 0; tx < W; tx++) {
      const i = ty * W + tx;
      const front = HOUSES.some((h) => ty === h.front.at && tx >= h.room[0] && tx < h.room[2]);
      if (tiles[i] !== T_FLOOR && !front) continue;
      const pts: [number, number][] = [[tx, ty], [tx + 1, ty], [tx + 1, ty + 1], [tx, ty + 1]];
      g.strokeStyle = tiles[i] !== T_FLOOR ? 'rgba(255, 120, 90, 0.8)' : zone[i] === GW_ZONE.Room ? 'rgba(255, 220, 90, 0.7)' : 'rgba(255, 255, 255, 0.4)';
      g.beginPath();
      pts.forEach(([x, y], n) => {
        const [sx, sy] = pictureOf(x, y);
        if (n) g.lineTo(sx - VX + 0.5, sy - VY + 0.5);
        else g.moveTo(sx - VX + 0.5, sy - VY + 0.5);
      });
      g.closePath();
      g.stroke();
    }
  }
}

/** THE FILM: he runs from the square up into the tavern; its shell fades as he goes in (a third of a second), and he stands inside. */
const FILM_N = 40;
const FILM_MS = 80;
const RUN_FROM: [number, number] = [23.9, 13.6];
const RUN_TO: [number, number] = [23.7, 6.9];
const RUN_FRAMES = 26;
const FADE_S = 0.3;
function filmScene(k: number): Scene {
  const t = Math.min(1, k / RUN_FRAMES);
  const hero: [number, number] = [RUN_FROM[0] + (RUN_TO[0] - RUN_FROM[0]) * t, RUN_FROM[1] + (RUN_TO[1] - RUN_FROM[1]) * t];
  // how far each shell shows: fading while he is inside, coming back while he is not
  const shown = HOUSES.map(() => 1);
  for (let j = 0; j <= k; j++) {
    const tj = Math.min(1, j / RUN_FRAMES);
    const hy = RUN_FROM[1] + (RUN_TO[1] - RUN_FROM[1]) * tj;
    const hx = RUN_FROM[0] + (RUN_TO[0] - RUN_FROM[0]) * tj;
    HOUSES.forEach((h, i) => {
      if (j === 0) return;
      const step = FILM_MS / 1000 / FADE_S;
      shown[i] = insideOf(h, hx, hy) ? Math.max(0, shown[i] - step) : Math.min(1, shown[i] + step);
    });
  }
  const moving = k < RUN_FRAMES;
  const sp = moving ? spriteOf3(MOVES3.krun, (k * FILM_MS) / 1000, 'back') : spriteOf3(MOVES3.rear, ((k - RUN_FRAMES) * FILM_MS) / 1000, 'back');
  // the camera follows him, as the game's does
  return { hero, heroSprite: sp, cam: hero, shown };
}

// ---------------------------------------------------------------------------------------------------
// THE PIECES, laid as the game might lay them (where is the main chat's): standing on the floor, hung on a
// house front (its foot on the face's foot), or standing on the roofs (drawn the ground's rise up)

const PIECES = new Map<string, Piece>([...gateWardPieces(), ...hushSetPieces()].map((p) => [p.name, p]));
interface Laid { name: string; frame: number; x: number; y: number; on?: 'left' | 'right' | 'top'; flat?: boolean }
/**
 * THE MARKET, as his words of 18 Oct ask (“those open squares we want a natural market layout look.”; then, of the
 * first, “That’s wayyyyu too congested.  The open squares should be like at least 2x that size”; to the second,
 * “Bigger still”): the square 30 by 27 tiles, stalls along its edges facing in, the near ones with their backs to the eye, two small islands of
 * stalls back to back, open ground round the herald in the middle for the fighting; goods, crates and the siege's
 * damage through it. Frames of a stall: facing (0 +y, 1 +x, 2 -y, 3 -x) * 4 + which stall.
 */
const st = (facing: number, v: number): number => facing * 4 + v;
const DRESS: Laid[] = [
  // the back edge, a row facing in, gaps between; the tavern's door kept clear, the notice board beside it;
  // the market bell in its corner
  { name: 'market stall', frame: st(0, 0), x: 19.9, y: 11.1 },
  { name: 'the notice board', frame: 0, x: 21.9, y: 10.4 },
  { name: 'market stall', frame: st(0, 2), x: 29.5, y: 11.1 },
  { name: 'handcart', frame: 0, x: 31.6, y: 11.6 },
  { name: 'market stall', frame: st(0, 1), x: 42.6, y: 11.1 },
  { name: 'the market bell (the Muffled Bell)', frame: 0, x: 46.9, y: 11.0 },
  // the left edge, facing in, the lane's mouth kept clear
  { name: 'market stall', frame: st(1, 1), x: 19.1, y: 14.6 },
  { name: 'baskets of produce', frame: 0, x: 19.3, y: 16.2 },
  { name: 'market stall', frame: st(1, 3), x: 19.1, y: 31.5 },
  // an island up and left of the middle: two pairs back to back, their goods round them
  { name: 'market stall', frame: st(2, 2), x: 24.6, y: 17.8 },
  { name: 'market stall', frame: st(2, 1), x: 26.45, y: 17.8 },
  { name: 'market stall', frame: st(0, 3), x: 24.6, y: 19.15 },
  { name: 'market stall, smashed', frame: 0, x: 26.45, y: 19.15 },
  { name: 'crates', frame: 0, x: 28.0, y: 18.5 },
  { name: 'barrel', frame: 0, x: 23.2, y: 18.5 },
  // an island down and right of the middle: back to back, facing out to either side
  { name: 'market stall', frame: st(3, 0), x: 39.8, y: 27.0 },
  { name: 'market stall', frame: st(1, 2), x: 41.15, y: 27.0 },
  { name: 'sacks of grain', frame: 0, x: 40.5, y: 28.5 },
  // the near edges, facing in: their backs to the eye; the crier's rostrum by the street off to the right
  { name: 'market stall', frame: st(2, 0), x: 23.5, y: 35.7 },
  { name: 'market stall', frame: st(2, 3), x: 41.0, y: 35.7 },
  { name: 'market stall', frame: st(3, 1), x: 46.8, y: 31.0 },
  { name: "the crier's rostrum", frame: 0, x: 46.4, y: 24.6 },
  // the herald in the middle, on his ring of setts, open ground all round him
  { name: 'the herald, gagged', frame: 0, x: 33, y: 23.5 },
  // the siege's: a firepot still burning in the open, the dome's shards, rubble, fruit spilled, the cart barricade
  // across the lane down
  { name: "a firepot's crater, burning", frame: 1, x: 36.4, y: 30.4 },
  { name: 'a shard of the dome', frame: 2, x: 28.6, y: 31.2 },
  { name: 'a shard of the dome', frame: 1, x: 38.4, y: 15.2 },
  { name: 'rubble of the siege', frame: 0, x: 44.4, y: 15.6 },
  { name: 'baskets of produce', frame: 1, x: 25.0, y: 26.8 },
  { name: 'the cart barricade', frame: 0, x: 33.4, y: 41.0 },
  // the lane in: the dome's shards in the gutter, rubble, a crate of stolen voices
  { name: 'a shard of the dome', frame: 0, x: 11.6, y: 24.4 },
  { name: 'rubble of the siege', frame: 0, x: 7.0, y: 22.8 },
  { name: 'a crate of stolen voices', frame: 0, x: 16.6, y: 24.5 },
  { name: 'barrel', frame: 1, x: 15.2, y: 22.6 },
  // the lamps, at the mouths of the ways in
  { name: 'street lamp', frame: 0, x: 18.7, y: 21.4 },
  { name: 'street lamp', frame: 1, x: 47.5, y: 18.5 },
  { name: 'street lamp', frame: 0, x: 31.5, y: 36.5 },
  { name: 'street lamp', frame: 1, x: 37.5, y: 10.6 },
  // the rest of the floor's own: the maypole in the open, a shrine's bell at the lane's mouth (awake), the watch's
  // bell by the street off to the right, the horse trough and hay by the near edge, the proclamation dropped by
  // the herald, the watch's horn blasting down the lane out (the Hush's trap)
  { name: 'the festival maypole', frame: 0, x: 27.4, y: 28.2 },
  { name: "a wayside shrine's bell", frame: 1, x: 18.7, y: 25.8 },
  { name: "the watch's alarm bell", frame: 0, x: 46.3, y: 22.4 },
  { name: 'the horse trough', frame: 0, x: 39.6, y: 32.8 },
  { name: 'hay bales', frame: 0, x: 43.2, y: 33.6 },
  { name: "the watch's alarm horn, the Hush's", frame: 3, x: 33.5, y: 38.2 },
  // the city gate, at the far end of the lane in
  { name: 'the city gate, broken', frame: 1, x: 3.4, y: 23.5 },
  // the set's: the Order's lanterns where they hold the street, their cart, the Hush's jar left in the square; the
  // Order's ink across the setts, a drain, a cellar's hatch thrown open
  { name: "the Order's hooded lantern", frame: 0, x: 16.2, y: 22.5 },
  { name: "the Order's hooded lantern", frame: 1, x: 47.4, y: 26.4 },
  { name: "the carters' cart, the Order's", frame: 2, x: 52.5, y: 20.4 },
  { name: 'a jar of the Hush', frame: 0, x: 22.2, y: 22.4 },
  { name: "the Order's ink bars", frame: 0, x: 34.2, y: 33.6, flat: true },
  { name: "the Order's ink bars", frame: 2, x: 24.0, y: 13.2, flat: true },
  { name: 'an ink spill', frame: 0, x: 21.8, y: 29.0, flat: true },
  { name: 'a drain grate', frame: 1, x: 25.4, y: 36.3, flat: true },
  { name: "a cellar's hatch", frame: 1, x: 44.4, y: 29.2, flat: true },
  { name: "the crier's last proclamation", frame: 0, x: 36.2, y: 25.6, flat: true },
  // IN THE TAVERN: its hearth burning against its far side wall, a dresser against its back wall, its table and
  // benches (against the far walls: the house beside a room on the near side is cut down as the ground cuts
  // any near wall, so nothing tall stands in a room's near half)
  { name: 'the hearth', frame: 2, x: 21.35, y: 6.9 },
  { name: 'a dresser', frame: 0, x: 22.6, y: 5.35 },
  { name: 'a tavern table and benches', frame: 0, x: 23.6, y: 7.0 },
  // IN THE SHOP: the Order's now, its store of jars; reams of blank paper; a bed in its back room
  { name: "the Order's rack of jars", frame: 1, x: 11.6, y: 17.5 },
  { name: 'bundles of blank paper', frame: 0, x: 13.9, y: 19.8 },
  { name: 'a bed', frame: 1, x: 9.9, y: 19.2 },
  // on the house fronts
  { name: 'wall lantern', frame: 0, x: 27.4, y: 10, on: 'left' },
  { name: 'wall lantern', frame: 1, x: 17.0, y: 10, on: 'left' },
  { name: 'blank proclamations, pasted', frame: 0, x: 37.4, y: 10, on: 'left' },
  { name: "a house's door", frame: 2, x: 45.4, y: 10, on: 'left' },
  { name: 'washing on a line', frame: 0, x: 57.5, y: 19, on: 'left' },
  { name: "a shop's doorbell", frame: 1, x: 40.5, y: 10, on: 'left' },
  { name: 'paper lanterns', frame: 0, x: 31.6, y: 10, on: 'left' },
  { name: 'paper lanterns', frame: 0, x: 7.6, y: 22, on: 'left' },
  { name: 'festival bunting', frame: 0, x: 51.5, y: 19, on: 'left' },
  { name: 'festival bunting', frame: 0, x: 44.0, y: 10, on: 'left' },
  { name: 'festival bunting', frame: 0, x: 16.5, y: 22, on: 'left' },
  { name: "the Silent Order's banner", frame: 0, x: 56.0, y: 19, on: 'left' },
  { name: "the Silent Order's banner", frame: 0, x: 35.6, y: 10, on: 'left' },
  { name: 'guild sign, blotted', frame: 1, x: 5.5, y: 22, on: 'left' },
  { name: 'guild sign, blotted', frame: 2, x: 19.6, y: 10, on: 'left' },
  // on the roofs
  { name: 'chimney', frame: 1, x: 16.6, y: 18.4, on: 'top' },
  { name: 'chimney', frame: 0, x: 29.6, y: 7.4, on: 'top' },
  { name: 'chimney', frame: 0, x: 12.4, y: 13.5, on: 'top' },
  { name: 'chimney', frame: 1, x: 43.5, y: 6.5, on: 'top' },
];

function spriteOfLaid(l: Laid): Sprite | null {
  const p = PIECES.get(l.name);
  if (!p) return null;
  if (l.on === 'left') return p.left ? p.left[l.frame] : null;
  if (l.on === 'right') return p.right ? p.right[l.frame] : null;
  return p.frames ? p.frames[l.frame] : null;
}
function drawLaid(g: CanvasRenderingContext2D, l: Laid): void {
  const sp = spriteOfLaid(l);
  if (!sp) return;
  const [sx0, sy0] = pictureOf(l.x, l.y);
  const sx = sx0 - VX;
  const sy = sy0 - VY - (l.on === 'top' ? GW_RISE : 0);
  const p = PIECES.get(l.name)!;
  if (!l.on && p.shadow) {
    g.fillStyle = 'rgba(14, 10, 24, 0.4)';
    g.beginPath();
    g.ellipse(sx, sy, 30 * p.shadow, 13 * p.shadow, 0, 0, Math.PI * 2);
    g.fill();
  }
  const d = sp.density ?? 1;
  g.drawImage(sp.img, Math.round(sx - sp.ax * d), Math.round(sy - sp.ay * d), sp.w * d, sp.h * d);
}
/** The lights of what is laid, over the dusk: each a soft pool of its colour, as the game lays a light over the dark. */
function laidLights(g: CanvasRenderingContext2D, laid: readonly Laid[]): void {
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const l of laid) {
    const sp = spriteOfLaid(l);
    if (!sp || !sp.lights) continue;
    const [sx0, sy0] = pictureOf(l.x, l.y);
    const d = sp.density ?? 1;
    for (const L of sp.lights) {
      const x = sx0 - VX - sp.ax * d + L.x * d;
      const y = sy0 - VY - (l.on === 'top' ? GW_RISE : 0) - sp.ay * d + L.y * d;
      const r = L.r * d;
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, L.color);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = (L.a ?? 0.5) * 0.55;
      g.fillStyle = grd;
      g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
  }
  g.restore();
}

/** The street dressed: the ground, the house fronts' and roofs' pieces, whoever and whatever stands inside a house, the shells, the rest by depth, (`extra`, then) the dusk, the lights. */
function drawDressed(g: CanvasRenderingContext2D, sc: Scene, extra?: () => void): void {
  camOn(sc.cam[0], sc.cam[1]);
  paintPanel(g, VX, VY, PW, PH);
  for (const l of DRESS) if (l.on) drawLaid(g, l);
  type Thing = { d: number; draw: () => void; inside: boolean };
  const things: Thing[] = [];
  const inAny = (x: number, y: number): boolean => HOUSES.some((h) => insideOf(h, x, y));
  // what lies flat on the floor goes under whatever stands
  for (const l of DRESS) if (!l.on) things.push({ d: l.flat ? -1e6 + l.x + l.y : l.x + l.y, draw: () => drawLaid(g, l), inside: inAny(l.x, l.y) });
  for (const [x, y] of FOES) things.push({ d: x + y, draw: () => standAt(g, cultist.front.idle[0], x, y, 8), inside: inAny(x, y) });
  things.push({ d: sc.hero[0] + sc.hero[1], draw: () => standAt(g, sc.heroSprite, sc.hero[0], sc.hero[1], 9), inside: inAny(sc.hero[0], sc.hero[1]) });
  things.sort((a, b) => a.d - b.d);
  for (const t of things) if (t.inside) t.draw();
  SHELLS.forEach((sh, i) => {
    const a = sc.shown[i];
    if (a <= 0.01) return;
    g.globalAlpha = a;
    g.drawImage(SHELL_PICS[i], sh.x0 - VX, sh.y0 - VY);
    g.globalAlpha = 1;
  });
  for (const t of things) if (!t.inside) t.draw();
  extra?.();
  dusk(g);
  laidLights(g, DRESS);
  nameAndMap(g, sc.hero);
}

if (HASH === 'dressed') {
  drawDressed(g, { hero: HERO, heroSprite: knight, cam: HERO, shown: HOUSES.map(() => 1) });
  show(cvs);
} else if (HASH === 'inside-tiles') {
  const hero: [number, number] = [24.9, 7.6];
  drawDressed(g, { hero, heroSprite: knight, cam: [24.0, 8.6], shown: HOUSES.map((h) => (insideOf(h, hero[0], hero[1]) ? 0 : 1)) });
  drawTiles(g);
  show(cvs);
} else if (HASH === 'shells') {
  // where each shell is: drawn over the scene in red
  drawDressed(g, { hero: HERO, heroSprite: knight, cam: [24.0, 8.6], shown: HOUSES.map(() => 1) });
  SHELLS.forEach((sh, i) => {
    const c = document.createElement('canvas');
    c.width = sh.w;
    c.height = sh.h;
    const d = c.getContext('2d') as CanvasRenderingContext2D;
    d.drawImage(SHELL_PICS[i], 0, 0);
    d.globalCompositeOperation = 'source-in';
    d.fillStyle = 'rgba(255,0,60,0.6)';
    d.fillRect(0, 0, sh.w, sh.h);
    g.drawImage(c, sh.x0 - VX, sh.y0 - VY);
    g.strokeStyle = '#ff0';
    g.strokeRect(sh.x0 - VX, sh.y0 - VY, sh.w, sh.h);
  });
  show(cvs);
} else if (HASH === 'gate') {
  const hero: [number, number] = [8.6, 23.6];
  drawDressed(g, { hero, heroSprite: knight, cam: [6.0, 20.4], shown: HOUSES.map(() => 1) });
  show(cvs);
} else if (HASH === 'whole') {
  drawDressed(g, { hero: HERO, heroSprite: knight, cam: [33.2, 22.6], shown: HOUSES.map(() => 1) });
  show(cvs);
} else if (HASH === 'shot' || HASH === 'tiles') {
  drawScene(g, { hero: HERO, heroSprite: knight, cam: HERO, shown: HOUSES.map(() => 1), tiles: HASH === 'tiles' });
  show(cvs);
} else if (HASH === 'inside') {
  const hero: [number, number] = [24.9, 7.6];
  drawDressed(g, { hero, heroSprite: knight, cam: [24.0, 8.6], shown: HOUSES.map((h) => (insideOf(h, hero[0], hero[1]) ? 0 : 1)) });
  show(cvs);
} else if (HASH === 'film') {
  const w = window as unknown as { __frames: number; __tickMs: number; __frame: (k: number) => string };
  w.__frames = FILM_N;
  w.__tickMs = FILM_MS;
  w.__frame = (k) => {
    drawScene(g, filmScene(k));
    return cvs.toDataURL('image/png');
  };
  drawScene(g, filmScene(0));
  show(cvs);
} else if (HASH === 'pigeons') {
  // THE PIGEONS: on the ridge of a roof over the square's back edge (a plot whose ridge runs along x); he walks
  // along the edge below them, and as he comes under them they burst off it. 30 frames a second.
  const M = gateWardMoments()[0];
  let spot: [number, number] = [34, 8.55];
  for (let x = 28; x < 46; x += 0.25) {
    const r = gateWardRidge(x, 8.6);
    if (r.along === 'x' && r.to - r.from >= 3 && r.from > 27 && r.to < 46) {
      spot = [(r.from + r.to) / 2, r.at];
      break;
    }
  }
  const LEAD = 14;
  const FPS = 30;
  const N = LEAD + M.frames.length + 20;
  const WALK_FROM: [number, number] = [spot[0] - 5.0, 11.4];
  const PACE = 2.4;
  const scene = (k: number): Scene => {
    const t = k / FPS;
    const hero: [number, number] = [WALK_FROM[0] + Math.min(t, 3.2) * PACE, WALK_FROM[1]];
    const walking = t < 3.2;
    const sp = walking ? spriteOf3(MOVES3.krun, t, 'front') : spriteOf3(MOVES3.rear, t - 3.2, 'front');
    // (the camera where the game's would be on him as they burst up, held still for the film: a film with the
    // camera on the move is too big to send)
    return { hero, heroSprite: sp, cam: [WALK_FROM[0] + (LEAD / FPS) * PACE, WALK_FROM[1]], shown: HOUSES.map(() => 1) };
  };
  const drawMoment = (k: number): void => {
    const sp = k < LEAD ? (M.before as Sprite[])[Math.floor(k / 4) % 4] : M.frames[Math.min(M.frames.length - 1, k - LEAD)];
    const [sx0, sy0] = pictureOf(spot[0], spot[1]);
    const d = sp.density ?? 1;
    g.drawImage(sp.img, Math.round(sx0 - VX - sp.ax * d), Math.round(sy0 - VY - sp.ay * d), sp.w * d, sp.h * d);
  };
  const w = window as unknown as { __frames: number; __tickMs: number; __frame: (k: number) => string };
  w.__frames = N;
  w.__tickMs = 1000 / FPS;
  w.__frame = (k) => {
    drawDressed(g, scene(k), () => drawMoment(k));
    return cvs.toDataURL('image/png');
  };
  drawDressed(g, scene(0), () => drawMoment(0));
  show(cvs);
} else if (HASH.startsWith('pigeon@')) {
  // one frame of it (pigeon@<frame>), still
  const k = Number(HASH.split('@')[1]) || 0;
  const M = gateWardMoments()[0];
  let spot: [number, number] = [34, 8.55];
  for (let x = 28; x < 46; x += 0.25) {
    const r = gateWardRidge(x, 8.6);
    if (r.along === 'x' && r.to - r.from >= 3 && r.from > 27 && r.to < 46) {
      spot = [(r.from + r.to) / 2, r.at];
      break;
    }
  }
  const sp = M.frames[Math.min(M.frames.length - 1, k)];
  drawDressed(g, { hero: [spot[0], 12.2], heroSprite: knight, cam: [spot[0], spot[1] + 3.2], shown: HOUSES.map(() => 1) }, () => {
    const [sx0, sy0] = pictureOf(spot[0], spot[1]);
    const d = sp.density ?? 1;
    g.drawImage(sp.img, Math.round(sx0 - VX - sp.ax * d), Math.round(sy0 - VY - sp.ay * d), sp.w * d, sp.h * d);
  });
  show(cvs);
} else if (HASH === 'close') {
  const spots: [string, number, number][] = [
    ['A stone house', 440, 40],
    ['The square', 560, 230],
    ['A lane', 200, 330],
    ['The tavern, walked into', 700, 60],
    ['A row of timber houses', 90, 250],
    ['The roofs', 430, 380],
  ];
  const SC = 3;
  const cw = 330;
  const ch = 300;
  spots.forEach(([name, sx, sy], n) => {
    const cx = (n % 3) * (cw + 8);
    const cy = Math.floor(n / 3) * (ch + 30) + 24;
    const w = Math.floor(cw / SC);
    const h = Math.floor(ch / SC);
    const p = paintTerrain(T, VX + sx, VY + sy, w, h);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    (c.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(p.rgba, w, h), 0, 0);
    g.drawImage(c, cx, cy, w * SC, h * SC);
    g.save();
    g.scale(2, 2);
    drawText(g, name, cx / 2, (cy - 20) / 2, THEME.text, { shadow: P.ink });
    g.restore();
  });
  show(cvs);
} else if (HASH === 'cost') {
  const N = 6;
  const t0 = performance.now();
  for (let k = 0; k < N; k++) paintTerrain(T, VX + k * 256, VY, 256, 256);
  const ms = (performance.now() - t0) / N;
  const t1 = performance.now();
  terrainOf(gateWardPaintFloor(LAND, 'open'), LOOK);
  const fieldMs = performance.now() - t1;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, PW, PH);
  g.save();
  g.scale(2, 2);
  drawText(g, `a piece 256 x 256: ${ms.toFixed(1)} ms`, 6, 6, THEME.text, { shadow: P.ink });
  drawText(g, `the field, a floor ${W} x ${H}: ${fieldMs.toFixed(1)} ms`, 6, 20, THEME.text, { shadow: P.ink });
  g.restore();
  show(cvs);
}
