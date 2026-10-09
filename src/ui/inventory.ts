// The inventory: the character's gear, attacks and numbers, on three pages over the bag and the
// pouch of words (Version 13.1); on half the screen, with the game seen in the other half
// (Version 14.2).
//
// The owner, 4 Oct 2026: "The inventory should have a few different pages, stats on one to show
// attributes and defenses. Your attacks and damage info on another, and gear on a third. Your gear
// should be arranged as they would be placed on the character, like Diablo or path of exile. Your
// inventory should be persistent at the bottom as you flip through the different pages".
//
// So the bottom of the screen never changes: the BAG, and YOUR WORDS. Over it, one of three pages:
//   GEAR     the hero, with a slot for each thing worn where it is worn, and beside them whatever
//            piece is being looked at (and, for a piece in the bag, the piece it would replace)
//   ATTACKS  the three attacks as phrases (the slots IN FRONT, the attack, the slots BEHIND), each
//            with its numbers; under them, what a word does there, or would do
//   STATS    the attributes and what a point of each gives, the defences, the attack's numbers
//
// What has not changed since Version 9. The owner: "the words in your inventory [should] be more
// intuitive. tap the word to read a description, drag and drop on a skill or gear. hover over to
// see maybe a possibility of what could happen. i dont want it to say exactly what would happen,
// but maybe show the range of outcomes on gear." A word is read by pressing it and put somewhere
// by dragging it there (or by pressing it and then the place). On an attack it is only lent:
// letting go sets it at once, and it can be dragged out again ("if skills are going to change with
// gear and weapons, the word should be removable"). On gear it is used up ("using a word to modify
// a stat on an item should still use up the word"): letting go asks once, and what the word
// becomes there is rolled.
//
// New with the pages: a piece of gear is put on by dragging it from the bag onto the hero and
// taken off by dragging it back to the bag (pressing it twice still does either), pieces can be
// moved about in the bag, and anything being carried, held over a page's name, turns to that page.
//
// HALF THE SCREEN (Version 14.2). The owner, 5 Oct 2026, on seeing the pages: "I like the new
// menus but there is a lot of empty space. Can we have it only cover half of the screen? Pause
// the game when the inventory is open to the right side of the screen and recenter the camera on
// the player in the left side of the screen. Then you can tap on the game side and the inventory
// automatically closes and you're back in the game." And: "the helmet being alone at the top
// above the sprite is kinda weird."
// So the inventory is a panel on the right half of the screen (the bottom half of a phone held
// upright: invRect), about 240 game pixels wide on every screen, and there is ONE layout for it:
//   - the names of the pages and DONE; the page; YOUR WORDS in a line or two; the BAG;
//   - GEAR: the hero between two columns of five slots (nothing over the head), and beside them
//     their numbers at a glance;
//   - ATTACKS: each attack a line of sockets round its plate; a word set in one shows as its
//     rune stone, and the attack's whole name is written under the three lines;
//   - what is READ (a word, what it would do in a slot, a piece of gear beside the piece it would
//     replace, the question before a word is burned in) has no room in so small a panel: it is
//     on a card that floats over the game's half, against the panel's edge.
// A press on the game's half closes the inventory. (main.ts keeps the game still and draws it
// with the hero in the middle of its half; the game's own buttons are not drawn meanwhile.)
//
// BESIDE THE TOWN'S SERVICES (Version 14.3). The owner, 5 Oct 2026: "Vendors, stash, and lexicon
// would take up the left side so you would have access to your inventory on the right side".
// So at a vendor, the stash, the Lexicon and the gate the other half of the screen is not the
// game but that service (a `Side`: ui/town.ts builds them), and this inventory is beside it, whole:
//   - a piece in the bag has the service's own button on its card (SELL, STASH) in place of DROP,
//     a second press on it does that, and so does carrying it over to the service's half;
//   - a piece of the service's own (for sale, in the stash) is read on the same card as a piece
//     in the bag, beside the piece it would replace, with the service's button (BUY, TAKE);
//   - a word in hand may go to a place on the service's half (a socket of the gate, the
//     Lexicon's shelf) exactly as it goes into a slot of an attack: pressed and then the place,
//     or dragged there.
// There is no game to go back to by pressing it: DONE closes both.

import { WORD_COLOR } from '../art/icons';
import { ELEMENT_RAMP, P, RARITY_COLOR } from '../art/palette';
import { drawText, textWidth, wrapText } from '../engine/font';
import { ATTR_NAME, CLASSES, ELEMENT_NAME, MOVE_OPENS, QUEST_ITEM, SKILLS, SLOT_OPENS, WORDS, socketCount, xpToNext } from '../game/defs';
import type { Game } from '../game/game';
import { modLines, statView } from '../game/items';
import type { ImbueOption } from '../game/items';
import type { SlotRef } from '../game/state';
import { armorReduction } from '../game/stats';
import { ATTRS, EQUIP_SLOTS, WORD_IDS } from '../game/types';
import type { ClassId, EquipSlot, IconKey, Item, Limit, WordId } from '../game/types';
import { Figure } from '../render/figure';
import type { Art } from '../render/render';
import { guideCoach } from './guide';
import { ATTR_COLOR, CELL, PITCH, drawItemPips, itemCard, measureCard, placeCard } from './panels';
import type { Line, Sel } from './panels';
import { THEME, inside } from './ui';
import type { Rect, Ui } from './ui';
import { arrow, drawName, drawNameLines, drawWordTile, nameLines, nameParts, namePartsWidth, tileWidth } from './words';

export type InvPage = 'gear' | 'attacks' | 'stats';
/** The pages, in the order of their names along the top. */
export const INV_PAGES: readonly InvPage[] = ['gear', 'attacks', 'stats'];
const PAGE_LABEL: Record<InvPage, string> = { gear: 'GEAR', attacks: 'ATTACKS', stats: 'STATS' };

/** Where a word is about to go: an exact socket of an attack, a piece of gear, or a place of the service in the other half. */
type Target = { kind: 'slot'; ref: SlotRef } | { kind: 'item'; sel: Sel } | { kind: 'side'; at: string };

export interface InvUi {
  /** The page that is open. */
  page: InvPage;
  /** The word in hand: pressed (it is being read) or being dragged. */
  word: WordId | null;
  /**
   * A press on a word that may turn into a drag. `was`: it was already in hand (or being read)
   * when pressed. `from`: the socket it sits in, until the drag lifts it out.
   */
  drag: { word: WordId; x0: number; y0: number; moving: boolean; was: boolean; from: SlotRef | null; lifted?: boolean } | null;
  /** A press on a piece of gear that may turn into a drag. `was`: it was already being looked at when pressed. */
  carry: { sel: Sel; x0: number; y0: number; moving: boolean; was: boolean } | null;
  /** The piece of gear being looked at. */
  sel: Sel | null;
  /**
   * COMPARE (the owner, 5 Oct 2026, 22:02: "add a third option to pieces of gear when you examine
   * them. Compare. And this should bring up your currently equipped piece"): the piece whose card
   * has a worn piece brought up beside it. `n`: which of the worn pieces (wornFor: there are two
   * only for a ring when a ring is on each hand; COMPARE pressed again brings up the other, and
   * once more puts it away). `at`: where the card was when COMPARE was pressed. The card grows
   * from there, away from its lower edge and from the side its piece is read on, so that the
   * piece and its buttons stay where they were: the button is still under the finger that
   * pressed it, and a second press puts the worn piece away again. It is that piece and no
   * other: read another, and its card is its own again until COMPARE is pressed on it.
   */
  compare: { item: Item; n: number; at: Rect } | null;
  /** The socket whose word is being looked at. */
  look: SlotRef | null;
  /** A word that has been dropped on a piece of gear and is waiting for a yes or a no. */
  pending: { word: WordId; sel: Sel } | null;
  note: string;
  noteT: number;
  /** The attack last touched: the one the ATTACKS page reads out. */
  focus: number;
  /** A word has just gone into this attack: its new name is shown large for a moment. */
  flash: { skill: number; t: number; word: WordId } | null;
  /** What a word has just become on a piece of gear. */
  result: { word: WordId; item: string; text: string; t: number } | null;
  /** Something is being carried over this page's name, and for how long: long enough, and the page turns. */
  tab: { page: InvPage; t: number } | null;
  /**
   * The card that floats over the game's half, as it was drawn last frame: where it is, and its
   * buttons by their labels. (A press arrives between frames, at what was on the screen: the
   * buttons are pressed where they were drawn.)
   */
  card: { r: Rect; buttons: { id: string; r: Rect }[] } | null;
}

/** A button on a card that the service in the other half puts there. */
export interface SideButton {
  label: string;
  /** Do it. What comes back is said as a note ("Not enough gold"), if anything does. */
  act: () => string | null | void;
  lit?: boolean;
  primary?: boolean;
  disabled?: boolean;
}

/** What the inventory tells a service while it draws its half. */
export interface SideOver {
  /** A piece out of the bag is being carried over its half. */
  piece: Item | null;
  /** The word in hand, if there is one (its places should show that it may go there). */
  hand: WordId | null;
  /** The place of its own that word hangs over, if it does. */
  at: string | null;
  /** That word is being carried (dragged), not only held in hand. */
  dragging: boolean;
  /** The beat everything that asks to be pressed keeps (0 to 1), and its on-and-off. */
  pulse: number;
  blink: boolean;
}

/**
 * One of the town's services, standing in the other half of the screen while the inventory is
 * open (Version 14.3). It is made afresh every frame by whoever knows the service (ui/town.ts),
 * and the inventory calls into it at the right moments of its own frame.
 */
export interface Side {
  /** Its own presses, on its own half. Called every frame, after the inventory's own. */
  press(say: (why: string | null | void) => void): void;
  /** Its half, drawn where the game would have been seen. */
  draw(over: SideOver): void;
  /** Whatever of its own floats over everything (a piece being carried out of it). */
  drawOver?(): void;
  /** It has the one thing to press on this screen (ENTER DUNGEON): DONE is then an ordinary button. */
  primary?: boolean;
  /**
   * A piece of its own that is being looked at (picked, or under the mouse): it is read on the
   * inventory's card, under `anchor`, with these lines after its own and these buttons.
   */
  look?(): { item: Item; anchor: Rect; lines: Line[]; buttons: SideButton[] } | null;
  /** What the card of a piece in the bag offers here, in place of DROP. */
  bagButton?(i: number, it: Item): SideButton | null;
  /** What a second press on a piece in the bag does here (and the right button), in place of wearing it. */
  bagQuick?(i: number): string | null | void;
  /** A piece carried out of the bag has been let go over its half. */
  pieceDrop?(i: number): string | null | void;
  /** The place on its half a word would go to from this point of the screen (a name of its own), if any. */
  wordAt?(x: number, y: number): string | null;
  /** Where that place is. */
  wordRect?(at: string): Rect | null;
  /** Why the word cannot go there, or null if it can. */
  wordProblem?(w: WordId, at: string): string | null;
  /** The word has been let go there. */
  wordDrop?(w: WordId, at: string): string | null | void;
  /** What is read while the word hangs over that place. */
  wordRead?(w: WordId, at: string): Line[];
  /** One more line under a word in hand that is being read: what it could do here. */
  wordHint?(w: WordId): string | null;
  /** What the card of a spare word that is being read offers here (TO THE GATE, KEEP). */
  wordButtons?(w: WordId): SideButton[];
}

/** The button on a piece's card that brings up the piece worn in its place (InvUi.compare). */
export const COMPARE = 'COMPARE';
/** How wide the card of a piece by itself is. */
const ONE = 150;

/**
 * What the hero wears where `it` would go: the pieces COMPARE can bring up. One piece, or none;
 * for a ring, every ring that is on (the one it would take the place of first), because a ring
 * goes to the empty hand while there is one, and "nothing to compare it with" would be untrue.
 */
export function wornFor(game: Game, it: Item): Item[] {
  const worn = game.hero.gear;
  const to = game.slotFor(it);
  const slots: (EquipSlot | null)[] = it.slot === 'ring' ? (to === 'ring2' ? ['ring2', 'ring1'] : ['ring1', 'ring2']) : [to];
  const out: Item[] = [];
  for (const s of slots) {
    const w = s ? worn[s] : null;
    if (w) out.push(w);
  }
  return out;
}

export function newInvUi(): InvUi {
  return { page: 'gear', word: null, drag: null, carry: null, sel: null, compare: null, look: null, pending: null, note: '', noteT: 0, focus: 0, flash: null, result: null, tab: null, card: null };
}

