// THE FLOORS' MONSTERS BAKED (the queue's make-floors-monsters-before-play, 11 Nov 2026). His words to the eight-sides chat,
// 11 Nov 2026, 21:30: “Explain to me why the game lags at literally every new screen regardless of introducing loading screens?”
// What that chat measured (tools/scenarios/new_screen.mjs): the loading screen waited for the hero's pictures only; each
// floor's monsters' frames were painted the first time each was shown, in play, on the thread that draws the game, 10 to 15 ms
// each (floor 6: 494 pictures, 5.4 s of painting, in the first 15 s of play; floor 11: 548, 5.6 s), until each of the floor's
// monsters had been seen in each of its moves from each side; and again on the next floor.
//
// So the monsters are made before play, as the heroes (render/baked.ts), the Swamp Colossus (render/colossus_baked.ts) and the
// town's people (render/townsfolk_baked.ts) are: every figure painted once when the game is built (tools/bake_monsters.mjs),
// shipped beside the game's page as sheets of pictures (monsters/<mark>/: IN PACKS, ONE FILE A FIGURE, <figure>-pack.png, so
// that a floor fetches its own kinds and no others: `readPack`), TAKEN IN UNDER THE LOADING SCREEN as a floor is come into (main.ts
// loadingFrame waits for them), and let go of as the floor is left, as its monsters' pictures always were (art/bestiary.ts
// forgetOthers, HEAVY_FIGURES). By his standing rule of 6 Nov 2026 that the game may carry files.
//
// THE PICTURES are the very ones the game would paint (the bake's page makes them with the game's own code, and each sheet is
// read back and checked against them, pixel by pixel), given into the same lists in the same places the painter's worker gives
// its into (art/bestiary.ts paintOrder, giveFrame), where a place is still unpainted.
// A FIGURE THAT COMES INTO A FLOOR LATER (one called up in a fight) is asked for as it is first seen (render/render.ts); the
// ones known to be called (`bringsOf`) are asked for with the floor's own, under the loading screen. While a figure's pictures
// are still coming, a frame of its not here yet is shown as the nearest that is (art/kit.ts LEFT_TO_PAINTER), never painted
// where the game is played.
// HOW THEY ARE TAKEN IN: a figure's pack is fetched, and each of its sheets opened as a picture by the browser, beside the game
// (one picture a sheet, as the heroes' sheets are opened: render/baked.ts), and each frame is cut from its sheet into a canvas
// of its own, as the game's own painted frames are, a few at a time (`CUT_MS`), the page given back to draw between: the
// loading screen goes on turning, and the game is never held up. NO PICTURE IS MADE BY THE BROWSER FOR EACH FRAME
// (createImageBitmap of a part of a sheet): an iPhone's browser is known to be slow at that (`Sheet`).
// THE LOADING SCREEN WAITS FOR THEM NO LONGER THAN `waitMost` by the clock on the wall; what has not come by then goes on
// coming as he plays.
// ON A DEVICE WITH LITTLE ROOM (a phone) a boss's pictures are NOT taken in: they are a hundred to five hundred megabytes, an
// iPhone gives a page only so much room for canvases, and one refused breaks whatever asked for it. They are the painter's, as
// before. Nor more of the others at once than `SMALL_MOST_MB`. On a desk's screen every figure of the bake's is taken in.
// WHERE THEY ARE NOT TO BE HAD (no bake in this build, a page opened from a file, a file that will not load, a figure whose
// lists are not as they were baked, no room) that figure is painted as it was before: by the painter's worker beside the game,
// and by the game itself what the worker has not come to. Nothing is lost but time.

import { HEAVY_FIGURES, framesOf, giveFrame } from '../art/bestiary';
import type { Bestiary, MonsterFigure } from '../art/bestiary';
import type { ActorArt } from '../art/actor_types';
import type { Sprite } from '../engine/px';
import { bakeName, bakedFigures, figureLens } from './monsters_bake_list';
import type { MonsterBakeFile } from './monsters_bake_list';

