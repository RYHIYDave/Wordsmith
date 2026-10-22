// BINDING AT WORK: the city's fifth word, found from floor 11 down. His pick to the main chat, 21 Oct 2026 (Pacific), after his
// 18:25 “And let’s add some words to levels 11-15”: “Binding”, a word kept on his page "Wordsmith: Words, Crafting, Ranks":
// Control; in front, holds enemies in place; behind, leaves a snare for the next enemy to cross; on a monster, monsters root you.
// Its look is the art chat's (src/render/binding3.ts; his yes to it there by 22:00, “Yes, send to main (Recommended)”), called up
// by the rules' events; its numbers the main chat's starting points (src/game/defs.ts BIND). These tests hold:
//   1. the word: a shaping word of Strength, in every list of words, found only from floor 11 down;
//   2. in front: what it hits is held where it stands (it strikes still); an elite half as long, a boss not at all; not again
//      until a while after;
//   3. behind: a snare where it ends; the one struck, standing on it, let be; the next to come onto it held, and the snare spent;
//      a bat flies over it;
//   4. on a monster: its blow roots the hero, who walks nowhere, and not again for a while;
//   5. on gear: more damage or Strength on what strikes, armour or Strength on what keeps;
//   6. its looks hear the rules: the hold, the snare drawn and sprung, the hero rooted.
//   run: tsx --test tests/binding.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { BIND, DEEP_WORDS, WORDS, wordsAt } from '../src/game/defs';
import { Game } from '../src/game/game';
import { imbueItem, rollItem } from '../src/game/items';
import { RNG as Dice } from '../src/engine/rng';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster, Zone } from '../src/game/state';
import { WORD_IDS } from '../src/game/types';
import type { ClassId, MonsterKind, WordId } from '../src/game/types';
import { Fx } from '../src/render/fx';
import { B3, BINDING3, clearB3, eventsB3, ownsZoneB3 } from '../src/render/binding3';
import { land } from './helpers';

const DT = 1 / 30;

