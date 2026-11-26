// THE BRAWLER'S FLYING BLOWS, PICTURES TO WORK FROM (the skins chat, 26 Nov 2026): frames of a move of his (dev/veteran_moves.ts),
// from the turns asked, laid in a sheet, each picture made `k` times as big (whole pixels), the floor line under each; and what
// the Veteran's checks find in each frame (tests/veteran_checks.ts, tests/sculpt_checks.ts). Nothing of the game imports it.
//   npx tsx tools/vet_flying_pics.ts <out.png> <move id> <frames: 0,5,9 or all or a-b> [turns: 0,90] [k]
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { VET_CANVAS, paintVeteran } from '../src/dev/sculpt_veteran';
import { motionById, placeOf, vetAt } from '../src/dev/veteran_moves';
import { bodyFindings, pictureFindings } from '../tests/sculpt_checks';
import { coverFindings, jointFindings } from '../tests/veteran_checks';
import { png } from './king_png';

const [out = '/tmp/vet.png', id = 'hammerfist', fr = 'all', tv = '0,90', ks = '2'] = process.argv.slice(2);
const m = motionById(id);
const frames = fr === 'all' ? Array.from({ length: m.long + 1 }, (_, i) => i) : fr.includes('-') ? (() => {
  const [a, b] = fr.split('-').map(Number);
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
})() : fr.split(',').map(Number);
const turns = tv.split(',').map(Number);
const k = Number(ks);
// (each picture cropped to where he is: from x0, y0 of his canvas, cw by ch)
const [x0, y0, cw, ch] = (process.env.CROP ?? '40,10,140,175').split(',').map(Number);
const cols = turns.length;
const per = Math.max(1, Math.floor(1800 / (cw * k * cols)));
const rows = Math.ceil(frames.length / per);
const W = cw * k * cols * per + (per - 1) * 6;
const H = ch * k * rows;
const sheet = new Px(W, H);
for (let i = 0; i < sheet.d.length; i += 4) {
  sheet.d[i] = 26;
  sheet.d[i + 1] = 24;
  sheet.d[i + 2] = 36;
  sheet.d[i + 3] = 255;
}
const found: string[] = [];
const r1 = (v: readonly number[]): string => v.map((x) => x.toFixed(1)).join(',');
frames.forEach((f, n) => {
  const p = vetAt(m, f);
  if (process.env.JOINTS) console.log(`f${f} pel ${r1(p.s.pelvis)} head ${r1(p.s.head)} hL ${r1(p.s.handL)} hR ${r1(p.s.handR)} kR ${r1(p.s.kneeR)} aL ${r1(p.s.ankleL)} aR ${r1(p.s.ankleR)} air ${p.air}`);
  const pl = placeOf(m, f);
  for (const x of jointFindings(p.s, p)) found.push(`f${f}: ${x}`);
  turns.forEach((t, c) => {
    const d = paintVeteran(p, t + pl.turn);
    if (t === 0 || t === 90) {
      for (const x of pictureFindings(d.px)) found.push(`f${f} ${t}: ${x}`);
      for (const x of bodyFindings(d.fig.sc, true)) if (!(p.air && x.startsWith('standing on nothing'))) found.push(`f${f} ${t}: ${x}`);
    }
    for (const x of coverFindings(d, t + pl.turn, VET_CANVAS.ax, VET_CANVAS.ay)) found.push(`f${f} ${t}: ${x}`);
    const ox = (n % per) * (cw * k * cols + 6) + c * cw * k;
    const oy = Math.floor(n / per) * ch * k;
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const s = ((y + y0) * VET_CANVAS.w + x + x0) * 4;
      const floor = y + y0 === VET_CANVAS.ay;
      const a = d.px.d[s + 3];
      for (let yy = 0; yy < k; yy++) for (let xx = 0; xx < k; xx++) {
        const di = ((oy + y * k + yy) * W + ox + x * k + xx) * 4;
        if (a) {
          sheet.d[di] = d.px.d[s];
          sheet.d[di + 1] = d.px.d[s + 1];
          sheet.d[di + 2] = d.px.d[s + 2];
        } else if (floor) {
          sheet.d[di] = 70;
          sheet.d[di + 1] = 66;
          sheet.d[di + 2] = 90;
        } else if (x === 0 || y === 0) {
          sheet.d[di] = 12;
          sheet.d[di + 1] = 10;
          sheet.d[di + 2] = 20;
        }
      }
    }
  });
});
writeFileSync(out, png(sheet));
console.log(`${frames.length} frames, ${turns.length} turns, ${per} a row: ${out}`);
console.log(found.length ? [...new Set(found)].join('\n') : 'nothing found');
