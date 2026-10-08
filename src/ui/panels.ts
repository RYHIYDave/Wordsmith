// The screens and panels: the starting screen (menu, class select, options), the level-up choice,
// pause and death, and the pieces the other panels share (item cards). Each one tests its presses
// top-most first, then draws. (Words, attacks and gear have a screen of their own: inventory.ts.)

import { WORD_COLOR } from '../art/icons';
import { P, RARITY_COLOR } from '../art/palette';
import { drawText, wrapText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { ATTR_GIVES, ATTR_NAME, CLASSES, SKILLS, TUNE, WORDS, holdSkill, skillsFor, tapSkill } from '../game/defs';
import type { Limit } from '../game/defs';
import type { Game } from '../game/game';
import type { AimMode, Station, VendorId } from '../game/state';
import { ITEM_ROOM, itemRoom, modLines } from '../game/items';
import type { TitleArt } from '../art/title';
import { TITLE_MARKS, titleRound } from '../art/title';
import type { Smith2Title } from '../art/title_smith2';
import { ATTRS, CLASS_IDS, RARITY_NAMES, WORD_IDS } from '../game/types';
import type { Attr, ClassId, EquipSlot, Item, VoiceId, WordId } from '../game/types';
import { attacksGrownBy, listed, skillName, weaponLines } from '../game/words';
import { Figure } from '../render/figure';
import type { Art } from '../render/render';
import { THEME } from './ui';
import type { Rect, Ui } from './ui';

export type Sel = { kind: 'bag'; i: number } | { kind: 'gear'; slot: EquipSlot };

export interface Panels {
  /** The inventory (words, attacks and gear), a choice, the pause menu, the dungeon map, or one of the town's services. */
  /** (Both vendors have the one screen, 'vendor': which of them it is, is the game's `vendor`.) */
  open: 'none' | 'inv' | 'level' | 'pause' | 'map' | 'vendor' | Exclude<Station, VendorId>;
  sel: Sel | null;
  /** At one of the town's services: the thing of its own that is picked (a cell's name), and the word picked at the wordsmith. */
  pick: string | null;
  pick2: WordId | null;
  /** A press on a piece of the service's own that may turn into a drag. `was`: it was already picked when pressed. */
  carry: { id: string; x0: number; y0: number; moving: boolean; was: boolean } | null;
  /** A short feedback line ("Needs level 5") and how long it stays. */
  note: string;
  noteT: number;
}

export function newPanels(): Panels {
  return { open: 'none', sel: null, pick: null, pick2: null, carry: null, note: '', noteT: 0 };
}

export interface Line {
  text: string;
  color: string;
  small?: boolean;
}

export interface CardButton {
  label: string;
  disabled: boolean;
  act: () => string | null | void;
}

export const ATTR_COLOR: Record<Attr, string> = { str: P.bl4, dex: P.gn4, int: P.bu4 };
export const SLOT_LABEL: Record<EquipSlot, string> = {
  mainhand: 'Main hand', offhand: 'Off hand', helm: 'Helmet', chest: 'Chest', gloves: 'Gloves', belt: 'Belt', boots: 'Boots', amulet: 'Amulet', ring1: 'Ring', ring2: 'Ring',
};
/** Where each equipment slot sits in the 3x4 doll grid. */
export const DOLL: Record<EquipSlot, [number, number]> = {
  helm: [1, 0], amulet: [2, 0], mainhand: [0, 1], chest: [1, 1], offhand: [2, 1], gloves: [0, 2], belt: [1, 2], ring1: [2, 2], boots: [1, 3], ring2: [2, 3],
};
export const CELL = 20;
export const PITCH = 22;
export const CARD_W = 150;

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** A piece of gear, read: its lines, one under another. (It says what the piece IS and nothing about whether it is better than another: see the end.) */
export function itemCard(game: Game, it: Item, touch = false): Line[] {
  const h = game.hero;
  const lines: Line[] = [{ text: it.name, color: RARITY_COLOR[it.rarity] }];
  let kind = cap(it.slot);
  if (it.slot === 'mainhand') {
    const light = it.hands === 1 || it.weapon === 'bow';
    kind = `${light ? 'Light' : 'Heavy'} weapon`;
  } else if (it.slot === 'offhand' && it.offhand) kind = cap(it.offhand);
  lines.push({ text: `${RARITY_NAMES[it.rarity]} ${kind}${it.name !== it.baseName ? ' - ' + it.baseName : ''}`, color: THEME.dim, small: true });
  const rest = it.implicit.filter((m) => !(it.slot === 'mainhand' && (m.stat === 'dmgMin' || m.stat === 'dmgMax')));
  if (it.slot === 'mainhand') {
    const lo = it.implicit.find((m) => m.stat === 'dmgMin');
    const hi = it.implicit.find((m) => m.stat === 'dmgMax');
    if (lo && hi) lines.push({ text: `${lo.value}-${hi.value} damage, ${it.aps.toFixed(2)} a second`, color: THEME.text });
  }
  const limit = game.meta.limit;
  for (const l of modLines(rest, limit)) lines.push({ text: l, color: THEME.text });
  for (const a of it.affixes) for (const l of modLines(a.mods, limit)) lines.push({ text: l, color: THEME.magic });
  for (const im of it.imbues) for (const l of modLines(im.mods, limit)) lines.push({ text: `${WORDS[im.word].name}: ${l}`, color: WORD_COLOR[im.word] });
  // how many more words it will take (the owner: "All items have room for 4 mods. White starts with 0, blue 1-2, yellow 3-4")
  const room = itemRoom(it);
  lines.push({ text: room > 0 ? `Room for ${room} ${room === 1 ? 'word' : 'words'}` : 'No room for words', color: room > 0 ? THEME.dim : THEME.faint, small: true });
  // what the weapon gives whoever holds it: its two attacks, and the attribute they grow with
  // (gold when they are not the attacks in hand: this weapon would change them)
  if (it.weapon) {
    const same = tapSkill(it.weapon) === h.skills[0].id && holdSkill(it.weapon) === h.skills[1].id;
    for (const text of weaponLines(it.weapon, touch)) lines.push({ text, color: same ? THEME.dim : THEME.accent, small: true });
  }
  else if (it.offhand) lines.push({ text: it.offhand === 'shield' ? 'Goes with a one-handed sword' : it.offhand === 'quiver' ? 'Goes with a bow' : 'Goes with a wand', color: THEME.dim, small: true });
  if (it.reqLevel > 1) lines.push({ text: `Needs level ${it.reqLevel}`, color: it.reqLevel <= h.level ? THEME.dim : THEME.bad, small: true });
  // (No verdict on it. Until 5 Oct 2026 a last line said whether it looked stronger or weaker than
  // the piece worn. The owner, 22:02: 'cut the line at the bottom that says "this piece is better".
  // We'll leave that to the player to decide'. COMPARE on its card brings the worn piece up beside
  // it: ui/inventory.ts.)
  return lines;
}

/**
 * The four places a piece has for properties, as pips along the bottom of its cell: a pale blue
 * one for each property it was found with, one in the word's colour for each word burned into
 * it, and a dim one for each place still free. So a piece that will take a word shows it, in
 * the bag, on the hero, at the vendor's and in the stash, without being read.
 */
export function drawItemPips(g: CanvasRenderingContext2D, it: Item, x: number, y: number): void {
  const lit: string[] = [];
  for (let i = 0; i < it.affixes.length; i++) lit.push(THEME.magic);
  for (const im of it.imbues) lit.push(WORD_COLOR[im.word] ?? THEME.text);
  const w = 3;
  const total = ITEM_ROOM * (w + 1) - 1;
  let px = x + Math.floor((CELL - total) / 2);
  for (let i = 0; i < ITEM_ROOM; i++) {
    g.fillStyle = lit[i] ?? THEME.edge;
    g.fillRect(px, y + CELL - 2.5, w, 1.5);
    px += w + 1;
  }
}

export function wordCard(w: WordId): Line[] {
  const d = WORDS[w];
  return [
    { text: d.name, color: WORD_COLOR[w] },
    { text: `Power word - grows with ${ATTR_NAME[d.attr]}`, color: THEME.dim, small: true },
    { text: `In front: ${d.frontText}`, color: THEME.text },
    { text: `Behind: ${d.behindText}`, color: THEME.text },
  ];
}

/** Lay out a card's text and return its size. */
export function measureCard(lines: Line[], buttons: number, bh: number): { rows: { text: string; color: string; small: boolean }[]; h: number } {
  const rows: { text: string; color: string; small: boolean }[] = [];
  let h = 5;
  for (const l of lines) {
    for (const part of wrapText(l.text, CARD_W - 10, l.small ? 'small' : 'normal')) {
      rows.push({ text: part, color: l.color, small: !!l.small });
      h += l.small ? 7 : 9;
    }
  }
  if (buttons > 0) h += Math.ceil(buttons / 2) * (bh + 2) + 3;
  return { rows, h: h + 3 };
}

export function placeCard(ui: Ui, anchor: Rect, h: number): Rect {
  let x = anchor.x + anchor.w + 3;
  if (x + CARD_W > ui.w - 2) x = anchor.x - CARD_W - 3;
  if (x < 2) x = Math.max(2, Math.min(ui.w - CARD_W - 2, anchor.x));
  let y = Math.max(2, Math.min(ui.h - h - 2, anchor.y - 4));
  // if it had to sit on top of its own anchor, move it below or above instead
  if (x < anchor.x + anchor.w && anchor.x < x + CARD_W && y < anchor.y + anchor.h && anchor.y < y + h) {
    y = anchor.y + anchor.h + 2 + h <= ui.h ? anchor.y + anchor.h + 2 : Math.max(2, anchor.y - h - 2);
  }
  return { x, y, w: CARD_W, h };
}

export function buttonRects(card: Rect, n: number, bh: number): Rect[] {
  const out: Rect[] = [];
  const bw = Math.floor((card.w - 12) / 2);
  const rows = Math.ceil(n / 2);
  const top = card.y + card.h - 3 - rows * (bh + 2);
  for (let i = 0; i < n; i++) out.push({ x: card.x + 5 + (i % 2) * (bw + 2), y: top + Math.floor(i / 2) * (bh + 2), w: n === 1 ? card.w - 10 : bw, h: bh });
  return out;
}

// =============================================================================================
// Level-up choice

/**
 * `armed` is false for the first moment after the choice appears. It can pop up by itself while
 * the player is mid-press, and a press that was meant for the game must not pick an attribute.
 */
export function drawLevelUp(ui: Ui, game: Game, pressedKey: (code: string) => boolean, armed: boolean): void {
  const h = game.hero;
  const cw = Math.min(104, Math.floor((ui.w - 20) / 3));
  const ch = 96;
  const total = cw * 3 + 8;
  const x0 = Math.floor((ui.w - total) / 2);
  const y0 = Math.max(16, Math.floor((ui.h - ch) / 2));
  let pick: Attr | null = null;
  ATTRS.forEach((a, i) => {
    if (armed && (ui.pressIn(x0 + i * (cw + 4), y0, cw, ch) || pressedKey(`Digit${i + 1}`))) pick = a;
  });
  ui.shade(0.6);
  drawText(ui.g, `Level ${h.level - h.pending + 1}: choose one`, Math.floor(ui.w / 2), y0 - 12, THEME.accent, { align: 'center', shadow: P.ink });
  const c = CLASSES[h.cls];
  ATTRS.forEach((a, i) => {
    const x = x0 + i * (cw + 4);
    const hot = ui.hover(x, y0, cw, ch);
    ui.box(x, y0, cw, ch, hot ? THEME.hot : THEME.bg, hot ? THEME.accent : ATTR_COLOR[a]);
    ui.claim(x, y0, cw, ch);
    ui.mark(`attr:${a}`, x, y0, cw, ch);
    ui.text(ATTR_NAME[a], x + Math.floor(cw / 2), y0 + 5, ATTR_COLOR[a], 'center');
    // (what a level gives: TUNE.attrPerLevel points of the attribute picked)
    const n = TUNE.attrPerLevel;
    ui.text(`${h.d[a]} + ${n}`, x + Math.floor(cw / 2), y0 + 15, THEME.text, 'center');
    const lines: string[] = [];
    if (a === 'str') lines.push(`+${n * ATTR_GIVES.strLife} life`);
    if (a === 'dex') lines.push(`+${n * ATTR_GIVES.dexSpeed}% attack speed`, `+${(n * ATTR_GIVES.dexCrit).toFixed(1)}% critical chance`);
    // (what Intelligence gives depends on what limits the abilities: there is no mana with cooldowns, and no cooldown with mana)
    if (a === 'int' && game.meta.limit === 'mana') lines.push(`+${n * ATTR_GIVES.intMana} mana`, `-${(n * ATTR_GIVES.intCdr).toFixed(2)}% mana cost`);
    else if (a === 'int') lines.push(`+${(n * ATTR_GIVES.intCdr).toFixed(2)}% faster cooldowns`);
    // (the two attacks grow with their weapon's attribute, the evasive move with the class's)
    const grown = attacksGrownBy(a, h.cls, game.weapon());
    if (grown.length) lines.push(`+${n * ATTR_GIVES.primaryDmg}% ${listed(grown)} damage`);
    const words = WORD_IDS.filter((w) => WORDS[w].attr === a).map((w) => WORDS[w].name);
    lines.push(`Strengthens ${words.join(', ')}`);
    let y = y0 + 28;
    for (const l of lines) {
      for (const part of wrapText(l, cw - 8, 'small')) {
        ui.text(part, x + 4, y, THEME.text, 'left', true);
        y += 6;
      }
      y += 3;
    }
    if (!ui.touch) ui.text(`${i + 1}`, x + cw - 4, y0 + ch - 8, THEME.dim, 'right', true);
  });
  if (pick) game.chooseAttr(pick);
}

// =============================================================================================
// The starting screen
//
// The owner: "small kid from behind standing in front of a large desk and looking up at a very
// large librarian looming over him, it fades back and forth from normal looking to a small knight
// standing in front of a large cauldron looking up at a very large witch looming over him.
// continue is available, new game, a lexicon ..., and options i guess."

export interface TitleUi {
  /** The menu, the class cards (after New Game, or for the practice room), or the options. */
  page: 'menu' | 'class' | 'options';
  /** The class cards were opened for the practice room. */
  practice: boolean;
}

export function newTitleUi(): TitleUi {
  return { page: 'menu', practice: false };
}

export interface TitleOut {
  /** A class was picked: start a new character (or the practice room, if `TitleUi.practice`). */
  pick: ClassId | null;
  /** Continue was pressed. */
  resume: boolean;
  /** The Lexicon was asked for. */
  lexicon: boolean;
  /** Options: the sideways/upright switch, sound, how the slow abilities are limited, the first dungeon's prompts. */
  turn: boolean;
  mute: boolean;
  limit: boolean;
  guide: boolean;
  /** Options: the switch between attacks that go the way the hero faces and attacks that go where the thumb lands. */
  aim: boolean;
  /** The class cards' voice switch was pressed. */
  voice: boolean;
}

export interface TitleIn {
  /** Label of the sideways/upright switch, or null where that choice does not apply. */
  turn: string | null;
  /** What Continue would carry on with ("Warrior, level 3, dungeon 2"), or null when there is no saved run. */
  resume: string | null;
  /** A line of warning on the class cards, or null. */
  note: string | null;
  /** The first dungeon's prompts are switched on: a new character begins in the dungeon, and is shown how to play. */
  guide: boolean;
  /** How the slow abilities are limited. */
  limit: Limit;
  /** Touch: where attacks go (null with a mouse, which aims with its pointer: the switch is not shown). */
  aim: AimMode | null;
  muted: boolean;
  /** The voice the next character will speak with, and the class whose voice is being tried out just now (or null). */
  voice: VoiceId;
  speaking: ClassId | null;
  /**
   * A hero has been picked and is MAKING READY on their card before the run begins: who, and for
   * how long (seconds). They draw their weapon and stand as they fight, then warp away; the other
   * two stand back; nothing on the cards can be pressed. Null when no one is. (See `enterLength`.)
   */
  entering?: { cls: ClassId; t: number } | null;
}

/** How long a hero who has made ready on their card takes to warp away from it, in seconds. */
export const ENTER_OUT = 0.4;

/**
 * How long the hero of a class takes to make ready on their card and warp away, in seconds: the
 * picture their art has for making ready (`clips.ready`) and ENTER_OUT. NOTHING (0) where the art
 * has no such picture: then a run begins the moment a card is pressed, as it always did.
 */
export function enterLength(art: Art, cls: ClassId): number {
  const ready = art.heroes.of(cls, { twoHanded: CLASSES[cls].starts === 'greatsword', town: true, card: true }).front.clips?.ready;
  return ready ? (ready.frames.length - 1) / ready.fps + ENTER_OUT : 0;
}

/**
 * The picture, in a plain frame: the library turning into the dream and back (the librarian into
 * the witch, the desk into the cauldron, the child into the knight), with the small life of
 * whichever picture is showing drawn over it.
 */
function drawPlate(g: CanvasRenderingContext2D, pic: TitleArt, x: number, y: number, t: number, dim = 1): void {
  // (where the picture is in its round: how far it has turned toward the dream, which way it is
  // going, and how long until its next change begins)
  const { k, back, lead } = titleRound(t);
  g.fillStyle = THEME.edge;
  g.fillRect(x - 2, y - 2, pic.w + 4, pic.h + 4);
  g.fillStyle = P.ink;
  g.fillRect(x - 1, y - 1, pic.w + 2, pic.h + 2);
  g.drawImage(pic.morph(k, back), x, y);
  // the life: bubbles on the brew, steam, the flames, her burning eyes; the lamp, the dust in its light
  const life = pic.life(t, k);
  if (life) g.drawImage(life, x, y);
  // A glint, as a change is about to begin: her lenses catch the light just before she turns, and
  // the witch's eyes flare before she shrinks back. A thin four-pointed star on each: it flashes
  // out a quarter of a second before the change, and dies back over the first third of a second
  // of it, which is when the change itself reaches her eyes. (The glint there was before was a
  // white block on the white of the lens, and could not be seen.)
  const flash = 0.25 - lead;
  if (flash > 0 && flash < 0.6) {
    const arm = flash < 0.06 ? 4 : flash < 0.16 ? 6 : flash < 0.24 ? 7 : flash < 0.36 ? 6 : flash < 0.48 ? 5 : 4;
    g.fillStyle = back ? P.fr6 : P.white;
    for (const [ex, ey] of back ? TITLE_MARKS.eye : TITLE_MARKS.lens) {
      g.fillRect(x + ex - arm, y + ey, 2 * arm + 1, 1);
      g.fillRect(x + ex, y + ey - arm, 1, 2 * arm + 1);
    }
  }
  if (dim < 1) {
    g.globalAlpha = 1 - dim;
    g.fillStyle = P.black;
    g.fillRect(x - 2, y - 2, pic.w + 4, pic.h + 4);
    g.globalAlpha = 1;
  }
}

/**
 * The three figures on the class cards. Each stands in its loop, with its scarf or feather in the
 * wind, and every so often does one of the things its class does when left standing: one after
 * another, never all three at once. (The owner: "This will look really good in the character
 * selection screen".)
 */
const cardFigures = new Map<ClassId, Figure>();
let cardsSeen = -10;

/** The dark the wordsmith's picture sinks into at its edges: a screen bigger than the picture is filled with it. */
const SMITH_NIGHT = '#05040f';
/**
 * The picture behind the wordsmith's start screen, as the screen needs to know it: either of the
 * two painters gives one (art/title_smith.ts, the first, a bust behind his table; art/title_smith2.ts,
 * the one the owner chose, seen from the floor). `lip` is the row of the table's edge, `lift` how
 * far above the bottom of the screen the picture wants that row, `headTop` the row of the top of
 * his head.
 */
export type SmithPicture = Smith2Title;
/** The least the table's edge may be above the bottom of the screen: a row of buttons, flush under it. */
const SMITH_LEAST = 26;
/** Held upright, how far under the table's front edge the first button hangs: the band of runes, then a line of small writing (what an option means; who Continue carries on with). */
export const SMITH_UNDER = 24;
/** The most buttons there can be in a column: the options, on a phone held upright (sound, abilities, attacks, prompts, practice room, sideways, back). */
export const SMITH_MOST = 7;
/** How near his head the name of the game is kept, on a screen with a great deal of room above him. */
const SMITH_NAME_GAP = 24;

export interface SmithLayout {
  /** How far above the bottom of the screen the table's front edge is. */
  lift: number;
  /** The screen row of the picture's top row (it may be above the screen). */
  oy: number;
  /** Buttons to a row, and each one's place, in the order they were asked for. */
  per: number;
  rects: Rect[];
  /** The top of the first row of buttons. */
  rowsTop: number;
  /** The name of the game: how many times its size, and its top row. */
  big: number;
  nameY: number;
}

/**
 * Where the wordsmith's start screen puts things on a screen of W x H game pixels: the picture,
 * the name, and `count` buttons (the menu's, or else the options'). `nameW` is the width of the
 * name of the game at its plain size. It is worked out apart from the drawing so that it can be
 * held to its rules without a screen (tests/smithmenu.test.ts); what the rules are is told at
 * drawSmithMenu.
 */
export function smithLayout(W: number, H: number, menuPage: boolean, count: number, nameW: number, pic: { lip: number; lift: number; headTop: number }): SmithLayout {
  // (a row wants a screen that is wide, or at least a good deal wider than it is tall: a small
  // phone held sideways is 379 x 214)
  const wide = W >= 400 || W >= H * 1.3;
  const gap = 4;
  const bh = wide ? 22 : 24;
  const rowsH = (n: number): number => n * bh + (n - 1) * gap;
  // What he needs above the table's edge: himself, and the name at its smaller size over his
  // head. A screen too short for that and the usual lift puts the table lower (the buttons then
  // cover the runes along its edge), and at the very shortest the name is on the crown of his head.
  const headRoom = pic.lip - pic.headTop + 9 * 2 + 6;
  const least = SMITH_LEAST;
  let lift = Math.max(least, Math.min(pic.lift, H - headRoom));
  // a row along the bottom; the options, which are more, in rows of four
  let per = menuPage ? count : Math.min(4, count);
  let bw = Math.min(132, Math.floor((W - 12 - (per - 1) * gap) / per));
  if (!wide) {
    // held upright: a column under the table, or two to a row where a column is too long
    lift = Math.max(least, Math.min(SMITH_UNDER + rowsH(SMITH_MOST) + 6, H - headRoom));
    per = rowsH(count) <= lift - SMITH_UNDER - 6 ? 1 : 2;
    bw = per === 1 ? Math.min(W - 24, 220) : Math.floor((W - 12 - gap) / 2);
  }
  const rows = Math.ceil(count / per);
  const rowsTop = wide ? H - 3 - rowsH(rows) : Math.min(H - lift + SMITH_UNDER, H - 6 - rowsH(rows));
  const rects: Rect[] = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / per);
    const inRow = Math.min(per, count - row * per);
    const x0 = Math.floor((W - inRow * bw - (inRow - 1) * gap) / 2);
    rects.push({ x: x0 + (i - row * per) * (bw + gap), y: rowsTop + row * (bh + gap), w: bw, h: bh });
  }
  const oy = H - lift - pic.lip;
  // the name of the game, over his head, as big as there is room for: half way up what is above
  // him; but a tall screen has a great deal above him, and there the name stays near his head
  // instead of drifting off into the dark
  const headTop = oy + pic.headTop;
  const big = nameW * 3 <= W - 12 && headTop >= 9 * 3 + 1 ? 3 : 2;
  const nameY = Math.max(3, Math.floor((headTop - 9 * big) / 2), headTop - 9 * big - SMITH_NAME_GAP);
  return { lift, oy, per, rects, rowsTop, big, nameY };
}

