// THE HEROES' PICTURES BAKED: painted once when the game is built (tools/bake_heroes.mjs), shipped with the game's page as sheets
// of pictures in files beside it (heroes/<mark>/: one page alone may not be over 16 MB where it is published, and so a hero's
// sheets are fetched only when he is played), and taken in when a hero is first shown, in place of painting them while the
// game is played. His words, 4 Nov 2026, 19:22 (Eastern): “And something was said about storing drawings so that loading is easier.
// I’m into that if I can be implemented.  Unless it’s a last step kind of thing since it would make the game bigger to load or
// whatever”; asked how, 6 Nov 2026, his pick: “Inside the game file”.
//
// The pictures are the very ones the painter's worker paints (render/painter.ts, hero), the same lists in the same places
// (art/heroes3.ts heroLists), handed in the same way (HeroArt.give). Wherever the baked pictures are not to be had (a page
// built without them or opened from a file, a sheet that will not load, a hero whose lists are not as they were baked), the
// game paints them as it did before: nothing is lost but time.

import { heroLists } from '../art/heroes3';
import { lookOfPlace } from '../art/heroes';
import type { HeroArt, HeroPlace } from '../art/heroes';
import type { AnimSet } from '../art/actor_types';
import { heroSides } from '../art/sides';
import { sheetSprite } from '../engine/px';
import type { FrameSheet, Sprite } from '../engine/px';
import type { ClassId } from '../game/types';

declare const __HERO_BAKE__: string | undefined;

/** The switch: off, the heroes are painted while the game is played, as before. */
export const BAKED = { on: true };

/** (main.ts LOAD_SLICE) The most a group's frames are handed over in one go, in thousandths of a second, before a frame is let in (0: all at once, as before). */
export const HAND_MS = 6;

/** The folder beside the page the bakes are in, each in a folder of its own named by its mark (tools/build.mjs). */
export const BAKE_DIR = 'heroes';

/** The bake this build of the game was made with ('' : none). */
export function bakeMark(): string {
  return typeof __HERO_BAKE__ === 'string' ? __HERO_BAKE__ : '';
}

/** One hero in one place, as the painter asks for him (render/painter.ts, hero). */
export interface BakeKey {
  cls: ClassId;
  place: HeroPlace;
  vet: boolean;
}

/**
 * THE BAKE'S GROUPS, each loaded whole: every hero's class card (the title's), and each hero in all of his places (a run needs
 * them all: the town, the dungeon, and the Warlock's demon and his arm blazing). `vet`: the Brawler as the Veteran
 * (game/veteran.ts VETERAN), as the painter asks for him.
 */
export function bakeGroups(vet: boolean): Record<string, BakeKey[]> {
  const classes: ClassId[] = ['warrior', 'ranger', 'mage', 'warlock', 'tinkerer', 'brawler'];
  const k = (cls: ClassId, place: HeroPlace): BakeKey => ({ cls, place, vet: cls === 'brawler' && vet });
  const out: Record<string, BakeKey[]> = { cards: classes.map((c) => k(c, 'card')) };
  for (const c of classes) out[c] = c === 'warlock' ? (['town', 'dungeon', 'demon', 'blaze'] as HeroPlace[]).map((p) => k(c, p)) : [k(c, 'town'), k(c, 'dungeon')];
  return out;
}

export function keyName(k: BakeKey): string {
  return `${k.cls}:${k.place}${k.vet ? ':vet' : ''}`;
}

/**
 * Where a hero's baked frames go, as [side, list, frame] (sides as art/sides.ts numbers them: 0 the front, 1 the back, and for a
 * hero painted from eight, the six others after; lists as heroLists has them), in the order they are wanted: standing and
 * running first, then the first frame of every other list, then the rest. On a class card only what a card shows, the front
 * standing and running (render/painter.ts, hero).
 */
export function bakedPlaces(sides: readonly AnimSet[], card: boolean): [number, number, number][] {
  const lists = sides.map((s) => heroLists(s));
  const front = sides[0];
  const most = [lists[0].indexOf(front.idle), lists[0].indexOf(front.walk)].filter((l) => l >= 0);
  const out: [number, number, number][] = [];
  if (card) {
    for (const l of most) for (let i = 0; i < lists[0][l].length; i++) out.push([0, l, i]);
    return out;
  }
  const V = lists.length;
  for (const l of most) for (let v = 0; v < V; v++) for (let i = 0; i < lists[v][l].length; i++) out.push([v, l, i]);
  for (let l = 0; l < lists[0].length; l++) if (!most.includes(l)) for (let v = 0; v < V; v++) if (lists[v][l].length) out.push([v, l, 0]);
  for (let l = 0; l < lists[0].length; l++) if (!most.includes(l)) for (let v = 0; v < V; v++) for (let i = 1; i < lists[v][l].length; i++) out.push([v, l, i]);
  return out;
}

