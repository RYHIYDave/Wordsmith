// QUEST MARKERS (game/quest_marks.ts): the marker that floats over whoever in town has a quest for the hero, and over a floor's
// waypoint home while he brings something back. A gem pointing down, in the friend's cyan (his rule: what glows on a friend is
// cyan), bobbing, with a soft glow behind it. Original pixels, made here.
//
// (SMALL_NOTES.questGem, off: art/small_notes.ts) THE SAME GEM CUT AT THE GAME'S FINE GRAIN, two picture pixels to a game pixel as
// the heroes and the places are painted (the gem above was the main chat's stand-in, a game pixel to a pixel): its table, its crown
// and the facets of its point, lit from the upper left, the seam of deep indigo round it, a glint on its table. As big as it was,
// a pixel and a half taller; it bobs and glows as before.

import { SMALL_NOTES } from '../art/small_notes';

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

/** (SMALL_NOTES.questGem) The gem at the fine grain: a picture pixel to a letter. X the seam, W the glint, w b o m a d its facets from the lightest to the darkest. */
export const GEM_FINE: readonly string[] = [
  '.......XXXXXXXX.......',
  '......XwwwwwwwwX......',
  '.....XbwWWwwwwwmX.....',
  '....XbbwWwwwwwwmmX....',
  '...XbbbwwwwwwwwmmmX...',
  '..XbbbboooooooommmmX..',
  '.XbbbbboooooooommmmmX.',
  'XbbbbbboooooooommmmmmX',
  '.XoooooobbbbaaaaddddX.',
  '.XooooobbbbaaaadddddX.',
  '..XoooobbbbaaaaddddX..',
  '..XooooobbbaaadddddX..',
  '...XoooobbwaaaddddX...',
  '....XooobbwaaadddX....',
  '....XooobbbaaadddX....',
  '.....XooobwaadddX.....',
  '.....XooobbaadddX.....',
  '......XoobbaaddX......',
  '......XoobbaaddX......',
  '.......XobbaadX.......',
  '........XobadX........',
  '........XobadX........',
  '.........XbaX.........',
  '.........XbaX.........',
  '..........XX..........',
];
/** Its colours: the friend's cyan, from its glint to its darkest facet. */
export const GEM_FINE_COLORS: Readonly<Record<string, string>> = { X: INK, W: '#ffffff', w: '#e0fffc', b: '#a0fcf6', o: '#58ecec', m: '#30c4d8', a: '#1e96b8', d: '#14688c' };

/** (SMALL_NOTES.questGem) The fine gem with its point at (x, y) (screen pixels), bobbing with `t`: each letter half a game pixel square. */
function drawFineMark(g: CanvasRenderingContext2D, x: number, y: number, t: number): void {
  const half = (v: number): number => Math.round(v * 2) / 2;
  const w = GEM_FINE[0].length / 2;
  const h = GEM_FINE.length / 2;
  const x0 = half(x - w / 2);
  const y0 = half(y - h + 0.5 + Math.sin(t * 3.2) * 2);
  // (its glow, soft, breathing a little: as it was)
  const r = 12;
  const a = 0.28 + 0.08 * Math.sin(t * 3.2 + 1);
  const cx = x0 + w / 2;
  const cy = y0 + 4.5;
  const glow = g.createRadialGradient(cx, cy, 0, cx, cy, r);
  glow.addColorStop(0, `rgba(122,248,240,${a.toFixed(3)})`);
  glow.addColorStop(1, 'rgba(122,248,240,0)');
  g.fillStyle = glow;
  g.fillRect(cx - r, cy - r, r * 2, r * 2);
  for (let j = 0; j < GEM_FINE.length; j++) {
    const row = GEM_FINE[j];
    // (runs of one colour laid as one piece)
    for (let i = 0; i < row.length; ) {
      const c = row[i];
      let n = 1;
      while (i + n < row.length && row[i + n] === c) n++;
      if (c !== '.') {
        g.fillStyle = GEM_FINE_COLORS[c];
        g.fillRect(x0 + i / 2, y0 + j / 2, n / 2, 0.5);
      }
      i += n;
    }
  }
}

/** The marker with its point at (x, y) (screen pixels), bobbing with `t` (seconds). */
export function drawQuestMark(g: CanvasRenderingContext2D, x: number, y: number, t: number): void {
  if (SMALL_NOTES.questGem) {
    drawFineMark(g, x, y, t);
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
