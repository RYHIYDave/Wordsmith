// ENDLESS MODE'S FINAL BOSS, STAGES 2 AND 3 (game/final_arena.ts, game/act1_rules/wsboss.ts and wsboss2.ts; behind ENDLESS_KEY,
// off): the arena, his first phase, the boar's death and his second phase on foot.
//   1. down through the open landing at the Shaft's Rim: the arena, round; he stands in the portal's light; the boss across it,
//      the only monster; an endless level to the rest of the game; saved there, he is back at the Rim, the landing still open;
//   2. two minutes of the fight, the hero standing in it: the boar's moves and his words take turns, every one of the ten made, none
//      twice running (his words; the boar's but for the runs of a charge), never two of his words' floors lying at once, the
//      winded stand only ever straight after a charge's last run; he is hurt by them; the boss stays on the floor;
//   3. at half his life the boar dies on its next charge: he cannot be hit while it does, the hero is not hurt, his words' floors are
//      done with; thrown clear, he is on foot, on the floor;
//   4. on foot, half to a quarter: a meld at a time, drawn at random (none twice running, no FLOOR meld straight after another),
//      each meld's slam ring rolling out, spent after each but Frostbite; every meld made in time, and each of them hurts a hero
//      who stands in it; his life held at 1 (his death is the next stage's);
//   5. below a quarter: no spent; the next meld written while the last one's floor still stands.
//   run: tsx --test tests/final_fight.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ENDLESS_TOWN, LANDING } from '../src/art/shaft_rim';
import { lastFloor } from '../src/game/act1';
import { ENDLESS } from '../src/game/endless';
import { ENDLESS_KEY } from '../src/game/endless_key';
import { FINAL_ARRIVE, FINAL_PLACE, isFinal } from '../src/game/final_arena';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { seasoned } from './helpers';

type Inner = { takeWay(t: string): void; updateKey(dt: number): void };
const inner = (g: Game): Inner => g as unknown as Inner;

function keyed<T>(fn: () => T): T {
  const was = [ENDLESS_KEY.on, ENDLESS.on, ENDLESS_TOWN.on] as const;
  ENDLESS_KEY.on = true;
  ENDLESS.on = true;
  ENDLESS_TOWN.on = true;
  try {
    return fn();
  } finally {
    [ENDLESS_KEY.on, ENDLESS.on, ENDLESS_TOWN.on] = was;
  }
}
/** A seasoned hero at the Rim, the landing open for him. */
function atTheLanding(seed: number): Game {
  const g = seasoned(new Game('warrior', seed), 30);
  g.depth = lastFloor();
  g.cleared = lastFloor() - 1;
  g.wayDepth = lastFloor();
  g.enterDungeon();
  inner(g).takeWay('on');
  g.endless = 24;
  g.hero.finalOpen = true;
  g.enterTown();
  return g;
}
const boss = (g: Game): Monster => g.monsters.find((m) => m.kind === 'wsboss') as Monster;

test('down through the landing: the arena, the boss across it, an endless level; saved there, back at the Rim', () => keyed(() => {
  const g = atTheLanding(71);
  assert.ok(g.level.rim);
  // (the landing opens; walked into, he goes down)
  for (let i = 0; i < 200 && !g.level.rim?.key?.open; i++) inner(g).updateKey(0.05);
  g.hero.x = LANDING[0];
  g.hero.y = LANDING[1];
  for (let i = 0; i < 90 && !isFinal(g.level); i++) g.update(1 / 30, emptyControls());
  assert.ok(isFinal(g.level), 'down in the arena');
  assert.ok(g.inEndless && g.inFinal);
  assert.ok(Math.hypot(g.hero.x - FINAL_ARRIVE.x, g.hero.y - FINAL_ARRIVE.y) < 0.5, 'in the portal\'s light');
  assert.equal(g.monsters.length, 1, 'he alone');
  const b = boss(g);
  assert.ok(b && b.boss, 'the warped wordsmith, the boss');
  assert.ok(Math.hypot(b.x - FINAL_PLACE.cx, b.y - FINAL_PLACE.cy) < FINAL_PLACE.floor, 'on the floor');
  assert.ok(g.free(g.level.walk, g.hero.x, g.hero.y, 0.3));
  // (saved down here: back at the Rim, the landing open)
  const back = Game.restore(JSON.parse(JSON.stringify(g.save())), g.meta);
  assert.ok(back.level.rim, 'at the Rim');
  assert.equal(back.hero.finalOpen, true);
}));

