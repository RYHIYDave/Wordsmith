// ACT 2, THE HUSH: FLOOR 13'S BOSS, THE PALIMPSEST, IN THE GAME (game/act1_rules/palimpsest.ts, art/act1_figs/palimpsest.ts,
// render/act1_fx/palimpsest.ts), behind ACT2 (off until his yes): the art chat's pictures (art/palimpsest*.ts) and the rules.
//   1. it is built: the Millrace's boss (the Warden with ACT2 off), its rules, its three looks with every clip its acts
//      name, its effects, heavy, its looks stages; its size as its pictures stand; its line, no mouth's;
//   2. its rules' numbers are its pictures' own;
//   3. its looks are painted as worn as each is (the art's WEAR, put back after each frame);
//   4. MORE TORN AS ITS LIFE RUNS DOWN: below two thirds, below a third, never back; the next look painted ahead, those gone past let go of;
//   5. THE SLAM: where and when its fists come down, and nowhere else; the splash;
//   6. EVERY HIT PEELS PAGES OFF: a page a blow, no more than one in its while, on the blow's side, no more than so many lying;
//   7. PAPER CUTS: whoever is in the whirl is cut again and again while it goes round; beyond it, nothing;
//   8. LOOSE LEAVES: seven birds, each diving at where the hero is as it sets off (the first) or round him, its ring
//      before it, striking there and lying there after as a page; one who steps out of the ring is not struck;
//   9. REWRITE: its pages crawl home to it and heal it, page by page; it is not made with too few, or with nothing to heal;
//  10. "FIRE WORDS SHINE HERE": a page burns under the hero's fire (a fire word's blow on the floor, burning ground), sets
//      alight those touching it, is ash, and never goes home; nothing else burns it;
//  11. killed in the middle of anything: its pages sink into pulp, its birds are gone, nothing left harming him; it falls as torn as it was;
//  12. a long fight on floor 13 with it, with fire words and without: no exceptions, every act made.
//   run: tsx --test tests/act2_palimpsest.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIGURE_SIZE, FIRST5_FIGURES, HEAVY_FIGURES, figureOf, makeBestiary } from '../src/art/bestiary';
import { act1Fig, act1Stages } from '../src/art/act1_figs/index';
import { FIG, PA_LOOKS, wornPalimpsest } from '../src/art/act1_figs/palimpsest';
import { CREST, PALIMPSEST_ON, PA_WHIRL, crestLeaf } from '../src/art/palimpsest';
import { PALIMPSEST, PA_CUTS, PA_DIES, PA_LEAVES, PA_PACE, PA_REWRITE, PA_SLAM, WEAR, slamAt } from '../src/art/palimpsest_moves';
import { BIRD_MARK_FOR, BIRD_SPEED, PAGE_BURN_FOR, PAGE_HOME_SPEED, SLAM_SPLASH_FOR, SLAM_SPLASH_REACH } from '../src/art/palimpsest_shots';
import { hash } from '../src/art/kit';
import { TILE3, skeletonAt } from '../src/art/new_mobs3';
import { add, mul, norm } from '../src/art/skeleton';
import { RNG } from '../src/engine/rng';
import { ACT1, ACT2 } from '../src/game/act1';
import { PA, PAGE, PA_ACTS, PA_GAIT, RULES, whirlReach } from '../src/game/act1_rules/palimpsest';
import { bossKind } from '../src/game/bosses';
import { BOSS_LINES, MONSTERS, TUNE } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster, Peril } from '../src/game/state';
import { FX } from '../src/render/act1_fx/palimpsest';
import { colourCatcher, cyanish, measuredSize, room, watch } from './act1_kinds_room_c';
import { paintWithoutCanvas, seasoned, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

paintWithoutCanvas();

function hush<T>(fn: () => T): T {
  const was = ACT2.on;
  ACT2.on = true;
  try {
    return fn();
  } finally {
    ACT2.on = was;
  }
}
const act = (id: string) => PA_ACTS.find((a) => a.id === `palimpsest:${id}`)!;
/** Only this act of its ready now (null: none). */
function only(m: Monster, id: string | null): void {
  m.moveCd = PA_ACTS.map((a) => (id && a.id === `palimpsest:${id}` ? 0 : 1e9));
  m.cd = 0;
}
/** The Palimpsest `far` tiles east of the hero in an empty practice room, facing him, its life `life` of `of`, only `id` ready. */
function pa(far: number, id: string | null, life = 1, of = 10000): { g: Game; m: Monster } {
  const { g, m } = room('palimpsest', far, null);
  m.maxLife = of;
  m.life = of * life;
  only(m, id);
  return { g, m };
}
/** A blow on it (as the hero's would land: game.ts damageMonster). */
function strike(g: Game, m: Monster, n = 1, el = 'phys'): void {
  (g as unknown as { damageMonster(m: Monster, d: number, el: string, crit: boolean, skill: number): void }).damageMonster(m, n, el, false, -1);
}
const pagesOf = (g: Game): Peril[] => g.perils.filter((p) => p.kind === 'act1' && p.a1 === 'palimpsest:page');
const birdsOf = (g: Game): Peril[] => g.perils.filter((p) => p.kind === 'act1' && p.a1 === 'palimpsest:bird');
/** The game stepped on `secs`, the hero standing, his life put back; and the Palimpsest's only `id` ready all the while (none: null). */
function step(g: Game, secs: number, each?: (t: number) => void): void {
  for (let k = 0; k < Math.round(secs * 60); k++) {
    g.update(1 / 60, emptyControls());
    g.hero.life = g.hero.d.maxLife;
    if (each) each((k + 1) / 60);
    g.events.length = 0;
  }
}
/** Lay `n` pages of it on the floor round it (as blows would), lying now. */
function lay(g: Game, m: Monster, n: number, r = 1.4): Peril[] {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    g.perils.push({ kind: 'act1', a1: 'palimpsest:page', x: m.x + Math.cos(a) * r, y: m.y + Math.sin(a) * r, fx: 0, fy: 0, t: 1, hit: 0, dur: Infinity, dmg: 0, el: 'phys', words: [], from: m.name, done: PAGE.lying, a: a, b: 100 + i, c: 0, d: 0, hand: 1 });
  }
  return pagesOf(g).slice(-n);
}

