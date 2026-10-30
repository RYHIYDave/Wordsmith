// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16'S HUSHED GARDENERS AND GROOMS IN THE GAME (game/act1_rules/gardener.ts, groom.ts,
// art/act1_figs/gardener.ts, groom.ts, render/act1_fx/gardener.ts, groom.ts), behind HIGH_CITY (off until his yes):
//   1. they are built: each kind its rules, its pictures (the art chat's) with a clip by each name its act uses, from in front
//      and behind, their switch on with the descent's figures, their size as their pictures stand;
//   2. the rules' numbers are their pictures' own: the rush's pace, the blows' moment and length, where the shears shut and
//      where the fork's tines are; each strip beyond the tool and bigger than the Hush's like kinds' (his rule of 28 Oct);
//   3. THE SHEARS SNAP and THE FORK JAB land at their pictures' moment on whoever is in their strips, once, and not beyond
//      them, beside them or behind;
//   4. A CROWD OF THE TWO: a pack of either is laid half gardeners and half grooms, in turn, each named and shown as itself, and
//      dying as itself; one spawned alone stays as it was asked for;
//   5. AT THEIR WORK TILL THEY SEE YOU: one not yet woken shows its stand, the art's work (the gardener clipping, the groom
//      leaning on his fork), and the two stand differently;
//   6. with HIGH_CITY off they are nowhere; with it on, on floor 16, packs of a small kind's size;
//   7. THE WARNINGS: through each wind-up its strip is marked on the floor, in the enemy's pink, where the rules strike and
//      nowhere else; nothing cyan; none once the blow has fallen;
//   8. a long fight with a crowd of them (in the practice room, until floor 16's own map-maker is in): no exceptions, both
//      blows made.
//   run: tsx --test tests/act2_palace_hands.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIRST5_FIGURES, HEAVY_FIGURES, figureOf, makeBestiary } from '../src/art/bestiary';
import { act1Fig } from '../src/art/act1_figs/index';
import { FLAME } from '../src/art/mkit';
import { PALACE_HANDS_ON, forkOf, shearsOf } from '../src/art/palace_hands';
import { PALACE_GARDENER, PALACE_GROOM, PH_BLOW, PH_DIES, PH_PACE, PH_RUN } from '../src/art/palace_hands_moves';
import { TILE3, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { ACT1, HIGH_CITY } from '../src/game/act1';
import { act1Pack } from '../src/game/act1_mobs';
import { FIELDHAND } from '../src/game/act1_rules/fieldhand';
import { HUSHED } from '../src/game/act1_rules/hushed';
import { JAB_STRIP, PALACE, SNAP_STRIP } from '../src/game/act1_rules/gardener';
import type { Strip } from '../src/game/act1_rules/gardener';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, gaitOf } from '../src/game/bosses';
import { fromFigure } from '../src/game/facing';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import type { Game } from '../src/game/game';
import type { Monster } from '../src/game/state';
import type { MonsterKind } from '../src/game/types';
import { act1Fx } from '../src/render/act1_fx/index';
import { gaitFrame } from '../src/render/figure';
import { colourCatcher, cyanish, measuredSize, room, untilAct, watch } from './act1_kinds_room_c';
import { roomFight } from './high16_room';
import { paintWithoutCanvas, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

paintWithoutCanvas();

const KINDS = ['gardener', 'groom'] as const;
const BLOW: Record<(typeof KINDS)[number], { id: string; strip: Strip }> = { gardener: { id: 'gardener:snap', strip: SNAP_STRIP }, groom: { id: 'groom:jab', strip: JAB_STRIP } };

function high<T>(fn: () => T): T {
  const was = HIGH_CITY.on;
  HIGH_CITY.on = true;
  try {
    return fn();
  } finally {
    HIGH_CITY.on = was;
  }
}
function place(g: Game, m: Monster, fwd: number, left: number): void {
  const h = g.hero;
  const hand = m.act ? m.act.hand : 1;
  h.x = m.x + m.fx * fwd + m.fy * hand * left;
  h.y = m.y + m.fy * fwd - m.fx * hand * left;
}
/** Where the shears' blades' middle is, `t` seconds into the snap (tiles before him, to his left, up). */
function shears(t: number): [number, number, number] {
  const k = shearsOf(skeletonAt(PALACE_GARDENER, 'attack', t)).mid;
  return [k[0] / TILE3, k[1] / TILE3, k[2] / TILE3];
}
/** Where the fork's tip is, `t` seconds into the jab. */
function tines(t: number): [number, number, number] {
  const k = forkOf(skeletonAt(PALACE_GROOM, 'attack', t), posedOfMob(PALACE_GROOM, 'attack', t) as unknown as { draw: number }).tip;
  return [k[0] / TILE3, k[1] / TILE3, k[2] / TILE3];
}

test('1. they are built: each its rules, its pictures with a clip by each name its act uses, their switch, their size', () => {
  makeBestiary();
  assert.equal(PALACE_HANDS_ON.on, ACT1.on, "on with the descent's figures (art/bestiary.ts useAct1Figs): a switch nothing reads");
  for (const k of KINDS) {
    const r = act1Rules(k);
    const fig = act1Fig(k);
    assert.ok(r && fig && act1Fx(k), `${k}: its rules, its pictures, its warning`);
    assert.ok(fig!.switches?.includes(PALACE_HANDS_ON), `${k}: the art chat's switch is theirs`);
    assert.ok(FIRST5_FIGURES.includes(k) && !HEAVY_FIGURES.includes(k), `${k}: a figure the painter paints beside the game, light`);
    const art = makeBestiary().of(k);
    for (const set of [art.front, art.back]) {
      for (const a of r!.acts) {
        const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
        assert.ok(clip && clip.frames.length > 0, `${k}, ${a.id}: its clip ${a.clip}`);
        near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `${k}, ${a.id}'s length`);
        near(clip!.hit ?? -1, a.hit, 1e-9, `${k}: its clip's blow is the act's`);
      }
      assert.ok(set.clips?.reel && set.clips?.die, `${k}: struck, and the Hush leaving them`);
      near((set.clips!.die!.frames.length - 1) / set.clips!.die!.fps, PH_DIES.long, 0.06, `${k}: their death's length`);
    }
    const m = measuredSize(k);
    assert.ok(Math.abs(m.size.top - m.head) <= 4, `${k}: the game takes it to be ${m.size.top} up; in the picture it is ${m.head}`);
    assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.4, `${k}: ${m.size.half} to either side; the picture reaches ${m.reach}`);
  }
});

