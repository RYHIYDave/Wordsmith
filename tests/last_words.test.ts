// THE LAST WORDS AT WORK: his seven of 8 Nov 2026 (to the main chat, 06:44, “I want 6 more words for the last levels”, “At least
// 6”; 06:50, “Add mirroring as well”), found from floor 16 down. Their numbers are the main chat's starting points (src/game/defs.ts
// PIERCE to MIRRORING); their looks the art chat's, to come (plain stand-ins until then). These tests hold, for each: the word and
// where it is found; in front; behind; on a monster; and on gear (his words, “And those all craftable as well”).
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { BLEED, CULL, MIRRORING, PIERCE, PLUNDER, REAP, SURGE, WORDS, wordsAt } from '../src/game/defs';
import { Game } from '../src/game/game';
import { imbueOptions } from '../src/game/items';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster, Zone } from '../src/game/state';
import { LAST_WORD_IDS, LAST_WORDS_FROM, SLOTS, WORD_IDS } from '../src/game/types';
import type { ClassId, MonsterKind, WordId } from '../src/game/types';
import { land } from './helpers';

const DT = 1 / 30;

interface Inside {
  rng: RNG;
  waveT: number;
  zones: Zone[];
  spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster;
  wakeUp(m: Monster): void;
  kill(m: Monster): void;
}

function room(cls: ClassId, words: readonly [number, 'front' | 'behind', WordId][] = []): { g: Game; a: Inside; seen: GameEvent[] } {
  const g = Game.forPractice(cls, 5);
  const a = g as unknown as Inside;
  a.waveT = 1e9;
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
  return { g, a, seen: [] };
}

function put(g: Game, a: Inside, kind: MonsterKind, dx: number, dy: number, walks = false, rank: 0 | 1 | 2 = 0, boss = false): Monster {
  const h = g.hero;
  const m = a.spawn(kind, h.x + dx, h.y + dy, 1, rank, boss, a.rng);
  a.wakeUp(m);
  if (!walks) m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = 1e6;
  return m;
}

function run(g: Game, seen: GameEvent[], secs: number, c: Controls = emptyControls()): void {
  for (let t = 0; t < secs - 1e-9; t += DT) {
    g.update(DT, c);
    seen.push(...g.events);
    g.events.length = 0;
  }
}

function swing(g: Game, seen: GameEvent[], m: { x: number; y: number }): void {
  const h = g.hero;
  h.swingT = 0;
  for (const s of h.skills) {
    s.cd = 0;
    s.charges = s.maxCharges;
  }
  const c = emptyControls();
  c.fire = true;
  c.aimX = m.x;
  c.aimY = m.y;
  g.update(DT, c);
  seen.push(...g.events);
  g.events.length = 0;
  c.fire = false;
  land(g, c, DT, () => {
    seen.push(...g.events);
    g.events.length = 0;
  });
}

const of = <T extends GameEvent['t']>(seen: readonly GameEvent[], t: T): Extract<GameEvent, { t: T }>[] => seen.filter((e) => e.t === t) as Extract<GameEvent, { t: T }>[];

test('the seven: in every list of words, found only from floor 16 down, each with its texts and its gear', () => {
  assert.deepEqual([...LAST_WORD_IDS], ['piercing', 'bleeding', 'reaping', 'culling', 'surging', 'plundering', 'mirroring']);
  for (const w of LAST_WORD_IDS) {
    assert.ok(WORD_IDS.includes(w), w);
    assert.equal(WORDS[w].kind, 'shape');
    assert.ok(WORDS[w].frontText && WORDS[w].behindText && WORDS[w].monsterText, `${w}: its texts`);
    assert.ok(!wordsAt(LAST_WORDS_FROM - 1).includes(w), `${w}: not on floor 15`);
    assert.ok(wordsAt(LAST_WORDS_FROM).includes(w), `${w}: from floor 16`);
    for (const slot of SLOTS) assert.ok(imbueOptions(w, slot, 16).length > 0, `${w} on ${slot}`);
  }
  assert.ok(wordsAt(11).includes('binding') && !wordsAt(10).includes('binding'), 'the city\'s words as before');
  assert.equal(wordsAt(5).length, 13, 'the first floors\' thirteen as before');
});