test('1. it is built: the Millrace\'s boss, its rules, its three looks with every clip, its effects, heavy, staged; its size; its line', () => {
  assert.ok(ACT1.on && !ACT2.on, 'the descent on, the Hush off');
  assert.equal(bossKind(13), 'warden', 'with the Hush off, floor 13 is the deep Crypt\'s, the Warden as before');
  hush(() => assert.equal(bossKind(13), 'palimpsest', 'with it on, floor 13\'s boss is the Palimpsest'));
  assert.ok(RULES && FIG && FX, 'its rules, its pictures, its effects');
  assert.ok(FIG!.heavy && FIG!.staged && FIG!.looks?.length === 2, 'heavy; its looks two, stages');
  assert.ok(FIG!.switches?.includes(PALIMPSEST_ON), "the art chat's switch");
  makeBestiary();
  assert.equal(PALIMPSEST_ON.on, ACT1.on, "on with the descent's figures (useAct1Figs): a switch nothing reads");
  const looks = ['palimpsest', 'palimpsest:1', 'palimpsest:2'] as const;
  for (const f of looks) {
    assert.ok(FIRST5_FIGURES.includes(f) && HEAVY_FIGURES.includes(f), `${f}: painted by the painter, made for its floor`);
    assert.ok(act1Fig(f) && FIGURE_SIZE[f], `${f}: a figure of the game's`);
  }
  // (his rulebook: a basic blow, and the bigger moves with their cooldowns)
  assert.equal(PA_ACTS.filter((a) => a.cooldown === 0).length, 1, 'one basic blow, the slam');
  assert.equal(PA_ACTS.length, 4, 'his four');
  const art = makeBestiary();
  for (const f of looks) {
    const A = art.of(f);
    for (const set of [A.front, A.back]) {
      for (const a of PA_ACTS) {
        const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
        assert.ok(clip && clip.frames.length > 10, `${f}, ${a.id}: its clip ${a.clip}`);
        near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `${f}, ${a.id}'s length`);
      }
      assert.ok(set.clips?.reel && set.clips?.die, `${f}: struck, and its death`);
      near((set.clips!.die!.frames.length - 1) / set.clips!.die!.fps, PA_DIES.long, 0.06, `${f}: its death's length`);
    }
    const m = measuredSize(f);
    assert.ok(Math.abs(m.size.top - m.head) <= 4, `${f}: the game takes it to be ${m.size.top} up; in the picture ${m.head}`);
    assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.6, `${f}: ${m.size.half} to either side; its picture reaches ${m.reach}`);
  }
  // (it has no mouth: its line is the rustle of its pages, no word in it)
  const lines = BOSS_LINES.palimpsest!;
  assert.ok(lines.length >= 1 && lines.every((l) => /^[shr.]+$/i.test(l.replace(/\s/g, ''))), `its lines rustle: ${lines.join(' | ')}`);
});

