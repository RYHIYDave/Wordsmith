// The Lexicon: the book of words.
//
// The owner: "a lexicon where you can reference words that you have found and applied and
// discovered their properties ... the lexicon should describe the words but only show what a
// player has used them for. on skill, on gear, and on dungeon modifiers". And, of the spare words
// it keeps between characters: "yes unused words stay. but i want that to be a premium."
//
// So each word found has a page: what it is, and under three headings (on an attack, on gear, on
// a dungeon) what it does there, written in only once the player has used it that way. A word
// never found has no page. The book is opened in two places:
//   - from the starting screen, to read: a panel of its own (drawLexicon);
//   - at its lectern in town, where spare words can also be kept in it for the next character,
//     at a price: there it has its half of the screen beside the inventory (lexiconSide, Version
//     14.3: the owner, 5 Oct 2026, "Vendors, stash, and lexicon would take up the left side so
//     you would have access to your inventory on the right side"). The words the hero carries are
//     the inventory's own, on its half: one of them is pressed there, and its card offers KEEP.

import { itemWordOf } from '../game/items';
import { WORD_COLOR } from '../art/icons';
import { P } from '../art/palette';
import { drawText, textWidth, wrapText } from '../engine/font';
import { ATTR_NAME, FOE_WORDS, WORDS, growsWith } from '../game/defs';
import { foeText } from '../game/foe_melds';
import type { Game } from '../game/game';
import { imbueRules, statView, flatPair } from '../game/items';
import type { Meta } from '../game/state';
import { RANK_OF, WORD_IDS } from '../game/types';
import type { Limit, RankId, Slot, StatKey, WordId } from '../game/types';
import type { Art } from '../render/render';
import type { InvUi, Side } from './inventory';
import { CELL, PITCH } from './panels';
import { SIDE_M, putDown, sideBody, sideFrame } from './town';
import { THEME, inside } from './ui';
import type { Rect, Ui } from './ui';
import { drawWordTile } from './words';
// (THE LEXICON'S 28 WORDS: the art chat's ways to lay out its stones, behind LEX28, whose way 'rows' is this file's own. ITS WAY
// IS 'groups' SINCE THE TEN NEW WORDS WENT LIVE: the Lexicon in five pages by what the words do, his yes to its picture in the
// art chat, 9 Nov 2026, “Yes, use them (Recommended)”. What is pressed there is in lexiconSide, below.)
import { LEX28, LEX_BOOK, LEX_PAGES, drawLex28, drawTabs, lex28Layout, lexPageOf, lexSeen } from './lexicon28';

export interface LexUi {
  /** The word whose page is open. */
  sel: WordId | null;
  /** In town: the kept word picked to be taken out. */
  pick: { from: 'kept'; word: WordId } | null;
  /** In town: the word the inventory had in hand when last looked (its page is opened when it changes). */
  hand: WordId | null;
  note: string;
  noteT: number;
  /** In town, the Lexicon in pages ('groups'): the page opened by its tab (LEX_PAGES); null, the open word's own page. */
  tab?: number | null;
  /** (The same) One of its tabs has just been tapped and its page turned: main.ts plays the page turn and puts this out. */
  turned?: boolean;
}

export function newLexUi(): LexUi {
  return { sel: null, pick: null, hand: null, note: '', noteT: 0, tab: null, turned: false };
}

const SLOT_NAME: Record<Slot, string> = { mainhand: 'weapon', offhand: 'off hand', helm: 'helm', chest: 'chest', gloves: 'gloves', belt: 'belt', boots: 'boots', amulet: 'amulet', ring: 'ring' };

