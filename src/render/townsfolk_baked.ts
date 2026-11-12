// THE TOWN'S PEOPLE BAKED (the townsfolk bake chat, 11 Nov 2026): the sculpted four (art/townsfolk3.ts) painted once when the game
// is built (tools/bake_townsfolk.mjs), shipped beside the game's page as sheets of pictures (townsfolk/<mark>/: townsfolk.json and
// its sheets), and taken in as the town is come into, in place of painting them while the game is played. A frame of theirs is a
// tenth to a third of a second to paint and there are 2,584 of them: nothing paints them where the game is played. In the manner
// of the heroes' bake (render/baked.ts) and by his words there: “And something was said about storing drawings so that loading is
// easier.  I’m into that if I can be implemented” (4 Nov 2026), and his standing rule of 6 Nov 2026 that the game may carry files.
//
// THE PICTURES are the very ones the game would paint (the bake's page makes them with the game's own code, and each sheet is
// read back and checked against them, pixel by pixel), given into the same lists in the same places (art/townsfolk3.ts folkLists), where a place
// is still unpainted.
// THE LOADING SCREEN WAITS FOR THE FIRST OF THEM ONLY, the loops the town shows as it is come into (about a quarter); the rest
// come a moment after, as the town is played, and until then the loop at their work stands in for a loop turned or an act.
// WHILE HE IS IN THE TOWN ONLY: the pictures are let go of as he leaves it (their room given back: they are some tens of
// megabytes, and it was memory that froze his phone, 11 Nov 2026), and taken in again, under the loading screen, as he comes back.
// WHERE THEY ARE NOT TO BE HAD (no bake in this build, a page opened from a file, a sheet that will not load, lists that are not
// as they were baked) the town's people are as they were (art/townsfolk3.ts townsfolk3Shown; main.ts).

import type { FolkList } from '../art/townsfolk3';
import { releaseSprite } from '../engine/px';
import type { Sprite } from '../engine/px';

declare const __TOWNSFOLK_BAKE__: string | undefined;

/** The switches: `on` off, the files are not asked for (the town's people are then as they were); `letGo` off, their pictures are kept once they have come. */
export const TOWNSFOLK_BAKED = { on: true, letGo: true };

/** The folder beside the page the bakes are in, each in a folder of its own named by its mark (tools/build.mjs). */
export const TOWNSFOLK_BAKE_DIR = 'townsfolk';
/** The bake's one group: the four are always wanted together. Its file is <group>.json, its sheets <group>-<n>.png. */
export const TOWNSFOLK_GROUP = 'townsfolk';

/** The bake this build of the game was made with ('' : none). */
export function townsfolkBakeMark(): string {
  return typeof __TOWNSFOLK_BAKE__ === 'string' ? __TOWNSFOLK_BAKE__ : '';
}

/** The bake's file: its sheets, its frames on them, and which frame each place of each list shows. */
export interface FolkBakeFile {
  mark: string;
  group: string;
  /** Each sheet's file (a PNG), beside this one. */
  sheets: string[];
  /** Each frame: [sheet, x, y, width, height, the index of its other parts in `parts`]. */
  frames: [number, number, number, number, number, number][];
  /** A frame's other parts (Sprite without its picture: its size, anchor, lights...), shared by the frames that have the same. */
  parts: Omit<Sprite, 'img'>[];
  /** How many of the frames, from the first, the loops the town shows as it is come into are made of (the loading screen waits for these). */
  first: number;
  /** Each list, as art/townsfolk3.ts folkLists names them: the frame each of its places shows, in order (-1: a place with no picture). */
  lists: { name: string; at: number[] }[];
}

/** How many of a sheet's frames are cut from it at a time: the first, under the loading screen; and the rest, as the town is played. */
const AT_ONCE = { first: 96, rest: 32 };

type Get = (name: string) => Promise<Response>;

/**
 * THE BAKED PICTURES, TAKEN IN AND LET GO: `take` as a place with the town's people is come into (main.ts), `letGo` as it is left.
 */
