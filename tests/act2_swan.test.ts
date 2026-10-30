// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16'S SWANS IN THE GAME (game/act1_rules/swan.ts, art/act1_figs/swan.ts,
// render/act1_fx/swan.ts), behind HIGH_CITY (off until his yes):
//   1. they are built: their rules, their pictures (the art chat's) with a clip by each name their act uses, from in front and
//      behind, their switch on with the descent's figures, their size as their pictures stand;
//   2. the rules' numbers are their pictures' own: the waddle's pace, the bite's moment and length, where its bill shuts; the
//      strip it strikes beyond its bill, and bigger than the Hush's like kind's (his rule of 28 Oct);
//   3. THE BITE lands at its picture's moment on whoever is in its strip, once, and not beyond it, beside it or behind;
//   4. THE CHARGE (his “Waddle and charge”): far off it waddles at its pace; seeing him near, it charges, its feet still gripping
//      (its walk stepped by the ground it covers); it stops charging as it bites, and waddles a while after;
//   5. IN FLOCKS (his “Knee-high, in flocks”): with HIGH_CITY off none anywhere; with it on, on floor 16, flocks bigger than
//      another small kind's packs;
//   6. their death, the burst of feathers, their own; the 'die' event; the figure in both views;
//   7. THE WARNING: through the bite's wind-up the strip it will strike is marked on the floor, in the enemy's pink, where the
//      rules strike and nowhere else; nothing cyan; none once it has bitten;
//   8. a long fight with a flock of them (in the practice room, until floor 16's own map-maker is in): no exceptions, their
//      bite made, their charge made.
//   run: tsx --test tests/act2_swan.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIRST5_FIGURES, HEAVY_FIGURES, figureOf, makeBestiary } from '../src/art/bestiary';
import { act1Fig } from '../src/art/act1_figs/index';
import { SWAN_BITE, SWAN_DIE, SWAN_ON, SWAN_PACE, SWAN_WALK, swanSolids } from '../src/art/garden_swans';
import { FLAME } from '../src/art/mkit';
import { TILE3 } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { ACT1, HIGH_CITY } from '../src/game/act1';
import { act1Pack } from '../src/game/act1_mobs';
import { BITE_REACH, SWAN } from '../src/game/act1_rules/swan';
import { HOUND } from '../src/game/act1_rules/hound';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, gaitOf } from '../src/game/bosses';
import { fromFigure } from '../src/game/facing';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import type { Game } from '../src/game/game';
import type { Monster } from '../src/game/state';
import { act1Fx } from '../src/render/act1_fx/index';
import { colourCatcher, cyanish, measuredSize, room, untilAct, watch } from './act1_kinds_room_c';
import { roomFight } from './high16_room';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

paintWithoutCanvas();

/** With the High City on, for a while. */
function high<T>(fn: () => T): T {
  const was = HIGH_CITY.on;
  HIGH_CITY.on = true;
  try {
    return fn();
  } finally {
    HIGH_CITY.on = was;
  }
}
/** The hero put `fwd` tiles before it and `left` to the left its picture is drawn with. */
function place(g: Game, m: Monster, fwd: number, left: number): void {
  const h = g.hero;
  const hand = m.act ? m.act.hand : 1;
  h.x = m.x + m.fx * fwd + m.fy * hand * left;
  h.y = m.y + m.fy * fwd - m.fx * hand * left;
}

test('1. they are built: their rules, their pictures with a clip by each name their act uses, their switch, their size', () => {
  const r = act1Rules('swan');
  const fig = act1Fig('swan');
  assert.ok(r && fig && act1Fx('swan'), 'their rules, their pictures, their warning');
  assert.ok(fig!.switches?.includes(SWAN_ON), "the art chat's switch is theirs");
  makeBestiary();
  assert.equal(SWAN_ON.on, ACT1.on, "on with the descent's figures (art/bestiary.ts useAct1Figs): a switch nothing reads");
  assert.ok(FIRST5_FIGURES.includes('swan') && !HEAVY_FIGURES.includes('swan'), 'a figure the painter paints beside the game, light');
  const art = makeBestiary().of('swan');
  for (const set of [art.front, art.back]) {
    for (const a of r!.acts) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip && clip.frames.length > 0, `its ${a.id}: its clip ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `its ${a.id}'s length`);
    }
    assert.ok(set.clips?.reel && set.clips?.die, 'struck, and its death');
    near((set.clips!.die!.frames.length - 1) / set.clips!.die!.fps, SWAN_DIE.long, 0.04, "its death's length");
  }
  const m = measuredSize('swan');
  assert.ok(Math.abs(m.size.top - m.head) <= 4, `the game takes it to be ${m.size.top} up; in the picture ${m.head}`);
  assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.3, `${m.size.half} to either side; the picture reaches ${m.reach}`);
});