/** What a word may become on gear, slot by slot, in plain words (a melded word: two together, "A and B"). */
export function gearLines(word: WordId, limit: Limit): string[] {
  // (FLAT DAMAGE: a pair named by its least, read as what it adds: “Added Fire Damage”; and beside its word's own damage on one piece,
  // the two as one, “Fire Damage (% or added)”, short, so that every word's page still fits a phone held sideways. The gear's own
  // lines say each whole: “+12% Fire Damage”, “Adds X-Y Fire Damage to Fire Hits”)
  const flatOf = (s: StatKey): string | null => { const f = flatPair(s); return f ? f.label.split(' to ')[0] : null; };
  const label = (s: StatKey): string => { const f = flatOf(s); return f ? `Added ${f}` : statView(s, limit).label; };
  const labels = (stats: readonly StatKey[]): string[] => {
    const out: string[] = [];
    for (const s of stats) {
      const f = flatOf(s);
      if (f && stats.some((o) => !flatOf(o) && statView(o, limit).label === f)) continue;
      const both = !f && stats.some((o) => flatOf(o) === statView(s, limit).label);
      out.push(both ? `${statView(s, limit).label} (% or added)` : label(s));
    }
    return out;
  };
  // (SPLITTING AND BINDING change the piece at the bench: ITEM_WORDS)
  const iw = itemWordOf(word);
  if (iw === 'split') return ['At the bench: one piece made two, its properties shared between them.'];
  if (iw === 'bind') return ['At the bench: a second piece of the same kind bound into the first, four properties in all.'];
  return imbueRules(word).map((r) => {
    const where = r.slots.map((s) => SLOT_NAME[s]).join(', ');
    const what = r.pairs ? r.pairs.map(([a, b]) => (a === b ? label(a) : `${label(a)} and ${label(b)}`)).join(', or ') : labels(r.stats).join(' or ');
    return `${where.charAt(0).toUpperCase()}${where.slice(1)}: ${what}.`;
  });
}

/** How strong a melded or ranked word is on gear, against the words it is made of (EVERY WORD ON GEAR). */
export function gearNote(word: WordId): string {
  const wd = WORDS[word];
  if (wd.kind === 'rank') return `Half as strong again as ${WORDS[RANK_OF[word as RankId].word].name}.`;
  return 'Both at once, each a little weaker than its word alone.';
}

/** How many words have been found. */
export function wordsFound(meta: Meta): number {
  return WORD_IDS.filter((w) => meta.known[w].found).length;
}

interface PageRow {
  text: string;
  color: string;
  small: boolean;
  indent: number;
}

/**
 * How a word's page is laid out in a column `pw` wide: its name's line, then its parts (what it
 * is; on an attack; on gear; on a dungeon), each a run of lines that are written all together or
 * not at all (a sentence that stops half way reads as a fault).
 */
