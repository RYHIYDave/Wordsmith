// THE GODOT PORT: floor 1's loot as the game itself makes it, for godot/scripts/loot.gd.
//   godot/assets/loot/items.json  pools of gear rolled by the game's own Game.rollGear on floor 1 for a new Warrior, one pool
//     for each quality a drop asks for (0 an ordinary monster's, 1 a leader's or a chest's, 2 a guardian's first, 4 a
//     boss's first: game.ts dropLoot), each piece with its name, slot, rarity, picture, its mods (items.ts itemMods) and
//     their lines (modLines), and what burning the Power word into it may give (imbueOptionsFor); the Warrior's own
//     starting greatsword; and the numbers the hero's stats are made from (game/stats.ts derive, defs.ts TUNE, ATTR_GIVES).
//   godot/assets/loot/icons.png + icons.json  the pictures (art/icons.ts itemPic for each piece at its rarity; the gold piles,
//     the life orb, the potion, the Power word's rune), two picture pixels to a game pixel.
//   npx tsx tools/godot_loot.ts [seed]
import { mkdirSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { Game } from '../src/game/game';
import { STAT_INFO, imbueItem, imbueProblem, itemMods, kindName, modLines, starterWeapon } from '../src/game/items';
import { TUNE, ATTR_GIVES } from '../src/game/defs';
import { itemPic, makeIconArt } from '../src/art/icons';
import { makeBodyArt } from '../src/art/body';
import type { Item } from '../src/game/types';

declare const process: { argv: string[] };
paintWithoutCanvas();
const seed = Number(process.argv[2] ?? 1) >>> 0;
const OUT = 'godot/assets/loot';
mkdirSync(OUT, { recursive: true });

const game = new Game('warrior', seed);
game.depth = 1;
game.enterDungeon();
const roll = (q: number): Item => (game as unknown as { rollGear(q: number): Item }).rollGear(q);
const icons = makeIconArt();
const rng = (game as unknown as { rng: Parameters<typeof imbueItem>[2] }).rng;

// --- the pictures, each once, by key ---
const pics = new Map<string, Sprite>();
const picKey = (it: Item): string => {
  const key = `${it.icon}:${it.rarity}`;
  if (!pics.has(key)) pics.set(key, itemPic(icons, it.icon, it.rarity));
  return key;
};
icons.gold.forEach((s, i) => pics.set(`gold:${i}`, s));
pics.set('orb', icons.lifeOrb);
pics.set('potion', icons.potion);
pics.set('word:power', icons.word.power);
// (the fallen wordsmith, before and after he is searched: art/body.ts)
const bodyArt = makeBodyArt();
pics.set('body', bodyArt.body);
pics.set('body:searched', bodyArt.searched);

const plain = (it: Item): Record<string, unknown> => {
  const mods = itemMods(it);
  return {
    name: it.name, base: it.baseName, kind: kindName(it), slot: it.slot, rarity: it.rarity, ilvl: it.ilvl, req: it.reqLevel,
    icon: picKey(it), weapon: !!it.weapon, hands: it.hands ?? 0, aps: it.aps ?? 0,
    mods: mods.map((m) => [m.stat, m.value]),
    implicit: modLines(it.implicit, 'cooldown'),
    lines: modLines(it.affixes.flatMap((a) => a.mods), 'cooldown'),
    // (burning the Power word in, as the game does it: three of its outcomes, each rolled by the game's own imbueItem)
    burn: imbueProblem(it, 'power'),
    power: imbueProblem(it, 'power') ? [] : [0, 1, 2].map(() => { const c = structuredClone(it); const im = imbueItem(c, 'power', rng)!; return { mods: im.mods.map((m) => [m.stat, m.value]), lines: modLines(im.mods, 'cooldown'), rarity: c.rarity }; }),
  };
};

const POOLS: [number, number][] = [[0, 300], [1, 160], [2, 100], [4, 80]];
const pools: Record<string, unknown[]> = {};
const tally: string[] = [];
for (const [q, n] of POOLS) {
  const list = Array.from({ length: n }, () => plain(roll(q)));
  pools[String(q)] = list;
  const by = [0, 0, 0, 0];
  for (const it of list) by[(it as { rarity: number }).rarity]++;
  tally.push(`quality ${q}: ${n} (plain ${by[0]}, magic ${by[1]}, rare ${by[2]}, unique ${by[3]})`);
}
const starter = plain(starterWeapon('warrior'));
const stats: Record<string, { label: string; pct: boolean }> = {};
for (const [k, v] of Object.entries(STAT_INFO)) stats[k] = { label: (v as { label: string }).label, pct: !!(v as { pct?: boolean }).pct };
const body = game.level.body;
writeFileSync(`${OUT}/items.json`, JSON.stringify({ pools, starter, stats, tune: { ...TUNE }, attr: { ...ATTR_GIVES }, body: body ? { x: body.x, y: body.y } : null }));

// --- the pictures in one sheet: each at two picture pixels to a game pixel, its anchor kept ---
function png(w: number, h: number, rgba: Uint8ClampedArray): Uint8Array {
  const raw = new Uint8Array((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1);
  const be = (n: number): number[] => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const chunk = (type: string, data: Uint8Array): number[] => {
    const td = new Uint8Array(4 + data.length);
    for (let i = 0; i < 4; i++) td[i] = type.charCodeAt(i);
    td.set(data, 4);
    return [...be(data.length), ...td, ...be(crc32(td) >>> 0)];
  };
  return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, ...chunk('IHDR', new Uint8Array([...be(w), ...be(h), 8, 6, 0, 0, 0])), ...chunk('IDAT', deflateSync(raw, { level: 9 })), ...chunk('IEND', new Uint8Array(0))]);
}
const SHEET_W = 1024;
const placed: { key: string; x: number; y: number; w: number; h: number; ax: number; ay: number }[] = [];
let cx = 0;
let cy = 0;
let rowH = 0;
for (const [key, s] of pics) {
  const k = 2 / (s.density ?? 1);
  const p = paintingOf(s);
  const w = p.w * k;
  const h = p.h * k;
  if (cx + w > SHEET_W) { cx = 0; cy += rowH + 1; rowH = 0; }
  placed.push({ key, x: cx, y: cy, w, h, ax: s.ax * 2, ay: s.ay * 2 });
  cx += w + 1;
  rowH = Math.max(rowH, h);
}
const H = cy + rowH;
const sheet = new Uint8ClampedArray(SHEET_W * H * 4);
let n = 0;
for (const [, s] of pics) {
  const at = placed[n++];
  const k = 2 / (s.density ?? 1);
  const p = paintingOf(s);
  for (let j = 0; j < at.h; j++) for (let i = 0; i < at.w; i++) {
    const o = (Math.floor(j / k) * p.w + Math.floor(i / k)) * 4;
    const d = ((at.y + j) * SHEET_W + at.x + i) * 4;
    for (let c = 0; c < 4; c++) sheet[d + c] = p.d[o + c];
  }
}
writeFileSync(`${OUT}/icons.png`, png(SHEET_W, H, sheet));
writeFileSync(`${OUT}/icons.json`, JSON.stringify(placed));
console.log(tally.join('\n'));
console.log(`starter: ${(starter as { name: string }).name}; ${pics.size} pictures in a ${SHEET_W}x${H} sheet`);
