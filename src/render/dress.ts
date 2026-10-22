// THE FIRST FIVE FLOORS, DRAWN: what is each floor's own beyond its ground and its monsters. The mine
// shaft at the back of the fifth floor's boss's hall, its cage crashing down as he dies, and the ride up
// it with the hero in the cage (art/shaft.ts, the art chat's; game/ways.ts says where it stands and when
// each thing happens).
//
// Its films are the painter's (render/painter.ts): where it has not made one (or there is no painter),
// the stills stand in for it: the shaft empty while he lives, its cage down once its film's time is over.

import { BEYOND } from '../art/floorkit';
import { stairKey } from '../art/films';
import type { CaveWayFilm, MouthWay, ShaftFilm, StairFilm, TownWaysArt } from '../art/films';
import { CAVE4 } from '../art/cave4';
import { CRYPT_FLOORS } from '../art/crypt';
import { wallFacePixels } from '../art/ground';
import { GRAIN } from '../art/kit';
import { Px } from '../engine/px';
import { TOWN_WAYS, riderUnder } from '../art/town_ways';
import { doorFace, doorTiles } from '../game/doors';
import type { DoorSpot } from '../game/types';
import { floorLook } from '../art/floors';
import { riderDark, shaftStill } from '../art/shaft';
import { rgba } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { Game } from '../game/game';
import { EXITS, SHAFT, stairMiddle } from '../game/ways';
import type { StairWay } from '../game/ways';
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

/** A kick of the screen and a blow heard, from a film's jolt (game pixels; the sound's loudness). */
export interface Kick {
  amount: number;
  vol: number;
}

export class FloorDress {
  constructor(private readonly painter: () => Painter | null) {}
  /** The stairwell whose opening is being played from its film (it was there when the stairwell began to open), and the last of its frames played. */
  private stairPlay: { st: StairWay; film: StairFilm; f: number } | null = null;
  /** The kicks of the jolts played since the game last asked (`kicks`). */
  private kicked: Kick[] = [];

  private film<T = ShaftFilm>(key: string): T | null {
    const p = this.painter();
    return p ? p.filmOf<T>(key) : null;
  }

  /** The film of the opening of this level's stairwell where it is opening, if it has been made. */
  stairFilm(game: Game): StairFilm | null {
    const st = game.level.ways?.stair;
    if (!st) return null;
    return this.film<StairFilm>(stairKey(floorLook(game.level.floor.depth), st));
  }

  /**
   * THE STAIRWELL HAS BEGUN TO OPEN (the rules' event): true if it is played from its film; false, and the
   * game shows the placeholder it had before (main.ts), if there is none.
   */
  stairOpened(game: Game): boolean {
    const st = game.level.ways?.stair;
    const film = st ? this.stairFilm(game) : null;
    this.stairPlay = st && film ? { st, film, f: -1 } : null;
    return !!this.stairPlay;
  }

  /** Is the stairwell's opening being played now (its picture as it stands is not drawn until it is over)? */
  stairPlaying(game: Game): boolean {
    const p = this.stairPlay;
    return !!p && game.level.ways?.stair === p.st && (p.st.t ?? Infinity) * FPS < p.film.frames.length;
  }

  /** (EXITS) The cave's film's last frame played (its jolts kick the screen once each), and the town gate's unbarring's. */
  private caveF = -1;
  private unbarF = -1;

  /** (EXITS, the art chat's ways: art/cave4.ts, art/town_ways.ts) Floor 4's wall and cave, as its film has it; null until it is made (the painter's). */
  caveFilm(game: Game): CaveWayFilm | null {
    const cv = game.level.ways?.cave;
    return EXITS.on && CAVE4.on && cv ? this.film<CaveWayFilm>(`cave:${cv.spot.alongX ? 'x' : 'y'}`) : null;
  }
  /** (EXITS) The town's stairs, shaft's head and gate's bars; null until made. */
  townWays(game: Game): TownWaysArt | null {
    const L = game.level;
    const gate = L.ways && L.ways.gate >= 0 ? L.doors[L.ways.gate] : null;
    return EXITS.on && TOWN_WAYS.on && L.town && gate ? this.film<TownWaysArt>(`town:ways:${gate.spot.alongX ? 'x' : 'y'}`) : null;
  }
  /** (EXITS) Floor 1's stairs up, in its gate's arch; null until made. */
  stairsUp(game: Game, s: DoorSpot): Sprite | null {
    return EXITS.on && TOWN_WAYS.on && !game.level.town && game.level.floor.depth === 1 && s.kind === 'waygate' ? this.film<Sprite>(`up:1:${s.alongX ? 'x' : 'y'}`) : null;
  }
  /** The town gate's unbarring, frame `f` (30 a second) played: its jolts kick the screen. */
  unbarAt(art: TownWaysArt, f: number): void {
    if (f < this.unbarF) this.unbarF = -1;
    for (let k = this.unbarF + 1; k <= f; k++) if (art.unbarJolts.includes(k)) this.kicked.push({ amount: 4, vol: 0.6 });
    this.unbarF = f;
  }