test("2. its rules' numbers are its pictures' own", () => {
  assert.equal(PA_GAIT.pace, PA_PACE, 'its lumber at the pace it is painted for');
  assert.equal(MONSTERS.palimpsest.speed, PA_PACE);
  assert.equal(MONSTERS.palimpsest.windup, PA_SLAM.hit);
  assert.equal(PA_GAIT.trueBack, PALIMPSEST.trueBack === true);
  assert.equal(act('slam').hit, PA_SLAM.hit, "the slam's blow");
  assert.equal(act('slam').long, PA_SLAM.long);
  assert.equal(PA.slam.hit, PA_SLAM.hit);
  assert.equal(PA.slam.land, PA_SLAM.land, 'its fists in the floor');
  assert.equal(PA.slam.warnFrom, PA_SLAM.up, 'its warning from as its fists are up');
  const at = slamAt();
  near(PA.slam.at[0], at[0] / TILE3, 0.02, 'where they come down, before it');
  near(PA.slam.at[1], at[1] / TILE3, 0.02, 'and to its left');
  assert.equal(PA.slam.r, SLAM_SPLASH_REACH, "the splash's reach");
  assert.equal(PA.slam.splash, SLAM_SPLASH_FOR);
  assert.equal(act('cuts').long, PA_CUTS.long);
  assert.equal(PA.cuts.tear, PA_CUTS.hit, 'its pages torn off');
  assert.deepEqual([...PA.cuts.warn], [...PA_CUTS.warn]);
  assert.equal(PA.cuts.out, PA_CUTS.hit + PA_CUTS.out, 'flung out');
  assert.equal(PA.cuts.home, PA_CUTS.home);
  assert.equal(PA.cuts.on, PA_CUTS.on);
  near(PA.cuts.inner, PA_WHIRL.inner / TILE3, 0.005, "the whirl's inside");
  near(PA.cuts.outer, PA_WHIRL.outer / TILE3, 0.005, 'and its outside');
  assert.equal(act('leaves').long, PA_LEAVES.long);
  assert.equal(PA.leaves.tear, PA_LEAVES.hit);
  assert.equal(PA.leaves.launch, PA_LEAVES.launch, 'out of its picture, the game\'s from there');
  assert.equal(PA.leaves.speed, BIRD_SPEED);
  assert.equal(PA.leaves.mark, BIRD_MARK_FOR);
  // (where each bird is as it leaves its picture: its crest's leaf, flapped up and out as its picture flies it)
  assert.equal(PA.leaves.birds.length, CREST.length, 'one bird a leaf of its crest');
  const s0 = skeletonAt(PALIMPSEST, 'leaves', PA_LEAVES.hit);
  const s1 = skeletonAt(PALIMPSEST, 'leaves', PA_LEAVES.launch);
  CREST.forEach((c, i) => {
    const L = crestLeaf(s0, i, PA_LEAVES.hit, 1);
    const from = add(L.root, mul(L.up, L.ht));
    const [cf, cl] = s1.chest;
    const to = add(from, add(add(mul(norm([cf[0], cf[1], 0], [1, 0, 0]), 30 + 10 * hash(i, 1, 7241)), mul(cl, c.k * 34)), [0, 0, 30 + 14 * hash(i, 2, 7241)]));
    const [f, l, z] = PA.leaves.birds[i];
    near(f, to[0] / TILE3, 0.01, `bird ${i}, before it`);
    near(l, to[1] / TILE3, 0.01, `bird ${i}, to its left`);
    near(z, to[2] / 2, 0.2, `bird ${i}, how high`);
  });
  assert.equal(act('rewrite').long, PA_REWRITE.long);
  assert.equal(PA.rewrite.down, PA_REWRITE.down, 'crouched, it calls them');
  assert.equal(PA.rewrite.speed, PAGE_HOME_SPEED);
  // (every page it calls reaches it before it rises)
  assert.ok(PA.rewrite.down + PA.rewrite.apart * (PA.pages.most - 1) + PA.rewrite.reach / PA.rewrite.speed <= PA_REWRITE.long + 0.01, 'its pages home before its Rewrite is done');
  assert.equal(PA.pages.burn, PAGE_BURN_FOR);
  // (what a Rewrite of every page lying gives back: a little of the fight, not the fight)
  assert.ok(PA.rewrite.heal * PA.pages.most <= 0.02, `at the most ${(PA.rewrite.heal * PA.pages.most * 100).toFixed(1)}% of its life a Rewrite`);
  assert.deepEqual([...PA.wear.looks], [...PA_LOOKS], 'its looks as worn as the rules have them');
});

