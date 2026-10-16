// Dev page: HOW LONG THE DROWNED EYE'S PICTURES TAKE TO PAINT, AS THE GAME HOLDS THEM, and how much room they take
// (art/act1_figs/eye.ts: every list of his, each frame painted once, a list at a time as the painter paints them).
//   PREVIEW_TIMEOUT=1500000 node tools/preview.mjs src/dev/measure_eye.ts shots/measure_eye.png 100 100
// Every line it logs begins "measure".
import { makeEyeArt } from '../art/act1_figs/eye';
import type { Sprite } from '../engine/px';

const log = (s: string): void => console.log(`measure ${s}`);
const mb = (n: number): string => (n / 1048576).toFixed(1);
const rest = (): Promise<void> => new Promise((ok) => setTimeout(ok, 30));

// (after the page has loaded: it takes minutes)
setTimeout(() => void measure(), 50);
async function measure(): Promise<void> {
  const art = makeEyeArt();
  const set = art.front;
  const lists: [string, Sprite[]][] = [['stand', set.idle], ...Object.entries(set.clips?.moves ?? {}).map(([n, c]) => [n, c.frames] as [string, Sprite[]])];
  if (set.clips?.die) lists.push(['die', set.clips.die.frames]);
  let all = 0;
  let room = 0;
  let count = 0;
  for (const [n, frames] of lists) {
    let ms = 0;
    let b = 0;
    for (let i = 0; i < frames.length; i++) {
      const t0 = performance.now();
      const s = frames[i];
      ms += performance.now() - t0;
      b += s.img.width * s.img.height * 4;
      // (between frames, the page breathes, as the painter's worker does between its pieces of work)
      if (i % 4 === 3) await rest();
    }
    all += ms;
    room += b;
    count += frames.length;
    log(`${n}: ${frames.length} frames, ${(ms / 1000).toFixed(1)} s, ${mb(b)} MB`);
  }
  log(`ALL: ${count} frames, ${(all / 1000).toFixed(1)} s, ${mb(room)} MB`);
  (window as unknown as { __ready: boolean }).__ready = true;
}