/**
 * Put the screen back as it is when it opens: nothing in hand, nothing waiting. Where it opens is
 * as the owner was told: "INVENTORY opens on GEAR; pressing an attack on the game screen opens on
 * ATTACKS". So: opened from an attack (`focus`), or with a word in hand (one just found), it is
 * the ATTACKS page; opened any other way, GEAR.
 */
export function resetInvUi(st: InvUi, word: WordId | null = null, focus = -1): void {
  st.word = word;
  st.drag = null;
  st.carry = null;
  st.sel = null;
  st.compare = null;
  st.look = null;
  st.pending = null;
  st.noteT = 0;
  st.flash = null;
  st.result = null;
  st.tab = null;
  st.card = null;
  if (focus >= 0) st.focus = focus;
  st.page = focus >= 0 || word ? 'attacks' : 'gear';
}

/** "+8-12% Physical Damage": one thing a word may become on a piece of gear, with the range it rolls in. */
export function rangeText(o: ImbueOption, limit: Limit): string {
  const info = statView(o.stat, limit);
  const num = (n: number): string => (n * info.mult).toFixed(info.dp);
  const span = o.min === o.max ? num(o.min) : `${num(o.min)} to ${num(o.max)}`;
  return `${info.less ? '-' : '+'}${span}${info.pct ? '%' : ''} ${info.label}`;
}

// ---------------------------------------------------------------------------------------------
// Where the inventory is

/** The least room the panel is laid out for: a phone held sideways is 234 game pixels tall, and half of it 253 wide. */
export const INV_MIN_W = 236;
export const INV_MIN_H = 234;
/** The widest it gets: on a very wide screen the game keeps more than half. */
export const INV_MAX_W = 300;
/** The tallest it gets where it lies along the bottom: what it needs with two lines of words, and no more (the game keeps the rest). */
export const INV_MAX_H = 272;
/** The height the page between the tabs and the words likes to have: the words get a second line only where that is left. */
const PAGE_ROOM = 118;

/**
 * The part of the screen the inventory takes: the right half; or, on a screen taller than it is
 * wide (a phone held upright), the bottom of it: half, or as much of half as it has a use for.
 * Never less than it is laid out for, where the screen has that much.
 */
export function invRect(W: number, H: number): Rect {
  if (H > W) {
    const h = Math.min(H, Math.max(INV_MIN_H, Math.min(INV_MAX_H, Math.floor(H / 2))));
    return { x: 0, y: H - h, w: W, h };
  }
  const w = Math.min(W, Math.max(INV_MIN_W, Math.min(INV_MAX_W, Math.floor(W / 2))));
  return { x: W - w, y: 0, w, h: H };
}

/** The other part: where the game is seen while the inventory is open. */
export function gameRect(W: number, H: number): Rect {
  const r = invRect(W, H);
  return r.y > 0 ? { x: 0, y: 0, w: W, h: r.y } : { x: 0, y: 0, w: r.x, h: H };
}

// ---------------------------------------------------------------------------------------------
// The hero and the slots beside them (the GEAR page)

/** How wide the hero with their slots is: a column of slots, the hero, a column of slots. */
export const DOLL_W = 116;
export const DOLL_ROWS = 5;
/**
 * Which column each thing worn has its slot in (0 on screen-left of the hero, 1 on the right),
 * and which row. The owner: "Your gear should be arranged as they would be placed on the
 * character", and (5 Oct) "the helmet being alone at the top above the sprite is kinda weird":
 * so nothing stands over the head or under the feet. Down both columns in the order of the
 * body, a pair to a row: head and neck; chest and waist; the two hands' weapons, at the height
 * of the hands; hands and feet; the two rings.
 */
export const DOLL_SLOT: Record<EquipSlot, readonly [number, number]> = {
  helm: [0, 0],
  amulet: [1, 0],
  chest: [0, 1],
  belt: [1, 1],
  mainhand: [0, 2],
  offhand: [1, 2],
  gloves: [0, 3],
  boots: [1, 3],
  ring1: [0, 4],
  ring2: [1, 4],
};
/** Where a slot's cell is, in pixels from the top left corner of the block, with the rows `pitch` apart. */
export function dollAt(slot: EquipSlot, pitch: number): [number, number] {
  const [col, row] = DOLL_SLOT[slot];
  return [col * (DOLL_W - CELL), row * pitch];
}
/** How tall the block is, with the rows `pitch` apart. */
export function dollHeight(pitch: number): number {
  return (DOLL_ROWS - 1) * pitch + CELL;
}
/** What an empty slot shows, faintly: the kind of thing that goes there. */
const GHOST: Record<EquipSlot, IconKey> = { mainhand: 'sword', offhand: 'shield', helm: 'helm', chest: 'armor', gloves: 'gloves', belt: 'belt', boots: 'boots', amulet: 'amulet', ring1: 'ring', ring2: 'ring' };

/** The figure on the GEAR page: it stands in its loop and now and then does what its class does when left standing, as on the class cards. */
let dollFigure: Figure | null = null;
let dollClass: ClassId | null = null;
let dollSeen = -10;

// ---------------------------------------------------------------------------------------------

interface SlotCell {
  r: Rect;
  ref: SlotRef;
  word: WordId | null;
}

interface GearCell {
  r: Rect;
  sel: Sel;
  item: Item | null;
}

const sameSlot = (a: SlotRef, b: SlotRef): boolean => a.skill === b.skill && a.side === b.side && a.idx === b.idx;
const sameSel = (a: Sel | null, b: Sel): boolean => !!a && a.kind === b.kind && (a.kind === 'bag' ? a.i === (b as { i: number }).i : a.slot === (b as { slot: EquipSlot }).slot);

/**
 * The spare words as tiles, in lines `maxW` wide. If they do not go into `room` lines with their
 * rune stones they are laid out without (`bare`); if they do not go in even so, as their rune
 * stones alone (`stones`: a tile the size of a bag's cell, the word read when it is pressed); and
 * failing that, as narrower stones a pixel apart (`narrow`, since Version 19.3: thirteen words in
 * one line of a phone's half). Whatever still does not fit is left out, and `hidden` says how many.
 */
export function layPouch(words: readonly WordId[], count: (w: WordId) => number, maxW: number, room: number, gap: number): { cells: { word: WordId; x: number; line: number; w: number }[]; lines: number; bare: boolean; stones: boolean; narrow: boolean; hidden: number } {
  const lay = (how: 'full' | 'bare' | 'stones' | 'narrow'): { cells: { word: WordId; x: number; line: number; w: number }[]; lines: number } => {
    const cells: { word: WordId; x: number; line: number; w: number }[] = [];
    let x = 0;
    let line = 0;
    for (const w of words) {
      const tw = how === 'stones' ? CELL : how === 'narrow' ? NARROW_STONE : Math.min(maxW, tileWidth(w, 'name', count(w), how === 'bare'));
      if (x > 0 && x + tw > maxW) {
        x = 0;
        line++;
      }
      cells.push({ word: w, x, line, w: tw });
      x += tw + (how === 'narrow' ? 1 : gap);
    }
    return { cells, lines: cells.length ? cells[cells.length - 1].line + 1 : 1 };
  };
  let out = lay('full');
  let bare = false;
  let stones = false;
  let narrow = false;
  if (out.lines > room) {
    out = lay('bare');
    bare = true;
  }
  if (out.lines > room) {
    out = lay('stones');
    stones = true;
  }
  if (out.lines > room) {
    out = lay('narrow');
    narrow = true;
  }
  const shown = out.cells.filter((c) => c.line < room);
  return { cells: shown, lines: Math.min(out.lines, room), bare, stones, narrow, hidden: out.cells.length - shown.length };
}

/**
 * A rune stone in a pouch with more words than its stones have room for (Version 19.3's thirteen,
 * on a phone held sideways): the stone itself (14 pixels) in a tile only just wider, a pixel apart.
 */
export const NARROW_STONE = 16;

/** How an attack is limited, said short ("1.74/S", "5.0 S", "14 MANA") and long. */
function paceText(game: Game, s: number): { short: string; long: string } {
  const sk = game.hero.skills[s];
  const r = sk.r;
  if (game.meta.limit === 'mana' && r.mana > 0) return { short: `${Math.round(r.mana)} MANA`, long: `costs ${Math.round(r.mana)} mana` };
  if (SKILLS[sk.id].cooldown > 0 && r.cooldown > 0) {
    const more = sk.maxCharges > 1 ? `, ${sk.maxCharges} charges` : '';
    return { short: `${r.cooldown.toFixed(1)} S`, long: `once every ${r.cooldown.toFixed(1)} seconds${more}` };
  }
  if (r.rate > 0) return { short: `${r.rate.toFixed(2)}/S`, long: `${r.rate.toFixed(2)} a second` };
  return { short: '', long: '' };
}

/**
 * The inventory. Returns true when it should close. `t` is the clock (for things that pulse),
 * `dt` the frame time. `side`: the town's service it has been opened at, which has the other
 * half of the screen (none: the game is seen there, and a press on it closes the inventory).
 */
