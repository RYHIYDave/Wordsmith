// ACT 1: THE RUBBLINGS IN THE GAME (game/act1_rules/rubbling.ts; their pictures art/act1_figs/rubbling.ts, the art
// chat's art/floor6_mobs.ts; their piles drawn by render/act1_fx/rubbling.ts).
//
//   1. they are built: their rules, their pictures with the clips their acts name (both ways they are seen);
//   2. their numbers are their pictures' own (their pace and scuttle, their bite's length and moment and where it
//      snaps shut, their rise out of a pile), and their size as the game goes by it;
//   3. each lies as a pile of chips until woken, then climbs out of it, one a moment after another, and swarms;
//   4. the bite lands at its picture's moment on a hero before it, and not on one who has stepped away;
//   5. tiny: their packs of six to ten; never a yellow pack;
//   6. what they draw: only the pile, the first frame of their rise; nothing cyan;
//   7. a swarm of them in a long fight: no exceptions.
//   run: tsx --test tests/act1_rubbling.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { RB_ATTACK, RB_EMERGE, RB_HIT, RB_PACE, RB_WALK, rubblingPainted } from '../src/art/floor6_mobs';
import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { GRAIN } from '../src/art/kit';
import { TILE3 } from '../src/art/new_mobs3';
import { act1Fig } from '../src/art/act1_figs/index';
import { RNG } from '../src/engine/rng';
import { act1Pack, act1Ready } from '../src/game/act1_mobs';
import { RUBBLING, RULES } from '../src/game/act1_rules/rubbling';
import { act1Rules } from '../src/game/act1_rules/index';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { FX } from '../src/render/act1_fx/rubbling';
import { act1Fx } from '../src/render/act1_fx/index';
import { cyanIn, fakeDocument, firstHurt, room, watch } from './act1_kinds_room';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

paintWithoutCanvas();
fakeDocument();

const act = (id: string) => RULES.acts.find((a) => a.id === id)!;

