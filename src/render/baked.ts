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
import { ASKED } from '../art/asked';
import { heroSides } from '../art/sides';
import { retireSprite } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { ClassId } from '../game/types';

declare const __HERO_BAKE__: string | undefined;

/** The switch: off, the heroes are painted while the game is played, as before. */
export const BAKED = { on: true };

/** The folder beside the page the bakes are in, each in a folder of its own named by its mark (tools/build.mjs). */
export const BAKE_DIR = 'heroes';

/**
 * A HERO'S MOVES KEPT PACKED (the Brawler memory chat, 11 Nov 2026; the queue's make-brawlers-eight-sides-fit-in-memory; his
 * words to the main chat, 11 Nov 2026, 19:54: “How do we make the brawler so he’s playable without crashing the game?”).
 *
 * The Brawler from all eight sides (art/sides_more.ts EIGHT_MORE.brawler) is 9,666 pictures, 142 MB held from the moment he is
 * first shown, where he held 36 from two sides and the Ranger, the heaviest hero, holds 92 (docs/mockups/eight_sides/
 * BRING_IN.md: the weighing). Memory is what froze his phone (25.3.2). So a hero baked IN PACKS holds, always, only what he
 * shows all the time (his stance, his run, struck, and the first frame of every move: under 10 MB of the Brawler's), and each
 * of his moves, for each side, is a PACK: one small sheet of its own (the move's frames, its strike's half-frames and its action
 * lines from that side: half a megabyte to four unpacked, a few tens of kilobytes as a file), fetched with him under the loading
 * screen and KEPT PACKED, as the file's own bytes. A pack is UNPACKED AS ITS MOVE BEGINS (the game's drawing tells of the list
 * it asked a frame of and did not find: art/asked.ts; and a moment ahead where it can be known: render/veteran_fx.ts
 * asks for the moves a press would make next), and until its pictures come, a few hundredths of a second, the move shows its
 * first frame, which is his stance. Unpacked pictures are kept up to `budget`; past it THE LEAST LATELY THROWN ARE LET GO (their
 * places put back as they were, their room given back: engine/px.ts retireSprite) and unpacked again when next thrown.
 *
 * WHICH HERO IS PACKED IS DECIDED AS HE IS BAKED (packsOf, below): a hero not baked in packs is taken in whole, as before.
 * `on` off: a hero baked in packs has every pack unpacked as he is first taken in and none let go (he holds every picture).
 */
export const PACKS = {
  on: true,
  /**
   * How many bytes of unpacked packs are kept (four a pixel). 40 MB: with the 10 he always holds the Brawler holds about 50 MB at
   * most, where he held 36 from two sides, would hold 143 from eight with none let go, and the Ranger holds 92. Tried on floor 2,
   * a bot fighting four minutes of the game's time (tools/scenarios/mem_floors.mjs BUDGET): at 26 MB a pack was unpacked 161
   * times and let go 131; at 40, 72 and 29; at 56 the 54 packs that fight used all stayed in hand (48 MB). A frame's work was
   * the same at all three.
   * (WRITTEN AS A PLAIN NUMBER, 40 x 1,048,576: the bake's mark is the hash of the code its page is made of, and a sum here
   * kept this whole object in it, so that tuning the budget would have made a new mark and a new bake of the same pictures.
   * As plain numbers nothing of PACKS is in the bake's page: the budget is tuned without baking again.)
   */
  budget: 41943040,
  /** A pack asked for within this long (ms) is not let go of, whatever the budget: what is being shown is never let go. */
  fresh: 1500,
  /** How many packs are unpacked at once. */
  atOnce: 2,
  /**
   * HOW A PACK'S FRAMES ARE CUT FROM ITS SHEET.
   * 'canvas': the sheet read as a picture (an Image: the browser reads it beside the game) and each frame drawn out of it into a
   * canvas of its own, on the game's own thread, a few at a time (`slice` ms of it a frame of the game's), as the game's own
   * painted frames and their mirror images are canvases, and as the floors' monsters' bake cuts its own
   * (build/monsters-before-play, render/monsters_baked.ts).
   * 'bitmap': a picture made by the browser for each frame (createImageBitmap), as what a hero always holds is taken in.
   * WHY 'canvas': his word from the phone, 11 Nov 2026, of the test page that had him from eight sides, every frame taken in the
   * second way: a minute to come into town, the loading screen lagging (docs/mockups/eight_sides/BRING_IN.md, its foot). The
   * eight-sides merge chat's lead (the queue's measure-lag-on-his-phone): an iPhone's browser is known to be slow at making a
   * picture for every frame. In play a pack would be a hundred such, again and again. Drawing into a canvas is what the game
   * does every frame. NEITHER WAY HAS BEEN MEASURED ON A PHONE: one word to change when his phone has been.
   */
  cut: 'canvas' as 'canvas' | 'bitmap',
  /** (cut: 'canvas') How long the cutting may take of one frame of the game's, each pack being unpacked (ms). */
  slice: 2,
};