test('two minutes of his first phase: the beats take turns, all ten made, none twice running, his floors one at a time', () => keyed(() => {
  const g = atTheLanding(72);
  g.enterArena();
  const h = g.hero;
  const b = boss(g);
  const made: string[] = [];
  let last = '';
  let hurt = 0;
  let floors = 0;
  // (he stands his ground, taking it: each blow that reaches him counted, none of it taken from his life)
  (g as unknown as { hurtHero: () => void }).hurtHero = () => {
    hurt++;
  };
  void h;
  for (let i = 0; i < 30 * 150; i++) {
    g.update(1 / 30, emptyControls());
    const id = b.act?.id ?? '';
    if (id && id !== last) made.push(id.slice(7));
    last = id;
    const lying = new Set(g.perils.filter((p) => (p.a1 === 'wsboss:meteor' || p.a1 === 'wsboss:trap') && p.t < p.dur - 0.5).map((p) => p.a1));
    if (lying.size > 1) floors++;
    assert.ok(Math.hypot(b.x - FINAL_PLACE.cx, b.y - FINAL_PLACE.cy) <= FINAL_PLACE.floor, `on the floor at ${(i / 30).toFixed(1)} s`);
    assert.ok(!g.over, 'he lives');
  }
  const all = ['charge', 'wheel', 'winded', 'gore', 'stomp', 'power', 'flame', 'frost', 'lightning', 'poison'];
  const missing = all.filter((a) => !made.includes(a));
  assert.deepEqual(missing.filter((a) => a !== 'gore'), [], `made: ${made.join(' ')}`);
  for (let i = 1; i < made.length; i++) {
    if (made[i] === 'charge' || made[i] === 'wheel') continue;
    assert.notEqual(made[i], made[i - 1], `twice running at ${i}: ${made.join(' ')}`);
  }
  for (let i = 0; i < made.length; i++) if (made[i] === 'winded') assert.equal(made[i - 1], 'charge', 'winded only after a charge');
  assert.equal(floors, 0, 'never two of his floors at once');
  assert.ok(hurt > 10, `hurt ${hurt} times`);
}));

/** A fight brought to his second phase: the boar's death made, his life where `share` of it is left. */
function onFoot(seed: number, share: number): { g: Game; b: Monster } {
  const g = atTheLanding(seed);
  g.enterArena();
  const b = boss(g);
  (g as unknown as { hurtHero: () => void }).hurtHero = () => {};
  g.damageMonster(b, b.maxLife * 0.6, 'phys', false, 0);
  for (let i = 0; i < 30 * 40 && !b.a1?.foot; i++) g.update(1 / 30, emptyControls());
  assert.ok(b.a1?.foot, 'on foot');
  b.life = Math.ceil(b.maxLife * share);
  return { g, b };
}

test('at half his life the boar dies on its next charge: nothing hurts, he cannot be hit; then on foot', () => keyed(() => {
  const g = atTheLanding(73);
  g.enterArena();
  const b = boss(g);
  let hurt = 0;
  (g as unknown as { hurtHero: () => void }).hurtHero = () => {
    hurt++;
  };
  for (let i = 0; i < 40; i++) g.damageMonster(b, b.maxLife / 10, 'phys', false, 0);
  assert.ok(!b.dead && b.life >= Math.ceil(b.maxLife * 0.5) - 1, `life ${b.life} of ${b.maxLife}`);
  const acts: string[] = [];
  let last = '';
  let fellAt = -1;
  let hurtAtFall = 0;
  let lifeAtFall = 0;
  for (let i = 0; i < 30 * 40 && !b.a1?.foot; i++) {
    g.update(1 / 30, emptyControls());
    const id = b.act?.id ?? '';
    if (id && id !== last) acts.push(id.slice(7));
    if (id === 'wsboss:fall' && last !== id) {
      fellAt = i;
      hurtAtFall = hurt;
      lifeAtFall = b.life;
      assert.equal(acts[acts.length - 2], 'charge', 'killed mid-charge');
      assert.ok(!g.perils.some((p) => (p.a1 === 'wsboss:meteor' || p.a1 === 'wsboss:trap') && p.dur > p.t + 0.5), 'his words\' floors done with');
    }
    if (id === 'wsboss:fall') {
      g.damageMonster(b, b.maxLife / 20, 'phys', false, 0);
      assert.equal(b.life, lifeAtFall, 'he cannot be hit as the boar dies');
    }
    last = id;
  }
  assert.ok(fellAt >= 0, `the boar's death made: ${acts.join(' ')}`);
  assert.ok(b.a1?.foot, 'on foot after it');
  assert.equal(hurt, hurtAtFall, 'nothing hurt the hero meanwhile');
  assert.ok(Math.hypot(b.x - FINAL_PLACE.cx, b.y - FINAL_PLACE.cy) <= FINAL_PLACE.floor, 'landed on the floor');
  assert.ok(g.perils.some((p) => p.a1 === 'wsboss:scorch'), 'a scorch where the boar lay');
}));

