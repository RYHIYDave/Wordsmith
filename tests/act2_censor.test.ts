// ACT 2, THE HUSH: FLOOR 15'S BOSS, THE CENSOR, IN THE GAME, BEHIND ACT2 (game/act1_rules/censor.ts; his pictures
// art/act1_figs/censor.ts, the art chat's art/censor.ts and censor_moves.ts; what he lays on the floor, render/act1_fx/
// censor.ts, the art's censor_shots.ts):
//   1. he is built: his rules, his pictures with every clip his acts name, heavy, painted by the painter; floor 15's boss
//      with ACT2 on (the lair's: his life a fifth floor's boss's, doubled), the Warden with it off; his line a silence; his
//      size as his pictures stand; the art's switch left off;
//   2. the rules' numbers are his pictures' own: his walk, every move's length and moment, where his brush's point is at
//      the slash and the thrust; what he lays on the floor, its times, the art's; the tile he lays for good the art's;
//   3. THE BRUSH SLASH lands at its moment, on whoever is in the arc it comes down through, as far as its point; not behind
//      him, not beyond it, not far round to his left;
//   4. STRIKE-THROUGH: the brush, then the line run out from its point at the art's pace: whoever its head runs through is
//      struck as it reaches him; stepped off it, or rolled through it, he is not; it stops at a wall;
//   5. REDACTION: its bars about the hero, in its pattern, marked out first; under one as it slams, struck; in a gap, not;
//      across the floor's x one time, its y the next; the wet ink slows him;
//   6. THE HUSH: the silence reaches him wherever he stands in the room, as its ring passes him, and his words go dark; not
//      made again while they are dark still;
//   7. AT HALF HIS LIFE HE BLACKS OUT PARTS OF THE FLOOR FOR GOOD (on the stand-in floor 15): about a quarter of his ground
//      and never more than a third, along its walls; walked on no more, laid as the art's floor tile; the way on and the
//      ways in kept clear; the room kept joined; whoever stood on it put off it, and struck; once only;
//   8. killed in the middle of anything, nothing of his still to come harms the hero; the floor blacked out stays; the book
//      of stolen words bursts;
//   9. what he draws is the Order's black, the enemy's pink and the Hush's grey, never cyan; in the practice room his own
//      pictures lay the floor blacked out;
//  10. a long fight on floor 15: no exceptions, every act made, the blacking out too.
//   run: tsx --test tests/act2_censor.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { CENSOR_COST, FIG } from '../src/art/act1_figs/censor';
import { FIGURE_SIZE, HEAVY_FIGURES, makeBestiary } from '../src/art/bestiary';
import { CENSOR_ON, brushOf } from '../src/art/censor';
import { CENSOR as CENSOR_MOB, CE_DIES, CE_HUSH, CE_PACE, CE_REDACT, CE_SLASH, CE_STRIKE, CE_WALK } from '../src/art/censor_moves';
import { REDACT_FOR, REDACT_LAY, REDACT_WARN, ROOM_HUSH_FOR, ROOM_HUSH_RING, SLASH_MARK_FOR, STRIKE_FOR, STRIKE_SPEED } from '../src/art/censor_shots';
import { greatLibraryPieces } from '../src/art/floor15';
import { LB_ZONE } from '../src/art/library';
import { TILE3, skeletonAt } from '../src/art/new_mobs3';
import { ACT2 } from '../src/game/act1';
import { BLACKED_TILE, CENSOR, CENSOR_ACTS, CENSOR_GAIT, READING_ZONE, RULES, STOLEN_BOOK, barsOf, blackedOut, blackoutPlan, censorGround, tilesOf, underBar } from '../src/game/act1_rules/censor';
import { bossKind, gaitOf } from '../src/game/bosses';
import { BOSS_LINES, HUSH_FOR, MONSTERS, TUNE, sizeOf } from '../src/game/defs';
import { beside } from '../src/game/facing';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Level, Monster } from '../src/game/state';
import { FX } from '../src/render/act1_fx/censor';
import { colourCatcher, cyanish, floor, measuredSize, room, untilAct, watch } from './act1_kinds_room_c';
import { fakeCtx } from './act1_kinds_room';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
// (VERSION 23.0: THE HUSH IS ON IN THE GAME. This file was written while it was off, and turns it on itself wherever it
// needs it: so it is turned off here for the file, as it was then, once the game's own is seen to be on)
nodeAssert.equal(ACT2.on, true, 'the Hush is on in the game (Version 23.0)');
ACT2.on = false;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);
function hush<T>(fn: () => T): T {
  const was = ACT2.on;
  ACT2.on = true;
  try {
    return fn();
  } finally {
    ACT2.on = was;
  }
}
const act = (id: string) => CENSOR_ACTS.find((a) => a.id === id)!;
/** Put the hero `fwd` tiles before him and `left` to the left his picture is drawn with. */
function put(g: Game, m: Monster, fwd: number, left: number): void {
  const p = beside(m.x, m.y, m.fx, m.fy, m.act ? m.act.hand : 1, fwd, left);
  g.hero.x = p.x;
  g.hero.y = p.y;
}
/** A hero on a floor of the Hush who does not fall (as the practice room's): a blow that would end him is counted (`fell`), not the end of him. */
const FELL = new WeakMap<Game, number>();
function undying(g: Game): Game {
  (g as unknown as { die(): void }).die = () => {
    g.hero.life = g.hero.d.maxLife;
    FELL.set(g, (FELL.get(g) ?? 0) + 1);
  };
  return g;
}
const fell = (g: Game): number => FELL.get(g) ?? 0;
/** Every tile walked to from the floor's start, as its walk has it. */
function reach(L: Level): Uint8Array {
  const f = L.floor;
  const W = f.w;
  const out = new Uint8Array(W * f.h);
  const s = Math.floor(f.start.y) * W + Math.floor(f.start.x);
  const q = [s];
  out[s] = 1;
  while (q.length) {
    const i = q.pop()!;
    const x = i % W;
    const y = (i - x) / W;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const j = (y + dy) * W + x + dx;
      if (x + dx < 0 || y + dy < 0 || x + dx >= W || y + dy >= f.h || out[j] || L.walk[j] !== 1) continue;
      out[j] = 1;
      q.push(j);
    }
  }
  return out;
}

