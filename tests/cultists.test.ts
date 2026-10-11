// THE CULT'S TWO NEW FIGHTERS (src/art/cultists.ts): THE DAGGER CULTIST AND THE MINI FLESHMANCER, A MOCK-UP.
// Nothing of the game makes them. His words, 11 Oct, 14:57: “When you’re finished with that I’d like 2 more
// cultist enemies.  A melee cultist the runs at you with a sacrificial dagger, and a mini fleshmancer elite
// that uses cultist corpses to raise skeletons (can just use the same animation as the warden) and does a
// smaller version of the fire laser from the boss.  They start showing up in floor 4, then all over floor
// 5.” So, first their looks:
//   1. the switch is off, and nothing of the game imports them;
//   2. their stands paint in every frame both ways round: nothing cyan (and no light that is not the
//      enemy's), the enemy's pink edge round each, every pixel whole or empty but the edge, no lone pixel;
//   3. SIZES: the dagger cultist a little shorter than the knight (58); the mini fleshmancer the knight's
//      height, his master (66) a head over him;
//   4. the mini fleshmancer floats, as his master does: a gap of floor under his tails in every frame;
//   5. his master is painted as he always was (the master's look is the default, and only `withFmLook` paints
//      another).
//   run: tsx --test tests/cultists.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { CULTISTS_SWITCH, DAGGER_CULTIST, KNIFE_REST, MINI_FM, MINI_FM_LOOK, MINI_REST, knifeCowlTop, makeDaggerCultistArt3, makeMiniFleshmancerArt3 } from '../src/art/cultists';
import { FLESHMANCER, FM_LOOK, FM_REST, fmHemOf, fmHoodTop, fmTails, withFmLook } from '../src/art/fleshmancer';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { skeletonAt } from '../src/art/new_mobs3';
import { solve } from '../src/art/skeleton';
import { rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };

paintWithoutCanvas();

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 150 || max - min < 0.45 * max) return false;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  h = (h + 360) % 360;
  return h >= 165 && h <= 205;
}
/** Of one frame: how many pixels it paints, how many of them are the enemy's edge, whether any (or any of its lights) is cyan or not the enemy's, and how many pixels are neither whole nor empty but the edge. */
function looked(sp: Sprite): { n: number; rim: number; cyan: boolean; odd: number } {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const d = paintingOf(sp).d;
  let n = 0;
  let rim = 0;
  let odd = 0;
  let cyan = false;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    n++;
    if (d[i + 3] !== 255 && d[i + 3] !== RIM_ALPHA) odd++;
    const grey = d[i] === d[i + 1] && d[i + 1] === d[i + 2];
    if ((FRIEND.has(`${d[i]},${d[i + 1]},${d[i + 2]}`) && !grey) || cyanGlow(d[i], d[i + 1], d[i + 2])) cyan = true;
    if (d[i + 3] === RIM_ALPHA && d[i] === pr && d[i + 1] === pg && d[i + 2] === pb) rim++;
  }
  // (every light he gives off, and his pool of light, the enemy's: hot pink to gold, never cyan)
  for (const l of [...(sp.lights ?? []), ...(sp.aura ? [sp.aura] : [])]) {
    const [r, g, b] = rgba(l.color);
    if (cyanGlow(r, g, b) || FRIEND.has(`${r},${g},${b}`) || r < 150 || r < g || r < b) cyan = true;
  }
  return { n, rim, cyan, odd };
}

/** Of a list of frames: what is wrong with each (as test 2 asks). */
function faults(name: string, frames: ReadonlyArray<Sprite>): string[] {
  const out: string[] = [];
  frames.forEach((sp, i) => {
    const f = looked(sp);
    if (!(f.n > 500 && !f.cyan && f.rim > 40 && f.odd === 0)) out.push(`${name} ${i}: ${f.n} pixels, ${f.rim} edge, ${f.odd} odd${f.cyan ? ', cyan' : ''}`);
    const { w, h, d } = paintingOf(sp);
    const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] === 255;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!solid(x, y)) continue;
        let m = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && solid(x + dx, y + dy)) m++;
        if (m === 0) out.push(`${name} ${i}: a lone pixel at ${x},${y}`);
      }
    }
  });
  return out;
}

test('1. the switch is off, and nothing of the game imports them', () => {
  assert.equal(CULTISTS_SWITCH.on, false);
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f === 'art/cultists.ts') continue;
    const text = fs.readFileSync(path.join('src', f), 'utf8');
    assert.ok(!/from ['"][^'"]*cultists['"]/.test(text), `src/${f} imports the cultists`);
  }
});

test('2. their stands paint in every frame both ways round: nothing cyan, the pink edge round each, every pixel whole or empty but the edge, no lone pixel', () => {
  const knife = makeDaggerCultistArt3();
  const mini = makeMiniFleshmancerArt3();
  const found: string[] = [];
  for (const view of ['front', 'back'] as const) {
    found.push(...faults(`the dagger cultist stands, ${view}`, knife[view].idle));
    found.push(...faults(`the mini fleshmancer stands, ${view}`, mini[view].idle));
  }
  assert.equal(found.length, 0, found.slice(0, 10).join('; '));
});

test('3. sizes: the dagger cultist a little shorter than the knight (58); the mini fleshmancer the knight’s height, his master a head over him', () => {
  const knife = knifeCowlTop(solve(DAGGER_CULTIST.build, KNIFE_REST));
  assert.ok(knife >= 50 && knife <= 57, `the dagger cultist’s cowl ${knife.toFixed(1)} up`);
  const mini = withFmLook(MINI_FM_LOOK, () => fmHoodTop(solve(MINI_FM.build, MINI_REST)));
  const master = fmHoodTop(solve(FLESHMANCER.build, FM_REST));
  assert.ok(mini >= 55 && mini <= 61, `the mini fleshmancer’s hood ${mini.toFixed(1)} up`);
  assert.ok(master - mini >= 6, `his master ${master.toFixed(1)} up, a head over him`);
});

test('4. the mini fleshmancer floats: a gap of floor under his tails in every frame of his stand', () => {
  for (let i = 0; i < MINI_FM.idleFrames; i++) {
    const s = skeletonAt(MINI_FM, 'stand', i / MINI_FM.idleFps);
    const low = withFmLook(MINI_FM_LOOK, () => Math.min(...fmTails(fmHemOf(s), 0, 0).flatMap((x) => x.pts.map((p) => p[2] - x.r))));
    assert.ok(low >= 2, `frame ${i}: his lowest tail ${low.toFixed(1)} off the floor`);
  }
});

test('5. his master is painted in his own look: the default, and back to it after another', () => {
  assert.ok(withFmLook(MINI_FM_LOOK, () => true));
  const s = solve(FLESHMANCER.build, FM_REST);
  assert.equal(fmHoodTop(s).toFixed(3), withFmLook(FM_LOOK, () => fmHoodTop(s)).toFixed(3));
  assert.ok(FM_LOOK.crown && FM_LOOK.gold && !MINI_FM_LOOK.crown && !MINI_FM_LOOK.gold);
});