export function drawInventory(ui: Ui, game: Game, art: Art, st: InvUi, t: number, dt: number, side: Side | null = null): boolean {
  const g = ui.g;
  const h = game.hero;
  const W = ui.w;
  const H = ui.h;
  const T = ui.touch;
  if (st.noteT > 0) st.noteT -= dt;
  if (st.flash) {
    st.flash.t += dt;
    if (st.flash.t > 1.3) st.flash = null;
  }
  if (st.result) st.result.t += dt;
  const coach = guideCoach(game, T);
  /** A new player's first word is waiting: the page is the attacks', and everything but the word and the attacks stands back. */
  const first = !!coach && !coach.done;
  if (first) st.page = 'attacks';
  const page = st.page;
  /** The page to turn to once this frame is drawn (everything below is laid out for `page`). */
  let nextPage: InvPage = page;
  const say = (why: string | null | void): void => {
    if (why) {
      st.note = why;
      st.noteT = 2.4;
    }
  };

  // ---- the frame: the names of the pages, the page, and the bottom that never changes ------------
  // The inventory takes half the screen (invRect) and the game is seen, standing still, in the
  // other half. The panel is between 236 and 300 game pixels wide on every screen: one layout.
  const R = invRect(W, H);
  /** The panel is the bottom half (a phone held upright): the game's half is over it, not beside it. */
  const below = R.y > 0;
  /** The half of the screen the game is seen in. */
  const gameR = gameRect(W, H);
  const M = 6;
  const X0 = R.x + M;
  const bodyW = R.w - 2 * M;
  const top = R.y + 2;
  const headH = T ? 22 : 16;
  const TH = 20; // a word's tile, in the pouch and in a slot
  const GAP = 3;
  const LINE = TH + 2;
  const CAP = 7; // a small caption and the air under it
  const bagCols = 8;
  const bagRows = Math.ceil(h.bag.length / bagCols);
  const bagW = bagCols * PITCH - 2;
  const bagH = bagRows * PITCH - 2;
  // (nothing may move while a word is being carried across the screen: a word lifted out of an
  // attack takes no place among the spare words until it is let go)
  const lifted = st.drag && st.drag.lifted && st.drag.moving ? st.drag.word : null;
  const pouchWords = WORD_IDS.filter((w) => h.words[w] > (w === lifted ? 1 : 0));
  // The spare words lie in lines over the bag: one line, and more where the panel is tall enough
  // to leave the page the room it likes (PAGE_ROOM).
  const fixedH = 2 + headH + 2 + 3 + CAP + 3 + CAP + bagH + 2;
  const pouchRoom = Math.max(1, Math.min(3, Math.floor((R.h - fixedH - PAGE_ROOM + 2) / LINE)));
  const pouchX = X0;
  const pouchW = bodyW;
  const lay = layPouch(pouchWords, (w) => h.words[w], pouchW, pouchRoom, GAP);
  const pouchH = pouchRoom * LINE - 2;
  const stripH = CAP + pouchH + 3 + CAP + bagH + 2;
  const stripY = R.y + R.h - stripH;
  const pouchY = stripY + CAP;
  const bagX = X0;
  const bagY = pouchY + pouchH + 3 + CAP;
  const pouch = lay.cells.map((c) => ({ r: { x: pouchX + c.x, y: pouchY + c.line * LINE, w: c.w, h: TH }, w: c.word }));
  const pageY = top + headH + 2;
  const pageH = stripY - 3 - pageY;
  // the names of the pages, and DONE
  const tabH = headH - 3;
  const dbw = T ? 50 : 44;
  const tabs: { r: Rect; page: InvPage }[] = [];
  {
    // (as much air round each name as the panel leaves once DONE has its room)
    const names = INV_PAGES.reduce((a, pg) => a + textWidth(PAGE_LABEL[pg]), 0);
    const pad = Math.max(6, Math.min(T ? 14 : 10, Math.floor((bodyW - dbw - 6 - names - 2 * (INV_PAGES.length - 1)) / INV_PAGES.length)));
    let x = X0;
    for (const pg of INV_PAGES) {
      const w = textWidth(PAGE_LABEL[pg]) + pad;
      tabs.push({ r: { x, y: top + 1, w, h: tabH }, page: pg });
      x += w + 2;
    }
  }
  const doneR: Rect = { x: R.x + R.w - M - dbw, y: top + 1, w: dbw, h: tabH };

  // ---- the ATTACKS page: each attack a line, laid out as it reads --------------------------------
  // The slots in front, the attack, the slots behind, and what a hit of it does. A slot is a
  // socket the size of a bag's cell: a word set in it shows as its rune stone (the attack's whole
  // name is written out under the three lines, and large across the screen when a word has just
  // gone in). Slots not opened yet are dim, with the level that opens them. (Laid out from how
  // many slots there are: there may one day be three a side.)
  const ROWS = 3;
  // (THE FIRST LEVELS: none before the ring is lit, and none on an ability not open yet: game.slots, game.moveOpen)
  const [nf, nb] = game.slots();
  const [maxF, maxB] = socketCount(999);
  // the attack's own plate: as wide as the longest of the three names needs (WHIRLWIND is wider than the 66 the others fit in)
  const AW = Math.max(66, 22 + Math.max(...h.skills.slice(0, 3).map((k) => textWidth(SKILLS[k.id].name.toUpperCase()))) + 4);
  const SQ = CELL + 2; // a socket and the air beside it
  const NUMW = 40;
  const slots: SlotCell[] = [];
  const locked: { r: Rect; lv: number }[] = [];
  const abil: Rect[] = [];
  const caps: { text: string; x: number; y: number; right: boolean }[] = [];
  /** Where each attack's numbers are written (none when there is no room for them on its line). */
  const nums: { x: number; y: number }[] = [];
  const rowY: number[] = [];
  let rowsEnd = pageY;
  if (page === 'attacks') {
    const group = (s: number, sd: 'front' | 'behind', gx: number, gy: number): void => {
      const sk = h.skills[s];
      const open = game.moveOpen(s);
      const n = !open ? 0 : sd === 'front' ? nf : nb;
      const max = sd === 'front' ? maxF : maxB;
      const words = sd === 'front' ? sk.front : sk.behind;
      // (they stand in the order the name is read in: in front the first word furthest from the
      // attack; and the slots not opened yet stand beyond the open ones, the next to open nearest)
      for (let j = 0; j < max; j++) {
        const r: Rect = { x: gx + j * SQ, y: gy, w: CELL, h: CELL };
        const idx = sd === 'front' ? j - (max - n) : j;
        if (idx >= 0 && idx < n) slots.push({ r, ref: { skill: s, side: sd, idx }, word: words[idx] ?? null });
        else {
          // (the level that opens it; on an ability not open yet, no sooner than the ability; before the ring is lit, 0: at the wordsmith's)
          const lv = Math.max(SLOT_OPENS[sd][sd === 'front' ? max - 1 - j : j], open ? 1 : MOVE_OPENS[s]);
          locked.push({ r, lv: !h.ring ? 0 : lv });
        }
      }
    };
    const frontW = maxF * SQ;
    const behindW = maxB * SQ;
    const rowW = frontW + AW + GAP + behindW - 2;
    const withNums = rowW + 6 + NUMW <= bodyW;
    const x0 = X0 + Math.max(0, Math.floor((bodyW - rowW - (withNums ? 6 + NUMW : 0)) / 2));
    const rowH = TH + 3;
    for (let s = 0; s < ROWS; s++) {
      const y = pageY + CAP + s * rowH;
      rowY.push(y);
      group(s, 'front', x0, y);
      abil.push({ x: x0 + frontW, y, w: AW, h: TH });
      group(s, 'behind', x0 + frontW + AW + GAP, y);
      if (withNums) nums.push({ x: x0 + rowW + 6, y });
    }
    caps.push({ text: 'IN FRONT', x: x0 + frontW - 2, y: pageY, right: true });
    caps.push({ text: 'BEHIND', x: x0 + frontW + AW + GAP, y: pageY, right: false });
    if (withNums) caps.push({ text: 'A HIT', x: x0 + rowW + 6, y: pageY, right: false });
    rowsEnd = pageY + CAP + (ROWS - 1) * rowH + TH;
  }

  // ---- the GEAR page: the hero between two columns of slots; and, on every page, the bag ----------
  const dollPitch = Math.max(CELL, Math.min(PITCH, Math.floor((pageH - CELL) / (DOLL_ROWS - 1))));
  const dollH = dollHeight(dollPitch);
  const dollX = X0;
  const dollY = pageY + Math.max(0, Math.floor((pageH - dollH) / 2));
  const gear: GearCell[] = [];
  if (page === 'gear') {
    for (const slot of EQUIP_SLOTS) {
      const [dx, dy] = dollAt(slot, dollPitch);
      gear.push({ r: { x: dollX + dx, y: dollY + dy, w: CELL, h: CELL }, sel: { kind: 'gear', slot }, item: h.gear[slot] });
    }
  }
  h.bag.forEach((it, i) => {
    gear.push({ r: { x: bagX + (i % bagCols) * PITCH, y: bagY + Math.floor(i / bagCols) * PITCH, w: CELL, h: CELL }, sel: { kind: 'bag', i }, item: it });
  });
  const dollR: Rect = { x: dollX - 3, y: dollY - 2, w: DOLL_W + 6, h: dollH + 4 };
  const bagR: Rect = { x: bagX - 3, y: bagY - 3, w: bagW + 6, h: bagH + 6 };
  /** Beside the hero: their numbers at a glance. */
  const glanceR: Rect = { x: dollX + DOLL_W + 8, y: pageY + 1, w: X0 + bodyW - (dollX + DOLL_W + 8), h: pageH - 1 };

  // ---- where things are read -----------------------------------------------------------------------
  // The panel has no room to read in. The attack last touched is read out in a few lines under
  // the three attacks (`mini`); everything else that is read is on a card that floats over the
  // game's half, against the panel's edge (drawn at the end: see "what is being read").
  const mini: Rect | null = page === 'attacks' ? { x: X0, y: rowsEnd + 4, w: bodyW, h: pageY + pageH - rowsEnd - 4 } : null;
  const pbh = T ? 20 : 15;

  for (const c of slots) ui.mark(`socket:${c.ref.skill}:${c.ref.side}:${c.ref.idx}`, c.r.x, c.r.y, c.r.w, c.r.h);
  for (const c of pouch) ui.mark(`word:${c.w}`, c.r.x, c.r.y, c.r.w, c.r.h);
  for (const c of gear) ui.mark(c.sel.kind === 'bag' ? `bag:${c.sel.i}` : `gear:${c.sel.slot}`, c.r.x, c.r.y, c.r.w, c.r.h);
  for (const tb of tabs) ui.mark(`tab:${tb.page}`, tb.r.x, tb.r.y, tb.r.w, tb.r.h);
  ui.mark(`page:${page}`, X0, pageY, bodyW, pageH);

  // ---- what may go where ------------------------------------------------------------------------
  const itemOf = (sel: Sel): Item | null => (sel.kind === 'gear' ? h.gear[sel.slot] : h.bag[sel.i] ?? null);
  /** Why the word cannot go there, or null if it can. */
  const problem = (word: WordId, to: Target): string | null => {
    if (to.kind === 'slot') return game.placeProblem(to.ref, word);
    if (to.kind === 'side') return side && side.wordProblem ? side.wordProblem(word, to.at) : 'Nothing there';
    if (!itemOf(to.sel)) return 'Nothing there';
    if (first) return 'Your first word goes on an attack';
    if (h.words[word] <= 0) return 'No spare word';
    // (a piece that is full, or that has what this word gives already)
    return game.imbueProblem(to.sel.kind === 'gear' ? { kind: 'gear', slot: to.sel.slot } : { kind: 'bag', i: to.sel.i }, word);
  };
  /** The word has been let go over a place. On an attack it is set at once (it can be taken out again); gear asks first. */
  const drop = (word: WordId, to: Target): void => {
    const why = problem(word, to);
    if (why) {
      say(why);
      return;
    }
    st.result = null;
    st.sel = null;
    st.look = null;
    if (to.kind === 'side') {
      // a place of the service in the other half: what happens there is its own affair
      const bad = side && side.wordDrop ? side.wordDrop(word, to.at) : 'Nothing there';
      if (bad) say(bad);
      else st.word = null;
      return;
    }
    if (to.kind === 'slot') {
      const bad = game.placeWord(to.ref, word);
      if (bad) say(bad);
      else {
        st.word = null;
        st.focus = to.ref.skill;
        st.flash = { skill: to.ref.skill, t: 0, word };
      }
      return;
    }
    st.pending = { word, sel: to.sel };
    // (the question is asked where things are read, and STATS has no such place)
    if (page === 'stats') nextPage = 'gear';
  };
  /** Yes: the word is burned into the piece of gear. */
  const commit = (): void => {
    const p = st.pending;
    if (!p) return;
    st.pending = null;
    st.word = null;
    const it = itemOf(p.sel);
    const why = game.imbue(p.sel.kind === 'gear' ? { kind: 'gear', slot: p.sel.slot } : { kind: 'bag', i: p.sel.i }, p.word);
    if (why) say(why);
    else if (it && it.imbues.length) st.result = { word: p.word, item: it.name, text: modLines(it.imbues[it.imbues.length - 1].mods, game.meta.limit).join(', '), t: 0 };
  };
  /** Put a piece on, or take it off. */
  const wear = (sel: Sel): void => {
    if (sel.kind === 'bag') say(game.equipFromBag(sel.i));
    else say(game.unequip(sel.slot));
    st.sel = null;
  };
  /**
   * What a second press on a piece does, and the right button: it is worn or taken off; but at
   * a service that has a use of its own for a piece in the bag (a vendor buys it, the stash
   * takes it), that.
   */
  const second = (sel: Sel): void => {
    if (sel.kind === 'bag' && side && side.bagQuick) {
      say(side.bagQuick(sel.i));
      st.sel = null;
    } else wear(sel);
  };

  // ---- the piece of gear being looked at ----------------------------------------------------------
  if (st.sel && !itemOf(st.sel)) st.sel = null;
  const selCell = page === 'gear' && st.sel && !st.word && !st.pending ? gear.find((c) => sameSel(st.sel, c.sel) && c.item) : undefined;
  const selButtons: { label: string; act: () => void; lit?: boolean }[] = [];
  if (selCell && selCell.item) {
    const sel = selCell.sel;
    if (sel.kind === 'bag') {
      // (at a service with a use for it, that comes first and is the lit one, and DROP gives it its place)
      const here = side && side.bagButton ? side.bagButton(sel.i, selCell.item) : null;
      if (here) selButtons.push({ label: here.label, act: () => { say(here.act()); st.sel = null; }, lit: true });
      selButtons.push({ label: 'EQUIP', act: () => wear(sel), lit: !here && game.useProblem(selCell.item) === null });
      if (!here) selButtons.push({ label: 'DROP', act: () => { game.dropFromBag(sel.i); st.sel = null; } });
    } else selButtons.push({ label: 'TAKE OFF', act: () => wear(sel) });
  }
  const sbh = T ? 18 : 13;
  /** The card as it was drawn last frame: a press on one of its buttons, by the button's label. */
  const cardWas = st.card;
  const cardPress = (id: string): boolean => !!cardWas && cardWas.buttons.some((b) => b.id === id && ui.pressIn(b.r.x, b.r.y, b.r.w, b.r.h));
  // with a mouse, the piece under the pointer is read in a card beside it (the one already being read beside the hero needs none)
  const carrying = !!st.carry && st.carry.moving;
  const tip = !T && !st.word && !st.pending && !carrying ? gear.find((c) => c.item && c !== selCell && ui.hover(c.r.x, c.r.y, c.r.w, c.r.h)) : undefined;
  const tipCard = tip && tip.item ? measureCard(itemCard(game, tip.item, false), 0, 0) : null;
  const tipR = tip && tipCard ? placeCard(ui, tip.r, tipCard.h) : null;

  // ---- presses, top-most first ------------------------------------------------------------------
  let close = false;
  for (const b of selButtons) if (cardPress(b.label)) b.act();
  // (a piece of the service's own, read on the same card: its buttons are the service's)
  const lookWas = side && side.look ? side.look() : null;
  if (lookWas) for (const b of lookWas.buttons) if (!b.disabled && cardPress(b.label)) say(b.act());
  // COMPARE, on the card of a piece that is not worn (one in the bag, or one of the service's):
  // the piece worn where it would go is brought up beside it; pressed again, it is put away
  if (cardWas && cardPress(COMPARE)) {
    const read = selCell && selCell.item && selCell.sel.kind === 'bag' ? selCell.item : !selCell && lookWas ? lookWas.item : null;
    const against = read ? wornFor(game, read) : [];
    const on = st.compare && st.compare.item === read ? st.compare : null;
    if (!read) st.compare = null;
    else if (!against.length) say('Nothing equipped there');
    else if (!on) st.compare = { item: read, n: 0, at: { ...cardWas.r } };
    else st.compare = on.n + 1 < against.length ? { ...on, n: on.n + 1 } : null;
  }
  // (and what the service offers for the word in hand)
  if (side && side.wordButtons && st.word && !st.pending) {
    for (const b of side.wordButtons(st.word)) if (!b.disabled && cardPress(b.label)) say(b.act());
  }
  if (st.pending) {
    if (cardPress('BURN IT')) commit();
    else if (cardPress('CANCEL')) st.pending = null;
  }
  if (ui.pressIn(doneR.x, doneR.y, doneR.w, doneR.h)) close = true;
  for (const tb of tabs) {
    if (!ui.pressIn(tb.r.x, tb.r.y, tb.r.w, tb.r.h)) continue;
    if (first && tb.page !== 'attacks') {
      say('Your first word goes on an attack');
      continue;
    }
    if (tb.page === page) continue;
    // (a word in hand is carried to the new page; whatever was being read is put down)
    nextPage = tb.page;
    st.sel = null;
    st.look = null;
    st.pending = null;
    st.result = null;
  }
  for (const c of pouch) {
    if (!ui.pressIn(c.r.x, c.r.y, c.r.w, c.r.h)) continue;
    // a word is pressed: it is in hand (to be read), and may be dragged from here
    const was = st.word === c.w && !st.pending;
    st.word = c.w;
    st.pending = null;
    st.sel = null;
    st.look = null;
    st.result = null;
    st.drag = { word: c.w, x0: ui.press ? ui.press.x : c.r.x, y0: ui.press ? ui.press.y : c.r.y, moving: false, was, from: null };
    // (STATS has nowhere to read a word and nowhere to put one)
    if (page === 'stats') nextPage = 'attacks';
  }
  for (const c of slots) {
    const quick = ui.pressIn(c.r.x, c.r.y, c.r.w, c.r.h, 2);
    if (!quick && !ui.pressIn(c.r.x, c.r.y, c.r.w, c.r.h)) continue;
    st.focus = c.ref.skill;
    if (st.word && !quick) {
      // a word is in hand: this is where it goes
      drop(st.word, { kind: 'slot', ref: c.ref });
    } else if (c.word) {
      // a word that is set: pressing it reads it, dragging it lifts it out, and the right button
      // (or a second press) takes it straight back to the pouch
      const again = !!st.look && sameSlot(st.look, c.ref);
      st.sel = null;
      st.pending = null;
      st.result = null;
      st.word = null;
      if (quick) {
        say(game.unsocket(c.ref.skill, c.ref.side, c.ref.idx));
        st.look = null;
        c.word = null;
      } else {
        st.look = c.ref;
        st.drag = { word: c.word, x0: ui.press ? ui.press.x : c.r.x, y0: ui.press ? ui.press.y : c.r.y, moving: false, was: again, from: c.ref };
      }
    } else {
      st.look = null;
      say(pouchWords.length ? (T ? 'Tap a word first, or drag it here' : 'Pick a word first, or drag it here') : 'No spare words');
    }
  }
  for (let s = 0; s < abil.length; s++) {
    if (!ui.pressIn(abil[s].x, abil[s].y, abil[s].w, abil[s].h)) continue;
    // an attack is pressed: it is the one read out (a word in hand stays in hand)
    st.focus = s;
    st.look = null;
    st.result = null;
  }
  for (const c of gear) {
    const quick = ui.pressIn(c.r.x, c.r.y, c.r.w, c.r.h, 2);
    const press = !quick && ui.pressIn(c.r.x, c.r.y, c.r.w, c.r.h);
    if (!quick && !press) continue;
    if (st.word && press) {
      // a word is in hand: it is burned into this piece
      if (c.item) drop(st.word, { kind: 'item', sel: c.sel });
      continue;
    }
    st.look = null;
    st.pending = null;
    st.result = null;
    if (!c.item || first) {
      st.sel = null;
      continue;
    }
    if (quick) {
      // the right button: wear it, or take it off (at a service: what a piece is brought there for)
      second(c.sel);
      continue;
    }
    // a piece is pressed: it is looked at (beside the hero, on the GEAR page), and may be dragged
    // from here. A second press on it, let go where it is, wears it or takes it off.
    const was = page === 'gear' && sameSel(st.sel, c.sel);
    st.sel = c.sel;
    st.carry = { sel: c.sel, x0: ui.press ? ui.press.x : c.r.x, y0: ui.press ? ui.press.y : c.r.y, moving: false, was };
    if (page !== 'gear') nextPage = 'gear';
  }
  // (a press on the card that floats over the game is a press on the inventory)
  if (cardWas && ui.press && !ui.used && inside(cardWas.r, ui.press.x, ui.press.y)) ui.used = true;
  // the service in the other half: its own presses, under the card and after everything of the inventory's
  if (side) side.press(say);
  // The owner, 5 Oct 2026: "you can tap on the game side and the inventory automatically closes
  // and you're back in the game". (The whole screen is the interface's while this is open, so the
  // press that closes it is never also an attack or a step.) Not at a service: there is no game
  // in the other half to go back to.
  if (!side && ui.press && !ui.used && ui.press.button === 0 && inside(gameR, ui.press.x, ui.press.y) && !(tipR && inside(tipR, ui.press.x, ui.press.y))) {
    close = true;
    ui.used = true;
  }
  if (ui.press && !ui.used && !(tipR && inside(tipR, ui.press.x, ui.press.y))) {
    // a press on nothing: whatever was in hand is put down
    st.word = null;
    st.sel = null;
    st.look = null;
    st.pending = null;
    st.result = null;
  }

  // ---- dragging a word ----------------------------------------------------------------------------
  const d = st.drag;
  let dragAt: { x: number; y: number } | null = null;
  const targetAt = (x: number, y: number): Target | null => {
    const sc = slots.find((c) => inside({ x: c.r.x - 2, y: c.r.y - 3, w: c.r.w + 4, h: c.r.h + 6 }, x, y));
    if (sc) return { kind: 'slot', ref: sc.ref };
    const gc = gear.find((c) => c.item && inside({ x: c.r.x - 1, y: c.r.y - 1, w: c.r.w + 2, h: c.r.h + 2 }, x, y));
    if (gc) return { kind: 'item', sel: gc.sel };
    const at = side && side.wordAt ? side.wordAt(x, y) : null;
    return at ? { kind: 'side', at } : null;
  };
  /** A word that is set leaves its socket: it is a spare word again, and in hand. */
  const lift = (from: SlotRef): boolean => {
    const why = game.unsocket(from.skill, from.side, from.idx);
    if (why) {
      say(why);
      return false;
    }
    const cell = slots.find((c) => sameSlot(c.ref, from));
    if (cell) cell.word = null;
    st.look = null;
    return true;
  };
  if (d) {
    if (ui.held) {
      if (!d.moving && Math.hypot(ui.held.x - d.x0, ui.held.y - d.y0) > 5) {
        d.moving = true;
        if (d.from) {
          // it is being carried off: out of its socket it comes
          if (lift(d.from)) {
            st.word = d.word;
            d.lifted = true;
          } else st.drag = null;
          d.from = null;
        }
      }
      if (st.drag && d.moving) dragAt = ui.held;
    }
    if (ui.release) {
      if (d.moving) {
        const to = targetAt(ui.release.x, ui.release.y);
        if (to && st.drag) drop(d.word, to);
      } else if (d.from) {
        // pressed and let go without carrying it anywhere: a second press on a set word takes it out
        if (d.was) lift(d.from);
      } else if (d.was) st.word = null; // a second press on the word in hand puts it down
      st.drag = null;
    } else if (!ui.held) st.drag = null;
  }
  if (st.word && h.words[st.word] <= 0) st.word = null;
  if (st.pending && h.words[st.pending.word] <= 0) st.pending = null;
  const hand = st.pending ? null : st.word;
  /** What the word in hand is hanging over: under the finger while dragging, under the mouse otherwise. */
  const over: Target | null = hand ? (dragAt ? targetAt(dragAt.x, dragAt.y) : T ? null : targetAt(ui.hx, ui.hy)) : null;

  // ---- dragging a piece of gear ---------------------------------------------------------------------
  // From the bag onto the hero: it is put on (a ring, on the finger it is let go over). From the
  // hero to the bag: it is taken off, and lies in the cell it is let go over if that is empty.
  // From one cell of the bag to another: it is moved there (the two change places).
  const cy = st.carry;
  let carryAt: { x: number; y: number } | null = null;
  // (At a service: from the bag over to the service's half, and it is sold, or put in the stash.)
  type Place = { kind: 'doll'; slot: EquipSlot | null } | { kind: 'bag'; i: number } | { kind: 'side' };
  const placeAt = (x: number, y: number): Place | null => {
    if (side && side.pieceDrop && inside(gameR, x, y)) return { kind: 'side' };
    if (page === 'gear' && inside(dollR, x, y)) {
      const cell = gear.find((c) => c.sel.kind === 'gear' && inside({ x: c.r.x - 1, y: c.r.y - 1, w: c.r.w + 2, h: c.r.h + 2 }, x, y));
      return { kind: 'doll', slot: cell && cell.sel.kind === 'gear' ? cell.sel.slot : null };
    }
    if (inside(bagR, x, y)) {
      const col = Math.max(0, Math.min(bagCols - 1, Math.floor((x - bagX + 1) / PITCH)));
      const row = Math.max(0, Math.min(bagRows - 1, Math.floor((y - bagY + 1) / PITCH)));
      return { kind: 'bag', i: Math.min(h.bag.length - 1, row * bagCols + col) };
    }
    return null;
  };
  if (cy) {
    if (!itemOf(cy.sel)) st.carry = null;
    else {
      if (ui.held) {
        if (!cy.moving && Math.hypot(ui.held.x - cy.x0, ui.held.y - cy.y0) > 5) cy.moving = true;
        if (cy.moving) carryAt = ui.held;
      }
      if (ui.release) {
        if (cy.moving) {
          const to = placeAt(ui.release.x, ui.release.y);
          if (cy.sel.kind === 'bag') {
            if (to && to.kind === 'doll') {
              say(game.equipFromBag(cy.sel.i, to.slot));
              st.sel = null;
            } else if (to && to.kind === 'bag' && to.i !== cy.sel.i) {
              game.moveInBag(cy.sel.i, to.i);
              st.sel = { kind: 'bag', i: to.i };
            } else if (to && to.kind === 'side' && side && side.pieceDrop) {
              say(side.pieceDrop(cy.sel.i));
              st.sel = null;
            }
          } else if (to && to.kind === 'bag') {
            say(game.unequip(cy.sel.slot, to.i));
            st.sel = null;
          }
        } else if (cy.was) second(cy.sel); // a second press on the piece being looked at
        st.carry = null;
      } else if (!ui.held) st.carry = null;
    }
  }
  const carried = carryAt && st.carry ? itemOf(st.carry.sel) : null;
  /** Where the piece being carried would go if it were let go now. */
  const carryTo: Place | null = carryAt && carried ? placeAt(carryAt.x, carryAt.y) : null;

  // ---- something carried over the name of a page, long enough: that page is turned to -------------
  {
    const at = dragAt ?? carryAt;
    const tb = at && !first ? tabs.find((q) => q.page !== page && inside({ x: q.r.x - 1, y: 0, w: q.r.w + 2, h: q.r.y + q.r.h + 3 }, at.x, at.y)) : undefined;
    if (!tb) st.tab = null;
    else if (!st.tab || st.tab.page !== tb.page) st.tab = { page: tb.page, t: 0 };
    else {
      st.tab.t += dt;
      if (st.tab.t > 0.3) {
        nextPage = tb.page;
        st.tab = null;
      }
    }
  }

  // ---- draw: the ground, the names of the pages -----------------------------------------------------
  const pulse = 0.5 + 0.5 * Math.sin(t * 7);
  const blink = pulse > 0.5;
  // (the whole screen is the interface's while the inventory is open: a press on the game's half closes it)
  ui.claim(0, 0, W, H);
  ui.mark(side ? 'side' : 'game', gameR.x, gameR.y, gameR.w, gameR.h);
  ui.mark('inventory', R.x, R.y, R.w, R.h);
  if (side) {
    // the service has the other half
    side.draw({ piece: carryTo && carryTo.kind === 'side' ? carried : null, hand, at: over && over.kind === 'side' ? over.at : null, dragging: !!dragAt, pulse, blink });
  } else {
    // the game's half: a shade darker, so that it reads as standing still
    g.globalAlpha = 0.25;
    g.fillStyle = P.black;
    g.fillRect(gameR.x, gameR.y, gameR.w, gameR.h);
    g.globalAlpha = 1;
  }
  // the panel
  g.fillStyle = THEME.ink;
  g.fillRect(R.x, R.y, R.w, R.h);
  // (the bottom that never changes stands on a ground of its own)
  g.fillStyle = THEME.bg;
  g.fillRect(R.x, stripY - 3, R.w, R.y + R.h - stripY + 3);
  g.fillStyle = THEME.edge;
  g.fillRect(R.x, stripY - 3, R.w, 0.5);
  // its edge against the game: a line, and a hair of light along it
  g.fillStyle = THEME.edgeHi;
  if (below) g.fillRect(R.x, R.y, R.w, 1);
  else g.fillRect(R.x, R.y, 1, R.h);
  g.fillStyle = THEME.accentLo;
  if (below) g.fillRect(R.x, R.y, R.w, 0.5);
  else g.fillRect(R.x, R.y, 0.5, R.h);
  for (const tb of tabs) {
    const on = tb.page === page;
    const off = first && tb.page !== 'attacks';
    const hot = !off && !on && (ui.hover(tb.r.x, tb.r.y, tb.r.w, tb.r.h) || (!!st.tab && st.tab.page === tb.page));
    ui.box(tb.r.x, tb.r.y, tb.r.w, tb.r.h, on ? THEME.hot : hot ? THEME.bg2 : THEME.bg, on ? THEME.accent : hot ? THEME.edgeHi : THEME.edge);
    ui.mark(`button:${PAGE_LABEL[tb.page]}`, tb.r.x, tb.r.y, tb.r.w, tb.r.h);
    drawText(g, PAGE_LABEL[tb.page], tb.r.x + Math.floor(tb.r.w / 2), tb.r.y + Math.floor((tb.r.h - 8) / 2) + 1, off ? THEME.faint : on ? THEME.accent : THEME.text, { align: 'center' });
  }
  /** A caption, a line of small letters, and how the things read below are written. */
  const cap = (text: string, x: number, y: number, right = false): void => {
    drawText(g, text, x, y, THEME.dim, { align: right ? 'right' : 'left', font: 'small' });
  };

  // ---- draw: the page ---------------------------------------------------------------------------------
  const isOver = (to: Target): boolean =>
    !!over && over.kind === to.kind && (over.kind === 'slot' ? sameSlot(over.ref, (to as { ref: SlotRef }).ref) : over.kind === 'item' ? sameSel(over.sel, (to as { sel: Sel }).sel) : over.at === (to as { at: string }).at);
  if (page === 'attacks') {
    for (const c of caps) cap(c.text, c.x, c.y, c.right);
    for (let s = 0; s < ROWS; s++) {
      const sk = h.skills[s];
      const def = SKILLS[sk.id];
      const a = abil[s];
      ui.box(a.x, a.y, a.w, a.h, st.focus === s ? THEME.hot : THEME.bg2, st.focus === s ? THEME.accent : THEME.edgeHi);
      const icon = art.icons.ability[def.icon];
      g.drawImage(icon.img, a.x + 1, a.y + Math.floor((a.h - icon.h) / 2), icon.w, icon.h);
      drawText(g, def.name.toUpperCase(), a.x + 22, a.y + 3, P.white);
      // (THE FIRST LEVELS: an ability not open yet: dark, with the level that opens it)
      const shut = !game.moveOpen(s);
      if (shut) {
        g.globalAlpha = 0.66;
        g.fillStyle = P.black;
        g.fillRect(a.x + 1, a.y + 1, a.w - 2, a.h - 2);
        g.globalAlpha = 1;
      }
      drawText(g, shut ? `LEVEL ${MOVE_OPENS[s]}` : T ? (s === 0 ? 'TAP' : s === 1 ? 'HOLD' : 'SWIPE') : s === 0 ? 'LEFT' : s === 1 ? 'RIGHT' : 'SPACE', a.x + 22, a.y + 13, shut ? THEME.accent : THEME.dim, { font: 'small' });
      // its numbers: one hit, and how often
      const at = nums[s];
      if (at) {
        const [lo, hi] = game.hitRange(s);
        const ramp = sk.r.element === 'phys' ? null : ELEMENT_RAMP[sk.r.element];
        drawText(g, lo === hi ? `${lo}` : `${lo}-${hi}`, at.x, at.y + 3, ramp ? ramp[3] : P.white);
        drawText(g, paceText(game, s).short, at.x, at.y + 13, THEME.dim, { font: 'small' });
      }
    }
    for (const c of locked) {
      // a slot not opened yet: the level that opens it
      ui.box(c.r.x, c.r.y, c.r.w, c.r.h, THEME.ink, THEME.edge);
      if (c.lv === 0) {
        // (THE FIRST LEVELS: shut until the wordsmith's ring is lit: a small dark ring of stones)
        const cx = c.r.x + Math.floor(c.r.w / 2);
        const cy = c.r.y + Math.floor(c.r.h / 2);
        g.fillStyle = THEME.faint;
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          g.fillRect(Math.round(cx + Math.cos(a) * 4) - 1, Math.round(cy + Math.sin(a) * 4) - 1, 2, 2);
        }
        continue;
      }
      drawText(g, 'LV', c.r.x + Math.floor(c.r.w / 2), c.r.y + 4, THEME.faint, { align: 'center', font: 'small' });
      drawText(g, `${c.lv}`, c.r.x + Math.floor(c.r.w / 2), c.r.y + 11, THEME.faint, { align: 'center', font: 'small' });
    }
    const pointAt = (r: Rect): void => {
      arrow(g, r.x + Math.floor(r.w / 2), r.y + r.h + 1, t, THEME.accent, 'up');
    };
    for (const c of slots) {
      const to: Target = { kind: 'slot', ref: c.ref };
      const ok = !!hand && problem(hand, to) === null;
      const hot = ui.hover(c.r.x, c.r.y, c.r.w, c.r.h) || isOver(to);
      const wanted = first && !!coach && sameSlot(coach.to, c.ref);
      if (c.word && ok && hand && isOver(to)) {
        // the word in hand, held over a word it may take the place of: it is shown sitting there, faintly
        drawWordTile(ui, art, c.r.x, c.r.y, c.r.w, c.r.h, hand, c.ref.side, { lit: true, edge: P.white, alpha: T ? 0.75 : 0.95, stone: true });
      } else if (c.word) {
        const looked = !!st.look && sameSlot(st.look, c.ref);
        // (a word in hand could take this one's place: its edge says so)
        drawWordTile(ui, art, c.r.x, c.r.y, c.r.w, c.r.h, c.word, c.ref.side, { lit: looked || hot, edge: ok ? (blink ? THEME.accent : THEME.accentLo) : looked ? THEME.accent : undefined, stone: true });
      } else if (ok && hand && isOver(to)) {
        // the word in hand, held over an empty slot it may go in: it is shown sitting there, faintly
        ui.box(c.r.x, c.r.y, c.r.w, c.r.h, THEME.accentBg, P.white);
        drawWordTile(ui, art, c.r.x, c.r.y, c.r.w, c.r.h, hand, c.ref.side, { lit: true, edge: P.white, alpha: T ? 0.6 : 0.95, stone: true });
      } else {
        // an empty slot: a dark notch with a plus in the middle. It is lit while the word in hand could go in.
        const edge = ok ? (blink ? THEME.accent : THEME.accentLo) : wanted ? THEME.edgeHi : THEME.edge;
        ui.box(c.r.x, c.r.y, c.r.w, c.r.h, ok ? (blink ? THEME.accentBg : THEME.accentBg2) : THEME.slot, edge);
        const px = c.r.x + Math.floor(c.r.w / 2);
        const py = c.r.y + Math.floor(c.r.h / 2);
        g.fillStyle = ok ? THEME.accent : THEME.edge;
        g.fillRect(px - 3, py, 7, 1);
        g.fillRect(px, py - 3, 1, 7);
      }
      if (wanted && !st.pending && !dragAt) pointAt(c.r);
    }
  } else if (page === 'gear') {
    // the hero, as they stand in the game and twice the size, on a ground of their own between
    // the two columns of slots
    const heroX = dollX + CELL + 3;
    const heroW = DOLL_W - 2 * CELL - 6;
    ui.box(heroX, dollY, heroW, dollH, THEME.bg, THEME.bg);
    if (!dollFigure || dollClass !== h.cls) {
      dollFigure = new Figure();
      dollClass = h.cls;
      dollSeen = -10;
    }
    // (how long since the figure was last drawn: a moment, unless this page has just come on screen)
    const since = t - dollSeen > 0.5 || t < dollSeen ? 0 : t - dollSeen;
    if (since === 0) dollFigure.reset(2.5);
    dollSeen = t;
    const look = { twoHanded: !!h.gear.mainhand && h.gear.mainhand.weapon === 'greatsword', town: !!game.level.town };
    const sp = dollFigure.frame(art.heroes.of(h.cls, look), { anim: 'idle', animT: t, fx: 0.7071, fy: 0.7071, attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 }, since, 0, 0);
    const fx = dollX + DOLL_W / 2;
    const fy = dollY + Math.floor((dollH + 70) / 2);
    g.save();
    g.beginPath();
    g.rect(heroX, dollY, heroW, dollH);
    g.clip();
    dollFigure.draw(g, sp, fx, fy, 2);
    dollFigure.lights(g, fx, fy, 2);
    g.restore();
    // beside them: their numbers at a glance (what changes when a piece is put on)
    drawGlance(ui, game, glanceR);
  } else {
    drawStats(ui, game, { x: X0, y: pageY, w: bodyW, h: pageH });
  }

  // ---- draw: gear, worn and carried (the worn on the GEAR page only) -----------------------------------
  cap('BAG', bagX, bagY - CAP);
  // (while a piece is carried, the place it may go is lit: the hero for a piece from the bag, the bag for a piece worn)
  if (carried && st.carry) {
    const want = st.carry.sel.kind === 'bag' ? (page === 'gear' ? dollR : null) : bagR;
    if (want) {
      // (a frame and no more: the hero stands inside one of them)
      const lit = !!carryTo && (carryTo.kind === 'doll') === (st.carry.sel.kind === 'bag');
      g.fillStyle = lit ? THEME.accent : blink ? THEME.accentLo : THEME.edgeHi;
      const k = lit ? 1 : 0.5;
      g.fillRect(want.x + 1, want.y, want.w - 2, k);
      g.fillRect(want.x + 1, want.y + want.h - k, want.w - 2, k);
      g.fillRect(want.x, want.y + 1, k, want.h - 2);
      g.fillRect(want.x + want.w - k, want.y + 1, k, want.h - 2);
    }
  }
  const dimBag = first ? 0.3 : 1;
  const goal = carried && st.carry && st.carry.sel.kind === 'bag' ? (carryTo && carryTo.kind === 'doll' && carryTo.slot && carried.slot === 'ring' ? carryTo.slot : game.slotFor(carried)) : null;
  /** COMPARE is on: the worn piece that is up beside the one being read. Its place on the hero is lit, so that it is plain which piece that is (of two rings, which hand). */
  const versus = st.compare ? (wornFor(game, st.compare.item)[st.compare.n] ?? null) : null;
  for (const c of gear) {
    const it = c.item;
    const worn = c.sel.kind === 'gear';
    const to: Target = { kind: 'item', sel: c.sel };
    const ok = !!hand && !!it && problem(hand, to) === null;
    const waiting = !!st.pending && sameSel(st.pending.sel, c.sel);
    const looked = !st.word && !st.pending && sameSel(st.sel, c.sel) && !!it;
    const away = carried !== null && !!st.carry && sameSel(st.carry.sel, c.sel);
    const aim = c.sel.kind === 'gear' && (goal === c.sel.slot || (!!versus && it === versus));
    const lit = looked || isOver(to) || waiting || c === tip || aim;
    const bad = it && c.sel.kind === 'bag' && game.useProblem(it) !== null;
    g.globalAlpha = worn ? 1 : dimBag;
    const edge = waiting || looked || aim ? THEME.accent : ok ? (blink ? THEME.accent : THEME.accentLo) : it ? RARITY_COLOR[it.rarity] : THEME.edge;
    ui.slot(c.r.x, c.r.y, CELL, it && !away ? art.icons.item[it.icon] : null, edge, lit);
    if (!it && c.sel.kind === 'gear') {
      // an empty slot on the hero shows, faintly, the kind of thing that goes in it
      const ghost = art.icons.item[GHOST[c.sel.slot]];
      g.globalAlpha = 0.3;
      g.drawImage(ghost.img, c.r.x + Math.floor((CELL - ghost.w) / 2), c.r.y + Math.floor((CELL - ghost.h) / 2));
      g.globalAlpha = 1;
    }
    // (the four places it has for properties: what it came with, the words burned in, and the room left)
    if (it && !away) drawItemPips(g, it, c.r.x, c.r.y);
    if (bad && !away) {
      g.globalAlpha = dimBag * 0.45;
      g.fillStyle = P.bl2;
      g.fillRect(c.r.x + 1, c.r.y + 1, CELL - 2, CELL - 2);
    }
    g.globalAlpha = 1;
  }

  // beside the bag: what they have, and who they are
  {
    const ix = bagX + bagW + 8;
    const iw = X0 + bodyW - ix;
    if (iw >= 30) {
      const coin = art.icons.gold[0];
      g.drawImage(coin.img, ix, bagY);
      drawText(g, `${h.gold}`, ix + coin.w + 2, bagY + 2, THEME.gold, { font: 'small' });
      drawText(g, `LEVEL ${h.level}`, ix, bagY + 14, THEME.dim, { font: 'small' });
      const who = CLASSES[h.cls].name.toUpperCase();
      if (textWidth(who, 'small') <= iw) drawText(g, who, ix, bagY + 22, THEME.faint, { font: 'small' });
    }
  }

  // ---- draw: the pouch of spare words ---------------------------------------------------------------
  cap('YOUR WORDS', pouchX, pouchY - CAP);
  // (the owner, 5 Oct 2026, 22:36: "none to spare under words to empty"; THE FIRST LEVELS: before the ring is lit, what opens wordsmithing)
  const dark = !h.ring ? (h.quest ? `Slots open at the wordsmith: bring him ${QUEST_ITEM.the}.` : 'No word slots until his ring is lit.') : null;
  if (!pouchWords.length) drawText(g, dark ?? 'empty', pouchX, pouchY + Math.floor((TH - 5) / 2), dark ? THEME.dim : THEME.faint, { font: 'small' });
  for (const c of pouch) {
    const sel = st.word === c.w || (!!st.pending && st.pending.word === c.w);
    const hot = ui.hover(c.r.x, c.r.y, c.r.w, c.r.h);
    const gone = (!!dragAt || !!st.pending) && sel && h.words[c.w] <= 1;
    if (!gone) drawWordTile(ui, art, c.r.x, c.r.y - (sel ? 1 : 0), c.r.w, c.r.h, c.w, 'name', { lit: sel || hot, edge: sel ? THEME.accent : undefined, count: h.words[c.w], bare: lay.bare, stone: lay.stones });
    // (the arrow at a new player's first word stands beside the tile: above it is the caption)
    if (first && coach && coach.word === c.w && !hand && !st.pending) arrow(g, c.r.x + c.r.w + 2, c.r.y + Math.floor(c.r.h / 2), t, THEME.accent, 'left');
  }
  if (lay.hidden > 0) drawText(g, `+${lay.hidden} MORE`, pouchX + pouchW, pouchY - CAP, THEME.dim, { align: 'right', font: 'small' });

  // ---- draw: what is being read -----------------------------------------------------------------------
  // (a word that is being looked at in its socket and has been taken out since: nothing to look at)
  if (st.look) {
    const sk = h.skills[st.look.skill];
    if (!(st.look.side === 'front' ? sk.front : sk.behind)[st.look.idx]) st.look = null;
  }
  /** A piece of the service's own that is being looked at there (read here, when nothing of the hero's is). */
  const foreign = side && side.look && !(page === 'gear' && selCell && selCell.item) ? side.look() : null;
  /** Which of the things that can be read is being read (the first that applies), or none. */
  const reading: 'pending' | 'over' | 'result' | 'hand' | 'look' | 'piece' | null = st.pending
    ? 'pending'
    : hand && over && !(over.kind === 'side' && !(side && side.wordRead))
      ? 'over'
      : st.result
        ? 'result'
        : hand && !(side && dragAt && inside(gameR, dragAt.x, dragAt.y))
          ? 'hand'
          : st.look
            ? 'look'
            : // (a piece being carried over the service's half: its card would lie on what it is being carried to)
              !(carryTo && carryTo.kind === 'side') && ((page === 'gear' && selCell && selCell.item) || foreign)
              ? 'piece'
              : null;

  // Under the three attacks: the coach's line (a new player's first word), and, with nothing
  // else being read, the attack last touched, read out: as much of it as there is room for.
  if (mini) {
    let y = mini.y;
    const end = mini.y + mini.h;
    if (coach) {
      for (const row of wrapText(coach.text, mini.w).slice(0, 2)) {
        if (y + 8 <= end) drawText(g, row, mini.x + Math.floor(mini.w / 2), y, THEME.accent, { align: 'center', shadow: P.ink });
        y += 9;
      }
      y += 1;
    }
    // (a new player's first word is waiting: the coach's line stands alone)
    if (!reading && !first) {
      const s = Math.max(0, Math.min(ROWS - 1, st.focus));
      const sk = h.skills[s];
      const parts = nameParts(SKILLS[sk.id], sk.front, sk.behind);
      for (const ln of nameLines(parts, mini.w)) {
        if (y + 8 <= end) drawName(g, ln, mini.x + namePartsWidth(ln) / 2, y);
        y += 10;
      }
      // (a sentence is written whole or not at all: one that stops half way reads as a fault)
      let full = false;
      const small = (text: string, color: string): void => {
        const rows = wrapText(text, mini.w, 'small');
        if (full || y + rows.length * 6 - 1 > end) {
          full = true;
          return;
        }
        for (const row of rows) {
          drawText(g, row, mini.x, y, color, { font: 'small' });
          y += 6;
        }
      };
      const [lo, hi] = game.hitRange(s);
      const el = sk.r.element === 'phys' ? '' : `${ELEMENT_NAME[sk.r.element].toLowerCase()} `;
      const pace = paceText(game, s).long;
      small(`${lo === hi ? lo : `${lo} to ${hi}`} ${el}damage a hit${pace ? `, ${pace}` : ''}.`, P.white);
      sk.r.lines.forEach((l, i) => small(l, i === 0 ? THEME.dim : THEME.text));
    }
  }

  // Everything else that is read: on a card over the game's half, against the panel's edge,
  // level with the thing it is about. It is laid out twice: once to find how tall it is, once
  // to draw it. Its buttons are kept for the next frame's press (st.card).
  st.card = null;
  if (reading !== 'piece') st.compare = null;
  if (reading) {
    const cellOf = (sel: Sel): Rect | null => {
      const c = gear.find((q) => sameSel(sel, q.sel));
      return c ? c.r : null;
    };
    const slotOf = (ref: SlotRef): Rect | null => {
      const c = slots.find((q) => sameSlot(q.ref, ref));
      return c ? c.r : null;
    };
    const tileOf = (w: WordId): Rect | null => {
      const c = pouch.find((q) => q.w === w);
      return c ? c.r : null;
    };
    /** The piece being looked at (the hero's own, `mine`; or one of the service's), and the piece worn where it would go. */
    const mine = reading === 'piece' && selCell && selCell.item ? selCell : null;
    const theirs = reading === 'piece' && !mine ? foreign : null;
    const piece = mine ? mine.item : theirs ? theirs.item : null;
    /** What is worn where it would go: what COMPARE can bring up. (Not asked of a piece that is itself worn, nor of one of the service's that is only passed over.) */
    const against = piece && ((theirs && theirs.buttons.length) || (mine && mine.sel.kind === 'bag')) ? wornFor(game, piece) : null;
    if (st.compare && (!against || st.compare.item !== piece || st.compare.n >= against.length)) st.compare = null;
    /** COMPARE has been pressed on this piece: this worn one is shown with it. */
    const worn = st.compare && against ? against[st.compare.n] : null;
    const comparing = !!worn;
    const room = (below ? W : gameR.w) - 8;
    /** The thing on the panel the card is about. */
    const about: Rect | null =
      reading === 'pending' && st.pending
        ? cellOf(st.pending.sel)
        : reading === 'over' && over
          ? over.kind === 'slot'
            ? slotOf(over.ref)
            : over.kind === 'item'
              ? cellOf(over.sel)
              : side && side.wordRect
                ? side.wordRect(over.at)
                : null
          : reading === 'hand' && hand
            ? tileOf(hand)
            : reading === 'look' && st.look
              ? slotOf(st.look)
              : mine
                ? mine.r
                : theirs
                  ? theirs.anchor
                  : null;
    // (a piece beside the piece it would replace needs two columns; a word reads best in a narrower one.
    // Where there is the room, each of the two is as wide as a piece by itself, and the one being
    // read does not move at all. Where there is not the room for two, the worn piece goes under it.)
    const two = comparing && room >= 200;
    const buttons: { id: string; primary?: boolean; lit?: boolean; disabled?: boolean }[] =
      reading === 'pending'
        ? [{ id: 'BURN IT', primary: true, lit: blink }, { id: 'CANCEL' }]
        : mine
          ? [...selButtons.map((b) => ({ id: b.label, lit: !!b.lit })), ...(against ? [{ id: COMPARE, lit: comparing, disabled: !against.length }] : [])]
          : theirs
            ? [...theirs.buttons.map((b) => ({ id: b.label, lit: b.lit, primary: b.primary, disabled: b.disabled })), ...(against ? [{ id: COMPARE, lit: comparing, disabled: !against.length }] : [])]
            : reading === 'hand' && hand && side && side.wordButtons && !first
              ? side.wordButtons(hand).map((b) => ({ id: b.label, lit: b.lit, primary: b.primary, disabled: b.disabled }))
              : [];
    const bh = reading === 'pending' ? pbh : sbh;
    // How wide the buttons' words are. Three on a piece's card, with long words on them (SELL 136,
    // EQUIP, COMPARE), need more than the card of a piece is wide: the card is as much wider.
    const words = buttons.map((b) => textWidth(b.id));
    const gaps = 3 * Math.max(0, buttons.length - 1);
    const lettering = words.reduce((a, w) => a + w, 0);
    const one = Math.min(room, Math.max(ONE, reading === 'piece' && buttons.length > 2 ? lettering + gaps + 10 * buttons.length + 10 : 0));
    const cardW = Math.min(room, reading === 'piece' ? (two ? Math.max(236, one) : one) : 190);
    const inner = cardW - 10;

    /** With the worn piece brought up beside the one being read: it is on that one's left. (Set where the card is placed, below.) */
    let wornLeft = true;
    /** Lay the card's text out in a column `iw` wide from (rx, ry): drawn, or (`dry`) only measured. Returns where it ends. */
    const content = (rx: number, ry: number, iw: number, dry: boolean, rEnd: number): number => {
      let iy = ry;
      const put = (text: string, x: number, y: number, color: string, o: NonNullable<Parameters<typeof drawText>[5]> = {}): number =>
        dry ? textWidth(text, o.font ?? 'normal', o.scale ?? 1) : drawText(g, text, x, y, color, o);
      const line = (text: string, color: string, small = true, w = iw, x = rx): void => {
        for (const row of wrapText(text, w, small ? 'small' : 'normal')) {
          if (iy + (small ? 5 : 8) <= rEnd) put(row, x, iy, color, { font: small ? 'small' : 'normal' });
          iy += small ? 6 : 9;
        }
      };
      /** An attack's name in its colours, in as many lines as it needs. */
      const name = (parts: { text: string; color: string; small: boolean }[], scale = 1): void => {
        const step = 9 * scale + 1;
        for (const ln of nameLines(parts, iw, scale)) {
          if (!dry && iy + 8 * scale <= rEnd) drawName(g, ln, rx + namePartsWidth(ln, scale) / 2, iy, scale);
          iy += step;
        }
        iy += 1;
      };
      /** A word about to go into a socket: the name the attack would have, and what the word may do there. */
      const slotPreview = (word: WordId, ref: SlotRef): void => {
        const sk = h.skills[ref.skill];
        const def = SKILLS[sk.id];
        const why = game.placeProblem(ref, word);
        const f = sk.front.slice();
        const b = sk.behind.slice();
        (ref.side === 'front' ? f : b)[ref.idx] = word;
        const parts = nameParts(def, f, b);
        // (large on one line if it fits; otherwise in the ordinary letters, on as many lines as it needs)
        name(parts, !why && namePartsWidth(parts, 2) <= iw ? 2 : 1);
        if (why) {
          line(why, THEME.bad, false);
          return;
        }
        line(ref.side === 'front' ? WORDS[word].frontText : WORDS[word].behindText, P.white, false);
        const back = game.displaced(ref);
        if (back) line(`${WORDS[back].name.toUpperCase()} is there now. It goes back to your words.`, THEME.text);
        line(T || (st.drag && st.drag.moving) ? 'Let go to set it. It can be taken out again.' : 'Click to set it. It can be taken out again.', THEME.dim);
      };
      /** A word about to be burned into a piece of gear: what it could become there. */
      const itemPreview = (word: WordId, sel: Sel, asking: boolean): void => {
        const it = itemOf(sel);
        if (!it) return;
        let x = rx;
        x += put(WORDS[word].name.toUpperCase(), x, iy, WORD_COLOR[word], { shadow: P.ink }) + 4;
        x += put('on', x, iy + 3, THEME.dim, { font: 'small' }) + 4;
        if (x + textWidth(it.name) <= rx + iw) put(it.name, x, iy, RARITY_COLOR[it.rarity], { shadow: P.ink });
        else {
          iy += 10;
          put(it.name, rx, iy, RARITY_COLOR[it.rarity], { shadow: P.ink });
        }
        iy += 11;
        const why = asking ? null : problem(word, { kind: 'item', sel });
        if (why) {
          line(why, THEME.bad, false);
          return;
        }
        const opts = game.imbueChoices(sel.kind === 'gear' ? { kind: 'gear', slot: sel.slot } : { kind: 'bag', i: sel.i }, word);
        line(`It could become:  ${opts.map((o) => rangeText(o, game.meta.limit)).join('   or   ')}`, P.white);
        line(asking ? (opts.length > 1 ? 'Which one, and how strong, is rolled. The word is used up.' : 'How strong is rolled. The word is used up.') : T || (st.drag && st.drag.moving) ? 'Let go to choose this.' : 'Click to choose this.', THEME.dim);
      };
      /** A piece of gear, read: its lines one under another in a column `w` wide. */
      const card = (lines: Line[], x: number, w: number, from: number): number => {
        let y = from;
        for (const l of lines) {
          for (const row of wrapText(l.text, w, l.small ? 'small' : 'normal')) {
            if (y + (l.small ? 5 : 8) <= rEnd) put(row, x, y, l.color, { font: l.small ? 'small' : 'normal' });
            y += l.small ? 7 : 9;
          }
        }
        return y;
      };
      if (reading === 'pending' && st.pending) itemPreview(st.pending.word, st.pending.sel, true);
      else if (reading === 'over' && hand && over) {
        if (over.kind === 'slot') slotPreview(hand, over.ref);
        else if (over.kind === 'item') itemPreview(hand, over.sel, false);
        else if (side && side.wordRead) for (const l of side.wordRead(hand, over.at)) line(l.text, l.color, !!l.small);
      } else if (reading === 'result' && st.result) {
        const r = st.result;
        const lit = r.t < 0.7 && Math.floor(r.t * 10) % 2 === 0;
        line(`${WORDS[r.word].name.toUpperCase()} was burned into ${r.item}. It became:`, THEME.text);
        const rows = wrapText(r.text, iw);
        const scale = rows.length === 1 && textWidth(r.text) * 2 <= iw ? 2 : 1;
        for (const row of rows) {
          put(row, rx, iy + 1, lit ? P.white : WORD_COLOR[r.word], { shadow: P.ink, scale });
          iy += 9 * scale + 1;
        }
      } else if (reading === 'hand' && hand) {
        // a word in hand, being read
        const wd = WORDS[hand];
        const k = game.meta.known[hand];
        const nx = rx + put(wd.name.toUpperCase(), rx, iy, WORD_COLOR[hand], { shadow: P.ink }) + 6;
        put(`grows with ${ATTR_NAME[wd.attr]}`, nx, iy + 3, THEME.dim, { font: 'small' });
        iy += 11;
        line(wd.about, P.white, false);
        const hint = side && side.wordHint ? side.wordHint(hand) : null;
        if (first) line(T ? 'Drag it onto an attack.' : 'Drag it onto an attack, or click a slot.', THEME.text);
        else if (hint) line(hint, THEME.text);
        else if (page === 'attacks') line(T ? 'Drag it onto an attack: it can be taken out again.' : 'Drag it onto an attack, or click a slot: it can be taken out again.', THEME.text);
        else line(T ? 'Drag it into a piece of gear: it is used up. For an attack, carry it to ATTACKS.' : 'Click a piece of gear to burn it in: it is used up. Hold it over a piece to see what it could become.', THEME.text);
        if (!game.practice && !first) {
          if (k.front) line(`You know: in front, ${wd.frontText.charAt(0).toLowerCase()}${wd.frontText.slice(1)}`, THEME.dim);
          if (k.behind) line(`You know: behind, ${wd.behindText.charAt(0).toLowerCase()}${wd.behindText.slice(1)}`, THEME.dim);
          if (!k.front && !k.behind && !k.gear && !k.dungeon) line('You have not used this word yet.', THEME.dim);
        }
      } else if (reading === 'look' && st.look) {
        // a word that is set, being read: what it does on this attack, numbers and all
        const sk = h.skills[st.look.skill];
        const w = (st.look.side === 'front' ? sk.front : sk.behind)[st.look.idx];
        if (w) {
          name(nameParts(SKILLS[sk.id], sk.front, sk.behind));
          const label = st.look.side === 'front' ? WORDS[w].front : WORDS[w].behind;
          for (const l of sk.r.lines.slice(1)) if (l.startsWith(`${label}:`)) line(l, P.white);
          line(T ? 'Drag it out, or tap it again, to take it back.' : 'Drag it out, or right-click it, to take it back.', THEME.dim);
        }
      } else if (reading === 'piece' && piece) {
        // the piece being looked at; and, COMPARE pressed, the piece worn where it would go. That
        // one comes up on the side the card has grown to (`wornLeft`: away from the panel, where
        // the two are side by side), and the piece being read and its buttons stay where they were.
        const half = two ? Math.floor((iw - 10) / 2) : iw;
        const x1 = wornLeft ? rx + iw - half : rx;
        const x2 = wornLeft ? rx : rx + iw - half;
        const end = card(theirs ? [...itemCard(game, piece, T), ...theirs.lines] : itemCard(game, piece, T), x1, half, iy);
        let end2 = end;
        // (a ring on each hand: which of the two this is. COMPARE again brings up the other.)
        // (the owner, 5 Oct 2026, 22:36: "change wearing now to Equipped". It said WORN NOW.)
        const wornNow = against && against.length > 1 && st.compare ? `EQUIPPED  ${st.compare.n + 1} OF ${against.length}` : 'EQUIPPED';
        if (worn && two) {
          put(wornNow, x2, iy, THEME.dim, { font: 'small' });
          end2 = card(itemCard(game, worn, T), x2, half, iy + 8);
          if (!dry) {
            // (the line between the two is as tall as the taller of them)
            g.fillStyle = THEME.edge;
            g.fillRect(Math.max(x1, x2) - 5.5, iy, 0.5, Math.min(rEnd, Math.max(end, end2)) - iy - 1);
          }
        } else if (worn) {
          // (no room for the two side by side: the worn piece under the other, a line between)
          if (!dry && end + 2 <= rEnd) {
            g.fillStyle = THEME.edge;
            g.fillRect(rx, end + 1.5, iw, 0.5);
          }
          put(wornNow, rx, end + 4, THEME.dim, { font: 'small' });
          end2 = card(itemCard(game, worn, T), rx, iw, end + 12);
        }
        iy = Math.max(end, end2);
      }
      return iy;
    };

    const foot = buttons.length ? bh + 5 : 0;
    const tall = content(0, 0, inner, true, Infinity);
    const most = (below ? gameR.h : H) - 6;
    const ch = Math.min(most, 5 + tall + foot + 3);
    let cx: number;
    let cy0: number;
    /** The thing it is about is on the service's half: the card goes under it, not over it. */
    const under = about && (theirs || (reading === 'over' && over && over.kind === 'side')) ? about : null;
    if (below) {
      // over the panel, against its upper edge; across the screen, over the thing it is about
      cx = Math.max(3, Math.min(W - cardW - 3, about ? Math.round(about.x + about.w / 2 - cardW / 2) : Math.round((W - cardW) / 2)));
      cy0 = under ? Math.max(2, Math.min(R.y - ch - 3, under.y + under.h + 3)) : Math.max(2, R.y - ch - 3);
    } else {
      cx = Math.max(2, R.x - cardW - 3);
      const mid = about ? about.y + about.h / 2 : H / 2;
      cy0 = Math.max(3, Math.min(H - ch - 3, under ? under.y + under.h + 3 : Math.round(mid - ch / 2)));
    }
    if (st.compare && reading === 'piece') {
      // The worn piece is up beside it. The card keeps the lower edge it had when COMPARE was
      // pressed and grows upward (over a service's cells too, for as long as the worn piece is
      // up), and sideways it grows away from the piece being read: a button that slid out from
      // under the finger could not be pressed again to put the worn piece away.
      const was = st.compare.at;
      const foot0 = was.y + was.h;
      if (below) {
        // (across a narrow screen there may be the room on one side and not on the other)
        const grow = cardW - was.w;
        const onLeft = was.x - 3;
        const onRight = W - 3 - (was.x + was.w);
        wornLeft = onLeft >= grow || onLeft >= onRight;
        cx = Math.max(3, Math.min(W - cardW - 3, wornLeft ? was.x - grow : was.x));
        cy0 = Math.max(2, Math.min(R.y - ch - 3, foot0 - ch));
      } else cy0 = Math.max(3, Math.min(H - ch - 3, foot0 - ch));
    }
    if (side) {
      // (over a service's half the card lies on lettering, not on the game: a dark margin round it keeps the two apart)
      g.globalAlpha = 0.72;
      g.fillStyle = THEME.ink;
      g.fillRect(cx - 3, cy0 - 3, cardW + 6, ch + 6);
      g.globalAlpha = 1;
    }
    ui.panel(cx, cy0, cardW, ch);
    ui.mark('card', cx, cy0, cardW, ch);
    content(cx + 5, cy0 + 5, inner, false, cy0 + ch - 3 - foot);
    const made: { id: string; r: Rect }[] = [];
    if (buttons.length) {
      // A piece's buttons are in a row as wide as the card of a piece by itself, under that piece:
      // with the worn piece brought up beside it, every one of them is where it was.
      const row = reading === 'piece' ? Math.min(inner, one - 10) : inner;
      const even = Math.min(78, Math.floor((row - gaps) / buttons.length));
      // (three of them, and COMPARE is a long word: where the longest would touch the edges of an
      // even share, each is as wide as its own word needs and the room left over is shared out)
      const spare = Math.floor((row - gaps - lettering) / buttons.length);
      const tight = Math.max(...words) + 8 > even && spare >= 4;
      let x = wornLeft ? cx + cardW - 5 - row : cx + 5;
      buttons.forEach((b, i) => {
        const bw = tight ? words[i] + spare : even;
        const r: Rect = { x, y: cy0 + ch - 4 - bh, w: bw, h: bh };
        // (EQUIP is lit when the piece can be worn. Pink is kept for the one thing to press: DONE, or BURN IT while it is asked.)
        ui.drawButton(r.x, r.y, r.w, r.h, b.id, { primary: b.primary, lit: b.lit, disabled: b.disabled });
        made.push({ id: b.id, r });
        x += bw + 3;
      });
    }
    st.card = { r: { x: cx, y: cy0, w: cardW, h: ch }, buttons: made };
  }

  if (st.noteT > 0) {
    const nw = Math.min(R.w - 4, textWidth(st.note) + 8);
    const nx = R.x + Math.floor((R.w - nw) / 2);
    g.fillStyle = P.black;
    g.fillRect(nx, stripY - 16, nw, 11);
    drawText(g, st.note, R.x + Math.floor(R.w / 2), stripY - 14, THEME.bad, { align: 'center', shadow: P.ink });
  }

  // a word has just been set: the attack's new name, large, over its line
  if (st.flash && st.flash.t < 1.1 && page === 'attacks') {
    const s = st.flash.skill;
    const sk = h.skills[s];
    const parts = nameParts(SKILLS[sk.id], sk.front, sk.behind);
    const scale = namePartsWidth(parts, 3) <= W - 16 ? 3 : namePartsWidth(parts, 2) <= W - 16 ? 2 : 1;
    const k = st.flash.t;
    // (a name too long for the screen even in the ordinary letters goes on two lines)
    const bandH = (9 * scale + 1) * nameLines(parts, W - 16, scale).length + 9;
    const by = Math.max(top, Math.min(H - bandH - 2, (rowY[s] ?? pageY) + Math.floor(TH / 2) - Math.floor(bandH / 2)));
    g.globalAlpha = k < 0.8 ? 0.94 : Math.max(0, 0.94 * (1 - (k - 0.8) / 0.3));
    g.fillStyle = k < 0.12 ? P.white : THEME.slot;
    g.fillRect(0, by, W, bandH);
    g.fillStyle = WORD_COLOR[st.flash.word];
    g.fillRect(0, by, W, 2);
    g.fillRect(0, by + bandH - 2, W, 2);
    if (k >= 0.12) drawNameLines(g, parts, Math.floor(W / 2), by + 5 + Math.round(Math.max(0, 0.25 - k) * 20), W - 16, scale, true);
    g.globalAlpha = 1;
  }

  const closeLit = !!coach && coach.done && blink;
  // (pink is the one thing to press: where the service has it, ENTER DUNGEON, DONE is an ordinary button)
  ui.drawButton(doneR.x, doneR.y, doneR.w, doneR.h, 'DONE', { primary: !(side && side.primary), lit: closeLit });
  if (coach && coach.done && !st.flash) arrow(g, doneR.x - 3, doneR.y + Math.floor(doneR.h / 2), t, THEME.accent, 'right');

  // with a mouse: the card of the piece under the pointer
  if (tipR && tipCard) {
    ui.panel(tipR.x, tipR.y, tipR.w, tipR.h);
    let y = tipR.y + 4;
    for (const r of tipCard.rows) {
      drawText(g, r.text, tipR.x + 5, y, r.color, { font: r.small ? 'small' : 'normal' });
      y += r.small ? 7 : 9;
    }
  }

  // a new player's first word: a ghost of it slides from the pouch to the slot, to show the drag
  if (first && coach && !hand && !st.pending && !dragAt) {
    const from = pouch.find((c) => c.w === coach.word);
    const to = slots.find((c) => sameSlot(c.ref, coach.to));
    if (from && to) {
      const k = (t * 0.55) % 1;
      const go = k < 0.15 ? 0 : k > 0.75 ? 1 : (k - 0.15) / 0.6;
      const e = go * go * (3 - 2 * go);
      const tw = tileWidth(coach.word, 'name');
      const gx = Math.round(from.r.x + (to.r.x + Math.floor((to.r.w - tw) / 2) - from.r.x) * e);
      const gy = Math.round(from.r.y + (to.r.y - from.r.y) * e);
      drawWordTile(ui, art, gx, gy, tw, TH, coach.word, 'name', { lit: true, edge: THEME.accent, alpha: k > 0.9 ? Math.max(0, (1 - k) / 0.1) * 0.7 : 0.7 });
      // the finger that carries it
      g.globalAlpha = 0.9;
      g.fillStyle = P.white;
      g.fillRect(gx + Math.floor(tw / 2) - 3, gy + TH - 4, 6, 4);
      g.fillRect(gx + Math.floor(tw / 2) - 2, gy + TH - 5, 4, 6);
      g.globalAlpha = 1;
    }
  }

  // the word being dragged follows the finger
  if (dragAt && st.drag) {
    const w = st.drag.word;
    const form = over && over.kind === 'slot' ? over.ref.side : 'name';
    const tw = tileWidth(w, form);
    // over a slot it may go in, the word is shown sitting in the slot (drawn there, above). A mouse
    // needs nothing more; a finger hides the slot, so the word also floats clear above the finger.
    const snapped = !!over && over.kind === 'slot' && problem(w, over) === null;
    if (!snapped) drawWordTile(ui, art, Math.round(dragAt.x - tw / 2), Math.round(dragAt.y - TH - 4), tw, TH, w, form, { lit: true, edge: THEME.accent, alpha: 0.95 });
    else if (T) drawWordTile(ui, art, Math.round(dragAt.x - tw / 2), Math.round(dragAt.y - TH - Math.floor(TH / 2) - 6), tw, TH, w, form, { lit: true, edge: THEME.accent, alpha: 0.95 });
  }
  // and so does a piece of gear (a finger hides what is under it: the piece floats above the finger)
  if (carryAt && carried) {
    const icon = art.icons.item[carried.icon];
    const cx = Math.round(carryAt.x - CELL / 2);
    const cyy = Math.round(carryAt.y - (T ? CELL + 8 : CELL / 2));
    g.globalAlpha = 0.95;
    ui.slot(cx, cyy, CELL, icon, RARITY_COLOR[carried.rarity], true);
    g.globalAlpha = 1;
  }
  // (and whatever is being carried out of the service's half)
  if (side && side.drawOver) side.drawOver();

  if (nextPage !== page) st.page = nextPage;
  return close;
}

