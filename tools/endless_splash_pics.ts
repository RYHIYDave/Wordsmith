// ENDLESS MODE'S SPLASH (art/endless_splash.ts), AS PICTURES, painted here without a browser (a mock-up, not in the game).
//   npx tsx tools/endless_splash_pics.ts <out dir>      the whole picture (whole.png), and the part a phone held sideways shows
//                                                        (phone.png, 507 x 234 game pixels, each picture pixel doubled), and the
//                                                        gates' waking as a picture (stages.png)
// (the film is made from the game itself: tools/scenarios/endless_splash_film.mjs)
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodeZlib from 'node:zlib';
import { ES_GATES, ES_H, ES_VX, ES_VY, ES_VY_AT, ES_W, paintEndlessSplash } from '../src/art/endless_splash';

const fs = nodeFs as { mkdirSync(p: string, o: { recursive: boolean }): void; writeFileSync(p: string, d: unknown): void };
const zlib = nodeZlib as { deflateSync(b: Uint8Array, o?: { level: number }): Uint8Array };
declare const process: { argv: string[] };
// @ts-ignore
const Buf = Buffer as { alloc(n: number): Uint8Array & { writeUInt32BE(v: number, o: number): void }; concat(l: Uint8Array[]): Uint8Array; from(s: string, e?: string): Uint8Array };

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc(b: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array): Uint8Array {
  const len = Buf.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buf.concat([Buf.from(type, 'ascii'), data]);
  const cr = Buf.alloc(4);
  cr.writeUInt32BE(crc(td), 0);
  return Buf.concat([len, td, cr]);
}
/** A PNG of w x h pixels, rgb(x, y) a 0xRRGGBB number. */
function png(w: number, h: number, rgb: (x: number, y: number) => number): Uint8Array {
  const raw = new Uint8Array((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    const o = y * (w * 3 + 1);
    for (let x = 0; x < w; x++) {
      const c = rgb(x, y);
      raw[o + 1 + x * 3] = (c >> 16) & 255;
      raw[o + 2 + x * 3] = (c >> 8) & 255;
      raw[o + 3 + x * 3] = c & 255;
    }
  }
  const head = Buf.alloc(13);
  head.writeUInt32BE(w, 0);
  head.writeUInt32BE(h, 4);
  head[8] = 8;
  head[9] = 2;
  return Buf.concat([Buf.from('\x89PNG\r\n\x1a\n', 'latin1'), chunk('IHDR', head), chunk('IDAT', zlib.deflateSync(raw, { level: 6 })), chunk('IEND', Buf.alloc(0))]);
}

const out = process.argv[2] || 'shots/endless_splash';
fs.mkdirSync(out, { recursive: true });
const t0 = Date.now();
const p = paintEndlessSplash();
console.log(`painted ${p.w} x ${p.h} in ${Date.now() - t0} ms`);
fs.writeFileSync(`${out}/whole.png`, png(p.w, p.h, (x, y) => p.c[y * p.w + x]));
// (a phone held sideways: 507 x 234 game pixels, the vanishing point where the game puts it)
const gw = 507;
const gh = 234;
const ox = (ES_VX - Math.floor(gw / 2)) * 2;
const oy = (ES_VY - Math.round(gh * ES_VY_AT)) * 2;
fs.writeFileSync(`${out}/phone.png`, png(gw * 4, gh * 4, (x, y) => p.c[(oy + (y >> 1)) * p.w + ox + (x >> 1)]));
// (a close look: the middle of it, each picture pixel six across)
fs.writeFileSync(`${out}/close.png`, png(300 * 6, 150 * 6, (x, y) => p.c[(ES_VY * 2 - 110 + Math.floor(y / 6)) * p.w + ES_VX * 2 - 150 + Math.floor(x / 6)]));
fs.writeFileSync(`${out}/stages.png`, png(p.w, p.h, (x, y) => {
  const s = p.stage[y * p.w + x];
  const v = Math.round((s / ES_GATES) * 255);
  return (v << 16) | (((s * 53) & 255) << 8) | (255 - v);
}));
console.log(`wrote ${out}/whole.png, phone.png, close.png, stages.png (${ES_W} x ${ES_H} game pixels)`);
