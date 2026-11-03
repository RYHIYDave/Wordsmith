// A painting (engine/px.ts Px) written out as a PNG file, without a browser: for looking at pictures painted in code
// (tools/opening_png.ts). Each picture pixel `scale` x `scale` on the PNG.
// @ts-ignore
import { deflateSync } from 'node:zlib';
// @ts-ignore
import { writeFileSync } from 'node:fs';
import type { Px } from '../src/engine/px';

const TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = TABLE[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  dv.setUint32(8 + data.length, crc(out.subarray(4, 8 + data.length)));
  return out;
}

/** Write `p` as a PNG to `file`, each pixel `scale` x `scale`, over `bg` where it is clear. */
export function writePng(p: Px, file: string, scale = 1, bg: [number, number, number] = [13, 16, 48]): void {
  const W = p.w * scale;
  const H = p.h * scale;
  const raw = new Uint8Array((W * 3 + 1) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (W * 3 + 1)] = 0;
    for (let x = 0; x < W; x++) {
      const i = (Math.floor(y / scale) * p.w + Math.floor(x / scale)) * 4;
      const a = p.d[i + 3] / 255;
      const o = y * (W * 3 + 1) + 1 + x * 3;
      raw[o] = Math.round(p.d[i] * a + bg[0] * (1 - a));
      raw[o + 1] = Math.round(p.d[i + 1] * a + bg[1] * (1 - a));
      raw[o + 2] = Math.round(p.d[i + 2] * a + bg[2] * (1 - a));
    }
  }
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, W);
  dv.setUint32(4, H);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = [sig, chunk('IHDR', ihdr), chunk('IDAT', new Uint8Array(deflateSync(raw))), chunk('IEND', new Uint8Array(0))];
  const len = parts.reduce((a, b) => a + b.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  for (const q of parts) {
    out.set(q, o);
    o += q.length;
  }
  writeFileSync(file, out);
}