/** The lengths of a hero's lists, every side (to know the baked pictures are of the hero as the game has him now). */
export function listLengths(sides: readonly AnimSet[]): number[][] {
  return sides.map((s) => heroLists(s).map((l) => l.length));
}

export { heroSides };

/** A group's file: its sheets, its frames on them, and where each hero's frames go. */
export interface BakeFile {
  mark: string;
  group: string;
  /** Each sheet's file (a PNG), beside this one. */
  sheets: string[];
  /** Each frame: [sheet, x, y, width, height, the index of its other parts in `parts`]. */
  frames: [number, number, number, number, number, number][];
  /** A frame's other parts (Sprite without its picture: its size, anchor, lights...), shared by the frames that have the same. */
  parts: Omit<Sprite, 'img'>[];
  /** Each hero of the group: the lengths of his lists, and his frames' places, flat, as side, list, frame, the frame's index. */
  keys: { cls: ClassId; place: HeroPlace; vet: boolean; lens: number[][]; at: number[] }[];
}

type Give = (cls: ClassId, place: HeroPlace, v: number, l: number, i: number, s: Sprite, vet?: boolean) => boolean;

/**
 * THE BAKED PICTURES, TAKEN IN (render/painter.ts, Painter.baked): a group is fetched the first time one of its heroes is asked
 * for, a sheet at a time, and every frame handed to the hero's art where it is still unpainted.
 *
 * THE SHEETS ARE HELD WHOLE, AND NO PICTURE IS MADE FOR A FRAME (engine/px.ts sheetSprite: a frame's picture is cut from its
 * sheet when it is first asked for). Before, each frame was cut from its sheet as it came, a picture made by the browser for
 * each (createImageBitmap(sheet, x, y, w, h), 48 at once): on his phone, measured 12 Nov 2026, 7.1 ms a frame on the game's
 * own thread, 68.5 s of the Brawler's 74-second load into town from eight sides (docs/requests/phone_check.md).
 */
export class BakedHeroes {
  private state = new Map<string, 'loading' | 'done' | 'failed'>();
  private readonly groups: Record<string, BakeKey[]>;
  private readonly groupOf = new Map<string, string>();
  /** The sheets in hand: a hero's pictures are kept once they have come. */
  private readonly sheets: FrameSheet[] = [];
  /**
   * For measuring: frames taken in, frames not wanted (painted already), how long each group took (ms), what failed, and the
   * sheets held and their pixels.
   */
  readonly stats = { given: 0, unwanted: 0, ms: {} as Record<string, number>, failed: [] as string[], sheets: 0, sheetPx: 0, handMs: 0, handMax: 0 };

  constructor(
    private readonly mark: string,
    private readonly art: () => HeroArt,
    private readonly give: Give,
    vet: boolean,
    private readonly get: (name: string) => Promise<Response> = (name) => fetch(`${BAKE_DIR}/${mark}/${name}`),
  ) {
    this.groups = bakeGroups(vet);
    for (const [g, keys] of Object.entries(this.groups)) for (const k of keys) this.groupOf.set(keyName(k), g);
  }

  /** The baked pictures for this page, or null where there are none to be had (no bake in this build, a page opened from a file). */
  static make(art: () => HeroArt, give: Give, vet: boolean): BakedHeroes | null {
    const mark = bakeMark();
    if (!BAKED.on || !mark) return null;
    if (typeof fetch !== 'function' || typeof createImageBitmap !== 'function' || typeof location === 'undefined') return null;
    if (location.protocol !== 'http:' && location.protocol !== 'https:') return null;
    return new BakedHeroes(mark, art, give, vet);
  }

  /** The group a hero in a place is baked in (null: he is not baked). */
  group(cls: ClassId, place: HeroPlace, vet: boolean): string | null {
    return this.groupOf.get(keyName({ cls, place, vet })) ?? null;
  }

