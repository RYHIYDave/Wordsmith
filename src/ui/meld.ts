// WORDMELDING AT THE WORDSMITH (game/melds.ts), behind MELD, which is off: the second page of his
// half of the screen, once the Meldstone has been brought to him. Two of the hero's spare damage
// words are laid in its two hollows (pressed there, or carried over and let go, as at the gate);
// MELD fuses them, for runedust, into one melded word, which joins the spare words. Both are used
// up. What comes out is not shown before it is made: every melded word is found by trying (his
// page "Wordsmith: Word Combinations"). The one just made is shown in the third place, and its page
// is read under them.
//
// The planning chat's first look at it, pictures to him first.

import { WORD_COLOR } from '../art/icons';
import { P } from '../art/palette';
import { drawText, textWidth, wrapText } from '../engine/font';
import { WORDS } from '../game/defs';
import type { Game } from '../game/game';
import { MELD, MELD_DUST_COLOR, MELD_TUNE, isMeld } from '../game/melds';
import type { Meta } from '../game/state';
import type { WordId } from '../game/types';
import type { Art } from '../render/render';
import type { InvUi, Side, SideOver } from './inventory';
import { drawWordPage } from './lexicon';
import { CELL } from './panels';
import type { Panels } from './panels';
import { SIDE_M, putDown, sideBody, sideFrame, sideHead } from './town';
import { THEME, inside } from './ui';
import type { Rect, Ui } from './ui';
import { drawWordTile } from './words';

/** Can melding be done at the wordsmith (the switch on, and the Meldstone brought to him; the practice room always)? */
export function meldOpen(game: Game): boolean {
  return MELD.on && (game.hero.meld === 'open' || game.practice);
}

/** The tab at the right of the wordsmith's title that turns his half to the other page. */
export function meldTab(ui: Ui, r: Rect, label: string): Rect {
  const T = ui.touch;
  const h = T ? 16 : 11;
  const w = textWidth(label) + 12;
  const head = sideHead(ui);
  return { x: r.x + r.w - SIDE_M - w, y: r.y + 2 + Math.floor((head - h) / 2) + 1, w, h };
}

/** Small lines of text, one under another, from (x, y). Returns where they end. */
function small(ui: Ui, text: string, x: number, y: number, w: number, color: string): number {
  for (const row of wrapText(text, w, 'small')) {
    drawText(ui.g, row, x, y, color, { font: 'small' });
    y += 6;
  }
  return y;
}

/** The one place on the melding page a word goes to: the next free hollow. */
const HOLLOW = 'meld';