/**
 * THE START SCREEN AS THE OWNER ASKED FOR IT ON 5 OCT 2026 (18:09): "just the wordsmith ... At
 * his forge table, same angle from below looking up ... the full screen with the menus along the
 * bottom". The picture (art/title_smith.ts) fills the screen: its middle column is the screen's,
 * and the front edge of the table is the picture's own `lift` above the bottom, where the buttons are, in a
 * row. The name of the game is over his head. The options are the same buttons in rows of four.
 *
 * Held upright there is no room for a row: the buttons are a column that hangs under the table.
 * The table's edge is put where the LONGEST column there is (the options, SMITH_MOST of them)
 * fits under it, and it stays there on every page: the picture must not jump when OPTIONS is
 * pressed, and no button may stand on his chest. (As it was first laid out, the table sat low for
 * the menu's four buttons, a third of the screen above him was empty with the name adrift in it,
 * and the seven options climbed over his hands to his beard.) A window too short for all that
 * keeps his head and the name on the screen, and puts the buttons two to a row.
 *
 * Returns true if this was the page drawn (the class cards are drawn by the caller, over the
 * picture, dimmed).
 */
function drawSmithMenu(ui: Ui, smith: SmithPicture, t: number, title: string, st: TitleUi, opt: TitleIn, out: TitleOut): boolean {
  const g = ui.g;
  const W = ui.w;
  const H = ui.h;
  const menuPage = st.page === 'menu' || st.page === 'options';
  const menu: { id: string; label: string; sub: string; lit: boolean; primary?: boolean }[] = st.page === 'menu'
    ? [
        ...(opt.resume ? [{ id: 'resume', label: 'CONTINUE', sub: opt.resume, lit: true, primary: true }] : []),
        { id: 'new', label: 'NEW GAME', sub: '', lit: !opt.resume, primary: !opt.resume },
        { id: 'lexicon', label: 'LEXICON', sub: '', lit: false },
        { id: 'options', label: 'OPTIONS', sub: '', lit: false },
      ]
    : [
        { id: 'mute', label: opt.muted ? 'SOUND: OFF' : 'SOUND: ON', sub: '', lit: false },
        { id: 'limit', label: opt.limit === 'mana' ? 'ABILITIES: MANA' : 'ABILITIES: COOLDOWNS', sub: opt.limit === 'mana' ? 'No cooldowns: use them until you run dry' : 'No mana: each waits its turn', lit: false },
        ...(opt.aim ? [{ id: 'aim', label: aimLabel(opt.aim), sub: '', lit: false }] : []),
        { id: 'guide', label: opt.guide ? 'PROMPTS: ON' : 'PROMPTS: OFF', sub: '', lit: false },
        { id: 'practice', label: 'PRACTICE ROOM', sub: '', lit: false },
        ...(opt.turn ? [{ id: 'turn', label: opt.turn, sub: '', lit: false }] : []),
        { id: 'back', label: 'BACK', sub: '', lit: false },
      ];
  // --- where everything is ---
  const lay = smithLayout(W, H, st.page === 'menu', menu.length, ui.width(title), smith);
  const { lift, rowsTop, oy } = lay;
  const rects = menu.map((m, i) => ({ m, r: lay.rects[i] }));
  // --- the picture, and its life ---
  const ox = Math.floor((W - smith.w) / 2);
  g.drawImage(smith.still, ox, oy);
  g.drawImage(smith.life(t), ox, oy);
  if (!menuPage) return false;
  // (behind the options, which stand higher than the table's edge, the picture is put back a little)
  // (the dark comes on in three thin steps: a hard edge would cut straight across his hand)
  if (rowsTop < H - lift + 12) {
    g.fillStyle = SMITH_NIGHT;
    [0.15, 0.3, 0.45].forEach((a, i) => {
      g.globalAlpha = a;
      g.fillRect(0, rowsTop - 18 + i * 2, W, 2);
    });
    g.globalAlpha = 0.6;
    g.fillRect(0, rowsTop - 12, W, H - rowsTop + 12);
    g.globalAlpha = 1;
  }
  // --- the name of the game, over his head ---
  drawText(g, title, Math.floor(W / 2), lay.nameY, THEME.text, { align: 'center', scale: lay.big, shadow: THEME.call });
  // --- the buttons ---
  let pressed = '';
  for (const { m, r } of rects) if (ui.pressIn(r.x, r.y, r.w, r.h)) pressed = m.id;
  for (const { m, r } of rects) {
    ui.drawButton(r.x, r.y, r.w, r.h, m.label, { primary: m.primary, lit: m.lit && Math.floor(t * 2) % 2 === 0, small: ui.width(m.label) > r.w - 6 });
    // (the one line kept says WHICH character Continue carries on with: over its button, on the table's edge)
    if (m.sub && st.page === 'menu' && ui.width(m.sub, true) <= W - 8) {
      const sx = Math.max(4 + Math.ceil(ui.width(m.sub, true) / 2), Math.min(W - 4 - Math.ceil(ui.width(m.sub, true) / 2), r.x + Math.floor(r.w / 2)));
      drawText(g, m.sub, sx, r.y - 8, THEME.text, { align: 'center', font: 'small', shadow: P.black });
    }
  }
  // (what the abilities' switch means, in a line over the options)
  const hint = st.page === 'options' ? menu.find((m) => m.sub) : undefined;
  if (hint && ui.width(hint.sub, true) <= W - 8) drawText(g, hint.sub, Math.floor(W / 2), rowsTop - 9, THEME.dim, { align: 'center', font: 'small', shadow: P.black });
  if (pressed === 'resume') out.resume = true;
  else if (pressed === 'new') {
    st.page = 'class';
    st.practice = false;
  } else if (pressed === 'lexicon') out.lexicon = true;
  else if (pressed === 'options') st.page = 'options';
  else if (pressed === 'back') st.page = 'menu';
  else if (pressed === 'mute') out.mute = true;
  else if (pressed === 'limit') out.limit = true;
  else if (pressed === 'aim') out.aim = true;
  else if (pressed === 'guide') out.guide = true;
  else if (pressed === 'turn') out.turn = true;
  else if (pressed === 'practice') {
    st.page = 'class';
    st.practice = true;
  }
  return true;
}

