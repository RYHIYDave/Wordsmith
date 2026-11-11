// THE NEW DEMONS: THE PICTURES FOR THE OWNER (the Warlock chat, 11 Nov 2026; docs/mockups/warlock_up2/README.md).
// Paints each new demon (dev/demon_new.ts) standing on all fours on the game's demon's bones, and beside them the game's
// demon as it is, the Warlock and the Brawler, each as an RGBA PNG in its own canvas; tools/demon_new_pics.py lays them out.
// Nothing of the game imports it.
//   npx tsx tools/demon_new_pics.ts <dir> [pact,pale,mane] [front,back]

// @ts-ignore - node typings are not part of this project
import { mkdirSync, writeFileSync } from 'node:fs';
// @ts-ignore
import { deflateSync } from 'node:zlib';
import type { Px } from '../src/engine/px';
import { demonMoves, demonPose, drawDemonAt } from '../src/dev/demon_moves';
import { drawWarlockAt, warlockMoves } from '../src/dev/warlock_moves';
import { makeVeteranArt } from '../src/art/veteran_art';
import { newDemonFrame } from '../src/dev/demon_new';
import type { NewDemon } from '../src/dev/demon_new';
import type { Bones } from '../src/art/skeleton';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';

declare const process: { argv: string[] };
paintWithoutCanvas();

const TABLE = (() => {
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
  for (let i = 0; i < b.length; i++) c = TABLE[(c ^ b[i]) & 255] ^ (c >>> 8);
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
function save(path: string, px: Px): void {
  const raw = new Uint8Array((px.w * 4 + 1) * px.h);
  for (let y = 0; y < px.h; y++) raw.set(px.d.subarray(y * px.w * 4, (y + 1) * px.w * 4), y * (px.w * 4 + 1) + 1);
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, px.w);
  dv.setUint32(4, px.h);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 6 })), chunk('IEND', new Uint8Array(0))];
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  writeFileSync(path, out);
}

const dir = process.argv[2];
if (!dir) throw new Error('npx tsx tools/demon_new_pics.ts <dir> [pact,pale,mane] [front,back]');
mkdirSync(dir, { recursive: true });
const kinds = (process.argv[3] ?? 'pact,pale,mane').split(',') as NewDemon[];
const views = (process.argv[4] ?? 'front').split(',') as ('front' | 'back')[];
/** The moment of its stand the pictures show (a breath, both claws down). */
const T = 0.3;
const stand = demonMoves()[0];
for (const kind of kinds) for (const v of views) save(`${dir}/new_${kind}_${v}.png`, newDemonFrame(kind, v, demonPose(stand.motion, T) as Bones, 0, T, stand.tail ? stand.tail(T) : 0).px);
// (the game's demon as it is, anchored 180, 276; the Warlock, 84, 132; the Brawler, 18, 60: all two picture pixels a game pixel)
for (const v of views) save(`${dir}/demon_today_${v}.png`, drawDemonAt(v, stand, T).px);
save(`${dir}/warlock_front.png`, drawWarlockAt('front', warlockMoves()[0], 0.6).px);
save(`${dir}/brawler_front.png`, paintingOf(makeVeteranArt().front.idle[0]));