test('3. its looks are painted as worn as each is, the art\'s WEAR put back after each frame', () => {
  const [whole, half, worn] = PA_LOOKS.map((w) => wornPalimpsest(w));
  assert.ok(whole === PALIMPSEST, 'whole, the art\'s own');
  assert.ok(half.id !== whole.id && worn.id !== half.id, 'each its own name');
  const art = makeBestiary();
  const a0 = art.of('palimpsest').front.idle[0];
  assert.equal(WEAR.now, 0, 'put back');
  const a2 = art.of('palimpsest:2').front.idle[0];
  assert.equal(WEAR.now, 0, 'put back');
  const a1 = art.of('palimpsest:1').front.idle[0];
  const d01 = unlike(a0, a1);
  const d02 = unlike(a0, a2);
  assert.ok(d01 > 300 && d02 > d01, `more torn, more changed: ${d01} pixels half worn, ${d02} worn`);
  // (and a frame of the whole one painted after the worn ones is whole)
  const again = makeBestiary().of('palimpsest').front.idle[0];
  assert.equal(unlike(a0, again), 0, 'whole, as ever');
});

test('4. more torn as its life runs down: below two thirds, below a third, never back; the next painted ahead, those past let go', () => {
  const { g, m } = pa(5, null, 1);
  step(g, 0.1);
  assert.equal(figureOf(m), 'palimpsest', 'whole');
  m.life = m.maxLife * 0.6;
  step(g, 0.1);
  assert.equal(m.form, 1);
  assert.equal(figureOf(m), 'palimpsest:1', 'half worn below two thirds');
  m.life = m.maxLife * 0.3;
  step(g, 0.1);
  assert.equal(figureOf(m), 'palimpsest:2', 'worn below a third');
  m.life = m.maxLife * 0.9;
  step(g, 0.1);
  assert.equal(figureOf(m), 'palimpsest:2', 'healed, it stays as torn as it has been');
  assert.deepEqual(act1Stages('palimpsest'), { next: ['palimpsest:1'], past: [] });
  assert.deepEqual(act1Stages('palimpsest:1'), { next: ['palimpsest:2'], past: ['palimpsest'] });
  assert.deepEqual(act1Stages('palimpsest:2'), { next: [], past: ['palimpsest', 'palimpsest:1'] });
  assert.equal(act1Stages('fieldhand'), null, 'a kind whose looks are not stages: none');
});

test('5. the slam: where and when its fists come down, and nowhere else; the splash', () => {
  const S = PA.slam;
  for (const [fwd, left, hurt] of [[S.at[0], 0, true], [S.at[0] + 1.2, 0.3, true], [S.at[0], -1.25, true], [S.at[0] + 1.75, 0, false], [S.at[0], 1.8, false], [-1.2, 0, false]] as const) {
    const { g, m } = pa(1.9, 'slam');
    let t0 = -1;
    let hurts: number[] = [];
    const h = g.hero;
    const s = watch(g, m, 3, undefined, () => {
      if (t0 < 0 && m.state === 'act' && m.act) {
        t0 = 1;
        const hand = m.act.hand;
        h.x = m.x + m.fx * fwd + m.fy * hand * left;
        h.y = m.y + m.fy * fwd - m.fx * hand * left;
      }
      return t0 > 0 && m.state !== 'act';
    });
    hurts = s.hurts.map((x) => x.t - s.began);
    if (hurt) {
      assert.equal(hurts.length, 1, `at ${fwd.toFixed(2)}, ${left}: struck once`);
      near(hurts[0], S.land, 2 / 60, 'as its fists come down into the floor');
    } else assert.equal(hurts.length, 0, `at ${fwd.toFixed(2)}, ${left}: out of the splash`);
  }
  // (the splash where they came down, and gone after its while)
  const { g, m } = pa(1.9, 'slam');
  let seen: Peril | null = null;
  watch(g, m, 3, undefined, () => {
    seen ??= g.perils.find((p) => p.a1 === 'palimpsest:splash') ?? null;
    return !!seen;
  });
  assert.ok(seen, 'the splash');
  const sp = seen as unknown as Peril;
  const want = { x: m.x + m.fx * S.at[0], y: m.y + m.fy * S.at[0] };
  assert.ok(Math.hypot(sp.x - want.x, sp.y - want.y) < 0.1, 'where they came down');
  step(g, S.splash + 0.1);
  assert.ok(!g.perils.includes(sp), 'gone after its while');
});