// ---------------------------------------------------------------------------------------------
// The STATS page

/** One number with its name: the name in small letters on the left, the number on the right. */
function statRow(g: CanvasRenderingContext2D, label: string, value: string, x: number, y: number, w: number, color: string = THEME.dim): void {
  drawText(g, label, x, y + 2, color, { font: 'small' });
  drawText(g, value, x + w, y, P.white, { align: 'right' });
}

/**
 * The numbers of the character: the attributes and the level across the top (how far to the
 * next level as a bar under them); then, side by side, the defences and the attack.
 * (Until the inventory took half the screen each attribute also said here what a point of it
 * gives. That is said where it is decided: on the choice at each level.)
 */
function drawStats(ui: Ui, game: Game, r: Rect): void {
  const g = ui.g;
  const h = game.hero;
  const d = h.d;
  const mana = game.meta.limit === 'mana';
  // the attributes, and the level: each a name over a number
  const cells: { label: string; value: string; color: string }[] = ATTRS.map((a) => ({ label: ATTR_NAME[a].toUpperCase(), value: `${d[a]}`, color: ATTR_COLOR[a] }));
  cells.push({ label: 'LEVEL', value: `${h.level}`, color: THEME.dim });
  const widths = cells.map((c) => Math.max(textWidth(c.label, 'small'), textWidth(c.value)));
  const air = Math.max(4, Math.floor((r.w - widths.reduce((a, b) => a + b, 0)) / (cells.length - 1)));
  let x = r.x;
  cells.forEach((c, i) => {
    drawText(g, c.label, x, r.y + 1, c.color, { font: 'small' });
    drawText(g, c.value, x, r.y + 8, P.white);
    ui.mark(`stat:${c.label.toLowerCase()}`, x, r.y, widths[i], 17);
    x += widths[i] + air;
  });
  // (how far to the next level)
  const frac = Math.max(0, Math.min(1, h.xp / Math.max(1, xpToNext(h.level))));
  g.fillStyle = THEME.slot;
  g.fillRect(r.x, r.y + 19, r.w, 1.5);
  g.fillStyle = THEME.accent;
  g.fillRect(r.x, r.y + 19, Math.round(r.w * frac), 1.5);

  const stop = Math.round(armorReduction(d.armor, Math.max(1, game.depth)) * 100);
  const defence: [string, string][] = [
    ['LIFE', `${Math.ceil(h.life)} / ${d.maxLife}`],
    ['LIFE A SECOND', d.lifeRegen.toFixed(1)],
    // (and how much of a blow it stops, in the dungeon the hero is in)
    ['ARMOUR', d.armor > 0 ? `${Math.round(d.armor)} (${stop}%)` : '0'],
    ['FIRE RESIST', `${Math.round(d.resFire)}%`],
    ['FROST RESIST', `${Math.round(d.resFrost)}%`],
    ['LIGHTNING RESIST', `${Math.round(d.resLight)}%`],
    ['FLASKS', `${h.potions}`],
  ];
  const attack: [string, string][] = [
    ['WEAPON DAMAGE', `${Math.round(d.dmgMin)}-${Math.round(d.dmgMax)}`],
    ['ATTACKS A SECOND', d.aps.toFixed(2)],
    ['CRITICAL CHANCE', `${d.critChance.toFixed(1)}%`],
    ['CRITICAL DAMAGE', `+${Math.round(d.critMult)}%`],
  ];
  if (mana) attack.push(['MANA', `${Math.floor(h.mana)} / ${d.maxMana}`], ['MANA A SECOND', d.manaRegen.toFixed(1)]);
  if (d.cdr > 0) attack.push([mana ? 'MANA COST' : 'COOLDOWNS', `-${Math.round(d.cdr * 100)}%`]);
  if (d.area !== 1) attack.push(['AREA', `+${Math.round((d.area - 1) * 100)}%`]);
  if (d.stats.moveSpeed !== 0) attack.push(['MOVE SPEED', `+${Math.round(d.stats.moveSpeed)}%`]);
  const gutter = 10;
  const colW = Math.floor((r.w - gutter) / 2);
  const top = r.y + 25;
  const end = r.y + r.h;
  // (the rows are as far apart as the room allows: nine pixels at the least, eleven at the most)
  const most = Math.max(defence.length, attack.length);
  const pitch = Math.max(9, Math.min(11, Math.floor((end - top - 9) / most)));
  [
    { title: 'DEFENCE', rows: defence },
    { title: 'ATTACK', rows: attack },
  ].forEach((b, i) => {
    const bx = r.x + i * (colW + gutter);
    let y = top;
    drawText(g, b.title, bx, y, THEME.accent, { font: 'small' });
    g.fillStyle = THEME.edge;
    g.fillRect(bx, y + 6.5, colW, 0.5);
    y += 9;
    for (const [label, value] of b.rows) {
      if (y + 8 > end) break;
      statRow(g, label, value, bx, y, colW);
      y += pitch;
    }
  });
}

