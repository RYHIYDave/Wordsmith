// The third round of fixes' sheet (docs/mockups/action_fixes/pictures/action_fixes3_sheet.png): THE MASKED DANCERS' OLD SPIN, kept in
// the set with DANCER_THROW on (`moves.spin`), beside the game's own spin, at the same moments (the figures' own frames, the game's
// picture pixels: the sheet scales them); and a moment of the pair's throw. Nothing of the game imports it.
//   npx tsx tools/action_fixes3_frames.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { paintMob } from '../src/art/new_mobs3';
import { DANCER_LADY, DN_SPIN } from '../src/art/masque_dancers_moves';
import { THROW_HIT, THROW_LADY } from '../src/art/action_f16_dancer';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const [out = 'frames'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const ts = [DN_SPIN.warn[1] - 0.05, DN_SPIN.hit, DN_SPIN.hit + 0.3];
ts.forEach((t, i) => {
  writeFileSync(`${out}/game_spin_${i}.png`, png(paintMob(DANCER_LADY, 'attack', t, 'front').px));
  writeFileSync(`${out}/kept_spin_${i}.png`, png(paintMob(THROW_LADY, 'spin', t, 'front').px));
});
writeFileSync(`${out}/throw.png`, png(paintMob(THROW_LADY, 'attack', THROW_HIT + 0.2, 'front').px));
console.log('dancer frames', out);