/** A list's pack: its name (the move's; the pack is this move from the list's side), and whether the list's first frame is always held. */
export interface PackOf {
  pack: string;
  lead: boolean;
}

/**
 * THE PACK EACH OF A HERO'S LISTS IS KEPT IN, by side and by list as heroLists has them (null: the list is always held), or
 * null for a hero who is not packed. PACKED: the Brawler as the Veteran from all eight sides, where the game is played (never
 * his class card). A move's pack holds its frames, its strike's half-frames and its action lines' three layers; his fall is
 * a pack of its own; a move's own first frame (his stance) and his fall's are always held, so that a move not unpacked yet
 * has a frame to show. His stance, his run and struck are always held whole.
 */
export function packsOf(k: BakeKey, sides: readonly AnimSet[]): (PackOf | null)[][] | null {
  if (k.cls !== 'brawler' || !k.vet || k.place === 'card' || sides.length !== 8) return null;
  return sides.map((side) => {
    const of = new Map<unknown, PackOf>();
    const c = side.clips;
    for (const [id, clip] of Object.entries(c?.vet ?? {})) of.set(clip.frames, { pack: id, lead: true });
    for (const [id, h] of Object.entries(c?.vetHalves ?? {})) of.set(h.frames, { pack: id, lead: false });
    for (const [id, fx] of Object.entries(c?.vetFx ?? {})) for (const layer of Object.values(fx)) of.set(layer, { pack: id, lead: false });
    if (c?.fall) of.set(c.fall.frames, { pack: 'fall', lead: true });
    return heroLists(side).map((l) => of.get(l) ?? null);
  });
}

/** A pack's name in its group's file: the move and the side. */
export const packName = (pack: string, side: number): string => `${pack}:${side}`;

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
  /** (A hero kept in packs: PACKS) Each pack. What is in `frames` and the keys' `at` is what he always holds. */
  packs?: BakePack[];
}

/** A pack of a hero's pictures (PACKS): one move from one side, on a sheet of its own. */
export interface BakePack {
  /** The move and the side (packName). */
  name: string;
  /** Its sheet's file (a PNG), beside the group's. */
  sheet: string;
  /** Each frame on its sheet: [x, y, width, height, the index of its other parts in the group's `parts`]. */
  frames: [number, number, number, number, number][];
  /** Its frames' places, flat: the hero (his index in `keys`), side, list, frame, the frame's index in this pack's `frames`. */
  at: number[];
  /** How many bytes its pictures are, unpacked (four a pixel). */
  bytes: number;
}

/** A frame cut from a pack's sheet: a picture made by the browser, or a canvas (PACKS.cut). */
type Cut = ImageBitmap | HTMLCanvasElement;
/** A cut not wanted after all: its room given back. */
function dropCut(c: Cut): void {
  if (typeof (c as ImageBitmap).close === 'function') (c as ImageBitmap).close();
  else {
    (c as HTMLCanvasElement).width = 0;
    (c as HTMLCanvasElement).height = 0;
  }
}

