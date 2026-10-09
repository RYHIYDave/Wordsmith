// (MOCK-UP, NOT IN THE GAME) HOW A BLUE PACK AND A YELLOW PACK ARE TOLD APART (the art chat, 9 Oct
// 2026), to take the place of Version 19.7's look (game/defs.ts PACK_LOOK) once the owner has said yes
// to it. Behind a switch that is off: `PACK_MARKS.on`. Nothing of the game draws it yet.
//
// His rules (the main chat's post of 08:30 on the board, his words of 08:02): "A magic pack (blue) is
// affected by one word, and that would mean everything in that pack was affected by the word.  A
// yellow pack would give the leader of the pack a word or two (I don’t remember how we designed
// that), and the other in the pack become “minions” of the leader, gaining 50% of the words bonus."
// And the art rulebook, "Words in the world" (his yes of 8 Oct, 09:21): "Under a named monster with a
// word, the ring on the floor is the word itself, round and round, turning slowly."
//
// So the ring on the floor under each of a pack says, at a glance, which kind of pack it is (in the
// colours of magic and rare things, the game's own: art/palette.ts RARITY_COLOR) and how much of its
// word each has:
//   - A BLUE PACK: under every one of it a blue ring, and inside it a ring of the word's colour, dotted
//     and turning: every one of the pack has the word, whole.
//   - A YELLOW PACK'S LEADER: its ring WRITTEN IN ITS WORD (or words), as the rulebook has it, ringed
//     in gold.
//   - ITS MINIONS: a gold ring, broken: half of it is there (they have half of each of its words).
//     When the leader cries out to them (the skeleton champion's rallying cry: art/new_mobs3.ts), the
//     gaps fill with the word's colour for a moment: their half made whole.
// Drawn in the game's own pixels on the floor, under the figures, where render.ts draws the dotted
// ring of a named monster today.

import { WORD_COLOR } from '../art/icons';
import { RARITY_COLOR } from '../art/palette';
import { drawText, textWidth } from '../engine/font';
import { WORDS } from '../game/defs';
import type { WordId } from '../game/types';

export const PACK_MARKS = { on: false };

/** A point of the floor (tiles) on the screen (render.ts gives wx and wy with its camera). */
export type ToScreen = (x: number, y: number) => readonly [number, number];

/** What a monster of a pack is, for its ring. */
export interface PackMark {
  rarity: 'blue' | 'leader' | 'minion';
  /** The pack's words (a blue pack's one; a yellow pack's leader's one or two, which its minions have at half). */
  words: readonly WordId[];
  /** While the leader cries out to them: how far his cry has come (0 none, 1 at its height). */
  cry?: number;
}

/** How far out a ring is, in tiles, for a monster of half-width `r` (tiles); a leader's ring of letters is never tighter than this (closer, the letters crowd the feet). */
export const LETTERS_OUT = 0.9;

/** A word as it is written in the world: its own name, in capitals ("FLAME" for fire). */
function wordText(w: WordId): string {
  return WORDS[w].name.toUpperCase();
}

/** Points round a ring on the floor (r tiles out), as the eye sees it: an oval twice as wide as it is tall. */
function oval(at: ToScreen, x: number, y: number, r: number, n: number, turn = 0): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + turn;
    pts.push([...at(x + Math.cos(a) * r, y + Math.sin(a) * r)] as [number, number]);
  }
  return pts;
}

/** A ring drawn whole, a pixel thick (its far half a little dimmer, so that it lies on the floor). */
function ringLine(g: CanvasRenderingContext2D, at: ToScreen, x: number, y: number, r: number, color: string, alpha = 1, keep?: (i: number, n: number) => boolean, turn = 0): void {
  const [, cy] = at(x, y);
  const n = Math.max(24, Math.round(r * 90));
  const pts = oval(at, x, y, r, n, turn);
  const was = g.globalAlpha;
  g.fillStyle = color;
  pts.forEach(([px, py], i) => {
    if (keep && !keep(i, n)) return;
    g.globalAlpha = was * alpha * (py >= cy ? 1 : 0.65);
    g.fillRect(Math.round(px), Math.round(py), 1, 1);
  });
  g.globalAlpha = was;
}

