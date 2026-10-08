// The town's services, each in its half of the screen beside the inventory (Version 14.3): the
// vendor, the stash and the gate. (The Lexicon's half is with its book, lexicon.ts. The wordsmith
// opens the inventory alone: words are burned into gear there.)
//
// The owner, 5 Oct 2026: "Vendors, stash, and lexicon would take up the left side so you would
// have access to your inventory on the right side". Until then each was a panel in the middle of
// the screen with a copy of the bag in it. Now the bag is the inventory's own, on its half, and a
// service shows only what is its own: what is for sale, what is in the stash, what is on the
// gate. Each is a `Side` (inventory.ts), made afresh every frame; the inventory calls into it.
//
// How a thing changes hands is the same everywhere, and is the inventory's own way:
//   - press a piece to read it (on the inventory's card, beside the piece it would replace); the
//     card has the button for what can be done with it here (BUY, TAKE; SELL, STASH);
//   - press it a second time, or use the right button, and that is done at once;
//   - or carry it across to the other half and let go.
// A word goes onto the gate as it goes into an attack: pressed and then the place, or dragged.

import { WORD_COLOR } from '../art/icons';
import { P, RARITY_COLOR } from '../art/palette';
import { drawText, textWidth, wrapText } from '../engine/font';
import { TUNE, VENDORS, WORDS } from '../game/defs';
import type { Game } from '../game/game';
import { itemValue } from '../game/items';
import type { Item, WordId } from '../game/types';
import { FIGURE_SIZE } from '../art/bestiary';
import { IDLE_FPS } from '../art/kit';
import type { Art } from '../render/render';
import { invRect } from './inventory';
import type { InvUi, Side, SideButton, SideOver } from './inventory';
import { CELL, PITCH, drawItemPips } from './panels';
import type { Line, Panels } from './panels';
import { THEME, inside } from './ui';
import type { Rect, Ui } from './ui';
import { drawWordTile } from './words';

/** The air between a half's edge and its own things. */
export const SIDE_M = 6;

/** How tall the line of a half's title is: the inventory's line of page names is the same, so the two halves stand level. */
export function sideHead(ui: Ui): number {
  return ui.touch ? 22 : 16;
}

/**
 * The ground of a service's half, and its title (with a few quieter words after it, where there
 * is room). Returns where its own things begin.
 */
export function sideFrame(ui: Ui, r: Rect, title: string, sub = ''): number {
  const g = ui.g;
  g.fillStyle = THEME.ink;
  g.fillRect(r.x, r.y, r.w, r.h);
  const head = sideHead(ui);
  const ty = r.y + 3 + Math.floor((head - 3 - 8) / 2) + 1;
  const x = r.x + SIDE_M + 1;
  const tw = drawText(g, title, x, ty, THEME.accent);
  if (sub && x + tw + 8 + textWidth(sub, 'small') <= r.x + r.w - SIDE_M) drawText(g, sub, x + tw + 8, ty + 2, THEME.dim, { font: 'small' });
  return r.y + 2 + head + 2;
}

/** How much of the foot of a service's half is left clear where the inventory lies under it, for what is read. */
export const CARD_ROOM = 96;

/**
 * The part of its half a service lays its own things out in. Beside the inventory, all of it.
 * Where the inventory lies UNDER the service (a phone held upright), what is read of the
 * inventory's (a word, a piece) is on a card over the foot of the service's half, against the
 * inventory's edge: so the service keeps its things clear of that foot, or the card would lie
 * on them (on the Lexicon's shelf, on ENTER DUNGEON).
 */
export function sideBody(r: Rect, W: number, H: number): Rect {
  const under = r.x === 0 && r.y === 0 && r.w === W && r.h < H;
  return under ? { x: r.x, y: r.y, w: r.w, h: Math.max(Math.min(r.h, 200), r.h - CARD_ROOM) } : r;
}

/** Whatever the inventory has in hand or is reading is put down: something on the service's half has been pressed. */
export function putDown(inv: InvUi): void {
  inv.sel = null;
  inv.word = null;
  inv.look = null;
  inv.pending = null;
  inv.result = null;
}

/** Small lines of text, one under another, from (x, y). Returns where they end. */
function small(ui: Ui, text: string, x: number, y: number, w: number, color: string): number {
  for (const row of wrapText(text, w, 'small')) {
    drawText(ui.g, row, x, y, color, { font: 'small' });
    y += 6;
  }
  return y;
}

