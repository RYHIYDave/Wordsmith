// THE FIRST FIVE FLOORS: THE PAINTER. The pictures that are too heavy to paint where the game is being
// played are painted beside it, by a worker, and handed over as they are finished.
//
// What they are, and what they cost (docs/first5_build.md, measured 11 Oct 2026): a boss of floors 2 to 5
// is about a thousand frames and a quarter to three quarters of a minute of painting; a film (a floor's
// moments, the stairwell breaking open, the cage in the mine shaft: art/films.ts) is seconds of painting
// IN ONE CALL, and tens of megabytes. The game's own way, a frame painted the first time it is shown and a
// few more ahead each time the world is drawn (art/bestiary.ts, Bestiary.warm), is for frames of a few
// thousandths of a second: these would be felt, every one.
//
// THE WORKER IS THE GAME'S OWN SCRIPT, started again as a worker from its own text (main.ts hands it over;
// a page published on claude.ai may make a worker from a blob, and from nothing else of its own). There it
// runs `paintWorkerMain` instead of the game: it has no page, and paints on canvases that need none
// (OffscreenCanvas). A FRESH ONE IS MADE FOR EVERY FLOOR and ended when the floor is left: the art keeps
// what it has made (every maker in art/ makes its pictures the first time they are asked for, and keeps
// them), and ending the worker is what gives all of that back.
//
// WHAT IS HANDED OVER is pictures only (ImageBitmap: they move from the worker to the page without being
// copied), each with its sprite's numbers:
//   A BOSS'S FRAMES, a few at a time, in the order the game itself would paint them ahead (paintOrder): each
//     takes the place of the frame the game has not painted yet (giveFrame). One the game has painted
//     itself meanwhile, because it was shown before the painter came to it, is kept, and the painter's let go.
//   A FILM, whole, each frame cut down to what is painted in it (a film's frames are all as big as the
//     biggest: floor 4's three are 365 megabytes as they are made, 82 cut down).
//
// THE RULES NEVER WAIT ON A PICTURE. Where there is no painter (a browser without OffscreenCanvas in a
// worker: a phone some years old), or it fails, the game paints the bosses for itself as it always has, a
// little at a time (render/render.ts), and does without the films: the stairwell opens as it did before
// there was a film of it, the cage stands in its shaft, a floor's moments do not play.

import { FIRST5_FIGURES, HEAVY_FIGURES, framesOf, giveFrame, makeBestiary, paintOrder } from '../art/bestiary';
import type { Bestiary, MonsterFigure } from '../art/bestiary';
import type { ActorArt } from '../art/actor_types';
import { filmRoom, makeFilm } from '../art/films';
import { heroLists, makeHeroArt3 } from '../art/heroes3';
import { lookOfPlace } from '../art/heroes';
import type { HeroPlace } from '../art/heroes';
import { paintTerrain, terrainOf } from '../art/terrain';
import { nearOf, paintWithStanding, standingBits } from '../art/standing';
import type { ClassId } from '../game/types';
import type { Terrain } from '../art/terrain';
import type { Land } from '../game/act1_layout';
import type { Floor } from '../game/types';
import { PIECE, flowOfLand, gateWardLand, landTerrain, lowRowsOf, paintFlows, withLow } from './outdoor';
import type { FlowBits } from './outdoor';
import type { FlowLayer } from '../art/flowing';
import type { Rows } from '../art/low_stacks';
// (ACT 2, THE GATE WARD: the shells of its houses walked into, painted here: render/act2_houses.ts)
import { shellMaker } from './act2_houses';
import { releaseSprite } from '../engine/px';
import type { Light, Sprite } from '../engine/px';

/** The words that say a script is this one (looked for in the text the worker is to be made from). */
export const PAINTER_MARK = 'wordsmith-painter-worker-1';

/** What stands before the game's script in the worker: it says so, and gives the script the little of a page it asks for at its start (a canvas is one that needs no page). */
const PRELUDE = `self.__PAINT_WORKER__ = true;
self.window = self;
self.document = {
  currentScript: null,
  createElement: function (n) {
    if (n === 'canvas') return new OffscreenCanvas(1, 1);
    throw new Error('the painter has no ' + n);
  },
  addEventListener: function () {},
  removeEventListener: function () {},
};
`;

/** How long the worker paints a boss's frames before it hands over what it has and looks for other work, in thousandths of a second. */
const CHUNK_MS = 40;
/** A film that takes more room than this while it is made (megabytes: art/films.ts filmRoom) is not made on a small device. */
const SMALL_ROOM = 100;
/** A worker that has not said it is ready after this long never will, in thousandths of a second. */
const READY_MS = 20000;

/** One frame of a figure, handed over: which way round, which list, which frame (paintOrder); its picture, or the frame it is the same picture as. */
interface Given {
  v: number;
  l: number;
  i: number;
  s?: Sprite;
  same?: [number, number, number];
}
/** What the page asks of a worker. */
type Ask =
  | { t: 'mob'; figure: MonsterFigure; pri: number; side?: boolean }
  | { t: 'film'; key: string; pri: number }
  | { t: 'drop'; figure: MonsterFigure }
  // ACT 1: a floor's outdoor ground (render/outdoor.ts): the floor to paint it from, then its pieces as they are wanted
  | { t: 'ground'; id: number; floor: Floor; land: Land; walls: number }
  | { t: 'piece'; id: number; i: number; j: number; pri: number }
  // (ACT 2, THE GATE WARD: the shells of a floor's houses walked into, a house at a time: render/act2_houses.ts)
  | { t: 'shells'; id: number; floor: Floor; land: Land; pri: number; walls?: boolean; near?: readonly [number, number] }
  // and the hero's pictures (art/heroes3.ts), in town and in a dungeon, painted ahead of need
  | { t: 'hero'; cls: ClassId; place: HeroPlace; pri: number };
