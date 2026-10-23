// Dev page: ACT 2'S TOWN HUB IN VELLUM, the two places he asked to see (22 Oct 2026, to the art chat: “I like the market
// square and the camp.  Can I see both?”), each laid here by hand and painted as the game paints the Gate Ward (art/
// terrain.ts, the look art/gateward.ts), with the town's four people and their places moved in (art/townsfolk.ts,
// art/town.ts in the city's stone, art/hub2.ts CITY), the Gate Ward's pieces (art/floor11.ts, art/act2_set.ts) and
// the hub's own (art/hub2.ts), at dusk, warm. Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_hub2.ts shots/hub/square.png 2000 1150 square
//     THE LAMPLIT MARKET SQUARE, the whole of it (1000 by 575 game pixels, two picture pixels to one)
//   node tools/preview.mjs src/dev/preview_hub2.ts shots/hub/square_phone.png 1014 468 square-phone
//     the same as a phone shows it, the knight by the fountain
//   node tools/preview.mjs src/dev/preview_hub2.ts shots/hub/camp.png 2000 1150 camp
//     THE CAMP INSIDE THE GATE, the whole of it
//   node tools/preview.mjs src/dev/preview_hub2.ts shots/hub/camp_phone.png 1014 468 camp-phone
//     the same as a phone shows it, the knight by the cooking fire
//   node tools/preview.mjs src/dev/preview_hub2.ts shots/hub/camp_all.png 2000 1150 camp-all
//     THE CAMP with the rest camp-style too (camp-all-phone: as a phone shows it)
//   node tools/preview.mjs src/dev/preview_hub2.ts shots/hub/pieces.png 1400 1750 pieces
//     the hub's own pieces, each frame
//   node tools/preview.mjs src/dev/preview_hub2.ts shots/hub/folk.png 2000 1150 folk
//     the camp's three people (art/hub2_folk.ts), close, from in front and behind, three moments of their talk each
//   node tools/page_gif.mjs src/dev/preview_hub2.ts camp-film shots/hub/camp_film.gif
//     THE CAMP MOVING, as a phone shows it: the knight walks in from the gate, round the fire to the mystic, everything
//     that moves moving (camp-film@k: frame k alone). His word to it, by 11:30 Pacific, 22 Oct 2026: “Yes, send to
//     main (Recommended)”. (The frames, made into an MP4 with ffmpeg, are what he was sent.)

import { hushSetPieces } from '../art/act2_set';
import { gateWardPieces } from '../art/floor11';
import type { Piece } from '../art/floorkit';
import { GW_RISE, GW_ZONE, gateWardLook, gateWardPaintFloor } from '../art/gateward';
import { CITY, hubPieces } from '../art/hub2';
import { bazaar, campPlace, ring, smithy, st } from '../art/hub2_camp';
import type { Laid, Place, Rect, TownKind, TownLaid } from '../art/hub2_camp';
import type { HubPiece } from '../art/hub2';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { makeDungeonProps } from '../art/props';
import { HHP, HWP, paintTerrain, pictureOf, terrainOf } from '../art/terrain';
import type { Terrain } from '../art/terrain';
import { makeTownProps } from '../art/town';
import { TOWN_WORK, makeTownsfolk, townFrame } from '../art/townsfolk';
import type { Townsfolk } from '../art/townsfolk';
import { makeWaypointArt } from '../art/crypt_ways';
import { drawText, textWidth } from '../engine/font';
import type { Sprite } from '../engine/px';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'square';
const PHONE = HASH.endsWith('-phone') || HASH.startsWith('camp-film');
const PW = HASH === 'pieces' ? 1400 : PHONE ? 1014 : 2000;
const PH = HASH === 'pieces' ? 1750 : PHONE ? 468 : 1150;

const cvs = document.createElement('canvas');
cvs.width = PW;
cvs.height = PH;
cvs.style.display = 'block';
const g = cvs.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
function show(): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

// ---------------------------------------------------------------------------------------------------
// WHAT IS LAID

/**
 * THE LAMPLIT MARKET SQUARE: a square of Vellum 22 tiles by 20, its houses round it lit at their windows; the fountain
 * in its middle on its ring of setts; the ward arch, the way on (the gate), out of its back edge, the waypoint by it;
 * the smithy against the back row on the right, the mystic's tent on the right, the wordsmith's ring on the left, the
 * Lexicon between it and the fountain, the stash toward the front; the stranger in the mouth of the alley on the left.
 * Market stalls along its edges, lamps at the mouths of its streets, lanterns and bunting on the fronts.
 */