export function wordPage(meta: Meta, w: WordId, pw: number, big: boolean, tight = false): { nameH: number; parts: { gap: number; rows: PageRow[]; h: number }[] } {
  const wd = WORDS[w];
  const k = meta.known[w];
  // (the owner, 5 Oct 2026, 21:56: 'Instead of "not yet tried" say undiscovered')
  const unknown = 'Undiscovered.';
  const head = (text: string): PageRow => ({ text, color: THEME.accent, small: true, indent: 0 });
  const line = (text: string, known: boolean): PageRow => ({ text, color: known ? THEME.text : THEME.faint, small: true, indent: 4 });
  const lay = (gap: number, rows: PageRow[]): { gap: number; rows: PageRow[]; h: number } => {
    const laid = rows.flatMap((r) => wrapText(r.text, pw - r.indent, r.small ? 'small' : 'normal').map((text) => ({ ...r, text })));
    return { gap, rows: laid, h: laid.reduce((a, r) => a + (r.small ? 6 : 9), 0) };
  };
  return {
    nameH: big ? 20 : 11,
    parts: [
      lay(0, [{ text: wd.about, color: P.white, small: false, indent: 0 }]),
      lay(4, [
        head('ON AN ATTACK'),
        line(k.front ? `In front (${wd.front.toUpperCase()} ...): ${wd.frontText}` : `In front: ${unknown}`, k.front),
        line(k.behind ? `Behind (... ${wd.behind.replace(/^of /, 'OF ').toUpperCase()}): ${wd.behindText}` : `Behind: ${unknown}`, k.behind),
      ]),
      // (WORDMELDING: a melded word went on attacks only, his words; and a ranked one. Since EVERY WORD ON GEAR, his words of
      // 8 Nov 2026, 06:45, “Every rune sorry”, on gear too: what it becomes there; still not on a dungeon)
      ...(wd.kind === 'meld' || wd.kind === 'rank'
        ? [
            lay(2, [
              head('ON GEAR'),
              ...(!k.gear ? [line(unknown, false)] : [...(tight ? [line(gearLines(w, meta.limit).join(' '), true)] : gearLines(w, meta.limit).map((l) => line(l, true))), line(gearNote(w), true)]),
            ]),
            // (EVERY WORD ON A DUNGEON, FOE_WORDS: on a dungeon and a stronghold too, what it does to every monster there: game/foe_melds.ts)
            FOE_WORDS.on
              ? lay(2, [head('ON A DUNGEON'), line(k.dungeon ? `Every monster in it: ${foeText(w).charAt(0).toLowerCase()}${foeText(w).slice(1)} Counts as two words: richer loot, and words are likelier.` : unknown, k.dungeon)])
              : lay(2, [head('ON A DUNGEON'), line(wd.kind === 'rank' ? 'A ranked word goes on attacks and gear only.' : 'A melded word goes on attacks and gear only.', true)]),
          ]
        : [
            // (what it may become on gear, slot by slot: a line each, or run together where room is short)
            lay(2, [head('ON GEAR'), ...(!k.gear ? [line(unknown, false)] : tight ? [line(gearLines(w, meta.limit).join(' '), true)] : gearLines(w, meta.limit).map((l) => line(l, true)))]),
            lay(2, [head('ON A DUNGEON'), line(k.dungeon ? `Every monster in it: ${wd.monsterText.charAt(0).toLowerCase()}${wd.monsterText.slice(1)} Richer loot, and words are likelier.` : unknown, k.dungeon)]),
          ]),
    ],
  };
}

/** A word's page, in a column `pw` wide from (x, y0) and no further down than `ph` below it. Returns false if a part of it had no room. */
export function drawWordPage(g: CanvasRenderingContext2D, meta: Meta, w: WordId, x: number, y0: number, pw: number, ph: number, big: boolean, tight = false): boolean {
  const wd = WORDS[w];
  const page = wordPage(meta, w, pw, big, tight);
  const end = y0 + ph;
  let y = y0;
  const nw = drawText(g, wd.name.toUpperCase(), x, y, WORD_COLOR[w], { shadow: P.ink, scale: big ? 2 : 1 });
  drawText(g, growsWith(w), x + nw + 8, y + (big ? 9 : 2), THEME.dim, { font: 'small' });
  y += page.nameH;
  for (const part of page.parts) {
    if (y + part.gap + part.h - 1 > end) return false;
    y += part.gap;
    for (const r of part.rows) {
      drawText(g, r.text, x + r.indent, y, r.color, { font: r.small ? 'small' : 'normal' });
      y += r.small ? 6 : 9;
    }
  }
  return true;
}

/** Four pips along the foot of a word's cell: in front, behind, on gear, on a dungeon. Lit when that use is known. */
function knownPips(g: CanvasRenderingContext2D, meta: Meta, w: WordId, x: number, y: number): void {
  const k = meta.known[w];
  [k.front, k.behind, k.gear, k.dungeon].forEach((known, i) => {
    g.fillStyle = known ? WORD_COLOR[w] : THEME.edge;
    g.fillRect(x + 3 + i * 4, y + CELL - 2.5, 3, 1.5);
  });
}

// =============================================================================================
// At its lectern in town: its half of the screen, beside the inventory