/** (ACT 2, behind ACT2_WALLS) A bit of the walls standing whole over a piece of the ground, as handed over (render/act2_walls.ts WallBit). */
interface WallBitMsg {
  d: number;
  x0: number;
  y0: number;
  w: number;
  h: number;
  img: ImageBitmap;
}
/** What a worker tells the page. */
type Tell =
  | { t: 'ready' }
  | { t: 'frames'; figure: MonsterFigure; list: Given[]; left: number }
  | { t: 'film'; key: string; film: unknown; ms: number }
  | { t: 'piece'; id: number; i: number; j: number; bmp: ImageBitmap; ms: number; walls?: WallBitMsg[]; flow?: FlowBits<ImageBitmap> | null }
  // (ACT 2, THE GATE WARD: one house's shell, or `n` -1: they could not be painted)
  | { t: 'shell'; id: number; n: number; x0: number; y0: number; w: number; h: number; bmp: ImageBitmap | null; ms: number; last: boolean }
  | { t: 'heroFrames'; cls: ClassId; place: HeroPlace; list: Given[]; left: number }
  | { t: 'fail'; what: string; why: string };

const isSprite = (v: unknown): v is Sprite => !!v && typeof v === 'object' && 'img' in v && 'ax' in v && 'ay' in v;

// ---------------------------------------------------------------------------------------------------
// THE PAGE'S SIDE

interface Lane {
  /** Which of the floor's workers it is (0: the bosses' frames; the last: the films). */
  n: number;
  worker: Worker;
  ready: boolean;
  /** What it has been asked for and has not finished. */
  open: number;
}

/** What the painter has done, for the tests and for measuring. */
export interface PainterStats {
  /** Workers made since the page opened. */
  workers: number;
  /** Frames of figures handed over and taken; and handed over too late (the game had painted them). */
  frames: number;
  late: number;
  /** The films handed over, each with how long its making took (thousandths of a second). */
  films: Record<string, number>;
  /** What went wrong, if anything did. */
  failed: string[];
}

export class Painter {
  /** 'off': there is no painter here (or it failed): the game paints for itself and does without the films. */
  state: 'off' | 'on' = 'off';
  readonly stats: PainterStats = { workers: 0, frames: 0, late: 0, films: {}, failed: [] };
  private url: string | null = null;
  /** The floor's workers, each in its place; null: not made yet, or ended (a worker with nothing left to do is ended, and what it held given back; one is made again if there is more). */
  private lanes: (Lane | null)[] = [];
  /** How many workers a floor is given: one for the bosses' frames and one for the films where there are cores for both beside the game. */
  private readonly many: number;
  /** A device with little room (a phone): it is given less at a time. */
  readonly small: boolean;
  /** The figures and films asked for on this floor. */
  private figures = new Map<MonsterFigure, { left: number }>();
  private asked = new Set<string>();
  private films = new Map<string, unknown>();
  private watchdog: ReturnType<typeof setTimeout> | null = null;
  /**
   * ACT 1: THE GROUND'S OWN WORKER (render/outdoor.ts): a floor of the descent's ground is painted beside the game, a
   * piece at a time, by a worker of its own (it holds the floor's terrain, and is not kept waiting behind a boss's
   * frames). `ground` is the floor it paints (its number; 0: none); `toGround` is told of each piece as it comes.
   */
  private groundLane: Lane | null = null;
  private ground = 0;
  private grounds = 0;
  toGround: ((id: number, i: number, j: number, bmp: ImageBitmap, ms: number, walls?: WallBitMsg[], flow?: FlowBits<ImageBitmap> | null) => void) | null = null;
  /** (ACT 2, THE GATE WARD) Who is told of each house's shell as it comes (render/act2_houses.ts), for the floor of that number. */
  private toShells: { id: number; took: (n: number, sh: { x0: number; y0: number; w: number; h: number }, bmp: ImageBitmap | null) => void } | null = null;
  /**
   * THE HERO'S PICTURES, painted ahead by the same worker (the ground's: it is kept for the whole game). `toHero` takes in
   * each frame as it comes (render/render.ts): true if it was wanted. `heroAsked`: what has been asked of it.
   */
  toHero: ((cls: ClassId, place: HeroPlace, v: number, l: number, i: number, s: Sprite) => boolean) | null = null;
  private heroAsked = new Set<string>();
  /** The hero's frames taken in from the worker, for measuring. */
  heroFrames = 0;
  /**
   * THE FLOOR'S OTHER MONSTERS (all but the heavy ones, which have a worker of their own): their pictures painted ahead by
   * the side worker too, once it is up, in place of the game painting them ahead a little each frame (a monster's frame
   * on the bones is a frame's whole time and more to paint on a phone). What has been asked of it this place, and how
   * many of each figure's frames are still to come (-1: not begun).
   */
  private sideFigures = new Map<MonsterFigure, { left: number }>();
  /** The monsters' frames taken in from the side worker, for measuring. */
  sideFrames = 0;

  /**
   * `source`: the game's own script (null: there is none to be had, and no painter). `bestiary`: the
   * monsters' pictures as the game holds them now. `small`: a device with little room (a phone).
   * `many`: how many workers (for the tests; otherwise by the machine's cores).
   */
  constructor(source: string | null, private readonly bestiary: () => Bestiary, opts: { small?: boolean; many?: number } = {}) {
    this.small = !!opts.small;
    const cores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 2;
    this.many = opts.many ?? (cores >= 4 ? 2 : 1);
    if (this.many < 1 || !source || !source.includes(PAINTER_MARK)) return;
    if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
    try {
      this.url = URL.createObjectURL(new Blob([PRELUDE, source], { type: 'text/javascript' }));
      this.state = 'on';
    } catch (err) {
      this.fail('start', err);
    }
  }