const SQUARE: Place = {
  name: 'Vellum',
  w: 56,
  h: 56,
  open: [16, 14, 38, 34],
  streets: [
    [25, 2, 28, 14], // the way on, out of the back edge
    [4, 21, 16, 24], // the stranger's alley, off to the left
    [38, 24, 52, 27], // a street off to the right
    [24, 34, 27, 50], // a street toward the eye
  ],
  squares: [{ x: 27, y: 24, r: 3.4 }],
  dress: [
    { name: 'the fountain', frame: 0, x: 27, y: 24 },
    { name: 'the ward arch', frame: 0, x: 26.5, y: 14.05 },
    // the back edge, left of the arch: stalls facing in, their goods, crates and a barrel
    { name: 'market stall', frame: st(0, 0), x: 18.6, y: 14.7 },
    { name: 'market stall', frame: st(0, 1), x: 22.0, y: 14.7 },
    { name: 'baskets of produce', frame: 0, x: 20.3, y: 16.2 },
    { name: 'crates', frame: 0, x: 16.8, y: 16.4 },
    { name: 'barrel', frame: 0, x: 16.7, y: 17.6 },
    // the left edge, below the alley: a stall facing in, hay
    { name: 'market stall', frame: st(1, 2), x: 16.7, y: 28.4 },
    { name: 'sacks of grain', frame: 0, x: 16.9, y: 30.6 },
    // the near edges: stalls with their backs to the eye, a handcart, the horse trough
    { name: 'market stall', frame: st(2, 3), x: 31.2, y: 33.3 },
    { name: 'market stall', frame: st(2, 0), x: 20.0, y: 33.3 },
    { name: 'handcart', frame: 0, x: 35.6, y: 31.2 },
    { name: 'the horse trough', frame: 0, x: 37.0, y: 19.6 },
    // the lamps, at the mouths of the streets and round the fountain
    { name: 'street lamp', frame: 0, x: 23.8, y: 15.0 },
    { name: 'street lamp', frame: 1, x: 17.4, y: 24.6 },
    { name: 'street lamp', frame: 0, x: 37.5, y: 27.6 },
    { name: 'street lamp', frame: 1, x: 27.8, y: 33.4 },
    { name: 'street lamp', frame: 0, x: 20.6, y: 29.8 },
    { name: 'street lamp', frame: 1, x: 30.6, y: 20.4 },
    // on the house fronts of the back row (along x) and the left (along y)
    { name: 'paper lanterns', frame: 0, x: 20.3, y: 14, on: 'left' },
    { name: 'paper lanterns', frame: 0, x: 30.2, y: 14, on: 'left' },
    { name: 'festival bunting', frame: 0, x: 18.0, y: 14, on: 'left' },
    { name: 'festival bunting', frame: 0, x: 36.4, y: 14, on: 'left' },
    { name: 'wall lantern', frame: 0, x: 23.0, y: 14, on: 'left' },
    { name: "a house's door", frame: 1, x: 33.6, y: 14, on: 'left' },
    { name: 'wall lantern', frame: 1, x: 16, y: 19.0, on: 'right' },
    { name: 'paper lanterns', frame: 0, x: 16, y: 27.0, on: 'right' },
    { name: 'festival bunting', frame: 0, x: 16, y: 31.8, on: 'right' },
    { name: "a house's door", frame: 1, x: 16, y: 25.5, on: 'right' },
    { name: 'washing on a line', frame: 0, x: 10.0, y: 21, on: 'left' },
    // the roofs
    { name: 'chimney', frame: 0, x: 21.6, y: 11.4, on: 'top' },
    { name: 'chimney', frame: 1, x: 33.4, y: 10.8, on: 'top' },
    { name: 'chimney', frame: 0, x: 12.4, y: 27.5, on: 'top' },
  ],
  town: [
    { kind: 'waypoint', x: 28.6, y: 16.2 },
    ...smithy(34, 14),
    ...bazaar(35, 22),
    ...ring(20, 24),
    { kind: 'lexicon', x: 23, y: 21 },
    { kind: 'stash', x: 28, y: 30 },
    { kind: 'stranger', x: 16, y: 20 },
  ],
  labels: [
    ['GATE', 26.5, 14.6, 92],
    ['ARMOURER', 33.5, 15.5, 50],
    ['MYSTIC', 35.5, 23.5, 86],
    ['WORDSMITH', 20.5, 24.5, 44],
    ['LEXICON', 23.5, 21.5, 40],
    ['STASH', 28.5, 30.5, 26],
    ['STRANGER', 16.5, 20.5, 40],
  ],
  hero: [27.6, 28.6],
  whole: [27.0, 23.0],
};