  /** The kicks of the jolts played since this was last asked (main.ts kicks the screen and sounds a blow for each). */
  kicks(): Kick[] {
    const out = this.kicked;
    this.kicked = [];
    return out;
  }

  /** What lies on the floor: the shaft's shadow; (EXITS) the cave seen through its mouth, on floor 4 once open and on floor 5. */
  flat(g: CanvasRenderingContext2D, game: Game, stage: Stage): void {
    const L = game.level;
    const W = L.ways;
    if (EXITS.on && CAVE4.on && W) {
      const cv = W.cave;
      const film = cv && cv.state === 'open' ? this.caveFilm(game) : null;
      if (cv && film && seen(game, cv.spot)) drawAt(g, stage, film.under, cv.spot);
      const mouth = W.mouth ? this.film<MouthWay>(`mouth:${W.mouth.alongX ? 'x' : 'y'}`) : null;
      if (W.mouth && mouth && seen(game, W.mouth)) drawAt(g, stage, mouth.under, W.mouth);
    }
    const sh = game.level.ways?.shaft;
    if (!sh || !game.level.explored[sh.y * game.level.floor.w + sh.x]) return;
    stage.shadow(g, wx(stage.cam, sh.x + 0.5, sh.y + 0.5), wy(stage.cam, sh.x + 0.5, sh.y + 0.5), SHAFT_SHADOW);
  }

  /** What stands: the stairwell breaking open; the shaft, empty, its cage coming down, down, or going up (its two layers, the hero between them: `rider`). */
  standing(game: Game, stage: Stage): void {
    const L = game.level;
    const p = this.stairPlay;
    if (p && this.stairPlaying(game)) {
      // (drawn in depth at the opening's middle, by the stairwell's own anchor: the art chat's README)
      const st = p.st;
      const k = Math.max(0, Math.min(p.film.frames.length - 1, Math.floor((st.t ?? 0) * FPS)));
      for (let f = p.f + 1; f <= k; f++) {
        const j = p.film.jolts.indexOf(f);
        if (j >= 0) this.kicked.push({ amount: p.film.kicks[j] ?? 4, vol: Math.min(1, 0.4 + (p.film.kicks[j] ?? 4) * 0.06) });
      }
      p.f = k;
      const m = stairMiddle(st);
      const s = p.film.frames[k];
      const x = Math.round(wx(stage.cam, st.x, st.y));
      const y = Math.round(wy(stage.cam, st.x, st.y));
      stage.stand(m.x + m.y, s, x, y);
      if (s.lights) stage.lit(s, x, y);
    }
    // (EXITS, the art chat's: floor 4's wall standing over the cave, giving way, then the cave's rim; floor 5's mouth's rim)
    if (EXITS.on && CAVE4.on && L.ways) {
      const cv = L.ways.cave;
      const film = cv ? this.caveFilm(game) : null;
      // (until its film is made, the floor's own wall stands over the cave's doorway: three tiles of its face)
      if (cv && !film && cv.state === 'wall' && seen(game, cv.spot)) standAt(stage, wallStill(cv.spot.alongX), cv.spot);
      if (cv && film && seen(game, cv.spot)) {
        let s = film.over;
        if (cv.state === 'wall') {
          s = film.before;
          this.caveF = -1;
        }
        else if (cv.state === 'falling') {
          const k = Math.max(0, Math.min(film.frames.length - 1, Math.floor(cv.t * FPS)));
          for (let f = this.caveF + 1; f <= k; f++) {
            const j = film.jolts.indexOf(f);
            if (j >= 0) this.kicked.push({ amount: film.kicks[j] ?? 4, vol: Math.min(1, 0.4 + (film.kicks[j] ?? 4) * 0.06) });
          }
          this.caveF = k;
          s = film.frames[k];
        }
        standAt(stage, s, cv.spot);
      }
      const m = L.ways.mouth;
      const mouth = m ? this.film<MouthWay>(`mouth:${m.alongX ? 'x' : 'y'}`) : null;
      if (m && mouth && seen(game, m)) standAt(stage, mouth.over, m);
    }
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
    // (EXITS, IN TOWN: the cage coming up into the shaft's head, and standing in it: the art chat's, art/town_ways.ts)
    if (L.town && (sh.state === 'still' || sh.state === 'arriving')) {
      const arrive = sh.state === 'arriving' ? this.film('town:arrive') : null;
      if (arrive) {
        const k = Math.min(arrive.back.length - 1, Math.floor(sh.t * FPS));
        put(arrive.back[k], d - 0.002);
        put(arrive.front[k], d + 0.002);
        return;
      }
      const ways = this.townWays(game);
      if (ways) {
        put(ways.head.back, d - 0.002);
        put(ways.head.front, d + 0.002);
        return;
      }
    }
    // (EXITS, IN TOWN: until the art chat's is made, the floor's own picture of the cage down)
    put(sh.state === 'down' || sh.state === 'still' || sh.state === 'arriving' ? shaftStill().down : shaftStill().empty);
  }

