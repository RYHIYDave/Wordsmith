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
import { filmRoom, makeFilm } from '../art/films';
import { paintTerrain, terrainOf } from '../art/terrain';
import type { Terrain } from '../art/terrain';
import type { Land } from '../game/act1_layout';
import type { Floor } from '../game/types';
import { PIECE, landLook } from './outdoor';
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
  | { t: 'mob'; figure: MonsterFigure; pri: number }
  | { t: 'film'; key: string; pri: number }
  | { t: 'drop'; figure: MonsterFigure }
  // ACT 1: a floor's outdoor ground (render/outdoor.ts): the floor to paint it from, then its pieces as they are wanted
  | { t: 'ground'; id: number; floor: Floor; land: Land }
  | { t: 'piece'; id: number; i: number; j: number; pri: number };
/** What a worker tells the page. */
type Tell =
  | { t: 'ready' }
  | { t: 'frames'; figure: MonsterFigure; list: Given[]; left: number }
  | { t: 'film'; key: string; film: unknown; ms: number }
  | { t: 'piece'; id: number; i: number; j: number; bmp: ImageBitmap; ms: number }
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
  toGround: ((id: number, i: number, j: number, bmp: ImageBitmap, ms: number) => void) | null = null;

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
   * opening and the cage, which a boss's death needs, before the floor's moments). False: it will not be
   * (there is no painter, or the device has not the room for it).
   */
  film(key: string, soon = false): boolean {
    if (this.state !== 'on') return false;
    if (this.asked.has(key)) return true;
    if (this.small && filmRoom(key) > SMALL_ROOM) return false;
    const lane = this.lane(this.many - 1);
    if (!lane) return false;
    this.asked.add(key);
    this.ask(lane, { t: 'film', key, pri: soon ? 2 : 3 });
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
  groundBegin(floor: Floor, land: Land): number {
    if (!this.warmGround()) return 0;
    this.ground = ++this.grounds;
    try {
      this.groundLane!.worker.postMessage({ t: 'ground', id: this.ground, floor, land } satisfies Ask);
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

  /** ACT 1: the ground's worker is up and painting (until it is, a floor's ground is painted by the game, a little each frame, as before). */
  groundReady(): boolean {
    return this.state === 'on' && !!this.groundLane && this.groundLane.ready;
  }

  /** ACT 1: a piece of this floor's ground, wanted (`pri`: the lower the sooner). False: there is no ground's worker. */
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
      if (this.groundLane === lane && m.id === this.ground && this.toGround) this.toGround(m.id, m.i, m.j, m.bmp, m.ms);
      else m.bmp.close();
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
    // (a piece of ground is the ground worker's: none comes to these lanes)
    if (m.t === 'piece') {
      m.bmp.close();
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
    }
    if (this.watchdog !== null) clearTimeout(this.watchdog);
    this.watchdog = null;
  }

  /** The painter cannot be had: from here on the game paints for itself. (What has been handed over is kept.) */
  private fail(what: string, err: unknown): void {
    this.stats.failed.push(`${what}: ${err instanceof Error ? err.message : String(err)}`);
    this.state = 'off';
    this.end();
    // (the figures are the game's to paint now; it is told so by `mob` saying false)
    this.figures.clear();
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
  /** ACT 1: the floor whose ground this worker paints, and its terrain. */
  let ground: { id: number; T: Terrain } | null = null;

  /** A figure's frames, painted and handed over a few at a time. */
  function* mob(figure: MonsterFigure): Generator<void, void, void> {
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
      else {
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
          const p = paintTerrain(ground.T, a.i * PIECE, a.j * PIECE, PIECE, PIECE);
          const cv = new OffscreenCanvas(PIECE, PIECE);
          (cv.getContext('2d') as unknown as CanvasRenderingContext2D).putImageData(new ImageData(p.rgba, PIECE, PIECE), 0, 0);
          const bmp = cv.transferToImageBitmap();
          scope.postMessage({ t: 'piece', id: a.id, i: a.i, j: a.j, bmp, ms: performance.now() - t0 }, [bmp]);
        }
      } else if (job.ask.t === 'film') {
        done();
        const t0 = performance.now();
        const transfer: Transferable[] = [];
        const film = packed(makeFilm(job.ask.key), transfer);
        scope.postMessage({ t: 'film', key: job.ask.key, film, ms: performance.now() - t0 }, transfer);
      } else {
        job.run ??= mob(job.ask.figure);
        if (job.run.next().done) done();
      }
    } catch (err) {
      if (jobs.includes(job)) done();
      scope.postMessage({ t: 'fail', what: job.ask.t === 'film' ? `film ${job.ask.key}` : job.ask.t === 'piece' ? 'ground' : `mob ${job.ask.figure}`, why: err instanceof Error ? `${err.message}` : String(err) });
    }
    again();
  };
  channel.port1.onmessage = pump;
  scope.onmessage = (e) => {
    const ask = e.data;
    if (ask.t === 'ground') {
      // (a new floor: its terrain made once here, as the page makes its own; the last floor's pieces still asked for are not wanted)
      try {
        ground = { id: ask.id, T: terrainOf(ask.floor, landLook(ask.land, ask.floor)) };
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
    if (ask.t === 'mob' && !FIRST5_FIGURES.includes(ask.figure)) {
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
