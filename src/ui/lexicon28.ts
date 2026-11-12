// THE LEXICON'S 28 WORDS, AT ITS LECTERN: ways to lay out its rune stones so that a word's page has room on a phone held
// sideways. A mock-up of the art chat's, behind LEX28: its way 'rows' is the game's own (ui/lexicon.ts lexiconSide, as it is),
// and with it so nothing here is drawn or called. The main chat's 13:20 post, 9 Nov 2026: “please also lay out the Lexicon's
// rows of rune stones for 28 words: on a phone held sideways they now leave too little room for a word's page”.
//
// The ways, each drawn for the pictures (docs/mockups/words10/pictures/lexicon28.png):
//   'side'  : the stones in a block down the left of the half, the page beside them the whole height;
//   'small' : the stones at the game's touch size, closer, in rows across the top;
//   'pages' : one row of stones across the top, an arrow at each end turning to the next of its pages of stones.
//   'groups': his own (9 Nov 2026, by 16:37, shown lexicon28.png: “Categorize them into pages”; asked which pages, by 16:45: “By
//             what they do”): the words sorted into five pages by what they do (LEX_PAGES), a row of five tabs across the top,
//             the open one lit in the friend's cyan; under it that page's stones in one row, under them the open word's page, the
//             half's whole width (docs/mockups/words10/pictures/lexicon_pages.png).

import type { Art } from '../render/render';
import { P } from '../art/palette';
import type { Sprite } from '../engine/px';
import { drawText, textWidth } from '../engine/font';
import type { Game } from '../game/game';
import type { Meta } from '../game/state';
import { WORD_IDS } from '../game/types';
import type { WordId } from '../game/types';
import { WORD_COLOR } from '../art/icons';
import { drawWordPage, lexLayout, wordPage } from './lexicon';
import type { LexUi } from './lexicon';
import { CELL, PITCH } from './panels';
import { SIDE_M, sideBody, sideFrame } from './town';
import { THEME } from './ui';
import type { Rect, Ui } from './ui';
import { drawWordTile } from './words';

export type Lex28Way = 'rows' | 'side' | 'small' | 'pages' | 'groups';
export const LEX28_WAYS: readonly Lex28Way[] = ['rows', 'side', 'small', 'pages', 'groups'];

/**
 * The switch: 'rows' is the game's own Lexicon, as it is; any other way is the mock-up's, for its pictures. `stones`: the art
 * chat's rune stones for the ten new words, laid in by the pictures' playtest in place of the stand-ins (none in the game).
 * 'groups' only: `tab`, a page opened by its tab (else the open word's page); `fresh`, the words found since the Lexicon was last
 * looked at (their page's tab carries a mark). The game keeps neither: both are the pictures' playtest's to set.
 */
export const LEX28 = {
  // ('groups' SINCE THE TEN NEW WORDS WENT LIVE: his pick and his yes, in the art chat, 9 Nov 2026: “Categorize them into pages”,
  // “By what they do”, “Damage, Strike, Time, Control, Spoils (Recommended)”, “Yes, use them (Recommended)”. 'rows', the game's
  // own until then, leaves a word's page 88 game pixels on a phone held sideways where the longest need 109.)
  way: 'groups' as Lex28Way,
  last: null as Lex28Layout | null,
  stones: {} as Partial<Record<WordId, Sprite>>,
  tab: null as number | null,
  fresh: [] as WordId[],
};

/**
 * A WORD FOUND AND NOT YET LOOKED AT (its page's tab carries the stud): the game keeps which words' pages have been seen in the
 * save (Meta.seen, since the ten new words went live); and the pictures' playtest may name some (LEX28.fresh).
 */
export function wordFresh(meta: Meta, w: WordId): boolean {
  return meta.known[w].found && (LEX28.fresh.includes(w) || (!!meta.seen && meta.seen[w] !== true));
}
/** These words' pages are being looked at: those of them found are seen from now. */
export function lexSeen(meta: Meta, words: readonly WordId[]): void {
  const seen = meta.seen;
  if (!seen) return;
  for (const w of words) if (meta.known[w].found && seen[w] !== true) seen[w] = true;
}