  /**
   * The floor has been left (or the game has): its workers are ended, its films and its bosses' pictures
   * let go of. Call it when a new place is come into, before anything of the place is asked for.
   */
  restart(): void {
    // (the ground's worker is kept: it takes seconds to start, and is sent each floor anew; the last floor's pieces not yet painted are not wanted)
    this.end(true);
    this.ground = 0;
    // (the last place's monsters still being painted by the side worker are not wanted)
    const lane = this.groundLane;
    for (const [figure, f] of this.sideFigures) {
      if (!lane || f.left === 0) continue;
      lane.worker.postMessage({ t: 'drop', figure } satisfies Ask);
      lane.open = Math.max(0, lane.open - 1);
    }
    this.sideFigures.clear();
    for (const film of this.films.values()) eachSprite(film, releaseSprite);
    this.films.clear();
    this.asked.clear();
    // (the heavy figures, whoever painted them: the painter, or the game for itself where there is none)
    const b = this.bestiary();
    for (const f of HEAVY_FIGURES) b.forget(f);
    this.figures.clear();
  }

  /**
   * Have a figure's frames painted (a heavy one: a boss of floors 2 to 5). True: the painter is at it, and
   * the game need not paint it ahead for itself. (Asking again is nothing.)
   */
  mob(figure: MonsterFigure): boolean {
    if (this.state !== 'on') return false;
    if (this.figures.has(figure)) return true;
    const lane = this.lane(0);
    if (!lane) return false;
    this.figures.set(figure, { left: -1 });
    this.ask(lane, { t: 'mob', figure, pri: 1 });
    return true;
  }

  /** A figure of this floor will not be shown again (the Chained One as he was before a chain broke): its pictures are let go of, and the painter stops painting them. */
  done(figure: MonsterFigure): void {
    const was = this.figures.get(figure);
    if (!was) return;
    this.figures.delete(figure);
    const drop: Ask = { t: 'drop', figure };
    // (its frames were the first worker's to paint: if it had not finished them, it never will)
    const lane = this.lanes[0];
    if (lane) {
      lane.worker.postMessage(drop);
      if (was.left !== 0) this.finished(lane);
    }
    this.bestiary().forget(figure);
  }

  /** How many of a figure's frames the painter has still to hand over (0: all are here, or it was never asked for; -1: not begun). */
  left(figure: MonsterFigure): number {
    return this.figures.get(figure)?.left ?? 0;
  }

  /**
   * Have a film made (art/films.ts: its key). `soon`: before the floor's other films (the stairwell's
   * opening and the cage, which a boss's death needs, before the floor's moments); `now`, before the monsters' pictures
   * too. False: it will not be
   * (there is no painter, or the device has not the room for it).
   */
  film(key: string, soon = false, now = false): boolean {
    if (this.state !== 'on') return false;
    if (this.asked.has(key)) return true;
    if (this.small && filmRoom(key) > SMALL_ROOM) return false;
    const lane = this.lane(this.many - 1);
    if (!lane) return false;
    this.asked.add(key);
    // (`now`: before even the monsters' pictures: a small film the place shows as it is come into, EXITS' ways)
    this.ask(lane, { t: 'film', key, pri: now ? 0.5 : soon ? 2 : 3 });
    return true;
  }

  /** A film that has been made, or null: not yet (or never). */
  filmOf<T>(key: string): T | null {
    return (this.films.get(key) as T | undefined) ?? null;
  }

  /**
   * ACT 1: the ground of this floor is to be painted by the ground's worker: it is sent the floor (and keeps it until
   * the place is left). The floor's number, for its pieces; 0: there is no painter (the game paints the ground itself).
   */
  groundBegin(floor: Floor, land: Land, walls = 0): number {
    if (!this.warmGround()) return 0;
    this.ground = ++this.grounds;
    try {
      this.groundLane!.worker.postMessage({ t: 'ground', id: this.ground, floor, land, walls } satisfies Ask);
    } catch (err) {
      this.fail('ground', err);
      return 0;
    }
    return this.ground;
  }

  /** ACT 1: the ground's worker started ahead of need (it takes seconds), for a hero who has come as far as the descent. True: it is there. */
  warmGround(): boolean {
    if (this.state !== 'on' || !this.url) return false;
    if (!this.groundLane) {
      let worker: Worker;
      try {
        worker = new Worker(this.url);
      } catch (err) {
        this.fail('ground', err);
        return false;
      }
      const lane: Lane = { n: -1, worker, ready: false, open: 0 };
      worker.onmessage = (e: MessageEvent<Tell>) => this.toldGround(lane, e.data);
      worker.onerror = (e: ErrorEvent) => {
        e.preventDefault?.();
        if (this.groundLane === lane) this.fail('ground', e.message || 'error');
      };
      this.groundLane = lane;
      this.stats.workers++;
    }
    return true;
  }

  /**
   * The hero's pictures in that place to be painted ahead by the worker. True: the worker is up and has them in hand (the
   * game need not paint them ahead itself); false: the game goes on painting them ahead as before.
   */
  hero(cls: ClassId, place: HeroPlace): boolean {
    if (!this.warmGround() || !this.groundLane || !this.groundLane.ready) return false;
    const key = `${cls}:${place}`;
    if (!this.heroAsked.has(key)) {
      this.heroAsked.add(key);
      this.groundLane.open++;
      // (the Warlock's demon before his arm blazing: it is the heavier by far, and its frames are not painted in the game: art/kit.ts HEAVY)
      this.groundLane.worker.postMessage({ t: 'hero', cls, place, pri: place === 'town' ? 30 : place === 'dungeon' ? 31 : place === 'demon' ? 31.5 : 32 } satisfies Ask);
    }
    return true;
  }

