// QUEST MARKERS (game/quest_marks.ts): the marker that floats over whoever in town has a quest for the hero, and over a floor's
// waypoint home while he brings something back. A gem pointing down, in the friend's cyan (his rule: what glows on a friend is
// cyan), bobbing, with a soft glow behind it. Original pixels, made here.
//
// (SMALL_NOTES.questRune, off: art/small_notes.ts) THE MARKER A RUNE THAT FLASHES. His words, 11 Nov 2026, shown the gem cut finer:
// “Make it a rune, have it flash, and add triggers for “Speak to the (quest giver)” when a quest becomes available”. The rune is THE
// GREAT RUNE, the wordsmith's own (art/smith3.ts GREAT_RUNE: the one he writes on the air and the master rune-stone carries), in the
// friend's cyan, at the game's fine grain (two picture pixels to a game pixel), the seam of deep indigo round its strokes. It bobs
// and glows as the gem did, and every RUNE_FLASH.every seconds it FLASHES: its strokes white-hot, its glow thrown wide, rays of
// light shot out of it up, down and to its sides, and gone in a third of a second. (His triggers: game/quest_marks.ts SPEAK_NEW.)

import { SMALL_NOTES } from '../art/small_notes';
import { GREAT_RUNE } from '../art/smith3';

const GEM: readonly string[] = [
  '....XXX....',
  '...XwwoX...',
  '..XwooooX..',
  '.XwoooooaX.',
  'XwoooooooaX',
  'XoooooooaaX',
  '.XoooooaaX.',
  '..XoooaaX..',
  '...XoaaX...',
  '....XaX....',
  '.....X.....',
];
const INK = '#0e0c24';
const LIT = '#f0fffe';
const CYAN = '#7af8f0';
const DEEP = '#22a8c0';

/** (SMALL_NOTES.questRune) The rune's size: half its height (picture pixels); its strokes' core, their cyan and their seam (how far from a stroke's middle each reaches). */
export const RUNE_MARK = { half: 14, core: 0.85, cyan: 1.75, seam: 2.85 } as const;
/** Its flash: how often (seconds), how long it takes to come (a blink) and to go, how far its rays reach (picture pixels) and how much wider its glow is thrown. */
export const RUNE_FLASH = { every: 1.6, rise: 0.05, fall: 0.38, rays: 36, glow: 14 } as const;

/** The rune at the fine grain, a picture pixel to a letter: w its strokes' core, o their cyan, X the seam round them. Made from the great rune's own strokes. */
export const RUNE_FINE: readonly string[] = (() => {
  const R = RUNE_MARK;
  // (laid about its own middle, which falls between two picture pixels, so that its two sides are alike)
  const reach = (k: 0 | 1): number => Math.max(...GREAT_RUNE.flatMap((q) => [Math.abs(q[k]), Math.abs(q[k + 2])]));
  const ox = Math.ceil(reach(0) * R.half + R.seam);
  const oy = Math.ceil(reach(1) * R.half + R.seam);
  const w = ox * 2;
  const h = oy * 2;
  const rows: string[] = [];
  for (let j = 0; j < h; j++) {
    let row = '';
    for (let i = 0; i < w; i++) {
      const px = i + 0.5;
      const py = j + 0.5;
      let d = 99;
      for (const [x0, y0, x1, y1] of GREAT_RUNE) {
        const ax = ox + x0 * R.half;
        const ay = oy - y0 * R.half;
        const bx = ox + x1 * R.half;
        const by = oy - y1 * R.half;
        const l2 = (bx - ax) ** 2 + (by - ay) ** 2;
        const u = l2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2)) : 0;
        d = Math.min(d, Math.hypot(px - (ax + (bx - ax) * u), py - (ay + (by - ay) * u)));
      }
      row += d <= R.core ? 'w' : d <= R.cyan ? 'o' : d <= R.seam ? 'X' : '.';
    }
    rows.push(row);
  }
  return rows;
})();
/** Its colours at rest, and in its flash (white-hot). */
export const RUNE_COLORS: Readonly<Record<string, string>> = { X: INK, w: '#e0fffc', o: '#58ecec' };
export const RUNE_HOT: Readonly<Record<string, string>> = { X: '#1e96b8', w: '#ffffff', o: '#e0fffc' };

/** How strong the flash is at `t` (seconds), 0 to 1: up in a blink, down over a third of a second, once every RUNE_FLASH.every. */
export function runeFlash(t: number): number {
  const F = RUNE_FLASH;
  const p = ((t % F.every) + F.every) % F.every;
  if (p < F.rise) return p / F.rise;
  const k = 1 - (p - F.rise) / F.fall;
  return k > 0 ? k * k : 0;
}