export class BakedTownsfolk {
  private state: 'none' | 'loading' | 'done' | 'failed' = 'none';
  /** Which load this is: one let go of while it is still coming stops where it is. */
  private run = 0;
  /** Every place a picture was given into, and what was there before (the frame's own painter), to put back as they are let go. */
  private held: { list: Sprite[]; i: number; was: PropertyDescriptor }[] = [];
  /** The pictures in hand. */
  private sprites: Sprite[] = [];
  /** Have the first of them come: the loops the town shows as it is come into? */
  private firstIn = false;
  /** Told, once, when they will not come (main.ts puts the town's people back as they were). */
  onFail: (() => void) | null = null;
  /**
   * For measuring: frames taken in and frames not wanted (painted already) in the last load, how long the first of them took
   * and how long all (ms), how many times they have come and gone, how many are in hand, and what failed.
   */
  readonly stats = { given: 0, unwanted: 0, firstMs: 0, ms: 0, loads: 0, letGo: 0, held: 0, failed: [] as string[] };

  constructor(
    private readonly mark: string,
    private readonly lists: () => FolkList[],
    private readonly get: Get = (name) => fetch(`${TOWNSFOLK_BAKE_DIR}/${mark}/${name}`),
  ) {}

  /** Are the baked pictures to be had on this page at all (a bake in this build, a page served over the web)? */
  static toBeHad(): boolean {
    if (!TOWNSFOLK_BAKED.on || !townsfolkBakeMark()) return false;
    if (typeof fetch !== 'function' || typeof createImageBitmap !== 'function' || typeof location === 'undefined') return false;
    return location.protocol === 'http:' || location.protocol === 'https:';
  }

  /** The baked pictures for this page, or null where there are none to be had. */
  static make(lists: () => FolkList[]): BakedTownsfolk | null {
    return BakedTownsfolk.toBeHad() ? new BakedTownsfolk(townsfolkBakeMark(), lists) : null;
  }

  /** The pictures are wanted: they are fetched if they are not here or coming. True if they are coming (or have come); false if they cannot. */
  take(): boolean {
    if (!TOWNSFOLK_BAKED.on || this.state === 'failed') return false;
    if (this.state === 'none') void this.load();
    return true;
  }

  /**
   * Is there nothing more for the loading screen to wait for: the loops the town shows as it is come into have come (the rest
   * come a moment after, as the town is played: until then the loop at their work stands in for a loop turned or an act:
   * art/townsfolk3.ts), or none will?
   */
  ready(): boolean {
    return this.firstIn || this.state === 'done' || this.state === 'failed';
  }

  /** Have they come whole, or failed (nothing more to come)? */
  settled(): boolean {
    return this.state === 'done' || this.state === 'failed';
  }

  /** Have they come whole? */
  done(): boolean {
    return this.state === 'done';
  }

  /** Are any in hand, or coming? */
  holding(): boolean {
    return this.state === 'loading' || this.state === 'done';
  }

  /**
   * LET GO: every place given into is as it was before (unpainted, its own painter back), and the pictures' room is given back
   * now. A load still coming stops. They are fetched again the next time they are wanted.
   */
  letGo(): void {
    if (!this.holding()) return;
    this.run++;
    this.drop();
    this.state = 'none';
    this.stats.letGo++;
  }

  /** The switch put on again by hand after a failure (main.ts __dbg): they may be asked for once more. */
  again(): void {
    if (this.state === 'failed') this.state = 'none';
  }

  private drop(): void {
    for (const h of this.held) Object.defineProperty(h.list, h.i, h.was);
    this.held.length = 0;
    for (const s of this.sprites) releaseSprite(s);
    this.sprites.length = 0;
    this.stats.held = 0;
    this.firstIn = false;
  }