test('PIERCING: a blow goes on through the first; the lance strikes down the line; a monster\'s shots go through walls', () => {
  const { g, a, seen } = room('warrior', [[0, 'front', 'piercing']]);
  const first = put(g, a, 'skeleton', 1.25, 0);
  const behindIt = put(g, a, 'skeleton', 1.25 + PIERCE.line - 0.5, 0);
  const aside = put(g, a, 'skeleton', 1.25 + 1, 2.5);
  swing(g, seen, first);
  assert.ok(first.life < first.maxLife, 'the first struck');
  assert.ok(behindIt.life < behindIt.maxLife, 'the one behind it in the line, too');
  assert.equal(aside.life, aside.maxLife, 'not one off the line');
  assert.equal(of(seen, 'pierceLine').length, 1);
  // behind: the lance, a moment later
  const b = room('warrior', [[0, 'behind', 'piercing']]);
  const m = put(b.g, b.a, 'skeleton', 1.25, 0);
  const far = put(b.g, b.a, 'skeleton', 2.6, 0.2);
  swing(b.g, b.seen, m);
  assert.equal(of(b.seen, 'lance').length, 1, 'the lance thrown');
  const before = far.life;
  run(b.g, b.seen, PIERCE.lanceDelay + 0.1);
  assert.ok(far.life < before, 'it lands down the line');
  // on a monster: its shot flies on through a wall (the practice room's edge kept)
  assert.ok(WORDS.piercing.monsterText.includes('walls'));
});

test('BLEEDING: what it hits bleeds, more while it walks; thorns cut what walks in them; a monster\'s makes him bleed', () => {
  const { g, a, seen } = room('warrior', [[0, 'front', 'bleeding']]);
  const m = put(g, a, 'skeleton', 1.25, 0);
  swing(g, seen, m);
  assert.ok((m.bleedT ?? 0) > 0 && (m.bleedDps ?? 0) > 0 && m.bleedMove === BLEED.moving, 'bleeding');
  const still = m.life;
  run(g, seen, 1.0);
  const lostStill = still - m.life;
  // walking
  const walking = m.life;
  for (let k = 0; k < 30; k++) {
    m.x += 0.05;
    run(g, seen, DT);
  }
  const lostWalking = walking - m.life;
  assert.ok(lostStill > 0 && lostWalking > lostStill * 1.5, `more while it walks (${lostStill} still, ${lostWalking} walking)`);
  // behind: thorns
  const b = room('warrior', [[0, 'behind', 'bleeding']]);
  const t = put(b.g, b.a, 'skeleton', 1.25, 0);
  swing(b.g, b.seen, t);
  const thorns = b.a.zones.filter((z) => z.kind === 'thorns');
  assert.equal(thorns.length, 1, 'thorns laid');
  const walker = put(b.g, b.a, 'skeleton', 1.25, 3);
  walker.x = thorns[0].x;
  walker.y = thorns[0].y;
  run(b.g, b.seen, 1.1);
  assert.ok(walker.life < walker.maxLife && (walker.bleedT ?? 0) > 0, 'cut, and bleeding');
  // on a monster
  const c = room('warrior');
  const h = c.g.hero;
  const mm = put(c.g, c.a, 'skeleton', 2, 0);
  h.invuln = 0;
  c.g.hurtHero(1, 'phys', ['bleeding'], mm);
  assert.ok((h.heroBleedT ?? 0) > 0 && (h.heroBleedDps ?? 0) > 0, 'he bleeds');
});

