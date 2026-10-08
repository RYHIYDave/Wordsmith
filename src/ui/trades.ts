// The trades (the town's third update): the wordsmith's trade in words, and the stranger's gamble.
// Each has its half of the screen beside the inventory, as the vendors, the stash, the Lexicon and
// the gate have (ui/town.ts, Version 14.3).
//
// The owner, 4 Oct 2026: "The wordsmith should buy and sell words"; and "a shady guy in the
// corner that will let you gamble for a random item."
//
// THE WORDSMITH. His shelf: the few words he has for sale on this visit, each at the one price.
// Under it, the words he has been sold on this visit, each to be had back for what he paid (a
// word sold by a slip of the finger is not lost). A word of his is pressed to be read: its page
// is written under the shelves, with the button that buys it. (A second press does NOT buy, as it
// does a piece at a vendor's: a word is a dungeon's whole purse, and there is no having that back.
// A mouse's right button buys at once, as everywhere.) A spare word of the hero's is sold from
// the inventory's side: pressed there, its card has SELL and what he pays; or it is carried over
// to this half and let go. Words are burned into gear on the inventory's own half, as before:
// that needs nothing of his.
//
// THE STRANGER. A grid of the kinds of piece he will throw for. One is pressed: what a throw
// costs is said, with the button that pays for it. What comes is in the bag at once, and is named
// here in the colour of what it is; the kind stays picked, so that the next throw is one press.

import { RARITY_COLOR } from '../art/palette';
import { drawText, textWidth, wrapText } from '../engine/font';
import { GAMBLE_KINDS, TUNE, WORDS } from '../game/defs';
import type { Game } from '../game/game';
import type { Meta } from '../game/state';
import type { WordId } from '../game/types';
import type { Art } from '../render/render';
import type { InvUi, Side, SideOver } from './inventory';
import { drawWordPage } from './lexicon';
import { CELL, PITCH } from './panels';
import type { Panels } from './panels';
import { SIDE_M, putDown, sideBody, sideFrame, sideHead } from './town';
import { THEME, inside } from './ui';
import type { Rect, Ui } from './ui';
import { drawWordTile } from './words';

/** The one place on the wordsmith's half a word of the hero's goes to: sold. */
const SELL = 'sell';

/** A frame round a half, for while something is carried over it that may be let go there. */
function ring(ui: Ui, r: Rect, color: string): void {
  const g = ui.g;
  g.fillStyle = color;
  g.fillRect(r.x + 2, r.y + 2, r.w - 4, 1);
  g.fillRect(r.x + 2, r.y + r.h - 3, r.w - 4, 1);
  g.fillRect(r.x + 2, r.y + 2, 1, r.h - 4);
  g.fillRect(r.x + r.w - 3, r.y + 2, 1, r.h - 4);
}

/** Small lines of text, one under another, from (x, y). Returns where they end. */
function small(ui: Ui, text: string, x: number, y: number, w: number, color: string): number {
  for (const row of wrapText(text, w, 'small')) {
    drawText(ui.g, row, x, y, color, { font: 'small' });
    y += 6;
  }
  return y;
}

/**
 * The wordsmith's half. `st.pick` is the word of his that is picked: "word:1" on his shelf,
 * "wsold:0" among those he was sold.
 */
