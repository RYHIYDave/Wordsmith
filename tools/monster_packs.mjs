// THE FLOORS' MONSTERS IN PACKS (the queue's publish-25-3-2-to-claude-page, 12 Nov 2026). The monsters' bake is 110 figures, each a
// file and its sheets: 398 files (monsters/4f510caa1c9d). The game's page on claude.ai holds at most 511 files a version, and the page
// and its other folders were 203 already: the monsters' folder could not go beside it. So the bake is carried beside the page in
// packs, ONE FILE A FIGURE: 110 files.
//
// A PACK, `<name>-pack.png`, is
//   the figure's sheets, each a PNG whole, one after another (so the file is a PNG by its first bytes: the page serves only the
//     kinds of file it knows, as the sounds' packs found, tools/sound_packs.mjs);
//   then the figure's file (its JSON, UTF-8), as the bake made it, with `packed`: where each sheet lies, [start, length];
//   then 12 bytes: `WSMB` and the JSON's length in bytes, 8 hex digits.
// The game (render/monsters_baked.ts readPack) fetches a figure's pack, reads its file from the end, and opens each sheet from its
// own bytes. NOTHING IN THE BAKE CHANGES: the sheets are the bake's own bytes, the bake kept as it was (.bake/monsters/<mark>/: a
// file and its sheets), and its mark is the same; only what is carried beside the page is packed (tools/bake_monsters.mjs
// shipMonsters).
import fs from 'node:fs';
import path from 'node:path';

/** The last 12 bytes of a pack begin so (render/monsters_baked.ts PACK_TAIL). */
export const PACK_TAIL = 'WSMB';

/** A figure's pack, by its name as its files have it (render/monsters_baked.ts packName). */
export const packName = (name) => `${name}-pack.png`;

/** A pack made of a figure's file (its JSON, as an object) and its sheets' bytes, in the order of file.sheets. */
export function packFigure(file, sheets) {
  if (!sheets.length) throw new Error(`${file.figure}: no sheets to pack`);
  if (sheets.length !== file.sheets.length) throw new Error(`${file.figure}: ${sheets.length} sheets for the file's ${file.sheets.length}`);
  const packed = [];
  let at = 0;
  for (const b of sheets) {
    packed.push([at, b.length]);
    at += b.length;
  }
  const json = Buffer.from(JSON.stringify({ ...file, packed }), 'utf8');
  const tail = Buffer.from(`${PACK_TAIL}${json.length.toString(16).padStart(8, '0')}`, 'ascii');
  return Buffer.concat([...sheets, json, tail]);
}

/** A pack read back: the figure's file, and each sheet's bytes (to check a pack against what it was made of). */
export function readPack(buf) {
  const tail = buf.subarray(buf.length - 12).toString('ascii');
  if (!tail.startsWith(PACK_TAIL)) throw new Error('not a pack');
  const len = parseInt(tail.slice(4), 16);
  const file = JSON.parse(buf.subarray(buf.length - 12 - len, buf.length - 12).toString('utf8'));
  return { file, sheets: file.packed.map(([a, n]) => buf.subarray(a, a + n)) };
}

/**
 * A figure of a kept bake packed: its file `<name>.json` and its sheets, in `dir`. Checked as it is made: read back, its file and
 * each sheet are the very bytes it was made of. The pack's bytes.
 */
export function packFromBake(dir, name) {
  const file = JSON.parse(fs.readFileSync(path.join(dir, `${name}.json`), 'utf8'));
  const sheets = file.sheets.map((s) => fs.readFileSync(path.join(dir, s)));
  const pack = packFigure(file, sheets);
  const back = readPack(pack);
  const { packed: _p, ...rest } = back.file;
  if (JSON.stringify(rest) !== JSON.stringify(file)) throw new Error(`${name}: its file read back is not as packed`);
  for (let s = 0; s < sheets.length; s++) if (!back.sheets[s].equals(sheets[s])) throw new Error(`${name}: sheet ${s} read back is not as packed`);
  return pack;
}
