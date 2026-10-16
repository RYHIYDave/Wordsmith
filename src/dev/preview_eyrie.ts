// Dev page: FLOOR 7'S BOSS AREA, THE QUEEN'S EYRIE: her peak, looking out over the city (a mock-up for the
// owner's yes; nothing of the game imports it).
//
// His words, 13 Oct, 20:59: “Or we can just have the trail sort of work out one direction primarily, then have
// the boss area be on some peak where we can see the city.  I’ll wait for the new drawing and we can figure it
// out”; asked which way the Ledge Road goes, his pick: “Mostly one way, views at turns (Recommended)”, offered
// as: the trail runs mostly one way, cliff above and below as drawn; a few turns round the mountain open a view
// like this one; the boss's peak looks out over the city.
//
// Read as: the trail's end comes along a narrow ridge onto the mountain's top, a bare floor of rock jutting out
// over the drop, nothing over it; past its far edge, nothing but sky, and far below in the haze the town under
// the cult's dome, as the reveal he said yes to has it (“Yes, the dome (Recommended)”: the dome of the cult's
// pink magic, its rim bright and cracked with power, the siege camps ringing the town, lines of magic running
// to it from the swamp). The Queen stands on her eyrie at the far edge, her nest and the great egg beside her,
// bones about; the knight comes up onto the top from below.
//
// Made of what he has said yes to: the Ledge Road's ground and sky (art/ledge.ts, painted by art/terrain.ts
// from the tiles laid here), floor 7's pieces (art/floor7.ts), the Queen as she stands (art/carrion_queen.ts).
// New here: the shape of the top, and the town painted crisp, two picture pixels to a game pixel, in the land
// far below.
//
//   node tools/preview.mjs src/dev/preview_eyrie.ts shots/eyrie_world.png 1014 468 shot
//     one phone screen (507 x 234 game pixels at 2 picture pixels each)
//   node tools/preview.mjs src/dev/preview_eyrie.ts shots/eyrie_city.png 1014 468 city
//     the town far below, at four times, to check its pixels
//   node tools/preview.mjs src/dev/preview_eyrie.ts shots/eyrie_dive.png 1014 468 dive:0.66
//     the same screen with the Queen at a moment of one of her moves (here her dive's hang, high over the top)

import { ledgePieces } from '../art/floor7';
import { queenFrame, queenStanding } from '../art/carrion_queen';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { cloudBelow, ledgeLook, paintSky } from '../art/ledge';
import { HHP, HWP, paintTerrain, pictureOf, terrainOf } from '../art/terrain';
import type { Terrain } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { CUT_FAR, CUT_LEFT, CUT_NEAR, CUT_RIGHT, T_FLOOR, T_PIT, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'shot';
const PW = 1014;
const PH = 468;

// ---------------------------------------------------------------------------------------------------
// The panel and the world, as the Ledge Road's page has them (world (12, 12) at the panel's middle, moved D tiles).

const D = 10;
const OX = PW / 2;
const OY = PH / 2 - 24 * HHP;
const at = (px: number, py: number): [number, number] => {
  const a = (px - OX) / HWP;
  const b = (py - OY) / HHP;
  return [(a + b) / 2 + D, (b - a) / 2 + D];
};
const toPanel = (x: number, y: number): [number, number] => [OX + (x - D - (y - D)) * HWP, OY + (x - D + (y - D)) * HHP];
type Shape = (x: number, y: number) => boolean;

/** The top of the peak: a broad, ragged oval of bare rock jutting out over the drop. */
const CX = 500;
const CY = 322;
const RX = 330;
const RY = 72;
const ragged = (a: number): number => 1 + 0.06 * Math.sin(3 * a + 0.7) + 0.045 * Math.sin(7 * a + 2.1) + 0.02 * Math.sin(13 * a);
const onTop = (sx: number, sy: number): boolean => {
  const dx = (sx - CX) / RX;
  const dy = (sy - CY) / RY;
  return Math.hypot(dx, dy) < ragged(Math.atan2(dy, dx));
};
/** The trail's end, coming in from the right along a narrow ridge, the drop on both sides of it. */
const trailEnd = (sx: number, sy: number): boolean => sx > 720 && Math.abs(sy - (304 + (sx - 720) * 0.06)) < 30 + 4 * Math.sin(sx / 31);
const TOP: Shape = (x, y) => {
  const [sx, sy] = toPanel(x, y);
  return onTop(sx, sy) || trailEnd(sx, sy);
};
/** The peak is the mountain's top: nothing rises over it, and everywhere off it is the drop. */
const BEYOND = (): boolean => true;

/** Lay the tiles of a shape (as the Ledge Road's page does): each whole, one of the four halves, or not floor; not floor, the drop where `beyond` says. */
function layTiles(shape: Shape, beyond: (x: number, y: number) => boolean, w: number, h: number): Floor {
  const tiles = new Uint8Array(w * h).fill(T_WALL);
  const cut = new Uint8Array(w * h);
  const options: [number, (u: number, v: number) => boolean][] = [
    [-1, () => false],
    [0, () => true],
    [CUT_RIGHT, (u, v) => v > u],
    [CUT_LEFT, (u, v) => u > v],
    [CUT_NEAR, (u, v) => u + v < 1],
    [CUT_FAR, (u, v) => u + v > 1],
  ];
  const N = 8;
  for (let ty = 0; ty < h; ty++) {
    for (let tx = 0; tx < w; tx++) {
      const there: boolean[] = [];
      for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) there.push(shape(tx + (a + 0.5) / N, ty + (b + 0.5) / N));
      if (there.every((v) => !v)) {
        if (beyond(tx + 0.5, ty + 0.5)) tiles[ty * w + tx] = T_PIT;
        continue;
      }
      let best = 0;
      let least = Infinity;
      options.forEach(([, inside], k) => {
        let wrong = 0;
        for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) if (inside((a + 0.5) / N, (b + 0.5) / N) !== there[a * N + b]) wrong++;
        if (wrong < least - 0.5) {
          least = wrong;
          best = k;
        }
      });
      const c = options[best][0];
      if (c >= 0) {
        tiles[ty * w + tx] = T_FLOOR;
        cut[ty * w + tx] = c;
      } else if (beyond(tx + 0.5, ty + 0.5)) tiles[ty * w + tx] = T_PIT;
    }
  }
  return { depth: 7, seed: 7, w, h, tiles, cut, variant: new Uint8Array(w * h), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
}