test("2. the rules' numbers are their pictures' own; its strip beyond its bill and bigger than the hound's pounce", () => {
  const G = gaitOf('swan')!;
  assert.equal(G.pace, SWAN_PACE, 'its waddle at the pace it is painted for');
  assert.equal(SWAN.pace, SWAN_PACE);
  assert.equal(SWAN.round, SWAN_WALK.period);
  assert.equal(MONSTERS.swan.speed, SWAN_PACE, 'and the game moves it so');
  assert.equal(makeBestiary().of('swan').front.walkFps, SWAN_WALK.fps, 'its waddle shown at its own rate');
  const acts = actsOf({ kind: 'swan' })!;
  assert.equal(acts.length, 1, 'small: one attack');
  const bite = acts[0];
  assert.equal(bite.hit, SWAN_BITE.hit, 'it bites at its moment');
  assert.equal(bite.long, SWAN_BITE.long);
  assert.equal(SWAN.bite.warn, SWAN_BITE.warn);
  assert.equal(MONSTERS.swan.windup, SWAN_BITE.hit);
  assert.equal(MONSTERS.swan.range, bite.far, 'its range, how far off it bites from');
  // (where its bill shuts: the nail at its tip, the picture's)
  const nail = swanSolids('attack', SWAN_BITE.hit).find((b) => b.piece === 'nail')!.shape as unknown as { c: [number, number, number] };
  near(SWAN.bite.at, nail.c[0] / TILE3, 0.02, 'its bill shuts before it');
  near(0, nail.c[1] / TILE3, 0.02, 'straight before it');
  // (the strip reaches beyond the bill, and it bites from inside it with half a round of its waddle to spare)
  assert.ok(BITE_REACH >= SWAN.bite.at + TUNE.heroRadius, `beyond its bill (${BITE_REACH.toFixed(2)})`);
  assert.ok(bite.far <= BITE_REACH && G.stopAt < bite.far, 'it stops and bites inside its reach');
  // (his rule of 28 Oct: bigger than the Hush's like kind's, the mute hound's pounce)
  const houndFar = HOUND.pounce.at + HOUND.pounce.r;
  assert.ok(BITE_REACH > houndFar * 1.2, `further before it than the hound's (${BITE_REACH.toFixed(2)} against ${houndFar.toFixed(2)})`);
  assert.ok(2 * SWAN.bite.half > 2 * HOUND.pounce.r * 1.25, `wider than the hound's (${(2 * SWAN.bite.half).toFixed(2)} against ${(2 * HOUND.pounce.r).toFixed(2)})`);
});

test('3. the bite: at its moment, on whoever is in its strip, once; not beyond, beside or behind', () => {
  const cases: [number, number, boolean][] = [
    [0.6, 0, true], [1.1, 0.2, true], [1.55, -0.1, true], [1.0, 0.65, true], [1.0, -0.65, true], [-0.1, 0.3, true],
    [1.7, 0, false], [1.0, 0.8, false], [1.0, -0.8, false], [-0.5, 0, false],
  ];
  for (const [fwd, left, hurt] of cases) {
    const { g, m } = room('swan', 1.0, 'swan:bite');
    assert.ok(untilAct(g, m, 'swan:bite'), 'it bites');
    place(g, m, fwd, left);
    const t0 = m.act!.t;
    g.hero.invuln = 0;
    const s = watch(g, m, 1.3, undefined, () => m.state !== 'act');
    if (hurt) {
      assert.equal(s.hurts.length, 1, `at ${fwd}, ${left}: bitten once`);
      near(s.hurts[0].t + t0, SWAN_BITE.hit, 1.5 / 60, 'as its bill shuts');
    } else assert.equal(s.hurts.length, 0, `at ${fwd}, ${left}: out of its strip, not bitten`);
  }
});

test('4. the charge: far off it waddles at its pace; near, it charges, its feet gripping; it stops charging as it bites', () => {
  // (far off: its waddle; the hero beyond its charge's reach)
  {
    const { g, m } = room('swan', SWAN.charge.from + 2.5, 'swan:none');
    const x0 = m.x;
    watch(g, m, 0.6);
    const x1 = m.x;
    watch(g, m, 0.5);
    near((x0 - m.x - (x0 - x1)) / 0.5, SWAN_PACE, 0.15, 'it waddles at its pace');
    assert.ok(!m.a1 || !m.a1.ch, 'not charging');
  }
  // (near: it charges, and its walk goes round with the ground it covers)
  {
    const { g, m } = room('swan', SWAN.charge.from - 0.5, 'swan:none');
    watch(g, m, 0.3);
    assert.ok(m.a1 && m.a1.ch > 0, 'it charges');
    near(m.speed, SWAN.charge.pace, 1e-6, 'at its charge');
    const x0 = m.x;
    const t0 = m.gait!.t;
    watch(g, m, 0.5);
    const went = x0 - m.x;
    near(went / 0.5, SWAN.charge.pace, 0.2, 'it covers the ground at its charge');
    near((m.gait!.t - t0) * SWAN_PACE, went, 0.05, 'its waddle goes round as far as it goes: its feet grip');
  }
  // (it bites, its charge done; then waddles its rest)
  {
    const { g, m } = room('swan', SWAN.charge.from - 0.5, 'swan:bite');
    assert.ok(untilAct(g, m, 'swan:bite', 4), 'it comes on and bites');
    near(m.speed, MONSTERS.swan.speed, 1e-6, 'biting, it is back to its waddle');
    assert.ok(m.a1!.ch === 0 && m.a1!.cd > 0, 'and rests from charging');
  }
});

