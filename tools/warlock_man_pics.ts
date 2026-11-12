// THE WARLOCK BROUGHT UP, THE MAN: HIS FRAMES TO LOOK AT (the queue's finish-mage-and-warlock-eight-sides, step 4, 12 Nov 2026;
// docs/mockups/warlock_up2/README.md, "The man"). Paints moves of his at moments from his eight sides, as the game paints him
// (`game`) and brought up (`up`: art/warlock_up.ts, the switch turned on for it), each an RGBA PNG on his canvas (176 x 176), and a
// note of what was made (frames.json); tools/warlock_man_film.py lays them out. Nothing of the game imports it.
//   npx tsx tools/warlock_man_pics.ts <dir> <move,...> <t,...|all> [game,up] [front,toward,...]
// moves: stand, run, bolt, curse, step, reel, lurch, fall, ready (his card), change, back (getting up as the demon burns out)

// @ts-ignore - node typings are not part of this project
import { mkdirSync, writeFileSync } from 'node:fs';
// @ts-ignore
import { deflateSync } from 'node:zlib';
import type { Px } from '../src/engine/px';
import { WARLOCK_UP } from '../src/art/warlock_up';
import { WL_MOVES, paintWarlockUp, paintWarlockGame } from '../src/art/warlock_up_art';
import type { WlKey } from '../src/art/warlock_up_art';
import { WU_SIDES } from '../src/art/warrior_up';
import type { WuSide } from '../src/art/warrior_up';
import { paintWithoutCanvas } from '../tests/helpers';

declare const process: { argv: string[]; exit: (n: number) => never };
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
export function savePng(path: string, px: Px): void {
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

if (process.argv[1]?.includes("warlock_man_pics")) main();
function main(): void {
const [dir, movesArg, tsArg, whoArg = 'game,up', sidesArg] = process.argv.slice(2);
if (!dir || !movesArg || !tsArg) throw new Error('npx tsx tools/warlock_man_pics.ts <dir> <move,...> <t,...|all> [game,up] [sides]');
mkdirSync(dir, { recursive: true });
const sides = (sidesArg ? sidesArg.split(',') : WU_SIDES) as WuSide[];
const made: Record<string, unknown>[] = [];
for (const key of movesArg.split(',') as WlKey[]) {
  const m = WL_MOVES()[key];
  const ts = tsArg === 'all' ? Array.from({ length: Math.round(m.long * 30) + (m.loops ? 0 : 1) }, (_, i) => i / 30) : tsArg.split(',').map(Number);
  for (const who of whoArg.split(',')) {
    for (const side of sides) {
      ts.forEach((t, i) => {
        WARLOCK_UP.on = who === 'up';
        const px = who === 'up' ? paintWarlockUp(m, t, side).px : paintWarlockGame(m, t, side).px;
        WARLOCK_UP.on = false;
        const name = `${key}_${who}_${side}_${String(i).padStart(3, '0')}.png`;
        savePng(`${dir}/${name}`, px);
        made.push({ name, key, who, side, t, w: px.w, h: px.h });
      });
    }
  }
}
writeFileSync(`${dir}/frames.json`, JSON.stringify(made, null, 1));
console.log(`made ${made.length}`);
}