test("2. the rules' numbers are their pictures' own; each strip beyond its tool, and bigger than the Hush's like kinds'", () => {
  assert.equal(PALACE.pace, PH_PACE);
  near(PALACE.round, PH_RUN.frames / PH_RUN.fps, 1e-9, 'their rush\'s round');
  assert.equal(PALACE.blow.long, PH_BLOW.long);
  assert.equal(PALACE.blow.hit, PH_BLOW.hit);
  assert.equal(PALACE.blow.warn[0], PH_BLOW.warn[0]);
  assert.equal(PALACE.blow.warn[1], PH_BLOW.warn[1]);
  for (const k of KINDS) {
    const G = gaitOf(k)!;
    assert.equal(G.pace, PH_PACE, `${k}: the rush at the pace it is painted for`);
    assert.equal(MONSTERS[k].speed, PH_PACE, `${k}: and the game moves them so`);
    near(G.cycle, PALACE.round / 2, 1e-9, `${k}: they stop where a foot comes down`);
    assert.equal(makeBestiary().of(k).front.walkFps, PH_RUN.fps, `${k}: their rush shown at its own rate`);
    const acts = actsOf({ kind: k as MonsterKind })!;
    assert.equal(acts.length, 1, `${k}: small, one attack`);
    assert.equal(acts[0].hit, PH_BLOW.hit);
    assert.equal(MONSTERS[k].windup, PH_BLOW.hit);
    assert.equal(MONSTERS[k].range, acts[0].far, `${k}: its range, how far off it strikes from`);
    assert.ok(G.stopAt < acts[0].far && acts[0].far <= BLOW[k].strip.to - 0.2, `${k}: it stops, and strikes, inside its strip`);
  }
  // (the shears: where they shut, and how far they are carried on through)
  const [sf, sl] = shears(PH_BLOW.hit);
  near(PALACE.snap.at[0], sf, 0.02, 'the shears shut before him');
  near(PALACE.snap.at[1], sl, 0.02, 'and a little to his left');
  let sOut = 0;
  for (let t = PH_BLOW.hit; t <= 0.95; t += 1 / 30) sOut = Math.max(sOut, shears(t)[0]);
  near(PALACE.snap.out, sOut, 0.02, 'carried on through');
  // (the fork: where its tines are as it is jabbed, and how far it is carried on)
  const [ff, fl] = tines(PH_BLOW.hit);
  near(PALACE.jab.at[0], ff, 0.02, 'the tines jabbed out before him');
  near(PALACE.jab.at[1], fl, 0.02, 'and a little to his right');
  let fOut = 0;
  for (let t = PH_BLOW.hit; t <= 0.92; t += 1 / 30) fOut = Math.max(fOut, tines(t)[0]);
  near(PALACE.jab.out, fOut, 0.02, 'carried on through');
  // (beyond the tool: the strip reaches past it; and the tool is inside the strip from just before its blow to after)
  assert.ok(SNAP_STRIP.to >= sOut + 0.4 && JAB_STRIP.to >= fOut + 0.4, 'a little beyond their reach');
  for (const t of [PH_BLOW.hit - 1 / 30, PH_BLOW.hit, PH_BLOW.hit + 2 / 30]) {
    const [a, b] = shears(t);
    assert.ok(a <= SNAP_STRIP.to && b >= SNAP_STRIP.left0 && b <= SNAP_STRIP.left1, `the shears inside their strip at ${t.toFixed(2)}`);
    const [c, d] = tines(t);
    assert.ok(c <= JAB_STRIP.to && d >= JAB_STRIP.left0 && d <= JAB_STRIP.left1, `the tines inside their strip at ${t.toFixed(2)}`);
  }
  // (his rule of 28 Oct: bigger than the Hush's like kinds', floor 13's sickle and the townsfolk's grab)
  const sickle = { to: FIELDHAND.slash.fwd[1], across: FIELDHAND.slash.left[1] - FIELDHAND.slash.left[0] };
  const grab = { to: HUSHED.grab.reach + TUNE.heroRadius * 0.5, across: 2 * HUSHED.grab.half };
  assert.ok(SNAP_STRIP.to > sickle.to * 1.2 && SNAP_STRIP.left1 - SNAP_STRIP.left0 > sickle.across * 1.3, 'the shears\' strip bigger than the sickle\'s');
  assert.ok(JAB_STRIP.to > sickle.to * 1.5 && JAB_STRIP.to > grab.to * 1.9, 'the fork\'s strip far longer than the sickle\'s or the grab\'s');
});