/**
 * THE BOOK ON THE STARTING SCREEN IN THE SAME FIVE PAGES (ui/lexicon.ts drawLexicon), behind a switch of its own: with 28 words its
 * list, a line a word in two columns, runs off the foot of its panel on a phone held sideways and on a PC (14 lines of 19 where
 * there is room for 10). On: the five tabs under its title, as at the lectern, and under them the open page's words only, nine
 * at most. NOT YET SEEN BY HIM: a picture to him before it goes live (docs/words10_live.md); off, the list as it was.
 */
export const LEX_BOOK = { pages: true };

/** The game's touch size: the least a thing pressed with a finger is, each way (a button's height with fingers, town.ts / lexicon.ts `bh`). */
export const TOUCH_MIN = 18;

/**
 * 'groups': the Lexicon's pages, its 28 words sorted by what they do (his “By what they do”, 9 Nov 2026), each word on one page;
 * `tab`, its name as its tab writes it: one plain word each (his, 9 Nov by 17:10: “I don’t really like the tabs names.  Too
 * wordy”, then “Damage, Strike, Time, Control, Spoils (Recommended)”). At most nine words a page: one row of stones across the half.
 */
export const LEX_PAGES: readonly { name: string; tab: readonly string[]; words: readonly WordId[] }[] = [
  { name: 'DAMAGE', tab: ['DAMAGE'], words: ['power', 'poison', 'fire', 'frost', 'lightning'] },
  { name: 'STRIKE', tab: ['STRIKE'], words: ['twin', 'heavy', 'precise', 'splitting', 'piercing', 'volatile', 'vast', 'surging', 'mirroring'] },
  { name: 'TIME', tab: ['TIME'], words: ['swift', 'frenzied', 'stilling', 'lasting', 'fleeting'] },
  { name: 'CONTROL', tab: ['CONTROL'], words: ['pulling', 'binding', 'hexing', 'guarding'] },
  { name: 'SPOILS', tab: ['SPOILS'], words: ['leech', 'bleeding', 'reaping', 'culling', 'plundering'] },
];

/** Which of the Lexicon's pages a word is on ('groups'). */
export function lexPageOf(w: WordId): number {
  return Math.max(0, LEX_PAGES.findIndex((p) => p.words.includes(w)));
}

/** The gap between two tabs ('groups'), in game pixels. */
const TAB_GAP = 2;

export interface Lex28Layout {
  way: Lex28Way;
  /** The half's body it is laid out in. */
  body: Rect;
  /** Each word's stone shown now (all 28, but for 'pages': the page of stones the open word is on). */
  cells: { w: WordId; r: Rect }[];
  /** Where the open word's page is written. */
  page: Rect;
  /** 'pages': its two arrows, which of its pages is shown, and how many there are. */
  arrows: { prev: Rect; next: Rect; at: number; of: number } | null;
  /** 'groups': its five tabs (LEX_PAGES' order), and the open one. */
  tabs: Rect[] | null;
  tab: number;
  x0: number;
  bw: number;
  bh: number;
  shelfY: number;
  keptY: number;
}

/**
 * Where the Lexicon's things are in its half `r` (its body: sideBody), for a way. `sel`: the open word (its page of stones).
 * `tab` ('groups'): a page opened by its tab; else the open word's page.
 */
