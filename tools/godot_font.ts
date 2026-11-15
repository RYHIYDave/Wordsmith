// THE GAME'S LETTERS FOR THE GODOT VERSION (branch godot/port): engine/font.ts's two pixel fonts, 'normal' and 'small', each
// glyph as the screen draws it (at the finer grain, FONT_GRAIN picture pixels to a font pixel: fineGlyph, and the normal font's
// stems thickened, boldGlyph), white, into one sheet each; and font.json, what godot/scripts/pixel_font.gd needs to lay them
// out as drawText does: each glyph's place in its sheet and its width (in font pixels), the gap, the line heights, the space,
// the look-alikes (curly quotes, dashes), and the small font's multiply sign.
//   npx tsx tools/godot_font.ts        (from the repository's root)
// The strips are read from engine/font.ts as it stands (they are not exported), so a glyph changed there comes over as it is.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import { FONT_BOLD, FONT_GRAIN, LINE_H, boldGlyph, fineGlyph } from '../src/engine/font';

const OUT = 'godot/assets/font';
mkdirSync(OUT, { recursive: true });
const src = readFileSync('src/engine/font.ts', 'utf8');

type Strip = readonly [string, readonly string[]];
/** A table out of engine/font.ts: the text from `const NAME...= [` to its closing `];`, read as a value. */
function table<T>(name: string): T {
  const at = src.indexOf(`const ${name}`);
  const from = src.indexOf('= [', at) + 2;
  const to = src.indexOf('\n];', from) + 2;
  return new Function(`return ${src.slice(from, to)};`)() as T;
}
const STRIPS: Record<'normal' | 'small', readonly Strip[]> = { normal: table('NORMAL_STRIPS'), small: table('SMALL_STRIPS') };
const LOOK_ALIKES = table<[string, string][]>('LOOK_ALIKES');
const SPACE = { normal: 3, small: 2 };
const HEIGHT = { normal: 8, small: 5 };
const GAP = 1;
const PAD = 2;

function png(w: number, h: number, rgba: Uint8Array): Buffer {
  const chunk = (type: string, data: Buffer): Buffer => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'latin1'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const out: Record<string, unknown> = { grain: FONT_GRAIN, gap: GAP, look_alikes: Object.fromEntries(LOOK_ALIKES.map(([a, b]) => [a.charCodeAt(0), b.charCodeAt(0)])) };
for (const id of ['normal', 'small'] as const) {
  const h = HEIGHT[id];
  // (the glyphs, in the font's own order: the space first, then each strip's)
  const glyphs: { ch: string; rows: string[] }[] = [{ ch: ' ', rows: Array.from({ length: h }, () => '.'.repeat(SPACE[id])) }];
  for (const [chars, rows] of STRIPS[id]) {
    const cells = rows.map((r) => r.split(' '));
    for (let i = 0; i < chars.length; i++) glyphs.push({ ch: chars.charAt(i), rows: cells.map((c) => c[i] ?? '') });
  }
  let atlasW = 0;
  const table: Record<number, [number, number, number]> = {};
  const placed: { x: number; fine: string[]; ink: boolean }[] = [];
  for (const gl of glyphs) {
    const w = Math.max(...gl.rows.map((r) => r.length));
    const rows = gl.rows.map((r) => r + '.'.repeat(w - r.length));
    const fine = FONT_BOLD[id] ? boldGlyph(fineGlyph(rows)) : fineGlyph(rows);
    const ink = rows.some((r) => r.includes('#'));
    table[gl.ch.charCodeAt(0)] = [atlasW, w, ink ? 1 : 0];
    placed.push({ x: atlasW, fine, ink });
    atlasW += w + PAD;
  }
  // (the sheet: white ink, FONT_GRAIN picture pixels to a font pixel)
  const W = atlasW * FONT_GRAIN;
  const H = h * FONT_GRAIN;
  const px = new Uint8Array(W * H * 4);
  for (const p of placed) {
    p.fine.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        if (row.charCodeAt(x) !== 35) continue;
        const o = (y * W + p.x * FONT_GRAIN + x) * 4;
        px[o] = px[o + 1] = px[o + 2] = px[o + 3] = 255;
      }
    });
  }
  writeFileSync(`${OUT}/${id}.png`, png(W, H, px));
  const times = id === 'small' ? table[0xd7] : undefined;
  out[id] = { h, line: LINE_H[id], caps_only: id === 'small', unknown: '?'.charCodeAt(0), glyphs: table, ...(times ? { times: 0xd7 } : {}) };
  console.log(`${id}: ${glyphs.length} glyphs, ${W}x${H}`);
}
writeFileSync(`${OUT}/font.json`, JSON.stringify(out));