  /**
   * A monster's pictures (one not heavy) to be painted ahead by the side worker. True: the worker is up and has them in
   * hand, or they are all here already (the game need not paint them ahead itself); false: the game goes on painting them
   * ahead as before. (Asking again is nothing.)
   */
  side(figure: MonsterFigure): boolean {
    const lane = this.groundLane;
    if (this.state !== 'on' || !lane || !lane.ready) return false;
    if (this.sideFigures.has(figure)) return true;
    // (a figure the game holds whole already, from the place before, is not painted again)
    if (allPainted(this.bestiary().of(figure))) {
      this.sideFigures.set(figure, { left: 0 });
      return true;
    }
    this.sideFigures.set(figure, { left: -1 });
    lane.open++;
    lane.worker.postMessage({ t: 'mob', figure, pri: 2, side: true } satisfies Ask);
    return true;
  }

  /** How many of a monster's frames the side worker has still to hand over (0: all are here, or it was never asked; -1: not begun). For the tests. */
  sideLeft(figure: MonsterFigure): number {
    return this.sideFigures.get(figure)?.left ?? 0;
  }

  /**
   * ACT 2, THE GATE WARD: the shells of a floor's houses walked into (render/act2_houses.ts) painted by the ground's worker, a
   * house at a time between the ground's pieces, each handed to `took` as it comes (`n` -1: they cannot be). False: there is no
   * ground's worker (the page paints them itself).
   */
  shells(id: number, land: Land, floor: Floor, took: (n: number, sh: { x0: number; y0: number; w: number; h: number }, bmp: ImageBitmap | null) => void, walls = false, near?: readonly [number, number]): boolean {
    if (!this.warmGround() || !this.groundLane) return false;
    try {
      // (wanted at 1.5: after the ground round the screen, before the monsters' pictures; the houses nearest `near` first)
      this.groundLane.worker.postMessage({ t: 'shells', id, floor, land, pri: 1.5, walls, near } satisfies Ask);
    } catch (err) {
      this.fail('ground', err);
      return false;
    }
    this.groundLane.open++;
    this.toShells = { id, took };
    return true;
  }

  /** ACT 1: the ground's worker is up and painting (until it is, a floor's ground is painted by the game, a little each frame, as before). */
  groundReady(): boolean {
    return this.state === 'on' && !!this.groundLane && this.groundLane.ready;
  }

  /** ACT 1: a piece of this floor's ground, wanted (`pri`: the lower the sooner; asked again, sooner than it was: the worker paints it once). False: there is no ground's worker. */
  groundPiece(id: number, i: number, j: number, pri: number): boolean {
    const lane = this.groundLane;
    if (this.state !== 'on' || !lane || id !== this.ground) return false;
    lane.open++;
    lane.worker.postMessage({ t: 'piece', id, i, j, pri } satisfies Ask);
    return true;
  }

  private toldGround(lane: Lane, m: Tell): void {
    if (m.t === 'ready') {
      lane.ready = true;
      return;
    }
    if (m.t === 'piece') {
      lane.open = Math.max(0, lane.open - 1);
      if (this.groundLane === lane && m.id === this.ground && this.toGround) this.toGround(m.id, m.i, m.j, m.bmp, m.ms, m.walls, m.flow);
      else {
        m.bmp.close();
        for (const b of m.walls ?? []) b.img.close();
        for (const f of m.flow?.frames ?? []) f.close();
      }
      return;
    }
    if (m.t === 'shell') {
      if (m.last || m.n < 0) lane.open = Math.max(0, lane.open - 1);
      const to = this.groundLane === lane && this.toShells && this.toShells.id === m.id ? this.toShells : null;
      if (to) to.took(m.n, m, m.bmp);
      else m.bmp?.close();
      return;
    }
    if (m.t === 'frames') {
      const want = this.groundLane === lane ? this.sideFigures.get(m.figure) : undefined;
      const art = want ? this.bestiary().of(m.figure) : null;
      for (const g of m.list) {
        if (g.s) {
          if (art && giveFrame(art, g.v, g.l, g.i, g.s)) this.sideFrames++;
          else (g.s.img as unknown as ImageBitmap).close();
        } else if (g.same && art) {
          const from = framesOf(g.same[0] === 0 ? art.front : art.back)[g.same[1]];
          const d = from ? Object.getOwnPropertyDescriptor(from, g.same[2]) : undefined;
          if (d && 'value' in d && d.value) giveFrame(art, g.v, g.l, g.i, d.value as Sprite);
        }
      }
      if (want) {
        if (want.left !== 0 && m.left === 0) lane.open = Math.max(0, lane.open - 1);
        want.left = m.left;
      }
      return;
    }
    if (m.t === 'heroFrames') {
      const mine = this.groundLane === lane;
      for (const g of m.list) {
        if (g.s) {
          if (mine && this.toHero && this.toHero(m.cls, m.place, g.v, g.l, g.i, g.s)) this.heroFrames++;
          else (g.s.img as unknown as ImageBitmap).close();
        }
      }
      if (m.left === 0) lane.open = Math.max(0, lane.open - 1);
      return;
    }
    if (m.t === 'fail') {
      this.stats.failed.push(`${m.what}: ${m.why}`);
      if (this.groundLane === lane) this.fail(m.what, m.why);
    }
  }

  /** Is anything asked for still to come? (For the tests.) */
  busy(): boolean {
    return this.lanes.some((l) => !!l && l.open > 0);
  }

  private ask(lane: Lane, ask: Ask): void {
    lane.open++;
    lane.worker.postMessage(ask);
  }