export function wordsmithSide(ui: Ui, game: Game, art: Art, meta: Meta, st: Panels, inv: InvUi, r: Rect): Side {
  const g = ui.g;
  const T = ui.touch;
  const h = game.hero;
  const body = sideBody(r, ui.w, ui.h);
  const x0 = r.x + SIDE_M;
  const bw = r.w - 2 * SIDE_M;
  const bodyY = r.y + 2 + sideHead(ui) + 2;
  const price = game.wordPrice();
  const pays = game.wordSellValue();
  const cols = Math.max(1, Math.floor((bw + 2) / PITCH));
  interface Cell { id: string; i: number; w: WordId | null; r: Rect; bought: boolean }
  // his shelf, and what he has been sold: a caption, then the cells
  const shelfY = bodyY + 8;
  const shelf: Cell[] = game.wordStock.map((w, i) => ({ id: `word:${i}`, i, w, r: { x: x0 + i * PITCH, y: shelfY, w: CELL, h: CELL }, bought: false }));
  const soldCap = shelfY + CELL + 5;
  const soldY = soldCap + 8;
  const sold: Cell[] = Array.from({ length: TUNE.wordsSoldKept }, (_, i) => ({ id: `wsold:${i}`, i, w: (game.wordsSold[i] ?? null) as WordId | null, r: { x: x0 + (i % cols) * PITCH, y: soldY + Math.floor(i / cols) * PITCH, w: CELL, h: CELL }, bought: true }));
  const soldEnd = soldY + Math.ceil(TUNE.wordsSoldKept / cols) * PITCH - 2;
  const cells = [...shelf, ...sold];
  for (const c of cells) ui.mark(c.id, c.r.x, c.r.y, c.r.w, c.r.h);
  const picked = (): Cell | undefined => cells.find((c) => c.id === st.pick && c.w !== null);
  /** What having the word in a cell costs, and what does it. */
  const offer = (c: Cell): { label: string; cost: number; act: () => string | null } =>
    c.bought ? { label: `BUY BACK: ${pays} GOLD`, cost: pays, act: () => game.buyBackWord(c.i) } : { label: `BUY: ${price} GOLD`, cost: price, act: () => game.buyWord(c.i) };
  const bh = T ? 18 : 13;
  const button = (label: string): Rect => {
    const w = textWidth(label) + 16;
    return { x: r.x + r.w - SIDE_M - w, y: body.y + body.h - bh - 5, w, h: bh };
  };
  const pageY = soldEnd + 6;
  /** Where the next word he is sold will lie. */
  const nextSold = sold[Math.min(game.wordsSold.length, sold.length - 1)].r;

  return {
    press(say): void {
      // (the inventory has taken something in hand since: what was picked here is put down)
      if (inv.sel || inv.word || inv.pending || inv.look) st.pick = null;
      if (st.pick && !picked()) st.pick = null;
      const p = picked();
      if (p) {
        const o = offer(p);
        const b = button(o.label);
        if (ui.pressIn(b.x, b.y, b.w, b.h)) {
          const why = h.gold < o.cost ? 'Not enough gold' : o.act();
          say(why);
          if (!why) st.pick = null;
        }
      }
      for (const c of cells) {
        const quick = ui.pressIn(c.r.x, c.r.y, c.r.w, c.r.h, 2);
        const press = !quick && ui.pressIn(c.r.x, c.r.y, c.r.w, c.r.h);
        if (!quick && !press) continue;
        putDown(inv);
        if (c.w === null) {
          st.pick = null;
          continue;
        }
        if (quick) {
          // the right button: it is bought at once
          say(offer(c).act());
          st.pick = null;
          continue;
        }
        st.pick = c.id;
      }
      // (a press on its bare ground: the word picked is put down)
      if (ui.press && !ui.used && inside(r, ui.press.x, ui.press.y)) st.pick = null;
    },

    // a spare word of the hero's: sold from its card, or carried over here and let go
    wordAt: (x, y) => (inside(r, x, y) ? SELL : null),
    wordRect: () => nextSold,
    wordProblem: (w) => (h.words[w] > 0 ? null : 'No spare word'),
    wordDrop: (w) => game.sellWord(w),
    wordRead: (w) => [{ text: `Let go, and he pays ${pays} gold for ${WORDS[w].name}.`, color: THEME.gold, small: true }],
    wordHint: () => `He pays ${pays} gold for a spare word.`,
    wordButtons: (w) => [{ label: `SELL: ${pays} GOLD`, act: () => game.sellWord(w), lit: true }],

    draw(over: SideOver): void {
      sideFrame(ui, r, 'WORDSMITH');
      drawText(g, `HIS WORDS: ${price} GOLD EACH`, x0, bodyY, THEME.dim, { font: 'small' });
      // (the owner, 5 Oct 2026, 22:44, of the armourer's "YOU SOLD: BUY BACK FOR THE SAME": 'Change
      // that whole buy back line to just "Buy Back"'. The same here; what a word costs to buy back is on its button.)
      drawText(g, 'BUY BACK', x0, soldCap, THEME.dim, { font: 'small' });
      const p = picked();
      for (const c of cells) {
        if (c.w === null) {
          ui.box(c.r.x, c.r.y, CELL, CELL, THEME.slot, THEME.edge);
          // (a place on his shelf that is empty is a word that has been bought)
          if (!c.bought) drawText(g, 'SOLD', c.r.x + Math.floor(CELL / 2), c.r.y + Math.floor((CELL - 5) / 2), THEME.faint, { align: 'center', font: 'small' });
          continue;
        }
        const on = !!p && p.id === c.id;
        drawWordTile(ui, art, c.r.x, c.r.y, CELL, CELL, c.w, 'name', { stone: true, lit: on || (!T && ui.hover(c.r.x, c.r.y, CELL, CELL)), edge: on ? THEME.accent : undefined });
        // (one he asks more for than the hero has is dimmed)
        if (h.gold < offer(c).cost) {
          g.globalAlpha = 0.45;
          g.fillStyle = THEME.ink;
          g.fillRect(c.r.x + 1, c.r.y + 1, CELL - 2, CELL - 2);
          g.globalAlpha = 1;
        }
      }
      // a word of the hero's is over this half: what letting go will do
      if (over.hand && over.at === SELL) {
        ring(ui, r, over.blink ? THEME.accent : THEME.accentLo);
        ui.box(nextSold.x, nextSold.y, CELL, CELL, THEME.accentBg, THEME.accent);
        drawText(g, `LET GO TO SELL: ${pays} GOLD`, r.x + Math.floor(r.w / 2), Math.min(body.y + body.h - 14, pageY + 10), THEME.accent, { align: 'center' });
        return;
      }
      if (p && p.w !== null) {
        // the word picked: its page, and the button that buys it
        const o = offer(p);
        const b = button(o.label);
        const poor = h.gold < o.cost;
        drawWordPage(g, meta, p.w, x0, pageY, bw, b.y - 3 - pageY, false, true);
        if (poor) drawText(g, `YOU HAVE ${h.gold}`, b.x - 6, b.y + Math.floor((bh - 5) / 2), THEME.bad, { align: 'right', font: 'small' });
        ui.drawButton(b.x, b.y, b.w, b.h, o.label, { lit: !poor, disabled: poor, primary: !poor });
        return;
      }
      // nothing of his is picked: how the trade is done
      if (inv.sel || inv.word || inv.pending || inv.result) return;
      let y = pageY + 2;
      y = small(ui, T ? 'Tap one of his words to read it.' : 'Click one of his words to read it. Right-click buys it.', x0, y, bw, THEME.text) + 3;
      y = small(ui, T ? 'To sell a spare word of yours, tap it and press SELL, or drag it here.' : 'To sell a spare word of yours, click it and press SELL, or drag it here.', x0, y, bw, THEME.text) + 3;
      if (y + 12 <= body.y + body.h) small(ui, 'Burn a word into your gear as you always have: on your side of the screen.', x0, y, bw, THEME.faint);
    },
  };
}