/**
 * Where the Lexicon's things are in its half `r`: the row of rune stones under the title, the
 * shelf of kept words along the bottom (a line for its caption and its button, then the
 * stones), and between them the page of the word that is open.
 */
export function lexLayout(r: Rect, touch: boolean): { x0: number; bw: number; bodyY: number; pitch: number; perRow: number; rows: number; bh: number; shelfY: number; keptY: number; pageY: number; pageH: number } {
  const x0 = r.x + SIDE_M;
  const bw = r.w - 2 * SIDE_M;
  const bodyY = r.y + 2 + (touch ? 22 : 16) + 2;
  // (every word in one row where they fit; where they do not, as Version 19.3's thirteen do not,
  // in rows as even as they can be: seven and six)
  const fit = Math.max(1, Math.floor((bw + 2) / PITCH));
  const rows = Math.max(1, Math.ceil(WORD_IDS.length / fit));
  const perRow = Math.ceil(WORD_IDS.length / rows);
  const pitch = rows === 1 ? Math.max(CELL, Math.min(PITCH, Math.floor((bw + 2) / WORD_IDS.length))) : PITCH;
  const bh = touch ? 18 : 13;
  const shelfY = r.y + r.h - (3 + bh + 2 + CELL + 4);
  const pageY = bodyY + rows * (CELL + 2) - 2 + 6;
  return { x0, bw, bodyY, pitch, perRow, rows, bh, shelfY, keptY: shelfY + 3 + bh + 2, pageY, pageH: shelfY - 3 - pageY };
}

/**
 * The Lexicon's half. Along the top every word there is, as its rune stone (the ones not found
 * yet, a question mark); under them the page of the word that is open; along the bottom the
 * shelf: the words kept in the book for the next character. A spare word is kept from the
 * inventory's side (press it there: its card has KEEP and the price); a kept one is pressed
 * here and taken out.
 */