interface Inside {
  rng: RNG;
  waveT: number;
  zones: Zone[];
  spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster;
  wakeUp(m: Monster): void;
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

/** A monster (dx, dy) from the hero, awake, holding its blows, with life enough; `walks` coming on at the hero. */
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

function swing(g: Game, seen: GameEvent[], m: Monster): void {
  const h = g.hero;
  h.swingT = 0;
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
const gap = (p: { x: number; y: number }, q: { x: number; y: number }): number => Math.hypot(p.x - q.x, p.y - q.y);

test('1. the word: a shaping word of Strength, in every list, found only from floor 11 down', () => {
  assert.ok(WORD_IDS.includes('binding') && DEEP_WORDS.includes('binding'));
  const w = WORDS.binding;
  assert.equal(w.kind, 'shape');
  assert.equal(w.attr, 'str');
  assert.equal(w.name, 'Binding');
  assert.equal(w.behind, 'of the Snare');
  assert.ok(!wordsAt(10).includes('binding'), 'not on floor 10');
  assert.ok(wordsAt(11).includes('binding') && wordsAt(15).includes('binding'), 'from floor 11');
  const { g } = room('warrior', [[0, 'front', 'binding'], [0, 'behind', 'binding']]);
  const r = g.hero.skills[0].r;
  assert.ok(r.bind >= BIND.secs && r.bind <= BIND.most, `held ${r.bind} s`);
  assert.ok(r.snare >= BIND.snareSecs && r.snare <= BIND.snareMost, `snared ${r.snare} s`);
  assert.ok(r.lines.some((l) => l.startsWith('Binding:')) && r.lines.some((l) => l.startsWith('of the Snare:')), 'its lines on the card');
});

test('2. in front: what it hits is held where it stands; an elite half as long, a boss not at all; not again for a while', () => {
  const { g, a, seen } = room('warrior', [[0, 'front', 'binding']]);
  const r = g.hero.skills[0].r;
  const m = put(g, a, 'skeleton', 1.25, 0, true);
  const free = put(g, a, 'skeleton', -7, 0, true);
  swing(g, seen, m);
  const binds = of(seen, 'bind');
  assert.equal(binds.length, 1, 'one held');
  assert.equal(binds[0].id, m.id);
  assert.ok(Math.abs(binds[0].secs - r.bind) < 1e-9);
  // (backed off so it would have to walk to reach him: held, it does not)
  g.hero.x -= 3;
  const at = { x: m.x, y: m.y };
  const freeAt = { x: free.x, y: free.y };
  run(g, seen, Math.min(1, r.bind - 0.2));
  assert.ok(gap(m, at) < 1e-9, `held where it stood (${gap(m, at).toFixed(3)})`);
  assert.ok(gap(free, freeAt) > 0.5, 'the other walks');
  run(g, seen, r.bind + 0.3);
  assert.ok(gap(m, at) > 0.2, 'let go, it walks again');
  // not again at once
  const n = of(seen, 'bind').length;
  g.hero.x = m.x - 1.25;
  g.hero.y = m.y;
  swing(g, seen, m);
  assert.equal(of(seen, 'bind').length, n, 'not held again so soon');
  // an elite half as long; a boss not at all
  const e = put(g, a, 'skeleton', 0, 3, false, 1);
  const b = put(g, a, 'brute', 0, -3, false, 0, true);
  g.hero.x = e.x - 1.25;
  g.hero.y = e.y;
  swing(g, seen, e);
  const eb = of(seen, 'bind').find((x) => x.id === e.id);
  assert.ok(eb && Math.abs(eb.secs - r.bind * BIND.elite) < 1e-9, 'an elite half as long');
  g.hero.x = b.x - 1.25;
  g.hero.y = b.y;
  swing(g, seen, b);
  assert.ok(!of(seen, 'bind').some((x) => x.id === b.id) && !(b.bindT ?? 0), 'a boss not at all');
});

test('3. behind: a snare where it ends; the one struck let be; the next onto it held, the snare spent; a bat flies over it', () => {
  const { g, a, seen } = room('warrior', [[0, 'behind', 'binding']]);
  const r = g.hero.skills[0].r;
  const m = put(g, a, 'skeleton', 1.25, 0);
  swing(g, seen, m);
  const snares = a.zones.filter((z) => z.kind === 'snare');
  assert.equal(snares.length, 1, 'a snare laid');
  const s = snares[0];
  assert.ok(gap(s, m) < 0.5, 'where the blow landed');
  assert.ok(s.words.includes('binding'), 'carrying its word, for its look');
  run(g, seen, 0.5);
  assert.ok(!(m.bindT ?? 0), 'the one struck, standing on it, let be');
  assert.ok(a.zones.includes(s), 'still lying');
  // a bat comes over it: nothing
  const bat = put(g, a, 'bat', 1.25 + 0.3, 0.2);
  run(g, seen, 0.2);
  assert.ok(!(bat.bindT ?? 0) && a.zones.includes(s), 'a bat flies over it');
  bat.dead = true;
  // the next to come onto it is held, and the snare spent
  const next = put(g, a, 'skeleton', 1.25, 2.5);
  next.y = s.y + 0.3;
  next.x = s.x;
  run(g, seen, 0.1);
  const sprung = of(seen, 'snareSprung');
  assert.equal(sprung.length, 1, 'it springs');
  assert.equal(sprung[0].id, next.id);
  assert.ok(Math.abs(sprung[0].secs - r.snare) < 1e-9 && (next.bindT ?? 0) > 0, 'held');
  assert.ok(!a.zones.includes(s), 'and spent');
  // one that stepped off and comes back on is the next
  const { g: g2, a: a2, seen: seen2 } = room('warrior', [[0, 'behind', 'binding']]);
  const m2 = put(g2, a2, 'skeleton', 1.25, 0);
  swing(g2, seen2, m2);
  const s2 = a2.zones.find((z) => z.kind === 'snare') as Zone;
  m2.x += 2.5;
  run(g2, seen2, 0.1);
  m2.x = s2.x;
  m2.y = s2.y;
  run(g2, seen2, 0.1);
  assert.ok(of(seen2, 'snareSprung').some((e) => e.id === m2.id), 'off it and on again, it is caught');
});

test('4. on a monster: its blow roots the hero; he walks nowhere; and not again for a while', () => {
  const { g, a, seen } = room('warrior', []);
  const h = g.hero;
  const m = put(g, a, 'skeleton', 2.5, 0);
  h.invuln = 0;
  g.hurtHero(1, 'phys', ['binding'], m);
  assert.ok(Math.abs((h.rootT ?? 0) - BIND.rootSecs) < 1e-9, 'rooted');
  const rooted = of(g.events, 'rooted');
  assert.equal(rooted.length, 1);
  assert.ok(gap(rooted[0], m) < 1e-9, 'cast from where it stands');
  g.events.length = 0;
  const c = emptyControls();
  c.mx = -1;
  const at = { x: h.x, y: h.y };
  run(g, seen, BIND.rootSecs - 0.1, c);
  assert.ok(gap(h, at) < 1e-6, `he walks nowhere (${gap(h, at).toFixed(3)})`);
  run(g, seen, 0.5, c);
  assert.ok(gap(h, at) > 0.5, 'then he walks');
  h.invuln = 0;
  g.hurtHero(1, 'phys', ['binding'], m);
  assert.ok(!(h.rootT ?? 0), 'not again so soon');
});

test('5. on gear: more damage or Strength on what strikes; armour or Strength on what keeps', () => {
  const dice = new Dice(7);
  const seen = new Set<string>();
  for (let k = 0; k < 60; k++) {
    const it = rollItem(10, dice, { slot: k % 2 ? 'ring' : 'helm' });
    const got = imbueItem(it, 'binding', dice);
    if (!got) continue;
    for (const mod of got.mods) seen.add(`${k % 2 ? 'ring' : 'helm'}:${mod.stat}`);
  }
  for (const o of ['ring:dmgPct', 'ring:str', 'helm:armor', 'helm:str']) assert.ok(seen.has(o), `${o} (${[...seen].join(' ')})`);
});

test('6. its looks hear the rules: the hold, the snare drawn and sprung, the hero rooted', () => {
  const was = BINDING3.on;
  BINDING3.on = true;
  try {
    clearB3();
    const fx = new Fx();
    const { g, a, seen } = room('warrior', [[0, 'front', 'binding'], [0, 'behind', 'binding']]);
    const m = put(g, a, 'skeleton', 1.25, 0);
    swing(g, seen, m);
    eventsB3(seen, g, fx);
    assert.ok(B3.holds.some((x) => x.id === m.id), 'the bands round what it holds');
    const s = a.zones.find((z) => z.kind === 'snare') as Zone;
    assert.ok(s && ownsZoneB3(s), 'the snare is its to draw');
    g.hero.invuln = 0;
    g.hurtHero(1, 'phys', ['binding'], m);
    eventsB3(g.events, g, fx);
    assert.ok(B3.holds.some((x) => x.id === -1), 'the hero bound by the monster');
  } finally {
    BINDING3.on = was;
    clearB3();
  }
});