/** A pack as the game holds it: packed (its file's bytes), being unpacked, or in hand. */
interface Pack {
  def: BakePack;
  parts: BakeFile['parts'];
  blob: Blob;
  /** Its places, each once: the list, the frame, the frame's index in the pack. */
  places: [Sprite[], number, number][];
  state: 'packed' | 'unpacking' | 'held';
  /** Every place a picture of it was given into, and what was there before (the frame's own painter), to put back as it is let go. */
  held: { list: Sprite[]; i: number; was: PropertyDescriptor; s: Sprite }[];
  /** When it was last asked for (ms). */
  used: number;
  /** How many times it would not unpack (three, and it is left to the painter). */
  failed: number;
}

type Give = (cls: ClassId, place: HeroPlace, v: number, l: number, i: number, s: Sprite, vet?: boolean) => boolean;

/** How many of a sheet's frames are cut from it at a time. */
const AT_ONCE = 48;

/**
 * THE BAKED PICTURES, TAKEN IN (render/painter.ts, Painter.baked): a group is fetched the first time one of its heroes is asked
 * for, a sheet at a time (a sheet is let go of once its frames are cut from it), and every frame handed to the hero's art where
 * it is still unpainted.
 */
export class BakedHeroes {
  private state = new Map<string, 'loading' | 'done' | 'failed'>();
  private readonly groups: Record<string, BakeKey[]>;
  private readonly groupOf = new Map<string, string>();
  /** For measuring: frames taken in, frames not wanted (painted already), how long each group took (ms), and what failed. */
  readonly stats = {
    given: 0,
    unwanted: 0,
    ms: {} as Record<string, number>,
    failed: [] as string[],
    /**
     * THE PACKS (PACKS): how many there are and how many bytes their files are; how many are in hand and their bytes unpacked;
     * how many times one was unpacked and let go; how many were asked for by the game's drawing with no picture to show yet
     * (`missed`: a stand-in was shown meanwhile) and how many ahead of need; how long unpacking has taken in all and at worst (ms),
     * most of it the browser's own, beside the game; and `work`, how much of it was on the game's own thread (asking for the cuts,
     * giving the pictures into their places, letting others go), in all and at worst in one go (ms).
     */
    packs: { all: 0, packed: 0, held: 0, bytes: 0, most: 0, unpacked: 0, letGo: 0, missed: 0, ahead: 0, ms: 0, worst: 0, work: 0, workWorst: 0 },
  };
  /** The packs, by group and name; by the lists they fill; those waiting to be unpacked, the soonest wanted first; how many are being unpacked. */
  private readonly packs = new Map<string, Pack>();
  private readonly packOf = new Map<unknown, Pack>();
  private queue: Pack[] = [];
  private busy = 0;
  /** Told of each picture of a pack as it is let go (main.ts: what is kept that was made from it is given back with it). */
  onLetGo: ((s: Sprite) => void) | null = null;
  private readonly clock: () => number = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

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

  // -------------------------------------------------------------------------------------------
  // THE PACKS (PACKS)

  /**
   * A MOVE OF A HERO'S IS WANTED, from a side (`pack`: the move's name, as packsOf names it): unpacked if it is not in hand.
   * `now`: it is being shown (it goes before those asked for ahead of need). True: the hero has such a pack.
   */
  want(group: string, pack: string, side: number, now = true): boolean {
    const p = this.packs.get(`${group}/${packName(pack, side)}`);
    if (!p) return false;
    this.ask(p, now, false);
    return true;
  }

  /** The game's drawing asked a list for a frame it has not got (art/asked.ts): its pack, if it is in one, is unpacked. */
  private asked(list: readonly Sprite[]): void {
    const p = this.packOf.get(list);
    if (p) this.ask(p, true, true);
  }

  private ask(p: Pack, now: boolean, shown: boolean): void {
    p.used = this.clock();
    if (p.state !== 'packed' || p.failed >= 3) return;
    const at = this.queue.indexOf(p);
    if (at >= 0) {
      if (!now) return;
      this.queue.splice(at, 1);
    } else if (shown) this.stats.packs.missed++;
    else this.stats.packs.ahead++;
    if (now) this.queue.unshift(p);
    else this.queue.push(p);
    this.pump();
  }

