// For looking at pictures painted without a browser (tools/look/*.ts): sprites laid out on one sheet
// and written to a PNG, each in a cell of its own with its anchor at the same place. Not part of the game.
// @ts-ignore
import { writeFileSync } from 'node:fs';
// @ts-ignore
import { deflateSync } from 'node:zlib';
import { Px } from '../../src/engine/px';
import type { Sprite } from '../../src/engine/px';

/** Paint where there is no canvas: a sprite's picture is its painting. Call before anything is painted. */
export function noCanvas(): void {
  (Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
    return this;
  };
}

/** The sprites in cells `cw` x `ch` picture pixels, `cols` to a row, each anchored at (ax, ay) of its cell; on a dark ground; `scale` times. */
export function writeSheet(out: string, sprites: ReadonlyArray<Sprite>, cw: number, ch: number, cols: number, ax: number, ay: number, scale = 3, ground: readonly [number, number, number] = [36, 32, 72]): void {
  const rows = Math.ceil(sprites.length / cols);
  const W = cols * cw;
  const H = rows * ch;
  const sheet = new Uint8Array(W * H * 4);
  for (let i = 0; i < sheet.length; i += 4) {
    sheet[i] = ground[0];
    sheet[i + 1] = ground[1];
    sheet[i + 2] = ground[2];
    sheet[i + 3] = 255;
  }
  sprites.forEach((sp, n) => {
    const p = sp.img as unknown as Px;
    const d = sp.density ?? 1;
    const ox = (n % cols) * cw + Math.round(ax - sp.ax * d);
    const oy = Math.floor(n / cols) * ch + Math.round(ay - sp.ay * d);
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const i = (y * p.w + x) * 4;
      if (p.d[i + 3] === 0) continue;
      const X = ox + x;
      const Y = oy + y;
      if (X < (n % cols) * cw || X >= ((n % cols) + 1) * cw || Y < Math.floor(n / cols) * ch || Y >= (Math.floor(n / cols) + 1) * ch) continue;
      const j = (Y * W + X) * 4;
      sheet[j] = p.d[i];
      sheet[j + 1] = p.d[i + 1];
      sheet[j + 2] = p.d[i + 2];
    }
  });
  const SW = W * scale;
  const SH = H * scale;
  const raw = new Uint8Array((SW * 4 + 1) * SH);
  for (let y = 0; y < SH; y++) {
    raw[y * (SW * 4 + 1)] = 0;
    for (let x = 0; x < SW; x++) {
      const j = (Math.floor(y / scale) * W + Math.floor(x / scale)) * 4;
      const k = y * (SW * 4 + 1) + 1 + x * 4;
      raw[k] = sheet[j];
      raw[k + 1] = sheet[j + 1];
      raw[k + 2] = sheet[j + 2];
      raw[k + 3] = 255;
    }
  }
  const table = new Int32Array(256).map((_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c;
  });
  const crc = (b: Uint8Array): number => {
    let c = -1;
    for (const v of b) c = table[(c ^ v) & 255] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
  const chunk = (type: string, data: Uint8Array): Uint8Array => {
    const o = new Uint8Array(12 + data.length);
    const dv = new DataView(o.buffer);
    dv.setUint32(0, data.length);
    for (let i = 0; i < 4; i++) o[4 + i] = type.charCodeAt(i);
    o.set(data, 8);
    dv.setUint32(8 + data.length, crc(o.subarray(4, 8 + data.length)));
    return o;
  };
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, SW);
  dv.setUint32(4, SH);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', new Uint8Array(0))];
  const all = new Uint8Array(parts.reduce((n, b) => n + b.length, 0));
  let at = 0;
  for (const b of parts) {
    all.set(b, at);
    at += b.length;
  }
  writeFileSync(out, all);
}