test('6. every hit peels pages off: a page a blow, no more than one in its while, on the blow\'s side, no more than so many lying', () => {
  const P = PA.pages;
  // (it stands where it is, close enough to him that it does not come on: the side of a blow is the side he is on)
  const { g, m } = pa(2.0, null, 1);
  step(g, 0.1);
  // (five blows, half a second apart: five pages, each lying from its while after the blow)
  for (let i = 0; i < 5; i++) {
    strike(g, m);
    step(g, 0.05);
    const fresh = pagesOf(g).filter((p) => p.t < 0.06);
    assert.ok(fresh.length === 1 && fresh[0].t < 0, `blow ${i}: a page torn off, in the air yet`);
    step(g, 0.45);
  }
  const five = pagesOf(g);
  assert.equal(five.length, 5, 'five pages');
  const h = g.hero;
  for (const p of five) {
    assert.ok(p.t >= 0 && p.done === PAGE.lying, 'lying');
    const d = Math.hypot(p.x - m.x, p.y - m.y);
    assert.ok(d >= P.near - 0.01 && d <= P.far + 0.01, `${d.toFixed(2)} from its middle`);
    const off = Math.abs(Math.atan2(p.y - m.y, p.x - m.x) - Math.atan2(h.y - m.y, h.x - m.x));
    assert.ok(Math.min(off, Math.PI * 2 - off) <= P.spread + 0.01, 'on the side the blows came from');
  }
  // (blows thick and fast: no more than one page in its while)
  const n0 = pagesOf(g).length;
  for (let i = 0; i < 10; i++) {
    strike(g, m);
    step(g, 0.1);
  }
  const more = pagesOf(g).length - n0;
  assert.ok(more >= 2 && more <= Math.ceil(1.0 / P.every) + 1, `${more} pages for ten blows in a second`);
  // (and no more than so many lie: the oldest sinks into pulp)
  for (let i = 0; i < 20; i++) {
    strike(g, m);
    step(g, P.every + 0.02);
  }
  const lying = pagesOf(g).filter((p) => p.done === PAGE.lying);
  assert.ok(lying.length <= P.most, `${lying.length} lying`);
  assert.ok(pagesOf(g).some((p) => p.done === PAGE.sinking) || pagesOf(g).length <= P.most, 'the oldest sinking');
  // (what burns or poisons it is not a blow: no page)
  const n1 = pagesOf(g).length;
  (g as unknown as { damageMonster(m: Monster, d: number, el: string, crit: boolean, skill: number, heavy: boolean, words: undefined, poison: boolean, dot: boolean): void }).damageMonster(m, 3, 'fire', false, -1, false, undefined, false, true);
  step(g, 0.5);
  assert.ok(pagesOf(g).filter((p) => p.done !== PAGE.sinking).length <= n1, 'burning on it peels nothing off');
});

test('7. Paper Cuts: whoever is in the whirl is cut again and again while it goes round; beyond it, nothing', () => {
  const C = PA.cuts;
  for (const [far, cut] of [[1.2, true], [2.2, true], [C.outer + 0.5, false]] as const) {
    const { g, m } = pa(1.0, 'cuts');
    let placed = false;
    const h = g.hero;
    const s = watch(g, m, 4, undefined, () => {
      if (!placed && m.state === 'act') {
        placed = true;
        h.x = m.x + m.fx * far;
        h.y = m.y + m.fy * far;
      }
      return placed && m.state !== 'act';
    });
    const ts = s.hurts.map((x) => x.t - s.began);
    if (!cut) {
      assert.equal(ts.length, 0, `at ${far.toFixed(2)}: beyond the whirl`);
      continue;
    }
    assert.ok(ts.length >= 4, `at ${far}: cut ${ts.length} times`);
    assert.ok(ts[0] >= C.tear - 1 / 60, `not before its pages tear off (${ts[0].toFixed(2)})`);
    assert.ok(ts[ts.length - 1] <= C.on + 1 / 60, 'nor after they are on it again');
    for (let i = 1; i < ts.length; i++) assert.ok(ts[i] - ts[i - 1] >= C.tick - 1.5 / 60, 'no more than once in its while');
    // (as far as the whirl is out, then)
    for (const t of ts) assert.ok(whirlReach(t + 1 / 60) + TUNE.heroRadius * 0.5 >= far - 0.02, `at ${t.toFixed(2)} the whirl reaches him`);
  }
});