test('3. the shears snap and the fork jab: at their moment, on whoever is in their strips, once; not beyond, beside or behind', () => {
  const cases: Record<(typeof KINDS)[number], [number, number, boolean][]> = {
    gardener: [[0.6, 0.1, true], [1.3, 0.5, true], [1.65, 0.1, true], [1.0, -0.6, true], [1.0, 0.9, true], [1.85, 0.1, false], [1.0, -0.75, false], [1.0, 1.05, false], [-0.5, 0, false]],
    groom: [[0.7, 0, true], [1.6, -0.1, true], [2.1, 0.3, true], [1.2, -0.65, true], [2.3, 0, false], [1.2, 0.6, false], [1.2, -0.8, false], [-0.5, 0, false]],
  };
  for (const k of KINDS) {
    const B = BLOW[k];
    for (const [fwd, left, hurt] of cases[k]) {
      const { g, m } = room(k, 1.2, B.id as never);
      assert.ok(untilAct(g, m, B.id as never), `${k}: it strikes`);
      place(g, m, fwd, left);
      const t0 = m.act!.t;
      g.hero.invuln = 0;
      const s = watch(g, m, 1.5, undefined, () => m.state !== 'act');
      if (hurt) {
        assert.equal(s.hurts.length, 1, `${k} at ${fwd}, ${left}: struck once`);
        near(s.hurts[0].t + t0, PH_BLOW.hit, 1.5 / 60, `${k}: at its blow`);
      } else assert.equal(s.hurts.length, 0, `${k} at ${fwd}, ${left}: out of its strip, not struck`);
    }
  }
});

test('4. a crowd of the two: half and half in turn, each named and shown as itself, dying as itself; one alone stays as asked', () => {
  for (const asked of KINDS) {
    const { g } = room(asked, 4);
    const crowd = Array.from({ length: 10 }, (_, i) => g.spawn(asked, g.hero.x + 3, g.hero.y + (i % 5) * 0.6, 44, 0, false, new RNG(200 + i)));
    const n = { gardener: 0, groom: 0 } as Record<string, number>;
    for (const m of crowd) {
      n[m.kind]++;
      assert.equal(m.name, MONSTERS[m.kind].name, 'named as itself');
      assert.equal(figureOf(m), m.kind, 'shown as itself');
      assert.equal(m.kind, m.id % 2 === 0 ? 'gardener' : 'groom', 'in turn by its number');
    }
    assert.ok(n.gardener === 5 && n.groom === 5, `a pack asked as ${asked}s: ${n.gardener} gardeners, ${n.groom} grooms`);
    // (a yellow pack's leader keeps his words before his name)
    const lead = g.spawn(asked, g.hero.x + 3, g.hero.y, 45, 1, false, new RNG(7), null, { rarity: 'leader', words: ['power'] });
    assert.ok(lead.name.endsWith(MONSTERS[lead.kind].name) && lead.name.startsWith('Power'), `a leader called ${lead.name}`);
    // (one alone, of no pack, as it was asked for)
    const alone = g.spawn(asked, g.hero.x + 3, g.hero.y, -3, 0, false, new RNG(9));
    assert.equal(alone.kind, asked, 'one alone stays as asked');
  }
  // (each dies as itself: its death is its own kind's)
  for (const k of KINDS) {
    const { g, m } = room(k, 4);
    m.life = 1;
    m.maxLife = 1;
    (g as unknown as { kill(m: unknown): void }).kill(m);
    const died = g.events.find((e) => e.t === 'die');
    assert.ok(died && figureOf(died as unknown as { kind: MonsterKind; champion: boolean; form?: number }) === k, `a ${k} falls as a ${k}`);
  }
});

