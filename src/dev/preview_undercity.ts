// Dev page: FLOOR 12, THE UNDERCITY, its ground painted by the game-ready painter (art/terrain.ts, the look
// art/undercity.ts) from a level's own tiles, for the owner to look at. Nothing of the game imports it.
//
// The tiles are laid here by hand, as the game's map-maker might lay a stretch of the sewers (how the real floor is
// laid is the main chat's): a long tunnel along x, a channel of water down its middle between two walkways, the
// river's outflow at its left end; an iron grate and the Order's planks across the channel; a narrower tunnel up out
// of it, its own small channel under a grate; a cistern at its right end, a pool in the middle of its paving; the
// Order's tunnel dug down from it to a store.
//
//   node tools/preview.mjs src/dev/preview_undercity.ts shots/uc_shot.png 1014 468 shot
//     one phone screen (the game's 507 x 234 game pixels at 2 picture pixels each), the knight and the Hush's
//     people in it, the dungeon's dark as the game lays it
//   node tools/preview.mjs src/dev/preview_undercity.ts shots/uc_bare.png 1014 468 bare
//     the same, no dark
//   node tools/preview.mjs src/dev/preview_undercity.ts shots/uc_cistern.png 1014 468 cistern
//     the cistern
//   node tools/preview.mjs src/dev/preview_undercity.ts shots/uc_whole.png 2000 1150 whole
//     the whole stretch at once, no dark
//   node tools/preview.mjs src/dev/preview_undercity.ts shots/uc_tiles.png 1014 468 tiles
//     the shot with the tiles the game walks by drawn over it
//   node tools/preview.mjs src/dev/preview_undercity.ts shots/uc_close.png 1014 664 close
//     close-ups at three times
//   node tools/preview.mjs src/dev/preview_undercity.ts shots/uc_dressed.png 1014 468 dressed
//     the shot dressed with floor 12's pieces (art/floor12.ts) and their lights, the dark as the game lays it
//   node tools/preview.mjs src/dev/preview_undercity.ts shots/uc_cistern_dressed.png 1014 468 cistern-dressed
//     the cistern, dressed: the diver's bell, the King's nest, the hoist
//   node tools/preview.mjs src/dev/preview_undercity.ts shots/uc_cost.png 600 200 cost
//     what painting it costs, a piece of 256 x 256 picture pixels at a time

import { HUSHED_PORTER, makeHushedArt3 } from '../art/hushed_moves';
import { makeScribeArt3 } from '../art/scribes_moves';
import { UC_ZONE, undercityLook } from '../art/undercity';
import { undercityPieces } from '../art/floor12';
import { hushSetPieces } from '../art/act2_set';
import type { Piece } from '../art/floorkit';
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
// THE STRETCH OF THE UNDERCITY, in tiles

const W = 64;
const H = 56;
type Rect = [number, number, number, number]; // x0, y0, x1, y1 (x1, y1 not in it)
const inR = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];

/** The long tunnel along x: a walkway of two tiles, the channel (two), a walkway of three. */
const TUNNEL_X: Rect = [3, 24, 36, 31];
const CHANNEL_X: Rect = [0, 26, 40, 28];
/** The narrower tunnel up out of it (along y): a walkway of two, a channel of one, a walkway of one. */
const TUNNEL_Y: Rect = [14, 8, 18, 24];
const CHANNEL_Y: Rect = [16, 8, 17, 26];
/** The cistern: its paving, the pool in its middle. */
const CISTERN: Rect = [36, 16, 54, 38];
const POOL: Rect = [40, 22, 50, 32];
/** Over the water: an iron grate (two tiles), the Order's planks (two), a grate where the small channel meets the walkway. */
const GRATES: Rect[] = [
  [8, 26, 10, 28],
  [16, 24, 17, 26],
];
const PLANKS: Rect[] = [[25, 26, 27, 28]];
/** The Order's tunnel, dug down out of the cistern, and its store at the end of it. */
const DUG: Rect[] = [
  [44, 38, 46, 46],
  [40, 46, 50, 53],
];

