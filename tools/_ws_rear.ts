// HIS FOUR FACINGS, each truly painted (none a mirror): down-right (front), down-left (frontL), up-right (back, his true back),
// up-left (rearL); beside each of the two left ones, the old mirror of its right one, to compare: his staff stays in his right hand.
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { paintMob } from '../src/art/new_mobs3';
import { wsMob } from '../src/art/endless_boss';
import { png } from './king_png';
const mob = wsMob();
const [mv = 'stand', tt = '0.5'] = process.argv.slice(3);
const t = Number(tt);
const mirror = (p: Px): Px => { const o = new Px(p.w, p.h); for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) { const c = p.get(x, y); if (c) o.set(p.w - 1 - x, y, c); } return o; };
const front = paintMob(mob, mv, t, 'front').px, back = paintMob(mob, mv, t, 'back').px;
const tiles = [front, paintMob(mob, mv, t, 'frontL').px, mirror(front), back, paintMob(mob, mv, t, 'rearL').px, mirror(back)];
const w = tiles[0].w, h = tiles[0].h;
const out = new Px(w * 3, h * 2);
for (let i = 0; i < out.d.length; i += 4) { out.d[i] = 34; out.d[i + 1] = 28; out.d[i + 2] = 40; out.d[i + 3] = 255; }
tiles.forEach((p, i) => { const ox = (i % 3) * w, oy = Math.floor(i / 3) * h; for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) { const c = p.get(x, y); if (c) out.set(ox + x, oy + y, c); } });
writeFileSync(process.argv[2] ?? '/tmp/ws_rear.png', png(out));
console.log(w, h);