export function lex28Layout(r: Rect, touch: boolean, way: Lex28Way, sel: WordId | null = null, tab: number | null = null): Lex28Layout {
  const x0 = r.x + SIDE_M;
  const bw = r.w - 2 * SIDE_M;
  const bodyY = r.y + 2 + (touch ? 22 : 16) + 2;
  const bh = touch ? 18 : 13;
  const shelfY = r.y + r.h - (3 + bh + 2 + CELL + 4);
  const keptY = shelfY + 3 + bh + 2;
  const n = WORD_IDS.length;
  const base = { way, body: r, x0, bw, bh, shelfY, keptY, arrows: null, tabs: null, tab: -1 };
  if (way === 'groups') {
    // a row of five tabs across the top, the touch size tall, the half's width shared out between them (the odd pixels to the first)
    const k = LEX_PAGES.length;
    const room = bw - (k - 1) * TAB_GAP;
    const each = Math.floor(room / k);
    let tx = x0;
    const tabs = LEX_PAGES.map((_, i) => {
      const t = { x: tx, y: bodyY, w: each + (i < room - each * k ? 1 : 0), h: TOUCH_MIN };
      tx += t.w + TAB_GAP;
      return t;
    });
    const at = tab !== null && tab >= 0 && tab < k ? tab : sel ? lexPageOf(sel) : 0;
    // under them the open page's stones in one row, at their own size; under those the open word's page, the half's width
    const sy = bodyY + TOUCH_MIN + 3;
    const cells = LEX_PAGES[at].words.map((w, i) => ({ w, r: { x: x0 + i * PITCH, y: sy, w: CELL, h: CELL } }));
    const pageY = sy + CELL + 6;
    return { ...base, cells, tabs, tab: at, page: { x: x0, y: pageY, w: bw, h: shelfY - 3 - pageY } };
  }
  if (way === 'side') {
    // a block of stones down the left, as few columns as fit them in the height there is; the page beside them, all of it
    const rowsFit = Math.max(1, Math.floor((shelfY - 4 - bodyY + 2) / PITCH));
    const cols = Math.ceil(n / rowsFit);
    const cells = WORD_IDS.map((w, i) => ({ w, r: { x: x0 + (i % cols) * PITCH, y: bodyY + Math.floor(i / cols) * PITCH, w: CELL, h: CELL } }));
    const px = x0 + cols * PITCH + 5;
    return { ...base, cells, page: { x: px, y: bodyY, w: x0 + bw - px, h: shelfY - 3 - bodyY } };
  }
  if (way === 'small') {
    // the stones at the touch size, a pixel apart, in rows as even as they can be
    const pitch = TOUCH_MIN + 1;
    const fit = Math.max(1, Math.floor((bw + 1) / pitch));
    const rows = Math.ceil(n / fit);
    const per = Math.ceil(n / rows);
    const cells = WORD_IDS.map((w, i) => ({ w, r: { x: x0 + (i % per) * pitch, y: bodyY + Math.floor(i / per) * pitch, w: TOUCH_MIN, h: TOUCH_MIN } }));
    const pageY = bodyY + rows * pitch - 1 + 5;
    return { ...base, cells, page: { x: x0, y: pageY, w: bw, h: shelfY - 3 - pageY } };
  }
  if (way === 'pages') {
    // one row across the top: an arrow at each end, the stones of one of its pages between them
    const aw = TOUCH_MIN;
    const fit = Math.max(1, Math.floor((bw - 2 * (aw + 3) + 2) / PITCH));
    const of = Math.ceil(n / fit);
    const per = Math.ceil(n / of);
    const at = sel ? Math.floor(WORD_IDS.indexOf(sel) / per) : 0;
    const left = x0 + aw + 3 + Math.floor((bw - 2 * (aw + 3) - (per * PITCH - 2)) / 2);
    const cells = WORD_IDS.slice(at * per, at * per + per).map((w, i) => ({ w, r: { x: left + i * PITCH, y: bodyY, w: CELL, h: CELL } }));
    const pageY = bodyY + CELL + 8;
    return { ...base, cells, arrows: { prev: { x: x0, y: bodyY, w: aw, h: CELL }, next: { x: x0 + bw - aw, y: bodyY, w: aw, h: CELL }, at, of }, page: { x: x0, y: pageY, w: bw, h: shelfY - 3 - pageY } };
  }
  // 'rows': the game's own (ui/lexicon.ts lexLayout)
  const L = lexLayout(r, touch);
  const cells = WORD_IDS.map((w, i) => ({ w, r: { x: L.x0 + (i % L.perRow) * L.pitch, y: L.bodyY + Math.floor(i / L.perRow) * (CELL + 2), w: CELL, h: CELL } }));
  return { ...base, cells, page: { x: L.x0, y: L.pageY, w: L.bw, h: L.pageH } };
}

/** How tall a word's page is written in a column `pw` wide (as the lectern writes it: tight), in game pixels. */
export function pageHeight(meta: Meta, w: WordId, pw: number): number {
  const p = wordPage(meta, w, pw, false, true);
  return p.nameH + p.parts.reduce((a, q) => a + q.gap + q.h, 0);
}

