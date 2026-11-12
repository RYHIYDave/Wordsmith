// HIS THREE NEW WORDS AT WORK (9 Nov 2026, 08:24 and 08:26; his picks by 09:12): LASTING, everything its ability makes and gives
// half again as long (his “Well it makes everything connected to lasting last longer”: the same in front or behind); FLEETING, all
// of it a third shorter, doing as much in that time; VAST, the opposite of Precise, a bigger area for a little less damage, and
// behind a splash off each hit. Found from floor 6 like Precise and Heavy; on gear; on a monster. Their numbers game/defs.ts LASTING,
// FLEETING, VAST; their looks the art chat's, to come.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { FLEETING, FRENZY, GUARD, LASTING, PRECISE, TUNE, VAST, WORDS, wordsAt } from '../src/game/defs';
import { Game } from '../src/game/game';
import { imbueOptions } from '../src/game/items';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster } from '../src/game/state';
import { SLOTS, WORD_IDS } from '../src/game/types';
import type { ClassId, MonsterKind, WordId } from '../src/game/types';
import { land } from './helpers';

const DT = 1 / 30;
const THREE: readonly WordId[] = ['lasting', 'fleeting', 'vast'];

interface Inside {
  rng: RNG;
  waveT: number;
  spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster;
  wakeUp(m: Monster): void;
  hitMonster(m: Monster, i: number, frac: number, quiet: boolean, sure?: boolean): void;
  boons(i: number): void;
}
const inner = (g: Game): Inside => g as unknown as Inside;

function room(cls: ClassId, words: readonly [number, 'front' | 'behind', WordId][] = []): Game {
  const g = Game.forPractice(cls, 5);
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x = 14.5;
  h.y = 15.5;
  h.fx = 1;
  h.fy = 0;
  for (const [i, side, w] of words) {
    h.words[w] = (h.words[w] ?? 0) + 1;
    assert.equal(g.socket(i, side, w), null, `${w} goes ${side} of ability ${i}`);
  }
  g.events.length = 0;
  return g;
}

