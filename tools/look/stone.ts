// THE MASTER RUNE-STONE AND THE SLAB MADE FOR IT (art/quest3.ts, art/ring3.ts), for looking at:
// painted here without a browser, on one sheet. Not part of the game.
//   npx tsx tools/look/stone.ts <out.png> [scale]
import { noCanvas, writeSheet } from './sheet';
noCanvas();
// (after the canvas is put aside: the art paints as it is made)
const { makeStoneArt } = await import('../../src/art/quest3');
const { makeRing3 } = await import('../../src/art/ring3');
const { VAULT } = await import('../../src/art/ground');
const out = process.argv[2] ?? 'stone.png';
const scale = Number(process.argv[3] ?? 3);
const q = makeStoneArt();
const r = makeRing3(VAULT);
const stones = [q.lying[0], q.lying[4], q.standing[0], q.standing[3], ...q.laying, q.icon, q.flash];
writeSheet(out.replace('.png', '_stone.png'), stones, 48, 48, 6, 24, 24, scale);
const slabs = [r.slabEmpty, r.slabSet[0], r.slabSet[2], r.slabSet[4], r.slabRunes[1], r.slabRunes[3], r.slab[0], r.slab[3]];
writeSheet(out.replace('.png', '_slab.png'), slabs, 70, 70, 4, 35, 56, scale);
const ring = [r.floorDark, r.fuse[3], r.fuse[8], r.fuse[13], r.floor[0]];
writeSheet(out.replace('.png', '_floor.png'), ring, 212, 106, 3, 106, 53, Math.max(1, scale - 1));
const st = [r.stones[0][0][0], r.stones[0][1][0], r.stones[0][3][0], r.columnRising[1], r.columnRising[4], r.column[0]];
writeSheet(out.replace('.png', '_stones.png'), st, 50, 152, 6, 25, 140, scale);
console.log('wrote', out);
