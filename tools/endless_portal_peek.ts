// ENDLESS MODE'S PORTAL (src/art/endless_portal.ts), big, for whoever paints it: no browser.
//   npx tsx tools/endless_portal_peek.ts <out.png> [scale] [frames, comma separated]
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { PORTAL_FLOOR, paintPortalFloor } from '../src/art/endless_portal';
import { png } from './king_png';

const out = process.argv[2] ?? 'peek.png';
const k = Number(process.argv[3] ?? 6);
const frames = (process.argv[4] ?? '0,30,60,110').split(',').map(Number);
const W = PORTAL_FLOOR.w;
const H = PORTAL_FLOOR.h;
const s = new Px(frames.length * (W * k + 6) + 6, H * k + 12);
s.rect(0, 0, s.w, s.h, '#1a1648');
frames.forEach((f, i) => {
  const p = paintPortalFloor(f).px;
  const bx = 6 + i * (W * k + 6);
  s.rect(bx, 6, W * k, H * k, '#62585e');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = p.get(x, y); if (c) s.rect(bx + x * k, 6 + y * k, k, k, c); }
});
writeFileSync(out, png(s));
console.log(out, s.w, s.h);
