// THE MOVES TO SWAP'S ICONS (art/ability_icons.ts), beside the ones they sit with on the skill bar, as a picture's pixels:
//   node node_modules/tsx/dist/cli.mjs tools/swap_moves_icons.ts > /tmp/icons.json   (then a picture is made of it)
import { SWAP_ICON_PAINTERS } from '../src/art/ability_icons';
import { INK } from '../src/art/kit';
const out: Record<string, (string | null)[][]> = {};
for (const [id, paint] of Object.entries(SWAP_ICON_PAINTERS)) {
  const px = paint().outline(INK);
  const rows: (string | null)[][] = [];
  for (let y = 0; y < 32; y++) {
    const row: (string | null)[] = [];
    for (let x = 0; x < 32; x++) row.push(px.get(x, y));
    rows.push(row);
  }
  out[id] = rows;
}
console.log(JSON.stringify(out));