/** What kind of thing a rarity is called. */
const RARITY_WORD = ['plain', 'magic', 'rare', 'unique'] as const;

/**
 * The stranger's half. `st.pick` is the kind picked ("kind:3"). What the last throw brought is
 * the game's (`game.won`: where in the bag it lies).
 */
export function gambleSide(ui: Ui, game: Game, art: Art, st: Panels, inv: InvUi, r: Rect): Side {
  const g = ui.g;
  const T = ui.touch;
  const h = game.hero;
  const body = sideBody(r, ui.w, ui.h);
  const x0 = r.x + SIDE_M;
  const bw = r.w - 2 * SIDE_M;
  const bodyY = r.y + 2 + sideHead(ui) + 2;
  const intro = wrapText('Pay, and take what comes: most often plain, sometimes better.', bw, 'small');
  const capY = bodyY + intro.length * 6 + 4;
  const gridY = capY + 8;
  const cols = Math.max(1, Math.min(8, Math.floor((bw + 2) / PITCH)));
  const cells = GAMBLE_KINDS.map((kind, k) => ({ id: `kind:${k}`, k, kind, r: { x: x0 + (k % cols) * PITCH, y: gridY + Math.floor(k / cols) * PITCH, w: CELL, h: CELL } }));
  const gridEnd = gridY + Math.ceil(GAMBLE_KINDS.length / cols) * PITCH - 2;
  for (const c of cells) ui.mark(c.id, c.r.x, c.r.y, c.r.w, c.r.h);
  const picked = (): (typeof cells)[number] | undefined => cells.find((c) => c.id === st.pick);
  const bh = T ? 18 : 13;
  const button = (label: string): Rect => {
    const w = textWidth(label) + 16;
    return { x: r.x + r.w - SIDE_M - w, y: body.y + body.h - bh - 5, w, h: bh };
  };
  /** Why a throw for kind `k` cannot be made just now, if it cannot. */
  const problem = (k: number): string | null => (h.gold < game.gamblePrice(k) ? 'Not enough gold' : h.bag.indexOf(null) < 0 ? 'Bag is full' : null);

  return {
    press(say): void {
      const p = picked();
      if (p) {
        const b = button(`THROW: ${game.gamblePrice(p.k)} GOLD`);
        if (ui.pressIn(b.x, b.y, b.w, b.h)) {
          putDown(inv);
          say(problem(p.k) ?? game.gamble(p.k));
        }
      }
      for (const c of cells) {
        const quick = ui.pressIn(c.r.x, c.r.y, c.r.w, c.r.h, 2);
        const press = !quick && ui.pressIn(c.r.x, c.r.y, c.r.w, c.r.h);
        if (!quick && !press) continue;
        putDown(inv);
        st.pick = c.id;
        // (the right button: a throw at once)
        if (quick) say(problem(c.k) ?? game.gamble(c.k));
      }
      if (ui.press && !ui.used && inside(r, ui.press.x, ui.press.y)) st.pick = null;
    },

    draw(): void {
      sideFrame(ui, r, 'THE STRANGER');
      intro.forEach((l, k) => drawText(g, l, x0, bodyY + 1 + k * 6, THEME.text, { font: 'small' }));
      drawText(g, 'A THROW FOR', x0, capY, THEME.dim, { font: 'small' });
      const p = picked();
      for (const c of cells) {
        const on = !!p && p.id === c.id;
        ui.slot(c.r.x, c.r.y, CELL, art.icons.item[c.kind.icon], on ? THEME.accent : THEME.edge, on || (!T && ui.hover(c.r.x, c.r.y, CELL, CELL)));
        if (h.gold < game.gamblePrice(c.k)) {
          g.globalAlpha = 0.45;
          g.fillStyle = THEME.ink;
          g.fillRect(c.r.x + 1, c.r.y + 1, CELL - 2, CELL - 2);
          g.globalAlpha = 1;
        }
      }
      // (something of the inventory's is being read: its card lies over the foot of this half)
      if (inv.sel || inv.word || inv.pending || inv.result) return;
      let y = gridEnd + 6;
      // what the last throw brought
      const won = game.won >= 0 ? h.bag[game.won] : null;
      if (won) {
        drawText(g, 'YOU GOT', x0, y, THEME.dim, { font: 'small' });
        y += 7;
        for (const row of wrapText(won.name.toUpperCase(), bw)) {
          drawText(g, row, x0, y, RARITY_COLOR[won.rarity]);
          y += 9;
        }
        y = small(ui, `A ${RARITY_WORD[won.rarity] ?? 'plain'} piece. It is in your bag.`, x0, y, bw, THEME.dim) + 4;
      }
      if (!p) {
        if (y + 6 <= body.y + body.h) small(ui, T ? 'Tap a kind of piece to throw for it.' : 'Click a kind of piece to throw for it. Right-click throws at once.', x0, y, bw, THEME.faint);
        return;
      }
      const cost = game.gamblePrice(p.k);
      const b = button(`THROW: ${cost} GOLD`);
      const why = problem(p.k);
      if (y + 9 <= b.y - 2) drawText(g, p.kind.name.toUpperCase(), x0, y, THEME.accent);
      if (why) drawText(g, why === 'Not enough gold' ? `YOU HAVE ${h.gold}` : why.toUpperCase(), b.x - 6, b.y + Math.floor((bh - 5) / 2), THEME.bad, { align: 'right', font: 'small' });
      ui.drawButton(b.x, b.y, b.w, b.h, `THROW: ${cost} GOLD`, { lit: !why, disabled: !!why, primary: !why });
    },
  };
}
