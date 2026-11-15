// THE HEROES' PICTURES BAKED: painted once when the game is built (tools/bake_heroes.mjs), shipped with the game's page as sheets
// of pictures in files beside it (heroes/<mark>/: one page alone may not be over 16 MB where it is published, and so a hero's
// sheets are fetched only when he is played), and taken in when a hero is first shown, in place of painting them while the
// game is played. His words, 4 Nov 2026, 19:22 (Eastern): “And something was said about storing drawings so that loading is easier.
// I’m into that if I can be implemented.  Unless it’s a last step kind of thing since it would make the game bigger to load or
// whatever”; asked how, 6 Nov 2026, his pick: “Inside the game file”.
//
// The pictures are the very ones the painter's worker paints (render/painter.ts, hero), the same lists in the same places
// (art/heroes3.ts heroLists; bakeLists, with a hero's making ready on his card), handed in the same way (HeroArt.give). Wherever the baked pictures are not to be had (a page
// built without them or opened from a file, a sheet that will not load, a hero whose lists are not as they were baked), the
// game paints them as it did before: nothing is lost but time.

import { bakeLists, cardLists, readyList } from '../art/heroes3';
import { lookOfPlace } from '../art/heroes';
import type { HeroArt, HeroPlace } from '../art/heroes';
import { BOW_IDS, BOW_PLACES, BOW_SKINS, HEAVY_PLACES, STAFF_IDS, STAFF_PLACES, STAFF_SKINS, TOME_IDS, TOME_PLACES, TOME_SKINS, WARRIOR_SKINS, WARRIOR_SKIN_IDS, WARRIOR_SKIN_KIND, WARRIOR_SKIN_PLACES, WRAP_IDS, WRAP_PLACES, WRAP_SKINS, WRENCH_IDS, WRENCH_PLACES, WRENCH_SKINS } from '../art/heroes';
import { WARRIOR_TREE2 } from '../game/talents';
import type { AnimSet } from '../art/actor_types';
import { ASKED } from '../art/asked';
import { heroSides } from '../art/sides';
import { retireSprite, sheetSprite } from '../engine/px';
import type { FrameSheet, Sprite } from '../engine/px';
import type { ClassId } from '../game/types';

declare const __HERO_BAKE__: string | undefined;

/** The switch: off, the heroes are painted while the game is played, as before. */
export const BAKED = { on: true };

/** (main.ts LOAD_SLICE) The most a group's frames are handed over in one go, in thousandths of a second, before a frame is let in (0: all at once, as before). */
export const HAND_MS = 6;

/** The folder beside the page the bakes are in, each in a folder of its own named by its mark (tools/build.mjs). */
export const BAKE_DIR = 'heroes';

/**
 * A HERO'S MOVES KEPT PACKED (the Brawler memory chat, 11 and 12 Nov 2026; the queue's make-brawlers-eight-sides-fit-in-memory;
 * his words to the main chat, 11 Nov 2026, 19:54: “How do we make the brawler so he’s playable without crashing the game?”).
 *
 * The Brawler from all eight sides (art/sides_more.ts EIGHT_MORE.brawler) is 9,666 pictures: 142 MB as pictures of their own,
 * about 200 as thirteen sheets held whole (the way every hero's frames are kept since they are drawn from their sheets:
 * engine/px.ts sheetSprite), where he is 53 from two sides and the Ranger, the heaviest hero, 109. Memory is what froze his
 * phone (25.3.2). So a hero baked IN PACKS holds, always, only what he shows all the time (his stance, his run, struck, and the
 * first frame of every move: one sheet, under 10 MB of the Brawler's), and each of his moves, for each side, is a PACK: one
 * small sheet of its own (the move's frames, its strike's half-frames and its action lines from that side: half a megabyte
 * to four and a half open, a few tens of kilobytes as a file), fetched with him under the loading screen and KEPT PACKED, as
 * the file's own bytes. A pack is OPENED AS ITS MOVE BEGINS: its sheet read by the browser, beside the game, and its frames
 * given into their places as frames kept in that sheet, each cut from it only when it is first drawn, as any hero's
 * (the game's drawing tells of the list it asked a frame of and did not find: art/asked.ts; and a moment ahead where it can
 * be known: render/veteran_fx.ts asks for the moves a press would make next). Until its sheet is read, a few hundredths of a
 * second, the move shows its first frame, which is his stance. Open sheets are kept up to `budget`; past it THE LEAST LATELY
 * THROWN ARE LET GO (their places put back as they were, their sheet closed, what was cut from it given back: engine/px.ts
 * retireSprite) and opened again when next thrown.
 *
 * WHICH HERO IS PACKED IS DECIDED AS HE IS BAKED (packsOf, below): a hero not baked in packs is taken in whole, as before.
 * `on` off: a hero baked in packs has every pack opened as he is first taken in and none let go (he holds every sheet).
 */
