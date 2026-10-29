// A PNG of plain pixels (no browser): for the King's pictures and film (tools/king_pictures.ts, tools/king_film.ts).
import { deflateSync } from 'node:zlib';
import type { Px } from '../src/engine/px';

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(b: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  dv.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}
export function png(px: Px): Uint8Array {
  const raw = new Uint8Array((px.w * 3 + 1) * px.h);
  for (let y = 0; y < px.h; y++) {
    raw[y * (px.w * 3 + 1)] = 0;
    for (let x = 0; x < px.w; x++) {
      const si = (y * px.w + x) * 4;
      const di = y * (px.w * 3 + 1) + 1 + x * 3;
      raw[di] = px.d[si];
      raw[di + 1] = px.d[si + 1];
      raw[di + 2] = px.d[si + 2];
    }
  }
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, px.w);
  dv.setUint32(4, px.h);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = [sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 6 })), chunk('IEND', new Uint8Array(0))];
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