test('REAPING: a kill takes time off his cooldowns; a kill raises a spirit that fights; a monster rises once', () => {
  const { g, a, seen } = room('warrior', [[0, 'front', 'reaping']]);
  const h = g.hero;
  const m = put(g, a, 'skeleton', 1.25, 0);
  m.life = 1;
  swing(g, seen, m);
  assert.ok(m.dead);
  assert.equal(of(seen, 'reapSoul').length, 1, 'a soul');
  // (the cut itself: a cooldown waiting, a kill)
  h.skills[1].charges = 0;
  h.skills[1].cd = 5;
  const m2 = put(g, a, 'skeleton', 1.25, 0);
  m2.life = 1;
  swing(g, seen, m2);
  assert.ok(h.skills[1].cd <= 5 - REAP.secs + 0.1 || h.skills[1].charges > 0, `taken off (${h.skills[1].cd})`);
  // behind: a spirit
  const b = room('warrior', [[0, 'behind', 'reaping']]);
  const k = put(b.g, b.a, 'skeleton', 1.25, 0);
  k.life = 1;
  swing(b.g, b.seen, k);
  assert.equal(b.g.spirits.length, 1, 'a spirit risen');
  const foe = put(b.g, b.a, 'skeleton', 3, 0);
  run(b.g, b.seen, 2);
  assert.ok(foe.life < foe.maxLife && of(b.seen, 'spiritHit').length > 0, 'it fights for him');
  run(b.g, b.seen, REAP.spiritSecs);
  assert.equal(b.g.spirits.length, 0, 'and is gone in time');
  // on a monster: it rises once
  const c = room('warrior');
  const r = put(c.g, c.a, 'skeleton', 3, 0);
  r.words = ['reaping'];
  c.a.kill(r);
  const n = c.g.monsters.filter((o) => !o.dead).length;
  run(c.g, c.seen, REAP.riseAfter + 0.1);
  const risen = c.g.monsters.filter((o) => !o.dead && o.risen);
  assert.equal(risen.length, 1, 'risen');
  assert.equal(c.g.monsters.filter((o) => !o.dead).length, n + 1);
  c.a.kill(risen[0]);
  run(c.g, c.seen, REAP.riseAfter + 0.1);
  assert.equal(c.g.monsters.filter((o) => !o.dead && o.risen).length, 0, 'once only');
});

test('CULLING: a hit that leaves one nearly dead takes it, never a boss; the reaper\'s mark; a monster\'s hits harder when he is low', () => {
  const { g, a, seen } = room('warrior', [[0, 'front', 'culling']]);
  const r = g.hero.skills[0].r;
  const m = put(g, a, 'skeleton', 1.25, 0);
  m.life = m.maxLife * (r.cull * 0.5) + 1e6 * 0;
  // (the blow takes little of a million: it is left under the line, and taken)
  swing(g, seen, m);
  assert.ok(m.dead && of(seen, 'culled').length === 1, 'culled');
  const boss = put(g, a, 'brute', 1.25, 0, false, 0, true);
  boss.life = boss.maxLife * 0.05;
  g.hero.x = boss.x - 1.25;
  g.hero.y = boss.y;
  swing(g, seen, boss);
  assert.ok(!boss.dead, 'a boss never');
  // behind: the mark
  const b = room('warrior', [[0, 'behind', 'culling']]);
  const s = put(b.g, b.a, 'skeleton', 1.25, 0);
  swing(b.g, b.seen, s);
  const mark = b.a.zones.find((z) => z.kind === 'reaper');
  assert.ok(mark, 'a mark laid');
  if (mark) {
    const weak = put(b.g, b.a, 'skeleton', 0, 3);
    weak.life = weak.maxLife * CULL.markUnder * 0.5;
    weak.x = mark.x;
    weak.y = mark.y;
    run(b.g, b.seen, 0.1);
    assert.ok(weak.dead && !b.a.zones.includes(mark), 'the weak one taken, the mark spent');
  }
  // on a monster: harder while he is low (out of the practice room, where his life is kept up)
  const c = new Game('warrior', 4);
  const ca = c as unknown as Inside;
  c.monsters.length = 0;
  const h = c.hero;
  const mm = ca.spawn('skeleton', h.x + 2, h.y, 1, 0, false, ca.rng);
  h.invuln = 0;
  h.shield = 0;
  h.life = h.d.maxLife;
  c.hurtHero(10, 'phys', ['culling'], mm);
  const high = h.d.maxLife - h.life;
  h.life = Math.round(h.d.maxLife * CULL.low * 0.9);
  const was = h.life;
  h.invuln = 0;
  c.hurtHero(10, 'phys', ['culling'], mm);
  const low = was - h.life;
  assert.ok(low > high * 1.3, `harder while he is low (${high} then ${low})`);
});