test('8. Loose Leaves: seven birds, each at the hero or round him, its ring first; striking there, and lying there as a page', () => {
  const L = PA.leaves;
  {
    const { g, m } = pa(4, 'leaves');
    const h = g.hero;
    const hx = h.x;
    const hy = h.y;
    let birds: Peril[] = [];
    let first: { x: number; y: number } | null = null;
    let marks = 0;
    const s = watch(g, m, 5, undefined, () => {
      if (!birds.length) birds = birdsOf(g);
      const b0 = birds[0];
      if (b0 && b0.done === 1 && !first) first = { x: b0.fx, y: b0.fy };
      // (each ring drawn through the last of its dive)
      const { g: canvas, colours } = colourCatcher();
      for (const b of birdsOf(g)) FX!.ground!({ g: canvas, at: (x, y) => [(x - y) * 16, (x + y) * 8], game: g, t: 0, bestiary: makeBestiary(), stand: () => undefined, spot: () => undefined }, null, b);
      if (colours.size) marks++;
      return birds.length > 0 && birdsOf(g).length === 0 && m.state !== 'act';
    });
    assert.equal(birds.length, 7, 'seven birds, out of its picture as it lets them go');
    assert.ok(first, 'the first set off');
    const f = first as unknown as { x: number; y: number };
    assert.ok(Math.hypot(f.x - hx, f.y - hy) < 0.01, 'the first at where the hero stood as it set off');
    for (const b of birds) {
      const d = Math.hypot(b.fx - hx, b.fy - hy);
      assert.ok(d <= L.scatter[1] + 0.01, `each at him or round him (${d.toFixed(2)})`);
    }
    assert.ok(s.hurts.length >= 1, `he stood still: struck (${s.hurts.length} times)`);
    assert.ok(marks > 20, 'their rings on the floor');
    // (each lies where it struck, a page of it)
    const pages = pagesOf(g);
    assert.ok(pages.length >= 5, `${pages.length} pages where they struck`);
    for (const p of pages) assert.ok(birds.some((b) => Math.hypot(b.fx - p.x, b.fy - p.y) < 0.01), 'a page where a bird struck');
  }
  {
    // (one who steps out of the ring as it closes is not struck by that one)
    const { g, m } = pa(5, 'leaves');
    const h = g.hero;
    let moved = false;
    const s = watch(g, m, 5, (t, c) => {
      const b0 = birdsOf(g)[0];
      if (b0 && b0.done === 1) moved = true;
      if (moved) c.my = 1;
      void t;
    }, () => moved && birdsOf(g).length === 0 && m.state !== 'act');
    void h;
    assert.ok(s.hurts.length <= 3, `walking out of them: struck ${s.hurts.length} of seven`);
  }
});

test('9. Rewrite: its pages crawl home and heal it, page by page; not with too few, nor with nothing to heal', () => {
  const RW = PA.rewrite;
  {
    const { g, m } = pa(3, 'rewrite', 0.5);
    const pages = lay(g, m, 6, 1.5);
    lay(g, m, 1, RW.reach + 1.5);
    const life0 = m.life;
    let crawling = 0;
    let began = false;
    watch(g, m, 4, undefined, () => {
      crawling = Math.max(crawling, pagesOf(g).filter((p) => p.done === PAGE.crawling).length);
      began ||= m.state === 'act';
      return began && m.state !== 'act';
    });
    assert.ok(began, 'it rewrites');
    assert.ok(crawling === 6, `the six within its reach crawl home (${crawling})`);
    near(m.life - life0, 6 * RW.heal * m.maxLife, 1e-6, 'healed by each');
    assert.ok(pages.every((p) => !g.perils.includes(p)), 'soaked up');
    assert.equal(pagesOf(g).length, 1, 'the one beyond its reach lies where it is');
  }
  {
    // (with too few, or with nothing to heal, it is not made)
    for (const [n, life] of [[RW.least - 1, 0.5], [6, 0.98]] as const) {
      const { g, m } = pa(3, 'rewrite', life);
      lay(g, m, n, 1.5);
      const s = watch(g, m, 2);
      assert.equal(s.began, -1, `${n} pages, ${life} of its life: no Rewrite`);
    }
  }
});