export function lexiconSide(ui: Ui, art: Art, meta: Meta, game: Game, st: LexUi, inv: InvUi, r: Rect): Side {
  const g = ui.g;
  const T = ui.touch;
  const { x0, bw, bodyY, pitch, perRow, bh, shelfY, keptY, pageY, pageH } = lexLayout(sideBody(r, ui.w, ui.h), T);
  const found = WORD_IDS.filter((w) => meta.known[w].found);
  if (st.sel && !meta.known[st.sel].found) st.sel = null;
  if (!st.sel && found.length) st.sel = found[0];
  // (THE LEXICON IN PAGES, 'groups': a row of five tabs, the open page's stones in one row under them: ui/lexicon28.ts lays it
  // out and draws it; here its tabs and its stones are pressed. Any other way of the mock-up's is drawn only, over the game's rows.)
  const pages = LEX28.way === 'groups' ? lex28Layout(sideBody(r, ui.w, ui.h), T, 'groups', st.sel, st.tab ?? LEX28.tab) : null;
  const tabs = pages?.tabs ?? [];
  const cells = pages ? pages.cells : WORD_IDS.map((w, i) => ({ w, r: { x: x0 + (i % perRow) * pitch, y: bodyY + Math.floor(i / perRow) * (CELL + 2), w: CELL, h: CELL } }));
  tabs.forEach((t, i) => ui.mark(`lextab:${i}`, t.x, t.y, t.w, t.h));
  // (the page that is open is being looked at: its words found are seen, and mark no tab)
  if (pages) lexSeen(meta, LEX_PAGES[pages.tab].words);
  const kept = WORD_IDS.filter((w) => meta.lexicon[w] > 0);
  // (the shelf has one row: more kinds kept than it holds side by side, and they stand closer)
  const keptPitch = kept.length > 1 ? Math.min(pitch, Math.floor((bw - CELL) / (kept.length - 1))) : pitch;
  const chips = kept.map((w, i) => ({ w, n: meta.lexicon[w], r: { x: x0 + i * keptPitch, y: keptY, w: CELL, h: CELL } }));
  const cost = game.keepCost();
  const takeW = textWidth('TAKE IT OUT') + 16;
  const takeR: Rect = { x: r.x + r.w - SIDE_M - takeW, y: shelfY + 3, w: takeW, h: bh };
  for (const c of cells) ui.mark(`lex:${c.w}`, c.r.x, c.r.y, c.r.w, c.r.h);
  for (const c of chips) ui.mark(`kept:${c.w}`, c.r.x, c.r.y, c.r.w, c.r.h);
  if (st.pick && meta.lexicon[st.pick.word] <= 0) st.pick = null;

  return {
    press(say): void {
      // a word has been taken in hand over there: its page is the one opened here
      if (inv.word !== st.hand) {
        st.hand = inv.word;
        if (inv.word && meta.known[inv.word].found) {
          st.sel = inv.word;
          st.tab = null;
        }
      }
      // (THE LEXICON IN PAGES: a tab tapped, its page opens at its first word found; a page with none found yet is opened too)
      tabs.forEach((t, i) => {
        if (!ui.pressIn(t.x, t.y, t.w, t.h)) return;
        if (pages && i !== pages.tab) st.turned = true;
        st.tab = i;
        const first = LEX_PAGES[i].words.find((w) => meta.known[w].found);
        if (first) st.sel = first;
        st.pick = null;
      });
      // (and whatever the inventory has in hand, what was picked here is put down)
      if (inv.sel || inv.word || inv.pending || inv.look) st.pick = null;
      if (st.pick && ui.pressIn(takeR.x, takeR.y, takeR.w, takeR.h)) say(game.withdrawWord(st.pick.word));
      for (const c of cells) {
        if (!ui.pressIn(c.r.x, c.r.y, c.r.w, c.r.h)) continue;
        if (meta.known[c.w].found) st.sel = c.w;
        st.pick = null;
      }
      for (const c of chips) {
        if (!ui.pressIn(c.r.x, c.r.y, c.r.w, c.r.h)) continue;
        putDown(inv);
        st.hand = null;
        if (meta.known[c.w].found) {
          st.sel = c.w;
          st.tab = null;
        }
        st.pick = { from: 'kept', word: c.w };
      }
      if (ui.press && !ui.used && inside(r, ui.press.x, ui.press.y)) st.pick = null;
    },

    wordHint: () => (game.hero.gold < cost ? `Keeping it here costs ${cost} gold: you have ${game.hero.gold}.` : 'Kept here, it waits for your next character.'),
    wordButtons: (w) => [{ label: `KEEP: ${cost} GOLD`, act: () => game.depositWord(w), lit: game.hero.gold >= cost, disabled: game.hero.gold < cost }],

    draw(): void {
      // (the art chat's ways for 28 words, behind a switch whose way 'rows' is the game's own: ui/lexicon28.ts)
      if (LEX28.way !== 'rows') return drawLex28(ui, art, meta, game, st, r);
      sideFrame(ui, r, 'LEXICON', `${found.length} OF ${WORD_IDS.length} FOUND`);
      for (const c of cells) {
        if (!meta.known[c.w].found) {
          ui.box(c.r.x, c.r.y, CELL, CELL, THEME.slot, THEME.edge);
          drawText(g, '?', c.r.x + Math.floor(CELL / 2), c.r.y + 6, THEME.faint, { align: 'center' });
          continue;
        }
        const on = st.sel === c.w;
        drawWordTile(ui, art, c.r.x, c.r.y, CELL, CELL, c.w, 'name', { stone: true, lit: on || ui.hover(c.r.x, c.r.y, CELL, CELL), edge: on ? THEME.accent : undefined });
        knownPips(g, meta, c.w, c.r.x, c.r.y);
      }
      if (st.sel) drawWordPage(g, meta, st.sel, x0, pageY, bw, pageH, false, true);
      else wrapText('No word found yet. The first lies in a satchel, half way through the first dungeon.', bw).forEach((row, i) => drawText(g, row, x0, pageY + 2 + i * 9, THEME.dim));

      // the shelf: the words kept in the book between characters
      g.fillStyle = THEME.edge;
      g.fillRect(x0, shelfY, bw, 0.5);
      const capY = shelfY + 3 + Math.floor((bh - 5) / 2);
      const capW = drawText(g, 'KEPT FOR YOUR NEXT CHARACTER', x0, capY, THEME.dim, { font: 'small' });
      if (st.pick) ui.drawButton(takeR.x, takeR.y, takeR.w, takeR.h, 'TAKE IT OUT', { lit: true });
      else {
        // (the price of one more, where there is room to say it)
        const price = `ONE MORE: ${cost} GOLD`;
        if (capW + 8 + textWidth(price, 'small') <= bw) drawText(g, price, x0 + bw, capY, THEME.gold, { align: 'right', font: 'small' });
      }
      if (!chips.length) drawText(g, 'None.', x0, keptY + Math.floor((CELL - 5) / 2), THEME.faint, { font: 'small' });
      for (const c of chips) {
        const on = !!st.pick && st.pick.word === c.w;
        drawWordTile(ui, art, c.r.x, c.r.y, CELL, CELL, c.w, 'name', { stone: true, lit: on || ui.hover(c.r.x, c.r.y, CELL, CELL), edge: on ? THEME.accent : undefined, count: c.n });
      }
    },
  };
}

