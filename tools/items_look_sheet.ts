// THE NEW ITEM PICTURES (docs/mockups/items_look): every picture the sheet needs, written as PNGs with their clear background
// (today's, from art/icons.ts, and the three new styles, src/dev/items_look.ts, at every rarity). tools/items_look_sheet.py lays
// them out with their captions, and lays them over the inventory as an iPhone 16 shows it. Nothing of the game imports it.
//   npx tsx tools/items_look_sheet.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { Px } from '../src/engine/px';
import { makeIconArt } from '../src/art/icons';
import { ITEM_LOOK_KINDS, LOOK_NAME, LOOK_STYLES, paintItemLook } from '../src/dev/items_look';
import type { LookKind } from '../src/dev/items_look';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out = process.argv[2] ?? 'items_raw';
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
  for (let y = 0; y < p.h; y++) {
    raw[y * (p.w * 4 + 1)] = 0;
    raw.set(p.d.subarray(y * p.w * 4, (y + 1) * p.w * 4), y * (p.w * 4 + 1) + 1);
  }
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, p.w);
  dv.setUint32(4, p.h);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = [sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', new Uint8Array(0))];
  const all = new Uint8Array(parts.reduce((n, c) => n + c.length, 0));
  let o = 0;
  for (const c of parts) { all.set(c, o); o += c.length; }
  return all;
}

// today's pictures: 16 by 16 game pixels, one picture pixel to a game pixel; written twice as big, to stand beside the new
const today = makeIconArt().item;
for (const k of ITEM_LOOK_KINDS) {
  if (k === 'wraps') continue;
  const p = today[k].img as unknown as Px;
  const big = new Px(p.w * 2, p.h * 2);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) { const c = p.get(x, y); if (c) big.rect(x * 2, y * 2, 2, 2, c); }
  writeFileSync(`${out}/today_${k}.png`, pngRGBA(big));
}
// the new: every kind, in every style, at every rarity
for (const st of LOOK_STYLES) for (const k of ITEM_LOOK_KINDS) for (const r of [0, 1, 2, 3] as const) writeFileSync(`${out}/${st}_${k}_${r}.png`, pngRGBA(paintItemLook(k as LookKind, st, r)));
writeFileSync(`${out}/names.json`, JSON.stringify({ kinds: ITEM_LOOK_KINDS, names: LOOK_NAME }));
console.log('written', out);