test('10. fire words shine here: a page burns under his fire, sets its neighbours alight, is ash, and never goes home', () => {
  const P = PA.pages;
  const RW = PA.rewrite;
  {
    // (a fire word's blow on the floor where it lies: game.ts breakProps; not another's)
    const { g, m } = pa(4, null, 0.5);
    const [p, q, far] = [...lay(g, m, 1, 1.4), ...lay(g, m, 1, 1.4), ...lay(g, m, 1, 3.0)];
    q.x = p.x + 0.3;
    q.y = p.y;
    g.bosses.floorBlow(p.x, p.y, 0.1, 'frost');
    assert.equal(p.done, PAGE.lying, 'frost does not burn it');
    g.bosses.floorBlow(p.x, p.y, 0.1, 'fire');
    assert.equal(p.done, PAGE.burning, 'fire does');
    step(g, P.catchAfter + 0.05);
    assert.equal(q.done, PAGE.burning, 'it sets the one touching it alight');
    assert.equal(far.done, PAGE.lying, 'not one further off');
    step(g, P.burn);
    assert.ok(!g.perils.includes(p) && !g.perils.includes(q), 'ash, and gone');
  }
  {
    // (burning ground under it: the hero's fire, a Kindling, a melded pool)
    const { g, m } = pa(4, null, 0.5);
    const [p] = lay(g, m, 1, 1.4);
    g.zones.push({ x: p.x + 0.4, y: p.y, r: 0.6, t: 0, dur: 3, kind: 'burn', element: 'fire', dmg: 1, slow: 0, tick: 0.2, hostile: false, skill: -1, words: [], from: '' });
    step(g, 0.05);
    assert.equal(p.done, PAGE.burning, 'it catches on burning ground');
    const [q] = lay(g, m, 1, 1.4);
    q.x = m.x - 1.4;
    q.y = m.y;
    g.zones.push({ x: q.x, y: q.y, r: 0.6, t: 0, dur: 3, kind: 'burn', element: 'fire', dmg: 1, slow: 0, tick: 0.2, hostile: true, skill: -1, words: [], from: 'it' });
    step(g, 0.05);
    assert.equal(q.done, PAGE.lying, "an enemy's fire is not his");
  }
  {
    // (burned in its Rewrite, crawling home: it never gets there)
    const { g, m } = pa(3, 'rewrite', 0.5);
    lay(g, m, 6, 2.5);
    const life0 = m.life;
    let burned = 0;
    watch(g, m, 4, undefined, () => {
      const crawl = pagesOf(g).filter((p) => p.done === PAGE.crawling && p.t - p.c - p.d > 0.2);
      if (crawl.length && !burned) {
        g.bosses.floorBlow(crawl[0].x, crawl[0].y, 0.05, 'fire');
        burned = 1;
      }
      return burned > 0 && m.state !== 'act';
    });
    step(g, 0.5);
    assert.ok(burned === 1, 'one burned on its way');
    const healed = Math.round((m.life - life0) / (RW.heal * m.maxLife));
    assert.ok(healed >= 4 && healed <= 5, `healed by the pages that got home only (${healed} of 6)`);
  }
  {
    // (and the hero's own fire, swung at it with Flame in front: pages where his blade comes down burn)
    const { g, m } = pa(1.6, null, 0.5);
    const h = g.hero;
    h.words.fire = (h.words.fire ?? 0) + 1;
    h.skills[0].front[0] = 'fire';
    g.refresh();
    assert.equal(h.skills[0].r.element, 'fire', 'his quick attack is fire');
    // (pages strewn between him and it, where his blade comes down)
    const strewn: Peril[] = [];
    for (let i = 0; i < 6; i++) {
      const [p] = lay(g, m, 1, 0.1);
      p.x = h.x + 0.3 + i * 0.2;
      p.y = h.y + (i % 2 ? 0.2 : -0.2);
      strewn.push(p);
    }
    const c = emptyControls();
    for (let k = 0; k < 120; k++) {
      Object.assign(c, emptyControls());
      c.fire = true;
      c.aimX = m.x;
      c.aimY = m.y;
      g.update(1 / 60, c);
      h.life = h.d.maxLife;
      g.events.length = 0;
    }
    const burnt = strewn.filter((p) => p.done === PAGE.burning || !g.perils.includes(p)).length;
    assert.ok(burnt >= 1, `his fire caught them (${burnt} of 6)`);
  }
});

