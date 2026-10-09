// THE WORDSMITH ON BONES, for looking at (art/smith3.ts): frames of him painted here, without a
// browser, laid out on one sheet. Not part of the game.
//   npx tsx tools/look/smith.ts <out.png> [scale]
// @ts-ignore
import { writeFileSync } from 'node:fs';
// @ts-ignore
import { deflateSync } from 'node:zlib';
import { Px } from '../../src/engine/px';
import { SMITH_ACT_LONG, SMITH_IDLE_LONG, SMITH_MOVES, smithFrame } from '../../src/art/smith3';
import type { Facing } from '../../src/art/townsfolk';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};

const out = process.argv[2] ?? 'smith.png';
const scale = Number(process.argv[3] ?? 3);
const cells: { label: string; to: Facing; keys: 'idle' | 'act'; t: number }[] = [];
for (const to of ['sw', 'se', 'ne', 'nw'] as Facing[]) cells.push({ label: `standing ${to}`, to, keys: 'idle', t: 0.4 });
for (const t of [0.4, 0.84, 1.42, 1.6, 1.92, 2.05, 2.15, 2.6]) cells.push({ label: `act ${t}`, to: 'sw', keys: 'act', t });
void SMITH_ACT_LONG;
void SMITH_IDLE_LONG;
const W = 100;
const H = 110;
const cols = 6;
const rows = Math.ceil(cells.length / cols);
const sheet = new Uint8Array(cols * W * rows * H * 4);
for (let i = 0; i < sheet.length; i += 4) {
  sheet[i] = 36;
  sheet[i + 1] = 32;
  sheet[i + 2] = 72;
  sheet[i + 3] = 255;
}
cells.forEach((c, n) => {
  const sp = smithFrame(SMITH_MOVES[c.keys], c.t, c.to, 0.2);
  const p = sp.img as unknown as Px;
  const d = sp.density ?? 1;
  const ox = (n % cols) * W + Math.round(W / 2 - sp.ax * d);
  const oy = Math.floor(n / cols) * H + Math.round(H - 8 - sp.ay * d);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const i = (y * p.w + x) * 4;
    if (p.d[i + 3] === 0) continue;
    const X = ox + x;
    const Y = oy + y;
    if (X < (n % cols) * W || X >= ((n % cols) + 1) * W || Y < Math.floor(n / cols) * H || Y >= (Math.floor(n / cols) + 1) * H) continue;
    const j = (Y * cols * W + X) * 4;
    sheet[j] = p.d[i];
    sheet[j + 1] = p.d[i + 1];
    sheet[j + 2] = p.d[i + 2];
  }
  console.log(n, c.label);
});
// scale up and write a PNG
const SW = cols * W * scale;
const SH = rows * H * scale;
const raw = new Uint8Array((SW * 4 + 1) * SH);
for (let y = 0; y < SH; y++) {
  raw[y * (SW * 4 + 1)] = 0;
  for (let x = 0; x < SW; x++) {
    const j = (Math.floor(y / scale) * cols * W + Math.floor(x / scale)) * 4;
    const k = y * (SW * 4 + 1) + 1 + x * 4;
    raw[k] = sheet[j];
    raw[k + 1] = sheet[j + 1];
    raw[k + 2] = sheet[j + 2];
    raw[k + 3] = 255;
  }
}
const crcTable = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
const crc = (b: Uint8Array): number => {
  let c = -1;
  for (const v of b) c = crcTable[(c ^ v) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
const chunk = (type: string, data: Uint8Array): Uint8Array => {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  dv.setUint32(8 + data.length, crc(out.subarray(4, 8 + data.length)));
  return out;
};
const ihdr = new Uint8Array(13);
const dv = new DataView(ihdr.buffer);
dv.setUint32(0, SW);
dv.setUint32(4, SH);
ihdr[8] = 8;
ihdr[9] = 6;
const png = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', new Uint8Array(0))];
const total = png.reduce((n, b) => n + b.length, 0);
const all = new Uint8Array(total);
let at = 0;
for (const b of png) {
  all.set(b, at);
  at += b.length;
}
writeFileSync(out, all);
console.log('wrote', out, SW, SH);
