// THE HEROES' MOVES AS PAINTED (see lib.ts): every frame the game shows, painted by the game's own
// painter (art/heroes3.ts, paintMove3), from in front and from behind.
//   GLOWS  (Pillar 4, "What glows on a friend is cyan"): the colour of every light a frame gives.
//   PIXELS (Pixels 1, "Crisp pixels. No blur, no smoothing"): how many of the figure's pixels are
//          neither whole nor empty, other than the edge of light (Pixels 5), which is see-through by design.
//   STILL  (Movement 6, "A figure left standing breathes"): in a standing loop, how many of the
//          figure's pixels change from one frame to the next, at most and in all.
//   node node_modules/tsx/dist/cli.mjs tools/review_heroes/paint.ts [move ...]
import { paintMove3 } from '../../src/art/heroes3';
import { MOVES3 } from '../../src/art/moves3';
import { ORDER, USES, VIEWS, endOf } from './lib';

const asked = process.argv.slice(2);
const keys = asked.length ? asked : ORDER;
const hue = (hex: string): number => {
  const v = parseInt(hex.slice(1), 16);
  const r = ((v >> 16) & 255) / 255;
  const g = ((v >> 8) & 255) / 255;
  const b = (v & 255) / 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  if (mx - mn < 1e-6) return -1;
  const h = mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4;
  return (h * 60 + 360) % 360;
};
for (const key of keys) {
  const m = MOVES3[key];
  const use = USES[key];
  const end = endOf(m);
  const fps = use.fps;
  const t0 = use.how === 'loop' ? (m.motion.loop ?? 0) : 0;
  const n = use.how === 'loop' ? Math.max(1, Math.round((end - t0) * fps)) : Math.ceil(end * fps - 1e-6) + 1;
  const lights = new Map<string, number>();
  let soft = 0;
  let rim = 0;
  let solid = 0;
  let mostChange = 0;
  let allChange = 0;
  for (const view of VIEWS) {
    let was: Uint8ClampedArray | null = null;
    let first: Uint8ClampedArray | null = null;
    for (let i = 0; i < n; i++) {
      const t = Math.min(end, t0 + i / fps);
      const f = paintMove3(m, t, view);
      for (const l of f.lights) lights.set(l.color, (lights.get(l.color) ?? 0) + 1);
      const d = f.px.d;
      for (let k = 3; k < d.length; k += 4) {
        const a = d[k];
        if (a === 0) continue;
        if (a === 255) solid++;
        else if (a === 110) rim++;
        else soft++;
      }
      if (use.how === 'loop' && !/run/.test(key)) {
        if (was) {
          let changed = 0;
          for (let k = 0; k < d.length; k += 4) if (d[k] !== was[k] || d[k + 1] !== was[k + 1] || d[k + 2] !== was[k + 2] || d[k + 3] !== was[k + 3]) changed++;
          mostChange = Math.max(mostChange, changed);
        }
        if (!first) first = d.slice();
        was = d.slice();
      }
    }
    if (use.how === 'loop' && !/run/.test(key) && first && was) {
      // how many pixels the loop ever changes: against its first frame, the most at any frame
      for (let i = 0; i < n; i++) {
        const t = Math.min(end, t0 + i / fps);
        const d = paintMove3(m, t, view).px.d;
        let changed = 0;
        for (let k = 0; k < d.length; k += 4) if (d[k] !== first[k] || d[k + 1] !== first[k + 1] || d[k + 2] !== first[k + 2] || d[k + 3] !== first[k + 3]) changed++;
        allChange = Math.max(allChange, changed);
      }
    }
  }
  const glows = [...lights.entries()].map(([c, k]) => `${c} (hue ${hue(c).toFixed(0)}, ${k})`).join(', ') || 'none';
  const notCyan = [...lights.keys()].filter((c) => { const h = hue(c); return h >= 0 && (h < 165 || h > 200); });
  console.log(`== ${key}: ${n} frames a view`);
  console.log(`GLOWS  ${notCyan.length ? `NOT THE FRIEND'S CYAN: ${notCyan.join(', ')}; ` : ''}${glows}`);
  console.log(`PIXELS ${soft ? `${soft} SEE-THROUGH PIXELS that are not the edge of light (of ${solid + rim + soft})` : `crisp: whole or empty, but the edge of light (${rim} of ${solid + rim})`}`);
  if (use.how === 'loop' && !/run/.test(key)) console.log(`STILL  a frame changes at most ${mostChange} pixels from the one before; the loop changes at most ${allChange} pixels from its first frame (of about ${Math.round(solid / (2 * n))} in the figure)`);
}