  /**
   * THE HERO RIDING UP IN THE CAGE: his picture this frame lifted with the cage's floor and taken into the
   * dark with it (art/shaft.ts, riderDark: the art chat's own rule), or null when he is not riding (or
   * there is no film of the ride: then he stands in the cage as it is, and the screen darkens).
   */
  rider(game: Game, sp: Sprite): { sp: Sprite; up: number; d: number } | null {
    const sh = game.level.ways?.shaft;
    // (EXITS: coming up into the town in the cage: lifted with its floor, what of him is under the hall's floor not drawn)
    if (game.level.town && sh && sh.state === 'arriving') {
      const f = this.film('town:arrive');
      if (!f || !f.lift) return null;
      const k = Math.min(f.lift.length - 1, Math.floor(sh.t * FPS));
      const lift = f.lift[k];
      return { sp: undered(sp, lift), up: Math.round(lift / 2), d: sh.x + sh.y + 1 };
    }
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

/** (EXITS) Floor 4's own wall, three tiles of its face over the cave's doorway, anchored as the art chat's film is (art/cave4.ts lairMouth paints the lair's so): until its film is made. */
const walls = new Map<boolean, Sprite>();
function wallStill(alongX: boolean): Sprite {
  const had = walls.get(alongX);
  if (had) return had;
  const ax = alongX ? 230 : 170;
  const ay = 168;
  const face = new Px(400, 300);
  for (const j of [-1, 0, 1]) {
    const w = wallFacePixels(CRYPT_FLOORS[3], j + 1, alongX ? 'left' : 'right');
    const tx = alongX ? ax + 16 + 32 * j : ax - 16 - 32 * j;
    const ty = ay - 24 + 16 * j;
    face.blit(w.p, tx - w.ax, ty - w.ay);
  }
  const s = face.sprite(ax, ay, GRAIN);
  walls.set(alongX, s);
  return s;
}

/** (EXITS) Has any tile of this doorway been seen? */
function seen(game: Game, s: DoorSpot): boolean {
  const L = game.level;
  const f = L.floor;
  if (doorTiles(f, s).some((i) => L.explored[i] === 1)) return true;
  // (and the room's floor before it: the cave's wall is seen from the hall)
  for (let k = 0; k < 3; k++) {
    const i = s.alongX ? s.plane * f.w + s.a + k : (s.a + k) * f.w + s.plane;
    if (L.explored[i] === 1) return true;
  }
  return false;
}
/** (EXITS) Where the art chat's pictures of a doorway are anchored: the foot of its wall's face, under the middle of its middle tile. */
function anchorOf(s: DoorSpot): [number, number] {
  const face = doorFace(s);
  return s.alongX ? [s.a + 1.5, face] : [face, s.a + 1.5];
}
function drawAt(g: CanvasRenderingContext2D, stage: Stage, sp: Sprite, s: DoorSpot): void {
  const [x, y] = anchorOf(s);
  g.drawImage(sp.img, Math.round(wx(stage.cam, x, y)) - sp.ax, Math.round(wy(stage.cam, x, y)) - sp.ay, sp.w, sp.h);
}
function standAt(stage: Stage, sp: Sprite, s: DoorSpot): void {
  const [x, y] = anchorOf(s);
  const sx = Math.round(wx(stage.cam, x, y));
  const sy = Math.round(wy(stage.cam, x, y));
  stage.stand(x + y, sp, sx, sy);
  if (sp.lights) stage.lit(sp, sx, sy);
}

/** (EXITS) A copy of a picture with what of it is under the hall's floor cut away (`lift`: the cage's floor over the hall's, picture pixels, below it less than 0): the art chat's riderUnder. */
function undered(s: Sprite, lift: number): Sprite {
  if (lift >= 0) return s;
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
  let top = c.height;
  for (let i = 3; i < d.length; i += 4) {
    if (d[i] > 0) {
      top = Math.floor((i >> 2) / c.width);
      break;
    }
  }
  const tall = Math.max(1, s.ay - top * k);
  for (let y = 0; y < c.height; y++) {
    if (!riderUnder(lift, (s.ay - y * k) / tall)) continue;
    for (let x = 0; x < c.width; x++) d[(y * c.width + x) * 4 + 3] = 0;
  }
  g.putImageData(im, 0, 0);
  const out: Sprite = { ...s, img: c };
  delete out.lights;
  delete out.aura;
  return out;
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