const FLOOR = layTiles(TOP, BEYOND, 48, 48);
const OUTSIDE = new Map<number, boolean>();
const dropTile = (tx: number, ty: number): boolean => {
  if (tx >= 0 && ty >= 0 && tx < FLOOR.w && ty < FLOOR.h) return FLOOR.tiles[ty * FLOOR.w + tx] === T_PIT;
  const key = (ty + 1000) * 4000 + tx + 1000;
  let d = OUTSIDE.get(key);
  if (d === undefined) {
    d = BEYOND();
    OUTSIDE.set(key, d);
  }
  return d;
};
const T: Terrain = terrainOf(FLOOR, ledgeLook(dropTile));
const VX = -OX;
const VY = -OY + 2 * D * HHP;
/** Where the sky's horizon sits on the panel: high, so that the land far below fills the view past the far edge. */
const HORIZON = 100;

// ---------------------------------------------------------------------------------------------------
// THE TOWN FAR BELOW, painted crisp into the sky's land: one game pixel is two by two picture pixels.

import { paintTown } from '../art/ledge_town';

/**
 * Where the sky starts on the panel: of its own places (the game scrolls it, so each is a true view), the one
 * whose clouds below the ledge leave the town and its dome clearest.
 */
function skyStart(): number {
  const base = Math.round(VX * 0.5);
  let best = base;
  let least = Infinity;
  for (let k = 0; k < 64; k++) {
    const x0 = base + k * 32;
    // (a cloud over the town itself counts three times one over the rest of the dome)
    let n = 0;
    for (let py = 104; py < 246; py += 4) {
      for (let px = 262; px < 506; px += 4) {
        if (cloudBelow(x0 + px, -HORIZON + py)) n += px > 300 && px < 470 && py > 150 ? 3 : 1;
      }
    }
    if (n < least) {
      least = n;
      best = x0;
    }
  }
  return best;
}

/** Paint the panel: the sky (with the town far below in its land), and the ground over it. */
function paintPanel(g: CanvasRenderingContext2D): void {
  const w = PW;
  const h = PH;
  const x0 = skyStart();
  const sky = paintSky(x0, -HORIZON, w, h);
  paintTown(sky, w, h, (px, py) => cloudBelow(x0 + px, -HORIZON + py));
  const out = new Uint8ClampedArray(w * h * 4);
  const piece = 256;
  for (let py = 0; py < h; py += piece) {
    for (let px = 0; px < w; px += piece) {
      const pw = Math.min(piece, w - px);
      const ph = Math.min(piece, h - py);
      const p = paintTerrain(T, VX + px, VY + py, pw, ph);
      for (let r = 0; r < ph; r++) {
        for (let c = 0; c < pw; c++) {
          const s = (r * pw + c) * 4;
          const o = ((py + r) * w + px + c) * 4;
          const clear = p.rgba[s + 3] === 0;
          for (let k = 0; k < 4; k++) out[o + k] = clear ? sky[o + k] : p.rgba[s + k];
        }
      }
    }
  }
  g.putImageData(new ImageData(out, w, h), 0, 0);
}

// ---------------------------------------------------------------------------------------------------
// What stands on the top: the Queen at the far edge, her nest and egg, the flock's leavings, the knight.