paintWithoutCanvas();

test("1. he is built, heavy; floor 15's boss with ACT2 on, the Warden with it off; his line a silence; his size", () => {
  assert.ok(RULES && FIG && FX, 'his rules, his pictures and what he draws');
  assert.equal(CENSOR_ON.on, false, "the art chat's switch left off: nothing of the game draws him while ACT2 is off");
  assert.equal(sizeOf('censor'), 'boss');
  const chosen = RULES!.acts.filter((a) => !a.forced);
  assert.equal(chosen.length, 4, 'a boss: four (his doc\'s four)');
  assert.equal(chosen[0].clip, 'attack', 'his basic blow first');
  assert.equal(chosen[0].cooldown, 0);
  for (let i = 2; i < 4; i++) assert.ok(chosen[i].cooldown > chosen[i - 1].cooldown, 'the bigger, the longer the cooldown');
  assert.ok(act('censor:blackout').forced, 'the blacking out brought by the rules');
  assert.equal(FIG!.heavy, true, 'heavy: a boss, made for his floor');
  assert.ok(HEAVY_FIGURES.includes('censor'), 'painted by the painter, beside the game');
  assert.ok(CENSOR_COST.mb < 100, `his frames ${CENSOR_COST.mb} MB, well under the descent's big three's 300`);
  const art = makeBestiary().of('censor');
  for (const set of [art.front, art.back]) {
    for (const a of RULES!.acts) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip && clip.frames.length > 0, `his ${a.id}: its clip ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `his ${a.id}'s length`);
    }
    assert.ok(set.clips?.reel && set.clips?.die, 'struck, and his death');
    near((set.clips!.die!.frames.length - 1) / set.clips!.die!.fps, CE_DIES.long, 1 / set.clips!.die!.fps, 'his death as long as the art\'s');
  }
  const m = measuredSize('censor');
  assert.ok(Math.abs(m.size.top - m.head) <= 4, `the game takes him to be ${m.size.top} up; in the picture he is ${m.head}`);
  assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.4, `${m.size.half} to either side; the picture reaches ${m.reach}`);
  assert.equal(FIGURE_SIZE.censor.top, FIG!.size.top);
  // (his line: his mouth a bar of ink, he says nothing)
  assert.equal(BOSS_LINES.censor!.join(''), '...', 'a silence');
  // (floor 15's boss with the Hush on, the lair's; the Warden with it off)
  assert.equal(ACT2.on, false);
  assert.equal(bossKind(15), 'warden', 'off: nothing of him');
  hush(() => {
    assert.equal(bossKind(15), 'censor');
    const g = floor(15, 4);
    assert.equal(g.boss?.kind, 'censor', "floor 15's boss");
    // (a fifth floor's boss's life, doubled, as the Eye's: Game.spawn, `greater`; and his own share past the Warden)
    const want = MONSTERS.censor.life * (1 + 0.4 * 14) * 2 * 1.5;
    assert.ok(g.boss!.maxLife >= Math.round(want) - 1, `his life ${g.boss!.maxLife}, at least ${Math.round(want)}`);
  });
});

