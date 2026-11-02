// THE HOLLOW STAG'S FIGHT DONE THE ACTION WAY, IN THE GAME (the art chat's art/stag_action.ts behind STAG_ACTION, his yes there; brought in
// by the main chat, 2 Nov 2026, behind the same switch, off until his yes here). On floor 9 as the game makes it, in his clearing, with
// the switch on:
//   1. off, his old moves; on, the new, and his old roots gone;
//   2. at 3/4 of his life the wood closes in: the wall bursts up round 80% of the clearing, the hero caught outside it struck and
//      thrown in; from then he cannot walk out of it;
//   3. his gore sweeps a wide arc before him: a hero off to one side of it struck; one behind him, not;
//   4. his bounds go all round the clearing, landing only inside it, and now and then he stands to stare;
//   5. down to a quarter, the clearing at 40%: his charge at a hero across it is cut where his antlers meet the wall, which splinters;
//      he stays inside;
//   6. he dies: the wall sinks, the fence is gone.
//   run: tsx --test tests/stag_action_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { CLOSE, CLOSE_HIT, GORE9, GORE9_HIT, STAG_ACTION } from '../src/art/stag_action';
import { outOf } from '../src/art/stag_action_fx';
import { act1Rules } from '../src/game/act1_rules/index';
import { LAND9, RULES, STAG9_ACTS, WALL_PERIL, insideClearing } from '../src/game/act1_rules/stag';
import type { Game } from '../src/game/game';
import { TUNE } from '../src/game/defs';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { floorOf } from './act1_ledge_canyon_harness';

function on(fn: () => void): void {
  const was = STAG_ACTION.on;
  STAG_ACTION.on = true;
  try {
    fn();
  } finally {
    STAG_ACTION.on = was;
  }
}
interface Fight {
  g: Game;
  m: Monster;
  cx: number;
  cy: number;
}
/** Floor 9, the Stag alone in his clearing, awake, the hero `dx`, `dy` from its middle; not to be killed. */
function fight(dx: number, dy: number): Fight {
  const g = floorOf(5, 9);
  const hooks = g as unknown as { waveT: number; wakeUp(m: Monster): void };
  hooks.waveT = 1e9;
  const m = g.monsters.find((o) => o.kind === 'stag')!;
  for (const o of g.monsters) if (o !== m) o.dead = true;
  g.monsters = [m];
  const area = g.level.land!.areas.find((a) => a.role === 'boss')!;
  const cx = area.blob.x;
  const cy = area.blob.y;
  g.hero.x = cx + dx;
  g.hero.y = cy + dy;
  m.x = cx - dx * 0.3;
  m.y = cy - dy * 0.3;
  hooks.wakeUp(m);
  // (his wait over, as if the hero had come into his ground and heard him out)
  g.bossReady();
  m.words = [];
  m.shield = 0;
  m.life = m.maxLife = 1e9;
  m.cd = 0;
  g.events.length = 0;
  return { g, m, cx, cy };
}
/** Only `id` of his ready (all the others cooling). */
function only(m: Monster, id: string): void {
  m.moveCd = STAG9_ACTS.map((a) => (a.id === id ? 0 : 1e9));
}
/** The game stepped on `secs`: the hero's life put back; when he was hurt. */
function watch(g: Game, secs: number, move?: () => { mx: number; my: number } | null, each?: (t: number) => void): number[] {
  const c = emptyControls();
  const h = g.hero;
  const hurts: number[] = [];
  for (let k = 1; k <= Math.round(secs * 60); k++) {
    const mv = move ? move() : null;
    c.mx = mv ? mv.mx : 0;
    c.my = mv ? mv.my : 0;
    const before = h.life;
    g.update(1 / 60, c);
    if (h.life < before) hurts.push(k / 60);
    h.life = h.d.maxLife;
    h.invuln = 0;
    g.events.length = 0;
    if (each) each(k / 60);
  }
  return hurts;
}
/** An open spot `k`·`at` of the way out from the clearing's middle, round it at `a`. */
function spotAt(f: Fight, a: number, out: number): { x: number; y: number } {
  for (let s = out; s > 0.2; s -= 0.02) {
    const x = f.cx + Math.cos(a) * 8.5 * s;
    const y = f.cy + Math.sin(a) * 10 * s;
    if (f.g.free(f.g.level.walk, x, y, 0.4)) return { x, y };
  }
  return { x: f.cx, y: f.cy };
}

test('1. off, his old moves; on, the new', () => {
  assert.equal(STAG_ACTION.on, false, 'off until his yes');
  assert.ok(act1Rules('stag')!.acts.some((a) => a.id === 'stag:roots'));
  on(() => {
    const ids = act1Rules('stag')!.acts.map((a) => a.id);
    assert.deepEqual(ids, ['stag:gore', 'stag:stare', 'stag:charge', 'stag:bellow', 'stag:close']);
    assert.equal(RULES!.gait.pace, 5.5, 'his great stot');
  });
});