test('11. killed in the middle of anything: its pages sink into pulp, its birds are gone, nothing left harming him; it falls as torn as it was', () => {
  for (const id of ['slam', 'cuts', 'leaves', 'rewrite'] as const) {
    for (const when of [0.5, 1.0, 1.4, 2.0]) {
      const { g, m } = pa(id === 'leaves' ? 4 : 1.6, id, 0.3);
      lay(g, m, 5, 1.5);
      step(g, 0.05);
      let t = 0;
      watch(g, m, 4, undefined, () => {
        if (m.state === 'act') t = m.act!.t;
        return m.state === 'act' && t >= when;
      });
      (g as unknown as { kill(m: Monster): void }).kill(m);
      const died = g.events.find((e) => e.t === 'die');
      assert.ok(died && figureOf(died as unknown as { kind: 'palimpsest'; champion: boolean; form?: number }) === 'palimpsest:2', `${id} at ${when}: it falls as worn as it was`);
      g.events.length = 0;
      const s = watch(g, m, 3);
      assert.equal(s.hurts.length, 0, `${id} at ${when}: nothing harms him after`);
      assert.equal(birdsOf(g).length, 0, 'its birds gone');
      assert.equal(pagesOf(g).length, 0, 'its pages sunk into pulp and gone');
    }
  }
});

test('12. a long fight on floor 13 with it, with fire words and without: no exceptions, every act made', () => {
  hush(() => {
    for (const fire of [false, true]) {
      const g = seasoned(new Game('warrior', 13), 18);
      g.depth = 13;
      g.cleared = 13;
      g.enterDungeon();
      const b = g.monsters.find((o) => o.kind === 'palimpsest');
      assert.ok(b && b.boss, 'the Palimpsest is floor 13\'s boss');
      const m = b!;
      g.monsters = g.monsters.filter((o) => o === m);
      const h = g.hero;
      if (fire) {
        h.words.fire = (h.words.fire ?? 0) + 1;
        h.skills[0].front[0] = 'fire';
        g.refresh();
      }
      // (the hero by it, its line said)
      const spot = g.spotsRound(m.x, m.y, 30).find((s) => Math.hypot(s.x - m.x, s.y - m.y) > 3);
      h.x = spot!.x;
      h.y = spot!.y;
      g.bossReady();
      (g as unknown as { wakeUp(m: Monster): void }).wakeUp(m);
      // (as much life as lets the test bot's level-18 swings, without gear, wear it in two minutes)
      m.maxLife = 600;
      m.life = 600;
      const acts = new Set<string>();
      const forms = new Set<number>();
      let burned = 0;
      const c = emptyControls();
      for (let k = 0; k < 120 * 60; k++) {
        const t = k / 60;
        Object.assign(c, emptyControls());
        // (he swings at it, now and then stands off, and now and then dodges)
        const phase = Math.floor(t / 4) % 3;
        if (phase === 2) {
          const d = Math.hypot(h.x - m.x, h.y - m.y) || 1;
          c.mx = (h.x - m.x) / d;
          c.my = (h.y - m.y) / d;
        } else {
          c.fire = true;
          c.aimX = m.x;
          c.aimY = m.y;
        }
        if (k % 233 === 100) {
          c.evade = true;
          c.evadeX = h.x - h.fx * 3;
          c.evadeY = h.y - h.fy * 3;
        }
        g.update(1 / 60, c);
        h.life = h.d.maxLife;
        if (m.act) acts.add(m.act.id);
        // (kept alive to make all its moves: torn as it gets)
        if (m.life < m.maxLife * 0.2) m.life = m.maxLife * 0.25;
        forms.add(m.form ?? 0);
        burned += pagesOf(g).filter((p) => p.done === PAGE.burning && p.t - p.c < 1 / 60 + 1e-6).length;
        g.events.length = 0;
        if (m.dead || g.over) break;
      }
      for (const a of PA_ACTS) assert.ok(acts.has(a.id), `${fire ? 'with fire' : 'without'}: it made its ${a.id} (${[...acts].join(', ')})`);
      assert.ok(forms.has(1), `${fire ? 'with fire' : 'without'}: it wore (${[...forms].join(', ')})`);
      if (fire) assert.ok(burned > 0, `his fire burned its pages (${burned})`);
      // (nothing of it cyan on the floor)
      const { g: canvas, colours } = colourCatcher();
      for (const p of g.perils) if (p.kind === 'act1') FX!.ground!({ g: canvas, at: (x, y) => [(x - y) * 16, (x + y) * 8], game: g, t: 0, bestiary: makeBestiary(), stand: () => undefined, spot: () => undefined }, null, p);
      assert.ok(![...colours].some(cyanish), 'nothing it leaves is cyan');
    }
  });
});