test("2. the rules' numbers are his pictures' own", () => {
  const G = gaitOf('censor')!;
  assert.equal(G, CENSOR_GAIT);
  assert.equal(G.pace, CE_PACE, 'his walk at the pace it is painted for');
  assert.equal(MONSTERS.censor.speed, CE_PACE);
  near(G.cycle, 1 / CE_WALK.fps, 1e-9, 'stopped a frame at a time');
  assert.equal(G.trueBack, CENSOR_MOB.trueBack === true);
  assert.equal(MONSTERS.censor.windup, CE_SLASH.hit);
  for (const [id, art] of [['censor:slash', CE_SLASH], ['censor:strike', CE_STRIKE], ['censor:redact', CE_REDACT], ['censor:hush', CE_HUSH], ['censor:blackout', CE_REDACT]] as const) {
    assert.equal(act(id).long, art.long, `${id}: as long as its picture`);
    assert.equal(act(id).hit, art.hit, `${id}: its moment its picture's`);
  }
  assert.equal(CENSOR.slash.through, CE_SLASH.through);
  assert.equal(CENSOR.strike.warn[0], CE_STRIKE.warn[0]);
  // (where his brush's point is: at the slash's blow, as it comes down, and at the thrust)
  const tip = (move: string, t: number) => brushOf(skeletonAt(CENSOR_MOB, move, t)).tip;
  const s0 = tip('attack', CE_SLASH.hit);
  near(Math.hypot(s0[0], s0[1]) / TILE3, CENSOR.slash.reach, 0.05, 'the slash\'s point at its blow');
  for (const t of [0.77, 0.83, 0.87]) {
    const p = tip('attack', t);
    const b = (Math.atan2(p[1], p[0]) * 180) / Math.PI;
    assert.ok(b >= CENSOR.slash.from - 1 && b <= CENSOR.slash.to + 1, `at ${t} it comes down ${b.toFixed(0)} degrees to his left, within the rules' arc`);
  }
  const k = tip('strike', CE_STRIKE.hit);
  near(k[0] / TILE3, CENSOR.strike.point[0], 0.02, 'the thrust\'s point before him');
  near(k[1] / TILE3, CENSOR.strike.point[1], 0.02, 'and to his right');
  assert.ok(k[2] < 30, 'low over the floor (about 24 of the art\'s pixels up)');
  const r = tip('redact', CE_REDACT.floor);
  assert.ok(r[0] / TILE3 > 2 && r[2] / 2 < 4, "Redaction's bristles down on the floor before him as the bars slam");
  // (what he lays on the floor: the art's times and pace)
  assert.equal(CENSOR.slash.mark, SLASH_MARK_FOR);
  assert.equal(CENSOR.strike.speed, STRIKE_SPEED);
  assert.equal(CENSOR.strike.lie, STRIKE_FOR);
  assert.equal(CENSOR.redact.warn, REDACT_WARN);
  assert.equal(CENSOR.redact.lay, REDACT_LAY);
  assert.equal(CENSOR.redact.lie, REDACT_FOR);
  assert.equal(CENSOR.hush.ring, ROOM_HUSH_RING);
  assert.equal(CENSOR.hush.veil, ROOM_HUSH_FOR);
  assert.ok(CE_HUSH.warn[1] < CE_HUSH.hit, 'the silence let go after its warning');
  // (the tile he lays for good, the book, the Reading Room: the art's)
  const pieces = greatLibraryPieces();
  assert.equal(pieces.find((p) => p.name === BLACKED_TILE)?.kind, 'floor tile', 'the floor blacked out: a floor tile');
  assert.ok(pieces.some((p) => p.name === STOLEN_BOOK), 'the book of stolen words');
  assert.equal(READING_ZONE, LB_ZONE.Reading);
});

