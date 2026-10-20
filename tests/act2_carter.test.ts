// ACT 2, THE HUSH: FLOOR 13'S CARTERS OF THE SILENT ORDER IN THE GAME (game/act1_rules/carter.ts, art/act1_figs/carter.ts,
// render/act1_fx/carter.ts), behind ACT2 (off until his yes):
//   1. they are built: their rules, their pictures (the art chat's) with a clip by each name their act uses, their switch
//      on with the descent's figures, their size as their pictures stand;
//   2. the rules' numbers are their pictures' own: their trudge's pace, the crack's moment, where the lash's end is then
//      and as it rolls out its whole length, its drawing back;
//   3. THE CRACK lands at its picture's moment for one near, a little after for one far out (as the lash rolls on out to
//      him), as far as it reaches and not beyond, along its line and not off it; once;
//   4. ONE CAUGHT BY THE LASH'S END IS DRAGGED IN as it is drawn back, held while he is, no nearer than its near end, and let
//      go after; one close in is not; the drag scrapes the floor behind him;
//   5. with ACT2 on they come in packs of their size on floor 13, and stand guard at its lair's head;
//   6. a long fight on floor 13 with a pack of them: no exceptions, their blow made, the hero never left held.
//   run: tsx --test tests/act2_carter.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIRST5_FIGURES, HEAVY_FIGURES, makeBestiary } from '../src/art/bestiary';
import { act1Fig } from '../src/art/act1_figs/index';
import { CARTERS_ON } from '../src/art/carters';
import { CARTER as CARTER_MOB, CT_DIES, CT_PACE, CT_SHAPE, CT_WHIP } from '../src/art/carters_moves';
import { TILE3, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { ACT1, ACT2 } from '../src/game/act1';
import { act1Pack } from '../src/game/act1_mobs';
import { ACT2_GUARD } from '../src/game/act2_mobs';
import { CARTER, lashReach } from '../src/game/act1_rules/carter';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, gaitOf } from '../src/game/bosses';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import { emptyControls } from '../src/game/state';
import { act1Fx } from '../src/render/act1_fx/index';
import { colourCatcher, longFight, measuredSize, room, untilAct, watch } from './act1_kinds_room_c';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
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
/** The lash's end in its picture at a moment of the crack: tiles before them and to their left, and its height in tiles. */
function cracker(t: number): [number, number, number] {
  const p = CT_SHAPE.tip!('attack', t, skeletonAt(CARTER_MOB, 'attack', t), posedOfMob(CARTER_MOB, 'attack', t))!;
  return [p[0] / TILE3, p[1] / TILE3, p[2] / TILE3];
}
/** The hero put `fwd` tiles before the carter and `left` to the left its picture is drawn with. */
function place(g: ReturnType<typeof room>['g'], m: ReturnType<typeof room>['m'], fwd: number, left: number): void {
  const h = g.hero;
  const hand = m.act ? m.act.hand : 1;
  h.x = m.x + m.fx * fwd + m.fy * hand * left;
  h.y = m.y + m.fy * fwd - m.fx * hand * left;
}

test('1. they are built: their rules, their pictures with a clip by each name their act uses, their switch, their size', () => {
  const r = act1Rules('carter');
  const fig = act1Fig('carter');
  assert.ok(r && fig && act1Fx('carter'), 'their rules, their pictures, their effects');
  assert.ok(fig!.switches?.includes(CARTERS_ON), "the art chat's switch is theirs");
  makeBestiary();
  assert.equal(CARTERS_ON.on, ACT1.on, "on with the descent's figures (art/bestiary.ts useAct1Figs): a switch nothing reads");
  assert.ok(FIRST5_FIGURES.includes('carter') && !HEAVY_FIGURES.includes('carter'), 'a figure the painter paints beside the game, light');
  const art = makeBestiary().of('carter');
  for (const set of [art.front, art.back]) {
    for (const a of r!.acts) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip && clip.frames.length > 0, `its ${a.id}: its clip ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `its ${a.id}'s length`);
    }
    assert.ok(set.clips?.reel && set.clips?.die, 'struck, and over onto their back');
    near((set.clips!.die!.frames.length - 1) / set.clips!.die!.fps, CT_DIES.long, 0.06, "their death's length");
  }
  const m = measuredSize('carter');
  assert.ok(Math.abs(m.size.top - m.head) <= 4, `the game takes them to be ${m.size.top} up; in the picture ${m.head}`);
  assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.4, `${m.size.half} to either side; the picture reaches ${m.reach}`);
});

