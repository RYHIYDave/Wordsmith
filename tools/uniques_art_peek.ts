// THE UNIQUE ITEMS' OWN PICTURES (src/art/items_unique.ts), big, for whoever paints them: each beside nothing, then all of them
// again small (three screen pixels to a picture pixel: about what his phone shows) on the slot's own dark.
//   npx tsx tools/uniques_art_peek.ts <out.png> [scale] [ids,comma,separated] [per row]
// With --dump <dir> in place of an out.png: each picture as <dir>/<id>.rgba (32 by 32, raw), each base kind's orange look as
// <dir>/base_<kind>.rgba, and <dir>/list.json (id, name, base kind), for tools/uniques_art_sheet.py.
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { ITEM_A_KINDS, itemAKind, paintItemA } from '../src/art/items_a';
import { UNIQUE_ART_IDS, paintUnique } from '../src/art/items_unique';
import { RNG } from '../src/engine/rng';
import { UNIQUES, makeUnique, uniqueDef } from '../src/game/uniques';
import { png } from './king_png';

const N = 32;
if (process.argv[2] === '--dump') {
  const dir = process.argv[3] ?? 'shots/uniques_art';
  mkdirSync(dir, { recursive: true });
  const list: { id: string; name: string; kind: string | null }[] = [];
  UNIQUES.on = true;
  const rng = new RNG(7);
  for (const id of UNIQUE_ART_IDS) {
    const p = paintUnique(id)!;
    writeFileSync(`${dir}/${id}.rgba`, Buffer.from(p.d.buffer, p.d.byteOffset, p.d.byteLength));
    const it = makeUnique(id, 12, rng);
    list.push({ id, name: uniqueDef(id)?.name ?? id, kind: it ? itemAKind(it.icon) : null });
  }
  // (and each base kind's orange look, the picture a unique wears today)
  for (const kind of ITEM_A_KINDS) { const p = paintItemA(kind, 3); writeFileSync(`${dir}/base_${kind}.rgba`, Buffer.from(p.d.buffer, p.d.byteOffset, p.d.byteLength)); }
  writeFileSync(`${dir}/list.json`, JSON.stringify(list, null, 1));
  console.log(dir, UNIQUE_ART_IDS.length);
} else {
  const out = process.argv[2] ?? 'peek.png';
  const k = Number(process.argv[3] ?? 8);
  const ids = process.argv[4] && process.argv[4] !== 'all' ? process.argv[4].split(',') : [...UNIQUE_ART_IDS];
  const per = Number(process.argv[5] ?? 5);
  const cell = N * k + 8;
  const rows = Math.ceil(ids.length / per);
  const small = 3;
  const sheet = new Px(per * cell + 8, rows * cell + 8 + N * small + 16);
  sheet.rect(0, 0, sheet.w, sheet.h, '#1a1648');
  const blit = (p: Px, bx: number, by: number, s: number): void => {
    sheet.rect(bx, by, N * s, N * s, '#0e0c24');
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) { const c = p.get(x, y); if (c) sheet.rect(bx + x * s, by + y * s, s, s, c); }
  };
  ids.forEach((id, i) => {
    const p = paintUnique(id);
    if (!p) throw new Error(`no picture for ${id}`);
    blit(p, 8 + (i % per) * cell, 8 + Math.floor(i / per) * cell, k);
    blit(p, 8 + i * (N * small + 6), rows * cell + 12, small);
  });
  writeFileSync(out, png(sheet));
  console.log(out, sheet.w, sheet.h);
}
