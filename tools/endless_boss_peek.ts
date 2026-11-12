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
for (const t of ts) {
  for (const view of ['front', 'back'] as const) {
    const t0 = performance.now();
    const { px } = paintMob(mob, 'stand', t, view);
    const ms = performance.now() - t0;
    const s = new Px(px.w, px.h);
    s.rect(0, 0, s.w, s.h, FLOOR);
    for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) { const c = px.get(x, y); if (c) s.set(x, y, c); }
    writeFileSync(`${out}/${view}_${t}.png`, png(s));
    console.log(view, t, `${ms.toFixed(0)} ms`);
  }
}
writeFileSync(`${out}/anchor.json`, JSON.stringify({ ax: WS_CANVAS.ax, ay: WS_CANVAS.ay }));
