// THE WINDCUTTER'S BLADE (render/unique_fx.ts drawBlade), big, no browser: drawn by its own code onto a floor of the game's grey
// through a stand-in for the canvas (fillRect, globalAlpha, fillStyle), three ways it flies, at moments of its flight.
//   npx tsx tools/uniques_play_blade_peek.ts <out.png> [scale]
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { UniqueFx } from '../src/render/unique_fx';
import { png } from './king_png';

const out = process.argv[2] ?? 'blade.png';
const k = Number(process.argv[3] ?? 4);
const W = 140;
const H = 90;
function cell(fx: number, fy: number, age: number, dist: number): Px {
  const rgb = new Float32Array(W * H * 3);
  for (let i = 0; i < W * H; i++) [rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]] = (((i % W) >> 3) + ((Math.floor(i / W) >> 3))) % 2 ? [36, 32, 84] : [30, 26, 72];
  const g = {
    globalAlpha: 1,
    fillStyle: '#000000',
    fillRect(x: number, y: number, w: number, h: number): void {
      const c = String(this.fillStyle);
      const r = parseInt(c.slice(1, 3), 16), gg = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16);
      for (let yy = Math.round(y); yy < Math.round(y + h); yy++) for (let xx = Math.round(x); xx < Math.round(x + w); xx++) {
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const i = (yy * W + xx) * 3;
        const a = this.globalAlpha;
        rgb[i] = rgb[i] * (1 - a) + r * a; rgb[i + 1] = rgb[i + 1] * (1 - a) + gg * a; rgb[i + 2] = rgb[i + 2] * (1 - a) + b * a;
      }
    },
  };
  const cam = { ox: W / 2, oy: H / 2 + 10 } as never;
  const p = { x: 0, y: 0, vx: fx * 15, vy: fy * 15, r: 0.8, age, dist } as never;
  new UniqueFx().drawBlade(g as unknown as CanvasRenderingContext2D, cam, p, age);
  const px = new Px(W, H);
  for (let i = 0; i < W * H; i++) px.set(i % W, Math.floor(i / W), '#' + [0, 1, 2].map((c) => Math.round(rgb[i * 3 + c]).toString(16).padStart(2, '0')).join(''));
  return px;
}
const cells: Px[] = [];
for (const [fx, fy] of [[1, 0], [0.707, -0.707], [0, -1], [-0.6, 0.8]]) for (const [age, dist] of [[0.03, 6.5], [0.2, 4], [0.42, 0.6]]) cells.push(cell(fx, fy, age, dist));
const per = 3;
const s = new Px(per * (W * k + 4) + 4, Math.ceil(cells.length / per) * (H * k + 4) + 4);
s.rect(0, 0, s.w, s.h, '#0e0c24');
cells.forEach((c, i) => {
  const bx = 4 + (i % per) * (W * k + 4);
  const by = 4 + Math.floor(i / per) * (H * k + 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) s.rect(bx + x * k, by + y * k, k, k, c.get(x, y)!);
});
writeFileSync(out, png(s));
console.log(out);
