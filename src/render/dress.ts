// THE FIRST FIVE FLOORS, DRAWN: what is each floor's own beyond its ground and its monsters. The mine
// shaft at the back of the fifth floor's boss's hall, its cage crashing down as he dies, and the ride up
// it with the hero in the cage (art/shaft.ts, the art chat's; game/ways.ts says where it stands and when
// each thing happens).
//
// Its films are the painter's (render/painter.ts): where it has not made one (or there is no painter),
// the stills stand in for it: the shaft empty while he lives, its cage down once its film's time is over.

import { BEYOND } from '../art/floorkit';
import type { ShaftFilm } from '../art/films';
import { riderDark, shaftStill } from '../art/shaft';
import { rgba } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { Game } from '../game/game';
import { SHAFT } from '../game/ways';
import type { Cam } from './fx';
import { wx, wy } from './fx';
import type { Painter } from './painter';

/** What the renderer lends: standing a picture among everything else, its light added after the dark, a soft shadow on the floor. */
export interface Stage {
  cam: Cam;
  stand(d: number, s: Sprite, x: number, y: number): void;
  lit(s: Sprite, x: number, y: number): void;
  shadow(g: CanvasRenderingContext2D, x: number, y: number, r: number): void;
}

/** The films' own speed: 30 frames a second. */
const FPS = 30;
/** How far the shaft's soft shadow reaches, in tiles (art/floor5.ts, its piece's `shadow`). */
const SHAFT_SHADOW = 0.7;

export class FloorDress {
  constructor(private readonly painter: () => Painter | null) {}

  private film(key: string): ShaftFilm | null {
    const p = this.painter();
    return p ? p.filmOf<ShaftFilm>(key) : null;
  }

  /** What lies on the floor: the shaft's shadow. */
  flat(g: CanvasRenderingContext2D, game: Game, stage: Stage): void {
    const sh = game.level.ways?.shaft;
    if (!sh || !game.level.explored[sh.y * game.level.floor.w + sh.x]) return;
    stage.shadow(g, wx(stage.cam, sh.x + 0.5, sh.y + 0.5), wy(stage.cam, sh.x + 0.5, sh.y + 0.5), SHAFT_SHADOW);
  }

  /** What stands: the shaft, empty, its cage coming down, down, or going up (its two layers, the hero between them: `rider`). */
  standing(game: Game, stage: Stage): void {
    const L = game.level;
    const sh = L.ways?.shaft;
    if (!sh || !L.explored[sh.y * L.floor.w + sh.x]) return;
    const x = Math.round(wx(stage.cam, sh.x + 0.5, sh.y + 0.5));
    const y = Math.round(wy(stage.cam, sh.x + 0.5, sh.y + 0.5));
    const d = sh.x + sh.y + 1;
    const put = (s: Sprite, dd = d): void => {
      stage.stand(dd, s, x, y);
      if (s.lights) stage.lit(s, x, y);
    };
    if (sh.state === 'coming') {
      const f = this.film('shaft:down');
      if (f) {
        const k = Math.min(f.back.length - 1, Math.floor(sh.t * FPS));
        put(f.back[k], d - 0.002);
        put(f.front[k], d + 0.002);
      } else put(shaftStill().empty);
      return;
    }
    if (sh.state === 'going') {
      const f = this.film('shaft:up');
      if (f) {
        const k = Math.min(f.back.length - 1, Math.floor(sh.t * FPS));
        put(f.back[k], d - 0.002);
        put(f.front[k], d + 0.002);
      } else put(shaftStill().down, d - 0.002);
      return;
    }
    put(sh.state === 'down' ? shaftStill().down : shaftStill().empty);
  }

  /**
   * THE HERO RIDING UP IN THE CAGE: his picture this frame lifted with the cage's floor and taken into the
   * dark with it (art/shaft.ts, riderDark: the art chat's own rule), or null when he is not riding (or
   * there is no film of the ride: then he stands in the cage as it is, and the screen darkens).
   */
  rider(game: Game, sp: Sprite): { sp: Sprite; up: number; d: number } | null {
    const sh = game.level.ways?.shaft;
    if (!sh || sh.state !== 'going' || game.leaving?.to !== 'up') return null;
    const f = this.film('shaft:up');
    if (!f || !f.lift) return null;
    const k = Math.min(f.lift.length - 1, Math.floor(sh.t * FPS));
    const lift = f.lift[k];
    return { sp: darkened(sp, lift), up: Math.round(lift / 2) + 1, d: sh.x + sh.y + 1 };
  }

  /** How long the cage takes to come down (for the tests: the rules' and the film's are one). */
  static readonly DOWN = SHAFT.down;
}

const BEYOND_RGB = rgba(BEYOND);
/** A copy of a picture, row by row taken toward the dark above the shaft as the cage is (`lift`: its floor over the landing, picture pixels). */
function darkened(s: Sprite, lift: number): Sprite {
  const src = s.img as unknown as CanvasImageSource & { width: number; height: number };
  if (!src.width || !src.height || typeof document === 'undefined') return s;
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const g = c.getContext('2d');
  if (!g) return s;
  g.drawImage(src, 0, 0);
  const im = g.getImageData(0, 0, c.width, c.height);
  const d = im.data;
  const k = s.h / c.height;
  // (his height: from his feet, the anchor, to the top of what is painted)
  let top = c.height;
  for (let i = 3; i < d.length; i += 4) {
    if (d[i] > 0) {
      top = Math.floor((i >> 2) / c.width);
      break;
    }
  }
  const tall = Math.max(1, s.ay - top * k);
  for (let y = 0; y < c.height; y++) {
    const m = riderDark(lift, (s.ay - y * k) / tall);
    if (m === 0) continue;
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      if (m >= 1) d[i + 3] = 0;
      else for (let j = 0; j < 3; j++) d[i + j] = Math.round(d[i + j] + (BEYOND_RGB[j] - d[i + j]) * m);
    }
  }
  g.putImageData(im, 0, 0);
  const out: Sprite = { ...s, img: c };
  delete out.lights;
  delete out.aura;
  return out;
}