  /** The worker of that number, made if it is not there. */
  private lane(n: number): Lane | null {
    if (this.state !== 'on' || !this.url) return null;
    const have = this.lanes[n];
    if (have) return have;
    let worker: Worker;
    try {
      worker = new Worker(this.url);
    } catch (err) {
      this.fail('worker', err);
      return null;
    }
    const lane: Lane = { n, worker, ready: false, open: 0 };
    worker.onmessage = (e: MessageEvent<Tell>) => this.told(lane, e.data);
    worker.onerror = (e: ErrorEvent) => {
      e.preventDefault?.();
      if (this.lanes[n] === lane) this.fail('worker', e.message || 'error');
    };
    this.lanes[n] = lane;
    this.stats.workers++;
    if (this.watchdog === null) {
      this.watchdog = setTimeout(() => {
        this.watchdog = null;
        if (this.lanes.some((l) => !!l && !l.ready)) this.fail('worker', 'never ready');
      }, READY_MS);
    }
    return lane;
  }

  /** A worker has finished one of the things asked of it. With nothing left to do it is ended: what it holds (the art's own keeping of what it made, and its working room) is given back. */
  private finished(lane: Lane): void {
    lane.open--;
    if (lane.open > 0 || this.lanes[lane.n] !== lane) return;
    lane.worker.onmessage = null;
    lane.worker.onerror = null;
    lane.worker.terminate();
    this.lanes[lane.n] = null;
  }

  private told(lane: Lane, m: Tell): void {
    // (a worker that has been ended may still have had something on its way: it is not wanted)
    const mine = this.lanes[lane.n] === lane;
    if (m.t === 'ready') {
      lane.ready = true;
      return;
    }
    if (m.t === 'frames') {
      const want = mine ? this.figures.get(m.figure) : undefined;
      const art = want ? this.bestiary().of(m.figure) : null;
      for (const g of m.list) {
        if (g.s) {
          if (art && giveFrame(art, g.v, g.l, g.i, g.s)) this.stats.frames++;
          else {
            (g.s.img as unknown as ImageBitmap).close();
            if (art) this.stats.late++;
          }
        } else if (g.same && art) {
          // (the same picture as another frame, which is here: the painter's, or the game's own)
          const from = framesOf(g.same[0] === 0 ? art.front : art.back)[g.same[1]];
          const d = from ? Object.getOwnPropertyDescriptor(from, g.same[2]) : undefined;
          if (d && 'value' in d && d.value) giveFrame(art, g.v, g.l, g.i, d.value as Sprite);
        }
      }
      if (want) want.left = m.left;
      if (m.left === 0 && want) this.finished(lane);
      return;
    }
    if (m.t === 'film') {
      if (!mine || !this.asked.has(m.key)) {
        eachSprite(m.film, (s) => (s.img as unknown as ImageBitmap).close());
        return;
      }
      this.films.set(m.key, m.film);
      this.stats.films[m.key] = Math.round(m.ms);
      this.finished(lane);
      return;
    }
    // (a piece of ground, or a hero's frames, are the ground worker's: none comes to these lanes)
    if (m.t === 'piece') {
      m.bmp.close();
      for (const b of m.walls ?? []) b.img.close();
      for (const f of m.flow?.frames ?? []) f.close();
      return;
    }
    if (m.t === 'heroFrames') {
      for (const g of m.list) if (g.s) (g.s.img as unknown as ImageBitmap).close();
      return;
    }
    if (m.t === 'shell') {
      m.bmp?.close();
      return;
    }
    // (a film that could not be made is done without; a worker that cannot paint at all is no painter)
    this.stats.failed.push(`${m.what}: ${m.why}`);
    if (!mine) return;
    if (m.what.startsWith('film ')) this.finished(lane);
    else this.fail(m.what, m.why);
  }

  private end(keepGround = false): void {
    for (const lane of this.lanes) {
      if (!lane) continue;
      lane.worker.onmessage = null;
      lane.worker.onerror = null;
      lane.worker.terminate();
    }
    this.lanes = [];
    if (this.groundLane && !keepGround) {
      this.groundLane.worker.onmessage = null;
      this.groundLane.worker.onerror = null;
      this.groundLane.worker.terminate();
      this.groundLane = null;
      this.ground = 0;
      this.heroAsked.clear();
    }
    if (this.watchdog !== null) clearTimeout(this.watchdog);
    this.watchdog = null;
  }

  /** The painter cannot be had: from here on the game paints for itself. (What has been handed over is kept.) */
  private fail(what: string, err: unknown): void {
    this.stats.failed.push(`${what}: ${err instanceof Error ? err.message : String(err)}`);
    this.state = 'off';
    this.end();
    // (the figures are the game's to paint now; it is told so by `mob` and `side` saying false)
    this.figures.clear();
    this.sideFigures.clear();
  }
}

/** Every sprite in a film (or in anything made of lists and plain things), each once. */
export function eachSprite(v: unknown, f: (s: Sprite) => void, seen = new Set<unknown>()): void {
  if (!v || typeof v !== 'object' || seen.has(v)) return;
  seen.add(v);
  if (isSprite(v)) {
    f(v);
    return;
  }
  if (Array.isArray(v)) {
    for (const x of v) eachSprite(x, f, seen);
    return;
  }
  if (ArrayBuffer.isView(v)) return;
  for (const x of Object.values(v as Record<string, unknown>)) eachSprite(x, f, seen);
}

// ---------------------------------------------------------------------------------------------------
// THE WORKER'S SIDE

type Canvas2 = { width: number; height: number; getContext(kind: '2d'): CanvasRenderingContext2D | null; transferToImageBitmap(): ImageBitmap };

/** A sprite whose picture has been handed over already (its canvas left empty). */
function emptied(s: Sprite): boolean {
  const cv = s.img as unknown as Canvas2;
  return cv.width === 0 || cv.height === 0;
}

/** Is every frame of a figure painted (none still waiting to be painted the first time it is shown)? */
function allPainted(art: ActorArt): boolean {
  const lists = [framesOf(art.front), framesOf(art.back)];
  for (const [v, l, i] of paintOrder(art)) {
    const d = Object.getOwnPropertyDescriptor(lists[v][l], i);
    if (d && typeof d.get === 'function') return false;
  }
  return true;
}