// =============================================================================================
// A service that keeps pieces of gear: the vendor, the stash

/** A block of cells in a keeper's half: what is for sale, what was sold, what is in the stash. */
interface Shelf {
  /** The small line over its cells. */
  caption: string;
  /** What its cells are called ("shop:3"): automated playtests press them by name. */
  prefix: string;
  /** What lies in it, and how many cells it has (the rest are empty). */
  items: readonly (Item | null | undefined)[];
  cells: number;
  /** A piece of it goes to the bag (it is bought, it is taken out). */
  take(i: number): string | null;
  /** The button for that on the piece's card, and anything the card must say first. */
  offer(it: Item): { label: string; disabled: boolean; lines: Line[] };
  /** A piece that cannot be had just now (it is shown dimmed). */
  dim?(it: Item): boolean;
}

interface Keeper {
  title: string;
  /** How many cells to a row, where the half is wide enough. */
  cols: number;
  shelves: Shelf[];
  /** A piece out of the bag comes here (it is sold, it is put away). */
  give(i: number): string | null;
  /** The button for that on the card of a piece in the bag. */
  giveLabel(it: Item): string;
  /** What letting go of a piece carried over from the bag will do, in a few words. */
  dropLine(it: Item): string;
  /** How it is used, in a line. */
  foot: string;
}

