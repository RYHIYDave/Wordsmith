// THE NEXT UNIQUES IN PLAY (src/art/unique_play_art2.ts), big, for whoever paints them: no browser.
//   npx tsx tools/uniques_play_peek2.ts <arm|bird> <out.png> [scale]
// arm: the Drowned Arm at every frame from its warning, its black water under it; bird: her bird in every pose.
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { ARM, BIRD, BIRD_POSES, paintArm, paintArmPool, paintBird } from '../src/art/unique_play_art2';
import { png } from './king_png';

const what = process.argv[2] ?? 'arm';
const out = process.argv[3] ?? 'peek.png';
const k = Number(process.argv[4] ?? 3);
const FLOOR = '#1c1a4a';
function grid(cells: Px[], per: number, cw: number, ch: number): Px {
  const rows = Math.ceil(cells.length / per);
  const s = new Px(per * (cw * k + 4) + 4, rows * (ch * k + 4) + 4);
  s.rect(0, 0, s.w, s.h, '#0e0c24');
  cells.forEach((c, i) => {
    const bx = 4 + (i % per) * (cw * k + 4);
    const by = 4 + Math.floor(i / per) * (ch * k + 4);
    s.rect(bx, by, cw * k, ch * k, FLOOR);
    for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) { const col = c.get(x, y); if (col) s.rect(bx + x * k, by + y * k, k, k, col); }
  });
  return s;
}
let cells: Px[] = [];
if (what === 'arm') {
  for (let f = 0; f < ARM.frames; f++) {
    const c = new Px(ARM.w, ARM.h);
    const pool = paintArmPool(f);
    // (the water under the enemy, between its root and him)
    c.blit(pool.px, Math.round(ARM.ax + 14 - pool.ax), Math.round(ARM.ay + 4 - pool.ay));
    c.blit(paintArm(f), 0, 0);
    cells.push(c);
  }
  writeFileSync(out, png(grid(cells, 9, ARM.w, ARM.h)));
} else {
  cells = BIRD_POSES.map((p) => paintBird(p));
  writeFileSync(out, png(grid(cells, 6, BIRD.w, BIRD.h)));
}
console.log(out);