/**
 * 'groups': the row of tabs, each its page's name, one word, in the middle of it; the open one lit in the friend's cyan, the rest with the rim that
 * says a thing can be pressed. The tab of a page holding a word found since the Lexicon was last looked at (LEX28.fresh) carries
 * a small cyan stud on its top right corner (the open page's none: it is being looked at).
 */
export function drawTabs(ui: Ui, meta: Meta, tabs: Rect[], at: number): void {
  const g = ui.g;
  tabs.forEach((t, i) => {
    const on = i === at;
    ui.box(t.x, t.y, t.w, t.h, on ? THEME.accentBg : ui.hover(t.x, t.y, t.w, t.h) ? THEME.hot : THEME.bg2, on ? THEME.accent : THEME.edgeHi);
    // (its name, one word, in the middle of it each way: the odd pixel, if any, to the right and below)
    const lines = LEX_PAGES[i].tab;
    const ty = t.y + Math.floor((t.h - (lines.length * 6 - 1)) / 2);
    const col = on ? THEME.accent : THEME.dim;
    lines.forEach((ln, k) => drawText(g, ln, t.x + Math.floor((t.w - textWidth(ln, 'small')) / 2), ty + k * 6, col, { font: 'small' }));
    if (!on && LEX_PAGES[i].words.some((w) => wordFresh(meta, w))) {
      // (a round stud 5 across, a glint at its top left, ringed in ink where it lies over the tab's rim; clear of the name under it)
      const mx = t.x + t.w - 5;
      const my = t.y - 4;
      g.fillStyle = THEME.ink;
      g.fillRect(mx + 1, my, 5, 7);
      g.fillRect(mx, my + 1, 7, 5);
      g.fillStyle = THEME.accent;
      g.fillRect(mx + 2, my + 1, 3, 5);
      g.fillRect(mx + 1, my + 2, 5, 3);
      g.fillStyle = P.white;
      g.fillRect(mx + 2, my + 2, 1, 1);
    }
  });
}

/**
 * The Lexicon's half laid out the way LEX28 says (lexiconSide's draw, behind the switch): its title, the stones, the open word's
 * page, the shelf of kept words. 'groups' IS THE GAME'S OWN since the ten new words went live: its tabs and stones are pressed in
 * ui/lexicon.ts lexiconSide (a tab opens its page at its first word found; a stone its word's page), and the shelf is the game's,
 * a kept word picked and TAKE IT OUT. The other ways are pictures only.
 */