function keeperSide(ui: Ui, art: Art, st: Panels, inv: InvUi, r: Rect, spec: Keeper): Side {
  const g = ui.g;
  const T = ui.touch;
  /** The inventory's half: where a piece carried out of this one is let go. */
  const R = invRect(ui.w, ui.h);
  /** Where its own things go (the foot of the half is left to what is read, where the inventory lies under it). */
  const body = sideBody(r, ui.w, ui.h);
  const bodyY = r.y + 2 + sideHead(ui) + 2;
  const cols = Math.max(1, Math.min(spec.cols, Math.floor((r.w - 2 * SIDE_M + 2) / PITCH)));
  const gx = r.x + SIDE_M;
  // the shelves, one under another: a caption, then its cells in rows
  interface Cell { id: string; shelf: Shelf; i: number; item: Item | null; r: Rect }
  const cells: Cell[] = [];
  const caps: { text: string; y: number }[] = [];
  let y = bodyY;
  for (const sh of spec.shelves) {
    caps.push({ text: sh.caption, y });
    y += 8;
    for (let i = 0; i < sh.cells; i++) cells.push({ id: `${sh.prefix}:${i}`, shelf: sh, i, item: sh.items[i] ?? null, r: { x: gx + (i % cols) * PITCH, y: y + Math.floor(i / cols) * PITCH, w: CELL, h: CELL } });
    y += Math.ceil(sh.cells / cols) * PITCH + 2;
  }
  const gy = bodyY + 8;
  const gridEnd = y - 4;
  for (const c of cells) ui.mark(c.id, c.r.x, c.r.y, c.r.w, c.r.h);
  const cellOf = (id: string | null): Cell | undefined => (id ? cells.find((c) => c.id === id && c.item) : undefined);
  /** Where the piece being carried out of this half is, while one is. */
  let carryAt: { x: number; y: number } | null = null;
  const moving = (): boolean => !!st.carry && st.carry.moving;
  /** Something is being read on a card (a piece of this half's, or something of the inventory's): the card lies over the foot of this half. */
  const reading = (): boolean => !!inv.sel || !!inv.word || !!inv.pending || !!inv.result || !!cellOf(st.pick) || (!T && cells.some((q) => q.item && ui.hover(q.r.x, q.r.y, q.r.w, q.r.h)));

  return {
    press(say): void {
      // (the inventory has taken something in hand since: what was picked here is put down)
      if (inv.sel || inv.word || inv.pending || inv.look) st.pick = null;
      if (st.pick && !cellOf(st.pick)) st.pick = null;
      for (const c of cells) {
        const quick = ui.pressIn(c.r.x, c.r.y, c.r.w, c.r.h, 2);
        const press = !quick && ui.pressIn(c.r.x, c.r.y, c.r.w, c.r.h);
        if (!quick && !press) continue;
        putDown(inv);
        if (!c.item) {
          st.pick = null;
          continue;
        }
        if (quick) {
          // the right button: it goes to the bag at once
          say(c.shelf.take(c.i));
          st.pick = null;
          continue;
        }
        // a piece is pressed: it is read (on the inventory's card), and may be carried from here.
        // A second press on it, let go where it is, takes it.
        st.carry = { id: c.id, x0: ui.press ? ui.press.x : c.r.x, y0: ui.press ? ui.press.y : c.r.y, moving: false, was: st.pick === c.id };
        st.pick = c.id;
      }
      // (a press on its bare ground: the piece picked is put down; the inventory puts down its own)
      if (ui.press && !ui.used && inside(r, ui.press.x, ui.press.y)) st.pick = null;
      const cy = st.carry;
      if (cy) {
        const c = cellOf(cy.id);
        if (!c) st.carry = null;
        else {
          if (ui.held) {
            if (!cy.moving && Math.hypot(ui.held.x - cy.x0, ui.held.y - cy.y0) > 5) cy.moving = true;
            if (cy.moving) carryAt = ui.held;
          }
          if (ui.release) {
            // carried over to the inventory's half and let go; or pressed a second time where it lies
            if (cy.moving ? inside(R, ui.release.x, ui.release.y) : cy.was) {
              say(c.shelf.take(c.i));
              st.pick = null;
            }
            st.carry = null;
          } else if (!ui.held) st.carry = null;
        }
      }
    },

    look() {
      if (moving()) return null;
      const picked = cellOf(st.pick);
      // (with a mouse, the piece under the pointer is read; its button comes when it is picked)
      const c = (T ? undefined : cells.find((q) => q.item && ui.hover(q.r.x, q.r.y, q.r.w, q.r.h))) ?? picked;
      if (!c || !c.item) return null;
      const o = c.shelf.offer(c.item);
      const take = (): string | null => {
        const why = c.shelf.take(c.i);
        st.pick = null;
        return why;
      };
      // (the card goes under the cells, in line with the piece: it must not lie on the others)
      return { item: c.item, anchor: { x: c.r.x, y: gy, w: c.r.w, h: gridEnd - gy }, lines: o.lines, buttons: c === picked ? [{ label: o.label, act: take, lit: !o.disabled, disabled: o.disabled }] : [] };
    },

    bagButton(i, it): SideButton {
      return { label: spec.giveLabel(it), act: () => spec.give(i) };
    },
    bagQuick: (i) => spec.give(i),
    pieceDrop: (i) => spec.give(i),

    draw(over: SideOver): void {
      sideFrame(ui, r, spec.title);
      for (const c of caps) drawText(g, c.text, gx, c.y, THEME.dim, { font: 'small' });
      for (const c of cells) {
        const it = c.item;
        const away = !!carryAt && !!st.carry && st.carry.id === c.id;
        const picked = c.id === st.pick && !!it;
        const lit = picked || (!T && !!it && ui.hover(c.r.x, c.r.y, c.r.w, c.r.h));
        ui.slot(c.r.x, c.r.y, CELL, it && !away ? art.icons.item[it.icon] : null, picked ? THEME.accent : it ? RARITY_COLOR[it.rarity] : THEME.edge, lit);
        if (it && !away) drawItemPips(g, it, c.r.x, c.r.y);
        if (it && !away && c.shelf.dim && c.shelf.dim(it)) {
          g.globalAlpha = 0.45;
          g.fillStyle = P.bl2;
          g.fillRect(c.r.x + 1, c.r.y + 1, CELL - 2, CELL - 2);
          g.globalAlpha = 1;
        }
      }
      // how it is used, along the bottom; or, while a piece out of the bag is over this half, a
      // frame round the half and what letting go will do
      const foot = wrapText(spec.foot, r.w - 2 * SIDE_M, 'small');
      const fy = body.y + body.h - 3 - foot.length * 6;
      if (over.piece) {
        g.fillStyle = over.blink ? THEME.accent : THEME.accentLo;
        g.fillRect(r.x + 2, r.y + 2, r.w - 4, 1);
        g.fillRect(r.x + 2, r.y + r.h - 3, r.w - 4, 1);
        g.fillRect(r.x + 2, r.y + 2, 1, r.h - 4);
        g.fillRect(r.x + r.w - 3, r.y + 2, 1, r.h - 4);
        drawText(g, spec.dropLine(over.piece), r.x + Math.floor(r.w / 2), Math.min(fy - 2, r.y + r.h - 14), THEME.accent, { align: 'center' });
      } else if (fy >= gridEnd + 4 && !reading()) small(ui, spec.foot, gx, fy, r.w - 2 * SIDE_M, THEME.faint);
    },

    drawOver(): void {
      const c = st.carry ? cellOf(st.carry.id) : undefined;
      if (!carryAt || !c || !c.item) return;
      // (it will go to the bag if it is let go over the inventory: that half says so)
      if (inside(R, carryAt.x, carryAt.y)) {
        g.fillStyle = THEME.accent;
        g.fillRect(R.x + 2, R.y + 2, R.w - 4, 1);
        g.fillRect(R.x + 2, R.y + R.h - 3, R.w - 4, 1);
        g.fillRect(R.x + 2, R.y + 2, 1, R.h - 4);
        g.fillRect(R.x + R.w - 3, R.y + 2, 1, R.h - 4);
      }
      // the piece follows the finger (a finger hides what is under it: the piece floats above it)
      g.globalAlpha = 0.95;
      ui.slot(Math.round(carryAt.x - CELL / 2), Math.round(carryAt.y - (T ? CELL + 8 : CELL / 2)), CELL, art.icons.item[c.item.icon], RARITY_COLOR[c.item.rarity], true);
      g.globalAlpha = 1;
    },
  };
}