  private pump(): void {
    while (this.busy < PACKS.atOnce && this.queue.length) {
      const p = this.queue.shift()!;
      if (p.state === 'packed') void this.unpack(p);
    }
  }

  /** Unpack one: its sheet read from its file's bytes, its frames cut from it and given into their places where those are still unpainted. */
  private async unpack(p: Pack): Promise<void> {
    if (p.state !== 'packed') return;
    p.state = 'unpacking';
    this.busy++;
    const t0 = this.clock();
    const S = this.stats.packs;
    try {
      // (PACKS.cut: each frame a canvas drawn out of the sheet, where there is a page to make canvases on; else, and in the
      // tests, a picture made by the browser for each)
      const bmps: Cut[] = PACKS.cut === 'canvas' && typeof document !== 'undefined' && typeof Image !== 'undefined' ? await this.cutCanvases(p) : await this.cutBitmaps(p);
      const g0 = this.clock();
      const sprites: (Sprite | undefined)[] = new Array<Sprite | undefined>(bmps.length);
      for (const [list, i, fi] of p.places) {
        const was = Object.getOwnPropertyDescriptor(list, i);
        // (a place painted already keeps its picture: nothing of it is the bake's to give back)
        if (!was || typeof was.get !== 'function') continue;
        const s = (sprites[fi] ??= { ...p.parts[p.def.frames[fi][4]], img: bmps[fi] as unknown as HTMLCanvasElement } as Sprite);
        Object.defineProperty(list, i, { value: s, writable: true, configurable: true, enumerable: true });
        p.held.push({ list, i, was, s });
      }
      for (let fi = 0; fi < bmps.length; fi++) {
        if (sprites[fi]) this.stats.given++;
        else {
          this.stats.unwanted++;
          dropCut(bmps[fi]);
        }
      }
      p.state = 'held';
      p.used = Math.max(p.used, t0);
      S.held++;
      S.bytes += p.def.bytes;
      S.most = Math.max(S.most, S.bytes);
      S.unpacked++;
      this.worked(g0);
      const ms = this.clock() - t0;
      S.ms += ms;
      S.worst = Math.max(S.worst, ms);
    } catch (e) {
      p.state = 'packed';
      p.failed++;
      if (p.failed >= 3) this.stats.failed.push(`${p.def.name}: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      this.busy--;
    }
    const l0 = this.clock();
    this.trim(p);
    this.worked(l0);
    this.pump();
  }

  /** A pack's frames, each a picture made by the browser from its sheet (PACKS.cut 'bitmap'), a few asked for at a time. */
  private async cutBitmaps(p: Pack): Promise<Cut[]> {
    const opts: ImageBitmapOptions = { premultiplyAlpha: 'default', colorSpaceConversion: 'none' };
    const sheet = await createImageBitmap(p.blob, opts);
    const out: Cut[] = [];
    try {
      // (a few at a time: asking for a cut costs the game's own thread a little, and a big pack's 135 at once was 10 ms of it)
      const AT = 24;
      for (let n = 0; n < p.def.frames.length; n += AT) {
        const w0 = this.clock();
        const cuts = p.def.frames.slice(n, n + AT).map(([x, y, w, h]) => createImageBitmap(sheet, x, y, w, h, opts));
        this.worked(w0);
        out.push(...(await Promise.all(cuts)));
      }
    } finally {
      sheet.close();
    }
    return out;
  }

  /**
   * A pack's frames, each a canvas of its own drawn out of its sheet (PACKS.cut 'canvas'): the sheet read as a picture by the
   * browser, beside the game; then the frames cut on the game's own thread, PACKS.slice ms of it at a time, the game given a
   * frame of its own between. A canvas refused (an iPhone gives a page only so much room for them): those made are given back,
   * and the pack is not unpacked.
   */
  private async cutCanvases(p: Pack): Promise<Cut[]> {
    const url = URL.createObjectURL(p.blob);
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    const out: HTMLCanvasElement[] = [];
    try {
      await img.decode();
      const all = p.def.frames;
      while (out.length < all.length) {
        const t0 = this.clock();
        do {
          const [x, y, w, h] = all[out.length];
          const cv = document.createElement('canvas');
          cv.width = w;
          cv.height = h;
          const g = cv.getContext('2d');
          if (!g) {
            out.push(cv);
            throw new Error('no canvas to be had');
          }
          g.drawImage(img, x, y, w, h, 0, 0, w, h);
          out.push(cv);
        } while (out.length < all.length && this.clock() - t0 < PACKS.slice);
        this.worked(t0);
        if (out.length < all.length) await new Promise<void>((r) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => r()) : setTimeout(r, 0)));
      }
      return out;
    } catch (e) {
      for (const cv of out) dropCut(cv);
      throw e;
    } finally {
      img.src = '';
      URL.revokeObjectURL(url);
    }
  }

  /** (for the measures) So long on the game's own thread, since `t0`. */
  private worked(t0: number): void {
    const ms = this.clock() - t0;
    this.stats.packs.work += ms;
    this.stats.packs.workWorst = Math.max(this.stats.packs.workWorst, ms);
  }

  /** Past the budget, the least lately asked for are let go (never one asked for a moment ago, nor `keep`, the one that has just come). */
  private trim(keep: Pack): void {
    if (!PACKS.on) return;
    const S = this.stats.packs;
    if (S.bytes <= PACKS.budget) return;
    const t = this.clock();
    const held = [...this.packs.values()].filter((p) => p.state === 'held' && p !== keep).sort((a, b) => a.used - b.used);
    for (const p of held) {
      if (S.bytes <= PACKS.budget || t - p.used < PACKS.fresh) break;
      this.letGo(p);
    }
  }

  /** Let a pack go: each place put back as it was (the frame's own painter), its pictures' room given back a moment on (engine/px.ts retireSprite). */
  private letGo(p: Pack): void {
    const gone = new Set<Sprite>();
    for (const h of p.held) {
      const d = Object.getOwnPropertyDescriptor(h.list, h.i);
      if (d && 'value' in d && d.value === h.s) Object.defineProperty(h.list, h.i, h.was);
      gone.add(h.s);
    }
    for (const s of gone) {
      // (whoever keeps pictures made from this one, his after-images: render/veteran_fx.ts forget, gives them back with it)
      this.onLetGo?.(s);
      retireSprite(s);
    }
    p.held = [];
    p.state = 'packed';
    const S = this.stats.packs;
    S.held--;
    S.bytes -= p.def.bytes;
    S.letGo++;
  }

  /** The packs in hand, the least lately asked for first (for the tests and the measures). */
  packsHeld(): string[] {
    return [...this.packs.entries()].filter(([, p]) => p.state === 'held').sort((a, b) => a[1].used - b[1].used).map(([n]) => n);
  }

  /** Every pack let go of, whatever the budget (for the tests and the measures). */
  letGoAll(): void {
    for (const p of this.packs.values()) if (p.state === 'held') this.letGo(p);
  }

  /** Every pack unpacked, whatever is asked for (for the measures: what he would hold with none ever let go, PACKS.on off). */
  unpackAll(): void {
    for (const p of this.packs.values()) this.ask(p, false, false);
  }

  /** Is nothing being unpacked or waiting to be (for the tests and the measures)? */
  packsIdle(): boolean {
    return this.busy === 0 && this.queue.length === 0;
  }

  /**
   * A group's packs, fetched and kept packed: each one's places found among the heroes' lists as the game has them. With PACKS
   * off, each unpacked here, one after another, and none ever let go.
   */
  private async takePacks(g: string, f: BakeFile, lists: Sprite[][][][]): Promise<void> {
    const defs = f.packs ?? [];
    const S = this.stats.packs;
    const AT = 24;
    for (let n = 0; n < defs.length; n += AT) {
      const part = defs.slice(n, n + AT);
      const blobs = await Promise.all(part.map(async (d) => {
        const r = await this.get(d.sheet);
        if (!r.ok) throw new Error(`${d.sheet}: ${r.status}`);
        return r.blob();
      }));
      part.forEach((def, q) => {
        // (each place once: a hero who is the same in town and in a dungeon has the same lists in both)
        const seen = new Map<Sprite[], Set<number>>();
        const places: Pack['places'] = [];
        for (let a = 0; a + 4 < def.at.length; a += 5) {
          const list = lists[def.at[a]]?.[def.at[a + 1]]?.[def.at[a + 2]];
          const i = def.at[a + 3];
          if (!list || i < 0 || i >= list.length) continue;
          let had = seen.get(list);
          if (!had) seen.set(list, (had = new Set()));
          if (had.has(i)) continue;
          had.add(i);
          places.push([list, i, def.at[a + 4]]);
        }
        const p: Pack = { def, parts: f.parts, blob: blobs[q], places, state: 'packed', held: [], used: 0, failed: 0 };
        this.packs.set(`${g}/${def.name}`, p);
        for (const list of seen.keys()) this.packOf.set(list, p);
        S.all++;
        S.packed += blobs[q].size;
      });
    }
    if (!defs.length) return;
    ASKED.told = (list) => this.asked(list);
    if (PACKS.on) return;
    for (const def of defs) await this.unpack(this.packs.get(`${g}/${def.name}`)!);
    // (and any the game's drawing asked for meanwhile: the group has come whole when every one is in hand)
    while (defs.some((def) => this.packs.get(`${g}/${def.name}`)!.state === 'unpacking')) await new Promise((r) => setTimeout(r, 5));
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
    // (ANOTHER HERO IS PLAYED: a packed hero's packs in hand are let go; they are his own only while he is the one played)
    if (g !== 'cards' && this.stats.packs.held) for (const [name, p] of this.packs) if (p.state === 'held' && !name.startsWith(`${g}/`)) this.letGo(p);
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
      /** (for the packs: each hero's lists, by side and by list) */
      const lists: Sprite[][][][] = [];
      for (const k of f.keys) {
        const a = art.of(k.cls, { ...lookOfPlace(k.place), vet: k.vet });
        if (JSON.stringify(listLengths(heroSides(a))) !== JSON.stringify(k.lens)) throw new Error(`${keyName(k)}: its lists are not as baked`);
        if (f.packs?.length) lists.push(heroSides(a).map((side) => heroLists(side)));
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
        const sheet = await createImageBitmap(await rs.blob(), { premultiplyAlpha: 'default', colorSpaceConversion: 'none' });
        try {
          const mine: number[] = [];
          for (let fi = 0; fi < f.frames.length; fi++) if (f.frames[fi][0] === s) mine.push(fi);
          for (let n = 0; n < mine.length; n += AT_ONCE) {
            const part = mine.slice(n, n + AT_ONCE);
            const bmps = await Promise.all(part.map((fi) => {
              const [, x, y, w, h] = f.frames[fi];
              return createImageBitmap(sheet, x, y, w, h, { premultiplyAlpha: 'default', colorSpaceConversion: 'none' });
            }));
            for (let q = 0; q < part.length; q++) {
              const fi = part[q];
              const sprite = { ...f.parts[f.frames[fi][5]], img: bmps[q] as unknown as HTMLCanvasElement } as Sprite;
              let took = false;
              for (const [k, v, l, i] of wants.get(fi) ?? []) {
                if (this.give(k.cls, k.place, v, l, i, sprite, k.vet)) took = true;
              }
              if (took) this.stats.given++;
              else {
                this.stats.unwanted++;
                bmps[q].close();
              }
            }
          }
        } finally {
          sheet.close();
        }
      }
      // (a hero kept in packs, PACKS: his packs fetched and kept packed; what came above is what he always holds)
      if (f.packs?.length) await this.takePacks(g, f, lists);
      this.state.set(g, 'done');
      this.stats.ms[g] = Math.round(performance.now() - t0);
    } catch (e) {
      this.state.set(g, 'failed');
      this.stats.failed.push(`${g}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}