export { HOLD_MOST_MB, TOO_BIG, bakeName, bakedFigures, figureLens } from './monsters_bake_list';
export type { MonsterBakeFile } from './monsters_bake_list';

declare const __MONSTER_BAKE__: string | undefined;

/**
 * The switches. `on`: off, the files are not asked for, and the monsters are painted as the game is played, as before.
 * `waitHeavy`: does the loading screen wait for a heavy figure's pictures too (a boss's: art/bestiary.ts HEAVY_FIGURES)? Off,
 * it waits for the floor's other monsters only, and a boss's, asked for with them, come in the seconds after it lifts (he
 * stands at the far end of his floor): tried 11 Nov 2026, and the seconds after it lifted were the worse for it.
 * `waitMost`: THE MOST THE LOADING SCREEN WAITS FOR A PLACE'S MONSTERS, in thousandths of a second BY THE CLOCK ON THE WALL
 * (not the game's own, which a slow frame holds back) from when they were asked for: where they are slow to come (a slow
 * device, a poor line) he plays, and they go on coming as he does, a little each frame.
 */
export const MONSTERS_BAKED = { on: true, waitHeavy: true, waitMost: 8000 };

/** The folder beside the page the bakes are in, each in a folder of its own named by its mark (tools/build.mjs). */
export const MONSTER_BAKE_DIR = 'monsters';

/** The bake this build of the game was made with ('' : none). */
export function monsterBakeMark(): string {
  return typeof __MONSTER_BAKE__ === 'string' ? __MONSTER_BAKE__ : '';
}

/**
 * WHAT A FIGURE BRINGS INTO ITS FLOOR THAT IS NOT THERE AS THE FLOOR IS COME INTO: what it becomes (the Chained One as his
 * chains break; a kind's stages, `stages`: the Palimpsest more torn), and what it calls up in its fight (game/bosses.ts,
 * game/act1_rules/, game/game.ts: each `spawn` of a kind by name). Asked for with the floor's own, under the loading screen.
 * One missed here is asked for the moment it is first seen, and shown meanwhile as the nearest of its frames that has come.
 */
const BRINGS: Partial<Record<string, readonly MonsterFigure[]>> = {
  // (the Chained One as he will be with his next chain broken, and no further: a phone has not the room for all three at once,
  // as the painter has it, render/render.ts)
  chained: ['chained1'],
  chained1: ['chained2'],
  // (the Warden calls the dead out of the ground; the Amalgamation its bone beasts and its mites; the Fleshmancer and his
  // small ones raise the dead out of the heaps and the bodies)
  warden: ['skeleton'],
  amalgam: ['beast', 'mite'],
  fleshmancer: ['skeleton'],
  minifm: ['skeleton'],
  // (the Carrion Queen's flock, the Stag's wolves out of the fog, the eyespawn of floor 10's boss)
  queen: ['vulture'],
  stag: ['wolf'],
  eye: ['spawn'],
  // (the Crier's call answered; the Hushed watch's hound loosed; the Physician's patients; the glass Queen's reflections)
  crier: ['hushed'],
  watch: ['hound'],
  physician: ['patient'],
  gqueen: ['reflection'],
};
export function bringsOf(figure: MonsterFigure, stages?: (f: MonsterFigure) => readonly MonsterFigure[] | null | undefined): MonsterFigure[] {
  const out: MonsterFigure[] = [...(BRINGS[figure] ?? [])];
  for (const s of stages?.(figure) ?? []) if (!out.includes(s)) out.push(s);
  return out;
}

/** How many of a figure's sheets are opened at a time (a boss has thirty). */
const SHEETS_AT_ONCE = 3;
/**
 * How long a figure whose pictures are still coming is shown, for a frame not here yet, as the nearest that is (`coming`), in
 * thousandths of a second from when it was asked for. Its files beside the game come in well under a second; where they are
 * slow (a page on the web, a poor line, a slow device), a monster is not left standing in one pose until they come: after
 * this its frames not here yet are painted as they are shown, as before, and the files' pictures fill the rest as they come.
 */