/**
 * A vendor's half (the armourer's or the mystic's: `game.vendor`): a row of what is for sale;
 * and under it what the hero has sold on this visit, to either of them, each piece to be had
 * back for what was paid for it (a piece sold by a slip of the finger is not lost).
 */
export function vendorSide(ui: Ui, game: Game, art: Art, st: Panels, inv: InvUi, r: Rect): Side {
  const h = game.hero;
  const offer = (price: number, word: string): { label: string; disabled: boolean; lines: Line[] } => {
    const poor = h.gold < price;
    return { label: `${word} ${price}`, disabled: poor, lines: poor ? [{ text: `You have ${h.gold} gold`, color: THEME.bad, small: true }] : [] };
  };
  return keeperSide(ui, art, st, inv, r, {
    title: VENDORS[game.vendor].name.toUpperCase(),
    cols: 10,
    shelves: [
      { caption: 'FOR SALE', prefix: 'shop', items: game.shop, cells: game.shop.length, take: (i) => game.buy(i), offer: (it) => offer(itemValue(it), 'BUY'), dim: (it) => h.gold < itemValue(it) },
      // (the owner, 5 Oct 2026, 22:44: 'Change that whole buy back line to just "Buy Back"'. It said YOU SOLD: BUY BACK FOR THE SAME.)
      { caption: 'BUY BACK', prefix: 'sold', items: game.sold, cells: TUNE.soldKept, take: (i) => game.buyBack(i), offer: (it) => offer(game.sellValue(it), 'BUY BACK'), dim: (it) => h.gold < game.sellValue(it) },
    ],
    give: (i) => game.sell(i),
    giveLabel: (it) => `SELL ${game.sellValue(it)}`,
    dropLine: (it) => `LET GO TO SELL: ${game.sellValue(it)} GOLD`,
    foot: ui.touch ? 'TAP A PIECE TWICE TO BUY OR SELL IT, OR DRAG IT ACROSS.' : 'RIGHT-CLICK A PIECE TO BUY OR SELL IT, OR DRAG IT ACROSS.',
  });
}

/** The stash's half: what is kept there, for this character and the ones after. */
export function stashSide(ui: Ui, game: Game, art: Art, st: Panels, inv: InvUi, r: Rect): Side {
  return keeperSide(ui, art, st, inv, r, {
    title: 'STASH',
    cols: 9,
    shelves: [{ caption: 'KEPT FOR LATER CHARACTERS', prefix: 'stash', items: game.meta.stash, cells: game.meta.stash.length, take: (i) => game.unstashItem(i), offer: () => ({ label: 'TAKE', disabled: false, lines: [] }) }],
    give: (i) => game.stashItem(i),
    giveLabel: () => 'STASH',
    dropLine: () => 'LET GO TO PUT IT AWAY',
    foot: ui.touch ? 'TAP A PIECE TWICE TO MOVE IT ACROSS, OR DRAG IT.' : 'RIGHT-CLICK A PIECE TO MOVE IT ACROSS, OR DRAG IT.',
  });
}