const tiles = new Uint8Array(W * H).fill(T_WALL);
const zone = new Uint8Array(W * H);
const water = new Uint8Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (inR(TUNNEL_X, x, y) || inR(TUNNEL_Y, x, y)) tiles[i] = T_FLOOR;
    if (inR(CISTERN, x, y)) {
      tiles[i] = T_FLOOR;
      zone[i] = UC_ZONE.Cistern;
    }
    if (DUG.some((r) => inR(r, x, y))) {
      tiles[i] = T_FLOOR;
      zone[i] = UC_ZONE.Dug;
    }
    if (inR(CHANNEL_X, x, y) || inR(CHANNEL_Y, x, y) || inR(POOL, x, y)) {
      tiles[i] = T_WALL;
      water[i] = 1;
    }
    if (GRATES.some((r) => inR(r, x, y))) {
      tiles[i] = T_FLOOR;
      zone[i] = UC_ZONE.Grate;
    }
    if (PLANKS.some((r) => inR(r, x, y))) {
      tiles[i] = T_FLOOR;
      zone[i] = UC_ZONE.Planks;
    }
  }
}
const FLOOR = { depth: 12, seed: 12, w: W, h: H, tiles, cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const isWater = (tx: number, ty: number): boolean => {
  if (tx < 0 || ty < 0 || tx >= W || ty >= H) return (ty === 26 || ty === 27) && tx < 0;
  return water[ty * W + tx] === 1;
};
const LAND = { floor: FLOOR, zone: (tx: number, ty: number) => zone[ty * W + tx], water: isWater };
const LOOK = undercityLook(LAND);
const T: Terrain = terrainOf(FLOOR, LOOK);

// the camera: whoever it follows in the middle of the screen
const HERO: [number, number] = [22.6, 29.0];
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
const porter = makeHushedArt3(HUSHED_PORTER).front.idle[0];
const scribe = makeScribeArt3().front.idle[0];
function drawAt(g: CanvasRenderingContext2D, sp: Sprite, sx: number, sy: number): void {
  g.drawImage(sp.img, Math.round(sx - sp.ax * 2), Math.round(sy - sp.ay * 2), sp.w * 2, sp.h * 2);
}
function standAt(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, r: number): void {
  const [sx0, sy0] = pictureOf(x, y);
  const sx = sx0 - VX;
  const sy = sy0 - VY;
  g.fillStyle = 'rgba(8, 6, 16, 0.45)';
  g.beginPath();
  g.ellipse(sx, sy, r * 2, r * 0.9, 0, 0, Math.PI * 2);
  g.fill();
  drawAt(g, sp, sx, sy);
}

/**
 * THE DUNGEON'S DARK as the game lays it (render.ts: FAR_DARK 0.88 over all, the hero's wide gentle pool and his
 * bright one taken out of it, the vignette), at two picture pixels to a game pixel.
 */
function dark(g: CanvasRenderingContext2D, hero: [number, number], lights: { x: number; y: number; r: number; a: number }[] = []): void {
  const c = document.createElement('canvas');
  c.width = PW;
  c.height = PH;
  const d = c.getContext('2d') as CanvasRenderingContext2D;
  d.fillStyle = 'rgba(6,4,14,0.88)';
  d.fillRect(0, 0, PW, PH);
  d.globalCompositeOperation = 'destination-out';
  const [hx0, hy0] = pictureOf(hero[0], hero[1]);
  const hx = hx0 - VX;
  const hy = hy0 - VY - 16;
  const spot = (r: number, strength: number): void => {
    d.save();
    d.translate(hx, hy);
    d.scale(1, 0.62);
    const grd = d.createRadialGradient(0, 0, 0, 0, 0, r);
    grd.addColorStop(0, `rgba(0,0,0,${strength})`);
    grd.addColorStop(0.5, `rgba(0,0,0,${0.7 * strength})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    d.fillStyle = grd;
    d.fillRect(-r, -r, 2 * r, 2 * r);
    d.restore();
  };
  spot(380 * 2, 0.36);
  spot(165 * 2, 1);
  // (and round each light of what is laid, as the game takes the dark away round a brazier)
  for (const L of lights) {
    d.save();
    d.translate(L.x, L.y);
    d.scale(1, 0.62);
    const grd = d.createRadialGradient(0, 0, 0, 0, 0, L.r);
    grd.addColorStop(0, `rgba(0,0,0,${L.a})`);
    grd.addColorStop(0.5, `rgba(0,0,0,${0.6 * L.a})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    d.fillStyle = grd;
    d.fillRect(-L.r, -L.r, 2 * L.r, 2 * L.r);
    d.restore();
  }
  g.drawImage(c, 0, 0);
  const grd = g.createRadialGradient(PW / 2, PH / 2, 0.5 * Math.hypot(PW, PH) / 2 / Math.SQRT2, PW / 2, PH / 2, Math.hypot(PW, PH) / 2);
  grd.addColorStop(0, 'rgba(6,4,14,0)');
  grd.addColorStop(1, 'rgba(6,4,14,0.62)');
  g.fillStyle = grd;
  g.fillRect(0, 0, PW, PH);
}

function nameAndMap(g: CanvasRenderingContext2D, hero: [number, number] = HERO): void {
  g.save();
  g.scale(2, 2);
  drawText(g, 'The Undercity', 4, 3, THEME.text, { shadow: P.ink });
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

function drawTiles(g: CanvasRenderingContext2D): void {
  g.lineWidth = 1;
  for (let ty = 0; ty < H; ty++) {
    for (let tx = 0; tx < W; tx++) {
      const i = ty * W + tx;
      if (tiles[i] !== T_FLOOR && !water[i]) continue;
      const pts: [number, number][] = [[tx, ty], [tx + 1, ty], [tx + 1, ty + 1], [tx, ty + 1]];
      g.strokeStyle = water[i] && tiles[i] !== T_FLOOR ? 'rgba(90, 200, 255, 0.6)' : zone[i] === UC_ZONE.Grate || zone[i] === UC_ZONE.Planks ? 'rgba(255, 220, 90, 0.7)' : 'rgba(255, 255, 255, 0.4)';
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

const cvs = document.createElement('canvas');
cvs.width = PW;
cvs.height = PH;
cvs.style.display = 'block';
const g = cvs.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

/** Who stands about: the hero on the near walkway; the Hushed and a scribe of the Order down the tunnel and over the water. */
const FOES: [Sprite, number, number, number][] = [
  [porter, 27.6, 29.4, 8],
  [porter, 19.2, 24.8, 8],
  [scribe, 30.4, 24.6, 8],
];

function drawScene(g: CanvasRenderingContext2D, hero: [number, number], cam: [number, number], opts: { dark?: boolean; tiles?: boolean }): void {
  camOn(cam[0], cam[1]);
  paintPanel(g, VX, VY, PW, PH);
  if (opts.tiles) drawTiles(g);
  const figs: [Sprite, number, number, number][] = [...FOES, [knight, hero[0], hero[1], 9]];
  figs.sort((a, b) => a[1] + a[2] - (b[1] + b[2]));
  for (const [sp, x, y, r] of figs) standAt(g, sp, x, y, r);
  if (opts.dark) dark(g, hero);
  nameAndMap(g, hero);
}

// ---------------------------------------------------------------------------------------------------
// THE PIECES, laid as the game might lay them (where is the main chat's): standing on the floor, hung on a wall
// (its foot on the face's foot), or laid flat

const PIECES = new Map<string, Piece>([...undercityPieces(), ...hushSetPieces()].map((p) => [p.name, p]));
interface Laid { name: string; frame: number; x: number; y: number; on?: 'left' | 'right'; flat?: boolean }
const DRESS: Laid[] = [
  // the narrow tunnel up: its sluice gate hauled open, its winch, its alarm bell awake
  { name: 'a sluice gate', frame: 1, x: 15.0, y: 14.0 },
  { name: "the sluice's winch", frame: 0, x: 17.55, y: 19.0 },
  { name: 'an alarm bell at a sluice', frame: 1, x: 14.45, y: 21.2 },
  // the long tunnel's far walkway: jars smashed, a crate gnawed open, a lantern, the niche of voices, rat holes, roots
  { name: 'smashed voice jars', frame: 0, x: 27.4, y: 24.7 },
  { name: 'a crate of jars, gnawed open', frame: 0, x: 31.3, y: 24.6 },
  { name: 'pale toadstools', frame: 0, x: 19.0, y: 24.3 },
  { name: "a sewerman's lantern", frame: 0, x: 21.0, y: 24, on: 'left' },
  { name: 'a niche of bottled voices', frame: 0, x: 29.4, y: 24, on: 'left' },
  { name: 'rat holes', frame: 0, x: 25.0, y: 24, on: 'left' },
  { name: 'roots through the vault', frame: 0, x: 33.6, y: 24, on: 'left' },
  { name: "a sewerman's handbell", frame: 0, x: 23.2, y: 24, on: 'left' },
  // the near walkway: the street's light through a grate overhead, a slick, the King's leavings, traps, a punt, a barrow
  { name: 'light from the street above', frame: 0, x: 21.4, y: 29.2, flat: true },
  { name: 'a slick of slime', frame: 0, x: 17.0, y: 29.4, flat: true },
  { name: 'gnawed bones and rags', frame: 0, x: 26.2, y: 29.8, flat: true },
  { name: 'a sinkhole in the flags', frame: 0, x: 30.5, y: 29.5, flat: true },
  { name: 'eel traps', frame: 0, x: 11.6, y: 30.2 },
  { name: "a sewerman's punt, hauled up", frame: 0, x: 6.0, y: 29.8 },
  { name: "a sewerman's barrow", frame: 0, x: 33.6, y: 30.1 },
  { name: 'the flood, a sluice bursting', frame: 0, x: 11.0, y: 24.4 },
  // the cistern: the diver's bell, gagged; the King's nest; the Order's hoist by the pool; the quest's jar
  { name: "the diver's bell (the Muffled Bell)", frame: 0, x: 48.4, y: 35.0 },
  { name: "the King's nest", frame: 0, x: 51.6, y: 19.6 },
  { name: 'a chain hoist', frame: 0, x: 38.6, y: 20.2 },
  { name: "the jar of the Crier's voice", frame: 0, x: 52.6, y: 23.0 },
  { name: 'smashed voice jars', frame: 1, x: 49.0, y: 18.6 },
  { name: 'pale toadstools', frame: 1, x: 37.0, y: 36.5 },
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
  const sy = sy0 - VY;
  const p = PIECES.get(l.name)!;
  if (!l.on && p.shadow) {
    g.fillStyle = 'rgba(8, 6, 16, 0.42)';
    g.beginPath();
    g.ellipse(sx, sy, 30 * p.shadow, 13 * p.shadow, 0, 0, Math.PI * 2);
    g.fill();
  }
  const d = sp.density ?? 1;
  g.drawImage(sp.img, Math.round(sx - sp.ax * d), Math.round(sy - sp.ay * d), sp.w * d, sp.h * d);
}
/** Where each light of what is laid is on the screen, its reach and strength. */
function lightsOf(laid: readonly Laid[]): { x: number; y: number; r: number; a: number; color: string }[] {
  const out: { x: number; y: number; r: number; a: number; color: string }[] = [];
  for (const l of laid) {
    const sp = spriteOfLaid(l);
    if (!sp || !sp.lights) continue;
    const [sx0, sy0] = pictureOf(l.x, l.y);
    const d = sp.density ?? 1;
    for (const L of sp.lights) out.push({ x: sx0 - VX - sp.ax * d + L.x * d, y: sy0 - VY - sp.ay * d + L.y * d, r: L.r * d, a: L.a ?? 0.5, color: L.color });
  }
  return out;
}
function glow(g: CanvasRenderingContext2D, ls: ReturnType<typeof lightsOf>): void {
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const L of ls) {
    const grd = g.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r);
    grd.addColorStop(0, L.color);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = L.a * 0.5;
    g.fillStyle = grd;
    g.fillRect(L.x - L.r, L.y - L.r, 2 * L.r, 2 * L.r);
  }
  g.restore();
}
function drawDressed(g: CanvasRenderingContext2D, hero: [number, number], cam: [number, number]): void {
  camOn(cam[0], cam[1]);
  paintPanel(g, VX, VY, PW, PH);
  for (const l of DRESS) if (l.on) drawLaid(g, l);
  type Thing = { d: number; draw: () => void };
  const things: Thing[] = [];
  for (const l of DRESS) if (!l.on) things.push({ d: l.flat ? -1e6 + l.x + l.y : l.x + l.y, draw: () => drawLaid(g, l) });
  for (const [sp, x, y, r] of FOES) things.push({ d: x + y, draw: () => standAt(g, sp, x, y, r) });
  things.push({ d: hero[0] + hero[1], draw: () => standAt(g, knight, hero[0], hero[1], 9) });
  things.sort((a, b) => a.d - b.d);
  for (const t of things) t.draw();
  const ls = lightsOf(DRESS);
  dark(g, hero, ls.map((L) => ({ x: L.x, y: L.y, r: L.r * 1.3, a: Math.min(0.9, L.a * 1.4) })));
  glow(g, ls);
  nameAndMap(g, hero);
}

if (HASH === 'dressed') {
  drawDressed(g, HERO, HERO);
  show(cvs);
} else if (HASH === 'cistern-dressed') {
  drawDressed(g, [43.0, 33.4], [45.5, 28.5]);
  show(cvs);
} else if (HASH === 'shot' || HASH === 'bare' || HASH === 'tiles') {
  drawScene(g, HERO, HERO, { dark: HASH === 'shot', tiles: HASH === 'tiles' });
  show(cvs);
} else if (HASH === 'cistern') {
  const hero: [number, number] = [41.5, 34.6];
  drawScene(g, hero, [43.5, 31.5], { dark: true });
  show(cvs);
} else if (HASH === 'cistern-bare') {
  const hero: [number, number] = [41.5, 34.6];
  drawScene(g, hero, [43.5, 31.5], {});
  show(cvs);
} else if (HASH === 'whole') {
  drawScene(g, HERO, [30, 30], {});
  show(cvs);
} else if (HASH === 'close') {
  camOn(HERO[0], HERO[1]);
  // (each close-up's middle, in the world; a wall's or a top's raised as they stand)
  const at = (x: number, y: number, up = 0): [number, number] => {
    const [sx, sy] = pictureOf(x, y);
    return [sx - VX - 55, sy - VY - up - 50];
  };
  const spots: [string, number, number][] = [
    ['The channel', ...at(19.5, 26.6)],
    ['A walkway', ...at(21.5, 29.4)],
    ['The far wall', ...at(26.0, 24.0, 50)],
    ['The grate', ...at(9.0, 27.0)],
    ['The planks', ...at(26.0, 27.0)],
    ['The cistern', ...at(39.0, 33.0)],
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
  terrainOf(FLOOR, undercityLook(LAND));
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