test('3. the brush slash lands at its moment, on whoever is in the arc it comes down through, as far as its point', () => {
  // (tiles before him, to his left; whether struck)
  for (const [fwd, left, hurt] of [[2.0, 0, true], [1.2, -0.6, true], [2.3, -1.2, true], [1.6, 0.8, true], [3.1, 0, false], [-0.8, 0, false], [0.5, 1.6, false], [0.6, -2.0, false]] as const) {
    const { g, m } = room('censor', 2.0, 'censor:slash');
    assert.ok(untilAct(g, m, 'censor:slash'), 'he slashes');
    put(g, m, fwd, left);
    const t0 = m.act!.t;
    const s = watch(g, m, 1.2, undefined, () => !!m.act && m.act.t >= CE_SLASH.hit + 0.05);
    if (hurt) {
      assert.equal(s.hurts.length, 1, `at ${fwd}, ${left}: struck once`);
      near(s.hurts[0].t + t0, CE_SLASH.hit, 1.5 / 60, 'at its blow');
    } else assert.equal(s.hurts.length, 0, `at ${fwd}, ${left}: out of its arc`);
  }
  // (the ink it lays: from its blow, for its while)
  const { g, m } = room('censor', 2.0, 'censor:slash');
  untilAct(g, m, 'censor:slash');
  watch(g, m, 1.2, undefined, () => g.perils.some((p) => p.a1 === 'censor:slash'));
  const mark = g.perils.find((p) => p.a1 === 'censor:slash');
  assert.ok(mark && mark.dur === SLASH_MARK_FOR, 'its arc of ink laid on the floor');
});

test('4. Strike-Through: the brush, then the line from its point at the art\'s pace; stepped off or rolled through, not struck', () => {
  const S = CENSOR.strike;
  // (straight before him, on the line, 7 tiles off: struck as the head reaches him)
  {
    const { g, m } = room('censor', 7, 'censor:strike');
    assert.ok(untilAct(g, m, 'censor:strike'), 'he strikes through');
    put(g, m, 7, S.point[1]);
    const t0 = m.act!.t;
    const s = watch(g, m, 2, undefined, () => !!m.act && m.act.t >= S.hit + 0.6);
    assert.equal(s.hurts.length, 1, 'struck once, by the line');
    near(s.hurts[0].t + t0, S.hit + (7 - S.point[0]) / S.speed, 2 / 60, 'as its head reaches him');
    const line = g.perils.find((p) => p.a1 === 'censor:line')!;
    assert.ok(line.a >= 7 && line.a <= S.most + 0.01, `it runs on past him (${line.a.toFixed(1)} tiles), as far as the floor lets it`);
  }
  // (under the brush itself, close: struck at the thrust)
  {
    const { g, m } = room('censor', 2, 'censor:strike');
    untilAct(g, m, 'censor:strike');
    put(g, m, 1.8, S.point[1]);
    const t0 = m.act!.t;
    const s = watch(g, m, 1.5, undefined, () => !!m.act && m.act.t >= S.hit + 0.3);
    assert.equal(s.hurts.length, 1, 'struck by the brush');
    near(s.hurts[0].t + t0, S.hit, 1.5 / 60, 'at the thrust');
  }
  // (stepped off the line through the warning: he does not turn after him)
  {
    const { g, m } = room('censor', 6, 'censor:strike');
    untilAct(g, m, 'censor:strike');
    put(g, m, 6, S.point[1] + 1.2);
    const s = watch(g, m, 2, undefined, () => !!m.act && m.act.t >= S.hit + 0.6);
    assert.equal(s.hurts.length, 0, 'stepped off the line: not struck');
  }
  // (rolled through it as its head passes)
  {
    const { g, m } = room('censor', 6, 'censor:strike');
    untilAct(g, m, 'censor:strike');
    put(g, m, 6, S.point[1]);
    const h = g.hero;
    const s = watch(g, m, 2, () => {
      if (m.act && m.act.t > S.hit + 0.1 && m.act.t < S.hit + 0.4) h.invuln = 0.1;
    }, () => !!m.act && m.act.t >= S.hit + 0.6);
    assert.equal(s.hurts.length, 0, 'rolled through: not struck');
  }
  // (it stops at a wall: never through one)
  const { g, m } = room('censor', 6, 'censor:strike');
  untilAct(g, m, 'censor:strike');
  watch(g, m, 2, undefined, () => g.perils.some((p) => p.a1 === 'censor:line'));
  const line = g.perils.find((p) => p.a1 === 'censor:line')!;
  for (let s = line.b; s <= line.a; s += 0.25) assert.ok(g.isOpen(line.x + line.fx * s, line.y + line.fy * s), `open floor ${s.toFixed(2)} along it`);
  assert.ok(line.a >= S.most - 0.01 || !g.isOpen(line.x + line.fx * (line.a + 0.2), line.y + line.fy * (line.a + 0.2)), 'and up to the wall');
});