export const STAND_IN_MS = 5000;
/**
 * HOW LONG AT A TIME THE FRAMES ARE CUT FROM THEIR SHEETS, in thousandths of a second, before the page is given back to draw:
 * under the loading screen (it goes on turning), and as the game is played (a figure first seen in a fight: the game is
 * never held up by it).
 */
export const CUT_MS = { loading: 8, play: 2 };
/**
 * THE MOST OF THE BAKE'S PICTURES HELD AT ONCE ON A DEVICE WITH LITTLE ROOM (a phone), megabytes in hand: an iPhone gives a
 * page only so much room for its canvases (384 MB has been its limit, and the game's own take their share), and one that
 * cannot be had breaks whatever asked for it. A floor's kinds but its boss are 16 to 54 MB together (floor 17's, with its
 * twelve dancers, 152): taken in until this is met, the rest left as before, the painter's.
 */
export const SMALL_MOST_MB = 64;

/**
 * A SHEET OPENED, to cut frames from. EACH FRAME IS CUT INTO A CANVAS OF ITS OWN, AS THE GAME'S OWN PAINTED FRAMES AND THEIR
 * MIRROR IMAGES ARE (engine/px.ts toCanvas, flipSprite: a canvas made and a picture drawn into it), on the thread that draws
 * the game, a few at a time. NOT A PICTURE MADE BY THE BROWSER FOR EACH (createImageBitmap, as the heroes' bake and the
 * painter's worker hand theirs): that is next to nothing in Chrome, and an iPhone's browser is known to be slow at making and
 * handing over such pictures (WebKit bugs 280601, 234920; the eight-sides merge chat's lead for his “60 SECOND LOAD TIME to
 * enter THE TOWN”, 11 Nov 2026, the queue's measure-lag-on-his-phone); a floor has three to ten thousand frames. `cut`:
 * null where the browser will give no more canvases (an iPhone gives a page only so much room for them).
 */
export interface Sheet {
  cut(x: number, y: number, w: number, h: number): HTMLCanvasElement | null;
  close(): void;
}

type Get = (name: string) => Promise<Response>;
/** A sheet opened from its own bytes (a PNG: its part of the figure's pack); `name`, the sheet's as the bake named it. */
type Open = (sheet: Blob, name: string) => Promise<Sheet>;

/** One figure's pictures, as asked for: for which pictures of the bestiary's (they are made again when a figure is forgotten), and how far it has come. */
interface Asked {
  art: ActorArt;
  state: 'loading' | 'done' | 'failed';
  /** When it was asked for (performance.now()). */
  at: number;
  /** How big its pictures are, in pixels (once its file has said). */
  px?: number;
  /** Failed for want of room among this place's others (a phone: SMALL_MOST_MB): asked for again in the next place. */
  noRoom?: boolean;
}

/** A sheet's frames waiting to be cut: which, how far it has got, and who is told when it is done (or why it stopped). */
interface Cutting {
  sheet: Sheet;
  frames: number[];
  at: number;
  /** Cut one frame and give it; false: stop (the figure forgotten, or no canvas to be had). */
  one(fi: number): boolean;
  done(ok: boolean): void;
}

export interface BakedMonstersOptions {
  /** A file of the bake's fetched (the figures' packs). */
  get?: Get;
  /** A sheet of the bake's opened, from its bytes. */
  open?: Open;
  /** The figures the bake has (bakedFigures). */
  names?: readonly MonsterFigure[];
  /** A device with little room (a phone): a heavy figure's pictures (a boss's, a hundred to five hundred megabytes) are not taken in whole; they are the painter's, as before. */
  small?: boolean;
  /** How long at a time frames may be cut now, in thousandths of a second (CUT_MS: under the loading screen, or in play). */
  slice?: () => number;
  /** Do this a little later (the next time the page draws). */
  later?: (f: () => void) => void;
}