/**
 * `smith`: the wordsmith's picture, if the start screen is to be his (see drawSmithMenu); without
 * it, the library and the dream in their frame, with the buttons beside them.
 */
export function drawTitle(ui: Ui, art: Art, pic: TitleArt, t: number, title: string, st: TitleUi, opt: TitleIn, smith: SmithPicture | null = null): TitleOut {
  const g = ui.g;
  const W = ui.w;
  const H = ui.h;
  const T = ui.touch;
  const out: TitleOut = { pick: null, resume: false, lexicon: false, turn: false, mute: false, limit: false, guide: false, aim: false, voice: false };
  g.fillStyle = smith ? SMITH_NIGHT : P.black;
  g.fillRect(0, 0, W, H);
  ui.claim(0, 0, W, H); // the whole starting screen is interface
  const wide = W >= 400;
  const big = W >= 380 ? 3 : 2;
  const titleH = 9 * big + 6;

  if (smith) {
    if (drawSmithMenu(ui, smith, t, title, st, opt, out)) return out;
    // (the class cards are laid over the picture, which is put back into the dark for them)
    g.globalAlpha = 0.74;
    g.fillStyle = SMITH_NIGHT;
    g.fillRect(0, 0, W, H);
    g.globalAlpha = 1;
  }

  if (st.page === 'menu' || st.page === 'options') {
    // ---- the picture, and beside it (or under it) the buttons ---------------------------------
    let bh = T ? 26 : 22;
    let gap = T ? 6 : 5;
    const menu: { id: string; label: string; sub: string; lit: boolean; primary?: boolean }[] = st.page === 'menu'
      ? [
          // (the owner: "I don't need to have a line under everything like 'new game' or 'lexicon'".
          // The one line kept says WHICH character Continue carries on with: that is not a description.)
          // (the one to press is the pink one: Continue if there is a character to go on with, else New Game)
          ...(opt.resume ? [{ id: 'resume', label: 'CONTINUE', sub: opt.resume, lit: true, primary: true }] : []),
          { id: 'new', label: 'NEW GAME', sub: '', lit: !opt.resume, primary: !opt.resume },
          { id: 'lexicon', label: 'LEXICON', sub: '', lit: false },
          { id: 'options', label: 'OPTIONS', sub: '', lit: false },
        ]
      : [
          { id: 'mute', label: opt.muted ? 'SOUND: OFF' : 'SOUND: ON', sub: '', lit: false },
          { id: 'limit', label: opt.limit === 'mana' ? 'ABILITIES: MANA' : 'ABILITIES: COOLDOWNS', sub: opt.limit === 'mana' ? 'No cooldowns: use them until you run dry' : 'No mana: each waits its turn', lit: false },
          // (the owner is trying a new way of aiming on a phone: this goes back to the old one)
          ...(opt.aim ? [{ id: 'aim', label: aimLabel(opt.aim), sub: '', lit: false }] : []),
          { id: 'guide', label: opt.guide ? 'PROMPTS: ON' : 'PROMPTS: OFF', sub: '', lit: false },
          { id: 'practice', label: 'PRACTICE ROOM', sub: '', lit: false },
          ...(opt.turn ? [{ id: 'turn', label: opt.turn, sub: '', lit: false }] : []),
          { id: 'back', label: 'BACK', sub: '', lit: false },
        ];
    const subH = (m: { sub: string }): number => (m.sub ? 7 : 0);
    const heightOf = (b: number, gp: number): number => menu.reduce((n, m) => n + b + subH(m) + gp, 0) - gp;
    // (the options have grown to seven on a phone: where they would not all fit under the title,
    // the buttons are made a little lower and set a little closer)
    const room = wide ? H - titleH - 6 : H - titleH - pic.h - 16;
    while (heightOf(bh, gap) > room && bh > 17) {
      bh--;
      if (gap > 3 && bh % 2 === 0) gap--;
    }
    const menuH = heightOf(bh, gap);
    const menuW = wide ? Math.min(190, W - pic.w - 40) : Math.min(W - 24, 220);
    const blockW = wide ? pic.w + 16 + menuW : Math.max(pic.w, menuW);
    const bx0 = Math.floor((W - blockW) / 2);
    const bodyH = wide ? Math.max(pic.h, menuH) : pic.h + 10 + menuH;
    const top = Math.max(titleH + 2, Math.floor((H - titleH - bodyH) / 2) + titleH);
    const picX = wide ? bx0 : Math.floor((W - pic.w) / 2);
    const picY = wide ? top + Math.floor((bodyH - pic.h) / 2) : top;
    const mx = wide ? bx0 + pic.w + 16 : Math.floor((W - menuW) / 2);
    let my = wide ? top + Math.floor((bodyH - menuH) / 2) : picY + pic.h + 10;
    const rects: { m: (typeof menu)[0]; r: Rect }[] = [];
    for (const m of menu) {
      rects.push({ m, r: { x: mx, y: my, w: menuW, h: bh } });
      my += bh + subH(m) + gap;
    }
    let pressed = '';
    for (const { m, r } of rects) if (ui.pressIn(r.x, r.y, r.w, r.h)) pressed = m.id;
    drawText(g, title, Math.floor(W / 2), Math.max(3, top - titleH), THEME.text, { align: 'center', scale: big, shadow: THEME.call });
    drawPlate(g, pic, picX, picY, t);
    for (const { m, r } of rects) {
      ui.drawButton(r.x, r.y, r.w, r.h, m.label, { primary: m.primary, lit: m.lit && Math.floor(t * 2) % 2 === 0 });
      if (m.sub) {
        const sub = ui.width(m.sub, true) <= W - 8 ? m.sub : '';
        drawText(g, sub, r.x + Math.floor(r.w / 2), r.y + bh + 1, THEME.dim, { align: 'center', font: 'small' });
      }
    }
    if (pressed === 'resume') out.resume = true;
    else if (pressed === 'new') {
      st.page = 'class';
      st.practice = false;
    } else if (pressed === 'lexicon') out.lexicon = true;
    else if (pressed === 'options') st.page = 'options';
    else if (pressed === 'back') st.page = 'menu';
    else if (pressed === 'mute') out.mute = true;
    else if (pressed === 'limit') out.limit = true;
    else if (pressed === 'aim') out.aim = true;
    else if (pressed === 'guide') out.guide = true;
    else if (pressed === 'turn') out.turn = true;
    else if (pressed === 'practice') {
      st.page = 'class';
      st.practice = true;
    }
    return out;
  }

  // ---- the class cards ---------------------------------------------------------------------------
  const cw = Math.min(104, Math.floor((W - 20) / 3));
  const ch = Math.min(137, H - 62);
  /** The room at the top of a card for the figure, drawn at twice its size in the game. */
  const figH = 80;
  const total = cw * 3 + 8;
  const x0 = Math.floor((W - total) / 2);
  const y0 = 44;
  // (a hero who has been picked is making ready: nothing here listens until they have gone)
  const entering = opt.entering ?? null;
  CLASS_IDS.forEach((id, i) => {
    if (!entering && ui.pressIn(x0 + i * (cw + 4), y0, cw, ch)) out.pick = id;
  });
  const backW = ui.width('BACK') + 20;
  const backR: Rect = { x: 4, y: H - 22, w: backW, h: 18 };
  if (!entering && ui.pressIn(backR.x, backR.y, backR.w, backR.h)) st.page = st.practice ? 'options' : 'menu';
  // the voice the character will speak with: pressing it changes it, and lets each of the three be heard
  const voiceLabel = `VOICE: ${opt.voice === 'female' ? 'FEMALE' : 'MALE'}`;
  const voiceW = Math.max(ui.width('VOICE: FEMALE'), ui.width('VOICE: MALE')) + 16;
  const voiceR: Rect = { x: W - 4 - voiceW, y: H - 22, w: voiceW, h: 18 };
  if (!entering && ui.pressIn(voiceR.x, voiceR.y, voiceR.w, voiceR.h)) out.voice = true;
  drawText(g, title, Math.floor(W / 2), 6, THEME.text, { align: 'center', scale: big, shadow: THEME.call });
  const pitch = st.practice ? 'Practice room: choose a class' : 'Choose a class';
  drawText(g, pitch, Math.floor(W / 2), 6 + 9 * big + 1, st.practice ? THEME.accent : THEME.text, { align: 'center', font: ui.width(pitch) <= W - 8 ? 'normal' : 'small' });
  // (how long since these cards were last drawn: a moment, unless they have just come on screen)
  const dt = t - cardsSeen > 0.5 || t < cardsSeen ? 0 : t - cardsSeen;
  const fresh = dt === 0;
  cardsSeen = t;
  CLASS_IDS.forEach((id, i) => {
    const c = CLASSES[id];
    const x = x0 + i * (cw + 4);
    // (the one who has been picked: see below. The other two stand back.)
    const mine = entering !== null && entering.cls === id;
    const hot = !entering && ui.hover(x, y0, cw, ch);
    // (the one whose voice is being tried out stands forward while they speak)
    const talks = opt.speaking === id || mine;
    ui.box(x, y0, cw, ch, hot || talks ? THEME.hot : THEME.bg, talks ? P.white : hot ? THEME.accent : ATTR_COLOR[c.primary]);
    ui.mark(`class:${id}`, x, y0, cw, ch);
    let fig = cardFigures.get(id);
    if (!fig) {
      fig = new Figure();
      cardFigures.set(id, fig);
    }
    // the first does its piece after a second and a half, the second two and a half seconds later, and so on round
    if (fresh) fig.reset(1.5 + i * 2.6, i, 4.2);
    // (as they are in town, their weapons on their backs, where the art has such a figure: the owner, 6 Oct 2026, "this would also go in the class selection screen")
    const heroArt = art.heroes.of(id, { twoHanded: c.starts === 'greatsword', town: true, card: true });
    // THE ONE WHO HAS BEEN PICKED MAKES READY (the owner, 6 Oct 2026, 22:24: "when you select the
    // character in the selection screen, they go into their battle stance, then warp out"): the
    // art's picture of that is played through, its last frame held; then they come apart in
    // slices and fade, as a warp in the game is seen (`gone`: how far gone, 0 to 1).
    const ready = mine ? heroArt.front.clips?.ready : undefined;
    let gone = 0;
    let sp: Sprite;
    if (ready && entering) {
      const long = (ready.frames.length - 1) / ready.fps;
      sp = fig.show(ready.frames[Math.max(0, Math.min(ready.frames.length - 1, Math.floor(Math.min(entering.t, long) * ready.fps + 1e-6)))], dt);
      gone = entering.t > long ? Math.min(1, (entering.t - long) / ENTER_OUT) : 0;
    } else {
      // (while one of them makes ready the other two only stand: nothing of their own is begun, to draw the eye from the one who was picked)
      sp = fig.frame(heroArt, { anim: (hot || talks) && !mine ? 'walk' : 'idle', animT: t, fx: 0.7071, fy: 0.7071, attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 }, dt, 0, 0, !entering);
    }
    // the figure stands on the floor of its box; whatever flies wide of the card (a scarf) is cut off at its edge
    const fx = x + Math.floor(cw / 2);
    const fy = y0 + 2 + figH;
    g.save();
    g.beginPath();
    g.rect(x + 1, y0 + 1, cw - 2, figH + 4);
    g.clip();
    if (gone > 0) fig.drawPhased(g, sp, fx, fy, 2, 0.15 + gone * 0.85, 1 - gone * gone);
    else {
      fig.draw(g, sp, fx, fy, 2);
      fig.lights(g, fx, fy, 2);
    }
    g.restore();
    let y = y0 + 4 + figH + 2;
    ui.text(c.name, x + Math.floor(cw / 2), y, ATTR_COLOR[c.primary], 'center');
    y += 11;
    for (const part of wrapText(c.blurb, cw - 8, 'small')) {
      ui.text(part, x + Math.floor(cw / 2), y, THEME.text, 'center', true);
      y += 6;
    }
    // THEIR THREE ATTACKS, AS ICONS (the owner, 6 Oct 2026, 22:59: "lets replace the names of the
    // abilities under the characters for their icons"): the quick attack, the slow one and the
    // evasive move that the class's first weapon gives, in the pictures the buttons carry in
    // play. (Their names stood here in small writing, two lines of it on the warrior's card.)
    // They and the line under them sit on the foot of the card, so that the three rows are level
    // whatever the length of each card's own words.
    const kit = skillsFor(id, c.starts);
    const slot = ch >= 135 ? 18 : 16;
    const attrsY = y0 + ch - 8;
    const iconsY = attrsY - 1 - slot;
    let ix = x + Math.floor((cw - (kit.length * slot + (kit.length - 1) * 4)) / 2);
    for (const sk of kit) {
      ui.slot(ix, iconsY, slot, art.icons.ability[SKILLS[sk].icon], THEME.edgeHi);
      ix += slot + 4;
    }
    ui.text(`STR ${c.attrs.str} DEX ${c.attrs.dex} INT ${c.attrs.int}`, x + Math.floor(cw / 2), attrsY, THEME.dim, 'center', true);
    if (entering && !mine) {
      // (they stand back in the dark while the one who was picked makes ready)
      g.globalAlpha = 0.62;
      g.fillStyle = P.black;
      g.fillRect(x, y0, cw, ch);
      g.globalAlpha = 1;
    }
    // (the card used to name the word the class finds first. The owner: "Remove the line that
    // states the first power word under the characters in character selection". It is found, not told.)
  });
  // (no line about the controls here: the first dungeon shows them, and the pause menu lists them)
  let hy = y0 + ch + 5;
  ui.drawButton(backR.x, backR.y, backR.w, backR.h, 'BACK', {});
  ui.drawButton(voiceR.x, voiceR.y, voiceR.w, voiceR.h, voiceLabel, { lit: opt.speaking !== null });
  if (opt.note) {
    for (const part of wrapText(opt.note, W - 16 - 2 * (Math.max(backW, voiceW) + 8), 'small')) {
      drawText(g, part, Math.floor(W / 2), Math.min(H - 7, hy + 2), THEME.bad, { align: 'center', font: 'small' });
      hy += 6;
    }
  }
  return out;
}

