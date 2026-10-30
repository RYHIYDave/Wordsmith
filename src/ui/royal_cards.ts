// THE ROYAL CARDS AT THE STRANGER (game/royal_cards.ts; his idea, 28 Oct 2026: “The cards would then be used at the gambler.
// You hand in a pair or three of a kind and then you get loot based on the difficulty of the hand.”). The stranger's half has
// a second page, CARDS (a tab at the right of his title, as the wordsmith's MELD), once the hero holds a royal's card:
//   his cards, the four royals' faces with how many of each he holds;
//   every hand they make, best first, each with what it pays; one pressed is picked;
//   HAND IN: the hand's cards are the stranger's, the pieces it pays are in the bag, and named here.
// Behind HIGH_CITY (game/act1.ts), off until he has played the High City and said yes.

import { RARITY_COLOR } from '../art/palette';
import { drawText, textWidth, wrapText } from '../engine/font';
import { HIGH_CITY } from '../game/act1';
import type { Game } from '../game/game';
import { ROYALS, handName, handPays, handsFrom, held, paysName } from '../game/royal_cards';
import type { Hand } from '../game/royal_cards';
import type { Art } from '../render/render';
import { CARD_FACE, royalCardSprite, royalLabelColor } from '../render/royal_cards';
import type { InvUi, Side } from './inventory';
import { meldTab } from './meld';
import type { Panels } from './panels';
import { SIDE_M, putDown, sideBody, sideFrame, sideHead } from './town';
import { THEME, inside } from './ui';
import type { Rect, Ui } from './ui';

/** Whether the stranger has the CARDS page: the High City on, and a card held (or a hand just handed in, to read what came). */
export function cardsOpen(game: Game): boolean {
  if (!HIGH_CITY.on) return false;
  const h = game.hero;
  return ROYALS.some((r) => held(h.cards, r) > 0) || game.wonHand.length > 0;
}

/** The tab at the right of the stranger's title that turns his half to the other page (his gamble shows CARDS). */
export function cardsTab(ui: Ui, r: Rect, label: string): Rect {
  return meldTab(ui, r, label);
}

/** A hand's own name, to keep it picked while the list changes. */
const keyOf = (hd: Hand): string => `hand:${hd.kind}:${hd.main}:${hd.kicker ?? ''}`;

/** Small lines of text, one under another, from (x, y). Returns where they end. */
function small(ui: Ui, text: string, x: number, y: number, w: number, color: string): number {
  for (const row of wrapText(text, w, 'small')) {
    drawText(ui.g, row, x, y, color, { font: 'small' });
    y += 6;
  }
  return y;
}

const RARITY_WORD = ['plain', 'magic', 'rare', 'unique'] as const;

