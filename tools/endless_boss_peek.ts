// ENDLESS MODE'S FINAL BOSS (src/art/endless_boss.ts), its look standing, painted as the game paints its monsters: no browser.
//   npx tsx tools/endless_boss_peek.ts <out dir> [t, comma separated]   writes front_<t>.png and back_<t>.png at one picture
//   pixel a pixel on the floor's colour, and the floor point (the canvas's anchor) in anchor.json
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { paintMob } from '../src/art/new_mobs3';
import { WS_CANVAS, wsMob } from '../src/art/endless_boss';
import { png } from './king_png';

const out = process.argv[2] ?? '/tmp/ws';
const ts = (process.argv[3] ?? '0').split(',').map(Number);
mkdirSync(out, { recursive: true });
const mob = wsMob();
const FLOOR = '#2a2228';
const glow = process.argv[4] !== 'flat';
for (const t of ts) {
  for (const view of ['front', 'back'] as const) {
    const t0 = performance.now();
    const { px, lights } = paintMob(mob, 'stand', t, view);
    const ms = performance.now() - t0;
    const s = new Px(px.w, px.h);
    s.rect(0, 0, s.w, s.h, FLOOR);
    for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) { const c = px.get(x, y); if (c) s.set(x, y, c); }
    // (its lights, laid soft over it as the game lays them over the dark)
    if (glow) {
      const rgb = (c: string): number[] => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
      for (const l of lights) {
        const [r, g, b] = rgb(l.color);
        for (let y = Math.floor(l.y - l.r); y <= Math.ceil(l.y + l.r); y++) {
          for (let x = Math.floor(l.x - l.r); x <= Math.ceil(l.x + l.r); x++) {
            const q = Math.hypot(x - l.x, y - l.y) / l.r;
            if (q >= 1 || x < 0 || y < 0 || x >= s.w || y >= s.h) continue;
            const w = (l.a ?? 0.5) * (1 - q) * (1 - q);
            const [r0, g0, b0] = rgb(s.get(x, y) ?? FLOOR);
            const mix = (a: number, c: number): string => Math.round(a + (c - a) * w).toString(16).padStart(2, '0');
            s.set(x, y, `#${mix(r0, r)}${mix(g0, g)}${mix(b0, b)}`);
          }
        }
      }
    }
    writeFileSync(`${out}/${view}_${t}.png`, png(s));
    console.log(view, t, `${ms.toFixed(0)} ms`);
  }
}
writeFileSync(`${out}/anchor.json`, JSON.stringify({ ax: WS_CANVAS.ax, ay: WS_CANVAS.ay }));
