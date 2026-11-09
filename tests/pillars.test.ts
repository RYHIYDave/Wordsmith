// THE PILLARS (game/quests610.ts PILLARS, OFF): his words, 7 Nov 2026, 00:18 (Eastern), “maybe you use them on three pillars during
// the swamp fight to deactive the seige magic”. As the Drowned Eye's last phase begins the cult's three obelisks round his ring
// burn, and while one burns he cannot be hurt; a piece of the ward-stone set into one (the use button) puts it out; with none in
// hand, blows at its foot break it; all three out, the siege is broken: his call of it no more, and he can be hurt.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { EYE_ACTS, RULES, SWELL } from '../src/game/act1_rules/eye';
import { Game } from '../src/game/game';
import { PILLARS, QUEST610_TEXT, QUESTS610, piecesInHand, siegeBroken } from '../src/game/quests610';
import { emptyControls } from '../src/game/state';
import type { GameEvent, Monster } from '../src/game/state';
import { paintWithoutCanvas, seasoned } from './helpers';
import { COLOSSUS } from '../src/game/colossus_fight';

// (the old Drowned Eye's pillars, held as they were: the Swamp Colossus, floor 10's since 25.3.0, switched off for this file; his own
// pillars in his last phase, tests/colossus_fight.test.ts)
COLOSSUS.on = false;

paintWithoutCanvas();

const DT = 1 / 30;
type Inner = {
  wakeUp(m: Monster): void;
  damageMonster(m: Monster, n: number, el: string, c: boolean, k: number): void;
  breakProps(x: number, y: number, r: number, skill?: number): void;
  time: number;
};
const inner = (g: Game): Inner => g as unknown as Inner;

function with_<T>(pillars: boolean, run: () => T): T {
  const was = [QUESTS610.on, PILLARS.on, SWELL.on];
  QUESTS610.on = true;
  PILLARS.on = pillars;
  SWELL.on = false;
  try {
    return run();
  } finally {
    [QUESTS610.on, PILLARS.on, SWELL.on] = was;
  }
}

/** Floor 10, the Drowned Eye alone on it and awake, carried into his last phase (the siege pulled in), the hero with these pieces. */
function lastPhase(pieces: number): { g: Game; m: Monster } {
  const g = seasoned(new Game('warrior', 4), 1);
  g.hero.feather = 'given';
  g.hero.pieces = pieces;
  g.depth = 10;
  g.cleared = 10;
  g.enterDungeon();
  const m = g.boss!;
  assert.equal(m.kind, 'eye');
  g.monsters.splice(0, g.monsters.length, m);
  g.bossReady();
  inner(g).wakeUp(m);
  m.words = [];
  m.shield = 0;
  m.life = m.maxLife = 1e6;
  m.cd = 99;
  (m.a1 as unknown as { ph: number }).ph = 2;
  m.phase = 2;
  g.update(DT, emptyControls());
  return { g, m };
}

const use = (g: Game): void => g.update(DT, { ...emptyControls(), interact: true });
const besideIt = (g: Game, k: number): void => {
  const p = g.level.pillars![k];
  g.hero.x = p.x;
  g.hero.y = p.y + 1.1;
};

test('off: no pillars burn in his last phase, and he can be hurt', () => {
  with_(false, () => {
    const { g, m } = lastPhase(7);
    assert.equal(g.level.pillars, undefined);
    const was = m.life;
    inner(g).damageMonster(m, 500, 'phys', false, -1);
    assert.ok(m.life < was);
  });
});

test('his last phase begun, the three obelisks burn where they stand; while one burns he cannot be hurt, and it says so', () => {
  with_(true, () => {
    const { g, m } = lastPhase(7);
    const ps = g.level.pillars!;
    assert.equal(ps.length, 3);
    assert.ok(ps.every((p) => p.lit));
    const obelisks = g.level.props.filter((p) => p.kind === 'piece' && p.name === "the cult's obelisk");
    assert.equal(obelisks.length, 3);
    for (const p of ps) assert.ok(obelisks.some((o) => o.x === p.x && o.y === p.y), 'at an obelisk');
    g.events.length = 0;
    const was = m.life;
    inner(g).damageMonster(m, 500, 'phys', false, -1);
    assert.equal(m.life, was, 'shielded');
    assert.ok(g.events.some((e: GameEvent) => e.t === 'text' && e.text === QUEST610_TEXT.shielded));
  });
});

test('beside a burning one with a piece in hand, the use button sets it there and it goes out; all three out, the siege is broken', () => {
  with_(true, () => {
    const { g, m } = lastPhase(7);
    const call = EYE_ACTS.find((a) => a.id === 'eye:call')!;
    assert.ok(RULES.can!({ g } as never, m, call, 5, true), 'he calls the siege down while it burns');
    for (let k = 0; k < 3; k++) {
      besideIt(g, k);
      assert.equal(g.interactHint(), QUEST610_TEXT.pillarPrompt, `the prompt at obelisk ${k + 1}`);
      use(g);
      assert.equal(g.level.pillars![k].lit, false, `obelisk ${k + 1} out`);
      assert.equal(g.level.pillars![k].by, 'piece');
      assert.equal(piecesInHand(g.hero.pieces, g.level.pillars), 2 - k);
      if (k < 2) assert.ok(!siegeBroken(g.level.pillars));
    }
    assert.ok(siegeBroken(g.level.pillars));
    assert.ok(!RULES.can!({ g } as never, m, call, 5, true), 'his call no more');
    const was = m.life;
    inner(g).damageMonster(m, 500, 'phys', false, -1);
    assert.ok(m.life < was, 'he can be hurt');
  });
});

test('with no piece in hand there is no prompt, and blows at its foot break it, one counted each gap', () => {
  with_(true, () => {
    const { g } = lastPhase(0);
    besideIt(g, 0);
    assert.notEqual(g.interactHint(), QUEST610_TEXT.pillarPrompt);
    const p = g.level.pillars![0];
    // (blows all at once count as one)
    for (let k = 0; k < 5; k++) inner(g).breakProps(p.x, p.y, 0.6);
    assert.equal(p.hits, 1);
    for (let k = 1; k < PILLARS.blows - 1; k++) {
      inner(g).time += PILLARS.gap + 0.01;
      inner(g).breakProps(p.x, p.y + 0.5, 0.6);
    }
    assert.equal(p.hits, PILLARS.blows - 1);
    assert.ok(p.lit);
    inner(g).time += PILLARS.gap + 0.01;
    inner(g).breakProps(p.x, p.y, 0.6);
    assert.equal(p.lit, false);
    assert.equal(p.by, 'blows');
    // (a blow far from it counts nothing)
    const q = g.level.pillars![1];
    inner(g).time += PILLARS.gap + 0.01;
    inner(g).breakProps(q.x + 4, q.y + 4, 0.6);
    assert.equal(q.hits, 0);
  });
});

test('one piece in hand: one set, then no prompt at the next', () => {
  with_(true, () => {
    const { g } = lastPhase(4);
    besideIt(g, 1);
    use(g);
    assert.equal(g.level.pillars![1].lit, false);
    besideIt(g, 2);
    assert.notEqual(g.interactHint(), QUEST610_TEXT.pillarPrompt);
    use(g);
    assert.ok(g.level.pillars![2].lit, 'not set with nothing in hand');
  });
});