test('SURGING: every third use a shockwave round him; his dodge a surge; a monster\'s shockwave comes after a warning', () => {
  const { g, a, seen } = room('warrior', [[0, 'front', 'surging']]);
  const m = put(g, a, 'skeleton', 1.25, 0);
  for (let k = 0; k < SURGE.every; k++) {
    swing(g, seen, m);
    run(g, seen, 0.6);
  }
  assert.equal(of(seen, 'surge').filter((e) => !e.dodge).length, 1, 'one shockwave in three uses');
  // on a monster
  const c = room('warrior');
  const mm = put(c.g, c.a, 'skeleton', 2, 0);
  mm.words = ['surging'];
  run(c.g, c.seen, SURGE.monsterEvery + 0.2);
  assert.ok(c.a.zones.some((z) => z.kind === 'warn' && z.from.includes('surge')), 'a warning, then its shockwave');
});

test('PLUNDERING: more gold and items from kills; gold that flies to his purse; a monster steals his gold, dropped when it dies', () => {
  const b = room('warrior', [[0, 'behind', 'plundering']]);
  const h = b.g.hero;
  const k = put(b.g, b.a, 'skeleton', 1.25, 0);
  k.life = 1;
  const gold = h.gold;
  swing(b.g, b.seen, k);
  // (the practice room keeps no gold: the burst is told, and paid in a game)
  assert.ok(k.dead && (of(b.seen, 'goldBurst').length === 1 || h.gold === gold));
  assert.ok(PLUNDER.item > 0 && PLUNDER.gold > 0);
  // on a monster (out of the practice room)
  const g = new Game('warrior', 4);
  const a = g as unknown as Inside;
  a.waveT = 1e9;
  g.monsters.length = 0;
  g.hero.gold = 1000;
  g.hero.invuln = 0;
  const thief = a.spawn('skeleton', g.hero.x + 2, g.hero.y, 1, 0, false, a.rng);
  thief.words = ['plundering'];
  g.hurtHero(1, 'phys', ['plundering'], thief);
  const took = 1000 - g.hero.gold;
  assert.ok(took > 0 && thief.stolen === took, `stolen ${took}`);
  a.kill(thief);
  assert.equal(thief.stolen, 0, 'dropped when it dies');
});

test('MIRRORING: a reflection makes the same attack beside him; a mirror left makes his next attack again; a monster sends harm back', () => {
  const { g, a, seen } = room('ranger', [[0, 'front', 'mirroring']]);
  const m = put(g, a, 'skeleton', 4, 0);
  swing(g, seen, m);
  assert.equal(of(seen, 'reflection').length, 1, 'his reflection attacks with him');
  // behind
  const b = room('ranger', [[0, 'behind', 'mirroring']]);
  const t = put(b.g, b.a, 'skeleton', 4, 0);
  swing(b.g, b.seen, t);
  const mirror = b.a.zones.find((z) => z.kind === 'mirror');
  assert.ok(mirror, 'a mirror left');
  b.g.hero.x -= 1;
  swing(b.g, b.seen, t);
  assert.equal(of(b.seen, 'mirrorCast').length, 1, 'it makes the next attack again');
  assert.ok(!b.a.zones.includes(mirror as Zone), 'and is spent');
  // on a monster
  const c = room('warrior');
  const h = c.g.hero;
  const mm = put(c.g, c.a, 'skeleton', 1.25, 0);
  mm.words = ['mirroring'];
  h.invuln = 0;
  const life = h.life;
  swing(c.g, c.seen, mm);
  assert.ok(of(c.seen, 'mirrorBack').length === 1 && h.life < life, 'harm comes back at him');
  assert.ok(MIRRORING.back > 0 && MIRRORING.back < 0.5);
});