// ---------------------------------------------------------------------------------------------------
// THE GROUND: every tile that is not open is houses, painted by the Gate Ward's look

function groundOf(pl: Place): { T: Terrain; tiles: Uint8Array } {
  const { w: W, h: H } = pl;
  const tiles = new Uint8Array(W * H).fill(T_WALL);
  const zone = new Uint8Array(W * H);
  const inR = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (pl.streets.some((r) => inR(r, x, y))) tiles[i] = T_FLOOR;
      if (inR(pl.open, x, y)) {
        tiles[i] = T_FLOOR;
        zone[i] = GW_ZONE.Square;
      }
    }
  }
  const FLOOR = { depth: 11, seed: 21, w: W, h: H, tiles, cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
  const LAND = { floor: FLOOR, zone: (tx: number, ty: number) => zone[ty * W + tx], squares: pl.squares, houses: [], swept: true };
  return { T: terrainOf(gateWardPaintFloor(LAND, 'open'), gateWardLook(LAND, 'open')), tiles };
}

// ---------------------------------------------------------------------------------------------------
// THE PICTURES OF WHAT STANDS

const PIECES = new Map<string, Piece | HubPiece>([...gateWardPieces(), ...hushSetPieces(), ...hubPieces()].map((p) => [p.name, p]));
const TP = makeTownProps(CITY);
const DP = makeDungeonProps(CITY);
const WAY = makeWaypointArt(CITY);
let FOLK: Townsfolk | null = null;
const folk = (): Townsfolk => (FOLK ??= makeTownsfolk());

function spriteOfLaid(l: Laid): Sprite | null {
  const p = PIECES.get(l.name) as Piece | undefined;
  if (!p) return null;
  if (l.on === 'left') return p.left ? p.left[l.frame] : null;
  if (l.on === 'right') return p.right ? p.right[l.frame] : null;
  return p.frames ? p.frames[l.frame] : null;
}
function spriteOfLaidAt(l: Laid, time: number): Sprite | null {
  if (!l.anim || l.on) return spriteOfLaid(l);
  const fs = (PIECES.get(l.name) as Piece | undefined)?.frames;
  if (!fs) return null;
  return fs[(l.frame + Math.floor(time * l.anim)) % fs.length];
}
const T0 = 0.6;
function spriteOfTown(t: TownLaid, time = T0): Sprite {
  const at = (fps: number, n: number, off = 0): number => (Math.floor(time * fps) + off) % n;
  switch (t.kind) {
    case 'forge': return TP.forge[at(8, 4, 1)];
    case 'anvil': return TP.anvil;
    case 'rack': return TP.rack;
    case 'trough': return TP.trough;
    case 'tentBack': return TP.tentBack;
    case 'tentTable': return TP.tentTable;
    case 'rug': return TP.rug;
    case 'runeRing': return TP.runeRing[at(6, 8, 2)];
    case 'runeSlab': return TP.runeSlab[at(6, 8, 2)];
    case 'runeStone': return TP.runeStone[t.v ?? 0].alight;
    case 'lexicon': return TP.lexicon[at(4, 4, 1)];
    case 'stash': return TP.stash;
    case 'brazier': return DP.brazier[at(8, 4, Math.floor(t.x + t.y))];
    case 'waypoint': return WAY.awake[at(10, 12, 3)];
    case 'armourer': return townFrame(folk().armourer, time, 0.1, TOWN_WORK.armourer);
    case 'mystic': return townFrame(folk().mystic, time, 0.7, TOWN_WORK.mystic);
    case 'wordsmith': return townFrame(folk().wordsmith, time, 1.3, TOWN_WORK.wordsmith);
    case 'stranger': return townFrame(folk().stranger, time, 0.4, TOWN_WORK.stranger);
  }
}
const FLAT_TOWN = new Set<TownKind>(['rug', 'runeRing']);