export const PACKS = {
  on: true,
  /**
   * How many bytes of packs' sheets are kept open (four a pixel). 32 MB: with the 10 he always holds and the frames cut from
   * sheets, which every hero shares (engine/px.ts CUT_BUDGET, 24 MB), the Brawler holds about 66 MB at the very most, where
   * his sheets from eight sides would be about 200 held whole, and from two sides are 53. Tried on floor 2 with a bot fighting
   * four minutes of the game's time, when a pack's frames were each cut as it was unpacked: at 26 MB a pack was unpacked 161
   * times and let go 131; at 40, 72 and 29; at 56 none was let go. Opening one is now reading one small sheet, so it may
   * come and go more often for less.
   * (PLAIN NUMBERS, 32 x 1,048,576: the bake's mark is the hash of the code its page is made of, and a sum here kept this
   * whole object in it. As plain numbers nothing of PACKS is in the bake's page: the budget is tuned without baking again.)
   */
  budget: 33554432,
  /** A pack asked for within this long (ms) is not let go of, whatever the budget: what is being shown is never let go. */
  fresh: 1500,
  /** How many packs are unpacked at once. */
  atOnce: 2,
};

/** A list's pack: its name (the move's; the pack is this move from the list's side), and whether the list's first frame is always held. */
export interface PackOf {
  pack: string;
  lead: boolean;
}

/**
 * THE PACK EACH OF A HERO'S LISTS IS KEPT IN, by side and by list as bakeLists has them (null: the list is always held), or
 * null for a hero who is not packed. PACKED: the Brawler as the Veteran from all eight sides, where the game is played (never
 * his class card). A move's pack holds its frames, its strike's half-frames and its action lines' three layers; his fall is
 * a pack of its own; a move's own first frame (his stance) and his fall's are always held, so that a move not unpacked yet
 * has a frame to show. His stance, his run and struck are always held whole.
 */
export function packsOf(k: BakeKey, sides: readonly AnimSet[]): (PackOf | null)[][] | null {
  if (k.cls === 'warlock') return warlockPacksOf(k, sides);
  if (k.cls !== 'brawler' || !k.vet || k.place === 'card' || sides.length !== 8) return null;
  return sides.map((side) => {
    const of = new Map<unknown, PackOf>();
    const c = side.clips;
    for (const [id, clip] of Object.entries(c?.vet ?? {})) of.set(clip.frames, { pack: id, lead: true });
    for (const [id, h] of Object.entries(c?.vetHalves ?? {})) of.set(h.frames, { pack: id, lead: false });
    for (const [id, fx] of Object.entries(c?.vetFx ?? {})) for (const layer of Object.values(fx)) of.set(layer, { pack: id, lead: false });
    if (c?.fall) of.set(c.fall.frames, { pack: 'fall', lead: true });
    return bakeLists(side).map((l) => of.get(l) ?? null);
  });
}

