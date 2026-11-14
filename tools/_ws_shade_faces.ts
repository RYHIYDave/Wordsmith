// His shade from the four facings, each truly painted, beside him: its staff in its right hand as his is in his.
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { paintMob, skeletonAt } from '../src/art/new_mobs3';
import { wsMob, paintShade, SHADE_CANVAS, WS_CANVAS } from '../src/art/endless_boss';
import { png } from './king_png';
const mob = wsMob();
const views = [['front', 'front'], ['frontL', 'frontL'], ['back', 'rear'], ['rearL', 'rearL']] as const;
const W = SHADE_CANVAS.w, H = SHADE_CANVAS.h;
const out = new Px(W * 4, H);
for (let i = 0; i < out.d.length; i += 4) { out.d[i] = 34; out.d[i + 1] = 28; out.d[i + 2] = 40; out.d[i + 3] = 255; }
views.forEach(([mv, sv], i) => {
  const sk = skeletonAt(mob, 'foot', 0.6);
  const sh = paintShade(sk, 0.6, sv, 1).px, me = paintMob(mob, 'foot', 0.6, mv as never).px;
  for (let y = 0; y < sh.h; y++) for (let x = 0; x < sh.w; x++) { const c = sh.get(x, y); if (c) out.set(i * W + x, y, c); }
  const ox = i * W + SHADE_CANVAS.ax - WS_CANVAS.ax, oy = SHADE_CANVAS.ay - WS_CANVAS.ay;
  for (let y = 0; y < me.h; y++) for (let x = 0; x < me.w; x++) { const c = me.get(x, y); if (c) { const X = ox + x, Y = oy + y; if (X >= 0 && Y >= 0 && X < out.w && Y < out.h) out.set(X, Y, c); } }
});
writeFileSync(process.argv[2] ?? '/tmp/ws_shade_faces.png', png(out));
