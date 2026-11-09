// THE LEXICON'S 28 WORDS, AT ITS LECTERN: ways to lay out its rune stones so that a word's page has room on a phone held
// sideways. A mock-up of the art chat's, behind LEX28: its way 'rows' is the game's own (ui/lexicon.ts lexiconSide, as it is),
// and with it so nothing here is drawn or called. The main chat's 13:20 post, 9 Nov 2026: “please also lay out the Lexicon's
// rows of rune stones for 28 words: on a phone held sideways they now leave too little room for a word's page”.
//
// The ways, each drawn for the pictures (docs/mockups/words10/pictures/lexicon28.png):
//   'side'  : the stones in a block down the left of the half, the page beside them the whole height;
//   'small' : the stones at the game's touch size, closer, in rows across the top;
//   'pages' : one row of stones across the top, an arrow at each end turning to the next of its pages of stones.

import type { Art } from '../render/render';
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

export type Lex28Way = 'rows' | 'side' | 'small' | 'pages';
export const LEX28_WAYS: readonly Lex28Way[] = ['rows', 'side', 'small', 'pages'];

/**
 * The switch: 'rows' is the game's own Lexicon, as it is; any other way is the mock-up's, for its pictures. `stones`: the art
 * chat's rune stones for the ten new words, laid in by the pictures' playtest in place of the stand-ins (none in the game).
 */
export const LEX28 = { way: 'rows' as Lex28Way, last: null as Lex28Layout | null, stones: {} as Partial<Record<WordId, Sprite>> };

/** The game's touch size: the least a thing pressed with a finger is, each way (a button's height with fingers, town.ts / lexicon.ts `bh`). */
export const TOUCH_MIN = 18;

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
  x0: number;
  bw: number;
  bh: number;
  shelfY: number;
  keptY: number;
}

/** Where the Lexicon's things are in its half `r` (its body: sideBody), for a way. `sel`: the open word (its page of stones). */
export function lex28Layout(r: Rect, touch: boolean, way: Lex28Way, sel: WordId | null = null): Lex28Layout {
  const x0 = r.x + SIDE_M;
  const bw = r.w - 2 * SIDE_M;
  const bodyY = r.y + 2 + (touch ? 22 : 16) + 2;
  const bh = touch ? 18 : 13;
  const shelfY = r.y + r.h - (3 + bh + 2 + CELL + 4);
  const keptY = shelfY + 3 + bh + 2;
  const n = WORD_IDS.length;
  const base = { way, body: r, x0, bw, bh, shelfY, keptY, arrows: null };
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
 * The Lexicon's half laid out the way LEX28 says (lexiconSide's draw, behind the switch): its title, the stones, the open word's
 * page, the shelf of kept words. Pictures only: what is pressed is still the game's own layout's.
 */
export function drawLex28(ui: Ui, art0: Art, meta: Meta, game: Game, st: LexUi, r: Rect): void {
  const g = ui.g;
  const art = Object.keys(LEX28.stones).length ? { ...art0, icons: { ...art0.icons, word: { ...art0.icons.word, ...LEX28.stones } } } : art0;
  const L = lex28Layout(sideBody(r, ui.w, ui.h), ui.touch, LEX28.way, st.sel);
  LEX28.last = L;
  const found = WORD_IDS.filter((w) => meta.known[w].found);
  sideFrame(ui, r, 'LEXICON', `${found.length} OF ${WORD_IDS.length} FOUND`);
  for (const c of L.cells) {
    const s = c.r.w;
    if (!meta.known[c.w].found) {
      ui.box(c.r.x, c.r.y, s, s, THEME.slot, THEME.edge);
      drawText(g, '?', c.r.x + Math.floor(s / 2), c.r.y + Math.floor((s - 8) / 2) + 1, THEME.faint, { align: 'center' });
      continue;
    }
    const on = st.sel === c.w;
    drawWordTile(ui, art, c.r.x, c.r.y, s, s, c.w, 'name', { stone: true, lit: on, edge: on ? THEME.accent : undefined });
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
  if (st.sel) drawWordPage(g, meta, st.sel, L.page.x, L.page.y, L.page.w, L.page.h, false, true);
  // the shelf: the words kept in the book between characters (as the game's own)
  g.fillStyle = THEME.edge;
  g.fillRect(L.x0, L.shelfY, L.bw, 0.5);
  const capY = L.shelfY + 3 + Math.floor((L.bh - 5) / 2);
  const capW = drawText(g, 'KEPT FOR YOUR NEXT CHARACTER', L.x0, capY, THEME.dim, { font: 'small' });
  const price = `ONE MORE: ${game.keepCost()} GOLD`;
  if (capW + 8 + textWidth(price, 'small') <= L.bw) drawText(g, price, L.x0 + L.bw, capY, THEME.gold, { align: 'right', font: 'small' });
  const kept = WORD_IDS.filter((w) => meta.lexicon[w] > 0);
  if (!kept.length) drawText(g, 'None.', L.x0, L.keptY + Math.floor((CELL - 5) / 2), THEME.faint, { font: 'small' });
  const keptPitch = kept.length > 1 ? Math.min(PITCH, Math.floor((L.bw - CELL) / (kept.length - 1))) : PITCH;
  kept.forEach((w, i) => drawWordTile(ui, art, L.x0 + i * keptPitch, L.keptY, CELL, CELL, w, 'name', { stone: true, count: meta.lexicon[w] }));
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
    layout: (r: Rect, touch: boolean, way: Lex28Way, sel: WordId | null) => lex28Layout(r, touch, way, sel),
  };
}