/**
 * THE WARLOCK KEPT IN PACKS (the queue's finish-mage-and-warlock-eight-sides, 12 Nov 2026; his words, asked whether the Warlock
 * brought up was right and told he would want packing for his phone: “Why don’t you pack him away?”). Brought up from all eight
 * sides (art/warlock_up.ts WARLOCK_UP) he is 6,136 frames, about 142 MB as pictures of their own, where he was 28 from two
 * sides; and his demon redone, the Living Shadow (art/shadow_art.ts LIVING_SHADOW), is 1,506 from its two sides, about 145 MB,
 * where the game's demon is 78. So, as the Brawler is, he holds always only what he shows all the time and the first frame of
 * every move, and every move of his, from each side, is a pack of its own, opened as it is shown (and a moment ahead:
 * render/warlock_packs.ts):
 *   A MAN BROUGHT UP (eight sides; where the game is played: in town, in a dungeon, his arm blazing; never his card): HELD, his
 *   run (and blazing); PACKED, from each side, his stand (`stand`; blazing, `standBlaze`: he stands facing one way at a time), his
 *   bolt, his curse, the smoke step (both its ends), struck (from in front and from behind), his fall, and the change.
 *   THE LIVING SHADOW (its two sides; the game's own demon, with no rearing up, is not packed): HELD, its run on all fours;
 *   PACKED, from each side, its stand (`it-stand`), dropping down (`it-drop`), each of its eight rear-ups (`it-rear0` to 7), its
 *   slashes standing (`it-slashL`, `it-slashR`) and each made walking (`it-walkSlash0` to 3), Damning, its smoke step, struck, and
 *   its burning out (`it-burn`). (A pack is one sheet, 2048 square: its dropping down with its rear-ups did not go on one.)
 * A list's first frame is always held, so a move not unpacked yet shows it, a few hundredths of a second.
 */
function warlockPacksOf(k: BakeKey, sides: readonly AnimSet[]): (PackOf | null)[][] | null {
  if (k.place === 'card') return null;
  const shadow = k.place === 'demon' && sides.length === 2 && !!sides[0].stops?.length;
  const man = k.place !== 'demon' && sides.length === 8;
  if (!shadow && !man) return null;
  return sides.map((side) => {
    const of = new Map<unknown, PackOf>();
    const put = (l: readonly unknown[] | undefined, pack: string): void => {
      if (l && l.length) of.set(l, { pack, lead: true });
    };
    const c = side.clips;
    if (man) {
      // (his arm blazing: in his place for it, or a unique tome's, art/heroes.ts TOME_PLACES)
      put(side.idle, k.place === 'blaze' || lookOfPlace(k.place).blaze ? 'standBlaze' : 'stand');
      put(c?.attack?.frames, 'bolt');
      put(c?.heavy?.frames, 'curse');
      put(c?.leap?.frames, 'step');
      put(c?.land?.frames, 'step');
      put(c?.reel?.frames, 'struck');
      put(c?.lurch?.frames, 'struck');
      put(c?.fall?.frames, 'fall');
      put(c?.change?.frames, 'change');
    } else {
      // (its big lists each a pack of its own: a pack is one sheet, 2048 square, and its dropping down with its eight rear-ups,
      // or its four slashes made walking, are more than one; its burning out and the man's change are one each)
      put(side.idle, 'it-stand');
      put(side.start?.frames, 'it-drop');
      (side.stops ?? []).forEach((st, i) => put(st.frames, `it-rear${i}`));
      put(c?.attack?.frames, 'it-slashL');
      put(c?.attack2?.frames, 'it-slashR');
      (c?.attackWalk ?? []).forEach((w, i) => put(w.frames, `it-walkSlash${i}`));
      put(c?.heavy?.frames, 'it-damning');
      put(c?.leap?.frames, 'it-step');
      put(c?.land?.frames, 'it-step');
      put(c?.reel?.frames, 'it-struck');
      put(c?.lurch?.frames, 'it-struck');
      put(c?.change?.frames, 'it-burn');
    }
    return bakeLists(side).map((l) => of.get(l) ?? null);
  });
}