// ---------------------------------------------------------------------------------------------------
// DRAWING: two picture pixels to a game pixel; the camera with (cx, cy) on the screen's middle

let VX = 0;
let VY = 0;
function camOn(x: number, y: number): void {
  const [cx, cy] = pictureOf(x, y);
  VX = Math.round(cx - PW / 2);
  VY = Math.round(cy - PH / 2);
}
function paintPanel(T: Terrain): void {
  const piece = 256;
  for (let py = 0; py < PH; py += piece) {
    for (let px = 0; px < PW; px += piece) {
      const pw = Math.min(piece, PW - px);
      const ph = Math.min(piece, PH - py);
      const p = paintTerrain(T, VX + px, VY + py, pw, ph);
      g.putImageData(new ImageData(p.rgba, pw, ph), px, py);
    }
  }
}
/** A sprite with its anchor at the world's (x, y), `up` picture pixels raised. Sizes in game pixels: two picture pixels each. */
function drawSprite(sp: Sprite, x: number, y: number, up = 0): void {
  const [sx0, sy0] = pictureOf(x, y);
  g.drawImage(sp.img, Math.round(sx0 - VX - sp.ax * 2), Math.round(sy0 - VY - up - sp.ay * 2), sp.w * 2, sp.h * 2);
}
function shadowAt(x: number, y: number, k: number): void {
  if (k <= 0) return;
  const [sx0, sy0] = pictureOf(x, y);
  g.fillStyle = 'rgba(14, 10, 24, 0.4)';
  g.beginPath();
  g.ellipse(sx0 - VX, sy0 - VY, 30 * k, 13 * k, 0, 0, Math.PI * 2);
  g.fill();
}
interface Lit { sp: Sprite; x: number; y: number; up: number }
function lightsOver(lits: Lit[]): void {
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const { sp, x, y, up } of lits) {
    if (!sp.lights) continue;
    const [sx0, sy0] = pictureOf(x, y);
    for (const L of sp.lights) {
      const lx = sx0 - VX - sp.ax * 2 + L.x * 2;
      const ly = sy0 - VY - up - sp.ay * 2 + L.y * 2;
      const r = L.r * 2 * 1.5;
      const grd = g.createRadialGradient(lx, ly, 0, lx, ly, r);
      grd.addColorStop(0, L.color);
      if (/^#[0-9a-f]{6}$/i.test(L.color)) grd.addColorStop(0.35, L.color + '80');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = Math.min(1, (L.a ?? 0.5) * 0.85);
      g.fillStyle = grd;
      g.fillRect(lx - r, ly - r, 2 * r, 2 * r);
    }
  }
  g.restore();
}
/** DUSK, WARM (his pick): the last of the day's warmth over everything, a soft vignette; the lamps, windows and fires do the rest. */
function dusk(): void {
  g.save();
  g.globalCompositeOperation = 'soft-light';
  g.fillStyle = 'rgba(255, 160, 90, 0.38)';
  g.fillRect(0, 0, PW, PH);
  g.restore();
  g.fillStyle = 'rgba(46, 22, 40, 0.08)';
  g.fillRect(0, 0, PW, PH);
  const grd = g.createRadialGradient(PW / 2, PH / 2, 0.45 * Math.hypot(PW, PH) / 2, PW / 2, PH / 2, Math.hypot(PW, PH) / 2);
  grd.addColorStop(0, 'rgba(10,6,16,0)');
  grd.addColorStop(1, 'rgba(10,6,16,0.32)');
  g.fillStyle = grd;
  g.fillRect(0, 0, PW, PH);
}
function labelsOf(pl: Place): void {
  g.save();
  g.scale(2, 2);
  for (const [text, x, y, lift] of pl.labels) {
    const [sx0, sy0] = pictureOf(x, y);
    const w = textWidth(text, 'small') + 4;
    const lx = Math.round((sx0 - VX) / 2 - w / 2);
    const ly = Math.round((sy0 - VY) / 2 - lift);
    g.globalAlpha = 0.78;
    g.fillStyle = P.black;
    g.fillRect(lx, ly - 1, w, 7);
    g.globalAlpha = 1;
    drawText(g, text, lx + 2, ly, P.tl5, { font: 'small' });
  }
  g.restore();
}
function nameOf(pl: Place, tiles: Uint8Array, hero: [number, number]): void {
  g.save();
  g.scale(2, 2);
  drawText(g, pl.name, 4, 3, THEME.text, { shadow: P.ink });
  g.restore();
  const [mx, my, mw, mh] = [PW - 137, 11, 126, 86];
  g.fillStyle = '#100e22';
  g.fillRect(mx, my, mw, mh);
  const k = 0.11;
  for (let yy = 0; yy < mh; yy += 2) {
    for (let xx = 0; xx < mw; xx += 2) {
      const a = (xx - mw / 2) / (HWP * k);
      const b = (yy - mh / 2) / (HHP * k);
      const tx = Math.floor(hero[0] + (a + b) / 2);
      const ty = Math.floor(hero[1] + (b - a) / 2);
      if (tx >= 0 && ty >= 0 && tx < pl.w && ty < pl.h && tiles[ty * pl.w + tx] === T_FLOOR) {
        g.fillStyle = '#5b55c7';
        g.fillRect(mx + xx, my + yy, 2, 2);
      }
    }
  }
  g.fillStyle = '#28dcf0';
  g.fillRect(mx + mw / 2 - 2, my + mh / 2 - 2, 4, 4);
}