test('1. they are built: their rules, their pictures with the clips their acts name', () => {
  assert.ok(act1Rules('rubbling') === RULES, 'their rules');
  assert.ok(act1Ready('rubbling'), 'in the game: no longer stood in for');
  assert.ok(act1Fx('rubbling') === FX, 'what they draw');
  const art = act1Fig('rubbling')!.make();
  for (const set of [art.front, art.back]) {
    for (const a of RULES.acts) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip && clip.frames.length > 0, `its ${a.id} plays its clip ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 0.05, `${a.id}: its clip as long as the act`);
    }
    assert.ok(set.clips?.reel && set.clips.die, 'struck, and its death');
  }
});

test("2. their numbers are their pictures' own, and their size as the game goes by it", () => {
  const G = RULES.gait;
  assert.equal(G.pace, RB_PACE, 'the pace its scuttle is painted for');
  assert.equal(MONSTERS.rubbling.speed, RB_PACE, 'and it goes at it: its feet do not slide');
  near(G.cycle, RB_WALK.frames / RB_WALK.fps, 1e-9, 'its scuttle goes round');
  assert.equal(G.setOff + G.halt, 0, 'its scuttle loops from its stand');
  const bite = act('rubbling:bite');
  assert.equal(bite.long, RB_ATTACK, 'the bite is as long as its picture');
  assert.equal(bite.hit, RB_HIT, 'and snaps shut at its moment');
  assert.equal(act('rubbling:emerge').long, RB_EMERGE, 'its rise out of a pile');
  // (where its heap has sprung to as it snaps shut: the heap's middle, by its painted spark)
  near(RUBBLING.bite.ahead, 16 / TILE3, 1e-3, 'it springs 16 of its lengths');
  assert.ok(RUBBLING.bite.ahead + RUBBLING.bite.r >= act('rubbling:bite').far, 'it reaches as far as it bites from');
  const still = paintingOf({ img: rubblingPainted('stand', 0).px } as never);
  const sprung = paintingOf({ img: rubblingPainted('attack', RB_HIT).px } as never);
  const middle = (p: ReturnType<typeof paintingOf>): number => {
    let n = 0;
    let sx = 0;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.has(x, y)) {
      n++;
      sx += x;
    }
    return sx / n;
  };
  assert.ok(middle(sprung) > middle(still) + 4, 'its picture springs forward');
  // ITS SIZE, measured as tests/first5_bosses.test.ts measures the others'
  const art = makeBestiary();
  const size = FIGURE_SIZE.rubbling;
  assert.deepEqual(size, act1Fig('rubbling')!.size, 'the game goes by its own');
  const sp = art.of('rubbling').front.idle[0];
  const p = paintingOf(sp);
  const ax = Math.round(sp.ax * GRAIN);
  const ay = Math.round(sp.ay * GRAIN);
  let head = 0;
  for (let y = 0; y < p.h && head === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) head = (ay - y) / GRAIN;
  assert.ok(Math.abs(size.top - head) <= 4, `the game takes its top to be ${size.top} up; in the picture it is ${head}`);
  const reach = Math.max(sp.ax, sp.w - sp.ax);
  assert.ok(size.half <= reach + 1 && size.half >= reach * 0.4, `${size.half} to either side; the picture reaches ${reach}`);
});

test('3. each lies as a pile of chips until woken, then climbs out, one a moment after another, and swarms', () => {
  const g = Game.forPractice('warrior', 5);
  (g as unknown as { waveT: number }).waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  const pack: Monster[] = [];
  for (let i = 0; i < 8; i++) pack.push(g.spawn('rubbling', h.x - 4 + (i % 4) * 0.6, h.y - 1 + Math.floor(i / 4) * 1.2, 5, 0, false, new RNG(10 + i)));
  for (const m of pack) {
    assert.ok(m.a1 && m.a1.pile === 1, 'it lies as a pile');
    m.state = 'sleep';
  }
  const art = act1Fig('rubbling')!.make();
  assert.ok(FX.sprite!(pack[0], art, art.front) === art.front.clips!.moves!.emerge.frames[0], 'drawn as the first frame of its rise');
  const c = emptyControls();
  // (woken)
  (g as unknown as { wakeUp(m: Monster): void }).wakeUp(pack[0]);
  const rose: number[] = [];
  for (let k = 0; k < 60 * 3; k++) {
    g.update(1 / 60, c);
    h.life = h.d.maxLife;
    pack.forEach((m, i) => {
      if (rose[i] === undefined && m.act && m.act.id === 'rubbling:emerge') rose[i] = k / 60;
    });
  }
  assert.equal(rose.filter((t) => t !== undefined).length, pack.length, 'every one of them climbs out');
  assert.ok(Math.max(...rose) - Math.min(...rose) > 0.2, `one a moment after another (${rose.map((t) => t.toFixed(2)).join(', ')})`);
  assert.ok(Math.max(...rose) <= RUBBLING.rise.most + 0.1, 'and all of them soon');
  for (const m of pack) {
    assert.ok(!m.a1!.pile, 'out of its pile');
    assert.equal(FX.sprite!(m, art, art.front), null, 'and drawn as its gait and acts have it');
  }
  assert.ok(pack.every((m) => Math.hypot(m.x - h.x, m.y - h.y) < 2.5), 'and they swarm him');
});

test('4. the bite lands at its moment on a hero before it, and not on one who has stepped away', () => {
  const bite = act('rubbling:bite');
  {
    const { g, m } = room('rubbling', 0.6, 'rubbling:bite');
    const s = watch(g, m, 0.8);
    near(firstHurt(s) - s.began, bite.hit, 0.04, 'the bite lands as it snaps shut');
    assert.equal(s.hurts.length, 1, 'once');
    const n = s.hurts[0].n;
    assert.ok(n >= 1 && n <= MONSTERS.rubbling.dmgMax * 3, `a little blow (${n})`);
  }
  {
    const { g, m } = room('rubbling', bite.far, 'rubbling:bite');
    assert.equal(watch(g, m, 0.8).hurts.length, 1, 'it reaches as far as it bites from');
  }
  {
    const { g, m } = room('rubbling', 0.6, 'rubbling:bite');
    g.bosses.startAct(m, RULES.acts, 0);
    g.hero.x = m.x + RUBBLING.bite.ahead + RUBBLING.bite.r + TUNE.heroRadius + 0.1;
    assert.equal(watch(g, m, 0.8).hurts.length, 0, 'stepped away, it snaps on nothing');
  }
});

test('5. tiny: their packs of six to ten, and never a yellow pack', () => {
  assert.equal(sizeOf('rubbling'), 'tiny');
  const rng = new RNG(4);
  let seen = 0;
  for (let i = 0; i < 400; i++) {
    const p = act1Pack(6, rng, 'normal');
    if (p.kind !== 'rubbling') continue;
    seen++;
    assert.ok(p.size >= PACK_BY_SIZE.tiny[0] && p.size <= PACK_BY_SIZE.tiny[1], `a pack of ${p.size}`);
  }
  assert.ok(seen > 20, 'and floor 6 has them');
  for (let i = 0; i < 200; i++) assert.ok(act1Pack(6, rng, 'elite').kind !== 'rubbling', 'not led');
});

test('6. what they draw: only the pile; nothing cyan', () => {
  assert.equal(FX.ground, undefined);
  assert.equal(FX.standing, undefined);
  assert.equal(FX.air, undefined);
  const art = act1Fig('rubbling')!.make();
  for (const set of [art.front, art.back]) {
    for (const sp of [set.idle[0], set.walk[3], set.clips!.attack!.frames[13], set.clips!.moves!.emerge.frames[0], set.clips!.moves!.emerge.frames[12], set.clips!.reel!.frames[4]]) assert.equal(cyanIn(sp), 0, 'nothing cyan on it');
  }
});

test('7. a swarm of them in a long fight: no exceptions', () => {
  const { g, m } = room('rubbling', 3, null, true);
  for (let i = 0; i < 7; i++) g.spawn('rubbling', m.x - 0.5 * i, m.y + (i % 2 ? 0.7 : -0.7), -2, 0, false, new RNG(30 + i));
  for (const o of g.monsters) (g as unknown as { wakeUp(m: Monster): void }).wakeUp(o);
  let k0 = 0;
  // (he stands among them a while, then runs about)
  const s = watch(g, m, 30, (t) => (t < 12 ? null : { mx: Math.cos(t * 0.9), my: Math.sin(t * 1.3) }), () => {
    if (++k0 % 40 === 0) for (const o of g.monsters) if (!o.dead && o !== m) (g as unknown as { damageMonster(m: unknown, n: number, el: string, c: boolean, k: number): void }).damageMonster(o, 2, 'phys', false, -1);
    return false;
  });
  assert.ok(s.hurts.length > 3, `they bite him (${s.hurts.length})`);
  assert.ok(g.monsters.filter((o) => o.kind === 'rubbling' && !o.dead).length < 8, 'and he kills some of them');
});
