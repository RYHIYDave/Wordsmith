// AN ERRAND NEVER TAKES HIM DOWN THE STAIRS (game/ways.ts errandWalk; main.ts, the errand). Met in Version 24.1's regression
// (tools/scenarios/towntap.mjs): with the ways between the floors, the town's stairs open toward the stash beside them, and a
// touch on the stash from beyond the stairs walked him over their top step and down to floor 1.
//
// What is held here: in town, an errand to each of the town's services, walked as main.ts walks it (the path field over
// errandWalk's floor, from every open tile within a few of the stairs), reaches it and never stands on the stairs' top step;
// an errand to the stairs themselves still walks onto it; with no stairs open, the floor is the level's own.
//   run: tsx --test tests/errand_stairs.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { Game } from '../src/game/game';
import { flowDir, flowField } from '../src/game/nav';
import { emptyControls } from '../src/game/state';
import { TUNE } from '../src/game/defs';
import { EXITS, errandWalk, onTopStep, topStep } from '../src/game/ways';

const DT = 1 / 30;

/** Walk him to (x, y) as main.ts's errand does, by the path field alone; whether he got there, and whether he stood on the top step. */
function errand(g: Game, x: number, y: number, near: number): { there: boolean; onStep: boolean; town: boolean } {
  const L = g.level;
  const f = L.floor;
  const walk = errandWalk(L, x, y);
  const flow = flowField(walk, f.w, f.h, x, y, Infinity, undefined, L.step);
  const st = L.ways!.stair!;
  let onStep = false;
  for (let k = 0; k < 12 / DT; k++) {
    const h = g.hero;
    if (!g.level.town) return { there: false, onStep, town: false };
    if (onTopStep(st, h.x, h.y)) onStep = true;
    const d = Math.hypot(x - h.x, y - h.y);
    if (d < near) return { there: true, onStep, town: true };
    const v = flowDir(flow, walk, f.w, f.h, h.x, h.y, undefined, L.step);
    const c = emptyControls();
    if (v.x === 0 && v.y === 0) {
      c.mx = (x - h.x) / d;
      c.my = (y - h.y) / d;
    } else {
      c.mx = v.x;
      c.my = v.y;
    }
    g.events.length = 0;
    g.update(DT, c);
  }
  return { there: false, onStep, town: !!g.level.town };
}

test('in town, an errand to any service from round the stairs never takes him over their top step', () => {
  assert.equal(EXITS.on, true);
  const g0 = new Game('warrior', 31);
  const L0 = g0.level;
  const st = L0.ways!.stair!;
  // (every open tile within four of the stairs' top step)
  const top = topStep(st);
  const from: [number, number][] = [];
  for (let y = Math.floor(top.y) - 4; y <= Math.floor(top.y) + 4; y++) {
    for (let x = Math.floor(top.x) - 4; x <= Math.floor(top.x) + 5; x++) {
      if (x < 0 || y < 0 || x >= L0.floor.w || y >= L0.floor.h) continue;
      if (L0.walk[y * L0.floor.w + x] !== 1 || onTopStep(st, x + 0.5, y + 0.5)) continue;
      if (!g0.free(L0.walk, x + 0.5, y + 0.5, TUNE.heroRadius)) continue;
      from.push([x + 0.5, y + 0.5]);
    }
  }
  assert.ok(from.length > 20, `${from.length} places round the stairs`);
  let walked = 0;
  for (const kind of ['stash', 'wordsmith', 'lexicon', 'armourer', 'mystic']) {
    for (const [x, y] of from) {
      const g = new Game('warrior', 31);
      g.hero.invuln = 1e9;
      const s = g.level.stations.find((q) => q.kind === kind);
      assert.ok(s, kind);
      g.hero.x = x;
      g.hero.y = y;
      const r = errand(g, s!.x, s!.y, TUNE.useRange - 0.25);
      assert.ok(r.town, `${kind} from (${x}, ${y}): still in town`);
      assert.ok(!r.onStep, `${kind} from (${x}, ${y}): never on the stairs' top step`);
      assert.ok(r.there, `${kind} from (${x}, ${y}): there`);
      walked++;
    }
  }
  assert.ok(walked > 100);
});

test('an errand to the stairs themselves still takes him down; with no stairs open, the floor is the level\'s own', () => {
  const g = new Game('warrior', 31);
  const st = g.level.ways!.stair!;
  const top = topStep(st);
  assert.notEqual(errandWalk(g.level, top.x, top.y), undefined);
  assert.equal(errandWalk(g.level, top.x, top.y), g.level.walk, 'to the stairs: the level\'s own floor');
  g.hero.x = top.x - 3;
  g.hero.y = top.y - 2;
  const r = errand(g, top.x, top.y, 0.05);
  assert.ok(!r.town || r.onStep, 'he goes onto the top step');
  for (let k = 0; k < 3 / DT && g.level.town; k++) {
    g.events.length = 0;
    g.update(DT, emptyControls());
  }
  assert.equal(g.level.town, false, 'and down');
  assert.equal(g.depth, 1);
  // (a floor below, its stairwell shut while the boss lives)
  const L = g.level;
  if (!L.ways?.stair || !L.ways.stair.open) assert.equal(errandWalk(L, 3, 3), L.walk);
});