test('5. Redaction: its bars about the hero, marked out first; under one as it slams, struck; in a gap, not; the wet ink slows', () => {
  const Rd = CENSOR.redact;
  let along = -1;
  for (const [step, hurt] of [[0, true], [1, false], [2, true]] as const) {
    const { g, m } = room('censor', 4, 'censor:redact');
    if (along >= 0) m.a1 = { ...(m.a1 ?? {}), rp: along };
    assert.ok(untilAct(g, m, 'censor:redact'), 'he redacts');
    const h = g.hero;
    h.x = Math.floor(h.x) + 0.5;
    h.y = Math.floor(h.y) + 0.5;
    watch(g, m, 1, undefined, () => g.perils.some((p) => p.a1 === 'censor:bars'));
    const p = g.perils.find((q) => q.a1 === 'censor:bars')!;
    near(m.act!.t, Rd.hit - REDACT_WARN, 1.5 / 60, 'marked out on the floor REDACT_WARN before the slam');
    assert.ok(p.t < 0, 'not yet slammed');
    const bars = barsOf(p);
    assert.equal(bars.length, Rd.n, `${Rd.n} bars side by side`);
    assert.ok(bars.every((b) => b.along === p.a && b.wide === Rd.wide && b.long <= Rd.bar + 0.21), 'each its length and width, the one way');
    assert.ok(bars.some((b) => underBar(b, h.x, h.y)), 'the middle one over him');
    // (he steps across the bars `step` tiles, into the gap or onto the next)
    const across = p.a === 0 ? [0, 1] : [1, 0];
    h.x += across[0] * step;
    h.y += across[1] * step;
    const t0 = m.act!.t;
    const s = watch(g, m, 1, undefined, () => !!m.act && m.act.t >= Rd.hit + 0.05);
    if (hurt) {
      assert.equal(s.hurts.length, 1, `${step} across: under a bar, struck once`);
      near(s.hurts[0].t + t0, Rd.hit, 1.5 / 60, 'as it slams');
    } else assert.equal(s.hurts.length, 0, 'in the gap: not struck');
    // (lying wet: he is slowed in it, and not after it has dried)
    if (hurt) {
      watch(g, m, 0.2);
      assert.ok(h.chillT > 0 && h.chill >= Rd.slow - 1e-9, 'slowed in the wet ink');
      h.chillT = 0;
      watch(g, m, Rd.lie);
      assert.ok(h.chillT <= 0, 'not once it has dried');
    }
    along = p.a;
  }
  // (one time across the floor's x, the next its y)
  const { g, m } = room('censor', 4, 'censor:redact');
  const seen: number[] = [];
  for (let k = 0; k < 2; k++) {
    untilAct(g, m, 'censor:redact', 20);
    watch(g, m, 1, undefined, () => g.perils.some((p) => p.a1 === 'censor:bars' && p.t < 0));
    seen.push(g.perils.find((p) => p.a1 === 'censor:bars' && p.t < 0)!.a);
    watch(g, m, 3, undefined, () => m.state !== 'act');
    m.moveCd![CENSOR_ACTS.findIndex((a) => a.id === 'censor:redact')] = 0;
    m.cd = 0;
  }
  assert.ok(seen[0] !== seen[1], `one way, then the other (${seen.join(', ')})`);
});

