// THE STRONGHOLDS' FRONTS (art/hold_fronts.ts), each floor's sealed and open, on a dark ground with its door's foot marked: a sheet
// for whoever makes them. Nothing of the game imports it.
//   npx tsx tools/hold_fronts_pics.ts <out.png> [floors, a comma list] [scale]
// @ts-ignore
import { writeFileSync } from 'node:fs';
// @ts-ignore
import { deflateSync } from 'node:zlib';
declare const process: { argv: string[] };
const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const out = process.argv[2];
const only = process.argv[3] ? process.argv[3].split(',').map(Number) : null;
const S = Number(process.argv[4] || 2);
const { paintWithoutCanvas } = await import(`${root}/tests/helpers.ts`);
paintWithoutCanvas();
const { HOLD_FRONTS } = await import(`${root}/src/art/hold_fronts.ts`);

const TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc = (b: Uint8Array) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = TABLE[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type: string, data: Uint8Array): Uint8Array { const o = new Uint8Array(12 + data.length); const dv = new DataView(o.buffer); dv.setUint32(0, data.length); for (let i = 0; i < 4; i++) o[4 + i] = type.charCodeAt(i); o.set(data, 8); dv.setUint32(8 + data.length, crc(o.subarray(4, 8 + data.length))); return o; }
function png(path: string, w: number, h: number, d: Uint8Array): void {
  const raw = new Uint8Array((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) raw.set(d.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1);
  const ih = new Uint8Array(13); const dv = new DataView(ih.buffer); dv.setUint32(0, w); dv.setUint32(4, h); ih[8] = 8; ih[9] = 6;
  writeFileSync(path, Buffer.concat([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw, { level: 1 })), chunk('IEND', new Uint8Array(0))]));
}
const list = HOLD_FRONTS.filter((h: any) => !only || only.includes(h.floor));
// (a cell: 170 x 240 game pixels, the door's foot at (60, 205))
const CW = 170, CH = 240, AX = 60, AY = 205;
const cols = 2;
const W = CW * cols * S, H = CH * list.length * S;
const img = new Uint8Array(W * H * 4);
const put = (x: number, y: number, r: number, g: number, b: number, a = 255) => {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4; const k = a / 255;
  img[i] = img[i] * (1 - k) + r * k; img[i + 1] = img[i + 1] * (1 - k) + g * k; img[i + 2] = img[i + 2] * (1 - k) + b * k; img[i + 3] = 255;
};
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) put(x, y, 34, 30, 46);
list.forEach((h: any, row: number) => {
  [h.make(false, 0), h.make(true, 0)].forEach((sp: any, col: number) => {
    const ox = col * CW * S, oy = row * CH * S;
    // a floor of tiles under it, its door's foot marked
    for (let ty = -6; ty <= 6; ty++) for (let tx = -6; tx <= 6; tx++) {
      for (let v = 0; v < 16 * S; v++) for (let u = -32 * S; u < 32 * S; u++) {
        if (Math.abs(u) / (32 * S) + Math.abs(v - 8 * S) / (8 * S) > 1) continue;
        const cx = ox + AX * S + (tx - ty) * 16 * S + u, cy = oy + AY * S + (tx + ty) * 8 * S + v - 8 * S;
        if (cx < ox || cx >= ox + CW * S || cy < oy || cy >= oy + CH * S) continue;
        const edge = Math.abs(u) / (32 * S) + Math.abs(v - 8 * S) / (8 * S) > 0.94;
        const c = edge ? 40 : (tx + ty) % 2 ? 52 : 58;
        put(cx, cy, c, c - 4, c + 10);
      }
    }
    const d = sp.img.d as Uint8ClampedArray;
    const k = sp.density ?? 1;
    const pw = Math.round(sp.w * k), ph = Math.round(sp.h * k);
    const x0 = ox + Math.round((AX - sp.ax) * S), y0 = oy + Math.round((AY - sp.ay) * S);
    for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) {
      const i = (y * pw + x) * 4; if (!d[i + 3]) continue;
      const xa = Math.floor((x * S) / k), xb = Math.floor(((x + 1) * S) / k), ya = Math.floor((y * S) / k), yb = Math.floor(((y + 1) * S) / k);
      for (let X = xa; X < xb; X++) for (let Y = ya; Y < yb; Y++) put(x0 + X, y0 + Y, d[i], d[i + 1], d[i + 2], d[i + 3]);
    }
    for (let a = -3; a <= 3; a++) { put(ox + AX * S + a, oy + AY * S, 64, 232, 240); put(ox + AX * S, oy + AY * S + a, 64, 232, 240); }
  });
});
png(out, W, H, img);
console.log(`${out}: ${list.map((h: any) => h.floor).join(', ')} (${W} x ${H})`);