/**
 * THE RING OF LETTERS (the rulebook's: render/words_world.ts `letterRing` on the branch
 * mockup/words-in-world, his yes of 8 Oct): its words, again and again, a space between, laid out
 * evenly round the ring as the eye sees it, turning slowly, each word in its own colour; the near
 * half full, the far half a little dimmer.
 */
function letterRing(g: CanvasRenderingContext2D, at: ToScreen, x: number, y: number, r: number, words: readonly WordId[], t: number): void {
  const [, cy] = at(x, y);
  const N = 96;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const a = -(i / N) * Math.PI * 2;
    pts.push([...at(x + Math.cos(a) * r, y + Math.sin(a) * r)] as [number, number]);
  }
  const run: number[] = [0];
  for (let i = 1; i <= N; i++) run.push(run[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const round = run[N];
  const units = words.map((w) => ({ text: wordText(w) + ' ', color: WORD_COLOR[w] }));
  const unitW = units.reduce((s, u) => s + textWidth(u.text, 'small') + 1, 0);
  const n = Math.max(1, Math.floor(round / unitW));
  const chars: { ch: string; color: string }[] = [];
  for (let k = 0; k < n; k++) for (const u of units) for (const ch of u.text) chars.push({ ch, color: u.color });
  const step = round / chars.length;
  const turn = (t * 7) % round;
  const was = g.globalAlpha;
  chars.forEach(({ ch, color }, i) => {
    if (ch === ' ') return;
    const s = (i * step + turn) % round;
    let j = 1;
    while (j < N && run[j] < s) j++;
    const k = (s - run[j - 1]) / Math.max(1e-6, run[j] - run[j - 1]);
    const px = pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * k;
    const py = pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * k;
    g.globalAlpha = was * (py >= cy ? 1 : 0.6);
    drawText(g, ch, Math.round(px), Math.round(py) - 3, color, { font: 'small', align: 'center' });
  });
  g.globalAlpha = was;
}

/**
 * THE RING UNDER ONE OF A PACK, at (x, y) on the floor, for a monster `r` tiles across its middle
 * (as the game's ring is drawn: 1.5 times its half-width out), at the moment `t` (seconds).
 */
export function drawPackMark(g: CanvasRenderingContext2D, at: ToScreen, x: number, y: number, r: number, mark: PackMark, t: number): void {
  const out = r * 1.5;
  const w = mark.words[0];
  if (!w) return;
  if (mark.rarity === 'blue') {
    // the blue ring of a magic pack, and inside it the word's own, dotted and turning
    ringLine(g, at, x, y, out, RARITY_COLOR[1]);
    ringLine(g, at, x, y, out * 0.78, WORD_COLOR[w], 0.9, (i) => i % 3 === 0, t * 0.6);
  } else if (mark.rarity === 'leader') {
    // the leader's ring written in its words, ringed in gold
    const R = Math.max(LETTERS_OUT, out);
    letterRing(g, at, x, y, R, mark.words, t);
    ringLine(g, at, x, y, R + 0.2, RARITY_COLOR[2]);
  } else {
    // a minion's: a gold ring, broken, half of it there; his cry fills its gaps with the word's colour
    const cry = Math.max(0, Math.min(1, mark.cry ?? 0));
    const dash = (i: number, n: number): boolean => Math.floor((i / n) * 16) % 2 === 0;
    ringLine(g, at, x, y, out, RARITY_COLOR[2], 1, dash, -t * 0.5);
    if (cry > 0.02) {
      ringLine(g, at, x, y, out, WORD_COLOR[w], cry, (i, n) => !dash(i, n), -t * 0.5);
      // (flaring as it fills: a second ring just outside it, in the word's colour)
      ringLine(g, at, x, y, out * 1.12, WORD_COLOR[w], 0.75 * cry);
    }
  }
}