  /**
   * This hero's pictures in this place from the bake: true if they are coming (or have come), and the painter need not paint
   * them; false if they cannot (then they are painted, as before).
   */
  take(cls: ClassId, place: HeroPlace, vet: boolean): boolean {
    if (!BAKED.on) return false;
    const g = this.group(cls, place, vet);
    if (!g) return false;
    const st = this.state.get(g);
    if (st === 'failed') return false;
    if (!st) void this.load(g);
    return true;
  }

  /** Has the group come whole, or failed (nothing more to wait for)? */
  settled(group: string): boolean {
    const st = this.state.get(group);
    return st === 'done' || st === 'failed';
  }

  /** Has the group come whole? */
  done(group: string): boolean {
    return this.state.get(group) === 'done';
  }

  private async load(g: string): Promise<void> {
    this.state.set(g, 'loading');
    const t0 = performance.now();
    try {
      const r = await this.get(`${g}.json`);
      if (!r.ok) throw new Error(`${g}.json: ${r.status}`);
      const f = (await r.json()) as BakeFile;
      if (f.mark !== this.mark || f.group !== g) throw new Error(`${g}: of another bake`);
      // (each hero's lists as the game has them now, against the bake's)
      const art = this.art();
      const wants = new Map<number, [BakeFile['keys'][number], number, number, number][]>();
      for (const k of f.keys) {
        const a = art.of(k.cls, { ...lookOfPlace(k.place), vet: k.vet });
        if (JSON.stringify(listLengths(heroSides(a))) !== JSON.stringify(k.lens)) throw new Error(`${keyName(k)}: its lists are not as baked`);
        for (let n = 0; n + 3 < k.at.length; n += 4) {
          const fi = k.at[n + 3];
          let w = wants.get(fi);
          if (!w) wants.set(fi, (w = []));
          w.push([k, k.at[n], k.at[n + 1], k.at[n + 2]]);
        }
      }
      // (a sheet at a time, in the order they were baked: the frames wanted first are on the first)
      for (let s = 0; s < f.sheets.length; s++) {
        const rs = await this.get(f.sheets[s]);
        if (!rs.ok) throw new Error(`${f.sheets[s]}: ${rs.status}`);
        const bmp = await createImageBitmap(await rs.blob(), { premultiplyAlpha: 'default', colorSpaceConversion: 'none' });
        const sheet: FrameSheet = { img: bmp };
        let kept = 0;
        // (for measuring: how long this sheet's frames took to be handed to his art, between two frames)
        const h0 = performance.now();
        // (THE LOADING SCREEN'S WORK IN SLICES, main.ts LOAD_SLICE: handed over HAND_MS at a time, a frame let in between, so that
        // the loading screen's ring goes on turning; the Brawler from eight sides gives some 740 frames a sheet)
        let h1 = h0;
        let paused = 0;
        for (let fi = 0; fi < f.frames.length; fi++) {
          if (HAND_MS > 0 && (fi & 31) === 0 && performance.now() - h1 > HAND_MS) {
            const p0 = performance.now();
            this.stats.handMax = Math.max(this.stats.handMax, Math.round((p0 - h1) * 10) / 10);
            await new Promise<void>((ok) => setTimeout(ok, 0));
            h1 = performance.now();
            paused += h1 - p0;
          }
          if (f.frames[fi][0] !== s) continue;
          const [, x, y, w, h, part] = f.frames[fi];
          const sprite = sheetSprite(f.parts[part], sheet, x, y, w, h);
          let took = false;
          for (const [k, v, l, i] of wants.get(fi) ?? []) {
            if (this.give(k.cls, k.place, v, l, i, sprite, k.vet)) took = true;
          }
          if (took) {
            this.stats.given++;
            kept++;
          } else this.stats.unwanted++;
        }
        const end = performance.now();
        this.stats.handMs += end - h0 - paused;
        // (`handMax`: the longest the frames were handed over in one go, with no frame let in)
        this.stats.handMax = Math.max(this.stats.handMax, Math.round((end - h1) * 10) / 10);
        if (kept) {
          this.sheets.push(sheet);
          this.stats.sheets++;
          this.stats.sheetPx += bmp.width * bmp.height;
        } else {
          // (none of its frames was wanted: nothing holds it)
          sheet.img = null;
          bmp.close();
        }
      }
      this.state.set(g, 'done');
      this.stats.ms[g] = Math.round(performance.now() - t0);
    } catch (e) {
      this.state.set(g, 'failed');
      this.stats.failed.push(`${g}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}