// =============================================================================================
// From the starting screen: the book alone, to read

/** The Lexicon as a panel of its own (the starting screen: there is no character to keep a word for). Returns true when it should close. */
export function drawLexicon(ui: Ui, art: Art, meta: Meta, st: LexUi, dt: number): boolean {
  const g = ui.g;
  const W = ui.w;
  const H = ui.h;
  const T = ui.touch;
  if (st.noteT > 0) st.noteT -= dt;
  st.pick = null;
  const narrow = W < 400;
  const found = WORD_IDS.filter((w) => meta.known[w].found);
  if (st.sel && !meta.known[st.sel].found) st.sel = null;
  if (!st.sel && found.length) st.sel = found[0];
  const kept = WORD_IDS.filter((w) => meta.lexicon[w] > 0);

  // ---- layout ---------------------------------------------------------------------------------
  const pw = Math.min(W - 6, narrow ? 290 : 470);
  const ph = Math.min(H - 6, narrow ? 600 : 226);
  const px = Math.floor((W - pw) / 2);
  const py = Math.max(3, Math.floor((H - ph) / 2));
  const hdr = T ? 23 : 18;
  const rowH = T ? 19 : 17;
  // (THE BOOK IN PAGES, since the ten new words went live: the Lexicon's five pages by what the words do, his at the lectern
  // (ui/lexicon28.ts LEX_PAGES), here too: a row of tabs under the title, and the list is the open page's words. The page open:
  // the one its tab opened, else the open word's.)
  const paged = LEX28.way === 'groups' && LEX_BOOK.pages;
  const at = paged ? (st.tab !== null && st.tab !== undefined && st.tab >= 0 && st.tab < LEX_PAGES.length ? st.tab : st.sel ? lexPageOf(st.sel) : 0) : -1;
  const listed: readonly WordId[] = paged ? LEX_PAGES[at].words : WORD_IDS;
  const tabH = T ? 18 : 15;
  const tabW = Math.min(58, Math.floor((pw - 12 - (LEX_PAGES.length - 1) * 2) / LEX_PAGES.length));
  const tabs: Rect[] = paged ? LEX_PAGES.map((_, i) => ({ x: px + 6 + i * (tabW + 2), y: py + hdr + 2, w: tabW, h: tabH })) : [];
  const headH = hdr + 2 + (paged ? tabH + 3 : 0);
  // (one column of words beside the page; two where one would run off the foot of the panel, as
  // Version 19.3's thirteen do on a phone held sideways)
  const cols = narrow ? 3 : headH + listed.length * rowH + 4 <= ph ? 1 : 2;
  const listW = narrow ? pw - 12 : 104 * cols;
  const cellW = Math.floor(listW / cols);
  const listX = px + 6;
  const listY = py + headH;
  const cells: { r: Rect; w: WordId }[] = listed.map((w, i) => ({ r: { x: listX + (i % cols) * cellW, y: listY + Math.floor(i / cols) * rowH, w: cellW - 2, h: rowH - 2 }, w }));
  const listH = Math.ceil(listed.length / cols) * rowH;
  // (the word whose page is written: the open word where it is on the open page, else that page's first found, or none yet)
  const open: WordId | null = paged ? (st.sel && listed.includes(st.sel) ? st.sel : listed.find((w) => meta.known[w].found) ?? null) : st.sel;
  // the strip at the bottom: the words kept in the book
  const chipW = T ? 34 : 30;
  const chipH = T ? 20 : 16;
  const pageX = narrow ? px + 6 : listX + listW + 8;
  const pageW = px + pw - 6 - pageX;
  // (on a wide screen the strip lies under the page only: the list of words runs the panel's full height)
  const stripX = pageX;
  const stripW = pageW;
  const perRow = Math.max(1, Math.floor((stripW + 3) / (chipW + 3)));
  const keptH = Math.max(1, Math.ceil(kept.length / perRow)) * (chipH + 3) - 3;
  const stripH = kept.length ? 9 + keptH + 3 : 0;
  const stripY = py + ph - stripH - 4;
  const pageY = narrow ? listY + listH + 6 : listY;
  const pageH = stripY - pageY - 2;
  const keptY = stripY + 9;
  const chips: { r: Rect; w: WordId; n: number }[] = kept.map((w, i) => ({ r: { x: stripX + (i % perRow) * (chipW + 3), y: keptY + Math.floor(i / perRow) * (chipH + 3), w: chipW, h: chipH }, w, n: meta.lexicon[w] }));
  const closeR: Rect = T ? { x: px + pw - 24, y: py + 3, w: 21, h: 17 } : { x: px + pw - 15, y: py + 3, w: 12, h: 11 };

  for (const c of cells) ui.mark(`lex:${c.w}`, c.r.x, c.r.y, c.r.w, c.r.h);
  for (const c of chips) ui.mark(`kept:${c.w}`, c.r.x, c.r.y, c.r.w, c.r.h);
  tabs.forEach((t, i) => ui.mark(`lextab:${i}`, t.x, t.y, t.w, t.h));

  // ---- presses ----------------------------------------------------------------------------------
  let close = false;
  if (ui.pressIn(closeR.x, closeR.y, closeR.w, closeR.h)) close = true;
  // (a tab tapped: its page opens at its first word found; a page with none found yet is opened too)
  tabs.forEach((t, i) => {
    if (!ui.pressIn(t.x, t.y, t.w, t.h)) return;
    if (i !== at) st.turned = true;
    st.tab = i;
    const first = LEX_PAGES[i].words.find((w) => meta.known[w].found);
    if (first) st.sel = first;
  });
  for (const c of cells) {
    if (!ui.pressIn(c.r.x, c.r.y, c.r.w, c.r.h)) continue;
    if (meta.known[c.w].found) st.sel = c.w;
  }
  for (const c of chips) {
    if (!ui.pressIn(c.r.x, c.r.y, c.r.w, c.r.h)) continue;
    if (meta.known[c.w].found) {
      st.sel = c.w;
      st.tab = null;
    }
  }
  const inPanel = ui.press && !ui.used && ui.press.x >= px && ui.press.y >= py && ui.press.x < px + pw && ui.press.y < py + ph;
  if (ui.press && !ui.used && !inPanel) close = true;

  // (THE LEXICON IN PAGES: the page that is open here is being looked at: its words found are seen, and mark no tab; without
  // the pages, the word whose page is open)
  if (paged) lexSeen(meta, listed);
  else if (st.sel) lexSeen(meta, [st.sel]);

  // ---- draw -------------------------------------------------------------------------------------
  ui.shade(0.75);
  ui.panel(px, py, pw, ph);
  let hx = px + 7;
  hx += ui.text('LEXICON', hx, py + (T ? 8 : 5), THEME.accent) + 8;
  ui.text(`${found.length} of ${WORD_IDS.length} words found`, hx, py + (T ? 10 : 7), THEME.dim, 'left', true);
  ui.drawButton(closeR.x, closeR.y, closeR.w, closeR.h, 'x', {});
  if (st.noteT > 0) ui.text(st.note, closeR.x - 5, py + (T ? 8 : 5), THEME.bad, 'right');
  if (paged) drawTabs(ui, meta, tabs, at);

  // the list: a line for each word there is; the ones not found yet are only a line
  for (const c of cells) {
    const k = meta.known[c.w];
    if (!k.found) {
      ui.box(c.r.x, c.r.y, c.r.w, c.r.h, THEME.slot, THEME.edge);
      drawText(g, '? ? ?', c.r.x + Math.floor(c.r.w / 2), c.r.y + Math.floor((c.r.h - 5) / 2), THEME.faint, { align: 'center', font: 'small' });
      continue;
    }
    const on = open === c.w;
    const hot = ui.hover(c.r.x, c.r.y, c.r.w, c.r.h);
    ui.box(c.r.x, c.r.y, c.r.w, c.r.h, on ? THEME.hot : hot ? THEME.hot : THEME.bg2, on ? THEME.accent : WORD_COLOR[c.w]);
    const icon = art.icons.word[c.w];
    g.drawImage(icon.img, c.r.x + 2, c.r.y + Math.floor((c.r.h - icon.h) / 2));
    const name = WORDS[c.w].name.toUpperCase();
    const small = textWidth(name) > c.r.w - 30;
    drawText(g, name, c.r.x + 16, c.r.y + Math.floor((c.r.h - (small ? 5 : 8)) / 2) + (small ? 0 : 1), WORD_COLOR[c.w], { font: small ? 'small' : 'normal' });
    // four pips: in front, behind, on gear, on a dungeon. Lit when that use is known.
    [k.front, k.behind, k.gear, k.dungeon].forEach((known, i) => {
      g.fillStyle = known ? WORD_COLOR[c.w] : THEME.faint;
      g.fillRect(c.r.x + c.r.w - 4, c.r.y + 2 + i * 3, 2, 2);
    });
  }

  // the page of the word that is open
  if (open) drawWordPage(g, meta, open, pageX, pageY, pageW, pageH, !narrow);
  else if (paged && found.length) drawText(g, 'No word of this page found yet.', pageX, pageY + 2, THEME.dim);
  else wrapText('No word found yet. The first lies in a satchel, half way through the first dungeon.', pageW, 'normal').forEach((row, i) => drawText(g, row, pageX, pageY + 2 + i * 9, THEME.dim));

  // the strip: words kept in the book between characters
  if (stripH > 0) {
    g.fillStyle = THEME.edge;
    g.fillRect(stripX, stripY, stripW, 1);
    ui.text('KEPT FOR YOUR NEXT CHARACTER', stripX, stripY + 2, THEME.dim, 'left', true);
    for (const c of chips) {
      ui.box(c.r.x, c.r.y, c.r.w, c.r.h, THEME.slot, WORD_COLOR[c.w]);
      g.drawImage(art.icons.word[c.w].img, c.r.x + 2, c.r.y + Math.floor((c.r.h - 12) / 2));
      drawText(g, `x${c.n}`, c.r.x + 16, c.r.y + Math.floor((c.r.h - 5) / 2), THEME.text, { font: 'small' });
    }
  }
  return close;
}