test("2. the rules' numbers are their pictures' own", () => {
  const G = gaitOf('carter')!;
  assert.equal(G.pace, CT_PACE, 'their trudge at the pace it is painted for');
  assert.equal(MONSTERS.carter.speed, CT_PACE);
  assert.equal(makeBestiary().of('carter').front.walkFps, CARTER_MOB.walkFps, 'their trudge shown at its own rate');
  assert.equal(G.trueBack, CARTER_MOB.trueBack === true);
  const acts = actsOf({ kind: 'carter' })!;
  assert.equal(acts.length, 2, 'two: the whip crack, and the driver\'s lash (the art chat\'s second move, Version 23.2)');
  const lash = acts[0];
  assert.equal(lash.hit, CT_WHIP.hit, 'it cracks at its moment');
  assert.equal(lash.long, CT_WHIP.long);
  assert.equal(MONSTERS.carter.windup, CT_WHIP.hit);
  const L = CARTER.lash;
  assert.equal(L.hit, CT_WHIP.hit);
  // (the lash's end: where it cracks, and where it is rolled out its whole length)
  const [cf, cl, ch] = cracker(CT_WHIP.hit);
  near(L.crack[0], cf, 0.03, 'its end at the crack, before them');
  near(L.crack[1], cl, 0.03, 'and to their right');
  assert.ok(ch > 1.0, `head-high as it cracks (${ch.toFixed(2)} tiles up)`);
  near(L.full, CT_WHIP.cast[1], 1e-9, 'rolled out its whole length as the cast ends');
  const [of, ol] = cracker(L.full);
  near(L.out[0], of, 0.03, 'its whole length before them');
  near(L.out[1], ol, 0.03, 'and to their right');
  assert.ok(Math.abs(L.out[0] - 2.65) < 0.05, 'about 2.65 tiles at most, as the art says');
  near(lashReach(L.hit).fwd, cf, 0.03, 'the rules\' lash at the crack');
  near(lashReach(L.full).fwd, of, 0.03, 'and whole');
  // (its end between: never further out than the rules have it as it rolls on)
  for (let t = L.hit; t <= L.full; t += 0.02) assert.ok(cracker(t)[0] <= lashReach(t).fwd + 0.25, `at ${t.toFixed(2)} its end is not past the rules' reach`);
  assert.equal(CARTER.wrap.draw[0], CT_WHIP.draw[0], 'drawn back as it is painted drawn back');
  assert.equal(CARTER.wrap.draw[1], CT_WHIP.draw[1]);
  assert.ok(lash.far <= L.out[0] && G.stopAt < lash.far, 'it lashes as far as the lash reaches, and stands off inside it');
  assert.ok(L.half + TUNE.heroRadius < 1, 'a narrow line');
});

test('3. the crack: at its moment near, as the lash rolls out further, as far as it reaches; on its line; once', () => {
  for (const [fwd, left, when] of [[0.8, -0.3, CT_WHIP.hit], [1.7, -0.3, CT_WHIP.hit], [2.4, -0.2, -1], [2.75, -0.3, -1], [3.1, -0.3, 0], [1.6, 0.6, 0], [1.6, -1.3, 0]] as const) {
    const { g, m } = room('carter', 2.2, 'carter:lash');
    assert.ok(untilAct(g, m, 'carter:lash'), 'it lashes');
    place(g, m, fwd, left);
    const t0 = m.act!.t;
    g.hero.invuln = 0;
    const s = watch(g, m, 2.2, undefined, () => m.state !== 'act');
    if (when === 0) {
      assert.equal(s.hurts.length, 0, `at ${fwd}, ${left}: out of its reach or off its line`);
      continue;
    }
    assert.equal(s.hurts.length, 1, `at ${fwd}, ${left}: struck once`);
    const at = s.hurts[0].t + t0;
    if (when > 0) near(at, when, 1.5 / 60, `at ${fwd}: as it cracks`);
    else assert.ok(at > CT_WHIP.hit && at <= CARTER.lash.full + 1 / 60, `at ${fwd}: as the lash rolls out to him (${at.toFixed(3)} s)`);
  }
});

