// Word tiles and attack names: the pieces used wherever a word is shown (the inventory, the HUD,
// the Lexicon).

import { WORD_COLOR } from '../art/icons';
import { P } from '../art/palette';
import { drawText, textWidth } from '../engine/font';
import { WORDS } from '../game/defs';
import type { SkillDef } from '../game/defs';
import type { WordId } from '../game/types';
import type { Art } from '../render/render';
import { THEME } from './ui';
import type { Ui } from './ui';

/** How a word reads in a place: its own name, its name in front ("Flame"), or behind ("of Flame"). */
export function wordForm(w: WordId, form: 'name' | 'front' | 'behind'): string {
  const d = WORDS[w];
  return (form === 'front' ? d.front : form === 'behind' ? d.behind.replace(/^of /, '') : d.name).toUpperCase();
}

/**
 * Width of a word tile: rune, the small "of" for a word behind, the word itself. `bare`: without
 * the rune (a tile in a place too narrow for it; a pouch with more words than it has room for).
 */
export function tileWidth(w: WordId, form: 'name' | 'front' | 'behind', count = 1, bare = false): number {
  return (bare ? 4 : 16) + (form === 'behind' ? textWidth('of', 'small') + 3 : 0) + textWidth(wordForm(w, form)) + (count > 1 ? textWidth(`x${count}`, 'small') + 4 : 0) + 5;
}

/**
 * One word as a tile: a dark plate edged in the word's colour, its rune, and the word. A tile
 * narrower than that takes drops the rune (or is told to: `bare`), and one narrower still is
 * written in the small letters. `stone`: the rune stone alone, in the middle of the tile (a word
 * set in a socket of the half-screen inventory; a pouch too full to write its words out).
 */
export function drawWordTile(ui: Ui, art: Art, x: number, y: number, w: number, h: number, word: WordId, form: 'name' | 'front' | 'behind', opts: { lit?: boolean; edge?: string; count?: number; alpha?: number; bare?: boolean; stone?: boolean } = {}): void {
  const g = ui.g;
  if (opts.alpha !== undefined) g.globalAlpha = opts.alpha;
  ui.box(x, y, w, h, opts.lit ? THEME.hot : THEME.bg2, opts.edge ?? WORD_COLOR[word]);
  // a lighter top edge, so it reads as a thing that can be picked up
  g.fillStyle = opts.lit ? THEME.edgeHi : THEME.edge;
  g.fillRect(x + 1, y + 1, w - 2, 1);
  const count = opts.count !== undefined && opts.count > 1 ? opts.count : 1;
  if (opts.stone) {
    const stone = art.icons.word[word];
    g.drawImage(stone.img, x + Math.floor((w - stone.w) / 2), y + Math.floor((h - stone.h) / 2));
    if (count > 1) drawText(g, `${count}`, x + w - 2, y + h - 7, P.white, { font: 'small', align: 'right', shadow: P.ink });
    g.globalAlpha = 1;
    return;
  }
  // (the word may come within a pixel of the tile's edge before the rune is given up: a slot in
  // front is just wide enough for LIGHTNING with its rune, and was made so)
  const bare = !!opts.bare || w < tileWidth(word, form, count) - 4;
  const small = bare && w < tileWidth(word, form, count, true) - 4;
  let tx = x + 4;
  if (!bare) {
    const icon = art.icons.word[word];
    g.drawImage(icon.img, x + 2, y + Math.floor((h - icon.h) / 2));
    tx = x + 16;
  }
  const ty = y + Math.floor((h - 8) / 2) + 1;
  if (form === 'behind') tx += drawText(g, 'of', tx, ty + 2, THEME.dim, { font: 'small' }) + 3;
  tx += drawText(g, wordForm(word, form), tx, small ? ty + 2 : ty, WORD_COLOR[word], { font: small ? 'small' : 'normal' });
  if (count > 1) drawText(g, `x${count}`, tx + 3, ty + 2, THEME.text, { font: 'small' });
  g.globalAlpha = 1;
}