/** The class a group is of: its name before any '-' (`brawler-lastround`, `warlock-demon`, `warrior-axe`: the hero's). */
export const classOfGroup = (g: string): string => (g.indexOf('-') < 0 ? g : g.slice(0, g.indexOf('-')));

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
  // (THE WARLOCK'S BOOK, art/heroes.ts TOME_SKINS: while it is on, his demon is a group of its own, `warlock-demon`, kept whatever
  // book he wears; the man, with his own book or a unique one, a group each, one held at a time)
  for (const c of classes) out[c] = c === 'warlock' ? ((TOME_SKINS.on ? ['town', 'dungeon', 'blaze'] : ['town', 'dungeon', 'demon', 'blaze']) as HeroPlace[]).map((p) => k(c, p)) : [k(c, 'town'), k(c, 'dungeon')];
  if (TOME_SKINS.on) out['warlock-demon'] = [k('warlock', 'demon')];
  // (THE WARRIOR'S WEAPON, game/talents.ts WARRIOR_TREE2: him with the war axe, and with the maul, each a group of its own, taken in
  // only where his weapon is that one; his great sword's group as it was. Baked only while the tree is on: off, nothing asks for them)
  if (WARRIOR_TREE2.on) for (const w of ['axe', 'hammer'] as const) out[`warrior-${w}`] = [k('warrior', HEAVY_PLACES[w].town), k('warrior', HEAVY_PLACES[w].dungeon)];
  // (THE MAGE'S STAFF, art/staff_skins.ts STAFF_SKINS: her with each unique staff, each a group of its own, baked whole (his pick,
  // 14 Nov 2026: “Bake each staff whole (Recommended)”), taken in only while she holds that staff. Baked only while the switch is
  // on: off, nothing asks for them)
  if (STAFF_SKINS.on) for (const id of STAFF_IDS) out[`mage-${id}`] = [k('mage', STAFF_PLACES[id].town), k('mage', STAFF_PLACES[id].dungeon)];
  // (THE RANGER'S BOW, art/bow_skins.ts BOW_SKINS: him with each unique bow, each a group of its own, as her staves are)
  if (BOW_SKINS.on) for (const id of BOW_IDS) out[`ranger-${id}`] = [k('ranger', BOW_PLACES[id].town), k('ranger', BOW_PLACES[id].dungeon)];
  // (THE TINKERER'S WRENCH, art/wrench_skins.ts WRENCH_SKINS: her with each unique wrench, each a group of its own)
  if (WRENCH_SKINS.on) for (const id of WRENCH_IDS) out[`tinkerer-${id}`] = [k('tinkerer', WRENCH_PLACES[id].town), k('tinkerer', WRENCH_PLACES[id].dungeon)];
  // (THE WARRIOR'S UNIQUE WEAPONS, art/heroes.ts WARRIOR_SKINS: him with each, a group of its own; an axe's or a hammer's only while
  // his tree may give him that weapon, as the war axe's and the maul's)
  if (WARRIOR_SKINS.on) for (const id of WARRIOR_SKIN_IDS) if (WARRIOR_SKIN_KIND[id] === null || WARRIOR_TREE2.on) out[`warrior-${id}`] = [k('warrior', WARRIOR_SKIN_PLACES[id].town), k('warrior', WARRIOR_SKIN_PLACES[id].dungeon)];
  // (THE BRAWLER'S WRAPS, art/heroes.ts WRAP_SKINS: the Veteran with each unique wraps, a group of its own, kept in packs as he is;
  // only the Veteran wears them)
  if (WRAP_SKINS.on && vet) for (const id of WRAP_IDS) out[`brawler-${id}`] = [k('brawler', WRAP_PLACES[id].town), k('brawler', WRAP_PLACES[id].dungeon)];
  // (THE WARLOCK'S BOOK: the man with each unique tome, in town, a dungeon and his arm blazing, kept in packs as he is)
  if (TOME_SKINS.on) for (const id of TOME_IDS) out[`warlock-${id}`] = [k('warlock', TOME_PLACES[id].town), k('warlock', TOME_PLACES[id].dungeon), k('warlock', TOME_PLACES[id].blaze)];
  return out;
}

export function keyName(k: BakeKey): string {
  return `${k.cls}:${k.place}${k.vet ? ':vet' : ''}`;
}

/**
 * Where a hero's baked frames go, as [side, list, frame] (sides as art/sides.ts numbers them: 0 the front, 1 the back, and for a
 * hero painted from eight, the six others after; lists as art/heroes3.ts bakeLists has them), in the order they are wanted:
 * standing and running first, then the first frame of every other list, then the rest (his making ready is a card's only:
 * readyList()).
 *
 * ON A CLASS CARD, EVERYTHING A CARD SHOWS (art/heroes3.ts cardLists): standing and running first, then coming to a stand out
 * of the run, of the side a card's hero is seen from (of a hero painted from eight sides, not the front); what he does left
 * standing and his making ready, of the front; each whole. (Till 12 Nov 2026 only the front's standing and running: the rest
 * was painted where the game is drawn as it was shown, the lag of the hero cards on his phone.)
 */