/**
 * THE BAKED PICTURES, TAKEN IN: `take` a figure as its floor is come into (main.ts, under the loading screen) or as it is
 * first seen (render/render.ts). They are let go of with the figure's other pictures, by the bestiary (forget, forgetOthers:
 * every picture given is the figure's own from then on), and a figure forgotten is taken in again the next time it is asked for.
 */
export class BakedMonsters {
  private asked = new Map<MonsterFigure, Asked>();
  private readonly names: ReadonlySet<MonsterFigure>;
  private readonly get: Get;
  private readonly open: Open;
  private readonly small: boolean;
  private readonly slice: () => number;
  private readonly later: (f: () => void) => void;
  /** The sheets opened and waiting to have their frames cut, the first come first; and whether the cutting is under way. */
  private cuts: Cutting[] = [];
  private cuttingNow = false;
  /** The pictures given (to tell one of the bake's from one painted here: for the tests). */
  private readonly gave = new WeakSet<Sprite>();
  /** No more canvases to be had on this page (an iPhone's limit met): nothing more is taken in; the monsters are painted as before. */
  private full = false;
  /**
   * For measuring: frames taken in, frames not wanted (painted already), the loads done and those stopped (a figure forgotten
   * as it came), those left out for want of room (a phone), how long each figure took last (ms), how long the cutting itself
   * has taken in all (ms) and its longest turn, and what failed.
   */
  readonly stats = { given: 0, unwanted: 0, loads: 0, stopped: 0, noRoom: 0, ms: {} as Record<string, number>, cutMs: 0, cutLongest: 0, failed: [] as string[] };

  constructor(
    private readonly mark: string,
    private readonly bestiary: () => Bestiary,
    opts: BakedMonstersOptions = {},
  ) {
    this.names = new Set(opts.names ?? bakedFigures());
    this.get = opts.get ?? ((name) => fetch(`${MONSTER_BAKE_DIR}/${mark}/${name}`));
    this.open = opts.open ?? ((sheet, name) => openSheet(sheet, name));
    this.small = !!opts.small;
    this.slice = opts.slice ?? (() => CUT_MS.loading);
    this.later = opts.later ?? ((f) => (typeof requestAnimationFrame === 'function' ? void requestAnimationFrame(() => f()) : void setTimeout(f, 0)));
  }

  /** Are the baked pictures to be had on this page at all (a bake in this build, a page served over the web)? */
  static toBeHad(): boolean {
    if (!MONSTERS_BAKED.on || !monsterBakeMark()) return false;
    if (typeof fetch !== 'function' || typeof Image !== 'function' || typeof document === 'undefined' || typeof location === 'undefined') return false;
    return location.protocol === 'http:' || location.protocol === 'https:';
  }

  /** The baked pictures for this page, or null where there are none to be had. */
  static make(bestiary: () => Bestiary, opts: BakedMonstersOptions = {}): BakedMonsters | null {
    return BakedMonsters.toBeHad() ? new BakedMonsters(monsterBakeMark(), bestiary, opts) : null;
  }

  /** Is this figure one of the bake's to take in on this device (whether or not its pictures have come)? */
  has(figure: MonsterFigure): boolean {
    return this.names.has(figure) && !(this.small && HEAVY_FIGURES.includes(figure));
  }

  /** Was this figure left out of this place for want of room (a phone: SMALL_MOST_MB), to be painted as before? */
  leftOut(figure: MonsterFigure): boolean {
    return !!this.asked.get(figure)?.noRoom;
  }

  /** Was this picture given from the bake's files (not painted on this page)? */
  isBaked(s: Sprite): boolean {
    return this.gave.has(s);
  }

  /** Its pictures as the bestiary holds them now, if this figure's asking is for those (not for ones since forgotten). */
  private now(figure: MonsterFigure): Asked | null {
    const a = this.asked.get(figure);
    return a && a.art === this.bestiary().made(figure) ? a : null;
  }