test('6. the Hush: the silence reaches him wherever he stands in the room, as its ring passes him; his words go dark', () => {
  for (const far of [2.5, 6, 10]) {
    const { g, m } = room('censor', far, 'censor:hush');
    assert.ok(untilAct(g, m, 'censor:hush', 4), `he hushes the room (the hero ${far} off)`);
    assert.equal(g.hushT, 0);
    const t0 = m.act!.t;
    let when = -1;
    const s = watch(g, m, 3, undefined, () => {
      if (when < 0 && g.hushT > 0) when = m.act ? m.act.t : -1;
      return when >= 0;
    });
    assert.equal(s.hurts.length, 0, 'silence does him no harm');
    assert.ok(g.hushT > HUSH_FOR - 0.1, `his words dark (${g.hushT.toFixed(2)} s)`);
    const p = g.perils.find((q) => q.a1 === 'censor:hush')!;
    const d = Math.hypot(g.hero.x - p.x, g.hero.y - p.y);
    assert.ok(d <= p.a, 'within the room the ring reaches');
    // (the ring's radius at the moment: as far as he stands)
    const u = (when - CE_HUSH.hit) / ROOM_HUSH_RING;
    assert.ok(when >= CE_HUSH.hit && u <= 1.05, `after the silence is let go, as the ring rolls (${when.toFixed(2)})`);
    void t0;
    // (not again while his words are dark still)
    assert.ok(!RULES!.can!(g.bosses, m, act('censor:hush'), 3, true), 'not made again while they are dark');
  }
});

test('7. at half his life he blacks out parts of the floor for good, on floor 15: the room shrinks, joined, its ways clear', () => hush(() => {
  for (const seed of [1, 2, 3]) {
    const g = undying(floor(15, seed));
    const m = g.boss!;
    g.bossReady();
    const L = g.level;
    const h = g.hero;
    const ground = censorGround(L, m.x, m.y);
    const open = ground.filter((i) => L.walk[i] === 1);
    const before = reach(L);
    // (the hero in his ground, before him; his life just under half)
    const sp = g.spotsRound(m.x, m.y, 60).find((q) => Math.hypot(q.x - m.x, q.y - m.y) > 4 && Math.hypot(q.x - m.x, q.y - m.y) < 6)!;
    h.x = sp.x;
    h.y = sp.y;
    m.state = 'chase';
    m.cd = 0;
    m.life = Math.floor(m.maxLife * 0.49);
    const plan = blackoutPlan(g.bosses, m);
    assert.ok(untilAct(g, m, 'censor:blackout', 2), `seed ${seed}: at half his life he blacks out the floor`);
    const p = g.perils.find((q) => q.a1 === 'censor:black')!;
    const tiles = tilesOf(p);
    assert.equal(tiles.join(','), plan.tiles.join(','), 'the floor his plan has');
    // (the hero stood on one as it slams: struck, and put off it)
    const W = L.floor.w;
    const t1 = tiles[Math.floor(tiles.length / 2)];
    h.x = (t1 % W) + 0.5;
    h.y = Math.floor(t1 / W) + 0.5;
    const was = fell(g);
    const s = watch(g, m, 2, undefined, () => !!p.done && p.t > REDACT_LAY + 0.05);
    assert.ok(s.hurts.length >= 1 || fell(g) > was, 'struck as it slams on him');
    assert.ok(g.free(L.walk, h.x, h.y, TUNE.heroRadius), 'put off it, onto floor he may stand on');
    // (about a quarter of his ground, never more than a third; along its walls)
    const share = tiles.length / open.length;
    assert.ok(share >= 0.15 && share <= CENSOR.blackout.most + 1e-9, `seed ${seed}: ${(share * 100).toFixed(0)} in 100 of his ground blacked out`);
    for (const i of tiles) {
      assert.equal(L.walk[i], 0, 'walked on no more');
      assert.ok(L.act1!.tiles.some((t) => t.i === i && t.name === BLACKED_TILE && t.mid === 1), 'laid as the art\'s floor tile, by its middle');
      assert.ok(blackedOut(L).has(i));
    }
    // (the room joined: every tile walked to before is walked to still, but those)
    const after = reach(L);
    const set = new Set(tiles);
    for (let i = 0; i < before.length; i++) if (before[i] && !set.has(i)) assert.ok(after[i], `seed ${seed}: tile ${i} still to be walked to`);
    // (the way on kept clear)
    const ex = L.land!.exit;
    for (const i of tiles) assert.ok(Math.hypot((i % W) + 0.5 - ex.x, Math.floor(i / W) + 0.5 - ex.y) >= CENSOR.blackout.clearWay, 'clear of the way on');
    // (nobody left standing on it)
    for (const o of g.monsters) if (!o.dead) assert.ok(!set.has(Math.floor(o.y) * W + Math.floor(o.x)), 'nothing left on it');
    // (once only)
    watch(g, m, 2, undefined, () => m.state !== 'act');
    m.life = Math.floor(m.maxLife * 0.3);
    const s2 = watch(g, m, 3, undefined, () => !!m.act && m.act.id === 'censor:blackout');
    assert.ok(!(m.act && m.act.id === 'censor:blackout') && s2.act !== 'censor:blackout', 'once only');
  }
}));