// =============================================================================================
// Pause and death

export interface PauseOut {
  resume: boolean;
  mute: boolean;
  quit: boolean;
  turn: boolean;
  /** Switch between cooldowns and mana as what limits the slow abilities. */
  limit: boolean;
  /** Touch: switch between attacks that go the way the hero faces and attacks that go where the thumb lands. */
  aim: boolean;
}

/** What the switch between the two ways of aiming on a phone says. */
export function aimLabel(aim: AimMode): string {
  if (aim === 'auto') return 'ATTACKS: AUTO AIM';
  return aim === 'face' ? 'ATTACKS: THE WAY YOU FACE' : 'ATTACKS: WHERE YOU TAP';
}

/**
 * `turn` is the label of the sideways/upright switch, or null where that choice does not apply;
 * `aim` is how attacks are aimed on a phone, or null with a mouse (which aims with its pointer).
 */
export function drawPause(ui: Ui, muted: boolean, turn: string | null, limit: Limit, aim: AimMode | null, quitLabel = 'End run'): PauseOut {
  const T = ui.touch;
  const bh = T ? 18 : 13;
  // The controls, as a short table: what, and how. (The owner: "the menus are very wordy with the descriptions".)
  const help: ReadonlyArray<readonly [string, string]> = T
    ? [['MOVE', 'left thumb'], ['ATTACK', 'tap'], ['SLOW ATTACK', 'hold'], ['EVADE', 'swipe'], ['FLASK', 'tap it'], ['INVENTORY', 'tap an attack']]
    : [['MOVE', 'WASD, or hold the left button'], ['ATTACK', 'left button'], ['STAND AND ATTACK', 'Shift + left button'], ['SLOW ATTACK', 'right button'], ['EVADE', 'Space'], ['FLASK', 'Q'], ['INTERACT', 'E'], ['INVENTORY', 'Tab'], ['LEVEL UP', 'L']];
  const keyW = help.reduce((n, r) => Math.max(n, ui.width(r[0], true)), 0) + 8;
  const valW = help.reduce((n, r) => Math.max(n, ui.width(r[1], true)), 0);
  // (as wide as it always was: the three buttons along the bottom need the room)
  const pw = Math.min(ui.w - 8, 250);
  const ph = Math.min(ui.h - 6, 18 + help.length * 7 + 8 + (turn ? bh + 3 : 0) + (aim ? bh + 3 : 0) + bh + 3 + bh + 6);
  const px = Math.floor((ui.w - pw) / 2);
  const py = Math.max(3, Math.floor((ui.h - ph) / 2));
  const out: PauseOut = { resume: false, mute: false, quit: false, turn: false, limit: false, aim: false };
  const bw = Math.floor((pw - 16) / 3);
  const by = py + ph - bh - 5;
  const ly = by - bh - 3;
  const ay = ly - bh - 3;
  const ty = (aim ? ay : ly) - bh - 3;
  if (ui.pressIn(px + 6, by, bw, bh)) out.resume = true;
  if (ui.pressIn(px + 8 + bw, by, bw, bh)) out.mute = true;
  if (ui.pressIn(px + 10 + bw * 2, by, bw, bh)) out.quit = true;
  if (ui.pressIn(px + 6, ly, pw - 12, bh)) out.limit = true;
  if (aim && ui.pressIn(px + 6, ay, pw - 12, bh)) out.aim = true;
  if (turn && ui.pressIn(px + 6, ty, pw - 12, bh)) out.turn = true;
  ui.shade(0.6);
  ui.panel(px, py, pw, ph);
  ui.text('Paused', px + Math.floor(pw / 2), py + 5, THEME.accent, 'center');
  let y = py + 18;
  const tx = px + Math.max(7, Math.floor((pw - keyW - valW) / 2));
  for (const [what, how] of help) {
    ui.text(what, tx, y, THEME.dim, 'left', true);
    ui.text(how, tx + keyW, y, THEME.text, 'left', true);
    y += 7;
  }
  if (turn) ui.drawButton(px + 6, ty, pw - 12, bh, turn, {});
  // (the owner is trying both of each: they can be switched in the middle of a run)
  if (aim) ui.drawButton(px + 6, ay, pw - 12, bh, aimLabel(aim), {});
  ui.drawButton(px + 6, ly, pw - 12, bh, limit === 'mana' ? 'ABILITIES: MANA' : 'ABILITIES: COOLDOWNS', {});
  ui.drawButton(px + 6, by, bw, bh, 'Resume', { primary: true });
  ui.drawButton(px + 8 + bw, by, bw, bh, muted ? 'Sound off' : 'Sound on', {});
  ui.drawButton(px + 10 + bw * 2, by, bw, bh, quitLabel, { color: THEME.bad });
  return out;
}

