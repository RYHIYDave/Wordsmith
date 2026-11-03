// A CANVAS IN NODE for the masked dancers' pictures and film (tools/masque_dancers_film.ts): plain RGBA pixels, figures laid
// on them nearest-pixel, and PNGs written with zlib. Nothing of the game imports it.
// @ts-ignore
import zlib from 'node:zlib';
// @ts-ignore
import fs from 'node:fs';
import type { Px } from '../src/engine/px';
import { rgba } from '../src/engine/px';

export class Canvas {
  readonly w: number;
  readonly h: number;
  readonly d: Uint8Array;
  constructor(w: number, h: number, bg = '#000000') {
    this.w = w;
    this.h = h;
    this.d = new Uint8Array(w * h * 4);
    this.fill(bg);
  }
  fill(c: string): void {
    const [r, g, b] = rgba(c);
    for (let i = 0; i < this.d.length; i += 4) {
      this.d[i] = r;
      this.d[i + 1] = g;
      this.d[i + 2] = b;
      this.d[i + 3] = 255;
    }
  }
  /** One screen pixel, blended `a` (0..1) over what is there. */
  dot(x: number, y: number, r: number, g: number, b: number, a = 1): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    this.d[i] = Math.round(this.d[i] * (1 - a) + r * a);
    this.d[i + 1] = Math.round(this.d[i + 1] * (1 - a) + g * a);
    this.d[i + 2] = Math.round(this.d[i + 2] * (1 - a) + b * a);
  }
  rect(x: number, y: number, w: number, h: number, c: string, a = 1): void {
    const [r, g, b] = rgba(c);
    for (let yy = Math.max(0, Math.floor(y)); yy < Math.min(this.h, Math.ceil(y + h)); yy++) for (let xx = Math.max(0, Math.floor(x)); xx < Math.min(this.w, Math.ceil(x + w)); xx++) this.dot(xx, yy, r, g, b, a);
  }
  /** A painting (picture pixels) laid with its point (`ax`, `ay`) at screen (`x`, `y`), each of its pixels `k` screen pixels square. */
  lay(px: Px, ax: number, ay: number, x: number, y: number, k: number, flip = false): void {
    const y0 = Math.round(y - ay * k);
    for (let py = 0; py < px.h; py++) {
      for (let pxx = 0; pxx < px.w; pxx++) {
        const i = (py * px.w + pxx) * 4;
        const a = px.d[i + 3];
        if (!a) continue;
        // (turned over, as the game turns a picture over for one who faces the other way)
        const sx = flip ? Math.round(x + (ax - pxx - 1) * k) : Math.round(x - ax * k) + pxx * k;
        for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) this.dot(sx + dx, y0 + py * k + dy, px.d[i], px.d[i + 1], px.d[i + 2], a / 255);
      }
    }
  }
  /** A soft dark oval on the floor (a figure's shadow). */
  shadow(x: number, y: number, rx: number, ry: number, a = 0.45): void {
    for (let yy = Math.floor(y - ry); yy <= Math.ceil(y + ry); yy++) {
      for (let xx = Math.floor(x - rx); xx <= Math.ceil(x + rx); xx++) {
        const q = ((xx - x) / rx) ** 2 + ((yy - y) / ry) ** 2;
        if (q < 1) this.dot(xx, yy, 0, 0, 0, a * (1 - q));
      }
    }
  }
  png(path: string): void {
    const raw = Buffer.alloc((this.w * 3 + 1) * this.h);
    for (let y = 0; y < this.h; y++) {
      raw[y * (this.w * 3 + 1)] = 0;
      for (let x = 0; x < this.w; x++) {
        const i = (y * this.w + x) * 4;
        const o = y * (this.w * 3 + 1) + 1 + x * 3;
        raw[o] = this.d[i];
        raw[o + 1] = this.d[i + 1];
        raw[o + 2] = this.d[i + 2];
      }
    }
    const chunk = (type: string, data: Buffer): Buffer => {
      const len = Buffer.alloc(4);
      len.writeUInt32BE(data.length);
      const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
      const crc = Buffer.alloc(4);
      crc.writeUInt32BE(crc32(td) >>> 0);
      return Buffer.concat([len, td, crc]);
    };
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(this.w, 0);
    ihdr.writeUInt32BE(this.h, 4);
    ihdr[8] = 8;
    ihdr[9] = 2;
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;
    fs.writeFileSync(path, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 6 })), chunk('IEND', Buffer.alloc(0))]));
  }
  /** Its pixels as raw RGB (a frame for ffmpeg). */
  rgb(): Buffer {
    const out = Buffer.alloc(this.w * this.h * 3);
    for (let i = 0, j = 0; i < this.d.length; i += 4, j += 3) {
      out[j] = this.d[i];
      out[j + 1] = this.d[i + 1];
      out[j + 2] = this.d[i + 2];
    }
    return out;
  }
}
const CRC = ((): Uint32Array => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(b: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
