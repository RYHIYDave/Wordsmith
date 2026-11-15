// HIS FOUR FACINGS, each truly painted, none a mirror: down-right, down-left, up-right, up-left.
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { paintMob } from '../src/art/new_mobs3';
import { wsMob } from '../src/art/endless_boss';
import { png } from './king_png';
const mob = wsMob();
const [mv = 'stand', tt = '0.5'] = process.argv.slice(3);
const tiles = (['front', 'frontL', 'back', 'rearL'] as const).map((v) => paintMob(mob, mv, Number(tt), v).px);
const w = tiles[0].w, h = tiles[0].h;
const out = new Px(w * 4, h);
for (let i = 0; i < out.d.length; i += 4) { out.d[i] = 34; out.d[i + 1] = 28; out.d[i + 2] = 40; out.d[i + 3] = 255; }
tiles.forEach((p, i) => { for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) { const c = p.get(x, y); if (c) out.set(i * w + x, y, c); } });
writeFileSync(process.argv[2] ?? '/tmp/ws_faces4.png', png(out));
