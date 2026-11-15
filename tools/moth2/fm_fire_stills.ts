// THE FLESHMANCER'S FIRE, OLD AND AS FLAMES (FLESH2), side by side on a dark floor, at moments of his fire: for looking at while it is
// made. node node_modules/tsx/dist/cli.mjs tools/moth2/fm_fire_stills.ts <out.png>
import fs from 'node:fs';
// @ts-ignore
import { encodePng } from '../png.mjs';
import { Px } from '../../src/engine/px';
import { paintFire } from '../../src/art/fleshmancer_action_fx';
import { FLESH2 } from '../../src/art/fm2_switch';
import { picAt } from '../../src/render/act1_fx/live';

const W = 760;
const H = 520;
const ts = [1.3, 1.8, 2.6, 3.6];
const out = new Uint8ClampedArray(W * 2 * H * ts.length * 4);
ts.forEach((t, row) => {
  [false, true].forEach((on, col) => {
    FLESH2.on = on;
    const p = new Px(W, H);
    const at = picAt(W / 2, H / 2 + 60);
    paintFire(p, at, t, [0, 0], 0.6, at(0.2, 0, 90), 'floor');
    paintFire(p, at, t, [0, 0], 0.6, at(0.2, 0, 90), 'air');
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const s = (y * W + x) * 4;
      const d = (((row * H + y) * W * 2) + col * W + x) * 4;
      const a = p.d[s + 3] / 255;
      out[d] = 22 * (1 - a) + p.d[s] * a; out[d + 1] = 18 * (1 - a) + p.d[s + 1] * a; out[d + 2] = 30 * (1 - a) + p.d[s + 2] * a; out[d + 3] = 255;
    }
  });
});
fs.writeFileSync(process.argv[2] || '/tmp/fm_fire.png', encodePng(W * 2, H * ts.length, out));
