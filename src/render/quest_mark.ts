// QUEST MARKERS (game/quest_marks.ts): the marker that floats over whoever in town has a quest for the hero, and over a floor's
// waypoint home while he brings something back. A gem pointing down, in the friend's cyan (his rule: what glows on a friend is
// cyan), bobbing, with a soft glow behind it. Original pixels, made here.

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

/** The marker with its point at (x, y) (screen pixels), bobbing with `t` (seconds). */
export function drawQuestMark(g: CanvasRenderingContext2D, x: number, y: number, t: number): void {
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