test('4. caught by its end, dragged in as it is drawn back, held, no nearer than its near end, let go after; not one close in', () => {
  {
    const { g, m } = room('carter', 2.2, 'carter:lash');
    assert.ok(untilAct(g, m, 'carter:lash'));
    place(g, m, 2.3, -0.3);
    const h = g.hero;
    const d0 = Math.hypot(h.x - m.x, h.y - m.y);
    let heldAt = -1;
    let most = 0;
    let scraped = 0;
    const fx = act1Fx('carter')!;
    const s = watch(g, m, 2.2, undefined, () => {
      if (h.held && h.held > 0 && heldAt < 0) heldAt = m.act ? m.act.t : -1;
      if (m.a1?.grab) {
        const { g: canvas, colours } = colourCatcher();
        fx.ground!({ g: canvas, at: (x, y) => [(x - y) * 16, (x + y) * 8], game: g, t: 0, bestiary: makeBestiary(), stand: () => undefined, spot: () => undefined }, m, null);
        if (colours.size) scraped++;
      }
      most = Math.max(most, d0 - Math.hypot(h.x - m.x, h.y - m.y));
      return m.state !== 'act';
    });
    assert.equal(s.hurts.length, 1, 'struck by its end');
    assert.ok(s.events.some((e) => e.t === 'text' && e.text === 'Lashed'), 'he is told');
    assert.ok(heldAt > 0 && heldAt <= CARTER.wrap.draw[0] + 0.05, `held from as it catches him (${heldAt.toFixed(2)})`);
    const d1 = Math.hypot(h.x - m.x, h.y - m.y);
    near(d0 - d1, Math.min(CARTER.wrap.drag, d0 - CARTER.wrap.near), 0.08, 'dragged in its drag');
    assert.ok(d1 >= CARTER.wrap.near - 0.05, `no nearer than ${CARTER.wrap.near} (${d1.toFixed(2)})`);
    assert.ok(!h.held, 'let go after');
    assert.ok(scraped > 10, 'the scrape behind him as he is dragged');
  }
  {
    const { g, m } = room('carter', 1.2, 'carter:lash');
    assert.ok(untilAct(g, m, 'carter:lash'));
    place(g, m, 1.0, -0.3);
    const h = g.hero;
    const x0 = h.x;
    const y0 = h.y;
    const s = watch(g, m, 2.2, undefined, () => m.state !== 'act');
    assert.equal(s.hurts.length, 1, 'close in: struck by the lash');
    assert.ok(Math.hypot(h.x - x0, h.y - y0) < 0.05 && !h.held, 'and not dragged');
  }
});

test('5. with ACT2 on: packs of their size on floor 13, and its lair\'s guardians', () => {
  hush(() => {
    assert.equal(sizeOf('carter'), 'medium');
    const [lo, hi] = PACK_BY_SIZE.medium;
    const rng = new RNG(8);
    let seen = 0;
    for (let k = 0; k < 400; k++) {
      const p = act1Pack(13, rng, 'normal');
      if (p.kind !== 'carter') continue;
      seen++;
      assert.ok(p.size >= lo && p.size <= hi, `a pack of ${p.size}`);
    }
    assert.ok(seen > 50, `their own packs on floor 13 (${seen} in 400)`);
    assert.equal(ACT2_GUARD[13], 'carter', 'the floor\'s medium kind');
    assert.equal(act1Pack(13, rng, 'champion').kind, 'carter', 'no stand-in now they are built');
  });
});

test('6. a long fight on floor 13 with a pack of them: no exceptions, their blow made, the hero never left held', () => {
  hush(() => {
    const { g, acts } = longFight('carter', 13, 40);
    assert.ok(acts.has('carter:lash'), 'they lashed');
    // (and once they are done with him, he is his own)
    for (const m of g.monsters) if (m.kind === 'carter') m.dead = true;
    for (let i = 0; i < 180; i++) g.update(1 / 60, emptyControls());
    assert.ok(!g.hero.held, 'not held');
  });
});