/** A sprite drawn mirrored about its anchor (one of the town's people facing the other way). */
function drawSpriteFlip(sp: Sprite, x: number, y: number): void {
  const [sx0, sy0] = pictureOf(x, y);
  g.save();
  g.translate(Math.round(sx0 - VX), Math.round(sy0 - VY));
  g.scale(-1, 1);
  g.drawImage(sp.img, -sp.ax * 2, -sp.ay * 2, sp.w * 2, sp.h * 2);
  g.restore();
}
/** The camp's people's pictures, painted once each (art/hub2_folk.ts: TALK_FRAMES a round at TALK_FPS). */
const FOLK_FRAMES = new Map<string, Sprite>();
let folkMod: typeof import('../art/hub2_folk') | null = null;
function folkFrame(who: 'porter' | 'goodwife' | 'baker', time: number, view: 'front' | 'back'): Sprite | null {
  if (!folkMod) return null;
  const k = Math.floor(time * folkMod.TALK_FPS) % folkMod.TALK_FRAMES;
  const key = `${who}:${view}:${k}`;
  let sp = FOLK_FRAMES.get(key);
  if (!sp) FOLK_FRAMES.set(key, (sp = folkMod.campFolkFrame(who, k / folkMod.TALK_FPS, view)));
  return sp;
}
interface SceneOpts {
  t: number;
  cam: [number, number];
  hero: [number, number];
  heroSprite: Sprite;
  heroFlip?: boolean;
  /** The ground painted once, at (x0, y0) of the world's picture, to take each frame's from. */
  ground?: { c: HTMLCanvasElement; x0: number; y0: number };
}
const GROUNDS = new Map<Place, { T: Terrain; tiles: Uint8Array }>();
function drawScene(pl: Place, o: SceneOpts): void {
  let gr = GROUNDS.get(pl);
  if (!gr) GROUNDS.set(pl, (gr = groundOf(pl)));
  camOn(o.cam[0], o.cam[1]);
  if (o.ground) {
    g.drawImage(o.ground.c, VX - o.ground.x0, VY - o.ground.y0, PW, PH, 0, 0, PW, PH);
  } else {
    paintPanel(gr.T);
  }
  const lits: Lit[] = [];
  // on the fronts and the roofs, first: they are part of the houses
  for (const l of pl.dress) {
    if (!l.on) continue;
    const sp = spriteOfLaid(l);
    if (!sp) continue;
    const up = l.on === 'top' ? GW_RISE : 0;
    drawSprite(sp, l.x, l.y, up);
    lits.push({ sp, x: l.x, y: l.y, up });
  }
  // what lies flat, then whatever stands, by depth
  type Thing = { d: number; draw: () => void };
  const things: Thing[] = [];
  for (const l of pl.dress) {
    if (l.on) continue;
    const sp = spriteOfLaidAt(l, o.t);
    if (!sp) continue;
    const p = PIECES.get(l.name) as { shadow?: number };
    things.push({ d: l.flat ? -1e6 + l.x + l.y : l.x + l.y, draw: () => { shadowAt(l.x, l.y, p.shadow ?? 0); drawSprite(sp, l.x, l.y); } });
    lits.push({ sp, x: l.x, y: l.y, up: 0 });
  }
  for (const t of pl.town) {
    const sp = spriteOfTown(t, o.t);
    const x = t.x + 0.5;
    const y = t.y + 0.5;
    const flat = FLAT_TOWN.has(t.kind);
    things.push({ d: flat ? -1e6 + x + y : x + y, draw: () => drawSprite(sp, x, y) });
    lits.push({ sp, x, y, up: 0 });
  }
  for (const f of pl.folk ?? []) {
    const sp = folkFrame(f.who, o.t + (f.who === 'goodwife' ? 0.4 : f.who === 'baker' ? 0.8 : 0), f.view);
    if (!sp) continue;
    things.push({ d: f.x + f.y + 0.02, draw: () => (f.flip ? drawSpriteFlip(sp, f.x, f.y) : drawSprite(sp, f.x, f.y)) });
  }
  const [hx, hy] = o.hero;
  things.push({ d: hx + hy, draw: () => { shadowAt(hx, hy, 0.3); if (o.heroFlip) drawSpriteFlip(o.heroSprite, hx, hy); else drawSprite(o.heroSprite, hx, hy); } });
  things.sort((a, b) => a.d - b.d);
  for (const t of things) t.draw();
  dusk();
  lightsOver(lits);
  labelsOf(pl);
  nameOf(pl, gr.tiles, o.hero);
}
function drawPlace(pl: Place, phone: boolean): void {
  drawScene(pl, { t: T0, cam: phone ? pl.hero : pl.whole, hero: pl.hero, heroSprite: spriteOf3(MOVES3.rear, 0.3, 'front') });
}

