// FLOOR 17, THE MASQUE (the High City): THE PAINTING, A FIRST LOOK (the art chat's helper, 29 Oct 2026). A MOCK-UP;
// NOTHING OF THE GAME IMPORTS IT.
//
// His doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)" (his "Yes, go (Recommended)"), level 17, THE MASQUE:
// "Into the palace, where the prince's masked ball has gone on for weeks."; its layout "indoors: a winding suite of seven
// great rooms, each in its own colour (blue, purple, green, orange, white, violet, and a black one lit red through its
// windows), with galleries, card rooms and servants' passages between."; its hazard "the great ebony clock in the black
// room. Every so often it chimes: every dancer stops dead and turns to look at you, then the music starts again and they
// all come at once."; its palette "Seven rooms of seven colours, candlelight, black velvet."; its story beat "The court
// dances while the city goes quiet." From Poe's tale (1842), only from it: the rooms lit through their windows by the
// braziers in the corridors behind them, the seventh's panes "a deep blood color", the clock of ebony against its western
// wall.
//
// WHAT IS PAINTED (one corner of the palace, about a phone screen and a half): the violet room, where the knight stands,
// the sixth of the seven; through a doorway to the west the seventh, the black room, hung in black velvet, its scarlet
// windows burning, the great ebony clock against its western wall AT ITS CHIME (its bell struck, its note going out); to
// the north-east the white room, the fifth, the feast gone cold along its wall, the musicians' harpsichord; to the
// south-east a card room by candlelight, the royal cards on its table; to the south the long gallery, candelabra and a
// chandelier down it; between it and the black room the servants' passage, where the braziers stand that light the
// windows. The ground and every piece are the game-ready ones (art/masque.ts, art/floor17.ts), laid as dev/masque_lay.ts
// lays them; what the painting adds is THE LIGHT: each window's in its room's colour (the black room's red), the
// candles' and the braziers' an honest orange, the knight's own pool, the dark between; in crisp steps, never a smear
// (his rulebook, Pixels 1), every colour of the place still under the dullest word's (Colour 4).

import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { MQ_ROOMS, MQ_SCARLET, masqueLook, masqueWindows } from '../art/masque';
import { paintTerrain, pictureOf, terrainOf } from '../art/terrain';
import type { RGB, TerrainLook } from '../art/terrain';
import { BRIGHT, quietRGB } from '../art/act2_quiet';
import { M_HERO, masqueLand } from './masque_level';
import { layMasquePieces } from './masque_lay';

export const W = 1200;
export const H = 840;

const hexRGB = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const key = (r: number, g: number, b: number): string => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((r) => r.map((v) => (v + 0.5) / 16));

/** A light on the picture: where (picture pixels), how far it reaches, how strong, its colour. */
interface Lamp {
  x: number;
  y: number;
  r: number;
  a: number;
  c: RGB;
}