export function drawLex28(ui: Ui, art0: Art, meta: Meta, game: Game, st: LexUi, r: Rect): void {
  const g = ui.g;
  const art = Object.keys(LEX28.stones).length ? { ...art0, icons: { ...art0.icons, word: { ...art0.icons.word, ...LEX28.stones } } } : art0;
  const L = lex28Layout(sideBody(r, ui.w, ui.h), ui.touch, LEX28.way, st.sel, st.tab ?? LEX28.tab);
  LEX28.last = L;
  const found = WORD_IDS.filter((w) => meta.known[w].found);
  // ('groups': the word whose page is open is the open word where it is on the open tab's page, else that page's first found)
  const open = L.tabs ? (st.sel && LEX_PAGES[L.tab].words.includes(st.sel) ? st.sel : (LEX_PAGES[L.tab].words.find((w) => meta.known[w].found) ?? null)) : st.sel;
  sideFrame(ui, r, 'LEXICON', `${found.length} OF ${WORD_IDS.length} FOUND`);
  if (L.tabs) drawTabs(ui, meta, L.tabs, L.tab);
  for (const c of L.cells) {
    const s = c.r.w;
    if (!meta.known[c.w].found) {
      ui.box(c.r.x, c.r.y, s, s, THEME.slot, THEME.edge);
      drawText(g, '?', c.r.x + Math.floor(s / 2), c.r.y + Math.floor((s - 8) / 2) + 1, THEME.faint, { align: 'center' });
      continue;
    }
    const on = open === c.w;
    drawWordTile(ui, art, c.r.x, c.r.y, s, s, c.w, 'name', { stone: true, lit: on || ui.hover(c.r.x, c.r.y, s, s), edge: on ? THEME.accent : undefined });
    // its four pips: in front, behind, on gear, on a dungeon
    const k = meta.known[c.w];
    [k.front, k.behind, k.gear, k.dungeon].forEach((known, i) => {
      g.fillStyle = known ? WORD_COLOR[c.w] : THEME.edge;
      g.fillRect(c.r.x + 3 + i * 4 - (s < CELL ? 1 : 0), c.r.y + s - 2.5, 3, 1.5);
    });
  }
  if (L.arrows) {
    ui.drawButton(L.arrows.prev.x, L.arrows.prev.y, L.arrows.prev.w, L.arrows.prev.h, '<', {});
    ui.drawButton(L.arrows.next.x, L.arrows.next.y, L.arrows.next.w, L.arrows.next.h, '>', {});
    // which of its pages of stones: a pip each, the one shown lit
    const dy = L.arrows.prev.y + L.arrows.prev.h + 2;
    for (let i = 0; i < L.arrows.of; i++) {
      g.fillStyle = i === L.arrows.at ? THEME.accent : THEME.edge;
      g.fillRect(L.x0 + Math.floor(L.bw / 2) - L.arrows.of * 3 + i * 6, dy, 4, 1.5);
    }
  }
  if (open) drawWordPage(g, meta, open, L.page.x, L.page.y, L.page.w, L.page.h, false, true);
  else if (L.tabs) drawText(g, 'No word of this page found yet.', L.page.x, L.page.y + 2, THEME.dim);
  // the shelf: the words kept in the book between characters (as the game's own)
  g.fillStyle = THEME.edge;
  g.fillRect(L.x0, L.shelfY, L.bw, 0.5);
  const capY = L.shelfY + 3 + Math.floor((L.bh - 5) / 2);
  const capW = drawText(g, 'KEPT FOR YOUR NEXT CHARACTER', L.x0, capY, THEME.dim, { font: 'small' });
  // (a kept word picked: TAKE IT OUT in the caption's line, where lexiconSide presses it; else the price of one more, where there is room)
  if (st.pick) {
    const takeW = textWidth('TAKE IT OUT') + 16;
    ui.drawButton(r.x + r.w - SIDE_M - takeW, L.shelfY + 3, takeW, L.bh, 'TAKE IT OUT', { lit: true });
  } else {
    const price = `ONE MORE: ${game.keepCost()} GOLD`;
    if (capW + 8 + textWidth(price, 'small') <= L.bw) drawText(g, price, L.x0 + L.bw, capY, THEME.gold, { align: 'right', font: 'small' });
  }
  const kept = WORD_IDS.filter((w) => meta.lexicon[w] > 0);
  if (!kept.length) drawText(g, 'None.', L.x0, L.keptY + Math.floor((CELL - 5) / 2), THEME.faint, { font: 'small' });
  const keptPitch = kept.length > 1 ? Math.min(PITCH, Math.floor((L.bw - CELL) / (kept.length - 1))) : PITCH;
  kept.forEach((w, i) => {
    const kx = L.x0 + i * keptPitch;
    const on = !!st.pick && st.pick.word === w;
    drawWordTile(ui, art, kx, L.keptY, CELL, CELL, w, 'name', { stone: true, lit: on || ui.hover(kx, L.keptY, CELL, CELL), edge: on ? THEME.accent : undefined, count: meta.lexicon[w] });
  });
}

/** The playtest's hands: `window.__dbg.lex28` (main.ts). Nothing here runs unless a playtest calls it. */
export function demoLex28(getMeta: () => Meta) {
  return {
    switch: LEX28,
    ways: LEX28_WAYS,
    touch: TOUCH_MIN,
    /** Each word's page height in a column `pw` wide, the tallest first. */
    heights: (pw: number): [WordId, number][] => WORD_IDS.map((w) => [w, pageHeight(getMeta(), w, pw)] as [WordId, number]).sort((a, b) => b[1] - a[1]),
    /** The layout last drawn. */
    last: () => LEX28.last,
    layout: (r: Rect, touch: boolean, way: Lex28Way, sel: WordId | null, tab: number | null = null) => lex28Layout(r, touch, way, sel, tab),
    /** 'groups': its pages, and which a word is on. */
    pages: LEX_PAGES,
    pageOf: (w: WordId) => lexPageOf(w),
  };
}
