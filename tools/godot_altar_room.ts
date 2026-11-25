// THE GODOT PORT: THE CULT'S GATE AT THE MAP'S EDGE, a stronghold on an endless level of any floor without one of its own (his words,
// 23 Nov 2026: “In endless mode I want multiple chained and stronghold encounters per level.  And I want these random encounters,
// (chained, stronghold, muffled bells, and royal cards) to show up in any level.”; the gate at the map's edge, his pick of 25 Nov 2026,
// “Gate at the edge (Recommended)”). Its pieces are the cult's own, painted by the game's own painters: the REDOUBT'S GATEHOUSE of the
// Wilds' strongholds (art/floor6.ts gatehouse: its sealed door's mark burning, 4 frames, and open) and its court's FLAGSTONES
// (flagstones); the ALTAR OF THE WORDS (art/act1_cult.ts wordAltar, its three hollows), the cult's BRAZIERS of pink fire
// (pinkBrazier, 4 frames) and BANNERS (cultBanner, 4 frames); and the gatehouse and the altar TURNED, for a wall that runs along y:
//   npx tsx tools/godot_altar_room.ts   -> godot/assets/altar_room/<name>_<frame>.png, altar_room.json
// Each picture in picture pixels (two to a game pixel), cut to what is painted, with its floor point (ox, oy) from its top left;
// its lights as the art gives them.
import { mkdirSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { ALTAR_HOLLOWS, cultBanner, pinkBrazier, wordAltar } from '../src/art/act1_cult';
import { GRAIN } from '../src/art/kit';
import { gatehouse, quarryPieces } from '../src/art/floor6';
import { inLight } from '../src/art/floor4';
import { LIGHT_W } from '../src/art/floor2';

paintWithoutCanvas();
const OUT = 'godot/assets/altar_room';
mkdirSync(OUT, { recursive: true });

function png(w: number, h: number, rgba: Uint8ClampedArray): Uint8Array {
  const raw = new Uint8Array((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1);
  const be = (n: number): number[] => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const chunk = (type: string, data: Uint8Array): Uint8Array => {
    const td = new Uint8Array(4 + data.length);
    for (let i = 0; i < 4; i++) td[i] = type.charCodeAt(i);
    td.set(data, 4);
    const out = new Uint8Array(12 + data.length);
    out.set(be(data.length), 0);
    out.set(td, 4);
    out.set(be(crc32(td) >>> 0), 8 + data.length);
    return out;
  };
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', new Uint8Array([...be(w), ...be(h), 8, 6, 0, 0, 0])), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', new Uint8Array(0))];
  const all = new Uint8Array(parts.reduce((n, q) => n + q.length, 0));
  let o = 0;
  for (const q of parts) { all.set(q, o); o += q.length; }
  return all;
}

/** A sprite as a picture at two picture pixels to a game pixel, cut to what is painted, its floor point from its corner; `turned`,
 * the picture turned over left to right (for a piece painted in the light turned across: see TURNED below). */
function save(s: Sprite, file: string, turned = false): { file: string; w: number; h: number; ox: number; oy: number; lights: unknown; x0: number; y0: number; k: number } {
  const p = paintingOf(s);
  const k = 2 / (s.density ?? 1);
  let x0 = p.w, y0 = p.h, x1 = -1, y1 = -1;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    if (p.d[(y * p.w + x) * 4 + 3] === 0) continue;
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  const w = (x1 - x0 + 1) * k;
  const h = (y1 - y0 + 1) * k;
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = turned ? x1 - Math.floor(x / k) : x0 + Math.floor(x / k), sy = y0 + Math.floor(y / k);
    out.set(p.d.subarray((sy * p.w + sx) * 4, (sy * p.w + sx) * 4 + 4), (y * w + x) * 4);
  }
  writeFileSync(`${OUT}/${file}`, png(w, h, out));
  const lights = turned ? [] : (s as unknown as { lights?: unknown }).lights ?? [];
  const ox = s.ax * 2 - x0 * k;
  return { file, w, h, ox: turned ? w - ox : ox, oy: s.ay * 2 - y0 * k, lights, x0, y0, k };
}

const table: Record<string, unknown> = {};
const altar = save(wordAltar(), 'altar_0.png');
table.altar = [altar];
// (where the three hollows lie on the altar's picture, from its floor point, in picture pixels: a word given is set in each)
table.hollows = ALTAR_HOLLOWS.map(([x, y]) => [x * altar.k, y * altar.k]);
table.brazier = [0, 1, 2, 3].map((f) => save(pinkBrazier(f), `brazier_${f}.png`));
table.banner = [0, 1, 2, 3].map((f) => save(cultBanner(f), `banner_${f}.png`));
// THE CULT'S GATE AT THE MAP'S EDGE (his pick, 25 Nov 2026: "Gate at the edge (Recommended)", after his “Why wouldn’t you just put
// the door on the edge of the map?”): the redoubt's gatehouse of the Wilds' strongholds (art/floor6.ts gatehouse: four frames of
// the sealed door's mark burning, the fifth open), and its court's flagstones (flagstones: two laid, one worn down the middle)
const piece = (name: string) => {
  const pc = quarryPieces().find((q) => q.name === name);
  if (!pc || !pc.frames) throw new Error(`no piece ${name}`);
  return pc.frames;
};
table.gate = piece("the redoubt's gatehouse").map((s, f) => save(s, `gate_${f}.png`));
table.flag = piece("the court's flagstones").map((s, f) => save(s, `flag_${f}.png`));
// TURNED: the gate in a wall that runs along y, its door looking out down the screen to the right, and its altar along y before it.
// Never a picture flipped as it is (his rulebook, Figures 7: the light still falls from the upper left): each painted in the world's
// light turned across (x for y), then its picture turned over, which is the piece built along y in the world's own light.
const ACROSS = [LIGHT_W[1], LIGHT_W[0], LIGHT_W[2]];
table.gate_y = [0, 1, 2, 3].map((f) => inLight(ACROSS, () => gatehouse(false, f))).concat([inLight(ACROSS, () => gatehouse(true, 0))]).map((s, f) => save(s, `gate_y_${f}.png`, true));
table.altar_y = [save(inLight(ACROSS, () => wordAltar()), 'altar_y_0.png', true)];
for (const k of ['altar', 'brazier', 'banner', 'gate', 'flag', 'gate_y', 'altar_y']) {
  console.log(k, (table[k] as { w: number; h: number; ox: number; oy: number }[]).map((f) => `${f.w}x${f.h} at ${f.ox},${f.oy}`).join('; '));
}
console.log('hollows', JSON.stringify(ALTAR_HOLLOWS), 'grain', GRAIN);
writeFileSync(`${OUT}/altar_room.json`, JSON.stringify(table, null, 1));
