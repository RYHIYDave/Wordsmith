// THE GODOT PORT: the released game's baked monsters, unpacked for Godot. On the web each figure comes as one file,
// <name>-pack.png (tools/monster_packs.mjs; render/monsters_baked.ts readPack): its sheets one after another, each a PNG
// whole; then its file (JSON, MonsterBakeFile) with where each sheet lies (`packed`); then `WSMB` and the file's length in
// bytes, 8 hex digits. Godot wants each sheet a file of its own: <name>-<n>.png beside <name>.json, as the heroes come.
//   node tools/godot_unpack_monsters.mjs [folder]      (default godot/assets/monsters; the packs are replaced)
import { readdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? 'godot/assets/monsters';
let figures = 0;
let sheets = 0;
for (const f of readdirSync(dir).filter((n) => n.endsWith('-pack.png')).sort()) {
  const name = f.slice(0, -'-pack.png'.length);
  const buf = readFileSync(join(dir, f));
  const tail = buf.subarray(buf.length - 12).toString('latin1');
  if (!tail.startsWith('WSMB')) throw new Error(`${f}: not a pack`);
  const len = parseInt(tail.slice(4), 16);
  const fileAt = buf.length - 12 - len;
  const file = JSON.parse(buf.subarray(fileAt, buf.length - 12).toString('utf8'));
  if (!file.packed || file.packed.length !== file.sheets.length) throw new Error(`${f}: its sheets are not where it says`);
  file.packed.forEach(([at, n], s) => {
    if (!(at >= 0 && n > 0 && at + n <= fileAt)) throw new Error(`${f}: sheet ${s} out of the pack`);
    writeFileSync(join(dir, file.sheets[s]), buf.subarray(at, at + n));
    sheets++;
  });
  delete file.packed;
  writeFileSync(join(dir, `${name}.json`), JSON.stringify(file));
  unlinkSync(join(dir, f));
  figures++;
}
console.log(`unpacked ${figures} figures into ${sheets} sheets in ${dir}`);