test('8. killed in the middle of anything, nothing of his still to come harms the hero; the floor blacked out stays; the book bursts', () => {
  for (const [id, when, far] of [['censor:slash', 0.5, 2], ['censor:strike', 0.6, 6], ['censor:strike', 1.0, 9], ['censor:redact', 0.7, 4], ['censor:hush', 0.9, 5]] as const) {
    const { g, m } = room('censor', far, id);
    assert.ok(untilAct(g, m, id, 4), `${id} begun`);
    if (id === 'censor:strike') put(g, m, far, CENSOR.strike.point[1]);
    if (id === 'censor:redact') {
      g.hero.x = Math.floor(g.hero.x) + 0.5;
      g.hero.y = Math.floor(g.hero.y) + 0.5;
    }
    watch(g, m, 2, undefined, () => !!m.act && m.act.t >= when);
    // (the book of stolen words, on its lectern in his room)
    const book = { kind: 'piece' as const, name: STOLEN_BOOK, tx: 3, ty: 3, x: 3.5, y: 3.5, solid: true, state: 0, variant: 0 };
    g.level.props.push(book);
    g.kill(m);
    const s = watch(g, m, 5);
    assert.equal(s.hurts.length, 0, `${id}, killed ${when} s in: nothing of his harms the hero after`);
    assert.equal(g.hushT, 0, 'nor hushes him');
    assert.equal(book.state, 1, 'the book of stolen words bursts');
    assert.equal(g.perils.filter((p) => p.a1 && p.a1.startsWith('censor:')).length, 0, 'nothing of his left on the floor after five seconds');
  }
  // (the floor blacked out stays, after him)
  const { g, m } = room('censor', 4);
  m.life = m.maxLife * 0.49;
  assert.ok(untilAct(g, m, 'censor:blackout', 2), 'he blacks out the floor of the practice room');
  watch(g, m, 2, undefined, () => m.state !== 'act');
  const laid = [...blackedOut(g.level)];
  assert.ok(laid.length > 0);
  g.kill(m);
  watch(g, m, 4);
  assert.ok(laid.every((i) => g.level.walk[i] === 0), 'the floor blacked out stays blacked out');
  assert.ok(g.perils.some((p) => p.a1 === 'censor:black'), 'and is drawn still where the floor is not dressed');
});