/** (SMALL_NOTES.questRune) The rune with its foot at (x, y) (screen pixels), bobbing with `t`, flashing: each letter half a game pixel square. */
function drawRuneMark(g: CanvasRenderingContext2D, x: number, y: number, t: number): void {
  const half = (v: number): number => Math.round(v * 2) / 2;
  const w = RUNE_FINE[0].length / 2;
  const h = RUNE_FINE.length / 2;
  const x0 = half(x - w / 2);
  const y0 = half(y - h + 0.5 + Math.sin(t * 3.2) * 2);
  const f = runeFlash(t);
  const cx = x0 + w / 2;
  const cy = y0 + h / 2;
  // (its glow, soft, breathing a little; thrown wide in its flash)
  const r = 12 + (RUNE_FLASH.glow / 2) * f * 2;
  const a = 0.3 + 0.08 * Math.sin(t * 3.2 + 1) + 0.45 * f;
  const glow = g.createRadialGradient(cx, cy, 0, cx, cy, r);
  glow.addColorStop(0, `rgba(${f > 0.5 ? '224,255,252' : '122,248,240'},${Math.min(0.9, a).toFixed(3)})`);
  glow.addColorStop(1, 'rgba(122,248,240,0)');
  g.fillStyle = glow;
  g.fillRect(cx - r, cy - r, r * 2, r * 2);
  // (its rays, in its flash: up, down and to its sides, long; between them, short; each a line of picture pixels, white at its root)
  if (f > 0.04) {
    const from = Math.min(w, h) / 2 + 1;
    for (let k = 0; k < 8; k++) {
      const ang = (k * Math.PI) / 4;
      const long = ((k % 2 === 0 ? RUNE_FLASH.rays : RUNE_FLASH.rays * 0.45) / 2) * f;
      const dx = Math.cos(ang);
      const dy = Math.sin(ang);
      for (let s = 0; s < long; s += 0.5) {
        g.fillStyle = s < long * 0.45 ? '#ffffff' : s < long * 0.8 ? '#a0fcf6' : '#58ecec';
        // (two picture pixels thick at its root, one at its tip)
        const thick = s < long * 0.5 ? 1 : 0.5;
        g.fillRect(half(cx + dx * (from + s) - thick / 2), half(cy + dy * (from + s) - thick / 2), thick, thick);
      }
    }
  }
  const tones = f > 0.35 ? RUNE_HOT : RUNE_COLORS;
  for (let j = 0; j < RUNE_FINE.length; j++) {
    const row = RUNE_FINE[j];
    // (runs of one colour laid as one piece)
    for (let i = 0; i < row.length; ) {
      const c = row[i];
      let n = 1;
      while (i + n < row.length && row[i + n] === c) n++;
      if (c !== '.') {
        g.fillStyle = tones[c];
        g.fillRect(x0 + i / 2, y0 + j / 2, n / 2, 0.5);
      }
      i += n;
    }
  }
}

/** The marker with its point at (x, y) (screen pixels), bobbing with `t` (seconds). */
export function drawQuestMark(g: CanvasRenderingContext2D, x: number, y: number, t: number): void {
  if (SMALL_NOTES.questRune) {
    drawRuneMark(g, x, y, t);
    return;
  }
  const bob = Math.round(Math.sin(t * 3.2) * 2);
  const w = GEM[0].length;
  const h = GEM.length;
  const x0 = Math.round(x - (w - 1) / 2);
  const y0 = Math.round(y - h + 1 + bob);
  // (its glow, soft, breathing a little)
  const r = 11;
  const a = 0.28 + 0.08 * Math.sin(t * 3.2 + 1);
  const cx = x0 + w / 2;
  const cy = y0 + 4;
  const glow = g.createRadialGradient(cx, cy, 0, cx, cy, r);
  glow.addColorStop(0, `rgba(122,248,240,${a.toFixed(3)})`);
  glow.addColorStop(1, 'rgba(122,248,240,0)');
  g.fillStyle = glow;
  g.fillRect(cx - r, cy - r, r * 2, r * 2);
  for (let j = 0; j < h; j++) {
    const row = GEM[j];
    for (let i = 0; i < w; i++) {
      const c = row[i];
      if (c === '.') continue;
      g.fillStyle = c === 'X' ? INK : c === 'w' ? LIT : c === 'o' ? CYAN : DEEP;
      g.fillRect(x0 + i, y0 + j, 1, 1);
    }
  }
}