/** The pieces of an attack's full name, each in its colour: FLAME STRIKE of POWER and RUIN. */
export function nameParts(def: SkillDef, front: readonly (WordId | null)[], behind: readonly (WordId | null)[]): { text: string; color: string; small: boolean }[] {
  const parts: { text: string; color: string; small: boolean }[] = [];
  for (const w of front) if (w) parts.push({ text: wordForm(w, 'front'), color: WORD_COLOR[w], small: false });
  parts.push({ text: def.name.toUpperCase(), color: P.white, small: false });
  let first = true;
  for (const w of behind) {
    if (!w) continue;
    parts.push({ text: first ? 'of' : 'and', color: THEME.dim, small: true });
    parts.push({ text: wordForm(w, 'behind'), color: WORD_COLOR[w], small: false });
    first = false;
  }
  return parts;
}

export function namePartsWidth(parts: { text: string; small: boolean }[], scale = 1): number {
  let w = 0;
  parts.forEach((p, i) => {
    w += (p.small ? textWidth(p.text, 'small') : textWidth(p.text) * scale) + (i < parts.length - 1 ? 4 * scale : 0);
  });
  return w;
}

/** Draw an attack's name in its colours, centred on cx. */
export function drawName(g: CanvasRenderingContext2D, parts: { text: string; color: string; small: boolean }[], cx: number, y: number, scale = 1): void {
  let x = Math.round(cx - namePartsWidth(parts, scale) / 2);
  for (const p of parts) {
    if (p.small) x += drawText(g, p.text, x, y + 3 * scale, p.color, { font: 'small', shadow: P.ink }) + 4 * scale;
    else x += drawText(g, p.text, x, y, p.color, { shadow: P.ink, scale }) + 4 * scale;
  }
}

/**
 * An attack's name broken into lines no wider than `maxW`: with four words on it a name is wider
 * than a phone held upright. A small "of" or "and" goes to the next line with the word it
 * leads. (One line, when it fits.)
 */
export function nameLines<T extends { text: string; small: boolean }>(parts: T[], maxW: number, scale = 1): T[][] {
  const lines: T[][] = [];
  let cur: T[] = [];
  for (const p of parts) {
    if (cur.length && namePartsWidth([...cur, p], scale) > maxW) {
      const lead = cur.length > 1 && cur[cur.length - 1].small ? cur.pop() : undefined;
      lines.push(cur);
      cur = lead ? [lead] : [];
    }
    cur.push(p);
  }
  if (cur.length) lines.push(cur);
  return lines;
}

/**
 * Draw an attack's name in its colours in lines no wider than `maxW`: from the left at x, or
 * (`centre`) each line centred on x. Returns the height it took.
 */
export function drawNameLines(g: CanvasRenderingContext2D, parts: { text: string; color: string; small: boolean }[], x: number, y: number, maxW: number, scale = 1, centre = false): number {
  const lines = nameLines(parts, maxW, scale);
  const step = 9 * scale + 1;
  lines.forEach((ln, i) => drawName(g, ln, centre ? x : x + namePartsWidth(ln, scale) / 2, y + i * step, scale));
  return lines.length * step;
}

/**
 * A small arrow that bobs beside something the player should press, its tip at (x, y).
 * 'down' stands above the thing and points down at it; 'up' stands below; 'left' stands to its
 * right; 'right' stands to its left.
 */
export function arrow(g: CanvasRenderingContext2D, x: number, y: number, t: number, color: string, dir: 'down' | 'up' | 'left' | 'right' = 'down'): void {
  const bob = Math.round(Math.abs(Math.sin(t * 5)) * 3);
  // the shape, as rows counted back from the tip: the head widens over four rows, then the stem
  const rows: [number, number][] = [[0, 0], [-1, 1], [-2, 2], [-3, 3], [-1, 1], [-1, 1], [-1, 1]];
  const put = (ox: number, oy: number, c: string): void => {
    g.fillStyle = c;
    rows.forEach(([a, b], i) => {
      const k = i + 1 + bob;
      if (dir === 'down') g.fillRect(x + a + ox, y - k + oy, b - a + 1, 1);
      else if (dir === 'up') g.fillRect(x + a + ox, y + k + oy, b - a + 1, 1);
      else if (dir === 'left') g.fillRect(x + k + ox, y + a + oy, 1, b - a + 1);
      else g.fillRect(x - k + ox, y + a + oy, 1, b - a + 1);
    });
  };
  put(1, 1, P.ink);
  put(-1, 0, P.ink);
  put(1, 0, P.ink);
  put(0, 0, color);
}