test('9. what he draws is the Order\'s black, the enemy\'s pink and the Hush\'s grey, never cyan; the practice room\'s floor laid by him', () => {
  const { g, m } = room('censor', 5);
  const { c } = fakeCtx(g);
  const draw = (layer: 'ground' | 'air', mm: Monster | null, p: (typeof g.perils)[number] | null): Set<string> => {
    const caught = colourCatcher();
    FX![layer]!({ ...c, g: caught.g }, mm, p);
    return caught.colours;
  };
  // (each of what he lays, through its life)
  const mk = (a1: string, more: Partial<(typeof g.perils)[number]>) => g.bosses.peril(m, 'act1', m.x + 1, m.y, { a1, ...more });
  const shots: [string, ReturnType<typeof mk>, number[]][] = [
    ['slash mark', mk('censor:slash', { dur: 1.2 }), [0.05, 0.5, 1.0]],
    ['line', mk('censor:line', { a: 9, b: 2.46, dur: 1.4 }), [0.1, 0.4, 1.2]],
    ['hush', mk('censor:hush', { a: 8, dur: 3 }), [0.2, 1.0, 2.5]],
    ['book', mk('censor:book', { dur: 3 }), [0.1, 1.0, 2.0]],
  ];
  for (const [what, p, ts] of shots) {
    for (const t of ts) {
      p.t = t;
      const col = what === 'book' ? draw('air', null, p) : draw('ground', null, p);
      assert.ok(col.size > 0, `${what} drawn at ${t}`);
      assert.ok([...col].every((k) => !cyanish(k)), `${what}: nothing cyan at ${t} (${[...col].join(' ')})`);
    }
  }
  // (Redaction's bars, the warning and the slam, from a real one; and the practice room's floor blacked out, laid by him)
  m.life = m.maxLife * 0.49;
  m.cd = 0;
  assert.ok(untilAct(g, m, 'censor:blackout', 2));
  const black = g.perils.find((p) => p.a1 === 'censor:black')!;
  for (const t of [-0.4, 0.05, 0.6, 1.8]) {
    black.t = t;
    const col = draw('ground', null, black);
    assert.ok(col.size > 0 && [...col].every((k) => !cyanish(k)), `the bars at ${t}: drawn, nothing cyan`);
  }
  black.t = 3;
  const { c: c2, drawn } = fakeCtx(g);
  FX!.ground!(c2, null, black);
  assert.ok(g.level.act1 === undefined && drawn.images.length === tilesOf(black).length, 'the practice room has no dressing: he lays the art\'s tile himself');
  // (Strike-Through's aim through its warning)
  const r2 = room('censor', 6, 'censor:strike');
  untilAct(r2.g, r2.m, 'censor:strike');
  watch(r2.g, r2.m, 1, undefined, () => !!r2.m.act && r2.m.act.t > 0.5);
  const caught = colourCatcher();
  FX!.ground!({ ...fakeCtx(r2.g).c, g: caught.g }, r2.m, null);
  assert.ok(caught.colours.size > 0 && [...caught.colours].every((k) => !cyanish(k)), 'its aim drawn in the enemy\'s pink');
});

test('10. a long fight on floor 15: no exceptions, every act made, the blacking out too', () => hush(() => {
  const g = undying(floor(15, 2));
  const m = g.boss!;
  g.bossReady();
  const h = g.hero;
  const sp = g.spotsRound(m.x, m.y, 60).find((q) => Math.hypot(q.x - m.x, q.y - m.y) > 3)!;
  h.x = sp.x;
  h.y = sp.y;
  m.state = 'chase';
  const acts = new Set<string>();
  const c = emptyControls();
  for (let k = 0; k < 90 * 60; k++) {
    const t = k / 60;
    Object.assign(c, emptyControls());
    if (Math.floor(t / 2.5) % 2 === 0) {
      c.mx = Math.cos(t * 0.9);
      c.my = Math.sin(t * 0.9);
    } else {
      c.fire = true;
      c.aimX = m.x;
      c.aimY = m.y;
    }
    if (k % 211 === 90) {
      c.evade = true;
      c.evadeX = h.x - h.fx * 3;
      c.evadeY = h.y - h.fy * 3;
    }
    if (k === 45 * 60) m.life = Math.min(m.life, Math.floor(m.maxLife * 0.49));
    g.update(1 / 60, c);
    h.life = h.d.maxLife;
    if (m.act) acts.add(m.act.id);
    g.events.length = 0;
    if (g.over || m.dead) break;
  }
  for (const a of CENSOR_ACTS) assert.ok(acts.has(a.id), `he made his ${a.id} (made: ${[...acts].join(', ')})`);
}));