test('on foot, half to a quarter: one meld at a time, drawn at random, spent after each, every one made and hurting', () => keyed(() => {
  const { g, b } = onFoot(74, 0.45);
  const hits: Record<string, number> = {};
  (g as unknown as { hurtHero: () => void }).hurtHero = () => {
    for (const p of g.perils) if (p.a1?.startsWith('wsboss:') && p.a1 !== 'wsboss:scorch') hits[p.a1.slice(7)] = (hits[p.a1.slice(7)] ?? 0) + 1;
  };
  const melds: string[] = [];
  const beats: string[] = [];
  let last = '';
  let rings = 0;
  const FLOORS = new Set(['scald', 'blight', 'fumes', 'wildfire']);
  const IDS = ['eruption', 'hailstorm', 'thunder', 'avalanche', 'contagion', 'scald', 'blight', 'fumes', 'wildfire', 'frostbite'];
  // (the hero keeps moving about the floor, as one would; until every meld has been made and has hurt him, or ten minutes)
  for (let i = 0; i < 30 * 600 && IDS.some((x) => !hits[x] || !melds.includes(x)); i++) {
    const a = i / 30 / 7;
    g.hero.x = FINAL_PLACE.cx + Math.cos(a) * 4.5;
    g.hero.y = FINAL_PLACE.cy + Math.sin(a) * 4.5;
    g.hero.poisonT = 0;
    g.update(1 / 30, emptyControls());
    const id = b.act?.id ?? '';
    if (id && id !== last) {
      beats.push(id.slice(7));
      if (id === 'wsboss:meld') melds.push(IDS[b.a1?.meld ?? -1]);
    }
    last = id;
    rings = Math.max(rings, g.perils.filter((p) => p.a1 === 'wsboss:slamring').length);
    if (b.life < b.maxLife * 0.3) b.life = Math.ceil(b.maxLife * 0.45);
    assert.ok(!b.dead, 'he lives on');
    assert.ok(!g.over, 'the hero lives');
    assert.ok(g.perils.filter((p) => IDS.includes((p.a1 ?? '').slice(7))).length <= 1, 'one meld at a time');
  }
  for (let i = 1; i < melds.length; i++) {
    assert.notEqual(melds[i], melds[i - 1], `twice running: ${melds.join(' ')}`);
    assert.ok(!(FLOORS.has(melds[i]) && FLOORS.has(melds[i - 1])), `a floor after a floor: ${melds.join(' ')}`);
  }
  for (let i = 0; i < beats.length; i++) if (beats[i] === 'meld' && melds[beats.slice(0, i + 1).filter((x) => x === 'meld').length - 1] !== 'frostbite') assert.equal(beats[i + 1] ?? 'spent', 'spent', `spent after it: ${beats.join(' ')}`);
  assert.deepEqual(IDS.filter((x) => !melds.includes(x)), [], `made: ${melds.join(' ')}`);
  assert.ok(rings >= 1, 'the slam ring');
  assert.deepEqual(IDS.filter((x) => !hits[x]), [], `each hurts: ${JSON.stringify(hits)}`);
  assert.ok((hits.slamring ?? 0) > 0, 'the ring cannot be dodged');
  g.damageMonster(b, b.maxLife, 'phys', false, 0);
  assert.ok(!b.dead && b.life >= 1, 'held at 1 (his death is the next stage\'s)');
}));

test('below a quarter: no rest, the next meld written while the last one\'s floor still stands', () => keyed(() => {
  const { g, b } = onFoot(75, 0.2);
  const IDS = ['eruption', 'hailstorm', 'thunder', 'avalanche', 'contagion', 'scald', 'blight', 'fumes', 'wildfire', 'frostbite'];
  let spent = 0;
  let overlap = 0;
  let last = '';
  for (let i = 0; i < 30 * 120; i++) {
    g.hero.poisonT = 0;
    g.update(1 / 30, emptyControls());
    assert.ok(!g.over, 'he lives');
    const id = b.act?.id ?? '';
    if (id === 'wsboss:spent') spent++;
    if (id === 'wsboss:meld' && last !== id && g.perils.some((p) => IDS.includes((p.a1 ?? '').slice(7)) && p.t < p.dur - 0.3)) overlap++;
    last = id;
  }
  assert.equal(spent, 0, 'never spent');
  assert.ok(overlap >= 3, `written over the last one's floor ${overlap} times`);
}));
