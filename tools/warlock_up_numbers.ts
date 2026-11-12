// THE WARLOCK BROUGHT UP, THE MAN: HIS NUMBERS (the queue's finish-mage-and-warlock-eight-sides, step 4, 12 Nov 2026;
// docs/mockups/warlock_up2/README.md, "The man"). Nothing of the game imports it.
//   npx tsx tools/warlock_up_numbers.ts legs     knee to floor over hip to knee on the screen, the least of either leg whose shin
//                                                 is seen, through his whole stand at 30 a second, each of his eight sides: the
//                                                 game's bones and his bones now (art/warrior_up_review.ts wuLegs)
//   npx tsx tools/warlock_up_numbers.ts run      the most a thigh of a foot in the air is from hanging, in his run (the game's own)
import { WL_UP_BODY } from '../src/art/warlock_up';
import { WL_MOVES } from '../src/art/warlock_up_art';
import { WU_SIDES } from '../src/art/warrior_up';
import { wuLegs, wuThighs } from '../src/art/warrior_up_review';
import { solve } from '../src/art/skeleton';
import type { Build } from '../src/art/skeleton';
import { WARLOCK_SCULPT_BODY } from '../src/dev/sculpt_warlock';
import { warlockPose } from '../src/dev/warlock_moves';

declare const process: { argv: string[] };
const what = process.argv[2] ?? 'legs';
const M = WL_MOVES();
const bodies: [string, Build][] = [['the game\'s bones', WARLOCK_SCULPT_BODY], ['his bones now', WL_UP_BODY]];
if (what === 'legs') {
  console.log(`| | ${WU_SIDES.join(' | ')} |`);
  for (const [name, B] of bodies) {
    for (const [mv, key, t0, t1] of [['his breathing (0 to 1.6 s)', 'stand', 0, 1.6], ['his whole stand (the spasm and the fold among it)', 'stand', 0, 6.6]] as const) {
      const row = WU_SIDES.map((side) => {
        let least = Infinity;
        for (let t = t0; t <= t1 + 1e-9; t += 1 / 30) {
          const s = solve(B, warlockPose(M[key].motion, t));
          for (const l of wuLegs(s, side, B.ankle)) if (l.seen) least = Math.min(least, l.ratio);
        }
        return least.toFixed(2);
      });
      console.log(`| ${mv}, ${name} | ${row.join(' | ')} |`);
    }
  }
}
if (what === 'run') {
  for (const [name, B] of bodies) {
    let most = 0;
    const m = M.run;
    for (let t = 0; t < m.long; t += 1 / 60) for (const th of wuThighs(solve(B, warlockPose(m.motion, t)))) if (th.swinging) most = Math.max(most, th.deg);
    console.log(`${name}: a thigh of a foot in the air at most ${most.toFixed(1)} degrees from hanging`);
  }
}
// `count`: his lists as the game holds them, from his sides, in a dungeon, in town and on his card, blazing or not (one list the
// same in two places counted once): how many lists and frames, as the game has him now and brought up; `count paint` paints a
// frame in every eight of each list too, and says how big his pictures are at the game's grain (each cut to the box round him).
if (what === 'count') {
  const { makeWarlockArt } = await import('../src/art/warlock_art');
  const { WARLOCK_UP } = await import('../src/art/warlock_up');
  const { LIVING_SHADOW } = await import('../src/art/shadow_art');
  const { heroSides } = await import('../src/art/sides');
  const { heroLists } = await import('../src/art/heroes3');
  const { paintWithoutCanvas } = await import('../tests/helpers');
  paintWithoutCanvas();
  LIVING_SHADOW.on = true;
  for (const up of [false, true]) {
    WARLOCK_UP.on = up;
    const share = new Map<string, unknown>();
    const lists = new Set<unknown[]>();
    let sides = 0;
    for (const place of ['dungeon', 'town', 'card'] as const) for (const blaze of [false, true]) {
      const art = makeWarlockArt({ form: 'man', place, blaze }, share);
      const ss = heroSides(art);
      sides = ss.length;
      for (const set of ss) for (const l of heroLists(set)) if (l.length) lists.add(l);
    }
    let frames = 0;
    let bytes = 0;
    let looked = 0;
    for (const l of lists) {
      frames += l.length;
      if (process.argv[3] === 'paint') {
        for (let i = 0; i < l.length; i += 8) {
          const s = l[i] as { w: number; h: number };
          bytes += s.w * s.h * 4 * Math.min(8, l.length - i);
          looked++;
        }
      }
    }
    console.log(`${up ? 'brought up' : 'as he is now'}: ${sides} sides, ${lists.size} lists, ${frames} frames${bytes ? `, about ${(bytes / 1e6).toFixed(1)} MB at the game's grain (from ${looked} painted)` : ''}`);
  }
}
