// THE NEW ITEM PICTURES, STYLE A (src/art/items_a.ts): every kind at its four rarities written as PNGs with their clear
// background, for tools/items_a_sheet.py to lay out with their captions beside the phone pictures. Nothing of the game imports it.
//   npx tsx tools/items_a_sheet.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import type { Px } from '../src/engine/px';
import { ITEM_A_KINDS, ITEM_A_NAME, paintItemA } from '../src/art/items_a';

const out = process.argv[2] ?? 'items_a_raw';
mkdirSync(out, { recursive: true });

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
  const o = new Uint8Array(12 + data.length);
  const dv = new DataView(o.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) o[4 + i] = type.charCodeAt(i);
  o.set(data, 8);
  dv.setUint32(8 + data.length, crc32(o.subarray(4, 8 + data.length)));
  return o;
}
/** A PNG with its clear pixels kept clear. */
function pngRGBA(p: Px): Uint8Array {
  const raw = new Uint8Array((p.w * 4 + 1) * p.h);
  for (let y = 0; y < p.h; y++) raw.set(p.d.subarray(y * p.w * 4, (y + 1) * p.w * 4), y * (p.w * 4 + 1) + 1);
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, p.w);
  dv.setUint32(4, p.h);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', new Uint8Array(0))];
  const all = new Uint8Array(parts.reduce((n, c) => n + c.length, 0));
  let o = 0;
  for (const c of parts) { all.set(c, o); o += c.length; }
  return all;
}

for (const k of ITEM_A_KINDS) for (const r of [0, 1, 2, 3] as const) writeFileSync(`${out}/A_${k}_${r}.png`, pngRGBA(paintItemA(k, r)));
writeFileSync(`${out}/names.json`, JSON.stringify({ kinds: ITEM_A_KINDS, names: ITEM_A_NAME }));
console.log('written', out);