  /**
   * A figure's pictures are wanted: fetched if they are not here or coming. True: they are the bake's (coming, or come), and
   * nobody else need paint them; false: they are not to be had (not baked, switched off, too heavy for this device, or
   * failed), and are painted as before.
   */
  take(figure: MonsterFigure): boolean {
    if (!MONSTERS_BAKED.on || this.full || !this.has(figure)) return false;
    const was = this.asked.get(figure);
    // (one that failed is not asked for again: it would fail again, each time the figure was seen)
    if (was && was.state === 'failed') return false;
    const art = this.bestiary().of(figure);
    if (was && was.art === art) return true;
    const a: Asked = { art, state: 'loading', at: performance.now() };
    this.asked.set(figure, a);
    void this.load(figure, a);
    return true;
  }

  /**
   * Are this figure's pictures the bake's, still coming, and asked for no longer ago than STAND_IN_MS (a frame of its not here
   * yet is then shown as the nearest that is)?
   */
  coming(figure: MonsterFigure): boolean {
    if (!MONSTERS_BAKED.on) return false;
    const a = this.now(figure);
    return !!a && a.state === 'loading' && performance.now() - a.at < STAND_IN_MS;
  }

  /** Is there nothing more of this figure for the loading screen to wait for: its pictures have come whole, or none will? */
  settled(figure: MonsterFigure): boolean {
    if (!MONSTERS_BAKED.on || this.full || !this.has(figure)) return true;
    const a = this.asked.get(figure);
    if (a && a.state === 'failed') return true;
    return this.now(figure)?.state === 'done';
  }

  /** Have this figure's pictures come whole (for the tests)? */
  done(figure: MonsterFigure): boolean {
    return this.now(figure)?.state === 'done';
  }

  /** The failures forgotten (main.ts __dbg, after the switch is put on again by hand): each may be asked for once more. */
  again(): void {
    this.full = false;
    for (const [f, a] of this.asked) if (a.state === 'failed') this.asked.delete(f);
  }

  /**
   * A NEW PLACE IS COME INTO (main.ts, once the last place's pictures are let go of): a figure left out of the last place for
   * want of room may be asked for again; and what was asked of figures since forgotten is forgotten too.
   */
  newPlace(): void {
    for (const [f, a] of this.asked) if (a.noRoom || (a.state !== 'failed' && a.art !== this.bestiary().made(f))) this.asked.delete(f);
  }

  /** How much of the bake's pictures is in hand or coming now, in pixels (of the figures as the bestiary holds them now). */
  private heldPx(): number {
    let n = 0;
    for (const [f, a] of this.asked) if (a.state !== 'failed' && a.px && a.art === this.bestiary().made(f)) n += a.px;
    return n;
  }

  /**
   * THE CUTTING, a turn of it: the sheets waiting, the first come first, a frame at a time for as long as `slice` allows; then
   * the page is given back to draw, and it goes on the next time it does.
   */
  private cutTurn = (): void => {
    const t0 = performance.now();
    const most = Math.max(0.5, this.slice());
    while (this.cuts.length && performance.now() - t0 < most) {
      const c = this.cuts[0];
      let ok = true;
      // (never fewer than one a turn: a frame that takes longer than the turn is still cut)
      do ok = c.one(c.frames[c.at++]);
      while (ok && c.at < c.frames.length && performance.now() - t0 < most);
      if (!ok || c.at >= c.frames.length) {
        this.cuts.shift();
        c.done(ok);
      }
    }
    const took = performance.now() - t0;
    this.stats.cutMs += took;
    this.stats.cutLongest = Math.max(this.stats.cutLongest, took);
    if (this.cuts.length) this.later(this.cutTurn);
    else this.cuttingNow = false;
  };