/** The wordsmith's half, melding. `st.meldIn` holds the two words laid in (still the hero's until melded). */
export function meldSide(ui: Ui, game: Game, art: Art, meta: Meta, st: Panels, inv: InvUi, r: Rect): Side {
  const g = ui.g;
  const T = ui.touch;
  const h = game.hero;
  const body = sideBody(r, ui.w, ui.h);
  const x0 = r.x + SIDE_M;
  const bw = r.w - 2 * SIDE_M;
  const bodyY = r.y + 2 + sideHead(ui) + 2;
  // (a word laid in that is no longer the hero's to give, sold or set in an attack since: it comes out)
  for (let i = 0; i < 2; i++) {
    const w = st.meldIn[i];
    if (w && (h.words[w] ?? 0) <= 0) st.meldIn[i] = null;
  }
  const intro = wrapText('Two damage words and runedust go in; one melded word comes out. Both words are used up. What comes out is found by trying.', bw, 'small');
  const dustY = bodyY + 1 + intro.length * 6 + 4;
  const rowY = dustY + 12;
  const gap = 16;
  const hollows = [0, 1].map((i) => ({ i, r: { x: x0 + i * (CELL + gap), y: rowY, w: CELL, h: CELL } as Rect }));
  const outR: Rect = { x: x0 + 2 * (CELL + gap), y: rowY, w: CELL, h: CELL };
  for (const s of hollows) ui.mark(`meld:${s.i}`, s.r.x, s.r.y, s.r.w, s.r.h);
  const [a, b] = st.meldIn;
  const next = hollows.find((s) => !st.meldIn[s.i]);
  const bh = T ? 18 : 13;
  const label = `MELD: ${MELD_TUNE.cost} RUNEDUST`;
  const bwid = textWidth(label) + 16;
  const btn: Rect = { x: r.x + r.w - SIDE_M - bwid, y: body.y + body.h - bh - 5, w: bwid, h: bh };
  const tab = meldTab(ui, r, 'TRADE');
  const why = game.meldProblem(a, b);
  const made = game.melded;

  /** Why word `w` cannot be laid in, or null if it can. */
  const problem = (w: WordId): string | null => {
    if ((h.words[w] ?? 0) <= 0) return 'No spare word';
    if (isMeld(w)) return 'A melded word melds no further';
    if (WORDS[w].kind !== 'damage') return 'Only damage words meld';
    if (st.meldIn.includes(w)) return 'Two different words';
    if (!next) return 'Both hollows are full';
    return null;
  };
  const lay = (w: WordId): string | null => {
    const no = problem(w);
    if (no || !next) return no;
    st.meldIn[next.i] = w;
    game.melded = null;
    return null;
  };

  return {
    press(say): void {
      if (ui.pressIn(tab.x, tab.y, tab.w, tab.h)) {
        st.meldPage = false;
        st.pick = null;
        return;
      }
      if (ui.pressIn(btn.x, btn.y, btn.w, btn.h)) {
        putDown(inv);
        const no = game.meldWords(a, b);
        say(no);
        if (!no) st.meldIn = [null, null];
      }
      for (const s of hollows) {
        if (!ui.pressIn(s.r.x, s.r.y, s.r.w, s.r.h)) continue;
        const w = st.meldIn[s.i];
        if (w) {
          // a word laid in: pressing it takes it out again
          st.meldIn[s.i] = null;
          putDown(inv);
        } else if (inv.word) {
          const no = lay(inv.word);
          if (no) say(no);
          else putDown(inv);
        } else say(T ? 'Tap one of your damage words first, or drag it here' : 'Pick one of your damage words first, or drag it here');
      }
    },

    wordAt: (x, y) => (inside(r, x, y) ? HOLLOW : null),
    wordRect: () => (next ? next.r : null),
    wordProblem: (w) => problem(w),
    wordDrop: (w) => lay(w),
    wordRead: (w) => [{ text: `Let go, and ${WORDS[w].name} is laid in to be melded.`, color: THEME.accent, small: true }],
    wordHint: (w) => (WORDS[w].kind === 'damage' ? 'The wordsmith melds two damage words into one.' : null),
    wordButtons: (w) => [{ label: 'TO THE MELD', act: () => lay(w), lit: problem(w) === null, disabled: problem(w) !== null }],

    draw(over: SideOver): void {
      sideFrame(ui, r, 'WORDSMITH', 'MELDING');
      ui.drawButton(tab.x, tab.y, tab.w, tab.h, 'TRADE', { small: true });
      intro.forEach((l, k) => drawText(g, l, x0, bodyY + 1 + k * 6, THEME.text, { font: 'small' }));
      // the runedust carried
      const dust = art.icons.runedust;
      g.drawImage(dust.img, x0, dustY, dust.w, dust.h);
      const dw = drawText(g, `${h.dust} RUNEDUST`, x0 + dust.w + 3, dustY + 1, MELD_DUST_COLOR, { font: 'small' });
      drawText(g, `A MELD TAKES ${MELD_TUNE.cost}`, x0 + dust.w + 3 + dw + 8, dustY + 1, THEME.dim, { font: 'small' });
      // the two hollows, and what comes out
      const ok = !!over.hand && problem(over.hand) === null;
      const hang = over.at === HOLLOW && over.dragging ? over.hand : null;
      for (const s of hollows) {
        const w = st.meldIn[s.i] ?? (s === next && hang && ok ? hang : null);
        if (st.meldIn[s.i] && w) drawWordTile(ui, art, s.r.x, s.r.y, CELL, CELL, w, 'name', { stone: true, lit: ui.hover(s.r.x, s.r.y, CELL, CELL) });
        else if (w) {
          ui.box(s.r.x, s.r.y, CELL, CELL, THEME.accentBg, P.white);
          drawWordTile(ui, art, s.r.x, s.r.y, CELL, CELL, w, 'name', { stone: true, lit: true, edge: P.white, alpha: T ? 0.6 : 0.95 });
        } else {
          // an empty hollow: a dark notch with a plus, lit while the word in hand could go in
          const lit = s === next && ok;
          ui.box(s.r.x, s.r.y, CELL, CELL, lit ? (over.blink ? THEME.accentBg : THEME.accentBg2) : THEME.slot, lit ? (over.blink ? THEME.accent : THEME.accentLo) : THEME.edge);
          const px = s.r.x + Math.floor(CELL / 2);
          const py = s.r.y + Math.floor(CELL / 2);
          g.fillStyle = lit ? THEME.accent : THEME.edge;
          g.fillRect(px - 3, py, 7, 1);
          g.fillRect(px, py - 3, 1, 7);
        }
      }
      const mid = rowY + Math.floor(CELL / 2) - 4;
      drawText(g, '+', x0 + CELL + Math.floor(gap / 2), mid, THEME.dim, { align: 'center' });
      drawText(g, '=', x0 + 2 * CELL + gap + Math.floor(gap / 2), mid, THEME.dim, { align: 'center' });
      if (made) drawWordTile(ui, art, outR.x, outR.y, CELL, CELL, made.word, 'name', { stone: true, lit: true, edge: WORD_COLOR[made.word] });
      else {
        ui.box(outR.x, outR.y, CELL, CELL, THEME.slot, THEME.edge);
        drawText(g, '?', outR.x + Math.floor(CELL / 2), mid, a && b && !why ? MELD_DUST_COLOR : THEME.faint, { align: 'center' });
      }
      // under them: the word just made, or how it is done
      let y = rowY + CELL + 7;
      const room = btn.y - 4;
      if (made && !(inv.sel || inv.word || inv.pending || inv.result)) {
        drawText(g, made.first ? 'A NEW WORD, FOUND' : 'MELDED', x0, y, made.first ? MELD_DUST_COLOR : THEME.dim, { font: 'small' });
        y += 8;
        drawWordPage(g, meta, made.word, x0, y, bw, room - y, false, true);
      } else if (!(inv.sel || inv.word || inv.pending || inv.result)) {
        if (!a && !b && y + 12 <= room) small(ui, T ? 'Tap a damage word of yours, then a hollow. Or drag it here.' : 'Click a damage word of yours, then a hollow. Or drag it here.', x0, y, bw, THEME.faint);
      }
      // the button, and why it cannot be pressed yet
      if (why && a && b) drawText(g, why, btn.x - 6, btn.y + Math.floor((bh - 5) / 2), THEME.bad, { align: 'right', font: 'small' });
      ui.drawButton(btn.x, btn.y, btn.w, btn.h, label, { lit: !why, disabled: !!why, primary: !why });
    },
  };
}