/** THE FIRST LOOK, painted onto a canvas W x H: the camera on the knight. Returns where the knight stands on it. */
export function paintMasqueCorner(cv: HTMLCanvasElement): [number, number] {
  const land = masqueLand();
  const look = masqueLook(land);
  const T = terrainOf(land.floor, look as TerrainLook);
  const [hx, hy] = pictureOf(M_HERO[0], M_HERO[1]);
  const VX = Math.round(hx - W / 2 + 120);
  const VY = Math.round(hy - H / 2 - 10);
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  // THE GROUND
  const PIECE = 256;
  for (let py = 0; py < H; py += PIECE) {
    for (let px = 0; px < W; px += PIECE) {
      const pw = Math.min(PIECE, W - px);
      const ph = Math.min(PIECE, H - py);
      const p = paintTerrain(T, VX + px, VY + py, pw, ph);
      g.putImageData(new ImageData(p.rgba, pw, ph), px, py);
    }
  }
  // THE PIECES: on the walls, on the floor, then what stands, far to near; each with the game's soft shadow
  const blot = ((): HTMLCanvasElement => {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const q = c.getContext('2d') as CanvasRenderingContext2D;
    const grd = q.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(0,0,0,1)');
    grd.addColorStop(0.4, 'rgba(0,0,0,0.85)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    q.fillStyle = grd;
    q.fillRect(0, 0, 64, 64);
    return c;
  })();
  const laid = layMasquePieces(true);
  laid.sort((a, b) => (a.wall !== b.wall ? (a.wall ? -1 : 1) : a.under !== b.under ? (a.under ? -1 : 1) : a.d - b.d));
  const lamps: Lamp[] = [];
  const draw = (s: Sprite, x: number, y: number, shadow: number): void => {
    const [px, py] = pictureOf(x, y);
    const sx = (px - VX) / 2;
    const sy = (py - VY) / 2;
    g.setTransform(2, 0, 0, 2, 0, 0);
    if (shadow) {
      const w = shadow * 22.6 * 1.5;
      const hh = shadow * 11.3 * 1.5;
      g.save();
      g.imageSmoothingEnabled = true;
      g.globalAlpha = 0.6;
      g.drawImage(blot, sx - w, sy - hh, w * 2, hh * 2);
      g.restore();
    }
    g.drawImage(s.img, Math.round(sx) - s.ax, Math.round(sy) - s.ay, s.w, s.h);
    g.setTransform(1, 0, 0, 1, 0, 0);
    for (const L of s.lights ?? []) lamps.push({ x: (Math.round(sx) - s.ax + L.x) * 2, y: (Math.round(sy) - s.ay + L.y) * 2, r: L.r * 2 * 1.5, a: Math.min(0.85, (L.a ?? 0.4) * 1.5), c: hexRGB(L.color) });
  };
  for (const l of laid) draw(l.s, l.x, l.y, l.shadow);
  // THE WINDOWS' LIGHT: a glow about each window, and its light thrown into the room before it
  for (const w of masqueWindows(land)) {
    const c = hexRGB(w.light);
    const [wx, wy] = pictureOf(w.x, w.y);
    lamps.push({ x: wx - VX, y: wy - VY - 58, r: w.zone === 6 ? 64 : 50, a: w.zone === 6 ? 0.5 : 0.5, c: w.zone === 6 ? [170, 30, 34] : c });
    const nx = w.face === 1 ? 1.5 : 0;
    const ny = w.face === 0 ? 1.5 : 0;
    const [fx, fy] = pictureOf(w.x + nx, w.y + ny);
    lamps.push({ x: fx - VX, y: fy - VY - 10, r: w.zone === 6 ? 200 : 190, a: w.zone === 6 ? 0.34 : 0.42, c: w.zone === 6 ? [170, 30, 34] : c });
  }
  // THE KNIGHT'S OWN POOL OF LIGHT (his rulebook, Pixels 6: the hero carries a pool of light)
  const kx = hx - VX;
  const ky = hy - VY;
  lamps.push({ x: kx, y: ky - 16, r: 230, a: 0.42, c: [236, 226, 210] });

  // THE LIGHT, laid over all of it in steps: the dark between, every light's own colour where it falls; what gives its own
  // light (a flame, the scarlet panes, a window's glass) left as it is
  const shine = new Set<string>(BRIGHT);
  for (const R of MQ_ROOMS) for (const c of R.glass) {
    const q = quietRGB(c).map((v) => Math.round(v)) as RGB;
    shine.add(key(q[0], q[1], q[2]));
  }
  for (const c of MQ_SCARLET) shine.add(c.toLowerCase());
  const img = g.getImageData(0, 0, W, H);
  const d = img.data;
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const i = (py * W + px) * 4;
      const r0 = d[i];
      const g0 = d[i + 1];
      const b0 = d[i + 2];
      if (shine.has(key(r0, g0, b0))) continue;
      // the dark: deeper toward the picture's edges
      const ex = Math.abs(px - W / 2) / (W / 2);
      const ey = Math.abs(py - H / 2) / (H / 2);
      const edge = Math.max(0, Math.hypot(ex, ey * 0.9) - 0.55);
      const amb = 0.4 - edge * 0.45;
      let fr = amb;
      let fg = amb;
      let fb = amb * 1.06;
      // (and what each light adds of its own colour, on the darkest stuff too: velvet catches it)
      let ar = 0;
      let ag = 0;
      let ab = 0;
      let lit = 0;
      for (const L of lamps) {
        const dx = px - L.x;
        const dy = (py - L.y) / 0.62;
        const q = (dx * dx + dy * dy) / (L.r * L.r);
        if (q >= 1) continue;
        const f = L.a * (1 - Math.sqrt(q)) ** 1.4;
        lit += f;
        fr += f * (L.c[0] / 200);
        fg += f * (L.c[1] / 200);
        fb += f * (L.c[2] / 200);
        ar += f * L.c[0];
        ag += f * L.c[1];
        ab += f * L.c[2];
      }
      // in steps of an eighth, a checker where one step gives onto the next: the light's share of each pixel stepped
      const t = BAYER4[py & 3][px & 3];
      const stepped = Math.max(0, Math.min(1.1, Math.floor(lit * 8 + t) / 8));
      const s = lit > 1e-4 ? stepped / lit : 0;
      const F = (base: number, fch: number): number => Math.max(0.12, amb + (fch - base) * s);
      let c: RGB = [r0 * F(amb, fr) + ar * s * 0.16, g0 * F(amb, fg) + ag * s * 0.16, b0 * F(amb * 1.06, fb) + ab * s * 0.16];
      c = quietRGB(c);
      d[i] = Math.max(0, Math.min(255, Math.round(c[0])));
      d[i + 1] = Math.max(0, Math.min(255, Math.round(c[1])));
      d[i + 2] = Math.max(0, Math.min(255, Math.round(c[2])));
    }
  }
  g.putImageData(img, 0, 0);
  // THE KNIGHT, for scale, in his own light
  const hero = makeHeroArt3().of('warrior', { twoHanded: false });
  draw(hero.front.idle[0], M_HERO[0], M_HERO[1], 0.36);
  return [kx, ky];
}
