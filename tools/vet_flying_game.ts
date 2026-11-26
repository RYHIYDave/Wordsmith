// THE BRAWLER'S FLYING BLOWS AS THE GAME PAINTS THEM (the skins chat, 26 Nov 2026): his frames (art/veteran_art.ts vetFrame) and
// his effects' three layers (art/veteran_fx_art.ts paintVetFx: on the floor, behind him, over everything), laid as the game lays
// them, at the game's own grain, on a stand-in floor; frames of a move from a side of his, in a row. To look at as a phone shows
// him (each picture pixel one pixel, then `k` times as big). Nothing of the game imports it.
//   npx tsx tools/vet_flying_game.ts <out.png> <move id> <side: front, back, toward, ...> <frames: 0,5,9> [k]
import { writeFileSync } from 'node:fs';
const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const { paintWithoutCanvas, paintingOf } = await import(`${root}/tests/helpers.ts`);
paintWithoutCanvas();
const { Px } = await import(`${root}/src/engine/px.ts`);
const { GRID } = await import(`${root}/src/art/skeleton.ts`);
const { GRAIN } = await import(`${root}/src/art/kit.ts`);
const { MORE_TURN } = await import(`${root}/src/art/sides_more.ts`);
const { vetFrame } = await import(`${root}/src/art/veteran_art.ts`);
const { paintVetFx } = await import(`${root}/src/art/veteran_fx_art.ts`);
const { motionById, placeOf } = await import(`${root}/src/dev/veteran_moves.ts`);
const { png } = await import(`${root}/tools/king_png.ts`);

const [out = '/tmp/vet_game.png', id = 'hammerfist', side = 'front', fr = '23', ks = '2'] = process.argv.slice(2);
const m = motionById(id);
const frames = fr.split(',').map(Number);
const k = Number(ks);
// (each picture: the move's scene round where he stood as it began, in picture pixels)
const W = 420;
const H = 300;
const OX = 150;
const OY = 200;
const sheet = new Px(W * frames.length * k, H * k);
const STONE = ['#1c1a26', '#22202e', '#292636', '#302c3e'];
type P = InstanceType<typeof Px>;
function lay(dst: P, s: { img: unknown; ax: number; ay: number }, x: number, y: number): void {
  const p = paintingOf(s as never) as P;
  const ox = Math.round(x - s.ax * GRAIN);
  const oy = Math.round(y - s.ay * GRAIN);
  for (let j = 0; j < p.h; j++) for (let i = 0; i < p.w; i++) {
    const a = p.d[(j * p.w + i) * 4 + 3];
    if (!a) continue;
    const X = ox + i;
    const Y = oy + j;
    if (X < 0 || Y < 0 || X >= dst.w || Y >= dst.h) continue;
    const d = (Y * dst.w + X) * 4;
    const t = a / 255;
    for (let c = 0; c < 3; c++) dst.d[d + c] = Math.round(dst.d[d + c] * (1 - t) + p.d[(j * p.w + i) * 4 + c] * t);
    dst.d[d + 3] = 255;
  }
}
const r = (MORE_TURN[side as keyof typeof MORE_TURN] * Math.PI) / 180;
const to = (q: readonly number[]): [number, number] => {
  const a = q[0] * Math.cos(r) - q[1] * Math.sin(r);
  const b = q[0] * Math.sin(r) + q[1] * Math.cos(r);
  return [OX + GRID * (a + b), OY + GRID * 0.5 * (a - b)];
};
frames.forEach((F, n) => {
  const pic = new Px(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const a = (x + 0.5 - OX) / 32;
    const b = (y + 0.5 - OY) / 16;
    const u = a + b;
    const v = b - a;
    const seam = u - Math.floor(u) < 0.04 || v - Math.floor(v) < 0.04;
    const c = seam ? '#0c0b14' : STONE[(((Math.floor(u) * 3 + Math.floor(v) * 5) % 4) + 4) % 4];
    const d = (y * W + x) * 4;
    pic.d[d] = parseInt(c.slice(1, 3), 16);
    pic.d[d + 1] = parseInt(c.slice(3, 5), 16);
    pic.d[d + 2] = parseInt(c.slice(5, 7), 16);
    pic.d[d + 3] = 255;
  }
  for (const layer of ['ground', 'behind'] as const) lay(pic, paintVetFx(m, F, side as never, layer), OX, OY);
  const at = placeOf(m, Math.min(F, m.long)).at;
  const [hx, hy] = to([at[0], at[1], 0]);
  lay(pic, vetFrame(side as never, m, Math.min(F, m.long - 1)), hx, hy);
  lay(pic, paintVetFx(m, F, side as never, 'front'), OX, OY);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const s = (y * W + x) * 4;
    for (let yy = 0; yy < k; yy++) for (let xx = 0; xx < k; xx++) {
      const d = ((y * k + yy) * sheet.w + n * W * k + x * k + xx) * 4;
      for (let c = 0; c < 4; c++) sheet.d[d + c] = pic.d[s + c];
    }
  }
});
writeFileSync(out, png(sheet));
console.log(out);