export function bakedPlaces(sides: readonly AnimSet[], card: boolean): [number, number, number][] {
  const lists = sides.map((s) => bakeLists(s));
  const front = sides[0];
  const out: [number, number, number][] = [];
  if (card) {
    const c = cardLists(sides);
    for (const [v, l] of c.at) for (let i = 0; i < lists[v][l].length; i++) out.push([v, l, i]);
    for (const [v, l, i] of c.one) if (l >= 0 && !c.at.some(([a, b]) => a === v && b === l)) out.push([v, l, i]);
    return out;
  }
  const most = [lists[0].indexOf(front.idle), lists[0].indexOf(front.walk)].filter((l) => l >= 0);
  const V = lists.length;
  const ready = readyList();
  const rest = (l: number): boolean => !most.includes(l) && l !== ready;
  for (const l of most) for (let v = 0; v < V; v++) for (let i = 0; i < lists[v][l].length; i++) out.push([v, l, i]);
  for (let l = 0; l < lists[0].length; l++) if (rest(l)) for (let v = 0; v < V; v++) if (lists[v][l].length) out.push([v, l, 0]);
  for (let l = 0; l < lists[0].length; l++) if (rest(l)) for (let v = 0; v < V; v++) for (let i = 1; i < lists[v][l].length; i++) out.push([v, l, i]);
  return out;
}

/**
 * How many of bakedPlaces' places are wanted before every other hero's of the group: a card's standing and running (the cards
 * come up all six at once: each hero's standing and running are laid on the group's first sheet, the rest after: dev/
 * bake_heroes_page.ts). A hero in his places: all of them (his group is laid a place after another, as it was).
 */
export function bakedFirst(sides: readonly AnimSet[], card: boolean): number {
  if (!card) return bakedPlaces(sides, false).length;
  const c = cardLists(sides);
  let n = 0;
  for (const [v, l] of c.at.slice(0, c.first)) n += bakeLists(sides[v])[l].length;
  return n;
}

/** The lengths of a hero's lists, every side (to know the baked pictures are of the hero as the game has him now). */
export function listLengths(sides: readonly AnimSet[]): number[][] {
  return sides.map((s) => bakeLists(s).map((l) => l.length));
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
  /**
   * Its sheet's file (a PNG), beside the group's; or, with `off` and `len`, the file all the group's packs are in, one after another
   * (<group>-packs.png: tools/bake_heroes.mjs), and where its own bytes lie in it.
   */
  sheet: string;
  off?: number;
  len?: number;
  /** Each frame on its sheet: [x, y, width, height, the index of its other parts in the group's `parts`]. */
  frames: [number, number, number, number, number][];
  /** Its frames' places, flat: the hero (his index in `keys`), side, list, frame, the frame's index in this pack's `frames`. */
  at: number[];
  /** How many bytes its pictures are, unpacked (four a pixel). */
  bytes: number;
}