/** The sprite with its picture as one that can be handed over (the canvas it was painted on is left empty). */
function shipped(s: Sprite, transfer: Transferable[]): Sprite {
  const cv = s.img as unknown as Canvas2;
  const img = cv.transferToImageBitmap();
  cv.width = 0;
  cv.height = 0;
  transfer.push(img);
  return { ...s, img: img as unknown as HTMLCanvasElement };
}

/**
 * The sprite cut down to what is painted in it, on whole game pixels (so it is laid down where it was),
 * as a picture that can be handed over. (A film's frames are all the size of the biggest.)
 */
function cut(s: Sprite, transfer: Transferable[]): Sprite {
  const cv = s.img as unknown as Canvas2;
  const d = s.density ?? 1;
  const W = cv.width;
  const H = cv.height;
  const data = W > 0 && H > 0 ? cv.getContext('2d')?.getImageData(0, 0, W, H).data : undefined;
  let x0 = 0;
  let y0 = 0;
  let x1 = d;
  let y1 = d;
  if (data) {
    const a = new Uint32Array(data.buffer, data.byteOffset, W * H);
    const rowHas = (y: number): boolean => {
      for (let i = y * W, e = i + W; i < e; i++) if (a[i] !== 0) return true;
      return false;
    };
    let top = 0;
    while (top < H && !rowHas(top)) top++;
    if (top < H) {
      let bottom = H - 1;
      while (bottom > top && !rowHas(bottom)) bottom--;
      let left = W;
      let right = -1;
      for (let y = top; y <= bottom; y++) {
        const r = y * W;
        for (let x = 0; x < left; x++) {
          if (a[r + x] !== 0) {
            left = x;
            break;
          }
        }
        for (let x = W - 1; x > right; x--) {
          if (a[r + x] !== 0) {
            right = x;
            break;
          }
        }
      }
      x0 = Math.floor(left / d) * d;
      y0 = Math.floor(top / d) * d;
      x1 = Math.min(W, Math.ceil((right + 1) / d) * d);
      y1 = Math.min(H, Math.ceil((bottom + 1) / d) * d);
    }
  }
  const w = Math.max(1, x1 - x0);
  const h = Math.max(1, y1 - y0);
  const out = new OffscreenCanvas(w, h);
  if (data) (out.getContext('2d') as unknown as CanvasRenderingContext2D).drawImage(cv as unknown as CanvasImageSource, x0, y0, w, h, 0, 0, w, h);
  const img = out.transferToImageBitmap();
  transfer.push(img);
  const dx = x0 / d;
  const dy = y0 / d;
  const moved = (l: Light): Light => ({ ...l, x: l.x - dx, y: l.y - dy });
  const t: Sprite = { ...s, img: img as unknown as HTMLCanvasElement, w: w / d, h: h / d, ax: s.ax - dx, ay: s.ay - dy };
  if (s.lights) t.lights = s.lights.map(moved);
  if (s.aura) t.aura = moved(s.aura);
  if (s.tails) t.tails = s.tails.map((r) => ({ ...r, x: r.x - dx, y: r.y - dy }));
  if (s.charge) t.charge = { ...s.charge, x: s.charge.x - dx, y: s.charge.y - dy };
  return t;
}

/** The lists of a film that are its frames (and not what is there before and after, which may be a picture of the floor's that other films show too). */
const FILM_FRAMES = ['frames', 'back', 'front'];

/**
 * A film as it is handed over: every picture in it cut down, a picture that is in it twice still one
 * picture. The canvases its frames were painted on are emptied (they are the film's own, and the room
 * they take is most of what the worker holds).
 */
function packed(film: unknown, transfer: Transferable[]): unknown {
  const made = new Map<Sprite, Sprite>();
  const own = new Set<Sprite>();
  const walk = (v: unknown, frames: boolean): unknown => {
    if (!v || typeof v !== 'object') return v;
    if (isSprite(v)) {
      if (frames) own.add(v);
      let t = made.get(v);
      if (!t) {
        t = cut(v, transfer);
        made.set(v, t);
      }
      return t;
    }
    if (Array.isArray(v)) return v.map((x) => walk(x, frames));
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) out[k] = walk(x, frames || FILM_FRAMES.includes(k));
    return out;
  };
  const out = walk(film, false);
  for (const s of own) {
    const cv = s.img as unknown as Canvas2;
    cv.width = 0;
    cv.height = 0;
  }
  return out;
}