  /** A sheet's frames cut, in their turn. True: all of them; false: stopped (`one` said so). */
  private cut(sheet: Sheet, frames: number[], one: (fi: number) => boolean): Promise<boolean> {
    if (!frames.length) return Promise.resolve(true);
    return new Promise((done) => {
      this.cuts.push({ sheet, frames, at: 0, one, done });
      if (!this.cuttingNow) {
        this.cuttingNow = true;
        this.later(this.cutTurn);
      }
    });
  }

  private async load(figure: MonsterFigure, a: Asked): Promise<void> {
    // (still wanted: the figure's pictures are the ones this was asked for, not forgotten since, and nothing has taken its place)
    const live = (): boolean => this.asked.get(figure) === a && this.bestiary().made(figure) === a.art;
    const name = bakeName(figure);
    try {
      const r = await this.get(packName(name));
      if (!live()) return void this.stats.stopped++;
      if (!r.ok) throw new Error(`${packName(name)}: ${r.status}`);
      const { file: f, sheet: bytesOf } = await readPack(await r.blob(), name);
      if (!live()) return void this.stats.stopped++;
      if (f.mark !== this.mark || f.figure !== figure) throw new Error(`${name}: of another bake`);
      // (the figure as the game has it now, against the bake's: the same lists, as long)
      const lens = figureLens(a.art);
      if (JSON.stringify(lens) !== JSON.stringify(f.lens)) throw new Error(`${name}: not as baked`);
      // (a phone: no more of them at once than it has room for: SMALL_MOST_MB)
      const px = f.frames.reduce((n, fr) => n + fr[3] * fr[4], 0);
      if (this.small && (this.heldPx() + px) * 4 > SMALL_MOST_MB * 1e6) {
        a.noRoom = true;
        throw new Error(`${name}: no room for it with this place's others on a phone`);
      }
      a.px = px;
      const lists = [framesOf(a.art.front), framesOf(a.art.back)];
      const wants = new Map<number, [number, number, number][]>();
      for (let n = 0; n + 3 < f.at.length; n += 4) {
        const fi = f.at[n + 3];
        let w = wants.get(fi);
        if (!w) wants.set(fi, (w = []));
        w.push([f.at[n], f.at[n + 1], f.at[n + 2]]);
      }
      /** Is this place still unpainted (its own painter there, a getter)? */
      const unpainted = ([v, l, i]: [number, number, number]): boolean => typeof Object.getOwnPropertyDescriptor(lists[v][l], i)?.get === 'function';
      // (a few sheets at a time, in the order they were baked: the frames wanted first are on the first. `stop`: why the load
      // ended early: the figure forgotten as it came, 'gone'; or what failed)
      let next = 0;
      let stop: 'gone' | Error | null = null;
      const sheets = async (): Promise<void> => {
        while (!stop && next < f.sheets.length) {
          const s = next++;
          try {
            const sheet = await this.open(bytesOf(s), f.sheets[s]);
            try {
              if (stop) return;
              if (!live()) return void (stop = 'gone');
              const on: number[] = [];
              for (let fi = 0; fi < f.frames.length; fi++) if (f.frames[fi][0] === s) on.push(fi);
              const ok = await this.cut(sheet, on, (fi) => {
                if (stop) return false;
                if (!live()) return void (stop = 'gone'), false;
                const places = wants.get(fi) ?? [];
                // (a frame nobody wants any more, every place of it painted here meanwhile, is not cut)
                if (!places.some(unpainted)) return void this.stats.unwanted++, true;
                const [, x, y, w, h] = f.frames[fi];
                const img = sheet.cut(x, y, w, h);
                if (!img) {
                  // (no more canvases to be had: nothing more is taken in on this page)
                  this.full = true;
                  return void (stop = new Error(`${name}: no room for more pictures on this device`)), false;
                }
                // (one picture for every place that shows it, as the painter's worker hands a frame that is the same as another)
                const sprite = { ...f.parts[f.frames[fi][5]], img } as Sprite;
                for (const [v, l, i] of places) giveFrame(a.art, v, l, i, sprite);
                this.gave.add(sprite);
                this.stats.given++;
                return true;
              });
              if (!ok && !stop) stop = 'gone';
            } finally {
              sheet.close();
            }
          } catch (e) {
            if (!stop) stop = e instanceof Error ? e : new Error(String(e));
            return;
          }
        }
      };
      await Promise.all(Array.from({ length: Math.min(SHEETS_AT_ONCE, f.sheets.length) }, sheets));
      if (stop === 'gone' || (!stop && !live())) return void this.stats.stopped++;
      if (stop) throw stop;
      a.state = 'done';
      this.stats.loads++;
      this.stats.ms[figure] = Math.round(performance.now() - a.at);
    } catch (e) {
      if (!live()) return void this.stats.stopped++;
      // (what had come of it stays, the figure's own; the rest is painted as before, by the painter and the game)
      a.state = 'failed';
      if (a.noRoom) this.stats.noRoom++;
      else this.stats.failed.push(e instanceof Error ? e.message : String(e));
    }
  }
}

