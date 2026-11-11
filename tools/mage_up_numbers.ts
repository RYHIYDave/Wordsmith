// THE MAGE BROUGHT UP: THE NUMBERS IN HER README (the Mage chat, 11 Nov 2026; docs/mockups/mage_up/README.md).
//   npx tsx tools/mage_up_numbers.ts legs     knee to floor over hip to knee on the screen, the least of either leg through her
//                                             breathing guard and her town stance, from each of her eight sides: the game's
//                                             bones and hers (art/warrior_up_review.ts wuLegs)
//   npx tsx tools/mage_up_numbers.ts staff    how much of her staff's pole and of its crystal is seen from each side in her
//                                             guard, held as the game holds it (game pixels: the least of four moments)
import { MAGE_BODY, MOVES3 } from '../src/art/moves3';
import type { Move3 } from '../src/art/moves3';
import { bonesAt, solve } from '../src/art/skeleton';
import type { Build } from '../src/art/skeleton';
import { paintMuMove } from '../src/art/mage_up_art';
import { MU_BODY, MU_MOVES } from '../src/art/mage_up_moves';
import { WU_SIDES } from '../src/art/warrior_up';
import { wuLegs } from '../src/art/warrior_up_review';
import { paintWithoutCanvas } from '../tests/helpers';

declare const process: { argv: string[] };
paintWithoutCanvas();
const endOf = (m: Move3): number => m.motion.keys[m.motion.keys.length - 1].at;

function legs(): void {
  const row = (m: Move3, B: Build): string => WU_SIDES.map((v) => {
    let least = 9;
    for (let t = 0; t < endOf(m) - 1e-6; t += 1 / 30) for (const l of wuLegs(solve(B, bonesAt(m.motion.keys, m.rest, t)), v, B.ankle)) least = Math.min(least, l.ratio);
    return least.toFixed(2);
  }).join(' | ');
  console.log(`| | ${WU_SIDES.join(' | ')} |`);
  console.log(`| her guard, the game's bones | ${row(MOVES3.mstand, MAGE_BODY)} |`);
  console.log(`| her guard, her bones now | ${row(MOVES3.mstand, MU_BODY)} |`);
  console.log(`| her town stance, the game's bones | ${row(MOVES3.mtown, MAGE_BODY)} |`);
  console.log(`| her town stance, her bones now | ${row(MOVES3.mtown, MU_BODY)} |`);
  console.log(`standing straight: the game's ${((MAGE_BODY.shank + MAGE_BODY.ankle) / MAGE_BODY.thigh).toFixed(2)}, hers ${((MU_BODY.shank + MU_BODY.ankle) / MU_BODY.thigh).toFixed(2)}`);
}

function staff(): void {
  const pole: string[] = [];
  const gem: string[] = [];
  for (const v of WU_SIDES) {
    let p = Infinity;
    let g = Infinity;
    for (const t of [0, 0.6, 1.2, 2.1]) {
      const f = paintMuMove(MU_MOVES.mstand, t, v);
      const st = f.drawn.stuff;
      const W = f.px.w;
      let a = 0;
      let b = 0;
      // (game pixels: two picture pixels across; one counts when half of it or more is the staff's)
      for (let y = 0; y + 1 < f.px.h; y += 2) for (let x = 0; x + 1 < W; x += 2) {
        let na = 0;
        let nb = 0;
        for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
          const k = st[(y + dy) * W + x + dx];
          if (k === f.staffMats[0]) na++;
          if (k === 1000) nb++;
        }
        if (na >= 2) a++;
        if (nb >= 2) b++;
      }
      p = Math.min(p, a);
      g = Math.min(g, b);
    }
    pole.push(String(p));
    gem.push(String(g));
  }
  console.log(`| | ${WU_SIDES.join(' | ')} |`);
  console.log(`| its pole | ${pole.join(' | ')} |`);
  console.log(`| its crystal | ${gem.join(' | ')} |`);
}

const mode = process.argv[2];
if (mode === 'legs') legs();
else if (mode === 'staff') staff();
else console.log('usage: mage_up_numbers.ts legs | staff');