test('5. in flocks: none anywhere with HIGH_CITY off; on floor 16 with it on, flocks bigger than a small kind\'s packs', () => {
  const rng = new RNG(4);
  for (let d = 1; d <= 16; d++) for (let k = 0; k < 40; k++) assert.ok(act1Pack(d, rng, 'normal').kind !== 'swan', `HIGH_CITY off: none on floor ${d}`);
  high(() => {
    assert.equal(sizeOf('swan'), 'small');
    const [lo, hi] = SWAN.flock;
    assert.ok(lo > PACK_BY_SIZE.small[0] && hi > PACK_BY_SIZE.small[1], 'a flock is bigger than a small kind\'s pack');
    let seen = 0;
    let most = 0;
    for (let k = 0; k < 400; k++) {
      const p = act1Pack(16, rng, 'normal');
      if (p.kind !== 'swan') continue;
      seen++;
      most = Math.max(most, p.size);
      assert.ok(p.size >= lo && p.size <= hi, `a flock of ${p.size}`);
    }
    assert.ok(seen > 60 && most === hi, `their own flocks on floor 16 (${seen} in 400, the most ${most})`);
  });
});

test('6. its death, a burst of feathers, its own: the die event, both views', () => {
  const { g, m } = room('swan', 3);
  m.life = 1;
  m.maxLife = 1;
  (g as unknown as { kill(m: unknown): void }).kill(m);
  const died = g.events.find((e) => e.t === 'die');
  assert.ok(died && figureOf(died as unknown as { kind: 'swan'; champion: boolean; form?: number }) === 'swan', 'a swan falls as a swan');
  const art = makeBestiary().of('swan');
  for (const set of [art.front, art.back]) {
    const die = set.clips!.die!;
    assert.ok(die.frames[0] && die.frames[die.frames.length - 1], 'its death painted from first to last');
  }
});

test('7. the warning: through its wind-up its strip is marked on the floor in pink, where the rules strike and nowhere else', () => {
  const fx = act1Fx('swan')!;
  const { g, m } = room('swan', 1.0, 'swan:bite');
  assert.ok(untilAct(g, m, 'swan:bite'));
  const drawn = (t: number): { colours: Set<string>; pts: [number, number][] } => {
    m.act!.t = t;
    const { g: canvas, colours } = colourCatcher();
    const pts: [number, number][] = [];
    fx.ground!({ g: canvas, at: (x, y) => { pts.push([x, y]); return [(x - y) * 16, (x + y) * 8]; }, game: g, t: 0.3, bestiary: makeBestiary(), stand: () => undefined, spot: () => undefined }, m, null);
    return { colours, pts };
  };
  const w = drawn(0.4);
  assert.ok([...w.colours].some((c) => c === FLAME[2] || c === FLAME[3]), "in the enemy's pink");
  assert.ok(![...w.colours].some(cyanish), 'nothing cyan');
  assert.ok(w.pts.length > 40, `marked (${w.pts.length} points)`);
  for (const [x, y] of w.pts) {
    const r = fromFigure(m.x, m.y, m.fx, m.fy, m.act!.hand, x, y);
    assert.ok(r.fwd >= SWAN.bite.from - 0.01 && r.fwd <= BITE_REACH + 0.01 && Math.abs(r.left) <= SWAN.bite.half + 0.01, `marked at (${r.fwd.toFixed(2)}, ${r.left.toFixed(2)}): inside its strip`);
  }
  // (its far edge marked: the strip's whole reach is shown)
  assert.ok(w.pts.some(([x, y]) => fromFigure(m.x, m.y, m.fx, m.fy, m.act!.hand, x, y).fwd > BITE_REACH - 0.05), 'out to its far edge');
  assert.equal(drawn(SWAN_BITE.hit + 0.05).pts.length, 0, 'none once it has bitten');
});

test('8. a long fight with a flock of them: no exceptions, their bite made, their charge made', () => {
  const { g, them, acts } = roomFight('swan', SWAN.flock[1], 30);
  assert.equal(them.length, SWAN.flock[1], 'a flock laid');
  assert.ok(acts.has('swan:bite'), 'they bit');
  void g;
  // (and a flock of six coming on from nearer than its charge: they charge together)
  const { g: g2, all } = room('swan', SWAN.charge.from - 0.3, 'swan:none', 6);
  let charged = 0;
  watch(g2, all[0], 1.2, undefined, () => {
    charged = Math.max(charged, all.filter((m) => m.a1 && m.a1.ch > 0).length);
    return false;
  });
  assert.ok(charged >= 3, `a flock charges (${charged} of 6 at once)`);
});