/** The last 12 bytes of a figure's pack begin so, and then say how long its file is (tools/monster_packs.mjs). */
export const PACK_TAIL = 'WSMB';

/** A figure's pack, by its name as its files have it (bakeName): <name>-pack.png. */
export function packName(name: string): string {
  return `${name}-pack.png`;
}

/**
 * A FIGURE'S PACK READ (tools/monster_packs.mjs makes them): its sheets one after another, each a PNG whole; then its file (JSON),
 * with where each sheet lies; then `WSMB` and the file's length in bytes, 8 hex digits. Its file, and each sheet's own bytes (a
 * part of the pack, not a copy).
 */
export async function readPack(pack: Blob, name = 'a pack'): Promise<{ file: MonsterBakeFile; sheet: (s: number) => Blob }> {
  const n = pack.size;
  const tail = n >= 12 ? await pack.slice(n - 12).text() : '';
  const len = tail.startsWith(PACK_TAIL) ? parseInt(tail.slice(4), 16) : NaN;
  if (!(len > 0 && len <= n - 12)) throw new Error(`${name}: not a pack`);
  const file = JSON.parse(await pack.slice(n - 12 - len, n - 12).text()) as MonsterBakeFile;
  const packed = file.packed;
  if (!packed || packed.length !== file.sheets.length || packed.some(([a, l]) => !(a >= 0 && l > 0 && a + l <= n - 12 - len))) throw new Error(`${name}: its sheets are not where it says`);
  return { file, sheet: (s) => pack.slice(packed[s][0], packed[s][0] + packed[s][1], 'image/png') };
}

/**
 * A SHEET OF THE BAKE'S OPENED ON THE PAGE, from its bytes: made one picture by the browser (createImageBitmap, as the heroes'
 * sheets are opened, render/baked.ts: the same on his phone and on the claude.ai page), and each frame cut from it into a canvas
 * of its own. Where the browser has no createImageBitmap, the bytes are read as an image instead.
 */
export async function openSheet(bytes: Blob, name = 'a sheet'): Promise<Sheet> {
  let pic: ImageBitmap | HTMLImageElement;
  let url = '';
  try {
    if (typeof createImageBitmap === 'function') pic = await createImageBitmap(bytes, { premultiplyAlpha: 'default', colorSpaceConversion: 'none' });
    else {
      url = URL.createObjectURL(bytes);
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
      await img.decode();
      pic = img;
    }
  } catch {
    if (url) URL.revokeObjectURL(url);
    throw new Error(`${name}: will not open`);
  }
  return {
    cut(x, y, w, h) {
      const cv = document.createElement('canvas');
      cv.width = w;
      cv.height = h;
      const g = cv.getContext('2d');
      if (!g) return null;
      g.drawImage(pic, x, y, w, h, 0, 0, w, h);
      return cv;
    },
    close() {
      // (the sheet's own picture let go of: its frames are in hand)
      if ('close' in pic) pic.close();
      else pic.src = '';
      if (url) URL.revokeObjectURL(url);
    },
  };
}