/** The stranger's half, his cards page. `st.pick` is the hand picked (keyOf). */
export function cardsSide(ui: Ui, game: Game, _art: Art, st: Panels, inv: InvUi, r: Rect): Side {
  const g = ui.g;
  const T = ui.touch;
  const h = game.hero;
  const body = sideBody(r, ui.w, ui.h);
  const x0 = r.x + SIDE_M;
  const bw = r.w - 2 * SIDE_M;
  const bodyY = r.y + 2 + sideHead(ui) + 2;
  const tab = cardsTab(ui, r, 'GAMBLE');
  const intro = wrapText('Bring me the royals’ cards. A pair, two pair, three of a kind, a full house, four of a kind: the better the hand, the better what I give.', bw, 'small');
  // his cards: the four faces in a row, each with its count under it
  const capY = bodyY + intro.length * 6 + 4;
  const faceW = CARD_FACE.w;
  const gap = Math.max(4, Math.min(14, Math.floor((bw - 4 * faceW) / 3)));
  const facesY = capY + 8;
  const faces = ROYALS.map((k, i) => ({ k, r: { x: x0 + i * (faceW + gap), y: facesY, w: faceW, h: CARD_FACE.h } }));
  const handsCap = facesY + CARD_FACE.h + 10;
  const hands = handsFrom(h.cards);
  const rowH = T ? 20 : 17;
  const bh = T ? 18 : 13;
  const btn = (label: string): Rect => {
    const w = textWidth(label) + 16;
    return { x: r.x + r.w - SIDE_M - w, y: body.y + body.h - bh - 5, w, h: bh };
  };
  const BUTTON = 'HAND IN';
  const room = Math.max(1, Math.floor((btn(BUTTON).y - 4 - (handsCap + 8)) / rowH));
  const rows = hands.slice(0, room).map((hd, i) => ({ hd, key: keyOf(hd), r: { x: x0, y: handsCap + 8 + i * rowH, w: bw, h: rowH - 2 } }));
  for (const row of rows) ui.mark(row.key, row.r.x, row.r.y, row.r.w, row.r.h);
  const picked = (): (typeof rows)[number] | undefined => rows.find((row) => row.key === st.pick);
  /** Why the hand picked cannot be handed in just now, if it cannot. */
  const problem = (hd: Hand): string | null => {
    const n = handPays(hd).n;
    const free = h.bag.filter((it) => !it).length;
    return free < n ? (n === 1 ? 'Bag is full' : `Bag needs ${n} free places`) : null;
  };

  return {
    press(say): void {
      if (ui.pressIn(tab.x, tab.y, tab.w, tab.h)) {
        st.cardPage = false;
        st.pick = null;
        return;
      }
      if (st.pick && !picked()) st.pick = null;
      const p = picked();
      if (p) {
        const b = btn(BUTTON);
        if (ui.pressIn(b.x, b.y, b.w, b.h)) {
          putDown(inv);
          const why = problem(p.hd) ?? game.handInCards(p.hd);
          say(why);
          if (!why) st.pick = null;
          return;
        }
      }
      for (const row of rows) {
        if (!ui.pressIn(row.r.x, row.r.y, row.r.w, row.r.h)) continue;
        putDown(inv);
        st.pick = row.key;
      }
      if (ui.press && !ui.used && inside(r, ui.press.x, ui.press.y)) st.pick = null;
    },

    draw(): void {
      sideFrame(ui, r, 'THE STRANGER');
      ui.drawButton(tab.x, tab.y, tab.w, tab.h, 'GAMBLE', { small: true });
      intro.forEach((l, k) => drawText(g, l, x0, bodyY + 1 + k * 6, THEME.text, { font: 'small' }));
      drawText(g, 'YOUR CARDS', x0, capY, THEME.dim, { font: 'small' });
      for (const f of faces) {
        const n = held(h.cards, f.k);
        const sp = royalCardSprite(f.k);
        g.globalAlpha = n > 0 ? 1 : 0.28;
        g.drawImage(sp.img, CARD_FACE.x, CARD_FACE.y, CARD_FACE.w, CARD_FACE.h, f.r.x, f.r.y, CARD_FACE.w, CARD_FACE.h);
        g.globalAlpha = 1;
        // (how many: a dark tab at its corner)
        const label = `${n}`;
        const w = textWidth(label, 'small') + 4;
        g.fillStyle = THEME.ink;
        g.fillRect(f.r.x + f.r.w - w, f.r.y + f.r.h - 7, w, 8);
        drawText(g, label, f.r.x + f.r.w - 2, f.r.y + f.r.h - 6, n > 0 ? royalLabelColor(f.k) : THEME.faint, { align: 'right', font: 'small' });
      }
      // (something of the inventory's is being read: its card lies over the foot of this half)
      if (inv.sel || inv.word || inv.pending || inv.result) return;
      drawText(g, hands.length ? 'HANDS TO HAND IN' : 'NO HAND YET', x0, handsCap, THEME.dim, { font: 'small' });
      let y = handsCap + 8;
      if (!hands.length) y = small(ui, 'A pair is the least I take: two of one royal.', x0, y, bw, THEME.faint) + 4;
      const p = picked();
      for (const row of rows) {
        const on = !!p && p.key === row.key;
        const hot = !T && ui.hover(row.r.x, row.r.y, row.r.w, row.r.h);
        ui.box(row.r.x, row.r.y, row.r.w, row.r.h, on ? THEME.bg2 : THEME.bg, on ? THEME.accent : hot ? THEME.edgeHi : THEME.edge);
        drawText(g, handName(row.hd).toUpperCase(), row.r.x + 4, row.r.y + 3, on ? THEME.accent : royalLabelColor(row.hd.main), { font: 'small' });
        drawText(g, paysName(handPays(row.hd)), row.r.x + 4, row.r.y + (T ? 10 : 9), THEME.dim, { font: 'small' });
        y = row.r.y + row.r.h + 2;
      }
      if (hands.length > rows.length) drawText(g, `+${hands.length - rows.length} MORE`, x0 + bw, handsCap, THEME.dim, { align: 'right', font: 'small' });
      // what the last hand brought (when nothing is picked)
      const won = game.wonHand.map((i) => h.bag[i]).filter((it) => !!it);
      if (!p && won.length) {
        y += 2;
        drawText(g, 'YOU GOT', x0, y, THEME.dim, { font: 'small' });
        y += 7;
        for (const it of won) {
          if (y + 9 > body.y + body.h - 2) break;
          drawText(g, it!.name.toUpperCase(), x0, y, RARITY_COLOR[it!.rarity]);
          y += 9;
        }
        if (y + 6 <= body.y + body.h - 2) small(ui, `${won.length === 1 ? `A ${RARITY_WORD[won[0]!.rarity] ?? 'plain'} piece` : `${won.length} pieces`}. In your bag.`, x0, y, bw, THEME.dim);
        return;
      }
      if (!p) {
        if (hands.length && y + 6 <= body.y + body.h) small(ui, T ? 'Tap a hand to hand it in.' : 'Click a hand to hand it in.', x0, y + 2, bw, THEME.faint);
        return;
      }
      const b = btn(BUTTON);
      const why = problem(p.hd);
      if (why) drawText(g, why.toUpperCase(), b.x - 6, b.y + Math.floor((bh - 5) / 2), THEME.bad, { align: 'right', font: 'small' });
      ui.drawButton(b.x, b.y, b.w, b.h, BUTTON, { lit: !why, disabled: !!why, primary: !why });
    },
  };
}