/** A pack as the game holds it: packed (its file's bytes), being unpacked, or in hand. */
interface Pack {
  def: BakePack;
  parts: BakeFile['parts'];
  blob: Blob;
  /** Its places, each once: the list, the frame, the frame's index in the pack. */
  places: [Sprite[], number, number][];
  state: 'packed' | 'unpacking' | 'held';
  /** Its sheet, while it is open: its frames are kept in it (engine/px.ts sheetSprite). */
  sheet: FrameSheet | null;
  /** How many bytes its sheet is, open (four a pixel). */
  bytes: number;
  /** Every place a frame of it was given into, and what was there before (the frame's own painter), to put back as it is let go. */
  held: { list: Sprite[]; i: number; was: PropertyDescriptor; s: Sprite }[];
  /** When it was last asked for (ms). */
  used: number;
  /** How many times it would not unpack (three, and it is left to the painter). */
  failed: number;
  /** Its group was let go of whole while it was being unpacked (letGoGroup): what comes of it is thrown away. */
  gone?: boolean;
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
  /** The sheets in hand: a hero's pictures are kept once they have come (but a packed hero's packs: PACKS). */
  private readonly sheets: FrameSheet[] = [];
  /**
   * (THE MAGE'S STAFF, art/staff_skins.ts) A group that may be let go of whole (letGoGroup): its sheets, and every place a frame
   * of it was given into with what was there before, to put back.
   */
  private readonly whole = new Map<string, { sheets: FrameSheet[]; held: { list: Sprite[]; i: number; was: PropertyDescriptor; s: Sprite }[] }>();
  /**
   * For measuring: frames taken in, frames not wanted (painted already), how long each group took (ms), what failed, and the
   * sheets held and their pixels (what a hero always holds; his packs' sheets are counted in `packs`).
   */
  readonly stats = {
    given: 0,
    unwanted: 0,
    ms: {} as Record<string, number>,
    failed: [] as string[],
    sheets: 0,
    sheetPx: 0,
    // (how long the frames' handing in took, in all and at worst in one go, and the hero's art at worst: main's, 25.3.x)
    handMs: 0,
    handMax: 0,
    artMax: 0,
    /**
     * THE PACKS (PACKS): how many there are and how many bytes their files are; how many are open and their sheets' bytes
     * (four a pixel) now and at the most; how many times one was opened and let go; how many were asked for by the game's
     * drawing with no picture to show yet (`missed`: a stand-in was shown meanwhile) and how many ahead of need; how long
     * opening has taken in all and at worst (ms), nearly all of it the browser reading the sheet, beside the game; and `work`,
     * how much was on the game's own thread (giving the frames into their places, letting others go), in all and at worst
     * in one go (ms).
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

  /**
   * The same for a hero, whichever of his groups he is in (his own, or a unique weapon's: art/heroes.ts WRAP_SKINS, TOME_SKINS):
   * only the groups in hand have packs.
   */
  wantOf(cls: ClassId, pack: string, side: number, now = true): boolean {
    let had = false;
    for (const g of this.state.keys()) if (classOfGroup(g) === cls && this.want(g, pack, side, now)) had = true;
    return had;
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

  /**
   * Unpack one: its sheet read from its file's bytes (by the browser, beside the game) and held whole; its frames given into
   * their places, where those are still unpainted, as frames kept in that sheet (engine/px.ts sheetSprite: none is cut from
   * it until it is drawn).
   */
  private async unpack(p: Pack): Promise<void> {
    if (p.state !== 'packed') return;
    p.state = 'unpacking';
    this.busy++;
    const t0 = this.clock();
    const S = this.stats.packs;
    try {
      const bmp = await createImageBitmap(p.blob, { premultiplyAlpha: 'default', colorSpaceConversion: 'none' });
      // (its group let go of meanwhile: nothing of it is given)
      if (p.gone) {
        bmp.close();
        p.state = 'packed';
        return;
      }
      const g0 = this.clock();
      const sheet: FrameSheet = { img: bmp };
      const sprites: (Sprite | undefined)[] = new Array<Sprite | undefined>(p.def.frames.length);
      for (const [list, i, fi] of p.places) {
        const was = Object.getOwnPropertyDescriptor(list, i);
        // (a place painted already keeps its picture: nothing of it is the bake's to give back)
        if (!was || typeof was.get !== 'function') continue;
        let s = sprites[fi];
        if (!s) {
          const [x, y, w, h, part] = p.def.frames[fi];
          s = sprites[fi] = sheetSprite(p.parts[part], sheet, x, y, w, h);
        }
        Object.defineProperty(list, i, { value: s, writable: true, configurable: true, enumerable: true });
        p.held.push({ list, i, was, s });
      }
      for (const s of sprites) {
        if (s) this.stats.given++;
        else this.stats.unwanted++;
      }
      p.sheet = sheet;
      p.bytes = bmp.width * bmp.height * 4;
      p.state = 'held';
      p.used = Math.max(p.used, t0);
      S.held++;
      S.bytes += p.bytes;
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

  /**
   * Let a pack go: each place put back as it was (the frame's own painter); its sheet closed, its room given back at once; what
   * was cut from it for drawing given back a moment on (engine/px.ts retireSprite: whoever drew a frame of it this frame holds
   * it that long; a frame of it asked for after that shows nothing, and its list asks for the pack again).
   */
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
    const sheet = p.sheet;
    if (sheet && sheet.img) {
      const img = sheet.img;
      sheet.img = null;
      img.close?.();
    }
    p.sheet = null;
    p.held = [];
    p.state = 'packed';
    const S = this.stats.packs;
    S.held--;
    S.bytes -= p.bytes;
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
    // (each file fetched once: the group's packs in one file, each read from its own bytes, a part of it and not a copy)
    const files = new Map<string, Promise<Blob>>();
    const fileOf = (name: string): Promise<Blob> => {
      let b = files.get(name);
      if (!b) {
        b = this.get(name).then((r) => {
          if (!r.ok) throw new Error(`${name}: ${r.status}`);
          return r.blob();
        });
        files.set(name, b);
      }
      return b;
    };
    for (let n = 0; n < defs.length; n += AT) {
      const part = defs.slice(n, n + AT);
      const blobs = await Promise.all(part.map(async (d) => {
        const b = await fileOf(d.sheet);
        return d.len !== undefined ? b.slice(d.off ?? 0, (d.off ?? 0) + d.len, 'image/png') : b;
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
        const p: Pack = { def, parts: f.parts, blob: blobs[q], places, state: 'packed', sheet: null, bytes: 0, held: [], used: 0, failed: 0 };
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
    // (ANOTHER HERO IS PLAYED: a packed hero's packs in hand are let go; they are his own only while he is the one played. By the
    // class: the Warlock's demon and the man with a unique tome are two groups of his, both shown in a run: art/heroes.ts TOME_SKINS)
    if (g !== 'cards' && this.stats.packs.held) for (const [name, p] of this.packs) if (p.state === 'held' && classOfGroup(name.slice(0, name.indexOf('/'))) !== classOfGroup(g)) this.letGo(p);
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

  /**
   * (THE UNIQUE WEAPON IN HIS HAND) May this group be let go of whole: the Mage's, with her own staff or a unique one, while
   * STAFF_SKINS is on; the Ranger's, with his own bow or a unique one, while BOW_SKINS is on; the Tinkerer's, with her own
   * wrench or a unique one, while WRENCH_SKINS is on; the Warrior's, with his great sword, war axe or maul or a unique one, while
   * WARRIOR_SKINS is on.
   */
  private lettable(g: string): boolean {
    return (
      (STAFF_SKINS.on && (g === 'mage' || g.startsWith('mage-'))) ||
      (BOW_SKINS.on && (g === 'ranger' || g.startsWith('ranger-'))) ||
      (WRENCH_SKINS.on && (g === 'tinkerer' || g.startsWith('tinkerer-'))) ||
      (WARRIOR_SKINS.on && (g === 'warrior' || g.startsWith('warrior-'))) ||
      // (the Brawler's wraps and the Warlock's books: the man's groups, never his demon's, which every book of his shares)
      (WRAP_SKINS.on && (g === 'brawler' || g.startsWith('brawler-'))) ||
      (TOME_SKINS.on && g !== 'warlock-demon' && (g === 'warlock' || g.startsWith('warlock-')))
    );
  }

  /**
   * LET GO OF A GROUP WHOLE (THE MAGE'S STAFF, art/staff_skins.ts): she holds one staff at a time, and each staff's pictures are a
   * whole set of her (about 80 MB of sheets open, five sheets of 2048), so only the set of the staff she holds is kept: as she
   * takes up another, the last one's is let go of (its places put back as they were, its frames given back, its sheets closed),
   * and taken in again if she takes it up again. A group not in hand, or not one that may be let go of, is left as it is.
   */
  letGoGroup(g: string): boolean {
    const w = this.whole.get(g);
    if (!w) return false;
    const gone = new Set<Sprite>();
    for (const h of w.held) {
      const d = Object.getOwnPropertyDescriptor(h.list, h.i);
      if (d && 'value' in d && d.value === h.s) Object.defineProperty(h.list, h.i, h.was);
      gone.add(h.s);
    }
    for (const s of gone) {
      this.onLetGo?.(s);
      retireSprite(s);
    }
    for (const sheet of w.sheets) {
      const img = sheet.img;
      if (img) this.stats.sheetPx -= img.width * img.height;
      sheet.img = null;
      img?.close?.();
      const at = this.sheets.indexOf(sheet);
      if (at >= 0) this.sheets.splice(at, 1);
      this.stats.sheets--;
    }
    // (A HERO KEPT IN PACKS, the Brawler's and the Warlock's, PACKS: each pack of the group in hand let go of, and every one
    // forgotten, its file's bytes given back; fetched again with the group)
    const S = this.stats.packs;
    for (const [name, p] of [...this.packs]) {
      if (!name.startsWith(`${g}/`)) continue;
      if (p.state === 'held') this.letGo(p);
      p.gone = true;
      this.packs.delete(name);
      const at = this.queue.indexOf(p);
      if (at >= 0) this.queue.splice(at, 1);
      S.all--;
      S.packed -= p.blob.size;
    }
    for (const [list, p] of [...this.packOf]) if (p.gone) this.packOf.delete(list);
    this.whole.delete(g);
    this.state.delete(g);
    return true;
  }

  /**
   * (THE UNIQUE WEAPON IN HIS HAND) He is in this place now: every other group of his that may be let go of is (his own weapon's
   * while he holds a unique one, the last one's as he takes up another). His class card's group is not his alone and is kept.
   */
  holdOnly(cls: ClassId, place: HeroPlace, vet: boolean): void {
    if (cls !== 'mage' && cls !== 'ranger' && cls !== 'tinkerer' && cls !== 'warrior' && cls !== 'brawler' && cls !== 'warlock') return;
    const g = this.group(cls, place, vet);
    if (!g || !this.lettable(g)) return;
    for (const other of [...this.whole.keys()]) if (other !== g && (other === cls || other.startsWith(`${cls}-`))) this.letGoGroup(other);
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
      // (A GROUP THAT MAY BE LET GO OF WHOLE, letGoGroup: each hero's lists, to know what was in each place before it was given)
      const keep = this.lettable(g) ? { sheets: [] as FrameSheet[], held: [] as { list: Sprite[]; i: number; was: PropertyDescriptor; s: Sprite }[] } : null;
      const listsOf = new Map<BakeFile['keys'][number], Sprite[][][]>();
      for (const k of f.keys) {
        // (the hero's art for each place set up in a go of its own, a frame let in between (main.ts LOAD_SLICE): the Tinkerer's,
        // her held move's poses solved, took some 2.5 s here in one go; `artMax` the longest)
        if (HAND_MS > 0) await new Promise<void>((ok) => setTimeout(ok, 0));
        const a0 = performance.now();
        const a = art.of(k.cls, { ...lookOfPlace(k.place), vet: k.vet });
        this.stats.artMax = Math.max(this.stats.artMax, Math.round(performance.now() - a0));
        if (JSON.stringify(listLengths(heroSides(a))) !== JSON.stringify(k.lens)) throw new Error(`${keyName(k)}: its lists are not as baked`);
        if (f.packs?.length) lists.push(heroSides(a).map((side) => bakeLists(side)));
        if (keep) listsOf.set(k, heroSides(a).map((side) => bakeLists(side)));
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
            const list = keep ? listsOf.get(k)?.[v]?.[l] : undefined;
            const was = list ? Object.getOwnPropertyDescriptor(list, i) : undefined;
            if (this.give(k.cls, k.place, v, l, i, sprite, k.vet)) {
              took = true;
              if (keep && list && was) keep.held.push({ list, i, was, s: sprite });
            }
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
          keep?.sheets.push(sheet);
          this.stats.sheets++;
          this.stats.sheetPx += bmp.width * bmp.height;
        } else {
          // (none of its frames was wanted: nothing holds it)
          sheet.img = null;
          bmp.close();
        }
      }
      // (a hero kept in packs, PACKS: his packs fetched and kept packed; what came above is what he always holds)
      if (f.packs?.length) await this.takePacks(g, f, lists);
      if (keep) this.whole.set(g, keep);
      this.state.set(g, 'done');
      this.stats.ms[g] = Math.round(performance.now() - t0);
    } catch (e) {
      this.state.set(g, 'failed');
      this.stats.failed.push(`${g}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}