// =============================================================================================
// The gate: the next dungeon, and the words burned into it

/** What the words on the gate add up to, as one line. */
function rewardLine(n: number): string {
  return n === 0 ? '' : `Reward: +${30 * n}% items, +${25 * n} rarity, +${10 * n}% experience, likelier words.`;
}

export interface GateOut {
  enter: boolean;
}

/** The one place on the gate a word goes to: the next free socket. */
const PLAN = 'plan';

/**
 * The gate's half: the three sockets of the next dungeon, what waits at its end, and the way in.
 * `enterKey`: the key that steps through has been pressed. `out.enter` is set when the hero is
 * to go in. `t`: the clock (the Warden at the foot of the half stands in his loop).
 */
export function gateSide(ui: Ui, game: Game, art: Art, inv: InvUi, r: Rect, enterKey: boolean, out: GateOut, t = 0): Side {
  const g = ui.g;
  const T = ui.touch;
  const x0 = r.x + SIDE_M;
  const bw = r.w - 2 * SIDE_M;
  const bodyY = r.y + 2 + sideHead(ui) + 2;
  // (kept short: what each word would do is said beside it once it is in, and what they add up to at the foot)
  const intro = wrapText('Burn up to three spare words into this dungeon. They are used up.', bw, 'small');
  const capY = bodyY + intro.length * 6 + 4;
  const y0 = capY + 8;
  const rowH = CELL + 6;
  const socks = Array.from({ length: TUNE.planMax }, (_, i) => ({ i, r: { x: x0, y: y0 + i * rowH, w: CELL, h: CELL }, word: (game.plan[i] ?? null) as WordId | null }));
  for (const s of socks) ui.mark(`plan:${s.i}`, s.r.x, s.r.y, s.r.w, s.r.h);
  const rowsEnd = y0 + TUNE.planMax * rowH - 6;
  const bh = T ? 20 : 15;
  const label = `ENTER DUNGEON ${game.depth}`;
  const enterW = Math.min(bw, textWidth(label) + 24);
  /** (the foot of the half is left to what is read, where the inventory lies under it) */
  const body = sideBody(r, ui.w, ui.h);
  const enterR: Rect = { x: r.x + r.w - SIDE_M - enterW, y: body.y + body.h - bh - 6, w: enterW, h: bh };
  const greater = game.depth % 5 === 0;
  /** The socket the next word goes into, if one is free. */
  const next = socks.find((s) => !s.word);
  const lower = (s: string): string => `${s.charAt(0).toLowerCase()}${s.slice(1)}`;

  return {
    primary: true,

    press(say): void {
      if (ui.pressIn(enterR.x, enterR.y, enterR.w, enterR.h) || enterKey) out.enter = true;
      for (const s of socks) {
        // (the whole line is the socket's, for a finger)
        const row: Rect = { x: r.x, y: s.r.y - 3, w: r.w, h: rowH };
        const quick = ui.pressIn(row.x, row.y, row.w, row.h, 2);
        if (!quick && !ui.pressIn(row.x, row.y, row.w, row.h)) continue;
        if (s.word) {
          // a word that is on the gate: pressing it takes it back
          game.unplanWord(s.i);
          putDown(inv);
        } else if (inv.word && !quick) {
          // a word is in hand: this is where it goes
          const why = game.planWord(inv.word);
          if (why) say(why);
          else putDown(inv);
        } else say(T ? 'Tap one of your words first, or drag it here' : 'Pick one of your words first, or drag it here');
      }
    },

    wordAt: (x, y) => (inside(r, x, y) ? PLAN : null),
    wordRect: () => (next ? next.r : null),
    wordProblem: (w) => game.planProblem(w),
    wordDrop: (w) => game.planWord(w),
    wordHint: (w) => `On the gate, every monster: ${lower(WORDS[w].monsterText)}`,
    wordButtons: (w) => [{ label: 'TO THE GATE', act: () => game.planWord(w), lit: game.planProblem(w) === null, disabled: game.planProblem(w) !== null }],

    draw(over: SideOver): void {
      sideFrame(ui, r, `GATE: DUNGEON ${game.depth}`);
      intro.forEach((l, k) => drawText(g, l, x0, bodyY + 1 + k * 6, THEME.text, { font: 'small' }));
      drawText(g, 'BURNED INTO THE DUNGEON', x0, capY, THEME.dim, { font: 'small' });
      const tx = x0 + CELL + 5;
      const tw = bw - CELL - 5;
      /** The word in hand may go on the gate: its place is lit. */
      const ok = !!over.hand && game.planProblem(over.hand) === null;
      /** It is being carried over the gate (or a mouse holds it over its socket): it is shown lying in its place. */
      const hang = over.at === PLAN && (over.dragging || (!!next && ui.hover(r.x, next.r.y - 3, r.w, rowH))) ? over.hand : null;
      for (const s of socks) {
        const here = s === next;
        const w = s.word ?? (here && hang && ok ? hang : null);
        if (s.word) drawWordTile(ui, art, s.r.x, s.r.y, CELL, CELL, s.word, 'name', { stone: true, lit: ui.hover(r.x, s.r.y - 3, r.w, rowH) });
        else if (w) {
          ui.box(s.r.x, s.r.y, CELL, CELL, THEME.accentBg, P.white);
          drawWordTile(ui, art, s.r.x, s.r.y, CELL, CELL, w, 'name', { stone: true, lit: true, edge: P.white, alpha: T ? 0.6 : 0.95 });
        } else {
          // an empty socket: a dark notch with a plus in the middle, lit while the word in hand could go in
          const lit = here && ok;
          ui.box(s.r.x, s.r.y, CELL, CELL, lit ? (over.blink ? THEME.accentBg : THEME.accentBg2) : THEME.slot, lit ? (over.blink ? THEME.accent : THEME.accentLo) : THEME.edge);
          const px = s.r.x + Math.floor(CELL / 2);
          const py = s.r.y + Math.floor(CELL / 2);
          g.fillStyle = lit ? THEME.accent : THEME.edge;
          g.fillRect(px - 3, py, 7, 1);
          g.fillRect(px, py - 3, 1, 7);
        }
        if (w) {
          drawText(g, WORDS[w].name.toUpperCase(), tx, s.r.y + 1, WORD_COLOR[w]);
          small(ui, `Every monster: ${lower(WORDS[w].monsterText)}`, tx, s.r.y + 11, tw, s.word ? THEME.text : THEME.dim);
        } else if (here && hang && over.hand) {
          // (it hangs there and may not go in: why)
          const why = game.planProblem(over.hand);
          if (why) drawText(g, why, tx, s.r.y + 6, THEME.bad);
        } else if (here && !game.plan.length) {
          small(ui, T ? 'Tap one of your words, then here. Or drag it here.' : 'Click one of your words, then here. Or drag it here.', tx, s.r.y + 4, tw, THEME.faint);
        }
      }
      // what they add up to, and what waits at the end
      let y = rowsEnd + 5;
      const room = enterR.y - 3;
      const reward = game.plan.length ? wrapText(rewardLine(game.plan.length), bw, 'small') : [];
      if (reward.length && y + reward.length * 6 <= room) y = small(ui, rewardLine(game.plan.length), x0, y, bw, THEME.accent) + 2;
      if (y + 6 <= room) {
        drawText(g, greater ? 'A Greater Warden waits at the end.' : 'A Warden waits at the end.', x0, y, greater ? THEME.bad : THEME.dim, { font: 'small' });
        y += 8;
      }
      // and the Warden himself, where there is room for him: at the foot of the half, turned to the way in
      const frames = art.bestiary.of('warden').front.idle;
      const boss = frames[Math.floor(t * IDLE_FPS) % frames.length];
      const feet = enterR.y + enterR.h - 1;
      const bx = x0 + 30;
      if (feet - (FIGURE_SIZE.warden.top + 8) >= y && bx + FIGURE_SIZE.warden.half + 6 <= enterR.x) {
        g.globalAlpha = 0.5;
        g.fillStyle = P.black;
        for (const [hw, dy] of [[20, 0], [24, 1], [24, 2], [20, 3]] as const) g.fillRect(bx - hw, feet - 2 + dy, hw * 2, 1);
        g.globalAlpha = 1;
        g.drawImage(boss.img, Math.round(bx - boss.ax), Math.round(feet - boss.ay), boss.w, boss.h);
      }
      ui.drawButton(enterR.x, enterR.y, enterR.w, enterR.h, label, { primary: true, lit: true });
    },
  };
}