function dummy(g: Game, dx: number, dy: number, kind: MonsterKind = 'skeleton'): Monster {
  const a = inner(g);
  const m = a.spawn(kind, g.hero.x + dx, g.hero.y + dy, 1, 0, false, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = 1e7;
  return m;
}

function attack(g: Game, skill: 0 | 1, dx: number, dy: number): GameEvent[] {
  const h = g.hero;
  const c: Controls = emptyControls();
  c.aimX = c.castX = h.x + dx;
  c.aimY = c.castY = h.y + dy;
  if (skill === 0) c.fire = true;
  else c.cast = true;
  const ev: GameEvent[] = [];
  const take = (): void => {
    for (const e of g.events) ev.push(e);
    g.events.length = 0;
  };
  g.update(DT, c);
  c.fire = false;
  c.cast = false;
  take();
  land(g, c, DT, take);
  return ev;
}

const near = (a: number, b: number, eps = 1e-6): boolean => Math.abs(a - b) < eps;

test('the three: in every list of words, found from floor 6 like Precise and Heavy (not in the prison), with their texts and gear', () => {
  for (const w of THREE) {
    assert.ok(WORD_IDS.includes(w), `${w} in the list of words`);
    const W = WORDS[w];
    assert.ok(W.frontText && W.behindText && W.monsterText && W.about, `${w}: its texts`);
    for (const p of [1, 5]) assert.ok(!wordsAt(p).includes(w), `${w} not found on floor ${p}`);
    for (const p of [6, 10, 16]) assert.ok(wordsAt(p).includes(w) && wordsAt(p).includes('precise'), `${w} found on floor ${p}, as Precise`);
    for (const slot of SLOTS) assert.ok(imbueOptions(w, slot, 6).length > 0, `${w} burned into ${slot}`);
  }
  assert.equal(WORDS.lasting.attr, 'int');
  assert.equal(WORDS.fleeting.attr, 'dex');
  assert.equal(WORDS.vast.attr, 'str');
});

test('LASTING, in front or behind: everything its ability makes and gives lasts half again as long; FLEETING a third shorter, faster, as much in all; both, about as it was', () => {
  const plain = room('mage').hero.skills[1].r;
  assert.ok(plain.last === 1 && plain.pace === 1 && plain.boost === 1 && plain.vast === 0, 'none: as it was');
  for (const side of ['front', 'behind'] as const) {
    const r = room('mage', [[1, side, 'lasting']]).hero.skills[1].r;
    assert.ok(r.last >= 1 + LASTING.longer && r.last <= 1 + LASTING.longerMost, `lasting ${side}: ${r.last.toFixed(3)} as long`);
    assert.equal(r.pace, 1, 'as hard a second');
    const f = room('mage', [[1, side, 'fleeting']]).hero.skills[1].r;
    assert.ok(near(f.last, 1 - FLEETING.shorter), `fleeting ${side}: ${f.last.toFixed(3)} as long`);
    assert.ok(near(f.last * f.pace, 1), 'as much in all');
    assert.ok(near(f.boost, 1 + FLEETING.stronger), 'its boosts stronger');
  }
  const both = room('mage', [[1, 'front', 'lasting'], [1, 'behind', 'fleeting']]).hero.skills[1].r;
  assert.ok(both.last > 0.95 && both.last < 1.2, `both: ${both.last.toFixed(3)} as long`);
  // (its ground, in time and harm a second)
  const ground = room('mage', [[1, 'behind', 'fire']]).hero.skills[1].r.zone!;
  const longZ = room('mage', [[1, 'behind', 'fire'], [1, 'front', 'lasting']]).hero.skills[1].r;
  assert.ok(near(longZ.zone!.dur, ground.dur * longZ.last) && near(longZ.zone!.dps, ground.dps), 'its burning ground longer, as hard');
  const quick = room('mage', [[1, 'behind', 'fire'], [1, 'front', 'fleeting']]).hero.skills[1].r;
  assert.ok(near(quick.zone!.dur * quick.zone!.dps, ground.dur * ground.dps), 'its burning ground shorter, as much in all');
});

test('LASTING at work: its orb out longer, its poison and burning as hard for longer, its boosts held longer', () => {
  // (the orb)
  const g = room('mage', [[1, 'front', 'lasting']]);
  dummy(g, 3, 0);
  attack(g, 1, 3, 0);
  assert.equal(g.orbs.length, 1);
  assert.ok(near(g.orbs[0].life, TUNE.orbLife * g.hero.skills[1].r.last), `the orb out ${g.orbs[0].life.toFixed(2)} s`);
  // (poison and burning on what it hits: Fleeting's shorter and harder, Lasting's longer and as hard)
  const p = room('ranger', [[0, 'front', 'poison'], [0, 'front', 'lasting']]);
  const m = dummy(p, 2, 0);
  inner(p).hitMonster(m, 0, 1, false);
  assert.ok(near(m.poisonT, TUNE.poisonTime * p.hero.skills[0].r.last), `poisoned ${m.poisonT.toFixed(2)} s`);
  const q = room('ranger', [[0, 'front', 'poison'], [0, 'front', 'fleeting']]);
  const n = dummy(q, 2, 0);
  inner(q).hitMonster(n, 0, 1, false);
  assert.ok(near(n.poisonT, TUNE.poisonTime * (1 - FLEETING.shorter)), `poisoned ${n.poisonT.toFixed(2)} s`);
  const f = room('mage', [[0, 'front', 'fire'], [0, 'front', 'fleeting']]);
  const o = dummy(f, 2, 0);
  inner(f).hitMonster(o, 0, 1, false);
  assert.ok(near(o.burnT, 3 * (1 - FLEETING.shorter)), `burning ${o.burnT.toFixed(2)} s`);
  // (its boosts: Guarding's shield and Frenzy's hold, longer; Swift's haste, Fleeting's shorter and stronger)
  const b = room('warrior', [[0, 'front', 'guarding'], [0, 'front', 'frenzied'], [0, 'behind', 'lasting']]);
  inner(b).boons(0);
  const L = b.hero.skills[0].r.last;
  assert.ok(near(b.hero.shieldT, GUARD.shieldTime * L), `the shield ${b.hero.shieldT.toFixed(2)} s`);
  assert.ok(near(b.hero.frenzyT, FRENZY.hold * L), `the frenzy held ${b.hero.frenzyT.toFixed(2)} s`);
  const s0 = room('warrior', [[0, 'behind', 'swift']]);
  inner(s0).boons(0);
  const s1 = room('warrior', [[0, 'behind', 'swift'], [0, 'front', 'fleeting']]);
  inner(s1).boons(0);
  assert.ok(near(s1.hero.hasteT, s0.hero.hasteT * (1 - FLEETING.shorter)), 'the haste shorter');
  assert.ok(near(s1.hero.haste, s0.hero.haste * (1 + FLEETING.stronger)), 'and stronger');
});

test('VAST: in front a much bigger area for a little less damage, the opposite of Precise; behind, each hit splashes onto those near it', () => {
  const plain = room('warrior').hero.skills[0].r;
  const v = room('warrior', [[0, 'front', 'vast']]).hero.skills[0].r;
  assert.ok(v.size >= plain.size * (1 + VAST.wider) - 1e-9, `${(v.size / plain.size).toFixed(2)} times the area's reach`);
  assert.ok(near(v.dmgMult, plain.dmgMult * (1 - VAST.softer)), 'a little less damage');
  const p = room('warrior', [[0, 'front', 'precise']]).hero.skills[0].r;
  assert.ok(near(p.size, plain.size * PRECISE.area) && v.size > plain.size, 'Precise smaller, Vast bigger');
  // behind: a hit on one splashes onto the one beside it, not onto one far off
  const g = room('warrior', [[0, 'behind', 'vast']]);
  assert.ok(g.hero.skills[0].r.vast >= VAST.splash);
  const a = dummy(g, 2, 0);
  const b = dummy(g, 2, 0.8);
  const far = dummy(g, 2, 4);
  inner(g).hitMonster(a, 0, 1, false);
  const struck = a.maxLife - a.life;
  const splashed = b.maxLife - b.life;
  assert.ok(struck > 0 && near(splashed / struck, g.hero.skills[0].r.vast, 0.05), `splashed ${splashed} of ${struck}`);
  assert.equal(far.maxLife - far.life, 0, 'not the one far off');
});

test('on a monster: LASTING, its poison, burning and chill on the hero longer; FLEETING, its poison sooner, as much; VAST, its warned blows wider', () => {
  const g = room('warrior');
  const h = g.hero;
  const m = dummy(g, 1, 0);
  h.life = h.d.maxLife = 1e6;
  m.words = ['poison', 'lasting'];
  g.hurtHero(100, 'phys', m.words, m);
  assert.ok(near(h.poisonT, TUNE.poisonTime * (1 + LASTING.monster)), `poisoned ${h.poisonT.toFixed(2)} s`);
  const dpsLong = h.poisonDps;
  h.poisonT = 0;
  m.words = ['poison'];
  g.hurtHero(100, 'phys', m.words, m);
  const dps = h.poisonDps;
  assert.ok(near(dpsLong, dps, dps * 0.05), 'as hard a second');
  h.poisonT = 0;
  m.words = ['poison', 'fleeting'];
  g.hurtHero(100, 'phys', m.words, m);
  assert.ok(near(h.poisonT, TUNE.poisonTime * (1 - FLEETING.monster)), `poisoned ${h.poisonT.toFixed(2)} s`);
  assert.ok(near(h.poisonT * h.poisonDps, TUNE.poisonTime * dps, TUNE.poisonTime * dps * 0.05), 'as much in all');
  h.chillT = 0;
  m.words = ['frost', 'lasting'];
  g.hurtHero(100, 'frost', m.words, m);
  assert.ok(near(h.chillT, 2 * (1 + LASTING.monster)), `chilled ${h.chillT.toFixed(2)} s`);
  // (VAST: a warned blow wider)
  g.addWarn(h.x, h.y, 1, 1, 10, 'phys', ['vast'], 'a vast one');
  g.addWarn(h.x, h.y, 1, 1, 10, 'phys', [], 'a plain one');
  const warns = g.zones.filter((z) => z.kind === 'warn');
  assert.ok(near(warns[warns.length - 2].r, 1 + VAST.monster) && near(warns[warns.length - 1].r, 1), 'wider by its word');
});