/**
 * Beside the hero on the GEAR page: the numbers that a piece of gear changes, at a glance (put
 * a piece on and they are seen to move). As many as there is room for, the most telling first.
 */
function drawGlance(ui: Ui, game: Game, r: Rect): void {
  const g = ui.g;
  const d = game.hero.d;
  if (r.w < 60) return;
  const rows: [string, string][] = [
    ['LIFE', `${d.maxLife}`],
    ['ARMOUR', `${Math.round(d.armor)}`],
    ['DAMAGE', `${Math.round(d.dmgMin)}-${Math.round(d.dmgMax)}`],
    ['A SECOND', d.aps.toFixed(2)],
    ['CRITICAL', `${d.critChance.toFixed(1)}%`],
    ['FIRE', `${Math.round(d.resFire)}%`],
    ['FROST', `${Math.round(d.resFrost)}%`],
    ['LIGHTNING', `${Math.round(d.resLight)}%`],
  ];
  const pitch = Math.max(9, Math.min(12, Math.floor(r.h / rows.length)));
  let y = r.y + Math.max(0, Math.floor((r.h - (rows.length - 1) * pitch - 8) / 2));
  for (const [label, value] of rows) {
    if (y + 8 > r.y + r.h) break;
    statRow(g, label, value, r.x, y, r.w);
    y += pitch;
  }
  ui.mark('glance', r.x, r.y, r.w, r.h);
}
