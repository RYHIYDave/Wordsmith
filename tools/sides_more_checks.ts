// THE ART'S OWN PICTURE CHECKS, RUN ON THE SIX NEW SIDES (the Tinkerer chat, 11 Nov 2026; docs/mockups/eight_sides/README.md).
// The art chat's tests hold every frame of the Brawler (tests/veteran.test.ts) and the Tinkerer (tests/tinkerer_moves.test.ts)
// from in front and from behind: crisp, the friend's edge, no pixel alone, nothing pink, nothing cut off; and for the Brawler,
// nothing of him through what he wears. The checks of their solids (their bodies clean, nothing in the floor, no solid
// flattened, every joint inside what a body can do) are of the figure, not of a side, and hold for any. Here the checks OF A
// PICTURE are run on every frame of every move from the sides asked for, each truly turned (art/sides_more.ts MORE_TURN).
//   npx tsx tools/sides_more_checks.ts <brawler|tinkerer> [sides, comma-separated: the six new] [out.json]
// @ts-ignore - node typings are not part of this project
import { writeFileSync } from 'node:fs';
import { MORE_TURN } from '../src/art/sides_more';
import type { MoreSide } from '../src/art/sides_more';
import { VET_CANVAS, paintVeteran } from '../src/dev/sculpt_veteran';
import { VET_MOTIONS, placeOf, vetAt } from '../src/dev/veteran_moves';
import { FR, TAP_GRAB, TAP_LET_GO, drawTinkerAt, tinkerMoves } from '../src/dev/tinkerer_moves';
import type { TinkMove } from '../src/dev/tinkerer_moves';
import { drawTinkerHoldAt, tinkerHold } from '../src/dev/tinkerer_hold';
import { tinkerLurch, tinkerReel } from '../src/dev/tinkerer_hits';
import { drawTinkerFallAt, tinkerFall } from '../src/dev/tinkerer_fall';
import { pictureFindings } from '../tests/sculpt_checks';
import { coverFindings } from '../tests/veteran_checks';

declare const process: { argv: string[]; exit(code: number): never };
const NEW: MoreSide[] = ['toward', 'frontL', 'sideL', 'backL', 'away', 'side'];
const [who, a, b] = process.argv.slice(2);
const sides = (a && !a.endsWith('.json') ? a.split(',') : NEW) as MoreSide[];
const out = a && a.endsWith('.json') ? a : b;
const found: string[] = [];
let frames = 0;
const t0 = Date.now();

if (who === 'brawler') {
  for (const m of VET_MOTIONS) {
    const n = m.long + (m.loops ? 0 : 1);
    for (let f = 0; f < n; f++) {
      const p = vetAt(m, f);
      for (const side of sides) {
        const turn = MORE_TURN[side] + placeOf(m, f).turn;
        const d = paintVeteran(p, turn);
        frames++;
        for (const x of pictureFindings(d.px)) found.push(`${m.id} f${f} ${side}: ${x}`);
        for (const x of coverFindings(d, turn, VET_CANVAS.ax, VET_CANVAS.ay)) found.push(`${m.id} f${f} ${side}: ${x}`);
      }
    }
    console.log(`${m.id}: ${n} frames, ${found.length} findings so far, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
} else if (who === 'tinkerer') {
  const moves = tinkerMoves();
  const tap = moves.find((m) => m.name.startsWith('Tap'))!;
  // (her Vial Toss, as art/tinkerer_art.ts has it: the throw with a vial of hers in her fist)
  const toss: TinkMove = { ...tap, name: 'Tap: a vial tossed', hold: (t) => ({ wrench: 0, twirl: false, spin: 0, vial: t >= TAP_GRAB && t < TAP_LET_GO ? 1 : 0, held: null }) };
  const list: [TinkMove, typeof drawTinkerAt][] = [
    ...moves.map((m) => [m, drawTinkerAt] as [TinkMove, typeof drawTinkerAt]),
    [toss, drawTinkerAt],
    [tinkerHold(), drawTinkerHoldAt],
    [tinkerReel(), drawTinkerAt],
    [tinkerLurch(), drawTinkerAt],
    [tinkerFall(), drawTinkerFallAt],
  ];
  for (const [m, draw] of list) {
    const n = Math.round(m.long / FR) + (m.loops ? 0 : 1);
    for (let i = 0; i < n; i++) {
      const t = Math.min(m.long, i * FR);
      for (const side of sides) {
        const d = draw('front', m, t, MORE_TURN[side]);
        frames++;
        for (const x of pictureFindings(d.px)) found.push(`${m.name} ${t.toFixed(2)} s ${side}: ${x}`);
      }
    }
    console.log(`${m.name}: ${n} frames, ${found.length} findings so far, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
} else {
  console.error('which hero: brawler or tinkerer');
  process.exit(1);
}
console.log(`CHECKED ${who}, ${sides.join(' ')}: ${frames} pictures, ${found.length} findings`);
for (const x of found.slice(0, 60)) console.log(`  ${x}`);
if (out) writeFileSync(out, JSON.stringify({ who, sides, frames, found }));