test('2. at 3/4 the wood closes in: the wall up round 80%, the hero outside struck and thrown in; he cannot walk out', () => {
  on(() => {
    const f = fight(0, 0);
    const { g, m } = f;
    // (the hero out near the arena's edge, outside where the wall will stand)
    let s = { x: 0, y: 0 };
    for (let a = 0; a < Math.PI * 2; a += 0.3) {
      s = spotAt(f, a, 0.9);
      if (outOf(s.x - f.cx, s.y - f.cy, CLOSE.stages[1]) > 1.02) break;
    }
    g.hero.x = s.x;
    g.hero.y = s.y;
    assert.ok(outOf(s.x - f.cx, s.y - f.cy, CLOSE.stages[1]) > 1, 'the hero outside where it will stand');
    m.life = m.maxLife * 0.74;
    only(m, 'none');
    const hurts = watch(g, CLOSE_HIT + 0.3);
    const wall = g.perils.find((p) => p.a1 === WALL_PERIL);
    assert.ok(wall, 'the wall up');
    assert.equal(wall!.c, CLOSE.stages[1], 'round 80% of the clearing');
    assert.ok(g.level.fence, 'a fence');
    assert.ok(hurts.length >= 1, 'struck');
    assert.ok(insideClearing(g.hero.x, g.hero.y, f.cx, f.cy, CLOSE.stages[1], TUNE.heroRadius - 0.01), 'thrown in');
    // (he walks straight out: he stays in)
    const ox = g.hero.x - f.cx;
    const oy = g.hero.y - f.cy;
    const n = Math.hypot(ox, oy) || 1;
    m.cd = 1e9;
    watch(g, 2.5, () => ({ mx: ox / n, my: oy / n }));
    assert.ok(outOf(g.hero.x - f.cx, g.hero.y - f.cy, CLOSE.stages[1]) < 1, 'he cannot walk out of it');
  });
});

test('3. his gore sweeps a wide arc before him: off to one side, struck; behind him, not', () => {
  on(() => {
    for (const [side, want] of [[1, 1], [-1, 1], [0, 0]] as const) {
      const f = fight(1.6, 0);
      const { g, m } = f;
      only(m, 'stag:gore');
      // (he begins, aimed at the hero; as it is held the hero steps round to 60 degrees off it, or behind him)
      watch(g, 0.4);
      assert.equal(m.act?.id, 'stag:gore', 'he gores');
      const a = Math.atan2(m.fy, m.fx) + (side === 0 ? Math.PI : side * (60 * Math.PI) / 180);
      const d = side === 0 ? 1.5 : 2.2;
      g.hero.x = m.x + Math.cos(a) * d;
      g.hero.y = m.y + Math.sin(a) * d;
      const hurts = watch(g, GORE9_HIT - 0.4 + 0.2);
      assert.equal(hurts.length > 0 ? 1 : 0, want, side === 0 ? 'behind him, not' : '60 degrees off, struck');
    }
    assert.ok(GORE9.arc >= 150, 'a wide arc');
  });
});

test('4. his bounds go all round the clearing, landing only inside it; now and then he stands to stare', () => {
  on(() => {
    const f = fight(3, 3);
    const { g, m } = f;
    m.moveCd = STAG9_ACTS.map(() => 1e9);
    const lands: { x: number; y: number }[] = [];
    let stares = 0;
    let was = '';
    watch(g, 16, null, () => {
      m.cd = 5;
      // (the hero keeps out of his way, at the middle)
      g.hero.x = f.cx;
      g.hero.y = f.cy;
      const st = m.state === 'act' && m.act ? m.act.id : m.gait?.mode ?? '';
      if (st === 'stag:stare' && was !== st) stares++;
      if (m.gait && m.gait.mode === 'walk') {
        const p = m.gait.t % 1.2;
        if (LAND9.some((L) => p >= L && p < L + 1 / 60 + 1e-9)) lands.push({ x: m.x, y: m.y });
      }
      was = st;
    });
    assert.ok(lands.length >= 10, `he bounds (${lands.length})`);
    for (const q of lands) assert.ok(outOf(q.x - f.cx, q.y - f.cy, 1) < 1.05, 'inside the clearing');
    const quarters = new Set(lands.map((q) => `${q.x > f.cx ? 1 : 0}${q.y > f.cy ? 1 : 0}`));
    assert.ok(quarters.size >= 3, `all round it (${quarters.size} of its quarters)`);
    assert.ok(stares >= 1, `he stands to stare (${stares})`);
  });
});

test('5. at 1/4 the clearing is 40%: his charge across it is cut where his antlers meet the wall, which splinters', () => {
  on(() => {
    const f = fight(0, 0);
    const { g, m } = f;
    m.life = m.maxLife * 0.2;
    only(m, 'none');
    watch(g, CLOSE.long * 3 + 1);
    const wall = g.perils.find((p) => p.a1 === WALL_PERIL)!;
    assert.equal(wall.c, CLOSE.stages[3], 'the clearing at 40%');
    // (he at one side, the hero by the other: a charge across)
    const k = CLOSE.stages[3];
    m.x = f.cx - 8.5 * k * 0.55;
    m.y = f.cy;
    g.hero.x = f.cx + 8.5 * k * 0.5;
    g.hero.y = f.cy;
    m.state = 'chase';
    m.act = undefined;
    m.gait = { mode: 'stand', t: 0 };
    m.cd = 0;
    only(m, 'stag:charge');
    let charged = false;
    watch(g, 3, null, () => {
      if (m.act?.id === 'stag:charge') charged = true;
      if (charged) {
        // (the hero out of his way once he has set off)
        g.hero.y = f.cy + 2.5;
      }
    });
    assert.ok(charged, 'he charges');
    assert.ok(wall.fy >= 0, 'the wall splintered where his antlers met it');
    assert.ok(insideClearing(m.x, m.y, f.cx, f.cy, k, 0.4), 'he stays inside');
  });
});

test('6. he dies: the wall sinks, the fence is gone', () => {
  on(() => {
    const f = fight(0, 0);
    const { g, m } = f;
    m.life = m.maxLife * 0.74;
    only(m, 'none');
    watch(g, CLOSE_HIT + 0.3);
    const wall = g.perils.find((p) => p.a1 === WALL_PERIL)!;
    assert.ok(g.level.fence);
    RULES!.died!(g.bosses, m);
    assert.equal(g.level.fence, null, 'the fence gone');
    m.dead = true;
    watch(g, 2);
    assert.ok(!g.perils.includes(wall), 'the wall sunk away');
  });
});