/**
 * THE CAMP AT DUSK, MOVING (a film for him): the knight comes in off the gate's street, past the wordsmith's ring and
 * round the near side of the fire where the three sit talking, and up to the mystic's caravan, where he stops; the
 * camera on him as the game's is. 20 pictures a second.
 */
const FILM_FPS = 20;
const FILM_PATH: [number, number][] = [
  [13.6, 22.5],
  [19.4, 22.3],
  [22.2, 25.0],
  [25.6, 25.9],
  [28.8, 23.4],
  [28.4, 20.4],
  [26.9, 19.8],
];
const FILM_PACE = 3.0;
const FILM_STAND = 2.4;
function filmHero(t: number): { at: [number, number]; dir: [number, number]; moving: boolean } {
  let left = t * FILM_PACE;
  for (let i = 0; i + 1 < FILM_PATH.length; i++) {
    const [ax, ay] = FILM_PATH[i];
    const [bx, by] = FILM_PATH[i + 1];
    const d = Math.hypot(bx - ax, by - ay);
    if (left <= d) return { at: [ax + ((bx - ax) * left) / d, ay + ((by - ay) * left) / d], dir: [(bx - ax) / d, (by - ay) / d], moving: true };
    left -= d;
  }
  const n = FILM_PATH.length;
  const [ax, ay] = FILM_PATH[n - 2];
  const [bx, by] = FILM_PATH[n - 1];
  const d = Math.hypot(bx - ax, by - ay);
  return { at: [bx, by], dir: [(bx - ax) / d, (by - ay) / d], moving: false };
}
function filmLength(): number {
  let L = 0;
  for (let i = 0; i + 1 < FILM_PATH.length; i++) L += Math.hypot(FILM_PATH[i + 1][0] - FILM_PATH[i][0], FILM_PATH[i + 1][1] - FILM_PATH[i][1]);
  return L / FILM_PACE + FILM_STAND;
}

