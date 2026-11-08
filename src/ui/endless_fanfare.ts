// ENDLESS MODE'S FANFARE (behind ENDLESS_FANFARE, off until his yes to pictures of it). His words to the main chat, 7 Nov 2026,
// 14:54 (Eastern): “I’d like a little more fanfare for endless mode.  Like a big splash screen and a pop up description of what
// endless mode is.” (the rest of what he said then, the key in quarters and the final boss, comes after: THE LIST, 6d); asked what
// next on 8 Nov, his pick, “Endless fanfare (Recommended)”.
//
// As the last floor is beaten and endless mode opens to the hero (game/game.ts, the event `endlessOpens`): first THE SPLASH, the
// whole screen, ENDLESS across it as it comes up out of the dark, for `splash` seconds (a press after `skip` goes on at once); then
// THE CARD, what endless mode is, in plain words, held until GO ON is pressed. The game waits under both (main.ts: the panel
// 'endless'). The splash's picture is painted here in the meantime; the art chat's is asked for (the board, 8 Nov), to go in its
// place. The card tells only what is in the game: when the key in quarters and the final boss are in, a line for them.
import { drawText, textWidth } from '../engine/font';
import { P } from '../art/palette';
import { THEME } from './ui';
import type { Ui } from './ui';

export const ENDLESS_FANFARE = { on: false, splash: 3.2, skip: 0.8, armed: 0.5 };

/** What endless mode is, a line each, as the card says it. */
export const ENDLESS_CARD: readonly string[] = [
  'The last floor is beaten. From now on the waypoint in town leads into endless mode.',
  'Each level is one of the floors, chosen at random: never the same one twice in a row.',
  'Each level\'s monsters have 10% more life and damage than the last\'s, adding up.',
  'What you find grows richer the deeper you go.',
  'Leave by the waypoint whenever you like: it takes you back to the level you reached.',
];
/** The card's warning, in the enemy's colours, as an endless level's card has it (game/endless.ts ENDLESS_WARN). */
export const ENDLESS_CARD_WARN = 'HARDCORE: die in endless mode and your hero is lost. The Lexicon and the stash are kept.';

const STONE = { face: '#ece8ff', under: '#b0a4e0', edge: '#2a2466', dark: '#07050a' };
const ENEMY = { edge: '#ff4f8a', gold: '#ffd27a' };

const clamp = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** The splash, `t` seconds in: the dark coming up, a ring of the floor's stone opening round ENDLESS, its letters dropping in. */
export function drawEndlessSplash(g: CanvasRenderingContext2D, t: number, w: number, h: number): void {
  g.save();
  g.fillStyle = STONE.dark;
  g.globalAlpha = clamp(t / 0.4);
  g.fillRect(0, 0, w, h);
  g.globalAlpha = 1;
  const cx = Math.floor(w / 2);
  const cy = Math.floor(h * 0.44);
  // (rings of the stone's violet opening outward, slower and fainter each)
  for (let k = 0; k < 5; k++) {
    const r = (Math.min(w, h) * (0.18 + k * 0.11)) * clamp((t - k * 0.12) / 0.9);
    if (r <= 1) continue;
    g.globalAlpha = 0.5 - k * 0.08;
    g.strokeStyle = k % 2 ? STONE.under : STONE.edge;
    g.lineWidth = 1;
    g.beginPath();
    g.arc(cx + 0.5, cy + 0.5, r, 0, Math.PI * 2);
    g.stroke();
  }
  g.globalAlpha = 1;
  const word = 'ENDLESS';
  const scale = Math.max(2, Math.min(6, Math.floor((w * 0.8) / Math.max(1, textWidth(word)))));
  const drop = clamp((t - 0.35) / 0.5);
  const y = Math.round(cy - 4 * scale - (1 - drop) * 12);
  g.globalAlpha = drop;
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) drawText(g, word, cx + dx * Math.ceil(scale / 2), y + dy * Math.ceil(scale / 2), STONE.edge, { align: 'center', scale });
  drawText(g, word, cx, y, STONE.face, { align: 'center', scale });
  const sub = clamp((t - 1.0) / 0.5);
  g.globalAlpha = sub;
  drawText(g, 'THE WAY GOES ON', cx, y + 10 * scale + 4, STONE.under, { align: 'center', scale: 1 });
  drawText(g, 'HARDCORE', cx, y + 10 * scale + 16, ENEMY.edge, { align: 'center', scale: 1 });
  g.restore();
}

/** The card: what endless mode is. True when GO ON is pressed (or Enter, once `armed`). */
export function drawEndlessCard(ui: Ui, armed: boolean, pressedKey: (code: string) => boolean): boolean {
  const g = ui.g;
  ui.shade(0.7);
  const w = Math.min(300, ui.w - 24);
  const x = Math.floor((ui.w - w) / 2);
  const lines = ENDLESS_CARD.map((l) => wrap(l, w - 24));
  const warn = wrap(ENDLESS_CARD_WARN, w - 24);
  const rows = lines.reduce((a, l) => a + l.length, 0) + warn.length;
  const h = Math.min(ui.h - 16, 34 + rows * 9 + lines.length * 3 + 34);
  const y = Math.max(8, Math.floor((ui.h - h) / 2));
  ui.panel(x, y, w, h);
  drawText(g, 'ENDLESS MODE', x + Math.floor(w / 2), y + 8, STONE.face, { align: 'center', shadow: P.ink, scale: 2 });
  let ly = y + 30;
  for (const l of lines) {
    l.forEach((row, i) => {
      if (i === 0) g.fillStyle = STONE.under, g.fillRect(x + 12, ly + 3, 2, 2);
      drawText(g, row, x + 18, ly, THEME.text, {});
      ly += 9;
    });
    ly += 3;
  }
  for (const row of warn) {
    drawText(g, row, x + 18, ly, ENEMY.edge, {});
    ly += 9;
  }
  const bw = 72;
  const go = ui.button(x + Math.floor((w - bw) / 2), y + h - 24, bw, 16, 'GO ON', { primary: true });
  return armed && (go || pressedKey('Enter') || pressedKey('Space'));
}

/** `text` broken into lines no wider than `room`. */
function wrap(text: string, room: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(next) > room) {
      out.push(line);
      line = word;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
}