/** The game's script, running as a painter's worker (main.ts): it paints what it is asked for, the most wanted first, and hands it over. */
export function paintWorkerMain(): void {
  const scope = self as unknown as { postMessage(m: Tell, transfer?: Transferable[]): void; onmessage: ((e: MessageEvent<Ask>) => void) | null };
  const bestiary = makeBestiary();
  interface Job {
    ask: Exclude<Ask, { t: 'drop' } | { t: 'ground' }>;
    seq: number;
    run?: Generator<void, void, void>;
  }
  const jobs: Job[] = [];
  let seq = 0;
  let going = false;
  /** ACT 1: the floor whose ground this worker paints, and its terrain (and which floor it is: ACT 2, for the Gate Ward's shells). */
  let ground: { id: number; T: Terrain; key: string; stands: ((x: number, y: number) => boolean) | null; near: ((x: number, y: number) => boolean) | null; rows: Rows | null; flow: FlowLayer | null } | null = null;
  const keyOf = (land: Land, floor: Floor): string => `${land.kind}:${land.depth}:${land.seed}:${floor.w}x${floor.h}`;

  /** (ACT 2, THE GATE WARD) A floor's houses' shells, a house a step, each handed over as it is painted (render/act2_houses.ts). */
  function* shells(ask: { id: number; floor: Floor; land: Land; walls?: boolean; near?: readonly [number, number] }): Generator<void, void, void> {
    const open = ground && ground.key === keyOf(ask.land, ask.floor) ? ground.T : landTerrain(ask.land, ask.floor, !!ask.walls);
    const mk = shellMaker(gateWardLand(ask.land, ask.floor, !!ask.walls), open, !!ask.walls);
    if (mk.count === 0) scope.postMessage({ t: 'shell', id: ask.id, n: -1, x0: 0, y0: 0, w: 0, h: 0, bmp: null, ms: 0, last: true });
    // (the houses nearest where the hero came in first)
    const houses = ask.land.houses ?? [];
    const order = houses.map((_, n) => n);
    const near = ask.near;
    if (near) {
      const far = (n: number): number => Math.hypot((houses[n].room[0] + houses[n].room[2]) / 2 - near[0], (houses[n].room[1] + houses[n].room[3]) / 2 - near[1]);
      order.sort((a, b) => far(a) - far(b));
    }
    for (let k = 0; k < mk.count; k++) {
      const n = order[k] ?? k;
      yield;
      const t0 = performance.now();
      const sh = mk.make(n);
      const cv = new OffscreenCanvas(sh.w, sh.h);
      (cv.getContext('2d') as unknown as CanvasRenderingContext2D).putImageData(new ImageData(sh.rgba, sh.w, sh.h), 0, 0);
      const bmp = cv.transferToImageBitmap();
      scope.postMessage({ t: 'shell', id: ask.id, n, x0: sh.x0, y0: sh.y0, w: sh.w, h: sh.h, bmp, ms: performance.now() - t0, last: k === mk.count - 1 }, [bmp]);
    }
  }
  /** The heroes' pictures, made here as the page makes them (art/heroes3.ts), the first time they are asked for. */
  let heroArt: ReturnType<typeof makeHeroArt3> | null = null;

  /** A hero's frames in a place, painted and handed over a few at a time, in the order the page paints them ahead. */
  function* hero(cls: ClassId, place: HeroPlace): Generator<void, void, void> {
    heroArt ??= makeHeroArt3();
    const art = heroArt.of(cls, lookOfPlace(place));
    const lists = [heroLists(art.front), heroLists(art.back)];
    const order: [number, number, number][] = [];
    for (let l = 0; l < lists[0].length; l++) for (let v = 0; v < 2; v++) for (let i = 0; i < lists[v][l].length; i++) order.push([v, l, i]);
    const sent = new Set<Sprite>();
    let list: Given[] = [];
    let transfer: Transferable[] = [];
    let t0 = performance.now();
    if (order.length === 0) scope.postMessage({ t: 'heroFrames', cls, place, list, left: 0 });
    for (let n = 0; n < order.length; n++) {
      const [v, l, i] = order[n];
      const s = lists[v][l][i];
      // (a frame that is in two lists is sent once: the page takes in the first)
      if (!sent.has(s) && !emptied(s)) {
        sent.add(s);
        list.push({ v, l, i, s: shipped(s, transfer) });
      }
      const last = n === order.length - 1;
      if (last || performance.now() - t0 >= CHUNK_MS) {
        scope.postMessage({ t: 'heroFrames', cls, place, list, left: order.length - 1 - n }, transfer);
        list = [];
        transfer = [];
        if (!last) yield;
        t0 = performance.now();
      }
    }
  }

  /** A figure's frames, painted and handed over a few at a time. */
  function* mob(figure: MonsterFigure, side = false): Generator<void, void, void> {
    const art = bestiary.of(figure);
    const lists = [framesOf(art.front), framesOf(art.back)];
    const order = paintOrder(art);
    const sent = new Map<Sprite, [number, number, number]>();
    let list: Given[] = [];
    let transfer: Transferable[] = [];
    let t0 = performance.now();
    if (order.length === 0) scope.postMessage({ t: 'frames', figure, list, left: 0 });
    for (let n = 0; n < order.length; n++) {
      const [v, l, i] = order[n];
      // (reading it is what paints it)
      const s = lists[v][l][i];
      const was = sent.get(s);
      if (was) list.push({ v, l, i, same: was });
      // (a picture handed over already, with another figure's frames, is not sent: the game paints its own, if it is ever shown)
      else if (!emptied(s)) {
        sent.set(s, [v, l, i]);
        list.push({ v, l, i, s: shipped(s, transfer) });
      }
      const last = n === order.length - 1;
      if (last || performance.now() - t0 >= CHUNK_MS) {
        scope.postMessage({ t: 'frames', figure, list, left: order.length - 1 - n }, transfer);
        list = [];
        transfer = [];
        if (!last) yield;
        t0 = performance.now();
      }
    }
    // (the side worker is kept for the whole game: what it made of the figure is spent, and let go of)
    if (side) bestiary.forget(figure);
  }

  // (between one piece of work and the next the worker goes back to its queue, so that what has been asked of it meanwhile is heard;
  // on a machine of two cores or fewer it rests as long as it worked, so that the game, on the other, is never starved)
  const channel = new MessageChannel();
  const cores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4;
  const again = (): void => {
    if (cores <= 2) setTimeout(() => channel.port2.postMessage(0), CHUNK_MS);
    else channel.port2.postMessage(0);
  };
  const pump = (): void => {
    if (jobs.length === 0) {
      going = false;
      return;
    }
    let job = jobs[0];
    for (const j of jobs) if (j.ask.pri < job.ask.pri || (j.ask.pri === job.ask.pri && j.seq < job.seq)) job = j;
    const done = (): void => {
      jobs.splice(jobs.indexOf(job), 1);
    };
    try {
      if (job.ask.t === 'piece') {
        done();
        const a = job.ask;
        if (ground && ground.id === a.id) {
          const t0 = performance.now();
          // (ACT 2, behind ACT2_WALLS: the walls toward the eye standing whole over it, painted with it: art/standing.ts)
          const both = ground.stands && ground.near ? paintWithStanding(ground.T, ground.stands, ground.near, a.i * PIECE, a.j * PIECE, PIECE, PIECE) : null;
          const p = both ? both.ground : paintTerrain(ground.T, a.i * PIECE, a.j * PIECE, PIECE, PIECE);
          const cv = new OffscreenCanvas(PIECE, PIECE);
          (cv.getContext('2d') as unknown as CanvasRenderingContext2D).putImageData(new ImageData(p.rgba, PIECE, PIECE), 0, 0);
          const bmp = cv.transferToImageBitmap();
          const walls: WallBitMsg[] = [];
          if (both) {
            // (LOW_STACKS: the library's rows stood low with the walls, render/outdoor.ts withLow)
            for (const b of standingBits(withLow(ground.rows, both.standing, a.i * PIECE, a.j * PIECE, PIECE, PIECE))) {
              const bc = new OffscreenCanvas(b.w, b.h);
              (bc.getContext('2d') as unknown as CanvasRenderingContext2D).putImageData(new ImageData(b.rgba, b.w, b.h), 0, 0);
              walls.push({ d: b.d, x0: b.x0, y0: b.y0, w: b.w, h: b.h, img: bc.transferToImageBitmap() });
            }
          }
          // (FLOW: its water, moving, every frame of it, cut to where the water is)
          const flow = ground.flow
            ? paintFlows(ground.flow, a.i * PIECE, a.j * PIECE, (rgba, box) => {
                const fc = new OffscreenCanvas(box.w, box.h);
                (fc.getContext('2d') as unknown as CanvasRenderingContext2D).putImageData(new ImageData(rgba, PIECE, PIECE), -box.x, -box.y, box.x, box.y, box.w, box.h);
                return fc.transferToImageBitmap();
              })
            : null;
          scope.postMessage({ t: 'piece', id: a.id, i: a.i, j: a.j, bmp, ms: performance.now() - t0, walls, flow }, [bmp, ...walls.map((b) => b.img), ...(flow ? flow.frames : [])]);
        }
      } else if (job.ask.t === 'hero') {
        job.run ??= hero(job.ask.cls, job.ask.place);
        if (job.run.next().done) done();
      } else if (job.ask.t === 'shells') {
        job.run ??= shells(job.ask);
        if (job.run.next().done) done();
      } else if (job.ask.t === 'film') {
        done();
        const t0 = performance.now();
        const transfer: Transferable[] = [];
        const film = packed(makeFilm(job.ask.key), transfer);
        scope.postMessage({ t: 'film', key: job.ask.key, film, ms: performance.now() - t0 }, transfer);
      } else {
        job.run ??= mob(job.ask.figure, !!job.ask.side);
        if (job.run.next().done) done();
        // (the side worker's monsters take turns, a piece of work each, so that every one of them can stand and walk before any has all of its moves)
        else if (job.ask.side) job.seq = seq++;
      }
    } catch (err) {
      if (jobs.includes(job)) done();
      // (ACT 2: the Gate Ward's shells that cannot be painted here are the page's to paint)
      if (job.ask.t === 'shells') scope.postMessage({ t: 'shell', id: job.ask.id, n: -1, x0: 0, y0: 0, w: 0, h: 0, bmp: null, ms: 0, last: true });
      else scope.postMessage({ t: 'fail', what: job.ask.t === 'film' ? `film ${job.ask.key}` : job.ask.t === 'piece' ? 'ground' : job.ask.t === 'hero' ? `hero ${job.ask.cls}` : `mob ${job.ask.figure}`, why: err instanceof Error ? `${err.message}` : String(err) });
    }
    again();
  };
  channel.port1.onmessage = pump;
  scope.onmessage = (e) => {
    const ask = e.data;
    if (ask.t === 'ground') {
      // (a new floor: its terrain made once here, as the page makes its own; the last floor's pieces still asked for are not wanted)
      try {
        const T = landTerrain(ask.land, ask.floor, ask.walls > 0);
        const near = ask.walls > 0 ? nearOf(T, ask.walls) : null;
        const stands = near ? (x: number, y: number): boolean => !T.ground(x, y) && !T.drop(x, y) && near(x, y) : null;
        ground = { id: ask.id, T, key: keyOf(ask.land, ask.floor), stands, near, rows: lowRowsOf(ask.land, ask.floor), flow: flowOfLand(ask.land) };
      } catch (err) {
        scope.postMessage({ t: 'fail', what: 'ground', why: err instanceof Error ? err.message : String(err) });
      }
      for (let i = jobs.length - 1; i >= 0; i--) if (jobs[i].ask.t === 'piece') jobs.splice(i, 1);
      return;
    }
    if (ask.t === 'drop') {
      for (let i = jobs.length - 1; i >= 0; i--) {
        const j = jobs[i];
        if (j.ask.t === 'mob' && j.ask.figure === ask.figure) jobs.splice(i, 1);
      }
      bestiary.forget(ask.figure);
      return;
    }
    // (a piece of the ground asked for again, wanted sooner: the piece already waiting is wanted that soon, and not painted twice)
    if (ask.t === 'piece') {
      const was = jobs.find((j) => j.ask.t === 'piece' && j.ask.id === ask.id && j.ask.i === ask.i && j.ask.j === ask.j);
      if (was) {
        was.ask.pri = Math.min(was.ask.pri, ask.pri);
        return;
      }
    }
    if (ask.t === 'mob' && !ask.side && !FIRST5_FIGURES.includes(ask.figure)) {
      scope.postMessage({ t: 'fail', what: `mob ${ask.figure}`, why: 'not a figure the painter paints' });
      return;
    }
    jobs.push({ ask, seq: seq++ });
    if (!going) {
      going = true;
      again();
    }
  };
  scope.postMessage({ t: 'ready' });
}