export function drawDeath(ui: Ui, game: Game): boolean {
  const h = game.hero;
  const pw = Math.min(ui.w - 8, 220);
  const ph = (ui.touch ? 128 : 124) + (game.slainBy ? 10 : 0);
  const px = Math.floor((ui.w - pw) / 2);
  const py = Math.max(3, Math.floor((ui.h - ph) / 2));
  const dbh = ui.touch ? 18 : 14;
  const again = ui.pressIn(px + 40, py + ph - dbh - 6, pw - 80, dbh);
  ui.shade(0.7);
  ui.panel(px, py, pw, ph);
  drawText(ui.g, 'YOU DIED', px + Math.floor(pw / 2), py + 8, THEME.bad, { align: 'center', scale: 2, shadow: THEME.lifeLo });
  const mins = Math.floor(game.runTime / 60);
  const secs = Math.floor(game.runTime % 60);
  const rows = [
    `${CLASSES[h.cls].name}, level ${h.level}`,
    `Fell in dungeon ${game.depth}`,
    `${game.cleared} dungeon${game.cleared === 1 ? '' : 's'} cleared, ${game.kills} monsters slain`,
    `${mins}m ${secs < 10 ? '0' : ''}${secs}s in the dark`,
  ];
  // what dealt the last blow (a long name drops to the small letters so it still fits)
  if (game.slainBy) rows.splice(1, 0, `Slain by ${game.slainBy}`);
  const words = WORD_IDS.reduce((n, w) => n + game.meta.lexicon[w], 0);
  const kept = game.meta.stash.filter((it) => it !== null).length;
  const legacy = `The Lexicon keeps ${words} word${words === 1 ? '' : 's'}, the stash ${kept} item${kept === 1 ? '' : 's'}`;
  let y = py + 34;
  for (const r of rows) {
    const small = ui.width(r) > pw - 10;
    ui.text(r, px + Math.floor(pw / 2), y + (small ? 1 : 0), r.startsWith('Slain by') ? THEME.bad : THEME.text, 'center', small);
    y += 10;
  }
  ui.text(legacy, px + Math.floor(pw / 2), y + 3, THEME.accent, 'center', true);
  ui.drawButton(px + 40, py + ph - dbh - 6, pw - 80, dbh, 'New run', { primary: true, lit: true });
  return again;
}

export function skillTitle(game: Game, i: number): string {
  const s = game.hero.skills[i];
  return skillName(SKILLS[s.id], s.front, s.behind);
}