if (HASH === 'square' || HASH === 'square-phone') {
  drawPlace(SQUARE, PHONE);
  show();
} else if (HASH === 'camp' || HASH === 'camp-phone' || HASH === 'camp-all' || HASH === 'camp-all-phone') {
  drawPlace(campPlace(HASH.startsWith('camp-all')), PHONE);
  show();
} else if (HASH === 'camp-out' || HASH === 'camp-out-phone' || HASH === 'camp-in-phone') {
  // THE WAY OUT TO FLOOR 11: the barricade hauled aside (camp-in-phone: as it stood, the knight in the same place)
  const pl = campPlace(false, HASH !== 'camp-in-phone');
  const at: [number, number] = [36.6, 26.9];
  drawScene(pl, { t: T0, cam: PHONE ? at : pl.whole, hero: at, heroSprite: spriteOf3(MOVES3.rear, 0.3, 'back') });
  show();
} else if (HASH === 'camp-film' || HASH.startsWith('camp-film@')) {
  void (async () => {
    folkMod = await import('../art/hub2_folk');
    const pl = campPlace(false);
    const gr = groundOf(pl);
    GROUNDS.set(pl, gr);
    // the ground once, over all the camera will see
    const lo = pictureOf(14, 30);
    const hi = pictureOf(30, 14);
    const x0 = Math.round(lo[0] - PW / 2 - 40);
    const y0 = Math.round(pictureOf(14, 14)[1] - PH / 2 - 60);
    const w = Math.round(hi[0] - lo[0] + PW + 80);
    const h = Math.round(pictureOf(30, 30)[1] - pictureOf(14, 14)[1] + PH + 120);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const cg = c.getContext('2d') as CanvasRenderingContext2D;
    for (let py = 0; py < h; py += 256) {
      for (let px = 0; px < w; px += 256) {
        const pw = Math.min(256, w - px);
        const ph = Math.min(256, h - py);
        const p = paintTerrain(gr.T, x0 + px, y0 + py, pw, ph);
        cg.putImageData(new ImageData(p.rgba, pw, ph), px, py);
      }
    }
    const ground = { c, x0, y0 };
    const N = Math.round(filmLength() * FILM_FPS);
    const frame = (k: number): void => {
      const t = k / FILM_FPS;
      const hero = filmHero(t);
      // (the screen's way of his going: across it, and down it)
      const sx = hero.dir[0] - hero.dir[1];
      const sy = hero.dir[0] + hero.dir[1];
      const view = sy >= 0 ? 'front' : 'back';
      const sp = hero.moving ? spriteOf3(MOVES3.krun, t, view) : spriteOf3(MOVES3.rear, t, view);
      drawScene(pl, { t, cam: hero.at, hero: hero.at, heroSprite: sp, heroFlip: sx < 0, ground });
    };
    const w2 = window as unknown as { __frames: number; __tickMs: number; __frame: (k: number) => string };
    w2.__frames = N;
    w2.__tickMs = 1000 / FILM_FPS;
    w2.__frame = (k) => {
      frame(k);
      return cvs.toDataURL('image/png');
    };
    frame(HASH.includes('@') ? Number(HASH.split('@')[1]) : 0);
    show();
  })();
} else if (HASH === 'pieces') {
  g.fillStyle = '#3a3440';
  g.fillRect(0, 0, PW, PH);
  let x = 20;
  let y = 30;
  let rowH = 0;
  for (const p of hubPieces()) {
    g.save();
    g.scale(2, 2);
    drawText(g, p.name, x / 2, (y - 24) / 2, THEME.text, { shadow: P.ink });
    g.restore();
    for (const sp of p.frames.slice(0, p.name === 'a tent' ? 4 : 5)) {
      const w = sp.w * 2;
      const h = sp.h * 2;
      if (x + w > PW - 10) {
        x = 20;
        y += rowH + 34;
        rowH = 0;
      }
      g.drawImage(sp.img, x, y, w, h);
      x += w + 6;
      rowH = Math.max(rowH, h);
    }
    x += 20;
  }
  show();
}

// ---------------------------------------------------------------------------------------------------
// THE CAMP'S PEOPLE (art/hub2_folk.ts): each of the three from in front and behind, a few moments of the talk
if (HASH === 'folk') {
  void (async () => {
    const { campFolkFrame, TALK_LONG } = await import('../art/hub2_folk');
    g.fillStyle = '#4a4248';
    g.fillRect(0, 0, PW, PH);
    const who = ['porter', 'goodwife', 'baker'] as const;
    let x = 30;
    who.forEach((w, i) => {
      for (const view of ['front', 'back'] as const) {
        for (const k of [0, 1, 2]) {
          const sp = campFolkFrame(w, (k / 3) * TALK_LONG + i, view);
          g.drawImage(sp.img, x, 40 + (view === 'back' ? 330 : 0), sp.w * 3, sp.h * 3);
          x += 150;
        }
        x -= 450;
      }
      x += 460;
    });
    show();
  })();
}