/** A sprite with its anchor at picture pixel (sx, sy) of the panel, two picture pixels to a game pixel. */
function drawAt(g: CanvasRenderingContext2D, sp: Sprite, sx: number, sy: number): void {
  g.drawImage(sp.img, Math.round(sx - sp.ax * 2), Math.round(sy - sp.ay * 2), sp.w * 2, sp.h * 2);
}
interface Stand { x: number; y: number; sp: Sprite; shadow?: number }
function drawStands(g: CanvasRenderingContext2D, stands: Stand[]): void {
  stands.sort((a, b) => a.x + a.y - (b.x + b.y));
  for (const s of stands) {
    const [sx0, sy0] = pictureOf(s.x, s.y);
    const sx = sx0 - VX;
    const sy = sy0 - VY;
    if (s.shadow) {
      g.fillStyle = 'rgba(25, 18, 40, 0.32)';
      g.beginPath();
      g.ellipse(sx, sy, s.shadow * HWP * 1.1, s.shadow * HHP * 1.1, 0, 0, Math.PI * 2);
      g.fill();
    }
    drawAt(g, s.sp, sx, sy);
  }
}
const pc = (name: string, frame = 0): Sprite => {
  const q = ledgePieces().find((x) => x.name === name);
  if (!q || !q.frames) throw new Error(`no piece ${name}`);
  return q.frames[frame];
};
const shadowOf = (name: string): number | undefined => ledgePieces().find((x) => x.name === name)?.shadow;

/** The flock, circling out over the drop: small dark wings, flat and high. */
function flock(g: CanvasRenderingContext2D): void {
  const birds: [number, number, number][] = [[760, 70, 7], [850, 110, 5], [690, 140, 4], [930, 60, 4]];
  g.fillStyle = '#2b2630';
  for (const [x, y, s] of birds) {
    for (let k = -s; k <= s; k++) {
      const lift = Math.round(Math.abs(k) * 0.55);
      g.fillRect(x + k * 2, y - lift * 2 + (Math.abs(k) < 2 ? 2 : 0), 2, 2);
    }
  }
}

function nameAndMap(g: CanvasRenderingContext2D, hero: [number, number]): void {
  g.save();
  g.scale(2, 2);
  drawText(g, "The Queen's Eyrie", 4, 3, THEME.text, { shadow: P.ink });
  g.restore();
  const [mx, my, mw, mh] = [437 * 2 + 3, 4 * 2 + 3, 66 * 2 - 6, 46 * 2 - 6];
  g.fillStyle = '#100e22';
  g.fillRect(mx, my, mw, mh);
  const k = 0.11;
  for (let yy = 0; yy < mh; yy += 2) {
    for (let xx = 0; xx < mw; xx += 2) {
      const a = (xx - mw / 2) / (HWP * k);
      const b = (yy - mh / 2) / (HHP * k);
      const tx = Math.floor(hero[0] + (a + b) / 2);
      const ty = Math.floor(hero[1] + (b - a) / 2);
      if (tx >= 0 && ty >= 0 && tx < FLOOR.w && ty < FLOOR.h && FLOOR.tiles[ty * FLOOR.w + tx] === T_FLOOR) {
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
paintPanel(g);

if (HASH === 'city') {
  // the town at four times, from the panel just painted
  const src = g.getImageData(256, 112, 253, 117);
  const tmp = document.createElement('canvas');
  tmp.width = 253;
  tmp.height = 117;
  (tmp.getContext('2d') as CanvasRenderingContext2D).putImageData(src, 0, 0);
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, PW, PH);
  g.drawImage(tmp, 0, 0, 253, 117, 0, 0, 1012, 468);
  show(cvs);
} else {
  flock(g);
  const stands: Stand[] = [];
  const onTopAt = (px: number, py: number, sp: Sprite, shadow?: number): void => {
    const [x, y] = at(px, py);
    if (!T.ground(x, y)) console.warn('off the top:', px, py);
    stands.push({ x, y, sp, shadow });
  };
  const piece = (px: number, py: number, name: string, frame = 0): void => onTopAt(px, py, pc(name, frame), shadowOf(name));
  // floor tiles first: the edge crumbling where she stands, cracks across the top
  const tileAt = (px: number, py: number, name: string, frame: number): void => {
    const [x, y] = at(px, py);
    const [sx, sy] = pictureOf(Math.floor(x), Math.floor(y));
    drawAt(g, pc(name, frame), sx - VX, sy - VY);
  };
  tileAt(560, 270, 'the crumbling ledge', 1);
  tileAt(470, 330, 'cracks across the trail', 1);
  // her eyrie: her nest and the great egg at the far edge, the flock's leavings about the top, the cult's perch
  piece(560, 266, "a vulture's nest");
  piece(546, 272, 'the great egg');
  piece(420, 300, 'bones and feathers', 0);
  piece(760, 312, 'bones and feathers', 1);
  piece(330, 330, 'a dead vulture');
  piece(820, 296, "the cult's perch");
  piece(880, 306, "the cult's feather standard");
  piece(240, 316, 'a perching rock');
  // the Queen, standing on her eyrie at the far edge; the knight coming up onto the top from below
  // (or, `#move:seconds`, her at that moment of a move, as this screen would show it: `#dive:0.66`, her dive's hang)
  const [mv, sec] = HASH.split(':');
  onTopAt(660, 276, mv && mv !== 'shot' && sec !== undefined ? queenFrame(mv, Number(sec), 'front') : queenStanding(0, 'front'), 1.6);
  const hero = at(430, 372);
  onTopAt(430, 372, spriteOf3(MOVES3.rear, 0, 'front'), 0.5);
  drawStands(g, stands);
  nameAndMap(g, hero);
  show(cvs);
}