  private async load(): Promise<void> {
    const run = ++this.run;
    const live = (): boolean => run === this.run;
    this.state = 'loading';
    this.stats.given = 0;
    this.stats.unwanted = 0;
    this.firstIn = false;
    const t0 = performance.now();
    try {
      const r = await this.get(`${TOWNSFOLK_GROUP}.json`);
      if (!live()) return;
      if (!r.ok) throw new Error(`${TOWNSFOLK_GROUP}.json: ${r.status}`);
      const f = (await r.json()) as FolkBakeFile;
      if (!live()) return;
      if (f.mark !== this.mark || f.group !== TOWNSFOLK_GROUP) throw new Error('of another bake');
      if (!(f.first >= 0 && f.first <= f.frames.length)) throw new Error('its first frames are not said');
      // (the lists as the game has them now, against the bake's: the same names in the same order, as long)
      const mine = this.lists();
      if (mine.length !== f.lists.length) throw new Error(`${mine.length} lists, the bake has ${f.lists.length}`);
      const wants = new Map<number, [Sprite[], number][]>();
      for (let l = 0; l < mine.length; l++) {
        const b = f.lists[l];
        if (b.name !== mine[l].name || b.at.length !== mine[l].list.length) throw new Error(`${mine[l].name}: not as baked`);
        for (let i = 0; i < b.at.length; i++) {
          const fi = b.at[i];
          if (fi < 0) continue;
          let w = wants.get(fi);
          if (!w) wants.set(fi, (w = []));
          w.push([mine[l].list, i]);
        }
      }
      // (a sheet at a time, in the order they were baked: the frames wanted first are on the first)
      for (let s = 0; s < f.sheets.length; s++) {
        const rs = await this.get(f.sheets[s]);
        if (!live()) return;
        if (!rs.ok) throw new Error(`${f.sheets[s]}: ${rs.status}`);
        const sheet = await createImageBitmap(await rs.blob(), { premultiplyAlpha: 'default', colorSpaceConversion: 'none' });
        try {
          if (!live()) return;
          const on: number[] = [];
          for (let fi = 0; fi < f.frames.length; fi++) if (f.frames[fi][0] === s) on.push(fi);
          for (let n = 0; n < on.length; ) {
            // (the first of them in bigger handfuls, to be quick under the loading screen; never past the last of the first)
            const fi0 = on[n];
            const many = fi0 < f.first ? Math.min(AT_ONCE.first, f.first - fi0) : AT_ONCE.rest;
            const part = on.slice(n, n + many);
            n += part.length;
            const bmps = await Promise.all(part.map((fi) => {
              const [, x, y, w, h] = f.frames[fi];
              return createImageBitmap(sheet, x, y, w, h, { premultiplyAlpha: 'default', colorSpaceConversion: 'none' });
            }));
            if (!live()) {
              for (const b of bmps) b.close();
              return;
            }
            for (let q = 0; q < part.length; q++) {
              const fi = part[q];
              const sprite = { ...f.parts[f.frames[fi][5]], img: bmps[q] as unknown as HTMLCanvasElement } as Sprite;
              let took = false;
              for (const [list, i] of wants.get(fi) ?? []) {
                const was = Object.getOwnPropertyDescriptor(list, i);
                // (only where the place is still unpainted: its own painter is there, a getter)
                if (!was || typeof was.get !== 'function') continue;
                Object.defineProperty(list, i, { value: sprite, writable: true, configurable: true, enumerable: true });
                this.held.push({ list, i, was });
                took = true;
              }
              if (took) {
                this.sprites.push(sprite);
                this.stats.given++;
              } else {
                this.stats.unwanted++;
                bmps[q].close();
              }
            }
            this.stats.held = this.sprites.length;
            if (!this.firstIn && part[part.length - 1] + 1 >= f.first) {
              this.firstIn = true;
              this.stats.firstMs = Math.round(performance.now() - t0);
            }
          }
        } finally {
          sheet.close();
        }
      }
      this.state = 'done';
      this.stats.loads++;
      this.stats.ms = Math.round(performance.now() - t0);
    } catch (e) {
      if (!live()) return;
      // (none of them, then: what had come is let go of, and the town's people are as they were)
      this.drop();
      this.state = 'failed';
      this.stats.failed.push(e instanceof Error ? e.message : String(e));
      this.onFail?.();
    }
  }
}