test('5. at their work till they see you: one not yet woken shows the art\'s stand; the two at different work', () => {
  const art = makeBestiary();
  for (const k of KINDS) {
    const { g } = room(k, 4);
    const m = g.spawn(k, g.hero.x + 6, g.hero.y, -5, 0, false, new RNG(3));
    assert.equal(m.state, 'sleep', 'not yet woken');
    const set = art.of(k).front;
    const f = gaitFrame(set, m);
    assert.ok(set.idle.includes(f), `${k}: shown at its work, its stand`);
  }
  const a = art.of('gardener').front.idle[0];
  const b = art.of('groom').front.idle[0];
  assert.ok(unlike(a, b) > 200, `the gardener clipping and the groom leaning on his fork stand differently (${unlike(a, b)} pixels)`);
});

test('6. with HIGH_CITY off they are nowhere; with it on, on floor 16, packs of a small kind\'s size', () => {
  const rng = new RNG(5);
  for (let d = 1; d <= 16; d++) for (let k = 0; k < 40; k++) {
    const kind = act1Pack(d, rng, 'normal').kind;
    assert.ok(kind !== 'gardener' && kind !== 'groom', `HIGH_CITY off: none on floor ${d}`);
  }
  high(() => {
    const [lo, hi] = PACK_BY_SIZE.small;
    const seen = { gardener: 0, groom: 0 } as Record<string, number>;
    for (let k = 0; k < 400; k++) {
      const p = act1Pack(16, rng, 'normal');
      if (p.kind !== 'gardener' && p.kind !== 'groom') continue;
      assert.equal(sizeOf(p.kind), 'small');
      seen[p.kind]++;
      assert.ok(p.size >= lo && p.size <= hi, `a crowd of ${p.size}`);
    }
    assert.ok(seen.gardener > 40 && seen.groom > 40, `their own crowds on floor 16 (${seen.gardener}, ${seen.groom} in 400)`);
  });
});

test('7. the warnings: through each wind-up its strip is marked in pink, where the rules strike and nowhere else', () => {
  for (const k of KINDS) {
    const B = BLOW[k];
    const fx = act1Fx(k)!;
    const { g, m } = room(k, 1.2, B.id as never);
    assert.ok(untilAct(g, m, B.id as never));
    const drawn = (t: number): { colours: Set<string>; pts: [number, number][] } => {
      m.act!.t = t;
      const { g: canvas, colours } = colourCatcher();
      const pts: [number, number][] = [];
      fx.ground!({ g: canvas, at: (x, y) => { pts.push([x, y]); return [(x - y) * 16, (x + y) * 8]; }, game: g, t: 0.2, bestiary: makeBestiary(), stand: () => undefined, spot: () => undefined }, m, null);
      return { colours, pts };
    };
    const w = drawn((PH_BLOW.warn[0] + PH_BLOW.warn[1]) / 2);
    assert.ok([...w.colours].some((c) => c === FLAME[2] || c === FLAME[3]), `${k}: in the enemy's pink`);
    assert.ok(![...w.colours].some(cyanish), `${k}: nothing cyan`);
    assert.ok(w.pts.length > 40, `${k}: marked (${w.pts.length} points)`);
    let far = -9;
    for (const [x, y] of w.pts) {
      const r = fromFigure(m.x, m.y, m.fx, m.fy, m.act!.hand, x, y);
      far = Math.max(far, r.fwd);
      assert.ok(r.fwd >= B.strip.from - 0.01 && r.fwd <= B.strip.to + 0.01 && r.left >= B.strip.left0 - 0.01 && r.left <= B.strip.left1 + 0.01, `${k}: marked at (${r.fwd.toFixed(2)}, ${r.left.toFixed(2)}), inside its strip`);
    }
    assert.ok(far > B.strip.to - 0.05, `${k}: out to its far edge`);
    assert.equal(drawn(PH_BLOW.hit + 0.05).pts.length, 0, `${k}: none once the blow has fallen`);
  }
});

test('8. a long fight with a crowd of them: no exceptions, both blows made', () => {
  const { them, acts } = roomFight('gardener', 7, 30);
  assert.ok(them.some((m) => m.kind === 'gardener') && them.some((m) => m.kind === 'groom'), 'a mixed crowd');
  assert.ok(acts.has('gardener:snap') && acts.has('groom:jab'), `both blows made (${[...acts].join(', ')})`);
});
